import { global, seededRandom, sizeApproximation, p_on, support_on } from './vars.js';
import { loc } from './locale.js';
import { buildTemplate, actions, setAction, removeAction, payCosts, BHStorageMulti, bank_vault, templeEffect, wardenLabel, powerOnNewStruct, storageMultipler, structName, casinoEffect, initStruct, housingLabel } from './actions.js';
import { clearElement, popover, darkEffect, getShrineBonus, powerCostMod, vBind, modRes, messageQueue, powerModifier } from './functions.js';
import { addSmelter, defineIndustry, factoryData } from './industry.js';
import { govActive } from './governor.js';
import { production, highPopAdjust } from './prod.js';
import { spatialReasoning, } from './resources.js';
import { jobScale, workerScale, loadFoundry, job_data } from './jobs.js';
import { garrisonSize, armorCalc, armyRating, soldierDeath } from './civics.js';
import { races, traits, fathomCheck, traitCostMod, planetTraits, racialTrait } from './races.js';
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
                    Money(offset){
                        offset = offset || 0;
                        if ((global.underground['hollow']?.count || 0) + offset >= 2){
                            return undergroundCostMultiplier('hollow', offset, 60, 1.55, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Stone(offset){ 
                        offset = offset || 0;
                        if ((global.underground['hollow']?.count || 0) + offset >= 2){
                            return undergroundCostMultiplier('hollow', offset, 120, 1.45, 'cave');
                        }
                        else {
                            return undergroundCostMultiplier('hollow', offset, 20, 1.45, 'cave');
                        }
                    },
                    Chrysotile(offset){ return global.race['smoldering'] ? undergroundCostMultiplier('hollow', offset, 10, 1.45, 'cave') : 0; },
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
                    Money(offset){
                        offset = offset || 0;
                        if ((global.underground['ice_collector']?.count || 0) + offset >= 3){
                            return undergroundCostMultiplier('ice_collector', offset, 110, 1.50, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Stone(offset){
                        offset = offset || 0;
                        if ((global.underground['ice_collector']?.count || 0) + offset >= 3){
                            return undergroundCostMultiplier('ice_collector', offset, 180, 1.55, 'cave');
                        }
                        else {
                            return undergroundCostMultiplier('ice_collector', offset, 30, 1.55, 'cave');
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
                    Money(offset){
                        offset = offset || 0;
                        if ((global.underground['mushroom_farm']?.count || 0) + offset >= 3){
                            return undergroundCostMultiplier('mushroom_farm', offset, 150, 1.40, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Stone(offset){
                        offset = offset || 0;
                        if ((global.underground['mushroom_farm']?.count || 0) + offset >= 3){
                            return undergroundCostMultiplier('mushroom_farm', offset, 120, 1.45, 'cave');
                        }
                        else {
                            return undergroundCostMultiplier('mushroom_farm', offset, 30, 1.45, 'cave');
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
                    Money(offset){ return undergroundCostMultiplier('under_transmitter', offset, 120, 1.40, 'cave')},
                    Stone(offset){
                        if (false){
                            return 0;
                        }
                        else {
                            return undergroundCostMultiplier('under_transmitter', offset, 120, 1.45, 'cave');
                        }
                    },
                    Copper(offset){
                        if (false){
                            return undergroundCostMultiplier('under_transmitter', offset, 120, 1.45, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Steel(offset){
                        if (false){
                            return undergroundCostMultiplier('under_transmitter', offset, 80, 1.45, 'cave');
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
                    Money(offset){ return undergroundCostMultiplier('storage_space', offset, 160, 1.50, 'cave'); },
                    Stone(offset){ return undergroundCostMultiplier('storage_space', offset, 250, 1.55, 'cave'); }
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
                    Money(offset){ return undergroundCostMultiplier('vault', offset, 250, 1.50); },
                    Stone(offset){ return undergroundCostMultiplier('vault', offset, 300, 1.55); },
                    Iron(offset){ return undergroundCostMultiplier('vault', offset, 120, 1.55); }
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
                    Money(offset){ return undergroundCostMultiplier('stone_slab', offset, 400, 1.60, 'cave'); },
                    Stone(offset){ return undergroundCostMultiplier('stone_slab', offset, 450, 1.65, 'cave'); },
                    Crystal(offset){ return global.race.universe === 'magic' ? undergroundCostMultiplier('stone_slab', offset, 40, 1.65, 'cave') : 0; }
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
                    Money(offset){
                        offset = offset || 0;
                        if (global.underground['under_mine']?.count || 0 + offset >= 2){
                            return undergroundCostMultiplier('under_mine', offset, 220, 1.50, 'cave');
                        }
                        else {
                            return 0;
                        }
                    },
                    Stone(offset){
                        offset = offset || 0;
                        if (global.underground['under_mine']?.count || 0 + offset >= 2){
                            return undergroundCostMultiplier('under_mine', offset, 340, 1.55, 'cave');
                        }
                        else {
                            return undergroundCostMultiplier('under_mine', offset, 20, 1.55, 'cave');
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
                            if (global.underground.under_mine.count === 1){
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
                reqs: { bonfire: 1 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('bonfire', offset, 120000, 1.55, 'cave'); },
                    Lumber(offset){ return undergroundCostMultiplier('bonfire', offset, 3000, 1.65, 'cave'); },
                    Brick(offset){ return undergroundCostMultiplier('bonfire', offset, 12000, 1.55, 'cave'); },
                },
                effect(wiki){
                    let desc = `<div>${loc('city_max_morale', [1])}</div>`;
                    desc += `<div>${loc('citymorale', [2])}</div>`;
                    desc += `<div class="has-text-caution">${loc('spend', [$(this)[0].consumption('lumber'), global.resource.Lumber.name])}`;
                    return desc;
                },
                powered(){ return 0; },
                consume(res){
                    switch (res){
                        case 'lumber':
                            return 3;
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
                    Money(offset){ return undergroundCostMultiplier('meditation', offset, 500, 1.35, 'cave'); },
                    Stone(offset){ return undergroundCostMultiplier('meditation', offset, 250, 1.35, 'cave'); },
                    Furs(offset){ return undergroundCostMultiplier('meditation', offset, 80, 1.35, 'cave'); }
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
                    Money(offset){ return undergroundCostMultiplier('shrine', offset, 800, 1.50, 'cave'); },
                    Stone(offset){ return undergroundCostMultiplier('shrine', offset, 1200, 1.55, 'cave'); },
                    Furs(offset){ return undergroundCostMultiplier('shrine', offset, 650, 1.55, 'cave'); },
                    Copper(offset){ return undergroundCostMultiplier('shrine', offset, 550, 1.55, 'cave'); }
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
                reqs: { support_beams: 1 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('support_beams', offset, 700, (global.tech['support_beams'] < 2 ? 1.9 : 1.75)); },
                    Iron(offset){ return global.tech['support_beams'] < 2 ? undergroundCostMultiplier('support_beams', offset, 350, 2) : 0; },
                    Steel(offset){ return global.tech['support_beams'] === 2 ? undergroundCostMultiplier('support_beams', offset, 350, 1.8) : 0; },
                    Titanium(offset){ return global.tech['support_beams'] >= 3 ? undergroundCostMultiplier('depths_support_beams', offset, 350, 1.75) : 0; }
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
                    Money(offset){ return !global.underground.mineshaft.count ? 2600 : 0; },
                    Iron(offset){ return !global.underground.mineshaft.count ? 1300 : 0; },
                    Water(offset){ return !global.underground.mineshaft.count ? 2400 : 0; }
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
                reqs: { mineshaft: 3 },
                condition(){
                    return global.underground.mineshaft_elevator.count < 100;
                },
                queue_size: 10,
                queue_complete(){ return 100 - global.underground.mineshaft_elevator.count; },
                cost: {
                    Money(offset){ return ((offset || 0) + (global.underground.mineshaft_elevator?.count || 0)) < 100 ? undergroundCostMultiplier('fake', offset, 40000, 1, 'cave') : 0; },
                    Wrought_Iron(offset){ return ((offset || 0) + (global.underground.mineshaft_elevator?.count || 0)) < 100 ? undergroundCostMultiplier('fake', offset, 4000, 1, 'cave') : 0; },
                    Alloy(offset){ return ((offset || 0) + (global.underground.mineshaft_elevator?.count || 0)) < 100 ? undergroundCostMultiplier('fake', offset, 50, 1, 'cave') : 0; },
                    Coal(offset){ return ((offset || 0) + (global.underground.mineshaft_elevator?.count || 0)) < 100 ? undergroundCostMultiplier('fake', offset, 15000, 1, 'cave') : 0; },
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
                    Money(offset){ return undergroundCostMultiplier('stone_house', offset, 6800, 1.65, 'depths'); },
                    Stone(offset){ return undergroundCostMultiplier('stone_house', offset, 8800, 1.75, 'depths'); },
                    Brick(offset){ return undergroundCostMultiplier('stone_house', offset, 1600, 1.75, 'depths'); },
                    Wrought_Iron(offset){ return undergroundCostMultiplier('stone_house', offset, 1800, 1.75, 'depths'); },
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
                    Money(offset){ return undergroundCostMultiplier('hunting_lodge', offset, 3500, 1.50, 'depths'); },
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
                flair(){ return loc('underground_hunting_lodge_flair'); }
            },
            boot_camp: {
                id: 'underground-boot_camp',
                title(){ return global.race['artifical'] ? loc('city_boot_camp_art') : loc('city_boot_camp'); },
                desc(){ return global.race['artifical'] ? loc('city_boot_camp_art_desc',[races[global.race.species].name]) : loc('city_boot_camp_desc'); },
                type: 'military',
                reqs: { boot_camp: 1 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('boot_camp', offset, 160000, 1.55, 'depths'); },
                    Aluminium(offset){ return undergroundCostMultiplier('boot_camp', offset, 120000, 1.65, 'depths'); },
                    Brick(offset){ return undergroundCostMultiplier('boot_camp', offset, 6000, 1.65, 'depths'); },
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
                reqs: { theatre: 1 },
                not_trait: ['joyless'],
                cost: {
                    Money(offset){ return undergroundCostMultiplier('color_garden', offset, 5500, 1.60, 'depths'); },
                    Water(offset){ return undergroundCostMultiplier('color_garden', offset, 2400, 1.65, 'depths'); },
                    Iron(offset){ return undergroundCostMultiplier('color_garden', offset, 1600, 1.65, 'depths'); },
                },
                effect(){
                    let medic = global.tech['medic'] >= 1 ? `<div>${loc('underground_color_garden_effect2', $(this)[0].mushroom_effect())}`: '';
                    return`<div>${loc('plus_max_resource',[jobScale(1),loc(`job_gardener`)])}</div><div>${loc('city_max_morale',[2])}</div>
                        <div>${loc('underground_color_garden_effect1',[Math.floor(global.underground['color_garden'].mushrooms), $(this)[0].mushroom_effect()])}</div>${medic}`;
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        global.civic.gardener.display = true;
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
                flair(){ return loc('underground_color_garden_flair'); }
            },
            under_casino: {
                id: 'underground-under_casino',
                title(){ return structName('casino'); },
                desc(){ return structName('casino'); },
                type: 'gambling',
                reqs: { gambling: 1 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('under_casino', offset, 350000, 1.65, 'depths'); },
                    Furs(offset){ return undergroundCostMultiplier('under_casino', offset, 60000, 1.55, 'depths'); },
                    Wrought_Iron(offset){ return undergroundCostMultiplier('under_casino', offset, 10000, 1.55, 'depths'); },
                    Brick(offset){ return undergroundCostMultiplier('under_casino', offset, 6000, 1.55, 'depths'); }
                },
                effect(){
                    let desc = casinoEffect();
                    desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
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
                    Money(offset){ return undergroundCostMultiplier('trade', offset, 4500, 1.50, 'depths'); },
                    Brick(offset){ return undergroundCostMultiplier('trade', offset, 750, 1.45, 'depths'); },
                    Steel(offset){ return undergroundCostMultiplier('trade', offset, 1300, 1.55, 'depths'); },
                    Furs(offset){ return undergroundCostMultiplier('trade', offset, 1900, 1.55, 'depths'); }
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
                    Money(offset){ return undergroundCostMultiplier('statue', offset, 1500, 1.5, 'depths'); },
                    Wrought_Iron(offset){ return undergroundCostMultiplier('statue', offset, 250, 1.55, 'depths'); },
                    Furs(offset){ return undergroundCostMultiplier('statue', offset, 650, 1.65, 'depths'); },
                    Cement(offset){ return undergroundCostMultiplier('statue', offset, 1000, 1.65, 'depths'); }
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
                    Money(offset){ return undergroundCostMultiplier('under_foundry', offset, 1600, 1.50, 'depths'); },
                    Stone(offset){ return undergroundCostMultiplier('under_foundry', offset, 2200, 1.55, 'depths'); },
                    Copper(offset){ return undergroundCostMultiplier('under_foundry', offset, 1900, 1.55, 'depths'); }
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
                        if (global.underground['under_foundry'].count === 0){
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
                    Money(offset){ return undergroundCostMultiplier('under_coal_mine', offset, 3200, 1.50); },
                    Iron(offset){ return undergroundCostMultiplier('under_coal_mine', offset, 1600, 1.55); },
                    Wrought_Iron(offset){ return undergroundCostMultiplier('under_coal_mine', offset, 320, 1.45); }
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
                    Money(offset){ return undergroundCostMultiplier('smelter', offset, 4000, 1.50); },
                    Iron(offset){ return undergroundCostMultiplier('smelter', offset, 1500, 1.55); },
                    Brick(offset){ return undergroundCostMultiplier('smelter', offset, 500, 1.45); }
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
                        if (global.city.smelter.count === 1){
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
                    let calc_odds = (wins * 10 - 100).toFixed(0);
                    return `<div>${loc('underground_cave_creatures_effect', [3])}</div><div>${loc('underground_cave_creatures_effect2', [$(this)[0].group_size()])}</div>
                        <div>${loc(calc_odds >= 0 ? 'civics_garrison_advantage' : 'civics_garrison_disadvantage', [Math.abs(calc_odds)])}</div>`;
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
                            messageQueue(loc('underground_cave_creatures_combat_failure', [result.kills, result.deaths, result.injuries]), 'danger');
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
                reqs: { support_beams: 2 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('depths_support_beams', offset, 700, 1.75); },
                    Steel(offset){ return global.tech['support_beams'] === 2 ? undergroundCostMultiplier('depths_support_beams', offset, 350, 1.8) : 0; },
                    Titanium(offset){ return global.tech['support_beams'] === 3 ? undergroundCostMultiplier('depths_support_beams', offset, 350, 1.75) : 0; },
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
                    Money(offset){ return undergroundCostMultiplier('archaeological_dig', offset, 32000, 1.55, 'industry'); },
                    Furs(offset){ return undergroundCostMultiplier('archaeological_dig', offset, 25000, 1.65, 'industry'); },
                    Sheet_Metal(offset){ return undergroundCostMultiplier('archaeological_dig', offset, 2500, 1.55, 'industry'); },
                    Water(offset){ return undergroundCostMultiplier('archaeological_dig', offset, 25000, 1.65, 'industry'); },
                    Crystal(offset){ return global.race.universe === 'magic' ? undergroundCostMultiplier('archaeological_dig', offset, 3600, 1.65, 'industry') : 0; }
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
                    Money(offset){ return undergroundCostMultiplier('under_biolab', offset, 65000, 1.55, 'industry'); },
                    Knowledge(offset){ return undergroundCostMultiplier('under_biolab', offset, 10000, 1.65, 'industry'); },
                    Titanium(offset){ return undergroundCostMultiplier('under_biolab', offset, 6500, 1.65, 'industry'); },
                    Alloy(offset){ return undergroundCostMultiplier('under_biolab', offset, 5000, 1.65, 'industry'); }
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
                    Money(offset){ return undergroundCostMultiplier('coal_power', offset, 10000, 1.55, 'industry'); },
                    Crystal(offset){ return global.race.universe === 'magic' ? undergroundCostMultiplier('coal_power', offset, 125, 1.65, 'industry') : 0; },
                    Copper(offset){ return undergroundCostMultiplier('coal_power', offset, 1800, 1.65, 'industry'); },
                    Cement(offset){ return undergroundCostMultiplier('coal_power', offset, 600, 1.65, 'industry'); },
                    Steel(offset){ return undergroundCostMultiplier('coal_power', offset, 2000, 1.65, 'industry'); }
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
                    Money(offset){ return undergroundCostMultiplier('water_pump', offset, 46000, 1.55, 'industry'); },
                    Titanium(offset){ return undergroundCostMultiplier('water_pump', offset, 1200, 1.65, 'industry'); },
                    Copper(offset){ return undergroundCostMultiplier('water_pump', offset, 32000, 1.65, 'industry'); },
                    Sheet_Metal(offset){ return undergroundCostMultiplier('water_pump', offset, 4000, 1.55, 'industry'); }
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
                    Money(offset){ return undergroundCostMultiplier('under_factory', offset, 55000, 1.55, 'industry'); },
                    Cement(offset){ return undergroundCostMultiplier('under_factory', offset, 45000, 1.65, 'industry'); },
                    Steel(offset){ return undergroundCostMultiplier('under_factory', offset, 32000, 1.65, 'industry'); },
                    Titanium(offset){ return undergroundCostMultiplier('under_factory', offset, 8000, 1.65, 'industry'); }
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
                        if (global.underground.under_factory.count === 1){
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
                    Money(offset){ return undergroundCostMultiplier('oil_pump', offset, 35000, 1.55, 'industry'); },
                    Wrought_Iron(offset){ return undergroundCostMultiplier('oil_pump', offset, 2700, 1.55, 'industry'); },
                    Cement(offset){ return undergroundCostMultiplier('oil_pump', offset, 26000, 1.65, 'industry'); },
                    Steel(offset){ return undergroundCostMultiplier('oil_pump', offset, 21000, 1.65, 'industry'); }
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
                    return production('oil_well') * 2;
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
                    Money(offset){ return undergroundCostMultiplier('under_oil_power', offset, 50000, 1.55, 'industry'); },
                    Copper(offset){ return undergroundCostMultiplier('under_oil_power', offset, 6500, 1.65, 'industry'); },
                    Aluminium(offset){ return undergroundCostMultiplier('under_oil_power', offset, 12000, 1.65, 'industry'); },
                    Steel(offset){ return undergroundCostMultiplier('under_oil_power', offset, 5600, 1.65, 'industry'); }
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
                    Money(offset){ return undergroundCostMultiplier('fluid_depot', offset, 34000, 1.55, 'industry'); },
                    Alloy(offset){ return undergroundCostMultiplier('fluid_depot', offset, 2400, 1.65, 'industry'); },
                    Cement(offset){ return undergroundCostMultiplier('fluid_depot', offset, 30000, 1.65, 'industry'); },
                    Sheet_Metal(offset){ return undergroundCostMultiplier('fluid_depot', offset, 4500, 1.65, 'industry'); }
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
                reqs: { support_beams: 2 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('industrial_support_beams', offset, 700, 1.75); },
                    Steel(offset){ return global.tech['support_beams'] === 2 ? undergroundCostMultiplier('industrial_support_beams', offset, 350, 1.8) : 0; },
                    Titanium(offset){ return global.tech['support_beams'] === 3 ? undergroundCostMultiplier('industrial_support_beams', offset, 350, 1.75) : 0; },
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
                    Money(offset){ return undergroundCostMultiplier('core_mine', offset, 52000, 1.55, 'core'); },
                    Alloy(offset){ return undergroundCostMultiplier('core_mine', offset, 8000, 1.65, 'core'); },
                    Titanium(offset){ return undergroundCostMultiplier('core_mine', offset, 12000, 1.65, 'core'); },
                    Aluminium(offset){ return undergroundCostMultiplier('core_mine', offset, 43000, 1.65, 'core'); }
                },
                effect(){
                    let desc = `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_core_miner`)])}</div>`;
                    desc += `<div class="has-text-caution">${loc('minus_power', [$(this)[0].powered()])}, 
                    ${loc('spend', [$(this)[0].consume('water'), global.resource.Water.name])}, 
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
                powered(){ return powerCostMod(5); },
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
                    Money(offset){ return undergroundCostMultiplier('core_tap', offset, 120000, 1.55, 'core'); },
                    Iron(offset){ return undergroundCostMultiplier('core_tap', offset, 135000, 1.65, 'core'); },
                    Copper(offset){ return undergroundCostMultiplier('core_tap', offset, 120000, 1.65, 'core'); },
                    Iridium(offset){ return undergroundCostMultiplier('core_tap', offset, 1500, 1.65, 'core'); },
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
                    return (powerModifier(-25) * effect).toFixed(2);
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
                    Money(offset){ return undergroundCostMultiplier('core_forge', offset, 250000, 1.55, 'core'); },
                    Coal(offset){ return undergroundCostMultiplier('core_forge', offset, 220000, 1.65, 'core'); },
                    Wrought_Iron(offset){ return undergroundCostMultiplier('core_forge', offset, 5000, 1.55, 'core'); },
                    Iridium(offset){ return undergroundCostMultiplier('core_forge', offset, 4000, 1.65, 'core'); },
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
                    Money(offset){ return undergroundCostMultiplier('core_blacksmith', offset, 410000, 1.55, 'core'); },
                    Steel(offset){ return undergroundCostMultiplier('core_blacksmith', offset, 280000, 1.65, 'core'); },
                    Sheet_Metal(offset){ return undergroundCostMultiplier('core_blacksmith', offset, 8000, 1.55, 'core'); },
                    Iridium(offset){ return undergroundCostMultiplier('core_blacksmith', offset, 4800, 1.65, 'core'); },
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
                reqs: { support_beams: 3, mineshaft_depth: 3 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('core_support_beams', offset, 700, 1.75); },
                    Titanium(offset){ return undergroundCostMultiplier('core_support_beams', offset, 350, 1.75); },
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
                name: loc('surface_wastes'),
                desc: loc('surface_wastes_desc'),
                support: 'great_heater'
            },
            great_heater: {
                id: 'surface-great_heater',
                title(){ return loc('surface_great_heater'); },
                desc(){ return `<div>${loc('surface_great_heater_desc')}</div>`; },
                type: 'outpost',
                reqs: { surface: 2 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('great_heater', offset, 22000, 1.45, 'wastes', 'surface'); },
                    Cement(offset){ return undergroundCostMultiplier('great_heater', offset, 18000, 1.55, 'wastes', 'surface'); },
                    Copper(offset){ return undergroundCostMultiplier('great_heater', offset, 7800, 1.55, 'wastes', 'surface'); },
                    Polymer(offset){ return undergroundCostMultiplier('great_heater', offset, 12500, 1.55, 'wastes', 'surface'); }
                },
                effect(wiki){
                    let desc = `<div>${loc('galaxy_foothold_effect', [$(this)[0].support(), loc('surface_wastes')])}</div>`;
                    desc += `<div class="has-text-caution">${loc('minus_power', [$(this)[0].powered()])}</div>`;
                    return desc;
                },
                support(){ return 2; },
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
                        if (global.surface['great_heater'].count === 1){
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
                    Money(offset){ return undergroundCostMultiplier('watch_tower', offset, 3500, 1.45, 'wastes', 'surface'); },
                    Plywood(offset){ return undergroundCostMultiplier('watch_tower', offset, 2950, 1.55, 'wastes', 'surface'); },
                    Mythril(offset){ return undergroundCostMultiplier('watch_tower', offset, 2950, 1.45, 'wastes', 'surface'); },
                    Furs(offset){ return undergroundCostMultiplier('watch_tower', offset, 2950, 1.55, 'wastes', 'surface'); },
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
                        d: { count: 0, on: 0 },
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
                    Money(offset){ return undergroundCostMultiplier('woodcutter', offset, 200000, 1.45, 'wastes', 'surface'); },
                    Brick(offset){ return undergroundCostMultiplier('woodcutter', offset, 28000, 1.45, 'wastes', 'surface'); },
                    Iron(offset){ return undergroundCostMultiplier('woodcutter', offset, 11000, 1.55, 'wastes', 'surface'); },
                },
                effect(){
                    let desc = `<div class="has-text-caution">${loc('space_used_support', [loc('surface_wastes')])}</div>`;
                    desc += `<div>${loc('production',[4,global.resource.Lumber.name])}</div>`;
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
                }
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
                    Money(offset){ return undergroundCostMultiplier('surface_apartment', offset, 150000, 1.45); },
                    Furs(offset){ return undergroundCostMultiplier('surface_apartment', offset, 68000, 1.55); },
                    Lumber(offset){ return undergroundCostMultiplier('surface_apartment', offset, 1200, 1.55); },
                    Cement(offset){ return undergroundCostMultiplier('surface_apartment', offset, 75000, 1.55); },
                    Steel(offset){ return undergroundCostMultiplier('surface_apartment', offset, 44000, 1.55); },
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
                    Money(offset){ return undergroundCostMultiplier('genetics_lab', offset, 65000, 1.45, 'wastes', 'surface'); },
                    Plywood(offset){ return undergroundCostMultiplier('genetics_lab', offset, 14000, 1.45, 'wastes', 'surface'); },
                    Aluminium(offset){ return undergroundCostMultiplier('genetics_lab', offset, 6500, 1.55, 'wastes', 'surface'); },
                    Alloy(offset){ return undergroundCostMultiplier('genetics_lab', offset, 5000, 1.55, 'wastes', 'surface'); }
                },
                effect(wiki){
                    let desc = `<span class="has-text-caution">${loc('space_used_support', [loc('surface_wastes')])}</span>`;
                    desc += `<div>${loc('surface_genetics_lab_effect1', [75])}</div>`;
                    desc += `<div>${loc('surface_genetics_lab_effect2')}</div>`;
                    //desc += `<div>${loc('surface_genetics_lab_effect3', [(100 / $(this)[0].creation_cooldown_mult() - 100).toFixed(0)])}</div>`;
                    return desc;
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
                    
                    let tree_cycle = actions.surface.ecosystem.trees.growth_cycle();
                    if(tree_cycle.total_change >= 0){
                        desc += `<div>${loc('surface_overview_trees', [Math.floor(info.trees), `+${tree_cycle.total_change.toFixed(2)}`])}</div>`;
                    }
                    else{
                        desc += `<div>${loc('surface_overview_trees', [Math.floor(info.trees), tree_cycle.total_change.toFixed(2)])}</div>`;
                    }
                    if(info.herbivores){
                        let herbivore_cycle = actions.surface.ecosystem.herbivores.growth_cycle();
                        if(herbivore_cycle.total_change >= 0){
                            desc += `<div>${loc('surface_overview_herbivores', [Math.floor(info.herbivores), `+${herbivore_cycle.total_change.toFixed(2)}`])}</div>`;
                        }
                        else{
                            desc += `<div>${loc('surface_overview_herbivores', [Math.floor(info.herbivores), herbivore_cycle.total_change.toFixed(2)])}</div>`;
                        }
                    }
                    
                    let water_ratio = (info.water - $(this)[0].total_water_use()) / info.area;
                    if(water_ratio < 0.1){
                        desc += `<div class="has-text-danger">${loc('surface_overview_warn_drought')}</div>`;
                    }
                    else if(water_ratio > 0.5){
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
                    let total = global.surface.overview.trees * ecosystemInfo.trees.water_use;
                    total += global.surface.overview.herbivores * ecosystemInfo.herbivores.water_use;
                    return total;
                },
                set_cooldown(time){
                    global.surface.overview.cooldown = Math.floor(time);
                    return global.surface.overview.cooldown;
                },
                struct(){
                    return {
                        d: { area: 0, water: 0, trees:0, herbivores: 0, carnivores: 0, scavengers: 0, cooldown: 0, tree_ratio:0 },
                        p: ['overview','surface']
                    };
                }
            },
            area_heater: {
                id: 'surface-area_heater',
                title(){ return loc('surface_area_heater'); },
                desc(){ return `<div>${loc('surface_area_heater_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
                type: 'ecosystem',
                reqs: { surface: 4 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('area_heater', offset, 22000, 1.45, 'ecosystem', 'surface'); },
                    Cement(offset){ return undergroundCostMultiplier('area_heater', offset, 18000, 1.55, 'ecosystem', 'surface'); },
                    Copper(offset){ return undergroundCostMultiplier('area_heater', offset, 7800, 1.55, 'ecosystem', 'surface'); },
                    Polymer(offset){ return undergroundCostMultiplier('area_heater', offset, 12500, 1.55, 'ecosystem', 'surface'); }
                },
                effect(wiki){
                    let desc = `<div class="has-text-caution">${loc('minus_power', [$(this)[0].powered()])}</div>`;
                    desc += `<div>${loc('surface_area_heater_effect', [$(this)[0].support()])}</div>`;
                    return desc;
                },
                powered(){ return powerCostMod(25); },
                support(){ return 30; },
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
                reqs: { surface: 4 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('water_pipe', offset, 46000, 1.55, 'ecosystem', 'surface'); },
                    Titanium(offset){ return undergroundCostMultiplier('water_pipe', offset, 1200, 1.65, 'ecosystem', 'surface'); },
                    Copper(offset){ return undergroundCostMultiplier('water_pipe', offset, 32000, 1.65, 'ecosystem', 'surface'); },
                    Sheet_Metal(offset){ return undergroundCostMultiplier('water_pipe', offset, 4000, 1.55, 'ecosystem', 'surface'); }
                },
                effect(wiki){
                    let desc = `<span class="has-text-caution">${loc('spend',[$(this)[0].consume('water'), global.resource.Water.name])}, ${loc('minus_power',[$(this)[0].powered()])}</span>`;
                    desc += `<div>${loc('surface_water_pipe_effect', [$(this)[0].support()])}</div>`;
                    return desc;
                },
                powered(){ return powerCostMod(10); },
                support(){ return 10; },
                consume(res){
                    switch (res){
                        case 'water':
                            return 200;
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
                reqs: { surface: 4 },
                wiki: false,
                queue_complete(){ return false; },
                count(){ return Math.floor(global.surface.overview.trees); },
                show_count: true,
                effect(){
                    let desc = `<div>${loc('surface_trees_effect1')}</div>`;
                    let growth_cycle = $(this)[0].growth_cycle();
                    if(growth_cycle.drought_loss > 0){
                        desc += `<div>${loc('surface_ecosystem_drought_loss', [growth_cycle.drought_loss.toFixed(2)])}</div>`;
                    }
                    if(growth_cycle.flood_loss > 0){
                        desc += `<div>${loc('surface_ecosystem_flood_loss', [growth_cycle.flood_loss.toFixed(2)])}</div>`;
                    }
                    if(growth_cycle.size_loss > 0){
                        desc += `<div>${loc('surface_ecosystem_size_loss', [growth_cycle.size_loss.toFixed(2)])}</div>`;
                    }
                    if(growth_cycle.starve_loss > 0){
                        desc += `<div>${loc('surface_ecosystem_starve_loss', [growth_cycle.starve_loss.toFixed(2)])}</div>`;
                    }
                    if(growth_cycle.grow_gain > 0){
                        desc += `<div>${loc('surface_ecosystem_grow_gain', [growth_cycle.grow_gain.toFixed(2)])}</div>`;
                    }
                    desc += `<div>${loc('surface_overview_cooldown', [$(this)[0].cooldown()])}</div>`;
                    desc += `<div class="has-text-caution">${loc('surface_overview_cooldown_left', [Math.ceil(global.surface.overview.cooldown * actions.surface.wastes.genetics_lab.creation_cooldown_mult())])}</div>`;
                    return desc;
                },
                growth_cycle(){
                    let info = global.surface.overview;
                    let water = info.water - actions.surface.ecosystem.overview.total_water_use();
                    let water_ratio = water / info.area;
                    if(water_ratio < 0){
                        water_ratio = 0;
                    }
                    let size_ratio = info.trees * ecosystemInfo.trees.size / info.area; //1 = 100% coverage, 0 = 0% coverage
                    let results = {
                        drought_loss: 0,
                        flood_loss: 0,
                        size_loss: 0,
                        starve_loss: 0,
                        total_loss: 0,
                        grow_gain: 0,
                        total_gain: 0,
                        total_change: 0
                    };
                    if(water_ratio <= ecosystemInfo.trees.water_min){ //0% loss at 0.1 water -> 5% loss at 0 water
                        results.drought_loss = global.surface.overview.trees * (0.05 * (Math.abs(water_ratio - 0.1) / ecosystemInfo.trees.water_min));
                    }
                    if(water_ratio > ecosystemInfo.trees.water_max){ //2% loss per 0.1 above 0.5 up to 10% loss at 1 water
                        results.flood_loss = global.surface.overview.trees * (0.02 * ((water_ratio-ecosystemInfo.trees.water_max) * 10));
                    }
                    if(size_ratio > 1){ //5% loss per ratio over 1 (compounding). ex: 100 size worth of trees with 50 area = 2 ratio = 5% loss
                        results.size_loss = global.surface.overview.trees * 1 - (0.95 ** (size_ratio - 1));
                    }
                    if(water_ratio > 0){ //requires at least some water to grow. Having life consume water to 0 in a cycle counts as no water.
                        if (size_ratio >= 0.5){
                            results.grow_gain = global.surface.overview.trees * ((ecosystemInfo.trees.growth_rate - 1) * (2 - size_ratio * 2)); //linear reduction from 0.5 to 1 from 100% growth to 0%
                        }
                        else{
                            results.grow_gain = global.surface.overview.trees * (ecosystemInfo.trees.growth_rate - 1);
                        }
                    }
                    results.total_loss = results.flood_loss + results.drought_loss + results.starve_loss;
                    results.total_gain = results.grow_gain;
                    results.total_change = results.total_gain - results.total_loss;
                    return results;
                },
                hardiness(){
                    //how long it takes a lumberjack to cut a tree down. Higher value is better
                    let hardiness = 1;
                    hardiness *= actions.surface.ecosystem.herbivores.tree_effect();
                    return hardiness;
                },
                cooldown(){
                    return 10;
                },
                action(args){
                    if(global.surface.overview.cooldown === 0){
                        global.surface.overview.trees++;
                        actions.surface.ecosystem.overview.set_cooldown($(this)[0].cooldown());
                        drawEcology('trees');
                    }
                    return false;
                }
            },
            herbivores: {
                id: 'surface-herbivores',
                title(){ return loc('surface_herbivores'); },
                desc(){ return loc('surface_herbivores_desc'); },
                count(){ return Math.floor(global.surface.overview.herbivores); },
                show_count: true,
                effect(){
                    let desc = `<div>${loc('surface_herbivores_effect1', [(($(this)[0].tree_effect() - 1) * 100).toFixed(0)])}</div>`;
                    let growth_cycle = $(this)[0].growth_cycle();
                    if(growth_cycle.drought_loss > 0){
                        desc += `<div>${loc('surface_ecosystem_drought_loss', [growth_cycle.drought_loss.toFixed(2)])}</div>`;
                    }
                    if(growth_cycle.flood_loss > 0){
                        desc += `<div>${loc('surface_ecosystem_flood_loss', [growth_cycle.flood_loss.toFixed(2)])}</div>`;
                    }
                    if(growth_cycle.size_loss > 0){
                        desc += `<div>${loc('surface_ecosystem_size_loss', [growth_cycle.size_loss.toFixed(2)])}</div>`;
                    }
                    if(growth_cycle.starve_loss > 0){
                        desc += `<div>${loc('surface_ecosystem_starve_loss', [growth_cycle.starve_loss.toFixed(2)])}</div>`;
                    }
                    if(growth_cycle.grow_gain > 0){
                        desc += `<div>${loc('surface_ecosystem_grow_gain', [growth_cycle.grow_gain.toFixed(2)])}</div>`;
                    }
                    if(support_on['genetics_lab'] > 0){
                        let cooldown = Math.floor($(this)[0].cooldown() * actions.surface.wastes.genetics_lab.creation_cooldown_mult());
                        desc += `<div>${loc('surface_overview_cooldown', [cooldown])}</div>`;
                        desc += `<div class="has-text-caution">${loc('surface_overview_cooldown_left', [Math.ceil(global.surface.overview.cooldown * actions.surface.wastes.genetics_lab.creation_cooldown_mult())])}</div>`;
                    }
                    else{
                        desc += `<div class="has-text-caution">${loc('surface_genetics_lab_required')}</div>`;
                    }
                    return desc;
                },
                growth_cycle(){
                    let info = global.surface.overview;
                    let water = info.water - actions.surface.ecosystem.overview.total_water_use();
                    let water_ratio = water / info.area;
                    if(water_ratio < 0){
                        water_ratio = 0;
                    }
                    let size_ratio = info.herbivores * ecosystemInfo.herbivores.size / info.area;
                    let eat = ecosystemInfo.herbivores.trees_use * info.herbivores;
                    let results = {
                        drought_loss: 0,
                        flood_loss: 0,
                        starve_loss: 0,
                        size_loss: 0,
                        total_loss: 0,
                        grow_gain: 0,
                        total_gain: 0,
                        total_change: 0
                    };
                    if(water_ratio <= ecosystemInfo.herbivores.water_min){ //0% loss at 0.1 water -> 5% loss at 0 water
                        results.drought_loss = global.surface.overview.herbivores * (0.05 * (Math.abs(water_ratio - 0.1) / ecosystemInfo.herbivores.water_min));
                    }
                    if(water_ratio > ecosystemInfo.herbivores.water_max){ //2% loss per 0.1 above 0.5 up to 10% loss at 1 water
                        results.flood_loss = global.surface.overview.herbivores * (0.02 * ((water_ratio-ecosystemInfo.herbivores.water_max) * 10));
                    }
                    if(eat > info.trees){ // up to 5% loss depending on lack of trees
                        results.starve_loss = global.surface.overview.herbivores * 0.05 * (1 - (info.trees / eat));
                    }
                    if(size_ratio > 1){ //5% loss per ratio over 1 (compounding). ex: 100 size worth of trees with 50 area = 2 ratio = 5% loss
                        results.size_loss = global.surface.overview.herbivores * 1 - (0.95 ** (size_ratio - 1));
                    }
                    if(water_ratio > 0 && info.herbivores >= 2 && info.trees >= eat){ //grows if there's water, enough food and there are at least 2 already
                        if (size_ratio >= 0.5){
                            results.grow_gain = global.surface.overview.herbivores * ((ecosystemInfo.herbivores.growth_rate - 1) * (2 - size_ratio * 2)); //linear reduction from 0.5 to 1 from 100% growth to 0%
                        }
                        else{
                            results.grow_gain = global.surface.overview.herbivores * (ecosystemInfo.herbivores.growth_rate - 1);
                        }
                    }
                    results.total_loss = results.flood_loss + results.drought_loss + results.size_loss + results.starve_loss;
                    results.total_gain = results.grow_gain;
                    results.total_change = results.total_gain - results.total_loss;
                    return results;
                },
                tree_effect(){
                    return 1 + (0.01 * (global.surface.overview.herbivores ** 1.05));
                },
                cooldown(){
                    return 100;
                },
                reqs: { surface: 5 },
                wiki: false,
                queue_complete(){ return false; },
                action(args){
                    if(global.surface.overview.cooldown === 0){
                        global.surface.overview.herbivores++;
                        actions.surface.ecosystem.overview.set_cooldown($(this)[0].cooldown());
                        drawEcology('herbivores');
                    }
                    return false;
                }
            },
            carnivores: {
                id: 'surface-carnivores',
                title(){ return loc('surface_carnivores'); },
                desc(){ return loc('surface_carnivores'); },
                count(){ return Math.floor(global.surface.overview.carnivores); },
                show_count: true,
                reqs: { surface: 6 },
                wiki: false,
                queue_complete(){ return false; },
                effect(){ return loc(`surface_carnivores`); },
                action(args){
                    return false;
                }
            },
            scavengers: {
                id: 'surface-scavengers',
                title(){ return loc('surface_scavengers'); },
                desc(){ return loc('surface_scavengers'); },
                count(){ return Math.floor(global.surface.overview.scavengers); },
                show_count: true,
                reqs: { surface: 7 },
                wiki: false,
                queue_complete(){ return false; },
                effect(){ return loc(`surface_scavengers`); },
                action(args){
                    return false;
                }
            }
        },
        crater: {

        }
    }
}

function drawEcology(id){
    if(global.surface.overview){
        if(id){
            $(`#surface-${id} .button .count`).html(actions.surface.ecosystem[id].count());
        }
        else{
            $(`#surface-trees .button .count`).html(actions.surface.ecosystem.trees.count());
            $(`#surface-herbivores .button .count`).html(actions.surface.ecosystem.herbivores.count());
            $(`#surface-carnivores .button .count`).html(actions.surface.ecosystem.carnivores.count());
            $(`#surface-scavengers .button .count`).html(actions.surface.ecosystem.scavengers.count());
        }
    }
}

function cave_fight(real=false, seed=global['warseed']){
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
    injuries += Math.min(deaths, armor);
    deaths -= Math.min(deaths, armor);
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

export const ecosystemInfo = {
    trees: {
        water_min: 0.1, //minimum tolerate water ratio. Ratio is water / area
        water_max: 0.5, //maximum tolerable water ratio
        water_use: 0.2, //amount of flat water used per tree per in-game day. Consumption of all lifeforms as accounted for first before determining tolerable water ratios
        decay_rate: 0.99, //multiplier to existing trees per in-game day if water conditions are not met
        growth_rate: 1.01, //multiplier to amount of trees each day as long as water conditions are met
        size: 2 //growth rate slows down once size reaches past 50% of total area, stops completely once it hits 100% and decays once it hits >100%
    },
    herbivores: {
        water_min: 0.08,
        water_max: 0.4,
        water_use: 0.08,
        trees_use: 0.015,
        decay_rate: 0.98,
        growth_rate: 1.004,
        size: 5
    }
}

export function surfaceEcosystemVisual(){ //run every fastLoop (0.25 seconds)
    global.surface.overview.area = (p_on['area_heater'] || 0) * actions.surface.ecosystem.area_heater.support();
    global.surface.overview.water = (p_on['water_pipe'] || 0) * actions.surface.ecosystem.water_pipe.support();
}

export function surfaceEcosystem(){ //run every longLoop (5 seconds)
    //{ area: 0, water: 0, trees:0, hebivores: 0, carnivores: 0, scavengers: 0, cooldown: 0 },
    let info = global.surface.overview;
    let tree_cycle = actions.surface.ecosystem.trees.growth_cycle();
    let herbivore_cycle = actions.surface.ecosystem.herbivores.growth_cycle();
    global.surface.overview.trees += tree_cycle.total_change;
    global.surface.overview.herbivores += herbivore_cycle.total_change;
    global.surface.overview.cooldown--;
    if(global.surface.overview.cooldown < 0){
        global.surface.overview.cooldown = 0;
    }
    drawEcology();
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
        let rendered_categories = [];
        Object.keys(actions.surface[category]).forEach(function (name) {
            if(name !== 'info' && checkRequirements(actions.surface, category, name)){
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
                        return loc(`surface_${category}_desc`);
                    },
                    {
                        elm: `#surface-dist-${category} h3`,
                        classes: `has-background-light has-text-dark`
                    });
                }
                setAction(actions.surface[category][name], 'surface', name);
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
    //this tech is currently unused
    /*if (global.tech['housing_reduction'] && (structure === 'hollow' || structure === 'stone_house')){
        multiplier -= global.tech['housing_reduction'] * 0.02;
    }
    if (global.tech['housing_reduction'] && structure === 'captive_housing'){
        multiplier -= global.tech['housing_reduction'] * 0.01;
    }*/
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
    //var count = structure === 'citizen' ? highPopAdjust(global['resource'][global.race.species].amount) : (global[sector][structure] ? global[sector][structure].count : 0);
    var count = global[sector][structure]?.count || 0;
    if (offset){
        count += offset;
    }
    return Math.round((multiplier ** count) * base);
}

function iceAgeStorage(cost, region){
    return BHStorageMulti(spatialReasoning(cost));
}