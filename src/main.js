import { global, save, poppers, resizeGame, messageQueue, modRes, breakdown, keyMultiplier, p_on, moon_on, red_on, belt_on, int_on, set_qlevel, achieve_level, quantum_level } from './vars.js';
import { loc, locales } from './locale.js';
import { mainVue, timeCheck, timeFormat, powerModifier } from './functions.js';
import { setupStats, unlockAchieve, checkAchievements } from './achieve.js';
import { races, racialTrait, randomMinorTrait, biomes, planetTraits } from './races.js';
import { defineResources, resource_values, spatialReasoning, craftCost, plasmidBonus, tradeRatio, craftingRatio, crateValue, containerValue, tradeSellPrice, tradeBuyPrice, atomic_mass } from './resources.js';
import { defineJobs, job_desc, loadFoundry } from './jobs.js';
import { f_rate } from './industry.js';
import { defineGovernment, defineIndustry, defineGarrison, garrisonSize, armyRating, buildQueue } from './civics.js';
import { actions, updateDesc, challengeGeneHeader, challengeActionHeader, checkTechRequirements, checkOldTech, addAction, storageMultipler, checkAffordable, drawCity, drawTech, gainTech, removeAction, evoProgress, housingLabel, oldTech, setPlanet, resQueue } from './actions.js';
import { space, deepSpace, fuel_adjust, int_fuel_adjust, zigguratBonus, setUniverse, universe_types } from './space.js';
import { renderFortress, bloodwar } from './portal.js';
import { arpa } from './arpa.js';
import { events } from './events.js';
import { index } from './index.js';

delete global.tech['world_control'];

var intervals = {};
if (global.settings.expose){
    enableScript();
}

index();
if (global['beta']){
    $('#topBar .version > a').html(`beta v${global.version}.${global.beta}`);
}
else {
    $('#topBar .version > a').html('v'+global.version);
}

if (Object.keys(locales).length > 1){
    $('#localization').append($(`<span>${loc('locale')}: <select @change="lChange()" :v-model="s.locale"></select></span>`));
    Object.keys(locales).forEach(function (locale){
        let selected = global.settings.locale === locale ? ' selected=selected' : '';
        $('#localization select').append($(`<option value="${locale}"${selected}>${locales[locale]}</option>`));
    });
}

mainVue();
resQueue();

if (global['new']){
    messageQueue(loc('new'), 'warning');
    global['new'] = false;
}

if (global.city['mass_driver']){
    p_on['mass_driver'] = global.city['mass_driver'].on;
}
if (global.portal['turret']){
    p_on['turret'] = global.portal.turret.on;
}
if (global.interstellar['fusion']){
    int_on['fusion'] = global.interstellar.fusion.on;
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
defineIndustry();

buildQueue();

arpa('Physics');
arpa('Genetics');
arpa('Crispr');

resizeGame();

new Vue({
    el: '#race',
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
    },
    filters: {
        approx(kw){
            return +(kw).toFixed(2);
        },
        mRound(m){
            return +(m).toFixed(1);
        }
    }
});

var moraleCap = 125;
var moralePopper;
$('#morale').on('mouseover',function(){
    moralePopper = $(`<div class="popper has-background-light has-text-dark"></div>`);
    $('#main').append(moralePopper);
    if (global.city.morale.unemployed !== 0){
        let type = global.city.morale.unemployed > 0 ? 'success' : 'danger';
        moralePopper.append(`<p class="modal_bd"><span>${loc('morale_unemployed')}</span> <span class="has-text-${type}"> ${+(global.city.morale.unemployed).toFixed(1)}%</span></p>`);
    }
    if (global.city.morale.stress !== 0){
        let type = global.city.morale.stress > 0 ? 'success' : 'danger';
        moralePopper.append(`<p class="modal_bd"><span>${loc('morale_stress')}</span> <span class="has-text-${type}"> ${+(global.city.morale.stress).toFixed(1)}%</span></p>`);
    }
    if (global.city.morale.shrine !== 0){
        let type = global.city.morale.shrine > 0 ? 'success' : 'danger';
        moralePopper.append(`<p class="modal_bd"><span>${loc('city_shrine')}</span> <span class="has-text-${type}"> ${+(global.city.morale.shrine).toFixed(1)}%</span></p>`);
    }
    if (global.city.morale.leadership !== 0){
        let type = global.city.morale.leadership > 0 ? 'success' : 'danger';
        moralePopper.append(`<p class="modal_bd"><span>${loc('morale_leadership')}</span> <span class="has-text-${type}"> ${+(global.city.morale.leadership).toFixed(1)}%</span></p>`);
    }
    if (global.city.morale.warmonger !== 0){
        let type = global.city.morale.warmonger > 0 ? 'success' : 'danger';
        moralePopper.append(`<p class="modal_bd"><span>${loc('morale_warmonger')}</span> <span class="has-text-${type}"> ${+(global.city.morale.warmonger).toFixed(1)}%</span></p>`);
    }
    if (global.city.morale.entertain !== 0){
        let type = global.city.morale.entertain > 0 ? 'success' : 'danger';
        moralePopper.append(`<p class="modal_bd"><span>${loc('morale_entertainment')}</span> <span class="has-text-${type}"> ${+(global.city.morale.entertain).toFixed(1)}%</span></p>`);
    }
    if (global.city.morale.season !== 0){
        let season = global.city.calendar.season === 0 ? loc('morale_spring') : loc('morale_winter');
        let type = global.city.morale.season > 0 ? 'success' : 'danger';
        moralePopper.append(`<p class="modal_bd"><span>${season}</span> <span class="has-text-${type}"> ${+(global.city.morale.season).toFixed(1)}%</span></p>`);
    }
    if (global.city.morale.weather !== 0){
        let type = global.city.morale.weather > 0 ? 'success' : 'danger';
        moralePopper.append(`<p class="modal_bd"><span>${loc('morale_weather')}</span> <span class="has-text-${type}"> ${+(global.city.morale.weather).toFixed(1)}%</span></p>`);
    }
    if (global.city.morale.tax !== 0){
        let type = global.city.morale.tax > 0 ? 'success' : 'danger';
        moralePopper.append(`<p class="modal_bd"><span>${loc('morale_taxes')}</span> <span class="has-text-${type}"> ${+(global.city.morale.tax).toFixed(1)}%</span></p>`);
    }
    let total = 100 + global.city.morale.unemployed + global.city.morale.stress + global.city.morale.entertain + global.city.morale.season + global.city.morale.weather + global.city.morale.tax + global.city.morale.warmonger + global.city.morale.leadership + global.city.morale.shrine;
    if (global.city.morale['frenzy']){
        total += global.city.morale.frenzy;
        let type = global.city.morale.frenzy > 0 ? 'success' : 'danger';
        moralePopper.append(`<p class="modal_bd"><span>${loc('morale_frenzy')}</span> <span class="has-text-${type}"> ${+(global.city.morale.frenzy).toFixed(1)}%</span></p>`);
    }
    if (global.city.morale['rev']){
        total -= global.city.morale.rev;
        moralePopper.append(`<p class="modal_bd"><span>${loc('morale_rev')}</span> <span class="has-text-danger"> -${+(global.city.morale.rev).toFixed(1)}%</span></p>`);
    }
    if (global.civic.govern.type === 'corpocracy'){
        moralePopper.append(`<p class="modal_bd"><span>${loc('govern_corpocracy')}</span> <span class="has-text-danger"> -15%</span></p>`);
    }
    
    total = +(total).toFixed(1);
    if (total > moraleCap || total < 50){
        moralePopper.append(`<div class="modal_bd sum"><span>${loc('morale_current')}</span> <span class="has-text-warning"> ${+(global.city.morale.current).toFixed(1)}% (${total}%)</span></div>`);
    }
    else {
        moralePopper.append(`<div class="modal_bd sum"><span>${loc('morale_current')}</span> <span class="has-text-warning"> ${+(global.city.morale.current).toFixed(1)}%</span></div>`);
    }
    moralePopper.show();
    poppers['morale'] = new Popper($('#morale'),moralePopper);
});
$('#morale').on('mouseout',function(){
    moralePopper.hide();
    poppers['morale'].destroy();
    moralePopper.remove();
});

var power_generated = {};
var powerPopper;
$('#powerStatus').on('mouseover',function(){
    powerPopper = $(`<div class="popper has-background-light has-text-dark"></div>`);
    $('#main').append(powerPopper);
    let drain = global.city.power_total - global.city.power;
    Object.keys(power_generated).forEach(function (k){
        let gen = +(power_generated[k]).toFixed(2);
        powerPopper.append(`<p class="modal_bd"><span>${k}</span> <span class="has-text-success">+${gen}</span></p>`);
    });
    powerPopper.append(`<p class="modal_bd"><span>${loc('power_consumed')}</span> <span class="has-text-danger"> -${drain}</span></p>`);
    let avail = +(global.city.power).toFixed(2);
    if (global.city.power > 0){
        powerPopper.append(`<p class="modal_bd sum"><span>${loc('power_available')}</span> <span class="has-text-success">${avail}</span></p>`);
    }
    else {
        powerPopper.append(`<p class="modal_bd sum"><span>${loc('power_available')}</span> <span class="has-text-danger">${avail}</span></p>`);
    }
    powerPopper.show();
    poppers['PowerStatus'] = new Popper($('#powerStatus'),powerPopper);
});
$('#powerStatus').on('mouseout',function(){
    powerPopper.hide();
    poppers['PowerStatus'].destroy();
    powerPopper.remove();
});

new Vue({
    el: '#topBar',
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
        },
        showUniverse(){
            return global.race.universe === 'standard' || global.race.universe === 'bigbang' ? false : true;
        }
    },
    filters: {
        planet(species){
            return races[species].home;
        },
        universe(universe){
            return universe === 'standard' || universe === 'bigbang' ? '' : universe_types[universe].name;
        }
    }
});

$('#topBar .planetWrap .planet').on('mouseover',function(){
    var popper = $(`<div id="topbarPop" class="popper has-background-light has-text-dark"></div>`);
    $('#main').append(popper);
    if (global.race.species === 'protoplasm'){
        popper.append($(`<span>${loc('infant')}</span>`));
    }
    else {
        let planet = races[global.race.species].home;
        let race = races[global.race.species].name;
        let planet_label = biomes[global.city.biome].label;
        let trait = global.city.ptrait;
        if (trait !== 'none'){
            if (trait === 'mellow' && global.race.species === 'entish'){
                planet_label = `${loc('planet_mellow_eg')} ${planet_label}`;
            }
            else {
                planet_label = `${planetTraits[trait].label} ${planet_label}`;
            }
        }
        let orbit = global.city.calendar.orbit;
        let challenges = '';
        if (global.race['junker']){
            challenges = challenges + `<div>${loc('evo_challenge_junker_desc')}</div>`;
        }
        if (global.race['joyless']){
            challenges = challenges + `<div>${loc('evo_challenge_joyless_desc')}</div>`;
        }
        if (global.race['decay']){
            challenges = challenges + `<div>${loc('evo_challenge_decay_desc')}</div>`;
        }
        popper.append($(`<div>${loc('home',[planet,race,planet_label,orbit])}</div>${challenges}`));
    }
    popper.show();
    poppers['topbarPop'] = new Popper($('#topBar .planet'),popper);
});

$('#topBar .planetWrap .planet').on('mouseout',function(){
    $(`#topbarPop`).hide();
    poppers['topbarPop'].destroy();
    $(`#topbarPop`).remove();
});

$('#topBar .planetWrap .universe').on('mouseover',function(){
    var popper = $(`<div id="topbarPop" class="popper has-background-light has-text-dark"></div>`);
    $('#main').append(popper);
    popper.append($(`<div>${universe_types[global.race.universe].desc}</div>`));
    popper.append($(`<div>${universe_types[global.race.universe].effect}</div>`));
    popper.show();
    poppers['topbarPop'] = new Popper($('#topBar .planet'),popper);

});
$('#topBar .planetWrap .universe').on('mouseout',function(){
    $(`#topbarPop`).hide();
    poppers['topbarPop'].destroy();
    $(`#topbarPop`).remove();
});

if (global.race.species === 'protoplasm'){
    global.resource.RNA.display = true;
    if (global.race.universe === 'bigbang'){
        Math.seed = global.race.seed;
        setUniverse();
    }
    else if (global.race.seeded && !global.race['chose']){
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
        var late_actions = ['multicellular','spores','poikilohydric','bilateral_symmetry','bryophyte','athropods','mammals','eggshell','endothermic','ectothermic','humanoid','gigantism','dwarfism','animalism','aquatic','demonic','celestial','sentience','bunker'];
        for (var i = 0; i < late_actions.length; i++){
            if (global.evolution[late_actions[i]] && global.evolution[late_actions[i]].count == 0){
                addAction('evolution',late_actions[i]);
            }
        }

        if (global.race.seeded || global.stats.achieve['creator']){
            var race_options = ['human','orc','elven','troll','orge','cyclops','kobold','goblin','gnome','cath','wolven','centaur','tortoisan','gecko','slitheryn','arraak','pterodacti','dracnid','sporgar','shroomi','mantis','scorpid','antid','entish','cacti','sharkin','octigoran','imp','balorg','seraph','unicorn'];
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
    
    if (global.evolution['bunker'] && global.evolution['bunker'].count >= 1){
        challengeGeneHeader();
        var challenge_genes = ['plasmid','mastery','trade','craft','crispr'];
        for (var i = 0; i < challenge_genes.length; i++){
            if (global.evolution[challenge_genes[i]] && global.evolution[challenge_genes[i]].count == 0){
                addAction('evolution',challenge_genes[i]);
            }
        }

        challengeActionHeader()
        var challenge_actions = ['junker','joyless','decay'];
        for (var i = 0; i < challenge_actions.length; i++){
            if (global.evolution[challenge_actions[i]] && global.evolution[challenge_actions[i]].count == 0){
                addAction('evolution',challenge_actions[i]);
            }
        }
    }
}
else {
    drawCity();

    Object.keys(actions.tech).forEach(function (tech){
        if (checkTechRequirements(tech)){
            addAction('tech',tech);
        }
        if (checkOldTech(tech)){
            oldTech(tech);
        }
    });
    space();
    deepSpace();
    renderFortress()    
    setWeather();
}

setupStats();
q_check();

$('#lbl_city').html('Village');

var fed = true;

var main_timer = global.race['slow'] ? 275 : 250;
var mid_timer = global.race['slow'] ? 1100 : 1000;
var long_timer = global.race['slow'] ? 5500 : 5000;
if (global.race['hyper']){
    main_timer = Math.floor(main_timer * 0.95);
    mid_timer = Math.floor(mid_timer * 0.95);
    long_timer = Math.floor(long_timer * 0.95);
}

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

resourceAlt();

var gene_sequence = global.arpa['sequence'] && global.arpa['sequence']['on'] ? global.arpa.sequence.on : 0;
function fastLoop(){
    keyMultiplier();
    
    breakdown.p['Global'] = {};
    var global_multiplier = 1;
    let applyPlasmid = false;
    if (global.race.Plasmid.count > 0  && ((global.race.universe !== 'antimatter') || (global.genes['bleed'] && global.race.universe === 'antimatter'))){
        breakdown.p['Global'][loc('resource_Plasmid_name')] = (plasmidBonus('plasmid') * 100) + '%';
        applyPlasmid = true;
    }
    if (global.race.Plasmid.anti > 0  && ((global.race.universe === 'antimatter') || (global.genes['bleed'] && global.genes['bleed'] >= 2 && global.race.universe !== 'antimatter'))){
        breakdown.p['Global'][loc('resource_AntiPlasmid_name')] = (plasmidBonus('antiplasmid') * 100) + '%';
        applyPlasmid = true;
    }
    if (applyPlasmid){
        global_multiplier += plasmidBonus();
    }
    if (global.race['no_plasmid'] || global.race.universe === 'antimatter'){
        if (global.city['temple'] && global.city['temple'].count){
            let temple_bonus = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 0.016 : 0.01;
            if (global.race.universe === 'antimatter'){
                temple_bonus /= 2;
            }
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                temple_bonus += global.civic.professor.workers * (global.race.universe === 'antimatter' ? 0.0002 : 0.0004);
            }
            if (global.race['spiritual']){
                temple_bonus *= 1.13;
            }
            if (global.civic.govern.type === 'theocracy'){
                temple_bonus *= 1.05;
            }
            let faith = global.city.temple.count * temple_bonus;
            breakdown.p['Global'][loc('faith')] = (faith * 100) + '%';
            global_multiplier *= (1 + faith);
        }
    }
    if (global.race['rainbow'] && global.race['rainbow'] > 1){
        breakdown.p['Global'][loc('trait_rainbow_bd')] = '50%';
        global_multiplier *= 1.5;
    }
    if (global.tech['world_control']){
        breakdown.p['Global'][loc('tech_unification')] = '25%';
        global_multiplier *= 1.25;
    }
    if (global.genes['challenge'] && global.genes['challenge'] >= 2){
        if (global.race['weak_mastery']){
            breakdown.p['Global'][loc('mastery')] = (achieve_level * 0.025) + '%';
            global_multiplier *= 1 + (achieve_level * 0.00025);
        }
        else {
            breakdown.p['Global'][loc('mastery')] = (achieve_level * 0.25) + '%';
            global_multiplier *= 1 + (achieve_level * 0.0025);
        }
    }
    if (global.race['suction_grip']){
        breakdown.p['Global'][loc('trait_suction_grip_bd')] = '8%';
        global_multiplier *= 1.08;
    }
    if (global.race['intelligent']){
        let bonus = (global.civic.scientist.workers * 0.25) + (global.civic.professor.workers * 0.125);
        breakdown.p['Global'][loc('trait_intelligent_bd')] = bonus+'%';
        global_multiplier *= 1 + (bonus / 100);
    }
    if (global.race['slaver'] && global.city['slave_pen'] && global.city['slave_pen']){
        let bonus = (global.city.slave_pen.slaves * 0.28);
        breakdown.p['Global'][loc('trait_slaver_bd')] = bonus+'%';
        global_multiplier *= 1 + (bonus / 100);
    }
    if ((global.city.ptrait === 'trashed' || global.race['scavanger']) && global.civic['scavenger'] && global.civic.scavenger.workers > 0){
        let bonus = (global.civic.scavenger.workers * global.civic.scavenger.impact);
        if (global.city.ptrait === 'trashed' && global.race['scavanger']){
            bonus *= 1.25;
        }
        breakdown.p['Global'][loc('job_scavenger')] = bonus+'%';
        global_multiplier *= 1 + (bonus / 100);
    }
    if (global.city.ptrait === 'mellow'){
        breakdown.p['Global'][loc('planet_mellow_bd')] = '-2%';
        global_multiplier *= 0.98;
    }
    if (global.city.ptrait === 'ozone' && global.city['sun']){
        let uv = global.city['sun'] * 0.25;
        breakdown.p['Global'][loc('planet_ozone_bd')] = `-${uv}%`;
        global_multiplier *= 1 - (uv / 100);
    }
    if (global.race['smoldering'] && global.city['hot']){
        let heat = global.city['hot'] * 0.35;
        breakdown.p['Global'][loc('hot')] = `${heat}%`;
        global_multiplier *= 1 + (heat / 100);
    }
    if (global.race['heat_intolerance'] && global.city['hot']){
        let heat = global.city['hot'] * 0.25;
        breakdown.p['Global'][loc('hot')] = `-${heat}%`;
        global_multiplier *= 1 - (heat / 100);
    }
    if (global.race['chilled'] && global.city['cold']){
        let cold = global.city['cold'] * 0.35;
        breakdown.p['Global'][loc('cold')] = `${cold}%`;
        global_multiplier *= 1 + (cold / 100);
    }
    if (global.race['cold_intolerance'] && global.city['cold']){
        let cold = global.city['cold'] * 0.25;
        breakdown.p['Global'][loc('cold')] = `-${cold}%`;
        global_multiplier *= 1 - (cold / 100);
    }
    if (global.civic.govern.type === 'anarchy' && global.resource[global.race.species].amount >= 10){
        let chaos = (global.resource[global.race.species].amount - 9) * 0.25;
        breakdown.p['Global'][loc('govern_anarchy')] = `-${chaos}%`;
        global_multiplier *= 1 - (chaos / 100);
    }
    if (global.civic.govern['protest'] && global.civic.govern.protest > 0){
        breakdown.p['Global'][loc('event_protest')] = `-${30}%`;
        global_multiplier *= 0.7;
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
        Deuterium: {},
        Neutronium: {},
        Adamantite: {},
        Infernite: {},
        Elerium: {},
        Nano_Tube: {},
        Graphene: {},
        Stanene: {},
        Plywood: {},
        Brick: {},
        Wrought_Iron: {},
        Sheet_Metal: {},
        Mythril: {},
        Aerogel: {},
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
            if (global.evolution['bilateral_symmetry'] || global.evolution['poikilohydric'] || global.evolution['spores']){
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
            if (global.stats.achieve['creator'] && global.stats.achieve['creator'].l > 1){
                modRes('RNA', global.resource.RNA.max);
                modRes('DNA', global.resource.RNA.max);
            }
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
        if (global.city.calendar.season === 0 && global.city.calendar.year > 0){ // Spring
            let spring = global.race['chilled'] || global.race['smoldering'] ? 0 : 5;
            morale += spring;
            global.city.morale.season = spring;
        }
        else if (global.city.calendar.season === 1 && global.race['smoldering']){ // Summer
            morale += 5; 
            global.city.morale.season = 5;
        }
        else if (global.city.calendar.season === 3){ // Winter
            if (global.race['chilled']){
                morale += 5; 
                global.city.morale.season = 5;
            }
            else {
                morale -= global.race['leathery'] ? 2 : 5; 
                global.city.morale.season = global.race['leathery'] ? -2 : -5;
            }
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

        if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
            global.city.morale.shrine = global.city.shrine.morale;
            morale += global.city.shrine.morale;
        }

        if (global.civic.govern.type === 'corpocracy'){
            morale -= 15;
        }

        if (global.race['frenzy']){
            if (!global.city.morale['frenzy']){
                global.city.morale['frenzy'] = 0;
            }

            if (global.race.frenzy >= 1){
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
                        weather_morale = global.race['leathery'] ? -2 : -5;
                    }
                }
                else {
                    // Rain
                    weather_morale = global.race['leathery'] ? 0 : -2;
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
        if (!global.race['carnivore'] && !global.race['soul_eater']){
            morale -= global.civic.free;
            global.city.morale.unemployed = -(global.civic.free);
        }
        else {
            stress -= global.civic.free / (global.city.ptrait === 'mellow' ? 5.5 : 5);
            global.city.morale.unemployed = 0;
        }

        if (global.race['optimistic']){
            stress += 10;
        }

        if (global.race['pessimistic']){
            stress -= 2;
        }

        if (global.civic['garrison']){
            stress -= global.civic.garrison.max / 2;
        }

        let money_bd = {};
        breakdown.p.consume.Money[loc('trade')] = 0;

        // trade routes
        if (global.tech['trade']){
            let used_trade = 0;
            Object.keys(global.resource).forEach(function (res){
                if (global.resource[res].trade > 0){
                    used_trade += global.resource[res].trade;
                    let price = tradeBuyPrice(res) * global.resource[res].trade;

                    if (global.resource.Money.amount >= price * time_multiplier){
                        modRes(res,global.resource[res].trade * time_multiplier * tradeRatio[res]);
                        modRes('Money', -(price * time_multiplier));
                        breakdown.p.consume.Money[loc('trade')] -= price;
                        breakdown.p.consume[res][loc('trade')] = global.resource[res].trade * tradeRatio[res];
                    }
                    steelCheck();
                }
                else if (global.resource[res].trade < 0){
                    used_trade -= global.resource[res].trade;
                    let price = tradeSellPrice(res) * global.resource[res].trade;

                    if (global.resource[res].amount >= time_multiplier){
                        modRes(res,global.resource[res].trade * time_multiplier * tradeRatio[res]);
                        modRes('Money', -(price * time_multiplier));
                        breakdown.p.consume.Money[loc('trade')] -= price;
                        breakdown.p.consume[res][loc('trade')] = global.resource[res].trade * tradeRatio[res];
                    }
                    steelCheck();
                }
            });
            global.city.market.trade = used_trade;
        }
        if (breakdown.p.consume.Money[loc('trade')] === 0){
            delete breakdown.p.consume.Money[loc('trade')];
        }

        let power_grid = 0;
        let max_power = 0;

        if (global.interstellar['dyson'] && global.interstellar.dyson.count >= 100){
            let output = powerModifier(175);
            max_power -= output;
            power_grid += output;
            power_generated[loc('tech_dyson_net')] = output;
        }

        if (global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.count >= 100){
            let waves = global.tech['gravity'] && global.tech['gravity'] >= 2 ? 13.5 : 7.5;
            let power = powerModifier(20 + ((global.interstellar.stellar_engine.mass - 8) * waves) + (global.interstellar.stellar_engine.exotic * waves * 10));
            max_power -= power;
            power_grid += power;
            power_generated[loc('tech_stellar_engine')] = power;
        }

        let uranium_bd = {};
        if (global.city['coal_power']){
            let power = global.city.coal_power.on * actions.city.coal_power.powered();
            let consume = global.city.coal_power.on * 0.35;
            while ((consume * time_multiplier) > global.resource.Coal.amount && consume > 0){
                power -= actions.city.coal_power.powered();
                consume -= 0.35;
            }
            breakdown.p.consume.Coal[loc('powerplant')] = -(consume);
            modRes('Coal', -(consume * time_multiplier));

            max_power += power;
            power_grid -= power;
            power_generated[loc('city_coal_power')] = -(power);

            // Uranium
            if (global.tech['uranium'] && global.tech['uranium'] >= 3){
                uranium_bd[loc('city_coal_ash')] = (consume / 65 / global_multiplier);
                modRes('Uranium', (consume * time_multiplier) / 65);
            }
        }

        if (global.city['oil_power']){
            let power = global.city.oil_power.on * actions.city.oil_power.powered();
            let consume = global.city.oil_power.on * 0.65;
            while ((consume * time_multiplier) > global.resource.Oil.amount && consume > 0){
                power -= actions.city.oil_power.powered();
                consume -= 0.65;
            }
            breakdown.p.consume.Oil[loc('powerplant')] = -(consume);
            modRes('Oil', -(consume * time_multiplier));

            max_power += power;
            power_grid -= power;
            power_generated[loc('city_oil_power')] = -(power);
        }

        if (global.city['fission_power']){
            let output = actions.city.fission_power.powered();
            let power = global.city.fission_power.on * output;
            let consume = global.city.fission_power.on * 0.1;
            while (consume * time_multiplier > global.resource.Uranium.amount && consume > 0){
                power -= output;
                consume -= 0.1;
            }
            breakdown.p.consume.Uranium[loc('reactor')] = -(consume);
            modRes('Uranium', -(consume * time_multiplier));

            max_power += power;
            power_grid -= power;
            power_generated[loc('city_fission_power')] = -(power);
        }

        if (global.interstellar['fusion']){
            let output = actions.interstellar.int_alpha.fusion.powered();
            let power = global.interstellar.fusion.on * output;
            let consume = global.interstellar.fusion.on * 1.25;
            while (consume * time_multiplier > global.resource.Deuterium.amount && consume > 0){
                power -= output;
                consume -= 1.25;
            }
            breakdown.p.consume.Deuterium[loc('reactor')] = -(consume);
            modRes('Deuterium', -(consume * time_multiplier));

            max_power += power;
            power_grid -= power;
            power_generated[loc('interstellar_fusion_title')] = -(power);
        }

        if (global.space['geothermal'] && global.space.geothermal.on > 0){
            let output = actions.space.spc_hell.geothermal.powered();
            let increment = fuel_adjust(0.5);
            let power = global.space.geothermal.on * output;
            let consume = (global.space.geothermal.on * increment);
            while (consume * time_multiplier > global.resource['Helium_3'].amount && consume > 0){
                power -= output;
                consume -= increment;
            }
            breakdown.p.consume.Helium_3[loc('space_hell_geothermal_bd')] = -(consume);
            let number = consume * time_multiplier;
            modRes('Helium_3', -(number));

            max_power += power;
            power_grid -= power;
            power_generated[loc('space_hell_geothermal_title')] = -(power);
        }

        if (global.space['e_reactor'] && global.space.e_reactor.on > 0){
            let output = actions.space.spc_dwarf.e_reactor.powered();
            let increment = 0.05;
            let power = global.space.e_reactor.on * output;
            let consume = (global.space.e_reactor.on * increment);
            while (consume * time_multiplier > global.resource['Elerium'].amount && consume > 0){
                power += output;
                consume -= increment;
            }
            breakdown.p.consume.Elerium[loc('reactor')] = -(consume);
            let number = consume * time_multiplier;
            modRes('Elerium', -(number));

            max_power += power;
            power_grid -= power;
            power_generated[loc('space_dwarf_reactor_title')] = -(power);
        }

        if (global.space['swarm_satellite'] && global.space['swarm_control']){
            let active = global.space.swarm_satellite.count;
            if (active > global.space.swarm_control.s_max){
                active = global.space.swarm_control.s_max;
            }
            global.space.swarm_control.support = active;
            let solar = global.tech.swarm >= 4 ? (global.tech.swarm >= 5 ? 0.65 : 0.5) : 0.35;
            let output = powerModifier(active * solar);
            max_power -= output;
            power_grid += output;
            power_generated[loc('space_sun_swarm_satellite_title')] = output;
        }

        if (global.city['mill'] && global.tech['agriculture'] && global.tech['agriculture'] >= 6){
            let power = powerModifier(global.city.mill.on * actions.city.mill.powered());
            max_power += power;
            power_grid -= power;
            power_generated[loc('city_mill_title2')] = -(power);
        }

        if (global.city['windmill'] && global.tech['wind_plant'] && (global.race['soul_eater'] || global.race['carnivore'])){
            let power = powerModifier(global.city.windmill.count);
            max_power -= power;
            power_grid += power;
            power_generated[loc('city_mill_title2')] = power;
        }

        // Power usage
        let p_structs = ['city:apartment','int_alpha:habitat','spc_red:spaceport','int_alpha:starport','int_neutron:citadel','city:coal_mine','spc_moon:moon_base','spc_red:red_tower','spc_home:nav_beacon','int_proxima:xfer_station','int_nebula:nexus','spc_dwarf:elerium_contain','spc_gas:gas_mining','spc_belt:space_station','spc_gas_moon:outpost','spc_gas_moon:oil_extractor','city:factory','spc_red:red_factory','spc_dwarf:world_controller','prtl_fortress:turret','prtl_badlands:war_drone','city:wardenclyffe','city:biolab','city:mine','city:rock_quarry','city:cement_plant','city:sawmill','city:mass_driver','int_neutron:neutron_miner','prtl_fortress:war_droid','int_blackhole:far_reach','prtl_badlands:sensor_drone','prtl_badlands:attractor','city:metal_refinery','int_blackhole:mass_ejector','city:casino'];
        for (var i = 0; i < p_structs.length; i++){
            let parts = p_structs[i].split(":");
            let space = parts[0].substr(0,4) === 'spc_' ? 'space' : (parts[0].substr(0,5) === 'prtl_' ? 'portal' : 'interstellar');
            let region = parts[0] === 'city' ? parts[0] : space;
            let c_action = parts[0] === 'city' ? actions.city : actions[space][parts[0]];
            if (global[region][parts[1]] && global[region][parts[1]]['on']){
                let watts = c_action[parts[1]].powered();
                let power = global[region][parts[1]].on * watts;
                
                p_on[parts[1]] = global[region][parts[1]].on;
                while (power > power_grid && power > 0){
                    power -= c_action[parts[1]].powered();
                    p_on[parts[1]]--;
                }
                power_grid -= global[region][parts[1]].on * watts;
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
            breakdown.p.consume.Oil[loc('space_moon_base_title')] = -(mb_consume);
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
            breakdown.p.consume.Oil[loc('tech_space_marines_bd')] = -(sm_consume);
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
            breakdown.p.consume.Helium_3[loc('space_red_factory_title')] = -(h_consume);
        }

        // spaceports
        if (global.space['spaceport'] && global.space['spaceport'].count > 0){
            let fuel_cost = +fuel_adjust(1.25);
            let mb_consume = p_on['spaceport'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('space_red_spaceport_title')] = -(mb_consume);
            for (let i=0; i<p_on['spaceport']; i++){
                if (!modRes('Helium_3', -(time_multiplier * fuel_cost))){
                    mb_consume -= (p_on['spaceport'] * fuel_cost) - (i * fuel_cost);
                    p_on['spaceport'] -= i;
                    break;
                }
            }
            global.space.spaceport.s_max = p_on['spaceport'] * actions.space.spc_red.spaceport.support;
            global.space.spaceport.s_max += global.tech['mars'] && global.tech['mars'] >= 3 ? p_on['red_tower'] : 0;
            global.space.spaceport.s_max += global.tech['luna'] && global.tech['luna'] >= 3 ? p_on['nav_beacon'] : 0;
        }

        if (global.space['spaceport']){
            let used_support = 0;
            let red_structs = ['living_quarters','exotic_lab','red_mine','fabrication','biodome','vr_center'];
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

        // starports
        if (global.interstellar['starport'] && global.interstellar['starport'].count > 0){
            let fuel_cost = +int_fuel_adjust(5);
            let mb_consume = p_on['starport'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('interstellar_alpha_starport_title')] = -(mb_consume);
            for (let i=0; i<p_on['starport']; i++){
                if (!modRes('Helium_3', -(time_multiplier * fuel_cost))){
                    mb_consume -= (p_on['starport'] * fuel_cost) - (i * fuel_cost);
                    p_on['starport'] -= i;
                    break;
                }
            }
            global.interstellar.starport.s_max = p_on['starport'] * actions.interstellar.int_alpha.starport.support;
            global.interstellar.starport.s_max += p_on['habitat'] * actions.interstellar.int_alpha.habitat.support;
            global.interstellar.starport.s_max += p_on['xfer_station'] * actions.interstellar.int_proxima.xfer_station.support;
        }

        // Droids
        let miner_droids = {
            adam: 0,
            uran: 0,
            coal: 0,
            alum: 0,
        };

        if (global.interstellar['starport']){
            let used_support = 0;
            let structs = ['fusion','mining_droid','processing','laboratory','g_factory','exchange'];
            for (var i = 0; i < structs.length; i++){
                if (global.interstellar[structs[i]]){
                    let operating = global.interstellar[structs[i]].on;
                    let id = actions.interstellar.int_alpha[structs[i]].id;
                    if (used_support + operating > global.interstellar.starport.s_max){
                        operating -=  (used_support + operating) - global.interstellar.starport.s_max;
                        $(`#${id} .on`).addClass('warn');
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                    }
                    used_support += operating;
                    int_on[structs[i]] = operating;
                }
                else {
                    int_on[structs[i]] = 0;
                }
            }
            global.interstellar.starport.support = used_support;

            if (int_on['mining_droid'] > 0){
                let max = int_on['mining_droid'];
                let segments = ['adam','uran','coal','alum'];
                for (let i=0; i<segments.length; i++){
                    if (global.interstellar.mining_droid[segments[i]] <= max){
                        miner_droids[segments[i]] = global.interstellar.mining_droid[segments[i]];
                        max -= miner_droids[segments[i]];
                    }
                    else {
                        miner_droids[segments[i]] = max;
                        max = 0;
                    }
                }
            }
        }

        // Space Station
        if (global.space['space_station'] && global.space['space_station'].count > 0){
            let fuel_cost = +fuel_adjust(2.5);
            let ss_consume = p_on['space_station'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('space_belt_station_title')] = -(ss_consume);
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
                        operating -= used_support + (operating * -(actions.space.spc_belt[belt_structs[i]].support)) - global.space.space_station.s_max;
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

        if (global.interstellar['nexus'] && global.interstellar['nexus'].count > 0){
            let cash_cost = 350;
            let mb_consume = p_on['nexus'] * cash_cost;
            breakdown.p.consume.Money[loc('interstellar_nexus_bd')] = -(mb_consume);
            for (let i=0; i<p_on['nexus']; i++){
                if (!modRes('Money', -(time_multiplier * cash_cost))){
                    mb_consume -= (p_on['nexus'] * cash_cost) - (i * cash_cost);
                    p_on['nexus'] -= i;
                    break;
                }
            }
            global.interstellar.nexus.s_max = p_on['nexus'] * actions.interstellar.int_nebula.nexus.support;
        }

        if (global.interstellar['nexus']){
            let used_support = 0;
            let structs = ['harvester','elerium_prospector'];
            for (var i = 0; i < structs.length; i++){
                if (global.interstellar[structs[i]]){
                    let operating = global.interstellar[structs[i]].on;
                    let id = actions.interstellar.int_nebula[structs[i]].id;
                    if (used_support + operating > global.interstellar.nexus.s_max){
                        operating -=  (used_support + operating) - global.interstellar.nexus.s_max;
                        $(`#${id} .on`).addClass('warn');
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                    }
                    used_support += operating;
                    int_on[structs[i]] = operating;
                }
                else {
                    int_on[structs[i]] = 0;
                }
            }
            global.interstellar.nexus.support = used_support;
        }

        // Transfer Station
        if (global.interstellar['xfer_station'] && p_on['xfer_station']){
            let fuel_cost = 0.28;
            let xfer_consume = p_on['xfer_station'] * fuel_cost;
            breakdown.p.consume.Uranium[loc('interstellar_xfer_station_title')] = -(xfer_consume);
            for (let i=0; i<p_on['xfer_station']; i++){
                if (!modRes('Uranium', -(time_multiplier * fuel_cost))){
                    xfer_consume -= (p_on['xfer_station'] * fuel_cost) - (i * fuel_cost);
                    p_on['xfer_station'] -= i;
                    break;
                }
            }
        }

        // Outpost
        if (p_on['outpost'] && p_on['outpost'] > 0){
            let fuel_cost = +fuel_adjust(2);
            let out_consume = p_on['outpost'] * fuel_cost;
            breakdown.p.consume.Oil[loc('space_gas_moon_outpost_bd')] = -(out_consume);
            for (let i=0; i<p_on['outpost']; i++){
                if (!modRes('Oil', -(time_multiplier * fuel_cost))){
                    out_consume -= (p_on['outpost'] * fuel_cost) - (i * fuel_cost);
                    p_on['outpost'] -= i;
                    break;
                }
            }
        }

        // Neutron Miner
        if (p_on['neutron_miner'] && p_on['neutron_miner'] > 0){
            let fuel_cost = +int_fuel_adjust(3);
            let out_consume = p_on['neutron_miner'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('interstellar_neutron_miner_title')] = -(out_consume);
            for (let i=0; i<p_on['neutron_miner']; i++){
                if (!modRes('Helium_3', -(time_multiplier * fuel_cost))){
                    out_consume -= (p_on['neutron_miner'] * fuel_cost) - (i * fuel_cost);
                    p_on['neutron_miner'] -= i;
                    break;
                }
            }
        }

        // Patrol Cruiser
        if (global.interstellar['cruiser']){
            let fuel_cost = +int_fuel_adjust(6);
            let active = global.interstellar['cruiser'].on;
            let out_consume = active * fuel_cost;
            breakdown.p.consume.Helium_3[loc('interstellar_cruiser_title')] = -(out_consume);
            for (let i=0; i<global.interstellar['cruiser'].on; i++){
                if (!modRes('Helium_3', -(time_multiplier * fuel_cost))){
                    out_consume -= (global.interstellar['cruiser'].on * fuel_cost) - (i * fuel_cost);
                    active -= i;
                    break;
                }
            }
            int_on['cruiser'] = active;
        }

        // Detect labor anomalies
        let total = 0;
        Object.keys(job_desc).forEach(function (job) {
            if (global.civic[job]){
                total += global.civic[job].workers;
                if (total > global.resource[global.race.species].amount){
                    global.civic[job].workers -= total - global.resource[global.race.species].amount;
                }

                let stress_level = global.civic[job].stress;
                if (global.city.ptrait === 'mellow'){
                    stress_level += 1;
                }
                if (global.race['content']){
                    let effectiveness = job === 'hell_surveyor' ? 0.2 : 0.4;
                    stress_level += global.race['content'] * effectiveness;
                }

                stress -= global.civic[job].workers / stress_level
            }
        });
        global.civic.free = global.resource[global.race.species].amount - total;

        Object.keys(job_desc).forEach(function (job){
            if (job !== 'craftsman' && global.civic[job] && global.civic[job].workers < global.civic[job].assigned && global.civic.free > 0 && global.civic[job].workers < global.civic[job].max){
                global.civic[job].workers++;
                global.civic.free--;
            }
        });

        if (global.civic.new > 0 && !global.race['carnivore'] && !global.race['soul_eater'] && global.civic.farmer.display){
            global.civic.farmer.workers += global.civic.new;
            global.civic.free -= global.civic.new;
        }
        global.civic.new = 0;
        
        let entertainment = 0;
        if (global.tech['theatre']){
            entertainment += global.civic.entertainer.workers * global.tech.theatre;
            if (global.race['musical']){
                entertainment += global.civic.entertainer.workers;
            }
        }
        if (global.tech['broadcast']){
            entertainment += global.city.wardenclyffe.on * global.tech.broadcast;
        }
        if (red_on['vr_center']){
            entertainment += red_on['vr_center'];
        }
        if (global.civic.govern.type === 'democracy'){
            entertainment *= 1.2;
        }
        global.city.morale.entertain = entertainment;
        morale += entertainment;
        if (global.civic.govern.type === 'anarchy'){
            stress /= 2;
        }
        if (global.civic.govern.type === 'autocracy'){
            stress *= 1.25;
        }
        if (global.civic.govern.type === 'socialist'){
            stress *= 1.1;
        }
        stress = +(stress).toFixed(1);
        global.city.morale.stress = stress;
        morale += stress;

        global.city.morale.tax = 20 - global.civic.taxes.tax_rate;
        morale -= global.civic.taxes.tax_rate - 20;
        if (global.civic.taxes.tax_rate > 40){
            let high_tax = global.civic.taxes.tax_rate - 40;
            global.city.morale.tax -= high_tax * 0.5;
            morale -= high_tax * 0.5;
        }

        if (!global.race['frenzy'] && global.civic.garrison.protest + global.civic.garrison.fatigue > 2){
            let warmonger = Math.round(Math.log2(global.civic.garrison.protest + global.civic.garrison.fatigue));
            global.city.morale.warmonger = global.race['immoral'] ? warmonger : -(warmonger);
            morale += global.city.morale.warmonger;
        }
        else {
            global.city.morale.warmonger = 0;
        }

        let mBaseCap = global.city['amphitheatre'] ? 100 + global.city['amphitheatre'].count : 100;
        mBaseCap += global.city['casino'] ? global.city['casino'].count : 0;
        if (red_on['vr_center']){
            mBaseCap += red_on['vr_center'] * 2;
        }
        if (global.tech['superstar']){
            mBaseCap += global.civic.entertainer.workers;
        }
        moraleCap = global.tech['monuments'] ? mBaseCap + (global.tech['monuments'] * 2) : mBaseCap;

        if (global.civic.taxes.tax_rate < 20){
            moraleCap += 10 - Math.floor(global.civic.taxes.tax_rate / 2);
        }

        let m_min = global.race['optimistic'] ? 60 : 50;
        if (global.civic.govern.fr > 0){
            let rev = morale / 2;
            global.city.morale.rev = rev;
            morale -= rev;
            m_min -= 10;
        }
        else {
            global.city.morale.rev = 0;
        }
        if (morale < m_min){
            morale = m_min;
        }
        else if (morale > moraleCap){
            morale = moraleCap;
        }

        global.city.morale.current = morale;

        if (global.city.morale.current < 100){
            if (global.race['blissful']){
                global_multiplier *= 1 + ((global.city.morale.current - 100) / 200);
                breakdown.p['Global'][loc('morale')] = ((global.city.morale.current - 100) / 2) + '%';
            }
            else {
                global_multiplier *= global.city.morale.current / 100;
                breakdown.p['Global'][loc('morale')] = (global.city.morale.current - 100) + '%';
            }
        }
        else {
            global_multiplier *= 1 + ((global.city.morale.current - 100) / 200);
            breakdown.p['Global'][loc('morale')] = ((global.city.morale.current - 100) / 2) + '%';
        }

        if (global.race['lazy'] && global.city.calendar.temp === 2){
            breakdown.p['Global'][loc('trait_lazy_bd')] = '-10%';
            global_multiplier *= 0.9;
        }

        if (global.race['selenophobia']){
            let moon = global.city.calendar.moon > 14 ? 28 - global.city.calendar.moon : global.city.calendar.moon;
            breakdown.p['Global'][loc('moon_phase')] = (-(moon) + 4) + '%';
            moon = 1.04 - (moon / 100);
            global_multiplier *= moon;
        }

        if (global.interstellar['mass_ejector']){
            let total = 0;
            let mass = 0;
            let exotic = 0;
            Object.keys(global.interstellar.mass_ejector).forEach(function (res){
                if (atomic_mass[res]){
                    let ejected = global.interstellar.mass_ejector[res];
                    if (total + ejected > p_on['mass_ejector'] * 1000){
                        ejected = p_on['mass_ejector'] * 1000 - total;
                    }
                    total += ejected;

                    let volume = ejected;
                    if (volume > 0){
                        breakdown.p.consume[res][loc('interstellar_blackhole_name')] = -(volume);
                    }

                    if (volume * time_multiplier > global.resource[res].amount){
                        volume = global.resource[res].amount / time_multiplier;
                    }

                    modRes(res, -(time_multiplier * volume));
                    mass += volume * atomic_mass[res];
                    if (res === 'Elerium' || res === 'Infernite'){
                        exotic += volume * atomic_mass[res];
                    }
                }
            });
            global.interstellar.mass_ejector.mass = mass;
            global.interstellar.mass_ejector.total = total;

            global.interstellar.stellar_engine.mass += mass / 10000000000 * time_multiplier;
            global.interstellar.stellar_engine.exotic += exotic / 10000000000 * time_multiplier;
        }

        // Consumption
        fed = true;
        if (global.resource[global.race.species].amount >= 1 || global.city['farm'] || global.city['tourist_center']){
            let food_bd = {};
            let food_base = 0;
            if (global.race['carnivore'] || global.race['soul_eater']){
                let strength = global.tech['military'] ? (global.tech.military >= 5 ? global.tech.military - 1 : global.tech.military) : 1;
                food_base = global.civic.free * strength * (global.race['carnivore'] ? 2 : 0.5);
                food_bd[loc('job_hunter')] = food_base + 'v';

                if (global.city['soul_well']){
                    let souls = global.city['soul_well'].count * 2;
                    food_bd[loc('city_soul_well')] = souls + 'v';
                    food_base += souls;
                }
            }
            else {
                let farmers_base = global.civic.farmer.workers * global.civic.farmer.impact;
                farmers_base *= (global.tech['hoe'] && global.tech['hoe'] > 0 ? global.tech['hoe'] * (1/3) : 0) + 1;
                farmers_base *= global.city.biome === 'grassland' ? 1.1 : 1;
                farmers_base *= global.city.biome === 'hellscape' ? 0.25 : 1;
                farmers_base *= global.city.ptrait === 'trashed' ? 0.75 : 1;
                farmers_base *= racialTrait(global.civic.farmer.workers,'farmer');
                farmers_base *= global.tech['agriculture'] >= 7 ? 1.1 : 1;
                farmers_base *= global.race['low_light'] ? 0.9 : 1;

                let weather_multiplier = 1;
                if (!global.race['submerged']){
                    if (global.city.calendar.temp === 0){
                        if (global.city.calendar.weather === 0){
                            weather_multiplier *= global.race['chilled'] ? 1.2 : 0.7;
                        }
                        else {
                            weather_multiplier *= global.race['chilled'] ? 1.1 : 0.85;
                        }
                    }
                    if (global.city.calendar.weather === 2){
                        weather_multiplier *= global.race['chilled'] ? 0.85 : 1.1;
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
                    farm *= global.city.biome === 'hellscape' ? 0.25 : 1;
                    farm *= global.city.ptrait === 'trashed' ? 0.75 : 1;
                    farm *= global.tech['agriculture'] >= 7 ? 1.1 : 1;
                    farm *= global.race['low_light'] ? 0.9 : 1;
                }

                food_bd[loc('city_farm')] = (farm) + 'v';
                food_bd[loc('job_farmer')] = (farmers_base) + 'v';

                food_base = ((farm + farmers_base) * weather_multiplier * mill_multiplier);
                
                food_bd[loc('morale_weather')] = ((weather_multiplier - 1) * 100) + '%';
                food_bd[loc('city_mill_title1')] = ((mill_multiplier - 1) * 100) + '%';
            }

            let hunting = 0;
            if (global.tech['military']){
                hunting = global.race['herbivore'] ? 0 : armyRating(garrisonSize(),'hunting') / 3;
            }

            let biodome = 0;
            if (global.tech['mars']){
                biodome = red_on['biodome'] * 2 * global.civic.colonist.workers * zigguratBonus();
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

            let consume = (global.resource[global.race.species].amount + soldiers - (global.civic.free * 0.5));
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
            if (global.race['ravenous']){
                consume *= 1.2;
                consume += (global.resource.Food.amount / 3);
            }
            breakdown.p.consume.Food[races[global.race.species].name] = -(consume);

            let tourism = 0;
            if (global.city['tourist_center']){
                tourism = global.city['tourist_center'].on * 50;
                breakdown.p.consume.Food[loc('tech_tourism')] = -(tourism);
            }

            let spaceport = 0;
            if (global.space['spaceport']){
                spaceport = p_on['spaceport'] * 25;
                breakdown.p.consume.Food[loc('space_red_spaceport_title')] = -(spaceport);
            }

            let starport = 0;
            if (global.interstellar['starport']){
                starport = p_on['starport'] * 100;
                breakdown.p.consume.Food[loc('interstellar_alpha_starport_title')] = -(starport);
            }

            let space_station = 0;
            if (global.space['space_station']){
                space_station = p_on['space_station'] * 10;
                breakdown.p.consume.Food[loc('space_belt_station_title')] = -(space_station);
            }

            let space_marines = 0;
            if (global.space['space_barracks']){
                space_marines = global.space.space_barracks.on * 10;
                breakdown.p.consume.Food[loc('tech_space_marines_bd')] = -(space_marines);
            }

            let delta = generated - consume - tourism - spaceport - starport - space_station - space_marines;

            food_bd[loc('space_red_biodome_title')] = biodome + 'v';
            food_bd[loc('soldiers')] = hunting + 'v';
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
                        global['resource'][global.race.species].amount--;
                        global.stats.starved++;
                    }
                }
            }
        }

        // Fortress Repair
        if (global.portal['fortress'] && global.portal.fortress.walls < 100){
            if (modRes('Stone', -(200 * time_multiplier))){
                global.portal.fortress.repair++;
                breakdown.p.consume.Stone[loc('portal_fortress_name')] = -200;
            }
            if (global.portal.fortress.repair >= 200){
                global.portal.fortress.repair = 0;
                global.portal.fortress.walls++;
            }
        }

        // Citizen Growth
        if (fed && global['resource']['Food'].amount > 0 && global['resource'][global.race.species].max > global['resource'][global.race.species].amount){
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
                let base = global.city.ptrait === 'toxic' ? global['resource'][global.race.species].amount * 1.25 : global['resource'][global.race.species].amount;
                if(Math.rand(0, base * (3 - (2 ** time_multiplier))) <= lowerBound){
                    global['resource'][global.race.species].amount++;
                    if (global.civic['hell_surveyor'].workers + global.civic.free >= global.civic['hell_surveyor'].assigned){
                        global.civic.new++;
                    }
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

            if (global.race['evil']){
                let weapons = global.tech['military'] ? (global.tech.military >= 5 ? global.tech.military - 1 : global.tech.military) : 1;
                let hunters = global.civic.free * weapons / 20;
                fur_bd[loc('job_hunter')] = hunters  + 'v';
                modRes('Furs', hunters * hunger * global_multiplier * time_multiplier);

                if (!global.race['soul_eater']){
                    let reclaimers = global.civic.lumberjack.workers;
                    reclaimers *= racialTrait(global.civic.lumberjack.workers,'lumberjack') / 4;
                    fur_bd[loc('job_reclaimer')] = reclaimers  + 'v';
                    modRes('Furs', reclaimers * hunger * global_multiplier * time_multiplier);
                }
            }

            let hunting = armyRating(garrisonSize(),'hunting') / 10;
            fur_bd[loc('soldiers')] = hunting  + 'v';
            fur_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';

            let delta = hunting;
            delta *= hunger * global_multiplier;

            breakdown.p['Furs'] = fur_bd;

            modRes('Furs', delta * time_multiplier);
        }

        // Knowledge
        { //block scope
            let sundial_base = global.tech['primitive'] && global.tech['primitive'] >= 3 ? 1 : 0;
            if (global.race['ancient_ruins']){
                sundial_base++;
            }
            if (global.stats.achieve['extinct_junker']){
                sundial_base++;
            }
            if (global.city.ptrait === 'magnetic'){
                sundial_base++;
            }

            let professors_base = global.civic.professor.workers;
            professors_base *= global.race['studious'] ? global.civic.professor.impact + 0.25 : global.civic.professor.impact;
            professors_base *= global.race['pompous'] ? 0.25 : 1;
            professors_base *= racialTrait(global.civic.professor.workers,'science');
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 3){
                professors_base *= 1 + (global.city.temple.count * 0.05);
            }
            if (global.civic.govern.type === 'theocracy'){
                professors_base *= 0.75;
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
            if (global.civic.govern.type === 'theocracy'){
                scientist_base *= 0.5;
            }
            
            let library_mult = global.city['library'] ? 1 + (global.city.library.count * 0.05) : 1;

            let gene_consume = 0;
            if (global.arpa['sequence'] && global.arpa.sequence.on && global.arpa.sequence.time > 0){
                let gene_cost = 50 + (global.race.mutation * 10);
                if (global.arpa.sequence.boost){
                    gene_cost *= 4;
                }
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
            know_bd[loc('job_professor')] = professors_base + 'v';
            know_bd[loc('job_scientist')] = scientist_base + 'v';
            know_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
            know_bd[loc('tech_sundial')] = sundial_base + 'v';
            if (global.race['inspired']){
                know_bd[loc('event_inspiration_bd')] = '100%';
                delta *= 2;
            }
            if (global.city['library']){
                know_bd[loc('city_library')] = ((library_mult - 1) * 100) + '%';
            }
            breakdown.p['Knowledge'] = know_bd;

            if (gene_consume > 0) {
                delta -= gene_consume;
                breakdown.p.consume.Knowledge[loc('genome_bd')] = -(gene_consume);
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

                breakdown.p.consume.Furs[loc('city_factory')] = -(fur_cost);
                modRes('Furs', -(fur_cost * time_multiplier));
                
                let demand = global.resource[global.race.species].amount * (assembly ? f_rate.Lux.demand[global.tech['factory']] : f_rate.Lux.demand[0]);
                let delta = workDone * demand;
                if (global.race['toxic']){
                    delta *= 1.20;
                }
                if (global.civic.govern.type === 'corpocracy'){
                    delta *= 1.5;
                }
                if (global.civic.govern.type === 'socialist'){
                    delta *= 0.8;
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

                breakdown.p.consume.Copper[loc('city_factory')] = -(copper_cost);
                breakdown.p.consume.Aluminium[loc('city_factory')] = -(aluminium_cost);
                modRes('Copper', -(copper_cost * time_multiplier));
                modRes('Aluminium', -(aluminium_cost * time_multiplier));

                let factory_output = workDone * (assembly ? f_rate.Alloy.output[global.tech['factory']] : f_rate.Alloy.output[0]);
                if (global.race['toxic']){
                    factory_output *= 1.20;
                }
                if (global.tech['alloy']){
                    factory_output *= 1.37;
                }
                if (global.race['metallurgist']){
                    factory_output *= 1 + (global.race['metallurgist'] * 0.04);
                }
                if (global.civic.govern.type === 'corpocracy'){
                    factory_output *= 1.15;
                }
                if (global.civic.govern.type === 'socialist'){
                    factory_output *= 1.05;
                }

                let delta = factory_output;
                delta *= hunger * global_multiplier;

                let alloy_bd = {};
                alloy_bd[loc('city_factory')] = factory_output + 'v';
                if (global.tech['q_factory']){
                    let q_bonus = (quantum_level - 1) / 2 + 1;
                    delta *= q_bonus;
                    alloy_bd[loc('quantum')] = ((q_bonus - 1) * 100) + '%';
                }
                alloy_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
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

                breakdown.p.consume.Lumber[loc('city_factory')] = -(lumber_cost);
                breakdown.p.consume.Oil[loc('city_factory')] = -(oil_cost);
                modRes('Lumber', -(lumber_cost * time_multiplier));
                modRes('Oil', -(oil_cost * time_multiplier));

                let factory_output = workDone * (assembly ? f_rate.Polymer.output[global.tech['factory']] : f_rate.Polymer.output[0]);
                if (global.race['toxic']) {
                    factory_output *= 1.20;
                }
                if (global.tech['polymer'] >= 2){
                    factory_output *= 1.42;
                }
                if (global.civic.govern.type === 'corpocracy'){
                    factory_output *= 1.15;
                }
                if (global.civic.govern.type === 'socialist'){
                    factory_output *= 1.05;
                }

                let delta = factory_output;
                delta *= hunger * global_multiplier;

                let polymer_bd = {};
                polymer_bd[loc('city_factory')] = factory_output + 'v';
                if (global.tech['q_factory']){
                    let q_bonus = (quantum_level - 1) / 2 + 1;
                    delta *= q_bonus;
                    polymer_bd[loc('quantum')] = ((q_bonus - 1) * 100) + '%';
                }
                polymer_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
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

                breakdown.p.consume.Coal[loc('city_factory')] = -(coal_cost);
                breakdown.p.consume.Neutronium[loc('city_factory')] = -(neutronium_cost);
                modRes('Neutronium', -(neutronium_cost * time_multiplier));
                modRes('Coal', -(coal_cost * time_multiplier));

                let factory_output = workDone * (assembly ? f_rate.Nano_Tube.output[global.tech['factory']] : f_rate.Nano_Tube.output[0]);
                if (global.race['toxic']) {
                    factory_output *= 1.08;
                }
                if (global.tech['polymer'] >= 2){
                    factory_output *= 1.42;
                }
                if (global.civic.govern.type === 'corpocracy'){
                    factory_output *= 1.15;
                }
                if (global.civic.govern.type === 'socialist'){
                    factory_output *= 1.05;
                }

                let delta = factory_output;
                delta *= hunger * global_multiplier;

                let nano_bd = {};
                nano_bd[loc('city_factory')] = factory_output + 'v';
                if (global.tech['q_factory']){
                    let q_bonus = (quantum_level - 1) / 2 + 1;
                    delta *= q_bonus;
                    nano_bd[loc('quantum')] = ((q_bonus - 1) * 100) + '%';
                }
                nano_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Nano_Tube'] = nano_bd;
                modRes('Nano_Tube', delta * time_multiplier);
            }

            if (global.city.factory['Stanene'] && global.city.factory['Stanene'] > 0){
                operating += global.city.factory.Stanene;
                while (operating > on_factories && operating > 0){
                    operating--;
                    global.city.factory.Stanene--;
                }

                let alumIncrement = (assembly ? f_rate.Stanene.aluminium[global.tech['factory']] : f_rate.Stanene.aluminium[0]);
                let nanoIncrement = (assembly ? f_rate.Stanene.nano[global.tech['factory']] : f_rate.Stanene.nano[0]);
                let alum_cost = global.city.factory.Stanene * alumIncrement;
                let nano_cost = global.city.factory.Stanene * nanoIncrement;
                let workDone = global.city.factory.Stanene;
                
                while (alum_cost * time_multiplier > global.resource.Aluminium.amount && alum_cost > 0){
                    nano_cost -= nanoIncrement;
                    alum_cost -= alumIncrement;
                    workDone--;
                }
                while (nano_cost * time_multiplier > global.resource.Nano_Tube.amount && nano_cost > 0){
                    nano_cost -= nanoIncrement;
                    alum_cost -= alumIncrement;
                    workDone--;
                }

                breakdown.p.consume.Aluminium[loc('city_factory')] = breakdown.p.consume.Aluminium[loc('city_factory')] ? breakdown.p.consume.Aluminium[loc('city_factory')] - alum_cost : -(alum_cost);
                breakdown.p.consume.Nano_Tube[loc('city_factory')] = -(nano_cost);
                modRes('Aluminium', -(alum_cost * time_multiplier));
                modRes('Nano_Tube', -(nano_cost * time_multiplier));

                let factory_output = workDone * (assembly ? f_rate.Stanene.output[global.tech['factory']] : f_rate.Stanene.output[0]);
                if (global.civic.govern.type === 'corpocracy'){
                    factory_output *= 1.15;
                }
                if (global.civic.govern.type === 'socialist'){
                    factory_output *= 1.05;
                }

                let delta = factory_output;
                delta *= hunger * global_multiplier;

                let stanene_bd = {};
                stanene_bd[loc('city_factory')] = factory_output + 'v';
                if (global.tech['q_factory']){
                    let q_bonus = (quantum_level - 1) / 2 + 1;
                    delta *= q_bonus;
                    stanene_bd[loc('quantum')] = ((q_bonus - 1) * 100) + '%';
                }
                stanene_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Stanene'] = stanene_bd;
                modRes('Stanene', delta * time_multiplier);
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

            breakdown.p.consume.Stone[loc('city_cement_plant_bd')] = -(stone_cost);
            modRes('Stone', -(stone_cost * time_multiplier));

            let cement_base = global.tech['cement'] >= 4 ? 1.2 : 1;
            cement_base *= global.civic.cement_worker.impact;
            cement_base *= racialTrait(global.civic.cement_worker.workers,'factory');

            let factory_output = workDone * cement_base;
            if (global.race['toxic']){
                factory_output *= 1.08;
            }
            if (global.civic.govern.type === 'socialist'){
                factory_output *= 1.05;
            }

            let powered_mult = 1;
            if (global.city.powered && p_on['cement_plant']){
                let rate = global.tech['cement'] >= 6 ? 0.08 : 0.05;
                powered_mult += (p_on['cement_plant'] * rate);
            }

            let ai_core = 1;
            if (global.tech['ai_core'] && p_on['citadel'] > 0){
                let ai = +(quantum_level / 1.75).toFixed(1) / 100;
                ai_core += (p_on['citadel'] * ai);
            }
            
            let delta = factory_output * powered_mult * ai_core;
            delta *= hunger * global_multiplier;

            let cement_bd = {};
            cement_bd[loc('city_cement_plant_bd')] = factory_output + 'v';
            cement_bd[loc('power')] = ((powered_mult - 1) * 100) + '%';
            if (global.tech['ai_core'] && p_on['citadel'] > 0){
                cement_bd[loc('interstellar_citadel_effect_bd')] = ((ai_core - 1) * 100) + '%';
            }
            cement_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
            breakdown.p['Cement'] = cement_bd;
            modRes('Cement', delta * time_multiplier);
        }
        
        // Smelters
        let iron_smelter = 0;
        let titanium_bd = {};
        if (global.city['smelter'] && global.city['smelter'].count > 0){
            if (global.race['kindling_kindred'] && !global.race['evil']){
                global.city['smelter'].Wood = 0;
            }
            let coal_fuel = global.race['kindling_kindred'] ? 0.15 : 0.25;

            if (global.city['smelter'].Iron + global.city['smelter'].Steel > global.city['smelter'].Wood + global.city['smelter'].Coal + global.city['smelter'].Oil){
                let fueled = global.city['smelter'].Wood + global.city['smelter'].Coal + global.city['smelter'].Oil;
                let overflow = global.city['smelter'].Iron + global.city['smelter'].Steel - fueled;
                global.city['smelter'].Iron -= overflow;
                if (global.city['smelter'].Iron < 0){
                    overflow = global.city['smelter'].Iron;
                    global.city['smelter'].Iron = 0;
                    global.city['smelter'].Steel += overflow;
                    if (global.city['smelter'].Steel < 0){
                        global.city['smelter'].Steel = 0;
                    }
                }
            }

            let consume_wood = global.race['forge'] ? 0 : global.city['smelter'].Wood * (global.race['evil'] && !global.race['soul_eater'] ? 1 : 3);
            let consume_coal = global.race['forge'] ? 0 : global.city['smelter'].Coal * coal_fuel;
            let consume_oil = global.race['forge'] ? 0 : global.city['smelter'].Oil * 0.35;
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
            let l_type = global.race['soul_eater'] ? 'Food' : (global.race['evil'] ? 'Furs' : 'Lumber');
            while (consume_wood * time_multiplier > global.resource[l_type].amount && consume_wood > 0){
                consume_wood -= (global.race['evil'] && !global.race['soul_eater'] ? 1 : 3);
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

            iron_smelter *= global.tech['smelting'] >= 3 ? (global.tech['smelting'] >= 7 ? 1.5 : 1.2) : 1;

            if (global.race['pyrophobia']){
                iron_smelter *= 0.9;
            }

            if (oil_bonus > 0){
                iron_smelter *= 1 + (oil_bonus / 200);
            }

            if (global.race['evil']){
                if (global.race['soul_eater']){
                    breakdown.p.consume.Food[loc('city_smelter')] = -(consume_wood);
                }
                else {
                    breakdown.p.consume.Furs[loc('city_smelter')] = -(consume_wood);
                }
            }
            else {
                breakdown.p.consume.Lumber[loc('city_smelter')] = -(consume_wood);
            }
            breakdown.p.consume.Coal[loc('city_smelter')] = -(consume_coal);
            breakdown.p.consume.Oil[loc('city_smelter')] = -(consume_oil);

            modRes(l_type, -(consume_wood * time_multiplier));
            modRes('Coal', -(consume_coal * time_multiplier));
            modRes('Oil', -(consume_oil * time_multiplier));

            // Uranium
            if (consume_coal > 0 && global.tech['uranium'] && global.tech['uranium'] >= 3){
                let ash_base = consume_coal;
                if (global.city.geology['Uranium']){
                    ash_base *= global.city.geology['Uranium'] + 1;
                }
                uranium_bd[loc('city_coal_ash')] = uranium_bd[loc('city_coal_ash')] + (ash_base / 65 / global_multiplier);
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

                breakdown.p.consume.Coal[loc('city_smelter')] -= coal_consume;
                breakdown.p.consume.Iron[loc('city_smelter')] = -(iron_consume);
                modRes('Iron', -(iron_consume * time_multiplier));
                modRes('Coal', -(coal_consume * time_multiplier));

                let steel_base = 1;
                for (i = 4; i <= 6; i++) {
                    if (global.tech['smelting'] >= i) {
                        steel_base *= 1.2;
                    }
                }
                if (global.tech['smelting'] >= 7) {
                    steel_base *= 1.25;
                }

                if (oil_bonus > 0){
                    steel_smelter *= 1 + (oil_bonus / 200);
                }

                let smelter_output = steel_smelter * steel_base;
                if (global.race['pyrophobia']){
                    smelter_output *= 0.9;
                }

                let shrine_bonus = 1;
                if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                    shrine_bonus = 1 + (global.city.shrine.metal / 100);
                }

                let delta = smelter_output;
                delta *= hunger * global_multiplier * shrine_bonus;

                let steel_bd = {};
                steel_bd[loc('city_smelter')] = smelter_output + 'v';
                steel_bd[loc('city_shrine')] = ((shrine_bonus - 1) * 100) + '%';
                steel_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Steel'] = steel_bd;
                modRes('Steel', delta * time_multiplier);
                
                if (global.tech['titanium'] && global.tech['titanium'] >= 1){
                    let titanium = smelter_output * hunger;
                    if (global.city.geology['Titanium']){
                        delta *= global.city.geology['Titanium'] + 1;
                    }
                    if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                        delta *= 1 + (global.city.shrine.metal / 100);
                    }
                    let divisor = global.tech['titanium'] >= 3 ? 10 : 25;
                    modRes('Titanium', (delta * time_multiplier) / divisor);
                    titanium_bd[loc('resource_Steel_name')] = (titanium / divisor) + 'v';
                }
            }
        }

        // Graphene
        if (global.interstellar['g_factory'] && int_on['g_factory'] > 0){
            if (global.race['kindling_kindred']){
                global.interstellar.g_factory.Lumber = 0;
            }

            let consume_wood = global.interstellar.g_factory.Lumber * 350;
            let consume_coal = global.interstellar.g_factory.Coal * 25;
            let consume_oil = global.interstellar.g_factory.Oil * 15;

            while (int_on['g_factory'] < global.interstellar.g_factory.Lumber + global.interstellar.g_factory.Coal + global.interstellar.g_factory.Oil){
                if (global.interstellar.g_factory.Oil > 0){
                    global.interstellar.g_factory.Oil--;
                }
                else if (global.interstellar.g_factory.Coal > 0){
                    global.interstellar.g_factory.Coal--;
                }
                else if (global.interstellar.g_factory.Lumber > 0){
                    global.interstellar.g_factory.Lumber--;
                }
            }

            let graphene_production = global.interstellar.g_factory.Lumber + global.interstellar.g_factory.Coal + global.interstellar.g_factory.Oil;

            while (consume_wood * time_multiplier > global.resource.Lumber.amount && consume_wood > 0){
                consume_wood -= 350;
                graphene_production--;
            }
            while (consume_coal * time_multiplier > global.resource.Coal.amount && consume_coal > 0){
                consume_coal -= 25;
                graphene_production--;
            }
            while (consume_oil * time_multiplier > global.resource.Oil.amount && consume_oil > 0){
                consume_oil -= 15;
                graphene_production--;
            }
            
            breakdown.p.consume.Lumber[loc('interstellar_g_factory_bd')] = -(consume_wood);
            breakdown.p.consume.Coal[loc('interstellar_g_factory_bd')] = -(consume_coal);
            breakdown.p.consume.Oil[loc('interstellar_g_factory_bd')] = -(consume_oil);

            modRes('Lumber', -(consume_wood * time_multiplier));
            modRes('Coal', -(consume_coal * time_multiplier));
            modRes('Oil', -(consume_oil * time_multiplier));

            if (global.civic.govern.type === 'socialist'){
                graphene_production *= 1.05;
            }

            let ai = 1;
            if (global.tech['ai_core'] >= 3){
                let graph = +(quantum_level / 5).toFixed(1) / 100;
                ai += graph * p_on['citadel'];
            }

            let delta = graphene_production * ai * 0.6 * zigguratBonus() * hunger * global_multiplier;

            let graphene_bd = {};
            graphene_bd[loc('interstellar_g_factory_bd')] = (graphene_production * zigguratBonus()) + 'v';
            if (p_on['citadel'] > 0){
                graphene_bd[loc('interstellar_citadel_effect_bd')] = ((ai - 1) * 100) + '%';
            }
            graphene_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
            breakdown.p['Graphene'] = graphene_bd;
            modRes('Graphene', delta * time_multiplier);
        }

        // Lumber
        { //block scope
            if (global.race['soul_eater']){
                let lumber_bd = {};
                let weapons = global.tech['military'] ? (global.tech.military >= 5 ? global.tech.military - 1 : global.tech.military) : 1;
                let hunters = global.civic.free * weapons / 2;

                let soldiers = armyRating(garrisonSize(),'hunting') / 3;

                lumber_bd[loc('job_hunter')] = hunters  + 'v';
                lumber_bd[loc('soldiers')] = soldiers  + 'v';
                lumber_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Lumber'] = lumber_bd;
                modRes('Lumber', hunters * hunger * global_multiplier * time_multiplier);
                modRes('Lumber', soldiers * hunger * global_multiplier * time_multiplier);
            }
            else if (global.race['evil']){
                let lumber_bd = {};
                let reclaimers = global.civic.lumberjack.workers;
                reclaimers *= racialTrait(global.civic.lumberjack.workers,'lumberjack');

                let graveyard = 1;
                if (global.city['graveyard']){
                    graveyard += global.city['graveyard'].count * 0.08;
                }

                let soldiers = armyRating(garrisonSize(),'hunting') / 5;

                lumber_bd[loc('job_reclaimer')] = reclaimers  + 'v';
                lumber_bd[loc('city_graveyard')] = ((graveyard - 1) * 100) + '%';
                lumber_bd[loc('soldiers')] = soldiers  + 'v';
                lumber_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Lumber'] = lumber_bd;
                modRes('Lumber', reclaimers * hunger * graveyard * global_multiplier * time_multiplier);
                modRes('Lumber', soldiers * hunger * global_multiplier * time_multiplier);
            }
            else {
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
                lumber_bd[loc('job_lumberjack')] = lumber_base + 'v';
                lumber_bd[loc('city_lumber_yard')] = ((lumber_yard - 1) * 100) + '%';
                lumber_bd[loc('city_sawmill')] = ((power_mult - 1) * 100) + '%';
                lumber_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Lumber'] = lumber_bd;
                modRes('Lumber', delta * time_multiplier);
            }
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
                rock_quarry += global.city['rock_quarry'].count * 0.02;
            }

            let delta = stone_base * power_mult * rock_quarry;
            delta *= hunger * global_multiplier;

            let stone_bd = {};
            stone_bd[loc('workers')] = stone_base + 'v';
            stone_bd[loc('city_rock_quarry')] = ((rock_quarry - 1) * 100) + '%';
            stone_bd[loc('power')] = ((power_mult - 1) * 100) + '%';
            stone_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
            breakdown.p['Stone'] = stone_bd;
            modRes('Stone', delta * time_multiplier);

            // Aluminium
            let alumina_bd = {};
            let refinery = global.city['metal_refinery'] ? global.city['metal_refinery'].count * 6 : 0;
            if (global.city['metal_refinery'] && global.city['metal_refinery'].count > 0){
                let base = stone_base * rock_quarry * power_mult * 0.08;
                if (global.city.geology['Aluminium']){
                    base *= global.city.geology['Aluminium'] + 1;
                }

                let shrine_bonus = 1;
                if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                    shrine_bonus = 1 + (global.city.shrine.metal / 100);
                }

                let delta = base * shrine_bonus * hunger * global_multiplier;

                if (global.tech['alumina'] >= 2){
                    refinery += p_on['metal_refinery'] * 6;
                }

                delta *= 1 + (refinery / 100);

                alumina_bd[loc('workers')] = base + 'v';
                alumina_bd[loc('city_shrine')] = ((shrine_bonus - 1) * 100) + '%';
                alumina_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                
                modRes('Aluminium', delta * time_multiplier);
            }

            if (global.interstellar['mining_droid'] && miner_droids['alum'] > 0){
                let base = miner_droids['alum'] * 2.75 * zigguratBonus();
                let delta = base * global_multiplier;
                delta *= 1 + (refinery / 100);

                alumina_bd[loc('interstellar_mining_droid_title')] = base + 'v';
                
                modRes('Aluminium', delta * time_multiplier);
            }

            if (refinery > 0){
                alumina_bd[loc('city_metal_refinery')] = refinery + '%';
            }
            breakdown.p['Aluminium'] = alumina_bd;
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

                let copper_shrine = 1;
                if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                    copper_shrine = 1 + (global.city.shrine.metal / 100);
                }

                let delta = copper_base * copper_shrine * power_mult;
                delta *= hunger * global_multiplier;

                copper_bd[loc('job_miner')] = (copper_base) + 'v';
                copper_bd[loc('power')] = ((power_mult - 1) * 100) + '%';
                modRes('Copper', delta * time_multiplier);
            }
            
            // Iron
            if (global.resource.Iron.display){
                let iron_bd = {};
                let iron_mult = 1/4;
                let iron_base = miner_base * iron_mult;
                if (global.race['iron_allery']){
                    iron_base *= 0.75;
                }
                let smelter_mult = 1 + (iron_smelter * 0.1);

                if (global.city.geology['Iron']){
                    iron_base *= global.city.geology['Iron'] + 1;
                }
                
                let space_iron = 0;
                
                if (belt_on['iron_ship']){
                    space_iron = belt_on['iron_ship'] * (global.tech.asteroid >= 6 ? (global.tech.asteroid >= 7 ? 4 : 3) : 2) * zigguratBonus();
                }

                let iron_shrine = 1;
                if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                    iron_shrine = 1 + (global.city.shrine.metal / 100);
                }

                let delta = ((iron_base * power_mult) + space_iron) * smelter_mult * iron_shrine;
                delta *= hunger * global_multiplier;
                
                iron_bd[loc('job_miner')] = (iron_base) + 'v';
                iron_bd[loc('power')] = ((power_mult - 1) * 100) + '%';
                iron_bd[loc('job_space_miner')] = space_iron + 'v';
                iron_bd[loc('city_smelter')] = ((smelter_mult - 1) * 100) + '%';
                iron_bd[loc('city_shrine')] = ((iron_shrine - 1) * 100) + '%';
                iron_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Iron'] = iron_bd;
                modRes('Iron', delta * time_multiplier);

                if (global.tech['titanium'] && global.tech['titanium'] >= 2){
                    let labor_base = belt_on['iron_ship'] ? (global.civic.miner.workers / 4) + (belt_on['iron_ship'] / 2) : (global.civic.miner.workers / 4); 
                    let iron = labor_base * iron_smelter * 0.1;
                    delta = iron * global_multiplier;
                    if (global.city.geology['Titanium']){
                        delta *= global.city.geology['Titanium'] + 1;
                    }
                    if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                        delta *= 1 + (global.city.shrine.metal / 100);
                    }
                    let divisor = global.tech['titanium'] >= 3 ? 10 : 25;
                    modRes('Titanium', (delta * time_multiplier) / divisor);
                    titanium_bd[loc('resource_Iron_name')] = (iron / divisor) + 'v';
                }
            }
        }

        // Mars Mining
        if (red_on['red_mine'] && red_on['red_mine'] > 0){
            let copper_base = red_on['red_mine'] * 0.25 * global.civic.colonist.workers * zigguratBonus();
            if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                copper_base *= 1 + (global.city.shrine.metal / 100);
            }
            copper_bd[`${races[global.race.species].solar.red}_Mining`] = (copper_base) + 'v';
            modRes('Copper', copper_base * time_multiplier * global_multiplier * hunger);

            let titanium_base = red_on['red_mine'] * 0.02 * global.civic.colonist.workers * hunger * zigguratBonus();
            if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                titanium_base *= 1 + (global.city.shrine.metal / 100);
            }
            titanium_bd[`${races[global.race.species].solar.red}_Mining`] = (titanium_base) + 'v';
            modRes('Titanium', titanium_base * time_multiplier * global_multiplier);
        }
        if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
            copper_bd[loc('city_shrine')] = global.city.shrine.metal + '%';
            titanium_bd[loc('city_shrine')] = global.city.shrine.metal + '%';
        }
        copper_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
        breakdown.p['Copper'] = copper_bd;
        breakdown.p['Titanium'] = titanium_bd;
        
        if (uranium_bd[loc('city_coal_ash')]){
            uranium_bd[loc('city_coal_ash')] = uranium_bd[loc('city_coal_ash')] + 'v';
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
            coal_bd[loc('job_coal_miner')] = coal_base + 'v';
            coal_bd[loc('power')] = ((power_mult - 1) * 100) + '%';
            coal_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';

            if (global.interstellar['mining_droid'] && miner_droids['coal'] > 0){
                let driod_base = miner_droids['coal'] * 3.75 * zigguratBonus();
                let driod_delta = driod_base * global_multiplier;
                coal_bd[loc('interstellar_mining_droid_title')] = driod_base + 'v';
                modRes('Coal', driod_delta * time_multiplier);
            }

            breakdown.p['Coal'] = coal_bd;
            modRes('Coal', delta * time_multiplier);

            // Uranium
            if (global.resource.Uranium.display){
                let uranium = delta / 115;
                if (global.city.geology['Uranium']){
                    uranium *= global.city.geology['Uranium'] + 1;
                }
                modRes('Uranium', uranium * time_multiplier);
                uranium_bd[loc('job_coal_miner')] = uranium / global_multiplier + 'v';
            }
        }

        // Space Uranium
        if (global.interstellar['mining_droid'] && miner_droids['uran'] > 0){
            let driod_base = miner_droids['uran'] * 0.12 * zigguratBonus();
            let driod_delta = driod_base * global_multiplier;
            uranium_bd[loc('interstellar_mining_droid_title')] = driod_base + 'v';
            modRes('Uranium', driod_delta * time_multiplier);
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
            let oil_extractor = oil_base * p_on['oil_extractor'] * zigguratBonus();

            if (global.city.geology['Oil']){
                oil_base *= global.city.geology['Oil'] + 1;
            }
            let oil_well = oil_base * global.city.oil_well.count;

            let delta = oil_well + oil_extractor;
            delta *= hunger * global_multiplier;

            let oil_bd = {};
            oil_bd[loc('city_oil_well')] = oil_well + 'v';
            oil_bd[loc('space_gas_moon_oil_extractor_title')] = oil_extractor + 'v';
            oil_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
            breakdown.p['Oil'] = oil_bd;
            modRes('Oil', delta * time_multiplier);
        }

        // Iridium
        let iridium_bd = {};
        let iridium_shrine = 1;
        if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
            iridium_shrine = 1 + (global.city.shrine.metal / 100);
        }
        if (moon_on['iridium_mine']){
            let iridium_base = moon_on['iridium_mine'] * 0.035 * zigguratBonus();
            if (global.city.geology['Iridium']){
                iridium_base *= global.city.geology['Iridium'] + 1;
            }
            let delta = iridium_base * hunger * iridium_shrine * global_multiplier;
            iridium_bd[loc('space_moon_iridium_mine_title')] = iridium_base + 'v';
            modRes('Iridium', delta * time_multiplier);
        }

        if (belt_on['iridium_ship']){
            let iridium_base = belt_on['iridium_ship'] * (global.tech.asteroid >= 6 ? (global.tech.asteroid >= 7 ? 0.1 : 0.08) : 0.055) * zigguratBonus();
            let delta = iridium_base * hunger * iridium_shrine * global_multiplier;
            iridium_bd[loc('job_space_miner')] = iridium_base + 'v';
            modRes('Iridium', delta * time_multiplier);
        }
        if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
            iridium_bd[loc('city_shrine')] = ((iridium_shrine - 1) * 100) + '%';
        }
        iridium_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
        breakdown.p['Iridium'] = iridium_bd;

        // Helium 3
        let helium_bd = {};
        if (global.space['moon_base'] && moon_on['helium_mine']){
            let helium_base = moon_on['helium_mine'] * 0.18 * zigguratBonus();
            let delta = helium_base * hunger * global_multiplier;

            helium_bd[loc('space_moon_helium_mine_title')] = helium_base + 'v';
            modRes('Helium_3', delta * time_multiplier);
        }

        if (global.space['gas_mining'] && p_on['gas_mining']){
            let gas_mining = p_on['gas_mining'] * (global.tech['helium'] ? 0.65 : 0.5) * zigguratBonus();
            let delta = gas_mining * hunger * global_multiplier;

            helium_bd[loc('space_gas_mining_title')] = gas_mining + 'v';
            modRes('Helium_3', delta * time_multiplier);
        }

        if (global.interstellar['harvester'] && int_on['harvester']){
            let gas_mining = int_on['harvester'] * 0.85 * zigguratBonus();
            let delta = gas_mining * hunger * global_multiplier;

            helium_bd['Harvester'] = gas_mining + 'v';
            modRes('Helium_3', delta * time_multiplier);

            if (global.tech['ram_scoop']){
                let deuterium_bd = {};
                let deut_mining = int_on['harvester'] * 0.15 * zigguratBonus();
                let deut_delta = deut_mining * hunger * global_multiplier;

                deuterium_bd[loc('interstellar_harvester_title')] = deut_mining + 'v';
                modRes('Deuterium', deut_delta * time_multiplier);

                deuterium_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Deuterium'] = deuterium_bd;
            }
        }
        
        helium_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
        breakdown.p['Helium_3'] = helium_bd;

        // Neutronium
        let neutronium_bd = {};
        if (p_on['outpost']){
            let n_base = p_on['outpost'] * 0.025 * zigguratBonus();
            if (global.tech['drone']){
                n_base *= 1 + (global.space.drone.count * 0.06);
            }
            let delta = n_base * hunger * global_multiplier;
            neutronium_bd[loc('space_gas_moon_outpost_bd')] = n_base + 'v';
            modRes('Neutronium', delta * time_multiplier);
        }

        if (p_on['neutron_miner']){
            let n_base = p_on['neutron_miner'] * 0.055 * zigguratBonus();
            let delta = n_base * hunger * global_multiplier;
            neutronium_bd[loc('interstellar_neutron_miner_bd')] = n_base + 'v';
            modRes('Neutronium', delta * time_multiplier);
        }

        neutronium_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
        breakdown.p['Neutronium'] = neutronium_bd;

        // Elerium
        let elerium_bd = {};
        if (belt_on['elerium_ship']){
            let elerium_base = belt_on['elerium_ship'] * (global.tech.asteroid >= 6 ? (global.tech.asteroid >= 7 ? 0.009 : 0.0075) : 0.005) * zigguratBonus();
            let delta = elerium_base * hunger * global_multiplier;
            elerium_bd[loc('job_space_miner')] = elerium_base + 'v';
            modRes('Elerium', delta * time_multiplier);
        }

        // Prospector
        if (int_on['elerium_prospector']){
            let elerium_base = int_on['elerium_prospector'] * 0.014 * zigguratBonus();
            let delta = elerium_base * hunger * global_multiplier;
            elerium_bd[loc('interstellar_elerium_prospector_bd')] = elerium_base + 'v';
            modRes('Elerium', delta * time_multiplier);
        }
        elerium_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
        breakdown.p['Elerium'] = elerium_bd;

        // Adamantite
        let adamantite_bd = {};
        if (global.resource.Adamantite.display && global.interstellar['mining_droid'] && miner_droids['adam'] > 0){
            let driod_base = miner_droids['adam'] * 0.075 * zigguratBonus();
            let driod_delta = driod_base * global_multiplier;
            adamantite_bd[loc('interstellar_mining_droid_title')] = driod_base + 'v';
            if (global.interstellar['processing'] && int_on['processing']){
                let rate = 0.12;
                if (global.tech['ai_core'] && global.tech['ai_core'] >= 2 && p_on['citadel'] > 0){
                    rate += (p_on['citadel'] * 0.02);
                }
                let bonus = int_on['processing'] * rate;
                driod_delta *= 1 + bonus;
                adamantite_bd[loc('interstellar_processing_title')] = (bonus * 100) + '%';
            }
            if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                let bonus = global.city.shrine.metal * 0.01;
                driod_delta *= 1 + bonus;
                adamantite_bd[loc('city_shrine')] = (bonus * 100) + '%';
            }
            modRes('Adamantite', driod_delta * time_multiplier);
        }
        breakdown.p['Adamantite'] = adamantite_bd;

        // Infernite
        let infernite_bd = {};
        if (global.resource.Infernite.display && global.civic.hell_surveyor.workers > 0){
            let rate = global.tech.infernite >= 3 ? 0.015 : 0.01;
            let surveyor_base = global.civic.hell_surveyor.workers * rate;
            
            let sensors = 1;
            if (global.tech['infernite'] >= 2 && p_on['sensor_drone']){
                let drone_rate = global.tech.infernite >= 4 ? 0.2 : 0.1;
                sensors = 1 + (p_on['sensor_drone'] * drone_rate);
            }

            let surveyor_delta = surveyor_base * sensors * global_multiplier;
            
            infernite_bd[loc('job_hell_surveyor')] = surveyor_base + 'v';
            infernite_bd[loc('portal_sensor_drone_title')] = ((sensors - 1) * 100) + '%';
            modRes('Infernite', surveyor_delta * time_multiplier);
        }
        breakdown.p['Infernite'] = infernite_bd;

        // Income
        if (global.tech['currency'] >= 1){
            let income_base = global.resource[global.race.species].amount + global.civic.garrison.workers - (global.race['carnivore'] || global.race['evil'] ? 0 : global.civic.free);
            income_base *= ( global.race['greedy'] ? 1.75 : 2 );
            income_base /= 5;
            
            if (fed){
                if (global.tech['banking'] && global.tech['banking'] >= 2){
                    let impact = global.civic.banker.impact;
                    if (global.tech['banking'] >= 10){
                        impact += 0.02 * global.tech['stock_exchange'];
                    }
                    if (global.race['truthful']){
                        impact /= 2;
                    }
                    if (global.civic.govern.type === 'republic'){
                        impact *= 1.25;
                    }
                    income_base *= 1 + (global.civic.banker.workers * impact);
                }
            }
            else {
                income_base = income_base / 2;
            }
            
            income_base *= (global.civic.taxes.tax_rate / 20);
            if (global.civic.govern.type === 'oligarchy'){
                income_base *= 0.9;
            }
            if (global.civic.govern.type === 'corpocracy'){
                income_base *= 0.5;
            }
            if (global.civic.govern.type === 'socialist'){
                income_base *= 0.8;
            }

            let temple_mult = 1;
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 4){
                temple_mult += (global.city.temple.count * 0.025);
            }

            let shrine_mult = 1;
            if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                shrine_mult += +(global.city.shrine.tax / 100);
            }

            let delta = income_base * temple_mult * shrine_mult;
            delta *= global_multiplier;
            
            money_bd[loc('morale_taxes')] = (income_base) + 'v';
            money_bd[loc('city_temple')] = ((temple_mult - 1) * 100) + '%';
            money_bd[loc('city_shrine')] = ((shrine_mult - 1) * 100) + '%';
            money_bd[loc('city_factory')] = FactoryMoney + 'v';
            modRes('Money', +(delta * time_multiplier).toFixed(2));
        }

        if (p_on['casino']){
            if (global.tech['gambling'] >= 2){
                let cash = (Math.log2(global.resource[global.race.species].amount) * (global.race['gambler'] ? 2.5 + (global.race['gambler'] / 10) : 2.5)).toFixed(2);
                if (global.civic.govern.type === 'corpocracy'){
                    cash *= 2;
                }
                if (global.civic.govern.type === 'socialist'){
                    cash *= 0.8;
                }
                cash *= p_on['casino'];
                money_bd[loc('city_casino')] = cash + 'v';
                modRes('Money', +(cash * time_multiplier * global_multiplier * hunger).toFixed(2));
            }
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
            if (global.civic.govern.type === 'corpocracy'){
                tourism *= 1.5;
            }
            if (global.civic.govern.type === 'socialist'){
                tourism *= 0.8;
            }
            money_bd[loc('tech_tourism')] = Math.round(tourism) + 'v';
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
            if (global.tech['wsc'] === 0){
                global.tech['wsc'] = 1;
                drawTech();
            }
        }
        else if (global.tech['wsc'] !== 0){
            global.tech['wsc'] = 0;
            drawTech();
        }

        if (global.tech['portal'] >= 2){
            if (global.portal.fortress.garrison > 0){
                global.tech['portal_guard'] = 1;
            }
            else {
                global.tech['portal_guard'] = 0;
            }
        }

        if (global.race['decay']){
            Object.keys(tradeRatio).forEach(function (res) {
                if (global.resource[res].amount > 50){
                    let decay = +((global.resource[res].amount - 50) * (0.001 * tradeRatio[res])).toFixed(3);
                    modRes(res, -(decay * time_multiplier));
                    breakdown.p.consume[res][loc('evo_challenge_decay')] = -(decay);
                }
                else {
                    delete breakdown.p.consume[res][loc('evo_challenge_decay')];
                }
            });
        }
    }
    
    if (global.civic['garrison'] && global.civic.garrison.workers < global.civic.garrison.max){
        let rate = global.race['diverse'] ? 2 : 2.5;
        if (global.city['boot_camp']){
            rate *= 1 + (global.city['boot_camp'].count * (global.tech['boot_camp'] >= 2 ? 0.08 : 0.05));
        }
        global.civic.garrison.progress += rate * time_multiplier;
        if (global.race['brute']){
            global.civic.garrison.progress += 2.5 * time_multiplier;
        }
        if (global.civic.garrison.progress >= 100){
            global.civic.garrison.progress = 0;
            global.civic.garrison.workers++;

            if (global.portal['fortress'] && global.portal.fortress['assigned'] && global.portal.fortress.garrison < global.portal.fortress.assigned){
                global.portal.fortress.garrison++;
            };
        }
    }

    // carport repair
    if (global.portal['carport']){
        if (global.portal.carport.damaged > 0){
            if (!$('#portal-carport .count').hasClass('has-text-alert')){
                $('#portal-carport .count').addClass('has-text-alert');
            }
            global.portal.carport.repair++;
            if (global.portal.carport.repair >= actions.portal.prtl_fortress.carport.repair){
                global.portal.carport.repair = 0;
                global.portal.carport.damaged--;
            }
        }
        else {
            if ($('#portal-carport .count').hasClass('has-text-alert')){
                $('#portal-carport .count').removeClass('has-text-alert');
            }
        }
    }

    // main resource delta tracking
    Object.keys(global.resource).forEach(function (res) {
        if (global['resource'][res].rate > 0){
            diffCalc(res,main_timer);
        }
    });

    if (global.settings.expose){
        if (!window['evolve']){
            enableScript();
        }
        window.evolve.global = JSON.parse(JSON.stringify(global));
        window.evolve.craftCost = JSON.parse(JSON.stringify(craftCost())),
        window.evolve.breakdown = JSON.parse(JSON.stringify(breakdown));
    }
}

function midLoop(){
    if (global.race.species === 'protoplasm'){
        let base = 100;
        if (global.stats.achieve['creator'] && global.stats.achieve['creator'].l > 1){
            base += 50 * (global.stats.achieve['creator'].l - 1);
        }
        var caps = {
            RNA: base,
            DNA: base
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
            Knowledge: global.stats.achieve['extinct_junker'] ? 1000 : 100,
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
            Helium_3: 0,
            Deuterium: 0,
            Neutronium: 0,
            Adamantite: 0,
            Infernite: 0,
            Elerium: 1,
            Nano_Tube: 0,
            Graphene: 0,
            Stanene: 0
        };
        // labor caps
        var lCaps = {
            farmer: -1,
            lumberjack: -1,
            quarry_worker: -1,
            scavenger: -1,
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
            space_miner: 0,
            hell_surveyor: 0
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
        var bd_Deuterium = { Base: caps['Deuterium']+'v' };
        var bd_Neutronium = { Base: caps['Neutronium']+'v' };
        var bd_Adamantite = { Base: caps['Adamantite']+'v' };
        var bd_Infernite = { Base: caps['Infernite']+'v' };
        var bd_Elerium = { Base: caps['Elerium']+'v' };
        var bd_Nano_Tube = { Base: caps['Nano_Tube']+'v' };
        var bd_Graphene = { Base: caps['Graphene']+'v' };
        var bd_Stanene = { Base: caps['Stanene']+'v' };

        caps[global.race.species] = 0;
        if (global.city['farm']){
            if (global.tech['farm']){
                caps[global.race.species] += global.city['farm'].count;
                bd_Citizen[loc('city_farm')] = global.city['farm'].count + 'v';
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
        if (global.interstellar['cargo_yard']){
            caps['Crates'] += (global.interstellar['cargo_yard'].count * 50);
            caps['Containers'] += (global.interstellar['cargo_yard'].count * 50);

            let gain = (global.interstellar['cargo_yard'].count * spatialReasoning(200));
            caps['Neutronium'] += gain;
            bd_Neutronium[loc('interstellar_cargo_yard_title')] = gain+'v';

            gain = (global.interstellar['cargo_yard'].count * spatialReasoning(150));
            caps['Infernite'] += gain;
            bd_Infernite[loc('interstellar_cargo_yard_title')] = gain+'v';
        }
        if (global.interstellar['neutron_miner'] && p_on['neutron_miner']){
            let gain = (p_on['neutron_miner'] * spatialReasoning(500));
            caps['Neutronium'] += gain;
            bd_Neutronium[loc('interstellar_neutron_miner_title')] = gain+'v';
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
            if (global.stats.achieve['blackhole']){ gain = Math.round(gain * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
            caps['Stone'] += gain;
            bd_Stone[loc('city_rock_quarry')] = gain+'v';
        }
        if (global.city['lumber_yard']){
            let gain = (global.city['lumber_yard'].count * spatialReasoning(100));
            if (global.stats.achieve['blackhole']){ gain = Math.round(gain * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
            caps['Lumber'] += gain;
            bd_Lumber[loc('city_lumber_yard')] = gain+'v';
        }
        else if (global.city['graveyard']){
            let gain = (global.city['graveyard'].count * spatialReasoning(100));
            if (global.stats.achieve['blackhole']){ gain = Math.round(gain * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
            caps['Lumber'] += gain;
            bd_Lumber[loc('city_graveyard')] = gain+'v';
        }
        if (global.city['sawmill']){
            let gain = (global.city['sawmill'].count * spatialReasoning(200));
            if (global.stats.achieve['blackhole']){ gain = Math.round(gain * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
            caps['Lumber'] += gain;
            bd_Lumber[loc('city_sawmill')] = gain+'v';
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
        if (global.interstellar['cruiser']){
            lCaps['garrison'] += int_on['cruiser'] * 3;
        }
        if (global.city['basic_housing']){
            caps[global.race.species] += global.city['basic_housing'].count;
            bd_Citizen[housingLabel('small')] = global.city['basic_housing'].count + 'v';
        }
        if (global.city['cottage']){
            caps[global.race.species] += global.city['cottage'].count * 2;
            bd_Citizen[housingLabel('medium')] = (global.city['cottage'].count * 2) + 'v';
            if (global.tech['home_safe']){
                let gain = (global.city['cottage'].count * spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 5000 : 2000) : 1000));
                caps['Money'] += gain;
                bd_Money[housingLabel('medium')] = gain+'v';
            }
        }
        if (global.city['apartment']){
            caps[global.race.species] += global.city['apartment'].on * 5;
            bd_Citizen[housingLabel('large')] = (global.city['apartment'].on * 5)+'v';
            if (global.tech['home_safe']){
                let gain = (global.city['apartment'].on * spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 10000 : 5000) : 2000));
                caps['Money'] += gain;
                bd_Money[housingLabel('large')] = gain+'v';
            }
        }
        if (global.space['living_quarters']){
            caps[global.race.species] += red_on['living_quarters'];
            lCaps['colonist'] += red_on['living_quarters'];
            bd_Citizen[`${races[global.race.species].solar.red}`] = red_on['living_quarters'] + 'v';
        }
        if (global.interstellar['habitat'] && p_on['habitat']){
            caps[global.race.species] += p_on['habitat'];
            bd_Citizen[loc('interstellar_habitat_title')] = p_on['habitat'] + 'v';
        }
        if (global.city['lodge']){
            caps[global.race.species] += global.city['lodge'].count;
        }
        if (global.space['outpost']){
            let gain = global.space['outpost'].count * spatialReasoning(500);
            caps['Neutronium'] += gain;
            bd_Neutronium[loc('space_gas_moon_outpost_title')] = gain+'v';
        }
        if (global.city['shed']){
            var multiplier = storageMultipler();
            let gain = 0;
            let label = global.tech['storage'] <= 2 ? loc('city_shed_title1') : (global.tech['storage'] >= 4 ? loc('city_shed_title3') : loc('city_shed_title2'));
            if (global.tech['storage'] >= 3){
                gain = (global.city['shed'].count * (spatialReasoning(40 * multiplier)));
                caps['Steel'] += gain;
                bd_Steel[label] = gain+'v';
            }
            if (global.tech['storage'] >= 4){
                gain = (global.city['shed'].count * (spatialReasoning(20 * multiplier)));
                caps['Titanium'] += gain;
                bd_Titanium[label] = gain+'v';
            }
            gain = (global.city['shed'].count * (spatialReasoning(300 * multiplier)));
            caps['Lumber'] += gain;
            bd_Lumber[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(300 * multiplier)));
            caps['Stone'] += gain;
            bd_Stone[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(125 * multiplier)));
            caps['Furs'] += gain;
            bd_Furs[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(90 * multiplier)));
            caps['Copper'] += gain;
            bd_Copper[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(125 * multiplier)));
            caps['Iron'] += gain;
            bd_Iron[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(90 * multiplier)));
            caps['Aluminium'] += gain;
            bd_Aluminium[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(100 * multiplier)));
            caps['Cement'] += gain;
            bd_Cement[label] = gain+'v';
            
            gain = (global.city['shed'].count * (spatialReasoning(75 * multiplier)));
            caps['Coal'] += gain;
            bd_Coal[label] = gain+'v';
        }

        if (global.interstellar['warehouse']){
            var multiplier = storageMultipler();
            let gain = 0;
            let label = loc('interstellar_alpha_name');
            gain = (global.interstellar['warehouse'].count * (spatialReasoning(750 * multiplier)));
            caps['Lumber'] += gain;
            bd_Lumber[label] = gain+'v';
            
            gain = (global.interstellar['warehouse'].count * (spatialReasoning(750 * multiplier)));
            caps['Stone'] += gain;
            bd_Stone[label] = gain+'v';
            
            gain = (global.interstellar['warehouse'].count * (spatialReasoning(425 * multiplier)));
            caps['Furs'] += gain;
            bd_Furs[label] = gain+'v';
            
            gain = (global.interstellar['warehouse'].count * (spatialReasoning(380 * multiplier)));
            caps['Copper'] += gain;
            bd_Copper[label] = gain+'v';
            
            gain = (global.interstellar['warehouse'].count * (spatialReasoning(350 * multiplier)));
            caps['Iron'] += gain;
            bd_Iron[label] = gain+'v';
            
            gain = (global.interstellar['warehouse'].count * (spatialReasoning(320 * multiplier)));
            caps['Aluminium'] += gain;
            bd_Aluminium[label] = gain+'v';
            
            gain = (global.interstellar['warehouse'].count * (spatialReasoning(280 * multiplier)));
            caps['Cement'] += gain;
            bd_Cement[label] = gain+'v';
            
            gain = (global.interstellar['warehouse'].count * (spatialReasoning(120 * multiplier)));
            caps['Coal'] += gain;
            bd_Coal[label] = gain+'v';

            if (global.tech['storage'] >= 3){
                gain = (global.interstellar['warehouse'].count * (spatialReasoning(60 * multiplier)));
                caps['Steel'] += gain;
                bd_Steel[label] = gain+'v';
            }

            if (global.tech['storage'] >= 4){
                gain = (global.interstellar['warehouse'].count * (spatialReasoning(40 * multiplier)));
                caps['Titanium'] += gain;
                bd_Titanium[label] = gain+'v';
            }

            if (global.resource.Nano_Tube.display){
                gain = (global.interstellar['warehouse'].count * (spatialReasoning(30 * multiplier)));
                caps['Nano_Tube'] += gain;
                bd_Nano_Tube[label] = gain+'v';
            }

            if (global.resource.Neutronium.display){
                gain = (global.interstellar['warehouse'].count * (spatialReasoning(8 * multiplier)));
                caps['Neutronium'] += gain;
                bd_Neutronium[label] = gain+'v';
            }

            if (global.resource.Adamantite.display){
                gain = (global.interstellar['warehouse'].count * (spatialReasoning(18 * multiplier)));
                caps['Adamantite'] += gain;
                bd_Adamantite[label] = gain+'v';
            }

            if (global.resource.Infernite.display){
                gain = (global.interstellar['warehouse'].count * (spatialReasoning(5 * multiplier)));
                caps['Infernite'] += gain;
                bd_Infernite[label] = gain+'v';
            }
        }

        if (global.resource.Infernite.display && global.portal['fortress']){
            let gain = spatialReasoning(1000);
            caps['Infernite'] += gain;
            bd_Infernite[loc('portal_fortress_name')] = gain+'v';
        }
        if (global.space['garage']){
            let multiplier = global.tech['particles'] >= 4 ? 1 + (global.tech['supercollider'] / 20) : 1;
            multiplier *= global.tech['world_control'] ? 2 : 1;
            multiplier *= global.stats.achieve['blackhole'] ? 1 + (global.stats.achieve.blackhole.l * 0.05) : 1;

            let gain = (global.space.garage.count * (spatialReasoning(6500 * multiplier)));
            caps['Copper'] += gain;
            bd_Copper[loc('space_red_garage_title')] = gain+'v';

            gain = (global.space.garage.count * (spatialReasoning(5500 * multiplier)));
            caps['Iron'] += gain;
            bd_Iron[loc('space_red_garage_title')] = gain+'v';

            gain = (global.space.garage.count * (spatialReasoning(6000 * multiplier)));
            caps['Cement'] += gain;
            bd_Cement[loc('space_red_garage_title')] = gain+'v';

            gain = (global.space.garage.count * (spatialReasoning(4500 * multiplier)));
            caps['Steel'] += gain;
            bd_Steel[loc('space_red_garage_title')] = gain+'v';

            gain = (global.space.garage.count * (spatialReasoning(3500 * multiplier)));
            caps['Titanium'] += gain;
            bd_Titanium[loc('space_red_garage_title')] = gain+'v';

            gain = (global.space.garage.count * (spatialReasoning(2500 * multiplier)));
            caps['Alloy'] += gain;
            bd_Alloy[loc('space_red_garage_title')] = gain+'v';

            if (global.resource.Nano_Tube.display){
                gain = (global.space.garage.count * (spatialReasoning(25000 * multiplier)));
                caps['Nano_Tube'] += gain;
                bd_Nano_Tube[loc('space_red_garage_title')] = gain+'v';
            }

            if (global.resource.Neutronium.display){
                gain = (global.space.garage.count * (spatialReasoning(125 * multiplier)));
                caps['Neutronium'] += gain;
                bd_Neutronium[loc('space_red_garage_title')] = gain+'v';
            }

            if (global.resource.Infernite.display){
                gain = (global.space.garage.count * (spatialReasoning(75 * multiplier)));
                caps['Infernite'] += gain;
                bd_Infernite[loc('space_red_garage_title')] = gain+'v';
            }
        }
        if (global.city['silo']){
            let gain = (global.city['silo'].count * spatialReasoning(500));
            if (global.stats.achieve['blackhole']){ gain = Math.round(gain * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
            caps['Food'] += gain;
            bd_Food[loc('city_silo')] = gain+'v';
        }
        if (global.city['soul_well']){
            let gain = (global.city['soul_well'].count * spatialReasoning(500));
            if (global.stats.achieve['blackhole']){ gain = Math.round(gain * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
            caps['Food'] += gain;
            bd_Food[loc('city_soul_well')] = gain+'v';
        }
        if (global.city['smokehouse']){
            let gain = (global.city['smokehouse'].count * spatialReasoning(500));
            if (global.stats.achieve['blackhole']){ gain = Math.round(gain * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
            caps['Food'] += gain;
            bd_Food[loc('city_smokehouse')] = gain+'v';
        }
        if (global.city['oil_well']){
            let gain = (global.city['oil_well'].count * spatialReasoning(500));
            caps['Oil'] += gain;
            bd_Oil[loc('city_oil_well')] = gain+'v';
        }
        if (global.city['oil_depot']){
            let gain = (global.city['oil_depot'].count * spatialReasoning(1000));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Oil'] += gain;
            bd_Oil[loc('city_oil_depot')] = gain+'v';
            if (global.tech['uranium'] >= 2){
                gain = (global.city['oil_depot'].count * spatialReasoning(250));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                caps['Uranium'] += gain;
                bd_Uranium[loc('city_oil_depot')] = gain+'v';
            }
            if (global.resource['Helium_3'].display){
                gain = (global.city['oil_depot'].count * spatialReasoning(400));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                caps['Helium_3'] += gain;
                bd_Helium[loc('city_oil_depot')] = gain+'v';
            }
        }
        if (global.space['propellant_depot']){
            let gain = (global.space['propellant_depot'].count * spatialReasoning(1250));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Oil'] += gain;
            bd_Oil[loc('space_home_propellant_depot_title')] = gain+'v';
            if (global.resource['Helium_3'].display){
                gain = (global.space['propellant_depot'].count * spatialReasoning(1000));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                caps['Helium_3'] += gain;
                bd_Helium[loc('space_home_propellant_depot_title')] = gain+'v';
            }
        }
        if (global.space['gas_storage']){
            let gain = (global.space['gas_storage'].count * spatialReasoning(3500));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Oil'] += gain;
            bd_Oil[`${races[global.race.species].solar.gas}_${loc('depot')}`] = gain+'v';

            gain = (global.space['gas_storage'].count * spatialReasoning(2500));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Helium_3'] += gain;
            bd_Helium[`${races[global.race.species].solar.gas}_${loc('depot')}`] = gain+'v';

            gain = (global.space['gas_storage'].count * spatialReasoning(1000));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Uranium'] += gain;
            bd_Uranium[`${races[global.race.species].solar.gas}_${loc('depot')}`] = gain+'v';
        }
        if (p_on['xfer_station']){
            let gain = (p_on['xfer_station'] * spatialReasoning(5000));
            caps['Helium_3'] += gain;
            bd_Helium[loc('interstellar_xfer_station_title')] = gain+'v';

            gain = (p_on['xfer_station'] * spatialReasoning(4000));
            caps['Oil'] += gain;
            bd_Oil[loc('interstellar_xfer_station_title')] = gain+'v';

            gain = (p_on['xfer_station'] * spatialReasoning(2500));
            caps['Uranium'] += gain;
            bd_Uranium[loc('interstellar_xfer_station_title')] = gain+'v';

            if (global.resource.Deuterium.display){
                let deuterium_gain = p_on['xfer_station'] * spatialReasoning(2000);
                caps['Deuterium'] += deuterium_gain;
                bd_Deuterium[loc('interstellar_xfer_station_title')] = deuterium_gain+'v';
            }
        }
        if (global.space['helium_mine']){
            let gain = (global.space['helium_mine'].count * spatialReasoning(100));
            caps['Helium_3'] += gain;
            bd_Helium[loc('space_moon_helium_mine_title')] = gain+'v';
        }
        if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
            let gain = +(global.city.shrine.know * 500);
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('city_shrine')] = gain+'v';
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
            if (global.portal['sensor_drone']){
                multiplier += (p_on['sensor_drone'] * 0.02);
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
            bd_Knowledge[loc('city_university')] = gain+'v';
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
            bd_Knowledge[loc('city_library')] = gain+'v';
            if (global.tech['science'] && global.tech['science'] >= 3){
                global.civic.professor.impact = 0.5 + (global.city.library.count * 0.01)
            }
        }
        if (global.city['wardenclyffe']){
            let gain = global.city['wardenclyffe'].count * (global.city.ptrait === 'magnetic' ? 1100 : 1000);
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
            bd_Knowledge[global.race['evil'] ? loc('city_babel_title') : loc('city_wardenclyffe')] = gain+'v';
        }
        if (global.portal['sensor_drone']){
            let gain = p_on['sensor_drone'] * 1000;
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('portal_sensor_drone_title')] = gain+'v';
        }
        if (global.space['satellite']){
            let gain = (global.space.satellite.count * 750);
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('space_home_satellite_title')] = gain+'v';
        }
        if (global.space['observatory'] && global.space.observatory.count > 0){
            let gain = (moon_on['observatory'] * 5000);
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('space_moon_observatory_title')] = gain+'v';
        }
        if (global.interstellar['laboratory'] && int_on['laboratory'] > 0){
            let gain = (int_on['laboratory'] * 10000);
            if (global.tech.science >= 15){
                gain *= 1 + (global.city.wardenclyffe.count * 0.02);
            }
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('interstellar_laboratory_title')] = gain+'v';
        }
        if (global.city['biolab']){
            let gain = 3000;
            if (global.portal['sensor_drone']){
                gain *= 1 + (p_on['sensor_drone'] * 0.02);
            }
            caps['Knowledge'] += (p_on['biolab'] * gain);
            bd_Knowledge[loc('city_biolab')] = (p_on['biolab'] * gain)+'v';
        }
        if (global.city['bank']){
            let vault = 1800;
            if (global.tech['vault'] >= 1){
                vault = (global.tech['vault'] + 1) * 7500;
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
                vault += 25 * global.resource[global.race.species].amount;
            }
            if (global.tech['stock_exchange']){
                vault *= 1 + (global.tech['stock_exchange'] * 0.1);
            }
            if (global.tech['world_control']){
                vault *= 1.25;
            }
            let gain = (global.city['bank'].count * spatialReasoning(vault));
            caps['Money'] += gain;
            bd_Money[loc('city_bank')] = gain+'v';

            if (global.interstellar['exchange']){
                let g_vault = spatialReasoning(int_on['exchange'] * (vault * global.city['bank'].count / 18));
                caps['Money'] += g_vault;
                bd_Money[loc('interstellar_exchange_bd')] = g_vault+'v';
            }
        }
        if (global.city['casino']){
            let vault = global.city['casino'].count * spatialReasoning(global.tech['gambling'] >= 3 ? 60000 : 40000);
            if (global.race['gambler']){
                vault *= 1 + (global.race['gambler'] * 0.04);
            }
            if (global.tech['world_control']){
                vault = Math.round(vault * 1.25);
            }
            caps['Money'] += vault;
            bd_Money[loc('city_casino')] = vault+'v';
        }
        if (global.tech['banking'] >= 4){
            let cm = 250;
            if (global.tech['banking'] >= 11){
                cm = 1000;
            }
            else if (global.tech['banking'] >= 6){
                cm = 600;
            }
            let gain = cm * (global.resource[global.race.species].amount + global.civic.garrison.workers);
            caps['Money'] += gain;
            bd_Money[loc('tech_bonds')] = gain+'v';
        }
        if (p_on['moon_base']){
            let gain = p_on['moon_base'] * spatialReasoning(500);
            caps['Iridium'] += gain;
            bd_Iridium[loc('space_moon_base_title')] = gain+'v';
        }
        if (p_on['space_station']){
            lCaps['space_miner'] += p_on['space_station'] * 3;
            if (global.tech['asteroid'] >= 5){
                let gain = p_on['space_station'] * spatialReasoning(5);
                caps['Elerium'] += gain;
                bd_Elerium[loc('space_belt_station_title')] = gain+'v';
            }
        }
        if (red_on['exotic_lab']){
            let el_gain = red_on['exotic_lab'] * spatialReasoning(10);
            caps['Elerium'] += el_gain;
            bd_Elerium['Exotic_Lab'] = el_gain+'v';
            let sci = 500;
            if (global.tech['science'] >= 13 && global.interstellar['laboratory']){
                sci += int_on['laboratory'] * 25;
            }
            let gain = red_on['exotic_lab'] * global.civic.colonist.workers * sci;
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('tech_exotic_bd')] = gain+'v';
        }
        if (p_on['elerium_contain']){
            let el_gain = p_on['elerium_contain'] * spatialReasoning(100);
            caps['Elerium'] += el_gain;
            bd_Elerium[loc('space_dwarf_elerium_contain_title')] = el_gain+'v';
        }
        if (global.city['foundry']){
            lCaps['craftsman'] += global.city['foundry'].count;
        }
        if (red_on['fabrication']){
            lCaps['craftsman'] += red_on['fabrication'];
        }
        if (global.portal['carport']){
            lCaps['hell_surveyor'] += global.portal.carport.count - global.portal.carport.damaged;
        }
        if (p_on['nexus']){
            let helium_gain = p_on['nexus'] * spatialReasoning(4000);
            caps['Helium_3'] += helium_gain;
            bd_Helium[loc('interstellar_nexus_title')] = helium_gain+'v';

            let oil_gain = (p_on['nexus'] * spatialReasoning(3500));
            caps['Oil'] += oil_gain;
            bd_Oil[loc('interstellar_nexus_title')] = oil_gain+'v';

            let deuterium_gain = p_on['nexus'] * spatialReasoning(3000);
            caps['Deuterium'] += deuterium_gain;
            bd_Deuterium[loc('interstellar_nexus_title')] = deuterium_gain+'v';

            let elerium_gain = p_on['nexus'] * spatialReasoning(25);
            caps['Elerium'] += elerium_gain;
            bd_Elerium[loc('interstellar_nexus_title')] = elerium_gain+'v';
        }

        if (global.city['trade']){
            let routes = global.race['nomadic'] || global.race['xenophobic'] ? global.tech.trade : global.tech.trade + 1;
            if (global.tech['trade'] && global.tech['trade'] >= 3){
                routes--;
            }
            global.city.market.mtrade = routes * global.city.trade.count;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 3){
                global.city.market.mtrade += global.city.temple.count;
            }
        }
        if (global.city['wharf']){
            global.city.market.mtrade += global.city.wharf.count * (global.race['nomadic'] || global.race['xenophobic'] ? 1 : 2);
        }
        if (global.space['gps'] && global.space.gps.count >= 4){
            global.city.market.mtrade += global.space.gps.count * 2;
        }
        if (global.city['storage_yard'] && global.tech['trade'] && global.tech['trade'] >= 3){
            global.city.market.mtrade += global.city.storage_yard.count;
        }
        if (global.tech['railway']){
            let routes = global.city['storage_yard'] ? Math.floor(global.city.storage_yard.count / 6) : 0;
            global.city.market.mtrade += global.tech['railway'] * routes;
        }

        if (global.race['inspired']){
            global.race['inspired']--;
            if (global.race['inspired'] <= 0){
                delete global.race['inspired'];
            }
        }
        
        let pop_loss = global.resource[global.race.species].amount - caps[global.race.species];
        if (pop_loss > 0){
            if (pop_loss === 1){
                messageQueue(loc('abandon1',[pop_loss]),'danger');
            }
            else {
                messageQueue(loc('abandon2',[pop_loss]),'danger');
            }
        }

        if (p_on['world_controller']){
            let boost = 0.25;
            if (global.interstellar['far_reach'] && p_on['far_reach'] > 0){
                boost += p_on['far_reach'] * 0.01;
            }
            let gain = Math.round(caps['Knowledge'] * boost);
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('space_dwarf_collider_title')] = gain+'v';
        }

        breakdown.c = {
            Money: bd_Money,
            [global.race.species]: bd_Citizen,
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
            Helium_3: bd_Helium,
            Deuterium: bd_Deuterium,
            Neutronium: bd_Neutronium,
            Adamantite: bd_Adamantite,
            Infernite: bd_Infernite,
            Elerium: bd_Elerium,
            Nano_Tube: bd_Nano_Tube,
            Graphene: bd_Graphene,
            Stanene: bd_Stanene,
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
                if (global.city[action]){
                    global.city[action]['time'] = timeFormat(timeCheck(c_action));
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

        let spc_locations = ['space','interstellar','portal'];
        for (let i=0; i<spc_locations.length; i++){
            let location = spc_locations[i];
            Object.keys(actions[location]).forEach(function (region){
                Object.keys(actions[location][region]).forEach(function (action){
                    if ((global[location][action] || actions[location][region][action].grant) && actions[location][region][action] && actions[location][region][action].cost){
                        let c_action = actions[location][region][action];
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
                        if (global[location][action]){
                            global[location][action]['time'] = timeFormat(timeCheck(c_action));
                        }
                    }
                });
            });
        }

        if (global.space['swarm_control']){
            global.space.swarm_control.s_max = global.space.swarm_control.count * (global.tech['swarm'] && global.tech['swarm'] >= 2 ? 18 : 10);
        }

        if (global.arpa['sequence'] && global.arpa.sequence.on && gene_sequence){
            let labs = global.city.ptrait === 'toxic' ? global.city.biolab.on + 1 : global.city.biolab.on;
            global.arpa.sequence.time -= global.arpa.sequence.boost ? labs * 2 : labs;
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
                    let trait = randomMinorTrait();
                    let gene = global.genes['synthesis'] ? (2 ** (global.race.mutation - 1)) * (global.genes['synthesis'] + 1) : global.race.mutation;
                    if (global.stats.achieve['mass_extinction']){
                        gene *= global.stats.achieve['mass_extinction'].l + 1;
                    }
                    messageQueue(loc('gene_therapy',[trait,gene]),'success');
                    global.resource.Genes.amount += gene;
                    global.resource.Genes.display = true;
                    let plasma = global.genes['plasma'] ? global.race.mutation : 1;
                    if (global.genes['plasma'] && plasma > 3){
                        if (global.genes['plasma'] >= 2){
                            plasma = plasma > 5 ? 5 : plasma;
                        }
                        else {
                            plasma = 3;
                        }
                    }
                    if (global.race['universe'] === 'antimatter'){
                        global.stats.antiplasmid += plasma;
                        global.race.Plasmid.anti += plasma;
                        unlockAchieve('cross');
                    }
                    else {
                        global.stats.plasmid += plasma;
                        global.race.Plasmid.count += plasma;
                    }
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
            let craft_costs = craftCost();
            Object.keys(craft_costs).forEach(function (craft){
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

        if (global.race['kindling_kindred']){
            global.civic.lumberjack.workers = 0;
            global.resource.Lumber.crates = 0;
            global.resource.Lumber.containers = 0;
            global.resource.Lumber.trade = 0;
        }
        if (global.race['kindling_kindred'] && global.city['foundry'] && global.city.foundry['Plywood']){
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

        if (global.race['cannibalize'] && global.city['s_alter']){
            if (global.city.s_alter.rage > 0){
                global.city.s_alter.rage--;
            }
            if (global.city.s_alter.regen > 0){
                global.city.s_alter.regen--;
            }
            if (global.city.s_alter.mind > 0){
                global.city.s_alter.mind--;
            }
            if (global.city.s_alter.mine > 0){
                global.city.s_alter.mine--;
            }
            if (global.city.s_alter.harvest > 0){
                global.city.s_alter.harvest--;
            }

            if ($(`#popcity-s_alter`).length > 0){
                updateDesc(actions.city.s_alter,'city','s_alter');
            }
        }

        if (global.tech['queue'] && global.queue.display){
            let idx = -1;
            let c_action = false;
            let stop = false;
            let deepScan = ['space','interstellar','portal'];
            let time = 0;
            let spent = { t: 0, r: {}};
            for (let i=0; i<global.queue.queue.length; i++){
                let struct = global.queue.queue[i];
                time = global.settings.qAny ? 0 : time;

                let t_action = false;
                if (deepScan.includes(struct.action)){
                    let scan = true;
                    Object.keys(actions[struct.action]).forEach(function (region){
                        if (actions[struct.action][region][struct.type] && scan){
                            t_action = actions[struct.action][region][struct.type];
                            scan = false;
                        }
                    });
                }
                else {
                    t_action = actions[struct.action][struct.type];
                }

                if (t_action['grant'] && global.tech[t_action.grant[0]] && global.tech[t_action.grant[0]] >= t_action.grant[1]){
                    global.queue.queue.splice(i,1);
                    break;
                }
                else {
                    if (checkAffordable(t_action,true)){
                        global.queue.queue[i].cna = false;
                        if (checkAffordable(t_action) && !stop){
                            c_action = t_action;
                            idx = i;
                        }
                        else {
                            time += global.settings.qAny ? timeCheck(t_action) : timeCheck(t_action, spent);
                        }
                        global.queue.queue[i]['time'] = time;
                        stop = global.settings.qAny ? false : true;
                    }
                    else {
                        global.queue.queue[i].cna = true;
                        global.queue.queue[i]['time'] = -1;
                    }
                }
                global.queue.queue[i].qa = global.settings.qAny ? true : false;
            }
            if (idx >= 0 && c_action){
                if (c_action.action()){
                    messageQueue(loc('build_success',[global.queue.queue[idx].label]),'success');
                    global.queue.queue.splice(idx,1);
                    if (c_action['grant']){
                        let tech = c_action.grant[0];
                        global.tech[tech] = c_action.grant[1];
                        removeAction(c_action.id);
                        drawCity();
                        drawTech();
                        space();
                        deepSpace();
                        renderFortress();
                    }
                    else if (c_action['refresh']){
                        removeAction(c_action.id);
                        drawCity();
                        drawTech();
                        space();
                        deepSpace();
                        renderFortress();
                    }
                    else {
                        drawCity();
                        space();
                        deepSpace();
                        renderFortress();
                    }
                }
            }
        }

        if (global.tech['r_queue'] && global.r_queue.display){
            let idx = -1;
            let c_action = false;
            let stop = false;
            let time = 0;
            let spent = { t: 0, r: {}};
            for (let i=0; i<global.r_queue.queue.length; i++){
                let struct = global.r_queue.queue[i];
                let t_action = actions[struct.action][struct.type];
                time = global.settings.qAny ? 0 : time;

                if (t_action['grant'] && global.tech[t_action.grant[0]] && global.tech[t_action.grant[0]] >= t_action.grant[1]){
                    global.r_queue.queue.splice(i,1);
                    break;
                }
                else {
                    if (checkAffordable(t_action,true)){
                        global.r_queue.queue[i].cna = false;
                        if (checkAffordable(t_action) && !stop){
                            c_action = t_action;
                            idx = i;
                        }
                        else {
                            time += global.settings.qAny ? timeCheck(t_action) : timeCheck(t_action, spent);
                        }
                        global.r_queue.queue[i]['time'] = time;
                        stop = global.settings.qAny ? false : true;
                    }
                    else {
                        global.r_queue.queue[i].cna = true;
                        global.r_queue.queue[i]['time'] = -1;
                    }
                }
                global.r_queue.queue[i].qa = global.settings.qAny ? true : false;
            }
            if (idx >= 0 && c_action){
                if (c_action.action()){
                    messageQueue(loc('research_success',[global.r_queue.queue[idx].label]),'success');
                    gainTech(global.r_queue.queue[idx].type);
                    global.r_queue.queue.splice(idx,1);
                }
            }
        }

        if (global.arpa.sequence && global.arpa.sequence['auto'] && global.tech['genetics'] && global.tech['genetics'] >= 8){
            buildGene();
        }

        if (global['loadFoundry']){
            loadFoundry();
            delete global['loadFoundry'];
        }

        checkAchievements();
    }

    resourceAlt();

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

let sythMap = {
    1: 1.1,
    2: 1.25,
    3: 1.5,
};

function longLoop(){
    if (global.race.species !== 'protoplasm'){
        
        if (global.portal['fortress']){
            bloodwar();
        }

        if (global.civic.govern.rev > 0){
            global.civic.govern.rev--;
        }
        if (global.civic.govern.fr > 0){
            global.civic.govern.fr--;
        }

        if (global.city.ptrait === 'trashed' || global.race['scavanger']){
            global.civic.scavenger.display = true;
        }
        else {
            global.civic.scavenger.display = false;
            global.civic.scavenger.workers = 0;
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
            let hc = global.city['hospital'] ? global.city['hospital'].count : 0;
            if (global.tech['medic'] && global.tech['medic'] >= 2){
                hc *= 2;
            }
            if (global.race['fibroblast']){
                hc += global.race['fibroblast'] * 2;
            }
            if (global.race['cannibalize'] && global.city['s_alter'] && global.city.s_alter.regen > 0){
                hc += 3
            }
            if (hc > 0){
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

        if (global.race['rainbow'] && global.race['rainbow'] > 1){
            global.race['rainbow']--;
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
                        if (Math.rand(0,2) === 0 && sky > 0){
                            sky--;
                        }
                        break;
                    case 'tundra':
                        if (global.city.calendar.season === 3){
                            temp = 0;
                        }
                        else if (Math.rand(0,2) === 0 && temp > 0){
                            temp--;
                        }
                        break;
                    case 'desert':
                        if (Math.rand(0,2) === 0 && sky < 4){
                            sky++;
                        }
                        break;
                    case 'volcanic':
                        if (global.city.calendar.season === 1){
                            temp = 2;
                        }
                        else if (Math.rand(0,2) === 0 && temp < 2){
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

                if (global.city.ptrait === 'stormy' && wind > 0 && Math.rand(0,2) === 0){
                    wind--;
                }

                if (sky === 0){
                    if (global.race['rainbow']){
                        global.race['rainbow'] = 1;
                    }
                    global.city.calendar.weather = 0;
                }
                else if (sky >= 1 && sky <= 2){
                    if (global.race['rainbow']){
                        global.race['rainbow'] = 1;
                    }
                    global.city.calendar.weather = 1;
                }
                else {
                    if (global.race['rainbow'] && global.city.calendar.weather === 0){
                        global.race['rainbow'] = Math.rand(10,20);
                    }
                    global.city.calendar.weather = 2;
                }
                if (temp === 0){ // Get colder
                    let new_temp = global.city.calendar.temp - 1;
                    if (new_temp < 0){
                        new_temp = 0;
                    }
                    if (global.city.calendar.season === 1 && new_temp === 0){
                        new_temp = 1;
                    }
                    if (new_temp === 0 && global.city.biome === 'hellscape'){
                        new_temp = 1;
                    }
                    if (new_temp === 0 && global.city.biome === 'eden' && global.city.calendar.season !== 3){
                        new_temp = 1;
                    }
                    global.city.calendar.temp = new_temp;
                }
                else if (temp === 2){ // Get hotter
                    let new_temp = global.city.calendar.temp + 1;
                    if (new_temp > 2){
                        new_temp = 2;
                    }
                    if (global.city.calendar.season === 3 && new_temp === 2){
                        new_temp = 1;
                    }
                    if (new_temp === 2 && global.city.biome === 'eden' && global.city.calendar.season !== 1){
                        new_temp = 1;
                    }
                    global.city.calendar.temp = new_temp;
                }

                global.city.calendar.wind = wind === 0 ? 1 : 0;
            }

            if (global.city.calendar.weather === 2){
                global.city.sun++;
            }
            else {
                global.city.sun = 0;
            }
            if (global.city.calendar.temp === 0){
                global.city.cold++;
            }
            else {
                global.city.cold = 0;
            }
            if (global.city.calendar.temp === 2){
                global.city.hot++;
            }
            else {
                global.city.hot = 0;
            }

            // Moon Phase
            global.city.calendar.moon++;
            if (global.city.calendar.moon > 27){
                global.city.calendar.moon = 0;
            }

            // Crafting
            if (global.tech['foundry'] && (global.city.calendar.moon === 0 || (global.city.calendar.moon === 14 && global.genes['crafty']))){
                let craft_costs = global.race['resourceful'] ? 0.9 : 1;
                let crafting_costs = craftCost();
                Object.keys(crafting_costs).forEach(function (craft){
                    let num = global.city.foundry[craft];
                    let craft_ratio = craftingRatio(craft);
                    if (global.tech['v_train']){
                        craft_ratio *= 2;
                    }
                    if (global.genes['crafty']){
                        craft_ratio *= 1 + ((global.genes.crafty - 1) * 0.5);
                    }
                    if (global.race['ambidextrous']){
                        craft_ratio *= 1 + (global.race['ambidextrous'] * 0.02);
                    }

                    let volume = Math.floor(global.resource[crafting_costs[craft][0].r].amount / (crafting_costs[craft][0].a * craft_costs));
                    for (let i=1; i<crafting_costs[craft].length; i++){
                        let temp = Math.floor(global.resource[crafting_costs[craft][i].r].amount / (crafting_costs[craft][i].a * craft_costs));
                        if (temp < volume){
                            volume = temp;
                        }
                    }
                    if (num < volume){
                        volume = num;
                    }
                    for (let i=0; i<crafting_costs[craft].length; i++){
                        let final = volume * crafting_costs[craft][i].a * craft_costs;
                        global.resource[crafting_costs[craft][i].r].amount -= final;
                    }
                    global.resource[craft].amount += craft_ratio * volume;

                    let sec = global.race['slow'] ? 1100 : (global.race['hyper'] ? 950 : 1000);
                    let time = global.genes['crafty'] ? 70000 : 140000;
                    global.resource[craft].diff = +((craft_ratio * volume) / (time / sec)).toFixed(5);
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

        if (global.settings['cLabels'] && $('#city-dist-outskirts').length === 0){
            drawCity();
        }
        if (!global.settings['cLabels'] && $('#city-dist-outskirts').length > 0){
            drawCity();
        }
    }

    // Event triggered
    if (!global.race.seeded || (global.race.seeded && global.race['chose'])){
        if (Math.rand(0,global.event) === 0){
            var event_pool = [];
            Object.keys(events).forEach(function (event){
                var isOk = true;
                if (events[event]['condition'] && !events[event].condition()){
                    isOk = false;
                }
                else if (events[event]['reqs']){
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
                            case 'notrait':
                                if (global.race[events[event].reqs[req]]){
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
                }
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

        if (global.civic.govern['protest'] && global.civic.govern.protest > 0){
            global.civic.govern.protest--;
        }

        {
            let extreme = global.tech['currency'] && global.tech['currency'] >= 5 ? true : false;
            let tax_cap = global.civic.govern.type === 'oligarchy' ? 40 : 30;
            if (extreme || global.race['terrifying']){
                tax_cap += 20;
            }
            if (global.race['noble']){
                if (global.civic.taxes.tax_rate > 20){
                    global.civic.taxes.tax_rate = 20;
                }
            }
            else if (global.civic.taxes.tax_rate > tax_cap){
                global.civic.taxes.tax_rate = tax_cap;
            }
        }

        if (!global.tech['whitehole'] && global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.exotic >= 0.025){
            global.tech['whitehole'] = 1;
            if (global.tech['stablized']){
                delete global.tech['stablized'];
            }
            messageQueue(loc('interstellar_blackhole_unstable'),'danger');
            drawTech();
        }

        if (global.arpa.sequence && global.arpa.sequence['auto'] && global.tech['genetics'] && global.tech['genetics'] === 7){
            buildGene();
        }
    }

    // Save game state
    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
}

function buildGene(){
    if (global.resource.Knowledge.amount >= 200000 && global.resource.Knowledge.amount >= global.resource.Knowledge.max - 10000){
        global.resource.Knowledge.amount -= 200000;
        let gene = global.genes['synthesis'] ? sythMap[global.genes['synthesis']] : 1;
        global.resource.Genes.amount += gene;
    }
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
        if (global.tech['high_tech'] && global.tech['high_tech'] >= 15 && p_on['citadel'] > 0){
            qbits *= 1 + (p_on['citadel'] * 0.05);
        }
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

function resourceAlt(){
    let alt = false;
    $('#resources .resource:visible').each(function(){
        if (alt){
            $(this).addClass('alt');
            alt = false;
        }
        else {
            $(this).removeClass('alt');
            alt = true;
        }
    });
    alt = false;
    $('#market .market-item:visible').each(function(){
        if (alt){
            $(this).addClass('alt');
            alt = false;
        }
        else {
            $(this).removeClass('alt');
            alt = true;
        }
    });
    $('#resStorage .market-item:visible').each(function(){
        if (alt){
            $(this).addClass('alt');
            alt = false;
        }
        else {
            $(this).removeClass('alt');
            alt = true;
        }
    });
}

function enableScript(){
    window.evolve = {
        actions: JSON.parse(JSON.stringify(actions)),
        races: JSON.parse(JSON.stringify(races)),
        tradeRatio: JSON.parse(JSON.stringify(tradeRatio)),
        craftCost: JSON.parse(JSON.stringify(craftCost())),
        atomic_mass: JSON.parse(JSON.stringify(atomic_mass)),
        global: {},
        breakdown: {},
        checkTechRequirements: checkTechRequirements,
    };
}
