import { global, p_on, support_on, sizeApproximation, keyMap, seededRandom } from './vars.js';
import { vBind, clearElement, popover, clearPopper, messageQueue, powerCostMod, powerModifier, spaceCostMultiplier, deepClone, calcPrestige, flib, darkEffect, adjustCosts, get_qlevel, timeCheck, timeFormat, buildQueue } from './functions.js';
import { races, traits, orbitLength } from './races.js';
import { spatialReasoning, unlockContainers } from './resources.js';
import { armyRating, garrisonSize, soldierDeath, buildGarrison } from './civics.js';
import { jobScale, job_desc, loadFoundry, limitCraftsmen } from './jobs.js';
import { production, highPopAdjust } from './prod.js';
import { actions, payCosts, powerOnNewStruct, setAction, drawTech, bank_vault, buildTemplate, casinoEffect, housingLabel, structName, initStruct } from './actions.js';
import { fuel_adjust, int_fuel_adjust, spaceTech, renderSpace, checkRequirements, incrementStruct, planetName } from './space.js';
import { defineGovernor, removeTask, govActive } from './governor.js';
import { defineIndustry, nf_resources, addSmelter, setupRituals, cancelRituals } from './industry.js';
import { arpa } from './arpa.js';
import { matrix, retirement, gardenOfEden } from './resets.js';
import { traitCostMod } from './races.js';
import { loadTab } from './index.js';
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
            nav(){ return global.tech['resettle'] ? false : true; }
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
            effect(wiki){
                let support = `<div>+${loc(`galaxy_alien2_support`,[$(this)[0].support(wiki),planetName().titan])}</div>`;
                return `${support}<div class="has-text-caution">${loc('space_electrolysis_use',[$(this)[0].support_fuel().a,global.resource.Water.name,$(this)[0].powered()])}</div>`;
            },
            support(wiki){
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
            title: loc('interstellar_habitat_title'),
            desc(){
                return `<div>${loc('interstellar_habitat_title')}</div><div class="has-text-special">${loc('space_habitat_req',[planetName().titan, global.resource.Food.name, global.resource.Water.name])}</div>`;
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
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().titan])}</div><div>${loc('space_red_mine_effect',[adamantite,global.resource.Adamantite.name])}</div><div>${loc('space_red_mine_effect',[aluminium,global.resource.Aluminium.name])}</div>`;
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
            res(){
                return [
                    'Lumber','Stone','Furs','Copper','Iron','Aluminium','Cement','Coal','Steel','Titanium',
                    'Alloy','Polymer','Iridium','Chrysotile','Nano_Tube','Neutronium','Adamantite'
                ];
            },
            heavy(res){
                return ['Copper','Iron','Steel','Titanium','Iridium','Neutronium','Adamantite'].includes(res) ? true : false;
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
            title: loc('city_bank'),
            desc(){
                return loc('city_bank_desc',[planetName().titan]);
            },
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
                return loc('plus_max_resource',[`\$${vault}`,global.resource.Money.name]);
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
            title: loc('interstellar_g_factory_title'),
            desc(){ return `<div>${loc('interstellar_g_factory_title')}</div><div class="has-text-special">${loc('space_support',[planetName().titan])}</div>`; },
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
        sam: {
            id: 'space-sam',
            title: loc('space_sam_title'),
            desc(){
                return `<div>${loc('space_sam_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { titan: 7 },
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
            title: loc('space_decoder_title'),
            desc(){
                return `<div>${loc('space_decoder_title')}</div><div class="has-text-special">${loc('requires_power_support_combo',[planetName().titan, global.resource.Cipher.name])}</div>`;
            },
            reqs: { titan: 8 },
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
            title: loc('space_ai_core'),
            desc(wiki){
                if (!global.space.hasOwnProperty('ai_core') || global.space.ai_core.count < 100 || wiki){
                    return `<div>${loc('space_ai_core')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>` + (global.space.hasOwnProperty('ai_core') && global.space.ai_core.count >= 100 ? `<div class="has-text-special">${loc('requires_power')}</div>` : ``);
                }
                else {
                    return `<div>${loc('space_ai_core')}</div>`;
                }
            },
            reqs: { titan: 9 },
            path: ['truepath'],
            condition(){
                return global.space.ai_core.count >= 100 ? false : true;
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
            title: loc('space_ai_core'),
            desc(){
                return `<div>${loc('space_ai_core')}</div><div class="has-text-special">${loc('space_electrolysis_req',[global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            reqs: { titan_ai_core: 1 },
            path: ['truepath'],
            condition(){
                return global.space.hasOwnProperty('ai_core') && global.space.ai_core.count >= 100 ? true : false;
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
            title: loc('space_ai_colonist_title'),
            desc(){
                return `<div>${loc('space_ai_colonist_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { titan_ai_core: 3 },
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
            nav(){ return global.tech['resettle'] ? false : true; }
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
            title: loc('space_water_freighter_title'),
            desc(){
                return `<div>${loc('space_water_freighter_title')}</div><div class="has-text-special">${loc('space_support',[planetName().enceladus])}</div>`;
            },
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
            title: loc('tech_zero_g_lab'),
            desc(){
                return `<div>${loc('tech_zero_g_lab')}</div><div class="has-text-special">${loc('requires_power_support',[planetName().enceladus])}</div>`;
            },
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
            title: loc('tech_operating_base'),
            desc(){
                return `<div>${loc('tech_operating_base')}</div><div class="has-text-special">${loc('requires_power_support',[planetName().enceladus])}</div>`;
            },
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
            title: loc('tech_munitions_depot'),
            desc: loc('tech_munitions_depot'),
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
            nav(){ return global.tech['resettle'] ? false : true; },
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
            title: loc('space_fob_title'),
            desc(){
                return `<div>${loc('tech_fob')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Helium_3.name])}</div>`;
            },
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
            title: loc('space_lander_title'),
            desc(){
                return `<div>${loc('space_lander_title')}</div><div class="has-text-special">${loc('requires_soldiers')}</div><div class="has-text-special">${loc('space_red_space_barracks_desc_req')}</div>`;
            },
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
            title: loc('space_crashed_ship_title'),
            desc(){
                return `<div>${loc('space_crashed_ship_title')}</div>`;
            },
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
    spc_kuiper: {
        info: {
            name(){
                return loc(`space_kuiper_title`);
            },
            desc(){
                return loc('space_kuiper_desc');
            },
            zone: 'outer',
            showDest(){
                return {r: global.settings.space.kuiper || global.tech?.resettle >= 3, l: global.settings.space.kuiper};
            },
            syndicate(){ if (global.tech['resettle']){ return false; } return global.tech['kuiper'] ? true : false; },
            syndicate_cap(){ return 2500; },
            nav(){ return global.tech['resettle'] ? false : true; }
        },
        kuiper_mission: {
            id: 'space-kuiper_mission',
            title(){
                return loc('space_mission_title',[loc(`space_kuiper_title`)]);
            },
            desc(){
                return loc('space_mission_desc',[loc(`space_kuiper_title`)]);
            },
            reqs: { outer: 7 },
            grant: ['kuiper',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.kuiper >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(1000000,false,wiki).toFixed(0); },
                Elerium(){ return 1000; }
            },
            effect(){
                return loc('space_kuiper_mission_effect');
            },
            action(){
                if (payCosts($(this)[0])){
                    initStruct(outerTruth.spc_kuiper.orichalcum_mine);
                    initStruct(outerTruth.spc_kuiper.uranium_mine);
                    initStruct(outerTruth.spc_kuiper.neutronium_mine);
                    global.space.syndicate['spc_kuiper'] = 500;
                    messageQueue(loc('space_kuiper_mission_action'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        orichalcum_mine: {
            id: 'space-orichalcum_mine',
            title(){ return loc('space_kuiper_mine',[global.resource.Orichalcum.name]); },
            desc(){
                return `<div>${loc('space_kuiper_mine',[global.resource.Orichalcum.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            reqs: { kuiper: 1 },
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
            title(){ return loc('space_kuiper_mine',[global.resource.Uranium.name]); },
            desc(){
                return `<div>${loc('space_kuiper_mine',[global.resource.Uranium.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            reqs: { kuiper: 1 },
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
            title(){ return loc('space_kuiper_mine',[global.resource.Neutronium.name]); },
            desc(){
                return `<div>${loc('space_kuiper_mine',[global.resource.Neutronium.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            reqs: { kuiper: 1 },
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
            title(){ return loc('space_kuiper_mine',[global.resource.Elerium.name]); },
            desc(){
                return `<div>${loc('space_kuiper_mine',[global.resource.Elerium.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            reqs: { kuiper: 2 },
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
            nav(){ return global.tech['resettle'] ? false : true; },
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
            title: loc('space_shock_trooper_title'),
            desc(){
                return `<div>${loc('space_shock_trooper_title')}</div><div class="has-text-special">${loc('space_support',[planetName().eris])}</div>`;
            },
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
            title: loc('space_tank_title'),
            desc(){
                return `<div>${loc('space_tank_title')}</div><div class="has-text-special">${loc('space_support',[planetName().eris])}</div>`;
            },
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
            title: loc('space_digsite_title'),
            desc(){
                return `<div>${loc('space_digsite_title')}</div>`;
            },
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
    }
};

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
            title: loc('tau_star_ringworld'),
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('ringworld') || global.tauceti.ringworld.count < 1000 || wiki){
                    return `<div>${loc('tau_star_ringworld')}</div><div class="has-text-special">${loc('requires_segments',[1000])}</div>`;
                }
                else {
                    return `<div>${loc('tau_star_ringworld')}</div>`;
                }
            },
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
            title: loc('tau_star_matrix'),
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
            title: loc('tau_star_blue_pill'),
            desc: loc('tau_star_blue_pill'),
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
            title: loc('tau_star_goe_facility'),
            desc(){ return `<div>${loc('tau_star_goe_facility')}</div>`; },
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
                    let shipId = global.space.shipyard.ships.findIndex(x => x.location === 'tauceti' && x.class === 'explorer');
                    if (shipId !== -1){
                        explorer = global.space.shipyard.ships[shipId].name;
                    }
                }
                return loc('tau_home_dismantle_effect',[explorer]);
            },
            action(){
                let shipId = -1;
                if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                    shipId = global.space.shipyard.ships.findIndex(x => x.location === 'tauceti' && x.class === 'explorer');
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
            title: loc('tau_home_orbital_station'),
            desc: `<div>${loc('tau_home_orbital_station')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
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
            title: loc('tau_home_colony'),
            desc(){
                return `<div>${loc('tau_home_colony_desc',[races[global.race.species].home])}</div><div class="has-text-special">${loc('requires_power_support_combo',[races[global.race.species].home,global.resource.Food.name])}</div>`;
            },
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
            title: loc('tau_home_pylon'),
            desc: loc('tau_home_pylon'),
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
            title: loc('tau_home_cloning'),
            desc(){ return loc('tau_home_cloning_desc',[races[global.race.species].name]); },
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
            title: loc('tau_home_tau_farm'),
            desc(){
                return `<div>${loc('tau_home_tau_farm')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
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
            title: loc('tau_home_mining_pit'),
            desc(){
                return `<div>${loc('tau_home_mining_pit')}</div><div class="has-text-special">${loc('space_support',[races[global.race.species].home])}</div>`;
            },
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
            title: loc('tau_home_excavate'),
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
            title: loc('tech_alien_outpost'),
            desc(){
                return `<div>${loc('tech_alien_outpost')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
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
            title: loc('tech_fusion_generator'),
            desc(){
                return `<div>${loc('tech_fusion_generator')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Helium_3.name])}</div>`;
            },
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
            title: loc('tech_repository'),
            desc: loc('tech_repository'),
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
            title: loc('tau_home_tau_factory'),
            desc(){
                return `<div>${loc('tau_home_tau_factory')}</div><div class="has-text-special">${loc('requires_power_support',[races[global.race.species].home])}</div>`;
            },
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
                        global.city.factory.Alloy += $(this)[0].manufacturing();
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
            title: loc('city_casino'),
            desc: loc('city_casino'),
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
            title: loc('tech_cultural_center'),
            desc(){
                return `<div>${loc('tech_cultural_center')}</div><div class="has-text-special">${loc('space_electrolysis_req',[global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
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
                    modifier = 2;
                }
                else if (global.civic.govern.type === 'socialist'){
                    modifier = 0.8;
                }

                let cas = 20 * modifier;
                let mon = 5 * modifier;
                let bake = 15 * modifier;

                let desc = `<div class="has-text-caution">${loc('tau_home_cultureal_effect1',[$(this)[0].p_fuel().a,global.resource[$(this)[0].p_fuel().r].name,$(this)[0].title])}</div>`;
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
            title: loc('tau_home_marine_barracks'),
            desc(){ return `<div>${loc('tau_home_marine_barracks')}</div><div class="has-text-special">${loc('space_support',[loc('tau_planet',[races[global.race.species].home])])}</div>`; },
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
            title: loc('tau_red_orbital_platform'),
            desc: `<div>${loc('tau_red_orbital_platform')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
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
                let sup = global.tech['womling_logistics'] ? 2.5 : 2;
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
            title: loc('tau_red_womling_village'),
            desc(){ return `<div>${loc('tau_red_womling_village')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            reqs: { tau_red: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_village', offset, 10000000, 1.28, 'tauceti'); },
                Stone(offset){ return spaceCostMultiplier('womling_village', offset, 2250000, 1.28, 'tauceti'); },
                Plywood(offset){ return spaceCostMultiplier('womling_village', offset, wom_recycle(1250000), 1.28, 'tauceti'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('womling_village', offset, wom_recycle(400000), 1.28, 'tauceti'); },
            },
            effect(){
                let pop = global.tech['womling_pop'] && global.tech.womling_pop >= 2 ? 6 : 5;
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
            title: loc('tau_red_womling_farm'),
            desc(){ return `<div>${loc('tau_red_womling_farm')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            reqs: { tau_red: 5 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('womling_farm', offset, 24000000, 1.28, 'tauceti'); },
                Iron(offset){ return spaceCostMultiplier('womling_farm', offset, 9500000, 1.28, 'tauceti'); },
                Water(offset){ return spaceCostMultiplier('womling_farm', offset, 5000, 1.28, 'tauceti'); },
            },
            effect(){
                let food = global.tech['womling_pop'] ? 16 : 12;
                if (global.tech['womling_gene']){ food += 4; }
                let farmers = global.tauceti.hasOwnProperty('womling_farm') ? global.tauceti.womling_farm.farmers : 0;
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[$(this)[0].support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_farm_effect',[food])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_employ',[2])}</div>`;
                if (global.tech['isolation']){
                    desc = desc + `<div>${loc('tau_red_womling_generate',[global.resource.Furs.name])}</div>`;
                }
                desc = desc + `<div>${loc('tau_red_womling_farm_effect2',[food / 2 * farmers])}</div>`;
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
            title: loc('tau_red_womling_mine'),
            desc(){ return `<div>${loc('tau_red_womling_mine')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
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
            title: loc('interstellar_laboratory_title'),
            desc(){ return `<div>${loc('interstellar_laboratory_title')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
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
            title: loc('tech_antimatter_reactor'),
            desc(){
                return `<div>${loc('tech_antimatter_reactor')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Helium_3.name])}</div>`;
            },
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
            title: loc('tau_red_womling_rangers'),
            desc(){ return `<div>${loc('tau_red_womling_rangers')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
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
                            // Graphene allocation is stored on the Titan graphene factory even after isolation
                            if (global.race['kindling_kindred'] || global.race['smoldering']){
                                global.space.g_factory.Oil++;
                            }
                            else {
                                global.space.g_factory.Lumber++;
                            }
                        }
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
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
            title: loc('tau_roid_patrol_ship'),
            desc(){ return `<div>${loc('tau_roid_patrol_ship')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Helium_3.name])}</div>`; },
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
            title: loc('tau_roid_whaling_ship'),
            desc(){ return `<div>${loc('tau_roid_whaling_ship')}</div>`; },
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
            title: loc('tau_roid_synthesizer_title'),
            desc(){
                return `<div>${loc('tau_roid_synthesizer_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
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
            title: loc('tau_gas2_alien_station'),
            desc: loc('tau_gas2_alien_station'),
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
            title: loc('tau_gas2_alien_station'),
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('alien_station') || global.tauceti.alien_station.count < 100 || wiki){
                    return `<div>${loc('tau_gas2_alien_station')}</div>` + (global.tauceti.hasOwnProperty('alien_station') && global.tauceti.alien_station.count >= 100 ? `<div class="has-text-special">${loc('space_dwarf_reactor_desc_req')}</div>` : `<div class="has-text-special">${loc('tau_gas2_alien_station_repair')}</div>`);
                }
                else {
                    return `<div>${loc('tau_gas2_alien_station')}</div>`;
                }
            },
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
            title: loc('tau_gas2_alien_station'),
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
            title: loc('tech_matrioshka_brain'),
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('matrioshka_brain') || global.tauceti.matrioshka_brain.count < 1000 || wiki){
                    return `<div>${loc('tech_matrioshka_brain')}</div><div class="has-text-special">${loc('requires_segments',[1000])}</div>`;
                }
                else {
                    return `<div>${loc('tech_matrioshka_brain')}</div>`;
                }
            },
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
            aura(){ return global.tech['m_ignite'] && global.tech.m_ignite >= 2 ? 'fire' : false; },
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
            title: loc('tech_ignition_device'),
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('ignition_device') || global.tauceti.ignition_device.count < 10 || wiki){
                    return `<div>${loc('tech_ignition_device')}</div><div class="has-text-special">${loc('requires_segments',[10])}</div>`;
                }
                else {
                    return `<div>${loc('tech_ignition_device')}</div>`;
                }
            },
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
            title: loc('tau_shipyard_title'),
            desc(){
                return `<div>${loc('tau_shipyard_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
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
            title: loc('space_dwarf_mass_relay_title'),
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('mass_relay') || global.tauceti.mass_relay.count < 100 || wiki){
                    return `<div>${loc('space_dwarf_mass_relay_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
            },
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
            title: loc('space_dwarf_mass_relay_title'),
            desc(){
                return `<div>${loc('space_dwarf_mass_relay_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
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

            if (tauCetiModules[region].info['support']){
                let support = tauCetiModules[region].info['support'];
                if (tauCetiModules[region].info['hide_support']){
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3>${property}</div></div>`);
                }
                else {
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3> <span v-show="s_max">{{ support }}/{{ s_max }}</span>${property}</div></div>`);
                }
                vBind({
                    el: `#sr${region}`,
                    data: global.tauceti[support],
                    methods: {
                        filter(){
                            return tauCetiModules[region].info.filter(...arguments);
                        }
                    }
                });
            }
            else {
                parent.append(`<div id="${region}" class="space"><div><h3 class="name has-text-warning">${name}</h3>${property}</div></div>`);
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
            weapon: ['railgun','laser','p_laser','plasma','phaser','disruptor'],
            armor : ['steel','alloy','neutronium'],
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

        plans.append(assemble);
        assemble.append(`<div><span>${loc(`outer_shipyard_park`,[global.tech['resettle'] ? tauCetiModules.tau_gas2.info.name() : planetName().dwarf])}</span><a href="#" class="solarMap" @click="trigModal">${loc(`outer_shipyard_map`)}</span></a>`);

        updateCosts();

        vBind({
            el: '#shipPlans',
            data: {
                b: global.space.shipyard.blueprint,
                s: global.space.shipyard
            },
            methods: {
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

export function buildTPShipQueue(action){
    if (payCosts(false, action.cost)){
        buildTPShip(deepClone(action.bp,true));
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

function buildTPShip(ship, queue){
    ship['location'] = global.tech['resettle'] ? 'tau_gas2' : 'spc_dwarf';
    ship['xy'] = genXYcoord(global.tech['resettle'] ? 'tau_gas2' : 'spc_dwarf');
    ship['origin'] = deepClone(ship['xy']);
    ship['destination'] = deepClone(ship['xy']);
    ship['transit'] = 0;
    ship['dist'] = 0;
    ship['damage'] = 0;
    ship['fueled'] = false;

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
        case 'disruptor':
            watts -= Math.round(100 * use_inflate);
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
    }

    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship){
        rating = Math.round(rating * 1.25);
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

    let boost = 1;
    switch (ship.location){
        case 'spc_dwarf':
            boost = p_on['m_relay'] && ship.transit === 0 && global.space['m_relay'] && global.space.m_relay.charged >= 10000 ? 3 : 1;
            break;
        case 'tau_gas2':
            boost = p_on['tcm_relay'] && ship.transit === 0 && global.tauceti['tcm_relay'] && global.tauceti.tcm_relay.charged >= 10000 ? 3 : 1;
            break;
        default:
            boost = 1;
            break;
    }
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
        spc_kuiper: 10,
        spc_eris: 11,
        tauceti: 12,
        tau_home: 13,
        tau_red: 14,
        tau_gas: 15,
        tau_gas2: 16,
        tau_roid: 17,
        spc_sun_gate: 18,
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

function shipyardShipCompare(a,b){
    return (
        (shipyardRanks.location[a.location] ?? 0) - (shipyardRanks.location[b.location] ?? 0)
        || a.transit - b.transit
        || (shipyardRanks.class[a.class] ?? 0) - (shipyardRanks.class[b.class] ?? 0)
        || (shipyardRanks.engine[a.engine] ?? 0) - (shipyardRanks.engine[b.engine] ?? 0)
        || (shipyardRanks.power[a.power] ?? 0) - (shipyardRanks.power[b.power] ?? 0)
    );
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

    if (global.space.shipyard.sort){
        global.space.shipyard.ships = global.space.shipyard.ships.sort(shipyardShipCompare);
    }


    const spaceRegions = spaceTech();
    let regionNames = {};
    Object.keys(spaceRegions).forEach(function(region){
        if (spaceRegions[region].info.nav()){
            let name = typeof spaceRegions[region].info.name === 'string' ? spaceRegions[region].info.name : spaceRegions[region].info.name();
            regionNames[region] = name;
        }
    });
    Object.keys(tauCetiModules).forEach(function(region){
        if (tauCetiModules[region].info.nav()){
            let name = typeof tauCetiModules[region].info.name === 'string' ? tauCetiModules[region].info.name : tauCetiModules[region].info.name();
            regionNames[region] = name;
        }
    });
    regionNames['tauceti'] = loc('tech_era_tauceti');

    for (let i=0; i<global.space.shipyard.ships.length; i++){
        let ship = global.space.shipyard.ships[i];
        if (!ship['xy']){ ship['xy'] = genXYcoord(ship.location); }
        if (!ship.hasOwnProperty('dist')){ ship['dist'] = ship['transit']; }
        if (!ship.hasOwnProperty('origin')){ ship['origin'] = ship['xy']; }
        if (!ship.hasOwnProperty('destination')){ ship['destination'] = genXYcoord(ship.location); }

        let dispatch = `<button id="ship${i}loc" class="button is-info" @click="pickDest(${i})">
            <span>${regionNames[ship.location]}</span>
        </button>`;

        if (global.space.shipyard.expand){
            let ship_class = `${loc(`outer_shipyard_engine_${ship.engine}`)} ${loc(`outer_shipyard_class_${ship.class}`)}`;
            let desc = $(`<div id="shipReg${i}" class="shipRow ship${i}"></div>`);
            let row1 = $(`<div class="row1"><span class="name has-text-caution">${ship.name}</span> <span v-show="scrapAllowed(${i})">| </span><a class="scrap${i}" v-show="scrapAllowed(${i})" @click="scrap(${i})" role="button">${loc(`outer_shipyard_scrap`)}</a> | <span class="has-text-warning">${ship_class}</span> | <span class="has-text-danger">${loc(`outer_shipyard_weapon_${ship.weapon}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_power_${ship.power}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_armor_${ship.armor}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_sensor_${ship.sensor}`)}</span></div>`);
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
                    if (global.space.shipyard.ships[id] && ['spc_dwarf','tau_gas2'].includes(global.space.shipyard.ships[id].location)){
                        global.space.shipyard.ships.splice(id,1);
                        drawShips();
                        updateCosts();
                    }
                },
                scrapAllowed(id){
                    if (global.space.shipyard.ships[id] && ['spc_dwarf','tau_gas2'].includes(global.space.shipyard.ships[id].location)){
                        return true;
                    }
                    return false;
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
                crewText(id){
                    return shipCrewSize(global.space.shipyard.ships[id]);
                },
                fireText(id){
                    return shipAttackPower(global.space.shipyard.ships[id]);
                },
                sensorText(id){
                    return sensorRange(global.space.shipyard.ships[id]) + 'km';
                },
                speedText(id){
                    let speed = (149597870.7/225/24/3600) * shipSpeed(global.space.shipyard.ships[id]);
                    return Math.round(speed) + 'km/s';
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
                    let name = ship.class === 'explorer' ? loc('tech_era_tauceti') : regionNames[global.space.shipyard.ships[id].location];
                    return loc(`outer_shipyard_arrive`,[
                        name,
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

function calcLandingPoint(ship, planet) {
    if (spacePlanetStats[planet].startype) { return genXYcoord(planet); }
    // Tau Ceti bodies orbit their star, which sits far from the home-system origin.
    // Mirror genXYcoord so the orbit center and eccentricity match the body's actual
    // rendered position; otherwise a ship already in Tau Ceti has its landing point
    // computed back near the home sun, producing a bogus multi-star transit distance.
    let star = spacePlanetStats[planet].star ? genXYcoord(spacePlanetStats[planet].star) : { x: 0, y: 0, z: 0 };
    let ecc = spacePlanetStats[planet].star ? 1.2 : xPosition(1, planet);
    let center_x = star.x + xShift(planet);
    let center_y = star.y;
    // Inclination tilts the orbit about its centre, so a body's distance from that centre is
    // unchanged and the crossing-window arithmetic below still holds in three dimensions.
    let ship_dist = dist3(ship.xy, { x: center_x, y: center_y, z: star.z });
    let ship_speed = shipSpeed(ship) / 225;
    let cross1_dist = Math.abs(ship_dist - spacePlanetStats[planet].dist);
    let cross2_dist = Math.abs(ship_dist + spacePlanetStats[planet].dist);
    let cross1w_dist = Math.abs(ship_dist - spacePlanetStats[planet].dist * ecc);
    let cross2w_dist = Math.abs(ship_dist + spacePlanetStats[planet].dist * ecc);
    let cross1_days = Math.floor(Math.min(cross1_dist, cross1w_dist, cross2_dist, cross2w_dist) / ship_speed);
    let cross2_days = Math.ceil(Math.max(cross1_dist, cross1w_dist, cross2_dist, cross2w_dist) / ship_speed);
    if (ship_dist >= spacePlanetStats[planet].dist && ship_dist <= spacePlanetStats[planet].dist * ecc) {
        cross1_days = 0;
    }
    let planet_orbit = spacePlanetStats[planet].orbit === -1
      ? orbitLength()
      : spacePlanetStats[planet].orbit;
    let planet_speed = 360 / planet_orbit;
    let planet_degree = (global.space.position[planet] + (cross1_days * planet_speed)) % 360;
    for (let i = cross1_days; i <= cross2_days; i++) {
        // orbitPoint rather than open-coded trig, so the landing point is on the same 3D orbit the
        // body travels and the map draws.
        let pt = orbitPoint(planet, planet_degree);
        if (dist3(ship.xy, pt) / ship_speed <= i) {
            return pt;
        }
        planet_degree = (planet_degree + planet_speed) % 360;
    }
    return genXYcoord(planet);
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
            case 'spc_kuiper':
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
                if (ship.location === region && ship.transit === 0 && ship.fueled){
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
    spc_sun_gate: { dist: 0.3, orbit: 53, size: 0.1, belt: true, gate: true, inc: 0 },
    spc_home: { dist: 1, orbit: -1, size: 0.6, hz: true, inc: 0 },
    spc_moon: { dist: 1.01, orbit: -1, size: 0.1, moon: true, inc: 0 },
    spc_red: { dist: 1.524, orbit: 687, size: 0.5, hz: true, inc: 1.85 },
    spc_hell: { dist: 0.4, orbit: 88, size: 0.4, inc: 7 },
    spc_venus: { dist: 0.7, orbit: 225, size: 0.5, inc: 3.4 },
    spc_gas: { dist: 5.203, orbit: 4330, size: 1.3, inc: 1.3 },
    spc_gas_moon: { dist: 5.204, orbit: 4330, size: 0.2, moon: true, inc: 1.3 },
    spc_belt: { dist: 2.7, orbit: 1642, size: 0.5, belt: true, inc: 10 },
    spc_dwarf: { dist: 2.77, orbit: 1682, size: 0.5, inc: 10.6 },
    spc_saturn: { dist: 9.539, orbit: 10751, size: 1.15, inc: 2.5 },
    spc_titan: { dist: 9.536, orbit: 10751, size: 0.2, moon: true, inc: 2.5 },
    spc_enceladus: { dist: 9.542, orbit: 10751, size: 0.1, moon: true, inc: 2.5 },
    spc_uranus: { dist: 19.8, orbit: 30660, size: 1, inc: 0.77 },
    spc_neptune: { dist: 30.08, orbit: 60152, size: 1, inc: 1.77 },
    spc_triton: { dist: 30.1, orbit: 60152, size: 0.1, moon: true, inc: 1.77 },
    spc_kuiper: { dist: 39.5, orbit: 90498, size: 0.5, belt: true, inc: 10 },
    spc_eris: { dist: 68, orbit: 204060, size: 0.5, inc: 44 },
    // Tau Ceti system. Planets orbit the tauceti star (star: 'tauceti') rather than the Sun,
    // Tau Ceti (G-type): 753,314.5 AU from the Sun (11.91 ly).
    tauceti: { x: -213157.815, y: 25792.379, z: -722067.292, dist: 753314.5, orbit: -2, size: 2, startype: 'G', label: loc('star_tauceti'), zlabel: loc('star_tauceti') },
    tau_home: { dist: 0.5, orbit: 129, size: 0.6, star: 'tauceti', unlock: 'tau_home', hz: true, inc: 0 },
    tau_red: { dist: 1.24, orbit: 504, size: 0.5, star: 'tauceti', unlock: 'tau_red', hz: true, inc: 2.2 },
    tau_gas: { dist: 5.6, orbit: 4839, size: 1.25, star: 'tauceti', unlock: 'tau_gas', inc: 1.5 },
    tau_gas2: { dist: 8.2, orbit: 8576, size: 1.1, star: 'tauceti', unlock: 'tau_gas2', inc: 2.8 },
    tau_roid: { dist: 15, orbit: 21217, size: 0.5, star: 'tauceti', belt: true, unlock: 'tau_roid', inc: 9 },
    // Epsilon Eridani (K-type): 664,133.6 AU from the Sun (10.50 ly).
    eridani: { x: -427082.379, y: -121211.607, z: -493945.105, dist: 664133.6, orbit: -2, size: 1.9, startype: 'K', label: loc('star_eridani'), zlabel: loc('star_eridani') },
    // eridani planets (K-type, 3, habitable-zone planet at ~0.5 AU)
    eridani_p1: { dist: 0.27, orbit: 61, size: 0.46, star: 'eridani' },
    eridani_p2: { dist: 0.35, orbit: 90, size: 0.4, star: 'eridani' },
    eridani_p3: { dist: 0.5, orbit: 154, size: 0.52, star: 'eridani', hz: true },
    // Gliese 65 (M-type): 560,941.3 AU from the Sun (8.87 ly).
    // The map carried only BL Cet; UV Cet joins it below, so this is component A now.
    gliese65: { x: -138124.928, y: 10901.934, z: -543560.337, dist: 560941.3, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese65'), zlabel: loc('star_gliese65') + ' A' },
    // gliese65 planets (M-type, 3, one in the habitable zone)
    gliese65_p1: { dist: 0.18, orbit: 51, size: 0.35, star: 'gliese65', hz: true },
    gliese65_p2: { dist: 0.62, orbit: 326, size: 0.31, star: 'gliese65' },
    // YZ Ceti (M-type): 766,620.4 AU from the Sun (12.12 ly).
    yzceti: { x: -129026.649, y: 75381.207, z: -751915.278, dist: 766620.4, orbit: -2, size: 1, startype: 'M', label: loc('star_yzceti'), zlabel: loc('star_yzceti') },
    // yzceti planets (M-type, 3, none habitable)
    yzceti_p1: { dist: 0.38, orbit: 156, size: 0.46, star: 'yzceti' },
    yzceti_p2: { dist: 0.7, orbit: 391, size: 0.21, star: 'yzceti' },
    yzceti_p3: { dist: 1.12, orbit: 790, size: 0.31, star: 'yzceti' },
    // Alpha Centauri A (G-type): 277,940 AU from the Sun (4.39 ly).
    alphacentauri: { x: 199021.346, y: -193985.2, z: -3296.913, dist: 277940, orbit: -2, size: 2, startype: 'G', label: loc('star_alpha_centauri'), zlabel: loc('star_alpha_centauri') + ' A' },
    // alphacentauri planets (G-type, 3, habitable-zone planet at ~1 AU)
    alphacentauri_p1: { dist: 1, orbit: 365, size: 0.61, star: 'alphacentauri', hz: true },
    alphacentauri_p2: { dist: 1.6, orbit: 739, size: 0.66, star: 'alphacentauri' },
    alphacentauri_p3: { dist: 2.8, orbit: 1711, size: 1.18, star: 'alphacentauri' },
    // Alpha Centauri B (K-type): companion, 22.2 AU from Alpha Centauri A.
    alphacentaurib: { x: 199007.422, y: -193999.315, z: -3306.891, dist: 277940, orbit: -2, size: 1.5, startype: 'K', zlabel: loc('star_alpha_centauri') + ' B' },
    // alphacentaurib planets (K-type, 4, habitable-zone planet at ~0.5 AU)
    alphacentaurib_p1: { dist: 0.35, orbit: 90, size: 0.39, star: 'alphacentaurib' },
    alphacentaurib_p2: { dist: 0.5, orbit: 154, size: 0.51, star: 'alphacentaurib', hz: true },
    alphacentaurib_p3: { dist: 0.8, orbit: 312, size: 0.68, star: 'alphacentaurib' },
    alphacentaurib_p4: { dist: 1.4, orbit: 723, size: 1.12, star: 'alphacentaurib' },
    // Proxima Centauri (M-type): companion, 14,024.7 AU from Alpha Centauri A.
    proximacentauri: { x: 186242.736, y: -193265.541, z: -9031.026, dist: 268550.7, orbit: -2, size: 1, startype: 'M', zlabel: loc('star_proxima_centauri') },
    // proximacentauri planets (M-type, 1, none habitable)
    proximacentauri_p1: { dist: 0.35, orbit: 138, size: 0.29, star: 'proximacentauri' },
    // Barnard's Star (M-type): 377,100.4 AU from the Sun (5.96 ly).
    barnardsstar: { x: 313522.226, y: 188447.979, z: 91628.876, dist: 377100.4, orbit: -2, size: 1, startype: 'M', label: loc('star_barnards_star'), zlabel: loc('star_barnards_star') },
    // barnardsstar planets (M-type, 3, one in the habitable zone)
    barnardsstar_p1: { dist: 0.24, orbit: 78, size: 0.31, star: 'barnardsstar', hz: true },
    barnardsstar_p2: { dist: 0.45, orbit: 201, size: 0.31, star: 'barnardsstar' },
    barnardsstar_p3: { dist: 0.86, orbit: 532, size: 0.22, star: 'barnardsstar' },
    // Sirius A (A-type): 543,932.9 AU from the Sun (8.60 ly).
    sirius: { x: -364922.001, y: -394498.07, z: -84060.919, dist: 543932.9, orbit: -2, size: 3, startype: 'A', label: loc('star_sirius'), zlabel: loc('star_sirius') + ' A' },
    // sirius planets (A-type, 5, habitable-zone planet at ~4.5 AU)
    sirius_p1: { dist: 3.15, orbit: 1444, size: 0.34, star: 'sirius' },
    sirius_p2: { dist: 4.5, orbit: 2465, size: 0.62, star: 'sirius', hz: true },
    sirius_p3: { dist: 7.2, orbit: 4990, size: 0.68, star: 'sirius' },
    // Sirius B (D-type): companion, 16.3 AU from Sirius A.
    siriusb: { x: -364913.661, y: -394507.91, z: -84050.947, dist: 543932.9, orbit: -2, size: 1.2, startype: 'D', zlabel: loc('star_sirius') + ' B' },
    // siriusb planets (D-type, 1, none habitable). Kept at 0.8 AU — comfortably inside the 16.3 AU
    // to Sirius A, so it stays a plausible circumstellar orbit rather than crossing the companion.
    // A white dwarf's habitable zone sits hundredths of an AU out, far inside this, so it is cold.
    // Period from the same Kepler relation as the other systems, on Sirius B's ~1.02 solar masses.
    siriusb_p1: { dist: 0.8, orbit: 259, size: 0.42, star: 'siriusb' },
    // Procyon A (F-type): 724,855.2 AU from the Sun (11.46 ly).
    procyon: { x: -587528.977, y: -391866.327, z: 163296.042, dist: 724855.2, orbit: -2, size: 2.5, startype: 'F', label: loc('star_procyon'), zlabel: loc('star_procyon') + ' A' },
    // procyon planets (F-type, 5, habitable-zone planet at ~1.9 AU)
    procyon_p1: { dist: 1.33, orbit: 491, size: 0.41, star: 'procyon' },
    procyon_p2: { dist: 1.9, orbit: 839, size: 0.5, star: 'procyon', hz: true },
    procyon_p3: { dist: 3.04, orbit: 1698, size: 0.8, star: 'procyon' },
    procyon_p4: { dist: 5.32, orbit: 3931, size: 1.3, star: 'procyon' },
    procyon_p5: { dist: 9.5, orbit: 9380, size: 1.18, star: 'procyon' },
    // Procyon B (D-type): companion, 16.8 AU from Procyon A.
    procyonb: { x: -587529.648, y: -391871.902, z: 163280.248, dist: 724855.2, orbit: -2, size: 1, startype: 'D', zlabel: loc('star_procyon') + ' B' },
    // Wolf 359 (M-type): 496,808.9 AU from the Sun (7.86 ly).
    wolf359: { x: -121170.806, y: -249036.778, z: 412452.866, dist: 496808.9, orbit: -2, size: 1, startype: 'M', label: loc('star_wolf359'), zlabel: loc('star_wolf359') },
    // wolf359 planets (M-type, 1, one in the habitable zone)
    wolf359_p1: { dist: 0.22, orbit: 69, size: 0.48, star: 'wolf359', hz: true },
    // Ross 128 (M-type): 696,122.6 AU from the Sun (11.01 ly).
    ross128: { x: 905.425, y: -352688.658, z: 600163.744, dist: 696122.6, orbit: -2, size: 1, startype: 'M', label: loc('star_ross128'), zlabel: loc('star_ross128') },
    // ross128 planets (M-type, 2, none habitable)
    ross128_p1: { dist: 0.4, orbit: 169, size: 0.35, star: 'ross128' },
    ross128_p2: { dist: 0.76, orbit: 442, size: 0.21, star: 'ross128' },
    // 61 Cygni A (K-type): 721,218.5 AU from the Sun (11.40 ly).
    cygni: { x: 95890.548, y: 711066.78, z: -73110.388, dist: 721218.5, orbit: -2, size: 1.9, startype: 'K', label: loc('star_61cygni'), zlabel: loc('star_61cygni') + ' A' },
    // cygni planets (K-type, 2, habitable-zone planet at ~0.5 AU)
    cygni_p1: { dist: 0.5, orbit: 154, size: 0.46, star: 'cygni', hz: true },
    cygni_p2: { dist: 0.8, orbit: 312, size: 0.81, star: 'cygni' },
    // 61 Cygni B (K-type): companion, 107.5 AU from 61 Cygni A.
    cygnib: { x: 95921.541, y: 711052.121, z: -73212.235, dist: 721218.5, orbit: -2, size: 1.75, startype: 'K', zlabel: loc('star_61cygni') + ' B' },
    // cygnib planets (K-type, 4, habitable-zone planet at ~0.5 AU)
    cygnib_p1: { dist: 0.25, orbit: 55, size: 0.35, star: 'cygnib' },
    cygnib_p2: { dist: 0.35, orbit: 90, size: 0.5, star: 'cygnib' },
    cygnib_p3: { dist: 0.5, orbit: 154, size: 0.61, star: 'cygnib', hz: true },
    cygnib_p4: { dist: 0.8, orbit: 312, size: 0.65, star: 'cygnib' },
    // Sigma Draconis (K-type): 1,188,887.9 AU from the Sun (18.80 ly).
    sigmadraconis: { x: -216244.617, y: 1081871.754, z: 442996.974, dist: 1188887.9, orbit: -2, size: 1.9, startype: 'K', label: loc('star_sigma_draconis'), zlabel: loc('star_sigma_draconis') },
    // sigmadraconis planets (K-type, 2, habitable-zone planet at ~0.5 AU)
    sigmadraconis_p1: { dist: 0.35, orbit: 90, size: 0.51, star: 'sigmadraconis' },
    sigmadraconis_p2: { dist: 0.5, orbit: 154, size: 0.53, star: 'sigmadraconis', hz: true },
    // Altair (A-type): 1,058,039.5 AU from the Sun (16.73 ly).
    altair: { x: 702887.087, y: 773658.946, z: -163857.331, dist: 1058039.5, orbit: -2, size: 2.5, startype: 'A', label: loc('star_altair'), zlabel: loc('star_altair') },
    // altair planets (A-type, 5, habitable-zone planet at ~4.5 AU)
    altair_p1: { dist: 3.15, orbit: 1444, size: 0.54, star: 'altair' },
    altair_p2: { dist: 4.5, orbit: 2465, size: 0.63, star: 'altair', hz: true },
    altair_p3: { dist: 7.2, orbit: 4990, size: 0.77, star: 'altair' },
    altair_p4: { dist: 12.6, orbit: 11551, size: 1.04, star: 'altair' },
    altair_p5: { dist: 22.5, orbit: 27564, size: 1.19, star: 'altair' },
    // Kapteyn's Star (M-type): 811,431.7 AU from the Sun (12.83 ly).
    kapteynsstar: { x: -218783.221, y: -618913.395, z: -476971.217, dist: 811431.7, orbit: -2, size: 1, startype: 'M', label: loc('star_kapteyns_star'), zlabel: loc('star_kapteyns_star') },
    // kapteynsstar planets (M-type, 1, one in the habitable zone)
    kapteynsstar_p1: { dist: 0.2, orbit: 60, size: 0.23, star: 'kapteynsstar', hz: true },
    // Teegarden's Star (M-type): 790,321.7 AU from the Sun (12.50 ly).
    teegardensstar: { x: -593895.814, y: 213075.04, z: -475915.162, dist: 790321.7, orbit: -2, size: 1, startype: 'M', label: loc('star_teegardens_star'), zlabel: loc('star_teegardens_star') },
    // teegardensstar planets (M-type, 1, one in the habitable zone)
    teegardensstar_p1: { dist: 0.23, orbit: 74, size: 0.43, star: 'teegardensstar', hz: true },
    // TZ Arietis (M-type): 921,927.6 AU from the Sun (14.58 ly).
    tzarietis: { x: -536255.491, y: 339547.226, z: -668646.616, dist: 921927.6, orbit: -2, size: 1, startype: 'M', label: loc('star_tz_arietis'), zlabel: loc('star_tz_arietis') },
    // tzarietis planets (M-type, 1, none habitable — the real TZ Arietis b orbits far inside the zone)
    tzarietis_p1: { dist: 0.29, orbit: 104, size: 0.38, star: 'tzarietis' },
    // Eta Cassiopeiae A (G-type): 1,221,714.9 AU from the Sun (19.32 ly).
    etacassiopeiae: { x: -656022.661, y: 1025003.755, z: -107651.061, dist: 1221714.9, orbit: -2, size: 2, startype: 'G', label: loc('star_eta_cassiopeiae'), zlabel: loc('star_eta_cassiopeiae') + ' A' },
    // etacassiopeiae planets (G-type, 4, habitable-zone planet at ~1 AU)
    etacassiopeiae_p1: { dist: 0.7, orbit: 214, size: 0.37, star: 'etacassiopeiae' },
    etacassiopeiae_p2: { dist: 1, orbit: 365, size: 0.55, star: 'etacassiopeiae', hz: true },
    etacassiopeiae_p3: { dist: 1.6, orbit: 739, size: 0.83, star: 'etacassiopeiae' },
    etacassiopeiae_p4: { dist: 2.8, orbit: 1711, size: 1.18, star: 'etacassiopeiae' },
    // Eta Cassiopeiae B (K-type): companion, 76.9 AU from Eta Cassiopeiae A.
    etacassiopeiaeb: { x: -655981.85, y: 1025035.83, z: -107594.324, dist: 1221714.9, orbit: -2, size: 1.5, startype: 'K', zlabel: loc('star_eta_cassiopeiae') + ' B' },
    // etacassiopeiaeb planets (K-type, 4, habitable-zone planet at ~0.5 AU)
    etacassiopeiaeb_p1: { dist: 0.5, orbit: 154, size: 0.52, star: 'etacassiopeiaeb', hz: true },
    etacassiopeiaeb_p2: { dist: 0.8, orbit: 312, size: 0.85, star: 'etacassiopeiaeb' },
    etacassiopeiaeb_p3: { dist: 1.4, orbit: 723, size: 1.05, star: 'etacassiopeiaeb' },
    etacassiopeiaeb_p4: { dist: 2.5, orbit: 1726, size: 1.1, star: 'etacassiopeiaeb' },
    // 70 Ophiuchi A (K-type): 1,054,699.3 AU from the Sun (16.68 ly).
    ophiuchi: { x: 896439.745, y: 515338.608, z: 207876.371, dist: 1054699.3, orbit: -2, size: 2, startype: 'K', label: loc('star_70_ophiuchi'), zlabel: loc('star_70_ophiuchi') + ' A' },
    // ophiuchi planets (K-type, 2, habitable-zone planet at ~0.5 AU)
    ophiuchi_p1: { dist: 0.35, orbit: 90, size: 0.45, star: 'ophiuchi' },
    ophiuchi_p2: { dist: 0.5, orbit: 154, size: 0.46, star: 'ophiuchi', hz: true },
    // 70 Ophiuchi B (K-type): companion, 27.5 AU from 70 Ophiuchi A.
    ophiuchib: { x: 896450.012, y: 515330.517, z: 207852.148, dist: 1054699.3, orbit: -2, size: 1.5, startype: 'K', zlabel: loc('star_70_ophiuchi') + ' B' },
    // ophiuchib planets (K-type, 4, habitable-zone planet at ~0.5 AU)
    ophiuchib_p1: { dist: 0.5, orbit: 154, size: 0.57, star: 'ophiuchib', hz: true },
    ophiuchib_p2: { dist: 0.8, orbit: 312, size: 0.81, star: 'ophiuchib' },
    ophiuchib_p3: { dist: 1.4, orbit: 723, size: 1.16, star: 'ophiuchib' },
    ophiuchib_p4: { dist: 2.5, orbit: 1726, size: 1.27, star: 'ophiuchib' },
    // DX Cancri (M-type): 738,639.6 AU from the Sun (11.68 ly).
    dxcancri: { x: -596219.327, y: -182448.568, z: 396009.416, dist: 738639.6, orbit: -2, size: 1, startype: 'M', label: loc('star_dx_cancri'), zlabel: loc('star_dx_cancri') },
    // dxcancri planets (M-type, 1, none habitable)
    dxcancri_p1: { dist: 0.36, orbit: 144, size: 0.31, star: 'dxcancri' },
    // AD Leonis (M-type): 1,024,122.4 AU from the Sun (16.19 ly).
    adleonis: { x: -477396.733, y: -352688.267, z: 834583.753, dist: 1024122.4, orbit: -2, size: 1, startype: 'M', label: loc('star_ad_leonis'), zlabel: loc('star_ad_leonis') },
    // adleonis planets (M-type, 2, none habitable)
    adleonis_p1: { dist: 0.34, orbit: 132, size: 0.22, star: 'adleonis' },
    adleonis_p2: { dist: 0.57, orbit: 287, size: 0.28, star: 'adleonis' },
    // EV Lacertae (M-type): 1,041,966.2 AU from the Sun (16.48 ly).
    evlacertae: { x: -186823.196, y: 997634.01, z: -235620.328, dist: 1041966.2, orbit: -2, size: 1, startype: 'M', label: loc('star_ev_lacertae'), zlabel: loc('star_ev_lacertae') },
    // evlacertae planets (M-type, 3, one in the habitable zone)
    evlacertae_p1: { dist: 0.25, orbit: 83, size: 0.22, star: 'evlacertae', hz: true },
    evlacertae_p2: { dist: 0.47, orbit: 215, size: 0.21, star: 'evlacertae' },
    evlacertae_p3: { dist: 0.89, orbit: 560, size: 0.32, star: 'evlacertae' },
    // Kruger 60 A (M-type): 827,068.7 AU from the Sun (13.08 ly).
    kruger60: { x: -209693.304, y: 800044.563, z: -54.443, dist: 827068.7, orbit: -2, size: 1, startype: 'M', label: loc('star_kruger_60'), zlabel: loc('star_kruger_60') + ' A' },
    // kruger60 planets (M-type, 2, one in the habitable zone)
    kruger60_p1: { dist: 0.24, orbit: 78, size: 0.31, star: 'kruger60', hz: true },
    kruger60_p2: { dist: 0.46, orbit: 208, size: 0.32, star: 'kruger60' },
    // Kruger 60 B (M-type): companion, 31.7 AU from Kruger 60 A.
    kruger60b: { x: -209715.123, y: 800038.845, z: -32.203, dist: 827068.7, orbit: -2, size: 1, startype: 'M', zlabel: loc('star_kruger_60') + ' B' },
    // kruger60b planets (M-type, 3, one in the habitable zone)
    kruger60b_p1: { dist: 0.22, orbit: 69, size: 0.24, star: 'kruger60b', hz: true },
    kruger60b_p2: { dist: 0.4, orbit: 169, size: 0.25, star: 'kruger60b' },
    kruger60b_p3: { dist: 0.81, orbit: 486, size: 0.35, star: 'kruger60b' },
    // YZ Canis Minoris (M-type): 1,235,289.5 AU from the Sun (19.53 ly).
    yzcanisminoris: { x: -973702.123, y: -703704.877, z: 287478.163, dist: 1235289.5, orbit: -2, size: 1, startype: 'M', label: loc('star_yz_canis_minoris'), zlabel: loc('star_yz_canis_minoris') },
    // yzcanisminoris planets (M-type, 2, none habitable)
    yzcanisminoris_p1: { dist: 0.41, orbit: 175, size: 0.41, star: 'yzcanisminoris' },
    yzcanisminoris_p2: { dist: 0.81, orbit: 486, size: 0.33, star: 'yzcanisminoris' },
    // Epsilon Indi A (K-type): 750,482 AU from the Sun (11.87 ly).
    epsilonindi: { x: 459040.021, y: -202531.303, z: -558109.846, dist: 750482, orbit: -2, size: 2, startype: 'K', label: loc('star_epsilon_indi'), zlabel: loc('star_epsilon_indi') + ' A' },
    // epsilonindi planets (K-type, 4, habitable-zone planet at ~0.5 AU)
    epsilonindi_p1: { dist: 0.5, orbit: 154, size: 0.59, star: 'epsilonindi', hz: true },
    epsilonindi_p2: { dist: 0.8, orbit: 312, size: 0.73, star: 'epsilonindi' },
    epsilonindi_p3: { dist: 1.4, orbit: 723, size: 1.15, star: 'epsilonindi' },
    epsilonindi_p4: { dist: 2.5, orbit: 1726, size: 1.26, star: 'epsilonindi' },
    // Epsilon Indi Ba & Bb (T-type brown dwarf binary, 2.65 AU apart) orbit an invisible barycenter
    // (`hidden`, not drawn) at their midpoint. They are bodies of it (so they orbit it) but still
    // Epsilon Indi Ba/Bb (T-type): companion, 1,463.8 AU from Epsilon Indi A.
    epsilonindib: { x: 457885.928, y: -202710.048, z: -558992.292, dist: 750482, orbit: -2, size: 0, startype: 'T', hidden: true },
    epsilonindiba: { dist: 1.33, orbit: 4139, size: 1.2, star: 'epsilonindib', bodystar: 'T', zlabel: loc('star_epsilon_indi') + ' BA' },
    epsilonindibb: { dist: 1.33, orbit: 4139, size: 1.2, star: 'epsilonindib', bodystar: 'T', zlabel: loc('star_epsilon_indi') + ' BB' },
    // Gliese 570 A (K-type): 1,214,148.7 AU from the Sun (19.20 ly).
    gliese570: { x: 949177.543, y: -378832.087, z: 655519.159, dist: 1214148.7, orbit: -2, size: 2, startype: 'K', label: loc('star_gliese_570'), zlabel: loc('star_gliese_570') + ' A' },
    // gliese570 planets (K-type, 4, habitable-zone planet at ~0.5 AU)
    gliese570_p1: { dist: 0.35, orbit: 90, size: 0.32, star: 'gliese570' },
    gliese570_p2: { dist: 0.5, orbit: 154, size: 0.56, star: 'gliese570', hz: true },
    gliese570_p3: { dist: 0.8, orbit: 312, size: 0.64, star: 'gliese570' },
    gliese570_p4: { dist: 1.4, orbit: 723, size: 1.15, star: 'gliese570' },
    // Gliese 570 B & C (M-type binary, 0.8 AU apart) orbit an invisible barycenter (`hidden`, not
    // drawn) at their midpoint. They are treated as bodies of it (so they orbit it) but still render
    // as stars via `bodystar` + label. Two circumbinary planets orbit the barycenter further out,
    // Gliese 570 B/C (G-type): companion, 146.6 AU from Gliese 570 A.
    gliese570bc: { x: 949089.095, y: -378855.488, z: 655633.69, dist: 1214148.7, orbit: -2, size: 0, startype: 'G', hidden: true },
    gliese570b: { dist: 0.4, orbit: 337, size: 1, star: 'gliese570bc', bodystar: 'M', zlabel: loc('star_gliese_570') + ' B' },
    gliese570c: { dist: 0.4, orbit: 337, size: 1, star: 'gliese570bc', bodystar: 'M', zlabel: loc('star_gliese_570') + ' C' },
    gliese570bc_p1: { dist: 1.8, orbit: 1139, size: 0.5, star: 'gliese570bc' },
    gliese570bc_p2: { dist: 3, orbit: 2450, size: 0.7, star: 'gliese570bc' },
    // Gliese 570 D (T-type): companion, 1,540.6 AU from Gliese 570 A.
    gliese570d: { x: 948312.726, y: -378790.836, z: 656793.425, dist: 1214148.7, orbit: -2, size: 1, startype: 'T', zlabel: loc('star_gliese_570') + ' D' },
    // Wolf 1061 (M-type): 888,540.1 AU from the Sun (14.05 ly).
    wolf1061: { x: 812336.061, y: 47574.594, z: 356861.682, dist: 888540.1, orbit: -2, size: 1, startype: 'M', label: loc('star_wolf_1061'), zlabel: loc('star_wolf_1061') },
    // wolf1061 planets (M-type, 2, none habitable)
    wolf1061_p1: { dist: 0.33, orbit: 126, size: 0.38, star: 'wolf1061' },
    wolf1061_p2: { dist: 0.61, orbit: 318, size: 0.32, star: 'wolf1061' },
    // Groombridge 1618 (K-type): 1,004,627.1 AU from the Sun (15.89 ly).
    groombridge1618: { x: -597833.655, y: 150541.573, z: 793226.14, dist: 1004627.1, orbit: -2, size: 1.75, startype: 'K', label: loc('star_groombridge_1618'), zlabel: loc('star_groombridge_1618') },
    // groombridge1618 planets (K-type, 2, habitable-zone planet at ~0.2 AU — a dim K6 dwarf)
    groombridge1618_p1: { dist: 0.2, orbit: 41, size: 0.4, star: 'groombridge1618', hz: true },
    groombridge1618_p2: { dist: 0.45, orbit: 139, size: 0.33, star: 'groombridge1618' },
    // 40 Eridani A (K-type): 1,033,349.4 AU from the Sun (16.34 ly). Triple: a K0 dwarf with a
    // white dwarf and a red dwarf orbiting each other some 400 AU out.
    eridani40: { x: -760960.965, y: -288344.331, z: -636872.774, dist: 1033349.4, orbit: -2, size: 1.9, startype: 'K', label: loc('star_40_eridani'), zlabel: loc('star_40_eridani') + ' A' },
    // eridani40 planets (K-type, 3, habitable-zone planet at ~0.68 AU). The inner one stands in for
    // the much-disputed 40 Eridani A b; all three sit far inside the 400 AU to the B/C pair.
    eridani40_p1: { dist: 0.22, orbit: 43, size: 0.38, star: 'eridani40' },
    eridani40_p2: { dist: 0.68, orbit: 232, size: 0.52, star: 'eridani40', hz: true },
    eridani40_p3: { dist: 1.3, orbit: 613, size: 0.9, star: 'eridani40' },
    // 40 Eridani B (D-type white dwarf): companion, 418.7 AU from 40 Eridani A.
    eridani40b: { x: -761042.474, y: -288672.923, z: -636626.477, dist: 1033349.4, orbit: -2, size: 1.2, startype: 'D', zlabel: loc('star_40_eridani') + ' B' },
    // 40 Eridani C (M-type): companion, 392 AU from 40 Eridani A and 46.8 AU from the white dwarf.
    eridani40c: { x: -761061.01, y: -288630.021, z: -636623.769, dist: 1033349.4, orbit: -2, size: 1, startype: 'M', zlabel: loc('star_40_eridani') + ' C' },
    // 36 Ophiuchi A (K-type): 1,227,744 AU from the Sun (19.41 ly). A triple of K dwarfs.
    ophiuchi36: { x: 1218355.571, y: -36598.555, z: 147056.784, dist: 1227744, orbit: -2, size: 1.9, startype: 'K', label: loc('star_36_ophiuchi'), zlabel: loc('star_36_ophiuchi') + ' A' },
    // ophiuchi36 planets (K-type, 2, habitable-zone planet at ~0.55 AU). Held well inside the 29 AU
    // to component B, which is close enough to bound anything much wider.
    ophiuchi36_p1: { dist: 0.55, orbit: 161, size: 0.5, star: 'ophiuchi36', hz: true },
    ophiuchi36_p2: { dist: 0.95, orbit: 367, size: 0.62, star: 'ophiuchi36' },
    // 36 Ophiuchi B (K-type): companion, 29 AU from 36 Ophiuchi A.
    ophiuchi36b: { x: 1218358.479, y: -36609.241, z: 147030.032, dist: 1227744, orbit: -2, size: 1.85, startype: 'K', zlabel: loc('star_36_ophiuchi') + ' B' },
    // ophiuchi36b planets (K-type, 1, habitable-zone planet at ~0.52 AU)
    ophiuchi36b_p1: { dist: 0.52, orbit: 151, size: 0.47, star: 'ophiuchi36b', hz: true },
    // 36 Ophiuchi C (K-type): distant companion, 4,364 AU from 36 Ophiuchi A.
    ophiuchi36c: { x: 1218779.549, y: -33227.176, z: 144318.453, dist: 1227744, orbit: -2, size: 1.6, startype: 'K', zlabel: loc('star_36_ophiuchi') + ' C' },
    // ophiuchi36c planets (K-type, 1, habitable-zone planet at ~0.39 AU)
    ophiuchi36c_p1: { dist: 0.39, orbit: 106, size: 0.36, star: 'ophiuchi36c', hz: true },
    // HR 7703 A (K-type): 1,240,114.7 AU from the Sun (19.61 ly).
    hr7703: { x: 1059390.403, y: 97030.649, z: -637308.014, dist: 1240114.7, orbit: -2, size: 1.9, startype: 'K', label: loc('star_hr_7703'), zlabel: loc('star_hr_7703') + ' A' },
    // hr7703 planets (K-type, 2, habitable-zone planet at ~0.5 AU)
    hr7703_p1: { dist: 0.5, orbit: 149, size: 0.46, star: 'hr7703', hz: true },
    hr7703_p2: { dist: 0.9, orbit: 360, size: 0.55, star: 'hr7703' },
    // HR 7703 B (M-type): companion, 178.7 AU from HR 7703 A.
    hr7703b: { x: 1059353.659, y: 96877.48, z: -637392.387, dist: 1240114.7, orbit: -2, size: 1, startype: 'M', zlabel: loc('star_hr_7703') + ' B' },
    // 82 Eridani (G-type): 1,246,130.8 AU from the Sun (19.70 ly).
    eridani82: { x: -229324.232, y: -656542.819, z: -1034023.178, dist: 1246130.8, orbit: -2, size: 2, startype: 'G', label: loc('star_82_eridani'), zlabel: loc('star_82_eridani') },
    // eridani82 planets (G-type, 3, habitable-zone planet at ~1.35 AU). These are the real HD 20794
    // b, c and d; the star's 0.8 solar masses reproduces their published 18.3, 89.6 and 647 day
    // periods through the same Kepler relation the rest of the table uses.
    eridani82_p1: { dist: 0.126, orbit: 18, size: 0.35, star: 'eridani82' },
    eridani82_p2: { dist: 0.36, orbit: 88, size: 0.4, star: 'eridani82' },
    eridani82_p3: { dist: 1.35, orbit: 640, size: 0.45, star: 'eridani82', hz: true },
    // Delta Pavonis (G-type): 1,258,062 AU from the Sun (19.89 ly). A G8 subgiant, so it is drawn
    // slightly larger than the G dwarfs and its habitable zone sits further out.
    deltapavonis: { x: 917575.298, y: -534741.764, z: -674408.559, dist: 1258062, orbit: -2, size: 2.2, startype: 'G', label: loc('star_delta_pavonis'), zlabel: loc('star_delta_pavonis') },
    // deltapavonis planets (G-type, 3, habitable-zone planet at ~1.1 AU)
    deltapavonis_p1: { dist: 0.6, orbit: 166, size: 0.4, star: 'deltapavonis' },
    deltapavonis_p2: { dist: 1.1, orbit: 411, size: 0.58, star: 'deltapavonis', hz: true },
    deltapavonis_p3: { dist: 2.1, orbit: 1084, size: 1.1, star: 'deltapavonis' },
    // Lalande 21185 (M-type): 525,177 AU from the Sun (8.30 ly).
    lalande21185: { x: -217487.254, y: -19480.634, z: 477630.322, dist: 525177, orbit: -2, size: 1, startype: 'M', label: loc('star_lalande21185'), zlabel: loc('star_lalande21185') },
    // lalande21185 planets (M-type, 2, habitable-zone planet at ~0.39 AU) — real detected planets, at their published semi-major axes
    lalande21185_p1: { dist: 0.079, orbit: 12, size: 0.35, star: 'lalande21185' },
    lalande21185_p2: { dist: 0.51, orbit: 200, size: 0.36, star: 'lalande21185', hz: true },
    // Ross 154 (M-type): 613,834.8 AU from the Sun (9.71 ly).
    ross154: { x: 592249.371, y: 118420.349, z: -109592.027, dist: 613834.8, orbit: -2, size: 1, startype: 'M', label: loc('star_ross154'), zlabel: loc('star_ross154') },
    // ross154 planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    ross154_p1: { dist: 0.25, orbit: 83, size: 0.44, star: 'ross154', hz: true },
    ross154_p2: { dist: 0.601, orbit: 310, size: 0.45, star: 'ross154' },
    // Ross 248 (M-type): 651,744.3 AU from the Sun (10.31 ly).
    ross248: { x: -213144.088, y: 585898.378, z: -189903.322, dist: 651744.3, orbit: -2, size: 1, startype: 'M', label: loc('star_ross248'), zlabel: loc('star_ross248') },
    // ross248 planets (M-type, 1, habitable-zone planet at ~0.12 AU)
    ross248_p1: { dist: 0.122, orbit: 39, size: 0.27, star: 'ross248', hz: true },
    // Lacaille 9352 (M-type): 678,200.6 AU from the Sun (10.72 ly).
    lacaille9352: { x: 275218.805, y: 24566.519, z: -619360.258, dist: 678200.6, orbit: -2, size: 1, startype: 'M', label: loc('star_lacaille9352'), zlabel: loc('star_lacaille9352') },
    // lacaille9352 planets (M-type, 2, none habitable) — real detected planets, at their published semi-major axes
    lacaille9352_p1: { dist: 0.068, orbit: 10, size: 0.28, star: 'lacaille9352' },
    lacaille9352_p2: { dist: 0.12, orbit: 23, size: 0.29, star: 'lacaille9352' },
    // EZ Aquarii (M-type): 702,536.8 AU from the Sun (11.11 ly).
    ezaquarii: { x: 260754.881, y: 280307.529, z: -589060.731, dist: 702536.8, orbit: -2, size: 1, startype: 'M', label: loc('star_ezaquarii'), zlabel: loc('star_ezaquarii') },
    // ezaquarii planets (M-type, 1, habitable-zone planet at ~0.12 AU)
    ezaquarii_p1: { dist: 0.122, orbit: 39, size: 0.49, star: 'ezaquarii', hz: true },
    // Struve 2398 (M-type): 726,693.7 AU from the Sun (11.49 ly).
    struve2398: { x: 8230.584, y: 662621.062, z: 298243.672, dist: 726693.7, orbit: -2, size: 1, startype: 'M', label: loc('star_struve2398'), zlabel: loc('star_struve2398') + ' A' },
    // struve2398 planets (M-type, 2, habitable-zone planet at ~0.31 AU)
    struve2398_p1: { dist: 0.309, orbit: 104, size: 0.28, star: 'struve2398', hz: true },
    struve2398_p2: { dist: 0.741, orbit: 388, size: 0.29, star: 'struve2398' },
    // Struve 2398 B (M-type): M3.5 dwarf companion, 45 AU from Struve 2398 A.
    struve2398b: { x: 8273.129, y: 662626.622, z: 298230.14, dist: 726693.7, orbit: -2, size: 1, startype: 'M', zlabel: loc('star_struve2398') + ' B' },
    // struve2398b planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    struve2398b_p1: { dist: 0.25, orbit: 83, size: 0.46, star: 'struve2398b', hz: true },
    struve2398b_p2: { dist: 0.601, orbit: 310, size: 0.47, star: 'struve2398b' },
    // Groombridge 34 (M-type): 734,805.2 AU from the Sun (11.62 ly).
    groombridge34: { x: -312946.227, y: 622849.542, z: -232511.796, dist: 734805.2, orbit: -2, size: 1, startype: 'M', label: loc('star_groombridge34'), zlabel: loc('star_groombridge34') + ' A' },
    // groombridge34 planets (M-type, 2, none habitable) — real detected planets, at their published semi-major axes
    groombridge34_p1: { dist: 0.072, orbit: 11, size: 0.33, star: 'groombridge34' },
    groombridge34_p2: { dist: 5.4, orbit: 6905, size: 0.34, star: 'groombridge34' },
    // Groombridge 34 B (M-type): M3.5 dwarf companion, 125.7 AU from Groombridge 34 A.
    groombridge34b: { x: -313058.463, y: 622807.066, z: -232474.486, dist: 734805.2, orbit: -2, size: 1, startype: 'M', zlabel: loc('star_groombridge34') + ' B' },
    // groombridge34b planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    groombridge34b_p1: { dist: 0.25, orbit: 83, size: 0.33, star: 'groombridge34b', hz: true },
    groombridge34b_p2: { dist: 0.601, orbit: 310, size: 0.34, star: 'groombridge34b' },
    // Gliese 1061 (M-type): 757,876.5 AU from the Sun (11.98 ly).
    gliese1061: { x: -142241.102, y: -434411.095, z: -604509.111, dist: 757876.5, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese1061'), zlabel: loc('star_gliese1061') },
    // gliese1061 planets (M-type, 3, none habitable) — real detected planets, at their published semi-major axes
    gliese1061_p1: { dist: 0.021, orbit: 3, size: 0.33, star: 'gliese1061' },
    gliese1061_p2: { dist: 0.035, orbit: 7, size: 0.34, star: 'gliese1061' },
    gliese1061_p3: { dist: 0.054, orbit: 13, size: 0.35, star: 'gliese1061' },
    // Luyten's Star (M-type): 780,930.7 AU from the Sun (12.35 ly).
    luytensstar: { x: -648982.214, y: -410976.247, z: 140617.84, dist: 780930.7, orbit: -2, size: 1, startype: 'M', label: loc('star_luytensstar'), zlabel: loc('star_luytensstar') },
    // luytensstar planets (M-type, 2, none habitable) — real detected planets, at their published semi-major axes
    luytensstar_p1: { dist: 0.036, orbit: 5, size: 0.46, star: 'luytensstar' },
    luytensstar_p2: { dist: 0.091, orbit: 18, size: 0.47, star: 'luytensstar' },
    // Lacaille 8760 (M-type): 818,795.8 AU from the Sun (12.95 ly).
    lacaille8760: { x: 585078.569, y: 39930.09, z: -571415.051, dist: 818795.8, orbit: -2, size: 1, startype: 'M', label: loc('star_lacaille8760'), zlabel: loc('star_lacaille8760') },
    // lacaille8760 planets (M-type, 2, habitable-zone planet at ~0.44 AU)
    lacaille8760_p1: { dist: 0.44, orbit: 152, size: 0.36, star: 'lacaille8760', hz: true },
    lacaille8760_p2: { dist: 1.057, orbit: 567, size: 0.37, star: 'lacaille8760' },
    // SCR 1845-6357 (M-type): 826,166 AU from the Sun (13.06 ly).
    scr1845: { x: 665907.921, y: -361272.051, z: -329544.131, dist: 826166, orbit: -2, size: 1, startype: 'M', label: loc('star_scr1845'), zlabel: loc('star_scr1845') + ' A' },
    // scr1845 planets (M-type, 1, habitable-zone planet at ~0.05 AU)
    scr1845_p1: { dist: 0.051, orbit: 15, size: 0.27, star: 'scr1845', hz: true },
    // SCR 1845-6357 B (T-type): brown dwarf companion, 1.4 AU from SCR 1845-6357 A.
    scr1845b: { x: 665907.12, y: -361273.178, z: -329544.514, dist: 826166, orbit: -2, size: 1, startype: 'T', zlabel: loc('star_scr1845') + ' B' },
    // DEN 1048-3956 (M-type): 834,351.9 AU from the Sun (13.19 ly).
    den1048: { x: 120425.2, y: -788470.43, z: 244857.613, dist: 834351.9, orbit: -2, size: 1, startype: 'M', label: loc('star_den1048'), zlabel: loc('star_den1048') },
    // den1048 planets (M-type, 1, habitable-zone planet at ~0.05 AU)
    den1048_p1: { dist: 0.051, orbit: 15, size: 0.37, star: 'den1048', hz: true },
    // Ross 614 (M-type): 848,945.5 AU from the Sun (13.42 ly).
    ross614: { x: -708412.737, y: -458791.644, z: -91488.11, dist: 848945.5, orbit: -2, size: 1, startype: 'M', label: loc('star_ross614'), zlabel: loc('star_ross614') },
    // ross614 planets (M-type, 2, habitable-zone planet at ~0.16 AU)
    ross614_p1: { dist: 0.157, orbit: 51, size: 0.3, star: 'ross614', hz: true },
    ross614_p2: { dist: 0.377, orbit: 189, size: 0.31, star: 'ross614' },
    // Gliese 1 (M-type): 896,425.4 AU from the Sun (14.17 ly).
    gliese1: { x: 209403.756, y: -61814.687, z: -869429.465, dist: 896425.4, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese1'), zlabel: loc('star_gliese1') },
    // gliese1 planets (M-type, 2, habitable-zone planet at ~0.39 AU)
    gliese1_p1: { dist: 0.389, orbit: 134, size: 0.45, star: 'gliese1', hz: true },
    gliese1_p2: { dist: 0.934, orbit: 497, size: 0.46, star: 'gliese1' },
    // Gliese 687 (M-type): 938,464 AU from the Sun (14.84 ly).
    gliese687: { x: -119088.111, y: 787217.482, z: 496811.094, dist: 938464, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese687'), zlabel: loc('star_gliese687') },
    // gliese687 planets (M-type, 2, none habitable) — real detected planets, at their published semi-major axes
    gliese687_p1: { dist: 0.164, orbit: 40, size: 0.27, star: 'gliese687' },
    gliese687_p2: { dist: 1.17, orbit: 770, size: 0.28, star: 'gliese687' },
    // Gliese 674 (M-type): 939,077.1 AU from the Sun (14.85 ly).
    gliese674: { x: 891786.742, y: -272579.855, z: -110825.959, dist: 939077.1, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese674'), zlabel: loc('star_gliese674') },
    // gliese674 planets (M-type, 1, none habitable) — real detected planets, at their published semi-major axes
    gliese674_p1: { dist: 0.039, orbit: 5, size: 0.26, star: 'gliese674' },
    // LHS 292 (M-type): 940,430.5 AU from the Sun (14.87 ly).
    lhs292: { x: -110597.972, y: -697913.901, z: 620559.241, dist: 940430.5, orbit: -2, size: 1, startype: 'M', label: loc('star_lhs292'), zlabel: loc('star_lhs292') },
    // lhs292 planets (M-type, 1, habitable-zone planet at ~0.07 AU)
    lhs292_p1: { dist: 0.067, orbit: 21, size: 0.31, star: 'lhs292', hz: true },
    // Gliese 876 (M-type): 963,683.1 AU from the Sun (15.24 ly).
    gliese876: { x: 299935.23, y: 383955.508, z: -831445.83, dist: 963683.1, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese876'), zlabel: loc('star_gliese876') },
    // gliese876 planets (M-type, 4, habitable-zone planet at ~0.25 AU) — real detected planets, at their published semi-major axes
    gliese876_p1: { dist: 0.021, orbit: 2, size: 0.27, star: 'gliese876' },
    gliese876_p2: { dist: 0.13, orbit: 31, size: 0.28, star: 'gliese876' },
    gliese876_p3: { dist: 0.208, orbit: 63, size: 0.29, star: 'gliese876', hz: true },
    gliese876_p4: { dist: 0.334, orbit: 129, size: 0.3, star: 'gliese876', hz: true },
    // Gliese 1245 (M-type): 967,775.5 AU from the Sun (15.30 ly).
    gliese1245: { x: 184953.099, y: 939081.762, z: 143203.637, dist: 967775.5, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese1245'), zlabel: loc('star_gliese1245') + ' A' },
    // gliese1245 planets (M-type, 1, habitable-zone planet at ~0.10 AU)
    gliese1245_p1: { dist: 0.096, orbit: 30, size: 0.37, star: 'gliese1245', hz: true },
    // Gliese 1245 B (M-type): M6 dwarf companion, 35.6 AU from Gliese 1245 A.
    gliese1245b: { x: 184926.336, y: 939090.367, z: 143181.763, dist: 967775.5, orbit: -2, size: 1, startype: 'M', zlabel: loc('star_gliese1245') + ' B' },
    // gliese1245b planets (M-type, 1, habitable-zone planet at ~0.07 AU)
    gliese1245b_p1: { dist: 0.071, orbit: 22, size: 0.33, star: 'gliese1245b', hz: true },
    // LHS 288 (M-type): 996,593.7 AU from the Sun (15.76 ly).
    lhs288: { x: 311628.137, y: -945967.647, z: -35102.573, dist: 996593.7, orbit: -2, size: 1, startype: 'M', label: loc('star_lhs288'), zlabel: loc('star_lhs288') },
    // lhs288 planets (M-type, 1, habitable-zone planet at ~0.10 AU)
    lhs288_p1: { dist: 0.096, orbit: 30, size: 0.39, star: 'lhs288', hz: true },
    // Gliese 1002 (M-type): 999,587.1 AU from the Sun (15.81 ly).
    gliese1002: { x: -16284.807, y: 378551.276, z: -924990.911, dist: 999587.1, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese1002'), zlabel: loc('star_gliese1002') },
    // gliese1002 planets (M-type, 2, habitable-zone planet at ~0.10 AU) — real detected planets, at their published semi-major axes
    gliese1002_p1: { dist: 0.046, orbit: 10, size: 0.49, star: 'gliese1002' },
    gliese1002_p2: { dist: 0.074, orbit: 20, size: 0.5, star: 'gliese1002', hz: true },
    // Gliese 412 (M-type): 1,011,659.4 AU from the Sun (16.00 ly).
    gliese412: { x: -448966.251, y: 91321.181, z: 901967.006, dist: 1011659.4, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese412'), zlabel: loc('star_gliese412') + ' A' },
    // gliese412 planets (M-type, 2, habitable-zone planet at ~0.44 AU)
    gliese412_p1: { dist: 0.44, orbit: 152, size: 0.37, star: 'gliese412', hz: true },
    gliese412_p2: { dist: 1.057, orbit: 567, size: 0.38, star: 'gliese412' },
    // Gliese 412 B (M-type): M6 dwarf companion, 153 AU from Gliese 412 A.
    gliese412b: { x: -448837.812, y: 91274.378, z: 902035.664, dist: 1011659.4, orbit: -2, size: 1, startype: 'M', zlabel: loc('star_gliese412') + ' B' },
    // gliese412b planets (M-type, 1, habitable-zone planet at ~0.07 AU)
    gliese412b_p1: { dist: 0.071, orbit: 22, size: 0.25, star: 'gliese412b', hz: true },
    // Gliese 832 (M-type): 1,024,535.5 AU from the Sun (16.20 ly).
    gliese832: { x: 694603.235, y: -132841.054, z: -741318.088, dist: 1024535.5, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese832'), zlabel: loc('star_gliese832') },
    // gliese832 planets (M-type, 2, habitable-zone planet at ~0.25 AU) — real detected planets, at their published semi-major axes
    gliese832_p1: { dist: 0.163, orbit: 44, size: 0.28, star: 'gliese832', hz: true },
    gliese832_p2: { dist: 3.56, orbit: 4476, size: 0.29, star: 'gliese832' },
    // Gliese 1005 (M-type): 1,028,598.2 AU from the Sun (16.26 ly).
    gliese1005: { x: 25989.848, y: 243959.963, z: -998910.614, dist: 1028598.2, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese1005'), zlabel: loc('star_gliese1005') },
    // gliese1005 planets (M-type, 2, habitable-zone planet at ~0.18 AU)
    gliese1005_p1: { dist: 0.184, orbit: 60, size: 0.34, star: 'gliese1005', hz: true },
    gliese1005_p2: { dist: 0.443, orbit: 224, size: 0.35, star: 'gliese1005' },
    // Gliese 682 (M-type): 1,032,902.3 AU from the Sun (16.33 ly).
    gliese682: { x: 995446.58, y: -248457.356, z: -119340.785, dist: 1032902.3, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese682'), zlabel: loc('star_gliese682') },
    // gliese682 planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    gliese682_p1: { dist: 0.25, orbit: 83, size: 0.34, star: 'gliese682', hz: true },
    gliese682_p2: { dist: 0.601, orbit: 310, size: 0.35, star: 'gliese682' },
    // Gliese 316.1 (M-type): 1,062,430.4 AU from the Sun (16.80 ly).
    gliese3161: { x: -757530.872, y: -395194.328, z: 631448.157, dist: 1062430.4, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese3161'), zlabel: loc('star_gliese3161') + ' A' },
    // gliese3161 planets (M-type, 1, habitable-zone planet at ~0.05 AU)
    gliese3161_p1: { dist: 0.055, orbit: 17, size: 0.42, star: 'gliese3161', hz: true },
    // Gliese 316.1 B (M-type): M7 dwarf companion, 13.6 AU from Gliese 316.1 A.
    gliese3161b: { x: -757524.185, y: -395206.107, z: 631448.807, dist: 1062430.4, orbit: -2, size: 1, startype: 'M', zlabel: loc('star_gliese3161') + ' B' },
    // gliese3161b planets (M-type, 1, habitable-zone planet at ~0.06 AU)
    gliese3161b_p1: { dist: 0.063, orbit: 19, size: 0.31, star: 'gliese3161b', hz: true },
    // Gliese 3379 (M-type): 1,074,220.3 AU from the Sun (16.99 ly).
    gliese3379: { x: -961744.94, y: -439556.081, z: -189173.069, dist: 1074220.3, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese3379'), zlabel: loc('star_gliese3379') },
    // gliese3379 planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    gliese3379_p1: { dist: 0.25, orbit: 83, size: 0.29, star: 'gliese3379', hz: true },
    gliese3379_p2: { dist: 0.601, orbit: 310, size: 0.3, star: 'gliese3379' },
    // Gliese 445 (M-type): 1,083,749.9 AU from the Sun (17.14 ly).
    gliese445: { x: -512495.776, y: 683891.836, z: 666448.693, dist: 1083749.9, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese445'), zlabel: loc('star_gliese445') },
    // gliese445 planets (M-type, 2, habitable-zone planet at ~0.18 AU)
    gliese445_p1: { dist: 0.184, orbit: 60, size: 0.43, star: 'gliese445', hz: true },
    gliese445_p2: { dist: 0.443, orbit: 224, size: 0.44, star: 'gliese445' },
    // UCAC4 195-119117 (M-type): 1,098,737 AU from the Sun (17.37 ly).
    ucac4195: { x: 930476.996, y: -580671.582, z: 65239.27, dist: 1098737, orbit: -2, size: 1, startype: 'M', label: loc('star_ucac4195'), zlabel: loc('star_ucac4195') },
    // ucac4195 planets (M-type, 1, habitable-zone planet at ~0.06 AU)
    ucac4195_p1: { dist: 0.063, orbit: 19, size: 0.37, star: 'ucac4195', hz: true },
    // Gliese 3323 (M-type): 1,108,672.8 AU from the Sun (17.53 ly).
    gliese3323: { x: -880844.557, y: -437838.537, z: -511434.918, dist: 1108672.8, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese3323'), zlabel: loc('star_gliese3323') },
    // gliese3323 planets (M-type, 2, habitable-zone planet at ~0.18 AU) — real detected planets, at their published semi-major axes
    gliese3323_p1: { dist: 0.033, orbit: 5, size: 0.33, star: 'gliese3323' },
    gliese3323_p2: { dist: 0.126, orbit: 34, size: 0.34, star: 'gliese3323', hz: true },
    // Gliese 526 (M-type): 1,121,027.5 AU from the Sun (17.73 ly).
    gliese526: { x: 335066.997, y: -49623.998, z: 1068630.103, dist: 1121027.5, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese526'), zlabel: loc('star_gliese526') },
    // gliese526 planets (M-type, 2, habitable-zone planet at ~0.39 AU)
    gliese526_p1: { dist: 0.389, orbit: 134, size: 0.25, star: 'gliese526', hz: true },
    gliese526_p2: { dist: 0.934, orbit: 497, size: 0.26, star: 'gliese526' },
    // Stein 2051 (M-type): 1,138,051.7 AU from the Sun (18.00 ly).
    stein2051: { x: -958344.288, y: 596456.243, z: 144836.944, dist: 1138051.7, orbit: -2, size: 1, startype: 'M', label: loc('star_stein2051'), zlabel: loc('star_stein2051') + ' A' },
    // stein2051 planets (M-type, 2, habitable-zone planet at ~0.18 AU)
    stein2051_p1: { dist: 0.184, orbit: 60, size: 0.39, star: 'stein2051', hz: true },
    stein2051_p2: { dist: 0.443, orbit: 224, size: 0.4, star: 'stein2051' },
    // Stein 2051 B (D-type): white dwarf companion, 49.8 AU from Stein 2051 A.
    stein2051b: { x: -958347.129, y: 596440.249, z: 144884.009, dist: 1138051.7, orbit: -2, size: 1.2, startype: 'D', zlabel: loc('star_stein2051') + ' B' },
    // Gliese 251 (M-type): 1,151,912.6 AU from the Sun (18.21 ly).
    gliese251: { x: -1110494.37, y: -56961.286, z: 300766.1, dist: 1151912.6, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese251'), zlabel: loc('star_gliese251') },
    // gliese251 planets (M-type, 1, none habitable) — real detected planets, at their published semi-major axes
    gliese251_p1: { dist: 0.082, orbit: 14, size: 0.5, star: 'gliese251' },
    // Gliese 1224 (M-type): 1,159,239.1 AU from the Sun (18.33 ly).
    gliese1224: { x: 828810.56, y: 481669.937, z: -651845.416, dist: 1159239.1, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese1224'), zlabel: loc('star_gliese1224') },
    // gliese1224 planets (M-type, 2, habitable-zone planet at ~0.18 AU)
    gliese1224_p1: { dist: 0.184, orbit: 60, size: 0.28, star: 'gliese1224', hz: true },
    gliese1224_p2: { dist: 0.443, orbit: 224, size: 0.29, star: 'gliese1224' },
    // LSR 1835+3259 (M-type): 1,173,339.1 AU from the Sun (18.55 ly).
    lsr1835: { x: 531613.187, y: 985085.729, z: 351736.048, dist: 1173339.1, orbit: -2, size: 1, startype: 'M', label: loc('star_lsr1835'), zlabel: loc('star_lsr1835') },
    // lsr1835 planets (M-type, 1, habitable-zone planet at ~0.05 AU)
    lsr1835_p1: { dist: 0.051, orbit: 15, size: 0.37, star: 'lsr1835', hz: true },
    // Gliese 205 (M-type): 1,176,551 AU from the Sun (18.60 ly).
    gliese205: { x: -989078.348, y: -502540.926, z: -391725.589, dist: 1176551, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese205'), zlabel: loc('star_gliese205') },
    // gliese205 planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    gliese205_p1: { dist: 0.25, orbit: 83, size: 0.4, star: 'gliese205', hz: true },
    gliese205_p2: { dist: 0.601, orbit: 310, size: 0.41, star: 'gliese205' },
    // Gliese 229 (M-type): 1,188,339.3 AU from the Sun (18.79 ly).
    gliese229: { x: -745335.438, y: -845782.332, z: -375869.169, dist: 1188339.3, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese229'), zlabel: loc('star_gliese229') + ' A' },
    // gliese229 planets (M-type, 2, habitable-zone planet at ~0.44 AU) — real detected planets, at their published semi-major axes
    gliese229_p1: { dist: 0.0393, orbit: 4, size: 0.34, star: 'gliese229' },
    gliese229_p2: { dist: 0.339, orbit: 103, size: 0.35, star: 'gliese229', hz: true },
    // Gliese 229 B (T-type): brown dwarf companion, 44.8 AU from Gliese 229 A.
    gliese229b: { x: -745301.32, y: -845811.323, z: -375871.586, dist: 1188339.3, orbit: -2, size: 1, startype: 'T', zlabel: loc('star_gliese229') + ' B' },
    // Ross 47 (M-type): 1,194,517.9 AU from the Sun (18.89 ly).
    ross47: { x: -1145524.905, y: -279422.463, z: -191229.485, dist: 1194517.9, orbit: -2, size: 1, startype: 'M', label: loc('star_ross47'), zlabel: loc('star_ross47') },
    // ross47 planets (M-type, 2, habitable-zone planet at ~0.18 AU)
    ross47_p1: { dist: 0.184, orbit: 60, size: 0.29, star: 'ross47', hz: true },
    ross47_p2: { dist: 0.443, orbit: 224, size: 0.3, star: 'ross47' },
    // Gliese 693 (M-type): 1,214,721.5 AU from the Sun (19.21 ly).
    gliese693: { x: 1068695.749, y: -491444.967, z: -303182.245, dist: 1214721.5, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese693'), zlabel: loc('star_gliese693') },
    // gliese693 planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    gliese693_p1: { dist: 0.25, orbit: 83, size: 0.27, star: 'gliese693', hz: true },
    gliese693_p2: { dist: 0.601, orbit: 310, size: 0.28, star: 'gliese693' },
    // Gliese 754 (M-type): 1,218,806.3 AU from the Sun (19.27 ly).
    gliese754: { x: 1104389.603, y: -148146.062, z: -493827.043, dist: 1218806.3, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese754'), zlabel: loc('star_gliese754') },
    // gliese754 planets (M-type, 2, habitable-zone planet at ~0.16 AU)
    gliese754_p1: { dist: 0.157, orbit: 51, size: 0.31, star: 'gliese754', hz: true },
    gliese754_p2: { dist: 0.377, orbit: 189, size: 0.32, star: 'gliese754' },
    // Gliese 908 (M-type): 1,218,941.7 AU from the Sun (19.27 ly).
    gliese908: { x: -41398.594, y: 664742.204, z: -1020893.164, dist: 1218941.7, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese908'), zlabel: loc('star_gliese908') },
    // gliese908 planets (M-type, 2, habitable-zone planet at ~0.44 AU)
    gliese908_p1: { dist: 0.44, orbit: 152, size: 0.41, star: 'gliese908', hz: true },
    gliese908_p2: { dist: 1.057, orbit: 567, size: 0.42, star: 'gliese908' },
    // Gliese 752 (M-type): 1,220,057.8 AU from the Sun (19.29 ly).
    gliese752: { x: 926948.333, y: 790205.838, z: -69875.759, dist: 1220057.8, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese752'), zlabel: loc('star_gliese752') + ' A' },
    // gliese752 planets (M-type, 2, habitable-zone planet at ~0.31 AU)
    gliese752_p1: { dist: 0.309, orbit: 104, size: 0.5, star: 'gliese752', hz: true },
    gliese752_p2: { dist: 0.741, orbit: 388, size: 0.24, star: 'gliese752' },
    // Gliese 752 B (M-type): M8 dwarf companion, 444.7 AU from Gliese 752 A.
    gliese752b: { x: 927095.567, y: 790000.638, z: -70241.737, dist: 1220057.8, orbit: -2, size: 1, startype: 'M', zlabel: loc('star_gliese752') + ' B' },
    // gliese752b planets (M-type, 1, habitable-zone planet at ~0.05 AU)
    gliese752b_p1: { dist: 0.055, orbit: 17, size: 0.5, star: 'gliese752b', hz: true },
    // Gliese 588 (M-type): 1,220,527.1 AU from the Sun (19.30 ly).
    gliese588: { x: 1060129.542, y: -547762.98, z: 256451.649, dist: 1220527.1, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese588'), zlabel: loc('star_gliese588') },
    // gliese588 planets (M-type, 2, habitable-zone planet at ~0.25 AU)
    gliese588_p1: { dist: 0.25, orbit: 83, size: 0.48, star: 'gliese588', hz: true },
    gliese588_p2: { dist: 0.601, orbit: 310, size: 0.49, star: 'gliese588' },
    // Gliese 661 (M-type): 1,232,977.5 AU from the Sun (19.50 ly).
    gliese661: { x: 319345.938, y: 945459.439, z: 724125.777, dist: 1232977.5, orbit: -2, size: 1, startype: 'M', label: loc('star_gliese661'), zlabel: loc('star_gliese661') },
    // gliese661 planets (M-type, 2, habitable-zone planet at ~0.31 AU)
    gliese661_p1: { dist: 0.309, orbit: 104, size: 0.25, star: 'gliese661', hz: true },
    gliese661_p2: { dist: 0.741, orbit: 388, size: 0.26, star: 'gliese661' },
    // QY Aurigae (M-type): 1,248,465.2 AU from the Sun (19.74 ly).
    qyaurigae: { x: -1173685.128, y: 21423.911, z: 425052.508, dist: 1248465.2, orbit: -2, size: 1, startype: 'M', label: loc('star_qyaurigae'), zlabel: loc('star_qyaurigae') },
    // qyaurigae planets (M-type, 2, habitable-zone planet at ~0.16 AU)
    qyaurigae_p1: { dist: 0.157, orbit: 51, size: 0.49, star: 'qyaurigae', hz: true },
    qyaurigae_p2: { dist: 0.377, orbit: 189, size: 0.5, star: 'qyaurigae' },
    // Gliese 65 B (M-type): M6 dwarf companion, 11 AU from Gliese 65 A.
    gliese65b: { x: -138135.223, y: 10899.179, z: -543557.776, dist: 560941.3, orbit: -2, size: 1, startype: 'M', zlabel: loc('star_gliese65') + ' B' },
    // gliese65b planets (M-type, 1, habitable-zone planet at ~0.07 AU)
    gliese65b_p1: { dist: 0.32, orbit: 121, size: 0.3, star: 'gliese65' }
};

export function setOrbits(){
    if (!global.space['position']){
        global.space['position'] = {};
    }
    Object.keys(spacePlanetStats).forEach(function(o){
        // Stars have fixed coordinates, so they never need an orbital position.
        if (!spacePlanetStats[o].startype && !global.space.position.hasOwnProperty(o)){
            global.space.position[o] = Math.rand(0,360);
        }
    });
    global.space.position.spc_home = global.space.position.spc_moon;
    global.space.position.spc_gas_moon = global.space.position.spc_gas;
    global.space.position.spc_titan = global.space.position.spc_enceladus;
    global.space.position.spc_saturn = global.space.position.spc_titan;
    global.space.position.spc_neptune = global.space.position.spc_triton;
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

// Distance between two points in AU. Coordinates saved before the map gained a z (a ship's stored
// position, origin and destination) read as 0, which is where they were.
export function dist3(a,b){
    return Math.hypot(b.x - a.x, b.y - a.y, (b.z || 0) - (a.z || 0));
}

// A body's orbital inclination in degrees. An explicit `inc` wins; everything else gets a small
// deterministic tilt from its id, so the decorative systems aren't perfectly flat discs when the map
// is turned. Nothing in the 0-6 degree range is a ship destination, so this can't move a target.
function orbitIncline(id){
    let body = spacePlanetStats[id];
    return body.hasOwnProperty('inc') ? body.inc : (texSeed(id) % 600) / 100;
}

// Where a body sits at a given angle along its orbit, in AU from the Sun. Split out of genXYcoord so
// the map can trace the exact path a body follows when it draws that body's orbit — the ring and the
// dot on it are then guaranteed to agree, at any camera angle.
export function orbitPoint(planet, deg){
    let body = spacePlanetStats[planet];
    let rad = deg * (Math.PI / 180);
    let inc = orbitIncline(planet) * (Math.PI / 180);
    let u, v, origin;
    if (body.star){
        // Bodies with a `star` (the Tau Ceti system) ride a clean circular orbit centered on that
        // star — no eccentricity or per-orbit x-shift — so the system reads as concentric rings.
        origin = genXYcoord(body.star);
        u = Math.cos(rad) * body.dist * 1.2 + body.dist / 3;
        v = Math.sin(rad) * body.dist;
    }
    else {
        origin = { x: 0, y: 0, z: 0 };
        u = xPosition(+(Math.cos(rad)).toFixed(5) * body.dist, planet) + xShift(planet);
        v = +(Math.sin(rad)).toFixed(5) * body.dist;
    }
    // Tilt about the line of nodes (the x axis). The orbit keeps its size and every point on it
    // keeps its distance from the primary; only its height above the reference plane changes.
    return { x: origin.x + u, y: origin.y + v * Math.cos(inc), z: origin.z + v * Math.sin(inc) };
}

export function genXYcoord(planet){
    // Stars have fixed coordinates and are not positioned by distance/angle from the Sun.
    if (spacePlanetStats[planet].startype){
        return { x: spacePlanetStats[planet].x, y: spacePlanetStats[planet].y, z: spacePlanetStats[planet].z || 0 };
    }
    return orbitPoint(planet, global.space.position.hasOwnProperty(planet) ? global.space.position[planet] : 0);
}

function transferWindow(p1,p2){
    return Math.ceil(dist3(p1,p2) * 225);
}

// The star nearest a point (absolute Sun-frame coords), scanning every star in spacePlanetStats.
function nearestStar(pt){
    let best = 'spc_sun';
    let bestDist = Infinity;
    for (let [id, body] of Object.entries(spacePlanetStats)){
        if (!body.startype){ continue; }
        let d = dist3(pt, { x: body.x, y: body.y, z: body.z || 0 });
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
    let originStar = nearestStar(ship.origin || ship.xy);
    let destStar = nearestStar(ship.destination || ship.xy);
    if (originStar === destStar){ return genXYcoord(originStar); }
    let dO = dist3(ship.xy, genXYcoord(originStar));
    let dD = dist3(ship.xy, genXYcoord(destStar));
    return genXYcoord(dO <= dD ? originStar : destStar);
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
function locSystem(loc){
    if (loc === 'tauceti'){ return 'tauceti'; }
    return spacePlanetStats[loc] && spacePlanetStats[loc].star ? spacePlanetStats[loc].star : 'sun';
}

// Find an active wormhole route (entry + exit gate) connecting fromLoc's system to toLoc's system,
// or null when none applies (same system, no link, or either gate inactive).
function findWormholeRoute(fromLoc, toLoc){
    let fromSys = locSystem(fromLoc);
    let toSys = locSystem(toLoc);
    if (fromSys === toSys){ return null; }
    for (let link of jumpLinks){
        let entry = jumpGates[link.from];
        let exit = jumpGates[link.to];
        if (entry && exit && entry.system === fromSys && exit.system === toSys && entry.active() && exit.active()){
            return { entry, exit };
        }
    }
    return null;
}

// Plan a ship's trip to location l. Returns the total transit time (days, computed up front),
// origin/destination coordinates, and — when an active wormhole route applies — a multi-leg path
// of time-normalized waypoints: origin -> entry gate -> (wormhole, wormholeSpeedMult x speed) exit
// gate -> final destination. Without a route it returns a plain single-leg trip (path: false).
function planShipTrip(ship, l){
    let speed = shipSpeed(ship);
    let route = findWormholeRoute(ship.location, l);
    if (!route){
        let dest = calcLandingPoint(ship, l);
        let days = Math.round(transferWindow(ship.xy, dest) / speed);
        return { transit: days, dist: days, origin: deepClone(ship.xy), destination: { x: dest.x, y: dest.y, z: dest.z }, path: false };
    }
    // Leg 1: current position -> entry gate (normal speed).
    let entryPt = calcLandingPoint(ship, route.entry.location);
    let d1 = transferWindow(ship.xy, entryPt) / speed;
    // Leg 2: entry gate -> exit gate through the wormhole (accelerated).
    let exitPt = genXYcoord(route.exit.location);
    let d2 = transferWindow(entryPt, exitPt) / (speed * wormholeSpeedMult);
    // Leg 3: exit gate -> final destination (normal speed). Compute the landing point in the exit
    // gate's frame by treating the gate as the ship's position (final xy is snapped on arrival).
    let destPt = calcLandingPoint(Object.assign({}, ship, { xy: exitPt }), l);
    let d3 = transferWindow(exitPt, destPt) / speed;
    let total = d1 + d2 + d3;
    let days = Math.max(1, Math.round(total));
    let path = [
        { x: ship.xy.x, y: ship.xy.y, z: ship.xy.z || 0, tn: 0 },
        { x: entryPt.x, y: entryPt.y, z: entryPt.z || 0, tn: d1 / total },
        { x: exitPt.x, y: exitPt.y, z: exitPt.z || 0, tn: (d1 + d2) / total },
        { x: destPt.x, y: destPt.y, z: destPt.z || 0, tn: 1 }
    ];
    return { transit: days, dist: days, origin: deepClone(ship.xy), destination: { x: destPt.x, y: destPt.y, z: destPt.z || 0 }, path };
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
        'spc_dwarf','spc_titan','spc_enceladus','spc_triton','spc_kuiper','spc_eris'
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
            'titan','enceladus','triton','eris','kuiper'
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

    // Pin the derelict ship the spc_sun "Salvage" building offers: pick one inactive ship index now
    // and store it so the choice (and its name on the button) stays fixed until it is salvaged. If
    // there were no prior ships, seed a default derelict corvette so there is always one to salvage.
    if (global.race.hasOwnProperty('inactive')){
        if (!global.race.inactive.ships){ global.race.inactive.ships = []; }
        if (global.race.inactive.ships.length === 0){
            let xy = genXYcoord('tau_gas2');
            global.race.inactive.ships.push({
                class: 'corvette', armor: 'steel', weapon: 'railgun', engine: 'ion', power: 'solar', sensor: 'radar',
                name: getRandomShipName(),
                location: 'tau_gas2', xy: deepClone(xy), origin: deepClone(xy), destination: deepClone(xy),
                transit: 0, dist: 0, damage: 0, fueled: false
            });
        }
        global.race['salvage_ship'] = Math.floor(seededRandom(0, global.race.inactive.ships.length));
    }

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
        global.tech['kuiper'] = 2;
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
        initStruct(actions.space.spc_kuiper.elerium_mine);
        initStruct(actions.space.spc_kuiper.neutronium_mine);
        initStruct(actions.space.spc_kuiper.orichalcum_mine);
        initStruct(actions.space.spc_kuiper.uranium_mine);
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

function xPosition(x,p){
    if (spacePlanetStats[p].orbit !== -2){
        let e = 1.075 + (spacePlanetStats[p].dist / 100);
        if (global.city.ptrait.includes('elliptical')){
            switch (p){
                case 'spc_home':
                    e = 1.5;
                    break;
                default:
                    e = 1.275 + (spacePlanetStats[p].dist / 100);
                    break;
            }
        }
        x *= e;
    }
    return x;
}

function xShift(id){
    if (spacePlanetStats[id].orbit !== -2){
        let x = spacePlanetStats[id].dist / 3;
        if (global.city.ptrait.includes('elliptical') && id === 'spc_home'){
            x += 0.15;
        }
        if (id === 'spc_eris'){
            x += 25;
        }
        return x;
    }
    return 0;
}

var mapScale, mapShift;

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
// The world point at the centre of the viewport (see recenterOn/refocus in buildSolarMap). Also what
// distant-star culling measures from.
var mapFocus = { x: 0, y: 0, z: 0 };

// Below this scale the map is showing whole systems as points and planet names give way to star
// names; at or above it a system's own planets are made out individually.
const labelMinScale = 4;
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
    return mapScale >= labelMinScale && dist3(pos, mapFocus) > STAR_CULL_AU;
}
let camCY = 1, camSY = 0, camCP = 1, camSP = 0;
function camUpdate(){
    camCY = Math.cos(mapYaw); camSY = Math.sin(mapYaw);
    camCP = Math.cos(mapPitch); camSP = Math.sin(mapPitch);
}
function pX(p){ return p.x * camCY - p.y * camSY; }
function pY(p){ return (p.x * camSY + p.y * camCY) * camCP - (p.z || 0) * camSP; }
// Depth for painter's-algorithm ordering. This axis completes a right-handed frame with screen-right
// and screen-down, and the canvas y axis points down, so it runs INTO the screen: larger = further
// away. Sort descending and draw in that order, so the last thing painted is the nearest.
function pD(p){ return (p.x * camSY + p.y * camCY) * camSP + (p.z || 0) * camCP; }
// A world point expressed relative to a frame origin, ready to project.
function rel(p, o){ return { x: p.x - o.x, y: p.y - o.y, z: (p.z || 0) - (o.z || 0) }; }

// Trace a body's orbit as a projected polyline. Sampling the same orbitPoint() the body itself is
// positioned by guarantees the ring and the dot on it agree at every camera angle — an analytic
// ellipse would have to be re-derived for each rotation, and would drift from the body.
const ORBIT_STEPS = 96;
function strokeOrbit(ctx, id, origin){
    ctx.beginPath();
    for (let i = 0; i <= ORBIT_STEPS; i++){
        let q = rel(orbitPoint(id, i * 360 / ORBIT_STEPS), origin);
        let sx = pX(q), sy = pY(q);
        if (i === 0){ ctx.moveTo(sx, sy); } else { ctx.lineTo(sx, sy); }
    }
    ctx.stroke();
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
// Which surface a body gets. Nothing in the table marks gas giants, but the big non-moon bodies are
// exactly the gas giants (Jupiter/Saturn/Tau Ceti's gas worlds and the large outer-system planets).
function bodyKind(planet){
    if (planet.belt){ return 'belt'; }
    if (planet.size >= 1 && !planet.moon){ return 'gas'; }
    return 'rock';
}

// Surfaces are drawn from a small pool rather than one per body: a texture is a megabyte-scale
// canvas, and there are well over a hundred bodies on the map. Each body picks its variant from its
// own seed, so it always gets the same face and its neighbours rarely match.
const PLANET_VARIANTS = 8;

// Color-free overlay for a planet, moon or belt body: surface detail, then the light and shade that
// turn a flat disc into a lit ball. Lit from the upper left throughout, so the whole map reads as
// one scene rather than each body having its own sun.
function planetTexture(kind, seed){
    let variant = (seed >>> 0) % PLANET_VARIANTS;
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

    if (kind === 'gas'){
        // Cloud bands of alternating brightness, varying in depth so they don't look striped.
        for (let y = 0; y < S; ){
            let h = S * (0.05 + rnd() * 0.1);
            x.fillStyle = rnd() < 0.5
                ? `rgba(255,255,255,${(0.05 + rnd() * 0.1).toFixed(3)})`
                : `rgba(0,0,0,${(0.05 + rnd() * 0.12).toFixed(3)})`;
            x.fillRect(0, y, S, h);
            y += h;
        }
    }
    else {
        // Rocky: soft mottled patches. Belts get more, smaller ones so they read as rubble.
        let blobs = kind === 'belt' ? 26 : 14;
        for (let i = 0; i < blobs; i++){
            let bx = rnd() * S, by = rnd() * S;
            let br = S * (kind === 'belt' ? 0.03 + rnd() * 0.05 : 0.07 + rnd() * 0.14);
            let g = x.createRadialGradient(bx, by, 0, bx, by, br);
            g.addColorStop(0, rnd() < 0.6
                ? `rgba(0,0,0,${(0.1 + rnd() * 0.18).toFixed(3)})`
                : `rgba(255,255,255,${(0.07 + rnd() * 0.12).toFixed(3)})`);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            x.fillStyle = g;
            x.beginPath();
            x.arc(bx, by, br, 0, Math.PI * 2);
            x.fill();
        }
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
function drawBody(ctx, x, y, r, color, opts){
    opts = opts || {};
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
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
    if (r * mapScale >= 2.5){
        ctx.drawImage(planetTexture(opts.kind, opts.seed), x - r, y - r, r * 2, r * 2);
    }
}

export function drawMap() {
    let canvas = document.getElementById("mapCanvas");
    let ctx = canvas.getContext("2d");
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;

    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(mapShift.x, mapShift.y);
    ctx.scale(mapScale, mapScale);
    camUpdate();
    const ORIGIN = { x: 0, y: 0, z: 0 };
    // The home system hangs off the Sun at the origin, so one test covers its orbits, bodies and
    // labels alike.
    const homeCulled = starCulled(ORIGIN);

    // Calculate positions
    let planetLocation = {};
    for (let [id, planet] of Object.entries(spacePlanetStats)) {
        planetLocation[id] = genXYcoord(id);
    }

    // Draw orbits
    ctx.lineWidth = 1 / mapScale;
    ctx.strokeStyle = "#c0c0c0";
    for (let [id, planet] of Object.entries(spacePlanetStats)) {
        if (homeCulled){ break; }
        if (planet.star){ continue; }   // Tau Ceti orbits are drawn separately in a star-local frame
        if (actions.space[id] && actions.space[id].info.showDest && !actions.space[id].info.showDest().r){ continue; }
        if (!planet.moon && !planet.startype) {
            if (planet.belt || (global.race['orbit_decayed'] && id === 'spc_home')){
                ctx.setLineDash([0.01, 0.01]);
            }
            else {
                ctx.setLineDash([]);
            }
            strokeOrbit(ctx, id, ORIGIN);
        }
    }
    ctx.setLineDash([]);

    // Ship trail
    ctx.fillStyle = "#0000ff";
    ctx.strokeStyle = "#0000ff";
    for (let ship of global.space.shipyard.ships) {
        if (ship.transit > 0) {
            // Draw in the ship's reference-star frame (see shipRefStar): a pure translation of every
            // point, so the trail geometry is unchanged but the coordinates near the ship stay small.
            let ref = shipRefStar(ship);
            ctx.save();
            ctx.translate(pX(ref), pY(ref));
            ctx.beginPath();
            ctx.setLineDash([0.1, 0.4]);
            let here = rel(ship.xy, ref);
            ctx.moveTo(pX(here), pY(here));
            if (ship.path){
                // Multi-leg wormhole route: draw the full remaining flight path through each
                // waypoint still ahead of the ship (entry gate -> exit gate -> destination).
                let trip = ship.dist > 0 ? 1 - (ship.transit / ship.dist) : 0;
                for (let i=0; i<ship.path.length; i++){
                    if (ship.path[i].tn > trip){
                        let q = rel(ship.path[i], ref);
                        ctx.lineTo(pX(q), pY(q));
                    }
                }
            }
            else {
                let q = rel(ship.destination, ref);
                ctx.lineTo(pX(q), pY(q));
            }
            ctx.stroke();
            ctx.restore();
        }
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
        else if (spacePlanetStats[id].hz){
            color = '3fa34d';   // habitable-zone planet (greenish)
        }
        return color;
    }

    // Planets and moons, drawn back to front so a body in front of another covers it once the map is
    // tilted. The moon nudges stay in screen space, as they always were — they exist to stop a moon
    // sitting exactly on its planet, and that job is the same whatever angle the map is turned to.
    {
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
            let size = planet.size / 10;
            if (planet.moon) {
                switch (id){
                    case 'spc_moon':
                        bx += 0.05; by += 0.05;
                        break;
                    case 'spc_titan':
                        bx -= 0.2; by -= 0.2;
                        break;
                    default:
                        bx += 0.2; by += 0.2;
                        break;
                }
            }
            else if (planet.startype) {
                // The Sun (a star) keeps a minimum on-screen radius so it stays visible when zoomed out.
                size = Math.max(planet.size / 10, 1 / mapScale);
            }
            bodies.push({ id, planet, bx, by, size, d: pD(p) });
        }
        bodies.sort((a,b) => b.d - a.d);   // furthest first, so nearer bodies paint over them
        for (let b of bodies){
            drawBody(ctx, b.bx, b.by, b.size, setColor(b.id), { star: !!b.planet.startype, gate: !!b.planet.gate, kind: bodyKind(b.planet), seed: texSeed(b.id) });
        }
    }

    // Ships
    ctx.fillStyle = "#0000ff";
    ctx.strokeStyle = "#0000ff";
    for (let ship of global.space.shipyard.ships) {
        if (ship.transit > 0) {
            let ref = shipRefStar(ship);
            let here = rel(ship.xy, ref);
            ctx.save();
            ctx.translate(pX(ref), pY(ref));
            ctx.beginPath();
            ctx.arc(pX(here), pY(here), 0.1, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.restore();
        }
    }

    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';

    ctx.fillStyle = "#009aff";
    ctx.font = `${20 / mapScale}px serif`;
    // Ship names
    for (let ship of global.space.shipyard.ships) {
        if (ship.transit > 0) {
            let ref = shipRefStar(ship);
            let here = rel(ship.xy, ref);
            ctx.save();
            ctx.translate(pX(ref), pY(ref));
            ctx.fillText(ship.name, pX(here) + 0.15, pY(here) - 0.15);
            ctx.restore();
        }
    }

    ctx.fillStyle = "#ffa500";
    ctx.font = `${25 / mapScale}px serif`;
    ctx.textAlign = 'center';   // labels are centered horizontally above the item they label
    // Planet labels clutter once zoomed out past labelMinScale, so they are hidden below it; star
    // labels are kept (stars stay visible at any zoom).
    // Planet names
    for (let [id, planet] of Object.entries(spacePlanetStats)) {
        if (homeCulled){ break; }
        if (planet.star || planet.startype){ continue; }   // all star labels handled separately (below)
        if (mapScale < labelMinScale){ continue; }   // zoomed out: planet names give way to star labels
        if (actions.space[id] && (actions.space[id].info.showDest ? actions.space[id].info.showDest().l : global.settings.space[id.substring(4)]) ){
            if (global.race['orbit_decayed'] && ['spc_home'].includes(id)){
                continue;
            }
            let nameRef = actions.space[id].info.name;
            let nameText = typeof nameRef === "function" ? nameRef() : nameRef;
            let lx = pX(planetLocation[id]), ly = pY(planetLocation[id]);
            if (planet.moon) {
                switch (id){
                    case 'spc_moon':
                        ctx.fillText(nameText, lx + 0.1, ly + 0.1);
                        break;
                    case 'spc_titan':
                        ctx.fillText(nameText, lx - 0.3, ly - 0.3);
                        break;
                    default:
                        ctx.fillText(nameText, lx + 0.25, ly + 0.2);
                        break;
                }
            } else {
                ctx.fillText(nameText, lx, ly - (0.2 * planet.size));
            }
        }
    }
    // The Sun's label (home frame, at the origin): the cluster name (label) when zoomed out, and the
    // per-star name (zlabel) when zoomed in — opposite zoom ranges, so exactly one shows.
    {
        let sunText = mapScale < labelMinScale ? spacePlanetStats.spc_sun.label : spacePlanetStats.spc_sun.zlabel;
        if (sunText && !homeCulled){
            // Sit just above the drawn dot (its radius + a small screen-constant gap) so the label
            // stays close to the star at any zoom.
            ctx.fillText(sunText, pX(planetLocation.spc_sun), pY(planetLocation.spc_sun) - (Math.max(spacePlanetStats.spc_sun.size / 10, 1 / mapScale) + 2 / mapScale));
        }
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
        .filter(([starId, star]) => star.startype && starId !== 'spc_sun' && !starCulled(genXYcoord(starId)))
        .map(entry => ({ entry, d: pD(genXYcoord(entry[0])) }))
        .sort((a,b) => b.d - a.d)
        .map(s => s.entry);
    for (let [starId, star] of starOrder) {
        let sc = genXYcoord(starId);
        ctx.save();
        ctx.translate(pX(sc), pY(sc));
        ctx.shadowColor = 'transparent';

        // Orbits of bodies around this star. Traced through orbitPoint in the star's own frame, so
        // the eccentricity, off-centre focus and inclination all come from the one place that
        // positions the bodies themselves.
        ctx.lineWidth = 1 / mapScale;
        ctx.strokeStyle = "#c0c0c0";
        for (let [id, planet] of Object.entries(spacePlanetStats)) {
            if (planet.star !== starId || (planet.unlock && !global.tech[planet.unlock])){ continue; }
            ctx.setLineDash(planet.belt ? [0.01, 0.01] : []);
            strokeOrbit(ctx, id, sc);
        }
        ctx.setLineDash([]);

        // The star and everything orbiting it, drawn back to front. The star goes in the same sorted
        // list rather than being painted first: it sits at the centre of these orbits, so half of
        // every orbit passes in front of it and half behind, and drawing it up front would let a
        // planet on the far side show through it. An invisible barycenter (hidden) is left out —
        // only its orbiting bodies are drawn. A body with `bodystar` renders as a star (color by its
        // spectral type, keeps the zoom-out minimum radius) rather than a plain planet dot.
        let members = [];
        if (!star.hidden){
            members.push({ id: starId, planet: star, q: { x: 0, y: 0, z: 0 }, isStar: true,
                pr: Math.max(star.size / 10, 1 / mapScale) });
        }
        for (let [id, planet] of Object.entries(spacePlanetStats)) {
            if (planet.star !== starId || (planet.unlock && !global.tech[planet.unlock])){ continue; }
            let q = rel(genXYcoord(id), sc);
            members.push({ id, planet, q, pr: planet.bodystar ? Math.max(planet.size / 10, 1 / mapScale) : planet.size / 10 });
        }
        members.sort((a,b) => pD(b.q) - pD(a.q));   // furthest first
        for (let m of members){
            let px = pX(m.q), py = pY(m.q);
            drawBody(ctx, px, py, m.pr, setColor(m.id), { star: m.isStar || !!m.planet.bodystar, kind: bodyKind(m.planet), seed: texSeed(m.id) });
            // Tau Ceti's jump gate rides alongside the home planet like a moon.
            if (m.id === 'tau_home' && tauJumpGate()){
                drawBody(ctx, px + m.pr * 0.9, py + m.pr * 0.9, m.pr * 0.35, '31a557', { gate: true, seed: texSeed('tau_home_jump_gate') });
            }
        }

        // Names
        ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.shadowBlur = 2; ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.fillStyle = "#ffa500";
        ctx.font = `${25 / mapScale}px serif`;
        // Cluster name (label) when zoomed out; per-star name (zlabel, which distinguishes companions
        // like "Sirius A" / "Sirius B") when zoomed in. Opposite zoom ranges, so at most one shows.
        {
            let starText = mapScale < labelMinScale ? star.label : star.zlabel;
            // Sit just above the drawn dot (its radius + a small screen-constant gap) so the label
            // stays close to the star at any zoom.
            if (starText){ ctx.fillText(starText, 0, -(Math.max(star.size / 10, 1 / mapScale) + 2 / mapScale)); }
        }
        // Labels for bodies that are themselves stars (e.g. a binary orbiting an invisible barycenter):
        // label when zoomed out, zlabel when zoomed in — drawn just above the body at its orbit position.
        for (let [id, planet] of Object.entries(spacePlanetStats)) {
            if (planet.star !== starId || !planet.bodystar){ continue; }
            let bt = mapScale < labelMinScale ? planet.label : planet.zlabel;
            if (!bt){ continue; }
            let q = rel(genXYcoord(id), sc);
            ctx.fillText(bt, pX(q), pY(q) - (Math.max(planet.size / 10, 1 / mapScale) + 2 / mapScale));
        }
        for (let [id, planet] of Object.entries(spacePlanetStats)) {
            if (planet.star !== starId || (planet.unlock && !global.tech[planet.unlock])){ continue; }
            if (mapScale < labelMinScale){ continue; }
            if (!actions.tauceti[id] || !actions.tauceti[id].info){ continue; }
            let q = rel(genXYcoord(id), sc);
            ctx.fillText(actions.tauceti[id].info.name(), pX(q), pY(q) - (0.2 * planet.size));
        }

        ctx.restore();
    }

    ctx.restore();
}

function buildSolarMap(parentNode) {
    let currentNode = $(`<div style="margin-top: 10px; margin-bottom: 10px;"></div>`).appendTo(parentNode);
    let canvasOffset = {};
    let dragOffset = {};
    let spin = {};
    let drag = false;       // false | 'pan' | 'rotate'
    mapShift = {};
    mapScale = 20.0;
    // The map always opens looking straight down, however it was left last time.
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
            let p = genXYcoord(id);
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

    currentNode.append(
      $(`<canvas id="mapCanvas" style="width: 100%; height: 75vh"></canvas>`)
        .on("mouseup mouseover mouseout", () => drag = false)
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
            dragOffset.x = e.clientX - mapShift.x;
            dragOffset.y = e.clientY - mapShift.y;
        })
        .on("mousemove", (e) => {
            if (drag === 'pan') {
                mapShift.x = e.clientX - dragOffset.x;
                mapShift.y = e.clientY - dragOffset.y;
                refocus();
                drawMap();
            }
            else if (drag === 'rotate') {
                mapYaw = spin.yaw + (e.clientX - spin.x) * ROTATE_RATE;
                // Clamped to a quarter turn either way: at 90 degrees the reference plane is exactly
                // edge-on, and past that the map would simply be upside down.
                mapPitch = Math.min(Math.PI / 2, Math.max(-Math.PI / 2, spin.pitch + (e.clientY - spin.y) * ROTATE_RATE));
                camUpdate();
                recenterOn(mapFocus);
                drawMap();
            }
        })
        .on("wheel", (e) => {
            if(e.originalEvent.deltaY < 0) {
                mapScale /= 0.8;
                mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) / 0.8;
                mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) / 0.8;
                drawMap();
            }
            else {
                mapScale *= 0.8;
                mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) * 0.8;
                mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) * 0.8;
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
            recenterOn(genXYcoord('spc_sun'));
            drawMap();
        })
    );

    // Center on the Tau Ceti star: only available (and only useful) once the system is unlocked.
    if (global.tech['tau_home'] && global.tech.tau_home >= 2){
        $(`<input type="button" value="${loc('tab_tauceti')}" style="position: absolute; height: 30px; top: 34px; left: 2px;">`)
            .on("click", () => {
                mapScale = 20.0;
                recenterOn(genXYcoord('tauceti'));
                drawMap();
            })
            .appendTo(currentNode);
    }

    // Level the camera without disturbing where the player has panned and zoomed to.
    $(`<input type="button" value="${loc('solar_map_reset_view')}" style="position: absolute; height: 30px; top: 66px; left: 2px;">`)
        .on("click", () => {
            mapYaw = 0;
            mapPitch = 0;
            camUpdate();
            recenterOn(mapFocus);
            drawMap();
        })
        .appendTo(currentNode);

    let bounds = document.getElementById("mapCanvas").getBoundingClientRect();
    canvasOffset.x = bounds.width / 2;
    canvasOffset.y = bounds.height / 2;
    // Once adv shipyard is unlocked open the map focused on the Tau Ceti star instead of the Sun.
    recenterOn(genXYcoord(global.tech['resettle'] ? 'tauceti' : 'spc_sun'));

    drawMap();
}

function solarModal(){
    $('#modalBox').append($('<p id="modalBoxTitle" class="has-text-warning modalTitle">Solar System</p>'));
    buildSolarMap($(`#modalBox`));
}

// Populate the ship dispatch modal with a button for each valid destination.
function shipDispatchModal(id, modal){
    let ship = global.space.shipyard.ships[id];
    if (!ship){ return; }

    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('outer_shipyard_dispatch',[ship.name])}</p>`));

    // Ship stats — mirrors the fleet row readout so the player can weigh the ship before dispatching it.
    let fuel = shipFuelUse(ship);
    let fuelText = fuel.res ? `${fuel.burn} ${global.resource[fuel.res].name}/s` : `N/A`;
    let speed = Math.round((149597870.7/225/24/3600) * shipSpeed(ship));
    let hullClass = ship.damage <= 10 ? `has-text-success` : (ship.damage >= 65 ? `has-text-danger` : (ship.damage >= 40 ? `has-text-caution` : ``));
    let stats = $(`<div class="shipDispatchStats"></div>`);
    stats.append(`<span><span class="has-text-warning">${loc('crew')}</span> <span class="pad">${shipCrewSize(ship)}</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('firepower')}</span> <span class="pad">${shipAttackPower(ship)}</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('outer_shipyard_sensors')}</span> <span class="pad">${sensorRange(ship)}km</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('speed')}</span> <span class="pad">${speed}km/s</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('outer_shipyard_fuel')}</span> <span class="pad">${fuelText}</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('outer_shipyard_hull')}</span> <span class="pad ${hullClass}">${100 - ship.damage}%</span></span>`);
    $('#modalBox').append(stats);

    let list = $(`<div class="shipDispatch"></div>`);
    $('#modalBox').append(list);

    const spaceRegions = spaceTech();
    let dests = [];
    if (ship.class === 'explorer'){
        if (ship.location !== 'tauceti'){
            dests.push({ region: 'tauceti', name: loc('tech_era_tauceti') });
        }
    }
    else {
        Object.keys(spaceRegions).forEach(function(region){
            if (ship.location !== region){
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
            if (ship.location !== region){
                if (tauCetiModules[region].info.nav()){
                    let name = typeof tauCetiModules[region].info.name === 'string' ? tauCetiModules[region].info.name : tauCetiModules[region].info.name();
                    dests.push({ region: region, name: name });
                }
            }
        });
    }

    if (dests.length === 0){
        list.append(`<span class="has-text-caution">${loc('outer_shipyard_dispatch_none')}</span>`);
    }
    else {
        dests.forEach(function(d){
            let days = planShipTrip(ship, d.region).transit;
            $(`<button class="button is-info ${d.region}"><span class="dispatchName">${d.name}</span><span class="dispatchDays has-text-caution">${loc('transit_time',[days])}</span></button>`)
                .on('click', function(){
                    sendShipTo(id, d.region);
                    if (modal && modal.close){ modal.close(); }
                })
                .appendTo(list);
        });
    }
}

// Send a ship to a destination region.
function sendShipTo(id, l){
    let ship = global.space.shipyard.ships[id];
    if (!ship || l === ship.location){ return; }
    let crew = shipCrewSize(ship);
    let manned = ship.transit > 0 || (ship.location !== 'spc_dwarf' && ship.location !== 'tau_gas2');
    if (manned || global.civic.garrison.workers - global.civic.garrison.crew >= crew){
        let trip = planShipTrip(ship, l);
        ship.location = l;
        ship.transit = trip.transit;
        ship.dist = trip.dist;
        ship.origin = trip.origin;
        ship.destination = trip.destination;
        ship.path = trip.path;
        if (!manned){
            global.civic.garrison.crew += crew;
        }
        drawShips();
    }
}
