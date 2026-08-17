import { global, seededRandom, sizeApproximation, p_on } from './vars.js';
import { loc } from './locale.js';
import { buildTemplate, actions, setAction, removeAction, payCosts, BHStorageMulti, bank_vault, templeEffect, wardenLabel, powerOnNewStruct, storageMultipler } from './actions.js';
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
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        global.civic.farmer.display = true; //don't worry, the synth farmers are unrecognizably retextured
                        global.civic.farmer.assigned = 0;
                        return true;
                    }
                    return false;
                },
                powered(){ return powerCostMod(1.5); },
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
                    return ['Stone', 'Chrysotile', 'Crystal', 'Water', 'Furs', 'Copper', 'Iron', 'Aluminium', 'Cement', 'Coal', 'Steel', 'Titanium', 'Crates', 'Containers'];
                },
                res_cap(res, wiki){
                    let storage = {
                        Stone: 300,
                        Chrysotile: 300,
                        Crystal: 8,
                        Water: 20,
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
                    Money(offset){ return undergroundCostMultiplier('vault', offset, traitCostMod('untrustworthy',250), 1.50); },
                    Stone(offset){ return undergroundCostMultiplier('vault', offset, traitCostMod('untrustworthy',300), 1.55); },
                    Iron(offset){ return undergroundCostMultiplier('vault', offset, traitCostMod('untrustworthy',120), 1.55); }
                },
                effect(){
                    let vault = (spatialReasoning($(this)[0].res_cap('money')).toFixed(0)).toLocaleString();
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
                        multiplier *= 2;
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
                        global.resource.Zen.max += traits.calm.vars()[0];
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
                    let effect = `<div>${loc('underground_support_beams_effect1', [0.005])}</div><div>${loc('underground_support_beams_effect2', [10])}</div>`;
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
                    return miner_base;
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
                },
                flair(){
                    return loc('underground_mineshaft_flair');
                }
            }
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
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        return true;
                    }
                    return false;
                },
                powered(){ return powerCostMod(5); },
                power_reqs: { housing: 3 },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['stone_house','underground']
                    };
                },
                res_cap(res){
                    switch (res){
                        case 'money':
                            return iceAgeStorage(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 5000 : 2000) : 1000);
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
                        global.civic['garrison'].max += $(this)[0].soldiers();
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
                    return 5;
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
                    Money(offset){ return undergroundCostMultiplier('temple', offset, 1500, 1.60); },
                    Wrought_Iron(offset){ return undergroundCostMultiplier('temple', offset, 250, 1.55); },
                    Furs(offset){ return undergroundCostMultiplier('temple', offset, 650, 1.65); },
                    Cement(offset){ return undergroundCostMultiplier('temple', offset, 1000, 1.65); }
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
                            global.civic.priest.max += jobScale(1);
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
                    Iron(offset){ return undergroundCostMultiplier('under_foundry', offset, 1900, 1.55, 'depths'); },
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
                        //global.underground['foundry'].count = global.city['foundry'].count;
                        //global.civic.craftsman.max += jobScale(1);
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
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        global.resource.Coal.display = true;
                        global.civic.coal_miner.display = true;
                        return true;
                    }
                    return false;
                },
                powered(){ return powerCostMod(1); },
                power_reqs: { mine_conveyor: 1 },
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
                    let effect = `<div>${loc('underground_depths_support_beams_effect1', [0.005])}</div><div>${loc('underground_depths_support_beams_effect2', [10])}</div>`;
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
                reqs: { high_tech: 1 },
                cost: {
                    Money(offset){ return undergroundCostMultiplier('archaeological_dig', offset, 32000, 1.55, 'industry'); },
                    Steel(offset){ return undergroundCostMultiplier('archaeological_dig', offset, 12000, 1.65, 'industry'); },
                    Sheet_Metal(offset){ return undergroundCostMultiplier('archaeological_dig', offset, 2500, 1.55, 'industry'); },
                    Water(offset){ return undergroundCostMultiplier('archaeological_dig', offset, 25000, 1.65, 'industry'); },
                    Crystal(offset){ return global.race.universe === 'magic' ? undergroundCostMultiplier('archaeological_dig', offset, 3600, 1.65, 'industry') : 0; }
                },
                /*effect(wiki){
                    let gain = +($(this)[0].knowVal(wiki)).toFixed(0);
                    return `<div>${loc('portal_archaeology_effect',[jobScale(1)])}</div>
                        <div>${loc('city_max_knowledge',[gain.toLocaleString()])}</div>`;
                },*/
                effect(wiki){
                    let desc = `<div>${loc('portal_archaeology_effect',[jobScale(1)])}</div>${ false ? `<div>${loc('underground_archaeological_dig_effect1',[(100 / $(this)[0].fossil_chance()).toFixed(2)])}</div>` : ''}
                        <div>${loc('underground_archaeological_dig_effect2',[global.underground['archaeological_dig'].fossils, $(this)[0].knowVal()])}</div>`;
                    if(global.tech['high_tech'] >= 2){
                        desc += `<div class="has-text-caution">${loc('underground_archaeological_dig_effect3',[$(this)[0].powered(), 20])}</div>`;
                    }
                    return desc;
                    
                },
                knowVal(){
                    let knowledge = 300;
                    if(p_on['archaeological_dig']){
                        knowledge += 20 * p_on['archaeological_dig'];
                    }
                    if(p_on['under_biolab']){
                        knowledge *= 1 + (0.02 * p_on['under_biolab']);
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
                    base /= 1 + workers
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
                    Money(offset){ return costMultiplier('under_biolab', offset, 65000, 1.55, 'industry'); },
                    Knowledge(offset){ return costMultiplier('under_biolab', offset, 10000, 1.65, 'industry'); },
                    Titanium(offset){ return costMultiplier('biounder_biolablab', offset, 6500, 1.65, 'industry'); },
                    Alloy(offset){ return costMultiplier('under_biolab', offset, 5000, 1.65, 'industry'); }
                },
                effect(wiki){
                    return `<span>${loc('underground_biolab_effect',[2])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span>`;
                },
                powered(){ return powerCostMod(3); },
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
                p_fuel(){ return { r: 'Oil', a: global.race['environmentalist'] ? 0 : 3 }; },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct('under_oil_power','underground');
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
                    let effect = `<div>${loc('underground_industrial_support_beams_effect1', [0.005])}</div><div>${loc('underground_industrial_support_beams_effect2', [10])}</div>`;
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
            },
        }
    },
    surface: {

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
    if(subSector === 'cave' && global.underground['support_beams']){
        multiplier -= global.underground['support_beams'].count * 0.005;
        base *= 0.9 ** global.underground['support_beams'].count;
    }
    if(subSector === 'depths' && global.underground['depths_support_beams']){
        multiplier -= global.underground['depths_support_beams'].count * 0.005;
        base *= 0.9 ** global.underground['depths_support_beams'].count;
    }
    if(subSector === 'industry' && global.underground['industrial_support_beams']){
        multiplier -= global.underground['industrial_support_beams'].count * 0.005;
        base *= 0.9 ** global.underground['industrial_support_beams'].count;
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