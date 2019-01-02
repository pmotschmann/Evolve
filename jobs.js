import { global, vues } from './vars.js';

export const job_desc = {
    farmer: function(){
        let multiplier = (global.tech['hoe'] && global.tech['hoe'] > 0 ? global.tech['hoe'] * (1/3) : 0) + 1;
        let gain = +(global.civic.farmer.impact * multiplier).toFixed(1);
        return 'Farmers create food to feed your population. Each farmer generates '+gain+' food per tick.';
    },
    lumberjack: function(){
        let multiplier = (global.tech['axe'] && global.tech['axe'] > 0 ? (global.tech['axe'] - 1) * 0.25 : 0) + 1;
        let gain = +(global.civic.lumberjack.impact * multiplier).toFixed(1);
        return 'Lumberjacks harvet lumber from the forests. Each lumberjack generates '+gain+' lumber per tick.';
    },
    quarry_worker: function(){
        let multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.25 : 0) + 1;
        let gain = +(global.civic.quarry_worker.impact * multiplier).toFixed(1);
        return 'Quarry Workers mine stone from rock quarries. Each quarry worker generates '+gain+' stone per tick.';
    },
    miner: function(){
        return 'Miners dig up useful minerals from shafts dug deep in the ground. Each miner can generate a variable amount of minerals of various types.';
    },
    coal_miner: function(){
        return 'Coal miners are a special breed of miner, willing to work the dirtiest of mines to extract coal from deep in the ground.';
    },
    cement_worker: function(){
        let cement_multiplier = 1;
        let gain = global.civic.cement_worker.impact * cement_multiplier;
        return 'Cement plant workers turn stone into cement, each worker produces '+gain+' cement and consumes 3 stone per tick.';
    },
    banker: function(){
        let interest = global.civic.banker.impact * 100;
        return 'Bankers manage your banks increasing tax revenue. Each banker increases tax income by '+interest+'% per tax cycle.';
    },
    professor: function(){
        let impact = global.race['studious'] ? global.civic.professor.impact + 0.25 : global.civic.professor.impact;
        return 'Professors help educate your citizens and contribute to knowledge gain. Each professor generates '+impact+' knowledge per tick.';
    }
}

// Sets up jobs in civics tab
export function defineJobs(){
    $('#civic').append($('<div id="jobs" class="column"></div>'));
    loadUnemployed();
    loadJob('farmer','Farmer',3);
    loadJob('lumberjack','Lumberjack',1);
    loadJob('quarry_worker','Quarry Worker',1);
    loadJob('miner','Miner',1);
    loadJob('coal_miner','Coal Miner',0.2);
    loadJob('cement_worker','Cement Plant Worker',0.25);
    loadJob('professor','Professor',0.5);
    loadJob('banker','Banker',0.1);
}

function loadUnemployed(){
    var color = 'warning';
    
    var id = 'civ-free';
    var civ_container = $('<div id="' + id + '" class="job"></div>');
    var job_label = $('<div class="job_label"><span class="has-text-' + color + '">Unemployed</span><span class="count">{{ free }}</span></div>');
    civ_container.append(job_label);
    $('#jobs').append(civ_container);
    
    vues['civ_free'] = new Vue({
        data: global.civic,
    });
    vues['civ_free'].$mount('#'+id);
    
    var popper = $('<div id="pop'+id+'" class="popper has-background-light has-text-dark">The number of unemployed citizens. Unemployed citizens do not pay taxes.</div>');
    popper.hide();
    $('#main').append(popper);
    $('#'+id+' .job_label').on('mouseover',function(){
            popper.show();
            new Popper($('#'+id+' .job_label'),popper);
        });
    $('#'+id+' .job_label').on('mouseout',function(){
            popper.hide();
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
    
    var id = 'civ-' + job;
    
    var civ_container = $('<div id="' + id + '" v-show="display" class="job"></div>');
    var controls = $('<div class="controls"></div>');
    var job_label = $('<div class="job_label"><span class="has-text-' + color + '">{{ name }}</span><span class="count">{{ workers }} / {{ max }}</span></div>');
    civ_container.append(job_label);
    civ_container.append(controls);
    $('#jobs').append(civ_container);
    
    var sub = $('<span class="sub" @click="sub">&laquo;</span>');
    var add = $('<span class="add" @click="add">&raquo;</span>');
    
    controls.append(sub);
    controls.append(add);
    
    vues['civ_'+job] = new Vue({
        data: global.civic[job],
        methods: {
            add(){
                if (global.civic[job].workers < global['civic'][job].max && global.civic.free > 0){
                    global.civic[job].workers++;
                    global.civic.free--;
                }
            },
            sub(){
                if (global.civic[job].workers > 0){
                    global.civic[job].workers--;
                    global.civic.free++;
                }
            }
        }
    });
    vues['civ_'+job].$mount('#'+id);
    
    var popper = $('<div id="pop'+id+'" class="popper has-background-light has-text-dark">'+ job_desc[job]() +'</div>');
    popper.hide();
    $('#main').append(popper);
    $('#'+id+' .job_label').on('mouseover',function(){
            popper.show();
            new Popper($('#'+id+' .job_label'),popper);
        });
    $('#'+id+' .job_label').on('mouseout',function(){
            popper.hide();
        });
}
