import { global, keyMultiplier, p_on, support_on } from './vars.js';
import { vBind, clearElement, popover, darkEffect, eventActive, easterEgg } from './functions.js';
import { loc } from './locale.js';
import { racialTrait, races, traits, biomes, planetTraits, genusVars } from './races.js';
import { armyRating } from './civics.js';
import { craftingRatio, craftCost, craftingPopover } from './resources.js';

export const job_desc = {
    unemployed: function(){
        let desc = loc('job_unemployed_desc');
        if (global.civic.d_job === 'unemployed'){
            desc = desc + ' ' + loc('job_default',[loc('job_unemployed')]);
        }
        return desc;
    },
    hunter: function(){
        let desc = loc('job_hunter_desc',[global.resource.Food.name]);
        if (global.race['artifical']){
            desc = global.race['soul_eater'] ? loc('job_art_demon_hunter_desc',[global.resource.Furs.name, global.resource.Lumber.name]) : loc('job_art_hunter_desc',[global.resource.Furs.name]);
        }
        else if (global.race['soul_eater'] && global.race.species !== 'wendigo'){
            desc = loc(global.race['evil'] ? 'job_evil_hunter_desc' : 'job_not_evil_hunter_desc',[global.resource.Food.name,global.resource.Lumber.name,global.resource.Furs.name]);
        }
        if (global.civic.d_job === 'hunter'){
            desc = desc + ' ' + loc('job_default',[loc('job_hunter')]);
        }
        return desc;
    },
    forager: function(){
        let desc = loc(`job_forager_desc`);
        if (global.civic.d_job === 'forager'){
            desc = desc + ' ' + loc('job_default',[loc('job_forager')]);
        }
        return desc;
    },
    farmer: function(){
        let farmer = +farmerValue(true).toFixed(2);
        let farmhand = +farmerValue(false).toFixed(2);
        let desc = global.race['high_pop'] 
            ? loc('job_farmer_desc_hp',[farmer,global.resource.Food.name,jobScale(1),farmhand,jobScale(1) * global.city.farm.count])
            : loc('job_farmer_desc',[farmer,global.resource.Food.name,global.city.farm.count,farmhand]);
        if (global.civic.d_job === 'farmer'){
            desc = desc + ' ' + loc('job_default',[loc('job_farmer')]);
        }
        return desc;
    },
    lumberjack: function(){
        if (global.race['evil'] && (!global.race['soul_eater'] || global.race.species === 'wendigo')){
            let multiplier = 1;
            multiplier *= racialTrait(global.civic.lumberjack.workers,'lumberjack');
            let impact = global.civic.lumberjack.impact;
            let bone = +(impact * multiplier).toFixed(2);
            let flesh = +(impact / 4 * multiplier).toFixed(2);
            let desc = global.race.species === 'wendigo' ? loc('job_reclaimer_desc2',[bone]) : loc('job_reclaimer_desc',[bone,flesh]);
            if (global.civic.d_job === 'lumberjack'){
                desc = desc + ' ' + loc('job_default',[loc('job_reclaimer')]);
            }
            return desc;
        }
        else {
            let multiplier = (global.tech['axe'] && global.tech['axe'] > 0 ? (global.tech['axe'] - 1) * 0.35 : 0) + 1;
            multiplier *= racialTrait(global.civic.lumberjack.workers,'lumberjack');
            let impact = global.city.biome === 'forest' ? (global.civic.lumberjack.impact * biomes.forest.vars()[0]) : global.civic.lumberjack.impact;
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
            let gain = +(impact * multiplier).toFixed(1);
            let desc = loc('job_lumberjack_desc',[gain,global.resource.Lumber.name]);
            if (global.civic.d_job === 'lumberjack'){
                desc = desc + ' ' + loc('job_default',[loc('job_lumberjack')]);
            }
            return desc;
        }
    },
    quarry_worker: function(){
        let multiplier = (global.tech['hammer'] && global.tech['hammer'] > 0 ? global.tech['hammer'] * 0.4 : 0) + 1;
        multiplier *= racialTrait(global.civic.quarry_worker.workers,'miner');
        if (global.city.biome === 'desert'){
            multiplier *= biomes.desert.vars()[0];
        }
        if (global.city.biome === 'swamp'){
            multiplier *= biomes.swamp.vars()[3];
        }
        if (global.tech['explosives'] && global.tech['explosives'] >= 2){
            multiplier *= global.tech['explosives'] >= 3 ? 1.75 : 1.5;
        }
        let gain = +(global.civic.quarry_worker.impact * multiplier).toFixed(1);
        let desc = global.resource.Aluminium.display ? loc('job_quarry_worker_desc2',[gain, global.resource.Stone.name,global.resource.Aluminium.name]) : loc('job_quarry_worker_desc1',[gain,global.resource.Stone.name]);
        if (global.race['smoldering']){
            desc = desc + ' ' + loc('job_quarry_worker_smoldering',[global.resource.Chrysotile.name]);
        }
        if (global.civic.d_job === 'quarry_worker'){
            desc = desc + ' ' + loc('job_default',[loc('job_quarry_worker')]);
        }
        return desc;
    },
    crystal_miner: function(){
        let multiplier = 1;
        multiplier *= racialTrait(global.civic.crystal_miner.workers,'miner');
        let gain = +(global.civic.crystal_miner.impact * multiplier).toFixed(2);
        let desc = loc('job_crystal_miner_desc',[gain,global.resource.Crystal.name]);
        if (global.civic.d_job === 'crystal_miner'){
            desc = desc + ' ' + loc('job_default',[loc('job_crystal_miner')]);
        }
        return desc;
    },
    scavenger: function(){
        let scavenger = traits.scavenger.vars()[0];
        if (global.city.ptrait.includes('trashed') && global.race['scavenger']){
            scavenger *= 1 + (traits.scavenger.vars()[1] / 100);
        }
        if (global.race['high_pop']){
            scavenger *= traits.high_pop.vars()[1] / 100;
        }
        let desc = loc('job_scavenger_desc',[races[global.race.species].home,scavenger]);
        if (global.civic.d_job === 'scavenger'){
            desc = desc + ' ' + loc('job_default',[loc('job_scavenger')]);
        }
        return desc;
    },
    miner: function(){
        if (global.tech['mining'] >= 3){
            return global.race['sappy'] && global.tech['alumina'] ? loc('job_miner_desc2_amber') : loc('job_miner_desc2');
        }
        else {
            return loc('job_miner_desc1');
        }
    },
    coal_miner: function(){
        if (global.tech['uranium']){
            return loc('job_coal_miner_desc2');
        }
        else {
            return loc('job_coal_miner_desc1');
        }
    },
    craftsman: function(){
        return loc('job_craftsman_desc');
    },
    cement_worker: function(){
        let unit_price = global.race['high_pop'] ? 3 / traits.high_pop.vars()[0] : 3;
        if (global.city.biome === 'ashland'){
            unit_price *= biomes.ashland.vars()[1];
        }
        let impact = global.tech['cement'] >= 4 ? 1.2 : 1;
        let cement_multiplier = racialTrait(global.civic.cement_worker.workers,'factory');
        let gain = global.civic.cement_worker.impact * impact * cement_multiplier;
        if (global.city.biome === 'ashland'){
            gain *= biomes.ashland.vars()[1];
        }
        gain = +(gain).toFixed(2);
        return global.race['sappy'] ? loc('job_cement_worker_amber_desc',[gain]) : loc('job_cement_worker_desc',[gain,unit_price]);
    },
    banker: function(){
        let interest = global.civic.banker.impact * 100;
        if (global.tech['banking'] >= 10){
            interest += 2 * global.tech['stock_exchange'];
        }
        if (global.race['truthful']){
            interest *= 1 - (traits.truthful.vars()[0] / 100);
        }
        if (global.civic.govern.type === 'republic'){
            interest *= 1.25;
        }
        if (global.race['high_pop']){
            interest *= traits.high_pop.vars()[1] / 100;
        }
        interest = +(interest).toFixed(0);
        return loc('job_banker_desc',[interest]);
    },
    entertainer: function(){
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
        let mcap = global.race['high_pop'] ? (traits.high_pop.vars()[1] / 100) : 1;
        return global.tech['superstar'] ? loc('job_entertainer_desc2',[morale,mcap]) : loc('job_entertainer_desc',[+(morale).toFixed(2)]);
    },
    priest: function(){
        let desc = ``;
        if (global.civic.govern.type === 'theocracy' && global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
            desc = loc('job_priest_desc2');
        }
        else {
            desc = loc('job_priest_desc');
        }
        if (global.tech['cleric']){
            desc = desc + ` ${loc('job_priest_desc3')}`;
        }
        return desc;
    },
    professor: function(){
        let impact = +(global.race['studious'] ? global.civic.professor.impact + traits.studious.vars()[0] : global.civic.professor.impact).toFixed(2);
        if (global.tech['science'] && global.tech['science'] >= 3){
            impact += global.city.library.count * 0.01;
        }
        impact *= global.race['pompous'] ? (1 - traits.pompous.vars()[0] / 100) : 1;
        impact *= racialTrait(global.civic.professor.workers,'science');
        if (global.tech['anthropology'] && global.tech['anthropology'] >= 3){
            impact *= 1 + (global.city.temple.count * 0.05);
        }
        if (global.civic.govern.type === 'theocracy'){
            impact *= 0.75;
        }
        impact = +impact.toFixed(2);
        return loc('job_professor_desc',[impact]);
    },
    scientist: function(){
        let impact = global.civic.scientist.impact;
        impact *= racialTrait(global.civic.scientist.workers,'science');
        if (global.tech['science'] >= 6 && global.city['wardenclyffe']){
            impact *= 1 + (global.civic.professor.workers * global.city['wardenclyffe'].on * 0.01);
        }
        if (global.space['satellite']){
            impact *= 1 + (global.space.satellite.count * 0.01);
        }
        if (global.civic.govern.type === 'theocracy'){
            impact *= global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 0.75 : 0.6 ) : 0.5;
        }
        impact = +impact.toFixed(2);
        return global.race.universe === 'magic' ? loc('job_wizard_desc',[impact,+(0.025 * darkEffect('magic')).toFixed(4)]) : loc('job_scientist_desc',[impact]);
    },
    colonist(){
        return loc(global.race['truepath'] ? 'job_colonist_desc_tp' : 'job_colonist_desc',[races[global.race.species].solar.red]);
    },
    titan_colonist(){
        return loc('job_colonist_desc_tp',[genusVars[races[global.race.species].type].solar.titan]);
    },
    space_miner(){
        return loc('job_space_miner_desc');
    },
    hell_surveyor(){
        return loc('job_hell_surveyor_desc');
    },
    archaeologist(){
        let arc = (p_on['arcology'] || 0) * 75;
        let supress = (armyRating(global.portal.guard_post.on,'hellArmy',0) + arc) / 5000;
        supress = supress > 1 ? 1 : supress;
        let value = 250000;
        if (global.race['high_pop']){
            value *= traits.high_pop.vars()[1] / 100;
        }
        let know = Math.round(value * supress);
        return loc('job_archaeologist_desc',[know.toLocaleString()]);
    },
    crew(){
        return loc('job_crew_desc');
    }
}

// Sets up jobs in civics tab
export function defineJobs(define){
    if (!define){
        $('#civics').append($(`<h2 class="is-sr-only">${loc('civics_jobs')}</h2><div class="tile is-child"><div id="sshifter" class="tile sshifter"></div><div id="jobs" class="tile is-child"></div><div id="foundry" class="tile is-child"></div></div>`));
    }
    loadJob('unemployed',define,0,0,'warning');
    loadJob('hunter',define,0,0);
    loadJob('forager',define,0,0);
    loadJob('farmer',define,0.82,5);
    loadJob('lumberjack',define,1,5);
    loadJob('quarry_worker',define,1,5);
    loadJob('crystal_miner',define,0.1,5);
    loadJob('scavenger',define,0.12,5);
    loadJob('miner',define,1,4,'advanced');
    loadJob('coal_miner',define,0.2,4,'advanced');
    loadJob('craftsman',define,1,5,'advanced');
    loadJob('cement_worker',define,0.4,5,'advanced');
    loadJob('entertainer',define,1,10,'advanced');
    loadJob('priest',define,1,3,'advanced');
    loadJob('professor',define,0.5,6,'advanced');
    loadJob('scientist',define,1,5,'advanced');
    loadJob('banker',define,0.1,6,'advanced');
    loadJob('colonist',define,1,5,'advanced');
    loadJob('titan_colonist',define,1,5,'advanced');
    loadJob('space_miner',define,1,5,'advanced');
    loadJob('hell_surveyor',define,1,1,'advanced');
    loadJob('archaeologist',define,1,1,'advanced');
    loadJob('crew',define,1,4,'alert');
    if (!define){
        loadFoundry();
    }
}

export function jobScale(num){
    if (global.race['high_pop']){
        return num * traits.high_pop.vars()[0];
    }
    return num;
}

export function setJobName(job){
    let job_name = '';
    if (global.race.universe === 'magic' && job === 'scientist'){
        job_name = loc('job_wizard');
    }
    else if (global.race['truepath'] && job === 'colonist'){
        job_name = loc('job_colonist_tp',[races[global.race.species].solar.red]);
    }
    else if (job === 'titan_colonist'){
        job_name = loc('job_colonist_tp',[genusVars[races[global.race.species].type].solar.titan]);
    }
    else {
        job_name = job === 'lumberjack' && global.race['evil'] && (!global.race['soul_eater'] || global.race.species === 'wendigo') ? loc('job_reclaimer') : loc('job_' + job);
    }
    global['civic'][job].name = job_name;
}

function loadJob(job, define, impact, stress, color){
    if (!global['civic'][job]){
        global['civic'][job] = {
            job: job,
            display: false,
            workers: 0,
            max: 0,
            impact: impact
        };
    }

    setJobName(job);

    if (!global.civic[job]['assigned']){
        global.civic[job]['assigned'] = job === 'craftsman'? 0 : global.civic[job].workers;
    }

    global.civic[job]['stress'] = stress;
    global.civic[job].impact = impact;

    if (job === 'craftsman' || define){
        return;
    }

    var id = 'civ-' + job;

    var civ_container = $(`<div id="${id}" v-show="civic.${job}.display" class="job"></div>`);
    var controls = $(`<div v-show="!isDefault('${job}')" class="controls"></div>`);
    if (!color || job === 'unemployed'){
        color = color || 'info';
        let job_label = $(`<div class="job_label"><h3><a class="has-text-${color}" @click="setDefault('${job}')">{{ civic.${job}.name }}{{ '${job}' | d_state }}</a></h3><span class="count" v-html="$options.filters.event(civic.${job}.workers)">{{ civic.${job}.workers }}</span></div>`);
        civ_container.append(job_label);
    }
    else {
        let job_label = $(`<div class="job_label"><h3 class="has-text-${color}">{{ civic.${job}.name }}</h3><span :class="level('${job}')">{{ civic.${job}.workers | adjust('${job}') }} / {{ civic.${job}.max | adjust('${job}') }}</span></div>`);
        civ_container.append(job_label);
    }
    civ_container.append(controls);
    $('#jobs').append(civ_container);

    if (job !== 'crew'){
        var sub = $(`<span role="button" aria-label="${loc('remove')} ${global['civic'][job].name}" class="sub has-text-danger" @click="sub"><span>&laquo;</span></span>`);
        var add = $(`<span role="button" aria-label="${loc('add')} ${global['civic'][job].name}" class="add has-text-success" @click="add"><span>&raquo;</span></span>`);
        controls.append(sub);
        controls.append(add);
    }

    vBind({
        el: `#${id}`,
        data: {
            civic: global.civic
        },
        methods: {
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
            }
        },
        filters: {
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

    popover(id, function(){
            return job_desc[job]();
        },
        {
            elm: `#${id} .job_label`,
            classes: `has-background-light has-text-dark`
        }
    );
}

export function farmerValue(farm){
    let farming = global.civic.farmer.impact;
    if (farm){
        farming += global.tech['agriculture'] >= 2 ? 1.15 : 0.65;
    }
    farming *= (global.tech['hoe'] && global.tech['hoe'] > 0 ? global.tech['hoe'] * (1/3) : 0) + 1;
    farming *= global.city.biome === 'grassland' ? biomes.grassland.vars()[0] : 1;
    farming *= global.city.biome === 'savanna' ? biomes.savanna.vars()[0] : 1;
    farming *= global.city.biome === 'ashland' ? biomes.ashland.vars()[0] : 1;
    farming *= global.city.biome === 'volcanic' ? biomes.volcanic.vars()[0] : 1;
    farming *= global.city.biome === 'hellscape' ? biomes.hellscape.vars()[0] : 1;
    farming *= global.city.ptrait.includes('trashed') ? planetTraits.trashed.vars()[0] : 1;
    farming *= racialTrait(global.civic.farmer.workers,'farmer');
    farming *= global.tech['agriculture'] >= 7 ? 1.1 : 1;
    farming *= global.race['low_light'] ? (1 - traits.low_light.vars()[0] / 100) : 1;
    return farming;
}

export function loadFoundry(){
    clearElement($('#foundry'));
    if ((global.city['foundry'] && global.city['foundry'].count > 0) || global.race['cataclysm'] || global.race['orbit_decayed']){
        var foundry = $(`<div class="job"><div class="foundry job_label"><h3 class="has-text-warning">${loc('craftsman_assigned')}</h3><span :class="level()">{{ f.crafting }} / {{ c.max }}</span></div></div>`);
        $('#foundry').append(foundry);

        let summer = eventActive('summer');
        let list = ['Plywood','Brick','Wrought_Iron','Sheet_Metal','Mythril','Aerogel','Nanoweave','Scarletite','Quantium'];
        if (summer){
            list.push('Thermite');
        }
        for (let i=0; i<list.length; i++){
            let res = list[i];
            if (global.resource[res].display || (summer && res === 'Thermite')){
                let name = global.resource[res].name;
                let resource = $(`<div class="job"></div>`);
                $('#foundry').append(resource);

                let controls = $('<div class="controls"></div>');
                let job_label;
                if (res === 'Scarletite' && global.portal.hasOwnProperty('hell_forge')){
                    job_label = $(`<div id="craft${res}" class="job_label"><h3 class="has-text-danger">${name}</h3><span class="count">{{ f.${res} }} / {{ p.on | maxScar }}</span></div>`);
                }
                else if (res === 'Quantium' && global.space.hasOwnProperty('zero_g_lab')){
                    job_label = $(`<div id="craft${res}" class="job_label"><h3 class="has-text-danger">${name}</h3><span class="count">{{ f.${res} }} / {{ e.on | maxQuantium }}</span></div>`);
                }
                else {
                    job_label = $(`<div id="craft${res}" class="job_label"><h3 class="has-text-danger">${name}</h3><span class="count">{{ f.${res} }}</span></div>`);
                }

                resource.append(job_label);
                resource.append(controls);
                $('#foundry').append(resource);

                let sub = $(`<span role="button" aria-label="remove ${res} craftsman" class="sub has-text-danger" @click="sub('${res}')"><span>&laquo;</span></span>`);
                let add = $(`<span role="button" aria-label="add ${res} craftsman" class="add has-text-success" @click="add('${res}')"><span>&raquo;</span></span>`);

                controls.append(sub);
                controls.append(add);
            }
        }
        vBind({
            el: `#foundry`,
            data: global.portal.hasOwnProperty('hell_forge') ? {
                f: global.city.foundry,
                c: global.civic.craftsman,
                p: global.portal.hell_forge,
            } : {
                f: global.city.foundry,
                c: global.civic.craftsman,
                e: global.space.hasOwnProperty('zero_g_lab') ? global.space.zero_g_lab : { count: 0, on: 0 },
            },
            methods: {
                add(res){
                    let keyMult = keyMultiplier();
                    let tMax = -1;
                    if (res === 'Scarletite'){
                        tMax = (p_on['hell_forge'] || 0);
                        if (global.race['high_pop']){
                            tMax *= traits.high_pop.vars()[0];
                        }
                    }
                    else if (res === 'Quantium'){
                        tMax = (Math.min(support_on['zero_g_lab'],p_on['zero_g_lab']) || 0);
                        if (global.race['high_pop']){
                            tMax *= traits.high_pop.vars()[0];
                        }
                    }
                    for (let i=0; i<keyMult; i++){
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
                },
                sub(res){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
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
                },
                level(){
                    if (global.civic.craftsman.workers === 0){
                        return 'count has-text-danger';
                    }
                    else if (global.civic.craftsman.workers === global.civic.craftsman.max){
                        return 'count has-text-success';
                    }
                    else if (global.civic.craftsman.workers <= global.civic.craftsman.max / 3){
                        return 'count has-text-caution';
                    }
                    else if (global.civic.craftsman.workers <= global.civic.craftsman.max * 0.66){
                        return 'count has-text-warning';
                    }
                    else if (global.civic.craftsman.workers < global.civic.craftsman.max){
                        return 'count has-text-info';
                    }
                    else {
                        return 'count';
                    }
                }
            },
            filters: {
                maxScar(v){
                    let cap = (p_on['hell_forge'] || 0);
                    if (global.race['high_pop']){
                        cap *= traits.high_pop.vars()[0];
                    }
                    return cap;
                },
                maxQuantium(v){
                    let cap = (Math.min(support_on['zero_g_lab'],p_on['zero_g_lab']) || 0);
                    if (global.race['high_pop']){
                        cap *= traits.high_pop.vars()[0];
                    }
                    return cap;
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
                        let cost = +(craft_cost[res][i].a * global.city.foundry[res] * speed / 140).toFixed(2);
                        total.append($(`<div>${loc('craftsman_hover_cost', [cost, global.resource[craft_cost[res][i].r].name])}<div>`));
                    }

                    return total;
                }

                craftingPopover(`craft${res}`,res,'auto',extra);
            }
        }

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
