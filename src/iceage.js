import { global, seededRandom, sizeApproximation } from './vars.js';
import { loc } from './locale.js';
import { buildTemplate, actions, setAction, removeAction, payCosts, BHStorageMulti, storageMultipler, bank_vault } from './actions.js';
import { clearElement, popover, darkEffect, getShrineBonus, powerCostMod, vBind, modRes, messageQueue } from './functions.js';
import { govActive } from './governor.js';
import { production } from './prod.js';
import { spatialReasoning, } from './resources.js';
import { jobScale, workerScale } from './jobs.js';
import { garrisonSize, armorCalc, armyRating, soldierDeath } from './civics.js';
import { traits, fathomCheck, traitCostMod, planetTraits, racialTrait } from './races.js';
import { checkRequirements, incrementStruct } from './space.js';


const iceAgeModules = {
    underground:{
        gather_zone: {
            stone: buildTemplate(`stone`,'underground'),
            food: buildTemplate(`food`,'underground'),
            water: {
                id: `underground-water`,
                title(){
                    return global.tech['conjuring'] ? loc('underground_water_conjure') : loc('underground_water');
                },
                desc(){
                    let gain = $(this)[0].val(false);
                    return global.tech['conjuring'] ? loc('underground_water_conjure_desc',[gain]) : loc('underground_water_desc',[gain]);
                },
                reqs: { water: 1 },
                queue_complete(){ return 0; },
                cost: {
                    Mana(){ return global.tech['conjuring'] ? 1 : 0; },
                },
                action(args){
                    if (!global.settings.pause){
                        if(global.resource['Water'].amount < global.resource['Water'].max){
                            modRes('Water',$(this)[0].val(true),true);
                        }
                    }
                    return false;
                },
                val(spend){
                    let gain = global.race['strong'] ? traits.strong.vars()[0] : 1;
                    if (global.genes['enhance']){
                        gain *= 2;
                    }
                    if (global.tech['conjuring'] && global.resource.Mana.amount >= 1){
                        gain *= 10;
                        if (global.resource['Water'].amount < global.resource['Water'].max && spend){
                            modRes('Mana',-1,true);
                        }
                    }
                    return gain;
                },
                touchlabel: loc(`collect`)
            },
            old_device: {
                id: 'underground-old_device',
                title(){ return loc('underground_old_device') },
                desc(){ return global['resource'][global.race.species].amount >= 1 ? loc('underground_old_device_desc', [global.resource.Food.name]) : loc('underground_old_device_desc_2'); },
                type: 'food',
                reqs: { primitive: 3 },
                trait: ['artifical'],
                queue_complete(){ return 0; },
                count(){ return 1 },
                cost: {},
                effect(wiki){
                    if(global['resource'][global.race.species].amount >= 1){
                        return `<div>${loc('gain',[1, global.resource.Food.name])}</div>`;
                    }
                    return '';
                },
                action(args){
                    return false;
                }
            },
            assembly: buildTemplate(`assembly`, 'underground')
        },
        cave: {
            basic_housing: {
                id: 'underground-basic_housing',
                title(){ return loc('underground_basic_housing'); },
                desc(){ return loc('underground_basic_housing_desc'); },
                type: 'housing',
                reqs: { housing: 1 },
                cost: {
                    Money(offset){
                        offset = offset || 0;
                        if ((global.underground['basic_housing']?.count || 0) + offset >= 2){
                            return undergroundCostMultiplier('basic_housing', offset, 60, 1.55, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Stone(offset){ 
                        offset = offset || 0;
                        if ((global.underground['basic_housing']?.count || 0) + offset >= 2){
                            return undergroundCostMultiplier('basic_housing', offset, 120, 1.45, 'cave');
                        }
                        else {
                            return undergroundCostMultiplier('basic_housing', offset, 20, 1.45, 'cave');
                        }
                    },
                    Chrysotile(offset){ return global.race['smoldering'] ? undergroundCostMultiplier('basic_housing', offset, 10, 1.45, 'cave') : 0; },
                    Horseshoe(){ return global.race['hooved'] ? 2 : 0; }
                },
                effect(){
                    let pop = $(this)[0].citizens();
                    return loc('plus_max_resource',[pop,loc('citizen')]);
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        global['resource'][global.race.species].display = true;
                        global.settings.showCivic = true;
                        if(global.race['artifical']){
                            renderUnderground(); //to get assembly to show up
                        }
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['basic_housing','underground']
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
            ice_collector: {
                id: 'underground-ice_collector',
                title(){ 
                    return loc('underground_ice_collector');
                },
                desc(){ return loc('underground_ice_collector_desc'); },
                type: 'production',
                reqs: { water: 1 },
                cost: {
                    Money(offset){
                        offset = offset || 0;
                        if ((global.underground['ice_collector']?.count || 0) + offset >= 3){
                            return undergroundCostMultiplier('ice_collector', offset, 110, 1.65, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Stone(offset){
                        offset = offset || 0;
                        if ((global.underground['ice_collector']?.count || 0) + offset >= 3){
                            return undergroundCostMultiplier('ice_collector', offset, 180, 1.65, 'cave');
                        }
                        else {
                            return undergroundCostMultiplier('ice_collector', offset, 30, 1.65, 'cave');
                        }
                    },
                },
                effect(){
                    let water = $(this)[0].res_cap('water');
                    return `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_water_collector`)])}</div><div>${loc('production',[4,global.resource.Water.name])}</div><div>${loc('plus_max_resource',[water,global.resource.Water.name])}</div>`;
                },
                res_cap(res){
                    switch (res){
                        case 'water':
                            return iceAgeStorage(100);
                    }
                    return 0
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('ice_collector','underground');
                        global.civic.water_collector.display = true;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['ice_collector','underground']
                    };
                }
            },
            mushroom_farm: {
                id: 'underground-mushroom_farm',
                title(){ 
                    return loc('underground_mushroom_farm', [$(this)[0].mushroom_type()]);
                },
                desc(){ return loc('underground_mushroom_farm_desc', [$(this)[0].mushroom_type()]); },
                type: 'farming',
                reqs: { agriculture: 1 },
                not_trait: ['artifical'],
                cost: {
                    Money(offset){
                        offset = offset || 0;
                        if ((global.underground['mushroom_farm']?.count || 0) + offset >= 3){
                            return undergroundCostMultiplier('mushroom_farm', offset, 150, 1.65, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Stone(offset){
                        offset = offset || 0;
                        if ((global.underground['mushroom_farm']?.count || 0) + offset >= 3){
                            return undergroundCostMultiplier('mushroom_farm', offset, 120, 1.65, 'cave');
                        }
                        else {
                            return undergroundCostMultiplier('mushroom_farm', offset, 30, 1.65, 'cave');
                        }
                    },
                },
                effect(){
                    let pop = $(this)[0].citizens();
                    return `<div>${loc('city_farm_effect')}</div><div>${loc('plus_max_resource',[pop,loc('citizen')])}</div>`;
                },
                mushroom_type(){
                    if(global.race['soul_eater']){
                        return loc('underground_mushroom_soul');
                    }
                    else if(global.race['detritivore']){
                        return loc('underground_mushroom_detritivore');
                    }
                    if(global.race['carnivore']){
                        return loc('underground_mushroom_meat');
                    }
                    return loc('underground_mushroom');
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('mushroom_farm','underground');
                        global.civic.farmer.display = true;
                        global.civic.farmer.assigned = 0;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['mushroom_farm','underground']
                    };
                }
            },
            transmitter: {
                id: 'underground-transmitter',
                title(){ return loc('underground_transmitter'); },
                desc(){ return `<div>${loc('underground_transmitter_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
                type: 'farming',
                reqs: { agriculture: 1 },
                trait: ['artifical'],
                cost: {
                    Money(offset){ return undergroundCostMultiplier('transmitter', offset, 120, 1.65, 'cave')},
                    Stone(offset){
                        if (false){
                            return 0;
                        }
                        else {
                            return undergroundCostMultiplier('transmitter', offset, 120, 1.55, 'cave');
                        }
                    },
                    Copper(offset){
                        if (false){
                            return undergroundCostMultiplier('transmitter', offset, 120, 1.45, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Steel(offset){
                        if (false){
                            return undergroundCostMultiplier('transmitter', offset, 80, 1.45, 'cave');
                        }
                        else {
                            return 0;
                        }
                    }
                },
                effect(){
                    let sig_cap = $(this)[0].res_cap('food');
                    return `<div>${loc('underground_transmitter_effect')}</div><div>${loc('city_transmitter_effect',[sig_cap])}</div>`;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('transmitter','underground');
                        global.civic.farmer.display = true; //don't worry, the synth farmers are unrecognizably retextured
                        global.civic.farmer.assigned = 0;
                        return true;
                    }
                    return false;
                },
                res_cap(res){
                    switch (res){
                        case 'food':
                            return iceAgeStorage(100);
                    }
                    return 0
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['transmitter','underground']
                    };
                }
            },
            storage_space: {
                id: 'underground-storage_space',
                title(){ return loc('underground_storage_space') },
                desc(){ return loc('underground_storage_space_desc')},
                type: 'storage',
                reqs: { storage: 1 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('storage_space', offset, 160, 1.65, 'cave'); },
                    Stone(offset){ return undergroundCostMultiplier('storage_space', offset, 250, 1.55, 'cave'); }
                },
                res_list(){
                    return ['Stone', 'Chrysotile', 'Crystal', 'Water', 'Furs', 'Copper', 'Iron', 'Aluminium', 'Cement', 'Coal', 'Steel', 'Titanium'];
                },
                res_cap(res){
                    switch (res){
                        case 'Stone':
                            return 300;
                        case 'Chrysotile':
                            return 300;
                        case 'Crystal':
                            return 8;
                        case 'Water':
                            return 80;
                        case 'Furs':
                            return 125;
                        case 'Copper':
                            return 90;
                        case 'Iron':
                            return 125;
                        case 'Aluminium':
                            return 90;
                        case 'Cement':
                            return 100;
                        case 'Coal':
                            return 75;
                        case 'Steel':
                            return 40;
                        case 'Titanium':
                            return 20;
                        default:
                            return 0;
                    }
                },
                effect(wiki){
                    let storage = '<div class="aTable">';
                    let multiplier = storageMultipler(1, wiki);
                    for (const res of $(this)[0].res_list()){
                        if (global.resource[res].display){
                            let val = sizeApproximation(+(spatialReasoning($(this)[0].res_cap(res)) * multiplier).toFixed(0),1);
                            storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                        }
                    };
                    storage = storage + '</div>';
                    return storage;
                },
                wide: true,
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('storage_space','underground');
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['storage_space','underground']
                    };
                },
            },
            vault: {
                id: 'underground-vault',
                title(){ return loc('underground_vault'); },
                desc(){ return loc('underground_vault_desc'); },
                type: 'finance',
                reqs: { banking: 1 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('vault', offset, traitCostMod('untrustworthy',250), 1.65); },
                    Stone(offset){ return undergroundCostMultiplier('vault', offset, traitCostMod('untrustworthy',300), 1.55); },
                    Iron(offset){ return undergroundCostMultiplier('vault', offset, traitCostMod('untrustworthy',120), 1.55); }
                },
                effect(){
                    let vault = (spatialReasoning($(this)[0].res_cap('money')).toFixed(0)).toLocaleString();
                    return `<div>${loc('plus_max_resource',[`\$${vault}`,loc('resource_Money_name')])}</div> ${global.tech['banking'] >= 2 ? `<div>${loc('plus_max_resource',[jobScale(1),loc('banker_name')])}</div>` : ''}`;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('vault','underground');
                        return true;
                    }
                    return false;
                },
                res_cap(res){
                    switch (res){
                        case 'money':
                            return bank_vault();
                    }
                    return 0;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['vault','underground']
                    };
                }
            },
            stone_slab: {
                id: 'underground-stone_slab',
                title(){ return loc('underground_stone_slab'); },
                desc(){ return loc('underground_stone_slab_desc'); },
                type: 'science',
                reqs: { science: 1 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('stone_slab', offset, 400, 1.75, 'cave'); },
                    Stone(offset){ return undergroundCostMultiplier('stone_slab', offset, 450, 1.65, 'cave'); },
                    Crystal(offset){ return global.race.universe === 'magic' ? undergroundCostMultiplier('stone_slab', offset, 40, 1.65, 'cave') : 0; }
                },
                effect(wiki){
                    let gain = +($(this)[0].knowVal(wiki)).toFixed(0);
                    return `<div>${loc('city_university_effect',[jobScale(1)])}</div>
                        <div>${loc('city_max_knowledge',[gain.toLocaleString()])}</div>
                        ${global.tech['science'] >= 4 ? `<div>${loc('underground_stone_slab_effect2',[global.tech['stone_carving'] || 0])}</div>` : ''}
                        ${global.tech['science'] >= 3 ? `<div>${loc('underground_stone_slab_effect1',[4])}</div>` : ''}`;
                },
                knowVal(wiki){
                    let multiplier = 1;
                    let base = 500;
                    if (global.city.ptrait.includes('permafrost')){
                        base += planetTraits.permafrost.vars()[1];
                    }
                    if(global.tech['science'] >= 4){
                        multiplier *= 1.25;
                    }
                    if (global.race['hard_of_hearing']){
                        multiplier *= 1 - (traits.hard_of_hearing.vars()[0] / 100);
                    }
                    if (global.race['curious']){
                        multiplier *= 1 + (traits.curious.vars()[0] / 100 * global.resource[global.race.species].amount);
                    }
                    let fathom = fathomCheck('cath');
                    if (fathom > 0){
                        multiplier *= 1 + (traits.curious.vars(3)[0] * fathom);
                    }
                    let teachVal = govActive('teacher',0);
                    if (teachVal){
                        multiplier *= 1 + (teachVal / 100);
                    }
                    let athVal = govActive('athleticism',2);
                    if (athVal){
                        multiplier *= 1 - (athVal / 100);
                    }
                    multiplier *= getShrineBonus('know').mult;
                    let gain = (base * multiplier);
                    return gain;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('stone_slab','underground');
                        global.civic.professor.display = true;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['stone_slab','underground']
                    };
                }
            },
            mine: {
                id: 'underground-mine',
                title(){ return loc('underground_mine'); },
                desc(){ return loc('underground_mine_desc'); },
                type: 'mining',
                reqs: { mining: 1 },
                cost: {
                    Money(offset){
                        offset = offset || 0;
                        if (global.underground['mine']?.count || 0 + offset >= 2){
                            return undergroundCostMultiplier('mine', offset, 220, 1.65, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Stone(offset){
                        offset = offset || 0;
                        if (global.underground['mine']?.count || 0 + offset >= 2){
                            return undergroundCostMultiplier('mine', offset, 340, 1.55, 'cave');
                        }
                        else {
                            return undergroundCostMultiplier('mine', offset, 20, 1.55, 'cave');
                        }
                    }
                },
                effect(){
                    let stone = $(this)[0].res_cap('stone');
                    let asbestos = global.race['smoldering'] ? `<div>${loc('plus_max_resource',[stone,global.resource.Chrysotile.name])}</div>` : '';
                    return `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_miner`)])}</div><div>${loc('city_rock_quarry_effect1',[2])}</div><div>${loc('plus_max_resource',[stone,global.resource.Stone.name])}</div>${asbestos}`;
                },
                special(){ return global.race['smoldering'] ? true : false; },
                res_cap(res){
                    switch (res){
                        case 'stone':
                            return iceAgeStorage(100);
                    }
                    return 0
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('mine','underground');
                        global.civic.quarry_worker.display = true;
                        global.resource.Copper.display = true;
                        global.civic.miner.display = true;
                        if (global.race['smoldering'] && global.resource.Chrysotile.display){
                            if (global.underground.mine.count === 1){
                                global.settings.showCivic = true;
                                global.settings.showIndustry = true;
                                defineIndustry();
                            }
                        }
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: {
                            count: 0,
                            asbestos: 50
                        },
                        p: ['mine','underground']
                    };
                },
            },
            meditation:buildTemplate('meditation', 'underground'),
            s_alter: buildTemplate('s_alter','underground'),
            support_beams: {
                id: 'underground-support_beams',
                title(){ return loc('underground_support_beams'); },
                desc(){ return loc('underground_support_beams_desc'); },
                type: 'utility',
                reqs: { support_beams: 1 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('support_beams', offset, 700, 2.1); },
                    Iron(offset){ return undergroundCostMultiplier('support_beams', offset, 350, 2); }
                },
                effect(){
                    let effect = `<div>${loc('underground_support_beams_effect', [0.005])}</div>`
                    if(global.tech['mineshaft'] >= 2){
                        let effect = `<div>${loc('underground_support_beams_effect2', [10])}</div>`
                    }
                    return effect;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['support_beams','underground']
                    };
                }
            },
            mineshaft: {
                id: 'underground-mineshaft',
                title(){ return loc('underground_mineshaft'); },
                desc(){ return loc('underground_mineshaft_desc'); },
                type: 'utility',
                reqs: { mineshaft: 1 },
                queue_complete(){ return 1 - global.underground.mineshaft.count; },
                cost: {
                    Money(offset){ return !global.underground.mineshaft.count ? 2600 : 0; },
                    Iron(offset){ return !global.underground.mineshaft.count ? 1300 : 0; },
                    Water(offset){ return !global.underground.mineshaft.count ? 2400 : 0; }
                },
                effect(){
                    let effect = `<div>${loc("underground_mineshaft_effect1", [global.underground['mineshaft'].depth.toFixed(2)])}</div>`;
                    effect += `<div>${loc("underground_mineshaft_effect2", [($(this)[0].dig_rate()).toFixed(3)])}</div><div>${loc("underground_mineshaft_effect3", [($(this)[0].ice_rate()).toFixed(3)])}</div>`;
                    effect += `<div class="has-text-warning">${loc("underground_mineshaft_effect_warm")}</div>`;
                    return effect;
                },
                special(){ return true; },
                action(args){
                    if (global.underground['mineshaft'].count < 1 && payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        return true;
                    }
                    return false;
                },
                dig_rate(){
                    let ratio = global.underground['mineshaft'].ratio;
                    let miner_base = workerScale(global.civic.miner.workers * ratio / 100,'mineshaft_miner');
                    let trait_mods = racialTrait(miner_base,'miner'); //trait effects are severely reduced
                    if (global.race['tough']){
                        trait_mods *= 1 + (traits.tough.vars()[0] / 100);
                    }
                    let ogreFathom = fathomCheck('ogre');
                    if (ogreFathom > 0){
                        trait_mods *= 1 + (traits.tough.vars(1)[0] / 100 * ogreFathom);
                    }
                    miner_base *= trait_mods ** 0.5;
                    if (global.race['industrious']){
                        let bonus = 1 + (traits.industrious.vars()[0] * global.race['industrious'] / 100);
                        miner_base *= bonus;
                    }
                    if (global.city.ptrait.includes('dense')){
                        miner_base *= planetTraits.dense.vars()[0];
                    }
                    if (global.city.ptrait.includes('permafrost')){
                        miner_base *= planetTraits.permafrost.vars()[0];
                    }
                    if (!global.race['living_tool'] && !global.race['tusk']){
                        miner_base *= (global.tech['pickaxe'] && global.tech.pickaxe > 0 ? global.tech.pickaxe * 0.15 : 0) + 1;
                    }
                    if (global.tech['explosives'] && global.tech.explosives >= 2){
                        miner_base *= 0.95 + (global.tech.explosives * 0.15);
                    }
                    return miner_base / 10;
                },
                ice_rate(){
                    return Math.max(0, global.underground['mineshaft'].depth - global.underground['mineshaft'].ice) / 1000;
                },
                full_depth(){
                    return global.underground['mineshaft'].depth - global.underground['mineshaft'].ice;
                },
                struct(){
                    return {
                        d: { count: 0, ratio:0, depth:0, ice:0 },
                        p: ['mineshaft','underground']
                    };
                }
            }
        },
        depths: {
            hunting_lodge: {
                id: 'underground-hunting_lodge',
                title(){ return loc('underground_hunting_lodge'); },
                desc(){ return loc('underground_hunting_lodge_desc'); },
                type: 'military',
                reqs: { military: 1, housing: 1 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('hunting_lodge', offset, 3500, 1.65, 'depths'); },
                    Iron(offset){ return undergroundCostMultiplier('hunting_lodge', offset, 2950, 1.55, 'depths'); },
                    Horseshoe(){ return global.race['hooved'] ? $(this)[0].soldiers() : 0; }
                },
                effect(){
                    let bunks = $(this)[0].soldiers();
                    let desc = `<div>${loc('plus_max_resource',[bunks,loc('civics_garrison_soldiers')])}</div>`;
                    if (global.race.universe === 'evil'){
                        desc += `<div>${loc('plus_max_resource',[0.5,global.resource.Authority.name])}</div>`;
                    }
                    return desc;
                },
                switchable(){ return true; },
                action(args){
                    if (payCosts($(this)[0])){
                        //TODO: Rework rival combat. I want to keep it in order to make combat rating somewhat relevant for something but I want it to be different than having the three rivals and clicking fight.
                        //Think fighting large cave-dwelling animals instead of rivals. Perhaps something else?
                        //idea: an opponent that gets stronger with each defeat. Each defeat grants a permanent bonus to something. (bonus should probably be linear or even diminishing)
                        //enemies may randomly ambush you on an attack attempt. Makes ambush reduction traits relevant
                        //also think of a solution to pop growth for parasite because soldiers and attacking are not available immediately.
                        global.settings['showMil'] = true;
                        if (!global.settings.msgFilters.combat.unlocked){
                            global.settings.msgFilters.combat.unlocked = true;
                            global.settings.msgFilters.combat.vis = true;
                        }
                        if (!global.civic.garrison.display){
                            global.civic.garrison.display = true;
                            vBind({el: `#garrison`},'update');
                            vBind({el: `#c_garrison`},'update');
                        }
                        global.civic['garrison'].max += $(this)[0].soldiers();
                        incrementStruct('hunting_lodge','underground');
                        global.underground['hunting_lodge'].on++;
                        global.resource.Furs.display = true;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0, on: 0 },
                        p: ['hunting_lodge','underground']
                    };
                },
                soldiers(){
                    let soldiers = 2;
                    if (global.race['chameleon']){
                        soldiers--;
                    }
                    if (global.race['grenadier']){
                        soldiers--;
                    }
                    if (soldiers <= 0){ return 1; }
                    return jobScale(soldiers);
                }
            },
            amphitheatre: {
                id: 'underground-amphitheatre',
                title(){
                    if (global.race.universe === 'evil'){
                        return loc('city_colosseum');
                    }
                    let athVal = govActive('athleticism',0);
                    return athVal ? loc('city_stadium') : loc('city_amphitheatre');
                },
                desc(){
                    if (global.race.universe === 'evil'){
                        return loc('city_colosseum');
                    }
                    let athVal = govActive('athleticism',0);
                    return athVal ? loc('city_stadium') : loc('city_amphitheatre_desc');
                },
                type: 'entertainment',
                reqs: { theatre: 1 },
                not_trait: ['joyless'],
                cost: {
                    Money(offset){ return undergroundCostMultiplier('amphitheatre', offset, 5500, 1.65, 'depths'); },
                    Water(offset){ return undergroundCostMultiplier('amphitheatre', offset, 2400, 1.55, 'depths'); },
                    Iron(offset){ return undergroundCostMultiplier('amphitheatre', offset, 1600, 1.55, 'depths'); },
                },
                effect(){
                    let athVal1 = govActive('athleticism',0);
                    let athVal2 = govActive('athleticism',1);
                    return`<div>${loc('plus_max_resource',[jobScale(athVal2 ? athVal2 : 1),loc(`job_entertainer`)])}</div><div>${loc('city_max_morale',[athVal1 ? athVal1 : 1])}</div>`;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('amphitheatre','underground');
                        let athVal2 = govActive('athleticism',1);
                        global.civic.entertainer.display = true;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['amphitheatre','underground']
                    };
                },
                flair(){
                    if (global.race.universe === 'evil'){
                        return loc('city_colosseum_flair');
                    }
                    let athVal = govActive('athleticism',0);
                    return athVal ? loc('city_stadium_flair') : loc('city_amphitheatre_flair');
                },
            },
            shrine: buildTemplate(`shrine`,'underground'),
            cement_plant: {
                id: 'underground-cement_plant',
                title(){ return loc('city_cement_plant'); },
                desc(){ return loc('city_cement_plant_desc'); },
                type: 'industry',
                reqs: { cement: 1 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('cement_plant', offset, 4500, 1.65, 'depths'); },
                    Stone(offset){ return undergroundCostMultiplier('cement_plant', offset, 3500, 1.55, 'depths'); },
                    Iron(offset){ return undergroundCostMultiplier('cement_plant', offset, 3000, 1.55, 'depths'); }
                },
                effect(){
                    if (global.tech['cement'] >= 5){
                        let screws = global.tech['cement'] >= 6 ? 8 : 5;
                        return `<div>${loc('plus_max_resource',[jobScale(2),loc(`job_cement_worker`)])}</div><div class="has-text-caution">${loc('city_cement_plant_effect2',[$(this)[0].powered(),screws])}</div>`;
                    }
                    else {
                        return loc('plus_max_resource',[jobScale(2),loc(`job_cement_worker`)]);
                    }
                },
                action(args){
                    if (payCosts($(this)[0])){
                        global.resource.Cement.display = true;
                        incrementStruct('cement_plant','underground');
                        global.civic.cement_worker.display = true;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['cement_plant','underground']
                    };
                }
            },
            foundry: {
                id: 'underground-foundry',
                title(){ return loc('city_foundry'); },
                desc(){ return loc('city_foundry_desc'); },
                type: 'industry',
                reqs: { foundry: 1 },
                cost: {
                    Money(offset){ return costMultiplier('foundry', offset, 1600, 1.65); },
                    Stone(offset){ return costMultiplier('foundry', offset, 2200, 1.55); },
                    Iron(offset){ return costMultiplier('foundry', offset, 1900, 1.55); },
                },
                effect(){
                    let desc = `<div>${loc('city_foundry_effect1',[jobScale(1)])}</div>`;
                    if (global.tech['foundry'] >= 2){
                        let skill = global.tech['foundry'] >= 5 ? (global.tech['foundry'] >= 8 ? 8 : 5) : 3;
                        desc = desc + `<div>${loc('city_crafted_mats',[skill])}</div>`;
                    }
                    if (global.tech['foundry'] >= 6){
                        desc = desc + `<div>${loc('city_foundry_effect2',[2,global.resource.Brick.name])}</div>`;
                    }
                    return desc;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        if (global.city['foundry'].count === 0){
                            messageQueue(loc('city_foundry_msg2'),'info',false,['progress']);
                        }
                        incrementStruct('foundry','underground');
                        //global.civic.craftsman.max += jobScale(1);
                        global.civic.craftsman.display = true;
                        global.resource.Brick.display = true;
                        global.resource.Wrought_Iron.display = true;
                        if (global.resource.Aluminium.display){
                            global.resource.Sheet_Metal.display = true;
                        }
                        loadFoundry();
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d:actions.city.foundry.struct().d,
                        p: ['foundry','underground']
                    };
                }
            },
            coal_mine: {
                id: 'city-coal_mine',
                title(){ return loc('coal_mine'); },
                desc(){ return loc('city_coal_mine_desc'); },
                type: 'mining',
                reqs: { mining: 4 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('coal_mine', offset, 480, dirt_adjust(1.4)); },
                    Iron(offset){ return undergroundCostMultiplier('coal_mine', offset, 480, dirt_adjust(1.4)); },
                    Wrought_Iron(offset){ return undergroundCostMultiplier('coal_mine', offset, 18, dirt_adjust(1.36)); }
                },
                effect(){ return loc('plus_max_resource',[jobScale(1),loc(`job_coal_miner`)]); },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        global.resource.Coal.display = true;
                        global.civic.coal_miner.display = true;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['coal_mine','underground']
                    };
                }
            },
            cave_creatures: {
                id: 'city-cave_creatures',
                title(){ return loc('underground_cave_creatures'); },
                desc(){ return loc('underground_cave_creatures_desc'); },
                type: 'utility',
                reqs: { military: 2 },
                cost: {},
                effect(){
                    return `<div>${loc('underground_cave_creatures_effect', [0.005])}</div><div>${loc('underground_cave_creatures_effect2', [$(this)[0].group_size()])}</div>`;
                },
                action(args){
                    if(garrisonSize() > 0){
                        let result = cave_fight(true);
                        if (result.success){
                            messageQueue(loc('underground_cave_creatures_combat_success', [result.kills, result.deaths, result.injuries]));
                            incrementStruct($(this)[0]);
                            return true;
                        }
                        else{
                            messageQueue(loc('underground_cave_creatures_combat_failure', [result.kills, result.deaths, result.injuries]));
                        }
                        if(result.revive){
                            if(result.revive === 1){
                                messageQueue(loc("hell_report_log_revived"));
                            }
                            else{
                                messageQueue(loc("hell_report_log_revived_plural", [result.revive]));
                            }
                        }
                    }
                    return false;
                },
                group_size(){
                    return 20 + (global.underground['cave_creatures'].count ** 2) * 5; //20, 25, 40, 65, 100, 145, etc
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['cave_creatures','underground']
                    };
                }
            }
        }
    },
    surface: {

    }
}

function cave_fight(real=false){
    let creatures = actions.underground.depths.cave_creatures.group_size();
    let army = garrisonSize();
    let seed = global['warseed'];
    let ambushing_max = 70 - Math.max(global.race['chameleon'] ? traits.chameleon.vars()[1] : 0,
                                    global.race['elusive'] ? traits.elusive.vars()[0] : 0);
    if (global.race['chicken']){
        ambushing_max += Math.round(traits.chicken.vars()[0] / 5);
    }
    if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.f){
        ambushing_max -= Math.round(3 * traits.ocular_power.vars()[1] / 100);
    }
    let ambushing = Math.floor(seededRandom(ambushing_max / 5, ambushing_max,true) / 100 * creatures); //by default, between 14% and 70% of creatures ambush

    let deaths = Math.floor(ambushing / 10); //1 soldier dies per 10 ambushing creatures
    let armor = armorCalc(deaths); //can be more than deaths
    let injuries = Math.min(deaths, armor);
    deaths -= injuries;
    if (global.race['instinct']){
        let reduction = Math.floor(deaths * (traits.instinct.vars()[1] / 100));
        deaths -= reduction;
        injuries += reduction;
    }
    army -= deaths;
    if(army < 0){
        army = 0;
        injuries = 0;
    }
    armor = armorCalc();
    let further_deaths = 0;
    while(creatures > 0 && army > 0){
        let rating = armyRating(army, Math.min(army, injuries));
        creatures -= Math.round(seededRandom(rating * 0.1, rating,true));
        if(creatures > 0){
            let new_deaths = Math.round(seededRandom(creatures / 30, creatures / 5,true));
            if(armor > 0){
                let amount = Math.min(armor, new_deaths);
                new_deaths -= amount;
                injuries += amount;
                armor -= amount;
            }
            further_deaths += Math.min(army, new_deaths);
            army -= Math.min(army, new_deaths);
        }
    }
    if(creatures < 0){
        creatures = 0;
    }
    if (global.race['instinct']){ //second instincts proc? How generous.
        let reduction = Math.floor(further_deaths * (traits.instinct.vars()[1] / 100));
        further_deaths -= reduction;
        injuries += reduction;
    }
    deaths += further_deaths;
    let revive = 0;
    if(real){
        soldierDeath(deaths);
        global.civic.garrison.protest += deaths * 2;
        injuries += global.civic.garrison.wounded;
        if(army > injuries){
            global.civic.garrison.wounded += Math.ceil(seededRandom(0, army - injuries));
        }
        global.civic.garrison.wounded = Math.min(army, injuries);
        if(global.race['revive']){
            revive = deaths * Math.round(seededRandom(0, deaths / traits.revive.vars()[0], true));
            global.civic.garrison.workers += revive;
        }
    }
    else{
        global['warseed'] = seed; //do not update seed in a preview attempt.
    }
    return {
        success: creatures <= 0,
        ambushers: ambushing,
        kills: actions.underground.depths.cave_creatures.group_size() - creatures,
        injuries: Math.min(army, injuries),
        deaths: deaths,
        revive: revive
    };
}
export function undergroundTech(){
    return iceAgeModules.underground;
}
export function surfaceTech(){
    return iceAgeModules.surface;
}

export function renderUnderground(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 8)){
        return;
    }
    if (!global.settings.showUnderground){
        return;
    }
    Object.keys(actions.underground).forEach(function (category) {
        clearElement($(`#underground-dist-${category}`),true);
        $(`<div id="underground-dist-${category}" class="city"></div>`)
            .appendTo('#underground')
            .append(`<div><h3 class="name has-text-warning">${loc(`underground_${category}`)}</h3></div>`);


        popover(`dist-${category}`, function(){
            return loc(`underground_${category}_desc`);
        },
        {
            elm: `#underground-dist-${category} h3`,
            classes: `has-background-light has-text-dark`
        });
        Object.keys(actions.underground[category]).forEach(function (name) {
            if(checkRequirements(actions.underground, category, name)){
                setAction(actions.underground[category][name], 'underground', name);
            }
        });
    })

}

export function renderSurface(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 9)){
        return;
    }
    if (!global.settings.showUnderground){
        return;
    }
}

function undergroundCostMultiplier(structure,offset,base,multiplier,subSector,sector='underground'){
    if (global.race.universe === 'micro'){
        multiplier -= darkEffect('micro',false);
    }

    if (global.race['small']){ multiplier -= traits.small.vars()[0]; }
    if (global.race['large']){ multiplier += traits.large.vars()[0]; }
    if (global.race['compact']){ multiplier -= traits.compact.vars()[0]; }
    if (global.race['tunneler'] && (structure === 'mine' || structure === 'coal_mine')){ multiplier -= traits.tunneler.vars()[0]; }
    if (global.tech['housing_reduction'] && (structure === 'basic_housing' || structure === 'cottage')){
        multiplier -= global.tech['housing_reduction'] * 0.02;
    }
    if (global.tech['housing_reduction'] && structure === 'captive_housing'){
        multiplier -= global.tech['housing_reduction'] * 0.01;
    }
    if (structure === 'basic_housing'){
        if (global.race['solitary']){
            multiplier -= traits.solitary.vars()[0];
        }
        if (global.race['pack_mentality']){
            multiplier += traits.pack_mentality.vars()[0];
        }
    }
    if (structure === 'cottage'){
        if (global.race['solitary']){
            multiplier += traits.solitary.vars()[1];
        }
        if (global.race['pack_mentality']){
            multiplier -= traits.pack_mentality.vars()[1];
        }
    }
    if (structure === 'apartment'){
        if (global.race['pack_mentality']){
            multiplier -= traits.pack_mentality.vars()[1];
        }
    }
    if(['mine', 'coal_mine'].includes(structure)){
        multiplier -= govActive('dirty_jobs',0);
    }
    if(subSector === 'cave' && global.underground['support_beams']){
        multiplier -= global.underground['support_beams'].count * 0.005;
        if(global.tech['support_beams'] >= 2){
            base *= 0.9 ** global.underground['support_beams'].count;
        }
    }
    if(subSector === 'depths' && global.underground['cave_creatures']){
        multiplier -= global.underground['cave_creatures'].count * 0.005;
    }
    if (global.genes['creep'] && !global.race['no_crispr']){
        multiplier -= global.genes['creep'] * 0.01;
    }
    else if (global.genes['creep'] && global.race['no_crispr']){
        multiplier -= global.genes['creep'] * 0.002;
    }
    let nqVal = govActive('noquestions',0);
    if (nqVal){
        multiplier -= nqVal;
    }
    if (multiplier < 1.005){
        multiplier = 1.005;
    }
    var count = structure === 'citizen' ? highPopAdjust(global['resource'][global.race.species].amount) : (global[sector][structure] ? global[sector][structure].count : 0);
    if (offset){
        count += offset;
    }
    return Math.round((multiplier ** count) * base);
}

function iceAgeStorage(cost, region){
    return BHStorageMulti(spatialReasoning(cost));
}