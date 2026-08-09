import { global, p_on, support_on, sizeApproximation, keyMap, seededRandom } from './vars.js';
import { vBind, clearElement, popover, clearPopper, messageQueue, powerCostMod, powerModifier, spaceCostMultiplier, deepClone, calcPrestige, flib, darkEffect, adjustCosts, get_qlevel, timeCheck, timeFormat, buildQueue, getWeaselTechLevelRequirement } from './functions.js';
import { races, traits, orbitLength } from './races.js';
import { spatialReasoning, unlockContainers } from './resources.js';
import { armyRating, garrisonSize, soldierDeath, buildGarrison, govEffect } from './civics.js';
import { jobScale, job_desc, loadFoundry, limitCraftsmen } from './jobs.js';
import { production, highPopAdjust } from './prod.js';
import { actions, payCosts, powerOnNewStruct, setAction, drawTech, bank_vault, buildTemplate, casinoEffect, housingLabel, structName, initStruct } from './actions.js';
import { fuel_adjust, int_fuel_adjust, spaceTech, renderSpace, checkRequirements, incrementStruct, planetName } from './space.js';
import { defineGovernor, removeTask, govActive } from './governor.js';
import { defineIndustry, nf_resources, addSmelter, addFactoryLines, factoryCapacity, trimFactoryLines, factoryStructs, setupRituals, cancelRituals } from './industry.js';
import { arpa } from './arpa.js';
import { matrix, retirement, gardenOfEden } from './resets.js';
import { traitCostMod } from './races.js';
import { loadTab } from './index.js';
import { zombieGenociderTask, unlockFeat } from './achieve.js';
import { createGLContext, webglSupported } from './glmap.js';
import { loc } from './locale.js';

const outerTruth = {
    spc_titan: {
        info: {
            name(){
                return planetName().titan;
            },
            desc(){
                return loc('space_titan_info_desc',[planetName().titan, races[global.race.species].home]);
            },
            support: 'electrolysis',
            zone: 'outer',
            showDest(){
                let show = global.settings.space.titan || global.tech?.resettle >= 3 ? true : false;
                return {r: show, l: show};
            },
            syndicate(){ if (global.tech['resettle']){ return false; } return global.tech['titan'] && global.tech.titan >= 3 && global.tech['enceladus'] && global.tech.enceladus >= 2 ? true : false; },
            syndicate_cap(){
                if (global.tech['triton']){
                    return global.tech.outer >= 4 ? 2000 : 1000;
                }
                return 600;
            },
            // Shut off for the resettlement arc until the outer distress signals reopen the long legs.
            nav(){ return (global.settings.space.titan && !global.tech['resettle']) || global.tech?.resettle >= 12 ? true : false; }
        },
        titan_mission: {
            id: 'space-titan_mission',
            title(){
                return loc('space_mission_title',[planetName().titan]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().titan]);
            },
            reqs: { outer: 1 },
            grant: ['titan',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.titan >= 1 ? 0 : 1; },
            cost: {
                Helium_3(o,wiki){ return +fuel_adjust(250000,false,wiki).toFixed(0); },
                Elerium(){ return 100; }
            },
            effect(){
                return loc('space_titan_mission_effect',[planetName().titan]);
            },
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_titan_mission_action',[planetName().titan, races[global.race.species].home]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        titan_spaceport: {
            id: 'space-titan_spaceport',
            title(){ return loc('space_red_spaceport_title'); },
            desc(){ return `<div>${loc('space_red_spaceport_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            type: 'outpost',
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
                let support = global.tech['enceladus'] && global.tech.enceladus >= 2 ? `<div>+${loc(`galaxy_alien2_support`,[$(this)[0].support(),planetName().enceladus])}</div>` : ``;
                let storage = global.tech['titan'] && global.tech.titan >= 5 ? `<div>${loc(`space_titan_spaceport_storage`,[25])}</div>` : ``;
                return `${support}${water}${storage}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            support(){ return 2; },
            powered(){ return powerCostMod(10); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('titan_spaceport');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['titan_spaceport','space']
                };
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
            title(){ return loc('space_electrolysis_title'); },
            desc(){ return `<div>${loc('space_electrolysis_title')}</div><div class="has-text-special">${loc('space_electrolysis_req',[global.resource.Water.name])}</div>`; },
            type: 'industry',
            reqs: { titan: 3 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('electrolysis', offset, 1000000, 1.25); },
                Copper(offset){ return spaceCostMultiplier('electrolysis', offset, 185000, 1.25); },
                Steel(offset){ return spaceCostMultiplier('electrolysis', offset, 220000, 1.25); },
                Polymer(offset){ return spaceCostMultiplier('electrolysis', offset, 380000, 1.25); }
            },
            effect(wiki){
                let support = `<div>+${loc(`galaxy_alien2_support`,[$(this)[0].support(wiki),planetName().titan])}</div>`;
                return `${support}<div class="has-text-caution">${loc('space_electrolysis_use',[$(this)[0].support_fuel().a,global.resource.Water.name,$(this)[0].powered()])}</div>`;
            },
            support(wiki){
                // Positronium electrolysis splits water harder than the AI core ever managed at it. Either
                // upgrade takes the plant to three and they do not stack — which matters on the resettle
                // path, where the AI cores are gone by the time this tech is reachable.
                if (global.tech['titan'] && global.tech.titan >= 11){ return 3; }
                return global.tech['titan_ai_core'] && global.tech.titan_ai_core >= 2 && (wiki ? global.space.ai_core2.on : p_on['ai_core2']) ? 3 : 2;
            },
            support_fuel(){ return { r: 'Water', a: 35 }; },
            powered(){ return powerCostMod(8); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('electrolysis');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['electrolysis','space']
                };
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
            title(){ return loc('space_hydrogen_plant_title'); },
            desc(){ return `<div>${loc('space_hydrogen_plant_title')}</div><div class="has-text-special">${loc('space_hydrogen_plant_req')}</div>`; },
            type: 'power',
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
                    incrementStruct('hydrogen_plant');
                    if (global.space.electrolysis.on > global.space.hydrogen_plant.on){
                        global.space.hydrogen_plant.on++;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['hydrogen_plant','space']
                };
            }
        },
        titan_quarters: {
            id: 'space-titan_quarters',
            title(){ return loc('interstellar_habitat_title'); },
            desc(){
                return `<div>${loc('interstellar_habitat_title')}</div><div class="has-text-special">${loc('space_habitat_req',[planetName().titan, global.resource.Food.name, global.resource.Water.name])}</div>`;
            },
            type: 'housing',
            reqs: { titan: 4 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('titan_quarters', offset, 1200000, 1.28); },
                Furs(offset){ return spaceCostMultiplier('titan_quarters', offset, 85000, 1.28); },
                Plywood(offset){ return spaceCostMultiplier('titan_quarters', offset, 100000, 1.28); },
                Horseshoe(){ return global.race['hooved'] ? 1 : 0; }
            },
            effect(){
                let gain = jobScale(1);
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().titan])}</div><div>${loc('plus_max_resource',[jobScale(1),global.race['truepath'] ? loc('job_colonist_tp',[planetName().titan]) : loc('colonist')])}</div><div>${loc('plus_max_resource',[gain,loc('citizen')])}</div><div class="has-text-caution">${loc(`spend`,[$(this)[0].support_fuel()[0].a,global.resource[$(this)[0].support_fuel()[0].r].name])}</div><div class="has-text-caution">${loc(`spend`,[$(this)[0].support_fuel()[1].a,global.resource[$(this)[0].support_fuel()[1].r].name])}</div>`;
            },
            s_type: 'titan',
            support(){ return -1; },
            support_fuel(){ return [{ r: 'Water', a: 12 },{ r: 'Food', a: 500 }]; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('titan_quarters');
                    global.civic.titan_colonist.display = true;
                    if (powerOnNewStruct($(this)[0])){
                        global.resource[global.race.species].max += jobScale(1);

                        let hiredMax = jobScale(1);
                        global.civic.titan_colonist.max += hiredMax;

                        let hired = Math.min(hiredMax, global.civic[global.civic.d_job].workers);
                        global.civic[global.civic.d_job].workers -= hired;
                        global.civic.titan_colonist.workers += hired;
                    }
                    if (global.space.titan_quarters.count === 1){
                        renderSpace();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['titan_quarters','space']
                };
            },
            citizens(){
                let gain = 1;
                if (global.race['high_pop']){
                    gain *= traits.high_pop.vars()[0];
                }
                return gain;
            }
        },
        titan_mine: {
            id: 'space-titan_mine',
            title(){ return structName('mine'); },
            desc(){
                return `<div>${loc('space_red_mine_desc')}</div><div class="has-text-special">${loc('space_support',[planetName().titan])}</div>`;
            },
            type: 'mining',
            reqs: { titan: 4 },
            condition(){ return global.space['titan_quarters'] && global.space.titan_quarters.count > 0 ? true : false; },
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
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().titan])}</div><div>${loc('space_red_mine_effect',[adamantite,global.resource.Adamantite.name])}</div><div>${loc('space_red_mine_effect',[aluminium,global.resource.Aluminium.name])}</div>`;
                if (global.tech['resettle']){
                    let stone = +(production('titan_mine','stone')).toFixed(4);
                    desc += `<div>${loc('space_red_mine_effect',[stone,global.resource.Stone.name])}</div>`;
                }
                if (global.tech['resettle'] && global.resource.Chrysotile.display){
                    let chrysotile = +(production('titan_mine','chrysotile')).toFixed(4);
                    desc += `<div>${loc('space_red_mine_effect',[chrysotile,global.resource.Chrysotile.name])}</div>`;
                }
                return desc;
            },
            s_type: 'titan',
            support(){ return -1; },
            powered(){ return 0; },
            special(){ return true; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('titan_mine');
                    powerOnNewStruct($(this)[0]);
                    if (global.space.titan_mine.count === 1){
                        global.resource.Adamantite.display = true;
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, ratio: 90 },
                    p: ['titan_mine','space']
                };
            }
        },
        storehouse: {
            id: 'space-storehouse',
            title(){ return loc('space_storehouse_title'); },
            desc(){ return loc('space_storehouse_title'); },
            type: 'storage',
            reqs: { titan: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('storehouse', offset, 175000, 1.28); },
                Lumber(offset){ return spaceCostMultiplier('storehouse', offset, 100000, 1.28); },
                Aluminium(offset){ return spaceCostMultiplier('storehouse', offset, 120000, 1.28); },
                Cement(offset){ return spaceCostMultiplier('storehouse', offset, 45000, 1.28); }
            },
            wide: true,
            res(){
                let res = [
                    'Lumber','Stone','Furs','Copper','Iron','Aluminium','Cement','Coal','Steel','Titanium',
                    'Alloy','Polymer','Iridium','Chrysotile','Nano_Tube','Neutronium','Adamantite'
                ];
                if (global.resource.Tungsten.display){
                    res.push('Tungsten');
                }
                return res;
            },
            heavy(res){
                return ['Copper','Iron','Steel','Titanium','Iridium','Neutronium','Adamantite','Tungsten'].includes(res) ? true : false;
            },
            val(res){
                switch (res){
                    case 'Lumber':
                        return 3000;
                    case 'Stone':
                        return 3000;
                    case 'Chrysotile':
                        return 3000;
                    case 'Furs':
                        return 1700;
                    case 'Copper':
                        return 1520;
                    case 'Iron':
                        return 1400;
                    case 'Aluminium':
                        return 1280;
                    case 'Tungsten':
                        return 480;
                    case 'Cement':
                        return 1120;
                    case 'Coal':
                        return 480;
                    case 'Steel':
                        return 240;
                    case 'Titanium':
                        return 160;
                    case 'Alloy':
                        return 180;
                    case 'Polymer':
                        return 150;
                    case 'Iridium':
                        return 175;
                    case 'Nano_Tube':
                        return 120;
                    case 'Neutronium':
                        return 64;
                    case 'Adamantite':
                        return 72;
                    default:
                        return 0;
                }
            },
            effect(wiki){
                let storage = '<div class="aTable">';
                let multiplier = tpStorageMultiplier('storehouse',false,wiki);
                let h_multiplier = tpStorageMultiplier('storehouse',true,wiki);
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let heavy = $(this)[0].heavy(res);
                        let val = sizeApproximation(+(spatialReasoning($(this)[0].val(res)) * (heavy ? h_multiplier : multiplier)).toFixed(0),1);
                        storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                storage = storage + '</div>';
                return storage;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('storehouse');
                    let multiplier = tpStorageMultiplier('storehouse',false);
                    let h_multiplier = tpStorageMultiplier('storehouse',true);
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
                    p: ['storehouse','space']
                };
            }
        },
        titan_bank: {
            id: 'space-titan_bank',
            title(){ return loc('city_bank'); },
            desc(){
                return loc('city_bank_desc',[planetName().titan]);
            },
            type: 'finance',
            reqs: { titan: 6 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('titan_bank', offset, traitCostMod('untrustworthy',2500000), 1.32); },
                Titanium(offset){ return spaceCostMultiplier('titan_bank', offset, traitCostMod('untrustworthy',380000), 1.32); },
                Neutronium(offset){ return spaceCostMultiplier('titan_bank', offset, traitCostMod('untrustworthy',5000), 1.32); }
            },
            effect(){
                let vault = bank_vault() * 2;
                vault = spatialReasoning(vault);
                vault = (+(vault).toFixed(0)).toLocaleString();
                return loc('plus_max_resource',[`\$${vault}`,loc('resource_Money_name')]);
            },
            action(){
                if (payCosts($(this)[0])){
                    global['resource']['Money'].max += spatialReasoning(1800);
                    incrementStruct('titan_bank');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['titan_bank','space']
                };
            }
        },
        g_factory: {
            id: 'space-g_factory',
            title(){ return loc('interstellar_g_factory_title'); },
            desc(){ return `<div>${loc('interstellar_g_factory_title')}</div><div class="has-text-special">${loc('space_support',[planetName().titan])}</div>`; },
            type: 'industry',
            reqs: { graphene: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('g_factory', offset, 950000, 1.28); },
                Copper(offset){ return spaceCostMultiplier('g_factory', offset, 165000, 1.28); },
                Stone(offset){ return spaceCostMultiplier('g_factory', offset, 220000, 1.28); },
                Adamantite(offset){ return spaceCostMultiplier('g_factory', offset, 12500, 1.28); }
            },
            effect(){
                let graphene = 0.05;
                if (global.race['high_pop']){
                    graphene = +(highPopAdjust(graphene)).toFixed(3);
                }
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().titan])}</div><div>${loc('space_red_mine_effect',[graphene,global.resource.Graphene.name])}</div><div>${loc('interstellar_g_factory_effect')}</div>`;
            },
            s_type: 'titan',
            support(){ return -1; },
            powered(){ return 0; },
            special: true,
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('g_factory');
                    global.resource.Graphene.display = true;
                    if (powerOnNewStruct($(this)[0])){
                        if (global.race['kindling_kindred'] || global.race['smoldering']){
                            global.space.g_factory.Oil++;
                        }
                        else {
                            global.space.g_factory.Lumber++;
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
                    p: ['g_factory','space']
                };
            }
        },
        metalworks: {
            id: 'space-metalworks',
            title(){ return loc('space_metalworks_title'); },
            desc(){ return `<div>${loc('space_metalworks_title')}</div><div class="has-text-special">${loc('space_support',[planetName().titan])}</div>`; },
            type: 'industry',
            reqs: { titan: 10 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('metalworks', offset, 425000000, 1.28); },
                Coal(offset){ return spaceCostMultiplier('metalworks', offset, 4200000, 1.28); },
                Graphene(offset){ return spaceCostMultiplier('metalworks', offset, 2600000, 1.28); },
                Neutronium(offset){ return spaceCostMultiplier('metalworks', offset, 165000, 1.28); }
            },
            effect(wiki){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().titan])}</div>`;
                desc += `<div>${loc('space_metalworks_effect',[1,planetName().titan])}</div>`;
                let split = '<div class="aTable center">';
                for (const res of $(this)[0].res()){
                    let boost = +((production('metalworks',res,wiki) - 1) * 100).toFixed(2);
                    split += `<span>${loc('space_metalworks_effect2',[global.resource[res].name,boost])}</span>`;
                }
                desc += split + '</div>';
                return desc;
            },
            // Metals the works divides its pool between, in the order the UI lists them. The effect text,
            // the industry panel and the production loop all read this one list.
            res(){
                return ['Steel','Iridium','Iron','Copper','Aluminium','Titanium'];
            },
            s_type: 'titan',
            support(){ return -1; },
            powered(){ return 0; },
            special: true,
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('metalworks');
                    powerOnNewStruct($(this)[0]);
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            },
            struct(){
                let d = { count: 0, on: 0 };
                // Start with the pool split evenly and fully assigned; an uneven split hands the spare
                // points out one each from the top of the list so the shares always total 100.
                let metals = $(this)[0].res();
                let share = Math.floor(100 / metals.length);
                let spare = 100 - (share * metals.length);
                metals.forEach(function(res,i){ d[res] = share + (i < spare ? 1 : 0); });
                return {
                    d: d,
                    p: ['metalworks','space']
                };
            }
        },
        sam: {
            id: 'space-sam',
            title(){ return loc('space_sam_title'); },
            desc(){
                return `<div>${loc('space_sam_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'military',
            reqs: { titan: 7 },
            condition(){ return !global.tech['resettle'] ? true : false; },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('sam', offset, 2500000, 1.28); },
                Steel(offset){ return spaceCostMultiplier('sam', offset, 450000, 1.28); },
                Elerium(offset){ return spaceCostMultiplier('sam', offset, 120, 1.28); },
                Brick(offset){ return spaceCostMultiplier('sam', offset, 160000, 1.28); },
            },
            effect(){
                let desc = `<div>${loc('galaxy_defense_platform_effect',[25])}</div>`;
                return desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(5); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('sam');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['sam','space']
                };
            },
            post(){
                vBind({el: `#spc_titansynd`},'update');
            }
        },
        decoder: {
            id: 'space-decoder',
            title(){ return loc('space_decoder_title'); },
            desc(){
                return `<div>${loc('space_decoder_title')}</div><div class="has-text-special">${loc('requires_power_support_combo',[planetName().titan, global.resource.Cipher.name])}</div>`;
            },
            type: 'science',
            reqs: { titan: 8 },
            condition(){ return !global.tech['resettle'] ? true : false; },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('decoder', offset, 12500000, 1.275); },
                Elerium(offset){ return spaceCostMultiplier('decoder', offset, 750, 1.275); },
                Orichalcum(offset){ return spaceCostMultiplier('decoder', offset, 330000, 1.275); },
                Quantium(offset){ return spaceCostMultiplier('decoder', offset, 180000, 1.275); },
            },
            effect(wiki){
                let cipher = $(this)[0].support_fuel().a;
                let know = 2500;
                if (global.race['high_pop']){
                    know = highPopAdjust(know);
                }
                if (wiki ? (global.space?.ai_core2?.on ?? 0) : p_on['ai_core2']){
                    know *= 1.25;
                }
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().titan])}</div>`;
                desc += `<div>${loc('space_red_exotic_lab_effect1',[know])}</div>`;
                return desc + `<div class="has-text-caution">${loc('spend',[cipher,global.resource[$(this)[0].support_fuel().r].name])}</div>`;
            },
            s_type: 'titan',
            support(){ return -1; },
            powered(){ return 0; },
            support_fuel(){ return { r: 'Cipher', a: 0.06 }; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('decoder');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['decoder','space']
                };
            }
        },
        ai_core: {
            id: 'space-ai_core',
            title(){ return loc('space_ai_core'); },
            desc(wiki){
                if (!global.space.hasOwnProperty('ai_core') || global.space.ai_core.count < 100 || wiki){
                    return `<div>${loc('space_ai_core')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>` + (global.space.hasOwnProperty('ai_core') && global.space.ai_core.count >= 100 ? `<div class="has-text-special">${loc('requires_power')}</div>` : ``);
                }
                else {
                    return `<div>${loc('space_ai_core')}</div>`;
                }
            },
            type: 'megaproject',
            reqs: { titan: 9 },
            path: ['truepath'],
            condition(){
                return global.space.ai_core.count >= 100 || global.tech['resettle'] ? false : true;
            },
            queue_size: 10,
            queue_complete(){ return 100 - global.space.ai_core.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 2500000 : 0; },
                Cement(offset){ return ((offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 180000 : 0; },
                Aluminium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 250000 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 250 : 0; },
                Nano_Tube(offset){ return ((offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 125000 : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 50000 : 0; },
                Quantium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 100000 : 0; },
                Cipher(offset){ return ((offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 750 : 0; },
            },
            effect(wiki){
                let effectText = `<div>${loc('space_ai_core_effect')}</div>`;
                let count = ((wiki?.count ?? 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0));
                if (count < 100){
                    let remain = 100 - count;
                    effectText += `<div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return outerTruth.spc_titan.ai_core2.effect(wiki);
                }
                return effectText;
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.space.ai_core.count < 100){
                        incrementStruct('ai_core');
                        if (global.space.ai_core.count >= 100){
                            global.tech['titan_ai_core'] = 1;
                            initStruct(outerTruth.spc_titan.ai_core2);
                            incrementStruct('ai_core2','space');
                            powerOnNewStruct(outerTruth.spc_titan.ai_core2);
                            renderSpace();
                            drawTech();
                            if (global.city.ptrait.includes('kamikaze') && !global.race['tidal_decay']){
                                messageQueue(loc('planet_kamikaze_stabilize',[races[global.race.species].home,100]),'info',false,['progress']);
                            }
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['ai_core','space']
                };
            }
        },
        ai_core2: {
            id: 'space-ai_core2',
            title(){ return loc('space_ai_core'); },
            desc(){
                return `<div>${loc('space_ai_core')}</div><div class="has-text-special">${loc('space_electrolysis_req',[global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            type: 'megaproject',
            reqs: { titan_ai_core: 1 },
            path: ['truepath'],
            condition(){
                return !global.tech['resettle'] && global.space.hasOwnProperty('ai_core') && global.space.ai_core.count >= 100 ? true : false;
            },
            wiki: false,
            queue_complete(){ return 0; },
            cost: {},
            powered(){
                return powerCostMod(100);
            },
            p_fuel(){ return { r: 'Water', a: 1000 }; },
            effect(wiki){
                let value = 25;
                let desc = `<div class="has-text-warning">${loc('interstellar_citadel_stat',[+(get_qlevel(wiki)).toFixed(1)])}</div>`;
                desc += `<div>${loc('interstellar_citadel_effect',[value])}</div><div>${loc('space_ai_core_effect2',[value])}</div>`;
                if (global.tech['titan_ai_core'] && global.tech.titan_ai_core >= 2){
                    desc += `<div>${loc('space_ai_core_effect3',[50])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('space_electrolysis_use',[$(this)[0].p_fuel().a,global.resource[$(this)[0].p_fuel().r].name,$(this)[0].powered()])}</div>`;
                if (global.tech['titan_ai_core'] && global.tech.titan_ai_core >= 3){
                    let drift = +calcAIDrift(wiki).toFixed(1);
                    desc += `<div class="has-text-advanced">${loc('space_ai_core_effect4',[drift])}</div>`;
                }
                return desc;
            },
            action(){
                return false;
            },
            flair(){
                return global.space.hasOwnProperty('ai_core2') && global.space.ai_core2.on >= 1 ? loc(`space_ai_core_flair`) : loc(`space_ai_core_flair2`);
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['ai_core2','space']
                };
            }
        },
        ai_colonist: {
            id: 'space-ai_colonist',
            title(){ return loc('space_ai_colonist_title'); },
            desc(){
                return `<div>${loc('space_ai_colonist_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'housing',
            reqs: { titan_ai_core: 3 },
            condition(){ return !global.tech['resettle'] ? true : false; },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('ai_colonist', offset, 112000000, 1.35); },
                Alloy(offset){ return spaceCostMultiplier('ai_colonist', offset, 750000, 1.35); },
                Elerium(offset){ return spaceCostMultiplier('ai_colonist', offset, 500, 1.35); },
                Nano_Tube(offset){ return spaceCostMultiplier('ai_colonist', offset, 525000, 1.35); },
                Quantium(offset){ return spaceCostMultiplier('ai_colonist', offset, 150000, 1.35); },
                Cipher(offset){ return spaceCostMultiplier('ai_colonist', offset, 10000, 1.35); },
            },
            effect(){
                return `<div>${loc('plus_max_resource',[jobScale(1),global.race['truepath'] ? loc('job_colonist_tp',[planetName().titan]) : loc('colonist')])}</div><div>${loc('space_ai_colonist_effect',[jobScale(1),planetName().titan])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(10); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('ai_colonist');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['ai_colonist','space']
                };
            },
            flair: loc(`tech_combat_droids_flair`)
        },
        wonder_gardens: {
            id: 'space-wonder_gardens',
            title(){
                return loc('space_wonder_gardens',[planetName().titan]);
            },
            desc(){
                return loc('space_wonder_gardens',[planetName().titan]);
            },
            reqs: {},
            condition(){
                return global.race['wish'] && global.race['wishStats'] && global.portal['wonder_gardens'] ? true : false;
            },
            trait: ['wish'],
            queue_complete(){ return false; },
            effect(){
                return loc(`city_wonder_effect`,[5]);
            },
            action(){
                return false;
            }
        },
    },
    spc_enceladus: {
        info: {
            name(){
                return planetName().enceladus;
            },
            desc(){
                return loc('space_enceladus_info_desc',[planetName().enceladus, races[global.race.species].home]);
            },
            support: 'titan_spaceport',
            zone: 'outer',
            showDest(){
                let show = global.settings.space.enceladus || global.tech?.resettle >= 3 ? true : false;
                return {r: show, l: show};
            },
            syndicate(){ if (global.tech['resettle']){ return false; } return global.tech['titan'] && global.tech.titan >= 3 && global.tech['enceladus'] && global.tech.enceladus >= 2 ? true : false; },
            syndicate_cap(){
                if (global.tech['triton']){
                    return global.tech.outer >= 4 ? 1500 : 1000;
                }
                return 600;
            },
            // Shut off for the resettlement arc until the outer distress signals reopen the long legs.
            nav(){ return !global.tech['resettle'] || global.tech.resettle >= 12 ? true : false; }
        },
        enceladus_mission: {
            id: 'space-enceladus_mission',
            title(){
                return loc('space_mission_title',[planetName().enceladus]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().enceladus]);
            },
            reqs: { outer: 1 },
            grant: ['enceladus',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.enceladus >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(250000,false,wiki).toFixed(0); },
                Elerium(){ return 100; }
            },
            effect(){
                return loc('space_titan_mission_effect',[planetName().enceladus]);
            },
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_enceladus_mission_action',[planetName().enceladus]),'info',false,['progress']);
                    global.resource.Water.display = true;
                    return true;
                }
                return false;
            }
        },
        water_freighter: {
            id: 'space-water_freighter',
            title(){ return loc('space_water_freighter_title'); },
            desc(){
                return `<div>${loc('space_water_freighter_title')}</div><div class="has-text-special">${loc('space_support',[planetName().enceladus])}</div>`;
            },
            type: 'ship',
            reqs: { enceladus: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('water_freighter', offset, 450000, 1.25); },
                Iron(offset){ return spaceCostMultiplier('water_freighter', offset, 362000, 1.25); },
                Nano_Tube(offset){ return spaceCostMultiplier('water_freighter', offset, 125000, 1.25); },
                Sheet_Metal(offset){ return spaceCostMultiplier('water_freighter', offset, 75000, 1.25); }
            },
            effect(wiki){
                let helium = +fuel_adjust(5,true,wiki).toFixed(2);
                let water = +(production('water_freighter')).toFixed(2);
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().enceladus])}</div><div>${loc('produce',[water,global.resource.Water.name])}</div><div class="has-text-caution">${loc(`space_belt_station_effect3`,[helium])}</div>`;
            },
            s_type: 'enceladus',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('water_freighter');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['water_freighter','space']
                };
            }
        },
        zero_g_lab: {
            id: 'space-zero_g_lab',
            title(){ return loc('tech_zero_g_lab'); },
            desc(){
                return `<div>${loc('tech_zero_g_lab')}</div><div class="has-text-special">${loc('requires_power_support',[planetName().enceladus])}</div>`;
            },
            type: 'science',
            reqs: { enceladus: 3 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('zero_g_lab', offset, 5000000, 1.25); },
                Alloy(offset){ return spaceCostMultiplier('zero_g_lab', offset, 125000, 1.25); },
                Graphene(offset){ return spaceCostMultiplier('zero_g_lab', offset, 225000, 1.25); },
                Stanene(offset){ return spaceCostMultiplier('zero_g_lab', offset, 600000, 1.25); }
            },
            effect(){
                let synd = syndicate('spc_enceladus');
                let know = Math.round(10000 * synd);

                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().enceladus])}</div><div>${loc('city_max_knowledge',[know])}</div>`;
                if (global.resource.Quantium.display){
                    desc = desc + `<div>${loc('space_zero_g_lab_effect',[jobScale(1)])}</div>`;
                }
                if (global.resource.Cipher.display){
                    desc = desc + `<div>${loc('plus_max_resource',[10000,global.resource.Cipher.name])}</div>`;
                }
                return desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            s_type: 'enceladus',
            support(){ return -1; },
            powered(){ return powerCostMod(12); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('zero_g_lab');
                    powerOnNewStruct($(this)[0]);
                    if (global.space.zero_g_lab.count === 1 && global.tech['quantium']){
                        loadFoundry();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['zero_g_lab','space']
                };
            },
            postPower(on){
                limitCraftsmen('Quantium');
            }
        },
        operating_base: {
            id: 'space-operating_base',
            title(){ return loc('tech_operating_base'); },
            desc(){
                return `<div>${loc('tech_operating_base')}</div><div class="has-text-special">${loc('requires_power_support',[planetName().enceladus])}</div>`;
            },
            type: 'military',
            reqs: { enceladus: 4 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('operating_base', offset, 7500000, 1.3); },
                Furs(offset){ return spaceCostMultiplier('operating_base', offset, 500000, 1.3); },
                Adamantite(offset){ return spaceCostMultiplier('operating_base', offset, 375000, 1.3); },
                Stanene(offset){ return spaceCostMultiplier('operating_base', offset, 750000, 1.3); },
                Mythril(offset){ return spaceCostMultiplier('operating_base', offset, 225000, 1.3); },
                Horseshoe(){ return global.race['hooved'] ? 4 : 0; }
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().enceladus])}</div>`;
                desc += `<div>${loc('galaxy_defense_platform_effect',[50])}</div>`;
                desc += loc('plus_max_resource',[$(this)[0].soldiers(),loc('civics_garrison_soldiers')]);
                if (global.race['orbit_decayed']){
                    let healing = global.tech['medic'] * 5;
                    desc += `<div>${loc('city_hospital_effect',[healing])}</div>`;
                }
                return desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            s_type: 'enceladus',
            support(){ return -1; },
            powered(){ return powerCostMod(10); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('operating_base');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['operating_base','space']
                };
            },
            soldiers(){
                let soldiers = global.race['grenadier'] ? 3 : 4;
                return jobScale(soldiers);
            },
            post(){
                vBind({el: `#spc_enceladussynd`},'update');
            }
        },
        munitions_depot: {
            id: 'space-munitions_depot',
            title(){ return loc('tech_munitions_depot'); },
            desc(){ return loc('tech_munitions_depot'); },
            type: 'military',
            category: 'storage',
            era: 'solar',
            reqs: { enceladus: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('munitions_depot', offset, 5000000, 1.22); },
                Iron(offset){ return spaceCostMultiplier('munitions_depot', offset, 185000, 1.22); },
                Sheet_Metal(offset){ return spaceCostMultiplier('munitions_depot', offset, 100000, 1.22); },
            },
            effect(){
                let containers = 25;
                return `<div>${loc('plus_max_crates',[containers])}</div><div>${loc('plus_max_containers',[containers])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('munitions_depot');
                    global.resource.Crates.max += 25;
                    global.resource.Containers.max += 25;
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
                    p: ['munitions_depot','space']
                };
            },
        }
    },
    spc_triton: {
        info: {
            name(){
                return planetName().triton;
            },
            desc(){
                return loc('space_triton_info_desc',[planetName().triton, races[global.race.species].home]);
            },
            zone: 'outer',
            showDest(){
                let show = global.settings.space.triton || global.tech?.resettle >= 3 ? true : false;
                return {r: show, l: show};
            },
            syndicate(){ if (global.tech['resettle']){ return false; } return global.tech['triton'] && global.tech.triton >= 2 ? true : false; },
            syndicate_cap(){ return global.tech['outer'] && global.tech.outer >= 4 ? 5000 : 3000; },
            nav(){ return global.tech['resettle'] || !global.settings.space.triton ? false : true; },
            extra(region){
                if (global.tech['triton'] && global.tech.triton >= 3){
                    $(`#${region}`).append(`<div id="${region}resist" v-show="${region}" class="syndThreat has-text-caution">${loc('space_ground_resist')} <span class="has-text-danger" v-html="threat(enemy,troops)"></span></div>`);
                    vBind({
                        el: `#${region}resist`,
                        data: global.space.fob,
                        methods: {
                            threat(e,t){
                                let wounded = global.civic.garrison.wounded - garrisonSize();
                                if (wounded < 0){ wounded = 0; }
                                let d = +(e - armyRating(t,'army',wounded)).toFixed(0);
                                return d < 0 ? 0 : d;
                            }
                        }
                    });
                }
            }
        },
        triton_mission: {
            id: 'space-triton_mission',
            title(){
                return loc('space_mission_title',[planetName().triton]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().triton]);
            },
            reqs: { outer: 2 },
            grant: ['triton',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.triton >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(600000,false,wiki).toFixed(0); },
                Elerium(){ return 2500; }
            },
            effect(){
                return loc('space_triton_mission_effect',[planetName().triton]);
            },
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_triton_mission_action',[planetName().triton]),'info',false,['progress']);
                    global.space.syndicate['spc_triton'] = 1250;
                    global.space.syndicate['spc_titan'] += 250;
                    global.space.syndicate['spc_enceladus'] += 250;
                    return true;
                }
                return false;
            }
        },
        fob: {
            id: 'space-fob',
            title(){ return loc('space_fob_title'); },
            desc(){
                return `<div>${loc('tech_fob')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Helium_3.name])}</div>`;
            },
            type: 'military',
            reqs: { triton: 2 },
            path: ['truepath'],
            queue_complete(){ return 1 - global.space.fob.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) >= 1  ? 0 : spaceCostMultiplier('fob', offset, 250000000, 1.1); },
                Copper(offset){ return ((offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) >= 1 ? 0 : spaceCostMultiplier('fob', offset, 8000000, 1.1); },
                Uranium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) >= 1 ? 0 : spaceCostMultiplier('fob', offset, 50000, 1.1); },
                Nano_Tube(offset){ return ((offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) >= 1 ? 0 : spaceCostMultiplier('fob', offset, 2500000, 1.1); },
                Graphene(offset){ return ((offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) >= 1 ? 0 : spaceCostMultiplier('fob', offset, 3000000, 1.1); },
                Sheet_Metal(offset){ return ((offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) >= 1 ? 0 : spaceCostMultiplier('fob', offset, 7500000, 1.1); },
                Quantium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) >= 1 ? 0 : spaceCostMultiplier('fob', offset, 500000, 1.1); },
                Horseshoe(offset){ return global.race['hooved'] && ((offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) < 1 ? 10 : 0; }
            },
            effect(wiki){
                let troops = garrisonSize();
                let max_troops = garrisonSize(true);
                let desc = `<div>${loc('galaxy_defense_platform_effect',[500])}</div>`;
                desc += loc('plus_max_resource',[$(this)[0].soldiers(),loc('civics_garrison_soldiers')]);
                desc += `<div class="has-text-warning"><span class="soldier">${loc('civics_garrison_soldiers')}:</span> <span>${troops}</span> / <span>${max_troops}<span></div>`;
                desc += `<div class="has-text-warning"><span class="wounded">${loc('civics_garrison_wounded')}:</span> <span>${global.civic['garrison'] ? global.civic.garrison.wounded : 0}</span></div>`;
                desc += `<div class="has-text-warning">${loc('space_fob_landed',[global.space['fob'] ? global.space.fob.troops : 0])}</div>`;
                let helium = +(fuel_adjust(125,true,wiki)).toFixed(2);
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),helium,global.resource.Helium_3.name])}</div>`;
            },
            powered(){ return powerCostMod(50); },
            action(){
                if (global.space.fob.count < 1 && payCosts($(this)[0])){
                    incrementStruct('fob');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech['triton'] === 2){ global.tech['triton'] = 3; }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, troops: 0, enemy: 0 },
                    p: ['fob','space']
                };
            },
            soldiers(){
                let soldiers = global.race['grenadier'] ? 6 : 10;
                return jobScale(soldiers);
            },
            post(){
                drawTech();
                renderSpace();
                messageQueue(loc('space_fob_msg'),'info',false,['progress']);
            }
        },
        lander: {
            id: 'space-lander',
            title(){ return loc('space_lander_title'); },
            desc(){
                return `<div>${loc('space_lander_title')}</div><div class="has-text-special">${loc('requires_soldiers')}</div><div class="has-text-special">${loc('space_red_space_barracks_desc_req')}</div>`;
            },
            type: 'military',
            reqs: { triton: 3 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('lander', offset, 2400000, 1.15); },
                Aluminium(offset){ return spaceCostMultiplier('lander', offset, 185000, 1.15); },
                Neutronium(offset){ return spaceCostMultiplier('lander', offset, 10000, 1.15); },
                Nano_Tube(offset){ return spaceCostMultiplier('lander', offset, 158000, 1.15); },
            },
            powered(){ return 0; },
            effect(wiki){
                let oil = +fuel_adjust(50,true,wiki).toFixed(2);
                let data = ``;
                if (global.space['crashed_ship'] && global.space.crashed_ship.count === 100){
                    data = `<div>${loc(`space_lander_effect3`,[production('lander'),global.resource.Cipher.name])}</div>`;
                }
                return `<div>${loc('space_lander_effect',[planetName().triton])}</div>${data}<div class="has-text-warning">${loc(`space_lander_effect2`,[jobScale(3)])}</div><div class="has-text-caution">${loc('space_red_space_barracks_effect2',[oil])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('lander');
                    global.space.lander.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['lander','space']
                };
            }
        },
        crashed_ship: {
            id: 'space-crashed_ship',
            title(){ return loc('space_crashed_ship_title'); },
            desc(){
                return `<div>${loc('space_crashed_ship_title')}</div>`;
            },
            type: 'utility',
            reqs: { triton: 3 },
            path: ['truepath'],
            queue_complete(){ return 0; },
            cost: {},
            effect(){
                let control = global.space['crashed_ship'] ? global.space.crashed_ship.count : 0;
                return `<div>${loc(`space_crashed_ship_effect`,[control])}</div>`;
            },
            action(){
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['crashed_ship','space']
                };
            }
        },
    },
    spc_makemake: {
        info: {
            name(){
                return planetName().makemake;
            },
            desc(){
                return loc('space_makemake_info_desc',[planetName().makemake]);
            },
            zone: 'outer',
            showDest(){
                return {r: true, l: global.settings.space.makemake};
            },
            syndicate(){ if (global.tech['resettle']){ return false; } return global.tech['makemake'] ? true : false; },
            syndicate_cap(){ return 2500; },
            nav(){ return global.tech['resettle'] || !global.settings.space.makemake ? false : true; }
        },
        makemake_mission: {
            id: 'space-makemake_mission',
            title(){
                return loc('space_mission_title',[planetName().makemake]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().makemake]);
            },
            reqs: { outer: 7 },
            grant: ['makemake',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.makemake >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(1000000,false,wiki).toFixed(0); },
                Elerium(){ return 1000; }
            },
            effect(){
                return loc('space_makemake_mission_effect',[planetName().makemake]);
            },
            action(){
                if (payCosts($(this)[0])){
                    initStruct(outerTruth.spc_makemake.orichalcum_mine);
                    initStruct(outerTruth.spc_makemake.uranium_mine);
                    initStruct(outerTruth.spc_makemake.neutronium_mine);
                    global.space.syndicate['spc_makemake'] = 500;
                    messageQueue(loc('space_makemake_mission_action',[planetName().makemake]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        orichalcum_mine: {
            id: 'space-orichalcum_mine',
            title(){ return loc('space_makemake_mine',[global.resource.Orichalcum.name]); },
            desc(){
                return `<div>${loc('space_makemake_mine',[global.resource.Orichalcum.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            type: 'mining',
            reqs: { makemake: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('orichalcum_mine', offset, 25000000, 1.25); },
                Graphene(offset){ return spaceCostMultiplier('orichalcum_mine', offset, 900000, 1.25); },
                Elerium(offset){ return spaceCostMultiplier('orichalcum_mine', offset, 200, 1.25); },
                Mythril(offset){ return spaceCostMultiplier('orichalcum_mine', offset, 450000, 1.25); },
                Quantium(offset){ return spaceCostMultiplier('orichalcum_mine', offset, 150000, 1.25); },
            },
            effect(wiki){
                let mineral = +(production('orichalcum_mine')).toFixed(3);
                let fuel = +fuel_adjust($(this)[0].p_fuel().a,true,wiki).toFixed(1);
                let desc = `<div>${loc('gain',[mineral,global.resource.Orichalcum.name])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(10); },
            p_fuel(){ return { r: 'Oil', a: 200 }; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('orichalcum_mine');
                    global.resource.Orichalcum.display = true;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['orichalcum_mine','space']
                };
            }
        },
        uranium_mine: {
            id: 'space-uranium_mine',
            title(){ return loc('space_makemake_mine',[global.resource.Uranium.name]); },
            desc(){
                return `<div>${loc('space_makemake_mine',[global.resource.Uranium.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            type: 'mining',
            reqs: { makemake: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('uranium_mine', offset, 5000000, 1.25); },
                Iridium(offset){ return spaceCostMultiplier('uranium_mine', offset, 250000, 1.25); },
                Steel(offset){ return spaceCostMultiplier('uranium_mine', offset, 620000, 1.25); }
            },
            effect(wiki){
                let mineral = +(production('uranium_mine')).toFixed(3);
                let fuel = +fuel_adjust($(this)[0].p_fuel().a,true,wiki).toFixed(1);
                let desc = `<div>${loc('gain',[mineral,global.resource.Uranium.name])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(5); },
            p_fuel(){ return { r: 'Oil', a: 60 }; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('uranium_mine');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['uranium_mine','space']
                };
            }
        },
        neutronium_mine: {
            id: 'space-neutronium_mine',
            title(){ return loc('space_makemake_mine',[global.resource.Neutronium.name]); },
            desc(){
                return `<div>${loc('space_makemake_mine',[global.resource.Neutronium.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            type: 'mining',
            reqs: { makemake: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('neutronium_mine', offset, 8000000, 1.25); },
                Adamantite(offset){ return spaceCostMultiplier('neutronium_mine', offset, 650000, 1.25); },
                Stanene(offset){ return spaceCostMultiplier('neutronium_mine', offset, 1250000, 1.25); },
            },
            effect(wiki){
                let mineral = +(production('neutronium_mine')).toFixed(3);
                let fuel = +fuel_adjust($(this)[0].p_fuel().a,true,wiki).toFixed(1);
                let desc = `<div>${loc('gain',[mineral,global.resource.Neutronium.name])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(8); },
            p_fuel(){ return { r: 'Oil', a: 60 }; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('neutronium_mine');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['neutronium_mine','space']
                };
            }
        },
        elerium_mine: {
            id: 'space-elerium_mine',
            title(){ return loc('space_makemake_mine',[global.resource.Elerium.name]); },
            desc(){
                return `<div>${loc('space_makemake_mine',[global.resource.Elerium.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            type: 'mining',
            reqs: { makemake: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('elerium_mine', offset, 20000000, 1.25); },
                Titanium(offset){ return spaceCostMultiplier('elerium_mine', offset, 250000, 1.25); },
                Neutronium(offset){ return spaceCostMultiplier('elerium_mine', offset, 120000, 1.25); },
                Orichalcum(offset){ return spaceCostMultiplier('elerium_mine', offset, 175000, 1.25); },
            },
            effect(wiki){
                let mineral = +(production('elerium_mine')).toFixed(3);
                let fuel = +fuel_adjust($(this)[0].p_fuel().a,true,wiki).toFixed(1);
                let desc = `<div>${loc('gain',[mineral,global.resource.Elerium.name])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(12); },
            p_fuel(){ return { r: 'Oil', a: 125 }; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('elerium_mine');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['elerium_mine','space']
                };
            }
        },
    },
    spc_eris: {
        info: {
            name(){
                return planetName().eris;
            },
            desc(){
                return loc('space_eris_info_desc',[planetName().eris]);
            },
            support: 'drone_control',
            zone: 'outer',
            showDest(){
                return {r: global.settings.space.eris || global.tech?.resettle >= 3, l: global.settings.space.eris};
            },
            syndicate(){ if (global.tech['resettle']){ return false; } return global.tech['eris'] ? true : false; },
            syndicate_cap(){ return 7500; },
            nav(){ return global.tech['resettle'] || !global.settings.space.eris ? false : true; },
            extra(region){
                if (global.tech['eris'] && global.tech['eris'] === 1){
                    $(`#${region}`).append(`<div id="${region}scanned" v-show="${region}" class="syndThreat has-text-caution">${loc('space_scanned')} <span class="has-text-info">{{ eris_scan }}%</span></div>`);
                    vBind({
                        el: `#${region}scanned`,
                        data: global.tech
                    });
                }
            }
        },
        eris_mission: {
            id: 'space-eris_mission',
            title(){
                return loc('space_mission_title',[planetName().eris]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().eris]);
            },
            reqs: { outer: 7 },
            grant: ['eris',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.eris >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(1250000,false,wiki).toFixed(0); },
                Elerium(){ return 1250; }
            },
            effect(){
                return loc('space_eris_mission_effect',[planetName().eris]);
            },
            action(){
                if (payCosts($(this)[0])){
                    global.space.syndicate['spc_eris'] = 4000;
                    messageQueue(loc('space_eris_mission_action',[planetName().eris]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        drone_control: {
            id: 'space-drone_control',
            title(){ return loc('space_drone_control',[planetName().titan]); },
            desc(){
                return `<div>${loc('space_drone_control',[planetName().titan])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            type: 'military',
            reqs: { eris: 3 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('drone_control', offset, 75000000, 1.3); },
                Neutronium(offset){ return spaceCostMultiplier('drone_control', offset, 100000, 1.3); },
                Stanene(offset){ return spaceCostMultiplier('drone_control', offset, 450000, 1.3); },
                Quantium(offset){ return spaceCostMultiplier('drone_control', offset, 300000, 1.3); },
            },
            effect(){
                let fuel = $(this)[0].p_fuel().a;
                let desc = `<div>+${loc(`galaxy_alien2_support`,[$(this)[0].support(),planetName().eris])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            support(){ return 5; },
            powered(){ return powerCostMod(25); },
            p_fuel(){ return { r: 'Uranium', a: 5 }; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('drone_control');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['drone_control','space']
                };
            }
        },
        shock_trooper: {
            id: 'space-shock_trooper',
            title(){ return loc('space_shock_trooper_title'); },
            desc(){
                return `<div>${loc('space_shock_trooper_title')}</div><div class="has-text-special">${loc('space_support',[planetName().eris])}</div>`;
            },
            type: 'military',
            reqs: { eris: 3 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('shock_trooper', offset, 4250000, 1.225); },
                Polymer(offset){ return spaceCostMultiplier('shock_trooper', offset, 375000, 1.225); },
                Adamantite(offset){ return spaceCostMultiplier('shock_trooper', offset, 500000, 1.225); },
                Graphene(offset){ return spaceCostMultiplier('shock_trooper', offset, 220000, 1.225); },
                Elerium(offset){ return spaceCostMultiplier('shock_trooper', offset, 350, 1.225); },
            },
            effect(){
                let rating = Math.round(armyRating(1,'army',0) * syndicate('spc_eris'));
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().eris])}</div>`;
                if (global.space['digsite'] && global.space.digsite.count === 100){
                    desc = `<div>${loc(`space_lander_effect3`,[production('shock_trooper'),global.resource.Cipher.name])}</div>`;
                }
                return desc + `<div>${loc(`space_digsite_offense`,[rating])}</div>`;
            },
            s_type: 'eris',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('shock_trooper');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['shock_trooper','space']
                };
            }
        },
        tank: {
            id: 'space-tank',
            title(){ return loc('space_tank_title'); },
            desc(){
                return `<div>${loc('space_tank_title')}</div><div class="has-text-special">${loc('space_support',[planetName().eris])}</div>`;
            },
            type: 'military',
            reqs: { eris: 4 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('tank', offset, 100000000, 1.25); },
                Alloy(offset){ return spaceCostMultiplier('tank', offset, 1250000, 1.25); },
                Orichalcum(offset){ return spaceCostMultiplier('tank', offset, 600000, 1.25); },
                Mythril(offset){ return spaceCostMultiplier('tank', offset, 500000, 1.25); },
                Uranium(offset){ return spaceCostMultiplier('tank', offset, 25000, 1.25); },
            },
            effect(){
                let rating = Math.round(100 * syndicate('spc_eris'));
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().eris])}</div>`;
                if (global.space['digsite'] && global.space.digsite.count === 100){
                    desc = `<div>${loc(`space_lander_effect3`,[production('tank'),global.resource.Cipher.name])}</div>`;
                }
                return desc + `<div>${loc(`space_digsite_offense`,[rating])}</div>`;
            },
            s_type: 'eris',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('tank');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['tank','space']
                };
            }
        },
        digsite: {
            id: 'space-digsite',
            title(){ return loc('space_digsite_title'); },
            desc(){
                return `<div>${loc('space_digsite_title')}</div>`;
            },
            type: 'utility',
            reqs: { eris: 3 },
            path: ['truepath'],
            queue_complete(){ return 0; },
            cost: {},
            effect(){
                let control = global.space['digsite'] ? global.space.digsite.count : 0;
                return `<div>${loc(`space_crashed_ship_effect`,[control])}</div>`;
            },
            action(){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, enemy: 10000 },
                    p: ['digsite','space']
                };
            }
        },
    },
    spc_venus: {
        info: {
            name(){
                return planetName().venus;
            },
            desc(){
                // A blockade shuts down the planet
                let blockade = venusBlockade();
                if (blockade > 0){
                    return `<div class="has-text-danger">${loc('space_venus_info_desc_blockade',[blockade,planetName().venus])}</div><div>${loc('space_venus_info_desc',[planetName().venus])}</div>`;
                }
                if (global.tech['venus'] && global.tech.venus <= 2){
                    return `<div class="has-text-warning">${loc('space_venus_info_desc_not_scouted',[planetName().venus])}</div><div>${loc('space_venus_info_desc',[planetName().venus])}</div>`;
                }
                else {
                    return loc('space_venus_info_desc',[planetName().venus]);
                }
            },
            support: 'cloud_city',
            zone: 'inner',
            showDest(){
                return {r: true, l: global.tech['venus'] ? true : false};
            },
            syndicate(){ return false; },
            nav(){ return global.tech['venus'] ? true : false; }
        },
        cloud_city: {
            id: 'space-cloud_city',
            title(){ return loc('space_cloud_city_title'); },
            desc(){ return `<div>${loc('space_cloud_city_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            type: 'outpost',
            reqs: { venus: 4 },
            path: ['truepath'],
            // Nothing goes up while the horde holds the orbit. Every Venus structure should carry this.
            condition(){ return venusBlockade() === 0; },
            cost: {
                Money(offset){ return spaceCostMultiplier('cloud_city', offset, 20000000, 1.28); },
                Aluminium(offset){ return spaceCostMultiplier('cloud_city', offset, 5800000, 1.28); },
                Nano_Tube(offset){ return spaceCostMultiplier('cloud_city', offset, 1200000, 1.28); },
                Stanene(offset){ return spaceCostMultiplier('cloud_city', offset, 3500000, 1.28); },
                Aerographene(offset){ return spaceCostMultiplier('cloud_city', offset, 500000, 1.28); }
            },
            effect(){
                return `<div>+${loc(`galaxy_alien2_support`,[$(this)[0].support(),planetName().venus])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            support(){ return 3; },
            powered(){ return powerCostMod(10); },
            action(){
                if (payCosts($(this)[0])){
                    if (global.tech.venus === 4){
                        global.tech.venus = 5;
                        beginTungstenSurvey();
                        drawTech();
                    }
                    incrementStruct('cloud_city');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['cloud_city','space']
                };
            }
        }
    },
    // The one moon that turned out to be worth landing on. Which body this actually is comes out of the
    // survey roll, so everything about it — name, description, where it sits on the map — is read from
    // that rather than written down here. Only ever visible once the deposit has been confirmed.
    spc_survey: {
        info: {
            name(){
                return surveyBody() ? planetName()[surveyBody()] : loc('survey_region_unknown');
            },
            desc(){
                let moon = surveyBody();
                if (!moon){ return loc('survey_region_unknown'); }
                return `<div>${loc(`space_${moon}_info_desc`,[planetName()[moon]])}</div><div class="has-text-success">${loc('survey_info_desc_rich',[global.resource.Tungsten.name])}</div>`;
            },
            zone: 'outer',
            showDest(){
                let show = surveyFound();
                return {r: show, l: show};
            },
            syndicate(){ return false; },
            nav(){ return surveyFound(); }
        }
    },
};

// places to look for Tungsten
const surveyMoons = ['titania','oberon','io','europa','callisto'];

function surveyState(){
    return global.space['survey'] || false;
}

// The bare moon name of the body that held the deposit ('io', 'europa', …), or false while the search
// is still running. Everything spc_survey shows about itself comes from this.
export function surveyBody(){
    let s = surveyState();
    return s && s.rich ? s.rich : false;
}

// Whether the deposit has actually been found, which is what makes spc_survey a real place.
function surveyFound(){
    return global.tech['survey'] && global.tech.survey >= 2 && surveyBody() ? true : false;
}

// spc_survey has no entry of its own in the position table — it stands in for a real moon, and which
// one is not known until the roll. Anything resolving a position or a star system goes through here so
// the region behaves as the body it actually is.
export function resolveBody(locationName){
    if (locationName === 'spc_survey'){
        let moon = surveyBody();
        return moon ? `spc_${moon}` : locationName;
    }
    return locationName;
}

// Moon survey canadidates
function surveyPoint(moon){
    return `survey_${moon}`;
}

// Opened by the first cloud city: the descent problem becomes concrete, and the search for the metal
// that solves it begins. The roll is made once and kept, so reloading cannot reshuffle the answer.
export function beginTungstenSurvey(){
    if (global.tech['survey']){ return; }
    global.tech['survey'] = 1;
    global.space['survey'] = {
        rich: surveyMoons[Math.floor(seededRandom(0,surveyMoons.length,true))],
        done: {}
    };

    // Each candidate becomes a destination fixed at wherever that moon is standing today. They orbit
    // and the point does not, but the survey is a trip you make once and cross off.
    if (!global.race['tempCoordinates']){ global.race['tempCoordinates'] = {}; }
    surveyMoons.forEach(function(moon){
        let c = genXYZcoord(`spc_${moon}`);
        global.race.tempCoordinates[surveyPoint(moon)] = {
            n: planetName()[moon], a: true, s: 'spc_sun', x: c.x, y: c.y, z: c.z
        };
    });

    messageQueue(loc('survey_begin',[global.resource.Tungsten.name,loc('outer_shipyard_sensor_quantum')]),'info',false,['progress']);
    renderSpace();
    drawShipYard();
}

// Strike a candidate off: the point stays in the table so a ship parked on it can still say where it
// is, but it stops being somewhere you can be sent.
function closeSurveyPoint(moon){
    let point = global.race['tempCoordinates'] ? global.race.tempCoordinates[surveyPoint(moon)] : false;
    if (point){ point.a = false; }
}

// Survey moon for Tungsten
function repairSurveyPoints(){
    let s = surveyState();
    if (!s || !s.rich){ return; }

    if (s.rich.startsWith('spc_')){
        s.rich = s.rich.substring(4);
        let done = {};
        Object.keys(s.done).forEach(function(key){
            done[key.startsWith('spc_') ? key.substring(4) : key] = s.done[key];
        });
        s.done = done;
    }

    if (!global.race['tempCoordinates']){ return; }
    surveyMoons.forEach(function(moon){
        let stale = `survey_spc_${moon}`;
        if (!global.race.tempCoordinates.hasOwnProperty(stale)){ return; }
        let old = global.race.tempCoordinates[stale];
        let key = surveyPoint(moon);
        if (!global.race.tempCoordinates.hasOwnProperty(key)){
            let c = genXYZcoord(`spc_${moon}`);
            global.race.tempCoordinates[key] = {
                n: planetName()[moon], a: old.a && !s.done[moon], s: 'spc_sun', x: c.x, y: c.y, z: c.z
            };
        }
        // A ship parked on the bad point keeps somewhere to be — named, so it does not read as
        // undefined — but it is no longer offered as a destination. Otherwise the point simply goes.
        if (allShips().some(ship => !ship.inTransit && ship.location.name === stale)){
            old.n = planetName()[moon];
            old.a = false;
        }
        else {
            delete global.race.tempCoordinates[stale];
        }
    });
}

export function checkTungstenSurvey(){
    if (!global.tech['survey']){ return; }
    repairSurveyPoints();
    if (global.tech.survey !== 1){ return; }
    let s = surveyState();
    if (!s){ return; }

    for (let moon of surveyMoons){
        if (s.done[moon]){ continue; }
        let point = surveyPoint(moon);
        if (!allShips().some(ship => !ship.inTransit && ship.location.name === point && ship.sensor === 'quantum')){ continue; }

        s.done[moon] = true;
        if (moon === s.rich){
            // Found. Everything still on the list is struck off with it; there is no reason to go and
            // look at the rest, and leaving them open would only invite wasted trips.
            global.tech['survey'] = 2;
            surveyMoons.forEach(function(m){
                s.done[m] = true;
                closeSurveyPoint(m);
            });
            global.settings.space['survey'] = true;
            messageQueue(loc('survey_rich',[planetName()[moon],global.resource.Tungsten.name]),'success',false,['progress']);
            renderSpace();
            drawShipYard();
            return;
        }

        closeSurveyPoint(moon);
        messageQueue(loc('survey_poor',[planetName()[moon]]),'info',false,['progress']);
        renderSpace();
        drawShipYard();
    }
}

const tauCetiModules = {
    tau_star: {
        info: {
            name(){
                return loc('tab_tauceti');
            },
            desc(){
                return loc('tau_star',[loc('tab_tauceti'),loc('space_sun_info_name')]);
            },
            nav(){ return false; }
        },
        ringworld: {
            id: 'tauceti-ringworld',
            title(){ return loc('tau_star_ringworld'); },
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('ringworld') || global.tauceti.ringworld.count < 1000 || wiki){
                    return `<div>${loc('tau_star_ringworld')}</div><div class="has-text-special">${loc('requires_segments',[1000])}</div>`;
                }
                else {
                    return `<div>${loc('tau_star_ringworld')}</div>`;
                }
            },
            type: 'megaproject',
            reqs: { matrix: 2 },
            path: ['truepath'],
            queue_size: 50,
            queue_complete(){ return 1000 - global.tauceti.ringworld.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? (global.race['lone_survivor'] ? 10000000 : 100000000) : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? (global.race['lone_survivor'] ? 20000 : 100000) : 0; },
                Nano_Tube(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? (global.race['lone_survivor'] ? 70000 : 350000) : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? (global.race['lone_survivor'] ? 200000 : 1000000) : 0; },
                Bolognium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? (global.race['lone_survivor'] ? 17600 : 88000) : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? (global.race['lone_survivor'] ? 25000 : 125000) : 0; },
                Unobtainium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? (global.race['lone_survivor'] ? 360 : 1800) : 0; },
                Quantium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? wom_recycle(global.race['lone_survivor'] ? 10100 : 101000) : 0; },
            },
            effect(wiki){
                let effectText = '';
                let count = (wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0);
                if (count < 1000){
                    let remain = 1000 - count;
                    effectText += `<div>${loc('tau_star_ringworld_effect')}</div>`;
                    effectText += `<div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    effectText += `<div class="has-text-special">${loc('space_dwarf_reactor_effect1',[global.race['lone_survivor'] ? 100 : 10000])}</div>`;
                }
                return effectText;
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.tauceti.ringworld.count < 1000){
                        incrementStruct('ringworld','tauceti');
                        if (global.tauceti.ringworld.count >= 1000){
                            if (global.race['lone_survivor']){
                                global.tech['eden'] = 1;
                            }
                            else {
                                global.tech.matrix = 3;
                                global.tauceti['matrix'] = { count: 1, on: 0 };
                            }
                            drawTech();
                            renderTauCeti();
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
                    p: ['ringworld','tauceti']
                };
            }
        },
        matrix: {
            id: 'tauceti-matrix',
            title(){ return loc('tau_star_matrix'); },
            desc(){ return `<div>${loc('tau_star_matrix')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { matrix: 3 },
            condition(){
                return global.tauceti.ringworld.count >= 1000 ? true : false;
            },
            queue_complete(){ return 0; },
            cost: {},
            powered(){ return 10000; },
            postPower(o){
                if (o && p_on['matrix']){
                    // Powered on and energized
                    global.tech.matrix = 4;
                    renderTauCeti();
                }
                else {
                    if (global.tech.matrix > 3){
                        // Disabled or lost power
                        global.tech.matrix = 3;
                        renderTauCeti();
                    }
                    if (o){
                        // Not powered yet, check again soon
                        return true;
                    }
                }
            },
            effect(){
                let reward = matrixProjection();
                let power = $(this)[0].powered();
                let power_label = power > 0 ? `<div class="has-text-caution">${loc('minus_power',[power])}</div>` : '';
                return `<div>${loc('tau_star_matrix_effect')}</div>${reward}${power_label}`;
            },
            action(){
                return false;
            }
        },
        blue_pill: {
            id: 'tauceti-blue_pill',
            title(){ return loc('tau_star_blue_pill'); },
            desc(){ return loc('tau_star_blue_pill'); },
            wiki: false,
            reqs: { matrix: 4 },
            queue_complete(){ return 0; },
            no_multi: true,
            cost: {},
            effect(){
                let reward = matrixProjection();
                return `<div>${loc('tau_star_blue_pill_effect')}</div>${reward}`;
            },
            action(){
                if (payCosts($(this)[0])){
                    $(`body`).append(`<canvas id="matrix" class="font-overlay"/>`);
                    const canvas = document.getElementById('matrix');
                    const ctx = canvas.getContext('2d');
                    const w = canvas.width = document.body.offsetWidth;
                    const h = canvas.height = document.body.offsetHeight;
                    const cols = Math.floor(w / 20) + 1;
                    const ypos = Array(cols).fill(0);

                    function pill() {
                        ctx.fillStyle = '#0001';
                        ctx.fillRect(0, 0, w, h);
                        ctx.fillStyle = '#0f0';
                        ctx.font = '15pt monospace';
                        ypos.forEach((y, ind) => {
                            const text = String.fromCharCode(Math.rand(0xFF66, 0xFF9E));//String.fromCharCode(Math.random() * 128);
                            const x = ind * 20;
                            ctx.fillText(text, x, y);
                            if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
                            else ypos[ind] = y + 20;
                        });
                    }

                    setInterval(pill, 50);
                    setTimeout(function(){
                        matrix();
                    }, 5000);

                    return true;
                }
                return false;
            }
        },
        goe_facility: {
            id: 'tauceti-goe_facility',
            title(){ return loc('tau_star_goe_facility'); },
            desc(){ return `<div>${loc('tau_star_goe_facility')}</div>`; },
            type: 'megaproject',
            reqs: { eden: 2 },
            condition(){
                return global.tauceti.ringworld.count >= 1000 ? true : false;
            },
            queue_complete(){ return 0; },
            cost: {
                Money(o){ return 1000000; },
                Copper(o){ return 10000000; },
                Graphene(o){ return 5000000; },
                Stanene(o){ return 8000000; },
                Elerium(o){ return 10000; },
            },
            effect(){
                let reward = edenProjection();
                return `<div>${loc('tau_star_goe_facility_effect')}</div>${reward}`;
            },
            action(){
                if (payCosts($(this)[0])){
                    let costs = adjustCosts(tauCetiModules.tau_star.goe_facility);
                    Object.keys(costs).forEach(function(res){
                        global.resource[res].amount += costs[res]();
                    });
                    gardenOfEden();
                    return false;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['goe_facility','tauceti']
                };
            }
        },
    },
    tau_home: {
        info: {
            name(){
                return loc('tau_planet',[races[global.race.species].home]);
            },
            desc(){
                return loc('tau_home',[races[global.race.species].home]);
            },
            nav(){ return global.tech['resettle'] ? true : false; },
            support: 'orbital_station',
            extra(region){
                if (global.tech['tau_home'] && global.tech.tau_home >= 2 && !tauEnabled()){
                    $(`#${region}`).append(`<div id="${region}Mats" v-show="tauShow()" class="syndThreat has-text-warning">${loc('resource_Materials_name')} <span class="has-text-info">{{ locale(round(amount)) }}</span> / <span class="has-text-info">{{ locale(round(max)) }}</span></div>`);
                    vBind({
                        el: `#${region}Mats`,
                        data: global.resource.Materials,
                        methods: {
                            tauShow(){
                                return !tauEnabled();
                            },
                            round(v){
                                return +v.toFixed(0);
                            },
                            locale(v){
                                return v.toLocaleString();
                            }
                        }
                    });
                }
            }
        },
        home_mission: {
            id: 'tauceti-home_mission',
            title(){ return loc('tau_new_mission_title',[races[global.race.species].home]); },
            desc(){ return loc('tau_new_mission_title',[races[global.race.species].home]); },
            reqs: { tauceti: 2 },
            grant: ['tau_home',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_home >= 1 ? 0 : 1; },
            cost: {
                Money(){ return 1000000000; }
            },
            effect(){ return loc('tau_new_mission_effect',[races[global.race.species].home]); },
            action(){
                if (payCosts($(this)[0])){
                    initStruct(tauCetiModules.tau_home.colony);
                    initStruct(tauCetiModules.tau_home.mining_pit);
                    messageQueue(loc('tau_home_mission_result',[races[global.race.species].home]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        dismantle: {
            id: 'tauceti-dismantle',
            title(){ return loc('tau_home_dismantle'); },
            desc(){ return loc('tau_home_dismantle'); },
            reqs: { tau_home: 1 },
            grant: ['tau_home',2],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_home >= 2 ? 0 : 1; },
            cost: {
                Money(){ return 100000000; }
            },
            effect(){
                let explorer = 'Explorer';
                if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                    let shipId = global.space.shipyard.ships.findIndex(x => !x.inTransit && x.location.name === 'tauceti' && x.class === 'explorer');
                    if (shipId !== -1){
                        explorer = global.space.shipyard.ships[shipId].name;
                    }
                }
                return loc('tau_home_dismantle_effect',[explorer]);
            },
            action(){
                let shipId = -1;
                if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                    shipId = global.space.shipyard.ships.findIndex(x => !x.inTransit && x.location.name === 'tauceti' && x.class === 'explorer');
                }
                if (shipId >= 0 && payCosts($(this)[0])){
                    global.space.shipyard.ships.splice(shipId,1);
                    incrementStruct('orbital_station','tauceti');
                    incrementStruct('colony','tauceti');
                    incrementStruct('mining_pit','tauceti');
                    global.civic.pit_miner.display = true;
                    global.resource.Materials.display = true;
                    if (powerOnNewStruct($(tauCetiModules.tau_home.orbital_station)[0])){
                        global.tauceti.colony.on++;
                        global.tauceti.mining_pit.on++;

                        let hiredMax = $(tauCetiModules.tau_home.mining_pit)[0].workers();
                        global.civic.pit_miner.max += hiredMax;

                        let hired = Math.min(hiredMax, global.civic[global.civic.d_job].workers);
                        global.civic[global.civic.d_job].workers -= hired;
                        global.civic.pit_miner.workers += hired;
                    }
                    drawShips();
                    return true;
                }
                return false;
            }
        },
        orbital_station: {
            id: 'tauceti-orbital_station',
            title(){ return loc('tau_home_orbital_station'); },
            desc(){ return `<div>${loc('tau_home_orbital_station')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            type: 'outpost',
            reqs: { tau_home: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('orbital_station', offset, 80000000, 1.3, 'tauceti'); },
                Materials(offset){ return tauEnabled() ? 0 : spaceCostMultiplier('orbital_station', offset, 500000, 1.3, 'tauceti'); },
                Helium_3(offset){ return tauEnabled() ? spaceCostMultiplier('orbital_station', offset, int_fuel_adjust(250000), 1.3, 'tauceti') : 0; },
                Copper(offset){ return tauEnabled() ? spaceCostMultiplier('orbital_station', offset, 1250000, 1.3, 'tauceti') : 0; },
                Adamantite(offset){ return tauEnabled() ? spaceCostMultiplier('orbital_station', offset, 900000, 1.3, 'tauceti') : 0; },
            },
            effect(){
                let helium = spatialReasoning(15000);
                let fuel = +int_fuel_adjust($(this)[0].support_fuel().a).toFixed(1);
                let desc = `<div>${loc('space_red_spaceport_effect1',[loc('tau_planet',[races[global.race.species].home]),$(this)[0].support()])}</div>`;
                desc += `<div>${loc('plus_max_resource',[helium.toLocaleString(),global.resource.Helium_3.name])}</div>`;
                if (global.race.universe === 'evil' && (global.race['lone_survivor'] || global.tech['isolation'])){
                    desc += `<div>${loc('plus_max_resource',[1,global.resource.Authority.name])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('spend_power',[fuel,global.resource[$(this)[0].support_fuel().r].name,$(this)[0].powered()])}</div>`;
                return desc;
            },
            support_fuel(){ return { r: 'Helium_3', a: global.tech['isolation'] ? (global.race['lone_survivor'] ? 5 : 25) : 400 }; },
            support(){ return 3; },
            powered(){ return powerCostMod(global.tech['isolation'] ? (global.race['lone_survivor'] ? 4 : 6) : 30); },
            refresh: true,
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('orbital_station','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['orbital_station','tauceti']
                };
            }
        },
        colony: {
            id: 'tauceti-colony',
            title(){ return loc('tau_home_colony'); },
            desc(){
                return `<div>${loc('tau_home_colony_desc',[races[global.race.species].home])}</div><div class="has-text-special">${loc('requires_power_support_combo',[races[global.race.species].home,global.resource.Food.name])}</div>`;
            },
            type: 'housing',
            reqs: { tau_home: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('colony', offset, 15750000, 1.225, 'tauceti'); },
                Materials(offset){ return tauEnabled() ? 0 : spaceCostMultiplier('colony', offset, 650000, 1.225, 'tauceti'); },
                Furs(offset){ return tauEnabled() ? spaceCostMultiplier('colony', offset, 720000, 1.225, 'tauceti') : 0; },
                Graphene(offset){ return tauEnabled() ? spaceCostMultiplier('colony', offset, 485000, 1.225, 'tauceti') : 0; },
                Brick(offset){ return tauEnabled() ? spaceCostMultiplier('colony', offset, wom_recycle(880000), 1.225, 'tauceti') : 0; },
            },
            effect(){
                let pop = $(this)[0].citizens();
                let containers = global.tech['isolation'] ? 900 : 250;
                let fuel = +($(this)[0].support_fuel().a).toFixed(1);
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), races[global.race.species].home])}</div>`;
                
                if (!global.race['lone_survivor']){
                    desc = desc + `<div>${loc('plus_max_citizens',[pop])}</div>`;
                }

                if (global.tech['isolation']){
                    let vault = bank_vault() * 25;
                    vault = spatialReasoning(vault);
                    vault = (+(vault).toFixed(0)).toLocaleString();
                    desc += `<div>${loc('plus_max_resource',[`\$${vault}`,global.resource.Money.name])}</div>`;
                }

                desc += `<div>${loc('tau_home_colony_effect',[50,races[global.race.species].home])}</div>`;
                
                if (global.tech['isolation']){
                    let gasVal = govActive('gaslighter',0);
                    let mVal = ((gasVal || 0) + (global.tech.broadcast || 0)) * 2;
                    desc += `<div>${loc('space_red_vr_center_effect1',[mVal])}</div>`;
                }
                
                desc += `<div>${loc('plus_max_resource',[containers,global.resource.Crates.name])}</div><div>${loc('plus_max_resource',[containers,global.resource.Containers.name])}</div>`;

                if (global.race.universe === 'evil' && (global.race['lone_survivor'] || global.tech['isolation'])){
                    desc += `<div>${loc('plus_resource',[5,global.resource.Authority.name])}</div>`;
                }

                if (global.race['lone_survivor']){
                    desc += `<div>${loc('gain',[-(fuel),global.resource[$(this)[0].support_fuel().r].name])}</div>`;
                }
                else {
                    desc += `<div class="has-text-caution">${loc('spend',[fuel,global.resource[$(this)[0].support_fuel().r].name])}</div>`;
                }
                return desc;
            },
            s_type: 'tau_home',
            support(){ return -2; },
            support_fuel(){ return { r: 'Food', a: global.tech['isolation'] ? (global.race['lone_survivor'] ? -2 : 75) : 1000 }; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('colony','tauceti');
                    powerOnNewStruct($(this)[0]);
                    if (!global.resource.Containers.display){
                        unlockContainers();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['colony','tauceti']
                };
            },
            citizens(){
                let pop = global.tech['isolation'] ? 8 : 5;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return global.race['lone_survivor'] ? 0 : pop;
            }
        },
        tau_housing: {
            id: 'tauceti-tau_housing',
            title(){
                return housingLabel('small');
            },
            desc(){
                return $(this)[0].citizens() === 1 ? loc('city_basic_housing_desc') : loc('city_basic_housing_desc_plural',[$(this)[0].citizens()]);
            },
            type: 'housing',
            category: 'residential',
            reqs: { housing: 1, isolation: 1 },
            condition(){ return global.race['lone_survivor'] ? false : true; },
            cost: {
                Money(offset){return spaceCostMultiplier('tau_housing', offset, 150000, 1.15, 'tauceti'); },
                Lumber(offset){ return global.race['kindling_kindred'] || global.race['smoldering'] ? 0 : spaceCostMultiplier('tau_housing', offset, 125000, 1.25, 'tauceti'); },
                Stone(offset){ return global.race['kindling_kindred'] ? spaceCostMultiplier('tau_housing', offset, 125000, 1.25, 'tauceti') : 0; },
                Chrysotile(offset){ return global.race['smoldering'] ? spaceCostMultiplier('tau_housing', offset, 50000, 1.25, 'tauceti') : 0; },
                Horseshoe(){ return global.race['hooved'] ? 1 : 0; }
            },
            effect(){
                let pop = $(this)[0].citizens();
                return global.race['sappy'] ? `<div>${loc('plus_max_resource',[pop,loc('citizen')])}</div><div>${loc('city_grove_effect',[2.5])}</div>` : loc('plus_max_resource',[pop,loc('citizen')]);
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('tau_housing','tauceti');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['tau_housing','tauceti']
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
        captive_housing: buildTemplate(`captive_housing`,'tauceti'),
        pylon: {
            id: 'tauceti-pylon',
            title(){ return loc('tau_home_pylon'); },
            desc(){ return loc('tau_home_pylon'); },
            type: 'religion',
            reqs: { magic: 2 },
            condition(){ return global.tech['isolation'] && global.tauceti.hasOwnProperty('pylon') ? true : false; },
            cost: {
                Money(offset){ return spaceCostMultiplier('pylon', offset, 50, 1.48, 'tauceti'); },
                Stone(offset){ return spaceCostMultiplier('pylon', offset, 100, 1.42, 'tauceti'); },
                Crystal(offset){ return spaceCostMultiplier('pylon', offset, 8, 1.42, 'tauceti') - 3; }
            },
            effect(){
                let max = spatialReasoning(2);
                let mana = +(0.0125 * darkEffect('magic')).toFixed(3);
                return `<div>${loc('gain',[mana,global.resource.Mana.name])}</div><div>${loc('plus_max_resource',[max,global.resource.Mana.name])}</div>`;
            },
            special(){ return global.tech['magic'] && global.tech.magic >= 3 ? true : false; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('pylon','tauceti');
                    global.resource.Mana.max += spatialReasoning(2);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['pylon','tauceti']
                };
            }
        },
        cloning_facility: {
            id: `tauceti-cloning_facility`,
            title(){ return loc('tau_home_cloning'); },
            desc(){ return loc('tau_home_cloning_desc',[races[global.race.species].name]); },
            type: 'housing',
            category: 'military',
            reqs: { cloning: 1 },
            path: ['truepath'],
            queue_complete(){ return global.resource[global.race.species].max - global.resource[global.race.species].amount; },
            cost: {
                Money(offset){ return global['resource'][global.race.species].amount ? spaceCostMultiplier('citizen', offset, Math.round((global.race['high_pop'] ? 100000 : 125000) / jobScale(1)), global.race['high_pop'] ? 1.01 : 1.02, 'tauceti', global.race['high_pop'] ? 1.003 : 1.005) : 0; },
                Copper(offset){ return !global.race['artifical'] || global.race['deconstructor'] ? 0 : global['resource'][global.race.species].amount >= 5 ? spaceCostMultiplier('citizen', offset, Math.round(50 / jobScale(1)), 1.01, 'tauceti', global.race['high_pop'] ? 1.0032 : 1.005) : 0; },
                Aluminium(offset){ return !global.race['artifical'] || global.race['deconstructor'] ? 0 : global['resource'][global.race.species].amount >= 5 ? spaceCostMultiplier('citizen', offset, Math.round(50 / jobScale(1)), 1.01, 'tauceti', global.race['high_pop'] ? 1.0032 : 1.005) : 0; },
                Nanite(offset){ return global.race['deconstructor'] ? (global['resource'][global.race.species].amount >= 3 ? spaceCostMultiplier('citizen', offset, Math.round(500 / jobScale(1)), 1.01, 'tauceti', global.race['high_pop'] ? 1.0032 : 1.005) : 0) : 0; },
            },
            effect(){
                let warn = '';
                if (global['resource'][global.race.species].max === global['resource'][global.race.species].amount){
                    warn = `<div class="has-text-caution">${loc('city_assembly_effect_warn')}</div>`;
                }
                return `<div>${loc('tau_home_cloning_effect',[races[global.race.species].name])}</div>${warn}`;
            },
            action(){
                if (global['resource'][global.race.species].max > global['resource'][global.race.species].amount && payCosts($(this)[0])){
                    global['resource'][global.race.species].amount++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['cloning_facility','tauceti']
                };
            }
        },
        horseshoe: buildTemplate(`horseshoe`,'tauceti'),
        bonfire: buildTemplate(`bonfire`,'tauceti'),
        firework: buildTemplate(`firework`,'tauceti'),
        assembly: buildTemplate(`assembly`,'tauceti'),
        nanite_factory: buildTemplate(`nanite_factory`,'tauceti'),
        tau_farm: {
            id: 'tauceti-tau_farm',
            title(){ return loc('tau_home_tau_farm'); },
            desc(){
                return `<div>${loc('tau_home_tau_farm')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'farming',
            reqs: { tau_home: 7 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('tau_farm', offset, 135000000, 1.25, 'tauceti'); },
                Stone(offset){ return  spaceCostMultiplier('tau_farm', offset, 9210000, 1.25, 'tauceti'); },
                Steel(offset){ return spaceCostMultiplier('tau_farm', offset, 6295000, 1.25, 'tauceti'); },
                Water(offset){ return spaceCostMultiplier('tau_farm', offset, 10000, 1.25, 'tauceti'); },
            },
            effect(){
                let desc = `<div>${loc('space_red_spaceport_effect1',[loc('tau_planet',[races[global.race.species].home]),$(this)[0].support()])}</div>`;
                desc = desc + `<div>${loc('produce',[+(production('tau_farm','food')).toFixed(2),global.resource.Food.name])}</div>`;
                if (!global.race['kindling_kindred'] && !global.race['smoldering']){
                    desc = desc + `<div>${loc('produce',[+(production('tau_farm','lumber')).toFixed(2),global.resource.Lumber.name])}</div>`;
                }
                if (global.tech['isolation']){
                    let water = +(production('tau_farm','water')).toFixed(2);
                    desc = desc + `<div>${loc('produce',[water,global.resource.Water.name])}</div>`;
                    if (global.race['artifical']){
                        let sig_cap = spatialReasoning(350);
                        desc = desc + `<div>${loc('city_transmitter_effect',[sig_cap])}</div>`;
                    }
                }
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            support(){ return 1; },
            powered(){ return powerCostMod(global.tech['isolation'] ? 1 : 4); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('tau_farm','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['tau_farm','tauceti']
                };
            }
        },
        mining_pit: {
            id: 'tauceti-mining_pit',
            title(){ return loc('tau_home_mining_pit'); },
            desc(){
                return `<div>${loc('tau_home_mining_pit')}</div><div class="has-text-special">${loc('space_support',[races[global.race.species].home])}</div>`;
            },
            type: 'mining',
            reqs: { tau_home: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('mining_pit', offset, 4250000, 1.225, 'tauceti'); },
                Materials(offset){ return tauEnabled() ? 0 : spaceCostMultiplier('mining_pit', offset, 350000, 1.225, 'tauceti'); },
                Lumber(offset){ return tauEnabled() ? spaceCostMultiplier('mining_pit', offset, 2350000, 1.225, 'tauceti') : 0; },
                Iron(offset){ return tauEnabled() ? spaceCostMultiplier('mining_pit', offset, 835000, 1.225, 'tauceti') : 0; },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), races[global.race.species].home])}</div>`;
                desc = desc + `<div>${loc('plus_max_resource',[$(this)[0].workers(),loc('job_pit_miner')])}</div>`;
                if (!tauEnabled()){
                    desc = desc + `<div>${loc('plus_max_resource',[1000000,loc('resource_Materials_name')])}</div>`;
                    desc = desc + `<div>${loc('tau_home_mining_pit_effect',[global.resource.Materials.name])}</div>`;
                }
                else {
                    if (global.tech['isolation']){
                        if (global.race['lone_survivor']){
                            let res_list = [global.resource.Bolognium.name,global.resource.Adamantite.name,global.resource.Stone.name,global.resource.Copper.name,global.resource.Iron.name,global.resource.Aluminium.name,global.resource.Coal.name];
                            if (global.race['smoldering']){
                                res_list.push(global.resource.Chrysotile.name);
                                desc = desc + `<div>${loc('tau_home_mining_pit_effect2cs',res_list)}</div>`;
                            }
                            else {
                                desc = desc + `<div>${loc('tau_home_mining_pit_effect2c',res_list)}</div>`;
                            }
                        }
                        else {
                            let res_list = [global.resource.Bolognium.name,global.resource.Adamantite.name,global.resource.Stone.name,global.resource.Copper.name,global.resource.Coal.name];
                            if (global.race['smoldering']){
                                res_list.push(global.resource.Chrysotile.name);
                                desc = desc + `<div>${loc('tau_home_mining_pit_effect2bs',res_list)}</div>`;
                            }
                            else {
                                desc = desc + `<div>${loc('tau_home_mining_pit_effect2b',res_list)}</div>`;
                            }
                        }
                        desc = desc + `<div>${loc('production',[8,global.resource.Cement.name])}</div>`;
                    }
                    else {
                        let res_list = [global.resource.Bolognium.name,global.resource.Adamantite.name,global.resource.Stone.name];
                        if (global.race['smoldering']){
                            res_list.push(global.resource.Chrysotile.name);
                            desc = desc + `<div>${loc('tau_home_mining_pit_effect2s',res_list)}</div>`;
                        }
                        else {
                            desc = desc + `<div>${loc('tau_home_mining_pit_effect2',res_list)}</div>`;
                        }
                    }
                }
                return desc;
            },
            s_type: 'tau_home',
            support(){ return -1; },
            powered(){ return 0; },
            workers(){ return jobScale(global.tech['isolation'] ? 6 : 8); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('mining_pit','tauceti');
                    if (powerOnNewStruct($(this)[0])){
                        let hiredMax = $(this)[0].workers();
                        global.civic.pit_miner.max += hiredMax;

                        let hired = Math.min(hiredMax, global.civic[global.civic.d_job].workers);
                        global.civic[global.civic.d_job].workers -= hired;
                        global.civic.pit_miner.workers += hired;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['mining_pit','tauceti']
                };
            }
        },
        excavate: {
            id: 'tauceti-excavate',
            title(){ return loc('tau_home_excavate'); },
            desc(){
                return `<div>${loc('tau_home_excavate')}</div>`;
            },
            reqs: { tau_home: 2 },
            grant: ['tau_home',3],
            path: ['truepath'],
            cost: {
                Money(o){ return 1650000000; },
                Materials(o){ return 750000; },
            },
            effect(){
                return loc('tau_home_excavate_effect');
            },
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('tau_home_excavate_msg'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        alien_outpost: {
            id: 'tauceti-alien_outpost',
            title(){ return loc('tech_alien_outpost'); },
            desc(){
                return `<div>${loc('tech_alien_outpost')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'science',
            reqs: { tau_home: 4 },
            path: ['truepath'],
            cost: {},
            queue_complete(){ return 0; },
            effect(){
                let desc = `<div>${loc('plus_max_resource',[20+'%',global.resource.Knowledge.name])}</div>`;
                if (global.tech['isolation']){
                    desc = desc + `<div>${loc('plus_max_resource',[(global.race['lone_survivor'] ? 3500000 : 6500000).toLocaleString(),global.resource.Knowledge.name])}</div>`;
                    desc = desc + `<div>${loc('plus_max_resource',[(200000).toLocaleString(),global.resource.Cipher.name])}</div>`;
                    desc = desc + `<div>${loc(`space_lander_effect3`,[production('alien_outpost'),global.resource.Cipher.name])}</div>`;
                }
                if (global.tech['outpost_boost']){
                    desc = desc + `<div>${loc('tech_alien_outpost_effect2')}</div>`;
                }
                if (global.race['lone_survivor']){
                    desc = desc + `<div>${loc('city_wardenclyffe_effect1',[jobScale(1), global.civic.professor.name])}</div>`;
                }
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(global.tech['isolation'] ? (global.race['lone_survivor'] ? 8 : 25) : 100); },
            special(){
                return global.tech['replicator'] ? true : false;
            },
            action(){
                return false;
            },
            struct(){
                return {
                    d: { count: 1, on: 0 },
                    p: ['alien_outpost','tauceti']
                };
            }
        },
        data_decoder: {
            id: 'tauceti-data_decoder',
            title(){ return loc('tau_home_data_decoder'); },
            desc(){ return `<div>${loc('tau_home_data_decoder')}</div><div class="has-text-special">${loc('requires_power_support',[loc('tau_planet',[races[global.race.species].home])])}</div>`; },
            type: 'science',
            reqs: { tau_home: 9 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('data_decoder', offset, 780000000, 1.25, 'tauceti'); },
                Water(offset){ return spaceCostMultiplier('data_decoder', offset, 128000, 1.25, 'tauceti'); },
                Orichalcum(offset){ return spaceCostMultiplier('data_decoder', offset, 24500000, 1.25, 'tauceti'); },
                Positronium(offset){ return spaceCostMultiplier('data_decoder', offset, 13500, 1.25, 'tauceti'); },
            },
            effect(wiki){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('tau_planet',[races[global.race.species].home])])}</div>`;
                let quantum_lv = +(get_qlevel(wiki)).toFixed(2);
                desc = desc + `<div>${loc('tau_home_data_decoder_effect',[global.resource.Cipher.name,loc('tech_alien_outpost'),quantum_lv])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            s_type: 'tau_home',
            support(){ return -1; },
            powered(){ return powerCostMod(6); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('data_decoder','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['data_decoder','tauceti']
                };
            }
        },
        jump_gate: {
            id: 'tauceti-jump_gate',
            title(){ return global.tech['resettle'] ? loc('tau_jump_gate_target',[actions.space.spc_sun.info.name()]) : loc('tau_jump_gate'); },
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('jump_gate') || global.tauceti.jump_gate.count < 100 || wiki){
                    return `<div>${loc('tau_jump_gate')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('tau_jump_gate')}</div>`;
                }
            },
            type: 'megaproject',
            reqs: { tauceti: 3 },
            condition(){ return global.tech['isolation'] && !global.tech['resettle'] ? 0 : 1; },
            path: ['truepath'],
            queue_size: 10,
            queue_complete(){ return 100 - global.tauceti.jump_gate.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('jump_gate') ? global.tauceti.jump_gate.count : 0)) < 100 ? 1000000 : 0; },
                Materials(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('jump_gate') ? global.tauceti.jump_gate.count : 0)) < 100 ? 12500 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('jump_gate') ? global.tauceti.jump_gate.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('tau_jump_gate_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else if (global.tech['resettle']){
                    return global.tech.resettle >= 3 ? loc('tau_jump_gate_effect2',[actions.space.spc_sun.info.name()]) : loc('tau_jump_gate_disabled');
                }
                else {
                    return loc('tau_jump_gate_effect');
                }
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.tauceti.jump_gate.count < 100){
                        incrementStruct('jump_gate','tauceti');
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['jump_gate','tauceti']
                };
            }
        },
        fusion_generator: {
            id: 'tauceti-fusion_generator',
            title(){ return loc('tech_fusion_generator'); },
            desc(){
                return `<div>${loc('tech_fusion_generator')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Helium_3.name])}</div>`;
            },
            type: 'power',
            reqs: { tau_home: 6 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('fusion_generator', offset, 188000000, 1.25, 'tauceti'); },
                Iridium(offset){ return  spaceCostMultiplier('fusion_generator', offset, 5550000, 1.25, 'tauceti'); },
                Stanene(offset){ return spaceCostMultiplier('fusion_generator', offset, 7003500, 1.25, 'tauceti'); },
                Sheet_Metal(offset){ return spaceCostMultiplier('fusion_generator', offset, wom_recycle(95000), 1.25, 'tauceti'); },
            },
            effect(){
                let fuel = +int_fuel_adjust($(this)[0].p_fuel().a).toFixed(1);
                let desc = `<div>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered())])}</div>`;
                if (global.race['lone_survivor']){
                    desc = desc + `<div>${loc('gain',[-(fuel),global.resource[$(this)[0].p_fuel().r].name])}</div>`;
                }
                else {
                    desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
                }
                return desc;
            },
            p_fuel(){ return { r: 'Helium_3', a: global.tech['isolation'] ? (global.race['lone_survivor'] ? -15 : 75) : 500 }; },
            powered(){ return powerModifier(-32); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('fusion_generator','tauceti');
                    global.tauceti.fusion_generator.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['fusion_generator','tauceti']
                };
            }
        },
        repository: {
            id: 'tauceti-repository',
            title(){ return loc('tech_repository'); },
            desc(){ return loc('tech_repository'); },
            type: 'storage',
            reqs: { tau_home: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('repository', offset, 10280000, 1.28, 'tauceti'); },
                Iron(offset){ return spaceCostMultiplier('repository', offset, 1800000, 1.28, 'tauceti'); },
                Cement(offset){ return spaceCostMultiplier('repository', offset, 1500000, 1.28, 'tauceti'); },
                Neutronium(offset){ return spaceCostMultiplier('repository', offset, 215000, 1.28, 'tauceti'); },
            },
            wide: true,
            res(){
                let res = [
                    'Lumber','Stone','Furs','Copper','Iron','Aluminium','Cement','Coal','Steel','Titanium','Crystal',
                    'Alloy','Polymer','Iridium','Chrysotile','Nano_Tube','Neutronium','Adamantite','Unobtainium'
                ];
                if (global.tech['isolation']){
                    res.push('Oil');
                    res.push('Helium_3');
                    res.push('Uranium');
                    res.push('Water');
                    //res.push('Elerium');
                }
                if (global.resource.Tungsten.display){
                    res.push('Tungsten');
                }
                return res;
            },
            val(res){
                switch (res){
                    case 'Lumber':
                        return 30000;
                    case 'Stone':
                        return 30000;
                    case 'Chrysotile':
                        return 30000;
                    case 'Crystal':
                        return 10;
                    case 'Furs':
                        return 17000;
                    case 'Copper':
                        return 15200;
                    case 'Iron':
                        return 14000;
                    case 'Aluminium':
                        return 12800;
                    case 'Cement':
                        return 11200;
                    case 'Coal':
                        return 4800;
                    case 'Steel':
                        return 2400;
                    case 'Titanium':
                        return 1600;
                    case 'Alloy':
                        return 1800;
                    case 'Polymer':
                        return 1500;
                    case 'Iridium':
                        return 1750;
                    case 'Nano_Tube':
                        return 1200;
                    case 'Tungsten':
                        return 2000;
                    case 'Neutronium':
                        return 640;
                    case 'Adamantite':
                        return 720;
                    case 'Unobtainium':
                        return 1000;
                    case 'Oil':
                        return 680;
                    case 'Helium_3':
                        return 575;
                    case 'Uranium':
                        return 125;
                    case 'Water':
                        return 15;
                    case 'Elerium':
                        return 3;
                    default:
                        return 0;
                }
            },
            effect(wiki){
                let storage = '<div class="aTable">';
                let multiplier = tpStorageMultiplier('repository',false,wiki);
                let containers = 250;
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let val = sizeApproximation(+(spatialReasoning($(this)[0].val(res)) * multiplier).toFixed(0),1);
                        storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                if (global.tech['isolation']){
                    storage = storage + `<span>${loc('plus_max_resource',[containers,global.resource.Crates.name])}</span><span>${loc('plus_max_resource',[containers,global.resource.Containers.name])}</span>`;
                }
                storage = storage + '</div>';
                return storage;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('repository','tauceti');

                    let containers = 250;
                    global.resource.Crates.max += containers;
                    global.resource.Containers.max += containers;
                    if (!global.resource.Containers.display){
                        unlockContainers();
                    }

                    let multiplier = tpStorageMultiplier('repository');
                    for (const res of $(this)[0].res()){
                        if (global.resource[res].display){
                            global.resource[res].max += (spatialReasoning($(this)[0].val(res)) * multiplier);
                        }
                    };
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0 },
                    p: ['repository','tauceti']
                };
            }
        },
        tau_factory: {
            id: 'tauceti-tau_factory',
            title(){ return loc('tau_home_tau_factory'); },
            desc(){
                return `<div>${loc('tau_home_tau_factory')}</div><div class="has-text-special">${loc('requires_power_support',[races[global.race.species].home])}</div>`;
            },
            type: 'industry',
            reqs: { tau_home: 8 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('tau_factory', offset, 269000000, 1.25, 'tauceti'); },
                Titanium(offset){ return spaceCostMultiplier('tau_factory', offset, 3000000, 1.25, 'tauceti'); },
                Elerium(offset){ return spaceCostMultiplier('tau_factory', offset, 850, 1.25, 'tauceti'); },
                Bolognium(offset){ return spaceCostMultiplier('tau_factory', offset, 250000, 1.25, 'tauceti'); },
                Quantium(offset){ return spaceCostMultiplier('tau_factory', offset, wom_recycle(425000), 1.25, 'tauceti'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), races[global.race.species].home])}</div>`;
                desc = desc + `<div>${loc('tau_home_tau_factory_effect',[$(this)[0].manufacturing()])}</div>`;
                if (global.tech['isolation']){
                    if (!global.race['flier']){
                        desc = desc + `<div>${loc('plus_max_resource',[jobScale(2),loc(`job_cement_worker`)])}</div>`;
                    }
                    desc = desc + `<div>${loc('space_red_fabrication_effect1',[jobScale(5)])}</div>`;
                }
                desc = desc + `<div>${loc('city_crafted_mats',[global.tech['isolation'] ? 275 : 90])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            special: true,
            s_type: 'tau_home',
            support(){ return -1; },
            powered(){ return powerCostMod(global.tech['isolation'] ? 2 : 5); },
            manufacturing() { return global.tech['isolation'] ? 5 : 3; },
            action(){
                if (payCosts($(this)[0])){
                    global.civic.craftsman.display = true; // Needed in Lone Survivor
                    incrementStruct('tau_factory','tauceti');
                    if (powerOnNewStruct($(this)[0])){
                        addFactoryLines($(this)[0].manufacturing());
                    }
                    return true;
                }
                return false;
            },
            post(){
                if (global.race['lone_survivor']){
                    defineIndustry();
                }
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['tau_factory','tauceti']
                };
            }
        },
        infectious_disease_lab: {
            id: 'tauceti-infectious_disease_lab',
            title(){ return global.tech['isolation'] ? loc('tech_infectious_disease_lab_alt') : (loc(global.race['artifical'] ? 'tech_infectious_disease_lab_s' : 'tech_infectious_disease_lab')); },
            desc(){
                return `<div>${$(this)[0].title()}</div><div class="has-text-special">${loc('requires_power_support',[races[global.race.species].home])}</div>`;
            },
            type: 'science',
            reqs: { disease: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('infectious_disease_lab', offset, 1000000000, 1.25, 'tauceti'); },
                Alloy(offset){ return spaceCostMultiplier('infectious_disease_lab', offset, 32500000, 1.25, 'tauceti'); },
                Polymer(offset){ return spaceCostMultiplier('infectious_disease_lab', offset, 50000000, 1.25, 'tauceti'); },
                Bolognium(offset){ return spaceCostMultiplier('infectious_disease_lab', offset, 2500000, 1.25, 'tauceti'); },
                Unobtainium(offset){ return spaceCostMultiplier('infectious_disease_lab', offset, 64000, 1.25, 'tauceti'); },
            },
            effect(){
                let sci = 39616;
                if (global.tech['supercollider'] && global.tech['isolation']){
                    let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 12.5: 25;
                    sci *= (global.tech['supercollider'] / ratio) + 1;
                }
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), races[global.race.species].home])}</div>`;
                desc = desc + `<div>${loc('city_max_knowledge',[Math.round(sci).toLocaleString()])}</div>`;
                if (global.tech['isolation']){
                    let elerium = spatialReasoning(375);
                    desc = desc + `<div>${loc('plus_max_resource',[elerium,global.resource.Elerium.name])}</div>`;
                    desc = desc + `<div>${loc('city_wardenclyffe_effect1',[jobScale(2), global.civic.professor.name])}</div>`;
                    desc = desc + `<div>${loc('city_wardenclyffe_effect1',[jobScale(1), global.civic.scientist.name])}</div>`;
                    desc = desc + `<div>${loc('space_zero_g_lab_effect',[jobScale(1)])}</div>`;
                    desc = desc + `<div>${loc('city_library_effect',[75])}</div>`;
                }
                if (global.tech['alien_crafting']){
                    desc = desc + `<div>${loc('production',[65,global.resource.Quantium.name])}</div>`;
                }
                if (global.tech['focus_cure']){
                    desc = desc + `<div>${loc('tau_home_disease_lab_cure',[+global.tauceti.infectious_disease_lab.cure.toFixed(1)])}</div>`;
                    if (global.race.hasOwnProperty('vax')){
                        desc = desc + `<div>${loc('tau_home_disease_lab_vax',[+global.race.vax.toFixed(2)])}</div>`;
                    }
                }
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            s_type: 'tau_home',
            support(){ return -1; },
            powered(){ return powerCostMod(global.tech['isolation'] ? (global.race['lone_survivor'] ? 2 : 8) : 35); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('infectious_disease_lab','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, cure: 0 },
                    p: ['infectious_disease_lab','tauceti']
                };
            },
            post(){
                if (global.tech.disease === 1){
                    global.tech.disease = 2;
                    messageQueue(loc('tau_plague4',[loc('tab_tauceti')]),'info',false,['progress']);
                    drawTech();
                }
                loadFoundry();
            },
            postPower(on){
                limitCraftsmen('Quantium');
            }
        },
        tauceti_casino: {
            id: 'tauceti-tauceti_casino',
            title(){ return structName('casino'); },
            desc(){ return structName('casino'); },
            type: 'gambling',
            category: 'commercial',
            reqs: { gambling: 1, isolation: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('tauceti_casino', offset, 1450000, 1.35, 'tauceti'); },
                Furs(offset){ return spaceCostMultiplier('tauceti_casino', offset, 95000, 1.35, 'tauceti'); },
                Cement(offset){ return spaceCostMultiplier('tauceti_casino', offset, 120000, 1.35, 'tauceti'); },
                Plywood(offset){ return spaceCostMultiplier('tauceti_casino', offset, wom_recycle(55000), 1.35, 'tauceti'); }
            },
            effect(){
                let pop = $(this)[0].citizens();
                let desc = global.race['lone_survivor'] ? `` : `<div>${loc('plus_max_resource',[pop,loc('citizen')])}</div>`;
                desc = desc + casinoEffect();
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(global.race['lone_survivor'] ? 1 : 2); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('tauceti_casino','tauceti');
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
                    p: ['tauceti_casino','tauceti']
                };
            },
            citizens(){
                let gain = 1;
                if (global.race['high_pop']){
                    gain *= traits.high_pop.vars()[0];
                }
                return global.race['lone_survivor'] ? 0 : gain;
            },
            flair: loc('city_casino_flair')
        },
        tau_cultural_center: {
            id: 'tauceti-tau_cultural_center',
            title(){ return loc('tech_cultural_center'); },
            desc(){
                return `<div>${loc('tech_cultural_center')}</div><div class="has-text-special">${loc('space_electrolysis_req',[global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            type: 'entertainment',
            category: 'commercial',
            reqs: { tau_culture: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('tau_cultural_center', offset, 91450000, 1.35, 'tauceti'); },
                Copper(offset){ return spaceCostMultiplier('tau_cultural_center', offset, 5850000, 1.35, 'tauceti'); },
                Coal(offset){ return spaceCostMultiplier('tau_cultural_center', offset, 465000, 1.35, 'tauceti'); },
                Polymer(offset){ return spaceCostMultiplier('tau_cultural_center', offset, 3792000, 1.35, 'tauceti'); },
            },
            effect(){
                let womling = 8;
                let modifier = 1;
                if (global.civic.govern.type === 'corpocracy'){
                    modifier = 1 + (govEffect.corpocracy()[2] / 100);
                }
                else if (global.civic.govern.type === 'socialist'){
                    modifier = 1 - (govEffect.socialist()[3] / 100);
                }

                let cas = +(20 * modifier).toFixed(2);
                let mon = +(5 * modifier).toFixed(2);
                let bake = +(15 * modifier).toFixed(2);

                let desc = `<div class="has-text-caution">${loc('tau_home_cultureal_effect1',[$(this)[0].p_fuel().a,global.resource[$(this)[0].p_fuel().r].name,typeof $(this)[0].title === 'string' ? $(this)[0].title : $(this)[0].title()])}</div>`;
                desc += `<div>${loc('city_tourist_center_effect2',[cas,structName('casino')])}</div>`;
                desc += `<div>${loc('city_tourist_center_effect2',[mon,loc(`arpa_project_monument_title`)])}</div>`;
                desc += `<div>${loc('tau_home_cultureal_effect2',[womling,loc('tau_red_womlings')])}</div>`;
                if (global.tech.tau_culture >= 2){
                    desc += `<div>${loc('tau_home_cultureal_effect3',[bake,loc(`tau_gas2_alien_station_data2_r${global.race.tau_food_item || 0}`)])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(1); },
            p_fuel(){ return { r: 'Food', a: (global.race['lone_survivor'] ? 25 : 500) }; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('tau_cultural_center','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['tau_cultural_center','tauceti']
                };
            }
        },
        marine_barracks: {
            id: 'tauceti-marine_barracks',
            title(){ return loc('tau_home_marine_barracks'); },
            desc(){ return `<div>${loc('tau_home_marine_barracks')}</div><div class="has-text-special">${loc('space_support',[loc('tau_planet',[races[global.race.species].home])])}</div>`; },
            type: 'military',
            reqs: { resettle: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('marine_barracks', offset, 42000000, 1.25, 'tauceti'); },
                Stone(offset){ return spaceCostMultiplier('marine_barracks', offset, 2600000, 1.25, 'tauceti'); },
                Furs(offset){ return spaceCostMultiplier('marine_barracks', offset, 2200000, 1.25, 'tauceti'); },
                Water(offset){ return spaceCostMultiplier('marine_barracks', offset, 15000, 1.25, 'tauceti'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('tau_planet',[races[global.race.species].home])])}</div>`;
                desc += `<div>${loc('plus_max_soldiers',[$(this)[0].soldiers()])}</div>`;
                return desc;
            },
            s_type: 'tau_home',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('marine_barracks','tauceti');
                    powerOnNewStruct($(this)[0]);
                    tauEnableSoldiers();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['marine_barracks','tauceti']
                };
            },
            soldiers(){
                return jobScale(6);
            }
        },
    },
    tau_red: {
        info: {
            name(){
                return loc('tau_planet',[planetName().red]);
            },
            desc(){
                return loc('tau_red',[planetName().red]);
            },
            nav(){ return global.tech['resettle'] ? true : false; },
            support: 'orbital_platform',
            extra(region){
                if (global.tech['tau_red'] && global.tech.tau_red >= 5){
                    $(`#${region}`).append(`<div id="${region}Womlings" class="syndThreat has-text-warning">${loc('tau_red_womling_prod')} <span class="has-text-info">{{ prod }}%</span></div>`);
                    vBind({
                        el: `#${region}Womlings`,
                        data: global.tauceti.overseer,
                    });
                }
            }
        },
        red_mission: {
            id: 'tauceti-red_mission',
            title(){ return loc('tau_new_mission_title',[planetName().red]); },
            desc(){ return loc('tau_new_mission_title',[planetName().red]); },
            reqs: { tauceti: 2 },
            grant: ['tau_red',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 1 ? 0 : 1; },
            cost: {
                Money(){ return 1000000000; }
            },
            effect(){ return loc('tau_new_mission_effect',[planetName().red]); },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti['settlement'] = { count: 0, on: 0 };
                    messageQueue(loc('tau_red_mission_result',[planetName().red]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        orbital_platform: {
            id: 'tauceti-orbital_platform',
            title(){ return loc('tau_red_orbital_platform'); },
            desc(){ return `<div>${loc('tau_red_orbital_platform')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            type: 'outpost',
            reqs: { tau_red: 1, tauceti: 4 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('orbital_platform', offset, 50000000, 1.3, 'tauceti'); },
                Oil(offset){ return tauEnabled() ? spaceCostMultiplier('orbital_platform', offset, int_fuel_adjust(wom_repulse(275000)), 1.3, 'tauceti') : 0; },
                Aluminium(offset){ return spaceCostMultiplier('orbital_platform', offset, 1780000, 1.3, 'tauceti'); },
                Bolognium(offset){ return spaceCostMultiplier('orbital_platform', offset, 450000, 1.3, 'tauceti'); },
            },
            effect(){
                let oil = spatialReasoning(17500);
                let fuel = +int_fuel_adjust($(this)[0].support_fuel().a).toFixed(1);
                let desc = `<div>${loc('space_red_spaceport_effect1',[loc('tau_planet',[planetName().red]),$(this)[0].support()])}</div>`;
                desc = desc + `<div>${loc('plus_max_resource',[oil.toLocaleString(),global.resource.Oil.name])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend_power',[fuel,global.resource[$(this)[0].support_fuel().r].name,$(this)[0].powered()])}</div>`;
                return desc;
            },
            support_fuel(){ return { r: global.race['lone_survivor'] ? 'Helium_3' : 'Oil', a: global.tech['isolation'] ? (global.race['lone_survivor'] ? 8 : 32) : 125 }; },
            support(){
                let sup = global.tech['womling_pop'] && global.tech.womling_pop >= 3 ? 3 : (global.tech['womling_logistics'] ? 2.5 : 2);
                if (global.race['lone_survivor']){ sup *= 2; }
                return sup;
            },
            powered(){ return powerCostMod(global.tech['isolation'] ? (global.race['lone_survivor'] ? 2 : 3) : 18); },
            refresh: true,
            action(){
                if (tauEnabled() && payCosts($(this)[0])){
                    incrementStruct('orbital_platform','tauceti');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech['tau_red'] === 1){
                        global.tech['tau_red'] = 2;
                        messageQueue(loc('tau_red_orbital_platform_msg',[loc('tau_planet',[planetName().red]),loc('tau_planet',[races[global.race.species].home])]),'info',false,['progress']);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['orbital_platform','tauceti']
                };
            }
        },
        contact: {
            id: 'tauceti-contact',
            title(){ return loc('tau_red_contact'); },
            desc(){ return loc('tau_red_contact'); },
            reqs: { tau_red: 4 },
            grant: ['tau_red',5],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 5 ? 0 : 1; },
            cost: {
                Money(){ return 600000000; },
                Food(){ return global.race['lone_survivor'] && global.race['artifical'] ? 62000 : 2500000; }
            },
            effect(){ return loc('tau_red_contact_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.race['womling_friend'] = 1;
                    defineWomlings();
                    return true;
                }
                return false;
            }
        },
        introduce: {
            id: 'tauceti-introduce',
            title(){ return loc('tau_red_introduce'); },
            desc(){ return loc('tau_red_introduce'); },
            reqs: { tau_red: 4 },
            grant: ['tau_red',5],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 5 ? 0 : 1; },
            cost: {
                Knowledge(){ return 7000000; }
            },
            effect(){ return loc('tau_red_introduce_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.race['womling_god'] = 1;
                    defineWomlings();
                    return true;
                }
                return false;
            }
        },
        subjugate: {
            id: 'tauceti-subjugate',
            title(){ return loc('tau_red_subjugate'); },
            desc(){ return loc('tau_red_subjugate'); },
            reqs: { tau_red: 4 },
            grant: ['tau_red',5],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 5 ? 0 : 1; },
            cost: {
                Money(){ return 2850000000; }
            },
            effect(){ return loc('tau_red_subjugate_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.race['womling_lord'] = 1;
                    defineWomlings();
                    return true;
                }
                return false;
            }
        },
        jeff: {
            id: 'tauceti-jeff',
            title(){ return loc('tau_red_jeff'); },
            desc(){ return loc('tau_red_jeff'); },
            reqs: { tau_red: 5 },
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 5 ? 0 : 1; },
            cost: {},
            effect(){
                let injured = global.tauceti['overseer'] ? global.tauceti.overseer.injured : 0;
                if (global.tauceti['overseer'] && global.tauceti.overseer.pop < injured){ injured = global.tauceti.overseer.pop; }
                let desc = `<div>${loc('tau_red_jeff_effect1',[global.tauceti['overseer'] ? global.tauceti.overseer.pop : 0])}</div>`;
                desc = desc + `<div>${loc('tau_red_jeff_effect2',[global.tauceti['overseer'] ? global.tauceti.overseer.working : 0])}</div>`;
                desc = desc + `<div>${loc('tau_red_jeff_effect3',[injured])}</div>`;
                desc = desc + `<div>${loc('tau_red_jeff_effect4',[global.tauceti['overseer'] ? global.tauceti.overseer.loyal : 0])}</div>`;
                desc = desc + `<div>${loc('tau_red_jeff_effect5',[global.tauceti['overseer'] ? global.tauceti.overseer.morale : 0])}</div>`;
                if (global.tech.hasOwnProperty('womling_tech')){
                    desc = desc + `<div>${loc('tau_red_jeff_effect6',[global.tech.womling_tech])}</div>`;
                }
                desc = desc + `<div class="divide-line">${loc('job_farmer')}: ${global.tauceti['womling_farm'] ? global.tauceti.womling_farm.farmers : 0}</div>`;
                desc = desc + `<div>${loc('job_miner')}: ${global.tauceti['womling_mine'] ? global.tauceti.womling_mine.miners : 0}</div>`;
                if (global.tauceti['womling_lab']){
                    desc = desc + `<div>${loc('job_scientist')}: ${global.tauceti['womling_lab'] ? global.tauceti.womling_lab.scientist : 0}</div>`;
                }
                if (global.tauceti['womling_craftworks']){
                    desc = desc + `<div>${loc('job_artisan')}: ${womlingArtisans()}</div>`;
                }
                return desc;
            },
            action(){
                return false;
            }
        },
        overseer: {
            id: 'tauceti-overseer',
            title(){ return $(this)[0].name(); },
            desc(){ return `<div>${$(this)[0].name()}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'outpost',
            name(){
                if (global.race['womling_lord']){
                    return loc('tau_red_overseer');
                }
                else if (global.race['womling_god']){
                    return loc('tau_red_womgod');
                }
                else {
                    return loc('tau_red_womally');
                }
            },
            reqs: { tau_red: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('overseer', offset, 6000000, 1.28, 'tauceti'); },
                Cement(offset){ return spaceCostMultiplier('overseer', offset, 2450000, 1.28, 'tauceti'); },
                Alloy(offset){ return global.race['womling_friend'] ? spaceCostMultiplier('overseer', offset, 1850000, 1.28, 'tauceti') : 0; },
                Neutronium(offset){ return global.race['womling_lord'] ? spaceCostMultiplier('overseer', offset, 165000, 1.28, 'tauceti') : 0; },
                Titanium(offset){ return global.race['womling_god'] ? spaceCostMultiplier('overseer', offset, 2250000, 1.28, 'tauceti') : 0; },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_overseer_effect',[$(this)[0].val()])}</div>`;
                return desc;
            },
            val(){
                let val = 0;
                if (global.race['womling_lord']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 12 : 10;
                }
                else if (global.race['womling_god']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 6 : 5;
                }
                else if (global.race['womling_friend']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 10 : 8;
                }
                if (global.race['lone_survivor']){
                    val *= 2;
                }
                return val;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('overseer','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, pop: 0, working: 0, injured: 0, morale: 0, loyal: 0, prod: 0 },
                    p: ['overseer','tauceti']
                };
            }
        },
        womling_village: {
            id: 'tauceti-womling_village',
            title(){ return loc('tau_red_womling_village'); },
            desc(){ return `<div>${loc('tau_red_womling_village')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'housing',
            reqs: { tau_red: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_village', offset, 10000000, 1.28, 'tauceti'); },
                Stone(offset){ return spaceCostMultiplier('womling_village', offset, 2250000, 1.28, 'tauceti'); },
                Plywood(offset){ return spaceCostMultiplier('womling_village', offset, wom_recycle(1250000), 1.28, 'tauceti'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('womling_village', offset, wom_recycle(400000), 1.28, 'tauceti'); },
            },
            effect(){
                let pop = womlingVillagePop();
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_village_effect',[pop])}</div>`;
                if (global.tech['tau_junksale']){
                    desc = desc + `<div>${loc('tau_red_womling_village_effect2',[40,loc(`tau_gas2_alien_station_data4_r${global.race.tau_junk_item || 0}`)])}</div>`;
                }
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('womling_village','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 1, on: 1 },
                    p: ['womling_village','tauceti']
                };
            }
        },
        womling_farm: {
            id: 'tauceti-womling_farm',
            title(){ return loc('tau_red_womling_farm'); },
            desc(){ return `<div>${loc('tau_red_womling_farm')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'farming',
            reqs: { tau_red: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_farm', offset, 24000000, 1.28, 'tauceti'); },
                Iron(offset){ return spaceCostMultiplier('womling_farm', offset, 9500000, 1.28, 'tauceti'); },
                Water(offset){ return spaceCostMultiplier('womling_farm', offset, 5000, 1.28, 'tauceti'); },
            },
            effect(){
                let food = womlingFarmFood();
                let farmers = global.tauceti.hasOwnProperty('womling_farm') ? global.tauceti.womling_farm.farmers : 0;
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_farm_effect',[food])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_employ',[2])}</div>`;
                if (global.tech['isolation']){
                    desc = desc + `<div>${loc('tau_red_womling_generate',[global.resource.Furs.name])}</div>`;
                }
                desc = desc + `<div>${loc('tau_red_womling_farm_effect2',[food / 2 * farmers,global.resource.Food.name])}</div>`;
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('womling_farm','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 1, on: 1, farmers: 0 },
                    p: ['womling_farm','tauceti']
                };
            }
        },
        womling_mine: {
            id: 'tauceti-womling_mine',
            title(){ return loc('tau_red_womling_mine'); },
            desc(){ return `<div>${loc('tau_red_womling_mine')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'mining',
            reqs: { tau_red: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_mine', offset, 12500000, 1.28, 'tauceti'); },
                Lumber(offset){ return spaceCostMultiplier('womling_mine', offset, 12800000, 1.28, 'tauceti'); },
                Steel(offset){ return spaceCostMultiplier('womling_mine', offset, 4500000, 1.28, 'tauceti'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), planetName().red])}</div>`;
                if (global.tech['isolation']){
                    if (global.race['lone_survivor']){
                        desc = desc + `<div>${loc('tau_red_womling_mine_effect_c',[
                            global.resource.Unobtainium.name,global.resource.Uranium.name,global.resource.Titanium.name,global.resource.Iron.name,
                            global.resource.Copper.name,global.resource.Aluminium.name,global.resource.Neutronium.name,global.resource.Iridium.name
                        ])}</div>`;
                    }
                    else {
                        desc = desc + `<div>${loc('tau_red_womling_mine_effect_b',[global.resource.Unobtainium.name,global.resource.Uranium.name,global.resource.Titanium.name])}</div>`;
                    }
                }
                else {
                    desc = desc + `<div>${loc('tau_red_womling_mine_effect_a',[global.resource.Unobtainium.name])}</div>`;
                }
                desc = desc + `<div>${loc('tau_red_womling_employ',[6])}</div>`;
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('womling_mine','tauceti');
                    global.resource.Unobtainium.display = true;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, miners: 0 },
                    p: ['womling_mine','tauceti']
                };
            },
            flair(){ return loc('tau_red_womling_mine_flair'); }
        },
        womling_fun: {
            id: 'tauceti-womling_fun',
            title(){ return $(this)[0].name(); },
            desc(){ return `<div>${$(this)[0].name()}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'entertainment',
            name(){
                if (global.race['womling_lord']){
                    return loc('tau_red_womling_fun1');
                }
                else if (global.race['womling_god']){
                    return loc('tau_red_womling_fun2');
                }
                else {
                    return loc('tau_red_womling_fun3');
                }
            },
            reqs: { tau_red: 6 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_fun', offset, 3800000, 1.28, 'tauceti'); },
                Food(offset){ return global.race['womling_friend'] ? spaceCostMultiplier('womling_fun', offset, 175000, 1.28, 'tauceti') : 0; },
                Lumber(offset){ return spaceCostMultiplier('womling_fun', offset, 500000, 1.28, 'tauceti'); },
                Stone(offset){ return spaceCostMultiplier('womling_fun', offset, 500000, 1.28, 'tauceti'); },
                Furs(offset){ return global.race['womling_lord'] || global.race['womling_god'] ? spaceCostMultiplier('womling_fun', offset, 835000, 1.28, 'tauceti') : 0; },
                Copper(offset){ return global.race['womling_lord'] ? spaceCostMultiplier('womling_fun', offset, 1125000, 1.28, 'tauceti') : 0; },
                Alloy(offset){ return global.race['womling_god'] ? spaceCostMultiplier('womling_fun', offset, 656000, 1.28, 'tauceti') : 0; },
                Water(offset){ return global.race['womling_friend'] ? spaceCostMultiplier('womling_fun', offset, 3500, 1.28, 'tauceti') : 0; },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_fun_effect',[$(this)[0].val()])}</div>`;
                return desc;
            },
            val(){
                let val = 0;
                if (global.race['womling_lord']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 24 : 20;
                }
                else if (global.race['womling_god']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 12 : 10;
                }
                else if (global.race['womling_friend']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 18 : 15;
                }
                if (global.race['lone_survivor']){
                    val *= 2;
                }
                return val;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('womling_fun','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['womling_fun','tauceti']
                };
            },
        },
        womling_lab: {
            id: 'tauceti-womling_lab',
            title(){ return loc('interstellar_laboratory_title'); },
            desc(){ return `<div>${loc('interstellar_laboratory_title')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'science',
            reqs: { tau_red: 7 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_lab', offset, 65000000, 1.28, 'tauceti'); },
                Elerium(offset){ return spaceCostMultiplier('womling_lab', offset, 1200, 1.28, 'tauceti'); },
                Orichalcum(offset){ return spaceCostMultiplier('womling_lab', offset, 2500000, 1.28, 'tauceti'); },
                Unobtainium(offset){ return spaceCostMultiplier('womling_lab', offset, 10000, 1.28, 'tauceti'); },
                Quantium(offset){ return spaceCostMultiplier('womling_lab', offset, wom_recycle(95000), 1.28, 'tauceti'); },
            },
            effect(){
                let overseer = global.tauceti.hasOwnProperty('overseer') ? global.tauceti.overseer.prod : 100;
                let know = Math.round(25000 * overseer / 100);
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_lab_effect',[know])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_employ_single',[1])}</div>`;

                // How far along the Womlings are is only legible to someone who has ruled them before.
                if (global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5){
                    const progress = global.tauceti.womling_lab.tech / getWeaselTechLevelRequirement() * 100;
                    desc = desc + `<div class="has-text-advanced">${loc('tau_red_womling_lab_tech_level',[global.tech.womling_tech ?? 0, progress.toFixed(2)])}</div>`;
                }
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('womling_lab','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, scientist: 0, tech: 0 },
                    p: ['womling_lab','tauceti']
                };
            },
        },
        antimatter_reactor: {
            id: 'tauceti-antimatter_reactor',
            title(){ return loc('tech_antimatter_reactor'); },
            desc(){
                return `<div>${loc('tech_antimatter_reactor')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Helium_3.name])}</div>`;
            },
            type: 'power',
            reqs: { womling_energy: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('antimatter_reactor', offset, 1000000000, 1.3, 'tauceti'); },
                Neutronium(offset){ return  spaceCostMultiplier('antimatter_reactor', offset, 3750000, 1.3, 'tauceti'); },
                Orichalcum(offset){ return spaceCostMultiplier('antimatter_reactor', offset, 75000000, 1.3, 'tauceti'); },
                Quantium(offset){ return spaceCostMultiplier('antimatter_reactor', offset, wom_recycle(420000), 1.3, 'tauceti'); },
            },
            effect(){
                let fuel = +int_fuel_adjust($(this)[0].p_fuel().a).toFixed(2);
                let desc = `<div>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered())])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
                return desc;
            },
            p_fuel(){ return { r: 'Positronium', a: 0.12 }; },
            powered(){ return powerModifier(-48); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('antimatter_reactor','tauceti');
                    global.tauceti.antimatter_reactor.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['antimatter_reactor','tauceti']
                };
            }
        },
        womling_rangers: {
            id: 'tauceti-womling_rangers',
            title(){ return loc('tau_red_womling_rangers'); },
            desc(){ return `<div>${loc('tau_red_womling_rangers')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'military',
            reqs: { womling_military: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_rangers', offset, 38000000, 1.28, 'tauceti'); },
                Food(offset){ return spaceCostMultiplier('womling_rangers', offset, 2000000, 1.28, 'tauceti'); },
                Cement(offset){ return spaceCostMultiplier('womling_rangers', offset, 1800000, 1.28, 'tauceti'); },
                Unobtainium(offset){ return spaceCostMultiplier('womling_rangers', offset, 675000, 1.28, 'tauceti'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().red])}</div>`;
                desc += `<div>${loc('plus_max_soldiers',[$(this)[0].soldiers()])}</div>`;
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('womling_rangers','tauceti');
                    powerOnNewStruct($(this)[0]);
                    tauEnableSoldiers();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['womling_rangers','tauceti']
                };
            },
            soldiers(){
                return jobScale(5);
            }
        },
        womling_craftworks: {
            id: 'tauceti-womling_craftworks',
            title(){ return loc('tau_red_womling_craftworks'); },
            desc(){ return `<div>${loc('tau_red_womling_craftworks')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'industry',
            reqs: { womling_technicians: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_craftworks', offset, 78000000, 1.28, 'tauceti'); },
                Stone(offset){ return spaceCostMultiplier('womling_craftworks', offset, 6400000, 1.28, 'tauceti'); },
                Adamantite(offset){ return spaceCostMultiplier('womling_craftworks', offset, 1850000, 1.28, 'tauceti'); },
                Orichalcum(offset){ return spaceCostMultiplier('womling_craftworks', offset, 3100000, 1.28, 'tauceti'); },
                Quantium(offset){ return spaceCostMultiplier('womling_craftworks', offset, wom_recycle(120000), 1.28, 'tauceti'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_employ',[womlingArtisansPer()])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_craftworks_effect',[1])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_craftworks_effect2',[1])}</div>`;
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('womling_craftworks','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, artisan: 0 },
                    p: ['womling_craftworks','tauceti']
                };
            },
        },
    },
    tau_gas: {
        info: {
            name(n,k){
                let key = k || 'gas_name';
                let ns = key === 'gas_name' ? 0 : 1;
                if (n || global.race[key]){
                    switch (n || global.race[key]){
                        case 1:
                        {
                            let tracked = global.race.universe === 'antimatter' ? 'plasmid' : 'antiplasmid';
                            switch (Math.round(global.stats[tracked] + ns) % 3){
                                case 1:
                                    return loc('tau_planet',[planetName().gas]);
                                case 2:
                                    return loc('tau_gas_title0a',[planetName().gas]);
                                default:
                                    return loc('tau_gas_title0b',[planetName().gas]);
                            }
                        }
                        case 2:
                        {
                            switch (Math.round(global.stats.reset + ns) % 3){
                                case 1:
                                    return loc('tau_gas_title1a');
                                case 2:
                                    return loc('tau_gas_title1b');
                                default:
                                    return loc('tau_gas_title1c');
                            }
                        }
                        case 3:
                        {
                            switch (Math.round(global.stats.mad + ns) % 3){
                                case 1:
                                    return loc('tau_gas_title2a');
                                case 2:
                                    return loc('tau_gas_title2b');
                                default:
                                    return loc('tau_gas_title2c');
                            }
                        }
                        case 4:
                        {
                            switch (Math.round(global.stats.bioseed + ns) % 3){
                                case 1:
                                    return loc('tau_gas_title3a',[races[global.race.gods].solar.gas]);
                                case 2:
                                    return loc('tau_gas_title3b',[races[global.race.old_gods].name]);
                                default:
                                    return loc('tau_gas_title3c',[races[global.race.species].name]);
                            }
                        }
                        case 5:
                        {
                            switch (Math.round(global.stats.portals + ns) % 3){
                                case 1:
                                    return loc('tau_gas_title4a',[planetName().gas]);
                                case 2:
                                    return loc('tau_gas_title4b',[flib('reverse',planetName().gas)]);
                                default:
                                    return loc('tau_gas_title4c');
                            }
                        }
                        case 6:
                        {

                            switch (Math.round(global.stats.womling.friend.l + global.stats.womling.lord.l + global.stats.womling.god.l + ns) % 3){
                                case 1:
                                    return loc('tau_gas_title5a');
                                case 2:
                                    return loc('tau_gas_title5b');
                                default:
                                    return loc('tau_gas_title5c');
                            }
                        }
                        case 7:
                        {
                            switch (Math.round(global.stats.tdays + ns) % 3){
                                case 1:
                                    return loc('tau_gas_title6a');
                                case 2:
                                    return loc('tau_gas_title6b');
                                default:
                                    return loc('tau_gas_title6c');
                            }
                        }
                        default:
                            return key === 'gas_name' ? loc('tau_gas_title') : loc('tau_gas2_title');
                    }
                }
                return key === 'gas_name' ? loc('tau_gas_title') : loc('tau_gas2_title');
            },
            desc(){
                return loc('tau_gas_desc');
            },
            nav(){ return global.tech['resettle'] ? true : false; }
        },
        gas_contest: {
            id: 'tauceti-gas_contest',
            title(){ return loc('tau_gas_contest_title'); },
            desc(){ return loc('tau_gas_contest_title'); },
            reqs: { tauceti: 5 },
            grant: ['tau_gas',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_gas >= 1 ? 0 : 1; },
            cost: {
                Money(){ return 10000000; }
            },
            effect(){ return global.race['lone_survivor'] ? loc('tau_gas_contest_effect_alt') : loc('tau_gas_contest_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    return true;
                }
                return false;
            }
        },
        refueling_station: {
            id: 'tauceti-refueling_station',
            title(){ return loc('tau_gas_refueling_station_title'); },
            desc(){
                return `<div>${loc('tau_gas_refueling_station_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'industry',
            reqs: { tau_gas: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('refueling_station', offset, 68000000, 1.28, 'tauceti'); },
                Graphene(offset){ return spaceCostMultiplier('refueling_station', offset, 2500000, 1.28, 'tauceti'); },
                Unobtainium(offset){ return spaceCostMultiplier('refueling_station', offset, 5500, 1.28, 'tauceti'); },
                Mythril(offset){ return spaceCostMultiplier('refueling_station', offset, wom_recycle(60000), 1.28, 'tauceti'); },
            },
            powered(){ return powerCostMod(global.tech['isolation'] ? 2 : 5); },
            effect(){
                let helium_prod = +(production('refueling_station')).toFixed(2);
                let helium_tank = spatialReasoning(10000);
                let desc = `<div>${loc('space_gas_mining_effect1',[helium_prod])}</div>`;
                desc = desc + `<div>${loc('plus_max_resource',[helium_tank.toLocaleString(),global.resource.Helium_3.name])}</div>`;
                if (global.tech['tau_whale'] >= 2){
                    let oil_tank = spatialReasoning(6500);
                    desc = desc + `<div>${loc('plus_max_resource',[oil_tank.toLocaleString(),global.resource.Oil.name])}</div>`;
                }
                if (global.tech['isolation']){
                    desc = desc +  `<div>${loc('interstellar_g_factory_effect')}</div>`;
                }
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            special(){ return global.tech['isolation'] ? true : false; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('refueling_station','tauceti');
                    if (powerOnNewStruct($(this)[0])) {
                        if (global.tech['isolation']){
                            if (global.race['kindling_kindred'] || global.race['smoldering']){
                                global.tauceti.refueling_station.Oil++;
                            }
                            else {
                                global.tauceti.refueling_station.Lumber++;
                            }
                        }
                    }
                    return true;
                }
                return false;
            },
            struct(){
                // Carries its own graphene fuel allocation. It used to borrow the Titan factory's, which
                // only worked while isolation kept Titan out of reach; the jump gate brings Titan back and
                // both plants now run at the same time.
                return {
                    d: { count: 0, on: 0, Lumber: 0, Coal: 0, Oil: 0 },
                    p: ['refueling_station','tauceti']
                };
            },
            post(){
                if (global.tech.tau_gas === 2){
                    global.tech.tau_gas = 3;
                    defineIndustry();
                    drawTech();
                }
            }
        },
        ore_refinery: {
            id: 'tauceti-ore_refinery',
            title(){ return loc('tau_gas_ore_refinery_title'); },
            desc(){
                return `<div>${loc('tau_gas_ore_refinery_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'industry',
            reqs: { tau_gas: 4 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('ore_refinery', offset, 52000000, 1.28, 'tauceti'); },
                Iridium(offset){ return spaceCostMultiplier('ore_refinery', offset, 1600000, 1.28, 'tauceti'); },
                Unobtainium(offset){ return spaceCostMultiplier('ore_refinery', offset, 800, 1.28, 'tauceti'); },
                Sheet_Metal(offset){ return spaceCostMultiplier('ore_refinery', offset, wom_recycle(118000), 1.28, 'tauceti'); },
            },
            powered(){ return powerCostMod(global.tech['isolation'] ? 2 : 8); },
            smelting(){ return global.tech['isolation'] ? 12 : 4; },
            effect(){
                let ore = global.tauceti.hasOwnProperty('ore_refinery') ? global.tauceti.ore_refinery.fill : 0;
                let max = global.tauceti.hasOwnProperty('ore_refinery') ? global.tauceti.ore_refinery.max : 0;
                let refine = +(production('ore_refinery')).toFixed(2);
                let desc = `<div>${loc('tau_gas_ore_refinery_effect',[+ore.toFixed(2)])}</div>`;
                desc = desc + `<div>${loc('tau_gas_ore_refinery_effect2',[max])}</div>`;
                desc = desc + `<div>${loc('tau_gas_ore_refinery_effect3',[refine])}</div>`;
                desc = desc + `<div>${loc('interstellar_stellar_forge_effect3',[$(this)[0].smelting()])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            special: true,
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('ore_refinery','tauceti');
                    if (powerOnNewStruct($(this)[0])){
                        let num_smelters = $(this)[0].smelting();
                        addSmelter(num_smelters, 'Steel', global.race['evil'] ? 'Wood' : 'Oil');
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, max: 0, fill: 0 },
                    p: ['ore_refinery','tauceti']
                };
            },
            post(){
                if (global.tech.tau_roid === 3){
                    global.tech.tau_roid = 4;
                    renderTauCeti();
                    drawTech();
                }
            }
        },
        whaling_station: {
            id: 'tauceti-whaling_station',
            title(){ return loc('tau_gas_whaling_station_title'); },
            desc(){
                return `<div>${loc('tau_gas_whaling_station_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'farming',
            reqs: { tau_whale: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('whaling_station', offset, 72000000, 1.28, 'tauceti'); },
                Steel(offset){ return spaceCostMultiplier('whaling_station', offset, 1800000, 1.28, 'tauceti'); },
                Polymer(offset){ return spaceCostMultiplier('whaling_station', offset, 955000, 1.28, 'tauceti'); },
                Orichalcum(offset){ return spaceCostMultiplier('whaling_station', offset, 268000, 1.28, 'tauceti'); },
            },
            powered(){ return powerCostMod(global.tech['isolation'] ? 2 : 6); },
            effect(){
                let blubber = global.tauceti.hasOwnProperty('whaling_station') ? global.tauceti.whaling_station.fill : 0;
                let max = global.tauceti.hasOwnProperty('whaling_station') ? global.tauceti.whaling_station.max : 0;
                let refine = +(production('whaling_station')).toFixed(2);
                let desc = `<div>${loc('tau_gas_whaling_station_effect',[+blubber.toFixed(2)])}</div>`;
                desc = desc + `<div>${loc('tau_gas_whaling_station_effect2',[max])}</div>`;
                desc = desc + `<div>${loc('tau_gas_whaling_station_effect3',[refine])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('whaling_station','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, max: 0, fill: 0 },
                    p: ['whaling_station','tauceti']
                };
            },
            post(){
                if (global.tech.tau_whale === 1){
                    global.tech.tau_whale = 2;
                    renderTauCeti();
                }
            }
        },
        womling_station: {
            id: 'tauceti-womling_station',
            title(){ return loc('tau_gas_womling_station_title'); },
            desc(){
                return `<div>${loc('tau_gas_womling_station_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'outpost',
            reqs: { womling_technicians: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_station', offset, 133400000, 1.26, 'tauceti'); },
                Furs(offset){ return spaceCostMultiplier('womling_station', offset, 3805000, 1.26, 'tauceti'); },
                Aluminium(offset){ return spaceCostMultiplier('womling_station', offset, 8500000, 1.26, 'tauceti'); },
                Nano_Tube(offset){ return spaceCostMultiplier('womling_station', offset, 909000, 1.26, 'tauceti'); },
            },
            powered(){ return powerCostMod(global.tech['isolation'] ? 3 : 6); },
            effect(){
                let prod = global.tech['isolation'] ? 30 : 8;
                if (global.tech['womling_gene']){
                    prod *= 1.25;
                }
                let desc = `<div>${loc('production',[prod,tauCetiModules.tau_gas.info.name()])}</div>`;
                if (!global.race['flier']){
                    desc = desc + `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_cement_worker`)])}</div>`;
                }
                desc = desc + `<div>${loc('space_red_fabrication_effect1',[jobScale(1)])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.civic.craftsman.display = true; // Unlikely but possible to unlock this way in Lone Survivor
                    incrementStruct('womling_station','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['womling_station','tauceti']
                };
            },
        },
    },
    tau_roid: {
        info: {
            name(){
                return loc('tau_roid_title');
            },
            desc(){
                return loc('tau_roid_desc');
            },
            nav(){ return global.tech['resettle'] ? true : false; },
            support: 'patrol_ship',
        },
        roid_mission: {
            id: 'tauceti-roid_mission',
            title(){
                return loc('space_mission_title',[loc('tau_roid_title')]);
            },
            desc(){
                return loc('space_mission_desc',[loc('tau_roid_title')]);
            },
            reqs: { tauceti: 5 },
            grant: ['tau_roid',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_roid >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +int_fuel_adjust(1250000,false,wiki).toFixed(0); },
            },
            effect(){
                return loc('tau_roid_mission_effect',[loc('tau_roid_title')]);
            },
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('tau_roid_mission_result'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        patrol_ship: {
            id: 'tauceti-patrol_ship',
            title(){ return loc('tau_roid_patrol_ship'); },
            desc(){ return `<div>${loc('tau_roid_patrol_ship')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Helium_3.name])}</div>`; },
            type: 'ship',
            reqs: { tau_roid: 3 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('patrol_ship', offset, 45000000, 1.25, 'tauceti'); },
                Adamantite(offset){ return spaceCostMultiplier('patrol_ship', offset, 1800000, 1.25, 'tauceti'); },
                Elerium(offset){ return spaceCostMultiplier('patrol_ship', offset, 520, 1.25, 'tauceti'); },
                Stanene(offset){ return spaceCostMultiplier('patrol_ship', offset, 2675000, 1.25, 'tauceti'); },
                Bolognium(offset){ return spaceCostMultiplier('patrol_ship', offset, 1150000, 1.25, 'tauceti'); },
            },
            effect(){
                let fuel = +int_fuel_adjust($(this)[0].support_fuel().a).toFixed(1);
                let desc = `<div>${loc('tau_roid_patrol_ship_security',[$(this)[0].support()])}</div>`;
                desc = desc + `<div>${loc('tau_roid_patrol_ship_effect')}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[$(this)[0].support_fuel().r].name])}</div>`;
                return desc;
            },
            support_fuel(){ return { r: 'Helium_3', a: global.tech['isolation'] ? 15 : 250 }; },
            support(){ return global.tech['m_ignite'] && global.tech.m_ignite >= 4 ? 2 : 1; },
            powered(){ return 0; },
            refresh: true,
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('patrol_ship','tauceti');
                    global.tauceti.patrol_ship.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['patrol_ship','tauceti']
                };
            }
        },
        mining_ship: {
            id: 'tauceti-mining_ship',
            title(){ return loc('tau_roid_mining_ship'); },
            desc(){ return `<div>${loc('tau_roid_mining_ship')}</div>`; },
            type: 'ship',
            reqs: { tau_roid: 4 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('mining_ship', offset, 28000000, 1.28, 'tauceti'); },
                Uranium(offset){ return spaceCostMultiplier('mining_ship', offset, 12500, 1.28, 'tauceti'); },
                Titanium(offset){ return spaceCostMultiplier('mining_ship', offset, 2200000, 1.28, 'tauceti'); },
                Alloy(offset){ return spaceCostMultiplier('mining_ship', offset, 1750000, 1.28, 'tauceti'); },
            },
            effect(){
                let fuel = +int_fuel_adjust($(this)[0].support_fuel().a).toFixed(1);
                let mine = +(production('mining_ship')).toFixed(2);
                let desc = `<div>${loc('tau_roid_mining_ship_effect',[mine])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[$(this)[0].support_fuel().r].name])}</div>`;
                return desc;
            },
            s_type: 'tau_roid',
            support_fuel(){ return { r: 'Helium_3', a: global.tech['isolation'] ? 12 : 75 }; },
            support(){ return -1; },
            powered(){ return 0; },
            special: true,
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('mining_ship','tauceti');
                    powerOnNewStruct($(this)[0]);
                    if (global.tauceti.mining_ship.count === 1){
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, common: 50, uncommon: 50, rare: 50 },
                    p: ['mining_ship','tauceti']
                };
            }
        },
        whaling_ship: {
            id: 'tauceti-whaling_ship',
            title(){ return loc('tau_roid_whaling_ship'); },
            desc(){ return `<div>${loc('tau_roid_whaling_ship')}</div>`; },
            type: 'ship',
            reqs: { tau_whale: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('whaling_ship', offset, 35000000, 1.28, 'tauceti'); },
                Aluminium(offset){ return spaceCostMultiplier('whaling_ship', offset, 3400000, 1.28, 'tauceti'); },
                Neutronium(offset){ return spaceCostMultiplier('whaling_ship', offset, 168000, 1.28, 'tauceti'); },
                Nano_Tube(offset){ return spaceCostMultiplier('whaling_ship', offset, 800000, 1.28, 'tauceti'); },
            },
            effect(){
                let fuel = +int_fuel_adjust($(this)[0].support_fuel().a).toFixed(1);
                let mine = +(production('whaling_ship')).toFixed(2);
                let desc = `<div>${loc('tau_roid_whaling_ship_effect',[mine])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[$(this)[0].support_fuel().r].name])}</div>`;
                return desc;
            },
            s_type: 'tau_roid',
            support_fuel(){ return { r: 'Helium_3', a: global.tech['isolation'] ? 14 : 90 }; },
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('whaling_ship','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['whaling_ship','tauceti']
                };
            }
        },
        synthesizer: {
            id: 'tauceti-synthesizer',
            title(){ return loc('tau_roid_synthesizer_title'); },
            desc(){
                return `<div>${loc('tau_roid_synthesizer_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'industry',
            reqs: { tau_roid: 4, m_ignite: 3 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('synthesizer', offset, 90000000, 1.26, 'tauceti'); },
                Adamantite(offset){ return spaceCostMultiplier('synthesizer', offset, 2500000, 1.26, 'tauceti'); },
                Graphene(offset){ return spaceCostMultiplier('synthesizer', offset, 2000000, 1.26, 'tauceti'); },
                Elerium(offset){ return spaceCostMultiplier('synthesizer', offset, 1250, 1.26, 'tauceti'); },
                Unobtainium(offset){ return spaceCostMultiplier('synthesizer', offset, 72000, 1.26, 'tauceti'); },
            },
            support(){ return -1; },
            powered(){ return powerCostMod(10); },
            effect(){
                let pos = +(production('synthesizer')).toFixed(4);
                let desc = `<div>${loc('tau_roid_synthesizer_effect',[pos,global.resource.Positronium.name,tauCetiModules.tau_roid.mining_ship.title()])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('synthesizer','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['synthesizer','tauceti']
                };
            }
        },
    },
    tau_gas2: {
        info: {
            name(n){
                return tauCetiModules.tau_gas.info.name(n || global.race['gas_name2'] || false, 'gas_name2');
            },
            desc(){
                return loc('tau_gas2_desc',[tauCetiModules.tau_gas.info.name()]);
            },
            nav(){ return global.tech['resettle'] ? true : false; }
        },
        gas_contest2: {
            id: 'tauceti-gas_contest2',
            title(){ return loc('tau_gas2_contest_title'); },
            desc(){ return loc('tau_gas2_contest_title'); },
            reqs: { tau_gas2: 1 },
            grant: ['tau_gas2',2],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_gas2 >= 1 ? 0 : 1; },
            cost: {
                Money(){ return 25000000; }
            },
            effect(){ return loc('tau_gas2_contest_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    return true;
                }
                return false;
            },
            flair(){ return loc('tau_gas2_contest_flair'); }
        },
        alien_station_survey: {
            id: 'tauceti-alien_station_survey',
            title(){ return loc('tau_gas2_alien_station'); },
            desc(){ return loc('tau_gas2_alien_station'); },
            reqs: { tau_gas2: 3 },
            grant: ['tau_gas2',4],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_gas3 >= 4 ? 0 : 1; },
            cost: {
                Money(){ return global.race['lone_survivor'] ? 1500000000 : 3000000000; },
                Helium_3(){ return 5000000; }
            },
            effect(){ return loc('tau_gas2_alien_station_repair_effect',[tauCetiModules.tau_gas2.info.name()]); },
            action(){
                if (payCosts($(this)[0])){
                    initStruct(tauCetiModules.tau_gas2.alien_station);
                    messageQueue(loc('tau_gas2_alien_station_msg',[tauCetiModules.tau_gas2.info.name()]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        alien_station: {
            id: 'tauceti-alien_station',
            title(){ return loc('tau_gas2_alien_station'); },
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('alien_station') || global.tauceti.alien_station.count < 100 || wiki){
                    return `<div>${loc('tau_gas2_alien_station')}</div>` + (global.tauceti.hasOwnProperty('alien_station') && global.tauceti.alien_station.count >= 100 ? `<div class="has-text-special">${loc('space_dwarf_reactor_desc_req')}</div>` : `<div class="has-text-special">${loc('tau_gas2_alien_station_repair')}</div>`);
                }
                else {
                    return `<div>${loc('tau_gas2_alien_station')}</div>`;
                }
            },
            type: 'outpost',
            reqs: { tau_gas2: 4 },
            condition(){ return global.tauceti.alien_station.count < 100 ? true : false; },
            path: ['truepath'],
            queue_size: 5,
            queue_complete(){ return 100 - global.tauceti.alien_station.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('alien_station') ? global.tauceti.alien_station.count : 0)) < 100 ? (global.race['lone_survivor'] ? 12000000 : 50000000) : 0; },
                Aluminium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('alien_station') ? global.tauceti.alien_station.count : 0)) < 100 ? (global.race['lone_survivor'] ? 256000 : 2560000) : 0; },
                Polymer(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('alien_station') ? global.tauceti.alien_station.count : 0)) < 100 ? (global.race['lone_survivor'] ? 198900 : 989000) : 0; },
                Mythril(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('alien_station') ? global.tauceti.alien_station.count : 0)) < 100 ? wom_recycle(125000) : 0; },
                Cipher(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('alien_station') ? global.tauceti.alien_station.count : 0)) < 100 ? (global.race['lone_survivor'] ? 256 : 2001) : 0; },
            },
            effect(wiki){
                let effectText = '';
                let count = (wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('alien_station') ? global.tauceti.alien_station.count : 0);
                if (count < 100){
                    effectText += `<div class="has-text-special">${loc('tau_gas2_alien_station_repaired',[count])}</div>`;
                    return effectText;
                }
                else {
                    return tauCetiModules.tau_gas2.alien_space_station.effect(wiki);
                }
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.tauceti.alien_station.count < 100){
                        incrementStruct('alien_station','tauceti');
                        if (global.tauceti.alien_station.count >= 100){
                            global.tech.tau_gas2 = 5;
                            global.tauceti['alien_space_station'] = { count: 1, on: 0 };
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
                    p: ['alien_station','tauceti']
                };
            },
            post(){
                if (global.tauceti.hasOwnProperty('alien_space_station')){
                    if (global.resource.Elerium.diff >= 10){
                        global.tauceti.alien_space_station.on = 1;
                    }
                    renderTauCeti();
                }
            }
        },
        alien_space_station: {
            id: 'tauceti-alien_space_station',
            title(){ return loc('tau_gas2_alien_station'); },
            desc(){
                return `<div>${loc('tau_gas2_alien_station')}</div><div class="has-text-special">${loc('space_dwarf_reactor_desc_req')}</div>`;
            },
            reqs: { tau_gas2: 5 },
            path: ['truepath'],
            cost: {},
            queue_complete(){ return 0; },
            special(){ return global.tech['tau_gas2'] && global.tech.tau_gas2 === 6 && (!global.tech['alien_data'] || global.tech.alien_data < 6) ? true : false; },
            wiki: false,
            effect(){
                let fuel = $(this)[0].p_fuel().a;
                let desc = `<div>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered())])}</div>`;
                if (global.tech['tau_gas2'] && global.tech.tau_gas2 >= 6 && global.tauceti.alien_space_station.hasOwnProperty('decrypted')){
                    let devisor = global.race['lone_survivor'] ? 100000 : 25000000;
                    let decrypted = +(global.tauceti.alien_space_station.decrypted / devisor).toFixed(2);
                    if (decrypted > 100){ decrypted = 100; }
                    desc = desc + `<div>${loc('tau_gas2_alien_station_effect',[decrypted])}</div>`;
                }
                desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
                if (global.tech['m_ignite'] && global.tech.m_ignite >= 2){
                    desc = desc + `<div>${loc('tau_gas2_ignite_gas_giant_effect3')}</div>`;
                    desc += retireProjection();
                }
                return desc;
            },
            p_fuel(){ return { r: 'Elerium', a: ( (global.tech['m_ignite'] && global.tech.m_ignite >= 2) || global.race['lone_survivor'] ? 1 : 10) }; },
            powered(){ return powerModifier(-75); },
            action(){
                if (global.tech['m_ignite'] && global.tech.m_ignite >= 2){
                    retirement();
                    return true;
                }
                return false;
            }
        },
        matrioshka_brain: {
            id: 'tauceti-matrioshka_brain',
            title(){ return loc('tech_matrioshka_brain'); },
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('matrioshka_brain') || global.tauceti.matrioshka_brain.count < 1000 || wiki){
                    return `<div>${loc('tech_matrioshka_brain')}</div><div class="has-text-special">${loc('requires_segments',[1000])}</div>`;
                }
                else {
                    return `<div>${loc('tech_matrioshka_brain')}</div>`;
                }
            },
            type: 'megaproject',
            reqs: { tau_gas2: 7 },
            condition(){ return global.tauceti['matrioshka_brain'] ? true : false; },
            path: ['truepath'],
            queue_size: 50,
            queue_complete(){ return 1000 - global.tauceti.matrioshka_brain.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? 20000000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? 45000 : 0; },
                Nano_Tube(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? 160000 : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? 666000 : 0; },
                Stanene(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? 61600 : 0; },
                Bolognium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? 44000 : 0; },
                Unobtainium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? 1200 : 0; },
                Mythril(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? wom_recycle(64000) : 0; },
            },
            effect(wiki){
                let effectText = '';
                let count = (wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0);
                if (count < 1000){
                    effectText += `<div class="has-text-special">${loc('tau_gas2_matrioshka_brain_seg',[1000 - count])}</div>`;
                }
                else if (global.tech['m_ignite'] && global.tech.m_ignite >= 2){
                    let boost = 50;
                    effectText += `<div>${loc('plus_max_resource',[boost+'%',global.resource.Knowledge.name])}</div>`;
                    if (global.resource.Positronium.display){
                        let store = Math.floor(global.resource.Knowledge.max / 1000);
                        effectText += `<div>${loc('plus_max_resource',[store.toLocaleString(),global.resource.Positronium.name])}</div>`;
                    }
                }
                return effectText;
            },
            aura(){ return global.tech['m_ignite'] && global.tech.m_ignite >= 2 ? 'ignite' : false; },
            action(){
                if (payCosts($(this)[0])){
                    if (global.tauceti.matrioshka_brain.count < 1000){
                        incrementStruct('matrioshka_brain','tauceti');
                        if (global.tauceti.matrioshka_brain.count >= 1000){
                            global.tech['m_brain'] = 1;
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['matrioshka_brain','tauceti']
                };
            },
        },
        ignition_device: {
            id: 'tauceti-ignition_device',
            title(){ return loc('tech_ignition_device'); },
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('ignition_device') || global.tauceti.ignition_device.count < 10 || wiki){
                    return `<div>${loc('tech_ignition_device')}</div><div class="has-text-special">${loc('requires_segments',[10])}</div>`;
                }
                else {
                    return `<div>${loc('tech_ignition_device')}</div>`;
                }
            },
            type: 'megaproject',
            reqs: { tau_gas2: 8 },
            condition(){ return global.tauceti['ignition_device'] && global.tauceti.ignition_device.count < 10 ? true : false; },
            path: ['truepath'],
            queue_size: 1,
            queue_complete(){ return 10 - global.tauceti.ignition_device.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0)) < 10 ? 250000000 : 0; },
                Uranium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0)) < 10 ? 50000 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0)) < 10 ? 25000 : 0; },
                Graphene(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0)) < 10 ? 22500000 : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0)) < 10 ? 15000000 : 0; },
                Quantium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0)) < 10 ? wom_recycle(8000000) : 0; },
            },
            effect(wiki){
                let effectText = '';
                let count = (wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0);
                if (count < 10){
                    effectText += `<div class="has-text-special">${loc('tau_gas2_ignition_device_seg',[10 - count])}</div>`;
                }
                return effectText;
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.tauceti.ignition_device.count < 10){
                        incrementStruct('ignition_device','tauceti');
                        if (global.tauceti.ignition_device.count >= 10){
                            global.tech['m_ignite'] = 1;
                            renderTauCeti();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['ignition_device','tauceti']
                };
            },
        },
        ignite_gas_giant: {
            id: 'tauceti-ignite_gas_giant',
            title(){return loc('tau_gas2_ignite_gas_giant',[tauCetiModules.tau_gas2.info.name()]); },
            desc(){return loc('tau_gas2_ignite_gas_giant',[tauCetiModules.tau_gas2.info.name()]); },
            reqs: { tau_gas2: 8, m_ignite: 1 },
            grant: ['m_ignite',2],
            condition(){ return global.tech['m_ignite'] && global.tech.m_ignite >= 2 ? false : true; },
            queue_size: 1,
            queue_complete(){ return false; },
            path: ['truepath'],
            cost: {
                Helium_3(){ return 7500000; },
            },
            effect(){
                let desc = `<div>${loc('tau_gas2_ignite_gas_giant_effect',[loc('tech_matrioshka_brain')])}</div>`;
                if (!global.tech['m_brain']){
                    desc = desc + `<div class="has-text-warning">${loc('tau_gas2_ignite_gas_giant_effect2',[loc('tech_matrioshka_brain')])}</div>`;
                }
                return desc;
            },
            action(){
                if (global.tech['m_brain'] && payCosts($(this)[0])){
                    return true;
                }
                return false;
            }
        },
        adv_shipyard: {
            id: 'tauceti-adv_shipyard',
            title(){ return loc('tau_shipyard_title'); },
            desc(){
                return `<div>${loc('tau_shipyard_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'outpost',
            reqs: { resettle: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('adv_shipyard') ? global.tauceti.adv_shipyard.count : 0)) < 1 ? 1000000000 : 0; },
                Aluminium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('adv_shipyard') ? global.tauceti.adv_shipyard.count : 0)) < 1 ? 135000000 : 0; },
                Titanium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('adv_shipyard') ? global.tauceti.adv_shipyard.count : 0)) < 1 ? 85000000 : 0; },
                Iridium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('adv_shipyard') ? global.tauceti.adv_shipyard.count : 0)) < 1 ? 125000000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('adv_shipyard') ? global.tauceti.adv_shipyard.count : 0)) < 1 ? 2500000 : 0; },
                Unobtainium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('adv_shipyard') ? global.tauceti.adv_shipyard.count : 0)) < 1 ? 5000000 : 0; },
            },
            queue_complete(){ return 1 - global.tauceti.adv_shipyard.count; },
            effect(){
                return `<div>${loc('outer_shipyard_effect')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(50); },
            special: true,
            sAction(){
                if (p_on['adv_shipyard']){
                    global.settings.civTabs = 2;
                    global.settings.govTabs = 5;
                    if (!global.settings.tabLoad){
                        loadTab('mTabCivic');
                        clearPopper(`tauceti-shipyard`);
                    }
                }
            },
            action(args){
                if (global.tauceti.adv_shipyard.count < 1 && payCosts($(this)[0])){
                    incrementStruct('adv_shipyard','tauceti');
                    if (powerOnNewStruct($(this)[0])){
                        global.settings.showShipYard = true;
                    }
                    drawShipYard();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['adv_shipyard','tauceti']
                };
            }
        },
        mass_relay: {
            id: 'tauceti-mass_relay',
            title(){ return loc('space_dwarf_mass_relay_title'); },
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('mass_relay') || global.tauceti.mass_relay.count < 100 || wiki){
                    return `<div>${loc('space_dwarf_mass_relay_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
            },
            type: 'megaproject',
            reqs: { m_ignite: 3 },
            path: ['truepath'],
            condition(){
                return global.tauceti.mass_relay.count < 100 ? true : false;
            },
            queue_size: 5,
            queue_complete(){ return 100 - global.tauceti.mass_relay.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('mass_relay') ? global.tauceti.mass_relay.count : 0)) < 100 ? 85000000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('mass_relay') ? global.tauceti.mass_relay.count : 0)) < 100 ? 75000 : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('mass_relay') ? global.tauceti.mass_relay.count : 0)) < 100 ? 180000 : 0; },
                Positronium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('mass_relay') ? global.tauceti.mass_relay.count : 0)) < 100 ? 250 : 0; },
                Stanene(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('mass_relay') ? global.tauceti.mass_relay.count : 0)) < 100 ? 1000000 : 0; },
                Quantium(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('mass_relay') ? global.tauceti.mass_relay.count : 0)) < 100 ? 250000 : 0; },
            },
            effect(wiki){
                let count = ((wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('mass_relay') ? global.tauceti.mass_relay.count : 0));
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('space_dwarf_mass_relay_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return tauCetiModules.tau_gas2.tcm_relay.effect();
                }
            },
            action(args){
                if (global.tauceti.mass_relay.count < 100 && payCosts($(this)[0])){
                    global.tauceti.mass_relay.count++;
                    if (global.tauceti.mass_relay.count >= 100){
                        global.tech['m_ignite'] = 4;
                        initStruct(tauCetiModules.tau_gas2.tcm_relay);
                        incrementStruct('tcm_relay','tauceti');
                        powerOnNewStruct(tauCetiModules.tau_gas2.tcm_relay);
                        drawTech();
                        renderTauCeti();
                        clearPopper();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['mass_relay','tauceti']
                };
            }
        },
        tcm_relay: {
            id: 'tauceti-tcm_relay',
            title(){ return loc('space_dwarf_mass_relay_title'); },
            desc(){
                return `<div>${loc('space_dwarf_mass_relay_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'megaproject',
            reqs: { m_ignite: 4 },
            path: ['truepath'],
            condition(){
                return global.tauceti.mass_relay.count >= 100 ? true : false;
            },
            wiki: false,
            queue_complete(){ return 0; },
            cost: {},
            powered(){
                return powerCostMod(50);
            },
            effect(){
                let charge = Math.floor(global.tauceti.tcm_relay.charged / 10) / 10;
                return `<div>${loc('space_dwarf_mass_relay_effect2',[loc('tab_tauceti')])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div><div>${loc('space_dwarf_mass_relay_charged',[charge])}</div>`;
            },
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, charged: 0 },
                    p: ['tcm_relay','tauceti']
                };
            }
        },
    },
};

for (let i=1; i<9; i++){
    tauCetiModules.tau_gas[`gas_contest-a${i}`] = {
        id: `tauceti-gas_contest-a${i}`,
        title(){ return tauCetiModules.tau_gas.info.name(i); },
        desc(){ return tauCetiModules.tau_gas.info.name(i); },
        reqs: { tau_gas: 1 },
        grant: ['tau_gas',2],
        path: ['truepath'],
        wiki: false,
        queue_complete(){ return global.tech.tau_gas >= 2 ? 0 : 1; },
        cost: {},
        effect(){ return loc(i === 8 ? 'tau_gas_contest_reject' : 'tau_gas_contest_pick',[tauCetiModules.tau_gas.info.name(i)]); },
        action(){
            if (payCosts($(this)[0])){
                global.race['gas_name'] = i;
                initStruct(tauCetiModules.tau_gas.refueling_station);
                return true;
            }
            return false;
        }
    };
    tauCetiModules.tau_gas2[`gas_contest-b${i}`] = {
        id: `tauceti-gas_contest-b${i}`,
        title(){ return tauCetiModules.tau_gas2.info.name(i); },
        desc(){ return tauCetiModules.tau_gas2.info.name(i); },
        reqs: { tau_gas2: 2 },
        grant: ['tau_gas2',3],
        path: ['truepath'],
        wiki: false,
        queue_complete(){ return global.tech.tau_gas2 >= 3 ? 0 : 1; },
        cost: {},
        effect(){ return loc(i === 8 ? 'tau_gas2_contest_reject' : 'tau_gas_contest_pick',[tauCetiModules.tau_gas2.info.name(i)]); },
        action(){
            if (payCosts($(this)[0])){
                global.race['gas_name2'] = i;
                return true;
            }
            return false;
        }
    }; 
}

function matrixProjection(){
    let gains = calcPrestige('matrix');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    let skilled = global.stats.retire === global.stats.matrix + 1 ? `<div class="has-text-advanced">${loc('tau_star_matrix_skilled',[1])}</div>` : ``;
    return `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.phage,loc('resource_Phage_name')])}</div><div class="has-text-advanced">${loc('tau_star_matrix_servants',[1])}</div>${skilled}`;
}

function retireProjection(){
    let gains = calcPrestige('retired');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    let skilled = global.stats.retire + 1 === global.stats.matrix ? `<div class="has-text-advanced">${loc('tau_star_matrix_skilled',[1])}</div>` : ``;
    return `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.phage,loc('resource_Phage_name')])}</div><div class="has-text-advanced">${loc('tau_star_matrix_servants',[1])}</div>${skilled}`;
}

function edenProjection(){
    let gains = calcPrestige('eden');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    return `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.phage,loc('resource_Phage_name')])}</div><div class="has-text-advanced">${loc('tau_star_matrix_servants',[1])}</div>`;
}

function defineWomlings(){
    initStruct(tauCetiModules.tau_red.overseer);
    initStruct(tauCetiModules.tau_red.womling_village);
    initStruct(tauCetiModules.tau_red.womling_mine);
    initStruct(tauCetiModules.tau_red.womling_fun);
    initStruct(tauCetiModules.tau_red.womling_farm);
    if (global.race['lone_survivor']){
        global.tauceti.womling_village.count = 2;
        global.tauceti.womling_village.on = 2;
        global.tauceti.womling_mine.count = 1;
        global.tauceti.womling_mine.on = 1;
    }
}

function wom_repulse(v){
    if (global.tech['womling_tech'] && global.tech['womling_logistics'] && global.tech.womling_logistics >= 2){
        v *= 0.94 ** global.tech.womling_tech;
    }
    return v;
}

function wom_recycle(v){
    if (global.tech['womling_tech'] && global.tech['womling_recycling'] && global.tech.womling_recycling >= 1){
        v *= (global.tech['isolation'] ? 0.97 : 0.98) ** global.tech.womling_tech;
    }
    return v;
}

export function outerTruthTech(){
    return outerTruth;
}

export function tauCetiTech(){
    return tauCetiModules;
}

// Womlings one village houses. Read by the game loop as well as the village's own effect text, so it
// lives in one place rather than being restated in both.
export function womlingVillagePop(){
    if (global.tech['womling_pop']){
        if (global.tech.womling_pop >= 3){ return 8; }
        if (global.tech.womling_pop >= 2){ return 6; }
    }
    return 5;
}

// Womlings one farm can feed. Two farmers work a farm, so the loop halves this to get the per-farmer
// figure it caps the population with.
export function womlingFarmFood(){
    let food = global.tech['womling_pop'] && global.tech.womling_pop >= 3 ? 20 : (global.tech['womling_pop'] ? 16 : 12);
    if (global.tech['womling_gene']){ food += 4; }
    return food;
}

// Womlings one craftworks puts to work as artisans.
export const womlingArtisansPer = () => 5;

// Womlings currently working the artisan job. Each one lends a skilled pair of hands to your own
// crafters and adds a percent to everything crafted, so the loop and the UI both read this.
export function womlingArtisans(){
    return global.tauceti && global.tauceti.hasOwnProperty('womling_craftworks') ? (global.tauceti.womling_craftworks.artisan || 0) : 0;
}

export function tauEnabled(){
    if (global.tech['tauceti'] && global.tech.tauceti >= 4){
        return true;
    }
    return false;
}

export function checkPathRequirements(era,region,action){
    switch (era){
        case 'tauceti':
            return checkRequirements(tauCetiModules,region,action);
    }
}

// Structures the horde can raze, per infested region. A candidate MUST have a struct() definition on its
// action — that is what creates the global[category][key] record holding the count/razed pair razing
// works on — so anything without one is never a target. The remainder of the list is curated: orbital
// structures (satellites, GPS, nav beacons, orbital stations/platforms) are out of reach of a ground
// horde, and multi-segment megaprojects plus the powered "completed" forms they unlock (world_collider /
// world_controller, mass_relay / m_relay, ai_core / ai_core2, jump_gate) are excluded so razing can never
// unwind a finished project. `c` is the global category the structs live under.
// spc_home is deliberately absent: Earth is a special location that never fights (see trackInfestation).
const razeTargets = {
    spc_moon: { c: 'space', s: ['moon_base','iridium_mine','helium_mine','observatory'] },
    spc_red: { c: 'space', s: ['spaceport','red_tower','living_quarters','pylon','vr_center','garage','red_mine','fabrication','red_factory','biodome','exotic_lab','ziggurat','space_barracks'] },
    spc_venus: { c: 'space', s: [] },
    spc_hell: { c: 'space', s: ['geothermal','hell_smelter','spc_casino','swarm_plant'] },
    spc_titan: { c: 'space', s: ['titan_spaceport','electrolysis','hydrogen_plant','titan_quarters','titan_mine','storehouse','titan_bank','g_factory','sam','decoder','ai_colonist','metalworks'] },
    spc_enceladus: { c: 'space', s: ['water_freighter','zero_g_lab','operating_base','munitions_depot'] },
    spc_dwarf: { c: 'space', s: ['elerium_contain','e_reactor'] },
    tau_home: { c: 'tauceti', s: ['colony','tau_housing','pylon','tau_farm','mining_pit','fusion_generator','repository','tau_factory','infectious_disease_lab','tauceti_casino','tau_cultural_center','marine_barracks','data_decoder'] },
    tau_red: { c: 'tauceti', s: ['overseer','womling_village','womling_farm','womling_mine','womling_fun','womling_lab','womling_craftworks','antimatter_reactor','womling_rangers'] }
};

// Ships shoot the horde from orbit, but bombardment is a blunt instrument against a scattered mob —
// their firepower counts for a fraction of what the same fight is worth with boots on the ground.
const orbitalStrikeRate = 0.05;
// Survivors razed per day: one structure guaranteed per this many zombies still active, with the
// remainder rolled as a fractional chance, and never more than razeCap in a single day.
const zombiesPerRazing = 100000;
const razeCap = 5;
// Hordes that lie low: absent from the UI and unengaged until something gives them away. On spc_red
// that is the first structure it razes; on spc_titan it is putting support back into orbit there and
// getting a proper look at the surface (see zTitanWatch).
const hiddenInfestation = ['spc_red','spc_titan'];
// Special cases that sit outside the system entirely: never fought, never counted on screen. Earth's
// billions are a fact of the setting rather than something a fleet can work on.
const inertInfestation = ['spc_home'];

// The war's day-to-day traffic — hulls engaging, raiders going down, landings, buildings lost. It runs
// every game day on every front at once, so it is the one thing worth being able to turn off. Anything
// that moves the arc forward calls messageQueue directly instead and is announced either way.
function zMessage(msg,type){
    if (fleetCmd()['zquiet']){ return; }
    messageQueue(msg,type,false,['combat']);
}

// True once a region's horde is known about, which for everywhere but hiddenInfestation is immediately.
function infestationFound(region){
    return !hiddenInfestation.includes(region) || (global.race['zfound'] ? global.race.zfound[region] : false);
}

// Zombies to display for a region, or 0 when there is nothing to show (empty, or still undiscovered).
export function infestationCount(region){
    if (!global.race['zhorde'] || !global.race.zhorde[region] || inertInfestation.includes(region) || !infestationFound(region)){
        return 0;
    }
    return global.race.zhorde[region];
}

// The infestation readout that renders alongside a region's support line. Returns markup only when the
// region currently has a visible horde; the v-show then hides it again if the horde is wiped out.
export function infestationLabel(region){
    if (infestationCount(region) <= 0){ return ``; }
    return ` <span class="infestation has-text-caution" v-show="zombies()">${loc('space_infestation')} <span class="has-text-danger">{{ zombieCount() }}</span></span>`;
}

export function infestationMethods(region){
    return {
        zombies(){ return infestationCount(region); },
        // Exact mode: the count ticks down a little every day, and rounding it to "40K" would hide that.
        zombieCount(){ return sizeApproximation(infestationCount(region),1,false,true); }
    };
}

export function trackInfestation(){
    if (!global.race['zhorde']){
        global.race['zhorde'] = {
            spc_home: 9000000000, // Earth
            spc_moon: 0, // Moon
            spc_red: 40000, // Mars
            spc_venus: 0, // Venus
            spc_hell: 0, // Mercury
            spc_titan: 25000, // Titan (Saturn)
            spc_enceladus: 0, // Enceladus (Saturn)
            spc_dwarf: 0, // Ceres
            tau_home: 0, // Tau Ceti Homeworld
            tau_red: 0 // Tau Ceti Womling World
        };
    }

    Object.keys(global.race.zhorde).forEach(function(region){
        if (!inertInfestation.includes(region) && global.race.zhorde[region] > 0){
            infestationCombat(region);
        }
    });

    zTitanWatch();
    zFleetDay();
    if (fleetCmdUnlocked()){ fleetCmdDay(); }
}

// Regions the resettlement arc keeps off the board until Titan is properly reoccupied. Until then their
// hordes are unknown and their ruins are not yours to worry about.
const titanRegions = ['spc_titan','spc_enceladus'];

// True once Titan has been reoccupied far enough to see what is down there.
export function titanReclaimed(){
    return global.tech['resettle'] && global.tech.resettle >= 13 ? true : false;
}

// Titan's support grid, whatever survived the razing. This is the baseline the reveal measures against.
function titanSupportMax(){
    return global.space['electrolysis'] && global.space.electrolysis['s_max'] > 0 ? global.space.electrolysis.s_max : 0;
}

// Titan's horde keeps its head down until you put more support back over it than the wreck you
// inherited. Whatever plants came through the razing do not count — it takes a fresh one running
// before you get a proper look at the surface, and before Titan joins the horde's own target list.
function zTitanWatch(){
    if (titanReclaimed()){ return; }
    // Ordered behind the outer distress signals, so the stages cannot be leapfrogged.
    if (!global.tech['resettle'] || global.tech.resettle < 12){ return; }
    // Saves that reached the beacons before this existed get their baseline on the next day.
    if (!(titanSupportMax() > 0)){ return; }

    global.tech['resettle'] = 13;
    if (!global.race['zfound']){ global.race['zfound'] = {}; }
    global.race.zfound['spc_titan'] = true;
    messageQueue(loc('zfleet_titan_found',[regionName('spc_titan')]),'danger',false,['combat','progress']);
    renderSpace();
}

// --- Infested fleet -----------------------------------------------------------------------------
// Once Mars is cleared the horde on Earth stops waiting to be visited and starts sending hulls of its
// own. Ships lift from spc_home, cross to a colony and are gone on arrival, leaving their cargo of
// infected behind as a new horde. Launches are rare and small at first and grow on both counts the
// longer the campaign runs.

// Where the infested can reach. spc_red and spc_hell are open from the start; the rest unlock as the
// player pushes outward and the horde follows.
function zFleetTargets(){
    let targets = ['spc_red','spc_hell'];
    if (global.tech['luna'] && global.tech.luna >= 3){ targets.push('spc_moon'); }
    // Titan only becomes worth raiding once you are established enough there to have found what was
    // already on it (see zTitanWatch).
    if (global.tech['resettle'] && global.tech.resettle >= 13){ targets.push('spc_titan'); }
    return targets;
}

// Hulls the horde flies, smallest first. `weight` is how often a class comes up relative to the others
// once it is cleared to fly; the two heavy hulls turn up half as often as the four it builds routinely.
// Called at every roll like avail and horde, so a rate can be moved on tech or horde size later.
const zFleetHulls = {
    corvette:      { weight(){ return 1; },   avail(){ return true; },  horde(){ return 350; } },
    frigate:       { weight(){ return 1; },   avail(){ return true; },  horde(){ return 825; } },
    destroyer:     { weight(){ return 1; },   avail(){ return global.tech['resettle'] && global.tech.resettle >= 11 ? true : false; }, horde(){ return 1700; } },
    cruiser:       { weight(){ return 1; },   avail(){ return global.tech['resettle'] && global.tech.resettle >= 14 ? true : false; }, horde(){ return 4100; } },
    battlecruiser: { weight(){ return 0.5; }, avail(){ return global.tech['resettle'] && global.tech.resettle >= 15 ? true : false; }, horde(){ return 10300; } },
    dreadnought:   { weight(){ return 0.5; }, avail(){ return false; }, horde(){ return 24750; } }
};

// The classes cleared to fly right now.
function zFleetClasses(){
    return Object.keys(zFleetHulls).filter(function(cls){
        let avail = zFleetHulls[cls].avail;
        return typeof avail === 'function' ? avail() : avail ? true : false;
    });
}

// How often a class comes up, read the same way avail is: a function is called, anything else is taken
// as the rate itself, and a class that names no rate is drawn as often as an ordinary hull.
function zFleetWeight(cls){
    let weight = zFleetHulls[cls].weight;
    if (typeof weight === 'function'){ weight = weight(); }
    return weight === undefined ? 1 : weight;
}

// One class drawn from those cleared to fly, by weight rather than evenly. Each hull of a sortie is
// rolled on its own, so a pair can still come up two heavy.
function zFleetClass(avail){
    let total = avail.reduce((sum,cls) => sum + zFleetWeight(cls),0);
    if (!(total > 0)){ return avail[Math.floor(seededRandom(0,avail.length,true))]; }
    let roll = seededRandom(0,total,true);
    for (let cls of avail){
        roll -= zFleetWeight(cls);
        if (roll < 0){ return cls; }
    }
    return avail[avail.length - 1];
}

// Zombie ships are constructed with legacy tech only
const zFleetParts = {
    power: ['solar','diesel','fission','fusion','elerium'],
    weapon: ['railgun','laser','p_laser','plasma','phaser','disruptor'],
    armor: ['steel','alloy','neutronium'],
    engine: ['ion','tie','pulse','photon','vacuum'],
    sensor: ['visual','radar','lidar','quantum']
};

const zFleetDelayMin = 10;      // game days after the trigger before the first hull can lift
const zFleetDelayMax = 25;
const zFleetRampDays = 150;     // days of raiding before launches and cargoes reach full strength
const zFleetOddsStart = 0.08;   // chance of a launch on the first day
const zFleetOddsEnd = 0.40;     // ...and once the ramp is complete.
const zFleetLoadStart = 0.25;   // share of a hull's cargo that lands on the first day

// The one scripted sortie: days after Titan comes under threat, then where it goes and what flies it.
const zTauStrikeDay = 100;
const zTauStrikeTarget = 'tau_home';
const zTauStrikeHulls = ['cruiser','frigate','frigate'];
// Having managed that once, the horde starts sending some of its ordinary raids out in company.
const zPairOdds = 0.25;
const zPairSize = 2;

// One day of the infested fleet: arm the countdown when the conditions are met, advance anything under
// way, then decide whether another hull lifts.
function zFleetDay(){
    // The whole system belongs to the resettlement arc; nothing here happens on a run that never went
    // back to Sol.
    if (!global.tech['resettle']){ return; }

    if (!global.race['zfleet']){
        // Mercury salvaged and Mars swept clean: the horde on Earth notices, and starts preparing.
        if (global.tech['hell'] && global.tech.hell >= 3 && global.race.zhorde['spc_red'] === 0){
            global.race['zfleet'] = { t: Math.floor(seededRandom(zFleetDelayMin,zFleetDelayMax + 1,true)), d: 0, s: [] };
        }
        return;
    }

    if (global.tech.resettle === 9){
        global.tech.resettle = 10;
    }

    let fleet = global.race.zfleet;
    if (!fleet.s){ fleet.s = []; }

    zFleetMove(fleet);

    // The blockade runs on its own rules rather than act like a raid
    zVenusBlockade(fleet);
    zBlockadeDay(fleet);

    if (fleet.t > 0){
        fleet.t--;
        if (fleet.t === 0){
            messageQueue(loc('zfleet_first_launch',[regionName('spc_home')]),'danger',false,['combat','progress']);
        }
        return;
    }

    fleet.d++;
    zTauStrike(fleet);
    let ramp = Math.min(fleet.d / zFleetRampDays, 1);
    if (seededRandom(0,1,true) < zFleetOddsStart + (zFleetOddsEnd - zFleetOddsStart) * ramp){
        zFleetLaunch(fleet,ramp);
    }

    zGroundFire(fleet);
}

const zGroundFireDay = 50;      // days after the first hull lifts before the surface starts shooting back
const zGroundFireMin = 2;       // hull points an unarmoured ship in orbit loses per day once it does
const zGroundFireMax = 9;
const zGroundFireTargets = 2;   // ships the batteries can track and engage in one day

// Share of a hit each armour lets through. The ratio matches the 8 / 6 / 4 the wear-and-tear roll in
// the main loop already uses, so neutronium plating turns aside half of what steel does wherever the
// damage is coming from.
const shipArmorSoak = { steel: 1, alloy: 0.75, neutronium: 0.5, aerographene: 0.75 };
export function shipArmorFactor(ship){
    return ship && shipArmorSoak.hasOwnProperty(ship.armor) ? shipArmorSoak[ship.armor] : 1;
}

// Aerographene stops as much as alloy while weighing next to nothing, so it is the one plating that
// makes a hull faster instead of slower. Applied to mass rather than to the finished speed so it
// stacks with the class weights and the relay boost the same way every other mass term does.
const AEROGRAPHENE_SPEED = 1.1;
// Exported so the tech that unlocks the plating advertises the same number the ships actually fly at.
export function aerographeneSpeedBonus(){
    return Math.round((AEROGRAPHENE_SPEED - 1) * 100);
}

// Plating is described against steel, which is the zero point for both figures: it soaks a full hit
// and carries no weight penalty. Both numbers are derived rather than written down — the soak from
// the table combat reads, the speed by running shipSpeed twice on the design currently on the
// drawing board. That last part matters: neutronium's weight costs a corvette about 5% and a
// dreadnought about 17%, so any single fixed number would be wrong for most of the fleet.
function armorDesc(armor){
    let desc = loc(`outer_shipyard_armor_${armor}_desc`);
    if (armor === 'steel'){ return `${desc} ${loc(`outer_shipyard_armor_baseline`)}`; }

    let steel = loc(`outer_shipyard_armor_steel`);
    let notes = [];

    let soak = shipArmorSoak.hasOwnProperty(armor) ? shipArmorSoak[armor] : shipArmorSoak.steel;
    let cut = Math.round((1 - soak / shipArmorSoak.steel) * 100);
    if (cut > 0){ notes.push(loc(`outer_shipyard_armor_soak`,[cut,steel])); }

    let bp = global.space.shipyard.blueprint;
    let plain = shipSpeed(Object.assign({},bp,{ armor: 'steel' }));
    let clad = shipSpeed(Object.assign({},bp,{ armor: armor }));
    let delta = Math.round((clad / plain - 1) * 100);
    if (delta !== 0){
        notes.push(loc(delta > 0 ? `outer_shipyard_armor_faster` : `outer_shipyard_armor_slower`,[Math.abs(delta),steel]));
    }

    return notes.length ? `${desc} ${notes.join(' ')}` : desc;
}

// Share of a hit each hull size takes, smallest to largest. A bigger ship spreads the same round over
// more structure, so a round that guts a corvette barely marks a dreadnought. Explorers are not a size
// tier and fall through to taking it in full.
const shipClassSoak = {
    corvette: 1,
    frigate: 0.85,
    destroyer: 0.7,
    cruiser: 0.55,
    battlecruiser: 0.4,
    dreadnought: 0.3
};
export function shipClassFactor(ship){
    return ship && shipClassSoak.hasOwnProperty(ship.class) ? shipClassSoak[ship.class] : 1;
}

// Whatever taught the horde to fly also taught it to aim. Some weeks after the first launch, anything
// of yours sitting over Earth starts taking fire from the ground.
function zGroundFire(fleet){
    if (typeof fleet.l !== 'number' || fleet.d - fleet.l < zGroundFireDay){ return; }
    if (!global.space.hasOwnProperty('shipyard') || !global.space.shipyard.hasOwnProperty('ships')){ return; }

    // Everything parked over Earth is in range, but the batteries can only hold a firing solution on so
    // a few targets per day. The same hull is never shot twice in one day.
    let overhead = global.space.shipyard.ships.filter(s => !s.inTransit && s.location.name === 'spc_home');

    let hit = 0;
    // Drawn without replacement, so the same hull is never worked over twice in one day.
    for (let i=0; i<zGroundFireTargets && overhead.length > 0; i++){
        let ship = overhead.splice(Math.floor(seededRandom(0,overhead.length,true)),1)[0];
        // Armour soaks part of every hit, but never all of it — a barrage that lands still scores. A
        // flagship's escort screens it here the same as it does under fire in orbit.
        let dmg = seededRandom(zGroundFireMin,zGroundFireMax + 1,true) * shipArmorFactor(ship) * (1 - fleetDamageSoak(ship));
        ship.damage += Math.max(1,Math.floor(dmg));
        if (ship.damage > 90){ ship.damage = 90; }
        hit++;
    }

    if (hit > 0 && !fleet.gf){
        fleet.gf = true;
        messageQueue(loc('zfleet_ground_fire',[regionName('spc_home')]),'danger',false,['combat','progress']);
    }
}

// --- Space combat -------------------------------------------------------------------------------
// The horde's hulls are running a blockade, not looking for a battle: wherever they meet your ships
// both sides trade a single volley and the survivors carry on.

const zCombatSpeedWeight = 2;      // how hard a target's speed works against a firing solution
const zCombatDamageDivisor = 50;  // firepower per point of hull damage

// A defending fleet aims as one body: every dish at the location feeds the same firing solution, so
// what matters is the scan total rather than which hull carries which sensor. The chance closes on a
// certainty as that total climbs and falls away as the target gets faster — at the reference point of
// 100 scan against a middling hull it is a coin toss, a slow target is comfortably hit at the same
// scan, a fast one mostly is not, and enough scan overcomes even that.
function playerAccuracy(scan,foe){
    if (scan <= 0){ return 0; }
    let evade = Math.max(1,shipSpeed(foe)) * zCombatSpeedWeight;
    return scan / (scan + evade);
}

// The horde aims with whatever dish each hull was built with, one ship at a time. No shared solution —
// these are scavenged ships flown by the dead, not a coordinated fleet.
const zSensorAccuracy = { visual: 0.15, radar: 0.3, lidar: 0.45, quantum: 0.6 };
function foeAccuracy(foe){
    return zSensorAccuracy.hasOwnProperty(foe.sensor) ? zSensorAccuracy[foe.sensor] : 0.25;
}

// Firepower turned into hull damage. The target's plating soaks part of it, its size soaks the rest,
// and a flagship's escort screens what is left: the same round means far less to a dreadnought than to
// a corvette. A hit still always scores.
function combatDamage(attacker,defender){
    let raw = shipAttackPower(attacker) / zCombatDamageDivisor;
    return Math.max(1,Math.round(raw * shipArmorFactor(defender) * shipClassFactor(defender) * (1 - fleetDamageSoak(defender))));
}

// Your ships holding a location, able to shoot.
function guardsAt(locationName){
    if (!global.space.hasOwnProperty('shipyard') || !global.space.shipyard.hasOwnProperty('ships')){ return []; }
    return global.space.shipyard.ships.filter(s => !s.inTransit && s.location.name === locationName);
}

// A ship shot out from under its crew. The hull is gone from the roster and the crew with it.
function destroyPlayerShip(ship,locationName){
    let crew = shipCrewSize(ship);
    // Losing the flagship scatters the fleet it was holding together, so stand it down before the hull
    // leaves the roster and the fleet id goes with it.
    leaveFleet(ship);
    let idx = global.space.shipyard.ships.indexOf(ship);
    if (idx >= 0){ global.space.shipyard.ships.splice(idx,1); }
    global.civic.garrison.crew -= crew;
    if (global.civic.garrison.crew < 0){ global.civic.garrison.crew = 0; }
    soldierDeath(crew);
    messageQueue(loc('zcombat_ship_lost',[ship.name,regionName(locationName),crew]),'danger',false,['combat']);
}

// --- Battle log ----------------------------------------------------------------------------------
const zBattleLogMax = 60;   // engagements kept; the oldest falls off the end

export function zBattleLog_read(){
    return global.space['shipyard'] && Array.isArray(global.space.shipyard['battles']) ? global.space.shipyard.battles : [];
}

// Engagement information
function zBattleRoster(ships){
    let roster = {};
    ships.forEach(function(s){
        if (!s || !s.class){ return; }
        roster[s.class] = (roster[s.class] || 0) + 1;
    });
    return roster;
}

// Written the moment the volleys are resolved, before the wrecks are cleared away.
function zBattleLog(locationName,guards,foes,dealt,taken,lost,downed){
    if (!global.space['shipyard']){ return; }
    if (!Array.isArray(global.space.shipyard['battles'])){ global.space.shipyard['battles'] = []; }
    global.space.shipyard.battles.unshift({
        d: global.stats.days,       // game day
        l: locationName,            // where it happened
        p: zBattleRoster(guards),   // your hulls
        e: zBattleRoster(foes),     // theirs
        pd: dealt,                  // hull you landed
        ed: taken,                  // hull they landed
        pl: lost,                   // your ships destroyed
        el: downed                  // theirs destroyed
    });
    if (global.space.shipyard.battles.length > zBattleLogMax){
        global.space.shipyard.battles.length = zBattleLogMax;
    }
}

function zEngage(locationName,foes){
    let guards = guardsAt(locationName);
    if (guards.length === 0 || foes.length === 0){ return false; }

    let scan = guards.reduce((t,s) => t + (sensorRange(s) || 0), 0);
    let downed = [];
    let dealt = 0;
    let taken = 0;

    guards.forEach(function(ship){
        let live = foes.filter(f => f.damage < 100);
        if (live.length === 0){ return; }
        let foe = live[Math.floor(seededRandom(0,live.length,true))];
        if (seededRandom(0,1,true) >= playerAccuracy(scan,foe)){ return; }
        let hit = combatDamage(ship,foe);
        foe.damage += hit;
        dealt += hit;
        if (foe.damage >= 100){
            foe.damage = 100;
            downed.push(foe);
        }
    });

    // Return fire from everything still flying.
    let lost = [];
    foes.forEach(function(foe){
        if (foe.damage >= 100){ return; }
        let live = guards.filter(s => s.damage < 100);
        if (live.length === 0){ return; }
        let ship = live[Math.floor(seededRandom(0,live.length,true))];
        if (seededRandom(0,1,true) >= foeAccuracy(foe)){ return; }
        let hit = combatDamage(foe,ship);
        ship.damage += hit;
        taken += hit;
        if (ship.damage >= 100){
            ship.damage = 100;
            lost.push(ship);
        }
    });

    zBattleLog(locationName,guards,foes,dealt,taken,lost.length,downed.length);

    zMessage(loc('zcombat_engage',[guards.length,foes.length,regionName(locationName)]),'warning');
    lost.forEach(function(ship){ destroyPlayerShip(ship,locationName); });
    if (lost.length > 0){ drawShips(); }
    downed.forEach(function(foe){
        zMessage(loc('zcombat_foe_destroyed',[foe.name,regionName(locationName)]),'success');
    });

    // Check for achievement unlock
    if (downed.length > 0){
        zombieGenociderTask('z2');
    }

    return downed.length > 0;
}

// Strip out raiders that were shot down, so a wreck never reaches its target.
function zCullDowned(list){
    return list.filter(f => f.damage < 100);
}

// zWarfare Variables
export function zWarfareVars(){
    return {
        // Ground war against a horde already on a world
        orbitalStrike: orbitalStrikeRate,
        zombiesPerRazing: zombiesPerRazing,
        razeCap: razeCap,
        hidden: hiddenInfestation,
        inert: inertInfestation,
        // The infested fleet
        delayMin: zFleetDelayMin,
        delayMax: zFleetDelayMax,
        rampDays: zFleetRampDays,
        oddsStart: zFleetOddsStart,
        oddsEnd: zFleetOddsEnd,
        loadStart: zFleetLoadStart,
        pairOdds: zPairOdds,
        pairSize: zPairSize,
        hulls: zFleetHulls,
        parts: zFleetParts,
        classOrder: shipClassSizes,
        targets: zFleetTargets(),
        // Ship to ship combat
        speedWeight: zCombatSpeedWeight,
        damageDivisor: zCombatDamageDivisor,
        sensorAccuracy: zSensorAccuracy,
        armorSoak: shipArmorSoak,
        classSoak: shipClassSoak,
        // Earth shooting back, and the standing orders that answer it
        groundFireDay: zGroundFireDay,
        groundFireMin: zGroundFireMin,
        groundFireMax: zGroundFireMax,
        groundFireTargets: zGroundFireTargets,
        fleetCmd: fleetCmdRange,
        minHull: minHullToLaunch
    };
}

// Advance every hull under way. One that arrives has to get past whatever is guarding the place first;
// survive that and the ship is gone, because it was only ever a delivery, and what it delivers is a
// horde on the ground.

// --- Ship motion ---------------------------------------------------------------------------------

// Put a ship at a given fraction of its journey.
function placeShip(ship){
    if (!ship.inTransit) {
        ship.location.position = genXYZcoord(ship.location.name);
        return;
    }

    let dist = ship.timeToNextStep / ship.path[0].totalTime; //Distance from destination  
    let origin = ship.origin.position;
    let destination = ship.path[0].destination.position;

    // Straight interpolation on each axis.
    ship.location.position.x = destination.x * (1 - dist) + origin.x * dist;
    ship.location.position.y = destination.y * (1 - dist) + origin.y * dist;
    ship.location.position.z = destination.z * (1 - dist) + origin.z * dist;
}

function advanceShip(ship, step){
    while (ship.path.length > 0) {
        if (ship.timeToNextStep > step) {
            // Just move forward along the path
            ship.timeToNextStep -= step;
            break;
        }
        else {
            // Reached either a jump gate or the final destination
            if (ship.path.length == 1) {
                // Final destination - make ship stationary
                TPShipInitTransit(ship, ship.destination.name);
                break;
            }
            else {
                // Reached a jump gate - advance onto the next path step

                // If ship belongs to the enemy, engage any stationed forces at the gate before continuing
                // Broken ships are removed later in zFleetMove
                if (ship.enemy) {
                    zEngage(ship.path[0].destination.name, [ship]);
                }

                ship.origin = {
                    name:  ship.path[0].destination.name,
                    position: ship.path[0].destination.position
                }

                ship.path.shift();
                step -= ship.timeToNextStep;
                ship.timeToNextStep = ship.path[0].totalTime;

                // Continue the while loop to move the remaining `step` days along the new segment
            }
        }
    }

    placeShip(ship);
}

// Move every hull under way — yours and the horde's — by `step` days. Pass 1 from longLoop, or
// midRatio / longRatio from midLoop for the same speed in five smaller steps.
export function moveShips(step){
    if (global.space['shipyard'] && global.space.shipyard['ships']){
        for (let ship of global.space.shipyard.ships){
            // An unfuelled ship stays where it is, as it always has.
            if (ship.inTransit && ship.fueled){ advanceShip(ship, step); }
        }
    }
    if (global.race['zfleet'] && global.race.zfleet['s']){
        for (let ship of global.race.zfleet.s){
            if (ship.inTransit){ advanceShip(ship, step); }
        }
    }
}

function zFleetMove(fleet){
    let landings = {};
    for (let i=fleet.s.length-1; i>=0; i--){
        let ship = fleet.s[i];
        if (ship.damage >= 100){
            fleet.s.splice(i,1);
            continue;
        }
        if (!ship.inTransit){
            // The Venus blockade is not a delivery. It takes station in orbit and stays there, so it is
            // left in the fleet rather than landed and turned into a horde on the ground.
            if (ship.vb){ continue; }
            fleet.s.splice(i,1);
            if (!landings[ship.location.name]){ landings[ship.location.name] = []; }
            landings[ship.location.name].push(ship);
        }
    }

    // Everything arriving at the same world this day meets its defenders together, so a lone picket is
    // not made to fight the same raid several times over.
    Object.keys(landings).forEach(function(locationName){
        let arrivals = landings[locationName];
        zEngage(locationName,arrivals);

        zCullDowned(arrivals).forEach(function(ship){
            if (!global.race.zhorde.hasOwnProperty(ship.location.name)){ return; }
            // A mauled hull spills part of its cargo on the way down: a percent of the horde for every
            // two percent of hull it lost getting here.
            let load = Math.max(0,Math.round(ship.load * (1 - ship.damage / 200)));
            if (load <= 0){ return; }
            global.race.zhorde[ship.location.name] += load;
            zMessage(loc('zfleet_landing',[ship.name,regionName(ship.location.name),load.toLocaleString()]),'danger');
            // A landing on a region whose horde was a secret gives the game away.
            if (!global.race['zfound']){ global.race['zfound'] = {}; }
            global.race.zfound[ship.location.name] = true;
        });
        renderSpace();
    });
}

// The wrecks adrift in the outer system, dealt out to the beacons that find them. Twelve signals, one
// per hull, in a fixed mix shuffled so which beacon is worth the long trip changes every run.
const outerBeaconHulls = [
    'battlecruiser',
    'cruiser','cruiser',
    'destroyer','destroyer','destroyer',
    'frigate','frigate','frigate',
    'corvette','corvette','corvette'
];
const outerBeaconMinAU = 2;
const outerBeaconMaxAU = 19;

// The horde fielding a real warship is what pushes the search outward. Twelve fresh distress signals
// light up across the outer system, and with them the reach to go and answer them.
function outerBeacons(){
    if (!global.race['tempCoordinates']){ global.race['tempCoordinates'] = {}; }

    let hulls = outerBeaconHulls.slice();
    for (let i=hulls.length-1; i>0; i--){
        let j = Math.floor(seededRandom(0,i+1,true));
        let swap = hulls[i];
        hulls[i] = hulls[j];
        hulls[j] = swap;
    }

    // Numbered on from the five inner beacons, so the two sets never collide.
    for (let i=0; i<hulls.length; i++){
        let n = i + 6;
        let c = randomCoord('spc_sun',outerBeaconMinAU,outerBeaconMaxAU);
        global.race.tempCoordinates[`beacon${n}`] = {
            n: loc(`scout_beacon`,[n]), a: true, s: 'spc_sun', x: c.x, y: c.y, z: c.z, d: hulls[i]
        };
    }

    global.tech['resettle'] = 12;
    // Snapshot Titan's surviving support now — the reveal wants a plant you put there, not one you found.
    global.race['ztitan'] = titanSupportMax();
    // The long-range legs need the outer system on the map before they can be flown.
    global.settings.showOuter = true;
    global.settings.space.titan = true;
    global.settings.space.enceladus = true;

    if (global.space.hasOwnProperty('wonder_gardens')){
        global.space.wonder_gardens.count = 1;
        global.space.wonder_gardens.razed = 0;
    }
    ['sam','decoder','ai_core','ai_core2','ai_colonist'].forEach(function(item){
        if (global.space.hasOwnProperty(item)){
            global.space[item].count = 0;
            global.space[item].razed = 0;
        }
    });
    if (global.space.hasOwnProperty('electrolysis')){
        global.space.electrolysis.s_max = 0;
        global.space.electrolysis.support = 0;
        global.space.electrolysis.count = 0;
        global.space.electrolysis.on = 0;
    }

    messageQueue(loc('scout_outer_signals'),'info',false,['progress']);
    renderSpace();
    drawShipYard();
}

// True while any beacon still has someone waiting on it. Used to hold the arc back until the signals
// already on the board have been run down, rather than piling a new set on top of an unfinished one.
export function beaconsActive(){
    let temps = global.race['tempCoordinates'];
    if (!temps){ return false; }
    return Object.keys(temps).some(key => key.startsWith('beacon') && temps[key] && temps[key].a);
}

// The last of the wrecks, scattered out past the gas giants where nobody was looking for them.
const finalBeaconMinAU = 18;
const finalBeaconMaxAU = 30;

// One beacon for every hull still adrift.
export function finalBeacons(){
    let pool = global.race.inactive?.ships;
    if (!pool || pool.length === 0){ return 0; }
    if (!global.race['tempCoordinates']){ global.race['tempCoordinates'] = {}; }

    // Shuffled so which beacon is worth the long haul is not simply the order the old fleet was built in.
    let hulls = pool.map(s => s.class);
    for (let i=hulls.length-1; i>0; i--){
        let j = Math.floor(seededRandom(0,i+1,true));
        let swap = hulls[i];
        hulls[i] = hulls[j];
        hulls[j] = swap;
    }

    // Numbered on from the highest beacon already issued
    let last = 0;
    Object.keys(global.race.tempCoordinates).forEach(function(key){
        let match = key.match(/^beacon(\d+)$/);
        if (match && Number(match[1]) > last){ last = Number(match[1]); }
    });

    for (let i=0; i<hulls.length; i++){
        let n = last + i + 1;
        let c = randomCoord('spc_sun',finalBeaconMinAU,finalBeaconMaxAU);
        global.race.tempCoordinates[`beacon${n}`] = {
            n: loc(`scout_beacon`,[n]), a: true, s: 'spc_sun', x: c.x, y: c.y, z: c.z, d: hulls[i]
        };
    }

    return hulls.length;
}

// One raider hull of a given class, fitted out and sitting over Earth. Not yet under way: a sortie
// wants its whole group built before any of it is shot at.
//
// An ordinary raid is thrown together from whatever the wrecks gave up, so each fitting is rolled. A
// scripted force fitted `best` instead takes the top of every list — zFleetParts is ordered worst to
// best, so this stays right if the lists are ever retuned or extended.
function zFleetHull(cls,best){
    let ship = {
        class: cls,
        name: `${loc(`outer_shipyard_class_${cls}`)} ${Math.floor(seededRandom(100,10000,true))}`,
        damage: 0, fueled: true
    };
    TPShipInitTransit(ship, 'spc_home');
    Object.keys(zFleetParts).forEach(function(part){
        let list = zFleetParts[part];
        ship[part] = best ? list[list.length - 1] : list[Math.floor(seededRandom(0,list.length,true))];
    });
    return ship;
}


// Lift a group of hulls together for one target. Whatever you have parked over Earth gets a single
// shot at the sortie as it climbs out, however many hulls are in it, and only what survives that flies.
// Returns the number that got away.
//
// `opts.best` fits every hull with the top of each parts list; `opts.mark` sets a flag on each one
// before it is engaged, so a scripted force is identifiable even if it is shot down on the way out.
function zFleetSortie(fleet,classes,target,ramp,opts){
    opts = opts || {};
    let ships = classes.map(cls => zFleetHull(cls,opts.best));
    if (opts.mark){
        ships.forEach(function(ship){ ship[opts.mark] = true; });
    }
    zEngage('spc_home',ships);
    let flying = zCullDowned(ships);
    if (flying.length === 0){ return 0; }

    // One trip for the whole sortie, planned on its slowest hull exactly as sendShipTo does for a fleet
    // of yours. Planned per ship instead, hulls drawing different engines would arrive days apart and
    // fly as a group in name only.
    let trip = planShipTrip(fleetPace(flying),target);
    if (!trip)
        return;

    // Stamp the sortie on anything that lifted in company. Two raiders on the same leg would otherwise
    // be indistinguishable from two that merely happen to read the same remaining transit — and once a
    // launch matches a hull already under way they tick down together and stay matched for good. A lone
    // raider gets no stamp and keeps its own name and mark.
    if (flying.length > 1){
        fleet.n = (fleet.n || 0) + 1;
        flying.forEach(function(ship){ ship.zf = fleet.n; });
    }

    // Put a built hull on course and add it to the fleet. Early raids still land lighter than late ones:
    // the cargo ramp scales whatever the hull would otherwise deliver. 
    flying.forEach(function(ship){ 
        let hull = zFleetHulls[ship.class];
        ship.load = Math.max(1,Math.round(hull.horde() * (zFleetLoadStart + (1 - zFleetLoadStart) * ramp)));
        ship.enemy = true;

        initializeShipTrip(ship, target, trip);

        fleet.s.push(ship);
    });

    if (flying.length > 0) {
        // Remember the day the first hull ever lifted; the surface batteries wake a while after it.
        if (typeof fleet.l !== 'number'){ fleet.l = fleet.d; }
    }

    return flying.length;
}

// The ordinary raid: a target and a hull drawn from whatever is cleared to fly. Once the horde has
// managed a strike on another star it starts sending some of them out in company instead — the pair
// flies as one sortie against one target, but each hull is rolled on its own.
function zFleetLaunch(fleet,ramp){
    let targets = zFleetTargets();
    if (targets.length === 0){ return; }
    let target = targets[Math.floor(seededRandom(0,targets.length,true))];

    let avail = zFleetClasses();
    if (avail.length === 0){ return; }

    let count = fleet.tw && seededRandom(0,1,true) < zPairOdds ? zPairSize : 1;
    let classes = [];
    for (let i=0; i<count; i++){
        let cls = zFleetClass(avail);
        classes.push(cls);
        // The first hull heavier than a frigate triggers expansion of progression
        if (cls === 'destroyer' && !fleet.dz){
            fleet.dz = true;
            outerBeacons();
        }
    }

    zFleetSortie(fleet,classes,target,ramp);
}

// The strike on the colony at Tau Ceti: a hundred days after Titan comes under threat the horde puts
// together something heavier than a raid and sends it across. Scripted rather than rolled — the target
// is not on its ordinary list and the cruiser is not a class it builds for itself, and neither becomes
// generally available for having been used here. Armed lazily rather than in zTitanWatch so a save that
// was already past that point still gets its clock started.
function zTauStrike(fleet){
    if (!titanReclaimed()){ return; }
    if (typeof fleet.tz !== 'number'){
        fleet.tz = fleet.d;
        return;
    }
    if (fleet.tw || fleet.d - fleet.tz < zTauStrikeDay){ return; }

    // Marked as spent whether or not anything gets away: stopping it over Earth is a win, not a reason
    // for the horde to try the same thing again.
    fleet.tw = true;
    let sent = zFleetSortie(fleet,zTauStrikeHulls.slice(),zTauStrikeTarget,1);
    if (sent > 0){
        //messageQueue(loc('zfleet_tau_strike',[sent,regionName(zTauStrikeTarget)]),'danger',false,['combat','progress']);
    }
}

// --- The blockade over Venus -------------------------------------------------------------------
// The one infested force that is not a delivery. Every other sortie is a hull carrying infected to a
// surface; this one is sent to keep you off one, and it holds station in orbit until it is destroyed.
// Nothing can be built on Venus while it is up there.
const zVenusBlockadeHulls = ['dreadnought','cruiser','cruiser','destroyer','destroyer','frigate','frigate'];
const zVenusBlockadeTarget = 'spc_venus';
// Hull a blockade ship recovers on a day nobody engages it. Leaving it alone lets it patch up, so a
// half-finished attack is worse than none — the fight wants to be pressed until it is over.
const zBlockadeRepair = 2;

// Infested hulls actually holding station over Venus. Ships still crossing are not blockading anything
// yet, which is what makes the arrival the moment the planet closes.
export function venusBlockade(){
    let fleet = global.race['zfleet'];
    if (!fleet || !fleet.s){ return 0; }
    return fleet.s.filter(s => s.vb && !s.inTransit).length;
}

// Sent once, the moment the outpost on the surface is identified. Whatever is down there does not want
// it looked at, and it commits the best hulls the horde can field rather than the usual scavenged mix.
function zVenusBlockade(fleet){
    if (fleet.vb || !global.tech['venus'] || global.tech.venus < 3){ return; }

    // Marked spent whether or not any of it survives the climb out, the same as the Tau Ceti strike:
    // stopping it over Earth is a win, not an invitation to try again.
    fleet.vb = true;
    let sent = zFleetSortie(fleet,zVenusBlockadeHulls.slice(),zVenusBlockadeTarget,1,{ best: true, mark: 'vb' });
    if (sent > 0){
        messageQueue(loc('zfleet_blockade_launch',[sent,regionName('spc_home'),regionName(zVenusBlockadeTarget)]),'danger',false,['combat','progress']);
    }
    else {
        // Broken up before it ever left orbit. It still counts as beaten.
        fleet.vbd = true;
        zombieGenociderTask('z3');
        messageQueue(loc('zfleet_blockade_broken',[regionName(zVenusBlockadeTarget)]),'success',false,['combat','progress']);
    }
}

// One day of the blockade. It never goes down to the surface, so the only way past it is to destroy it:
// anything of yours in orbit trades a volley with it, and on a day nobody comes it patches itself up.
function zBlockadeDay(fleet){
    if (!fleet.vb || fleet.vbd){ return; }

    let ships = fleet.s.filter(s => s.vb);
    if (ships.length === 0){
        fleet.vbd = true;
        zombieGenociderTask('z3');
        messageQueue(loc('zfleet_blockade_broken',[regionName(zVenusBlockadeTarget)]),'success',false,['combat','progress']);
        renderSpace();
        return;
    }

    let onStation = ships.filter(s => !s.inTransit);
    if (onStation.length === 0){ return; }

    // Taking station is what closes the planet, so it is announced the day it happens rather than the
    // day the fleet left.
    if (!fleet.vba){
        fleet.vba = true;
        messageQueue(loc('zfleet_blockade_arrive',[onStation.length,regionName(zVenusBlockadeTarget)]),'danger',false,['combat','progress']);
        renderSpace();
    }

    if (guardsAt(zVenusBlockadeTarget).length > 0){
        zEngage(zVenusBlockadeTarget,onStation);
        // Culled here rather than left to the next day's move pass, so the blockade is known to be
        // broken on the day the last hull goes down.
        for (let i=fleet.s.length-1; i>=0; i--){
            if (fleet.s[i].vb && fleet.s[i].damage >= 100){ fleet.s.splice(i,1); }
        }
    }
    else {
        onStation.forEach(function(ship){
            if (ship.damage > 0){ ship.damage = Math.max(0, ship.damage - zBlockadeRepair); }
        });
    }
}

// One day of fighting in a single infested region: the fleet in orbit kills what it can, then whatever
// horde is left goes looking for something to tear down. A horde nobody has found yet skips the fight
// entirely and goes straight to the razing that gives it away.
function infestationCombat(region){
    if (infestationFound(region)){
        let crew = 0;
        let bombard = 0;
        if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
            global.space.shipyard.ships.forEach(function(ship){
                if (!ship.inTransit && ship.location.name === region){
                    crew += shipCrewSize(ship);
                    let rating = shipAttackPower(ship);
                    bombard += ship.damage > 0 ? Math.round(rating * (100 - ship.damage) / 100) : rating;
                }
            });
        }

        // Crews fight as a landed squad, so they rate exactly as soldiers do everywhere else.
        let firepower = armyRating(crew,'army',0) + Math.round(bombard * orbitalStrikeRate);
        let kills = Math.min(Math.floor(seededRandom(0,Math.round(firepower) + 1,true)),global.race.zhorde[region]);

        global.race.zhorde[region] -= kills;
        global.stats.zkills += kills;

        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p){
            global.race.ocularPowerConfig.ds += Math.round(kills * traits.ocular_power.vars()[1]);
        }

        if (global.race.zhorde[region] <= 0){
            if (kills > 0){
                //messageQueue(loc('infestation_cleared',[regionName(region)]),'success',false,['combat']);
            }
            return;
        }
    }

    let survivors = global.race.zhorde[region];
    let zombiesPerRazingFinal = zombiesPerRazing;
    if (global.race['chicken']){ // Even zombies love chicken
        zombiesPerRazingFinal *= 1 - (traits.chicken.vars()[2] / 100);
        zombiesPerRazingFinal = Math.round(zombiesPerRazingFinal);
    }
    if (global.race['chameleon']){ // Good at hiding from zombies
        zombiesPerRazingFinal *= 1 + (traits.chameleon.vars()[2] / 100);
        zombiesPerRazingFinal = Math.round(zombiesPerRazingFinal);
    }
    let razings = Math.min(Math.floor(survivors / zombiesPerRazingFinal),razeCap);
    if (razings < razeCap && seededRandom(0,1,true) < (survivors % zombiesPerRazingFinal) / zombiesPerRazingFinal){
        razings++;
    }
    if (razings > 0){
        razeStructures(region,razings);
    }
}

// Pick `razings` structures at random from the region's target list and level them, moving each unit out
// of count and into razed so rebuilding it later is discounted the way any other razed structure is.
function razeStructures(region,razings){
    if (!razeTargets.hasOwnProperty(region)){ return; }
    let cat = razeTargets[region].c;
    if (!global.hasOwnProperty(cat)){ return; }

    let losses = {};
    for (let i=0; i<razings; i++){
        let standing = razeTargets[region].s.filter(s => global[cat][s]?.count > (losses[s] || 0));
        if (standing.length === 0){ break; }
        let target = standing[Math.floor(seededRandom(0,standing.length,true))];
        losses[target] = (losses[target] || 0) + 1;
    }

    let ambush = Object.keys(losses).length > 0 && !infestationFound(region);

    Object.keys(losses).forEach(function(s){
        let lost = losses[s];
        global[cat][s].count -= lost;
        global[cat][s]['razed'] = (global[cat][s]['razed'] || 0) + lost;
        if (global[cat][s].hasOwnProperty('on') && global[cat][s].on > global[cat][s].count){
            global[cat][s].on = global[cat][s].count;
        }
        zMessage(loc('infestation_razed',[lost,structTitle(cat,region,s),regionName(region)]),'danger');
    });

    // A razed factory takes lines out of the shared pool, so bank what it was making here rather than
    // leaving it to the next production tick. A factory rebuilt before that tick runs would find
    // nothing held and start its line over on alloy, quietly losing the job it had been doing.
    if (Object.keys(losses).some(s => factoryStructs.includes(s))){
        trimFactoryLines(factoryCapacity());
    }

    // A hidden horde that just leveled something has announced itself: report the ambush once, then
    // redraw so its numbers appear. From tomorrow on it is fought like any other. Redrawing after the
    // losses are applied keeps the rebuilt panel from showing counts that are already stale.
    if (ambush){
        if (!global.race['zfound']){ global.race['zfound'] = {}; }
        global.race.zfound[region] = true;
        messageQueue(loc('infestation_discovered',[regionName(region)]),'danger',false,['combat','progress']);
        if (cat === 'tauceti'){ renderTauCeti(); }
        else { renderSpace(); }
    }
}

// Region and structure labels come off the action definitions, where `name`/`title` may be either a
// plain string or a function depending on the entry.
function regionName(region){
    let cat = razeTargets.hasOwnProperty(region) && razeTargets[region].c === 'tauceti' ? 'tauceti' : 'space';
    let info = actions[cat]?.[region]?.info;
    if (!info || !info.name){ return region; }
    return typeof info.name === 'function' ? info.name() : info.name;
}

function structTitle(cat,region,struct){
    let title = actions[cat]?.[region]?.[struct]?.title;
    if (!title){ return struct; }
    return typeof title === 'function' ? title.call(actions[cat][region][struct]) : title;
}

// Hull classes ordered smallest to largest. Explorers are deliberately absent: they are a one-off Tau
// Ceti hull rather than a size tier, so a class-targeted salvage never returns one.
const shipClassSizes = ['corvette','frigate','destroyer','cruiser','battlecruiser','dreadnought'];

// The wrecks a salvage would choose between. Asked for nothing in particular, the whole pool. Asked for
// a class, that exact class if any survive and, failing that, each smaller class in turn down to
// corvette — so the salvage is never a bigger hull than was requested, but the request is not wasted
// just because the biggest wrecks are gone. Exported so a button can work out what it is offering
// without taking it, and so both share one definition of what qualifies.
export function salvageCandidates(maxClass){
    let pool = global.race.inactive?.ships;
    if (!pool || pool.length === 0){ return []; }
    if (!maxClass){ return pool.slice(); }

    let top = shipClassSizes.indexOf(maxClass);
    if (top < 0){ return []; }
    // Largest first, so the search settles for the biggest hull still within the request.
    for (let i=top; i>=0; i--){
        let hulls = pool.filter(s => s.class === shipClassSizes[i]);
        if (hulls.length > 0){ return hulls; }
    }
    return [];
}

// A derelict predates the player's return to Sol, so it carries early-era equipment rather than
// anything tech-gated — randomised within those tiers so each seeded wreck is its own ship.
const derelictParts = {
    power: ['solar','diesel','fission'],
    weapon: ['railgun','laser','p_laser'],
    armor: ['steel','alloy'],
    engine: ['ion','tie','pulse'],
    sensor: ['visual','radar','lidar']
};

// Build a random corvette. Salvage that must always have something to offer falls back on this when
// nothing it can use is adrift. Not added to the wreck pool by the caller unless it wants it there.
function newDerelict(){
    let ship = {
        class: 'corvette',
        name: getRandomShipName(),
        damage: 0, fueled: false
    };
    TPShipInitTransit(ship, 'tau_gas2');

    Object.keys(derelictParts).forEach(function(part){
        ship[part] = derelictParts[part][Math.floor(seededRandom(0,derelictParts[part].length))];
    });
    return ship;
}

// Reserved wrecks, keyed by whoever reserved them — one shared store rather than a variable per
// building, so any number of things can hold a hull aside. Being kept here instead of in the inactive
// pool is what makes a pin safe: salvageCandidates only ever sees the pool, so an ordinary salvage
// cannot carry off a hull that a button has already promised by name.
export function salvagePins(){
    if (!global.race['salvagePins']){ global.race['salvagePins'] = {}; }
    return global.race.salvagePins;
}

// The wreck reserved under `key`, or false. Safe to call from a render path — it reserves nothing.
export function salvagePin(key){
    return salvagePins()[key] || false;
}

// Reserve the wreck that the `key` salvage will advertise and hand over, lifting it out of the pool so
// nothing else can take it. Re-pinning an existing key keeps the hull already reserved. When nothing at
// or below `maxClass` is adrift a fresh corvette is built, so a button that gates progress always has
// an answer.
export function pinSalvage(key,maxClass){
    let pins = salvagePins();
    if (pins[key]){ return pins[key]; }

    if (!global.race.hasOwnProperty('inactive')){ global.race['inactive'] = {}; }
    if (!global.race.inactive.ships){ global.race.inactive.ships = []; }

    let choices = salvageCandidates(maxClass);
    let ship;
    if (choices.length > 0){
        ship = choices[Math.floor(seededRandom(0,choices.length))];
        global.race.inactive.ships.splice(global.race.inactive.ships.indexOf(ship),1);
    }
    else {
        ship = newDerelict();
    }
    pins[key] = ship;
    return ship;
}

// Take one derelict. With a pin key, the hull reserved under it is released and handed over — the only
// way a reserved wreck ever leaves the store. Otherwise the pick is made from the unreserved pool.
// Returns false when nothing suitable is left.
function pickDerelict(maxClass,pin){
    if (pin){
        let pins = salvagePins();
        let ship = pins[pin];
        if (!ship){ return false; }
        delete pins[pin];
        return ship;
    }

    let pool = global.race.inactive?.ships;
    if (!pool || pool.length === 0){ return false; }

    let choices = salvageCandidates(maxClass);
    if (choices.length === 0){ return false; }

    let ship = choices[Math.floor(seededRandom(0,choices.length))];
    return pool.splice(pool.indexOf(ship),1)[0];
}

// `maxClass` is either one class applied to every hull recovered, or a list naming a class per hull —
// which is how a single find can ask for, say, a corvette and a frigate and still report as one haul.
// A list sets how many are recovered and `qty` is ignored. Each entry still downgrades on its own if
// its class is not among the wrecks.
//
// `pin` names a reserved wreck (see pinSalvage) to hand over rather than picking from the pool. It is
// the only way a reserved hull is ever salvaged — without it the pick cannot see reserved wrecks at all.
export function salvageShip(qty, locationName, sLocation, eventStyle, maxClass, pin){
    let wants = Array.isArray(maxClass) ? maxClass : new Array(Math.max(qty,0)).fill(maxClass || false);
    if (wants.length > 0){
        let salvaged = 0;
        for (let i=0; i<wants.length; i++){
            // A pin only ever names one hull, so it applies to the first recovery; anything further
            // falls through to the ordinary class search.
            // Each request stands on its own: with a mixed list, finding no corvette says nothing about
            // whether a frigate is out there, so a miss skips rather than abandoning the whole haul.
            let ship = pickDerelict(wants[i], i === 0 ? pin : false);
            if (!ship){ continue; }
            ship.location = sLocation;
            TPShipInitTransit(ship, sLocation);
            ship.damage = Math.floor(seededRandom(75,90));
            ship.fueled = false;
            let num = 1;
            let name = ship.name;
            while (global.space.shipyard.ships.filter(s => s.name === name).length > 0){
                num++;
                name = ship.name + ` ${num}`;
            }
            ship.name = name;
            global.space.shipyard.ships.push(ship);
            salvaged++;
        }
        if (salvaged > 0){
            if (eventStyle){
                let key = `scout_salvage_ship${Math.rand(0,10)}`;
                messageQueue(loc(key,[locationName]),'info',false,['progress']);
            }
            else {
                if (salvaged === 1){
                    messageQueue(loc('scout_spc_found_ship',[locationName]),'info',false,['progress']);
                }
                else {
                    messageQueue(loc('scout_spc_found_ships',[locationName,salvaged]),'info',false,['progress']);
                }
            }
            drawShipYard();
        }
        else {
            messageQueue(loc('scout_salvage_ship_fail',[locationName]),'info',false,['progress']);
        }
    }
}

export function renderTauCeti(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 6)){
        return;
    }
    let parent = $('#tauceti');
    clearElement(parent);
    parent.append($(`<h2 class="is-sr-only">${loc('tab_tauceti')}</h2>`));
    if (!global.tech['tauceti'] || global.tech.tauceti < 2){
        return;
    }

    Object.keys(tauCetiModules).forEach(function (region){
        let show = region.replace("tau_","");
        if (global.settings.tau[`${show}`]){
            let name = typeof tauCetiModules[region].info.name === 'string' ? tauCetiModules[region].info.name : tauCetiModules[region].info.name();
            
            let property = ``;
            if (tauCetiModules[region].info.hasOwnProperty('prop')){
                property = tauCetiModules[region].info.prop();
            }

            // The horde readout follows the support line when there is one.
            let infest = infestationLabel(region);

            if (tauCetiModules[region].info['support']){
                let support = tauCetiModules[region].info['support'];
                if (tauCetiModules[region].info['hide_support']){
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3>${infest}${property}</div></div>`);
                }
                else {
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3> <span v-show="s_max">{{ support }}/{{ s_max }}</span>${infest}${property}</div></div>`);
                }
                vBind({
                    el: `#sr${region}`,
                    data: global.tauceti[support],
                    methods: Object.assign({
                        filter(){
                            return tauCetiModules[region].info.filter(...arguments);
                        }
                    },infestationMethods(region))
                });
            }
            else {
                parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3>${infest}${property}</div></div>`);
                if (infest){
                    vBind({
                        el: `#sr${region}`,
                        data: global.race.zhorde,
                        methods: infestationMethods(region)
                    });
                }
            }

            popover(region, function(){
                    return typeof tauCetiModules[region].info.desc === 'string' ? tauCetiModules[region].info.desc : tauCetiModules[region].info.desc();
                },
                {
                    elm: `#${region} h3.name`,
                    classes: `has-background-light has-text-dark`
                }
            );

            Object.keys(tauCetiModules[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(tauCetiModules,region,tech)){
                    let c_action = tauCetiModules[region][tech];
                    setAction(c_action,'tauceti',tech);
                }
            });

            if (tauCetiModules[region].info.hasOwnProperty('extra')){
                tauCetiModules[region].info.extra(region);
            }
        }
    });
}

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

        // Disable Explorer hull and emdrive engine when restarting ship yard
        // scrub them from any saved blueprint so a stale configuration can't be constructed.
        if (global.tech['resettle']){
            if (global.space.shipyard.blueprint.class === 'explorer'){
                global.space.shipyard.blueprint.class = 'corvette';
            }
            if (global.space.shipyard.blueprint.engine === 'emdrive'){
                global.space.shipyard.blueprint.engine = 'ion';
            }
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
            class: ['corvette','frigate','destroyer','cruiser','battlecruiser','dreadnought','explorer'],
            power: ['solar','diesel','fission','fusion','elerium','antimatter'],
            weapon: ['railgun','laser','p_laser','plasma','phaser','disruptor','gauss'],
            armor : ['steel','alloy','neutronium','aerographene'],
            engine: ['ion','tie','pulse','photon','vacuum','emdrive','electrokinetic'],
            sensor: ['visual','radar','lidar','quantum'],
        };

        Object.keys(shipConfig).forEach(function(k){
            let values = ``;
            shipConfig[k].forEach(function(v,idx){
                values += `<b-dropdown-item aria-role="listitem" @click="setVal('${k}','${v}')" class="${k} a${idx}" data-val="${v}" v-show="avail('${k}','${idx}','${v}')">${loc(`outer_shipyard_${k}_${v}`)}</b-dropdown-item>`;
            });

            options.append(`<b-dropdown :triggers="['hover', 'click']" aria-role="list">
                <template #trigger>
                    <button class="button is-info">
                        <span>${loc(`outer_shipyard_${k}`)}: {{ lbl(b.${k}, '${k}') }}</span>
                    </button>
                </template>${values}
            </b-dropdown>`);
        });

        let assemble = $(`<div class="assemble"></div>`);
        assemble.append(`<button class="button is-info" v-on:click="build()"><span>${loc('outer_shipyard_build')}</span></button>`);
        assemble.append(`<span><b-checkbox class="patrol" v-model="s.expand" @change="redraw()">${loc('outer_shipyard_fleet_details')}</b-checkbox></span>`);
        assemble.append(`<span><b-checkbox class="patrol" v-model="s.sort" @change="redraw()">${loc('outer_shipyard_fleet_sort')}</b-checkbox></span>`);

        // Two star systems and dozens of locations make the flat list hard to read, so it can be
        // narrowed to one system and folded up by location. Built from shipyardSystems(), which is
        // stable, so these items do not need rebuilding as the campaign runs.
        if (shipyardViewUnlocked()){
            let systems = `<b-dropdown-item aria-role="listitem" class="sysAll" @click="setSys('all')">${systemLabel('all')}</b-dropdown-item>`;
            shipyardSystems().forEach(function(sys){
                systems += `<b-dropdown-item aria-role="listitem" class="sys_${sys}" @click="setSys('${sys}')">${systemLabel(sys)}</b-dropdown-item>`;
            });
            assemble.append(`<span class="shipView"><b-dropdown :triggers="['hover', 'click']" aria-role="list">
                <template #trigger>
                    <button class="button is-info">
                        <span>${loc('outer_shipyard_view_system')}: {{ sysLabel() }}</span>
                    </button>
                </template>${systems}
            </b-dropdown></span>`);
            assemble.append(`<span><b-checkbox class="patrol" v-model="v.group" @change="redraw()">${loc('outer_shipyard_view_group')}</b-checkbox></span>`);
        }

        plans.append(assemble);
        assemble.append(`<div><span>${loc(`outer_shipyard_park`,[global.tech['resettle'] ? tauCetiModules.tau_gas2.info.name() : planetName().dwarf])}</span><a href="#" class="solarMap" @click="trigModal">${loc(`outer_shipyard_map`)}</span></a>`);

        updateCosts();

        vBind({
            el: '#shipPlans',
            data: {
                b: global.space.shipyard.blueprint,
                s: global.space.shipyard,
                v: shipyardView()
            },
            methods: {
                sysLabel(){
                    return systemLabel(shipyardView().sys);
                },
                setSys(sys){
                    shipyardView().sys = sys;
                    vBind({el: `#shipPlans`},'update');
                    drawShips();
                },
                setVal(b,v){
                    if (b === 'class' && v === 'explorer'){
                        global.space.shipyard.blueprint.engine = 'emdrive';
                        global.space.shipyard.blueprint.weapon = 'railgun';
                        if (global.tech.syard_armor >= 3){ global.space.shipyard.blueprint.armor = 'neutronium'; }
                        if (global.tech.syard_sensor >= 4){ global.space.shipyard.blueprint.sensor = 'quantum'; }
                        if (global.tech.syard_power >= 4){ global.space.shipyard.blueprint.power = 'elerium'; }
                    }
                    else if (b === 'class' && v !== 'explorer' && global.space.shipyard.blueprint.class === 'explorer'){
                        global.space.shipyard.blueprint.engine = 'ion';
                    }
                    global.space.shipyard.blueprint[b] = v;
                    updateCosts();
                    vBind({el: `#shipPlans`},'update');
                },
                avail(k,i,v){
                    // Disable the Explorer hull and emdrive engine after new shipyard is unlocked
                    if (global.tech['resettle'] && (v === 'emdrive' || v === 'explorer')){
                        return false;
                    }
                    if ((k === 'class' || k === 'engine') && global.tech['tauceti'] && (v === 'emdrive' || v === 'explorer')){
                        return true;
                    }
                    else if (global.space.shipyard.blueprint.class === 'explorer'){
                        if (k === 'weapon'){
                            return i === 1 ? true : false;
                        }
                        else if (k === 'engine'){
                            return i === 6 ? true : false;
                        }
                        else if (k === 'sensor'){
                            return i === 4 ? true : false;
                        }
                    }
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
                    return sensorRange(global.space.shipyard.blueprint) + 'km';
                },
                speedText(){
                    let speed = (149597870.7/225/24/3600) * shipSpeed(global.space.shipyard.blueprint);
                    return Math.round(speed) + 'km/s';
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
                        if (!(global.settings.qKey && keyMap.q) && payCosts(false, costs)){
                            let ship = deepClone(global.space.shipyard.blueprint);
                            buildTPShip(ship,false);
                        }
                        else {
                            let used = 0;
                            for (let j=0; j<global.queue.queue.length; j++){
                                used += Math.ceil(global.queue.queue[j].q / global.queue.queue[j].qs);
                            }
                            if (used < global.queue.max){
                                let blueprint = deepClone(global.space.shipyard.blueprint);
                                global.queue.queue.push({ 
                                    id: `tp-ship-${Math.rand(0,100000)}`, 
                                    action: 'tp-ship', 
                                    type: blueprint,
                                    label: blueprint.name, 
                                    cna: false, 
                                    time: 0, 
                                    q: 1, 
                                    qs: 1, 
                                    t_max: 0, 
                                    bres: false 
                                });
                                global.space.shipyard.blueprint.name = getRandomShipName();
                                buildQueue();
                            }
                        }
                    }
                },
                trigModal(){
                    this.$buefy.modal.open({
                        hasModalCard: false,
                        content: '<div id="modalBox" class="modalBox"></div>'
                    });

                    let checkExist = setInterval(function(){
                        if ($('#modalBox').length > 0) {
                            clearInterval(checkExist);
                            solarModal();
                        }
                    }, 50);
                },
                redraw(){
                    drawShips();
                },
                lbl(l,c){
                    return loc(`outer_shipyard_${c}_${l}`);
                }
            }
        });

        Object.keys(shipConfig).forEach(function(type){
            for (let i=0; i<$(`#shipPlans .${type}`).length; i++){
                popover(`shipPlans${type}${i}`, function(obj){
                    let val = $(obj.this).attr(`data-val`);
                    return type === 'armor' ? armorDesc(val) : loc(`outer_shipyard_${type}_${val}_desc`);
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

export function buildTPShipQueue(action){
    if (payCosts(false, action.cost)){
        buildTPShip(deepClone(action.bp), true);
        return true;
    }
    return false;
}

export function TPShipDesc(parent,obj){
    let ship = obj.type;
    let raw = shipCosts(ship);
    let costs = {};
    Object.keys(raw).forEach(function(res){
        costs[res] = function(){ return raw[res]; }
    });

    var desc = $(`<div class="shipPopper"></div>`);
    var shipPattern = $(`<div class="divider">${loc(`outer_shipyard_class_${ship.class}`)} | ${loc(`outer_shipyard_engine_${ship.engine}`)} | ${loc(`outer_shipyard_weapon_${ship.weapon}`)} | ${loc(`outer_shipyard_power_${ship.power}`)} | ${loc(`outer_shipyard_sensor_${ship.sensor}`)}</div>`);
    parent.append(desc);

    desc.append(shipPattern);

    var cost = $('<div class="costList"></div>');
    desc.append(cost);

    let tc = timeCheck({ id: ship.name , cost: costs, doNotAdjustCost: true }, false, true);
    Object.keys(costs).forEach(function (res){
        if (costs[res]() > 0){
            var label = res === 'Money' ? '$' : global.resource[res].name + ': ';
            var color = global.resource[res].amount >= costs[res]() ? 'has-text-dark' : ( res === tc.r ? 'has-text-danger' : 'has-text-alert');
            cost.append($(`<div class="${color}" data-${res}="${costs[res]()}">${label}${sizeApproximation(costs[res](),2)}</div>`));
        }
    });

    if (tc && tc['t']){
        desc.append($(`<div class="divider"></div><div id="popTimer" class="flair has-text-advanced">{{ timer(t) }}</div>`));
        vBind({
            el: '#popTimer',
            data: tc,
            methods: {
                timer(t){
                    return loc('action_ready',[timeFormat(t)]);
                }
            }
        });
    }
    
    return desc;
}

// Initialize ship variables related to transit. Used either when creating a new ship 
// to place it at `locationName`, or when landing an existing ship at `locationName`
// to cleanup after previous trip.
function TPShipInitTransit(ship, locationName) {
    // Whether ship is currently in transit
    ship.inTransit = false;

    // Current location of the ship
    ship.location = {
        position: genXYZcoord(locationName),
        
        // Only if not in transit
        name: locationName
    };
    
    // Origin of the ship, either starting position or gate it just exited - only if in transit
    ship.origin = {
        name: "",
        position: {x: 0, y: 0, z: 0}
    };
    // Final destination of the ship - only if in transit
    ship.destination = {
        name: "",
        position: {x: 0, y: 0, z: 0}
    };

    // Path to destination, contains jump gates along the way as well 
    // as the final destination - only if in transit
    ship.path = [];
    // Remaining days to get to next step along the path, used to 
    // interpolate ship position - only if in transit
    ship.timeToNextStep = 0;
    // Sum of days for all steps along the path. Stored here to prevent 
    // recalculating the sum every time something needs it 
    ship.totalTime = 0;
}

function buildTPShip(ship, queue){
    let locationName = global.tech['resettle'] ? 'tau_gas2' : 'spc_dwarf';
    TPShipInitTransit(ship, locationName);

    ship.damage = 0;
    ship.fueled = false;

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
    drawShips();
    updateCosts();
    if (!queue){
        global.space.shipyard.blueprint.name = getRandomShipName();
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
            return global.race['grenadier'] ? jobScale(1) : jobScale(2);
        case 'frigate':
            return global.race['grenadier'] ? jobScale(2) : jobScale(3);
        case 'destroyer':
            return global.race['grenadier'] ? jobScale(3) : jobScale(4);
        case 'cruiser':
            return global.race['grenadier'] ? jobScale(4) : jobScale(6);
        case 'battlecruiser':
            return global.race['grenadier'] ? jobScale(5) : jobScale(8);
        case 'dreadnought':
            return global.race['grenadier'] ? jobScale(6) : jobScale(10);
        case 'explorer':
            return global.race['grenadier'] ? jobScale(6) : jobScale(10);
    }
}

// Share of a mount's draw that capacitor banks save. They hold the charge between shots, so the
// reactor tops the bank up instead of carrying every discharge itself.
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

export function shipPower(ship, wiki){
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
            use_inflate = 6.5;
            break;
        case 'explorer':
            out_inflate = 6;
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
            return Math.round(rating * 2.75);
        case 'cruiser':
            return Math.round(rating * 5.5);
        case 'battlecruiser':
            return Math.round(rating * 10);
        case 'dreadnought':
            return Math.round(rating * 22);
        case 'explorer':
            return Math.round(rating * 1.2);
    }
}

export function shipSpeed(ship){
    let mass = 1;
    switch (ship.class){
        case 'corvette':
            mass = global.tech['syard_mass'] ? (ship.armor === 'neutronium' ? 1 : 0.95) : ship.armor === 'neutronium' ? 1.1 : 1;
            break;
        case 'frigate':
            mass = global.tech['syard_mass'] ? (ship.armor === 'neutronium' ? 1.12 : 1.1) : ship.armor === 'neutronium' ? 1.35 : 1.25;
            break;
        case 'destroyer':
            mass = global.tech['syard_mass'] ? (ship.armor === 'neutronium' ? 1.25 : 1.2) : ship.armor === 'neutronium' ? 1.95 : 1.8;
            break;
        case 'cruiser':
            mass = global.tech['syard_mass'] ? (ship.armor === 'neutronium' ? 1.75 : 1.5) : ship.armor === 'neutronium' ? 3.5 : 3;
            break;
        case 'battlecruiser':
            mass = global.tech['syard_mass'] ? (ship.armor === 'neutronium' ? 2.4 : 2) : ship.armor === 'neutronium' ? 4.8 : 4;
            break;
        case 'dreadnought':
            mass = global.tech['syard_mass'] ? (ship.armor === 'neutronium' ? 3.5 : 3) : (ship.armor === 'neutronium' ? 7.5 : 6);
            break;
        case 'explorer':
            mass = 1;
            break;
    }
    if (ship.armor === 'aerographene'){ mass /= AEROGRAPHENE_SPEED; }

    let boost = 1;
    switch (ship.location?.name ?? ""){
        case 'spc_dwarf':
            boost = p_on['m_relay'] && !ship.inTransit && global.space['m_relay'] && global.space.m_relay.charged >= 10000 ? 3 : 1;
            break;
        case 'tau_gas2':
            boost = p_on['tcm_relay'] && !ship.inTransit && global.tauceti['tcm_relay'] && global.tauceti.tcm_relay.charged >= 10000 ? 3 : 1;
            break;
        default:
            boost = 1;
            break;
    }
    // A fleet led by a light hull is a courier group rather than a battle line, and the whole group
    // moves at that pace — flagship included.
    boost *= 1 + fleetSpeedBonus(ship);
    switch (ship.engine){
        case 'ion':
            return (global.tech.syard_engine >= 6 ? 30 : 12) / mass * boost;
        case 'tie':
            return (global.tech.syard_engine >= 6 ? 55 : 22) / mass * boost;
        case 'pulse':
            return (global.tech.syard_engine >= 6 ? 45 : 18) / mass * boost;
        case 'photon':
            return (global.tech.syard_engine >= 6 ? 75 : 30) / mass * boost;
        case 'vacuum':
            return (global.tech.syard_engine >= 6 ? 105 : 42) / mass * boost;
        case 'emdrive':
            return 37500 / mass * boost;
        case 'electrokinetic':
            return (global.tech.syard_engine >= 6 ? 140 : 56) / mass * boost;
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
    }

    return {
        res: res,
        burn: +(burn).toFixed(2)
    };
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
        case 'explorer':
            costs['Money'] = 800000000;
            costs['Adamantite'] = 9500000;
            h_inflate = 1.45;
            p_inflate = 1;
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

    switch (bp.engine){
        case 'ion':
            costs['Titanium'] = Math.round(75000 ** p_inflate);
            break;
        case 'tie':
            costs['Titanium'] = Math.round(150000 ** p_inflate);
            break;
        case 'pulse':
            costs['Titanium'] = Math.round(125000 ** p_inflate);
            break;
        case 'photon':
            costs['Titanium'] = Math.round(210000 ** p_inflate);
            break;
        case 'vacuum':
            costs['Titanium'] = Math.round(300000 ** p_inflate);
            break;
        case 'emdrive':
            costs['Titanium'] = Math.round(1250000 ** p_inflate);
            break;
        case 'electrokinetic':
            costs['Titanium'] = Math.round(1750000 ** p_inflate);
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

    if (bp.class === 'explorer'){
        costs['Iron'] *= 10;
        costs['Titanium'] *= 5;
        costs['Iridium'] *= 50;
    }

    let typeCount = 0;
    global.space.shipyard.ships.forEach(function(ship){
        if (ship.class === bp.class){
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
    if (el){
        Sortable.create(el,{
            onEnd(e){
                let order = global.space.shipyard.ships;
                order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
                global.space.shipyard.ships = order;
                drawShips();
            }
        });
    }
}

// --- Ship list view options ---------------------------------------------------------------------
// Filtering and grouping only earn their keep once the resettlement arc puts the fleet across two star
// systems and dozens of locations. Before that every ship is within a few rows of every other and the
// controls would be clutter.
export function shipyardViewUnlocked(){
    return global.tech['resettle'] ? true : false;
}

// Held under global.space.shipyard so it saves with the yard. Created and backfilled on read rather
// than migrated, so an older save picks it up the first time the tab is drawn.
export function shipyardView(){
    let yard = global.space.shipyard;
    if (!yard['view'] || typeof yard.view !== 'object'){ yard['view'] = {}; }
    let v = yard.view;
    if (typeof v['sys'] !== 'string'){ v['sys'] = 'all'; }
    if (typeof v['group'] !== 'boolean'){ v['group'] = false; }
    if (!v['fold'] || typeof v.fold !== 'object'){ v['fold'] = {}; }
    // Folded fleets, keyed by fleet id, kept apart from the folded locations so the two cannot collide.
    if (!v['ffold'] || typeof v.ffold !== 'object'){ v['ffold'] = {}; }
    return v;
}

// The view as it should actually be applied. Locked, it is the plain ungrouped list however the options
// were last left — so a reset that takes the tech away cannot leave the list filtered with no way back.
// Folded fleets pass through either way: they are not one of the options the resettlement arc unlocks,
// they belong to the fleets themselves, and a row's readout reads the same store to decide whether it
// is speaking for one ship or for a whole fleet.
function activeShipyardView(){
    return shipyardViewUnlocked() ? shipyardView() : { sys: 'all', group: false, fold: {}, ffold: shipyardView().ffold };
}

// The ships a row's readout describes. Normally the one it belongs to — but a folded flagship is
// standing in for its whole fleet, whose ships have no rows of their own, so its figures become the
// fleet's. Combined the way a fleet actually behaves rather than by summing everything blindly: it
// aims with its best dish, keeps pace with its slowest hull, and is grounded by its worst.
function rowGroup(ship){
    if (!ship){ return []; }
    if (global.tech['syard_fleet'] && ship.flag && ship.fid && shipyardView().ffold[ship.fid]){
        let crew = fleetMembers(ship.fid);
        if (crew.length > 1){ return crew; }
    }
    return [ship];
}

// Fuel burn for a group. Hulls in one fleet can run on different resources, so the burn is totalled per
// resource rather than added into a single meaningless figure.
function groupFuelText(group){
    let burn = {};
    let order = [];
    group.forEach(function(s){
        let fuel = shipFuelUse(s);
        if (!fuel.res){ return; }
        if (!burn.hasOwnProperty(fuel.res)){
            burn[fuel.res] = 0;
            order.push(fuel.res);
        }
        burn[fuel.res] += fuel.burn;
    });
    if (order.length === 0){ return `N/A`; }
    return order.map(res => `${+burn[res].toFixed(2)} ${global.resource[res].name}/s`).join(`, `);
}

// Systems the fleet can be spread across: home, plus wherever the jump gate network reaches. Driven off
// jumpGates so extending the network extends the filter with it, and stable enough to build the
// dropdown from once when the tab is assembled.
function shipyardSystems(){
    let seen = { sun: true };
    Object.keys(jumpGates).forEach(function(gate){ seen[jumpGates[gate].system] = true; });
    return Object.keys(seen);
}

// Display name of a system key, the same label locSystemName puts on a location.
function systemLabel(sys){
    if (sys === 'all'){ return loc('outer_shipyard_system_all'); }
    let star = sys === 'sun' ? spacePlanetStats.spc_sun : spacePlanetStats[sys];
    return star && star.label ? star.label : sys;
}

const shipyardRanks = {
    // Lower number -> higher in the auto-sorted list
    location: {
        spc_dwarf: 1,
        spc_moon: 2,
        spc_red: 3,
        spc_belt: 4,
        spc_gas: 5,
        spc_gas_moon: 6,
        spc_titan: 7,
        spc_enceladus: 8,
        spc_triton: 9,
        spc_makemake: 10,
        spc_eris: 11,
        tauceti: 12,
        tau_home: 13,
        tau_red: 14,
        tau_gas: 15,
        tau_gas2: 16,
        tau_roid: 17,
        spc_sun_gate: 18,
        spc_home: 19,
    },
    class: {
        corvette: 1,
        frigate: 2,
        destroyer: 3,
        cruiser: 4,
        battlecruiser: 5,
        dreadnought: 6,
        explorer: 7,
    },
    engine: {
        ion: 1,
        tie: 3,
        pulse: 2,
        photon: 4,
        vacuum: 5,
        emdrive: 6,
        electrokinetic: 7
    },
    power: {
        solar: 1,
        diesel: 2,
        fission: 3,
        fusion: 4,
        elerium: 5,
    }
};

// A ship at a yard that can currently take it in comes first, whatever the location table says: those
// are the ones being worked on, and they are what you came to the list to look at. Passed the yard list
// rather than reading it per comparison, since a sort asks this O(n log n) times. Within the group the
// existing tie-breakers still apply, so a docked ship sits above one still crossing to the same yard.
function shipyardShipCompare(a,b,yards){
    yards = yards || activeRepairYards();
    return (
        (yards.includes(a.location.name) ? 0 : 1) - (yards.includes(b.location.name) ? 0 : 1)
        || (shipyardRanks.location[a.location.name] ?? 0) - (shipyardRanks.location[b.location.name] ?? 0)
        || a.inTransit - b.inTransit
        || a.timeToNextStep - b.timeToNextStep
        || (shipyardRanks.class[a.class] ?? 0) - (shipyardRanks.class[b.class] ?? 0)
        || (shipyardRanks.engine[a.engine] ?? 0) - (shipyardRanks.engine[b.engine] ?? 0)
        || (shipyardRanks.power[a.power] ?? 0) - (shipyardRanks.power[b.power] ?? 0)
    );
}

// Draw a fleet as the one thing it is: each flagship keeps whatever place the ordering gave it, and the
// ships under its command are lifted out of wherever they landed and set down directly behind it. Both
// orderings feed through here — Auto Sort can rank an escort above its own flagship, and by hand the
// two can end up anywhere at all.
//
// The array is rearranged rather than just the drawn rows. Hand-ordering moves a ship by its position
// in the list and only means anything while the list and the array agree, so reordering the rows alone
// would have cost the player the ability to drag.
function clusterFleets(ships){
    if (!global.tech['syard_fleet']){ return ships; }

    let escorts = {};
    ships.forEach(function(s){
        if (!s.fid || s.flag){ return; }
        if (!escorts[s.fid]){ escorts[s.fid] = []; }
        escorts[s.fid].push(s);
    });
    if (Object.keys(escorts).length === 0){ return ships; }

    let placed = {};
    let ordered = [];
    ships.forEach(function(s){
        // An escort is positioned by its flagship, so it is passed over here and picked up below.
        if (s.fid && !s.flag && escorts.hasOwnProperty(s.fid)){ return; }
        ordered.push(s);
        if (s.flag && escorts.hasOwnProperty(s.fid) && !placed[s.fid]){
            placed[s.fid] = true;
            escorts[s.fid].forEach(function(e){ ordered.push(e); });
        }
    });

    // Nothing should be left holding a fleet id with no flagship still flying, but a ship dropped here
    // would vanish off the list entirely rather than merely sit in the wrong place, so put any back.
    Object.keys(escorts).forEach(function(fid){
        if (placed[fid]){ return; }
        escorts[fid].forEach(function(e){ ordered.push(e); });
    });

    return ordered;
}

function drawShips(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 5)){
        return;
    }
    clearShipDrag();
    clearElement($('#shipList'));

    if (global.tech['isolation'] && !global.tech['resettle']){
        return;
    }

    let list = $('#shipList');

    let repairYards = activeRepairYards();
    if (global.space.shipyard.sort){
        global.space.shipyard.ships = global.space.shipyard.ships.sort(function(a,b){ return shipyardShipCompare(a,b,repairYards); });
    }
    global.space.shipyard.ships = clusterFleets(global.space.shipyard.ships);


    const spaceRegions = spaceTech();
    let regionNames = {};
    Object.keys(spaceRegions).forEach(function(region){
        let name = typeof spaceRegions[region].info.name === 'string' ? spaceRegions[region].info.name : spaceRegions[region].info.name();
        regionNames[region] = name;
    });
    Object.keys(tauCetiModules).forEach(function(region){
        if (tauCetiModules[region].info.nav()){
            let name = typeof tauCetiModules[region].info.name === 'string' ? tauCetiModules[region].info.name : tauCetiModules[region].info.name();
            regionNames[region] = name;
        }
    });
    regionNames['tauceti'] = loc('tech_era_tauceti');
    if (global.race['tempCoordinates']){
        Object.keys(global.race.tempCoordinates).forEach(function(key){
            if (global.race.tempCoordinates[key]){ regionNames[key] = global.race.tempCoordinates[key].n; }
        });
    }

    let view = activeShipyardView();

    // A fleet that has since been stood down leaves its fold state behind. Drop it, so a long game does
    // not accumulate a record for every fleet that ever flew — fleet ids are never reused.
    Object.keys(view.ffold).forEach(function(fid){
        if (!global.space.shipyard.ships.some(s => s.flag && `${s.fid}` === fid)){ delete view.ffold[fid]; }
    });

    // What to draw and in what order, as [index, ship] pairs. The index is the ship's real place in the
    // array — a row binds and acts on that, so it stays correct however the list is arranged on screen.
    let entries = [];
    let collapsed = false;
    global.space.shipyard.ships.forEach(function(ship,i){
        // Which tab should the ship be drawn in
        let shipDisplayLocation = (ship.inTransit ? ship.destination.name : ship.location.name);

        if (view.sys !== 'all' && locSystem(shipDisplayLocation) !== view.sys){ return; }
        // A folded fleet shows its flagship and nothing else, the same way a folded location shows only
        // its header. The flagship keeps its row, so there is always something left to unfold from.
        if (ship.fid && !ship.flag && view.ffold[ship.fid]){
            collapsed = true;
            return;
        }
        entries.push({ i: i, ship: ship, dispLoc: shipDisplayLocation });
    });

    if (view.group){
        // One header per location, in the order the locations first come up in the list — so with Auto
        // Sort on the groups follow the same ranking the ships do.
        let order = [];
        let byLoc = {};
        entries.forEach(function(e){
            if (!byLoc.hasOwnProperty(e.dispLoc)){
                byLoc[e.dispLoc] = [];
                order.push(e.dispLoc);
            }
            byLoc[e.dispLoc].push(e);
        });
        order.forEach(function(locationName,group){
            drawShipGroup(list,group,locationName,regionNames,repairYards);
            if (!view.fold[locationName]){
                byLoc[locationName].forEach(function(e){ drawShipRow(list,e.i,e.ship,regionNames); });
            }
        });
    }
    else {
        entries.forEach(function(e){ drawShipRow(list,e.i,e.ship,regionNames); });
    }

    // Hand-ordering moves a ship by its position in the list, which only means anything while the list
    // and the array agree. Filtered, grouped, or with a fleet folded away they do not, so dragging is
    // off until the view is plain and everything is on screen.
    if (view.sys === 'all' && !view.group && !collapsed){
        dragShipList();
    }
}

// The collapsed summary for one location: what is there, without the detail. Bound to the yard so the
// figures track the ships themselves — a hull taking damage or a raid arriving updates the header even
// while the group is shut.
function drawShipGroup(list,g,locationName,regionNames,repairYards){
    let yard = repairYards.includes(locationName)
        ? `<span class="dispatchYard" title="${loc('outer_shipyard_repair_yard')}" aria-label="${loc('outer_shipyard_repair_yard')}">🛠️</span>`
        : ``;
    // The toggle has to be an inner element: Vue treats the element it mounts on as an inert container
    // and never compiles directives written on it.
    let head = $(`<div id="shipGrp${g}" class="shipGroup"></div>`);
    head.append(`<a class="groupFold" @click="fold()" role="button" :aria-expanded="folded() ? 'false' : 'true'"><span class="groupArrow" v-html="arrow()"></span> <span class="name has-text-caution">${regionNames[locationName] || locationName}</span>${yard}</a>`);
    head.append(`<span class="shipStat"><span class="has-text-warning">${loc('outer_shipyard_group_ships')}</span> <span class="pad" v-html="count()"></span></span><wbr>`);
    head.append(`<span class="shipStat"><span class="has-text-warning">${loc('firepower')}</span> <span class="pad" v-html="fire()"></span></span><wbr>`);
    head.append(`<span class="shipStat"><span class="has-text-warning">${loc('crew')}</span> <span class="pad" v-html="crew()"></span></span><wbr>`);
    head.append(`<span class="shipStat" v-show="transit() > 0"><span class="has-text-warning">${loc('outer_shipyard_group_transit')}</span> <span class="pad" v-html="transit()"></span></span><wbr>`);
    list.append(head);

    // Ships of this group, read fresh on every render so the summary cannot go stale.
    let here = function(){
        return global.space.shipyard.ships.filter(function(s){ return (s.inTransit ? s.destination.name : s.location.name) === locationName; });
    };

    // Bound to the view options behind a wrapper key rather than to the yard itself. Vue merges data
    // onto the same instance as methods and data wins, so binding the yard would have let its own
    // `count` (the number of yard structures) shadow the summary's count() and take the render down
    // with it. The figures come from methods reading the reactive global, so they track the ships
    // regardless of what is bound here.
    vBind({
        el: `#shipGrp${g}`,
        data: { v: shipyardView() },
        methods: {
            folded(){
                return shipyardView().fold[locationName] ? true : false;
            },
            arrow(){
                return shipyardView().fold[locationName] ? `&#9656;` : `&#9662;`;
            },
            fold(){
                let fold = shipyardView().fold;
                if (fold[locationName]){ delete fold[locationName]; }
                else { fold[locationName] = true; }
                drawShips();
            },
            count(){
                return here().length;
            },
            fire(){
                return here().reduce(function(t,s){ return t + shipAttackPower(s); },0);
            },
            crew(){
                return here().reduce(function(t,s){ return t + shipCrewSize(s); },0);
            },
            transit(){
                return here().filter(function(s){ return s.inTransit; }).length;
            }
        }
    });
}

function drawShipRow(list,i,ship,regionNames){
    {
        let dispatch = `<button id="ship${i}loc" class="button is-info" @click="pickDest(${i})">
            <span>${regionNames[ship.inTransit ? ship.destination.name : ship.location.name]}</span>
        </button>`;

        // A ship serving under a flagship is indented behind it, so a fleet reads as one block whether
        // or not it is folded.
        let escort = ship.fid && !ship.flag ? ` escort` : ``;

        if (global.space.shipyard.expand){
            let ship_class = `${loc(`outer_shipyard_engine_${ship.engine}`)} ${loc(`outer_shipyard_class_${ship.class}`)}`;
            let desc = $(`<div id="shipReg${i}" class="shipRow ship${i}${escort}"></div>`);
            let row1 = $(`<div class="row1"><span class="name has-text-caution">${ship.name}</span> <span v-show="scrapAllowed(${i})">| </span><a class="scrap${i}" v-show="scrapAllowed(${i})" @click="scrap(${i})" role="button">${loc(`outer_shipyard_scrap`)}</a><a class="fleetFold" v-show="fleetFoldShow(${i})" @click="fleetFold(${i})" role="button" :aria-expanded="fleetFolded(${i}) ? 'false' : 'true'" :aria-label="fleetFoldLabel(${i})"><span class="groupArrow" v-html="fleetArrow(${i})"></span></a><span v-show="fleetTag(${i})" class="flagship" v-html="fleetTag(${i})"></span><span v-show="fleetShow(${i})"> | <a class="fleetToggle" @click="fleetAction(${i})" role="button" v-html="fleetText(${i})"></a></span> | <span class="has-text-warning">${ship_class}</span> | <span class="has-text-danger">${loc(`outer_shipyard_weapon_${ship.weapon}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_power_${ship.power}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_armor_${ship.armor}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_sensor_${ship.sensor}`)}</span></div>`);
            let row2 = $(`<div class="row2"></div>`);
            let row3 = $(`<div class="row3"></div>`);
            let row4 = $(`<div class="location">${dispatch}</div>`);

            row2.append(`<span class="shipStat"><span class="has-text-warning">${loc(`crew`)}</span> <span class="pad" v-html="crewText(${i})"></span></span><wbr>`);
            row2.append(`<span class="shipStat"><span class="has-text-warning">${loc(`firepower`)}</span> <span class="pad" v-html="fireText(${i})"></span></span><wbr>`);
            row2.append(`<span class="shipStat"><span class="has-text-warning">${loc(`outer_shipyard_sensors`)}</span> <span class="pad" v-html="sensorText(${i})"></span></span><wbr>`);
            row2.append(`<span class="shipStat"><span class="has-text-warning">${loc(`speed`)}</span> <span class="pad" v-html="speedText(${i})"></span></span><wbr>`);
            row2.append(`<span class="shipStat"><span class="has-text-warning">${loc(`outer_shipyard_fuel`)}</span> <span class="pad" v-bind:class="{ 'has-text-danger': fuelShort(${i}) }" v-html="fuelText(${i})"></span></span><wbr>`);
            row2.append(`<span class="shipStat" v-show="hullShow(${i})"><span class="has-text-warning">${loc(`outer_shipyard_hull`)}</span> <span class="pad" v-bind:class="hullDamage(${i})" v-html="hullText(${i})"></span></span><wbr>`);

            row3.append(`<span v-show="show(${i})" class="has-text-caution" v-html="dest(${i})"></span>`);
            row3.append(`<span v-show="retShow(${i})" class="shipReturn has-text-info"><span v-html="retText(${i})"></span> <a class="retCancel" @click="retCancel(${i})" role="button">${loc(`outer_shipyard_return_cancel`)}</a></span>`);

            desc.append(row1);
            desc.append(row2);
            desc.append(row3);
            desc.append(row4);
            list.append(desc);
        }
        else {
            let desc = $(`<div id="shipReg${i}" class="shipRow ship${i}${escort} compact"></div>`);
            let row1 = $(`<div class="row1"></div>`);
            let row3 = $(`<div class="row3"></div>`);
            let row4 = $(`<div class="location">${dispatch}</div>`);

            row1.append(`<span class="name has-text-caution">${ship.name}</span><a class="fleetFold" v-show="fleetFoldShow(${i})" @click="fleetFold(${i})" role="button" :aria-expanded="fleetFolded(${i}) ? 'false' : 'true'" :aria-label="fleetFoldLabel(${i})"><span class="groupArrow" v-html="fleetArrow(${i})"></span></a><span v-show="fleetTag(${i})" class="flagship" v-html="fleetTag(${i})"></span><span v-show="fleetShow(${i})"> | <a class="fleetToggle" @click="fleetAction(${i})" role="button" v-html="fleetText(${i})"></a></span> | `);
            row1.append(`<span class="shipStat"><span class="has-text-warning">${loc(`firepower`)}</span> <span class="pad" v-html="fireText(${i})"></span></span><wbr>`);
            row1.append(`<span class="shipStat"><span class="has-text-warning">${loc(`outer_shipyard_sensors`)}</span> <span class="pad" v-html="sensorText(${i})"></span></span><wbr>`);
            row1.append(`<span class="shipStat"><span class="has-text-warning">${loc(`speed`)}</span> <span class="pad" v-html="speedText(${i})"></span></span><wbr>`);
            row1.append(`<span class="shipStat"><span class="has-text-warning">${loc(`outer_shipyard_fuel`)}</span> <span class="pad" v-bind:class="{ 'has-text-danger': fuelShort(${i}) }" v-html="fuelText(${i})"></span></span><wbr>`);
            row1.append(`<span class="shipStat" v-show="hullShow(${i})"><span class="has-text-warning">${loc(`outer_shipyard_hull`)}</span> <span class="pad" v-bind:class="hullDamage(${i})" v-html="hullText(${i})"></span></span><wbr>`);

            row3.append(`<span v-show="show(${i})" class="has-text-caution" v-html="dest(${i})"></span>`);
            row3.append(`<span v-show="retShow(${i})" class="shipReturn has-text-info"><span v-html="retText(${i})"></span> <a class="retCancel" @click="retCancel(${i})" role="button">${loc(`outer_shipyard_return_cancel`)}</a></span>`);

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
                    let s = global.space.shipyard.ships[id];
                    if (this.scrapAllowed(id)){
                        // A flagship being broken up takes its fleet apart with it.
                        leaveFleet(s);
                        global.space.shipyard.ships.splice(id,1);
                        drawShips();
                        updateCosts();
                    }
                },
                // Only at a yard, and only while actually docked there rather than crossing to it.
                scrapAllowed(id){
                    let s = global.space.shipyard.ships[id];
                    return s && !s.inTransit && shipyardLocations.includes(s.location.name) ? true : false;
                },
                // Which fleet a ship belongs to, shown against its name. A flagship reads as the
                // command points it has spent of its rating; anything under one is named for the ship
                // it answers to, which is what tells two fleets in the same orbit apart.
                fleetTag(id){
                    let s = global.space.shipyard.ships[id];
                    if (!global.tech['syard_fleet'] || !s || !s.fid){ return ``; }
                    let flag = shipFlagship(s);
                    if (!flag){ return ``; }
                    let mark = `<span class="flag has-text-caution" title="${loc('outer_shipyard_fleet_flagship')}" aria-label="${loc('outer_shipyard_fleet_flagship')}">⚑</span>`;
                    if (!s.flag){ return `${mark} ${flag.name}`; }
                    let tag = `${mark} ${loc('outer_shipyard_fleet_command',[fleetCommandUsed(s.fid),fleetCommandRating(s)])}`;
                    // Folded, the ships underneath have no rows of their own, so the flagship says how
                    // many are down there rather than leaving them unaccounted for.
                    let hidden = shipyardView().ffold[s.fid] ? fleetEscortCount(s.fid) : 0;
                    return hidden > 0 ? `${tag} <span class="has-text-info">${loc('outer_shipyard_fleet_hidden',[hidden])}</span>` : tag;
                },
                // A fleet folds away like a location does, so only a flagship with something under it
                // carries the toggle.
                fleetFoldShow(id){
                    let s = global.space.shipyard.ships[id];
                    return global.tech['syard_fleet'] && s && s.flag && fleetEscortCount(s.fid) > 0 ? true : false;
                },
                fleetFolded(id){
                    let s = global.space.shipyard.ships[id];
                    return s && s.fid && shipyardView().ffold[s.fid] ? true : false;
                },
                fleetArrow(id){
                    return this.fleetFolded(id) ? `&#9656;` : `&#9662;`;
                },
                fleetFoldLabel(id){
                    let s = global.space.shipyard.ships[id];
                    return loc(this.fleetFolded(id) ? 'outer_shipyard_fleet_expand' : 'outer_shipyard_fleet_collapse',[s ? s.name : ``]);
                },
                fleetFold(id){
                    let s = global.space.shipyard.ships[id];
                    if (!s || !s.fid || !s.flag){ return; }
                    let ffold = shipyardView().ffold;
                    if (ffold[s.fid]){ delete ffold[s.fid]; }
                    else { ffold[s.fid] = true; }
                    drawShips();
                },
                // The link only appears when there is something it could actually do: leave a fleet,
                // stand one down, or put this ship into one. A lone ship with nothing to lead and
                // nothing to join gets no link at all.
                fleetShow(id){
                    let s = global.space.shipyard.ships[id];
                    if (!global.tech['syard_fleet'] || !s || s.inTransit){ return false; }
                    if (s.fid){ return true; }
                    return fleetsFor(s).length > 0 || fleetWorthForming(s);
                },
                fleetText(id){
                    let s = global.space.shipyard.ships[id];
                    if (!s){ return ``; }
                    if (s.flag){ return loc('outer_shipyard_fleet_disband'); }
                    return s.fid ? loc('outer_shipyard_fleet_leave') : loc('outer_shipyard_fleet_join');
                },
                fleetAction(id){
                    let s = global.space.shipyard.ships[id];
                    if (!global.tech['syard_fleet'] || !s || s.inTransit){ return; }
                    // Already flying with someone: the link takes it back out, and does so directly —
                    // there is nothing to choose between.
                    if (s.fid){
                        leaveFleet(s);
                        drawShips();
                        return;
                    }
                    // Otherwise it is a choice of who to serve under, so put it to the player.
                    let modal = this.$buefy.modal.open({
                        hasModalCard: false,
                        content: '<div id="modalBox" class="modalBox"></div>'
                    });

                    let checkExist = setInterval(function(){
                        if ($('#modalBox').length > 0) {
                            clearInterval(checkExist);
                            fleetJoinModal(id, modal);
                        }
                    }, 50);
                },
                pickDest(id){
                    let modal = this.$buefy.modal.open({
                        hasModalCard: false,
                        content: '<div id="modalBox" class="modalBox"></div>'
                    });

                    let checkExist = setInterval(function(){
                        if ($('#modalBox').length > 0) {
                            clearInterval(checkExist);
                            shipDispatchModal(id, modal);
                        }
                    }, 50);
                },
                // Every readout below speaks for whatever rowGroup hands back: the one ship normally,
                // the whole fleet when a folded flagship is standing in for it.
                crewText(id){
                    return rowGroup(global.space.shipyard.ships[id]).reduce((t,s) => t + shipCrewSize(s),0);
                },
                fireText(id){
                    return rowGroup(global.space.shipyard.ships[id]).reduce((t,s) => t + shipAttackPower(s),0);
                },
                // A fleet aims as one body, so what it is worth is the best dish it carries.
                sensorText(id){
                    let group = rowGroup(global.space.shipyard.ships[id]);
                    // Math.max of nothing is -Infinity, and a row can outlive its ship by a frame.
                    if (group.length === 0){ return `0km`; }
                    return Math.max(...group.map(s => sensorRange(s) || 0)) + 'km';
                },
                // A fleet keeps pace with its slowest ship, which is what its trips are planned on.
                speedText(id){
                    let pace = fleetPace(rowGroup(global.space.shipyard.ships[id]));
                    if (!pace){ return `0km/s`; }
                    let speed = (149597870.7/225/24/3600) * shipSpeed(pace);
                    return Math.round(speed) + 'km/s';
                },
                fuelText(id){
                    return groupFuelText(rowGroup(global.space.shipyard.ships[id]));
                },
                // The worst hull in the group: a fleet leaves together or not at all, so that is the
                // one that decides whether it can.
                hullText(id){
                    let group = rowGroup(global.space.shipyard.ships[id]);
                    if (group.length === 0){ return `100%`; }
                    return `${100 - Math.max(...group.map(s => s.damage))}%`;
                },
                // An undamaged hull is the norm and says nothing worth the space, so the readout only
                // appears once a ship has taken damage.
                hullShow(id){
                    return rowGroup(global.space.shipyard.ships[id]).some(s => s.damage > 0);
                },
                // Colorize hull damage at threshold
                hullDamage(id){
                    let group = rowGroup(global.space.shipyard.ships[id]);
                    if (group.length === 0){ return ``; }
                    let damage = Math.max(...group.map(s => s.damage));
                    if (damage <= 10){
                        return `has-text-success`;
                    }
                    else if (damage >= 65){
                        return `has-text-danger`;
                    }
                    else if (group.some(s => !shipSpaceworthy(s))){
                        return `has-text-caution`;
                    }
                    return ``;
                },
                // A fleet is only as fuelled as its worst-off ship — one dry hull holds up the group.
                fuelShort(id){
                    return rowGroup(global.space.shipyard.ships[id]).some(s => !s.fueled);
                },
                dest(id){
                    let s = global.space.shipyard.ships[id];
                    let name = s.class === 'explorer' ? loc('tech_era_tauceti') : regionNames[s.destination.name];
                    return loc(`outer_shipyard_arrive`,[
                        name,
                        // (Total time) minus (time already traversed on current step)
                        s.inTransit ? Math.round(s.totalTime - (s.path[0].totalTime - s.timeToNextStep)) : 0
                    ]);
                },
                show(id){
                    return global.space.shipyard.ships[id].inTransit;
                },
                // A ship pulled out of the line for repairs remembers where it was posted. Say so, and
                // let the player call the arrangement off without having to re-order the ship by hand.
                retShow(id){
                    let s = global.space.shipyard.ships[id];
                    return s && s['ret'] ? true : false;
                },
                retText(id){
                    let s = global.space.shipyard.ships[id];
                    return s && s['ret'] ? loc('outer_shipyard_return',[regionNames[s.ret] || s.ret]) : '';
                },
                retCancel(id){
                    let s = global.space.shipyard.ships[id];
                    if (s && s['ret']){
                        delete s.ret;
                        // Calling off the return calls off the rejoin with it — the ship is staying put.
                        if (s['rfid']){ delete s.rfid; }
                        drawShips();
                    }
                }
            }
        });

    }
}

// The first Tau Ceti soldier building (marine barracks / womling rangers) re-enables the soldier
// options on the civics government tab, which are otherwise hidden once isolation is reached.
function tauEnableSoldiers(){
    if (!global.tech['tau_soldiers']){
        global.tech['tau_soldiers'] = 1;
        global.settings.showMil = true;
        if (!global.settings.msgFilters.combat.unlocked){
            global.settings.msgFilters.combat.unlocked = true;
            global.settings.msgFilters.combat.vis = true;
        }
        if (!global.civic.garrison.display){
            global.civic.garrison.display = true;
        }
        buildGarrison($('#garrison'),true);
        buildGarrison($('#c_garrison'),false);
    }
}

// Take a `ship` and send it on its merry way to `locationName`
function initializeShipTrip(ship, locationName, trip){
    // If a trip is already calculated then use that trip (for example when sending 
    // a fleet to account for its slower speed). Otherwise calculate steps for new path.
    let plannedTrip;
    if (trip)
        plannedTrip = trip;
    else 
        plannedTrip = planShipTrip(ship, locationName);

    // We're already at the target location, or the location is unavailable (for any possible reason)
    if (!plannedTrip)
        return;

    ship.path = plannedTrip.path;
    ship.totalTime = plannedTrip.totalTime;

    // Origin
    if (!ship.inTransit){
        // For a stationary ship lauching off - the location it was at before
        ship.origin = deepClone(ship.location);
    }
    else if (!ship.path[0].inGate){
        // For a ship travelling outside of a gate - just the xyz location it was at when changing course
        ship.origin = {
            position: deepClone(ship.location.position),
            name: ""
        }
    }
    else {
        // A ship travelling inside a gate must first leave it before being able to change course.
        // The first path step is unchanged, so origin stays as it was.
    }

    // Final destination. Landing point calculated in planShipTrip
    ship.destination.name = locationName;
    ship.destination.position = ship.path[ship.path.length - 1].destination.position;

    // First step
    ship.timeToNextStep = ship.path[0].totalTime;

    // Liftoff
    ship.inTransit = true;
}
// How far along its orbit a body has moved after `days`, in degrees. Matches the rate the position
// update in main.js advances at: it runs on the mid loop, five of which make a game day, so its
// 72/orbit per tick is 360/orbit per day — one full circuit in exactly `orbit` days.
function orbitDegrees(id, days){
    let orbit = spacePlanetStats[id].orbit === -1 ? orbitLength() : spacePlanetStats[id].orbit;
    let now = global.space.position[id] || 0;
    if (!(orbit > 0)){ return now; }
    return (now + days * (360 / orbit)) % 360;
}

// Where a body will actually be `days` from now — a plain projection along the orbits it already
// travels, for use where the arrival time is known rather than being solved for.
//
// A moon gets both of its motions: its planet carried around the star, and itself carried around the
// planet. The planet's is much the larger of the two — a moon out at Saturn is swept far further by
// its primary than it ever travels on its own — but its own circuit is quick enough to put it on the
// far side of its planet during a long approach, so neither can be dropped.
function bodyPointAt(locationName, days){
    // Temporary coordinates are fixed points in space, and stars do not orbit anything.
    if (tempCoord(locationName) || !spacePlanetStats[locationName]){ return genXYZcoord(locationName); }
    let body = spacePlanetStats[locationName];
    if (body.startype){ return genXYZcoord(locationName); }
    if (body.parent){
        let planetPt = orbitPoint(body.parent, orbitDegrees(body.parent, days));
        // orbitPoint anchors a moon's circle to wherever its planet is *now*, so take the bare
        // offset and carry it to where the planet will have got to.
        let offset = rel(orbitPoint(locationName, orbitDegrees(locationName, days)), genXYZcoord(body.parent));
        return { x: planetPt.x + offset.x, y: planetPt.y + offset.y, z: planetPt.z + offset.z };
    }
    return orbitPoint(locationName, orbitDegrees(locationName, days));
}

// Passes used to settle a moon intercept, and how close in days counts as settled. Each pass re-aims
// at where the moon will be given the current flight-time estimate; two or three close it at any
// speed the game produces, and the cap stops a pathologically slow ship spinning here.
const MOON_INTERCEPT_STEPS = 8;
const MOON_INTERCEPT_TOL = 1e-4;

// Where to aim a ship so it meets `planet` rather than where it used to be. `elapsed` is time the
// ship has already committed to before this leg starts — the run to a wormhole and the jump through
// it — which the target keeps moving during.
function calcLandingPoint(startingPosition, planet, speed, elapsed) {
    elapsed = elapsed || 0;
    // A temp point sits still, so there is no orbit to lead — the landing point is the point itself.
    if (tempCoord(planet) || !spacePlanetStats[planet]) { return genXYZcoord(planet); }
    if (spacePlanetStats[planet].startype) { return genXYZcoord(planet); }
    // A moon is solved for directly rather than through the crossing arithmetic below, which
    // measures a body's orbital radius against the ship's distance from the system centre — for a
    // moon that would pit a 0.01 AU circle against a crossing several AU wide and never land on
    // anything sensible.
    //
    // Where the moon is depends on when the ship arrives, and when the ship arrives depends on where
    // the moon is, so the two are settled together: start from the flight time to where it stands
    // now, then re-aim until the answer stops moving.
    if (spacePlanetStats[planet].parent) {
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
    // Mirror genXYZcoord so the orbit center and eccentricity match the body's actual
    // rendered position; otherwise a ship already in Tau Ceti has its landing point
    // computed back near the home sun, producing a bogus multi-star transit distance.
    let star = spacePlanetStats[planet].star ? genXYZcoord(spacePlanetStats[planet].star) : { x: 0, y: 0, z: 0 };
    // The band the orbit sweeps out, as radii from the ellipse's own centre: the semi-minor axis at
    // its narrowest and the semi-major at its widest. A body around another star still rides the
    // stretched circle that branch of orbitPoint draws, so its bounds are taken the same way.
    let semiMajor, semiMinor, center_x;
    if (spacePlanetStats[planet].star){
        semiMajor = spacePlanetStats[planet].dist * 1.2;
        semiMinor = spacePlanetStats[planet].dist;
        center_x = star.x + spacePlanetStats[planet].dist / 3;
    }
    else {
        let ecc = orbitEcc(planet);
        semiMajor = spacePlanetStats[planet].dist;
        semiMinor = semiMajor * Math.sqrt(1 - ecc * ecc);
        // The Sun sits at a focus, so the ellipse's centre is one focal distance off it, toward
        // apoapsis (the -x side, since periapsis is drawn at +x).
        center_x = star.x - semiMajor * ecc;
    }
    let center_y = star.y;
    // Inclination tilts the orbit about its centre, so a body's distance from that centre is
    // unchanged and the crossing-window arithmetic below still holds in three dimensions.
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
    let planet_orbit = spacePlanetStats[planet].orbit === -1
      ? orbitLength()
      : spacePlanetStats[planet].orbit;
    let planet_speed = 360 / planet_orbit;
    // `i` counts flight days from where the ship is now, but the planet has also been moving through
    // whatever the ship spent getting here, so the angle is wound by elapsed as well.
    let planet_degree = (global.space.position[planet] + ((elapsed + cross1_days) * planet_speed)) % 360;
    for (let i = cross1_days; i <= cross2_days; i++) {
        // orbitPoint rather than open-coded trig, so the landing point is on the same 3D orbit the
        // body travels and the map draws.
        let pt = orbitPoint(planet, planet_degree);
        if (dist3(startingPosition, pt) / speed <= i) {
            return pt;
        }
        planet_degree = (planet_degree + planet_speed) % 360;
    }
    return genXYZcoord(planet);
}

export function syndicate(region,extra){
    if (!global.tech['isolation'] && global.tech['syndicate'] && global.race['truepath'] && global.space['syndicate'] && global.space.syndicate.hasOwnProperty(region)){
        let divisor = 1000;

        let rival = 0;
        if (global.civic.foreign.gov3.hstl < 10){
            rival = 250 - (25 * global.civic.foreign.gov3.hstl);
        }
        else if (global.civic.foreign.gov3.hstl > 60){
            rival = (-13 * (global.civic.foreign.gov3.hstl - 60));
        }

        switch (region){
            case 'spc_home':
            case 'spc_moon':
            case 'spc_red':
            case 'spc_hell':
                divisor = 1250 + rival;
                break;
            case 'spc_gas':
            case 'spc_gas_moon':
            case 'spc_belt':
                divisor = 1020 + rival;
                break;
            case 'spc_titan':
            case 'spc_enceladus':
                divisor = actions.space[region].info.syndicate_cap();
                break;
            case 'spc_triton':
            case 'spc_makemake':
            case 'spc_eris':
                divisor = actions.space[region].info.syndicate_cap();
                break;
        }

        let piracy = global.space.syndicate[region];
        if (global.race['chicken']){
            piracy *= 1 + (traits.chicken.vars()[1] / 100);
            piracy = Math.round(piracy);
        }
        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.f){
            piracy *= 1 - (traits.ocular_power.vars()[1] / 500);
            piracy = Math.round(piracy);
        }
        let patrol = 0;
        let sensor = 0;
        let overkill = 0;
        if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
            global.space.shipyard.ships.forEach(function(ship){
                if (!ship.inTransit && ship.location.name === region && ship.fueled){
                    let rating = shipAttackPower(ship);
                    patrol += ship.damage > 0 ? Math.round(rating * (100 - ship.damage) / 100) : rating;
                    sensor += sensorRange(ship);
                }
            });

            if (region === 'spc_enceladus' && Math.min(support_on['operating_base'],p_on['operating_base']) > 0){
                let active = Math.min(support_on['operating_base'],p_on['operating_base']);
                patrol += active * 50;
            }
            else if (region === 'spc_titan' && p_on['sam'] > 0){
                patrol += p_on['sam'] * 25;
            }
            else if (region === 'spc_triton' && p_on['fob'] > 0){
                patrol += 500;
                sensor += 10;
            }

            if (sensor > 100){
                sensor = Math.round((sensor - 100) / ((sensor - 100) + 200) * 100) + 100;
            }

            patrol = Math.round(patrol * ((sensor + 25) / 125));
            if (patrol > piracy){
                overkill = patrol - piracy;
            }
            piracy = piracy - patrol > 0 ? piracy - patrol : 0;
        }

        if (extra){
            return {
                p: 1 - +(piracy / divisor).toFixed(4),
                r: piracy,
                s: sensor,
                o: overkill,
            };
        }
        return 1 - +(piracy / divisor).toFixed(4);
    }

    if (extra){
        return { p: 1, r: 0, s: 0, o: 0 };
    }
    return 1;
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
            hf = 1.5;
            break;
        case 'explorer':
            hf = 5;
            break;
        default:
            hf = 1;
            break;
    }
    switch (s.sensor){
        case 'visual':
            return 1;
        case 'radar':
            return 10 * hf;
        case 'lidar':
            return 18 * hf;
        case 'quantum':
            return 32 * hf;
    }
}

export function tritonWar(){
    if (global.space['fob']){
        if (global.space.fob.enemy <= 1000){
            let upper = global.tech['outer'] && global.tech.outer >= 4 ? 125 : 100;
            global.space.fob.enemy += Math.rand(25,upper);
        }

        let wound_cap = Math.ceil(jobScale(global.space.fob.enemy) / 5);

        let wounded = global.civic.garrison.wounded - garrisonSize();
        if (wounded < 0){ wounded = 0; }
        let defense = armyRating(global.space.fob.troops,'army',wounded);

        let died = Math.rand(0,wounded + 1);
        soldierDeath(died);
        global.civic.garrison.wounded -= died;

        let kills = Math.min(Math.rand(0,defense),global.space.fob.enemy);
        global.space.fob.enemy -= kills;
        if (global.space.fob.enemy < 0){
            global.space.fob.enemy = 0; 
        }

        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p){
            global.race.ocularPowerConfig.ds += Math.round(kills * traits.ocular_power.vars()[1]);
        }

        let hurt = Math.rand(0,global.space.fob.troops + 1);
        if (hurt > wound_cap){ hurt = wound_cap; }
        if (global.race['armored']){ hurt -= jobScale(1); }
        if (global.race['scales']){ hurt -= jobScale(1); }
        if (global.tech['armor']){ hurt -= jobScale(global.tech['armor']); }
        if (hurt < 0){ hurt = 0; }

        if (global.race['revive'] && died > 0){
            let revive = Math.round(Math.rand(0,died + 1));
            global.civic.garrison.workers += revive;
        }

        global.civic.garrison.wounded += hurt;
        if (global.civic.garrison.wounded > garrisonSize(false,{nofob: true})){
            global.civic.garrison.wounded = garrisonSize(false,{nofob: true});
        }

        {
            let wounded = global.civic.garrison.wounded - garrisonSize();
            if (wounded < 0){ wounded = 0; }
            let danger = global.space.fob.enemy - armyRating(global.space.fob.troops,'army',wounded);
            if (danger <= 0 && global.space.crashed_ship.count < 100){
                global.space.crashed_ship.count++;
            }
            else if (danger > 0 && global.space.crashed_ship.count > 0){
                global.space.crashed_ship.count--;
            }
            if (global.space.crashed_ship.count === 100){
                global.resource.Cipher.display = true;
            }
        }
    }
}

export function erisWar(){
    if (global.space['digsite']){
        if (global.space.digsite.enemy <= 10000){
            let upper = 250;
            global.space.digsite.enemy += Math.rand(25,upper);
        }

        let offense = armyRating(support_on['shock_trooper'],'army',0);
        if (support_on['tank']){
            offense += support_on['tank'] * 100;
        }
        offense *= syndicate('spc_eris');

        global.space.digsite.enemy -= Math.rand(0,offense);
        if (global.space.digsite.enemy < 0){ global.space.digsite.enemy = 0; }
        else if (global.space.digsite.enemy > 10000){ global.space.digsite.enemy = 10000; }

        global.space.digsite.count = Math.floor(100 - global.space.digsite.enemy / 100);
    }
}

// Stars (entries with a `startype`) are placed by fixed x,y,z coordinates — in AU, measured from the
// Sun at the origin — rather than by a distance + orbital angle. They therefore need no
// global.space.position entry and never move. `dist` is retained for reference/UI only.
//
// Star coordinates are real. Each was built from its galactic longitude and latitude and its
// parallax, as published by SIMBAD (CDS) — mostly Gaia DR3, with Hipparcos-2 for the bright stars —
// through the standard galactic Cartesian convention:
//
//   x = d cos(b) cos(l)   toward the galactic centre
//   y = d cos(b) sin(l)   toward the direction of galactic rotation
//   z = d sin(b)          toward the north galactic pole
//
// with d = 206264.806 / parallax_in_arcsec AU. `dist` is that same distance, so it is now the true
// distance from the Sun for every star, and separations between stars are true as well.
//
// Close companions take their PRIMARY's parallax and keep their own l and b. Component parallaxes
// disagree by far more than a tight pair is wide — Sirius A and B differ by 4.7 mas, some 6800 AU of
// radial error on a pair about 20 AU apart — so giving each component its own distance would fling
// binaries apart. Angular separations are sound, so this reproduces the real projected separation at
// the right distance; the results check out against the published orbits (Alpha Centauri A-B 22 AU,
// Epsilon Indi A-B 1464 AU, Gliese 570 A-D 1541 AU). Proxima is the exception and keeps its own
// parallax: it is a genuinely wide companion 14000 AU out, where the difference is real.
//
// `inc` is an orbital inclination in degrees, tilting a body's orbit about the line of nodes (the x
// axis). It keeps the orbit the same size and every point on it the same distance from the primary,
// so it adds height without disturbing orbital radii. Bodies without one get a small deterministic
// tilt (see orbitIncline) so the decorative systems have depth too. Values here follow the real
// solar system, with the reference plane on the home world.
export const spacePlanetStats = {
    spc_sun: { x: 0, y: 0, z: 0, dist: 0, orbit: 0, size: 2, startype: 'G', label: loc('star_sun'), zlabel: loc('star_sun') },
    // `gate` draws it on the solar map as an open ring rather than a world (see drawGate).
    // An artificial structure still has to obey Kepler: 60 days is the period of anything at 0.3 AU.
    spc_sun_gate: { dist: 0.3, orbit: 60, size: 0.1, belt: true, gate: true, inc: 0, ecc: 0 },
    spc_home: { dist: 1, orbit: -1, size: 0.191, hz: true, inc: 0, ecc: 0.0167 },
    spc_moon: { dist: 0.00257, orbit: 27.32, size: 0.1, moon: true, parent: 'spc_home', inc: 5.14 },
    spc_red: { dist: 1.524, orbit: 687, size: 0.14, hz: true, inc: 1.85, ecc: 0.0934 },
    spc_hell: { dist: 0.387098, orbit: 88, size: 0.118, inc: 7, ecc: 0.2056 },
    spc_venus: { dist: 0.723332, orbit: 225, size: 0.187, inc: 3.4, ecc: 0.0068 },
    spc_gas: { dist: 5.203, orbit: 4330, size: 0.634, inc: 1.3, ecc: 0.0489 },
    // The Galilean moons, in order out from Jupiter.
    spc_io: { dist: 0.002819, orbit: 1.769, size: 0.102, moon: true, parent: 'spc_gas', inc: 1.35 },
    spc_europa: { dist: 0.004486, orbit: 3.551, size: 0.095, moon: true, parent: 'spc_gas', inc: 1.77 },
    spc_gas_moon: { dist: 0.007155, orbit: 7.155, size: 0.123, moon: true, parent: 'spc_gas', inc: 1.5 },
    spc_callisto: { dist: 0.012585, orbit: 16.689, size: 0.118, moon: true, parent: 'spc_gas', inc: 1.49 },
    // The belt stands for a population rather than a body, so its distance, period and eccentricity
    // are representative of the main belt rather than of any one rock.
    spc_belt: { dist: 2.7, orbit: 1620, size: 0.054, belt: true, inc: 10, ecc: 0.08 },
    spc_dwarf: { dist: 2.77, orbit: 1682, size: 0.052, inc: 10.6, ecc: 0.0785 },
    spc_saturn: { dist: 9.539, orbit: 10751, size: 0.579, inc: 2.5, rings: true, ecc: 0.0565 },
    // Saturn's moons ride its equatorial plane, which its axial tilt carries some 27 degrees off the reference plane — the same plane the rings sit in.
    spc_titan: { dist: 0.008168, orbit: 15.945, size: 0.122, moon: true, parent: 'spc_saturn', inc: 27 },
    spc_enceladus: { dist: 0.001591, orbit: 1.37, size: 0.038, moon: true, parent: 'spc_saturn', inc: 27 },
    spc_uranus: { dist: 19.2184, orbit: 30660, size: 0.382, inc: 0.77, ecc: 0.0457 },
    // Uranus's two largest moons. They ride its equatorial plane, and Uranus is tipped on its side 
    spc_titania: { dist: 0.0029139, orbit: 8.7062, size: 0.067, moon: true, parent: 'spc_uranus', inc: 97.8 },
    spc_oberon: { dist: 0.0039006, orbit: 13.4632, size: 0.066, moon: true, parent: 'spc_uranus', inc: 97.8 },
    spc_neptune: { dist: 30.08, orbit: 60152, size: 0.376, inc: 1.77, ecc: 0.0086 },
    // Triton is retrograde and steeply inclined — the one moon here whose orbit is nothing like its planet's plane.
    spc_triton: { dist: 0.002371, orbit: 5.877, size: 0.088, moon: true, parent: 'spc_neptune', inc: 130 },
    // The dwarf planets of the Kuiper belt.
    spc_pluto: { dist: 39.482, orbit: 90560, size: 0.083, inc: 17.16, ecc: 0.2488 },
    spc_haumea: { dist: 43.116, orbit: 103775, size: 0.067, inc: 28.21, ecc: 0.195 },
    spc_makemake: { dist: 45.43, orbit: 111843, size: 0.064, inc: 28.98, ecc: 0.161 },
    spc_eris: { dist: 68, orbit: 204060, size: 0.082, inc: 44, ecc: 0.436 },
    // Tau Ceti system. Planets orbit the tauceti star (star: 'tauceti') rather than the Sun,
    // Tau Ceti (G-type): 753,314.5 AU from the Sun (11.91 ly).
    tauceti: { x: -213157.815, y: 25792.379, z: -722067.292, dist: 753314.5, orbit: -2, size: 1.778, startype: 'G', label: loc('star_tauceti'), zlabel: loc('star_tauceti') },
    tau_home: { dist: 0.5, orbit: 129, size: 0.296, star: 'tauceti', unlock: 'tau_home', hz: true, inc: 0 },
    tau_red: { dist: 1.24, orbit: 504, size: 0.234, star: 'tauceti', unlock: 'tau_red', hz: true, inc: 2.2 },
    tau_gas: { dist: 5.6, orbit: 4839, size: 0.635, star: 'tauceti', unlock: 'tau_gas', inc: 1.5 },
    tau_gas2: { dist: 8.2, orbit: 8576, size: 0.574, star: 'tauceti', unlock: 'tau_gas2', inc: 2.8 },
    tau_roid: { dist: 15, orbit: 21217, size: 0.234, star: 'tauceti', belt: true, unlock: 'tau_roid', inc: 9 },
    // Epsilon Eridani (K-type): 664,133.6 AU from the Sun (10.50 ly).
    eridani: { x: -427082.379, y: -121211.607, z: -493945.105, dist: 664133.6, orbit: -2, size: 1.72, startype: 'K', label: loc('star_eridani'), zlabel: loc('star_eridani') },
    // eridani planets (K-type, 3, habitable-zone planet at ~0.5 AU)
    eridani_p1: { dist: 0.27, orbit: 61, size: 0.234, star: 'eridani' },
    eridani_p2: { dist: 0.35, orbit: 90, size: 0.191, star: 'eridani' },
    eridani_p3: { dist: 0.5, orbit: 154, size: 0.234, star: 'eridani', hz: true },
    // Gliese 65 (M-type): 560,941.3 AU from the Sun (8.87 ly).
    // The map carried only BL Cet; UV Cet joins it below, so this is component A now.
    gliese65: { x: -138124.928, y: 10901.934, z: -543560.337, dist: 560941.3, orbit: -2, size: 0.894, startype: 'M', label: loc('star_gliese65'), zlabel: loc('star_gliese65') + ' A' },
    // gliese65 planets (M-type, 3, one in the habitable zone)
    gliese65_p1: { dist: 0.18, orbit: 51, size: 0.191, star: 'gliese65', hz: true },
    gliese65_p2: { dist: 0.62, orbit: 326, size: 0.191, star: 'gliese65' },
    // YZ Ceti (M-type): 766,620.4 AU from the Sun (12.12 ly).
    yzceti: { x: -129026.649, y: 75381.207, z: -751915.278, dist: 766620.4, orbit: -2, size: 1.02, startype: 'M', label: loc('star_yzceti'), zlabel: loc('star_yzceti') },
    // yzceti planets (M-type, 3, none habitable)
    yzceti_p1: { dist: 0.38, orbit: 156, size: 0.234, star: 'yzceti' },
    yzceti_p2: { dist: 0.7, orbit: 391, size: 0.142, star: 'yzceti' },
    yzceti_p3: { dist: 1.12, orbit: 790, size: 0.191, star: 'yzceti' },
    // Alpha Centauri A (G-type): 277,940 AU from the Sun (4.39 ly).
    alphacentauri: { x: 199021.346, y: -193985.2, z: -3296.913, dist: 277940, orbit: -2, size: 2.209, startype: 'G', label: loc('star_alpha_centauri'), zlabel: loc('star_alpha_centauri') + ' A' },
    // alphacentauri planets (G-type, 3, habitable-zone planet at ~1 AU)
    alphacentauri_p1: { dist: 1, orbit: 365, size: 0.296, star: 'alphacentauri', hz: true },
    alphacentauri_p2: { dist: 1.6, orbit: 739, size: 0.296, star: 'alphacentauri' },
    alphacentauri_p3: { dist: 2.8, orbit: 1711, size: 0.635, star: 'alphacentauri' },
    // Alpha Centauri B (K-type): companion, 22.2 AU from Alpha Centauri A.
    alphacentaurib: { x: 199007.422, y: -193999.315, z: -3306.891, dist: 277940, orbit: -2, size: 1.855, startype: 'K', zlabel: loc('star_alpha_centauri') + ' B' },
    // alphacentaurib planets (K-type, 4, habitable-zone planet at ~0.5 AU)
    alphacentaurib_p1: { dist: 0.35, orbit: 90, size: 0.191, star: 'alphacentaurib' },
    alphacentaurib_p2: { dist: 0.5, orbit: 154, size: 0.234, star: 'alphacentaurib', hz: true },
    alphacentaurib_p3: { dist: 0.8, orbit: 312, size: 0.296, star: 'alphacentaurib' },
    alphacentaurib_p4: { dist: 1.4, orbit: 723, size: 0.574, star: 'alphacentaurib' },
    // Proxima Centauri (M-type): companion, 14,024.7 AU from Alpha Centauri A.
    proximacentauri: { x: 186242.736, y: -193265.541, z: -9031.026, dist: 268550.7, orbit: -2, size: 0.785, startype: 'M', zlabel: loc('star_proxima_centauri') },
    // proximacentauri planets (M-type, 1, none habitable)
    proximacentauri_p1: { dist: 0.35, orbit: 138, size: 0.142, star: 'proximacentauri' },
    // Barnard's Star (M-type): 377,100.4 AU from the Sun (5.96 ly).
    barnardsstar: { x: 313522.226, y: 188447.979, z: 91628.876, dist: 377100.4, orbit: -2, size: 0.885, startype: 'M', label: loc('star_barnards_star'), zlabel: loc('star_barnards_star') },
    // barnardsstar planets (M-type, 3, one in the habitable zone)
    barnardsstar_p1: { dist: 0.24, orbit: 78, size: 0.191, star: 'barnardsstar', hz: true },
    barnardsstar_p2: { dist: 0.45, orbit: 201, size: 0.191, star: 'barnardsstar' },
    barnardsstar_p3: { dist: 0.86, orbit: 532, size: 0.142, star: 'barnardsstar' },
    // Sirius A (A-type): 543,932.9 AU from the Sun (8.60 ly).
    sirius: { x: -364922.001, y: -394498.07, z: -84060.919, dist: 543932.9, orbit: -2, size: 2.615, startype: 'A', label: loc('star_sirius'), zlabel: loc('star_sirius') + ' A' },
    // sirius planets (A-type, 5, habitable-zone planet at ~4.5 AU)
    sirius_p1: { dist: 3.15, orbit: 1444, size: 0.191, star: 'sirius' },
    sirius_p2: { dist: 4.5, orbit: 2465, size: 0.296, star: 'sirius', hz: true },
    sirius_p3: { dist: 7.2, orbit: 4990, size: 0.296, star: 'sirius' },
    // Sirius B (D-type): companion, 16.3 AU from Sirius A.
    siriusb: { x: -364913.661, y: -394507.91, z: -84050.947, dist: 543932.9, orbit: -2, size: 0.183, startype: 'D', zlabel: loc('star_sirius') + ' B' },
    // siriusb planets (D-type, 1, none habitable). Kept at 0.8 AU — comfortably inside the 16.3 AU
    // to Sirius A, so it stays a plausible circumstellar orbit rather than crossing the companion.
    // A white dwarf's habitable zone sits hundredths of an AU out, far inside this, so it is cold.
    // Period from the same Kepler relation as the other systems, on Sirius B's ~1.02 solar masses.
    siriusb_p1: { dist: 0.8, orbit: 259, size: 0.191, star: 'siriusb' },
    // Procyon A (F-type): 724,855.2 AU from the Sun (11.46 ly).
    procyon: { x: -587528.977, y: -391866.327, z: 163296.042, dist: 724855.2, orbit: -2, size: 2.864, startype: 'F', label: loc('star_procyon'), zlabel: loc('star_procyon') + ' A' },
    // procyon planets (F-type, 5, habitable-zone planet at ~1.9 AU)
    procyon_p1: { dist: 1.33, orbit: 491, size: 0.191, star: 'procyon' },
    procyon_p2: { dist: 1.9, orbit: 839, size: 0.234, star: 'procyon', hz: true },
    procyon_p3: { dist: 3.04, orbit: 1698, size: 0.428, star: 'procyon' },
    procyon_p4: { dist: 5.32, orbit: 3931, size: 0.635, star: 'procyon' },
    procyon_p5: { dist: 9.5, orbit: 9380, size: 0.635, star: 'procyon' },
    // Procyon B (D-type): companion, 16.8 AU from Procyon A.
    procyonb: { x: -587529.648, y: -391871.902, z: 163280.248, dist: 724855.2, orbit: -2, size: 0.219, startype: 'D', zlabel: loc('star_procyon') + ' B' },
    // Wolf 359 (M-type): 496,808.9 AU from the Sun (7.86 ly).
    wolf359: { x: -121170.806, y: -249036.778, z: 412452.866, dist: 496808.9, orbit: -2, size: 0.759, startype: 'M', label: loc('star_wolf359'), zlabel: loc('star_wolf359') },
    // wolf359 planets (M-type, 1, one in the habitable zone)
    wolf359_p1: { dist: 0.22, orbit: 69, size: 0.234, star: 'wolf359', hz: true },
    // Ross 128 (M-type): 696,122.6 AU from the Sun (11.01 ly).
    ross128: { x: 905.425, y: -352688.658, z: 600163.744, dist: 696122.6, orbit: -2, size: 0.888, startype: 'M', label: loc('star_ross128'), zlabel: loc('star_ross128') },
    // ross128 planets (M-type, 2, none habitable)
    ross128_p1: { dist: 0.4, orbit: 169, size: 0.191, star: 'ross128' },
    ross128_p2: { dist: 0.76, orbit: 442, size: 0.142, star: 'ross128' },
    // 61 Cygni A (K-type): 721,218.5 AU from the Sun (11.40 ly).
    cygni: { x: 95890.548, y: 711066.78, z: -73110.388, dist: 721218.5, orbit: -2, size: 1.631, startype: 'K', label: loc('star_61cygni'), zlabel: loc('star_61cygni') + ' A' },
    // cygni planets (K-type, 2, habitable-zone planet at ~0.5 AU)
    cygni_p1: { dist: 0.5, orbit: 154, size: 0.234, star: 'cygni', hz: true },
    cygni_p2: { dist: 0.8, orbit: 312, size: 0.428, star: 'cygni' },
    // 61 Cygni B (K-type): companion, 107.5 AU from 61 Cygni A.
    cygnib: { x: 95921.541, y: 711052.121, z: -73212.235, dist: 721218.5, orbit: -2, size: 1.543, startype: 'K', zlabel: loc('star_61cygni') + ' B' },
    // cygnib planets (K-type, 4, habitable-zone planet at ~0.5 AU)
    cygnib_p1: { dist: 0.25, orbit: 55, size: 0.191, star: 'cygnib' },
    cygnib_p2: { dist: 0.35, orbit: 90, size: 0.234, star: 'cygnib' },
    cygnib_p3: { dist: 0.5, orbit: 154, size: 0.296, star: 'cygnib', hz: true },
    cygnib_p4: { dist: 0.8, orbit: 312, size: 0.296, star: 'cygnib' },
    // Sigma Draconis (K-type): 1,188,887.9 AU from the Sun (18.80 ly).
    sigmadraconis: { x: -216244.617, y: 1081871.754, z: 442996.974, dist: 1188887.9, orbit: -2, size: 1.766, startype: 'K', label: loc('star_sigma_draconis'), zlabel: loc('star_sigma_draconis') },
    // sigmadraconis planets (K-type, 2, habitable-zone planet at ~0.5 AU)
    sigmadraconis_p1: { dist: 0.35, orbit: 90, size: 0.234, star: 'sigmadraconis' },
    sigmadraconis_p2: { dist: 0.5, orbit: 154, size: 0.234, star: 'sigmadraconis', hz: true },
    // Altair (A-type): 1,058,039.5 AU from the Sun (16.73 ly).
    altair: { x: 702887.087, y: 773658.946, z: -163857.331, dist: 1058039.5, orbit: -2, size: 2.676, startype: 'A', label: loc('star_altair'), zlabel: loc('star_altair') },
    // altair planets (A-type, 5, habitable-zone planet at ~4.5 AU)
    altair_p1: { dist: 3.15, orbit: 1444, size: 0.234, star: 'altair' },
    altair_p2: { dist: 4.5, orbit: 2465, size: 0.296, star: 'altair', hz: true },
    altair_p3: { dist: 7.2, orbit: 4990, size: 0.296, star: 'altair' },
    altair_p4: { dist: 12.6, orbit: 11551, size: 0.574, star: 'altair' },
    altair_p5: { dist: 22.5, orbit: 27564, size: 0.635, star: 'altair' },
    // Kapteyn's Star (M-type): 811,431.7 AU from the Sun (12.83 ly).
    kapteynsstar: { x: -218783.221, y: -618913.395, z: -476971.217, dist: 811431.7, orbit: -2, size: 1.079, startype: 'M', label: loc('star_kapteyns_star'), zlabel: loc('star_kapteyns_star') },
    // kapteynsstar planets (M-type, 1, one in the habitable zone)
    kapteynsstar_p1: { dist: 0.2, orbit: 60, size: 0.142, star: 'kapteynsstar', hz: true },
    // Teegarden's Star (M-type): 790,321.7 AU from the Sun (12.50 ly).
    teegardensstar: { x: -593895.814, y: 213075.04, z: -475915.162, dist: 790321.7, orbit: -2, size: 0.775, startype: 'M', label: loc('star_teegardens_star'), zlabel: loc('star_teegardens_star') },
    // teegardensstar planets (M-type, 1, one in the habitable zone)
    teegardensstar_p1: { dist: 0.23, orbit: 74, size: 0.191, star: 'teegardensstar', hz: true },
    // TZ Arietis (M-type): 921,927.6 AU from the Sun (14.58 ly).
    tzarietis: { x: -536255.491, y: 339547.226, z: -668646.616, dist: 921927.6, orbit: -2, size: 1.02, startype: 'M', label: loc('star_tz_arietis'), zlabel: loc('star_tz_arietis') },
    // tzarietis planets (M-type, 1, none habitable — the real TZ Arietis b orbits far inside the zone)
    tzarietis_p1: { dist: 0.29, orbit: 104, size: 0.191, star: 'tzarietis' },
    // Eta Cassiopeiae A (G-type): 1,221,714.9 AU from the Sun (19.32 ly).
    etacassiopeiae: { x: -656022.661, y: 1025003.755, z: -107651.061, dist: 1221714.9, orbit: -2, size: 2.04, startype: 'G', label: loc('star_eta_cassiopeiae'), zlabel: loc('star_eta_cassiopeiae') + ' A' },
    // etacassiopeiae planets (G-type, 4, habitable-zone planet at ~1 AU)
    etacassiopeiae_p1: { dist: 0.7, orbit: 214, size: 0.191, star: 'etacassiopeiae' },
    etacassiopeiae_p2: { dist: 1, orbit: 365, size: 0.234, star: 'etacassiopeiae', hz: true },
    etacassiopeiae_p3: { dist: 1.6, orbit: 739, size: 0.428, star: 'etacassiopeiae' },
    etacassiopeiae_p4: { dist: 2.8, orbit: 1711, size: 0.635, star: 'etacassiopeiae' },
    // Eta Cassiopeiae B (K-type): companion, 76.9 AU from Eta Cassiopeiae A.
    etacassiopeiaeb: { x: -655981.85, y: 1025035.83, z: -107594.324, dist: 1221714.9, orbit: -2, size: 1.625, startype: 'K', zlabel: loc('star_eta_cassiopeiae') + ' B' },
    // etacassiopeiaeb planets (K-type, 4, habitable-zone planet at ~0.5 AU)
    etacassiopeiaeb_p1: { dist: 0.5, orbit: 154, size: 0.234, star: 'etacassiopeiaeb', hz: true },
    etacassiopeiaeb_p2: { dist: 0.8, orbit: 312, size: 0.428, star: 'etacassiopeiaeb' },
    etacassiopeiaeb_p3: { dist: 1.4, orbit: 723, size: 0.574, star: 'etacassiopeiaeb' },
    etacassiopeiaeb_p4: { dist: 2.5, orbit: 1726, size: 0.574, star: 'etacassiopeiaeb' },
    // 70 Ophiuchi A (K-type): 1,054,699.3 AU from the Sun (16.68 ly).
    ophiuchi: { x: 896439.745, y: 515338.608, z: 207876.371, dist: 1054699.3, orbit: -2, size: 1.822, startype: 'K', label: loc('star_70_ophiuchi'), zlabel: loc('star_70_ophiuchi') + ' A' },
    // ophiuchi planets (K-type, 2, habitable-zone planet at ~0.5 AU)
    ophiuchi_p1: { dist: 0.35, orbit: 90, size: 0.234, star: 'ophiuchi' },
    ophiuchi_p2: { dist: 0.5, orbit: 154, size: 0.234, star: 'ophiuchi', hz: true },
    // 70 Ophiuchi B (K-type): companion, 27.5 AU from 70 Ophiuchi A.
    ophiuchib: { x: 896450.012, y: 515330.517, z: 207852.148, dist: 1054699.3, orbit: -2, size: 1.637, startype: 'K', zlabel: loc('star_70_ophiuchi') + ' B' },
    // ophiuchib planets (K-type, 4, habitable-zone planet at ~0.5 AU)
    ophiuchib_p1: { dist: 0.5, orbit: 154, size: 0.234, star: 'ophiuchib', hz: true },
    ophiuchib_p2: { dist: 0.8, orbit: 312, size: 0.428, star: 'ophiuchib' },
    ophiuchib_p3: { dist: 1.4, orbit: 723, size: 0.635, star: 'ophiuchib' },
    ophiuchib_p4: { dist: 2.5, orbit: 1726, size: 0.635, star: 'ophiuchib' },
    // DX Cancri (M-type): 738,639.6 AU from the Sun (11.68 ly).
    dxcancri: { x: -596219.327, y: -182448.568, z: 396009.416, dist: 738639.6, orbit: -2, size: 0.775, startype: 'M', label: loc('star_dx_cancri'), zlabel: loc('star_dx_cancri') },
    // dxcancri planets (M-type, 1, none habitable)
    dxcancri_p1: { dist: 0.36, orbit: 144, size: 0.191, star: 'dxcancri' },
    // AD Leonis (M-type): 1,024,122.4 AU from the Sun (16.19 ly).
    adleonis: { x: -477396.733, y: -352688.267, z: 834583.753, dist: 1024122.4, orbit: -2, size: 1.2, startype: 'M', label: loc('star_ad_leonis'), zlabel: loc('star_ad_leonis') },
    // adleonis planets (M-type, 2, none habitable)
    adleonis_p1: { dist: 0.34, orbit: 132, size: 0.142, star: 'adleonis' },
    adleonis_p2: { dist: 0.57, orbit: 287, size: 0.142, star: 'adleonis' },
    // EV Lacertae (M-type): 1,041,966.2 AU from the Sun (16.48 ly).
    evlacertae: { x: -186823.196, y: 997634.01, z: -235620.328, dist: 1041966.2, orbit: -2, size: 1.02, startype: 'M', label: loc('star_ev_lacertae'), zlabel: loc('star_ev_lacertae') },
    // evlacertae planets (M-type, 3, one in the habitable zone)
    evlacertae_p1: { dist: 0.25, orbit: 83, size: 0.142, star: 'evlacertae', hz: true },
    evlacertae_p2: { dist: 0.47, orbit: 215, size: 0.142, star: 'evlacertae' },
    evlacertae_p3: { dist: 0.89, orbit: 560, size: 0.191, star: 'evlacertae' },
    // Kruger 60 A (M-type): 827,068.7 AU from the Sun (13.08 ly).
    kruger60: { x: -209693.304, y: 800044.563, z: -54.443, dist: 827068.7, orbit: -2, size: 1.2, startype: 'M', label: loc('star_kruger_60'), zlabel: loc('star_kruger_60') + ' A' },
    // kruger60 planets (M-type, 2, one in the habitable zone)
    kruger60_p1: { dist: 0.24, orbit: 78, size: 0.191, star: 'kruger60', hz: true },
    kruger60_p2: { dist: 0.46, orbit: 208, size: 0.191, star: 'kruger60' },
    // Kruger 60 B (M-type): companion, 31.7 AU from Kruger 60 A.
    kruger60b: { x: -209715.123, y: 800038.845, z: -32.203, dist: 827068.7, orbit: -2, size: 1.02, startype: 'M', zlabel: loc('star_kruger_60') + ' B' },
    // kruger60b planets (M-type, 3, one in the habitable zone)
    kruger60b_p1: { dist: 0.22, orbit: 69, size: 0.142, star: 'kruger60b', hz: true },
    kruger60b_p2: { dist: 0.4, orbit: 169, size: 0.142, star: 'kruger60b' },
    kruger60b_p3: { dist: 0.81, orbit: 486, size: 0.191, star: 'kruger60b' },
    // YZ Canis Minoris (M-type): 1,235,289.5 AU from the Sun (19.53 ly).
    yzcanisminoris: { x: -973702.123, y: -703704.877, z: 287478.163, dist: 1235289.5, orbit: -2, size: 1.02, startype: 'M', label: loc('star_yz_canis_minoris'), zlabel: loc('star_yz_canis_minoris') },
    // yzcanisminoris planets (M-type, 2, none habitable)
    yzcanisminoris_p1: { dist: 0.41, orbit: 175, size: 0.191, star: 'yzcanisminoris' },
    yzcanisminoris_p2: { dist: 0.81, orbit: 486, size: 0.191, star: 'yzcanisminoris' },
    // Epsilon Indi A (K-type): 750,482 AU from the Sun (11.87 ly).
    epsilonindi: { x: 459040.021, y: -202531.303, z: -558109.846, dist: 750482, orbit: -2, size: 1.709, startype: 'K', label: loc('star_epsilon_indi'), zlabel: loc('star_epsilon_indi') + ' A' },
    // epsilonindi planets (K-type, 4, habitable-zone planet at ~0.5 AU)
    epsilonindi_p1: { dist: 0.5, orbit: 154, size: 0.234, star: 'epsilonindi', hz: true },
    epsilonindi_p2: { dist: 0.8, orbit: 312, size: 0.296, star: 'epsilonindi' },
    epsilonindi_p3: { dist: 1.4, orbit: 723, size: 0.635, star: 'epsilonindi' },
    epsilonindi_p4: { dist: 2.5, orbit: 1726, size: 0.635, star: 'epsilonindi' },
    // Epsilon Indi Ba & Bb (T-type brown dwarf binary, 2.65 AU apart) orbit an invisible barycenter
    // (`hidden`, not drawn) at their midpoint. They are bodies of it (so they orbit it) but still
    // Epsilon Indi Ba/Bb (T-type): companion, 1,463.8 AU from Epsilon Indi A.
    epsilonindib: { x: 457885.928, y: -202710.048, z: -558992.292, dist: 750482, orbit: -2, size: 0.632, startype: 'T', hidden: true },
    epsilonindiba: { dist: 1.33, orbit: 4139, size: 0.632, star: 'epsilonindib', bodystar: 'T', zlabel: loc('star_epsilon_indi') + ' BA' },
    epsilonindibb: { dist: 1.33, orbit: 4139, size: 0.632, star: 'epsilonindib', bodystar: 'T', zlabel: loc('star_epsilon_indi') + ' BB' },
    // Gliese 570 A (K-type): 1,214,148.7 AU from the Sun (19.20 ly).
    gliese570: { x: 949177.543, y: -378832.087, z: 655519.159, dist: 1214148.7, orbit: -2, size: 1.72, startype: 'K', label: loc('star_gliese_570'), zlabel: loc('star_gliese_570') + ' A' },
    // gliese570 planets (K-type, 4, habitable-zone planet at ~0.5 AU)
    gliese570_p1: { dist: 0.35, orbit: 90, size: 0.191, star: 'gliese570' },
    gliese570_p2: { dist: 0.5, orbit: 154, size: 0.234, star: 'gliese570', hz: true },
    gliese570_p3: { dist: 0.8, orbit: 312, size: 0.296, star: 'gliese570' },
    gliese570_p4: { dist: 1.4, orbit: 723, size: 0.635, star: 'gliese570' },
    // Gliese 570 B & C (M-type binary, 0.8 AU apart) orbit an invisible barycenter (`hidden`, not
    // drawn) at their midpoint. They are treated as bodies of it (so they orbit it) but still render
    // as stars via `bodystar` + label. Two circumbinary planets orbit the barycenter further out,
    // Gliese 570 B/C (G-type): companion, 146.6 AU from Gliese 570 A.
    gliese570bc: { x: 949089.095, y: -378855.488, z: 655633.69, dist: 1214148.7, orbit: -2, size: 1.4, startype: 'G', hidden: true },
    gliese570b: { dist: 0.4, orbit: 337, size: 1.4, star: 'gliese570bc', bodystar: 'M', zlabel: loc('star_gliese_570') + ' B' },
    gliese570c: { dist: 0.4, orbit: 337, size: 1.4, star: 'gliese570bc', bodystar: 'M', zlabel: loc('star_gliese_570') + ' C' },
    gliese570bc_p1: { dist: 1.8, orbit: 1139, size: 0.234, star: 'gliese570bc' },
    gliese570bc_p2: { dist: 3, orbit: 2450, size: 0.296, star: 'gliese570bc' },
    // Gliese 570 D (T-type): companion, 1,540.6 AU from Gliese 570 A.
    gliese570d: { x: 948312.726, y: -378790.836, z: 656793.425, dist: 1214148.7, orbit: -2, size: 0.632, startype: 'T', zlabel: loc('star_gliese_570') + ' D' },
    // Wolf 1061 (M-type): 888,540.1 AU from the Sun (14.05 ly).
    wolf1061: { x: 812336.061, y: 47574.594, z: 356861.682, dist: 888540.1, orbit: -2, size: 1.2, startype: 'M', label: loc('star_wolf_1061'), zlabel: loc('star_wolf_1061') },
    // wolf1061 planets (M-type, 2, none habitable)
    wolf1061_p1: { dist: 0.33, orbit: 126, size: 0.191, star: 'wolf1061' },
    wolf1061_p2: { dist: 0.61, orbit: 318, size: 0.191, star: 'wolf1061' },
    // Groombridge 1618 (K-type): 1,004,627.1 AU from the Sun (15.89 ly).
    groombridge1618: { x: -597833.655, y: 150541.573, z: 793226.14, dist: 1004627.1, orbit: -2, size: 1.587, startype: 'K', label: loc('star_groombridge_1618'), zlabel: loc('star_groombridge_1618') },
    // groombridge1618 planets (K-type, 2, habitable-zone planet at ~0.2 AU — a dim K6 dwarf)
    groombridge1618_p1: { dist: 0.45, orbit: 139, size: 0.191, star: 'groombridge1618' },
    // 40 Eridani A (K-type): 1,033,349.4 AU from the Sun (16.34 ly). Triple: a K0 dwarf with a
    // white dwarf and a red dwarf orbiting each other some 400 AU out.
    eridani40: { x: -760960.965, y: -288344.331, z: -636872.774, dist: 1033349.4, orbit: -2, size: 1.8, startype: 'K', label: loc('star_40_eridani'), zlabel: loc('star_40_eridani') + ' A' },
    // eridani40 planets (K-type, 3, habitable-zone planet at ~0.68 AU). The inner one stands in for
    // the much-disputed 40 Eridani A b; all three sit far inside the 400 AU to the B/C pair.
    eridani40_p1: { dist: 0.22, orbit: 43, size: 0.191, star: 'eridani40' },
    eridani40_p2: { dist: 0.68, orbit: 232, size: 0.234, star: 'eridani40', hz: true },
    eridani40_p3: { dist: 1.3, orbit: 613, size: 0.428, star: 'eridani40' },
    // 40 Eridani B (D-type white dwarf): companion, 418.7 AU from 40 Eridani A.
    eridani40b: { x: -761042.474, y: -288672.923, z: -636626.477, dist: 1033349.4, orbit: -2, size: 0.233, startype: 'D', zlabel: loc('star_40_eridani') + ' B' },
    // 40 Eridani C (M-type): companion, 392 AU from 40 Eridani A and 46.8 AU from the white dwarf.
    eridani40c: { x: -761061.01, y: -288630.021, z: -636623.769, dist: 1033349.4, orbit: -2, size: 1.114, startype: 'M', zlabel: loc('star_40_eridani') + ' C' },
    // 36 Ophiuchi A (K-type): 1,227,744 AU from the Sun (19.41 ly). A triple of K dwarfs.
    ophiuchi36: { x: 1218355.571, y: -36598.555, z: 147056.784, dist: 1227744, orbit: -2, size: 1.732, startype: 'K', label: loc('star_36_ophiuchi'), zlabel: loc('star_36_ophiuchi') + ' A' },
    // ophiuchi36 planets (K-type, 2, habitable-zone planet at ~0.55 AU). Held well inside the 29 AU
    // to component B, which is close enough to bound anything much wider.
    ophiuchi36_p1: { dist: 0.55, orbit: 161, size: 0.234, star: 'ophiuchi36', hz: true },
    ophiuchi36_p2: { dist: 0.95, orbit: 367, size: 0.296, star: 'ophiuchi36' },
    // 36 Ophiuchi B (K-type): companion, 29 AU from 36 Ophiuchi A.
    ophiuchi36b: { x: 1218358.479, y: -36609.241, z: 147030.032, dist: 1227744, orbit: -2, size: 1.789, startype: 'K', zlabel: loc('star_36_ophiuchi') + ' B' },
    // ophiuchi36b planets (K-type, 1, habitable-zone planet at ~0.52 AU)
    ophiuchi36b_p1: { dist: 0.52, orbit: 151, size: 0.234, star: 'ophiuchi36b', hz: true },
    // 36 Ophiuchi C (K-type): distant companion, 4,364 AU from 36 Ophiuchi A.
    ophiuchi36c: { x: 1218779.549, y: -33227.176, z: 144318.453, dist: 1227744, orbit: -2, size: 1.637, startype: 'K', zlabel: loc('star_36_ophiuchi') + ' C' },
    // ophiuchi36c planets (K-type, 1, habitable-zone planet at ~0.39 AU)
    ophiuchi36c_p1: { dist: 0.39, orbit: 106, size: 0.191, star: 'ophiuchi36c', hz: true },
    // HR 7703 A (K-type): 1,240,114.7 AU from the Sun (19.61 ly).
    hr7703: { x: 1059390.403, y: 97030.649, z: -637308.014, dist: 1240114.7, orbit: -2, size: 1.732, startype: 'K', label: loc('star_hr_7703'), zlabel: loc('star_hr_7703') + ' A' },
    // hr7703 planets (K-type, 2, habitable-zone planet at ~0.5 AU)
    hr7703_p1: { dist: 0.5, orbit: 149, size: 0.234, star: 'hr7703', hz: true },
    hr7703_p2: { dist: 0.9, orbit: 360, size: 0.234, star: 'hr7703' },
    // HR 7703 B (M-type): companion, 178.7 AU from HR 7703 A.
    hr7703b: { x: 1059353.659, y: 96877.48, z: -637392.387, dist: 1240114.7, orbit: -2, size: 1.2, startype: 'M', zlabel: loc('star_hr_7703') + ' B' },
    // 82 Eridani (G-type): 1,246,130.8 AU from the Sun (19.70 ly).
    eridani82: { x: -229324.232, y: -656542.819, z: -1034023.178, dist: 1246130.8, orbit: -2, size: 1.918, startype: 'G', label: loc('star_82_eridani'), zlabel: loc('star_82_eridani') },
    // eridani82 planets (G-type, 3, habitable-zone planet at ~1.35 AU). These are the real HD 20794
    // b, c and d; the star's 0.8 solar masses reproduces their published 18.3, 89.6 and 647 day
    // periods through the same Kepler relation the rest of the table uses.
    eridani82_p1: { dist: 0.126, orbit: 18, size: 0.191, star: 'eridani82' },
    eridani82_p2: { dist: 0.36, orbit: 88, size: 0.191, star: 'eridani82' },
    eridani82_p3: { dist: 1.35, orbit: 640, size: 0.234, star: 'eridani82', hz: true },
    // Delta Pavonis (G-type): 1,258,062 AU from the Sun (19.89 ly). A G8 subgiant, so it is drawn
    // slightly larger than the G dwarfs and its habitable zone sits further out.
    deltapavonis: { x: 917575.298, y: -534741.764, z: -674408.559, dist: 1258062, orbit: -2, size: 2.209, startype: 'G', label: loc('star_delta_pavonis'), zlabel: loc('star_delta_pavonis') },
    // deltapavonis planets (G-type, 3, habitable-zone planet at ~1.1 AU)
    deltapavonis_p1: { dist: 0.6, orbit: 166, size: 0.191, star: 'deltapavonis' },
    deltapavonis_p2: { dist: 1.1, orbit: 411, size: 0.234, star: 'deltapavonis', hz: true },
    deltapavonis_p3: { dist: 2.1, orbit: 1084, size: 0.574, star: 'deltapavonis' },
    // Lalande 21185 (M-type): 525,177 AU from the Sun (8.30 ly).
    lalande21185: { x: -217487.254, y: -19480.634, z: 477630.322, dist: 525177, orbit: -2, size: 1.254, startype: 'M', label: loc('star_lalande21185'), zlabel: loc('star_lalande21185') },
    // lalande21185 planets (M-type, 2, habitable-zone planet at ~0.39 AU) — real detected planets, at their published semi-major axes
    lalande21185_p1: { dist: 0.079, orbit: 12, size: 0.191, star: 'lalande21185' },
    lalande21185_p2: { dist: 0.51, orbit: 200, size: 0.191, star: 'lalande21185', hz: true },
    // Ross 154 (M-type): 613,834.8 AU from the Sun (9.71 ly).
    ross154: { x: 592249.371, y: 118420.349, z: -109592.027, dist: 613834.8, orbit: -2, size: 1.2, startype: 'M', label: loc('star_ross154'), zlabel: loc('star_ross154') },
    // ross154 planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    ross154_p1: { dist: 0.25, orbit: 83, size: 0.191, star: 'ross154', hz: true },
    ross154_p2: { dist: 0.601, orbit: 310, size: 0.234, star: 'ross154' },
    // Ross 248 (M-type): 651,744.3 AU from the Sun (10.31 ly).
    ross248: { x: -213144.088, y: 585898.378, z: -189903.322, dist: 651744.3, orbit: -2, size: 0.894, startype: 'M', label: loc('star_ross248'), zlabel: loc('star_ross248') },
    // ross248 planets (M-type, 1, habitable-zone planet at ~0.12 AU)
    ross248_p1: { dist: 0.122, orbit: 39, size: 0.142, star: 'ross248', hz: true },
    // Lacaille 9352 (M-type): 678,200.6 AU from the Sun (10.72 ly).
    lacaille9352: { x: 275218.805, y: 24566.519, z: -619360.258, dist: 678200.6, orbit: -2, size: 1.355, startype: 'M', label: loc('star_lacaille9352'), zlabel: loc('star_lacaille9352') },
    // lacaille9352 planets (M-type, 2, none habitable) — real detected planets, at their published semi-major axes
    lacaille9352_p1: { dist: 0.068, orbit: 10, size: 0.142, star: 'lacaille9352' },
    lacaille9352_p2: { dist: 0.12, orbit: 23, size: 0.142, star: 'lacaille9352' },
    // EZ Aquarii (M-type): 702,536.8 AU from the Sun (11.11 ly).
    ezaquarii: { x: 260754.881, y: 280307.529, z: -589060.731, dist: 702536.8, orbit: -2, size: 0.894, startype: 'M', label: loc('star_ezaquarii'), zlabel: loc('star_ezaquarii') },
    // ezaquarii planets (M-type, 1, habitable-zone planet at ~0.12 AU)
    ezaquarii_p1: { dist: 0.122, orbit: 39, size: 0.234, star: 'ezaquarii', hz: true },
    // Struve 2398 (M-type): 726,693.7 AU from the Sun (11.49 ly).
    struve2398: { x: 8230.584, y: 662621.062, z: 298243.672, dist: 726693.7, orbit: -2, size: 1.2, startype: 'M', label: loc('star_struve2398'), zlabel: loc('star_struve2398') + ' A' },
    // struve2398 planets (M-type, 2, habitable-zone planet at ~0.31 AU)
    struve2398_p1: { dist: 0.309, orbit: 104, size: 0.142, star: 'struve2398', hz: true },
    struve2398_p2: { dist: 0.741, orbit: 388, size: 0.142, star: 'struve2398' },
    // Struve 2398 B (M-type): M3.5 dwarf companion, 45 AU from Struve 2398 A.
    struve2398b: { x: 8273.129, y: 662626.622, z: 298230.14, dist: 726693.7, orbit: -2, size: 1.2, startype: 'M', zlabel: loc('star_struve2398') + ' B' },
    // struve2398b planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    struve2398b_p1: { dist: 0.25, orbit: 83, size: 0.234, star: 'struve2398b', hz: true },
    struve2398b_p2: { dist: 0.601, orbit: 310, size: 0.234, star: 'struve2398b' },
    // Groombridge 34 (M-type): 734,805.2 AU from the Sun (11.62 ly).
    groombridge34: { x: -312946.227, y: 622849.542, z: -232511.796, dist: 734805.2, orbit: -2, size: 1.327, startype: 'M', label: loc('star_groombridge34'), zlabel: loc('star_groombridge34') + ' A' },
    // groombridge34 planets (M-type, 2, none habitable) — real detected planets, at their published semi-major axes
    groombridge34_p1: { dist: 0.072, orbit: 11, size: 0.191, star: 'groombridge34' },
    groombridge34_p2: { dist: 5.4, orbit: 6905, size: 0.191, star: 'groombridge34' },
    // Groombridge 34 B (M-type): M3.5 dwarf companion, 125.7 AU from Groombridge 34 A.
    groombridge34b: { x: -313058.463, y: 622807.066, z: -232474.486, dist: 734805.2, orbit: -2, size: 1.2, startype: 'M', zlabel: loc('star_groombridge34') + ' B' },
    // groombridge34b planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    groombridge34b_p1: { dist: 0.25, orbit: 83, size: 0.191, star: 'groombridge34b', hz: true },
    groombridge34b_p2: { dist: 0.601, orbit: 310, size: 0.191, star: 'groombridge34b' },
    // Gliese 1061 (M-type): 757,876.5 AU from the Sun (11.98 ly).
    gliese1061: { x: -142241.102, y: -434411.095, z: -604509.111, dist: 757876.5, orbit: -2, size: 0.894, startype: 'M', label: loc('star_gliese1061'), zlabel: loc('star_gliese1061') },
    // gliese1061 planets (M-type, 3, none habitable) — real detected planets, at their published semi-major axes
    gliese1061_p1: { dist: 0.021, orbit: 3, size: 0.191, star: 'gliese1061' },
    gliese1061_p2: { dist: 0.035, orbit: 7, size: 0.191, star: 'gliese1061' },
    gliese1061_p3: { dist: 0.054, orbit: 13, size: 0.191, star: 'gliese1061' },
    // Luyten's Star (M-type): 780,930.7 AU from the Sun (12.35 ly).
    luytensstar: { x: -648982.214, y: -410976.247, z: 140617.84, dist: 780930.7, orbit: -2, size: 1.077, startype: 'M', label: loc('star_luytensstar'), zlabel: loc('star_luytensstar') },
    // luytensstar planets (M-type, 2, none habitable) — real detected planets, at their published semi-major axes
    luytensstar_p1: { dist: 0.036, orbit: 5, size: 0.234, star: 'luytensstar' },
    luytensstar_p2: { dist: 0.091, orbit: 18, size: 0.234, star: 'luytensstar' },
    // Lacaille 8760 (M-type): 818,795.8 AU from the Sun (12.95 ly).
    lacaille8760: { x: 585078.569, y: 39930.09, z: -571415.051, dist: 818795.8, orbit: -2, size: 1.428, startype: 'M', label: loc('star_lacaille8760'), zlabel: loc('star_lacaille8760') },
    // lacaille8760 planets (M-type, 2, habitable-zone planet at ~0.44 AU)
    lacaille8760_p1: { dist: 0.44, orbit: 152, size: 0.191, star: 'lacaille8760', hz: true },
    lacaille8760_p2: { dist: 1.057, orbit: 567, size: 0.191, star: 'lacaille8760' },
    // SCR 1845-6357 (M-type): 826,166 AU from the Sun (13.06 ly).
    scr1845: { x: 665907.921, y: -361272.051, z: -329544.131, dist: 826166, orbit: -2, size: 0.663, startype: 'M', label: loc('star_scr1845'), zlabel: loc('star_scr1845') + ' A' },
    // scr1845 planets (M-type, 1, habitable-zone planet at ~0.05 AU)
    scr1845_p1: { dist: 0.051, orbit: 15, size: 0.142, star: 'scr1845', hz: true },
    // SCR 1845-6357 B (T-type): brown dwarf companion, 1.4 AU from SCR 1845-6357 A.
    scr1845b: { x: 665907.12, y: -361273.178, z: -329544.514, dist: 826166, orbit: -2, size: 0.632, startype: 'T', zlabel: loc('star_scr1845') + ' B' },
    // DEN 1048-3956 (M-type): 834,351.9 AU from the Sun (13.19 ly).
    den1048: { x: 120425.2, y: -788470.43, z: 244857.613, dist: 834351.9, orbit: -2, size: 0.663, startype: 'M', label: loc('star_den1048'), zlabel: loc('star_den1048') },
    // den1048 planets (M-type, 1, habitable-zone planet at ~0.05 AU)
    den1048_p1: { dist: 0.151, orbit: 35, size: 0.191, star: 'den1048' },
    // Ross 614 (M-type): 848,945.5 AU from the Sun (13.42 ly).
    ross614: { x: -708412.737, y: -458791.644, z: -91488.11, dist: 848945.5, orbit: -2, size: 1.02, startype: 'M', label: loc('star_ross614'), zlabel: loc('star_ross614') },
    // ross614 planets (M-type, 2, habitable-zone planet at ~0.16 AU)
    ross614_p1: { dist: 0.157, orbit: 51, size: 0.191, star: 'ross614', hz: true },
    ross614_p2: { dist: 0.377, orbit: 189, size: 0.191, star: 'ross614' },
    // Gliese 1 (M-type): 896,425.4 AU from the Sun (14.17 ly).
    gliese1: { x: 209403.756, y: -61814.687, z: -869429.465, dist: 896425.4, orbit: -2, size: 1.327, startype: 'M', label: loc('star_gliese1'), zlabel: loc('star_gliese1') },
    // gliese1 planets (M-type, 2, habitable-zone planet at ~0.39 AU)
    gliese1_p1: { dist: 0.389, orbit: 134, size: 0.234, star: 'gliese1', hz: true },
    gliese1_p2: { dist: 0.934, orbit: 497, size: 0.234, star: 'gliese1' },
    // Gliese 687 (M-type): 938,464 AU from the Sun (14.84 ly).
    gliese687: { x: -119088.111, y: 787217.482, z: 496811.094, dist: 938464, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese687'), zlabel: loc('star_gliese687') },
    // gliese687 planets (M-type, 2, none habitable) — real detected planets, at their published semi-major axes
    gliese687_p1: { dist: 0.164, orbit: 40, size: 0.142, star: 'gliese687' },
    gliese687_p2: { dist: 1.17, orbit: 770, size: 0.142, star: 'gliese687' },
    // Gliese 674 (M-type): 939,077.1 AU from the Sun (14.85 ly).
    gliese674: { x: 891786.742, y: -272579.855, z: -110825.959, dist: 939077.1, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese674'), zlabel: loc('star_gliese674') },
    // gliese674 planets (M-type, 1, none habitable) — real detected planets, at their published semi-major axes
    gliese674_p1: { dist: 0.039, orbit: 5, size: 0.142, star: 'gliese674' },
    // LHS 292 (M-type): 940,430.5 AU from the Sun (14.87 ly).
    lhs292: { x: -110597.972, y: -697913.901, z: 620559.241, dist: 940430.5, orbit: -2, size: 0.775, startype: 'M', label: loc('star_lhs292'), zlabel: loc('star_lhs292') },
    // lhs292 planets (M-type, 1, habitable-zone planet at ~0.07 AU)
    lhs292_p1: { dist: 0.067, orbit: 21, size: 0.191, star: 'lhs292', hz: true },
    // Gliese 876 (M-type): 963,683.1 AU from the Sun (15.24 ly).
    gliese876: { x: 299935.23, y: 383955.508, z: -831445.83, dist: 963683.1, orbit: -2, size: 1.226, startype: 'M', label: loc('star_gliese876'), zlabel: loc('star_gliese876') },
    // gliese876 planets (M-type, 4, habitable-zone planet at ~0.25 AU) — real detected planets, at their published semi-major axes
    gliese876_p1: { dist: 0.021, orbit: 2, size: 0.142, star: 'gliese876' },
    gliese876_p2: { dist: 0.13, orbit: 31, size: 0.142, star: 'gliese876' },
    gliese876_p3: { dist: 0.208, orbit: 63, size: 0.142, star: 'gliese876', hz: true },
    gliese876_p4: { dist: 0.334, orbit: 129, size: 0.191, star: 'gliese876', hz: true },
    // Gliese 1245 (M-type): 967,775.5 AU from the Sun (15.30 ly).
    gliese1245: { x: 184953.099, y: 939081.762, z: 143203.637, dist: 967775.5, orbit: -2, size: 0.894, startype: 'M', label: loc('star_gliese1245'), zlabel: loc('star_gliese1245') + ' A' },
    // gliese1245 planets (M-type, 1, habitable-zone planet at ~0.10 AU)
    gliese1245_p1: { dist: 0.096, orbit: 30, size: 0.191, star: 'gliese1245', hz: true },
    // Gliese 1245 B (M-type): M6 dwarf companion, 35.6 AU from Gliese 1245 A.
    gliese1245b: { x: 184926.336, y: 939090.367, z: 143181.763, dist: 967775.5, orbit: -2, size: 0.775, startype: 'M', zlabel: loc('star_gliese1245') + ' B' },
    // gliese1245b planets (M-type, 1, habitable-zone planet at ~0.07 AU)
    gliese1245b_p1: { dist: 0.071, orbit: 22, size: 0.191, star: 'gliese1245b', hz: true },
    // LHS 288 (M-type): 996,593.7 AU from the Sun (15.76 ly).
    lhs288: { x: 311628.137, y: -945967.647, z: -35102.573, dist: 996593.7, orbit: -2, size: 0.894, startype: 'M', label: loc('star_lhs288'), zlabel: loc('star_lhs288') },
    // lhs288 planets (M-type, 1, habitable-zone planet at ~0.10 AU)
    lhs288_p1: { dist: 0.096, orbit: 30, size: 0.191, star: 'lhs288', hz: true },
    // Gliese 1002 (M-type): 999,587.1 AU from the Sun (15.81 ly).
    gliese1002: { x: -16284.807, y: 378551.276, z: -924990.911, dist: 999587.1, orbit: -2, size: 0.894, startype: 'M', label: loc('star_gliese1002'), zlabel: loc('star_gliese1002') },
    // gliese1002 planets (M-type, 2, habitable-zone planet at ~0.10 AU) — real detected planets, at their published semi-major axes
    gliese1002_p1: { dist: 0.046, orbit: 10, size: 0.234, star: 'gliese1002' },
    gliese1002_p2: { dist: 0.074, orbit: 20, size: 0.234, star: 'gliese1002', hz: true },
    // Gliese 412 (M-type): 1,011,659.4 AU from the Sun (16.00 ly).
    gliese412: { x: -448966.251, y: 91321.181, z: 901967.006, dist: 1011659.4, orbit: -2, size: 1.4, startype: 'M', label: loc('star_gliese412'), zlabel: loc('star_gliese412') + ' A' },
    // gliese412 planets (M-type, 2, habitable-zone planet at ~0.44 AU)
    gliese412_p1: { dist: 0.44, orbit: 152, size: 0.191, star: 'gliese412', hz: true },
    gliese412_p2: { dist: 1.057, orbit: 567, size: 0.191, star: 'gliese412' },
    // Gliese 412 B (M-type): M6 dwarf companion, 153 AU from Gliese 412 A.
    gliese412b: { x: -448837.812, y: 91274.378, z: 902035.664, dist: 1011659.4, orbit: -2, size: 0.775, startype: 'M', zlabel: loc('star_gliese412') + ' B' },
    // gliese412b planets (M-type, 1, habitable-zone planet at ~0.07 AU)
    gliese412b_p1: { dist: 0.071, orbit: 22, size: 0.142, star: 'gliese412b', hz: true },
    // Gliese 832 (M-type): 1,024,535.5 AU from the Sun (16.20 ly).
    gliese832: { x: 694603.235, y: -132841.054, z: -741318.088, dist: 1024535.5, orbit: -2, size: 1.4, startype: 'M', label: loc('star_gliese832'), zlabel: loc('star_gliese832') },
    // gliese832 planets (M-type, 2, habitable-zone planet at ~0.25 AU) — real detected planets, at their published semi-major axes
    gliese832_p1: { dist: 0.163, orbit: 44, size: 0.142, star: 'gliese832', hz: true },
    gliese832_p2: { dist: 3.56, orbit: 4476, size: 0.142, star: 'gliese832' },
    // Gliese 1005 (M-type): 1,028,598.2 AU from the Sun (16.26 ly).
    gliese1005: { x: 25989.848, y: 243959.963, z: -998910.614, dist: 1028598.2, orbit: -2, size: 1.02, startype: 'M', label: loc('star_gliese1005'), zlabel: loc('star_gliese1005') },
    // gliese1005 planets (M-type, 2, habitable-zone planet at ~0.18 AU)
    gliese1005_p1: { dist: 0.184, orbit: 60, size: 0.191, star: 'gliese1005', hz: true },
    gliese1005_p2: { dist: 0.443, orbit: 224, size: 0.191, star: 'gliese1005' },
    // Gliese 682 (M-type): 1,032,902.3 AU from the Sun (16.33 ly).
    gliese682: { x: 995446.58, y: -248457.356, z: -119340.785, dist: 1032902.3, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese682'), zlabel: loc('star_gliese682') },
    // gliese682 planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    gliese682_p1: { dist: 0.25, orbit: 83, size: 0.191, star: 'gliese682', hz: true },
    gliese682_p2: { dist: 0.601, orbit: 310, size: 0.191, star: 'gliese682' },
    // Gliese 316.1 (M-type): 1,062,430.4 AU from the Sun (16.80 ly).
    gliese3161: { x: -757530.872, y: -395194.328, z: 631448.157, dist: 1062430.4, orbit: -2, size: 0.663, startype: 'M', label: loc('star_gliese3161'), zlabel: loc('star_gliese3161') + ' A' },
    // gliese3161 planets (M-type, 1, habitable-zone planet at ~0.05 AU)
    gliese3161_p1: { dist: 0.075, orbit: 20, size: 0.191, star: 'gliese3161' },
    // Gliese 316.1 B (M-type): M7 dwarf companion, 13.6 AU from Gliese 316.1 A.
    gliese3161b: { x: -757524.185, y: -395206.107, z: 631448.807, dist: 1062430.4, orbit: -2, size: 0.693, startype: 'M', zlabel: loc('star_gliese3161') + ' B' },
    // gliese3161b planets (M-type, 1, habitable-zone planet at ~0.06 AU)
    gliese3161b_p1: { dist: 0.063, orbit: 19, size: 0.191, star: 'gliese3161b', hz: true },
    // Gliese 3379 (M-type): 1,074,220.3 AU from the Sun (16.99 ly).
    gliese3379: { x: -961744.94, y: -439556.081, z: -189173.069, dist: 1074220.3, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese3379'), zlabel: loc('star_gliese3379') },
    // gliese3379 planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    gliese3379_p1: { dist: 0.25, orbit: 83, size: 0.142, star: 'gliese3379', hz: true },
    gliese3379_p2: { dist: 0.601, orbit: 310, size: 0.191, star: 'gliese3379' },
    // Gliese 445 (M-type): 1,083,749.9 AU from the Sun (17.14 ly).
    gliese445: { x: -512495.776, y: 683891.836, z: 666448.693, dist: 1083749.9, orbit: -2, size: 1.02, startype: 'M', label: loc('star_gliese445'), zlabel: loc('star_gliese445') },
    // gliese445 planets (M-type, 2, habitable-zone planet at ~0.18 AU)
    gliese445_p1: { dist: 0.184, orbit: 60, size: 0.191, star: 'gliese445', hz: true },
    gliese445_p2: { dist: 0.443, orbit: 224, size: 0.191, star: 'gliese445' },
    // UCAC4 195-119117 (M-type): 1,098,737 AU from the Sun (17.37 ly).
    ucac4195: { x: 930476.996, y: -580671.582, z: 65239.27, dist: 1098737, orbit: -2, size: 0.693, startype: 'M', label: loc('star_ucac4195'), zlabel: loc('star_ucac4195') },
    // ucac4195 planets (M-type, 1, habitable-zone planet at ~0.06 AU)
    ucac4195_p1: { dist: 0.063, orbit: 19, size: 0.191, star: 'ucac4195', hz: true },
    // Gliese 3323 (M-type): 1,108,672.8 AU from the Sun (17.53 ly).
    gliese3323: { x: -880844.557, y: -437838.537, z: -511434.918, dist: 1108672.8, orbit: -2, size: 1.02, startype: 'M', label: loc('star_gliese3323'), zlabel: loc('star_gliese3323') },
    // gliese3323 planets (M-type, 2, habitable-zone planet at ~0.18 AU) — real detected planets, at their published semi-major axes
    gliese3323_p1: { dist: 0.033, orbit: 5, size: 0.191, star: 'gliese3323' },
    gliese3323_p2: { dist: 0.126, orbit: 34, size: 0.191, star: 'gliese3323', hz: true },
    // Gliese 526 (M-type): 1,121,027.5 AU from the Sun (17.73 ly).
    gliese526: { x: 335066.997, y: -49623.998, z: 1068630.103, dist: 1121027.5, orbit: -2, size: 1.327, startype: 'M', label: loc('star_gliese526'), zlabel: loc('star_gliese526') },
    // gliese526 planets (M-type, 2, habitable-zone planet at ~0.39 AU)
    gliese526_p1: { dist: 0.389, orbit: 134, size: 0.142, star: 'gliese526', hz: true },
    gliese526_p2: { dist: 0.934, orbit: 497, size: 0.142, star: 'gliese526' },
    // Stein 2051 (M-type): 1,138,051.7 AU from the Sun (18.00 ly).
    stein2051: { x: -958344.288, y: 596456.243, z: 144836.944, dist: 1138051.7, orbit: -2, size: 1.02, startype: 'M', label: loc('star_stein2051'), zlabel: loc('star_stein2051') + ' A' },
    // stein2051 planets (M-type, 2, habitable-zone planet at ~0.18 AU)
    stein2051_p1: { dist: 0.184, orbit: 60, size: 0.191, star: 'stein2051', hz: true },
    stein2051_p2: { dist: 0.443, orbit: 224, size: 0.191, star: 'stein2051' },
    // Stein 2051 B (D-type): white dwarf companion, 49.8 AU from Stein 2051 A.
    stein2051b: { x: -958347.129, y: 596440.249, z: 144884.009, dist: 1138051.7, orbit: -2, size: 0.214, startype: 'D', zlabel: loc('star_stein2051') + ' B' },
    // Gliese 251 (M-type): 1,151,912.6 AU from the Sun (18.21 ly).
    gliese251: { x: -1110494.37, y: -56961.286, z: 300766.1, dist: 1151912.6, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese251'), zlabel: loc('star_gliese251') },
    // gliese251 planets (M-type, 1, none habitable) — real detected planets, at their published semi-major axes
    gliese251_p1: { dist: 0.142, orbit: 21, size: 0.191, star: 'gliese251' },
    // Gliese 1224 (M-type): 1,159,239.1 AU from the Sun (18.33 ly).
    gliese1224: { x: 828810.56, y: 481669.937, z: -651845.416, dist: 1159239.1, orbit: -2, size: 1.02, startype: 'M', label: loc('star_gliese1224'), zlabel: loc('star_gliese1224') },
    // gliese1224 planets (M-type, 2, habitable-zone planet at ~0.18 AU)
    gliese1224_p1: { dist: 0.184, orbit: 60, size: 0.142, star: 'gliese1224', hz: true },
    gliese1224_p2: { dist: 0.443, orbit: 224, size: 0.142, star: 'gliese1224' },
    // LSR 1835+3259 (M-type): 1,173,339.1 AU from the Sun (18.55 ly).
    lsr1835: { x: 531613.187, y: 985085.729, z: 351736.048, dist: 1173339.1, orbit: -2, size: 0.663, startype: 'M', label: loc('star_lsr1835'), zlabel: loc('star_lsr1835') },
    // lsr1835 planets (M-type, 1, habitable-zone planet at ~0.05 AU)
    lsr1835_p1: { dist: 0.051, orbit: 15, size: 0.191, star: 'lsr1835', hz: true },
    // Gliese 205 (M-type): 1,176,551 AU from the Sun (18.60 ly).
    gliese205: { x: -989078.348, y: -502540.926, z: -391725.589, dist: 1176551, orbit: -2, size: 1.4, startype: 'M', label: loc('star_gliese205'), zlabel: loc('star_gliese205') },
    // gliese205 planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    gliese205_p1: { dist: 0.25, orbit: 83, size: 0.191, star: 'gliese205', hz: true },
    gliese205_p2: { dist: 0.601, orbit: 310, size: 0.191, star: 'gliese205' },
    // Gliese 229 (M-type): 1,188,339.3 AU from the Sun (18.79 ly).
    gliese229: { x: -745335.438, y: -845782.332, z: -375869.169, dist: 1188339.3, orbit: -2, size: 1.661, startype: 'M', label: loc('star_gliese229'), zlabel: loc('star_gliese229') + ' A' },
    // gliese229 planets (M-type, 2, habitable-zone planet at ~0.44 AU) — real detected planets, at their published semi-major axes
    gliese229_p1: { dist: 0.0393, orbit: 4, size: 0.191, star: 'gliese229' },
    gliese229_p2: { dist: 0.339, orbit: 103, size: 0.191, star: 'gliese229', hz: true },
    // Gliese 229 B (T-type): brown dwarf companion, 44.8 AU from Gliese 229 A.
    gliese229b: { x: -745301.32, y: -845811.323, z: -375871.586, dist: 1188339.3, orbit: -2, size: 0.632, startype: 'T', zlabel: loc('star_gliese229') + ' B' },
    // Ross 47 (M-type): 1,194,517.9 AU from the Sun (18.89 ly).
    ross47: { x: -1145524.905, y: -279422.463, z: -191229.485, dist: 1194517.9, orbit: -2, size: 1.02, startype: 'M', label: loc('star_ross47'), zlabel: loc('star_ross47') },
    // ross47 planets (M-type, 2, habitable-zone planet at ~0.18 AU)
    ross47_p1: { dist: 0.184, orbit: 60, size: 0.142, star: 'ross47', hz: true },
    ross47_p2: { dist: 0.443, orbit: 224, size: 0.191, star: 'ross47' },
    // Gliese 693 (M-type): 1,214,721.5 AU from the Sun (19.21 ly).
    gliese693: { x: 1068695.749, y: -491444.967, z: -303182.245, dist: 1214721.5, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese693'), zlabel: loc('star_gliese693') },
    // gliese693 planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    gliese693_p1: { dist: 0.25, orbit: 83, size: 0.142, star: 'gliese693', hz: true },
    gliese693_p2: { dist: 0.601, orbit: 310, size: 0.142, star: 'gliese693' },
    // Gliese 754 (M-type): 1,218,806.3 AU from the Sun (19.27 ly).
    gliese754: { x: 1104389.603, y: -148146.062, z: -493827.043, dist: 1218806.3, orbit: -2, size: 1.02, startype: 'M', label: loc('star_gliese754'), zlabel: loc('star_gliese754') },
    // gliese754 planets (M-type, 2, habitable-zone planet at ~0.16 AU)
    gliese754_p1: { dist: 0.157, orbit: 51, size: 0.191, star: 'gliese754', hz: true },
    gliese754_p2: { dist: 0.377, orbit: 189, size: 0.191, star: 'gliese754' },
    // Gliese 908 (M-type): 1,218,941.7 AU from the Sun (19.27 ly).
    gliese908: { x: -41398.594, y: 664742.204, z: -1020893.164, dist: 1218941.7, orbit: -2, size: 1.4, startype: 'M', label: loc('star_gliese908'), zlabel: loc('star_gliese908') },
    // gliese908 planets (M-type, 2, habitable-zone planet at ~0.44 AU)
    gliese908_p1: { dist: 0.44, orbit: 152, size: 0.191, star: 'gliese908', hz: true },
    gliese908_p2: { dist: 1.057, orbit: 567, size: 0.191, star: 'gliese908' },
    // Gliese 752 (M-type): 1,220,057.8 AU from the Sun (19.29 ly).
    gliese752: { x: 926948.333, y: 790205.838, z: -69875.759, dist: 1220057.8, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese752'), zlabel: loc('star_gliese752') + ' A' },
    // gliese752 planets (M-type, 2, habitable-zone planet at ~0.31 AU)
    gliese752_p1: { dist: 0.309, orbit: 104, size: 0.234, star: 'gliese752', hz: true },
    gliese752_p2: { dist: 0.741, orbit: 388, size: 0.142, star: 'gliese752' },
    // Gliese 752 B (M-type): M8 dwarf companion, 444.7 AU from Gliese 752 A.
    gliese752b: { x: 927095.567, y: 790000.638, z: -70241.737, dist: 1220057.8, orbit: -2, size: 0.663, startype: 'M', zlabel: loc('star_gliese752') + ' B' },
    // gliese752b planets (M-type, 1, habitable-zone planet at ~0.05 AU)
    gliese752b_p1: { dist: 0.055, orbit: 17, size: 0.234, star: 'gliese752b', hz: true },
    // Gliese 588 (M-type): 1,220,527.1 AU from the Sun (19.30 ly).
    gliese588: { x: 1060129.542, y: -547762.98, z: 256451.649, dist: 1220527.1, orbit: -2, size: 1.327, startype: 'M', label: loc('star_gliese588'), zlabel: loc('star_gliese588') },
    // gliese588 planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    gliese588_p1: { dist: 0.25, orbit: 83, size: 0.234, star: 'gliese588', hz: true },
    gliese588_p2: { dist: 0.601, orbit: 310, size: 0.234, star: 'gliese588' },
    // Gliese 661 (M-type): 1,232,977.5 AU from the Sun (19.50 ly).
    gliese661: { x: 319345.938, y: 945459.439, z: 724125.777, dist: 1232977.5, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese661'), zlabel: loc('star_gliese661') },
    // gliese661 planets (M-type, 2, habitable-zone planet at ~0.31 AU)
    gliese661_p1: { dist: 0.309, orbit: 104, size: 0.142, star: 'gliese661', hz: true },
    gliese661_p2: { dist: 0.741, orbit: 388, size: 0.142, star: 'gliese661' },
    // QY Aurigae (M-type): 1,248,465.2 AU from the Sun (19.74 ly).
    qyaurigae: { x: -1173685.128, y: 21423.911, z: 425052.508, dist: 1248465.2, orbit: -2, size: 1.02, startype: 'M', label: loc('star_qyaurigae'), zlabel: loc('star_qyaurigae') },
    // qyaurigae planets (M-type, 2, habitable-zone planet at ~0.16 AU)
    qyaurigae_p1: { dist: 0.157, orbit: 51, size: 0.234, star: 'qyaurigae', hz: true },
    qyaurigae_p2: { dist: 0.377, orbit: 189, size: 0.234, star: 'qyaurigae' },
    // Gliese 65 B (M-type): M6 dwarf companion, 11 AU from Gliese 65 A.
    gliese65b: { x: -138135.223, y: 10899.179, z: -543557.776, dist: 560941.3, orbit: -2, size: 0.775, startype: 'M', zlabel: loc('star_gliese65') + ' B' },
    // gliese65b planets (M-type, 1, habitable-zone planet at ~0.07 AU)
    gliese65b_p1: { dist: 0.32, orbit: 121, size: 0.191, star: 'gliese65' }
};

// --- The cow -------------------------------------------------------------------------------------
// Somewhere out in the star field, one run in one, there is a gas giant that is a cow. It is picked
// fresh each TruePath game and never announced: the only way to it is to go looking, and the feat is
// for whoever does.
const COW_ID = 'cow_planet';
const COW_GLYPHS = ['\u{1F404}', '\u{1F402}'];
// Jupiter's size in this table, so it reads as a gas giant next to whatever else the system has.
const COW_SIZE = 0.634;
const AU_PER_LY = 63241.077;
// Kept well clear of the two systems the campaign actually visits, so it cannot be stumbled over
// while doing something else.
const COW_MIN_SOL = 10 * AU_PER_LY;
const COW_MIN_TAU = 5 * AU_PER_LY;
// Orbit: outside whatever the star already has, and never closer in than a gas giant belongs.
const COW_ORBIT_CLEAR = 1.8;
const COW_ORBIT_MIN = 2.5;
// Period per AU^1.5 for a system with nothing else in it to copy. The M dwarfs in the table run
// about this, which is a star of roughly half a solar mass.
const COW_PERIOD_K = 521;

// Which M-type stars are far enough out to hide a cow behind.
function cowCandidates(){
    let sol = { x: 0, y: 0, z: 0 };
    let tau = spacePlanetStats.tauceti;
    return Object.keys(spacePlanetStats).filter(function(id){
        let s = spacePlanetStats[id];
        if (s.startype !== 'M' || s.hidden){ return false; }
        let at = { x: s.x, y: s.y, z: s.z };
        return dist3(at, sol) > COW_MIN_SOL && dist3(at, tau) > COW_MIN_TAU;
    });
}

// Where the cow sits around its star, and how long it takes to get round. Both are read off whatever
// else orbits that star so the newcomer is in scale with its neighbours: outside the outermost of
// them, and on the same period-to-distance relation, which is what keeps it from looking bolted on.
function cowOrbit(star){
    let outer = 0, k = 0;
    for (let body of Object.values(spacePlanetStats)){
        if (body.star !== star || body.startype || body.bodystar || !body.dist){ continue; }
        outer = Math.max(outer, body.dist);
        if (body.orbit > 0){ k = body.orbit / Math.pow(body.dist, 1.5); }
    }
    let dist = +Math.max(outer * COW_ORBIT_CLEAR, COW_ORBIT_MIN).toFixed(2);
    return { d: dist, o: Math.round((k || COW_PERIOD_K) * Math.pow(dist, 1.5)) };
}

// Makes sure the table matches whatever this run rolled, and returns the cow's id (or false when
// there is no cow — a run that is not TruePath). Called from setOrbits, so the entry is in place
// before anything asks the map to draw or a ship to fly.
export function cowPlanet(){
    if (!global.race['truepath']){
        delete spacePlanetStats[COW_ID];
        delete global.race['cow'];
        return false;
    }
    if (!global.race['cow']){
        let stars = cowCandidates();
        if (stars.length === 0){ return false; }
        let star = stars[Math.floor(Math.random() * stars.length)];
        let orbit = cowOrbit(star);
        global.race['cow'] = { s: star, e: COW_GLYPHS[Math.floor(Math.random() * COW_GLYPHS.length)], d: orbit.d, o: orbit.o };
    }
    let cow = global.race.cow;
    if (!spacePlanetStats[COW_ID] || spacePlanetStats[COW_ID].star !== cow.s){
        spacePlanetStats[COW_ID] = { dist: cow.d, orbit: cow.o, size: COW_SIZE, star: cow.s };
    }
    return COW_ID;
}

// The glyph to draw a body with, or false for anything that is not the cow.
function cowGlyph(id){
    return id === COW_ID && global.race['cow'] ? global.race.cow.e : false;
}

export function setOrbits(){
    if (!global.space['position']){
        global.space['position'] = {};
    }
    // Before positions are handed out, so the cow gets an orbital angle like everything else.
    cowPlanet();
    Object.keys(spacePlanetStats).forEach(function(o){
        // Stars have fixed coordinates, so they never need an orbital position.
        if (!spacePlanetStats[o].startype && !global.space.position.hasOwnProperty(o)){
            global.space.position[o] = Math.rand(0,360);
        }
    });
    // Moons used to be pinned to their planet's orbital angle, which was what kept them alongside it
    // while both circled the Sun. They now orbit the planet itself (see orbitPoint), so each keeps
    // its own angle and advances at its own period.
    // Gliese 570 B & C are a binary — keep them on opposite sides of their barycenter (same period,
    // so the 180-degree offset is preserved as they advance).
    if (global.space.position.hasOwnProperty('gliese570b')){
        global.space.position.gliese570c = (global.space.position.gliese570b + 180) % 360;
    }
    // Epsilon Indi Ba & Bb are likewise a binary orbiting their barycenter, kept 180 degrees apart.
    if (global.space.position.hasOwnProperty('epsilonindiba')){
        global.space.position.epsilonindibb = (global.space.position.epsilonindiba + 180) % 360;
    }
}

// Distance between two points in AU. 
export function dist3(a,b){
    return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
}

// A body's orbital inclination in degrees. An explicit `inc` wins; everything else gets a small
// deterministic tilt from its id, so the decorative systems aren't perfectly flat discs when the map
// is turned. Nothing in the 0-6 degree range is a ship destination, so this can't move a target.
function orbitIncline(id){
    let body = spacePlanetStats[id];
    return body.hasOwnProperty('inc') ? body.inc : (texSeed(id) % 600) / 100;
}

// A moon's real orbit is far smaller than its planet's drawn disc — Luna runs 384,000 km out around
// an Earth the map draws 2.9 million km across — so at true scale every moon sits buried inside its
// primary at every zoom, which is what the old fixed nudges were working around.
//
// Bodies are already drawn at symbolic sizes rather than true scale, and moon orbits get the same
// treatment: one factor per planet, the least that lifts its moons clear of its disc, applied to
// every moon of that planet. Spacing *within* a system therefore stays exactly real — the Galilean
// moons keep Callisto 4.46 times as far out as Io — while each system is big enough to see. Applied
// inside orbitPoint so the drawn position, the orbit ring, click targets and the coordinates ships
// fly to are all the same number.
//
// Clearance is measured against the sum of the two discs, not the planet's alone: a moon drawn large
// next to its planet still has to get past it. Luna is half Earth's drawn radius, where no other
// moon here reaches a quarter of its primary's, so counting only the planet left the two touching.
// Every moon is checked rather than just the innermost, since the one that needs the most room is
// whichever has the worst size-to-distance ratio, not necessarily the closest in.
const MOON_ORBIT_CLEARANCE = 1.4;
const moonSpreadCache = {};
function moonSpread(parent){
    if (moonSpreadCache[parent] === undefined){
        let planet = spacePlanetStats[parent].size / 10;
        let want = 1;   // a planet with no moons, or moons already clear, is left alone
        for (let body of Object.values(spacePlanetStats)){
            if (body.parent !== parent){ continue; }
            want = Math.max(want, (planet + body.size / 10) * MOON_ORBIT_CLEARANCE / body.dist);
        }
        moonSpreadCache[parent] = want;
    }
    return moonSpreadCache[parent];
}

// The radius a body's orbit is drawn at, moon exaggeration included.
function orbitRadius(id){
    let body = spacePlanetStats[id];
    return body.parent ? body.dist * moonSpread(body.parent) : body.dist;
}

// Where a body sits at a given angle along its orbit, in AU from the Sun. Split out of genXYZcoord so
// the map can trace the exact path a body follows when it draws that body's orbit — the ring and the
// dot on it are then guaranteed to agree, at any camera angle.
export function orbitPoint(planet, deg){
    let body = spacePlanetStats[planet];
    let rad = deg * (Math.PI / 180);
    let inc = orbitIncline(planet) * (Math.PI / 180);
    let u, v, origin;
    if (body.parent){
        // A moon: a circle centred on wherever its planet is right now, travelled at its own
        // distance and its own period, rather than a second heliocentric orbit running a hair
        // outside its planet's. No eccentricity or x-shift — the major moons are near enough
        // circular, and borrowing the planet's would stretch the moon off its primary.
        origin = genXYZcoord(body.parent);
        let r = body.dist * moonSpread(body.parent);
        u = Math.cos(rad) * r;
        // Flipping the sine sends the moon round the other way as its angle advances: same circle,
        // same period, travelled backwards. See orbitDirection.
        v = Math.sin(rad) * r * orbitDirection(planet);
    }
    else if (body.star){
        // Bodies with a `star` (the Tau Ceti system) ride a clean circular orbit centered on that
        // star — no eccentricity or per-orbit x-shift — so the system reads as concentric rings.
        origin = genXYZcoord(body.star);
        u = Math.cos(rad) * body.dist * 1.2 + body.dist / 3;
        v = Math.sin(rad) * body.dist;
    }
    else {
        // A true ellipse with the Sun at a focus. `dist` is the semi-major axis, so periapsis lands
        // at dist·(1-ecc) on the +x side and apoapsis at dist·(1+ecc) opposite it, and the body is
        // placed by eccentric anomaly rather than by the raw angle so its speed varies the way a
        // real orbit's does.
        origin = { x: 0, y: 0, z: 0 };
        let ecc = orbitEcc(planet);
        let E = eccentricAnomaly(rad, ecc);
        u = body.dist * (Math.cos(E) - ecc);
        v = body.dist * Math.sqrt(1 - ecc * ecc) * Math.sin(E);
    }
    // Tilt about the line of nodes (the x axis). The orbit keeps its size and every point on it
    // keeps its distance from the primary; only its height above the reference plane changes.
    return { x: origin.x + u, y: origin.y + v * Math.cos(inc), z: origin.z + v * Math.sin(inc) };
}

// How far out of the plane a random point may stray by default, as a fraction of its distance from
// the target. A twentieth is a couple of degrees — enough to look scattered rather than perfectly
// flat, without lifting the point clear of the system it belongs to.
const RANDOM_COORD_SPREAD = 0.05;

// A random point lying between minAU and maxAU from a target, kept near that target's plane.
//
// `target` is either a spacePlanetStats id or any {x,y,z} point. Bearing around the target is
// uniform, and the radius is drawn through a square root so points spread evenly across the annulus
// instead of bunching against its inner edge.
//
// The out-of-plane axis is z. Bodies orbit in x/y and are tilted about x by their inclination (see
// orbitPoint), so z is the normal to the orbital plane and the one to hold near zero — spreading in
// x/y with a small z gives a point scattered across the system's disc, which is what staying "in the
// plane" means here. Pass `spreadAU` to set that deviation explicitly in AU.
export function randomCoord(target, minAU, maxAU, spreadAU){
    let origin = typeof target === 'string' ? genXYZcoord(target) : target;
    let min = Math.min(minAU, maxAU);
    let max = Math.max(minAU, maxAU);
    let dist = Math.sqrt(Math.random() * (max * max - min * min) + min * min);
    let bearing = Math.random() * Math.PI * 2;
    let spread = spreadAU === undefined ? dist * RANDOM_COORD_SPREAD : Math.abs(spreadAU);
    return {
        x: origin.x + Math.cos(bearing) * dist,
        y: origin.y + Math.sin(bearing) * dist,
        z: (origin.z) + (Math.random() * 2 - 1) * spread
    };
}

export function genXYZcoord(planet){
    // Temporary coordinates are fixed points held outside the table.
    let temp = tempCoord(planet);
    if (temp){ return { x: temp.x, y: temp.y, z: temp.z }; }
    // spc_survey is whichever moon the survey turned up, so it orbits as that body does.
    planet = resolveBody(planet);
    // A location that is neither in the table nor a live temp point — a signal that expired while a
    // ship sat on it, say. Fall back to the origin rather than throwing, which would take the map
    // and the tick loop down with it.
    if (!spacePlanetStats[planet]){ return { x: 0, y: 0, z: 0 }; }
    // Stars have fixed coordinates and are not positioned by distance/angle from the Sun.
    if (spacePlanetStats[planet].startype){
        return { x: spacePlanetStats[planet].x, y: spacePlanetStats[planet].y, z: spacePlanetStats[planet].z };
    }
    return orbitPoint(planet, global.space.position.hasOwnProperty(planet) ? global.space.position[planet] : 0);
}

// The star nearest a point (absolute Sun-frame coords), scanning every star in spacePlanetStats.
function nearestStar(pt){
    let best = 'spc_sun';
    let bestDist = Infinity;
    for (let [id, body] of Object.entries(spacePlanetStats)){
        if (!body.startype){ continue; }
        let d = dist3(pt, { x: body.x, y: body.y, z: body.z });
        if (d < bestDist){ bestDist = d; best = id; }
    }
    return best;
}

// The star a ship should be drawn relative to, as absolute Sun-frame coords. Ships store absolute
// coordinates that can be hundreds of thousands of AU from the origin; drawing those huge numbers
// directly loses canvas precision and distorts the ship marker (the same reason each star system is
// drawn in its own translated frame). Reference the nearer of the ship's origin-system star and its
// destination-system star, so a ship crossing between two systems keeps its origin star until it
// reaches the point equidistant from the two — the halfway point between them — then swaps to the
// destination star.
function shipRefStar(ship){
    let originStar = nearestStar(ship.origin.position || ship.location.position);
    let destStar = nearestStar(ship.destination.position || ship.location.position);
    if (originStar === destStar){ return genXYZcoord(originStar); }
    let dO = dist3(ship.location.position, genXYZcoord(originStar));
    let dD = dist3(ship.location.position, genXYZcoord(destStar));
    return genXYZcoord(dO <= dD ? originStar : destStar);
}

// ---- Wormhole / jump gate network ----------------------------------------------------------
// Extensible registry of jump gates and the directed wormhole links between them. A gate is a
// physical location (a spacePlanetStats key) belonging to a star system. When a ship crosses
// between two systems it is routed through a linked pair of active gates — an entry gate in its
// own system and an exit gate in the destination's — and covers the inter-gate leg at
// wormholeSpeedMult times its normal speed. To extend the network, add gates here and links
// below; a link is one-way, so list both directions for a two-way wormhole or a single direction
// for a one-way gate. New/not-yet-built gates can gate their availability via active().
const wormholeSpeedMult = 125000;
const jumpGates = {
    spc_sun_gate: {
        system: 'sun',
        location: 'spc_sun_gate',
        active(){ return global.tech['resettle'] && global.tech.resettle >= 3 ? true : false; }
    },
    tau_home_gate: {
        system: 'tauceti',
        location: 'tau_home',
        active(){ return global.tech['resettle'] && global.tech.resettle >= 3 ? true : false; }
    }
};
// Directed wormhole links. Two entries = a two-way wormhole; a single entry = a one-way gate.
const jumpLinks = [
    { from: 'spc_sun_gate', to: 'tau_home_gate' },
    { from: 'tau_home_gate', to: 'spc_sun_gate' }
];

// Which star system a location belongs to. Tau Ceti bodies carry star:'tauceti'; everything else
// (including the Tau Ceti star region itself) resolves explicitly, defaulting to the Sun system.
// --- Temporary coordinates ------------------------------------------------------------------
// global.race.tempCoordinates holds ad-hoc points a ship can be sent to — detected signals and the
// like — keyed by an id, each { n: display name, a: active, s: spacePlanetStats key of the star it
// sits at, x, y, z }. They are fixed points rather than table entries, so they neither orbit nor appear in
// spacePlanetStats, and every place that resolves a location has to know about them.
//
// `a` only gates whether the point is offered as a destination; a ship already sitting on an
// inactive one still has to resolve, so this ignores it.
function tempCoord(locationName){
    let temps = global.race['tempCoordinates'];
    return temps && typeof locationName === 'string' && temps.hasOwnProperty(locationName) ? temps[locationName] : false;
}

// The system a temp point belongs to, normalised to the keys locSystem hands out: 'sun' for the home
// system, otherwise the star's own id. `s` is a spacePlanetStats key, so this is mostly a pass
// through — it also tolerates `s` naming a body rather than its star, and falls back to the home
// system for anything unrecognised, which at worst costs a wormhole shortcut rather than the trip.
function tempSystem(entry){
    let body = entry.s ? spacePlanetStats[entry.s] : false;
    if (!body || entry.s === 'spc_sun'){ return 'sun'; }
    if (body.star){ return body.star; }
    return body.startype ? entry.s : 'sun';
}

function locSystem(locationName){
    let temp = tempCoord(locationName);
    if (temp){ return tempSystem(temp); }
    if (locationName === 'tauceti'){ return 'tauceti'; }
    locationName = resolveBody(locationName);
    return spacePlanetStats[locationName] && spacePlanetStats[locationName].star ? spacePlanetStats[locationName].star : 'sun';
}

// Display name of the star a location orbits. Empty when the location IS that star, so a destination
// like Tau Ceti itself isn't labelled with its own name twice. locSystem returns a system key rather
// than a table id, and the Sun's is 'sun' while its entry is spc_sun, hence the step across.
function locSystemName(locationName){
    // Temp points need no special case: their `s` is a table key, so locSystem resolves them to the
    // same system keys everything else uses and the label lookup below covers them.
    let sys = locSystem(locationName);
    if (locationName === sys){ return ''; }
    let star = sys === 'sun' ? spacePlanetStats.spc_sun : spacePlanetStats[sys];
    return star && star.label ? star.label : '';
}

// Find an active wormhole route (series of gate locations if any) connecting 
// fromLoc's system to toLoc's system, or null when cannot find a path.
// Uses A* to find optimal route when more gates are involved.
// Does not account for travel within a system, so solution might not be optimal in extreme edge cases
function findWormholeRoute(fromLoc, toLoc, interstellar){
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
        // Gate path not found, maybe interstellar?
        if (interstellar){
            // Go to best location to start journey, then launch from there
            let bestVal = Infinity;
            let bestSys = null;

            Object.entries(f_score).forEach(([sys, val]) => {
                if (val < bestVal){
                    bestVal = val;
                    bestSys = sys;
                }
            });

            let curSys = bestPos;
            while (curSys !== fromSys){
                total_path.unshift(curSys); 
                curSys = came_from[curSys];
            }
        }
        else {
            // Can't go interstellar
            return null;
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

// Plan a ship's trip to `locationName`. Returns the total transit time (days, computed up front),
// origin/destination coordinates, and a path of waypoints: 
// [entry gate -> exit gate].. -> final destination. 
// When not using any jump gates the returned path contains only the final destination.
function planShipTrip(ship, locationName){
    if (!ship.inTransit && ship.location.name === locationName) {
        return false;
    }

    let speed = shipSpeed(ship) / 225;

    // Check if the ship is currently travelling through a gate - it needs to exit first
    // before being able to change course
    let inGate = (ship.inTransit && ship.path[0].inGate);

    // Onpy allow starworthy ships to cross interstellar space, other ships must use jump gates to travel
    let interstellar = (ship.class === 'explorer');

    let path = [];
    let currentPosition = ship.location.position;
    let currentTime = 0;
    let route;
    if (inGate){
        path.push(ship.path[0]);
        currentPosition = ship.path[0].destination.position;
        currentTime = ship.timeToNextStep;

        route = findWormholeRoute(ship.path[0].destination.name, locationName, interstellar);
    }
    else {
        route = findWormholeRoute(ship.location.name, locationName, interstellar);
    }

    if (!route)
        return false;

    route.forEach(step => {
        let currentSpeed = speed;
        if (step.inGate)
            currentSpeed *= wormholeSpeedMult;

        let nextPosition = calcLandingPoint(currentPosition, step.location, currentSpeed, currentTime);
        let time = dist3(currentPosition, nextPosition) / currentSpeed;

        path.push({
            destination: {
                name: step.location,
                position: nextPosition
            },
            totalTime: time
        });
        
        currentPosition = nextPosition;
        currentTime += time;
    });

    return {
        path: path,
        totalTime: currentTime
    };
}

export function tpStorageMultiplier(type,heavy,wiki){
    let multiplier = 1;
    if (global.race['pack_rat']){
        multiplier *= 1 + (traits.pack_rat.vars()[1] / 100);
    }
    if (global.stats.achieve['blackhole']){
        multiplier *= 1 + global.stats.achieve.blackhole.l * 0.05;
    }
    if (global.tech['world_control']){
        multiplier *= 3;
    }
    switch (type){
        case 'storehouse':
        {
            let titan_spaceport_on = wiki ? (global.space?.titan_spaceport?.on ?? 0) : p_on['titan_spaceport'];
            if (titan_spaceport_on){
                multiplier *= 1 + (titan_spaceport_on * 0.25);
            }
            if (heavy && global.tech['shelving']){
                multiplier *= 2;
            }
            if (global.tech['shelving'] && global.tech.shelving >= 3){
                multiplier *= 1.5;
            }
        }
        case 'repository':
        {
            if (global.tech['isolation']){
                multiplier *= 3;
                if (global.tech['tp_depot']){
                    multiplier *= 1 + (global.tech['tp_depot'] / 20);
                }
            }
        }
        break;
    }
    return multiplier;
}

export function jumpGateShutdown(){
    let inactive = { city: {}, space: {}, ships: []};
    inactive.ships = [...global.space.shipyard.ships];
    global.space.shipyard.ships = [];

    global.settings.spaceTabs = 6;
    global.settings.showSpace = false;
    global.settings.showOuter = false
    global.settings.showCity = false;
    global.settings.showShipYard = false;
    if (global.settings.govTabs === 5){
        global.settings.govTabs = 0;
    }

    clearShipDrag();
    clearElement($('#shipList'));
    
    Object.keys(actions.city).forEach(function (k){
        if (global.city.hasOwnProperty(k) && global.city[k].hasOwnProperty('count')){
            if (global.race['hooved']){
                if (actions.city[k].cost?.hasOwnProperty('Horseshoe')){
                    global.race['shoecnt'] -= actions.city[k].cost.Horseshoe() * global.city[k].count;
                }
            }
            inactive.city[k] = {c: global.city[k].count};
            global.city[k].count = 0;
            if (global.city[k].hasOwnProperty('on')){
                inactive.city[k]['o'] = global.city[k].on;
                global.city[k].on = 0;
            }
        }
    });

    [
        'spc_home','spc_moon','spc_red','spc_hell','spc_sun','spc_gas','spc_gas_moon','spc_belt',
        'spc_dwarf','spc_titan','spc_enceladus','spc_triton','spc_makemake','spc_eris'
    ].forEach(function(sector){
        Object.keys(actions.space[sector]).forEach(function (k){
            if (global.space.hasOwnProperty(k) && global.space[k].hasOwnProperty('count')){
                if (global.race['hooved']){
                    if (actions.space[sector][k].cost?.hasOwnProperty('Horseshoe')){
                        global.race['shoecnt'] -= actions.space[sector][k].cost.Horseshoe() * global.space[k].count;
                    }
                }
                inactive.space[k] = {c: global.space[k].count};
                global.space[k].count = 0;
                if (global.space[k].hasOwnProperty('on')){
                    inactive.space[k]['o'] = global.space[k].on;
                    global.space[k].on = 0;
                }
            }
        });
    });

    if (global.race['hooved'] && global.race['shoecnt'] < 5){
        global.race.shoecnt = 5;
    }
    if (global.resource.Zen.display){
        global.resource.Zen.display = false;
    }
    if (global.resource.Slave.display){
        global.resource.Slave.display = false;
        global.resource.Slave.amount = 0;
        removeTask('slave');
    }
    if (global.race['deconstructor']){
        nf_resources.forEach(function (res){
            global.city.nanite_factory[res] = 0;
        });
    }
    Object.keys(global.resource).forEach(function (res){
        if (global.resource[res].hasOwnProperty('trade')){
            global.resource[res].trade = 0;
        }
    });

    Object.keys(job_desc).forEach(function (job){
        if (!['professor','scientist','pit_miner','cement_worker','craftsman'].includes(job)){
            global.civic[job].workers = 0;
            global.civic[job].assigned = 0;
        }
    });

    ['forager','farmer','lumberjack','quarry_worker','miner','coal_miner','priest','colonist','titan_colonist','space_miner'].forEach(function (job){
        global.civic[job].display = false;
    });

    if (global.civic.hunter.display){
        global.civic.d_job = 'hunter';
    }
    else {
        global.civic.d_job = 'unemployed';
    }

    if (global.arpa['sequence']){
        global.arpa.sequence.on = false;
        global.arpa.sequence.boost = false;
    }

    for (let building of Object.values(global.race.purgatory.city)){
        if (building.hasOwnProperty('count')){
            building.count = 0;
        }
        if (building.hasOwnProperty('on')){
            building.on = 0;
        }
    }
    for (let building of Object.values(global.race.purgatory.space)){
        if (building.hasOwnProperty('count')){
            building.count = 0;
        }
        if (building.hasOwnProperty('on')){
            building.on = 0;
        }
    }
    if (global.queue.hasOwnProperty('queue')){
        for (let i = global.queue.queue.length-1; i >= 0; i--){
            let item = global.queue.queue[i];
            if (item.action === 'city' || item.action === 'space' || item.action === 'starDock'){
                global.queue.queue.splice(i,1);
            }
        }
    }

    if (global.tech['magic'] && global.tech.magic >= 2){
        global.tauceti['pylon'] = { count: 0 };
        cancelRituals();
    }

    initStruct(tauCetiModules.tau_home.tauceti_casino);
    initStruct(tauCetiModules.tau_home.tau_housing);
    
    let pop = support_on['colony'] * tauCetiModules.tau_home.colony.citizens();
    if (global.resource[global.race.species].amount > pop){ global.resource[global.race.species].amount = pop; }

    removeTask('spy');
    removeTask('spyop');
    removeTask('combo_spy');
    defineGovernor();

    clearElement($(`#infoTimer`));
    global.race['inactive'] = inactive;
}

export function jumpGateRestart(){
    messageQueue(loc('tech_jump_jump_gate_msg'),'info',false,['progress']);
    let regions = {
        space: [
            'home','moon','red','hell','gas','gas_moon','belt','dwarf',
            'titan','enceladus','triton','eris','makemake'
        ]
    };
    Object.keys(regions).forEach(function(r){
        regions[r].forEach(function(v){
            if (global.settings[r].hasOwnProperty(v)){
                global.settings[r][v] = false;
            }
        });
    });

    Object.keys(global.race.inactive.space).forEach(function (k){
        if (global.space.hasOwnProperty(k) && global.space[k].hasOwnProperty('count')){
            global.space[k]['razed'] = global.race.inactive.space[k].c;
        }
    });

    global.space.jump_gate.count = 100;
    global.space.jump_gate.razed = 0;

    // Reserve the derelict the spc_sun "Salvage" building offers, so the choice (and the name on the
    // button) stays fixed until it is salvaged. That salvage targets a corvette and the button is what
    // grants the next resettle step, so pinSalvage builds one if none are adrift.
    pinSalvage('spc_sun','corvette');

    //global.settings.showSpace = true;
    //global.settings.civTabs = 1;
    //global.settings.spaceTabs = 1;
    //renderSpace();
}

export function loneSurvivor(){
    if (global.race['lone_survivor']){
        global.tech['alloy'] = 1;
        global.tech['alumina'] = 2;
        global.tech['asteroid'] = 7;
        global.tech['banking'] = 11;
        global.tech['biotech'] = 1;
        global.tech['boot_camp'] = 2;
        global.tech['container'] = 7;
        global.tech['copper'] = 1;
        global.tech['currency'] = 6;
        global.tech['disease'] = 2;
        global.tech['drone'] = 1;
        global.tech['elerium'] = 2;
        global.tech['explosives'] = 3;
        global.tech['factory'] = 3;
        global.tech['foundry'] = 8;
        global.tech['gambling'] = 4;
        global.tech['gas_giant'] = 1;
        global.tech['gas_moon'] = 2;
        global.tech['genesis'] = 2;
        global.tech['genetics'] = 2;
        global.tech['gov_corp'] = 1;
        global.tech['gov_fed'] = 1;
        global.tech['gov_soc'] = 1;
        global.tech['gov_theo'] = 1;
        global.tech['govern'] = 3;
        global.tech['graphene'] = 1;
        global.tech['helium'] = 1;
        global.tech['hell'] = 1;
        global.tech['high_tech'] = 13;
        global.tech['home_safe'] = 2;
        global.tech['housing'] = 3;
        global.tech['housing_reduction'] = 3;
        global.tech['makemake'] = 2;
        global.tech['launch_facility'] = 1;
        global.tech['luna'] = 2;
        global.tech['m_smelting'] = 2;
        global.tech['marines'] = 2;
        global.tech['mars'] = 5;
        global.tech['mass'] = 1;
        global.tech['medic'] = 3;
        global.tech['military'] = 8;
        global.tech['mine_conveyor'] = 1;
        global.tech['mining'] = 4;
        global.tech['monument'] = 1;
        global.tech['nano'] = 1;
        global.tech['oil'] = 7;
        global.tech['outer'] = 8;
        global.tech['pickaxe'] = 5;
        global.tech['polymer'] = 2;
        global.tech['primitive'] = 3;
        global.tech['q_factory'] = 1;
        global.tech['quantium'] = 1;
        global.tech['queue'] = 3;
        global.tech['r_queue'] = 1;
        global.tech['reproduction'] = 1;
        global.tech['rival'] = 1;
        global.tech['satellite'] = 1;
        global.tech['science'] = 9;
        global.tech['shelving'] = 3;
        global.tech['shipyard'] = 1;
        global.tech['smelting'] = 6;
        global.tech['solar'] = 5;
        global.tech['space'] = 6;
        global.tech['space_explore'] = 4;
        global.tech['space_housing'] = 1;
        global.tech['spy'] = 5;
        global.tech['stanene'] = 1;
        global.tech['steel_container'] = 6;
        global.tech['storage'] = 5;
        global.tech['swarm'] = 6;
        global.tech['syard_armor'] = 3;
        global.tech['syard_class'] = 6;
        global.tech['syard_engine'] = 5;
        global.tech['syard_power'] = 5;
        global.tech['syard_sensor'] = 4;
        global.tech['syard_weapon'] = 6;
        global.tech['syndicate'] = 0;
        global.tech['synthetic_fur'] = 1;
        global.tech['tau_home'] = 6;
        global.tech['tauceti'] = 4;
        global.tech['theology'] = 2;
        global.tech['titan'] = 9;
        global.tech['titan_ai_core'] = 3;
        global.tech['titan_power'] = 1;
        global.tech['titanium'] = 3;
        global.tech['trade'] = 3;
        global.tech['unify'] = 2;
        global.tech['uranium'] = 4;
        global.tech['v_train'] = 1;
        global.tech['vault'] = 4;
        global.tech['wharf'] = 1;
        global.tech['world_control'] = 1;
        global.tech['wsc'] = 0;

        // Note: Joyless cannot be completed in Lone Survivor, and there is no reward for trying.
        if (!global.race['joyless']){
            global.tech['theatre'] = 3;
            global.tech['broadcast'] = 2;
        }

        if (!global.race['flier']){
            global.tech['cement'] = 5;
            global.resource.Cement.display = true;
        }

        if (global.race.universe === 'magic'){
            global.tech['gov_mage'] = 1;
            global.tech['magic'] = 4;
            global.tech['conjuring'] = 2;
            global.resource.Mana.display = true;
            global.resource.Crystal.display = true;
            global.civic.crystal_miner.display = true;
            global.tauceti['pylon'] = { count: 0 };
            setupRituals(true);
        }
        if(global.race.universe === 'evil'){
            global.tech['reclaimer'] = 1;
        }

        global.settings.showSpace = false;
        global.settings.showTau = true;
        global.settings.tau.home = true;

        global.settings.showCity = false;
        global.settings.showIndustry = true;
        global.settings.showPowerGrid = true;
        global.settings.showResearch = true;
        global.settings.showCivic = true;
        global.settings.showResources = true;
        global.settings.showMarket = true;
        global.settings.showStorage = true;
        global.settings.civTabs = 1;
        global.settings.spaceTabs = 6;
        global.settings.showGenetics = true;
        global.settings.arpa.physics = true;
        global.settings.arpa.genetics = true

        global.resource[global.race.species].display = true;
        global.resource.Knowledge.display = true;
        global.resource.Money.display = true;
        global.resource.Crates.display = true;
        global.resource.Containers.display = true;

        global.resource.Food.display = true;
        global.resource.Stone.display = true;
        global.resource.Furs.display = true;
        global.resource.Copper.display = true;
        global.resource.Iron.display = true;
        global.resource.Aluminium.display = true;
        global.resource.Coal.display = true;
        global.resource.Oil.display = true;
        global.resource.Uranium.display = true;
        global.resource.Steel.display = true;
        global.resource.Titanium.display = true;
        global.resource.Alloy.display = true;
        global.resource.Polymer.display = true;
        global.resource.Iridium.display = true;
        global.resource.Helium_3.display = true;

        global.resource.Water.display = true;
        global.resource.Neutronium.display = true;
        global.resource.Adamantite.display = true;
        global.resource.Elerium.display = true;
        global.resource.Nano_Tube.display = true;
        global.resource.Graphene.display = true;
        global.resource.Stanene.display = true;
        global.resource.Orichalcum.display = true;
        global.resource.Bolognium.display = true;
        global.resource.Unobtainium.display = true;

        global.resource.Brick.display = true;
        global.resource.Wrought_Iron.display = true;
        global.resource.Sheet_Metal.display = true;
        global.resource.Mythril.display = true;
        global.resource.Quantium.display = true;
        global.resource.Cipher.display = true;

        if (!global.race['kindling_kindred'] && !global.race['smoldering']){
            global.civic.lumberjack.display = true;
            global.resource.Lumber.display = true;
            global.resource.Plywood.display = true;
            global.resource.Lumber.max = 10000000;
            global.resource.Lumber.amount = 10000000;
            global.resource.Plywood.amount = 2500000;
            global.resource.Lumber.crates = 25;
            global.resource.Lumber.containers = 25;
            global.tech['axe'] = 5;
        }
        if (global.race['smoldering']){
            global.resource.Chrysotile.display = true;
            global.resource.Chrysotile.max = 5000000;
            global.resource.Chrysotile.amount = 5000000;
        }
        if (!global.race['sappy']){
            global.tech['hammer'] = 4;
        }
        if (!global.race['apex_predator']){
            global.tech['armor'] = 3;
        }

        global.resource[global.race.species].max = 1;
        global.resource[global.race.species].amount = 1;
        global.resource.Crates.amount = 1000;
        global.resource.Containers.amount = 1000;
        global.resource.Money.max = 1000000000;
        global.resource.Money.amount = 1000000000;
        global.resource.Knowledge.max = 4321200;
        global.resource.Knowledge.amount = 4321200;
        global.resource.Food.max = 10000;
        global.resource.Food.amount = 10000;
        global.resource.Oil.max = 500000;
        global.resource.Oil.amount = 500000;
        global.resource.Helium_3.max = 500000;
        global.resource.Helium_3.amount = 500000;
        global.resource.Water.max = 25000;
        global.resource.Water.amount = 25000;
        global.resource.Uranium.max = 500000;
        global.resource.Uranium.amount = 500000;
        global.resource.Stone.max = 10000000;
        global.resource.Stone.amount = 10000000;
        global.resource.Furs.max = 5000000;
        global.resource.Furs.amount = 5000000;
        global.resource.Copper.max = 5000000;
        global.resource.Copper.amount = 5000000;
        global.resource.Iron.max = 5000000;
        global.resource.Iron.amount = 5000000;
        global.resource.Steel.max = 5000000;
        global.resource.Steel.amount = 5000000;
        global.resource.Aluminium.max = 5000000;
        global.resource.Aluminium.amount = 5000000;
        global.resource.Cement.max = 5000000;
        global.resource.Cement.amount = 5000000;
        global.resource.Titanium.max = 5000000;
        global.resource.Titanium.amount = 5000000;
        global.resource.Coal.max = 5000000;
        global.resource.Coal.amount = 5000000;
        global.resource.Alloy.max = 5000000;
        global.resource.Alloy.amount = 5000000;
        global.resource.Polymer.max = 5000000;
        global.resource.Polymer.amount = 5000000;
        global.resource.Iridium.max = 5000000;
        global.resource.Iridium.amount = 5000000;
        global.resource.Neutronium.max = 500000;
        global.resource.Neutronium.amount = 500000;
        global.resource.Adamantite.max = 5000000;
        global.resource.Adamantite.amount = 5000000;
        global.resource.Elerium.max = 1000;
        global.resource.Elerium.amount = 1000;
        global.resource.Nano_Tube.max = 5000000;
        global.resource.Nano_Tube.amount = 5000000;
        global.resource.Graphene.max = 5000000;
        global.resource.Graphene.amount = 5000000;
        global.resource.Stanene.max = 5000000;
        global.resource.Stanene.amount = 5000000;
        global.resource.Bolognium.max = 5000000;
        global.resource.Bolognium.amount = 5000000;
        global.resource.Orichalcum.max = 5000000;
        global.resource.Orichalcum.amount = 5000000;
        global.resource.Brick.amount = 2500000;
        global.resource.Wrought_Iron.amount = 2500000;
        global.resource.Sheet_Metal.amount = 2500000;
        global.resource.Mythril.amount = 2500000;
        global.resource.Quantium.amount = 2500000;

        if (!global.race['artifical']){
            global.resource.Food.crates = 10;
            global.resource.Food.containers = 10;
        }
        global.resource.Stone.crates = 25;
        global.resource.Stone.containers = 25;
        global.resource.Furs.crates = 25;
        global.resource.Furs.containers = 25;
        global.resource.Coal.crates = 10;
        global.resource.Coal.containers = 10;
        global.resource.Copper.crates = 25;
        global.resource.Copper.containers = 25;
        global.resource.Iron.crates = 25;
        global.resource.Iron.containers = 25;
        global.resource.Aluminium.crates = 25;
        global.resource.Aluminium.containers = 25;
        global.resource.Steel.crates = 25;
        global.resource.Steel.containers = 25;
        global.resource.Titanium.crates = 25;
        global.resource.Titanium.containers = 25;
        global.resource.Alloy.crates = 25;
        global.resource.Alloy.containers = 25;
        global.resource.Polymer.crates = 25;
        global.resource.Polymer.containers = 25;
        global.resource.Iridium.crates = 25;
        global.resource.Iridium.containers = 25;
        global.resource.Adamantite.crates = 25;
        global.resource.Adamantite.containers = 25;
        global.resource.Graphene.crates = 25;
        global.resource.Graphene.containers = 25;
        global.resource.Stanene.crates = 25;
        global.resource.Stanene.containers = 25;
        global.resource.Bolognium.crates = 25;
        global.resource.Bolognium.containers = 25;
        global.resource.Orichalcum.crates = 25;
        global.resource.Orichalcum.containers = 25;

        global.civic.taxes.display = true;

        if (!global.race['flier']){
            global.civic.cement_worker.display = true;
            global.resource.Cement.crates = 25;
            global.resource.Cement.containers = 25;
        }

        if (!global.race['sappy']){
            global.civic.quarry_worker.display = true
        }
        global.civic.professor.display = true;
        global.civic.scientist.display = true;
        global.civic.banker.display = true;
        global.civic.pit_miner.display = true;

        global.civic.professor.max = 1;
        global.civic.professor.workers = 1;

        global.city.calendar.day++;
        global.city.market.active = true;
        global.city['power'] = 0;
        global.city['powered'] = true;

        if (global.race['artifical']){
            global.city['transmitter'] = { count: 0, on: 0 };
        }

        initStruct(actions.city.factory);
        initStruct(actions.city.foundry);
        initStruct(actions.city.smelter);

        initStruct(actions.city.amphitheatre);
        initStruct(actions.city.apartment);
        initStruct(actions.city.bank);
        initStruct(actions.city.basic_housing);
        initStruct(actions.city.biolab);
        initStruct(actions.city.boot_camp);
        initStruct(actions.city.casino);
        initStruct(actions.city.cement_plant);
        initStruct(actions.city.coal_mine);
        initStruct(actions.city.coal_power);
        initStruct(actions.city.cottage);
        initStruct(actions.city.fission_power);
        initStruct(actions.city.garrison);
        initStruct(actions.city.hospital);
        initStruct(actions.city.library);
        initStruct(actions.city.lumber_yard);
        initStruct(actions.city.mass_driver);
        initStruct(actions.city.metal_refinery);
        initStruct(actions.city.mine);
        initStruct(actions.city.oil_depot);
        initStruct(actions.city.oil_power);
        initStruct(actions.city.oil_well);
        initStruct(actions.city.rock_quarry);
        initStruct(actions.city.sawmill);
        initStruct(actions.city.shed);
        initStruct(actions.city.storage_yard);
        initStruct(actions.city.temple);
        initStruct(actions.city.tourist_center);
        initStruct(actions.city.trade);
        initStruct(actions.city.university);
        initStruct(actions.city.wardenclyffe);
        initStruct(actions.city.warehouse);
        initStruct(actions.city.wharf);

        initStruct(actions.space.spc_belt.elerium_ship);
        initStruct(actions.space.spc_belt.iridium_ship);
        initStruct(actions.space.spc_belt.iron_ship);
        initStruct(actions.space.spc_belt.space_station);
        initStruct(actions.space.spc_dwarf.e_reactor);
        initStruct(actions.space.spc_dwarf.elerium_contain);
        initStruct(actions.space.spc_dwarf.mass_relay); global.space.mass_relay.count = 100;
        initStruct(actions.space.spc_dwarf.shipyard);
        initStruct(actions.space.spc_enceladus.munitions_depot);
        initStruct(actions.space.spc_enceladus.operating_base);
        initStruct(actions.space.spc_enceladus.water_freighter);
        initStruct(actions.space.spc_enceladus.zero_g_lab);
        initStruct(actions.space.spc_eris.digsite);
        initStruct(actions.space.spc_eris.drone_control);
        initStruct(actions.space.spc_eris.shock_trooper);
        initStruct(actions.space.spc_eris.tank);
        initStruct(actions.space.spc_gas.gas_mining);
        initStruct(actions.space.spc_gas.gas_storage);
        initStruct(actions.space.spc_gas_moon.drone);
        initStruct(actions.space.spc_gas_moon.oil_extractor);
        initStruct(actions.space.spc_gas_moon.outpost);
        initStruct(actions.space.spc_hell.geothermal);
        initStruct(actions.space.spc_hell.hell_smelter);
        initStruct(actions.space.spc_hell.spc_casino);
        initStruct(actions.space.spc_hell.swarm_plant);
        initStruct(actions.space.spc_home.gps);
        initStruct(actions.space.spc_home.nav_beacon);
        initStruct(actions.space.spc_home.propellant_depot);
        initStruct(actions.space.spc_home.satellite);
        initStruct(actions.space.spc_makemake.elerium_mine);
        initStruct(actions.space.spc_makemake.neutronium_mine);
        initStruct(actions.space.spc_makemake.orichalcum_mine);
        initStruct(actions.space.spc_makemake.uranium_mine);
        initStruct(actions.space.spc_moon.helium_mine);
        initStruct(actions.space.spc_moon.iridium_mine);
        initStruct(actions.space.spc_moon.moon_base);
        initStruct(actions.space.spc_moon.observatory);
        initStruct(actions.space.spc_red.biodome);
        initStruct(actions.space.spc_red.exotic_lab);
        initStruct(actions.space.spc_red.fabrication);
        initStruct(actions.space.spc_red.garage);
        initStruct(actions.space.spc_red.living_quarters);
        initStruct(actions.space.spc_red.red_factory);
        initStruct(actions.space.spc_red.red_mine);
        initStruct(actions.space.spc_red.red_tower);
        initStruct(actions.space.spc_red.space_barracks);
        initStruct(actions.space.spc_red.spaceport);
        initStruct(actions.space.spc_red.vr_center);
        initStruct(actions.space.spc_red.ziggurat);
        initStruct(actions.space.spc_sun.swarm_control);
        initStruct(actions.space.spc_sun.swarm_satellite);
        initStruct(actions.space.spc_titan.ai_colonist);
        initStruct(actions.space.spc_titan.decoder);
        initStruct(actions.space.spc_titan.electrolysis);
        initStruct(actions.space.spc_titan.g_factory);
        initStruct(actions.space.spc_titan.hydrogen_plant);
        initStruct(actions.space.spc_titan.storehouse);
        initStruct(actions.space.spc_titan.titan_bank);
        initStruct(actions.space.spc_titan.titan_mine);
        initStruct(actions.space.spc_titan.titan_quarters);
        initStruct(actions.space.spc_titan.titan_spaceport);
        initStruct(actions.space.spc_triton.crashed_ship); global.space.crashed_ship.count = 100;
        initStruct(actions.space.spc_triton.fob);
        initStruct(actions.space.spc_triton.lander);

        initStruct(actions.tauceti.tau_gas.refueling_station);
        initStruct(actions.tauceti.tau_home.alien_outpost); global.tauceti.alien_outpost.count = 1; global.tauceti.alien_outpost.on = 1;
        initStruct(actions.tauceti.tau_home.colony); global.tauceti.colony.count = 1; global.tauceti.colony.on = 1;
        initStruct(actions.tauceti.tau_home.fusion_generator); global.tauceti.fusion_generator.count = 1; global.tauceti.fusion_generator.on = 1;
        initStruct(actions.tauceti.tau_home.infectious_disease_lab);
        initStruct(actions.tauceti.tau_home.mining_pit); global.tauceti.mining_pit.count = 1; global.tauceti.mining_pit.on = 1;
        initStruct(actions.tauceti.tau_home.orbital_station); global.tauceti.orbital_station.count = 1; global.tauceti.orbital_station.on = 1;
        initStruct(actions.tauceti.tau_home.repository); global.tauceti.repository.count = 2;
        initStruct(actions.tauceti.tau_home.tauceti_casino);
        initStruct(actions.tauceti.tau_red.orbital_platform);

        global.space['ai_core'] = { count: 100 };
        global.space['ai_core2'] = { count: 0, on: 0 };
        global.space['m_relay'] = { count: 0, on: 0 };

        global.arpa['sequence'] = {
            max: 50000,
            progress: 0,
            time: 50000,
            on: true,
            boost: false,
            auto: false,
            labs: 0,
        };

        global.tech['stock_exchange'] = 0;
        global.tech['monuments'] = 0;
        global.tech['supercollider'] = 0;
        global.tech['tp_depot'] = 0;
        global.tech['railway'] = 0;
        global.tech['isolation'] = 1;
        global.race['truepath'] = 1;
        global.arpa['m_type'] = arpa('Monument');

        drawTech();
        renderTauCeti();
        arpa('Physics');
        loadFoundry();
    }
}

export function calcAIDrift(wiki){
    let drift = 0;
    let ai_colonist_on = wiki ? global.space.ai_colonist.on : p_on['ai_colonist'];
    let decoder_on = wiki ? global.space.decoder.on : support_on['decoder'];
    let shock_trooper_on = wiki ? global.space.shock_trooper.on : support_on['shock_trooper'];
    let tank_on = wiki ? global.space.tank.on : support_on['tank'];
    if (ai_colonist_on && decoder_on){
        drift += ai_colonist_on * decoder_on * 0.35;
    }
    if (shock_trooper_on){
        drift += shock_trooper_on * 2;
    }
    if (tank_on){
        drift += tank_on * 2;
    }
    if (drift > 100){
        drift = 100;
    }
    return drift;
}

// --- Orbital shape ------------------------------------------------------------------------------
// Heliocentric orbits are real ellipses with the Sun at a focus, built from each body's own eccentricity (the `ecc` field). 

// How elliptical the home planet's orbit is under the `elliptical` planet trait.
const ELLIPTICAL_TRAIT_ECC = 0.2;

// Whether the world this run started on carries a given planet trait. Guarded because the wiki
// imports this module and renders map pieces without a city to read the traits off.
function homeTrait(trait){
    return global.city && global.city.ptrait ? global.city.ptrait.includes(trait) : false;
}

function orbitEcc(id){
    let body = spacePlanetStats[id];
    // Stars are placed by fixed coordinates, not by an orbit.
    if (!body || body.orbit === -2){ return 0; }
    if (id === 'spc_home' && homeTrait('elliptical')){ return ELLIPTICAL_TRAIT_ECC; }
    return body.hasOwnProperty('ecc') ? body.ecc : 0;
}

// Which way round a body travels: 1 the usual way, -1 backwards.
function orbitDirection(id){
    return id === 'spc_moon' && homeTrait('retrograde') ? -1 : 1;
}

// Solve Kepler's equation, M = E - e·sin(E), for the eccentric anomaly.
//
// The angle the game stores and advances at a constant rate (see the position update in main.js) is
// the mean anomaly — the one that really does tick uniformly with time. Converting it to the
// eccentric anomaly is what makes a body sweep equal areas in equal times, so it runs fastest at
// perihelion and slowest at aphelion, as a real planet does. Newton's method settles this in three
// or four passes at any eccentricity the map carries; the loop is capped so no input can spin it.
const KEPLER_STEPS = 8;
const KEPLER_TOL = 1e-10;
function eccentricAnomaly(M, ecc){
    if (!(ecc > 0)){ return M; }
    // M near pi is where the plain guess converges slowest, so start from pi for the eccentric
    // orbits where it matters.
    let E = ecc < 0.8 ? M : Math.PI;
    for (let i = 0; i < KEPLER_STEPS; i++){
        let d = (E - ecc * Math.sin(E) - M) / (1 - ecc * Math.cos(E));
        E -= d;
        if (Math.abs(d) < KEPLER_TOL){ break; }
    }
    return E;
}

var mapScale, mapShift;
// spacePlanetStats key of the star the pointer is resting on, or false. Only set once zoomed out past
// the point where the star labels are still legible (see starNamesHidden and the hover label at the end
// of drawMap).
var mapHover = false;
// Where the pointer was when it picked that star, in canvas-local pixels — the same frame mapShift is
// in. The hover name is placed off this rather than off the star, so it clears the cursor.
var mapHoverAt = { x: 0, y: 0 };

// --- Solar map camera ---------------------------------------------------------------------------
// Orthographic projection. `mapYaw` spins the map about the vertical (z) axis; `mapPitch` tips the
// reference plane toward the viewer, so +z reads as up on screen. At (0,0) the projection is the
// identity, which is why the map opens on exactly the flat top-down view it has always shown.
//
// The projection is linear, and that is what lets each star system keep being drawn in its own
// translated frame: projecting a star's position and then projecting small offsets around it gives
// the same answer as projecting absolute coordinates, without feeding hundreds of thousands of AU
// through the canvas transform and losing precision.
var mapYaw = 0, mapPitch = 0;
// Which way the camera faces by default, as a yaw, for the star the view is settling on.
//
// Sol opens turned half a turn. Its orbits are real ellipses with the Sun at a focus, so each one
// runs long toward -x and short toward +x; a half turn puts that long side on the right of the
// screen, which is the side it sat on while the orbits were still drawn as a stretch about an
// offset centre, and the side the Tau Ceti system's orbits still favour. Every other star keeps
// the plain top-down view, so nothing else moves.
const SOL_DEFAULT_YAW = Math.PI;
function mapDefaultYaw(target){
    return target === 'spc_sun' ? SOL_DEFAULT_YAW : 0;
}
// What the map draws, as opposed to where it is looking. These live in global.settings (see mapView
// in vars.js) so they are saved with everything else the player has set, rather than lasting only as
// long as the page is open — unlike the pan, zoom and rotation, which are deliberately reset each
// time the map opens.
//
// Orbit rings are split into the two kinds because a moon's ring is a tight circle sitting right on
// top of its planet, and is the one most worth clearing away on its own once you are zoomed into a
// system. Ships covers yours and the horde's alike, since either can bury the thing you are trying
// to look at. Names covers planets and moons only — star names are deliberately excluded, because
// zoomed out they are the only thing telling one dot from another.
function mapView(){
    return global.settings.mapView;
}
// The world point at the centre of the viewport (see recenterOn/refocus in buildSolarMap). Also what
// distant-star culling measures from.
var mapFocus = { x: 0, y: 0, z: 0 };
// Whether the map should be locked onto a star when zooming. Set when clicking a star, reset when panning away.
// Zooming with scroll follows cursor when unlocked, and center of screen (where the locked star is) when locked.
var starLockOn = false;
// Every body drawn big enough to make out, recorded in screen pixels as drawMap lays it down:
// { id, x, y, r }. Hit-testing against what was actually painted is exact — the alternative is
// re-deriving each body's projected size and its distance-based minimum outside the draw, and any
// drift between the two shows up as a click that misses the thing under the pointer.
var mapPickable = [];
// Which bodies drawMap actually put a name on this frame, as a set of ids. Recorded where the label
// is drawn rather than worked out again afterwards, for the same reason mapPickable is: the
// conditions that decide whether a name appears are spread across zoom, reveal state and the
// planetNames toggle, and any second copy of them would eventually disagree with the first. The
// hover label reads this to fill in only what is missing.
var mapLabelled = {};

// Below this scale the map is showing planets as points and planet names give way to star
// names; at or above it a system's own planets are made out individually.
const planetLabelMinScale = 4;
// Below this scale the map is showing entire systems as points, with multiple systems
// potentially on screen and system names becoming cluttered
// Label sizes stop having constant size, instead decreasing
// with zoom as the scale further decreases
const systemLabelMinScale = 0.0015;
// Below this scale the labels' sizes become too small to legibly read; completely stop drawing 
// them at this point. Instead start displaying star names on hover.
const systemLabelAbsMinScale = 0.0006;
// Once a system's planets are legible, stars further than this from the point being looked at are
// skipped — about a light year, so anything cut is at least a quarter of a million pixels off screen
// at that zoom. Culling them costs nothing visually and saves drawing a hundred systems' worth of
// orbits and bodies that could never be seen.
const STAR_CULL_AU = 63000;
// A true distance through space, which needs mapFocus to be at the right depth — see refocus(). A
// screen-plane distance would instead keep any star that merely lines up with the view: Lalande
// 21185 sits only 45,000 AU to the side of Tau Ceti while being 1.2 million AU beyond it, and would
// have had its whole system drawn over Tau Ceti's.
function starCulled(pos){
    return mapScale >= planetLabelMinScale && dist3(pos, mapFocus) > STAR_CULL_AU;
}
// Zoomed out this far the star names would be too small to read, which is the point at which naming whatever
// the pointer is over stops being redundant and starts being the only way to tell what you are seeing.
function starNamesHidden(){
    return mapScale < systemLabelAbsMinScale;
}
// The name to show for a home-system body, or false if it has none.
//
// A body that is somewhere you can go is named by its space action — the same race-flavoured name
// the map labels it with. Everything else in the Sol system is scenery with no action behind it,
// and falls back to the real name of the world it stands for (see SOL_BODY_LABEL).
//
// Deliberately not gated on the reveal flags the label pass consults (showDest().l, or the sector's
// settings entry). Those decide whether the name is printed beside the body, which is the very
// thing hovering is here to make up for — Eris is drawn from the start but goes unlabelled, and
// under that gate it was the one world you could see and still not identify. What matters instead
// is whether the body is on the map at all, and that is already settled: showDest().r keeps an
// undrawn body out of the draw, and only bodies that were drawn reach the pick list this reads.
function bodyName(id){
    let planet = spacePlanetStats[id];
    if (!planet || planet.startype || planet.star){ return false; }
    if (global.race['orbit_decayed'] && id === 'spc_home'){ return false; }
    if (actions.space[id] && actions.space[id].info){
        let nameRef = actions.space[id].info.name;
        return typeof nameRef === 'function' ? nameRef() : nameRef;
    }
    return SOL_BODY_LABEL[id] ? planetName()[SOL_BODY_LABEL[id]] : false;
}

// The name to float beside the cursor for whatever it is resting on, or false for nothing to say.
//
// A star answers only once its own label has shrunk away, which is the case the hover label was
// built for. A planet or moon answers whenever names are switched on and the map is not already
// showing that one — pointing at a world the map has left unlabelled tells you what it is, and
// pointing at one that is labelled anyway does not repeat it.
function hoverName(id){
    let body = spacePlanetStats[id];
    if (!body){ return false; }
    if (body.startype){ return starNamesHidden() ? (body.zlabel || body.label) : false; }
    return mapView().planetNames && !mapLabelled[id] ? bodyName(id) : false;
}

// A moon's name is set beside it rather than above it, where its planet is not, and by a fixed
// number of screen pixels so the gap holds at any zoom.
const MOON_LABEL_GAP_PX = 6;
// The hover name is drawn in screen space instead, so it is this readable at any zoom.
const HOVER_LABEL_PX = 16;
// Clearance above the cursor. The name goes above rather than below because the arrow hangs down and to
// the right of its hotspot, so anything under the pointer ends up behind it. Anchored to the cursor
// rather than to the star: the grab radius lets the pointer sit either side of the dot, and measuring
// from the dot put the label back under the arrow whenever the pointer was above it.
const HOVER_LABEL_GAP_PX = 8;
let camCY = 1, camSY = 0, camCP = 1, camSP = 0;
function camUpdate(){
    camCY = Math.cos(mapYaw); camSY = Math.sin(mapYaw);
    camCP = Math.cos(mapPitch); camSP = Math.sin(mapPitch);
}
// Fold an angle back into (-pi, pi] so a long drag can't wind the camera up indefinitely.
function wrapAngle(a){
    a = (a + Math.PI) % (Math.PI * 2);
    return (a < 0 ? a + Math.PI * 2 : a) - Math.PI;
}
function pX(p){ return p.x * camCY - p.y * camSY; }
function pY(p){ return (p.x * camSY + p.y * camCY) * camCP - (p.z) * camSP; }
// Depth for painter's-algorithm ordering. This axis completes a right-handed frame with screen-right
// and screen-down, and the canvas y axis points down, so it runs INTO the screen: larger = further
// away. Sort descending and draw in that order, so the last thing painted is the nearest.
function pD(p){ return (p.x * camSY + p.y * camCY) * camSP + (p.z) * camCP; }
// A world point expressed relative to a frame origin, ready to project.
function rel(p, o){ return { x: p.x - o.x, y: p.y - o.y, z: (p.z) - (o.z) }; }

// Trace a body's orbit as a projected polyline. Sampling the same orbitPoint() the body itself is
// positioned by guarantees the ring and the dot on it agree at every camera angle — an analytic
// ellipse would have to be re-derived for each rotation, and would drift from the body.
const ORBIT_STEPS = 96;
// Smallest orbit worth tracing, as a radius in screen pixels. Below this the ring is a smudge on top
// of its own star and reads as noise, and at the fully zoomed-out star field there are a hundred
// systems' worth of them costing a third of the frame. Measured on the orbit's own radius rather
// than its projected extent, so tilting the camera edge-on — which squashes a ring to a line but
// leaves it perfectly visible — doesn't make orbits disappear.
const ORBIT_MIN_PX = 3;
// Ship markers are drawn at a constant size on screen, in pixels.
const SHIP_DOT_PX = 3;
const SHIP_LABEL_PX = 5;

// Unanswered distress signals, also sized in screen pixels: they are points in space with no radius
// to draw, and the pulse is what tells a live signal apart from the scenery around it.
const BEACON_DOT_PX = 3;
const BEACON_HALO_PX = 11;
const BEACON_LABEL_PX = 6;
const BEACON_PULSE_MS = 1600;
const BEACON_COLOR = '0, 255, 102';
// 0 at the trough of the swell, 1 at its peak. A cosine so the pulse has no corners in it.
function beaconPulse(){
    return (1 - Math.cos(Date.now() / BEACON_PULSE_MS * Math.PI * 2)) / 2;
}
// Signals still waiting on an answer. A beacon a ship has reached keeps its coordinates — a ship
// parked on one still has to resolve — but stops advertising itself, so it stops pulsing as well.
function liveBeacons(){
    let temps = global.race['tempCoordinates'];
    if (!temps){ return []; }
    return Object.keys(temps).filter(k => temps[k] && temps[k].a).map(k => temps[k]);
}

// How close an orbit comes to its primary, sampled from the same orbitPoint the body travels so the
// eccentricity and off-centre focus are taken into account rather than assumed.
function orbitMinRadius(id, origin){
    let min = Infinity;
    for (let i = 0; i < 24; i++){
        let q = rel(orbitPoint(id, i * 15), origin);
        min = Math.min(min, Math.hypot(q.x, q.y, q.z));
    }
    return min;
}

// Bodies are drawn at symbolic sizes, nothing like true scale — 0.1 map units for an M dwarf is some
// twenty times the real Sun's radius — so around a star with a genuinely close-in world, like
// Gliese 876 d at 0.021 AU, the disc swallows the orbit whole.
//
// The answer is one shrink factor for the entire system rather than a smaller star: the sizes only
// carry meaning relative to each other, and shrinking the star alone left it drawn smaller than its
// own planets. The factor is the least that brings the star inside its innermost orbit; systems
// whose orbits are already roomy, the home system among them, come back 1 and are untouched.
const STAR_ORBIT_CLEARANCE = 0.9;

// Bodies are drawn at true relative size, which puts Earth at a fifth of a pixel on any zoom that
// also shows the Sun. Once a body has pulled far enough from its primary to read as a dot of its
// own, floor it at a pixel so it stays on the map; while it is still sitting on top of its star,
// leave it sub-pixel, or every zoomed-out system becomes a clump of identical specks.
const BODY_SEPARATION_PX = 4;
function visibleRadius(r, offsetPx){
    return offsetPx >= BODY_SEPARATION_PX ? Math.max(r, 1 / mapScale) : r;
}
function systemScale(starSize, ids, origin){
    let want = starSize / 10;
    if (want <= 1 / mapScale){ return 1; }     // zoomed out: orbits are sub-pixel, nothing to clear
    let clear = Infinity;
    for (let id of ids){
        clear = Math.min(clear, orbitMinRadius(id, origin));
    }
    if (clear === Infinity || want <= clear * STAR_ORBIT_CLEARANCE){ return 1; }
    return clear * STAR_ORBIT_CLEARANCE / want;
}

function strokeOrbit(ctx, id, origin){
    ctx.beginPath();
    for (let i = 0; i <= ORBIT_STEPS; i++){
        let q = rel(orbitPoint(id, i * 360 / ORBIT_STEPS), origin);
        let sx = pX(q), sy = pY(q);
        if (i === 0){ ctx.moveTo(sx, sy); } else { ctx.lineTo(sx, sy); }
    }
    ctx.stroke();
}

// Bisection steps used to pin down where an orbit passes its primary's depth. Unlike a planet's
// rings, whose depth around the ring is a plain sinusoid that can be solved outright, an orbit is
// not a clean circle — it is an ellipse with the star at a focus, and the angle it is sampled by is
// the mean anomaly rather than a position angle — so the crossing is found numerically instead.
// Twelve halvings take an interval of under four degrees to well
// under a thousandth of one, which is far finer than a pixel at any zoom and is what stops a seam
// opening where the two halves meet.
const ORBIT_CROSS_STEPS = 12;

// One side of an orbit: the arc that passes in front of the body it circles, or the arc behind it.
// Drawing a ring in two halves either side of its primary is what lets it cross over that body
// instead of always vanishing behind it, the same way a planet's rings are laid down.
//
// `primary` is the position of the body being orbited and `origin` the frame to plot in; they differ
// for a moon, whose ring is centred on its planet but drawn in the Sun's frame.
function strokeOrbitSide(ctx, id, origin, primary, near){
    let step = 360 / ORBIT_STEPS;
    // Sampled once and reused. orbitPoint on a moon resolves its planet's position too, so this is
    // the costly part of tracing a ring and it should not be repeated per lookup.
    let pts = [], on = [];
    for (let i = 0; i <= ORBIT_STEPS; i++){
        let p = orbitPoint(id, i * step);
        pts.push(p);
        on.push((pD(rel(p, primary)) < 0) === near);
    }
    let crossing = (a, b, sideA) => {
        for (let i = 0; i < ORBIT_CROSS_STEPS; i++){
            let m = (a + b) / 2;
            if (((pD(rel(orbitPoint(id, m), primary)) < 0) === near) === sideA){ a = m; } else { b = m; }
        }
        return orbitPoint(id, (a + b) / 2);
    };
    let plot = (p, move) => {
        let q = rel(p, origin);
        if (move){ ctx.moveTo(pX(q), pY(q)); } else { ctx.lineTo(pX(q), pY(q)); }
    };
    let drawing = false;
    ctx.beginPath();
    for (let i = 0; i <= ORBIT_STEPS; i++){
        if (on[i]){
            if (!drawing){
                plot(i > 0 ? crossing((i - 1) * step, i * step, on[i - 1]) : pts[i], true);
                drawing = true;
                if (i > 0){ plot(pts[i], false); }
            }
            else { plot(pts[i], false); }
        }
        else if (drawing){
            plot(crossing((i - 1) * step, i * step, on[i - 1]), false);
            drawing = false;
        }
    }
    ctx.stroke();
}

// One side of every orbit sharing a primary, in the map's orbit style.
function strokeOrbitGroup(ctx, ids, origin, primary, near){
    ctx.strokeStyle = "#c0c0c0";
    ctx.lineWidth = 1 / mapScale;
    for (let id of ids){
        let planet = spacePlanetStats[id];
        ctx.setLineDash(planet.belt || (global.race['orbit_decayed'] && id === 'spc_home') ? [0.01, 0.01] : []);
        strokeOrbitSide(ctx, id, origin, primary, near);
    }
    ctx.setLineDash([]);
}

// --- Solar map body textures --------------------------------------------------------------------
// Bodies keep the flat fill the map has always used — setColor() encodes syndicate strength,
// habitable zone, gate/dwarf highlights and spectral type, and none of that should move — and get a
// texture painted over the top. Planet textures are deliberately color-free: pure light and shadow
// in the alpha channel, so one texture serves every body of a kind whatever color the game picked
// for it, and the cache can't grow with the continuously-varying syndicate colors. Stars are the
// exception, since for a star the color *is* the texture (core, disc, corona) — those are cached per
// spectral color, of which there are seven.
// Everything is generated once into an offscreen canvas and reused; nothing here runs at import
// time, so the wiki bundle (which also imports this module) never touches the DOM for it.
const bodyTexCache = {};

// Deterministic per-body PRNG (mulberry32), so a planet's surface is identical on every redraw but
// differs from its neighbours'.
function texRand(seed){
    let a = seed >>> 0;
    return function(){
        a = (a + 0x6D2B79F5) >>> 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// FNV-1a over the body id, so each body gets a stable seed without storing one in the table.
function texSeed(str){
    let h = 2166136261;
    for (let i=0; i<str.length; i++){
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function hexRGBA(hex, a){
    let n = parseInt(hex, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// As hexShade, but keeps an alpha channel — for things drawn over the body they belong to.
function hexShadeRGBA(hex, f, a){
    let n = parseInt(hex, 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    let t = Math.max(0, f - 1);
    r += (255 - r) * t; g += (255 - g) * t; b += (255 - b) * t;
    return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
}

// f > 1 lightens toward white, f < 1 darkens. Lightening a near-white star just leaves it white.
function hexShade(hex, f){
    let n = parseInt(hex, 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (f >= 1){
        let t = f - 1;
        r += (255 - r) * t; g += (255 - g) * t; b += (255 - b) * t;
    }
    else {
        r *= f; g *= f; b *= f;
    }
    return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

const PLANET_TEX = 128;

// The Sol bodies are the ones players stare at for a whole run, so they get their own colour and
// surface rather than the generic pool. Colour is only a fallback inside setColor — syndicate
// strength, spectral type and the gate/dwarf highlights are all resolved first and still win, so
// nothing the map already encodes is lost.
const SOL_BODY_COLOR = {
    spc_home:      '2f6fb5',   // Earth, ocean blue
    spc_moon:      '9d9a93',   // Luna, grey regolith
    spc_hell:      '8a8078',   // Mercury, dark grey-brown
    spc_venus:     'd9b878',   // Venus, pale sulphur cloud
    spc_red:       'b1512c',   // Mars, rust
    spc_belt:      '766d64',   // asteroid rubble
    spc_gas:       'c8a172',   // Jupiter, tan
    spc_io:        'd9c15c',   // Io, sulphur yellow
    spc_europa:    'd8cbb4',   // Europa, cracked ice
    spc_gas_moon:  'b0a189',   // Ganymede, dusty ice
    spc_callisto:  '6f6257',   // Callisto, dark cratered rock
    spc_saturn:    'd7c391',   // Saturn, pale gold
    spc_titan:     'c8791f',   // Titan, orange haze
    spc_enceladus: 'e6f1f5',   // Enceladus, clean ice
    spc_uranus:    'a5d9de',   // Uranus, pale cyan
    spc_titania:   '8d8177',   // Titania, grey-brown ice
    spc_oberon:    '7d6f66',   // Oberon, darker and redder, the most cratered of the pair
    spc_neptune:   '3a5ec4',   // Neptune, deep blue
    spc_triton:    'd6c4c0',   // Triton, pink-grey ice
    spc_pluto:     'c8a582',   // Pluto, buff tan
    spc_haumea:    'e6e8ec',   // Haumea, bright water ice — one of the most reflective bodies known
    spc_makemake:  'c68a66',   // Makemake, red methane frost
    spc_eris:      'c6c6d0',   // Eris, dirty ice
};

// The Sol bodies the map draws purely as scenery.
const SOL_BODY_LABEL = {
    spc_venus:     'venus',
    spc_saturn:    'saturn',
    spc_uranus:    'uranus',
    spc_neptune:   'neptune',
    spc_io:        'io',
    spc_europa:    'europa',
    spc_callisto:  'callisto',
    spc_titania:   'titania',
    spc_oberon:    'oberon',
    spc_pluto:     'pluto',
    spc_haumea:    'haumea',
};

// Surface treatment per body. Anything not named here falls back to the generic pool below.
const SOL_BODY_STYLE = {
    spc_home: 'earth',      spc_moon: 'cratered',   spc_hell: 'cratered',
    spc_venus: 'venus',     spc_red: 'mars',        spc_gas: 'jupiter',
    spc_io: 'venus',        spc_europa: 'ice',      spc_callisto: 'cratered',
    spc_gas_moon: 'cratered', spc_saturn: 'saturn', spc_titan: 'haze',
    spc_enceladus: 'ice',   spc_uranus: 'icegiant', spc_neptune: 'neptune',
    spc_titania: 'cratered', spc_oberon: 'cratered',
    spc_triton: 'ice',      spc_dwarf: 'cratered',  spc_eris: 'ice',
    spc_pluto: 'ice',       spc_haumea: 'ice',      spc_makemake: 'cratered',
};

// The homeworld biomes.
const BIOME_LOOK = {
    grassland: { color: '7fa650', style: 'bio_grassland' },   // open plains
    oceanic:   { color: '2f6fb5', style: 'bio_oceanic'   },   // the familiar blue marble
    forest:    { color: '3d7a3f', style: 'bio_forest'    },   // unbroken canopy
    desert:    { color: 'd4ae66', style: 'bio_desert'    },   // sand
    volcanic:  { color: '8c4632', style: 'bio_volcanic'  },   // basalt and vents
    tundra:    { color: 'b3c4cc', style: 'bio_tundra'    },   // frozen ground
    savanna:   { color: 'c6a651', style: 'bio_savanna'   },   // dry grass
    swamp:     { color: '5e6b3c', style: 'bio_swamp'     },   // murky wetland
    ashland:   { color: '8b8781', style: 'bio_ashland'   },   // grey ash
    taiga:     { color: '5d7a63', style: 'bio_taiga'     },   // boreal forest
    hellscape: { color: '7d2b1c', style: 'bio_hellscape' },   // burning crust
    eden:      { color: '4fae72', style: 'bio_eden'      },   // paradise
};

// The biome the home world is currently wearing, or false. Guarded because the wiki imports this
// module and draws map pieces with no city to read a biome off.
function homeBiome(){
    let biome = global.city && global.city.biome ? global.city.biome : false;
    return biome && BIOME_LOOK[biome] ? biome : false;
}

// A Sol body's colour, with the home world answering for its biome first.
function solBodyColor(id){
    if (id === 'spc_home'){
        let biome = homeBiome();
        if (biome){ return BIOME_LOOK[biome].color; }
    }
    return SOL_BODY_COLOR[id];
}

// Which surface a body gets. Nothing in the table marks gas giants, but the big non-moon bodies are
// exactly the gas giants (Jupiter/Saturn/Tau Ceti's gas worlds and the large outer-system planets).
function bodyKind(planet, id){
    if (id === 'spc_home'){
        let biome = homeBiome();
        if (biome){ return BIOME_LOOK[biome].style; }
    }
    if (id && SOL_BODY_STYLE[id]){ return SOL_BODY_STYLE[id]; }
    if (planet.belt){ return 'belt'; }
    // Sizes are real radii on a square-root scale, so this is where the gas and ice giants start:
    // Neptune lands on 0.376 and the largest terrestrials well below it.
    if (planet.size >= 0.35 && !planet.moon){ return 'gas'; }
    return 'rock';
}

// Styles that describe one specific world rather than a class of them, so they get a single texture
// each instead of a pool of random variants. Every biome surface is one of these — there is only
// ever one home world, so there is nothing for a pool of variants to tell apart.
const NAMED_STYLES = ['earth','mars','venus','jupiter','saturn','icegiant','neptune','haze','ice','cratered']
    .concat(Object.values(BIOME_LOOK).map(b => b.style));

// Surfaces are drawn from a small pool rather than one per body: a texture is a megabyte-scale
// canvas, and there are well over a hundred bodies on the map. Each body picks its variant from its
// own seed, so it always gets the same face and its neighbours rarely match.
const PLANET_VARIANTS = 8;

// Color-free overlay for a planet, moon or belt body: surface detail, then the light and shade that
// turn a flat disc into a lit ball. Lit from the upper left throughout, so the whole map reads as
// one scene rather than each body having its own sun.
// Soft mottled patches, the shared base for every rocky surface.
function texBlobs(x, rnd, S, count, minR, maxR, darkBias, strength){
    for (let i = 0; i < count; i++){
        let bx = rnd() * S, by = rnd() * S;
        let br = S * (minR + rnd() * (maxR - minR));
        let g = x.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, rnd() < darkBias
            ? `rgba(0,0,0,${(strength * (0.5 + rnd())).toFixed(3)})`
            : `rgba(255,255,255,${(strength * 0.6 * (0.5 + rnd())).toFixed(3)})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g;
        x.beginPath();
        x.arc(bx, by, br, 0, Math.PI * 2);
        x.fill();
    }
}

// Horizontal cloud belts. `contrast` sets how hard the banding reads — Jupiter is stark, Uranus is
// almost smooth — and bands are drawn as soft-edged strips so they blend rather than stripe.
function texBands(x, rnd, S, contrast, minH, maxH){
    for (let y = 0; y < S; ){
        let h = S * (minH + rnd() * (maxH - minH));
        let dark = rnd() < 0.5;
        let a = contrast * (0.4 + rnd() * 0.6);
        let g = x.createLinearGradient(0, y, 0, y + h);
        let col = dark ? '0,0,0' : '255,255,255';
        g.addColorStop(0, `rgba(${col},0)`);
        g.addColorStop(0.5, `rgba(${col},${a.toFixed(3)})`);
        g.addColorStop(1, `rgba(${col},0)`);
        x.fillStyle = g;
        x.fillRect(0, y, S, h);
        y += h;
    }
}

// Impact craters: a dark floor, a bright rim catching the light from the upper left, and a shadow
// opposite it. What makes a body read as airless rather than merely rough.
function texCraters(x, rnd, S, count){
    for (let i = 0; i < count; i++){
        let cx = rnd() * S, cy = rnd() * S;
        let cr = S * (0.02 + rnd() * 0.075);
        x.beginPath();
        x.arc(cx, cy, cr, 0, Math.PI * 2);
        x.fillStyle = `rgba(0,0,0,${(0.10 + rnd() * 0.14).toFixed(3)})`;
        x.fill();
        x.beginPath();
        x.arc(cx - cr * 0.12, cy - cr * 0.12, cr, Math.PI * 0.9, Math.PI * 1.9);
        x.strokeStyle = `rgba(255,255,255,${(0.12 + rnd() * 0.16).toFixed(3)})`;
        x.lineWidth = Math.max(1, cr * 0.22);
        x.stroke();
        x.beginPath();
        x.arc(cx, cy, cr * 0.92, Math.PI * 1.9, Math.PI * 2.9);
        x.strokeStyle = `rgba(0,0,0,${(0.10 + rnd() * 0.12).toFixed(3)})`;
        x.lineWidth = Math.max(1, cr * 0.2);
        x.stroke();
    }
}

// Bright polar caps, sized as a fraction of the disc.
function texPoles(x, S, size, alpha){
    for (let s of [-1, 1]){
        let cy = s < 0 ? 0 : S;
        let g = x.createRadialGradient(S / 2, cy, 0, S / 2, cy, S * size);
        g.addColorStop(0, `rgba(255,255,255,${alpha})`);
        g.addColorStop(0.65, `rgba(255,255,255,${alpha * 0.5})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = g;
        x.fillRect(0, 0, S, S);
    }
}

// An oval storm, as on Jupiter and Neptune.
function texSpot(x, S, cx, cy, rx, ry, dark, alpha){
    x.save();
    x.translate(S * cx, S * cy);
    x.scale(1, ry / rx);
    let g = x.createRadialGradient(0, 0, 0, 0, 0, S * rx);
    let col = dark ? '0,0,0' : '255,255,255';
    g.addColorStop(0, `rgba(${col},${alpha})`);
    g.addColorStop(0.7, `rgba(${col},${alpha * 0.45})`);
    g.addColorStop(1, `rgba(${col},0)`);
    x.fillStyle = g;
    x.beginPath();
    x.arc(0, 0, S * rx, 0, Math.PI * 2);
    x.fill();
    x.restore();
}

function planetTexture(kind, seed){
    // A style that describes one particular world only needs one texture; the generic classes keep
    // their pool so neighbouring anonymous rocks don't all share a face.
    let variant = NAMED_STYLES.includes(kind) ? 0 : (seed >>> 0) % PLANET_VARIANTS;
    let key = `p:${kind}:${variant}`;
    if (bodyTexCache[key]){ return bodyTexCache[key]; }

    const S = PLANET_TEX, R = S / 2;
    let c = document.createElement('canvas');
    c.width = c.height = S;
    let x = c.getContext('2d');
    let rnd = texRand(texSeed(key));

    x.save();
    x.beginPath();
    x.arc(R, R, R, 0, Math.PI * 2);
    x.clip();

    switch (kind){
        case 'earth':
            // Continents as heavy mottling, then a thin bright veil of cloud over the top and caps.
            texBlobs(x, rnd, S, 16, 0.09, 0.2, 0.72, 0.34);
            texBlobs(x, rnd, S, 10, 0.05, 0.12, 0.0, 0.13);
            texPoles(x, S, 0.2, 0.5);
            break;

        // --- home world biomes (see BIOME_LOOK) ---------------------------------------------------
        // Each is built from the same primitives, varied on what the biome is made of: how much land
        // against water, whether it bands or mottles, how far the ice reaches, and whether anything
        // on the surface is giving off its own light.
        case 'bio_grassland':
            // Open plains: broad soft patches at low contrast under a thin veil, modest caps.
            texBlobs(x, rnd, S, 14, 0.10, 0.22, 0.55, 0.22);
            texBlobs(x, rnd, S, 8, 0.05, 0.12, 0.0, 0.10);
            texPoles(x, S, 0.16, 0.42);
            break;
        case 'bio_oceanic':
            // Nearly all water: a scattering of small islands and a great deal of weather.
            texBlobs(x, rnd, S, 7, 0.05, 0.13, 0.85, 0.30);
            texBlobs(x, rnd, S, 16, 0.06, 0.16, 0.0, 0.16);
            texPoles(x, S, 0.18, 0.5);
            break;
        case 'bio_forest':
            // Unbroken canopy: heavy dark mottling with cloud caught above it.
            texBlobs(x, rnd, S, 20, 0.08, 0.20, 0.85, 0.34);
            texBlobs(x, rnd, S, 7, 0.05, 0.11, 0.0, 0.10);
            texPoles(x, S, 0.14, 0.35);
            break;
        case 'bio_desert':
            // Dune fields run in belts, and there is little water to cloud over.
            texBands(x, rnd, S, 0.10, 0.05, 0.12);
            texBlobs(x, rnd, S, 12, 0.07, 0.18, 0.4, 0.16);
            break;
        case 'bio_volcanic':
            // Dark basalt with a handful of vents burning through it.
            texBlobs(x, rnd, S, 16, 0.07, 0.19, 0.8, 0.34);
            texSpot(x, S, 0.35, 0.42, 0.07, 0.05, false, 0.50);
            texSpot(x, S, 0.66, 0.62, 0.05, 0.04, false, 0.42);
            texSpot(x, S, 0.50, 0.78, 0.04, 0.03, false, 0.36);
            break;
        case 'bio_tundra':
            // Frozen ground throughout, with caps reaching most of the way to the equator.
            texBlobs(x, rnd, S, 10, 0.09, 0.20, 0.3, 0.16);
            texPoles(x, S, 0.42, 0.6);
            break;
        case 'bio_savanna':
            // Dry grass in belts, broken by scattered scrub.
            texBands(x, rnd, S, 0.08, 0.07, 0.15);
            texBlobs(x, rnd, S, 13, 0.05, 0.14, 0.7, 0.20);
            texPoles(x, S, 0.12, 0.30);
            break;
        case 'bio_swamp':
            // Standing water broken by countless small islands, under a permanent haze.
            texBlobs(x, rnd, S, 26, 0.04, 0.11, 0.7, 0.26);
            texBands(x, rnd, S, 0.05, 0.12, 0.24);
            texBlobs(x, rnd, S, 10, 0.06, 0.14, 0.0, 0.14);
            break;
        case 'bio_ashland':
            // Ash laid down in drifts over a dead surface; nothing left to freeze at the poles.
            texBands(x, rnd, S, 0.07, 0.06, 0.14);
            texBlobs(x, rnd, S, 18, 0.05, 0.15, 0.6, 0.20);
            break;
        case 'bio_taiga':
            // Conifer belts between long winters: dark forest, deep caps.
            texBlobs(x, rnd, S, 16, 0.07, 0.17, 0.78, 0.28);
            texPoles(x, S, 0.30, 0.55);
            break;
        case 'bio_hellscape':
            // Cracked and burning: dark crust with fire showing through all over it.
            texBlobs(x, rnd, S, 18, 0.06, 0.18, 0.85, 0.40);
            for (let i = 0; i < 9; i++){
                texSpot(x, S, rnd(), rnd(), 0.03 + rnd() * 0.04, 0.02 + rnd() * 0.03, false, 0.35 + rnd() * 0.25);
            }
            break;
        case 'bio_eden':
            // Everything in balance: soft varied ground, a bright veil of cloud, clean caps.
            texBlobs(x, rnd, S, 15, 0.08, 0.20, 0.45, 0.20);
            texBlobs(x, rnd, S, 12, 0.05, 0.13, 0.0, 0.16);
            texPoles(x, S, 0.18, 0.55);
            break;
        case 'mars':
            // Dark maria and bright dust, with the caps that make it unmistakable.
            texBlobs(x, rnd, S, 14, 0.08, 0.22, 0.7, 0.26);
            texPoles(x, S, 0.17, 0.62);
            break;
        case 'venus':
            // Total cloud cover: no surface, just slow swirls at very low contrast.
            texBands(x, rnd, S, 0.07, 0.1, 0.2);
            texBlobs(x, rnd, S, 9, 0.12, 0.26, 0.45, 0.09);
            break;
        case 'jupiter':
            texBands(x, rnd, S, 0.16, 0.045, 0.09);
            texSpot(x, S, 0.34, 0.63, 0.11, 0.062, true, 0.3);
            break;
        case 'saturn':
            // Softer and finer than Jupiter — Saturn's banding is famously muted.
            texBands(x, rnd, S, 0.085, 0.035, 0.07);
            break;
        case 'icegiant':
            // Nearly featureless, just a hint of banding.
            texBands(x, rnd, S, 0.045, 0.09, 0.18);
            break;
        case 'neptune':
            texBands(x, rnd, S, 0.07, 0.07, 0.15);
            texSpot(x, S, 0.62, 0.4, 0.1, 0.06, true, 0.26);
            break;
        case 'haze':
            // Titan: a thick smog with no visible surface at all.
            texBands(x, rnd, S, 0.05, 0.14, 0.26);
            break;
        case 'ice':
            // Clean ice with fracture lines rather than craters.
            texBlobs(x, rnd, S, 10, 0.06, 0.16, 0.35, 0.14);
            for (let i = 0; i < 7; i++){
                x.beginPath();
                x.moveTo(rnd() * S, rnd() * S);
                x.lineTo(rnd() * S, rnd() * S);
                x.strokeStyle = `rgba(0,0,0,${(0.06 + rnd() * 0.08).toFixed(3)})`;
                x.lineWidth = Math.max(1, S * 0.008);
                x.stroke();
            }
            break;
        case 'cratered':
            texBlobs(x, rnd, S, 10, 0.08, 0.2, 0.6, 0.16);
            texCraters(x, rnd, S, 22);
            break;
        case 'gas':
            texBands(x, rnd, S, 0.12, 0.05, 0.15);
            break;
        default:
            // Rocky: soft mottled patches. Belts get more, smaller ones so they read as rubble.
            if (kind === 'belt'){
                texBlobs(x, rnd, S, 26, 0.03, 0.08, 0.6, 0.28);
            }
            else {
                texBlobs(x, rnd, S, 14, 0.07, 0.21, 0.6, 0.28);
            }
            break;
    }

    // Highlight (upper left), terminator (lower right), then limb darkening all round.
    let hi = x.createRadialGradient(R * 0.62, R * 0.6, 0, R * 0.62, R * 0.6, R * 1.15);
    hi.addColorStop(0, 'rgba(255,255,255,0.38)');
    hi.addColorStop(0.45, 'rgba(255,255,255,0.06)');
    hi.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = hi;
    x.fillRect(0, 0, S, S);

    let sh = x.createRadialGradient(R * 1.35, R * 1.4, R * 0.1, R * 1.2, R * 1.3, R * 1.7);
    sh.addColorStop(0, 'rgba(0,0,0,0.6)');
    sh.addColorStop(0.6, 'rgba(0,0,0,0.22)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = sh;
    x.fillRect(0, 0, S, S);

    let limb = x.createRadialGradient(R, R, R * 0.72, R, R, R);
    limb.addColorStop(0, 'rgba(0,0,0,0)');
    limb.addColorStop(1, 'rgba(0,0,0,0.45)');
    x.fillStyle = limb;
    x.fillRect(0, 0, S, S);

    x.restore();
    bodyTexCache[key] = c;
    return c;
}

const STAR_TEX = 256;
// Fraction of the texture's half-width taken up by the star's disc; the rest is corona. Bodies are
// drawn scaled so the disc lands exactly on the radius the map asks for, and the corona spills out
// around it — so this also sets how far the glow reaches (here, one disc radius beyond the edge).
// Keep it modest: the corona scales with the disc, and a wide one swamps the view on a close-up.
const STAR_CORE = 0.5;

function starTexture(color){
    let key = `s:${color}`;
    if (bodyTexCache[key]){ return bodyTexCache[key]; }

    const S = STAR_TEX, R = S / 2, disc = R * STAR_CORE;
    let c = document.createElement('canvas');
    c.width = c.height = S;
    let x = c.getContext('2d');
    let rnd = texRand(texSeed(color));

    // Corona first so the disc paints over its inner edge. It starts essentially at the limb and
    // falls away fast, which keeps the edge of the disc readable instead of blurring it into a blob.
    let cor = x.createRadialGradient(R, R, disc * 0.97, R, R, R);
    cor.addColorStop(0, hexRGBA(color, 0.34));
    cor.addColorStop(0.22, hexRGBA(color, 0.1));
    cor.addColorStop(1, hexRGBA(color, 0));
    x.fillStyle = cor;
    x.fillRect(0, 0, S, S);

    // The disc brightens toward the middle and darkens at the limb, but never washes out to pure
    // white — zoomed out a star is only a pixel or two across, and that pixel has to stay the color
    // of its spectral class.
    let body = x.createRadialGradient(R, R, 0, R, R, disc);
    body.addColorStop(0, hexShade(color, 1.55));
    body.addColorStop(0.5, hexShade(color, 1.12));
    body.addColorStop(0.88, hexShade(color, 1));
    body.addColorStop(1, hexShade(color, 0.7));
    x.fillStyle = body;
    x.beginPath();
    x.arc(R, R, disc, 0, Math.PI * 2);
    x.fill();

    // Granulation: low-contrast convection cells over the disc, so a star closed in on reads as a
    // surface rather than a plain gradient. Kept faint enough not to shift the star's color.
    x.save();
    x.beginPath();
    x.arc(R, R, disc, 0, Math.PI * 2);
    x.clip();
    for (let i = 0; i < 45; i++){
        let a = rnd() * Math.PI * 2;
        let d = Math.sqrt(rnd()) * disc;
        let bx = R + Math.cos(a) * d, by = R + Math.sin(a) * d;
        let br = disc * (0.06 + rnd() * 0.14);
        let g = x.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, rnd() < 0.5
            ? `rgba(255,255,255,${(0.05 + rnd() * 0.07).toFixed(3)})`
            : `rgba(0,0,0,${(0.04 + rnd() * 0.06).toFixed(3)})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g;
        x.beginPath();
        x.arc(bx, by, br, 0, Math.PI * 2);
        x.fill();
    }
    x.restore();

    bodyTexCache[key] = c;
    return c;
}

// Glyphs engraved around the gate's ring. Constellation and planetary symbols, matching the
// astrological signs the game already renders in the top bar — so this set is known to display here.
// The U+FE0E on each forces the text form; several of these would otherwise come out as color emoji.
const GATE_GLYPHS = ['♈︎','♉︎','♊︎','♋︎','♌︎','♍︎','♎︎','♏︎','♐︎','♑︎','♒︎','♓︎','☉︎','☽︎','☿︎','♀︎','♂︎','♃︎','♄︎','♅︎','♆︎'];
const gateGlyphCache = {};

// Nine distinct glyphs drawn from the pool. Seeded off the body, not Math.random: the map redraws on
// every drag and zoom, and glyphs reshuffling each frame would strobe. Cached so the draw isn't
// re-picking them every frame either.
function gateGlyphs(seed){
    if (gateGlyphCache[seed]){ return gateGlyphCache[seed]; }
    let pool = GATE_GLYPHS.slice();
    let rnd = texRand(seed);
    let out = [];
    for (let i = 0; i < 9; i++){
        out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    }
    gateGlyphCache[seed] = out;
    return out;
}

// Whether Tau Ceti's jump gate should appear beside the home planet on the map. The structure's own
// `reqs: { tauceti: 3 }` is not consulted by condition() — that only covers the isolation/resettle
// case — so the tech level is checked here alongside it. Optional chaining because drawMap runs for
// saves that never reach Tau Ceti.
function tauJumpGate(){
    return global.tech['tauceti'] && global.tech.tauceti >= 3
        && actions.tauceti?.tau_home?.jump_gate?.condition?.() ? true : false;
}

// The sun gate is a stargate, not a world, so it is drawn as an open ring with space showing through
// the middle. Stroked as a path rather than blitted from a texture: the gate is only a few pixels
// across at most useful zooms, and a ring texture scaled down that far smears back into the dot this
// is meant to stop it being.
function drawGate(ctx, x, y, r, color, seed){
    let lw = r * 0.42;              // ring thickness
    let mid = r - lw / 2;           // centreline the stroke is laid along

    ctx.save();
    // Halo, so a gate is picked out at a glance from the rocks sharing its orbit.
    ctx.strokeStyle = hexRGBA(color, 0.25);
    ctx.lineWidth = lw * 2.4;
    ctx.beginPath();
    ctx.arc(x, y, mid, 0, Math.PI * 2, true);
    ctx.stroke();

    // The ring, lit across the diagonal like every other body on the map.
    let sheen = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
    sheen.addColorStop(0, hexShade(color, 1.5));
    sheen.addColorStop(0.5, hexShade(color, 1));
    sheen.addColorStop(1, hexShade(color, 0.55));
    ctx.strokeStyle = sheen;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(x, y, mid, 0, Math.PI * 2, true);
    ctx.stroke();

    // Nine chevrons around the ring, as on the gate itself — only legible, and only worth the
    // strokes, once the gate is more than a few pixels across.
    if (r * mapScale >= 6){
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.lineWidth = Math.max(lw * 0.22, 0.4 / mapScale);
        for (let i = 0; i < 9; i++){
            let a = (i / 9) * Math.PI * 2 - Math.PI / 2;
            let ca = Math.cos(a), sa = Math.sin(a);
            ctx.beginPath();
            ctx.moveTo(x + ca * (mid - lw / 2), y + sa * (mid - lw / 2));
            ctx.lineTo(x + ca * (mid + lw / 2), y + sa * (mid + lw / 2));
            ctx.stroke();
        }

        // A glyph in each of the nine segments the notches divide the ring into — offset half a
        // segment so they sit between the notches rather than on top of them, and turned to stand
        // upright on the ring. Only once the band is wide enough to hold a readable character.
        // textAlign/textBaseline/font are restored by the save() above, so the ship-name and label
        // passes later in drawMap are unaffected.
        if (r * mapScale >= 18){
            let glyphs = gateGlyphs(seed);
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Sized and drawn in screen pixels, undoing the map scale for the text only. Chrome
            // renders nothing at all once the font-size *number* drops below about 0.01px, whatever
            // the transform scales it up to afterwards — and the gate's radius is a fixed 0.01 map
            // units at every zoom, so a size expressed in map units would always land under that
            // floor and silently draw nothing.
            ctx.font = `${lw * mapScale * 0.78}px serif`;
            for (let i = 0; i < 9; i++){
                let a = ((i + 0.5) / 9) * Math.PI * 2 - Math.PI / 2;
                ctx.save();
                ctx.translate(x + Math.cos(a) * mid, y + Math.sin(a) * mid);
                ctx.rotate(a + Math.PI / 2);
                ctx.scale(1 / mapScale, 1 / mapScale);
                ctx.fillText(glyphs[i], 0, 0);
                ctx.restore();
            }
        }
    }
    ctx.restore();
}

// Paint one map body at (x,y) with radius r in map units. Stars get their textured disc plus corona;
// everything else keeps its flat fill with the lighting overlay on top. The overlay is skipped once
// a body is down to a couple of pixels, where it would cost a scale-down of a 128px texture to show
// nothing.
// A ring system, as seen from a little above its plane. Bands are stroked ellipses at fractions of
// the body's own radius, with a gap between the middle and outer band standing in for the Cassini
// division. Half the ring at a time: `near` picks the lower sweep, which passes in front of the body.
// Saturn's real structure, inner to outer: the faint D and C rings, the bright B ring, the Cassini
// division, the A ring with the Encke gap near its outer edge, and the wispy F ring beyond.
// How far the ring plane leans out of the plane the body orbits in. This is a fixed property of the
// world, not of the camera — it is what keeps the rings pinned to the planet while the view turns.
//
// The value is chosen for Saturn's real 26.7 degrees.
const RING_TILT = 26.7 * Math.PI / 180;
// Points per half ring. The ring is a real circle in space rather than a screen-space ellipse, so it
// has to be sampled and projected the way orbits are; two halves of this give ORBIT_STEPS' smoothness.
const RING_HALF_STEPS = 48;
const RING_BANDS = [
    [1.11, 1.24, 0.10],   // D + inner C
    [1.24, 1.52, 0.22],   // C
    [1.52, 1.75, 0.62],   // B, the bright one
    [1.75, 1.95, 0.50],   // outer B
    // 1.95 - 2.03 Cassini division
    [2.03, 2.22, 0.38],   // A
    // 2.22 - 2.24 Encke gap
    [2.24, 2.27, 0.30],   // outer A
    [2.32, 2.34, 0.12],   // F, a thin thread
];
// A ring is a circle lying in the body's equatorial plane — the plane it orbits in, tipped by the
// body's axial tilt. Each band is sampled and pushed through the same projection as everything else
// on the map, so yawing or pitching the camera turns the rings with the rest of the scene instead of
// leaving them pinned flat to the screen. Edge-on they close to a sliver; from above they open out.
//
// Offsets are taken relative to the body rather than in absolute coordinates, which is exact because
// the projection is linear: pX(body + offset) === pX(body) + pX(offset).
//
// `near` selects which side of the body to draw, and the two halves have to meet exactly or the ring
// shows a seam. Depth around the ring works out to rad * (A cos t + B sin t) — a plain sinusoid — so
// the two angles where it crosses zero, which is precisely where the ring passes behind or in front
// of the body, can be solved for rather than found by testing samples. Cutting at whichever samples
// happened to straddle the crossing left a gap of up to one step at each end; each half now runs from
// one crossing to the other, so they share their endpoints.
function drawRings(ctx, x, y, r, color, near, tilt){
    let lean = tilt || RING_TILT;
    let ct = Math.cos(lean), st = Math.sin(lean);

    let A = camSY * camSP;
    let B = ct * camCY * camSP + st * camCP;
    let cross = Math.atan2(-A, B);
    // Which of the two arcs is the near one, judged from the middle of the first.
    let mid = cross + Math.PI / 2;
    let nearFirst = (A * Math.cos(mid) + B * Math.sin(mid)) < 0;
    let start = (nearFirst === near) ? cross : cross + Math.PI;

    for (let [inner, outer, alpha] of RING_BANDS){
        let rad = r * (inner + outer) / 2;
        ctx.strokeStyle = hexShadeRGBA(color, 1.5, alpha);
        ctx.lineWidth = Math.max(r * (outer - inner), 0.4 / mapScale);
        ctx.beginPath();
        for (let i = 0; i <= RING_HALF_STEPS; i++){
            let t = start + (i / RING_HALF_STEPS) * Math.PI;
            // The circle, tipped out of the orbital plane by the body's lean.
            let ox = rad * Math.cos(t);
            let oy = rad * Math.sin(t) * ct;
            let oz = rad * Math.sin(t) * st;
            let px = x + (ox * camCY - oy * camSY);
            let py = y + (ox * camSY + oy * camCY) * camCP - oz * camSP;
            if (i === 0){ ctx.moveTo(px, py); }
            else { ctx.lineTo(px, py); }
        }
        ctx.stroke();
    }
}

// Saturn is flagged in the table. Past Sol, roughly a quarter of the gas giants carry rings too, and
// which ones is decided by hashing the body's own id — stable for a given world, no flag to store for
// each of the two dozen of them, and it holds if more systems are added later.
function hasRings(planet, id){
    if (planet.rings){ return true; }
    if (!id || !planet.star || planet.startype || planet.bodystar){ return false; }
    if (cowGlyph(id)){ return false; }   // a cow is drawn as a glyph; there is nothing to hang rings on
    return bodyKind(planet, id) === 'gas' && texSeed(id + 'ring') % 4 === 0;
}

// Lean of a ringed world's ring plane, in radians. Saturn takes the tuned value; the rest vary
// around it from their own id, staying inside the range that reads as a ring from the default view.
function ringTilt(planet, id){
    if (planet.rings || !id){ return RING_TILT; }
    return (55 + (texSeed(id + 'tilt') % 1000) / 1000 * 30) * Math.PI / 180;
}

// A body drawn as a glyph rather than a lit sphere. Text is laid out in pixels, so the map's scale
// is undone and the glyph placed in screen space, sized from the projected radius — which leaves it
// tracking zoom exactly as a drawn disc of the same size would.
function drawGlyph(ctx, x, y, r, glyph){
    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.scale(1 / mapScale, 1 / mapScale);
    ctx.font = `${r * mapScale * 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyph, x * mapScale, y * mapScale);
    ctx.restore();
}

function drawBody(ctx, x, y, r, color, opts){
    opts = opts || {};
    if (opts.glyph){
        drawGlyph(ctx, x, y, r, opts.glyph);
        return;
    }
    if (opts.gate){
        drawGate(ctx, x, y, r, color, opts.seed);
        return;
    }
    ctx.fillStyle = "#" + color;
    if (opts.star){
        // The flat disc goes down first even though the texture's own disc is opaque. Zoomed out a
        // star is a pixel or two across, and scaling a 256px texture down that far averages its disc
        // against the transparent corona surrounding it — on its own the star all but disappears.
        // The solid dot underneath keeps it visible and on-color at every zoom.
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.fill();
        let half = r / STAR_CORE;
        ctx.drawImage(starTexture(color), x - half, y - half, half * 2, half * 2);
        return;
    }
    // Rings straddle the body, so the far half goes down first and the near half last — that ordering
    // is what reads as the planet sitting inside them rather than on top. Skipped at the same size the
    // surface texture is, since a few pixels of ring is just a smudge.
    let rings = opts.rings && r * mapScale >= 2.5;
    if (rings){ drawRings(ctx, x, y, r, color, false, opts.ringTilt); }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
    if (r * mapScale >= 2.5){
        ctx.drawImage(planetTexture(opts.kind, opts.seed), x - r, y - r, r * 2, r * 2);
    }
    if (rings){ drawRings(ctx, x, y, r, color, true, opts.ringTilt); }
}

// Record a body the pointer can address, converting from the projected space drawBody works in to
// the screen pixels a mouse event arrives in.
//
// Click-to-centre still only takes bodies from the zoom where a system's planets are told apart
// individually. Out past that they pile into a few pixels, and a click would centre on whichever
// happened to be nearest — not something the player could have aimed at. Gating on each body's own
// drawn size instead would be circular: a distant planet is a couple of pixels across until you are
// already looking at it, which is what clicking it was meant to do.
//
// Naming is recorded at every zoom, because that threshold is also where the labels switch off:
// below it a visitable world is drawn with no name against it, and pointing at one is the only way
// left to ask what it is.
function addPickable(id, bx, by, size, sep){
    mapPickable.push({
        id: id,
        x: mapShift.x + bx * mapScale,
        y: mapShift.y + by * mapScale,
        r: size * mapScale,
        // Recorded for naming only — see above.
        nameOnly: mapScale < planetLabelMinScale,
        // A body that has not pulled far enough off whatever it circles to read as a dot of its own
        // — the same test visibleRadius uses to decide whether to keep it visible at all. Its centre
        // can still land nearer the pointer than its primary's, so without this the map would name
        // something drawn inside another body's disc that cannot be picked out by eye.
        merged: sep !== undefined && sep < BODY_SEPARATION_PX
    });
}

// The map's drawing context, whichever backend is in use. Cached per canvas element: a canvas can
// only ever hand out one kind of context, so switching renderers replaces the element (see
// rebuildSolarMap) and this picks the new one up.
//
// Everything below this line is renderer-agnostic. drawMap and every helper it calls issue the same
// Canvas 2D calls either way — the WebGL backend implements that API rather than reimplementing the
// map — so there is one drawing routine to maintain, not two, and neither renderer can drift from
// the other.
var mapCtx = false;
var mapCtxFor = false;
var mapCtxGL = false;
function mapRenderer(){
    return webglSupported() && mapView().webgl ? 'webgl' : 'canvas';
}
function mapContext(canvas){
    let want = mapRenderer();
    if (mapCtxFor === canvas && mapCtx && mapCtxGL === (want === 'webgl')){ return mapCtx; }
    // Closing the map and opening it again arrives here with a new canvas. Hand the old context
    // back at that point rather than leaving it to be collected — see GLContext.destroy.
    if (mapCtx && mapCtx.destroy && mapCtxFor !== canvas){ mapCtx.destroy(); }
    mapCtx = want === 'webgl' ? createGLContext(canvas, drawMap) : false;
    // A browser that reports WebGL but refuses the real context falls back rather than failing.
    mapCtxGL = !!mapCtx;
    if (!mapCtx){ mapCtx = canvas.getContext("2d"); }
    mapCtxFor = canvas;
    return mapCtx;
}

export function drawMap() {
    let canvas = document.getElementById("mapCanvas");
    if (!canvas){ return; }
    let ctx = mapContext(canvas);
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;
    // Sizing the canvas resets the 2D context's state for free; WebGL needs the viewport and the
    // frame's batch set up explicitly. No-op on the 2D path.
    if (ctx.beginFrame){ ctx.beginFrame(); }

    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(mapShift.x, mapShift.y);
    ctx.scale(mapScale, mapScale);
    camUpdate();
    mapPickable = [];
    mapLabelled = {};
    const ORIGIN = { x: 0, y: 0, z: 0 };
    // The home system hangs off the Sun at the origin, so one test covers its orbits, bodies and
    // labels alike.
    const homeCulled = starCulled(ORIGIN);

    // Calculate positions
    let planetLocation = {};
    for (let [id, planet] of Object.entries(spacePlanetStats)) {
        planetLocation[id] = genXYZcoord(id);
    }

    // Orbits, gathered by the body each one circles rather than drawn here. Half of every ring
    // passes in front of its primary and half behind, so each is split and laid down either side of
    // that body in the pass below — a planet's orbit around the Sun, a moon's around its planet.
    let orbitsBy = {};
    for (let [id, planet] of Object.entries(spacePlanetStats)) {
        if (homeCulled){ break; }
        if (planet.star){ continue; }   // Tau Ceti orbits are drawn separately in a star-local frame
        if (planet.startype){ continue; }
        if (planet.parent ? !mapView().moonOrbits : !mapView().planetOrbits){ continue; }
        // Uses the parent-relative distance for a moon, so its ring only appears once you are zoomed
        // in far enough for it to be more than a few pixels across.
        if (orbitRadius(id) * mapScale < ORBIT_MIN_PX){ continue; }
        if (actions.space[id] && actions.space[id].info.showDest && !actions.space[id].info.showDest().r){ continue; }
        let primary = planet.parent || 'spc_sun';
        if (!orbitsBy[primary]){ orbitsBy[primary] = []; }
        orbitsBy[primary].push(id);
    }

    // Ships under way, collapsed into what actually gets drawn. A fleet flies as one unit on identical
    // trip data (see sendShipTo), so every member would otherwise stack a dot, a trail and a name on the
    // exact same pixel; it draws once instead, labelled with its size. Ships not in a fleet, and a fleet
    // that is down to a single ship, keep their own dot and name.
    // Left empty when ships are hidden: the trail, dot and name passes all iterate it, so one test here
    // takes every ship marker off the map at once.
    let shipMarks = [];
    if (mapView().ships) {
        let fleets = {};
        for (let ship of global.space.shipyard.ships) {
            if (!ship.inTransit){ continue; }
            if (global.tech['syard_fleet'] && ship.fid){
                // Keyed on the fleet itself, so two fleets crossing to the same place on the same
                // schedule stay two marks rather than collapsing into one.
                let key = `${ship.fid}`;
                if (fleets[key]){
                    fleets[key].count++;
                    // The flagship is the one worth labelling the group with.
                    if (ship.flag){ fleets[key].ship = ship; }
                    continue;
                }
                fleets[key] = { ship, count: 1 };
                shipMarks.push(fleets[key]);
            }
            else {
                shipMarks.push({ ship, count: 1 });
            }
        }
        // Infested hulls inbound from Earth. They never fleet up, and they are drawn in red so a raid
        // reads as a threat at a glance rather than as one more ship of yours.
        if (global.race['zfleet'] && global.race.zfleet.s){
            // Raiders that lifted as one sortie carry its id and fly identical trips, so they are
            // collapsed the same way a fleet of yours is rather than stacking dot, trail and name on the
            // one pixel. Anything that flew alone has no id and keeps its own mark.
            let raids = {};
            for (let ship of global.race.zfleet.s){
                if (!ship.inTransit){ continue; }
                if (!ship.zf){
                    shipMarks.push({ ship, count: 1, foe: true });
                    continue;
                }
                if (raids[ship.zf]){ 
                    raids[ship.zf].count++; 
                }
                else {
                    raids[ship.zf] = { ship, count: 1, foe: true };
                    shipMarks.push(raids[ship.zf]);
                }
            }
        }
    }

    // Ship trail. The width is set here rather than inherited: the canvas is scaled by mapScale, so
    // the default of one unit is a bar mapScale pixels across, and this pass used to be relying on
    // whatever the orbits happened to leave behind.
    ctx.lineWidth = 1 / mapScale;
    for (let { ship, foe } of shipMarks) {
        ctx.fillStyle = foe ? "#ff0000" : "#0000ff";
        ctx.strokeStyle = foe ? "#ff0000" : "#0000ff";
        // Draw in the ship's reference-star frame (see shipRefStar): a pure translation of every
        // point, so the trail geometry is unchanged but the coordinates near the ship stay small.
        let ref = shipRefStar(ship);
        ctx.save();
        ctx.translate(pX(ref), pY(ref));
        ctx.beginPath();
        ctx.setLineDash([0.1, 0.4]);
        let here = rel(ship.location.position, ref);
        ctx.moveTo(pX(here), pY(here));
        
        // Draw the full remaining flight path through each waypoint still ahead of the ship.
        for (let i=0; i<ship.path.length; i++){
            let q = rel(ship.path[i].destination.position, ref);
            ctx.lineTo(pX(q), pY(q));
        }
        ctx.stroke();
        ctx.restore();
    }

    let setColor = function(id){
        let color = '558888';
        if (actions.space[id] && actions.space[id].info.syndicate() && global.settings.space[id.substring(4)]){
            let shift = syndicate(id);
            color = ((Math.round(255*(1-shift)) << 16) + (Math.round(255*shift) << 8)).toString(16).padStart(6, 0);
        }
        if (spacePlanetStats[id].startype || spacePlanetStats[id].bodystar){
            switch (spacePlanetStats[id].startype || spacePlanetStats[id].bodystar){
                case 'A': // White
                    color = 'ffffff';
                    break;
                case 'F': // Yellow-White
                    color = 'fdffb8';
                    break;
                case 'G': // Yellow dwarf
                    color = 'f8ff2b';
                    break;
                case 'K': // Orange dwarf
                    color = 'ff802b';
                    break;
                case 'M': // Red dwarf
                    color = 'ff1414';
                    break;
                case 'T': // Brown dwarf
                    color = '9420b1';
                    break;
                case 'D': // White dwarf
                    color = 'e4e4e4';
                    break;
                default:
                    color = 'f8ff2b';
                    break;
            }
        }
        else if (id === 'spc_dwarf' || id === 'tau_gas2'){
            color = '7132a8';
        }
        else if (id === 'spc_sun_gate' || id === 'tau_home'){
            color = '31a557';
        }
        else if (solBodyColor(id)){
            // The named Sol bodies get their real colour; the home world gets its biome's.
            color = solBodyColor(id);
        }
        else if (spacePlanetStats[id].hz){
            color = '3fa34d';   // habitable-zone planet (greenish)
        }
        return color;
    }

    // Planets and moons, drawn back to front so a body in front of another covers it once the map is
    // tilted. The moon nudges stay in screen space, as they always were — they exist to stop a moon
    // sitting exactly on its planet, and that job is the same whatever angle the map is turned to.
    {
        // Home-system bodies that actually orbit the Sun, for sizing the system against them. Its
        // orbits are roomy enough that this comes back 1 and nothing here changes.
        let homeOrbits = Object.entries(spacePlanetStats)
            .filter(([id, planet]) => !planet.star && !planet.startype && !planet.moon)
            .map(([id]) => id);
        let homeScale = homeCulled ? 1 : systemScale(spacePlanetStats.spc_sun.size, homeOrbits, ORIGIN);
        let bodies = [];
        for (let [id, planet] of Object.entries(spacePlanetStats)) {
            if (homeCulled){ break; }
            // Stars other than the Sun (which sits at the origin) are drawn in their own translated
            // frame below, along with Tau-Ceti-style orbiting bodies (planet.star).
            if (planet.star || (planet.startype && id !== 'spc_sun')){ continue; }
            if (global.race['orbit_decayed'] && ['spc_home','spc_moon'].includes(id)){
                continue;
            }
            if (actions.space[id] && actions.space[id].info.showDest && !actions.space[id].info.showDest().r){ continue; }
            let p = planetLocation[id];
            let bx = pX(p), by = pY(p);
            let size = planet.size / 10 * homeScale;
            // How far this body reads from whatever it circles, on screen. Kept so the pick list can
            // tell one standing clear of its primary from one buried in it — a moon against its
            // planet, a planet against the Sun.
            let sep;
            if (planet.moon) {
                // Moons used to be shoved a fixed distance off their planet so the two did not sit on
                // the same dot. Their own orbit does that job now, so the nudge is gone — it was
                // tens of millions of kilometres of it, which is what made the spacing wrong.
                // Measure separation from the planet rather than from the Sun, or a moon out at
                // Jupiter would be floored to a pixel while still buried in its primary.
                let q = rel(p, planetLocation[planet.parent]);
                sep = Math.hypot(pX(q), pY(q)) * mapScale;
                size = visibleRadius(size, sep);
            }
            else if (planet.startype) {
                // The Sun keeps a minimum on-screen radius so it stays visible when zoomed out.
                size = Math.max(size, 1 / mapScale);
            }
            else {
                sep = Math.hypot(pX(p), pY(p)) * mapScale;
                size = visibleRadius(size, sep);
            }
            bodies.push({ id, planet, bx, by, size, sep, d: pD(p) });
        }
        bodies.sort((a,b) => b.d - a.d);   // furthest first, so nearer bodies paint over them

        // Every far half goes down before any body does. A body on the far side of its orbit is
        // further out than its primary and so is drawn before it — laying that half down just ahead
        // of the primary would put the ring line over the very world riding on it. Ahead of the whole
        // pass, a body always paints over its own ring.
        for (let primary of Object.keys(orbitsBy)){
            strokeOrbitGroup(ctx, orbitsBy[primary], ORIGIN, planetLocation[primary], false);
        }
        for (let b of bodies){
            drawBody(ctx, b.bx, b.by, b.size, setColor(b.id), { star: !!b.planet.startype, gate: !!b.planet.gate, kind: bodyKind(b.planet, b.id), seed: texSeed(b.id), rings: hasRings(b.planet, b.id), ringTilt: ringTilt(b.planet, b.id), glyph: cowGlyph(b.id) });
            // The near half belongs in front of the primary, and still behind anything nearer than
            // it — which is exactly where drawing it here puts it, since the bodies left to come are
            // the nearer ones.
            if (orbitsBy[b.id]){ strokeOrbitGroup(ctx, orbitsBy[b.id], ORIGIN, planetLocation[b.id], true); }
            addPickable(b.id, b.bx, b.by, b.size, b.sep);
        }
    }

    // Distress signals. Drawn in their own star's frame for the same precision reasons as the ships,
    // and ahead of the ship markers so a ship that has flown out to one reads as sitting on top of it.
    {
        let pulse = beaconPulse();
        for (let beacon of liveBeacons()){
            let ref = genXYZcoord(beacon.s || 'spc_sun');
            if (starCulled(ref)){ continue; }
            let here = rel({ x: beacon.x, y: beacon.y, z: beacon.z }, ref);
            ctx.save();
            ctx.translate(pX(ref), pY(ref));
            let bx = pX(here), by = pY(here);
            // A ring that swells outward and fades as it goes, so the mark reads as flaring rather
            // than merely changing size.
            ctx.beginPath();
            ctx.fillStyle = `rgba(${BEACON_COLOR}, ${0.3 * (1 - pulse)})`;
            ctx.arc(bx, by, (BEACON_DOT_PX + (BEACON_HALO_PX - BEACON_DOT_PX) * pulse) / mapScale, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.beginPath();
            ctx.fillStyle = `rgba(${BEACON_COLOR}, ${0.55 + 0.45 * pulse})`;
            ctx.arc(bx, by, BEACON_DOT_PX / mapScale, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.restore();
        }
    }

    // Ships
    for (let { ship, foe } of shipMarks) {
        ctx.fillStyle = foe ? "#ff0000" : "#0000ff";
        ctx.strokeStyle = foe ? "#ff0000" : "#0000ff";
        let ref = shipRefStar(ship);
        let here = rel(ship.location.position, ref);
        ctx.save();
        ctx.translate(pX(ref), pY(ref));
        ctx.beginPath();
        // A marker, not a body: sized in screen pixels rather than AU. The old fixed 0.1 map
        // units was reasonable while planets were drawn at arbitrary sizes, but against real
        // radii it is five times Earth and half the Sun.
        ctx.arc(pX(here), pY(here), SHIP_DOT_PX / mapScale, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.restore();
    }

    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';

    ctx.font = `20px serif`;
    // Ship names — a fleet is labelled by its size rather than by whichever member happens to be first.
    for (let mark of shipMarks) {
        if (mapScale < planetLabelMinScale){ continue; }   // zoomed out: show only star labels

        ctx.fillStyle = mark.foe ? "#ff5555" : "#009aff";
        let ship = mark.ship;
        let ref = shipRefStar(ship);
        let here = rel(ship.location.position, ref);
        ctx.save();
        ctx.translate(pX(ref), pY(ref));
        ctx.scale(1 / mapScale, 1 / mapScale);
        // Offset in screen pixels too, so the name sits by the dot at every zoom instead of
        // drifting further out the further you zoom in.
        let label = mark.count > 1 ? loc('outer_shipyard_fleet_map',[mark.count]) : ship.name;
        ctx.fillText(label, pX(here) * mapScale + SHIP_LABEL_PX, pY(here) * mapScale - SHIP_LABEL_PX);
        ctx.restore();
    }

    // Signal names, in the same green as their dots and offset the same way the ship names are.
    {
        ctx.fillStyle = `rgb(${BEACON_COLOR})`;
        for (let beacon of liveBeacons()){
            let ref = genXYZcoord(beacon.s || 'spc_sun');
            if (starCulled(ref)){ continue; }
            let here = rel({ x: beacon.x, y: beacon.y, z: beacon.z }, ref);
            ctx.save();
            ctx.translate(pX(ref), pY(ref));
            ctx.scale(1 / mapScale, 1 / mapScale);
            ctx.fillText(beacon.n, pX(here) * mapScale + BEACON_LABEL_PX, pY(here) * mapScale - BEACON_LABEL_PX);
            ctx.restore();
        }
    }

    ctx.fillStyle = "#ffa500";
    ctx.font = `25px serif`;
    ctx.textAlign = 'center';   // labels are centered horizontally above the item they label
    // Planet labels clutter once zoomed out past labelMinScale, so they are hidden below it; star
    // labels are kept (stars stay visible at any zoom).
    // Planet names

    // If we're zoomed out too much then there's no point in drawing names - none will be legible anyway
    if (!starNamesHidden()) {
        // Scale the text to normal to prevent rendering bugs with font sizes below 0.01px. 
        // Cap the scale to systemLabelMinScale to prevent text being cluttered with multiple systems on screen
        ctx.save();
        if (mapScale > systemLabelMinScale)
            ctx.scale(1 / mapScale, 1 / mapScale);
        else
            ctx.scale(1 / systemLabelMinScale, 1 / systemLabelMinScale);
        for (let [id, planet] of Object.entries(spacePlanetStats)) {
            if (homeCulled){ break; }
            if (!mapView().planetNames){ break; }
            if (planet.star || planet.startype){ continue; }   // all star labels handled separately (below)
            if (mapScale < planetLabelMinScale){ continue; }   // zoomed out: planet names give way to star labels
            if (actions.space[id] && (actions.space[id].info.showDest ? actions.space[id].info.showDest().l : global.settings.space[id.substring(4)]) ){
                if (global.race['orbit_decayed'] && ['spc_home'].includes(id)){
                    continue;
                }
                let nameRef = actions.space[id].info.name;
                let nameText = typeof nameRef === "function" ? nameRef() : nameRef;
                let lx = pX(planetLocation[id]), ly = pY(planetLocation[id]);
                mapLabelled[id] = true;   // so the hover label knows not to repeat this one
                if (planet.moon) {
                    // Sit clear of the moon by a screen-constant gap rather than the old fixed map
                    // offset, which drifted further from the body the further you zoomed in and, at
                    // the zoom where a moon separates from its planet, put the name off-screen.
                    ctx.fillText(nameText, lx * mapScale + MOON_LABEL_GAP_PX, ly * mapScale);
                } else {
                    ctx.fillText(nameText, lx * mapScale, (ly - (0.2 * planet.size)) * mapScale);
                }
            }
        }
        // The Sun's label (home frame, at the origin): the cluster name (label) when zoomed out, and the
        // per-star name (zlabel) when zoomed in — opposite zoom ranges, so exactly one shows.
        {
            let sunText = mapScale < planetLabelMinScale ? spacePlanetStats.spc_sun.label : spacePlanetStats.spc_sun.zlabel;
            if (sunText && !homeCulled){
                // Sit just above the drawn dot (its radius + a small screen-constant gap) so the label
                // stays close to the star at any zoom.
                ctx.fillText(sunText, pX(planetLocation.spc_sun) * mapScale, (pY(planetLocation.spc_sun) - Math.max(spacePlanetStats.spc_sun.size * mapScale / 10, 1) + 2));
            }
        }
        // Undo text scaling
        ctx.restore();
    }


    // --- Star systems ---
    // Every star beyond the Sun is drawn in a frame translated to the star, so its huge coordinates
    // (hundreds of thousands of AU from the origin) keep canvas precision. Drawing a star and its
    // orbiting bodies directly in the Sun frame loses precision and distorts the shapes; here each
    // star and its system are clean circles centered on the star. The Sun itself sits at the origin
    // and is drawn with the home system above.
    // Systems are drawn back to front, so with the map tilted a near system covers a far one rather
    // than whichever happened to come last in the table.
    let starOrder = Object.entries(spacePlanetStats)
        .filter(([starId, star]) => star.startype && starId !== 'spc_sun' && !starCulled(genXYZcoord(starId)))
        .map(entry => ({ entry, d: pD(genXYZcoord(entry[0])) }))
        .sort((a,b) => b.d - a.d)
        .map(s => s.entry);
    for (let [starId, star] of starOrder) {
        let sc = genXYZcoord(starId);
        ctx.save();
        ctx.translate(pX(sc), pY(sc));
        ctx.shadowColor = 'transparent';

        // Orbits of bodies around this star. Traced through orbitPoint in the star's own frame, so
        // the eccentricity, off-centre focus and inclination all come from the one place that
        // positions the bodies themselves. Collected rather than drawn here so each can be split
        // around the star below; a barycenter (hidden) has no disc to split against, so its
        // companions' orbits are simply drawn whole.
        let starOrbits = [];
        for (let [id, planet] of Object.entries(spacePlanetStats)) {
            if (!mapView().planetOrbits){ break; }   // everything out here circles its star, none are moons
            if (planet.star !== starId || (planet.unlock && !global.tech[planet.unlock])){ continue; }
            if (planet.dist * mapScale < ORBIT_MIN_PX){ continue; }
            starOrbits.push(id);
        }
        if (star.hidden){
            ctx.lineWidth = 1 / mapScale;
            ctx.strokeStyle = "#c0c0c0";
            for (let id of starOrbits){
                ctx.setLineDash(spacePlanetStats[id].belt ? [0.01, 0.01] : []);
                strokeOrbit(ctx, id, sc);
            }
            ctx.setLineDash([]);
        }

        // The star and everything orbiting it, drawn back to front. The star goes in the same sorted
        // list rather than being painted first: it sits at the centre of these orbits, so half of
        // every orbit passes in front of it and half behind, and drawing it up front would let a
        // planet on the far side show through it. An invisible barycenter (hidden) is left out —
        // only its orbiting bodies are drawn. A body with `bodystar` renders as a star (color by its
        // spectral type, keeps the zoom-out minimum radius) rather than a plain planet dot.
        let orbiting = [];
        for (let [id, planet] of Object.entries(spacePlanetStats)) {
            if (planet.star !== starId || (planet.unlock && !global.tech[planet.unlock])){ continue; }
            orbiting.push(id);
        }
        let scale = star.hidden ? 1 : systemScale(star.size, orbiting, sc);
        let members = [];
        for (let id of orbiting) {
            let planet = spacePlanetStats[id];
            let q = rel(genXYZcoord(id), sc);
            let pr = planet.size / 10 * scale;
            let sep = Math.hypot(pX(q), pY(q)) * mapScale;   // how far it reads from its star
            pr = planet.bodystar ? Math.max(pr, 1 / mapScale)
                                 : visibleRadius(pr, sep);
            members.push({ id, planet, q, pr, sep });
        }
        if (!star.hidden){
            members.push({ id: starId, planet: star, q: { x: 0, y: 0, z: 0 }, isStar: true,
                pr: Math.max(star.size / 10 * scale, 1 / mapScale) });
        }
        members.sort((a,b) => pD(b.q) - pD(a.q));   // furthest first
        // Every one of these orbits is centred on the star, so they split around it. The far arcs go
        // down before any body is drawn — a planet on the far side of its orbit comes before the star
        // in the sorted order, and laying its ring just ahead of the star would paint the line over
        // it. The near arcs follow the star, in the loop below.
        if (starOrbits.length){ strokeOrbitGroup(ctx, starOrbits, sc, sc, false); }
        for (let m of members){
            let px = pX(m.q), py = pY(m.q);
            drawBody(ctx, px, py, m.pr, setColor(m.id), { star: m.isStar || !!m.planet.bodystar, kind: bodyKind(m.planet, m.id), seed: texSeed(m.id), rings: hasRings(m.planet, m.id), ringTilt: ringTilt(m.planet, m.id), glyph: cowGlyph(m.id) });
            if (m.isStar && starOrbits.length){ strokeOrbitGroup(ctx, starOrbits, sc, sc, true); }
            // Drawn in the star's own translated frame, so shift back to map coordinates to record it.
            addPickable(m.id, pX(sc) + px, pY(sc) + py, m.pr, m.sep);
            // Tau Ceti's jump gate rides alongside the home planet like a moon.
            if (m.id === 'tau_home' && tauJumpGate()){
                drawBody(ctx, px + m.pr * 0.9, py + m.pr * 0.9, m.pr * 0.35, '31a557', { gate: true, seed: texSeed('tau_home_jump_gate') });
            }
        }

        // Names
        // If we're zoomed out too much then there's no point in drawing names - none will be legible anyway
        if (!starNamesHidden()) {
            ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.shadowBlur = 2; ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.fillStyle = "#ffa500";
            ctx.font = `25px serif`;
            if (mapScale > systemLabelMinScale)
                ctx.scale(1 / mapScale, 1 / mapScale);
            else
                ctx.scale(1 / systemLabelMinScale, 1 / systemLabelMinScale);
            // Cluster name (label) when zoomed out; per-star name (zlabel, which distinguishes companions
            // like "Sirius A" / "Sirius B") when zoomed in. Opposite zoom ranges, so at most one shows.
            {
                let starText = mapScale < planetLabelMinScale ? star.label : star.zlabel;
                // Sit just above the drawn dot (its radius + a small screen-constant gap) so the label
                // stays close to the star at any zoom.
                if (starText){ ctx.fillText(starText, 0, -(Math.max(star.size / 10 * mapScale, 1) + 2)); }
            }
            // Labels for bodies that are themselves stars (e.g. a binary orbiting an invisible barycenter):
            // label when zoomed out, zlabel when zoomed in — drawn just above the body at its orbit position.
            for (let [id, planet] of Object.entries(spacePlanetStats)) {
                if (planet.star !== starId || !planet.bodystar){ continue; }
                let bt = mapScale < planetLabelMinScale ? planet.label : planet.zlabel;
                if (!bt){ continue; }
                let q = rel(genXYZcoord(id), sc);
                ctx.fillText(bt, pX(q) * mapScale, pY(q) * mapScale - (Math.max(planet.size / 10 * mapScale, 1) + 2));
            }
            for (let [id, planet] of Object.entries(spacePlanetStats)) {
                if (!mapView().planetNames){ break; }
                if (planet.star !== starId || (planet.unlock && !global.tech[planet.unlock])){ continue; }
                if (mapScale < planetLabelMinScale){ continue; }
                if (!actions.tauceti[id] || !actions.tauceti[id].info){ continue; }
                let q = rel(genXYZcoord(id), sc);
                ctx.fillText(actions.tauceti[id].info.name(), pX(q) * mapScale, (pY(q) - (0.2 * planet.size)) * mapScale);
            }
        }

        ctx.restore();
    }

    // Whatever the pointer is resting on, named beside the cursor — but only where the map is not
    // naming it already (see hoverName). Out at the star field the star names have shrunk away to
    // nothing and there is no zoom past it that brings them back, so pointing is the only way to
    // tell one dot from another; closer in, it is the worlds the map draws as scenery and never
    // labels — Saturn, the Galilean moons, the outer dwarf planets — that pointing identifies.
    if (mapHover && spacePlanetStats[mapHover]){
        let name = hoverName(mapHover);
        let p = genXYZcoord(mapHover);
        if (name && !starCulled(p)){
            // Drawn in screen space at a fixed pixel size, deliberately outside the map transform. Sized
            // in world units it would need a font past the canvas clamp at these zooms and would come
            // out a couple of pixels tall — the very thing that makes the ordinary labels unreadable
            // here. Sits directly above the cursor, which is within a grab radius of the star anyway.
            ctx.save();
            ctx.setTransform(1,0,0,1,0,0);
            ctx.font = `${HOVER_LABEL_PX}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = "#ffffff";
            ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.shadowBlur = 3; ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.fillText(name, mapHoverAt.x, mapHoverAt.y - HOVER_LABEL_GAP_PX);
            ctx.restore();
        }
    }

    ctx.restore();
    // Hand the frame's batched geometry to the GPU. No-op on the 2D path, which has already drawn.
    if (ctx.endFrame){ ctx.endFrame(); }
}

// Left to itself the map only repaints on the long loop, which is far too slow for the beacon pulse
// to read as one, so while it is open an animation timer drives its own repaints. It stops itself the
// moment the canvas leaves the DOM (the modal was closed) or the last signal goes quiet, so a map
// with nothing pulsing on it costs nothing.
const BEACON_FPS = 12;
var beaconTimer = false;
function beaconAnimate(){
    if (beaconTimer){
        clearInterval(beaconTimer);
        beaconTimer = false;
    }
    if (liveBeacons().length === 0){ return; }
    beaconTimer = setInterval(function(){
        if (!document.getElementById('mapCanvas') || liveBeacons().length === 0){
            clearInterval(beaconTimer);
            beaconTimer = false;
            return;
        }
        drawMap();
    }, Math.round(1000 / BEACON_FPS));
}

// Where the map was built, so switching renderers can rebuild it in place. A canvas element is
// bound to the first kind of context it hands out for as long as it exists, so the only way to move
// between 2D and WebGL is to replace the element — and the surrounding controls come with it.
var mapHost = false;

// Rebuild the map with the other renderer, holding the view exactly where the player left it. Only
// the backend changes; what gets drawn, and the code that draws it, are the same either way.
function rebuildSolarMap(){
    if (!mapHost || !mapHost.length){ return; }
    let keep = {
        scale: mapScale, shift: { x: mapShift.x, y: mapShift.y },
        yaw: mapYaw, pitch: mapPitch, focus: mapFocus, lock: starLockOn
    };
    if (mapCtx && mapCtx.destroy){ mapCtx.destroy(); }
    mapCtx = false;
    mapCtxFor = false;
    buildSolarMap(mapHost, keep);
}

function buildSolarMap(parentNode, keep) {
    // A rebuild replaces the previous map wholesale rather than stacking a second one under it.
    parentNode.find('.solarMapHost').remove();
    let currentNode = $(`<div class="solarMapHost" style="margin-top: 10px; margin-bottom: 10px;"></div>`).appendTo(parentNode);
    mapHost = parentNode;
    let canvasOffset = {};
    let dragOffset = {};
    let spin = {};
    let drag = false;       // false | 'pan' | 'rotate'
    let press = false;      // the in-flight left press, for telling a click from a pan
    const CLICK_SLOP_PX = 3;
    mapShift = {};
    mapScale = 20.0;
    mapHover = false;
    // The map always opens level, however it was left last time. Which way it faces is settled
    // below, once the star it is opening on is known (see mapDefaultYaw).
    mapYaw = 0;
    mapPitch = 0;
    camUpdate();

    // Radians of camera rotation per pixel dragged. A full turn takes a little under a screen width,
    // which is fast enough to be exploratory without overshooting on a small nudge.
    const ROTATE_RATE = 0.008;

    // The camera orbits a focus point rather than the origin. Spinning an orthographic camera about
    // the Sun throws a distant system clean off screen — its projected position moves by a share of
    // its hundreds of thousands of AU — so the map tracks the world point sitting at the middle of
    // the viewport and turns about that instead. Panning slides the focus, rotating pivots on it.

    // Inverse of pX/pY/pD: a projected point at a given depth, back in world space. The camera basis
    // is orthonormal, so this is just the transpose applied to (px, py, depth).
    function unproject(px, py, depth){
        return {
            x: px * camCY + py * camSY * camCP + depth * camSY * camSP,
            y: py * camCY * camCP + depth * camCY * camSP - px * camSY,
            z: depth * camCP - py * camSP
        };
    }
    // Re-read the focus after a pan. Sideways it simply follows the viewport centre, but the depth
    // along the view axis is unconstrained under an orthographic camera, so it is taken from the
    // star nearest the new centre. Carrying the old depth instead left the focus stranded on the
    // plane the player started from, which made rotation pivot about empty space a long way in front
    // of whatever they had just scrolled to.
    function refocus(){
        let px = (canvasOffset.x - mapShift.x) / mapScale;
        let py = (canvasOffset.y - mapShift.y) / mapScale;
        let depth = pD(mapFocus), best = Infinity;
        for (let [id, body] of Object.entries(spacePlanetStats)){
            if (!body.startype || body.hidden){ continue; }
            let p = genXYZcoord(id);
            let off = Math.hypot(pX(p) - px, pY(p) - py);
            if (off < best){ best = off; depth = pD(p); }
        }
        mapFocus = unproject(px, py, depth);
    }
    function recenterOn(pt){
        mapFocus = pt;
        mapShift.x = canvasOffset.x - pX(pt) * mapScale;
        mapShift.y = canvasOffset.y - pY(pt) * mapScale;
    }

    // The id of the star under the pointer, or false. Only bodies actually on screen are candidates —
    // culled stars aren't drawn, so they can't be picked. `bodystar` bodies (a binary orbiting an
    // invisible barycenter) draw as stars and are picked like them. The grab radius never drops below a
    // few pixels, since zoomed out a star is a single dot and would otherwise be impossible to hit.
    const CLICK_GRAB_PX = 10;
    function starAt(e){
        let rect = document.getElementById("mapCanvas").getBoundingClientRect();
        let cx = e.clientX - rect.left, cy = e.clientY - rect.top;
        let best = false, bestD = Infinity;
        for (let [id, body] of Object.entries(spacePlanetStats)){
            if ((!body.startype && !body.bodystar) || body.hidden){ continue; }
            let p = genXYZcoord(id);
            if (starCulled(p)){ continue; }
            let d = Math.hypot(mapShift.x + pX(p) * mapScale - cx, mapShift.y + pY(p) * mapScale - cy);
            if (d <= Math.max(CLICK_GRAB_PX, body.size / 10 * mapScale) && d < bestD){
                bestD = d;
                best = id;
            }
        }
        return best;
    }

    // The body under the pointer, or false. Unlike starAt this picks planets and moons as well, from
    // whatever drawMap last laid down. Nearest centre wins, so a moon sitting on its planet is still
    // reachable. `naming` includes the entries recorded for naming only — the ones out past the zoom
    // where planets are told apart individually — which a click must not land on (see addPickable).
    function bodyAt(e, naming){
        let rect = document.getElementById("mapCanvas").getBoundingClientRect();
        let cx = e.clientX - rect.left, cy = e.clientY - rect.top;
        let best = false, bestD = Infinity;
        for (let body of mapPickable){
            if (body.nameOnly && !naming){ continue; }
            let d = Math.hypot(body.x - cx, body.y - cy);
            // Eligibility is about detail, but the grab is about aim: a world you can see is worth
            // hitting from the same distance a star is, or a small one takes several tries.
            if (d <= Math.max(body.r, CLICK_GRAB_PX) && d < bestD){
                bestD = d;
                best = body.id;
            }
        }
        return best;
    }

    // The body the pointer should be naming.
    //
    // Whatever it is over, except that one drawn too close to its primary to be told apart hands the
    // name over to that primary: zoomed out that far it is a sub-pixel speck inside the other's disc,
    // and its centre can still be the nearest to the pointer, so naming it would put a label on
    // something the player cannot see. A moon defers to its planet, a planet to its star.
    function nameTarget(e){
        let id = bodyAt(e, true);
        if (!id){ return false; }
        // Keep walking up while what we landed on is buried in whatever it circles — zoomed right
        // out a moon can be inside its planet which is itself inside the Sun. Bounded so no shape of
        // data can loop.
        for (let step = 0; step < 4; step++){
            let hit = mapPickable.find(p => p.id === id);
            let body = spacePlanetStats[id];
            if (!hit || !hit.merged || !body || body.startype){ break; }
            let up = body.parent || body.star || 'spc_sun';
            if (up === id){ break; }
            id = up;
        }
        return id;
    }

    // Track what the pointer is over so drawMap can name it, repainting only when the answer changes —
    // a mousemove that is still over the same star costs nothing.
    function trackHover(e){
        let over = starNamesHidden() ? starAt(e) : false;
        // Failing a star, any body the map has drawn but left unnamed. hoverName is the one test for
        // whether there is anything to say, so a world whose name is already on the map is passed
        // over here and costs no repaint.
        if (!over){
            let body = nameTarget(e);
            if (body && hoverName(body)){ over = body; }
        }
        let rect = document.getElementById("mapCanvas").getBoundingClientRect();
        let at = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        // Repaint when the star changes and, while one is hovered, as the pointer moves — the label has
        // to follow the cursor to stay above it. Recording the position only on entry left it pinned
        // where the pointer came in, which put it back under the arrow on the way across the star.
        let shifted = over && (at.x !== mapHoverAt.x || at.y !== mapHoverAt.y);
        mapHoverAt = at;
        if (over !== mapHover || shifted){
            mapHover = over;
            drawMap();
        }
    }
    function clearHover(){
        if (mapHover){
            mapHover = false;
            drawMap();
        }
    }

    currentNode.append(
      $(`<canvas id="mapCanvas" style="width: 100%; height: 75vh"></canvas>`)
        // A left press that ends without the pointer really moving is a click, not a pan: if it
        // landed on a body, centre the view on it. The slop allows for the shake of an ordinary
        // click, which would otherwise pan a pixel and count as a drag.
        //
        // Stars are tried first and with their own generous grab radius, so a click meant for a star
        // that happens to be crowded by its own planets still gets the star. Failing that, any body
        // drawn large enough to see is a target — which means once you are zoomed in on a system you
        // can hop from world to world without dragging.
        .on("mouseup", (e) => {
            if (drag === 'pan' && press && !press.moved){
                let hit = starAt(e) || bodyAt(e);
                if (hit){
                    recenterOn(genXYZcoord(hit));
                    drawMap();
                    // Lock on so zooming pulls in on it rather than following the cursor away.
                    starLockOn = hit;
                    // Finding the cow is the whole of it — there is nothing else to do out there.
                    if (cowGlyph(hit)){
                        unlockFeat('secret_cow', global.race.universe === 'micro' ? true : false);
                    }
                }
            }
            drag = false;
            press = false;
        })
        .on("mouseover mouseout", () => { drag = false; press = false; clearHover(); })
        // Right-drag (or shift-drag, for anyone on a trackpad without a right button) orbits the
        // camera; plain left-drag still pans, exactly as it did before the map had a third axis.
        .on("contextmenu", () => false)
        .on("mousedown", (e) => {
            if (e.which === 3 || e.shiftKey){
                drag = 'rotate';
                spin.x = e.clientX; spin.y = e.clientY;
                spin.yaw = mapYaw; spin.pitch = mapPitch;
                return false;
            }
            drag = 'pan';
            press = { x: e.clientX, y: e.clientY, moved: false };
            dragOffset.x = e.clientX - mapShift.x;
            dragOffset.y = e.clientY - mapShift.y;
        })
        .on("mousemove", (e) => {
            if (drag === 'pan') {
                if (press && (Math.abs(e.clientX - press.x) > CLICK_SLOP_PX || Math.abs(e.clientY - press.y) > CLICK_SLOP_PX)){
                    press.moved = true;
                    starLockOn = false; // Unlock from a star if one is locked into, making scroll zooming follow cursor again
                }
                mapShift.x = e.clientX - dragOffset.x;
                mapShift.y = e.clientY - dragOffset.y;
                refocus();
                drawMap();
            }
            else if (drag === 'rotate') {
                mapYaw = wrapAngle(spin.yaw + (e.clientX - spin.x) * ROTATE_RATE);
                mapPitch = wrapAngle(spin.pitch + (e.clientY - spin.y) * ROTATE_RATE);
                camUpdate();
                recenterOn(mapFocus);
                drawMap();
            }
            else {
                trackHover(e);
            }
        })
        .on("wheel", (e) => {
            if(e.originalEvent.deltaY < 0) {
                mapScale /= 0.8;

                if (starLockOn) {
                    // Zoom wrt center of screen, keeping locked star in the center
                    mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) / 0.8;
                    mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) / 0.8;
                }
                else {
                    // Zoom wrt cursor position, moving center of screen as needed
                    let rect = document.getElementById("mapCanvas").getBoundingClientRect();
                    let cx = e.originalEvent.clientX - rect.left, cy = e.originalEvent.clientY - rect.top;

                    //temporarily shift to cursor location
                    mapShift.x += (canvasOffset.x - cx);
                    mapShift.y += (canvasOffset.y - cy);
                    
                    //zoom, centered on cursor location
                    mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) / 0.8;
                    mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) / 0.8;

                    //shift back to original location
                    mapShift.x -= (canvasOffset.x - cx);
                    mapShift.y -= (canvasOffset.y - cy);
                    refocus();
                }
                drawMap();
            }
            else {
                mapScale *= 0.8;

                if (starLockOn) {
                    // Zoom wrt center of screen, keeping locked star in the center
                    mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) * 0.8;
                    mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) * 0.8;
                }
                else {
                    // Zoom wrt cursor position, moving center of screen as needed
                    let rect = document.getElementById("mapCanvas").getBoundingClientRect();
                    let cx = e.originalEvent.clientX - rect.left, cy = e.originalEvent.clientY - rect.top;

                    //temporarily shift to cursor location
                    mapShift.x += (canvasOffset.x - cx);
                    mapShift.y += (canvasOffset.y - cy);
                    
                    //zoom, centered on cursor location
                    mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) * 0.8;
                    mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) * 0.8;

                    //shift back to original location
                    mapShift.x -= (canvasOffset.x - cx);
                    mapShift.y -= (canvasOffset.y - cy);
                    refocus();
                }
                drawMap();
            }
            return false;
        }),
      $(`<input type="button" value="+" style="position: absolute; width: 30px; height: 30px; top: 32px; right: 2px;">`)
        .on("click", () => {
            mapScale /= 0.8;
            mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) / 0.8;
            mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) / 0.8;
            drawMap();
        }),
      $(`<input type="button" value="-" style="position: absolute; width: 30px; height: 30px; top: 64px; right: 2px;">`)
        .on("click", () => {
            mapScale *= 0.8;
            mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) * 0.8;
            mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) * 0.8;
            drawMap();
        }),
      $(`<input type="button" value="${loc('space_sun_info_name')}" style="position: absolute; height: 30px; top: 2px; left: 2px;">`)
        .on("click", () => {
            mapScale = 20.0;
            // This is the "back to the default view of Sol" control — it already restores the
            // opening zoom, so it restores the opening bearing with it.
            mapYaw = mapDefaultYaw('spc_sun');
            camUpdate();
            recenterOn(genXYZcoord('spc_sun'));
            drawMap();
        })
    );

    // Center on the Tau Ceti star: only available (and only useful) once the system is unlocked.
    if (global.tech['tau_home'] && global.tech.tau_home >= 2){
        $(`<input type="button" value="${loc('tab_tauceti')}" style="position: absolute; height: 30px; top: 34px; left: 2px;">`)
            .on("click", () => {
                mapScale = 20.0;
                mapYaw = mapDefaultYaw('tauceti');
                camUpdate();
                recenterOn(genXYZcoord('tauceti'));
                drawMap();
            })
            .appendTo(currentNode);
    }

    // What-is-drawn toggles, in a row along the bottom edge rather than stacked with the navigation
    // buttons at the top: they are settings for the view rather than ways of moving around it, and a
    // flex row sizes itself to whatever the labels translate to instead of needing fixed offsets.
    // Each label states what the click will do, so it flips with the setting.
    let mapToggles = $(`<div class="mapToggles" style="position: absolute; bottom: 2px; left: 2px; display: flex; flex-wrap: wrap; gap: 4px;"></div>`);
    // Each button reads and writes its own key in global.settings.mapView, so the row is rebuilt from
    // the saved setting every time the map opens and the click is what persists the change.
    [
        ['planetOrbits', 'solar_map_hide_planet_orbits', 'solar_map_show_planet_orbits'],
        ['moonOrbits', 'solar_map_hide_moon_orbits', 'solar_map_show_moon_orbits'],
        // A busy campaign puts enough dots, trails and names over the inner system to hide the worlds
        // underneath them.
        ['ships', 'solar_map_hide_ships', 'solar_map_show_ships'],
        ['planetNames', 'solar_map_hide_planet_names', 'solar_map_show_planet_names'],
    ].forEach(function([key, onKey, offKey]){
        $(`<input type="button" value="${loc(mapView()[key] ? onKey : offKey)}" style="height: 30px;">`)
            .on("click", function(){
                mapView()[key] = !mapView()[key];
                $(this).val(loc(mapView()[key] ? onKey : offKey));
                drawMap();
            })
            .appendTo(mapToggles);
    });
    mapToggles.appendTo(currentNode);

    // Which backend paints the map, opposite the view toggles. Both draw the same scene from the
    // same code, so this is a performance choice rather than a visual one: WebGL batches the frame
    // onto the GPU, which tells on a busy star field, while the 2D renderer needs nothing of the
    // hardware. Offered only where WebGL actually works — with no second option there is nothing to
    // switch to, and a button that reported a mode the player could not leave would just mislead.
    if (webglSupported()){
        $(`<input type="button" value="${loc(mapRenderer() === 'webgl' ? 'solar_map_renderer_webgl' : 'solar_map_renderer_canvas')}" style="position: absolute; bottom: 2px; right: 2px; height: 30px;">`)
            .on("click", function(){
                mapView().webgl = !mapView().webgl;
                // The canvas has to be replaced to change context type, so the whole map is rebuilt
                // around the player's current view rather than merely repainted.
                rebuildSolarMap();
            })
            .appendTo(currentNode);
    }

    // Put the camera back to its default angle without disturbing where the player has panned and
    // zoomed to. Which default that is depends on what is being looked at, so it is taken from the
    // star nearest the focus — resetting while out at Sol should give Sol's opening view, not a
    // bearing the map never opens on.
    $(`<input type="button" value="${loc('solar_map_reset_view')}" style="position: absolute; height: 30px; top: 66px; left: 2px;">`)
        .on("click", () => {
            mapYaw = mapDefaultYaw(nearestStar(mapFocus));
            mapPitch = 0;
            camUpdate();
            recenterOn(mapFocus);
            drawMap();
        })
        .appendTo(currentNode);

    let bounds = document.getElementById("mapCanvas").getBoundingClientRect();
    canvasOffset.x = bounds.width / 2;
    canvasOffset.y = bounds.height / 2;
    // The map opens on wherever the campaign is being fought. The resettlement arc starts out of
    // Tau Ceti, but from resettle 9 the work is back in the home system, so it swings back to the Sun.
    // Locked on as well as centred, so the first zoom pulls in on that star instead of drifting off
    // toward wherever the pointer happened to be resting.
    if (keep){
        // A renderer switch is not a fresh open: the camera, including the rotation an ordinary open
        // deliberately levels, is put back exactly as it was so the two can be compared frame for
        // frame.
        mapScale = keep.scale;
        mapShift.x = keep.shift.x;
        mapShift.y = keep.shift.y;
        mapYaw = keep.yaw;
        mapPitch = keep.pitch;
        mapFocus = keep.focus;
        starLockOn = keep.lock;
        camUpdate();
    }
    else {
        let openOn = global.tech['resettle'] && global.tech.resettle < 9 ? 'tauceti' : 'spc_sun';
        // Face the default way for whatever it is opening on, before centring — recenterOn projects
        // through the camera, so the camera has to be pointing the right way first.
        mapYaw = mapDefaultYaw(openOn);
        camUpdate();
        recenterOn(genXYZcoord(openOn));
        starLockOn = openOn;
    }

    drawMap();
    beaconAnimate();
}

function solarModal(){
    $('#modalBox').append($('<p id="modalBoxTitle" class="has-text-warning modalTitle">Solar System</p>'));
    buildSolarMap($(`#modalBox`));
}

// Populate the ship dispatch modal with a button for each valid destination.
// Active temporary coordinates, as destinations. Offered to every ship regardless of class — an
// explorer is barred from the ordinary regions by its drive, not from a set of coordinates.
function tempDestinations(ship){
    let temps = global.race['tempCoordinates'];
    if (!temps){ return []; }
    return Object.keys(temps)
        .filter(key => temps[key] && temps[key].a && (ship.inTransit ? ship.destination.name : ship.location.name) !== key)
        .map(key => ({ region: key, name: temps[key].n }));
}

// Everywhere a single ship could be sent.
function shipDestinations(ship){
    const spaceRegions = spaceTech();
    let dests = [];
    if (ship.class === 'explorer'){
        if (ship.location.name !== 'tauceti'){
            dests.push({ region: 'tauceti', name: loc('tech_era_tauceti') });
        }
        return dests.concat(tempDestinations(ship));
    }

    let currentShipLocation = ship.inTransit ? ship.destination.name : ship.location.name;

    Object.keys(spaceRegions).forEach(function(region){
        if (currentShipLocation !== region){
            if (spaceRegions[region].info.nav()){
                if (region === 'spc_sun_gate'){
                    let name = typeof spaceRegions.spc_sun_gate.info.desc === 'string' ? spaceRegions.spc_sun_gate.info.desc : spaceRegions.spc_sun_gate.info.desc();
                    dests.push({ region: region, name: name });
                }
                else if (!global.race['orbit_decayed'] || (global.race['orbit_decayed'] && region !== 'spc_moon')){
                    let name = typeof spaceRegions[region].info.name === 'string' ? spaceRegions[region].info.name : spaceRegions[region].info.name();
                    dests.push({ region: region, name: name });
                }
            }
        }
    });
    Object.keys(tauCetiModules).forEach(function(region){
        if (currentShipLocation !== region){
            if (tauCetiModules[region].info.nav()){
                let name = typeof tauCetiModules[region].info.name === 'string' ? tauCetiModules[region].info.name : tauCetiModules[region].info.name();
                dests.push({ region: region, name: name });
            }
        }
    });
    return dests.concat(tempDestinations(ship));
}

function shipDispatchModal(id, modal){
    let ship = global.space.shipyard.ships[id];
    if (!ship){ return; }

    // Dispatching any member of a fleet moves the whole fleet, so the modal describes the group.
    let crew = shipFleet(ship);
    let group = crew.length ? crew : [ship];
    let isFleet = crew.length > 1;

    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${isFleet ? loc('outer_shipyard_dispatch_fleet',[group.length]) : loc('outer_shipyard_dispatch',[ship.name])}</p>`));

    // Stats — mirrors the fleet row readout so the player can weigh what is being sent. For a fleet
    // the numbers that combine are summed, and the ones that gate the group are its worst: the
    // slowest engine sets the pace and the most battered hull is what will fail first.
    let slowest = fleetPace(group);
    let fuel = shipFuelUse(slowest);
    let fuelText = fuel.res ? `${fuel.burn} ${global.resource[fuel.res].name}/s` : `N/A`;
    let speed = Math.round((149597870.7/225/24/3600) * shipSpeed(slowest));
    let damage = Math.max(...group.map(s => s.damage));
    let hullClass = damage <= 10 ? `has-text-success` : (damage >= 65 ? `has-text-danger` : (damage >= 40 ? `has-text-caution` : ``));
    let sum = fn => group.reduce((t,s) => t + fn(s), 0);
    let stats = $(`<div class="shipDispatchStats"></div>`);
    stats.append(`<span><span class="has-text-warning">${loc('crew')}</span> <span class="pad">${sum(shipCrewSize)}</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('firepower')}</span> <span class="pad">${sum(shipAttackPower)}</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('outer_shipyard_sensors')}</span> <span class="pad">${Math.max(...group.map(sensorRange))}km</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('speed')}</span> <span class="pad">${speed}km/s</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('outer_shipyard_fuel')}</span> <span class="pad">${fuelText}</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('outer_shipyard_hull')}</span> <span class="pad ${hullClass}">${100 - damage}%</span></span>`);
    $('#modalBox').append(stats);

    let list = $(`<div class="shipDispatch"></div>`);
    $('#modalBox').append(list);

    // A fleet can only go where every one of its ships can go, or it would not arrive as a unit —
    // an explorer, for instance, can only ever make for Tau Ceti.
    let dests = shipDestinations(group[0]);
    for (let i=1; i<group.length; i++){
        let reachable = new Set(shipDestinations(group[i]).map(d => d.region));
        dests = dests.filter(d => reachable.has(d.region));
    }

    // Crew check
    let crewNeed = group.reduce((t,s) => t + (shipManned(s) ? 0 : shipCrewSize(s)), 0);
    let crewFree = Math.max(0, global.civic.garrison.workers - global.civic.garrison.crew);

    // A hull under the launch minimum holds the ship in dry dock
    if (group.some(s => !shipCanLaunch(s))){
        list.append(`<span class="has-text-danger">${loc('outer_shipyard_dispatch_damaged',[minHullToLaunch])}</span>`);
    }
    else if (crewNeed > crewFree){
        list.append(`<span class="has-text-danger">${loc(group.length > 1 ? 'outer_shipyard_dispatch_crew_fleet' : 'outer_shipyard_dispatch_crew',[crewNeed,crewFree])}</span>`);
    }
    else if (dests.length === 0){
        list.append(`<span class="has-text-caution">${loc('outer_shipyard_dispatch_none')}</span>`);
    }
    else {
        // Once the jump gates are running a ship can cross between systems, so the list spans more
        // than one star and each destination says which it belongs to.
        let showSystem = global.tech['resettle'] && global.tech.resettle >= 3;
        // Somewhere a battered hull can actually be put back together is worth picking out of the list.
        let yards = activeRepairYards();
        dests.forEach(function(d){
            let trip = planShipTrip(slowest, d.region);
            if (!trip)
                return;

            let days = trip ? Math.round(trip.totalTime) : 0;
            let sysName = showSystem ? locSystemName(d.region) : '';
            let sys = sysName ? `<span class="dispatchSystem has-text-info">${sysName}</span>` : ``;
            let yard = yards.includes(d.region) ? `<span class="dispatchYard" title="${loc('outer_shipyard_repair_yard')}" aria-label="${loc('outer_shipyard_repair_yard')}">🛠️</span>` : ``;
            $(`<button class="button is-info ${d.region}"><span class="dispatchName">${d.name}${yard}</span>${sys}<span class="dispatchDays has-text-caution">${loc('transit_time',[days])}</span></button>`)
                .on('click', function(){
                    sendShipTo(id, d.region);
                    if (modal && modal.close){ modal.close(); }
                })
                .appendTo(list);
        });
    }
}

// The battle log. Newest first, one row per engagement: when and where it happened, what each side
// brought, and what each side landed. Read-only — it is a record, not a control.
export function battleLogModal(){
    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('battle_log_title')}</p>`));

    let log = zBattleLog_read();
    let list = $(`<div class="battleLog"></div>`);
    $('#modalBox').append(list);

    if (log.length === 0){
        list.append(`<span class="has-text-caution">${loc('battle_log_empty')}</span>`);
        return;
    }

    // A hull tally rendered as "2 Corvettes, 1 Destroyer", using the same class names the shipyard uses.
    let roster = function(tally){
        let parts = shipClassSizes.concat(['explorer']).filter(c => tally[c] > 0).map(function(c){
            return `${tally[c]} ${loc(`outer_shipyard_class_${c}`)}`;
        });
        return parts.length ? parts.join(`, `) : loc('battle_log_unknown');
    };

    log.forEach(function(b){
        let row = $(`<div class="battleRow"></div>`);
        // A fight you walked away from unscathed reads differently from one that cost you a hull, so the
        // outcome is colored rather than left for the player to work out from the numbers.
        let tone = b.pl > 0 ? `has-text-danger` : (b.el > 0 ? `has-text-success` : `has-text-warning`);
        row.append(`<div class="battleHead"><span class="${tone}">${loc('battle_log_where',[regionName(b.l)])}</span> <span class="has-text-caution">${loc('battle_log_day',[b.d])}</span></div>`);
        row.append(`<div class="battleSide"><span class="has-text-success">${loc('battle_log_yours')}</span> <span>${roster(b.p)}</span> <span class="has-text-warning">${loc('battle_log_dealt',[b.pd])}</span>${b.pl > 0 ? ` <span class="has-text-danger">${loc('battle_log_lost',[b.pl])}</span>` : ``}</div>`);
        row.append(`<div class="battleSide"><span class="has-text-danger">${loc('battle_log_theirs')}</span> <span>${roster(b.e)}</span> <span class="has-text-warning">${loc('battle_log_dealt',[b.ed])}</span>${b.el > 0 ? ` <span class="has-text-success">${loc('battle_log_destroyed',[b.el])}</span>` : ``}</div>`);
        list.append(row);
    });
}

// Who a ship could serve under: a fleet of its own, or any flagship parked alongside with the command
// points to spare for it. Every option says what it costs and what the fleet has left, so the choice
// is made on the numbers rather than by trial and error.
function fleetJoinModal(id, modal){
    let ship = global.space.shipyard.ships[id];
    if (!ship){ return; }

    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('outer_shipyard_fleet_assign',[ship.name])}</p>`));

    let cost = fleetCommandCost(ship);
    let stats = $(`<div class="shipDispatchStats"></div>`);
    stats.append(`<span><span class="has-text-warning">${loc('outer_shipyard_fleet_cost')}</span> <span class="pad">${cost}</span></span>`);
    if (fleetCommandRating(ship) > 0){
        stats.append(`<span><span class="has-text-warning">${loc('outer_shipyard_fleet_rating')}</span> <span class="pad">${fleetCommandRating(ship)}</span></span>`);
    }
    $('#modalBox').append(stats);

    let list = $(`<div class="shipDispatch"></div>`);
    $('#modalBox').append(list);

    let redraw = function(){
        if (modal && modal.close){ modal.close(); }
        drawShips();
    };

    if (fleetWorthForming(ship)){
        $(`<button class="button is-info fleetNew"><span class="dispatchName">${loc('outer_shipyard_fleet_form')}</span><span class="dispatchDays has-text-caution">${loc('outer_shipyard_fleet_command',[0,fleetCommandRating(ship)])}</span></button>`)
            .on('click', function(){
                if (formFleet(ship)){ redraw(); }
            })
            .appendTo(list);
    }

    let options = fleetsFor(ship);
    options.forEach(function(flag){
        let free = fleetCommandFree(flag.fid);
        $(`<button class="button is-info fleetJoin"><span class="dispatchName"><span class="flag has-text-caution">⚑</span> ${flag.name}</span><span class="dispatchSystem has-text-info">${loc(`outer_shipyard_class_${flag.class}`)}</span><span class="dispatchDays has-text-caution">${loc('outer_shipyard_fleet_room',[free,fleetCommandRating(flag)])}</span></button>`)
            .on('click', function(){
                if (joinFleet(ship,flag.fid)){ redraw(); }
            })
            .appendTo(list);
    });

    if (options.length === 0 && !fleetWorthForming(ship)){
        list.append(`<span class="has-text-caution">${loc('outer_shipyard_fleet_nowhere')}</span>`);
    }
}

// --- Fleets ---------------------------------------------------------------------------------
// A fleet is a flagship and the ships that answer to it. Both carry the same `fid`, and the flagship
// alone carries `flag`, so a fleet survives the ship list being re-sorted and any number of fleets can
// share one orbit without running together. Ships under way are matched on their transit too — a ship
// inbound to a place has its location set to that destination the moment it leaves, and it should not
// be swept up by a fleet already sitting there. Requires the fleet_command tech (syard_fleet).
//
// What a hull is worth in charge of a fleet, and what it costs to put one under a flagship. Command
// points are the whole limit on a fleet's size, and the flagship spends none of its rating on itself —
// a cruiser leads ten points of escort, not nine. The three heavy hulls are built to lead: they steady
// the ships around them (`buff`) and ride out fire better themselves (`soak`). A destroyer manages a
// lesser version of the same. The two smallest can lead but are no good at it — no combat bonus at
// all, just a group that travels faster (`speed`). Explorers are absent on purpose: a one-off Tau Ceti
// hull that can only ever fly to one place neither leads nor joins.
const fleetHulls = {
    corvette:      { cmd: 1,  cost: 1,  buff: 0,    soak: 0,   speed: 0.1 },
    frigate:       { cmd: 2,  cost: 2,  buff: 0,    soak: 0,   speed: 0.1 },
    destroyer:     { cmd: 5,  cost: 3,  buff: 0.05, soak: 0.1, speed: 0 },
    cruiser:       { cmd: 10, cost: 5,  buff: 0.1,  soak: 0.2, speed: 0 },
    battlecruiser: { cmd: 15, cost: 8,  buff: 0.1,  soak: 0.2, speed: 0 },
    dreadnought:   { cmd: 20, cost: 12, buff: 0.1,  soak: 0.2, speed: 0 }
};

// The command table, so the wiki documents the live numbers rather than repeating them. Read-only by
// convention — callers should not mutate what comes back, they should change fleetHulls above.
export function fleetVars(){
    return { hulls: fleetHulls };
}

// Command points a hull has to spend when it leads, and what it takes up when it follows. Both are 0
// for a hull that does not fleet at all.
export function fleetCommandRating(ship){
    return ship && fleetHulls.hasOwnProperty(ship.class) ? fleetHulls[ship.class].cmd : 0;
}
export function fleetCommandCost(ship){
    return ship && fleetHulls.hasOwnProperty(ship.class) ? fleetHulls[ship.class].cost : 0;
}

function allShips(){
    return global.space['shipyard'] && global.space.shipyard['ships'] ? global.space.shipyard.ships : [];
}

// The ship leading fleet `fid`, or false when it no longer exists.
function fleetFlagship(fid){
    if (!fid){ return false; }
    return allShips().find(s => s.flag && s.fid === fid) || false;
}

// Every ship flying under a fleet id, flagship included.
function fleetMembers(fid){
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

// Whether two ships are in the same place and in the same state of motion — both sitting at the same
// location, or both crossing to the same one and due at the same time. A fleet under way is only
// together in the sense that its ships share a leg, so membership has to be judged on both.
function sameStation(a,b){
    if (!a || !b || a.inTransit !== b.inTransit){ return false; }
    return a.inTransit
        ? a.destination.name === b.destination.name && a.timeToNextStep === b.timeToNextStep
        : a.location.name === b.location.name;
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

// Share of an incoming hit a flagship shrugs off. Only the ship in command benefits, and only while it
// actually has an escort to screen it — a flagship leading nobody is just a ship, however it is flagged.
function fleetDamageSoak(ship){
    if (!ship || !ship.flag || !shipFlagship(ship) || fleetEscortCount(ship.fid) === 0){ return 0; }
    return fleetHulls.hasOwnProperty(ship.class) ? fleetHulls[ship.class].soak : 0;
}

// Speed a fleet gains from being led by a light hull. Flagship and escort alike — the whole group
// travels as fast as the arrangement lets it.
function fleetSpeedBonus(ship){
    let flag = shipFlagship(ship);
    // A group of one is not a group: a light hull flying alone has nobody to set the pace for.
    if (!flag || fleetEscortCount(flag.fid) === 0){ return 0; }
    return fleetHulls.hasOwnProperty(flag.class) ? fleetHulls[flag.class].speed : 0;
}

// A ship can be shuffled in or out of a fleet only while it is actually sitting somewhere rather than
// crossing between places, and only if its hull is one that fleets at all.
function fleetEligible(ship){
    return global.tech['syard_fleet'] && ship && !ship.inTransit && fleetHulls.hasOwnProperty(ship.class) ? true : false;
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

// Take a ship out of its fleet. Standing the flagship down releases everyone with it — a fleet is the
// ship holding it together, and without that there is nothing left to answer to.
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
function fleetWorthForming(ship){
    return fleetEligible(ship) && !ship.fid && fleetCommandRating(ship) > 0 ? true : false;
}

// A fleet keeps pace with its slowest ship, so that is the one every trip is planned on.
function fleetPace(group){
    if (!group || group.length === 0){ return false; }
    return group.reduce((a,b) => shipSpeed(a) <= shipSpeed(b) ? a : b);
}

// Where a damaged ship can be put back together. `avail` is called whenever a ship needs somewhere to go.
const repairStations = {
    // Before the resettlement the shipyard itself does the repairs. Once it is gone the repair yard
    // built in its place takes over, and unlike the shipyard it has to actually be running.
    spc_dwarf: { avail(){
        return global.tech['resettle']
            ? (global.space['repair_yard'] && global.space.repair_yard.count > 0 && p_on['repair_yard'] ? true : false)
            : (global.space['shipyard'] && global.space.shipyard.count > 0 ? true : false);
    } },
    tau_gas2:  { avail(){ return global.tech['resettle'] && global.tauceti['adv_shipyard'] && global.tauceti.adv_shipyard.count > 0 ? true : false; } }
};

// Docking is about the place, not whether it is currently staffed, so this covers every station whether
// or not its condition passes right now.
const shipyardLocations = Object.keys(repairStations);

// The yards that could take a ship in right now. Read fresh every time rather than cached: a station's
// condition turns on whether it has been built, and that changes as the campaign runs.
function activeRepairYards(){
    return shipyardLocations.filter(function(yard){
        try { return repairStations[yard].avail() ? true : false; }
        catch (e){ return false; }
    });
}
// Hull percentage a ship must have before it is cleared to leave for another destination.
const minHullToLaunch = 75;

// Docked at a yard, as opposed to out in the field or crossing to one. Ships here are in dry dock:
// safe from the wear that finds them everywhere else, and repaired at double rate.
export function atShipyard(ship){
    if (!ship)
        return false;

    return !ship.inTransit && shipyardLocations.includes(ship.location.name);
}

// A hull below minHullToLaunch% is not spaceworthy — the threshold the yard and the standing orders
// both measure a battered ship against.
export function shipSpaceworthy(ship){
    return ship ? 100 - ship.damage >= minHullToLaunch : false;
}

// Whether a ship is in good enough condition to be sent somewhere
export function shipCanLaunch(ship){
    return ship ? shipSpaceworthy(ship) || !atShipyard(ship) : false;
}

// --- Fleet Tactical Command ---------------------------------------------------------------------
// Standing orders that run without the player: pull a badly damaged ship out of the line and send it
// home, then put it back where it was once the yard is done with it.

// Range each percentage option accepts. One definition drives the input's own limits, the clamp behind
// it and the range shown in its label, so they cannot disagree.
export const fleetCmdRange = {
    flee: { min: 0, max: 50 },
    retHull: { min: 75, max: 100 }
};

export function fleetCmd(){
    if (!global.settings['fleetCmd']){
        global.settings['fleetCmd'] = { flee: 25, ret: true, retHull: 100, quiet: false, zquiet: false };
    }
    let cfg = global.settings.fleetCmd;
    // Backfill anything added after a save was written, so a new option is bound to a real value rather
    // than to undefined the first time the panel is drawn.
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

// The panel and the standing orders it configures come with Fleet Command: the logistics that let ships
// move as a group are the same ones that let them be given orders to follow on their own.
export function fleetCmdUnlocked(){
    return global.tech['syard_fleet'] ? true : false;
}

// The station a ship runs to: of those currently active, whichever it can reach soonest from where it
// is. Judged on travel time rather than raw distance, so an open wormhole route counts for what it
// actually saves a failing hull. False when there is nowhere active to run to.
function repairYard(ship){
    let best = false;
    let bestDays = false;
    Object.keys(repairStations).forEach(function(locationName){
        if (!ship.inTransit && ship.location.name === locationName){ return; }
        let active = false;
        try { active = repairStations[locationName].avail(); }
        catch (e){ active = false; }
        if (!active){ return; }

        let trip = planShipTrip(ship,locationName);
        if (!trip || typeof trip.totalTime !== 'number'){ return; }
        if (bestDays === false || trip.totalTime < bestDays){
            bestDays = trip.totalTime;
            best = locationName;
        }
    });
    return best;
}

// Move a ship without any of the checks that apply to an order the player gives. A ship running for
// repairs is by definition too damaged to launch normally.
function orderShipTo(ship,locationName){
    if (!ship || (!ship.inTransit && locationName === ship.location.name) || (ship.inTransit && ship.destination.name === locationName)){ return false; }
    if (!shipManned(ship)){ global.civic.garrison.crew += shipCrewSize(ship); }
    initializeShipTrip(ship, locationName);
    return true;
}

// The same, for a whole fleet. Every ship takes the identical trip computed for the slowest, exactly as
// a dispatch by hand does, so the group stays together the whole way and arrives on the same tick
// rather than trickling in one hull at a time.
function orderFleetTo(group,locationName){
    if (!group || group.length === 0){ return false; }
    let lead = group[0];
    if ((!lead.inTransit && locationName === lead.location.name) || (lead.inTransit && lead.destination.name === locationName)){ return false; }
    // Planned once on the slowest hull and handed to every ship, so the whole group flies the same legs
    // on the same schedule instead of each working out its own.
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
    // A name, never the location object: what comes back is handed straight to orderShipTo as a
    // destination. A fleet already under way is making for somewhere, and that is where to catch it.
    return flag.inTransit ? flag.destination.name : flag.location.name;
}

// A ship that broke off from a fleet for repairs falls back in with it the moment the two are in the same place again.
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

    // A fleet is dealt with as a unit, through its flagship. An escort still flying with one takes no
    // orders of its own beyond breaking off when it is shot up, so the two never contradict each other.
    global.space.shipyard.ships.forEach(function(ship){
        let hull = 100 - ship.damage;
        // Only a flagship that still leads something needs to speak for a group.
        let fleet = ship.flag && shipFlagship(ship) ? shipFleet(ship) : [ship];

        // Disengage: a hull that has fallen past the line breaks off and runs for a repair yard. An
        // escort goes alone, the rest of the fleet carrying on without it, and remembers the fleet so
        // it can fall back in once it is patched up. A flagship cannot go alone — the fleet is only a
        // fleet while it is there to lead it — so the whole formation withdraws with it and stays
        // together at the yard.
        if (!ship.inTransit && !atShipyard(ship) && hull < cfg.flee){
            let yard = repairYard(ship);
            if (yard && yard !== ship.location.name){
                if (fleet.length > 1){
                    // Where each ship was is what it comes back to, unless it was already limping home
                    // from somewhere else, in which case that original posting is the one worth keeping.
                    fleet.forEach(function(s){ if (!s['ret']){ s['ret'] = s.location.name; } });
                    if (orderFleetTo(fleet,yard)){
                        if (!cfg.quiet){
                            messageQueue(loc('fleet_cmd_disengage_fleet',[ship.name,hull,fleet.length,regionName(yard)]),'warning',false,['combat']);
                        }
                        moved = true;
                    }
                }
                else {
                    if (!ship['ret']){ ship['ret'] = ship.location.name; }
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

        // A ship that broke off on its own falls back in with its fleet as soon as the two are in the same place
        if (ship['rfid'] && !ship.inTransit){
            if (rejoinFleet(ship,cfg)){
                moved = true;
                return;
            }
            let chase = rejoinTarget(ship);
            if (chase && chase !== ship.location.name && !atShipyard(ship) && shipSpaceworthy(ship) && orderShipTo(ship,chase)){
                if (!cfg.quiet){
                    messageQueue(loc('fleet_cmd_regroup',[ship.name,regionName(chase)]),'success',false,['combat']);
                }
                moved = true;
                return;
            }
        }

        // Return on repair: patched up and still holding a posting to go back to. A fleet goes back
        // together, so it waits until every one of its ships is fit to fly and leaves on the flagship's
        // order — an escort sitting in the yard with its fleet holds its place until then.
        if (ship['ret'] && !ship.inTransit && atShipyard(ship)){
            if (!cfg.ret){ return; }
            if (ship.fid && !ship.flag){ return; }
            if (fleet.some(s => 100 - s.damage < cfg.retHull)){ return; }
            // A ship still holding a place in a fleet leaves dock making for the fleet rather than for where it was damaged. 
            // If the fleet is gone, it falls back on its original posting.
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
        if (ship['ret'] && !ship.inTransit && ship.location.name === ship.ret){
            delete ship.ret;
            moved = true;
        }
    });

    if (moved){ drawShips(); }
}

// Ships parked at a shipyard are unmanned and draw a crew on departure; anywhere else, or already
// under way, they are crewed.
function shipManned(ship){
    return ship.inTransit || !shipyardLocations.includes(ship.location.name);
}

// Send a ship to a destination region, or its whole fleet if it belongs to one. Every ship takes the
// identical trip computed for the slowest, so the group stays together the whole way and arrives at
// the same tick rather than trickling in.
function sendShipTo(id, locationName){
    let ship = global.space.shipyard.ships[id];
    if (!ship || (!ship.inTransit && locationName === ship.location.name) || (ship.inTransit && ship.destination.name === locationName)){ return; }
    let group = shipFleet(ship);
    if (!group.length){ group = [ship]; }

    // Nothing leaves dry dock on a badly damaged hull
    if (group.some(s => !shipCanLaunch(s))){ return; }

    // Crew for every unmanned ship has to be on hand up front — a fleet leaves together or not at all.
    let need = group.reduce((t,s) => t + (shipManned(s) ? 0 : shipCrewSize(s)), 0);
    if (need > global.civic.garrison.workers - global.civic.garrison.crew){ return; }

    let trip = planShipTrip(fleetPace(group), locationName);
    if (trip) {
        for (let s of group){
            if (!shipManned(s)){ global.civic.garrison.crew += shipCrewSize(s); }
            // An order from the player overrides the standing one: wherever it was posted before, this is
            // where it is going now, it will not wander back on its own, and it is no longer holding a
            // berth open in a fleet it was told to leave.
            if (s['ret']){ delete s.ret; }
            if (s['rfid']){ delete s.rfid; }
            initializeShipTrip(s, locationName, trip);
        }
    }

    drawShips();
}
