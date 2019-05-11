import { global, vues, save, poppers, messageQueue, modRes, breakdown, keyMultiplier } from './vars.js';
import { setupStats, checkAchievements } from './achieve.js';
import { races, racialTrait, randomMinorTrait } from './races.js';
import { defineResources, resource_values, spatialReasoning, craftCost, plasmidBonus, tradeRatio } from './resources.js';
import { defineJobs, job_desc, craftingRatio } from './jobs.js';
import { defineGovernment, defineGarrison, armyRating } from './civics.js';
import { actions, checkCityRequirements, checkTechRequirements, addAction, checkAffordable, drawTech, evoProgress, basicHousingLabel } from './actions.js';
import { events } from './events.js';
import { arpa } from './arpa.js';

var intervals = {};

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
$('#civics').append($('<div id="r_civics" class="tile is-vertical is-parent civics"></div>'));
defineGovernment();
if (global.race.species !== 'protoplasm'){
    defineGarrison();
}

arpa('Physics');
arpa('Genetics');
arpa('Crispr');

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

var moraleCap = 125;
$('#morale').on('mouseover',function(){
    var popper = $(`<div id="popMorale" class="popper has-background-light has-text-dark"></div>`);
    $('#main').append(popper);
    if (global.city.morale.stress !== 0){
        let type = global.city.morale.stress > 0 ? 'success' : 'danger';
        popper.append(`<p>Stress<span class="has-text-${type}"> ${global.city.morale.stress}%</span></p>`);
    }
    if (global.city.morale.entertain !== 0){
        let type = global.city.morale.entertain > 0 ? 'success' : 'danger';
        popper.append(`<p>Entertainment<span class="has-text-${type}"> ${global.city.morale.entertain}%</span></p>`);
    }
    if (global.city.morale.season !== 0){
        let season = global.city.calendar.season === 0 ? 'Spring' : 'Winter';
        let type = global.city.morale.season > 0 ? 'success' : 'danger';
        popper.append(`<p>${season}<span class="has-text-${type}"> ${global.city.morale.season}%</span></p>`);
    }
    if (global.city.morale.weather !== 0){
        let type = global.city.morale.weather > 0 ? 'success' : 'danger';
        popper.append(`<p>Weather<span class="has-text-${type}"> ${global.city.morale.weather}%</span></p>`);
    }
    let total = 100 + global.city.morale.stress + global.city.morale.entertain + global.city.morale.season + global.city.morale.weather;
    if (total > moraleCap || total < 50){
        popper.append(`<div>Current<span class="has-text-warning"> ${global.city.morale.current}% (${total}%)</span></div>`);
    }
    else {
        popper.append(`<div>Current<span class="has-text-warning"> ${global.city.morale.current}%</span></div>`);
    }
    popper.show();
    poppers['morale'] = new Popper($('#morale'),popper);
});
$('#morale').on('mouseout',function(){
    $(`#popMorale`).hide();
    poppers['morale'].destroy();
    $(`#popMorale`).remove();
});

$('#powerStatus').on('mouseover',function(){
    var popper = $(`<div id="popPowerStatus" class="popper has-background-light has-text-dark"></div>`);
    $('#main').append(popper);
    let drain = global.city.power_total - global.city.power;
    popper.append(`<p>Generated<span class="has-text-success"> +${global.city.power_total}</span></p>`);
    popper.append(`<p>Consumed<span class="has-text-danger"> -${drain}</span></p>`);
    if (global.city.power > 0){
        popper.append(`<div>Available <span class="has-text-success">${global.city.power}</span></div>`);
    }
    else {
        popper.append(`<div>Available <span class="has-text-danger">${global.city.power}</span></div>`);
    }
    popper.show();
    poppers['PowerStatus'] = new Popper($('#powerStatus'),popper);
});
$('#powerStatus').on('mouseout',function(){
    $(`#popPowerStatus`).hide();
    poppers['PowerStatus'].destroy();
    $(`#popPowerStatus`).remove();
});

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
    else if ((global.evolution['phagocytosis'] || global.evolution['chloroplasts'] || global.evolution['chitin']) && !global.evolution['multicellular']){
        addAction('evolution','phagocytosis');
        addAction('evolution','chloroplasts');
        addAction('evolution','chitin');
    }
    else {
        var late_actions = ['multicellular','spores','poikilohydric','bilateral_symmetry','bryophyte','athropods','mammals','eggshell','sentience'];
        for (var i = 0; i < late_actions.length; i++){
            if (global.evolution[late_actions[i]] && global.evolution[late_actions[i]].count == 0){
                addAction('evolution',late_actions[i]);
            }
        }
    }
    if (global.evolution['sexual_reproduction'] && global.evolution['sexual_reproduction'].count > 0){
        evoProgress();
    }
}
else {
    Object.keys(actions.city).forEach(function (city){
        if (checkCityRequirements(city)){
            addAction('city',city);
        }
    });
    Object.keys(actions.tech).forEach(function (tech){
        if (checkTechRequirements(tech)){
            addAction('tech',tech);
        }
    });
    setWeather();
}

setupStats();

var fed = true;
var tax_multiplier = 1;
var p_on = {};

var main_timer = global.race['slow'] ? 275 : (global.race['hyper'] ? 240 : 250);
var mid_timer = global.race['slow'] ? 1100 : (global.race['hyper'] ? 950 : 1000);
var long_timer = global.race['slow'] ? 5500 : (global.race['hyper'] ? 4750 : 5000);

if (window.Worker){
    var worker = new Worker("evolve.js");
    worker.postMessage({ loop: 'short', period: main_timer });
    worker.postMessage({ loop: 'mid', period: mid_timer });
    worker.postMessage({ loop: 'long', period: long_timer });
    worker.addEventListener('message', function(e){
        var data = e.data;
        switch (data) {
            case 'fast':
                fastLoop();
                break;
            case 'mid':
                midLoop();
                break;
            case 'long':
                longLoop();
                break;
        }
    }, false);
}
else {
    intervals['main_loop'] = setInterval(function(){
        fastLoop();
    }, main_timer);
    
    intervals['mid_loop'] = setInterval(function(){
        midLoop();
    }, mid_timer);
    
    intervals['long_loop'] = setInterval(function(){
        longLoop();
    }, long_timer);
}

function fastLoop(){
    keyMultiplier();
    
    breakdown.p['Global'] = {};
    var global_multiplier = 1;
    if (global.race.Plasmid.count > 0){
        breakdown.p['Global']['Plasmid'] = (plasmidBonus() * 100) + '%';
        global_multiplier += plasmidBonus();
    }

    breakdown.p['consume'] = {
        Money: {},
        Knowledge: {},
        Food: {},
        Lumber: {},
        Stone: {},
        Furs: {},
        Copper: {},
        Iron: {},
        Cement: {},
        Coal: {},
        Oil: {},
        Uranium: {},
        Steel: {},
        Titanium: {},
        Alloy: {},
        Polymer: {}
    };
    
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
            let rna = increment;
            if (global.evolution['bryophyte'] || global.evolution['protostomes'] || global.evolution['deuterostome']){
                increment *= 2;
            }
            modRes('DNA',increment * global_multiplier * time_multiplier);
            modRes('RNA',-(rna * 2 * time_multiplier));
        }
        if (global.evolution['organelles']){
            let rna_multiplier = global.race['rapid_mutation'] ? 2 : 1;
            if (global.evolution['sexual_reproduction'] && global.evolution['sexual_reproduction'].count > 0){
                rna_multiplier++;
            }
            modRes('RNA',global.evolution['organelles'].count * rna_multiplier * global_multiplier * time_multiplier);
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

        let morale = 100;
        if (global.city.calendar.season === 0 && global.city.calendar.year > 0){
            morale += 5; // Spring
            global.city.morale.season = 5;
        }
        else if (global.city.calendar.season === 3){
            morale -= global.race['leathery'] ? 4 : 5; // Winter
            global.city.morale.season = global.race['leathery'] ? -4 : -5;
        }
        else {
            global.city.morale.season = 0;
        }

        let weather_morale = 0;
        if (global.city.calendar.weather === 0){
            if (global.city.calendar.temp > 0){
                if (global.city.calendar.wind === 1){
                    // Thunderstorm
                    if (global.race['skittish']){
                        weather_morale = -12; //possibly -25??
                    }
                    else {
                        weather_morale = global.race['leathery'] ? -4 : -5;
                    }
                }
                else {
                    // Rain
                    weather_morale = global.race['leathery'] ? -1 : -2;
                }
            }
        }
        else if (global.city.calendar.weather === 2){
            // Sunny
            if (global.race['nyctophilia']){
                weather_morale = -5; //possibly -10??
            }
            else if ((global.city.calendar.wind === 0 && global.city.calendar.temp < 2) || (global.city.calendar.wind === 1 && global.city.calendar.temp === 2)){
                //Still and Not Hot
                // -or-
                //Windy and Hot
                weather_morale = 2;
            }
        }
        else {
            //Cloudy
            if (global.race['nyctophilia']){
                weather_morale = 2;
            }
        }
        global.city.morale.weather = weather_morale;
        morale += weather_morale;

        let stress = 0;
        if (!global.race['carnivore']){
            stress -= global.civic.free;
        }
        else {
            stress -= Math.round(global.civic.free / 5);
        }

        if (global.race['optimistic']){
            stress += 2;
        }

        if (global.race['pessimistic']){
            stress -= 2;
        }

        if (global.civic['garrison']){
            stress -= Math.round(global.civic.garrison.workers / 2);
        }

        let money_bd = {};
        breakdown.p.consume.Money['Trade'] = 0;

        // trade routes
        if (global.tech['trade']){
            Object.keys(global.resource).forEach(function (res){
                if (global.resource[res].trade > 0){
                    let rate = global.race['arrogant'] ? Math.round(global.resource[res].value * 1.1) : global.resource[res].value;
                    let price = Math.round(global.resource[res].trade * rate * tradeRatio[res]);

                    if (global.resource.Money.amount >= price * time_multiplier){
                        modRes(res,global.resource[res].trade * time_multiplier * tradeRatio[res]);
                        modRes('Money',-(price * time_multiplier));
                        breakdown.p.consume.Money['Trade'] -= price;
                        breakdown.p.consume[res]['Trade'] = global.resource[res].trade * tradeRatio[res];
                    }
                }
                else if (global.resource[res].trade < 0){
                    let divide = global.race['merchant'] ? 3 : (global.race['asymmetrical'] ? 5 : 4);
                    let price = Math.round(global.resource[res].value * global.resource[res].trade * tradeRatio[res] / divide);

                    if (global.resource[res].amount >= time_multiplier){
                        modRes(res,global.resource[res].trade * time_multiplier * tradeRatio[res]);
                        modRes('Money',-(price * time_multiplier));
                        breakdown.p.consume.Money['Trade'] -= price;
                        breakdown.p.consume[res]['Trade'] = global.resource[res].trade * tradeRatio[res];
                    }
                }
            });
        }

        let power_grid = 0;
        let max_power = 0;

        let uranium_bd = {};
        if (global.city['coal_power']){
            let power = global.city.coal_power.on * actions.city.coal_power.powered;
            let consume = global.city.coal_power.on * 0.35 * time_multiplier;
            while (consume > global.resource.Coal.amount && consume > 0){
                power += actions.city.coal_power.powered;
                consume -= 0.35 * time_multiplier;
            }
            breakdown.p.consume.Coal['Powerplant'] = -(consume) / time_multiplier;
            max_power += power;
            power_grid -= power;
            modRes('Coal',-(consume));
            // Uranium
            if (global.tech['uranium'] && global.tech['uranium'] >= 3){
                modRes('Uranium',consume / 65);
                breakdown.p.consume.Uranium['Powerplant'] = (consume / time_multiplier / 65);
            }
        }

        if (global.city['oil_power']){
            let power = global.city.oil_power.on * actions.city.oil_power.powered;
            let consume = global.city.oil_power.on * 0.65 * time_multiplier;
            while (consume > global.resource.Oil.amount && consume > 0){
                power += actions.city.oil_power.powered;
                consume -= 0.65 * time_multiplier;
            }
            breakdown.p.consume.Oil['Powerplant'] = -(consume) / time_multiplier;
            max_power += power;
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
            breakdown.p.consume.Uranium['Reactor'] = -(consume) / time_multiplier;
            max_power += power;
            power_grid -= power;
            modRes('Uranium',-(consume));
        }

        if (global.city['mill'] && global.tech['agriculture'] && global.tech['agriculture'] >= 6){
            let power = global.city.mill.on * actions.city.mill.powered;
            max_power += power;
            power_grid -= power;
        }

        let p_structs = ['apartment','factory','wardenclyffe','biolab','mine','coal_mine','rock_quarry','sawmill','cement_plant'];
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
            else {
                p_on[p_structs[i]] = 0;
            }
        }

        // Detect labor anomalies
        let total = 0;
        let stress_level = 5;
        if (global.race['content']){
            stress_level += global.race['content'] * 0.5;
        }
        Object.keys(job_desc).forEach(function (job) {
            total += global.civic[job].workers;
            if (total > global.resource[races[global.race.species].name].amount){
                global.civic[job].workers -= total - global.resource[races[global.race.species].name].amount;
            }
            stress -= +(global.civic[job].workers / stress_level).toFixed(0);
        });
        global.civic.free = global.resource[races[global.race.species].name].amount - total;
        
        let entertainment = 0;
        if (global.tech['theatre']){
            entertainment += global.civic.entertainer.workers * global.tech.theatre;
        }
        if (global.tech['broadcast']){
            entertainment += global.city.wardenclyffe.on * global.tech.broadcast;
        }
        global.city.morale.entertain = entertainment;
        morale += entertainment;
        global.city.morale.stress = stress;
        morale += stress;

        let mBaseCap = global.city['amphitheatre'] ? 100 + global.city['amphitheatre'].count : 100;
        moraleCap = global.tech['monuments'] ? mBaseCap + (global.tech['monuments'] * 2) : mBaseCap;
        if (morale < 50){
            morale = 50;
        }
        else if (morale > moraleCap){
            morale = moraleCap;
        }

        global.city.morale.current = morale;

        if (global.city.morale.current < 100){
            global_multiplier *= global.city.morale.current / 100;
            breakdown.p['Global']['Morale'] = (global.city.morale.current - 100) + '%';
        }
        else {
            global_multiplier *= 1 + ((global.city.morale.current - 100) / 200);
            breakdown.p['Global']['Morale'] = ((global.city.morale.current - 100) / 2) + '%';
        }

        if (global.race['lazy'] && global.city.calendar.temp === 2){
            breakdown.p['Global']['Lazy'] = '-10%';
            global_multiplier *= 0.9;
        }

        if (global.race['selenophobia']){
            let moon = global.city.calendar.moon > 14 ? 28 - global.city.calendar.moon : global.city.calendar.moon;
            moon = 1.04 - (moon / 100);
            global_multiplier *= moon;
        }

        // Consumption
        fed = true;
        if (global.resource[races[global.race.species].name].amount >= 1 || global.city['farm']){
            let consume = (global.resource[races[global.race.species].name].amount + global.civic.garrison.workers - (global.civic.free * 0.5)) * (global.race['gluttony'] ? 1.1 : 1);
            if (global.race['high_metabolism']){
                consume *= 1.05;
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
            breakdown.p.consume.Food[races[global.race.species].name] = -(consume);
            consume *= time_multiplier;
            var delta = 0;

            let food_bd = {};
            if (global.race['carnivore']){
                let hunt = global.tech['military'] ? global.tech.military : 1;
                delta = global.civic.free * hunt * 2;
                food_bd['Hunters'] = delta + 'v';
            }
            else {
                let farmers_base = global.civic.farmer.workers;
                farmers_base *= (global.tech['hoe'] && global.tech['hoe'] > 0 ? global.tech['hoe'] * (1/3) : 0) + 1;
                farmers_base *= global.city.biome === 'grassland' ? 1.1 : 1;
                farmers_base *= global.civic.farmer.impact;
                farmers_base *= racialTrait(global.civic.farmer.workers,'farmer');
                if (global.tech['agriculture'] >= 7){
                    farmers_base *= 1.1;
                }

                let weather_multiplier = 1;
                if (global.city.calendar.temp === 0){
                    if (global.city.calendar.weather === 0){
                        weather_multiplier *= 0.7;
                    }
                    else {
                        weather_multiplier *= 0.85;
                    }
                }
                if (global.city.calendar.weather === 2){
                    weather_multiplier *= 1.1;
                }

                let mill_multiplier = 1;
                if (global.city['mill']){
                    let mill_bonus = global.tech['agriculture'] >= 5 ? 0.05 : 0.03;
                    let working = global.city['mill'].count - global.city['mill'].on;
                    mill_multiplier += (working * mill_bonus);
                }

                let food_tax_mult = ((tax_multiplier - 1) / 2) + 1;

                delta = (farmers_base * weather_multiplier * mill_multiplier * food_tax_mult);

                food_bd['Farmers'] = (farmers_base) + 'v';
                food_bd['Weather'] = ((weather_multiplier - 1) * 100) + '%';
                food_bd['Mills'] = ((mill_multiplier - 1) * 100) + '%';
                food_bd['Taxes'] = ((food_tax_mult - 1) * 100)  + '%';
            }
            
            if (global.tech['military']){
                let hunting = global.race['herbivore'] ? 0 : armyRating(global.civic.garrison.workers,'hunting') / 3;
                delta += hunting;
                food_bd['Soldiers'] = hunting + 'v';
            }
            
            delta = delta * global_multiplier * time_multiplier;
            let f_delta = delta - consume;
            breakdown.p['Food'] = food_bd;

            if (modRes('Food',f_delta)){
                fed = false;
                let threshold = global.race['slow_digestion'] ? 2.5 : 2;
                if (global.race['atrophy']){
                    threshold -= 0.5;
                }
                if (delta * threshold < consume){
                    if (Math.rand(0, 10) === 0){
                        global['resource'][races[global.race.species].name].amount--;
                        global.stats.starved++;
                    }
                }
            }
        }

        // Citizen Growth
        if (fed && global['resource']['Food'].amount > 0 && global['resource'][races[global.race.species].name].max > global['resource'][races[global.race.species].name].amount){
            if (global.race['spongy'] && global.city.calendar.weather === 0){
                // Do Nothing
            }
            else {
                var lowerBound = global.tech['reproduction'] ? global.tech['reproduction'] : 0;
                if (global.race['fast_growth']){
                    lowerBound *= 2;
                    lowerBound += 2;
                }
                if (global.race['spores'] && global.city.calendar.wind === 1){
                    lowerBound += 2;
                    lowerBound *= 2;
                }
                if (global.genes['birth']){
                    lowerBound += global.genes['birth'];
                }
                if (global.race['promiscuous']){
                    lowerBound += global.race['promiscuous'];
                }
                if(Math.rand(0, global['resource'][races[global.race.species].name].amount * (3 - (2 ** time_multiplier))) <= lowerBound){
                    global['resource'][races[global.race.species].name].amount++;
                }
            }
        }
        
        // Resource Income
        let hunger = fed ? 1 : 0.5;
        if (global.race['angry'] && fed === false){
            hunger -= 0.25;
        }
        if (global.race['malnutrition'] && fed === false){
            hunger += 0.25;
        }

        // Furs
        if (global.resource.Furs.display){
            let fur_bd = {};
            let fur_multiplier = hunger;
            let hunting = armyRating(global.civic.garrison.workers,'hunting') / 10;
            let delta = hunting * fur_multiplier * global_multiplier * time_multiplier;
            modRes('Furs',delta);
            fur_bd['Soldiers'] = hunting  + 'v';
            fur_bd['Hunger'] = ((hunger - 1) * 100) + '%';
            breakdown.p['Furs'] = fur_bd;
        }

        // Knowledge
        let know_bd = {};
        let know_base = global.tech['primitive'] && global.tech['primitive'] >= 3 ? 1 : 0;
        if (global.race['ancient_ruins']){
            know_base++;
        }
        know_bd['Sundial'] = know_base + 'v';
        let professors = global.race['studious'] ? global.civic.professor.impact + 0.25 : global.civic.professor.impact;
        professors *= racialTrait(global.civic.professor.workers,'science');
        var professor_multiplier = professors * tax_multiplier;
        if (global.tech['anthropology'] && global.tech['anthropology'] >= 3){
            professor_multiplier *= 1 + (global.city.temple.count * 0.05);
        }
        know_bd['Professors'] = (global.civic.professor.workers * professor_multiplier)  + 'v';
        professor_multiplier *= hunger * time_multiplier * global_multiplier;
        let library_bonus = global.city['library'] ? 1 + (global.city.library.count * 0.05) : 1;
        var delta = (global.civic.professor.workers * professor_multiplier * library_bonus) + (know_base * time_multiplier * library_bonus);
        let adjunct = 1;
        if (global.tech['science'] >= 6 && global.city['wardenclyffe']){
            adjunct = 1 + (global.civic.professor.workers * p_on['wardenclyffe'] * 0.01);
        }
        let scientist = global.civic.scientist.workers * racialTrait(global.civic.scientist.workers,'science') * adjunct;
        know_bd['Scientist'] = (scientist * tax_multiplier)  + 'v';
        know_bd['Hunger'] = ((hunger - 1) * 100) + '%';
        
        if (global.city['library']){
            know_bd['Library'] = ((library_bonus - 1) * 100) + '%';
        }
        delta += scientist * tax_multiplier * global_multiplier * time_multiplier * hunger * library_bonus;
        modRes('Knowledge',delta);
        know_bd['Taxes'] = ((tax_multiplier * 100) - 100)  + '%';
        if (global.arpa['sequence'] && global.arpa.sequence.on && global.arpa.sequence.time > 0){
            let gene_cost = 50 + (global.race.mutation * 10);
            let spend = gene_cost * time_multiplier;
            if (spend <= global.resource.Knowledge.amount){
                modRes('Knowledge',-(spend));
            }
            else {
                global.arpa.sequence.on = false;
            }
            breakdown.p.consume.Knowledge['Genome'] = -(gene_cost);
        }
        breakdown.p['Knowledge'] = know_bd;

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
                breakdown.p.consume.Furs['Factory'] = -(consume) / time_multiplier;

                let demand = global.resource[races[global.race.species].name].amount * 0.14;
                delta = workDone * demand;
                if (global.race['toxic']){
                    delta *= 1.08;
                }
                money_bd['Factory'] = delta + 'v';
                delta *= hunger * tax_multiplier * global_multiplier * time_multiplier;
                modRes('Money',delta);
                
            }

            if (global.city.factory['Alloy'] && global.city.factory['Alloy'] > 0){
                let alloy_bd = {};
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
                breakdown.p.consume.Copper['Factory'] = -(copper) / time_multiplier;
                breakdown.p.consume.Titanium['Factory'] = -(titanium) / time_multiplier;

                alloy_bd['Factory'] = (workDone * 0.075);
                delta = workDone * 0.075 * hunger * tax_multiplier * global_multiplier * time_multiplier;
                if (global.race['toxic']){
                    delta *= 1.08;
                    alloy_bd['Factory'] *= 1.08;
                }
                alloy_bd['Factory'] = alloy_bd['Factory'] + 'v';
                alloy_bd['Hunger'] = ((hunger - 1) * 100) + '%';
                alloy_bd['Taxes'] = ((tax_multiplier * 100) - 100)  + '%';
                breakdown.p['Alloy'] = alloy_bd;
                modRes('Alloy',delta);
            }

            if (global.city.factory['Polymer'] && global.city.factory['Polymer'] > 0){
                let polymer_bd = {};
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
                breakdown.p.consume.Lumber['Factory'] = -(lumber) / time_multiplier;
                breakdown.p.consume.Oil['Factory'] = -(oil) / time_multiplier;

                polymer_bd['Factory'] = (workDone * 0.125);
                delta = workDone * 0.125 * hunger * tax_multiplier * global_multiplier * time_multiplier;
                if (global.race['toxic']){
                    delta *= 1.08;
                    polymer_bd['Factory'] *= 1.08;
                }
                if (global.tech['polymer'] >= 2){
                    delta *= 1.42;
                    polymer_bd['Factory'] *= 1.42;
                }
                polymer_bd['Factory'] = polymer_bd['Factory'] + 'v';
                polymer_bd['Hunger'] = ((hunger - 1) * 100) + '%';
                polymer_bd['Taxes'] = ((tax_multiplier * 100) - 100)  + '%';
                breakdown.p['Polymer'] = polymer_bd;
                modRes('Polymer',delta);
            }
        }

        // Cement
        if (global.resource.Cement.display){
            let cement_bd = {};
            let consume = global.civic.cement_worker.workers * 3 * time_multiplier;
            let workDone = global.civic.cement_worker.workers;
            while (consume > global.resource.Stone.amount && consume > 0){
                consume -= 3 * time_multiplier;
                workDone--;
            }
            modRes('Stone',-(consume));
            breakdown.p.consume.Stone['Factory'] = -(consume) / time_multiplier;
            
            let cement_multiplier = global.tech['cement'] >= 4 ? 1.2 : 1;
            cement_multiplier *= tax_multiplier;
            cement_multiplier *= racialTrait(global.civic.cement_worker.workers,'factory');
            cement_multiplier *= hunger;
            let bd_powered = 0;
            if (global.city.powered && p_on['cement_plant']){
                cement_multiplier *= 1 + (p_on['cement_plant'] * 0.05);
                bd_powered = (p_on['cement_plant'] * 0.05) * 100;
            }
            delta = (workDone * global.civic.cement_worker.impact) * cement_multiplier * global_multiplier * time_multiplier;
            cement_bd['Factory'] = (workDone * global.civic.cement_worker.impact) * racialTrait(global.civic.cement_worker.workers,'factory') * (global.tech['cement'] >= 4 ? 1.2 : 1);
            if (global.race['toxic']){
                delta *= 1.08;
                cement_bd['Factory'] *= 1.08;
            }
            cement_bd['Factory'] = cement_bd['Factory'] + 'v';
            cement_bd['Power'] = bd_powered + '%';
            cement_bd['Hunger'] = ((hunger - 1) * 100) + '%';
            cement_bd['Taxes'] = ((tax_multiplier * 100) - 100)  + '%';
            breakdown.p['Cement'] = cement_bd;
            modRes('Cement',delta);
        }
        
        // Smelters
        let iron_smelter = 0;
        let titanium_bd = {};
        if (global.city['smelter'] && global.city['smelter'].count > 0){
            if (global.race['kindling_kindred']){
                global.city['smelter'].Wood = 0;
            }
            let coal_fuel = global.race['kindling_kindred'] ? 0.15 : 0.25;
            let consume_wood = global.city['smelter'].Wood * 3 * time_multiplier;
            let consume_coal = global.city['smelter'].Coal * coal_fuel * time_multiplier;
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
                consume_coal -= coal_fuel * time_multiplier;
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

            breakdown.p.consume.Lumber['Smelter'] = -(consume_wood) / time_multiplier;
            breakdown.p.consume.Coal['Smelter'] = -(consume_coal) / time_multiplier;
            breakdown.p.consume.Oil['Smelter'] = -(consume_oil) / time_multiplier;

            modRes('Lumber',-(consume_wood));
            modRes('Coal',-(consume_coal));
            modRes('Oil',-(consume_oil));

            //Steel Production
            if (global.resource.Steel.display){
                let steel_bd = {};
                let iron_consume = steel_smelter * 2 * time_multiplier;
                let coal_consume = steel_smelter * 0.25 * time_multiplier;
                while ((iron_consume > global.resource.Iron.amount && iron_consume > 0) || (coal_consume > global.resource.Coal.amount && coal_consume > 0)){
                    iron_consume -= 2 * time_multiplier;
                    coal_consume -= 0.25 * time_multiplier;
                    steel_smelter--;
                }
                
                let steel_multiplier = global.tech['smelting'] >= 4 ? 1.2 : 1;
                if (global.tech['smelting'] >= 5){
                    steel_multiplier *= 1.2;
                }
                if (global.tech['smelting'] >= 6){
                    steel_multiplier *= 1.2;
                }
                
                steel_multiplier *= tax_multiplier;
                steel_multiplier *= hunger;
                delta = steel_smelter * steel_multiplier * global_multiplier * time_multiplier;

                steel_bd['Smelter'] = steel_smelter * steel_multiplier;

                if (global.race['pyrophobia']){
                    delta *= 0.9;
                    steel_bd['Smelter'] *= 0.9;
                }
                let titanium = steel_bd['Smelter'];
                steel_bd['Smelter'] = steel_bd['Smelter'] + 'v';
                steel_bd['Hunger'] = ((hunger - 1) * 100) + '%';
                steel_bd['Taxes'] = ((tax_multiplier * 100) - 100)  + '%';
                breakdown.p['Steel'] = steel_bd;

                breakdown.p.consume.Coal['Smelter'] -= coal_consume / time_multiplier;
                breakdown.p.consume.Iron['Smelter'] = -(iron_consume) / time_multiplier;

                modRes('Steel',delta);
                modRes('Iron',-(iron_consume));
                modRes('Coal',-(coal_consume));
                
                if (global.tech['titanium'] && global.tech['titanium'] >= 1){
                    let divisor = global.tech['titanium'] >= 3 ? 10 : 25;
                    modRes('Titanium',delta / divisor);
                    titanium_bd['Steel'] = (titanium / divisor) + 'v';
                }
            }
        }                

        // Lumber
        let lumber_bd = {};
        let lum_multiplier = (global.tech['axe'] && global.tech['axe'] > 0 ? (global.tech['axe'] - 1) * 0.35 : 0) + 1;
        lumber_bd['Lumberjacks'] = lum_multiplier * racialTrait(global.civic.lumberjack.workers,'lumberjack');
        lum_multiplier *= tax_multiplier;
        if (global.city.powered && global.city.sawmill && p_on['sawmill']){
            lum_multiplier *= 1 + (p_on['sawmill'] * 0.05);
            lumber_bd['Sawmill'] = p_on['sawmill'] * 5;
        }
        lum_multiplier *= racialTrait(global.civic.lumberjack.workers,'lumberjack');
        lum_multiplier *= hunger;
        let lum_impact = global.city.biome === 'forest' ? (global.civic.lumberjack.impact * 1.1) : global.civic.lumberjack.impact;
        delta = global.civic.lumberjack.workers * lum_impact * lum_multiplier * global_multiplier * time_multiplier;
        modRes('Lumber',delta);
        lumber_bd['Lumberjacks'] = (lumber_bd['Lumberjacks'] * lum_impact * global.civic.lumberjack.workers) + 'v';
        lumber_bd['Sawmill'] = lumber_bd['Sawmill'] + '%';
        lumber_bd['Hunger'] = ((hunger - 1) * 100) + '%';
        lumber_bd['Taxes'] = ((tax_multiplier * 100) - 100)  + '%';
        breakdown.p['Lumber'] = lumber_bd;
        
        // Stone
        let stone_bd = {};
        let stone_multiplier = (global.tech['hammer'] && global.tech['hammer'] > 0 ? global.tech['hammer'] * 0.4 : 0) + 1;
        if (global.tech['explosives'] && global.tech['explosives'] >= 2){
            stone_multiplier *= global.tech['explosives'] >= 3 ? 1.75 : 1.5;
        }
        stone_bd['Workers'] = stone_multiplier * racialTrait(global.civic.quarry_worker.workers,'miner');
        stone_multiplier *= tax_multiplier;
        stone_multiplier *= racialTrait(global.civic.quarry_worker.workers,'miner');
        if (global.city['rock_quarry'] && global.city.rock_quarry['on']){
            stone_multiplier *= 1 + (p_on['rock_quarry'] * 0.05);
            stone_bd['Power'] = p_on['rock_quarry'] * 5;
        }
        stone_multiplier *= hunger;
        delta = global.civic.quarry_worker.workers * global.civic.quarry_worker.impact * stone_multiplier * global_multiplier * time_multiplier;
        modRes('Stone',delta);
        stone_bd['Workers'] = (stone_bd['Workers'] * global.civic.quarry_worker.workers) + 'v';
        stone_bd['Power'] = stone_bd['Power'] + '%';
        stone_bd['Hunger'] = ((hunger - 1) * 100) + '%';
        stone_bd['Taxes'] = ((tax_multiplier * 100) - 100)  + '%';
        breakdown.p['Stone'] = stone_bd;
        
        // Copper
        if (global.resource.Copper.display){
            let copper_bd = {};
            let copper_multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.15 : 0) + 1;
            if (global.tech['explosives'] && global.tech['explosives'] >= 2){
                copper_multiplier *= global.tech['explosives'] >= 3 ? 1.4 : 1.25;
            }
            if (global.tech['copper']){
                copper_multiplier *= 1.2;
            }
            copper_bd['Miners'] = copper_multiplier * racialTrait(global.civic.miner.workers,'miner');
            copper_multiplier *= tax_multiplier;
            copper_multiplier *= racialTrait(global.civic.miner.workers,'miner');
            if (global.city['mine']['on']){
                copper_multiplier *= 1 + (p_on['mine'] * 0.05);
                copper_bd['Power'] = p_on['mine'] * 5;
            }
            if (global.race['tough']){
                copper_multiplier *= 1.1;
                copper_bd['Miners'] *= 1.1;
            }
            if (global.race['industrious']){
                let bonus = 1 + (global.race['industrious'] / 50);
                copper_multiplier *= bonus;
                copper_bd['Miners'] *= bonus;
            }
            copper_multiplier *= hunger;
            delta = (global.civic.miner.workers / 7) * copper_multiplier * global_multiplier * time_multiplier;
            modRes('Copper',delta);
            copper_bd['Miners'] = (copper_bd['Miners'] * (global.civic.miner.workers / 7)) + 'v';
            copper_bd['Power'] = copper_bd['Power'] + '%';
            copper_bd['Hunger'] = ((hunger - 1) * 100) + '%';
            copper_bd['Taxes'] = ((tax_multiplier * 100) - 100)  + '%';
            breakdown.p['Copper'] = copper_bd;
        }
        
        // Iron
        if (global.resource.Iron.display){
            let iron_bd = {};
            var iron_multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.15 : 0) + 1;
            if (global.tech['explosives'] && global.tech['explosives'] >= 2){
                iron_multiplier *= global.tech['explosives'] >= 3 ? 1.4 : 1.25;
            }
            let iron_tools = iron_multiplier;
            iron_multiplier *= tax_multiplier;
            iron_multiplier *= (1 + (iron_smelter * 0.1));
            iron_multiplier *= racialTrait(global.civic.miner.workers,'miner');
            let bd_power = 0;
            if (global.city['mine']['on']){
                iron_multiplier *= 1 + (p_on['mine'] * 0.05);
                bd_power = p_on['mine'] * 5;
            }
            if (global.race['tough']){
                iron_multiplier *= 1.1;
                iron_tools *= 1.1;
            }
            if (global.race['industrious']){
                let bonus = 1 + (global.race['industrious'] / 50);
                iron_multiplier *= bonus;
                iron_tools *= bonus;
            }
            iron_multiplier *= hunger;
            delta = (global.civic.miner.workers / 4) * iron_multiplier * global_multiplier * time_multiplier;
            modRes('Iron',delta);

            iron_bd['Miners'] = (global.civic.miner.workers / 4) * iron_tools * racialTrait(global.civic.miner.workers,'miner') + 'v';
            iron_bd['Smelter'] = (iron_smelter * 10) + '%';
            iron_bd['Power'] = bd_power + '%';
            iron_bd['Hunger'] = ((hunger - 1) * 100) + '%';
            iron_bd['Taxes'] = ((tax_multiplier * 100) - 100)  + '%';
            breakdown.p['Iron'] = iron_bd;

            if (global.tech['titanium'] && global.tech['titanium'] >= 2){
                let iron = (global.civic.miner.workers / 4) * iron_smelter * 0.1;
                delta = iron * global_multiplier * time_multiplier;
                let divisor = global.tech['titanium'] >= 3 ? 10 : 25;
                modRes('Titanium',delta / divisor);
                titanium_bd['Iron'] = (iron / divisor) + 'v';
            }
        }
        breakdown.p['Titanium'] = titanium_bd;
        
        // Coal
        if (global.resource.Coal.display){
            let coal_bd = {};
            var coal_multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.12 : 0) + 1;
            let bd_tools = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.12 : 0) + 1;
            if (global.tech['explosives'] && global.tech['explosives'] >= 2){
                coal_multiplier *= global.tech['explosives'] >= 3 ? 1.4 : 1.25;
                bd_tools *= global.tech['explosives'] >= 3 ? 1.4 : 1.25;
            }
            coal_multiplier *= tax_multiplier;
            coal_multiplier *= racialTrait(global.civic.coal_miner.workers,'miner');
            let bd_power = 0;
            if (global.city['coal_mine']['on']){
                coal_multiplier *= 1 + (p_on['coal_mine'] * 0.05);
                bd_power = (p_on['coal_mine'] * 5);
            }
            if (global.race['tough']){
                coal_multiplier *= 1.1;
                bd_tools *= 1.1;
            }
            if (global.race['resilient']){
                let bonus = 1 + (global.race['resilient'] / 50);
                coal_multiplier *= bonus;
                bd_tools *= bonus;
            }
            coal_multiplier *= hunger;
            delta = global.civic.coal_miner.workers * global.civic.coal_miner.impact * coal_multiplier * global_multiplier * time_multiplier;
            modRes('Coal',delta);

            coal_bd['Miners'] = (global.civic.coal_miner.workers * global.civic.coal_miner.impact * bd_tools * racialTrait(global.civic.coal_miner.workers,'miner')) + 'v';
            coal_bd['Power'] = bd_power + '%';
            coal_bd['Hunger'] = ((hunger - 1) * 100) + '%';
            coal_bd['Taxes'] = ((tax_multiplier * 100) - 100)  + '%';
            breakdown.p['Coal'] = coal_bd;

            // Uranium
            if (global.resource.Uranium.display){
                modRes('Uranium',delta / 115);
                uranium_bd['Miners'] = (global.civic.coal_miner.workers * global.civic.coal_miner.impact * coal_multiplier / 115) + 'v';
            }
        }
        breakdown.p['Uranium'] = uranium_bd;
        
        // Oil
        if (global.city['oil_well']){
            let oil_bd = {};
            let oil_multiplier = global.tech['oil'] >= 4 ? 0.48 : 0.4;
            if (global.tech['oil'] >= 5){
                oil_multiplier *= global.tech['oil'] >= 6 ? 1.75 : 1.25;
            }
            let derrick_bd = global.city.oil_well.count * oil_multiplier;
            oil_multiplier *= hunger;
            oil_multiplier *= tax_multiplier;
            delta = global.city.oil_well.count * oil_multiplier * global_multiplier * time_multiplier;
            modRes('Oil',delta);

            oil_bd['Derrick'] = derrick_bd + 'v';
            oil_bd['Hunger'] = ((hunger - 1) * 100) + '%';
            oil_bd['Taxes'] = ((tax_multiplier * 100) - 100)  + '%';
            breakdown.p['Oil'] = oil_bd;
        }

        // Tax Income
        if (global.tech['currency'] >= 1){
            var income = (global.resource[races[global.race.species].name].amount + global.civic.garrison.workers - (global.race['carnivore'] ? 0 : global.civic.free)) * ( global.race['greedy'] ? 1.75 : 2 );
            income /= 5;
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
                    let impact = global.civic.banker.impact;
                    if (global.tech['banking'] >= 10){
                        impact += 0.02 * global.tech['stock_exchange'];
                    }
                    income *= 1 + (global.civic.banker.workers * impact);
                }
            }
            else {
                income = income / 2;
            }
            money_bd['Taxes'] = (income * tax_rate) + 'v';
            
            income *= tax_rate * global_multiplier * time_multiplier;
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 4){
                income *= 1 + (global.city.temple.count * 0.025);
                money_bd['Temple'] = (global.city.temple.count * 2.5) + '%';
            }
            
            modRes('Money',+(income).toFixed(2));
        }
        breakdown.p['Money'] = money_bd;

        // Detect new unlocks
        if (!global.settings.showResearch && (global.resource.Lumber.amount >= 5 || global.resource.Stone.amount >= 6)){
            global.settings.showResearch = true;
        }

        // Power grid state
        global.city.power_total = -max_power;
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
    
    if (global.civic['garrison'] && global.civic.garrison.workers < global.civic.garrison.max){
        let rate = global.race['diverse'] ? 2 : 2.5;
        global.civic.garrison.progress += rate * time_multiplier;
        if (global.race['brute']){
            global.civic.garrison.progress += 2.5 * time_multiplier;
        }
        if (global.civic.garrison.progress >= 100){
            global.civic.garrison.progress = 0;
            global.civic.garrison.workers++;
        }
    }

    // main resource delta tracking
    Object.keys(global.resource).forEach(function (res) {
        if (global['resource'][res].rate > 0){
            diffCalc(res,main_timer);
        }
    });
}

function midLoop(){
    if (global.race.species === 'protoplasm'){
        var caps = {
            RNA: 100,
            DNA: 100
        };
        if (global.evolution['membrane']){
            let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 5 + 5 : 5;
            caps['RNA'] += global.evolution['membrane'].count * effect;
        }
        if (global.evolution['eukaryotic_cell']){
            let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 10 + 10 : 10;
            caps['DNA'] += global.evolution['eukaryotic_cell'].count * effect;
        }

        global.resource.RNA.max = caps['RNA'];
        global.resource.DNA.max = caps['DNA'];

        Object.keys(actions.evolution).forEach(function (action){
            if (actions.evolution[action] && actions.evolution[action].cost){
                let element = $('#'+actions.evolution[action].id);
                if (element.length > 0){
                    if (checkAffordable('evolution',action)){
                        if (element.hasClass('cna')){
                            element.removeClass('cna');
                        }
                    }
                    else if (!element.hasClass('cna')){
                        element.addClass('cna');
                    }
                }
            }
        });
    }
    else {
        // Resource caps
        var caps = {
            Money: 1000,
            Knowledge: 100,
            Food: 1000,
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
            entertainer: 0,
            professor: 0,
            scientist: 0,
            garrison: 0
        };

        var bd_Money = { Base: caps['Money']+'v' };
        var bd_Citizen = {};
        var bd_Knowledge = { Base: caps['Knowledge']+'v' };
        var bd_Food = { Base: caps['Food']+'v' };
        var bd_Lumber = { Base: caps['Lumber']+'v' };
        var bd_Stone = { Base: caps['Stone']+'v' };
        var bd_Furs = { Base: caps['Furs']+'v' };
        var bd_Copper = { Base: caps['Copper']+'v' };
        var bd_Iron = { Base: caps['Iron']+'v' };
        var bd_Cement = { Base: caps['Cement']+'v' };
        var bd_Coal = { Base: caps['Coal']+'v' };
        var bd_Oil = { Base: caps['Oil']+'v' };
        var bd_Uranium = { Base: caps['Uranium']+'v' };
        var bd_Steel = { Base: caps['Steel']+'v' };
        var bd_Titanium = { Base: caps['Titanium']+'v' };
        var bd_Alloy = { Base: caps['Alloy']+'v' };
        var bd_Polymer = { Base: caps['Polymer']+'v' };

        caps[races[global.race.species].name] = 0;
        if (global.city['farm']){
            lCaps['farmer'] += global.city['farm'].count;
            if (global.tech['farm']){
                caps[races[global.race.species].name] += global.city['farm'].count;
                bd_Citizen['Farm'] = global.city['farm'].count + 'v';
            }
        }
        if (global.city['storage_yard']){
            let size = global.tech.container >= 3 ? 100 : 50;
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                size *= 2;
            }
            caps['Crates'] += (global.city['storage_yard'].count * size);
            Object.keys(caps).forEach(function (res){
                caps['Crates'] -= global.resource[res].crates;
            });
        }
        if (global.city['warehouse']){
            let volume = global.tech['steel_container'] >= 2 ? 100 : 50;
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                volume *= 2;
            }
            caps['Containers'] += (global.city['warehouse'].count * volume);
            Object.keys(caps).forEach(function (res){
                caps['Containers'] -= global.resource[res].containers;
            });
        }
        if (global.city['rock_quarry']){
            lCaps['quarry_worker'] += global.city['rock_quarry'].count;
            let gain = (global.city['rock_quarry'].count * spatialReasoning(100));
            caps['Stone'] += gain;
            bd_Stone['Quarry'] = gain+'v';
        }
        if (global.city['lumber_yard']){
            lCaps['lumberjack'] += global.city['lumber_yard'].count * 2;
            let gain = (global.city['lumber_yard'].count * spatialReasoning(100));
            caps['Lumber'] += gain;
            bd_Lumber['Lumber_Yard'] = gain+'v';
        }
        if (global.city['sawmill']){
            let gain = (global.city['sawmill'].count * spatialReasoning(200));
            caps['Lumber'] += gain;
            bd_Lumber['Sawmill'] = gain+'v';
            let impact = global.tech['saw'] >= 2 ? 0.08 : 0.05;
            global.civic.lumberjack.impact = (global.city['sawmill'].count * impact) + 1;
        }
        if (global.city['mine']){
            lCaps['miner'] += global.city['mine'].count;
        }
        if (global.city['bank']){
            lCaps['banker'] += global.city['bank'].count;
        }
        if (global.city['amphitheatre']){
            lCaps['entertainer'] += global.city['amphitheatre'].count;
        }
        if (global.city['cement_plant']){
            lCaps['cement_worker'] += global.city['cement_plant'].count * 2;
        }
        if (global.city['garrison']){
            lCaps['garrison'] += global.city.garrison.count * (global.tech['military'] >= 5 ? 3 : 2);
            if (global.race['chameleon']){
                lCaps['garrison'] -= global.city.garrison.count;
            }
        }
        if (global.city['basic_housing']){
            caps[races[global.race.species].name] += global.city['basic_housing'].count;
            bd_Citizen[basicHousingLabel()] = global.city['basic_housing'].count + 'v';
        }
        if (global.city['cottage']){
            caps[races[global.race.species].name] += global.city['cottage'].count * 2;
            bd_Citizen['Cottage'] = (global.city['cottage'].count * 2) + 'v';
            if (global.tech['home_safe']){
                let gain = (global.city['cottage'].count * spatialReasoning(1000));
                caps['Money'] += gain;
                bd_Money['Cottage'] = gain+'v';
            }
        }
        if (global.city['apartment']){
            caps[races[global.race.species].name] += global.city['apartment'].on * 5;
            bd_Citizen['Apartment'] = (global.city['apartment'].on * 5)+'v';
            if (global.tech['home_safe']){
                let gain = (global.city['apartment'].on * spatialReasoning(2000));
                caps['Money'] += gain;
                bd_Money['Apartment'] = gain+'v';
            }
        }
        if (global.city['lodge']){
            caps[races[global.race.species].name] += global.city['lodge'].count;
        }
        if (global.city['shed']){
            var multiplier = (global.tech['storage'] - 1) * 0.5 + 1;
            let gain = 0;
            let label = global.tech['storage'] <= 2 ? 'Shed' : (global.tech['storage'] >= 4 ? 'Warehouse' : 'Barn');
            if (global.race['pack_rat']){
                multiplier *= 1.05;
            }
            if (global.tech['storage'] >= 6){
                multiplier *= 1 + (global.tech['supercollider'] / 20);
            }
            if (global.tech['storage'] >= 3){
                multiplier *= global.tech['storage'] >= 4 ? 2 : 1.5;
                gain = (global.city['shed'].count * (spatialReasoning(25) * multiplier));
                caps['Steel'] += gain;
                bd_Steel[label] = gain+'v';
            }
            if (global.tech['storage'] >= 4){
                gain = (global.city['shed'].count * (spatialReasoning(10) * multiplier));
                caps['Titanium'] += gain;
                bd_Titanium[label] = gain+'v';
            }
            gain = (global.city['shed'].count * (spatialReasoning(200) * multiplier));
            caps['Lumber'] += gain;
            bd_Lumber[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(200) * multiplier));
            caps['Stone'] += gain;
            bd_Stone[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(100) * multiplier));
            caps['Furs'] += gain;
            bd_Furs[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(75) * multiplier));
            caps['Copper'] += gain;
            bd_Copper[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(100) * multiplier));
            caps['Iron'] += gain;
            bd_Iron[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(80) * multiplier));
            caps['Cement'] += gain;
            bd_Cement[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(50) * multiplier));
            caps['Coal'] += gain;
            bd_Coal[label] = gain+'v';
        }
        if (global.city['silo']){
            let gain = (global.city['silo'].count * spatialReasoning(500));
            caps['Food'] += gain;
            bd_Food['Silo'] = gain+'v';
        }
        if (global.city['smokehouse']){
            let gain = (global.city['smokehouse'].count * spatialReasoning(500));
            caps['Food'] += gain;
            bd_Food['Smoke_House'] = gain+'v';
        }
        if (global.city['oil_well']){
            let gain = (global.city['oil_well'].count * spatialReasoning(500));
            caps['Oil'] += gain;
            bd_Oil['Oil_Derrick'] = gain+'v';
        }
        if (global.city['oil_depot']){
            let gain = (global.city['oil_depot'].count * spatialReasoning(1000));
            caps['Oil'] += gain;
            bd_Oil['Fuel_Depot'] = gain+'v';
            if (global.tech['uranium'] >= 2){
                gain = (global.city['oil_depot'].count * spatialReasoning(250));
                caps['Uranium'] += gain;
                bd_Uranium['Fuel_Depot'] = gain+'v';
            }
        }
        if (global.city['university']){
            let multiplier = 1;
            let base = global.tech['science'] && global.tech['science'] >= 8 ? 700 : 500;
            if (global.tech['science'] >= 4){
                multiplier += global.city['library'].count * 0.02;
            }
            if (global.race['hard_of_hearing']){
                multiplier *= 0.95;
            }
            let gain = (global.city['university'].count * base * multiplier);
            lCaps['professor'] += global.city['university'].count;
            if (global.tech['supercollider']){
                let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            caps['Knowledge'] += gain;
            bd_Knowledge['University'] = gain+'v';
        }
        if (global.city['library']){
            let shelving = (global.race['nearsighted'] ? 110 : 125);
            if (global.tech['science'] && global.tech['science'] >= 8){
                shelving *= 1.4;
            }
            if (global.tech['science'] && global.tech['science'] >= 5){
                shelving *= 1 + (global.civic.scientist.workers * 0.12);
            }
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 2){
                shelving *= 1 + (global.city.temple.count * 0.05);
            }
            let gain = Math.round(global.city['library'].count * shelving);
            caps['Knowledge'] += gain;
            bd_Knowledge['Library'] = gain+'v';
            if (global.tech['science'] && global.tech['science'] >= 3){
                global.civic.professor.impact = 0.5 + (global.city.library.count * 0.01)
            }
        }
        if (global.city['wardenclyffe']){
            let gain = global.city['wardenclyffe'].count * 1000;
            lCaps['scientist'] += global.city['wardenclyffe'].count;
            let powered_gain = global.tech['science'] >= 7 ? 1500 : 1000;
            gain += (p_on['wardenclyffe'] * powered_gain);
            if (global.tech['supercollider']){
                let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            caps['Knowledge'] += gain;
            bd_Knowledge['Wardenclyffe'] = gain+'v';
        }
        if (global.city['biolab']){
            caps['Knowledge'] += (p_on['biolab'] * 3000);
            bd_Knowledge['Bio_Lab'] = (p_on['biolab'] * 3000)+'v';
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
            if (global.tech['stock_exchange']){
                vault *= 1 + (global.tech['stock_exchange'] * 0.1);
            }
            let gain = (global.city['bank'].count * spatialReasoning(vault));
            caps['Money'] += gain;
            bd_Money['Bank'] = gain+'v';
        }
        if (global.tech['banking'] >= 4){
            let cm = 250;
            if (global.tech['banking'] >= 11){
                cm = 1000;
            }
            else if (global.tech['banking'] >= 6){
                cm = 600;
            }
            let gain = cm * (global.resource[races[global.race.species].name].amount + global.civic.garrison.workers);
            caps['Money'] += gain;
            bd_Money['Bonds'] = gain+'v';
        }

        if (global.city['trade']){
            let routes = global.race['xenophobic'] ? global.tech.trade : global.tech.trade + 1;
            global.city.market.mtrade = routes * global.city.trade.count;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 3){
                global.city.market.mtrade += global.city.temple.count;
            }
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

        breakdown.c = {
            Money: bd_Money,
            [races[global.race.species].name]: bd_Citizen,
            Knowledge: bd_Knowledge,
            Food: bd_Food,
            Lumber: bd_Lumber,
            Stone: bd_Stone,
            Furs: bd_Furs,
            Copper: bd_Copper,
            Iron: bd_Iron,
            Cement: bd_Cement,
            Coal: bd_Coal,
            Oil: bd_Oil,
            Uranium: bd_Uranium,
            Steel: bd_Steel,
            Titanium: bd_Titanium,
            Alloy: bd_Alloy,
            Polymer: bd_Polymer
        };

        let create_value = global.tech['container'] && global.tech['container'] >= 2 ? 30 : 25;
        let container_value = global.tech['steel_container'] && global.tech['steel_container'] >= 3 ? 75 : 50;
        if (global.race['pack_rat']){
            create_value += global.tech.container >= 2 ? 2 : 1;
            container_value += global.tech.steel_container >= 3 ? 3 : 2;
        }
        if (global.tech['container'] && global.tech['container'] >= 4){
            create_value += 10;
        }
        Object.keys(caps).forEach(function (res){
            let crate = global.resource[res].crates * create_value;
            caps[res] += crate;
            let container = global.resource[res].containers * container_value;
            caps[res] += container;
            if (breakdown.c[res]){
                breakdown.c[res]['Crates'] = crate+'v';
                breakdown.c[res]['Containers'] = container+'v';
            }
            global.resource[res].max = caps[res];
            if (global.resource[res].amount > global.resource[res].max){
                global.resource[res].amount = global.resource[res].max;
            }
            else if (global.resource[res].amount < 0){
                global.resource[res].amount = 0;
            }
            if (global.resource[res].amount >= global.resource[res].max * 0.99){
                if (!$(`#res${res} .count`).hasClass('has-text-warning')){
                    $(`#res${res} .count`).addClass('has-text-warning');
                }
            }
            else if ($(`#res${res} .count`).hasClass('has-text-warning')){
                $(`#res${res} .count`).removeClass('has-text-warning');
            }
        });
        
        Object.keys(lCaps).forEach(function (job){
            global.civic[job].max = lCaps[job];
            if (global.civic[job].workers > global.civic[job].max){
                global.civic[job].workers = global.civic[job].max;
            }
            else if (global.civic[job].workers < 0){
                global.civic[job].workers = 0;
            }
        });

        Object.keys(global.city).forEach(function (action){
            if (actions.city[action] && actions.city[action].cost){
                let element = $('#'+actions.city[action].id);
                if (checkAffordable('city',action)){
                    if (element.hasClass('cna')){
                        element.removeClass('cna');
                    }
                }
                else if (!element.hasClass('cna')){
                    element.addClass('cna');
                }
            }
        });

        Object.keys(actions.tech).forEach(function (action){
            if (actions.tech[action] && actions.tech[action].cost){
                let element = $('#'+actions.tech[action].id);
                if (element.length > 0){
                    if (checkAffordable('tech',action)){
                        if (element.hasClass('cna')){
                            element.removeClass('cna');
                        }
                    }
                    else if (!element.hasClass('cna')){
                        element.addClass('cna');
                    }
                }
            }
        });

        if (global.arpa['sequence'] && global.arpa.sequence.on){
            global.arpa.sequence.time -= global.city.biolab.on;
            global.arpa.sequence.progress = global.arpa.sequence.max - global.arpa.sequence.time;
            if (global.arpa.sequence.time <= 0){
                global.arpa.sequence.max = 50000 * (1 + (global.race.mutation ** 2));
                if (global.race['adaptable']){
                    global.arpa.sequence.max = Math.floor(global.arpa.sequence.max * 0.9);
                }
                global.arpa.sequence.progress = 0;
                global.arpa.sequence.time = global.arpa.sequence.max;
                if (global.tech['genetics'] === 2){
                    global.tech['genetics'] = 3;
                }
                else {
                    global.race.mutation++;
                    randomMinorTrait();
                    messageQueue('Gene therapy has resulted in a permanent improvement to your species.','success');
                    global.stats.plasmid++;
                    global.race.Plasmid.count++;
                }
                arpa('Genetics');
                drawTech();
            }
        }

        if (global.city['foundry']){
            let fworkers = global.civic.craftsman.workers;
            Object.keys(craftCost).forEach(function (craft){
                while (global.city.foundry[craft] > fworkers && global.city.foundry[craft] > 0){
                    global.city.foundry[craft]--;
                    global.city.foundry.crafting--;
                }
                fworkers -= global.city.foundry[craft];
            });
        }

        if (global.tech['foundry'] === 3 && global.race['kindling_kindred']){
            global.tech['foundry'] = 4;
        }

        checkAchievements();
    }
    Object.keys(global.resource).forEach(function (res){
        $(`[data-${res}]`).each(function (i,v){
            if (global.resource[res].amount < $(this).attr(`data-${res}`)){
                if ($(this).hasClass('has-text-dark')){
                    $(this).removeClass('has-text-dark');
                    $(this).addClass('has-text-danger');
                }
            }
            else if ($(this).hasClass('has-text-danger')){
                $(this).removeClass('has-text-danger');
                $(this).addClass('has-text-dark');
            }
        });
    });
}

function longLoop(){
    if (global.race.species !== 'protoplasm'){
        
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

        if (global.city.calendar.day > 0){
            // Time
            global.city.calendar.day++;
            global.stats.days++;
            if (global.city.calendar.day > global.city.calendar.orbit){
                global.city.calendar.day = 1;
                global.city.calendar.year++;
            }

            let season_length = Math.round(global.city.calendar.orbit / 4);
            let days = global.city.calendar.day;
            let season = 0;
            while (days > season_length){
                days -= season_length;
                season++;
            }
            global.city.calendar.season = season;

            // Weather
            if (Math.rand(0,5) === 0){
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

                switch(global.city.calendar.season){
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
                    if (global.city.calendar.season === 1 && new_temp === 0){
                        new_temp = 1;
                    }
                    global.city.calendar.temp = new_temp;
                }
                else if (temp === 2){
                    let new_temp = global.city.calendar.temp + 1;
                    if (new_temp > 2){
                        new_temp = 2;
                    }
                    if (global.city.calendar.season === 3 && new_temp === 2){
                        new_temp = 1;
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

            // Crafting
            if (global.city.calendar.moon === 0 && global.tech['foundry']){
                let craft_costs = global.race['resourceful'] ? 0.95 : 1;
                Object.keys(craftCost).forEach(function (craft){
                    let num = global.city.foundry[craft];
                    let craft_ratio = craftingRatio(craft);
                    if (num > 0){
                        while (num > 0){
                            if (global.resource[craftCost[craft].r].amount >= craftCost[craft].a * craft_costs){
                                global.resource[craftCost[craft].r].amount -= craftCost[craft].a * craft_costs;
                                global.resource[craft].amount += craft_ratio;
                            }
                            num--;
                        }
                    }
                });
            }

            setWeather();
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
                    case 'trait':
                        if (!global.race[events[event].reqs[req]]){
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

    // Save game state
    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
}

function diffCalc(res,period){
    let sec = global.race['slow'] ? 1100 : (global.race['hyper'] ? 950 : 1000);
    global.resource[res].diff = +(global.resource[res].delta / (period / sec)).toFixed(2);
    global.resource[res].delta = 0;
    if (global.resource[res].diff < 0 && !$(`#res${res} .diff`).hasClass('has-text-danger')){
        $(`#res${res} .diff`).addClass('has-text-danger');
    }
    else if (global.resource[res].diff >= 0 && $(`#res${res} .diff`).hasClass('has-text-danger')){
        $(`#res${res} .diff`).removeClass('has-text-danger');
    }
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
