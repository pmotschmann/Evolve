import { global, save, webWorker, poppers, resizeGame, breakdown, keyMultiplier, p_on, moon_on, red_on, belt_on, int_on, gal_on, set_qlevel, quantum_level } from './vars.js';
import { loc, locales } from './locale.js';
import { setupStats, unlockAchieve, checkAchievements, drawAchieve } from './achieve.js';
import { vBind, mainVue, popover, deepClone, timeCheck, arpaTimeCheck, timeFormat, powerModifier, modRes, messageQueue, calc_mastery, darkEffect, buildQueue, cleanBuildPopOver, getEaster, easterEgg, easterEggBind } from './functions.js';
import { races, traits, racialTrait, randomMinorTrait, biomes, planetTraits } from './races.js';
import { defineResources, resource_values, spatialReasoning, craftCost, plasmidBonus, tradeRatio, craftingRatio, crateValue, containerValue, tradeSellPrice, tradeBuyPrice, atomic_mass, galaxyOffers } from './resources.js';
import { defineJobs, job_desc, loadFoundry, farmerValue } from './jobs.js';
import { f_rate } from './industry.js';
import { defineGovernment, defineIndustry, defineGarrison, buildGarrison, foreignGov, checkControlling, garrisonSize, armyRating, govTitle } from './civics.js';
import { actions, updateDesc, challengeGeneHeader, challengeActionHeader, scenarioActionHeader, checkTechRequirements, addAction, storageMultipler, checkAffordable, drawCity, drawTech, gainTech, removeAction, evoProgress, housingLabel, wardenLabel, setPlanet, resQueue, bank_vault, start_cataclysm, cleanTechPopOver } from './actions.js';
import { renderSpace, fuel_adjust, int_fuel_adjust, zigguratBonus, setUniverse, universe_types, gatewayStorage, piracy } from './space.js';
import { renderFortress, bloodwar } from './portal.js';
import { arpa, arpaProjects, buildArpa } from './arpa.js';
import { events } from './events.js';
import { index } from './index.js';
import { getTopChange } from './wiki/change.js';

var intervals = {};
if (global.settings.expose){
    enableScript();
}

index();
if (global['beta']){
    $('#topBar .version > a').html(`v${global.version} Beta ${global.beta}`);
}
else {
    $('#topBar .version > a').html('v'+global.version);
}

if (global.lastMsg){
    messageQueue(global.lastMsg.m, global.lastMsg.c);
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
if (global.race.species !== 'protoplasm' && !global.race['start_cataclysm']){
    defineGarrison();
    buildGarrison($('#c_garrison'),false);
    foreignGov();
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

popover('morale',
    function(obj){
        if (global.city.morale.unemployed !== 0){
            let type = global.city.morale.unemployed > 0 ? 'success' : 'danger';
            obj.popper.append(`<p class="modal_bd"><span>${loc('morale_unemployed')}</span> <span class="has-text-${type}"> ${+(global.city.morale.unemployed).toFixed(1)}%</span></p>`);
        }
        if (global.city.morale.stress !== 0){
            let type = global.city.morale.stress > 0 ? 'success' : 'danger';
            obj.popper.append(`<p class="modal_bd"><span>${loc('morale_stress')}</span> <span class="has-text-${type}"> ${+(global.city.morale.stress).toFixed(1)}%</span></p>`);
        }

        let total = 100 + global.city.morale.unemployed + global.city.morale.stress;
        Object.keys(global.city.morale).forEach(function (morale){
            if (!['current','unemployed','stress','season'].includes(morale) && global.city.morale[morale] !== 0){
                total += global.city.morale[morale];
                let type = global.city.morale[morale] > 0 ? 'success' : 'danger';

                let value = global.city.morale[morale];
                if (morale === 'entertain' && global.civic.govern.type === 'democracy'){
                    value /= 1.2;
                }

                obj.popper.append(`<p class="modal_bd"><span>${loc(`morale_${morale}`)}</span> <span class="has-text-${type}"> ${+(value).toFixed(1)}%</span></p>`)
            
                if (morale === 'entertain' && global.civic.govern.type === 'democracy'){
                    obj.popper.append(`<p class="modal_bd"><span>ᄂ${loc('govern_democracy')}</span> <span class="has-text-success"> +20%</span></p>`);
                }
            }
        });

        if (global.city.morale.season !== 0){
            total += global.city.morale.season;
            let season = global.city.calendar.season === 0 ? loc('morale_spring') : global.city.calendar.season === 1 ? loc('morale_summer') : loc('morale_winter');
            let type = global.city.morale.season > 0 ? 'success' : 'danger';
            obj.popper.append(`<p class="modal_bd"><span>${season}</span> <span class="has-text-${type}"> ${+(global.city.morale.season).toFixed(1)}%</span></p>`);
        }

        if (global.civic.govern.type === 'corpocracy'){
            total -= 10;
            obj.popper.append(`<p class="modal_bd"><span>${loc('govern_corpocracy')}</span> <span class="has-text-danger"> -10%</span></p>`);
        }
        if (global.civic.govern.type === 'republic'){
            total += 20;
            obj.popper.append(`<p class="modal_bd"><span>${loc('govern_republic')}</span> <span class="has-text-success"> +20%</span></p>`);
        }
        if (global.civic.govern.type === 'federation'){
            total += 10;
            obj.popper.append(`<p class="modal_bd"><span>${loc('govern_federation')}</span> <span class="has-text-success"> +10%</span></p>`);
        }
    
        total = +(total).toFixed(1);
        if (total > moraleCap || total < 50){
            obj.popper.append(`<div class="modal_bd sum"><span>${loc('morale_current')}</span> <span class="has-text-warning"> ${+(global.city.morale.current).toFixed(1)}% (${total}%)</span></div>`);
        }
        else {
            obj.popper.append(`<div class="modal_bd sum"><span>${loc('morale_current')}</span> <span class="has-text-warning"> ${+(global.city.morale.current).toFixed(1)}%</span></div>`);
        }

        return undefined;
    },
    {
        classes: `has-background-light has-text-dark`
    }
);

var power_generated = {};
popover('powerStatus',function(obj){
        let drain = global.city.power_total - global.city.power;
        Object.keys(power_generated).forEach(function (k){
            if (power_generated[k]){
                let gen = +(power_generated[k]).toFixed(2);
                obj.popper.append(`<p class="modal_bd"><span>${k}</span> <span class="has-text-success">+${gen}</span></p>`);
            }
        });
        obj.popper.append(`<p class="modal_bd"><span>${loc('power_consumed')}</span> <span class="has-text-danger"> -${drain}</span></p>`);
        let avail = +(global.city.power).toFixed(2);
        if (global.city.power > 0){
            obj.popper.append(`<p class="modal_bd sum"><span>${loc('power_available')}</span> <span class="has-text-success">${avail}</span></p>`);
        }
        else {
            obj.popper.append(`<p class="modal_bd sum"><span>${loc('power_available')}</span> <span class="has-text-danger">${avail}</span></p>`);
        }
    },
    {
        classes: `has-background-light has-text-dark`
    }
);

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
                return loc('moon1'); // New Moon
            }
            else if (global.city.calendar.moon > 0 && global.city.calendar.moon < 7){
                return loc('moon2'); // Waxing Crescent Moon
            }
            else if (global.city.calendar.moon === 7){
                return loc('moon3'); // First Quarter Moon
            }
            else if (global.city.calendar.moon > 7 && global.city.calendar.moon < 14){
                return loc('moon4'); // Waxing Gibbous Moon
            }
            else if (global.city.calendar.moon === 14){
                return loc('moon5'); // Full Moon
            }
            else if (global.city.calendar.moon > 14 && global.city.calendar.moon < 21){
                return loc('moon6'); // Waning Gibbous Moon
            }
            else if (global.city.calendar.moon === 21){
                return loc('moon7'); // Third Quarter Moon
            }
            else if (global.city.calendar.moon > 21){
                return loc('moon8'); // Waning Crescent Moon
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

popover('topBarPlanet',
    function(obj){
        if (global.race.species === 'protoplasm'){
            obj.popper.append($(`<span>${loc('infant')}</span>`));
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

            let geo_traits = ``;
            if (Object.keys(global.city.geology).length > 0){
                let good = ``;
                let bad = ``;
                let numShow = global.stats.achieve['miners_dream'] ? (global.stats.achieve['miners_dream'].l >= 4 ? global.stats.achieve['miners_dream'].l * 2 - 3 : global.stats.achieve['miners_dream'].l) : 0;
                for (let key in global.city.geology){
                    if (key !== 0){
                        if (global.city.geology[key] > 0) {
                            let res_val = `<div class="has-text-advanced">${loc(`resource_${key}_name`)}`;
                            if (numShow > 0) {
                                res_val += `: <span class="has-text-success">+${Math.round((global.city.geology[key] + 1) * 100 - 100)}%</span>`;
                                numShow--;
                            }
                            else {
                                res_val += `: <span class="has-text-success">${loc('bonus')}</span>`;
                            }
                            res_val += `</div>`;
                            good = good + res_val;
                        }
                        else if (global.city.geology[key] < 0){
                            let res_val = `<div class="has-text-caution">${loc(`resource_${key}_name`)}`;
                            if (numShow > 0) {
                                res_val += `: <span class="has-text-danger">${Math.round((global.city.geology[key] + 1) * 100 - 100)}%</span>`;
                                numShow--;
                            }
                            else {
                                res_val += `: <span class="has-text-danger">${loc('malus')}</span>`;
                            }
                            res_val += `</div>`;
                            bad = bad + res_val
                        }
                    }
                }
                geo_traits = `<div class="flexAround">${good}${bad}</div>`;
            }

            let challenges = '';
            if (global.race['junker']){
                challenges = challenges + `<div>${loc('evo_challenge_junker_desc')}</div>`;
            }
            if (global.race['joyless']){
                challenges = challenges + `<div>${loc('evo_challenge_joyless_desc')}</div>`;
            }
            if (global.race['steelen']){
                challenges = challenges + `<div>${loc('evo_challenge_steelen_desc')}</div>`;
            }
            if (global.race['decay']){
                challenges = challenges + `<div>${loc('evo_challenge_decay_desc')}</div>`;
            }
            if (global.race['emfield']){
                challenges = challenges + `<div>${loc('evo_challenge_emfield_desc')}</div>`;
            }

            if (global.race['cataclysm']){
                if (calc_mastery() >= 50 && global.race.universe !== 'antimatter'){
                    challenges = challenges + `<div>${loc('evo_challenge_cataclysm_desc')}</div><div class="has-text-caution">${loc('evo_challenge_cataclysm_warn')}</div>`;
                }
                else {
                    challenges = challenges + `<div>${loc('evo_challenge_cataclysm_desc')}</div><div class="has-text-danger">${loc('evo_challenge_scenario_warn')}</div>`;
                }
            }
            obj.popper.append($(`<div>${loc(global.race['cataclysm'] ? 'no_home' : 'home',[planet,race,planet_label,orbit])}</div>${geo_traits}${challenges}`));
        }
        return undefined;
    },
    {
        elm: `#topBar .planetWrap .planet`,
        classes: `has-background-light has-text-dark`
    }
);

popover('topBarUniverse',
    function(obj){
        obj.popper.append($(`<div>${universe_types[global.race.universe].desc}</div>`));
        obj.popper.append($(`<div>${universe_types[global.race.universe].effect}</div>`));
        return undefined;
    },
    {
        elm: `#topBar .planetWrap .universe`,
        classes: `has-background-light has-text-dark`
    }
);

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
        let late_actions = ['multicellular','spores','poikilohydric','bilateral_symmetry','bryophyte','athropods','mammals','eggshell','endothermic','ectothermic','humanoid','gigantism','dwarfism','animalism','aquatic','fey','sand','heat','polar','demonic','angelic','sentience','bunker'];
        for (var i = 0; i < late_actions.length; i++){
            if (global.evolution[late_actions[i]] && global.evolution[late_actions[i]].count == 0){
                addAction('evolution',late_actions[i]);
            }
        }

        let race_options = ['human','orc','elven','troll','ogre','cyclops','kobold','goblin','gnome','cath','wolven','centaur','tortoisan','gecko','slitheryn','arraak','pterodacti','dracnid','sporgar','shroomi','moldling','mantis','scorpid','antid','entish','cacti','pinguicula','sharkin','octigoran','imp','balorg','seraph','unicorn','dryad','satyr','phoenix','salamander','yeti','wendigo','tuskin','kamel'];

        const custom_map = {
            humanoid: 'humanoid',
            animal: 'animalism',
            small: 'dwarfism',
            giant : 'gigantism',
            reptilian: 'ectothermic',
            avian: 'endothermic',
            insectoid: 'athropods',
            plant: 'chloroplasts',
            fungi: 'chitin',
            aquatic: 'aquatic',
            fey: 'fey',
            heat: 'heat',
            polar: 'polar',
            sand: 'sand',
            demonic: 'demonic',
            angelic: 'celestial'
        };

        if (races.custom.hasOwnProperty('type') && global.evolution[custom_map[races.custom.type]] && global.evolution[custom_map[races.custom.type]].count > 0){
            race_options.push('custom');
        }

        for (var i = 0; i < race_options.length; i++){
            if (global.evolution[race_options[i]] && global.evolution[race_options[i]].count == 0){
                addAction('evolution',race_options[i]);
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

        challengeActionHeader();
        var challenge_actions = ['joyless','steelen','decay','emfield'];
        for (var i = 0; i < challenge_actions.length; i++){
            if (global.evolution[challenge_actions[i]] && global.evolution[challenge_actions[i]].count == 0){
                addAction('evolution',challenge_actions[i]);
            }
        }

        scenarioActionHeader();
        var challenge_actions = ['junker','cataclysm'];
        for (var i = 0; i < challenge_actions.length; i++){
            if (global.evolution[challenge_actions[i]] && global.evolution[challenge_actions[i]].count == 0){
                addAction('evolution',challenge_actions[i]);
            }
        }
    }
}
else {
    if (global.portal.hasOwnProperty('soul_forge') && global.portal.soul_forge.on){
        p_on['soul_forge'] = 1;
    }
    drawCity();
    drawTech();
    renderSpace();
    renderFortress();
    setWeather();
}

setupStats();
q_check(true);

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
    webWorker.w = new Worker("evolve/evolve.js");
    webWorker.w.postMessage({ loop: 'short', period: main_timer });
    webWorker.w.postMessage({ loop: 'mid', period: mid_timer });
    webWorker.w.postMessage({ loop: 'long', period: long_timer });
    webWorker.w.addEventListener('message', function(e){
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

var firstRun = true;
var gene_sequence = global.arpa['sequence'] && global.arpa['sequence']['on'] ? global.arpa.sequence.on : 0;
function fastLoop(){
    keyMultiplier();
    const date = new Date();

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
        if ((global.race['cataclysm'] && global.space.ziggurat.count) || (global.city['temple'] && global.city['temple'].count)){
            let temple_bonus = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 0.016 : 0.01;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                temple_bonus += global.civic.professor.workers * (global.race.universe === 'antimatter' ? 0.0002 : 0.0004);
            }
            if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                let priest_bonus = global.genes['ancients'] >= 5 ? 0.00015 : (global.genes['ancients'] >= 3 ? 0.000125 : 0.0001);
                temple_bonus += priest_bonus * global.civic.priest.workers;
            }
            if (global.race.universe === 'antimatter'){
                temple_bonus /= 2;
            }
            if (global.race['spiritual']){
                temple_bonus *= 1 + (traits.spiritual.vars[0] / 100);
            }
            if (global.civic.govern.type === 'theocracy'){
                temple_bonus *= 1.12;
            }

            let faith = (global.race['cataclysm'] ? global.space.ziggurat.count : global.city.temple.count) * temple_bonus ;
            breakdown.p['Global'][loc('faith')] = (faith * 100) + '%';
            global_multiplier *= (1 + faith);
        }
    }
    if (global.race['ascended']){
        breakdown.p['Global'][loc('achieve_ascended_name')] = `5%`;
        global_multiplier *= 1.05;
    }
    if (global.race['untapped']){
        if (global.race['untapped'] > 0){
            breakdown.p['Global'][loc('trait_untapped_bd')] = `${global.race.untapped / 2}%`;
            global_multiplier *= 1 + (global.race.untapped / 200);
        }
    }
    if (global.race['rainbow'] && global.race['rainbow'] > 1){
        breakdown.p['Global'][loc('trait_rainbow_bd')] = `${traits.rainbow.vars[0]}%`;
        global_multiplier *= 1 + (traits.rainbow.vars[0] / 100);
    }
    if (global.tech['world_control']){
        breakdown.p['Global'][loc('tech_unification')] = global.civic.govern.type === 'federation' ? '32%' : '25%';
        global_multiplier *= global.civic.govern.type === 'federation' ? 1.32 : 1.25;
    }
    else {
        let occupy = 0;
        for (let i=0; i<3; i++){
            if (global.civic.foreign[`gov${i}`].occ || global.civic.foreign[`gov${i}`].anx || global.civic.foreign[`gov${i}`].buy){
                occupy += global.civic.govern.type === 'federation' ? 8 : 5;
            }
        }
        if (occupy > 0){
            breakdown.p['Global'][loc('civics_garrison_occupy')] = `${occupy}%`;
            global_multiplier *= 1 + (occupy / 100);
        }
    }
    if (global.genes['challenge'] && global.genes['challenge'] >= 2){
        let mastery = calc_mastery();
        breakdown.p['Global'][loc('mastery')] = mastery + '%';
        global_multiplier *= 1 + (mastery / 100);
    }
    if (global.race['suction_grip']){
        breakdown.p['Global'][loc('trait_suction_grip_bd')] = '8%';
        global_multiplier *= 1 + (traits.suction_grip.vars[0] / 100);
    }
    if (global.race['intelligent']){
        let bonus = (global.civic.scientist.workers * traits.intelligent.vars[1]) + (global.civic.professor.workers * traits.intelligent.vars[0]);
        breakdown.p['Global'][loc('trait_intelligent_bd')] = bonus+'%';
        global_multiplier *= 1 + (bonus / 100);
    }
    if (global.race['slaver'] && global.city['slave_pen'] && global.city['slave_pen']){
        let bonus = (global.city.slave_pen.slaves * 0.28);
        breakdown.p['Global'][loc('trait_slaver_bd')] = bonus+'%';
        global_multiplier *= 1 + (bonus / 100);
    }
    if ((global.city.ptrait === 'trashed' || global.race['scavenger']) && global.civic['scavenger'] && global.civic.scavenger.workers > 0){
        let bonus = (global.civic.scavenger.workers * global.civic.scavenger.impact);
        if (global.city.ptrait === 'trashed' && global.race['scavenger']){
            bonus *= 1 + (traits.scavenger.vars[0] / 100);
        }
        breakdown.p['Global'][loc('job_scavenger')] = bonus+'%';
        global_multiplier *= 1 + (bonus / 100);
    }
    if (global.city.ptrait === 'mellow'){
        breakdown.p['Global'][loc('planet_mellow_bd')] = '-10%';
        global_multiplier *= planetTraits.mellow.vars[2];
    }
    if (global.city.ptrait === 'ozone' && global.city['sun']){
        let uv = global.city['sun'] * 0.25;
        breakdown.p['Global'][loc('planet_ozone_bd')] = `-${uv}%`;
        global_multiplier *= 1 - (uv / 100);
    }
    if (global.race['smoldering'] && global.city['hot']){
        let heat = 0;
        if (global.city['hot'] > 100){
            heat += 100 * traits.smoldering.vars[1];
            heat += (global.city['hot'] - 100) * traits.smoldering.vars[2];
        }
        else {
            heat = global.city['hot'] * traits.smoldering.vars[1];
        }
        breakdown.p['Global'][loc('hot')] = `${heat}%`;
        global_multiplier *= 1 + (heat / 100);
    }
    if (global.race['heat_intolerance'] && global.city['hot']){
        let heat = global.city['hot'] * traits.heat_intolerance.vars[0];
        breakdown.p['Global'][loc('hot')] = `-${heat}%`;
        global_multiplier *= 1 - (heat / 100);
    }
    if (global.race['chilled'] && global.city['cold']){
        let cold = 0;
        if (global.city['cold'] > 100){
            cold += 100 * traits.chilled.vars[1];
            cold += (global.city['cold'] - 100) * traits.chilled.vars[2];
        }
        else {
            cold = global.city['cold'] * traits.chilled.vars[1];
        }
        breakdown.p['Global'][loc('cold')] = `${cold}%`;
        global_multiplier *= 1 + (cold / 100);
    }
    if (global.race['cold_intolerance'] && global.city['cold']){
        let cold = global.city['cold'] * traits.cold_intolerance.vars[0];
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
    if (global.city['firestorm'] && global.city.firestorm > 0){
        global.city.firestorm--;
        breakdown.p['Global'][loc('event_flare_bd')] = `-${20}%`;
        global_multiplier *= 0.8;
    }
    if (global.race['hibernator'] && global.city.calendar.season === 3){
        global_multiplier *= 1 - (traits.hibernator.vars[1] / 100);
        breakdown.p['Global'][loc('morale_winter')] = `-${traits.hibernator.vars[1]}%`;
    }

    breakdown.p['consume'] = {
        Money: {},
        Mana: {},
        Knowledge: {},
        Food: {},
        Lumber: {},
        Stone: {},
        Crystal: {},
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
        Bolognium: {},
        Vitreloy: {},
        Orichalcum: {},
        Plywood: {},
        Brick: {},
        Wrought_Iron: {},
        Sheet_Metal: {},
        Mythril: {},
        Aerogel: {},
        Nanoweave: {},
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
            if ((global.evolution['bilateral_symmetry'] && global.evolution['bilateral_symmetry'].count > 0) || (global.evolution['poikilohydric'] && global.evolution['poikilohydric'].count > 0) || (global.evolution['spores'] && global.evolution['spores'].count > 0)){
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

        if (global.stats.feat['novice'] && global.race.universe !== 'bigbang' && (!global.race.seeded || (global.race.seeded && global.race['chose']))){
            modRes('RNA', (global.stats.feat['novice'] / 2) * time_multiplier * global_multiplier);
            if (global.resource.DNA.display){
                modRes('DNA', (global.stats.feat['novice'] / 4) * time_multiplier * global_multiplier);
            }
        }
        // Detect new unlocks
        if (global['resource']['RNA'].amount >= 2 && !global.evolution['dna']){
            global.evolution['dna'] = 1;
            addAction('evolution','dna');
            global.resource.DNA.display = true;
            if (global.stats.achieve['mass_extinction'] && global.stats.achieve['mass_extinction'].l > 1){
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
            morale += traits.smoldering.vars[0];
            global.city.morale.season = traits.smoldering.vars[0];
        }
        else if (global.city.calendar.season === 3){ // Winter
            if (global.race['chilled']){
                morale += traits.chilled.vars[0];
                global.city.morale.season = traits.chilled.vars[0];
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
            morale -= 10;
        }
        if (global.civic.govern.type === 'republic'){
            morale += 20;
        }
        if (global.civic.govern.type === 'federation'){
            morale += 10;
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
                        weather_morale = -(traits.skittish.vars[0]);
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
                weather_morale = -(traits.nyctophilia.vars[0]);
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
                weather_morale = traits.nyctophilia.vars[1];
            }
        }
        if (global.race['snowy'] && (global.city.calendar.temp !== 0 || global.city.calendar.weather !== 0)){
            weather_morale -= global.city.calendar.temp >= 2 ? traits.snowy.vars[1] : traits.snowy.vars[0];
        }

        global.city.morale.weather = global.race['submerged'] ? 0 : weather_morale;
        morale += global.race['submerged'] ? 0 : weather_morale;

        let stress = 0;
        if (!global.race['carnivore'] && !global.race['soul_eater']){
            if (global.city.ptrait !== 'mellow'){
                morale -= global.civic.free;
                global.city.morale.unemployed = -(global.civic.free);
            }
        }
        else {
            let divisor = 5;
            if (global.city.ptrait === 'mellow'){
                divisor *= planetTraits.mellow.vars[0];
            }
            stress -= global.civic.free / divisor;
            global.city.morale.unemployed = 0;
        }

        if (global.race['optimistic']){
            stress += traits.optimistic.vars[0];
        }

        if (global.race['pessimistic']){
            stress -= traits.pessimistic.vars[0];
        }

        if (global.civic['garrison']){
            let divisor = 2;
            if (global.city.ptrait === 'mellow'){
                divisor *= planetTraits.mellow.vars[0];
            }
            stress -= global.civic.garrison.max / divisor;
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
                        let rate = tradeRatio[res];
                        if (global.race['persuasive']){
                            rate *= 1 + (global.race['persuasive'] / 100);
                        }
                        if (global.genes['trader']){
                            let mastery = calc_mastery();
                            rate *= 1 + (mastery / 100);
                        }
                        modRes(res,global.resource[res].trade * time_multiplier * rate);
                        modRes('Money', -(price * time_multiplier));
                        breakdown.p.consume.Money[loc('trade')] -= price;
                        breakdown.p.consume[res][loc('trade')] = global.resource[res].trade * rate;
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

        if (global.galaxy['trade'] && (gal_on.hasOwnProperty('freighter') || gal_on.hasOwnProperty('super_freighter'))){
            let cap = 0;
            if (global.galaxy['freighter']){
                cap += gal_on['freighter'] * 2;
            }
            if (global.galaxy['super_freighter']){
                cap += gal_on['super_freighter'] * 5;
            }
            global.galaxy.trade.max = cap;

            let used = 0;
            for (let i=0; i<galaxyOffers.length; i++){
                let exprt_res = galaxyOffers[i].sell.res;
                let exprt_vol = galaxyOffers[i].sell.vol;
                let imprt_res = galaxyOffers[i].buy.res;
                let imprt_vol = galaxyOffers[i].buy.vol;
                let exp_total = 0;
                let imp_total = 0;

                if (global.race['persuasive']){
                    imprt_vol *= 1 + (global.race['persuasive'] / 100);
                }
                if (global.genes['trader']){
                    let mastery = calc_mastery();
                    imprt_vol *= 1 + (mastery / 100);
                }

                used += global.galaxy.trade[`f${i}`];
                if (used > cap){
                    global.galaxy.trade[`f${i}`] -= used - cap;
                    if (global.galaxy.trade[`f${i}`] < 0){
                        global.galaxy.trade[`f${i}`] = 0;
                    }
                }

                let pirate = piracy('gxy_gorddon');
                for (let j=0; j<global.galaxy.trade[`f${i}`]; j++){
                    exp_total += exprt_vol;
                    if (modRes(exprt_res,-(exprt_vol * time_multiplier))){
                        modRes(imprt_res,imprt_vol * time_multiplier * pirate);
                        imp_total += imprt_vol;
                    }
                }

                if (exp_total > 0){
                    if (breakdown.p.consume[exprt_res][loc('trade')]){
                        breakdown.p.consume[exprt_res][loc('trade')] -= exp_total;
                    }
                    else {
                        breakdown.p.consume[exprt_res][loc('trade')] = -(exp_total);
                    }
                }

                if (imp_total > 0){
                    if (breakdown.p.consume[imprt_res][loc('trade')]){
                        breakdown.p.consume[imprt_res][loc('trade')] += imp_total;
                    }
                    else {
                        breakdown.p.consume[imprt_res][loc('trade')] = imp_total;
                    }
                }

                if (pirate < 1){
                    if (breakdown.p.consume[imprt_res][loc('galaxy_piracy')]){
                        breakdown.p.consume[imprt_res][loc('galaxy_piracy')] += -((1 - pirate) * imp_total);
                    }
                    else {
                        breakdown.p.consume[imprt_res][loc('galaxy_piracy')] = -((1 - pirate) * imp_total);
                    }
                }

                if (breakdown.p.consume[exprt_res][loc('trade')] === 0){
                    delete breakdown.p.consume[exprt_res][loc('trade')]
                }
                if (breakdown.p.consume[imprt_res][loc('trade')] === 0){
                    delete breakdown.p.consume[imprt_res][loc('trade')]
                }
            }
            global.galaxy.trade.cur = used;
        }

        let power_grid = 0;
        let max_power = 0;

        if (global.interstellar['orichalcum_sphere'] && global.interstellar.orichalcum_sphere.count > 0){
            let output = 0;
            if (global.interstellar.orichalcum_sphere.count >= 100){
                output = powerModifier(1750);
            }
            else {
                output = powerModifier(750 + (global.interstellar.orichalcum_sphere.count * 8));
            }
            max_power -= output;
            power_grid += output;
            power_generated[loc('interstellar_dyson_sphere_title')] = output;
            delete power_generated[loc('tech_dyson_net')];
        }
        else if (global.interstellar['dyson_sphere'] && global.interstellar.dyson_sphere.count > 0){
            let output = 0;
            if (global.interstellar.dyson_sphere.count >= 100){
                output = powerModifier(750);
            }
            else {
                output = powerModifier(175 + (global.interstellar.dyson_sphere.count * 5));
            }
            max_power -= output;
            power_grid += output;
            power_generated[loc('interstellar_dyson_sphere_title')] = output;
            delete power_generated[loc('tech_dyson_net')];
        }
        else if (global.interstellar['dyson'] && global.interstellar.dyson.count >= 1){
            let output = 0;
            if (global.interstellar.dyson.count >= 100){
                output = powerModifier(175);
            }
            else {
                output = powerModifier(global.interstellar.dyson.count * 1.25);
            }
            max_power -= output;
            power_grid += output;
            power_generated[loc('tech_dyson_net')] = output;
        }

        if (global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.count >= 100){
            let waves = global.tech['gravity'] && global.tech['gravity'] >= 2 ? 13.5 : 7.5;
            let r_mass = global.interstellar.stellar_engine.mass;
            if (global.tech['roid_eject']){
                r_mass += 0.35 * global.tech['roid_eject'] * (1 + (global.tech['roid_eject'] / 10));
            }
            let power = powerModifier(20 + ((r_mass - 8) * waves) + (global.interstellar.stellar_engine.exotic * waves * 10));
            max_power -= power;
            power_grid += power;
            power_generated[loc('tech_stellar_engine')] = power;
        }

        let uranium_bd = {};
        if (global.city['coal_power']){
            let power = global.city.coal_power.on * actions.city.coal_power.powered();
            let consume = global.city.coal_power.on * (global.race['environmentalist'] ? 0 : 0.35);
            while ((consume * time_multiplier) > global.resource.Coal.amount && consume > 0){
                power -= actions.city.coal_power.powered();
                consume -= 0.35;
            }
            breakdown.p.consume.Coal[loc('powerplant')] = -(consume);
            modRes('Coal', -(consume * time_multiplier));

            max_power += power;
            power_grid -= power;
            power_generated[global.race['environmentalist'] ? loc('city_hydro_power') : loc('city_coal_power')] = -(power);

            // Uranium
            if (!global.race['environmentalist'] && global.tech['uranium'] && global.tech['uranium'] >= 3){
                uranium_bd[loc('city_coal_ash')] = (consume / 65 / global_multiplier);
                modRes('Uranium', (consume * time_multiplier) / 65);
            }
        }

        if (global.city['oil_power']){
            let power = global.city.oil_power.on * actions.city.oil_power.powered();
            let consume = global.city.oil_power.on * (global.race['environmentalist'] ? 0 : 0.65);
            while ((consume * time_multiplier) > global.resource.Oil.amount && consume > 0){
                power -= actions.city.oil_power.powered();
                consume -= 0.65;
            }
            breakdown.p.consume.Oil[loc('powerplant')] = -(consume);
            modRes('Oil', -(consume * time_multiplier));

            max_power += power;
            power_grid -= power;
            power_generated[global.race['environmentalist'] ? loc('city_wind_power') : loc('city_oil_power')] = -(power);
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
                power -= output;
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
            let solar = 0.35;
            if (global.tech.swarm >= 4){
                solar += 0.15 * (global.tech.swarm - 3);
            }
            if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 1){ solar += 0.15; }
            solar = +(solar).toFixed(2);
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
            let power = powerModifier(global.race['environmentalist'] ? (global.city.windmill.count * 1.5) : global.city.windmill.count);
            max_power -= power;
            power_grid += power;
            power_generated[loc('city_mill_title2')] = power;
        }

        // Power usage
        let p_structs = [
            'city:apartment','int_alpha:habitat','int_alpha:luxury_condo','spc_red:spaceport','int_alpha:starport','int_blackhole:s_gate','gxy_gateway:starbase','gxy_gateway:ship_dock','int_neutron:stellar_forge',
            'int_neutron:citadel','city:coal_mine','spc_moon:moon_base','spc_red:red_tower','spc_home:nav_beacon','int_proxima:xfer_station','gxy_stargate:telemetry_beacon',
            'int_nebula:nexus','gxy_stargate:gateway_depot','spc_dwarf:elerium_contain','spc_gas:gas_mining','spc_belt:space_station','spc_gas_moon:outpost','gxy_gorddon:embassy',
            'gxy_gorddon:dormitory','gxy_alien1:resort','spc_gas_moon:oil_extractor','int_alpha:int_factory','city:factory','spc_red:red_factory','spc_dwarf:world_controller',
            'prtl_fortress:turret','prtl_badlands:war_drone','city:wardenclyffe','city:biolab','city:mine','city:rock_quarry','city:cement_plant','city:sawmill','city:mass_driver',
            'int_neutron:neutron_miner','prtl_fortress:war_droid','prtl_pit:soul_forge','gxy_chthonian:excavator','int_blackhole:far_reach','prtl_badlands:sensor_drone',
            'prtl_badlands:attractor','city:metal_refinery','gxy_stargate:gateway_station','gxy_alien1:vitreloy_plant','gxy_alien2:foothold','gxy_gorddon:symposium',
            'int_blackhole:mass_ejector','city:casino','spc_hell:spc_casino','prtl_fortress:repair_droid','gxy_stargate:defense_platform','prtl_pit:gun_emplacement','prtl_pit:soul_attractor','int_sirius:ascension_trigger'];
        for (var i = 0; i < p_structs.length; i++){
            let parts = p_structs[i].split(":");
            let space = parts[0].substr(0,4) === 'spc_' ? 'space' : (parts[0].substr(0,5) === 'prtl_' ? 'portal' : (parts[0].substr(0,4) === 'gxy_' ? 'galaxy' : 'interstellar'));
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

        if (p_on['s_gate'] && p_on['foothold']){
            let increment = 2.5;
            let consume = (p_on['foothold'] * increment);
            while (consume * time_multiplier > global.resource['Elerium'].amount && consume > 0){
                consume -= increment;
                p_on['foothold']--;
            }
            breakdown.p.consume.Elerium[loc('galaxy_foothold')] = -(consume);
            let number = consume * time_multiplier;
            modRes('Elerium', -(number));
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
            global.space.moon_base.s_max = p_on['moon_base'] * actions.space.spc_moon.moon_base.support();
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

        if (p_on['int_factory'] && p_on['int_factory'] > 0){
            let d_consume = p_on['int_factory'] * int_fuel_adjust(5);
            modRes('Deuterium',-(d_consume * time_multiplier));
            breakdown.p.consume.Deuterium[loc('interstellar_int_factory_title')] = -(d_consume);
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
            global.space.spaceport.s_max = p_on['spaceport'] * actions.space.spc_red.spaceport.support();
            global.space.spaceport.s_max += global.tech['mars'] && global.tech['mars'] >= 3 ? (global.race['cataclysm'] ? p_on['red_tower'] * 2 : p_on['red_tower']) : 0;
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

        // Starports
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
            global.interstellar.starport.s_max = p_on['starport'] * actions.interstellar.int_alpha.starport.support();
            global.interstellar.starport.s_max += p_on['habitat'] * actions.interstellar.int_alpha.habitat.support();
            global.interstellar.starport.s_max += p_on['xfer_station'] * actions.interstellar.int_proxima.xfer_station.support();
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

        // Starbase
        if (global.galaxy['starbase'] && global.galaxy['starbase'].count > 0){
            let fuel_cost = +int_fuel_adjust(25);
            let mb_consume = p_on['starbase'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('galaxy_starbase')] = -(mb_consume);
            for (let i=0; i<p_on['starbase']; i++){
                if (!modRes('Helium_3', -(time_multiplier * fuel_cost))){
                    mb_consume -= (p_on['starbase'] * fuel_cost) - (i * fuel_cost);
                    p_on['starbase'] -= i;
                    break;
                }
            }
            global.galaxy.starbase.s_max = p_on['starbase'] * actions.galaxy.gxy_gateway.starbase.support();
            if (p_on['gateway_station']){
                global.galaxy.starbase.s_max += p_on['gateway_station'] * actions.galaxy.gxy_stargate.gateway_station.support();
            }
            if (p_on['telemetry_beacon']){
                global.galaxy.starbase.s_max += p_on['telemetry_beacon'] * actions.galaxy.gxy_stargate.telemetry_beacon.support();
            }
            if (p_on['ship_dock']){
                global.galaxy.starbase.s_max += p_on['ship_dock'] * actions.galaxy.gxy_gateway.ship_dock.support();
            }
        }

        if (global.galaxy['starbase']){
            let used_support = 0;
            let gateway_structs = ['bolognium_ship','dreadnought','cruiser_ship','frigate_ship','corvette_ship','scout_ship'];
            for (var i = 0; i < gateway_structs.length; i++){
                if (global.galaxy[gateway_structs[i]]){
                    let operating = global.galaxy[gateway_structs[i]].on;
                    let id = actions.galaxy.gxy_gateway[gateway_structs[i]].id;
                    if (used_support + operating > global.galaxy.starbase.s_max){
                        operating -= (used_support + operating) - global.galaxy.starbase.s_max;
                        $(`#${id} .on`).addClass('warn');
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                    }
                    used_support += operating * -(actions.galaxy.gxy_gateway[gateway_structs[i]].support());
                    gal_on[gateway_structs[i]] = operating;
                }
                else {
                    gal_on[gateway_structs[i]] = 0;
                }
            }
            global.galaxy.starbase.support = used_support;
        }

        // Foothold
        if (global.galaxy['foothold'] && global.galaxy.foothold.count > 0){
            global.galaxy.foothold.s_max = p_on['foothold'] * actions.galaxy.gxy_alien2.foothold.support();

            let used_support = 0;
            let foothold_structs = ['armed_miner','ore_processor','scavenger'];
            for (var i = 0; i < foothold_structs.length; i++){
                if (global.galaxy[foothold_structs[i]]){
                    let operating = global.galaxy[foothold_structs[i]].on;
                    let id = actions.galaxy.gxy_alien2[foothold_structs[i]].id;
                    if (used_support + operating > global.galaxy.foothold.s_max){
                        operating -= (used_support + operating) - global.galaxy.foothold.s_max;
                        $(`#${id} .on`).addClass('warn');
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                    }
                    used_support += operating * -(actions.galaxy.gxy_alien2[foothold_structs[i]].support());
                    gal_on[foothold_structs[i]] = operating;
                }
                else {
                    gal_on[foothold_structs[i]] = 0;
                }
            }
            global.galaxy.foothold.support = used_support;
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
                    if (used_support + (operating * -(actions.space.spc_belt[belt_structs[i]].support())) > global.space.space_station.s_max){
                        let excess = used_support + (operating * -(actions.space.spc_belt[belt_structs[i]].support())) - global.space.space_station.s_max;
                        operating -= Math.ceil(excess / -(actions.space.spc_belt[belt_structs[i]].support()));
                        $(`#${id} .on`).addClass('warn');
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                    }
                    used_support += (operating * -(actions.space.spc_belt[belt_structs[i]].support()));
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
            global.interstellar.nexus.s_max = p_on['nexus'] * actions.interstellar.int_nebula.nexus.support();
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

        // Stargate
        if (p_on['s_gate']){
            if (!global.settings.showGalactic){
                global.settings.showGalactic = true;
                global.settings.space.stargate = true;
                renderSpace();
            }
        }
        else {
            global.settings.showGalactic = false;
            global.settings.space.stargate = false;
        }

        var galaxy_ship_types = [
            {
                region: 'gxy_gateway',
                ships: ['bolognium_ship','dreadnought','cruiser_ship','frigate_ship','corvette_ship','scout_ship']
            },
            {
                region: 'gxy_gorddon',
                ships: ['freighter'],
                req: 'embassy'
            },
            {
                region: 'gxy_alien1',
                ships: ['super_freighter'],
                req: 'embassy'
            },
            {
                region: 'gxy_alien2',
                ships: ['armed_miner','scavenger'],
                req: 'foothold'
            },
            {
                region: 'gxy_chthonian',
                ships: ['minelayer','raider'],
                req: 'starbase'
            }
        ];

        let crew_civ = 0;
        let crew_mil = 0;
        let total = 0;
        for (let j=0; j<galaxy_ship_types.length; j++){
            let region = galaxy_ship_types[j].region;
            for (let i=0; i<galaxy_ship_types[j].ships.length; i++){
                let ship = galaxy_ship_types[j].ships[i];

                if (global.galaxy[ship] && global.galaxy[ship].hasOwnProperty('on')){
                    if (actions.galaxy[region][ship].ship['civ'] && global.galaxy[ship].hasOwnProperty('crew')){
                        if (global.galaxy[ship].crew < 0){
                            global.galaxy[ship].crew = 0;
                        }
                        if (global.galaxy[ship]['crew'] < global.galaxy[ship].on * actions.galaxy[region][ship].ship.civ){
                            if (total < global.resource[global.race.species].amount){
                                if (global.civic.d_job === 'unemployed' || (global.civic.free > 0 && global.civic.free > actions.galaxy[region][ship].ship.civ)){
                                    if (global.civic.free > 0 && global.civic.free > actions.galaxy[region][ship].ship.civ){
                                        global.civic.free -= actions.galaxy[region][ship].ship.civ;
                                        global.civic.crew.workers += actions.galaxy[region][ship].ship.civ;
                                        global.galaxy[ship]['crew'] += actions.galaxy[region][ship].ship.civ;
                                    }
                                }
                                else {
                                    if (global.civic[global.civic.d_job].workers > actions.galaxy[region][ship].ship.civ){
                                        global.civic[global.civic.d_job].workers -= actions.galaxy[region][ship].ship.civ;
                                        global.civic.crew.workers += actions.galaxy[region][ship].ship.civ;
                                        global.galaxy[ship]['crew'] += actions.galaxy[region][ship].ship.civ;
                                    }
                                }
                            }
                        }
                        if (global.galaxy[ship]['crew'] > global.galaxy[ship].on * actions.galaxy[region][ship].ship.civ){
                            if (global.civic.d_job === 'unemployed'){
                                global.civic.free += actions.galaxy[region][ship].ship.civ;
                                global.civic.crew.workers -= actions.galaxy[region][ship].ship.civ;
                                global.galaxy[ship]['crew'] -= actions.galaxy[region][ship].ship.civ;
                            }
                            else {
                                global.civic[global.civic.d_job].workers += actions.galaxy[region][ship].ship.civ;
                                global.civic.crew.workers -= actions.galaxy[region][ship].ship.civ;
                                global.galaxy[ship]['crew'] -= actions.galaxy[region][ship].ship.civ;
                            }
                        }
                        global.civic.crew.assigned = global.civic.crew.workers;
                        crew_civ += global.galaxy[ship]['crew'];
                        total += global.galaxy[ship]['crew'];
                    }

                    if (actions.galaxy[region][ship].ship['mil'] && global.galaxy[ship].hasOwnProperty('mil')){
                        if (global.galaxy[ship]['mil'] !== global.galaxy[ship].on * actions.galaxy[region][ship].ship.mil){
                            global.galaxy[ship]['mil'] = global.galaxy[ship].on * actions.galaxy[region][ship].ship.mil;
                        }
                        if (global.civic.garrison.workers - global.portal.fortress.garrison < 0){
                            let underflow = global.civic.garrison.workers - global.portal.fortress.garrison;
                            global.galaxy[ship]['mil'] -= underflow;
                        }
                        if (crew_mil + global.galaxy[ship]['mil'] > global.civic.garrison.workers - global.portal.fortress.garrison){
                            global.galaxy[ship]['mil'] = global.civic.garrison.workers - global.portal.fortress.garrison - crew_mil;
                        }
                        if (global.galaxy[ship]['mil'] < 0){
                            global.galaxy[ship]['mil'] = 0;
                        }
                        crew_mil += global.galaxy[ship]['mil'];
                    }

                    if (global.galaxy[ship]['crew'] < global.galaxy[ship].on * actions.galaxy[region][ship].ship.civ || global.galaxy[ship]['mil'] < global.galaxy[ship].on * actions.galaxy[region][ship].ship.mil || gal_on[ship] < global.galaxy[ship].on){
                        $(`#galaxy-${ship} .on`).addClass('warn');
                    }
                    else {
                        $(`#galaxy-${ship} .on`).removeClass('warn');
                    }
                }
            }
        }

        global.civic.crew.workers = crew_civ;
        if (global.civic.garrison.hasOwnProperty('crew')){
            global.civic.garrison.crew = crew_mil;
        }

        // Detect labor anomalies
        Object.keys(job_desc).forEach(function (job) {
            if (global.civic[job] && job !== 'crew'){
                total += global.civic[job].workers;
                if (total > global.resource[global.race.species].amount){
                    global.civic[job].workers -= total - global.resource[global.race.species].amount;
                }
                if (global.civic[job].workers < 0){
                    global.civic[job].workers = 0;
                }

                let stress_level = global.civic[job].stress;
                if (global.city.ptrait === 'mellow'){
                    stress_level += planetTraits.mellow.vars[1];
                }
                if (global.race['content']){
                    let effectiveness = job === 'hell_surveyor' ? 0.2 : 0.4;
                    stress_level += global.race['content'] * effectiveness;
                }
                if (global.city.ptrait === 'dense' && job === 'miner'){
                    stress_level -= planetTraits.dense.vars[1];
                }

                stress -= global.civic[job].workers / stress_level;
            }
        });
        global.civic.free = global.resource[global.race.species].amount - total;

        Object.keys(job_desc).forEach(function (job){
            if (job !== 'craftsman' && global.civic[job] && global.civic[job].workers < global.civic[job].assigned && global.civic.free > 0 && global.civic[job].workers < global.civic[job].max){
                global.civic[job].workers++;
                global.civic.free--;
            }
            else if (global.civic.d_job !== 'unemployed' && global.civic.d_job !== job && job !== 'craftsman' && global.civic[job] && global.civic[job].workers < global.civic[job].assigned && global.civic[global.civic.d_job].workers > 0 && global.civic[job].workers < global.civic[job].max){
                global.civic[job].workers++;
                global.civic[global.civic.d_job].workers--;
            }
        });

        if (global.civic.d_job === 'farmer' && global.civic.new > 0 && !global.race['carnivore'] && !global.race['soul_eater'] && global.civic.farmer.display){
            global.civic.farmer.workers += global.civic.new;
            global.civic.free -= global.civic.new;
        }
        else if (global.civic.d_job !== 'unemployed'){
            global.civic[global.civic.d_job].workers += global.civic.new;
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
        for (let i=0; i<3; i++){
            if (global.civic.govern.type !== 'federation' && global.civic.foreign[`gov${i}`].anx){
                stress *= 1.1;
            }
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
        if (global.civic.govern.type === 'oligarchy' && global.civic.taxes.tax_rate > 20){
            let high_tax = global.civic.taxes.tax_rate - 20;
            global.city.morale.tax += high_tax * 0.5;
            morale += high_tax * 0.5;
        }

        if (((global.civic.govern.type !== 'autocracy' && !global.race['frenzy']) || global.race['immoral']) && global.civic.garrison.protest + global.civic.garrison.fatigue > 2){
            let warmonger = Math.round(Math.log2(global.civic.garrison.protest + global.civic.garrison.fatigue));
            global.city.morale.warmonger = global.race['immoral'] ? warmonger : -(warmonger);
            morale += global.city.morale.warmonger;
        }
        else {
            global.city.morale.warmonger = 0;
        }

        let mBaseCap = global.city['amphitheatre'] ? 100 + global.city['amphitheatre'].count : 100;
        mBaseCap += global.city['casino'] ? p_on['casino'] : 0;
        mBaseCap += global.space['spc_casino'] ? p_on['spc_casino'] : 0;

        if (red_on['vr_center']){
            mBaseCap += red_on['vr_center'] * 2;
        }
        if (p_on['resort']){
            mBaseCap += p_on['resort'] * 2;
        }
        if (global.tech['superstar']){
            mBaseCap += global.civic.entertainer.workers;
        }
        moraleCap = global.tech['monuments'] ? mBaseCap + (global.tech['monuments'] * 2) : mBaseCap;

        if (global.civic.taxes.tax_rate < 20){
            moraleCap += 10 - Math.floor(global.civic.taxes.tax_rate / 2);
        }

        if (global.stats.achieve['joyless']){
            moraleCap += global.stats.achieve['joyless'].l * 2;
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
            global_multiplier *= 1 - (traits.lazy.vars[0] / 100);
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
        if (global.resource[global.race.species].amount >= 1 || global.city['farm'] || global.city['soul_well'] || global.city['compost'] || global.city['tourist_center']){
            let food_bd = {};
            let food_base = 0;
            if (global.race['detritivore']){
                if (global.city['compost']){
                    let operating = global.city.compost.on;
                    if (!global.race['kindling_kindred']){
                        let lumberIncrement = 0.5;
                        let lumber_cost = operating * lumberIncrement;

                        while (lumber_cost * time_multiplier > global.resource.Lumber.amount && lumber_cost > 0){
                            lumber_cost -= lumberIncrement;
                            operating--;
                        }

                        breakdown.p.consume.Lumber[loc('city_compost_heap')] = -(lumber_cost);
                        modRes('Lumber', -(lumber_cost * time_multiplier));
                    }
                    food_base = 1.2 + (operating * (global.tech['compost'] * 0.8));
                    food_base *= global.city.biome === 'grassland' ? biomes.grassland.vars[0] : 1;
                    food_base *= global.city.biome === 'volcanic' ? biomes.volcanic.vars[0] : 1;
                    food_base *= global.city.biome === 'hellscape' ? biomes.hellscape.vars[0] : 1;
                    food_base *= global.city.ptrait === 'trashed' ? planetTraits.trashed.vars[0] : 1;
                    food_bd[loc('city_compost_heap')] = food_base + 'v';
                }
            }
            else if (global.race['carnivore'] || global.race['soul_eater']){
                let strength = global.tech['military'] ? (global.tech.military >= 5 ? global.tech.military - 1 : global.tech.military) : 1;
                food_base = global.civic.free * strength * (global.race['carnivore'] ? 2 : 0.5);
                if (global.race['ghostly']){
                    food_base *= 1 + (traits.ghostly.vars[0] / 100);
                }
                food_bd[loc('job_hunter')] = food_base + 'v';

                if (global.city['soul_well']){
                    let souls = global.city['soul_well'].count * (global.race['ghostly'] ? (2 + traits.ghostly.vars[1]) : 2);
                    food_bd[loc('city_soul_well')] = souls + 'v';
                    food_base += souls;
                }
            }
            else {
                let weather_multiplier = 1;
                if (!global.race['submerged']){
                    if (global.city.calendar.temp === 0){
                        if (global.city.calendar.weather === 0){
                            weather_multiplier *= global.race['chilled'] ? (1 + traits.chilled.vars[3] / 100) : 0.7;
                        }
                        else {
                            weather_multiplier *= global.race['chilled'] ? (1 + traits.chilled.vars[4] / 100) : 0.85;
                        }
                    }
                    if (global.city.calendar.weather === 2){
                        weather_multiplier *= global.race['chilled'] ? (1 - traits.chilled.vars[5] / 100) : 1.1;
                    }
                }

                if (global.city['farm']){
                    let farmers = global.civic.farmer.workers;
                    let farmhands = 0;
                    if (farmers > global.city.farm.count){
                        farmhands = farmers - global.city.farm.count;
                        farmers = global.city.farm.count;
                    }

                    let mill_multiplier = 1;
                    if (global.city['mill']){
                        let mill_bonus = global.tech['agriculture'] >= 5 ? 0.05 : 0.03;
                        let working = global.city['mill'].count - global.city['mill'].on;
                        mill_multiplier += (working * mill_bonus);
                    }

                    let food = (farmers * farmerValue(true)) + (farmhands * farmerValue(false));

                    food_bd[loc('job_farmer')] = (food) + 'v';
                    food_base = (food * weather_multiplier * mill_multiplier);

                    if (food > 0){
                        food_bd[`ᄂ${loc('city_mill_title1')}`] = ((mill_multiplier - 1) * 100) + '%';
                        food_bd[`ᄂ${loc('morale_weather')}`] = ((weather_multiplier - 1) * 100) + '%';
                    }
                }
            }

            let hunting = 0;
            if (global.tech['military']){
                hunting = global.race['herbivore'] ? 0 : armyRating(garrisonSize(),'hunting') / 3;
            }

            let biodome = 0;
            if (global.tech['mars']){
                biodome = red_on['biodome'] * 0.25 * global.civic.colonist.workers * zigguratBonus();
                if (global.race['cataclysm']){
                    biodome += red_on['biodome'] * 2 * zigguratBonus();
                }
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
            consume *= (global.race['gluttony'] ? (1 + traits.gluttony.vars[0] / 100) : 1);
            if (global.race['high_metabolism']){
                consume *= 1 + (traits.high_metabolism.vars[0] / 100);
            }
            if (global.race['sticky']){
                consume *= 1 - (traits.sticky.vars[0] / 100);
            }
            if (global.race['photosynth']){
                switch(global.city.calendar.weather){
                    case 0:
                        consume *= global.city.calendar.temp === 0 ? 1 : (1 - (traits.photosynth.vars[2] / 100));
                        break;
                    case 1:
                        consume *= 1 - (traits.photosynth.vars[1] / 100);
                        break;
                    case 2:
                        consume *= 1 - (traits.photosynth.vars[0] / 100);
                        break;
                }
            }
            if (global.race['ravenous']){
                consume *= 1.2;
                consume += (global.resource.Food.amount / 3);
            }
            if (global.race['hibernator'] && global.city.calendar.season === 3){
                consume *= 1 - (traits.hibernator.vars[0] / 100);
            }
            breakdown.p.consume.Food[races[global.race.species].name] = -(consume);

            let tourism = 0;
            if (global.city['tourist_center']){
                tourism = global.city['tourist_center'].on * 50;
                breakdown.p.consume.Food[loc('tech_tourism')] = -(tourism);
            }

            let spaceport = 0;
            if (global.space['spaceport']){
                spaceport = p_on['spaceport'] * (global.race['cataclysm'] ? 2 : 25);
                breakdown.p.consume.Food[loc('space_red_spaceport_title')] = -(spaceport);
            }

            let starport = 0;
            if (global.interstellar['starport']){
                starport = p_on['starport'] * 100;
                breakdown.p.consume.Food[loc('interstellar_alpha_starport_title')] = -(starport);
            }

            let starbase = 0;
            if (global.galaxy['starbase']){
                starbase = p_on['s_gate'] * p_on['starbase'] * 250;
                breakdown.p.consume.Food[loc('galaxy_starbase')] = -(starbase);
            }

            let space_station = 0;
            if (global.space['space_station']){
                space_station = p_on['space_station'] * (global.race['cataclysm'] ? 1 : 10);
                breakdown.p.consume.Food[loc('space_belt_station_title')] = -(space_station);
            }

            let space_marines = 0;
            if (global.space['space_barracks'] && !global.race['cataclysm']){
                space_marines = global.space.space_barracks.on * 10;
                breakdown.p.consume.Food[loc('tech_space_marines_bd')] = -(space_marines);
            }

            let embassy = 0;
            if (global.galaxy['embassy']){
                embassy = p_on['s_gate'] * p_on['embassy'] * 7500;
                breakdown.p.consume.Food[loc('galaxy_embassy')] = -(embassy);
            }

            let delta = generated - consume - tourism - spaceport - starport - starbase - space_station - space_marines - embassy;

            food_bd[loc('space_red_biodome_title')] = biodome + 'v';
            food_bd[loc('soldiers')] = hunting + 'v';
            breakdown.p['Food'] = food_bd;

            if (!modRes('Food', delta * time_multiplier)){
                fed = false;
                let threshold = 1.25;
                if (global.race['slow_digestion']){
                    threshold += traits.slow_digestion.vars[0];
                }
                if (global.race['humpback']){
                    threshold += traits.humpback.vars[0];
                }
                if (global.race['atrophy']){
                    threshold -= traits.atrophy.vars[0];
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
            if (global.portal.fortress.repair >= actions.portal.prtl_fortress.info.repair()){
                global.portal.fortress.repair = 0;
                global.portal.fortress.walls++;
            }
        }

        // Citizen Growth
        if (fed && global['resource']['Food'].amount > 0 && global['resource'][global.race.species].max > global['resource'][global.race.species].amount){
            if (global.race['spongy'] && global.city.calendar.weather === 0){
                // Do Nothing
            }
            else if (global.race['parasite'] && global.city.calendar.wind === 0 && !global.race['cataclysm']){
                // Do Nothing
            }
            else {
                var lowerBound = global.tech['reproduction'] ? global.tech['reproduction'] : 0;
                if (global.tech['reproduction'] && date.getMonth() === 1 && date.getDate() === 14){
                    lowerBound += 5;
                }
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
                if (global.tech['reproduction'] && global.tech.reproduction >= 2 && global.city['hospital']){
                    lowerBound += global.city.hospital.count;
                }
                if (global.genes['birth']){
                    lowerBound += global.genes['birth'];
                }
                if (global.race['promiscuous']){
                    lowerBound += global.race['promiscuous'];
                }
                let base = global.city.ptrait === 'toxic' ? global['resource'][global.race.species].amount * planetTraits.toxic.vars[1] : global['resource'][global.race.species].amount;
                if (global.race['parasite'] && global.race['cataclysm']){
                    lowerBound = Math.round(lowerBound / 5);
                    base *= 3;
                }
                if(Math.rand(0, base * (3 - (2 ** time_multiplier))) <= lowerBound){
                    global['resource'][global.race.species].amount++;
                    if (global.civic['hell_surveyor'].workers + global.civic.free >= global.civic['hell_surveyor'].assigned){
                        global.civic.new++;
                    }
                }
            }
        }

        let andromeda_helium = 0;
        let andromeda_deuterium = 0;

        if (p_on['s_gate']){
            let ship_list = ['freighter','super_freighter','minelayer','raider'];
            for (let i=0; i<ship_list.length; i++){
                if (p_on['s_gate'] && global.galaxy.hasOwnProperty(ship_list[i])){
                    gal_on[ship_list[i]] = global.galaxy[ship_list[i]].on;
                }
            }
        }

        for (let j=0; j<galaxy_ship_types.length; j++){
            let region = galaxy_ship_types[j].region;
            for (let i=0; i<galaxy_ship_types[j].ships.length; i++){
                let ship = galaxy_ship_types[j].ships[i];
                let req = galaxy_ship_types[j].hasOwnProperty('req') ? (p_on[galaxy_ship_types[j].req] > 0 ? true : false) : true;
                if (p_on['s_gate'] && req && global.galaxy[ship] && (global.galaxy[ship].crew > 0 || global.galaxy[ship].mil > 0)){
                    let operating = 0;
                    if (actions.galaxy[region][ship].ship.civ > 0){
                        operating = Math.floor(global.galaxy[ship].crew / actions.galaxy[region][ship].ship.civ);
                    }
                    if (actions.galaxy[region][ship].ship.mil > 0){
                        let mil_operating = Math.floor(global.galaxy[ship].mil / actions.galaxy[region][ship].ship.mil);
                        if (actions.galaxy[region][ship].ship.civ === 0 || mil_operating < operating){
                            operating = mil_operating;
                        }
                    }

                    if (actions.galaxy[region][ship].ship.hasOwnProperty('helium')){
                        let increment = +int_fuel_adjust(actions.galaxy[region][ship].ship.helium).toFixed(2);
                        let consume = (operating * increment);
                        while (consume * time_multiplier > global.resource.Helium_3.amount && consume > 0){
                            consume -= increment;
                            operating--;
                        }
                        modRes('Helium_3', -(consume * time_multiplier));
                        andromeda_helium += consume;
                    }

                    if (actions.galaxy[region][ship].ship.hasOwnProperty('deuterium')){
                        let increment = +int_fuel_adjust(actions.galaxy[region][ship].ship.deuterium).toFixed(2);
                        let consume = (operating * increment);
                        while (consume * time_multiplier > global.resource.Deuterium.amount && consume > 0){
                            consume -= increment;
                            operating--;
                        }
                        modRes('Deuterium', -(consume * time_multiplier));
                        andromeda_deuterium += consume;
                    }

                    if (gal_on.hasOwnProperty(ship)){
                        gal_on[ship] = gal_on[ship] > operating ? operating : gal_on[ship];
                    }
                    else {
                        gal_on[ship] = operating;
                    }
                }
                else {
                    gal_on[ship] = 0;
                }
            }
        }

        breakdown.p.consume.Helium_3[loc('galaxy_fuel_consume')] = -(andromeda_helium);
        breakdown.p.consume.Deuterium[loc('galaxy_fuel_consume')] = -(andromeda_deuterium);

        if (global.race['emfield']){
            if (global.race['discharge'] && global.race['discharge'] > 0){
                global.race.discharge--;
            }
            else {
                global.race.emfield++;
                if (Math.rand(0,500) === 0){
                    global.race['discharge'] = global.race.emfield;
                    global.race.emfield = 1;
                }
            }
        }

        // Resource Income
        let hunger = fed ? 1 : 0.5;
        if (global.race['angry'] && fed === false){
            hunger -= traits.angry.vars[0] / 100;
        }
        if (global.race['malnutrition'] && fed === false){
            hunger += traits.malnutrition.vars[0] / 100;
        }

        // Furs
        let fur_bd = {};
        if (global.resource.Furs.display){
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
            if (global.city.biome === 'oceanic'){
                hunting *= biomes.oceanic.vars[2];
            }
            else if (global.city.biome === 'tundra'){
                hunting *= biomes.tundra.vars[0];
            }
            fur_bd[loc('soldiers')] = hunting  + 'v';

            let delta = hunting;
            delta *= hunger * global_multiplier;

            modRes('Furs', delta * time_multiplier);
        }

        // Knowledge
        { //block scope
            let sundial_base = global.tech['primitive'] && global.tech['primitive'] >= 3 ? 1 : 0;
            if (global.race['ancient_ruins']){
                sundial_base++;
            }
            if (global.stats.achieve['extinct_junker'] && global.stats.achieve['extinct_junker'].l >= 1){
                sundial_base++;
            }
            if (global.city.ptrait === 'magnetic'){
                sundial_base += planetTraits.magnetic.vars[0];
            }
            if (global.race['ascended']){
                sundial_base += 2;
            }

            let professors_base = global.civic.professor.workers;
            professors_base *= global.race['studious'] ? global.civic.professor.impact + traits.studious.vars[0] : global.civic.professor.impact;
            professors_base *= global.race['pompous'] ? (1 - traits.pompous.vars[0] / 100) : 1;
            professors_base *= racialTrait(global.civic.professor.workers,'science');
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 3){
                professors_base *= 1 + (global.race['cataclysm'] ? global.space.ziggurat.count : global.city.temple.count) * 0.05;
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

            let library_bonus = global.race['autoignition'] ? (traits.autoignition.vars[0] / 100) : 0.05;
            let library_mult = global.city['library'] ? 1 + (global.city.library.count * library_bonus) : 1;

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
            if (global.civic.govern.type === 'technocracy'){
                know_bd[loc('govern_technocracy')] = '10%';
                delta *= 1.1;
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
            if (global.interstellar['int_factory'] && p_on['int_factory']){
                on_factories += p_on['int_factory'] * 2;
            }
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
                    delta *= 1 + (traits.toxic.vars[0] / 100);
                }
                if (global.civic.govern.type === 'corpocracy'){
                    delta *= 2.5;
                }
                if (global.civic.govern.type === 'socialist'){
                    delta *= 0.8;
                }
                if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 2){
                    delta *= 1.1;
                }

                FactoryMoney = delta * hunger; //Money doesn't normally have hunger/tax breakdowns. Better to lump in the manually calculable total.

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                }

                delta *= global_multiplier;
                modRes('Money', delta * time_multiplier);
            }

            if (global.city.factory['Furs'] && global.city.factory['Furs'] > 0){
                operating += global.city.factory.Furs;
                while (operating > on_factories && operating > 0){
                    operating--;
                    global.city.factory.Furs--;
                }

                let moneyIncrement = assembly ? f_rate.Furs.money[global.tech['factory']] : f_rate.Furs.money[0];
                let polymerIncrement = assembly ? f_rate.Furs.polymer[global.tech['factory']] : f_rate.Furs.polymer[0];
                let money_cost = global.city.factory.Furs * moneyIncrement;
                let polymer_cost = global.city.factory.Furs * polymerIncrement;
                let workDone = global.city.factory.Furs;

                while (polymer_cost * time_multiplier > global.resource.Polymer.amount && polymer_cost > 0){
                    polymer_cost -= polymerIncrement;
                    money_cost -= moneyIncrement;
                    workDone--;
                }
                while (money_cost * time_multiplier > global.resource.Money.amount && money_cost > 0){
                    polymer_cost -= polymerIncrement;
                    money_cost -= moneyIncrement;
                    workDone--;
                }

                breakdown.p.consume.Money[loc('city_factory')] = -(money_cost);
                breakdown.p.consume.Polymer[loc('city_factory')] = -(polymer_cost);
                modRes('Money', -(money_cost * time_multiplier));
                modRes('Polymer', -(polymer_cost * time_multiplier));

                let factory_output = workDone * (assembly ? f_rate.Furs.output[global.tech['factory']] : f_rate.Furs.output[0]);
                if (global.race['toxic']) {
                    factory_output *= 1 + (traits.toxic.vars[0] / 100);
                }
                if (global.civic.govern.type === 'corpocracy'){
                    factory_output *= 1.3;
                }
                if (global.civic.govern.type === 'socialist'){
                    factory_output *= 1.1;
                }
                if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 2){
                    factory_output *= 1.1;
                }

                let delta = factory_output;
                delta *= hunger * global_multiplier;

                fur_bd[loc('city_factory')] = factory_output + 'v';

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    fur_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                if (global.tech['q_factory']){
                    let q_bonus = (quantum_level - 1) / 8 + 1;
                    delta *= q_bonus;
                    fur_bd[`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                }
                modRes('Furs', delta * time_multiplier);
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
                    factory_output *= 1 + (traits.toxic.vars[0] / 100);
                }
                if (global.tech['alloy']){
                    factory_output *= 1.37;
                }
                if (global.race['metallurgist']){
                    factory_output *= 1 + (global.race['metallurgist'] * 0.04);
                }
                if (global.civic.govern.type === 'corpocracy'){
                    factory_output *= 1.3;
                }
                if (global.civic.govern.type === 'socialist'){
                    factory_output *= 1.1;
                }
                if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 2){
                    factory_output *= 1.1;
                }

                let delta = factory_output;
                delta *= hunger * global_multiplier;

                let alloy_bd = {};
                alloy_bd[loc('city_factory')] = factory_output + 'v';

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    alloy_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                if (global.tech['q_factory']){
                    let q_bonus = (quantum_level - 1) / 2 + 1;
                    delta *= q_bonus;
                    alloy_bd[`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                }
                alloy_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Alloy'] = alloy_bd;
                modRes('Alloy', delta * time_multiplier);
            }
            else {
                breakdown.p['Alloy'] = 0;
            }

            let polymer_bd = {};
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
                    factory_output *= 1 + (traits.toxic.vars[0] / 100);
                }
                if (global.tech['polymer'] >= 2){
                    factory_output *= 1.42;
                }
                if (global.civic.govern.type === 'corpocracy'){
                    factory_output *= 1.3;
                }
                if (global.civic.govern.type === 'socialist'){
                    factory_output *= 1.1;
                }
                if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 2){
                    factory_output *= 1.1;
                }

                let delta = factory_output;
                delta *= hunger * global_multiplier;

                polymer_bd[loc('city_factory')] = factory_output + 'v';

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    polymer_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                if (global.tech['q_factory']){
                    let q_bonus = (quantum_level - 1) / 2 + 1;
                    delta *= q_bonus;
                    polymer_bd[`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                }
                polymer_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                modRes('Polymer', delta * time_multiplier);
            }

            if (p_on['s_gate'] && global.galaxy['raider'] && gal_on['raider'] > 0){
                let base = gal_on['raider'] * 2.3 * zigguratBonus();
                let pirate = piracy('gxy_chthonian');
                let delta = base * global_multiplier * pirate * hunger;

                polymer_bd[loc('galaxy_raider')] = base + 'v';
                polymer_bd[`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                modRes('Polymer', delta * time_multiplier);
            }
            breakdown.p['Polymer'] = polymer_bd;

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
                    factory_output *= 1 + (traits.toxic.vars[1] / 100);
                }
                if (global.tech['polymer'] >= 2){
                    factory_output *= 1.42;
                }
                if (global.civic.govern.type === 'corpocracy'){
                    factory_output *= 1.3;
                }
                if (global.civic.govern.type === 'socialist'){
                    factory_output *= 1.1;
                }
                if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 2){
                    factory_output *= 1.1;
                }

                let delta = factory_output;
                delta *= hunger * global_multiplier;

                let nano_bd = {};
                nano_bd[loc('city_factory')] = factory_output + 'v';

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    nano_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                if (global.tech['q_factory']){
                    let q_bonus = (quantum_level - 1) / 2 + 1;
                    delta *= q_bonus;
                    nano_bd[`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                }
                nano_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Nano_Tube'] = nano_bd;
                modRes('Nano_Tube', delta * time_multiplier);
            }
            else {
                breakdown.p['Nano_Tube'] = 0;
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
                if (global.race['toxic']) {
                    factory_output *= 1 + (traits.toxic.vars[1] / 100);
                }
                if (global.civic.govern.type === 'corpocracy'){
                    factory_output *= 1.3;
                }
                if (global.civic.govern.type === 'socialist'){
                    factory_output *= 1.1;
                }
                if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 2){
                    factory_output *= 1.1;
                }

                let delta = factory_output;
                delta *= hunger * global_multiplier;

                let stanene_bd = {};
                stanene_bd[loc('city_factory')] = factory_output + 'v';

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    stanene_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                if (global.tech['q_factory']){
                    let q_bonus = (quantum_level - 1) / 2 + 1;
                    delta *= q_bonus;
                    stanene_bd[`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                }
                stanene_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Stanene'] = stanene_bd;
                modRes('Stanene', delta * time_multiplier);
            }
            else {
                breakdown.p['Stanene'] = 0;
            }
        }

        if (global.resource.Furs.display){
            fur_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
            breakdown.p['Furs'] = fur_bd;
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
            if (global.civic.govern.type === 'corpocracy'){
                factory_output *= 1.3;
            }
            if (global.civic.govern.type === 'socialist'){
                factory_output *= 1.1;
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

            let cement_bd = {};
            cement_bd[loc('city_cement_plant_bd')] = factory_output + 'v';
            cement_bd[loc('power')] = ((powered_mult - 1) * 100) + '%';

            if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['cement_plant'] > 0){
                powered_mult = (powered_mult - 1) * 0.5 + 1;
                cement_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            let delta = factory_output * powered_mult * ai_core;
            delta *= hunger * global_multiplier;

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
        if (global.city['smelter'] && (global.city.smelter.count > 0 || global.race['cataclysm'])){
            let capacity = global.city.smelter.count;
            if (p_on['stellar_forge'] && global.tech['star_forge'] && global.tech['star_forge'] >= 2){
                capacity += p_on['stellar_forge'] * 2;
            }
            if (global.race['cataclysm']){
                capacity += global.space.geothermal.on;
            }
            global.city.smelter.cap = capacity;

            if (global.race['forge']){
                global.city.smelter.Wood = 0;
                global.city.smelter.Coal = 0;
                global.city.smelter.Oil = global.city.smelter.cap;
            }

            if (global.race['kindling_kindred'] && !global.race['evil']){
                global.city.smelter.Wood = 0;
            }
            let coal_fuel = global.race['kindling_kindred'] ? 0.15 : 0.25;

            if (global.city.smelter.Iron + global.city.smelter.Steel > global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil){
                let fueled = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil;
                let overflow = global.city.smelter.Iron + global.city.smelter.Steel - fueled;
                global.city.smelter.Iron -= overflow;
                if (global.city.smelter.Iron < 0){
                    overflow = global.city.smelter.Iron;
                    global.city.smelter.Iron = 0;
                    global.city.smelter.Steel += overflow;
                    if (global.city.smelter.Steel < 0){
                        global.city.smelter.Steel = 0;
                    }
                }
            }
            else if (global.city.smelter.Iron + global.city.smelter.Steel < global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil){
                global.city.smelter.Iron++;
            }

            let consume_wood = global.race['forge'] ? 0 : global.city.smelter.Wood * (global.race['evil'] && (!global.race['soul_eater'] || global.race.species === 'wendigo') ? 1 : 3);
            let consume_coal = global.race['forge'] ? 0 : global.city.smelter.Coal * coal_fuel;
            let consume_oil = global.race['forge'] ? 0 : global.city.smelter.Oil * 0.35;
            iron_smelter = global.city.smelter.Iron;
            let steel_smelter = global.city.smelter.Steel;
            let oil_bonus = global.race['forge'] ? global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil : global.city.smelter.Oil;

            if (global.race['steelen']) {
                iron_smelter += steel_smelter;
                steel_smelter = 0;
            }

            while (iron_smelter + steel_smelter > global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil ){
                if (steel_smelter > 0){
                    steel_smelter--;
                }
                else {
                    iron_smelter--;
                }
            }
            let l_type = global.race['soul_eater'] && global.race.species !== 'wendigo' ? 'Food' : (global.race['evil'] ? 'Furs' : 'Lumber');
            while (consume_wood * time_multiplier > global.resource[l_type].amount && consume_wood > 0){
                consume_wood -= (global.race['evil'] && (!global.race['soul_eater'] || global.race.species === 'wendigo') ? 1 : 3);
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
                iron_smelter *= 1 - (traits.pyrophobia.vars[0] / 100);
            }

            if (oil_bonus > 0){
                iron_smelter *= 1 + (oil_bonus / 200);
            }

            if (global.race['evil']){
                if (global.race['soul_eater'] && global.race.species !== 'wendigo'){
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
                let ash = (ash_base / 65 / global_multiplier);
                uranium_bd[loc('city_coal_ash')] = uranium_bd[loc('city_coal_ash')] ? uranium_bd[loc('city_coal_ash')] + ash : ash;
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
                if (global.stats.achieve['steelen'] && global.stats.achieve['steelen'].l >= 1){
                    let steelen_bonus = (global.stats.achieve['steelen'].l * 2) / 100;
                    steel_base *= (1 + steelen_bonus);
                }
                for (i = 4; i <= 6; i++) {
                    if (global.tech['smelting'] >= i){
                        steel_base *= 1.2;
                    }
                }
                if (global.tech['smelting'] >= 7){
                    steel_base *= 1.25;
                }

                if (oil_bonus > 0){
                    steel_smelter *= 1 + (oil_bonus / 200);
                }

                let smelter_output = steel_smelter * steel_base;
                if (global.race['pyrophobia']){
                    smelter_output *= 1 - (traits.pyrophobia.vars[0] / 100);
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
                    if (global.city.biome === 'oceanic'){
                        delta *= biomes.oceanic.vars[1];
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
            graphene_production *= 0.6;

            breakdown.p.consume.Lumber[loc('interstellar_g_factory_bd')] = -(consume_wood);
            breakdown.p.consume.Coal[loc('interstellar_g_factory_bd')] = -(consume_coal);
            breakdown.p.consume.Oil[loc('interstellar_g_factory_bd')] = -(consume_oil);

            modRes('Lumber', -(consume_wood * time_multiplier));
            modRes('Coal', -(consume_coal * time_multiplier));
            modRes('Oil', -(consume_oil * time_multiplier));

            if (global.civic.govern.type === 'corpocracy'){
                graphene_production *= 1.3;
            }
            if (global.civic.govern.type === 'socialist'){
                graphene_production *= 1.1;
            }

            let ai = 1;
            if (global.tech['ai_core'] >= 3){
                let graph = +(quantum_level / 5).toFixed(1) / 100;
                ai += graph * p_on['citadel'];
            }

            let graphene_bd = {};
            let delta = graphene_production * ai * zigguratBonus() * hunger * global_multiplier;
            graphene_bd[loc('interstellar_g_factory_bd')] = (graphene_production * zigguratBonus()) + 'v';

            if (global.race['discharge'] && global.race['discharge'] > 0){
                delta *= 0.5;
                graphene_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            if (p_on['citadel'] > 0){
                graphene_bd[loc('interstellar_citadel_effect_bd')] = ((ai - 1) * 100) + '%';
            }
            graphene_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
            breakdown.p['Graphene'] = graphene_bd;
            modRes('Graphene', delta * time_multiplier);
        }
        else {
            breakdown.p['Graphene'] = 0;
        }

        // Vitreloy
        let vitreloy_bd = {};
        if (global.galaxy['vitreloy_plant'] && p_on['vitreloy_plant'] > 0){

            let consume_money = p_on['vitreloy_plant'] * 50000;
            let consume_bolognium = p_on['vitreloy_plant'] * 2.5;
            let consume_stanene = p_on['vitreloy_plant'] * 100;

            let vitreloy_production = p_on['vitreloy_plant'];

            while (consume_money * time_multiplier > global.resource.Money.amount && consume_money > 0){
                consume_money -= 350;
                vitreloy_production--;
            }
            while (consume_bolognium * time_multiplier > global.resource.Bolognium.amount && consume_bolognium > 0){
                consume_bolognium -= 25;
                vitreloy_production--;
            }
            while (consume_stanene * time_multiplier > global.resource.Stanene.amount && consume_stanene > 0){
                consume_stanene -= 15;
                vitreloy_production--;
            }

            if (vitreloy_production > 0){
                vitreloy_production *= 0.18;

                breakdown.p.consume.Money[loc('galaxy_vitreloy_plant_bd')] = -(consume_money);
                breakdown.p.consume.Bolognium[loc('galaxy_vitreloy_plant_bd')] = -(consume_bolognium);
                breakdown.p.consume.Stanene[loc('galaxy_vitreloy_plant_bd')] = -(consume_stanene);

                modRes('Money', -(consume_money * time_multiplier));
                modRes('Bolognium', -(consume_bolognium * time_multiplier));
                modRes('Stanene', -(consume_stanene * time_multiplier));

                if (global.civic.govern.type === 'corpocracy'){
                    vitreloy_production *= 1.3;
                }
                if (global.civic.govern.type === 'socialist'){
                    vitreloy_production *= 1.1;
                }

                let zig = zigguratBonus();
                let pirate = piracy('gxy_alien1');

                vitreloy_bd[loc('galaxy_vitreloy_plant_bd')] = (vitreloy_production * zig) + 'v';

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    vitreloy_production *= 0.5;
                    vitreloy_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                vitreloy_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                vitreloy_bd[`ᄂ${loc('galaxy_piracy')}+0`] = -((1 - pirate) * 100) + '%';
                modRes('Vitreloy', vitreloy_production * hunger * global_multiplier * zig * pirate * time_multiplier);
            }
        }

        if (p_on['s_gate'] && global.galaxy['raider'] && gal_on['raider'] > 0){
            let base = gal_on['raider'] * 0.05 * zigguratBonus();
            let pirate = piracy('gxy_chthonian');
            let delta = base * global_multiplier * pirate * hunger;

            vitreloy_bd[loc('galaxy_raider')] = base + 'v';
            vitreloy_bd[`ᄂ${loc('galaxy_piracy')}+1`] = -((1 - pirate) * 100) + '%';
            modRes('Vitreloy', delta * time_multiplier);
        }
        breakdown.p['Vitreloy'] = vitreloy_bd;

        // Lumber
        { //block scope
            if (global.race['cataclysm']){
                if (global.tech['mars'] && red_on['biodome'] && !global.race['kindling_kindred']){
                    let lumber_bd = {};
                    let lumber = red_on['biodome'] * 1.5 * global.civic.colonist.workers * zigguratBonus();

                    lumber_bd[loc('space_red_biodome_title')] = lumber  + 'v';
                    lumber_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                    breakdown.p['Lumber'] = lumber_bd;

                    modRes('Lumber', lumber * hunger * global_multiplier * time_multiplier);
                }
            }
            else if (global.race['soul_eater'] && global.race.species !== 'wendigo'){
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
                lumber_base *= global.city.biome === 'forest' ? biomes.forest.vars[0] : 1;
                lumber_base *= global.city.biome === 'desert' ? biomes.desert.vars[2] : 1;
                lumber_base *= global.civic.lumberjack.impact;
                lumber_base *= racialTrait(global.civic.lumberjack.workers,'lumberjack');
                lumber_base *= (global.tech['axe'] && global.tech['axe'] > 1 ? (global.tech['axe'] - 1) * 0.35 : 0) + 1;

                let sawmills = 1;
                if (global.city['sawmill']){
                    let saw = global.tech['saw'] >= 2 ? 0.08 : 0.05;
                    sawmills *= (global.city.sawmill.count * saw) + 1;
                }
                let power_mult = 1;
                if (global.city.powered && global.city.sawmill && p_on['sawmill']){
                    power_mult += (p_on['sawmill'] * 0.04);
                }
                let lumber_yard = 1;
                if (global.city['lumber_yard']){
                    lumber_yard += global.city['lumber_yard'].count * 0.02;
                }

                let lumber_bd = {};
                lumber_bd[loc('job_lumberjack')] = lumber_base + 'v';
                if (lumber_base > 0){
                    lumber_bd[`ᄂ${loc('city_lumber_yard')}`] = ((lumber_yard - 1) * 100) + '%';
                    lumber_bd[`ᄂ${loc('city_sawmill')}`] = ((sawmills - 1) * 100) + '%';
                    lumber_bd[`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
                }
                if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['sawmill'] > 0){
                    power_mult = (power_mult - 1) * 0.5 + 1;
                    lumber_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                let delta = lumber_base * sawmills * power_mult * lumber_yard;
                delta *= hunger * global_multiplier;

                lumber_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Lumber'] = lumber_bd;
                modRes('Lumber', delta * time_multiplier);
            }
        }

        let alumina_bd = {};
        let refinery = global.city['metal_refinery'] ? global.city['metal_refinery'].count * 6 : 0;

        // Stone / Amber
        if (global.race['sappy']){
            if (global.tech['mining'] && global.resource[global.race.species].amount > 0){
                let stone_bd = {};

                let stone_base = global.resource[global.race.species].amount * 0.6;
                stone_bd[races[global.race.species].name] = stone_base + 'v';
                if (global.city.hasOwnProperty('basic_housing')){
                    let grove = global.city.basic_housing.count * 0.025;
                    stone_base *= 1 + grove;
                    stone_bd[`ᄂ${housingLabel('small')}`] = (grove * 100) + '%';
                }

                let soldiers = 0;
                if (global.civic.hasOwnProperty('garrison')){
                    soldiers = global.civic.garrison.workers * 0.6;
                    stone_bd[loc('soldiers')] = soldiers + 'v';
                }

                let delta = (stone_base + soldiers) * hunger * global_multiplier;
                stone_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';

                breakdown.p['Stone'] = stone_bd;
                modRes('Stone', delta * time_multiplier);
            }
        }
        else {
            let stone_base = global.civic.quarry_worker.workers;
            stone_base *= global.civic.quarry_worker.impact;
            stone_base *= racialTrait(global.civic.quarry_worker.workers,'miner');
            stone_base *= (global.tech['hammer'] && global.tech['hammer'] > 0 ? global.tech['hammer'] * 0.4 : 0) + 1;
            if (global.city.biome === 'desert'){
                stone_base *= biomes.desert.vars[0];
            }
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

            let stone_bd = {};
            stone_bd[loc('workers')] = stone_base + 'v';
            if (stone_base > 0){
                stone_bd[`ᄂ${loc('city_rock_quarry')}`] = ((rock_quarry - 1) * 100) + '%';
                stone_bd[`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
            }

            if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['rock_quarry'] > 0){
                power_mult = (power_mult - 1) * 0.5 + 1;
                stone_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            if (global.race['cataclysm']){
                if (global.tech['mars'] && red_on['red_mine']){
                    stone_base = red_on['red_mine'] * 0.75 * global.civic.colonist.workers * zigguratBonus();
                    stone_bd[loc('space_red_mine_title')] = stone_base + 'v';
                }
                power_mult = 1;
                rock_quarry = 1;
            }

            let delta = stone_base * power_mult * rock_quarry;
            delta *= hunger * global_multiplier;

            stone_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
            breakdown.p['Stone'] = stone_bd;
            modRes('Stone', delta * time_multiplier);

            // Aluminium
            if ((global.city['metal_refinery'] && global.city['metal_refinery'].count > 0) || global.race['cataclysm']){
                let base = stone_base * rock_quarry * power_mult * (global.race['cataclysm'] ? 0.16 : 0.08);
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

                alumina_bd[global.race['cataclysm'] ? loc('space_red_mine_title') : loc('workers')] = base + 'v';
                alumina_bd[loc('city_shrine')] = ((shrine_bonus - 1) * 100) + '%';
                alumina_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';

                modRes('Aluminium', delta * time_multiplier);
            }
        }

        // Mana
        if (global.resource.Mana.display){
            let mana_bd = {};

            if (global.race['casting']){
                ['farmer','miner','lumberjack','science','factory','army','hunting'].forEach(function (spell){
                    if (global.race.casting[spell] > 0){
                        let consume_mana = global.race.casting[spell] * 0.05;
                        breakdown.p.consume.Mana[loc(`modal_pylon_spell_${spell}`)] = -(consume_mana);    
                        modRes('Mana', -(consume_mana * time_multiplier));
                    }
                    else {
                        delete breakdown.p.consume.Mana[loc(`modal_pylon_spell_${spell}`)];
                    }
                });
            }

            if (global.city['pylon']){
                let mana_base = global.city.pylon.count * 0.01;
                mana_base *= darkEffect('magic');
                let delta = mana_base * hunger * global_multiplier;

                mana_bd[loc('city_pylon')] = mana_base+'v';
                modRes('Mana', delta * time_multiplier);
            }

            if (global.tech['cleric']){
                let mana_base = global.civic.priest.workers * 0.0025;
                mana_base *= darkEffect('magic');
                let delta = mana_base * hunger * global_multiplier;

                mana_bd[loc('job_priest')] = mana_base+'v';
                modRes('Mana', delta * time_multiplier);
            }

            mana_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
            breakdown.p['Mana'] = mana_bd;
        }

        // Crystal
        if (global.resource.Crystal.display){
            let crystal_base = global.civic.crystal_miner.workers;
            crystal_base *= global.civic.crystal_miner.impact;
            crystal_base *= racialTrait(global.civic.crystal_miner.workers,'miner');

            let crystal_bd = {};
            crystal_bd[loc('job_crystal_miner')] = crystal_base + 'v';

            let delta = crystal_base * hunger * global_multiplier;

            crystal_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
            breakdown.p['Crystal'] = crystal_bd;
            modRes('Crystal', delta * time_multiplier);
        }

        // Miners
        let copper_bd = {};
        if (global.resource.Copper.display || global.resource.Iron.display){
            let miner_base = global.civic.miner.workers;
            miner_base *= global.civic.miner.impact;
            miner_base *= racialTrait(global.civic.miner.workers,'miner');
            if (global.race['tough']){
                miner_base *= 1 + (traits.tough.vars[0] / 100);
            }
            if (global.race['industrious']){
                let bonus = 1 + (global.race['industrious'] / 50);
                miner_base *= bonus;
            }
            if (global.city.ptrait === 'dense'){
                miner_base *= planetTraits.dense.vars[0];
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

                if (global.city.biome === 'volcanic'){
                    copper_base *= biomes.volcanic.vars[1];
                }

                let copper_shrine = 1;
                if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                    copper_shrine = 1 + (global.city.shrine.metal / 100);
                }

                let copper_power = power_mult;
                copper_bd[loc('job_miner')] = (copper_base) + 'v';
                if (copper_base > 0){
                    copper_bd[`ᄂ${loc('power')}`] = ((copper_power - 1) * 100) + '%';
                }

                if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['mine'] > 0){
                    copper_power = (copper_power - 1) * 0.5 + 1;
                    copper_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                let delta = copper_base * copper_shrine * copper_power;
                delta *= hunger * global_multiplier;

                modRes('Copper', delta * time_multiplier);
            }

            // Iron
            if (global.resource.Iron.display){
                let iron_bd = {};
                let iron_mult = 1/4;
                let iron_base = miner_base * iron_mult;
                if (global.race['iron_allergy']){
                    iron_base *= 1 - (traits.iron_allergy.vars[0] / 100);
                }
                let smelter_mult = 1 + (iron_smelter * 0.1);

                if (global.city.geology['Iron']){
                    iron_base *= global.city.geology['Iron'] + 1;
                }

                if (global.city.biome === 'volcanic'){
                    iron_base *= biomes.volcanic.vars[2];
                }

                let space_iron = 0;

                if (belt_on['iron_ship']){
                    space_iron = belt_on['iron_ship'] * (global.tech.asteroid >= 6 ? (global.tech.asteroid >= 7 ? 4 : 3) : 2) * zigguratBonus();
                }

                let iron_shrine = 1;
                if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                    iron_shrine = 1 + (global.city.shrine.metal / 100);
                }

                let iron_power = power_mult;
                iron_bd[loc('job_miner')] = (iron_base) + 'v';
                if (iron_base > 0){
                    iron_bd[`ᄂ${loc('power')}`] = ((iron_power - 1) * 100) + '%';
                }

                if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['mine'] > 0){
                    iron_power = (iron_power - 1) * 0.5 + 1;
                    iron_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                let delta = ((iron_base * iron_power) + space_iron) * smelter_mult * iron_shrine;
                delta *= hunger * global_multiplier;


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
                    if (global.city.biome === 'oceanic'){
                        delta *= biomes.oceanic.vars[0];
                    }
                    if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                        delta *= 1 + (global.city.shrine.metal / 100);
                    }
                    let divisor = global.tech['titanium'] >= 3 ? 10 : 25;
                    modRes('Titanium', (delta * time_multiplier) / divisor);
                    titanium_bd[loc('resource_Iron_name')] = (iron / divisor) + 'v';
                }
            }

            if (global.race['sappy']){
                // Alt Aluminium
                if ((global.city['metal_refinery'] && global.city['metal_refinery'].count > 0) || global.race['cataclysm']){
                    if (global.race['cataclysm']){
                        if (global.tech['mars'] && red_on['red_mine']){
                            miner_base = red_on['red_mine'] * 0.75 * global.civic.colonist.workers * zigguratBonus();
                        }
                        power_mult = 1;
                    }

                    let base = miner_base * power_mult * 0.08;
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

                    alumina_bd[global.race['cataclysm'] ? loc('space_red_mine_title') : loc('job_miner')] = base + 'v';
                    alumina_bd[loc('city_shrine')] = ((shrine_bonus - 1) * 100) + '%';
                    alumina_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';

                    modRes('Aluminium', delta * time_multiplier);
                }
            }
        }

        {
            // Aluminium Mining Droids
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

        // Mars Mining
        if (red_on['red_mine'] && red_on['red_mine'] > 0) {
            let copper_base = red_on['red_mine'] * 0.25 * global.civic.colonist.workers * zigguratBonus();
            if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                copper_base *= 1 + (global.city.shrine.metal / 100);
            }
            copper_bd[loc('space_red_mine_desc_bd', [races[global.race.species].solar.red])] = (copper_base) + 'v';
            modRes('Copper', copper_base * time_multiplier * global_multiplier * hunger);

            let titanium_base = red_on['red_mine'] * 0.02 * global.civic.colonist.workers * hunger * zigguratBonus();
            if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                titanium_base *= 1 + (global.city.shrine.metal / 100);
            }
            titanium_bd[loc('space_red_mine_desc_bd', [races[global.race.species].solar.red])] = (titanium_base) + 'v';
            modRes('Titanium', titanium_base * time_multiplier * global_multiplier);
        }
        if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
            copper_bd[loc('city_shrine')] = global.city.shrine.metal + '%';
            titanium_bd[loc('city_shrine')] = global.city.shrine.metal + '%';
        }
        copper_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
        breakdown.p['Copper'] = copper_bd;
        breakdown.p['Titanium'] = titanium_bd;

        if (uranium_bd.hasOwnProperty(loc('city_coal_ash'))){
            uranium_bd[loc('city_coal_ash')] = uranium_bd[loc('city_coal_ash')] + 'v';
        }

        // Coal
        if (global.resource.Coal.display){
            let coal_base = global.civic.coal_miner.workers;
            coal_base *= global.civic.coal_miner.impact;
            coal_base *= racialTrait(global.civic.coal_miner.workers,'miner');
            if (global.race['tough']){
                coal_base *= 1 + (traits.tough.vars[0] / 100);
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

            let coal_bd = {};
            coal_bd[loc('job_coal_miner')] = coal_base + 'v';
            if (coal_base > 0){
                coal_bd[`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
            }

            if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['coal_mine'] > 0){
                power_mult = (power_mult - 1) * 0.5 + 1;
                coal_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            if (global.race['cataclysm'] && moon_on['iridium_mine']){
                coal_base = moon_on['iridium_mine'] * 0.55 * zigguratBonus();
                coal_bd[loc('space_moon_iridium_mine_title')] = coal_base + 'v';
                power_mult = 1;
            }

            let delta = coal_base * power_mult;
            delta *= hunger * global_multiplier;

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
                let uranium = delta / (global.race['cataclysm'] ? 48 : 115);
                if (global.city.geology['Uranium']){
                    uranium *= global.city.geology['Uranium'] + 1;
                }
                modRes('Uranium', uranium * time_multiplier);
                uranium_bd[global.race['cataclysm'] ? loc('space_moon_iridium_mine_title') : loc('job_coal_miner')] = uranium / global_multiplier + 'v';
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
            if (global.city.biome === 'desert'){
                oil_well *= biomes.desert.vars[1];
            }
            else if (global.city.biome === 'tundra'){
                oil_well *= biomes.tundra.vars[1];
            }

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

        if (p_on['s_gate'] && global.resource.Adamantite.display && global.galaxy['armed_miner'] && gal_on['armed_miner'] > 0){
            let base = gal_on['armed_miner'] * 0.65 * zigguratBonus();
            let foothold = 1 + (gal_on['ore_processor'] * 0.1);
            let pirate = piracy('gxy_alien2');
            let delta = base * global_multiplier * pirate * foothold * hunger * iridium_shrine;

            iridium_bd[loc('galaxy_armed_miner_bd')] = base + 'v';
            iridium_bd[`ᄂ${loc('galaxy_ore_processor')}`] = -((1 - foothold) * 100) + '%';
            iridium_bd[`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
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

        let deuterium_bd = {};
        if (global.interstellar['harvester'] && int_on['harvester']){
            let gas_mining = int_on['harvester'] * 0.85 * zigguratBonus();
            let delta = gas_mining * hunger * global_multiplier;

            helium_bd['Harvester'] = gas_mining + 'v';
            if (global.race['discharge'] && global.race['discharge'] > 0){
                delta *= 0.5;
                helium_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            modRes('Helium_3', delta * time_multiplier);

            if (global.tech['ram_scoop']){
                let deut_mining = int_on['harvester'] * 0.15 * zigguratBonus();
                let deut_delta = deut_mining * hunger * global_multiplier;

                deuterium_bd[loc('interstellar_harvester_title')] = deut_mining + 'v';
                modRes('Deuterium', deut_delta * time_multiplier);

                deuterium_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
            }
        }

        if (p_on['s_gate'] && global.galaxy['raider'] && gal_on['raider'] > 0){
            let base = gal_on['raider'] * 0.65 * zigguratBonus();
            let pirate = piracy('gxy_chthonian');
            let delta = base * global_multiplier * pirate * hunger;

            deuterium_bd[loc('galaxy_raider')] = base + 'v';
            deuterium_bd[`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
            modRes('Deuterium', delta * time_multiplier);
        }
        breakdown.p['Deuterium'] = deuterium_bd;

        helium_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
        breakdown.p['Helium_3'] = helium_bd;

        // Neutronium
        let neutronium_bd = {};
        if (p_on['outpost']){
            let n_base = p_on['outpost'] * 0.025 * zigguratBonus();
            neutronium_bd[loc('space_gas_moon_outpost_bd')] = n_base + 'v';

            if (global.tech['drone']){
                let rate = global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 3 ? 0.12 : 0.06;
                let drones = global.space.drone.count * rate;
                n_base *= 1 + (drones);
                neutronium_bd[`ᄂ${loc('tech_worker_drone')}`] = (drones * 100) + '%';
            }
            let delta = n_base * hunger * global_multiplier;

            if (global.race['discharge'] && global.race['discharge'] > 0){
                delta *= 0.5;
                neutronium_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            modRes('Neutronium', delta * time_multiplier);
        }

        if (p_on['neutron_miner']){
            let n_base = p_on['neutron_miner'] * 0.055 * zigguratBonus();
            let delta = n_base * hunger * global_multiplier;
            neutronium_bd[loc('interstellar_neutron_miner_bd')] = n_base + 'v';

            if (global.race['discharge'] && global.race['discharge'] > 0){
                delta *= 0.5;
                neutronium_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            modRes('Neutronium', delta * time_multiplier);
        }

        if (p_on['s_gate'] && global.galaxy['raider'] && gal_on['raider'] > 0){
            let base = gal_on['raider'] * 0.8 * zigguratBonus();
            let pirate = piracy('gxy_chthonian');
            let delta = base * global_multiplier * pirate * hunger;

            neutronium_bd[loc('galaxy_raider')] = base + 'v';
            neutronium_bd[`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
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

            if (global.race['discharge'] && global.race['discharge'] > 0){
                delta *= 0.75;
                elerium_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-25%';
            }

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
                adamantite_bd[`ᄂ${loc('interstellar_processing_title')}`] = (bonus * 100) + '%';

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    driod_delta *= 0.5;
                    adamantite_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }
            }
            if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                let bonus = global.city.shrine.metal * 0.01;
                driod_delta *= 1 + bonus;
                adamantite_bd[loc('city_shrine')] = (bonus * 100) + '%';
            }
            modRes('Adamantite', driod_delta * time_multiplier);
        }

        if (p_on['s_gate'] && global.resource.Adamantite.display && global.galaxy['armed_miner'] && gal_on['armed_miner'] > 0){
            let base = gal_on['armed_miner'] * 0.23 * zigguratBonus();
            let foothold = 1 + (gal_on['ore_processor'] * 0.1);
            let pirate = piracy('gxy_alien2');
            let delta = base * global_multiplier * pirate * foothold;

            adamantite_bd[loc('galaxy_armed_miner_bd')] = base + 'v';
            adamantite_bd[`ᄂ${loc('galaxy_ore_processor')}`] = -((1 - foothold) * 100) + '%';
            adamantite_bd[`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
            modRes('Adamantite', delta * time_multiplier);
        }
        breakdown.p['Adamantite'] = adamantite_bd;

        // Infernite
        let infernite_bd = {};
        if (global.resource.Infernite.display && global.civic.hell_surveyor.workers > 0){
            let rate = global.tech.infernite >= 3 ? 0.015 : 0.01;
            let surveyor_base = global.civic.hell_surveyor.workers * rate;

            let sensors = 1;
            if (global.tech['infernite'] >= 2 && p_on['sensor_drone']){
                let drone_rate = global.tech.infernite >= 4 ? (global.tech.infernite >= 6 ? 0.5 : 0.2) : 0.1;
                sensors = 1 + (p_on['sensor_drone'] * drone_rate);
            }

            let surveyor_delta = surveyor_base * sensors * global_multiplier;

            infernite_bd[loc('job_hell_surveyor')] = surveyor_base + 'v';
            infernite_bd[loc('portal_sensor_drone_title')] = ((sensors - 1) * 100) + '%';
            modRes('Infernite', surveyor_delta * time_multiplier);
        }
        breakdown.p['Infernite'] = infernite_bd;

        // Bolognium
        let bolognium_bd = {};
        if (p_on['s_gate'] && global.resource.Bolognium.display && global.galaxy['bolognium_ship'] && gal_on['bolognium_ship'] > 0){
            let base = gal_on['bolognium_ship'] * 0.008 * zigguratBonus();
            let pirate = piracy('gxy_gateway');
            let delta = base * global_multiplier * pirate;

            bolognium_bd[loc('galaxy_bolognium_ship')] = base + 'v';
            bolognium_bd[`ᄂ${loc('galaxy_piracy')}+0`] = -((1 - pirate) * 100) + '%';

            if (global.race['discharge'] && global.race['discharge'] > 0){
                delta *= 0.5;
                bolognium_bd[`ᄂ${loc('evo_challenge_discharge')}+0`] = '-50%';
            }

            modRes('Bolognium', delta * time_multiplier);
        }

        if (p_on['s_gate'] && global.resource.Bolognium.display && global.galaxy['armed_miner'] && gal_on['armed_miner'] > 0){
            let base = gal_on['armed_miner'] * 0.032 * zigguratBonus();
            let foothold = 1 + (gal_on['ore_processor'] * 0.1);
            let pirate = piracy('gxy_alien2');
            let delta = base * global_multiplier * pirate * foothold;

            bolognium_bd[loc('galaxy_armed_miner_bd')] = base + 'v';
            bolognium_bd[`ᄂ${loc('galaxy_ore_processor')}`] = -((1 - foothold) * 100) + '%';
            bolognium_bd[`ᄂ${loc('galaxy_piracy')}+1`] = -((1 - pirate) * 100) + '%';

            if (global.race['discharge'] && global.race['discharge'] > 0){
                delta *= 0.5;
                bolognium_bd[`ᄂ${loc('evo_challenge_discharge')}+1`] = '-50%';
            }

            modRes('Bolognium', delta * time_multiplier);
        }
        breakdown.p['Bolognium'] = bolognium_bd;

        // Orichalcum
        let orichalcum_bd = {};
        if (p_on['s_gate'] && global.resource.Orichalcum.display && global.galaxy['excavator'] && p_on['excavator'] > 0){
            let base = p_on['excavator'] * 0.2 * zigguratBonus();
            let pirate = piracy('gxy_chthonian');
            let delta = base * global_multiplier * pirate;

            orichalcum_bd[loc('galaxy_excavator')] = base + 'v';
            orichalcum_bd[`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';

            if (global.race['discharge'] && global.race['discharge'] > 0){
                delta *= 0.5;
                orichalcum_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            modRes('Orichalcum', delta * time_multiplier);
        }
        breakdown.p['Orichalcum'] = orichalcum_bd;

        // Income
        if (global.tech['currency'] >= 1){
            let income_base = global.resource[global.race.species].amount + global.civic.garrison.workers - (global.race['carnivore'] || global.race['evil'] ? 0 : global.civic.free);
            income_base *= 0.4;
            if (global.race['greedy']){
                income_base *= 1 - (traits.greedy.vars[0] / 100);
            }

            if (fed){
                if (global.tech['banking'] && global.tech['banking'] >= 2){
                    let impact = global.civic.banker.impact;
                    if (global.tech['banking'] >= 10){
                        impact += 0.02 * global.tech['stock_exchange'];
                    }
                    if (global.race['truthful']){
                        impact *= 1 - (traits.truthful.vars[0] / 100);
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
                income_base *= 0.95;
            }
            if (global.civic.govern.type === 'corpocracy'){
                income_base *= 0.5;
            }
            if (global.civic.govern.type === 'socialist'){
                income_base *= 0.8;
            }

            let temple_mult = 1;
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 4){
                temple_mult += (global.race['cataclysm'] ? global.space.ziggurat.count : global.city.temple.count) * 0.025;
            }

            let shrine_mult = 1;
            if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                shrine_mult += +(global.city.shrine.tax / 100);
            }

            let upkeep = 0;
            if (!global.tech['world_control'] && global.civic.govern.type !== 'federation'){
                for (let i=0; i<3; i++){
                    if (global.civic.foreign[`gov${i}`].buy){
                        upkeep += income_base * 0.2;
                    }
                }
            }

            let delta = (income_base - upkeep) * temple_mult * shrine_mult;
            delta *= global_multiplier;

            money_bd[loc('morale_tax')] = (income_base) + 'v';
            money_bd[loc('civics_spy_purchase_bd')] = -(upkeep) + 'v';
            money_bd[global.race['cataclysm'] ? loc('space_red_ziggurat_title') : loc('city_temple')] = ((temple_mult - 1) * 100) + '%';
            money_bd[loc('city_shrine')] = ((shrine_mult - 1) * 100) + '%';
            money_bd[loc('city_factory')] = FactoryMoney + 'v';
            if (global.race['discharge'] && global.race['discharge'] > 0 && FactoryMoney > 0){
                money_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }
            modRes('Money', +(delta * time_multiplier).toFixed(2));
        }

        if (global.tech['gambling'] && (p_on['casino'] || p_on['spc_casino'])){
            let casinos = 0;
            if (p_on['casino']){ casinos += p_on['casino']; }
            if (p_on['spc_casino']){ casinos += p_on['spc_casino']; }

            let cash = (Math.log2(global.resource[global.race.species].amount) * (global.race['gambler'] ? 2.5 + (global.race['gambler'] / 10) : 2.5)).toFixed(2);
            if (global.tech.gambling >= 2){
                cash *= global.tech.gambling >= 5 ? 2 : 1.5;
            }
            if (global.tech['stock_exchange'] && global.tech['gambling'] >= 4){
                cash *= 1 + (global.tech['stock_exchange'] * 0.01);
            }
            if (global.civic.govern.type === 'corpocracy'){
                cash *= 3;
            }
            if (global.civic.govern.type === 'socialist'){
                cash *= 0.8;
            }
            cash *= casinos;
            money_bd[loc('city_casino')] = cash + 'v';
            modRes('Money', +(cash * time_multiplier * global_multiplier * hunger).toFixed(2));
        }

        if (global.city['tourist_center']){
            let tourism = 0;
            let amp = global.tech['monument'] && global.tech.monument >= 3 && p_on['s_gate'] ? 3 : 1;
            if (global.city['amphitheatre']){
                tourism += global.city['tourist_center'].on * global.city['amphitheatre'].count * amp;
            }
            if (global.city['casino']){
                tourism += global.city['tourist_center'].on * global.city['casino'].count * 5 * amp;
            }
            if (global.space['spc_casino']){
                tourism += global.city['tourist_center'].on * global.space['spc_casino'].count * 5 * amp;
            }
            if (global.tech['monuments']){
                tourism += global.city['tourist_center'].on * global.tech['monuments'] * 2 * amp;
            }
            if (global.civic.govern.type === 'corpocracy'){
                tourism *= 2;
            }
            if (global.civic.govern.type === 'socialist'){
                tourism *= 0.8;
            }
            money_bd[loc('tech_tourism')] = Math.round(tourism) + 'v';
            modRes('Money', +(tourism * time_multiplier * global_multiplier * hunger).toFixed(2));
        }

        breakdown.p['Money'] = money_bd;

        // Crafting
        if (global.tech['foundry']){
            let craft_costs = global.race['resourceful'] ? (1 - traits.resourceful.vars[0] / 100) : 1;
            let crafting_costs = craftCost();
            let crafting_usage = {};

            Object.keys(crafting_costs).forEach(function (craft){
                let num = global.city.foundry[craft];
                let craft_ratio = craftingRatio(craft,true);

                let speed = global.genes['crafty'] ? 2 : 1;
                let volume = Math.floor(global.resource[crafting_costs[craft][0].r].amount / (crafting_costs[craft][0].a * speed * craft_costs / 140));
                for (let i=1; i<crafting_costs[craft].length; i++){
                    let temp = Math.floor(global.resource[crafting_costs[craft][i].r].amount / (crafting_costs[craft][i].a * speed * craft_costs / 140));
                    if (temp < volume){
                        volume = temp;
                    }
                }
                if (num < volume){
                    volume = num;
                }

                for (let i=0; i<crafting_costs[craft].length; i++){
                    let final = volume * crafting_costs[craft][i].a * craft_costs * speed * time_multiplier / 140;
                    modRes(crafting_costs[craft][i].r, -(final));
                    if (typeof crafting_usage[crafting_costs[craft][i].r] === 'undefined'){
                        crafting_usage[crafting_costs[craft][i].r] = final / time_multiplier;
                    }
                    else {
                        crafting_usage[crafting_costs[craft][i].r] += final / time_multiplier;
                    }
                }

                modRes(craft, craft_ratio * volume * speed * time_multiplier / 140);
            });

            Object.keys(crafting_usage).forEach(function (used){
                if (crafting_usage[used] > 0){
                    breakdown.p.consume[used][loc('job_craftsman')] = -(crafting_usage[used]);
                }
            });
        }

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

        if (firstRun && global.tech['piracy']){
            renderSpace();
        }
    }

    if (global.civic['garrison'] && global.civic.garrison.workers < global.civic.garrison.max){
        let rate = 2.5;
        if (global.race['diverse']){
            rate /= 1 + (traits.diverse.vars[0] / 100);
        }
        if (global.city['boot_camp']){
            rate *= 1 + (global.city['boot_camp'].count * (global.tech['boot_camp'] >= 2 ? 0.08 : 0.05));
        }
        global.civic.garrison.progress += rate * time_multiplier;
        if (global.race['brute']){
            global.civic.garrison.progress += traits.brute.vars[1] * time_multiplier;
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
            if (global.portal.carport.repair >= actions.portal.prtl_fortress.carport.repair()){
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
        if (global['resource'][res].rate > 0 || (global['resource'][res].rate === 0 && global['resource'][res].max === -1)){
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

    let easter = getEaster();
    if (easter.active){
        for (i=1; i<13; i++){
            if ($(`#egg${i}`).length > 0 && !$(`#egg${i}`).hasClass('binded')){
                easterEggBind(i);
                $(`#egg${i}`).addClass('binded');
            }
        }
    }

    firstRun = false;
}

function midLoop(){
    if (global.race.species === 'protoplasm'){
        let base = 100;
        if (global.stats.achieve['mass_extinction'] && global.stats.achieve['mass_extinction'].l > 1){
            base += 50 * (global.stats.achieve['mass_extinction'].l - 1);
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
            Mana: 0,
            Knowledge: global.stats.achieve['extinct_junker'] && global.stats.achieve['extinct_junker'].l >= 1 ? 1000 : 100,
            Food: 1000,
            Crates: 0,
            Containers: 0,
            Lumber: 200,
            Stone: 200,
            Crystal: 10,
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
            Stanene: 0,
            Bolognium: 0,
            Vitreloy: 0,
            Orichalcum: 0
        };
        // labor caps
        var lCaps = {
            farmer: -1,
            lumberjack: -1,
            quarry_worker: -1,
            crystal_miner: -1,
            scavenger: -1,
            miner: 0,
            coal_miner: 0,
            craftsman: 0,
            cement_worker: 0,
            banker: 0,
            entertainer: 0,
            priest: 0,
            professor: 0,
            scientist: 0,
            garrison: 0,
            colonist: 0,
            space_miner: 0,
            hell_surveyor: 0,
            crew: 0
        };

        if (global.race['cataclysm']){
            caps['Money'] += 250000;
            caps['Knowledge'] += 100000;
            caps['Lumber'] += 100000;
            caps['Stone'] += 100000;
            caps['Furs'] += 100000;
            caps['Aluminium'] += 100000;
            caps['Steel'] += 100000;
            caps['Copper'] += 100000;
            caps['Iron'] += 100000;
            caps['Coal'] += 100000;
            caps['Cement'] += 100000;
            caps['Titanium'] += 75000;
            caps['Alloy'] += 20000;
            caps['Polymer'] += 20000;
            caps['Uranium'] += 1000;
        }

        var bd_Money = { Base: caps['Money']+'v' };
        var bd_Citizen = {};
        var bd_Slave = {};
        var bd_Mana = { Base: caps['Mana']+'v' };
        var bd_Knowledge = { Base: caps['Knowledge']+'v' };
        var bd_Food = { Base: caps['Food']+'v' };
        var bd_Lumber = { Base: caps['Lumber']+'v' };
        var bd_Stone = { Base: caps['Stone']+'v' };
        var bd_Crystal = { Base: caps['Crystal']+'v' };
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
        var bd_Bolognium = { Base: caps['Bolognium']+'v' };
        var bd_Vitreloy = { Base: caps['Vitreloy']+'v' };
        var bd_Orichalcum = { Base: caps['Orichalcum']+'v' };

        caps[global.race.species] = 0;
        caps['Slave'] = 0;

        if (global.city['pylon']){
            let gain = global.city.pylon.count * spatialReasoning(5);
            caps['Mana'] += gain;            
            bd_Mana[loc('city_pylon')] = gain+'v';
        }
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
            if (global.tech['world_control'] || global.race['cataclysm']){
                g_vol += 10;
            }
            caps['Containers'] += (global.space['garage'].count * g_vol);
            if (global.race['cataclysm']){
                caps['Crates'] += (global.space['garage'].count * g_vol);
            }
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
        if (global.space['spc_casino']){
            lCaps['entertainer'] += global.space['spc_casino'].count;
        }
        if (global.galaxy['resort']){
            lCaps['entertainer'] += p_on['resort'] * 2;
        }
        if (global.city['cement_plant']){
            lCaps['cement_worker'] += global.city['cement_plant'].count * 2;
        }
        if (global.race['parasite']){
            lCaps['garrison'] += 2;
        }
        if (global.city['garrison']){
            lCaps['garrison'] += global.city.garrison.on * (global.tech['military'] >= 5 ? 3 : 2);
            if (global.race['chameleon']){
                lCaps['garrison'] -= global.city.garrison.on;
            }
        }
        if (global.space['space_barracks']){
            let soldiers = global.tech.marines >= 2 ? 4 : 2;
            lCaps['garrison'] += global.space.space_barracks.on * soldiers;
        }
        if (global.interstellar['cruiser']){
            lCaps['garrison'] += int_on['cruiser'] * 3;
        }
        if (p_on['s_gate'] && global.galaxy['starbase']){
            let soldiers = global.tech.marines >= 2 ? 8 : 5;
            lCaps['garrison'] += p_on['starbase'] * soldiers;
        }
        if (!global.tech['world_control']){
            let occ_amount = global.civic.govern.type === 'federation' ? 15 : 20
            for (let i=2; i>=0; i--){
                if (global.civic.foreign[`gov${i}`].occ){
                    lCaps['garrison'] -= occ_amount;
                    if (lCaps['garrison'] < 0){
                        global.civic.foreign[`gov${i}`].occ = false;
                        lCaps['garrison'] += occ_amount;
                        global.civic.garrison.workers += occ_amount;
                        messageQueue(loc('civics_garrison_autodeoccupy_desc',[govTitle(i)]),'danger');
                    }
                }
            }
        }
        if (global.race['slaver'] && global.tech['slaves'] && global.city['slave_pen']) {
            caps['Slave'] = global.city.slave_pen.count * 4;
            bd_Slave[loc('city_slave_pen')] = global.city.slave_pen.count * 4 + 'v';

            if (caps['Slave'] < global.city.slave_pen.slaves){
                global.city.slave_pen.slaves = caps['Slave'];
            }
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
            caps[global.race.species] += p_on['apartment'] * 5;
            bd_Citizen[housingLabel('large')] = (p_on['apartment']  * 5)+'v';
            if (global.tech['home_safe']){
                let gain = (p_on['apartment']  * spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 10000 : 5000) : 2000));
                caps['Money'] += gain;
                bd_Money[housingLabel('large')] = gain+'v';
            }
        }
        if (global.galaxy['consulate'] && global.galaxy.consulate.count >= 1){
            caps[global.race.species] += 10;
            bd_Citizen[loc('galaxy_consulate')] = '10v';
        }
        if (p_on['embassy'] && global.tech.xeno >= 11){
            caps[global.race.species] += 20;
            bd_Citizen[loc('galaxy_embassy')] = '20v';
        }
        if (p_on['embassy'] && global.galaxy['dormitory']){
            caps[global.race.species] += p_on['dormitory'] * 3;
            bd_Citizen[loc('galaxy_dormitory')] = (p_on['dormitory'] * 3)+'v';
        }
        if (global.space['living_quarters']){
            let base = global.race['cataclysm'] ? 2 : 1;
            if (red_on['biodome']){
                let pop = global.tech.mars >= 6 ? 0.1 : 0.05;
                base += pop * red_on['biodome'];
            }
            let gain = Math.round(red_on['living_quarters'] * base);
            caps[global.race.species] += gain;
            lCaps['colonist'] += red_on['living_quarters'];
            bd_Citizen[`${races[global.race.species].solar.red}`] = gain + 'v';

            if (global.race['cataclysm'] && global.tech['home_safe']){
                let gain = (red_on['living_quarters']  * spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 100000 : 50000) : 25000));
                caps['Money'] += gain;
                bd_Money[loc('space_red_living_quarters_title')] = gain+'v';
            }
        }
        if (global.interstellar['habitat'] && p_on['habitat']){
            caps[global.race.species] += p_on['habitat'];
            bd_Citizen[loc('interstellar_habitat_title')] = p_on['habitat'] + 'v';
        }
        if (global.interstellar['luxury_condo'] && p_on['luxury_condo']){
            let cit = p_on['luxury_condo'] * 2;
            caps[global.race.species] += cit;
            bd_Citizen[loc('tech_luxury_condo')] = cit + 'v';
            let gain = (p_on['luxury_condo']  * spatialReasoning(750000));
            caps['Money'] += gain;
            bd_Money[loc('tech_luxury_condo')] = gain+'v';
        }
        if (global.city['lodge']){
            let cit = global.city['lodge'].count;
            caps[global.race.species] += cit;
            bd_Citizen[loc('city_lodge')] = cit + 'v';
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

            if (global.resource.Crystal.display){
                gain = (global.city['shed'].count * (spatialReasoning(8 * multiplier)));
                caps['Crystal'] += gain;
                bd_Crystal[label] = gain+'v';
            }

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

        if (global.galaxy['gateway_depot']){
            let containers = global.tech['world_control'] ? 150 : 100;
            caps['Crates'] += (global.galaxy.gateway_depot.count * containers);
            caps['Containers'] += (global.galaxy.gateway_depot.count * containers);

            let label = loc('galaxy_gateway_depot');
            let multiplier = gatewayStorage();

            if (global.resource.Uranium.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(3000 * multiplier)));
                caps['Uranium'] += gain;
                bd_Uranium[label] = gain+'v';
            }

            if (global.resource.Nano_Tube.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(250000 * multiplier)));
                caps['Nano_Tube'] += gain;
                bd_Nano_Tube[label] = gain+'v';
            }

            if (global.resource.Neutronium.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(9001 * multiplier)));
                caps['Neutronium'] += gain;
                bd_Neutronium[label] = gain+'v';
            }

            if (global.resource.Infernite.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(6660 * multiplier)));
                caps['Infernite'] += gain;
                bd_Infernite[label] = gain+'v';
            }

            if (global.resource.Elerium.display && p_on['gateway_depot'] && p_on['s_gate']){
                let gain = (p_on['gateway_depot'] * (spatialReasoning(200)));
                caps['Elerium'] += gain;
                bd_Elerium[label] = gain+'v';
            }
        }

        if (global.resource.Infernite.display && global.portal['fortress']){
            let gain = spatialReasoning(1000);
            caps['Infernite'] += gain;
            bd_Infernite[loc('portal_fortress_name')] = gain+'v';
        }
        if (global.space['garage']){
            let multiplier = global.tech['particles'] >= 4 ? 1 + (global.tech['supercollider'] / 20) : 1;
            multiplier *= global.tech['world_control'] || global.race['cataclysm'] ? 2 : 1;
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

            if (global.race['cataclysm']){
                gain = (global.space.garage.count * (spatialReasoning(2500 * multiplier)));
                caps['Polymer'] += gain;
                bd_Polymer[loc('space_red_garage_title')] = gain+'v';

                gain = (global.space.garage.count * (spatialReasoning(1500 * multiplier)));
                caps['Coal'] += gain;
                bd_Coal[loc('space_red_garage_title')] = gain+'v';

                if (!global.race['kindling_kindred']){
                    gain = (global.space.garage.count * (spatialReasoning(7500 * multiplier)));
                    caps['Lumber'] += gain;
                    bd_Lumber[loc('space_red_garage_title')] = gain+'v';
                }

                gain = (global.space.garage.count * (spatialReasoning(7500 * multiplier)));
                caps['Stone'] += gain;
                bd_Stone[loc('space_red_garage_title')] = gain+'v';

                gain = (global.space.garage.count * (spatialReasoning(4500 * multiplier)));
                caps['Cement'] += gain;
                bd_Cement[loc('space_red_garage_title')] = gain+'v';

                gain = (global.space.garage.count * (spatialReasoning(2200 * multiplier)));
                caps['Furs'] += gain;
                bd_Furs[loc('space_red_garage_title')] = gain+'v';
            }
        }
        if (global.city['silo']){
            let gain = (global.city['silo'].count * spatialReasoning(500));
            if (global.stats.achieve['blackhole']){ gain = Math.round(gain * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
            caps['Food'] += gain;
            bd_Food[loc('city_silo')] = gain+'v';
        }
        if (global.city['compost']){
            let gain = (global.city['compost'].count * spatialReasoning(200));
            if (global.stats.achieve['blackhole']){ gain = Math.round(gain * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
            caps['Food'] += gain;
            bd_Food[loc('city_compost_heap')] = gain+'v';
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
            bd_Oil[`${races[global.race.species].solar.gas} ${loc('depot')}`] = gain+'v';

            gain = (global.space['gas_storage'].count * spatialReasoning(2500));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Helium_3'] += gain;
            bd_Helium[`${races[global.race.species].solar.gas} ${loc('depot')}`] = gain+'v';

            gain = (global.space['gas_storage'].count * spatialReasoning(1000));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Uranium'] += gain;
            bd_Uranium[`${races[global.race.species].solar.gas} ${loc('depot')}`] = gain+'v';
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
            let gain = +(global.city.shrine.know * 400);
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('city_shrine')] = gain+'v';
        }
        if (global.city['temple'] && global.genes['ancients'] && global.genes['ancients'] >= 2){
            lCaps['priest'] += global.city.temple.count;
        }
        if (global.space['ziggurat'] && global.genes['ancients'] && global.genes['ancients'] >= 4){
            lCaps['priest'] += global.space.ziggurat.count;
        }
        let pirate_alien2 = piracy('gxy_alien2');
        if (global.city['university']){
            let multiplier = 1;
            let base = global.tech['science'] && global.tech['science'] >= 8 ? 700 : 500;
            if (global.tech['science'] >= 4){
                multiplier += global.city['library'].count * 0.02;
            }
            if (global.space['observatory'] && global.space.observatory.count > 0){
                multiplier += (moon_on['observatory'] * 0.05);
            }
            if (global.portal['sensor_drone'] && global.tech['science'] >= 14){
                multiplier += (p_on['sensor_drone'] * 0.02);
            }
            if (global.race['hard_of_hearing']){
                multiplier *= 1 - (traits.hard_of_hearing.vars[0] / 100);
            }
            if (p_on['s_gate'] && gal_on['scavenger']){
                let uni = gal_on['scavenger'] * +(pirate_alien2 / 4).toFixed(1);
                multiplier *= 1 + uni;
            }
            let gain = (global.city['university'].count * base * multiplier);
            lCaps['professor'] += global.city['university'].count;
            if (global.tech['supercollider']){
                let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                let shrine = 1 + (global.city.shrine.know * 0.03);
                gain *= shrine;
            }
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('city_university')] = gain+'v';
        }
        if (global.city['library']){
            let shelving = 125;
            if (global.race['nearsighted']){
                shelving *= 1 - (traits.nearsighted.vars[0] / 100);
            }
            if (global.tech['science'] && global.tech['science'] >= 8){
                shelving *= 1.4;
            }
            if (global.tech['science'] && global.tech['science'] >= 5){
                shelving *= 1 + (global.civic.scientist.workers * 0.12);
            }
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 2){
                shelving *= 1 + (global.race['cataclysm'] ? global.space.ziggurat.count : global.city.temple.count) * 0.05;
            }
            let gain = Math.round(global.city['library'].count * shelving);
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('city_library')] = gain+'v';
            if (global.tech['science'] && global.tech['science'] >= 3){
                global.civic.professor.impact = 0.5 + (global.city.library.count * 0.01)
            }
        }
        if (global.city['wardenclyffe']){
            let gain_base = 1000;
            if (global.city.ptrait === 'magnetic'){
                gain_base += planetTraits.magnetic.vars[1];
            }
            let gain = global.city['wardenclyffe'].count * gain_base;
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
            bd_Knowledge[wardenLabel()] = gain+'v';
        }
        if (global.portal['sensor_drone']){
            let gain = p_on['sensor_drone'] * (global.tech.infernite >= 6 ? 2500 : 1000);
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('portal_sensor_drone_title')] = gain+'v';
        }
        if (global.space['satellite']){
            let gain = (global.space.satellite.count * (global.race['cataclysm'] ? 2000 : 750));
            if (global.race['cataclysm'] && global.tech['supercollider']){
                let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 5: 10;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('space_home_satellite_title')] = gain+'v';
        }
        if (global.space['observatory'] && global.space.observatory.count > 0){
            let gain = (moon_on['observatory'] * 5000);
            if (global.race['cataclysm'] && global.space['satellite'] && global.space.satellite.count > 0){
                gain *= 1 + (global.space.satellite.count * 0.25);
            }

            caps['Knowledge'] += gain;
            bd_Knowledge[loc('space_moon_observatory_title')] = gain+'v';

            if (global.race['cataclysm']){
                lCaps['professor'] += moon_on['observatory'];
            }
        }
        if (global.interstellar['laboratory'] && int_on['laboratory'] > 0){
            if (global.tech.science >= 16){
                lCaps['scientist'] += int_on['laboratory'];
            }
            let gain = (int_on['laboratory'] * 10000);
            if (global.tech.science >= 15){
                gain *= 1 + ((global.race['cataclysm'] ? red_on['exotic_lab'] : global.city.wardenclyffe.count) * 0.02);
            }
            if (global.race['cataclysm'] && p_on['s_gate'] && gal_on['scavenger']){
                gain *= 1 + (gal_on['scavenger'] * +(piracy('gxy_alien2') * 0.75).toFixed(1));
            }
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('interstellar_laboratory_title')] = gain+'v';
        }
        if (global.city['biolab']){
            let gain = 3000;
            if (global.portal['sensor_drone'] && global.tech['science'] >= 14){
                gain *= 1 + (p_on['sensor_drone'] * 0.02);
            }
            caps['Knowledge'] += (p_on['biolab'] * gain);
            bd_Knowledge[loc('city_biolab')] = (p_on['biolab'] * gain)+'v';
        }
        if (p_on['embassy'] && global.galaxy['symposium']){
            let dorm = 1750 * p_on['dormitory'];
            let gtrade = 650 * global.galaxy.trade.cur;
            let leave = 0;
            if (global.tech.xeno >= 7){
                let crew = global.galaxy.defense.gxy_gorddon.scout_ship * (actions.galaxy.gxy_gateway.scout_ship.ship.civ + actions.galaxy.gxy_gateway.scout_ship.ship.mil);
                crew += global.galaxy.defense.gxy_gorddon.corvette_ship * (actions.galaxy.gxy_gateway.corvette_ship.ship.civ + actions.galaxy.gxy_gateway.corvette_ship.ship.mil);
                crew += global.galaxy.defense.gxy_gorddon.frigate_ship * (actions.galaxy.gxy_gateway.frigate_ship.ship.civ + actions.galaxy.gxy_gateway.frigate_ship.ship.mil);
                crew += global.galaxy.defense.gxy_gorddon.cruiser_ship * (actions.galaxy.gxy_gateway.cruiser_ship.ship.civ + actions.galaxy.gxy_gateway.cruiser_ship.ship.mil);
                crew += global.galaxy.defense.gxy_gorddon.dreadnought * (actions.galaxy.gxy_gateway.dreadnought.ship.civ + actions.galaxy.gxy_gateway.dreadnought.ship.mil);

                if (gal_on['freighter']){
                    crew += gal_on['freighter'] * (actions.galaxy.gxy_gorddon.freighter.ship.civ + actions.galaxy.gxy_gorddon.freighter.ship.mil);
                }
                leave = crew * 300;
            }
            let know = (dorm + gtrade + leave) * p_on['symposium'];
            caps['Knowledge'] += know;
            bd_Knowledge[loc('galaxy_symposium')] = know +'v';
        }

        if (global.city['bank'] || (global.race['cataclysm'] && p_on['spaceport'])){
            let vault = global.race['cataclysm'] ? bank_vault() * 4 : bank_vault();
            let banks = global.race['cataclysm'] ? p_on['spaceport'] : global.city['bank'].count;
            let gain = (banks * spatialReasoning(vault));
            caps['Money'] += gain;

            if (global.race['cataclysm']){
                bd_Money[loc('space_red_spaceport_title')] = gain+'v';
            }
            else {
                bd_Money[loc('city_bank')] = gain+'v';
            }            

            if (global.interstellar['exchange']){
                let g_vault = spatialReasoning(int_on['exchange'] * (vault * banks / 18));
                if (global.tech.banking >= 13){
                    if (global.galaxy['freighter']){
                        g_vault *= 1 + (gal_on['freighter'] * 0.03);
                    }
                    if (global.galaxy['super_freighter']){
                        g_vault *= 1 + (gal_on['super_freighter'] * 0.08);
                    }
                }
                g_vault = Math.round(g_vault);
                caps['Money'] += g_vault;
                bd_Money[loc('interstellar_exchange_bd')] = g_vault+'v';
            }
        }
        if (global.city['casino'] || global.space['spc_casino']){
            let casinos = 0;
            if (global.city['casino'] && global.city.casino.count > 0){
                casinos += global.city.casino.count;
            }
            if (global.space['spc_casino'] && global.space.spc_casino.count > 0){
                casinos += global.space.spc_casino.count;
            }
            let casino_capacity = global.tech['gambling'] >= 3 ? 60000 : 40000;
            if (global.tech['gambling'] >= 4){
                casino_capacity += global.tech['gambling'] >= 6 ? 240000 : 60000;
            }
            let vault = casinos * spatialReasoning(casino_capacity);
            if (global.race['gambler']){
                vault *= 1 + (global.race['gambler'] * 0.04);
            }
            if (global.tech['world_control']){
                vault = Math.round(vault * 1.25);
            }
            if (global.tech['stock_exchange'] && global.tech['gambling'] >= 4){
                vault *= 1 + (global.tech['stock_exchange'] * 0.05);
            }
            caps['Money'] += vault;
            bd_Money[loc('city_casino')] = vault+'v';
        }
        if (global.galaxy['resort']){
            let vault = p_on['resort'] * spatialReasoning(global.tech['world_control'] ? 1875000 : 1500000);
            caps['Money'] += vault;
            bd_Money[loc('galaxy_resort')] = vault+'v';
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
            bd_Elerium[loc('space_red_exotic_lab_bd')] = el_gain+'v';
            let sci = 500;
            if (global.tech['science'] >= 13 && global.interstellar['laboratory']){
                sci += int_on['laboratory'] * 25;
            }
            if (global.tech['ancient_study'] && global.tech['ancient_study'] >= 2){
                sci += global.space.ziggurat.count * 15;
            }
            if (global.tech.mass >= 2){
                sci += p_on['mass_driver'] * global.civic.scientist.workers;
            }
            if (global.race['cataclysm'] && moon_on['observatory']){
                sci *= 1 + (moon_on['observatory'] * 0.25);
            }
            if (global.race['cataclysm'] && global.portal['sensor_drone'] && global.tech['science'] >= 14){
                sci *= 1 + (p_on['sensor_drone'] * 0.02);
            }
            let gain = red_on['exotic_lab'] * global.civic.colonist.workers * sci;
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('tech_exotic_bd')] = gain+'v';

            if (global.race['cataclysm']){
                lCaps['scientist'] += red_on['exotic_lab'];
            }
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
            if (global.race['cataclysm']){
                lCaps['cement_worker'] += red_on['fabrication'];
            }
        }
        if (p_on['stellar_forge']){
            lCaps['craftsman'] += p_on['stellar_forge'] * 2;
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
        if (p_on['s_gate'] && global.galaxy['gateway_station']){
            let helium_gain = p_on['gateway_station'] * spatialReasoning(2000);
            caps['Helium_3'] += helium_gain;
            bd_Helium[loc('galaxy_gateway_station')] = helium_gain+'v';

            let deuterium_gain = p_on['gateway_station'] * spatialReasoning(4500);
            caps['Deuterium'] += deuterium_gain;
            bd_Deuterium[loc('galaxy_gateway_station')] = deuterium_gain+'v';

            let gain = p_on['gateway_station'] * spatialReasoning(50);
            caps['Elerium'] += gain;
            bd_Elerium[loc('galaxy_gateway_station')] = gain+'v';
        }
        if (p_on['s_gate'] && p_on['telemetry_beacon']){
            let base_val = global.tech['telemetry'] ? 1200 : 800;
            if (global.tech.science >= 17){
                base_val += gal_on['scout_ship'] * 25;
            }
            let gain = p_on['telemetry_beacon'] ** 2 * base_val;
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('galaxy_telemetry_beacon_bd')] = gain+'v';
        }
        if (p_on['s_gate'] && gal_on['scavenger']){
            let gain = gal_on['scavenger'] * Math.round(pirate_alien2 * 25000);
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('galaxy_scavenger')] = gain+'v';
        }
        if (global.city['trade']){
            let routes = global.race['nomadic'] || global.race['xenophobic'] ? global.tech.trade : global.tech.trade + 1;
            if (global.tech['trade'] && global.tech['trade'] >= 3){
                routes--;
            }
            global.city.market.mtrade = routes * global.city.trade.count;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 3){
                global.city.market.mtrade += global.race['cataclysm'] ? global.space.ziggurat.count : global.city.temple.count;
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
            let routes = 0;
            if (global.race['cataclysm']){
                routes = global.space['gps'] ? Math.floor(global.space.gps.count / 3) : 0;
            }
            else {
                routes = global.city['storage_yard'] ? Math.floor(global.city.storage_yard.count / 6) : 0;
            }
            global.city.market.mtrade += global.tech['railway'] * routes;
        }
        if (global.galaxy['bolognium_ship']){
            lCaps['crew'] += global.galaxy.bolognium_ship.on * actions.galaxy.gxy_gateway.bolognium_ship.ship.civ;
        }
        if (global.galaxy['scout_ship']){
            lCaps['crew'] += global.galaxy.scout_ship.on * actions.galaxy.gxy_gateway.scout_ship.ship.civ;
        }
        if (global.galaxy['corvette_ship']){
            lCaps['crew'] += global.galaxy.corvette_ship.on * actions.galaxy.gxy_gateway.corvette_ship.ship.civ;
        }
        if (global.galaxy['frigate_ship']){
            lCaps['crew'] += global.galaxy.frigate_ship.on * actions.galaxy.gxy_gateway.frigate_ship.ship.civ;
        }
        if (global.galaxy['cruiser_ship']){
            lCaps['crew'] += global.galaxy.cruiser_ship.on * actions.galaxy.gxy_gateway.cruiser_ship.ship.civ;
        }
        if (global.galaxy['dreadnought']){
            lCaps['crew'] += global.galaxy.dreadnought.on * actions.galaxy.gxy_gateway.dreadnought.ship.civ;
        }
        if (global.galaxy['freighter']){
            lCaps['crew'] += global.galaxy.freighter.on * actions.galaxy.gxy_gorddon.freighter.ship.civ;
        }
        if (global.galaxy['super_freighter']){
            lCaps['crew'] += global.galaxy.super_freighter.on * actions.galaxy.gxy_alien1.super_freighter.ship.civ;
        }
        if (global.galaxy['armed_miner']){
            lCaps['crew'] += global.galaxy.armed_miner.on * actions.galaxy.gxy_alien2.armed_miner.ship.civ;
        }
        if (global.galaxy['scavenger']){
            lCaps['crew'] += global.galaxy.scavenger.on * actions.galaxy.gxy_alien2.scavenger.ship.civ;
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
            if (global.tech.science >= 19){
                boost += 0.15;
            }
            let gain = Math.round(caps['Knowledge'] * boost);
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('space_dwarf_collider_title')] = gain+'v';
        }

        breakdown.c = {
            Money: bd_Money,
            [global.race.species]: bd_Citizen,
            Slave: bd_Slave,
            Mana: bd_Mana,
            Knowledge: bd_Knowledge,
            Food: bd_Food,
            Lumber: bd_Lumber,
            Stone: bd_Stone,
            Crystal: bd_Crystal,
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
            Bolognium: bd_Bolognium,
            Vitreloy: bd_Vitreloy,
            Orichalcum: bd_Orichalcum,
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

        for (let i=0; i<3; i++){
            if (global.civic.foreign[`gov${i}`].trn > 0){
                global.civic.foreign[`gov${i}`].trn--;
                if (global.civic.foreign[`gov${i}`].trn === 0){
                    global.civic.foreign[`gov${i}`].spy++;
                }
            }
            if (global.civic.foreign[`gov${i}`].sab > 0){
                global.civic.foreign[`gov${i}`].sab--;
                if (global.civic.foreign[`gov${i}`].sab === 0){
                    switch (global.civic.foreign[`gov${i}`].act){
                        case 'influence':
                            if (Math.floor(Math.seededRandom(0,global.race['blurry'] ? 6 : 4)) === 0){
                                spyCaught(i);
                            }
                            else {
                                let covert = Math.floor(Math.seededRandom(global.tech['spy'] >= 5 ? 2 : 1, global.tech['spy'] >= 5 ? 8 : 6));
                                global.civic.foreign[`gov${i}`].hstl -= covert;
                                if (global.civic.foreign[`gov${i}`].hstl < 0){
                                    global.civic.foreign[`gov${i}`].hstl = 0;
                                }
                                messageQueue(loc('civics_spy_influence_success',[govTitle(i),covert]),'success');
                            }
                            break;
                        case 'sabotage':
                            if (Math.floor(Math.seededRandom(0,global.race['blurry'] ? 5 : 3)) === 0){
                                spyCaught(i);
                            }
                            else {
                                let covert = Math.floor(Math.seededRandom(global.tech['spy'] >= 5 ? 2 : 1, global.tech['spy'] >= 5 ? 8 : 6));
                                global.civic.foreign[`gov${i}`].mil -= covert;
                                if (global.civic.foreign[`gov${i}`].mil < 50){
                                    global.civic.foreign[`gov${i}`].mil = 50;
                                }
                                messageQueue(loc('civics_spy_sabotage_success',[govTitle(i),covert]),'success');
                            }
                            break;
                        case 'incite':
                            if (Math.floor(Math.seededRandom(0,global.race['blurry'] ? 3 : 2)) === 0){
                                spyCaught(i);
                            }
                            else {
                                let covert = Math.floor(Math.seededRandom(global.tech['spy'] >= 5 ? 2 : 1, global.tech['spy'] >= 5 ? 8 : 6));
                                global.civic.foreign[`gov${i}`].unrest += covert;
                                if (global.civic.foreign[`gov${i}`].unrest > 100){
                                    global.civic.foreign[`gov${i}`].unrest = 100;
                                }
                                messageQueue(loc('civics_spy_incite_success',[govTitle(i),covert]),'success');
                            }
                            break;
                        case 'annex':
                            let drawTechs = !global.tech['gov_fed'] && !checkControlling();
                            global.civic.foreign[`gov${i}`].anx = true;
                            messageQueue(loc('civics_spy_annex_success',[govTitle(i)]),'success');
                            if (drawTechs){
                                drawTech();
                            }
                            break;
                        case 'purchase':
                            let drawTechsAlt = !global.tech['gov_fed'] && !checkControlling();
                            global.civic.foreign[`gov${i}`].buy = true;
                            messageQueue(loc('civics_spy_purchase_success',[govTitle(i)]),'success');
                            if (drawTechsAlt){
                                drawTech();
                            }
                            break;
                    }
                }
            }
        }

        if (global.galaxy['defense']){
            let armada_ships = ['dreadnought','cruiser_ship','frigate_ship','corvette_ship','scout_ship']
            for (let i=0; i<armada_ships.length; i++){
                let count = 0;
                Object.keys(global.galaxy.defense).forEach(function (region){
                    if (global.galaxy.defense.hasOwnProperty(region)){
                        count += global.galaxy.defense[region][armada_ships[i]];
                        if (isNaN(global.galaxy.defense[region][armada_ships[i]])){
                            global.galaxy.defense[region][armada_ships[i]] = 0;
                        }
                        if (count > gal_on[armada_ships[i]]){
                            let overflow = count - gal_on[armada_ships[i]];
                            global.galaxy.defense[region][armada_ships[i]] -= overflow;
                        }
                        if (global.galaxy.defense[region][armada_ships[i]] < 0){
                            global.galaxy.defense[region][armada_ships[i]] = 0;
                        }
                    }
                });
                if (count < gal_on[armada_ships[i]]){
                    let underflow = gal_on[armada_ships[i]] - count;
                    global.galaxy.defense.gxy_gateway[armada_ships[i]] += underflow;
                }
            }
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
                    let tc = timeCheck(c_action,false,true);
                    global.city[action]['time'] = timeFormat(tc.t);
                    global.city[action]['bn'] = tc.r;
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

        let spc_locations = ['space','interstellar','galaxy','portal'];
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

        let genePool = arpa('GeneTech');
        Object.keys(genePool).forEach(function (action){
            if (genePool[action] && genePool[action].cost){
                let c_action = genePool[action];
                let element = $('#'+c_action.id);
                if (element.length > 0){
                    if ( (global.race['universe'] !== 'antimatter' && c_action.cost > global.race.Plasmid.count) || (global.race['universe'] === 'antimatter' && c_action.cost > global.race.Plasmid.anti) ){
                        if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                    else if (element.hasClass('cna')){
                        element.removeClass('cna');
                    }
                }
            }
        });

        if (global.space['swarm_control']){            
            global.space.swarm_control.s_max = global.space.swarm_control.count * actions.space.spc_sun.swarm_control.support();
        }

        if (global.arpa['sequence'] && global.arpa.sequence.on && gene_sequence){
            let labs = global.race['cataclysm'] ? red_on['exotic_lab'] : p_on['biolab'];            
            if (labs > 0 && global.city.ptrait === 'toxic'){
                labs += planetTraits.toxic.vars[0];
            }
            global.arpa.sequence.labs = labs;
            global.arpa.sequence.time -= global.arpa.sequence.boost ? labs * 2 : labs;
            global.arpa.sequence.progress = global.arpa.sequence.max - global.arpa.sequence.time;
            if (global.arpa.sequence.time <= 0){
                global.arpa.sequence.max = 50000 * (1 + (global.race.mutation ** 2));
                if (global.race['adaptable']){
                    let adapt = 1 - (traits.adaptable.vars[0] / 100);
                    global.arpa.sequence.max = Math.floor(global.arpa.sequence.max * adapt);
                }
                global.arpa.sequence.progress = 0;
                global.arpa.sequence.time = global.arpa.sequence.max;
                if (global.tech['genetics'] === 2){
                    messageQueue(loc('genome',[races[global.race.species].name]),'success');
                    global.tech['genetics'] = 3;
                }
                else {
                    global.race.mutation++;
                    let trait = randomMinorTrait(1);
                    let gene_multi = 1 + (global.genes['synthesis'] ? global.genes['synthesis'] : 0);
                    let gene = (2 ** (global.race.mutation - 1)) * gene_multi;
                    if (global.stats.achieve['creator']){
                        gene = Math.round(gene * (1 + (global.stats.achieve['creator'].l * 0.5)));
                    }
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
                    let plasmid_type = plasma > 1 ? '_plural' : '';
                    if (global.race['universe'] === 'antimatter'){
                        plasmid_type = loc('resource_AntiPlasmid' + plasmid_type + '_name');
                        global.stats.antiplasmid += plasma;
                        global.race.Plasmid.anti += plasma;
                        unlockAchieve('cross');
                    }
                    else {
                        plasmid_type = loc('resource_Plasmid' + plasmid_type + '_name');
                        global.stats.plasmid += plasma;
                        global.race.Plasmid.count += plasma;
                    }
                    messageQueue(loc('gene_therapy',[loc('trait_' + trait + '_name'),gene,plasma,plasmid_type]),'success');
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

        q_check(false);

        let belt_mining = belt_on['iron_ship'] + belt_on['iridium_ship'];
        if (belt_mining > 0 && global.tech['asteroid'] && global.tech['asteroid'] === 3){
            if (Math.rand(0,250) <= belt_mining){
                global.tech['asteroid'] = 4;
                global.resource.Elerium.display = true;
                modRes('Elerium',1);
                drawTech();
                messageQueue(loc('discover_elerium'),'info');
            }
        }

        if (global.tech['asteroid'] && global.tech.asteroid === 4 && global.resource.Elerium.amount === 0){
            modRes('Elerium',1);
        }

        if (p_on['outpost'] > 0 && global.tech['gas_moon'] && global.tech['gas_moon'] === 1){
            if (Math.rand(0,100) <= p_on['outpost']){
                global.space['oil_extractor'] = { count: 0, on: 0 };
                global.tech['gas_moon'] = 2;
                messageQueue(loc('discover_oil',[races[global.race.species].solar.gas_moon]),'info');
                renderSpace();
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

        if (global.race['casting']){
            let total = 0;
            ['farmer','miner','lumberjack','science','factory','army','hunting'].forEach(function (spell){
                total += global.race.casting[spell];
            });
            global.race.casting.total = total;
        }

        if (global.tech['queue'] && global.queue.display){
            let idx = -1;
            let c_action = false;
            let stop = false;
            let deepScan = ['space','interstellar','galaxy','portal'];
            let time = 0;
            let spent = { t: 0, r: {}, id: {}};
            let arpa = false;
            let queued = {};
            for (let i=0; i<global.queue.queue.length; i++){
                let struct = global.queue.queue[i];
                time = global.settings.qAny ? 0 : time;

                let t_action = false;
                if (struct.type === 'arpa'){
                    t_action = arpaProjects[struct.action];
                }
                else {
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
                }

                if (t_action && t_action['no_queue'] && t_action.no_queue() && !t_action['grant'] && !t_action['q_once']){
                    cleanBuildPopOver(`q${global.queue.queue[i].id}${i}`);
                    global.queue.queue.splice(i,1);
                    buildQueue();
                    break;
                }

                if (t_action){
                    if (queued.hasOwnProperty(global.queue.queue[i].id)){
                        queued[global.queue.queue[i].id] += global.queue.queue[i].q;
                    }
                    else {
                        queued[global.queue.queue[i].id] = global.queue.queue[i].q;
                    }
                    if (t_action['queue_complete']){
                        if (queued[global.queue.queue[i].id] > t_action.queue_complete()){
                            cleanBuildPopOver(`q${global.queue.queue[i].id}${i}`);
                            global.queue.queue[i].q -= queued[global.queue.queue[i].id] - t_action.queue_complete();
                            if (global.queue.queue[i].q <= 0){
                                global.queue.queue.splice(i,1);
                                buildQueue();
                                break;
                            }
                        }
                    }
                }

                if (struct.type === 'arpa'){
                    let remain = (100 - global.arpa[global.queue.queue[i].action].complete) / 100;
                    time += global.settings.qAny ? arpaTimeCheck(t_action, remain) : arpaTimeCheck(t_action, remain, spent);
                    global.queue.queue[i]['time'] = time;
                    if (global.queue.queue[i].q > 1){
                        for (let j=1; j<global.queue.queue[i].q; j++){
                            time += global.settings.qAny ? arpaTimeCheck(t_action, 1) : arpaTimeCheck(t_action, 1, spent);
                        }
                    }
                    global.queue.queue[i]['t_max'] = time;
                    if (global.settings.qAny){
                        if (Math.floor(global.queue.queue[i]['time']) <= 1){
                            if (!stop){
                                c_action = t_action;
                                idx = i;
                                arpa = true;
                            }
                            stop = true;
                        }
                        else {
                            if (!stop){
                                buildArpa(global.queue.queue[i].action,100);
                            }
                        }
                    }
                    else {
                        if (!stop){
                            c_action = t_action;
                            idx = i;
                            arpa = true;
                        }
                        stop = true;
                    }
                }
                else if (t_action['grant'] && global.tech[t_action.grant[0]] && global.tech[t_action.grant[0]] >= t_action.grant[1]){
                    cleanBuildPopOver(`q${global.queue.queue[i].id}${i}`);
                    global.queue.queue.splice(i,1);
                    buildQueue();
                    break;
                }
                else {
                    if (checkAffordable(t_action,true)){
                        global.queue.queue[i].cna = false;
                        if (checkAffordable(t_action) && !stop){
                            c_action = t_action;
                            idx = i;
                            arpa = false;
                        }
                        else {
                            time += global.settings.qAny ? timeCheck(t_action) : timeCheck(t_action, spent);
                        }
                        global.queue.queue[i]['time'] = time;
                        stop = global.settings.qAny ? false : true;
                        if (global.queue.queue[i].q > 1){
                            for (let j=1; j<global.queue.queue[i].q; j++){
                                time += global.settings.qAny ? timeCheck(t_action) : timeCheck(t_action, spent);
                            }
                        }
                        global.queue.queue[i]['t_max'] = time;
                    }
                    else {
                        global.queue.queue[i].cna = true;
                        global.queue.queue[i]['time'] = -1;
                    }
                }
                global.queue.queue[i].qa = global.settings.qAny ? true : false;
            }
            if (idx >= 0 && c_action){
                if (arpa){
                    let label = global.queue.queue[idx].label;
                    if (buildArpa(global.queue.queue[idx].action,100)){
                        messageQueue(loc('build_success',[label]),'success');
                        if (label !== 'Launch Facility') {
                            if (global.queue.queue[idx].q > 1){
                                global.queue.queue[idx].q--;
                            }
                            else {
                                cleanBuildPopOver(`q${global.queue.queue[idx].id}${idx}`);
                                global.queue.queue.splice(idx,1);
                                buildQueue();
                            }
                        }
                    }
                }
                else if (c_action.action()){
                    if (c_action['queue_complete']){
                        if (c_action.queue_complete() <= 0){
                            messageQueue(loc('build_success',[global.queue.queue[idx].label]),'success');
                        }
                    }
                    else {
                        messageQueue(loc('build_success',[global.queue.queue[idx].label]),'success');
                    }
                    if (global.queue.queue[idx].q > 1){
                        global.queue.queue[idx].q--;
                    }
                    else {
                        cleanBuildPopOver(`q${global.queue.queue[idx].id}${idx}`);
                        global.queue.queue.splice(idx,1);
                        buildQueue();
                    }
                    if (c_action['grant']){
                        let tech = c_action.grant[0];
                        global.tech[tech] = c_action.grant[1];
                        removeAction(c_action.id);
                        drawCity();
                        drawTech();
                        renderSpace();
                        renderFortress();
                    }
                    else if (c_action['refresh']){
                        removeAction(c_action.id);
                        drawCity();
                        drawTech();
                        renderSpace();
                        renderFortress();
                    }
                    else {
                        drawCity();
                        renderSpace();
                        renderFortress();
                    }
                }
            }

            let last = false;
            for (let i=0; i<global.queue.queue.length; i++){
                if (last === global.queue.queue[i].id){
                    cleanBuildPopOver(`q${global.queue.queue[i].id}${i}`);
                    global.queue.queue[i-1].q += global.queue.queue[i].q;
                    global.queue.queue.splice(i,1);
                    break;
                }
                last = global.queue.queue[i].id;
            }
        }

        if (global.tech['r_queue'] && global.r_queue.display){
            let idx = -1;
            let c_action = false;
            let stop = false;
            let time = 0;
            let spent = { t: 0, r: {}, id: {}};
            for (let i=0; i<global.r_queue.queue.length; i++){
                let struct = global.r_queue.queue[i];
                let t_action = actions[struct.action][struct.type];
                time = global.settings.qAny ? 0 : time;

                if (t_action['grant'] && global.tech[t_action.grant[0]] && global.tech[t_action.grant[0]] >= t_action.grant[1]){
                    global.r_queue.queue.splice(i,1);
                    cleanTechPopOver(`rq${c_action.id}`);
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
                    if (c_action['post']) {
                        c_action.post();
                    }
                    global.r_queue.queue.splice(idx,1);
                    cleanTechPopOver(`rq${c_action.id}`);
                    resQueue();
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

        if (p_on['soul_forge']){
            vBind({el: `#fort`},'update');
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
            else if ($(this).hasClass('has-text-danger') || $(this).hasClass('has-text-alert')){
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
    const date = new Date();
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
        if (global.civic.govern.rev < 0){
            global.civic.govern.rev = 0;
        }

        if (global.city.ptrait === 'trashed' || global.race['scavenger']){
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
            let healed = global.race['regenerative'] ? traits.regenerative.vars[0] : 1;
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
            let max_bound = 20;
            if (global.race['slow_regen']){
                max_bound *= 1 + (traits.slow_regen.vars[0] / 100);
            }
            if (hc > 0){
                while (hc >= max_bound){
                    healed++;
                    hc -= max_bound;
                }
                if (Math.rand(0,hc) > Math.rand(0,max_bound)){
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

            if (global.race['cataclysm']){
                global.city.calendar.season = -1;
            }
            else {
                let s_segments = global.city.ptrait === 'elliptical' ? 6 : 4;
                let season_length = Math.round(global.city.calendar.orbit / s_segments);
                let days = global.city.calendar.day;
                let season = 0;
                while (days > season_length){
                    days -= season_length;
                    season++;
                }
                if (global.city.ptrait === 'elliptical'){
                    switch (season){
                        case 0:
                            global.city.calendar.season = 0;
                            break;
                        case 1:
                        case 2:
                            global.city.calendar.season = 1;
                            break;
                        case 3:
                            global.city.calendar.season = 2;
                            break;
                        default:
                            global.city.calendar.season = 3;
                            break;
                    }
                }
                else {
                    global.city.calendar.season = season;
                }
            }

            // Weather
            if (global.race['cataclysm']){
                global.city.calendar.wind = 0;
                global.city.calendar.temp = 1;
                global.city.calendar.weather = -1;
            }
            else if (Math.rand(0,5) === 0){
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

            setWeather();
        }

        if (!global.race['cataclysm']){
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
        }

        if (global.tech['decay'] && global.tech['decay'] >= 2){
            let fortify = 0;
            if (global.genes.minor['fortify']){
                fortify += global.genes.minor['fortify'];
            }
            if (global.race.minor['fortify']){
                fortify += global.race.minor['fortify'];
            }
            global.race.gene_fortify = fortify;
        }
        else {
            global.race.gene_fortify = 0;
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

    if (global.tech['xeno'] && global.tech['xeno'] >= 5 && !global.tech['piracy']){
        if (Math.rand(0,5) === 0){
            global.tech['piracy'] = 1;
            messageQueue(loc('galaxy_piracy_msg',[races[global.galaxy.alien2.id].name]),'info');
            renderSpace();
        }
    }
    if (global.tech['piracy']){
        if (global.tech.piracy < 1000){
            global.tech.piracy++;
        }
        else if (global.tech.xeno >= 8 && global.tech.piracy < 2500){
            global.tech.piracy++;
        }
        else if (global.tech['conflict'] && global.tech.piracy < 5000){
            global.tech.piracy++;
        }
    }

    if (global.race['infiltrator']){
        let tech_source = global.tech['world_control'] ? `trait_infiltrator_steal_alt` : `trait_infiltrator_steal`;
        if (global.resource.Knowledge.max >= 4000 && !global.race['steelen'] && global.tech['smelting'] && global.tech.smelting === 1){
            messageQueue(loc(tech_source,[loc('tech_steel')]),'info');
            global.resource.Steel.display = true;
            global.tech.smelting = 2;
            defineIndustry();
            drawTech();
        }
        if (global.resource.Knowledge.max >= 10000 && global.tech['high_tech'] && global.tech.high_tech === 1){
            messageQueue(loc(tech_source,[loc('tech_electricity')]),'info');
            global.tech.high_tech = 2;
            global.city['power'] = 0;
            global.city['powered'] = true;
            global.city['coal_power'] = {
                count: 0,
                on: 0
            };
            drawTech();
            drawCity();
        }
        if (global.resource.Knowledge.max >= 40000 && global.tech['high_tech'] && global.tech.high_tech === 3 && global.tech['titanium']){
            messageQueue(loc(tech_source,[loc('tech_electronics')]),'info');
            global.tech.high_tech = 4;
            if (global.race['terrifying']){
                global.tech['gambling'] = 1;
                global.city['casino'] = { count: 0 };
                global.space['spc_casino'] = { count: 0 };
            }
            drawTech();
            drawCity();
        }
        if (global.resource.Knowledge.max >= 72000 && global.tech['high_tech'] && global.tech.high_tech === 4 && global.tech['uranium']){
            messageQueue(loc(tech_source,[loc('tech_fission')]),'info');
            global.tech.high_tech = 5;
            global.city['fission_power'] = {
                count: 0,
                on: 0
            };
            drawTech();
            drawCity();
        }
        if (global.resource.Knowledge.max >= 105000 && global.tech['high_tech'] && global.tech.high_tech === 6){
            messageQueue(loc(tech_source,[loc('tech_rocketry')]),'info');
            global.tech.high_tech = 7;
            arpa('Physics');
            drawTech();
            drawCity();
        }
        if (global.resource.Knowledge.max >= 310000 && global.tech['high_tech'] && global.tech.high_tech === 9){
            messageQueue(loc(tech_source,[loc('tech_artificial_intelligence')]),'info');
            global.tech.high_tech = 10;
            drawTech();
            drawCity();
        }
        if (global.resource.Knowledge.max >= 420000 && global.tech['high_tech'] && global.tech.high_tech === 10 && global.tech['nano']){
            messageQueue(loc(tech_source,[loc('tech_quantum_computing')]),'info');
            global.tech.high_tech = 11;
            drawTech();
            drawCity();
        }
        if (global.resource.Knowledge.max >= 580000 && global.tech['high_tech'] && global.tech.high_tech === 11 && global.tech['infernite'] && global.tech['stanene'] && global.tech['alpha'] && global.tech['alpha'] >= 2){
            messageQueue(loc(tech_source,[loc('tech_virtual_reality')]),'info');
            global.tech.high_tech = 12;
            drawTech();
            drawCity();
        }
        if (global.resource.Knowledge.max >= 835000 && global.tech['high_tech'] && global.tech.high_tech === 13){
            messageQueue(loc(tech_source,[loc('tech_shields')]),'info');
            global.tech.high_tech = 14;
            global.settings.space.neutron = true;
            global.settings.space.blackhole = true;
            drawTech();
            drawCity();
        }
        if (global.resource.Knowledge.max >= 1420000 && global.tech['high_tech'] && global.tech.high_tech === 14 && global.tech['blackhole'] && global.tech['blackhole'] >= 3){
            messageQueue(loc(tech_source,[loc('tech_ai_core')]),'info');
            global.tech.high_tech = 15;
            global.interstellar['citadel'] = { count: 0, on: 0 };
            drawTech();
            drawCity();
        }
        if (global.resource.Knowledge.max >= 2250000 && global.tech['ai_core'] && global.tech.ai_core === 2){
            messageQueue(loc(tech_source,[loc('tech_graphene_processing')]),'info');
            global.tech.ai_core = 3;
            drawTech();
        }
        if (global.resource.Knowledge.max >= 8075000 && global.tech['science'] && global.tech.science >= 18 && !global.tech['nanoweave']){
            messageQueue(loc(tech_source,[loc('tech_nanoweave')]),'info');
            global.tech['nanoweave'] = 1;
            global.resource.Nanoweave.display = true;
            drawTech();
            loadFoundry();
        }
        if (global.resource.Knowledge.max >= 11590000 && global.tech['high_tech'] && global.tech.high_tech === 16 && global.tech['chthonian'] && global.tech['chthonian'] >= 3){
            messageQueue(loc(tech_source,[loc('tech_orichalcum_analysis')]),'info');
            messageQueue(loc('tech_orichalcum_analysis_result'),'info');
            global.tech.high_tech = 17;
            drawTech();
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
            let tax_cap = global.civic.govern.type === 'oligarchy' ? 50 : 30;
            if (extreme || global.race['terrifying']){
                tax_cap += 20;
            }
            if (global.race['noble']){
                if (global.civic.taxes.tax_rate > (global.civic.govern.type === 'oligarchy' ? 40 : 20)){
                    global.civic.taxes.tax_rate = global.civic.govern.type === 'oligarchy' ? 40 : 20;
                }
            }
            else if (global.civic.taxes.tax_rate > tax_cap){
                global.civic.taxes.tax_rate = tax_cap;
            }
        }

        if (global.race.mutation > 0){
            let total = 0;
            for (let i=0; i<global.race.mutation; i++){
                let mut_level = i + 1;
                let plasma = global.genes['plasma'] ? mut_level : 1;
                if (global.genes['plasma'] && plasma > 3){
                    if (global.genes['plasma'] >= 2){
                        plasma = plasma > 5 ? 5 : plasma;
                    }
                    else {
                        plasma = 3;
                    }
                }
                total += plasma;
            }
            global.race['p_mutation'] = total;
        }

        if (!global.tech['whitehole'] && global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.exotic >= 0.025){
            global.tech['whitehole'] = 1;
            if (global.tech['stablized']){
                delete global.tech['stablized'];
            }
            messageQueue(loc('interstellar_blackhole_unstable'),'danger');
            drawTech();
        }
        else if (global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.exotic >= 0.025){
            if (global.tech['whitehole'] && global.tech['stablized']){
                delete global.tech['stablized'];
                drawTech();
            }
        }

        if (!global.tech['xeno'] && global.galaxy['scout_ship'] && global.galaxy.scout_ship.on > 0 && Math.rand(0, 10) === 0){
            global.tech['xeno'] = 1;
            global.galaxy.scout_ship.count--;
            global.galaxy.scout_ship.on--;
            global.galaxy.scout_ship.crew--;
            global.galaxy.scout_ship.mil--;
            global.resource[global.race.species].amount--;
            global.civic.garrison.workers--;
            global.civic.garrison.crew--;
            messageQueue(loc('galaxy_encounter'),'info');
            drawTech();
        }

        if (global.galaxy['scavenger'] && global.tech['conflict'] && global.tech['conflict'] === 4 && gal_on['scavenger'] > 0 && Math.rand(0, 50) >= gal_on['scavenger']){
            global.tech['conflict'] = 5;
            messageQueue(loc('galaxy_scavenger_find'),'info');
            drawTech();
        }

        if (global.arpa.sequence && global.arpa.sequence['auto'] && global.tech['genetics'] && global.tech['genetics'] === 7){
            buildGene();
        }
    }

    if (date.getMonth() === 11 && date.getDate() >= 17 && date.getDate() <= 24){
        global.special.gift = true;
        global.tech['santa'] = 1;
        global.special.egg = {
            egg1: false,
            egg2: false,
            egg3: false,
            egg4: false,
            egg5: false,
            egg6: false,
            egg7: false,
            egg8: false,
            egg9: false,
            egg10: false,
            egg11: false,
            egg12: false
        };
    }
    else {
        delete global.tech['santa'];
    }

    if (date.getMonth() === 3 && date.getDate() === 1){
        if (!$(`body`).hasClass('fool')){
            $(`body`).addClass('fool');
            drawAchieve({fool: true});
        }
    }
    else if ($(`body`).hasClass('fool')){
        $(`body`).removeClass('fool');
        drawAchieve();
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

function q_check(load){
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
        if (global.interstellar['citadel']){
            let citadel = load ? global.interstellar.citadel.on : p_on['citadel']
            if (global.tech['high_tech'] && global.tech['high_tech'] >= 15 && citadel > 0){
                qbits *= 1 + (citadel * 0.05);
            }
        }
        set_qlevel(qbits);
    }
}

function diffCalc(res,period){
    let sec = global.race['slow'] ? 1100 : 1000;
    if (global.race['hyper']){
        sec = Math.floor(sec * 0.95);
    }

    global.resource[res].diff = +(global.resource[res].delta / (period / sec)).toFixed(2);
    global.resource[res].delta = 0;

    if (global.resource[res].hasOwnProperty('gen') && global.resource[res].hasOwnProperty('gen_d')){
        global.resource[res].gen = +(global.resource[res].gen_d / (period / sec)).toFixed(2);
        global.resource[res].gen_d = 0;
    }

    if (global.race['decay']){
        if (global.resource[res].diff < 0){
            if (breakdown.p.consume[res][loc('evo_challenge_decay')] > global.resource[res].diff){
                if (!$(`#res${res} .diff`).hasClass('has-text-danger')){
                    $(`#res${res} .diff`).removeClass('has-text-warning');
                    $(`#res${res} .diff`).addClass('has-text-danger');
                }
            }
            else {
                if (!$(`#res${res} .diff`).hasClass('has-text-warning')){
                    $(`#res${res} .diff`).removeClass('has-text-danger');
                    $(`#res${res} .diff`).addClass('has-text-warning');
                }
            }
        }
        else if (global.resource[res].diff >= 0 && ($(`#res${res} .diff`).hasClass('has-text-danger') || $(`#res${res} .diff`).hasClass('has-text-warning'))){
            $(`#res${res} .diff`).removeClass('has-text-danger');
            $(`#res${res} .diff`).removeClass('has-text-warning');
        }
    }
    else {
        if (global.resource[res].diff < 0 && !$(`#res${res} .diff`).hasClass('has-text-danger')){
            $(`#res${res} .diff`).addClass('has-text-danger');
        }
        else if (global.resource[res].diff >= 0 && $(`#res${res} .diff`).hasClass('has-text-danger')){
            $(`#res${res} .diff`).removeClass('has-text-danger');
        }
    }
}

function steelCheck(){
    if (global.resource.Steel.display === false && Math.rand(0,1250) === 0){
        global.resource.Steel.display = true;
        modRes('Steel',1);
        messageQueue(loc('steel_sample'),'info');
    }
}

function setWeather(){
    // Moon Phase
    let easter = getEaster();
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
            let egg = easterEgg(2);
            if (egg.length > 0){
                $('#moon').append(egg);
            }
            else {
                $('#moon').addClass('wi-moon-full');
            }
            break;
        case 15:
            $('#moon').empty();
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

function spyCaught(i){
    if (global.civic.foreign[`gov${i}`].spy > 0){
        global.civic.foreign[`gov${i}`].spy -= global.race['elusive'] ? 0 : 1;
    }
    switch (i){
        case 0:
            messageQueue(loc(global.race['elusive'] ? 'event_spy_fail' : 'event_spy',[govTitle(i)]),'danger');
            break;
        case 1:
            messageQueue(loc(global.race['elusive'] ? 'event_spy_fail' : 'event_spy',[govTitle(i)]),'danger');
            break;
        case 2:
            messageQueue(loc(global.race['elusive'] ? 'event_spy_fail' : 'event_spy',[govTitle(i)]),'danger');
            break;
    }
}

function enableScript(){
    window.evolve = {
        actions: deepClone(actions),
        races: deepClone(races),
        tradeRatio: JSON.parse(JSON.stringify(tradeRatio)),
        craftCost: JSON.parse(JSON.stringify(craftCost())),
        atomic_mass: JSON.parse(JSON.stringify(atomic_mass)),
        checkTechRequirements: deepClone(checkTechRequirements),
        global: {},
        breakdown: {},
    };
}

intervals['version_check'] = setInterval(function(){
    $.ajax({
        url: 'https://pmotschmann.github.io/Evolve/package.json',
        type: 'GET',
        dataType: 'json',
        success: function(res){
            if (res['version'] && res['version'] != global['version'] && !global['beta']){
                $('#topBar .version > a').html('<span class="has-text-warning">Update Available</span> v'+global.version);
            }
        }
    });
}, 900000);

let changeLog = $(`<div class="infoBox"></div>`);
popover('versionLog',getTopChange(changeLog),{ wide: true });

if (global.race['start_cataclysm']){
    start_cataclysm();
}
