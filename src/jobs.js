import { global, keyMultiplier, p_on, support_on, tmp_vars } from './vars.js';
import { vBind, clearElement, popover, darkEffect, eventActive, easterEgg, getHalloween } from './functions.js';
import { loc } from './locale.js';
import { highPopAdjust } from './prod.js';
import { racialTrait, servantTrait, races, traits, biomes, planetTraits, fathomCheck } from './races.js';
import { armyRating, govEffect } from './civics.js';
import { govActive } from './governor.js';
import { craftingRatio, craftCost, craftingPopover } from './resources.js';
import { planetName } from './space.js';
import { hellSupression } from './portal.js';
import { asphodelResist } from './edenic.js';
import { actions, getStructNumActive, templeCount } from './actions.js';

export const job_data = {
    unemployed: {
        name(){ return loc('job_unemployed'); },
        desc(servant){
            let desc = loc('job_unemployed_desc');
            if (global.civic.d_job === 'unemployed' && !servant){
                desc = desc + ' ' + loc('job_default',[loc('job_unemployed')]);
            }
            return desc;
        },
        stress(){ return 0; },
        color(){ return 'warning'; }
    },
    hunter: {
        name(){ return global.race['unfathomable'] ? loc('job_raider') : loc('job_hunter'); },
        desc(servant){
            let desc = loc('job_hunter_desc',[global.resource.Food.name]);
            if (global.race['unfathomable']){
                desc = loc('job_eld_hunter_desc');
            }
            if (global.race['artifical']){
                desc = global.race['soul_eater'] ? loc('job_art_demon_hunter_desc',[global.resource.Furs.name, global.resource.Lumber.name]) : loc('job_art_hunter_desc',[global.resource.Furs.name]);
            }
            else if (global.race['soul_eater'] && global.race.species !== 'wendigo'){
                desc = loc(global.race['evil'] ? 'job_evil_hunter_desc' : 'job_not_evil_hunter_desc',[global.resource.Food.name,global.resource.Lumber.name,global.resource.Furs.name]);
            }
            if (global.civic.d_job === 'hunter' && !servant){
                desc = desc + ' ' + loc('job_default',[job_data.hunter.name()]);
            }
            return desc;
        },
        stress(){ return 0; },
        color(){ return false; }
    },
    forager: {
        name(){ return loc('job_forager'); },
        desc(servant){
            let desc = loc(`job_forager_desc`);
            if (global.civic.d_job === 'forager' && !servant){
                desc = desc + ' ' + loc('job_default',[job_data.forager.name()]);
            }
            return desc;
        },
        stress(){ return 0; },
        color(){ return false; }
    },
    farmer: {
        name(){
            if(global.race['iceage']){
                if(!global.race['artifical']){
                    return loc('job_mushroom_farmer');
                }
                else{
                    return loc('job_runner');
                }
            }
            return loc('job_farmer');
        },
        desc(servant){
            let farmer = +farmerValue(true,servant).toFixed(2);
            let farmhand = +farmerValue(false,servant).toFixed(2);
            if (!servant){
                farmer = +workerScale(farmer,'farmer').toFixed(2);
                farmhand = +workerScale(farmhand,'farmer').toFixed(2);
            }
            let desc = loc('job_farmer_desc',[farmer,global.resource.Food.name,global.city.farm?.count,farmhand]);
            if(global.race['iceage']){
                if(global.race['high_pop'] && !servant){
                    if(!global.race['artifical']){
                        desc = loc('job_mushroom_farmer_desc_hp', [farmer,global.resource.Food.name,global.underground.mushroom_farm.count,farmhand,actions.underground.mushroom_farm.mushroom_type(), jobScale(1) * global.underground.mushroom_farm.count, highPopAdjust(1), jobScale(1)]);
                    }
                    else{
                        desc = loc('job_runner_desc_hp', [farmer,global.resource.Food.name,jobScale(1) * (global.underground.under_transmitter?.count || 0),farmhand, highPopAdjust(1), jobScale(1)]);
                    }
                }
                else{
                    if(!global.race['artifical']){
                        desc = loc('job_mushroom_farmer_desc', [farmer,global.resource.Food.name,global.underground.mushroom_farm.count,farmhand,actions.underground.mushroom_farm.mushroom_type(), loc('underground_mushroom_farm', [actions.underground.cave.mushroom_farm.mushroom_type()]), 1]);
                    }
                    else{
                        desc = loc('job_runner_desc', [farmer,global.resource.Food.name,(global.underground.under_transmitter?.count || 0),farmhand, 1]);
                }
                }
            }
            else if(global.race['high_pop'] && !servant){
                desc = loc('job_farmer_desc_hp',[farmer,global.resource.Food.name,jobScale(1),farmhand,jobScale(1) * global.city.farm.count]);
            }
            if (global.civic.d_job === 'farmer' && !servant){
                desc = desc + ' ' + loc('job_default',[job_data.farmer.name()]);
            }
            return desc;
        },
        impact(){ return 0.82; },
        stress(){ return 5; },
        color(){ return false; }
    },
    lumberjack: {
        name(){ return global.race['evil'] && (!global.race['soul_eater'] || global.race.species === 'wendigo') ? loc('job_reclaimer') : loc('job_lumberjack'); },
        desc(servant){
            let workers = servant && global.race['servants'] ? global.race.servants.jobs.lumberjack : global.civic.lumberjack.workers;
            let impact = job_data.lumberjack.impact();
            if (!servant){
                workers = +workerScale(workers,'lumberjack').toFixed(2);
                impact = +workerScale(impact,'lumberjack').toFixed(2);
            }
            if (global.race['evil'] && !global.race['iceage'] && (!global.race['soul_eater'] || global.race.species === 'wendigo')){
                let multiplier = 1;
                if (!servant){
                    multiplier *= racialTrait(workers,'lumberjack');
                }
                let bone = +(impact * multiplier).toFixed(2);
                let flesh = +(impact / 4 * multiplier).toFixed(2);
                let desc = global.race.species === 'wendigo' ? loc('job_reclaimer_desc2',[bone]) : loc('job_reclaimer_desc',[bone,flesh]);
                if (global.civic.d_job === 'lumberjack' && !servant){
                    desc = desc + ' ' + loc('job_default',[loc('job_reclaimer')]);
                }
                return desc;
            }
            else {
                let multiplier = (global.tech['axe'] && global.tech['axe'] > 0 ? (global.tech['axe'] - 1) * 0.35 : 0) + 1;
                if (!servant){
                    multiplier *= racialTrait(workers,'lumberjack');
                }
                if (global.city.biome === 'forest'){
                    impact *= biomes.forest.vars()[0];
                }
                if (global.city.biome === 'savanna'){
                    impact *= biomes.savanna.vars()[2];
                }
                if (global.city.biome === 'desert'){
                    impact *= biomes.desert.vars()[2];
                }
                if (global.city.biome === 'swamp'){
                    impact *= biomes.swamp.vars()[2];
                }
                if (global.city.biome === 'taiga'){
                    impact *= biomes.taiga.vars()[0];
                }
                let gain = +(impact * multiplier).toFixed(2);
                let desc = loc('job_lumberjack_desc',[gain,global.resource.Lumber.name]);
                if(global.race['iceage']){
                    let hardiness = actions.surface.ecosystem.trees.hardiness();
                    if(hardiness === 1){
                        desc = loc('job_lumberjack_desc_iceage',[gain,global.resource.Lumber.name, (1 / hardiness).toFixed(2)]);
                    }
                    else{
                        desc = loc('job_lumberjack_desc_iceage_plural',[gain,global.resource.Lumber.name, (1 / hardiness).toFixed(2)]);
                    }
                }
                if (global.civic.d_job === 'lumberjack' && !servant){
                    desc = desc + ' ' + loc('job_default',[job_data.lumberjack.name()]);
                }
                let hallowed = getHalloween();
                if (hallowed.active){
                    desc = desc + ` <span class="has-text-special">${loc('events_halloween_lumberjack')}</span> `;
                }
                return desc;
            }
        },
        impact(){ return 1; },
        stress(){ return 5; },
        color(){ return false; }
    },
    quarry_worker: {
        name(){ return loc('job_quarry_worker'); },
        desc(servant){
            let workers = servant && global.race['servants'] ? global.race.servants.jobs.quarry_worker : global.civic.quarry_worker.workers;
            let impact = job_data.quarry_worker.impact();
            if (!servant){
                workers = +workerScale(workers,'quarry_worker').toFixed(2);
                impact = +workerScale(impact,'quarry_worker').toFixed(2);
            }
            let multiplier = (global.tech['hammer'] && global.tech['hammer'] > 0 ? global.tech['hammer'] * 0.4 : 0) + 1;
            if (!servant){
                multiplier *= racialTrait(workers,'miner');
            }
            if (global.city.biome === 'desert'){
                multiplier *= biomes.desert.vars()[0];
            }
            if (global.city.biome === 'swamp'){
                multiplier *= biomes.swamp.vars()[3];
            }
            if (global.tech['explosives'] && global.tech['explosives'] >= 2){
                multiplier *= global.tech['explosives'] >= 3 ? 1.75 : 1.5;
            }
            let gain = +(impact * multiplier).toFixed(1);
            let desc = global.resource.Aluminium.display ? loc('job_quarry_worker_desc2',[gain, global.resource.Stone.name,global.resource.Aluminium.name]) : loc('job_quarry_worker_desc1',[gain,global.resource.Stone.name]);
            if (global.race['smoldering']){
                desc = desc + ' ' + loc('job_quarry_worker_smoldering',[global.resource.Chrysotile.name]);
            }
            if (global.civic.d_job === 'quarry_worker' && !servant){
                desc = desc + ' ' + loc('job_default',[job_data.quarry_worker.name()]);
            }
            return desc;
        },
        impact(){ return 1; },
        stress(){ return 5; },
        color(){ return false; }
    },
    crystal_miner: {
        name(){ return loc('job_crystal_miner'); },
        desc(servant){
            let workers = servant && global.race['servants'] ? global.race.servants.jobs.crystal_miner : global.civic.crystal_miner.workers;
            let impact = job_data.crystal_miner.impact();
            let multiplier = 1;
            if (!servant){
                workers = +workerScale(workers,'crystal_miner').toFixed(2);
                impact = +workerScale(impact,'crystal_miner').toFixed(2);
                multiplier *= racialTrait(workers,'miner');
            }
            let gain = +(impact * multiplier).toFixed(2);
            let desc = loc('job_crystal_miner_desc',[gain,global.resource.Crystal.name]);
            if (global.civic.d_job === 'crystal_miner' && !servant){
                desc = desc + ' ' + loc('job_default',[job_data.crystal_miner.name()]);
            }
            return desc;
        },
        impact(){ return 0.1; },
        stress(){ return 5; },
        color(){ return false; }
    },
    scavenger: {
        name(){ return loc('job_scavenger'); },
        desc(servant){
            let scavenger = traits.scavenger.vars()[0];
            if (global.city.ptrait.includes('trashed') && global.race['scavenger']){
                scavenger *= 1 + (traits.scavenger.vars()[1] / 100);
            }
            if (global.race['high_pop'] && !servant){
                scavenger *= traits.high_pop.vars()[1] / 100;
            }
            if (!servant){
                scavenger = +workerScale(scavenger,'scavenger').toFixed(2);
            }
            let desc = loc('job_scavenger_desc',[races[global.race.species].home,scavenger]);
            if (global.civic.d_job === 'scavenger' && !servant){
                desc = desc + ' ' + loc('job_default',[job_data.scavenger.name()]);
            }
            return desc;
        },
        stress(){ return 5; },
        color(){ return false; }
    },
    teamster: {
        name(){ return loc('job_teamster'); },
        desc(servant){
            let desc = loc('job_teamster_desc',[teamsterCap()]);
            if (global.civic.d_job === 'teamster' && !servant){
                desc = desc + ' ' + loc('job_default',[job_data.teamster.name()]);
            }
            return desc;
        },
        stress(){ return global.tech['teamster'] ? 6 : 4; },
        color(){ return false; }
    },
    meditator: {
        name(){ return loc('job_meditator'); },
        desc(servant){
            let desc = loc('job_meditator_desc');
            if (global.civic.d_job === 'meditator' && !servant){
                desc = desc + ' ' + loc('job_default',[job_data.meditator.name()]);
            }
            return desc;
        },
        stress(){ return 5; },
        color(){ return false; }
    },
    water_collector: {
        name(){ return loc('job_water_collector'); },
        desc(){
            let workers = global.civic.water_collector.workers;
            let impact = job_data.water_collector.impact();
            workers = +workerScale(workers,'water_collector').toFixed(2);
            impact = +workerScale(impact,'water_collector').toFixed(2);
            let multiplier = 0.5;
            multiplier *= racialTrait(workers,'water_collector');
            if(global.tech['water'] >= 2){
                multiplier *= 1 + (global.tech['water'] - 1) * 0.3;
            }
            let gain = +(impact * multiplier).toFixed(1);
            let desc = loc('job_water_collector_desc',[gain]);
            if (global.civic.d_job === 'water_collector'){
                desc = desc + ' ' + loc('job_default',[jobName('water_collector')]);
            }
            return desc;
        },
        impact(){ return 0.5; },
        stress(){ return 5; },
        color(){ return 'advanced'; }
    },
    torturer: {
        name(){ return loc('job_torturer'); },
        desc(){
            return loc('job_torturer_desc');
        },
        stress(){ return 3; },
        color(){ return 'advanced'; }
    },
    miner: {
        name(){ return loc('job_miner'); },
        desc(){
            if (global.race['warlord']){
                return loc('job_dig_demon_desc');
            }
            else if (global.tech['mining'] >= 3){
                return global.race['sappy'] && global.tech['alumina'] ? loc('job_miner_desc2_amber') : loc('job_miner_desc2');
            }
            else {
                return loc('job_miner_desc1');
            }
        },
        impact(){ return 1; },
        stress(){ return 4; },
        color(){ return 'advanced'; }
    },
    coal_miner: {
        name(){ return loc('job_coal_miner'); },
        desc(){
            if (global.tech['uranium']){
                return loc('job_coal_miner_desc2');
            }
            else {
                return loc('job_coal_miner_desc1');
            }
        },
        impact(){ return 0.2; },
        stress(){ return 4; },
        color(){ return 'advanced'; }
    },
    core_miner: {
        name(){ return loc('job_core_miner'); },
        desc(){
            return `<div>${loc('job_core_miner_desc1')}</div><div class="has-text-caution">${loc('job_core_miner_desc2')}</div>`;
        },
        impact(){ return 0.1; },
        mine_effect(){
            let effect = 1;
            if(global.tech['mineshaft'] >= 5 && global.underground['mineshaft']){
                let mineshaft_effect = 1 + (actions.underground.cave.mineshaft.full_depth() - 100000) * 0.00003;
                if(mineshaft_effect >= 1){
                    effect *= mineshaft_effect;
                }
            }
            return effect;
        },
        stress(){ return 1; },
        color(){ return 'advanced'; }
    },
    craftsman: {
        name(){ return loc('job_craftsman'); },
        desc(){
            return loc('job_craftsman_desc');
        },
        stress(){ return 5; },
        color(){ return 'advanced'; }
    },
    cement_worker: {
        name(){ return loc('job_cement_worker'); },
        desc(){
            let unit_price = global.race['high_pop'] ? 3 / traits.high_pop.vars()[0] : 3;
            if (global.city.biome === 'ashland'){
                unit_price *= biomes.ashland.vars()[1];
            }
            unit_price = +workerScale(unit_price,'cement_worker').toFixed(2);
            let worker_impact = +workerScale(job_data.cement_worker.impact(),'cement_worker').toFixed(2);
            let impact = global.tech['cement'] >= 4 ? (global.tech.cement >= 7 ? 1.45 : 1.2) : 1;
            let cement_multiplier = racialTrait(global.civic.cement_worker.workers,'factory');
            let gain = worker_impact * impact * cement_multiplier;
            if (global.city.biome === 'ashland'){
                gain *= biomes.ashland.vars()[1];
            }
            gain = +(gain).toFixed(2);
            return global.race['sappy'] ? loc('job_cement_worker_amber_desc',[gain]) : loc('job_cement_worker_desc',[gain,unit_price]);
        },
        impact(){ return 0.4; },
        stress(){ return 5; },
        color(){ return 'advanced'; }
    },
    banker: {
        name(){ return loc('job_banker'); },
        desc(){
            let interest = +workerScale(job_data.banker.impact(),'banker').toFixed(2) * 100;
            if (global.tech['banking'] >= 10){
                interest += 2 * global.tech['stock_exchange'];
            }
            if (global.race['truthful']){
                interest *= 1 - (traits.truthful.vars()[0] / 100);
            }
            if (global.civic.govern.type === 'republic'){
                interest *= 1 + (govEffect.republic()[0] / 100);
            }
            if (global.race['high_pop']){
                interest *= traits.high_pop.vars()[1] / 100;
            }
            interest = +(interest).toFixed(0);
            if(global.race['fasting']){
                return loc('job_banker_desc_fasting');
            }
            return loc('job_banker_desc',[interest]);
        },
        impact(){ return 0.1; },
        stress(){ return 6; },
        color(){ return 'advanced'; }
    },
    entertainer: {
        name(){ return loc('job_entertainer'); },
        desc(){
            let morale = global.tech['theatre'];
            if (global.race['musical']){
                morale += traits.musical.vars()[0];
            }
            if (global.race['emotionless']){
                morale *= 1 - (traits.emotionless.vars()[0] / 100);
            }
            if (global.race['high_pop']){
                morale *= traits.high_pop.vars()[1] / 100;
            }
            morale = +workerScale(morale,'entertainer').toFixed(2);
            let mcap = global.race['high_pop'] ? (traits.high_pop.vars()[1] / 100) : 1;
            mcap = +workerScale(mcap,'entertainer').toFixed(2);
            return global.tech['superstar'] ? loc('job_entertainer_desc2',[morale,mcap]) : loc('job_entertainer_desc',[+(morale).toFixed(2)]);
        },
        stress(){ return 10; },
        color(){ return 'advanced'; }
    },
    gardener: {
        name(){ return loc('job_gardener'); },
        desc(){
            let morale = global.tech['theatre'];
            if (global.race['musical']){
                morale += traits.musical.vars()[0];
            }
            if (global.race['emotionless']){
                morale *= 1 - (traits.emotionless.vars()[0] / 100);
            }
            if (global.race['high_pop']){
                morale *= traits.high_pop.vars()[1] / 100;
            }
            morale = +workerScale(morale,'entertainer').toFixed(2);
            let water = morale * 2;
            return loc('job_gardener_desc',[water, +(morale).toFixed(2)]);
        },
        stress(){ return 10; },
        color(){ return 'advanced'; }
    },
    priest: {
        name(){ return global.race.universe === 'evil' && global.civic.govern.type != 'theocracy' ? loc('job_pofficer') : loc('job_priest'); },
        desc(){
            let desc = ``;
            if (global.civic.govern.type === 'theocracy' && global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                desc = loc('job_priest_desc2');
            }
            else {
                desc = global.race.universe === 'evil' ? loc('job_pofficer_desc') : loc('job_priest_desc');
            }
            if (global.tech['cleric']){
                desc = desc + ` ${loc('job_priest_desc3')}`;
            }
            return desc;
        },
        stress(){ return 3; },
        color(){ return 'advanced'; }
    },
    professor: {
        name(){ return loc('job_professor'); },
        desc(){
            let professor = +workerScale(1,'professor');
            let impact = +(global.race['studious'] ? job_data.professor.impact() + traits.studious.vars()[0] : job_data.professor.impact());
            let fathom = fathomCheck('elven');
            if (fathom > 0){
                impact += traits.studious.vars(1)[0] * fathom;
            }
            professor *= impact;
            professor *= global.race['pompous'] ? (1 - traits.pompous.vars()[0] / 100) : 1;
            professor *= racialTrait(global.civic.professor.workers,'science');
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 3){
                professor *= 1 + (templeCount() * 0.05);
            }
            if (global.civic.govern.type === 'theocracy'){
                professor *= 1 - (govEffect.theocracy()[1] / 100);
            }
            professor = +professor.toFixed(2);
            return loc('job_professor_desc',[professor]);
        },
        impact(){
            if (global.tech['science'] && global.tech.science >= 3){
                return 0.5 + ((global.city['library'] ? global.city.library.count : 0) * 0.01);
            }
            return 0.5;
        },
        stress(){ return 6; },
        color(){ return 'advanced'; }
    },
    scientist: {
        name(){ return global.race.universe === 'magic' ? loc('job_wizard') : loc('job_scientist'); },
        desc(){
            let impact = +workerScale(job_data.scientist.impact(),'scientist').toFixed(2);
            impact *= racialTrait(global.civic.scientist.workers,'science');
            if (global.tech['science'] >= 6 && global.city['wardenclyffe']){
                impact *= 1 + (global.civic.professor.workers * global.city['wardenclyffe'].on * 0.01);
            }
            if (global.space['satellite']){
                impact *= 1 + (global.space.satellite.count * 0.01);
            }
            if (global.civic.govern.type === 'theocracy'){
                impact *= 1 - (govEffect.theocracy()[2] / 100);
            }
            impact = +impact.toFixed(2);
            return global.race.universe === 'magic' ? loc('job_wizard_desc',[impact,+(0.025 * darkEffect('magic')).toFixed(4)]) : loc('job_scientist_desc',[impact]);
        },
        impact(){ return 1; },
        stress(){ return 5; },
        color(){ return 'advanced'; }
    },
    colonist: {
        name(){ return global.race['truepath'] ? loc('job_colonist_tp',[planetName().red]) : loc('job_colonist'); },
        desc(){
            return loc(global.race['truepath'] ? 'job_colonist_desc_tp' : 'job_colonist_desc',[planetName().red]);
        },
        stress(){ return 5; },
        color(){ return 'advanced'; }
    },
    titan_colonist: {
        name(){ return loc('job_colonist_tp',[planetName().titan]); },
        desc(){
            return loc('job_colonist_desc_tp',[planetName().titan]);
        },
        stress(){ return 5; },
        color(){ return 'advanced'; }
    },
    technician: {
        name(){ return loc('job_technician'); },
        desc(){
            return loc('job_technician_desc',[
                job_data.technician.factoryRate(),
                job_data.technician.craftRate(),
                job_data.cement_worker.name(),
                job_data.technician.cementRate()
            ]);
        },
        factoryRate(){ return 3; },
        craftRate(){ return 10; },
        cementRate(){ return 4; },
        stress(){ return 5; },
        color(){ return 'advanced'; }
    },
    space_miner: {
        name(){ return loc('job_space_miner'); },
        desc(){
            return loc('job_space_miner_desc');
        },
        stress(){ return 5; },
        color(){ return 'advanced'; }
    },
    hell_surveyor: {
        name(){ return loc('job_hell_surveyor'); },
        desc(){
            return loc('job_hell_surveyor_desc');
        },
        stress(){ return 1; },
        color(){ return 'advanced'; }
    },
    archaeologist: {
        name(){ return loc('job_archaeologist'); },
        desc(){
            if(global.race['iceage']){
                let chance = (100 / actions.underground.industry.archaeological_dig.fossil_chance()).toFixed(2);
                return loc('job_archaeologist_underground_desc', [chance]);
            }
            else{
                let value = highPopAdjust(250000);
                let sup = hellSupression('ruins');
                let know = Math.round(value * sup.supress);
                return loc('job_archaeologist_desc',[know.toLocaleString()]);
            }
        },
        stress(){ return global.race['iceage'] ? 5 : 1; },
        color(){ return 'advanced'; }
    },
    ghost_trapper: {
        name(){ return loc('job_ghost_trapper'); },
        desc(){
            let attact = global.blood['attract'] ? global.blood.attract * 5 : 0;
            let resist = asphodelResist();
            let ascend = 1;
            if (p_on['ascension_trigger'] && global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
                let heatSink = actions.interstellar.int_sirius.ascension_trigger.heatSink();
                heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;
                if (heatSink > 0){
                    ascend = 1 + (heatSink / 12500);
                }
            }
            if (global.race['warlord'] && global.portal['mortuary'] && global.portal['corpse_pile']){
                let corpse = (global.portal?.corpse_pile?.count || 0) * (p_on['mortuary'] || 0);
                if (corpse > 0){
                    ascend = 1 + corpse / 800;
                }
            }
            let min = Math.floor((150 + attact) * resist * ascend);
            let max = Math.floor((250 + attact) * resist * ascend);
            
            return loc('job_ghost_trapper_desc',[loc('portal_soul_forge_title'),global.resource.Soul_Gem.name,min,max]);
        },
        stress(){ return 3; },
        color(){ return 'advanced'; }
    },
    elysium_miner: {
        name(){ return loc('job_elysium_miner'); },
        desc(){
            let desc = loc('job_elysium_miner_desc',[loc('eden_elysium_name')]);
            if (global.tech['elysium'] && global.tech.elysium >= 12){
                desc += ` ${loc('eden_restaurant_effect',[0.15,loc(`eden_restaurant_bd`)])}.`;
            }
            return desc;
        },
        stress(){ return 3; },
        color(){ return 'advanced'; }
    },
    pit_miner: {
        name(){ return loc('job_pit_miner'); },
        desc(){
            return loc('job_pit_miner_desc',[loc('tau_planet',[races[global.race.species].home])]);
        },
        stress(){ return 4.5; },
        color(){ return 'advanced'; }
    },
    crew: {
        name(){ return loc('job_crew'); },
        desc(){
            return loc('job_crew_desc');
        },
        stress(){ return 4; },
        color(){ return 'alert'; }
    }
}

// Sets up jobs in civics tab
export function defineJobs(define){
    if (!define){
        $('#civics').append($(`<h2 class="is-sr-only">${loc('civics_jobs')}</h2><div class="tile is-child jobList"><div id="sshifter" class="tile sshifter"></div><div id="jobs" class="tile is-child"></div><div id="foundry" class="tile is-child"></div><div id="servants" class="tile is-child"></div><div id="skilledServants" class="tile is-child"></div></div>`));
    }
    // Impact, stress and colour now come off job_data, so this is just the display order.
    loadJob('unemployed',define);
    loadJob('hunter',define);
    loadJob('forager',define);
    loadJob('farmer',define);
    loadJob('lumberjack',define);
    loadJob('quarry_worker',define);
    loadJob('crystal_miner',define);
    loadJob('scavenger',define);
    loadJob('teamster',define);
    loadJob('meditator',define);
    loadJob('torturer',define);
    loadJob('water_collector',define);
    loadJob('miner',define);
    loadJob('coal_miner',define);
    loadJob('core_miner',define);
    loadJob('craftsman',define);
    loadJob('cement_worker',define);
    loadJob('technician',define);
    loadJob('entertainer',define);
    loadJob('gardener',define);
    loadJob('priest',define);
    loadJob('professor',define);
    loadJob('scientist',define);
    loadJob('banker',define);
    loadJob('colonist',define);
    loadJob('titan_colonist',define);
    loadJob('space_miner',define);
    loadJob('hell_surveyor',define);
    loadJob('archaeologist',define);
    loadJob('ghost_trapper',define);
    loadJob('elysium_miner',define);
    loadJob('pit_miner',define);
    loadJob('crew',define);
    if (!define && !global.race['start_cataclysm']){
        ['Scarletite','Quantium'].forEach(function (res){
            limitCraftsmen(res, false);
        });
        loadFoundry();
        if (global.race['servants']){
            loadServants();
        }
    }
}

export function workerScale(num,job){
    if (global.race['strong'] && ['hunter','forager','farmer','lumberjack','quarry_worker','crystal_miner','scavenger'].includes(job)){
        num *= traits.strong.vars()[1];
    }
    if ((global.race['swift'] || global.race['living_tool']) && ['hunter','forager','farmer','lumberjack','quarry_worker','crystal_miner','scavenger'].includes(job)){
        num *= traits.strong.vars(0.25)[1];
    }
    let teacher = govActive('teacher',1);
    if(teacher && ['professor'].includes(job)){
        num *= 1 + (teacher / 100);
    }
    if(global.underground['mineshaft'] && ['miner'].includes(job)){
        num *= 1 - (global.underground['mineshaft'].ratio / 100);
    }
    if (global.race['lone_survivor']){
        if (['hunter','forager','water_collector','farmer','lumberjack','quarry_worker','crystal_miner','scavenger'].includes(job)){
            num *= 80;
        }
        else if (['craftsman'].includes(job)){
            num *= 60;
        }
        else if (['miner','coal_miner','cement_worker','banker','entertainer','priest','pit_miner'].includes(job)){
            num *= 45;
        }
        else if (['professor','scientist','archaeologist'].includes(job)){
            num *= 125;
        }
    }
    return num;
}

export function jobScale(num){
    if (global.race['high_pop']){
        return num * traits.high_pop.vars()[0];
    }
    return num;
}

function loadJob(job, define){
    let servant = false;
    if (define === 'servant'){
        servant = true;
        define = false;
    }
    let color = job_data[job].color();
    if (!global['civic'][job]){
        global['civic'][job] = {
            job: job,
            display: false,
            workers: 0,
            max: 0
        };
    }

    let noControl = {};
    if (global.race['warlord']){
        noControl['miner'] = true;
    }

    if (!global.civic[job]['assigned']){
        global.civic[job]['assigned'] = job === 'craftsman'? 0 : global.civic[job].workers;
    }

    if (job === 'craftsman' || define){
        return;
    }

    var id = servant ? 'servant-' + job : 'civ-' + job;

    var bind_container = $(`<div id="${id}"></div>`);
    var civ_container = $(`<div id="${id}" v-show="showJob('${job}')" class="job"></div>`);
    bind_container.append(civ_container);
    var controls = servant ? $(`<div class="controls"></div>`) : $(`<div v-show="!isDefault('${job}')" class="controls"></div>`);
    if (!color || job === 'unemployed'){
        color = color || 'info';
        let job_label = servant
         ? $(`<div class="job_label"><h3 class="has-text-${color}">{{ jname() }}</h3><span class="count">{{ sjob.${job} }}</span></div>`)
         : $(`<div class="job_label"><h3><a class="has-text-${color}" @click="setDefault('${job}')">{{ jname() }}{{ d_state('${job}') }}</a></h3><span class="count" v-html="event(civic.${job}.workers)"></span></div>`);
        civ_container.append(job_label);
    }
    else {
        let job_label = $(`<div class="job_label"><h3 class="has-text-${color}">{{ jname() }}</h3><span :class="level('${job}')">{{ adjust(civic.${job}.workers, '${job}') }} / {{ adjust(civic.${job}.max, '${job}') }}</span></div>`);
        civ_container.append(job_label);
    }
    civ_container.append(controls);
    $(servant ? '#servants' : '#jobs').append(bind_container);

    if (job !== 'crew' && !noControl[job]){
        var sub = $(`<span role="button" aria-label="${loc('remove')} ${job_data[job].name()}" class="sub has-text-danger" @click="sub"><span>&laquo;</span></span>`);
        var add = $(`<span role="button" aria-label="${loc('add')} ${job_data[job].name()}" class="add has-text-success" @click="add"><span>&raquo;</span></span>`);
        controls.append(sub);
        controls.append(add);
    }

    if (servant){
        vBind({
            el: `#${id}`,
            data: {
                civic: global.civic,
                sjob: global.race.servants.jobs
            },
            methods: {
                jname(){
                    return job_data[job].name();
                },
                showJob(j){
                    return global.civic[j].display || (j === 'scavenger' && global.race.servants.force_scavenger);
                },
                add(){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if (global.race.servants.max > global.race.servants.used){
                            global.race.servants.jobs[job]++;
                            global.race.servants.used++;
                        }
                        else {
                            break;
                        }
                    }
                },
                sub(){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if (global.race.servants.jobs[job] > 0){
                            global.race.servants.jobs[job]--;
                            global.race.servants.used--;
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        });
    }
    else {
        vBind({
            el: `#${id}`,
            data: {
                civic: global.civic
            },
            methods: {
                jname(){
                    return job_data[job].name();
                },
                showJob(j){
                    return global.civic[j].display;
                },
                add(){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if ((global['civic'][job].max === -1 || global.civic[job].workers < global['civic'][job].max) && (global.civic[global.civic.d_job] && global.civic[global.civic.d_job].workers > 0)){
                            global.civic[job].workers++;
                            global.civic[global.civic.d_job].workers--;
                            global.civic[job].assigned = global.civic[job].workers;
                        }
                        else {
                            break;
                        }
                    }
                },
                sub(){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if (global.civic[job].workers > 0){
                            global.civic[job].workers--;
                            global.civic[global.civic.d_job].workers++;
                            global.civic[job].assigned = global.civic[job].workers;
                        }
                        else {
                            break;
                        }
                    }
                },
                level(job){
                    if (global.civic[job].workers === 0){
                        return 'count has-text-danger';
                    }
                    else if (global.civic[job].workers === global.civic[job].max){
                        return 'count has-text-success';
                    }
                    else if (global.civic[job].workers <= global.civic[job].max / 3){
                        return 'count has-text-caution';
                    }
                    else if (global.civic[job].workers <= global.civic[job].max * 0.66){
                        return 'count has-text-warning';
                    }
                    else if (global.civic[job].workers < global.civic[job].max){
                        return 'count has-text-info';
                    }
                    else {
                        return 'count';
                    }
                },
                setDefault(j){
                    global.civic.d_job = j;
                },
                isDefault(j){
                    return global.civic.d_job === j;
                },
                d_state(j){
                    return global.civic.d_job === j ? '*' : '';
                },
                event(c){
                    if ((job === 'unemployed' && global.civic.unemployed.display) || (job === 'hunter' && !global.civic.unemployed.display)){
                        let egg = easterEgg(3,14);
                        if (c === 0 && egg.length > 0){
                            return egg;
                        }
                    }
                    return c;
                },
                adjust(v,j){
                    if (j === 'titan_colonist' && p_on['ai_colonist']){
                        return v + jobScale(p_on['ai_colonist']);
                    }
                    return v;
                }
            }
        });
    }

    popover(id, function(){
            return job_data[job].desc(servant);
        },
        {
            elm: `#${id} .job_label`,
            classes: `has-background-light has-text-dark`
        }
    );
}

export function loadServants(){
    clearElement($('#servants'));
    if (global.race['servants'] && global.race.servants.max > 0 && Object.keys(global.race.servants.jobs).length > 0){
        var servants = $(`<div id="servantList" class="job"><div class="foundry job_label"><h3 class="serveHeader has-text-warning">${loc('civics_servants')}</h3><span :class="level()">{{ s.used }} / {{ s.max }}</span></div></div>`);
        $('#servants').append(servants);

        ['hunter','forager','farmer','lumberjack','quarry_worker','crystal_miner','scavenger'].forEach(function(job){
            loadJob(job,'servant');
        });

        vBind({
            el: `#servantList`,
            data: {
                s: global.race.servants
            },
            methods: {
                level(){
                    if (global.race.servants.used === 0){
                        return 'count has-text-danger';
                    }
                    else if (global.race.servants.used === global.race.servants.max){
                        return 'count has-text-success';
                    }
                    else if (global.race.servants.used <= global.race.servants.max / 3){
                        return 'count has-text-caution';
                    }
                    else if (global.race.servants.used <= global.race.servants.max * 0.66){
                        return 'count has-text-warning';
                    }
                    else if (global.race.servants.used < global.race.servants.max){
                        return 'count has-text-info';
                    }
                    else {
                        return 'count';
                    }
                }
            }
        });

        popover('servants', function(){
                return loc('civics_servants_desc');
            },
            {
                elm: `#servants .serveHeader`
            }
        );
    }
}

export function teamsterCap(){
    let transport = 0;
    if (global.race['gravity_well']){
        transport = global.tech['transport'] ? global.tech.transport : 0;
        transport = Math.round(global.race.teamster / transport * 1.5);
    }
    if (global.tech['railway']){
        transport -= global.tech['railway'] * 2;
    }
    if (transport < 0){ transport = 0; }
    return transport;
}

export function craftsmanCap(res){
    switch (res){
        case 'Scarletite':
            if (global.portal.hasOwnProperty('hell_forge')){
                let cap = getStructNumActive(actions.portal.prtl_ruins.hell_forge);
                return jobScale(cap);
            }
            return 0;

        case 'Quantium':
            let cap = 0;
            if (global.tech['isolation']){
                if (global.tech['resettle'] && global.tech.resettle >= 12 && global.space.hasOwnProperty('zero_g_lab')){
                    cap += getStructNumActive(actions.space.spc_enceladus.zero_g_lab);
                }
                if (global.tauceti.hasOwnProperty('infectious_disease_lab')){
                    cap += getStructNumActive(actions.tauceti.tau_home.infectious_disease_lab);
                }
            }
            else if (global.space.hasOwnProperty('zero_g_lab')){
                cap = getStructNumActive(actions.space.spc_enceladus.zero_g_lab);
            }
            return jobScale(cap || 0);

        // This function isn't used to limit normal craftsmen
        default:
            return Number.MAX_SAFE_INTEGER;
    }
}

export function limitCraftsmen(res, allow_redraw = true){
    // Ignore undiscovered materials
    if (!global.resource[res].display){
        return;
    }

    // Remember previous crafter limits and refresh UI later on if they change
    if (!tmp_vars.hasOwnProperty('craftsman_cap')){
        tmp_vars.craftsman_cap = {};
    }

    let cap = craftsmanCap(res);
    let refresh = false;
    if (global.city.hasOwnProperty('foundry') && global.city.foundry.hasOwnProperty(res) && cap < global.city.foundry[res]){
        let diff = global.city.foundry[res] - cap;
        global.civic.craftsman.workers -= diff;
        global.city.foundry.crafting -= diff;
        global.city.foundry[res] -= diff;
        // The structures hosting this material were razed or switched off.
        if (global.city.foundry.hasOwnProperty('hold')){
            global.city.foundry.hold[res] = (global.city.foundry.hold[res] || 0) + diff;
        }
        refresh = true;
    }
    else if (!tmp_vars['craftsman_cap'].hasOwnProperty(res)){
        refresh = true;
    }
    else if (cap != tmp_vars['craftsman_cap'][res]){
        refresh = true;
    }
    tmp_vars['craftsman_cap'][res] = cap;

    // Refresh UI when the cap changes due to power balancing
    if (allow_redraw && refresh){
        loadFoundry();
    }
}

export function farmerValue(farm,servant){
    let farming = job_data.farmer.impact();
    if (farm){
        farming += global.tech['agriculture'] && global.tech.agriculture >= 2 ? 1.15 : 0.65;
    }
    if (global.race['living_tool'] && !servant){
        farming *= 1 + traits.living_tool.vars()[0] * (global.tech['science'] && global.tech.science > 0 ? global.tech.science / 5 : 0);
    }
    else {
        farming *= 1 + (global.tech['hoe'] && global.tech.hoe > 0 ? global.tech.hoe / 3 : 0);
    }
    farming *= global.city.biome === 'grassland' ? biomes.grassland.vars()[0] : 1;
    farming *= global.city.biome === 'savanna' ? biomes.savanna.vars()[0] : 1;
    farming *= global.city.biome === 'ashland' ? biomes.ashland.vars()[0] : 1;
    farming *= global.city.biome === 'volcanic' ? biomes.volcanic.vars()[0] : 1;
    farming *= global.city.biome === 'hellscape' ? biomes.hellscape.vars()[0] : 1;
    farming *= global.city.ptrait.includes('trashed') ? planetTraits.trashed.vars()[0] : 1;
    if (servant){
        farming *= servantTrait(global.race.servants.jobs.farmer,'farmer');
    }
    else {
        farming *= racialTrait(global.civic.farmer.workers,'farmer');
    }
    farming *= global.tech['agriculture'] >= 7 ? 1.1 : 1;
    farming *= global.race['low_light'] ? (1 - traits.low_light.vars()[0] / 100) : 1;
    return farming;
}

export function loadFoundry(servants){
    clearElement($(servants ? '#skilledServants' : '#foundry'));
    let show = servants
        ? (global.race['servants'] && global.race.servants.smax > 0 ? true : false)
        : ((global.city['foundry'] && global.city['foundry'].count > 0) || global.underground['under_foundry']?.count || global.race['cataclysm'] || global.race['orbit_decayed'] || global.tech['isolation'] || global.race['warlord'] ? true : false);
    if (show){
        let element = $(servants ? '#skilledServants' : '#foundry');
        let track = servants ? `{{ s.sused }} / {{ s.smax }}` : `{{ f.crafting }} / {{ c.max }}`;
        let foundry = $(`<div class="job"><div class="foundry job_label"><h3 class="has-text-warning">${loc(servants ? 'civics_skilled_servants' : 'craftsman_assigned')}</h3><span :class="level()">${track}</span></div></div>`);
        element.append(foundry);

        let summer = eventActive('summer');
        let list = ['Plywood','Brick','Wrought_Iron','Sheet_Metal','Mythril','Aerogel','Nanoweave','Aerographene'];
        if (!servants){
            list.push('Scarletite');
            list.push('Quantium');
        }
        if (summer && !servants){
            list.push('Thermite');
        }
        for (let i=0; i<list.length; i++){
            let res = list[i];
            if ((servants && !global.race.servants.sjobs.hasOwnProperty(res)) || (!servants && !global.city.foundry.hasOwnProperty(res))){
                if (servants){
                    global.race.servants.sjobs[res] = 0;
                }
                else {
                    global.city.foundry[res] = 0;
                }
            }
            if (global.resource[res].display || (summer && res === 'Thermite')){
                let name = global.resource[res].name;
                let resource = $(`<div class="job"></div>`);
                element.append(resource);

                let controls = $('<div class="controls"></div>');
                let job_label;
                if (res === 'Scarletite' && global.portal.hasOwnProperty('hell_forge')){
                    job_label = $(`<div id="craft${res}" class="job_label"><h3 class="has-text-danger">${name}</h3><span class="count">{{ f.${res} }} / {{ maxScar(p.on) }}</span></div>`);
                }
                else if (res === 'Quantium' && (global.space.hasOwnProperty('zero_g_lab') || global.tauceti.hasOwnProperty('infectious_disease_lab'))){
                    job_label = $(`<div id="craft${res}" class="job_label"><h3 class="has-text-danger">${name}</h3><span class="count">{{ f.${res} }} / {{ maxQuantium(e.on) }}</span></div>`);
                }
                else {
                    let tracker = servants ? `{{ s.sjobs.${res} }}` : `{{ f.${res} }}`;
                    let id = servants ? `scraft${res}` : `craft${res}`;
                    job_label = $(`<div id="${id}" class="job_label"><h3 class="has-text-danger">${name}</h3><span class="count">${tracker}</span></div>`);
                }

                resource.append(job_label);
                resource.append(controls);
                element.append(resource);

                let sub = $(`<span role="button" aria-label="remove ${global.resource[res].name} crafter" class="sub has-text-danger" @click="sub('${res}')"><span>&laquo;</span></span>`);
                let add = $(`<span role="button" aria-label="add ${global.resource[res].name} crafter" class="add has-text-success" @click="add('${res}')"><span>&raquo;</span></span>`);

                controls.append(sub);
                controls.append(add);
            }
        }

        let bindData = global.portal.hasOwnProperty('hell_forge') ? {
            c: global.civic.craftsman,
            p: global.portal.hell_forge,
        } : {
            c: global.civic.craftsman,
            e: global.space.hasOwnProperty('zero_g_lab') || global.tauceti.hasOwnProperty('infectious_disease_lab') ? (global.tech['isolation'] ? global.tauceti.infectious_disease_lab : global.space.zero_g_lab) : { count: 0, on: 0 },
        };
        if (servants){
            bindData['s'] = global.race.servants;
        }
        else {
            bindData['f'] = global.city.foundry;
        }

        vBind({
            el: servants ? '#skilledServants' : '#foundry',
            data: bindData,
            methods: {
                add(res){
                    let keyMult = keyMultiplier();
                    let tMax = -1;
                    if (res === 'Scarletite' || res === 'Quantium'){
                        tMax = craftsmanCap(res);
                    }
                    for (let i=0; i<keyMult; i++){
                        if (servants){
                            if (global.race.servants.sused < global.race.servants.smax){
                                global.race.servants.sjobs[res]++;
                                global.race.servants.sused++;
                            }
                            else {
                                break;
                            }
                        }
                        else {
                            if (global.city.foundry.crafting < global.civic.craftsman.max
                                && (global.civic[global.civic.d_job] && global.civic[global.civic.d_job].workers > 0)
                                && (tMax === -1 || tMax > global.city.foundry[res])
                            ){
                                global.civic.craftsman.workers++;
                                global.city.foundry.crafting++;
                                global.city.foundry[res]++;
                                global.civic[global.civic.d_job].workers--;
                            }
                            else {
                                break;
                            }
                        }
                    }
                },
                sub(res){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if (servants){
                            if (global.race.servants.sjobs[res] > 0){
                                global.race.servants.sjobs[res]--;
                                global.race.servants.sused--;
                            }
                            else {
                                break;
                            }
                        }
                        else {
                            if (global.city.foundry[res] > 0){
                                global.city.foundry[res]--;
                                global.civic.craftsman.workers--;
                                global.city.foundry.crafting--;
                                global.civic[global.civic.d_job].workers++;
                            }
                            else {
                                break;
                            }
                        }
                    }
                },
                level(){
                    let workers = servants ? global.race.servants.sused : global.civic.craftsman.workers;
                    let max = servants ? global.race.servants.smax : global.civic.craftsman.max;
                    if (workers === 0){
                        return 'count has-text-danger';
                    }
                    else if (workers === max){
                        return 'count has-text-success';
                    }
                    else if (workers <= max / 3){
                        return 'count has-text-caution';
                    }
                    else if (workers <= max * 0.66){
                        return 'count has-text-warning';
                    }
                    else if (workers < max){
                        return 'count has-text-info';
                    }
                    else {
                        return 'count';
                    }
                },
                maxScar(v){
                    return craftsmanCap('Scarletite');
                },
                maxQuantium(v){
                    return craftsmanCap('Quantium');
                }
            }
        });

        for (let i=0; i<list.length; i++){
            let res = list[i];
            if (global.resource[res].display || (summer && res === 'Thermite')){
                let extra = function(){
                    let total = $(`<div></div>`);
                    let name = global.resource[res].name;
                    let craft_total = craftingRatio(res,'auto');
                    let multiplier = craft_total.multiplier;
                    let speed = global.genes['crafty'] ? 2 : 1;
                    let final = +(global.resource[res].diff).toFixed(2);
                    let bonus = +(multiplier * 100).toFixed(0);

                    total.append($(`<div>${loc('craftsman_hover_bonus', [bonus.toLocaleString(), name])}</div>`));
                    total.append($(`<div>${loc('craftsman_hover_prod', [final.toLocaleString(), name])}</div>`));
                    let craft_cost = craftCost();
                    for (let i=0; i<craft_cost[res].length; i++){
                        let craftCost = 1;
                        if(global.race['resourceful']){
                            craftCost -= traits.resourceful.vars()[0] / 100
                        }
                        let fathom = fathomCheck('arraak');
                        if(fathom > 0){
                            craftCost -= traits.resourceful.vars(1)[0] / 100 * fathom;
                        }
                        let cost = +(craft_cost[res][i].a * global.city.foundry[res] * craftCost * speed / 140).toFixed(2);
                        total.append($(`<div>${loc('craftsman_hover_cost', [cost, global.resource[craft_cost[res][i].r].name])}<div>`));
                    }

                    return total;
                }

                let id = servants ? `scraft${res}` : `craft${res}`;
                craftingPopover(id,res,'auto',extra);
            }
        }

        if (servants){
            popover('servantFoundry', function(){
                    return loc('civics_skilled_servants_desc');
                },
                {
                    elm: `#skilledServants .foundry`,
                    classes: `has-background-light has-text-dark`
                }
            );
        }
        else {
            popover('craftsmenFoundry', function(){
                    return loc('job_craftsman_hover');
                },
                {
                    elm: `#foundry .foundry`,
                    classes: `has-background-light has-text-dark`
                }
            );
        }

    }

    if (!servants){
        loadFoundry(true);
    }
}
