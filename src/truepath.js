import { global, p_on, support_on, sizeApproximation, quantum_level } from './vars.js';
import { vBind, clearElement, popover, clearPopper, messageQueue, powerCostMod, powerModifier, spaceCostMultiplier, deepClone, calcPrestige, flib, darkEffect, adjustCosts } from './functions.js';
import { races, traits } from './races.js';
import { spatialReasoning } from './resources.js';
import { armyRating, garrisonSize } from './civics.js';
import { jobScale, job_desc, loadFoundry } from './jobs.js';
import { production, highPopAdjust } from './prod.js';
import { actions, payCosts, powerOnNewStruct, setAction, drawTech, bank_vault, buildTemplate, casinoEffect, housingLabel } from './actions.js';
import { fuel_adjust, int_fuel_adjust, spaceTech, renderSpace, checkRequirements, planetName } from './space.js';
import { removeTask, govActive } from './governor.js';
import { defineIndustry, nf_resources } from './industry.js';
import { arpa } from './arpa.js';
import { matrix, retirement, gardenOfEden } from './resets.js';
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
            syndicate(){ return global.tech['titan'] && global.tech.titan >= 3 && global.tech['enceladus'] && global.tech.enceladus >= 2 ? true : false; },
            syndicate_cap(){
                if (global.tech['triton']){
                    return global.tech.outer >= 4 ? 2000 : 1000;
                }
                return 600;
            }
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
                Helium_3(offset,wiki){ return +fuel_adjust(250000,false,wiki).toFixed(0); },
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
                    global.space.titan_spaceport.count++;
                    powerOnNewStruct($(this)[0]);
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
                let support = `<div>+${loc(`galaxy_alien2_support`,[$(this)[0].support(),planetName().titan])}</div>`;
                return `${support}<div class="has-text-caution">${loc('space_electrolysis_use',[$(this)[0].support_fuel().a,global.resource.Water.name,$(this)[0].powered()])}</div>`;
            },
            support(){
                return global.tech['titan_ai_core'] && global.tech.titan_ai_core >= 2 && p_on['ai_core2'] ? 3 : 2;
            },
            support_fuel(){ return { r: 'Water', a: 35 }; },
            powered(){ return powerCostMod(8); },
            action(){
                if (payCosts($(this)[0])){
                    global.space.electrolysis.count++;
                    powerOnNewStruct($(this)[0]);
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
            support(){ return -1; },
            support_fuel(){ return [{ r: 'Water', a: 12 },{ r: 'Food', a: 500 }]; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.space.titan_quarters.count++;
                    global.civic.titan_colonist.display = true;
                    if (global.space.electrolysis.support < global.space.electrolysis.s_max){
                        global.space.titan_quarters.on++;
                        global.resource[global.race.species].max += jobScale(1);
                        if (global.civic[global.civic.d_job].workers > 0){
                            let hired = global.civic[global.civic.d_job].workers - jobScale(1) < 0 ? global.civic[global.civic.d_job].workers : jobScale(1);
                            global.civic[global.civic.d_job].workers -= hired;
                            global.civic.titan_colonist.workers += hired;
                        }
                    }
                    return true;
                }
                return false;
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
            title: loc('space_red_mine_title'),
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
            effect(){
                let storage = '<div class="aTable">';
                let multiplier = tpStorageMultiplier('storehouse',false);
                let h_multiplier = tpStorageMultiplier('storehouse',true);
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
                    global.space.storehouse.count++;
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
                Money(offset){ return spaceCostMultiplier('titan_bank', offset, 2500000, 1.32); },
                Titanium(offset){ return spaceCostMultiplier('titan_bank', offset, 380000, 1.32); },
                Neutronium(offset){ return spaceCostMultiplier('titan_bank', offset, 5000, 1.32); }
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
                    global.space.titan_bank.count++;
                    return true;
                }
                return false;
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
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            special: true,
            action(){
                if (payCosts($(this)[0])){
                    global.space.g_factory.count++;
                    global.resource.Graphene.display = true;
                    if (global.space.electrolysis.support < global.space.electrolysis.s_max){
                        global.space.g_factory.on++;
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
                    global.space.sam.count++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
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
            effect(){
                let cipher = $(this)[0].support_fuel().a;
                let know = 2500;
                if (global.race['high_pop']){
                    know = highPopAdjust(know);
                }
                if (p_on['ai_core2']){
                    know *= 1.25;
                }
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().titan])}</div>`;
                desc += `<div>${loc('space_red_exotic_lab_effect1',[know])}</div>`;
                return desc + `<div class="has-text-caution">${loc('spend',[cipher,global.resource[$(this)[0].support_fuel().r].name])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            support_fuel(){ return { r: 'Cipher', a: 0.06 }; },
            action(){
                if (payCosts($(this)[0])){
                    global.space.decoder.count++;
                    if (global.space.electrolysis.support < global.space.electrolysis.s_max){
                        global.space.decoder.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        ai_core: {
            id: 'space-ai_core',
            title: loc('space_ai_core'),
            desc(wiki){
                if (!global.space.hasOwnProperty('ai_core') || global.space.ai_core.count < 100 || wiki){
                    return `<div>${loc('space_ai_core')}</div><div class="has-text-special">${loc('requires_segmemts',[100])}</div>` + (global.space.hasOwnProperty('ai_core') && global.space.ai_core.count >= 100 ? `<div class="has-text-special">${loc('requires_power')}</div>` : ``);
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
                let count = ((wiki || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0));
                if (count < 100){
                    let remain = 100 - count;
                    effectText += `<div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return outerTruth.spc_titan.ai_core2.effect();
                }
                return effectText;
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.space.ai_core.count < 100){
                        global.space.ai_core.count++;
                        if (global.space.ai_core.count >= 100){
                            global.tech['titan_ai_core'] = 1;
                            global.space['ai_core2'] = { count: 1, on: 0 };
                            if (global.city.power >= outerTruth.spc_titan.ai_core2.powered()){
                                global.space.ai_core2.on++;
                            }
                            renderSpace();
                            drawTech();
                        }
                        return true;
                    }
                }
                return false;
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
            effect(){
                let value = 25;
                let desc = `<div class="has-text-warning">${loc('interstellar_citadel_stat',[+(quantum_level).toFixed(1)])}</div>`;
                desc += `<div>${loc('interstellar_citadel_effect',[value])}</div><div>${loc('space_ai_core_effect2',[value])}</div>`;
                if (global.tech['titan_ai_core'] && global.tech.titan_ai_core >= 2){
                    desc += `<div>${loc('space_ai_core_effect3',[50])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('space_electrolysis_use',[$(this)[0].p_fuel().a,global.resource[$(this)[0].p_fuel().r].name,$(this)[0].powered()])}</div>`;
                if (global.tech['titan_ai_core'] && global.tech.titan_ai_core >= 3){
                    let drift = +calcAIDrift().toFixed(1);
                    desc += `<div class="has-text-advanced">${loc('space_ai_core_effect4',[drift])}</div>`;
                }
                return desc;
            },
            action(){
                return false;
            },
            flair(){
                return global.space.hasOwnProperty('ai_core2') && global.space.ai_core2.on >= 1 ? loc(`space_ai_core_flair`) : loc(`space_ai_core_flair2`);
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
                    global.space.ai_colonist.count++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            flair: loc(`tech_combat_droids_flair`)
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
            syndicate(){ return global.tech['titan'] && global.tech.titan >= 3 && global.tech['enceladus'] && global.tech.enceladus >= 2 ? true : false; },
            syndicate_cap(){
                if (global.tech['triton']){
                    return global.tech.outer >= 4 ? 1500 : 1000;
                }
                return 600;
            }
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
            support(){ return -1; },
            powered(){ return powerCostMod(12); },
            action(){
                if (payCosts($(this)[0])){
                    global.space.zero_g_lab.count++;
                    if (global.space.titan_spaceport.support < global.space.titan_spaceport.s_max){
                        global.space.zero_g_lab.on++;
                    }
                    return true;
                }
                return false;
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
                desc += loc('plus_max_resource',[jobScale(4),loc('civics_garrison_soldiers')]);
                return desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(10); },
            action(){
                if (payCosts($(this)[0])){
                    global.space.operating_base.count++;
                    if (global.space.titan_spaceport.support < global.space.titan_spaceport.s_max){
                        global.space.operating_base.on++;
                    }
                    return true;
                }
                return false;
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
                    global.space.munitions_depot.count++;
                    global.resource.Crates.max += 25;
                    global.resource.Containers.max += 25;
                    return true;
                }
                return false;
            }
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
            syndicate(){ return global.tech['triton'] && global.tech.triton >= 2 ? true : false; },
            syndicate_cap(){ return global.tech['outer'] && global.tech.outer >= 4 ? 5000 : 3000; },
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
                desc += loc('plus_max_resource',[jobScale(10),loc('civics_garrison_soldiers')]);
                desc += `<div class="has-text-warning"><span class="soldier">${loc('civics_garrison_soldiers')}:</span> <span>${troops}</span> / <span>${max_troops}<span></div>`;
                desc += `<div class="has-text-warning"><span class="wounded">${loc('civics_garrison_wounded')}:</span> <span>${global.civic['garrison'] ? global.civic.garrison.wounded : 0}</span></div>`;
                desc += `<div class="has-text-warning">${loc('space_fob_landed',[global.space['fob'] ? global.space.fob.troops : 0])}</div>`;
                let helium = +(fuel_adjust(125,true,wiki)).toFixed(2);
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),helium,global.resource.Helium_3.name])}</div>`;
            },
            powered(){ return powerCostMod(50); },
            action(){
                if (global.space.fob.count < 1 && payCosts($(this)[0])){
                    global.space.fob.count++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            post(){
                if (global.tech['triton'] === 2){
                    global.tech['triton'] = 3;
                    drawTech();
                    renderSpace();
                    messageQueue(loc('space_fob_msg'),'info',false,['progress']);
                }
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
            powered(){ return powerCostMod(1); },
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
                    global.space.lander.count++;
                    global.space.lander.on++;
                    return true;
                }
                return false;
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
            syndicate(){ return global.tech['kuiper'] ? true : false; },
            syndicate_cap(){ return 2500; },
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
                    global.space['orichalcum_mine'] = { count: 0, on: 0 };
                    global.space['uranium_mine'] = { count: 0, on: 0 };
                    global.space['neutronium_mine'] = { count: 0, on: 0 };
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
                let desc = `<div>${loc('gain',[mineral,loc('resource_Orichalcum_name')])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(10); },
            p_fuel(){ return { r: 'Oil', a: 200 }; },
            action(){
                if (payCosts($(this)[0])){
                    global.space.orichalcum_mine.count++;
                    global.resource.Orichalcum.display = true;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
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
                let desc = `<div>${loc('gain',[mineral,loc('resource_Uranium_name')])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(5); },
            p_fuel(){ return { r: 'Oil', a: 60 }; },
            action(){
                if (payCosts($(this)[0])){
                    global.space.uranium_mine.count++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
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
                let desc = `<div>${loc('gain',[mineral,loc('resource_Neutronium_name')])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(8); },
            p_fuel(){ return { r: 'Oil', a: 60 }; },
            action(){
                if (payCosts($(this)[0])){
                    global.space.neutronium_mine.count++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
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
                let desc = `<div>${loc('gain',[mineral,loc('resource_Elerium_name')])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(12); },
            p_fuel(){ return { r: 'Oil', a: 125 }; },
            action(){
                if (payCosts($(this)[0])){
                    global.space.elerium_mine.count++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
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
            syndicate(){ return global.tech['eris'] ? true : false; },
            syndicate_cap(){ return 7500; },
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
                    global.space.drone_control.count++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
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
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.space.shock_trooper.count++;
                    if (global.space.drone_control.support < global.space.drone_control.s_max){
                        global.space.shock_trooper.on++;
                    }
                    return true;
                }
                return false;
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
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.space.tank.count++;
                    if (global.space.drone_control.support < global.space.drone_control.s_max){
                        global.space.tank.on++;
                    }
                    return true;
                }
                return false;
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
            }
        },
        ringworld: {
            id: 'tauceti-ringworld',
            title: loc('tau_star_ringworld'),
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('ringworld') || global.tauceti.ringworld.count < 1000 || wiki){
                    return `<div>${loc('tau_star_ringworld')}</div><div class="has-text-special">${loc('requires_segmemts',[1000])}</div>`;
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
                let count = (wiki || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0);
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
                        global.tauceti.ringworld.count++;
                        if (global.tauceti.ringworld.count >= 1000){
                            if (global.race['lone_survivor']){
                                global.tech['eden'] = 1;
                            }
                            else {
                                global.tech.matrix = 3;
                                global.tauceti['matrix'] = { count: 1, on: 0 };
                            }
                            renderTauCeti();
                            clearPopper();
                        }
                        return true;
                    }
                }
                return false;
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
                if (o){
                    setTimeout(function(){
                        global.tech.matrix = p_on['matrix'] ? 4 : 3;
                        renderTauCeti();
                    }, 250);
                }
                else {
                    global.tech.matrix = 3;
                    renderTauCeti();
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
            support: 'orbital_station',
            extra(region){
                if (global.tech['tau_home'] && global.tech.tau_home >= 2 && !tauEnabled()){
                    $(`#${region}`).append(`<div id="${region}Mats" v-show="tauShow()" class="syndThreat has-text-warning">${loc('resource_Materials_name')} <span class="has-text-info">{{ amount | round }}</span> / <span class="has-text-info">{{ max }}</span></div>`);
                    vBind({
                        el: `#${region}Mats`,
                        data: global.resource.Materials,
                        methods: {
                            tauShow(){
                                return !tauEnabled();
                            }
                        },
                        filters: {
                            round(v){
                                return +v.toFixed(0);
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
                    global.tauceti['colony'] = { count: 0, on: 0 };
                    global.tauceti['mining_pit'] = { count: 0, on: 0 };
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
                    global.tauceti.orbital_station.count++;
                    global.tauceti.colony.count++;
                    global.tauceti.mining_pit.count++;
                    global.civic.pit_miner.display = true;
                    global.resource.Materials.display = true;
                    if (global.city.powered && global.city.power >= tauCetiModules.tau_home.orbital_station.powered()){
                        global.tauceti.orbital_station.on++;
                        global.tauceti.colony.on++;
                        global.tauceti.mining_pit.on++;
                        let jRequest = jobScale(4);
                        if (global.civic[global.civic.d_job].workers < jRequest){
                            jRequest = global.civic[global.civic.d_job].workers;
                        }
                        global.civic.pit_miner.workers += jRequest;
                        global.civic[global.civic.d_job].workers -= jRequest;
                    }
                    if (global.settings.tabLoad){
                        drawShips();
                    }
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
                desc = desc + `<div>${loc('plus_max_resource',[helium.toLocaleString(),global.resource.Helium_3.name])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend_power',[fuel,global.resource[$(this)[0].support_fuel().r].name,$(this)[0].powered()])}</div>`;
                return desc;
            },
            support_fuel(){ return { r: 'Helium_3', a: global.tech['isolation'] ? (global.race['lone_survivor'] ? 5 : 25) : 400 }; },
            support(){ return 3; },
            powered(){ return powerCostMod(global.tech['isolation'] ? (global.race['lone_survivor'] ? 4 : 6) : 30); },
            refresh: true,
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.orbital_station.count++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
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
                    desc = desc + `<div>${loc('plus_max_resource',[`\$${vault}`,loc('resource_Money_name')])}</div>`;
                }

                desc = desc + `<div>${loc('tau_home_colony_effect',[50,races[global.race.species].home])}</div>`;
                
                if (global.tech['isolation']){
                    let gasVal = govActive('gaslighter',0);
                    let mVal = (gasVal ? gasVal + global.tech.broadcast : global.tech.broadcast) * 2;
                    desc = desc + `<div>${loc('space_red_vr_center_effect1',[mVal])}</div>`;
                }
                
                desc = desc + `<div>${loc('plus_max_resource',[containers,loc('resource_Crates_name')])}</div><div>${loc('plus_max_resource',[containers,loc('resource_Containers_name')])}</div>`;

                if (global.race['lone_survivor']){
                    desc = desc + `<div>${loc('gain',[-(fuel),global.resource[$(this)[0].support_fuel().r].name])}</div>`;
                }
                else {
                    desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[$(this)[0].support_fuel().r].name])}</div>`;
                }
                return desc;
            },
            support(){ return -2; },
            support_fuel(){ return { r: 'Food', a: global.tech['isolation'] ? (global.race['lone_survivor'] ? -2 : 75) : 1000 }; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.colony.count++;
                    if (global.tauceti.orbital_station.support - $(this)[0].support() <= global.tauceti.orbital_station.s_max){
                        global.tauceti.colony.on++;
                    }
                    return true;
                }
                return false;
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
            desc: loc('city_basic_housing_desc'),
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
                    global.tauceti.tau_housing.count++;
                    return true;
                }
                return false;
            },
            citizens(){
                let pop = 1;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            }
        },
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
                    global.tauceti.pylon.count++;
                    global.resource.Mana.max += spatialReasoning(2);
                    return true;
                }
                return false;
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
                }
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            support(){ return 1; },
            powered(){ return powerModifier(global.tech['isolation'] ? 1 : 4); },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.tau_farm.count++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
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
                desc = desc + `<div>${loc('plus_max_resource',[jobScale(global.tech['isolation'] ? 6 : 8),loc('job_pit_miner')])}</div>`;
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
                        desc = desc + `<div>${loc('tau_gas_womling_station_effect',[8,global.resource.Cement.name])}</div>`;
                    }
                    else {
                        desc = desc + `<div>${loc('tau_home_mining_pit_effect2',[global.resource.Bolognium.name,global.resource.Adamantite.name,global.resource.Stone.name])}</div>`;
                    }
                }
                return desc;
            },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.mining_pit.count++;
                    if (global.tauceti.orbital_station.support - $(this)[0].support() <= global.tauceti.orbital_station.s_max){
                        global.tauceti.mining_pit.on++;
                    }
                    return true;
                }
                return false;
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
                let desc = `<div>${loc('plus_max_resource',[20+'%',loc('resource_Knowledge_name')])}</div>`;
                if (global.tech['isolation']){
                    desc = desc + `<div>${loc('plus_max_resource',[(global.race['lone_survivor'] ? 3500000 : 6500000).toLocaleString(),loc('resource_Knowledge_name')])}</div>`;
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
            }
        },
        jump_gate: {
            id: 'tauceti-jump_gate',
            title: loc('tau_jump_gate'),
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('jump_gate') || global.tauceti.jump_gate.count < 100 || wiki){
                    return `<div>${loc('tau_jump_gate')}</div><div class="has-text-special">${loc('requires_segmemts',[100])}</div>`;
                }
                else {
                    return `<div>${loc('tau_jump_gate')}</div>`;
                }
            },
            reqs: { tauceti: 3 },
            condition(){ return global.tech['isolation'] ? 0 : 1; },
            path: ['truepath'],
            queue_size: 10,
            queue_complete(){ return 100 - global.tauceti.jump_gate.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('jump_gate') ? global.tauceti.jump_gate.count : 0)) < 100 ? 1000000 : 0; },
                Materials(offset){ return ((offset || 0) + (global.tauceti.hasOwnProperty('jump_gate') ? global.tauceti.jump_gate.count : 0)) < 100 ? 12500 : 0; },
            },
            effect(wiki){
                let count = (wiki || 0) + (global.tauceti.hasOwnProperty('jump_gate') ? global.tauceti.jump_gate.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('tau_jump_gate_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return loc('tau_jump_gate_effect');
                }
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.tauceti.jump_gate.count < 100){
                        global.tauceti.jump_gate.count++;
                        return true;
                    }
                }
                return false;
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
                    global.tauceti.fusion_generator.count++;
                    global.tauceti.fusion_generator.on++;
                    return true;
                }
                return false;
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
            effect(){
                let storage = '<div class="aTable">';
                let multiplier = tpStorageMultiplier('repository');
                let containers = 250;
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let val = sizeApproximation(+(spatialReasoning($(this)[0].val(res)) * multiplier).toFixed(0),1);
                        storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                if (global.tech['isolation']){
                    storage = storage + `<span>${loc('plus_max_resource',[containers,loc('resource_Crates_name')])}</span><span>${loc('plus_max_resource',[containers,loc('resource_Containers_name')])}</span>`;
                }
                storage = storage + '</div>';
                return storage;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.repository.count++;
                    let multiplier = tpStorageMultiplier('repository');
                    for (const res of $(this)[0].res()){
                        if (global.resource[res].display){
                            global.resource[res].max += (spatialReasoning($(this)[0].val(res)) * multiplier);
                        }
                    };
                    return true;
                }
                return false;
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
                desc = desc + `<div>${loc('tau_home_tau_factory_effect',[global.tech['isolation'] ? 5 : 3])}</div>`;
                if (global.tech['isolation']){
                    desc = desc + `<div>${loc('city_cement_plant_effect1',[jobScale(2)])}</div>`;
                    desc = desc + `<div>${loc('space_red_fabrication_effect1',[jobScale(5)])}</div>`;
                }
                desc = desc + `<div>${loc('city_crafted_mats',[global.tech['isolation'] ? 275 : 90])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            special: true,
            support(){ return -1; },
            powered(){ return powerCostMod(global.tech['isolation'] ? 2 : 5); },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.tau_factory.count++;
                    if (global.tauceti.orbital_station.support - $(this)[0].support() <= global.tauceti.orbital_station.s_max){
                        global.tauceti.tau_factory.on++;
                    }
                    return true;
                }
                return false;
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
                    desc = desc + `<div>${loc('plus_max_resource',[elerium,loc('resource_Elerium_name')])}</div>`;
                    desc = desc + `<div>${loc('city_wardenclyffe_effect1',[jobScale(2), global.civic.professor.name])}</div>`;
                    desc = desc + `<div>${loc('city_wardenclyffe_effect1',[jobScale(1), global.civic.scientist.name])}</div>`;
                    desc = desc + `<div>${loc('space_zero_g_lab_effect',[jobScale(1)])}</div>`;
                    desc = desc + `<div>${loc('city_library_effect',[75])}</div>`;
                }
                if (global.tech['alien_crafting']){
                    desc = desc + `<div>${loc('tau_gas_womling_station_effect',[65,global.resource.Quantium.name])}</div>`;
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
            support(){ return -1; },
            powered(){ return powerCostMod(global.tech['isolation'] ? (global.race['lone_survivor'] ? 2 : 8) : 35); },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.infectious_disease_lab.count++;
                    if (global.tauceti.orbital_station.support - $(this)[0].support() <= global.tauceti.orbital_station.s_max){
                        global.tauceti.infectious_disease_lab.on++;
                    }
                    return true;
                }
                return false;
            },
            post(){
                if (global.tech.disease === 1){
                    global.tech.disease = 2;
                    messageQueue(loc('tau_plague4',[loc('tab_tauceti')]),'info',false,['progress']);
                    drawTech();
                }
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
                    global.tauceti.tauceti_casino.count++;
                    if (!global.race['joyless']){
                        global.civic.entertainer.max += jobScale(1);
                        global.civic.entertainer.display = true;
                    }
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
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
                desc += `<div>${loc('city_tourist_center_effect3',[cas])}</div>`;
                desc += `<div>${loc('city_tourist_center_effect4',[mon])}</div>`;
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
                    global.tauceti.tau_cultural_center.count++;
                    global.tauceti.tau_cultural_center.on++;
                    return true;
                }
                return false;
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
                    global.tauceti.orbital_platform.count++;
                    powerOnNewStruct($(this)[0]);
                    if (global.tech['tau_red'] === 1){
                        global.tech['tau_red'] = 2;
                        messageQueue(loc('tau_red_orbital_platform_msg',[loc('tau_planet',[planetName().red]),loc('tau_planet',[races[global.race.species].home])]),'info',false,['progress']);
                    }
                    return true;
                }
                return false;
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
                Food(){ return 2500000; }
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
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.overseer.count++;
                    if (global.tauceti.orbital_platform.support - $(this)[0].support() <= global.tauceti.orbital_platform.s_max){
                        global.tauceti.overseer.on++;
                    }
                    return true;
                }
                return false;
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
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.womling_village.count++;
                    if (global.tauceti.orbital_platform.support - $(this)[0].support() <= global.tauceti.orbital_platform.s_max){
                        global.tauceti.womling_village.on++;
                    }
                    return true;
                }
                return false;
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
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.womling_farm.count++;
                    if (global.tauceti.orbital_platform.support - $(this)[0].support() <= global.tauceti.orbital_platform.s_max){
                        global.tauceti.womling_farm.on++;
                    }
                    return true;
                }
                return false;
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
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.womling_mine.count++;
                    global.resource.Unobtainium.display = true;
                    if (global.tauceti.orbital_platform.support - $(this)[0].support() <= global.tauceti.orbital_platform.s_max){
                        global.tauceti.womling_mine.on++;
                    }
                    return true;
                }
                return false;
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
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.womling_fun.count++;
                    if (global.tauceti.orbital_platform.support - $(this)[0].support() <= global.tauceti.orbital_platform.s_max){
                        global.tauceti.womling_fun.on++;
                    }
                    return true;
                }
                return false;
            }
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
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.womling_lab.count++;
                    if (global.tauceti.orbital_platform.support - $(this)[0].support() <= global.tauceti.orbital_platform.s_max){
                        global.tauceti.womling_lab.on++;
                    }
                    return true;
                }
                return false;
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
            }
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
                    global.tauceti.refueling_station.count++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            post(){
                if (global.tech.tau_gas === 2){
                    global.tech.tau_gas = 3;
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
            effect(){
                let ore = global.tauceti.hasOwnProperty('ore_refinery') ? global.tauceti.ore_refinery.fill : 0;
                let max = global.tauceti.hasOwnProperty('ore_refinery') ? global.tauceti.ore_refinery.max : 0;
                let refine = +(production('ore_refinery')).toFixed(2);
                let desc = `<div>${loc('tau_gas_ore_refinery_effect',[+ore.toFixed(2)])}</div>`;
                desc = desc + `<div>${loc('tau_gas_ore_refinery_effect2',[max])}</div>`;
                desc = desc + `<div>${loc('tau_gas_ore_refinery_effect3',[refine])}</div>`;
                desc = desc + `<div>${loc('interstellar_stellar_forge_effect3',[global.tech['isolation'] ? 12 : 4])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            special: true,
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.ore_refinery.count++;
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.tauceti.ore_refinery.on++;
                        global.city.smelter.cap += global.tech['isolation'] ? 12 : 2;
                        global.city.smelter.Steel += global.tech['isolation'] ? 12 : 2;
                        if (global.race['evil']) {
                            global.city['smelter'].Wood += global.tech['isolation'] ? 12 : 2;
                        }
                        else {
                            global.city.smelter.Oil += global.tech['isolation'] ? 12 : 2;
                        }
                    }
                    return true;
                }
                return false;
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
                    global.tauceti.whaling_station.count++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
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
                let desc = `<div>${loc('tau_gas_womling_station_effect',[prod,tauCetiModules.tau_gas.info.name()])}</div>`;
                desc = desc + `<div>${loc('city_cement_plant_effect1',[jobScale(1)])}</div>`;
                desc = desc + `<div>${loc('space_red_fabrication_effect1',[jobScale(1)])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.womling_station.count++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            }
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
            support(){ return 1; },
            powered(){ return powerCostMod(1); },
            refresh: true,
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.patrol_ship.count++;
                    global.tauceti.patrol_ship.on++;
                    return true;
                }
                return false;
            }
        },
        mining_ship: {
            id: 'tauceti-mining_ship',
            title: loc('tau_roid_mining_ship'),
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
            support_fuel(){ return { r: 'Helium_3', a: global.tech['isolation'] ? 12 : 75 }; },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            special: true,
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.mining_ship.count++;
                    global.tauceti.mining_ship.on++;
                    return true;
                }
                return false;
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
            support_fuel(){ return { r: 'Helium_3', a: global.tech['isolation'] ? 14 : 90 }; },
            support(){ return -1; },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.tauceti.whaling_ship.count++;
                    global.tauceti.whaling_ship.on++;
                    return true;
                }
                return false;
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
            }
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
                    global.tauceti['alien_station'] = { count: 0 };
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
                let count = (wiki || 0) + (global.tauceti.hasOwnProperty('alien_station') ? global.tauceti.alien_station.count : 0);
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
                        global.tauceti.alien_station.count++;
                        if (global.tauceti.alien_station.count >= 100){
                            global.tech.tau_gas2 = 5;
                            global.tauceti['alien_space_station'] = { count: 1, on: 0 };
                        }
                        return true;
                    }
                }
                return false;
            },
            post(){
                if (global.resource.Elerium.diff >= 10){
                    global.tauceti.alien_space_station.on = 1; 
                }
                renderTauCeti();
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
                return desc;
            },
            p_fuel(){ return { r: 'Elerium', a: (global.race['lone_survivor'] ? 1 : 10) }; },
            powered(){ return powerModifier(-75); },
            action(){
                return false;
            }
        },
        matrioshka_brain: {
            id: 'tauceti-matrioshka_brain',
            title: loc('tech_matrioshka_brain'),
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('matrioshka_brain') || global.tauceti.matrioshka_brain.count < 1000 || wiki){
                    return `<div>${loc('tech_matrioshka_brain')}</div><div class="has-text-special">${loc('requires_segmemts',[1000])}</div>`;
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
                let count = (wiki || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0);
                if (count < 1000){
                    effectText += `<div class="has-text-special">${loc('tau_gas2_matrioshka_brain_seg',[1000 - count])}</div>`;
                }
                return effectText;
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.tauceti.matrioshka_brain.count < 1000){
                        global.tauceti.matrioshka_brain.count++;
                        if (global.tauceti.matrioshka_brain.count >= 1000){
                            global.tech['m_brain'] = 1;
                        }
                        return true;
                    }
                }
                return false;
            }
        },
        ignition_device: {
            id: 'tauceti-ignition_device',
            title: loc('tech_ignition_device'),
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('ignition_device') || global.tauceti.ignition_device.count < 10 || wiki){
                    return `<div>${loc('tech_ignition_device')}</div><div class="has-text-special">${loc('requires_segmemts',[10])}</div>`;
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
                let count = (wiki || 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0);
                if (count < 10){
                    effectText += `<div class="has-text-special">${loc('tau_gas2_ignition_device_seg',[10 - count])}</div>`;
                }
                return effectText;
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.tauceti.ignition_device.count < 10){
                        global.tauceti.ignition_device.count++;
                        if (global.tauceti.ignition_device.count >= 10){
                            global.tech['m_ignite'] = 1;
                        }
                        return true;
                    }
                }
                return false;
            }
        },
        ignite_gas_giant: {
            id: 'tauceti-ignite_gas_giant',
            title(){return loc('tau_gas2_ignite_gas_giant',[tauCetiModules.tau_gas2.info.name()]); },
            desc(){return loc('tau_gas2_ignite_gas_giant',[tauCetiModules.tau_gas2.info.name()]); },
            reqs: { tau_gas2: 8, m_ignite: 1 },
            grant: ['m_ignite',2],
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
                else {
                    desc = desc + `<div>${loc('tau_gas2_ignite_gas_giant_effect3')}</div>`;
                    desc += retireProjection();
                }
                return desc;
            },
            action(){
                if (global.tech['m_brain'] && payCosts($(this)[0])){
                    retirement();
                    return true;
                }
                return false;
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
                global.tauceti['refueling_station'] = { count: 0, on: 0 };
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
    let gains = calcPrestige('retire');
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
    global.tauceti['overseer'] = { count : 0, on: 0, pop: 0, working: 0, injured: 0, morale: 0, loyal: 0, prod: 0 };
    global.tauceti['womling_village'] = global.race['lone_survivor'] ? { count : 2, on: 2 } : { count : 1, on: 1 };
    global.tauceti['womling_mine'] = global.race['lone_survivor'] ? { count : 1, on: 1, miners: 0 } : { count : 0, on: 0, miners: 0 };
    global.tauceti['womling_farm'] = { count : 1, on: 1, farmers: 0 };
    global.tauceti['womling_fun'] = { count : 0, on: 0 };
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
                    filters: {
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
            power: ['solar','diesel','fission','fusion','elerium'],
            weapon: ['railgun','laser','p_laser','plasma','phaser','disruptor'],
            armor : ['steel','alloy','neutronium'],
            engine: ['ion','tie','pulse','photon','vacuum','emdrive'],
            sensor: ['visual','radar','lidar','quantum'],
        };

        Object.keys(shipConfig).forEach(function(k){
            let values = ``;
            shipConfig[k].forEach(function(v,idx){
                values += `<b-dropdown-item aria-role="listitem" v-on:click="setVal('${k}','${v}')" class="${k} a${idx}" data-val="${v}" v-show="avail('${k}','${idx}','${v}')">${loc(`outer_shipyard_${k}_${v}`)}</b-dropdown-item>`;
            });

            options.append(`<b-dropdown :triggers="['hover']" aria-role="list">
                <button class="button is-info" slot="trigger">
                    <span>${loc(`outer_shipyard_${k}`)}: {{ b.${k} | lbl('${k}') }}</span>
                </button>${values}
            </b-dropdown>`);
        });

        let assemble = $(`<div class="assemble"></div>`);
        assemble.append(`<button class="button is-info" slot="trigger" v-on:click="build()"><span>${loc('outer_shipyard_build')}</span></button>`);
        assemble.append(`<span><b-checkbox class="patrol" v-model="s.expand" v-on:input="redraw()">${loc('outer_shipyard_fleet_details')}</b-checkbox></span>`);
        assemble.append(`<span><b-checkbox class="patrol" v-model="s.sort" v-on:input="redraw()">${loc('outer_shipyard_fleet_sort')}</b-checkbox></span>`);

        plans.append(assemble);
        assemble.append(`<div><span>${loc(`outer_shipyard_park`,[planetName().dwarf])}</span><a href="#" class="solarMap" @click="trigModal">${loc(`outer_shipyard_map`)}</span></a>`);

        updateCosts();

        let modal = {
            template: '<div id="modalBox" class="modalBox"></div>'
        };

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
                },
                avail(k,i,v){
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
                        if (payCosts(false, costs)){
                            let ship = deepClone(global.space.shipyard.blueprint);
                            ship['location'] = 'spc_dwarf';
                            ship['xy'] = genXYcoord('spc_dwarf');
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
                            global.space.shipyard.blueprint.name = getRandomShipName();
                        }
                    }
                },
                trigModal(){
                    this.$buefy.modal.open({
                        parent: this,
                        component: modal
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
            return jobScale(2);
        case 'frigate':
            return jobScale(3);
        case 'destroyer':
            return jobScale(4);
        case 'cruiser':
            return jobScale(6);
        case 'battlecruiser':
            return jobScale(8);
        case 'dreadnought':
            return jobScale(10);
        case 'explorer':
            return jobScale(10);
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
        case 'disruptor':
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
        case 'emdrive':
            watts -= Math.round((ship.class !== 'explorer' && !wiki ? 1024 : 515) * use_inflate);
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
        case 'explorer':
            mass = 1;
            break;
    }

    let boost = ship.location === 'spc_dwarf' && p_on['m_relay'] && ship.transit === 0 && global.space['m_relay'] && global.space.m_relay.charged >= 10000 ? 3 : 1;
    switch (ship.engine){
        case 'ion':
            return 12 / mass * boost;
        case 'tie':
            return 22 / mass * boost;
        case 'pulse':
            return 18 / mass * boost;
        case 'photon':
            return 30 / mass * boost;
        case 'vacuum':
            return 42 / mass * boost;
        case 'emdrive':
            return 37500 / mass * boost;
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

    if (global.tech['isolation']){
        return;
    }

    let list = $('#shipList');

    if (global.space.shipyard.sort){
        let rerank = {spc_dwarf: 'a'};
        global.space.shipyard.ships = global.space.shipyard.ships.sort((a, b) => (rerank[a.location] ? rerank[a.location] : a.location).localeCompare((rerank[b.location] ? rerank[b.location] : b.location)));
    }

    const spaceRegions = spaceTech();
    for (let i=0; i<global.space.shipyard.ships.length; i++){
        let ship = global.space.shipyard.ships[i];
        if (!ship['xy']){ ship['xy'] = genXYcoord(ship.location); }
        if (!ship.hasOwnProperty('dist')){ ship['dist'] = ship['transit']; }
        if (!ship.hasOwnProperty('origin')){ ship['origin'] = ship['xy']; }
        if (!ship.hasOwnProperty('destination')){ ship['destination'] = genXYcoord(ship.location); }

        let values = ``;
        if (ship.class === 'explorer'){
            if (ship.location !== 'tauceti'){
                let name = loc('tech_era_tauceti');
                values += `<b-dropdown-item aria-role="listitem" v-on:click="setLoc('tauceti',${i})" class="tauceti">${name}</b-dropdown-item>`;
            }
        }
        else {
            Object.keys(spaceRegions).forEach(function(region){
                if (ship.location !== region){
                    if (spaceRegions[region].info.syndicate() || region === 'spc_dwarf'){
                        if (!global.race['orbit_decayed'] || (global.race['orbit_decayed'] && region !== 'spc_moon')){
                            let name = typeof spaceRegions[region].info.name === 'string' ? spaceRegions[region].info.name : spaceRegions[region].info.name();
                            values += `<b-dropdown-item aria-role="listitem" v-on:click="setLoc('${region}',${i})" class="${region}">${name}</b-dropdown-item>`;
                        }
                    }
                }
            });
        }

        let location = ship.location === 'tauceti' ? loc('tech_era_tauceti') : typeof spaceRegions[ship.location].info.name === 'string' ? spaceRegions[ship.location].info.name : spaceRegions[ship.location].info.name();

        let dispatch = `<b-dropdown id="ship${i}loc" :triggers="['hover']" aria-role="list" scrollable position="is-bottom-left">
            <button class="button is-info" slot="trigger">
                <span>${location}</span>
            </button>${values}
        </b-dropdown>`;

        if (global.space.shipyard.expand){
            let ship_class = `${loc(`outer_shipyard_engine_${ship.engine}`)} ${loc(`outer_shipyard_class_${ship.class}`)}`;
            let desc = $(`<div id="shipReg${i}" class="shipRow ship${i}"></div>`);
            let row1 = $(`<div class="row1"><span class="name has-text-caution">${ship.name}</span> <span v-show="scrapAllowed(${i})">| </span><a class="scrap${i}" v-show="scrapAllowed(${i})" @click="scrap(${i})">${loc(`outer_shipyard_scrap`)}</a> | <span class="has-text-warning">${ship_class}</span> | <span class="has-text-danger">${loc(`outer_shipyard_weapon_${ship.weapon}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_power_${ship.power}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_armor_${ship.armor}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_sensor_${ship.sensor}`)}</span></div>`);
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
                    if (global.space.shipyard.ships[id] && global.space.shipyard.ships[id].location === 'spc_dwarf'){
                        global.space.shipyard.ships.splice(id,1);
                        drawShips();
                        updateCosts();
                    }
                },
                scrapAllowed(id){
                    if (global.space.shipyard.ships[id] && global.space.shipyard.ships[id].location === 'spc_dwarf'){
                        return true;
                    }
                    return false;
                },
                setLoc(l,id){
                    let ship = global.space.shipyard.ships[id];
                    if (l !== ship.location){
                        let crew = shipCrewSize(ship);
                        let manned = ship.transit > 0 || ship.location !== 'spc_dwarf';
                        if (manned || global.civic.garrison.workers - global.civic.garrison.crew >= crew){
                            let dest = calcLandingPoint(ship, l);
                            let distance = transferWindow(ship.xy,dest);
                            let speed = shipSpeed(ship);
                            ship.location = l;
                            ship.transit = Math.round(distance / speed);
                            ship.dist = Math.round(distance / speed);
                            ship.origin = deepClone(ship.xy);
                            ship.destination = {x: dest.x, y: dest.y};
                            if (!manned){
                                global.civic.garrison.crew += crew;
                            }
                            drawShips();
                            clearPopper(`ship${id}loc${l}`);
                        }
                    }
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
                    let name = ship.class === 'explorer' ? loc('tech_era_tauceti') : typeof spaceRegions[global.space.shipyard.ships[id].location].info.name === 'string' ? spaceRegions[global.space.shipyard.ships[id].location].info.name : spaceRegions[global.space.shipyard.ships[id].location].info.name();
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

        if (ship.class === 'explorer'){
            if (ship.location !== 'tauceti'){
                popover(`ship${i}loctauceti`, function(){
                    return loc(`transit_time`,[Math.round(transferWindow(ship.xy,calcLandingPoint(ship, 'tauceti')) / shipSpeed(ship))]);
                },
                {
                    elm: `#ship${i}loc .tauceti`,
                    placement: 'left'
                });
            }
        }
        else {
            Object.keys(spaceRegions).forEach(function(region){
                if (spaceRegions[region].info.syndicate() || region === 'spc_dwarf'){
                    if (ship.location !== region){
                        popover(`ship${i}loc${region}`, function(){
                            return loc(`transit_time`,[Math.round(transferWindow(ship.xy,calcLandingPoint(ship, region)) / shipSpeed(ship))]);
                        },
                        {
                            elm: `#ship${i}loc .${region}`,
                            placement: 'left'
                        });
                    }
                }
            });
        }
    }

    dragShipList();
}

function calcLandingPoint(ship, planet) {
    if (spacePlanetStats[planet].orbit === -2 ) { return genXYcoord(planet); }
    let ship_dist = Math.sqrt(((ship.xy.x - xShift(planet)) ** 2) + (ship.xy.y ** 2));
    let ship_speed = shipSpeed(ship) / 225;
    let width = xPosition(1, planet);
    let cross1_dist = Math.abs(ship_dist - spacePlanetStats[planet].dist);
    let cross2_dist = Math.abs(ship_dist + spacePlanetStats[planet].dist);
    let cross1w_dist = Math.abs(ship_dist - spacePlanetStats[planet].dist * width);
    let cross2w_dist = Math.abs(ship_dist + spacePlanetStats[planet].dist * width);
    let cross1_days = Math.floor(Math.min(cross1_dist, cross1w_dist, cross2_dist, cross2w_dist) / ship_speed);
    let cross2_days = Math.ceil(Math.max(cross1_dist, cross1w_dist, cross2_dist, cross2w_dist) / ship_speed);
    if (ship_dist >= spacePlanetStats[planet].dist && ship_dist <= spacePlanetStats[planet].dist * width) {
        cross1_days = 0;
    }
    let planet_orbit = spacePlanetStats[planet].orbit === -1
      ? global.city.calendar.orbit
      : spacePlanetStats[planet].orbit;
    let planet_speed = 360 / planet_orbit;
    let planet_degree = (global.space.position[planet] + (cross1_days * planet_speed)) % 360;
    let rads = (Math.PI / 180);
    for (let i = cross1_days; i <= cross2_days; i++) {
        let planet_x = xPosition(Math.cos(planet_degree * rads) * spacePlanetStats[planet].dist, planet);
        planet_x += xShift(planet);
        let planet_y = Math.sin(planet_degree * rads) * spacePlanetStats[planet].dist;
        let time = Math.sqrt(((planet_x - ship.xy.x) ** 2) + ((planet_y - ship.xy.y) ** 2)) / ship_speed;
        if (time <= i) {
            return {x: planet_x, y: planet_y};
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
        global.civic.garrison.workers -= died;
        global.stats.died += died;
        global.civic.garrison.wounded -= died;

        global.space.fob.enemy -= Math.rand(0,defense);
        if (global.space.fob.enemy < 0){ global.space.fob.enemy = 0; }

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
        if (global.civic.garrison.wounded > garrisonSize(false,true)){
            global.civic.garrison.wounded = garrisonSize(false,true);
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

export const spacePlanetStats = {
    spc_sun: { dist: 0, orbit: 0, size: 2 },
    spc_home: { dist: 1, orbit: -1, size: 0.6 },
    spc_moon: { dist: 1.01, orbit: -1, size: 0.1, moon: true },
    spc_red: { dist: 1.524, orbit: 687, size: 0.5 },
    spc_hell: { dist: 0.4, orbit: 88, size: 0.4 },
    spc_venus: { dist: 0.7, orbit: 225, size: 0.5 },
    spc_gas: { dist: 5.203, orbit: 4330, size: 1.25 },
    spc_gas_moon: { dist: 5.204, orbit: 4330, size: 0.2, moon: true },
    spc_belt: { dist: 2.7, orbit: 1642, size: 0.5, belt: true },
    spc_dwarf: { dist: 2.77, orbit: 1682, size: 0.5 },
    spc_saturn: { dist: 9.539, orbit: 10751, size: 1.1 },
    spc_titan: { dist: 9.536, orbit: 10751, size: 0.2, moon: true },
    spc_enceladus: { dist: 9.542, orbit: 10751, size: 0.1, moon: true },
    spc_uranus: { dist: 19.8, orbit: 30660, size: 1 },
    spc_neptune: { dist: 30.08, orbit: 60152, size: 1 },
    spc_triton: { dist: 30.1, orbit: 60152, size: 0.1, moon: true },
    spc_kuiper: { dist: 39.5, orbit: 90498, size: 0.5, belt: true },
    spc_eris: { dist: 68, orbit: 204060, size: 0.5, size: 0.5 },
    tauceti: { dist: 752568.8, orbit: -2, size: 2 },
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
    global.space.position.spc_home = global.space.position.spc_moon;
    global.space.position.spc_gas_moon = global.space.position.spc_gas;
    global.space.position.spc_titan = global.space.position.spc_enceladus;
    global.space.position.spc_saturn = global.space.position.spc_titan;
    global.space.position.spc_neptune = global.space.position.spc_triton;
}

export function genXYcoord(planet){
    let cx = xPosition(+(Math.cos(global.space.position[planet] * (Math.PI / 180))).toFixed(5) * spacePlanetStats[planet].dist, planet);
    let cy = +(Math.sin(global.space.position[planet] * (Math.PI / 180))).toFixed(5) * spacePlanetStats[planet].dist;
    cx += xShift(planet);
    return {x: cx, y: cy};
}

function transferWindow(p1,p2){
    return Math.ceil(Math.sqrt(((p2.x - p1.x) ** 2) + ((p2.y - p1.y) ** 2)) * 225);
}

export function tpStorageMultiplier(type,heavy){
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
            if (p_on['titan_spaceport']){
                multiplier *= 1 + (p_on['titan_spaceport'] * 0.25);
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
                if (actions.city[k].cost.hasOwnProperty('Horseshoe')){
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
                    if (actions.space[sector][k].cost.hasOwnProperty('Horseshoe')){
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
        if (global.race['casting']){
            Object.keys(global.race.casting).forEach(function (c){
                global.race.casting[0] = 0;
            });
        }
    }

    global.tauceti['tauceti_casino'] = { count: 0, on: 0 };
    global.tauceti['tau_housing'] = { count: 0 };
    
    let pop = support_on['colony'] * tauCetiModules.tau_home.colony.citizens();
    if (global.resource[global.race.species].amount > pop){ global.resource[global.race.species].amount = pop; }

    removeTask('spy');
    removeTask('spyop');

    clearElement($(`#infoTimer`));
    global.race['inactive'] = inactive;
}

export function loneSurvivor(){
    if (global.race['lone_survivor']){
        global.tech['alloy'] = 1;
        global.tech['alumina'] = 2;
        global.tech['asteroid'] = 7;
        global.tech['banking'] = 11;
        global.tech['biotech'] = 1;
        global.tech['boot_camp'] = 2;
        global.tech['broadcast'] = 2;
        global.tech['cement'] = 5;
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
        global.tech['theatre'] = 3;
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

        if (global.race.universe === 'magic'){
            global.tech['gov_mage'] = 1;
            global.tech['magic'] = 4;
            global.tech['conjuring'] = 2;
            global.resource.Mana.display = true;
            global.resource.Crystal.display = true;
            global.civic.crystal_miner.display = true;
            global.tauceti['pylon'] = { count: 0 };
            global.race['casting'] = {
                farmer: 0,
                miner: 0,
                lumberjack: 0,
                science: 0,
                factory: 0,
                army: 0,
                hunting: 0,
                crafting: 0,
                total: 0,
                crafting: 0
            };
        }

        global.settings.showSpace = false;
        global.settings.showTau = true;
        global.settings.tau.home = true;

        global.settings.showCity = false;
        global.settings.showIndustry = true;
        global.settings.showPowerGrid = true;
        global.settings.showResearch = true;
        global.settings.showCivic = true;
        global.settings.showMil = true;
        global.settings.showResources = true;
        global.settings.showMarket = true;
        global.settings.showStorage = true;
        global.settings.civTabs = 1;
        global.settings.spaceTabs = 6;
        global.settings.showGenetics = true;
        global.settings.arpa.physics = true;
        global.settings.arpa.genetics = true

        //global.civic.garrison.display = true;
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
        global.resource.Cement.display = true;
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
        global.resource.Knowledge.max = 8000000;
        global.resource.Knowledge.amount = 8000000;
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

        global.resource.Food.crates = 10;
        global.resource.Food.containers = 10;
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
        global.resource.Cement.crates = 25;
        global.resource.Cement.containers = 25;
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

        if (!global.race['sappy']){
            global.civic.quarry_worker.display = true
        }
        global.civic.professor.display = true;
        global.civic.scientist.display = true;
        global.civic.cement_worker.display = true;
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
        global.city['factory'] = { count: 0, on: 0, Lux: 0, Furs: 0, Alloy: 0, Polymer: 1, Nano: 0, Stanene: 0 };
        global.city['foundry'] = { count: 0, crafting: 0, Plywood: 0, Brick: 0, Bronze: 0, Wrought_Iron: 0, Sheet_Metal: 0, Mythril: 0, Aerogel: 0, Nanoweave: 0, Scarletite: 0, Quantium: 0 };
        global.city['smelter'] = { count: 0, cap: 2, Wood: 0, Coal: 0, Oil: 2, Star: 0, StarCap: 0, Inferno: 0, Iron: 1, Steel: 1, Iridium: 0 };

        global.city['amphitheatre'] = { count: 0 };
        global.city['apartment'] = { count: 0, on: 0 };
        global.city['bank'] = { count: 0 };
        global.city['basic_housing'] = { count: 0 };
        global.city['biolab'] = { count: 0, on: 0 };
        global.city['boot_camp'] = { count: 0 };
        global.city['casino'] = { count: 0, on: 0 };
        global.city['cement_plant'] = { count: 0, on: 0 };
        global.city['coal_mine'] = { count: 0, on: 0 };
        global.city['coal_power'] = { count: 0, on: 0 };
        global.city['cottage'] = { count: 0 };
        global.city['fission_power'] = { count: 0, on: 0 };
        global.city['garrison'] = { count: 0, on: 0 };
        global.city['hospital'] = { count: 0 };
        global.city['library'] = { count: 0 };
        global.city['lumber_yard'] = { count: 0 };
        global.city['mass_driver'] = { count: 0, on: 0 };
        global.city['metal_refinery'] = { count: 0, on: 0 };
        global.city['mine'] = { count: 0, on: 0 };
        global.city['oil_depot'] = { count: 0 };
        global.city['oil_power'] = { count: 0, on: 0 };
        global.city['oil_well'] = { count: 0 };
        global.city['rock_quarry'] = { count: 0, on: 0, asbestos: 50 };
        global.city['sawmill'] = { count: 0, on: 0 };
        global.city['shed'] = { count: 0, on: 0 };
        global.city['storage_yard'] = { count: 0 };
        global.city['temple'] = { count: 0 };
        global.city['tourist_center'] = { count: 0, on: 0 };
        global.city['trade'] = { count: 0 };
        global.city['university'] = { count: 0 };
        global.city['wardenclyffe'] = { count: 0, on: 0 };
        global.city['warehouse'] = { count: 0 };
        global.city['wharf'] = { count: 0 };

        global.space['ai_colonist'] = { count: 0, on: 0 };
        global.space['ai_core'] = { count: 100 };
        global.space['ai_core2'] = { count: 0, on: 0 };
        global.space['biodome'] = { count: 0, on: 0 };
        global.space['crashed_ship'] = { count: 100 };
        global.space['decoder'] = { count: 0, on: 0 };
        global.space['digsite'] = { count: 0 };
        global.space['drone'] = { count: 0 };
        global.space['drone_control'] = { count: 0, on: 0 };
        global.space['e_reactor'] = { count: 0, on: 0 };
        global.space['electrolysis'] = { count: 0, on: 0, support: 0, s_max: 0 };
        global.space['elerium_contain'] = { count: 0, on: 0 };
        global.space['elerium_mine'] = { count: 0, on: 0 };
        global.space['elerium_ship'] = { count: 0, on: 0 };
        global.space['exotic_lab'] = { count: 0, on: 0 };
        global.space['fabrication'] = { count: 0, on: 0 };
        global.space['fob'] = { count: 0, on: 0, troops: 0, enemy: 0 };
        global.space['g_factory'] = { count: 0, on: 0, Lumber: 0, Coal: 0, Oil: 0 };
        global.space['garage'] = { count: 0 };
        global.space['gas_mining'] = { count: 0, on: 0 };
        global.space['gas_storage'] = { count: 0 };
        global.space['geothermal'] = { count: 0, on: 0 };
        global.space['gps'] = { count: 0 };
        global.space['helium_mine'] = { count: 0, on: 0 };
        global.space['hell_smelter'] = { count: 0, on: 0 };
        global.space['hydrogen_plant'] = { count: 0, on: 0 };
        global.space['iridium_mine'] = { count: 0, on: 0 };
        global.space['iridium_ship'] = { count: 0, on: 0 };
        global.space['iron_ship'] = { count: 0, on: 0 };
        global.space['lander'] = { count: 0, on: 0 };
        global.space['living_quarters'] = { count: 0, on: 0 };
        global.space['m_relay'] = { count: 0, on: 0 };
        global.space['mass_relay'] = { count: 100 };
        global.space['moon_base'] = { count: 0, on: 0, support: 0, s_max: 0 };
        global.space['munitions_depot'] = { count: 0 };
        global.space['nav_beacon'] = { count: 0, on: 0 };
        global.space['neutronium_mine'] = { count: 0, on: 0 };
        global.space['observatory'] = { count: 0, on: 0 };
        global.space['oil_extractor'] = { count: 0, on: 0 };
        global.space['operating_base'] = { count: 0, on: 0 };
        global.space['orichalcum_mine'] = { count: 0, on: 0 };
        global.space['outpost'] = { count: 0, on: 0 };
        global.space['propellant_depot'] = { count: 0 };
        global.space['red_factory'] = { count: 0, on: 0 };
        global.space['red_mine'] = { count: 0, on: 0 };
        global.space['red_tower'] = { count: 0, on: 0 };
        global.space['satellite'] = { count: 0 };
        global.space['shipyard'] = { count: 0, on: 0, ships: [], expand: false, sort: true };
        global.space['shock_trooper'] = { count: 0, on: 0 };
        global.space['space_barracks'] = { count: 0, on: 0 };
        global.space['space_station'] = { count: 0, on: 0, support: 0, s_max: 0 };
        global.space['spaceport'] = { count: 0, on: 0, support: 0, s_max: 0 };
        global.space['spc_casino'] = { count: 0, on: 0 };
        global.space['storehouse'] = { count: 0 };
        global.space['swarm_control'] = { count: 0, support: 0, s_max: 0 };
        global.space['swarm_plant'] = { count: 0 };
        global.space['swarm_satellite'] = { count: 0 };
        global.space['tank'] = { count: 0, on: 0 };
        global.space['titan_bank'] = { count: 0 };
        global.space['titan_mine'] = { count: 0, on: 0 };
        global.space['titan_quarters'] = { count: 0, on: 0 };
        global.space['titan_spaceport'] = { count: 0, on: 0, support: 0, s_max: 0 };
        global.space['uranium_mine'] = { count: 0, on: 0 };
        global.space['vr_center'] = { count: 0, on: 0 };
        global.space['water_freighter'] = { count: 0, on: 0 };
        global.space['zero_g_lab'] = { count: 0, on: 0 };
        global.space['ziggurat'] = { count: 0 };

        global.tauceti['alien_outpost'] = { count: 1, on: 1 };
        global.tauceti['colony'] = { count: 1, on: 1 };
        global.tauceti['fusion_generator'] = { count: 1, on: 1 };
        global.tauceti['infectious_disease_lab'] = { count : 0, on: 0, cure: 0 };
        global.tauceti['mining_pit'] = { count: 1, on: 1 };
        global.tauceti['orbital_platform'] = { count: 0, on: 0, support: 0, s_max: 0 };
        global.tauceti['orbital_station'] = { count: 1, on: 1, support: 0, s_max: 0 };
        global.tauceti['refueling_station'] = { count: 0, on: 0 };
        global.tauceti['repository'] = { count: 2 };
        global.tauceti['tauceti_casino'] = { count: 0, on: 0 };

        global.civic['garrison'] = {
            display: true,
            disabled: false,
            progress: 0,
            tactic: 0,
            workers: 2,
            wounded: 0,
            raid: 0,
            max: 2
        };

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

export function calcAIDrift(){
    let drift = 0;
    if (p_on['ai_colonist'] && support_on['decoder']){
        drift += p_on['ai_colonist'] * support_on['decoder'] * 0.35;
    }
    if (support_on['shock_trooper']){
        drift += support_on['shock_trooper'] * 2;
    }
    if (support_on['tank']){
        drift += support_on['tank'] * 2;
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

    // Calculate positions
    let planetLocation = {};
    for (let [id, planet] of Object.entries(spacePlanetStats)) {
        planetLocation[id] = genXYcoord(id);
    }

    // Draw orbits
    ctx.lineWidth = 1 / mapScale;
    ctx.strokeStyle = "#c0c0c0";
    for (let [id, planet] of Object.entries(spacePlanetStats)) {
        if (!planet.moon && planet.orbit !== -2) {
            ctx.beginPath();
            if (planet.belt || (global.race['orbit_decayed'] && id === 'spc_home')){
                ctx.setLineDash([0.01, 0.01]);
            }
            else {
                ctx.setLineDash([]);
            }
            let cx = xShift(id);
            ctx.ellipse(cx, 0, xPosition(planet.dist,id), planet.dist, 0, 0, Math.PI * 2, true);
            ctx.stroke();
        }
    }

    // Ship trail
    ctx.fillStyle = "#0000ff";
    ctx.strokeStyle = "#0000ff";
    for (let ship of global.space.shipyard.ships) {
        if (ship.transit > 0) {
            ctx.beginPath();
            ctx.setLineDash([0.1, 0.4]);
            ctx.moveTo(ship.xy.x, ship.xy.y);
            ctx.lineTo(ship.destination.x, ship.destination.y);
            ctx.stroke();
        }
    }

    // Planets and moons
    for (let [id, planet] of Object.entries(spacePlanetStats)) {
        if (global.race['orbit_decayed'] && ['spc_home','spc_moon'].includes(id)){
            continue;
        }
        let color = '558888';
        if (actions.space[id] && actions.space[id].info.syndicate() && global.settings.space[id.substring(4)]){
            let shift = syndicate(id);
            color = ((Math.round(255*(1-shift)) << 16) + (Math.round(255*shift) << 8)).toString(16).padStart(6, 0);
        }
        if (id === 'spc_dwarf'){
            color = '7132a8';
        }
        else if (id === 'spc_sun' || id === 'tauceti'){
            color = 'f8ff2b';
        }
        ctx.fillStyle = "#" + color;
        ctx.beginPath();
        let size = planet.size / 10;
        if (planet.moon) {
            switch (id){
                case 'spc_moon':
                    ctx.arc(planetLocation[id].x + 0.05, planetLocation[id].y + 0.05, size, 0, Math.PI * 2, true);
                    break;
                case 'spc_titan':
                    ctx.arc(planetLocation[id].x - 0.2, planetLocation[id].y - 0.2, size, 0, Math.PI * 2, true);
                    break;
                default:
                    ctx.arc(planetLocation[id].x + 0.2, planetLocation[id].y + 0.2, size, 0, Math.PI * 2, true);
                    break;
            }
        }
        else {
            let size = planet.size / 10;
            switch (id){
                case 'spc_sun':
                    ctx.arc(planetLocation[id].x, planetLocation[id].y, size, 0, Math.PI * 2, true);
                    break;
                default:
                    ctx.arc(planetLocation[id].x, planetLocation[id].y, size, 0, Math.PI * 2, true);
                    break;
            }
        }
        ctx.fill();
    }

    // Ships
    ctx.fillStyle = "#0000ff";
    ctx.strokeStyle = "#0000ff";
    for (let ship of global.space.shipyard.ships) {
        if (ship.transit > 0) {
            ctx.beginPath();
            ctx.arc(ship.xy.x, ship.xy.y, 0.1, 0, Math.PI * 2, true);
            ctx.fill();
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
            ctx.fillText(ship.name, ship.xy.x + 0.15, ship.xy.y - 0.15);
        }
    }

    ctx.fillStyle = "#ffa500";
    ctx.font = `${25 / mapScale}px serif`;
    // Planet names
    for (let [id, planet] of Object.entries(spacePlanetStats)) {
        if (actions.space[id] && global.settings.space[id.substring(4)]){
            if (global.race['orbit_decayed'] && ['spc_home'].includes(id)){
                continue;
            }
            let nameRef = actions.space[id].info.name;
            let nameText = typeof nameRef === "function" ? nameRef() : nameRef;
            if (planet.moon) {
                switch (id){
                    case 'spc_moon':
                        ctx.fillText(nameText, planetLocation[id].x + 0.1, planetLocation[id].y + 0.1);
                        break;
                    case 'spc_titan':
                        ctx.fillText(nameText, planetLocation[id].x - 0.3, planetLocation[id].y - 0.3);
                        break;
                    default:
                        ctx.fillText(nameText, planetLocation[id].x + 0.25, planetLocation[id].y + 0.2);
                        break;
                }
            } else {
                switch (id){
                    case 'spc_sun':
                        // Do Nothing
                        break;
                    default:
                        ctx.fillText(nameText, planetLocation[id].x, planetLocation[id].y - (0.2 * planet.size));
                        break;
                }
            }
        }
    }
    ctx.restore();
}

function buildSolarMap(parentNode) {
    let currentNode = $(`<div style="margin-top: 10px; margin-bottom: 10px;"></div>`).appendTo(parentNode);
    let canvasOffset = {};
    let dragOffset = {};
    let mouseDown = false;
    mapShift = {};
    mapScale = 20.0;

    currentNode.append(
      $(`<canvas id="mapCanvas" style="width: 100%; height: 75vh"></canvas>`)
        .on("mouseup mouseover mouseout", () => mouseDown = false)
        .on("mousedown", (e) => {
            mouseDown = true;
            dragOffset.x = e.clientX - mapShift.x;
            dragOffset.y = e.clientY - mapShift.y;
        })
        .on("mousemove", (e) => {
            if (mouseDown) {
                mapShift.x = e.clientX - dragOffset.x;
                mapShift.y = e.clientY - dragOffset.y;
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
        })
    );

    let bounds = document.getElementById("mapCanvas").getBoundingClientRect();
    canvasOffset.x = bounds.width / 2;
    canvasOffset.y = bounds.height / 2;
    mapShift.x = canvasOffset.x;
    mapShift.y = canvasOffset.y;

    drawMap();
}

function solarModal(){
    $('#modalBox').append($('<p id="modalBoxTitle" class="has-text-warning modalTitle">Solar System</p>'));
    buildSolarMap($(`#modalBox`));
}
