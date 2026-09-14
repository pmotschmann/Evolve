import { global } from './vars.js';
import { adjustCosts } from './functions.js';
import { actions } from './actions.js';
import { spaceSectors } from './space.js';
import { atomic_mass } from './resources.js';
import { supplyMode, supplyPools, supplyPool, supplyZone, regAmount, regMax, regDiff, regLedger, regMaxLedger, uncapped, capsKnown } from './supply.js';
import { shipFleet, shipFleets, startFreightRoute, stopFreightRoute, dispatchFreighter, canAutoRefuelAt,
         freightCapacity, tradeLegDays, tradeRouteViable, freightArrivals, freightArrivalTable, shipCosts,
         shipyardZone, fleetCanReach, shipMoving, shipPort } from './ships.js';

// Freighter routes planned by the governor.

// --- Tuning ---------------------------------------------------------------------------------------

// Priority resources for automatic routes and Market Trader.
export const PRIORITY = ['Food','Oil','Helium_3','Elerium','Coal'];

// Production seconds per game day.
const SECONDS_PER_DAY = 5;

// Shortage horizon in game days.
const HORIZON = 400;

// Minimum surplus measured in days of consumption.
const SURPLUS_DAYS = 30;

// Maximum shortages per relief route.
export const MAX_STOPS = 3;

// A balance route is only worth setting up for a stockpile this close to overflowing.
const FULL_FRACTION = 0.92;

// Days an idle fleet waits before replanning.
const IDLE_DAYS = 5;

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
    // A fleet opted back in looks for work straight away.
    wake(group);
// Opting out leaves the current route under player control.
    return on;
}

// --- One pass --------------------------------------------------------------------------------------

// Per-run auto-route cache.
let pass = false;

function rawOf(obj){
    return typeof Vue !== 'undefined' && Vue && typeof Vue.toRaw === 'function' ? Vue.toRaw(obj) : obj;
}

// Live resource ledgers without Vue proxy overhead.
function ledgers(res){
    let entry = pass.ledgers.get(res);
    if (!entry){
        entry = {
            reg: rawOf(regLedger(res)),
            diff: rawOf(regDiff(res)),
            // Uncapped, or caps not yet worked out: regMax reads both as no limit.
            caps: uncapped(res) || !capsKnown(res) ? false : rawOf(regMaxLedger(res))
        };
        pass.ledgers.set(res, entry);
    }
    return entry;
}

function amountOf(res, pool){
    if (!pass){ return regAmount(res, pool); }
    const reg = ledgers(res).reg;
    return reg.hasOwnProperty(pool) ? reg[pool] : 0;
}

function capOf(res, pool){
    if (!pass){ return regMax(res, pool); }
    const caps = ledgers(res).caps;
    if (!caps){ return -1; }
    return caps.hasOwnProperty(pool) ? caps[pool] : 0;
}

// Invalidate cached overflow routes after a departure.
function departed(){
    if (pass){ pass.overflow = false; }
}

// --- Reading the situation --------------------------------------------------------------------------

// Everything that can be shipped. Resources with no mass are not split between worlds at all.
function shippable(){
    if (pass && pass.shippable){ return pass.shippable; }
    const goods = Object.keys(atomic_mass).filter(res => global.resource[res] && global.resource[res].display);
    if (pass){ pass.shippable = goods; }
    return goods;
}

// A pool's net rate for a resource, in units per day.
function perDay(res, pool){
    const diff = pass ? ledgers(res).diff : regDiff(res);
    return (diff[pool] || 0) * SECONDS_PER_DAY;
}

// What a pool can spare: the stock it holds over and above a month of its own consumption.
function sparable(res, pool){
    const rate = perDay(res, pool);
    if (rate < 0){ return 0; }
    return Math.max(0, amountOf(res, pool) - Math.max(0, -rate) * SURPLUS_DAYS);
}

// Room left in a pool's store. An uncapped resource has room without limit.
function roomIn(res, pool){
    const cap = capOf(res, pool);
    if (cap < 0){ return Infinity; }
    return Math.max(0, cap - amountOf(res, pool));
}

// --- What help is already coming ----------------------------------------------------------------

// Return routes carried by active freighters.
function routes(){
    const ships = (global.space.shipyard && global.space.shipyard.ships) || [];
    return ships.filter(ship => ship.tradeRoute && Array.isArray(ship.tradeRoute.stops)).map(ship => ship.tradeRoute);
}

function fleetCapacity(group){
    return group.reduce((total, ship) => total + freightCapacity(ship), 0);
}

// What a freighter would load at a stop on the way to the world that wants it.
function loadable(res, zone, capacity){
    return Math.min(capacity, sparable(res, zone));
}

// How much of a resource is already on its way to a pool and lands within so many days.
function reliefComing(res, pool, within){
    let arrivals;
    if (pass){
        // Every route walked once for the whole pass, rather than once for every world and resource.
        if (!pass.arrivals){ pass.arrivals = freightArrivalTable(loadable); }
        arrivals = pass.arrivals.get(`${pool}|${res}`) || [];
    }
    else {
        arrivals = freightArrivals(res, pool, loadable);
    }
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
    if (pass && pass.claimed){ return pass.claimed; }
    const taken = new Set();
    for (const route of routes()){
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
    if (pass){ pass.claimed = taken; }
    return taken;
}

// Every world spending a resource faster than it makes it, with no relief already on the way.
export function findShortages(horizon = HORIZON){
    const shortages = [];
    const spokenFor = claimed();
    const goods = shippable();
    for (const pool of supplyPools()){
        for (const res of goods){
            const rate = perDay(res, pool);
            // Not losing ground at all.
            if (rate >= 0){ continue; }
            const empty = amountOf(res, pool) / -rate;
            if (empty > horizon){ continue; }
            const need = Math.min(-rate * horizon, roomIn(res, pool));
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

// Resolve queued building actions; hull costs are handled by queuedBill().
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

// What one queued item costs, as plain amounts, and the world that has to find them.
function queuedBill(item){
    // Charge queued hulls to the active shipyard world.
    if (item && item.action === 'tp-ship' && item.type){
        let costs;
        try { costs = shipCosts(item.type); }
        catch (e){ return false; }
        return { zone: supplyPool(shipyardZone()), costs };
    }
    const c_action = queuedAction(item);
    if (!c_action || !c_action.cost){ return false; }
    let costs;
    try { costs = adjustCosts(c_action); }
    catch (e){ return false; }
    const bill = {};
    for (const res in costs){
        try { bill[res] = Number(costs[res]()) || 0; }
        catch (e){ /* Ignore unpriceable costs. */ }
    }
    // Convert queue ids to supply-zone ids.
    return { zone: supplyPool(supplyZone(String(item.id || '').replace('-', ':'))), costs: bill };
}

// Materials a queued building or hull needs that the world it is going up on has not got.
export function findBuildNeeds(){
    const queue = global.queue && Array.isArray(global.queue.queue) ? global.queue.queue : [];
    const wanted = {};
    // The same building queued several times costs the same each time; it is priced once.
    const bills = new Map();
    for (const item of queue){
        const key = item ? `${item.action}|${item.type}|${item.id}` : '';
        let bill = bills.get(key);
        if (bill === undefined){
            bill = queuedBill(item);
            bills.set(key, bill);
        }
        if (!bill){ continue; }
        for (const res in bill.costs){
            if (!atomic_mass[res] || !global.resource[res]){ continue; }
            const price = bill.costs[res];
            if (!(price > 0)){ continue; }
            if (!wanted[bill.zone]){ wanted[bill.zone] = {}; }
            wanted[bill.zone][res] = Math.max(wanted[bill.zone][res] || 0, price);
        }
    }
    const spokenFor = claimed();
    const needs = [];
    for (const zone in wanted){
        for (const res in wanted[zone]){
            const short = wanted[zone][res] - amountOf(res, zone);
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

// Find overflowing stockpiles and candidate destination pools.
function overflowPiles(){
    if (pass && pass.overflow){ return pass.overflow; }
    // A pile already being carried away by another fleet is not a pile that needs moving.
    const beingMoved = new Set();
    for (const route of routes()){
        // Do not plan a second pickup for any active route.
        for (const stop of route.stops){
            for (const res of stop.pickups || []){ beingMoved.add(`${stop.zone}:${res}`); }
        }
    }
    const pools = supplyPools();
    const piles = [];
    for (const from of pools){
        for (const res of shippable()){
            const cap = capOf(res, from);
            if (cap <= 0){ continue; }                              // uncapped or unknown: never overflows
            if (perDay(res, from) <= 0){ continue; }                // not filling up
            if (amountOf(res, from) < cap * FULL_FRACTION){ continue; }
            if (beingMoved.has(`${from}:${res}`)){ continue; }
            // Somewhere that is not making its own.
            const sinks = [];
            for (const to of pools){
                if (to === from || perDay(res, to) > 0){ continue; }
                sinks.push({ to, room: roomIn(res, to) });
            }
            piles.push({ res, from, sinks });
        }
    }
    if (pass){ pass.overflow = piles; }
    return piles;
}

// Find overflow transfers when no shortages remain.
export function findOverflow(group){
    const capacity = fleetCapacity(group);
    const moves = [];
    for (const pile of overflowPiles()){
        let best = false;
        for (const sink of pile.sinks){
            // Room enough to take a full load, and somewhere this fleet can get to.
            if (sink.room < capacity){ continue; }
            if (!isFinite(tradeLegDays(group, pile.from, sink.to))){ continue; }
            if (!best || sink.room > best.room){ best = sink; }
        }
        if (best){ moves.push({ res: pile.res, from: pile.from, to: best.to, room: best.room }); }
    }
    moves.sort((a,b) => b.room - a.room);
    return moves;
}

// --- Building the route ----------------------------------------------------------------------------

// Append a reachable refuelling stop when needed.
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
// Use current fuel when no refuelling stop exists.
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

// Plan a refuelled relief route for shortages.
function planRelief(group, shortages, suppliers){
    const stops = [];
    const used = [];
    for (const short of shortages){
        if (!suppliers.has(short)){ suppliers.set(short, findSupplier(group, short.res, short.pool, [])); }
        const supplier = suppliers.get(short);
        if (!supplier){ continue; }
// List pickups at suppliers; later stops unload.
        stops.push({ zone: supplier.pool, pickups: [short.res] });
        stops.push({ zone: short.pool, pickups: [] });
        used.push(short);
        if (used.length >= MAX_STOPS){ break; }
    }
    if (!used.length){ return false; }
    return { stops: tidy(withRefuelling(group, tidy(stops))), used };
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
    const fleets = shipFleets();
    const seen = new Set(), out = [];
    for (const ship of ships){
        if (seen.has(ship) || ship.class !== 'freighter' || !autoRouteOn(ship)){ continue; }
        const fleet = fleets.get(ship);
        const group = (fleet && fleet.length ? fleet : [ship]).filter(member => member.class === 'freighter');
        group.forEach(member => seen.add(member));
        if (!group.length || group.some(shipMoving)){ continue; }
        out.push(group);
    }
    return out;
}

// What the governor will interrupt for what.
const RANK = { relief: 3, build: 2, balance: 1 };
function availableFor(group, wanting){
    const route = group[0].tradeRoute;
    if (!route){ return true; }
    // Untagged routes have the lowest interruption priority.
    return RANK[wanting] > (RANK[route.auto] || 0);
}

// Per-hull replanning cooldown; discarded on reload.
const idle = new WeakMap();

// State used to invalidate a fleet's replanning cooldown.
function idleMark(group){
    const route = group[0].tradeRoute;
    return route ? `route:${RANK[route.auto] || 0}` : `at:${shipPort(group[0])}`;
}

function resting(group){
    const today = global.stats.days;
    const mark = idleMark(group);
    // A hull that has just joined has not looked yet, so the fleet looks again.
    return group.every(function(ship){
        const since = idle.get(ship);
        return since && since.mark === mark && today >= since.day && today - since.day < IDLE_DAYS;
    });
}

function rest(group){
    const since = { day: global.stats.days, mark: idleMark(group) };
    group.forEach(ship => idle.set(ship, since));
}

function wake(group){
    group.forEach(ship => idle.delete(ship));
}

// Start a route and avoid retrying failed courses this pass.
function dispatch(group, home, stops, kind, tried){
    const course = stops.map(stop => stop.zone).join('>');
    if (tried.has(course)){ return false; }
    if (stops[0].zone !== home){
// Validate a replacement before cancelling the current route.
        if (!tradeRouteViable(group, stops) || !fleetCanReach(group, stops[0].zone)){
            tried.add(course);
            return false;
        }
        if (group[0].tradeRoute){ stopFreightRoute(group[0]); }
        const sent = dispatchFreighter(group[0], stops[0].zone);
        if (!sent){ tried.add(course); }
        return sent;
    }
// startFreightRoute validates before replacing the current route.
    if (!startFreightRoute(group[0], stops)){
        tried.add(course);
        return false;
    }
    group.forEach(ship => { if (ship.tradeRoute){ ship.tradeRoute.auto = kind; } });
    return true;
}

// Try shorter relief routes when longer routes cannot launch.
function commit(group, home, wants, kind, tried){
    const suppliers = new Map();
    for (let take = Math.min(MAX_STOPS, wants.length); take >= 1; take--){
        const plan = planRelief(group, wants.slice(0, take), suppliers);
        if (plan && dispatch(group, home, plan.stops, kind, tried)){ return plan.used; }
    }
    return [];
}

function commitBalance(group, home, moves, tried){
// Remember failed source/destination pairs for this pass.
    const failed = new Set();
    for (const move of moves){
        const pair = `${move.from}>${move.to}`;
        if (failed.has(pair)){ continue; }
        const stops = planBalance(group, move);
        if (stops && dispatch(group, home, stops, 'balance', tried)){ return move; }
        failed.add(pair);
    }
    return false;
}

// One pass of the governor's freight task.
export function runAutoRoutes(config){
    if (supplyMode() === 'global' || !global.space || !global.space.shipyard){ return; }
    const fleets = managedFleets().filter(group => !resting(group));
    if (!fleets.length){ return; }
    const horizon = config && config.horizon > 0 ? config.horizon : HORIZON;
    const balance = !config || config.balance;

    pass = { ledgers: new Map() };
    try {
// Compute shortages once per pass when an eligible fleet exists.
        const shortages = fleets.some(group => availableFor(group, 'relief')) ? findShortages(horizon) : [];
        const builds = fleets.some(group => availableFor(group, 'build')) ? findBuildNeeds() : [];

        for (const group of fleets){
            const home = supplyPool(shipPort(group[0]));
            const tried = new Set();
            let moved = false;
            for (const [kind, work] of [['relief', shortages], ['build', builds]]){
                if (!work.length || !availableFor(group, kind)){ continue; }
                const taken = commit(group, home, work, kind, tried);
                if (taken.length){
// Remove assigned shortages before planning the next fleet.
                    taken.forEach(item => work.splice(work.indexOf(item), 1));
                    moved = true;
                    break;
                }
            }
            if (!moved && balance && availableFor(group, 'balance')){
                moved = !!commitBalance(group, home, findOverflow(group), tried);
            }
            if (moved){
                departed();
                wake(group);
            }
            else {
                rest(group);
            }
        }
    }
    finally {
        pass = false;
    }
}
