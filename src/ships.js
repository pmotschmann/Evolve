// Ship state, movement, fleet, repair, and logistics helpers.

import { global, p_on, webWorker } from './vars.js';
import { deepClone, powerModifier, modRes, messageQueue } from './functions.js';
import { traits, geneBonus } from './races.js';
import { atomic_mass } from './resources.js';
import { jobStack } from './jobs.js';
import { payCosts } from './actions.js';
import { spaceTech } from './space.js';
import { genXYZcoord, starData, dist3, nearestStar, orbitAngle, orbitPoint, rel, orbitDist, orbitEcc, orbitPeriod,
         starDetour } from './stars.js';
import { loc } from './locale.js';
import { supplyPool, supplyMode, supplyRegions, partitioned, regAmount, regDiff, poolMod, syncTotal } from './supply.js';
import { makePoint, retireShipFields, makeLeg } from './shipsave.js';
import { zEngage, syndicateMove, resolveBody, drawShips, updateCosts, tempCoord, tempParent, tempOffset, tempSystem,
         tauCetiModules, regionName } from './truepath.js';

// --- The ship ------------------------------------------------------------------------------------

function legsOf(ship){
    return ship && ship.movement && Array.isArray(ship.movement.legs) ? ship.movement.legs : [];
}

// Whether the ship is under way.
export function shipMoving(ship){
    return !!(ship && ship.movement);
}

// The world a ship is docked at, or last left while it is under way.
export function shipPort(ship){
    return ship && ship.location ? ship.location.id : undefined;
}

// The world a ship is docked at, or false while it is under way.
export function shipDockedAt(ship){
    return ship && !ship.movement && ship.location ? ship.location.id : false;
}

// Where the ship's journey ends, or false while it is docked.
export function shipDestination(ship){
    const legs = legsOf(ship);
    return legs.length ? legPlace(legs[legs.length - 1]) : false;
}

// Return the ship destination or docked world.
export function shipBound(ship){
    return shipMoving(ship) ? shipDestination(ship) : shipPort(ship);
}

// Where a ship under way will be `ahead` days from now along the leg it is flying — never past either end of.
export function shipPointAt(ship, ahead = 0){
    const legs = legsOf(ship);
    const from = ship && ship.movement ? ship.movement.from : false;
    if (!legs.length || !from){ return false; }
    const leg = legs[0];
    // Fraction of the leg still to run.
    let dist = leg.days > 0 ? (ship.movement.left - ahead) / leg.days : 0;
    if (!(dist >= 0)){ dist = 0; }
    else if (dist > 1){ dist = 1; }
    return {
        x: leg.to.x * (1 - dist) + from.x * dist,
        y: leg.to.y * (1 - dist) + from.y * dist,
        z: leg.to.z * (1 - dist) + from.z * dist
    };
}

// The ship's current point in space, or false when it has none.
export function shipPosition(ship){
    if (!ship){ return false; }
    return shipPointAt(ship) || ship.location || false;
}

// Where the current leg began, or false.
export function shipOrigin(ship){
    return ship && ship.movement && ship.movement.from ? ship.movement.from : false;
}

// Where the whole journey ends, as a point, or false.
export function shipDestinationPoint(ship){
    const legs = legsOf(ship);
    return legs.length ? legEnd(legs[legs.length - 1]) : false;
}

// The legs still to fly, first leg first. Empty when docked.
export function shipLegs(ship){
    return legsOf(ship);
}

// The leg being flown, or false.
export function shipLeg(ship){
    const legs = legsOf(ship);
    return legs.length ? legs[0] : false;
}

// Days left on the leg being flown; 0 when docked.
export function shipLegLeft(ship){
    return ship && ship.movement ? ship.movement.left : 0;
}

// Days the whole journey takes, counted from the start of the leg being flown; 0 when docked.
export function shipTripDays(ship){
    return legsOf(ship).reduce((total, leg) => total + leg.days, 0);
}

// Whether a ship is currently going through a wormhole.
export function shipInterstellar(ship){
    const leg = shipLeg(ship);
    return leg && legInGate(leg);
}

// --- Legs and planned trips ----------------------------------------------------------------------

export function makeTrip(legs, days){
    return { legs, days };
}

// The point a leg ends at.
export function legEnd(leg){
    return leg.to;
}

// The place a leg ends at: a world, a gate, or '' for a waypoint in open space.
export function legPlace(leg){
    return leg.to && typeof leg.to.id === 'string' ? leg.to.id : '';
}

// How many days a leg takes.
export function legDays(leg){
    return leg.days;
}

// Whether a leg is a jump through a wormhole.
export function legInGate(leg){
    return !!leg.gate;
}

// Whether a leg ends at a bend around a star rather than anywhere with a name.
export function legWaypoint(leg){
    return !!leg.wp;
}

export function tripLegs(trip){
    return trip.legs;
}

export function tripDays(trip){
    return trip.days;
}

// --- Writing ------------------------------------------------------------------------------------- Journeys.

// Bring a ship to rest at a world.
export function dockShip(ship, id, pos){
    delete ship.movement;
    retireShipFields(ship);
    ship.location = makePoint(pos, id);
}

// Set a ship off on a journey. `location` is left as it is: the world it last left.
export function launchShip(ship, from, legs, left){
    ship.movement = { from, legs, left };
    retireShipFields(ship);
}

// Move a docked ship's copy of its world's coordinates to where that world now is.
export function refreshDock(ship, pos){
    if (!ship.location){ return; }
    ship.location = makePoint(pos, ship.location.id);
}

// The fields that put a ship-like object at rest at a world, for building a stand-in docked somewhere.
export function dockedFields(id, pos){
    return { movement: undefined, location: makePoint(pos, id) };
}

// Make a ship's journey `factor` times quicker from here on.
export function hastenShip(ship, factor){
    if (!ship.movement){ return; }
    ship.movement.left /= factor;
    legsOf(ship).forEach(function(leg){ leg.days /= factor; });
}

// --- Hulls: armour and class ---------------------------------------------------------------------

// Share of a hit each armour lets through.
export const shipArmorSoak = { steel: 1, alloy: 0.75, neutronium: 0.5, aerographene: 0.75 };
export function shipArmorFactor(ship){
    return ship && shipArmorSoak.hasOwnProperty(ship.armor) ? shipArmorSoak[ship.armor] : 1;
}

// Aerographene stops as much as alloy while weighing next to nothing, so it is the one plating that makes a.
const AEROGRAPHENE_SPEED = 1.1;
// Exported so the tech that unlocks the plating advertises the same number the ships actually fly at.
export function aerographeneSpeedBonus(){
    return Math.round((AEROGRAPHENE_SPEED - 1) * 100);
}

// Share of a hit each hull size takes, smallest to largest.
export const shipClassSoak = {
    corvette: 1,
    frigate: 0.85,
    destroyer: 0.7,
    cruiser: 0.55,
    corsair: 0.55,
    battlecruiser: 0.4,
    dreadnought: 0.3
};
export function shipClassFactor(ship){
    return ship && shipClassSoak.hasOwnProperty(ship.class) ? shipClassSoak[ship.class] : 1;
}

// --- Ship motion ---------------------------------------------------------------------------------

// Keep a docked ship's coordinates on its world.
function placeShip(ship){
    if (!shipMoving(ship)){ refreshDock(ship, genXYZcoord(shipPort(ship))); }
}

// Return a ship's interpolated position without advancing its route.
export function shipPointAhead(ship, days){
    if (!shipMoving(ship) || !shipLeg(ship)){ return genXYZcoord(shipPort(ship)); }
    return shipPointAt(ship, days);
}

function burnShipFuel(ship, leg, days){
    // Enemy fleets keep their existing scripted movement and are not part of the player's logistics.
    if (ship.enemy){ return days; }
    const fuel = shipFuelUse(ship);
    if (!fuel.res){ return days; }
    ensureShipFuel(ship);
    if (legInGate(leg)){ return days; } // Wormhole travel is free.
    const usable = ship.fuel / fuel.burn;
    const moved = Math.min(days, usable);
    ship.fuel = Math.max(0, ship.fuel - moved * fuel.burn);
    ship.fueled = ship.fuel > 0;
    return moved;
}

// Fly `step` days of a journey.
export function advanceShip(ship, step){
    const move = ship.movement;
    while (move && move.legs.length > 0 && step > 0) {
        const leg = move.legs[0];
        const wanted = Math.min(step, move.left);
        const moved = wanted > 0 ? burnShipFuel(ship, leg, wanted) : 0;
        if (wanted > 0 && moved <= 0){ break; }
        move.left -= moved;
        step -= moved;
        if (wanted > 0 && moved + 0.000001 < wanted){ break; }
        if (move.left > 0.000001){ break; }
        // Reached either a jump gate or the final destination.
        if (move.legs.length === 1) {
            TPShipInitTransit(ship, legPlace(leg));
            break;
        }
        // Do not trigger encounters at route waypoints.
        if (ship.enemy && !legWaypoint(leg)) { zEngage(legPlace(leg), [ship]); }
        move.from = legEnd(leg);
        move.legs.shift();
        move.left = legDays(move.legs[0]);
    }
    placeShip(ship);
}

// Move every hull under way — yours and the horde's — by `step` days.
export function moveShips(step){
    if (global.space['shipyard'] && global.space.shipyard['ships']){
        for (let ship of global.space.shipyard.ships){
            if (shipMoving(ship)){ advanceShip(ship, step); }
        }
    }
    advanceTradeRoutes(step);
    advancePatrols();
    syndicateMove(step);
    if (global.race['zfleet'] && global.race.zfleet['s']){
        for (let ship of global.race.zfleet.s){
            if (shipMoving(ship)){ advanceShip(ship, step); }
        }
    }
}

export function buildTPShipQueue(action){
    // Template escorts wait until their flagship has completed.
    if (action.fleetBuild && !action.fleetBuild.flagship){
        let builds = global.space.shipyard.fleetBuilds;
        if (!builds || !Object.prototype.hasOwnProperty.call(builds, action.fleetBuild.id)){ return false; }
    }
    if (payCosts(action, action.cost)){
        buildTPShip(deepClone(action.bp), true, action.fleetBuild);
        return true;
    }
    return false;
}

// Put a ship at rest at a world: a new hull, a salvaged one, or one arriving at the end of its journey.
export function TPShipInitTransit(ship, locationName) {
    dockShip(ship, locationName, genXYZcoord(locationName));
}

// Return a freighter dock for a region or its supply zone.
function freightDock(region){
    return starData[resolveBody(region)] ? region : supplyPool(region);
}

export function repairSupplyFreighters(){
    if (!global.space?.shipyard?.ships){ return 0; }
    let repaired = 0;
    global.space.shipyard.ships.forEach(function(ship){
        if (!ship.supplyGrant){ return; }
        ship.special = 'extra_fuel';
// Old starter ships may have been saved against a retired pool name.
        if (ship.supplyDockFixed || shipMoving(ship)){ return; }
        const dock = freightDock(ship.supplyGrant);
        if (shipPort(ship) !== dock){
            TPShipInitTransit(ship, dock);
            ship.damage = ship.damage || 0;
            ship.fueled = ship.fueled || false;
            repaired++;
        }
        ship.supplyDockFixed = true;
    });
    return repaired;
}

export function grantSupplyFreighters(regions){
    if (global.race['supplyFreightersGranted'] || !global.space?.shipyard?.ships){ return 0; }
    let granted = 0;
    const routeOrigins = ['spc_home','spc_red','spc_gas','spc_gas'].filter(region => regions.includes(region));
    for (const region of routeOrigins){
        if (global.space.shipyard.ships.some(ship => ship.supplyGrant === region)){ continue; }
        const dock = freightDock(region);
        const ship = {
            class: 'freighter', power: 'diesel', armor: 'alloy', engine: 'vacuum', sensor: 'radar',
            weapon: 'none', special: 'extra_fuel', name: getRandomShipName(), cargo: {}, supplyGrant: region,
            damage: 0, fueled: true, fuel: 0
        };
        let suffix = 1, base = ship.name;
        while (global.space.shipyard.ships.some(existing => existing.name === ship.name)){
            ship.name = `${base} ${++suffix}`;
        }
        TPShipInitTransit(ship, dock);
        // Handed over ready to fly, like anything else off the slipway.
        ship.fuel = shipFuelTank(ship);
        ship.supplyDockFixed = true;
        global.space.shipyard.ships.push(ship);
        granted++;
    }
    global.race.supplyFreightersGranted = true;
    granted += seedStarterSupplyRoutes();
    if (granted > 0){ drawShips(); }
    return granted;
}

function addStarterRouteFreighter(starter, dock = 'spc_gas'){
    let ship = global.space.shipyard.ships.find(existing => existing.supplyRouteStarter === starter);
    if (ship){ return ship; }
    ship = {
        class: 'freighter', power: 'diesel', armor: 'alloy', engine: 'vacuum', sensor: 'radar',
        weapon: 'none', special: 'extra_fuel', name: getRandomShipName(), cargo: {}, supplyGrant: dock,
        supplyRouteStarter: starter, supplyDockFixed: true, damage: 0, fueled: true, fuel: 0
    };
    let suffix = 1, base = ship.name;
    while (global.space.shipyard.ships.some(existing => existing.name === ship.name)){
        ship.name = `${base} ${++suffix}`;
    }
    TPShipInitTransit(ship, dock);
    ship.fuel = shipFuelTank(ship);
    global.space.shipyard.ships.push(ship);
    return ship;
}

function startStarterSupplyRoute(ship, starter, stops){
    if (!ship || ship.supplyRouteStarter === starter && tradeRoute(ship)){ return true; }
    if (shipMoving(ship)){ return false; }
    ship.fuel = shipFuelTank(ship);
    ship.fueled = ship.fuel > 0;
    if (!startFreightRoute(ship, stops)){ return false; }
    ship.supplyRouteStarter = starter;
    return true;
}

// Seed the initial freighter trade routes.
export function seedStarterSupplyRoutes(){
    if (!global.space?.shipyard?.ships || supplyMode() !== 'regional'){ return 0; }
    if (global.race.supplyStarterRoutesSeeded){ return 0; }
    const ships = global.space.shipyard.ships;
    const routeOrigins = ['spc_home','spc_red','spc_gas','spc_gas'];
    if (global.race.supplyStarterFreighterCleanup !== 2){
        const retained = new Set();
        const starterIds = ['earth_titan_food_helium','mars_titan_food','jupiter_titan_fuel','jupiter_makemake_ceres'];
        starterIds.forEach(function(starter){
            const ship = ships.find(ship => ship.supplyRouteStarter === starter);
            if (ship){ retained.add(ship); }
        });
        routeOrigins.forEach(function(origin){
            const ship = ships.find(ship => ship.class === 'freighter' && ship.supplyGrant === origin && !ship.supplyRouteStarter);
            if (ship){ retained.add(ship); }
        });
        global.space.shipyard.ships = ships.filter(ship => !ship.supplyGrant || retained.has(ship));
        global.race.supplyStarterFreighterCleanup = 2;
    }
    const starters = global.space.shipyard.ships;
    const home = starters.find(ship => ship.class === 'freighter' && ship.supplyGrant === 'spc_home' && !ship.supplyRouteStarter)
        || addStarterRouteFreighter('earth_titan_food_helium', 'spc_home');
    const mars = starters.find(ship => ship.class === 'freighter' && ship.supplyGrant === 'spc_red' && !ship.supplyRouteStarter);
    const jupiter = starters.find(ship => ship.class === 'freighter' && ship.supplyGrant === 'spc_gas' && !ship.supplyRouteStarter);
    const outer = addStarterRouteFreighter('jupiter_makemake_ceres');
    const earthReady = startStarterSupplyRoute(home, 'earth_titan_food_helium', [
        { zone: 'spc_home', pickups: ['Food'] },
        { zone: 'spc_titan', pickups: [] }
    ]);
    const marsReady = startStarterSupplyRoute(mars, 'mars_titan_food', [
        { zone: 'spc_red', pickups: ['Food'] },
        { zone: 'spc_titan', pickups: [] },
        { zone: 'spc_gas', pickups: ['Oil','Helium_3'] },
    ]);
    const titanReady = startStarterSupplyRoute(jupiter, 'jupiter_titan_fuel', [
        { zone: 'spc_gas', pickups: ['Oil','Helium_3'] },
        { zone: 'spc_titan', pickups: [] }
    ]);
    const outerReady = startStarterSupplyRoute(outer, 'jupiter_makemake_ceres', [
        { zone: 'spc_gas', pickups: ['Oil'] },
        { zone: 'spc_makemake', pickups: ['Orichalcum','Uranium','Neutronium','Elerium'] },
        { zone: 'spc_dwarf', pickups: [] }
    ]);
    if (earthReady && marsReady && titanReady && outerReady){ global.race.supplyStarterRoutesSeeded = true; }
    return Number(earthReady) + Number(marsReady) + Number(titanReady) + Number(outerReady);
}

// Return the supply zone of the active shipyard.
export function shipyardZone(){
    return global.tech['resettle'] ? 'tau_gas2' : 'spc_dwarf';
}

// Provide a supply-aware payer for direct ship construction.
export function shipyardPayer(){
    return { id: 'tp-ship', supply(){ return shipyardZone(); } };
}

export function buildTPShip(ship, queue, fleetBuild){
    let locationName = shipyardZone();
    TPShipInitTransit(ship, locationName);
    // A queued Supply Ship may carry a fit that is no longer offered.
    if (ship.class === 'supply_ship' && !shipSpecialAllowed(shipSpecial(ship),ship.class)){
        ship.special = shipDefaultSpecial(ship.class);
    }

    ship.damage = 0;
// A hull leaves the yard fuelled.
    ship.fuel = shipFuelTank(ship);
    ship.fueled = true;

    if (ship.name.length === 0){
        ship.name = getRandomShipName();
    }

    let num = 1;
    let name = ship.name;
    while (global.space.shipyard.ships.filter(s => s.name === name).length > 0){
        num++;
        name = ship.name + ` ${num}`;
    }
    ship.name = name;

    global.space.shipyard.ships.push(ship);

    if (fleetBuild){
        let yard = global.space.shipyard;
        if (!yard.fleetBuilds || typeof yard.fleetBuilds !== 'object'){ yard.fleetBuilds = {}; }
        if (fleetBuild.flagship){
            yard.fleetBuilds[fleetBuild.id] = { fid: formFleet(ship) ? ship.fid : false };
        }
        else {
            let build = yard.fleetBuilds[fleetBuild.id];
            let flag = build && build.fid ? fleetFlagship(build.fid) : false;
            if (flag && !shipMoving(flag) && shipDockedAt(flag) === shipyardZone()){
                joinFleet(ship, build.fid);
            }
        }
    }

    drawShips();
    updateCosts();
    if (!queue){
        global.space.shipyard.blueprint.name = getRandomShipName();
    }
}

export function getRandomShipName(){
    let names = [
        'Trident','Spacewolf','Excalibur','Neptune','Deimos','Phobos','Enterprise','Intrepid','Daedalus','Odyssey','Endurance','Horizon','Hyperion',
        'Icarus','Aurora','Axiom','Nemesis','Normandy','Orion','Prometheus','Vanguard','Discovery','Voyager','Defiant','Titan','Liberty','Destiny',
        'Phoenix','Nautilus','Barracuda','Dolphin','Cuttlefish','Tiger Shark','Stingray','Swordfish','Triton','Dragon','Scorpion','Hagfish','Marlin',
        'Galileo','Raven','Sarcophagus','Excelsior','Scimitar','Vengeance','Nomad','Nova','Olympus','Aegis','Agamemnon','Charon','Achilles','Apollo',
        'Hermes','Hydra','Medusa','Talos','Zeus','Heracles','Cerberus','Acheron','Damocles','Juno','Persephone','Solaris','Victory','Hawk','Fury',
        'Razor','Stinger','Outrider','Falcon','Vulture','Nirvana','Retribution','Swordbreaker','Valkyrie','Athena','Avalon','Merlin','Argonaut','Serenity',
        'Gunstar','Ranger','Tantive','Cygnus','Nostromo','Reliant','Narcissus','Liberator','Sulaco','Infinity','Resolute','Wasp','Hornet','Independence',
        'Gilgamesh','Midway','Concordia','Goliath','Cosmos','Express','Tigers Claw','Oberon','Minnow','Majestic','Spartacus','Colossi','Vigilant',
        'Remorseless','Caelestis','Inquisitor','Atlas','Avenger','Dauntless','Nihilus','Thanatos','Stargazer','Xyzzy','Kraken','Xerxes','Spitfire',
        'McShipFace','Monitor','Merrimack','Constitution','Ghost','Pequod','Arcadia','Corsair','Inferno','Jenny','Revenge','Red October','Jackdaw',
        'Thorn','Caleuche','Valencia','Ourang','Deering','Baychimo','Octavius','Joyita','Lovibond','Celeste','Dutchman'
    ];

    let name = names[Math.rand(0, names.length)];
    if (global.space.shipyard.ships.filter(s => s.name === name).length > 0){
        name = randomWord();
    }

    return name;
}

function randomWord(){
    let syllables = [
        'al','an','ar','as','at','ea','ed','en','er','es','ha','he','hi','in','is','it','le','me','nd','ne','ng','nt','on','or','ou','re','se','st','te','th','ti','to','ve','wa',
        'all','and','are','but','ent','era','ere','eve','for','had','hat','hen','her','hin','his','ing','ion','ith','not','ome','oul','our','sho','ted','ter','tha','the','thi','tio','uld','ver','was','wit','you',
    ];
    let max = Math.rand(2, 5);

    let word = ``;
    for (let i=0; i<max; i++){
        word += syllables[Math.rand(0,syllables.length)];
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export function shipCrewSize(ship){
    switch (ship.class){
        case 'corvette':
            return global.race['grenadier'] ? jobStack(1) : jobStack(2);
        case 'frigate':
            return global.race['grenadier'] ? jobStack(2) : jobStack(3);
        case 'destroyer':
        case 'corsair':
            return global.race['grenadier'] ? jobStack(3) : jobStack(4);
        case 'cruiser':
            return global.race['grenadier'] ? jobStack(4) : jobStack(6);
        case 'battlecruiser':
            return global.race['grenadier'] ? jobStack(5) : jobStack(8);
        case 'dreadnought':
            return global.race['grenadier'] ? jobStack(6) : jobStack(10);
        case 'explorer':
            return global.race['grenadier'] ? jobStack(6) : jobStack(10);
        case 'freighter':
        // Supply Ships use light crew requirements.
        case 'supply_ship':
            return jobStack(1);
    }
}

// Share of a mount's draw that capacitor banks save.
const CAPACITOR_SAVING = 0.25;
// Exported so the tech that fits the banks advertises the same number the ships actually draw at.
export function shipCapacitorSaving(){
    return Math.round(CAPACITOR_SAVING * 100);
}

// What a weapon mount pulls from the reactor, capacitors included.
function weaponDraw(watts, use_inflate){
    let banks = global.tech['syard_capacitor'] ? 1 - CAPACITOR_SAVING : 1;
    return Math.round(watts * banks * use_inflate);
}

// Return reactor output, equipment draw, and net reserve for a ship design.
export function shipPowerStats(ship, wiki){
    let watts = 0;

    let out_inflate = 1;
    let use_inflate = 1;
    switch (ship.class){
        case 'frigate':
        case 'freighter':
            out_inflate = 1.1;
            use_inflate = 1.2;
            break;
        case 'destroyer':
            out_inflate = 1.5;
            use_inflate = 1.65;
            break;
        case 'cruiser':
            out_inflate = 2;
            use_inflate = 2.5;
            break;
        case 'battlecruiser':
            out_inflate = 2.5;
            use_inflate = 3.5;
            break;
        case 'dreadnought':
            out_inflate = 5;
            use_inflate = 6.5;
            break;
        case 'explorer':
            out_inflate = 6;
            use_inflate = 2;
            break;
        // Supply Ship power use.
        case 'supply_ship':
            out_inflate = 2.25;
            use_inflate = 2;
            break;
    }

    switch (ship.power){
        case 'solar':
            watts = Math.round(50 * out_inflate);
            break;
        case 'diesel':
            watts = Math.round(100 * out_inflate);
            break;
        case 'fission':
            watts = Math.round(150 * out_inflate);
            break;
        case 'fusion':
            watts = Math.round((ship.class === 'explorer' || wiki ? 174 : 175) * out_inflate);
            break;
        case 'elerium':
            watts = Math.round(200 * out_inflate);
            break;
        case 'antimatter':
            watts = Math.round(250 * out_inflate);
            break;
    }

    watts = Math.round(Math.max(watts, powerModifier(watts)));
    const output = watts;

    switch (ship.weapon){
        case 'railgun':
            watts -= weaponDraw(10, use_inflate);
            break;
        case 'laser':
            watts -= weaponDraw(30, use_inflate);
            break;
        case 'p_laser':
            watts -= weaponDraw(18, use_inflate);
            break;
        case 'plasma':
            watts -= weaponDraw(50, use_inflate);
            break;
        case 'phaser':
            watts -= weaponDraw(65, use_inflate);
            break;
        case 'disruptor':
            watts -= weaponDraw(100, use_inflate);
            break;
        case 'gauss':
            watts -= weaponDraw(150, use_inflate);
            break;
    }

    watts -= Math.round((shipSpecialPower[shipSpecial(ship)] || 0) * use_inflate);

    switch (ship.engine){
        case 'ion':
            watts -= Math.round((global.tech.syard_engine >= 6 ? 18 : 25) * use_inflate);
            break;
        case 'tie':
            watts -= Math.round((global.tech.syard_engine >= 6 ? 36 : 50) * use_inflate);
            break;
        case 'pulse':
            watts -= Math.round((global.tech.syard_engine >= 6 ? 25 : 40) * use_inflate);
            break;
        case 'photon':
            watts -= Math.round((global.tech.syard_engine >= 6 ? 50 : 75) * use_inflate);
            break;
        case 'vacuum':
            watts -= Math.round((global.tech.syard_engine >= 6 ? 75 : 120) * use_inflate);
            break;
        case 'emdrive':
            watts -= Math.round((ship.class !== 'explorer' && !wiki ? 1024 : 515) * use_inflate);
            break;
        case 'electrokinetic':
            watts -= Math.round((global.tech.syard_engine >= 6 ? 100 : 140) * use_inflate);
            break;
    }

    const sensorDraw = improvedSensors() ? 1 - sensorUpgrade.powerCut : 1;
    switch (ship.sensor){
        case 'radar':
            watts -= Math.round(10 * sensorDraw * use_inflate);
            break;
        case 'lidar':
            watts -= Math.round(25 * sensorDraw * use_inflate);
            break;
        case 'quantum':
            watts -= Math.round(75 * sensorDraw * use_inflate);
            break;
    }

    return {
        output: output,
        draw: output - watts,
        balance: watts
    };
}

// Return net reserve; negative values exceed reactor capacity.
export function shipPower(ship, wiki){
    return shipPowerStats(ship, wiki).balance;
}

// --- Ship weapons ------------------------------------------------------------------------------- In unlock.
const shipWeapons = ['railgun','laser','p_laser','plasma','phaser','disruptor','gauss'];

// Whether the Explorer hull and the emdrive engine are still on offer in the yard.
export function explorerRetired(){
    if (global.tech['resettle']){ return true; }
    return global.tech['tau_home'] && global.tech.tau_home >= 2 ? true : false;
}

// --- The special slot ---------------------------------------------------------------------------
const shipSpecials = ['none','massdriver','extra_fuel','extra_cargo','extra_thruster','mobile_storage','fuel_tanker','repair_ship'];
const freighterSpecials = ['extra_fuel','extra_cargo','extra_thruster'];
// A Supply Ship is nothing but the fit it carries, so its slot is never empty.
export const supplyShipSpecials = ['mobile_storage','fuel_tanker','repair_ship'];

// Ships allowed to carry mass drivers
const massDriverHulls = ['cruiser','battlecruiser','dreadnought'];
export function shipSpecialAllowed(special,shipClass){
    // Mobile Storage stocks a supply zone, so it is not offered until the zones exist.
    if (special === 'mobile_storage' && supplyMode() === 'global'){ return false; }
    if (supplyShipSpecials.includes(special)){ return shipClass === 'supply_ship'; }
    // Supply Ships require a supported fit.
    if (shipClass === 'supply_ship'){ return false; }
    if (special === 'massdriver'){ return massDriverHulls.includes(shipClass); }
    if (freighterSpecials.includes(special)){ return shipClass === 'freighter'; }
    return special === 'none';
}

// What a hull falls back to when its current special does not fit it — a class change in the yard, or a.
export function shipDefaultSpecial(shipClass){
    if (shipClass !== 'supply_ship'){ return 'none'; }
    return shipSpecialAllowed('mobile_storage',shipClass) ? 'mobile_storage' : 'fuel_tanker';
}

// --- Hull slots ---------------------------------------------------------------------------------
// Ship parts in shipyard unlock order.
export const shipParts = {
    class: ['corvette','frigate','destroyer','cruiser','battlecruiser','dreadnought','freighter','explorer','supply_ship'],
    power: ['solar','diesel','fission','fusion','elerium','antimatter'],
    weapon: shipWeapons,
    armor : ['steel','alloy','neutronium','aerographene'],
    engine: ['ion','tie','pulse','photon','vacuum','emdrive','electrokinetic'],
    sensor: ['visual','radar','lidar','quantum'],
    special: shipSpecials,
};

// Refit-capable parts; class changes require a different hull.
export const refitParts = ['power','weapon','armor','engine','sensor','special'];

// Return whether a part is currently available for this hull class.
export function shipPartAvailable(part, idx, value, shipClass){
    if (explorerRetired() && value === 'emdrive'){ return false; }
    // Check shipyard availability for each hull class.
    if (part === 'class'){
        if (explorerRetired() && value === 'explorer'){ return false; }
        if (value === 'freighter'){ return global.tech['shadow'] >= 5; }
        // Supply Ships use their dedicated technology unlock.
        if (value === 'supply_ship'){ return global.tech['syard_supply'] ? true : false; }
        if (global.tech['tauceti'] && value === 'explorer'){ return true; }
        return global.tech['syard_class'] > idx ? true : false;
    }
    if (part === 'special'){
        // Supply Ship fits do not require special-slot technology.
        if (shipClass === 'supply_ship'){ return supplyShipSpecials.includes(value) && shipSpecialAllowed(value,shipClass); }
        if (shipClass === 'freighter'){ return freighterSpecials.includes(value); }
        // Do not offer specials unsupported by this hull.
        if (!shipSpecialAllowed(value,shipClass)){ return false; }
        return global.tech['syard_special'] ? true : false;
    }
    if (part === 'engine' && global.tech['tauceti'] && value === 'emdrive'){ return true; }
    if (shipClass === 'explorer'){
        if (part === 'weapon'){ return idx === 1; }
        if (part === 'engine'){ return idx === 6; }
        if (part === 'sensor'){ return idx === 4; }
    }
    return global.tech[`syard_${part}`] > idx ? true : false;
}

// Return whether this hull exposes the requested refit slot.
export function shipSlotOpen(part, shipClass){
    // Freighters and Supply Ships have no weapon slot.
    if (part === 'weapon'){ return shipClass !== 'freighter' && shipClass !== 'supply_ship'; }
    if (part === 'special'){ return shipClass === 'freighter' || shipClass === 'supply_ship' || global.tech['syard_special'] ? true : false; }
    return true;
}

// What special a ship has equipped.
const shipSpecialSet = new Set(shipSpecials);
export function shipSpecial(ship){
    return ship && ship.special && shipSpecialSet.has(ship.special) ? ship.special : 'none';
}

// Power a special mount draws.
const shipSpecialPower = {
    none: 0, massdriver: 325,
    extra_fuel: 0, extra_cargo: 0, extra_thruster: 0,
    mobile_storage: 0, fuel_tanker: 0, repair_ship: 0
};

// --- Orbital bombardment ------------------------------------------------------------------------
const shipBombardRating = { cruiser: 500, battlecruiser: 900, dreadnought: 2000 };

// The bombardment rating of a single hull, or 0 for anything not carrying a mass driver.
export function shipBombardPower(ship){
    if (!ship || shipSpecial(ship) !== 'massdriver'){ return 0; }
    if (!shipSpecialAllowed('massdriver',ship.class)){ return 0; }
    return shipBombardRating.hasOwnProperty(ship.class) ? shipBombardRating[ship.class] : 0;
}

export function shipAttackPower(ship){
    let rating = 0;
    switch (ship.weapon){
        case 'railgun':
            rating = 36;
            break;
        case 'laser':
            rating = 64;
            break;
        case 'p_laser':
            rating = 54;
            break;
        case 'plasma':
            rating = 90;
            break;
        case 'phaser':
            rating = 114;
            break;
        case 'disruptor':
            rating = 156;
            break;
        case 'gauss':
            rating = 210;
            break;
    }

    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
        rating = Math.round(rating * 1.25);
    }

    // An escort shoots better under a flagship that knows how to lead one (see fleetHulls).
    let led = fleetDamageBonus(ship);
    if (led > 0){
        rating = Math.round(rating * (1 + led));
    }

    switch (ship.class){
        case 'corvette':
            return rating;
        case 'frigate':
            return Math.round(rating * 1.5);
        case 'destroyer':
        case 'corsair':
            return Math.round(rating * 2.75);
        case 'cruiser':
            return Math.round(rating * 5.5);
        case 'battlecruiser':
            return Math.round(rating * 10);
        case 'dreadnought':
            return Math.round(rating * 22);
        case 'explorer':
            return Math.round(rating * 1.2);
        // Return zero firepower for unarmed hulls.
        case 'freighter':
        case 'supply_ship':
            return 0;
        // Rate unlisted hulls from their equipped weapon.
        default:
            return rating;
    }
}

export const FREIGHTER_CAPACITY = 1000000;
export function freightCapacity(ship){
    let cap = ship && ship.class === 'freighter' && shipSpecial(ship) === 'extra_cargo'
        ? Math.round(FREIGHTER_CAPACITY * 1.5) : FREIGHTER_CAPACITY;
    if (global.race['pack_rat']){
        cap *= 1 + (traits.pack_rat.vars()[1] / 100);
    }
    return cap;
}
export function freightCargo(ship){
    if (!ship || ship.class !== 'freighter'){ return {}; }
    if (!ship.cargo || typeof ship.cargo !== 'object'){ ship.cargo = {}; }
// Sum discrete cargo without allocating an Object.keys array.
    for (const res in ship.cargo){
        const held = ship.cargo[res];
        const amount = Math.floor(Number(held) || 0);
        if (amount <= 0){ delete ship.cargo[res]; }
        else if (amount !== held){ ship.cargo[res] = amount; }
    }
    return ship.cargo;
}
export function freightLoad(ship){
    const cargo = freightCargo(ship);
    let total = 0;
    for (const res in cargo){ total += Number(cargo[res]) || 0; }
    return total;
}
export function freightWeight(ship){
    const cargo = freightCargo(ship);
    let total = 0;
    for (const res in cargo){ total += (atomic_mass[res] || 0) * (Number(cargo[res]) || 0); }
    return total;
}
export function freightSpeedPenalty(ship){
    if (!ship || ship.class !== 'freighter'){ return 0; }
    const penalty = Math.floor(freightWeight(ship) / 1750000);
    return shipSpecial(ship) === 'extra_thruster' ? penalty / 2 : penalty;
}

// Remaining whole days to a ship's final destination, including any later jump-gate legs.
export function shipArrivalTime(ship){
    const leg = shipLeg(ship);
    if (!shipMoving(ship) || !leg){ return 0; }
    return Math.max(0, Math.round((shipTripDays(ship) || 0) - ((legDays(leg) || 0) - (shipLegLeft(ship) || 0))));
}

export function shipSpeed(ship){
    let mass = 1;
    switch (ship.class){
        case 'corvette':
            mass = global.tech['syard_mass'] ? (ship.armor === 'neutronium' ? 1 : 0.95) : ship.armor === 'neutronium' ? 1.1 : 1;
            break;
        case 'frigate':
        case 'freighter':
            mass = global.tech['syard_mass'] ? (ship.armor === 'neutronium' ? 1.12 : 1.1) : ship.armor === 'neutronium' ? 1.35 : 1.25;
            break;
        case 'destroyer':
        case 'corsair':
            mass = global.tech['syard_mass'] ? (ship.armor === 'neutronium' ? 1.25 : 1.2) : ship.armor === 'neutronium' ? 1.95 : 1.8;
            break;
        case 'cruiser':
            mass = global.tech['syard_mass'] ? (ship.armor === 'neutronium' ? 1.75 : 1.5) : ship.armor === 'neutronium' ? 3.5 : 3;
            break;
        case 'battlecruiser':
            mass = global.tech['syard_mass'] ? (ship.armor === 'neutronium' ? 2.4 : 2) : ship.armor === 'neutronium' ? 4.8 : 4;
            break;
        // Supply Ship mass class.
        case 'supply_ship':
            mass = global.tech['syard_mass'] ? (ship.armor === 'neutronium' ? 2.05 : 1.75) : ship.armor === 'neutronium' ? 4.15 : 3.5;
            break;
        case 'dreadnought':
            mass = global.tech['syard_mass'] ? (ship.armor === 'neutronium' ? 3.5 : 3) : (ship.armor === 'neutronium' ? 7.5 : 6);
            break;
        case 'explorer':
            mass = 1;
            break;
    }
    if (ship.armor === 'aerographene'){ mass /= AEROGRAPHENE_SPEED; }

    // Featherlight: avian hulls are built lighter than anyone else's.
    mass /= geneBonus('featherlight');

    let boost = 1;
    // A mass relay pushes only what launches from it.
    switch (shipDockedAt(ship) || ""){
        case 'spc_dwarf':
            boost = p_on['m_relay'] && global.space['m_relay'] && !global.tech['resettle'] && global.space.m_relay.charged >= 10000 ? 3 : 1;
            break;
        case 'tau_gas2':
            boost = p_on['tcm_relay'] && global.tauceti['tcm_relay'] && global.tauceti.tcm_relay.charged >= 10000 ? 3 : 1;
            break;
        default:
            boost = 1;
            break;
    }
// Apply a light-flagship speed bonus to the fleet.
    boost *= 1 + fleetSpeedBonus(ship);
    let speed;
    switch (ship.engine){
        case 'ion':
            speed = (global.tech.syard_engine >= 6 ? 30 : 12) / mass * boost;
            break;
        case 'tie': speed = (global.tech.syard_engine >= 6 ? 55 : 22) / mass * boost; break;
        case 'pulse': speed = (global.tech.syard_engine >= 6 ? 45 : 18) / mass * boost; break;
        case 'photon': speed = (global.tech.syard_engine >= 6 ? 75 : 30) / mass * boost; break;
        case 'vacuum': speed = (global.tech.syard_engine >= 6 ? 105 : 42) / mass * boost; break;
        case 'emdrive': speed = 37500 / mass * boost; break;
        case 'electrokinetic': speed = (global.tech.syard_engine >= 6 ? 140 : 56) / mass * boost; break;
    }
    return ship.class === 'freighter' ? speed * Math.max(0.25, 1 - freightSpeedPenalty(ship) / 100) : speed;
}

export function shipFuelUse(ship){
    let res = false;
    let burn = 0;

    switch (ship.power){
        case 'diesel':
            res = 'Oil';
            burn = 8;
            break;
        case 'fission':
            res = 'Uranium';
            burn = 0.5;
            break;
        case 'fusion':
            res = 'Helium_3';
            burn = 12;
            break;
        case 'elerium':
            res = 'Elerium';
            burn = 1;
            break;
        case 'antimatter':
            res = 'Positronium';
            burn = 0.05;
            break;
    }

    switch (ship.class){
        case 'frigate':
            burn *= 1.25;
            break;
        case 'destroyer':
        case 'corsair':
            burn *= 1.5;
            break;
        case 'cruiser':
            burn *= 2;
            break;
        case 'battlecruiser':
            burn *= 3;
            break;
        case 'dreadnought':
            burn *= 5;
            break;
        case 'explorer':
            burn *= 25;
            break;
        case 'freighter':
            burn *= 1.25;
            break;
        case 'supply_ship':
            burn *= 2.5;
            break;
    }

    return {
        res: res,
        burn: +(burn).toFixed(2)
    };
}

// Ships consume onboard fuel only while traveling.
const shipFuelRange = 250;
const explorerFuelRange = 800000;
// Fuel Tankers carry an expanded reserve for other ships.
export const tankerFuelRange = 500;
// The reserve it carries for everyone else, in AU of its own burn per fuel type.
const tankerStoreRange = 1000;
const solarRanges = { M: 50, K: 75, G: 100, F: 125, A: 150, B: 200, O: 250 };
const globalRefuelExceptions = ['spc_eris', 'spc_triton', 'spc_trition', 'spc_sun'];

// Whether a hull is a Supply Ship carrying a given fit.
export function supplyShipMode(ship, mode){
    return ship && ship.class === 'supply_ship' && shipSpecial(ship) === mode ? true : false;
}

export function shipFuelTank(ship){
    const fuel = shipFuelUse(ship);
    if (!fuel.res || fuel.burn <= 0){ return 0; }
    const auPerDay = shipSpeed(ship) / 225;
    const range = ship.class === 'explorer' ? explorerFuelRange
        : (supplyShipMode(ship,'fuel_tanker') ? tankerFuelRange : shipFuelRange);
    const stock = auPerDay > 0 ? fuel.burn * range / auPerDay : 0;
    // Freighters trade half their stock tank for cargo space unless fitted with Extra Fuel.
    return Math.round(ship.class === 'freighter' && shipSpecial(ship) !== 'extra_fuel' ? stock / 2 : stock);
}

// --- Mobile Storage ----------------------------------------------------------------------------- Base.
export const supplyShipElerium = 100;

// Deployed Supply Ships provide storage to their supply pool.

// Deployed hulls, keyed by supply pool.
export function deployedSupply(pool){
    if (!global.race['supply_deployed']){ global.race['supply_deployed'] = {}; }
    if (pool === undefined){ return global.race.supply_deployed; }
    if (!Array.isArray(global.race.supply_deployed[pool])){ global.race.supply_deployed[pool] = []; }
    return global.race.supply_deployed[pool];
}

export function deployedSupplyCount(pool){
    return deployedSupply(pool).length;
}

// Ships sitting at a world in this pool that could be put to work here.
export function deployableSupply(pool){
    const ships = global.space.shipyard?.ships || [];
    return ships.filter(function(s){
        const at = shipDockedAt(s);
        return supplyShipMode(s,'mobile_storage') && at && supplyPool(at) === pool;
    });
}

// Take one out of service and add it to the zone.
export function deploySupplyShip(ship){
    if (!supplyShipMode(ship,'mobile_storage') || !shipDockedAt(ship)){ return false; }
    const idx = global.space.shipyard.ships.indexOf(ship);
    if (idx < 0){ return false; }
    const pool = supplyPool(shipDockedAt(ship));
    // Remove deployed ships from their fleet and crew roster.
    leaveFleet(ship);
    if (!shipManned(ship)){
        global.civic.garrison.crew -= shipCrewSize(ship);
        if (global.civic.garrison.crew < 0){ global.civic.garrison.crew = 0; }
    }
    global.space.shipyard.ships.splice(idx,1);
    deployedSupply(pool).push(deepClone(ship));
    drawShips();
    return true;
}

// Put one back on the roster.
export function undeploySupplyShip(pool){
    const parked = deployedSupply(pool);
    if (!parked.length){ return false; }
    const ship = parked.pop();
    // Return undeployed ships to their pool homeworld.
    TPShipInitTransit(ship, supplyPoolHome(pool));
    ship.damage = ship.damage || 0;
    if (!shipManned(ship)){ global.civic.garrison.crew += shipCrewSize(ship); }
    global.space.shipyard.ships.push(ship);
    drawShips();
    return true;
}

// Return the homeworld for an undeployed supply pool.
function supplyPoolHome(pool){
    if (starData[pool]){ return pool; }
    const regions = supplyRegions().filter(region => supplyPool(region) === pool && starData[region]);
    return regions.length ? regions[0] : 'spc_home';
}

// --- Fuel Tankers ------------------------------------------------------------------------------- The.
const tankerFuels = ['Oil','Uranium','Helium_3','Elerium','Positronium'];
const tankerPlants = { Oil: 'diesel', Uranium: 'fission', Helium_3: 'fusion', Elerium: 'elerium', Positronium: 'antimatter' };

export function tankerStoreMax(ship, res){
    if (!supplyShipMode(ship,'fuel_tanker') || !tankerPlants[res]){ return 0; }
    const auPerDay = shipSpeed(ship) / 225;
    if (!(auPerDay > 0)){ return 0; }
    // Calculate tanker reserves from the specified fuel type.
    const burn = shipFuelUse({ class: 'supply_ship', power: tankerPlants[res] }).burn;
    return Math.round(burn * tankerStoreRange / auPerDay);
}

// The reserve itself, created on demand and trimmed to whatever the current maxima are.
export function tankerStore(ship){
    if (!supplyShipMode(ship,'fuel_tanker')){ return false; }
    if (!ship.tanker || typeof ship.tanker !== 'object'){ ship.tanker = {}; }
    tankerFuels.forEach(function(res){
        const cap = tankerStoreMax(ship, res);
        const held = Number(ship.tanker[res]);
        // Initialize a new tanker reserve at capacity.
        ship.tanker[res] = Math.max(0, Math.min(cap, Number.isFinite(held) ? held : cap));
    });
    return ship.tanker;
}

// Every tanker parked at a world, for the ships sitting there with it.
function tankersAt(locationName){
    const ships = global.space.shipyard?.ships || [];
    return ships.filter(s => supplyShipMode(s,'fuel_tanker') && shipDockedAt(s) === locationName);
}

// One day's work for every tanker: top up what is docked alongside it, out of its reserve.
export function tankerRefuel(){
    const ships = global.space.shipyard?.ships || [];
    for (const ship of ships){
        if (shipDockedAt(ship) === false){ continue; }
        if (supplyShipMode(ship,'fuel_tanker')){ continue; }
        const fuel = shipFuelUse(ship);
        if (!fuel.res || !tankerPlants[fuel.res]){ continue; }
        let want = shipFuelTank(ship) - shipFuelAmount(ship);
        if (want <= 0){ continue; }
        for (const tanker of tankersAt(shipDockedAt(ship))){
            if (want <= 0){ break; }
            const store = tankerStore(tanker);
            const give = Math.min(want, store[fuel.res] || 0);
            if (give <= 0){ continue; }
            store[fuel.res] -= give;
            ship.fuel += give;
            ship.fueled = ship.fuel > 0;
            want -= give;
        }
    }
}

// `tank` may be passed by a caller that already has it, since working it out walks the shipyard.
function ensureShipFuel(ship, tank){
    const fuel = shipFuelUse(ship);
    if (!fuel.res){
        delete ship.fuel;
        ship.fueled = true;
        return 0;
    }
    if (tank === undefined){ tank = shipFuelTank(ship); }
    if (!Number.isFinite(ship.fuel)){
        // Existing saves had no tank. Keep operational ships operational, but leave salvaged wrecks dry.
        ship.fuel = ship.damage >= 75 && !ship.fueled ? 0 : tank;
    }
    ship.fuel = Math.max(0, Math.min(tank, ship.fuel));
    ship.fueled = ship.fuel > 0;
    return ship.fuel;
}

export function shipFuelAmount(ship){ return ensureShipFuel(ship); }

function fuelAtLocation(res, location){
    if (!global.resource[res]){ return 0; }
    // Use global stock for fuels without regional storage.
    return partitioned(res) ? regAmount(res, supplyPool(location)) : global.resource[res].amount;
}

function locationProducesFuelAt(ship, location){
    const fuel = shipFuelUse(ship);
    if (!fuel.res || !location){ return false; }
    if (partitioned(fuel.res)){
        return (regDiff(fuel.res)[supplyPool(location)] || 0) > 0;
    }
    // Any valid dock can refuel globally stored fuel.
    const body = starData[location];
    return !!body && !body.startype && !globalRefuelExceptions.includes(location)
        && !(global.tech?.resettle && location === 'spc_home');
}

function locationProducesFuel(ship){
    return !!ship && !shipMoving(ship) && locationProducesFuelAt(ship, shipPort(ship));
}

export function canAutoRefuelAt(ship, location){ return locationProducesFuelAt(ship, location); }

function fillShipTank(ship){
    const fuel = shipFuelUse(ship);
    if (!fuel.res){ ensureShipFuel(ship); return 0; }
    ensureShipFuel(ship);
    const need = Math.max(0, shipFuelTank(ship) - ship.fuel);
    const taken = Math.min(need, fuelAtLocation(fuel.res, shipPort(ship)));
    if (taken > 0){
        modRes(fuel.res, -taken, false, shipPort(ship));
        ship.fuel += taken;
    }
    ship.fueled = ship.fuel > 0;
    return taken;
}

// Called by the main tick for docked ships.
export function autoRefuelShip(ship){
    if (!ship || shipMoving(ship) || !locationProducesFuel(ship)){ return false; }
    const taken = fillShipTank(ship);
    return taken > 0 ? { res: shipFuelUse(ship).res, at: shipPort(ship), taken } : false;
}

export function canManuallyRefuel(ship){
    const fuel = shipFuelUse(ship);
    return !!(ship && !shipMoving(ship) && fuel.res && !locationProducesFuel(ship)
        && fuelAtLocation(fuel.res, shipPort(ship)) > 0 && shipFuelAmount(ship) < shipFuelTank(ship));
}

export function manuallyRefuelShip(ship){
    return canManuallyRefuel(ship) ? fillShipTank(ship) : 0;
}

function solarPoweredAlong(start, end){
    const distance = dist3(start, end);
    const samples = Math.max(1, Math.ceil(distance / 5));
    for (let i = 0; i <= samples; i++){
        const t = i / samples;
        const point = { x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t, z: start.z + (end.z - start.z) * t };
        const nearest = nearestStar(point);
        const star = starData[nearest];
        if (!star || dist3(point, genXYZcoord(nearest)) > (solarRanges[(star.startype || '').charAt(0)] || 0)){ return false; }
    }
    return true;
}

function shipTripFuel(ship, trip){
    const fuel = shipFuelUse(ship);
    if (!fuel.res){
        let from = shipPosition(ship);
        for (const leg of tripLegs(trip)){
            if (!legInGate(leg) && !solarPoweredAlong(from, legEnd(leg))){ return Infinity; }
            from = legEnd(leg);
        }
        return 0;
    }
    return tripLegs(trip).reduce((total, leg) => total + (legInGate(leg) ? 0 : legDays(leg) * fuel.burn), 0);
}

export function shipCanMakeTrip(ship, trip){
    return !!trip && shipTripFuel(ship, trip) <= shipFuelAmount(ship) + 0.000001;
}

export function tradeFleet(ship){
    const fleet = shipFleet(ship);
    return fleet.length ? fleet : [ship];
}
export function tradeFreighters(group){ return group.filter(ship => ship.class === 'freighter'); }
function tradeRoute(ship){
    if (!ship || !ship.tradeRoute || !Array.isArray(ship.tradeRoute.stops) || ship.tradeRoute.stops.length <= 1){ return false; }
    // Replace unreachable legacy stops with their supply pool.
    ship.tradeRoute.stops.forEach(function(stop){
        if (stop && stop.zone && !starData[resolveBody(stop.zone)]){ stop.zone = supplyPool(stop.zone); }
    });
    return ship.tradeRoute;
}
function setTradeRoute(group, route){ group.forEach(ship => { ship.tradeRoute = deepClone(route); }); }
function clearTradeRoute(group){ group.forEach(ship => { delete ship.tradeRoute; }); }
// Use the earliest shipyard entry as a stable fleet route leader.
export function tradeLeader(group){
    if (group.length <= 1){ return group[0]; }
    const ships = global.space.shipyard.ships;
    let best = group[0], bestAt = ships.indexOf(best);
    for (let i=1; i<group.length; i++){
        const at = ships.indexOf(group[i]);
        if (at < bestAt){ best = group[i]; bestAt = at; }
    }
    return best;
}

// --- Patrol routes --------------------------------------------------------------------------------- A.

// Patrols need Sector Command, whose completion raises syard_fleet to 4.
export function patrolsUnlocked(){
    return global.tech['syard_fleet'] && global.tech.syard_fleet >= 4 ? true : false;
}

export function shipPatrol(ship){
    return ship && ship.patrol && Array.isArray(ship.patrol.stops) && ship.patrol.stops.length > 0 ? ship.patrol : false;
}

function setPatrol(group, patrol){ group.forEach(ship => { ship.patrol = deepClone(patrol); }); }
function clearPatrol(group){ group.forEach(ship => { delete ship.patrol; }); }
function setPatrolIndex(group, index){ group.forEach(ship => { if (ship.patrol){ ship.patrol.index = index; } }); }

// Send a patrolling fleet on to its next stop.
export function advancePatrol(group){
    const lead = tradeLeader(group);
    const patrol = shipPatrol(lead);
    if (!patrol || group.some(shipMoving)){ return false; }
    // Pause patrol movement while pursuing a corsair.
    if (patrol.chase){ return false; }
    // Wait at repair yards until every patrol ship is repaired.
    if (atShipyard(lead) && group.some(s => s.damage > 0)){ return false; }
    const id = global.space.shipyard.ships.indexOf(lead);
    if (id < 0){ return false; }

    const stops = patrol.stops;
    let at = typeof patrol.index === 'number' ? patrol.index : -1;
    for (let i=0; i<stops.length; i++){
        const next = (at + 1) % stops.length;
        // Continue from the route stop matching the current location.
        if (stops[next] === shipPort(lead)){
            at = next;
            setPatrolIndex(group, next);
            continue;
        }
        if (!sendShipTo(id, stops[next], true)){ return false; }
        setPatrolIndex(group, next);
        return true;
    }
    return false;
}

// Put a fleet onto a patrol and send it to its next stop.
export function startPatrol(ship, stops){
    if (!patrolsUnlocked() || !ship || !Array.isArray(stops) || stops.length === 0){ return false; }
    const group = tradeFleet(ship);
    // Replace freight routing with patrol routing.
    clearTradeRoute(group);
    setPatrol(group, { stops: stops.slice(), index: -1 });
    // Start immediately unless the fleet is already in transit.
    if (group.some(shipMoving)){ return true; }
    if (!advancePatrol(group)){
        clearPatrol(group);
        return false;
    }
    return true;
}

export function stopPatrol(ship){
    const group = tradeFleet(ship);
    if (!group.some(shipPatrol)){ return false; }
    clearPatrol(group);
    drawShips();
    return true;
}

// One pass per tick: every patrolling fleet sitting at a stop moves off to the next one.
function advancePatrols(){
    const ships = global.space.shipyard?.ships || [];
    const seen = new Set();
    for (const ship of ships){
        if (seen.has(ship) || !shipPatrol(ship)){ continue; }
        const group = tradeFleet(ship);
        group.forEach(member => seen.add(member));
        if (group.some(shipMoving)){ continue; }
        advancePatrol(group);
    }
}

// The fleet's slowest hull as it would stand at `from`, ready to launch.
function paceAt(group, from){
    const pace = fleetPace(group);
    if (!pace){ return false; }
    return Object.assign(deepClone(pace), dockedFields(from, genXYZcoord(from)));
}

// Cached route legs, keyed by the pace they were planned at.
const legCacheDays = 5;
const legCache = { at: 0, day: -Infinity, paceDay: false, map: new Map(), pace: new Map() };

// Return the cache window in simulated days.
function legCacheWindow(){
    return legCacheDays * (webWorker.offline ? Math.max(1, webWorker.offlineScale) : 1);
}

// A fleet's pace for a leg starting at `from`, cached for the current simulated day.
function legSpeed(group, from){
    const head = group && group.length ? group[0] : false;
    if (!head){ return 0; }
    let known = legCache.pace.get(head);
    if (!known){
        known = { lead: fleetPace(group), from: new Map() };
        legCache.pace.set(head, known);
    }
    if (known.from.has(from)){ return known.from.get(from); }
// Speed depends on where a leg starts only through a mass relay, which reads nothing but the location's name.
    const speed = known.lead ? shipSpeed({ ...known.lead, ...dockedFields(from) }) : 0;
    known.from.set(from, speed);
    return speed;
}

function tradeLeg(group, from, to){
    const now = Date.now();
    const day = global.stats.days;
    if (now - legCache.at > 2000 || !(day >= legCache.day && day - legCache.day < legCacheWindow())){
        legCache.at = now;
        legCache.day = day;
        legCache.map.clear();
    }
    if (legCache.paceDay !== day){
        legCache.paceDay = day;
        legCache.pace.clear();
    }
// Keyed by the pace at the start of the leg, not wherever the fleet is now: a fleet sitting at a relay is.
    const key = `${from}|${to}|${legSpeed(group, from)}`;
    if (legCache.map.has(key)){ return legCache.map.get(key); }
    const pace = paceAt(group, from);
    const trip = pace ? planShipTrip(pace, to) : false;
    legCache.map.set(key, trip);
    return trip;
}

// Return a cached route-leg plan.
function tradeTrip(group, from, to){
    return tradeLeg(group, from, to);
}

// Return fleet travel time for one route leg, or Infinity if unreachable.
export function tradeLegDays(group, from, to){
    if (from === to){ return 0; }
    const trip = tradeLeg(group, from, to);
    return trip ? tripDays(trip) : Infinity;
}

// Return whether a fleet can reach a world on its current fuel.
export function fleetCanReach(group, to){
    if (!group || !group.length){ return false; }
    const from = shipPort(group[0]);
    if (from === to){ return true; }
    const trip = tradeLeg(group, from, to);
    return trip ? group.every(s => shipCanMakeTrip(s, trip)) : false;
}

// Validate that a proposed route is flyable with available fuel.
export function tradeRouteViable(group, stops){
    return stops.length > 1 && validateTradeRoute(group, stops);
}

// What a world can expect a freighter to bring it, and roughly when.
const freightRouteLoops = 6;

const arrivalCache = { at: 0, map: new Map() };
export function freightArrivals(res, pool, loadable){
    const cacheKey = loadable ? false : `${res}|${pool}`;
    if (cacheKey){
        const now = Date.now();
        if (now - arrivalCache.at > 250){ arrivalCache.at = now; arrivalCache.map.clear(); }
        if (arrivalCache.map.has(cacheKey)){ return arrivalCache.map.get(cacheKey); }
    }
    const arrivals = freightArrivalMap(loadable, res, pool).get(`${pool}|${res}`) || [];
    if (cacheKey){ arrivalCache.map.set(cacheKey, arrivals); }
    return arrivals;
}

// Build upcoming arrivals by supply pool and resource.
export function freightArrivalTable(loadable){
    return freightArrivalMap(loadable);
}

// The walk behind both. `onlyRes` and `onlyPool` narrow it to a single pair when that is all that is wanted.
function freightArrivalMap(loadable, onlyRes, onlyPool){
    const take = loadable || ((r, zone, capacity) => Math.min(capacity, Math.max(0, regAmount(r, zone))));
    const table = new Map();
    const deliver = function(pool, res, at, amount){
        const key = `${pool}|${res}`;
        let list = table.get(key);
        if (!list){ list = []; table.set(key, list); }
        list.push({ at, amount });
    };
    const fleets = shipFleets();
    const seen = new Set();
    for (const ship of allShips()){
        if (seen.has(ship) || ship.class !== 'freighter'){ continue; }
        const fleet = fleets.get(ship);
        const group = (fleet.length ? fleet : [ship]).filter(member => member.class === 'freighter');
        group.forEach(member => seen.add(member));
        if (!group.length){ continue; }
        const lead = tradeLeader(group);
        const route = tradeRoute(lead);
        // What the fleet already has aboard, by resource.
        const aboard = {};
        group.forEach(function(member){
            const cargo = freightCargo(member);
            for (const res in cargo){ aboard[res] = (aboard[res] || 0) + cargo[res]; }
        });

        if (!route){
            const bound = shipDestination(lead);
            if (bound !== false){
                const pool = supplyPool(bound);
                if (onlyPool !== undefined && pool !== onlyPool){ continue; }
                for (const res in aboard){
                    if (onlyRes === undefined || res === onlyRes){ deliver(pool, res, shipArrivalTime(lead), aboard[res]); }
                }
            }
            continue;
        }

        const stops = route.stops;
        const pools = stops.map(stop => supplyPool(stop.zone));
        if (onlyPool !== undefined && !pools.includes(onlyPool)){ continue; }
        const capacity = group.reduce((total, member) => total + freightCapacity(member), 0);

// The timetable, which is the same whatever is being carried: the stop at each step of the loops ahead, and.
        const legs = stops.map((stop, i) => tradeLegDays(group, stop.zone, stops[(i + 1) % stops.length].zone));
        const visits = [];
        let when = shipMoving(lead) ? shipArrivalTime(lead) : 0;
        let at = route.index;
        for (let step = 0; step <= stops.length * freightRouteLoops; step++){
            visits.push({ at, when });
            when += 1 + legs[at];
            at = (at + 1) % stops.length;
        }

        const goods = new Set(Object.keys(aboard));
        stops.forEach(stop => (stop.pickups || []).forEach(res => goods.add(res)));
        const loads = new Map();
        for (const res of goods){
            if (onlyRes !== undefined && res !== onlyRes){ continue; }
            for (const pool of new Set(pools)){
                if (onlyPool !== undefined && pool !== onlyPool){ continue; }
                // A hold bound for one world rides past every other stop.
                let hold = aboard[res] || 0;
                for (const visit of visits){
                    if (pools[visit.at] === pool){
                        if (hold > 0){ deliver(pool, res, visit.when, hold); }
                        hold = 0;
                    }
                    if ((stops[visit.at].pickups || []).includes(res)){
                        const key = `${visit.at}|${res}`;
                        if (!loads.has(key)){ loads.set(key, take(res, stops[visit.at].zone, capacity)); }
                        hold = loads.get(key);
                    }
                }
            }
        }
    }
    for (const list of table.values()){ list.sort((a,b) => a.at - b.at); }
    return table;
}

// Verify every ship can complete one full route loop with available refuelling.
function validateTradeRoute(group, stops){
    for (const ship of group){
// A tank's size hangs on the hull's speed, which walks the shipyard for its fleet, so it is read once per.
        const tank = shipFuelTank(ship);
        // Apply automatic refuelling at the first stop before departure.
        let reserve = canAutoRefuelAt(ship, stops[0].zone) ? tank : ensureShipFuel(ship, tank);
        for (let i=0; i<stops.length; i++){
            const from = stops[i].zone, to = stops[(i + 1) % stops.length].zone;
            const trip = tradeTrip(group, from, to);
            if (!trip){ return false; }
            const needed = shipTripFuel(ship, trip);
            if (needed > reserve + 0.000001){ return false; }
            reserve -= needed;
            if (canAutoRefuelAt(ship, to)){ reserve = tank; }
        }
    }
    return true;
}

function tradeUnload(group, pool){
    const freighters = tradeFreighters(group);
    const cargo = {};
    freighters.forEach(ship => Object.entries(freightCargo(ship)).forEach(([res, amount]) => { cargo[res] = (cargo[res] || 0) + amount; }));
    Object.entries(cargo).forEach(function([res, amount]){
        const spill = poolMod(res, pool, amount);
        const moved = amount - Math.max(0, spill);
        let left = moved;
        freighters.forEach(function(ship){
            const held = freightCargo(ship)[res] || 0;
            const take = Math.min(held, left);
            if (take > 0){ ship.cargo[res] -= take; if (ship.cargo[res] <= 0){ delete ship.cargo[res]; } left -= take; }
        });
        syncTotal(res);
    });
}
function tradeLoadOne(freighters, pool, res, amount){
    let remaining = Math.min(Math.floor(regAmount(res, pool)), amount, freighters.reduce((n,ship) => n + freightCapacity(ship) - freightLoad(ship), 0));
    const requested = remaining;
    while (remaining > 0){
        const open = freighters.filter(ship => freightLoad(ship) < freightCapacity(ship)).sort((a,b) => freightLoad(a) - freightLoad(b));
        if (!open.length){ break; }
        const low = freightLoad(open[0]);
        const tied = open.filter(ship => freightLoad(ship) === low);
        const next = open.find(ship => freightLoad(ship) > low);
        const rise = Math.min(...tied.map(ship => freightCapacity(ship) - low), next ? freightLoad(next) - low : Infinity);
        const each = Math.min(rise, Math.floor(remaining / tied.length));
        if (each > 0){
            tied.forEach(ship => { const cargo = freightCargo(ship); cargo[res] = (cargo[res] || 0) + each; });
            remaining -= each * tied.length;
        }
        else {
            tied.slice(0, remaining).forEach(ship => { const cargo = freightCargo(ship); cargo[res] = (cargo[res] || 0) + 1; });
            remaining = 0;
        }
    }
    const moved = requested - remaining;
    if (moved > 0){ poolMod(res, pool, -moved); }
    return moved;
}
function tradeLoad(group, pool, pickups){
    const freighters = tradeFreighters(group);
    let selected = [...new Set(Array.isArray(pickups) ? pickups : [pickups])].filter(res => res && global.resource[res]);
    let free = freighters.reduce((n,ship) => n + freightCapacity(ship) - freightLoad(ship), 0);
    while (free > 0 && selected.length){
        const share = Math.max(1, Math.floor(free / selected.length));
        const stillAvailable = [];
        selected.forEach(function(res){
            const moved = tradeLoadOne(freighters, pool, res, share);
            free -= moved;
            if (regAmount(res, pool) > 0 && moved >= share){ stillAvailable.push(res); }
        });
        if (stillAvailable.length === selected.length && free < selected.length){ break; }
        selected = stillAvailable;
    }
    // Refresh totals after all selected cargo transfers.
    [...new Set(Array.isArray(pickups) ? pickups : [pickups])].filter(res => res && global.resource[res]).forEach(syncTotal);
}
function serviceTradeStop(group, route){
    const stop = route.stops[route.index];
    tradeUnload(group, stop.zone);
    tradeLoad(group, stop.zone, stop.pickups || (stop.res ? [stop.res] : []));
    group.forEach(autoRefuelShip);
}
function launchTradeLeg(group, route){
    const next = (route.index + 1) % route.stops.length;
    const destination = route.stops[next].zone;
    const id = global.space.shipyard.ships.indexOf(tradeLeader(group));
    if (id < 0 || !sendShipTo(id, destination, true)){ clearTradeRoute(group); return false; }
    route.index = next;
    route.wait = 0;
    setTradeRoute(group, route);
    return true;
}

export function startFreightRoute(ship, stops){
    const group = tradeFleet(ship);
    const freighters = tradeFreighters(group);
    if (!freighters.length || !stops || stops.length < 2 || group.some(shipMoving)){ return false; }
    const routeStops = stops.map(stop => ({ zone: stop.zone, pickups: Array.isArray(stop.pickups) ? stop.pickups.filter(Boolean) : (stop.res ? [stop.res] : []) }));
    if (routeStops[0].zone !== supplyPool(shipPort(ship)) || !validateTradeRoute(group, routeStops)){ return false; }
    const route = { stops: routeStops, index: 0, wait: 0 };
    setTradeRoute(group, route);
    serviceTradeStop(group, route);
    return launchTradeLeg(group, route);
}
export function stopFreightRoute(ship){
    const group = tradeFleet(ship);
    if (!group.some(tradeRoute)){ return false; }
    clearTradeRoute(group);
    return true;
}
function advanceTradeRoutes(step){
    const ships = global.space.shipyard?.ships || [];
    // Advance dock timers before grouping routes that are ready to depart.
    let due = false;
    const launching = new Set();
    for (const ship of ships){
        const route = tradeRoute(ship);
        if (!route || shipMoving(ship)){ continue; }
        if (route.wait > 0){
            route.wait = Math.max(0, route.wait - step);
            if (route.wait === 0){ launching.add(ship); }
        }
        // Treat missing or expired wait times as ready to depart.
        if (!(route.wait > 0)){ due = true; }
    }
    if (!due){ return; }

    const seen = new Set();
    ships.forEach(function(ship){
        const route = tradeRoute(ship);
        if (!route || seen.has(ship) || route.wait > 0){ return; }
        const group = tradeFleet(ship);
        group.forEach(member => seen.add(member));
        const leader = tradeLeader(group);
        if (ship !== leader || group.some(shipMoving)){ return; }
        // Service the stop, then launch the next route leg.
        if (launching.has(leader)){ launchTradeLeg(group, route); return; }
        // Arrival: transfer first, then remain docked for one complete game day.
        serviceTradeStop(group, route);
        route.wait = 1;
        setTradeRoute(group, route);
    });
}

// Supply ship cost creep tracked seperatly per module type
function sameCostTier(ship, bp){
    if (ship.class !== bp.class){ return false; }
    if (bp.class !== 'supply_ship'){ return true; }
    const fit = s => supplyShipSpecials.includes(shipSpecial(s)) ? shipSpecial(s) : supplyShipSpecials[0];
    return fit(ship) === fit(bp);
}

export function shipCosts(bp){
    let costs = {};

    let h_inflate = 1;
    let p_inflate = 1;
    let creep_factor = 1;
    switch (bp.class){
        case 'corvette':
            costs['Money'] = 2500000;
            costs['Aluminium'] = 500000;
            h_inflate = 1;
            p_inflate = 1;
            creep_factor = 2;
            break;
        case 'frigate':
            costs['Money'] = 5000000;
            costs['Aluminium'] = 1250000;
            h_inflate = 1.1;
            p_inflate = 1.09;
            creep_factor = 1.5;
            break;
        case 'destroyer':
            costs['Money'] = 15000000;
            costs['Aluminium'] = 3500000;
            h_inflate = 1.2;
            p_inflate = 1.18;
            creep_factor = 1.2;
            break;
        case 'cruiser':
            costs['Money'] = 50000000;
            costs['Adamantite'] = 1000000;
            h_inflate = 1.3;
            p_inflate = 1.25;
            break;
        case 'battlecruiser':
            costs['Money'] = 125000000;
            costs['Adamantite'] = 2600000;
            h_inflate = 1.35;
            p_inflate = 1.3;
            creep_factor = 0.8;
            break;
        case 'dreadnought':
            costs['Money'] = 500000000;
            costs['Adamantite'] = 8000000;
            h_inflate = 1.4;
            p_inflate = 1.35;
            creep_factor = 0.5;
            break;
        case 'freighter':
            costs['Money'] = 5000000;
            costs['Aluminium'] = 1250000;
            h_inflate = 1;
            p_inflate = 1;
            creep_factor = 0.05;
            break;
        case 'explorer':
            costs['Money'] = 800000000;
            costs['Adamantite'] = 9500000;
            h_inflate = 1.45;
            p_inflate = 1;
            break;
        // Supply Ship construction costs.
        case 'supply_ship':
            costs['Money'] = 85000000;
            costs['Adamantite'] = 1800000;
            h_inflate = 1.32;
            p_inflate = 1.27;
            break;
    }

    switch (bp.armor){
        case 'steel':
            costs['Steel'] = Math.round(350000 ** h_inflate);
            break;
        case 'alloy':
            costs['Alloy'] = Math.round(250000 ** h_inflate);
            break;
        case 'neutronium':
            costs['Neutronium'] = Math.round(10000 ** h_inflate);
            break;
        case 'aerographene':
            costs['Aerographene'] = Math.round(50000 ** h_inflate);
            break;
    }

    let alt_cost = ['freighter','supply_ship'].includes(bp.class) ? true : false;
    switch (bp.engine){
        case 'ion':
            costs['Titanium'] = Math.round((alt_cost ? 10000 : 75000) ** p_inflate);
            break;
        case 'tie':
            costs['Titanium'] = Math.round((alt_cost ? 45000 : 150000) ** p_inflate);
            break;
        case 'pulse':
            costs['Titanium'] = Math.round((alt_cost ? 30000 : 125000) ** p_inflate);
            break;
        case 'photon':
            costs['Titanium'] = Math.round((alt_cost ? 75000 : 210000) ** p_inflate);
            break;
        case 'vacuum':
            costs['Titanium'] = Math.round((alt_cost ? 125000 : 300000) ** p_inflate);
            break;
        case 'emdrive':
            costs['Titanium'] = Math.round(1250000 ** p_inflate);
            break;
        case 'electrokinetic':
            costs['Titanium'] = Math.round((alt_cost ? 500000 : 1750000) ** p_inflate);
            break;
    }

    let alt_mat = ['dreadnought','explorer'].includes(bp.class) ? true : false;
    switch (bp.power){
        case 'solar':
            costs[alt_mat ? 'Orichalcum' : 'Copper'] = Math.round(40000 ** h_inflate);
            costs['Iridium'] = Math.round(15000 ** p_inflate);
            break;
        case 'diesel':
            costs[alt_mat ? 'Orichalcum' : 'Copper'] = Math.round(40000 ** h_inflate);
            costs['Iridium'] = Math.round(15000 ** p_inflate);
            break;
        case 'fission':
            costs[alt_mat ? 'Orichalcum' : 'Copper'] = Math.round(50000 ** h_inflate);
            costs['Iridium'] = Math.round(30000 ** p_inflate);
            break;
        case 'fusion':
            costs[alt_mat ? 'Orichalcum' : 'Copper'] = Math.round(50000 ** h_inflate);
            costs['Iridium'] = Math.round(40000 ** p_inflate);
            break;
        case 'elerium':
            costs[alt_mat ? 'Orichalcum' : 'Copper'] = Math.round(60000 ** h_inflate);
            costs['Iridium'] = Math.round(55000 ** p_inflate);
            break;
        case 'antimatter':
            costs[alt_mat ? 'Orichalcum' : 'Copper'] = Math.round(60000 ** h_inflate);
            costs['Iridium'] = Math.round(65000 ** p_inflate);
            break;
    }

    if (bp.class !== 'explorer'){
        switch (bp.sensor){
            case 'radar':
                costs['Money'] = Math.round(costs['Money'] ** 1.04);
                break;
            case 'lidar':
                costs['Money'] = Math.round(costs['Money'] ** 1.08);
                break;
            case 'quantum':
                costs['Money'] = Math.round(costs['Money'] ** 1.12);
                break;
        }
    }

    switch (bp.weapon){
        case 'railgun':
            costs['Iron'] = Math.round(25000 ** h_inflate);
            break;
        case 'laser':
            costs['Iridium'] = Math.round(costs['Iridium'] ** 1.05);
            costs['Nano_Tube'] = Math.round(12000 ** h_inflate);
            break;
        case 'p_laser':
            costs['Iridium'] = Math.round(costs['Iridium'] ** 1.035);
            costs['Nano_Tube'] = Math.round(12000 ** h_inflate);
            break;
        case 'plasma':
            costs['Iridium'] = Math.round(costs['Iridium'] ** 1.1);
            costs['Nano_Tube'] = Math.round(20000 ** h_inflate);
            break;
        case 'phaser':
            costs['Iridium'] = Math.round(costs['Iridium'] ** 1.15);
            costs['Quantium'] = Math.round(18000 ** h_inflate);
            break;
        case 'disruptor':
            costs['Iridium'] = Math.round(costs['Iridium'] ** 1.2);
            costs['Quantium'] = Math.round(35000 ** h_inflate);
            break;
        case 'gauss':
            costs['Iridium'] = Math.round(costs['Iridium'] ** 1.2);
            costs['Quantium'] = Math.round(60000 ** h_inflate);
            costs['Iron'] = Math.round(350000 ** h_inflate);
            break;
    }

    // The special mount
    if (shipSpecial(bp) === 'massdriver'){
        costs['Iridium'] = Math.round(costs['Iridium'] ** 1.2);
        costs['Tungsten'] = Math.round(750000 ** h_inflate);
        costs['Quantium'] = Math.round(40000 ** h_inflate);
    }

    if (bp.class === 'explorer'){
        costs['Iron'] *= 10;
        costs['Titanium'] *= 5;
        costs['Iridium'] *= 50;
    }

    let typeCount = 0;
    global.space.shipyard.ships.forEach(function(ship){
        if (sameCostTier(ship,bp)){
            typeCount++;
        }
    });

    let creep = 1 + (typeCount - 2) / 25 * creep_factor;
    Object.keys(costs).forEach(function(res){
        if (bp.class === 'explorer'){
            costs[res] = Math.ceil(costs[res] * ((typeCount + 1) * 3));
        }
        else {
            if (typeCount < 2){
                costs[res] = Math.ceil(costs[res] * (typeCount === 0 ? 0.75 : 0.9));
            }
            else if (typeCount > 2){
                costs[res] = Math.ceil(costs[res] * creep);
            }
        }
    });

    return costs;
}

// --- Refitting ---------------------------------------------------------------------------------- Return.
export function refitAllowed(ship){
    if (!global.tech['syard_fleet'] || global.tech.syard_fleet < 2){ return false; }
    const at = shipDockedAt(ship);
    if (at === false){ return false; }
    return activeRepairYards().includes(at);
}

// Build a blueprint-shaped design from a ship and optional refit plan.
export function refitDesign(ship, plan){
    let design = { class: ship.class, name: ship.name };
    refitParts.forEach(function(part){
        design[part] = plan && plan[part] !== undefined ? plan[part] : ship[part];
    });
    return design;
}

// Minimum Money charge for labor when a refit adds no material cost.
const refitLabor = 0.25;

// Charge only added material costs, with a minimum Money labor fee.
export function refitCosts(ship, plan){
    let now = shipCosts(refitDesign(ship,false));
    let want = shipCosts(refitDesign(ship,plan));
    let costs = {};
    Object.keys(want).forEach(function(res){
        let diff = (want[res] || 0) - (now[res] || 0);
        if (diff > 0){ costs[res] = Math.ceil(diff); }
    });
    // Unchanged plans have no refit cost.
    if (refitChanged(ship, plan)){
        let money = (want.Money || 0) - (now.Money || 0);
        costs['Money'] = money > 0 ? Math.ceil(money) : Math.ceil((want.Money || 0) * refitLabor);
    }
    return costs;
}

// Return whether a plan changes any refittable part.
export function refitChanged(ship, plan){
    return refitParts.some(function(part){
        return plan[part] !== undefined && plan[part] !== ship[part];
    });
}

// Return the locale key blocking a changed part, or false when valid.
export function refitBlocked(ship, plan){
    let design = refitDesign(ship, plan);
    for (let i=0; i<refitParts.length; i++){
        let part = refitParts[i];
        if (design[part] === ship[part]){ continue; }
        if (!shipSlotOpen(part,ship.class)){ return 'outer_shipyard_refit_part'; }
        let idx = shipParts[part].indexOf(design[part]);
        if (idx < 0 || !shipPartAvailable(part,idx,design[part],ship.class)){ return 'outer_shipyard_refit_part'; }
    }
    if (shipPower(design) < 0){ return 'outer_shipyard_refit_power'; }
    // Extra Cargo cannot be removed while its capacity is in use.
    if (ship.class === 'freighter' && freightLoad(ship) > freightCapacity(design)){ return 'outer_shipyard_refit_cargo'; }
    return false;
}

// Return whether changing power source requires emptying the fuel tank.
export function refitDrains(ship, plan){
    let now = shipFuelUse(refitDesign(ship,false)).res;
    let want = shipFuelUse(refitDesign(ship,plan)).res;
    return now !== want && !!now;
}

// Apply a valid refit while preserving ship identity and assignments.
export function applyRefit(ship, plan){
    if (!ship || !refitAllowed(ship) || !refitChanged(ship,plan) || refitBlocked(ship,plan)){ return false; }
    let raw = refitCosts(ship, plan);
    let costs = {};
    Object.keys(raw).forEach(function(res){
        costs[res] = function(){ return raw[res]; };
    });
    // Charge refits to the ship's docked yard.
    if (!payCosts({ id: 'tp-refit', supply(){ return shipPort(ship); } }, costs)){ return false; }
    let burned = shipFuelUse(ship).res;
    refitParts.forEach(function(part){
        if (plan[part] !== undefined){ ship[part] = plan[part]; }
    });
    // Changing fuel type empties the incompatible tank.
    if (shipFuelUse(ship).res !== burned){ ship.fuel = 0; }
    // Clamp retained fuel to the new tank capacity.
    ensureShipFuel(ship);
    return true;
}

// Take a `ship` and send it on its merry way to `locationName`
export function initializeShipTrip(ship, locationName, trip){
    // Whether this ship is presently inside a wormhole, and which gate it is bound for.
    const current = shipMoving(ship) ? shipLeg(ship) : false;
    let inGate = current && legInGate(current) ? true : false;
    let gateExit = inGate ? legPlace(current) : false;

// If a trip is already calculated then use that trip (for example when sending a fleet to account for its.
    let plannedTrip;
    if (trip && !inGate)
        plannedTrip = trip;
    else
        plannedTrip = planShipTrip(ship, locationName);

    // We're already at the target location, or the location is unavailable (for any possible reason)
    if (!plannedTrip)
        return;

    // Ensure every ship in a fleet has the same travel plan
    const legs = deepClone(tripLegs(plannedTrip));

    // Where the first leg starts
    let from;
    if (!shipMoving(ship)){
        // For a stationary ship lauching off - the location it was at before
        from = makePoint(ship.location, shipPort(ship));
    }
    else if (!legInGate(legs[0])){
        // For a ship travelling outside of a gate - just the xyz location it was at when changing course
        from = makePoint(shipPosition(ship));
    }
    else {
// A ship travelling inside a gate must first leave it before being able to change course.
        from = shipOrigin(ship);
    }

    // First step. A carried-over gate leg keeps the time it had left on it
    let left = shipLegLeft(ship);
    if (!(inGate && legInGate(legs[0]) && legPlace(legs[0]) === gateExit)){
        left = legDays(legs[0]);
    }

    // Liftoff. The destination is the last leg's end, landing point calculated in planShipTrip.
    launchShip(ship, from, legs, left);
}
// How far along its orbit a body has moved after `days`, in degrees.
function orbitDegrees(id, days){
    return orbitAngle(id, days);
}

// Return an orbiting body's projected position.
function bodyPointAt(locationName, days){
// A temp point riding a body projects as that body does, carrying its own circuit round with it.
    let temp = tempCoord(locationName);
    if (temp){
        let parent = tempParent(temp);
        if (!parent){ return genXYZcoord(locationName); }
        let base = bodyPointAt(parent, days), off = tempOffset(temp, days);
        return { x: base.x + off.x, y: base.y + off.y, z: base.z + off.z };
    }
    if (!starData[locationName]){ return genXYZcoord(locationName); }
    let body = starData[locationName];
    if (body.startype){ return genXYZcoord(locationName); }
    if (body.parent){
        let planetPt = orbitPoint(body.parent, orbitDegrees(body.parent, days));
// Project moon offsets from the parent's future position.
        let offset = rel(orbitPoint(locationName, orbitDegrees(locationName, days)), genXYZcoord(body.parent));
        return { x: planetPt.x + offset.x, y: planetPt.y + offset.y, z: planetPt.z + offset.z };
    }
    return orbitPoint(locationName, orbitDegrees(locationName, days));
}

// Passes used to settle a moon intercept, and how close in days counts as settled.
const MOON_INTERCEPT_STEPS = 8;
const MOON_INTERCEPT_TOL = 1e-4;

// The same, for settling an intercept against the delay a bend around a star adds to the leg.
const STAR_DETOUR_STEPS = 8;
const STAR_DETOUR_TOL = 1e-4;

// Where to aim a ship so it meets `planet` rather than where it used to be.
function calcLandingPoint(startingPosition, planet, speed, elapsed) {
    elapsed = elapsed || 0;
// A temp point riding a body has to be led like any other orbiting thing, so it goes through the same.
    let temp = tempCoord(planet);
    let leadTemp = temp ? tempParent(temp) !== false : false;
    if (temp && !leadTemp){ return genXYZcoord(planet); }
    if (!temp){
        if (!starData[planet]) { return genXYZcoord(planet); }
        if (starData[planet].startype) { return genXYZcoord(planet); }
    }
// A moon is solved for directly rather than through the crossing arithmetic below, which measures a body's.
    if (leadTemp || starData[planet].parent) {
        if (!(speed > 0)){ return genXYZcoord(planet); }
        let t = dist3(startingPosition, genXYZcoord(planet)) / speed;
        for (let i = 0; i < MOON_INTERCEPT_STEPS; i++){
            let next = dist3(startingPosition, bodyPointAt(planet, elapsed + t)) / speed;
            let settled = Math.abs(next - t) < MOON_INTERCEPT_TOL;
            t = next;
            if (settled){ break; }
        }
        return bodyPointAt(planet, elapsed + t);
    }
    // Tau Ceti bodies orbit their star, which sits far from the home-system origin.
    let star = starData[planet].star ? genXYZcoord(starData[planet].star) : { x: 0, y: 0, z: 0 };
// Calculate the orbit's radial crossing bounds.
    let semiMajor, semiMinor, center_x;
    if (starData[planet].star){
        semiMajor = starData[planet].dist * 1.2;
        semiMinor = starData[planet].dist;
        center_x = star.x + starData[planet].dist / 3;
    }
    else {
        let ecc = orbitEcc(planet);
        semiMajor = orbitDist(planet);
        semiMinor = semiMajor * Math.sqrt(1 - ecc * ecc);
// The Sun sits at a focus, so the ellipse's centre is one focal distance off it, toward apoapsis (the -x.
        center_x = star.x - semiMajor * ecc;
    }
    let center_y = star.y;
// Orbital inclination does not change radial crossing bounds.
    let ship_dist = dist3(startingPosition, { x: center_x, y: center_y, z: star.z });
    let cross1_dist = Math.abs(ship_dist - semiMinor);
    let cross2_dist = Math.abs(ship_dist + semiMinor);
    let cross1w_dist = Math.abs(ship_dist - semiMajor);
    let cross2w_dist = Math.abs(ship_dist + semiMajor);
    let cross1_days = Math.floor(Math.min(cross1_dist, cross1w_dist, cross2_dist, cross2w_dist) / speed);
    let cross2_days = Math.ceil(Math.max(cross1_dist, cross1w_dist, cross2_dist, cross2w_dist) / speed);
    if (ship_dist >= semiMinor && ship_dist <= semiMajor) {
        cross1_days = 0;
    }
    let planet_orbit = orbitPeriod(planet);
    let planet_speed = 360 / planet_orbit;
// Include elapsed travel time in the target's orbital angle.
    let planet_degree = orbitAngle(planet, elapsed + cross1_days);
    for (let i = cross1_days; i <= cross2_days; i++) {
// orbitPoint rather than open-coded trig, so the landing point is on the same 3D orbit the body travels and.
        let pt = orbitPoint(planet, planet_degree);
        if (dist3(startingPosition, pt) / speed <= i) {
            return pt;
        }
        planet_degree = (planet_degree + planet_speed) % 360;
    }
    return genXYZcoord(planet);
}

export function sensorRange(s){
    let hf = 1;
    switch (s.class){
        case 'corvette':
        case 'frigate':
            hf = 2;
            break;
        case 'destroyer':
        case 'cruiser':
        case 'corsair':
            hf = 1.5;
            break;
        case 'explorer':
            hf = 5;
            break;
        case 'freighter':
            hf = 0.5;
            break;
        default:
            hf = 1;
            break;
    }
    switch (s.sensor){
        case 'visual':
            return improvedSensors() ? sensorUpgrade.passiveRange : 1;
        case 'radar':
            return 10 * hf;
        case 'lidar':
            return 18 * hf;
        case 'quantum':
            return 32 * hf;
    }
}

// Improved Sensors values used by ship sensor calculations.
export const sensorUpgrade = {
    powerCut: 0.25,     // Share of sensor power draw removed.
    passiveRange: 5,    // Passive Radar reach in Gm; visual sightings reach 1.
    stealth: 0.5        // Sensor-range multiplier against stealth hulls, up from sWarfare.stealth.
};

export function improvedSensors(){
    return global.tech['syard_sensor'] >= 5 ? true : false;
}

// Return a ship-part locale key, including the Passive Radar upgrade.
export function shipPartKey(part, val){
    return part === 'sensor' && val === 'visual' && improvedSensors() ? 'outer_shipyard_sensor_passive' : `outer_shipyard_${part}_${val}`;
}

// Conversion from gigameters to astronomical units.
export const GM_PER_AU = 149.5978707;

// A hull's sensor reach in map units.
export function sensorRangeAU(ship){
    return (sensorRange(ship) || 0) / GM_PER_AU;
}

// The star a ship should be drawn relative to, as absolute Sun-frame coords.
export function shipRefStar(ship){
    if (!shipMoving(ship))
        return locSystem(shipPort(ship));

    let originStar = nearestStar(shipOrigin(ship) || shipPosition(ship));
    let destStar = nearestStar(shipDestinationPoint(ship) || shipPosition(ship));
    if (originStar === destStar){ return genXYZcoord(originStar); }
    let dO = dist3(shipPosition(ship), genXYZcoord(originStar));
    let dD = dist3(shipPosition(ship), genXYZcoord(destStar));
    return genXYZcoord(dO <= dD ? originStar : destStar);
}

// - Wormhole / Jump Gate Network
const wormholeSpeedMult = 125000;
export const jumpGates = {
    spc_sun_gate: {
        system: 'sun',
        location: 'spc_sun_gate',
        active(){ return global.tech['shadow'] || global.tech['resettle'] && global.tech.resettle >= 3 ? true : false; }
    },
    tau_home_gate: {
        system: 'tauceti',
        location: 'tau_home',
        active(){ return global.tech['shadow'] || global.tech['resettle'] && global.tech.resettle >= 3 ? true : false; }
    }
};
// Directed wormhole links. Two entries = a two-way wormhole; a single entry = a one-way gate.
const jumpLinks = [
    { from: 'spc_sun_gate', to: 'tau_home_gate' },
    { from: 'tau_home_gate', to: 'spc_sun_gate' }
];

export function locSystem(locationName){
    let temp = tempCoord(locationName);
    if (temp){ return tempSystem(temp); }
    if (locationName === 'tauceti'){ return 'tauceti'; }
    locationName = resolveBody(locationName);
    return starData[locationName] && starData[locationName].star ? starData[locationName].star : 'sun';
}

// Display name of the star a location orbits.
export function locSystemName(locationName){
// Temp points need no special case: their `s` is a table key, so locSystem resolves them to the same system.
    let sys = locSystem(locationName);
    if (locationName === sys){ return ''; }
    let star = sys === 'sun' ? starData.spc_sun : starData[sys];
    return star && star.label ? star.label : '';
}

// Find an active wormhole route (series of gate locations if any) connecting fromLoc's system to toLoc's.
function findWormholeRoute(fromLoc, toLoc){
    let fromSys = locSystem(fromLoc);
    let toSys = locSystem(toLoc);
    if (fromSys === toSys){
        // Travel directly to location, no gates involved
        return [{
            location: toLoc,
            inGate: false
        }];
    }
    let curSys;

    let systemGateLinks = {};
    jumpLinks.forEach(link => {
        let from = jumpGates[link.from];
        if (!from.active())
            return;

        let to = jumpGates[link.to];
        if (!to.active())
            return;

        if (!systemGateLinks.hasOwnProperty(from.system)){
            systemGateLinks[from.system] = [];
        }
        systemGateLinks[from.system].push({from: from, to: to});
    });


    let toPos = genXYZcoord(toLoc);

    // Algorithm based on wikipedia pseudocode. Note that euclidean distance is a consistent heuristic
    let open_set = [fromSys];
    let came_from = {};
    let g_score = {};
    g_score[fromSys] = 0;

    let f_score = {};
    f_score[fromSys] = dist3(genXYZcoord(fromLoc), toPos);

    let total_path = [];

    while (open_set.length > 0){
        curSys = open_set.shift();
        let curStar = (curSys === 'sun' ? 'spc_sun' : curSys);
        let curPos = genXYZcoord(curStar);


        if (curSys === toSys) {
            while (curSys !== fromSys){
                total_path.unshift(curSys);
                curSys = came_from[curSys];
            }
            break;
        }

        if (systemGateLinks[curSys]){
            systemGateLinks[curSys].forEach(link => {
                let exitSys = link.to.system;
                let exitStar = (exitSys === 'sun' ? 'spc_sun' : exitSys);
                let exitPos = genXYZcoord(exitStar);

                let tentative_g_score = g_score[curSys] + dist3(curPos, exitPos);
                if (!f_score.hasOwnProperty(exitSys) || tentative_g_score < f_score[exitSys]) {
                    came_from[exitSys] = curSys;
                    g_score[exitSys] = tentative_g_score;
                    f_score[exitSys] = tentative_g_score + dist3(exitPos, toPos);

                    if (!open_set.includes(exitSys)) {
                        open_set.push(exitSys);
                        open_set.sort((a, b) => f_score[a] - f_score[b]);
                    }
                }
            });
        }
    }

    if (total_path.length === 0){
        // No gate route to that system, which is not the same as no way there
        let bestVal = Infinity;
        let bestSys = null;

        Object.entries(f_score).forEach(([sys, val]) => {
            if (val < bestVal){
                bestVal = val;
                bestSys = sys;
            }
        });

        if (bestVal === Infinity)
            return null;

        let curSys = bestSys;
        while (curSys !== fromSys){
            total_path.unshift(curSys);
            curSys = came_from[curSys];
        }
    }

    // Gate path recorded in total_path
    let route = [];
    curSys = fromSys;
    let curLoc = fromLoc;
    total_path.forEach(system => {
        let link = systemGateLinks[curSys].filter(link => link.to.system === system)[0];
        route.push({
            location: link.from.location,
            inGate: false
        });
        route.push({
            location: link.to.location,
            inGate: true
        });

        curSys = system;
    });
    route.push({
        location: toLoc,
        inGate: false
    });
    return route;
}

// Plan a ship's trip to `locationName`.
export function planShipTrip(ship, locationName){
    if (shipDockedAt(ship) === locationName) {
        return false;
    }

    let speed = shipSpeed(ship) / 225;

// Check if the ship is currently travelling through a gate - it needs to exit first before being able to.
    let leg = shipLeg(ship);
    let inGate = shipMoving(ship) && legInGate(leg);

    let path = [];
    let currentPosition = shipPosition(ship);
    let currentTime = 0;
    let route;
    if (inGate){
        path.push(leg);
        currentPosition = legEnd(leg);
        currentTime = shipLegLeft(ship);

        route = findWormholeRoute(legPlace(leg), locationName);
    }
    else if (shipMoving(ship)){
        // Find path wrt current star. findWormholeRoute only cares about the system the location is in.
        let currentLocation = nearestStar(shipPosition(ship));
        route = findWormholeRoute(currentLocation, locationName);
    }
    else{
        route = findWormholeRoute(shipPort(ship), locationName);
    }

    if (!route)
        return false;

    route.forEach(step => {
        let currentSpeed = speed;
        if (step.inGate)
            currentSpeed *= wormholeSpeedMult;

        let nextPosition = calcLandingPoint(currentPosition, step.location, currentSpeed, currentTime);

        // Skip stellar detours for wormhole legs.
        let waypoint = step.inGate ? false : starDetour(currentPosition, nextPosition);
        if (waypoint){
            // Recalculate the intercept after adding a stellar detour.
            let delay = 0;
            for (let i = 0; i < STAR_DETOUR_STEPS && waypoint; i++){
                let bent = (dist3(currentPosition, waypoint) + dist3(waypoint, nextPosition) - dist3(currentPosition, nextPosition)) / currentSpeed;
                let settled = Math.abs(bent - delay) < STAR_DETOUR_TOL;
                delay = bent;
                if (settled){ break; }
                nextPosition = calcLandingPoint(currentPosition, step.location, currentSpeed, currentTime + delay);
                waypoint = starDetour(currentPosition, nextPosition);
            }
        }

        // Include stellar-detour distance in travel time and fuel use.
        if (waypoint){
            let legTime = dist3(currentPosition, waypoint) / currentSpeed;
            path.push(makeLeg(makePoint(waypoint), legTime, false, true));
            currentPosition = waypoint;
            currentTime += legTime;
        }

        let time = dist3(currentPosition, nextPosition) / currentSpeed;

        path.push(makeLeg(makePoint(nextPosition, step.location), time, step.inGate));

        currentPosition = nextPosition;
        currentTime += time;
    });

    return makeTrip(path, currentTime);
}

// Populate the ship dispatch modal with a button for each valid destination.
function tempDestinations(ship){
    let temps = global.race['tempCoordinates'];
    if (!temps){ return []; }
    return Object.keys(temps)
        .filter(key => temps[key] && temps[key].a && shipBound(ship) !== key)
        .map(key => ({ region: key, name: temps[key].n }));
}

// Return whether ships can reach a region.
export function regionReachable(region){
    const info = (spaceTech()[region] || tauCetiModules[region] || {}).info;
    if (!info || typeof info.nav !== 'function' || !info.nav()){ return false; }
    if (global.race['orbit_decayed'] && region === 'spc_moon'){ return false; }
    return true;
}

// Everywhere a single ship could be sent.
export function shipDestinations(ship){
    const spaceRegions = spaceTech();
    let dests = [];
    if (ship.class === 'explorer'){
        if (shipPort(ship) !== 'tauceti'){
            dests.push({ region: 'tauceti', name: loc('tech_era_tauceti') });
        }
        return dests.concat(tempDestinations(ship));
    }

    let currentShipLocation = shipBound(ship);

    Object.keys(spaceRegions).forEach(function(region){
        if (currentShipLocation === region || !regionReachable(region)){ return; }
        if (region === 'spc_sun_gate'){
            let name = typeof spaceRegions.spc_sun_gate.info.desc === 'string' ? spaceRegions.spc_sun_gate.info.desc : spaceRegions.spc_sun_gate.info.desc();
            dests.push({ region: region, name: name });
        }
        else {
            let name = typeof spaceRegions[region].info.name === 'string' ? spaceRegions[region].info.name : spaceRegions[region].info.name();
            dests.push({ region: region, name: name });
        }
    });
    Object.keys(tauCetiModules).forEach(function(region){
        if (currentShipLocation === region || !regionReachable(region)){ return; }
        let name = typeof tauCetiModules[region].info.name === 'string' ? tauCetiModules[region].info.name : tauCetiModules[region].info.name();
        dests.push({ region: region, name: name });
    });
    return dests.concat(tempDestinations(ship));
}

// Fleets
const fleetHulls = {
    corvette:      { cmd: 1,  cost: 1,  buff: 0,    soak: 0,   speed: 0.1 },
    frigate:       { cmd: 2,  cost: 2,  buff: 0,    soak: 0,   speed: 0.1 },
    destroyer:     { cmd: 5,  cost: 3,  buff: 0.05, soak: 0.1, speed: 0 },
    cruiser:       { cmd: 10, cost: 5,  buff: 0.1,  soak: 0.2, speed: 0 },
    battlecruiser: { cmd: 15, cost: 8,  buff: 0.1,  soak: 0.2, speed: 0 },
    dreadnought:   { cmd: 20, cost: 12, buff: 0.1,  soak: 0.2, speed: 0 },
    freighter:      { cmd: 0,  cost: 1,  buff: 0,    soak: 0,   speed: 0 },
    supply_ship:    { cmd: 0,  cost: 2,  buff: 0,    soak: 0,   speed: 0 }
};

// The command table, so the wiki documents the live numbers rather than repeating them.
export function fleetVars(){
    return { hulls: fleetHulls };
}

// Command points a hull has to spend when it leads, and what it takes up when it follows.
export function fleetCommandRating(ship){
    return ship && fleetHulls.hasOwnProperty(ship.class) ? fleetHulls[ship.class].cmd : 0;
}
export function fleetCommandCost(ship){
    return ship && fleetHulls.hasOwnProperty(ship.class) ? fleetHulls[ship.class].cost : 0;
}

export function allShips(){
    return global.space['shipyard'] && global.space.shipyard['ships'] ? global.space.shipyard.ships : [];
}

// The ship leading fleet `fid`, or false when it no longer exists.
function fleetFlagship(fid){
    if (!fid){ return false; }
    return allShips().find(s => s.flag && s.fid === fid) || false;
}

// Every ship flying under a fleet id, flagship included.
export function fleetMembers(fid){
    return fid ? allShips().filter(s => s.fid === fid) : [];
}

// Ships serving under a flagship, not counting the flagship itself.
export function fleetEscortCount(fid){
    return fleetMembers(fid).filter(s => !s.flag).length;
}

// Command points a fleet has spent and has left. The flagship is free, so only the escort counts.
export function fleetCommandUsed(fid){
    return fleetMembers(fid).reduce((t,s) => t + (s.flag ? 0 : fleetCommandCost(s)),0);
}
export function fleetCommandFree(fid){
    let flag = fleetFlagship(fid);
    return flag ? fleetCommandRating(flag) - fleetCommandUsed(fid) : 0;
}

export function shipFleet(ship){
    if (!global.tech['syard_fleet'] || !ship || !ship.fid){ return []; }
    return allShips().filter(s => s.fid === ship.fid && sameStation(s,ship));
}

// Every ship's shipFleet from a single walk of the yard, as ship → fleet, for callers that would otherwise.
export function shipFleets(){
    const fleets = new Map(), byStation = new Map();
    for (const ship of allShips()){
        if (!global.tech['syard_fleet'] || !ship || !ship.fid){ fleets.set(ship, []); continue; }
        // The same test as sameStation: identical motion state, then the same place or the same arrival.
        const key = shipMoving(ship)
            ? `${ship.fid}|moving|${shipDestination(ship)}|${shipLegLeft(ship)}`
            : `${ship.fid}|docked|${shipPort(ship)}`;
        let fleet = byStation.get(key);
        if (!fleet){ fleet = []; byStation.set(key, fleet); }
        fleet.push(ship);
        fleets.set(ship, fleet);
    }
    return fleets;
}

// Whether two ships are in the same place and in the same state of motion — both sitting at the same.
function sameStation(a,b){
    if (!a || !b || shipMoving(a) !== shipMoving(b)){ return false; }
    return shipMoving(a)
        ? shipDestination(a) === shipDestination(b) && shipLegLeft(a) === shipLegLeft(b)
        : shipPort(a) === shipPort(b);
}

// The flagship a ship answers to, which is itself when it is the one leading. False when it flies alone.
export function shipFlagship(ship){
    if (!global.tech['syard_fleet'] || !ship || !ship.fid){ return false; }
    return fleetFlagship(ship.fid);
}

// Extra firepower an escort gets from being led. A flagship does not steady itself.
function fleetDamageBonus(ship){
    let flag = shipFlagship(ship);
    if (!flag || flag === ship || ship.flag){ return 0; }
    return fleetHulls.hasOwnProperty(flag.class) ? fleetHulls[flag.class].buff : 0;
}

// Share of an incoming hit a flagship shrugs off.
export function fleetDamageSoak(ship){
    if (!ship || !ship.flag || !shipFlagship(ship) || fleetEscortCount(ship.fid) === 0){ return 0; }
    return fleetHulls.hasOwnProperty(ship.class) ? fleetHulls[ship.class].soak : 0;
}

// Speed a fleet gains from being led by a light hull.
function fleetSpeedBonus(ship){
    let flag = shipFlagship(ship);
    // A group of one is not a group: a light hull flying alone has nobody to set the pace for.
    if (!flag || fleetEscortCount(flag.fid) === 0){ return 0; }
    return fleetHulls.hasOwnProperty(flag.class) ? fleetHulls[flag.class].speed : 0;
}

// A ship can be shuffled in or out of a fleet only while it is actually sitting somewhere rather than.
function fleetEligible(ship){
    return global.tech['syard_fleet'] && ship && !shipMoving(ship) && fleetHulls.hasOwnProperty(ship.class) ? true : false;
}

// Put a ship in charge of a fleet of its own.
export function formFleet(ship){
    if (!fleetEligible(ship) || ship.fid || fleetCommandRating(ship) <= 0){ return false; }
    if (!global.space.shipyard['fid']){ global.space.shipyard['fid'] = 0; }
    ship.fid = ++global.space.shipyard.fid;
    ship.flag = true;
    return true;
}

// Put a ship under a flagship, if that fleet has the points left to take it on.
export function joinFleet(ship,fid){
    if (!fleetEligible(ship) || ship.fid){ return false; }
    let flag = fleetFlagship(fid);
    if (!flag || flag === ship || !sameStation(flag,ship)){ return false; }
    let cost = fleetCommandCost(ship);
    if (cost <= 0 || cost > fleetCommandFree(fid)){ return false; }
    ship.fid = fid;
    delete ship.flag;
    return true;
}

// Take a ship out of its fleet.
export function leaveFleet(ship){
    if (!ship || !ship.fid){ return false; }
    if (ship.flag){
        fleetMembers(ship.fid).forEach(function(s){ delete s.fid; delete s.flag; });
        return true;
    }
    delete ship.fid;
    delete ship.flag;
    return true;
}

// Flagships sitting where this ship is whose fleets have the points to take it on.
export function fleetsFor(ship){
    if (!fleetEligible(ship) || ship.fid){ return []; }
    let cost = fleetCommandCost(ship);
    if (cost <= 0){ return []; }
    return allShips().filter(s =>
        s.flag && s !== ship && sameStation(s,ship) && fleetCommandFree(s.fid) >= cost
    );
}

// Fleet check
export function fleetWorthForming(ship){
    return fleetEligible(ship) && !ship.fid && fleetCommandRating(ship) > 0 ? true : false;
}

// A fleet keeps pace with its slowest ship, so that is the one every trip is planned on.
export function fleetPace(group){
    if (!group || group.length === 0){ return false; }
    return group.reduce((a,b) => shipSpeed(a) <= shipSpeed(b) ? a : b);
}

// Where a damaged ship can be put back together. `avail` is called whenever a ship needs somewhere to go.
const repairStations = {
// Before the resettlement the shipyard itself does the repairs.
    spc_dwarf: { avail(){
        return global.tech['resettle']
            ? (global.space['repair_yard'] && global.space.repair_yard.count > 0 && p_on['repair_yard'] ? true : false)
            : (global.space['shipyard'] && global.space.shipyard.count > 0 ? true : false);
    } },
    tau_gas2:  { avail(){ return global.tech['resettle'] && global.tauceti['adv_shipyard'] && global.tauceti.adv_shipyard.count > 0 ? true : false; } }
};

// Docking is about the place, not whether it is currently staffed, so this covers every station whether or.
export const shipyardLocations = Object.keys(repairStations);

// Worlds a Repair Ship is currently keeping station over.
export function repairShipYards(){
    const ships = global.space.shipyard?.ships || [];
    const yards = [];
    for (const ship of ships){
        const at = shipDockedAt(ship);
        if (!supplyShipMode(ship,'repair_ship') || at === false){ continue; }
        // Repair Ships require a named celestial location.
        if (!at || !starData[at] || shipyardLocations.includes(at) || yards.includes(at)){ continue; }
        yards.push(at);
    }
    return yards;
}

// The yards that could take a ship in right now.
export function activeRepairYards(){
    return shipyardLocations.filter(function(yard){
        try { return repairStations[yard].avail() ? true : false; }
        catch (e){ return false; }
    }).concat(repairShipYards());
}
// Hull percentage a ship must have before it is cleared to leave for another destination.
export const minHullToLaunch = 75;

// Docked at a yard, as opposed to out in the field or crossing to one.
export function atShipyard(ship){
    if (!ship)
        return false;

    const at = shipDockedAt(ship);
    if (at === false){ return false; }
    // Treat parked Repair Ships as repair yards, not shipbuilding yards.
    return shipyardLocations.includes(at) || repairShipYards().includes(at);
}

// A hull below minHullToLaunch% is not spaceworthy — the threshold the yard and the standing orders both.
export function shipSpaceworthy(ship){
    return ship ? 100 - ship.damage >= minHullToLaunch : false;
}

// Whether a ship is in good enough condition to be sent somewhere
export function shipCanLaunch(ship){
    return ship ? shipSpaceworthy(ship) || !atShipyard(ship) : false;
}

// Fleet Tactical Command

// Range each percentage option accepts.
export const fleetCmdRange = {
    flee: { min: 0, max: 50 },
    retHull: { min: 75, max: 100 }
};

export function fleetCmd(){
    if (!global.settings['fleetCmd']){
        global.settings['fleetCmd'] = { flee: 25, ret: true, retHull: 100, quiet: false, zquiet: false };
    }
    let cfg = global.settings.fleetCmd;
// Backfill anything added after a save was written, so a new option is bound to a real value rather than to.
    if (typeof cfg.quiet === 'undefined'){ cfg['quiet'] = false; }
    if (typeof cfg.zquiet === 'undefined'){ cfg['zquiet'] = false; }
    // Pull anything saved under an older, wider range back inside the current one.
    Object.keys(fleetCmdRange).forEach(function(key){
        let val = Math.round(Number(cfg[key]));
        if (isNaN(val)){ val = fleetCmdRange[key].min; }
        cfg[key] = Math.max(fleetCmdRange[key].min,Math.min(fleetCmdRange[key].max,val));
    });
    return cfg;
}

// The panel and the standing orders it configures come with Fleet Command: the logistics that let ships move.
export function fleetCmdUnlocked(){
    return global.tech['syard_fleet'] ? true : false;
}

// The station a ship runs to: of those currently active, whichever it can reach soonest from where it is.
function repairYard(ship){
    let best = false;
    let bestDays = false;
    Object.keys(repairStations).forEach(function(locationName){
        if (shipDockedAt(ship) === locationName){ return; }
        let active = false;
        try { active = repairStations[locationName].avail(); }
        catch (e){ active = false; }
        if (!active){ return; }

        let trip = planShipTrip(ship,locationName);
        if (!trip || typeof tripDays(trip) !== 'number'){ return; }
        if (bestDays === false || tripDays(trip) < bestDays){
            bestDays = tripDays(trip);
            best = locationName;
        }
    });
    return best;
}

// Move a ship without any of the checks that apply to an order the player gives.
function orderShipTo(ship,locationName){
    if (!ship || shipBound(ship) === locationName){ return false; }
    if (!shipManned(ship)){ global.civic.garrison.crew += shipCrewSize(ship); }
    initializeShipTrip(ship, locationName);
    return true;
}

// The same, for a whole fleet.
function orderFleetTo(group,locationName){
    if (!group || group.length === 0){ return false; }
    let lead = group[0];
    if (shipBound(lead) === locationName){ return false; }
// Plan fleet trips using the slowest hull.
    let trip = planShipTrip(fleetPace(group),locationName);
    if (!trip){ return false; }
    group.forEach(function(ship){
        if (!shipManned(ship)){ global.civic.garrison.crew += shipCrewSize(ship); }
        initializeShipTrip(ship, locationName, trip);
    });
    return true;
}

// Ship return to fleet check
function rejoinTarget(ship){
    if (!ship || !ship['rfid']){ return false; }
    let flag = fleetFlagship(ship.rfid);
    if (!flag || flag === ship){ return false; }
// A name, never the location object: what comes back is handed straight to orderShipTo as a destination.
    return shipBound(flag);
}

// Rejoin a repaired ship with its fleet when they share a location.
function rejoinFleet(ship,cfg){
    if (!ship || !ship['rfid']){ return false; }
    if (ship.fid || !fleetFlagship(ship.rfid)){
        delete ship.rfid;
        return false;
    }
    // Not alongside it yet, or the berth is taken for now — try again another day.
    if (!joinFleet(ship,ship.rfid)){ return false; }
    delete ship.rfid;
    if (!cfg.quiet){
        let flag = shipFlagship(ship);
        messageQueue(loc('fleet_cmd_rejoin',[ship.name,flag ? flag.name : ``]),'success',false,['combat']);
    }
    return true;
}

// One pass of the standing orders over the whole fleet.
export function fleetCmdDay(){
    if (!global.space.hasOwnProperty('shipyard') || !global.space.shipyard.hasOwnProperty('ships')){ return; }
    let cfg = fleetCmd();
    let moved = false;

// A fleet is dealt with as a unit, through its flagship.
    global.space.shipyard.ships.forEach(function(ship){
        let hull = 100 - ship.damage;
        // Only a flagship that still leads something needs to speak for a group.
        let fleet = ship.flag && shipFlagship(ship) ? shipFleet(ship) : [ship];

        // Disengage: a hull that has fallen past the line breaks off and runs for a repair yard.
        if (!shipMoving(ship) && !atShipyard(ship) && hull < cfg.flee){
            let yard = repairYard(ship);
            if (yard && yard !== shipPort(ship)){
                if (fleet.length > 1){
// Where each ship was is what it comes back to, unless it was already limping home from somewhere else, in.
                    fleet.forEach(function(s){ if (!s['ret']){ s['ret'] = shipPort(s); } });
                    if (orderFleetTo(fleet,yard)){
                        if (!cfg.quiet){
                            messageQueue(loc('fleet_cmd_disengage_fleet',[ship.name,hull,fleet.length,regionName(yard)]),'warning',false,['combat']);
                        }
                        moved = true;
                    }
                }
                else {
                    if (!ship['ret']){ ship['ret'] = shipPort(ship); }
                    // Remember the fleet it was serving with, so the trip home ends where it started.
                    if (ship.fid && !ship.flag){ ship['rfid'] = ship.fid; }
                    leaveFleet(ship);
                    if (orderShipTo(ship,yard)){
                        if (!cfg.quiet){
                            messageQueue(loc('fleet_cmd_disengage',[ship.name,hull,regionName(yard)]),'warning',false,['combat']);
                        }
                        moved = true;
                    }
                }
            }
            return;
        }

        // Rejoin independently repaired ships with their fleet.
        if (ship['rfid'] && !shipMoving(ship)){
            if (rejoinFleet(ship,cfg)){
                moved = true;
                return;
            }
            let chase = rejoinTarget(ship);
            if (chase && chase !== shipPort(ship) &&!atShipyard(ship) && shipSpaceworthy(ship) && orderShipTo(ship,chase)){
                if (!cfg.quiet){
                    messageQueue(loc('fleet_cmd_regroup',[ship.name,regionName(chase)]),'success',false,['combat']);
                }
                moved = true;
                return;
            }
        }

        // Return on repair: patched up and still holding a posting to go back to.
        if (ship['ret'] && !shipMoving(ship) && atShipyard(ship)){
            if (!cfg.ret){ return; }
            if (ship.fid && !ship.flag){ return; }
            if (fleet.some(s => 100 - s.damage < cfg.retHull)){ return; }
// A ship still holding a place in a fleet leaves dock making for the fleet rather than for where it was.
            let home = rejoinTarget(ship) || ship.ret;
            if (orderFleetTo(fleet,home)){
                fleet.forEach(function(s){ delete s.ret; });
                if (!cfg.quiet){
                    if (fleet.length > 1){
                        messageQueue(loc('fleet_cmd_return_fleet',[ship.name,regionName(home),fleet.length]),'success',false,['combat']);
                    }
                    else {
                        messageQueue(loc('fleet_cmd_return',[ship.name,regionName(home)]),'success',false,['combat']);
                    }
                }
                moved = true;
            }
            return;
        }

        // Arriving back where it was posted retires the order.
        if (ship['ret'] && shipDockedAt(ship) === ship.ret){
            delete ship.ret;
            moved = true;
        }
    });

    if (moved){ drawShips(); }
}

// Sedn ships back to shipyard
export function withdrawShips(regions,destination){
    if (!global.space.hasOwnProperty('shipyard') || !global.space.shipyard.hasOwnProperty('ships')){ return 0; }
    let moved = 0;

    // Where a ship counts as being: on station, or on its way somewhere.
    let posted = function(ship){
        return regions.includes(shipBound(ship));
    };
    // The posting they are being pulled off no longer exists, so nothing is left to go back to.
    let clearOrders = function(ship){
        delete ship.ret;
        delete ship.rfid;
    };

    global.space.shipyard.ships.forEach(function(ship){
        if (!posted(ship) || !ship.flag || !shipFlagship(ship)){ return; }
        let fleet = shipFleet(ship);
        if (fleet.length <= 1){ return; }
        fleet.forEach(clearOrders);
        if (orderFleetTo(fleet,destination)){ moved += fleet.length; }
    });

    global.space.shipyard.ships.forEach(function(ship){
        if (!posted(ship)){ return; }
        if (ship.fid){ leaveFleet(ship); }
        clearOrders(ship);
        if (orderShipTo(ship,destination)){ moved++; }
    });

    if (moved){ drawShips(); }
    return moved;
}

// Return whether a ship currently requires crew allocation.
export function shipManned(ship){
    return shipMoving(ship) || !shipyardLocations.includes(shipPort(ship));
}

// Send a ship to a destination region, or its whole fleet if it belongs to one.
export function dispatchFreighter(ship, locationName){
    if (!ship || ship.class !== 'freighter' || shipMoving(ship)){ return false; }
    const id = global.space.shipyard.ships.indexOf(ship);
    if (id < 0){ return false; }
    sendShipTo(id, locationName);
    return shipMoving(ship);
}

export function sendShipTo(id, locationName, keepRoute=false){
    let ship = global.space.shipyard.ships[id];
    if (!ship || shipBound(ship) === locationName){ return; }
    let group = shipFleet(ship);
    if (!group.length){ group = [ship]; }

    // A direct player order replaces any repeating logistics instruction.
    if (!keepRoute){ clearTradeRoute(group); clearPatrol(group); }

    // Nothing leaves dry dock on a badly damaged hull
    if (group.some(s => !shipCanLaunch(s))){ return false; }

    // Crew for every unmanned ship has to be on hand up front — a fleet leaves together or not at all.
    let need = group.reduce((t,s) => t + (shipManned(s) ? 0 : shipCrewSize(s)), 0);
    if (need > global.civic.garrison.workers - global.civic.garrison.crew){ return false; }

    let trip = planShipTrip(fleetPace(group), locationName);
    if (trip && group.every(s => shipCanMakeTrip(s, trip))) {
        for (let s of group){
            if (!shipManned(s)){ global.civic.garrison.crew += shipCrewSize(s); }
            // An order from the player overrides the standing one
            if (s['ret']){ delete s.ret; }
            if (s['rfid']){ delete s.rfid; }
            initializeShipTrip(s, locationName, trip);
        }
    }

    drawShips();
    return group.some(shipMoving);
}
