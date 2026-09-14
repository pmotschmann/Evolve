// Ship journey save migration helpers.
// This module has no imports because vars.js runs it while loading saves.

// A point from anything with x, y and z, named when given a name.
export function makePoint(pos, id){
    const point = {};
    if (pos && typeof pos === 'object'){
        for (const axis of ['x','y','z']){
            if (typeof pos[axis] === 'number'){ point[axis] = pos[axis]; }
        }
    }
    if (typeof id === 'string' && id !== ''){ point.id = id; }
    return point;
}

export function makeLeg(to, days, gate, wp){
    const leg = { to, days };
    if (gate){ leg.gate = true; }
    if (wp){ leg.wp = true; }
    return leg;
}

// --- Older saves ---------------------------------------------------------------------------------

// Every field of this type replaced.
export const retiredShipFields = ['inTransit','origin','destination','path','timeToNextStep','totalTime'];

// Drop whatever is left of the old type.
export function retireShipFields(ship){
    for (const field of retiredShipFields){
        delete ship[field];
    }
}

// Every ship-like object a save holds, wherever it is kept.
export function eachStoredShip(state, fn){
    const race = state && state.race ? state.race : {};
    const lists = [
        state && state.space && state.space.shipyard ? state.space.shipyard.ships : false,
        race.inactive ? race.inactive.ships : false,
        race.zfleet ? race.zfleet.s : false
    ];
    if (race.sy_base && typeof race.sy_base === 'object'){
        for (const region of Object.keys(race.sy_base)){
            const base = race.sy_base[region];
            if (!base){ continue; }
            lists.push(base.ships);
            if (base.ship){ lists.push([base.ship]); }
        }
    }
    if (race.supply_deployed && typeof race.supply_deployed === 'object'){
        for (const pool of Object.keys(race.supply_deployed)){ lists.push(race.supply_deployed[pool]); }
    }
    if (race.salvagePins && typeof race.salvagePins === 'object'){
        lists.push(Object.keys(race.salvagePins).map(key => race.salvagePins[key]));
    }
    for (const list of lists){
        if (!Array.isArray(list)){ continue; }
        for (const ship of list){
            if (ship && typeof ship === 'object'){ fn(ship); }
        }
    }
}

// Rewrite a ship saved in the old type. Returns whether anything changed; running it twice changes nothing.
export function upgradeShip(ship){
    const loc = ship.location;
    const oldLocation = loc && typeof loc === 'object' && (loc.hasOwnProperty('name') || loc.hasOwnProperty('position'));
    const oldFields = retiredShipFields.some(field => ship.hasOwnProperty(field));
    if (!oldLocation && !oldFields){ return false; }

    if (oldLocation){
        ship.location = makePoint(loc.position, loc.name);
    }
    const legs = Array.isArray(ship.path) ? ship.path.filter(leg => leg && leg.destination) : [];
    if (ship.inTransit && legs.length){
        const from = ship.origin && ship.origin.position ? makePoint(ship.origin.position, ship.origin.name) : makePoint(loc && loc.position);
        ship.movement = {
            from,
            legs: legs.map(leg => makeLeg(makePoint(leg.destination.position, leg.destination.name), Number(leg.totalTime) || 0, leg.inGate, leg.wp)),
            left: Number(ship.timeToNextStep) || 0
        };
    }
    else if (ship.inTransit){
    // Repair an incomplete legacy journey at its destination or origin.
        const at = ship.destination && ship.destination.name ? ship.destination.name : (loc && loc.name) || '';
        ship.location = makePoint(ship.location, at);
        delete ship.movement;
    }
    else {
        delete ship.movement;
    }
    retireShipFields(ship);
    return true;
}
