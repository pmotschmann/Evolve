import { global, poppers, sizeApproximation, p_on, belt_on, int_on, quantum_level } from './vars.js';
import { powerModifier, challenge_multiplier, spaceCostMultiplier, vBind, messageQueue } from './functions.js';
import { unlockAchieve } from './achieve.js';
import { races } from './races.js';
import { spatialReasoning, defineResources } from './resources.js';
import { loadFoundry } from './jobs.js';
import { defineIndustry } from './civics.js';
import { payCosts, setAction, setPlanet, storageMultipler, drawTech, bank_vault } from './actions.js';
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
                    messageQueue(loc('space_home_test_launch_action'),'success');
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
                if (global.space['gps'].count < 4){
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
                if (global.space['gps'].count < 4){
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
            powered(){ return 2; },
            effect(){
                let effect3 = global.tech['luna'] >=3 ? `<div>${loc('space_red_tower_effect1',[races[global.race.species].solar.red])}</div>` : '';
                return `<div>${loc('space_home_nav_beacon_effect1')}</div>${effect3}<div>${loc('space_home_nav_beacon_effect2')}</div>`;
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
                    messageQueue(loc('space_moon_mission_action'),'success');
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
                return `<div>${loc('space_moon_base_effect1')}</div><div>${loc('plus_max_resource',[iridium,loc('resource_Iridium_name')])}</div><div>${loc('space_moon_base_effect3',[oil,$(this)[0].powered()])}</div>`;
            },
            support: 2,
            powered(){ return 4; },
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
                return `<div>${loc('space_used_support',[loc('space_moon_info_name')])}</div><div>${loc('space_moon_iridium_mine_effect',[iridium])}</div>`;
            },
            support: -1,
            powered(){ return 1; },
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
                return `<div>${loc('space_used_support',[loc('space_moon_info_name')])}</div><div>${loc('space_moon_helium_mine_effect',[helium])}</div><div>${loc('plus_max_resource',[storage,loc('resource_Helium_3_name')])}</div>`;
            },
            support: -1,
            powered(){ return 1; },
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
                return `<div>${loc('space_used_support',[loc('space_moon_info_name')])}</div><div>${loc('plus_max_resource',[5000,loc('resource_Knowledge_name')])}</div><div>${loc('space_moon_observatory_effect',[5])}</div>`;
            },
            support: -1,
            powered(){ return 1; },
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
                    messageQueue(loc('space_red_mission_action',[races[global.race.species].solar.red]),'success');
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
                return `<div>${loc('space_red_spaceport_effect1',[races[global.race.species].solar.red])}</div><div>${loc('space_red_spaceport_effect2',[helium,$(this)[0].powered()])}</div><div>${loc('space_red_spaceport_effect3',[global.resource.Food.name])}</div>`;
            },
            support: 3,
            powered(){ return 5; },
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
                return `<div>${loc('space_red_tower_effect1',[races[global.race.species].solar.red])}</div><div>${loc('space_red_tower_effect2')}</div>`;
            },
            powered(){ return 2; },
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
                return `<div>${loc('space_used_support',[races[global.race.species].solar.red])}</div><div>${loc('plus_max_resource',[1,loc('colonist')])}</div><div>${loc('plus_max_resource',[1,loc('citizen')])}</div>`;
            },
            support: -1,
            powered(){ return 1; },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('living_quarters');
                    global.civic.colonist.display = true;
                    if (global.space.spaceport.support < global.space.spaceport.s_max){
                        global.space['living_quarters'].on++;
                        global.resource[global.race.species].max += 1;
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
                return `<div>${loc('space_used_support',[races[global.race.species].solar.red])}</div><div>${loc('space_red_vr_center_effect1',[1])}</div><div>${loc('space_red_vr_center_effect2',[2])}</div>`;
            },
            support: -1,
            powered(){ return 1; },
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
                return `<div>${loc('space_used_support',[races[global.race.species].solar.red])}</div><div>${loc('space_red_mine_effect',[copper,global.resource.Copper.name])}</div><div>${loc('space_red_mine_effect',[titanium,global.resource.Titanium.name])}</div>`;
            },
            support: -1,
            powered(){ return 1; },
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
                return `<div>${loc('space_used_support',[races[global.race.species].solar.red])}</div><div>${loc('space_red_fabrication_effect1')}</div><div>${loc('space_red_fabrication_effect2')}</div>`;
            },
            support: -1,
            powered(){ return 1; },
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
                desc = desc + `<div>${loc('space_red_factory_effect3',[helium])}</div>`;
                return desc;
            },
            powered(){ return 3; },
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
                let food = +(2 * zigguratBonus()).toFixed(2);
                return `<div>${loc('space_used_support',[races[global.race.species].solar.red])}</div><div>${loc('space_red_biodome_effect',[food,global.resource.Food.name])}</div>`;
            },
            support: -1,
            powered(){ return 1; },
            refresh: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('biodome');
                    unlockAchieve('colonist');
                    if (global.race['joyless']){
                        unlockAchieve('joyless');
                        delete global.race['joyless'];
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
                let elerium = spatialReasoning(10);
                return `<div>${loc('space_used_support',[races[global.race.species].solar.red])}</div><div>${loc('space_red_exotic_lab_effect1',[sci])}</div><div>${loc('plus_max_resource',[elerium,loc('resource_Elerium_name')])}</div>`;
            },
            support: -1,
            powered(){ return 1; },
            refresh: true,
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
                return `<div>${loc('space_red_ziggurat_desc',[races[global.race.old_gods.toLowerCase()].entity])}</div>`;
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
                return `<div>${loc('space_red_ziggurat_effect',[bonus])}</div></div>`;
            },
            refresh: true,
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
                return `<div>${loc('plus_max_soldiers',[2])}</div><div>${loc('space_red_space_barracks_effect2',[oil])}</div><div>${loc('space_red_space_barracks_effect3',[global.resource.Food.name])}</div>`;
            },
            powered(){ return 1; },
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
                    messageQueue(loc('space_hell_mission_action',[races[global.race.species].solar.hell]),'success');
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
                return loc('space_hell_geothermal_effect1',[helium,-($(this)[0].powered())]);
            },
            powered(){ return powerModifier(global.race['forge'] ? -9 : -8); },
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
            support: 6,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('swarm_control');
                    global.space['swarm_control'].s_max += global.tech['swarm'] && global.tech['swarm'] >= 2 ? 6 : 4;
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
                let solar = global.tech.swarm >= 4 ? (global.tech.swarm >= 5 ? 0.65 : 0.5) : 0.35;
                return loc('space_sun_swarm_satellite_effect1',[powerModifier(solar)]);
            },
            support: -1,
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
                    messageQueue(loc('space_gas_mission_action',[races[global.race.species].solar.gas]),'success');
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
                return `<div>${loc('space_gas_mining_effect1',[helium])}</div><div>${loc('space_gas_mining_effect2',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return 2; },
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
                Money(){ return global.space.star_dock.count === 0 ? 1500000 : 0; },
                Steel(){ return global.space.star_dock.count === 0 ? 500000 : 0; },
                Helium_3(){ return global.space.star_dock.count === 0 ? Math.round(fuel_adjust(10000)) : 0; },
                Nano_Tube(){ return global.space.star_dock.count === 0 ? 250000 : 0; },
                Mythril(){ return global.space.star_dock.count === 0 ? 10000 : 0; },
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
                    messageQueue(loc('space_gas_moon_mission_action',[races[global.race.species].solar.gas_moon]),'success');
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
                return `<div>${loc('space_gas_moon_outpost_effect1',[neutronium])}</div><div>${loc('plus_max_resource',[max,loc('resource_Neutronium_name')])}</div><div>${loc('space_gas_moon_outpost_effect3',[oil,$(this)[0].powered()])}</div>`;
            },
            powered(){ return 3; },
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
                return loc('space_gas_moon_oil_extractor_effect1',[oil, $(this)[0].powered()]);
            },
            powered(){ return 1; },
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
                    messageQueue(loc('space_belt_mission_action'),'success');
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
                return `<div>${loc('plus_max_space_miners',[3])}</div>${elerium}<div>${loc('space_belt_station_effect3',[helium])}</div><div>${loc('space_belt_station_effect4',[food,$(this)[0].powered(),global.resource.Food.name])}</div>`;
            },
            support: 3,
            powered(){ return 3; },
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
                return `<div>${loc('space_belt_elerium_ship_effect1')}</div><div>${loc('space_belt_elerium_ship_effect2',[elerium])}</div>`;
            },
            support: -2,
            powered(){ return 1; },
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
                return `<div>${loc('space_belt_iridium_ship_effect1')}</div><div>${loc('space_belt_iridium_ship_effect2',[iridium])}</div>`;
            },
            support: -1,
            powered(){ return 1; },
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
                    return `<div>${loc('space_belt_iron_ship_effect1')}</div><div>${loc('space_belt_iron_ship_effect2',[iron])}</div><div>${loc('space_belt_iron_ship_effect3')}</div>`;
                }
                else {
                    return `<div>${loc('space_belt_iron_ship_effect1')}</div><div>${loc('space_belt_iron_ship_effect2',[iron])}</div>`;
                }
            },
            support: -1,
            powered(){ return 1; },
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
                    messageQueue(loc('space_dwarf_mission_action',[races[global.race.species].solar.dwarf]),'success');
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
                return `<div>${loc('plus_max_resource',[elerium,loc('resource_Elerium_name')])}</div><div>${loc('space_dwarf_elerium_contain_effect2',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return 6; },
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
                return `<div>${loc('space_dwarf_reactor_effect1',[power])}</div><div>${loc('space_dwarf_reactor_effect2',[elerium])}</div>`;
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
                if (global.space.world_collider.count < 1859){
                    return `<div>${loc('space_dwarf_collider_desc')}</div><div class="has-text-special">${loc('space_dwarf_collider_desc_req')}</div>`;
                }
                else {
                    return `<div>${loc('space_dwarf_collider_desc_req')}</div>`;
                }
            },
            reqs: { science: 10 },
            no_queue(){ return global.space.world_collider.count < 1859 ? false : true },
            cost: {
                Money(){ return global.space.world_collider.count < 1859 ? 25000 : 0; },
                Copper(){ return global.space.world_collider.count < 1859 ? 750 : 0; },
                Alloy(){ return global.space.world_collider.count < 1859 ? 125 : 0; },
                Neutronium(){ return global.space.world_collider.count < 1859 ? 12 : 0; },
                Elerium(){ return global.space.world_collider.count < 1859 ? 1 : 0; },
                Mythril(){ return global.space.world_collider.count < 1859 ? 10 : 0; }
            },
            effect(){
                if (global.space.world_collider.count < 1859){
                    let remain = 1859 - global.space.world_collider.count;
                    return `<div>${loc('space_dwarf_collider_effect1')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('space_dwarf_collider_effect3');
                }
            },
            refresh: true,
            action(){
                if (global.space.world_collider.count < 1859 && payCosts($(this)[0].cost)){
                    incrementStruct('world_collider');
                    if (global.space.world_collider.count >= 1859){
                        global.tech['science'] = 11;
                        global.space['world_controller'] = { count: 1, on: 0 };
                    }
                    return true;
                }
                return false;
            },
            flair: loc('space_dwarf_collider_flair')
        },
        world_controller: {
            id: 'space-world_controller',
            title: loc('space_dwarf_controller_title'),
            desc(){
                return `<div>${loc('space_dwarf_controller_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { science: 11 },
            cost: {},
            no_queue(){ return true },
            effect(){
                let boost = 25;
                if (global.interstellar['far_reach'] && p_on['far_reach'] > 0){
                    boost += p_on['far_reach'] * 1;
                }
                return `<div>${loc('space_dwarf_controller_effect1')}</div><div>${loc('plus_max_resource',[boost+'%',loc('resource_Knowledge_name')])}</div><div>${loc('space_dwarf_controller_effect3')}</div><div>${loc('space_dwarf_controller_effect4',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return 20; },
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
                    messageQueue(loc('interstellar_alpha_mission_result'),'success');
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
                return `<div>${loc('interstellar_alpha_starport_effect1',[$(this)[0].support])}</div><div>${loc('interstellar_alpha_starport_effect2',[helium,$(this)[0].powered()])}</div><div>${loc('interstellar_alpha_starport_effect3',[food,global.resource.Food.name])}</div>`;
            },
            support: 5,
            powered(){ return 10; },
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
                return `<div>${loc('interstellar_alpha_starport_effect1',[$(this)[0].support])}</div><div>${loc('interstellar_habitat_effect',[citizens,$(this)[0].powered()])}</div>`;
            },
            support: 1,
            powered(){ return 2; },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('habitat','interstellar');
                    if (global.city.power >= 2){
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
                return `<div>${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('interstellar_mining_droid_effect')}</div>`;
            },
            support: -1,
            powered(){ return 1; },
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
                return `<div>${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('interstellar_processing_effect',[bonus])}</div>`;
            },
            support: -1,
            powered(){ return 1; },
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
                return `<div>${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('interstellar_fusion_effect',[-($(this)[0].powered()),det])}</div>`;
            },
            support: -1,
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
                let desc = `<div>${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('city_max_knowledge',[know])}</div>`;
                if (global.tech['science'] >= 13){
                    desc = desc + `<div>${loc('interstellar_laboratory_effect',[5])}</div>`;
                }
                return desc;
            },
            support: -1,
            powered(){ return 1; },
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
                let vault = spatialReasoning(bank_vault() * global.city['bank'].count / 18);
                vault = +(vault).toFixed(0);
                return `<div>${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('plus_max_resource',[vault,loc('resource_Money_name')])}</div>`;
            },
            support: -1,
            powered(){ return 1; },
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
                return `<div>${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('interstellar_g_factory_effect')}</div>`;
            },
            support: -1,
            powered(){ return 1; },
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
                    messageQueue(loc('interstellar_proxima_mission_result'),'success');
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
                if (global.tech['proxima'] === 1){
                    global.tech['proxima'] = 2;
                    global.interstellar['cargo_yard'] = { count: 0 };
                }
                let fuel = 0.28;
                let helium = spatialReasoning(5000);
                let oil = spatialReasoning(4000);
                let det = '';
                if (global.resource.Deuterium.display){
                    det = `<div>${loc('plus_max_resource',[spatialReasoning(2000),loc('resource_Deuterium_name')])}</div>`;
                }
                return `<div>${loc('interstellar_alpha_starport_effect1',[$(this)[0].support])}</div><div>${loc('plus_max_resource',[oil,loc('resource_Oil_name')])}</div><div>${loc('plus_max_resource',[helium,loc('resource_Helium_3_name')])}</div>${det}<div>${loc('city_fission_power_effect',[fuel])}</div><div>${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            support: 1,
            powered(){ return 1; },
            refresh: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('xfer_station','interstellar');
                    if (global.city.power >= $(this)[0].powered()){
                        global.interstellar['xfer_station'].on++;
                        global['resource']['Helium_3'].max += spatialReasoning(5000);
                        global['resource']['Oil'].max += spatialReasoning(4000);
                        global['resource']['Deuterium'].max += spatialReasoning(2000);
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
            powered(){ return 1; },
            effect(){
                let helium = +int_fuel_adjust(6).toFixed(2);
                let troops = 3;
                return `<div>${loc('plus_max_soldiers',[troops])}</div><div>${loc('space_red_factory_effect3',[helium])}</div>`;
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
                if (global.interstellar.dyson.count < 100){
                    return `<div>${loc('interstellar_dyson_title')}</div><div class="has-text-special">${loc('requires_segmemts',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_dyson_title')}</div>`;
                }
            },
            reqs: { proxima: 3 },
            no_queue(){ return global.interstellar.dyson.count ? false : true },
            cost: {
                Money(){ return global.interstellar.dyson.count < 100 ? 250000 : 0; },
                Adamantite(){ return global.interstellar.dyson.count < 100 ? 10000 : 0; },
                Infernite(){ return global.interstellar.dyson.count < 100 ? 25 : 0; },
                Stanene(){ return global.interstellar.dyson.count < 100 ? 100000 : 0; }
            },
            effect(){
                if (global.interstellar.dyson.count < 100){
                    let remain = 100 - global.interstellar.dyson.count;
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
                    messageQueue(loc('interstellar_nebula_mission_result'),'success');
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
                return `<div>${loc('interstellar_nexus_effect1',[$(this)[0].support])}</div><div>${loc('plus_max_resource',[oil,loc('resource_Oil_name')])}</div><div>${loc('plus_max_resource',[helium,loc('resource_Helium_3_name')])}</div><div>${loc('plus_max_resource',[deuterium,loc('resource_Deuterium_name')])}</div><div>${loc('plus_max_resource',[elerium,loc('resource_Elerium_name')])}</div><div>${loc('interstellar_nexus_effect2',[$(this)[0].powered(),350])}</div>`;
            },
            support: 2,
            powered(){ return 8; },
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
                return `<div>${loc('space_used_support',[loc('interstellar_nebula_name')])}</div><div>${loc('space_gas_mining_effect1',[helium])}</div>${ram}`;
            },
            support: -1,
            powered(){ return 1; },
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
                return `<div>${loc('space_used_support',[loc('interstellar_nebula_name')])}</div><div>${loc('space_belt_elerium_ship_effect2',[elerium])}</div>`;
            },
            support: -1,
            powered(){ return 1; },
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
                    messageQueue(loc('interstellar_neutron_mission_result'),'success');
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
                return `<div>${loc('space_gas_moon_outpost_effect1',[neutronium])}</div><div>${loc('plus_max_resource',[max_neutronium,loc('resource_Neutronium_name')])}</div><div>${loc('interstellar_alpha_starport_effect2',[helium,$(this)[0].powered()])}</div>`;
            },
            powered(){ return 6; },
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
                return `${desc}<div class="has-text-advanced">${loc('interstellar_citadel_power',[$(this)[0].powered(),2.5])}</div>`;
            },
            powered(){
                if (p_on['citadel'] && p_on['citadel'] > 1){
                    return 30 + ((p_on['citadel'] - 1) * 2.5);
                }
                return 30;
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
                        let garrisoned = global.civic.garrison.workers;
                        for (let i=0; i<3; i++){
                            if (global.civic.foreign[`gov${i}`].occ){
                                garrisoned += 20;
                            }
                        }
                        let pop = global['resource'][global.race.species].amount + garrisoned;
                        let plasmid = Math.round(pop / 2);
                        let k_base = global.stats.know;
                        let k_inc = 40000;
                        while (k_base > k_inc){
                            plasmid++;
                            k_base -= k_inc;
                            k_inc *= 1.012;
                        }
                        let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
                        plasmid = challenge_multiplier(plasmid,'bigbang');
                        let phage = challenge_multiplier(Math.floor(Math.log2(plasmid) * Math.E * 2.5),'bigbang');
                        let dark = +(Math.log(1 + (global.interstellar.stellar_engine.exotic * 40))).toFixed(3);
                        dark += +(Math.log2(global.interstellar.stellar_engine.mass - 7)/2.5).toFixed(3);
                        dark = challenge_multiplier(dark,'bigbang',3);

                        return `<div>${loc('interstellar_blackhole_desc4',[home,mass,exotic])}</div><div class="has-text-advanced">${loc('interstellar_blackhole_desc5',[plasmid,phage,dark,plasmidType])}</div>`;
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
                    messageQueue(loc('interstellar_blackhole_mission_result'),'success');
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
                return `<div>${loc('interstellar_far_reach_effect',[1])}</div><div>${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return 5; },
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
                if (global.interstellar.stellar_engine.count < 100){
                    return `<div>${loc('interstellar_stellar_engine')}</div><div class="has-text-special">${loc('requires_segmemts',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_stellar_engine')}</div>`;
                }
            },
            reqs: { blackhole: 3 },
            no_queue(){ return global.interstellar.stellar_engine.count < 100 ? false : true },
            cost: {
                Money(){ return global.interstellar.stellar_engine.count < 100 ? 500000 : 0; },
                Neutronium(){ return global.interstellar.stellar_engine.count < 100 ? 450 : 0; },
                Adamantite(){ return global.interstellar.stellar_engine.count < 100 ? 17500 : 0; },
                Infernite(){ return global.interstellar.stellar_engine.count < 100 ? 225 : 0; },
                Graphene(){ return global.interstellar.stellar_engine.count < 100 ? 45000 : 0; },
                Mythril(){ return global.interstellar.stellar_engine.count < 100 ? 250 : 0; },
                Aerogel(){ return global.interstellar.stellar_engine.count < 100 ? 75 : 0; },
            },
            effect(){
                if (global.interstellar.stellar_engine.count < 100){
                    let remain = 100 - global.interstellar.stellar_engine.count;
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
                return `<div>${loc('interstellar_mass_ejector_effect',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return 2; },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.interstellar.mass_ejector.count === 0){
                        messageQueue(loc('interstellar_mass_ejector_msg'));
                    }
                    global.settings.showEjector = true;
                    incrementStruct('mass_ejector','interstellar');
                    if (global.city.power >= $(this)[0].powered()){
                        global.interstellar['mass_ejector'].on++;
                    }
                    $('#resources').empty();
                    defineResources();
                    return true;
                }
                return false;
            },
            flair(){
                return loc('interstellar_mass_ejector_flair');
            }
        },
    }
};

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
        Stanene: 0, Plywood: 0,
        Brick: 0, Wrought_Iron: 0,
        Sheet_Metal: 0, Mythril: 0,
        Aerogel: 0
    },
    turret: { count: 0, on: 0 },
    carport: { count: 0, damaged: 0, repair: 0 },
    war_droid: { count: 0, on: 0 },
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

export function space(){
    let parent = $('#space');
    parent.empty();
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
                $(`#pop${region}`).remove();
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

export function deepSpace(){
    let parent = $('#interstellar');
    parent.empty();
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
                $(`#pop${region}`).remove();
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
        res *= reduce ** global.space.swarm_plant.count;
    }
    return res;
}

export function fuel_adjust(fuel){
    if (global.race.universe === 'heavy'){
        fuel *= 1.25 + (0.5 * 0.995 ** global.race.Dark.count);
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
        fuel *= 1.2 + (0.3 * 0.995 ** global.race.Dark.count);
    }
    if (global.stats.achieve['heavyweight']){
        fuel *= 0.96 ** global.stats.achieve['heavyweight'].l;
    }
    return fuel;
}

export function zigguratBonus(){
    let bonus = 1;
    if (global.space['ziggurat'] && global.space['ziggurat'].count > 0){
        let study = global.tech['ancient_study'] ? 0.006 : 0.004;
        bonus += (global.space.ziggurat.count * global.civic.colonist.workers * study);
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
            $('#evolution').empty();

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
            $(`#pop${id}`).remove();
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
                $(`#pop${id}`).remove();
            });
    }
}
