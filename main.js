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
        },
        night(){
            global.settings.theme = 'night';
            $('html').removeClass();
            $('html').addClass('night');
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
                        return global.city.calendar.wind === 1 ? 'Snowstorm' : 'Snow';
                    }
                    else {
                        return global.city.calendar.wind === 1 ? 'Thunderstorm' : 'Rain';
                    }
                case 1:
                    return global.city.calendar.wind === 1 ? 'Cloudy & Windy' : 'Cloudy';
                case 2:
                    return global.city.calendar.wind === 1 ? 'Sunny & Windy' : 'Sunny';
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
        },
        moon(){
            if (global.city.calendar.moon === 0){
                return 'New Moon';
            }
            else if (global.city.calendar.moon > 0 && global.city.calendar.moon < 7){
                return 'Waxing Crescent Moon';
            }
            else if (global.city.calendar.moon === 7){
                return 'First Quarter Moon';
            }
            else if (global.city.calendar.moon > 7 && global.city.calendar.moon < 14){
                return 'Waxing Gibbous Moon';
            }
            else if (global.city.calendar.moon === 14){
                return 'Full Moon';
            }
            else if (global.city.calendar.moon > 14 && global.city.calendar.moon < 21){
                return 'Waning Gibbous Moon';
            }
            else if (global.city.calendar.moon === 21){
                return 'Third Quarter Moon';
            }
            else if (global.city.calendar.moon > 21){
                return 'Waning Crescent Moon';
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
    if (global.race.species === 'protoplasm'){
        popper.append($(`<span>Life on this planet is in it's infancy and still evolving</span>`));
    }
    else {
        let planet = races[global.race.species].home;
        let race = races[global.race.species].name;
        let biome = global.city.biome;
        let orbit = global.city.calendar.orbit;
        popper.append($(`<span>${planet} is the home planet of the ${race} people. It is a ${biome} planet with an orbital period of ${orbit} days.</span>`));
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
    setWeather();
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

            // trade routes
            if (global.tech['trade']){
                Object.keys(global.resource).forEach(function (res) {
                    if (global.resource[res].trade > 0){
                        let rate = global.race['arrogant'] ? Math.round(global.resource[res].value * 1.1) : global.resource[res].value;
                        let price = Math.round(global.resource[res].trade * rate);

                        if (global.resource.Money.amount >= price * time_multiplier){
                            modRes(res,global.resource[res].trade * time_multiplier);
                            modRes('Money',-(price * time_multiplier));
                        }
                    }
                    else if (global.resource[res].trade < 0){
                        let divide = global.race['merchant'] ? 3 : (global.race['asymmetrical'] ? 5 : 4);
                        let price = Math.round(global.resource[res].value * global.resource[res].trade / divide);

                        if (global.resource[res].amount >= time_multiplier){
                            modRes(res,global.resource[res].trade * time_multiplier);
                            modRes('Money',-(price * time_multiplier));
                        }
                    }
                });
            }

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
                let consume = global.city.oil_power.on * 0.65 * time_multiplier;
                while (consume > global.resource.Oil.amount && consume > 0){
                    power += actions.city.oil_power.powered;
                    consume -= 0.65 * time_multiplier;
                }
                power_grid -= power;
                modRes('Oil',-(consume));
            }

            if (global.city['fission_power']){
                let power = global.city.fission_power.on * actions.city.fission_power.powered;
                let consume = global.city.fission_power.on * 0.1 * time_multiplier;
                while (consume > global.resource.Uranium.amount && consume > 0){
                    power += actions.city.fission_power.powered;
                    consume -= 0.1 * time_multiplier;
                }
                power_grid -= power;
                modRes('Uranium',-(consume));
            }

            let p_structs = ['apartment','factory','wardenclyffe','biolab','mine','coal_mine','rock_quarry','sawmill'];
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
            
            if (global.race['lazy'] && global.city.calendar.temp === 2){
                global_multiplier *= 0.9;
            }

            if (global.race['nyctophilia'] && global.city.calendar.weather === 2){
                global_multiplier *= 0.9;
            }

            if (global.race['skittish'] && global.city.calendar.weather === 0 && global.city.calendar.wind === 1){
                global_multiplier *= 0.8;
            }

            if (global.race['selenophobia']){
                let moon = global.city.calendar.moon > 14 ? 28 - global.city.calendar.moon : global.city.calendar.moon;
                moon = 1.04 - (moon / 100);
                global_multiplier *= moon;
            }

            // Consumption
            fed = true;
            if (global.resource[races[global.race.species].name].amount >= 1 || global.city['farm']){
                var consume = (global.resource[races[global.race.species].name].amount + global.civic.garrison.workers - (global.civic.free * 0.5)) * (global.race['gluttony'] ? 1.25 : 1);
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
                var delta = 0;

                if (global.race['carnivore']){
                    let hunt = global.tech['military'] ? global.tech.military : 1;
                    delta = global.civic.free * hunt * 2;
                }
                else {
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
                    delta = (global.civic.farmer.workers * impact * food_multiplier);
                }
                
                if (global.tech['military']){
                    delta += global.race['herbivore'] ? 0 : armyRating(global.civic.garrison.workers,'hunting') / 3;
                }
                
                delta = (delta * global_multiplier * time_multiplier) - consume;

                if (modRes('Food',delta)){
                    fed = false;
                }
            }

            // Citizen Growth
            if (fed && global['resource']['Food'].amount > 0 && global['resource'][races[global.race.species].name].max > global['resource'][races[global.race.species].name].amount){
                var lowerBound = global.tech['reproduction'] ? global.tech['reproduction'] : 0;
                if (global.race['fast_growth']){
                    lowerBound *= 2;
                    lowerBound += 2;
                }
                if(Math.rand(0, global['resource'][races[global.race.species].name].amount * (3 - (2 ** time_multiplier))) <= lowerBound){
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
            know_multiplier *= hunger * time_multiplier * global_multiplier;
            var delta = (global.civic.professor.workers * know_multiplier) + (1 * time_multiplier);
            let adjunct = 1;
            if (global.tech['science'] >= 6 && global.city['wardenclyffe']){
                adjunct = 1 + (global.civic.professor.workers * p_on['wardenclyffe'] * 0.01);
            }
            delta += global.civic.scientist.workers * racialTrait(global.civic.scientist.workers,'science') * tax_multiplier * global_multiplier * time_multiplier * adjunct * hunger;
            modRes('Knowledge',delta);
            
            // Factory
            if (global.city['factory']){
                let opperating = 0;
                if (global.city.factory['Lux'] && global.city.factory['Lux'] > 0){
                    opperating += global.city.factory.Lux;
                    while (opperating > global.city.factory.on && opperating > 0){
                        opperating--;
                        global.city.factory.Lux--;
                    }

                    let consume = global.city.factory.Lux * 2 * time_multiplier;
                    let workDone = global.city.factory.Lux;
                    
                    while (consume > global.resource.Furs.amount && consume > 0){
                        consume -= 2 * time_multiplier;
                        workDone--;
                    }
                    modRes('Furs',-(consume));

                    delta = workDone * 20 * hunger * tax_multiplier * global_multiplier * time_multiplier;
                    if (global.race['toxic']){
                        delta *= 1.05;
                    }
                    modRes('Money',delta);
                }

                if (global.city.factory['Alloy'] && global.city.factory['Alloy'] > 0){
                    opperating += global.city.factory.Alloy;
                    while (opperating > global.city.factory.on && opperating > 0){
                        opperating--;
                        global.city.factory.Alloy--;
                    }

                    let copper = global.city.factory.Alloy * 0.75 * time_multiplier;
                    let titanium = global.city.factory.Alloy * 0.15 * time_multiplier;
                    let workDone = global.city.factory.Alloy;
                    
                    while (copper > global.resource.Copper.amount && copper > 0){
                        copper -= 0.75 * time_multiplier;
                        titanium -= 0.15 * time_multiplier;
                        workDone--;
                    }
                    while (titanium > global.resource.Titanium.amount && titanium > 0){
                        copper -= 0.75 * time_multiplier;
                        titanium -= 0.15 * time_multiplier;
                        workDone--;
                    }
                    modRes('Copper',-(copper));
                    modRes('Titanium',-(titanium));

                    delta = workDone * 0.075 * hunger * tax_multiplier * global_multiplier * time_multiplier;
                    if (global.race['toxic']){
                        delta *= 1.05;
                    }
                    modRes('Alloy',delta);
                }

                if (global.city.factory['Polymer'] && global.city.factory['Polymer'] > 0){
                    opperating += global.city.factory.Polymer;
                    while (opperating > global.city.factory.on && opperating > 0){
                        opperating--;
                        global.city.factory.Polymer--;
                    }

                    let oilIncrement = global.race['kindling_kindred'] ? 0.22 * time_multiplier : 0.18 * time_multiplier;
                    let lumberIncrement = global.race['kindling_kindred'] ? 0 : 15 * time_multiplier;
                    let oil = global.city.factory.Polymer * oilIncrement;
                    let lumber = global.city.factory.Polymer * lumberIncrement;
                    let workDone = global.city.factory.Polymer;
                    
                    while (lumber > global.resource.Lumber.amount && lumber > 0){
                        lumber -= lumberIncrement;
                        oil -= oilIncrement;
                        workDone--;
                    }
                    while (oil > global.resource.Oil.amount && oil > 0){
                        lumber -= lumberIncrement;
                        oil -= oilIncrement;
                        workDone--;
                    }
                    modRes('Lumber',-(lumber));
                    modRes('Oil',-(oil));

                    delta = workDone * 0.125 * hunger * tax_multiplier * global_multiplier * time_multiplier;
                    if (global.race['toxic']){
                        delta *= 1.05;
                    }
                    modRes('Polymer',delta);
                }
            }

            // Cement
            if (global.resource.Cement.display && global.resource.Cement.amount < global.resource.Cement.max){
                let consume = global.civic.cement_worker.workers * 3 * time_multiplier;
                let workDone = global.civic.cement_worker.workers;
                while (consume > global.resource.Stone.amount && consume > 0){
                    consume -= 3 * time_multiplier;
                    workDone--;
                }
                modRes('Stone',-(consume));
                
                let cement_multiplier = global.tech['cement'] >= 4 ? 1.2 : 1;
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

                if (global.race['pyrophobia']){
                    iron_smelter *= 0.9;
                }

                modRes('Lumber',-(consume_wood));
                modRes('Coal',-(consume_coal));
                modRes('Oil',-(consume_oil));

                //Steel Production
                if (global.resource.Steel.display){
                    var iron_consume = steel_smelter * 2 * time_multiplier;
                    var coal_consume = steel_smelter * 0.25 * time_multiplier;
                    while (iron_consume > global.resource.Iron.amount && iron_consume > 0 && coal_consume > global.resource.Coal.amount && coal_consume > 0){
                        iron_consume -= 2 * time_multiplier;
                        coal_consume -= 0.25 * time_multiplier;
                    }
                    
                    var steel_multiplier = global.tech['smelting'] >= 4 ? 1.2 : 1;
                    if (global.tech['smelting'] >= 5){
                        steel_multiplier *= 1.2;
                    }
                    if (global.tech['smelting'] >= 6){
                        steel_multiplier *= 1.2;
                    }
                    
                    steel_multiplier *= tax_multiplier;
                    steel_multiplier *= hunger;
                    delta = steel_smelter * steel_multiplier * global_multiplier * time_multiplier;

                    if (global.race['pyrophobia']){
                        delta *= 0.9;
                    }

                    if (global.resource.Steel.amount < global.resource.Steel.max){
                        modRes('Steel',delta);
                        modRes('Iron',-(iron_consume));
                        modRes('Coal',-(coal_consume));
                    }
                    
                    if (global.tech['titanium'] && global.tech['titanium'] >= 1){
                        let divisor = global.tech['titanium'] >= 3 ? 10 : 25;
                        modRes('Titanium',delta / divisor);
                    }
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
            if (global.city['rock_quarry'] && global.city.rock_quarry['on']){
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

                if (global.tech['titanium'] && global.tech['titanium'] >= 2){
                    delta = (global.civic.miner.workers / 4) * iron_smelter * 0.1 * global_multiplier * time_multiplier;
                    let divisor = global.tech['titanium'] >= 3 ? 10 : 25;
                    modRes('Titanium',delta / divisor);
                }
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

                // Uranium
                if (global.resource.Uranium.display){
                    modRes('Uranium',delta / 125);
                }
            }
            
            // Oil
            if (global.city['oil_well']){
                let oil_multiplier = global.tech['oil'] >= 4 ? 0.48 : 0.4;
                if (global.tech['oil'] >= 5){
                    oil_multiplier *= 1.25;
                }
                oil_multiplier *= hunger;
                oil_multiplier *= tax_multiplier;
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
                Uranium: 10,
                Steel: 50,
                Titanium: 50,
                Alloy: 50,
                Polymer: 50
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
                    multiplier *= global.tech['storage'] >= 4 ? 2 : 1.5;
                    caps['Steel'] += (global.city['shed'].count * (25 * multiplier));
                }
                if (global.tech['storage'] >= 4){
                    caps['Titanium'] += (global.city['shed'].count * (10 * multiplier));
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
                if (global.tech['uranium'] >= 2){
                    caps['Uranium'] += (global.city['shed'].count * (15 * multiplier));
                }
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
                let base = global.tech['science'] && global.tech['science'] >= 8 ? 700 : 500;
                if (global.tech['science'] >= 4){
                    multiplier += global.city['library'].count * 0.02;
                }
                caps['Knowledge'] += (global.city['university'].count * base * multiplier);
                lCaps['professor'] += global.city['university'].count;
            }
            if (global.city['library']){
                let shelving = (global.race['nearsighted'] ? 110 : 125);
                if (global.tech['science'] && global.tech['science'] >= 8){
                    shelving *= 1.4;
                }
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
                let powered_gain = global.tech['science'] >= 7 ? 1500 : 1000;
                caps['Knowledge'] += (global.city['wardenclyffe'].on * powered_gain);
            }
            if (global.city['biolab']){
                caps['Knowledge'] += (global.city['biolab'].on * 3000);
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
                if (global.tech['banking'] >= 8){
                    vault += 25 * global.resource[races[global.race.species].name].amount;
                }
                caps['Money'] += (global.city['bank'].count * vault);
            }
            if (global.tech['banking'] >= 4){
                caps['Money'] += (global.tech['banking'] >= 6 ? 600 : 250) * (global.resource[races[global.race.species].name].amount + global.civic.garrison.workers);
            }

            if (global.city['trade']){
                let routes = global.race['xenophobic'] ? global.tech.trade : global.tech.trade + 1;
                global.city.market.mtrade = routes * global.city.trade.count;
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
                var income = (global.resource[races[global.race.species].name].amount + global.civic.garrison.workers - (global.race['carnivore'] ? 0 : global.civic.free)) * ( global.race['greedy'] ? 1 : 2 );
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
                    if (res === 'Titanium'){
                        if (global.tech['titanium'] && global.tech['titanium'] > 0){
                            r_val *= global.resource.Alloy.display ? 1 : 2.5;
                        }
                        else {
                            r_val *= 5;
                        }
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
            if (global.city.calendar.day > global.city.calendar.orbit){
                global.city.calendar.day = 1;
                global.city.calendar.year++;
            }

            // Weather
            if (Math.rand(0,5) === 0){
                let season_length = Math.round(global.city.calendar.orbit / 4);
                let days = global.city.calendar.day;
                let season = 0;
                while (days > season_length){
                    days -= season_length;
                    season++;
                }

                let temp = Math.rand(0,3);
                let sky = Math.rand(0,5);
                let wind = Math.rand(0,3);
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

                switch(season){
                    case 0: // Spring
                        if (Math.rand(0,3) === 0 && sky > 0){
                            sky--;
                        }
                        break;
                    case 1: // Summer
                        if (Math.rand(0,3) === 0 && temp < 2){
                            temp++;
                        }
                        break;
                    case 2: // Fall
                        if (Math.rand(0,3) === 0 && wind > 0){
                            wind--;
                        }
                        break;
                    case 3: // Winter
                        if (Math.rand(0,3) === 0 && temp > 0){
                            temp--;
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

                global.city.calendar.wind = wind === 0 ? 1 : 0;
            }

            // Moon Phase
            global.city.calendar.moon++;
            if (global.city.calendar.moon > 27){
                global.city.calendar.moon = 0;
            }

            setWeather();
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

function setWeather(){
    // Moon Phase
    switch(global.city.calendar.moon){
        case 0:
            $('#moon').removeClass('wi-moon-waning-crescent-6');
            $('#moon').addClass('wi-moon-new');
            break;
        case 1:
            $('#moon').removeClass('wi-moon-new');
            $('#moon').addClass('wi-moon-waxing-crescent-1');
            break;
        case 2:
            $('#moon').removeClass('wi-moon-waxing-crescent-1');
            $('#moon').addClass('wi-moon-waxing-crescent-2');
            break;
        case 3:
            $('#moon').removeClass('wi-moon-waxing-crescent-2');
            $('#moon').addClass('wi-moon-waxing-crescent-3');
            break;
        case 4:
            $('#moon').removeClass('wi-moon-waxing-crescent-3');
            $('#moon').addClass('wi-moon-waxing-crescent-4');
            break;
        case 5:
            $('#moon').removeClass('wi-moon-waxing-crescent-4');
            $('#moon').addClass('wi-moon-waxing-crescent-5');
            break;
        case 6:
            $('#moon').removeClass('wi-moon-waxing-crescent-5');
            $('#moon').addClass('wi-moon-waxing-crescent-6');
            break;
        case 7:
            $('#moon').removeClass('wi-moon-waxing-crescent-6');
            $('#moon').addClass('wi-moon-first-quarter');
            break;
        case 8:
            $('#moon').removeClass('wi-moon-first-quarter');
            $('#moon').addClass('wi-moon-waxing-gibbous-1');
            break;
        case 9:
            $('#moon').removeClass('wi-moon-waxing-gibbous-1');
            $('#moon').addClass('wi-moon-waxing-gibbous-2');
            break;
        case 10:
            $('#moon').removeClass('wi-moon-waxing-gibbous-2');
            $('#moon').addClass('wi-moon-waxing-gibbous-3');
            break;
        case 11:
            $('#moon').removeClass('wi-moon-waxing-gibbous-3');
            $('#moon').addClass('wi-moon-waxing-gibbous-4');
            break;
        case 12:
            $('#moon').removeClass('wi-moon-waxing-gibbous-4');
            $('#moon').addClass('wi-moon-waxing-gibbous-5');
            break;
        case 13:
            $('#moon').removeClass('wi-moon-waxing-gibbous-5');
            $('#moon').addClass('wi-moon-waxing-gibbous-6');
            break;
        case 14:
            $('#moon').removeClass('wi-moon-waxing-gibbous-6');
            $('#moon').addClass('wi-moon-full');
            break;
        case 15:
            $('#moon').removeClass('wi-moon-full');
            $('#moon').addClass('wi-moon-waning-gibbous-1');
            break;
        case 16:
            $('#moon').removeClass('wi-moon-waning-gibbous-1');
            $('#moon').addClass('wi-moon-waning-gibbous-2');
            break;
        case 17:
            $('#moon').removeClass('wi-moon-waning-gibbous-2');
            $('#moon').addClass('wi-moon-waning-gibbous-3');
            break;
        case 18:
            $('#moon').removeClass('wi-moon-waning-gibbous-3');
            $('#moon').addClass('wi-moon-waning-gibbous-4');
            break;
        case 19:
            $('#moon').removeClass('wi-moon-waning-gibbous-4');
            $('#moon').addClass('wi-moon-waning-gibbous-5');
            break;
        case 20:
            $('#moon').removeClass('wi-moon-waning-gibbous-5');
            $('#moon').addClass('wi-moon-waning-gibbous-6');
            break;
        case 21:
            $('#moon').removeClass('wi-moon-waning-gibbous-6');
            $('#moon').addClass('wi-moon-third-quarter');
            break;
        case 22:
            $('#moon').removeClass('wi-moon-third-quarter');
            $('#moon').addClass('wi-moon-waning-crescent-1');
            break;
        case 23:
            $('#moon').removeClass('wi-moon-waning-crescent-1');
            $('#moon').addClass('wi-moon-waning-crescent-2');
            break;
        case 24:
            $('#moon').removeClass('wi-moon-waning-crescent-2');
            $('#moon').addClass('wi-moon-waning-crescent-3');
            break;
        case 25:
            $('#moon').removeClass('wi-moon-waning-crescent-3');
            $('#moon').addClass('wi-moon-waning-crescent-4');
            break;
        case 26:
            $('#moon').removeClass('wi-moon-waning-crescent-4');
            $('#moon').addClass('wi-moon-waning-crescent-5');
            break;
        case 27:
            $('#moon').removeClass('wi-moon-waning-crescent-5');
            $('#moon').addClass('wi-moon-waning-crescent-6');
            break;
    }

    // Temp
    $('#temp').removeClass('wi-thermometer');
    $('#temp').removeClass('wi-thermometer-exterior');
    if (global.city.calendar.temp === 0){
        $('#temp').addClass('wi-thermometer-exterior');
    }
    else if (global.city.calendar.temp === 2){
        $('#temp').addClass('wi-thermometer');
    }

    // Sky
    $('#weather').removeClass('wi-day-sunny');
    $('#weather').removeClass('wi-day-windy');
    $('#weather').removeClass('wi-cloud');
    $('#weather').removeClass('wi-cloudy-gusts');
    $('#weather').removeClass('wi-rain');
    $('#weather').removeClass('wi-storm-showers');
    $('#weather').removeClass('wi-snow');
    $('#weather').removeClass('wi-snow-wind');
    
    
    let weather;
    if (global.city.calendar.weather === 0){
        if (global.city.calendar.temp === 0){
            weather = global.city.calendar.wind === 0 ? 'wi-snow' : 'wi-snow-wind';
        }
        else {
            weather = global.city.calendar.wind === 0 ? 'wi-rain' : 'wi-storm-showers';
        }
    }
    else if (global.city.calendar.weather === 1){
        weather = global.city.calendar.wind === 0 ? 'wi-cloud' : 'wi-cloudy-gusts';
    }
    else if (global.city.calendar.weather === 2){
        weather = global.city.calendar.wind === 0 ? 'wi-day-sunny' : 'wi-day-windy';
    }
    $('#weather').addClass(weather);
}
