import { save, global, seededRandom, webWorker, keyMultiplier, sizeApproximation, p_on, support_on, int_on, gal_on } from './vars.js';
import { vBind, messageQueue, clearElement, popover, clearPopper, flib, powerModifier, powerCostMod, calcPrestige, spaceCostMultiplier, darkEffect, eventActive, calcGenomeScore, randomKey, getTraitDesc, deepClone, get_qlevel, timeFormat } from './functions.js';
import { unlockAchieve, unlockFeat, universeAffix } from './achieve.js';
import { races, traits, genus_def, genusVars, planetTraits, biomes, traitCostMod } from './races.js';
import { spatialReasoning, unlockContainers, drawResourceTab, atomic_mass } from './resources.js';
import { loadFoundry, jobScale } from './jobs.js';
import { defineIndustry, addSmelter } from './industry.js';
import { garrisonSize, describeSoldier, checkControlling, govTitle } from './civics.js';
import { actions, payCosts, powerOnNewStruct, initStruct, setAction, setPlanet, storageMultipler, drawTech, bank_vault, updateDesc, actionDesc, templeEffect, templeCount, casinoEffect, wardenLabel, buildTemplate, structName } from './actions.js';
import { outerTruthTech, syndicate, drawShipYard } from './truepath.js';
import { production, highPopAdjust } from './prod.js';
import { defineGovernor, govActive } from './governor.js';
import { ascend, terraform, apotheosis } from './resets.js';
import { loadTab } from './index.js';
import { loc } from './locale.js';

const spaceProjects = {
    spc_home: {
        info: {
            name(){
                return races[global.race.species].home;
            },
            desc: loc('space_home_info_desc'),
            zone: 'inner',
            syndicate(){ return false; }
        },
        test_launch: {
            id: 'space-test_launch',
            title: loc('space_home_test_launch_title'),
            desc: loc('space_home_test_launch_desc'),
            reqs: { space: 1 },
            grant: ['space',2],
            queue_complete(){ return global.tech.space >= 2 ? 0 : 1; },
            cost: {
                Money(){ return 100000; },
                Oil(offset,wiki){ return fuel_adjust(7500,false,wiki); }
            },
            effect: loc('space_home_test_launch_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    if (global.race['truepath']){
                        let sabotage = 1;
                        if (!checkControlling('gov0')){ sabotage++; }
                        if (!checkControlling('gov1')){ sabotage++; }
                        if (!checkControlling('gov2')){ sabotage++; }
                        if (Math.floor(seededRandom(0,sabotage)) !== 0){
                            messageQueue(loc('space_home_test_launch_action_fail'),'danger',false,['progress']);
                            return 0;
                        }
                    }
                    initStruct(spaceProjects.spc_home.satellite);
                    messageQueue(loc('space_home_test_launch_action'),'info',false,['progress']);
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
                Oil(offset,wiki){ return spaceCostMultiplier('satellite', offset, fuel_adjust(3200,false,wiki), 1.22); },
                Alloy(offset){ return spaceCostMultiplier('satellite', offset, 8000, 1.22); }
            },
            effect(){
                let knowledge = global.race['cataclysm'] || global.race['orbit_decayed'] ? 2000 : 750;
                if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.tech['supercollider']){
                    let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 5 : 10;
                    knowledge *= (global.tech['supercollider'] / ratio) + 1;
                }
                let label = global.race['cataclysm'] ? loc('space_moon_observatory_title') : (global.race['orbit_decayed'] ? loc('city_university') : wardenLabel());
                let amount = global.race['cataclysm'] ? 25 : (global.race['orbit_decayed'] ? 12 : 4);
                let synergy = `<div>${loc('space_home_satellite_effect2',[label, amount])}</div>`;
                return `<div>${loc('plus_max_resource',[knowledge,global.resource.Knowledge.name])}</div>${synergy}<div>${loc('space_home_satellite_effect3',[global.civic.scientist ? global.civic.scientist.name : loc('job_scientist')])}</div>`
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('satellite');
                    global['resource']['Knowledge'].max += 750;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['satellite','space']
                };
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
                Oil(offset,wiki){ return spaceCostMultiplier('gps', offset, fuel_adjust(3500,false,wiki), 1.18); },
                Titanium(offset){ return spaceCostMultiplier('gps', offset, 8000, 1.18); }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.space.hasOwnProperty('gps') ? global.space['gps'].count : 0);
                if (count < 4){
                    return loc('space_home_gps_effect_req');
                }
                else {
                    return `<div>${loc('space_home_gps_effect')}</div><div>${loc('space_home_gps_effect2',[2])}</div>`;
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('gps');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['gps','space']
                };
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
                Oil(offset,wiki){ return spaceCostMultiplier('propellant_depot', offset, fuel_adjust(5500,false,wiki), 1.35); },
            },
            effect(){
                let oil = spatialReasoning(1250) * (global.tech['world_control'] ? 1.5 : 1);
                if (global.resource['Helium_3'].display){
                    let helium = spatialReasoning(1000) * (global.tech['world_control'] ? 1.5 : 1);
                    return `<div>${loc('plus_max_resource',[oil,global.resource.Oil.name])}</div><div>${loc('plus_max_resource',[helium,global.resource.Helium_3.name])}</div>`;
                }
                return `<div>${loc('plus_max_resource',[oil,global.resource.Oil.name])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('propellant_depot');
                    global['resource']['Oil'].max += spatialReasoning(1250) * (global.tech['world_control'] ? 1.5 : 1);
                    if (global.resource['Helium_3'].display){
                        global['resource']['Helium_3'].max += spatialReasoning(1000) * (global.tech['world_control'] ? 1.5 : 1);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['propellant_depot','space']
                };
            }
        },
        nav_beacon: {
            id: 'space-nav_beacon',
            title(){ return global.race['orbit_decayed'] ? loc('space_home_broadcast_beacon_title') : loc('space_home_nav_beacon_title'); },
            desc: `<div>${loc('space_home_nav_beacon_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { luna: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('nav_beacon', offset, 75000, 1.32); },
                Copper(offset){ return spaceCostMultiplier('nav_beacon', offset, 38000, 1.32); },
                Aluminium(offset){ return spaceCostMultiplier('nav_beacon', offset, 44000, 1.32); },
                Oil(offset,wiki){ return spaceCostMultiplier('nav_beacon', offset, fuel_adjust(12500,false,wiki), 1.32); },
                Iridium(offset){ return spaceCostMultiplier('nav_beacon', offset, 1200, 1.32); }
            },
            powered(){ return powerCostMod(2); },
            powerBalancer(){
                return global.tech['luna'] && global.tech['luna'] >= 3
                    ? [{ s: global.space.moon_base.s_max - global.space.moon_base.support },{ s: global.space.spaceport.s_max - global.space.spaceport.support }]
                    : [{ s: global.space.moon_base.s_max - global.space.moon_base.support }];
            },
            support(){ return 1; },
            effect(){
                let orbitEffect = '';
                if (global.race['orbit_decayed'] && global.tech['broadcast'] && !global.race['joyless']){
                    orbitEffect = `<div class="has-text-caution">${loc('space_red_vr_center_effect1',[global.tech['broadcast'] / 2])}</div>`;
                }
                let effect1 = global.race['orbit_decayed'] ? '' : `<div>${loc('space_home_nav_beacon_effect1')}</div>`;
                let effect3 = global.tech['luna'] >=3 ? `<div>${loc('space_red_spaceport_effect1',[planetName().red,1])}</div>` : '';
                return `${effect1}${effect3}${orbitEffect}<div class="has-text-caution">${loc('space_home_nav_beacon_effect2',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('nav_beacon');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['nav_beacon','space']
                };
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
            zone: 'inner',
            syndicate(){ return true; }
        },
        moon_mission: {
            id: 'space-moon_mission',
            title: loc('space_moon_mission_title'),
            desc: loc('space_moon_mission_desc'),
            reqs: { space: 2, space_explore: 2 },
            grant: ['space',3],
            queue_complete(){ return global.tech.space >= 3 ? 0 : 1; },
            cost: {
                Oil(offset,wiki){ return +fuel_adjust(12000,false,wiki).toFixed(0); }
            },
            effect: loc('space_moon_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_moon_mission_action'),'info',false,['progress']);
                    initStruct(spaceProjects.spc_moon.iridium_mine);
                    initStruct(spaceProjects.spc_moon.helium_mine);
                    return true;
                }
                return false;
            }
        },
        moon_base: {
            id: 'space-moon_base',
            title: loc('space_moon_base_title'),
            desc(){ return `<div>${loc('space_moon_base_desc')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`; },
            reqs: { space: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('moon_base', offset, 22000, 1.32); },
                Cement(offset){ return spaceCostMultiplier('moon_base', offset, 18000, 1.32); },
                Alloy(offset){ return spaceCostMultiplier('moon_base', offset, 7800, 1.32); },
                Polymer(offset){ return spaceCostMultiplier('moon_base', offset, 12500, 1.32); }
            },
            effect(wiki){
                let iridium = spatialReasoning(500);
                let oil = +(fuel_adjust($(this)[0].support_fuel().a,true,wiki)).toFixed(2);
                return `<div>${loc('space_moon_base_effect1')}</div><div>${loc('plus_max_resource',[iridium,global.resource.Iridium.name])}</div><div class="has-text-caution">${loc('space_moon_base_effect3',[oil,$(this)[0].powered()])}</div>`;
            },
            support(){ return 2; },
            support_fuel(){ return { r: 'Oil', a: 2 }; },
            powered(){ return powerCostMod(4); },
            powerBalancer(){
                return [{ s: global.space.moon_base.s_max - global.space.moon_base.support }];
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('moon_base');
                    powerOnNewStruct($(this)[0]);
                    if (global.space['moon_base'].count === 1){
                        global.tech['moon'] = 1;
                    }
                    if (!global.tech['luna']){
                        global.tech['luna'] = 1;
                        if (global.race['truepath']){
                            let msg = loc('space_moon_base_msg',[govTitle(3)]);
                            if (global.civic.foreign.gov3.hstl < 10){
                                msg = `${msg} ${loc('space_moon_base_msg_ally')}`;
                            }
                            else if (global.civic.foreign.gov3.hstl > 60){
                                msg = `${msg} ${loc('space_moon_base_msg_hstl')}`;
                            }
                            messageQueue(msg,'info',false,['progress']);
                        }
                    }
                    if (global.race['orbit_decay'] && global.race.orbit_decay > global.stats.days + 2500){
                        global.race.orbit_decay = global.stats.days + 2500;
                        messageQueue(loc('evo_challenge_orbit_decayed_accelerated',[global.race.orbit_decay - global.stats.days]),'info',false,['progress']);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0,
                        on: 0,
                        support: 0,
                        s_max: 0
                    },
                    p: ['moon_base','space']
                };
            },
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
                let values = production('iridium_mine','iridium');
                let iridium = +(values.b).toFixed(3);
                let rival = ``;
                if (global.race['truepath']){
                    if (global.civic.foreign.gov3.hstl < 10){
                        rival = `<div class="has-text-success">${loc('space_rival_ally',[+(values.g * 100).toFixed(1)])}</div>`;
                    }
                    else if (global.civic.foreign.gov3.hstl > 60){
                        rival = `<div class="has-text-danger">${loc('space_rival_war',[+(values.g * 100).toFixed(1)])}</div>`;
                    }
                }
                let cat_coal = global.race['cataclysm'] ? `<div>${loc('produce',[+(production('iridium_mine','coal')).toFixed(2),global.resource.Coal.name])}</div>` : ``;
                let cat_uran = global.race['cataclysm'] ? `<div>${loc('produce',[+(production('iridium_mine','coal') / 48).toFixed(3),global.resource.Uranium.name])}</div>` : ``;
                return `<div class="has-text-caution">${loc('space_used_support',[loc('space_moon_info_name')])}</div><div>${loc('space_moon_iridium_mine_effect',[iridium])}</div>${rival}${cat_coal}${cat_uran}`;
            },
            s_type: 'moon',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    global.resource.Iridium.display = true;
                    incrementStruct('iridium_mine');
                    if (!global.resource['Mythril'].display){
                        global.resource['Mythril'].display = true;
                        loadFoundry();
                    }
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['iridium_mine','space']
                };
            },
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
                let values = production('helium_mine');
                let helium = +(values.b).toFixed(3);
                let rival = ``;
                if (global.race['truepath']){
                    if (global.civic.foreign.gov3.hstl < 10){
                        rival = `<div class="has-text-success">${loc('space_rival_ally',[+(values.g * 100).toFixed(1)])}</div>`;
                    }
                    else if (global.civic.foreign.gov3.hstl > 60){
                        rival = `<div class="has-text-danger">${loc('space_rival_war',[+(values.g * 100).toFixed(1)])}</div>`;
                    }
                }
                return `<div class="has-text-caution">${loc('space_used_support',[loc('space_moon_info_name')])}</div><div>${loc('space_moon_helium_mine_effect',[helium])}</div>${rival}<div>${loc('plus_max_resource',[storage,global.resource.Helium_3.name])}</div>`;
            },
            s_type: 'moon',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    global.resource['Helium_3'].display = true;
                    incrementStruct('helium_mine');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['helium_mine','space']
                };
            },
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
                let prof = '';
                if (global.race['cataclysm']){
                    prof = `<div>${loc('city_university_effect',[jobScale(1)])}</div>`;
                }
                let gain = 5000;
                if (global.race['cataclysm'] && global.space['satellite'] && global.space.satellite.count > 0){
                    gain *= 1 + (global.space.satellite.count * 0.25);
                }
                let synergy = global.race['cataclysm'] ? `<div>${loc('space_moon_observatory_cata_effect',[25])}</div>` : `<div>${loc('space_moon_observatory_effect',[5])}</div>`;
                return `<div class="has-text-caution">${loc('space_used_support',[loc('space_moon_info_name')])}</div>${prof}<div>${loc('plus_max_resource',[gain,global.resource.Knowledge.name])}</div>${synergy}`;
            },
            s_type: 'moon',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('observatory');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['observatory','space']
                };
            }
        },
    },
    spc_red: {
        info: {
            name(){
                return planetName().red;
            },
            desc(){
                return loc('space_red_info_desc',[planetName().red]);
            },
            support: 'spaceport',
            zone: 'inner',
            syndicate(){ return true; }
        },
        red_mission: {
            id: 'space-red_mission',
            title(){
                return loc('space_mission_title',[planetName().red]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().red]);
            },
            reqs: { space: 3, space_explore: 3 },
            grant: ['space',4],
            queue_complete(){ return global.tech.space >= 4 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(4500,false,wiki).toFixed(0); }
            },
            effect(){
                return loc('space_red_mission_effect',[planetName().red]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_red_mission_action',[planetName().red]),'info',false,['progress']);
                    initStruct(spaceProjects.spc_red.living_quarters);
                    initStruct(spaceProjects.spc_red.garage);
                    initStruct(spaceProjects.spc_red.red_mine);
                    initStruct(spaceProjects.spc_red.fabrication);
                    return true;
                }
                return false;
            }
        },
        spaceport: {
            id: 'space-spaceport',
            title: loc('space_red_spaceport_title'),
            desc(){ return `<div>${loc('space_red_spaceport_desc')}</div><div class="has-text-special">${loc('requires_power_space',[global.resource.Food.name])}</div>`; },
            reqs: { space: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('spaceport', offset, 47500, 1.32); },
                Iridium(offset){ return spaceCostMultiplier('spaceport', offset, 1750, 1.32); },
                Mythril(offset){ return spaceCostMultiplier('spaceport', offset, 25, 1.32); },
                Titanium(offset){ return spaceCostMultiplier('spaceport', offset, 22500, 1.32); }
            },
            effect(wiki){
                let helium = +(fuel_adjust($(this)[0].support_fuel().a,true,wiki)).toFixed(2);
                let bank = ``;
                if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    let vault = spatialReasoning(bank_vault() * 4);
                    bank = `<div>${loc('plus_max_resource',[`\$${vault}`,loc('resource_Money_name')])}</div>`;
                }
                return `<div>${loc('space_red_spaceport_effect1',[planetName().red,$(this)[0].support()])}</div>${bank}<div class="has-text-caution">${loc('space_red_spaceport_effect2',[helium,$(this)[0].powered()])}</div><div class="has-text-caution">${loc('spend',[global.race['cataclysm'] || global.race['orbit_decayed'] ? 2 : 25,global.resource.Food.name])}</div>`;
            },
            support(){
                let support = global.race['cataclysm'] || global.race['orbit_decayed'] ? 4 : 3;
                if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 4){ support++; }
                return support;
            },
            support_fuel(){ return { r: 'Helium_3', a: 1.25 }; },
            powered(){ return powerCostMod(5); },
            powerBalancer(){
                return [{ s: global.space.spaceport.s_max - global.space.spaceport.support }];
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('spaceport');
                    powerOnNewStruct($(this)[0]);
                    if (!global.tech['mars']){
                        global.tech['mars'] = 1;
                    }
                    if (global.race['orbit_decay'] && global.race.orbit_decay > global.stats.days + 1000){
                        global.race.orbit_decay = global.stats.days + 1000;
                        messageQueue(loc('evo_challenge_orbit_decayed_accelerated',[global.race.orbit_decay - global.stats.days]),'info',false,['progress']);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0,
                        on: 0,
                        support: 0,
                        s_max: 0
                    },
                    p: ['spaceport','space']
                };
            },
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
                return `<div>${loc('space_red_spaceport_effect1',[planetName().red, global.race['cataclysm'] || global.race['fasting'] ? 2 : 1])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(2); },
            powerBalancer(){
                return [{ s: global.space.spaceport.s_max - global.space.spaceport.support }];
            },
            support(){ return global.race['cataclysm'] || global.race['fasting'] ? 2 : 1; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('red_tower');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['red_tower','space']
                };
            },
        },
        captive_housing: buildTemplate(`captive_housing`,'space'),
        terraformer: {
            id: 'space-terraformer',
            title: loc('space_terraformer'),
            desc(wiki){
                if (!global.space.hasOwnProperty('terraformer') || global.space.terraformer.count < 100 || wiki){
                    return `<div>${loc('space_terraformer')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>` + (global.space.hasOwnProperty('terraformer') && global.space.terraformer.count >= 100 ? `<div class="has-text-special">${loc('requires_power')}</div>` : ``);
                }
                else {
                    return `<div>${loc('space_terraformer')}</div>`;
                }
            },
            reqs: { terraforming: 1 },
            condition(){
                return global.space.terraformer.count >= 100 ? false : true;
            },
            queue_size: 5,
            queue_complete(){ return 100 - global.space.terraformer.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 7500000 : 75000000) : 0; },
                Alloy(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 250000 : 750000) : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? 125000 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? 1000 : 0; },
                Bolognium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 0 : 100000) : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 12000 : 250000) : 0; },
                Soul_Gem(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 0 : 1) : 0; },
                Nanoweave(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 0 : 75000) : 0; },
                Quantium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 75000 : 0) : 0; },
                Cipher(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 1000 : 0) : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('space_terraformer_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return spaceProjects.spc_red.atmo_terraformer.effect(wiki);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.space.terraformer.count < 100){
                        incrementStruct('terraformer','space');
                        if (global.space.terraformer.count >= 100){
                            global.tech['terraforming'] = 2;
                            global.space['atmo_terraformer'] = { count: 1, on: 0 };
                            renderSpace();
                            clearPopper();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['terraformer','space']
                };
            },
        },
        atmo_terraformer: {
            id: 'space-atmo_terraformer',
            title: loc('space_terraformer'),
            desc(){ return `<div>${loc('space_terraformer')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            wiki: false,
            reqs: { terraforming: 2 },
            condition(){
                return global.space.terraformer.count >= 100 ? true : false;
            },
            queue_complete(){ return 0; },
            cost: {},
            powered(wiki){
                return powerCostMod((wiki ? wiki.truepath : global.race['truepath']) ? 500 : 5000);
            },
            postPower(o){
                if (o){
                    setTimeout(function(){
                        global.tech.terraforming = p_on['atmo_terraformer'] ? 3 : 2;
                        renderSpace();
                    }, 250);
                }
                else {
                    global.tech.terraforming = 2;
                    renderSpace();
                }
            },
            effect(wiki){
                let reward = terraformProjection();
                let power = $(this)[0].powered(wiki);
                let power_label = power > 0 ? `<div class="has-text-caution">${loc('minus_power',[power])}</div>` : '';
                return `<div>${loc('space_terraformer_effect2')}</div>${reward}${power_label}`;
            },
            action(args){
                return false;
            }
        },
        terraform: {
            id: 'space-terraform',
            title: loc('space_terraform'),
            desc: loc('space_terraform'),
            reqs: { terraforming: 3 },
            queue_complete(){ return 0; },
            no_multi: true,
            cost: {},
            effect(){
                let reward = terraformProjection();
                return `<div>${loc('space_terraform_effect')}</div>${reward}`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    terraformLab();
                    return true;
                }
                return false;
            }
        },
        assembly: buildTemplate(`assembly`,'space'),
        living_quarters: {
            id: 'space-living_quarters',
            title(){
                let halloween = eventActive('halloween');
                if (halloween.active){
                    return loc(`events_halloween_red_housing`);
                }
                return loc('space_red_living_quarters_title');
            },
            desc(){
                return `<div>${loc('space_red_living_quarters_desc')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`;
            },
            reqs: { mars: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('living_quarters', offset, house_adjust(38000), 1.28); },
                Steel(offset){ return spaceCostMultiplier('living_quarters', offset, house_adjust(15000), 1.28); },
                Polymer(offset){ return spaceCostMultiplier('living_quarters', offset, house_adjust(9500), 1.28); },
                Horseshoe(){ return global.race['hooved'] ? 2 : 0; }
            },
            effect(wiki){
                let gain = $(this)[0].citizens(wiki);
                let safe = ``;
                if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    let vault = spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? '100000' : '50000') : '25000');
                    safe = `<div>${loc('plus_max_resource',[`\$${vault}`,loc('resource_Money_name')])}</div>`;
                }
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().red])}</div>${safe}<div>${loc('plus_max_resource',[jobScale(1),global.race['truepath'] ? loc('job_colonist_tp',[planetName().red]) : loc('colonist')])}</div><div>${loc('plus_max_resource',[gain,loc('citizen')])}</div>`;
            },
            s_type: 'red',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('living_quarters');
                    global.civic.colonist.display = true;
                    if (powerOnNewStruct($(this)[0])){
                        global.resource[global.race.species].max += jobScale(1);

                        let hiredMax = jobScale(1);
                        global.civic.colonist.max += hiredMax;

                        let hired = Math.min(hiredMax, global.civic[global.civic.d_job].workers);
                        global.civic[global.civic.d_job].workers -= hired;
                        global.civic.colonist.workers += hired;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['living_quarters','space']
                };
            },
            citizens(wiki){
                let gain = global.race['cataclysm'] || global.race['orbit_decayed'] ? 2 : 1;
                let biodome_count = wiki ? (global.space?.biodome?.on ?? 0) : support_on['biodome'];
                if (biodome_count){
                    let pop = global.tech.mars >= 6 ? 0.1 : 0.05;
                    gain += pop * biodome_count;
                }
                return +(jobScale(gain)).toFixed(2);
            }
        },
        pylon: {
            id: 'space-pylon',
            title: loc('space_red_pylon'),
            desc: loc('space_red_pylon'),
            reqs: { magic: 2 },
            condition(){ return global.race['cataclysm'] || global.race['orbit_decayed'] ? true : false; },
            cost: {
                Money(offset){ return spaceCostMultiplier('pylon', offset, 10, 1.48); },
                Stone(offset){ return spaceCostMultiplier('pylon', offset, 12, 1.42); },
                Crystal(offset){ return spaceCostMultiplier('pylon', offset, 8, 1.42) - 3; }
            },
            effect(){
                let max = spatialReasoning(2);
                let mana = +(0.005 * darkEffect('magic')).toFixed(3);
                return `<div>${loc('gain',[mana,global.resource.Mana.name])}</div><div>${loc('plus_max_resource',[max,global.resource.Mana.name])}</div>`;
            },
            special(){ return global.tech['magic'] && global.tech.magic >= 3 ? true : false; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct($(this)[0]);
                    global.resource.Mana.max += spatialReasoning(2);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['pylon','space']
                };
            }
        },
        vr_center: {
            id: 'space-vr_center',
            title: loc('space_red_vr_center_title'),
            desc(){
                return `<div>${loc('space_red_vr_center_desc')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`;
            },
            reqs: { mars: 1, broadcast: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('vr_center', offset, 380000, 1.25); },
                Copper(offset){ return spaceCostMultiplier('vr_center', offset, 55000, 1.25); },
                Stanene(offset){ return spaceCostMultiplier('vr_center', offset, 100000, 1.25); },
                Soul_Gem(offset){ return spaceCostMultiplier('vr_center', offset, 1, 1.25); }
            },
            effect(){
                let gasVal = govActive('gaslighter',1) || 0;
                let morale = gasVal + 1;
                if (global.race['orbit_decayed']){
                    morale += 2;
                }
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().red])}</div><div>${loc('space_red_vr_center_effect1',[morale])}</div><div>${loc('space_red_vr_center_effect2',[2])}</div>`;
            },
            s_type: 'red',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct($(this)[0]);
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['vr_center','space']
                };
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
            res(){
                let r_list = ['Copper','Iron','Cement','Steel','Titanium','Alloy','Nano_Tube','Neutronium','Infernite'];
                if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    r_list.push('Polymer');
                    r_list.push('Coal');
                    r_list.push('Lumber');
                    r_list.push('Chrysotile');
                    r_list.push('Stone');
                    r_list.push('Furs');
                }
                return r_list;
            },
            heavy(res){
                return ['Copper','Iron','Steel','Titanium','Neutronium','Infernite'].includes(res) ? true : false;
            },
            val(res){
                switch (res){
                    case 'Copper':
                        return 6500;
                    case 'Iron':
                        return 5500;
                    case 'Cement':
                        return global.race['cataclysm'] ? 10500 : 6000;
                    case 'Steel':
                        return 4500;
                    case 'Titanium':
                        return 3500;
                    case 'Alloy':
                        return 2500;
                    case 'Nano_Tube':
                        return 25000;
                    case 'Neutronium':
                        return 125;
                    case 'Infernite':
                        return 75;
                    case 'Polymer':
                        return 2500;
                    case 'Coal':
                        return 1500;
                    case 'Lumber':
                        return 7500;
                    case 'Chrysotile':
                        return 7500;
                    case 'Stone':
                        return 7500;
                    case 'Furs':
                        return 2200;
                    default:
                        return 0;
                }
            },
            multiplier(h){
                let multiplier = global.tech['particles'] >= 4 ? 1 + (global.tech['supercollider'] / 20) : 1;
                if (global.tech['world_control'] || global.race['cataclysm'] || global.race['orbit_decayed']){
                    multiplier *= 2;
                }
                if (global.tech['shelving'] && global.tech.shelving >= 3){
                    multiplier *= 1.5;
                }
                multiplier *= global.stats.achieve['blackhole'] ? 1 + (global.stats.achieve.blackhole.l * 0.05) : 1;
                if (h){
                    return global.tech['shelving'] && global.tech.shelving >= 2 ? multiplier * 3 : multiplier;
                }
                return multiplier;
            },
            effect(){
                let multiplier = $(this)[0].multiplier(false);
                let h_multiplier = $(this)[0].multiplier(true);
                let containers = global.tech['particles'] >= 4 ? 20 + global.tech['supercollider'] : 20;
                if (global.tech['world_control'] || global.race['cataclysm'] || global.race['orbit_decayed']){
                    containers += 10;
                }
                let crate = global.race['cataclysm'] || global.race['orbit_decayed'] ? `<span>${loc('plus_max_resource',[containers,global.resource.Crates.name])}</span>` : ``;

                let desc = '<div class="aTable">';
                desc = desc + `<span>${loc('plus_max_resource',[containers,global.resource.Containers.name])}</span>${crate}`;
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let heavy = $(this)[0].heavy(res);
                        let val = sizeApproximation(+(spatialReasoning($(this)[0].val(res)) * (heavy ? h_multiplier : multiplier)).toFixed(0),1);
                        desc = desc + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                desc = desc + '</div>';
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('garage');

                    let containers = global.tech['particles'] >= 4 ? 20 + global.tech['supercollider'] : 20;
                    if (global.tech['world_control'] || global.race['cataclysm'] || global.race['orbit_decayed']){
                        containers += 10;
                    }
                    global.resource.Containers.max += containers;
                    if (!global.resource.Containers.display){
                        unlockContainers();
                    }

                    let multiplier = $(this)[0].multiplier(false);
                    let h_multiplier = $(this)[0].multiplier(true);
                    for (const res of $(this)[0].res()){
                        if (global.resource[res].display){
                            let heavy = $(this)[0].heavy(res);
                            global.resource[res].max += (spatialReasoning($(this)[0].val(res)) * (heavy ? h_multiplier : multiplier));
                        }
                    };
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['garage','space']
                };
            },
        },
        red_mine: {
            id: 'space-red_mine',
            title(){ return structName('mine'); },
            desc(){
                return `<div>${loc('space_red_mine_desc')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`;
            },
            reqs: { mars: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('red_mine', offset, 50000, 1.32); },
                Lumber(offset){ return spaceCostMultiplier('red_mine', offset, 65000, 1.32); },
                Iron(offset){ return spaceCostMultiplier('red_mine', offset, 33000, 1.32); }
            },
            effect(){
                let cop_val = production('red_mine','copper');
                let tit_val = production('red_mine','titanium');
                let copper = +(cop_val.b).toFixed(3);
                let titanium = +(tit_val.b).toFixed(3);
                let rival = ``;
                if (global.race['truepath']){
                    if (global.civic.foreign.gov3.hstl < 10){
                        rival = `<div class="has-text-success">${loc('space_rival_ally',[+(cop_val.g * 100).toFixed(1)])}</div>`;
                    }
                    else if (global.civic.foreign.gov3.hstl > 60){
                        rival = `<div class="has-text-danger">${loc('space_rival_war',[+(cop_val.g * 100).toFixed(1)])}</div>`;
                    }
                }

                let decayed = global.race['orbit_decayed'] ? `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_miner`)])}</div><div>${loc('plus_max_resource',[jobScale(1),loc(`job_coal_miner`)])}</div>` : '';
                let cat_stone = (global.race['cataclysm'] || global.race['orbit_decayed']) && !global.race['sappy'] ? `<div>${loc('space_red_mine_effect',[+(production('red_mine','stone')).toFixed(2),global.resource.Stone.name])}</div>` : ``;
                let cat_asbestos = (global.race['cataclysm'] || global.race['orbit_decayed']) && global.race['smoldering'] ? `<div>${loc('space_red_mine_effect',[+(production('red_mine','asbestos')).toFixed(2),global.resource.Chrysotile.name])}</div>` : ``;
                let cat_alum = global.race['cataclysm'] || global.race['orbit_decayed'] ? `<div>${loc('space_red_mine_effect',[+(production('red_mine','aluminium')).toFixed(2),global.resource.Aluminium.name])}</div>` : ``;
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().red])}</div>${decayed}<div>${loc('space_red_mine_effect',[copper,global.resource.Copper.name])}</div><div>${loc('space_red_mine_effect',[titanium,global.resource.Titanium.name])}</div>${rival}${cat_asbestos}${cat_stone}${cat_alum}`;
            },
            s_type: 'red',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('red_mine');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['red_mine','space']
                };
            },
        },
        fabrication: {
            id: 'space-fabrication',
            title: loc('space_red_fabrication_title'),
            desc(){
                return `<div>${loc('space_red_fabrication_desc')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`;
            },
            reqs: { mars: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('fabrication', offset, 90000, 1.32); },
                Copper(offset){ return spaceCostMultiplier('fabrication', offset, 25000, 1.32); },
                Cement(offset){ return spaceCostMultiplier('fabrication', offset, 12000, 1.32); },
                Wrought_Iron(offset){ return spaceCostMultiplier('fabrication', offset, 1200, 1.32); }
            },
            effect(){
                let c_worker = global.race['cataclysm'] && !global.race['flier'] ? `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_cement_worker`)])}</div>` : ``;
                let fab = global.race['cataclysm'] || global.race['orbit_decayed'] ? 5 : 2;
                if (global.race['high_pop']){
                    fab = highPopAdjust(fab);
                }
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().red])}</div><div>${loc('space_red_fabrication_effect1',[jobScale(1)])}</div>${c_worker}<div>${loc('space_red_fabrication_effect2',[fab])}</div>`;
            },
            s_type: 'red',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('fabrication');
                    if (powerOnNewStruct($(this)[0])){
                        global.civic.craftsman.max += jobScale(1);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['fabrication','space']
                };
            },
        },
        red_factory: {
            id: 'space-red_factory',
            title(){ return structName('factory'); },
            desc(){ return `<div>${loc('space_red_factory_desc')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Helium_3.name])}</div>`; },
            reqs: { mars: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('red_factory', offset, 75000, 1.32); },
                Brick(offset){ return spaceCostMultiplier('red_factory', offset, 10000, 1.32); },
                Coal(offset){ return spaceCostMultiplier('red_factory', offset, 7500, 1.32); },
                Mythril(offset){ return spaceCostMultiplier('red_factory', offset, 50, 1.32); }
            },
            effect(wiki){
                let desc = `<div>${loc('space_red_factory_effect1')}</div>`;
                if (global.tech['foundry'] >= 7){
                    desc = desc + `<div>${loc('space_red_factory_effect2')}</div>`;
                }
                if (global.race['orbit_decayed'] && !global.race['flier']){
                    desc = desc + `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_cement_worker`)])}</div>`;
                }
                let helium = +(fuel_adjust(1,true,wiki)).toFixed(2);
                desc = desc + `<div class="has-text-caution">${loc('space_red_factory_effect3',[helium,$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(3); },
            special: true,
            action(args){
                if (payCosts($(this)[0])){
                    global.space.red_factory.count++;
                    if (powerOnNewStruct($(this)[0])){
                        global.city.factory.Alloy++;
                    }
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['red_factory','space']
                };
            },
        },
        nanite_factory: buildTemplate(`nanite_factory`,'space'),
        biodome: {
            id: 'space-biodome',
            title(){
                if (global.race['artifical']){
                    return loc('space_red_signal_tower_title');
                }
                else {
                    return global.race['soul_eater'] ? loc('space_red_asphodel_title') : loc('space_red_biodome_title');
                }
            },
            desc(){
                let desc;
                if (global.race['artifical']){
                    desc = `<div>${loc('space_red_signal_tower_title')}</div>`;
                }
                else if (global.race['soul_eater']) {
                    desc = `<div>${loc('space_red_asphodel_desc')}</div>`;
                }
                else {
                    if (global.race['carnivore']){
                        desc = `<div>${loc('space_red_biodome_desc_carn')}</div>`;
                    }
                    else {
                        desc = `<div>${loc('space_red_biodome_desc',[planetName().red])}</div>`;
                    }
                }
                return `<div>${desc}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`;
            },
            reqs: { mars: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('biodome', offset, 45000, 1.28); },
                Lumber(offset){ return spaceCostMultiplier('biodome', offset, 65000, 1.28); },
                Brick(offset){ return spaceCostMultiplier('biodome', offset, 1000, 1.28); },
                Nanite(offset){ return global.race['deconstructor'] ? spaceCostMultiplier('biodome', offset, 75, 1.28) : 0; },
            },
            effect(){
                let food = +(production('biodome','food')).toFixed(2);
                let cat_fd = global.race['cataclysm'] || global.race['orbit_decayed'] ? `<div>${loc('produce',[+(production('biodome','cat_food')).toFixed(2),global.resource.Food.name])}</div>` : ``;
                let cat_wd = (global.race['cataclysm'] || global.race['orbit_decayed']) && !global.race['kindling_kindred'] && !global.race['smoldering'] ? `<div>${loc('space_red_mine_effect',[+(production('biodome','lumber')).toFixed(2),global.resource.Lumber.name])}</div>` : ``;
                let pop = global.tech.mars >= 6 ? 0.1 : 0.05;
                let fLabel = global.race['artifical'] ? loc('city_transmitter_effect',[spatialReasoning(500)]) : loc('plus_max_resource',[spatialReasoning(100), global.resource.Food.name]);
                let sig_cap = global.race['artifical'] || global.race['orbit_decayed'] ? `<div>${fLabel}</div` : '';
                
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().red])}</div>${cat_fd}`;
                desc += `<div>${loc('space_red_biodome_effect',[food,global.resource.Food.name])}</div>`;
                desc += `<div>${loc('space_red_biodome_effect2',[+(jobScale(pop)).toFixed(2)])}</div>`;
                if (global.race.universe === 'evil'){
                    let soldier = global.race['grenadier'] ? 0.0375 : 0.075;
                    desc += `<div>${loc('space_red_biodome_effect_evil',[+(jobScale(soldier)).toFixed(3),loc('space_red_space_barracks_title')])}</div>`;
                }
                desc += `${cat_wd}${sig_cap}`;
                return desc;
            },
            s_type: 'red',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('biodome');
                    if (!global.race['cataclysm']){
                        unlockAchieve('colonist');
                        if (global.race['joyless']){
                            unlockAchieve('joyless');
                            delete global.race['joyless'];
                            drawTech();
                        }
                    }
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['biodome','space']
                };
            },
            flair(){
                if (global.race['artifical']){
                    return loc('space_red_signal_tower_flair');
                }
                else {
                    return global.race['soul_eater'] ? loc('space_red_asphodel_flair') : (global.race['carnivore'] ? loc('space_red_biodome_flair_carn') : loc('space_red_biodome_flair'));
                }
            }
        },
        red_university: {
            id: 'space-red_university',
            title: loc('city_university'),
            desc(){
                return loc('city_university_desc',[planetName().red]);
            },
            reqs: { mars: 1 },
            trait: ['orbit_decayed'],
            cost: {
                Money(offset){ return spaceCostMultiplier('university', offset, 900, 1.5, 'city') - 500; },
                Lumber(offset){ return spaceCostMultiplier('university', offset, 500, 1.36, 'city') - 200; },
                Stone(offset){ return spaceCostMultiplier('university', offset, 750, 1.36, 'city') - 350; },
                Crystal(offset){ return global.race.universe === 'magic' ? spaceCostMultiplier('university', offset, 5, 1.36, 'city') : 0; },
            },
            wiki: false,
            effect(){
                return actions.city.university.effect();
            },
            action(args){
                if (payCosts($(this)[0])){
                    let gain = global.tech['science'] && global.tech['science'] >= 8 ? 700 : 500;
                    if (global.tech['supercollider']){
                        let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                        gain *= (global.tech['supercollider'] / ratio) + 1;
                    }
                    global['resource']['Knowledge'].max += gain;
                    global.city.university.count++;
                    global.space.red_university.count = global.city.university.count;
                    global.civic.professor.display = true;
                    global.civic.professor.max = jobScale(global.city.university.count);
                    return true;
                }
                return false;
            },
        },
        exotic_lab: {
            id: 'space-exotic_lab',
            title: loc('space_red_exotic_lab_title'),
            desc(){
                return `<div>${loc('space_red_exotic_lab_desc')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`;
            },
            reqs: { mars: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('exotic_lab', offset, 750000, 1.28); },
                Steel(offset){ return spaceCostMultiplier('exotic_lab', offset, 100000, 1.28); },
                Mythril(offset){ return spaceCostMultiplier('exotic_lab', offset, 1000, 1.28); },
                Elerium(offset){ return spaceCostMultiplier('exotic_lab', offset, 20, 1.28) - 4; }
            },
            effect(wiki){
                let sci = 500;
                if (global.tech['science'] >= 13 && global.interstellar['laboratory']){
                    let num_lab_on = wiki ? global.interstellar.laboratory.on : int_on['laboratory'];
                    sci += num_lab_on * 25;
                }
                if (global.tech['ancient_study'] && global.tech['ancient_study'] >= 2){
                    sci += templeCount(true) * 15;
                }
                let num_mass_driver_on = wiki ? (global.city?.mass_driver?.on ?? 0) : p_on['mass_driver'];
                if (global.tech.mass >= 2 && num_mass_driver_on > 0){
                    sci += highPopAdjust(num_mass_driver_on * global.civic.scientist.workers);
                }
                if (global.tech['science'] >= 21){
                    sci *= 1.45;
                }
                if (global.race['high_pop']){
                    sci = highPopAdjust(sci);
                }
                let elerium = spatialReasoning(10);

                let scientist = '';
                let lab = '';
                if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    scientist = `<div>${loc('city_wardenclyffe_effect1',[jobScale(1), global.civic.scientist.name])}</div>`;
                    sci *= 1 + (wiki ? global.space.observatory.on : support_on['observatory']) * 0.25;
                    if (global.tech.science >= 15){
                        lab = `<div>${loc('city_wardenclyffe_effect4',[2])}</div>`;
                    }
                }
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().red])}</div>${scientist}${lab}<div>${loc('space_red_exotic_lab_effect1',[+(sci).toFixed(0)])}</div><div>${loc('plus_max_resource',[elerium,global.resource.Elerium.name])}</div>`;
            },
            s_type: 'red',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('exotic_lab');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['exotic_lab','space']
                };
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
            effect(wiki){
                let bonus = global.tech['ancient_study'] ? 0.6 : 0.4;
                let num_exo_labs_on = wiki ? (global.space?.exotic_lab?.on ?? 0) : support_on['exotic_lab'];
                if (global.tech['ancient_deify'] && global.tech['ancient_deify'] >= 2 && num_exo_labs_on){
                    bonus += 0.01 * num_exo_labs_on;
                }
                if (global.civic.govern.type === 'theocracy' && global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                    let faith = 0.002;
                    if (global.race['high_pop']){
                        faith = highPopAdjust(faith);
                    }
                    bonus += faith * global.civic.priest.workers;
                }
                if (global.race['ooze']){
                    bonus *= 1 - (traits.ooze.vars()[1] / 100);
                }
                if (global.race['high_pop']){
                    bonus = highPopAdjust(bonus);
                }
                bonus = +(bonus).toFixed(2);
                let zvar = global.race['truepath'] ? [bonus,races[global.race.species].home] : [bonus];
                let desc = `<div>${loc(global.race['truepath'] ? 'space_red_ziggurat_effect_tp' : 'space_red_ziggurat_effect',zvar)}</div>`;
                if (global.tech['ancient_study'] && global.tech['ancient_study'] >= 2){
                    desc = desc + `<div>${loc('interstellar_laboratory_effect',[3])}</div>`;
                }
                if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    desc = desc + templeEffect();
                }
                if (global.genes['ancients'] && global.genes['ancients'] >= 4){
                    desc = desc + `<div>${loc('plus_max_resource',[jobScale(1),global.civic?.priest?.name || loc(`job_priest`)])}</div>`;
                }
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('ziggurat');
                    if (global.genes['ancients'] && global.genes['ancients'] >= 4){
                        global.civic.priest.display = true;
                        global.civic.priest.max += jobScale(1);
                    }
                    if (global.race['cataclysm']){
                        unlockAchieve('iron_will',false,1);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['ziggurat','space']
                };
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
                Wrought_Iron(offset){ return spaceCostMultiplier('space_barracks', offset, 12500, 1.28); },
                Horseshoe(){ return global.race['hooved'] ? 2 : 0; }
            },
            effect(wiki){
                let train = global.race['orbit_decayed'] ? actions.city.boot_camp.effect() : '';
                let oil = +fuel_adjust(2,true,wiki).toFixed(2);
                let soldiers = $(this)[0].soldiers(wiki);
                let food = global.race['cataclysm'] ? `` : `<div class="has-text-caution">${loc('space_red_space_barracks_effect3',[global.resource.Food.name])}</div>`;

                let desc = `<div>${loc('plus_max_soldiers',[soldiers])}</div>${train}`;
                if (global.race.universe === 'evil'){
                    desc += `<div>${loc('plus_max_resource',[global.race['cataclysm'] ? 2 : 1, global.resource.Authority.name])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('space_red_space_barracks_effect2',[oil])}</div>${food}`

                return desc;
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('space_barracks');
                    global.space['space_barracks'].on++;
                    return true;
                }
                return false;
            },
            soldiers(wiki){
                let soldiers = global.tech.marines >= 2 ? 4 : 2;
                if (global.race.universe === 'evil'){
                    if (!global.race['cataclysm'] && !global.race['orbit_decayed']){ soldiers--; }
                    let biodome_count = wiki ? (global.space?.biodome?.on ?? 0) : support_on['biodome'];
                    if (biodome_count){
                        soldiers += biodome_count * 0.075;
                    }
                }
                if (global.race['grenadier']){
                    soldiers /= 2;
                }
                return +(jobScale(soldiers)).toFixed(3);
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['space_barracks','space']
                };
            },
            flair(){
                return loc('space_red_space_barracks_flair');
            }
        },
        wonder_statue: {
            id: 'space-wonder_statue',
            title(){
                return loc('space_wonder_statue',[planetName().red]);
            },
            desc(){
                return loc('space_wonder_statue',[planetName().red]);
            },
            reqs: {},
            condition(){
                return global.race['wish'] && global.race['wishStats'] && global.space['wonder_statue'] ? true : false;
            },
            trait: ['wish'],
            wiki: false,
            queue_complete(){ return false; },
            effect(){
                return loc(`city_wonder_effect`,[5]);
            },
            action(args){
                return false;
            }
        },
        bonfire: buildTemplate(`bonfire`,'space'),
        horseshoe: buildTemplate(`horseshoe`,'space'),
    },
    spc_hell: {
        info: {
            name(){
                return planetName().hell;
            },
            desc(){
                return loc('space_hell_info_desc',[planetName().hell]);
            },
            zone: 'inner',
            syndicate(){ return false; }
        },
        hell_mission: {
            id: 'space-hell_mission',
            title(){
                return loc('space_mission_title',[planetName().hell]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().hell]);
            },
            reqs: { space: 3, space_explore: 3 },
            grant: ['hell',1],
            queue_complete(){ return global.tech.hell >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(6500,false,wiki).toFixed(0); }
            },
            effect(){
                return loc('space_hell_mission_effect1',[planetName().hell]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_hell_mission_action',[planetName().hell]),'info',false,['progress']);
                    initStruct(spaceProjects.spc_hell.geothermal);
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
            effect(wiki){
                let helium = +(fuel_adjust($(this)[0].p_fuel().a,true,wiki)).toFixed(2);
                let num_smelters = $(this)[0].smelting();
                let smelter = num_smelters > 0 ? `<div>${loc('interstellar_stellar_forge_effect3',[num_smelters])}</div>` : ``;
                return `${smelter}<span>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered())])}</span>, <span class="has-text-caution">${loc('space_belt_station_effect3',[helium])}</span>`;
            },
            special(){ return $(this)[0].smelting() > 0; },
            powered(){
                let power = -8;
                if (global.race['forge']){
                    power -= traits.forge.vars()[0];
                }
                if (global.stats.achieve['failed_history'] && global.stats.achieve.failed_history.l >= 5){ power -= 2; }
                return powerModifier(power);
            },
            smelting(){
                if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    return 1;
                }
                return 0;
            },
            p_fuel(){ return { r: 'Helium_3', a: 0.5 }; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('geothermal');
                    global.space['geothermal'].on++;
                    let num_smelters = $(this)[0].smelting();
                    if (num_smelters > 0){
                        addSmelter(num_smelters);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['geothermal','space']
                };
            }
        },
        hell_smelter: {
            id: 'space-hell_smelter',
            title(){
                return loc('space_hell_smelter_title',[planetName().hell]);
            },
            desc(){
                return loc('space_hell_smelter_title',[planetName().hell]);
            },
            reqs: { hell: 1, m_smelting: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('hell_smelter', offset, 250000, 1.24); },
                Adamantite(offset){ return spaceCostMultiplier('hell_smelter', offset, 15000, 1.24); }
            },
            effect(){
                return `<div>${loc('interstellar_stellar_forge_effect3',[$(this)[0].smelting()])}</div>`;
            },
            special: true,
            smelting(){
                return 2;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('hell_smelter');
                    addSmelter($(this)[0].smelting(), 'Steel');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['hell_smelter','space']
                };
            }
        },
        spc_casino: {
            id: 'space-spc_casino',
            title(){ return structName('casino'); },
            desc(){ return structName('casino'); },
            category: 'commercial',
            reqs: { hell: 1, gambling: 1 },
            condition(){
                return global.race['cataclysm'] || (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 5) ? true : false;
            },
            cost: {
                Money(offset){ return spaceCostMultiplier('spc_casino', offset, traitCostMod('untrustworthy',400000), 1.35); },
                Furs(offset){ return spaceCostMultiplier('spc_casino', offset, traitCostMod('untrustworthy',75000), 1.35); },
                Cement(offset){ return spaceCostMultiplier('spc_casino', offset, traitCostMod('untrustworthy',100000), 1.35); },
                Plywood(offset){ return spaceCostMultiplier('spc_casino', offset, traitCostMod('untrustworthy',20000), 1.35); }
            },
            effect(){
                let desc = casinoEffect();
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 2 ? 2 : 3); },
            action(args){
                if (payCosts($(this)[0])){
                    global.space.spc_casino.count++;
                    if (global.tech['theatre'] && !global.race['joyless']){
                        global.civic.entertainer.max += jobScale(1);
                        global.civic.entertainer.display = true;
                    }
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['spc_casino','space']
                };
            },
            flair: loc('city_casino_flair')
        },
        swarm_plant: {
            id: 'space-swarm_plant',
            title: loc('space_hell_swarm_plant_title'),
            desc(){
                return `<div>${loc('space_hell_swarm_plant_desc')}</div>`;
            },
            reqs: { solar: 4, hell: 1 },
            cost: {
                Money(offset, wiki){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(75000, wiki), 1.28); },
                Iron(offset, wiki){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(65000, wiki), 1.28); },
                Neutronium(offset, wiki){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(75, wiki), 1.28); },
                Brick(offset, wiki){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(2500, wiki), 1.28); },
                Mythril(offset, wiki){ return spaceCostMultiplier('swarm_plant', offset, iron_adjust(100, wiki), 1.28); }
            },
            effect(wiki){
                let reduce = global.tech['swarm'] ? 0.88 : 0.94;
                if (global.tech['swarm'] >= 3){
                    reduce -= get_qlevel(wiki) / 100;
                }
                if (reduce < 0.05){
                    reduce = 0.05;
                }
                reduce = +((1 - reduce) * 100).toFixed(2);
                return loc('space_hell_swarm_plant_effect1',[reduce]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('swarm_plant');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['swarm_plant','space']
                };
            }
        },
        firework: buildTemplate(`firework`,'space'),
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
            zone: 'inner',
            syndicate(){ return false; }
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
            queue_complete(){ return global.tech.solar >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(15000,false,wiki).toFixed(0); }
            },
            effect(){
                return loc('space_sun_mission_effect1');
            },
            action(args){
                if (payCosts($(this)[0])){
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
                Helium_3(offset,wiki){ return spaceCostMultiplier('swarm_control', offset, fuel_adjust(2000,false,wiki), 1.3); },
                Mythril(offset){ return spaceCostMultiplier('swarm_control', offset, 250, 1.3); }
            },
            effect(wiki){
                return loc('space_sun_swarm_control_effect1',[$(this)[0].support(wiki)]);
            },
            support(wiki){ return global.tech['swarm'] && global.tech['swarm'] >= 2 ? (global.tech['high_tech'] >= 11 ? 11 + Math.round(get_qlevel(wiki)) : 12) : 10; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('swarm_control');
                    global.space['swarm_control'].s_max += $(this)[0].support();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, support: 0, s_max: 0 },
                    p: ['swarm_control','space']
                };
            }
        },
        swarm_satellite: {
            id: 'space-swarm_satellite',
            title: loc('space_sun_swarm_satellite_title'),
            desc(){
                return `<div>${loc('space_sun_swarm_satellite_desc')}</div><div class="has-text-special">${loc('space_sun_swarm_satellite_desc_req')}</div>`;
            },
            reqs: { solar: 3 },
            cost: {
                Money(offset,wiki){ return spaceCostMultiplier('swarm_satellite', offset, swarm_adjust(5000,wiki), 1.1); },
                Copper(offset,wiki){ return spaceCostMultiplier('swarm_satellite', offset, swarm_adjust(2500,wiki), 1.1); },
                Iridium(offset,wiki){ return spaceCostMultiplier('swarm_satellite', offset, swarm_adjust(150,wiki), 1.1); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('swarm_satellite', offset, swarm_adjust(fuel_adjust(50,false,wiki),wiki), 1.1); }
            },
            effect(){
                let solar = 0.35;
                if (global.tech.swarm >= 4){
                    solar += 0.15 * (global.tech.swarm - 3);
                }
                if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 1){ solar += 0.15; }
                if (global.blood['illuminate']){
                    solar += 0.01 * global.blood.illuminate;
                }
                solar = +(solar).toFixed(2);
                return `<span>${loc('space_dwarf_reactor_effect1',[powerModifier(solar)])}</span>, <span class="has-text-caution">${loc('space_sun_swarm_satellite_effect1',[1])}</span>`;
            },
            support(){ return -1; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('swarm_satellite');
                    global.space['swarm_control'].support++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['swarm_satellite','space']
                };
            }
        },
        jump_gate: {
            id: 'space-jump_gate',
            title: loc('tau_jump_gate'),
            desc(wiki){
                if (!global.space.hasOwnProperty('jump_gate') || global.space.jump_gate.count < 100 || wiki){
                    return `<div>${loc('tau_jump_gate')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('tau_jump_gate')}</div>`;
                }
            },
            reqs: { tauceti: 3 },
            path: ['truepath'],
            queue_size: 10,
            queue_complete(){ return 100 - global.space.jump_gate.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.space.hasOwnProperty('jump_gate') ? global.space.jump_gate.count : 0)) < 100 ? 1000000 : 0; },
                Alloy(offset){ return ((offset || 0) + (global.space.hasOwnProperty('jump_gate') ? global.space.jump_gate.count : 0)) < 100 ? 50000 : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.space.hasOwnProperty('jump_gate') ? global.space.jump_gate.count : 0)) < 100 ? 12500 : 0; },
                Graphene(offset){ return ((offset || 0) + (global.space.hasOwnProperty('jump_gate') ? global.space.jump_gate.count : 0)) < 100 ? 42000 : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.space.hasOwnProperty('jump_gate') ? global.space.jump_gate.count : 0)) < 100 ? 35000 : 0; },
                Quantium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('jump_gate') ? global.space.jump_gate.count : 0)) < 100 ? 25000 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.space.hasOwnProperty('jump_gate') ? global.space.jump_gate.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('tau_jump_gate_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('tau_jump_gate_effect');
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.space.jump_gate.count < 100){
                        global.space.jump_gate.count++;
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['jump_gate','space']
                };
            }
        },
    },
    spc_gas: {
        info: {
            name(){
                return planetName().gas;
            },
            desc(){
                return loc('space_gas_info_desc',[planetName().gas, races[global.race.species].home]);
            },
            zone: 'outer',
            syndicate(){ return true; }
        },
        gas_mission: {
            id: 'space-gas_mission',
            title(){
                return loc('space_mission_title',[planetName().gas]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().gas]);
            },
            reqs: { space: 4, space_explore: 4 },
            grant: ['space',5],
            queue_complete(){ return global.tech.space >= 5 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(12500,false,wiki).toFixed(0); }
            },
            effect(){
                return loc('space_gas_mission_effect',[planetName().gas]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_gas_mission_action',[planetName().gas]),'info',false,['progress']);
                    global.settings.space.gas_moon = true;
                    global.settings.space.belt = true;
                    initStruct(spaceProjects.spc_belt.space_station);
                    return true;
                }
                return false;
            }
        },
        gas_mining: {
            id: 'space-gas_mining',
            title: loc('space_gas_mining_title'),
            desc(){
                return `<div>${loc('space_gas_mining_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { gas_giant: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('gas_mining', offset, 250000, 1.32); },
                Uranium(offset){ return spaceCostMultiplier('gas_mining', offset, 500, 1.32); },
                Alloy(offset){ return spaceCostMultiplier('gas_mining', offset, 10000, 1.32); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('gas_mining', offset, fuel_adjust(2500,false,wiki), 1.32); },
                Mythril(offset){ return spaceCostMultiplier('gas_mining', offset, 25, 1.32); }
            },
            effect(){
                let helium = +(production('gas_mining')).toFixed(2);
                return `<div>${loc('space_gas_mining_effect1',[helium])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(2); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('gas_mining');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['gas_mining','space']
                };
            }
        },
        gas_storage: {
            id: 'space-gas_storage',
            title(){ return loc('space_gas_storage_title',[planetName().gas]); },
            desc(){
                return `<div>${loc('space_gas_storage_desc')}</div>`;
            },
            reqs: { gas_giant: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('gas_storage', offset, 125000, 1.32); },
                Iridium(offset){ return spaceCostMultiplier('gas_storage', offset, 3000, 1.32); },
                Sheet_Metal(offset){ return spaceCostMultiplier('gas_storage', offset, 2000, 1.32); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('gas_storage', offset, fuel_adjust(1000,false,wiki), 1.32); },
            },
            effect(){
                let oil = spatialReasoning(3500) * (global.tech['world_control'] ? 1.5 : 1);
                let helium = spatialReasoning(2500) * (global.tech['world_control'] ? 1.5 : 1);
                let uranium = spatialReasoning(1000) * (global.tech['world_control'] ? 1.5 : 1);
                return `<div>${loc('plus_max_resource',[oil,global.resource.Oil.name])}</div><div>${loc('plus_max_resource',[helium,global.resource.Helium_3.name])}</div><div>${loc('plus_max_resource',[uranium,global.resource.Uranium.name])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('gas_storage');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['gas_storage','space']
                };
            }
        },
        star_dock: {
            id: 'space-star_dock',
            title(){ return loc('space_gas_star_dock_title'); },
            desc(){
                return `<div>${loc('space_gas_star_dock_title')}</div><div class="has-text-special">${loc('space_gas_star_dock_desc_req')}</div>`;
            },
            reqs: { genesis: 3 },
            queue_complete(){ return 1 - global.space.star_dock.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.space.hasOwnProperty('star_dock') ? global.space.star_dock.count : 0)) === 0 ? 1500000 : 0; },
                Steel(offset){ return ((offset || 0) + (global.space.hasOwnProperty('star_dock') ? global.space.star_dock.count : 0)) === 0 ? 500000 : 0; },
                Helium_3(offset,wiki){ return ((offset || 0) + (global.space.hasOwnProperty('star_dock') ? global.space.star_dock.count : 0)) === 0 ? Math.round(fuel_adjust(global.race['gravity_well'] ? 25000 : 10000,false,wiki)) : 0; },
                Nano_Tube(offset){ return ((offset || 0) + (global.space.hasOwnProperty('star_dock') ? global.space.star_dock.count : 0)) === 0 ? 250000 : 0; },
                Mythril(offset){ return ((offset || 0) + (global.space.hasOwnProperty('star_dock') ? global.space.star_dock.count : 0)) === 0 ? 10000 : 0; },
            },
            effect(){
                return `<div>${loc('space_gas_star_dock_effect1')}</div>`;
            },
            special: true,
            action(args){
                if (global.space.star_dock.count === 0 && payCosts($(this)[0])){
                    incrementStruct('star_dock');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0,
                        ship: 0,
                        probe: 0,
                        template: global.race.species
                    },
                    p: ['star_dock','space']
                };
            }
        },
    },
    spc_gas_moon: {
        info: {
            name(){
                return planetName().gas_moon;
            },
            desc(){
                return loc('space_gas_moon_info_desc',[planetName().gas_moon,planetName().gas]);
            },
            zone: 'outer',
            syndicate(){ return true; }
        },
        gas_moon_mission: {
            id: 'space-gas_moon_mission',
            title(){
                return loc('space_mission_title',[planetName().gas_moon]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().gas_moon]);
            },
            reqs: { space: 5 },
            grant: ['space',6],
            queue_complete(){ return global.tech.space >= 6 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(30000,false,wiki).toFixed(0); }
            },
            effect(){
                return loc('space_gas_moon_mission_effect',[planetName().gas_moon]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_gas_moon_mission_action',[planetName().gas_moon]),'info',false,['progress']);
                    initStruct(spaceProjects.spc_gas_moon.outpost);
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
                return `<div>${loc('space_gas_moon_outpost_desc')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            reqs: { gas_moon: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('outpost', offset, 666000, 1.3); },
                Titanium(offset){ return spaceCostMultiplier('outpost', offset, 18000, 1.3); },
                Iridium(offset){ return spaceCostMultiplier('outpost', offset, 2500, 1.3); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('outpost', offset, fuel_adjust(6000,false,wiki), 1.3); },
                Mythril(offset){ return spaceCostMultiplier('outpost', offset, 300, 1.3); }
            },
            effect(wiki){
                let p_values = production('outpost');
                let neutronium = p_values.b;
                let max = spatialReasoning(500);
                let oil = +(fuel_adjust(2,true,wiki)).toFixed(2);
                return `<div>${loc('space_gas_moon_outpost_effect1',[neutronium])}</div><div>${loc('plus_max_resource',[max,global.resource.Neutronium.name])}</div><div class="has-text-caution">${loc('space_gas_moon_outpost_effect3',[oil,$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(3); },
            powerBalancer(){
                return [{ r: 'Neutronium', k: 'lpmod' }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('outpost');
                    global.resource['Neutronium'].display = true;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['outpost','space']
                };
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
                let value = global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 3 ? 12 : 6;
                return `<div>${loc('space_gas_moon_drone_effect1',[value])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('drone');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['drone','space']
                };
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
                Helium_3(offset,wiki){ return spaceCostMultiplier('oil_extractor', offset, fuel_adjust(2500,false,wiki), 1.3); },
                Wrought_Iron(offset){ return spaceCostMultiplier('oil_extractor', offset, 5000, 1.3); },
            },
            effect(){
                let oil = +(production('oil_extractor')).toFixed(2);

                let desc = `<div>${loc('space_gas_moon_oil_extractor_effect1',[oil])}</div>`;
                if (global.race['blubber'] && global.city.hasOwnProperty('oil_well')){
                    let maxDead = global.city.oil_well.count + (global.space['oil_extractor'] ? global.space.oil_extractor.count : 0);
                    desc += `<div>${loc('city_oil_well_bodies',[+(global.city.oil_well.dead).toFixed(1),50 * maxDead])}</div>`;
                    desc += `<div>${loc('city_oil_well_consume',[traits.blubber.vars()[0]])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(1); },
            powerBalancer(){
                return [{ r: 'Oil', k: 'lpmod' }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('oil_extractor');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['oil_extractor','space']
                };
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
                    ? `<div>${loc('space_belt_info_desc',[planetName().red,planetName().gas])}</div><div class="has-text-special">${loc('space_belt_info_desc2')}</div>`
                    : loc('space_belt_info_desc',[planetName().red,planetName().gas]);
            },
            support: 'space_station',
            zone: 'inner',
            syndicate(){ return true; }
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
            queue_complete(){ return global.tech.asteroid >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(25000,false,wiki).toFixed(0); }
            },
            effect(){
                return loc('space_belt_mission_effect1');
            },
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_belt_mission_action'),'info',false,['progress']);
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
                return `<div>${loc('space_belt_station_desc')}</div><div class="has-text-special">${loc('requires_power_space',[global.resource.Food.name])}</div>`;
            },
            reqs: { asteroid: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('space_station', offset, 250000, 1.3); },
                Iron(offset){ return spaceCostMultiplier('space_station', offset, 85000, 1.3); },
                Polymer(offset){ return spaceCostMultiplier('space_station', offset, 18000, 1.3); },
                Iridium(offset){ return spaceCostMultiplier('space_station', offset, 2800, 1.28); },
                Helium_3(offset,wiki){ return spaceCostMultiplier('space_station', offset, fuel_adjust(2000,false,wiki), 1.3); },
                Mythril(offset){ return spaceCostMultiplier('space_station', offset, 75, 1.25); }
            },
            effect(wiki){
                let helium = +(fuel_adjust(2.5,true,wiki)).toFixed(2);
                let food = global.race['cataclysm'] ? 1 : 10;
                let elerium_cap = spatialReasoning(5);
                let elerium = global.tech['asteroid'] >= 5 ? `<div>${loc('plus_max_resource',[elerium_cap, global.resource.Elerium.name])}</div>` : '';
                if(global.race['fasting']){
                    return `<div>${loc('plus_max_resource',[jobScale(3),loc('job_space_miner')])}</div>${elerium}<div class="has-text-caution">${loc('space_belt_station_effect5',[helium,$(this)[0].powered()])}</div>`;
                }
                return `<div>${loc('plus_max_resource',[jobScale(3),loc('job_space_miner')])}</div>${elerium}<div class="has-text-caution">${loc('space_belt_station_effect3',[helium])}</div><div class="has-text-caution">${loc('space_belt_station_effect4',[food,$(this)[0].powered(),global.resource.Food.name])}</div>`;
            },
            support(){ return jobScale(3); },
            powered(){ return powerCostMod(3); },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('space_station');
                    global.civic.space_miner.display = true;
                    if (global.tech['asteroid'] < 3){
                        global.tech['asteroid'] = 3;
                    }
                    if (powerOnNewStruct($(this)[0])){
                        let hiredMax = jobScale(3);
                        global.civic.space_miner.max += hiredMax;

                        let hired = Math.min(hiredMax, global.civic[global.civic.d_job].workers);
                        global.civic[global.civic.d_job].workers -= hired;
                        global.civic.space_miner.workers += hired;
                    }
                    if (global.race['orbit_decay'] && global.race.orbit_decay > global.stats.days + 1000){
                        global.race.orbit_decay = global.stats.days + 1000;
                        messageQueue(loc('evo_challenge_orbit_decayed_accelerated',[global.race.orbit_decay - global.stats.days]),'info',false,['progress']);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['space_station','space']
                };
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
                Helium_3(offset,wiki){ return spaceCostMultiplier('elerium_ship', offset, fuel_adjust(5000,false,wiki), 1.3); }
            },
            effect(){
                let elerium = +(production('elerium_ship')).toFixed(4);
                return `<div class="has-text-caution">${loc('space_belt_elerium_ship_effect1',[jobScale(2)])}</div><div>${loc('space_belt_elerium_ship_effect2',[elerium])}</div>`;
            },
            s_type: 'belt',
            support(){ return jobScale(-2); },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('elerium_ship');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['elerium_ship','space']
                };
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
                Helium_3(offset,wiki){ return spaceCostMultiplier('iridium_ship', offset, fuel_adjust(1800,false,wiki), 1.3); }
            },
            effect(){
                let iridium = +(production('iridium_ship')).toFixed(3);
                return `<div class="has-text-caution">${loc('space_belt_iridium_ship_effect1',[jobScale(1)])}</div><div>${loc('space_belt_iridium_ship_effect2',[iridium])}</div>`;
            },
            s_type: 'belt',
            support(){ return jobScale(-1); },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('iridium_ship');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['iridium_ship','space']
                };
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
                Helium_3(offset,wiki){ return spaceCostMultiplier('iron_ship', offset, fuel_adjust(1200,false,wiki), 1.3); }
            },
            effect(){
                let iron = +(production('iron_ship')).toFixed(2);
                if (global.tech['solar'] && global.tech['solar'] >= 5){
                    return `<div class="has-text-caution">${loc('space_belt_iron_ship_effect1',[jobScale(1)])}</div><div>${loc('space_belt_iron_ship_effect2',[iron])}</div><div>${loc('space_belt_iron_ship_effect3')}</div>`;
                }
                else {
                    return `<div class="has-text-caution">${loc('space_belt_iron_ship_effect1',[jobScale(1)])}</div><div>${loc('space_belt_iron_ship_effect2',[iron])}</div>`;
                }
            },
            s_type: 'belt',
            support(){ return jobScale(-1); },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('iron_ship');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['iron_ship','space']
                };
            }
        },
    },
    spc_dwarf: {
        info: {
            name(){
                return planetName().dwarf;
            },
            desc(){
                return loc('space_dwarf_info_desc',[planetName().dwarf]);
            },
            zone: 'inner',
            syndicate(){ return false; }
        },
        dwarf_mission: {
            id: 'space-dwarf_mission',
            title(){
                return loc('space_mission_title',[planetName().dwarf]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().dwarf]);
            },
            reqs: { asteroid: 1, elerium: 1 },
            grant: ['dwarf',1],
            queue_complete(){ return global.tech.dwarf >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(45000,false,wiki).toFixed(0); }
            },
            effect(){
                return loc('space_dwarf_mission_effect1',[planetName().dwarf]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_dwarf_mission_action',[planetName().dwarf]),'info',false,['progress']);
                    initStruct(spaceProjects.spc_dwarf.elerium_contain);
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
                return `<div>${loc('plus_max_resource',[elerium,global.resource.Elerium.name])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(6); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('elerium_contain');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['elerium_contain','space']
                };
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
                let elerium = $(this)[0].p_fuel().a;
                let power = $(this)[0].powered() * -1;
                return `<div>${loc('space_dwarf_reactor_effect1',[power])}</div><div  class="has-text-caution">${loc('space_dwarf_reactor_effect2',[elerium])}</div>`;
            },
            powered(){ return powerModifier(-25); },
            p_fuel(){ return { r: 'Elerium', a: 0.05 }; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('e_reactor');
                    global.space['e_reactor'].on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['e_reactor','space']
                };
            }
        },
        world_collider: {
            id: 'space-world_collider',
            title: loc('space_dwarf_collider_title'),
            desc(wiki){
                if (!global.space.hasOwnProperty('world_collider') || global.space.world_collider.count < 1859 || wiki){
                    return `<div>${loc('space_dwarf_collider_desc')}</div><div class="has-text-special">${loc('space_dwarf_collider_desc_req')}</div>` + (global.space.hasOwnProperty('world_collider') && global.space.world_collider.count >= 1859 ? `<div class="has-text-special">${loc('requires_power')}</div>` : ``);
                }
            },
            reqs: { science: 10 },
            path: ['standard'],
            condition(){
                return global.space.world_collider.count < 1859 ? true : false;
            },
            queue_size: 100,
            queue_complete(){ return 1859 - global.space.world_collider.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.space.hasOwnProperty('world_collider') ? global.space.world_collider.count : 0)) < 1859 ? 25000 : 0; },
                Copper(offset){ return ((offset || 0) + (global.space.hasOwnProperty('world_collider') ? global.space.world_collider.count : 0)) < 1859 ? 750 : 0; },
                Alloy(offset){ return ((offset || 0) + (global.space.hasOwnProperty('world_collider') ? global.space.world_collider.count : 0)) < 1859 ? 125 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('world_collider') ? global.space.world_collider.count : 0)) < 1859 ? 12 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('world_collider') ? global.space.world_collider.count : 0)) < 1859 ? 1 : 0; },
                Mythril(offset){ return ((offset || 0) + (global.space.hasOwnProperty('world_collider') ? global.space.world_collider.count : 0)) < 1859 ? 10 : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.space.hasOwnProperty('world_collider') ? global.space.world_collider.count : 0);
                if (count < 1859){
                    let remain = 1859 - count;
                    return `<div>${loc('space_dwarf_collider_effect1')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return spaceProjects.spc_dwarf.world_controller.effect();
                }
            },
            action(args){
                if (global.space.world_collider.count < 1859 && payCosts($(this)[0])){
                    incrementStruct('world_collider');
                    if (global.space.world_collider.count >= 1859){
                        global.tech['science'] = 11;
                        initStruct(spaceProjects.spc_dwarf.world_controller);
                        incrementStruct('world_controller');
                        // Require the force power-on setting to automatically power end-of-era structs, even when power is abundant
                        if (global.settings.alwaysPower){
                            powerOnNewStruct(spaceProjects.spc_dwarf.world_controller);
                        }
                        drawTech();
                        renderSpace();
                        if (global.race['banana']){
                            let affix = universeAffix();
                            global.stats.banana.b2[affix] = true;
                            if (affix !== 'm' && affix !== 'l'){
                                global.stats.banana.b2.l = true;
                            }
                        }
                        clearPopper();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['world_collider','space']
                };
            },
            flair: loc('space_dwarf_collider_flair')
        },
        world_controller: {
            id: 'space-world_controller',
            title: loc('space_dwarf_collider_title'),
            desc(){
                return `<div>${loc('space_dwarf_collider_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            wiki: false,
            reqs: { science: 11 },
            path: ['standard'],
            condition(){
                return global.space.world_collider.count < 1859 ? false : true;
            },
            queue_complete(){ return 0; },
            cost: {},
            effect(wiki){
                let boost = 25;
                if (global.interstellar['far_reach']){
                    let num_farpoint_on = wiki ? global.interstellar.far_reach.on : p_on['far_reach'];
                    if (num_farpoint_on > 0){
                        boost += num_farpoint_on; // 1% per Farpoint
                    }
                }
                if (global.tech.science >= 19){
                    boost += 15;
                }
                return `<div>${loc('plus_max_resource',[boost+'%',global.resource.Knowledge.name])}</div><div>${loc('space_dwarf_controller_effect3')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(20); },
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['world_controller','space']
                };
            },
            flair: loc('space_dwarf_controller_flair')
        },
        shipyard: {
            id: 'space-shipyard',
            title: loc('outer_shipyard_title'),
            desc(){
                return `<div>${loc('outer_shipyard_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { shipyard: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return ((offset || 0) + (global.space.hasOwnProperty('shipyard') ? global.space.shipyard.count : 0)) < 1 ? 10000000 : 0; },
                Aluminium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('shipyard') ? global.space.shipyard.count : 0)) < 1 ? 1000000 : 0; },
                Titanium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('shipyard') ? global.space.shipyard.count : 0)) < 1 ? 650000 : 0; },
                Iridium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('shipyard') ? global.space.shipyard.count : 0)) < 1 ? 250000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('shipyard') ? global.space.shipyard.count : 0)) < 1 ? 10000 : 0; },
                Mythril(offset){ return ((offset || 0) + (global.space.hasOwnProperty('shipyard') ? global.space.shipyard.count : 0)) < 1 ? 500000 : 0; },
            },
            queue_complete(){ return 1 - global.space.shipyard.count; },
            effect(){
                return `<div>${loc('outer_shipyard_effect')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(50); },
            special: true,
            sAction(){
                if (p_on['shipyard']){
                    global.settings.civTabs = 2;
                    global.settings.govTabs = 5;
                    if (!global.settings.tabLoad){
                        loadTab('mTabCivic');
                        clearPopper(`space-shipyard`);
                    }
                }
            },
            action(args){
                if (global.space.shipyard.count < 1 && payCosts($(this)[0])){
                    incrementStruct('shipyard');
                    if (powerOnNewStruct($(this)[0])){
                        global.settings.showShipYard = true;
                    }
                    global.tech['syard_class'] = 2;
                    global.tech['syard_armor'] = 3;
                    global.tech['syard_weapon'] = 1;
                    global.tech['syard_engine'] = 2;
                    global.tech['syard_power'] = 3;
                    global.tech['syard_sensor'] = 3;
                    drawShipYard();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, ships: [], expand: true, sort: true },
                    p: ['shipyard','space']
                };
            }
        },
        mass_relay: {
            id: 'space-mass_relay',
            title: loc('space_dwarf_mass_relay_title'),
            desc(wiki){
                if (!global.space.hasOwnProperty('mass_relay') || global.space.mass_relay.count < 100 || wiki){
                    return `<div>${loc('space_dwarf_mass_relay_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
            },
            reqs: { outer: 5 },
            path: ['truepath'],
            condition(){
                return global.space.mass_relay.count < 100 ? true : false;
            },
            queue_size: 5,
            queue_complete(){ return 100 - global.space.mass_relay.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.space.hasOwnProperty('mass_relay') ? global.space.mass_relay.count : 0)) < 100 ? 10000000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('mass_relay') ? global.space.mass_relay.count : 0)) < 100 ? 7500 : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.space.hasOwnProperty('mass_relay') ? global.space.mass_relay.count : 0)) < 100 ? 18000 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('mass_relay') ? global.space.mass_relay.count : 0)) < 100 ? 125 : 0; },
                Stanene(offset){ return ((offset || 0) + (global.space.hasOwnProperty('mass_relay') ? global.space.mass_relay.count : 0)) < 100 ? 100000 : 0; },
                Quantium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('mass_relay') ? global.space.mass_relay.count : 0)) < 100 ? 25000 : 0; },
            },
            effect(wiki){
                let count = ((wiki?.count ?? 0) + (global.space.hasOwnProperty('mass_relay') ? global.space.mass_relay.count : 0));
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('space_dwarf_mass_relay_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return spaceProjects.spc_dwarf.m_relay.effect();
                }
            },
            action(args){
                if (global.space.mass_relay.count < 100 && payCosts($(this)[0])){
                    global.space.mass_relay.count++;
                    if (global.space.mass_relay.count >= 100){
                        global.tech['outer'] = 6;
                        initStruct(spaceProjects.spc_dwarf.m_relay);
                        incrementStruct('m_relay','space');
                        powerOnNewStruct(spaceProjects.spc_dwarf.m_relay);
                        drawTech();
                        renderSpace();
                        clearPopper();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['mass_relay','space']
                };
            }
        },
        m_relay: {
            id: 'space-m_relay',
            title: loc('space_dwarf_mass_relay_title'),
            desc(){
                return `<div>${loc('space_dwarf_mass_relay_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { outer: 6 },
            path: ['truepath'],
            condition(){
                return global.space.mass_relay.count >= 100 ? true : false;
            },
            wiki: false,
            queue_complete(){ return 0; },
            cost: {},
            powered(){
                return powerCostMod(100);
            },
            effect(){
                let charge = Math.floor(global.space.m_relay.charged / 10) / 10;
                return `<div>${loc('space_dwarf_mass_relay_effect2',[planetName().dwarf])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div><div>${loc('space_dwarf_mass_relay_charged',[charge])}</div>`;
            },
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, charged: 0 },
                    p: ['m_relay','space']
                };
            }
        },
    },
    spc_titan: outerTruthTech().spc_titan,
    spc_enceladus: outerTruthTech().spc_enceladus,
    spc_triton: outerTruthTech().spc_triton,
    spc_kuiper: outerTruthTech().spc_kuiper,
    spc_eris: outerTruthTech().spc_eris,
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
            queue_complete(){ return global.tech.alpha >= 1 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(40000).toFixed(0); }
            },
            effect: loc('interstellar_alpha_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('interstellar_alpha_mission_result'),'info',false,['progress']);
                    initStruct(interstellarProjects.int_nebula.nexus);
                    initStruct(interstellarProjects.int_alpha.warehouse);
                    return true;
                }
                return false;
            }
        },
        starport: {
            id: 'interstellar-starport',
            title: loc('interstellar_alpha_starport_title'),
            desc(){ return `<div>${loc('interstellar_alpha_starport_desc')}</div><div class="has-text-special">${loc('requires_power_space',[global.resource.Food.name])}</div>`; },
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
            powerBalancer(){
                return [{ s: global.interstellar.starport.s_max - global.interstellar.starport.support }];
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('starport','interstellar');
                    global.settings.space.proxima = true;
                    global.settings.space.nebula = true;
                    powerOnNewStruct($(this)[0]);
                    if (global.tech['alpha'] === 1){
                        global.tech['alpha'] = 2;
                        initStruct(interstellarProjects.int_alpha.mining_droid);
                    }
                    if (global.race['orbit_decay'] && global.race.orbit_decay > global.stats.days + 100){
                        global.race.orbit_decay = global.stats.days + 100;
                        messageQueue(loc('evo_challenge_orbit_decayed_accelerated',[global.race.orbit_decay - global.stats.days]),'info',false,['progress']);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0,
                        on: 0,
                        support: 0,
                        s_max: 0
                    },
                    p: ['starport','interstellar']
                };
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
                Adamantite(offset){ return (global.race['fasting'] && global.interstellar.habitat && global.interstellar.habitat.count < 5) ? 0 : spaceCostMultiplier('habitat', offset, 3200, 1.25, 'interstellar'); },
                Plywood(offset){ return spaceCostMultiplier('habitat', offset, 10000, 1.25, 'interstellar'); },
                Horseshoe(){ return global.race['hooved'] ? 1 : 0; }
            },
            effect(){
                let citizens = $(this)[0].citizens();
                return `<div>${loc('interstellar_alpha_starport_effect1',[$(this)[0].support()])}</div><div><span>${loc('plus_max_citizens',[citizens])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div>`;
            },
            support(){ return 1; },
            powered(){ return powerCostMod(2); },
            powerBalancer(){
                return [{ s: global.interstellar.starport.s_max - global.interstellar.starport.support }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('habitat','interstellar');
                    if (powerOnNewStruct($(this)[0])){
                        global.resource[global.race.species].max += $(this)[0].citizens();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['habitat','interstellar']
                };
            },
            citizens(){
                let pop = 1;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
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
            s_type: 'alpha',
            support(){ return -1; },
            powered(){ return 0; },
            special: true,
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('mining_droid','interstellar');
                    global.resource.Adamantite.display = true;
                    if (powerOnNewStruct($(this)[0])){
                        global.interstellar.mining_droid.adam++;
                    }
                    if (!global.tech['droids']){
                        global.tech['droids'] = 1;
                        initStruct(interstellarProjects.int_alpha.processing);
                    }
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, adam: 0, uran: 0, coal: 0, alum: 0 },
                    p: ['mining_droid','interstellar']
                };
            },
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
            effect(wiki){
                let bonus = 12;
                let num_citadels_on = wiki ? (global.interstellar?.citadel?.on ?? 0) : p_on['citadel'];
                if (global.tech['ai_core'] && global.tech['ai_core'] >= 2 && num_citadels_on > 0){
                    bonus += num_citadels_on * 2;
                }
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('interstellar_processing_effect',[bonus])}</div>`;
            },
            s_type: 'alpha',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('processing','interstellar');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['processing','interstellar']
                };
            }
        },
        fusion: {
            id: 'interstellar-fusion',
            title: loc('interstellar_fusion_title'),
            desc(){ return `<div>${loc('interstellar_fusion_title')}</div><div class="has-text-special">${loc('requires_power_support_combo',[loc('interstellar_alpha_name'),global.resource.Deuterium.name])}</div>`; },
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
            s_type: 'alpha',
            support(){ return -1; },
            powered(){ return powerModifier(-22); },
            p_fuel(){ return { r: 'Deuterium', a: 1.25 }; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('fusion','interstellar');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['fusion','interstellar']
                };
            }
        },
        laboratory: {
            id: 'interstellar-laboratory',
            title(){ return global.race.universe === 'magic' ? loc('tech_sanctum') : loc('interstellar_laboratory_title'); },
            desc: `<div>${loc(global.race.universe === 'magic' ? 'tech_sanctum' : 'interstellar_laboratory_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_alpha_name')])}</div>`,
            reqs: { science: 12 },
            cost: {
                Money(offset){ return spaceCostMultiplier('laboratory', offset, 750000, 1.28, 'interstellar'); },
                Crystal(offset){ return global.race.universe === 'magic' ? spaceCostMultiplier('laboratory', offset, 1200, 1.28, 'interstellar') : 0; },
                Titanium(offset){ return spaceCostMultiplier('laboratory', offset, 120000, 1.28, 'interstellar'); },
                Alloy(offset){ return spaceCostMultiplier('laboratory', offset, 95000, 1.28, 'interstellar'); },
                Mythril(offset){ return spaceCostMultiplier('laboratory', offset, 8500, 1.28, 'interstellar'); }
            },
            effect(wiki){
                let know = 10000;
                if (global.tech.science >= 15){
                    let num_exo_labs_on = wiki ? global.space.exotic_lab.on : support_on['exotic_lab'];
                    know *= 1 + ((global.race['cataclysm'] || global.race['orbit_decayed'] ? num_exo_labs_on : global.city.wardenclyffe.count) * 0.02);
                }
                let sg_on = isStargateOn(wiki);
                let num_tech_scavs_on = sg_on ? (wiki ? (global.galaxy?.scavenger?.on ?? 0) : gal_on['scavenger']) : 0;
                if ((global.race['cataclysm'] || global.race['orbit_decayed']) && num_tech_scavs_on > 0){
                    know *= 1 + (num_tech_scavs_on * +(piracy('gxy_alien2',false,false,wiki) * 0.75).toFixed(1));
                }
                if (global.tech['science'] >= 21){
                    know *= 1.45;
                }
                know = Math.round(know);
                let sci = '';
                if (global.tech.science >= 16){
                    sci = `<div>${loc('city_wardenclyffe_effect1',[jobScale(1), global.civic.scientist.name])}</div>`;
                }
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div>${sci}<div>${loc('city_max_knowledge',[know])}</div>`;
                if (global.tech['science'] >= 13){
                    desc = desc + `<div>${loc('interstellar_laboratory_effect',[5])}</div>`;
                }
                if (global.race.universe === 'magic'){
                    let mana = spatialReasoning(12);
                    desc = desc + `<div>${loc('plus_max_resource',[mana,global.resource.Mana.name])}</div>`;
                }
                return desc;
            },
            s_type: 'alpha',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('laboratory','interstellar');
                    if (powerOnNewStruct($(this)[0])){
                        global.resource.Knowledge.max += 10000;
                        if (global.tech.science >= 16){
                            global.civic.scientist.display = true;
                            global.civic.scientist.max += jobScale(1);
                        }
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['laboratory','interstellar']
                };
            }
        },
        exchange: {
            id: 'interstellar-exchange',
            title: loc('interstellar_exchange_title'),
            desc: `<div>${loc('interstellar_exchange_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_alpha_name')])}</div>`,
            reqs: { banking: 12 },
            cost: {
                Money(offset){ return spaceCostMultiplier('exchange', offset, traitCostMod('untrustworthy',680000), 1.28, 'interstellar'); },
                Stone(offset){ return spaceCostMultiplier('exchange', offset, traitCostMod('untrustworthy',115000), 1.28, 'interstellar'); },
                Adamantite(offset){ return spaceCostMultiplier('exchange', offset, traitCostMod('untrustworthy',55000), 1.28, 'interstellar'); },
                Graphene(offset){ return spaceCostMultiplier('exchange', offset, traitCostMod('untrustworthy',78000), 1.28, 'interstellar'); }
            },
            effect(wiki){
                let banks = global.race['cataclysm'] || global.race['orbit_decayed'] ? (wiki ? global.space.spaceport.on : p_on['spaceport']) : (global.city['bank'] ? global.city.bank.count : 0);
                let b_vault = global.race['cataclysm'] || global.race['orbit_decayed']  ? (bank_vault() * 4) : bank_vault();
                if (global.eden['eternal_bank']){ banks += global.eden.eternal_bank.count * 2; }
                let vault = spatialReasoning(global.city['bank'] ? b_vault * banks / 18 : 0);
                if (global.race['inflation']){
                    vault *= 2;
                }
                if (global.tech.banking >= 13){
                    if (global.galaxy['freighter']){
                        let num_freighter_on = wiki ? global.galaxy.freighter.on : gal_on['freighter'];
                        vault *= 1 + (num_freighter_on * 0.03);
                    }
                    if (global.galaxy['super_freighter']){
                        let num_super_freighter_on = wiki ? global.galaxy.super_freighter.on : gal_on['super_freighter'];
                        vault *= 1 + (num_super_freighter_on * 0.08);
                    }
                }
                vault = +(vault).toFixed(0);
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('plus_max_resource',[`\$${vault.toLocaleString()}`,loc('resource_Money_name')])}</div>`;
            },
            s_type: 'alpha',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('exchange','interstellar');
                    if (powerOnNewStruct($(this)[0])){
                        global.resource.Money.max += +(spatialReasoning(450000)).toFixed(0);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['exchange','interstellar']
                };
            },
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
            s_type: 'alpha',
            support(){ return -1; },
            powered(){ return 0; },
            special: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('g_factory','interstellar');
                    global.resource.Graphene.display = true;
                    if (powerOnNewStruct($(this)[0])){
                        if (global.race['kindling_kindred'] || global.race['smoldering']){
                            global.interstellar.g_factory.Oil++;
                        }
                        else {
                            global.interstellar.g_factory.Lumber++;
                        }
                    }
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, Lumber: 0, Coal: 0, Oil: 0 },
                    p: ['g_factory','interstellar']
                };
            },
        },
        int_factory: {
            id: 'interstellar-int_factory',
            title: loc('interstellar_int_factory_title'),
            desc(){ return `<div>${loc('interstellar_int_factory_title')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Deuterium.name])}</div>`; },
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
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('int_factory','interstellar');
                    if (powerOnNewStruct($(this)[0])){
                        global.city.factory.Alloy += 2;
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['int_factory','interstellar']
                };
            }
        },
        luxury_condo: {
            id: 'interstellar-luxury_condo',
            title(){
                let halloween = eventActive('halloween');
                if (halloween.active){
                    return loc(`events_halloween_condo`);
                }
                return loc('tech_luxury_condo');
            },
            desc: `<div>${loc('tech_luxury_condo')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { alpha: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('luxury_condo', offset, traitCostMod('untrustworthy',25000000), 1.25, 'interstellar'); },
                Neutronium(offset){ return spaceCostMultiplier('luxury_condo', offset, traitCostMod('untrustworthy',75000), 1.25, 'interstellar'); },
                Stanene(offset){ return spaceCostMultiplier('luxury_condo', offset, traitCostMod('untrustworthy',230000), 1.25, 'interstellar'); },
                Orichalcum(offset){ return spaceCostMultiplier('luxury_condo', offset, traitCostMod('untrustworthy',65000), 1.25, 'interstellar'); },
                Nanoweave(offset){ return spaceCostMultiplier('luxury_condo', offset, traitCostMod('untrustworthy',12500), 1.25, 'interstellar'); },
                Horseshoe(){ return global.race['hooved'] ? 2 : 0; }
            },
            effect(){
                let citizens = $(this)[0].citizens();
                let safe = spatialReasoning(750000);
                return `<div><span>${loc('plus_max_citizens',[citizens])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div><div>${loc('plus_max_resource',[`\$${safe.toLocaleString()}`,loc('resource_Money_name')])}</div>`;
            },
            powered(){ return powerCostMod(3); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('luxury_condo','interstellar');
                    if (powerOnNewStruct($(this)[0])){
                        global.resource[global.race.species].max += 2;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['luxury_condo','interstellar']
                };
            },
            citizens(){
                let pop = 2;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            }
        },
        zoo: {
            id: 'interstellar-zoo',
            title: loc('tech_zoo'),
            desc(){ return `<div>${loc('tech_zoo')}</div><div class="has-text-special">${loc('requires_power_support_combo',[loc('interstellar_alpha_name'),global.resource.Food.name])}</div>`; },
            reqs: { zoo: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('zoo', offset, 50000000, 1.24, 'interstellar'); },
                Polymer(offset){ return spaceCostMultiplier('zoo', offset, 6000000, 1.24, 'interstellar'); },
                Infernite(offset){ return spaceCostMultiplier('zoo', offset, 75000, 1.24, 'interstellar'); },
                Brick(offset){ return spaceCostMultiplier('zoo', offset, 2000000, 1.24, 'interstellar'); },
            },
            effect(){
                let morale = 5;
                let max = 2;
                let food = 12000;
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('space_red_vr_center_effect1',[morale])}</div><div>${loc('space_red_vr_center_effect2',[max])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect3',[food,global.resource.Food.name])}</div>`;
            },
            powered(){ return 0; },
            s_type: 'alpha',
            support(){ return -1; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('zoo','interstellar');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['zoo','interstellar']
                };
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
            res(){
                let r_list = ['Lumber','Stone','Chrysotile','Furs','Copper','Iron','Aluminium','Cement','Coal','Nano_Tube','Neutronium','Adamantite','Infernite'];
                if (global.tech['storage'] >= 3 && global.resource.Steel.display){
                    r_list.push('Steel');
                }
                if (global.tech['storage'] >= 4 && global.resource.Titanium.display){
                    r_list.push('Titanium');
                }
                return r_list;
            },
            val(res){
                switch (res){
                    case 'Lumber':
                        return 750;
                    case 'Stone':
                        return 750;
                    case 'Chrysotile':
                        return 750;
                    case 'Furs':
                        return 425;
                    case 'Copper':
                        return 380;
                    case 'Iron':
                        return 350;
                    case 'Aluminium':
                        return 320;
                    case 'Cement':
                        return 280;
                    case 'Coal':
                        return 120;
                    case 'Steel':
                        return 60;
                    case 'Titanium':
                        return 40;
                    case 'Nano_Tube':
                        return 30;
                    case 'Neutronium':
                        return 8;
                    case 'Adamantite':
                        return 18;
                    case 'Infernite':
                        return 5;
                    default:
                        return 0;
                }
            },
            wide: true,
            effect(wiki){
                let storage = '<div class="aTable">';
                let multiplier = storageMultipler(1, wiki);
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let val = sizeApproximation(+(spatialReasoning($(this)[0].val(res)) * multiplier).toFixed(0),1);
                        storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                storage = storage + '</div>';
                return storage;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('warehouse','interstellar');
                    let multiplier = storageMultipler();
                    for (const res of $(this)[0].res()){
                        if (global.resource[res].display){
                            global.resource[res].max += (spatialReasoning($(this)[0].val(res) * multiplier));
                        }
                    };
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['warehouse','interstellar']
                };
            }
        },
        wonder_gardens: {
            id: 'interstellar-wonder_gardens',
            title(){
                return loc('interstellar_wonder_gardens');
            },
            desc(){
                return loc('interstellar_wonder_gardens');
            },
            reqs: {},
            condition(){
                return global.race['wish'] && global.race['wishStats'] && global.interstellar['wonder_gardens'] ? true : false;
            },
            trait: ['wish'],
            wiki: false,
            queue_complete(){ return false; },
            effect(){
                return loc(`city_wonder_effect`,[5]);
            },
            action(args){
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
            queue_complete(){ return global.tech.proxima >= 1 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(42000).toFixed(0); }
            },
            effect: loc('interstellar_proxima_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    initStruct(interstellarProjects.int_proxima.xfer_station);
                    messageQueue(loc('interstellar_proxima_mission_result'),'info',false,['progress']);
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
                    det = `<div>${loc('plus_max_resource',[spatialReasoning(2000),global.resource.Deuterium.name])}</div>`;
                }
                return `<div>${loc('interstellar_alpha_starport_effect1',[$(this)[0].support()])}</div><div>${loc('plus_max_resource',[oil,global.resource.Oil.name])}</div><div>${loc('plus_max_resource',[helium,global.resource.Helium_3.name])}</div><div>${loc('plus_max_resource',[uranium,global.resource.Uranium.name])}</div>${det}<div class="has-text-caution">${loc('city_fission_power_effect',[fuel])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            support(){ return 1; },
            powered(){ return powerCostMod(1); },
            powerBalancer(){
                return [{ s: global.interstellar.starport.s_max - global.interstellar.starport.support }];
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('xfer_station','interstellar');
                    if (powerOnNewStruct($(this)[0])){
                        global['resource']['Uranium'].max += spatialReasoning(2500);
                        global['resource']['Helium_3'].max += spatialReasoning(5000);
                        global['resource']['Oil'].max += spatialReasoning(4000);
                        global['resource']['Deuterium'].max += spatialReasoning(2000);
                    }
                    if (global.tech['proxima'] === 1){
                        global.tech['proxima'] = 2;
                        initStruct(interstellarProjects.int_proxima.cargo_yard);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['xfer_station','interstellar']
                };
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
            effect(wiki){
                let containers = 50;
                let neutronium = spatialReasoning(200);
                let infernite = spatialReasoning(150);
                let desc = `<div>${loc('plus_max_resource',[containers,global.resource.Crates.name])}</div><div>${loc('plus_max_resource',[containers,global.resource.Containers.name])}</div>`;
                desc = desc + `<div>${loc('plus_max_resource',[neutronium,global.resource.Neutronium.name])}</div><div>${loc('plus_max_resource',[infernite,global.resource.Infernite.name])}</div>`;
                if (global.tech['storage'] >= 7){
                    let boost = +(get_qlevel(wiki)).toFixed(3);
                    desc = desc + `<div>${loc('interstellar_cargo_yard_effect',[boost])}</div>`;
                }
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('cargo_yard','interstellar');

                    let vol = 50;
                    global.resource.Crates.max += vol;
                    global.resource.Containers.max += vol;
                    if (!global.resource.Containers.display){
                        unlockContainers();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['cargo_yard','interstellar']
                };
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
                Horseshoe(){ return global.race['hooved'] ? 3 : 0; }
            },
            powered(){ return 0; },
            effect(){
                let helium = +int_fuel_adjust(6).toFixed(2);
                let troops = $(this)[0].soldiers();
                let desc = `<div>${loc('plus_max_soldiers',[troops])}</div>`;
                if (global.race.universe === 'evil'){
                    desc += `<div>${loc('plus_max_resource',[1,global.resource.Authority.name])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('space_belt_station_effect3',[helium])}</div>`;
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('cruiser','interstellar');
                    global.interstellar.cruiser.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['cruiser','interstellar']
                };
            },
            soldiers(){
                let soldiers = global.race['fasting'] ? 4 : 3;
                if (global.race['grenadier']){
                    soldiers--;
                }
                return jobScale(soldiers);
            }
        },
        dyson: {
            id: 'interstellar-dyson',
            title: loc('interstellar_dyson_title'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('dyson') || global.interstellar.dyson.count < 100 || wiki){
                    return `<div>${loc('interstellar_dyson_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_dyson_title')}</div>`;
                }
            },
            reqs: { proxima: 3 },
            queue_size: 10,
            queue_complete(){ return 100 - global.interstellar.dyson.count; },
            condition(){
                return global.interstellar.dyson.count >= 100 && global.tech['dyson'] ? false : true;
            },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson') ? global.interstellar.dyson.count : 0)) < 100 ? 250000 : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson') ? global.interstellar.dyson.count : 0)) < 100 ? 10000 : 0; },
                Infernite(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson') ? global.interstellar.dyson.count : 0)) < 100 ? 25 : 0; },
                Stanene(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson') ? global.interstellar.dyson.count : 0)) < 100 ? 100000 : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('dyson') ? global.interstellar.dyson.count : 0);
                if (count < 100){
                    let power = count > 0 ? `<div>${loc('space_dwarf_reactor_effect1',[powerModifier(count * 1.25)])}</div>` : ``;
                    let remain = 100 - count;
                    return `<div>${loc('interstellar_dyson_effect')}</div>${power}<div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('interstellar_dyson_complete',[powerModifier(175)]);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.dyson.count < 100){
                        incrementStruct('dyson','interstellar');
                        if (global.interstellar.dyson.count >= 100){
                            drawTech();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['dyson','interstellar']
                };
            }
        },
        dyson_sphere: {
            id: 'interstellar-dyson_sphere',
            title: loc('interstellar_dyson_sphere_title'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('dyson_sphere') || global.interstellar.dyson_sphere.count < 100 || wiki){
                    return `<div>${loc('interstellar_dyson_sphere_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_dyson_sphere_title')}</div>`;
                }
            },
            reqs: { proxima: 3, dyson: 1 },
            queue_size: 10,
            queue_complete(){ return 100 - global.interstellar.dyson_sphere.count; },
            condition(){
                return global.interstellar.dyson.count >= 100 && global.tech['dyson'] && global.tech.dyson === 1 ? true : false;
            },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson_sphere') ? global.interstellar.dyson_sphere.count : 0)) < 100 ? 5000000 : 0; },
                Bolognium(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson_sphere') ? global.interstellar.dyson_sphere.count : 0)) < 100 ? 25000 : 0; },
                Vitreloy(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson_sphere') ? global.interstellar.dyson_sphere.count : 0)) < 100 ? 1250 : 0; },
                Aerogel(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('dyson_sphere') ? global.interstellar.dyson_sphere.count : 0)) < 100 ? 75000 : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('dyson_sphere') ? global.interstellar.dyson_sphere.count : 0);
                if (count < 100){
                    let power = 175 + (count * 5);
                    let remain = 100 - count;
                    return `<div>${loc('interstellar_dyson_sphere_effect')}</div><div>${loc('space_dwarf_reactor_effect1',[powerModifier(power)])}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('interstellar_dyson_sphere_complete',[powerModifier(750)]);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.dyson_sphere.count < 100){
                        incrementStruct('dyson_sphere','interstellar');
                        if (global.interstellar.dyson_sphere.count >= 100){
                            drawTech();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['dyson_sphere','interstellar']
                };
            }
        },
        orichalcum_sphere: {
            id: 'interstellar-orichalcum_sphere',
            title: loc('interstellar_dyson_sphere_title'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('orichalcum_sphere') || global.interstellar.orichalcum_sphere.count < 100 || wiki){
                    return `<div>${loc('interstellar_orichalcum_sphere_desc')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_orichalcum_sphere_desc')}</div>`;
                }
            },
            reqs: { proxima: 3, dyson: 2 },
            queue_size: 10,
            queue_complete(){ return 100 - global.interstellar.orichalcum_sphere.count; },
            condition(){
                if ((global.tech['dyson'] ?? 0) < 2){
                    return false;
                }
                return global.interstellar.dyson_sphere.count >= 100 && (global.tech.dyson === 2 || global.interstellar.orichalcum_sphere.count < 100);
            },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('orichalcum_sphere') ? global.interstellar.orichalcum_sphere.count : 0)) < 100 ? 25000000 : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('orichalcum_sphere') ? global.interstellar.orichalcum_sphere.count : 0)) < 100 ? 75000 : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('orichalcum_sphere') ? global.interstellar.orichalcum_sphere.count : 0);
                if (count < 100){
                    let power = 750 + (count * 8);
                    let remain = 100 - count;
                    return `<div>${loc('interstellar_orichalcum_sphere_effect')}</div><div>${loc('space_dwarf_reactor_effect1',[powerModifier(power)])}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('interstellar_dyson_sphere_complete',[powerModifier(1750)]);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.orichalcum_sphere.count < 100){
                        incrementStruct('orichalcum_sphere','interstellar');
                        if (global.interstellar.orichalcum_sphere.count >= 100){
                            unlockAchieve('blacken_the_sun');
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['orichalcum_sphere','interstellar']
                };
            }
        },
        elysanite_sphere: {
            id: 'interstellar-elysanite_sphere',
            title: loc('interstellar_dyson_sphere_title'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('elysanite_sphere') || global.interstellar.elysanite_sphere.count < 1000 || wiki){
                    return `<div>${loc('interstellar_elysanite_sphere_desc')}</div><div class="has-text-special">${loc('requires_segments',[1000])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_elysanite_sphere_desc')}</div>`;
                }
            },
            reqs: { proxima: 3, dyson: 3 },
            queue_size: 50,
            queue_complete(){ return 1000 - global.interstellar.elysanite_sphere.count; },
            condition(){
                return global.interstellar.orichalcum_sphere.count >= 100 && global.tech['dyson'] && global.tech.dyson === 3 ? true : false;
            },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('elysanite_sphere') ? global.interstellar.elysanite_sphere.count : 0)) < 1000 ? 1000000000 : 0; },
                Asphodel_Powder(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('elysanite_sphere') ? global.interstellar.elysanite_sphere.count : 0)) < 1000 ? 25000 : 0; },
                Elysanite(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('elysanite_sphere') ? global.interstellar.elysanite_sphere.count : 0)) < 1000 ? 100000 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('elysanite_sphere') ? global.interstellar.elysanite_sphere.count : 0);
                if (count < 1000){
                    let power = 1750 + (count * 18);
                    let remain = 1000 - count;
                    return `<div>${loc('interstellar_elysanite_sphere_effect')}</div><div>${loc('space_dwarf_reactor_effect1',[powerModifier(power)])}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('interstellar_dyson_sphere_complete',[powerModifier(22500)]);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.elysanite_sphere.count < 1000){
                        incrementStruct('elysanite_sphere','interstellar');
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['elysanite_sphere','interstellar']
                };
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
            queue_complete(){ return global.tech.nebula >= 1 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(55000).toFixed(0); }
            },
            effect: loc('interstellar_nebula_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('interstellar_nebula_mission_result'),'info',false,['progress']);
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
                return `<div>${loc('interstellar_nexus_effect1',[$(this)[0].support()])}</div><div>${loc('plus_max_resource',[oil,global.resource.Oil.name])}</div><div>${loc('plus_max_resource',[helium,global.resource.Helium_3.name])}</div><div>${loc('plus_max_resource',[deuterium,global.resource.Deuterium.name])}</div><div>${loc('plus_max_resource',[elerium,global.resource.Elerium.name])}</div><div class="has-text-caution">${loc('interstellar_nexus_effect2',[$(this)[0].powered(),350])}</div>`;
            },
            support(){ return 2; },
            powered(){ return powerCostMod(8); },
            powerBalancer(){
                return [{ s: global.interstellar.nexus.s_max - global.interstellar.nexus.support }];
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('nexus','interstellar');
                    global.resource.Deuterium.display = true;
                    if (global.tech['nebula'] === 1){
                        initStruct(interstellarProjects.int_nebula.harvester);
                        global.tech['nebula'] = 2;
                    }
                    if (powerOnNewStruct($(this)[0])){
                        global['resource']['Oil'].max += spatialReasoning(2500);
                        global['resource']['Helium_3'].max += spatialReasoning(4000);
                        global['resource']['Deuterium'].max += spatialReasoning(3000);
                        global['resource']['Elerium'].max += spatialReasoning(25);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['nexus','interstellar']
                };
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
                let helium = +(production('harvester','helium')).toFixed(3);
                let deuterium = +(production('harvester','deuterium')).toFixed(3);
                let ram = global.tech['ram_scoop'] ? `<div>${loc('interstellar_harvester_effect',[deuterium])}</div>` : '';
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_nebula_name')])}</div><div>${loc('space_gas_mining_effect1',[helium])}</div>${ram}`;
            },
            s_type: 'nebula',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('harvester','interstellar');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['harvester','interstellar']
                };
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
                let elerium = +(production('elerium_prospector')).toFixed(3);
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_nebula_name')])}</div><div>${loc('space_belt_elerium_ship_effect2',[elerium])}</div>`;
            },
            s_type: 'nebula',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('elerium_prospector','interstellar');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['elerium_prospector','interstellar']
                };
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
            queue_complete(){ return global.tech.neutron >= 1 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(60000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(10000).toFixed(0); }
            },
            effect: loc('interstellar_neutron_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    initStruct(interstellarProjects.int_neutron.neutron_miner);
                    messageQueue(loc('interstellar_neutron_mission_result'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        neutron_miner: {
            id: 'interstellar-neutron_miner',
            title: loc('interstellar_neutron_miner_title'),
            desc(){ return `<div>${loc('interstellar_neutron_miner_desc')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Helium_3.name])}</div>`; },
            reqs: { neutron: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('neutron_miner', offset, 1000000, 1.32, 'interstellar'); },
                Titanium(offset){ return spaceCostMultiplier('neutron_miner', offset, 45000, 1.32, 'interstellar'); },
                Stanene(offset){ return spaceCostMultiplier('neutron_miner', offset, 88000, 1.32, 'interstellar'); },
                Elerium(offset){ return spaceCostMultiplier('neutron_miner', offset, 20, 1.32, 'interstellar'); },
                Aerogel(offset){ return spaceCostMultiplier('neutron_miner', offset, 50, 1.32, 'interstellar'); },
            },
            effect(){
                let neutronium = +(production('neutron_miner')).toFixed(3);
                let max_neutronium = spatialReasoning(500);
                let helium = +int_fuel_adjust(3).toFixed(2);
                return `<div>${loc('space_gas_moon_outpost_effect1',[neutronium])}</div><div>${loc('plus_max_resource',[max_neutronium,global.resource.Neutronium.name])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect2',[helium,$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(6); },
            powerBalancer(){
                return [{ r: 'Neutronium', k: 'lpmod' }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('neutron_miner','interstellar');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['neutron_miner','interstellar']
                };
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
            effect(wiki){
                let quantum_lv = get_qlevel(wiki);
                let desc = `<div class="has-text-warning">${loc('interstellar_citadel_stat',[+(quantum_lv).toFixed(1)])}</div><div>${loc('interstellar_citadel_effect',[5])}</div>`;
                if (global.tech['ai_core']){
                    let cement = +(quantum_lv / 1.75).toFixed(1);
                    if (!global.race['flier']){
                        desc = desc + `<div>${loc('interstellar_citadel_effect2',[cement])}</div>`;
                    }
                    if (global.tech['ai_core'] >= 2){
                        desc = desc + `<div>${loc('interstellar_citadel_effect3',[2])}</div>`;
                    }
                    if (global.tech['ai_core'] >= 3){
                        let graph = +(quantum_lv / 5).toFixed(1);
                        desc = desc + `<div>${loc('interstellar_citadel_effect4',[graph])}</div>`;
                    }
                    if (global.tech['ai_core'] >= 4){
                        desc = desc + `<div>${loc('interstellar_citadel_effect5',[1])}</div>`;
                    }
                }
                return `${desc}<div class="has-text-caution">${loc('interstellar_citadel_power',[$(this)[0].powered(wiki),powerCostMod(2.5)])}</div>`;
            },
            powered(wiki){
                let num_powered = wiki ? 0 : p_on['citadel'];
                if (num_powered > 1){
                    return powerCostMod(30 + ((num_powered - 1) * 2.5));
                }
                return powerCostMod(30);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('citadel','interstellar');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['citadel','interstellar']
                };
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
                let desc = `<div>${loc('city_foundry_effect1',[jobScale(2)])}</div><div>${loc('interstellar_stellar_forge_effect',[10])}</div><div>${loc('interstellar_stellar_forge_effect2',[5])}</div>`;
                let num_smelters = $(this)[0].smelting();
                if (num_smelters > 0){
                    desc += `<div>${loc('interstellar_stellar_forge_effect3',[num_smelters])}</div>`;
                }
                return `${desc}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(3); },
            special: true,
            smelting(){
                return global.tech?.star_forge >= 2 ? 2 : 0;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('stellar_forge','interstellar');
                    if (powerOnNewStruct($(this)[0])){
                        global.civic.craftsman.max += jobScale(2);
                        let num_smelters = $(this)[0].smelting();
                        if (num_smelters > 0){
                            addSmelter(num_smelters, 'Iron', 'Star');
                        }
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['stellar_forge','interstellar']
                };
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
                    let mass = +(global.interstellar.stellar_engine.mass).toFixed(10);
                    let exotic = +(global.interstellar.stellar_engine.exotic).toFixed(10);
                    if (global.tech['roid_eject']){
                        mass += 0.225 * global.tech['roid_eject'] * (1 + (global.tech['roid_eject'] / 12));
                    }
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
            queue_complete(){ return global.tech.blackhole >= 1 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(75000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(25000).toFixed(0); }
            },
            effect: loc('interstellar_blackhole_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    initStruct(interstellarProjects.int_blackhole.far_reach);
                    messageQueue(loc('interstellar_blackhole_mission_result'),'info',false,['progress']);
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
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('far_reach','interstellar');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech['blackhole'] === 1){
                        global.tech['blackhole'] = 2;
                        drawTech();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['far_reach','interstellar']
                };
            },
            flair: loc('interstellar_far_reach_flair')
        },
        stellar_engine: {
            id: 'interstellar-stellar_engine',
            title: loc('interstellar_stellar_engine'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('stellar_engine') || global.interstellar.stellar_engine.count < 100 || wiki){
                    return `<div>${loc('interstellar_stellar_engine')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_stellar_engine')}</div>`;
                }
            },
            reqs: { blackhole: 3 },
            queue_size: 10,
            queue_complete(){ return 100 - global.interstellar.stellar_engine.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0)) < 100 ? 500000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0)) < 100 ? 450 : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0)) < 100 ? 17500 : 0; },
                Infernite(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0)) < 100 ? 225 : 0; },
                Graphene(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0)) < 100 ? 45000 : 0; },
                Mythril(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0)) < 100 ? 250 : 0; },
                Aerogel(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0)) < 100 ? 75 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('stellar_engine') ? global.interstellar.stellar_engine.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('interstellar_stellar_engine_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    let output = -$(this)[0].powered();
                    if (global.tech['blackhole'] >= 5){
                        let r_mass = global.interstellar.stellar_engine.mass;
                        let exotic = global.interstellar.stellar_engine.exotic;
                        if (global.tech['roid_eject']){
                            r_mass += 0.225 * global.tech['roid_eject'] * (1 + (global.tech['roid_eject'] / 12));
                        }
                        let blackhole = exotic > 0 ? loc('interstellar_stellar_engine_effect3',[+r_mass.toFixed(10),+exotic.toFixed(10)]) : loc('interstellar_stellar_engine_effect2',[r_mass]);
                        return `<div>${loc('interstellar_stellar_engine_complete',[+output.toFixed(2)])}</div><div>${blackhole}</div>`;
                    }
                    else {
                        return loc('interstellar_stellar_engine_complete',[+output.toFixed(2)]);
                    }
                }
            },
            switchable(){ return false; },
            powered(){
                let waves = global.tech['gravity'] && global.tech['gravity'] >= 2 ? 13.5 : 7.5;
                let r_mass = global.interstellar?.stellar_engine?.mass ?? 8;
                let exotic = global.interstellar?.stellar_engine?.exotic ?? 0;
                if (global.tech['roid_eject']){
                    r_mass += 0.225 * global.tech['roid_eject'] * (1 + (global.tech['roid_eject'] / 12));
                }
                let gWell = 1 + (global.stats.achieve['escape_velocity'] && global.stats.achieve.escape_velocity['h'] ? global.stats.achieve.escape_velocity['h'] * 0.02 : 0);
                let output = powerModifier(20 + (r_mass - 8 + exotic * 10) * waves * gWell);
                if (output > 10000){
                    output = 10000 + (output - 10000) ** 0.975;
                    if (output > 20000){ output = 20000 + (output - 20000) ** 0.95; }
                    if (output > 30000){ output = 30000 + (output - 30000) ** 0.925; }
                }
                output = +output.toFixed(2);
                return -output;
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.stellar_engine.count < 100){
                        incrementStruct('stellar_engine','interstellar');
                        if (global.interstellar.stellar_engine.count >= 100 && global.tech['blackhole'] === 3){
                            global.tech['blackhole'] = 4;
                            drawTech();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, mass: 8, exotic: 0 },
                    p: ['stellar_engine','interstellar']
                };
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
            effect(wiki){
                let desc = `<div>${loc('interstellar_mass_ejector_effect')}</div>`;
                if (global.race.universe !== 'magic' && (wiki || global.stats.blackhole)){
                    let exoticEjectDone = global.interstellar?.stellar_engine?.exotic ?? 0;
                    let exoticEjectNeeded = (0.025 - exoticEjectDone) * 1e10;
                    let exoticEjectRate = (global.interstellar?.mass_ejector?.Elerium ?? 0) * atomic_mass['Elerium'];
                    exoticEjectRate += (global.interstellar?.mass_ejector?.Infernite ?? 0) * atomic_mass['Infernite'];

                    if (exoticEjectNeeded <= 0){
                        desc += `<div class="has-text-danger-pulse">${loc('interstellar_mass_ejector_reached')}</div>`;
                    }
                    else if (exoticEjectRate <= 0){
                        desc += `<div class="has-text-danger">${loc('interstellar_mass_ejector_timer',[loc('time_never')])}</div>`;
                    }
                    else {
                        let timeReq = timeFormat(Math.round(exoticEjectNeeded / exoticEjectRate));
                        desc += `<div class="has-text-caution">${loc('interstellar_mass_ejector_timer',[timeReq])}</div>`;
                    }
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(3); },
            special: true,
            sAction(){
                global.settings.civTabs = 4;
                global.settings.marketTabs = 2;
                if (!global.settings.tabLoad){
                    loadTab('mTabResource');
                    clearPopper(`interstellar-mass_ejector`);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('mass_ejector','interstellar');
                    powerOnNewStruct($(this)[0]);

                    if (global.interstellar.mass_ejector.count === 1){
                        messageQueue(loc('interstellar_mass_ejector_msg'),'info',false,['progress']);
                        global.settings.showEjector = true;
                        defineGovernor();
                    }
                    drawResourceTab('ejector');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0, on: 0, total: 0, mass: 0,
                        Food: 0, Lumber: 0,
                        Chrysotile: 0, Stone: 0,
                        Crystal: 0, Furs: 0,
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
                        Vitreloy: 0, Orichalcum: 0,
                        Plywood: 0, Brick: 0,
                        Wrought_Iron: 0, Sheet_Metal: 0,
                        Mythril: 0, Aerogel: 0,
                        Nanoweave: 0, Scarletite: 0
                    },
                    p: ['mass_ejector','interstellar']
                };
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
            queue_complete(){ return global.tech.stargate >= 2 ? 0 : 1; },
            cost: {
                Money(){ return 20000000; },
                Copper(){ return 2400000; },
                Aluminium(){ return 4000000; },
                Titanium(){ return 1250000; },
                Adamantite(){ return 750000; },
                Stanene(){ return 900000; },
                Aerogel(){ return 100000; }
            },
            effect: loc('interstellar_jump_ship_effect'),
            action(args){
                if (payCosts($(this)[0])){
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
            queue_complete(){ return global.tech.stargate >= 3 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(150000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(75000).toFixed(0); }
            },
            effect: loc('interstellar_wormhole_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    initStruct(interstellarProjects.int_blackhole.stargate);
                    initStruct(galaxyProjects.gxy_stargate.gateway_station);
                    messageQueue(loc('interstellar_wormhole_mission_result'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        stargate: {
            id: 'interstellar-stargate',
            title: loc('interstellar_stargate'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('stargate') || global.interstellar.stargate.count < 200 || wiki){
                    return `<div>${loc('interstellar_stargate')}</div><div class="has-text-special">${loc('requires_segments',[200])}</div>` + (global.interstellar.hasOwnProperty('stargate') && global.interstellar.stargate.count >= 200 ? `<div class="has-text-special">${loc('requires_power')}</div>` : ``);
                }
                else {
                    return `<div>${loc('interstellar_stargate')}</div>`;
                }
            },
            reqs: { stargate: 3 },
            condition(){
                return global.interstellar.stargate.count >= 200 ? false : true;
            },
            queue_size: 10,
            queue_complete(){ return 200 - global.interstellar.stargate.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0)) < 200 ? 1000000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0)) < 200 ? 4800 : 0; },
                Infernite(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0)) < 200 ? 666 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0)) < 200 ? 75 : 0; },
                Nano_Tube(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0)) < 200 ? 12000 : 0; },
                Stanene(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0)) < 200 ? 60000 : 0; },
                Mythril(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0)) < 200 ? 3200 : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('stargate') ? global.interstellar.stargate.count : 0);
                if (count < 200){
                    let remain = 200 - count;
                    return `<div>${loc('interstellar_stargate_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return interstellarProjects.int_blackhole.s_gate.effect();
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.stargate.count < 200){
                        incrementStruct('stargate','interstellar');
                        if (global.interstellar.stargate.count >= 200){
                            global.tech['stargate'] = 4;
                            initStruct(interstellarProjects.int_blackhole.s_gate);
                            incrementStruct('s_gate','interstellar');
                            // Require the force power-on setting to automatically power end-of-era structs, even when power is abundant
                            if (global.settings.alwaysPower){
                                powerOnNewStruct(interstellarProjects.int_blackhole.s_gate);
                            }
                            deepSpace();
                            clearPopper();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['stargate','interstellar']
                };
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
            wiki: false,
            queue_complete(){ return 0; },
            cost: {},
            powered(){
                return powerCostMod(250);
            },
            effect(){
                return `<div>${loc('interstellar_s_gate_effect')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['s_gate','interstellar']
                };
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
            queue_complete(){ return global.tech.ascension >= 3 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(480000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(225000).toFixed(0); }
            },
            effect(){ return loc('interstellar_sirius_mission_effect',[flib('name'),races[global.race.species].home]); },
            action(args){
                if (payCosts($(this)[0])){
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
            queue_complete(){ return global.tech.ascension >= 4 ? 0 : 1; },
            cost: {
                Knowledge(){ return 20000000; },
            },
            effect(){ return loc('interstellar_sirius_b_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    initStruct(interstellarProjects.int_sirius.space_elevator);
                    return true;
                }
                return false;
            }
        },
        space_elevator: {
            id: 'interstellar-space_elevator',
            title: loc('interstellar_space_elevator'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('space_elevator') || global.interstellar.space_elevator.count < 100 || wiki){
                    return `<div>${loc('interstellar_space_elevator')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_space_elevator')}</div>`;
                }
            },
            reqs: { ascension: 4 },
            condition(){
                return global.interstellar.space_elevator.count >= 100 ? false : true;
            },
            queue_size: 5,
            queue_complete(){ return 100 - global.interstellar.space_elevator.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('space_elevator') ? global.interstellar.space_elevator.count : 0)) < 100 ? 20000000 : 0; },
                Nano_Tube(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('space_elevator') ? global.interstellar.space_elevator.count : 0)) < 100 ? 500000 : 0; },
                Bolognium(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('space_elevator') ? global.interstellar.space_elevator.count : 0)) < 100 ? 100000 : 0; },
                Mythril(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('space_elevator') ? global.interstellar.space_elevator.count : 0)) < 100 ? 125000 : 0; },
            },
            effect(wiki){
                let effectText = `<div>${loc('interstellar_space_elevator_effect')}</div>`;
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('space_elevator') ? global.interstellar.space_elevator.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    effectText += `<div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                return effectText;
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.space_elevator.count < 100){
                        incrementStruct('space_elevator','interstellar');
                        if (global.interstellar.space_elevator.count >= 100){
                            global.tech['ascension'] = 5;
                            initStruct(interstellarProjects.int_sirius.gravity_dome);
                            deepSpace();
                            clearPopper();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['space_elevator','interstellar']
                };
            }
        },
        gravity_dome: {
            id: 'interstellar-gravity_dome',
            title: loc('interstellar_gravity_dome'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('gravity_dome') || global.interstellar.gravity_dome.count < 100 || wiki){
                    return `<div>${loc('interstellar_gravity_dome')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('interstellar_gravity_dome')}</div>`;
                }
            },
            reqs: { ascension: 5 },
            condition(){
                return global.interstellar.gravity_dome.count >= 100 ? false : true;
            },
            queue_size: 5,
            queue_complete(){ return 100 - global.interstellar.gravity_dome.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('gravity_dome') ? global.interstellar.gravity_dome.count : 0)) < 100 ? 35000000 : 0; },
                Cement(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('gravity_dome') ? global.interstellar.gravity_dome.count : 0)) < 100 ? 1250000 : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('gravity_dome') ? global.interstellar.gravity_dome.count : 0)) < 100 ? 650000 : 0; },
                Aerogel(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('gravity_dome') ? global.interstellar.gravity_dome.count : 0)) < 100 ? 180000 : 0; },
            },
            effect(wiki){
                let effectText = `<div>${loc('interstellar_gravity_dome_effect',[races[global.race.species].home])}</div>`;
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('gravity_dome') ? global.interstellar.gravity_dome.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    effectText += `<div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                return effectText;
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.gravity_dome.count < 100){
                        incrementStruct('gravity_dome','interstellar');
                        if (global.interstellar.gravity_dome.count >= 100){
                            global.tech['ascension'] = 6;
                            initStruct(interstellarProjects.int_sirius.ascension_machine);
                            initStruct(interstellarProjects.int_sirius.thermal_collector);
                            deepSpace();
                            clearPopper();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['gravity_dome','interstellar']
                };
            }
        },
        ascension_machine: {
            id: 'interstellar-ascension_machine',
            title: loc('interstellar_ascension_machine'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('ascension_machine') || global.interstellar.ascension_machine.count < 100 || wiki){
                    return `<div>${loc('interstellar_ascension_machine')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>` + (global.interstellar.hasOwnProperty('ascension_machine') && global.interstellar.ascension_machine.count >= 100 ? `<div class="has-text-special">${loc('requires_power')}</div>` : ``);
                }
                else {
                    return `<div>${loc('interstellar_ascension_machine')}</div>`;
                }
            },
            reqs: { ascension: 6 },
            condition(){
                return global.interstellar.ascension_machine.count >= 100 ? false : true;
            },
            queue_size: 5,
            queue_complete(){ return 100 - global.interstellar.ascension_machine.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('ascension_machine') ? global.interstellar.ascension_machine.count : 0)) < 100 ? 75000000 : 0; },
                Alloy(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('ascension_machine') ? global.interstellar.ascension_machine.count : 0)) < 100 ? 750000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('ascension_machine') ? global.interstellar.ascension_machine.count : 0)) < 100 ? 125000 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('ascension_machine') ? global.interstellar.ascension_machine.count : 0)) < 100 ? 1000 : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('ascension_machine') ? global.interstellar.ascension_machine.count : 0)) < 100 ? 250000 : 0; },
                Nanoweave(offset){ return ((offset || 0) + (global.interstellar.hasOwnProperty('ascension_machine') ? global.interstellar.ascension_machine.count : 0)) < 100 ? 75000 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.interstellar.hasOwnProperty('ascension_machine') ? global.interstellar.ascension_machine.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('interstellar_ascension_machine_effect',[flib('name')])}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return interstellarProjects.int_sirius.ascension_trigger.effect();
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.interstellar.ascension_machine.count < 100){
                        incrementStruct('ascension_machine','interstellar');
                        if (global.interstellar.ascension_machine.count >= 100){
                            global.tech['ascension'] = 7;
                            initStruct(interstellarProjects.int_sirius.ascension_trigger);
                            incrementStruct('ascension_trigger','interstellar');
                            if (global.settings.alwaysPower){
                                powerOnNewStruct(interstellarProjects.int_sirius.ascension_trigger);
                            }
                            deepSpace();
                            clearPopper();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['ascension_machine','interstellar']
                };
            }
        },
        ascension_trigger: {
            id: 'interstellar-ascension_trigger',
            title: loc('interstellar_ascension_machine'),
            desc(){ return `<div>${loc('interstellar_ascension_machine')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            wiki: false,
            reqs: { ascension: 7 },
            condition(){
                return global.interstellar.ascension_machine.count >= 100 ? true : false;
            },
            queue_complete(){ return 0; },
            cost: {},
            powered(){
                let power = $(this)[0].heatSink();
                if (power < 0){
                    power = 0;
                }
                return power;
            },
            heatSink(){
                let heatsink = 100;
                if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 2){
                    heatsink += global.stats.achieve.technophobe.l >= 4 ? 25 : 10;
                    for (let i=1; i<universe_affixes.length; i++){
                        if (global.stats.achieve.technophobe[universe_affixes[i]] && global.stats.achieve.technophobe[universe_affixes[i]] >= 5){
                            heatsink += 5;
                        }
                    }
                }
                let power = Math.round(powerCostMod(10000) - (heatsink * (global.interstellar.hasOwnProperty('thermal_collector') ? global.interstellar.thermal_collector.count : 0)));
                return power;
            },
            special(){ return global.tech['science'] && global.tech.science >= 24 ? true : false; },
            sAction(){
                global.eden.encampment.asc = global.eden.encampment.asc ? false : true;
                deepSpace();
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
                if (global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
                    let heatSink = $(this)[0].heatSink();
                    heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;

                    let omniscience = 150 + (heatSink ** 0.95 / 10);
                    let desc = `<div>${loc(`eden_ascension_machine_effect1`,[loc(`eden_encampment_title`),+omniscience.toFixed(0),global.resource.Omniscience.name])}</div>`;
                    if (heatSink > 0){
                        let stabilizer = heatSink / 175;
                        desc += `<div>${loc(`eden_ascension_machine_effect2`,[loc(`eden_stabilizer_title`),+stabilizer.toFixed(2)])}</div>`;

                        let ghost = heatSink / 125;
                        desc += `<div>${loc(`eden_ascension_machine_effect2`,[loc(`job_ghost_trapper`),+ghost.toFixed(2)])}</div>`;
                    }
                    
                    return desc;
                }
                else {
                    let reward = astrialProjection();
                    let power = $(this)[0].powered();
                    let power_label = power > 0 ? `<div class="has-text-caution">${loc('minus_power',[power])}</div>` : '';
                    return `<div>${loc('interstellar_ascension_trigger_effect')}</div>${reward}${power_label}`;
                }
            },
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['ascension_trigger','interstellar']
                };
            }
        },
        ascend: {
            id: 'interstellar-ascend',
            title: loc('interstellar_ascend'),
            desc: loc('interstellar_ascend'),
            reqs: { ascension: 8 },
            condition(){
                return !global.eden.hasOwnProperty('encampment') || !global.eden.encampment.asc;
            },
            queue_complete(){ return 0; },
            no_multi: true,
            cost: {},
            effect(){
                let reward = astrialProjection();
                return `<div>${loc('interstellar_ascend_effect')}</div>${reward}`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    ascendLab(false);
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
                    for (let i=1; i<universe_affixes.length; i++){
                        if (global.stats.achieve.technophobe[universe_affixes[i]] && global.stats.achieve.technophobe[universe_affixes[i]] >= 5){
                            heatsink += 5;
                        }
                    }
                }
                return loc('interstellar_thermal_collector_effect',[heatsink]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('thermal_collector','interstellar');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['thermal_collector','interstellar']
                };
            }
        },
    }
};

export function astrialProjection(){
    let gains = calcPrestige('ascend');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    return `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.phage,loc('resource_Phage_name')])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.harmony,loc('resource_Harmony_name')])}</div><div>${loc('interstellar_ascension_trigger_effect3')}</div>`;
}

function terraformProjection(){
    let gains = calcPrestige('terraform');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    return `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.phage,loc('resource_Phage_name')])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.harmony,loc('resource_Harmony_name')])}</div><div>${loc('space_terraformer_effect3')}</div>`;
}

const galaxyProjects = {
    gxy_gateway: {
        info: {
            name: loc('galaxy_gateway'),
            desc(){ return loc('galaxy_gateway_desc'); },
            control(){
                return {
                    name: flib('name'),
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
            queue_complete(){ return global.tech.gateway >= 2 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(212000).toFixed(0); },
                Deuterium(){ return +int_fuel_adjust(110000).toFixed(0); }
            },
            effect: loc('galaxy_gateway_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
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
            desc(){ return `<div>${loc('galaxy_starbase')}</div><div class="has-text-special">${loc('requires_power_space',[global.resource.Food.name])}</div>`; },
            reqs: { gateway: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('starbase', offset, 4200000, 1.25, 'galaxy'); },
                Elerium(offset){ return spaceCostMultiplier('starbase', offset, 1000, 1.25, 'galaxy'); },
                Mythril(offset){ return spaceCostMultiplier('starbase', offset, 90000, 1.25, 'galaxy'); },
                Graphene(offset){ return spaceCostMultiplier('starbase', offset, 320000, 1.25, 'galaxy'); },
                Horseshoe(){ return global.race['hooved'] ? 5 : 0; }
            },
            effect(wiki){
                let helium = +(int_fuel_adjust(25)).toFixed(2);
                let food = 250;
                let soldiers = $(this)[0].soldiers();
                return `<div class="has-text-advanced">${loc('galaxy_defense_platform_effect',[25])}</div><div>${loc('galaxy_gateway_support',[$(this)[0].support()])}</div><div>${loc('plus_max_soldiers',[soldiers])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect2',[helium,$(this)[0].powered(wiki)])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect3',[food,global.resource.Food.name])}</div>`;
            },
            support(){ return 2; },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 12 : 0); },
            powerBalancer(){
                return [{ s: global.galaxy.starbase.s_max - global.galaxy.starbase.support }];
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('starbase','galaxy');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech['gateway'] === 2){
                        initStruct(galaxyProjects.gxy_gateway.bolognium_ship);
                        global.tech['gateway'] = 3;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['starbase','galaxy']
                };
            },
            soldiers(){
                let soldiers = global.tech.marines >= 2 ? (global.race['grenadier'] ? 5 : 8) : (global.race['grenadier'] ? 3 : 5);
                return jobScale(soldiers);
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
            effect(wiki){
                if(global.race['fasting']){
                    return `<div>${loc('galaxy_ship_dock_effect_fasting',[0.1])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
                }
                return `<div>${loc('galaxy_ship_dock_effect',[0.25])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
            },
            support(wiki){
                if(global.race['fasting']){
                    let num_gateways_on = wiki ? global.galaxy.gateway_station.on : p_on['gateway_station'];
                    return num_gateways_on ? 0.1 * num_gateways_on : 0;
                }
                else {
                    let num_starbases_on = wiki ? global.galaxy.starbase.on : p_on['starbase'];
                    return num_starbases_on ? 0.25 * num_starbases_on : 0;
                }
            },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 4 : 0); },
            powerBalancer(){
                if(global.race['fasting']){
                    return [{ s: global.galaxy.gateway_station.s_max - global.galaxy.gateway_station.support }];
                }
                return [{ s: global.galaxy.starbase.s_max - global.galaxy.starbase.support }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('ship_dock','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['ship_dock','galaxy']
                };
            }
        },
        bolognium_ship: {
            id: 'galaxy-bolognium_ship',
            title: loc('galaxy_bolognium_ship'),
            desc(){
                return `<div>${loc('galaxy_bolognium_ship_desc')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[global.resource.Helium_3.name])}</div>`;
            },
            reqs: { gateway: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('bolognium_ship', offset, 1400000, 1.22, 'galaxy'); },
                Iron(offset){ return spaceCostMultiplier('bolognium_ship', offset, 560000, 1.22, 'galaxy'); },
                Infernite(offset){ return spaceCostMultiplier('bolognium_ship', offset, 1800, 1.22, 'galaxy'); },
                Nano_Tube(offset){ return spaceCostMultiplier('bolognium_ship', offset, 475000, 1.22, 'galaxy'); },
            },
            effect(){
                let bolognium = +(production('bolognium_ship')).toFixed(3);
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                return `<div>${loc('gain',[bolognium,global.resource.Bolognium.name])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            s_type: 'gateway',
            support(){ return -1; },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 2 : 2; },
                mil(){ return 0; },
                helium: 5
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('bolognium_ship','galaxy');
                    global.resource.Bolognium.display = true;
                    global.civic.crew.display = true;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0 },
                    p: ['bolognium_ship','galaxy']
                };
            }
        },
        scout_ship: {
            id: 'galaxy-scout_ship',
            title: loc('galaxy_scout_ship'),
            desc(){
                return `<div>${loc('galaxy_scout_ship')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[global.resource.Helium_3.name])}</div>`;
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
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating()])}</div><div>${loc('galaxy_scout_ship_effect')}</div>${sensors}<div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            s_type: 'gateway',
            support(){ return -1; },
            ship: {
                civ(){ return global.race['grenadier'] ? 0 : global.race['high_pop'] ? traits.high_pop.vars()[0] * 1 : 1; },
                mil(){
                    let base = global.race['high_pop'] ? traits.high_pop.vars()[0] * 1 : 1;
                    return global.race['grenadier'] ? Math.ceil(base / 2) : base;
                },
                helium: 6,
                rating(){ 
                    let rating = global.race['banana'] ? 7 : 10; 
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 1 : 5;
                    }
                    return rating;
                }
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('scout_ship','galaxy');
                    global.galaxy.defense.gxy_gateway.scout_ship++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['scout_ship','galaxy']
                };
            }
        },
        corvette_ship: {
            id: 'galaxy-corvette_ship',
            title: loc('galaxy_corvette_ship'),
            desc(){
                return `<div>${loc('galaxy_corvette_ship')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[global.resource.Helium_3.name])}</div>`;
            },
            reqs: { andromeda: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('corvette_ship', offset, 4500000, 1.25, 'galaxy'); },
                Steel(offset){ return spaceCostMultiplier('corvette_ship', offset, 1750000, 1.25, 'galaxy'); },
                Infernite(offset){ return spaceCostMultiplier('corvette_ship', offset, 16000, 1.25, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('corvette_ship', offset, 35000, 1.25, 'galaxy'); },
                Soul_Gem(offset){ return spaceCostMultiplier('corvette_ship', offset, 1, 1.25, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating()])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            s_type: 'gateway',
            support(){ return -1; },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 2 : 2; },
                mil(){
                    let base = global.race['grenadier'] ? 2 : 3;
                    return global.race['high_pop'] ? traits.high_pop.vars()[0] * base : base;
                },
                helium: 10,
                rating(){ 
                    let rating = global.race['banana'] ? 21 : 30; 
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 4 : 10;
                    }
                    return rating;
                }
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('corvette_ship','galaxy');
                    global.galaxy.defense.gxy_gateway.corvette_ship++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['corvette_ship','galaxy']
                };
            }
        },
        frigate_ship: {
            id: 'galaxy-frigate_ship',
            title: loc('galaxy_frigate_ship'),
            desc(){
                return `<div>${loc('galaxy_frigate_ship')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[global.resource.Helium_3.name])}</div>`;
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
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating()])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            s_type: 'gateway',
            support(){ return -2; },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 3 : 3; },
                mil(){
                    let base = global.race['grenadier'] ? 3 : 5;
                    return global.race['high_pop'] ? traits.high_pop.vars()[0] * base : base;
                },
                helium: 25,
                rating(){ 
                    let rating = global.race['banana'] ? 56 : 80;
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 14 : 20;
                    }
                    return rating;
                }
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('frigate_ship','galaxy');
                    global.galaxy.defense.gxy_gateway.frigate_ship++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['frigate_ship','galaxy']
                };
            },
            flair: loc('tech_frigate_ship_flair')
        },
        cruiser_ship: {
            id: 'galaxy-cruiser_ship',
            title: loc('galaxy_cruiser_ship'),
            desc(){
                return `<div>${loc('galaxy_cruiser_ship')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[global.resource.Deuterium.name])}</div>`;
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
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating()])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[deuterium,global.resource.Deuterium.name])}</div>`;
            },
            s_type: 'gateway',
            support(){ return -3; },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 6 : 6; },
                mil(){
                    let base = global.race['grenadier'] ? 6 : 10;
                    return global.race['high_pop'] ? traits.high_pop.vars()[0] * base : base;
                },
                deuterium: 25,
                rating(){ 
                    let rating = global.race['banana'] ? 175 : 250;
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 25 : 50;
                    }
                    return rating;
                }
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('cruiser_ship','galaxy');
                    global.galaxy.defense.gxy_gateway.cruiser_ship++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['cruiser_ship','galaxy']
                };
            },
        },
        dreadnought: {
            id: 'galaxy-dreadnought',
            title: loc('galaxy_dreadnought'),
            desc(){
                return `<div>${loc('galaxy_dreadnought')}</div><div class="has-text-special">${loc('galaxy_starbase_support',[global.resource.Deuterium.name])}</div>`;
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
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating()])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('galaxy_gateway_used_support',[-($(this)[0].support())])}</div><div class="has-text-caution">${loc('spend',[deuterium,global.resource.Deuterium.name])}</div>`;
            },
            s_type: 'gateway',
            support(){ return -5; },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 10 : 10; },
                mil(){
                    let base = global.race['grenadier'] ? 12 : 20;
                    return global.race['high_pop'] ? traits.high_pop.vars()[0] * base : base;
                },
                deuterium: 80,
                rating(){ 
                    let rating = global.race['banana'] ? 1260 : 1800;
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 140 : 200;
                    }
                    return rating;
                }
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('dreadnought','galaxy');
                    global.galaxy.defense.gxy_gateway.dreadnought++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['dreadnought','galaxy']
                };
            },
        },
    },
    gxy_stargate: {
        info: {
            name: loc('galaxy_stargate'),
            desc(){ return global.tech['piracy'] ? loc('galaxy_stargate_desc_alt') : loc('galaxy_stargate_desc'); },
            control(){
                return {
                    name: flib('name'),
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
            effect(wiki){
                let helium = spatialReasoning(2000);
                let deuterium = spatialReasoning(4500);
                let elerium = spatialReasoning(50);
                let gateway = '';
                if (global.tech['gateway'] && global.tech['gateway'] >= 2){
                    gateway = `<div>${loc('galaxy_gateway_support',[$(this)[0].support()])}</div>`;
                }
                return `${gateway}<div>${loc('plus_max_resource',[helium,global.resource.Helium_3.name])}</div><div>${loc('plus_max_resource',[deuterium,global.resource.Deuterium.name])}</div><div>${loc('plus_max_resource',[elerium,global.resource.Elerium.name])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
            },
            support(){ return 0.5; },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 4 : 0); },
            powerBalancer(){
                return global.galaxy.hasOwnProperty('starbase') ? [{ s: global.galaxy.starbase.s_max - global.galaxy.starbase.support }] : false;
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('gateway_station','galaxy');
                    global['resource']['Helium_3'].max += spatialReasoning(2000);
                    global['resource']['Deuterium'].max += spatialReasoning(4500);
                    if (global.tech['stargate'] === 4){
                        initStruct(galaxyProjects.gxy_stargate.telemetry_beacon);
                        global.tech['stargate'] = 5;
                    }
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['gateway_station','galaxy']
                };
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
            effect(wiki){
                let base = global.tech['telemetry'] ? 1200 : 800;
                if (global.tech.science >= 17){
                    let num_scout_ship_on = wiki ? (global.galaxy?.scout_ship?.on ?? 0) : gal_on['scout_ship'];
                    base += num_scout_ship_on * 25;
                }
                let num_telemetry_on = wiki ? (global.galaxy?.telemetry_beacon?.on ?? 0) : p_on['telemetry_beacon'];
                let know = num_telemetry_on ? base * num_telemetry_on : 0;
                let gateway = '';
                if (global.tech['gateway'] && global.tech['gateway'] >= 2){
                    gateway = `<div>${loc('galaxy_gateway_support',[$(this)[0].support()])}</div>`;
                }
                return `${gateway}<div>${loc('galaxy_telemetry_beacon_effect1',[base])}</div><div>${loc('galaxy_telemetry_beacon_effect2',[know])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
            },
            support(){ return global.tech['telemetry'] ? 0.75 : 0.5; },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 4 : 0); },
            powerBalancer(){
                return global.galaxy.hasOwnProperty('starbase') ? [{ s: global.galaxy.starbase.s_max - global.galaxy.starbase.support }] : false;
            },
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
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('telemetry_beacon','galaxy');
                    if (powerOnNewStruct($(this)[0])){
                        global['resource']['Knowledge'].max += 1750;
                    }
                    if (!global.tech['gateway']){
                        initStruct(galaxyProjects.gxy_gateway.starbase);
                        global.settings.space.gateway = true;
                        global.tech['gateway'] = 1;
                        galaxySpace();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['telemetry_beacon','galaxy']
                };
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
            effect(wiki){
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
                return `${desc}<div>${loc('galaxy_gateway_depot_effect',[elerium,global.resource.Elerium.name])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
            },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 10 : 0); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('gateway_depot','galaxy');

                    let containers = global.tech['world_control'] ? 150 : 100;
                    global.resource.Crates.max += containers;
                    global.resource.Containers.max += containers;
                    if (!global.resource.Containers.display){
                        unlockContainers();
                    }

                    let multiplier = gatewayStorage();
                    global['resource']['Uranium'].max += (spatialReasoning(3000 * multiplier));
                    global['resource']['Nano_Tube'].max += (spatialReasoning(250000 * multiplier));
                    global['resource']['Neutronium'].max += (spatialReasoning(9001 * multiplier));
                    global['resource']['Infernite'].max += (spatialReasoning(6660 * multiplier));
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['gateway_depot','galaxy']
                };
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
            effect(wiki){
                return `<div class="has-text-advanced">${loc('galaxy_defense_platform_effect',[20])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
            },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 5 : 0); },
            postPower(o){
                vBind({el: `#gxy_stargate`},'update');
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('defense_platform','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['defense_platform','galaxy']
                };
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
            id: 'galaxy-gorddon_mission',
            title: loc('galaxy_gorddon_mission'),
            desc: loc('galaxy_gorddon_mission_desc'),
            reqs: { xeno: 2 },
            grant: ['xeno',3],
            queue_complete(){ return global.tech.xeno >= 3 ? 0 : 1; },
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
            action(args){
                if (payCosts($(this)[0])){
                    xeno_race();
                    global.galaxy.defense.gxy_gateway.scout_ship -= 2;
                    global.galaxy.defense.gxy_gorddon.scout_ship += 2;
                    global.galaxy.defense.gxy_gateway.corvette_ship--;
                    global.galaxy.defense.gxy_gorddon.corvette_ship++;
                    let s1name = races[global.galaxy.alien1.id].name;
                    let s1desc = races[global.galaxy.alien1.id].entity;
                    let s2name = races[global.galaxy.alien2.id].name;
                    let s2desc = races[global.galaxy.alien2.id].entity;
                    messageQueue(loc('galaxy_gorddon_mission_result',[s1desc,s1name,s2desc,s2name]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        embassy: {
            id: 'galaxy-embassy',
            title: loc('galaxy_embassy'),
            desc(){ return `<div>${loc('galaxy_embassy')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Food.name])}</div>`; },
            reqs: { xeno: 4 },
            queue_complete(){ return 1 - global.galaxy.embassy.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('embassy') ? global.galaxy.embassy.count : 0)) < 1 ? 30000000 : 0; },
                Lumber(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('embassy') ? global.galaxy.embassy.count : 0)) < 1 ? 38000000 : 0; },
                Stone(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('embassy') ? global.galaxy.embassy.count : 0)) < 1 ? 32000000 : 0; },
                Furs(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('embassy') ? global.galaxy.embassy.count : 0)) < 1 ? 18000000 : 0; },
                Wrought_Iron(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('embassy') ? global.galaxy.embassy.count : 0)) < 1 ? 6000000 : 0; }
            },
            effect(wiki){
                let food = 7500;
                let housing = '';
                if (global.tech.xeno >= 11){
                    housing = `<div>${loc('plus_max_citizens',[$(this)[0].citizens()])}</div>`;
                }
                let foodDesc = '';
                if(!global.race['fasting']){
                    foodDesc = `<div class="has-text-caution">${loc('interstellar_alpha_starport_effect3',[food,global.resource.Food.name])}</div>`;
                }
                return `<div>${loc('galaxy_embassy_effect',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name])}</div>${housing}${foodDesc}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
            },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 25 : 0); },
            refresh: true,
            action(args){
                if (global.galaxy.embassy.count < 1 && payCosts($(this)[0])){
                    incrementStruct('embassy','galaxy');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech['xeno'] === 4){
                        global.tech['xeno'] = 5;
                        initStruct(galaxyProjects.gxy_gorddon.freighter);
                        global.galaxy['trade'] = { max: 0, cur: 0, f0: 0, f1: 0, f2: 0, f3: 0, f4: 0, f5: 0, f6: 0, f7: 0, f8: 0 };
                        drawResourceTab('market');
                        messageQueue(loc('galaxy_embassy_complete',[races[global.galaxy.alien1.id].name,races[global.galaxy.alien2.id].name]),'info',false,['progress']);
                    }
                    if (global.race['fasting']){
                        let affix = universeAffix();
                        global.stats['endless_hunger'].b1[affix] = true;
                        if (affix !== 'm' && affix !== 'l'){
                            global.stats['endless_hunger'].b1.l = true;
                        }
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['embassy','galaxy']
                };
            },
            citizens(){
                let pop = 20;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            }
        },
        dormitory: {
            id: 'galaxy-dormitory',
            title(){ return structName('dormitory'); },
            desc(){
                return `<div>${structName('dormitory')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { xeno: 6 },
            cost: {
                Money(offset){ return spaceCostMultiplier('dormitory', offset, 10000000, 1.25, 'galaxy'); },
                Furs(offset){ return spaceCostMultiplier('dormitory', offset, 700000, 1.25, 'galaxy'); },
                Cement(offset){ return spaceCostMultiplier('dormitory', offset, 1200000, 1.25, 'galaxy'); },
                Plywood(offset){ return spaceCostMultiplier('dormitory', offset, 85000, 1.25, 'galaxy'); },
                Horseshoe(){ return global.race['hooved'] ? 3 : 0; }
            },
            effect(){
                return `<div class="has-text-caution">${loc(`requires_res`,[loc('galaxy_embassy')])}</div><div>${loc('plus_max_citizens',[$(this)[0].citizens()])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(3); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('dormitory','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['dormitory','galaxy']
                };
            },
            citizens(){
                let pop = 3;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
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
                Food(offset){ return global.race['ravenous'] ? 0 : spaceCostMultiplier('symposium', offset, global.race['artifical'] ? 45000 : 125000, 1.25, 'galaxy'); },
                Lumber(offset){ return spaceCostMultiplier('symposium', offset, 460000, 1.25, 'galaxy'); },
                Brick(offset){ return spaceCostMultiplier('symposium', offset, 261600, 1.25, 'galaxy'); },
            },
            effect(wiki){
                let pirate = piracy('gxy_gorddon',false,false,wiki);
                let desc = `<div class="has-text-caution">${loc(`requires_res`,[loc('galaxy_embassy')])}</div>`;
                desc += `<div>${loc('galaxy_symposium_effect',[(1750 * pirate).toFixed(0)])}</div>`;
                desc += `<div>${loc('galaxy_symposium_effect2',[(650 * pirate).toFixed(0)])}</div>`;
                if (global.tech.xeno >= 7){
                    desc += `<div>${loc('galaxy_symposium_effect3',[+highPopAdjust(300 * pirate).toFixed(2)])}</div>`;
                    desc += `<div>${loc('galaxy_symposium_effect3b',[+highPopAdjust(100 * pirate).toFixed(2)])}</div>`;
                }
                if(global.tech.science >= 22){
                    desc += `<div>${loc('galaxy_symposium_effect4',[+(100 * pirate).toFixed(2), loc('eden_research_station_title')])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`
                return desc;
            },
            powered(){ return powerCostMod(4); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('symposium','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['symposium','galaxy']
                };
            },
        },
        freighter: {
            id: 'galaxy-freighter',
            title: loc('galaxy_freighter'),
            desc(){
                return `<div>${loc('galaxy_freighter')}</div><div class="has-text-special">${loc('galaxy_crew_fuel',[global.resource.Helium_3.name])}</div>`;
            },
            reqs: { xeno: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('freighter', offset, 6000000, 1.2, 'galaxy'); },
                Uranium(offset){ return spaceCostMultiplier('freighter', offset, 10000, 1.2, 'galaxy'); },
                Adamantite(offset){ return spaceCostMultiplier('freighter', offset, 460000, 1.2, 'galaxy'); },
                Stanene(offset){ return spaceCostMultiplier('freighter', offset, 261600, 1.2, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('freighter', offset, 66000, 1.2, 'galaxy'); },
            },
            effect(){
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                let bank = '';
                if (global.tech.banking >= 13){
                    bank = `<div>${loc('interstellar_exchange_boost',[3])}</div>`;
                }
                return `<div class="has-text-caution">${loc(`requires_res`,[loc('galaxy_embassy')])}</div><div>${loc('galaxy_freighter_effect',[2,races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name])}</div>${bank}<div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 3 : 3; },
                mil(){ return 0; },
                helium: 12
            },
            special: true,
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('freighter','galaxy');
                    global.galaxy['freighter'].on++;
                    global.resource.Vitreloy.display = true;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0 },
                    p: ['freighter','galaxy']
                };
            }
        },
    },
    gxy_alien1: {
        info: {
            name(){ return loc('galaxy_alien',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].home]); },
            desc(){ return loc('galaxy_alien1_desc',[
                races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].home,
                races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name,
            ]); },
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
                return loc('galaxy_consulate_desc',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].home]);
            },
            reqs: { xeno: 8 },
            queue_complete(){ return 1 - global.galaxy.consulate.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('consulate') ? global.galaxy.consulate.count : 0)) < 1 ? 90000000 : 0; },
                Stone(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('consulate') ? global.galaxy.consulate.count : 0)) < 1 ? 75000000 : 0; },
                Furs(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('consulate') ? global.galaxy.consulate.count : 0)) < 1 ? 30000000 : 0; },
                Iron(offset){ return ((offset || 0) + (global.galaxy.hasOwnProperty('consulate') ? global.galaxy.consulate.count : 0)) < 1 ? 45000000 : 0; },
                Horseshoe(offset){ return global.race['hooved'] && (((offset || 0) + (global.galaxy.hasOwnProperty('consulate') ? global.galaxy.consulate.count : 0)) < 1) ? 10 : 0; }
            },
            effect(){
                return loc('plus_max_citizens',[$(this)[0].citizens()]);
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    if (global.galaxy.consulate.count < 1){
                        incrementStruct('consulate','galaxy');
                        initStruct(galaxyProjects.gxy_alien1.resort);
                        initStruct(galaxyProjects.gxy_alien1.super_freighter);
                        global.tech.xeno = 9;
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['consulate','galaxy']
                };
            },
            citizens(){
                let pop = 10;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
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
                Money(offset){ return spaceCostMultiplier('resort', offset, traitCostMod('untrustworthy',33000000), 1.25, 'galaxy'); },
                Stone(offset){ return spaceCostMultiplier('resort', offset, traitCostMod('untrustworthy',25000000), 1.25, 'galaxy'); },
                Furs(offset){ return spaceCostMultiplier('resort', offset, traitCostMod('untrustworthy',10000000), 1.25, 'galaxy'); },
                Oil(offset){ return spaceCostMultiplier('resort', offset, traitCostMod('untrustworthy',int_fuel_adjust(125000)), 1.25, 'galaxy'); },
            },
            effect(){
                let money = spatialReasoning(global.tech['world_control'] ? 1875000 : 1500000);
                let joy = (global.tech['theatre'] && !global.race['joyless']) ? `<div>${loc('plus_max_resource',[jobScale(2),loc(`job_entertainer`)])}</div>` : '';
                let desc = `<div>${loc('plus_max_resource',[`\$${money.toLocaleString()}`,loc('resource_Money_name')])}</div>${joy}<div>${loc('space_red_vr_center_effect2',[2])}</div>`;
                return desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(5); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('resort','galaxy');
                    if (powerOnNewStruct($(this)[0])){
                        if (global.tech['theatre'] && !global.race['joyless']){
                            global.civic.entertainer.max += jobScale(2);
                            global.civic.entertainer.display = true;
                        }
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['resort','galaxy']
                };
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
                let vitreloy = +(production('vitreloy_plant')).toFixed(2);
                let bolognium = 2.5;
                let stanene = 100;
                let cash = 50000;
                return `<div>${loc('galaxy_vitreloy_plant_effect',[vitreloy])}</div><div class="has-text-caution">${loc('galaxy_vitreloy_plant_effect2',[bolognium,stanene])}</div><div class="has-text-caution">${loc('galaxy_vitreloy_plant_effect3',[cash,$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(10); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('vitreloy_plant','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['vitreloy_plant','galaxy']
                };
            },
        },
        super_freighter: {
            id: 'galaxy-super_freighter',
            title: loc('galaxy_super_freighter'),
            desc(){
                return `<div>${loc('galaxy_super_freighter')}</div><div class="has-text-special">${loc('galaxy_crew_fuel',[global.resource.Helium_3.name])}</div>`;
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
                return `<div class="has-text-caution">${loc(`requires_res`,[loc('galaxy_embassy')])}</div><div>${loc('galaxy_freighter_effect',[5,races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name])}</div>${bank}<div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 5 : 5; },
                mil(){ return 0; },
                helium: 25
            },
            special: true,
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('super_freighter','galaxy');
                    global.galaxy['super_freighter'].on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0 },
                    p: ['super_freighter','galaxy']
                };
            },
        },
    },
    gxy_alien2: {
        info: {
            name(){ return loc('galaxy_alien',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red]); },
            desc(){ return loc('galaxy_alien2_desc',[
                    races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red,
                    races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name
                ]);
            },
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
            title(){ return loc('galaxy_alien2_mission',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red]); },
            desc(){ return loc('galaxy_alien2_mission_desc',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red]); },
            reqs: { andromeda: 4 },
            grant: ['conflict',1],
            queue_complete(){ return global.tech.conflict >= 1 ? 0 : 1; },
            cost: {
                Custom(){
                    if (global.galaxy.hasOwnProperty('defense') && global.galaxy.defense.hasOwnProperty('gxy_alien2')){
                        let total = 0;
                        Object.keys(global.galaxy.defense.gxy_alien2).forEach(function(ship){
                            total += galaxyProjects.gxy_gateway[ship].ship.rating() * global.galaxy.defense.gxy_alien2[ship];
                        });
                        return {
                            label: loc(`galaxy_fleet_rating`,[`<span${total < 400 ? ` class="has-text-danger"` : ''}>400</span>`]),
                            met: total < 400 ? false : true
                        };
                    }
                    return {
                        label: loc(`galaxy_fleet_rating`,[`<span class="has-text-danger">400</span>`]),
                        met: false
                    };
                }
            },
            effect(){
                let total = 0;
                if (global.galaxy.hasOwnProperty('defense') && global.galaxy.defense.hasOwnProperty('gxy_alien2')){
                    Object.keys(global.galaxy.defense.gxy_alien2).forEach(function(ship){
                        total += galaxyProjects.gxy_gateway[ship].ship.rating() * global.galaxy.defense.gxy_alien2[ship];
                    });
                }
                let odds = total >= 650 ? `<span class="has-text-success">${loc(`galaxy_piracy_low`)}</span>` : `<span class="has-text-warning">${loc(`galaxy_piracy_avg`)}</span>`;
                return `<div>${loc('galaxy_alien2_mission_effect2',[total])}</div><div>${loc('galaxy_alien2_mission_effect3',[odds])}</div><div class="has-text-caution">${loc('galaxy_alien2_mission_effect',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    let total = 0;
                    Object.keys(global.galaxy.defense.gxy_alien2).forEach(function(ship){
                        total += galaxyProjects.gxy_gateway[ship].ship.rating() * global.galaxy.defense.gxy_alien2[ship];
                    });
                    if (total >= 400){
                        messageQueue(loc('galaxy_alien2_mission_result2',[races[global.galaxy.alien2.id].solar.red]),'info',false,['progress']);
                        if (total < 650){
                            let wreck = 80;
                            if (global.race['instinct']){
                                wreck /= 2;
                            }
                            let loss = [];
                            Object.keys(global.galaxy.defense.gxy_alien2).forEach(function(ship){
                                for (let i=0; i<global.galaxy.defense.gxy_alien2[ship]; i++){
                                    if (wreck > 0){
                                        wreck -= galaxyProjects.gxy_gateway[ship].ship.rating();
                                        loss.push(ship);
                                    }
                                }
                            });
                            messageQueue(loc('galaxy_chthonian_mission_result_losses',[ loss.map( v => loc(`galaxy_${v}`) ).join(', ') ]),'danger',false,['progress']);
                            for (let i=0; i<loss.length; i++){
                                let ship = loss[i];
                                global.galaxy.defense.gxy_alien2[ship]--;
                                global.galaxy[ship].on--;
                                global.galaxy[ship].count--;
                                global.galaxy[ship].crew -= galaxyProjects.gxy_gateway[ship].ship.civ();
                                global.galaxy[ship].mil -= galaxyProjects.gxy_gateway[ship].ship.mil();
                                global.resource[global.race.species].amount -= galaxyProjects.gxy_gateway[ship].ship.civ();
                                global.civic.garrison.workers -= galaxyProjects.gxy_gateway[ship].ship.mil();
                            }
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
            desc(){ return `<div>${loc('galaxy_foothold')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Elerium.name])}</div>`; },
            reqs: { conflict: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('foothold', offset, 25000000, 1.25, 'galaxy'); },
                Titanium(offset){ return spaceCostMultiplier('foothold', offset, 3000000, 1.25, 'galaxy'); },
                Polymer(offset){ return spaceCostMultiplier('foothold', offset, 1750000, 1.25, 'galaxy'); },
                Iridium(offset){ return spaceCostMultiplier('foothold', offset, 900000, 1.25, 'galaxy'); },
                Bolognium(offset){ return spaceCostMultiplier('foothold', offset, 50000, 1.25, 'galaxy'); },
            },
            effect(wiki){
                let elerium = 2.5;
                return `<div class="has-text-advanced">${loc('galaxy_defense_platform_effect',[50])}</div><div>${loc('galaxy_foothold_effect',[$(this)[0].support(),races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red])}</div><div class="has-text-caution">${loc('galaxy_foothold_effect2',[elerium,$(this)[0].powered(wiki)])}</div>`;
            },
            support(){ return 4; },
            powered(wiki){ return powerCostMod(isStargateOn(wiki) ? 20 : 0); },
            powerBalancer(){
                return [{ s: global.galaxy.foothold.s_max - global.galaxy.foothold.support }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('foothold','galaxy');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech['conflict'] === 1){
                        initStruct(galaxyProjects.gxy_alien2.armed_miner);
                        global.tech['conflict'] = 2;
                        galaxySpace();
                        drawTech();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['foothold','galaxy']
                };
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
                let bolognium = 0.032;
                let adamantite = 0.23;
                let iridium = 0.65;
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                return `<div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating()])}</div><div>${loc('gain',[bolognium,global.resource.Bolognium.name])}</div><div>${loc('gain',[adamantite,global.resource.Adamantite.name])}</div><div>${loc('gain',[iridium,global.resource.Iridium.name])}</div><div class="has-text-caution">${loc('galaxy_alien2_support',[$(this)[0].support(),races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 2 : 2; },
                mil(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 1 : 1; },
                helium: 10,
                rating(){ 
                    let rating = global.race['banana'] ? 4 : 5;
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 2 : 5;
                    }
                    return rating;
                }
            },
            s_type: 'alien2',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('armed_miner','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['armed_miner','galaxy']
                };
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
                return `<div>${loc('galaxy_ore_processor_effect',[10])}</div><div class="has-text-caution">${loc('galaxy_alien2_support',[$(this)[0].support(),races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red])}</div>`;
            },
            s_type: 'alien2',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('ore_processor','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['ore_processor','galaxy']
                };
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
            effect(wiki){
                let pirate = piracy('gxy_alien2',false,false,wiki);
                let know = Math.round(pirate * 25000);
                let helium = +int_fuel_adjust($(this)[0].ship.helium).toFixed(2);
                let boost = global.race['cataclysm'] ? `<div>${loc('galaxy_scavenger_effect2_cata',[+(pirate * 100 * 0.75).toFixed(1)])}</div>` : `<div>${loc('galaxy_scavenger_effect2',[+(pirate * 100 / 4).toFixed(1)])}</div>`;
                return `<div>${loc('galaxy_scavenger_effect',[know])}</div>${boost}<div class="has-text-caution">${loc('galaxy_alien2_support',[$(this)[0].support(),races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 1 : 1; },
                mil(){ return 0; },
                helium: 12,
            },
            s_type: 'alien2',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('scavenger','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0 },
                    p: ['scavenger','galaxy']
                };
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
            queue_complete(){ return global.tech.chthonian >= 2 ? 0 : 1; },
            cost: {
                Custom(){
                    if (global.galaxy.hasOwnProperty('defense') && global.galaxy.defense.hasOwnProperty('gxy_chthonian')){
                        let total = 0;
                        Object.keys(global.galaxy.defense.gxy_chthonian).forEach(function(ship){
                            total += galaxyProjects.gxy_gateway[ship].ship.rating() * global.galaxy.defense.gxy_chthonian[ship];
                        });
                        return {
                            label: loc(`galaxy_fleet_rating`,[`<span${total < 1250 ? ` class="has-text-danger"` : ``}>1250</span>`]),
                            met: total < 1250 ? false : true
                        };
                    }
                    return {
                        label: loc(`galaxy_fleet_rating`,[`<span class="has-text-danger">1250</span>`]),
                        met: false
                    };
                }
            },
            effect(){
                let total = 0;
                if (global.galaxy.hasOwnProperty('defense') && global.galaxy.defense.hasOwnProperty('gxy_chthonian')){
                    Object.keys(global.galaxy.defense.gxy_chthonian).forEach(function(ship){
                        total += galaxyProjects.gxy_gateway[ship].ship.rating() * global.galaxy.defense.gxy_chthonian[ship];
                    });
                }
                let odds = total >= 4500 ? `<span class="has-text-success">${loc(`galaxy_piracy_low`)}</span>` : (total >= 2500 ? `<span class="has-text-warning">${loc(`galaxy_piracy_avg`)}</span>` : `<span class="has-text-danger">${loc(`galaxy_piracy_high`)}</span>`);
                return `<div>${loc('galaxy_alien2_mission_effect2',[total])}</div><div>${loc('galaxy_alien2_mission_effect3',[odds])}</div><div class="has-text-caution">${loc('galaxy_alien2_mission_effect',[loc('galaxy_chthonian')])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){

                    let total = 0;
                    Object.keys(global.galaxy.defense.gxy_chthonian).forEach(function(ship){
                        total += galaxyProjects.gxy_gateway[ship].ship.rating() * global.galaxy.defense.gxy_chthonian[ship];
                    });

                    if (total >= 1250){
                        let wreck = 500;
                        let loss = [];
                        messageQueue(loc('galaxy_chthonian_mission_result'),'info',false,['progress']);

                        if (total >= 2500){
                            wreck = total >= 4500 ? 80 : 160;
                        }
                        if (global.race['instinct']){
                            wreck /= 2;
                        }

                        Object.keys(global.galaxy.defense.gxy_chthonian).forEach(function(ship){
                            for (let i=0; i<global.galaxy.defense.gxy_chthonian[ship]; i++){
                                if (wreck > 0){
                                    wreck -= galaxyProjects.gxy_gateway[ship].ship.rating();
                                    loss.push(ship);
                                }
                            }
                        });

                        messageQueue(loc('galaxy_chthonian_mission_result_losses',[ loss.map( v => loc(`galaxy_${v}`) ).join(', ') ]),'danger',false,['progress']);

                        for (let i=0; i<loss.length; i++){
                            let ship = loss[i];
                            global.galaxy.defense.gxy_chthonian[ship]--;
                            global.galaxy[ship].on--;
                            global.galaxy[ship].count--;
                            global.galaxy[ship].crew -= galaxyProjects.gxy_gateway[ship].ship.civ();
                            global.galaxy[ship].mil -= galaxyProjects.gxy_gateway[ship].ship.mil();
                            global.resource[global.race.species].amount -= galaxyProjects.gxy_gateway[ship].ship.civ();
                            global.civic.garrison.workers -= galaxyProjects.gxy_gateway[ship].ship.mil();
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
                return `<div class="has-text-caution">${loc(`requires_res`,[loc('galaxy_starbase')])}</div><div class="has-text-advanced">${loc('galaxy_defense_platform_effect',[$(this)[0].ship.rating()])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ(){ return 0; },
                mil(){
                    let base = global.race['high_pop'] ? traits.high_pop.vars()[0] * 1 : 1;
                    return global.race['grenadier'] ? Math.ceil(base / 2) : base;
                },
                helium: 8,
                rating(){ 
                    let rating = global.race['banana'] ? 35 : 50;
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 15 : 25;
                    }
                    return rating;
                }
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('minelayer','galaxy');
                    global.galaxy.minelayer.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['minelayer','galaxy']
                };
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
                let orichalcum = +(production('excavator')).toFixed(3);
                return `<div>${loc('gain',[orichalcum,global.resource.Orichalcum.name])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(8); },
            powerBalancer(){
                return [{ r: 'Orichalcum', p: production('excavator') }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('excavator','galaxy');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['excavator','galaxy']
                };
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
                let deuterium = 0.65;
                let vitreloy = 0.05;
                let polymer = 2.3;
                let neutronium = 0.8;
                return `<div class="has-text-caution">${loc(`requires_res`,[loc('galaxy_starbase')])}</div><div class="has-text-advanced">${loc('galaxy_ship_rating',[$(this)[0].ship.rating()])}</div><div>${loc('gain',[deuterium,global.resource.Deuterium.name])}</div><div>${loc('gain',[vitreloy,global.resource.Vitreloy.name])}</div><div>${loc('gain',[polymer,global.resource.Polymer.name])}</div><div>${loc('gain',[neutronium,global.resource.Neutronium.name])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div><div class="has-text-caution">${loc('spend',[helium,global.resource.Helium_3.name])}</div>`;
            },
            ship: {
                civ(){ return 0; },
                mil(){
                    let base = global.race['grenadier'] ? 1 : 2;
                    return global.race['high_pop'] ? traits.high_pop.vars()[0] * base : base;
                },
                helium: 18,
                rating(){ 
                    let rating = global.race['banana'] ? 9 : 12;
                    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
                        rating += global.race['banana'] ? 3 : 6;
                    }
                    return rating;
                }
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('raider','galaxy');
                    global.galaxy.raider.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['raider','galaxy']
                };
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

export const galaxyRegions = ['gxy_gateway', 'gxy_stargate', 'gxy_gorddon', 'gxy_alien1', 'gxy_alien2', 'gxy_chthonian'];
export const gatewayArmada = ['scout_ship', 'corvette_ship', 'frigate_ship', 'cruiser_ship', 'dreadnought'];

export const galaxy_ship_types = [
    {
        area: 'galaxy',
        region: 'gxy_gateway',
        ships: global.support.gateway.map(x => x.split(':')[1])
    },
    {
        area: 'galaxy',
        region: 'gxy_gorddon',
        ships: ['freighter'],
        req: 'embassy'
    },
    {
        area: 'galaxy',
        region: 'gxy_alien1',
        ships: ['super_freighter'],
        req: 'embassy'
    },
    {
        area: 'galaxy',
        region: 'gxy_alien2',
        ships: global.support.alien2.map(x => x.split(':')[1]),
        req: 'foothold'
    },
    {
        area: 'galaxy',
        region: 'gxy_chthonian',
        ships: ['minelayer','raider'],
        req: 'starbase'
    },
    {
        area: 'portal',
        region: 'prtl_lake',
        ships: global.support.lake.map(x => x.split(':')[1]),
        req: 'harbor'
    }
];

export function convertSpaceSector(part){
    let space = 'space';
    if (part.substr(0,4) === 'int_'){
        space = 'interstellar';
    }
    else if (part.substr(0,5) === 'prtl_'){
        space = 'portal';
    }
    else if (part.substr(0,4) === 'gxy_'){
        space = 'galaxy';
    }
    else if (part.substr(0,4) === 'tau_'){
        space = 'tauceti';
    }
    else if (part.substr(0,5) === 'eden_'){
        space = 'eden';
    }
    return space;
}

export function piracy(region,rating,raw,wiki){
    if (global.tech['piracy'] && !global.race['truepath']){
        let armada = 0;
        for (let i = gatewayArmada.length - 1; i >= 0; i--){
            let ship = gatewayArmada[i];
            if (!global.galaxy.defense[region].hasOwnProperty(ship)){
                global.galaxy.defense[region][ship] = 0;
            }
            let count = global.galaxy.defense[region][ship];
            armada += count * galaxyProjects.gxy_gateway[ship].ship.rating();
        }

        let pirate = 0;
        let pillage = 0.75;
        switch(region){
            case 'gxy_stargate':
                pirate = 0.1 * (global.race['instinct'] ? global.tech.piracy * 0.9 : global.tech.piracy);
                pillage = 0.5;
                break;
            case 'gxy_gateway':
                pirate = 0.1 * (global.race['instinct'] ? global.tech.piracy * 0.9 : global.tech.piracy);
                pillage = 1;
                break;
            case 'gxy_gorddon':
                pirate = global.race['instinct'] ? 720 : 800;
                break;
            case 'gxy_alien1':
                pirate = global.race['instinct'] ? 900 : 1000;
                break;
            case 'gxy_alien2':
                pirate = global.race['instinct'] ? 2250 : 2500;
                pillage = 1;
                break;
            case 'gxy_chthonian':
                pirate = global.race['instinct'] ? 7000 : 7500;
                pillage = 1;
                break;
        }

        if (global.race['chicken']){
            pirate *= 1 + (traits.chicken.vars()[1] / 100);
        }

        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.f){
            pirate *= 1 - (traits.ocular_power.vars()[1] / 500);
        }

        let num_def_plat_on = wiki ? (global.galaxy?.defense_platform?.on ?? 0) : p_on['defense_platform'];
        if (region === 'gxy_stargate' && num_def_plat_on){
            armada += num_def_plat_on * 20;
        }

        let num_starbase_on = wiki ? (global.galaxy?.starbase?.on ?? 0) : p_on['starbase'];
        if (region === 'gxy_gateway' && num_starbase_on){
            armada += num_starbase_on * 25;
        }

        let num_foothold_on = wiki ? (global.galaxy?.foothold?.on ?? 0) : p_on['foothold'];
        if (region === 'gxy_alien2' && num_foothold_on){
            armada += num_foothold_on * 50;
            let num_armed_miner_on = wiki ? global.galaxy.armed_miner.on : gal_on['armed_miner'];
            if (num_armed_miner_on){
                armada += num_armed_miner_on * galaxyProjects.gxy_alien2.armed_miner.ship.rating();
            }
        }

        if (region === 'gxy_chthonian'){
            let num_minelayer_on = wiki ? (global.galaxy?.minelayer?.on ?? 0) : gal_on['minelayer'];
            if (num_minelayer_on){
                armada += num_minelayer_on * galaxyProjects.gxy_chthonian.minelayer.ship.rating();
            }
            let num_raider_on = wiki ? (global.galaxy?.raider?.on ?? 0) : gal_on['raider'];
            if (num_raider_on){
                armada += num_raider_on * galaxyProjects.gxy_chthonian.raider.ship.rating();
            }
        }

        if (raw){
            return armada;
        }

        if (region !== 'gxy_stargate'){
            let patrol = armada > pirate ? pirate : armada;
            return ((1 - (pirate - patrol) / pirate) * pillage + (1 - pillage)) * (rating ? 1 : piracy('gxy_stargate',false,false,wiki));
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
    let skip = ['protoplasm',global.race.species];
    if (global.city.hasOwnProperty('surfaceDwellers')){
        skip.push(...global.city.surfaceDwellers);
    }
    if (!global.custom.hasOwnProperty('race0')){
        skip.push('custom');
    }
    if (!global.custom.hasOwnProperty('race1')){
        skip.push('hybrid');
    }
    
    let list = Object.keys(races).filter(function(r){ return !['demonic','eldritch'].includes(races[r].type) && !skip.includes(r) });
    let key1 = randomKey(list);
    global.galaxy['alien1'] = {
        id: list[key1]
    };
    skip.push(list[key1]);

    list = Object.keys(races).filter(function(r){ return !['angelic'].includes(races[r].type) && !skip.includes(r) });
    let key2 = randomKey(list);
    global.galaxy['alien2'] = {
        id: list[key2]
    };
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
    exchange: { count: 0, on: 0 },
    warehouse: { count: 0 },
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
        Chrysotile: 0, Stone: 0,
        Crystal: 0, Furs: 0,
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
        Vitreloy: 0, Orichalcum: 0,
        Plywood: 0, Brick: 0,
        Wrought_Iron: 0, Sheet_Metal: 0,
        Mythril: 0, Aerogel: 0,
        Nanoweave: 0, Scarletite: 0
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

export function incrementStruct(c_action,sector){
    let struct = c_action;
    if (typeof c_action === 'object'){
        struct = c_action.struct().p[0];
        sector = c_action.struct().p[1];
    }
    if (!sector){
        sector = 'space';
    }
    if (!global[sector][struct]){
        global[sector][struct] = typeof c_action === 'object' ? c_action.struct().d : structDefinitions[struct];
    }
    if (global.race['living_materials'] || global[sector][struct]['l_m']){
        global[sector][struct]['l_m'] = 0;
    }
    global[sector][struct].count++;
}

export function spaceTech(r,k){
    if (r && k){
        return spaceProjects[r][k];
    }
    return spaceProjects;
}

export function interstellarTech(){
    return interstellarProjects;
}

export function galaxyTech(){
    return galaxyProjects;
}

export function checkSpaceRequirements(era,region,action){
    switch (era){
        case 'space':
            return checkRequirements(spaceProjects,region,action);
        case 'interstellar':
            return checkRequirements(interstellarProjects,region,action);
        case 'galaxy':
            return checkRequirements(galaxyProjects,region,action);
    }
}

export function checkRequirements(action_set,region,action){
    let path = global.race['truepath'] ? 'truepath' : 'standard';
    if (action_set[region][action].hasOwnProperty('path') && !action_set[region][action].path.includes(path)){
        return false;
    }
    var isMet = true;
    Object.keys(action_set[region][action].reqs).forEach(function (req){
        if (!global.tech[req] || global.tech[req] < action_set[region][action].reqs[req]){
            isMet = false;
        }
    });
    if (isMet && action_set[region][action].hasOwnProperty('condition') && !action_set[region][action].condition()){
        isMet = false;
    }
    if (isMet && action_set[region][action].hasOwnProperty('not_trait')){
        for (let trait of action_set[region][action].not_trait){
            if (global.race[trait]){
                isMet = false;
            }
        }
    }
    if (isMet && action_set[region][action].grant && (global.tech[action_set[region][action].grant[0]] && global.tech[action_set[region][action].grant[0]] >= action_set[region][action].grant[1])){
        isMet = false;
    }
    return isMet;
}

export function renderSpace(){
    if (!global.settings.tabLoad && global.settings.civTabs !== 1){
        return;
    }
    space('inner');
    if (global.race['truepath']){
        space('outer');
    }
    deepSpace();
    galaxySpace();
}

function space(zone){
    if (!zone){
        zone = global.settings.spaceTabs === 5 ? 'outer' : 'inner';
    }
    if (!global.settings.tabLoad){
        if (global.settings.civTabs !== 1 || ![1,5].includes(global.settings.spaceTabs) || (global.settings.civTabs === 1 && (global.settings.spaceTabs === 1 && zone !== 'inner') || (global.settings.spaceTabs === 5 && zone !== 'outer'))){
            return;
        }
    }
    let parent = zone === 'inner' ? $('#space') : $('#outerSol');
    clearElement(parent);
    parent.append($(`<h2 class="is-sr-only">${loc(zone === 'inner' ? 'tab_space' : 'tab_outer_space')}</h2>`));
    if (!global.settings.showSpace){
        return false;
    }

    let regionOrder = [];
    Object.keys(spaceProjects).forEach(function (region){
        if (global.race['orbit_decayed'] || global.race['cataclysm']){
            if (region !== 'spc_home'){
                regionOrder.push(region);
                if (global.race['orbit_decayed'] && region === 'spc_red'){
                    regionOrder.push('spc_home');
                }
                else if (global.race['cataclysm'] && region === 'spc_moon'){
                    regionOrder.push('spc_home');
                }
            }
        }
        else {
            regionOrder.push(region);
        }
    });

    regionOrder.forEach(function (region){
        let show = region.replace("spc_","");
        if (global.settings.space[`${show}`]){
            if (global.race['truepath'] && spaceProjects[region].info.zone !== zone){
                return;
            }
            let name = typeof spaceProjects[region].info.name === 'string' ? spaceProjects[region].info.name : spaceProjects[region].info.name();
            let noHome = global.race['orbit_decayed'] || global.race['cataclysm'] ? true : false;

            if ((noHome && region !== 'spc_home') || !noHome){
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

                if (global.race['truepath'] && spaceProjects[region].info.hasOwnProperty('syndicate') && spaceProjects[region].info.syndicate() && global.tech['syndicate']){
                    $(`#${region}`).append(`<div id="${region}synd" v-show="${region}"></div>`);

                    $(`#${region}synd`).append(`<span class="syndThreat has-text-caution">${loc('space_syndicate')} <span class="has-text-danger" v-html="threat('${region}')"></span></span>`);
                    $(`#${region}synd`).append(`<span class="syndThreat has-text-caution">${loc('space_scan_effectiveness')} <span class="has-text-warning" v-html="scan('${region}')"></span></span>`);
                    $(`#${region}synd`).append(`<span v-show="overkill('${region}')" class="syndThreat has-text-caution">${loc('space_overkill')} <span class="has-text-warning" v-html="overkill('${region}')"></span></span>`);
                    vBind({
                        el: `#${region}synd`,
                        data: global.space.syndicate,
                        methods: {
                            threat(r){
                                if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                                    let synd = syndicate(r,true);
                                    if (synd.s >= 10){
                                        return synd.s >= 50 ? synd.r : Math.round(synd.r * synd.s * 0.02);
                                    }
                                }
                                return '???';
                            },
                            scan(r){
                                if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                                    let synd = syndicate(r,true);
                                    return +((synd.s + 25) / 1.25).toFixed(1) + '%';
                                }
                                return loc(`galaxy_piracy_none`);
                            },
                            overkill(r){
                                if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                                    let synd = syndicate(r,true);
                                    return synd.s >= 100 ? synd.o : 0;
                                }
                                return 0;
                            }
                        }
                    });

                    if (spaceProjects[region].info.hasOwnProperty('extra')){
                        spaceProjects[region].info.extra(region);
                    }
                }
            }

            popover(region, function(){
                    return typeof spaceProjects[region].info.desc === 'string' ? spaceProjects[region].info.desc : spaceProjects[region].info.desc();
                },
                {
                    elm: `#${region} h3.name`,
                    classes: `has-background-light has-text-dark`
                }
            );

            Object.keys(spaceProjects[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(spaceProjects,region,tech)){
                    let c_action = spaceProjects[region][tech];
                    setAction(c_action,zone === 'inner' ? 'space' : 'outerSol',tech);
                }
            });
        }
    });
}

function deepSpace(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 2)){
        return;
    }
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

            popover(region, function(){
                    return typeof interstellarProjects[region].info.desc === 'string' ? interstellarProjects[region].info.desc : interstellarProjects[region].info.desc();
                },
                {
                    elm: `#${region} h3.name`,
                    classes: `has-background-light has-text-dark`
                }
            );

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
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 3)){
        return;
    }
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
                regionContent.append(`<span class="regionControl has-text-${galaxyProjects[region].info.control().color}">{{ r.control().name }}</span>`);
            }

            let vData = {
                el: `#${region}`,
                data: {
                    r: galaxyProjects[region].info
                },
                methods: {
                    threat(r){
                        let scouts_req = global.race['infiltrator'] ? 1 : 2;
                        if (global.galaxy.defense[r].scout_ship >= scouts_req){
                            let pirates = (1 - piracy(r,true)) * 100;
                            pirates = (pirates < 1) ? Math.ceil(pirates) : Math.round(pirates);
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
                        let scouts_req = global.race['infiltrator'] ? 1 : 2;
                        if (global.galaxy.defense[r].scout_ship >= scouts_req){
                            let pirates = (1 - piracy(r,true)) * 100;
                            pirates = (pirates < 1) ? Math.ceil(pirates) : Math.round(pirates);
                            let adv_req = global.race['infiltrator'] ? 3 : 4;
                            if (global.galaxy.defense[r].scout_ship >= adv_req){
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
                    regionContent.append(`<span class="regionSupport" v-show="s.s_max">{{ s.support }}/{{ s.s_max%1 ? s.s_max.toFixed(2) : s.s_max }}</span>`);
                    vData.data['s'] = global.galaxy[support];
                }
            }

            if (global.tech['piracy']){
                regionContent.append(`<div><span class="has-text-caution pirate">${loc('galaxy_piracy_threat',[races[global.galaxy.alien2.id].name])}</span><span :class="threat('${region}')">{{ '${region}' | pirate }}</span><span class="sep">|</span><span class="has-text-warning">${loc('galaxy_armada')}</span>: <span class="has-text-success">{{ '${region}' | defense }}</span></div>`);
            }

            vBind(vData);

            popover(region, function(){
                    return typeof galaxyProjects[region].info.desc === 'string' ? galaxyProjects[region].info.desc : galaxyProjects[region].info.desc();
                },
                {
                    elm: `#${region} h3.name`,
                    classes: `has-background-light has-text-dark`
                }
            );

            popover(region, function(){
                    return loc('galaxy_control',[galaxyProjects[region].info.control().name,name]);
                },
                {
                    elm: `#${region} .regionControl`,
                    classes: `has-background-light has-text-dark`
                }
            );

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
    if (global.tech['piracy'] && !global.race['truepath']){

        let header = $(`<div id="h${id}" class="armHead"><h3 class="has-text-warning">${loc('galaxy_armada')}</h3></div>`);
        parent.append(header);

        let soldier_title = global.tech['world_control'] ? loc('civics_garrison_peacekeepers') : loc('civics_garrison_soldiers');
        header.append($(`<span>|</span>`));
        header.append($(`<span class="has-text-caution"><span class="soldier">${soldier_title}</span> <span>{{ g.workers | stationed }} / {{ g.max | s_max }}</span></span>`));
        header.append($(`<span>|</span>`));
        header.append($(`<span class="has-text-caution"><span class="crew1">${loc('job_crew_mil')}</span> <span>{{ g.crew }}</span></span>`));
        header.append($(`<span>|</span>`));
        header.append($(`<span class="has-text-success"><span class="crew2">${loc('job_crew_civ')}</span> <span>{{ c.workers }} / {{ c.max }}</span></span>`));

        vBind({
            el: `#h${id}`,
            data: {
                g: global.civic.garrison,
                c: global.civic.crew,
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

        ['soldier','crew1','crew2'].forEach(function(k){
            popover(`h${id}${k}`, function(){
                    switch(k){
                        case 'soldier':
                            return describeSoldier();
                        case 'crew1':
                            return loc('civics_garrison_crew_desc');
                        case 'crew2':
                            return loc('job_crew_desc');
                    }
                },
                {
                    elm: `#h${id} span.${k}`
                }
            );
        });

        let fleet = $(`<div id="${id}" class="fleet"></div>`);
        parent.append(fleet);

        let cols = [];
        // One column per ship type plus an extra column for labels
        for (let i = 0; i < gatewayArmada.length + 1; i++){
            let col = $(`<div class="area"></div>`);
            cols.push(col);
            fleet.append(col);
        }

        cols[0].append($(`<span></span>`));
        cols[0].append($(`<span id="armadagateway" class="has-text-danger">${galaxyProjects.gxy_gateway.info.name}</span>`));

        for (let i = 0; i < gatewayArmada.length; i++){
            const ship = gatewayArmada[i];
            if (global.galaxy.hasOwnProperty(ship)){
                cols[i+1].append($(`<span id="armada${ship}" class="ship has-text-advanced">${galaxyProjects.gxy_gateway[ship].title}</span>`));
                cols[i+1].append($(`<span class="ship">{{ gateway.${ship} }}</span>`));
            }
        }

        Object.keys(global.galaxy.defense).forEach(function (area){
            let r = area.substring(4);
            if (global.settings.space[r] && r !== 'gateway'){

                let region = $(`<span id="armada${r}" class="has-text-caution">${typeof galaxyProjects[area].info.name === 'string' ? galaxyProjects[area].info.name : galaxyProjects[area].info.name()}</span>`);
                cols[0].append(region);

                for (let i = 0; i < gatewayArmada.length; i++){
                    const ship = gatewayArmada[i];
                    if (global.galaxy.hasOwnProperty(ship)){
                        let shipSpan = $(`<span class="ship"></span>`);
                        let sub = $(`<span role="button" aria-label="remove ${ship}" class="sub has-text-danger" @click="sub('${area}','${ship}')"><span>&laquo;</span></span>`);
                        let count = $(`<span class="current">{{ ${r}.${ship} }}</span>`);
                        let add = $(`<span role="button" aria-label="add ${ship}" class="add has-text-success" @click="add('${area}','${ship}')"><span>&raquo;</span></span>`);
                        cols[i+1].append(shipSpan);
                        shipSpan.append(sub);
                        shipSpan.append(count);
                        shipSpan.append(add);
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
                popover(`armada${r}`,function(){
                    return `<div>${typeof galaxyProjects[area].info.desc === 'string' ? galaxyProjects[area].info.desc : galaxyProjects[area].info.desc()}</div>`;
                });
            }
        });

        for (let i = 0; i < gatewayArmada.length; i++){
            const ship = gatewayArmada[i];
            if (global.galaxy.hasOwnProperty(ship)){
                popover(`armada${ship}`,function(obj){
                    actionDesc(obj.popper, galaxyProjects.gxy_gateway[ship], global.galaxy[ship]);
                    return undefined;
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

export function iron_adjust(res,wiki){
    let num_iron_ship_on = wiki ? (global.space?.iron_ship?.on ?? 0) : support_on['iron_ship'];
    if (global.tech['solar'] && global.tech['solar'] >= 5 && num_iron_ship_on){
        res *= 0.95 ** num_iron_ship_on;
    }
    return res;
}

export function swarm_adjust(res,wiki){
    if (global.space['swarm_plant']){
        let reduce = global.tech['swarm'] ? 0.88 : 0.94;
        if (global.tech['swarm'] >= 3){
            reduce -= get_qlevel(wiki) / 100;
        }
        if (reduce < 0.05){
            reduce = 0.05;
        }
        res *= reduce ** global.space.swarm_plant.count;
    }
    return res;
}

export function fuel_adjust(fuel,drain,wiki){
    if (global.race.universe === 'heavy'){
        fuel *= 1.25 + (0.5 * darkEffect('heavy'));
    }
    if (global.race['truepath']){
        fuel *= drain ? 2.5 : 1.25;
    }
    let num_driver_on = wiki ? (global.city?.mass_driver?.on ?? 0) : p_on['mass_driver'];
    if (num_driver_on){
        let factor = (wiki ? wiki.truepath : global.race['truepath']) ? 0.94 : 0.95;
        fuel *= factor ** num_driver_on;
    }
    if (global.stats.achieve['heavyweight']){
        fuel *= 0.96 ** global.stats.achieve['heavyweight'].l;
    }
    if (global.city.ptrait.includes('dense')){
        fuel *= planetTraits.dense.vars()[2];
    }
    if (global.race['cataclysm']){
        fuel *= 0.2;
    }
    if (global.race['heavy']){
        fuel *= 1 + (traits.heavy.vars()[0] / 100);
    }
    if (global.race['gravity_well']){
        fuel *= 1.35 + (9.65 * darkEffect('heavy'));
    }
    if (eventActive('launch_day')){
        fuel *= 0.95;
    }
    return fuel;
}

export function int_fuel_adjust(fuel){
    if (global.race.universe === 'heavy'){
        fuel *= 1.2 + (0.3 * darkEffect('heavy'));
    }
    if (global.stats.achieve['heavyweight']){
        fuel *= 0.96 ** global.stats.achieve['heavyweight'].l;
    }
    if (global.race['heavy']){
        fuel *= 1 + (traits.heavy.vars()[0] / 100);
    }
    if (eventActive('launch_day')){
        fuel *= 0.95;
    }
    return fuel;
}

export function zigguratBonus(){
    let bonus = 1;
    if (global.space['ziggurat']){
        let zig = global.tech['ancient_study'] ? 0.006 : 0.004;
        if (global.tech['ancient_deify'] && global.tech['ancient_deify'] >= 2 && support_on['exotic_lab']){
            zig += 0.0001 * support_on['exotic_lab'];
        }
        if (global.civic.govern.type === 'theocracy' && global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
            let faith = 0.00002;
            if (global.race['high_pop']){
                faith = highPopAdjust(faith);
            }
            zig += faith * global.civic.priest.workers;
        }
        if (global.race['ooze']){
            zig *= 1 - (traits.ooze.vars()[1] / 100);
        }
        if (global.race['high_pop']){
            zig = highPopAdjust(zig);
        }
        bonus += (templeCount(true) * global.civic.colonist.workers * zig);
    }
    return bonus;
}

export function planetName(){
    let type = races[global.race.species].type === 'hybrid' ? global.race.maintype : races[global.race.species].type;
    let names = {
        red: races[global.race.species].solar.red,
        hell: races[global.race.species].solar.hell,
        gas: races[global.race.species].solar.gas,
        gas_moon: races[global.race.species].solar.gas_moon,
        dwarf: races[global.race.species].solar.dwarf,
        titan: genusVars[type].solar.titan,
        enceladus: genusVars[type].solar.enceladus,
        triton: genusVars[type].solar.triton,
        eris: genusVars[type].solar.eris,
    };
    if (global.race.species === 'custom'){
        for (let p of ['titan','enceladus','triton','eris']){
            if (global.custom.race0.hasOwnProperty(p)){
                names[p] = global.custom.race0[p];
            }
        }
    }
    if (global.race.species === 'hybrid'){
        for (let p of ['titan','enceladus','triton','eris']){
            if (global.custom.race1.hasOwnProperty(p)){
                names[p] = global.custom.race1[p];
            }
        }
    }
    return names;
}

export const universe_affixes = ['l', 'h', 'a', 'e', 'm', 'mg'];

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
    },
    magic: {
        name: loc('universe_magic'),
        desc: loc('universe_magic_desc'),
        effect: loc('universe_magic_effect')
    }
};

export function genPlanets(){
    let avail = [];
    if (global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 4 && global.custom.hasOwnProperty('planet')){
        Object.keys(universe_types).forEach(function(u){
            let uafx = universeAffix(u);
            if (global.custom.planet.hasOwnProperty(uafx)){
                if (global.custom.planet[uafx].s){
                    avail.push(`${uafx}:s`);
                }
            }
        });
    }

    if (global.race['geck'] && global.race.geck > 0){
        let geck = $(`<div id="geck" class="geck"><span class="has-text-caution">${loc(`gecks_remaining`)}</span>: <span class="has-text-warning">{{ geck }}</span></div>`);
        $('#evolution').append(geck);

        vBind({
            el: '#geck',
            data: global.race,
        });
    }

    if (global.race.probes === 0){
        setPlanet({ custom: avail });
    }
    else {
        let hell = false;
        for (let i=0; i<global.race.probes; i++){
            let result = setPlanet({ hell: hell, custom: avail });
            if (result === 'hellscape'){
                hell = true;
            }
            else if (avail.includes(result)){
                avail.splice(avail.indexOf(result), 1);
            }
        }
    }
}

export function setUniverse(){
    let universes = ['standard','heavy','antimatter','evil','micro','magic'];

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
            genPlanets();
            clearPopper();
        });

        popover(id,function(obj){
            obj.popper.append($(`<div>${universe_types[universe].name}</div>`));
            obj.popper.append($(`<div>${universe_types[universe].desc}</div>`));
            obj.popper.append($(`<div>${universe_types[universe].effect}</div>`));
            return undefined;
        },{
            classes: `has-background-light has-text-dark`
        });
    }
}

export function ascendLab(hybrid,wiki){
    let isWiki = !!wiki;
    if (!isWiki && !global.race['noexport']){
        if (webWorker.w){
            webWorker.w.terminate();
        }
        if (!global['sim']){
            save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
        }

        let genusType = races[global.race.species].type === 'hybrid' ? global.race.maintype : races[global.race.species].type;
        unlockAchieve(`biome_${global.city.biome}`);
        unlockAchieve(`genus_${genusType}`);

        if (hybrid){
            unlockAchieve(`godslayer`);
            if (['unicorn','seraph'].includes(global.race.species)){
                unlockAchieve(`traitor`);
            }
            if (global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 5){
                global.race['noexport'] = `Hybrid`;
            }
            else {
                apotheosis();
                return;
            }
        }
        else {
            if (global.race['witch_hunter'] && global.race.universe === 'magic'){
                unlockAchieve(`soul_sponge`);
            }
            else {
                unlockAchieve(`ascended`);
                if (global.interstellar.thermal_collector.count === 0){
                    unlockFeat(`energetic`);
                }
            }
            if (global.race.species === 'junker'){
                unlockFeat('the_misery');
            }
            if (!global.race['modified'] && global.race['junker'] && global.race.species === 'junker'){
                unlockFeat(`garbage_pie`);
            }
            if (global.race['emfield']){
                unlockAchieve(`technophobe`);
            }
            if (global.race['cataclysm']){
                unlockFeat(`finish_line`);
            }
            global.race['noexport'] = `Race`;
        }

        clearElement($(`#city`));
        global.settings.showCity = true;
        global.settings.showCivic = false;
        global.settings.showResearch = false;
        global.settings.showResources = false;
        global.settings.showGenetics = false;
        global.settings.showSpace = false;
        global.settings.showDeep = false;
        global.settings.showGalactic = false;
        global.settings.showPortal = false;
        global.settings.showEden = false;
        global.settings.spaceTabs = 0;
    }

    let lab = $(`<div id="celestialLab" class="celestialLab"></div>`);

    let wikiVars = {
        ascended: {},
        technophobe: global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l ? global.stats.achieve.technophobe.l : 0
    };

    if (isWiki){
        wiki.append(lab);
    }
    else {
        $(`#city`).append(lab);
    }

    let labStatus = `<div><h3 class="has-text-danger">${loc('genelab_title')}</h3> - <span class="has-text-warning">${loc('genelab_genes')} {{ g.genes }}</span> - <span class="has-text-warning">${loc('trait_untapped_name')}: {{ g.genes | untapped }}</span></div>`;
    lab.append(labStatus);

    if (isWiki){
        lab.append(`
            <div class="has-text-caution">${loc('achieve_ascended_name')}</div>
        `);
        let ascended_levels = $(`<div></div>`);
        lab.append(ascended_levels);
        Object.keys(universe_types).forEach(function (uni){
            wikiVars.ascended[uni] = global.stats.achieve[`ascended`] && global.stats.achieve.ascended.hasOwnProperty(universeAffix(uni)) ? global.stats.achieve.ascended[universeAffix(uni)] : 0;
            ascended_levels.append(`
                <div class="calcInput"><span>${loc('universe_' + uni)}</span> <b-numberinput :input="val('${uni}')" min="0" max="5" v-model="w.ascended.${uni}" :controls="false"></b-numberinput></div>
            `);
        });
        lab.append(`
            <div class="has-text-caution">${loc('achieve_technophobe_name')}</div>
            <div>
                <div class="calcInput"><b-numberinput :input="val('technophobe')" min="0" max="5" v-model="w.technophobe" :controls="false"></b-numberinput></div>
            </div>
        `);
    }

    let name = $(`<div class="fields"><div class="name">${loc('genelab_name')} <b-input v-model="g.name" maxlength="20"></b-input></div><div class="entity">${loc('genelab_entity')} <b-input v-model="g.entity" maxlength="40"></b-input></div><div class="name">${loc('genelab_home')} <b-input v-model="g.home" maxlength="20"></b-input></div> <div>${loc('genelab_desc')} <b-input v-model="g.desc" maxlength="255"></b-input></div></div>`);
    lab.append(name);

    let planets = $(`<div class="fields">
        <div class="name">${loc('genelab_red')} <b-input v-model="g.red" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_hell')} <b-input v-model="g.hell" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_gas')} <b-input v-model="g.gas" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_gas_moon')} <b-input v-model="g.gas_moon" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_dwarf')} <b-input v-model="g.dwarf" maxlength="20"></b-input></div></div>`);
    lab.append(planets);

    let tpPlanets = $(`<div class="fields">
        <div class="name">${loc('genelab_titan')} <b-input v-model="g.titan" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_enceladus')} <b-input v-model="g.enceladus" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_triton')} <b-input v-model="g.triton" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_eris')} <b-input v-model="g.eris" maxlength="20"></b-input></div></div>`);
    lab.append(tpPlanets);

    let genes = $(`<div class="sequence"></div>`);
    lab.append(genes);

    let fanatic = `<div id="geneLabFanatic" class="genus"><div class="has-text-caution header">${loc(`tech_fanaticism`)}</div><button class="button" @click="fanatic()">{{ g.fanaticism | fanaticism }}</button></div>`;

    let dGenus = 'humanoid';
    if (hybrid){
        dGenus = 'hybrid';
        let genus = `<div class="genus_selection">`;
        genus += `<div id="geneLabGenusA" class="genus"><div class="has-text-caution header">${loc('genelab_genus_a')}</div><button class="button" @click="genus(0)" v-html="$options.filters.genus(g.hybrid,0)"></button></div>`;
        genus += `<div id="geneLabGenusB" class="genus"><div class="has-text-caution header">${loc('genelab_genus_b')}</div><button class="button" @click="genus(1)" v-html="$options.filters.genus(g.hybrid,1)"></button></div>`;
        genus += `${fanatic}`;
        genus += `<div class="resetLab"><button class="button" @click="reset()">${loc('genelab_reset')}</button></div>`;
        genus += `</div>`;
        genes.append($(genus));
    }
    else {
        let genus = `<div class="genus_selection">`;
        genus += `<div id="geneLabGenus" class="genus"><div class="has-text-caution header">${loc('genelab_genus')}</div><button class="button" @click="genus()">{{ g.genus | genus }}</button></div>`;
        genus += `${fanatic}`;
        genus += `<div class="resetLab"><button class="button" @click="reset()">${loc('genelab_reset')}</button></div>`;
        genus += `</div>`;
        genes.append($(genus));
    }

    let slot = hybrid ? 'race1' : 'race0';
    let genome = global.hasOwnProperty('custom') && global.custom.hasOwnProperty(slot) ? {
        name: global.custom[slot].name,
        desc: global.custom[slot].desc,
        entity: global.custom[slot].entity,
        home: global.custom[slot].home,
        red: global.custom[slot].red,
        hell: global.custom[slot].hell,
        gas: global.custom[slot].gas,
        gas_moon: global.custom[slot].gas_moon,
        dwarf: global.custom[slot].dwarf,
        titan: global.custom[slot].titan || planetName().titan,
        enceladus: global.custom[slot].enceladus || planetName().enceladus,
        triton: global.custom[slot].triton || planetName().triton,
        eris: global.custom[slot].eris || planetName().eris,
        genes: 0,
        genus: global.custom[slot].genus,
        traitlist: global.custom[slot].traits,
        ranks: global.custom[slot]?.ranks || {},
        fanaticism: global.custom[slot].hasOwnProperty('fanaticism') && global.custom[slot].fanaticism ? global.custom[slot].fanaticism : false,
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
        titan: 'Necromancer',
        enceladus: 'Skeleton',
        triton: 'Rot',
        eris: 'Zombieland',
        genes: 10,
        genus: dGenus,
        traitlist: [],
        ranks: {},
        fanaticism: false,
    };

    if (hybrid){
        if (global.hasOwnProperty('custom') && global.custom.hasOwnProperty(slot)){
            genome['hybrid'] = global.custom[slot].hybrid;
        }
        else {
            genome['hybrid'] = ['humanoid','small'];
        }
    }

    for (let i=genome.traitlist.length - 1; i >= 0; i--){
        if (!traits.hasOwnProperty(genome.traitlist[i]) || !unlockedTraits.hasOwnProperty(genome.traitlist[i]) || traits[genome.traitlist[i]].type !== 'major'){
            genome.traitlist.splice(i,1);
        }
    }

    let unlockedTraits = {};
    let taxomized = { utility: {}, resource: {}, production: {}, combat: {} };;
    Object.keys(races).forEach(function (race){
        let type = races[race].type;
        if (
            isWiki
                ||
            (global.stats.achieve[`extinct_${race}`] && global.stats.achieve[`extinct_${race}`].l > 0)
                ||
            (global.stats.achieve[`genus_${type}`] && global.stats.achieve[`genus_${type}`].l > 0)
            ){
            if (races[race].hasOwnProperty('traits') && !['custom','hybrid','junker','sludge','ultra_sludge'].includes(race)){
                Object.keys(races[race].traits).forEach(function (trait){
                    if (traits[trait]?.taxonomy){
                        taxomized[traits[trait].taxonomy][trait] = true;
                        unlockedTraits[trait] = true;
                    }
                });
            }
        }
    });

    let trait_listing = $(`<b-tabs v-model="tt.t" @input="swapTab"></b-tabs>`);
    Object.keys(taxomized).sort().forEach(function (tax){
        let negative = '';
        let trait_list = `<b-tab-item><template slot="header"><h2 class="is-sr-only">${loc(`genelab_traits_${tax}`)}}</h2><span aria-hidden="true">${loc(`genelab_traits_${tax}`)}</span></template>`;
        trait_list += `<div class="trait_selection">`;
        Object.keys(taxomized[tax]).sort().forEach(function (trait){
            if (traits.hasOwnProperty(trait) && traits[trait].type === 'major'){
                if (traits[trait].val >= 0){
                    trait_list += `<div class="field t${trait}"><b-checkbox :disabled="allowed('${trait}')" :input="geneEdit()" v-model="g.traitlist" native-value="${trait}"><span class="has-text-success">${loc(`trait_${trait}_name`)}</span> (<span class="has-text-advanced">{{ '${trait}' | cost }}</span>)<span v-html="$options.filters.empower(g.traitlist,'${trait}')"></span></b-checkbox></div>`;
                }
                else {
                    negative += `<div class="field t${trait}"><b-checkbox :disabled="allowed('${trait}')" :input="geneEdit()" v-model="g.traitlist" native-value="${trait}"><span class="has-text-danger">${loc(`trait_${trait}_name`)}</span> (<span class="has-text-caution">{{ '${trait}' | cost }}</span>)<span v-html="$options.filters.empower(g.traitlist,'${trait}')"></span></b-checkbox></div>`;
                }
            }
        });
        trait_list += negative + `</div></b-tab-item>`;
        trait_listing.append($(trait_list));
    });

    let summary = `<b-tab-item id="traitSummary"><template slot="header"><h2 class="is-sr-only">${loc(`genelab_traits_summary`)}}</h2><span aria-hidden="true">${loc(`genelab_traits_summary`)}</span></template></b-tab-item>`;
    trait_listing.append(summary);

    genes.append(trait_listing);

    let buttons = `
        <hr>
        ${labStatus}
        <div class="importExport">
            <button class="button" @click="customImport">${loc('genelab_import')}</button>
            <input type="file" class="fileImport" id="customFile" accept=".txt">
            <button class="button right" @click="customExport">${loc('genelab_export')}</button>
        </div>
        <div class="importExport">
            <span>{{ err.msg }}</span>
        </div>
    `;
    if (!isWiki){
        buttons += `
            <div class="create">
                <button class="button" @click="setRace()">${loc('genelab_create')}</button>
            </div>
        `;
    }
    lab.append(buttons);

    genome.genes = calcGenomeScore(genome,(isWiki ? wikiVars : false));
    let error = { msg: "" };

    var modal = {
        template: '<div id="modalBox" class="modalBox"></div>'
    };

    let tRanks = {};
    let activeTab = { t: 0 };
    vBind({
        el: '#celestialLab',
        data: {
            g: genome,
            w: wikiVars,
            err: error,
            tt: activeTab
        },
        methods: {
            val(type){
                if (type === 'technophobe'){
                    if (wikiVars['technophobe'] < 0){
                        wikiVars['technophobe'] = 0;
                    }
                    else if (wikiVars['technophobe'] > 5){
                        wikiVars['technophobe'] = 5;
                    }
                }
                else {
                    if (wikiVars.ascended[type] < 0){
                        wikiVars.ascended[type] = 0;
                    }
                    else if (wikiVars.ascended[type] > 5){
                        wikiVars.ascended[type] = 5;
                    }
                }
            },
            geneEdit(){
                let newRanks = genome.traitlist.map(x => tRanks[x] ? { [x]: tRanks[x] } : { [x]: 1 });
                let ranks = {};
                newRanks.forEach(function(k){ Object.keys(k).forEach(function(t){ ranks[t] = k[t] }) });
                tRanks = ranks;
                genome.genes = calcGenomeScore(genome,(isWiki ? wikiVars : false),tRanks);
            },
            setRace(){
                if (genome.fanaticism && !genome.traitlist.includes(genome.fanaticism)){ return false; }
                if (calcGenomeScore(genome,false,tRanks) >= 0 && genome.name.length > 0 && genome.desc.length > 0 && genome.entity.length > 0 && genome.home.length > 0
                    && genome.red.length > 0 && genome.hell.length > 0 && genome.gas.length > 0 && genome.gas_moon.length > 0 && genome.dwarf.length > 0){

                    global.custom[slot] = {
                        name: genome.name,
                        desc: genome.desc,
                        entity: genome.entity,
                        home: genome.home,
                        red: genome.red,
                        hell: genome.hell,
                        gas: genome.gas,
                        gas_moon: genome.gas_moon,
                        dwarf: genome.dwarf,
                        titan: genome.titan,
                        enceladus: genome.enceladus,
                        triton: genome.triton,
                        eris: genome.eris,
                        genus: genome.genus,
                        traits: genome.traitlist,
                        fanaticism: genome.fanaticism,
                        ranks: tRanks
                    };
                    if (hybrid){
                        global.custom[slot]['hybrid'] = genome.hybrid;
                        apotheosis();
                    }
                    else {
                        ascend();
                    }
                }
            },
            allowed(t){
                if ((!['synthetic','hybrid'].includes(genome.genus) || (genome.hasOwnProperty('hybrid') && !genome.hybrid.includes('synthetic'))) && ['deconstructor','imitation'].includes(t)){
                    if (genome.traitlist.includes(t)){
                        genome.traitlist.splice(genome.traitlist.indexOf(t), 1);
                    }
                    return true;
                }
                return false;
            },
            reset(){
                genome.name = "";
                genome.desc = "";
                genome.entity = "";
                genome.home = "";
                genome.red = "";
                genome.hell = "";
                genome.gas = "";
                genome.gas_moon = "";
                genome.dwarf = "";
                genome.titan = "";
                genome.enceladus = "";
                genome.triton = "";
                genome.eris = "";
                genome.genus = dGenus;
                genome.traitlist = [];
                genome.ranks = {};
                genome.genes = calcGenomeScore(genome,(isWiki ? wikiVars : false), tRanks);
                genome.fanaticism = false;
            },
            fanatic(){
                this.$buefy.modal.open({
                    parent: this,
                    component: modal
                });
            
                var checkExist = setInterval(function() {
                    if ($('#modalBox').length > 0) {
                        clearInterval(checkExist);
                        
                        $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc(`genelab_fanatic_set`)}</p>`));
                        var body = $('<div id="specialModal" class="modalBody"></div>');
                        $('#modalBox').append(body);

                        let traits = `<div class="fanatic"><template><section>`;
                        genome.traitlist.forEach(function (trait){
                            if (trait !== 'imitation'){
                                traits += `<div class="field ${trait}"><b-radio v-model="fanaticism" native-value="${trait}">${loc(`trait_${trait}_name`)}</b-radio></div>`;
                            }
                        });
                        traits += `</section></template></div>`;
                        body.append($(traits));

                        vBind({
                            el: '#specialModal',
                            data: genome
                        });
                    }
                }, 50);
            },
            genus(slot){
                this.$buefy.modal.open({
                    parent: this,
                    component: modal
                });
            
                var checkExist = setInterval(function() {
                    if ($('#modalBox').length > 0) {
                        clearInterval(checkExist);
                        
                        $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc(`genelab_genus`)}</p>`));
                        var body = $('<div id="specialModal" class="modalBody"></div>');
                        $('#modalBox').append(body);

                        let genus = `<div class="genus_selection"><template><section>`;
                        Object.keys(genus_def).forEach(function (type){
                            if (type !== 'hybrid'){
                                if (isWiki || (global.stats.achieve[`genus_${type}`] && global.stats.achieve[`genus_${type}`].l > 0)){
                                    if (genome.genus === 'hybrid' && ((slot === 0 && type !== genome.hybrid[1]) || (slot === 1 && type !== genome.hybrid[0]))){
                                        genus += `<div class="field ${type}"><b-radio v-model="hybrid[${slot}]" native-value="${type}">${loc(`genelab_genus_${type}`)}</b-radio></div>`;
                                    }
                                    else if (genome.genus !== 'hybrid'){
                                        genus += `<div class="field ${type}"><b-radio v-model="genus" native-value="${type}">${loc(`genelab_genus_${type}`)}</b-radio></div>`;
                                    }
                                }
                            }
                        });
                        genus += `</section></template></div>`;
                        body.append($(genus));

                        vBind({
                            el: '#specialModal',
                            data: genome
                        });

                        Object.keys(genus_def).forEach(function (type){
                            if (isWiki || (global.stats.achieve[`genus_${type}`] && global.stats.achieve[`genus_${type}`].l > 0)){
                                if ((genome.genus !== 'hybrid') || (genome.genus === 'hybrid' && slot === 0 && type !== genome.hybrid[1]) || (genome.genus === 'hybrid' && slot === 1 && type !== genome.hybrid[0])){
                                    popover(`geneLabGenus${type}`, function(){
                                        let desc = $(`<div><div>${loc(`genelab_genus_${type}_desc`)}</div></div>`);
                                        Object.keys(genus_def[type].traits).forEach(function (t){
                                            if (traits[t]){
                                                let des = $(`<div></div>`);
                                                let opts = {
                                                    trank: genus_trank,
                                                    wiki: isWiki
                                                }
                                                getTraitDesc(des, t, opts);
                                                desc.append(des);
                                            }
                                        });
                                        return desc;
                                    },{
                                        elm: `#specialModal .${type}`,
                                        classes: `w30`,
                                        wide: true
                                    });
                                }
                            }
                        });
                    }
                }, 50);
            },
            swapTab(tab){
                if (tab === 4){
                    let container = $(`#traitSummary`);
                    clearElement(container);

                    let negative_sum = '';
                    let summary = `<div class="trait_selection summary">`;
                    genome.traitlist.sort().forEach(function (trait){
                        if (traits.hasOwnProperty(trait) && traits[trait].type === 'major'){
                            if (traits[trait].val >= 0){
                                summary += `<div class="field t${trait}">`;
                                summary += `<b-checkbox :input="geneEdit()" v-model="g.traitlist" native-value="${trait}"><span class="has-text-success">${loc(`trait_${trait}_name`)}</span> `;
                                summary += `[<span class="has-text-warning">${loc(`wiki_calc_cost`)}</span> <span>{{ '${trait}' | cost }}</span>, <span class="has-text-warning">${loc(`genelab_rank`)}</span> <span>{{ '${trait}' | tRank }}</span>]`;
                                summary += `<span v-html="$options.filters.empower(t.empowered,'${trait}')"></span>`;
                                summary += `</b-checkbox>`;
                                summary += `<span role="button" aria-label="${loc(`genelab_rank_lower`,[loc(`trait_${trait}_name`)])}" class="sub has-text-danger" @click="reduce('${trait}')"><span>-</span></span>`;
                                summary += `<span role="button" aria-label="${loc(`genelab_rank_higher`,[loc(`trait_${trait}_name`)])}" class="add has-text-success" @click="increase('${trait}')"><span>+</span></span>`;
                                summary += `</div>`;
                            }
                            else {
                                negative_sum += `<div class="field t${trait}">`;
                                negative_sum += `<b-checkbox :input="geneEdit()" v-model="g.traitlist" native-value="${trait}"><span class="has-text-danger">${loc(`trait_${trait}_name`)}</span> `;
                                negative_sum += `[<span class="has-text-warning">${loc(`wiki_calc_cost`)}</span> <span>{{ '${trait}' | cost }}</span>, <span class="has-text-warning">${loc(`genelab_rank`)}</span> <span>{{ '${trait}' | tRank }}</span>]`;
                                negative_sum += `<span v-html="$options.filters.empower(t.empowered,'${trait}')"></span>`;
                                negative_sum += `</b-checkbox>`;
                                negative_sum += `<span role="button" aria-label="${loc(`genelab_rank_lower`,[loc(`trait_${trait}_name`)])}" class="sub has-text-danger" @click="reduce('${trait}')"><span>-</span></span>`;
                                negative_sum += `<span role="button" aria-label="${loc(`genelab_rank_higher`,[loc(`trait_${trait}_name`)])}" class="add has-text-success" @click="increase('${trait}')"><span>+</span></span>`;
                                negative_sum += `</div>`;
                            }
                        }
                    });
                    summary += negative_sum + `</div>`;
                    container.append(summary);

                    vBind({
                        el: '#traitSummary .trait_selection',
                        data: {
                            g: genome,
                            t: tRanks
                        },
                        methods: {
                            geneEdit(){
                                let newRanks = genome.traitlist.map(x => tRanks[x] ? { [x]: tRanks[x] } : { [x]: 1 });
                                let ranks = {};
                                newRanks.forEach(function(k){ Object.keys(k).forEach(function(t){ ranks[t] = k[t] }) });
                                tRanks = ranks;
                                genome.genes = calcGenomeScore(genome,(isWiki ? wikiVars : false),tRanks);
                            },
                            reduce(t){
                                let unlock = global.stats.achieve[`extinct_${traits[t].origin}`] && global.stats.achieve[`extinct_${traits[t].origin}`].l || 0;
                                switch (tRanks[t]){
                                    case 0.25:
                                        if (unlock >= 5){
                                            tRanks[t] = 0.1;
                                        }
                                        break;
                                    case 0.5:
                                        if (unlock >= 4){
                                            tRanks[t] = 0.25;
                                        }
                                        break;
                                    case 1:
                                        if (unlock >= 3){
                                            tRanks[t] = 0.5;
                                        }
                                        break;
                                    case 2:
                                        tRanks[t] = 1;
                                        break;
                                    case 3:
                                        tRanks[t] = 2;
                                        break;
                                    case 4:
                                        tRanks[t] = 3;
                                        break;
                                }
                                vBind({el: `#traitSummary .trait_selection`},'update');
                                vBind({el: `#traitSummary .trait_selection`},'update');
                                let desc = $(`#traitLabActiveDesc`);
                                clearElement(desc);
                                let opts = {
                                    trank: tRanks[t] || 1,
                                    wiki: isWiki
                                }
                                getTraitDesc(desc, t, opts);
                            },
                            increase(t){
                                let unlock = global.stats.achieve[`extinct_${traits[t].origin}`] && global.stats.achieve[`extinct_${traits[t].origin}`].l || 0;
                                switch (tRanks[t]){
                                    case 0.1:
                                        tRanks[t] = 0.25;
                                        break;
                                    case 0.25:
                                        tRanks[t] = 0.5;
                                        break;
                                    case 0.5:
                                        tRanks[t] = 1;
                                        break;
                                    case 1:
                                        if (unlock >= 3){
                                            tRanks[t] = 2;
                                        }
                                        break;
                                    case 2:
                                        if (unlock >= 4){
                                            tRanks[t] = 3;
                                        }
                                        break;
                                    case 3:
                                        if (unlock >= 5){
                                            tRanks[t] = 4;
                                        }
                                        break;
                                }
                                vBind({el: `#traitSummary .trait_selection`},'update');
                                let desc = $(`#traitLabActiveDesc`);
                                clearElement(desc);
                                let opts = {
                                    trank: tRanks[t] || 1,
                                    wiki: isWiki
                                }
                                getTraitDesc(desc, t, opts);
                            }
                        },
                        filters: {
                            cost(trait){
                                return geneCost(genome,trait,tRanks);
                            },
                            tRank(trait){
                                return tRanks[trait];
                            },
                            empower(e,t){
                                let valid_empower = traits[t].val >= traits.empowered.vars(tRanks['empowered'] || 1)[0] && traits[t].val <= traits.empowered.vars(tRanks['empowered'] || 1)[1] && t !== 'empowered' && genome.traitlist.includes('empowered');
                                return valid_empower ? ` (<span class="has-text-caution">E</span>)` : ``;
                            }
                        }
                    });

                    genome.traitlist.sort().forEach(function (trait){
                        if (traits.hasOwnProperty(trait) && traits[trait].type === 'major'){
                            popover(`celestialLabtraitSelection${trait}Sum`, function(){
                                let desc = $(`<div id="traitLabActiveDesc"></div>`);
                                let opts = {
                                    trank: tRanks[trait] || 1,
                                    wiki: isWiki
                                }
                                getTraitDesc(desc, trait, opts);
                                return desc;
                            },{
                                elm: `#traitSummary .summary .t${trait}`,
                                classes: `w30`,
                                wide: true
                            });
                        }
                    });
                }
            },
            customImport(){
                let file = document.getElementById("customFile").files[0];
                if (file){
                    let reader = new FileReader();
                    reader.readAsText(file, "UTF-8");
                    reader.onload = function (evt) {
                        let importCustom = "";
                        try {
                            importCustom = JSON.parse(evt.target.result);
                        }
                        catch {
                            error.msg = loc(`string_pack_error`,[file.name]);
                            return;
                        }
                        let formatError = false;
                        Object.keys(genome).forEach(function (type){
                            if (type === 'fanaticism' && genome[type] === false){
                                return;
                            }
                            if (importCustom[type] && typeof genome[type] !== typeof importCustom[type]){
                                formatError = true;
                                return;
                            }
                        });
                        if (formatError){
                            error.msg = loc(`string_pack_error`,[file.name]);
                            console.log('format fail');
                            return;
                        }

                        Object.keys(genome).forEach(function (type){
                            if (importCustom[type]){
                                genome[type] = importCustom[type];
                            }
                        });
                        ['name','home','red','hell','gas','gas_moon','dwarf','titan','enceladus','triton','eris'].forEach(function(field){
                            if (!importCustom[field] && ['titan','enceladus','triton','eris'].includes(field)){
                                genome[field] = loc(`genus_${genome.genus}_solar_${field}`)
                            }
                            else if (genome[field].length > 20){
                                genome[field] = genome[field].substring(0, 20);
                            }
                        });
                        if (genome.entity.length > 40){
                            genome.entity = genome.entity.substring(0, 40);
                        }
                        if (genome.desc.length > 255){
                            genome.desc = genome.desc.substring(0, 255);
                        }
                        if (!isWiki && !(global.stats.achieve[`genus_${genome.genus}`] && global.stats.achieve[`genus_${genome.genus}`].l > 0)){
                            genome.genus = dGenus;
                        }
                        if (importCustom.genus !== 'hybrid' && hybrid){
                            genome['hybrid'] = [importCustom.genus, importCustom.genus === 'humanoid' ? 'small' : 'humanoid'];
                            genome.genus = 'hybrid';
                        }
                        else if (importCustom.genus === 'hybrid' && !hybrid){
                            genome.genus = importCustom.hybrid[0];
                            delete genome.hybrid;
                        }
                        let fixTraitlist = [];
                        for (let i=0; i < genome.traitlist.length; i++){
                            if (traits.hasOwnProperty(genome.traitlist[i]) && traits[genome.traitlist[i]].type === 'major' && unlockedTraits[genome.traitlist[i]] && !fixTraitlist.includes(genome.traitlist[i])){
                                fixTraitlist.push(genome.traitlist[i]);
                            }
                        }
                        genome.fanaticism = importCustom.hasOwnProperty('fanaticism') ? importCustom.fanaticism : false,
                        genome.traitlist = fixTraitlist;
                        genome.genes = calcGenomeScore(genome,(isWiki ? wikiVars : false),tRanks);

                        error.msg = "";
                    }
                    reader.onerror = function (evt) {
                        console.error("error reading file");
                    }
                }
            },
            customExport(){
                const downloadToFile = (content, filename, contentType) => {
                    const a = document.createElement('a');
                    const file = new Blob([content], {type: contentType});
                    a.href= URL.createObjectURL(file);
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(a.href);
                };
                downloadToFile(JSON.stringify(genome, null, 4), `evolve-${hybrid ? 'hybrid' : 'custom'}-${genome.name}.txt`, 'text/plain');
            }
        },
        filters: {
            cost(trait){
                return geneCost(genome,trait,tRanks);
            },
            untapped(genes){
                if (!genome.traitlist.includes(genome.fanaticism)){ genome.fanaticism = false; }
                let num = genes > 0 ? +((genes / (genes + 20) / 10 + 0.00024) * 100).toFixed(3) : 0;
                return `+${num}%`;
            },
            fanaticism(trait){
                return trait ? loc(`trait_${trait}_name`) : loc(`genelab_unset`);
            },
            genus(g,i){
                return typeof i === 'undefined' ? loc(`genelab_genus_${g}`) : loc(`genelab_genus_${g[i]}`);
            },
            empower(e,t){
                let valid_empower = traits[t].val >= traits.empowered.vars(tRanks['empowered'] || 1)[0] && traits[t].val <= traits.empowered.vars(tRanks['empowered'] || 1)[1] && t !== 'empowered' && genome.traitlist.includes('empowered');
                return valid_empower ? ` (<span class="has-text-caution">E</span>)` : ``;
            }
        }
    });

    let genus_trank = (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 4) ? 2 : 1;
    if (hybrid){
        ['A','B'].forEach(function(g){
            popover(`geneLabGenus${g}`, function(){
                let type = genome.hybrid[g === 'A' ? 0 : 1];
                let desc = $(`<div><div>${loc(`genelab_genus_${type}_desc`)}</div></div>`);
                Object.keys(genus_def[type].traits).forEach(function (t){
                    if (traits[t]){
                        let des = $(`<div></div>`);
                        let opts = {
                            trank: genus_trank,
                            wiki: isWiki
                        }
                        getTraitDesc(des, t, opts);
                        desc.append(des);
                    }
                });
                return desc;
            },{
                elm: `#geneLabGenus${g}`,
                classes: `w30`,
                wide: true
            });
        });
    }
    else {
        popover(`geneLabGenus`, function(){
            let type = genome.genus;
            let desc = $(`<div><div>${loc(`genelab_genus_${type}_desc`)}</div></div>`);
            Object.keys(genus_def[type].traits).forEach(function (t){
                if (traits[t]){
                    let des = $(`<div></div>`);
                    let opts = {
                        trank: genus_trank,
                        wiki: isWiki
                    }
                    getTraitDesc(des, t, opts);
                    desc.append(des);
                }
            });
            return desc;
        },{
            elm: `#geneLabGenus`,
            classes: `w30`,
            wide: true
        });
    }

    Object.keys(unlockedTraits).sort().forEach(function (trait){
        if (traits.hasOwnProperty(trait) && traits[trait].type === 'major'){
            popover(`celestialLabtraitSelection${trait}`, function(){
                let desc = $(`<div></div>`);
                let opts = {
                    trank: tRanks[trait] || 1,
                    wiki: isWiki
                }
                getTraitDesc(desc, trait, opts);
                return desc;
            },{
                elm: `#celestialLab .trait_selection .t${trait}`,
                classes: `w30`,
                wide: true
            });
        }
    });
}

function geneCost(genome,trait,tRanks){
    let max_complexity = 1;

    let active_genus = genome.genus === 'hybrid' ? genome.hybrid : [genome.genus];
    let oppose_genus = [];
    active_genus.forEach(function(g){
        oppose_genus = oppose_genus.concat(genus_def[g].oppose);
    });

    let taxonomy = traits[trait].taxonomy;
    let gene_cost = traits[trait].val;

    let complexity = { utility: 0, resource: 0, production: 0, combat: 0 };
    let neg_complexity = { utility: 0, resource: 0, production: 0, combat: 0 };
    for (let i=0; i<genome.traitlist.length; i++){
        if (traits[genome.traitlist[i]].val >= 0){
            complexity[traits[genome.traitlist[i]].taxonomy]++;
        }
        else {
            neg_complexity[traits[genome.traitlist[i]].taxonomy]++;
        }
    }
    if (traits[trait].val >= 0){
        if (genome.traitlist.includes(trait)){
            complexity[taxonomy]--;
        }
        if (complexity[taxonomy] > max_complexity){
            gene_cost += complexity[taxonomy] - max_complexity;
        }
    }
    else {
        if (genome.traitlist.includes(trait)){
            neg_complexity[taxonomy]--;
        }
        if (neg_complexity[taxonomy] >= max_complexity){
            gene_cost += neg_complexity[taxonomy];
        }
    }

    if (tRanks[trait] && tRanks[trait] !== 1){
        if (traits[trait].val >= 0){
            switch (tRanks[trait]){
                case 0.1:
                    gene_cost -= 3;
                    break;
                case 0.25:
                    gene_cost -= 2;
                    break;
                case 0.5:
                    gene_cost--;
                    break;
                case 2:
                    gene_cost = Math.max(Math.round(gene_cost * 1.5), gene_cost + 1);
                    break;
                case 3:
                    gene_cost = Math.max(Math.round(gene_cost * 2), gene_cost + 2);
                    break;
                case 4:
                    gene_cost = Math.max(Math.round(gene_cost * 2.5), gene_cost + 3);
                    break;
            }
            if (gene_cost < 1){ gene_cost = 1; }
        }
        else {
            switch (tRanks[trait]){
                case 0.1:
                    gene_cost -= 3;
                    break;
                case 0.25:
                    gene_cost -= 2;
                    break;
                case 0.5:
                    gene_cost--;
                    break;
                case 2:
                    gene_cost++;
                    break;
                case 3:
                    gene_cost += 2;
                    break;
                case 4:
                    gene_cost += 3;
                    break
            }
        }
    }

    let genus_origin = races[traits[trait].origin].type === 'hybrid' ? races[traits[trait].origin].hybrid : [races[traits[trait].origin].type];
    if (active_genus.filter(x => genus_origin.includes(x)).length > 0){ active_genus.filter(x => genus_origin.includes(x)).length === 1 ? gene_cost-- : gene_cost -= 2; }
    if (oppose_genus.filter(x => genus_origin.includes(x)).length > 0){ oppose_genus.filter(x => genus_origin.includes(x)).length === 1 ? gene_cost++ : gene_cost += 2; }

    return gene_cost;
}

export function terraformLab(wiki){
    if (!wiki && !global.race['noexport']){
        if (webWorker.w){
            webWorker.w.terminate();
        }
        if (!global['sim']){
            save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
        }

        let genusType = races[global.race.species].type === 'hybrid' ? global.race.maintype : races[global.race.species].type;
        unlockAchieve(`biome_${global.city.biome}`);
        unlockAchieve(`genus_${genusType}`);
        unlockAchieve(`lamentis`);
        if (global.race.species === 'junker'){
            unlockFeat('the_misery');
        }
        global.race['noexport'] = `Planet`;
        clearElement($(`#city`));
        global.settings.showCity = true;
        global.settings.showCivic = false;
        global.settings.showResearch = false;
        global.settings.showResources = false;
        global.settings.showGenetics = false;
        global.settings.showSpace = false;
        global.settings.showDeep = false;
        global.settings.showGalactic = false;
        global.settings.showPortal = false;
        global.settings.spaceTabs = 0;
    }

    let lab = $(`<div id="celestialLab" class="celestialLab"></div>`);

    let wikiVars = {
        ascended: {},
        lamentis: global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l ? global.stats.achieve.lamentis.l : 0
    };

    if (wiki){
        wiki.append(lab);
    }
    else {
        $(`#city`).append(lab);
    }

    lab.append(`<div><h3 class="has-text-danger">${loc('planetlab_title')}</h3> - <span class="has-text-warning">${loc('planetlab_points')} {{ p.pts }}</span></div>`);

    let pBiome = $(`<div class="sequence"></div>`);
    lab.append(pBiome);

    let dBiome = false;
    let biome = `<div class="genus_selection"><div class="has-text-caution">${loc('wiki_planet_biome')}</div><template><section>`;
    Object.keys(biomes).forEach(function (type){
        if (wiki || (global.stats.achieve[`biome_${type}`] && global.stats.achieve[`biome_${type}`].l > 0)){
            if (!dBiome){ dBiome = type; }
            biome = biome + `<div class="field ${type}"><b-radio v-model="p.biome" native-value="${type}">${biomes[type].label}</b-radio></div>`;
        }
    });
    biome = biome + `</section></template></div>`;
    pBiome.append($(biome));

    let trait_list = `<div class="planet_selection"><div class="has-text-warning">${loc('wiki_planet_trait')}</div><template><section>`;
    Object.keys(planetTraits).forEach(function (trait){
        if (
            wiki
                ||
            (global.stats.achieve[`atmo_${trait}`] && global.stats.achieve[`atmo_${trait}`].l > 0)
            ){
            trait_list = trait_list + `<div class="field t${trait}"><b-checkbox :input="pEdit()" v-model="p.traitlist" native-value="${trait}"><span class="has-text-success">${planetTraits[trait].label}</span></b-checkbox></div>`;
        }
    });
    trait_list = trait_list + `</section></template></div>`;
    pBiome.append($(trait_list));

    let geology = {};
    let geoList = ['Copper','Iron','Aluminium','Coal','Oil','Titanium','Uranium'];
    if (global.stats.achieve['whitehole']){
        geoList.push('Iridium');
    }

    let geo_list = `<div class="res_selection"><div class="has-text-warning">${loc('planetlab_res')}</div><template><section>`;
    geoList.forEach(function (res){
        geology[res] = 0;
        geo_list += `<div class="field t${res}"><div>${global.resource[res].name}</div><div>`;
        geo_list += `<span role="button" aria-label="export ${res}" class="sub has-text-danger" @click="less('${res}')"><span>-</span></span>`;
        geo_list += `<span class="current" v-html="$options.filters.res('${res}')"></span>`;
        geo_list += `<span role="button" aria-label="import ${res}" class="add has-text-success" @click="more('${res}')"><span>+</span></span>`;
        geo_list += `</div></div>`;
    });
    geo_list = geo_list + `</section></template></div>`;
    pBiome.append($(geo_list));

    let planet = {
        biome: dBiome,
        pts: 0,
        traitlist: [],
        geology: geology,
        orbit: global.city.calendar.orbit,
    };

    if (global.custom.hasOwnProperty('planet')){
        let uni = universeAffix();
        if (global.custom.planet.hasOwnProperty(uni)){
            let type = 's';
            if (global.custom.planet[uni][type]){
                planet = deepClone(global.custom.planet[uni][type]);
                planet.orbit = global.city.calendar.orbit;
                geoList.forEach(function (res){
                    if (planet.geology.hasOwnProperty(res)){
                        planet.geology[res] *= 100;
                    }
                    else {
                        planet.geology[res] = 0;
                    }
                });
            }
        }
    }

    planet.pts = terraformScore(planet,(wiki ? wikiVars : false));

    let buttons = `<div class="buttons">
        <div class="reset">
            <button class="button" @click="reset()">${loc('genelab_reset')}</button>
        </div>
    `;
    if (!wiki){
        buttons += `
            <div class="create">
                <button class="button" @click="setPlanet()">${loc('planetlab_create')}</button>
            </div>
        `;
    }
    buttons += `</div>`;
    lab.append(buttons);

    vBind({
        el: '#celestialLab',
        data: {
            p: planet,
            w: wikiVars
        },
        methods: {
            pEdit(){
                planet.pts = terraformScore(planet,(wiki ? wikiVars : false));
            },
            setPlanet(){
                if (terraformScore(planet) >= 0){
                    Object.keys(planet.geology).forEach(function (res){
                        if (planet.geology[res] === 0){
                            delete planet.geology[res];
                        }
                        else {
                            planet.geology[res] /= 100;
                        }
                    });
                    if (!global.custom.hasOwnProperty('planet')){
                        global.custom['planet'] = {};
                    }
                    let universe = universeAffix();
                    if (!global.custom.planet.hasOwnProperty(universe)){
                        global.custom.planet[universe] = {s: false};
                    }
                    let type = 's';
                    global.custom.planet[universe][type] = deepClone(planet);
                    delete global.custom.planet[universe][type].pts;
                    terraform(planet);
                }
            },
            reset(){
                planet.traitlist = [];
                Object.keys(planet.geology).forEach(function (res){
                    planet.geology[res] = 0;
                });
                planet.pts = terraformScore(planet,(wiki ? wikiVars : false));
            },
            less(r){
                planet.geology[r] -= keyMultiplier();
                if (planet.geology[r] < -20){
                    planet.geology[r] = -20;
                }
            },
            more(r){
                planet.geology[r] += keyMultiplier();
                let max = 30;
                if (global.stats.achieve['whitehole']){
                    max += global.stats.achieve['whitehole'].l * 5;
                }
                if (planet.biome === 'eden'){
                    max += 5;
                }
                if (planet.geology[r] > max){
                    planet.geology[r] = max;
                }
            }
        },
        filters: {
            res(r){
                return planet.geology[r];
            }
        }
    });
}

function terraformScore(planet,wiki){
    let pts = (planet.biome === 'eden' ? 0 : 10) + (global.stats.achieve['lamentis'] ? global.stats.achieve.lamentis.l * 10 : 0);
    if (global.race['truepath']){ pts *= 2; }
    pts -= planet.traitlist.length ** 3;
    let ts = 0;
    Object.keys(planet.geology).forEach(function (res){
        if (planet.geology[res] !== 0){
            pts -= planet.geology[res];
            ts++;
        }
    });
    if (ts > 3){
        pts -= (ts - 3) ** 2;
    }
    return pts;
}

export function isStargateOn(wiki){
    if (wiki){
        if (global.interstellar?.s_gate?.count){
            return Boolean(global.interstellar.s_gate.on);
        }
        return true; // If no stargate built yet, then act like it is on to show more information
    }
    return Boolean(p_on['s_gate']);
}
