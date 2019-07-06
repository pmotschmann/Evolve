import { global, vues, save, poppers, messageQueue, modRes, breakdown, keyMultiplier, p_on, moon_on, red_on, belt_on, set_qlevel, achieve_level } from './vars.js';
import { loc, locales } from './locale.js';
import { setupStats, checkAchievements } from './achieve.js';
import { races, racialTrait, randomMinorTrait } from './races.js';
import { defineResources, resource_values, spatialReasoning, craftCost, plasmidBonus, tradeRatio, craftingRatio, crateValue, containerValue } from './resources.js';
import { defineJobs, job_desc } from './jobs.js';
import { defineGovernment, defineGarrison, armyRating } from './civics.js';
import { actions, checkCityRequirements, checkTechRequirements, checkOldTech, addAction, storageMultipler, checkAffordable, drawTech, evoProgress, basicHousingLabel, oldTech, f_rate, setPlanet } from './actions.js';
import { space, fuel_adjust } from './space.js';
import { events } from './events.js';
import { arpa } from './arpa.js';

var intervals = {};

if (Object.keys(locales).length > 1){
    $('#localization').append($(`<span>${loc('locale')}: <select @change="lChange()" :v-model="locale"></select></span>`));
    Object.keys(locales).forEach(function (locale){
        let selected = global.settings.locale === locale ? ' selected=selected' : '';
        $('#localization select').append($(`<option value="${locale}"${selected}>${locales[locale]}</option>`));
    });
}

let settings = {
    data: global.settings,
    methods: {
        lChange(){
            global.settings.locale = $('#localization select').children("option:selected").val();
            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
            window.location.reload();
        },
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
        },
        redgreen(){
            global.settings.theme = 'redgreen';
            $('html').removeClass();
            $('html').addClass('redgreen');
        },
        keys(){
            return loc('settings1');
        },
        animation(){
            return loc('settings2');
        },
        hard(){
            return loc('settings3');
        },
        soft(){
            return loc('settings4');
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

if (global['new']){
    messageQueue(loc('new'), 'warning');
    global['new'] = false;
}

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
    if (global.city.morale.unemployed !== 0){
        let type = global.city.morale.unemployed > 0 ? 'success' : 'danger';
        popper.append(`<p>${loc('morale_unemployed')}<span class="has-text-${type}"> ${global.city.morale.unemployed}%</span></p>`);
    }
    if (global.city.morale.stress !== 0){
        let type = global.city.morale.stress > 0 ? 'success' : 'danger';
        popper.append(`<p>${loc('morale_stress')}<span class="has-text-${type}"> ${global.city.morale.stress}%</span></p>`);
    }
    if (global.city.morale.leadership !== 0){
        let type = global.city.morale.leadership > 0 ? 'success' : 'danger';
        popper.append(`<p>${loc('morale_leadership')}<span class="has-text-${type}"> ${global.city.morale.leadership}%</span></p>`);
    }
    if (global.city.morale.warmonger !== 0){
        let type = global.city.morale.warmonger > 0 ? 'success' : 'danger';
        popper.append(`<p>${loc('morale_warmonger')}<span class="has-text-${type}"> ${global.city.morale.warmonger}%</span></p>`);
    }
    if (global.city.morale.entertain !== 0){
        let type = global.city.morale.entertain > 0 ? 'success' : 'danger';
        popper.append(`<p>${loc('morale_entertainment')}<span class="has-text-${type}"> ${global.city.morale.entertain}%</span></p>`);
    }
    if (global.city.morale.season !== 0){
        let season = global.city.calendar.season === 0 ? 'Spring' : 'Winter';
        let type = global.city.morale.season > 0 ? 'success' : 'danger';
        popper.append(`<p>${season}<span class="has-text-${type}"> ${global.city.morale.season}%</span></p>`);
    }
    if (global.city.morale.weather !== 0){
        let type = global.city.morale.weather > 0 ? 'success' : 'danger';
        popper.append(`<p>${loc('morale_weather')}<span class="has-text-${type}"> ${global.city.morale.weather}%</span></p>`);
    }
    if (global.city.morale.tax !== 0){
        let type = global.city.morale.tax > 0 ? 'success' : 'danger';
        popper.append(`<p>${loc('morale_taxes')}<span class="has-text-${type}"> ${global.city.morale.tax}%</span></p>`);
    }
    let total = 100 + global.city.morale.stress + global.city.morale.entertain + global.city.morale.season + global.city.morale.weather + global.city.morale.tax + global.city.morale.warmonger + global.city.morale.leadership;
    if (global.city.morale['frenzy']){
        let type = global.city.morale.frenzy > 0 ? 'success' : 'danger';
        popper.append(`<p>${loc('morale_frenzy')}<span class="has-text-${type}"> ${global.city.morale.frenzy}%</span></p>`);
    }
    
    if (total > moraleCap || total < 50){
        popper.append(`<div>${loc('morale_current')}<span class="has-text-warning"> ${global.city.morale.current}% (${total}%)</span></div>`);
    }
    else {
        popper.append(`<div>${loc('morale_current')}<span class="has-text-warning"> ${global.city.morale.current}%</span></div>`);
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
    popper.append(`<p>${loc('power_generated')}<span class="has-text-success"> +${global.city.power_total}</span></p>`);
    popper.append(`<p>${loc('power_consumed')}<span class="has-text-danger"> -${drain}</span></p>`);
    if (global.city.power > 0){
        popper.append(`<div>${loc('power_available')} <span class="has-text-success">${global.city.power}</span></div>`);
    }
    else {
        popper.append(`<div>${loc('power_available')} <span class="has-text-danger">${global.city.power}</span></div>`);
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
                        return global.city.calendar.wind === 1 ? loc('snowstorm') : loc('snow');
                    }
                    else {
                        return global.city.calendar.wind === 1 ? loc('thunderstorm') : loc('rain');
                    }
                case 1:
                    return global.city.calendar.wind === 1 ? loc('cloudy_windy') : loc('cloudy');
                case 2:
                    return global.city.calendar.wind === 1 ? loc('sunny_windy') : loc('sunny');
            }
        },
        temp(){
            switch(global.city.calendar.temp){
                case 0:
                    return loc('cold');// weather, cold weather may reduce food output.';
                case 1:
                    return loc('moderate');
                case 2:
                    return loc('hot');// weather, hot weather may reduce worker productivity.';
            }
        },
        moon(){
            if (global.city.calendar.moon === 0){
                return loc('moon1');
            }
            else if (global.city.calendar.moon > 0 && global.city.calendar.moon < 7){
                return loc('moon2');
            }
            else if (global.city.calendar.moon === 7){
                return loc('moon3');
            }
            else if (global.city.calendar.moon > 7 && global.city.calendar.moon < 14){
                return loc('moon4');
            }
            else if (global.city.calendar.moon === 14){
                return loc('moon5');
            }
            else if (global.city.calendar.moon > 14 && global.city.calendar.moon < 21){
                return loc('moon6');
            }
            else if (global.city.calendar.moon === 21){
                return loc('moon7');
            }
            else if (global.city.calendar.moon > 21){
                return loc('moon8');
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
        popper.append($(`<span>${loc('infant')}</span>`));
    }
    else {
        let planet = races[global.race.species].home;
        let race = races[global.race.species].name;
        let biome = global.city.biome;
        let orbit = global.city.calendar.orbit;
        popper.append($(`<span>${loc('home',[planet,race,biome,orbit])}</span>`));
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
    if (global.race.seeded && !global.race['chose']){
        Math.seed = global.race.seed;
        if (global.race.probes === 0){
            setPlanet();
        }
        else {
            let hell = false;
            for (let i=0; i<global.race.probes; i++){
                if (setPlanet(hell) === 'hellscape'){
                    hell = true;
                }
            }
        }
    }
    else {
        addAction('evolution','rna');
    }
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
        var late_actions = ['multicellular','spores','poikilohydric','bilateral_symmetry','bryophyte','athropods','mammals','eggshell','endothermic','ectothermic','humanoid','gigantism','dwarfism','animalism','aquatic','demonic','sentience','bunker','plasmid','trade','craft','crispr'];
        for (var i = 0; i < late_actions.length; i++){
            if (global.evolution[late_actions[i]] && global.evolution[late_actions[i]].count == 0){
                addAction('evolution',late_actions[i]);
            }
        }

        if (global.race.seeded){
            var race_options = ['human','orc','elven','troll','orge','cyclops','kobold','goblin','gnome','cath','wolven','centaur','tortoisan','gecko','slitheryn','arraak','pterodacti','dracnid','sporgar','shroomi','mantis','scorpid','antid','entish','cacti','sharkin','octigoran'];
            for (var i = 0; i < race_options.length; i++){
                if (global.evolution[race_options[i]] && global.evolution[race_options[i]].count == 0){
                    addAction('evolution',race_options[i]);
                }
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
        if (checkOldTech(tech)){
            oldTech(tech);
        }
    });
    space();
    setWeather();
}

setupStats();
q_check();

var fed = true;

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

var gene_sequence = global.arpa['sequence'] && global.arpa['sequence']['on'] ? global.arpa.sequence.on : 0;
function fastLoop(){
    keyMultiplier();
    
    breakdown.p['Global'] = {};
    var global_multiplier = 1;
    if (global.race.Plasmid.count > 0){
        breakdown.p['Global']['Plasmid'] = (plasmidBonus() * 100) + '%';
        global_multiplier += plasmidBonus();
    }
    if (global.race['no_plasmid']){
        if (global.city['temple'] && global.city['temple'].count){
            let temple_bonus = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 0.016 : 0.01;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                temple_bonus += global.civic.professor.workers * 0.0004;
            }
            let faith = global.city.temple.count * temple_bonus;
            breakdown.p['Global']['Faith'] = (faith * 100) + '%';
            global_multiplier *= (1 + faith);
        }
    }
    if (global.tech['world_control']){
        breakdown.p['Global']['Unification'] = '25%';
        global_multiplier *= 1.25;
    }
    if (global.genes['challenge'] && global.genes['challenge'] >= 2){
        breakdown.p['Global']['Mastery'] = (achieve_level * 0.25) + '%';
        global_multiplier *= 1 + (achieve_level * 0.0025);
    }
    if (global.race['suction_grip']){
        breakdown.p['Global']['Grip'] = '8%';
        global_multiplier *= 1.08;
    }
    if (global.race['intelligent']){
        let bonus = (global.civic.scientist.workers * 0.25) + (global.civic.professor.workers * 0.125);
        breakdown.p['Global']['Intelligence'] = bonus+'%';
        global_multiplier *= 1 + (bonus / 100);
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
        Aluminium: {},
        Steel: {},
        Titanium: {},
        Alloy: {},
        Polymer: {},
        Iridium: {},
        Helium_3: {},
        Neutronium: {},
        Elerium: {},
        Nano_Tube: {}
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
            modRes('DNA', increment * global_multiplier * time_multiplier);
            modRes('RNA', -(rna * 2 * time_multiplier));
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

        if (global.tech['m_boost']){
            global.city.morale.leadership = 20;
            morale += 20;
        }
        else {
            global.city.morale.leadership = 0;
        }

        if (global.race['frenzy']){
            if (!global.city.morale['frenzy']){
                global.city.morale['frenzy'] = 0;
            }

            if (global.race.frenzy > 1){
                let frenzy = Math.ceil(Math.log2(global.race.frenzy));
                global.city.morale.frenzy = frenzy;
                morale += frenzy;
            }
        }

        let weather_morale = 0;
        if (global.city.calendar.weather === 0){
            if (global.city.calendar.temp > 0){
                if (global.city.calendar.wind === 1){
                    // Thunderstorm
                    if (global.race['skittish']){
                        weather_morale = -12;
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
                weather_morale = -5;
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
        global.city.morale.weather = global.race['submerged'] ? 0 : weather_morale;
        morale += global.race['submerged'] ? 0 : weather_morale;

        let stress = 0;
        if (!global.race['carnivore']){
            morale -= global.civic.free;
            global.city.morale.unemployed = -(global.civic.free);
        }
        else {
            stress -= Math.round(global.civic.free / 5);
        }

        if (global.race['optimistic']){
            stress += 10;
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

                    if (global.city['wharf']){
                        price = Math.round(price * (0.99 ** global.city['wharf'].count));
                    }
                    if (global.space['gps'] && global.space['gps'].count > 3){
                        price = Math.round(price * (0.99 ** global.space['gps'].count));
                    }

                    if (global.resource.Money.amount >= price * time_multiplier){
                        modRes(res,global.resource[res].trade * time_multiplier * tradeRatio[res]);
                        modRes('Money', -(price * time_multiplier));
                        breakdown.p.consume.Money['Trade'] -= price;
                        breakdown.p.consume[res]['Trade'] = global.resource[res].trade * tradeRatio[res];
                    }
                    steelCheck();
                }
                else if (global.resource[res].trade < 0){
                    let divide = global.race['merchant'] ? 3 : (global.race['asymmetrical'] ? 5 : 4);
                    let price = Math.round(global.resource[res].value * global.resource[res].trade * tradeRatio[res] / divide);
                    
                    if (global.city['wharf']){
                        price = Math.round(price * (1 + (global.city['wharf'].count * 0.01)));
                    }
                    if (global.space['gps'] && global.space['gps'].count > 3){
                        price = Math.round(price * (1 + (global.space['gps'].count * 0.01)));
                    }

                    if (global.resource[res].amount >= time_multiplier){
                        modRes(res,global.resource[res].trade * time_multiplier * tradeRatio[res]);
                        modRes('Money', -(price * time_multiplier));
                        breakdown.p.consume.Money['Trade'] -= price;
                        breakdown.p.consume[res]['Trade'] = global.resource[res].trade * tradeRatio[res];
                    }
                    steelCheck();
                }
            });
        }

        let power_grid = 0;
        let max_power = 0;

        let uranium_bd = {};
        if (global.city['coal_power']){
            let power = global.city.coal_power.on * actions.city.coal_power.powered;
            let consume = global.city.coal_power.on * 0.35;
            while ((consume * time_multiplier) > global.resource.Coal.amount && consume > 0){
                power -= actions.city.coal_power.powered;
                consume -= 0.35;
            }
            breakdown.p.consume.Coal['Powerplant'] = -(consume);
            modRes('Coal', -(consume * time_multiplier));

            max_power += power;
            power_grid -= power;

            // Uranium
            if (global.tech['uranium'] && global.tech['uranium'] >= 3){
                uranium_bd['Coal_Ash'] = (consume / 65 / global_multiplier);
                modRes('Uranium', (consume * time_multiplier) / 65);
            }
        }

        if (global.city['oil_power']){
            let power = global.city.oil_power.on * actions.city.oil_power.powered;
            let consume = global.city.oil_power.on * 0.65;
            while ((consume * time_multiplier) > global.resource.Oil.amount && consume > 0){
                power -= actions.city.oil_power.powered;
                consume -= 0.65;
            }
            breakdown.p.consume.Oil['Powerplant'] = -(consume);
            modRes('Oil', -(consume * time_multiplier));

            max_power += power;
            power_grid -= power;
        }

        if (global.city['fission_power']){
            let output = global.tech['uranium'] >= 4 ? (actions.city.fission_power.powered - 4) : actions.city.fission_power.powered;
            let power = global.city.fission_power.on * output;
            let consume = global.city.fission_power.on * 0.1;
            while (consume * time_multiplier > global.resource.Uranium.amount && consume > 0){
                power -= output;
                consume -= 0.1;
            }
            breakdown.p.consume.Uranium['Reactor'] = -(consume);
            modRes('Uranium', -(consume * time_multiplier));

            max_power += power;
            power_grid -= power;
        }

        if (global.space['geothermal'] && global.space.geothermal.on > 0){
            let output = actions.space.spc_hell.geothermal.powered;
            let increment = fuel_adjust(0.5);
            let power = global.space.geothermal.on * output;
            let consume = (global.space.geothermal.on * increment);
            while (consume * time_multiplier > global.resource['Helium_3'].amount && consume > 0){
                power -= output;
                consume -= increment;
            }
            breakdown.p.consume.Helium_3['Geothermal'] = -(consume);
            let number = consume * time_multiplier;
            modRes('Helium_3', -(number));

            max_power += power;
            power_grid -= power;
        }

        if (global.space['e_reactor'] && global.space.e_reactor.on > 0){
            let output = actions.space.spc_dwarf.e_reactor.powered;
            let increment = 0.05;
            let power = global.space.e_reactor.on * output;
            let consume = (global.space.e_reactor.on * increment);
            while (consume * time_multiplier > global.resource['Elerium'].amount && consume > 0){
                power += output;
                consume -= increment;
            }
            breakdown.p.consume.Elerium['Reactor'] = -(consume);
            let number = consume * time_multiplier;
            modRes('Elerium', -(number));

            max_power += power;
            power_grid -= power;
        }

        if (global.space['swarm_satellite'] && global.space['swarm_control']){
            let active = global.space.swarm_satellite.count;
            if (active > global.space.swarm_control.s_max){
                active = global.space.swarm_control.s_max;
            }
            global.space.swarm_control.support = active;
            max_power -= active;
            power_grid += active;
        }

        if (global.city['mill'] && global.tech['agriculture'] && global.tech['agriculture'] >= 6){
            let power = global.city.mill.on * actions.city.mill.powered;
            max_power += power;
            power_grid -= power;
        }

        if (global.city['windmill'] && global.tech['hunting'] && global.tech['hunting'] >= 3){
            max_power -= global.city.windmill.count;
            power_grid += global.city.windmill.count;
        }

        // Power usage
        let p_structs = ['city:apartment','spc_red:spaceport','city:coal_mine','spc_moon:moon_base','spc_red:red_tower','spc_home:nav_beacon','spc_dwarf:elerium_contain','spc_gas:gas_mining','spc_belt:space_station','spc_gas_moon:outpost','spc_gas_moon:oil_extractor','city:factory','spc_red:red_factory','spc_dwarf:world_controller','city:wardenclyffe','city:biolab','city:mine','city:rock_quarry','city:cement_plant','city:sawmill','city:mass_driver'];
        for (var i = 0; i < p_structs.length; i++){
            let parts = p_structs[i].split(":");
            let region = parts[0] === 'city' ? parts[0] : 'space';
            let c_action = parts[0] === 'city' ? actions.city : actions['space'][parts[0]];
            if (global[region][parts[1]] && global[region][parts[1]]['on']){
                let power = global[region][parts[1]].on * c_action[parts[1]].powered;
                p_on[parts[1]] = global[region][parts[1]].on;
                while (power > power_grid && power > 0){
                    power -= c_action[parts[1]].powered;
                    p_on[parts[1]]--;
                }
                power_grid -= global[region][parts[1]].on * c_action[parts[1]].powered;
                if (p_on[parts[1]] !== global[region][parts[1]].on){
                    $(`#${region}-${parts[1]} .on`).addClass('warn');
                }
                else {
                    $(`#${region}-${parts[1]} .on`).removeClass('warn');
                }
            }
            else {
                p_on[parts[1]] = 0;
                $(`#${region}-${parts[1]} .on`).removeClass('warn');
            }
        }

        // Moon Bases
        if (global.space['moon_base'] && global.space['moon_base'].count > 0){
            let oil_cost = +fuel_adjust(2);
            let mb_consume = p_on['moon_base'] * oil_cost;
            breakdown.p.consume.Oil['Moon_Base'] = -(mb_consume);
            for (let i=0; i<p_on['moon_base']; i++){
                if (!modRes('Oil', -(time_multiplier * oil_cost))){
                    mb_consume -= (p_on['moon_base'] * oil_cost) - (i * oil_cost);
                    p_on['moon_base'] -= i;
                    break;
                }
            }
            global.space.moon_base.s_max = p_on['moon_base'] * actions.space.spc_moon.moon_base.support;
            global.space.moon_base.s_max += global.tech['luna'] && global.tech['luna'] >= 2 ? p_on['nav_beacon'] : 0;
        }

        if (global.space['moon_base']){
            let used_support = 0;
            let moon_structs = ['helium_mine','iridium_mine','observatory'];
            for (var i = 0; i < moon_structs.length; i++){
                if (global.space[moon_structs[i]]){
                    let operating = global.space[moon_structs[i]].on;
                    let id = actions.space.spc_moon[moon_structs[i]].id;
                    if (used_support + operating > global.space.moon_base.s_max){
                        operating -=  (used_support + operating) - global.space.moon_base.s_max;
                        $(`#${id} .on`).addClass('warn');
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                    }
                    used_support += operating;
                    moon_on[moon_structs[i]] = operating;
                }
                else {
                    moon_on[moon_structs[i]] = 0;
                }
            }
            global.space.moon_base.support = used_support;
        }

        // Space Marines
        if (global.space['space_barracks']){
            let oil_cost = +fuel_adjust(2);
            let sm_consume = global.space.space_barracks.on * oil_cost;
            breakdown.p.consume.Oil['Marines'] = -(sm_consume);
            for (let i=0; i<global.space.space_barracks.on; i++){
                if (!modRes('Oil', -(time_multiplier * oil_cost))){
                    sm_consume -= (global.space.space_barracks.on * oil_cost) - (i * oil_cost);
                    global.space.space_barracks.on -= i;
                    break;
                }
            }
        }

        if (p_on['red_factory'] && p_on['red_factory'] > 0){
            let h_consume = p_on['red_factory'] * fuel_adjust(1);
            modRes('Helium_3',-(h_consume * time_multiplier));
            breakdown.p.consume.Helium_3['Factory'] = -(h_consume);
        }

        // spaceports
        if (global.space['spaceport'] && global.space['spaceport'].count > 0){
            let fuel_cost = +fuel_adjust(1.25);
            let mb_consume = p_on['spaceport'] * fuel_cost;
            breakdown.p.consume.Helium_3['Spaceport'] = -(mb_consume);
            for (let i=0; i<p_on['spaceport']; i++){
                if (!modRes('Helium_3', -(time_multiplier * fuel_cost))){
                    mb_consume -= (p_on['spaceport'] * fuel_cost) - (i * fuel_cost);
                    p_on['spaceport'] -= i;
                    break;
                }
            }
            global.space.spaceport.s_max = p_on['spaceport'] * actions.space.spc_red.spaceport.support;
            global.space.spaceport.s_max += global.tech['mars'] && global.tech['mars'] >= 3 ? p_on['red_tower'] : 0;
        }

        if (global.space['spaceport']){
            let used_support = 0;
            let red_structs = ['living_quarters','exotic_lab','red_mine','fabrication','biodome'];
            for (var i = 0; i < red_structs.length; i++){
                if (global.space[red_structs[i]]){
                    let operating = global.space[red_structs[i]].on;
                    let id = actions.space.spc_red[red_structs[i]].id;
                    if (used_support + operating > global.space.spaceport.s_max){
                        operating -=  (used_support + operating) - global.space.spaceport.s_max;
                        $(`#${id} .on`).addClass('warn');
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                    }
                    used_support += operating;
                    red_on[red_structs[i]] = operating;
                }
                else {
                    red_on[red_structs[i]] = 0;
                }
            }
            global.space.spaceport.support = used_support;
        }

        // Space Station
        if (global.space['space_station'] && global.space['space_station'].count > 0){
            let fuel_cost = +fuel_adjust(2.5);
            let ss_consume = p_on['space_station'] * fuel_cost;
            breakdown.p.consume.Helium_3['Space_Station'] = -(ss_consume);
            for (let i=0; i<p_on['space_station']; i++){
                if (!modRes('Helium_3', -(time_multiplier * fuel_cost))){
                    ss_consume -= (p_on['space_station'] * fuel_cost) - (i * fuel_cost);
                    p_on['space_station'] -= i;
                    break;
                }
            }
        }

        if (global.space['space_station']){
            let used_support = 0;
            let belt_structs = ['elerium_ship','iridium_ship','iron_ship'];
            for (var i = 0; i < belt_structs.length; i++){
                if (global.space[belt_structs[i]]){
                    let operating = global.space[belt_structs[i]].on;
                    let id = actions.space.spc_belt[belt_structs[i]].id;
                    if (used_support + (operating * -(actions.space.spc_belt[belt_structs[i]].support)) > global.space.space_station.s_max){
                        operating -= used_support + operating - global.space.space_station.s_max;
                        $(`#${id} .on`).addClass('warn');
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                    }
                    used_support += (operating * -(actions.space.spc_belt[belt_structs[i]].support));
                    belt_on[belt_structs[i]] = operating;
                }
                else {
                    belt_on[belt_structs[i]] = 0;
                }
            }
            global.space.space_station.support = used_support;
        }

        // Outpost
        if (p_on['outpost'] && p_on['outpost'] > 0){
            let fuel_cost = +fuel_adjust(2);
            let out_consume = p_on['outpost'] * fuel_cost;
            breakdown.p.consume.Oil['Outpost'] = -(out_consume);
            for (let i=0; i<p_on['outpost']; i++){
                if (!modRes('Oil', -(time_multiplier * fuel_cost))){
                    out_consume -= (p_on['outpost'] * fuel_cost) - (i * fuel_cost);
                    p_on['outpost'] -= i;
                    break;
                }
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

        global.city.morale.tax = 20 - global.civic.taxes.tax_rate;
        morale -= global.civic.taxes.tax_rate - 20;

        if (!global.race['frenzy'] && global.civic.garrison.protest + global.civic.garrison.fatigue > 2){
            global.city.morale.warmonger = -(Math.round(Math.log2(global.civic.garrison.protest + global.civic.garrison.fatigue)));
            morale += global.city.morale.warmonger;
        }
        else {
            global.city.morale.warmonger = 0;
        }

        let mBaseCap = global.city['amphitheatre'] ? 100 + global.city['amphitheatre'].count : 100;
        mBaseCap += global.city['casino'] ? global.city['casino'].count : 0;
        moraleCap = global.tech['monuments'] ? mBaseCap + (global.tech['monuments'] * 2) : mBaseCap;
        if (global.civic.taxes.tax_rate < 20){
            moraleCap += 10 - Math.floor(global.civic.taxes.tax_rate / 2);
        }

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
            breakdown.p['Global']['Moon_Phase'] = (-(moon) + 4) + '%';
            moon = 1.04 - (moon / 100);
            global_multiplier *= moon;
        }

        // Consumption
        fed = true;
        if (global.resource[races[global.race.species].name].amount >= 1 || global.city['farm'] || global.city['tourist_center']){
            let food_bd = {};
            let food_base = 0;
            if (global.race['carnivore']){
                let strength = global.tech['military'] ? global.tech.military : 1;
                food_base = global.civic.free * strength * 2;
                food_bd['Hunters'] = food_base + 'v';
            }
            else {
                let farmers_base = global.civic.farmer.workers * global.civic.farmer.impact;
                farmers_base *= (global.tech['hoe'] && global.tech['hoe'] > 0 ? global.tech['hoe'] * (1/3) : 0) + 1;
                farmers_base *= global.city.biome === 'grassland' ? 1.1 : 1;
                farmers_base *= racialTrait(global.civic.farmer.workers,'farmer');
                farmers_base *= global.tech['agriculture'] >= 7 ? 1.1 : 1;
                farmers_base *= global.race['low_light'] ? 0.9 : 1;

                let weather_multiplier = 1;
                if (!global.race['submerged']){
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
                }

                let mill_multiplier = 1;
                if (global.city['mill']){
                    let mill_bonus = global.tech['agriculture'] >= 5 ? 0.05 : 0.03;
                    let working = global.city['mill'].count - global.city['mill'].on;
                    mill_multiplier += (working * mill_bonus);
                }

                let farm = 0;
                if (global.city['farm']){
                    farm = global.city['farm'].count * (global.tech['agriculture'] >= 2 ? 1.25 : 0.75);
                    farm *= global.city.biome === 'grassland' ? 1.1 : 1;
                    farm *= global.tech['agriculture'] >= 7 ? 1.1 : 1;
                    farm *= global.race['low_light'] ? 0.9 : 1;
                }

                food_bd['Farms'] = (farm) + 'v';
                food_bd['Farmers'] = (farmers_base) + 'v';

                food_base = ((farm + farmers_base) * weather_multiplier * mill_multiplier);
                
                food_bd['Weather'] = ((weather_multiplier - 1) * 100) + '%';
                food_bd['Mills'] = ((mill_multiplier - 1) * 100) + '%';
            }

            let hunting = 0;
            if (global.tech['military']){
                hunting = global.race['herbivore'] ? 0 : armyRating(global.civic.garrison.workers,'hunting') / 3;
            }

            let biodome = 0;
            if (global.tech['mars']){
                biodome = red_on['biodome'] * 2 * global.civic.colonist.workers;
            }

            let generated = food_base + hunting + biodome;
            generated *= global_multiplier;

            let soldiers = global.civic.garrison.workers;
            if (global.race['parasite']){
                soldiers -= 2;
                if (soldiers < 0){
                    soldiers = 0;
                }
            }

            let consume = (global.resource[races[global.race.species].name].amount + soldiers - (global.civic.free * 0.5));
            consume *= (global.race['gluttony'] ? 1.1 : 1);
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

            let tourism = 0;
            if (global.city['tourist_center']){
                tourism = global.city['tourist_center'].on * 50;
                breakdown.p.consume.Food['Tourism'] = -(tourism);
            }

            let spaceport = 0;
            if (global.space['spaceport']){
                spaceport = p_on['spaceport'] * 25;
                breakdown.p.consume.Food['Spaceport'] = -(spaceport);
            }

            let space_station = 0;
            if (global.space['space_station']){
                space_station = p_on['space_station'] * 10;
                breakdown.p.consume.Food['Space_Station'] = -(space_station);
            }

            let space_marines = 0;
            if (global.space['space_barracks']){
                space_marines = global.space.space_barracks.on * 10;
                breakdown.p.consume.Food['Marines'] = -(space_marines);
            }

            let delta = generated - consume - tourism - spaceport - space_station - space_marines;

            food_bd['Biodome'] = biodome + 'v';
            food_bd['Soldiers'] = hunting + 'v';
            breakdown.p['Food'] = food_bd;

            if (!modRes('Food', delta * time_multiplier)){
                fed = false;
                let threshold = global.race['slow_digestion'] ? 2 : 1.25;
                if (global.race['atrophy']){
                    threshold -= 0.15;
                }

                // threshold can be thought of as the inverse of nutrition ratio per unit of food.
                // So if the generated food doesn't have enough nutrition for the consuming population, they starve.
                if (generated < consume / threshold){
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
            else if (global.race['parasite'] && global.city.calendar.wind === 0){
                // Do Nothing
            }
            else {
                var lowerBound = global.tech['reproduction'] ? global.tech['reproduction'] : 0;
                if (global.race['fast_growth']){
                    lowerBound *= 2;
                    lowerBound += 2;
                }
                if (global.race['spores'] && global.city.calendar.wind === 1){
                    if (global.race['parasite']){
                        lowerBound += 1;
                    }
                    else {
                        lowerBound += 2;
                        lowerBound *= 2;
                    }
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
            let hunting = armyRating(global.civic.garrison.workers,'hunting') / 10;

            let delta = hunting;
            delta *= hunger * global_multiplier;

            fur_bd['Soldiers'] = hunting  + 'v';
            fur_bd['Hunger'] = ((hunger - 1) * 100) + '%';
            breakdown.p['Furs'] = fur_bd;

            modRes('Furs', delta * time_multiplier);
        }

        // Knowledge
        { //block scope
            let sundial_base = global.tech['primitive'] && global.tech['primitive'] >= 3 ? 1 : 0;
            if (global.race['ancient_ruins']){
                sundial_base++;
            }

            let professors_base = global.civic.professor.workers;
            professors_base *= global.race['studious'] ? global.civic.professor.impact + 0.25 : global.civic.professor.impact;
            professors_base *= racialTrait(global.civic.professor.workers,'science');
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 3){
                professors_base *= 1 + (global.city.temple.count * 0.05);
            }

            let scientist_base = global.civic.scientist.workers;
            scientist_base *= global.civic.scientist.impact;
            scientist_base *= racialTrait(global.civic.scientist.workers,'science');
            if (global.tech['science'] >= 6 && global.city['wardenclyffe']){
                scientist_base *= 1 + (global.civic.professor.workers * p_on['wardenclyffe'] * 0.01);
            }
            if (global.space['satellite']){
                scientist_base *= 1 + (global.space.satellite.count * 0.01);
            }
            
            let library_mult = global.city['library'] ? 1 + (global.city.library.count * 0.05) : 1;

            let gene_consume = 0;
            if (global.arpa['sequence'] && global.arpa.sequence.on && global.arpa.sequence.time > 0){
                let gene_cost = 50 + (global.race.mutation * 10);
                if (gene_cost * time_multiplier <= global.resource.Knowledge.amount){
                    gene_consume = gene_cost;
                    gene_sequence = true;
                }
                else {
                    gene_sequence = false;
                }
            }
            else {
                gene_sequence = false;
            }

            let delta = professors_base + scientist_base;
            delta *= hunger * global_multiplier;
            delta += sundial_base * global_multiplier;
            delta *= library_mult;

            let know_bd = {};
            know_bd['Professors'] = professors_base + 'v';
            know_bd['Scientist'] = scientist_base + 'v';
            know_bd['Hunger'] = ((hunger - 1) * 100) + '%';
            know_bd['Sundial'] = sundial_base + 'v';
            if (global.city['library']){
                know_bd['Library'] = ((library_mult - 1) * 100) + '%';
            }
            breakdown.p['Knowledge'] = know_bd;

            if (gene_consume > 0) {
                delta -= gene_consume;
                breakdown.p.consume.Knowledge['Genome'] = -(gene_consume);
            }
            
            modRes('Knowledge', delta * time_multiplier);
        }

        // Factory
        let FactoryMoney = 0;
        if (global.city['factory']){
            let operating = 0;
            let on_factories = global.space['red_factory'] ? p_on['factory'] + p_on['red_factory'] : p_on['factory'];
            let assembly = global.tech['factory'] ? true : false;

            if (global.city.factory['Lux'] && global.city.factory['Lux'] > 0){
                operating += global.city.factory.Lux;
                while (operating > on_factories && operating > 0){
                    operating--;
                    global.city.factory.Lux--;
                }

                let fur_cost = global.city.factory.Lux * (assembly ? f_rate.Lux.fur[global.tech['factory']] : f_rate.Lux.fur[0]);
                let workDone = global.city.factory.Lux;
                
                while (fur_cost * time_multiplier > global.resource.Furs.amount && fur_cost > 0){
                    fur_cost -= (assembly ? f_rate.Lux.fur[global.tech['factory']] : f_rate.Lux.fur[0]);
                    workDone--;
                }

                breakdown.p.consume.Furs['Factory'] = -(fur_cost);
                modRes('Furs', -(fur_cost * time_multiplier));

                let demand = global.resource[races[global.race.species].name].amount * (assembly ? f_rate.Lux.demand[global.tech['factory']] : f_rate.Lux.demand[0]);
                let delta = workDone * demand;
                if (global.race['toxic']){
                    delta *= 1.20;
                }

                delta *= hunger;
                FactoryMoney = delta + 'v'; //Money doesn't normally have hunger/tax breakdowns. Better to lump in the manually calculable total.

                delta *= global_multiplier;
                modRes('Money', delta * time_multiplier);
            }

            if (global.city.factory['Alloy'] && global.city.factory['Alloy'] > 0){
                operating += global.city.factory.Alloy;
                while (operating > on_factories && operating > 0){
                    operating--;
                    global.city.factory.Alloy--;
                }

                let copper_cost = global.city.factory.Alloy * (assembly ? f_rate.Alloy.copper[global.tech['factory']] : f_rate.Alloy.copper[0]);
                let aluminium_cost = global.city.factory.Alloy * (assembly ? f_rate.Alloy.aluminium[global.tech['factory']] : f_rate.Alloy.aluminium[0]);
                let workDone = global.city.factory.Alloy;
                
                while (copper_cost * time_multiplier > global.resource.Copper.amount && copper_cost > 0){
                    copper_cost -= (assembly ? f_rate.Alloy.copper[global.tech['factory']] : f_rate.Alloy.copper[0]);
                    aluminium_cost -= (assembly ? f_rate.Alloy.aluminium[global.tech['factory']] : f_rate.Alloy.aluminium[0]);
                    workDone--;
                }
                while (aluminium_cost * time_multiplier > global.resource.Aluminium.amount && aluminium_cost > 0){
                    copper_cost -= (assembly ? f_rate.Alloy.copper[global.tech['factory']] : f_rate.Alloy.copper[0]);
                    aluminium_cost -= (assembly ? f_rate.Alloy.aluminium[global.tech['factory']] : f_rate.Alloy.aluminium[0]);
                    workDone--;
                }

                breakdown.p.consume.Copper['Factory'] = -(copper_cost);
                breakdown.p.consume.Aluminium['Factory'] = -(aluminium_cost);
                modRes('Copper', -(copper_cost * time_multiplier));
                modRes('Aluminium', -(aluminium_cost * time_multiplier));

                let factory_output = workDone * (assembly ? f_rate.Alloy.output[global.tech['factory']] : f_rate.Alloy.output[0]);
                if (global.race['toxic']){
                    factory_output *= 1.20;
                }

                let delta = factory_output;
                delta *= hunger * global_multiplier;

                let alloy_bd = {};
                alloy_bd['Factory'] = factory_output + 'v';
                alloy_bd['Hunger'] = ((hunger - 1) * 100) + '%';
                breakdown.p['Alloy'] = alloy_bd;
                modRes('Alloy', delta * time_multiplier);
            }

            if (global.city.factory['Polymer'] && global.city.factory['Polymer'] > 0){
                operating += global.city.factory.Polymer;
                while (operating > on_factories && operating > 0){
                    operating--;
                    global.city.factory.Polymer--;
                }

                let oilIncrement = global.race['kindling_kindred'] ? (assembly ? f_rate.Polymer.oil_kk[global.tech['factory']] : f_rate.Polymer.oil_kk[0]) : (assembly ? f_rate.Polymer.oil[global.tech['factory']] : f_rate.Polymer.oil[0]);
                let lumberIncrement = global.race['kindling_kindred'] ? 0 : (assembly ? f_rate.Polymer.lumber[global.tech['factory']] : f_rate.Polymer.lumber[0]);
                let oil_cost = global.city.factory.Polymer * oilIncrement;
                let lumber_cost = global.city.factory.Polymer * lumberIncrement;
                let workDone = global.city.factory.Polymer;
                
                while (lumber_cost * time_multiplier > global.resource.Lumber.amount && lumber_cost > 0){
                    lumber_cost -= lumberIncrement;
                    oil_cost -= oilIncrement;
                    workDone--;
                }
                while (oil_cost * time_multiplier > global.resource.Oil.amount && oil_cost > 0){
                    lumber_cost -= lumberIncrement;
                    oil_cost -= oilIncrement;
                    workDone--;
                }

                breakdown.p.consume.Lumber['Factory'] = -(lumber_cost);
                breakdown.p.consume.Oil['Factory'] = -(oil_cost);
                modRes('Lumber', -(lumber_cost * time_multiplier));
                modRes('Oil', -(oil_cost * time_multiplier));

                let factory_output = workDone * (assembly ? f_rate.Polymer.output[global.tech['factory']] : f_rate.Polymer.output[0]);
                if (global.race['toxic']) {
                    factory_output *= 1.20;
                }
                if (global.tech['polymer'] >= 2){
                    factory_output *= 1.42;
                }

                let delta = factory_output;
                delta *= hunger * global_multiplier;

                let polymer_bd = {};
                polymer_bd['Factory'] = factory_output + 'v';
                polymer_bd['Hunger'] = ((hunger - 1) * 100) + '%';
                breakdown.p['Polymer'] = polymer_bd;
                modRes('Polymer', delta * time_multiplier);
            }

            if (global.city.factory['Nano'] && global.city.factory['Nano'] > 0){
                operating += global.city.factory.Nano;
                while (operating > on_factories && operating > 0){
                    operating--;
                    global.city.factory.Nano--;
                }

                let coalIncrement = (assembly ? f_rate.Nano_Tube.coal[global.tech['factory']] : f_rate.Nano_Tube.coal[0]);
                let neutroniumIncrement = (assembly ? f_rate.Nano_Tube.neutronium[global.tech['factory']] : f_rate.Nano_Tube.neutronium[0]);
                let coal_cost = global.city.factory.Nano * coalIncrement;
                let neutronium_cost = global.city.factory.Nano * neutroniumIncrement;
                let workDone = global.city.factory.Nano;
                
                while (neutronium_cost * time_multiplier > global.resource.Neutronium.amount && neutronium_cost > 0){
                    neutronium_cost -= neutroniumIncrement;
                    coal_cost -= coalIncrement;
                    workDone--;
                }
                while (coal_cost * time_multiplier > global.resource.Coal.amount && coal_cost > 0){
                    neutronium_cost -= neutroniumIncrement;
                    coal_cost -= coalIncrement;
                    workDone--;
                }

                breakdown.p.consume.Coal['Factory'] = -(coal_cost);
                breakdown.p.consume.Neutronium['Factory'] = -(neutronium_cost);
                modRes('Neutronium', -(neutronium_cost * time_multiplier));
                modRes('Coal', -(coal_cost * time_multiplier));

                let factory_output = workDone * (assembly ? f_rate.Nano_Tube.output[global.tech['factory']] : f_rate.Nano_Tube.output[0]);
                if (global.race['toxic']) {
                    factory_output *= 1.08;
                }
                if (global.tech['polymer'] >= 2){
                    factory_output *= 1.42;
                }

                let delta = factory_output;
                delta *= hunger * global_multiplier;

                let nano_bd = {};
                nano_bd['Factory'] = factory_output + 'v';
                nano_bd['Hunger'] = ((hunger - 1) * 100) + '%';
                breakdown.p['Nano_Tube'] = nano_bd;
                modRes('Nano_Tube', delta * time_multiplier);
            }
        }

        // Cement
        if (global.resource.Cement.display){
            let stone_cost = global.civic.cement_worker.workers * 3;
            let workDone = global.civic.cement_worker.workers;
            while (stone_cost * time_multiplier > global.resource.Stone.amount && stone_cost > 0){
                stone_cost -= 3;
                workDone--;
            }

            breakdown.p.consume.Stone['Factory'] = -(stone_cost);
            modRes('Stone', -(stone_cost * time_multiplier));

            let cement_base = global.tech['cement'] >= 4 ? 1.2 : 1;
            cement_base *= global.civic.cement_worker.impact;
            cement_base *= racialTrait(global.civic.cement_worker.workers,'factory');

            let factory_output = workDone * cement_base;
            if (global.race['toxic']){
                factory_output *= 1.08;
            }

            let powered_mult = 1;
            if (global.city.powered && p_on['cement_plant']){
                powered_mult += (p_on['cement_plant'] * 0.05);
            }
            
            let delta = factory_output * powered_mult;
            delta *= hunger * global_multiplier;

            let cement_bd = {};
            cement_bd['Factory'] = factory_output + 'v';
            cement_bd['Power'] = ((powered_mult - 1) * 100) + '%';
            cement_bd['Hunger'] = ((hunger - 1) * 100) + '%';
            breakdown.p['Cement'] = cement_bd;
            modRes('Cement', delta * time_multiplier);
        }
        
        // Smelters
        let iron_smelter = 0;
        let titanium_bd = {};
        if (global.city['smelter'] && global.city['smelter'].count > 0){
            if (global.race['kindling_kindred']){
                global.city['smelter'].Wood = 0;
            }
            let coal_fuel = global.race['kindling_kindred'] ? 0.15 : 0.25;
            let consume_wood = global.city['smelter'].Wood * 3;
            let consume_coal = global.city['smelter'].Coal * coal_fuel;
            let consume_oil = global.city['smelter'].Oil * 0.35;
            iron_smelter = global.city['smelter'].Iron;
            let steel_smelter = global.city['smelter'].Steel;
            let oil_bonus = global.city['smelter'].Oil;
            while (iron_smelter + steel_smelter > global.city['smelter'].Wood + global.city['smelter'].Coal + global.city['smelter'].Oil ){
                if (steel_smelter > 0){
                    steel_smelter--;
                }
                else {
                    iron_smelter--;
                }
            }
            while (consume_wood * time_multiplier > global.resource.Lumber.amount && consume_wood > 0){
                consume_wood -= 3;
                if (steel_smelter > 0){
                    steel_smelter--;
                }
                else {
                    iron_smelter--;
                }
            }
            while (consume_coal * time_multiplier > global.resource.Coal.amount && consume_coal > 0){
                consume_coal -= coal_fuel;
                if (steel_smelter > 0){
                    steel_smelter--;
                }
                else {
                    iron_smelter--;
                }
            }
            while (consume_oil * time_multiplier > global.resource.Oil.amount && consume_oil > 0){
                consume_oil -= 0.35;
                oil_bonus--;
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

            if (oil_bonus > 0){
                iron_smelter *= 1 + (oil_bonus / 200);
            }

            breakdown.p.consume.Lumber['Smelter'] = -(consume_wood);
            breakdown.p.consume.Coal['Smelter'] = -(consume_coal);
            breakdown.p.consume.Oil['Smelter'] = -(consume_oil);

            modRes('Lumber', -(consume_wood * time_multiplier));
            modRes('Coal', -(consume_coal * time_multiplier));
            modRes('Oil', -(consume_oil * time_multiplier));

            // Uranium
            if (consume_coal > 0 && global.tech['uranium'] && global.tech['uranium'] >= 3){
                let ash_base = consume_coal;
                if (global.city.geology['Uranium']){
                    ash_base *= global.city.geology['Uranium'] + 1;
                }
                uranium_bd['Coal_Ash'] = uranium_bd['Coal_Ash'] + (ash_base / 65 / global_multiplier);
                modRes('Uranium', (ash_base * time_multiplier) / 65);
            }

            //Steel Production
            if (global.resource.Steel.display){
                let iron_consume = steel_smelter * 2;
                let coal_consume = steel_smelter * 0.25;
                while ((iron_consume * time_multiplier > global.resource.Iron.amount && iron_consume > 0) || (coal_consume * time_multiplier > global.resource.Coal.amount && coal_consume > 0)){
                    iron_consume -= 2;
                    coal_consume -= 0.25;
                    steel_smelter--;
                }

                breakdown.p.consume.Coal['Smelter'] -= coal_consume;
                breakdown.p.consume.Iron['Smelter'] = -(iron_consume);
                modRes('Iron', -(iron_consume * time_multiplier));
                modRes('Coal', -(coal_consume * time_multiplier));

                let steel_base = 1;
                for (i = 4; i <= 6; i++) {
                    if (global.tech['smelting'] >= i) {
                        steel_base *= 1.2;
                    }
                }

                if (oil_bonus > 0){
                    steel_smelter *= 1 + (oil_bonus / 200);
                }

                let smelter_output = steel_smelter * steel_base;
                if (global.race['pyrophobia']){
                    smelter_output *= 0.9;
                }

                let delta = smelter_output;
                delta *= hunger * global_multiplier;

                let steel_bd = {};
                steel_bd['Smelter'] = smelter_output + 'v';
                steel_bd['Hunger'] = ((hunger - 1) * 100) + '%';
                breakdown.p['Steel'] = steel_bd;
                modRes('Steel', delta * time_multiplier);
                
                if (global.tech['titanium'] && global.tech['titanium'] >= 1){
                    let titanium = smelter_output * hunger;
                    if (global.city.geology['Titanium']){
                        delta *= global.city.geology['Titanium'] + 1;
                    }
                    let divisor = global.tech['titanium'] >= 3 ? 10 : 25;
                    modRes('Titanium', (delta * time_multiplier) / divisor);
                    titanium_bd['Steel'] = (titanium / divisor) + 'v';
                }
            }
        }

        // Lumber
        { //block scope
            let lumber_base = global.civic.lumberjack.workers;
            lumber_base *= global.city.biome === 'forest' ? 1.1 : 1;
            lumber_base *= global.civic.lumberjack.impact;
            lumber_base *= racialTrait(global.civic.lumberjack.workers,'lumberjack');
            lumber_base *= (global.tech['axe'] && global.tech['axe'] > 1 ? (global.tech['axe'] - 1) * 0.35 : 0) + 1;

            let power_mult = 1;
            if (global.city.powered && global.city.sawmill && p_on['sawmill']){
                power_mult += (p_on['sawmill'] * 0.04);
            }
            let lumber_yard = 1;
            if (global.city['lumber_yard']){
                lumber_yard += global.city['lumber_yard'].count * 0.02;
            }

            let delta = lumber_base * power_mult * lumber_yard;
            delta *= hunger * global_multiplier;

            let lumber_bd = {};
            lumber_bd['Lumberjacks'] = lumber_base + 'v';
            lumber_bd['Lumber_Yard'] = ((lumber_yard - 1) * 100) + '%';
            lumber_bd['Sawmill'] = ((power_mult - 1) * 100) + '%';
            lumber_bd['Hunger'] = ((hunger - 1) * 100) + '%';
            breakdown.p['Lumber'] = lumber_bd;
            modRes('Lumber', delta * time_multiplier);
        }
        
        // Stone
        { //block scope
            let stone_base = global.civic.quarry_worker.workers;
            stone_base *= global.civic.quarry_worker.impact;
            stone_base *= racialTrait(global.civic.quarry_worker.workers,'miner');
            stone_base *= (global.tech['hammer'] && global.tech['hammer'] > 0 ? global.tech['hammer'] * 0.4 : 0) + 1;
            if (global.tech['explosives'] && global.tech['explosives'] >= 2){
                stone_base *= global.tech['explosives'] >= 3 ? 1.75 : 1.5;
            }

            let power_mult = 1;
            let rock_quarry = 1;
            if (global.city['rock_quarry']){
                if (global.city.rock_quarry['on']){
                    power_mult += (p_on['rock_quarry'] * 0.04);
                }
                rock_quarry += global.city['rock_quarry'].count * 0.04;
            }

            let delta = stone_base * power_mult * rock_quarry;
            delta *= hunger * global_multiplier;

            let stone_bd = {};
            stone_bd['Workers'] = stone_base + 'v';
            stone_bd['Rock_Quarry'] = ((rock_quarry - 1) * 100) + '%';
            stone_bd['Power'] = ((power_mult - 1) * 100) + '%';
            stone_bd['Hunger'] = ((hunger - 1) * 100) + '%';
            breakdown.p['Stone'] = stone_bd;
            modRes('Stone', delta * time_multiplier);

            // Aluminium
            if (global.city['metal_refinery'] && global.city['metal_refinery'].count > 0){
                let base = stone_base * rock_quarry * power_mult * 0.08;
                if (global.city.geology['Aluminium']){
                    base *= global.city.geology['Aluminium'] + 1;
                }
                let delta = base * hunger * global_multiplier;

                let refinery = global.city['metal_refinery'].count * 6;
                delta *= 1 + (refinery / 100);

                let alumina_bd = {};
                alumina_bd['Workers'] = base + 'v';
                alumina_bd['Refinery'] = refinery + '%';
                alumina_bd['Hunger'] = ((hunger - 1) * 100) + '%';
                breakdown.p['Aluminium'] = alumina_bd;
                modRes('Aluminium', delta * time_multiplier);
            }
        }
        
        // Miners
        let copper_bd = {};
        if (global.resource.Copper.display || global.resource.Iron.display){
            let miner_base = global.civic.miner.workers;
            miner_base *= global.civic.miner.impact;
            miner_base *= racialTrait(global.civic.miner.workers,'miner');
            if (global.race['tough']){
                miner_base *= 1.25;
            }
            if (global.race['industrious']){
                let bonus = 1 + (global.race['industrious'] / 50);
                miner_base *= bonus;
            }
            miner_base *= (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.15 : 0) + 1;
            if (global.tech['explosives'] && global.tech['explosives'] >= 2){
                miner_base *= global.tech['explosives'] >= 3 ? 1.4 : 1.25;
            }

            let power_mult = 1;
            if (global.city['mine']['on']){
                power_mult += (p_on['mine'] * 0.05);
            }

            // Copper
            if (global.resource.Copper.display){
                let copper_mult = 1/7;
                if (global.tech['copper']) {
                    copper_mult *= 1.2;
                }

                let copper_base = miner_base * copper_mult;
                if (global.city.geology['Copper']){
                    copper_base *= global.city.geology['Copper'] + 1;
                }

                let delta = copper_base * power_mult;
                delta *= hunger * global_multiplier;

                copper_bd['Miners'] = (copper_base) + 'v';
                copper_bd['Power'] = ((power_mult - 1) * 100) + '%';
                modRes('Copper', delta * time_multiplier);
            }
            
            // Iron
            if (global.resource.Iron.display){
                let iron_bd = {};
                let iron_mult = 1/4;
                let iron_base = miner_base * iron_mult;
                let smelter_mult = 1 + (iron_smelter * 0.1);
                if (global.city.geology['Iron']){
                    iron_base *= global.city.geology['Iron'] + 1;
                }
                
                let space_iron = 0;
                
                if (belt_on['iron_ship']){
                    space_iron = belt_on['iron_ship'] * (global.tech.asteroid >= 6 ? 3 : 2);
                }

                let delta = (iron_base + space_iron) * smelter_mult * power_mult;
                delta *= hunger * global_multiplier;
                
                iron_bd['Miners'] = (iron_base) + 'v';
                iron_bd['Space_Miners'] = space_iron + 'v';
                iron_bd['Smelter'] = ((smelter_mult - 1) * 100) + '%';
                iron_bd['Power'] = ((power_mult - 1) * 100) + '%';
                iron_bd['Hunger'] = ((hunger - 1) * 100) + '%';
                breakdown.p['Iron'] = iron_bd;
                modRes('Iron', delta * time_multiplier);

                if (global.tech['titanium'] && global.tech['titanium'] >= 2){
                    let labor_base = belt_on['iron_ship'] ? (global.civic.miner.workers / 4) + (belt_on['iron_ship'] / 2) : (global.civic.miner.workers / 4); 
                    let iron = labor_base * iron_smelter * 0.1;
                    delta = iron * global_multiplier;
                    if (global.city.geology['Titanium']){
                        delta *= global.city.geology['Titanium'] + 1;
                    }
                    let divisor = global.tech['titanium'] >= 3 ? 10 : 25;
                    modRes('Titanium', (delta * time_multiplier) / divisor);
                    titanium_bd['Iron'] = (iron / divisor) + 'v';
                }
            }
        }

        // Mars Mining
        if (red_on['red_mine'] && red_on['red_mine'] > 0){
            let copper_base = red_on['red_mine'] * 0.25 * global.civic.colonist.workers;
            copper_bd[`${races[global.race.species].solar.red}_Mining`] = (copper_base) + 'v';
            modRes('Copper', copper_base * time_multiplier * global_multiplier * hunger);

            let titanium_base = red_on['red_mine'] * 0.02 * global.civic.colonist.workers * hunger;
            titanium_bd[`${races[global.race.species].solar.red}_Mining`] = (titanium_base) + 'v';
            modRes('Titanium', titanium_base * time_multiplier * global_multiplier);
        }
        copper_bd['Hunger'] = ((hunger - 1) * 100) + '%';
        breakdown.p['Copper'] = copper_bd;
        breakdown.p['Titanium'] = titanium_bd;
        
        if (uranium_bd['Coal_Ash']){
            uranium_bd['Coal_Ash'] = uranium_bd['Coal_Ash'] + 'v';
        }

        // Coal
        if (global.resource.Coal.display){
            let coal_base = global.civic.coal_miner.workers;
            coal_base *= global.civic.coal_miner.impact;
            coal_base *= racialTrait(global.civic.coal_miner.workers,'miner');
            if (global.race['tough']){
                coal_base *= 1.25;
            }
            if (global.race['resilient']){
                let bonus = 1 + (global.race['resilient'] / 50);
                coal_base *= bonus;
            }
            coal_base *= (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.12 : 0) + 1;
            if (global.tech['explosives'] && global.tech['explosives'] >= 2){
                coal_base *= global.tech['explosives'] >= 3 ? 1.4 : 1.25;
            }
            if (global.city.geology['Coal']){
                coal_base *= global.city.geology['Coal'] + 1;
            }

            let power_mult = 1;
            if (global.city['coal_mine']['on']){
                power_mult += (p_on['coal_mine'] * 0.05);
            }

            let delta = coal_base * power_mult;
            delta *= hunger * global_multiplier;

            let coal_bd = {};
            coal_bd['Miners'] = coal_base + 'v';
            coal_bd['Power'] = ((power_mult - 1) * 100) + '%';
            coal_bd['Hunger'] = ((hunger - 1) * 100) + '%';
            breakdown.p['Coal'] = coal_bd;
            modRes('Coal', delta * time_multiplier);

            // Uranium
            if (global.resource.Uranium.display){
                let uranium = delta / 115;
                if (global.city.geology['Uranium']){
                    uranium *= global.city.geology['Uranium'] + 1;
                }
                modRes('Uranium', uranium * time_multiplier);
                uranium_bd['Miners'] = uranium / global_multiplier + 'v';
            }
        }
        breakdown.p['Uranium'] = uranium_bd;
        
        // Oil
        if (global.city['oil_well']){
            let oil_base = global.tech['oil'] >= 4 ? 0.48 : 0.4;
            if (global.tech['oil'] >= 7){
                oil_base *= 2;
            }
            else if (global.tech['oil'] >= 5){
                oil_base *= global.tech['oil'] >= 6 ? 1.75 : 1.25;
            }
            if (global.city.geology['Oil']){
                oil_base *= global.city.geology['Oil'] + 1;
            }
            let oil_well = oil_base * global.city.oil_well.count;
            let oil_extractor = oil_base * p_on['oil_extractor'];

            let delta = oil_well + oil_extractor;
            delta *= hunger * global_multiplier;

            let oil_bd = {};
            oil_bd['Derrick'] = oil_well + 'v';
            oil_bd['Extractor'] = oil_extractor + 'v';
            oil_bd['Hunger'] = ((hunger - 1) * 100) + '%';
            breakdown.p['Oil'] = oil_bd;
            modRes('Oil', delta * time_multiplier);
        }

        // Iridium
        let iridium_bd = {};
        if (moon_on['iridium_mine']){
            let iridium_base = moon_on['iridium_mine'] * 0.035;
            let delta = iridium_base * hunger * global_multiplier;
            iridium_bd['Iridium_Mine'] = iridium_base + 'v';
            modRes('Iridium', delta * time_multiplier);
        }

        if (belt_on['iridium_ship']){
            let iridium_base = belt_on['iridium_ship'] * (global.tech.asteroid >= 6 ? 0.08 : 0.055);
            let delta = iridium_base * hunger * global_multiplier;
            iridium_bd['Iridium_Ship'] = iridium_base + 'v';
            modRes('Iridium', delta * time_multiplier);
        }
        iridium_bd['Hunger'] = ((hunger - 1) * 100) + '%';
        breakdown.p['Iridium'] = iridium_bd;

        // Helium 3
        let helium_bd = {};
        if (global.space['moon_base'] && moon_on['helium_mine']){
            let helium_base = moon_on['helium_mine'] * 0.18;
            let delta = helium_base * hunger * global_multiplier;

            helium_bd['Helium_Mine'] = helium_base + 'v';
            modRes('Helium_3', delta * time_multiplier);
        }

        if (global.space['gas_mining'] && p_on['gas_mining']){
            let gas_mining = p_on['gas_mining'] * (global.tech['helium'] ? 0.65 : 0.5);
            let delta = gas_mining * hunger * global_multiplier;

            helium_bd['Gas_Collector'] = gas_mining + 'v';
            modRes('Helium_3', delta * time_multiplier);
        }
        
        helium_bd['Hunger'] = ((hunger - 1) * 100) + '%';
        breakdown.p['Helium_3'] = helium_bd;

        // Neutronium
        let neutronium_bd = {};
        if (p_on['outpost']){
            let n_base = p_on['outpost'] * 0.025;
            if (global.tech['drone']){
                n_base *= 1 + (global.space.drone.count * 0.06);
            }
            let delta = n_base * hunger * global_multiplier;
            neutronium_bd['Outpost'] = n_base + 'v';
            modRes('Neutronium', delta * time_multiplier);
        }
        neutronium_bd['Hunger'] = ((hunger - 1) * 100) + '%';
        breakdown.p['Neutronium'] = neutronium_bd;

        // Elerium
        let elerium_bd = {};
        if (belt_on['elerium_ship']){
            let elerium_base = belt_on['elerium_ship'] * (global.tech.asteroid >= 6 ? 0.0075 : 0.005);
            let delta = elerium_base * hunger * global_multiplier;
            elerium_bd['Elerium_Ship'] = elerium_base + 'v';
            modRes('Elerium', delta * time_multiplier);
        }
        elerium_bd['Hunger'] = ((hunger - 1) * 100) + '%';
        breakdown.p['Elerium'] = elerium_bd;

        // Tax Income
        if (global.tech['currency'] >= 1){
            let income_base = global.resource[races[global.race.species].name].amount + global.civic.garrison.workers - (global.race['carnivore'] ? 0 : global.civic.free);
            income_base *= ( global.race['greedy'] ? 1.75 : 2 );
            income_base /= 5;
            
            if (fed){
                if (global.tech['banking'] && global.tech['banking'] >= 2){
                    let impact = global.civic.banker.impact;
                    if (global.tech['banking'] >= 10){
                        impact += 0.02 * global.tech['stock_exchange'];
                    }
                    income_base *= 1 + (global.civic.banker.workers * impact);
                }
            }
            else {
                income_base = income_base / 2;
            }
            
            income_base *= (global.civic.taxes.tax_rate / 20);

            let temple_mult = 1;
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 4){
                temple_mult += (global.city.temple.count * 0.025);
            }

            let delta = income_base * temple_mult;
            delta *= global_multiplier;
            
            money_bd['Taxes'] = (income_base) + 'v';
            money_bd['Temple'] = ((temple_mult - 1) * 100) + '%';
            money_bd['Factory'] = FactoryMoney + 'v';
            modRes('Money', +(delta * time_multiplier).toFixed(2));
        }

        if (global.city['tourist_center']){
            let tourism = 0;
            if (global.city['amphitheatre']){
                tourism += global.city['tourist_center'].on * global.city['amphitheatre'].count;
            }
            if (global.city['casino']){
                tourism += global.city['tourist_center'].on * global.city['casino'].count * 5;
            }
            if (global.tech['monuments']){
                tourism += global.city['tourist_center'].on * global.tech['monuments'] * 2;
            }
            money_bd['Tourism'] = tourism + 'v';
            modRes('Money', +(tourism * time_multiplier * global_multiplier * hunger).toFixed(2));
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
            $('#powerMeter').addClass('low');
            $('#powerMeter').removeClass('neutral');
            $('#powerMeter').removeClass('high');
        }
        else if (global.city.power > 0){
            $('#powerMeter').removeClass('low');
            $('#powerMeter').removeClass('neutral');
            $('#powerMeter').addClass('high');
        }
        else {
            $('#powerMeter').removeClass('low');
            $('#powerMeter').addClass('neutral');
            $('#powerMeter').removeClass('high');
        }

        if (p_on['world_controller'] && p_on['world_controller'] > 0){
            global.tech['wsc'] = 1;
        }
        else {
            global.tech['wsc'] = 0;
        }
    }
    
    if (global.civic['garrison'] && global.civic.garrison.workers < global.civic.garrison.max){
        let rate = global.race['diverse'] ? 2 : 2.5;
        if (global.city['boot_camp']){
            rate *= 1 + (global.city['boot_camp'].count * 0.05);
        }
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
                let c_action = actions.evolution[action];
                let element = $('#'+c_action.id);
                if (element.length > 0){
                    if (checkAffordable(c_action)){
                        if (element.hasClass('cna')){
                            element.removeClass('cna');
                        }
                    }
                    else if (!element.hasClass('cna')){
                        element.addClass('cna');
                    }
                    if (checkAffordable(c_action,true)){
                        if (element.hasClass('cnam')){
                            element.removeClass('cnam');
                        }
                    }
                    else if (!element.hasClass('cnam')){
                        element.addClass('cnam');
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
            Aluminium: 50,
            Steel: 50,
            Titanium: 50,
            Alloy: 50,
            Polymer: 50,
            Iridium: 0,
            "Helium_3": 0,
            Neutronium: 0,
            Elerium: 1,
            Nano_Tube: 0
        };
        // labor caps
        var lCaps = {
            farmer: -1,
            lumberjack: -1,
            quarry_worker: -1,
            miner: 0,
            coal_miner: 0,
            craftsman: 0,
            cement_worker: 0,
            banker: 0,
            entertainer: 0,
            professor: 0,
            scientist: 0,
            garrison: 0,
            colonist: 0,
            space_miner: 0
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
        var bd_Aluminium = { Base: caps['Aluminium']+'v' };
        var bd_Titanium = { Base: caps['Titanium']+'v' };
        var bd_Alloy = { Base: caps['Alloy']+'v' };
        var bd_Polymer = { Base: caps['Polymer']+'v' };
        var bd_Iridium = { Base: caps['Iridium']+'v' };
        var bd_Helium = { Base: caps['Helium_3']+'v' };
        var bd_Neutronium = { Base: caps['Neutronium']+'v' };
        var bd_Elerium = { Base: caps['Elerium']+'v' };
        var bd_Nano_Tube = { Base: caps['Nano_Tube']+'v' };

        caps[races[global.race.species].name] = 0;
        if (global.city['farm']){
            if (global.tech['farm']){
                caps[races[global.race.species].name] += global.city['farm'].count;
                bd_Citizen['Farm'] = global.city['farm'].count + 'v';
            }
        }
        if (global.city['wharf']){
            let vol = global.tech['world_control'] ? 15 : 10
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                vol *= 2;
            }
            caps['Crates'] += (global.city['wharf'].count * vol);
            caps['Containers'] += (global.city['wharf'].count * vol);
        }
        if (global.city['storage_yard']){
            let size = global.tech.container >= 3 ? 20 : 10;
            if (global.tech['world_control']){
                size += 10;
            }
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                size *= 2;
            }
            caps['Crates'] += (global.city['storage_yard'].count * size);
            Object.keys(caps).forEach(function (res){
                caps['Crates'] -= global.resource[res].crates;
            });
        }
        if (global.space['garage']){
            let g_vol = global.tech['particles'] >= 4 ? 20 + global.tech['supercollider'] : 20;
            if (global.tech['world_control']){
                g_vol += 10;
            }
            caps['Containers'] += (global.space['garage'].count * g_vol);
        }
        if (global.city['warehouse']){
            let volume = global.tech['steel_container'] >= 2 ? 20 : 10;
            if (global.tech['world_control']){
                volume += 10;
            }
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                volume *= 2;
            }
            caps['Containers'] += (global.city['warehouse'].count * volume);
            Object.keys(caps).forEach(function (res){
                caps['Containers'] -= global.resource[res].containers;
            });
        }
        if (global.city['rock_quarry']){
            let gain = (global.city['rock_quarry'].count * spatialReasoning(100));
            if (global.stats.achieve['blackhole']){ gain = Math.round(gain * (1 + (global.stats.achieve.blackhole * 0.05))) };
            caps['Stone'] += gain;
            bd_Stone['Quarry'] = gain+'v';
        }
        if (global.city['lumber_yard']){
            let gain = (global.city['lumber_yard'].count * spatialReasoning(100));
            if (global.stats.achieve['blackhole']){ gain = Math.round(gain * (1 + (global.stats.achieve.blackhole * 0.05))) };
            caps['Lumber'] += gain;
            bd_Lumber['Lumber_Yard'] = gain+'v';
        }
        if (global.city['sawmill']){
            let gain = (global.city['sawmill'].count * spatialReasoning(200));
            if (global.stats.achieve['blackhole']){ gain = Math.round(gain * (1 + (global.stats.achieve.blackhole * 0.05))) };
            caps['Lumber'] += gain;
            bd_Lumber['Sawmill'] = gain+'v';
            let impact = global.tech['saw'] >= 2 ? 0.08 : 0.05;
            global.civic.lumberjack.impact = (global.city['sawmill'].count * impact) + 1;
        }
        if (global.city['mine']){
            lCaps['miner'] += global.city['mine'].count;
        }
        if (global.city['coal_mine']){
            lCaps['coal_miner'] += global.city['coal_mine'].count;
        }
        if (global.city['bank']){
            lCaps['banker'] += global.city['bank'].count;
        }
        if (global.city['amphitheatre']){
            lCaps['entertainer'] += global.city['amphitheatre'].count;
        }
        if (global.city['casino']){
            lCaps['entertainer'] += global.city['casino'].count;
        }
        if (global.city['cement_plant']){
            lCaps['cement_worker'] += global.city['cement_plant'].count * 2;
        }
        if (global.race['parasite']){
            lCaps['garrison'] += 2;
        }
        if (global.city['garrison']){
            lCaps['garrison'] += global.city.garrison.count * (global.tech['military'] >= 5 ? 3 : 2);
            if (global.race['chameleon']){
                lCaps['garrison'] -= global.city.garrison.count;
            }
        }
        if (global.space['space_barracks']){
            lCaps['garrison'] += global.space.space_barracks.on * 2;
        }
        if (global.city['basic_housing']){
            caps[races[global.race.species].name] += global.city['basic_housing'].count;
            bd_Citizen[basicHousingLabel()] = global.city['basic_housing'].count + 'v';
        }
        if (global.city['cottage']){
            caps[races[global.race.species].name] += global.city['cottage'].count * 2;
            bd_Citizen['Cottage'] = (global.city['cottage'].count * 2) + 'v';
            if (global.tech['home_safe']){
                let gain = (global.city['cottage'].count * spatialReasoning(global.tech.home_safe > 1 ? 2000 : 1000));
                caps['Money'] += gain;
                bd_Money['Cottage'] = gain+'v';
            }
        }
        if (global.city['apartment']){
            caps[races[global.race.species].name] += global.city['apartment'].on * 5;
            bd_Citizen['Apartment'] = (global.city['apartment'].on * 5)+'v';
            if (global.tech['home_safe']){
                let gain = (global.city['apartment'].on * spatialReasoning(global.tech.home_safe > 1 ? 5000 : 2000));
                caps['Money'] += gain;
                bd_Money['Apartment'] = gain+'v';
            }
        }
        if (global.space['living_quarters']){
            caps[races[global.race.species].name] += red_on['living_quarters'];
            lCaps['colonist'] += red_on['living_quarters'];
            bd_Citizen[`${races[global.race.species].solar.red}`] = red_on['living_quarters'] + 'v';
        }
        if (global.city['lodge']){
            caps[races[global.race.species].name] += global.city['lodge'].count;
        }
        if (global.space['outpost']){
            let gain = global.space['outpost'].count * spatialReasoning(500);
            caps['Neutronium'] += gain;
            bd_Neutronium['Outpost'] = gain+'v';
        }
        if (global.city['shed']){
            var multiplier = storageMultipler();
            let gain = 0;
            let label = global.tech['storage'] <= 2 ? 'Shed' : (global.tech['storage'] >= 4 ? 'Warehouse' : 'Barn');
            if (global.tech['storage'] >= 3){
                gain = (global.city['shed'].count * (spatialReasoning(40) * multiplier));
                caps['Steel'] += gain;
                bd_Steel[label] = gain+'v';
            }
            if (global.tech['storage'] >= 4){
                gain = (global.city['shed'].count * (spatialReasoning(20) * multiplier));
                caps['Titanium'] += gain;
                bd_Titanium[label] = gain+'v';
            }
            gain = (global.city['shed'].count * (spatialReasoning(300) * multiplier));
            caps['Lumber'] += gain;
            bd_Lumber[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(300) * multiplier));
            caps['Stone'] += gain;
            bd_Stone[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(125) * multiplier));
            caps['Furs'] += gain;
            bd_Furs[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(90) * multiplier));
            caps['Copper'] += gain;
            bd_Copper[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(125) * multiplier));
            caps['Iron'] += gain;
            bd_Iron[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(90) * multiplier));
            caps['Aluminium'] += gain;
            bd_Aluminium[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(100) * multiplier));
            caps['Cement'] += gain;
            bd_Cement[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(75) * multiplier));
            caps['Coal'] += gain;
            bd_Coal[label] = gain+'v';
        }
        if (global.space['garage']){
            let multiplier = global.tech['particles'] >= 4 ? 1 + (global.tech['supercollider'] / 20) : 1;
            multiplier *= global.tech['world_control'] ? 2 : 1;
            multiplier *= global.stats.achieve['blackhole'] ? 1 + (global.stats.achieve.blackhole * 0.05) : 1;

            let gain = (global.space.garage.count * (spatialReasoning(6500) * multiplier));
            caps['Copper'] += gain;
            bd_Copper['Garage'] = gain+'v';

            gain = (global.space.garage.count * (spatialReasoning(5500) * multiplier));
            caps['Iron'] += gain;
            bd_Iron['Garage'] = gain+'v';

            gain = (global.space.garage.count * (spatialReasoning(6000) * multiplier));
            caps['Cement'] += gain;
            bd_Cement['Garage'] = gain+'v';

            gain = (global.space.garage.count * (spatialReasoning(4500) * multiplier));
            caps['Steel'] += gain;
            bd_Steel['Garage'] = gain+'v';

            gain = (global.space.garage.count * (spatialReasoning(3500) * multiplier));
            caps['Titanium'] += gain;
            bd_Titanium['Garage'] = gain+'v';

            gain = (global.space.garage.count * (spatialReasoning(2500) * multiplier));
            caps['Alloy'] += gain;
            bd_Alloy['Garage'] = gain+'v';

            if (global.resource.Nano_Tube.display){
                gain = (global.space.garage.count * (spatialReasoning(25000) * multiplier));
                caps['Nano_Tube'] += gain;
                bd_Nano_Tube['Garage'] = gain+'v';
            }

            if (global.resource.Neutronium.display){
                gain = (global.space.garage.count * (spatialReasoning(125) * multiplier));
                caps['Neutronium'] += gain;
                bd_Neutronium['Garage'] = gain+'v';
            }
        }
        if (global.city['silo']){
            let gain = (global.city['silo'].count * spatialReasoning(500));
            if (global.stats.achieve['blackhole']){ gain = Math.round(gain * (1 + (global.stats.achieve.blackhole * 0.05))) };
            caps['Food'] += gain;
            bd_Food['Silo'] = gain+'v';
        }
        if (global.city['smokehouse']){
            let gain = (global.city['smokehouse'].count * spatialReasoning(500));
            if (global.stats.achieve['blackhole']){ gain = Math.round(gain * (1 + (global.stats.achieve.blackhole * 0.05))) };
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
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Oil'] += gain;
            bd_Oil['Fuel_Depot'] = gain+'v';
            if (global.tech['uranium'] >= 2){
                gain = (global.city['oil_depot'].count * spatialReasoning(250));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                caps['Uranium'] += gain;
                bd_Uranium['Fuel_Depot'] = gain+'v';
            }
            if (global.resource['Helium_3'].display){
                gain = (global.city['oil_depot'].count * spatialReasoning(400));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                caps['Helium_3'] += gain;
                bd_Helium['Fuel_Depot'] = gain+'v';
            }
        }
        if (global.space['propellant_depot']){
            let gain = (global.space['propellant_depot'].count * spatialReasoning(1250));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Oil'] += gain;
            bd_Oil['Orbit_Depot'] = gain+'v';
            if (global.resource['Helium_3'].display){
                gain = (global.space['propellant_depot'].count * spatialReasoning(1000));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                caps['Helium_3'] += gain;
                bd_Helium['Orbit_Depot'] = gain+'v';
            }
        }
        if (global.space['gas_storage']){
            let gain = (global.space['gas_storage'].count * spatialReasoning(3500));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Oil'] += gain;
            bd_Oil[`${races[global.race.species].solar.gas}_Depot`] = gain+'v';

            gain = (global.space['gas_storage'].count * spatialReasoning(2500));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Helium_3'] += gain;
            bd_Helium[`${races[global.race.species].solar.gas}_Depot`] = gain+'v';

            gain = (global.space['gas_storage'].count * spatialReasoning(1000));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Uranium'] += gain;
            bd_Uranium[`${races[global.race.species].solar.gas}_Depot`] = gain+'v';
        }
        if (global.space['helium_mine']){
            let gain = (global.space['helium_mine'].count * spatialReasoning(100));
            caps['Helium_3'] += gain;
            bd_Helium['Helium Mine'] = gain+'v';
        }
        if (global.city['university']){
            let multiplier = 1;
            let base = global.tech['science'] && global.tech['science'] >= 8 ? 700 : 500;
            if (global.tech['science'] >= 4){
                multiplier += global.city['library'].count * 0.02;
            }
            if (global.space['observatory'] && global.space.observatory.count > 0){
                multiplier += (moon_on['observatory'] * 0.05);
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
            if (global.space['satellite']){
                gain *= 1 + (global.space.satellite.count * 0.04);
            }
            caps['Knowledge'] += gain;
            bd_Knowledge['Wardenclyffe'] = gain+'v';
        }
        if (global.space['satellite']){
            let gain = (global.space.satellite.count * 750);
            caps['Knowledge'] += gain;
            bd_Knowledge['Satellite'] = gain+'v';
        }
        if (global.space['observatory'] && global.space.observatory.count > 0){
            let gain = (moon_on['observatory'] * 5000);
            caps['Knowledge'] += gain;
            bd_Knowledge['Observatory'] = gain+'v';
        }
        if (global.city['biolab']){
            caps['Knowledge'] += (p_on['biolab'] * 3000);
            bd_Knowledge['Bio_Lab'] = (p_on['biolab'] * 3000)+'v';
        }
        if (global.city['bank']){
            let vault = 1800;
            if (global.tech['vault'] >= 1){
                vault = global.tech['vault'] >= 2 ? 22500 : 15000;
            }
            else if (global.tech['banking'] >= 5){
                vault = 9000;
            }
            else if (global.tech['banking'] >= 3){
                vault = 4000;
            }
            if (global.race['paranoid']){
                vault *= 0.9;
            }
            else if (global.race['hoarder']){
                vault *= 1.2;
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
            if (global.tech['world_control']){
                vault *= 1.25;
            }
            let gain = (global.city['bank'].count * spatialReasoning(vault));
            caps['Money'] += gain;
            bd_Money['Bank'] = gain+'v';
        }
        if (global.city['casino']){
            let vault = global.city['casino'].count * spatialReasoning(global.tech['gambling'] >= 2 ? 60000 : 40000);
            if (global.tech['world_control']){
                vault = Math.round(vault * 1.25);
            }
            caps['Money'] += vault;
            bd_Money['Casino'] = vault+'v';
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
        if (p_on['moon_base']){
            let gain = p_on['moon_base'] * spatialReasoning(500);
            caps['Iridium'] += gain;
            bd_Iridium['Moon_Base'] = gain+'v';
        }
        if (p_on['space_station']){
            lCaps['space_miner'] += p_on['space_station'] * 3;
            if (global.tech['asteroid'] >= 5){
                let gain = p_on['space_station'] * spatialReasoning(5);
                caps['Elerium'] += gain;
                bd_Elerium['Space_Station'] = gain+'v';
            }
        }
        if (red_on['exotic_lab']){
            let el_gain = red_on['exotic_lab'] * spatialReasoning(10);
            caps['Elerium'] += el_gain;
            bd_Elerium['Exotic_Lab'] = el_gain+'v';
            let gain = red_on['exotic_lab'] * global.civic.colonist.workers * 500;
            caps['Knowledge'] += gain;
            bd_Knowledge['Exotic_Lab'] = gain+'v';
        }
        if (p_on['elerium_contain']){
            let el_gain = p_on['elerium_contain'] * spatialReasoning(100);
            caps['Elerium'] += el_gain;
            bd_Elerium['Containment'] = el_gain+'v';
        }
        if (global.city['foundry']){
            lCaps['craftsman'] += global.city['foundry'].count;
        }
        if (red_on['fabrication']){
            lCaps['craftsman'] += red_on['fabrication'];
        }

        if (global.city['trade']){
            let routes = global.race['xenophobic'] ? global.tech.trade : global.tech.trade + 1;
            global.city.market.mtrade = routes * global.city.trade.count;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 3){
                global.city.market.mtrade += global.city.temple.count;
            }
        }
        if (global.city['wharf']){
            global.city.market.mtrade += global.city.wharf.count * (global.race['xenophobic'] ? 1 : 2);
        }
        
        let pop_loss = global.resource[races[global.race.species].name].amount - caps[races[global.race.species].name];
        if (pop_loss > 0){
            if (pop_loss === 1){
                messageQueue(loc('abandon1',[pop_loss]),'danger');
            }
            else {
                messageQueue(loc('abandon2',[pop_loss]),'danger');
            }
        }

        if (p_on['world_controller']){
            let gain = Math.round(caps['Knowledge'] * 0.25);
            caps['Knowledge'] += gain;
            bd_Knowledge['WS_Collider'] = gain+'v';
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
            Aluminium: bd_Aluminium,
            Titanium: bd_Titanium,
            Alloy: bd_Alloy,
            Polymer: bd_Polymer,
            Iridium: bd_Iridium,
            "Helium_3": bd_Helium,
            Neutronium: bd_Neutronium,
            Elerium: bd_Elerium,
            Nano_Tube: bd_Nano_Tube,
        };

        let create_value = crateValue();
        let container_value = containerValue();
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
            if (global.civic[job].workers > global.civic[job].max && global.civic[job].max !== -1){
                global.civic[job].workers = global.civic[job].max;
            }
            else if (global.civic[job].workers < 0){
                global.civic[job].workers = 0;
            }
        });

        if (global.civic.space_miner.display && global.space['space_station']){
            global.space.space_station.s_max = global.civic.space_miner.workers;
        }

        Object.keys(global.city).forEach(function (action){
            if (actions.city[action] && actions.city[action].cost){
                let c_action = actions.city[action];
                let element = $('#'+c_action.id);
                if (checkAffordable(c_action)){
                    if (element.hasClass('cna')){
                        element.removeClass('cna');
                    }
                }
                else if (!element.hasClass('cna')){
                    element.addClass('cna');
                }
                if (checkAffordable(c_action,true)){
                    if (element.hasClass('cnam')){
                        element.removeClass('cnam');
                    }
                }
                else if (!element.hasClass('cnam')){
                    element.addClass('cnam');
                }
            }
        });

        Object.keys(actions.tech).forEach(function (action){
            if (actions.tech[action] && actions.tech[action].cost){
                let c_action = actions.tech[action];
                let element = $('#'+c_action.id);
                if (element.length > 0){
                    if (checkAffordable(c_action)){
                        if (element.hasClass('cna')){
                            element.removeClass('cna');
                        }
                    }
                    else if (!element.hasClass('cna')){
                        element.addClass('cna');
                    }
                    if (checkAffordable(c_action,true)){
                        if (element.hasClass('cnam')){
                            element.removeClass('cnam');
                        }
                    }
                    else if (!element.hasClass('cnam')){
                        element.addClass('cnam');
                    }
                }
            }
        });

        Object.keys(actions.space).forEach(function (region){
            Object.keys(actions.space[region]).forEach(function (action){
                if ((global.space[action] || actions.space[region][action].grant) && actions.space[region][action] && actions.space[region][action].cost){
                    let c_action = actions.space[region][action];
                    let element = $('#'+c_action.id);
                    if (checkAffordable(c_action)){
                        if (element.hasClass('cna')){
                            element.removeClass('cna');
                        }
                    }
                    else if (!element.hasClass('cna')){
                        element.addClass('cna');
                    }
                    if (checkAffordable(c_action,true)){
                        if (element.hasClass('cnam')){
                            element.removeClass('cnam');
                        }
                    }
                    else if (!element.hasClass('cnam')){
                        element.addClass('cnam');
                    }
                }
            });
        });

        if (global.space['swarm_control']){
            global.space.swarm_control.s_max = global.space.swarm_control.count * (global.tech['swarm'] && global.tech['swarm'] >= 2 ? 6 : 4);
        }

        if (global.arpa['sequence'] && global.arpa.sequence.on && gene_sequence){
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
                    messageQueue(loc('genome',[races[global.race.species].name]),'success');
                    global.tech['genetics'] = 3;
                }
                else {
                    global.race.mutation++;
                    randomMinorTrait();
                    messageQueue(loc('gene_therapy'),'success');
                    global.stats.plasmid++;
                    global.race.Plasmid.count++;
                }
                arpa('Genetics');
                drawTech();
            }
        }

        if (global.city['foundry']){
            let fworkers = global.civic.craftsman.workers;
            if (global.race['kindling_kindred'] && global.city.foundry['Plywood'] > 0){
                global.civic.craftsman.workers -= global.city.foundry['Plywood'];
                global.city.foundry.crafting -= global.city.foundry['Plywood'];
                global.city.foundry['Plywood'] = 0;
            }
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

        if (global.race['carnivore'] && global.civic.farmer.workers > 0){
            global.civic.farmer.workers = 0;
            global.civic.farmer.max = 0;
        }

        if (global.race['kindling_kindred'] && global.civic.lumberjack.workers > 0){
            global.civic.lumberjack.workers = 0;
        }
        if (global.race['kindling_kindred'] && global.city.foundry['Plywood'] > 0){
            global.city.foundry['Plywood'] = 0;
        }

        q_check();

        let belt_mining = belt_on['iron_ship'] + belt_on['iridium_ship'];
        if (belt_mining > 0 && global.tech['asteroid'] && global.tech['asteroid'] === 3){
            if (Math.rand(0,250) <= belt_mining){
                global.tech['asteroid'] = 4;
                global.resource.Elerium.display = true;
                modRes('Elerium',1);
                drawTech();
                messageQueue(loc('discover_elerium'));
            }
        }

        if (p_on['outpost'] > 0 && global.tech['gas_moon'] && global.tech['gas_moon'] === 1){
            if (Math.rand(0,100) <= p_on['outpost']){
                global.space['oil_extractor'] = { count: 0, on: 0 };
                global.tech['gas_moon'] = 2;
                messageQueue(loc('discover_oil',[races[global.race.species].solar.gas_moon]));
                space();
            }
        }

        checkAchievements();
    }
    Object.keys(global.resource).forEach(function (res){
        $(`[data-${res}]`).each(function (i,v){
            let fail_max = global.resource[res].max >= 0 && $(this).attr(`data-${res}`) > global.resource[res].max ? true : false;
            if (global.resource[res].amount + global.resource[res].diff < $(this).attr(`data-${res}`) || fail_max){
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
                if (global.resource[res].display && Math.rand(0,4) === 0){
                    let max = r_val * 3;
                    let min = r_val / 2;
                    let variance = (Math.rand(0,200) - 100) / 100;
                    let new_value = global.resource[res].value + variance;
                    if (new_value < min){
                        new_value = r_val;
                    }
                    else if (new_value > max){
                        new_value = max - r_val;
                    }
                    global.resource[res].value = new_value;
                }
            });
        }

        if (global.race['frenzy']){
            if (!global.city.morale['frenzy']){
                global.city.morale['frenzy'] = 0;
            }

            if (global.race.frenzy > 1){
                global.race.frenzy--;
            }
        }

        // Soldier Healing
        if (global.civic.garrison.wounded > 0){
            let healed = global.race['regenerative'] ? 4 : 1;
            if (global.city['hospital']){
                let hc = global.city['hospital'].count;
                while (hc >= 20){
                    healed++;
                    hc -= 20;
                }
                if (Math.rand(0,hc) > Math.rand(0,20)){
                    healed++;
                }
            }
            global.civic.garrison.wounded -= healed;
            if (global.civic.garrison.wounded < 0){
                global.civic.garrison.wounded = 0;
            }
        }

        if (global.civic.garrison['fatigue'] && global.civic.garrison.fatigue > 0){
            global.civic.garrison.fatigue--;
        }

        if (global.civic.garrison['protest'] && global.civic.garrison.protest > 0){
            global.civic.garrison.protest--;
        }

        let merc_bound = global.tech['mercs'] && global.tech['mercs'] >= 2 ? 3 : 4;
        if (global.civic.garrison['m_use'] && global.civic.garrison.m_use > 0 && Math.rand(0,merc_bound) === 0){
            global.civic.garrison.m_use--;
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
            if (global.tech['foundry'] && (global.city.calendar.moon === 0 || (global.city.calendar.moon === 14 && global.genes['crafty']))){
                let craft_costs = global.race['resourceful'] ? 0.9 : 1;
                Object.keys(craftCost).forEach(function (craft){
                    let num = global.city.foundry[craft];
                    let craft_ratio = craftingRatio(craft);
                    if (global.tech['v_train']){
                        craft_ratio *= 2;
                    }
                    if (global.genes['crafty']){
                        craft_ratio *= 1 + ((global.genes.crafty - 1) * 0.5);
                    }

                    let volume = Math.floor(global.resource[craftCost[craft][0].r].amount / (craftCost[craft][0].a * craft_costs));
                    for (let i=1; i<craftCost[craft].length; i++){
                        let temp = Math.floor(global.resource[craftCost[craft][i].r].amount / (craftCost[craft][i].a * craft_costs));
                        if (temp < volume){
                            volume = temp;
                        }
                    }
                    if (num < volume){
                        volume = num;
                    }
                    for (let i=0; i<craftCost[craft].length; i++){
                        let final = volume * craftCost[craft][i].a * craft_costs;
                        global.resource[craftCost[craft][i].r].amount -= final;
                    }
                    global.resource[craft].amount += craft_ratio * volume;
                });
            }

            setWeather();
        }

        let deterioration = Math.floor(50000000 / (1 + global.race.mutation)) - global.stats.days;
        if (global.race.deterioration === 0 && deterioration < 40000000){
            global.race.deterioration = 1;
            let death_clock = Math.round(deterioration / (global.city.calendar.orbit * (1 + global.race.mutation)));
            messageQueue(loc('deterioration1',[races[global.race.species].name,death_clock]),'danger');
        }
        else if (global.race.deterioration === 1 && deterioration < 20000000){
            global.race.deterioration = 2;
            let death_clock = Math.round(deterioration / (global.city.calendar.orbit * (1 + global.race.mutation)));
            messageQueue(loc('deterioration2',[races[global.race.species].name,death_clock]),'danger');
        }
        else if (global.race.deterioration === 2 && deterioration < 5000000){
            global.race.deterioration = 3;
            let death_clock = Math.round(deterioration / (global.city.calendar.orbit * (1 + global.race.mutation)));
            messageQueue(loc('deterioration3',[races[global.race.species].name,death_clock]),'danger');
        }
        else if (global.race.deterioration === 3 && deterioration < 1000000){
            global.race.deterioration = 4;
            let death_clock = Math.round(deterioration / (global.city.calendar.orbit * (1 + global.race.mutation)));
            messageQueue(loc('deterioration4',[races[global.race.species].name,death_clock]),'danger');
        }
        else if (global.race.deterioration === 4 && deterioration <= 0){
            global.race.deterioration = 5;
            global.race['decayed'] = global.stats.days;
            global.tech['decay'] = 1;
            messageQueue(loc('deterioration5',[races[global.race.species].name]),'danger');
            drawTech();
        }

        if (!global.tech['genesis'] && global.race.deterioration >= 1 && global.tech['high_tech'] && global.tech['high_tech'] >= 10){
            global.tech['genesis'] = 1;
            messageQueue(loc('genesis'),'special');
            drawTech();
        }
    }

    // Event triggered
    if (!global.race.seeded || (global.race.seeded && global.race['chose'])){
        if (Math.rand(0,global.event) === 0){
            var event_pool = [];
            Object.keys(events).forEach(function (event){
                var isOk = true;
                Object.keys(events[event].reqs).forEach(function (req) {
                    switch(req){
                        case 'race':
                            if (events[event].reqs[req] !== global.race.species){
                                isOk = false;
                            }
                            break;
                        case 'genus':
                            if (events[event].reqs[req] !== races[global.race.species].type){
                                isOk = false;
                            }
                            break;
                        case 'nogenus':
                            if (events[event].reqs[req] === races[global.race.species].type){
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
                        case 'notech':
                            if (global.tech[events[event].reqs[req]]){
                                isOk = false;
                            }
                            break;
                        case 'high_tax_rate':
                            if (global.civic.taxes.tax_rate <= [events[event].reqs[req]]){
                                isOk = false;
                            }
                            break;
                        case 'low_morale':
                            if (global.city.morale.current >= [events[event].reqs[req]]){
                                isOk = false;
                            }
                            break;
                        case 'biome':
                            if (global.city.biome !== [events[event].reqs[req]]){
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
    }

    // Save game state
    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
}

function q_check(){
    if (global.tech['high_tech'] && global.tech['high_tech'] >= 11){
        let k_base = global.resource.Knowledge.max;
        let k_inc = 250000;
        let qbits = 0;
        while (k_base > k_inc){
            k_base -= k_inc;
            k_inc *= 1.1;
            qbits++;
        }
        qbits += +(k_base / k_inc).toFixed(2);
        set_qlevel(qbits);
    }
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

function steelCheck(){
    if (global.resource.Steel.display === false && Math.rand(0,1250) === 0){
        global.resource.Steel.display = true;
        modRes('Steel',1);
        messageQueue(loc('steel_sample'),'success');
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
