import { global, keyMultiplier, poppers } from './vars.js';
import { clearElement, easterEgg } from './functions.js';
import { loc } from './locale.js';
import { racialTrait, races, traits } from './races.js';
import { craftingRatio, craftCost } from './resources.js';

export const job_desc = {
    farmer: function(){
        let farmer = +farmerValue(true).toFixed(2);
        let farmhand = +farmerValue(false).toFixed(2);
        let desc = loc('job_farmer_desc',[farmer,global.resource.Food.name,global.city.farm.count,farmhand]);
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
            let impact = global.city.biome === 'forest' ? (global.civic.lumberjack.impact * 1.1) : global.civic.lumberjack.impact;
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
        if (global.tech['explosives'] && global.tech['explosives'] >= 2){
            multiplier *= global.tech['explosives'] >= 3 ? 1.75 : 1.5;
        }
        let gain = +(global.civic.quarry_worker.impact * multiplier).toFixed(1);
        let desc = loc('job_quarry_worker_desc',[gain,global.resource.Stone.name]);
        if (global.civic.d_job === 'quarry_worker'){
            desc = desc + ' ' + loc('job_default',[loc('job_quarry_worker')]);
        }
        return desc;
    },
    scavenger: function(){
        let scavanger = global.civic.scavenger.impact;
        if (global.city.ptrait === 'trashed' && global.race['scavanger']){
            scavanger *= 1.25;
        }
        let desc = loc('job_scavenger_desc',[races[global.race.species].home,scavanger]);
        if (global.civic.d_job === 'scavenger'){
            desc = desc + ' ' + loc('job_default',[loc('job_scavenger')]);
        }
        return desc;
    },
    miner: function(){
        if (global.tech['mining'] >= 3){
            return loc('job_miner_desc2');
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
        let impact = global.tech['cement'] >= 4 ? 1.2 : 1;
        let cement_multiplier = racialTrait(global.civic.cement_worker.workers,'factory');
        let gain = global.civic.cement_worker.impact * impact * cement_multiplier;
        gain = +(gain).toFixed(2);
        return loc('job_cement_worker_desc',[gain]);
    },
    banker: function(){
        let interest = global.civic.banker.impact * 100;
        if (global.tech['banking'] >= 10){
            interest += 2 * global.tech['stock_exchange'];
        }
        if (global.race['truthful']){
            interest *= 1 - (traits.truthful.vars[0] / 100);
        }
        if (global.civic.govern.type === 'republic'){
            interest *= 1.25;
        }
        interest = +(interest).toFixed(0);
        return loc('job_banker_desc',[interest]);
    },
    entertainer: function(){
        let morale = global.race['musical'] ? global.tech['theatre'] + 1: global.tech['theatre'];
        return global.tech['superstar'] ? loc('job_entertainer_desc2',[morale,1]) : loc('job_entertainer_desc',[morale]);
    },
    priest: function(){
        return loc('job_priest_desc');
    },
    professor: function(){
        let impact = +(global.race['studious'] ? global.civic.professor.impact + traits.studious.vars[0] : global.civic.professor.impact).toFixed(2);
        if (global.tech['science'] && global.tech['science'] >= 3){
            impact += global.city.library.count * 0.01;
        }
        impact *= global.race['pompous'] ? (1 - traits.pompous.vars[0] / 100) : 1;
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
            impact *= 0.5;
        }
        impact = +impact.toFixed(2);
        return loc('job_scientist_desc',[impact]);
    },
    colonist(){
        return loc('job_colonist_desc',[races[global.race.species].solar.red]);
    },
    space_miner(){
        return loc('job_space_miner_desc');
    },
    hell_surveyor(){
        return loc('job_hell_surveyor_desc');
    },
    crew(){
        return loc('job_crew_desc');
    }
}

// Sets up jobs in civics tab
export function defineJobs(){
    $('#civics').append($(`<h2 class="is-sr-only">${loc('civics_jobs')}</h2><div class="tile is-child"><div id="jobs" class="tile is-child"></div><div id="foundry" class="tile is-child"></div></div>`));
    loadUnemployed();
    loadJob('farmer',0.82,5);
    loadJob('lumberjack',1,5);
    loadJob('quarry_worker',1,5);
    loadJob('scavenger',0.12,5);
    loadJob('miner',1,4,'advanced');
    loadJob('coal_miner',0.2,4,'advanced');
    loadJob('craftsman',1,5,'advanced');
    loadJob('cement_worker',0.4,5,'advanced');
    loadJob('entertainer',1,10,'advanced');
    loadJob('priest',1,3,'advanced');
    loadJob('professor',0.5,6,'advanced');
    loadJob('scientist',1,5,'advanced');
    loadJob('banker',0.1,6,'advanced');
    loadJob('colonist',1,5,'advanced');
    loadJob('space_miner',1,5,'advanced');
    loadJob('hell_surveyor',1,1,'advanced');
    loadJob('crew',1,4,'alert');
    loadFoundry();
}

function loadUnemployed(){
    let color = 'warning';
    
    let id = 'civ-free';
    let civ_container = $(`<div id="${id}" class="job"></div>`);
    let job_label = $(`<div class="job_label"><h3><a class="has-text-${color}" @click="setDefault()">{{ 'job' | title }}{{ 'unemployed' | d_state }}</a></h3><span class="count" v-html="$options.filters.event(free)"></span></div>`);
    civ_container.append(job_label);
    $('#jobs').append(civ_container);
    
    new Vue({
        el: `#${id}`,
        data: global.civic,
        methods: {
            setDefault(){
                global.civic.d_job = 'unemployed';
            }
        },
        filters: {
            title(){
                return global.race['carnivore'] || global.race['soul_eater'] ? loc('job_hunter') : loc('job_unemployed');
            },
            d_state(j){
                return global.civic.d_job === j ? '*' : '';
            },
            event(c){
                let egg = easterEgg(3,14);
                if (c === 0 && egg.length > 0){
                    return egg;
                }
                else {
                    return c;
                }
            }
        }
    });
    
    $(`#${id} .job_label`).on('mouseover',function(){
            let text = global.race['carnivore'] || global.race['soul_eater'] ? (global.race['soul_eater'] ? (global.race.species === 'wendigo' ? loc('job_hunter_desc') : loc('job_evil_hunter_desc')) : loc('job_hunter_desc')) : loc('job_unemployed_desc');
            if (global.civic.d_job === 'unemployed'){
                text = text + ' ' + loc('job_default',[global.race['carnivore'] || global.race['soul_eater'] ? loc('job_hunter') : loc('job_unemployed')]);
            }
            var popper = $(`<div id="pop${id}" class="popper has-background-light has-text-dark">${text}</div>`);
            $('#main').append(popper);
            popper.show();
            poppers[id] = new Popper($(`#${id} .job_label`),popper);
        });
    $(`#${id} .job_label`).on('mouseout',function(){
            $(`#pop${id}`).hide();
            poppers[id].destroy();
            clearElement($(`#pop${id}`),true);
        });
}

function loadJob(job, impact, stress, color){
    color = color || 'info';
    if (!global['civic'][job]){
        global['civic'][job] = {
            job: job,
            display: false,
            workers: 0,
            max: 0,
            impact: impact
        };
    }

    let job_name = job === 'lumberjack' && global.race['evil'] ? loc('job_reclaimer') : loc('job_' + job);
    global['civic'][job].name = job_name;

    if (!global.civic[job]['assigned']){
        global.civic[job]['assigned'] = job === 'craftsman'? 0 : global.civic[job].workers;
    }

    global.civic[job]['stress'] = stress;
    global.civic[job].impact = impact;
    
    if (job === 'craftsman'){
        return;
    }

    var id = 'civ-' + job;
    
    var civ_container = $(`<div id="${id}" v-show="display" class="job"></div>`);
    var controls = $('<div class="controls"></div>');
    if (job === 'farmer' || job === 'lumberjack' || job === 'quarry_worker' || job === 'scavenger'){
        let job_label = $(`<div class="job_label"><h3><a class="has-text-${color}" @click="setDefault('${job}')">{{ name }}{{ '${job}' | d_state }}</a></h3><span class="count">{{ workers }}</span></div>`);
        civ_container.append(job_label);
    }
    else {
        let job_label = $(`<div class="job_label"><h3 class="has-text-${color}">{{ name }}</h3><span :class="level('${job}')">{{ workers }} / {{ max }}</span></div>`);
        civ_container.append(job_label);
    }
    civ_container.append(controls);
    $('#jobs').append(civ_container);
    
    if (job !== 'crew'){
        var sub = $(`<span role="button" aria-label="remove ${job}" class="sub has-text-danger" @click="sub"><span>&laquo;</span></span>`);
        var add = $(`<span role="button" aria-label="add ${job}" class="add has-text-success" @click="add"><span>&raquo;</span></span>`);
        controls.append(sub);
        controls.append(add);
    }
    
    new Vue({
        el: `#${id}`,
        data: global.civic[job],
        methods: {
            add(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if ((global['civic'][job].max === -1 || global.civic[job].workers < global['civic'][job].max) && (global.civic.free > 0 || (global.civic[global.civic.d_job] && global.civic[global.civic.d_job].workers > 0))){
                        global.civic[job].workers++;
                        if (global.civic.free > 0){
                            global.civic.free--;
                        }
                        else {
                            global.civic[global.civic.d_job].workers--;
                        }
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
                        if (global.civic.d_job === 'unemployed' || job === global.civic.d_job){
                            global.civic.free++;
                        }
                        else {
                            global.civic[global.civic.d_job].workers++;
                        }
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
            }
        },
        filters: {
            d_state(j){
                return global.civic.d_job === j ? '*' : '';
            }
        }
    });
    
    $(`#${id} .job_label`).on('mouseover',function(){
            var popper = $(`<div id="pop${id}" class="popper has-background-light has-text-dark"></div>`);
            $('#main').append(popper);
            popper.html(job_desc[job]());
            popper.show();
            poppers[id] = new Popper($(`#${id} .job_label`),popper);
        });
    $(`#${id} .job_label`).on('mouseout',function(){
            $(`#pop${id}`).hide();
            poppers[id].destroy();
            clearElement($(`#pop${id}`),true);
        });
}

export function farmerValue(farm){
    let farming = global.civic.farmer.impact;
    if (farm){
        farming += global.tech['agriculture'] >= 2 ? 1.15 : 0.65;
    }
    farming *= (global.tech['hoe'] && global.tech['hoe'] > 0 ? global.tech['hoe'] * (1/3) : 0) + 1;
    farming *= global.city.biome === 'grassland' ? 1.1 : 1;
    farming *= global.city.biome === 'hellscape' ? 0.25 : 1;
    farming *= global.city.ptrait === 'trashed' ? 0.75 : 1;
    farming *= racialTrait(global.civic.farmer.workers,'farmer');
    farming *= global.tech['agriculture'] >= 7 ? 1.1 : 1;
    farming *= global.race['low_light'] ? (1 - traits.low_light.vars[0] / 100) : 1;
    return farming;
}

var v_foundry;
export function loadFoundry(){
    if (v_foundry){
        v_foundry.$destroy();
    }
    clearElement($('#foundry'));
    if (global.city['foundry']){
        var foundry = $(`<div class="job"><div class="foundry job_label"><h3 class="has-text-warning">${loc('craftsman_assigned')}</h3><span :class="level()">{{ f.crafting }} / {{ c.max }}</span></div></div>`);
        $('#foundry').append(foundry);

        let list = ['Plywood','Brick','Wrought_Iron','Sheet_Metal','Mythril','Aerogel','Nanoweave'];
        for (let i=0; i<list.length; i++){
            let res = list[i];
            if (global.resource[res].display){
                let name = global.resource[res].name;
                let resource = $(`<div class="job"></div>`);
                $('#foundry').append(resource);

                let controls = $('<div class="controls"></div>');
                let job_label = $(`<div id="craft${res}" class="job_label" @mouseover="hover('${res}')" @mouseout="unhover('${res}')"><h3 class="has-text-danger">${name}</h3><span class="count">{{ f.${res} }}</span></div>`);
                resource.append(job_label);
                resource.append(controls);
                $('#foundry').append(resource);
                
                let sub = $(`<span role="button" aria-label="remove ${res} craftsman" class="sub has-text-danger" @click="sub('${res}')"><span>&laquo;</span></span>`);
                let add = $(`<span role="button" aria-label="add ${res} craftsman" class="add has-text-success" @click="add('${res}')"><span>&raquo;</span></span>`);
                
                controls.append(sub);
                controls.append(add);
            }
        }
        v_foundry = new Vue({
            el: `#foundry`,
            data: {
                f: global.city.foundry,
                c: global.civic.craftsman
            },
            methods: {
                add(res){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if (global.city.foundry.crafting < global.civic.craftsman.max && (global.civic.free > 0 || (global.civic[global.civic.d_job] && global.civic[global.civic.d_job].workers > 0))){
                            global.civic.craftsman.workers++;
                            global.city.foundry.crafting++;
                            global.city.foundry[res]++;
                            if (global.civic.free > 0){
                                global.civic.free--;
                            }
                            else {
                                global.civic[global.civic.d_job].workers--;
                            }
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
                            if (global.civic.d_job === 'unemployed'){
                                global.civic.free++;
                            }
                            else {
                                global.civic[global.civic.d_job].workers++;
                            }
                        }
                        else {
                            break;
                        }
                    }
                },
                hover(res){
                    var popper = $(`<div id="popCraft${res}" class="popper has-background-light has-text-dark"></div>`);
                    $('#main').append(popper);
                    let name = global.resource[res].name;
                    let multiplier = craftingRatio(res,true);
                    let speed = global.genes['crafty'] ? 2 : 1;
                    let final = +(global.city.foundry[res] * multiplier * speed / 140).toFixed(2);
                    let bonus = (multiplier * speed * 100).toFixed(0);
                    
                    popper.append($(`<div>${loc('craftsman_hover_bonus', [bonus, name])}</div>`));
                    popper.append($(`<div>${loc('craftsman_hover_prod', [final, name])}</div>`));
                    let craft_cost = craftCost();
                    for (let i=0; i<craft_cost[res].length; i++){
                        let cost = +(craft_cost[res][i].a * global.city.foundry[res] * speed / 140).toFixed(2);
                        popper.append($(`<div>${loc('craftsman_hover_cost', [cost, global.resource[craft_cost[res][i].r].name])}<div>`));
                    }
    
                    popper.show();
                    poppers[`cr${res}`] = new Popper($(`#craft${res}`),popper);
                },
                unhover(res){
                    $(`#popCraft${res}`).hide();
                    poppers[`cr${res}`].destroy();
                    clearElement($(`#popCraft${res}`),true);
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
            }
        });

        $(`#foundry .foundry`).on('mouseover',function(){
            var popper = $(`<div id="popFoundry" class="popper has-background-light has-text-dark"></div>`);
            $('#main').append(popper);
            popper.html(loc('job_craftsman_hover'));
            popper.show();
            poppers['popFoundry'] = new Popper($(`#foundry .foundry`),popper);
        });
        $(`#foundry .foundry`).on('mouseout',function(){
            $(`#popFoundry`).hide();
            poppers['popFoundry'].destroy();
            clearElement($(`#popFoundry`),true);
        });
    }
}
