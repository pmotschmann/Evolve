import { global } from './vars.js';
import { adjustCosts } from './functions.js';
import { actions } from './actions.js';
import { spaceSectors } from './space.js';
import { atomic_mass } from './resources.js';
import { supplyMode, supplyPools, supplyPool, supplyZone, regAmount, regMax, regDiff } from './supply.js';
import { shipFleet, startFreightRoute, stopFreightRoute, dispatchFreighter, canAutoRefuelAt,
         freightCapacity, tradeLegDays, tradeRouteViable, freightArrivals } from './truepath.js';

// Freighter routes planned by the governor.

// --- Tuning ---------------------------------------------------------------------------------------

// Nothing starves and nothing stops moving: food first, then the fuels that keep reactors and ships
// running, then everything else in the order the shortage bites.
const PRIORITY = ['Food','Oil','Helium_3','Elerium','Coal'];

// One game day is five seconds of production — the long loop runs on a 5000ms timer against
// per-second rates. Every reckoning below is in days, so this is how a rate becomes one.
const SECONDS_PER_DAY = 5;

// How far ahead a shortage is worth acting on. Beyond this a world has time to solve it by building
// something, and a freighter is better spent elsewhere.
const HORIZON = 400;

// A world is only worth robbing if it is both making a surplus and sitting on a decent pile of it.
// Expressed in days of the shortage's own burn, so a small colony's spare food still counts.
const SURPLUS_DAYS = 30;

// At most this many shortages in one route. A freighter that tries to solve everything spends its
// life in transit and arrives everywhere late.
export const MAX_STOPS = 3;

// A balance route is only worth setting up for a stockpile this close to overflowing.
const FULL_FRACTION = 0.92;

// --- Opting in ------------------------------------------------------------------------------------

// The fleet a ship belongs to, or the ship alone.
export function routeFleet(ship){
    const fleet = shipFleet(ship);
    return fleet && fleet.length ? fleet : [ship];
}

export function autoRouteOn(ship){
    return !!(ship && ship.autoRoute);
}

// Opting in and out is a whole-fleet decision: the ships fly together, so they are managed together.
export function toggleAutoRoute(ship){
    const group = routeFleet(ship);
    const on = !autoRouteOn(ship);
    group.forEach(function(member){
        if (on){ member.autoRoute = true; }
        else { delete member.autoRoute; }
    });
    // Opting out hands the fleet back to the player exactly as it is. A route the governor set up is
    // left running rather than cancelled — stopping it is the player's call now, not ours.
    return on;
}

// --- Reading the situation --------------------------------------------------------------------------

// Everything that can be shipped. Resources with no mass are not split between worlds at all.
function shippable(){
    return Object.keys(atomic_mass).filter(res => global.resource[res] && global.resource[res].display);
}

// A pool's net rate for a resource, in units per day.
function perDay(res, pool){
    return (regDiff(res)[pool] || 0) * SECONDS_PER_DAY;
}

// How long until a pool runs out, in days. Infinity when it is not losing ground.
function daysToEmpty(res, pool){
    const rate = perDay(res, pool);
    if (rate >= 0){ return Infinity; }
    return regAmount(res, pool) / -rate;
}

// What a pool can spare: the stock it holds over and above a month of its own consumption.
function sparable(res, pool){
    const rate = perDay(res, pool);
    if (rate < 0){ return 0; }
    return Math.max(0, regAmount(res, pool) - Math.max(0, -rate) * SURPLUS_DAYS);
}

// Room left in a pool's store. An uncapped resource has room without limit.
function roomIn(res, pool){
    const cap = regMax(res, pool);
    if (cap < 0){ return Infinity; }
    return Math.max(0, cap - regAmount(res, pool));
}

// --- What help is already coming ----------------------------------------------------------------

// Every fleet currently flying a route, as one entry per fleet rather than one per hull.
function activeRoutes(){
    const ships = (global.space.shipyard && global.space.shipyard.ships) || [];
    const seen = new Set(), out = [];
    for (const ship of ships){
        if (seen.has(ship) || !ship.tradeRoute || !Array.isArray(ship.tradeRoute.stops)){ continue; }
        const group = routeFleet(ship).filter(member => member.tradeRoute);
        group.forEach(member => seen.add(member));
        out.push({ group, route: ship.tradeRoute, lead: ship });
    }
    return out;
}

function fleetCapacity(group){
    return group.reduce((total, ship) => total + freightCapacity(ship), 0);
}

// How much of a resource is already on its way to a pool and lands within so many days.
function reliefComing(res, pool, within){
    const arrivals = freightArrivals(res, pool, (r, zone, capacity) => Math.min(capacity, sparable(r, zone)));
    let coming = 0;
    for (const drop of arrivals){
        if (drop.at <= within){ coming += drop.amount; }
    }
    return coming;
}

// --- Finding the work ------------------------------------------------------------------------------

function priorityOf(res){
    const at = PRIORITY.indexOf(res);
    return at < 0 ? PRIORITY.length : at;
}

// Shortages a fleet has already been sent to answer.
function claimed(){
    const taken = new Set();
    for (const { route } of activeRoutes()){
        // A surplus move is not an answer to anything and claims nothing; a delivery is.
        if (route.auto !== 'relief' && route.auto !== 'build'){ continue; }
        const stops = route.stops;
        for (let i = 0; i < stops.length; i++){
            for (const res of stops[i].pickups || []){
                // Everything is unloaded at every stop, so a pickup is a claim on each world after it.
                for (let j = 1; j < stops.length; j++){
                    taken.add(`${stops[(i + j) % stops.length].zone}:${res}`);
                }
            }
        }
    }
    return taken;
}

// Every world spending a resource faster than it makes it, with no relief already on the way.
export function findShortages(horizon = HORIZON){
    const shortages = [];
    const spokenFor = claimed();
    for (const pool of supplyPools()){
        for (const res of shippable()){
            const empty = daysToEmpty(res, pool);
            if (empty > horizon){ continue; }
            const need = Math.min(-perDay(res, pool) * horizon, roomIn(res, pool));
            if (need <= 0){ continue; }
            // A freighter is already on its way to this one.
            if (spokenFor.has(`${pool}:${res}`)){ continue; }
            // Or one on a route of the player's own will get there in time.
            if (reliefComing(res, pool, empty) >= need * 0.5){ continue; }
            shortages.push({ pool, res, empty, need, rank: priorityOf(res) });
        }
    }
    shortages.sort((a,b) => a.rank - b.rank || a.empty - b.empty);
    return shortages;
}

// The action behind a queued item, resolved the way the build queue itself resolves it. Only proper
// structures are of interest: a project, a hull or a mech is not built out of one world's store.
function queuedAction(item){
    if (!item || !item.action || !item.type || typeof item.type !== 'string'){ return false; }
    if (['arpa','tp-ship','hell-mech'].includes(item.action)){ return false; }
    if (spaceSectors.includes(item.action)){
        for (const region in actions[item.action]){
            if (actions[item.action][region][item.type]){ return actions[item.action][region][item.type]; }
        }
        return false;
    }
    return actions[item.action] ? actions[item.action][item.type] : false;
}

// Materials a queued building needs that the world it is going up on has not got.
export function findBuildNeeds(){
    const queue = global.queue && Array.isArray(global.queue.queue) ? global.queue.queue : [];
    const wanted = {};
    for (const item of queue){
        const c_action = queuedAction(item);
        if (!c_action || !c_action.cost){ continue; }
        // The id is `<category>-<structure>`, which is exactly what the zone lookup reads.
        const zone = supplyPool(supplyZone(String(item.id || '').replace('-', ':')));
        let costs;
        try { costs = adjustCosts(c_action); }
        catch (e){ continue; }
        for (const res in costs){
            if (!atomic_mass[res] || !global.resource[res]){ continue; }
            let price = 0;
            try { price = Number(costs[res]()) || 0; }
            catch (e){ continue; }
            if (price <= 0){ continue; }
            if (!wanted[zone]){ wanted[zone] = {}; }
            wanted[zone][res] = Math.max(wanted[zone][res] || 0, price);
        }
    }
    const spokenFor = claimed();
    const needs = [];
    for (const zone in wanted){
        for (const res in wanted[zone]){
            const short = wanted[zone][res] - regAmount(res, zone);
            if (short <= 0){ continue; }
            if (spokenFor.has(`${zone}:${res}`)){ continue; }
            const room = roomIn(res, zone);
            if (room <= 0){ continue; }
            needs.push({ pool: zone, res, need: Math.min(short, room), rank: priorityOf(res) });
        }
    }
    // The biggest gap first: it is the one most likely to be holding the queue up.
    needs.sort((a,b) => b.need - a.need);
    return needs;
}

// A world that can spare the resource, nearest to where it is wanted.
function findSupplier(group, res, want, exclude){
    let best = false;
    for (const pool of supplyPools()){
        if (pool === want || exclude.includes(pool)){ continue; }
        const spare = sparable(res, pool);
        if (spare <= 0){ continue; }
        const days = tradeLegDays(group, pool, want);
        if (!isFinite(days)){ continue; }
        if (!best || days < best.days || (days === best.days && spare > best.spare)){
            best = { pool, spare, days };
        }
    }
    return best;
}

// Stockpiles about to overflow, with somewhere better to put them. Only worth doing when nothing is
// actually short: this is tidying, not rescue.
export function findOverflow(group){
    // A pile already being carried away by another fleet is not a pile that needs moving.
    const beingMoved = new Set();
    for (const { route } of activeRoutes()){
        if (route.auto !== 'balance'){ continue; }
        for (const stop of route.stops){
            for (const res of stop.pickups || []){ beingMoved.add(`${stop.zone}:${res}`); }
        }
    }
    const moves = [];
    for (const from of supplyPools()){
        for (const res of shippable()){
            const cap = regMax(res, from);
            if (cap <= 0){ continue; }                              // uncapped or unknown: never overflows
            if (perDay(res, from) <= 0){ continue; }                // not filling up
            if (regAmount(res, from) < cap * FULL_FRACTION){ continue; }
            if (beingMoved.has(`${from}:${res}`)){ continue; }
            // Somewhere that is not making its own and has room to take it.
            let best = false;
            for (const to of supplyPools()){
                if (to === from || perDay(res, to) > 0){ continue; }
                const room = roomIn(res, to);
                if (room < fleetCapacity(group)){ continue; }
                const days = tradeLegDays(group, from, to);
                if (!isFinite(days)){ continue; }
                if (!best || room > best.room){ best = { to, room, days }; }
            }
            if (best){ moves.push({ res, from, to: best.to, room: best.room }); }
        }
    }
    moves.sort((a,b) => b.room - a.room);
    return moves;
}

// --- Building the route ----------------------------------------------------------------------------

// A route has to come home to somewhere the fleet can top up, or it strands itself on the second
// loop. The nearest such world is added even when there is nothing to load or unload there.
function withRefuelling(group, stops){
    if (stops.some(stop => group.every(ship => canAutoRefuelAt(ship, stop.zone)))){ return stops; }
    const last = stops[stops.length - 1].zone;
    let best = false;
    for (const pool of supplyPools()){
        if (!group.every(ship => canAutoRefuelAt(ship, pool))){ continue; }
        const days = tradeLegDays(group, last, pool);
        if (!isFinite(days)){ continue; }
        if (!best || days < best.days){ best = { pool, days }; }
    }
    // Nowhere refuels this fleet; the route may still be flyable on the tank it has, and
    // validateTradeRoute is the judge of that.
    if (!best){ return stops; }
    return stops.concat([{ zone: best.pool, pickups: [] }]);
}

// Fold consecutive stops at the same world together, and drop a stop that repeats the one before it.
function tidy(stops){
    const out = [];
    for (const stop of stops){
        const prev = out[out.length - 1];
        if (prev && prev.zone === stop.zone){
            prev.pickups = [...new Set(prev.pickups.concat(stop.pickups))];
            continue;
        }
        out.push({ zone: stop.zone, pickups: [...new Set(stop.pickups)] });
    }
    // The route loops, so a final stop at the starting world is the start coming round again.
    while (out.length > 2 && out[out.length - 1].zone === out[0].zone){
        out[0].pickups = [...new Set(out[0].pickups.concat(out.pop().pickups))];
    }
    return out;
}

// Turn a list of shortages into a route the fleet can fly: collect at the suppliers, deliver at the worlds that
// are short, and be able to refuel somewhere along the way.
function planRelief(group, shortages){
    const stops = [];
    let solved = 0;
    for (const short of shortages){
        const supplier = findSupplier(group, short.res, short.pool, []);
        if (!supplier){ continue; }
        // Loading happens at the supplier and unloading happens at every stop, so the pickup is
        // written against the supplier's stop and the world that is short simply follows it.
        stops.push({ zone: supplier.pool, pickups: [short.res] });
        stops.push({ zone: short.pool, pickups: [] });
        if (++solved >= MAX_STOPS){ break; }
    }
    if (!solved){ return false; }
    return { stops: tidy(withRefuelling(group, tidy(stops))), solved };
}

function planBalance(group, move){
    return tidy(withRefuelling(group, tidy([
        { zone: move.from, pickups: [move.res] },
        { zone: move.to, pickups: [] }
    ])));
}

// --- The task ---------------------------------------------------------------------------------------

// Fleets that have opted in, are sitting still, and are the governor's to command.
function managedFleets(){
    const ships = (global.space.shipyard && global.space.shipyard.ships) || [];
    const seen = new Set(), out = [];
    for (const ship of ships){
        if (seen.has(ship) || ship.class !== 'freighter' || !autoRouteOn(ship)){ continue; }
        const group = routeFleet(ship).filter(member => member.class === 'freighter');
        group.forEach(member => seen.add(member));
        if (!group.length || group.some(member => member.inTransit)){ continue; }
        out.push(group);
    }
    return out;
}

// What the governor will interrupt for what.
const RANK = { relief: 3, build: 2, balance: 1 };
function availableFor(group, wanting){
    const route = group[0].tradeRoute;
    if (!route){ return true; }
    if (!route.auto){ return false; }
    return RANK[wanting] > RANK[route.auto];
}

// Put a fleet onto a planned route.
function dispatch(group, home, stops, kind){
    if (!tradeRouteViable(group, stops)){ return false; }
    if (stops[0].zone !== home){
        if (group[0].tradeRoute){ stopFreightRoute(group[0]); }
        return dispatchFreighter(group[0], stops[0].zone);
    }
    if (group[0].tradeRoute){ stopFreightRoute(group[0]); }
    if (!startFreightRoute(group[0], stops)){ return false; }
    group.forEach(ship => { if (ship.tradeRoute){ ship.tradeRoute.auto = kind; } });
    return true;
}

// Try the ambitious route first and fall back: a fleet that cannot manage three errands may well
// manage one, and one shortage answered beats none. Returns how many of the shortages it took on.
function commit(group, home, wants, kind){
    for (let take = Math.min(MAX_STOPS, wants.length); take >= 1; take--){
        const plan = planRelief(group, wants.slice(0, take));
        if (plan && dispatch(group, home, plan.stops, kind)){ return take; }
    }
    return 0;
}

function commitBalance(group, home, moves){
    for (const move of moves){
        const stops = planBalance(group, move);
        if (stops && dispatch(group, home, stops, 'balance')){ return move; }
    }
    return false;
}

// One pass of the governor's freight task.
export function runAutoRoutes(config){
    if (supplyMode() === 'global' || !global.space || !global.space.shipyard){ return; }
    const fleets = managedFleets();
    if (!fleets.length){ return; }
    const horizon = config && config.horizon > 0 ? config.horizon : HORIZON;
    const balance = !config || config.balance;

    // Worked out once for the whole pass rather than per fleet: both walk every route in the system, and the answer
    // does not change between two fleets being given orders on the same day.
    let shortages = findShortages(horizon);
    let builds = findBuildNeeds();

    for (const group of fleets){
        const home = supplyPool(group[0].location.name);
        let busy = false;
        for (const [kind, work] of [['relief', shortages], ['build', builds]]){
            if (!work.length || !availableFor(group, kind)){ continue; }
            const taken = commit(group, home, work, kind);
            if (taken){
                // Struck off the list so the next fleet is sent after something else rather than
                // piling onto a job that now has a freighter of its own.
                work.splice(0, taken);
                busy = true;
                break;
            }
        }
        if (!busy && balance && availableFor(group, 'balance')){
            commitBalance(group, home, findOverflow(group));
        }
    }
}
