import { save, global, webWorker, clearStates, poppers, keyMultiplier, sizeApproximation, p_on, red_on, belt_on, int_on, gal_on, quantum_level } from './vars.js';
import { clearElement, powerModifier, powerCostMod, calcPrestige, spaceCostMultiplier, vBind, messageQueue, randomKey } from './functions.js';
import { unlockAchieve, checkAchievements } from './achieve.js';
import { races, traits, genus_traits } from './races.js';
import { spatialReasoning, defineResources, galacticTrade } from './resources.js';
import { loadFoundry } from './jobs.js';
import { defineIndustry, garrisonSize, describeSoldier } from './civics.js';
import { payCosts, setAction, setPlanet, storageMultipler, drawTech, bank_vault, updateDesc, actionDesc } from './actions.js';
import { loc } from './locale.js';

const spaceProjects = {
    spc_home: {
        info: {
            name(){
                return races[global.race.species].home;
            },
            desc: loc('space_home_info_desc'),
        },
        test_launch: {
            id: 'space-test_launch',
            title: loc('space_home_test_launch_title'),
            desc: loc('space_home_test_launch_desc'),
            reqs: { space: 1 },
            grant: ['space',2],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Money(){ return 100000; },
                Oil(){ return fuel_adjust(7500); }
            },
            effect: loc('space_home_test_launch_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['satellite'] = { count: 0 };
                    messageQueue(loc('space_home_test_launch_action'),'info');
                    return true;
                }
                return false;
            }
        },
        satellite: {
            id: 'space-satellite',
            title: loc('space_home_satellite_title'),
            desc: loc('space_home_satellite_desc'),
            reqs: { space: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('satellite', offset, 72000, 1.22); },
                Knowledge(offset){ return spaceCostMultiplier('satellite', offset, 28000, 1.22); },
                Oil(offset){ return spaceCostMultiplier('satellite', offset, fuel_adjust(3200), 1.22); },
                Alloy(offset){ return spaceCostMultiplier('satellite', offset, 8000, 1.22); }
            },
            effect: `<div>${loc('plus_max_resource',[750,loc('resource_Knowledge_name')])}</div><div>${loc('space_home_satellite_effect2',[global.race['evil'] ? loc('city_babel_title') : loc('city_wardenclyffe')])}</div><div>${loc('space_home_satellite_effect3')}</div>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('satellite');
                    global['resource']['Knowledge'].max += 750;
                    return true;
                }
                return false;
            }
        },
        gps: {
            id: 'space-gps',
            title: loc('space_home_gps_title'),
            desc(){
                if (global.space.hasOwnProperty('gps') && global.space['gps'].count < 4){
                    return `<div>${loc('space_home_gps_desc')}</div><div class="has-text-special">${loc('space_home_gps_desc_req')}</div>`;
                }
                else {
                    return `<div>${loc('space_home_gps_desc')}</div>`;
                }
            },
            reqs: { satellite: 1 },
            not_trait: ['terrifying'],
            cost: {
                Money(offset){ return spaceCostMultiplier('gps', offset, 75000, 1.18); },
                Knowledge(offset){ return spaceCostMultiplier('gps', offset, 50000, 1.18); },
                Copper(offset){ return spaceCostMultiplier('gps', offset, 6500, 1.18); },
                Oil(offset){ return spaceCostMultiplier('gps', offset, fuel_adjust(3500), 1.18); },
                Titanium(offset){ return spaceCostMultiplier('gps', offset, 8000, 1.18); }
            },
            effect(){
                if (global.space.hasOwnProperty('gps') && global.space['gps'].count < 4){
                    return loc('space_home_gps_effect_req');
                }
                else {
                    return `<div>${loc('space_home_gps_effect')}</div><div>${loc('space_home_gps_effect2',[2])}</div>`;
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('gps');
                    return true;
                }
                return false;
            }
        },
        propellant_depot: {
            id: 'space-propellant_depot',
            title: loc('space_home_propellant_depot_title'),
            desc: loc('space_home_propellant_depot_desc'),
            reqs: { space_explore: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('propellant_depot', offset, 55000, 1.35); },
                Aluminium(offset){ return spaceCostMultiplier('propellant_depot', offset, 22000, 1.35); },
                Oil(offset){ return spaceCostMultiplier('propellant_depot', offset, fuel_adjust(5500), 1.35); },
            },
            effect(){
                let oil = spatialReasoning(1250) * (global.tech['world_control'] ? 1.5 : 1);
                if (global.resource['Helium_3'].display){
                    let helium = spatialReasoning(1000) * (global.tech['world_control'] ? 1.5 : 1);
                    return `<div>${loc('plus_max_resource',[oil,loc('resource_Oil_name')])}</div><div>${loc('plus_max_resource',[helium,loc('resource_Helium_3_name')])}</div>`;
                }
                return `<div>${loc('plus_max_resource',[oil,loc('resource_Oil_name')])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('propellant_depot');
                    global['resource']['Oil'].max += spatialReasoning(1250) * (global.tech['world_control'] ? 1.5 : 1);
                    if (global.resource['Helium_3'].display){
                        global['resource']['Helium_3'].max += spatialReasoning(1000) * (global.tech['world_control'] ? 1.5 : 1);
                    }
                    return true;
                }
                return false;
            }
        },
        nav_beacon: {
            id: 'space-nav_beacon',
            title: loc('space_home_nav_beacon_title'),
            desc: `<div>${loc('space_home_nav_beacon_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { luna: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('nav_beacon', offset, 75000, 1.32); },
                Copper(offset){ return spaceCostMultiplier('nav_beacon', offset, 38000, 1.32); },
                Aluminium(offset){ return spaceCostMultiplier('nav_beacon', offset, 44000, 1.32); },
                Oil(offset){ return spaceCostMultiplier('nav_beacon', offset, fuel_adjust(12500), 1.32); },
                Iridium(offset){ return spaceCostMultiplier('nav_beacon', offset, 1200, 1.32); }
            },
            powered(){ return powerCostMod(2); },
            effect(){
                let effect3 = global.tech['luna'] >=3 ? `<div>${loc('space_red_tower_effect1',[races[global.race.species].solar.red])}</div>` : '';
                return `<div>${loc('space_home_nav_beacon_effect1')}</div>${effect3}<div class="has-text-caution">${loc('space_home_nav_beacon_effect2')}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('nav_beacon');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.space.nav_beacon.on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    spc_moon: {
        info: {
            name: loc('space_moon_info_name'),
            desc(){
                let home = races[global.race.species].home;
                return loc('space_moon_info_desc',[home]);
            },
            support: 'moon_base',
        },
        moon_mission: {
            id: 'space-moon_mission',
            title: loc('space_moon_mission_title'),
            desc: loc('space_moon_mission_desc'),
            reqs: { space: 2, space_explore: 2 },
            grant: ['space',3],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: { 
                Oil(){ return +fuel_adjust(12000).toFixed(0); }
            },
            effect: loc('space_moon_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('space_moon_mission_action'),'info');
                    global.space['iridium_mine'] = { count: 0, on: 0 };
                    global.space['helium_mine'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        moon_base: {
            id: 'space-moon_base',
            title: loc('space_moon_base_title'),
            desc: `<div>${loc('space_moon_base_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { space: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('moon_base', offset, 22000, 1.32); },
                Cement(offset){ return spaceCostMultiplier('moon_base', offset, 18000, 1.32); },
                Alloy(offset){ return spaceCostMultiplier('moon_base', offset, 7800, 1.32); },
                Polymer(offset){ return spaceCostMultiplier('moon_base', offset, 12500, 1.32); }
            },
            effect(){
                let iridium = spatialReasoning(500);
                let oil = +(fuel_adjust(2)).toFixed(2);
                return `<div>${loc('space_moon_base_effect1')}</div><div>${loc('plus_max_resource',[iridium,loc('resource_Iridium_name')])}</div><div  class="has-text-caution">${loc('space_moon_base_effect3',[oil,$(this)[0].powered()])}</div>`;
            },
            support(){ return 2; },
            powered(){ return powerCostMod(4); },
            refresh: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('moon_base');
                    if (global.city.power >= $(this)[0].powered()){
                        global.space['moon_base'].on++;
                    }
                    if (global.space['moon_base'].count === 1){
                        global.tech['moon'] = 1;
                    }
                    if (!global.tech['luna']){
                        global.tech['luna'] = 1;
                    }
                    return true;
                }
                return false;
            }
        },
        iridium_mine: {
            id: 'space-iridium_mine',
            title: loc('space_moon_iridium_mine_title'),
            desc: `<div>${loc('space_moon_iridium_mine_desc')}</div><div class="has-text-special">${loc('space_support',[loc('space_moon_info_name')])}</div>`,
            reqs: { space: 3, luna: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('iridium_mine', offset, 42000, 1.35); },
                Lumber(offset){ return spaceCostMultiplier('iridium_mine', offset, 9000, 1.35); },
                Titanium(offset){ return spaceCostMultiplier('iridium_mine', offset, 17500, 1.35); }
            },
            effect(){
                let iridium = 0.035;
                if (global.city.geology['Iridium']){
                    iridium *= global.city.geology['Iridium'] + 1;
                }
                iridium = +(iridium * zigguratBonus()).toFixed(3);
                return `<div class="has-text-caution">${loc('space_used_support',[loc('space_moon_info_name')])}</div><div>${loc('space_moon_iridium_mine_effect',[iridium])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Iridium.display = true;
                    incrementStruct('iridium_mine');
                    if (!global.resource['Mythril'].display){
                        global.resource['Mythril'].display = true;
                        loadFoundry();
                    }
                    if (global.space.moon_base.support < global.space.moon_base.s_max){
                        global.space['iridium_mine'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        helium_mine: {
            id: 'space-helium_mine',
            title: loc('space_moon_helium_mine_title'),
            desc: `<div>${loc('space_moon_helium_mine_desc')}</div><div class="has-text-special">${loc('space_support',[loc('space_moon_info_name')])}</div>`,
            reqs: { space: 3, luna: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('helium_mine', offset, 38000, 1.35); },
                Aluminium(offset){ return spaceCostMultiplier('helium_mine', offset, 9000, 1.35); },
                Steel(offset){ return spaceCostMultiplier('helium_mine', offset, 17500, 1.35); }
            },
            effect(){
                let storage = spatialReasoning(100);
                let helium = +(0.18 * zigguratBonus()).toFixed(3);
                return `<div class="has-text-caution">${loc('space_used_support',[loc('space_moon_info_name')])}</div><div>${loc('space_moon_helium_mine_effect',[helium])}</div><div>${loc('plus_max_resource',[storage,loc('resource_Helium_3_name')])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource['Helium_3'].display = true;
                    incrementStruct('helium_mine');
                    if (global.space.moon_base.support < global.space.moon_base.s_max){
                        global.space['helium_mine'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        observatory: {
            id: 'space-observatory',
            title: loc('space_moon_observatory_title'),
            desc: `<div>${loc('space_moon_observatory_desc')}</div><div class="has-text-special">${loc('space_support',[loc('space_moon_info_name')])}</div>`,
            reqs: { science: 9, luna: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('observatory', offset, 200000, 1.28); },
                Knowledge(offset){ return spaceCostMultiplier('observatory', offset, 69000, 1.28); },
                Stone(offset){ return spaceCostMultiplier('observatory', offset, 125000, 1.28); },
                Iron(offset){ return spaceCostMultiplier('observatory', offset, 65000, 1.28); },
                Iridium(offset){ return spaceCostMultiplier('observatory', offset, 1250, 1.28); }
            },
            effect(){
                return `<div class="has-text-caution">${loc('space_used_support',[loc('space_moon_info_name')])}</div><div>${loc('plus_max_resource',[5000,loc('resource_Knowledge_name')])}</div><div>${loc('space_moon_observatory_effect',[5])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('observatory');
                    if (global.space.moon_base.support < global.space.moon_base.s_max){
                        global.space['observatory'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    spc_red: {
        info: {
            name(){
                return races[global.race.species].solar.red;
            },
            desc(){
                return loc('space_red_info_desc',[races[global.race.species].solar.red]);
            },
            support: 'spaceport',
        },
        red_mission: {
            id: 'space-red_mission',
            title(){
                return loc('space_mission_title',[races[global.race.species].solar.red]);
            },
            desc(){
                return loc('space_mission_desc',[races[global.race.species].solar.red]);
            },
            reqs: { space: 3, space_explore: 3 },
            grant: ['space',4],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: { 
                Helium_3(){ return +fuel_adjust(4500).toFixed(0); }
            },
            effect(){
                return loc('space_red_mission_effect',[races[global.race.species].solar.red]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('space_red_mission_action',[races[global.race.species].solar.red]),'info');
                    global.space['living_quarters'] = { count: 0, on: 0 };
                    global.space['garage'] = { count: 0 };
                    global.space['red_mine'] = { count: 0, on: 0 };
                    global.space['fabrication'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        spaceport: {
            id: 'space-spaceport',
            title: loc('space_red_spaceport_title'),
            desc: `<div>${loc('space_red_spaceport_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { space: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('spaceport', offset, 47500, 1.32); },
                Iridium(offset){ return spaceCostMultiplier('spaceport', offset, 1750, 1.32); },
                Mythril(offset){ return spaceCostMultiplier('spaceport', offset, 25, 1.32); },
                Titanium(offset){ return spaceCostMultiplier('spaceport', offset, 22500, 1.32); }
            },
            effect(){
                let helium = +(fuel_adjust(1.25)).toFixed(2);
                return `<div>${loc('space_red_spaceport_effect1',[races[global.race.species].solar.red])}</div><div class="has-text-caution">${loc('space_red_spaceport_effect2',[helium,$(this)[0].powered()])}</div><div class="has-text-caution">${loc('space_red_spaceport_effect3',[global.resource.Food.name])}</div>`;
            },
            support(){ return 3; },
            powered(){ return powerCostMod(5); },
            refresh: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('spaceport');
                    if (global.city.power >= $(this)[0].powered()){
                        global.space['spaceport'].on++;
                    }
                    if (!global.tech['mars']){
                        global.tech['mars'] = 1;
                    }
                    return true;
                }
                return false;
            }
        },
        red_tower: {
            id: 'space-red_tower',
            title: loc('space_red_tower_title'),
            desc(){
                return `<div>${loc('space_red_tower_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { mars: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('red_tower', offset, 225000, 1.28); },
                Iron(offset){ return spaceCostMultiplier('red_tower', offset, 22000, 1.28); },
                Cement(offset){ return spaceCostMultiplier('red_tower', offset, 15000, 1.28); },
                Alloy(offset){ return spaceCostMultiplier('red_tower', offset, 8000, 1.28); },
            },
            effect(){
                return `<div>${loc('space_red_tower_effect1',[races[global.race.species].solar.red])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(2); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('red_tower');
                    if (global.city.power >= 2){
                        global.space['red_tower'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        living_quarters: {
            id: 'space-living_quarters',
            title: loc('space_red_living_quarters_title'),
            desc(){
                return `<div>${loc('space_red_living_quarters_desc')}</div><div class="has-text-special">${loc('space_support',[races[global.race.species].solar.red])}</div>`;
            },
            reqs: { mars: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('living_quarters', offset, house_adjust(38000), 1.28); },
                Steel(offset){ return spaceCostMultiplier('living_quarters', offset, house_adjust(15000), 1.28); },
                Polymer(offset){ return spaceCostMultiplier('living_quarters', offset, house_adjust(9500), 1.28); }
            },
            effect(){
                let gain = 1;
                if (red_on['biodome']){
                    let pop = global.tech.mars >= 6 ? 0.1 : 0.05;
                    gain += pop * red_on['biodome'];
                }
                gain = +(gain).toFixed(1);
                return `<div class="has-text-caution">${loc('space_used_support',[races[global.race.species].solar.red])}</div><div>${loc('plus_max_resource',[1,loc('colonist')])}</div><div>${loc('plus_max_resource',[gain,loc('citizen')])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('living_quarters');
                    global.civic.colonist.display = true;
                    if (global.space.spaceport.support < global.space.spaceport.s_max){
                        global.space['living_quarters'].on++;
                        global.resource[global.race.species].max += 1;
                        if (global.civic.d_job === 'unemployed'){
                            if (global.civic.free > 0){
                                global.civic.free--;
                                global.civic.colonist.workers++;
                            }
                        }
                        else if (global.civic[global.civic.d_job].workers > 0){
                            global.civic[global.civic.d_job].workers--;
                            global.civic.colonist.workers++;
                        }
                    }
                    return true;
                }
                return false;
            }
        },
        vr_center: {
            id: 'space-vr_center',
            title: loc('space_red_vr_center_title'),
            desc(){
                return `<div>${loc('space_red_vr_center_desc')}</div><div class="has-text-special">${loc('space_support',[races[global.race.species].solar.red])}</div>`;
            },
            reqs: { mars: 1, broadcast: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('vr_center', offset, 380000, 1.25); },
                Copper(offset){ return spaceCostMultiplier('vr_center', offset, 55000, 1.25); },
                Stanene(offset){ return spaceCostMultiplier('vr_center', offset, 100000, 1.25); },
                Soul_Gem(offset){ return spaceCostMultiplier('vr_center', offset, 1, 1.25); }
            },
            effect(){
                return `<div class="has-text-caution">${loc('space_used_support',[races[global.race.species].solar.red])}</div><div>${loc('space_red_vr_center_effect1',[1])}</div><div>${loc('space_red_vr_center_effect2',[2])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('vr_center');
                    if (global.space.spaceport.support < global.space.spaceport.s_max){
                        global.space['vr_center'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        garage: {
            id: 'space-garage',
            title: loc('space_red_garage_title'),
            desc(){
                return `<div>${loc('space_red_garage_desc')}</div>`;
            },
            reqs: { mars: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('garage', offset, 75000, 1.28); },
                Iron(offset){ return spaceCostMultiplier('garage', offset, 12000, 1.28); },
                Brick(offset){ return spaceCostMultiplier('garage', offset, 3000, 1.28); },
                Sheet_Metal(offset){ return spaceCostMultiplier('garage', offset, 1500, 1.28); }
            },
            wide: true,
            effect(){
                let multiplier = global.tech['particles'] >= 4 ? 1 + (global.tech['supercollider'] / 20) : 1;
                let containers = global.tech['particles'] >= 4 ? 20 + global.tech['supercollider'] : 20;
                if (global.tech['world_control']){
                    multiplier *= global.tech['world_control'] ? 2 : 1;
                    containers += 10;
                }
                multiplier *= global.stats.achieve['blackhole'] ? 1 + (global.stats.achieve.blackhole.l * 0.05) : 1;
                let copper = sizeApproximation(+(spatialReasoning(6500) * multiplier).toFixed(0),1);
                let iron = sizeApproximation(+(spatialReasoning(5500) * multiplier).toFixed(0),1);
                let cement = sizeApproximation(+(spatialReasoning(6000) * multiplier).toFixed(0),1);
                let steel = sizeApproximation(+(spatialReasoning(4500) * multiplier).toFixed(0),1);
                let titanium = sizeApproximation(+(spatialReasoning(3500) * multiplier).toFixed(0),1);
                let alloy = sizeApproximation(+(spatialReasoning(2500) * multiplier).toFixed(0),1);
                
                let desc = '<div class="aTable">';
                desc = desc + `<span>${loc('plus_max_resource',[containers,loc('resource_Containers_name')])}</span><span>${loc('plus_max_resource',[copper,global.resource.Copper.name])}</span><span>${loc('plus_max_resource',[iron,global.resource.Iron.name])}</span><span>${loc('plus_max_resource',[cement,global.resource.Cement.name])}</span><span>${loc('plus_max_resource',[steel,global.resource.Steel.name])}</span><span>${loc('plus_max_resource',[titanium,global.resource.Titanium.name])}</span><span>${loc('plus_max_resource',[alloy,global.resource.Alloy.name])}</span>`;
                if (global.resource.Nano_Tube.display){
                    let nano = sizeApproximation(+(spatialReasoning(25000) * multiplier).toFixed(0),1);
                    desc = desc + `<span>${loc('plus_max_resource',[nano,global.resource.Nano_Tube.name])}</span>`
                }
                if (global.resource.Neutronium.display){
                    let neutronium = sizeApproximation(+(spatialReasoning(125) * multiplier).toFixed(0),1);
                    desc = desc + `<span>${loc('plus_max_resource',[neutronium,global.resource.Neutronium.name])}</span>`
                }
                if (global.resource.Infernite.display){
                    let infernite = sizeApproximation(+(spatialReasoning(75) * multiplier).toFixed(0),1);
                    desc = desc + `<span>${loc('plus_max_resource',[infernite,global.resource.Infernite.name])}</span>`
                }
                desc = desc + '</div>';
                return desc;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('garage');
                    let multiplier = global.tech['particles'] >= 4  ? 1 + (global.tech['supercollider'] / 20) : 1;
                    multiplier *= global.tech['world_control'] ? 2 : 1;
                    multiplier *= global.stats.achieve['blackhole'] ? 1 + (global.stats.achieve.blackhole.l * 0.05) : 1;
                    global['resource']['Copper'].max += (spatialReasoning(6500) * multiplier);
                    global['resource']['Iron'].max += (spatialReasoning(5500) * multiplier);
                    global['resource']['Cement'].max += (spatialReasoning(6000) * multiplier);
                    global['resource']['Steel'].max += (spatialReasoning(4500) * multiplier);
                    global['resource']['Titanium'].max += (spatialReasoning(3500) * multiplier);
                    global['resource']['Alloy'].max += (spatialReasoning(2500) * multiplier);
                    if (global.resource.Neutronium.display){
                        global['resource']['Neutronium'].max += (spatialReasoning(125) * multiplier);
                    }
                    return true;
                }
                return false;
            }
        },
        red_mine: {
            id: 'space-red_mine',
            title: loc('space_red_mine_title'),
            desc(){
                return `<div>${loc('space_red_mine_desc')}</div><div class="has-text-special">${loc('space_support',[races[global.race.species].solar.red])}</div>`;
            },
            reqs: { mars: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('red_mine', offset, 50000, 1.32); },
                Lumber(offset){ return spaceCostMultiplier('red_mine', offset, 65000, 1.32); },
                Iron(offset){ return spaceCostMultiplier('red_mine', offset, 33000, 1.32); }
            },
            effect(){
                let copper = +(0.25 * zigguratBonus()).toFixed(3);
                let titanium = +(0.02 * zigguratBonus()).toFixed(3);
                return `<div class="has-text-caution">${loc('space_used_support',[races[global.race.species].solar.red])}</div><div>${loc('space_red_mine_effect',[copper,global.resource.Copper.name])}</div><div>${loc('space_red_mine_effect',[titanium,global.resource.Titanium.name])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('red_mine');
                    if (global.space.spaceport.support < global.space.spaceport.s_max){
                        global.space['red_mine'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        fabrication: {
            id: 'space-fabrication',
            title: loc('space_red_fabrication_title'),
            desc(){
                return `<div>${loc('space_red_fabrication_desc')}</div><div class="has-text-special">${loc('space_support',[races[global.race.species].solar.red])}</div>`;
            },
            reqs: { mars: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('fabrication', offset, 90000, 1.32); },
                Copper(offset){ return spaceCostMultiplier('fabrication', offset, 25000, 1.32); },
                Cement(offset){ return spaceCostMultiplier('fabrication', offset, 12000, 1.32); },
                Wrought_Iron(offset){ return spaceCostMultiplier('fabrication', offset, 1200, 1.32); }
            },
            effect(){
                return `<div class="has-text-caution">${loc('space_used_support',[races[global.race.species].solar.red])}</div><div>${loc('space_red_fabrication_effect1')}</div><div>${loc('space_red_fabrication_effect2')}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('fabrication');
                    if (global.space.spaceport.support < global.space.spaceport.s_max){
                        global.space['fabrication'].on++;
                        global.civic.craftsman.max++;
                    }
                    return true;
                }
                return false;
            }
        },
        red_factory: {
            id: 'space-red_factory',
            title: loc('space_red_factory_title'),
            desc: `<div>${loc('space_red_factory_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { mars: 4 },
            cost: { 
                Money(offset){ return spaceCostMultiplier('red_factory', offset, 75000, 1.32); },
                Brick(offset){ return spaceCostMultiplier('red_factory', offset, 10000, 1.32); },
                Coal(offset){ return spaceCostMultiplier('red_factory', offset, 7500, 1.32); },
                Mythril(offset){ return spaceCostMultiplier('red_factory', offset, 50, 1.32); }
            },
            effect(){
                let desc = `<div>${loc('space_red_factory_effect1')}</div>`;
                if (global.tech['foundry'] >= 7){
                    desc = desc + `<div>${loc('space_red_factory_effect2')}</div>`;
                }
                let helium = +(fuel_adjust(1)).toFixed(2);
                desc = desc + `<div class="has-text-caution">${loc('space_red_factory_effect3',[helium,$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(3); },
            special: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['red_factory'].count++;
                    if (global.city.power > 2){
                        global.space['red_factory'].on++;
                    }
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        biodome: {
            id: 'space-biodome',
            title(){return global.race['soul_eater'] ? loc('space_red_asphodel_title') : loc('space_red_biodome_title'); },
            desc(){
                let desc;
                if (global.race['soul_eater']) {
                    desc = `<div>${loc('space_red_asphodel_desc')}</div>`;
                }
                else {
                    if (global.race['carnivore']){
                        desc = `<div>${loc('space_red_biodome_desc_carn')}</div>`;
                    }
                    else {
                        desc = `<div>${loc('space_red_biodome_desc',[races[global.race.species].solar.red])}</div>`;
                    }
                }
                return `<div>${desc}</div><div class="has-text-special">${loc('space_support',[races[global.race.species].solar.red])}</div>`;
            },
            reqs: { mars: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('biodome', offset, 45000, 1.28); },
                Lumber(offset){ return spaceCostMultiplier('biodome', offset, 65000, 1.28); },
                Brick(offset){ return spaceCostMultiplier('biodome', offset, 1000, 1.28); }
            },
            effect(){
                let food = +(0.25 * zigguratBonus()).toFixed(2);
                let pop = global.tech.mars >= 6 ? 0.1 : 0.05;
                return `<div class="has-text-caution">${loc('space_used_support',[races[global.race.species].solar.red])}</div><div>${loc('space_red_biodome_effect',[food,global.resource.Food.name])}</div><div>${loc('space_red_biodome_effect2',[pop])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('biodome');
                    unlockAchieve('colonist');
                    if (global.race['joyless']){
                        unlockAchieve('joyless');
                        delete global.race['joyless'];
                        drawTech();
                    }
                    if (global.space.spaceport.support < global.space.spaceport.s_max){
                        global.space['biodome'].on++;
                    }
                    return true;
                }
                return false;
            },
            flair(){
                return global.race['soul_eater'] ? loc('space_red_asphodel_flair') : (global.race['carnivore'] ? loc('space_red_biodome_flair_carn') : loc('space_red_biodome_flair'));
            }
        },
        exotic_lab: {
            id: 'space-exotic_lab',
            title: loc('space_red_exotic_lab_title'),
            desc(){
                return `<div>${loc('space_red_exotic_lab_desc')}</div><div class="has-text-special">${loc('space_support',[races[global.race.species].solar.red])}</div>`;
            },
            reqs: { mars: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('exotic_lab', offset, 750000, 1.28); },
                Steel(offset){ return spaceCostMultiplier('exotic_lab', offset, 100000, 1.28); },
                Mythril(offset){ return spaceCostMultiplier('exotic_lab', offset, 1000, 1.28); },
                Elerium(offset){ return spaceCostMultiplier('exotic_lab', offset, 20, 1.28) - 4; }
            },
            effect(){
                let sci = 500;
                if (global.tech['science'] >= 13 && global.interstellar['laboratory']){
                    sci += int_on['laboratory'] * 25;
                }
                if (global.tech['ancient_study'] && global.tech['ancient_study'] >= 2){
                    sci += global.space.ziggurat.count * 15;
                }
                if (global.tech.mass >= 2){
                    sci += p_on['mass_driver'] * global.civic.scientist.workers;
                }
                let elerium = spatialReasoning(10);
                return `<div class="has-text-caution">${loc('space_used_support',[races[global.race.species].solar.red])}</div><div>${loc('space_red_exotic_lab_effect1',[sci])}</div><div>${loc('plus_max_resource',[elerium,loc('resource_Elerium_name')])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('exotic_lab');
                    if (global.space.spaceport.support < global.space.spaceport.s_max){
                        global.space['exotic_lab'].on++;
                    }
                    return true;
                }
                return false;
            },
            flair(){
                return `<div>${loc('space_red_exotic_lab_flair1')}</div><div>${loc('space_red_exotic_lab_flair2')}</div>`;
            }
        },
        ziggurat: {
            id: 'space-ziggurat',
            title: loc('space_red_ziggurat_title'),
            desc(){
                let entity = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
                return `<div>${loc('space_red_ziggurat_desc',[entity])}</div>`;
            },
            reqs: { theology: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('ziggurat', offset, 600000, 1.28); },
                Stone(offset){ return spaceCostMultiplier('ziggurat', offset, 250000, 1.28); },
                Aluminium(offset){ return spaceCostMultiplier('ziggurat', offset, 70000, 1.28); },
                Mythril(offset){ return spaceCostMultiplier('ziggurat', offset, 250, 1.28); }
            },
            effect(){
                let bonus = global.tech['ancient_study'] ? 0.6 : 0.4;
                if (global.tech['ancient_deify'] && global.tech['ancient_deify'] >= 2){
                    bonus += 0.01 * red_on['exotic_lab'];
                }
                bonus = +(bonus).toFixed(2);
                let desc = `<div>${loc('space_red_ziggurat_effect',[bonus])}</div>`;
                if (global.tech['ancient_study'] && global.tech['ancient_study'] >= 2){
                    desc = desc + `<div>${loc('interstellar_laboratory_effect',[3])}</div>`;
                }
                if (global.genes['ancients'] && global.genes['ancients'] >= 3){
                    desc = desc + `<div>${loc('city_temple_effect6')}</div>`;
                }
                return desc;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('ziggurat');
                    return true;
                }
                return false;
            }
        },
        space_barracks: {
            id: 'space-space_barracks',
            title: loc('space_red_space_barracks_title'),
            desc(){
                return `<div>${loc('space_red_space_barracks_desc')}</div><div class="has-text-special">${loc('space_red_space_barracks_desc_req')}</div>`;
            },
            reqs: { marines: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('space_barracks', offset, 350000, 1.28); },
                Alloy(offset){ return spaceCostMultiplier('space_barracks', offset, 65000, 1.28); },
                Iridium(offset){ return spaceCostMultiplier('space_barracks', offset, 22500, 1.28); },
                Wrought_Iron(offset){ return spaceCostMultiplier('space_barracks', offset, 12500, 1.28); }
            },
            effect(){
                let oil = +fuel_adjust(2).toFixed(2);
                let soldiers = global.tech.marines >= 2 ? 4 : 2;
                return `<div>${loc('plus_max_soldiers',[soldiers])}</div><div class="has-text-caution">${loc('space_red_space_barracks_effect2',[oil])}</div><div class="has-text-caution">${loc('space_red_space_barracks_effect3',[global.resource.Food.name])}</div>`;
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('space_barracks');
                    global.space['space_barracks'].on++;
                    return true;
                }
                return false;
            }
        },
    },
    spc_hell: {
        info: {
            name(){
                return races[global.race.species].solar.hell;
            },
            desc(){
                return loc('space_hell_info_desc',[races[global.race.species].solar.hell]);
            },
        },
        hell_mission: {
            id: 'space-hell_mission',
            title(){
                return loc('space_mission_title',[races[global.race.species].solar.hell]);
            },
            desc(){
                return loc('space_mission_desc',[races[global.race.species].solar.hell]);
            },
            reqs: { space: 3, space_explore: 3 },
            grant: ['hell',1],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: { 
                Helium_3(){ return +fuel_adjust(6500).toFixed(0); }
            },
            effect(){
                return loc('space_hell_mission_effect1',[races[global.race.species].solar.hell]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('space_hell_mission_action',[races[global.race.species].solar.hell]),'info');
                    global.space['geothermal'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        geothermal: {
            id: 'space-geothermal',
            title: loc('space_hell_geothermal_title'),
            desc(){
                return `<div>${loc('space_hell_geothermal_desc')}</div><div class="has-text-special">${loc('space_hell_geothermal_desc_req')}</div>`;
            },
            reqs: { hell: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('geothermal', offset, 38000, 1.35); },
                Steel(offset){ return spaceCostMultiplier('geothermal', offset, 15000, 1.35); },
                Polymer(offset){ return spaceCostMultiplier('geothermal', offset, 9500, 1.35); }
            },
            effect(){
                let helium = +(fuel_adjust(0.5)).toFixed(2);
                return `<span>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered())])}</span>, <span class="has-text-caution">${loc('space_belt_station_effect3',[helium])}</span>`;
            },
            powered(){
                let power = -8;
                if (global.race['forge']){
                    power -= traits.forge.vars[0];
                }
                return powerModifier(power);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('geothermal');
                    global.space['geothermal'].on++;
                    return true;
                }
                return false;
            }
        },
        swarm_plant: {
            id: 'space-swarm_plant',
            title: loc('space_hell_swarm_plant_title'),
            desc(){
                return `<div>${loc('space_hell_swarm_plant_desc')}</div>`;
            },
            reqs: { solar: 4, hell: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(75000), 1.28); },
                Iron(offset){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(65000), 1.28); },
                Neutronium(offset){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(75), 1.28); },
                Brick(offset){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(2500), 1.28); },
                Mythril(offset){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(100), 1.28); }
            },
            effect(){
                let reduce = global.tech['swarm'] ? 0.88 : 0.94;
                if (global.tech['swarm'] >= 3){
                    reduce -= quantum_level / 100;
                }
                if (reduce < 0.05){
                    reduce = 0.05;
                }
                reduce = +((1 - reduce) * 100).toFixed(2);
                return loc('space_hell_swarm_plant_effect1',[reduce]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('swarm_plant');
                    return true;
                }
                return false;
            }
        },
    },
    spc_sun: {
        info: {
            name(){
                return loc('space_sun_info_name');
            },
            desc(){
                return loc('space_sun_info_desc',[races[global.race.species].home]);
            },
            support: 'swarm_control',
        },
        sun_mission: {
            id: 'space-sun_mission',
            title(){
                return loc('space_sun_mission_title');
            },
            desc(){
                return loc('space_sun_mission_desc');
            },
            reqs: { space_explore: 4 },
            grant: ['solar',1],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: { 
                Helium_3(){ return +fuel_adjust(15000).toFixed(0); }
            },
            effect(){
                return loc('space_sun_mission_effect1');
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        swarm_control: {
            id: 'space-swarm_control',
            title: loc('space_sun_swarm_control_title'),
            desc(){
                return `<div>${loc('space_sun_swarm_control_desc')}</div>`;
            },
            reqs: { solar: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('swarm_control', offset, 100000, 1.3); },
                Knowledge(offset){ return spaceCostMultiplier('swarm_control', offset, 60000, 1.3); },
                Alloy(offset){ return spaceCostMultiplier('swarm_control', offset, 7500, 1.3); },
                Helium_3(offset){ return spaceCostMultiplier('swarm_control', offset, fuel_adjust(2000), 1.3); },
                Mythril(offset){ return spaceCostMultiplier('swarm_control', offset, 250, 1.3); }
            },
            effect(){
                let control = global.tech['swarm'] && global.tech['swarm'] >= 2 ? 18 : 10;
                return loc('space_sun_swarm_control_effect1',[control]);
            },
            support(){ return 6; },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('swarm_control');
                    global.space['swarm_control'].s_max += global.tech['swarm'] && global.tech['swarm'] >= 2 ? 18 : 10;
                    return true;
                }
                return false;
            }
        },
        swarm_satellite: {
            id: 'space-swarm_satellite',
            title: loc('space_sun_swarm_satellite_title'),
            desc(){
                return `<div>${loc('space_sun_swarm_satellite_desc')}<div><div class="has-text-special">${loc('space_sun_swarm_satellite_desc_req')}</div>`;
            },
            reqs: { solar: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('swarm_satellite', offset, swarm_adjust(5000), 1.1); },
                Copper(offset){ return spaceCostMultiplier('swarm_satellite', offset, swarm_adjust(2500), 1.1); },
                Iridium(offset){ return spaceCostMultiplier('swarm_satellite', offset, swarm_adjust(150), 1.1); },
                Helium_3(offset){ return spaceCostMultiplier('swarm_satellite', offset, swarm_adjust(fuel_adjust(50)), 1.1); }
            },
            effect(){
                let solar = 0.35;
                if (global.tech.swarm >= 4){
                    solar += 0.15 * (global.tech.swarm - 3);
                }
                solar = +(solar).toFixed(2);
                return `<span>${loc('space_dwarf_reactor_effect1',[powerModifier(solar)])}</span>, <span class="has-text-caution">${loc('space_sun_swarm_satellite_effect1',[1])}</span>`;
            },
            support(){ return -1; },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('swarm_satellite');
                    global.space['swarm_control'].support++;
                    return true;
                }
                return false;
            }
        },
    },
    spc_gas: {
        info: {
            name(){
                return races[global.race.species].solar.gas;
            },
            desc(){
                return loc('space_gas_info_desc',[races[global.race.species].solar.gas, races[global.race.species].home]);
            },
        },
        gas_mission: {
            id: 'space-gas_mission',
            title(){
                return loc('space_mission_title',[races[global.race.species].solar.gas]);
            },
            desc(){
                return loc('space_mission_desc',[races[global.race.species].solar.gas]);
            },
            reqs: { space: 4, space_explore: 4 },
            grant: ['space',5],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: { 
                Helium_3(){ return +fuel_adjust(12500).toFixed(0); }
            },
            effect(){
                return `<div>${loc('space_gas_mission_effect1')}</div><div>${loc('space_gas_mission_effect2',[races[global.race.species].solar.gas])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('space_gas_mission_action',[races[global.race.species].solar.gas]),'info');
                    global.settings.space.gas_moon = true;
                    global.settings.space.belt = true;
                    global.space['space_station'] = { count: 0, on: 0, support: 0, s_max: 0 };
                    return true;
                }
                return false;
            }
        },
        gas_mining: {
            id: 'space-gas_mining',
            title: loc('space_gas_mining_title'),
            desc(){
                return `<div>${loc('space_gas_mining_desc')}<div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { gas_giant: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('gas_mining', offset, 250000, 1.32); },
                Uranium(offset){ return spaceCostMultiplier('gas_mining', offset, 500, 1.32); },
                Alloy(offset){ return spaceCostMultiplier('gas_mining', offset, 10000, 1.32); },
                Helium_3(offset){ return spaceCostMultiplier('gas_mining', offset, fuel_adjust(2500), 1.32); },
                Mythril(offset){ return spaceCostMultiplier('gas_mining', offset, 25, 1.32); }
            },
            effect(){
                let helium = +((global.tech['helium'] ? 0.65 : 0.5) * zigguratBonus()).toFixed(2);
                return `<div>${loc('space_gas_mining_effect1',[helium])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(2); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('gas_mining');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.space.gas_mining.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        gas_storage: {
            id: 'space-gas_storage',
            title(){ return loc('space_gas_storage_title',[races[global.race.species].solar.gas]); },
            desc(){
                return `<div>${loc('space_gas_storage_desc')}<div>`;
            },
            reqs: { gas_giant: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('gas_storage', offset, 125000, 1.32); },
                Iridium(offset){ return spaceCostMultiplier('gas_storage', offset, 3000, 1.32); },
                Sheet_Metal(offset){ return spaceCostMultiplier('gas_storage', offset, 2000, 1.32); },
                Helium_3(offset){ return spaceCostMultiplier('gas_storage', offset, fuel_adjust(1000), 1.32); },
            },
            effect(){
                let oil = spatialReasoning(3500) * (global.tech['world_control'] ? 1.5 : 1);
                let helium = spatialReasoning(2500) * (global.tech['world_control'] ? 1.5 : 1);
                let uranium = spatialReasoning(1000) * (global.tech['world_control'] ? 1.5 : 1);
                return `<div>${loc('plus_max_resource',[oil,loc('resource_Oil_name')])}</div><div>${loc('plus_max_resource',[helium,loc('resource_Helium_3_name')])}</div><div>${loc('plus_max_resource',[uranium,loc('resource_Uranium_name')])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('gas_storage');
                    return true;
                }
                return false;
            }
        },
        star_dock: {
            id: 'space-star_dock',
            title(){ return loc('space_gas_star_dock_title'); },
            desc(){
                return `<div>${loc('space_gas_star_dock_title')}<div><div class="has-text-special">${loc('space_gas_star_dock_desc_req')}</div>`;
            },
            reqs: { genesis: 3 },
            no_queue(){ return global.space.star_dock.count < 1 ? false : true },
            cost: {
                Money(){ return !global.space.hasOwnProperty('star_dock') || global.space.star_dock.count === 0 ? 1500000 : 0; },
                Steel(){ return !global.space.hasOwnProperty('star_dock') || global.space.star_dock.count === 0 ? 500000 : 0; },
                Helium_3(){ return !global.space.hasOwnProperty('star_dock') || global.space.star_dock.count === 0 ? Math.round(fuel_adjust(10000)) : 0; },
                Nano_Tube(){ return !global.space.hasOwnProperty('star_dock') || global.space.star_dock.count === 0 ? 250000 : 0; },
                Mythril(){ return !global.space.hasOwnProperty('star_dock') || global.space.star_dock.count === 0 ? 10000 : 0; },
            },
            effect(){
                return `<div>${loc('space_gas_star_dock_effect1')}</div>`;
            },
            special: true,
            action(){
                if (global.space.star_dock.count === 0 && payCosts($(this)[0].cost)){
                    incrementStruct('star_dock');
                    return true;
                }
                return false;
            }
        },
    },
    spc_gas_moon: {
        info: {
            name(){
                return races[global.race.species].solar.gas_moon;
            },
            desc(){
                return loc('space_gas_moon_info_desc',[races[global.race.species].solar.gas_moon,races[global.race.species].solar.gas]);
            },
        },
        gas_moon_mission: {
            id: 'space-gas_moon_mission',
            title(){
                return loc('space_mission_title',[races[global.race.species].solar.gas_moon]);
            },
            desc(){
                return loc('space_mission_desc',[races[global.race.species].solar.gas_moon]);
            },
            reqs: { space: 5 },
            grant: ['space',6],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: { 
                Helium_3(){ return +fuel_adjust(30000).toFixed(0); }
            },
            effect(){
                return loc('space_gas_moon_mission_effect',[races[global.race.species].solar.gas_moon]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('space_gas_moon_mission_action',[races[global.race.species].solar.gas_moon]),'info');
                    global.space['outpost'] = { count: 0, on: 0 };
                    global.tech['gas_moon'] = 1;
                    return true;
                }
                return false;
            }
        },
        outpost: {
            id: 'space-outpost',
            title: loc('space_gas_moon_outpost_title'),
            desc(){
                return `<div>${loc('space_gas_moon_outpost_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { gas_moon: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('outpost', offset, 666000, 1.3); },
                Titanium(offset){ return spaceCostMultiplier('outpost', offset, 18000, 1.3); },
                Iridium(offset){ return spaceCostMultiplier('outpost', offset, 2500, 1.3); },
                Helium_3(offset){ return spaceCostMultiplier('outpost', offset, fuel_adjust(6000), 1.3); },
                Mythril(offset){ return spaceCostMultiplier('outpost', offset, 300, 1.3); }
            },
            effect(){
                let neutronium = 0.025;
                if (global.tech['drone']){
                    neutronium *= 1 + (global.space.drone.count * 0.06);
                }
                neutronium = +(neutronium * zigguratBonus()).toFixed(3);
                let max = spatialReasoning(500);
                let oil = +(fuel_adjust(2)).toFixed(2);
                return `<div>${loc('space_gas_moon_outpost_effect1',[neutronium])}</div><div>${loc('plus_max_resource',[max,loc('resource_Neutronium_name')])}</div><div class="has-text-caution">${loc('space_gas_moon_outpost_effect3',[oil,$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(3); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('outpost');
                    global.resource['Neutronium'].display = true;
                    if (global.city.power >= $(this)[0].powered()){
                        global.space['outpost'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        drone: {
            id: 'space-drone',
            title: loc('space_gas_moon_drone_title'),
            desc(){
                return `<div>${loc('space_gas_moon_drone_desc')}</div>`;
            },
            reqs: { gas_moon: 1, drone: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('drone', offset, 250000, 1.3); },
                Steel(offset){ return spaceCostMultiplier('drone', offset, 20000, 1.3); },
                Neutronium(offset){ return spaceCostMultiplier('drone', offset, 500, 1.3); },
                Elerium(offset){ return spaceCostMultiplier('drone', offset, 25, 1.3); },
                Nano_Tube(offset){ return spaceCostMultiplier('drone', offset, 45000, 1.3); }
            },
            effect(){
                return `<div>${loc('space_gas_moon_drone_effect1')}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('drone');
                    return true;
                }
                return false;
            }
        },
        oil_extractor: {
            id: 'space-oil_extractor',
            title: loc('space_gas_moon_oil_extractor_title'),
            desc(){
                return `<div>${loc('space_gas_moon_oil_extractor_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { gas_moon: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('oil_extractor', offset, 666000, 1.3); },
                Polymer(offset){ return spaceCostMultiplier('oil_extractor', offset, 7500, 1.3); },
                Helium_3(offset){ return spaceCostMultiplier('oil_extractor', offset, fuel_adjust(2500), 1.3); },
                Wrought_Iron(offset){ return spaceCostMultiplier('oil_extractor', offset, 5000, 1.3); },
            },
            effect(){
                let oil = global.tech['oil'] >= 4 ? 0.48 : 0.4;
                if (global.tech['oil'] >= 7){
                    oil *= 2;
                }
                else if (global.tech['oil'] >= 5){
                    oil *= global.tech['oil'] >= 6 ? 1.75 : 1.25;
                }
                oil *= zigguratBonus();
                oil = +oil.toFixed(2);
                return `<span>${loc('space_gas_moon_oil_extractor_effect1',[oil])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span>`;
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('oil_extractor');
                    if (global.city.power >= $(this)[0].powered()){
                        global.space['oil_extractor'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    spc_belt: {
        info: {
            name(){
                return loc('space_belt_info_name');
            },
            desc(){
                return global.space['space_station'] && global.space.space_station.count > 0
                    ? `<div>${loc('space_belt_info_desc',[races[global.race.species].solar.red,races[global.race.species].solar.gas])}</div><div class="has-text-special">${loc('space_belt_info_desc2')}</div>`
                    : loc('space_belt_info_desc',[races[global.race.species].solar.red,races[global.race.species].solar.gas]);
            },
            support: 'space_station'
        },
        belt_mission: {
            id: 'space-belt_mission',
            title(){
                return loc('space_belt_mission_title');
            },
            desc(){
                return loc('space_belt_mission_desc');
            },
            reqs: { space: 5 },
            grant: ['asteroid',1],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: { 
                Helium_3(){ return +fuel_adjust(25000).toFixed(0); }
            },
            effect(){
                return loc('space_belt_mission_effect1');
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('space_belt_mission_action'),'info');
                    global.settings.space.dwarf = true;
                    return true;
                }
                return false;
            }
        },
        space_station: {
            id: 'space-space_station',
            title: loc('space_belt_station_title'),
            desc(){
                return `<div>${loc('space_belt_station_desc')}<div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { asteroid: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('space_station', offset, 250000, 1.3); },
                Iron(offset){ return spaceCostMultiplier('space_station', offset, 85000, 1.3); },
                Polymer(offset){ return spaceCostMultiplier('space_station', offset, 18000, 1.3); },
                Iridium(offset){ return spaceCostMultiplier('space_station', offset, 2800, 1.28); },
                Helium_3(offset){ return spaceCostMultiplier('space_station', offset, fuel_adjust(2000), 1.3); },
                Mythril(offset){ return spaceCostMultiplier('space_station', offset, 75, 1.25); }
            },
            effect(){
                let helium = +(fuel_adjust(2.5)).toFixed(2);
                let food = 10;
                let elerium_cap = spatialReasoning(5);
                let elerium = global.tech['asteroid'] >= 5 ? `<div>${loc('plus_max_resource',[elerium_cap, loc('resource_Elerium_name')])}</div>` : '';
                return `<div>${loc('plus_max_space_miners',[3])}</div>${elerium}<div class="has-text-caution">${loc('space_belt_station_effect3',[helium])}</div><div class="has-text-caution">${loc('space_belt_station_effect4',[food,$(this)[0].powered(),global.resource.Food.name])}</div>`;
            },
            support(){ return 3; },
            powered(){ return powerCostMod(3); },
            refresh: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('space_station');
                    global.civic.space_miner.display = true;
                    if (global.tech['asteroid'] < 3){
                        global.tech['asteroid'] = 3;
                    }
                    if (global.city.power >= $(this)[0].powered()){
                        global.space.space_station.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        elerium_ship: {
            id: 'space-elerium_ship',
            title: loc('space_belt_elerium_ship_title'),
            desc(){
                return loc('space_belt_elerium_ship_title');
            },
            reqs: { asteroid: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('elerium_ship', offset, 500000, 1.3); },
                Uranium(offset){ return spaceCostMultiplier('elerium_ship', offset, 2500, 1.3); },
                Titanium(offset){ return spaceCostMultiplier('elerium_ship', offset, 10000, 1.3); },
                Mythril(offset){ return spaceCostMultiplier('elerium_ship', offset, 500, 1.3); },
                Helium_3(offset){ return spaceCostMultiplier('elerium_ship', offset, fuel_adjust(5000), 1.3); }
            },
            effect(){
                let elerium = +((global.tech.asteroid >= 6 ?  (global.tech.asteroid >= 7 ? 0.009 : 0.0075) : 0.005) * zigguratBonus()).toFixed(4);
                return `<div class="has-text-caution">${loc('space_belt_elerium_ship_effect1')}</div><div>${loc('space_belt_elerium_ship_effect2',[elerium])}</div>`;
            },
            support(){ return -2; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('elerium_ship');
                    if (global.space.space_station.support + 1 < global.space.space_station.s_max){
                        global.space['elerium_ship'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        iridium_ship: {
            id: 'space-iridium_ship',
            title: loc('space_belt_iridium_ship_title'),
            desc(){
                return loc('space_belt_iridium_ship_title');
            },
            reqs: { asteroid: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('iridium_ship', offset, 120000, 1.3); },
                Uranium(offset){ return spaceCostMultiplier('iridium_ship', offset, 1000, 1.3); },
                Alloy(offset){ return spaceCostMultiplier('iridium_ship', offset, 48000, 1.3); },
                Iridium(offset){ return spaceCostMultiplier('iridium_ship', offset, 2800, 1.3); },
                Helium_3(offset){ return spaceCostMultiplier('iridium_ship', offset, fuel_adjust(1800), 1.3); }
            },
            effect(){
                let iridium = +((global.tech.asteroid >= 6 ? (global.tech.asteroid >= 7 ? 0.1 : 0.08) : 0.055) * zigguratBonus()).toFixed(3);
                return `<div class="has-text-caution">${loc('space_belt_iridium_ship_effect1')}</div><div>${loc('space_belt_iridium_ship_effect2',[iridium])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('iridium_ship');
                    if (global.space.space_station.support < global.space.space_station.s_max){
                        global.space['iridium_ship'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        iron_ship: {
            id: 'space-iron_ship',
            title: loc('space_belt_iron_ship_title'),
            desc(){
                return loc('space_belt_iron_ship_title');
            },
            reqs: { asteroid: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('iron_ship', offset, 80000, 1.3); },
                Steel(offset){ return spaceCostMultiplier('iron_ship', offset, 42000, 1.3); },
                Aluminium(offset){ return spaceCostMultiplier('iron_ship', offset, 38000, 1.3); },
                Polymer(offset){ return spaceCostMultiplier('iron_ship', offset, 16000, 1.3); },
                Helium_3(offset){ return spaceCostMultiplier('iron_ship', offset, fuel_adjust(1200), 1.3); }
            },
            effect(){
                let iron = +((global.tech.asteroid >= 6 ? (global.tech.asteroid >= 7 ? 4 : 3) : 2) * zigguratBonus()).toFixed(2);
                if (global.tech['solar'] && global.tech['solar'] >= 5){
                    return `<div class="has-text-caution">${loc('space_belt_iron_ship_effect1')}</div><div>${loc('space_belt_iron_ship_effect2',[iron])}</div><div>${loc('space_belt_iron_ship_effect3')}</div>`;
                }
                else {
                    return `<div class="has-text-caution">${loc('space_belt_iron_ship_effect1')}</div><div>${loc('space_belt_iron_ship_effect2',[iron])}</div>`;
                }
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('iron_ship');
                    if (global.space.space_station.support < global.space.space_station.s_max){
                        global.space['iron_ship'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    spc_dwarf: {
        info: {
            name(){
                return races[global.race.species].solar.dwarf;
            },
            desc(){
                return loc('space_dwarf_info_desc',[races[global.race.species].solar.dwarf]);
            },
        },
        dwarf_mission: {
            id: 'space-dwarf_mission',
            title(){
                return loc('space_mission_title',[races[global.race.species].solar.dwarf]);
            },
            desc(){
                return loc('space_mission_desc',[races[global.race.species].solar.dwarf]);
            },
            reqs: { asteroid: 1, elerium: 1 },
            grant: ['dwarf',1],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: { 
                Helium_3(){ return +fuel_adjust(45000).toFixed(0); }
            },
            effect(){
                return loc('space_dwarf_mission_effect1',[races[global.race.species].solar.dwarf]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('space_dwarf_mission_action',[races[global.race.species].solar.dwarf]),'info');
                    global.space['elerium_contain'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        elerium_contain: {
            id: 'space-elerium_contain',
            title: loc('space_dwarf_elerium_contain_title'),
            desc(){
                return `<div>${loc('space_dwarf_elerium_contain_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { dwarf: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('elerium_contain', offset, 800000, 1.28); },
                Cement(offset){ return spaceCostMultiplier('elerium_contain', offset, 120000, 1.28); },
                Iridium(offset){ return spaceCostMultiplier('elerium_contain', offset, 50000, 1.28); },
                Neutronium(offset){ return spaceCostMultiplier('elerium_contain', offset, 250, 1.28); }
            },
            effect(){
                let elerium = spatialReasoning(100);
                return `<div>${loc('plus_max_resource',[elerium,loc('resource_Elerium_name')])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(6); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('elerium_contain');
                    if (global.city.power >= 6){
                        global.space['elerium_contain'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        e_reactor: {
            id: 'space-e_reactor',
            title: loc('space_dwarf_reactor_title'),
            desc(){
                return `<div>${loc('space_dwarf_reactor_title')}</div><div class="has-text-special">${loc('space_dwarf_reactor_desc_req')}</div>`;
            },
            reqs: { elerium: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('e_reactor', offset, 1250000, 1.28); },
                Steel(offset){ return spaceCostMultiplier('e_reactor', offset, 350000, 1.28); },
                Neutronium(offset){ return spaceCostMultiplier('e_reactor', offset, 1250, 1.28); },
                Mythril(offset){ return spaceCostMultiplier('e_reactor', offset, 2500, 1.28); }
            },
            effect(){
                let elerium = 0.05;
                let power = $(this)[0].powered() * -1;
                return `<div>${loc('space_dwarf_reactor_effect1',[power])}</div><div  class="has-text-caution">${loc('space_dwarf_reactor_effect2',[elerium])}</div>`;
            },
            powered(){ return powerModifier(-25); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('e_reactor');
                    global.space['e_reactor'].on++;
                    return true;
                }
                return false;
            }
        },
        world_collider: {
            id: 'space-world_collider',
            title: loc('space_dwarf_collider_title'),
            desc(){
                if (!global.space.hasOwnProperty('world_collider') || global.space.world_collider.count < 1859){
                    return `<div>${loc('space_dwarf_collider_desc')}</div><div class="has-text-special">${loc('space_dwarf_collider_desc_req')}</div>`;
                }
                else {
                    return `<div>${loc('space_dwarf_collider_desc_req')}</div>`;
                }
            },
            wiki: false,
            reqs: { science: 10 },
            condition(){
                return global.space.world_collider.count < 1859 ? true : false;
            },
            no_queue(){ return global.space.world_collider.count < 1859 ? false : true },
            queue_size: 100,
            queue_complete(){ return global.space.world_collider.count >= 1859 ? true : false; },
            cost: {
                Money(){ return !global.space.hasOwnProperty('world_collider') || global.space.world_collider.count < 1859 ? 25000 : 0; },
                Copper(){ return !global.space.hasOwnProperty('world_collider') || global.space.world_collider.count < 1859 ? 750 : 0; },
                Alloy(){ return !global.space.hasOwnProperty('world_collider') || global.space.world_collider.count < 1859 ? 125 : 0; },
                Neutronium(){ return !global.space.hasOwnProperty('world_collider') || global.space.world_collider.count < 1859 ? 12 : 0; },
                Elerium(){ return !global.space.hasOwnProperty('world_collider') || global.space.world_collider.count < 1859 ? 1 : 0; },
                Mythril(){ return !global.space.hasOwnProperty('world_collider') || global.space.world_collider.count < 1859 ? 10 : 0; }
            },
            effect(){
                if (!global.space.hasOwnProperty('world_collider') || global.space.world_collider.count < 1859){
                    let remain = global.space.hasOwnProperty('world_collider') ? 1859 - global.space.world_collider.count : 1859;
                    return `<div>${loc('space_dwarf_collider_effect1')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('space_dwarf_collider_effect3');
                }
            },
            action(){
                if (global.space.world_collider.count < 1859 && payCosts($(this)[0].cost)){
                    incrementStruct('world_collider');
                    if (global.space.world_collider.count >= 1859){
                        global.tech['science'] = 11;
                        global.space['world_controller'] = { count: 1, on: 0 };
                        drawTech();
                        renderSpace();
                    }
                    return true;
                }
                return false;
            },
            flair: loc('space_dwarf_collider_flair')
        },
        world_controller: {
            id: 'space-world_controller',
            title: loc('space_dwarf_collider_title'),
            desc(){
                return `<div>${loc('space_dwarf_collider_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { science: 11 },
            condition(){
                return global.space.world_collider.count < 1859 ? false : true;
            },
            cost: {},
            no_queue(){ return true },
            effect(){
                let boost = 25;
                if (global.interstellar['far_reach'] && p_on['far_reach'] > 0){
                    boost += p_on['far_reach'] * 1;
                }
                if (global.tech.science >= 19){
                    boost += 15;
                }
                return `<div>${loc('plus_max_resource',[boost+'%',loc('resource_Knowledge_name')])}</div><div>${loc('space_dwarf_controller_effect3')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(20); },
            action(){
                return false;
            },
            flair: loc('space_dwarf_controller_flair')
        },
    }
};

const interstellarProjects = {
    int_alpha: {
        info: {
            name: loc('interstellar_alpha_name'),
            desc(){ return global.tech['alpha'] ? loc('interstellar_alpha_desc2',[races[global.race.species].home]) : loc('interstellar_alpha_desc1',[races[global.race.species].home]); },
            support: 'starport'
        },
        alpha_mission: {
            id: 'interstellar-alpha_mission',
            title: loc('space_mission_title', [loc('interstellar_alpha_name')]),
            desc: loc('space_mission_desc', [loc('interstellar_alpha_name')]),
            reqs: { ftl: 2 },
            grant: ['alpha',1],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(40000).toFixed(0); }
            },
            effect: loc('interstellar_alpha_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('interstellar_alpha_mission_result'),'info');
                    global.interstellar['nexus'] = { count: 0, on: 0, support: 0, s_max: 0 };
                    global.interstellar['warehouse'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        starport: {
            id: 'interstellar-starport',
            title: loc('interstellar_alpha_starport_title'),
            desc: `<div>${loc('interstellar_alpha_starport_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { alpha: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('starport', offset, 1000000, 1.3, 'interstellar'); },
                Aluminium(offset){ return spaceCostMultiplier('starport', offset, 400000, 1.3, 'interstellar'); },
                Neutronium(offset){ return spaceCostMultiplier('starport', offset, 1000, 1.3, 'interstellar'); },
                Elerium(offset){ return spaceCostMultiplier('starport', offset, 100, 1.3, 'interstellar'); }
            },
            effect(){
                let helium = +(int_fuel_adjust(5)).toFixed(2);
                let food = 100;
                return `<div>${loc('interstellar_alpha_starport_effect1',[$(this)[0].support()])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect2',[helium,$(this)[0].powered()])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect3',[food,global.resource.Food.name])}</div>`;
            },
            support(){ return 5; },
            powered(){ return powerCostMod(10); },
            refresh: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('starport','interstellar');
                    global.settings.space.proxima = true;
                    global.settings.space.nebula = true;
                    if (global.city.power >= $(this)[0].powered()){
                        global.interstellar['starport'].on++;
                    }
                    if (global.tech['alpha'] === 1){
                        global.tech['alpha'] = 2;
                        global.interstellar['mining_droid'] = { count: 0, on: 0, adam: 0, uran: 0, coal: 0, alum: 0 };
                    }
                    return true;
                }
                return false;
            }
        },
        habitat: {
            id: 'interstellar-habitat',
            title: loc('interstellar_habitat_title'),
            desc: `<div>${loc('interstellar_habitat_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { alpha: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('habitat', offset, 800000, 1.25, 'interstellar'); },
                Furs(offset){ return spaceCostMultiplier('habitat', offset, 38000, 1.25, 'interstellar'); },
                Adamantite(offset){ return spaceCostMultiplier('habitat', offset, 3200, 1.25, 'interstellar'); },
                Plywood(offset){ return spaceCostMultiplier('habitat', offset, 10000, 1.25, 'interstellar'); },
            },
            effect(){
                let citizens = 1;
                return `<div>${loc('interstellar_alpha_starport_effect1',[$(this)[0].support()])}</div><div><span>${loc('plus_max_citizens',[citizens])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div>`;
            },
            support(){ return 1; },
            powered(){ return powerCostMod(2); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('habitat','interstellar');
                    if (global.city.power >= $(this)[0].powered()){
                        global.interstellar['habitat'].on++;
                        global.resource[global.race.species].max += 1;
                    }
                    return true;
                }
                return false;
            }
        },
        mining_droid: {
            id: 'interstellar-mining_droid',
            title: loc('interstellar_mining_droid_title'),
            desc: `<div>${loc('interstellar_mining_droid_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_alpha_name')])}</div>`,
            reqs: { alpha: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('mining_droid', offset, 650000, 1.28, 'interstellar'); },
                Steel(offset){ return spaceCostMultiplier('mining_droid', offset, 120000, 1.28, 'interstellar'); },
                Nano_Tube(offset){ return spaceCostMultiplier('mining_droid', offset, 75000, 1.28, 'interstellar'); },
                Elerium(offset){ return spaceCostMultiplier('mining_droid', offset, 50, 1.28, 'interstellar'); }
            },
            effect(){
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('interstellar_mining_droid_effect')}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            special: true,
            refresh: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('mining_droid','interstellar');
                    global.resource.Adamantite.display = true;
                    if (global.interstellar.starport.support < global.interstellar.starport.s_max){
                        global.interstellar.mining_droid.on++;
                        global.interstellar.mining_droid.adam++;
                    }
                    if (!global.tech['droids']){
                        global.tech['droids'] = 1;
                        global.interstellar['processing'] = { count: 0, on: 0 };
                    }
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        processing: {
            id: 'interstellar-processing',
            title: loc('interstellar_processing_title'),
            desc: `<div>${loc('interstellar_processing_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_alpha_name')])}</div>`,
            reqs: { droids: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('processing', offset, 350000, 1.28, 'interstellar'); },
                Iron(offset){ return spaceCostMultiplier('processing', offset, 180000, 1.28, 'interstellar'); },
                Aluminium(offset){ return spaceCostMultiplier('processing', offset, 60000, 1.28, 'interstellar'); },
                Iridium(offset){ return spaceCostMultiplier('processing', offset, 5000, 1.28, 'interstellar'); }
            },
            effect(){
                let bonus = 12;
                if (global.tech['ai_core'] && global.tech['ai_core'] >= 2 && p_on['citadel'] > 0){
                    bonus += p_on['citadel'] * 2;
                }
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('interstellar_processing_effect',[bonus])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('processing','interstellar');
                    if (global.interstellar.starport.support < global.interstellar.starport.s_max){
                        global.interstellar.processing.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        fusion: {
            id: 'interstellar-fusion',
            title: loc('interstellar_fusion_title'),
            desc: `<div>${loc('interstellar_fusion_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_alpha_name')])}</div>`,
            reqs: { fusion: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('fusion', offset, 990000, 1.28, 'interstellar'); },
                Iridium(offset){ return spaceCostMultiplier('fusion', offset, 44000, 1.28, 'interstellar'); },
                Infernite(offset){ return spaceCostMultiplier('fusion', offset, 350, 1.28, 'interstellar'); },
                Brick(offset){ return spaceCostMultiplier('fusion', offset, 18000, 1.28, 'interstellar'); }
            },
            effect(){
                let det = 1.25;
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div><span>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered())])}</span>, <span class="has-text-caution">${loc('interstellar_fusion_effect',[det])}</span></div>`;
            },
            support(){ return -1; },
            powered(){ return powerModifier(-22); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('fusion','interstellar');
                    if (global.interstellar.starport.support < global.interstellar.starport.s_max){
                        global.interstellar.fusion.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        laboratory: {
            id: 'interstellar-laboratory',
            title: loc('interstellar_laboratory_title'),
            desc: `<div>${loc('interstellar_laboratory_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_alpha_name')])}</div>`,
            reqs: { science: 12 },
            cost: {
                Money(offset){ return spaceCostMultiplier('laboratory', offset, 750000, 1.28, 'interstellar'); },
                Titanium(offset){ return spaceCostMultiplier('laboratory', offset, 120000, 1.28, 'interstellar'); },
                Alloy(offset){ return spaceCostMultiplier('laboratory', offset, 95000, 1.28, 'interstellar'); },
                Mythril(offset){ return spaceCostMultiplier('laboratory', offset, 8500, 1.28, 'interstellar'); }
            },
            effect(){
                let know = 10000;
                if (global.tech.science >= 15){
                    know *= 1 + (global.city.wardenclyffe.count * 0.02);
                }
                know = Math.round(know);
                let sci = '';
                if (global.tech.science >= 16){
                    sci = `<div>${loc('city_wardenclyffe_effect1')}</div>`;
                }
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div>${sci}<div>${loc('city_max_knowledge',[know])}</div>`;
                if (global.tech['science'] >= 13){
                    desc = desc + `<div>${loc('interstellar_laboratory_effect',[5])}</div>`;
                }
                return desc;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('laboratory','interstellar');
                    if (global.interstellar.starport.support < global.interstellar.starport.s_max){
                        global.interstellar.laboratory.on++;
                        global.resource.Knowledge.max += 10000;
                    }
                    return true;
                }
                return false;
            }
        },
        exchange: {
            id: 'interstellar-exchange',
            title: loc('interstellar_exchange_title'),
            desc: `<div>${loc('interstellar_exchange_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_alpha_name')])}</div>`,
            reqs: { banking: 12 },
            cost: {
                Money(offset){ return spaceCostMultiplier('exchange', offset, 680000, 1.28, 'interstellar'); },
                Stone(offset){ return spaceCostMultiplier('exchange', offset, 115000, 1.28, 'interstellar'); },
                Adamantite(offset){ return spaceCostMultiplier('exchange', offset, 55000, 1.28, 'interstellar'); },
                Graphene(offset){ return spaceCostMultiplier('exchange', offset, 78000, 1.28, 'interstellar'); }
            },
            effect(){
                let vault = spatialReasoning(global.city['bank'] ? bank_vault() * global.city['bank'].count / 18 : 0);
                if (global.tech.banking >= 13){
                    if (global.galaxy['freighter']){
                        vault *= 1 + (gal_on['freighter'] * 0.03);
                    }
                    if (global.galaxy['super_freighter']){
                        vault *= 1 + (gal_on['super_freighter'] * 0.08);
                    }
                }
                vault = +(vault).toFixed(0);
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('plus_max_resource',[vault,loc('resource_Money_name')])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('exchange','interstellar');
                    if (global.interstellar.starport.support < global.interstellar.starport.s_max){
                        global.interstellar.exchange.on++;
                        global.resource.Money.max += +(spatialReasoning(450000)).toFixed(0);
                    }
                    return true;
                }
                return false;
            }
        },
        g_factory: {
            id: 'interstellar-g_factory',
            title: loc('interstellar_g_factory_title'),
            desc: `<div>${loc('interstellar_g_factory_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_alpha_name')])}</div>`,
            reqs: { graphene: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('g_factory', offset, 950000, 1.28, 'interstellar'); },
                Copper(offset){ return spaceCostMultiplier('g_factory', offset, 165000, 1.28, 'interstellar'); },
                Cement(offset){ return spaceCostMultiplier('g_factory', offset, 220000, 1.28, 'interstellar'); },
                Infernite(offset){ return spaceCostMultiplier('g_factory', offset, 750, 1.28, 'interstellar'); }
            },
            effect(){
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('interstellar_g_factory_effect')}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            special: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('g_factory','interstellar');
                    global.resource.Graphene.display = true;
                    if (global.interstellar.starport.support < global.interstellar.starport.s_max){
                        global.interstellar.g_factory.on++;
                        global.interstellar.g_factory.Lumber++;
                    }
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        int_factory: {
            id: 'interstellar-int_factory',
            title: loc('interstellar_int_factory_title'),
            desc: `<div>${loc('interstellar_int_factory_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { alpha: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('int_factory', offset, 25000000, 1.26, 'interstellar'); },
                Coal(offset){ return spaceCostMultiplier('int_factory', offset, 10000000, 1.26, 'interstellar'); },
                Brick(offset){ return spaceCostMultiplier('int_factory', offset, 750000, 1.26, 'interstellar'); },
                Bolognium(offset){ return spaceCostMultiplier('int_factory', offset, 50000, 1.26, 'interstellar'); }
            },
            effect(){
                let deuterium = +int_fuel_adjust(5).toFixed(2);
                return `<div>${loc('interstellar_int_factory_effect')}</div><div>${loc('city_crafted_mats',[10])}</div><div class="has-text-caution"><span>${loc('interstellar_fusion_effect',[deuterium])}</span> <span>${loc('minus_power',[$(this)[0].powered()])}</span></div>`;
            },
            powered(){ return powerCostMod(5); },
            special: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('int_factory','interstellar');
                    if (global.city.power >= $(this)[0].powered()){
                        global.interstellar.int_factory.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        luxury_condo: {
            id: 'interstellar-luxury_condo',
            title: loc('tech_luxury_condo'),
            desc: `<div>${loc('tech_luxury_condo')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { alpha: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('luxury_condo', offset, 25000000, 1.25, 'interstellar'); },
                Neutronium(offset){ return spaceCostMultiplier('luxury_condo', offset, 75000, 1.25, 'interstellar'); },
                Stanene(offset){ return spaceCostMultiplier('luxury_condo', offset, 230000, 1.25, 'interstellar'); },
                Orichalcum(offset){ return spaceCostMultiplier('luxury_condo', offset, 65000, 1.25, 'interstellar'); },
                Nanoweave(offset){ return spaceCostMultiplier('luxury_condo', offset, 12500, 1.25, 'interstellar'); },
            },
            effect(){
                let citizens = 2;
                let safe = spatialReasoning(750000);
                return `<div><span>${loc('plus_max_citizens',[citizens])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div><div>${loc('plus_max_resource',[`\$${safe}`,loc('resource_Money_name')])}</div>`;
            },
            powered(){ return powerCostMod(3); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('luxury_condo','interstellar');
                    if (global.city.power >= $(this)[0].powered()){
                        global.interstellar['luxury_condo'].on++;
                        global.resource[global.race.species].max += 2;
                    }
                    return true;
                }
                return false;
            }
        },
        warehouse: {
            id: 'interstellar-warehouse',
            title(){ 
                return global.tech['storage'] <= 2 ? loc('city_shed_title1') : (global.tech['storage'] >= 4 ? loc('city_shed_title3') : loc('city_shed_title2')); 
            },
            desc(){
                let storage = global.tech['storage'] >= 3 ? (global.tech['storage'] >= 4 ? loc('city_shed_desc_size3') : loc('city_shed_desc_size2')) : loc('city_shed_desc_size1');
                return loc('city_shed_desc',[storage]);
            },
            reqs: { alpha: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('warehouse', offset, 175000, 1.28, 'interstellar'); },
                Lumber(offset){ return spaceCostMultiplier('warehouse', offset, 100000, 1.28, 'interstellar'); },
                Aluminium(offset){ return spaceCostMultiplier('warehouse', offset, 120000, 1.28, 'interstellar'); },
                Cement(offset){ return spaceCostMultiplier('warehouse', offset, 45000, 1.28, 'interstellar'); }
            },
            wide: true,
            effect(){
                let storage = '<div class="aTable">';
                let multiplier = storageMultipler();
                if (global.resource.Lumber.display){
                    let val = sizeApproximation(+(spatialReasoning(750) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Lumber.name])}</span>`;
                }
                if (global.resource.Stone.display){
                    let val = sizeApproximation(+(spatialReasoning(750) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Stone.name])}</span>`;
                }
                if (global.resource.Furs.display){
                    let val = sizeApproximation(+(spatialReasoning(425) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Furs.name])}</span>`;
                }
                if (global.resource.Copper.display){
                    let val = sizeApproximation(+(spatialReasoning(380) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Copper.name])}</span>`;
                }
                if (global.resource.Iron.display){
                    let val = sizeApproximation(+(spatialReasoning(350) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Iron.name])}</span>`;
                }
                if (global.resource.Aluminium.display){
                    let val = sizeApproximation(+(spatialReasoning(320) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Aluminium.name])}</span>`;
                }
                if (global.resource.Cement.display){
                    let val = sizeApproximation(+(spatialReasoning(280) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Cement.name])}</span>`;
                }
                if (global.resource.Coal.display){
                    let val = sizeApproximation(+(spatialReasoning(120) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Coal.name])}</span>`;
                }
                if (global.tech['storage'] >= 3 && global.resource.Steel.display){
                    let val = sizeApproximation(+(spatialReasoning(60) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Steel.name])}</span>`;
                }
                if (global.tech['storage'] >= 4 && global.resource.Titanium.display){
                    let val = sizeApproximation(+(spatialReasoning(40) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Titanium.name])}</span>`;
                }
                if (global.resource.Nano_Tube.display){
                    let val = sizeApproximation(+(spatialReasoning(30) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Nano_Tube.name])}</span>`
                }
                if (global.resource.Neutronium.display){
                    let val = sizeApproximation(+(spatialReasoning(8) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Neutronium.name])}</span>`
                }
                if (global.resource.Adamantite.display){
                    let val = sizeApproximation(+(spatialReasoning(18) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Adamantite.name])}</span>`
                }
                if (global.resource.Infernite.display){
                    let val = sizeApproximation(+(spatialReasoning(5) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Infernite.name])}</span>`
                }
                storage = storage + '</div>';
                return storage;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('warehouse','interstellar');
                    let multiplier = storageMultipler();
                    global['resource']['Lumber'].max += (spatialReasoning(750) * multiplier);
                    global['resource']['Stone'].max += (spatialReasoning(750) * multiplier);
                    global['resource']['Furs'].max += (spatialReasoning(425) * multiplier);
                    global['resource']['Copper'].max += (spatialReasoning(380) * multiplier);
                    global['resource']['Iron'].max += (spatialReasoning(350) * multiplier);
                    global['resource']['Aluminium'].max += (spatialReasoning(320) * multiplier);
                    global['resource']['Cement'].max += (spatialReasoning(280) * multiplier);
                    global['resource']['Coal'].max += (spatialReasoning(120) * multiplier);
                    if (global.tech['storage'] >= 3){
                        global['resource']['Steel'].max += ((spatialReasoning(60) * multiplier));
                    }
                    if (global.tech['storage'] >= 4){
                        global['resource']['Titanium'].max += ((spatialReasoning(40) * multiplier));
                    }
                    if (global.resource.Nano_Tube.display){
                        global['resource']['Nano_Tube'].max += ((spatialReasoning(30) * multiplier));
                    }
                    if (global.resource.Neutronium.display){
                        global['resource']['Neutronium'].max += ((spatialReasoning(8) * multiplier));
                    }
                    if (global.resource.Adamantite.display){
                        global['resource']['Adamantite'].max += ((spatialReasoning(18) * multiplier));
                    }
                    if (global.resource.Infernite.display){
                        global['resource']['Infernite'].max += ((spatialReasoning(5) * multiplier));
                    }
                    return true;
                }
                return false;
            }
        },
    },
    int_proxima: {
        info: {
            name: loc('interstellar_proxima_name'),
            desc(){ return global.tech['proxima'] ? loc('interstellar_proxima_desc2') : loc('interstellar_proxima_desc1'); },
        },
        proxima_mission: {
            id: 'interstellar-proxima_mission',
            title: loc('space_mission_title',[loc('interstellar_proxima_name')]),
            desc: loc('space_mission_desc',[loc('interstellar_proxima_name')]),
            reqs: { alpha: 1 },
            grant: ['proxima',1],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(42000).toFixed(0); }
            },
            effect: loc('interstellar_proxima_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['xfer_station'] = { count: 0, on: 0 };
                    messageQueue(loc('interstellar_proxima_mission_result'),'info');
                    return true;
                }
                return false;
            }
        },
        xfer_station: {
            id: 'interstellar-xfer_station',
            title: loc('interstellar_xfer_station_title'),
            desc(){ return `<div>${loc('interstellar_xfer_station_desc')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Uranium.name])}</div>`; },
            reqs: { proxima: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('xfer_station', offset, 1200000, 1.28, 'interstellar'); },
                Neutronium(offset){ return spaceCostMultiplier('xfer_station', offset, 1500, 1.28, 'interstellar'); },
                Adamantite(offset){ return spaceCostMultiplier('xfer_station', offset, 6000, 1.28, 'interstellar'); },
                Polymer(offset){ return spaceCostMultiplier('xfer_station', offset, 12000, 1.28, 'interstellar'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('xfer_station', offset, 3500, 1.28, 'interstellar'); },
            },
            effect(){
                let fuel = 0.28;
                let helium = spatialReasoning(5000);
                let oil = spatialReasoning(4000);
                let uranium = spatialReasoning(2500);
                let det = '';
                if (global.resource.Deuterium.display){
                    det = `<div>${loc('plus_max_resource',[spatialReasoning(2000),loc('resource_Deuterium_name')])}</div>`;
                }
                return `<div>${loc('interstellar_alpha_starport_effect1',[$(this)[0].support()])}</div><div>${loc('plus_max_resource',[oil,loc('resource_Oil_name')])}</div><div>${loc('plus_max_resource',[helium,loc('resource_Helium_3_name')])}</div><div>${loc('plus_max_resource',[uranium,loc('resource_Uranium_name')])}</div>${det}<div class="has-text-caution">${loc('city_fission_power_effect',[fuel])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            support(){ return 1; },
            powered(){ return powerCostMod(1); },
            refresh: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('xfer_station','interstellar');
                    if (global.city.power >= $(this)[0].powered()){
                        global.interstellar['xfer_station'].on++;
                        global['resource']['Uranium'].max += spatialReasoning(2500);
                        global['resource']['Helium_3'].max += spatialReasoning(5000);
                        global['resource']['Oil'].max += spatialReasoning(4000);
                        global['resource']['Deuterium'].max += spatialReasoning(2000);
                    }
                    if (global.tech['proxima'] === 1){
                        global.tech['proxima'] = 2;
                        global.interstellar['cargo_yard'] = { count: 0 };
                    }
                    return true;
                }
                return false;
            }
        },
        cargo_yard: {
            id: 'interstellar-cargo_yard',
            title: loc('interstellar_cargo_yard_title'),
            desc: loc('interstellar_cargo_yard_title'),
            reqs: { proxima: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('cargo_yard', offset, 275000, 1.28, 'interstellar'); },
                Graphene(offset){ return spaceCostMultiplier('cargo_yard', offset, 7500, 1.28, 'interstellar'); },
                Mythril(offset){ return spaceCostMultiplier('cargo_yard', offset, 6000, 1.28, 'interstellar'); },
            },
            effect(){
                let containers = 50;
                let neutronium = spatialReasoning(200);
                let infernite = spatialReasoning(150);
                let desc = `<div>${loc('plus_max_resource',[containers,loc('resource_Crates_name')])}</div><div>${loc('plus_max_resource',[containers,loc('resource_Containers_name')])}</div>`;
                desc = desc + `<div>${loc('plus_max_resource',[neutronium,loc('resource_Neutronium_name')])}</div><div>${loc('plus_max_resource',[infernite,loc('resource_Infernite_name')])}</div>`;
                if (global.tech['storage'] >= 7){
                    let boost = +(quantum_level).toFixed(3);
                    desc = desc + `<div>${loc('interstellar_cargo_yard_effect',[boost])}</div>`;
                }
                return desc;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('cargo_yard','interstellar');
                    return true;
                }
                return false;
            }
        },
        cruiser: {
            id: 'interstellar-cruiser',
            title: loc('interstellar_cruiser_title'),
            desc: loc('interstellar_cruiser_title'),
            reqs: { cruiser: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('cruiser', offset, 875000, 1.28, 'interstellar'); },
                Aluminium(offset){ return spaceCostMultiplier('cruiser', offset, 195000, 1.28, 'interstellar'); },
                Deuterium(offset){ return spaceCostMultiplier('cruiser', offset, +int_fuel_adjust(1500).toFixed(0), 1.28, 'interstellar'); },
                Neutronium(offset){ return spaceCostMultiplier('cruiser', offset, 2000, 1.28, 'interstellar'); },
                Aerogel(offset){ return spaceCostMultiplier('cruiser', offset, 250, 1.28, 'interstellar'); },
            },
            powered(){ return powerCostMod(1); },
            effect(){
                let helium = +int_fuel_adjust(6).toFixed(2);
                let troops = 3;
                return `<div>${loc('plus_max_soldiers',[troops])}</div><div class="has-text-caution">${loc('space_belt_station_effect3',[helium])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('cruiser','interstellar');
                    global.interstellar.cruiser.on++;
                    return true;
                }
                return false;
            }
        },
        dyson: {
            id: 'interstellar-dyson',
            title: loc('interstellar_dyson_title'),
            desc(){
                if (!global.interstellar.hasOwnProperty('dyson') || global.interstellar.dyson.count < 100){
                    return `<div>${loc('interstellar_dyson_title')}</div><div class="has-text-special">${loc('requires_segmemts',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_dyson_title')}</div>`;
                }
            },
            reqs: { proxima: 3 },
            no_queue(){ return global.interstellar.dyson.count < 100 ? false : true },
            queue_size: 10,
            queue_complete(){ return global.interstellar.dyson.count >= 100 ? true : false; },
            condition(){
                return global.interstellar.dyson.count >= 100 && global.tech['dyson'] ? false : true;
            },
            cost: {
                Money(){ return !global.interstellar.hasOwnProperty('dyson') || global.interstellar.dyson.count < 100 ? 250000 : 0; },
                Adamantite(){ return !global.interstellar.hasOwnProperty('dyson') || global.interstellar.dyson.count < 100 ? 10000 : 0; },
                Infernite(){ return !global.interstellar.hasOwnProperty('dyson') || global.interstellar.dyson.count < 100 ? 25 : 0; },
                Stanene(){ return !global.interstellar.hasOwnProperty('dyson') || global.interstellar.dyson.count < 100 ? 100000 : 0; }
            },
            effect(){
                if (!global.interstellar.hasOwnProperty('dyson') || global.interstellar.dyson.count < 100){
                    let remain = global.interstellar.hasOwnProperty('dyson') ? 100 - global.interstellar.dyson.count : 100;
                    return `<div>${loc('interstellar_dyson_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('interstellar_dyson_complete',[powerModifier(175)]);
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.interstellar.dyson.count < 100){
                        incrementStruct('dyson','interstellar');
                    }
                    return true;
                }
                return false;
            }
        },
        dyson_sphere: {
            id: 'interstellar-dyson_sphere',
            title: loc('interstellar_dyson_sphere_title'),
            desc(){
                return `<div>${loc('interstellar_dyson_sphere_title')}</div>`;
            },
            reqs: { proxima: 3, dyson: 1 },
            no_queue(){ return global.interstellar.dyson_sphere.count < 100 ? false : true },
            queue_size: 10,
            queue_complete(){ return global.interstellar.dyson_sphere.count >= 100 ? true : false; },
            condition(){
                return global.interstellar.dyson.count >= 100 && global.tech['dyson'] ? true : false;
            },
            cost: {
                Money(){ return !global.interstellar.hasOwnProperty('dyson_sphere') || global.interstellar.dyson_sphere.count < 100 ? 5000000 : 0; },
                Bolognium(){ return !global.interstellar.hasOwnProperty('dyson_sphere') || global.interstellar.dyson_sphere.count < 100 ? 25000 : 0; },
                Vitreloy(){ return !global.interstellar.hasOwnProperty('dyson_sphere') || global.interstellar.dyson_sphere.count < 100 ? 1250 : 0; },
                Aerogel(){ return !global.interstellar.hasOwnProperty('dyson_sphere') || global.interstellar.dyson_sphere.count < 100 ? 75000 : 0; }
            },
            effect(){
                if (!global.interstellar.hasOwnProperty('dyson_sphere') || global.interstellar.dyson_sphere.count < 100){
                    let power = global.interstellar.hasOwnProperty('dyson_sphere') ? 175 + (global.interstellar.dyson_sphere.count * 5) : 175;
                    let remain = global.interstellar.hasOwnProperty('dyson_sphere') ? 100 - global.interstellar.dyson_sphere.count : 100;
                    return `<div>${loc('interstellar_dyson_sphere_effect')}</div><div>${loc('space_dwarf_reactor_effect1',[powerModifier(power)])}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('interstellar_dyson_sphere_complete',[powerModifier(750)]);
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.interstellar.dyson_sphere.count < 100){
                        incrementStruct('dyson_sphere','interstellar');
                    }
                    return true;
                }
                return false;
            }
        },
    },
    int_nebula: {
        info: {
            name: loc('interstellar_nebula_name'),
            desc(){ return global.tech['nebula'] ? loc('interstellar_nebula_desc2') : loc('interstellar_nebula_desc1'); },
            support: 'nexus'
        },
        nebula_mission: {
            id: 'interstellar-nebula_mission',
            title: loc('space_mission_title',[loc('interstellar_nebula_name')]),
            desc: loc('space_mission_desc',[loc('interstellar_nebula_name')]),
            reqs: { alpha: 1 },
            grant: ['nebula',1],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(55000).toFixed(0); }
            },
            effect: loc('interstellar_nebula_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('interstellar_nebula_mission_result'),'info');
                    return true;
                }
                return false;
            }
        },
        nexus: {
            id: 'interstellar-nexus',
            title: loc('interstellar_nexus_title'),
            desc(){ return `<div>${loc('interstellar_nexus_title')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Money.name])}</div>`; },
            reqs: { nebula: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('nexus', offset, 900000, 1.24, 'interstellar'); },
                Adamantite(offset){ return spaceCostMultiplier('nexus', offset, 7500, 1.24, 'interstellar'); },
                Infernite(offset){ return spaceCostMultiplier('nexus', offset, 250, 1.24, 'interstellar'); },
                Sheet_Metal(offset){ return spaceCostMultiplier('nexus', offset, 14000, 1.24, 'interstellar'); },
                Nano_Tube(offset){ return spaceCostMultiplier('nexus', offset, 17500, 1.24, 'interstellar'); },
            },
            effect(){
                let oil = spatialReasoning(3500);
                let helium = spatialReasoning(4000);
                let deuterium = spatialReasoning(3000);
                let elerium = spatialReasoning(25);
                return `<div>${loc('interstellar_nexus_effect1',[$(this)[0].support()])}</div><div>${loc('plus_max_resource',[oil,loc('resource_Oil_name')])}</div><div>${loc('plus_max_resource',[helium,loc('resource_Helium_3_name')])}</div><div>${loc('plus_max_resource',[deuterium,loc('resource_Deuterium_name')])}</div><div>${loc('plus_max_resource',[elerium,loc('resource_Elerium_name')])}</div><div class="has-text-caution">${loc('interstellar_nexus_effect2',[$(this)[0].powered(),350])}</div>`;
            },
            support(){ return 2; },
            powered(){ return powerCostMod(8); },
            refresh: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('nexus','interstellar');
                    global.resource.Deuterium.display = true;
                    if (global.tech['nebula'] === 1){
                        global.interstellar['harvester'] = { count: 0, on: 0 };
                        global.tech['nebula'] = 2;
                    }
                    if (global.city.power >= $(this)[0].powered()){
                        global.interstellar['nexus'].on++;
                        global['resource']['Oil'].max += spatialReasoning(2500);
                        global['resource']['Helium_3'].max += spatialReasoning(4000);
                        global['resource']['Deuterium'].max += spatialReasoning(3000);
                        global['resource']['Elerium'].max += spatialReasoning(25);
                    }
                    return true;
                }
                return false;
            }
        },
        harvester: {
            id: 'interstellar-harvester',
            title: loc('interstellar_harvester_title'),
            desc: `<div>${loc('interstellar_harvester_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_nebula_name')])}</div>`,
            reqs: { nebula: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('harvester', offset, 650000, 1.28, 'interstellar'); },
                Copper(offset){ return spaceCostMultiplier('harvester', offset, 80000, 1.28, 'interstellar'); },
                Alloy(offset){ return spaceCostMultiplier('harvester', offset, 45000, 1.28, 'interstellar'); },
                Iridium(offset){ return spaceCostMultiplier('harvester', offset, 8000, 1.28, 'interstellar'); }
            },
            effect(){
                let helium = +(0.85 * zigguratBonus()).toFixed(3);
                let deuterium = +(0.15 * zigguratBonus()).toFixed(3);
                let ram = global.tech['ram_scoop'] ? `<div>${loc('interstellar_harvester_effect',[deuterium])}</div>` : '';
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_nebula_name')])}</div><div>${loc('space_gas_mining_effect1',[helium])}</div>${ram}`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('harvester','interstellar');
                    if (global.interstellar.nexus.support < global.interstellar.nexus.s_max){
                        global.interstellar.harvester.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        elerium_prospector: {
            id: 'interstellar-elerium_prospector',
            title: loc('interstellar_elerium_prospector_title'),
            desc: `<div>${loc('interstellar_elerium_prospector_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_nebula_name')])}</div>`,
            reqs: { nebula: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('elerium_prospector', offset, 825000, 1.28, 'interstellar'); },
                Steel(offset){ return spaceCostMultiplier('elerium_prospector', offset, 18000, 1.28, 'interstellar'); },
                Polymer(offset){ return spaceCostMultiplier('elerium_prospector', offset, 22000, 1.28, 'interstellar'); },
                Graphene(offset){ return spaceCostMultiplier('elerium_prospector', offset, 82000, 1.28, 'interstellar'); },
                Stanene(offset){ return spaceCostMultiplier('elerium_prospector', offset, 57000, 1.28, 'interstellar'); }
            },
            effect(){
                let elerium = +(0.014 * zigguratBonus()).toFixed(3);
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_nebula_name')])}</div><div>${loc('space_belt_elerium_ship_effect2',[elerium])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('elerium_prospector','interstellar');
                    if (global.interstellar.nexus.support < global.interstellar.nexus.s_max){
                        global.interstellar.elerium_prospector.on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    int_neutron: {
        info: {
            name: loc('interstellar_neutron_name'),
            desc(){ return global.tech['neutron'] ? loc('interstellar_neutron_desc2',[races[global.race.species].home]) : loc('interstellar_neutron_desc1'); },
        },
        neutron_mission: {
            id: 'interstellar-neutron_mission',
            title: loc('space_mission_title', [loc('interstellar_neutron_name')]),
            desc: loc('space_mission_desc', [loc('interstellar_neutron_name')]),
            reqs: { nebula: 1, high_tech: 14 },
            grant: ['neutron',1],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(60000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(10000).toFixed(0); }
            },
            effect: loc('interstellar_neutron_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['neutron_miner'] = { count: 0, on: 0 };
                    messageQueue(loc('interstellar_neutron_mission_result'),'info');
                    return true;
                }
                return false;
            }
        },
        neutron_miner: {
            id: 'interstellar-neutron_miner',
            title: loc('interstellar_neutron_miner_title'),
            desc: `<div>${loc('interstellar_neutron_miner_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { neutron: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('neutron_miner', offset, 1000000, 1.32, 'interstellar'); },
                Titanium(offset){ return spaceCostMultiplier('neutron_miner', offset, 45000, 1.32, 'interstellar'); },
                Stanene(offset){ return spaceCostMultiplier('neutron_miner', offset, 88000, 1.32, 'interstellar'); },
                Elerium(offset){ return spaceCostMultiplier('neutron_miner', offset, 20, 1.32, 'interstellar'); },
                Aerogel(offset){ return spaceCostMultiplier('neutron_miner', offset, 50, 1.32, 'interstellar'); },
            },
            effect(){
                let neutronium = 0.055;
                neutronium = +(neutronium * zigguratBonus()).toFixed(3);
                let max_neutronium = spatialReasoning(500);
                let helium = +int_fuel_adjust(3).toFixed(2);
                return `<div>${loc('space_gas_moon_outpost_effect1',[neutronium])}</div><div>${loc('plus_max_resource',[max_neutronium,loc('resource_Neutronium_name')])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect2',[helium,$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(6); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('neutron_miner','interstellar');
                    if (global.city.power >= $(this)[0].powered()){
                        global.interstellar['neutron_miner'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        citadel: {
            id: 'interstellar-citadel',
            title: loc('interstellar_citadel_title'),
            desc: `<div>${loc('interstellar_citadel_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { neutron: 1, high_tech: 15 },
            cost: {
                Money(offset){ return spaceCostMultiplier('citadel', offset, 5000000, 1.25, 'interstellar'); },
                Knowledge(offset){ return spaceCostMultiplier('citadel', offset, 1500000, 1.15, 'interstellar'); },
                Graphene(offset){ return spaceCostMultiplier('citadel', offset, 50000, 1.25, 'interstellar'); },
                Stanene(offset){ return spaceCostMultiplier('citadel', offset, 100000, 1.25, 'interstellar'); },
                Elerium(offset){ return spaceCostMultiplier('citadel', offset, 250, 1.25, 'interstellar'); },
                Soul_Gem(offset){ return spaceCostMultiplier('citadel', offset, 1, 1.25, 'interstellar'); },
            },
            wide: true,
            effect(){
                let desc = `<div>${loc('interstellar_citadel_effect',[5])}</div>`;
                if (global.tech['ai_core']){
                    let cement = +(quantum_level / 1.75).toFixed(1);
                    desc = desc + `<div>${loc('interstellar_citadel_effect2',[cement])}</div>`;
                    if (global.tech['ai_core'] >= 2){
                        desc = desc + `<div>${loc('interstellar_citadel_effect3',[2])}</div>`;
                    }
                    if (global.tech['ai_core'] >= 3){
                        let graph = +(quantum_level / 5).toFixed(1);
                        desc = desc + `<div>${loc('interstellar_citadel_effect4',[graph])}</div>`;
                    }
                }
                return `${desc}<div class="has-text-caution">${loc('interstellar_citadel_power',[$(this)[0].powered(),2.5])}</div>`;
            },
            powered(){
                if (p_on['citadel'] && p_on['citadel'] > 1){
                    return powerCostMod(30 + ((p_on['citadel'] - 1) * 2.5));
                }
                return powerCostMod(30);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('citadel','interstellar');
                    if (global.city.power >= $(this)[0].powered()){
                        global.interstellar['citadel'].on++;
                    }
                    return true;
                }
                return false;
            },
            flair(){
                return loc('interstellar_citadel_flair');
            }
        },
        stellar_forge: {
            id: 'interstellar-stellar_forge',
            title: loc('interstellar_stellar_forge_title'),
            desc: `<div>${loc('interstellar_stellar_forge_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { star_forge: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('stellar_forge', offset, 1200000, 1.25, 'interstellar'); },
                Iridium(offset){ return spaceCostMultiplier('stellar_forge', offset, 250000, 1.25, 'interstellar'); },
                Bolognium(offset){ return spaceCostMultiplier('stellar_forge', offset, 35000, 1.25, 'interstellar'); },
                Aerogel(offset){ return spaceCostMultiplier('stellar_forge', offset, 75000, 1.25, 'interstellar'); },
            },
            effect(){
                let desc = `<div>${loc('city_foundry_effect1',[2])}</div><div>${loc('interstellar_stellar_forge_effect',[10])}</div><div>${loc('interstellar_stellar_forge_effect2',[5])}</div>`;
                if (global.tech['star_forge'] && global.tech['star_forge'] >= 2){
                    desc += `<div>${loc('interstellar_stellar_forge_effect3',[2])}</div>`;
                }
                return `${desc}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(3); },
            special: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('stellar_forge','interstellar');
                    if (global.city.power >= $(this)[0].powered()){
                        global.interstellar['stellar_forge'].on++;
                        if (global.tech['star_forge'] >= 2){
                            global.city.smelter.cap += 2;
                            global.city.smelter.Oil += 2;
                        }
                    }
                    return true;
                }
                return false;
            },
            flair(){
                return loc('interstellar_stellar_forge_flair');
            }
        },
    },
    int_blackhole: {
        info: {
            name: loc('interstellar_blackhole_name'),
            desc(){
                let home = races[global.race.species].home;
                if (global.tech['blackhole'] >= 5){
                    let mass = +(global.interstellar.stellar_engine.mass + global.interstellar.stellar_engine.exotic).toFixed(10);
                    let exotic = +(global.interstellar.stellar_engine.exotic).toFixed(10);
                    if (global.tech['whitehole']){
                        let gains = calcPrestige('bigbang');
                        let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
                        return `<div>${loc('interstellar_blackhole_desc4',[home,mass,exotic])}</div><div class="has-text-advanced">${loc('interstellar_blackhole_desc5',[gains.plasmid,gains.phage,gains.dark,plasmidType])}</div>`;
                    }
                    else {
                        return global.interstellar.stellar_engine.exotic > 0 ? loc('interstellar_blackhole_desc4',[home,mass,exotic]) : loc('interstellar_blackhole_desc3',[home,mass]);
                    }
                }
                else {
                    return global.tech['blackhole'] ? loc('interstellar_blackhole_desc2',[home]) : loc('interstellar_blackhole_desc1',[home]);
                }
            },
        },
        blackhole_mission: {
            id: 'interstellar-blackhole_mission',
            title: loc('space_mission_title', [loc('interstellar_blackhole_name')]),
            desc: loc('space_mission_desc', [loc('interstellar_blackhole_name')]),
            reqs: { nebula: 1 },
            grant: ['blackhole',1],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(75000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(25000).toFixed(0); }
            },
            effect: loc('interstellar_blackhole_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['far_reach'] = { count: 0, on: 0 };
                    messageQueue(loc('interstellar_blackhole_mission_result'),'info');
                    return true;
                }
                return false;
            }
        },
        far_reach: {
            id: 'interstellar-far_reach',
            title: loc('interstellar_far_reach'),
            desc: `<div>${loc('interstellar_far_reach_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { blackhole: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('far_reach', offset, 1000000, 1.32, 'interstellar'); },
                Knowledge(offset){ return spaceCostMultiplier('far_reach', offset, 100000, 1.32, 'interstellar'); },
                Neutronium(offset){ return spaceCostMultiplier('far_reach', offset, 2500, 1.32, 'interstellar'); },
                Elerium(offset){ return spaceCostMultiplier('far_reach', offset, 100, 1.32, 'interstellar'); },
                Aerogel(offset){ return spaceCostMultiplier('far_reach', offset, 1000, 1.32, 'interstellar'); },
            },
            effect(){
                return `<div>${loc('interstellar_far_reach_effect',[1])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(5); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('far_reach','interstellar');
                    if (global.city.power >= $(this)[0].powered()){
                        global.interstellar['far_reach'].on++;
                    }
                    if (global.tech['blackhole'] === 1){
                        global.tech['blackhole'] = 2;
                        drawTech();
                    }
                    return true;
                }
                return false;
            },
            flair: loc('interstellar_far_reach_flair')
        },
        stellar_engine: {
            id: 'interstellar-stellar_engine',
            title: loc('interstellar_stellar_engine'),
            desc(){
                if (!global.interstellar.hasOwnProperty('stellar_engine') || global.interstellar.stellar_engine.count < 100){
                    return `<div>${loc('interstellar_stellar_engine')}</div><div class="has-text-special">${loc('requires_segmemts',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_stellar_engine')}</div>`;
                }
            },
            reqs: { blackhole: 3 },
            no_queue(){ return global.interstellar.stellar_engine.count < 100 ? false : true },
            queue_size: 10,
            queue_complete(){ return global.interstellar.stellar_engine.count >= 100 ? true : false; },
            cost: {
                Money(){ return !global.interstellar.hasOwnProperty('stellar_engine') || global.interstellar.stellar_engine.count < 100 ? 500000 : 0; },
                Neutronium(){ return !global.interstellar.hasOwnProperty('stellar_engine') || global.interstellar.stellar_engine.count < 100 ? 450 : 0; },
                Adamantite(){ return !global.interstellar.hasOwnProperty('stellar_engine') || global.interstellar.stellar_engine.count < 100 ? 17500 : 0; },
                Infernite(){ return !global.interstellar.hasOwnProperty('stellar_engine') || global.interstellar.stellar_engine.count < 100 ? 225 : 0; },
                Graphene(){ return !global.interstellar.hasOwnProperty('stellar_engine') || global.interstellar.stellar_engine.count < 100 ? 45000 : 0; },
                Mythril(){ return !global.interstellar.hasOwnProperty('stellar_engine') || global.interstellar.stellar_engine.count < 100 ? 250 : 0; },
                Aerogel(){ return !global.interstellar.hasOwnProperty('stellar_engine') || global.interstellar.stellar_engine.count < 100 ? 75 : 0; },
            },
            effect(){
                if (!global.interstellar.hasOwnProperty('stellar_engine') || global.interstellar.stellar_engine.count < 100){
                    let remain = global.interstellar.hasOwnProperty('stellar_engine') ? 100 - global.interstellar.stellar_engine.count : 100;
                    return `<div>${loc('interstellar_stellar_engine_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    let waves = global.tech['gravity'] && global.tech['gravity'] >= 2 ? 13.5 : 7.5;
                    let output = powerModifier(+(20 + ((global.interstellar.stellar_engine.mass - 8) * waves) + (global.interstellar.stellar_engine.exotic * waves * 10)).toFixed(2));
                    if (global.tech['blackhole'] >= 5){
                        let mass = +(global.interstellar.stellar_engine.mass + global.interstellar.stellar_engine.exotic).toFixed(10);
                        let exotic = +(global.interstellar.stellar_engine.exotic).toFixed(10);
                        let blackhole = global.interstellar.stellar_engine.exotic > 0 ? loc('interstellar_stellar_engine_effect3',[mass,exotic]) : loc('interstellar_stellar_engine_effect2',[mass]);
                        return `<div>${loc('interstellar_stellar_engine_complete',[output])}</div><div>${blackhole}</div>`;
                    }
                    else {
                        return loc('interstellar_stellar_engine_complete',[output]);
                    }
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.interstellar.stellar_engine.count < 100){
                        incrementStruct('stellar_engine','interstellar');
                        if (global.interstellar.stellar_engine.count >= 100 && global.tech['blackhole'] === 3){
                            global.tech['blackhole'] = 4;
                            drawTech();
                        }
                    }
                    return true;
                }
                return false;
            }
        },
        mass_ejector: {
            id: 'interstellar-mass_ejector',
            title: loc('interstellar_mass_ejector'),
            desc: `<div>${loc('interstellar_mass_ejector')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { blackhole: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('mass_ejector', offset, 750000, 1.25, 'interstellar'); },
                Adamantite(offset){ return spaceCostMultiplier('mass_ejector', offset, 125000, 1.25, 'interstellar'); },
                Infernite(offset){ return spaceCostMultiplier('mass_ejector', offset, 275, 1.25, 'interstellar'); },
                Elerium(offset){ return spaceCostMultiplier('mass_ejector', offset, 100, 1.25, 'interstellar'); },
                Mythril(offset){ return spaceCostMultiplier('mass_ejector', offset, 10000, 1.25, 'interstellar'); },
            },
            effect(){
                return `<div><span>${loc('interstellar_mass_ejector_effect')}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div>`;
            },
            powered(){ return powerCostMod(3); },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.interstellar.mass_ejector.count === 0){
                        messageQueue(loc('interstellar_mass_ejector_msg'),'info');
                    }
                    global.settings.showEjector = true;
                    incrementStruct('mass_ejector','interstellar');
                    if (global.city.power >= $(this)[0].powered()){
                        global.interstellar['mass_ejector'].on++;
                    }
                    clearElement($('#resources'));
                    defineResources();
                    return true;
                }
                return false;
            },
            flair(){
                return loc('interstellar_mass_ejector_flair');
            }
        },
        jump_ship: {
            id: 'interstellar-jump_ship',
            title: loc('interstellar_jump_ship'),
            desc: loc('interstellar_jump_ship_desc'),
            reqs: { stargate: 1 },
            grant: ['stargate',2],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Money(){ return +int_fuel_adjust(20000000).toFixed(0); },
                Copper(){ return +int_fuel_adjust(2400000).toFixed(0); },
                Aluminium(){ return +int_fuel_adjust(4000000).toFixed(0); },
                Titanium(){ return +int_fuel_adjust(1250000).toFixed(0); },
                Adamantite(){ return +int_fuel_adjust(750000).toFixed(0); },
                Stanene(){ return +int_fuel_adjust(900000).toFixed(0); },
                Aerogel(){ return +int_fuel_adjust(100000).toFixed(0); }
            },
            effect: loc('interstellar_jump_ship_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        wormhole_mission: {
            id: 'interstellar-wormhole_mission',
            title: loc('space_mission_title', [loc('interstellar_wormhole_name')]),
            desc: loc('space_mission_desc', [loc('interstellar_wormhole_name')]),
            reqs: { stargate: 2 },
            grant: ['stargate',3],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(150000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(75000).toFixed(0); }
            },
            effect: loc('interstellar_wormhole_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){ 
                    global.interstellar['stargate'] = { count: 0 };
                    global.galaxy['gateway_station'] = { count: 0, on: 0 };
                    messageQueue(loc('interstellar_wormhole_mission_result'),'info');
                    return true;
                }
                return false;
            }
        },
        stargate: {
            id: 'interstellar-stargate',
            title: loc('interstellar_stargate'),
            desc(){
                if (!global.interstellar.hasOwnProperty('stargate') || global.interstellar.stargate.count < 200){
                    return `<div>${loc('interstellar_stargate')}</div><div class="has-text-special">${loc('requires_segmemts',[200])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_stargate')}</div>`;
                }
            },
            wiki: false,
            reqs: { stargate: 3 },
            condition(){
                return global.interstellar.stargate.count >= 200 ? false : true;
            },
            no_queue(){ return global.interstellar.stargate.count < 200 ? false : true },
            queue_size: 10,
            queue_complete(){ return global.interstellar.stargate.count >= 200 ? true : false; },
            cost: {
                Money(){ return !global.interstellar.hasOwnProperty('stargate') || global.interstellar.stargate.count < 200 ? 1000000 : 0; },
                Neutronium(){ return !global.interstellar.hasOwnProperty('stargate') || global.interstellar.stargate.count < 200 ? 4800 : 0; },
                Infernite(){ return !global.interstellar.hasOwnProperty('stargate') || global.interstellar.stargate.count < 200 ? 666 : 0; },
                Elerium(){ return !global.interstellar.hasOwnProperty('stargate') || global.interstellar.stargate.count < 200 ? 75 : 0; },
                Nano_Tube(){ return !global.interstellar.hasOwnProperty('stargate') || global.interstellar.stargate.count < 200 ? 12000 : 0; },
                Stanene(){ return !global.interstellar.hasOwnProperty('stargate') || global.interstellar.stargate.count < 200 ? 60000 : 0; },
                Mythril(){ return !global.interstellar.hasOwnProperty('stargate') || global.interstellar.stargate.count < 200 ? 3200 : 0; }
            },
            effect(){
                if (!global.interstellar.hasOwnProperty('stargate') || global.interstellar.stargate.count < 200){
                    let remain = global.interstellar.hasOwnProperty('stargate') ? 200 - global.interstellar.stargate.count : 200;
                    return `<div>${loc('interstellar_stargate_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.interstellar.stargate.count < 200){
                        incrementStruct('stargate','interstellar');
                        if (global.interstellar.stargate.count >= 200){
                            global.tech['stargate'] = 4;
                            global.interstellar['s_gate'] = { count: 1, on: 0 };
                            if (global.city.power >= interstellarProjects.int_blackhole.s_gate.powered()){
                                global.interstellar['s_gate'].on++;
                            }
                            deepSpace();
                            var id = $(this)[0].id;
                            $(`#pop${id}`).hide();
                            if (poppers[id]){
                                poppers[id].destroy();
                            }
                            clearElement($(`#pop${id}`),true);
                        }
                    }
                    return true;
                }
                return false;
            }
        },
        s_gate: {
            id: 'interstellar-s_gate',
            title: loc('interstellar_stargate'),
            desc(){
                return `<div>${loc('interstellar_stargate')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { stargate: 4 },
            condition(){
                return global.interstellar.stargate.count >= 200 ? true : false;
            },
            no_queue(){ return true },
            cost: {},
            powered(){
                return powerCostMod(250);
            },
            effect(){
                return `<div>${loc('interstellar_s_gate_effect')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                return false;
            }
        },
    },
    int_sirius: {
        info: {
            name(){ return global.tech.ascension >= 3 ? loc('interstellar_sirius_b_name') : loc('interstellar_sirius_name'); },
            desc(){ return global.tech.ascension >= 3 ? loc('interstellar_sirius_b_desc') : loc('interstellar_sirius_desc',[races[global.race.species].home]); },
        },
        sirius_mission: {
            id: 'interstellar-sirius_mission',
            title: loc('space_mission_title', [loc('interstellar_sirius_name')]),
            desc: loc('space_mission_desc', [loc('interstellar_sirius_name')]),
            reqs: { ascension: 2 },
            grant: ['ascension',3],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(480000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(225000).toFixed(0); }
            },
            effect(){ return loc('interstellar_sirius_mission_effect',[races[global.race.species].name,races[global.race.species].home]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        sirius_b: {
            id: 'interstellar-sirius_b',
            title: loc('interstellar_sirius_b'),
            desc: loc('interstellar_sirius_b'),
            reqs: { ascension: 3 },
            grant: ['ascension',4],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Knowledge(){ return 20000000; },
            },
            effect(){ return loc('interstellar_sirius_b_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['space_elevator'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        space_elevator: {
            id: 'interstellar-space_elevator',
            title: loc('interstellar_space_elevator'),
            desc(){
                if (!global.interstellar.hasOwnProperty('space_elevator') || global.interstellar.space_elevator.count < 100){
                    return `<div>${loc('interstellar_space_elevator')}</div><div class="has-text-special">${loc('requires_segmemts',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_space_elevator')}</div>`;
                }
            },
            reqs: { ascension: 4 },
            condition(){
                return global.interstellar.space_elevator.count >= 100 ? false : true;
            },
            no_queue(){ return global.interstellar.space_elevator.count < 100 ? false : true },
            queue_size: 5,
            queue_complete(){ return global.interstellar.space_elevator.count >= 100 ? true : false; },
            cost: {
                Money(){ return !global.interstellar.hasOwnProperty('space_elevator') || global.interstellar.space_elevator.count < 100 ? 20000000 : 0; },
                Nano_Tube(){ return !global.interstellar.hasOwnProperty('space_elevator') || global.interstellar.space_elevator.count < 100 ? 500000 : 0; },
                Bolognium(){ return !global.interstellar.hasOwnProperty('space_elevator') || global.interstellar.space_elevator.count < 100 ? 100000 : 0; },
                Mythril(){ return !global.interstellar.hasOwnProperty('space_elevator') || global.interstellar.space_elevator.count < 100 ? 125000 : 0; },
            },
            effect(){
                if (!global.interstellar.hasOwnProperty('space_elevator') || global.interstellar.space_elevator.count < 100){
                    let remain = global.interstellar.hasOwnProperty('space_elevator') ? 100 - global.interstellar.space_elevator.count : 100;
                    return `<div>${loc('interstellar_space_elevator_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.interstellar.space_elevator.count < 100){
                        incrementStruct('space_elevator','interstellar');
                        if (global.interstellar.space_elevator.count >= 100){
                            global.tech['ascension'] = 5;
                            global.interstellar['gravity_dome'] = { count: 0 };
                            deepSpace();
                            var id = $(this)[0].id;
                            $(`#pop${id}`).hide();
                            if (poppers[id]){
                                poppers[id].destroy();
                            }
                            clearElement($(`#pop${id}`),true);
                        }
                    }
                    return true;
                }
                return false;
            }
        },
        gravity_dome: {
            id: 'interstellar-gravity_dome',
            title: loc('interstellar_gravity_dome'),
            desc(){
                if (!global.interstellar.hasOwnProperty('gravity_dome') || global.interstellar.gravity_dome.count < 100){
                    return `<div>${loc('interstellar_gravity_dome')}</div><div class="has-text-special">${loc('requires_segmemts',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_gravity_dome')}</div>`;
                }
            },
            reqs: { ascension: 5 },
            condition(){
                return global.interstellar.gravity_dome.count >= 100 ? false : true;
            },
            no_queue(){ return global.interstellar.gravity_dome.count < 100 ? false : true },
            queue_size: 5,
            queue_complete(){ return global.interstellar.gravity_dome.count >= 100 ? true : false; },
            cost: {
                Money(){ return !global.interstellar.hasOwnProperty('gravity_dome') || global.interstellar.gravity_dome.count < 100 ? 35000000 : 0; },
                Cement(){ return !global.interstellar.hasOwnProperty('gravity_dome') || global.interstellar.gravity_dome.count < 100 ? 1250000 : 0; },
                Adamantite(){ return !global.interstellar.hasOwnProperty('gravity_dome') || global.interstellar.gravity_dome.count < 100 ? 650000 : 0; },
                Aerogel(){ return !global.interstellar.hasOwnProperty('gravity_dome') || global.interstellar.gravity_dome.count < 100 ? 180000 : 0; },
            },
            effect(){
                if (!global.interstellar.hasOwnProperty('gravity_dome') || global.interstellar.gravity_dome.count < 100){
                    let remain = global.interstellar.hasOwnProperty('gravity_dome') ? 100 - global.interstellar.gravity_dome.count : 100;
                    return `<div>${loc('interstellar_gravity_dome_effect',[races[global.race.species].home])}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.interstellar.gravity_dome.count < 100){
                        incrementStruct('gravity_dome','interstellar');
                        if (global.interstellar.gravity_dome.count >= 100){
                            global.tech['ascension'] = 6;
                            global.interstellar['ascension_machine'] = { count: 0 };
                            global.interstellar['thermal_collector'] = { count: 0 };
                            deepSpace();
                            var id = $(this)[0].id;
                            $(`#pop${id}`).hide();
                            if (poppers[id]){
                                poppers[id].destroy();
                            }
                            clearElement($(`#pop${id}`),true);
                        }
                    }
                    return true;
                }
                return false;
            }
        },
        ascension_machine: {
            id: 'interstellar-ascension_machine',
            title: loc('interstellar_ascension_machine'),
            desc(){
                if (!global.interstellar.hasOwnProperty('ascension_machine') || global.interstellar.ascension_machine.count < 100){
                    return `<div>${loc('interstellar_ascension_machine')}</div><div class="has-text-special">${loc('requires_segmemts',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_ascension_machine')}</div>`;
                }
            },
            wiki: false,
            reqs: { ascension: 6 },
            condition(){
                return global.interstellar.ascension_machine.count >= 100 ? false : true;
            },
            no_queue(){ return global.interstellar.ascension_machine.count < 100 ? false : true },
            queue_size: 5,
            queue_complete(){ return global.interstellar.ascension_machine.count >= 100 ? true : false; },
            cost: {
                Money(){ return !global.interstellar.hasOwnProperty('ascension_machine') || global.interstellar.ascension_machine.count < 100 ? 75000000 : 0; },
                Alloy(){ return !global.interstellar.hasOwnProperty('ascension_machine') || global.interstellar.ascension_machine.count < 100 ? 750000 : 0; },
                Neutronium(){ return !global.interstellar.hasOwnProperty('ascension_machine') || global.interstellar.ascension_machine.count < 100 ? 125000 : 0; },
                Elerium(){ return !global.interstellar.hasOwnProperty('ascension_machine') || global.interstellar.ascension_machine.count < 100 ? 1000 : 0; },
                Orichalcum(){ return !global.interstellar.hasOwnProperty('ascension_machine') || global.interstellar.ascension_machine.count < 100 ? 250000 : 0; },
                Nanoweave(){ return !global.interstellar.hasOwnProperty('ascension_machine') || global.interstellar.ascension_machine.count < 100 ? 75000 : 0; },
            },
            effect(){
                if (!global.interstellar.hasOwnProperty('ascension_machine') || global.interstellar.ascension_machine.count < 100){
                    let remain = global.interstellar.hasOwnProperty('ascension_machine') ? 100 - global.interstellar.ascension_machine.count : 100;
                    return `<div>${loc('interstellar_ascension_machine_effect',[races[global.race.species].name])}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.interstellar.ascension_machine.count < 100){
                        incrementStruct('ascension_machine','interstellar');
                        if (global.interstellar.ascension_machine.count >= 100){
                            global.tech['ascension'] = 7;
                            global.interstellar['ascension_trigger'] = { count: 1, on: 0 };
                            deepSpace();
                            var id = $(this)[0].id;
                            $(`#pop${id}`).hide();
                            if (poppers[id]){
                                poppers[id].destroy();
                            }
                            clearElement($(`#pop${id}`),true);
                        }
                    }
                    return true;
                }
                return false;
            }
        },
        ascension_trigger: {
            id: 'interstellar-ascension_trigger',
            title: loc('interstellar_ascension_machine'),
            desc(){ return `<div>${loc('interstellar_ascension_machine')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { ascension: 7 },
            condition(){
                return global.interstellar.ascension_machine.count >= 100 ? true : false;
            },
            no_queue(){ return true; },
            cost: {},
            powered(){
                let heatsink = 100;
                if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 2){
                    heatsink += global.stats.achieve.technophobe.l >= 4 ? 25 : 10;
                    let universes = ['h','a','e','m'];
                    for (let i=0; i<universes.length; i++){
                        if (global.stats.achieve.technophobe[universes[i]] && global.stats.achieve.technophobe[universes[i]] >= 5){
                            heatsink += 5;
                        }
                    }
                }
                let power = Math.round(10000 - (heatsink * (global.interstellar.hasOwnProperty('thermal_collector') ? global.interstellar.thermal_collector.count : 0)));
                if (power < 0){
                    power = 0;
                }
                return powerCostMod(power);
            },
            postPower(o){
                if (o){
                    setTimeout(function(){
                        global.tech.ascension = p_on['ascension_trigger'] ? 8 : 7;
                        deepSpace();
                    }, 250);
                }
                else {
                    global.tech.ascension = 7;
                    deepSpace();
                }
            },
            effect(){
                let reward = astrialProjection();
                let power = $(this)[0].powered();
                let power_label = power > 0 ? `<div class="has-text-caution">${loc('minus_power',[power])}</div>` : '';
                return `<div>${loc('interstellar_ascension_trigger_effect')}</div>${reward}${power_label}`;
            },
            action(){
                return false;
            }
        },
        ascend: {
            id: 'interstellar-ascend',
            title: loc('interstellar_ascend'),
            desc: loc('interstellar_ascend'),
            reqs: { ascension: 8 },
            cost: {},
            effect(){
                let reward = astrialProjection();
                return `<div>${loc('interstellar_ascend_effect')}</div>${reward}`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    ascendLab();
                    return true;
                }
                return false;
            }
        },
        thermal_collector: {
            id: 'interstellar-thermal_collector',
            title: loc('interstellar_thermal_collector'),
            desc: loc('interstellar_thermal_collector'),
            reqs: { ascension: 6 },
            cost: {
                Money(offset){ return spaceCostMultiplier('thermal_collector', offset, 5000000, 1.08, 'interstellar'); },
                Infernite(offset){ return spaceCostMultiplier('thermal_collector', offset, 25000, 1.08, 'interstellar'); },
                Stanene(offset){ return spaceCostMultiplier('thermal_collector', offset, 1000000, 1.08, 'interstellar'); },
                Vitreloy(offset){ return spaceCostMultiplier('thermal_collector', offset, 100000, 1.08, 'interstellar'); },
            },
            effect(){
                let heatsink = 100;
                if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 2){
                    heatsink += global.stats.achieve.technophobe.l >= 4 ? 25 : 10;
                    let universes = ['h','a','e','m'];
                    for (let i=0; i<universes.length; i++){
                        if (global.stats.achieve.technophobe[universes[i]] && global.stats.achieve.technophobe[universes[i]] >= 5){
                            heatsink += 5;
                        }
                    }
                }
                return loc('interstellar_thermal_collector_effect',[heatsink]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('thermal_collector','interstellar');
                    return true;
                }
                return false;
            }
        },
    }
};

function astrialProjection(){
    let gains = calcPrestige('ascend');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    return `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.phage,loc('resource_Phage_name')])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.harmony,loc('resource_Harmony_name')])}</div><div>${loc('interstellar_ascension_trigger_effect3')}</div>`;
}

const galaxyProjects = {
    gxy_gateway: {
        info: {
            name: loc('galaxy_gateway'),
            desc(){ return loc('galaxy_gateway_desc'); },
            control(){
                return {
                    name: races[global.race.species].name,
                    color: 'success',
                }; 
            },
            support: 'starbase'
        },
        gateway_mission: {
            id: 'galaxy-gateway_mission',
            title: loc('galaxy_gateway_mission'),
            desc: loc('galaxy_gateway_mission'),
            reqs: { gateway: 1 },
            grant: ['gateway',2],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(212000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(110000).toFixed(0); }
            },
            effect: loc('galaxy_gateway_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    xeno_race();
                    global.galaxy['defense'] = {
                        gxy_stargate: {
                            scout_ship: 0,
                            corvette_ship: 0,
                            frigate_ship: 0,
                            cruiser_ship: 0,
                            dreadnought: 0
                        },
                        gxy_gateway: {
                            scout_ship: 0,
                            corvette_ship: 0,
                            frigate_ship: 0,
                            cruiser_ship: 0,
                            dreadnought: 0
                        },
                        gxy_gorddon: {
                            scout_ship: 0,
                            corvette_ship: 0,
                            frigate_ship: 0,
                            cruiser_ship: 0,
                            dreadnought: 0
                        },
                        gxy_alien1: {
                            scout_ship: 0,
                            corvette_ship: 0,
                            frigate_ship: 0,
                            cruiser_ship: 0,
                            dreadnought: 0
                        },
                        gxy_alien2: {
                            scout_ship: 0,
                            corvette_ship: 0,
                            frigate_ship: 0,
                            cruiser_ship: 0,
                            dreadnought: 0
                        },
                        gxy_chthonian: {
                            scout_ship: 0,
                            corvette_ship: 0,
                            frigate_ship: 0,
                            cruiser_ship: 0,
                            dreadnought: 0
                        }
                    };
                    return true;
                }
                return false;
            }
        },
        starbase: {
            id: 'galaxy-starbase',
            title: loc('galaxy_starbase'),
            desc: `<div>${loc('galaxy_starbase')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { gateway: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('starbase', offset, 4200000, 1.25, 'galaxy'); },
                Elerium(offset){ return spaceCostMultiplier('starbase', offset, 1000, 1.25, 'galaxy'); },
                Mythril(offset){ return spaceCostMultiplier('starbase', offset, 90000, 1.25, 'galaxy'); },
                Graphene(offset){ return spaceCostMultiplier('starbase', offset, 320000, 1.25, 'galaxy'); },
            },
            effect(){
                let helium = +(int_fuel_adjust(25)).toFixed(2);
                let food = 250;
                let soldiers = global.tech.marines >= 2 ? 8 : 5;
                return `<div class="has-text-advanced">${loc('galaxy_defense_platform_effect',[25])}</div><div>${loc('galaxy_gateway_support',[$(this)[0].support()])}</div><div>${loc('plus_max_soldiers',[soldiers])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect2',[helium,$(this)[0].powered()])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect3',[food,global.resource.Food.name])}</div>`;
            },
            support(){ return 2; },
            powered(){ return powerCostMod(p_on['s_gate'] ? 12 : 0); },
            refresh: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('starbase','galaxy');
                    if (global.city.power >= $(this)[0].powered()){
                        global.galaxy['starbase'].on++;
                    }
                    if (global.tech['gateway'] === 2){
                        global.galaxy['bolognium_ship'] = { count: 0, on: 0, crew: 0 };
                        global.tech['gateway'] = 3;
                    }
                    return true;
                }
                return false;
            }
        },
        ship_dock: {
            id: 'galaxy-ship_dock',
            title: loc('galaxy_ship_dock'),
            desc: `<div>${loc('galaxy_ship_dock')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { gateway: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('ship_dock', offset, 3600000, 1.25, 'galaxy'); },
                Steel(offset){ return spaceCostMultiplier('ship_dock', offset, 880000, 1.25, 'galaxy'); },
                Aluminium(offset){ return spaceCostMultiplier('ship_dock', offset, 1200000, 1.25, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('ship_dock', offset, 75000, 1.25, 'galaxy'); },
            },
            effect(){
                return `<div>${loc('galaxy_ship_dock_effect',[0.25])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            support(){ return p_on['starbase'] ? 0.25 * p_on['starbase'] : 0; },
            powered(){ return powerCostMod(p_on['s_gate'] ? 4 : 0); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('ship_dock','galaxy');
                    if (global.city.power >= $(this)[0].powered()){
                        global.galaxy['ship_dock'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        bolognium_ship: {
            id: 'galaxy-bolognium_ship',
            title: loc('galaxy_bolognium_ship'),
            desc(){
                return `<div>${loc('galaxy_bolognium_ship_desc')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[loc('resource_Helium_3_name')])}</div>`;
            },
            reqs: { gateway: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('bolognium_ship', offset, 1400000, 1.22, 'galaxy'); },
                Iron(offset){ return spaceCostMultiplier('bolognium_ship', offset, 560000, 1.22, 'galaxy'); },
                Infernite(offset){ return spaceCostMultiplier('bolognium_ship', offset, 1800, 1.22, 'galaxy'); },
                Nano_Tube(offset){ return spaceCostMultiplier('bolognium_ship', offset, 475000, 1.22, 'galaxy'); },
            },
            effect(){
                let bolognium = +(0.008 * zigguratBonus()).toFixed(3);
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                return `<div>${loc('gain',[bolognium,loc('resource_Bolognium_name')])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            support(){ return -1; },
            ship: {
                civ: 2,
                mil: 0,
                helium: 5
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('bolognium_ship','galaxy');
                    global.resource.Bolognium.display = true;
                    global.civic.crew.display = true;
                    if (global.galaxy.starbase.support < global.galaxy.starbase.s_max){
                        global.galaxy['bolognium_ship'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        scout_ship: {
            id: 'galaxy-scout_ship',
            title: loc('galaxy_scout_ship'),
            desc(){
                return `<div>${loc('galaxy_scout_ship')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[loc('resource_Helium_3_name')])}</div>`;
            },
            reqs: { andromeda: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('scout_ship', offset, 1600000, 1.25, 'galaxy'); },
                Titanium(offset){ return spaceCostMultiplier('scout_ship', offset, 325000, 1.25, 'galaxy'); },
                Graphene(offset){ return spaceCostMultiplier('scout_ship', offset, 118000, 1.25, 'galaxy'); },
                Soul_Gem(offset){ return spaceCostMultiplier('scout_ship', offset, 1, 1.02, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                let sensors = global.tech.science >= 17 ? `<div>${loc('galaxy_scout_ship_effect2',[25])}</div>` : '';
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating])}</div><div>${loc('galaxy_scout_ship_effect')}</div>${sensors}<div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            support(){ return -1; },
            ship: {
                civ: 1,
                mil: 1,
                helium: 6,
                rating: 10
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('scout_ship','galaxy');
                    global.galaxy.defense.gxy_gateway.scout_ship++;
                    if (global.galaxy.starbase.support < global.galaxy.starbase.s_max){
                        global.galaxy['scout_ship'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        corvette_ship: {
            id: 'galaxy-corvette_ship',
            title: loc('galaxy_corvette_ship'),
            desc(){
                return `<div>${loc('galaxy_corvette_ship')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[loc('resource_Helium_3_name')])}</div>`;
            },
            reqs: { andromeda: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('corvette_ship', offset, 4500000, 1.25, 'galaxy'); },
                Steel(offset){ return spaceCostMultiplier('corvette_ship', offset, 1750000, 1.25, 'galaxy'); },
                Infernite(offset){ return spaceCostMultiplier('corvette_ship', offset, 16000, 1.25, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('corvette_ship', offset, 80000, 1.25, 'galaxy'); },
                Soul_Gem(offset){ return spaceCostMultiplier('corvette_ship', offset, 1, 1.25, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            support(){ return -1; },
            ship: {
                civ: 2,
                mil: 3,
                helium: 10,
                rating: 25
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('corvette_ship','galaxy');
                    global.galaxy.defense.gxy_gateway.corvette_ship++;
                    if (global.galaxy.starbase.support < global.galaxy.starbase.s_max){
                        global.galaxy['corvette_ship'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        frigate_ship: {
            id: 'galaxy-frigate_ship',
            title: loc('galaxy_frigate_ship'),
            desc(){
                return `<div>${loc('galaxy_frigate_ship')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[loc('resource_Helium_3_name')])}</div>`;
            },
            reqs: { andromeda: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('frigate_ship', offset, 18000000, 1.25, 'galaxy'); },
                Elerium(offset){ return spaceCostMultiplier('frigate_ship', offset, 1250, 1.25, 'galaxy'); },
                Mythril(offset){ return spaceCostMultiplier('frigate_ship', offset, 350000, 1.25, 'galaxy'); },
                Sheet_Metal(offset){ return spaceCostMultiplier('frigate_ship', offset, 800000, 1.25, 'galaxy'); },
                Soul_Gem(offset){ return spaceCostMultiplier('frigate_ship', offset, 2, 1.25, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            support(){ return -2; },
            ship: {
                civ: 3,
                mil: 5,
                helium: 25,
                rating: 80
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('frigate_ship','galaxy');
                    global.galaxy.defense.gxy_gateway.frigate_ship++;
                    if (global.galaxy.starbase.support + 1 < global.galaxy.starbase.s_max){
                        global.galaxy['frigate_ship'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        cruiser_ship: {
            id: 'galaxy-cruiser_ship',
            title: loc('galaxy_cruiser_ship'),
            desc(){
                return `<div>${loc('galaxy_cruiser_ship')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[loc('resource_Deuterium_name')])}</div>`;
            },
            reqs: { andromeda: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('cruiser_ship', offset, 75000000, 1.25, 'galaxy'); },
                Copper(offset){ return spaceCostMultiplier('cruiser_ship', offset, 6000000, 1.25, 'galaxy'); },
                Adamantite(offset){ return spaceCostMultiplier('cruiser_ship', offset, 1000000, 1.25, 'galaxy'); },
                Vitreloy(offset){ return spaceCostMultiplier('cruiser_ship', offset, 750000, 1.25, 'galaxy'); },
                Elerium(offset){ return spaceCostMultiplier('cruiser_ship', offset, 1800, 1.25, 'galaxy'); },
                Soul_Gem(offset){ return spaceCostMultiplier('cruiser_ship', offset, 5, 1.25, 'galaxy'); },
            },
            effect(){
                let deuterium = +int_fuel_adjust($(this)[0].ship.deuterium).toFixed(2);
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[deuterium,global.resource.Deuterium.name])}</div>`;
            },
            support(){ return -3; },
            ship: {
                civ: 6,
                mil: 10,
                deuterium: 25,
                rating: 250
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('cruiser_ship','galaxy');
                    global.galaxy.defense.gxy_gateway.cruiser_ship++;
                    if (global.galaxy.starbase.support + 2 < global.galaxy.starbase.s_max){
                        global.galaxy['cruiser_ship'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        dreadnought: {
            id: 'galaxy-dreadnought',
            title: loc('galaxy_dreadnought'),
            desc(){
                return `<div>${loc('galaxy_dreadnought')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[loc('resource_Deuterium_name')])}</div>`;
            },
            reqs: { andromeda: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('dreadnought', offset, 225000000, 1.25, 'galaxy'); },
                Neutronium(offset){ return spaceCostMultiplier('dreadnought', offset, 250000, 1.25, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('dreadnought', offset, 1500000, 1.25, 'galaxy'); },
                Vitreloy(offset){ return spaceCostMultiplier('dreadnought', offset, 1000000, 1.25, 'galaxy'); },
                Infernite(offset){ return spaceCostMultiplier('dreadnought', offset, 400000, 1.25, 'galaxy'); },
                Aerogel(offset){ return spaceCostMultiplier('dreadnought', offset, 800000, 1.25, 'galaxy'); },
                Soul_Gem(offset){ return spaceCostMultiplier('dreadnought', offset, 25, 1.25, 'galaxy'); },
            },
            effect(){
                let deuterium = +int_fuel_adjust($(this)[0].ship.deuterium).toFixed(2);
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[deuterium,global.resource.Deuterium.name])}</div>`;
            },
            support(){ return -5; },
            ship: {
                civ: 10,
                mil: 20,
                deuterium: 80,
                rating: 1800
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('dreadnought','galaxy');
                    global.galaxy.defense.gxy_gateway.dreadnought++;
                    if (global.galaxy.starbase.support + 2 < global.galaxy.starbase.s_max){
                        global.galaxy['dreadnought'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    gxy_stargate: {
        info: {
            name: loc('galaxy_stargate'),
            desc(){ return global.tech['piracy'] ? loc('galaxy_stargate_desc_alt') : loc('galaxy_stargate_desc'); },
            control(){
                return {
                    name: races[global.race.species].name,
                    color: 'success',
                }; 
            }
        },
        gateway_station: {
            id: 'galaxy-gateway_station',
            title: loc('galaxy_gateway_station'),
            desc(){ return `<div>${loc('galaxy_gateway_station_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { stargate: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('gateway_station', offset, 5000000, 1.25, 'galaxy'); },
                Aluminium(offset){ return spaceCostMultiplier('gateway_station', offset, 520000, 1.25, 'galaxy'); },
                Polymer(offset){ return spaceCostMultiplier('gateway_station', offset, 350000, 1.25, 'galaxy'); },
                Neutronium(offset){ return spaceCostMultiplier('gateway_station', offset, 17500, 1.25, 'galaxy'); },
            },
            effect(){
                let helium = spatialReasoning(2000);
                let deuterium = spatialReasoning(4500);
                let elerium = spatialReasoning(50);
                let gateway = '';
                if (global.tech['gateway'] && global.tech['gateway'] >= 2){
                    gateway = `<div>${loc('galaxy_gateway_support',[$(this)[0].support()])}</div>`;
                }
                return `${gateway}<div>${loc('plus_max_resource',[helium,loc('resource_Helium_3_name')])}</div><div>${loc('plus_max_resource',[deuterium,loc('resource_Deuterium_name')])}</div><div>${loc('plus_max_resource',[elerium,loc('resource_Elerium_name')])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            support(){ return 0.5; },
            powered(){ return powerCostMod(p_on['s_gate'] ? 4 : 0); },
            refresh: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('gateway_station','galaxy');
                    global['resource']['Helium_3'].max += spatialReasoning(2000);
                    global['resource']['Deuterium'].max += spatialReasoning(4500);
                    if (global.tech['stargate'] === 4){
                        global.galaxy['telemetry_beacon'] = { count: 0, on: 0 };
                        global.tech['stargate'] = 5;
                    }
                    if (global.city.power >= $(this)[0].powered()){
                        global.galaxy['gateway_station'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        telemetry_beacon: {
            id: 'galaxy-telemetry_beacon',
            title: loc('galaxy_telemetry_beacon'),
            desc(){ return `<div>${loc('galaxy_telemetry_beacon')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { stargate: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('telemetry_beacon', offset, 2250000, 1.25, 'galaxy'); },
                Copper(offset){ return spaceCostMultiplier('telemetry_beacon', offset, 685000, 1.25, 'galaxy'); },
                Alloy(offset){ return spaceCostMultiplier('telemetry_beacon', offset, 425000, 1.25, 'galaxy'); },
                Iridium(offset){ return spaceCostMultiplier('telemetry_beacon', offset, 177000, 1.25, 'galaxy'); },
            },
            effect(){
                let base = global.tech['telemetry'] ? 1200 : 800;
                if (global.tech.science >= 17){
                    base += gal_on['scout_ship'] * 25;
                }
                let know = p_on['telemetry_beacon'] ? base * p_on['telemetry_beacon'] : 0;
                if (global.tech['telemetry']){
                    know *= 1.5;
                }
                let gateway = '';
                if (global.tech['gateway'] && global.tech['gateway'] >= 2){
                    gateway = `<div>${loc('galaxy_gateway_support',[$(this)[0].support()])}</div>`;
                }
                return `${gateway}<div>${loc('galaxy_telemetry_beacon_effect1',[base])}</div><div>${loc('galaxy_telemetry_beacon_effect2',[know])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            support(){ return global.tech['telemetry'] ? 0.75 : 0.5; },
            powered(){ return powerCostMod(p_on['s_gate'] ? 4 : 0); },
            postPower(o){
                let powered = o ? p_on['telemetry_beacon'] + keyMultiplier() : p_on['telemetry_beacon'] - keyMultiplier();
                if (powered > global.galaxy.telemetry_beacon.count){
                    powered = global.galaxy.telemetry_beacon.count;
                }
                else if (powered < 0){
                    powered = 0;
                }
                p_on['telemetry_beacon'] = powered;
                updateDesc($(this)[0],'galaxy','telemetry_beacon');
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('telemetry_beacon','galaxy');
                    if (global.city.power >= $(this)[0].powered()){
                        global.galaxy['telemetry_beacon'].on++;
                        global['resource']['Knowledge'].max += 1750;
                    }
                    if (!global.tech['gateway']){
                        global.galaxy['starbase'] = { count: 0, on: 0, support: 0, s_max: 0 };
                        global.settings.space.gateway = true;
                        global.tech['gateway'] = 1;
                        galaxySpace();
                    }
                    return true;
                }
                return false;
            }
        },
        gateway_depot: {
            id: 'galaxy-gateway_depot',
            title: loc('galaxy_gateway_depot'),
            desc: `<div>${loc('galaxy_gateway_depot')}</div>`,
            reqs: { gateway: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('gateway_depot', offset, 4000000, 1.25, 'galaxy'); },
                Neutronium(offset){ return spaceCostMultiplier('gateway_depot', offset, 80000, 1.25, 'galaxy'); },
                Stanene(offset){ return spaceCostMultiplier('gateway_depot', offset, 500000, 1.25, 'galaxy'); },
                Vitreloy(offset){ return spaceCostMultiplier('gateway_depot', offset, 2500, 1.25, 'galaxy'); },
            },
            wide: true,
            effect(){
                let containers = global.tech['world_control'] ? 150 : 100;
                let elerium = spatialReasoning(200);
                let multiplier = gatewayStorage();
                let uranium = sizeApproximation(+(spatialReasoning(3000 * multiplier)).toFixed(0),1);
                let nano = sizeApproximation(+(spatialReasoning(250000 * multiplier)).toFixed(0),1);
                let neutronium = sizeApproximation(+(spatialReasoning(9001 * multiplier)).toFixed(0),1);
                let infernite = sizeApproximation(+(spatialReasoning(6660 * multiplier)).toFixed(0),1);
                let desc = '<div class="aTable">';
                desc = desc + `<span>${loc('plus_max_crates',[containers])}</span><span>${loc('plus_max_containers',[containers])}</span>`;
                desc = desc + `<span>${loc('plus_max_resource',[uranium,global.resource.Uranium.name])}</span>`;
                desc = desc + `<span>${loc('plus_max_resource',[nano,global.resource.Nano_Tube.name])}</span>`;
                desc = desc + `<span>${loc('plus_max_resource',[neutronium,global.resource.Neutronium.name])}</span>`;
                desc = desc + `<span>${loc('plus_max_resource',[infernite,global.resource.Infernite.name])}</span>`;
                desc = desc + '</div>';
                return `${desc}<div>${loc('galaxy_gateway_depot_effect',[elerium,loc('resource_Elerium_name')])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(p_on['s_gate'] ? 10 : 0); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('gateway_depot','galaxy');
                    let multiplier = gatewayStorage();
                    global['resource']['Uranium'].max += (spatialReasoning(3000 * multiplier));
                    global['resource']['Nano_Tube'].max += (spatialReasoning(250000 * multiplier));
                    global['resource']['Neutronium'].max += (spatialReasoning(9001 * multiplier));
                    global['resource']['Infernite'].max += (spatialReasoning(6660 * multiplier));
                    if (global.city.power >= $(this)[0].powered()){
                        global.galaxy['gateway_depot'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        defense_platform: {
            id: 'galaxy-defense_platform',
            title: loc('galaxy_defense_platform'),
            desc(){ return `<div>${loc('galaxy_defense_platform')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { stargate: 6 },
            cost: {
                Money(offset){ return spaceCostMultiplier('defense_platform', offset, 750000, 1.25, 'galaxy'); },
                Adamantite(offset){ return spaceCostMultiplier('defense_platform', offset, 425000, 1.25, 'galaxy'); },
                Elerium(offset){ return spaceCostMultiplier('defense_platform', offset, 800, 1.25, 'galaxy'); },
                Vitreloy(offset){ return spaceCostMultiplier('defense_platform', offset, 1250, 1.25, 'galaxy'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('defense_platform', offset, 75000, 1.25, 'galaxy'); },
            },
            effect(){
                return `<div class="has-text-advanced">${loc('galaxy_defense_platform_effect',[20])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(p_on['s_gate'] ? 5 : 0); },
            postPower(o){
                vBind({el: `#gxy_stargate`},'update');
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('defense_platform','galaxy');
                    if (global.city.power >= $(this)[0].powered()){
                        global.galaxy['defense_platform'].on++;
                    }
                    return true;
                }
                return false;
            },
            post(){
                vBind({el: `#gxy_stargate`},'update');
            }
        },
    },
    gxy_gorddon: {
        info: {
            name: loc('galaxy_gorddon'),
            desc(){ return loc('galaxy_gorddon_desc'); },
            control(){
                return {
                    name: races[global.galaxy.alien1.id].name,
                    color: 'advanced',
                }; 
            },
        },
        gorddon_mission: {
            id: 'galaxy-demaus_mission',
            title: loc('galaxy_gorddon_mission'),
            desc: loc('galaxy_gorddon_mission_desc'),
            reqs: { xeno: 2 },
            grant: ['xeno',3],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Structs(){
                    return {
                        galaxy: {
                            scout_ship: { s: 'gxy_gateway', count: 2, on: 2 },
                            corvette_ship: { s: 'gxy_gateway', count: 1, on: 1 },
                        }
                    };
                },
                Helium_3(){ return +int_fuel_adjust(230000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(125000).toFixed(0); }
            },
            effect: loc('galaxy_gorddon_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    xeno_race();
                    global.galaxy.defense.gxy_gateway.scout_ship -= 2;
                    global.galaxy.defense.gxy_gorddon.scout_ship += 2;
                    global.galaxy.defense.gxy_gateway.corvette_ship--;
                    global.galaxy.defense.gxy_gorddon.corvette_ship++;
                    let s1name = races[global.galaxy.alien1.id].name;
                    let s1desc = races[global.galaxy.alien1.id].entity;
                    let s2name = races[global.galaxy.alien2.id].name;
                    let s2desc = races[global.galaxy.alien2.id].entity;
                    messageQueue(loc('galaxy_gorddon_mission_result',[s1desc,s1name,s2desc,s2name]),'info');
                    return true;
                }
                return false;
            }
        },
        embassy: {
            id: 'galaxy-embassy',
            title: loc('galaxy_embassy'),
            desc: `<div>${loc('galaxy_embassy')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { xeno: 4 },
            no_queue(){ return global.galaxy.embassy.count >= 1 ? true : false; },
            cost: {
                Money(){ return !global.galaxy.hasOwnProperty('embassy') || global.galaxy.embassy.count < 1 ? 30000000 : 0; },
                Lumber(){ return !global.galaxy.hasOwnProperty('embassy') || global.galaxy.embassy.count < 1 ? 38000000 : 0; },
                Stone(){ return !global.galaxy.hasOwnProperty('embassy') || global.galaxy.embassy.count < 1 ? 32000000 : 0; },
                Furs(){ return !global.galaxy.hasOwnProperty('embassy') || global.galaxy.embassy.count < 1 ? 18000000 : 0; },
                Wrought_Iron(){ return !global.galaxy.hasOwnProperty('embassy') || global.galaxy.embassy.count < 1 ? 6000000 : 0; }
            },
            effect(){
                let food = 7500;
                let housing = '';
                if (global.tech.xeno >= 11){
                    housing = `<div>${loc('plus_max_citizens',[20])}</div>`;
                }
                return `<div>${loc('galaxy_embassy_effect',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name])}</div>${housing}<div class="has-text-caution">${loc('interstellar_alpha_starport_effect3',[food,global.resource.Food.name])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(p_on['s_gate'] ? 25 : 0); },
            refresh: true,
            action(){
                if (global.galaxy.embassy.count < 1 && payCosts($(this)[0].cost)){
                    incrementStruct('embassy','galaxy');
                    if (global.city.power >= $(this)[0].powered()){
                        global.galaxy['embassy'].on++;
                    }
                    if (global.tech['xeno'] === 4){
                        global.tech['xeno'] = 5;
                        global.galaxy['freighter'] = { count: 0, on: 0, crew: 0 };
                        global.galaxy['trade'] = { max: 0, cur: 0, f0: 0, f1: 0, f2: 0, f3: 0, f4: 0, f5: 0, f6: 0, f7: 0, f8: 0 };
                        galacticTrade();
                        messageQueue(loc('galaxy_embassy_complete',[races[global.galaxy.alien1.id].name,races[global.galaxy.alien2.id].name]),'info');
                    }
                    return true;
                }
                return false;
            }
        },
        dormitory: {
            id: 'galaxy-dormitory',
            title: loc('galaxy_dormitory'),
            desc(){
                return `<div>${loc('galaxy_dormitory')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { xeno: 6 },
            cost: {
                Money(offset){ return spaceCostMultiplier('dormitory', offset, 10000000, 1.25, 'galaxy'); },
                Furs(offset){ return spaceCostMultiplier('dormitory', offset, 700000, 1.25, 'galaxy'); },
                Cement(offset){ return spaceCostMultiplier('dormitory', offset, 1200000, 1.25, 'galaxy'); },
                Plywood(offset){ return spaceCostMultiplier('dormitory', offset, 85000, 1.25, 'galaxy'); },
            },
            effect(){
                return `<div>${loc('plus_max_citizens',[3])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(3); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('dormitory','galaxy');
                    if (global.city.power >= $(this)[0].powered()){
                        global.galaxy['dormitory'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        symposium: {
            id: 'galaxy-symposium',
            title: loc('galaxy_symposium'),
            desc(){
                return `<div>${loc('galaxy_symposium')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { xeno: 6 },
            cost: {
                Money(offset){ return spaceCostMultiplier('symposium', offset, 8000000, 1.25, 'galaxy'); },
                Food(offset){ return global.race['ravenous'] ? 0 : spaceCostMultiplier('symposium', offset, 125000, 1.25, 'galaxy'); },
                Lumber(offset){ return spaceCostMultiplier('symposium', offset, 460000, 1.25, 'galaxy'); },
                Brick(offset){ return spaceCostMultiplier('symposium', offset, 261600, 1.25, 'galaxy'); },
            },
            effect(){
                let leave = '';
                if (global.tech.xeno >= 7){
                    leave = `<div>${loc('galaxy_symposium_effect3',[300])}</div>`;
                }
                return `<div>${loc('galaxy_symposium_effect',[1750])}</div><div>${loc('galaxy_symposium_effect2',[650])}</div>${leave}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(4); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('symposium','galaxy');
                    if (global.city.power >= $(this)[0].powered()){
                        global.galaxy['symposium'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        freighter: {
            id: 'galaxy-freighter',
            title: loc('galaxy_freighter'),
            desc(){
                return `<div>${loc('galaxy_freighter')}</div><div class="has-text-special">${loc('galaxy_crew_fuel',[loc('resource_Helium_3_name')])}</div>`;
            },
            reqs: { xeno: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('freighter', offset, 6000000, 1.2, 'galaxy'); },
                Uranium(offset){ return spaceCostMultiplier('freighter', offset, 10000, 1.2, 'galaxy'); },
                Adamantite(offset){ return spaceCostMultiplier('freighter', offset, 460000, 1.2, 'galaxy'); },
                Stanene(offset){ return spaceCostMultiplier('freighter', offset, 261600, 1.2, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('freighter', offset, 188000, 1.2, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                let bank = '';
                if (global.tech.banking >= 13){
                    bank = `<div>${loc('interstellar_exchange_boost',[3])}</div>`;
                }
                return `<div>${loc('galaxy_freighter_effect',[2,races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name])}</div>${bank}<div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ: 3,
                mil: 0,
                helium: 12
            },
            special: true,
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('freighter','galaxy');
                    global.galaxy['freighter'].on++;
                    global.resource.Vitreloy.display = true;
                    return true;
                }
                return false;
            }
        },
    },
    gxy_alien1: {
        info: {
            name(){ return loc('galaxy_alien',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name]); },
            desc(){ return loc('galaxy_alien1_desc',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name]); },
            control(){
                return {
                    name: races[global.galaxy.alien1.id].name,
                    color: 'advanced',
                }; 
            },
        },
        consulate: {
            id: 'galaxy-consulate',
            title: loc('galaxy_consulate'),
            desc(){
                return loc('galaxy_consulate_desc',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name]);
            },
            reqs: { xeno: 8 },
            no_queue(){ return global.galaxy.consulate.count >= 1 ? true : false; },
            cost: {
                Money(){ return !global.galaxy.hasOwnProperty('consulate') || global.galaxy.consulate.count < 1 ? 90000000 : 0; },
                Stone(){ return !global.galaxy.hasOwnProperty('consulate') || global.galaxy.consulate.count < 1 ? 75000000 : 0; },
                Furs(){ return !global.galaxy.hasOwnProperty('consulate') || global.galaxy.consulate.count < 1 ? 30000000 : 0; },
                Iron(){ return !global.galaxy.hasOwnProperty('consulate') || global.galaxy.consulate.count < 1 ? 45000000 : 0; }
            },
            effect(){
                return loc('plus_max_citizens',[10]);
            },
            refresh: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.galaxy.consulate.count < 1){
                        incrementStruct('consulate','galaxy');
                        global.galaxy['resort'] = { count: 0, on: 0 };
                        global.galaxy['super_freighter'] = { count: 0, on: 0, crew: 0 };
                        global.tech.xeno = 9;
                    }
                    return true;
                }
                return false;
            }
        },
        resort: {
            id: 'galaxy-resort',
            title: loc('galaxy_resort'),
            desc(){
                return `<div>${loc('galaxy_resort')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { xeno: 9 },
            cost: {
                Money(offset){ return spaceCostMultiplier('resort', offset, 33000000, 1.25, 'galaxy'); },
                Stone(offset){ return spaceCostMultiplier('resort', offset, 25000000, 1.25, 'galaxy'); },
                Furs(offset){ return spaceCostMultiplier('resort', offset, 10000000, 1.25, 'galaxy'); },
                Oil(offset){ return spaceCostMultiplier('resort', offset, 125000, 1.25, 'galaxy'); },
            },
            effect(){
                return `<div>${loc('plus_max_citizens',[3])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            effect(){
                let money = spatialReasoning(global.tech['world_control'] ? 1875000 : 1500000);
                money = '$'+money;
                let joy = global.race['joyless'] ? '' : `<div>${loc('city_max_entertainer',[2])}</div>`;
                let desc = `<div>${loc('plus_max_resource',[money,loc('resource_Money_name')])}</div>${joy}<div>${loc('space_red_vr_center_effect2',[2])}</div>`;
                return desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(5); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('resort','galaxy');
                    if (global.city.power >= $(this)[0].powered()){
                        global.galaxy['resort'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        vitreloy_plant: {
            id: 'galaxy-vitreloy_plant',
            title: loc('galaxy_vitreloy_plant'),
            desc(){
                return `<div>${loc('galaxy_vitreloy_plant')}</div><div class="has-text-special">${loc('galaxy_vitreloy_plant_desc')}</div>`;
            },
            reqs: { xeno: 10 },
            cost: {
                Money(offset){ return spaceCostMultiplier('vitreloy_plant', offset, 35000000, 1.25, 'galaxy'); },
                Cement(offset){ return spaceCostMultiplier('vitreloy_plant', offset, 1800000, 1.25, 'galaxy'); },
                Neutronium(offset){ return spaceCostMultiplier('vitreloy_plant', offset, 250000, 1.25, 'galaxy'); },
                Iridium(offset){ return spaceCostMultiplier('vitreloy_plant', offset, 850000, 1.25, 'galaxy'); },
                Aerogel(offset){ return spaceCostMultiplier('vitreloy_plant', offset, 400000, 1.25, 'galaxy'); },
            },
            effect(){
                let vitreloy = +(0.18 * zigguratBonus()).toFixed(2);
                let bolognium = 2.5;
                let stanene = 100;
                let cash = 50000;
                return `<div>${loc('galaxy_vitreloy_plant_effect',[vitreloy])}</div><div class="has-text-caution">${loc('galaxy_vitreloy_plant_effect2',[bolognium,stanene])}</div><div class="has-text-caution">${loc('galaxy_vitreloy_plant_effect3',[cash,$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(10); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('vitreloy_plant','galaxy');
                    if (global.city.power >= $(this)[0].powered()){
                        global.galaxy['vitreloy_plant'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        super_freighter: {
            id: 'galaxy-super_freighter',
            title: loc('galaxy_super_freighter'),
            desc(){
                return `<div>${loc('galaxy_super_freighter')}</div><div class="has-text-special">${loc('galaxy_crew_fuel',[loc('resource_Helium_3_name')])}</div>`;
            },
            reqs: { xeno: 9 },
            cost: {
                Money(offset){ return spaceCostMultiplier('super_freighter', offset, 28000000, 1.2, 'galaxy'); },
                Aluminium(offset){ return spaceCostMultiplier('super_freighter', offset, 3500000, 1.2, 'galaxy'); },
                Alloy(offset){ return spaceCostMultiplier('super_freighter', offset, 1000000, 1.2, 'galaxy'); },
                Graphene(offset){ return spaceCostMultiplier('super_freighter', offset, 750000, 1.2, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                let bank = '';
                if (global.tech.banking >= 13){
                    bank = `<div>${loc('interstellar_exchange_boost',[8])}</div>`;
                }
                return `<div>${loc('galaxy_freighter_effect',[5,races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name])}</div>${bank}<div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ: 5,
                mil: 0,
                helium: 25
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('super_freighter','galaxy');
                    global.galaxy['super_freighter'].on++;
                    return true;
                }
                return false;
            }
        },
    },
    gxy_alien2: {
        info: {
            name(){ return loc('galaxy_alien',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]); },
            desc(){ return loc('galaxy_alien2_desc',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]); },
            control(){
                return {
                    name: races[global.galaxy.alien2.id].name,
                    color: 'danger',
                }; 
            },
            support: 'foothold'
        },
        alien2_mission: {
            id: 'galaxy-alien2_mission',
            title(){ return loc('galaxy_alien2_mission',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]); },
            desc(){ return loc('galaxy_alien2_mission_desc',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]); },
            reqs: { andromeda: 4 },
            grant: ['conflict',1],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Structs(){
                    return {
                        galaxy: {
                            frigate_ship: { s: 'gxy_gateway', count: 2, on: 2 },
                            cruiser_ship: { s: 'gxy_gateway', count: 1, on: 1 },
                        }
                    };
                },
            },
            effect(){ return `<div>${loc('galaxy_alien2_mission_desc',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name])}</div><div class="has-text-caution">${loc('galaxy_alien2_mission_effect',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name])}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.galaxy.defense.gxy_alien2.frigate_ship >= 2 && global.galaxy.defense.gxy_alien2.cruiser_ship >= 1){
                        if (global.galaxy.defense.gxy_alien2.cruiser_ship >= 2){
                            messageQueue(loc('galaxy_alien2_mission_result2',[races[global.galaxy.alien2.id].name]),'info');
                        }
                        else {
                            global.galaxy.defense.gxy_alien2.frigate_ship--;
                            global.galaxy.frigate_ship.on--;
                            global.galaxy.frigate_ship.count--;
                            global.galaxy.frigate_ship.crew -= galaxyProjects.gxy_gateway.frigate_ship.ship.civ;
                            global.galaxy.frigate_ship.mil -= galaxyProjects.gxy_gateway.frigate_ship.ship.mil;
                            global.resource[global.race.species].amount -= galaxyProjects.gxy_gateway.frigate_ship.ship.civ;
                            global.civic.garrison.workers -= galaxyProjects.gxy_gateway.frigate_ship.ship.mil;
                            messageQueue(loc('galaxy_alien2_mission_result',[races[global.galaxy.alien2.id].name]),'danger');
                        }
                        return true;
                    }
                    return false;
                }
                return false;
            }
        },
        foothold: {
            id: 'galaxy-foothold',
            title: loc('galaxy_foothold'),
            desc: `<div>${loc('galaxy_foothold')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { conflict: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('foothold', offset, 25000000, 1.25, 'galaxy'); },
                Titanium(offset){ return spaceCostMultiplier('foothold', offset, 3000000, 1.25, 'galaxy'); },
                Polymer(offset){ return spaceCostMultiplier('foothold', offset, 1750000, 1.25, 'galaxy'); },
                Iridium(offset){ return spaceCostMultiplier('foothold', offset, 900000, 1.25, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('foothold', offset, 50000, 1.25, 'galaxy'); },
            },
            effect(){
                let elerium = 2.5;
                return `<div class="has-text-advanced">${loc('galaxy_defense_platform_effect',[50])}</div><div>${loc('galaxy_foothold_effect',[$(this)[0].support(),races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name])}</div><div class="has-text-caution">${loc('galaxy_foothold_effect2',[elerium,$(this)[0].powered()])}</div>`;
            },
            support(){ return 4; },
            powered(){ return powerCostMod(p_on['s_gate'] ? 20 : 0); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('foothold','galaxy');
                    if (global.city.power >= $(this)[0].powered()){
                        global.galaxy['foothold'].on++;
                    }
                    if (global.tech['conflict'] === 1){
                        global.galaxy['armed_miner'] = { count: 0, on: 0, crew: 0, mil: 0 };
                        global.tech['conflict'] = 2;
                        galaxySpace();
                        drawTech();
                    }
                    return true;
                }
                return false;
            }
        },
        armed_miner: {
            id: 'galaxy-armed_miner',
            title: loc('galaxy_armed_miner'),
            desc(){
                return `<div>${loc('galaxy_armed_miner')}</div>`;
            },
            reqs: { conflict: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('armed_miner', offset, 5000000, 1.25, 'galaxy'); },
                Steel(offset){ return spaceCostMultiplier('armed_miner', offset, 1800000, 1.25, 'galaxy'); },
                Stanene(offset){ return spaceCostMultiplier('armed_miner', offset, 1975000, 1.25, 'galaxy'); },
                Vitreloy(offset){ return spaceCostMultiplier('armed_miner', offset, 20000, 1.25, 'galaxy'); },
                Soul_Gem(offset){ return spaceCostMultiplier('armed_miner', offset, 1, 1.25, 'galaxy'); },
            },
            effect(){
                let bolognium = +(0.032 * zigguratBonus()).toFixed(3);
                let adamantite = +(0.23 * zigguratBonus()).toFixed(3);
                let iridium = +(0.65 * zigguratBonus()).toFixed(3);
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating])}</div><div>${loc('gain',[bolognium,loc('resource_Bolognium_name')])}</div><div>${loc('gain',[adamantite,loc('resource_Adamantite_name')])}</div><div>${loc('gain',[iridium,loc('resource_Iridium_name')])}</div><div class="has-text-caution">${loc('galaxy_alien2_support',[$(this)[0].support(),races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ: 2,
                mil: 1,
                helium: 10,
                rating: 5
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('armed_miner','galaxy');
                    if (global.galaxy.foothold.support < global.galaxy.foothold.s_max){
                        global.galaxy.armed_miner.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        ore_processor: {
            id: 'galaxy-ore_processor',
            title: loc('galaxy_ore_processor'),
            desc(){
                return `<div>${loc('galaxy_ore_processor')}</div>`;
            },
            reqs: { conflict: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('ore_processor', offset, 3000000, 1.25, 'galaxy'); },
                Iron(offset){ return spaceCostMultiplier('ore_processor', offset, 5000000, 1.25, 'galaxy'); },
                Coal(offset){ return spaceCostMultiplier('ore_processor', offset, 3750000, 1.25, 'galaxy'); },
                Graphene(offset){ return spaceCostMultiplier('ore_processor', offset, 2250000, 1.25, 'galaxy'); }
            },
            effect(){
                return `<div>${loc('galaxy_ore_processor_effect',[10])}</div><div class="has-text-caution">${loc('galaxy_alien2_support',[$(this)[0].support(),races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('ore_processor','galaxy');
                    if (global.galaxy.foothold.support < global.galaxy.foothold.s_max){
                        global.galaxy.ore_processor.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        scavenger: {
            id: 'galaxy-scavenger',
            title: loc('galaxy_scavenger'),
            desc: loc('galaxy_scavenger_desc'),
            reqs: { conflict: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('scavenger', offset, 7500000, 1.25, 'galaxy'); },
                Alloy(offset){ return spaceCostMultiplier('scavenger', offset, 1250000, 1.25, 'galaxy'); },
                Aluminium(offset){ return spaceCostMultiplier('scavenger', offset, 6800000, 1.25, 'galaxy'); },
                Neutronium(offset){ return spaceCostMultiplier('scavenger', offset, 75000, 1.25, 'galaxy'); },
                Elerium(offset){ return spaceCostMultiplier('scavenger', offset, 750, 1.25, 'galaxy'); }
            },
            effect(){
                let pirate = piracy('gxy_alien2');
                let know = Math.round(pirate * 25000);
                let uni = +(pirate * 100 / 4).toFixed(1);
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                return `<div>${loc('galaxy_scavenger_effect',[know])}</div><div>${loc('galaxy_scavenger_effect2',[uni])}</div><div class="has-text-caution">${loc('galaxy_alien2_support',[$(this)[0].support(),races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ: 1,
                mil: 0,
                helium: 12,
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('scavenger','galaxy');
                    if (global.galaxy.foothold.support < global.galaxy.foothold.s_max){
                        global.galaxy.scavenger.on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    gxy_chthonian: {
        info: {
            name(){ return loc('galaxy_chthonian'); },
            desc(){ return loc('galaxy_chthonian_desc',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]); },
            control(){
                return {
                    name: races[global.galaxy.alien2.id].name,
                    color: 'danger',
                }; 
            },
        },
        chthonian_mission: {
            id: 'galaxy-chthonian_mission',
            title(){ return loc('galaxy_alien2_mission',[loc('galaxy_chthonian')]); },
            desc(){ return loc('galaxy_alien2_mission_desc',[loc('galaxy_chthonian')]); },
            reqs: { chthonian: 1 },
            grant: ['chthonian',2],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Structs(){
                    return {
                        galaxy: {
                            frigate_ship: { s: 'gxy_gateway', count: 5, on: 5 },
                            cruiser_ship: { s: 'gxy_gateway', count: 3, on: 3 },
                        }
                    };
                },
            },
            effect(){ return `<div>${loc('galaxy_alien2_mission_desc',[loc('galaxy_chthonian')])}</div><div class="has-text-caution">${loc('galaxy_alien2_mission_effect',[loc('galaxy_chthonian')])}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.galaxy.defense.gxy_chthonian.frigate_ship >= 5 && global.galaxy.defense.gxy_chthonian.cruiser_ship >= 3){
                        let loss = [];
                        if (global.galaxy.defense.gxy_chthonian.dreadnought >= 1){
                            if (global.galaxy.defense.gxy_chthonian.dreadnought >= 2){
                                loss.push('frigate_ship');
                                messageQueue(loc('galaxy_chthonian_mission_result'),'info');
                                messageQueue(loc('galaxy_chthonian_mission_result_c'),'success');
                            }
                            else {
                                loss.push('frigate_ship');
                                loss.push('frigate_ship');
                                messageQueue(loc('galaxy_chthonian_mission_result'),'info');
                                messageQueue(loc('galaxy_chthonian_mission_result_b'),'caution');
                            }
                        }
                        else {
                            loss.push('cruiser_ship');
                            loss.push('frigate_ship');
                            loss.push('frigate_ship');
                            loss.push('frigate_ship');
                            messageQueue(loc('galaxy_chthonian_mission_result'),'info');
                            messageQueue(loc('galaxy_chthonian_mission_result_a'),'danger');
                        }
                        for (let i=0; i<loss.length; i++){
                            let ship = loss[i];
                            global.galaxy.defense.gxy_chthonian[ship]--;
                            global.galaxy[ship].on--;
                            global.galaxy[ship].count--;
                            global.galaxy[ship].crew -= galaxyProjects.gxy_gateway[ship].ship.civ;
                            global.galaxy[ship].mil -= galaxyProjects.gxy_gateway[ship].ship.mil;
                            global.resource[global.race.species].amount -= galaxyProjects.gxy_gateway[ship].ship.civ;
                            global.civic.garrison.workers -= galaxyProjects.gxy_gateway[ship].ship.mil;
                        }
                        return true;
                    }
                    return false;
                }
                return false;
            }
        },
        minelayer: {
            id: 'galaxy-minelayer',
            title: loc('galaxy_minelayer'),
            desc(){
                return `<div>${loc('galaxy_minelayer')}</div>`;
            },
            reqs: { chthonian: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('minelayer', offset, 9000000, 1.25, 'galaxy'); },
                Iron(offset){ return spaceCostMultiplier('minelayer', offset, 4800000, 1.25, 'galaxy'); },
                Nano_Tube(offset){ return spaceCostMultiplier('minelayer', offset, 1250000, 1.25, 'galaxy'); },
                Nanoweave(offset){ return spaceCostMultiplier('minelayer', offset, 100000, 1.25, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                return `<div class="has-text-advanced">${loc('galaxy_defense_platform_effect',[$(this)[0].ship.rating])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ: 0,
                mil: 1,
                helium: 8,
                rating: 50
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('minelayer','galaxy');
                    global.galaxy.minelayer.on++;
                    return true;
                }
                return false;
            },
            postPower(){
                vBind({el: `#gxy_chthonian`},'update');
            },
            post(){
                vBind({el: `#gxy_chthonian`},'update');
            }
        },
        excavator: {
            id: 'galaxy-excavator',
            title: loc('galaxy_excavator'),
            desc(){
                return `<div>${loc('galaxy_excavator')}</div>`;
            },
            reqs: { chthonian: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('excavator', offset, 12000000, 1.25, 'galaxy'); },
                Polymer(offset){ return spaceCostMultiplier('excavator', offset, 4400000, 1.25, 'galaxy'); },
                Iridium(offset){ return spaceCostMultiplier('excavator', offset, 3600000, 1.25, 'galaxy'); },
                Mythril(offset){ return spaceCostMultiplier('excavator', offset, 180000, 1.25, 'galaxy'); },
            },
            effect(){
                let orichalcum = +(0.2 * zigguratBonus()).toFixed(3);
                return `<div>${loc('gain',[orichalcum,loc('resource_Orichalcum_name')])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(8); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('excavator','galaxy');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.galaxy.excavator.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        raider: {
            id: 'galaxy-raider',
            title: loc('galaxy_raider'),
            desc(){
                return `<div>${loc('galaxy_raider')}</div>`;
            },
            reqs: { chthonian: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('raider', offset, 12000000, 1.25, 'galaxy'); },
                Titanium(offset){ return spaceCostMultiplier('raider', offset, 1250000, 1.25, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('raider', offset, 600000, 1.25, 'galaxy'); },
                Vitreloy(offset){ return spaceCostMultiplier('raider', offset, 125000, 1.25, 'galaxy'); },
                Stanene(offset){ return spaceCostMultiplier('raider', offset, 825000, 1.25, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                let pirate = piracy('gxy_chthonian');
                let deuterium = +(pirate * zigguratBonus() * 0.65).toFixed(3);
                let vitreloy = +(pirate * zigguratBonus() * 0.05).toFixed(3);
                let polymer = +(pirate * zigguratBonus() * 2.3).toFixed(3);
                let neutronium = +(pirate * zigguratBonus() * 0.8).toFixed(3);
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating])}</div><div>${loc('galaxy_raider_effect')}</div><div>${loc('gain',[deuterium,loc('resource_Deuterium_name')])}</div><div>${loc('gain',[vitreloy,loc('resource_Vitreloy_name')])}</div><div>${loc('gain',[polymer,loc('resource_Polymer_name')])}</div><div>${loc('gain',[neutronium,loc('resource_Neutronium_name')])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ: 0,
                mil: 2,
                helium: 18,
                rating: 12
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('raider','galaxy');
                    global.galaxy.raider.on++;
                    return true;
                }
                return false;
            },
            postPower(){
                vBind({el: `#gxy_chthonian`},'update');
            },
            post(){
                vBind({el: `#gxy_chthonian`},'update');
            }
        },
    },
};

export function piracy(region,rating,raw){
    if (global.tech['piracy']){
        let armada = 0;
        let ships = ['dreadnought','cruiser_ship','frigate_ship','corvette_ship','scout_ship'];
        for (let i=0; i<ships.length; i++){
            if (!global.galaxy.defense[region].hasOwnProperty(ships[i])){
                global.galaxy.defense[region][ships[i]] = 0;
            }
            let count = global.galaxy.defense[region][ships[i]];
            armada += count * galaxyProjects.gxy_gateway[ships[i]].ship.rating;
        }
        
        let pirate = 0;
        let pillage = 0.75;
        switch(region){
            case 'gxy_stargate':
                pirate = 0.1 * global.tech.piracy;
                pillage = 0.5;
                break;
            case 'gxy_gateway':
                pirate = 0.1 * global.tech.piracy;
                pillage = 1;
                break;
            case 'gxy_gorddon':
                pirate = 800;
                break;
            case 'gxy_alien1':
                pirate = 1000;
                break;
            case 'gxy_alien2':
                pirate = 2500;
                pillage = 1;
                break;
            case 'gxy_chthonian':
                pirate = 7500;
                pillage = 1;
                break;
        }

        if (region === 'gxy_stargate' && p_on['defense_platform']){
            armada += p_on['defense_platform'] * 20;
        }

        if (region === 'gxy_gateway' && p_on['starbase']){
            armada += p_on['starbase'] * 25;
        }

        if (region === 'gxy_alien2' && p_on['foothold']){
            armada += p_on['foothold'] * 50;
            if (gal_on['armed_miner']){
                armada += gal_on['armed_miner'] * 5;
            }
        }

        if (region === 'gxy_chthonian'){
            if (gal_on['minelayer']){
                armada += gal_on['minelayer'] * 50;
            }
            if (gal_on['minelayer']){
                armada += gal_on['raider'] * 12;
            }
        }

        if (raw){
            return armada;
        }

        if (region !== 'gxy_stargate'){
            let patrol = armada > pirate ? pirate : armada;
            return ((1 - (pirate - patrol) / pirate) * pillage + (1 - pillage)) * (rating ? 1 : piracy('gxy_stargate'));
        }
        else {
            let patrol = armada > pirate ? pirate : armada;
            return (1 - (pirate - patrol) / pirate) * pillage + (1 - pillage);
        }
    }
    else {
        return 1;
    }
}

function xeno_race(){
    while (typeof global.galaxy['alien1'] === 'undefined'){
        let key = randomKey(races);
        if (key !== 'protoplasm' && key !== global.race.species && races[key].type !== 'demonic'){
            global.galaxy['alien1'] = {
                id: key
            };
        }
    }
    while (typeof global.galaxy['alien2'] === 'undefined'){
        let key = randomKey(races);
        if (key !== 'protoplasm' && key !== global.race.species && key !== global.galaxy.alien1.id && races[key].type !== 'angelic'){
            global.galaxy['alien2'] = {
                id: key
            };
        }
    }
}

export function gatewayStorage(){
    let multiplier = 1;
    if (global.race['pack_rat']){
        multiplier *= 1.05;
    }
    if (global.stats.achieve['blackhole']){
        multiplier *= 1 + global.stats.achieve.blackhole.l * 0.05;
    }
    multiplier *= global.tech['world_control'] ? 2 : 1;
    return multiplier;
}

const structDefinitions = {
    satellite: { count: 0 },
    propellant_depot: { count: 0 },
    gps: { count: 0 },
    nav_beacon: { count: 0, on: 0 },
    moon_base: { count: 0, on: 0, support: 0, s_max: 0 },
    iridium_mine: { count: 0, on: 0 },
    helium_mine: { count: 0, on: 0 },
    observatory: { count: 0, on: 0 },
    spaceport: { count: 0, on: 0, support: 0, s_max: 0 },
    red_tower: { count: 0, on: 0 },
    living_quarters: { count: 0, on: 0 },
    vr_center: { count: 0, on: 0 },
    garage: { count: 0 },
    red_mine: { count: 0, on: 0 },
    fabrication: { count: 0, on: 0 },
    red_factory: { count: 0, on: 0 },
    exotic_lab: { count: 0, on: 0 },
    ziggurat: { count: 0 },
    space_barracks: { count: 0, on: 0 },
    biodome: { count: 0, on: 0 },
    laboratory: { count: 0, on: 0 },
    geothermal: { count: 0, on: 0 },
    swarm_plant: { count: 0 },
    swarm_control: { count: 0, support: 0, s_max: 0 },
    swarm_satellite: { count: 0 },
    gas_mining: { count: 0, on: 0 },
    gas_storage: { count: 0 },
    star_dock: { count: 0, ship: 0, probe: 0, template: 'human' },
    outpost: { count: 0, on: 0 },
    drone: { count: 0 },
    oil_extractor: { count: 0, on: 0 },
    space_station: { count: 0, on: 0, support: 0, s_max: 0 },
    iridium_ship: { count: 0, on: 0 },
    elerium_ship: { count: 0, on: 0 },
    elerium_prospector: { count: 0, on: 0 },
    iron_ship: { count: 0, on: 0 },
    elerium_contain: { count: 0, on: 0 },
    e_reactor: { count: 0, on: 0 },
    world_collider: { count: 0 },
    world_controller: { count: 0, on: 0 },
    starport: { count: 0, on: 0, support: 0, s_max: 0 },
    mining_droid: { count: 0, on: 0, adam: 0, uran: 0, coal: 0, alum: 0 },
    processing: { count: 0, on: 0 },
    habitat: { count: 0, on: 0 },
    fusion: { count: 0, on: 0 },
    laboratory: { count: 0, on: 0 },
    exchange: { count: 0, on: 0 },
    warehouse: { count: 0 },
    laboratory: { count: 0, on: 0 },
    xfer_station: { count: 0, on: 0 },
    cargo_yard: { count: 0 },
    cruiser: { count: 0, on: 0 },
    dyson: { count: 0 },
    nexus: { count: 0, on: 0, support: 0, s_max: 0 },
    harvester: { count: 0, on: 0 },
    far_reach: { count: 0, on: 0 },
    stellar_engine: { count: 0, mass: 8, exotic: 0 },
    mass_ejector:{
        count: 0, on: 0, total: 0, mass: 0,
        Food: 0, Lumber: 0,
        Stone: 0, Furs: 0,
        Copper: 0, Iron: 0,
        Aluminium: 0, Cement: 0,
        Coal: 0, Oil: 0,
        Uranium: 0, Steel: 0,
        Titanium: 0, Alloy: 0,
        Polymer: 0, Iridium: 0,
        Helium_3: 0, Deuterium: 0,
        Neutronium: 0, Adamantite: 0,
        Infernite: 0, Elerium: 0,
        Nano_Tube: 0, Graphene: 0,
        Stanene: 0, Bolognium: 0,
        Vitreloy: 0, Plywood: 0,
        Brick: 0, Wrought_Iron: 0,
        Sheet_Metal: 0, Mythril: 0,
        Aerogel: 0
    },
    stargate: { count: 0 },
    gateway_station: { count: 0, on: 0 },
    s_gate: { count: 0, on: 0 },
    starbase: { count: 0, on: 0, support: 0, s_max: 0 },
    bolognium_ship: { count: 0, on: 0, crew: 0 },
    scout_ship: { count: 0, on: 0, crew: 0, mil: 0 },
    corvette_ship: { count: 0, on: 0, crew: 0, mil: 0 },
    frigate_ship: { count: 0, on: 0, crew: 0, mil: 0 },
    cruiser_ship: { count: 0, on: 0, crew: 0, mil: 0 },
    dreadnought: { count: 0, on: 0, crew: 0, mil: 0 },
    foothold: { count: 0, on: 0, support: 0, s_max: 0 },
    turret: { count: 0, on: 0 },
    carport: { count: 0, damaged: 0, repair: 0 },
    war_droid: { count: 0, on: 0 },
    repair_droid: { count: 0, on: 0 },
    war_drones: { count: 0, on: 0 },
    sensor_drone: { count: 0, on: 0 },
    attractor: { count: 0, on: 0 },
};

export function incrementStruct(struct,sector){
    if (!sector){
        sector = 'space';
    }
    if (!global[sector][struct]){
        global[sector][struct] = structDefinitions[struct];
    }
    global[sector][struct].count++;
}

export function spaceTech(){
    return spaceProjects;
}

export function interstellarTech(){
    return interstellarProjects;
}

export function galaxyTech(){
    return galaxyProjects;
}

export function checkRequirements(action_set,region,action){
    var isMet = true;
    Object.keys(action_set[region][action].reqs).forEach(function (req){
        if (!global.tech[req] || global.tech[req] < action_set[region][action].reqs[req]){
            isMet = false;
        }
    });
    if (isMet && action_set[region][action].grant && (global.tech[action_set[region][action].grant[0]] && global.tech[action_set[region][action].grant[0]] >= action_set[region][action].grant[1])){
        isMet = false;
    }
    return isMet;
}

export function renderSpace(){
    space();
    deepSpace();
    galaxySpace();
}

function space(){
    let parent = $('#space');
    clearElement(parent);
    parent.append($(`<h2 class="is-sr-only">${loc('tab_space')}</h2>`));
    if (!global.settings.showSpace){
        return false;
    }

    Object.keys(spaceProjects).forEach(function (region){
        let show = region.replace("spc_","");
        if (global.settings.space[`${show}`]){
            let name = typeof spaceProjects[region].info.name === 'string' ? spaceProjects[region].info.name : spaceProjects[region].info.name();
            let desc = typeof spaceProjects[region].info.desc === 'string' ? spaceProjects[region].info.desc : spaceProjects[region].info.desc();
            
            if (spaceProjects[region].info['support']){
                let support = spaceProjects[region].info['support'];
                if (!global.space[support].hasOwnProperty('support')){
                    global.space[support]['support'] = 0;
                    global.space[support]['s_max'] = 0;
                }
                parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3> <span v-show="s_max">{{ support }}/{{ s_max }}</span></div></div>`);
                vBind({
                    el: `#sr${region}`,
                    data: global.space[support]
                });
            }
            else {
                parent.append(`<div id="${region}" class="space"><div><h3 class="name has-text-warning">${name}</h3></div></div>`);
            }
            
            $(`#${region} h3.name`).on('mouseover',function(){
                var popper = $(`<div id="pop${region}" class="popper has-background-light has-text-dark"></div>`);
                $('#main').append(popper);
                
                popper.append($(`<div>${desc}</div>`));
                popper.show();
                poppers[region] = new Popper($(`#${region} h3.name`),popper);
            });
            $(`#${region} h3.name`).on('mouseout',function(){
                $(`#pop${region}`).hide();
                if (poppers[region]){
                    poppers[region].destroy();
                }
                clearElement($(`#pop${region}`),true);
            });

            Object.keys(spaceProjects[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(spaceProjects,region,tech)){
                    let c_action = spaceProjects[region][tech];
                    setAction(c_action,'space',tech);
                }
            });
        }
    });
}

function deepSpace(){
    let parent = $('#interstellar');
    clearElement(parent);
    parent.append($(`<h2 class="is-sr-only">${loc('tab_interstellar')}</h2>`));
    if (!global.settings.showDeep){
        return false;
    }

    Object.keys(interstellarProjects).forEach(function (region){
        let show = region.replace("int_","");
        if (global.settings.space[`${show}`]){
            let name = typeof interstellarProjects[region].info.name === 'string' ? interstellarProjects[region].info.name : interstellarProjects[region].info.name();
            
            if (interstellarProjects[region].info['support']){
                let support = interstellarProjects[region].info['support'];
                if (!global.interstellar[support].hasOwnProperty('support')){
                    global.interstellar[support]['support'] = 0;
                    global.interstellar[support]['s_max'] = 0;
                }
                parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3> <span v-show="s_max">{{ support }}/{{ s_max }}</span></div></div>`);
                vBind({
                    el: `#sr${region}`,
                    data: global.interstellar[support]
                });
            }
            else {
                parent.append(`<div id="${region}" class="space"><div><h3 class="name has-text-warning">${name}</h3></div></div>`);
            }
            
            $(`#${region} h3.name`).on('mouseover',function(){
                var popper = $(`<div id="pop${region}" class="popper has-background-light has-text-dark"></div>`);
                $('#main').append(popper);
                
                let desc = typeof interstellarProjects[region].info.desc === 'string' ? interstellarProjects[region].info.desc : interstellarProjects[region].info.desc();
                popper.append($(`<div>${desc}</div>`));
                popper.show();
                poppers[region] = new Popper($(`#${region} h3.name`),popper);
            });
            $(`#${region} h3.name`).on('mouseout',function(){
                $(`#pop${region}`).hide();
                if (poppers[region]){
                    poppers[region].destroy();
                }
                clearElement($(`#pop${region}`),true);
            });

            Object.keys(interstellarProjects[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(interstellarProjects,region,tech)){
                    let c_action = interstellarProjects[region][tech];
                    setAction(c_action,'interstellar',tech);
                }
            });
        }
    });
}

function galaxySpace(){
    let parent = $('#galaxy');
    clearElement(parent);
    parent.append($(`<h2 class="is-sr-only">${loc('tab_galactic')}</h2>`));
    if (!global.settings.showGalactic){
        return false;
    }

    armada(parent,'fleet');   

    Object.keys(galaxyProjects).forEach(function (region){
        let show = region.replace("gxy_","");
        if (global.galaxy['defense'] && !global.galaxy.defense.hasOwnProperty(region)){
            global.galaxy.defense[region] = {};
        }
        if (global.settings.space[`${show}`]){
            let name = typeof galaxyProjects[region].info.name === 'string' ? galaxyProjects[region].info.name : galaxyProjects[region].info.name();
            
            let regionContent = $(`<div id="${region}" class="space"></div>`);
            parent.append(regionContent);
            let regionHeader = $(`<h3 class="name has-text-warning">${name}</h3>`);
            regionContent.append(regionHeader);

            if (global.tech['xeno'] && global.tech['xeno'] >= 3){
                regionContent.append(`<b-tooltip class="has-text-warning" :label="owner()" position="is-bottom" size="is-small" multilined animated><span class="regionControl has-text-${galaxyProjects[region].info.control().color}">{{ r.control().name }}</span></b-tooltip>`);
            }

            let vData = {
                el: `#${region}`,
                data: {
                    r: galaxyProjects[region].info
                },
                methods: {
                    owner(){
                        return loc('galaxy_control',[galaxyProjects[region].info.control().name,name]);
                    },
                    threat(r){
                        if (global.galaxy.defense[r].scout_ship >= 2){
                            let pirates = Math.round((1 - piracy(r,true)) * 100);
                            if (pirates === 0){
                                return "has-text-success";
                            }
                            else if (pirates <= 20){
                                return "has-text-advanced";
                            }
                            else if (pirates <= 40){
                                return "has-text-info";
                            }
                            else if (pirates <= 60){
                                return "has-text-warning";
                            }
                            else if (pirates <= 80){
                                return "has-text-caution";
                            }
                            else {
                                return "has-text-danger";
                            }
                        }
                        return "has-text-danger";
                    }
                },
                filters: {
                    pirate(r){
                        if (global.galaxy.defense[r].scout_ship >= 2){
                            let pirates = Math.round((1 - piracy(r,true)) * 100);
                            if (global.galaxy.defense[r].scout_ship >= 4){
                                return `${pirates}%`;
                            }
                            else {
                                if (pirates === 0){
                                    return loc('galaxy_piracy_none');
                                }
                                else if (pirates <= 20){
                                    return loc('galaxy_piracy_vlow');
                                }
                                else if (pirates <= 40){
                                    return loc('galaxy_piracy_low');
                                }
                                else if (pirates <= 60){
                                    return loc('galaxy_piracy_avg');
                                }
                                else if (pirates <= 80){
                                    return loc('galaxy_piracy_high');
                                }
                                else {
                                    return loc('galaxy_piracy_vhigh');
                                }
                            }
                        }
                        return '???';
                    },
                    defense(r){
                        return piracy(r,true,true);
                    }
                }
            };

            if (galaxyProjects[region].info['support']){
                let support = galaxyProjects[region].info['support'];
                if (global.galaxy[support]){
                    if (!global.galaxy[support].hasOwnProperty('support')){
                        global.galaxy[support]['support'] = 0;
                        global.galaxy[support]['s_max'] = 0;
                    }
                    regionContent.append(`<span class="regionSupport" v-show="s.s_max">{{ s.support }}/{{ s.s_max }}</span>`);
                    vData.data['s'] = global.galaxy[support];
                }
            }

            if (global.tech['piracy']){
                regionContent.append(`<div><span class="has-text-caution pirate">${loc('galaxy_piracy_threat',[races[global.galaxy.alien2.id].name])}</span><span :class="threat('${region}')">{{ '${region}' | pirate }}</span><span class="sep">|</span><span class="has-text-warning">${loc('galaxy_armada')}</span>: <span class="has-text-success">{{ '${region}' | defense }}</span></div>`);
            }

            vBind(vData);
            
            $(`#${region} h3.name`).on('mouseover',function(){
                var popper = $(`<div id="pop${region}" class="popper has-background-light has-text-dark"></div>`);
                $('#main').append(popper);
                
                let desc = typeof galaxyProjects[region].info.desc === 'string' ? galaxyProjects[region].info.desc : galaxyProjects[region].info.desc();
                popper.append($(`<div>${desc}</div>`));
                popper.show();
                poppers[region] = new Popper($(`#${region} h3.name`),popper);
            });
            $(`#${region} h3.name`).on('mouseout',function(){
                $(`#pop${region}`).hide();
                if (poppers[region]){
                    poppers[region].destroy();
                }
                clearElement($(`#pop${region}`),true);
            });

            Object.keys(galaxyProjects[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(galaxyProjects,region,tech)){
                    let c_action = galaxyProjects[region][tech];
                    setAction(c_action,'galaxy',tech);
                }
            });
        }
    });
}

function armada(parent,id){
    if (global.tech['piracy']){

        let header = $(`<div id="h${id}" class="armHead"><h3 class="has-text-warning">${loc('galaxy_armada')}</h3></div>`);
        parent.append(header);

        let soldier_title = global.tech['world_control'] ? loc('civics_garrison_peacekeepers') : loc('civics_garrison_soldiers');
        header.append($(`<span>|</span>`));
        header.append($(`<span class="has-text-caution"><b-tooltip :label="soldierDesc()" position="is-bottom" multilined animated><span>${soldier_title}</span></b-tooltip> <span>{{ g.workers | stationed }} / {{ g.max | s_max }}</span></span>`));
        header.append($(`<span>|</span>`));
        header.append($(`<span class="has-text-caution"><b-tooltip :label="crewMil()" position="is-bottom" multilined animated><span>${loc('job_crew_mil')}</span></b-tooltip> <span>{{ g.crew }}</span></span>`));
        header.append($(`<span>|</span>`));
        header.append($(`<span class="has-text-success"><b-tooltip :label="crewCiv()" position="is-bottom" multilined animated><span>${loc('job_crew_civ')}</span></b-tooltip> <span>{{ c.workers }} / {{ c.max }}</span></span>`));

        vBind({
            el: `#h${id}`,
            data: {
                g: global.civic.garrison,
                c: global.civic.crew,
            },
            methods: {
                soldierDesc(){
                    return describeSoldier();
                },
                crewMil(){
                    return loc('civics_garrison_crew_desc');
                },
                crewCiv(){
                    return loc('job_crew_desc');
                }
            },
            filters: {
                stationed(v){
                    return garrisonSize();
                },
                s_max(v){
                    return garrisonSize(true);
                }
            }
        });

        let fleet = $(`<div id="${id}" class="fleet"></div>`);
        parent.append(fleet);

        let ships = ['scout_ship','corvette_ship','frigate_ship','cruiser_ship','dreadnought'];

        let cols = [];
        for (let i=0; i<6; i++){
            let col = $(`<div class="area"></div>`);
            cols.push(col);
            fleet.append(col);
        }

        for (let i=0; i<ships.length; i++){
            if (global.galaxy.hasOwnProperty(ships[i])){
                let ship = $(`<span id="armada${ships[i]}" class="ship has-text-advanced">${galaxyProjects.gxy_gateway[ships[i]].title}</span>`);
                cols[i+1].append(ship);
            }
        }

        cols[0].append($(`<span></span>`));
        cols[0].append($(`<span id="armadagateway" class="has-text-danger">${galaxyProjects.gxy_gateway.info.name}</span>`));

        for (let i=0; i<ships.length; i++){
            if (global.galaxy.hasOwnProperty(ships[i])){
                let ship = $(`<span class="ship">{{ gateway.${ships[i]} }}</span>`);
                cols[i+1].append(ship);
            }
        }

        Object.keys(global.galaxy.defense).forEach(function (area){
            let r = area.substring(4);
            if (global.settings.space[r] && r !== 'gateway'){

                let region = $(`<span id="armada${r}" class="has-text-caution">${typeof galaxyProjects[area].info.name === 'string' ? galaxyProjects[area].info.name : galaxyProjects[area].info.name()}</span>`);
                cols[0].append(region);

                for (let i=0; i<ships.length; i++){
                    if (global.galaxy.hasOwnProperty(ships[i])){
                        let ship = $(`<span class="ship"></span>`);
                        let sub = $(`<span role="button" aria-label="remove ${ships[i]}" class="sub has-text-danger" @click="sub('${area}','${ships[i]}')"><span>&laquo;</span></span>`);
                        let count = $(`<span class="current">{{ ${r}.${ships[i]} }}</span>`);
                        let add = $(`<span role="button" aria-label="add ${ships[i]}" class="add has-text-success" @click="add('${area}','${ships[i]}')"><span>&raquo;</span></span>`);
                        cols[i+1].append(ship);
                        ship.append(sub);
                        ship.append(count);
                        ship.append(add);
                    }
                }

            }
        });

        vBind({
            el: `#${id}`,
            data: {
                stargate: global.galaxy.defense.gxy_stargate,
                gateway: global.galaxy.defense.gxy_gateway,
                gorddon: global.galaxy.defense.gxy_gorddon,
                alien1: global.galaxy.defense.gxy_alien1,
                alien2: global.galaxy.defense.gxy_alien2,
                chthonian: global.galaxy.defense.gxy_chthonian,
                t: global.tech
            },
            methods: {
                sub(area,ship){
                    if (global.galaxy.defense[area][ship] > 0){
                        let ship_change = keyMultiplier();
                        if (ship_change > global.galaxy.defense[area][ship]) {
                            ship_change = global.galaxy.defense[area][ship];
                        }
                        global.galaxy.defense.gxy_gateway[ship] += ship_change;
                        global.galaxy.defense[area][ship] -= ship_change;
                    }
                },
                add(area,ship){
                    if (global.galaxy.defense.gxy_gateway[ship] > 0){
                        let ship_change = keyMultiplier();
                        if (ship_change > global.galaxy.defense.gxy_gateway[ship]) {
                            ship_change = global.galaxy.defense.gxy_gateway[ship];
                        }
                        global.galaxy.defense.gxy_gateway[ship] -= ship_change;
                        global.galaxy.defense[area][ship] += ship_change;
                    }
                }
            }
        });

        Object.keys(global.galaxy.defense).forEach(function (area){
            let r = area.substring(4);
            if (global.settings.space[r]){
                $('#armada'+r).on('mouseover',function(){
                    var popper = $(`<div id="pop${r}" class="popper has-background-light has-text-dark pop-desc"></div>`);
                    popper.append(`<div>${typeof galaxyProjects[area].info.desc === 'string' ? galaxyProjects[area].info.desc : galaxyProjects[area].info.desc()}</div>`);
                    $('#main').append(popper);
                    popper.show();
                    poppers[r] = new Popper($('#armada'+r),popper);
                });
                $('#armada'+r).on('mouseout',function(){
                    $(`#pop${r}`).hide();
                    if (poppers[r]){
                        poppers[r].destroy();
                    }
                    clearElement($(`#pop${r}`),true);
                });
            }
        });

        for (let i=0; i<ships.length; i++){
            if (global.galaxy.hasOwnProperty(ships[i])){
                $('#armada'+ships[i]).on('mouseover',function(){
                    var popper = $(`<div id="pop${ships[i]}" class="popper has-background-light has-text-dark pop-desc"></div>`);
                    actionDesc(popper,galaxyProjects.gxy_gateway[ships[i]],global.galaxy[ships[i]]);
                    $('#main').append(popper);
                    popper.show();
                    poppers[ships[i]] = new Popper($('#armada'+ships[i]),popper);
                });
                $('#armada'+ships[i]).on('mouseout',function(){
                    $(`#pop${ships[i]}`).hide();
                    if (poppers[ships[i]]){
                        poppers[ships[i]].destroy();
                    }
                    clearElement($(`#pop${ships[i]}`),true);
                });
            }
        }
    }
}

function house_adjust(res){
    if (global.tech['space_housing']){
        res *= 0.8 ** global.tech['space_housing'];
    }
    return res;
}

export function iron_adjust(res){
    if (global.tech['solar'] && global.tech['solar'] >= 5 && belt_on['iron_ship']){
        res *= 0.95 ** belt_on['iron_ship'];
    }
    return res;
}

export function swarm_adjust(res){
    if (global.space['swarm_plant']){
        let reduce = global.tech['swarm'] ? 0.88 : 0.94;
        if (global.tech['swarm'] >= 3){
            reduce -= quantum_level / 100;
        }
        if (reduce < 0.05){
            reduce = 0.05;
        }
        res *= reduce ** global.space.swarm_plant.count;
    }
    return res;
}

export function fuel_adjust(fuel){
    if (global.race.universe === 'heavy'){
        let de = global.race.Dark.count;
        if (global.race.Harmony.count > 0){
            de *= 1 + (global.race.Harmony.count * 0.01);
        }
        fuel *= 1.25 + (0.5 * 0.995 ** de);
    }
    if (global.city['mass_driver'] && p_on['mass_driver']){
        fuel *= 0.95 ** p_on['mass_driver'];
    }
    if (global.stats.achieve['heavyweight']){
        fuel *= 0.96 ** global.stats.achieve['heavyweight'].l;
    }
    return fuel;
}

export function int_fuel_adjust(fuel){
    if (global.race.universe === 'heavy'){
        let de = global.race.Dark.count;
        if (global.race.Harmony.count > 0){
            de *= 1 + (global.race.Harmony.count * 0.01);
        }
        fuel *= 1.2 + (0.3 * 0.995 ** de);
    }
    if (global.stats.achieve['heavyweight']){
        fuel *= 0.96 ** global.stats.achieve['heavyweight'].l;
    }
    return fuel;
}

export function zigguratBonus(){
    let bonus = 1;
    if (global.space['ziggurat'] && global.space['ziggurat'].count > 0){
        let zig = global.tech['ancient_study'] ? 0.006 : 0.004;
        if (global.tech['ancient_deify'] && global.tech['ancient_deify'] >= 2){
            zig += 0.0001 * red_on['exotic_lab'];
        }
        bonus += (global.space.ziggurat.count * global.civic.colonist.workers * zig);
    }
    return bonus;
}

export const universe_types = {
    standard: {
        name: loc('universe_standard'),
        desc: loc('universe_standard_desc'),
        effect: loc('universe_standard_effect')
    },
    heavy: {
        name: loc('universe_heavy'),
        desc: loc('universe_heavy_desc'),
        effect: loc('universe_heavy_effect',[5])
    },
    antimatter: {
        name: loc('universe_antimatter'),
        desc: loc('universe_antimatter_desc'),
        effect: loc('universe_antimatter_effect')
    },
    evil: {
        name: loc('universe_evil'),
        desc: loc('universe_evil_desc'),
        effect: loc('universe_evil_effect')
    },
    micro: {
        name: loc('universe_micro'),
        desc: loc('universe_micro_desc'),
        effect: loc('universe_micro_effect',[75])
    }
};

export function setUniverse(){
    let universes = ['standard','heavy','antimatter','evil','micro'];

    for (let i=0; i<universes.length; i++){
        let universe = universes[i];

        let id = `uni-${universe}`;

        let parent = $(`<div id="${id}" class="action"></div>`);
        let element = $(`<a class="button is-dark" v-on:click="action"><span class="aTitle">${universe_types[universe].name}</span></a>`);
        parent.append(element);

        $('#evolution').append(parent);

        $('#'+id).on('click',function(){
            global.race['universe'] = universe;
            clearElement($('#evolution'));

            if (global.race.probes === 0){
                setPlanet();
            }
            else {
                let hell = false;
                for (let i=0; i<global.race.probes; i++){
                    if (setPlanet(hell) === 'hellscape'){
                        hell = true;
                    }
                }
            }

            $(`#pop${id}`).hide();
            if (poppers[id]){
                poppers[id].destroy();
            }
            clearElement($(`#pop${id}`),true);
        });

        $('#'+id).on('mouseover',function(){
                var popper = $(`<div id="pop${id}" class="popper has-background-light has-text-dark"></div>`);
                $('#main').append(popper);
                
                popper.append($(`<div>${universe_types[universe].name}</div>`));
                popper.append($(`<div>${universe_types[universe].desc}</div>`));
                popper.append($(`<div>${universe_types[universe].effect}</div>`));

                popper.show();
                poppers[id] = new Popper($('#'+id),popper);
            });
            
        $('#'+id).on('mouseout',function(){
                $(`#pop${id}`).hide();
                if (poppers[id]){
                    poppers[id].destroy();
                }
                clearElement($(`#pop${id}`),true);
            });
    }
}

function ascendLab(){
    if (webWorker.w){
        webWorker.w.terminate();
    }
    unlockAchieve(`biome_${global.city.biome}`);
    unlockAchieve(`ascended`);
    if (global.race.species === 'junker'){
        unlockFeat('the_misery');
    }
    if (!global.race['modified'] && global.race['junker'] && global.race.species === 'junker'){
        unlockFeat(`garbage_pie`);
    }
    if (global.race['emfield']){
        unlockAchieve(`technophobe`);
    }
    global.race['noexport'] = 1;
    clearElement($(`#city`));
    global.settings.showCivic = false;
    global.settings.showResearch = false;
    global.settings.showResources = false;
    global.settings.showGenetics = false;
    global.settings.showSpace = false;
    global.settings.showDeep = false;
    global.settings.showGalactic = false;
    global.settings.showPortal = false;
    global.settings.spaceTabs = 0;

    let lab = $(`<div id="celestialLab" class="celestialLab"></div>`);
    $(`#city`).append(lab);

    lab.append(`<div><h3 class="has-text-danger">${loc('genelab_title')}</h3> - <span class="has-text-warning">${loc('genelab_genes')} {{ genes }}</span></div>`);
    
    let name = $(`<div class="fields"><div class="name">${loc('genelab_name')} <b-input v-model="name" maxlength="20"></b-input></div><div class="entity">${loc('genelab_entity')} <b-input v-model="entity" maxlength="40"></b-input></div><div class="name">${loc('genelab_home')} <b-input v-model="home" maxlength="20"></b-input></div> <div>${loc('genelab_desc')} <b-input v-model="desc" maxlength="255"></b-input></div></div>`);
    lab.append(name);

    let planets = $(`<div class="fields">
        <div class="name">${loc('genelab_red')} <b-input v-model="red" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_hell')} <b-input v-model="hell" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_gas')} <b-input v-model="gas" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_gas_moon')} <b-input v-model="gas_moon" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_dwarf')} <b-input v-model="dwarf" maxlength="20"></b-input></div></div>`);
    lab.append(planets);

    let genes = $(`<div class="sequence"></div>`);
    lab.append(genes);

    let dGenus = false;
    let genus = `<div class="genus_selection"><div class="has-text-caution">${loc('genelab_genus')}</div><template><section>`;
    Object.keys(genus_traits).forEach(function (type){
        if (global.stats.achieve[`genus_${type}`] && global.stats.achieve[`genus_${type}`].l > 0){
            if (!dGenus){ dGenus = type; }
            genus = genus + `<div class="field"><b-tooltip :label="genusDesc('${type}')" position="is-bottom" multilined animated><b-radio v-model="genus" native-value="${type}">${loc(`genelab_genus_${type}`)}</b-radio></b-tooltip></div>`;
        }
    });
    genus = genus + `</section></template></div>`;
    genes.append($(genus));

    let trait_list = `<div class="trait_selection"><div class="has-text-warning">${loc('genelab_traits')}</div><template><section>`;
    let negative = '';
    let unlockedTraits = {};
    Object.keys(races).forEach(function (race){
        let type = races[race].type;
        if (
            (global.stats.achieve[`extinct_${race}`] && global.stats.achieve[`extinct_${race}`].l > 0)
                ||
            (global.stats.achieve[`genus_${type}`] && global.stats.achieve[`genus_${type}`].l > 0)
            ){
            if (races[race].hasOwnProperty('traits')){
                Object.keys(races[race].traits).forEach(function (trait){
                    unlockedTraits[trait] = true;
                });
            }
        }
    });

    Object.keys(unlockedTraits).sort().forEach(function (trait){
        if (traits.hasOwnProperty(trait) && traits[trait].type === 'major'){
            if (traits[trait].val >= 0){
                trait_list = trait_list + `<div class="field"><b-tooltip :label="trait('${trait}')" position="is-bottom" size="is-small" multilined animated><b-checkbox :input="geneEdit()" v-model="traitlist" native-value="${trait}"><span class="has-text-success">${loc(`trait_${trait}_name`)}</span> (<span class="has-text-advanced">${traits[trait].val}</span>)</b-checkbox></b-tooltip></div>`;
            }
            else {
                negative = negative + `<div class="field"><b-tooltip :label="trait('${trait}')" position="is-bottom" size="is-small" multilined animated><b-checkbox :input="geneEdit()" v-model="traitlist" native-value="${trait}"><span class="has-text-danger">${loc(`trait_${trait}_name`)}</span> (<span class="has-text-caution">${traits[trait].val}</span>)</b-checkbox></b-tooltip></div>`;
            }
        }
    });
    trait_list = trait_list + negative + `</section></template></div>`;
    genes.append($(trait_list));

    lab.append($(`<hr><div class="create"><button class="button" @click="setRace()">${loc('genelab_create')}</button></div>`));

    var genome = global.hasOwnProperty('custom') ? {
        name: global.custom.race0.name,
        desc: global.custom.race0.desc,
        entity: global.custom.race0.entity,
        home: global.custom.race0.home,
        red: global.custom.race0.red,
        hell: global.custom.race0.hell,
        gas: global.custom.race0.gas,
        gas_moon: global.custom.race0.gas_moon,
        dwarf: global.custom.race0.dwarf,
        genes: 0,
        genus: global.custom.race0.genus,
        traitlist: global.custom.race0.traits
    } : {
        name: 'Zombie',
        desc: `Zombies aren't so much a species as they are the shambling remains of a race who succumbed to a nightmarish virus. Yet somehow they continue to drone on.`,
        entity: 'rotting bipedal creatures',
        home: 'Grave',
        red: 'Brains',
        hell: 'Rigor Mortis',
        gas: 'Decompose',
        gas_moon: 'Bones',
        dwarf: 'Double Tap',
        genes: 10,
        genus: dGenus,
        traitlist: []
    };

    genome.genes = calcGenomeScore(genome);

    vBind({
        el: '#celestialLab',
        data: genome,
        methods: {
            genusDesc(g){
                let desc = '';
                Object.keys(genus_traits[g]).forEach(function (t){
                    if (traits[t]){
                        desc = desc + `${traits[t].desc} `;
                    }
                });                
                return desc;
            },
            trait(t){
                return traits[t].desc;
            },
            geneEdit(){
                genome.genes = calcGenomeScore(genome);
            },
            setRace(){
                if (calcGenomeScore(genome) >= 0 && genome.name.length > 0 && genome.desc.length > 0 && genome.entity.length > 0 && genome.home.length > 0
                    && genome.red.length > 0 && genome.hell.length > 0 && genome.gas.length > 0 && genome.gas_moon.length > 0 && genome.dwarf.length > 0){
                    global['custom'] = {
                        race0: {
                            name: genome.name,
                            desc: genome.desc,
                            entity: genome.entity,
                            home: genome.home,
                            red: genome.red,
                            hell: genome.hell,
                            gas: genome.gas,
                            gas_moon: genome.gas_moon,
                            dwarf: genome.dwarf,
                            genus: genome.genus,
                            traits: genome.traitlist
                        }
                    }
                    ascend();
                }
            }
        }
    });
}

function calcGenomeScore(genome){
    let genes = 0;

    if (global.stats.achieve[`ascended`]){
        let types = ['l','a','h','e','m'];
        for (let i=0; i<types.length; i++){
            if (global.stats.achieve.ascended.hasOwnProperty(types[i])){
                genes += global.stats.achieve.ascended[types[i]];
            }
        }
    }

    Object.keys(genus_traits[genome.genus]).forEach(function (t){
        genes -= traits[t].val;
    });
    for (let i=0; i<genome.traitlist.length; i++){
        genes -= traits[genome.traitlist[i]].val;
    }
    return genes;
}

function ascend(){
    global.lastMsg = false;

    let god = global.race.species;
    let old_god = global.race.gods;
    let genus = races[god].type;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let plasmid = global.race.Plasmid.count;
    let antiplasmid = global.race.Plasmid.anti;
    let phage = global.race.Phage.count;
    let harmony = global.race.Harmony.count;

    let gains = calcPrestige('ascend');
    let new_plasmid = gains.plasmid;
    let new_phage = gains.phage;
    let new_harmony = gains.harmony;

    phage += new_phage;
    harmony += new_harmony;

    global.stats.reset++;
    global.stats.ascend++;
    global.stats.tdays += global.stats.days;
    global.stats.days = 0;
    global.stats.tknow += global.stats.know;
    global.stats.know = 0;
    global.stats.tstarved += global.stats.starved;
    global.stats.starved = 0;
    global.stats.tdied += global.stats.died;
    global.stats.died = 0;
    if (global.race.universe === 'antimatter'){
        antiplasmid += new_plasmid;
        global.stats.antiplasmid += new_plasmid;
    }
    else {
        plasmid += new_plasmid;
        global.stats.plasmid += new_plasmid;
    }
    global.stats.phage += new_phage;
    global.stats.harmony += new_harmony;

    if (atmo !== 'none'){
        unlockAchieve(`atmo_${atmo}`);
    }
    unlockAchieve(`genus_${genus}`);

    if (typeof global.tech['world_control'] === 'undefined'){
        unlockAchieve(`cult_of_personality`);
    }

    let good_rocks = 0;
    Object.keys(global.city.geology).forEach(function (g){
        if (global.city.geology[g] > 0){
            good_rocks++;
        }
    });
    if (good_rocks >= 4) {
        unlockAchieve('miners_dream');
    }

    if (global.galaxy.hasOwnProperty('dreadnought') && global.galaxy.dreadnought.count === 0){
        unlockAchieve(`dreaded`);
    }

    checkAchievements();

    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        Plasmid: { count: plasmid, anti: antiplasmid },
        Phage: { count: phage },
        Dark: { count: global.race.Dark.count },
        Harmony: { count: harmony },
        universe: global.race.universe,
        seeded: true,
        probes: 4,
        seed: Math.floor(Math.seededRandom(10000)),
    };
    global.city = {
        calendar: {
            day: 0,
            year: 0,
            weather: 2,
            temp: 1,
            moon: 0,
            wind: 0,
            orbit: orbit
        },
        biome: biome,
        ptrait: atmo
    };
    global.tech = { theology: 1 };
    clearStates();
    global.new = true;
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}
