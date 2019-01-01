import { global, vues, save, runNew } from './vars.js';
import { races, genus_traits, traits } from './races.js';
import { defineResources, resource_values } from './resources.js';
import { defineJobs, job_desc } from './jobs.js';
import { defineGovernment } from './civics.js';
import { actions, checkCityRequirements, checkTechRequirements, addAction } from './actions.js';
import { events } from './events.js';

var intervals = {};

if (runNew){
    newGame();
}

vues['vue_tabs'] = new Vue(global.main_tabs);
vues['vue_tabs'].$mount('#tabs');

// Load Resources
defineResources();
defineJobs();
defineGovernment();

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
                if (global.city['mill']){
                    food_multiplier *= 1 + (global.city['mill'].count * 0.03);
                }
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
                count = global.resource.Copper.amount + ((global.civic.miner.workers / 7) * copper_multiplier);
                if (count > global.resource.Copper.max){ count = global.resource.Copper.max; }
                global.resource.Copper.amount = count;
                
                // Iron
                if (global.resource.Iron.display){
                    var iron_multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.1 : 0) + 1;
                    iron_multiplier *= tax_multiplier;
                    count = global.resource.Iron.amount + ((global.civic.miner.workers / 4) * iron_multiplier);
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
                Lumber: 200,
                Stone: 200,
                Copper: 100,
                Iron: 100,
                Cement: 100
            };
            // labor caps
            var lCaps = {
                farmer: 0,
                lumberjack: 0,
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
                caps['Stone'] += (global.city['rock_quarry'].count * 100);
            }
            if (global.city['lumber_yard']){
                lCaps['lumberjack'] += global.city['lumber_yard'].count * 2;
                caps['Lumber'] += (global.city['lumber_yard'].count * 100);
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
                caps['Lumber'] += (global.city['shed'].count * (200 * multiplier));
                caps['Stone'] += (global.city['shed'].count * (200 * multiplier));
                caps['Copper'] += (global.city['shed'].count * (75 * multiplier));
                caps['Iron'] += (global.city['shed'].count * (100 * multiplier));
                caps['Cement'] += (global.city['shed'].count * (80 * multiplier));
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
                var tax_rate;
                switch(Number(global.civic.taxes.tax_rate)){
                    case 0:
                        tax_rate = 0;
                        tax_multiplier = 1.4;
                        break;
                    case 1:
                        tax_rate = 0.5;
                        tax_multiplier = 1.2;
                        break;
                    case 3:
                        tax_rate = 1.25;
                        tax_multiplier = 0.75;
                        break;
                    case 4:
                        tax_rate = 1.5;
                        tax_multiplier = 0.5;
                        break;
                    case 5:
                        tax_rate = 1.75;
                        tax_multiplier = 0.25;
                        break;
                    default:
                        tax_rate = 1;
                        tax_multiplier = 1;
                        break;
                }
                
                if (fed){
                    if (global.tech['banking'] && global.tech['banking'] >= 2){
                        income *= 1 + (global.civic.banker.workers * global.civic.banker.impact);
                    }
                }
                else {
                    income = income / 2;
                }
                
                income *= tax_rate;
                var count = global.resource.Money.amount + Math.round(income);
                if (count > global.resource.Money.max){ count = global.resource.Money.max; }
                global.resource.Money.amount = count;
            }
            
            // Market price fluctuation
            if (global.tech['currency'] && global.tech['currency'] >= 2){
                Object.keys(resource_values).forEach(function (res) {
                    if (global.resource[res].display && Math.rand(0,10) === 0){
                        let max = resource_values[res] * 2;
                        let min = resource_values[res] / 2;
                        let variance = (Math.rand(0,200) - 100) / 100;
                        let new_value = global.resource[res].value + variance;
                        if (new_value < min || new_value > max){
                            new_value = resource_values[res];
                        }
                        global.resource[res].value = new_value;
                    }
                });
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
                        case 'tax_rate':
                            if (global.civics.taxes.tax_rate !== [events[event].reqs[req]]){
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
