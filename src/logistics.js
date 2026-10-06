// Shadow War logistics: how well supplied each world is, and what that does to its production.
//
// From Syndicate Threat Analysis on, every world a ship can reach carries a logistics value. Its
// material production is scaled by that value as a percentage. Corsair raids take points off a world,
// and freighters on supply routes deliver points to one. Nothing here moves resources: supply zones
// (supply.js) stay dormant on this path.

import { global, breakdown, webWorker } from './vars.js';
import { loc } from './locale.js';
import { atomic_mass } from './resources.js';
import { capitalZone, capitalGone, supplyRegionName } from './supply.js';
import { spaceTech } from './space.js';
import { tauCetiModules } from './truepath.js';
import { regionReachable, shipSpecial, tradeLegAU } from './ships.js';

export const logiConst = {
    start: 50,          // A Sol world's value when Syndicate Threat Analysis cuts the supply lines.
    tauStart: 90,       // A Tau Ceti world's value at the same moment.
    floor: 5,           // Raids never take a world below this.
    cap: 110,           // Deliveries never push a world above this.
    rest: 90,          // A world outside Sol decays back down to this when above it.
    solRest: 60,        // A Sol world decays back down to this when above it.
    decayDays: 5,       // Game days per point of decay.
    raidShare: 0.5,     // Points a raider takes per point of hull it has left (percent).
    guardFire: 0.5,     // Share of their usual damage defenders land on a raider.
    cargoBonus: 1,      // Extra points an Extra Cargo freighter delivers per drop-off.
    robbedShare: 0.5,   // Share of its next load a robbed freighter delivers.
    freeLanes: 1,       // Freighters from other fleets that can share a leg before it loses value.
    lanePenalty: 1,     // Points a leg loses for each freighter beyond that.
    fleetShare: 0.5,    // Share of its own load each extra freighter in a fleet adds...
    fleetMax: 3,        // ...counting this many freighters in all; any more add nothing.
    routePace: 0.75,    // Share of its speed a freighter flies at while on a supply route.
};

// Places ships can reach that are not worlds of yours.
const NOT_WORLDS = ['spc_sun_gate','spc_sybase'];

function round2(v){
    return Math.round(v * 100) / 100;
}

function table(){
    return global.race['logistics'] || false;
}

// Whether the Shadow War has put the worlds on logistics.
export function logisticsActive(){
    return table() ? true : false;
}

// Whether a region is one of your worlds for logistics purposes.
export function logisticsWorld(region){
    if (!region || NOT_WORLDS.includes(region)){ return false; }
    if (region === 'spc_home' && capitalGone()){ return false; }
    if (!spaceTech()[region] && !tauCetiModules[region]){ return false; }
    return regionReachable(region);
}

// Every world that carries a logistics value right now, in map order.
export function logisticsWorlds(){
    return Object.keys(spaceTech()).concat(Object.keys(tauCetiModules)).filter(logisticsWorld);
}

// Whether a world belongs to the Sol system, which settles lower than anywhere else.
function solWorld(region){
    return region.startsWith('spc_');
}

// Whether a Sol world's space lanes have been secured: Zone Security (shadow 16) for the inner system,
// Outer Security (shadow 17) for the outer, going by the region's own zone.
export function lanesSecured(region){
    const zone = spaceTech()[region] && spaceTech()[region].info ? spaceTech()[region].info.zone : false;
    const shadow = global.tech['shadow'] || 0;
    if (zone === 'inner'){ return shadow >= 16; }
    if (zone === 'outer'){ return shadow >= 17; }
    return false;
}

// The level a world decays back to when it is over it. A Sol world settles lower until its lanes are
// secured, after which it holds anything up to the same level as everywhere else.
export function logisticsRest(region){
    return solWorld(region) && !lanesSecured(region) ? logiConst.solRest : logiConst.rest;
}

// The value a world starts at, whether when the supply lines are cut or when it first becomes reachable.
export function logisticsStart(region){
    return solWorld(region) ? logiConst.start : logiConst.tauStart;
}

// Put every world on logistics. Runs once, when Syndicate Threat Analysis would have split the supply.
export function startLogistics(){
    if (table()){ return false; }
    const v = {};
    logisticsWorlds().forEach(function(region){ v[region] = logisticsStart(region); });
    global.race['logistics'] = { v: v, d: global.stats.days };
    return true;
}

// A world's logistics value. Anything that is not a tracked world runs at 100.
export function logisticsOf(region){
    const logi = table();
    if (!logi || !region){ return 100; }
    return logi.v.hasOwnProperty(region) ? logi.v[region] : 100;
}

// Move a world's value by `pts`, kept within the floor and the cap. Returns the change actually made.
export function shiftLogistics(region, pts){
    const logi = table();
    if (!logi || !pts){ return 0; }
    // A world that became reachable since the last daily pass enrols at the starting value.
    if (!logi.v.hasOwnProperty(region)){
        if (!logisticsWorld(region)){ return 0; }
        logi.v[region] = logisticsStart(region);
    }
    const was = logi.v[region];
    let now = round2(was + pts);
    if (pts < 0){ now = Math.max(Math.min(was, logiConst.floor), now); }
    else { now = Math.min(Math.max(was, logiConst.cap), now); }
    logi.v[region] = now;
    return round2(now - was);
}

// A world's production multiplier. Unattributed production happens at the capital, as it always has, and
// anything that is not a tracked world runs at 1.
function worldMult(region){
    const logi = table();
    const at = !region || region === 'city' ? capitalZone() : region;
    return logi && logi.v.hasOwnProperty(at) ? logi.v[at] / 100 : 1;
}

// Scale tracked material production by the logistics of the world it comes from, and note it in the
// breakdown under the lines describing it. `claim` is false for a pooled change that notes its own sources.
export function logisticsYield(res, val, region, claim = true){
    if (!table() || !(val > 0) || !atomic_mass[res]){ return val; }
    const m = worldMult(region);
    if (claim){ logisticsClaim(res, m); }
    return m === 1 ? val : val * m;
}

// The multiplier for output pooled from several worlds, weighted by each one's share of the work.
export function logisticsShareMult(share){
    let all = 0, sum = 0;
    for (const zone in share){
        all += share[zone];
        sum += share[zone] * worldMult(zone);
    }
    return all > 0 ? sum / all : 1;
}

// --- The production breakdown ----------------------------------------------------------------------
// Every source line a world's logistics scales gets a "Logistics" line under it, the way the Syndicate's
// penalty was shown. A production call comes straight after the lines describing it, so each call claims
// every source line written to that resource since the last claim. The breakdown is rebuilt every fast
// loop, so keying the claims on the object itself starts each tick afresh.
const claimed = new WeakMap();
let noteSeq = 0;

// Note logistics under every unclaimed source line of a resource's breakdown. `at` is the multiplier,
// the world the sources are on, or a function naming the world for each line's label.
export function logisticsClaim(res, at){
    if (!table() || webWorker.offline){ return; }
    const bd = breakdown.p && breakdown.p[res];
    if (!bd){ return; }
    const keys = Object.keys(bd);
    const from = claimed.get(bd) || 0;
    if (from < keys.length){
        const label = loc('logistics_bd');
        // Rewritten in order so each note lands directly under its source's own sub-lines, ahead of any
        // resource-wide line (hunger, shrine…) that follows them.
        const tail = keys.slice(from).map(key => [key, bd[key]]);
        tail.forEach(([key]) => { delete bd[key]; });
        for (let i = 0; i < tail.length; i++){
            const [key, val] = tail[i];
            bd[key] = val;
            if (typeof val !== 'string' || !val.endsWith('v') || key.startsWith('ᄂ')){ continue; }
            while (i + 1 < tail.length && tail[i + 1][0].startsWith('ᄂ')){
                i++;
                bd[tail[i][0]] = tail[i][1];
            }
            if (!(parseFloat(val) > 0)){ continue; }
            const m = typeof at === 'number' ? at : worldMult(typeof at === 'function' ? at(key) : at);
            if (m !== 1){ bd[`ᄂ${label}+L${noteSeq++}`] = +((m - 1) * 100).toFixed(2) + '%'; }
        }
    }
    claimed.set(bd, Object.keys(bd).length);
}

// Daily: enrol newly reachable worlds, and let anything over its resting level decay toward it.
export function logisticsDay(){
    const logi = table();
    if (!logi){ return; }
    logisticsWorlds().forEach(function(region){
        if (!logi.v.hasOwnProperty(region)){ logi.v[region] = logisticsStart(region); }
    });
    if (typeof logi.d !== 'number' || logi.d > global.stats.days){ logi.d = global.stats.days; }
    const steps = Math.floor((global.stats.days - logi.d) / logiConst.decayDays);
    if (steps <= 0){ return; }
    logi.d += steps * logiConst.decayDays;
    Object.keys(logi.v).forEach(function(region){
        const rest = logisticsRest(region);
        if (logi.v[region] > rest){ logi.v[region] = round2(Math.max(rest, logi.v[region] - steps)); }
    });
}

// --- Supply routes ---------------------------------------------------------------------------------

// The worlds a route visits, in order, from a ship's stored route.
function routeZones(ship){
    const route = ship && ship.tradeRoute;
    return route && Array.isArray(route.stops) ? route.stops.map(stop => stop && stop.zone) : [];
}

// Whether a list of stops flies the leg between two worlds, in either direction.
function routeHasLeg(zones, a, b){
    for (let i = 0; i < zones.length && zones.length > 1; i++){
        const from = zones[i], to = zones[(i + 1) % zones.length];
        if ((from === a && to === b) || (from === b && to === a)){ return true; }
    }
    return false;
}

// Freighters, other than those passed in, whose supply route flies the leg between two worlds.
export function legLanes(a, b, except = []){
    const ships = global.space['shipyard'] && Array.isArray(global.space.shipyard.ships) ? global.space.shipyard.ships : [];
    let count = 0;
    for (const ship of ships){
        if (ship.class !== 'freighter' || ship.damage >= 100 || except.includes(ship)){ continue; }
        if (routeHasLeg(routeZones(ship), a, b)){ count++; }
    }
    return count;
}

// The AU a group of freighters would fly in normal space between two worlds, by the trip it would plan.
// Wormhole jumps add nothing, so a run to Tau Ceti counts only the flying to and from the gates.
export function legDistance(a, b, group){
    if (!a || !b || a === b){ return 0; }
    return tradeLegAU(group, a, b);
}

// What one leg is worth to a freighter, given how many others already fly it: a point per AU flown, less a
// point for every freighter beyond the first sharing it, and never below nothing.
export function legBaseValue(a, b, others, group){
    const crowd = Math.max(0, others - logiConst.freeLanes) * logiConst.lanePenalty;
    return round2(Math.max(0, legDistance(a, b, group) - crowd));
}

// The bonus a freighter's fit adds to each drop-off.
export function cargoBonus(ship){
    return ship && shipSpecial(ship) === 'extra_cargo' ? logiConst.cargoBonus : 0;
}

// The share of its own load a freighter adds to its fleet, by rank: the best load counts in full, the
// next ones `fleetShare` each up to `fleetMax` freighters, and any beyond that nothing.
function fleetShareAt(rank){
    if (rank === 0){ return 1; }
    return rank < logiConst.fleetMax ? logiConst.fleetShare : 0;
}

// How much a fleet of `count` freighters adds over a lone one, as a fraction: 0, then 0.5, then 1.
export function fleetBonus(count){
    return Math.max(0, Math.min(count, logiConst.fleetMax) - 1) * logiConst.fleetShare;
}

// What each freighter in a fleet loads for the leg from `from` to `to`, in the order given. A freighter's
// own load is the leg's value plus its fit's bonus; the fleet's best counts in full and the rest by
// fleetShareAt. Fleet-mates (`fleet`, defaulting to those loading) never crowd each other's lane.
export function fleetLegLoads(freighters, from, to, fleet = freighters){
    const base = legBaseValue(from, to, legLanes(from, to, fleet), freighters);
    const loads = new Array(freighters.length).fill(0);
    freighters.map((ship, i) => ({ i, v: base + cargoBonus(ship) }))
        .sort((a,b) => b.v - a.v || a.i - b.i)
        .forEach(function(entry, rank){ loads[entry.i] = round2(entry.v * fleetShareAt(rank)); });
    return loads;
}

// The estimate shown before a route is started: each leg, and what the whole fleet delivers per loop.
export function routeSupplyEstimate(stops, freighters){
    const zones = stops.map(stop => stop.zone);
    const legs = [];
    let total = 0;
    zones.forEach(function(from, i){
        const to = zones[(i + 1) % zones.length];
        const value = round2(fleetLegLoads(freighters, from, to).reduce((t,v) => t + v, 0));
        total += value;
        legs.push({
            from: supplyRegionName(from, true),
            to: supplyRegionName(to, true),
            dist: round2(legDistance(from, to, freighters)),
            others: legLanes(from, to, freighters),
            value: value
        });
    });
    return {
        legs: legs,
        total: round2(total),
        bonus: fleetBonus(freighters.length)
    };
}
