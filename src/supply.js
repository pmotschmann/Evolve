import { global, breakdown } from './vars.js';
import { actions } from './actions.js';
import { atomic_mass, crateValue, containerValue, drawResourceTab, loadRegionSwitch } from './resources.js';
import { convertSpaceSector, planetName } from './space.js';
import { loc } from './locale.js';

// Regional supply pools.

// --- The mode ------------------------------------------------------------------------------------

// 'global'   one combined pool, exactly as the game has always worked
// 'regional' one pool per region, or per group of linked regions
export function supplyMode(){
    return global.tech['shadow'] && global.tech.shadow >= 5 ? 'regional' : 'global';
}

// Resources split by supply zone
export function partitioned(res){
    return !!atomic_mass[res] && supplyMode() !== 'global';
}

// --- The regions ---------------------------------------------------------------------------------
// The homeworld is part of "spc_home"
export const CAPITAL = 'spc_home';

// Sentinel for civilization-wide costs that draw from every supply pool.
export const ANYWHERE = '*';

// Categories that carry regions, and the one that does not.
const REGION_CATS = ['space','interstellar','galaxy','portal','tauceti','eden'];

// Built once, on demand, rather than at module load.
let regionList = false;
let structMap = false;

function buildIndex(){
    if (regionList){ return; }
    regionList = [];
    structMap = {};
    for (const cat of REGION_CATS){
        if (!actions[cat]){ continue; }
        for (const region of Object.keys(actions[cat])){
            const bucket = actions[cat][region];
            if (!bucket || typeof bucket !== 'object'){ continue; }
            regionList.push(region);
            for (const key of Object.keys(bucket)){
                if (key === 'info'){ continue; }   // the region's own header, not a building
                const c_action = bucket[key];
                if (!c_action || typeof c_action !== 'object'){ continue; }
                tagSupply(c_action, region);
                structMap[`${cat}:${key}`] = c_action.s_zone;
            }
        }
    }
    // The homeworld is spc_home
    regionList = [CAPITAL].concat(regionList.filter(r => r !== CAPITAL));
    if (actions.city){
        for (const key of Object.keys(actions.city)){
            const c_action = actions.city[key];
            if (!c_action || typeof c_action !== 'object'){ continue; }
            tagSupply(c_action, CAPITAL);
            structMap[`city:${key}`] = c_action.s_zone;
        }
    }
}

// Tag building supply zone
function tagSupply(c_action, region){
    if (!c_action.s_zone){ c_action.s_zone = region; }
    if (typeof c_action.supply !== 'function'){
        c_action.supply = function(){ return this.s_zone; };
    }
}

// Whether a name is a zone rather than a building.
function isZone(name){
    return typeof name === 'string' && /^(spc|int|gxy|prtl|tau|eden)_/.test(name);
}

// The zone something belongs to.
export function supplyZone(at, cat){
    if (!at){ return CAPITAL; }
    if (isZone(at)){ return at; }
    const split = at.indexOf(':');
    if (split > 0){ return regionOf(at.slice(split + 1), at.slice(0, split)); }
    return regionOf(at, cat);
}

// Every region there is.
export function supplyRegions(){
    buildIndex();
    return regionList;
}

// The region a building belongs to.
export function supplyOf(c_action, cat){
    if (c_action && typeof c_action.supply === 'function'){
        buildIndex();   // a hand-written supply() is honoured, but the tagging still has to have run
        return c_action.supply();
    }
    // Research costs draw from the civilization-wide pool.
    if (c_action && typeof c_action.id === 'string' && c_action.id.startsWith('tech-')){ return ANYWHERE; }
    buildIndex();
    if (c_action && c_action.id){
        const parts = c_action.id.split('-');
        const key = parts.slice(1).join('-');
        const guess = structMap[`${parts[0]}:${key}`];
        if (guess){ return guess; }
    }
    if (cat && c_action && c_action.id){
        const key = c_action.id.split('-').slice(1).join('-');
        if (structMap[`${cat}:${key}`]){ return structMap[`${cat}:${key}`]; }
    }
    return CAPITAL;
}

// The region a bare structure name belongs to, for callers holding only what the game state stores.
export function regionOf(structKey, cat){
    buildIndex();
    if (cat && structMap[`${cat}:${structKey}`]){ return structMap[`${cat}:${structKey}`]; }
    for (const c of ['city', ...REGION_CATS]){
        if (structMap[`${c}:${structKey}`]){ return structMap[`${c}:${structKey}`]; }
    }
    return CAPITAL;
}

// What a region is called on screen.
export function supplyRegionName(region, raw = false){
    buildIndex();
    // A zone made of several worlds may be named after something that is not one of them — Titan and
    // Enceladus share a store called Saturn, after the planet they both orbit.
    const group = groupOf(region);
    if (!raw && group && group.p && group.r[0] === region){
        const named = planetName()[group.p];
        if (named){ return named; }
    }
    if (region === CAPITAL && actions.space && actions.space.spc_home && actions.space.spc_home.info){
        const info = actions.space.spc_home.info;
        if (typeof info.name === 'function'){ return info.name(); }
    }
    for (const cat of REGION_CATS){
        const bucket = actions[cat] && actions[cat][region];
        if (bucket && bucket.info && typeof bucket.info.name === 'function'){
            return bucket.info.name();
        }
    }
    // Resolve a region name from its locale entry when available.
    const suffix = region.replace(/^(spc|int|gxy|prtl|tau|eden)_/, '');
    const cat = supplyContainer(region);
    for (const key of [`${cat}_${suffix}_info_name`, `${region}_title`, `${cat}_${suffix}_title`,
                       `${region}_info_name`]){
        const str = loc(key);
        if (str !== key){ return str; }
    }
    // Fall back to a readable region key when no locale name exists.
    return suffix.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Normalize legacy city references to the home-world region.
export function supplyRegionKey(r){
    return r === 'city' ? CAPITAL : r;
}

// The container in `global` a region's structures are counted in. Straight through to the existing
// helper, with the city — which has no prefix to switch on — handled first.
export function supplyContainer(region){
    return region === CAPITAL ? 'city' : convertSpaceSector(region);
}

// --- Combining regions ---------------------------------------------------------------------------
// Linked regions act as one location
function links(){
    if (!global.race['supplyLinks']){ global.race['supplyLinks'] = []; }
    const groups = global.race.supplyLinks;
    for (let i = 0; i < groups.length; i++){
        if (Array.isArray(groups[i])){ groups[i] = { r: groups[i] }; }
        if (!groups[i].r){ groups[i].r = []; }
    }
    return groups;
}

// The group a region belongs to, or false.
function groupOf(region){
    for (const group of links()){
        if (group.r.includes(region)){ return group; }
    }
    return false;
}

// The pool a region draws from: the group it belongs to, named for the first region in it, or the
// region itself when it stands alone.
let poolOfCache = false;
export function supplyPool(region){
    if (!region){ return CAPITAL; }
    if (supplyMode() === 'global'){ return CAPITAL; }
    if (!poolOfCache){
        poolOfCache = {};
        for (const group of links()){
            for (const member of group.r){ poolOfCache[member] = group.r[0]; }
        }
    }
    return poolOfCache[region] || region;
}

// Every active region drawing on a pool.
export function poolRegions(pool){
    const members = pools().members[pool];
    if (members){ return members; }
    const group = groupOf(pool);
    return group && group.r[0] === pool ? group.r.slice() : [pool];
}

export function regionEnabled(region){
    if (region === CAPITAL){ return true; }        // the home world is always there
    const settings = global.settings || {};
    switch (supplyContainer(region)){
        case 'portal':  return !!(settings.portal && settings.portal[region.slice(5)]);
        case 'eden':    return !!(settings.eden && settings.eden[region.slice(5)]);
        case 'tauceti': return !!(settings.tau && settings.tau[region.slice(4)]);
        default:        return !!(settings.space && settings.space[region.slice(4)]);
    }
}

export function activeSupplyRegions(){
    buildIndex();
    const live = {};
    for (const key in structMap){
        const cat = key.slice(0, key.indexOf(':'));
        const struct = key.slice(key.indexOf(':') + 1);
        const region = structMap[key];
        if (live[region] || !regionEnabled(region)){ continue; }
        const held = global[cat] && global[cat][struct];
        if (held && held.count > 0){ live[region] = true; }
    }
    // The capital is always a place: it is where the civilisation started.
    live[CAPITAL] = true;
    return supplyRegions().filter(r => live[r]);
}

// Every supply pool that currently exists.
let poolCache = false;
export function refreshPools(){
    poolCache = false;
    poolOfCache = false;
}
// Refresh resource UI after supply-pool membership changes.
function poolsChanged(){
    refreshPools();
    drawResourceTab('storage');
    // The resource list's world-picker cycles through the stores, so connecting two of them changes
    // what it has to offer — and may have retired the very world it was pointed at.
    if (global.settings.resRegion && global.settings.resRegion !== 'all'
        && !supplyPools().includes(global.settings.resRegion)){
        global.settings.resRegion = supplyPool(global.settings.resRegion);
    }
    loadRegionSwitch();
}
function pools(){
    if (poolCache){ return poolCache; }
    const seen = {}, list = [], members = {};
    for (const region of activeSupplyRegions()){
        const pool = supplyPool(region);
        if (!seen[pool]){ seen[pool] = true; list.push(pool); members[pool] = []; }
        members[pool].push(region);
    }
    poolCache = { list, members };
    return poolCache;
}

export function supplyPools(){
    return pools().list;
}

// Join two regions into one supply pool.
export function linkSupply(a, b, name){
    const groups = links();
    let ga = -1, gb = -1;
    for (let i = 0; i < groups.length; i++){
        if (groups[i].r.includes(a)){ ga = i; }
        if (groups[i].r.includes(b)){ gb = i; }
    }
    if (ga >= 0 && ga === gb){ return groups[ga].r[0]; }   // already the one store: nothing to do
    let pool;
    if (ga >= 0 && gb >= 0){
        // Two existing groups become one, and the second is dropped rather than left empty. The
        // surviving group keeps its name, or takes the other's if it had none of its own.
        groups[ga].r = groups[ga].r.concat(groups[gb].r);
        groups[ga].p = groups[ga].p || groups[gb].p;
        groups.splice(gb, 1);
        pool = groups[ga < gb ? ga : ga - 1].r[0];
    }
    else if (ga >= 0){ groups[ga].r.push(b); pool = groups[ga].r[0]; }
    else if (gb >= 0){ groups[gb].r.push(a); pool = groups[gb].r[0]; }
    else { groups.push(name ? { r: [a, b], p: name } : { r: [a, b] }); pool = a; }
    if (name && groupOf(a) && !groupOf(a).p){ groupOf(a).p = name; }
    poolsChanged();
    return pool;
}

// Take a region back out of whatever it was joined to, and give it backits share of resources.
export function unlinkSupply(region){
    const groups = links();
    const crateVal = crateValue(), conVal = containerValue();
    for (let i = 0; i < groups.length; i++){
        const at = groups[i].r.indexOf(region);
        if (at < 0){ continue; }
        // Read while the group is still whole: the name the stock is filed under, who is in it, and
        // what fraction of each resource the leaver is entitled to take with it.
        const wasPool = groups[i].r[0];
        const members = groups[i].r.slice();
        const shares = {};
        for (const res in atomic_mass){
            if (!global.resource[res]){ continue; }
            // Seed missing regional ledgers before resource arithmetic.
            ensureLedger(res);
            let mine = regionStorage(res, region, crateVal, conVal), all = 0;
            for (const member of members){ all += regionStorage(res, member, crateVal, conVal); }
            shares[res] = all > 0 ? mine / all : 0;
        }

        groups[i].r.splice(at, 1);
        if (groups[i].r.length <= 1){ groups.splice(i, 1); }
        refreshPools();

        // Only now can the two destinations be named — the leaver stands alone, and what is left of
        // the group may have been renamed by losing the member it took its name from.
        const goPool = supplyPool(region);
        const stayPool = supplyPool(members.find(m => m !== region));
        for (const res in shares){
            const ledger = regLedger(res);
            const had = ledger[wasPool] || 0;
            const take = had * shares[res];
            delete ledger[wasPool];
            ledger[goPool] = (ledger[goPool] || 0) + take;
            ledger[stayPool] = (ledger[stayPool] || 0) + (had - take);
            syncTotal(res);
        }
        poolsChanged();
        return true;
    }
    return false;
}

// Whether two regions currently share a pool.
export function supplyLinked(a, b){
    return supplyPool(a) === supplyPool(b);
}

// Regional resource ledger helpers.

export function regLedger(res){
    if (!global.resource[res].hasOwnProperty('reg')){ global.resource[res].reg = {}; }
    return global.resource[res].reg;
}

// Return a pool amount, or the global total for ANYWHERE.
export function regAmount(res, pool){
    if (pool === ANYWHERE){ return global.resource[res] ? global.resource[res].amount : 0; }
    const reg = regLedger(res);
    return reg.hasOwnProperty(pool) ? reg[pool] : 0;
}

// Return a pool capacity, with a safe global fallback.
export function regMaxLedger(res){
    if (!global.resource[res].hasOwnProperty('regMax')){ global.resource[res].regMax = {}; }
    return global.resource[res].regMax;
}

// Uncapped resources remain uncapped in every supply pool.
export function uncapped(res){
    return global.resource[res] && global.resource[res].max < 0;
}

// Whether the storage pass has worked out what this resource's worlds can hold. Empty means it has
// not run yet, which is not the same as "they can hold nothing".
export function capsKnown(res){
    const caps = regMaxLedger(res);
    for (const pool in caps){ return true; }
    return false;
}

export function regMax(res, pool){
    if (uncapped(res)){ return -1; }
    // Global capacity is the sum of all pool capacities.
    if (pool === ANYWHERE){ return global.resource[res] ? global.resource[res].max : -1; }
    // Treat uninitialized regional capacity as uncapped.
    if (!capsKnown(res)){ return -1; }
    const caps = regMaxLedger(res);
    return caps.hasOwnProperty(pool) ? caps[pool] : 0;
}

// The sum of the ledger, which `.amount` is held equal to.
export function regTotal(res){
    const reg = regLedger(res);
    let sum = 0;
    for (const pool in reg){ sum += reg[pool]; }
    return sum;
}

// Fold the ledger back up into the total. Called after anything that moves resources between pools.
export function syncTotal(res){
    global.resource[res].amount = regTotal(res);
}

// --- Splitting and sharing -----------------------------------------------------------------------

// Calculate each pool’s storage share.
export function storageShare(res){
    // Nothing to take a share of when there is no ceiling anywhere, so an even split across the
    // worlds that exist is the only reading that does not favour one of them arbitrarily.
    if (uncapped(res)){
        const live = supplyPools();
        if (!live.length){ return { [CAPITAL]: 1 }; }
        const each = {};
        for (const pool of live){ each[pool] = 1 / live.length; }
        return each;
    }
    const caps = regMaxLedger(res);
    const share = {};
    let total = 0;
    for (const pool in caps){ total += caps[pool] > 0 ? caps[pool] : 0; }
    if (total <= 0){ return { [CAPITAL]: 1 }; }
    for (const pool in caps){
        if (caps[pool] > 0){ share[pool] = caps[pool] / total; }
    }
    return share;
}

// Split resources by storage share while preserving totals.
export function splitByStorage(res){
    const share = storageShare(res);
    const total = global.resource[res].amount;
    const reg = regLedger(res);
    for (const pool in reg){ delete reg[pool]; }
    const pools = Object.keys(share);
    let left = total;
    for (let i = 0; i < pools.length; i++){
        const give = i === pools.length - 1 ? left : total * share[pools[i]];
        reg[pools[i]] = give;
        left -= give;
    }
    syncTotal(res);
}

// Starting zones for the initial supply split.
const STARTING_ZONES = [
    // The home world and its moon.
    { r: [CAPITAL, 'spc_moon'] },
    // Mercury and the sun.
    { r: ['spc_sun', 'spc_hell'] },
    // Ceres and the asteroid belt.
    { r: ['spc_belt', 'spc_dwarf'] },
    // Jupiter and its moon.
    { r: ['spc_gas', 'spc_gas_moon'] },
    // Two moons of Saturn, grouped as "Saturn".
    { r: ['spc_titan', 'spc_enceladus'], p: 'saturn' },
    // Tau Ceti is considered a single zone.
    { r: ['tau_star', 'tau_home', 'tau_red', 'tau_gas', 'tau_roid', 'tau_gas2'] },
];

export function splitSupply(){
    for (const zone of STARTING_ZONES){
        // Joined to the first one in turn, so the zone keeps that region's name however many
        // worlds it ends up holding.
        for (let i = 1; i < zone.r.length; i++){
            linkSupply(zone.r[0], zone.r[i], zone.p);
        }
    }
    for (const res in atomic_mass){
        if (!global.resource[res]){ continue; }
        splitStacks(res);
        // Don't divide crafted resources.
        if (uncapped(res)){
            //delete global.resource[res].regDeal;   // clears the mark off a save that carries a stale one
            //continue;
        }
        const reg = regLedger(res);
        for (const pool in reg){ delete reg[pool]; }
        // Marked as owed a division rather than divided here.
        global.resource[res].regDeal = true;
    }
}

// Whether this resource is still waiting to be divided between the worlds.
function awaitingDeal(res){
    return !!global.resource[res].regDeal;
}

// Deal a resource's crates and containers evenly over the pools, remainder first-come.
export function dealStacks(res){
    splitStacks(res);
}

function splitStacks(res){
    if (!global.resource[res] || !global.resource[res].stackable){ return; }
    // Only give resources to active supply regions.
    const regions = activeSupplyRegions();
    if (!regions.length){ return; }
    for (const field of ['crates','containers']){
        const ledger = field === 'crates' ? regCrates(res) : regContainers(res);
        for (const region in ledger){ delete ledger[region]; }
        const each = Math.floor(global.resource[res][field] / regions.length);
        let left = global.resource[res][field] - each * regions.length;
        for (const region of regions){
            ledger[region] = each + (left > 0 ? 1 : 0);
            if (left > 0){ left--; }
        }
    }
}

// Track resource deltas and rates by supply zone.
export function regDelta(res){
    if (!global.resource[res].hasOwnProperty('regDelta')){ global.resource[res].regDelta = {}; }
    return global.resource[res].regDelta;
}
export function regDiff(res){
    if (!global.resource[res].hasOwnProperty('regDiff')){ global.resource[res].regDiff = {}; }
    return global.resource[res].regDiff;
}

// Population distribution helpers.
export function setZoneHousing(byZone, population){
    if (!global.race['zonePop']){ global.race['zonePop'] = {}; }
    const pop = global.race.zonePop;
    let room = 0;
    for (const zone in byZone){ room += byZone[zone] > 0 ? byZone[zone] : 0; }
    if (room <= 0 || !population){
        for (const zone in pop){ delete pop[zone]; }
        // No housing anywhere the reckoning knows of — everyone is at home, which is where the
        // civilisation starts and where anything unattributed belongs.
        pop[CAPITAL] = population || 0;
        global.race.zoneHousing = {};
        return pop;
    }
    const housing = {};
    for (const zone in byZone){
        if (byZone[zone] > 0){ housing[zone] = byZone[zone]; }
    }
    const previousHousing = global.race.zoneHousing || {};
    const sameHousing = Object.keys(housing).length === Object.keys(previousHousing).length
        && Object.keys(housing).every(zone => housing[zone] === previousHousing[zone]);

    // Redistribute population only when housing capacity changes.
    if (sameHousing && Object.keys(pop).length){
        let placed = 0;
        for (const zone in pop){ placed += pop[zone]; }
        if (placed === population){ return pop; }
        if (placed < population){
            pop[supplyPool(CAPITAL)] = (pop[supplyPool(CAPITAL)] || 0) + (population - placed);
            return pop;
        }
    }

    for (const zone in pop){ delete pop[zone]; }
    // Whole people, with the rounding remainder going to the capital rather than being dropped: the
    // parts have to add back up to the population the game thinks it has.
    const zones = Object.keys(housing);
    let placed = 0;
    for (const zone of zones){
        pop[zone] = Math.floor(population * housing[zone] / room);
        placed += pop[zone];
    }
    pop[supplyPool(CAPITAL)] = (pop[supplyPool(CAPITAL)] || 0) + (population - placed);
    global.race.zoneHousing = housing;
    return pop;
}

// How many citizens live in a zone, or the whole map of them.
export function zoneCitizens(zone){
    const pop = global.race['zonePop'] || {};
    if (zone === undefined){ return pop; }
    // A zone is several worlds sharing a store; its people are all of theirs.
    let n = 0;
    for (const region of poolRegions(zone)){ n += pop[region] || 0; }
    return n;
}

// Remove one resident from a supply pool. Linked regions share food, so starvation within a linked
// pool can take a resident from any of its member regions, but never from an unrelated world.
export function starveZone(zone){
    const pop = global.race['zonePop'] || {};
    const pool = supplyPool(zone);
    let target = false;
    for (const region of poolRegions(pool)){
        if ((pop[region] || 0) > (target ? pop[target] : 0)){ target = region; }
    }
    if (!target){ return false; }
    pop[target]--;
    return true;
}

// The zones to charge population upkeep to. Never empty: before the first housing pass has
// run there is no zonePop yet, and an empty list would drop that tick's upkeep entirely.
export function citizenZones(){
    const zones = Object.keys(global.race['zonePop'] || {});
    return zones.length ? zones : [CAPITAL];
}

// A zone's share of the population, for charging it its share of what the population eats.
export function citizenShare(zone){
    const pop = global.race['zonePop'] || {};
    let all = 0;
    for (const z in pop){ all += pop[z]; }
    return all > 0 ? zoneCitizens(zone) / all : (supplyPool(zone) === supplyPool(CAPITAL) ? 1 : 0);
}

export function regCrates(res){
    if (!global.resource[res].hasOwnProperty('regCrate')){ global.resource[res].regCrate = {}; }
    return global.resource[res].regCrate;
}

export function regContainers(res){
    if (!global.resource[res].hasOwnProperty('regCon')){ global.resource[res].regCon = {}; }
    return global.resource[res].regCon;
}

// --- Storage, per pool ---------------------------------------------------------------------------

// Set regional storage caps and source breakdowns.
export function setRegCaps(res, structural, attributed, crateVal, conVal){
    reconcileStacks(res);
    const base = {};
    let named = 0;
    if (attributed){
        for (const region in attributed){
            base[region] = attributed[region];
            named += attributed[region];
        }
    }
    const spare = structural - named;
    base[CAPITAL] = (base[CAPITAL] || 0) + spare;
    global.resource[res].regBase = base;
    // Include unattributed and base storage in the regional breakdown.
    for (const pool of supplyPools()){
        for (const region of poolRegions(pool)){
            const own = regionBaseStorage(res, region) + (region === CAPITAL ? spare : 0);
            if (!own){ continue; }
            if (!breakdown.creg[region]){ breakdown.creg[region] = {}; }
            if (!breakdown.creg[region][res]){ breakdown.creg[region][res] = {}; }
            breakdown.creg[region][res][loc('base')] = own + 'v';
        }
    }

    const caps = regMaxLedger(res);
    for (const pool in caps){ delete caps[pool]; }
    for (const pool of supplyPools()){
        let room = 0;
        for (const region of poolRegions(pool)){
            room += regionStorage(res, region, crateVal, conVal);
        }
        caps[pool] = room;
    }
    // A world that has been abandoned, or was never active, can still be named by the attribution —
    // its storage has to go somewhere or the parts would stop adding up to the whole.
    let placed = 0;
    for (const pool in caps){ placed += caps[pool]; }
    const whole = structural + regionBaseTotal(res)
                             + (global.resource[res].crates || 0) * crateVal
                             + (global.resource[res].containers || 0) * conVal;
    if (Math.abs(whole - placed) > 1e-9){
        caps[supplyPool(CAPITAL)] = (caps[supplyPool(CAPITAL)] || 0) + (whole - placed);
    }
}

// Record crates and containers in each region’s storage breakdown.
export function bdStacks(res, crateVal, conVal){
    const crates = regCrates(res), cons = regContainers(res);
    const seen = {};
    for (const region of Object.keys(crates).concat(Object.keys(cons))){
        if (seen[region]){ continue; }
        seen[region] = true;
        const fromCrates = (crates[region] || 0) * crateVal;
        const fromCons = (cons[region] || 0) * conVal;
        if (!fromCrates && !fromCons){ continue; }
        if (!breakdown.creg[region]){ breakdown.creg[region] = {}; }
        if (!breakdown.creg[region][res]){ breakdown.creg[region][res] = {}; }
        if (fromCrates){ breakdown.creg[region][res][loc('resource_Crates_plural')] = fromCrates + 'v'; }
        if (fromCons){ breakdown.creg[region][res][loc('resource_Containers_plural')] = fromCons + 'v'; }
    }
}

// Reconcile regional stack assignments with the global count.
function reconcileStacks(res){
    for (const field of ['crates','containers']){
        const ledger = field === 'crates' ? regCrates(res) : regContainers(res);
        const want = global.resource[res][field] || 0;
        let have = 0;
        for (const region in ledger){ have += ledger[region]; }
        if (have === want){ continue; }
        const regions = Object.keys(ledger);
        if (!regions.length || have <= 0){
            // Nothing recorded to scale from — deal what there is out evenly.
            if (want > 0){ splitStacks(res); }
            else { for (const region of regions){ ledger[region] = 0; } }
            continue;
        }
        let given = 0;
        for (const region of regions){
            ledger[region] = Math.floor(ledger[region] * want / have);
            given += ledger[region];
        }
        // The rounding remainder, to the biggest holdings first.
        const order = regions.slice().sort((a,b) => ledger[b] - ledger[a]);
        for (let i = 0; given < want; i++, given++){ ledger[order[i % order.length]]++; }
    }
}

// Return storage provided by one region’s structures and stacks.
export function regionStorage(res, region, crateVal, conVal){
    const base = global.resource[res].regBase;
    const built = base && typeof base === 'object' ? (base[region] || 0) : 0;
    return regionBaseStorage(res, region) + built
         + (regCrates(res)[region] || 0) * crateVal + (regContainers(res)[region] || 0) * conVal;
}

// Return total base storage across active regions.
export function regionBaseTotal(res){
    let total = 0;
    for (const pool of supplyPools()){
        for (const region of poolRegions(pool)){
            total += regionBaseStorage(res, region);
        }
    }
    return total;
}

// Initialize a missing regional ledger from the global total.
export function ensureLedger(res){
    const reg = regLedger(res);
    for (const pool in reg){ return; }      // already has entries: it is the authority
    if (global.resource[res].amount){ splitByStorage(res); }
}

// Merge retired pool entries into their current supply pools.
function repool(res){
    const ledger = regLedger(res);
    for (const key in ledger){
        const pool = supplyPool(key);
        if (pool === key){ continue; }
        ledger[pool] = (ledger[pool] || 0) + ledger[key];
        delete ledger[key];
    }
}

// Trim each pool back to what it can hold. Overflow is lost exactly as a full store has always lost
// it — and since linked regions are one pool, linking is what stops it being lost.
export function clampPools(res){
    // Distribute pending resources after capacities are known.
    if (awaitingDeal(res) && capsKnown(res)){
        delete global.resource[res].regDeal;
        splitByStorage(res);
    }
    ensureLedger(res);
    repool(res);
    const reg = regLedger(res);
    for (const pool in reg){
        const cap = regMax(res, pool);
        if (cap >= 0 && reg[pool] > cap){ reg[pool] = cap; }
        if (reg[pool] < 0){ reg[pool] = 0; }
    }
    syncTotal(res);
}

// Draw a global cost from producing pools first, then largest reserves.
export function drawPools(res, amount){
    if (!(amount > 0) || !global.resource[res]){ return 0; }
    const reg = regLedger(res);
    const rates = regDiff(res);
    let left = amount;

    // Include only producing pools with available resources.
    let output = 0;
    const making = [];
    for (const pool in reg){
        if (rates[pool] > 0 && reg[pool] > 0){ making.push(pool); output += rates[pool]; }
    }
    if (output > 0){
        // Calculate producer shares from the original remaining cost.
        const owed = left;
        for (const pool of making){
            // Do not draw more than a pool holds.
            const take = Math.min(reg[pool], owed * (rates[pool] / output));
            if (take > 0){ reg[pool] -= take; left -= take; }
        }
    }

    if (left > 0){
        const order = Object.keys(reg).filter(pool => reg[pool] > 0).sort((a,b) => reg[b] - reg[a]);
        for (const pool of order){
            if (left <= 0){ break; }
            const take = Math.min(reg[pool], left);
            reg[pool] -= take;
            left -= take;
        }
    }

    syncTotal(res);
    return amount - left;
}

// --- Moving resources ----------------------------------------------------------------------------

// Add to (or take from) one pool, capped by what that pool can hold. Returns however much would not
// fit, so a caller can decide what becomes of the remainder.
export function poolMod(res, pool, val){
    // Global debits draw from all pools; global credits go to the capital.
    if (pool === ANYWHERE){
        if (val < 0){ return -(val + drawPools(res, -val)); }
        pool = supplyPool(CAPITAL);
    }
    const reg = regLedger(res);
    const have = reg.hasOwnProperty(pool) ? reg[pool] : 0;
    const cap = regMax(res, pool);
    let count = have + val;
    // Belt and braces alongside the guard in modRegRes: a pool that once holds a NaN holds it for
    // good, and takes the total down with it.
    if (Number.isNaN(count)){ return 0; }
    let spill = 0;
    if (count < 0){
        spill = count;      // more was asked for than the pool had
        count = 0;
    }
    else if (cap >= 0 && count > cap){
        spill = count - cap;
        count = cap;
    }
    reg[pool] = count;
    return spill;
}

// Base resource storage for each supply zone.
const REGION_BASE_STORAGE = {
    Food: 1000000,
    Lumber: 10000000,
    Chrysotile: 10000000,
    Stone: 10000000,
    Crystal: 10000000,
    Furs: 10000000,
    Copper: 10000000,
    Iron: 10000000,
    Aluminium: 10000000,
    Cement: 10000000,
    Coal: 10000000,
    Oil: 1000000,
    Uranium: 100000,
    Steel: 10000000,
    Titanium: 10000000,
    Alloy: 10000000,
    Polymer: 10000000,
    Iridium: 10000000,
    Helium_3: 1000000,
    Deuterium: 50000,
    Tungsten: 10000000,
    Neutronium: 1000000,
    Adamantite: 10000000,
    Infernite: 10000,
    Elerium: 1000,
    Nano_Tube: 10000000,
    Graphene: 10000000,
    Stanene: 10000000,
    Bolognium: 10000000,
    Unobtainium: 100000,
    Vitreloy: 10000000,
    Orichalcum: 10000000,
    Asphodel_Powder: 25000,
    Elysanite: 25000,
    Water: 25000,
};

export function regionBaseStorage(res, region){
    let base = REGION_BASE_STORAGE[res] || 0;
    if (region === CAPITAL){
        base *= 2; // Homeworld has double base storage capacity
    }
    if (global.tech['tp_depot']){
        base *= 1 + global.tech.tp_depot / 50;
    }
    return base;
}
