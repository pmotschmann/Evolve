import { global, seededRandom, sizeApproximation } from './vars.js';
import { loc } from './locale.js';
import { buildTemplate, actions, setAction, removeAction, payCosts, BHStorageMulti, storageMultipler, bank_vault } from './actions.js';
import { clearElement, popover, darkEffect, getShrineBonus, powerCostMod, vBind, modRes } from './functions.js';
import { govActive } from './governor.js';
import { traits, fathomCheck } from './races.js';
import { production } from './prod.js';
import { spatialReasoning, } from './resources.js';
import { jobScale } from './jobs.js';
import { traitCostMod } from './races.js';
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
                    return `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_runner`)])}</div><div>${loc('city_transmitter_effect',[sig_cap])}</div>`;
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
                    let effect = `<div>${loc("underground_mineshaft_effect1", [global.underground['mineshaft'].depth])}</div>`;
                    effect += `<div>${loc("underground_mineshaft_effect2", [0])}</div><div>${loc("underground_mineshaft_effect3", [0])}</div>`;
                    effect += `<div class="has-text-danger">${loc("underground_mineshaft_effect_warm")}</div>`;
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
                    Money(offset){ return undergroundCostMultiplier('hunting_lodge', offset, 240, 1.5); },
                    Stone(offset){ return undergroundCostMultiplier('garrison', offset, 260, 1.46); },
                    Horseshoe(){ return global.race['hooved'] ? (global.race['chameleon'] ? 1 : 2) : 0; }
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
        }
    },
    surface: {

    }
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
    if(subSector === 'cave' && global.underground['support_beams']){
        multiplier -= global.underground['support_beams'].count * 0.005;
        if(global.tech['support_beams'] >= 2){
            base *= 0.9 ** global.underground['support_beams'].count;
        }
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