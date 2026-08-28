import { global, seededRandom, sizeApproximation, p_on, support_on, fight_log } from './vars.js';
import { loc } from './locale.js';
import { buildTemplate, actions, setAction, drawTech, payCosts, BHStorageMulti, bank_vault, templeEffect, powerOnNewStruct, storageMultipler, structName, casinoEffect, initStruct, housingLabel } from './actions.js';
import { clearElement, popover, darkEffect, getShrineBonus, powerCostMod, vBind, modRes, messageQueue, powerModifier, timeFormat, fibonacci, deepClone } from './functions.js';
import { addSmelter, defineIndustry, factoryData } from './industry.js';
import { govActive } from './governor.js';
import { production, highPopAdjust } from './prod.js';
import { spatialReasoning, } from './resources.js';
import { jobScale, workerScale, loadFoundry, limitCraftsmen } from './jobs.js';
import { garrisonSize, armorCalc, armyRating, soldierDeath } from './civics.js';
import { races, traits, fathomCheck, traitCostMod, planetTraits, racialTrait, servantTrait, geneVars } from './races.js';
import { checkRequirements, incrementStruct } from './space.js';
import { arpa } from './arpa.js';

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
                        let power = global.city['powered'] ? `<div>${loc('space_dwarf_reactor_effect1', [25])}</div>` : '';
                        return `<div>${loc('gain',[1, global.resource.Food.name])}</div>${power}`;
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
            hollow: {
                id: 'underground-hollow',
                title(){ return loc('underground_hollow'); },
                desc(){ return loc('underground_hollow_desc'); },
                type: 'housing',
                reqs: { housing: 1 },
                cost: {
                    Money(r = {}){
                        r.offset = r.offset || 0;
                        if ((global.underground['hollow']?.count || 0) + r.offset >= 2){
                            return undergroundCostMultiplier('hollow', r.offset, 60, 1.55, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Stone(r = {}){ 
                        r.offset = r.offset || 0;
                        if ((global.underground['hollow']?.count || 0) + r.offset >= 2){
                            return undergroundCostMultiplier('hollow', r.offset, 120, 1.45, 'cave');
                        }
                        else {
                            return undergroundCostMultiplier('hollow', r.offset, 20, 1.45, 'cave');
                        }
                    },
                    Chrysotile(r = {}){ return global.race['smoldering'] ? undergroundCostMultiplier('hollow', r.offset, 10, 1.45, 'cave') : 0; },
                    Horseshoe(){ return global.race['hooved'] ? 2 : 0; }
                },
                effect(){
                    let desc = `<div>${loc('plus_max_citizens',[$(this)[0].citizens()])}</div>`;
                    if(global.tech['housing'] >= 3){
                        desc += `<div class="has-text-caution">${loc('underground_housing_powered', [$(this)[0].powered(), 1])}</div>`;
                    }
                    return desc;
                },
                powered(){ return powerCostMod(3); },
                power_reqs: { housing: 3 },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        powerOnNewStruct($(this)[0]);
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
                        p: ['hollow','underground']
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
                    Money(r = {}){
                        r.offset = r.offset || 0;
                        if ((global.underground['ice_collector']?.count || 0) + r.offset >= 3){
                            return undergroundCostMultiplier('ice_collector', r.offset, 110, 1.50, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Stone(r = {}){
                        r.offset = r.offset || 0;
                        if ((global.underground['ice_collector']?.count || 0) + r.offset >= 3){
                            return undergroundCostMultiplier('ice_collector', r.offset, 180, 1.55, 'cave');
                        }
                        else {
                            return undergroundCostMultiplier('ice_collector', r.offset, 30, 1.55, 'cave');
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
                            if(global.tech['water'] >= 3){
                                return iceAgeStorage(250);
                            }
                            return iceAgeStorage(100);
                    }
                    return 0
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
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
                    Money(r = {}){
                        r.offset = r.offset || 0;
                        if ((global.underground['mushroom_farm']?.count || 0) + r.offset >= 3){
                            return undergroundCostMultiplier('mushroom_farm', r.offset, 150, 1.40, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Stone(r = {}){
                        r.offset = r.offset || 0;
                        if ((global.underground['mushroom_farm']?.count || 0) + r.offset >= 3){
                            return undergroundCostMultiplier('mushroom_farm', r.offset, 120, 1.45, 'cave');
                        }
                        else {
                            return undergroundCostMultiplier('mushroom_farm', r.offset, 30, 1.45, 'cave');
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
                        incrementStruct($(this)[0]);
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
            under_transmitter: {
                id: 'underground-transmitter',
                title(){ return loc('underground_transmitter'); },
                desc(){ return `<div>${loc('underground_transmitter_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
                type: 'farming',
                reqs: { agriculture: 1 },
                trait: ['artifical'],
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('under_transmitter', r.offset, 120, 1.40, 'cave')},
                    Stone(r = {}){
                        if (false){
                            return 0;
                        }
                        else {
                            return undergroundCostMultiplier('under_transmitter', r.offset, 120, 1.45, 'cave');
                        }
                    },
                    Copper(r = {}){
                        if (false){
                            return undergroundCostMultiplier('under_transmitter', r.offset, 120, 1.45, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Steel(r = {}){
                        if (false){
                            return undergroundCostMultiplier('under_transmitter', r.offset, 80, 1.45, 'cave');
                        }
                        else {
                            return 0;
                        }
                    }
                },
                effect(){
                    let desc = `<div>${loc('underground_transmitter_effect1')}</div><div>${loc('city_transmitter_effect',[$(this)[0].res_cap('food')])}</div>`;
                    if(global.tech['high_tech'] >= 2){
                        desc += `<div class="has-text-caution">${loc('underground_transmitter_effect2', [$(this)[0].powered()])}`;
                    }
                    return desc;
                },
                powered(){ return powerCostMod(1.5); },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        powerOnNewStruct($(this)[0]);
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
                        p: ['under_transmitter','underground']
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
                    Money(r = {}){ return undergroundCostMultiplier('storage_space', r.offset, 160, 1.50, 'cave'); },
                    Stone(r = {}){ return undergroundCostMultiplier('storage_space', r.offset, 250, 1.55, 'cave'); }
                },
                res_list(){
                    return ['Lumber', 'Stone', 'Chrysotile', 'Crystal', 'Furs', 'Copper', 'Iron', 'Aluminium', 'Cement', 'Coal', 'Steel', 'Titanium', 'Crates', 'Containers'];
                },
                res_cap(res, wiki){
                    let storage = {
                        Lumber: 300,
                        Stone: 300,
                        Chrysotile: 300,
                        Crystal: 8,
                        Furs: 125,
                        Copper: 90,
                        Iron: 125,
                        Aluminium: 90,
                        Cement: 100,
                        Coal: 75,
                        Steel: 40,
                        Titanium: 20,
                        Crates: $(this)[0].containers('crates'),
                        Containers: $(this)[0].containers('containers')
                    }
                    let val = storage[res];
                    if(p_on['storage_space']){
                        val *= 1 + 0.02 * p_on['storage_space'];
                    }
                    if(!['Crates', 'Containers'].includes(res)){
                        return storageMultipler(iceAgeStorage(val || 0), wiki);
                    }
                    return Math.floor(val || 0);
                },
                containers(which){
                    if(global.tech.container >= 1){
                        let cap = global.tech.container >= 3 ? 20 : 10;
                        if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 1){
                            cap += 10;
                        }
                        if (global.tech['world_control']){
                            cap += 10;
                        }
                        if (global.tech['particles'] && global.tech['particles'] >= 2){
                            cap *= 2;
                        }
                        return cap;
                    }
                    return 0;
                },
                effect(wiki){
                    let storage = '';
                    if(global.tech['storage'] >= 4){
                        storage += `<div class="has-text-caution">${loc('underground_storage_space_effect1', [$(this)[0].powered()])}</div><div class="has-text-caution">${loc('underground_storage_space_effect2', [ $(this)[0].title()])}</div>`;
                    }
                    storage += '<div class="aTable">';
                    for (const res of $(this)[0].res_list()){
                        if (global.resource[res].display){
                            let val = sizeApproximation(+$(this)[0].res_cap(res, wiki).toFixed(0),1);
                            storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                        }
                    };
                    storage = storage + '</div>';
                    return storage;
                },
                wide: true,
                powered(){ return powerCostMod(3); },
                power_reqs: { storage: 4 },
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
                    Money(r = {}){ return undergroundCostMultiplier('vault', r.offset, 250, 1.50); },
                    Stone(r = {}){ return undergroundCostMultiplier('vault', r.offset, 300, 1.55); },
                    Iron(r = {}){ return undergroundCostMultiplier('vault', r.offset, 120, 1.55); }
                },
                effect(){
                    let vault = ($(this)[0].res_cap('money')).toFixed(0).toLocaleString();
                    return `<div>${loc('plus_max_resource',[`\$${vault}`,loc('resource_Money_name')])}</div> ${global.tech['banking'] >= 2 ? `<div>${loc('plus_max_resource',[jobScale(1),loc('banker_name')])}</div>` : ''}`;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        return true;
                    }
                    return false;
                },
                res_cap(res){
                    switch (res){
                        case 'money':
                            return spatialReasoning(bank_vault());
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
                    Money(r = {}){ return undergroundCostMultiplier('stone_slab', r.offset, 400, 1.60, 'cave'); },
                    Stone(r = {}){ return undergroundCostMultiplier('stone_slab', r.offset, 450, 1.65, 'cave'); },
                    Crystal(r = {}){ return global.race.universe === 'magic' ? undergroundCostMultiplier('stone_slab', r.offset, 40, 1.65, 'cave') : 0; }
                },
                effect(wiki){
                    let gain = +($(this)[0].knowVal(wiki)).toFixed(0);
                    return `<div>${loc('city_university_effect',[jobScale(1)])}</div>
                        <div>${loc('city_max_knowledge',[gain.toLocaleString()])}</div>
                        ${global.tech['science'] >= 5 ? `<div>${loc('underground_stone_slab_effect',[global.underground['stone_slab'].breakthrough, 1])}</div>` : ''}`;
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
                    if(global.tech['science'] >= 7){
                        multiplier *= 1.5;
                    }
                    if(global.tech['science'] >= 8){
                        multiplier *= 1.4;
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
                breakthrough_chance(){ //1 = 1 in 1 (100%), 2 = 1 in 2 (50%), etc
                    let base = 400;
                    base += (global.underground['stone_slab']?.breakthrough || 0) * 250;
                    base /= workerScale(jobScale(global.civic.professor.workers), 'professor'); //infinite with 0 professors
                    return base;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        global.civic.professor.display = true;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0, breakthrough: 0 },
                        p: ['stone_slab','underground']
                    };
                }
            },
            under_mine: {
                id: 'underground-under_mine',
                title(){ return loc('underground_mine'); },
                desc(){ return loc('underground_mine_desc'); },
                type: 'mining',
                reqs: { mining: 1 },
                cost: {
                    Money(r = {}){
                        r.offset = r.offset || 0;
                        if (global.underground['under_mine']?.count || 0 + r.offset >= 2){
                            return undergroundCostMultiplier('under_mine', r.offset, 220, 1.50, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Stone(r = {}){
                        r.offset = r.offset || 0;
                        if (global.underground['under_mine']?.count || 0 + r.offset >= 2){
                            return undergroundCostMultiplier('under_mine', r.offset, 340, 1.55, 'cave');
                        }
                        else {
                            return undergroundCostMultiplier('under_mine', r.offset, 20, 1.55, 'cave');
                        }
                    }
                },
                effect(){
                    let desc = `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_miner`)])}</div><div>${loc('city_rock_quarry_effect1',[2])}</div><div>${loc('plus_max_resource',[$(this)[0].res_cap('stone'),global.resource.Stone.name])}</div>`;
                    if(global.race['smoldering']){
                        desc += `<div>${loc('plus_max_resource',[$(this)[0].res_cap('stone'),global.resource.Chrysotile.name])}</div>`;
                    }
                    if(global.underground['mineshaft']?.ratio){
                        desc += `<div class="has-text-warning">${loc(`underground_mine_mineshaft_workers`, [global.underground['mineshaft'].ratio])}</div>`;
                    }
                    if (global.tech['mine_conveyor']){
                        desc += `<div class="has-text-caution">${loc('city_mine_effect2',[$(this)[0].powered(),5])}</div>`;
                    }
                    return desc;
                },
                special(){ return global.race['smoldering'] ? true : false; },
                powered(){ return powerCostMod(1); },
                power_reqs: { mine_conveyor: 1 },
                res_cap(res){
                    switch (res){
                        case 'stone':
                            return iceAgeStorage(100);
                    }
                    return 0
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        powerOnNewStruct($(this)[0]);
                        global.civic.quarry_worker.display = true;
                        global.resource.Copper.display = true;
                        global.civic.miner.display = true;
                        if (global.race['smoldering'] && global.resource.Chrysotile.display){
                            if (!global.settings.showCivic){
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
                        p: ['under_mine','underground']
                    };
                },
            },
            bonfire: {
                id: 'underground-bonfire',
                title(){ return loc('underground_bonfire'); },
                desc(){ return loc('underground_bonfire_desc'); },
                type: 'entertainment',
                reqs: { bonfires: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('bonfire', r.offset, 120000, 1.55, 'cave'); },
                    Lumber(r = {}){ return undergroundCostMultiplier('bonfire', r.offset, 3000, 1.65, 'cave'); },
                    Brick(r = {}){ return undergroundCostMultiplier('bonfire', r.offset, 12000, 1.55, 'cave'); },
                },
                effect(wiki){
                    let desc = `<div>${loc('city_max_morale', [1])}</div>`;
                    desc += `<div>${loc('space_red_vr_center_effect1', [2])}</div>`;
                    desc += `<div class="has-text-caution">${loc('spend', [$(this)[0].consume('lumber'), global.resource.Lumber.name])}`;
                    desc += `<div class="has-text-special">${loc('underground_bonfire_effect', [global.resource.Lumber.name])}</div>`;
                    return desc;
                },
                powered(){ return 0; },
                consume(res){
                    switch (res){
                        case 'lumber':
                            return 3 * (p_on['bonfire'] || 1);
                    }
                    return 0
                },
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
                        p: ['bonfire','underground']
                    };
                },
            },
            meditation:{
                id: `underground-meditation`,
                title(){ return loc('city_meditation'); },
                desc(){ return loc('city_meditation'); },
                category: 'commercial',
                reqs: { primitive: 3 },
                trait: ['calm'],
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('meditation', r.offset, 500, 1.35, 'cave'); },
                    Stone(r = {}){ return undergroundCostMultiplier('meditation', r.offset, 250, 1.35, 'cave'); },
                    Furs(r = {}){ return undergroundCostMultiplier('meditation', r.offset, 80, 1.35, 'cave'); }
                },
                effect(){
                    let zen = global.resource.Zen.amount / (global.resource.Zen.amount + 5000);
                    return `<div>${loc(`city_meditation_effect`,[traits.calm.vars()[0]])}</div><div class="has-text-special">${loc(`city_meditation_effect2`,[2])}</div><div class="has-text-special">${loc(`city_meditation_effect3`,[1])}</div><div>${loc(`city_meditation_effect4`,[`${(zen * 100).toFixed(2)}%`])}</div>`;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('meditation','city');
                        global.underground.meditation.count = global.city.meditation.count;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['meditation','underground']
                    };
                },
            },
            s_alter: buildTemplate(`s_alter`,'underground'),
            shrine: {
                id: `underground-shrine`,
                title(){ return loc('city_shrine'); },
                desc(){
                    return loc('city_shrine_desc');
                },
                category: 'commercial',
                reqs: { theology: 2 },
                trait: ['magnificent'],
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('shrine', r.offset, 800, 1.50, 'cave'); },
                    Stone(r = {}){ return undergroundCostMultiplier('shrine', r.offset, 1200, 1.55, 'cave'); },
                    Furs(r = {}){ return undergroundCostMultiplier('shrine', r.offset, 650, 1.55, 'cave'); },
                    Copper(r = {}){ return undergroundCostMultiplier('shrine', r.offset, 550, 1.55, 'cave'); }
                },
                effect(){
                    let morale = getShrineBonus('morale');
                    let metal = getShrineBonus('metal');
                    let know = getShrineBonus('know');
                    let tax = getShrineBonus('tax');
    
                    let desc = `<div class="has-text-special">${loc('city_shrine_effect')}</div>`;
                    if (global.city['shrine'] && morale.active){
                        desc = desc + `<div>${loc('city_shrine_morale',[+(morale.add).toFixed(1)])}</div>`;
                    }
                    if (global.city['shrine'] && metal.active){
                        desc = desc + `<div>${loc('city_shrine_metal',[+((metal.mult - 1) * 100).toFixed(2)])}</div>`;
                    }
                    if (global.city['shrine'] && know.active){
                        desc = desc + `<div>${loc('city_shrine_know',[(+(know.add).toFixed(1)).toLocaleString()])}</div>`;
                        desc = desc + `<div>${loc(global.race['warlord'] ? 'city_shrine_warlord' : 'city_shrine_know2',[+((know.mult - 1) * 100).toFixed(1)])}</div>`;
                    }
                    if (global.city['shrine'] && tax.active){
                        desc = desc + `<div>${loc('city_shrine_tax',[+((tax.mult - 1) * 100).toFixed(1)])}</div>`;
                    }
                    return desc;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('shrine','city');
                        global.underground['shrine'].count = global.city['shrine'].count;
                        if (global.city.calendar.moon > 0 && global.city.calendar.moon < 7){
                            global.city.shrine.morale++;
                        }
                        else if (global.city.calendar.moon > 7 && global.city.calendar.moon < 14){
                            global.city.shrine.metal++;
                        }
                        else if (global.city.calendar.moon > 14 && global.city.calendar.moon < 21){
                            global.city.shrine.know++;
                        }
                        else if (global.city.calendar.moon > 21){
                            global.city.shrine.tax++;
                        }
                        else {
                            global.city.shrine.cycle++;
                        }
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['shrine','underground']
                    };
                }
            },
            wonder_fountain: {
                id: 'underground-wonder_fountain',
                title(){ return loc('underground_wonder_fountain'); },
                desc(){ return loc('underground_wonder_fountain'); },
                reqs: {},
                condition(){
                    return global.race['wish'] && global.race['wishStats'] && global.underground['wonder_fountain'];
                },
                trait: ['wish'],
                wiki: false,
                queue_complete(){ return false; },
                effect(){ return loc(`city_wonder_effect`,[5]); },
                action(args){
                    return false;
                }
            },
            banquet: buildTemplate(`banquet`, 'underground'),
            support_beams: {
                id: 'underground-support_beams',
                title(){ return loc('underground_support_beams'); },
                desc(){ return loc('underground_support_beams_desc'); },
                type: 'utility',
                spared: true,
                reqs: { support_beams: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('support_beams', r.offset, 700, (global.tech['support_beams'] < 2 ? 1.9 : 1.75)); },
                    Iron(r = {}){ return global.tech['support_beams'] < 2 ? undergroundCostMultiplier('support_beams', r.offset, 350, 2) : 0; },
                    Steel(r = {}){ return global.tech['support_beams'] === 2 ? undergroundCostMultiplier('support_beams', r.offset, 350, 1.8) : 0; },
                    Titanium(r = {}){ return global.tech['support_beams'] >= 3 ? undergroundCostMultiplier('depths_support_beams', r.offset, 350, 1.75) : 0; }
                },
                effect(){
                    let effect = `<div>${loc('underground_support_beams_effect1', [0.005])}</div><div>${loc('underground_support_beams_effect2', [5])}</div>`;
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
                    Money(r = {}){ return !global.underground.mineshaft.count ? 2600 : 0; },
                    Iron(r = {}){ return !global.underground.mineshaft.count ? 1300 : 0; },
                    Water(r = {}){ return !global.underground.mineshaft.count ? 2400 : 0; }
                },
                effect(){
                    let effect = `<div>${loc("underground_mineshaft_effect1", [$(this)[0].full_depth().toFixed(2)])}</div>`;
                    effect += `<div>${loc("underground_mineshaft_effect2", [($(this)[0].dig_rate()).toFixed(3)])}</div><div>${loc("underground_mineshaft_effect3", [($(this)[0].ice_rate()).toFixed(3)])}</div>`;
                    effect += `<div class="has-text-caution">${loc("underground_mineshaft_effect_warn")}</div>`;
                    return effect;
                },
                special: true,
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
                    let trait_mods = racialTrait(miner_base,'miner'); 
                    if (global.race['tough']){
                        trait_mods *= 1 + (traits.tough.vars()[0] / 100);
                    }
                    let ogreFathom = fathomCheck('ogre');
                    if (ogreFathom > 0){
                        trait_mods *= 1 + (traits.tough.vars(1)[0] / 100 * ogreFathom);
                    }
                    miner_base *= 1 + (trait_mods ** 0.5) - 1; //trait effects are severely reduced
                    if (global.race['industrious']){
                        let bonus = 1 + (geneVars('industrious')[0] * global.race['industrious'] / 100);
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
                    if(global.tech['mineshaft'] >= 2){
                        miner_base *= 1.35;
                    }
                    if(p_on['mineshaft_vator']){
                        miner_base *= 2;
                    }
                    if(global.underground['mineshaft'].depth >= 100000){
                        miner_base *= 0.999 ** (global.underground['mineshaft'].depth - 100000);
                    }
                    return miner_base;
                },
                ice_rate(){
                    if(p_on['mineshaft_vator']){
                        return global.underground['mineshaft'].ice / -1000;
                    }
                    return Math.max(0, Math.min(global.underground['mineshaft'].depth, 100000) - global.underground['mineshaft'].ice) / 1000;
                },
                full_depth(){
                    return global.underground['mineshaft'].depth - global.underground['mineshaft'].ice;
                },
                struct(){
                    return {
                        d: { count: 0, ratio:0, depth:0, ice:0 },
                        p: ['mineshaft','underground']
                    };
                },
                flair(){
                    return loc('underground_mineshaft_flair');
                }
            },
            mineshaft_elevator:{
                id: 'underground-mineshaft_elevator',
                title(){ return loc('underground_mineshaft_elevator'); },
                desc(wiki){
                    if (global.underground['mineshaft_elevator']?.count < 100 || wiki){
                        return `<div>${loc('underground_mineshaft_elevator')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                    }
                    else {
                        return `<div>${loc('underground_mineshaft_elevator')}</div>`;
                    }
                },
                type: 'megaproject',
                spared: true,
                reqs: { mineshaft: 3 },
                condition(){
                    return global.underground.mineshaft_elevator.count < 100;
                },
                queue_size: 10,
                queue_complete(){ return 100 - global.underground.mineshaft_elevator.count; },
                cost: {
                    Money(r = {}){ return ((r.offset || 0) + (global.underground.mineshaft_elevator?.count || 0)) < 100 ? undergroundCostMultiplier('fake', r.offset, 40000, 1, 'cave') : 0; },
                    Wrought_Iron(r = {}){ return ((r.offset || 0) + (global.underground.mineshaft_elevator?.count || 0)) < 100 ? undergroundCostMultiplier('fake', r.offset, 4000, 1, 'cave') : 0; },
                    Alloy(r = {}){ return ((r.offset || 0) + (global.underground.mineshaft_elevator?.count || 0)) < 100 ? undergroundCostMultiplier('fake', r.offset, 50, 1, 'cave') : 0; },
                    Coal(r = {}){ return ((r.offset || 0) + (global.underground.mineshaft_elevator?.count || 0)) < 100 ? undergroundCostMultiplier('fake', r.offset, 15000, 1, 'cave') : 0; },
                },
                effect(wiki){
                    let effectText = `<div>${loc('underground_mineshaft_elevator_effect')}</div>`;
                    let count = (wiki?.count ?? 0) + (global.underground.mineshaft_elevator?.count || 0);
                    if (count < 100){
                        let remain = 100 - count;
                        effectText += `<div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                    }
                    return effectText;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        if (global.underground.mineshaft_elevator.count < 100){
                            incrementStruct($(this)[0]);
                            if (global.underground.mineshaft_elevator.count >= 100){
                                global.tech['mineshaft'] = 4;
                                initStruct(actions.underground.cave.mineshaft_vator);
                                incrementStruct('mineshaft_vator', 'underground');
                                if (global.settings.alwaysPower){
                                    powerOnNewStruct(actions.underground.cave.mineshaft_vator);
                                }
                                renderUnderground();
                            }
                            return true;
                        }
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['mineshaft_elevator','underground']
                    };
                }
            },
            mineshaft_vator: {
                id: 'underground-mineshaft_vator',
                title(){ return loc('underground_mineshaft_elevator'); },
                desc(){
                    return `<div>${loc('underground_mineshaft_elevator')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
                },
                type: 'megaproject',
                spared: true,
                reqs: { mineshaft: 4 },
                condition(){
                    return global.underground.mineshaft_elevator.count >= 100;
                },
                wiki: false,
                queue_complete(){ return 0; },
                cost: {},
                powered(){
                    return powerCostMod(90);
                },
                effect(){
                    return `<div class='has-text-caution'>${loc('spend_power', [$(this)[0].consume('oil'), global.resource.Oil.name, $(this)[0].powered()])}</div>
                        <div>${loc('underground_mineshaft_elevator_effect2')}</div>`;
                },
                consume(res){
                    switch (res){
                        case 'oil':
                            return 100;
                    }
                    return 0
                },
                action(args){
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0, on: 0 },
                        p: ['mineshaft_vator','underground']
                    };
                },
                flair(){
                    return loc('underground_mineshaft_elevator_flair');
                }
            },
        },
        depths: {
            stone_house: {
                id: 'underground-stone_house',
                title(){ return loc('underground_stone_house_title'); },
                desc(){ return loc('underground_stone_house_desc'); },
                type: 'housing',
                reqs: { housing: 2 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('stone_house', r.offset, 6800, 1.65, 'depths'); },
                    Stone(r = {}){ return undergroundCostMultiplier('stone_house', r.offset, 8800, 1.75, 'depths'); },
                    Brick(r = {}){ return undergroundCostMultiplier('stone_house', r.offset, 1600, 1.75, 'depths'); },
                    Wrought_Iron(r = {}){ return undergroundCostMultiplier('stone_house', r.offset, 1800, 1.75, 'depths'); },
                    Horseshoe(){ return global.race['hooved'] ? 2 : 0; }
                },
                effect(){
                    let desc = `<div>${loc('plus_max_citizens',[$(this)[0].citizens()])}</div>`;
                    if (global.tech['home_safe']){
                        desc += `<div>${loc('plus_max_resource',[`\$${$(this)[0].res_cap('money').toLocaleString()}`,loc('resource_Money_name')])}</div>`;
                    }
                    if(global.tech['housing'] >= 3){
                        desc += `<div class="has-text-caution">${loc('underground_housing_powered', [$(this)[0].powered(), 2])}</div>`;
                    }
                    return desc;
                },
                powered(){ return powerCostMod(5); },
                power_reqs: { housing: 3 },
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
                        d: { count: 0 },
                        p: ['stone_house','underground']
                    };
                },
                res_cap(res){
                    switch (res){
                        case 'money':
                            if(global.tech['home_safe']){
                                return spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 5000 : 2000) : 1000);
                            }
                    }
                    return 0
                },
                citizens(){
                    let pop = 3;
                    if (global.race['high_pop']){
                        pop *= traits.high_pop.vars()[0];
                    }
                    return pop;
                }
            },
            hunting_lodge: {
                id: 'underground-hunting_lodge',
                title(){ return loc('underground_hunting_lodge'); },
                desc(){ return loc('underground_hunting_lodge_desc'); },
                type: 'military',
                reqs: { military: 1, housing: 1, mineshaft_depth: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('hunting_lodge', r.offset, 3500, 1.50, 'depths'); },
                    Iron(r = {}){ return undergroundCostMultiplier('hunting_lodge', r.offset, 2950, 1.55, 'depths'); },
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
                        incrementStruct($(this)[0]);
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
                    let soldiers = global.tech['military'] >= 5 ? 4 : 3;
                    if (global.race['chameleon']){
                        soldiers--;
                    }
                    if (global.race['grenadier']){
                        soldiers--;
                    }
                    if (soldiers <= 0){ return 1; }
                    return jobScale(soldiers);
                },
                flair(){ return global.tech['living_extinction'] ? loc('underground_hunting_lodge_flair_danger') : loc('underground_hunting_lodge_flair'); }
            },
            boot_camp: {
                id: 'underground-boot_camp',
                title(){ return global.race['artifical'] ? loc('city_boot_camp_art') : loc('city_boot_camp'); },
                desc(){ return global.race['artifical'] ? loc('city_boot_camp_art_desc',[races[global.race.species].name]) : loc('city_boot_camp_desc'); },
                type: 'military',
                reqs: { boot_camp: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('boot_camp', r.offset, 160000, 1.55, 'depths'); },
                    Aluminium(r = {}){ return undergroundCostMultiplier('boot_camp', r.offset, 120000, 1.65, 'depths'); },
                    Brick(r = {}){ return undergroundCostMultiplier('boot_camp', r.offset, 6000, 1.65, 'depths'); },
                },
                effect(){
                    let rate = global.tech['boot_camp'] >= 2 ? 8 : 5;
                    if (global.blood['lust']){
                        rate += global.blood.lust * 0.2;
                    }
                    let milVal = govActive('militant',0);
                    if (milVal){
                        rate *= 1 + (milVal / 100);
                    }
                    rate = +rate.toFixed(2);
                    let effect = global.tech['spy'] && global.tech['spy'] >= 3 ? `<div>${loc('city_boot_camp_effect',[rate])}</div><div>${loc('city_boot_camp_effect2',[10])}</div>` : `<div>${loc('city_boot_camp_effect',[rate])}</div>`;
                    if (global.race['artifical'] && !global.race['orbit_decayed']){
                        let repair = global.tech['medic'] || 1;
                        effect += `<div>${loc('city_boot_camp_art_effect',[repair * 5])}</div>`;
                    }
                    if (global.race['artifical'] && global.race.hasOwnProperty('vax')){
                        effect += `<div>${loc('tau_home_disease_lab_vax',[+global.race.vax.toFixed(2)])}</div>`;
                    }
                    return effect;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('boot_camp','city');
                        global.underground.boot_camp.count = global.city.boot_camp.count;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['boot_camp','underground']
                    };
                }
            },
            color_garden: {
                id: 'underground-color_garden',
                title(){ return loc('underground_color_garden'); },
                desc(){ return loc('underground_color_garden_desc'); },
                type: 'entertainment',
                spared: true,
                reqs: { theatre: 1 },
                not_trait: ['joyless'],
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('color_garden', r.offset, 5500, 1.60, 'depths'); },
                    Water(r = {}){ return undergroundCostMultiplier('color_garden', r.offset, 2400, 1.65, 'depths'); },
                    Iron(r = {}){ return undergroundCostMultiplier('color_garden', r.offset, 1600, 1.65, 'depths'); },
                },
                effect(){
                    let medic = global.tech['medic'] >= 1 ? `<div>${loc('underground_color_garden_effect2', $(this)[0].mushroom_effect())}`: '';
                    return`<div>${loc('plus_max_resource',[jobScale(1),loc(`job_gardener`)])}</div><div>${loc('city_max_morale',[2])}</div>
                        <div>${loc('underground_color_garden_effect1',[Math.floor(global.underground['color_garden'].mushrooms), $(this)[0].mushroom_effect()])}</div>${medic}`;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        global.civic.iceage_gardener.display = true;
                        return true;
                    }
                    return false;
                },
                mushroom_effect(){
                    return 1;
                },
                struct(){
                    return {
                        d: { count: 0, mushrooms: 0 },
                        p: ['color_garden','underground']
                    };
                },
                flair(){ return global.tech['living_extinction'] ? loc('underground_color_garden_flair_danger') : loc('underground_color_garden_flair'); }
            },
            under_casino: {
                id: 'underground-under_casino',
                title(){ return structName('casino'); },
                desc(){ return structName('casino'); },
                type: 'gambling',
                reqs: { gambling: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('under_casino', r.offset, 350000, 1.65, 'depths'); },
                    Furs(r = {}){ return undergroundCostMultiplier('under_casino', r.offset, 60000, 1.55, 'depths'); },
                    Wrought_Iron(r = {}){ return undergroundCostMultiplier('under_casino', r.offset, 10000, 1.55, 'depths'); },
                    Brick(r = {}){ return undergroundCostMultiplier('under_casino', r.offset, 6000, 1.55, 'depths'); }
                },
                effect(){
                    let desc = casinoEffect();
                    desc += `<div>${loc('space_red_vr_center_effect1', [2])}</div>`;
                    desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                    return desc;
                },
                powered(){ return powerCostMod(global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 2 ? 2 : 3); },
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
                        p: ['under_casino','underground']
                    };
                }
            },
            trade: {
                id: 'underground-trade',
                title(){ return loc('underground_trade'); },
                desc(){ return loc('underground_trade_desc'); },
                type: 'finance',
                reqs: { trade: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('trade', r.offset, 4500, 1.50, 'depths'); },
                    Brick(r = {}){ return undergroundCostMultiplier('trade', r.offset, 750, 1.45, 'depths'); },
                    Steel(r = {}){ return undergroundCostMultiplier('trade', r.offset, 1300, 1.55, 'depths'); },
                    Furs(r = {}){ return undergroundCostMultiplier('trade', r.offset, 1900, 1.55, 'depths'); }
                },
                effect(){
                    return `<div>${loc('underground_trade_effect1',[$(this)[0].routes()])}</div><div>${loc('underground_trade_effect2',[$(this)[0].price_reduction()])}</div>`;
                },
                routes(){
                    let routes = (global.tech['trade'] >= 2) ? 5 : 4;
                    if (global.race['xenophobic'] || global.race['nomadic']){
                        routes--;
                    }
                    if (global.race['flier']){
                        routes += traits.flier.vars()[1];
                    }
                    return routes;
                },
                price_reduction(){
                    return 1;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        global.city.market.mtrade += $(this)[0].routes();
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['trade','underground']
                    };
                }
            },
            statue: {
                id: 'underground-statue',
                title(){ return loc('underground_statue'); },
                desc(){
                    let entity = global.race.gods !== 'none' ? races[global.race.gods.toLowerCase()].entity : races[global.race.species].entity;
                    return  loc('underground_statue_desc',[entity]);
                },
                type: 'religion',
                reqs: { theology: 2 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('statue', r.offset, 1500, 1.5, 'depths'); },
                    Wrought_Iron(r = {}){ return undergroundCostMultiplier('statue', r.offset, 250, 1.55, 'depths'); },
                    Furs(r = {}){ return undergroundCostMultiplier('statue', r.offset, 650, 1.65, 'depths'); },
                    Cement(r = {}){ return undergroundCostMultiplier('statue', r.offset, 1000, 1.65, 'depths'); }
                },
                effect(){
                    let desc = templeEffect();
                    if (global.genes['ancients'] && global.genes['ancients'] >= 2){
                        desc = desc + `<div>${loc('plus_max_resource',[jobScale(1),global.civic?.priest?.name || loc(`job_priest`)])}</div>`;
                    }
                    if (global.race.universe === 'evil'){
                        desc += `<div>${loc('plus_max_resource',[0.5,global.resource.Authority.name])}</div>`;
                    }
                    return desc;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        if (global.genes['ancients'] && global.genes['ancients'] >= 2){
                            global.civic.priest.display = true;
                        }
                        incrementStruct('temple','city');
                        global.underground.statue.count = global.city.temple.count;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['statue','underground']
                    };
                },
            },
            under_foundry: {
                id: 'underground-under_foundry',
                title(){ return loc('city_foundry'); },
                desc(){ return loc('city_foundry_desc'); },
                type: 'industry',
                reqs: { foundry: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('under_foundry', r.offset, 1600, 1.50, 'depths'); },
                    Stone(r = {}){ return undergroundCostMultiplier('under_foundry', r.offset, 2200, 1.55, 'depths'); },
                    Copper(r = {}){ return undergroundCostMultiplier('under_foundry', r.offset, 1900, 1.55, 'depths'); }
                },
                effect(){
                    let desc = `<div>${loc('city_foundry_effect1',[jobScale(1)])}</div>`;
                    if (global.tech['foundry'] >= 2){
                        let skill = global.tech['foundry'] >= 5 ? (global.tech['foundry'] >= 8 ? 8 : 5) : 3;
                        desc += `<div>${loc('city_crafted_mats',[skill])}</div>`;
                    }
                    if (global.tech['foundry'] >= 6){
                        desc += `<div>${loc('city_foundry_effect2',[2,global.resource.Brick.name])}</div>`;
                    }
                    if(!global.race['flier']){
                        desc += `<div>${loc('plus_max_resource',[jobScale(2),loc(`job_cement_worker`)])}</div>`;
                        if(global.tech['cement'] >= 5){
                            let screws = global.tech['cement'] >= 6 ? 8 : 5;
                            desc += `<div class="has-text-caution">${loc('city_cement_plant_effect2',[$(this)[0].powered(),screws])}</div>`;
                        }
                    }
                    return desc;
                },
                powered(){ return powerCostMod(2); },
                power_reqs:{ cement: 5 },
                action(args){
                    if (payCosts($(this)[0])){
                        if (!global.civic.craftsman.display){
                            if(!global.race['flier']){
                                global.resource.Cement.display = true;
                                global.civic.cement_worker.display = true;
                            }
                            global.civic.craftsman.display = true;
                            global.resource.Brick.display = true;
                            global.resource.Wrought_Iron.display = true;
                            messageQueue(loc('city_foundry_msg2'),'info',false,['progress']);
                        }
                        incrementStruct($(this)[0]);
                        powerOnNewStruct($(this)[0]);
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
                        d:{ count: 0 },
                        p: ['under_foundry','underground']
                    };
                }
            },
            under_coal_mine: {
                id: 'underground-under_coal_mine',
                title(){ return loc('city_coal_mine'); },
                desc(){ return loc('city_coal_mine_desc'); },
                type: 'mining',
                reqs: { mining: 4 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('under_coal_mine', r.offset, 3200, 1.50); },
                    Iron(r = {}){ return undergroundCostMultiplier('under_coal_mine', r.offset, 1600, 1.55); },
                    Wrought_Iron(r = {}){ return undergroundCostMultiplier('under_coal_mine', r.offset, 320, 1.45); }
                },
                effect(){
                    let desc = `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_coal_miner`)])}</div>`;
                    if (global.tech['mine_conveyor']){
                        desc += `<div class="has-text-caution">${loc('city_coal_mine_effect2',[$(this)[0].powered(),5])}</div>`;
                    }
                    return desc;
                },
                powered(){ return powerCostMod(1); },
                power_reqs: { mine_conveyor: 1 },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        powerOnNewStruct($(this)[0]);
                        global.resource.Coal.display = true;
                        global.civic.coal_miner.display = true;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['under_coal_mine','underground']
                    };
                }
            },
            smelter: {
                id: 'underground-smelter',
                title(){ return loc('city_smelter'); },
                desc(){ return loc('city_smelter_desc'); },
                type: 'industry',
                reqs: { smelting: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('smelter', r.offset, 4000, 1.50); },
                    Iron(r = {}){ return undergroundCostMultiplier('smelter', r.offset, 1500, 1.55); },
                    Brick(r = {}){ return undergroundCostMultiplier('smelter', r.offset, 500, 1.45); }
                },
                effect(){
                    var iron_yield = global.tech['smelting'] >= 3 ? (global.tech['smelting'] >= 7 ? 15 : 12) : 10;
                    if (global.race['pyrophobia']){
                        iron_yield *= 0.9;
                    }
                    let description = loc('city_smelter_effect1',[iron_yield]);
                    if (global.tech['smelting'] >= 2 && !global.race['steelen']){
                        description = loc('city_smelter_effect2',[iron_yield]);
                    }
                    return `${description}<div>${loc('city_metal_refinery_effect',[6])}`;
                },
                special: true,
                smelting(){
                    return 1;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('smelter','city');
                        let fuel = 'Coal';
                        global.underground['smelter'].count = global.city['smelter'].count;
                        global.city['metal_refinery'].count = global.underground['smelter'].count;
                        global.resource.Aluminium.display = true;
                        addSmelter($(this)[0].smelting(), 'Iron', fuel);
                        if (!global.settings.showIndustry){
                            global.settings.showIndustry = true;
                            global.resource.Steel.display = true;
                            global.resource.Sheet_Metal.display = true;
                            loadFoundry();
                            defineIndustry();
                        }
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['smelter','underground']
                    };
                },
                flair: `<div>${loc('city_smelter_flair1')}<div></div>${loc('city_smelter_flair2')}</div>`
            },
            cave_creatures: {
                id: 'underground-cave_creatures',
                title(){ return loc('underground_cave_creatures'); },
                desc(){ return loc('underground_cave_creatures_desc'); },
                type: 'utility',
                spared: true,
                reqs: { military: 2 },
                cost: {},
                queue_complete(){ return 0; },
                effect(){
                    let wins = 0;
                    for (let i=0;i<18;i++){
                        if(cave_fight(false, global['warseed'] + (i * 1000)).success){
                            wins++;
                        }
                    }
                    wins += seededRandom(-2,2,false, global['warseed']);
                    if(wins < 0){
                        wins = 0;
                    }
                    let calc_odds = (wins * 10 - 100).toFixed(0);
                    return `<div>${loc('underground_cave_creatures_effect', [3])}</div><div>${loc('underground_cave_creatures_effect2', [$(this)[0].group_size()])}</div>
                        <div>${loc(calc_odds >= 0 ? 'civics_garrison_advantage' : 'civics_garrison_disadvantage', [Math.abs(calc_odds)])}</div>`;
                },
                action(args){
                    if(garrisonSize() > 0){
                        let result = cave_fight(true);
                        if(result.revive){
                            if(result.revive === 1){
                                messageQueue(loc("hell_report_log_revived"));
                            }
                            else{
                                messageQueue(loc("hell_report_log_revived_plural", [result.revive]));
                            }
                        }
                        if (result.success){
                            messageQueue(loc('underground_cave_creatures_combat_success', [result.kills, result.deaths, result.injuries]), 'success');
                            incrementStruct($(this)[0]);
                            return true;
                        }
                        else{
                            messageQueue(loc('underground_cave_creatures_combat_failure', [result.kills, result.deaths, result.injuries]), 'danger');
                        }
                    }
                    return false;
                },
                group_size(){
                    return 20 + (5 * global.underground['cave_creatures'].count ) + (global.underground['cave_creatures'].count ** 2) * 4; //20, 27, 38, 43, 72, 95, etc
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['cave_creatures','underground']
                    };
                }
            },
            depths_support_beams: {
                id: 'underground-depths_support_beams',
                title(){ return loc('underground_support_beams'); },
                desc(){ return loc('underground_support_beams_desc'); },
                type: 'utility',
                spared: true,
                reqs: { support_beams: 2 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('depths_support_beams', r.offset, 700, 1.75); },
                    Steel(r = {}){ return global.tech['support_beams'] === 2 ? undergroundCostMultiplier('depths_support_beams', r.offset, 350, 1.8) : 0; },
                    Titanium(r = {}){ return global.tech['support_beams'] === 3 ? undergroundCostMultiplier('depths_support_beams', r.offset, 350, 1.75) : 0; },
                },
                effect(){
                    let effect = `<div>${loc('underground_depths_support_beams_effect1', [0.005])}</div><div>${loc('underground_depths_support_beams_effect2', [5])}</div>`;
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
                        p: ['depths_support_beams','underground']
                    };
                }
            },
        },
        industry:{
            archaeological_dig:{
                id: 'underground-archaeological_dig',
                title(){ return loc('portal_archaeology_title'); },
                desc(){ return loc('underground_archaeological_dig_desc'); },
                type: 'science',
                reqs: { mineshaft_depth: 2 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('archaeological_dig', r.offset, 32000, 1.55, 'industry'); },
                    Furs(r = {}){ return undergroundCostMultiplier('archaeological_dig', r.offset, 25000, 1.65, 'industry'); },
                    Sheet_Metal(r = {}){ return undergroundCostMultiplier('archaeological_dig', r.offset, 2500, 1.55, 'industry'); },
                    Water(r = {}){ return undergroundCostMultiplier('archaeological_dig', r.offset, 25000, 1.65, 'industry'); },
                    Crystal(r = {}){ return global.race.universe === 'magic' ? undergroundCostMultiplier('archaeological_dig', r.offset, 3600, 1.65, 'industry') : 0; }
                },
                effect(wiki){
                    let desc = `<div>${loc('portal_archaeology_effect',[jobScale(1)])}</div>${ false ? `<div>${loc('underground_archaeological_dig_effect1',[(100 / $(this)[0].fossil_chance()).toFixed(2)])}</div>` : ''}
                        <div>${loc('underground_archaeological_dig_effect2',[global.underground['archaeological_dig'].fossils, ($(this)[0].knowVal()).toFixed(0)])}</div>`;
                    if(global.tech['high_tech'] >= 2){
                        desc += `<div class="has-text-caution">${loc('underground_archaeological_dig_effect3',[$(this)[0].powered(), 15])}</div>`;
                    }
                    return desc;
                    
                },
                knowVal(){
                    let knowledge = 200;
                    if(p_on['archaeological_dig']){
                        knowledge += 15 * p_on['archaeological_dig'];
                    }
                    if(p_on['under_biolab']){
                        knowledge *= 1 + (0.02 * p_on['under_biolab'] * actions.underground.industry.under_biolab.bio_effect());
                    }
                    if(global.tech['science'] >= 7){
                        knowledge *= 1.4;
                    }
                    return knowledge;
                },
                fossil_chance(){ //1 = 1 in 1 (100%), 2 = 1 in 2 (50%), etc
                    let base = 10;
                    base += 20 * global.underground['archaeological_dig'].fossils;
                    let workers = workerScale(global.civic.archaeologist.workers,'archaeologist');
                    if(global.tech['science'] >= 6){
                        workers *= 1 + (0.02 * highPopAdjust(workerScale(global.civic.professor.workers, 'professor')));
                    }
                    base /= workers;
                    if(p_on['archaeological_dig']){
                        base -= 20 * p_on['archaeological_dig'];
                        base *= 0.99 ** p_on['archaeological_dig'];
                    }
                    base = Math.max(1, base);
                    return base;
                },
                powered(){ return powerCostMod(2); },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        global.civic.archaeologist.display = true;
                        powerOnNewStruct($(this)[0]);
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0, on: 0, fossils: 0 },
                        p: ['archaeological_dig','underground']
                    };
                }
            },
            under_biolab: {
                id: 'underground-under_biolab',
                title(){ return loc('city_biolab'); },
                desc(){ return `<div>${loc('city_biolab_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
                type: 'science',
                reqs: { genetics: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('under_biolab', r.offset, 65000, 1.55, 'industry'); },
                    Knowledge(r = {}){ return undergroundCostMultiplier('under_biolab', r.offset, 10000, 1.65, 'industry'); },
                    Titanium(r = {}){ return undergroundCostMultiplier('under_biolab', r.offset, 6500, 1.65, 'industry'); },
                    Alloy(r = {}){ return undergroundCostMultiplier('under_biolab', r.offset, 5000, 1.65, 'industry'); }
                },
                effect(wiki){
                    let fossil_effect = (2 * $(this)[0].bio_effect()).toFixed(2);
                    return `<span>${loc('underground_biolab_effect',[fossil_effect])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span>`;
                },
                powered(){ return powerCostMod(3); },
                bio_effect(){
                    let effect = 1;
                    if (global.race['elemental'] && traits.elemental.vars()[0] === 'frost'){
                        effect *= 1 + (traits.elemental.vars()[4] * global.resource[global.race.species].amount / 100);
                    }
                    return effect;
                },
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
                        p: ['under_biolab','underground']
                    };
                }
            },
            coal_power:{
                id: 'underground-coal_power',
                title(){
                    return global.race['environmentalist'] ? loc('city_hydro_power') : loc(global.race.universe === 'magic' ? 'city_mana_engine' : 'city_coal_power');
                },
                desc(){
                    return global.race['environmentalist']
                        ? `<div>${loc('city_hydro_power_desc')}</div>`
                        : `<div>${loc(global.race.universe === 'magic' ? 'city_mana_engine_desc' : 'city_coal_power_desc')}</div><div class="has-text-special">${loc('requires_res',[loc(global.race.universe === 'magic' ? 'resource_Mana_name' : 'resource_Coal_name')])}</div>`;
                },
                type: 'power',
                reqs: { high_tech: 2 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('coal_power', r.offset, 10000, 1.55, 'industry'); },
                    Crystal(r = {}){ return global.race.universe === 'magic' ? undergroundCostMultiplier('coal_power', r.offset, 125, 1.65, 'industry') : 0; },
                    Copper(r = {}){ return undergroundCostMultiplier('coal_power', r.offset, 1800, 1.65, 'industry'); },
                    Cement(r = {}){ return undergroundCostMultiplier('coal_power', r.offset, 600, 1.65, 'industry'); },
                    Steel(r = {}){ return undergroundCostMultiplier('coal_power', r.offset, 2000, 1.65, 'industry'); }
                },
                effect(){
                    let consume = $(this)[0].p_fuel().a;
                    let power = -($(this)[0].powered());
                    return global.race['environmentalist'] ? `+${power}MW` : `<span>+${power}MW.</span> <span class="has-text-caution">${loc(global.race.universe === 'magic' ? 'city_mana_engine_effect' : 'city_coal_power_effect',[consume])}</span>`;
                },
                powered(wiki){
                    let power = global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 1 ? -6 : -5;
                    if (!wiki && global.race['environmentalist']){
                        power -= traits.environmentalist.vars()[0];
                    }
                    let dirt = govActive('dirty_jobs',1);
                    if (dirt){ power -= dirt; }
                    return powerModifier(power);
                },
                p_fuel(){
                    if(global.race['environmentalist']){
                        return { r: 'Water', a: 3 };
                    }
                    else if (global.race.universe === 'magic'){
                        return { r: 'Mana', a: 0.25 };
                    }
                    else {
                        return { r: 'Coal', a: 2 };
                    }
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        global.underground['coal_power'].on++;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0, on: 0 },
                        p: ['coal_power','underground']
                    };
                }
            },
            water_pump: {
                id: 'underground-water_pump',
                title(){ return loc('underground_water_pump'); },
                desc(){
                    return `<div>${loc('underground_water_pump')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
                },
                type: 'production',
                reqs: { water: 4 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('water_pump', r.offset, 46000, 1.55, 'industry'); },
                    Titanium(r = {}){ return undergroundCostMultiplier('water_pump', r.offset, 1200, 1.65, 'industry'); },
                    Copper(r = {}){ return undergroundCostMultiplier('water_pump', r.offset, 32000, 1.65, 'industry'); },
                    Sheet_Metal(r = {}){ return undergroundCostMultiplier('water_pump', r.offset, 4000, 1.55, 'industry'); }
                },
                effect(wiki){
                    let prod = production('water_pump');
                    let max = $(this)[0].res_cap('water');
                    return `<div>${loc('gain',[prod, global.resource.Water.name])}</div><div>${loc('plus_max_resource',[max,global.resource.Water.name])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                },
                powered(){ return powerCostMod(3); },
                powerBalancer(){
                    return [{ r: 'Water', k: 'lpmod' }];
                },
                res_cap(res){
                    switch (res){
                        case 'water':
                            return iceAgeStorage(200);
                    }
                    return 0
                },
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
                        p: ['water_pump','underground']
                    };
                }
            },
            under_factory: {
                id: 'underground-under_factory',
                title(){ return loc('city_factory'); },
                desc(){ return `<div>${loc('city_factory_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
                type: 'industry',
                reqs: { high_tech: 3 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('under_factory', r.offset, 55000, 1.55, 'industry'); },
                    Cement(r = {}){ return undergroundCostMultiplier('under_factory', r.offset, 45000, 1.65, 'industry'); },
                    Steel(r = {}){ return undergroundCostMultiplier('under_factory', r.offset, 32000, 1.65, 'industry'); },
                    Titanium(r = {}){ return undergroundCostMultiplier('under_factory', r.offset, 8000, 1.65, 'industry'); }
                },
                effect(){
                    let desc = `<div>${loc('underground_under_factory_effect', [$(this)[0].lines()])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                    if (global.tech['foundry'] >= 7){
                        desc = desc + `<div>${loc('city_crafted_mats',[5])}</div>`;
                    }
                    return desc;
                },
                powered(){ return powerCostMod(3); },
                special: true,
                lines(){ return 2; },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        if (!global.resource.Alloy.display){
                            global.resource.Alloy.display = true;
                            if (global.tech['polymer']){
                                global.resource.Polymer.display = true;
                            }
                            global.settings.showIndustry = true;
                            defineIndustry();
                        }
                        if (powerOnNewStruct($(this)[0])){
                            factoryData.addFactoryLines(1);
                        }
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count:0, on:0 },
                        p: ['under_factory','underground']
                    };
                },
            },
            oil_pump: {
                id: 'underground-oil_pump',
                title(){ return global.race['blubber'] ? loc('tech_oil_refinery') : loc('underground_oil_pump'); },
                desc(){ return global.race['blubber'] ? loc('city_oil_well_blubber') : loc('underground_oil_pump_desc'); },
                type: 'mining',
                reqs: { oil: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('oil_pump', r.offset, 35000, 1.55, 'industry'); },
                    Wrought_Iron(r = {}){ return undergroundCostMultiplier('oil_pump', r.offset, 2700, 1.55, 'industry'); },
                    Cement(r = {}){ return undergroundCostMultiplier('oil_pump', r.offset, 26000, 1.65, 'industry'); },
                    Steel(r = {}){ return undergroundCostMultiplier('oil_pump', r.offset, 21000, 1.65, 'industry'); }
                },
                effect(){
                    let oil = +$(this)[0].production().toFixed(2);
                    let oc = $(this)[0].res_cap('oil');
                    let desc = `<div>${loc('city_oil_well_effect',[oil,oc])}</div>`;
                    if (global.race['blubber'] && global.underground.hasOwnProperty('oil_pump')){
                        let maxDead = global.underground.oil_pump.count;
                        desc += `<div>${loc('city_oil_well_bodies',[+(global.city.oil_well.dead).toFixed(1),50 * maxDead])}</div>`;
                        desc += `<div>${loc('city_oil_well_consume',[traits.blubber.vars()[0]])}</div>`;
                    }
                    desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                    return desc;
                },
                production(){
                    return production('oil_well') * 2.5;
                },
                powered(){ return powerCostMod(2); },
                res_cap(res){
                    switch (res){
                        case 'oil':
                            return iceAgeStorage(50);
                    }
                    return 0
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        if (!global.resource.Oil.display) {
                            global.resource.Oil.display = true;
                            defineIndustry();
                        }
                        powerOnNewStruct($(this)[0]);
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0, dead: 0 },
                        p: ['oil_pump','underground']
                    };
                },
                flair: loc('underground_oil_pump_flair')
            },
            under_oil_power: {
                id: 'underground-under_oil_power',
                title(){
                    return global.race['environmentalist'] ? loc('underground_thermal_power') : loc('city_oil_power');
                },
                desc(){
                    return global.race['environmentalist']
                        ? `<div>${loc('underground_thermal_power_desc')}</div>`
                        : `<div>${loc('city_oil_power_desc')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Oil.name])}</div>`
                },
                type: 'power',
                reqs: { oil: 3 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('under_oil_power', r.offset, 50000, 1.55, 'industry'); },
                    Copper(r = {}){ return undergroundCostMultiplier('under_oil_power', r.offset, 6500, 1.65, 'industry'); },
                    Aluminium(r = {}){ return undergroundCostMultiplier('under_oil_power', r.offset, 12000, 1.65, 'industry'); },
                    Steel(r = {}){ return undergroundCostMultiplier('under_oil_power', r.offset, 5600, 1.65, 'industry'); }
                },
                effect(){
                    let power = -($(this)[0].powered());
                    return global.race['environmentalist'] ? `+${power}MW` : `<span>+${power}MW.</span> <span class="has-text-caution">${loc('city_oil_power_effect',[$(this)[0].p_fuel().a])}</span>`;
                },
                powered(wiki){
                    let power = 0;
                    if (global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 3){
                        power = global.stats.achieve['dissipated'].l >= 5 ? -8 : -7;
                    }
                    else {
                        power = -6;
                    }
                    if (!wiki && global.race['environmentalist']){
                        power -= traits.environmentalist.vars()[0];
                        power -= global.city.calendar.temp - 1; //+1 power for hot, -1 for cold
                    }
                    let dirt = govActive('dirty_jobs',1);
                    if (dirt){ power -= dirt; }
                    return powerModifier(power);
                },
                p_fuel(){ return { r: 'Oil', a: global.race['environmentalist'] ? 0 : 2 }; },
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
                        p: ['under_oil_power','underground']
                    };
                },
            },
            fluid_depot: {
                id: 'underground-fluid_depot',
                title(){ return loc('underground_fluid_depot'); },
                desc(){ return loc('underground_fluid_depot_desc'); },
                type: 'storage',
                reqs: { oil: 2 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('fluid_depot', r.offset, 34000, 1.55, 'industry'); },
                    Alloy(r = {}){ return undergroundCostMultiplier('fluid_depot', r.offset, 2400, 1.65, 'industry'); },
                    Cement(r = {}){ return undergroundCostMultiplier('fluid_depot', r.offset, 30000, 1.65, 'industry'); },
                    Sheet_Metal(r = {}){ return undergroundCostMultiplier('fluid_depot', r.offset, 4500, 1.65, 'industry'); }
                },
                effect() {
                    let storage = '';
                    storage += '<div class="aTable">';
                    for (const res of $(this)[0].res_list()){
                        if (global.resource[res].display){
                            let val = sizeApproximation(+$(this)[0].res_cap(res).toFixed(0),1);
                            storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                        }
                    };
                    storage = storage + '</div>';
                    return storage;
                },
                res_list(){
                    return ['Oil', 'Water'];
                },
                res_cap(res){
                    let storage = {
                        Oil: 500,
                        Water: 500
                    }
                    return iceAgeStorage(storage[res] || 0);
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
                        p: ['fluid_depot','underground']
                    };
                }
            },
            industrial_support_beams: {
                id: 'underground-industrial_support_beams',
                title(){ return loc('underground_support_beams'); },
                desc(){ return loc('underground_support_beams_desc'); },
                type: 'utility',
                spared: true,
                reqs: { support_beams: 2 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('industrial_support_beams', r.offset, 700, 1.75); },
                    Steel(r = {}){ return global.tech['support_beams'] === 2 ? undergroundCostMultiplier('industrial_support_beams', r.offset, 350, 1.8) : 0; },
                    Titanium(r = {}){ return global.tech['support_beams'] === 3 ? undergroundCostMultiplier('industrial_support_beams', r.offset, 350, 1.75) : 0; },
                },
                effect(){
                    let effect = `<div>${loc('underground_industrial_support_beams_effect1', [0.005])}</div><div>${loc('underground_industrial_support_beams_effect2', [5])}</div>`;
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
                        p: ['industrial_support_beams','underground']
                    };
                }
            }
        },
        core:{
            core_mine: {
                id: 'underground-core_mine',
                title(){ return loc('underground_core_mine'); },
                desc(){ return loc('underground_core_mine'); },
                type: 'mining',
                reqs: { core: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('core_mine', r.offset, 52000, 1.55, 'core'); },
                    Alloy(r = {}){ return undergroundCostMultiplier('core_mine', r.offset, 8000, 1.65, 'core'); },
                    Titanium(r = {}){ return undergroundCostMultiplier('core_mine', r.offset, 12000, 1.65, 'core'); },
                    Aluminium(r = {}){ return undergroundCostMultiplier('core_mine', r.offset, 43000, 1.65, 'core'); }
                },
                effect(){
                    let desc = `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_core_miner`)])}</div>`;
                    desc += `<div class="has-text-caution">${loc('spend', [$(this)[0].consume('water'), global.resource.Water.name])}, 
                    ${loc('spend', [$(this)[0].consume('steel'), global.resource.Steel.name])}, 
                    ${loc('spend', [$(this)[0].consume('alloy'), global.resource.Alloy.name])}</div>`;
                    desc += `<div class="has-text-special">${loc('underground_core_mine_effect1', [global.resource.Steel.name, global.resource.Alloy.name])}</div>`;
                    return desc;
                },
                consume(res){
                    switch (res){
                        case 'water':
                            return 100;
                        case 'steel':
                            return 2 * (p_on['core_mine'] || 1);
                        case 'alloy':
                            return 0.5 * (p_on['core_mine'] || 1);
                    }
                    return 0
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        global.resource.Iridium.display = true;
                        global.civic.core_miner.display = true;
                        powerOnNewStruct($(this)[0]);
                        return true;
                    }
                    return false;
                },
                powered(){ return 0; },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['core_mine','underground']
                    };
                }
            },
            core_tap: {
                id: 'underground-core_tap',
                title(){
                    return loc('underground_core_tap');
                },
                desc(){
                    return loc('underground_core_tap_desc');
                },
                type: 'power',
                reqs: { core: 2 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('core_tap', r.offset, 120000, 1.55, 'core'); },
                    Iron(r = {}){ return undergroundCostMultiplier('core_tap', r.offset, 135000, 1.65, 'core'); },
                    Copper(r = {}){ return undergroundCostMultiplier('core_tap', r.offset, 120000, 1.65, 'core'); },
                    Iridium(r = {}){ return undergroundCostMultiplier('core_tap', r.offset, 1500, 1.65, 'core'); },
                },
                effect(){
                    return `<span>+${-($(this)[0].powered())}MW.</span> <span class="has-text-caution">${loc('spend',[$(this)[0].p_fuel().a, global.resource.Water.name])}</span>`;
                },
                powered(wiki){
                    let effect = 1;
                    if(global.tech['mineshaft'] >= 5 && global.underground['mineshaft']){
                        let mineshaft_effect = 1 + (actions.underground.cave.mineshaft.full_depth() - 100000) * 0.00003;
                        if(mineshaft_effect >= 1){
                            effect *= mineshaft_effect;
                        }
                    }
                    return (powerModifier(-35) * effect).toFixed(2);
                },
                p_fuel(){ return { r: 'Water', a: 60 }; },
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
                        p: ['core_tap','underground']
                    };
                }
            },
            core_forge: {
                id: 'underground-core_forge',
                title(){
                    return loc('underground_core_forge');
                },
                desc(){
                    return loc('underground_core_forge_desc');
                },
                type: 'industry',
                reqs: { core: 3 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('core_forge', r.offset, 250000, 1.55, 'core'); },
                    Coal(r = {}){ return undergroundCostMultiplier('core_forge', r.offset, 220000, 1.65, 'core'); },
                    Wrought_Iron(r = {}){ return undergroundCostMultiplier('core_forge', r.offset, 15000, 1.55, 'core'); },
                    Iridium(r = {}){ return undergroundCostMultiplier('core_forge', r.offset, 4000, 1.65, 'core'); },
                },
                effect(){
                    return `<div>${loc('interstellar_stellar_forge_effect3', [3])}</div><div>${loc('underground_core_forge_effect', [8])}</div>
                        <span class="has-text-caution">${loc('spend',[$(this)[0].consume('water'), global.resource.Water.name])}</span>
                        <span class="has-text-caution">${loc('spend',[$(this)[0].consume('coal'), global.resource.Coal.name])}</span>`;
                },
                consume(res){
                    switch (res){
                        case 'water':
                            return 70;
                        case 'coal':
                            return 30;
                    }
                    return 0
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        powerOnNewStruct($(this)[0]);
                        return true;
                    }
                    return false;
                },
                powered(){ return 0; },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['core_forge','underground']
                    };
                }
            },
            core_refinery: {
                id: 'underground-core_refinery',
                title(){
                    return loc('underground_core_refinery');
                },
                desc(){
                    return loc('underground_core_refinery_desc');
                },
                type: 'industry',
                reqs: { core: 3 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('core_refinery', r.offset, 310000, 1.55, 'core'); },
                    Stone(r = {}){ return undergroundCostMultiplier('core_refinery', r.offset, 230000, 1.65, 'core'); },
                    Alloy(r = {}){ return undergroundCostMultiplier('core_refinery', r.offset, 55000, 1.65, 'core'); },
                    Brick(r = {}){ return undergroundCostMultiplier('core_refinery', r.offset, 15000, 1.55, 'core'); },
                },
                effect(){
                    return `<div>${loc('underground_core_refinery_effect', [5])}</div>
                        <span class="has-text-caution">${loc('spend',[$(this)[0].consume('water'), global.resource.Water.name])}</span>
                        <span class="has-text-caution">${loc('spend',[$(this)[0].consume('oil'), global.resource.Oil.name])}</span>`;
                },
                consume(res){
                    switch (res){
                        case 'water':
                            return 40;
                        case 'oil':
                            return 10;
                    }
                    return 0
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        powerOnNewStruct($(this)[0]);
                        return true;
                    }
                    return false;
                },
                powered(){ return 0; },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['core_refinery','underground']
                    };
                }
            },
            core_blacksmith: {
                id: 'underground-core_blacksmith',
                title(){
                    return loc('underground_core_blacksmith');
                },
                desc(){
                    return loc('underground_core_blacksmith_desc');
                },
                type: 'industry',
                reqs: { core: 3 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('core_blacksmith', r.offset, 410000, 1.55, 'core'); },
                    Steel(r = {}){ return undergroundCostMultiplier('core_blacksmith', r.offset, 280000, 1.65, 'core'); },
                    Sheet_Metal(r = {}){ return undergroundCostMultiplier('core_blacksmith', r.offset, 8000, 1.55, 'core'); },
                    Iridium(r = {}){ return undergroundCostMultiplier('core_blacksmith', r.offset, 4800, 1.65, 'core'); },
                },
                effect(){
                    return `<div>${loc('city_foundry_effect1', [2])}</div><div>${loc('city_crafted_mats', [20])}</div>
                        <span class="has-text-caution">${loc('spend',[$(this)[0].consume('water'), global.resource.Water.name])}</span>
                        <span class="has-text-caution">${loc('spend',[$(this)[0].consume('titanium'), global.resource.Titanium.name])}</span>`;
                },
                consume(res){
                    switch (res){
                        case 'water':
                            return 60;
                        case 'titanium':
                            return 10;
                    }
                    return 0
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        if (!global.resource['Mythril'].display){
                            global.resource['Mythril'].display = true;
                            loadFoundry();
                        }
                        powerOnNewStruct($(this)[0]);
                        return true;
                    }
                    return false;
                },
                powered(){ return 0; },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['core_blacksmith','underground']
                    };
                }
            },
            core_support_beams: {
                id: 'underground-core_support_beams',
                title(){ return loc('underground_support_beams'); },
                desc(){ return loc('underground_support_beams_desc'); },
                type: 'utility',
                spared: true,
                reqs: { support_beams: 3, mineshaft_depth: 3 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('core_support_beams', r.offset, 700, 1.75); },
                    Titanium(r = {}){ return undergroundCostMultiplier('core_support_beams', r.offset, 350, 1.75); },
                },
                effect(){
                    let effect = `<div>${loc('underground_core_support_beams_effect1', [0.005])}</div><div>${loc('underground_core_support_beams_effect2', [5])}</div>`;
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
                        p: ['core_support_beams','underground']
                    };
                }
            }
        }
    },
    surface: {
        wastes: {
            info: {
                name: global.tech['crater'] >= 5 ? loc('surface_wastes2') : loc('surface_wastes'),
                desc: global.tech['crater'] >= 5 ? loc('surface_wastes2_desc') : loc('surface_wastes_desc'),
                support: 'great_heater'
            },
            great_heater: {
                id: 'surface-great_heater',
                title(){ return loc('surface_great_heater'); },
                desc(){ return `<div>${loc('surface_great_heater_desc')}</div>`; },
                type: 'outpost',
                reqs: { surface: 2 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('great_heater', r.offset, 22000, 1.4, 'wastes', 'surface'); },
                    Cement(r = {}){ return undergroundCostMultiplier('great_heater', r.offset, 18000, 1.45, 'wastes', 'surface'); },
                    Copper(r = {}){ return undergroundCostMultiplier('great_heater', r.offset, 7800, 1.45, 'wastes', 'surface'); },
                    Polymer(r = {}){ return undergroundCostMultiplier('great_heater', r.offset, 12500, 1.45, 'wastes', 'surface'); }
                },
                effect(wiki){
                    let desc = `<div>${loc('galaxy_foothold_effect', [$(this)[0].support(), loc('surface_wastes')])}</div>`;
                    desc += `<div class="has-text-caution">${loc('minus_power', [$(this)[0].powered()])}</div>`;
                    return desc;
                },
                support(){ return global.tech['surface_uranium'] >= 3 ? 3 : 2; },
                /*support_fuel(){ return { r: 'Oil', a: 2 }; },*/
                powered(){ return powerCostMod(35); },
                powerBalancer(){
                    return [{ s: global.surface.great_heater.s_max - global.surface.great_heater.support }];
                },
                refresh: true,
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        powerOnNewStruct($(this)[0]);
                        if (global.surface['great_heater'].count === 1 && global.tech['surface'] === 2){
                            global.tech['surface'] = 3;
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
                        p: ['great_heater','surface']
                    };
                }
            },
            watch_tower: {
                id: 'surface-watch_tower',
                title(){ return loc('surface_watch_tower'); },
                desc(){ return loc('surface_watch_tower_desc'); },
                type: 'military',
                reqs: { wastes: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('watch_tower', r.offset, 3500, 1.45, 'wastes', 'surface'); },
                    Plywood(r = {}){ return undergroundCostMultiplier('watch_tower', r.offset, 2950, 1.55, 'wastes', 'surface'); },
                    Mythril(r = {}){ return undergroundCostMultiplier('watch_tower', r.offset, 2950, 1.45, 'wastes', 'surface'); },
                    Furs(r = {}){ return undergroundCostMultiplier('watch_tower', r.offset, 2950, 1.55, 'wastes', 'surface'); },
                    Horseshoe(){ return global.race['hooved'] ? $(this)[0].soldiers() : 0; }
                },
                effect(){
                    let bunks = $(this)[0].soldiers();
                    let desc = `<div class="has-text-caution">${loc('space_used_support', [loc('surface_wastes')])}, ${loc('spend', [$(this)[0].consume('food'), global.resource.Food.name])}</div>`;
                    if (global.race.universe === 'evil'){
                        desc += `<div>${loc('plus_max_resource',[1,global.resource.Authority.name])}</div>`;
                    }
                    desc += `<div>${loc('surface_watch_tower_effect', [4])}</div>`;
                    desc += `<div>${loc('plus_max_resource',[bunks,loc('civics_garrison_soldiers')])}</div>`;
                    return desc;
                },
                consume(res){
                    switch (res){
                        case 'food':
                            return 25;
                    }
                    return 0
                },
                s_type: 'wastes',
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
                soldiers(){
                    let soldiers = 5;
                    if (global.race['grenadier']){
                        soldiers--;
                    }
                    return jobScale(soldiers);
                },
                struct(){
                    return {
                        d: { count: 0, on: 0, explore: 0, time:0 },
                        p: ['watch_tower','surface']
                    };
                }
            },
            woodcutter: {
                id: 'surface-woodcutter',
                title(){ return loc('surface_woodcutter'); },
                desc(){ return loc('surface_woodcutter_desc'); },
                type: 'mining',
                reqs: { surface: 3 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('woodcutter', r.offset, 200000, 1.45, 'wastes', 'surface'); },
                    Brick(r = {}){ return undergroundCostMultiplier('woodcutter', r.offset, 28000, 1.45, 'wastes', 'surface'); },
                    Iron(r = {}){ return undergroundCostMultiplier('woodcutter', r.offset, 11000, 1.55, 'wastes', 'surface'); },
                },
                effect(){
                    let desc = `<div class="has-text-caution">${loc('space_used_support', [loc('surface_wastes')])}</div>`;
                    desc += `<div>${loc('production',[8,global.resource.Lumber.name])}</div>`;
                    return desc;
                },
                special: true,
                s_type: 'wastes',
                support(){ return -1; },
                powered(){ return 0; },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        powerOnNewStruct($(this)[0]);
                        global.civic.lumberjack.display = true;
                        global.resource.Lumber.display = true;
                        global.resource.Plywood.display = true;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0, on: 0 },
                        p: ['woodcutter','surface']
                    };
                },
                flair(){ return global.tech['living_extinction'] ? loc('surface_woodcutter_flair_danger') : loc('surface_woodcutter_flair'); }
            },
            surface_apartment: {
                id: 'surface-surface_apartment',
                title(){
                    return housingLabel('large');
                },
                desc(){
                    return `<div>${loc('city_apartment_desc',[$(this)[0].citizens()])}</div>`;
                },
                type: 'housing',
                reqs: { housing: 4 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('surface_apartment', r.offset, 150000, 1.45, 'wastes', 'surface'); },
                    Furs(r = {}){ return undergroundCostMultiplier('surface_apartment', r.offset, 68000, 1.55, 'wastes', 'surface'); },
                    Lumber(r = {}){ return undergroundCostMultiplier('surface_apartment', r.offset, 1200, 1.55, 'wastes', 'surface'); },
                    Cement(r = {}){ return undergroundCostMultiplier('surface_apartment', r.offset, 75000, 1.55, 'wastes', 'surface'); },
                    Steel(r = {}){ return undergroundCostMultiplier('surface_apartment', r.offset, 44000, 1.55, 'wastes', 'surface'); },
                    Horseshoe(){ return global.race['hooved'] ? 5 : 0; }
                },
                effect(){
                    let pop = $(this)[0].citizens();
                    let desc = `<div class="has-text-caution">${loc('space_used_support', [loc('surface_wastes')])}</div><div>${loc('plus_max_citizens',[pop])}</div>`;
                    if (global.tech['home_safe']){
                        desc += `<div>${loc('plus_max_resource',[`\$${$(this)[0].res_cap('money').toLocaleString()}`,loc('resource_Money_name')])}</div>`;
                    }
                    return desc;
                },
                res_cap(res){
                    switch (res){
                        case 'money':
                            if(global.tech['home_safe']){
                                let extraVal = govActive('extravagant',2);
                                let safe = (global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 10000 : 5000) : 2000);
                                if (extraVal){
                                    safe *= 2;
                                }
                                return spatialReasoning(safe);
                            }
                    }
                    return 0
                },
                powered(){
                    let extraVal = govActive('extravagant',1);
                    return powerCostMod(extraVal ? extraVal : 1);
                },
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
                        p: ['surface_apartment','surface']
                    };
                },
                citizens(){
                    let extraVal = govActive('extravagant',2);
                    let pop = extraVal ? 5 + extraVal : 5;
                    if (global.race['high_pop']){
                        pop *= traits.high_pop.vars()[0];
                    }
                    return pop;
                }
            },
            genetics_lab: {
                id: 'surface-genetics_lab',
                title(){ return loc('surface_genetics_lab'); },
                desc(){ return `<div>${loc('surface_genetics_lab_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
                type: 'science',
                reqs: { surface: 5 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('genetics_lab', r.offset, 65000, 1.45, 'wastes', 'surface'); },
                    Plywood(r = {}){ return undergroundCostMultiplier('genetics_lab', r.offset, 14000, 1.45, 'wastes', 'surface'); },
                    Aluminium(r = {}){ return undergroundCostMultiplier('genetics_lab', r.offset, 6500, 1.55, 'wastes', 'surface'); },
                    Alloy(r = {}){ return undergroundCostMultiplier('genetics_lab', r.offset, 5000, 1.55, 'wastes', 'surface'); }
                },
                effect(wiki){
                    let desc = `<span class="has-text-caution">${loc('space_used_support', [loc('surface_wastes')])}</span>`;
                    if(global.surface.trees){
                        desc += `<div>${loc('surface_genetics_lab_effect1', [(35 * ecoMinorTraitEffect('trees', 'curious')).toFixed(0)])}</div>`;
                    }
                    if(global.surface.herbivores){
                        desc += `<div>${loc('surface_genetics_lab_effect2', [(80 * ecoMinorTraitEffect('trees', 'curious')).toFixed(0)])}</div>`;
                    }
                    if(global.surface.carnivores){
                        desc += `<div>${loc('surface_genetics_lab_effect3', [(200 * ecoMinorTraitEffect('trees', 'curious')).toFixed(0)])}</div>`;
                    }
                    if(global.surface.scavengers){
                        desc += `<div>${loc('surface_genetics_lab_effect4', [(60 * ecoMinorTraitEffect('trees', 'curious')).toFixed(0)])}</div>`;
                    }
                    desc += `<div>${loc('surface_genetics_lab_effect5')}</div>`;
                    //desc += `<div>${loc('surface_genetics_lab_effect3', [(100 / $(this)[0].creation_cooldown_mult() - 100).toFixed(0)])}</div>`;
                    return desc;
                },
                knowVal(){
                    let result = 35 * (global.surface.trees?.count || 0) * ecoMinorTraitEffect('trees', 'curious');
                    result += 80 * (global.surface.herbivores?.count || 0) * ecoMinorTraitEffect('herbivores', 'curious');
                    result += 200 * (global.surface.carnivores?.count || 0) * ecoMinorTraitEffect('carnivores', 'curious');
                    result += 60 * (global.surface.scavengers?.count || 0) * ecoMinorTraitEffect('scavengers', 'curious');
                    return result;
                },
                creation_cooldown_mult(){
                    return 1 / (support_on['genetics_lab'] || 1);
                },
                s_type: 'wastes',
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
                        p: ['genetics_lab','surface']
                    };
                }
            },
            surface_farm: {
                id: 'surface-surface_farm',
                title(){ return structName('surface_farm'); },
                desc(){ return structName('surface_farm'); },
                type: 'farming',
                reqs: { agriculture: 2 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('surface_farm', r.offset, 100000, 1.45, 'wastes', 'surface'); },
                    Lumber(r = {}){ return global.race['artifical'] ? 0 : undergroundCostMultiplier('surface_farm', r.offset, 20000, 1.55, 'wastes', 'surface'); },
                    Steel(r = {}){ return !global.race['artifical'] ? 0 : undergroundCostMultiplier('surface_farm', r.offset, 350000, 1.55, 'wastes', 'surface'); },
                    Brick(r = {}){ return undergroundCostMultiplier('surface_farm', r.offset, 55000, 1.45, 'wastes', 'surface'); },
                    Polymer(r = {}){ return undergroundCostMultiplier('surface_farm', r.offset, 160000, 1.55, 'wastes', 'surface'); }
                },
                effect(wiki){
                    let desc = `<div class="has-text-caution">${loc('requires_power_combo_effect', [$(this)[0].powered(), $(this)[0].consume('water'), global.resource.Water.name])}</div>`;
                    if(global.race['artifical']){
                        desc += `<div>${loc('galaxy_foothold_effect', [$(this)[0].support(), loc('surface_wastes')])}</div>`;
                        desc += `<div>${loc('gain', [50, global.resource.Food.name])}</div>`;
                    }
                    else{
                        desc += `<div>${loc('surface_farm_effect', [0.3, global.resource.Food.name])}</div>`;
                    }
                    desc += `<div>${loc('plus_max_resource', [$(this)[0].res_cap('food'), global.resource.Food.name])}</div>`;
                    return desc;
                },
                support(){
                    return global.race['artifical'] ? 0.1 : 0;
                },
                powered(){ return powerCostMod(global.race['artifical'] ? 25 : 15); },
                res_cap(res){
                    switch (res){
                        case 'food':
                            if(global.race['artifical']){
                                return iceAgeStorage(3500);
                            }
                            return iceAgeStorage(500);
                    }
                    return 0
                },
                consume(res){
                    switch (res){
                        case 'water':
                            if(global.race['artifical']){
                                return 200;
                            }
                            return 80;
                    }
                    return 0
                },
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
                        p: ['surface_farm','surface']
                    };
                }
            },
            surface_zoo: {
                id: 'surface-surface_zoo',
                title(){ return loc('surface_zoo'); },
                desc(){ return loc('surface_zoo_desc'); },
                type: 'entertainment',
                reqs: { zoo: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('surface_zoo', r.offset, 160000, 1.45, 'wastes', 'surface'); },
                    Plywood(r = {}){ return undergroundCostMultiplier('surface_zoo', r.offset, 25000, 1.45, 'wastes', 'surface'); },
                    Cement(r = {}){ return undergroundCostMultiplier('surface_zoo', r.offset, 260000, 1.55, 'wastes', 'surface'); },
                    Iron(r = {}){ return undergroundCostMultiplier('surface_zoo', r.offset, 410000, 1.55, 'wastes', 'surface'); }
                },
                effect(wiki){
                    let desc = `<div class="has-text-caution">${loc('requires_power_combo_effect', [$(this)[0].powered(), $(this)[0].consume('food'), global.resource.Food.name])}</div>`;
                    desc += `<div>${loc('surface_zoo_effect1', [+(0.04 * ecoMinorTraitEffect('trees', 'playful')).toFixed(2)])}</div>`;
                    desc += `<div>${loc('surface_zoo_effect2', [+(0.1 * ecoMinorTraitEffect('herbivores', 'playful')).toFixed(2)])}</div>`;
                    desc += `<div>${loc('surface_zoo_effect3', [+(0.25 * ecoMinorTraitEffect('carnivores', 'playful')).toFixed(2)])}</div>`;
                    desc += `<div>${loc('surface_zoo_effect4', [+(0.075 * ecoMinorTraitEffect('scavengers', 'playful')).toFixed(2)])}</div>`;
                    desc += `<div>${loc('surface_zoo_effect5', [4, 3])}</div>`;
                    return desc;
                },
                powered(){ return 10; },
                consume(res){
                    switch (res){
                        case 'food':
                            return 100;
                    }
                    return 0
                },
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
                        p: ['surface_zoo','surface']
                    };
                },
                flair(){ return loc('surface_zoo_flair'); }
            },
            bone_storage: {
                id: 'surface-bone_storage',
                title(){ return loc('surface_bone_storage') },
                desc(){ return loc('surface_bone_storage_desc', [global.resource.Power_Bones.name])},
                type: 'storage',
                reqs: { bone_storage: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('bone_storage', r.offset, 450000, 1.40, 'wastes', 'surface'); },
                    Stone(r = {}){ return undergroundCostMultiplier('bone_storage', r.offset, 230000, 1.45, 'wastes', 'surface'); },
                    Lumber(r = {}){ return undergroundCostMultiplier('bone_storage', r.offset, 120000, 1.45, 'wastes', 'surface'); },
                    Titanium(r = {}){ return undergroundCostMultiplier('bone_storage', r.offset, 160000, 1.45, 'wastes', 'surface'); },
                    Water(r = {}){ return undergroundCostMultiplier('bone_storage', r.offset, 320000, 1.45, 'wastes', 'surface'); }
                },
                res_cap(res){
                    switch (res){
                        case 'power_bones':
                            return iceAgeStorage(1);
                    }
                    return 0
                },
                effect(wiki){
                    return `<div>${loc('plus_max_resource',[$(this)[0].res_cap('power_bones'),global.resource.Power_Bones.name])}</div>`;
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
                        p: ['bone_storage','surface']
                    };
                },
            },
            grand_dome: {
                id: 'surface-grand_dome',
                title(){ return loc('surface_grand_dome'); },
                desc(wiki){
                    return `<div>${loc('surface_grand_dome')}</div>${global.surface.grand_dome.count < 100 || wiki ? `<div class="has-text-special">${loc('requires_segments',[100])}</div>` : ``}`;
                },
                type: 'megaproject',
                spared: true,
                reqs: { crater: 4 },
                queue_size: 10,
                queue_complete(){ return 100 - global.surface.grand_dome.count; },
                cost: {
                    Money(r = {}){ return ((r.offset || 0) + (global.surface.grand_dome?.count || 0)) < 100 ? 750000 : 0; },
                    Uranium(r = {}){ return ((r.offset || 0) + (global.surface.grand_dome?.count || 0)) < 100 ? 20 : 0; },
                    Polymer(r = {}){ return ((r.offset || 0) + (global.surface.grand_dome?.count || 0)) < 100 ? 80000 : 0; },
                    Titanium(r = {}){ return ((r.offset || 0) + (global.surface.grand_dome?.count || 0)) < 100 ? 95000 : 0; },
                    Mythril(r = {}){ return ((r.offset || 0) + (global.surface.grand_dome?.count || 0)) < 100 ? 35000 : 0; }
                },
                effect(wiki){
                    let count = (wiki?.count ?? 0) + (global.surface.grand_dome?.count || 0);
                    let desc = `<div>${loc('galaxy_foothold_effect', [$(this)[0].support(count), loc('surface_wastes')])}</div>
                        <div>${loc('surface_grand_dome_effect', [$(this)[0].eco_area(count)])}`;
                    if(count < 100){
                        desc += `<div class="has-text-special">${loc('space_dwarf_collider_effect2',[100 - count])}</div>`;
                    }
                    return desc;
                },
                support(wiki){
                    let count = (wiki?.count ?? 0) + (global.surface.grand_dome?.count || 0);
                    if(count < 100){
                        return (2 * count) / 10; //anti floating point imprecision
                    }
                    return 30;
                },
                eco_area(wiki){
                    let count = (wiki?.count ?? 0) + (global.surface.grand_dome?.count || 0);
                    if(count < 100){
                        return 1 * count;
                    }
                    return 200;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        if (global.surface.grand_dome.count < 100){
                            incrementStruct($(this)[0]);
                            if (global.surface.grand_dome.count >= 100){
                                let oddity = 0;
                                console.log((global.race.species === 'hybrid' ? (global.custom.race1?.hybrid || []) :
                                    races[global.race.species].hybrid || [races[global.race.species].type]));
                                if(!(global.race.species === 'hybrid' ? (global.custom.race1?.hybrid || []) :
                                    races[global.race.species].hybrid || [races[global.race.species].type]).includes('primordial')){
                                        oddity++;
                                }
                                if(global.civic.archaeologist.workers === 0){
                                    oddity++;
                                }
                                if(global.race['truepath']){
                                    oddity++;
                                }
                                messageQueue(loc(`event_odd_archaeologist_${oddity}`),'info',false,['progress']);
                                global.tech['crater'] = 5;
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
                        p: ['grand_dome','surface']
                    };
                }
            }
        },
        ecosystem: {
            info: {
                name: loc('surface_ecosystem'),
                desc: loc('surface_ecosystem_desc')
            },
            overview: {
                id: 'surface-overview',
                title(){ return loc('surface_overview'); },
                desc(){
                    let info = global.surface.overview;
                    let desc = `<div>${loc('surface_overview_area', [info.area])}</div>`;
                    let water_use = $(this)[0].total_water_use();
                    desc += `<div class="${water_use > info.water ? 'has-text-danger' : ''}">${loc('surface_overview_water', [(info.water - water_use).toFixed(0), info.water, water_use.toFixed(0)])}</div>`;
                    let corpses = 0;
                    let flood = 0;
                    let drought = 0;
                    if(global.surface.trees?.count){
                        let tree_cycle = growth_cycle('trees');
                        desc += `<div>${loc('surface_overview_trees', [Math.floor(global.surface.trees.count), `${tree_cycle.total_change.toFixed(2) >= 0 ? '+' : ''}${+tree_cycle.total_change.toFixed(2)}`])}</div>`;
                        flood += tree_cycle.flood_loss;
                        drought += tree_cycle.drought_loss;
                    }
                    if(global.surface.herbivores?.count){
                        let herbivore_cycle = growth_cycle('herbivores');
                        desc += `<div>${loc('surface_overview_herbivores', [Math.floor(global.surface.herbivores.count), `${herbivore_cycle.total_change.toFixed(2) >= 0 ? '+' : ''}${+herbivore_cycle.total_change.toFixed(2)}`])}</div>`;
                        flood += herbivore_cycle.flood_loss;
                        drought += herbivore_cycle.drought_loss;
                    }
                    if(global.surface.carnivores?.count){
                        let carnivore_cycle = growth_cycle('carnivores');
                        desc += `<div>${loc('surface_overview_carnivores', [Math.floor(global.surface.carnivores.count), `${carnivore_cycle.total_change.toFixed(2) >= 0 ? '+' : ''}${+carnivore_cycle.total_change.toFixed(2)}`])}</div>`;
                        flood += carnivore_cycle.flood_loss;
                        drought += carnivore_cycle.drought_loss;
                        corpses += carnivore_cycle.corpse_create;
                    }
                    if(global.surface.scavengers?.count){
                        let scavenger_cycle = growth_cycle('scavengers');
                        desc += `<div>${loc('surface_overview_scavengers', [Math.floor(global.surface.scavengers.count), `${scavenger_cycle.total_change.toFixed(2) >= 0 ? '+' : ''}${+scavenger_cycle.total_change.toFixed(2)}`])}</div>`;
                        flood += scavenger_cycle.flood_loss;
                        drought += scavenger_cycle.drought_loss;
                        corpses -= scavenger_cycle.corpse_consume;
                    }
                    
                    let corpse_change = corpse_cycle(corpses);
                    desc += `<div>${loc('surface_overview_corpses', [Math.floor(info.corpses), `${corpse_change >= 0 ? '+' : ''}${+corpse_change.toFixed(2)}`])}</div>`;

                    let water_ratio = (info.water - $(this)[0].total_water_use()) / info.area;
                    if(water_ratio < 0.1 || drought > 0){
                        desc += `<div class="has-text-danger">${loc('surface_overview_warn_drought')}</div>`;
                    }
                    else if(water_ratio > 0.5 || flood > 0){
                        desc += `<div class="has-text-danger">${loc('surface_overview_warn_flood')}</div>`;
                    }
                    return desc;
                },
                reqs: { surface: 4 },
                queue_complete(){ return false; },
                cost: {},
                action(){
                    return false;
                },
                total_water_use(){
                    let total = (global.surface.trees?.count || 0) * ecosystemInfo.trees.water_use;
                    total += (global.surface.herbivores?.count || 0) * ecosystemInfo.herbivores.water_use;
                    total += (global.surface.carnivores?.count || 0) * ecosystemInfo.carnivores.water_use;
                    total += (global.surface.scavengers?.count || 0) * ecosystemInfo.scavengers.water_use;
                    return total;
                },
                set_cooldown(time){
                    if(false){
                        global.surface.overview.cooldown = Math.floor(time);
                    }
                    return global.surface.overview.cooldown;
                },
                struct(){
                    return {
                        d: { area: 0, water: 0, corpses:0, cooldown: 0, trees_reserved: 0 },
                        p: ['overview','surface']
                    };
                }
            },
            area_heater: {
                id: 'surface-area_heater',
                title(){ return loc('surface_area_heater'); },
                desc(){ return `<div>${loc('surface_area_heater_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
                type: 'ecosystem',
                spared: true,
                reqs: { surface: 4 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('area_heater', r.offset, 22000, 1.4, 'ecosystem', 'surface'); },
                    Cement(r = {}){ return undergroundCostMultiplier('area_heater', r.offset, 18000, 1.45, 'ecosystem', 'surface'); },
                    Copper(r = {}){ return undergroundCostMultiplier('area_heater', r.offset, 7800, 1.45, 'ecosystem', 'surface'); },
                    Polymer(r = {}){ return undergroundCostMultiplier('area_heater', r.offset, 12500, 1.45, 'ecosystem', 'surface'); }
                },
                effect(wiki){
                    let desc = `<div class="has-text-caution">${loc('minus_power', [$(this)[0].powered()])}</div>`;
                    desc += `<div>${loc('surface_area_heater_effect', [$(this)[0].support()])}</div>`;
                    return desc;
                },
                powered(){ return powerCostMod(18); },
                support(){ return global.tech['surface_uranium'] >= 3 ? 40 : 30; },
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
                        d: {
                            count: 0,
                            on: 0
                        },
                        p: ['area_heater','surface']
                    };
                }
            },
            water_pipe: {
                id: 'surface-water_pipe',
                title(){ return loc('surface_water_pipe'); },
                desc(){
                    return `<div>${loc('surface_water_pipe')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
                },
                type: 'ecosystem',
                spared: true,
                reqs: { surface: 4 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('water_pipe', r.offset, 46000, 1.4, 'ecosystem', 'surface'); },
                    Titanium(r = {}){ return undergroundCostMultiplier('water_pipe', r.offset, 1200, 1.45, 'ecosystem', 'surface'); },
                    Copper(r = {}){ return undergroundCostMultiplier('water_pipe', r.offset, 32000, 1.45, 'ecosystem', 'surface'); },
                    Sheet_Metal(r = {}){ return undergroundCostMultiplier('water_pipe', r.offset, 4000, 1.4, 'ecosystem', 'surface'); }
                },
                effect(wiki){
                    let desc = `<span class="has-text-caution">${loc('spend',[$(this)[0].consume('water'), global.resource.Water.name])}, ${loc('minus_power',[$(this)[0].powered()])}</span>`;
                    desc += `<div>${loc('surface_water_pipe_effect', [$(this)[0].support()])}</div>`;
                    return desc;
                },
                powered(){ return powerCostMod(10); },
                support(){
                    let total = 10;
                    if(global.tech['water'] >= 5){
                        total *= 1.5;
                    }
                    if(global.tech['water'] >= 6){
                        total *= 2;
                    }
                    return total;
                },
                consume(res){
                    switch (res){
                        case 'water':
                            return 50;
                    }
                    return 0
                },
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
                        p: ['water_pipe','surface']
                    };
                }
            },
            trees: {
                id: 'surface-trees',
                title(){ return loc('surface_trees'); },
                desc(){ return loc('surface_trees_desc'); },
                count(){ return Math.floor(global.surface.trees?.count || 0); },
                reqs: { surface: 4 },
                wiki: false,
                queue_complete(){ return false; },
                show_count: true,
                spared: true,
                effect(){
                    let desc = ``;
                    let lumberjacks = workerScale(global.civic.lumberjack.workers,'lumberjack');
                    if (global.race['servants']){
                        let serve = global.race.servants.jobs.lumberjack;
                        serve *= servantTrait(global.race.servants.jobs.lumberjack,'lumberjack');
                        lumberjacks += serve;
                    }
                    if(global.surface.trees.empowered){
                        let ratio = global.surface.trees.empowered / global.surface.trees.count;
                        ratio = Math.min(1, ratio);
                        if(!global.surface.trees.count){
                            ratio = 0;
                        }
                        desc += `<div class="TTEmpowered">${loc('surface_ecosystem_empowered', [Math.floor(global.surface.trees.empowered), +(ratio * 100).toFixed(1)])}</div>`;
                    }
                    if(lumberjacks){
                        desc += `<div>${loc('surface_ecosystem_lumberjack_loss', [+(lumberjacks * 5 / $(this)[0].hardiness()).toFixed(2)])}</div>`;
                    }
                    desc += cycle_breakdown('trees');
                    desc += `<div class="has-text-special">${loc('surface_trees_effect1')}</div>`;
                    desc += `<div class="has-text-special">${loc('surface_overview_cooldown', [$(this)[0].cooldown()])}</div>`;
                    desc += `<div class="has-text-caution">${loc('surface_overview_cooldown_left', [Math.ceil(global.surface.overview.cooldown * actions.surface.wastes.genetics_lab.creation_cooldown_mult())])}</div>`;
                    return desc;
                },
                hardiness(){
                    //how long it takes a lumberjack to cut a tree down in seconds. Higher value is better
                    let hardiness = 2;
                    hardiness *= actions.surface.ecosystem.herbivores.tree_effect();
                    hardiness *= ecoMinorTraitEffect('trees', 'slow_digestion');
                    return hardiness;
                },
                cooldown(){
                    return 10;
                },
                action(args){
                    if(global.surface.overview.cooldown === 0){
                        incrementStruct($(this)[0]);
                        actions.surface.ecosystem.overview.set_cooldown($(this)[0].cooldown());
                        drawEcology('trees');
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: {
                            count: 0,
                            empowered: 0,
                            traits: ecosystemInfo.minorTraits
                        },
                        p: ['trees','surface']
                    };
                }
            },
            herbivores: {
                id: 'surface-herbivores',
                title(){ return loc('surface_herbivores'); },
                desc(){ return loc('surface_herbivores_desc'); },
                count(){ return Math.floor(global.surface.herbivores?.count || 0); },
                show_count: true,
                spared: true,
                effect(){
                    let desc = `<div>${loc('surface_herbivores_effect1', [(($(this)[0].tree_effect() - 1) * 100).toFixed(0)])}</div>`;
                    if(global.surface.herbivores.empowered){
                        let ratio = global.surface.herbivores.empowered / global.surface.herbivores.count;
                        ratio = Math.min(1, ratio);
                        if(!global.surface.herbivores.count){
                            ratio = 0;
                        }
                        desc += `<div class="TTEmpowered">${loc('surface_ecosystem_empowered', [Math.floor(global.surface.herbivores.empowered), +(ratio * 100).toFixed(1)])}</div>`;
                    }
                    desc += cycle_breakdown('herbivores');
                    if(support_on['genetics_lab'] > 0){
                        let cooldown = Math.floor($(this)[0].cooldown() * actions.surface.wastes.genetics_lab.creation_cooldown_mult());
                        desc += `<div class="has-text-special">${loc('surface_herbivores_effect2')}</div>`;
                        desc += `<div class="has-text-special">${loc('surface_overview_cooldown', [cooldown])}</div>`;
                        desc += `<div class="has-text-caution">${loc('surface_overview_cooldown_left', [Math.ceil(global.surface.overview.cooldown * actions.surface.wastes.genetics_lab.creation_cooldown_mult())])}</div>`;
                    }
                    else{
                        desc += `<div class="has-text-caution">${loc('surface_genetics_lab_required')}</div>`;
                    }
                    return desc;
                },
                tree_effect(){
                    return 1 + (0.01 * ((global.surface.herbivores?.count || 0) ** 1.05));
                },
                cooldown(){
                    return 100;
                },
                reqs: { surface: 5 },
                wiki: false,
                queue_complete(){ return false; },
                action(args){
                    if(global.surface.overview.cooldown === 0){
                        incrementStruct($(this)[0]);
                        actions.surface.ecosystem.overview.set_cooldown($(this)[0].cooldown());
                        drawEcology('herbivores');
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: {
                            count: 0,
                            empowered: 0,
                            minorTraits: ecosystemInfo.minorTraits
                        },
                        p: ['herbivores','surface']
                    };
                }
            },
            carnivores: {
                id: 'surface-carnivores',
                title(){ return loc('surface_carnivores'); },
                desc(){ return loc('surface_carnivores_desc'); },
                count(){ return Math.floor(global.surface.carnivores?.count || 0); },
                show_count: true,
                spared: true,
                effect(){
                    let desc = `<div>${loc('surface_carnivores_effect1', [(($(this)[0].tree_effect() - 1) * 100).toFixed(0)])}</div>`;
                    if(global.surface.carnivores.empowered){
                        let ratio = global.surface.carnivores.empowered / global.surface.carnivores.count;
                        ratio = Math.min(1, ratio);
                        if(!global.surface.carnivores.count){
                            ratio = 0;
                        }
                        desc += `<div class="TTEmpowered">${loc('surface_ecosystem_empowered', [Math.floor(global.surface.carnivores.empowered), +(ratio * 100).toFixed(1)])}</div>`;
                    }
                    desc += cycle_breakdown('carnivores');
                    if(global.surface.carnivores.count * ecosystemInfo.carnivores.meat_use > global.surface.herbivores.count / 100){
                        desc += `<div class="has-text-danger">${loc('surface_carnivores_find_food')}</div>`;
                    }
                    if(support_on['genetics_lab'] > 0){
                        let cooldown = Math.floor($(this)[0].cooldown() * actions.surface.wastes.genetics_lab.creation_cooldown_mult());
                        desc += `<div class="has-text-special">${loc('surface_carnivores_effect2')}</div>`;
                        desc += `<div class="has-text-special">${loc('surface_overview_cooldown', [cooldown])}</div>`;
                        desc += `<div class="has-text-caution">${loc('surface_overview_cooldown_left', [Math.ceil(global.surface.overview.cooldown * actions.surface.wastes.genetics_lab.creation_cooldown_mult())])}</div>`;
                    }
                    else{
                        desc += `<div class="has-text-caution">${loc('surface_genetics_lab_required')}</div>`;
                    }
                    return desc;
                },
                tree_effect(){
                    return 1 + (0.01 * ((global.surface.carnivores?.count || 0) ** 0.95));
                },
                cooldown(){
                    return 300;
                },
                reqs: { surface: 7 },
                wiki: false,
                queue_complete(){ return false; },
                action(args){
                    if(global.surface.overview.cooldown === 0){
                        incrementStruct($(this)[0]);
                        actions.surface.ecosystem.overview.set_cooldown($(this)[0].cooldown());
                        drawEcology('carnivores');
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: {
                            count: 0,
                            empowered: 0,
                            minorTraits: ecosystemInfo.minorTraits
                        },
                        p: ['carnivores','surface']
                    };
                }
            },
            scavengers: {
                id: 'surface-scavengers',
                title(){ return loc('surface_scavengers'); },
                desc(){ return loc('surface_scavengers_desc'); },
                count(){ return Math.floor(global.surface.scavengers?.count || 0); },
                show_count: true,
                spared: true,
                effect(){
                    let desc = `<div>${loc('surface_scavengers_effect1', [(($(this)[0].tree_effect() - 1) * 100).toFixed(0)])}</div>`;
                    if(global.surface.scavengers.empowered){
                        let ratio = global.surface.scavengers.empowered / global.surface.scavengers.count;
                        ratio = Math.min(1, ratio);
                        if(!global.surface.scavengers.count){
                            ratio = 0;
                        }
                        desc += `<div class="TTEmpowered">${loc('surface_ecosystem_empowered', [Math.floor(global.surface.scavengers.empowered), +(ratio * 100).toFixed(1)])}</div>`;
                    }
                    desc += cycle_breakdown('scavengers');
                    if(support_on['genetics_lab'] > 0){
                        let cooldown = Math.floor($(this)[0].cooldown() * actions.surface.wastes.genetics_lab.creation_cooldown_mult());
                        desc += `<div class="has-text-special">${loc('surface_scavengers_effect2')}</div>`;
                        desc += `<div class="has-text-special">${loc('surface_overview_cooldown', [cooldown])}</div>`;
                        desc += `<div class="has-text-caution">${loc('surface_overview_cooldown_left', [Math.ceil(global.surface.overview.cooldown * actions.surface.wastes.genetics_lab.creation_cooldown_mult())])}</div>`;
                    }
                    else{
                        desc += `<div class="has-text-caution">${loc('surface_genetics_lab_required')}</div>`;
                    }
                    return desc;
                },
                tree_effect(){
                    return 1 + (0.01 * ((global.surface.scavengers?.count || 0) ** 1.05));
                },
                cooldown(){
                    return 750;
                },
                reqs: { surface: 8 },
                wiki: false,
                queue_complete(){ return false; },
                action(args){
                    if(global.surface.overview.cooldown === 0){
                        incrementStruct($(this)[0]);
                        actions.surface.ecosystem.overview.set_cooldown($(this)[0].cooldown());
                        drawEcology('scavengers');
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: {
                            count: 0,
                            empowered: 0,
                            minorTraits: ecosystemInfo.minorTraits
                        },
                        p: ['scavengers','surface']
                    };
                }
            },
            aberrant_herbivores: {
                id: 'surface-aberrant_herbivores',
                title(){ return `<div class="empowered">${loc('surface_aberrant_herbivores')}</div>`; },
                desc(){ return loc('surface_aberrant_herbivores_desc'); },
                count(){ return Math.floor(global.aberrants.herbivores.count); },
                show_count: true,
                spared: true,
                condition(){ return global.aberrants.herbivores.count || global.stats.hslain},
                effect(){
                    let wins = 0;
                    for (let i=0;i<18;i++){
                        if(aberrant_fight('herbivores', false, global['warseed'] + (i * 1000)).success){
                            wins++;
                        }
                    }
                    wins += seededRandom(-2,2,false, global['warseed']);
                    if(wins < 0){
                        wins = 0;
                    }
                    let calc_odds = (wins * 10 - 100).toFixed(0);
                    let desc = `<div>${loc('surface_aberrant_effect1')}</div>`;
                    let stats = aberrant_stats('herbivores');
                    if(false){
                        desc += `<div>${loc('surface_aberrant_effect2')}</div>`;
                    }
                    else if(false || true){
                        desc += `<div>${loc('surface_aberrant_effect3', [`<span class="has-text-warning">${stats.health}</span>`])}</div>`;
                        desc += `<div>${loc('surface_aberrant_effect4', [`<span class="has-text-warning">${stats.fight}</span>`])}</div>`;
                    }
                    if(false || true){
                        desc += `<div>${loc('surface_aberrant_effect5', [stats.bones, global.resource.Power_Bones.name])}</div>`;
                    }
                    desc += `<div>${loc(calc_odds >= 0 ? 'civics_garrison_advantage' : 'civics_garrison_disadvantage', [Math.abs(calc_odds)])}</div>`;
                    return desc;
                },
                reqs: { ecosystem_genetics: 3 },
                wiki: false,
                special: true,
                queue_complete(){ return false; },
                action(args){
                    if(global.aberrants.herbivores.count >= 1){
                        let result = aberrant_fight('herbivores', true);
                        if(result.revive){
                            if(result.revive === 1){
                                messageQueue(loc("hell_report_log_revived"));
                            }
                            else{
                                messageQueue(loc("hell_report_log_revived_plural", [result.revive]));
                            }
                        }
                        if(result.success){
                            let stats = aberrant_stats('herbivores');
                            messageQueue(loc('surface_aberrant_combat_success', [result.deaths, result.injuries, loc('surface_herbivores_single'), stats.bones, global.resource.Power_Bones.name]), 'success');
                            global.resource.Power_Bones.display = true;
                            modRes('Power_Bones', stats.bones, true);
                            if(global.tech['ecosystem_genetics'] === 4){
                                global.tech['ecosystem_genetics'] = 5;
                            }
                            if(Math.floor(seededRandom(0, 10, true)) === 0){
                                ecoGainMajorTrait('herbivores');
                            }
                            global.stats.hslain++;
                            global.aberrants.herbivores.count--;
                            drawEcology('aberrant_herbivores');
                        }
                        else{
                            let injury = Math.ceil(result.damage / ecosystemInfo.aberrant_stats.herbivores.health * 3);
                            messageQueue(`${loc('surface_aberrant_combat_failure', [result.deaths, result.injuries])} ${loc(`surface_aberrant_combat_hp${injury}`, [loc('surface_herbivores_single')])}`, 'danger');
                        }
                        fight_log['herbivores'].unshift(result.log);
                        if(fight_log['herbivores'].length > 3){
                            fight_log['herbivores'].pop();
                        }
                    }
                    return false;
                }
            },
            aberrant_carnivores: {
                id: 'surface-aberrant_carnivores',
                title(){ return `<div class="empowered">${loc('surface_aberrant_carnivores')}</div>`; },
                desc(){ return loc('surface_aberrant_carnivores_desc'); },
                count(){ return Math.floor(global.aberrants.carnivores.count); },
                show_count: true,
                spared: true,
                condition(){ return global.aberrants.carnivores.count || global.stats.cslain},
                effect(){
                    let wins = 0;
                    for (let i=0;i<18;i++){
                        if(aberrant_fight('carnivores', false, global['warseed'] + (i * 1000)).success){
                            wins++;
                        }
                    }
                    wins += seededRandom(-2,2,false, global['warseed']);
                    if(wins < 0){
                        wins = 0;
                    }
                    let calc_odds = (wins * 10 - 100).toFixed(0);
                    let desc = `<div>${loc('surface_aberrant_effect1')}</div>`;
                    let stats = aberrant_stats('carnivores');
                    if(false){
                        desc += `<div>${loc('surface_aberrant_effect2')}</div>`;
                    }
                    else if(false || true){
                        desc += `<div>${loc('surface_aberrant_effect3', [`<span class="has-text-warning">${stats.health}</span>`])}</div>`;
                        desc += `<div>${loc('surface_aberrant_effect4', [`<span class="has-text-warning">${stats.fight}</span>`])}</div>`;
                    }
                    if(false || true){
                        desc += `<div>${loc('surface_aberrant_effect5', [stats.bones, global.resource.Power_Bones.name])}</div>`;
                    }
                    desc += `<div>${loc(calc_odds >= 0 ? 'civics_garrison_advantage' : 'civics_garrison_disadvantage', [Math.abs(calc_odds)])}</div>`;
                    return desc;
                },
                reqs: { ecosystem_genetics: 3 },
                wiki: false,
                special: true,
                queue_complete(){ return false; },
                action(args){
                    if(global.aberrants.carnivores.count >= 1){
                        let result = aberrant_fight('carnivores', true);
                        if(result.revive){
                            if(result.revive === 1){
                                messageQueue(loc("hell_report_log_revived"));
                            }
                            else{
                                messageQueue(loc("hell_report_log_revived_plural", [result.revive]));
                            }
                        }
                        if(result.success){
                            let stats = aberrant_stats('carnivores');
                            messageQueue(loc('surface_aberrant_combat_success', [result.deaths, result.injuries, loc('surface_carnivores_single'), stats.bones, global.resource.Power_Bones.name]), 'success');
                            global.resource.Power_Bones.display = true;
                            modRes('Power_Bones', stats.bones, true);
                            if(global.tech['ecosystem_genetics'] === 4){
                                global.tech['ecosystem_genetics'] = 5;
                            }
                            if(Math.floor(seededRandom(0, 10, true)) === 0){
                                ecoGainMajorTrait('carnivores');
                            }
                            global.stats.cslain++;
                            global.aberrants.carnivores.count--;
                            drawEcology('aberrant_carnivores');
                        }
                        else{
                            let injury = Math.ceil(result.damage / ecosystemInfo.aberrant_stats.carnivores.health * 3);
                            messageQueue(`${loc('surface_aberrant_combat_failure', [result.deaths, result.injuries])} ${loc(`surface_aberrant_combat_hp${injury}`, [loc('surface_carnivores_single')])}`, 'danger');
                        }
                        fight_log['carnivores'].unshift(result.log);
                        if(fight_log['carnivores'].length > 3){
                            fight_log['carnivores'].pop();
                        }
                    }
                    return false;
                }
            },
            aberrant_scavengers: {
                id: 'surface-aberrant_scavengers',
                title(){ return `<div class="empowered">${loc('surface_aberrant_scavengers')}</div>`; },
                desc(){ return loc('surface_aberrant_scavengers_desc'); },
                count(){ return Math.floor(global.aberrants.scavengers.count); },
                show_count: true,
                spared: true,
                condition(){ return global.aberrants.scavengers.count || global.stats.sslain},
                effect(){
                    let wins = 0;
                    for (let i=0;i<18;i++){
                        if(aberrant_fight('scavengers', false, global['warseed'] + (i * 1000)).success){
                            wins++;
                        }
                    }
                    wins += seededRandom(-2,2,false, global['warseed']);
                    if(wins < 0){
                        wins = 0;
                    }
                    let calc_odds = (wins * 10 - 100).toFixed(0);
                    let desc = `<div>${loc('surface_aberrant_effect1')}</div>`;
                    let stats = aberrant_stats('scavengers');
                    if(false){
                        desc += `<div>${loc('surface_aberrant_effect2')}</div>`;
                    }
                    else if(false || true){
                        desc += `<div>${loc('surface_aberrant_effect3', [`<span class="has-text-warning">${stats.health}</span>`])}</div>`;
                        desc += `<div>${loc('surface_aberrant_effect4', [`<span class="has-text-warning">${stats.fight}</span>`])}</div>`;
                    }
                    if(false || true){
                        desc += `<div>${loc('surface_aberrant_effect5', [stats.bones, global.resource.Power_Bones.name])}</div>`;
                    }
                    desc += `<div>${loc(calc_odds >= 0 ? 'civics_garrison_advantage' : 'civics_garrison_disadvantage', [Math.abs(calc_odds)])}</div>`;
                    return desc;
                },
                reqs: { ecosystem_genetics: 3 },
                wiki: false,
                special: true,
                queue_complete(){ return false; },
                action(args){
                    if(global.aberrants.scavengers.count >= 1){
                        let result = aberrant_fight('scavengers', true);
                        if(result.revive){
                            if(result.revive === 1){
                                messageQueue(loc("hell_report_log_revived"));
                            }
                            else{
                                messageQueue(loc("hell_report_log_revived_plural", [result.revive]));
                            }
                        }
                        if(result.success){
                            let stats = aberrant_stats('scavengers');
                            messageQueue(loc('surface_aberrant_combat_success', [result.deaths, result.injuries, loc('surface_scavengers_single'), stats.bones, global.resource.Power_Bones.name]), 'success');
                            global.resource.Power_Bones.display = true;
                            modRes('Power_Bones', stats.bones, true);
                            if(global.tech['ecosystem_genetics'] === 4){
                                global.tech['ecosystem_genetics'] = 5;
                            }
                            if(Math.floor(seededRandom(0, 10, true)) === 0){
                                ecoGainMajorTrait('scavengers');
                            }
                            global.stats.sslain++;
                            global.aberrants.scavengers.count--;
                            drawEcology('aberrant_scavengers');
                        }
                        else{
                            let injury = Math.ceil(result.damage / ecosystemInfo.aberrant_stats.scavengers.health * 3);
                            messageQueue(`${loc('surface_aberrant_combat_failure', [result.deaths, result.injuries])} ${loc(`surface_aberrant_combat_hp${injury}`, [loc('surface_scavengers_single')])}`, 'danger');
                        }
                        fight_log['scavengers'].unshift(result.log);
                        if(fight_log['scavengers'].length > 3){
                            fight_log['scavengers'].pop();
                        }
                    }
                    return false;
                }
            }
        },
        crater: {
            info: {
                name: !global.tech['crater'] ? loc('surface_crater_hidden') : loc('surface_crater'),
                desc: !global.tech['crater'] ? loc('surface_crater_hidden_desc') : loc('surface_crater_desc'),
                support: 'crater_headquarters',
                extra(region){
                    if (!global.tech['crater']){
                        $(`#surface-dist-${region}`).append(`<div id="explore_progress" class="shipReturn">${loc('message_log_progress')} <span class="has-text-info">{{ explore.toFixed(1) }}%</span></div>`);
                        vBind({
                            el: `#explore_progress`,
                            data: global.surface.watch_tower,
                        });
                        popover(`explore_progress`, function(){
                            let desc = `<div>${loc('surface_exploration_time', [timeFormat((100 - global.surface.watch_tower.explore) / (0.0075 + (0.002 * support_on['watch_tower'])))])}</div>`;
                            desc += `<div>${loc('surface_exploration_hint')}</div>`;
                            return desc;
                        });
                    }
                }
            },
            crater_headquarters: {
                id: 'surface-crater_headquarters',
                title(){ return loc('surface_crater_headquarters'); },
                desc(){ return `<div>${loc('surface_crater_headquarters_desc')}</div>`; },
                type: 'outpost',
                reqs: { crater: 1 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('crater_headquarters', r.offset, 450000, 1.45, 'crater', 'surface'); },
                    Steel(r = {}){ return undergroundCostMultiplier('crater_headquarters', r.offset, 220000, 1.55, 'crater', 'surface'); },
                    Iridium(r = {}){ return undergroundCostMultiplier('crater_headquarters', r.offset, 8000, 1.55, 'crater', 'surface'); },
                    Wrought_Iron(r = {}){ return undergroundCostMultiplier('crater_headquarters', r.offset, 45000, 1.55, 'crater', 'surface'); }
                },
                effect(wiki){
                    let desc = `<div>${loc('galaxy_foothold_effect', [$(this)[0].support(), loc('surface_crater')])}</div>`;
                    desc += `<div class="has-text-caution">${loc('requires_power_combo_effect', [$(this)[0].powered(), $(this)[0].support_fuel().a, global.resource.Coal.name])}`;
                    return desc;
                },
                support(){ return 2; },
                support_fuel(){ return { r: 'Coal', a: 50 }; },
                powered(){ return powerCostMod(15); },
                powerBalancer(){
                    return [{ s: global.surface.crater_headquarters.s_max - global.surface.crater_headquarters.support }];
                },
                refresh: true,
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
                        d: {
                            count: 0,
                            on: 0,
                            support: 0,
                            s_max: 0
                        },
                        p: ['crater_headquarters','surface']
                    };
                }
            },
            crater_fission: {
                id: 'surface-crater_fission',
                title(){ return loc('city_fission_power'); },
                desc(){ return `<div>${loc('city_fission_power_desc')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Uranium.name])}</div>`; },
                type: 'power',
                reqs: { surface_uranium: 2 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('crater_fission', r.offset, 550000, 1.45, 'crater', 'surface'); },
                    Copper(r = {}){ return undergroundCostMultiplier('crater_fission', r.offset, 245000, 1.55, 'crater', 'surface'); },
                    Cement(r = {}){ return undergroundCostMultiplier('crater_fission', r.offset, 290000, 1.55, 'crater', 'surface'); },
                    Uranium(r = {}){ return undergroundCostMultiplier('crater_fission', r.offset, 60, 1.55, 'crater', 'surface'); }
                },
                effect(){
                    return `<div>${loc('galaxy_foothold_effect', [$(this)[0].support(), loc('surface_crater')])}</div>
                        <span>+${-($(this)[0].powered())}MW.</span> <span class="has-text-caution">${loc('city_fission_power_effect',[$(this)[0].p_fuel().a])}</span>`;
                },
                support(){ return 0.5; },
                powered(){ return powerModifier(-35); },
                p_fuel(){ return { r: 'Uranium', a: 0.1 }; },
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
                        p: ['crater_fission','surface']
                    };
                },
            },
            work_station: {
                id: 'surface-work_station',
                title(){
                    return loc('surface_work_station');
                },
                desc(){
                    return `<div>${loc('surface_work_station_desc')}</div><div class="has-text-special">${loc('space_support',[loc('surface_crater')])}</div>`;
                },
                type: 'housing',
                reqs: { crater: 2 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('work_station', r.offset, 350000, 1.45, 'crater', 'surface'); },
                    Plywood(r = {}){ return undergroundCostMultiplier('work_station', r.offset, 21000, 1.45, 'crater', 'surface'); },
                    Alloy(r = {}){ return undergroundCostMultiplier('work_station', r.offset, 125000, 1.55, 'crater', 'surface'); },
                    Horseshoe(){ return global.race['hooved'] ? 1 : 0; }
                },
                effect(wiki){
                    let gain = $(this)[0].citizens(wiki);
                    let uranium = $(this)[0].res_cap('uranium');
                    return `<div class="has-text-caution">${loc('space_used_support',[loc('surface_crater')])}</div><div>${loc('plus_max_resource',[uranium,global.resource.Uranium.name])}</div>
                        <div>${loc('plus_max_resource',[gain,loc('citizen')])}</div><div>${loc('plus_max_resource',[jobScale(1),loc('job_crater_worker')])}</div>`;
                },
                s_type: 'crater',
                support(){ return -1; },
                powered(){ return 0; },
                res_cap(res){
                    switch (res){
                        case 'uranium':
                            return iceAgeStorage(10);
                    }
                    return 0
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        powerOnNewStruct($(this)[0]);
                        global.civic.crater_worker.display = true;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0, on: 0 },
                        p: ['work_station','surface']
                    };
                },
                citizens(wiki){
                    return jobScale(3);
                }
            },
            crater_drill: {
                id: 'surface-crater_drill',
                title(){ return loc('surface_crater_drill'); },
                desc(){
                    return `<div>${loc('surface_crater_drill_desc')}</div><div class="has-text-special">${loc('space_support',[loc('surface_crater')])}</div>`;
                },
                type: 'mining',
                reqs: { crater: 2 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('crater_drill', r.offset, 325000, 1.45, 'crater', 'surface'); },
                    Mythril(r = {}){ return undergroundCostMultiplier('crater_drill', r.offset, 75000, 1.45, 'crater', 'surface'); },
                    Titanium(r = {}){ return undergroundCostMultiplier('crater_drill', r.offset, 125000, 1.55, 'crater', 'surface'); },
                    Steel(r = {}){ return undergroundCostMultiplier('crater_drill', r.offset, 225000, 1.55, 'crater', 'surface'); },
                },
                effect(){
                    let iron_val = +(production('crater_drill','iron')).toFixed(2);
                    let cop_val = +(production('crater_drill','copper')).toFixed(2);
                    let coal_val = +(production('crater_drill','coal')).toFixed(2);
                    let uranium_val = +(production('crater_drill','uranium')).toFixed(4);
                    let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('surface_crater')])}</div><div>${loc('surface_crater_drill_effect',[iron_val,global.resource.Iron.name])}</div>`;
                    desc += `<div>${loc('surface_crater_drill_effect',[cop_val,global.resource.Copper.name])}</div><div>${loc('surface_crater_drill_effect',[coal_val,global.resource.Coal.name])}</div>`
                    desc += `<div>${loc('surface_crater_drill_effect',[uranium_val,global.resource.Uranium.name])}</div>`;
                    return desc;
                },
                s_type: 'crater',
                support(){ return -1; },
                powered(){ return 0; },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        powerOnNewStruct($(this)[0]);
                        if(!global.tech['surface_uranium']){
                            global.tech['surface_uranium'] = 1;
                        }
                        global.resource.Uranium.display = true;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0, on: 0 },
                        p: ['crater_drill','surface']
                    };
                }
            },
            crater_fabrication: {
                id: 'surface-crater_fabrication',
                title(){ return loc('surface_crater_fabrication'); },
                desc(){
                    return `<div>${loc('surface_crater_fabrication_desc')}</div><div class="has-text-special">${loc('space_support',[loc('surface_crater')])}</div>`;
                },
                type: 'industry',
                reqs: { crater: 3 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('crater_fabrication', r.offset, 540000, 1.45, 'crater', 'surface'); },
                    Iridium(r = {}){ return undergroundCostMultiplier('crater_fabrication', r.offset, 10000, 1.55, 'crater', 'surface'); },
                    Stone(r = {}){ return undergroundCostMultiplier('crater_fabrication', r.offset, 650000, 1.55, 'crater', 'surface'); },
                    Wrought_Iron(r = {}){ return undergroundCostMultiplier('crater_fabrication', r.offset, 90000, 1.45, 'crater', 'surface'); }
                },
                effect(){
                    let cement_1 = !global.race['flier'] ? `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_cement_worker`)])}</div>` : ``;
                    let cement_2 = !global.race['flier'] ? `<div>${loc('surface_crater_fabrication_effect2',[+highPopAdjust(2).toFixed(2), global.resource.Cement.name])}</div>` : ``;
                    return `<div class="has-text-caution">${loc('space_used_support',[loc('surface_crater')])}</div>${cement_1}<div>${loc('plus_max_resource',[jobScale(1),loc('job_craftsman')])}</div>
                        <div>${loc('surface_crater_fabrication_effect1',[+highPopAdjust(5).toFixed(2)])}</div>${cement_2}`;
                },
                s_type: 'crater',
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
                        p: ['crater_fabrication','surface']
                    };
                }
            },
            crater_factory: {
                id: 'surface-crater_factory',
                title(){ return loc('surface_crater_factory'); },
                desc(){
                    return `<div>${loc('surface_crater_factory')}</div><div class="has-text-special">${loc('space_support',[loc('surface_crater')])}</div>`;
                },
                type: 'industry',
                reqs: { crater: 3 },
                cost: {
                    Money(r = {}){ return undergroundCostMultiplier('crater_factory', r.offset, 540000, 1.45, 'crater', 'surface'); },
                    Brick(r = {}){ return undergroundCostMultiplier('crater_factory', r.offset, 65000, 1.45, 'crater', 'surface'); },
                    Iron(r = {}){ return undergroundCostMultiplier('crater_factory', r.offset, 660000, 1.55, 'crater', 'surface'); },
                    Aluminium(r = {}){ return undergroundCostMultiplier('crater_factory', r.offset, 350000, 1.55, 'crater', 'surface'); }
                },
                effect(){
                    return `<div class="has-text-caution">${loc('space_used_support',[loc('surface_crater')])}</div><div>${loc('surface_crater_factory_effect', [1, jobScale(3)])}</div>`;
                },
                s_type: 'crater',
                special: true,
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
                        p: ['crater_factory','surface']
                    };
                }
            },
            fuel_refinery: {
                id: 'surface-fuel_refinery',
                title(){ return loc('surface_fuel_refinery'); },
                desc(){
                    return `<div>${loc('surface_fuel_refinery')}</div><div class="has-text-special">${loc('space_support',[loc('surface_crater')])}</div>`;
                },
                type: 'industry',
                reqs: { thrusters: 1 },
                cost: {
                    Money(r={}){ return undergroundCostMultiplier('fuel_refinery', r.offset, 5000000, 1.45, 'crater', 'surface'); },
                    Power_Bones(r={}){ return undergroundCostMultiplier('fuel_refinery', r.offset, 25, 1.25, 'crater', 'surface'); },
                    Oil(r={}){ return undergroundCostMultiplier('fuel_refinery', r.offset, 225000, 1.55, 'crater', 'surface'); },
                    Lumber(r={}){ return undergroundCostMultiplier('fuel_refinery', r.offset, 220000, 1.55, 'crater', 'surface'); },
                    Sheet_Metal(r={}){ return undergroundCostMultiplier('fuel_refinery', r.offset, 160000, 1.45, 'crater', 'surface'); }
                },
                effect(){
                    let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('surface_crater')])}</div><div>${loc('surface_fuel_refinery_effect',[jobScale(1)])}</div>`;
                    return desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                },
                s_type: 'crater',
                support(){ return -1; },
                powered(){ return powerCostMod(12); },
                action(){
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
                        p: ['fuel_refinery','surface']
                    };
                },
                postPower(on){
                    limitCraftsmen('Super_Fuel');
                }
            },
            refinery_funnel: {
                id: 'surface-refinery_funnel',
                title(){ return loc('surface_refinery_funnel'); },
                desc(){
                    return `<div>${loc('surface_refinery_funnel')}</div>`;
                },
                type: 'industry',
                reqs: { thrusters: 1 },
                cost: {
                    Money(r={}){ return undergroundCostMultiplier('refinery_funnel', r.offset, 5000000, 1.45, 'crater', 'surface'); },
                    Power_Bones(r={}){ return undergroundCostMultiplier('refinery_funnel', r.offset, 25, 1.25, 'crater', 'surface'); },
                    Steel(r={}){ return undergroundCostMultiplier('refinery_funnel', r.offset, 225000, 1.55, 'crater', 'surface'); },
                    Stone(r={}){ return undergroundCostMultiplier('refinery_funnel', r.offset, 520000, 1.55, 'crater', 'surface'); },
                    Coal(r={}){ return undergroundCostMultiplier('refinery_funnel', r.offset, 340000, 1.45, 'crater', 'surface'); }
                },
                effect(){
                    let desc = `<div>${loc('surface_refinery_funnel_effect1',[10])}</div><div class="has-text-special">${loc('surface_refinery_funnel_effect2')}</div>`;
                    return desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                },
                powered(){ return powerCostMod(8); },
                action(){
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
                        p: ['refinery_funnel','surface']
                    };
                }
            }
        }
    }
}

export function drawEcology(id){
    if(global.surface.overview){
        if(id){
            $(`#surface-${id} .button .count`).html(actions.surface.ecosystem[id].count());
        }
        else{
            $(`#surface-trees .button .count`).html(actions.surface.ecosystem.trees.count());
            $(`#surface-herbivores .button .count`).html(actions.surface.ecosystem.herbivores.count());
            $(`#surface-carnivores .button .count`).html(actions.surface.ecosystem.carnivores.count());
            $(`#surface-scavengers .button .count`).html(actions.surface.ecosystem.scavengers.count());
            $(`#surface-aberrant_herbivores .button .count`).html(actions.surface.ecosystem.aberrant_herbivores.count());
            $(`#surface-aberrant_carnivores .button .count`).html(actions.surface.ecosystem.aberrant_carnivores.count());
            $(`#surface-aberrant_scavengers .button .count`).html(actions.surface.ecosystem.aberrant_scavengers.count());
        }
    }
}

function cave_fight(real=false, seed=global['warseed']){
    //full combat explanation
    //all soldiers are used at once, including injured ones to fight the cave creatures.
    //first between 2.8% and 14% of creatures ambush. This amount is affected by ambush-affecting sources
    //1 soldier dies for every 3 creatures that ambush rounded down
    //dying soldiers are saved by your armor rating, remaining deaths can be saved by instincts. Survivors become injured
    //next are rounds of combat. Soldiers strike first, reducing creatures by their combat rating. Up to 90% of struck creatures survive this. Injured soldiers have compromised rating for this
    //between 6.67% and 20% of creatures strike back, killing an equal amount of soldiers. The armor value protects soldiers from each strike, turning those who would have otherwise died into injuries
    //armor can not protect already injured soldiers however. After this, the cycle repeats until no creatures or soldiers are left.
    //if no creatures are left, the battle counts as won. Otherwise it's a loss.
    //after the battle. Any dead soldiers can get saved by instincts as wounded soldiers and dead soldiers can revive through revive.

    let creatures = actions.underground.depths.cave_creatures.group_size();
    let army = garrisonSize();
    let injuries = global.civic.garrison.wounded;
    let stored_seed = global['warseed'];
    global['warseed'] = seed;
    let ambushing_max = 70 - Math.max(global.race['chameleon'] ? traits.chameleon.vars()[1] : 0,
                                    global.race['elusive'] ? traits.elusive.vars()[0] : 0);
    if (global.race['chicken']){
        ambushing_max += Math.round(traits.chicken.vars()[0] / 5);
    }
    if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.f){
        ambushing_max -= Math.round(3 * traits.ocular_power.vars()[1] / 100);
    }
    let ambushing = Math.floor(seededRandom(ambushing_max / 5, ambushing_max,true) / 500 * creatures); //by default, between 2.8% and 14% of creatures ambush

    let deaths = Math.floor(ambushing / 3); //1 soldier dies per 3 ambushing creatures
    let armor = armorCalc(deaths); //can be more than deaths
    injuries += Math.min(deaths, armor, Math.max(0, army+armor-injuries));
    deaths -= Math.min(deaths, armor, Math.max(0, army+armor-injuries));
    if (global.race['instinct']){
        let reduction = Math.floor(deaths * (traits.instinct.vars()[1] / 100));
        deaths -= reduction;
        injuries += reduction;
    }
    army -= deaths;
    army = Math.max(0, army);
    injuries = Math.min(injuries, army);
    let further_deaths = 0;
    while(creatures > 0 && army > 0){
        let rating = armyRating(army, Math.min(army, injuries));
        creatures -= Math.round(seededRandom(rating * 0.1, rating,true));
        if(creatures > 0){
            let new_deaths = Math.round(seededRandom(creatures / 15, creatures / 5,true));
            let armor = armorCalc(new_deaths);
            injuries += Math.min(new_deaths, armor, Math.max(0, army+armor-injuries-new_deaths));
            new_deaths -= Math.min(new_deaths, armor, Math.max(0, army+armor-injuries-new_deaths));
            further_deaths += Math.min(army, new_deaths);
            army -= Math.min(army, new_deaths);
            injuries = Math.min(injuries, army);
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
        global['warseed'] = stored_seed; //do not update seed in a preview attempt.
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

function aberrant_stats(lifeform){
    let health = ecosystemInfo.aberrant_stats[lifeform].health;
    let fight = ecosystemInfo.aberrant_stats[lifeform].fight;
    let bones = 10;
    let aberrant_trait_list = ecosystemInfo.majorTraits;
    let aberrant_traits = global.aberrants[lifeform];
    let a_effect = (trait) => {
        return aberrant_trait_list[trait].trait_effect(aberrant_traits[trait]).effect || 1;
    }

    for(let [index, entry] of Object.entries(global.aberrants.trees)){ //tree traits apply to all fights
        if(!['count'].includes(index) && aberrant_trait_list[index].trait_effect(entry).loot){
            let trait_effect = aberrant_trait_list[index].trait_effect(entry).loot;
            bones *= trait_effect;
        }
    }
    for(let [index, entry] of Object.entries(aberrant_traits)){
        if(!['count'].includes(index) && aberrant_trait_list[index].trait_effect(entry).loot){
            let trait_effect = aberrant_trait_list[index].trait_effect(entry).loot;
            if(index === 'unchanging'){ //unchanging applies its bonus for each empty trait slot. 6 traits are allowed by default. 1 is always filled with empowered
                index = index ** ecosystemInfo.majorTraitCap() - aberrant_traits.length;
            }
            bones *= trait_effect;
        }
    }
    health *= a_effect('tough');
    health *= a_effect('bloated');
    health *= a_effect('ghostly');
    health *= a_effect('frail');
    health *= aberrant_trait_list.ooze.trait_effect(aberrant_traits.ooze || 0).health;
    health *= aberrant_traits.apex_predator ? 0.5 : 1;

    fight *= a_effect('angry');
    fight *= a_effect('swift');
    fight *= a_effect('apex_predator');
    fight *= a_effect('cold_blooded');
    fight *= a_effect('weak');
    fight *= a_effect('angry');
    fight *= aberrant_trait_list.ooze.trait_effect(aberrant_traits.ooze || 0).fight;
    fight *= aberrant_traits.bloated ? 0.5 : 1;

    return { health:Math.floor(health), fight:Math.floor(fight), bones:Math.floor(bones) };
}

function aberrant_fight(lifeform, real=false, seed=global['warseed']){
    //full combat explanation
    //works very similar to cave fight. All soldiers are used at once, including injured ones to fight the aberrant creature.
    //the creature always strikes first between 35% and 70% of its fight stat.
    //An amount of soldiers die equal to the ambush fight stat. Aberrant scavengers strike twice in a row here.
    //dying soldiers are saved by your armor rating, remaining deaths can be saved by instincts. Survivors become injured. Healthy soldiers become injured first. Injured soldiers can not be saved by armor when struck.
    //next are rounds of combat. Soldiers strike first, reducing hp by their combat rating minus up to -90%. Injured soldiers have compromised rating for this
    //the aberrant strikes back with between 33.3% and 100% of its fight stat, killing an equal amount of soldiers. The armor value protects soldiers from each strike, turning those who would have otherwise died into injuries.
    //After this, the cycle repeats until the aberrant runs out of hp or no soldiers are left.
    //if hp is depleted, the battle counts as won. Otherwise it's a loss.
    //after the battle. Any dead soldiers can get saved by instincts as wounded soldiers and dead soldiers can revive through revive.

    /*aggressive: razes ecosystem/surface buildings if left alone
    elusive: shows up slower
    calm: all aberrants show up slower
    hyper: aberrants show up more often*/
    let enemy_stats = aberrant_stats(lifeform);
    let aberrant_traits = global.aberrants[lifeform];
    let aberrant_trait_list = ecosystemInfo.majorTraits;
    let fight_log = [];
    let a_effect = (trait) => {
        return aberrant_trait_list[trait].trait_effect(aberrant_traits[trait]).effect || 1;
    }
    let t_effect = (trait) => { //trees apply global effects to all aberrants
        return aberrant_trait_list[trait].trait_effect(global.aberrants.trees[trait]).effect || 1;
    }
    let revive_active = a_effect('revive') - 1;
    let army = garrisonSize();
    //army *= t_effect('dense'); //dense reduces effective soldiers. (lost soldiers survive the encounter)
    army = Math.floor(army);
    let injuries = global.civic.garrison.wounded;
    if(global.aberrants.trees.fiery){
        let uninjured = army - injuries;
        let new_injuries = Math.floor(t_effect('fiery') * uninjured);
        injuries += new_injuries;
        fight_log.push(['fiery', new_injuries]);
    }

    let attacked = (fight, log='enemy_attack', traits_active=true) =>{
        let armor = traits_active && aberrant_traits.ghostly ? 0 : armorCalc(fight);
        let armor_reduce = Math.floor(Math.min(fight, armor, army, Math.max(0, army+armor-injuries-fight)));
        injuries += armor_reduce;
        let total_deaths = Math.min(army, fight - armor_reduce);
        deaths += total_deaths;
        army -= total_deaths;
        injuries = Math.min(injuries, army);
        let cold_blooded = 0;
        if(traits_active && aberrant_traits.cold_blooded){ //cold blooded instantly kills injured soldiers after an attack
            cold_blooded = injuries;
            deaths += cold_blooded;
            injuries = 0;
        }
        if(log){
            fight_log.push([log, /*fight, armor,*/ total_deaths, armor_reduce]);
        }
        if(log && cold_blooded){
            fight_log.push(['cold_blooded', cold_blooded]);
        }
    }

    let stored_seed = global['warseed'];
    global['warseed'] = seed;
    let ambush_power = 70 - Math.max(global.race['chameleon'] ? traits.chameleon.vars()[1] : 0,
                                    global.race['elusive'] ? traits.elusive.vars()[0] : 0);
    if (global.race['chicken']){
        ambush_power += Math.round(traits.chicken.vars()[0] / 5);
    }
    if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.f){
        ambush_power -= Math.round(3 * traits.ocular_power.vars()[1] / 100);
    }
    ambush_power *= a_effect('chameleon'); //chameleon makes ambush attacks stronger
    ambush_power *= a_effect('slow'); //slow makes ambush attacks weaker
    let deaths = 0;
    let ambushes = 1;
    ambushes += aberrant_traits.swift ? 1 : 0; //swift ambushes once more
    ambushes += aberrant_traits.chameleon ? 1 : 0; //chameleon ambushes once more
    ambushes += ecosystemInfo.aberrant_stats[lifeform].doublestrike ? 1 : 0; //scavenger aberrants ambush once more
    
    for(let i=0;i<ambushes; i++){
        //first strikes are 35-70% of its power by default. Later attacks are 33.3%-100%
        let ambush_deaths = seededRandom(enemy_stats.fight * ambush_power / 200, enemy_stats.fight * ambush_power / 100,true);
        ambush_deaths *= 1 + ((a_effect('blood_thirst')-1) * injuries) //fights harder when facing injured soldiers
        ambush_deaths = Math.round(ambush_deaths);
        attacked(ambush_deaths, 'ambush');
    }
    if (global.race['instinct']){
        let reduction = Math.floor(deaths * (traits.instinct.vars()[1] / 100));
        deaths -= reduction;
        injuries += reduction;
        fight_log.push(['instincts', reduction]);
    }
    //army = Math.max(0, army);
    let further_deaths = deaths;
    deaths = 0;
    let hp = enemy_stats.health;
    let rounds = 0;
    while(hp > 0 && army > 0 && rounds < 100){
        let rating = armyRating(army, Math.min(army, injuries));
        let damage = Math.round(seededRandom(rating * 0.1, rating,true));
        damage *= t_effect('sappy');
        damage -= a_effect('armored');
        if(rounds === 0){
            damage *= t_effect('darkness');
        }
        else{
            damage *= t_effect('toxic');
        }
        damage = Math.floor(damage);
        hp -= damage;
        fight_log.push(['soldier_attack', damage, Math.max(0, hp)]);
        if(0 >= hp){ //death triggers can happen twice if combined with revive
            if(aberrant_traits.magnificent){
                //existing penalty is averaged and added onto the new penalty.
                let penalty = +(((global.race['aberrant_magnificent_morale'] || 0) * (global.race['aberrant_magnificent'] || 0) / 100) + a_effect('magnificent')).toFixed(1);
                let duration = 100;
                if(real){
                    global.race['aberrant_magnificent_morale'] = penalty
                    global.race['aberrant_magnificent'] = duration;
                }
                fight_log.push(['magnificent', penalty, duration]);
            }
            if(aberrant_traits.unstable){ //dying unstable aberrants explode
                attacked(Math.round(a_effect('unstable') * enemy_stats.fight), 'unstable', false);
            }
            if(revive_active > 0){ //undo last damage dealt and gain extra hp. Can go above hp cap.
                hp += damage;
                hp += enemy_stats.health * revive_active;
                fight_log.push(['aberrant_revive', enemy_stats.health * revive_active]);
                revive_active = 0;
            }
        }
        if(hp > 0){
            let fight = enemy_stats.fight;
            let ratio = Math.min(1, hp / enemy_stats.health);
            fight *= 1 + ((a_effect('rage')-1) * ratio); //fights harder when at lower health
            fight *= 1 + ((a_effect('blood_thirst')-1) * injuries) //fights harder when facing injured soldiers
            for(let i=0;i<=(global.aberrants.trees.grenadier > 1 ? 1 : 0); i++){ //grenadier causes a second round of combat after each round that has flat damage. Other aberrant traits do not activate for this round
                let attack_deaths = 0;
                if(i > 0){
                    attack_deaths = t_effect('grenadier');
                }
                else{
                    attack_deaths = Math.round(seededRandom(fight / 3, fight,true));
                }
                attacked(attack_deaths, i === 0 ? 'enemy_attack' : 'grenadier', i === 0);
                if(aberrant_traits.regenerative && i === 0){
                    let regen = enemy_stats.health * a_effect('regenerative');
                    hp += Math.min(Math.max(enemy_stats.health - hp, 0), regen);
                    fight_log.push(['regenerative', enemy_stats.health * a_effect('regenerative'), hp]);
                }
            }
        }
        rounds++;
    }

    if (global.race['instinct']){ //second instincts proc? How generous.
        let reduction = Math.floor(deaths * (traits.instinct.vars()[1] / 100));
        deaths -= reduction;
        injuries += reduction;
        fight_log.push(['instincts', reduction]);
    }
    deaths += further_deaths;
    let revive = 0;
    if(real && false){
        soldierDeath(deaths);
        global.civic.garrison.protest += deaths * 2;
        injuries += global.civic.garrison.wounded;
        if(army > injuries){
            global.civic.garrison.wounded += Math.ceil(seededRandom(0, army - injuries));
        }
        global.civic.garrison.wounded = Math.min(army, injuries);
        if(global.race['revive']){
            revive = deaths * Math.round(seededRandom(0, deaths / traits.revive.vars()[0], true)); //todo, make revive actually weather dependent. For cave_fight too.
            global.civic.garrison.workers += revive;
            fight_log.push(['revive', revive]);
        }
    }
    else{
        global['warseed'] = stored_seed; //do not update seed in a preview attempt.
    }
    let result = {
        success: hp <= 0,
        damage: Math.max(0, ecosystemInfo.aberrant_stats[lifeform].health - hp),
        injuries: Math.min(army, injuries),
        deaths: deaths,
        revive: revive,
        log: fight_log
    }
    fight_log.push(['end', result.success ? `<span class="has-text-success">${loc('fight_log_victory')}<span>` : `<span class="has-text-danger">${loc('fight_log_defeat')}</span>`, result.damage, result.deaths, result.injuries]);
    return result;
}

export const ecosystemInfo = {
    trees: {
        plant: true,
        water_min: 0.1, //minimum tolerate water ratio. Ratio is water / area
        water_max: 0.5, //maximum tolerable water ratio
        water_use: 0.2, //amount of flat water used per tree per in-game day. Consumption of all lifeforms as accounted for first before determining tolerable water ratios
        decay_rate: 0.99, //multiplier to existing trees per in-game day if water conditions are not met
        growth_rate: 1.01, //multiplier to amount of trees each day as long as water conditions are met
        size: 2 //growth rate slows down once size reaches past 50% of total area, stops completely once it hits 100% and decays once it hits >100%
    },
    herbivores: {
        prey: true,
        water_min: 0.08,
        water_max: 0.4,
        water_use: 0.08,
        trees_use: 0.01,
        decay_rate: 0.98,
        growth_rate: 1.008,
        size: 5,
    },
    carnivores: {
        water_min: 0.08,
        water_max: 0.4,
        water_use: 0.1,
        meat_use: 0.004,
        decay_rate: 0.96,
        growth_rate: 1.004,
        size: 10
    },
    scavengers: {
        water_min: 0.1,
        water_max: 0.6,
        water_use: 0.05,
        corpse_use: 0.0015,
        decay_rate: 0.99,
        growth_rate: 1.008,
        size: 3
    },
    minorTraits: {
        promiscuous: 0,
        hardy: 0,
        compact: 0,
        slow_digestion: 0,
        playful: 0,
        curious: 0
    },
    minorTraitEffects: {
        promiscuous: 3,
        hardy: 3,
        compact: 2,
        slow_digestion: 1,
        playful: 3,
        curious: 3
    },
    plantMinorTraitEffects: {
        promiscuous: 3,
        hardy: 3,
        compact: 2,
        slow_digestion: 3,
        playful: 3,
        curious: 3
    },
    plantMinorTraitNames: {
        promiscuous: 'photosynth',
        hardy: 'hardy',
        compact: 'compact',
        slow_digestion: 'large',
        playful: 'fragrant',
        curious: 'iron_wood'
    },
    majorTraits:{
        empowered: { //empowered is a special trait. It is required for other major traits to show up, can't be removed and spreads through other empowered lifeforms
            name(){ return loc('trait_empowered_name'); },
            desc(){ return loc('ecotrait_empowered_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(1);
                let desc = `<div><div>${loc('ecotrait_empowered_effect1', [+((trait_mods.minor_traits - 1) * 100).toFixed(1), loc(`surface_${s}_single`)])}</div>`;
                if(global.tech['ecosystem_genetics'] >= 4 && s !== 'trees'){
                    desc += `<div>${loc('ecotrait_empowered_effect2', [+((trait_mods.major_traits - 1) * 100).toFixed(1), loc(`surface_${s}_single`)])}</div>`;
                }
                else{
                    desc += `<div class="has-text-caution">${loc('ecotrait_empowered_effect3')}</div>`;
                }
                desc += `</div>`;
                return desc;
            },
            trait_effect(r=0){
                return {minor_traits: 1 + (0.01 * r), major_traits: 1 + (0.05 * r)};
            }
        },
        unchanging: { //prevent new traits from showing up, more reward based on unfilled traits
            name(){ return loc('trait_unchanging_name'); },
            desc(){ return loc('ecotrait_unchanging_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_unchanging_effect', [+((trait_mods - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return 1 + (0.03 * r);
            }
        },
        /*empowered: reduced minor trait cost based on empowered lifeforms of its type. Reduced major trait cost based on total defeated aberrants of its type. (always present on everything)
        unchanging: prevent new traits from showing up, more reward based on unfilled traits (can show up on everyone)

        sappy: reduced soldier rating during all aberrant fights
        darkness: reduced soldier rating for the first attack during all aberrant fights
        toxic: reduced soldier rating after the first attack during all aberrant fights
        dense: reduced effective soldier count for all fights
        calm: all aberrants show up slower
        hyper: aberrants show up more often
        fiery: a percentage of soldiers start each fight injured
        greedy: higher reward at no downside
        grenadier: attacks soldiers after each turn for each battle*/
        sappy: { //reduced soldier rating during all aberrant fights
            name(){ return loc('trait_sappy_name'); },
            desc(){ return loc('ecotrait_sappy_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_sappy_effect', [+((1 - trait_mods.effect) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(0.95 ** r), loot:1 + (0.03 * r)};
            }
        },
        darkness: { //the first soldier attack each aberrant fight is less effective
            name(){ return loc('trait_darkness_name'); },
            desc(){ return loc('ecotrait_darkness_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_darkness_effect', [+((1 - trait_mods.effect) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(0.9 ** r), loot:1 + (0.03 * r)};
            }
        },
        toxic: { //reduced soldier rating after the first attack during all aberrant fights
            name(){ return loc('trait_toxic_name'); },
            desc(){ return loc('ecotrait_toxic_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_toxic_effect', [+((1 - trait_mods.effect) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(0.92 ** r), loot:1 + (0.03 * r)};
            }
        },
        dense: { //reduced effective soldier count for all fights
            name(){ return loc('trait_dense_name'); },
            desc(){ return loc('ecotrait_dense_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_dense_effect', [+((1 - trait_mods.effect) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(0.95 ** r), loot:1 + (0.04 * r)};
            }
        },
        calm: { //all aberrants show up slower
            name(){ return loc('trait_calm_name'); },
            desc(){ return loc('ecotrait_calm_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_calm_effect', [+((trait_mods.effect) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(0.95 ** r), loot:(1.04 ** r)};
            }
        },
        hyper: { //aberrants show up more often
            name(){ return loc('trait_hyper_name'); },
            desc(){ return loc('ecotrait_hyper_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_hyper_effect', [+((trait_mods.effect - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:1 + (0.08 * r)};
            }
        },
        fiery: { //a percentage of soldiers start each fight injured
            name(){ return loc('trait_fiery_name'); },
            desc(){ return loc('ecotrait_fiery_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_fiery_effect', [+((1 - trait_mods.effect) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:1 - (0.95 ** r), loot:1 + (0.05 * r)};
            }
        },
        greedy: { //higher reward at no downside
            name(){ return loc('trait_greedy_name'); },
            desc(){ return loc('ecotrait_greedy_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {loot:1 + (0.018 * r)};
            }
        },
        grenadier: { //attacks soldiers after each turn for each battle
            name(){ return loc('trait_grenadier_name'); },
            desc(){ return loc('ecotrait_grenadier_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_grenadier_effect', [+((trait_mods.effect - 1) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:2 * r, loot:(1.06 * r)};
            }
        },

        /*aggressive: razes ecosystem/surface buildings if left alone
        armored: blocks a flat amount of combat damage each strike
        swift: performs an extra ambush strike, extra fight
        chameleon: performs an extra ambush strike, ambush strikes are stronger
        tough: extra hp
        angry: extra fight
        bloated: lots of extra hp, less fight
        apex_predator: lots of extra fight, less hp
        magnificent: harsh temporary morale drop when defeated
        rage: fights harder when hp is lower
        blood_thirst: fights harder the more injured soldiers there are
        elusive: shows up slower
        revive: nullifies a lethal blow and regains a percentage of max hp
        cold_blooded: instantly kills injured soldiers after each attack, extra fight
        ghostly: armor has no effect during fights against this aberrant, extra hp
        regenerative: regains a percentage of its hp after each strike
        unstable: performs a strong attack on death. If this kills all soldiers, you still win*/
        aggressive: { //razes ecosystem/surface buildings if left alone
            name(){ return loc('trait_aggressive_name'); },
            desc(){ return loc('ecotrait_aggressive_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_aggressive_effect')} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:r, loot:(1.05 * r)};
            }
        },
        armored: { //blocks a flat amount of combat damage each strike
            name(){ return loc('trait_armored_name'); },
            desc(){ return loc('ecotrait_armored_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_armored_effect', [trait_mods.effect])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:5 * r, loot:(1.05 * r)};
            }
        },
        swift: { //performs an extra ambush strike. More fight
            name(){ return loc('trait_swift_name'); },
            desc(){ return loc('ecotrait_swift_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_swift_effect', [+((trait_mods.effect - 1) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(1.03 ** r), loot:1.3 + (0.04 * r)};
            }
        },
        chameleon: { //performs an extra ambush strike. Ambushes are more powerful
            name(){ return loc('trait_chameleon_name'); },
            desc(){ return loc('ecotrait_chameleon_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_chameleon_effect', [+((trait_mods.effect - 1) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(1.04 ** r), loot:1.3 + (0.04 * r)};
            }
        },
        tough: { //extra hp
            name(){ return loc('trait_tough_name'); },
            desc(){ return loc('ecotrait_tough_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_tough_effect', [+((trait_mods.effect - 1) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(1.08 ** r), loot:1 + (0.05 * r)};
            }
        },
        angry: { //extra fight
            name(){ return loc('trait_angry_name'); },
            desc(){ return loc('ecotrait_angry_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_angry_effect', [+((trait_mods.effect - 1) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(1.08 ** r), loot:1 + (0.05 * r)};
            }
        },
        bloated: { //lots of extra hp, less fight
            name(){ return loc('trait_bloated_name'); },
            desc(){ return loc('ecotrait_bloated_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_bloated_effect', [+((trait_mods.effect - 1) * 100).toFixed(1), 50])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:r ? 2 + (1.08 ** r) : 1, loot:1 + (0.05 * r)};
            }
        },
        apex_predator: { //lots of extra fight, less hp
            name(){ return loc('trait_apex_predator_name'); },
            desc(){ return loc('ecotrait_apex_predator_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_apex_predator_effect', [+((trait_mods.effect - 1) * 100).toFixed(1), 50])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:r ? 2 + (1.08 ** r) : 1, loot:1 + (0.05 * r)};
            }
        },
        magnificent: { //harsh temporary morale drop when defeated
            name(){ return loc('trait_magnificent_name'); },
            desc(){ return loc('ecotrait_magnificent_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_magnificent_effect', [trait_mods.effect, 100])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(4 * r), loot:1 + (0.06 * r)};
            }
        },
        rage: { //fights harder when hp is lower
            name(){ return loc('trait_rage_name'); },
            desc(){ return loc('ecotrait_rage_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_rage_effect', [+((trait_mods.effect - 1) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(1.1 ** r), loot:1 + (0.065 * r)};
            }
        },
        blood_thirst: { //fights harder the more injured soldiers there are
            name(){ return loc('trait_blood_thirst_name'); },
            desc(){ return loc('ecotrait_blood_thirst_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_blood_thirst_effect', [+((trait_mods.effect - 1) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:1 + (0.02 * r), loot:1 + (0.06 * r)};
            }
        },
        elusive: { //shows up slower
            name(){ return loc('trait_elusive_name'); },
            desc(){ return loc('ecotrait_elusive_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_elusive_effect', [+((trait_mods.effect - 1) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(0.9 ** r), loot:(1.06 ** r)};
            }
        },
        revive: { //nullifies a lethal blow and regains a percentage of max hp
            name(){ return loc('trait_revive_name'); },
            desc(){ return loc('ecotrait_revive_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_revive_effect', [+((trait_mods.effect - 1) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:1 + (0.05 * r), loot:1.3 + (0.045 * r)};
            }
        },
        cold_blooded: { //instantly kills injured soldiers after each attack, extra fight
            name(){ return loc('trait_cold_blooded_name'); },
            desc(){ return loc('ecotrait_cold_blooded_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_cold_blooded_effect', [+((trait_mods.effect - 1) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:1 + (0.03 * r), loot:1.25 + (0.05 * r)};
            }
        },
        ghostly: { //armor has no effect during fights against this aberrant, extra hp
            name(){ return loc('trait_ghostly_name'); },
            desc(){ return loc('ecotrait_ghostly_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_ghostly_effect', [+((trait_mods.effect - 1) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:1 + (0.03 * r), loot:1.1 + (0.04 * r)};
            }
        },
        regenerative: { //regains a percentage of its hp after each strike
            name(){ return loc('trait_regenerative_name'); },
            desc(){ return loc('ecotrait_regenerative_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_regenerative_effect', [+(trait_mods.effect * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(0.04 * r), loot:1 + (0.06 * r)};
            }
        },
        unstable: { //performs a strong attack on death. (If this kills all soldiers, you still win)
            name(){ return loc('trait_unstable_name'); },
            desc(){ return loc('ecotrait_unstable_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_unstable_effect', [+(trait_mods.effect * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect1', [+((trait_mods.loot - 1) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:1 + (0.12 * r), loot:1 + (0.04 * r)};
            }
        },
        /*weak: less fight, less reward
        frail: less hp, less reward
        slow: less first strike damage, less rewards
        ooze: less hp, less fight, much less reward*/
        weak: { //less fight, less reward
            name(){ return loc('trait_weak_name'); },
            desc(){ return loc('ecotrait_weak_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_weak_effect', [+((1 - trait_mods.effect) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect2', [+((1 - trait_mods.loot) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(0.95 ** r), loot:(0.96 ** r)};
            }
        },
        frail: { //less hp, less reward
            name(){ return loc('trait_frail_name'); },
            desc(){ return loc('ecotrait_frail_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_frail_effect', [+((1 - trait_mods.effect) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect2', [+((1 - trait_mods.loot) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(0.95 ** r), loot:(0.96 ** r)};
            }
        },
        slow: { //less first strike damage, less rewards
            name(){ return loc('trait_slow_name'); },
            desc(){ return loc('ecotrait_slow_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_slow_effect', [+((1 - trait_mods.effect) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect2', [+((1 - trait_mods.loot) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {effect:(0.94 ** r), loot:(0.94 ** r)};
            }
        },
        ooze: { //less hp, less fight, less reward
            name(){ return loc('trait_ooze_name'); },
            desc(){ return loc('ecotrait_ooze_desc'); },
            effect(s, r){
                let trait_mods = $(this)[0].trait_effect(r);
                return `<div>${loc('ecotrait_ooze_effect', [+((1 - trait_mods.fight) * 100).toFixed(1), +((1 - trait_mods.health) * 100).toFixed(1)])} ${loc('ecotrait_greedy_effect2', [+((1 - trait_mods.loot) * 100).toFixed(1)])}</div>`;
            },
            trait_effect(r=0){
                return {health:(0.96 ** r), fight:(0.96 ** r), loot:(0.94 ** r)};
            }
        },

        hivemind: {
            name(){ return `<span class="has-text-danger">${loc('trait_hivemind_name')}</span>`; },
            desc(){ return global.aberrants.carnivores.intelligent ? loc('ecotrait_hivemind_desc') : loc('ecotrait_hivemind_desc_default'); },
            effect(s, r){
                let desc = ``;
                if(global.aberrants.scavengers.infiltrator){
                    desc += `<div>${loc('ecotrait_hivemind_effect_infiltrator')}</div>`;
                }
                else {
                    desc += `<div>${loc('ecotrait_hivemind_effect')}</div>`;
                }
                if(global.aberrants.herbivores.shapeshifter){
                    desc += `<span class="block">${loc('ecotrait_hivemind_effect_shapeshifter')}</span>`;
                }
                return desc;
            },
            trait_effect(r=0){
                return {}
            },
            danger: true
        },
        shapeshifter: {
            name(){ return `<span class="has-text-danger">${loc('trait_shapeshifter_name')}</span>`; },
            desc(){ return global.aberrants.carnivores.intelligent ? loc('ecotrait_shapeshifter_desc') : loc('ecotrait_hivemind_desc_default'); },
            effect(s, r){
                let lethal = global.aberrants.trees.hasOwnProperty('hivemind') && global.aberrants.herbivores.hasOwnProperty('shapeshifter') && 
                    global.aberrants.carnivores.hasOwnProperty('intelligent') && global.aberrants.scavengers.hasOwnProperty('infiltrator');
                let desc = ``;
                if(global.aberrants.scavengers.infiltrator){
                    desc += `<div>${loc('ecotrait_hivemind_effect_infiltrator')}</div>`;
                }
                else {
                    desc += `<div>${loc('ecotrait_hivemind_effect')}</div>`;
                }
                if(global.aberrants.herbivores.shapeshifter){
                    desc += `<span class="block">${loc('ecotrait_hivemind_effect_shapeshifter')}</span>`;
                }
                return desc;
            },
            trait_effect(r=0){
                return {}
            },
            danger: true
        },
        intelligent: {
            name(){ return `<span class="has-text-danger">${loc('trait_intelligent_name')}</span>`; },
            desc(){ return global.aberrants.carnivores.intelligent ? loc('ecotrait_intelligent_desc') : loc('ecotrait_hivemind_desc_default'); },
            effect(s, r){
                let desc = ``;
                if(global.aberrants.scavengers.infiltrator){
                    desc += `<div>${loc('ecotrait_hivemind_effect_infiltrator')}</div>`;
                }
                else {
                    desc += `<div>${loc('ecotrait_hivemind_effect')}</div>`;
                }
                if(global.aberrants.herbivores.shapeshifter){
                    desc += `<span class="block">${loc('ecotrait_hivemind_effect_shapeshifter')}</span>`;
                }
                return desc;
            },
            trait_effect(r=0){ //does not actually raise loot
                return {}
            },
            danger: true
        },
        infiltrator: {
            name(){ return `<span class="has-text-danger">${loc('trait_infiltrator_name')}</span>`; },
            desc(){ return global.aberrants.carnivores.intelligent ? loc('ecotrait_infiltrator_desc') : loc('ecotrait_hivemind_desc_default'); },
            effect(s, r){
                let desc = ``;
                if(global.aberrants.scavengers.infiltrator){
                    desc += `<div>${loc('ecotrait_hivemind_effect_infiltrator')}</div>`;
                }
                else {
                    desc += `<div>${loc('ecotrait_hivemind_effect')}</div>`;
                }
                if(global.aberrants.herbivores.shapeshifter){
                    desc += `<span class="block">${loc('ecotrait_hivemind_effect_shapeshifter')}</span>`;
                }
                return desc;
            },
            trait_effect(r=0){
                return {}
            },
            danger: true
        }
    },
    majorTraitList: {
        /*
        empowered: reduced minor trait cost based on empowered lifeforms of its type. Reduced major trait cost based on total defeated aberrants of its type. (always present on everything)
        unchanging: prevent new traits from showing up, more reward based on unfilled traits (can show up on everyone)
        greedy: higher reward at no downside (can show up on everyone)

        sappy: reduced soldier rating during all aberrant fights
        darkness: reduced soldier rating for the first attack during all aberrant fights
        toxic: reduced soldier rating after the first attack during all aberrant fights
        dense: reduced effective soldier count for all fights
        calm: all aberrants show up slower
        hyper: aberrants show up more often
        fiery: a percentage of soldiers start each fight injured
        grenadier: attacks soldiers after each turn for each battle

        aggressive: razes ecosystem/surface buildings if left alone
        armored: blocks a flat amount of combat damage each strike
        swift: performs an extra ambush strike, extra fight
        chameleon: performs an extra ambush strike, ambush strikes are stronger
        tough: extra hp
        angry: extra fight
        bloated: lots of extra hp, less fight
        apex_predator: lots of extra fight, less hp
        magnificent: harsh temporary morale drop when defeated
        rage: fights harder when hp is lower
        blood_thirst: fights harder the more injured soldiers there are
        elusive: shows up slower
        revive: nullifies a lethal blow and regains a percentage of max hp
        cold_blooded: instantly kills injured soldiers after each attack, extra fight
        ghostly: armor has no effect during fights against this aberrant, extra hp
        regenerative: regains a percentage of its hp after each strike
        unstable: performs a strong attack on death. If this kills all soldiers, you still win

        weak: less fight, less reward
        frail: less hp, less reward
        slow: less first strike damage, less rewards
        ooze: less hp, less fight, much less reward

        34 traits in total.
        2 are special traits
        9 are modifier traits for all battles/can only show up on trees
        19 are loot-increasing animal traits
        4 are loot-decreasing animal traits
        */
        trees: ['unchanging', 'sappy', 'toxic' ,'dense', 'calm', 'fiery', 'greedy', 'darkness', 'grenadier', 'hyper'],
        herbivores: ['unchanging', 'aggressive', 'armored', 'swift', 'chameleon', 'greedy', 'tough', 'angry', 'bloated', 'apex_predator',
            'magnificent', 'rage', 'blood_thirst', 'elusive', 'revive', 'cold_blooded', 'ghostly', 'regenerative', 'unstable', 'weak', 'frail', 'slow', 'ooze'],
        carnivores: ['unchanging', 'aggressive', 'armored', 'swift', 'chameleon', 'greedy', 'tough', 'angry', 'bloated', 'apex_predator',
            'magnificent', 'rage', 'blood_thirst', 'elusive', 'revive', 'cold_blooded', 'ghostly', 'regenerative', 'unstable', 'weak', 'frail', 'slow', 'ooze'],
        scavengers: ['unchanging', 'aggressive', 'armored', 'swift', 'chameleon', 'greedy', 'tough', 'angry', 'bloated', 'apex_predator',
            'magnificent', 'rage', 'blood_thirst', 'elusive', 'revive', 'cold_blooded', 'ghostly', 'regenerative', 'unstable', 'weak', 'frail', 'slow', 'ooze']
    },
    majorTraitCap(){ return 6; },
    minorTraitCost(level, lifeform){
        let cost = fibonacci(level + 4);
        if(global.aberrants[lifeform].empowered && global.surface[lifeform].empowered >= 1){
            cost /= ecosystemInfo.majorTraits.empowered.trait_effect(global.surface[lifeform].empowered).minor_traits;
        }
        return Math.round(cost);
    },
    majorTraitCost(level, lifeform){
        let cost = fibonacci(level + 4);
        let stat = '';
        if(lifeform === 'herbivores'){
            stat = 'hslain';
        }
        if(lifeform === 'carnivores'){
            stat = 'cslain';
        }
        if(lifeform === 'scavengers'){
            stat = 'sslain';
        }
        if(global.aberrants[lifeform].empowered && global.stats[stat] >= 1){
            cost /= ecosystemInfo.majorTraits.empowered.trait_effect(global.stats[stat]).major_traits;
        }
        return Math.round(cost);
    },
    aberrant_stats: {
        herbivores: {health: 180, fight: 20}, //50% more hp
        carnivores: {health: 120, fight: 30}, //50% more fight
        scavengers: {health: 120, fight: 20, doublestrike: true} //initial ambush strikes twice
    }
}

export function ecoMinorTraitEffect(creature, trait){
    if(ecosystemInfo[creature].plant){
        return 1 + (ecosystemInfo.plantMinorTraitEffects[trait] * global.surface[creature].minorTraits[trait] / 100);
    }
    return 1 + (ecosystemInfo.minorTraitEffects[trait] * global.surface[creature].minorTraits[trait] / 100);
}

export function surfaceEcosystemVisual(){ //run every fastLoop (0.25 seconds)
    global.surface.overview.area = (p_on['area_heater'] || 0) * actions.surface.ecosystem.area_heater.support() * (1 + actions.surface.wastes.grand_dome.eco_area() / 100);
    global.surface.overview.water = (p_on['water_pipe'] || 0) * actions.surface.ecosystem.water_pipe.support();
}

export function surfaceEcosystem(){ //run every longLoop (5 seconds)
    let corpses = 0;
    if(global.surface.trees){
        let tree_cycle = growth_cycle('trees');
        global.surface.trees.count = Math.max(0, global.surface.trees.count + tree_cycle.total_change);
        global.surface.trees.empowered += tree_cycle.empowered;
    }
    if(global.surface.herbivores){
        let herbivore_cycle = growth_cycle('herbivores');
        global.surface.herbivores.count = Math.max(0, global.surface.herbivores.count + herbivore_cycle.total_change);
        global.surface.herbivores.empowered += herbivore_cycle.empowered;
        let aberrant_odds = Math.floor((global.surface.herbivores.empowered ** 0.5) / (2 ** global.aberrants.herbivores.count));
        aberrant_odds *= ecosystemInfo.majorTraits.elusive.trait_effect(global.aberrants.herbivores.elusive).effect;
        aberrant_odds *= ecosystemInfo.majorTraits.calm.trait_effect(global.aberrants.trees.calm).effect;
        aberrant_odds *= ecosystemInfo.majorTraits.hyper.trait_effect(global.aberrants.trees.hyper).effect;
        if(Math.rand(0, 100) < aberrant_odds){
            global.aberrants.herbivores.count++;
        }
    }
    if(global.surface.carnivores){
        let carnivore_cycle = growth_cycle('carnivores');
        global.surface.carnivores.count = Math.max(0, global.surface.carnivores.count + carnivore_cycle.total_change);
        global.surface.carnivores.empowered += carnivore_cycle.empowered;
        corpses += carnivore_cycle.corpse_create;
        let aberrant_odds = Math.floor((global.surface.carnivores.empowered ** 0.5) / (2 ** global.aberrants.carnivores.count));
        aberrant_odds *= ecosystemInfo.majorTraits.elusive.trait_effect(global.aberrants.carnivores.elusive).effect;
        aberrant_odds *= ecosystemInfo.majorTraits.calm.trait_effect(global.aberrants.trees.calm).effect;
        aberrant_odds *= ecosystemInfo.majorTraits.hyper.trait_effect(global.aberrants.trees.hyper).effect;
        if(Math.rand(0, 100) < aberrant_odds){
            global.aberrants.carnivores.count++;
        }
    }
    if(global.surface.scavengers){
        let scavenger_cycle = growth_cycle('scavengers');
        global.surface.scavengers.count = Math.max(0, global.surface.scavengers.count + scavenger_cycle.total_change);
        global.surface.scavengers.empowered += scavenger_cycle.empowered;
        corpses -= scavenger_cycle.corpse_consume;
        let aberrant_odds = Math.floor((global.surface.scavengers.empowered ** 0.5) / (2 ** global.aberrants.scavengers.count));
        aberrant_odds *= ecosystemInfo.majorTraits.elusive.trait_effect(global.aberrants.scavengers.elusive).effect;
        aberrant_odds *= ecosystemInfo.majorTraits.calm.trait_effect(global.aberrants.trees.calm).effect;
        aberrant_odds *= ecosystemInfo.majorTraits.hyper.trait_effect(global.aberrants.trees.hyper).effect;
        if(Math.rand(0, 100) < aberrant_odds){
            global.aberrants.scavengers.count++;
        }
    }
    let corpse_change = corpse_cycle(corpses);
    global.surface.overview.corpses = Math.max(0, global.surface.overview.corpses + corpse_change);
    global.surface.overview.cooldown = Math.max(0, global.surface.overview.cooldown - 1);

    if(global.surface.herbivores?.count >= 10 && global.tech['surface'] === 5){
        global.tech['surface'] = 6;
        messageQueue(loc('tech_ecosystem_progression'),'info',false,['progress']);
        drawTech();
    }
    if(Math.min(global.surface.herbivores?.count, global.surface.carnivores?.count, global.surface.scavengers?.count) >= 10 && global.tech['surface'] === 8){
        global.tech['surface'] = 9;
        messageQueue(loc('tech_ecosystem_progression2'),'info',false,['progress']);
        drawTech();
    }
    if(global.surface.trees.empowered >= 2 && global.tech['ecosystem_genetics'] === 2){
        messageQueue(loc('tech_plant_odd_seed_result2'),'info',false,['progress']);
        messageQueue(loc('tech_plant_odd_seed_result1'),'info',false,['progress']);
        global.tech['ecosystem_genetics'] = 3;
    }
    if(global.surface.trees.empowered >= 500 && !global.aberrants.herbivores.empowered){
        global.aberrants.herbivores.empowered = 1;
        messageQueue(loc('tech_plant_odd_seed_result3'),'info',false,['progress']);
    }
    if(global.surface.herbivores.empowered >= 300 && !global.aberrants.carnivores.empowered){
        global.aberrants.carnivores.empowered = 1;
        messageQueue(loc('tech_plant_odd_seed_result4'),'info',false,['progress']);
    }
    if(global.surface.carnivores.empowered >= 200 && !global.aberrants.scavengers.empowered){
        global.aberrants.scavengers.empowered = 1;
        messageQueue(loc('tech_plant_odd_seed_result5'),'info',false,['progress']);
    }
    if(global.aberrants.herbivores.count + global.aberrants.carnivores.count + global.aberrants.scavengers.count > 0 && global.tech['ecosystem_genetics'] === 3){
        messageQueue(loc('tech_aberrant_emergence'),'info',false,['progress']);
        global.tech['ecosystem_genetics'] = 4;
        renderSurface();
    }
    if(global.tech['ecosystem_genetics'] >= 7 && Math.rand(0, 100) === 0){
        if(global.stats.amutations === 5){
            ecoGainMajorTrait('trees', 'hivemind');
        }
        else{
            ecoGainMajorTrait();
        }
    }
    drawEcology();
}

function growth_cycle(lifeform){
    let results = {
        drought_loss: 0,
        flood_loss: 0,
        starve_loss: 0,
        herbivore_loss: 0,
        carnivore_loss: 0,
        size_loss: 0,
        total_loss: 0,
        corpse_create: 0,
        corpse_consume: 0,
        grow_gain: 0,
        overcrowd_gain_reduce: 1,
        empowered: 0,
        total_gain: 0,
        total_change: 0
    };
    let info = global.surface.overview;
    let self = global.surface[lifeform];
    let eco_info = ecosystemInfo[lifeform];
    if(info && self){
        let water = info.water - actions.surface.ecosystem.overview.total_water_use();
        let water_ratio = water / info.area;
        if(water_ratio < 0){
            water_ratio = 0;
        }
        let max_allowed = info.area / eco_info.size * ecoMinorTraitEffect(lifeform, 'compact');
        let size_ratio = self.count / max_allowed;
        let fed = true;
        let slow_digestion = !eco_info.plant ? ecoMinorTraitEffect(lifeform, 'slow_digestion') : 1;
        let decay = ecoMinorTraitEffect(lifeform, 'hardy');
        if(eco_info.trees_use){
            let eat = eco_info.trees_use * self.count / slow_digestion;
            if(eat > (global.surface.trees?.count || 0)){ // up to 5% loss depending on lack of trees
                results.starve_loss = self.count * 0.05 * (1 - ((global.surface.trees?.count || 0) / eat)) / decay;
                fed = false;
            }
        }
        if(eco_info.meat_use){
            let eat = eco_info.meat_use * self.count / slow_digestion;
            let avail = (global.surface.herbivores?.count || 0) / 100; //only 1% of herbivores are exposed to predators
            if(eat > avail){ //up to 5% loss depending on lack of food
                results.starve_loss += self.count * 0.05 * (1 - (avail / eat)) / decay;
                fed = false;
            }
            results.corpse_create = Math.min(eat, avail);
        }
        if(eco_info.corpse_use){
            let eat = eco_info.corpse_use * self.count / slow_digestion;
            if(eat > info.corpses){ //up to 5% loss depending on lack of food
                results.starve_loss += self.count * 0.05 * (1 - (info.corpses / eat)) / decay;
                fed = false;
            }
            results.corpse_consume += Math.min(eat, info.corpses); 
        }
        if(water_ratio <= eco_info.water_min){ //0% loss at 0.1 water -> 5% loss at 0 water
            results.drought_loss += self.count * (0.05 * (Math.abs(water_ratio - 0.1) / eco_info.water_min)) / decay;
        }
        if(water_ratio > eco_info.water_max){ //2% loss per 0.1 above 0.5 up to 10% loss at 1 water
            results.flood_loss += self.count * (0.02 * ((water_ratio-eco_info.water_max) * 10)) / decay;
        }
        if(eco_info.prey){ //carnivores eat prey animals (herbivores)
            results.carnivore_loss += Math.min(ecosystemInfo.carnivores.meat_use * (global.surface.carnivores?.count || 0), self.count / 100) / ecoMinorTraitEffect('carnivores', 'slow_digestion');
        }
        if(eco_info.plant){ //plants (trees) get eaten by herbivores
            results.herbivore_loss += ecosystemInfo.herbivores.trees_use * (global.surface.herbivores?.count || 0) / ecoMinorTraitEffect('herbivores', 'slow_digestion');
        }
        if(size_ratio > 1){ //0-20% loss between 100% to 200% coverage
            results.size_loss = (self.count * (0.2 * Math.min(1, size_ratio - 1))) / decay;
        }
        if(water_ratio > 0 && (self.count >= 2 || eco_info.plant) && fed ){ //grows if there's water, enough food and there are at least 2 already
            //growth is reduced at >50% size coverage. Linear reduction to 0 at 100% coverage
            results.grow_gain = self.count * ((eco_info.growth_rate - 1) * (2 - Math.max(1, size_ratio * 2))) * ecoMinorTraitEffect(lifeform, 'promiscuous');
            if(results.grow_gain < 0){
                results.grow_gain = 0;
            }
            results.overcrowd_gain_reduce = (2 - Math.max(1, size_ratio * 2));
        }
        results.total_loss = results.flood_loss + results.drought_loss + results.size_loss + results.starve_loss + results.carnivore_loss + results.herbivore_loss;
        results.total_gain = results.grow_gain;
        results.total_change = results.total_gain - results.total_loss;

        if(self.count > 0 && global.tech['ecosystem_genetics'] >= 2){
            let empowered_ratio = self.empowered / self.count;
            results.empowered += results.total_gain * empowered_ratio; //empowered spreads to newly created lifeforms
            results.empowered += self.empowered * 0.001; //empowered slowly spreads on its own

            if(global.aberrants[lifeform].empowered){
                if(self.empowered < 1){ //empowered trait required to get an empowered lifeform. Gets re-created if it dies.
                    results.empowered = 1 - self.empowered;
                }
            }
            results.empowered = Math.min(self.count + results.total_change - self.empowered, results.empowered); //limit empowered to current count. Can be negative to reduce
        }
    }
    if(results.total_change === NaN){
        debugger;
    }
    return results;
}

function corpse_cycle(extra){
    let total = 0;
    let info = evolve.global.surface?.overview;
    if(info){
        total += extra;
        let ratio = ((info.corpses + total) * 20) / info.area;
        if(ratio > 1){ //diminishing returns if there are more than 5% as much corpses as area, linear reduction until 0% at 10% coverage
            total *= (Math.min(0, (2 - ratio)));
        }
    }
    return total;
}

function cycle_breakdown(lifeform){
    let cycle = growth_cycle(lifeform);
    let desc = ``;
    if(cycle.corpse_create.toFixed(2) > 0){
        desc += `<div>${loc('surface_ecosystem_corpse_create', [+cycle.corpse_create.toFixed(2)])}</div>`;
    }
    if(cycle.corpse_consume.toFixed(2) > 0){
        desc += `<div>${loc('surface_ecosystem_corpse_consume', [+cycle.corpse_consume.toFixed(2)])}</div>`;
    }
    if(cycle.drought_loss.toFixed(2) > 0){
        desc += `<div>${loc('surface_ecosystem_drought_loss', [+cycle.drought_loss.toFixed(2)])}</div>`;
    }
    if(cycle.flood_loss.toFixed(2) > 0){
        desc += `<div>${loc('surface_ecosystem_flood_loss', [+cycle.flood_loss.toFixed(2)])}</div>`;
    }
    if(cycle.size_loss.toFixed(2) > 0){
        desc += `<div>${loc('surface_ecosystem_size_loss', [+cycle.size_loss.toFixed(2)])}</div>`;
    }
    if(cycle.starve_loss.toFixed(2) > 0){
        desc += `<div>${loc('surface_ecosystem_starve_loss', [+cycle.starve_loss.toFixed(2)])}</div>`;
    }
    if(cycle.herbivore_loss.toFixed(2) > 0){
        desc += `<div>${loc('surface_ecosystem_herbivore_loss', [+cycle.herbivore_loss.toFixed(2)])}</div>`;
    }
    if(cycle.carnivore_loss.toFixed(2) > 0){
        desc += `<div>${loc('surface_ecosystem_carnivore_loss', [+cycle.carnivore_loss.toFixed(2)])}</div>`;
    }
    if(cycle.grow_gain.toFixed(2) > 0){
        if(cycle.overcrowd_gain_reduce < 1){
            desc += `<div>${loc('surface_ecosystem_grow_gain_reduced', [+cycle.grow_gain.toFixed(2), +cycle.overcrowd_gain_reduce.toFixed(2)])}</div>`;
        }
        else{
            desc += `<div>${loc('surface_ecosystem_grow_gain', [+cycle.grow_gain.toFixed(2)])}</div>`;
        }
    }
    return desc;
}

export function ecoGainMajorTrait(lifeform, trait, suppress){
    if(!lifeform){
        lifeform = ['trees', 'herbivores', 'carnivores', 'scavengers'][Math.rand(0, 4)];
    }
    let curr_traits = global.aberrants[lifeform];
    let success = false;
    if(Object.keys(curr_traits).length-1 < ecosystemInfo.majorTraitCap() /*6*/){
        if(global.stats.amutations >= 10 && lifeform === 'trees'){
            if(Math.rand(0, 5) === 0){
                trait = 'hivemind';
            }
        }
        if(global.stats.amutations >= 10 && lifeform !== 'trees' && global.aberrants.trees.hasOwnProperty('hivemind')){
            if(Math.rand(0, 3) === 0){
                if(lifeform === 'herbivores'){
                    trait = 'shapeshifter';
                }
                if(lifeform === 'carnivores'){
                    trait = 'intelligent';
                }
                if(lifeform === 'scavengers'){
                    trait = 'infiltrator';
                }
            }
        }
        if(trait && !global.aberrants[lifeform].hasOwnProperty(trait)){
            global.aberrants[lifeform][trait] = 1;
            success = true;
        }
        else if(global.aberrants[lifeform].hasOwnProperty('unchanging')){ }
        else{
            while(!success){
                let selected_trait = ecosystemInfo.majorTraitList[lifeform][Math.floor(seededRandom(0, ecosystemInfo.majorTraitList[lifeform].length))];
                if(!global.aberrants[lifeform][selected_trait]){
                    global.aberrants[lifeform][selected_trait] = 1;
                    success = true;
                }
            }
        }
        arpa('Ecosystem');
        if(success){
            global.stats.amutations++;
        }
        if(!suppress && success){
            messageQueue(loc('aberrant_mutation', [loc(`surface_${lifeform}`)]),'info',false,['combat']);
        }
    }
}

export function undergroundTech(){
    return iceAgeModules.underground;
}
export function surfaceTech(){
    return iceAgeModules.surface;
}

export function fightLogModal(lifeform, parent){
    lifeform = lifeform.slice(9); //aberrant_lifeform = lifeform
    clearElement($(`#modalBox`));
    parent.addClass('vscroll');
    $('#modalBox').append(parent);
    parent.append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc(`surface_${lifeform}_single`)} ${loc('fight_log_title')}</p>`));
    let log_content = $(`<div id="fightLogContent"></div>`);
    parent.append(log_content);
    if(fight_log[lifeform][0]){
        for(let i=0;i<fight_log[lifeform][0].length; i++){
            let item = deepClone(fight_log[lifeform][0][i]);
            let log_id = item.shift();
            if(['ambush', 'enemy_attack', 'grenadier', 'unstable'].includes(log_id)){
                let elem = `<div><h3 class="has-text-warning">${loc(`fight_log_${log_id}`)}: </h3>`;
                elem += `<span>${loc('fight_log_deaths', [`<span class="has-text-danger">${item[0]}</span>`])}, </span>`;
                elem += `<span>${loc('fight_log_injuries', [`<span class="has-text-warning">${item[1]}</span>`])}</span></div>`;
                log_content.append(elem);
            }
            else if(['soldier_attack'].includes(log_id)){
                let elem = `<div><h3>${loc(`fight_log_${log_id}`)}: </h3>`;
                elem += `<span>${loc('fight_log_damage_dealt', [`<span class="has-text-success">${item[0]}</span>`])}, </span>`;
                elem += `<span>${loc('fight_log_enemy_health_left', [`<span>${item[1]}</span>`])}</span></div>`;
                log_content.append(elem);
            }
            else if(['aberrant_revive', 'cold_blooded'].includes(log_id)){
                let elem = `<div><h3 class="has-text-danger">${loc(`fight_log_${log_id}`)}: </h3>`;
                elem += `<span>${loc(`fight_log_${log_id}_result`, [item[0]])}</span></div>`;
                log_content.append(elem);
            }
            else if(['fiery'].includes(log_id)){
                let elem = `<div><h3 class="has-text-danger">${loc(`fight_log_${log_id}`)}: </h3>`;
                elem += `<span>${loc(`fight_log_${log_id}_result`, [`<span class="has-text-warning">${item[0]}</span>`])}</span></div>`;
                log_content.append(elem);
            }
            else if(['magnificent'].includes(log_id)){
                let elem = `<div><h3 class="has-text-danger">${loc(`fight_log_${log_id}`)}: </h3>`;
                elem += `<span>${loc(`fight_log_${log_id}_result`, [item[0], item[1]])}</span></div>`;
                log_content.append(elem);
            }
            else if(['end'].includes(log_id)){
                let elem = `<div><h3>${loc(`fight_log_${log_id}`)}: </h3>`;
                elem += `<span>${loc('fight_log_end_results', [...item])}</span></div>`;
                log_content.append(elem);
            }
            else{
                log_content.append(`<div>${loc(`fight_log_${log_id}`, [...item])}</div>`);
            }
        }
    }
    /*let log = zBattleLog_read();
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
        row.append(`<div class="battleHead"><span class="${tone}">${loc('battle_log_where',[regionName(b.l)])}</span> <span class="has-text-caution">${zBattleDate(b.d)}</span></div>`);
        // Rounded here as well as at write time: engagements recorded before damage was rounded
        // still hold full-precision doubles, and "dealt 154.9204903865691 hull" is unreadable.
        row.append(`<div class="battleSide"><span class="has-text-success">${loc('battle_log_yours')}</span> <span>${roster(b.p)}</span> <span class="has-text-warning">${loc('battle_log_dealt',[zBattleHull(b.pd)])}</span>${b.pl > 0 ? ` <span class="has-text-danger">${loc('battle_log_lost',[b.pl])}</span>` : ``}</div>`);
        row.append(`<div class="battleSide"><span class="has-text-danger">${loc('battle_log_theirs')}</span> <span>${roster(b.e)}</span> <span class="has-text-warning">${loc('battle_log_dealt',[zBattleHull(b.ed)])}</span>${b.el > 0 ? ` <span class="has-text-success">${loc('battle_log_destroyed',[b.el])}</span>` : ``}</div>`);
        list.append(row);
    });*/
}

export function renderUnderground(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 8)){
        return;
    }
    if (!global.settings.showUnderground){
        return;
    }
    clearElement($('#underground'));
    Object.keys(actions.underground).forEach(function (category) {
        clearElement($(`#underground-dist-${category}`),true);
        let rendered_categories = [];
        Object.keys(actions.underground[category]).forEach(function (name) {
            if(checkRequirements(actions.underground, category, name)){
                if(!rendered_categories[category]){
                    rendered_categories[category] = true;
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
                }
                setAction(actions.underground[category][name], 'underground', name);
            }
        });
    })
}

export function renderSurface(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 9)){
        return;
    }
    if (!global.settings.showSurface){
        return;
    }
    let parent = $('#surface');
    clearElement(parent);
    Object.keys(actions.surface).forEach(function (category) {
        clearElement($(`#surface-dist-${category}`),true);
        let rendered_categories = {};
        Object.keys(actions.surface[category]).forEach(function (name) {
            if(name !== 'info' && checkRequirements(actions.surface, category, name) ||
            name === 'info' && category === 'crater' && global.tech['surface'] >= 10 && !global.tech['crater']){ //show crater during exploration
                if(!rendered_categories[category]){
                    rendered_categories[category] = true;
                    let info = iceAgeModules.surface[category].info;
                    let support = info['support'];
                    let category_name = typeof info.name === 'string' ? info.name : info.name();
                    if (!global.surface[support]){ support = false; }
                    if(support){
                        if (!global.surface[support].hasOwnProperty('support')){
                            global.surface[support]['support'] = 0;
                            global.surface[support]['s_max'] = 0;
                        }
                        parent.append(`<div id="surface-dist-${category}" class="space"><div id="sr${category}"><h3 class="name has-text-warning">${category_name}</h3> <span v-show="s_max">{{ support }}/{{ s_max }}</span></div></div>`);
                        vBind({
                            el: `#sr${category}`,
                            data: global.surface[support]
                        });
                    }
                    else{
                        parent.append(`<div id="surface-dist-${category}" class="space"><div><h3 class="name has-text-warning">${category_name}</h3></div></div>`);
                    }
                    popover(`dist-${category}`, function(){
                        return typeof info.desc === 'string' ? info.desc : info.desc();
                    },
                    {
                        elm: `#surface-dist-${category} h3`,
                        classes: `has-background-light has-text-dark`
                    });
                    if (info.hasOwnProperty('extra')){
                        info.extra(category);
                    }
                }
                if(name !== 'info'){
                    setAction(actions.surface[category][name], 'surface', name);
                }
            }
        });
    })
}

function undergroundCostMultiplier(structure,offset,base,multiplier,subSector,sector='underground'){
    if (global.race.universe === 'micro'){
        multiplier -= darkEffect('micro',false);
    }
    if (global.race['small']){ multiplier -= traits.small.vars()[0]; }
    if (global.race['large']){ multiplier += traits.large.vars()[0]; }
    if (global.race['compact']){ multiplier -= traits.compact.vars()[0]; }
    if (global.race['tunneler'] && (structure === 'under_mine' || structure === 'under_coal_mine')){ multiplier -= traits.tunneler.vars()[0]; }
    if (structure === 'hollow'){
        if (global.race['solitary']){
            multiplier -= traits.solitary.vars()[0];
        }
        if (global.race['pack_mentality']){
            multiplier += traits.pack_mentality.vars()[0];
        }
    }
    if (structure === 'stone_house'){
        if (global.race['solitary']){
            multiplier += traits.solitary.vars()[1];
        }
        if (global.race['pack_mentality']){
            multiplier -= traits.pack_mentality.vars()[1];
        }
    }
    if(['under_mine', 'under_coal_mine', 'smelter', 'coal_power', 'under_factory', 'oil_pump', 'fluid_depot', 'under_oil_power'].includes(structure)){
        multiplier -= govActive('dirty_jobs',0);
    }
    if(['vault', 'under_casino'].includes(structure)){
        base = traitCostMod('untrustworthy',base);
    }
    if(subSector === 'cave' && global.underground['support_beams']){
        multiplier -= global.underground['support_beams'].count * 0.005;
        base *= 0.95 ** global.underground['support_beams'].count;
    }
    if(subSector === 'depths' && global.underground['depths_support_beams']){
        multiplier -= global.underground['depths_support_beams'].count * 0.005;
        base *= 0.95 ** global.underground['depths_support_beams'].count;
    }
    if(subSector === 'industry' && global.underground['industrial_support_beams']){
        multiplier -= global.underground['industrial_support_beams'].count * 0.005;
        base *= 0.95 ** global.underground['industrial_support_beams'].count;
    }
    if(subSector === 'core' && global.underground['core_support_beams']){
        multiplier -= global.underground['core_support_beams'].count * 0.005;
        base *= 0.95 ** global.underground['core_support_beams'].count;
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
    var count = global[sector][structure]?.count || 0;
    if (offset){
        count += offset;
    }
    return Math.round((multiplier ** count) * base);
}

function iceAgeStorage(cost, region){
    return BHStorageMulti(spatialReasoning(cost));
}