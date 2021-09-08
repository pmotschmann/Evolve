import { global, p_on, sizeApproximation } from './vars.js';
import { vBind, clearElement, popover, messageQueue, powerCostMod, powerModifier, spaceCostMultiplier, deepClone } from './functions.js';
import { races, genusVars } from './races.js';
import { spatialReasoning } from './resources.js';
import { production } from './prod.js';
import { payCosts, drawTech } from './actions.js';
import { fuel_adjust, spaceTech } from './space.js';
import { loc } from './locale.js';

export const outerTruth = {
    spc_titan: {
        info: {
            name(){
                return genusVars[races[global.race.species].type].solar.titan;
            },
            desc(){
                return loc('space_titan_info_desc',[genusVars[races[global.race.species].type].solar.titan, races[global.race.species].home]);
            },
            support: 'electrolysis',
            zone: 'outer',
            syndicate(){ return global.tech['titan'] && global.tech.titan >= 3 && global.tech['enceladus'] && global.tech.enceladus >= 2 ? true : false; }
        },
        titan_mission: {
            id: 'space-titan_mission',
            title(){
                return loc('space_mission_title',[genusVars[races[global.race.species].type].solar.titan]);
            },
            desc(){
                return loc('space_mission_desc',[genusVars[races[global.race.species].type].solar.titan]);
            },
            reqs: { outer: 1 },
            grant: ['titan',1],
            path: ['truepath'],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: { 
                Helium_3(){ return +fuel_adjust(250000).toFixed(0); },
                Elerium(){ return 100; }
            },
            effect(){
                return loc('space_titan_mission_effect',[genusVars[races[global.race.species].type].solar.titan]);
            },
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_titan_mission_action',[genusVars[races[global.race.species].type].solar.titan, races[global.race.species].home]),'info');
                    return true;
                }
                return false;
            }
        },
        titan_spaceport: {
            id: 'space-titan_spaceport',
            title: loc('space_red_spaceport_title'),
            desc: `<div>${loc('space_red_spaceport_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { titan: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('titan_spaceport', offset, 2500000, 1.32); },
                Lumber(offset){ return spaceCostMultiplier('titan_spaceport', offset, 750000, 1.32); },
                Cement(offset){ return spaceCostMultiplier('titan_spaceport', offset, 350000, 1.32); },
                Mythril(offset){ return spaceCostMultiplier('titan_spaceport', offset, 10000, 1.32); }
            },
            effect(){
                let water = global.resource.Water.display ? `<div>${loc('plus_max_resource',[sizeApproximation(spatialReasoning(250)),global.resource.Water.name])}</div>` : ``;
                let support = global.tech['enceladus'] && global.tech.enceladus >= 2 ? `<div>+${loc(`galaxy_alien2_support`,[$(this)[0].support(),genusVars[races[global.race.species].type].solar.enceladus])}</div>` : ``;
                let storage = global.tech['titan'] && global.tech.titan >= 5 ? `<div>${loc(`space_titan_spaceport_storage`,[25])}</div>` : ``;
                return `${support}${water}${storage}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            support(){ return 2; },
            powered(){ return powerCostMod(10); },
            action(){
                if (payCosts($(this)[0])){
                    global.space.titan_spaceport.count++;
                    if (global.city.power >= $(this)[0].powered()){
                        global.space.titan_spaceport.on++;
                    }
                    return true;
                }
                return false;
            },
            post(){
                if (global.tech['titan'] === 1){
                    global.tech['titan'] = 2;
                    drawTech();
                }
            }
        },
        electrolysis: {
            id: 'space-electrolysis',
            title: loc('space_electrolysis_title'),
            desc(){ return `<div>${loc('space_electrolysis_title')}</div><div class="has-text-special">${loc('space_electrolysis_req',[global.resource.Water.name])}</div>`; },
            reqs: { titan: 3 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('electrolysis', offset, 1000000, 1.25); },
                Copper(offset){ return spaceCostMultiplier('electrolysis', offset, 185000, 1.25); },
                Steel(offset){ return spaceCostMultiplier('electrolysis', offset, 220000, 1.25); },
                Polymer(offset){ return spaceCostMultiplier('electrolysis', offset, 380000, 1.25); }
            },
            effect(){
                let support = `<div>+${loc(`galaxy_alien2_support`,[$(this)[0].support(),genusVars[races[global.race.species].type].solar.titan])}</div>`;
                return `${support}<div class="has-text-caution">${loc('space_electrolysis_use',[$(this)[0].support_fuel().a,global.resource.Water.name,$(this)[0].powered()])}</div>`;
            },
            support(){
                return 2;
            },
            support_fuel(){ return { r: 'Water', a: 35 }; },
            powered(){ return powerCostMod(8); },
            action(){
                if (payCosts($(this)[0])){
                    global.space.electrolysis.count++;
                    if (global.city.power >= $(this)[0].powered()){
                        global.space.electrolysis.on++;
                    }
                    return true;
                }
                return false;
            },
            post(){
                if (global.tech['titan'] === 3){
                    global.tech['titan'] = 4;
                    drawTech();
                }
            }
        },
        hydrogen_plant: {
            id: 'space-hydrogen_plant',
            title: loc('space_hydrogen_plant_title'),
            desc(){ return `<div>${loc('space_hydrogen_plant_title')}</div><div class="has-text-special">${loc('space_hydrogen_plant_req')}</div>`; },
            reqs: { titan_power: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('hydrogen_plant', offset, 1500000, 1.28); },
                Iridium(offset){ return spaceCostMultiplier('hydrogen_plant', offset, 292000, 1.28); },
                Stanene(offset){ return spaceCostMultiplier('hydrogen_plant', offset, 599000, 1.28); },
                Cement(offset){ return spaceCostMultiplier('hydrogen_plant', offset, 180000, 1.28); }
            },
            effect(){
                return `<span>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered())])}</span>, <span class="has-text-caution">${loc('space_hydrogen_plant_effect',[1,loc('space_electrolysis_title')])}</span>`;
            },
            support(){
                return 2;
            },
            powered(){ return powerModifier(-22); },
            action(){
                if (payCosts($(this)[0])){
                    global.space.hydrogen_plant.count++;
                    if (global.space.electrolysis.on > global.space.hydrogen_plant.on){
                        global.space.hydrogen_plant.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        titan_quarters: {
            id: 'space-titan_quarters',
            title: loc('interstellar_habitat_title'),
            desc(){
                return `<div>${loc('interstellar_habitat_title')}</div><div class="has-text-special">${loc('space_support',[genusVars[races[global.race.species].type].solar.titan])}</div>`;
            },
            reqs: { titan: 4 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('titan_quarters', offset, 1200000, 1.28); },
                Furs(offset){ return spaceCostMultiplier('titan_quarters', offset, 85000, 1.28); },
                Plywood(offset){ return spaceCostMultiplier('titan_quarters', offset, 100000, 1.28); },
                Horseshoe(){ return global.race['hooved'] ? 1 : 0; }
            },
            effect(){
                let gain = 1;
                return `<div class="has-text-caution">${loc('space_used_support',[genusVars[races[global.race.species].type].solar.titan])}</div><div>${loc('plus_max_resource',[1,global.race['truepath'] ? loc('job_colonist_tp',[genusVars[races[global.race.species].type].solar.titan]) : loc('colonist')])}</div><div>${loc('plus_max_resource',[gain,loc('citizen')])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.space.titan_quarters.count++;
                    global.civic.titan_colonist.display = true;
                    if (global.space.electrolysis.support < global.space.electrolysis.s_max){
                        global.space.titan_quarters.on++;
                        global.resource[global.race.species].max += 1;
                        if (global.civic[global.civic.d_job].workers > 0){
                            global.civic[global.civic.d_job].workers--;
                            global.civic.titan_colonist.workers++;
                        }
                    }
                    return true;
                }
                return false;
            }
        },
        titan_mine: {
            id: 'space-titan_mine',
            title: loc('space_red_mine_title'),
            desc(){
                return `<div>${loc('space_red_mine_desc')}</div><div class="has-text-special">${loc('space_support',[genusVars[races[global.race.species].type].solar.titan])}</div>`;
            },
            reqs: { titan: 4 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('titan_mine', offset, 475000, 1.28); },
                Lumber(offset){ return spaceCostMultiplier('titan_mine', offset, 568000, 1.28); },
                Wrought_Iron(offset){ return spaceCostMultiplier('titan_mine', offset, 250000, 1.28); }
            },
            effect(){
                let adam_val = production('titan_mine','adamantite');
                let alum_val = production('titan_mine','aluminium');
                let adamantite = +(adam_val).toFixed(3);
                let aluminium = +(alum_val).toFixed(3);
                return `<div class="has-text-caution">${loc('space_used_support',[genusVars[races[global.race.species].type].solar.titan])}</div><div>${loc('space_red_mine_effect',[adamantite,global.resource.Adamantite.name])}</div><div>${loc('space_red_mine_effect',[aluminium,global.resource.Aluminium.name])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            special(){ return true; },
            action(){
                if (payCosts($(this)[0])){
                    global.space.titan_mine.count++;
                    global.resource.Adamantite.display = true;
                    if (global.space.electrolysis.support < global.space.electrolysis.s_max){
                        global.space.titan_mine.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        storehouse: {
            id: 'space-storehouse',
            title: loc('space_storehouse_title'),
            desc: loc('space_storehouse_title'),
            reqs: { titan: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('storehouse', offset, 175000, 1.28); },
                Lumber(offset){ return spaceCostMultiplier('storehouse', offset, 100000, 1.28); },
                Aluminium(offset){ return spaceCostMultiplier('storehouse', offset, 120000, 1.28); },
                Cement(offset){ return spaceCostMultiplier('storehouse', offset, 45000, 1.28); }
            },
            wide: true,
            effect(){
                let storage = '<div class="aTable">';
                let multiplier = storehouseMultiplier();
                if (global.resource.Lumber.display){
                    let val = sizeApproximation(+(spatialReasoning(3000) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Lumber.name])}</span>`;
                }
                if (global.resource.Stone.display){
                    let val = sizeApproximation(+(spatialReasoning(3000) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Stone.name])}</span>`;
                }
                if (global.resource.Chrysotile.display){
                    let val = sizeApproximation(+(spatialReasoning(3000) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Chrysotile.name])}</span>`;
                }
                if (global.resource.Furs.display){
                    let val = sizeApproximation(+(spatialReasoning(1700) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Furs.name])}</span>`;
                }
                if (global.resource.Copper.display){
                    let val = sizeApproximation(+(spatialReasoning(1520) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Copper.name])}</span>`;
                }
                if (global.resource.Iron.display){
                    let val = sizeApproximation(+(spatialReasoning(1400) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Iron.name])}</span>`;
                }
                if (global.resource.Aluminium.display){
                    let val = sizeApproximation(+(spatialReasoning(1280) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Aluminium.name])}</span>`;
                }
                if (global.resource.Cement.display){
                    let val = sizeApproximation(+(spatialReasoning(1120) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Cement.name])}</span>`;
                }
                if (global.resource.Coal.display){
                    let val = sizeApproximation(+(spatialReasoning(480) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Coal.name])}</span>`;
                }
                if (global.resource.Steel.display){
                    let val = sizeApproximation(+(spatialReasoning(240) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Steel.name])}</span>`;
                }
                if (global.resource.Titanium.display){
                    let val = sizeApproximation(+(spatialReasoning(160) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Titanium.name])}</span>`;
                }
                if (global.resource.Alloy.display){
                    let val = sizeApproximation(+(spatialReasoning(180) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Alloy.name])}</span>`
                }
                if (global.resource.Nano_Tube.display){
                    let val = sizeApproximation(+(spatialReasoning(120) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Nano_Tube.name])}</span>`
                }
                if (global.resource.Neutronium.display){
                    let val = sizeApproximation(+(spatialReasoning(64) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Neutronium.name])}</span>`
                }
                if (global.resource.Adamantite.display){
                    let val = sizeApproximation(+(spatialReasoning(72) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Adamantite.name])}</span>`
                }
                storage = storage + '</div>';
                return storage;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.space.storehouse.count++;
                    let multiplier = storehouseMultiplier();
                    global['resource']['Lumber'].max += (spatialReasoning(3000) * multiplier);
                    global['resource']['Stone'].max += (spatialReasoning(3000) * multiplier);
                    global['resource']['Furs'].max += (spatialReasoning(1700) * multiplier);
                    global['resource']['Copper'].max += (spatialReasoning(1520) * multiplier);
                    global['resource']['Iron'].max += (spatialReasoning(1400) * multiplier);
                    global['resource']['Aluminium'].max += (spatialReasoning(1280) * multiplier);
                    global['resource']['Cement'].max += (spatialReasoning(1120) * multiplier);
                    global['resource']['Coal'].max += (spatialReasoning(480) * multiplier);
                    global['resource']['Steel'].max += ((spatialReasoning(240) * multiplier));
                    global['resource']['Titanium'].max += ((spatialReasoning(160) * multiplier));
                    global['resource']['Alloy'].max += ((spatialReasoning(180) * multiplier));
                    if (global.resource.Chrysotile.display){
                        global['resource']['Chrysotile'].max += (spatialReasoning(3000) * multiplier);
                    }
                    if (global.resource.Nano_Tube.display){
                        global['resource']['Nano_Tube'].max += ((spatialReasoning(120) * multiplier));
                    }
                    if (global.resource.Neutronium.display){
                        global['resource']['Neutronium'].max += ((spatialReasoning(64) * multiplier));
                    }
                    if (global.resource.Adamantite.display){
                        global['resource']['Adamantite'].max += ((spatialReasoning(72) * multiplier));
                    }
                    return true;
                }
                return false;
            }
        },
    },
    spc_enceladus: {
        info: {
            name(){
                return genusVars[races[global.race.species].type].solar.enceladus;
            },
            desc(){
                return loc('space_enceladus_info_desc',[genusVars[races[global.race.species].type].solar.enceladus, races[global.race.species].home]);
            },
            support: 'titan_spaceport',
            zone: 'outer',
            syndicate(){ return global.tech['titan'] && global.tech.titan >= 3 && global.tech['enceladus'] && global.tech.enceladus >= 2 ? true : false; }
        },
        enceladus_mission: {
            id: 'space-enceladus_mission',
            title(){
                return loc('space_mission_title',[genusVars[races[global.race.species].type].solar.enceladus]);
            },
            desc(){
                return loc('space_mission_desc',[genusVars[races[global.race.species].type].solar.enceladus]);
            },
            reqs: { outer: 1 },
            grant: ['enceladus',1],
            path: ['truepath'],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: { 
                Helium_3(){ return +fuel_adjust(250000).toFixed(0); },
                Elerium(){ return 100; }
            },
            effect(){
                return loc('space_titan_mission_effect',[genusVars[races[global.race.species].type].solar.enceladus]);
            },
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_enceladus_mission_action',[genusVars[races[global.race.species].type].solar.enceladus]),'info');
                    global.resource.Water.display = true;
                    return true;
                }
                return false;
            }
        },
        water_freighter: {
            id: 'space-water_freighter',
            title: loc('space_water_freighter_title'),
            desc(){
                return `<div>${loc('space_water_freighter_title')}</div><div class="has-text-special">${loc('space_support',[genusVars[races[global.race.species].type].solar.enceladus])}</div>`;
            },
            reqs: { enceladus: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('water_freighter', offset, 450000, 1.25); },
                Iron(offset){ return spaceCostMultiplier('water_freighter', offset, 362000, 1.25); },
                Nano_Tube(offset){ return spaceCostMultiplier('water_freighter', offset, 125000, 1.25); },
                Sheet_Metal(offset){ return spaceCostMultiplier('water_freighter', offset, 75000, 1.25); }
            },
            effect(){
                let helium = +fuel_adjust(2.5).toFixed(2);
                let water = +(production('water_freighter')).toFixed(2);
                return `<div class="has-text-caution">${loc('space_used_support',[genusVars[races[global.race.species].type].solar.enceladus])}</div><div>${loc('produce',[water,global.resource.Water.name])}</div><div class="has-text-caution">${loc(`space_belt_station_effect3`,[helium])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.space.water_freighter.count++;
                    if (global.space.titan_spaceport.support < global.space.titan_spaceport.s_max){
                        global.space.water_freighter.on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
};

export function drawShipYard(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 5)){
        return;
    }
    setOrbits();
    clearShipDrag();
    clearElement($('#dwarfShipYard'));
    if (global.space.hasOwnProperty('shipyard') && global.settings.showShipYard){
        let yard = $(`#dwarfShipYard`);

        if (!global.space.shipyard.hasOwnProperty('blueprint')){
            global.space.shipyard['blueprint'] = {
                class: 'corvette',
                armor: 'steel',
                weapon: 'railgun',
                engine: 'ion',
                power: 'diesel',
                sensor: 'radar',
                name: getRandomShipName()
            };
        }

        let plans = $(`<div id="shipPlans"></div>`);
        yard.append(plans);

        let shipStats = $(`<div class="stats"></div>`);
        plans.append(shipStats);

        shipStats.append(`<div class="registry"><span class="has-text-caution">${loc(`outer_shipyard_registry`)}</span>: <b-input v-model="b.name" maxlength="25" class="nameplate"></b-input></div>`);
        shipStats.append(`<div><span class="has-text-caution">${loc(`crew`)}</span> <span v-html="crewText()"></span></div>`);
        shipStats.append(`<div><span class="has-text-caution">${loc(`power`)}</span> <span v-html="powerText()"></span></div>`);
        shipStats.append(`<div><span class="has-text-caution">${loc(`firepower`)}</span> <span v-html="fireText()"></span></div>`);
        shipStats.append(`<div><span class="has-text-caution">${loc(`outer_shipyard_sensors`)}</span> <span v-html="sensorText()"></span></div>`);
        shipStats.append(`<div><span class="has-text-caution">${loc(`speed`)}</span> <span v-html="speedText()"></span></div>`);
        shipStats.append(`<div><span class="has-text-caution">${loc(`outer_shipyard_fuel`)}</span> <span v-html="fuelText()"></span></div>`);

        plans.append(`<div id="shipYardCosts" class="costList"></div>`);

        let options = $(`<div class="shipBayOptions"></div>`);
        plans.append(options);

        let shipConfig = {
            class: ['corvette','frigate','destroyer','cruiser','battlecruiser','dreadnought'],
            power: ['solar','diesel','fission','fusion','elerium'],
            weapon: ['railgun','laser','p_laser','plasma','phaser','disrupter'],
            armor : ['steel','alloy','neutronium'],
            engine: ['ion','tie','pulse','photon','vacuum'],
            sensor: ['visual','radar','lidar','quantum'],
        };
        
        Object.keys(shipConfig).forEach(function(k){
            let values = ``;
            shipConfig[k].forEach(function(v,idx){
                values += `<b-dropdown-item aria-role="listitem" v-on:click="setVal('${k}','${v}')" class="${k} a${idx}" data-val="${v}" v-show="avail('${k}','${idx}')">${loc(`outer_shipyard_${k}_${v}`)}</b-dropdown-item>`;
            });

            options.append(`<b-dropdown :triggers="['hover']" aria-role="list">
                <button class="button is-info" slot="trigger">
                    <span>${loc(`outer_shipyard_${k}`)}: {{ b.${k} | lbl('${k}') }}</span>
                </button>${values}
            </b-dropdown>`);
        });

        plans.append(`<div class="assemble"><button class="button is-info" slot="trigger" v-on:click="build()"><span>${loc('outer_shipyard_build')}</span></button><span><b-checkbox class="patrol" v-model="s.expand" v-on:input="redraw()">${loc('outer_shipyard_fleet_details')}</b-checkbox></span><span>${loc(`outer_shipyard_park`,[races[global.race.species].solar.dwarf])}</span></div>`);

        updateCosts();

        vBind({
            el: '#shipPlans',
            data: {
                b: global.space.shipyard.blueprint,
                s: global.space.shipyard
            },
            methods: {
                setVal(b,v){
                    global.space.shipyard.blueprint[b] = v;
                    updateCosts();
                },
                avail(k,i){
                    return global.tech[`syard_${k}`] > i ? true : false;
                },
                crewText(){
                    return shipCrewSize(global.space.shipyard.blueprint);
                },
                powerText(){
                    let power = shipPower(global.space.shipyard.blueprint);
                    if (power < 0){
                        return `<span class="has-text-danger">${power}kW</span>`;
                    }
                    return `${power}kW`;
                },
                fireText(){
                    return shipAttackPower(global.space.shipyard.blueprint);
                },
                sensorText(){
                    return sensorRange(global.space.shipyard.blueprint.sensor) + 'km';
                },
                speedText(){
                    let speed = shipSpeed(global.space.shipyard.blueprint);
                    return +speed.toFixed(2);
                },
                fuelText(){
                    let fuel = shipFuelUse(global.space.shipyard.blueprint);
                    if (fuel.res){
                        return `-${fuel.burn} ${global.resource[fuel.res].name}`;
                    }
                    else {
                        return `N/A`;
                    }
                },
                build(){
                    if (shipPower(global.space.shipyard.blueprint) >= 0){
                        let raw = shipCosts(global.space.shipyard.blueprint);
                        let costs = {};
                        Object.keys(raw).forEach(function(res){
                            costs[res] = function(){ return raw[res]; }
                        });
                        if (payCosts(false, costs)){
                            let ship = deepClone(global.space.shipyard.blueprint);
                            ship['location'] = 'spc_dwarf';
                            ship['transit'] = 0;
                            ship['damage'] = 0;
                            ship['fueled'] = false;

                            if (ship.name.length === 0 || ship.name.toLowerCase() === 'random'){
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
                            drawShips();
                        }
                    }
                },
                redraw(){
                    drawShips();
                }
            },
            filters: {
                lbl(l,c){
                    return loc(`outer_shipyard_${c}_${l}`);
                }
            }
        });

        Object.keys(shipConfig).forEach(function(type){
            for (let i=0; i<$(`#shipPlans .${type}`).length; i++){
                popover(`shipPlans${type}${i}`, function(obj){
                    let val = $(obj.this).attr(`data-val`);
                    return loc(`outer_shipyard_${type}_${val}_desc`);
                },
                {
                    elm: `#shipPlans .${type}.a${i}`,
                    placement: 'right'
                });
            }
        });

        yard.append($(`<div id="shipList" class="sticky"></div>`));
        drawShips();
    }
}

function getRandomShipName(){
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
        'McShipFace','Monitor','Merrimack','Constitution','Ghost','Pequod','Arcadia','Corsair','Inferno','Jenny','Revenge','Red October','Jackdaw'
    ];

    return names[Math.rand(0, names.length)];
}

function updateCosts(){
    let costs = shipCosts(global.space.shipyard.blueprint);
    clearElement($(`#shipYardCosts`));

    Object.keys(costs).forEach(function(k){
        if (k === 'Money'){
            $(`#shipYardCosts`).append(`<span class="res-${k} has-text-success" data-${k}="${costs[k]}" data-ok="has-text-success">${global.resource[k].name}${sizeApproximation(costs[k])}</span>`);
        }
        else {
            $(`#shipYardCosts`).append(`<span> | </span><span class="res-${k} has-text-success" data-${k}="${costs[k]}" data-ok="has-text-success">${global.resource[k].name} ${sizeApproximation(costs[k])}</span>`);
        }
    });
}

export function shipCrewSize(ship){
    switch (ship.class){
        case 'corvette':
            return 2;
        case 'frigate':
            return 3;
        case 'destroyer':
            return 5;
        case 'cruiser':
            return 8;
        case 'battlecruiser':
            return 12;
        case 'dreadnought':
            return 20;
    }
}

function shipPower(ship){
    let watts = 0;

    let out_inflate = 1;
    let use_inflate = 1;
    switch (ship.class){
        case 'frigate':
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
            use_inflate = 8;
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
            watts = Math.round(175 * out_inflate);
            break;
        case 'elerium':
            watts = Math.round(200 * out_inflate);
            break;
    }

    switch (ship.weapon){
        case 'railgun':
            watts -= Math.round(10 * use_inflate);
            break;
        case 'laser':
            watts -= Math.round(30 * use_inflate);
            break;
        case 'p_laser':
            watts -= Math.round(18 * use_inflate);
            break;
        case 'plasma':
            watts -= Math.round(50 * use_inflate);
            break;
        case 'phaser':
            watts -= Math.round(65 * use_inflate);
            break;
        case 'disrupter':
            watts -= Math.round(100 * use_inflate);
            break;
    }

    switch (ship.engine){
        case 'ion':
            watts -= Math.round(25 * use_inflate);
            break;
        case 'tie':
            watts -= Math.round(50 * use_inflate);
            break;
        case 'pulse':
            watts -= Math.round(40 * use_inflate);
            break;
        case 'photon':
            watts -= Math.round(75 * use_inflate);
            break;
        case 'vacuum':
            watts -= Math.round(120 * use_inflate);
            break;
    }

    switch (ship.sensor){
        case 'radar':
            watts -= Math.round(10 * use_inflate);
            break;
        case 'lidar':
            watts -= Math.round(25 * use_inflate);
            break;
        case 'quantum':
            watts -= Math.round(75 * use_inflate);
            break;
    }

    return watts;
}

function shipAttackPower(ship){
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
        case 'disrupter':
            rating = 156;
            break;
    }

    switch (ship.class){
        case 'corvette':
            return rating;
        case 'frigate':
            return Math.round(rating * 1.3);
        case 'destroyer':
            return Math.round(rating * 2.75);
        case 'cruiser':
            return Math.round(rating * 5.5);
        case 'battlecruiser':
            return Math.round(rating * 10);
        case 'dreadnought':
            return Math.round(rating * 22);
    }
}

function shipSpeed(ship){
    let mass = 1;
    switch (ship.class){
        case 'corvette':
            mass = ship.armor === 'neutronium' ? 1.1 : 1;
            break;
        case 'frigate':
            mass = ship.armor === 'neutronium' ? 1.35 : 1.25;
            break;
        case 'destroyer':
            mass = ship.armor === 'neutronium' ? 1.95 : 1.8;
            break;
        case 'cruiser':
            mass = ship.armor === 'neutronium' ? 3.5 : 3;
            break;
        case 'battlecruiser':
            mass = ship.armor === 'neutronium' ? 4.8 : 4;
            break;
        case 'dreadnought':
            mass = ship.armor === 'neutronium' ? 7.5 : 6;
            break;
    }

    switch (ship.engine){
        case 'ion':
            return 10 / mass;
        case 'tie':
            return 18 / mass;
        case 'pulse':
            return 15 / mass;
        case 'photon':
            return 20 / mass;
        case 'vacuum':
            return 25 / mass;
    }
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
            burn = 5;
            break;
        case 'elerium':
            res = 'Elerium';
            burn = 1;
            break;
    }

    switch (ship.class){
        case 'frigate':
            burn *= 1.25;
            break;
        case 'destroyer':
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
    }

    return {
        res: res,
        burn: +(burn).toFixed(2)
    };
}

function shipCosts(bp){
    let costs = {};

    let h_inflate = 1;
    switch (bp.class){
        case 'corvette':
            costs['Money'] = 2500000;
            costs['Aluminium'] = 500000;
            h_inflate = 1;
            break;
        case 'frigate':
            costs['Money'] = 5000000;
            costs['Aluminium'] = 1250000;
            h_inflate = 1.1;
            break;
        case 'destroyer':
            costs['Money'] = 15000000;
            costs['Aluminium'] = 3500000;
            h_inflate = 1.2;
            break;
        case 'cruiser':
            costs['Money'] = 50000000;
            costs['Adamantite'] = 1000000; //12000000;
            h_inflate = 1.3;
            break;
        case 'battlecruiser':
            costs['Money'] = 125000000;
            costs['Adamantite'] = 2600000; //32000000;
            h_inflate = 1.4;
            break;
        case 'dreadnought':
            costs['Money'] = 1000000000;
            costs['Adamantite'] = 10000000; //128000000;
            h_inflate = 1.5;
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
    }

    switch (bp.engine){
        case 'ion':
            costs['Titanium'] = Math.round(75000 ** h_inflate);
            break;
        case 'tie':
            costs['Titanium'] = Math.round(150000 ** h_inflate);
            break;
        case 'pulse':
            costs['Titanium'] = Math.round(125000 ** h_inflate);
            break;
        case 'photon':
            costs['Titanium'] = Math.round(225000 ** h_inflate);
            break;
        case 'vacuum':
            costs['Titanium'] = Math.round(350000 ** h_inflate);
            break;
    }

    switch (bp.power){
        case 'solar':
            costs['Copper'] = Math.round(40000 ** h_inflate);
            costs['Iridium'] = Math.round(15000 ** h_inflate);
            break;
        case 'diesel':
            costs['Copper'] = Math.round(40000 ** h_inflate);
            costs['Iridium'] = Math.round(15000 ** h_inflate);
            break;
        case 'fission':
            costs['Copper'] = Math.round(50000 ** h_inflate);
            costs['Iridium'] = Math.round(30000 ** h_inflate);
            break;
        case 'fusion':
            costs['Copper'] = Math.round(50000 ** h_inflate);
            costs['Iridium'] = Math.round(40000 ** h_inflate);
            break;
        case 'elerium':
            costs['Copper'] = Math.round(60000 ** h_inflate);
            costs['Iridium'] = Math.round(75000 ** h_inflate);
            break;
    }

    switch (bp.sensor){
        case 'radar':
            costs['Money'] = Math.round(costs['Money'] ** 1.05);
            break;
        case 'lidar':
            costs['Money'] = Math.round(costs['Money'] ** 1.12);
            break;
        case 'quantum':
            costs['Money'] = Math.round(costs['Money'] ** 1.25);
            break;
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
            costs['Iridium'] = Math.round(costs['Iridium'] ** 1.175);
            costs['Nano_Tube'] = Math.round(35000 ** h_inflate);
            break;
        case 'disrupter':
            costs['Iridium'] = Math.round(costs['Iridium'] ** 1.25);
            costs['Nano_Tube'] = Math.round(65000 ** h_inflate);
            break;
    }

    return costs;
}

export function clearShipDrag(){
    let el = $('#shipList')[0];
    if (el){
        let sort = Sortable.get(el);
        if (sort){
            sort.destroy();
        }
    }
}

function dragShipList(){
    let el = $('#shipList')[0];
    Sortable.create(el,{
        onEnd(e){
            let order = global.space.shipyard.ships;
            order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
            global.space.shipyard.ships = order;
            drawShips();
        }
    });
}

function drawShips(){
    clearShipDrag();
    clearElement($('#shipList'));
    let list = $('#shipList');

    const spaceRegions = spaceTech();

    for (let i=0; i<global.space.shipyard.ships.length; i++){
        let ship = global.space.shipyard.ships[i];
        
        let values = ``;
        Object.keys(spaceRegions).forEach(function(region){
            if (spaceRegions[region].info.hasOwnProperty('syndicate') && spaceRegions[region].info.syndicate() || region === 'spc_dwarf'){
                let name = typeof spaceRegions[region].info.name === 'string' ? spaceRegions[region].info.name : spaceRegions[region].info.name();
                values += `<b-dropdown-item aria-role="listitem" v-on:click="setLoc('${region}',${i})">${name}</b-dropdown-item>`;
            }
        });

        let location = typeof spaceRegions[ship.location].info.name === 'string' ? spaceRegions[ship.location].info.name : spaceRegions[ship.location].info.name();

        let dispatch = `<b-dropdown :triggers="['hover']" aria-role="list">
            <button class="button is-info" slot="trigger">
                <span>${location}</span>
            </button>${values}
        </b-dropdown>`;
        
        if (global.space.shipyard.expand){
            let ship_class = `${loc(`outer_shipyard_engine_${ship.engine}`)} ${loc(`outer_shipyard_class_${ship.class}`)}`;
            let desc = $(`<div id="shipReg${i}" class="shipRow ship${i}"></div>`);
            let row1 = $(`<div class="row1"><span class="name has-text-caution">${ship.name}</span> | <a class="scrap${i}" @click="scrap(${i})">${loc(`outer_shipyard_scrap`)}</a> | <span class="has-text-warning">${ship_class}</span> | <span class="has-text-danger">${loc(`outer_shipyard_weapon_${ship.weapon}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_power_${ship.power}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_armor_${ship.armor}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_sensor_${ship.sensor}`)}</span></div>`);
            let row2 = $(`<div class="row2"></div>`);
            let row3 = $(`<div class="row3"></div>`);
            let row4 = $(`<div class="location">${dispatch}</div>`);
            
            row2.append(`<span class="has-text-warning">${loc(`crew`)}</span> <span class="pad" v-html="crewText(${i})"></span>`);
            row2.append(`<span class="has-text-warning">${loc(`firepower`)}</span> <span class="pad" v-html="fireText(${i})"></span>`);
            row2.append(`<span class="has-text-warning">${loc(`outer_shipyard_sensors`)}</span> <span class="pad" v-html="sensorText(${i})"></span>`);
            row2.append(`<span class="has-text-warning">${loc(`speed`)}</span> <span class="pad" v-html="speedText(${i})"></span>`);
            row2.append(`<span class="has-text-warning">${loc(`outer_shipyard_fuel`)}</span> <span class="pad" v-bind:class="{ 'has-text-danger': !fueled }" v-html="fuelText(${i})"></span>`);
            row2.append(`<span class="has-text-warning">${loc(`outer_shipyard_hull`)}</span> <span class="pad" v-bind:class="hullDamage(${i})" v-html="hullText(${i})"></span>`);

            row3.append(`<span v-show="show(${i})" class="has-text-caution" v-html="dest(${i})"></span>`);

            desc.append(row1);
            desc.append(row2);
            desc.append(row3);
            desc.append(row4);
            list.append(desc);
        }
        else {
            let desc = $(`<div id="shipReg${i}" class="shipRow ship${i} compact"></div>`);
            let row1 = $(`<div class="row1"></div>`);
            let row3 = $(`<div class="row3"></div>`);
            let row4 = $(`<div class="location">${dispatch}</div>`);
            
            row1.append(`<span class="name has-text-caution">${ship.name}</span> | `);
            row1.append(`<span class="has-text-warning">${loc(`firepower`)}</span> <span class="pad" v-html="fireText(${i})"></span>`);
            row1.append(`<span class="has-text-warning">${loc(`outer_shipyard_sensors`)}</span> <span class="pad" v-html="sensorText(${i})"></span>`);
            row1.append(`<span class="has-text-warning">${loc(`speed`)}</span> <span class="pad" v-html="speedText(${i})"></span>`);
            row1.append(`<span class="has-text-warning">${loc(`outer_shipyard_fuel`)}</span> <span class="pad" v-bind:class="{ 'has-text-danger': !fueled }" v-html="fuelText(${i})"></span>`);
            row1.append(`<span class="has-text-warning">${loc(`outer_shipyard_hull`)}</span> <span class="pad" v-bind:class="hullDamage(${i})" v-html="hullText(${i})"></span>`);

            row3.append(`<span v-show="show(${i})" class="has-text-caution" v-html="dest(${i})"></span>`);

            desc.append(row1);
            desc.append(row3);
            desc.append(row4);
            list.append(desc);
        }
    
        vBind({
            el: `#shipReg${i}`,
            data: global.space.shipyard.ships[i],
            methods: {
                scrap(id){
                    if (global.space.shipyard.ships[id]){
                        global.space.shipyard.ships.splice(id,1);
                        drawShips();
                    }
                },
                setLoc(l,id){
                    let distance = transferWindow(global.space.shipyard.ships[id].location,l);
                    let crew = shipCrewSize(global.space.shipyard.ships[id]);
                    if (global.civic.garrison.workers - global.civic.garrison.crew >= crew){
                        global.space.shipyard.ships[id].location = l;
                        global.space.shipyard.ships[id].transit = Math.round(distance / shipSpeed(global.space.shipyard.ships[id]));
                        global.civic.garrison.crew += crew;
                        drawShips();
                    }
                },
                crewText(id){
                    return shipCrewSize(global.space.shipyard.ships[id]);
                },
                fireText(id){
                    return shipAttackPower(global.space.shipyard.ships[id]);
                },
                sensorText(id){
                    return sensorRange(global.space.shipyard.ships[id].sensor) + 'km';
                },
                speedText(id){
                    let speed = shipSpeed(global.space.shipyard.ships[id]);
                    return +speed.toFixed(2);
                },
                fuelText(id){
                    let fuel = shipFuelUse(global.space.shipyard.ships[id]);
                    if (fuel.res){
                        return `${fuel.burn} ${global.resource[fuel.res].name}/s`;
                    }
                    else {
                        return `N/A`;
                    }
                },
                hullText(id){
                    return `${100 - global.space.shipyard.ships[id].damage}%`;
                },
                hullDamage(id){
                    if (global.space.shipyard.ships[id].damage <= 10){
                        return `has-text-success`;
                    }
                    else if (global.space.shipyard.ships[id].damage >= 40 && global.space.shipyard.ships[id].damage < 65){
                        return `has-text-caution`;
                    }
                    else if (global.space.shipyard.ships[id].damage >= 65){
                        return `has-text-danger`;
                    }
                    return ``;
                },
                dest(id){
                    return loc(`outer_shipyard_arrive`,[
                        typeof spaceRegions[global.space.shipyard.ships[id].location].info.name === 'string' ? spaceRegions[global.space.shipyard.ships[id].location].info.name : spaceRegions[global.space.shipyard.ships[id].location].info.name(),
                        global.space.shipyard.ships[id].transit
                    ]);
                },
                show(id){
                    return global.space.shipyard.ships[id].transit > 0 ? true : false;
                }
            }
        });
    }

    dragShipList();
}

export function syndicate(region,extra){
    if (global.tech['syndicate'] && global.race['truepath'] && global.space['syndicate'] && global.space.syndicate.hasOwnProperty(region)){
        let divisor = 1000;

        let rival = 0;
        if (global.civic.foreign.gov3.hstl < 10){
            rival = 250 - (25 * global.civic.foreign.gov3.hstl);
        }
        else if (global.civic.foreign.gov3.hstl > 60){
            rival = (-13 * (global.civic.foreign.gov3.hstl - 60));
        }
        rival *= global.tech.syndicate;

        switch (region){
            case 'spc_home':
            case 'spc_moon':
            case 'spc_red':
            case 'spc_hell':
                divisor = (1250 * global.tech.syndicate) + rival;
                break;
            case 'spc_gas':
            case 'spc_gas_moon':
            case 'spc_belt':
                divisor = (1020 * global.tech.syndicate) + rival;
                break;
            case 'spc_titan':
            case 'spc_enceladus':
                divisor = 600 * global.tech.syndicate;
                break;
        }

        let piracy = global.space.syndicate[region];
        let patrol = 0;
        let sensor = 0;
        if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
            global.space.shipyard.ships.forEach(function(ship){
                if (ship.location === region && ship.transit === 0 && ship.fueled){
                    let rating = shipAttackPower(ship);
                    patrol += ship.damage > 0 ? Math.round(rating * (100 - ship.damage) / 100) : rating;
                    sensor += sensorRange(ship.sensor);
                }
            });
            
            patrol = Math.round(patrol * ((sensor + 25) / 125));
            piracy = piracy - patrol > 0 ? piracy - patrol : 0;
        }

        if (extra){
            return {
                p: 1 - +(piracy / divisor).toFixed(4),
                r: piracy,
                s: sensor
            };
        }
        return 1 - +(piracy / divisor).toFixed(4);
    }

    if (extra){
        return { p: 1, r: 0, s: 0 };
    }
    return 1;
}

function sensorRange(s){
    switch (s){
        case 'visual':
            return 1;
        case 'radar':
            return 20;
        case 'lidar':
            return 35;
        case 'quantum':
            return 60;
    }
}

export const spacePlanetStats = {
    spc_moon: { dist: 1, orbit: -1, },
    spc_red: { dist: 1.524, orbit: 687 },
    spc_gas: { dist: 5.203, orbit: 4330 },
    spc_gas_moon: { dist: 5.204, orbit: 4330 },
    spc_belt: { dist: 2.7, orbit: 1642 },
    spc_dwarf: { dist: 5.203, orbit: 4330 },
    spc_titan: { dist: 9.539, orbit: 10751 },
    spc_enceladus: { dist: 9.540, orbit: 10751 },
};

export function setOrbits(){
    if (!global.space['position']){
        global.space['position'] = {};
    }
    Object.keys(spacePlanetStats).forEach(function(o){
        if (!global.space.position.hasOwnProperty(o)){
            global.space.position[o] = Math.rand(0,360);
        }
    });
    global.space.position.spc_gas_moon = global.space.position.spc_gas;
    global.space.position.spc_titan = global.space.position.spc_enceladus;
}

function transferWindow(from,to){
    let x1 = +(Math.cos(global.space.position[from] * (Math.PI / 180))).toFixed(5) * spacePlanetStats[from].dist;
    let y1 = +(Math.sin(global.space.position[from] * (Math.PI / 180))).toFixed(5) * spacePlanetStats[from].dist;

    let x2 = +(Math.cos(global.space.position[to] * (Math.PI / 180))).toFixed(5) * spacePlanetStats[to].dist;
    let y2 = +(Math.sin(global.space.position[to] * (Math.PI / 180))).toFixed(5) * spacePlanetStats[to].dist;

    return Math.ceil(Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2)) * 225);
}

export function storehouseMultiplier(){
    let multiplier = 1;
    if (global.race['pack_rat']){
        multiplier *= 1 + (traits.pack_rat.vars[1] / 100);
    }
    if (global.stats.achieve['blackhole']){
        multiplier *= 1 + global.stats.achieve.blackhole.l * 0.05;
    }
    if (global.tech['world_control']){
        multiplier *= 3;
    }
    if (p_on['titan_spaceport']){
        multiplier *= 1 + (p_on['titan_spaceport'] * 0.25);
    }
    return multiplier;
}
