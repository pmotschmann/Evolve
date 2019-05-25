import { global, vues, keyMultiplier, poppers } from './vars.js';
import { racialTrait } from './races.js';
import { craftingRatio } from './resources.js';

export const job_desc = {
    farmer: function(){
        let multiplier = (global.tech['hoe'] && global.tech['hoe'] > 0 ? global.tech['hoe'] * (1/3) : 0) + 1;
        if (global.tech.agriculture >= 7){
            multiplier *= 1.1;
        }
        multiplier *= racialTrait(global.civic.farmer.workers,'farmer');
        let impact = global.city.biome === 'grassland' ? (global.civic.farmer.impact * 1.1) : global.civic.farmer.impact;
        let gain = +(impact * multiplier).toFixed(1);
        return `Farmers create food to feed your population. Each farmer generates ${gain} food per second.`;
    },
    lumberjack: function(){
        let multiplier = (global.tech['axe'] && global.tech['axe'] > 0 ? (global.tech['axe'] - 1) * 0.35 : 0) + 1;
        multiplier *= racialTrait(global.civic.lumberjack.workers,'lumberjack');
        let impact = global.city.biome === 'forest' ? (global.civic.lumberjack.impact * 1.1) : global.civic.lumberjack.impact;
        let gain = +(impact * multiplier).toFixed(1);
        return `Lumberjacks harvet lumber from the forests. Each lumberjack generates ${gain} lumber per second.`;
    },
    quarry_worker: function(){
        let multiplier = (global.tech['hammer'] && global.tech['hammer'] > 0 ? global.tech['hammer'] * 0.4 : 0) + 1;
        multiplier *= racialTrait(global.civic.quarry_worker.workers,'miner');
        if (global.tech['explosives'] && global.tech['explosives'] >= 2){
            multiplier *= global.tech['explosives'] >= 3 ? 1.75 : 1.5;
        }
        let gain = +(global.civic.quarry_worker.impact * multiplier).toFixed(1);
        return `Quarry Workers mine stone from rock quarries. Each quarry worker generates ${gain} stone per second.`;
    },
    miner: function(){
        if (global.tech['mining'] >= 3){
            return 'Miners dig up useful minerals from shafts dug deep in the ground. Each miner will extract copper and iron from the ground.';
        }
        else {
            return 'Miners dig up useful minerals from shafts dug deep in the ground. Each miner will extract copper from the ground.';
        }
    },
    coal_miner: function(){
        if (global.tech['uranium']){
            return 'Coal miners are a special breed of miner, willing to work the dirtiest of mines to extract coal and uranium from deep in the ground.';
        }
        else {
            return 'Coal miners are a special breed of miner, willing to work the dirtiest of mines to extract coal from deep in the ground.';
        }
    },
    craftsman: function(){
        return 'Craftsman can be assigned to craft various construction materials out of raw materials.';
    },
    cement_worker: function(){
        let impact = global.tech['cement'] >= 4 ? 1.2 : 1;
        let cement_multiplier = racialTrait(global.civic.quarry_worker.workers,'factory');
        let gain = global.civic.cement_worker.impact * impact * cement_multiplier;
        return `Cement plant workers turn stone into cement, each worker produces ${gain} cement and consumes 3 stone per second.`;
    },
    banker: function(){
        let interest = global.civic.banker.impact * 100;
        if (global.tech['banking'] >= 10){
            interest += 2 * global.tech['stock_exchange'];
        }
        return `Bankers manage your banks increasing tax revenue. Each banker increases tax income by ${interest}% per tax cycle.`;
    },
    entertainer: function(){
        let morale = global.tech['theatre'];
        return `Entertainers help combat the dreariness of everyday life. Each entertainer raise the morale of your citizens by ${morale}%.`;
    },
    professor: function(){
        let impact = +(global.race['studious'] ? global.civic.professor.impact + 0.25 : global.civic.professor.impact).toFixed(2);
        if (global.tech['science'] && global.tech['science'] >= 3){
            impact += global.city.library.count * 0.01;
        }
        impact *= racialTrait(global.civic.professor.workers,'science');
        if (global.tech['anthropology'] && global.tech['anthropology'] >= 3){
            impact *= 1 + (global.city.temple.count * 0.05);
        }
        impact = +impact.toFixed(2);
        return `Professors help educate your citizens and contribute to knowledge gain. Each professor generates ${impact} knowledge per second.`;
    },
    scientist: function(){
        let impact = global.civic.scientist.impact;
        impact *= racialTrait(global.civic.scientist.workers,'science');
        if (global.tech['science'] >= 6 && global.city['wardenclyffe']){
            impact *= 1 + (global.civic.professor.workers * global.city['wardenclyffe'].on * 0.01);
        }
        impact = +impact.toFixed(2);
        return `Scientists study the universe to expose it's secrets. Each scientist generates ${impact} knowledge per second.`;
    }
}

// Sets up jobs in civics tab
export function defineJobs(){
    $('#civics').append($('<div class="tile is-child"><div id="jobs" class="tile is-child"></div><div id="foundry" class="tile is-child"></div></div>'));
    loadUnemployed();
    loadJob('farmer','Farmer',1.35);
    loadJob('lumberjack','Lumberjack',1);
    loadJob('quarry_worker','Quarry Worker',1);
    loadJob('miner','Miner',1);
    loadJob('coal_miner','Coal Miner',0.2);
    loadJob('craftsman','Craftsman',1);
    loadJob('cement_worker','Cement Plant Worker',0.4);
    loadJob('entertainer','Entertainer',1);
    loadJob('professor','Professor',0.5);
    loadJob('scientist','Scientist',1);
    loadJob('banker','Banker',0.1);
    loadFoundry();
}

function loadUnemployed(){
    let color = 'warning';
    
    let id = 'civ-free';
    let civ_container = $(`<div id="${id}" class="job"></div>`);
    let job = global.race['carnivore'] ? 'Hunter' : 'Unemployed';
    let job_label = $(`<div class="job_label"><span class="has-text-${color}">${job}</span><span class="count">{{ free }}</span></div>`);
    civ_container.append(job_label);
    $('#jobs').append(civ_container);
    
    vues['civ_free'] = new Vue({
        data: global.civic,
    });
    vues['civ_free'].$mount(`#${id}`);
    
    $(`#${id} .job_label`).on('mouseover',function(){
            let text = global.race['carnivore'] ? 'Citizens not assigned to any other task will hunt for food. Military technology will boost effectiveness.' : 'The number of unemployed citizens. Unemployed citizens lower morale and do not pay taxes however they also consume half rations.';
            var popper = $(`<div id="pop${id}" class="popper has-background-light has-text-dark">${text}</div>`);
            $('#main').append(popper);
            popper.show();
            poppers[id] = new Popper($(`#${id} .job_label`),popper);
        });
    $(`#${id} .job_label`).on('mouseout',function(){
            $(`#pop${id}`).hide();
            poppers[id].destroy();
            $(`#pop${id}`).remove();
        });
}

function loadJob(job, name, impact, color){
    color = color || 'info';
    if (!global['civic'][job]){
        global['civic'][job] = {
            job: job,
            name: name,
            display: false,
            workers: 0,
            max: 0,
            impact: impact
        };
    }

    global.civic[job].impact = impact;
    
    if (job === 'craftsman'){
        return;
    }

    var id = 'civ-' + job;
    
    var civ_container = $(`<div id="${id}" v-show="display" class="job"></div>`);
    var controls = $('<div class="controls"></div>');
    if (job === 'farmer' || job === 'lumberjack' || job === 'quarry_worker'){
        let job_label = $(`<div class="job_label"><span class="has-text-${color}">{{ name }}</span><span class="count">{{ workers }}</span></div>`);
        civ_container.append(job_label);
    }
    else {
        let job_label = $(`<div class="job_label"><span class="has-text-${color}">{{ name }}</span><span class="count">{{ workers }} / {{ max }}</span></div>`);
        civ_container.append(job_label);
    }
    civ_container.append(controls);
    $('#jobs').append(civ_container);
    
    var sub = $('<span class="sub" @click="sub">&laquo;</span>');
    var add = $('<span class="add" @click="add">&raquo;</span>');
    
    controls.append(sub);
    controls.append(add);
    
    vues[`civ_+${job}`] = new Vue({
        data: global.civic[job],
        methods: {
            add(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if ((global['civic'][job].max === -1 || global.civic[job].workers < global['civic'][job].max) && global.civic.free > 0){
                        global.civic[job].workers++;
                        global.civic.free--;
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
                        global.civic.free++;
                    }
                    else {
                        break;
                    }
                }
            }
        }
    });
    vues[`civ_+${job}`].$mount(`#${id}`);
    
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
            $(`#pop${id}`).remove();
        });
}

export function loadFoundry(){
    if (vues['foundry']){
        vues['foundry'].$destroy();
    }
    $('#foundry').empty();
    if (global.city['foundry']){
        var foundry = $('<div class="job"><div class="foundry job_label"><span class="has-text-warning">Craftman Assigned</span><span class="count">{{ f.crafting }} / {{ f.count }}</span></div></div>');
        $('#foundry').append(foundry);

        let list = ['Plywood','Brick','Wrought_Iron','Sheet_Metal'];
        for (let i=0; i<list.length; i++){
            let res = list[i];
            if (global.resource[res].display){
                let name = res.replace("_", " ");
                let resource = $(`<div class="job"></div>`);
                $('#foundry').append(resource);

                let controls = $('<div class="controls"></div>');
                let job_label = $(`<div id="craft${res}" class="job_label" @mouseover="hover('${res}')" @mouseout="unhover('${res}')"><span class="has-text-danger">${name}</span><span class="count">{{ f.${res} }}</span></div>`);
                resource.append(job_label);
                resource.append(controls);
                $('#foundry').append(resource);
                
                let sub = $(`<span class="sub" @click="sub('${res}')">&laquo;</span>`);
                let add = $(`<span class="add" @click="add('${res}')">&raquo;</span>`);
                
                controls.append(sub);
                controls.append(add);
            }
        }
        vues['foundry'] = new Vue({
            data: {
                f: global.city.foundry,
                c: global.civic.craftsman
            },
            methods: {
                add(res){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if (global.city.foundry.crafting < global.city.foundry.count && global.civic.free > 0){
                            global.civic.craftsman.workers++;
                            global.city.foundry.crafting++;
                            global.city.foundry[res]++;
                            global.civic.free--;
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
                            global.civic.free++;
                        }
                        else {
                            break;
                        }
                    }
                },
                hover(res){
                    var popper = $(`<div id="popCraft${res}" class="popper has-background-light has-text-dark"></div>`);
                    $('#main').append(popper);
                    let name = res.replace("_", " ");
                    let multiplier = craftingRatio(res);
                    let final = +(global.city.foundry[res] * multiplier).toFixed(2);
                    popper.append($(`<div>+${final} ${name}/cycle</div>`));
    
                    popper.show();
                    poppers[`cr${res}`] = new Popper($(`#craft${res}`),popper);
                },
                unhover(res){
                    $(`#popCraft${res}`).hide();
                    poppers[`cr${res}`].destroy();
                    $(`#popCraft${res}`).remove();
                }
            }
        });
        vues['foundry'].$mount(`#foundry`);

        $(`#foundry .foundry`).on('mouseover',function(){
            var popper = $(`<div id="popFoundry" class="popper has-background-light has-text-dark"></div>`);
            $('#main').append(popper);
            popper.html('Craftman will work to produce the assigned resources, all produced materials will be delivered on the new moon each month.');
            popper.show();
            poppers['popFoundry'] = new Popper($(`#foundry .foundry`),popper);
        });
        $(`#foundry .foundry`).on('mouseout',function(){
            $(`#popFoundry`).hide();
            poppers['popFoundry'].destroy();
            $(`#popFoundry`).remove();
        });
    }
}
