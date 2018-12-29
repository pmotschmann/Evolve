import { global, vues, save, runNew } from './vars.js';
import { races, genus_traits, traits } from './races.js';
import { defineResources } from './resources.js';
import { actions, checkCityRequirements, checkTechRequirements, addAction } from './actions.js';
import { events } from './events.js';

var intervals = {};

const job_desc = {
    farmer: function(){
        var multiplier = (global.tech['hoe'] && global.tech['hoe'] > 0 ? global.tech['hoe'] * (1/3) : 0) + 1;
        var gain = +(global.civic.farmer.impact * multiplier).toFixed(1);
        return 'Farmers create food to feed your population. Each farmer generates '+gain+' food per tick.';
    },
    lumberjack: function(){
        var multiplier = (global.tech['axe'] && global.tech['axe'] > 0 ? (global.tech['axe'] - 1) * 0.25 : 0) + 1;
        var gain = +(global.civic.lumberjack.impact * multiplier).toFixed(1);
        return 'Lumberjacks harvet lumber from the forests. Each lumberjack generates '+gain+' lumber per tick.';
    },
    quarry_worker: function(){
        var multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.25 : 0) + 1;
        var gain = +(global.civic.quarry_worker.impact * multiplier).toFixed(1);
        return 'Quarry Workers mine stone from rock quarries. Each quarry worker generates '+gain+' stone per tick.';
    },
    miner: function(){
        return 'Miners dig up useful minerals from shafts dug deep in the ground. Each miner can generate a variable amount of minerals of various types.';
    },
    cement_worker: function(){
        var cement_multiplier = 1;
        var gain = global.civic.cement_worker.impact * cement_multiplier;
        return 'Cement plant workers turn stone into cement, each worker produces '+gain+' cement and consumes 3 stone per tick.';
    },
    banker: function(){
        var interest = global.civic.banker.impact * 100;
        return 'Bankers manage your banks increasing tax revenue. Each banker increases tax income by '+interest+'% per tax cycle.';
    },
    professor: function(){
        return 'Professors help educate your citizens and contribute to knowledge gain. Each professor generates '+global.civic.professor.impact+' knowledge per tick.';
    }
}



if (runNew){
    newGame();
}

vues['vue_tabs'] = new Vue(global.main_tabs);
vues['vue_tabs'].$mount('#tabs');

// Load Resources
defineResources();
defineJobs();

vues['race'] = new Vue({
    data: global.race,
    methods: {
        name: function(){
            return races[global.race.species].name;
        },
        desc: function(){
            return races[global.race.species].desc;
        }
    }
});
vues['race'].$mount('#race');

if (global.race.species === 'protoplasm'){
    global.resource.RNA.display = true;
    addAction('evolution','rna');
    var evolve_actions = ['dna','membrane','organelles','nucleus','eukaryotic_cell','mitochondria'];
    for (var i = 0; i < evolve_actions.length; i++) {
        if (global.race[evolve_actions[i]]){
            addAction('evolution',evolve_actions[i]);
        }
    }
    if (global.evolution['sexual_reproduction'] && !global.evolution['phagocytosis'] && !global.evolution['chloroplasts'] && !global.evolution['chitin']){
        addAction('evolution','sexual_reproduction');
    }
    else if (global.evolution['phagocytosis'] && global.evolution['phagocytosis'].count == 0){
        addAction('evolution','phagocytosis');
    }
    else if (global.evolution['chloroplasts'] && global.evolution['chloroplasts'].count == 0){
        addAction('evolution','chloroplasts');
    }
    else if (global.evolution['chitin'] && global.evolution['chitin'].count == 0){
        addAction('evolution','chitin');
    }
    else if ((global.evolution['phagocytosis'] || global.evolution['chloroplasts'] || global.evolution['chitin']) && !global.evolution['multicellular']){
        if (global.evolution['phagocytosis']){
            addAction('evolution','phagocytosis');
        }
        else if (global.evolution['chloroplasts']){
            addAction('evolution','chloroplasts');
        }
        else if (global.evolution['chitin']){
            addAction('evolution','chitin');
        }
    }
    else {
        var late_actions = ['multicellular','spores','poikilohydric','bilateral_symmetry','bryophyte','protostomes','deuterostome','vascular','homoiohydric','athropods','mammals','eggshell','sentience'];
        for (var i = 0; i < late_actions.length; i++) {
            if (global.race[late_actions[i]] && global.race[late_actions[i]].count == 0){
                addAction('evolution',late_actions[i]);
            }
        }
    }
}
else {
    Object.keys(actions.city).forEach(function (city) {
        if (checkCityRequirements(city)){
            addAction('city',city);
        }
    });
    Object.keys(actions.tech).forEach(function (tech) {
        if (checkTechRequirements(tech)){
            addAction('tech',tech);
        }
    });
}

// Start game loop
mainLoop();

// Main game loop
function mainLoop() {
    var fed = true;
    var tax_multiplier = 1;
    var main_timer = global.race['slow'] ? 1100 : (global.race['hyper'] ? 950 : 1000);
    intervals['main_loop'] = setInterval(function() {
            
        if (global.race.species === 'protoplasm'){
            // Early Evolution Game
            
            // Gain RNA & DNA
            if (global.evolution['nucleus'] && global['resource']['DNA'].amount < global['resource']['DNA'].max){
                var increment = global.evolution['nucleus'].count;
                while (global['resource']['RNA'].amount < increment * 2){
                    increment--;
                    if (increment <= 0){ break; }
                }
                var count = global['resource']['DNA'].amount + increment;
                if (count > global['resource']['DNA'].max){ count = global['resource']['DNA'].max; }
                global['resource']['DNA'].amount = count;
                global['resource']['RNA'].amount -= increment * 2;
            }
            if (global.evolution['organelles'] && global['resource']['RNA'].amount < global['resource']['RNA'].max){
                var count = global['resource']['RNA'].amount + global.evolution['organelles'].count;
                if (count > global['resource']['RNA'].max){ count = global['resource']['RNA'].max; }
                global['resource']['RNA'].amount = count;
            }
            // Detect new unlocks
            if (global['resource']['RNA'].amount >= 2 && !global.evolution['dna']){
                global.evolution['dna'] = 1;
                addAction('evolution','dna');
                global.resource.DNA.display = true;
            }
            else if (global['resource']['RNA'].amount >= 10 && !global.evolution['membrane']){
                global.evolution['membrane'] = { count: 0 };
                addAction('evolution','membrane');
            }
            else if (global['resource']['DNA'].amount >= 4 && !global.evolution['organelles']){
                global.evolution['organelles'] = { count: 0 };
                addAction('evolution','organelles');
            }
            else if (global.evolution['organelles'] && global.evolution['organelles'].count >= 2 && !global.evolution['nucleus']){
                global.evolution['nucleus'] = { count: 0 };
                addAction('evolution','nucleus');
            }
            else if (global.evolution['nucleus'] && global.evolution['nucleus'].count >= 1 && !global.evolution['eukaryotic_cell']){
                global.evolution['eukaryotic_cell'] = { count: 0 };
                addAction('evolution','eukaryotic_cell');
            }
            else if (global.evolution['eukaryotic_cell'] && global.evolution['eukaryotic_cell'].count >= 1 && !global.evolution['mitochondria']){
                global.evolution['mitochondria'] = { count: 0 };
                addAction('evolution','mitochondria');
            }
            else if (global.evolution['mitochondria'] && global.evolution['mitochondria'].count >= 1 && !global.evolution['sexual_reproduction']){
                global.evolution['sexual_reproduction'] = { count: 0 };
                addAction('evolution','sexual_reproduction');
            }
        }
        else {
            // Rest of game
            
            // Detect labor anomalies
            var total = 0;
            Object.keys(job_desc).forEach(function (job) {
                total += global.civic[job].workers;
                if (total > global.resource[races[global.race.species].name].amount){
                    global.civic[job].workers -= total - global.resource[races[global.race.species].name].amount;
                }
                global.civic.free = global.resource[races[global.race.species].name].amount - total;
            });
            
            // Consumption
            fed = true;
            if (global.resource[races[global.race.species].name].amount >= 1 || global.city['farm']){
                var consume = global.resource[races[global.race.species].name].amount * (global.race['gluttony'] ? ((global.race['gluttony'] * 0.25) + 1) : 1);
                if (global.race['photosynth']){
                    consume /= 2;
                }
                var food_multiplier = (global.tech['hoe'] && global.tech['hoe'] > 0 ? global.tech['hoe'] * (1/3) : 0) + 1;
                food_multiplier *= ((tax_multiplier - 1) / 2) + 1;
                var count = global.resource.Food.amount + (global.civic.farmer.workers * global.civic.farmer.impact * food_multiplier) - consume;
                if (count > global.resource.Food.max){ 
                    count = global.resource.Food.max;
                }
                else if (count < 0){
                    fed = false;
                    count = 0;
                }
                global.resource.Food.amount = count;
            }
            
            // Citizen Growth
            if (fed && global['resource']['Food'].amount > 10 && global['resource'][races[global.race.species].name].max > global['resource'][races[global.race.species].name].amount){
                var lowerBound = global.tech['reproduction'] ? global.tech['reproduction'] : 0;
                if(Math.rand(0,2 * global['resource'][races[global.race.species].name].amount) <= lowerBound){
                    global['resource'][races[global.race.species].name].amount++;
                }
            }
            
            // Resource Income
            if (fed){
                // Knowledge
                var know_multiplier = global.civic.professor.impact * tax_multiplier;
                var count = global.resource.Knowledge.amount + (global.civic.professor.workers * know_multiplier) + 1;
                if (count > global.resource.Knowledge.max){ count = global.resource.Knowledge.max; }
                global.resource.Knowledge.amount = count;
                
                // Cement
                if (global.resource.Cement.display && global.resource.Cement.amount < global.resource.Cement.max){
                    var consume = global.civic.cement_worker.workers * 3;
                    var workDone = global.civic.cement_worker.workers;
                    while (consume > global.resource.Stone.amount && consume > 0){
                        consume -= 3;
                        workDone--;
                    }
                    global.resource.Stone.amount -= consume;
                    var cement_multiplier = 1;
                    cement_multiplier *= tax_multiplier;
                    count = global.resource.Cement.amount + ((workDone * global.civic.cement_worker.impact) * cement_multiplier);
                    if (count > global.resource.Cement.max){ count = global.resource.Cement.max; }
                    global.resource.Cement.amount = count;
                }
                
                // Lumber
                var lum_multiplier = (global.tech['axe'] && global.tech['axe'] > 0 ? (global.tech['axe'] - 1) * 0.25 : 0) + 1;
                lum_multiplier *= tax_multiplier;
                count = global.resource.Lumber.amount + (global.civic.lumberjack.workers * global.civic.lumberjack.impact * lum_multiplier);
                if (count > global.resource.Lumber.max){ count = global.resource.Lumber.max; }
                global.resource.Lumber.amount = count;
                
                // Stone
                var stone_multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.25 : 0) + 1;
                stone_multiplier *= tax_multiplier;
                count = global.resource.Stone.amount + (global.civic.quarry_worker.workers * global.civic.quarry_worker.impact * stone_multiplier);
                if (count > global.resource.Stone.max){ count = global.resource.Stone.max; }
                global.resource.Stone.amount = count;
                
                // Copper
                var copper_multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.1 : 0) + 1;
                copper_multiplier *= tax_multiplier;
                count = global.resource.Copper.amount + ((global.civic.miner.workers / 5) * copper_multiplier);
                if (count > global.resource.Copper.max){ count = global.resource.Copper.max; }
                global.resource.Copper.amount = count;
                
                // Iron
                if (global.resource.Iron.display){
                    var iron_multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.1 : 0) + 1;
                    iron_multiplier *= tax_multiplier;
                    count = global.resource.Iron.amount + ((global.civic.miner.workers / 3) * iron_multiplier);
                    if (count > global.resource.Iron.max){ count = global.resource.Iron.max; }
                    global.resource.Iron.amount = count;
                }
            }
            
            // Detect new unlocks
            if (!global.main_tabs.data.showResearch && global.resource.Knowledge.amount >= 10){
                global.main_tabs.data.showResearch = true;
            }
        }
        
        // main resource delta tracking
        Object.keys(global.resource).forEach(function (res) {
            if (global['resource'][res].rate === 1){
                diffCalc(res,main_timer);
            }
        });
    }, main_timer);
    
    var mid_timer = global.race['slow'] ? 2200 : (global.race['hyper'] ? 1900 : 2000);
    intervals['mid_loop'] = setInterval(function() {
        if (global.race.species !== 'protoplasm'){
            
            // Resource caps
            var caps = {
                Money: 1000,
                Knowledge: 100,
                Food: 250,
                Lumber: 250,
                Stone: 250,
                Copper: 100,
                Iron: 100,
                Cement: 100
            };
            // labor caps
            var lCaps = {
                farmer: 0,
                lumberjack: 10,
                quarry_worker: 0,
                miner: 0,
                cement_worker: 0,
                banker: 0,
                professor: 0
            };
            caps[races[global.race.species].name] = 0;
            if (global.city['farm']){
                lCaps['farmer'] += global.city['farm'].count;
            }
            if (global.city['rock_quarry']){
                lCaps['quarry_worker'] += global.city['rock_quarry'].count;
            }
            if (global.city['mine']){
                lCaps['miner'] += global.city['mine'].count;
            }
            if (global.city['bank']){
                lCaps['banker'] += global.city['bank'].count;
            }
            if (global.city['cement_plant']){
                lCaps['cement_worker'] += global.city['cement_plant'].count * 3;
            }
            if (global.city['basic_housing']){
                caps[races[global.race.species].name] += global.city['basic_housing'].count;
            }
            if (global.city['cottage']){
                caps[races[global.race.species].name] += global.city['cottage'].count * 2;
            }
            if (global.city['apartments']){
                caps[races[global.race.species].name] += global.city['apartments'].count * 5;
            }
            if (global.city['shed']){
                var multiplier = (global.tech['storage'] - 1) * 0.5 + 1;
                caps['Lumber'] += (global.city['shed'].count * (250 * multiplier));
                caps['Stone'] += (global.city['shed'].count * (250 * multiplier));
                caps['Copper'] += (global.city['shed'].count * (100 * multiplier));
                caps['Iron'] += (global.city['shed'].count * (100 * multiplier));
                caps['Cement'] += (global.city['shed'].count * (100 * multiplier));
            }
            if (global.city['silo']){
                caps['Food'] += (global.city['silo'].count * 250);
            }
            if (global.city['university']){
                caps['Knowledge'] += (global.city['university'].count * 500);
                lCaps['professor'] += global.city['university'].count;
            }
            if (global.city['library']){
                caps['Knowledge'] += (global.city['library'].count * 125);
            }
            if (global.city['bank']){
                caps['Money'] += (global.city['bank'].count * (global.tech['banking'] >= 3 ? 2500 : 1000));
            }
            
            Object.keys(caps).forEach(function (res){
                global.resource[res].max = caps[res];
                if (global.resource[res].amount > global.resource[res].max){
                    global.resource[res].amount = global.resource[res].max;
                }
            });
            
            Object.keys(lCaps).forEach(function (job){
                global.civic[job].max = lCaps[job];
                if (global.civic[job].workers > global.civic[job].max){
                    global.civic[job].workers = global.civic[job].max;
                }
            });
            
            // medium resource delta tracking
            Object.keys(global.resource).forEach(function (res) {
                if (global['resource'][res].rate === 2){
                    diffCalc(res,mid_timer);
                }
            });
        }
    }, mid_timer);
    
    var long_timer = global.race['slow'] ? 5500 : (global.race['hyper'] ? 4750 : 5000);
    intervals['long_loop'] = setInterval(function() {
            
        if (global.race.species !== 'protoplasm'){
            // Tax Income
            if (global.tech['currency'] >= 1){
                var income = (global.resource[races[global.race.species].name].amount - global.civic.free) * ( global.race['greedy'] ? 1 : 2 );
                if (fed){
                    if (global.tech['banking'] && global.tech['banking'] >= 2){
                        income *= 1 + (global.civic.banker.workers * global.civic.banker.impact);
                    }
                }
                else {
                    income = income / 2;
                }
                var count = global.resource.Money.amount + Math.round(income);
                if (count > global.resource.Money.max){ count = global.resource.Money.max; }
                global.resource.Money.amount = count;
            }
        }
        
        // Event triggered
        if (Math.rand(0,global.event) === 0){
            var event_pool = [];
            Object.keys(events).forEach(function (event) {
                var isOk = true;
                Object.keys(events[event].reqs).forEach(function (req) {
                    switch(req){
                        case 'race':
                            if (events[event].reqs[req] !== global.race.species){
                                isOk = false;
                            }
                            break;
                        case 'resource':
                            if (!global.resource[events[event].reqs[req]] || !global.resource[events[event].reqs[req]].display){
                                isOk = false;
                            }
                            break;
                        case 'tech':
                            if (!global.tech[events[event].reqs[req]]){
                                isOk = false;
                            }
                            break;
                        default:
                            isOk = false;
                            break;
                    }
                });
                if (isOk){
                    event_pool.push(event);
                }
            });
            if (event_pool.length > 0){
                var msg = events[event_pool[Math.floor(Math.seededRandom(0,event_pool.length))]].effect();
                messageQueue(msg);
            }
            global.event = 999;
        }
        else {
            global.event--;
        }
        
        // slow resource delta tracking
        Object.keys(global.resource).forEach(function (res) {
            if (global['resource'][res].rate === 3){
                diffCalc(res,long_timer);
            }
        });
        
        // Save game state
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    }, long_timer);
}


// Sets up jobs in civics tab
function defineJobs(){
    loadUnemployed();
    loadJob('farmer','Farmer',3);
    loadJob('lumberjack','Lumberjack',1);
    loadJob('quarry_worker','Quarry Worker',1);
    loadJob('miner','Miner',1);
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
    $('#civic').append(civ_container);
    
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
    $('#civic').append(civ_container);
    
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



function diffCalc(res,period){
    if (global['resource'][res].amount !== global['resource'][res].max && global['resource'][res].amount !== 0){
        global['resource'][res].diff = +((global['resource'][res].amount - global['resource'][res].last) / (period / 1000)).toFixed(2);
        global['resource'][res].last = global['resource'][res].amount;
    }
    if (global['resource'][res].diff < 0 && !$('#res-'+res+' .diff').hasClass('has-text-danger')){
        $('#res-'+res+' .diff').addClass('has-text-danger');
    }
    else if (global['resource'][res].diff >= 0 && $('#res-'+res+' .diff').hasClass('has-text-danger')){
        $('#res-'+res+' .diff').removeClass('has-text-danger');
    }
}

function messageQueue(msg){
    var new_message = $('<p class="has-text-warning">'+msg+'</p>');
    $('#msgQueue').prepend(new_message);
}

function newGame(){
    global['race'] = { species : 'protoplasm', gods: 'none' };
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;
}

window.cheat = function cheat(){
    global.resource.DNA.max = 10000;
    global.resource.RNA.max = 10000;
    global.resource.DNA.amount = 10000;
    global.resource.RNA.amount = 10000;
}
