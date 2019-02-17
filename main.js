import { global, vues, save, poppers, runNew, messageQueue, modRes } from './vars.js';
import { races, racialTrait } from './races.js';
import { defineResources, resource_values } from './resources.js';
import { defineJobs, job_desc } from './jobs.js';
import { defineGovernment, defineGarrison, armyRating } from './civics.js';
import { actions, checkCityRequirements, checkTechRequirements, addAction } from './actions.js';
import { events } from './events.js';

var intervals = {};

if (runNew){
    newGame();
}

let settings = {
    data: global.settings,
    methods: {
        dark(){
            global.settings.theme = 'dark';
            $('html').removeClass();
            $('html').addClass('dark');
        },
        light(){
            global.settings.theme = 'light';
            $('html').removeClass();
            $('html').addClass('light');
        }
    },
    filters: {
        namecase(name){
            return name.replace(/(?:^|\s)\w/g, function(match) {
                return match.toUpperCase();
            });
        }
    }
}

vues['vue_tabs'] = new Vue(settings);
vues['vue_tabs'].$mount('#tabs');

// Load Resources
defineResources();
$('#civic').append($('<div id="civics" class="tile is-parent"></div>'));
defineJobs();
$('#civics').append($('<div id="r_civics" class="tile is-vertical is-parent"></div>'));
defineGovernment();
defineGarrison();

vues['race'] = new Vue({
    data: {
        race: global.race,
        city: global.city
    },
    methods: {
        name(){
            return races[global.race.species].name;
        },
        desc(){
            return races[global.race.species].desc;
        }
    }
});
vues['race'].$mount('#race');

vues['topBar'] = new Vue({
    data: {
        city: global.city,
        race: global.race
    },
    methods: {
        weather(){
            switch(global.city.calendar.weather){
                case 0:
                    if (global.city.calendar.temp === 0){
                        return 'Snow'; //, snow has an adversely negative effect on food production.';
                    }
                    else {
                        return 'Rain';
                    }
                case 1:
                    return 'Cloudy';
                case 2:
                    return 'Sunny';
            }
        },
        temp(){
            switch(global.city.calendar.temp){
                case 0:
                    return 'Cold';// weather, cold weather may reduce food output.';
                case 1:
                    return 'Moderate temperature';
                case 2:
                    return 'Hot';// weather, hot weather may reduce worker productivity.';
            }
        }
    },
    filters: {
        planet(species){
            return races[species].home;
        }
    }
});
vues['topBar'].$mount('#topBar');

$('#topBar .planet').on('mouseover',function(){
    var popper = $(`<div id="topbarPlanet" class="popper has-background-light has-text-dark"></div>`);
    $('#main').append(popper);
    let planet = races[global.race.species].home;
    let race = races[global.race.species].name;
    let biome = global.city.biome;
    if (global.race.species === 'protoplasm'){
        popper.append($(`<span>Life on this planet is in it's infancy and still evolving</span>`));
    }
    else {
        popper.append($(`<span>${planet} is the home planet of the ${race} people. It is a ${biome} planet with an orbital period of 365 days.</span>`));
    }
    popper.show();
    poppers['topbarPlanet'] = new Popper($('#topBar .planet'),popper);

});
$('#topBar .planet').on('mouseout',function(){
    $(`#topbarPlanet`).hide();
    poppers['topbarPlanet'].destroy();
    $(`#topbarPlanet`).remove();
});

if (global.race.species === 'protoplasm'){
    global.resource.RNA.display = true;
    addAction('evolution','rna');
    var evolve_actions = ['dna','membrane','organelles','nucleus','eukaryotic_cell','mitochondria'];
    for (var i = 0; i < evolve_actions.length; i++) {
        if (global.evolution[evolve_actions[i]]){
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
    var p_on = {};
    var main_timer = global.race['slow'] ? 275 : (global.race['hyper'] ? 240 : 250);
    intervals['main_loop'] = setInterval(function(){
        var global_multiplier = 1;
        var time_multiplier = 0.25;
            
        if (global.race.species === 'protoplasm'){
            // Early Evolution Game
            
            // Gain RNA & DNA
            if (global.evolution['nucleus'] && global['resource']['DNA'].amount < global['resource']['DNA'].max){
                var increment = global.evolution['nucleus'].count;
                while (global['resource']['RNA'].amount < increment * 2){
                    increment--;
                    if (increment <= 0){ break; }
                }
                modRes('DNA',increment * global_multiplier * time_multiplier);
                modRes('RNA',-(increment * 2 * time_multiplier));
            }
            if (global.evolution['organelles']){
                modRes('RNA',global.evolution['organelles'].count * global_multiplier * time_multiplier);
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
            let power_grid = 0;

            if (global.city['coal_power']){
                let power = global.city.coal_power.on * actions.city.coal_power.powered;
                let consume = global.city.coal_power.on * 0.35 * time_multiplier;
                while (consume > global.resource.Coal.amount && consume > 0){
                    power += actions.city.coal_power.powered;
                    consume -= 0.35 * time_multiplier;
                }
                power_grid -= power;
                modRes('Coal',-(consume));
            }

            if (global.city['oil_power']){
                let power = global.city.oil_power.on * actions.city.oil_power.powered;
                let consume = global.city.oil_power.on * 0.75 * time_multiplier;
                while (consume > global.resource.Oil.amount && consume > 0){
                    power += actions.city.oil_power.powered;
                    consume -= 0.75 * time_multiplier;
                }
                power_grid -= power;
                modRes('Oil',-(consume));
            }

            let p_structs = ['apartment','wardenclyffe','rock_quarry','mine','coal_mine','sawmill'];
            for (var i = 0; i < p_structs.length; i++) {
                if (global.city[p_structs[i]] && global.city[p_structs[i]]['on']){
                    let power = global.city[p_structs[i]].on * actions.city[p_structs[i]].powered;
                    p_on[p_structs[i]] = global.city[p_structs[i]].on;
                    while (power > power_grid && power > 0){
                        power -= actions.city[p_structs[i]].powered;
                        p_on[p_structs[i]]--;
                    }
                    power_grid -= global.city[p_structs[i]].on * actions.city[p_structs[i]].powered;
                    if (p_on[p_structs[i]] !== global.city[p_structs[i]].on){
                        $(`#city-${p_structs[i]} .on`).addClass('warn');
                    }
                    else {
                        $(`#city-${p_structs[i]} .on`).removeClass('warn');
                    }
                }
            }

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
                var consume = (global.resource[races[global.race.species].name].amount + global.civic.garrison.workers - (global.civic.free * 0.5)) * (global.race['gluttony'] ? ((global.race['gluttony'] * 0.25) + 1) : 1);
                if (global.race['high_metabolism']){
                    consume *= 1.1;
                }
                if (global.race['photosynth']){
                    switch(global.city.calendar.weather){
                        case 0:
                            consume *= global.city.calendar.temp === 0 ? 1 : 0.9;
                            break;
                        case 1:
                            consume *= 0.8;
                            break;
                        case 2:
                            consume *= 0.6;
                            break;
                    }
                }
                consume *= time_multiplier;
                var food_multiplier = (global.tech['hoe'] && global.tech['hoe'] > 0 ? global.tech['hoe'] * (1/3) : 0) + 1;
                if (global.city.calendar.temp === 0){
                    if (global.city.calendar.weather === 0){
                        food_multiplier *= 0.7;
                    }
                    else {
                        food_multiplier *= 0.85;
                    }
                }
                if (global.city.calendar.weather === 2){
                    food_multiplier *= 1.1;
                }
                if (global.city['mill']){
                    let mill_bonus = global.tech['agriculture'] >= 5 ? 0.05 : 0.03;
                    food_multiplier *= 1 + (global.city['mill'].count * mill_bonus);
                }
                food_multiplier *= ((tax_multiplier - 1) / 2) + 1;
                food_multiplier *= racialTrait(global.civic.farmer.workers,'farmer');
                let impact = global.city.biome === 'grassland' ? (global.civic.farmer.impact * 1.1) : global.civic.farmer.impact;
                let hunting = global.race['herbivore'] ? 0 : armyRating(global.civic.garrison.workers,'hunting') / 3;
                var delta = (global.civic.farmer.workers * impact * food_multiplier) + hunting;
                delta = (delta * global_multiplier * time_multiplier) - consume;

                if (modRes('Food',delta)){
                    fed = false;
                }
            }
            
            if (global.race['lazy'] && Math.rand(0, 25) <= 1){
                // Cats are lazy and periodically go into food comas.
                fed = false;
            }

            // Citizen Growth
            if (fed && global['resource']['Food'].amount > 0 && global['resource'][races[global.race.species].name].max > global['resource'][races[global.race.species].name].amount){
                var lowerBound = global.tech['reproduction'] ? global.tech['reproduction'] : 0;
                if (global.race['fast_growth']){
                    lowerBound *= 2;
                    lowerBound += 2;
                }
                if(Math.rand(0, global['resource'][races[global.race.species].name].amount) <= lowerBound){
                    global['resource'][races[global.race.species].name].amount++;
                }
            }
            
            // Resource Income
            let hunger = fed ? 1 : 0.5;
            if (global.race['angry'] && fed === false){
                hunger = 0.25;
            }

            if (global.resource.Furs.display){
                let fur_multiplier = hunger;
                let hunting = armyRating(global.civic.garrison.workers,'hunting') / 10;
                let delta = hunting * fur_multiplier * global_multiplier * time_multiplier;
                modRes('Furs',delta);
            }

            // Knowledge
            var know_multiplier = (global.race['studious'] ? global.civic.professor.impact + 0.25 : global.civic.professor.impact) * tax_multiplier;
            know_multiplier *= racialTrait(global.civic.professor.workers,'science');
            know_multiplier *= hunger;
            var delta = (global.civic.professor.workers * know_multiplier) + 1;
            let adjunct = 1;
            if (global.tech['science'] >= 6 && global.city['wardenclyffe']){
                adjunct = 1 + (global.civic.professor.workers * p_on['wardenclyffe'] * 0.01);
            }
            delta += global.civic.scientist.workers * racialTrait(global.civic.scientist.workers,'science') * tax_multiplier * global_multiplier * time_multiplier * adjunct;
            modRes('Knowledge',delta);
            
            // Cement
            if (global.resource.Cement.display && global.resource.Cement.amount < global.resource.Cement.max){
                var consume = global.civic.cement_worker.workers * 3 * time_multiplier;
                var workDone = global.civic.cement_worker.workers;
                while (consume > global.resource.Stone.amount && consume > 0){
                    consume -= 3 * time_multiplier;
                    workDone--;
                }
                modRes('Stone',-(consume));
                
                var cement_multiplier = 1;
                cement_multiplier *= tax_multiplier;
                cement_multiplier *= racialTrait(global.civic.cement_worker.workers,'factory');
                cement_multiplier *= hunger;
                delta = (workDone * global.civic.cement_worker.impact) * cement_multiplier * global_multiplier * time_multiplier;
                modRes('Cement',delta);
            }
            
            // Smelters
            let iron_smelter = 0;
            if (global.city['smelter'] && global.city['smelter'].count > 0){
                let consume_wood = global.city['smelter'].Wood * 3 * time_multiplier;
                let consume_coal = global.city['smelter'].Coal * 0.25 * time_multiplier;
                let consume_oil = global.city['smelter'].Oil * 0.35 * time_multiplier;
                iron_smelter = global.city['smelter'].Iron;
                let steel_smelter = global.city['smelter'].Steel;
                while (iron_smelter + steel_smelter > global.city['smelter'].Wood + global.city['smelter'].Coal ){
                    if (steel_smelter > 0){
                        steel_smelter--;
                    }
                    else {
                        iron_smelter--;
                    }
                }
                while (consume_wood > global.resource.Lumber.amount && consume_wood > 0){
                    consume_wood -= 3 * time_multiplier;
                    if (steel_smelter > 0){
                        steel_smelter--;
                    }
                    else {
                        iron_smelter--;
                    }
                }
                while (consume_coal > global.resource.Coal.amount && consume_coal > 0){
                    consume_coal -= 0.25 * time_multiplier;
                    if (steel_smelter > 0){
                        steel_smelter--;
                    }
                    else {
                        iron_smelter--;
                    }
                }
                while (consume_oil > global.resource.Oil.amount && consume_oil > 0){
                    consume_oil -= 0.35 * time_multiplier;
                    if (steel_smelter > 0){
                        steel_smelter--;
                    }
                    else {
                        iron_smelter--;
                    }
                }

                iron_smelter *= global.tech['smelting'] >= 3 ? 1.2 : 1;

                modRes('Lumber',-(consume_wood));
                modRes('Coal',-(consume_coal));
                modRes('Oil',-(consume_oil));

                //Steel Production
                if (global.resource.Steel.display && global.resource.Steel.amount < global.resource.Steel.max){
                    var iron_consume = steel_smelter * 2 * time_multiplier;
                    var coal_consume = steel_smelter * 0.25 * time_multiplier;
                    while (iron_consume > global.resource.Iron.amount && iron_consume > 0 && coal_consume > global.resource.Coal.amount && coal_consume > 0){
                        iron_consume -= 2 * time_multiplier;
                        coal_consume -= 0.25 * time_multiplier;
                    }
                    modRes('Iron',-(iron_consume));
                    modRes('Coal',-(coal_consume));

                    var steel_multiplier = global.tech['smelting'] >= 4 ? 1.2 : 1;
                    steel_multiplier *= tax_multiplier;
                    steel_multiplier *= hunger;
                    delta = steel_smelter * steel_multiplier * global_multiplier * time_multiplier;
                    modRes('Steel',delta);
                }
            }                

            // Lumber
            var lum_multiplier = (global.tech['axe'] && global.tech['axe'] > 0 ? (global.tech['axe'] - 1) * 0.25 : 0) + 1;
            lum_multiplier *= tax_multiplier;
            if (global.city.powered && global.city.sawmill){
                lum_multiplier *= 1 + (p_on['sawmill'] * 0.05);
            }
            lum_multiplier *= racialTrait(global.civic.lumberjack.workers,'lumberjack');
            lum_multiplier *= hunger;
            let lum_impact = global.city.biome === 'forest' ? (global.civic.lumberjack.impact * 1.1) : global.civic.lumberjack.impact;
            delta = global.civic.lumberjack.workers * lum_impact * lum_multiplier * global_multiplier * time_multiplier;
            modRes('Lumber',delta);
            
            // Stone
            var stone_multiplier = (global.tech['hammer'] && global.tech['hammer'] > 0 ? global.tech['hammer'] * 0.3 : 0) + 1;
            if (global.tech['explosives'] && global.tech['explosives'] >= 2){
                stone_multiplier *= global.tech['explosives'] >= 3 ? 1.75 : 1.5;
            }
            stone_multiplier *= tax_multiplier;
            stone_multiplier *= racialTrait(global.civic.quarry_worker.workers,'miner');
            if (global.city['rock_quarry']['on']){
                stone_multiplier *= 1 + (p_on['rock_quarry'] * 0.05);
            }
            stone_multiplier *= hunger;
            delta = global.civic.quarry_worker.workers * global.civic.quarry_worker.impact * stone_multiplier * global_multiplier * time_multiplier;
            modRes('Stone',delta);
            
            // Copper
            if (global.resource.Copper.display){
                var copper_multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.1 : 0) + 1;
                if (global.tech['explosives'] && global.tech['explosives'] >= 2){
                    copper_multiplier *= global.tech['explosives'] >= 3 ? 1.4 : 1.25;
                }
                copper_multiplier *= tax_multiplier;
                copper_multiplier *= racialTrait(global.civic.miner.workers,'miner');
                if (global.city['mine']['on']){
                    copper_multiplier *= 1 + (p_on['mine'] * 0.05);
                }
                if (global.race['tough']){
                    copper_multiplier *= 1.1;
                }
                copper_multiplier *= hunger;
                delta = (global.civic.miner.workers / 7) * copper_multiplier * global_multiplier * time_multiplier;
                modRes('Copper',delta);
            }
            
            // Iron
            if (global.resource.Iron.display){
                var iron_multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.1 : 0) + 1;
                if (global.tech['explosives'] && global.tech['explosives'] >= 2){
                    iron_multiplier *= global.tech['explosives'] >= 3 ? 1.4 : 1.25;
                }
                iron_multiplier *= tax_multiplier;
                iron_multiplier *= (1 + (iron_smelter * 0.1));
                iron_multiplier *= racialTrait(global.civic.miner.workers,'miner');
                if (global.city['mine']['on']){
                    iron_multiplier *= 1 + (p_on['mine'] * 0.05);
                }
                if (global.race['tough']){
                    iron_multiplier *= 1.1;
                }
                iron_multiplier *= hunger;
                delta = (global.civic.miner.workers / 4) * iron_multiplier * global_multiplier * time_multiplier;
                modRes('Iron',delta);
            }
            
            // Coal
            if (global.resource.Coal.display){
                var coal_multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.1 : 0) + 1;
                if (global.tech['explosives'] && global.tech['explosives'] >= 2){
                    coal_multiplier *= global.tech['explosives'] >= 3 ? 1.4 : 1.25;
                }
                coal_multiplier *= tax_multiplier;
                coal_multiplier *= racialTrait(global.civic.coal_miner.workers,'miner');
                if (global.city['coal_mine']['on']){
                    coal_multiplier *= 1 + (p_on['coal_mine'] * 0.05);
                }
                if (global.race['tough']){
                    coal_multiplier *= 1.1;
                }
                coal_multiplier *= hunger;
                delta = global.civic.coal_miner.workers * global.civic.coal_miner.impact * coal_multiplier * global_multiplier * time_multiplier;
                modRes('Coal',delta);
            }
            
            // Oil
            if (global.city['oil_well']){
                let oil_multiplier = 0.4;
                oil_multiplier *= hunger;
                delta = global.city.oil_well.count * oil_multiplier * global_multiplier * time_multiplier;
                modRes('Oil',delta);
            }

            // Detect new unlocks
            if (!global.settings.showResearch && global.resource.Knowledge.amount >= 10){
                global.settings.showResearch = true;
            }

            // Power grid state
            global.city.power = power_grid;
            if (global.city.power < 0){
                $('#powerMeter').css('color','#cc0000');
            }
            else if (global.city.power > 0){
                $('#powerMeter').css('color','#00af0f');
            }
            else {
                $('#powerMeter').css('color','#c0ce00');
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
    intervals['mid_loop'] = setInterval(function(){
        if (global.race.species !== 'protoplasm'){
            
            // Resource caps
            var caps = {
                Money: 1000,
                Knowledge: 100,
                Food: 250,
                Crates: 0,
                Containers: 0,
                Lumber: 200,
                Stone: 200,
                Furs: 100,
                Copper: 100,
                Iron: 100,
                Cement: 100,
                Coal: 50,
                Oil: 0,
                Steel: 50
            };
            // labor caps
            var lCaps = {
                farmer: 0,
                lumberjack: 0,
                quarry_worker: 0,
                miner: 0,
                cement_worker: 0,
                banker: 0,
                professor: 0,
                scientist: 0,
                garrison: 0
            };
            caps[races[global.race.species].name] = 0;
            if (global.city['farm']){
                lCaps['farmer'] += global.city['farm'].count;
                if (global.tech['farm']){
                    caps[races[global.race.species].name] += global.city['farm'].count;
                }
            }
            if (global.city['storage_yard']){
                let size = global.tech.container >= 3 ? 100 : 50;
                caps['Crates'] += (global.city['storage_yard'].count * size);
                Object.keys(caps).forEach(function (res){
                    caps['Crates'] -= global.resource[res].crates;
                });
            }
            if (global.city['warehouse']){
                let volume = global.tech['steel_container'] >= 2 ? 100 : 50;
                caps['Containers'] += (global.city['warehouse'].count * volume);
                Object.keys(caps).forEach(function (res){
                    caps['Containers'] -= global.resource[res].containers;
                });
            }
            if (global.city['rock_quarry']){
                lCaps['quarry_worker'] += global.city['rock_quarry'].count;
                caps['Stone'] += (global.city['rock_quarry'].count * 100);
            }
            if (global.city['lumber_yard']){
                lCaps['lumberjack'] += global.city['lumber_yard'].count * 2;
                caps['Lumber'] += (global.city['lumber_yard'].count * 100);
            }
            if (global.city['sawmill']){
                caps['Lumber'] += (global.city['sawmill'].count * 200);
                let impact = global.tech['saw'] >= 2 ? 0.08 : 0.05;
                global.civic.lumberjack.impact = (global.city['sawmill'].count * impact) + 1;
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
            if (global.city['garrison']){
                lCaps['garrison'] += global.city['garrison'].count * 2;
            }
            if (global.city['basic_housing']){
                caps[races[global.race.species].name] += global.city['basic_housing'].count;
            }
            if (global.city['cottage']){
                caps[races[global.race.species].name] += global.city['cottage'].count * 2;
            }
            if (global.city['apartment']){
                caps[races[global.race.species].name] += global.city['apartment'].on * 5;
            }
            if (global.city['shed']){
                var multiplier = (global.tech['storage'] - 1) * 0.5 + 1;
                if (global.tech['storage'] >= 3){
                    multiplier *= 1.5;
                    caps['Steel'] += (global.city['shed'].count * (25 * multiplier));
                }
                if (global.race['pack_rat']){
                    multiplier *= 1.05;
                }
                caps['Lumber'] += (global.city['shed'].count * (200 * multiplier));
                caps['Stone'] += (global.city['shed'].count * (200 * multiplier));
                caps['Furs'] += (global.city['shed'].count * (100 * multiplier));
                caps['Copper'] += (global.city['shed'].count * (75 * multiplier));
                caps['Iron'] += (global.city['shed'].count * (100 * multiplier));
                caps['Cement'] += (global.city['shed'].count * (80 * multiplier));
                caps['Coal'] += (global.city['shed'].count * (50 * multiplier));
            }
            if (global.city['silo']){
                caps['Food'] += (global.city['silo'].count * 250);
            }
            if (global.city['oil_well']){
                caps['Oil'] += (global.city['oil_well'].count * 500);
            }
            if (global.city['oil_depot']){
                caps['Oil'] += (global.city['oil_depot'].count * 1000);
            }
            if (global.city['university']){
                let multiplier = 1;
                if (global.tech['science'] >= 4){
                    multiplier += global.city['library'].count * 0.02;
                }
                caps['Knowledge'] += (global.city['university'].count * 500 * multiplier);
                lCaps['professor'] += global.city['university'].count;
            }
            if (global.city['library']){
                let shelving = (global.race['nearsighted'] ? 110 : 125);
                if (global.tech['science'] && global.tech['science'] >= 5){
                    shelving *= 1 + (global.civic.scientist.workers * 0.12);
                }
                caps['Knowledge'] += Math.round(global.city['library'].count * shelving);
                if (global.tech['science'] && global.tech['science'] >= 3){
                    global.civic.professor.impact = 0.5 + (global.city.library.count * 0.01)
                }
            }
            if (global.city['wardenclyffe']){
                caps['Knowledge'] += (global.city['wardenclyffe'].count * 1000);
                lCaps['scientist'] += global.city['wardenclyffe'].count;
                caps['Knowledge'] += (global.city['wardenclyffe'].on * 1000);
            }
            if (global.city['bank']){
                let vault = 1000;
                if (global.tech['banking'] >= 5){
                    vault = 5000;
                }
                else if (global.tech['banking'] >= 3){
                    vault = 2500;
                }
                if (global.race['paranoid']){
                    vault *= 0.9;
                }
                else if (global.race['hoarder']){
                    vault *= 1.1;
                }
                if (global.tech['banking'] >= 7){
                    vault *= 1 + (global.civic.banker.workers * 0.05);
                }
                caps['Money'] += (global.city['bank'].count * vault);
            }
            if (global.tech['banking'] >= 4){
                caps['Money'] += (global.tech['banking'] >= 6 ? 600 : 250) * (global.resource[races[global.race.species].name].amount + global.civic.garrison.workers);
            }
            
            let pop_loss = global.resource[races[global.race.species].name].amount - caps[races[global.race.species].name];
            if (pop_loss > 0){
                if (pop_loss === 1){
                    messageQueue(`${pop_loss} citizen has abandoned your settlement due to homelessness.`,'danger');
                }
                else {
                    messageQueue(`${pop_loss} citizens have abandoned your settlement due to homelessness.`,'danger');
                }
            } 

            let create_value = global.tech['container'] && global.tech['container'] >= 2 ? 30 : 25;
            let container_value = global.tech['steel_container'] && global.tech['steel_container'] >= 3 ? 75 : 50;
            if (global.race['pack_rat']){
                create_value += global.tech.container >= 2 ? 2 : 1;
                container_value += global.tech.steel_container >= 3 ? 3 : 2;
            }
            Object.keys(caps).forEach(function (res){
                caps[res] += global.resource[res].crates * create_value;
                caps[res] += global.resource[res].containers * container_value;
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
    intervals['long_loop'] = setInterval(function(){
            
        if (global.race.species !== 'protoplasm'){
            var global_multiplier = 1;

            // Tax Income
            if (global.tech['currency'] >= 1){
                var income = (global.resource[races[global.race.species].name].amount + global.civic.garrison.workers - global.civic.free) * ( global.race['greedy'] ? 1 : 2 );
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
                        tax_multiplier = 0.9;
                        break;
                    case 4:
                        tax_rate = 1.5;
                        tax_multiplier = 0.75;
                        break;
                    case 5:
                        tax_rate = 1.75;
                        tax_multiplier = 0.5;
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
                
                income *= tax_rate * global_multiplier;
                
                modRes('Money',Math.round(income));
            }
            
            // Market price fluctuation
            if (global.tech['currency'] && global.tech['currency'] >= 2){
                Object.keys(resource_values).forEach(function (res) {
                    let r_val = resource_values[res];
                    if (res === 'Copper' && global.tech['high_tech'] && global.tech['high_tech'] >= 2){
                        r_val *= 2;
                    }
                    if (global.resource[res].display && Math.rand(0,10) === 0){
                        let max = r_val * 2;
                        let min = r_val / 2;
                        let variance = (Math.rand(0,200) - 100) / 100;
                        let new_value = global.resource[res].value + variance;
                        if (new_value < min || new_value > max){
                            new_value = r_val;
                        }
                        global.resource[res].value = new_value;
                    }
                });
            }

            // Soldier Healing
            if (global.civic.garrison.wounded > 0){
                global.civic.garrison.wounded -= global.race['regenerative'] ? 2 : 1;
                if (global.civic.garrison.wounded < 0){
                    global.civic.garrison.wounded = 0;
                }
            }

            // Time
            global.city.calendar.day++;
            global.stats.days++;
            if (global.city.calendar.day > 365){
                global.city.calendar.day = 1;
                global.city.calendar.year++;
            }
            // Weather
            if (Math.rand(0,5) === 0){
                let temp = Math.rand(0,3);
                let sky = Math.rand(0,5);
                switch(global.city.biome){
                    case 'oceanic':
                        if (Math.rand(0,3) === 0 && sky > 0){
                            sky--;
                        }
                        break;
                    case 'tundra':
                        if (Math.rand(0,3) === 0 && temp > 0){
                            temp--;
                        }
                        break;
                    case 'desert':
                        if (Math.rand(0,3) === 0 && sky < 4){
                            sky++;
                        }
                        break;
                    case 'volcanic':
                        if (Math.rand(0,3) === 0 && temp < 2){
                            temp++;
                        }
                        break;
                    default:
                        break;
                }
                if (sky === 0){
                    global.city.calendar.weather = 0;
                }
                else if (sky >= 1 && sky <= 2){
                    global.city.calendar.weather = 1;
                }
                else {
                    global.city.calendar.weather = 2;
                }
                if (temp === 0){
                    let new_temp = global.city.calendar.temp - 1;
                    if (new_temp < 0){
                        new_temp = 0;
                    }
                    global.city.calendar.temp = new_temp;
                }
                else if (temp === 2){
                    let new_temp = global.city.calendar.temp + 1;
                    if (new_temp > 2){
                        new_temp = 2;
                    }
                    global.city.calendar.temp = new_temp;
                }
            }
            $('#weather').removeClass('fa-sun');
            $('#weather').removeClass('fa-cloud');
            $('#weather').removeClass('fa-cloud-rain');
            $('#weather').removeClass('fa-snowflake');
            $('#temp').removeClass('fa-temperature-low');
            $('#temp').removeClass('fa-temperature-high');

            if (global.city.calendar.temp === 0){
                $('#temp').addClass('fa-temperature-low');
            }
            else if (global.city.calendar.temp === 2){
                $('#temp').addClass('fa-temperature-high');
            }
            if (global.city.calendar.weather === 0){
                if (global.city.calendar.temp === 0){
                    $('#weather').addClass('fa-snowflake');
                }
                else {
                    $('#weather').addClass('fa-cloud-rain');
                }
            }
            else if (global.city.calendar.weather === 1){
                $('#weather').addClass('fa-cloud');
            }
            else if (global.city.calendar.weather === 2){
                $('#weather').addClass('fa-sun');
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
                            if (global.civic.taxes.tax_rate !== [events[event].reqs[req]]){
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
    let sec = global.race['slow'] ? 1100 : (global.race['hyper'] ? 950 : 1000);
    global.resource[res].diff = +(global.resource[res].delta / (period / sec)).toFixed(2);
    global.resource[res].delta = 0;
    if (global.resource[res].diff < 0 && !$(`#res-${res} .diff`).hasClass('has-text-danger')){
        $(`#res-${res} .diff`).addClass('has-text-danger');
    }
    else if (global.resource[res].diff >= 0 && $(`#res-${res} .diff`).hasClass('has-text-danger')){
        $(`#res-${res} .diff`).removeClass('has-text-danger');
    }
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
