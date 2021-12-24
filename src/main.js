import { global, save, webWorker, intervals, keyMap, resizeGame, breakdown, sizeApproximation, keyMultiplier, power_generated, p_on, support_on, int_on, gal_on, spire_on, set_qlevel, quantum_level } from './vars.js';
import { loc } from './locale.js';
import { unlockAchieve, checkAchievements, drawAchieve, alevel, universeAffix, challengeIcon, unlockFeat } from './achieve.js';
import { gameLoop, vBind, popover, clearPopper, flib, tagEvent, clearElement, timeCheck, arpaTimeCheck, timeFormat, powerModifier, modRes, initMessageQueue, messageQueue, calc_mastery, calcPillar, darkEffect, calcQueueMax, calcRQueueMax, buildQueue, shrineBonusActive, getShrineBonus, eventActive, easterEgg, easterEggBind, trickOrTreatBind, powerGrid, deepClone } from './functions.js';
import { races, traits, racialTrait, randomMinorTrait, biomes, planetTraits, genusVars, shapeShift } from './races.js';
import { defineResources, resource_values, spatialReasoning, craftCost, plasmidBonus, faithBonus, tradeRatio, craftingRatio, crateValue, containerValue, tradeSellPrice, tradeBuyPrice, atomic_mass, supplyValue, galaxyOffers } from './resources.js';
import { defineJobs, job_desc, loadFoundry, farmerValue } from './jobs.js';
import { f_rate, manaCost, setPowerGrid, gridEnabled, gridDefs, nf_resources } from './industry.js';
import { defineIndustry, checkControlling, garrisonSize, armyRating, govTitle, govCivics } from './civics.js';
import { actions, updateDesc, setChallengeScreen, addAction, BHStorageMulti, storageMultipler, checkAffordable, drawCity, drawTech, gainTech, removeAction, evoProgress, housingLabel, updateQueueNames, wardenLabel, setPlanet, resQueue, bank_vault, start_cataclysm, raceList } from './actions.js';
import { renderSpace, fuel_adjust, int_fuel_adjust, zigguratBonus, setUniverse, universe_types, gatewayStorage, piracy, spaceTech } from './space.js';
import { renderFortress, bloodwar, soulForgeSoldiers, hellSupression, genSpireFloor, mechRating, mechCollect, updateMechbay } from './portal.js';
import { syndicate, shipFuelUse, spacePlanetStats, genXYcoord, shipCrewSize, storehouseMultiplier, tritonWar, sensorRange, erisWar, calcAIDrift } from './truepath.js';
import { arpa, buildArpa } from './arpa.js';
import { events, eventList } from './events.js';
import { govern, govActive } from './governor.js';
import { production } from './prod.js';
import { swissKnife } from './tech.js';
import { vacuumCollapse } from './resets.js';
import { index, mainVue, initTabs, loadTab } from './index.js';
import { getTopChange } from './wiki/change.js';
import { enableDebug, updateDebugData } from './debug.js';

{
    $(document).ready(function() {
        if (!window.matchMedia)
            return;

        var current = $('head > link[rel="icon"][media]');
        $.each(current, function(i, icon) {
            var match = window.matchMedia(icon.media);
            function swap() {
                if (match.matches) {
                    current.remove();
                    current = $(icon).appendTo('head');
                }
            }
            match.addListener(swap);
            swap();
        });
    });
}

var multitab = false;
window.addEventListener('storage', (e) => {
    if (multitab === false){
        messageQueue(loc(`multitab_warning`), 'danger', true);
    }
    multitab = true;
});

if (global.settings.expose){
    enableDebug();
}

var quickMap = {
    showCiv: 1,
    showCivic: 2,
    showResearch: 3,
    showResources: 4,
    showGenetics: 5,
    showAchieve: 6,
    settings: 7
};

$(document).keydown(function(e){
    e = e || window.event;
    let key = e.key || e.keyCode;
    Object.keys(keyMap).forEach(function(k){
        if (key === global.settings.keyMap[k]){
            keyMap[k] = true;
        }
    });
    if (!$(`input`).is(':focus') && !$(`textarea`).is(':focus')){
        Object.keys(quickMap).forEach(function(k){
            if (key === global.settings.keyMap[k] && global.settings.civTabs !== 0 && (k === 'settings' || global.settings[k])){
                global.settings.civTabs = quickMap[k];
                if (!global.settings.tabLoad){
                    loadTab(global.settings.civTabs);
                }
            }
        });
    }
});
$(document).keyup(function(e){
    e = e || window.event;
    let key = e.key || e.keyCode;
    Object.keys(keyMap).forEach(function(k){
        if (key === global.settings.keyMap[k]){
            keyMap[k] = false;
        }
    });
});
$(document).mousemove(function(e){
    e = e || window.event;
    Object.keys(global.settings.keyMap).forEach(function(k){
        switch(global.settings.keyMap[k]){
            case 'Shift':
            case 16:
                keyMap[k] = e.shiftKey ? true : false;
                break;
            case 'Control':
            case 17:
                keyMap[k] = e.ctrlKey ? true : false;
                break;
            case 'Alt':
            case 18:
                keyMap[k] = e.altKey ? true : false;
                break;
            case 'Meta':
            case 91:
                keyMap[k] = e.metaKey ? true : false;
                break;
        }
    });
});

index();
var revision = global['revision'] ? global['revision'] : '';
if (global['beta']){
    $('#topBar .version > a').html(`v${global.version} Beta ${global.beta}${revision}`);
}
else {
    $('#topBar .version > a').html('v'+global.version+revision);
}

initMessageQueue();

if (global.lastMsg){
    Object.keys(global.lastMsg).forEach(function (tag){
        global.lastMsg[tag].reverse().forEach(function(msg){
            messageQueue(msg.m, msg.c, true, [tag], true);
        });
        global.lastMsg[tag].reverse();
    });
}

$(`#msgQueue`).height(global.settings.msgQueueHeight);
$(`#buildQueue`).height(global.settings.buildQueueHeight);

if (global.queue.rename === true){
    updateQueueNames(true);
    global.queue.rename = false;
}

global.settings.sPackMsg = save.getItem('string_pack_name') ? loc(`string_pack_using`,[save.getItem('string_pack_name')]) : loc(`string_pack_none`);

if (global.queue.display){
    calcQueueMax();
}
if (global.r_queue.display){
    calcRQueueMax();
}

mainVue();

if (global['new']){
    messageQueue(loc('new'), 'warning',false,['progress']);
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
if (global.portal['hell_forge']){
    p_on['hell_forge'] = global.portal.hell_forge.on;
}
if (global.space['sam']){
    p_on['sam'] = global.space.sam.on;
}
if (global.space['operating_base']){
    p_on['operating_base'] = global.space.operating_base.on;
    support_on['operating_base'] = global.space.operating_base.on;
}
if (global.space['fob']){
    p_on['fob'] = global.space.fob.on;
}

defineJobs(true);
defineResources();
initTabs();
buildQueue();
if (global.race['shapeshifter']){
    shapeShift(false,true);
}

Object.keys(gridDefs()).forEach(function(gridtype){
    powerGrid(gridtype);
});

resizeGame();

vBind({
    el: '#race',
    data: {
        race: global.race,
        city: global.city
    },
    methods: {
        name(){
            return flib('name');
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

popover('race',
    function(){
        return typeof races[global.race.species].desc === 'string' ? races[global.race.species].desc : races[global.race.species].desc();
    },{
        elm: '#race > .name'
    }
);

var moraleCap = 125;

popover('morale',
    function(obj){
        if (global.city.morale.unemployed !== 0){
            let type = global.city.morale.unemployed > 0 ? 'success' : 'danger';
            obj.popper.append(`<p class="modal_bd"><span>${loc(global.race['playful'] ? 'morale_hunter' : 'morale_unemployed')}</span> <span class="has-text-${type}"> ${+(global.city.morale.unemployed).toFixed(1)}%</span></p>`);
        }
        if (global.city.morale.stress !== 0){
            let type = global.city.morale.stress > 0 ? 'success' : 'danger';
            obj.popper.append(`<p class="modal_bd"><span>${loc('morale_stress')}</span> <span class="has-text-${type}"> ${+(global.city.morale.stress).toFixed(1)}%</span></p>`);
        }

        let total = 100 + global.city.morale.unemployed + global.city.morale.stress;
        Object.keys(global.city.morale).forEach(function (morale){
            if (!['current','unemployed','stress','season','cap','potential'].includes(morale) && global.city.morale[morale] !== 0){
                total += global.city.morale[morale];
                let type = global.city.morale[morale] > 0 ? 'success' : 'danger';

                let value = global.city.morale[morale];
                if (morale === 'entertain' && global.civic.govern.type === 'democracy'){
                    let democracy = global.tech['high_tech'] && global.tech['high_tech'] >= 2 ? ( global.tech['high_tech'] >= 12 ? 1.3 : 1.25 ) : 1.2;
                    value /= democracy;
                }

                obj.popper.append(`<p class="modal_bd"><span>${loc(`morale_${morale}`)}</span> <span class="has-text-${type}"> ${+(value).toFixed(1)}%</span></p>`)

                if (morale === 'entertain' && global.civic.govern.type === 'democracy'){
                    let democracy = global.tech['high_tech'] && global.tech['high_tech'] >= 2 ? ( global.tech['high_tech'] >= 12 ? 30 : 25 ) : 20;
                    obj.popper.append(`<p class="modal_bd"><span>ᄂ${loc('govern_democracy')}</span> <span class="has-text-success"> +${democracy}%</span></p>`);
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
            let penalty = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? 5 : 10;
            total -= penalty;
            obj.popper.append(`<p class="modal_bd"><span>${loc('govern_corpocracy')}</span> <span class="has-text-danger"> -${penalty}%</span></p>`);
        }
        if (global.civic.govern.type === 'republic'){
            let repub = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 40 : 30 ) : 20;
            total += repub;
            obj.popper.append(`<p class="modal_bd"><span>${loc('govern_republic')}</span> <span class="has-text-success"> +${repub}%</span></p>`);
        }
        if (global.civic.govern.type === 'federation'){
            total += 10;
            obj.popper.append(`<p class="modal_bd"><span>${loc('govern_federation')}</span> <span class="has-text-success"> +10%</span></p>`);
        }

        let milVal = govActive('militant',1);
        if (milVal){
            total -= milVal;
            obj.popper.append(`<p class="modal_bd"><span>${loc('gov_trait_militant')}</span> <span class="has-text-danger"> -${milVal}%</span></p>`);
        }

        if (global.race['cheese']){
            total++;
            obj.popper.append(`<p class="modal_bd"><span>${swissKnife(true,false)}</span> <span class="has-text-success"> +1%</span></p>`);
        }

        total = +(total).toFixed(1);

        obj.popper.append(`<div class="modal_bd sum"><span>${loc('morale_total')}</span> <span class="has-text-warning"> ${+(total).toFixed(1)}%</span></div>`);
        obj.popper.append(`<div class="modal_bd"><span>${loc('morale_max')}</span> <span class="has-text-${total > moraleCap ? 'caution' : 'warning'}"> ${+(moraleCap).toFixed(1)}%</span></div>`);
        obj.popper.append(`<div class="modal_bd"><span>${loc('morale_current')}</span> <span class="has-text-warning"> ${+(global.city.morale.current).toFixed(1)}%</span></div>`);

        return undefined;
    },
    {
        classes: `has-background-light has-text-dark`
    }
);

popover('powerStatus',function(obj){
        let drain = +(global.city.power_total - global.city.power).toFixed(2);
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


if (global.settings.pause){
    $(`#pausegame`).addClass('pause');
}
else {
    $(`#pausegame`).addClass('play');
}

vBind({
    el: '#topBar',
    data: {
        city: global.city,
        race: global.race,
        s: global.settings
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
        },
        atRemain(){
            return loc(`accelerated_time`);
        },
        pause(){
            $(`#pausegame`).removeClass('play');
            $(`#pausegame`).removeClass('pause');
            if (global.settings.pause){
                global.settings.pause = false;
                $(`#pausegame`).addClass('play');
            }
            else {
                global.settings.pause = true;
                $(`#pausegame`).addClass('pause');
            }
            if (!global.settings.pause && !webWorker.s){
                gameLoop('start');
            }
        },
        pausedesc(){
            return global.settings.pause ? loc('game_play') : loc('game_pause');
        }
    },
    filters: {
        planet(species){
            return races[species].home;
        },
        universe(universe){
            return universe === 'standard' || universe === 'bigbang' ? '' : universe_types[universe].name;
        },
        remain(at){
            let minutes = Math.ceil(at * 2.5 / 60);
            if (minutes > 0){
                let hours = Math.floor(minutes / 60);
                minutes -= hours * 60;
                return `${hours}:${minutes.toString().padStart(2,'0')}`;
            }
            return;
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
            let race = flib('name');
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
                challenges = challenges + `<div>${loc('evo_challenge_junker_desc')} ${loc('evo_challenge_junker_conditions')}</div>`;
            }
            if (global.race['joyless']){
                challenges = challenges + `<div>${loc('evo_challenge_joyless_desc')} ${loc('evo_challenge_joyless_conditions')}</div>`;
            }
            if (global.race['steelen']){
                challenges = challenges + `<div>${loc('evo_challenge_steelen_desc')} ${loc('evo_challenge_steelen_conditions')}</div>`;
            }
            if (global.race['decay']){
                challenges = challenges + `<div>${loc('evo_challenge_decay_desc')} ${loc('evo_challenge_decay_conditions')}</div>`;
            }
            if (global.race['emfield']){
                challenges = challenges + `<div>${loc('evo_challenge_emfield_desc')} ${loc('evo_challenge_emfield_conditions')}</div>`;
            }
            if (global.race['inflation']){
                challenges = challenges + `<div>${loc('evo_challenge_inflation_desc')} ${loc('evo_challenge_inflation_conditions')}</div>`;
            }
            if (global.race['banana']){
                challenges = challenges + `<div>${loc('evo_challenge_banana_desc')} ${loc('wiki_achieve_banana1')}. ${loc('wiki_achieve_banana2')}. ${loc('wiki_achieve_banana3')}. ${loc('wiki_achieve_banana4',[500])}. ${loc('wiki_achieve_banana5',[50])}.</div>`;
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

challengeIcon();

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
    if (global.evolution['sexual_reproduction'] && !global.evolution['phagocytosis'] && !global.evolution['chloroplasts'] && !global.evolution['chitin'] && !global.evolution['exterminate']){
        addAction('evolution','sexual_reproduction');
    }
    else if ((global.evolution['phagocytosis'] || global.evolution['chloroplasts'] || global.evolution['chitin'] || global.race['exterminate']) && !global.evolution['multicellular']){
        addAction('evolution','phagocytosis');
        addAction('evolution','chloroplasts');
        addAction('evolution','chitin');
        if (global.stats.achieve['obsolete'] && global.stats.achieve[`obsolete`].l >= 5){
            addAction('evolution','exterminate');
        }
    }
    else {
        let late_actions = ['multicellular','spores','poikilohydric','bilateral_symmetry','bryophyte','athropods','mammals','eggshell','endothermic','ectothermic','humanoid','gigantism','dwarfism','animalism','carnivore','herbivore','omnivore','aquatic','fey','sand','heat','polar','demonic','celestial','synthetic','sentience','bunker'];
        for (var i = 0; i < late_actions.length; i++){
            if (global.evolution[late_actions[i]] && global.evolution[late_actions[i]].count == 0){
                addAction('evolution',late_actions[i]);
            }
        }

        let race_options = raceList;

        const custom_map = {
            humanoid: 'humanoid',
            animal: 'animalism',
            carnivore: 'carnivore',
            herbivore: 'herbivore',
            omnivore: 'omnivore',
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
            angelic: 'celestial',
            synthetic: 'exterminate'
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
        setChallengeScreen();
    }
}
else {
    if (global.portal.hasOwnProperty('soul_forge') && global.portal.soul_forge.on){
        p_on['soul_forge'] = 1;
    }
    setWeather();
}

q_check(true);

$('#lbl_city').html('Village');

if (window.Worker){
    webWorker.w = new Worker("evolve/evolve.js");
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
gameLoop('start');

resourceAlt();

var firstRun = true;
var gene_sequence = global.arpa['sequence'] && global.arpa['sequence']['on'] ? global.arpa.sequence.on : 0;
function fastLoop(){
    if (!global.race['no_craft']){
        $('.craft').each(function(e){
            if (typeof $(this).data('val') === 'number'){
                $(this).html(sizeApproximation($(this).data('val') * keyMultiplier(),1));
            }
        });
    }
    const date = new Date();

    breakdown.p['Global'] = {};
    var global_multiplier = 1;
    let applyPlasmid = false;
    let pBonus = plasmidBonus('raw');
    if (global.race.Plasmid.count > 0 && ((global.race.universe !== 'antimatter') || (global.genes['bleed'] && global.race.universe === 'antimatter'))){
        breakdown.p['Global'][loc('resource_Plasmid_name')] = (pBonus[1] * 100) + '%';
        applyPlasmid = true;
    }
    if (global.race.Plasmid.anti > 0 && ((global.race.universe === 'antimatter') || (global.genes['bleed'] && global.genes['bleed'] >= 2 && global.race.universe !== 'antimatter'))){
        breakdown.p['Global'][loc('resource_AntiPlasmid_name')] = (pBonus[2] * 100) + '%';
        applyPlasmid = true;
    }
    if (applyPlasmid){
        global_multiplier += pBonus[0];
    }
    if (global.race['no_plasmid'] || global.race.universe === 'antimatter'){
        if ((global.race['cataclysm'] && global.space['ziggurat'] && global.space.ziggurat.count) || (global.city['temple'] && global.city['temple'].count)){
            let faith = faithBonus();
            breakdown.p['Global'][loc('faith')] = (faith * 100) + '%';
            global_multiplier *= (1 + faith);
        }
    }
    if (global.race['ascended']){
        breakdown.p['Global'][loc('achieve_ascended_name')] = `5%`;
        global_multiplier *= 1.05;
    }
    if (global.race['corruption']){
        let corruption = global.race['corruption'] * 2;
        breakdown.p['Global'][loc('achieve_corrupted_name')] = `${corruption}%`;
        global_multiplier *= 1 + (corruption / 100);
    }
    if (global.race['untapped']){
        if (global.race['untapped'] > 0){
            let untapped = +(global.race.untapped / (global.race.untapped + 20) / 10 + 0.00024).toFixed(4);
            breakdown.p['Global'][loc('trait_untapped_bd')] = `${untapped * 100}%`;
            global_multiplier *= 1 + (untapped);
        }
    }
    if (global.race['rainbow_active'] && global.race['rainbow_active'] > 1){
        breakdown.p['Global'][loc('trait_rainbow_bd')] = `${traits.rainbow.vars()[0]}%`;
        global_multiplier *= 1 + (traits.rainbow.vars()[0] / 100);
    }
    if (global.tech['world_control']){
        let bonus = 25;
        if (global.civic.govern.type === 'federation'){
            bonus = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 40 : 36 ) : 32;
        }
        breakdown.p['Global'][loc('tech_unification')] = `${bonus}%`;
        global_multiplier *= 1 + (bonus / 100);
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
    if (global['pillars']){
        let harmonic = calcPillar();
        breakdown.p['Global'][loc('harmonic')] = `${(harmonic[0] - 1) * 100}%`;
        global_multiplier *= harmonic[0];
    }
    if (global.race['suction_grip']){
        breakdown.p['Global'][loc('trait_suction_grip_bd')] = '8%';
        global_multiplier *= 1 + (traits.suction_grip.vars()[0] / 100);
    }
    if (global.race['intelligent']){
        let bonus = (global.civic.scientist.workers * traits.intelligent.vars()[1]) + (global.civic.professor.workers * traits.intelligent.vars()[0]);
        breakdown.p['Global'][loc('trait_intelligent_bd')] = bonus+'%';
        global_multiplier *= 1 + (bonus / 100);
    }
    if (global.race['slaver'] && global.city['slave_pen'] && global.city['slave_pen']){
        let bonus = (global.city.slave_pen.slaves * traits.slaver.vars()[0]);
        breakdown.p['Global'][loc('trait_slaver_bd')] = bonus+'%';
        global_multiplier *= 1 + (bonus / 100);
    }
    if ((global.city.ptrait === 'trashed' || global.race['scavenger']) && global.civic['scavenger'] && global.civic.scavenger.workers > 0){
        let bonus = (global.civic.scavenger.workers * traits.scavenger.vars()[0]);
        if (global.city.ptrait === 'trashed' && global.race['scavenger']){
            bonus *= 1 + (traits.scavenger.vars()[1] / 100);
        }
        breakdown.p['Global'][loc('job_scavenger')] = bonus+'%';
        global_multiplier *= 1 + (bonus / 100);
    }
    if (global.city.ptrait === 'mellow'){
        breakdown.p['Global'][loc('planet_mellow_bd')] = '-10%';
        global_multiplier *= planetTraits.mellow.vars()[2];
    }
    if (global.city.ptrait === 'ozone' && global.city['sun']){
        let uv = global.city['sun'] * 0.25;
        breakdown.p['Global'][loc('planet_ozone_bd')] = `-${uv}%`;
        global_multiplier *= 1 - (uv / 100);
    }
    if (global.race['smoldering'] && global.city['hot']){
        let heat = 0;
        if (global.city['hot'] > 100){
            heat += 100 * traits.smoldering.vars()[1];
            heat += (global.city['hot'] - 100) * traits.smoldering.vars()[2];
        }
        else {
            heat = global.city['hot'] * traits.smoldering.vars()[1];
        }
        breakdown.p['Global'][loc('trait_smoldering_name')] = `${heat}%`;
        global_multiplier *= 1 + (heat / 100);
    }
    if (global.race['heat_intolerance'] && global.city['hot']){
        let heat = global.city['hot'] * traits.heat_intolerance.vars()[0];
        breakdown.p['Global'][loc('hot')] = `-${heat}%`;
        global_multiplier *= 1 - (heat / 100);
    }
    if (global.race['chilled'] && global.city['cold']){
        let cold = 0;
        if (global.city['cold'] > 100){
            cold += 100 * traits.chilled.vars()[1];
            cold += (global.city['cold'] - 100) * traits.chilled.vars()[2];
        }
        else {
            cold = global.city['cold'] * traits.chilled.vars()[1];
        }
        breakdown.p['Global'][loc('trait_chilled_name')] = `${cold}%`;
        global_multiplier *= 1 + (cold / 100);
    }
    if (global.race['cold_intolerance'] && global.city['cold']){
        let cold = global.city['cold'] * traits.cold_intolerance.vars()[0];
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
    if (global.civic.govern['scandal'] && global.civic.govern.scandal > 0){
        let muckVal = govActive('muckraker',0);
        if (muckVal){
            breakdown.p['Global'][loc('event_scandal')] = `-${muckVal}%`;
            global_multiplier *= 1 - (muckVal / 100);
        }
    }
    if (global.race['calm'] && global.city['meditation'] && global.resource.Zen.display) {
        let zen = global.resource.Zen.amount / (global.resource.Zen.amount + 5000);
        breakdown.p['Global'][loc('trait_calm_bd')] = `+${(zen * 100).toFixed(2)}%`;
        global_multiplier *= 1 + zen;
    }
    if (global.city['firestorm'] && global.city.firestorm > 0){
        global.city.firestorm--;
        breakdown.p['Global'][loc('event_flare_bd')] = `-${20}%`;
        global_multiplier *= 0.8;
    }

    if (
        (races[global.race.species].type === 'aquatic' && global.city.biome !== 'oceanic') ||
        (races[global.race.species].type === 'fey' && global.city.biome !== 'forest') ||
        (races[global.race.species].type === 'heat' && global.city.biome !== 'volcanic') ||
        (races[global.race.species].type === 'polar' && global.city.biome !== 'tundra') ||
        (races[global.race.species].type === 'sand' && global.city.biome !== 'desert') ||
        (races[global.race.species].type === 'demonic' && global.city.biome !== 'hellscape') ||
        (races[global.race.species].type === 'angelic' && global.city.biome !== 'eden')
    ){
        if (global.blood['unbound'] && global.blood.unbound >= 4){
            breakdown.p['Global'][loc('unsuited')] = `-${5}%`;
            global_multiplier *= 0.95;
        }
        else if (global.blood['unbound'] && global.blood.unbound >= 2){
            breakdown.p['Global'][loc('unsuited')] = `-${10}%`;
            global_multiplier *= 0.9;
        }
        else {
            breakdown.p['Global'][loc('unsuited')] = `-${20}%`;
            global_multiplier *= 0.8;
        }
    }

    if (global.race['hibernator'] && global.city.calendar.season === 3){
        global_multiplier *= 1 - (traits.hibernator.vars()[1] / 100);
        breakdown.p['Global'][loc('morale_winter')] = `-${traits.hibernator.vars()[1]}%`;
    }

    if (global.race.universe === 'magic' && global.tech['syphon']){
        let entropy = global.tech.syphon / 8;
        breakdown.p['Global'][loc('arpa_syphon_damage')] = `-${entropy}%`;
        global_multiplier *= 1 - (entropy / 100);
    }

    breakdown.p['consume'] = {
        Money: {},
        Mana: {},
        Knowledge: {},
        Food: {},
        Lumber: {},
        Stone: {},
        Chrysotile: {},
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
        Water: {},
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
        Scarletite: {},
        Quantium: {},
        Cipher: {},
        Nanite: {},
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

        if (global.stats.feat['novice'] && global.stats.achieve['apocalypse'] && global.stats.achieve.apocalypse.l > 0 && global.race.universe !== 'bigbang' && (!global.race.seeded || (global.race.seeded && global.race['chose']))){
            let rank = Math.min(global.stats.achieve.apocalypse.l,global.stats.feat['novice']);
            modRes('RNA', (rank / 2) * time_multiplier * global_multiplier);
            if (global.resource.DNA.display){
                modRes('DNA', (rank / 4) * time_multiplier * global_multiplier);
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
            morale += traits.smoldering.vars()[0];
            global.city.morale.season = traits.smoldering.vars()[0];
        }
        else if (global.city.calendar.season === 3){ // Winter
            if (global.race['chilled']){
                morale += traits.chilled.vars()[0];
                global.city.morale.season = traits.chilled.vars()[0];
            }
            else {
                morale -= global.race['leathery'] ? 2 : 5;
                global.city.morale.season = global.race['leathery'] ? -2 : -5;
            }
        }
        else {
            global.city.morale.season = 0;
        }

        if (global.race['cheese']){
            morale++;
        }

        if (global.tech['m_boost']){
            global.city.morale.leadership = 20;
            morale += 20;
        }
        else {
            global.city.morale.leadership = 0;
        }

        if (shrineBonusActive()){
            let shrineMorale = getShrineBonus('morale');
            global.city.morale.shrine = shrineMorale.add;
            morale += shrineMorale.add;
        }

        let milVal = govActive('militant',1);
        if (milVal){
            morale -= milVal;
        }
        if (global.civic.govern.type === 'corpocracy'){
            morale -= global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? 5 : 10;
        }
        if (global.civic.govern.type === 'republic'){
            morale += global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 40 : 30 ) : 20;
        }
        if (global.civic.govern.type === 'federation'){
            morale += 10;
        }

        if (global.race['blood_thirst'] && global.race['blood_thirst_count']){
            if (!global.city.morale['blood_thirst']){
                global.city.morale['blood_thirst'] = 0;
            }

            if (global.race.blood_thirst_count >= 1){
                let blood_thirst = Math.ceil(Math.log2(global.race.blood_thirst_count));
                global.city.morale.blood_thirst = blood_thirst;
                morale += blood_thirst;
            }
        }

        let weather_morale = 0;
        if (global.city.calendar.weather === 0){
            if (global.city.calendar.temp > 0){
                if (global.city.calendar.wind === 1){
                    // Thunderstorm
                    if (global.race['skittish']){
                        weather_morale = -(traits.skittish.vars()[0]);
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
                weather_morale = -(traits.nyctophilia.vars()[0]);
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
                weather_morale = traits.nyctophilia.vars()[1];
            }
        }
        if (global.race['snowy'] && (global.city.calendar.temp !== 0 || global.city.calendar.weather !== 0)){
            weather_morale -= global.city.calendar.temp >= 2 ? traits.snowy.vars()[1] : traits.snowy.vars()[0];
        }

        global.city.morale.weather = global.race['submerged'] ? 0 : weather_morale;
        morale += global.race['submerged'] ? 0 : weather_morale;

        let stress = 0;

        let divisor = 5;
        global.city.morale.unemployed = 0;
        if (global.city.ptrait !== 'mellow'){
            morale -= global.civic.unemployed.workers;
            global.city.morale.unemployed = -(global.civic.unemployed.workers);
        }
        else {
            divisor *= planetTraits.mellow.vars()[0];
        }

        if (global.race['playful']){
            morale += global.civic.hunter.workers * traits.playful.vars()[0];
            global.city.morale.unemployed = global.civic.hunter.workers * traits.playful.vars()[0];
        }
        else {
            stress -= global.civic.hunter.workers / divisor;
        }

        if (global.race['optimistic']){
            stress += traits.optimistic.vars()[0];
        }

        if (global.race['pessimistic']){
            stress -= traits.pessimistic.vars()[0];
        }

        if (global.civic['garrison']){
            let divisor = 2;
            if (global.city.ptrait === 'mellow'){
                divisor *= planetTraits.mellow.vars()[0];
            }
            stress -= global.civic.garrison.max / divisor;
        }

        let money_bd = {};
        breakdown.p.consume.Money[loc('trade')] = 0;

        // trade routes
        if (global.tech['trade'] || (global.race['banana'] && global.tech['primitive'] && global.tech.primitive >= 3)){
            let used_trade = 0;
            let dealVal = govActive('dealmaker',0);
            Object.keys(global.resource).forEach(function (res){
                if (global.resource[res].trade > 0){
                    used_trade += global.resource[res].trade;
                    let price = tradeBuyPrice(res) * global.resource[res].trade;

                    if (global.resource.Money.amount >= price * time_multiplier){
                        let rate = tradeRatio[res];
                        if (dealVal){
                            rate *= 1 + (dealVal / 100);
                        }
                        if (global.race['persuasive']){
                            rate *= 1 + (traits.persuasive.vars()[0] * global.race['persuasive'] / 100);
                        }
                        if (global.race['merchant']){
                            rate *= 1 + (traits.merchant.vars()[1] / 100);
                        }
                        if (global.genes['trader']){
                            let mastery = calc_mastery();
                            rate *= 1 + (mastery / 100);
                        }
                        if (global.stats.achieve.hasOwnProperty('trade')){
                            let rank = global.stats.achieve.trade.l * 2;
                            if (rank > 10){ rank = 10; }
                            rate *= 1 + (rank / 100);
                        }
                        if (global.race['truepath']){
                            rate *= 1 - (global.civic.foreign.gov3.hstl / 101);
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

                    let rate = tradeRatio[res];
                    if (global.stats.achieve.hasOwnProperty('trade')){
                        let rank = global.stats.achieve.trade.l;
                        if (rank > 5){ rank = 5; }
                        rate *= 1 - (rank / 100);
                    }

                    if (global.resource[res].amount >= rate * time_multiplier){
                        modRes(res,global.resource[res].trade * time_multiplier * rate);
                        modRes('Money', -(price * time_multiplier));
                        breakdown.p.consume.Money[loc('trade')] -= price;
                        breakdown.p.consume[res][loc('trade')] = global.resource[res].trade * rate;
                    }
                    steelCheck();
                }
            });
            global.city.market.trade = used_trade;
        }
        if (breakdown.p.consume.Money[loc('trade')] === 0){
            delete breakdown.p.consume.Money[loc('trade')];
        }

        // alchemy
        if (global.tech['alchemy']){
            let totMana = 0;
            let totCrystal = 0;
            Object.keys(global.race.alchemy).forEach(function (res){
                if (global.race.alchemy[res] > 0){
                    let trasmute = Number(global.race.alchemy[res]);
                    if (global.resource.Mana.amount < trasmute){
                        trasmute = global.resource.Mana.amount;
                    }
                    if (global.resource.Crystal.amount < trasmute * 0.5){
                        trasmute = global.resource.Crystal.amount * 2;
                    }

                    if (trasmute >= time_multiplier){
                        let rate = global.resource[res].basic && global.tech.alchemy >= 2 ? tradeRatio[res] * 8 : tradeRatio[res] * 2;
                        modRes(res,trasmute * time_multiplier * rate);
                        modRes('Mana', -(trasmute * time_multiplier));
                        modRes('Crystal', -(trasmute * 0.5 * time_multiplier));
                        totMana -= trasmute;
                        totCrystal -= trasmute * 0.5;
                        breakdown.p.consume[res][loc('tab_alchemy')] = trasmute * rate;
                        if (global.race.universe === 'magic' && !global.resource[res].basic && global.tech.alchemy >= 2){
                            unlockAchieve('fullmetal');
                        }
                    }
                }
            });
            breakdown.p.consume.Mana[loc('tab_alchemy')] = totMana;
            breakdown.p.consume.Crystal[loc('tab_alchemy')] = totCrystal;
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
            let offers = galaxyOffers();
            for (let i=0; i<offers.length; i++){
                let exprt_res = offers[i].sell.res;
                let exprt_vol = offers[i].sell.vol;
                let imprt_res = offers[i].buy.res;
                let imprt_vol = offers[i].buy.vol;
                let exp_total = 0;
                let imp_total = 0;

                if (global.race['persuasive']){
                    imprt_vol *= 1 + (global.race['persuasive'] / 100);
                }
                if (global.race['merchant']){
                    imprt_vol *= 1 + (traits.merchant.vars()[1] / 100);
                }
                if (global.genes['trader']){
                    let mastery = calc_mastery();
                    imprt_vol *= 1 + (mastery / 100);
                }
                if (global.stats.achieve.hasOwnProperty('trade')){
                    let rank = global.stats.achieve.trade.l;
                    if (rank > 5){ rank = 5; }
                    imprt_vol *= 1 + (rank / 50);
                    exprt_vol *= 1 - (rank / 100);
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

        if (global.race['deconstructor'] && global.city['nanite_factory']){
            nf_resources.forEach(function(r){
                if (global.resource[r].display){
                    let vol = global.city.nanite_factory[r] * time_multiplier;
                    if (vol > 0){
                        if (global.resource[r].amount < vol){
                            vol = global.resource[r].amount;
                        }
                        if (modRes(r,-(vol))){
                            breakdown.p.consume[r][loc('city_nanite_factory')] = -(vol / time_multiplier);
                            let trait = traits.deconstructor.vars()[0] / 100;
                            let nanite_vol = vol * atomic_mass[r] / 100 * trait;
                            modRes('Nanite',nanite_vol);
                        }
                    }
                }
            });
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
                r_mass += 0.225 * global.tech['roid_eject'] * (1 + (global.tech['roid_eject'] / 12));
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

            if (global.race.universe === 'magic' && !global.race['environmentalist']){
                consume = global.city.coal_power.on * 0.05;
                while ((consume * time_multiplier) > global.resource.Mana.amount && consume > 0){
                    power -= actions.city.coal_power.powered();
                    consume -= 0.05;
                }
                breakdown.p.consume.Mana[loc('powerplant')] = -(consume);
                modRes('Mana', -(consume * time_multiplier));
            }
            else {
                while ((consume * time_multiplier) > global.resource.Coal.amount && consume > 0){
                    power -= actions.city.coal_power.powered();
                    consume -= 0.35;
                }
                breakdown.p.consume.Coal[loc('powerplant')] = -(consume);
                modRes('Coal', -(consume * time_multiplier));
            }

            max_power += power;
            power_grid -= power;
            power_generated[global.race['environmentalist'] ? loc('city_hydro_power') : loc(global.race.universe === 'magic' ? 'city_mana_engine' : 'city_coal_power')] = -(power);

            // Uranium
            if (!global.race['environmentalist'] && global.race.universe !== 'magic' && global.tech['uranium'] && global.tech['uranium'] >= 3){
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
            while (consume * time_multiplier > global.resource.Deuterium.amount + (global.resource.Deuterium.diff > 0 ? global.resource.Deuterium.diff * time_multiplier : 0) && consume > 0){
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
            let increment = fuel_adjust(0.5,true);
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


        if (global.space['hydrogen_plant'] && global.space.hydrogen_plant.on > 0){
            let output = actions.space.spc_titan.hydrogen_plant.powered();
            if (global.space.hydrogen_plant.on > global.space.electrolysis.on){
                global.space.hydrogen_plant.on = global.space.electrolysis.on;
            }
            let power = global.space.hydrogen_plant.on * output;
            max_power += power;
            power_grid -= power;
            power_generated[loc('space_hydrogen_plant_title')] = -(power);
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

        if (global.portal['inferno_power']){
            let fuels = actions.portal.prtl_ruins.inferno_power.fuel;
            let operating = global.portal.inferno_power.on;

            Object.keys(fuels).forEach(function(fuel){
                let consume = operating * fuels[fuel];
                while (consume * time_multiplier > global.resource[fuel].amount + (global.resource[fuel].diff > 0 ? global.resource[fuel].diff * time_multiplier : 0) && consume > 0){
                    operating--;
                    consume -= fuels[fuel];
                }
                breakdown.p.consume[fuel][loc('portal_inferno_power_title')] = -(consume);
                modRes(fuel, -(consume * time_multiplier));
            });
            let power = operating * actions.portal.prtl_ruins.inferno_power.powered();

            max_power += power;
            power_grid -= power;
            power_generated[loc('portal_inferno_power_title')] = -(power);
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
            if (global.blood['illuminate']){
                solar += 0.01 * global.blood.illuminate;
            }
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

        if (global.city['windmill'] && global.tech['wind_plant']){
            let power = powerModifier(global.city.windmill.count * actions.city.windmill.powered());
            max_power += power;
            power_grid -= power;
            power_generated[loc('city_mill_title2')] = -(power);
        }

        if (global.race['powered']){
            let citizens = traits.powered.vars()[0] * global.resource[global.race.species].amount;
            if (global.race['discharge'] && global.race['discharge'] > 0){
                citizens = +(citizens * 1.25).toFixed(3);
            }
            power_grid -= citizens;
        }

        // Power usage
        let p_structs = global.power;
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

                if (c_action[parts[1]].hasOwnProperty('p_fuel')){
                    let s_fuels = c_action[parts[1]].p_fuel();
                    if (!Array.isArray(s_fuels)){
                        s_fuels = [s_fuels];
                    }
                    for (let j=0; j<s_fuels.length; j++){
                        let title = typeof c_action[parts[1]].title === 'string' ? c_action[parts[1]].title : c_action[parts[1]].title();
                        let fuel = s_fuels[j];
                        let fuel_cost = ['Oil','Helium_3'].includes(fuel.r) && region === 'space' ? fuel_adjust(fuel.a,true) : fuel.a;
                        let mb_consume = p_on[parts[1]] * fuel_cost;
                        breakdown.p.consume[fuel.r][title] = -(mb_consume);
                        for (let k=0; k<p_on[parts[1]]; k++){
                            if (!modRes(fuel.r, -(time_multiplier * fuel_cost))){
                                mb_consume -= (p_on[parts[1]] * fuel_cost) - (k * fuel_cost);
                                p_on[parts[1]] -= k;
                                break;
                            }
                        }
                    }
                }

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

        // Mass Relay charging
        if (global.space['m_relay']){
            if (p_on['m_relay']){
                if (global.space.m_relay.charged < 10000){
                    global.space.m_relay.charged++;
                }
            }
            else {
                global.space.m_relay.charged = 0;
            }
        }

        // Troop Lander
        if (global.space['fob'] && global.space['lander']){
            if (p_on['fob']){
                let fuel = fuel_adjust(50,true);
                support_on['lander'] = global.space.lander.on;

                let total = garrisonSize(false,true);
                let deployed = support_on['lander'] * 3;
                if (deployed <= total){
                    global.space.fob.troops = deployed;
                }
                else {
                    support_on['lander'] -= Math.ceil((deployed - total) / 3);
                    global.space.fob.troops = support_on['lander'] * 3;
                }

                let mb_consume = support_on['lander'] * fuel;
                breakdown.p.consume.Oil[loc('space_lander_title')] = -(mb_consume);
                for (let i=0; i<support_on['lander']; i++){
                    if (!modRes('Oil', -(time_multiplier * fuel))){
                        mb_consume -= (support_on['lander'] * fuel) - (i * fuel);
                        support_on['lander'] -= i;
                        break;
                    }
                }

                if (support_on['lander'] !== global.space.lander.on){
                    $(`#space-lander .on`).addClass('warn');
                }
                else {
                    $(`#space-lander .on`).removeClass('warn');
                }
            }
            else {
                global.space.fob.troops = 0;
                $(`#space-lander .on`).addClass('warn');
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

        // Moon Bases, Spaceports
        [
            { r: 'spc_moon', s: 'moon_base', g: 'moon' },
            { r: 'spc_red', s: 'spaceport', g: 'red' },
            { r: 'spc_titan', s: 'electrolysis', g: 'titan' },
            { r: 'spc_titan', r2: 'spc_enceladus', s: 'titan_spaceport', g: 'enceladus' },
            { r: 'spc_eris', s: 'drone_control', g: 'eris' },
        ].forEach(function(sup){
            sup['r2'] = sup['r2'] || sup.r;
            if (global.space[sup.s] && global.space[sup.s].count > 0){
                if (actions.space[sup.r][sup.s].hasOwnProperty('support_fuel')){
                    let s_fuels = actions.space[sup.r][sup.s].support_fuel();
                    if (!Array.isArray(s_fuels)){
                        s_fuels = [s_fuels];
                    }
                    for (let j=0; j<s_fuels.length; j++){
                        let fuel = s_fuels[j];
                        let fuel_cost = ['Oil','Helium_3'].includes(fuel.r) ? +fuel_adjust(fuel.a,true) : fuel.a;
                        let mb_consume = p_on[sup.s] * fuel_cost;
                        breakdown.p.consume[fuel.r][actions.space[sup.r][sup.s].title] = -(mb_consume);
                        for (let i=0; i<p_on[sup.s]; i++){
                            if (!modRes(fuel.r, -(time_multiplier * fuel_cost))){
                                mb_consume -= (p_on[sup.s] * fuel_cost) - (i * fuel_cost);
                                p_on[sup.s] -= i;
                                break;
                            }
                        }
                    }
                }

                global.space[sup.s].s_max = p_on[sup.s] * actions.space[sup.r][sup.s].support();
                switch (sup.g){
                    case 'moon':
                        {
                            global.space[sup.s].s_max += global.tech['luna'] && global.tech['luna'] >= 2 ? p_on['nav_beacon'] : 0;
                        }
                        break;
                    case 'red':
                        {
                            global.space[sup.s].s_max += global.tech['mars'] && global.tech['mars'] >= 3 ? (global.race['cataclysm'] ? p_on['red_tower'] * 2 : p_on['red_tower']) : 0;
                            global.space[sup.s].s_max += global.tech['luna'] && global.tech['luna'] >= 3 ? p_on['nav_beacon'] : 0;
                        }
                        break;
                }
            }

            if (global.space[sup.s] && sup.r === 'spc_eris' && !p_on['ai_core2']){
                global.space[sup.s].s_max = 0;
            }

            if (global.space[sup.s]){
                let used_support = 0;
                let area_structs = global.support[sup.g].map(x => x.split(':')[1]);
                for (var i = 0; i < area_structs.length; i++){
                    if (global.space[area_structs[i]]){
                        let operating = global.space[area_structs[i]].on;
                        let id = actions.space[sup.r2][area_structs[i]].id;

                        if (actions.space[sup.r2][area_structs[i]].hasOwnProperty('support_fuel')){
                            let s_fuels = actions.space[sup.r2][area_structs[i]].support_fuel();
                            if (!Array.isArray(s_fuels)){
                                s_fuels = [s_fuels];
                            }
                            for (let j=0; j<s_fuels.length; j++){
                                let fuel = s_fuels[j];
                                let fuel_cost = ['Oil','Helium_3'].includes(fuel.r) ? +fuel_adjust(fuel.a,true) : fuel.a;
                                let mb_consume = operating * fuel_cost;
                                breakdown.p.consume[fuel.r][actions.space[sup.r2][area_structs[i]].title] = -(mb_consume);
                                for (let i=0; i<operating; i++){
                                    if (!modRes(fuel.r, -(time_multiplier * fuel_cost))){
                                        mb_consume -= (operating * fuel_cost) - (i * fuel_cost);
                                        operating -= i;
                                        break;
                                    }
                                }
                            }
                        }

                        if (used_support + operating > global.space[sup.s].s_max){
                            operating -= (used_support + operating) - global.space[sup.s].s_max;
                            $(`#${id} .on`).addClass('warn');
                        }
                        else {
                            $(`#${id} .on`).removeClass('warn');
                        }
                        used_support += operating;
                        support_on[area_structs[i]] = operating;
                    }
                    else {
                        support_on[area_structs[i]] = 0;
                    }
                }
                global.space[sup.s].support = used_support;
            }
        });

        // Space Marines
        if (global.space['space_barracks']){
            let oil_cost = +fuel_adjust(2,true);
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
            let h_consume = p_on['red_factory'] * fuel_adjust(1,true);
            modRes('Helium_3',-(h_consume * time_multiplier));
            breakdown.p.consume.Helium_3[loc('space_red_factory_title')] = -(h_consume);
        }

        if (p_on['int_factory'] && p_on['int_factory'] > 0){
            let d_consume = p_on['int_factory'] * int_fuel_adjust(5);
            modRes('Deuterium',-(d_consume * time_multiplier));
            breakdown.p.consume.Deuterium[loc('interstellar_int_factory_title')] = -(d_consume);
        }

        if (support_on['water_freighter'] && support_on['water_freighter'] > 0){
            let h_cost = fuel_adjust(5,true);
            let h_consume = support_on['water_freighter'] * h_cost;
            for (let i=0; i<support_on['water_freighter']; i++){
                if (!modRes('Helium_3', -(time_multiplier * h_cost))){
                    h_consume -= (support_on['water_freighter'] * h_cost) - (i * h_cost);
                    support_on['water_freighter'] -= i;
                    break;
                }
            }
            breakdown.p.consume.Helium_3[loc('space_water_freighter_title')] = -(h_consume);
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
            let structs = global.support.alpha.map(x => x.split(':')[1]);
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

            if (global.interstellar.hasOwnProperty('mining_droid') && global.interstellar.mining_droid.count > 0){
                let max = int_on['mining_droid'];
                let segments = ['adam','uran','coal','alum'];
                for (let i=0; i<segments.length; i++){
                    if (global.interstellar.mining_droid[segments[i]] <= max){
                        miner_droids[segments[i]] = global.interstellar.mining_droid[segments[i]];
                        max -= miner_droids[segments[i]];
                    }
                    else {
                        global.interstellar.mining_droid[segments[i]] = max;
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
            let gateway_structs = global.support.gateway.map(x => x.split(':')[1]);
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
            let foothold_structs = global.support.alien2.map(x => x.split(':')[1]);
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

        // Guard Post
        if (global.portal['guard_post']){
            global.portal.guard_post.s_max = global.portal.guard_post.count * actions.portal.prtl_ruins.guard_post.support();

            if (global.portal.guard_post.on > 0){
                let army = global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
                if (p_on['soul_forge']){
                    let forge = soulForgeSoldiers();
                    if (forge <= army){
                        army -= forge;
                    }
                }
                if (army < global.portal.guard_post.on){
                    global.portal.guard_post.on = army;
                }
            }

            global.portal.guard_post.support = global.portal.guard_post.on;
        }

        // Harbour
        if (global.portal['harbour']){
            global.portal.harbour.s_max = p_on['harbour'] * actions.portal.prtl_lake.harbour.support();

            let used_support = 0;
            let harbour_structs = global.support.lake.map(x => x.split(':')[1]);
            for (var i = 0; i < harbour_structs.length; i++){
                if (global.portal[harbour_structs[i]]){
                    let operating = global.portal[harbour_structs[i]].on;
                    let id = actions.portal.prtl_lake[harbour_structs[i]].id;
                    if (used_support + operating > global.portal.harbour.s_max){
                        operating -= (used_support + operating) - global.portal.harbour.s_max;
                        $(`#${id} .on`).addClass('warn');
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                    }
                    used_support += operating * -(actions.portal.prtl_lake[harbour_structs[i]].support());
                    gal_on[harbour_structs[i]] = operating;
                }
                else {
                    gal_on[harbour_structs[i]] = 0;
                }
            }
            global.portal.harbour.support = used_support;
        }

        // Purifier
        if (global.portal['purifier']){
            global.portal.purifier.s_max = p_on['purifier'] * actions.portal.prtl_spire.purifier.support();

            let used_support = 0;
            let purifier_structs = global.support.spire.map(x => x.split(':')[1]);
            for (var i = 0; i < purifier_structs.length; i++){
                if (global.portal[purifier_structs[i]]){
                    let operating = global.portal[purifier_structs[i]].on;
                    let id = actions.portal.prtl_spire[purifier_structs[i]].id;
                    if (used_support + operating > global.portal.purifier.s_max){
                        operating -= (used_support + operating) - global.portal.purifier.s_max;
                        $(`#${id} .on`).addClass('warn');
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                    }
                    used_support += operating * -(actions.portal.prtl_spire[purifier_structs[i]].support());
                    spire_on[purifier_structs[i]] = operating;
                }
                else {
                    spire_on[purifier_structs[i]] = 0;
                }
            }
            global.portal.purifier.support = used_support;
        }

        // Space Station
        if (global.space['space_station'] && global.space['space_station'].count > 0){
            let fuel_cost = +fuel_adjust(2.5,true);
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
            let belt_structs = global.support.belt.map(x => x.split(':')[1]);
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
                    support_on[belt_structs[i]] = operating;
                }
                else {
                    support_on[belt_structs[i]] = 0;
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
            let structs = global.support.nebula.map(x => x.split(':')[1]);
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

        // Foward Operating Base
        if (global.space['fob'] && p_on['fob']){
            let fuel_cost = +fuel_adjust(125,true);
            let xfer_consume = p_on['fob'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('tech_fob')] = -(xfer_consume);
            for (let i=0; i<p_on['fob']; i++){
                if (!modRes('Helium_3', -(time_multiplier * fuel_cost))){
                    xfer_consume -= (p_on['fob'] * fuel_cost) - (i * fuel_cost);
                    p_on['fob'] -= i;
                    break;
                }
            }
        }

        // Outpost
        if (p_on['outpost'] && p_on['outpost'] > 0){
            let fuel_cost = +fuel_adjust(2,true);
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

        // Ship Yard
        if (p_on['shipyard']){
            global.settings.showShipYard = true;
        }
        else {
            global.settings.showShipYard = false;
            if (global.settings.govTabs === 5){
                global.settings.govTabs = 0;
            }
        }

        var galaxy_ship_types = [
            {
                area: 'galaxy',
                region: 'gxy_gateway',
                ships: global.support.gateway.map(x => x.split(':')[1])
            },
            {
                area: 'galaxy',
                region: 'gxy_gorddon',
                ships: ['freighter'],
                req: 'embassy'
            },
            {
                area: 'galaxy',
                region: 'gxy_alien1',
                ships: ['super_freighter'],
                req: 'embassy'
            },
            {
                area: 'galaxy',
                region: 'gxy_alien2',
                ships: ['armed_miner','scavenger'],
                req: 'foothold'
            },
            {
                area: 'galaxy',
                region: 'gxy_chthonian',
                ships: ['minelayer','raider'],
                req: 'starbase'
            },
            {
                area: 'portal',
                region: 'prtl_lake',
                ships: ['bireme','transport'],
                req: 'harbour'
            }
        ];

        let crew_civ = 0;
        let crew_mil = 0;
        let total = 0;
        for (let j=0; j<galaxy_ship_types.length; j++){
            let area = galaxy_ship_types[j].area;
            let region = galaxy_ship_types[j].region;
            for (let i=0; i<galaxy_ship_types[j].ships.length; i++){
                let ship = galaxy_ship_types[j].ships[i];

                if (global[area][ship] && global[area][ship].hasOwnProperty('on')){
                    if (actions[area][region][ship].ship['civ'] && global[area][ship].hasOwnProperty('crew')){
                        if (global[area][ship].crew < 0){
                            global[area][ship].crew = 0;
                        }
                        if (global[area][ship]['crew'] < global[area][ship].on * actions[area][region][ship].ship.civ){
                            if (total < global.resource[global.race.species].amount){
                                if (global.civic[global.civic.d_job].workers > actions[area][region][ship].ship.civ){
                                    global.civic[global.civic.d_job].workers -= actions[area][region][ship].ship.civ;
                                    global.civic.crew.workers += actions[area][region][ship].ship.civ;
                                    global[area][ship]['crew'] += actions[area][region][ship].ship.civ;
                                }
                            }
                        }
                        if (global[area][ship]['crew'] > global[area][ship].on * actions[area][region][ship].ship.civ){
                            global.civic[global.civic.d_job].workers += actions[area][region][ship].ship.civ;
                            global.civic.crew.workers -= actions[area][region][ship].ship.civ;
                            global[area][ship]['crew'] -= actions[area][region][ship].ship.civ;
                        }
                        global.civic.crew.assigned = global.civic.crew.workers;
                        crew_civ += global[area][ship]['crew'];
                        total += global[area][ship]['crew'];
                    }

                    if (actions[area][region][ship].ship['mil'] && global[area][ship].hasOwnProperty('mil')){
                        if (global[area][ship]['mil'] !== global[area][ship].on * actions[area][region][ship].ship.mil){
                            global[area][ship]['mil'] = global[area][ship].on * actions[area][region][ship].ship.mil;
                        }
                        if (global.civic.garrison.workers - global.portal.fortress.garrison < 0){
                            let underflow = global.civic.garrison.workers - global.portal.fortress.garrison;
                            global[area][ship]['mil'] -= underflow;
                        }
                        if (crew_mil + global[area][ship]['mil'] > global.civic.garrison.workers - global.portal.fortress.garrison){
                            global[area][ship]['mil'] = global.civic.garrison.workers - global.portal.fortress.garrison - crew_mil;
                        }
                        if (global[area][ship]['mil'] < 0){
                            global[area][ship]['mil'] = 0;
                        }
                        crew_mil += global[area][ship]['mil'];
                    }

                    if (global[area][ship]['crew'] < global[area][ship].on * actions[area][region][ship].ship.civ || global[area][ship]['mil'] < global[area][ship].on * actions[area][region][ship].ship.mil || gal_on[ship] < global[area][ship].on){
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
            if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                global.space.shipyard.ships.forEach(function(ship){
                    if (ship.location !== 'spc_dwarf' || (ship.location === 'spc_dwarf' && ship.transit > 0)){
                        crew_mil += shipCrewSize(ship);
                    }
                });
            }
            global.civic.garrison.crew = crew_mil;
        }

        // Detect labor anomalies
        Object.keys(job_desc).forEach(function (job) {
            if (global.civic[job]){
                if (job !== 'crew'){
                    total += global.civic[job].workers;
                    if (total > global.resource[global.race.species].amount){
                        global.civic[job].workers -= total - global.resource[global.race.species].amount;
                    }
                    if (global.civic[job].workers < 0){
                        global.civic[job].workers = 0;
                    }
                }
                if (job !== 'unemployed' && job !== 'hunter' && job !== 'forager'){
                    let stress_level = global.civic[job].stress;
                    if (global.city.ptrait === 'mellow'){
                        stress_level += planetTraits.mellow.vars()[1];
                    }
                    if (global.race['content']){
                        let effectiveness = job === 'hell_surveyor' ? 0.2 : 0.4;
                        stress_level += global.race['content'] * effectiveness;
                    }
                    if (global.city.ptrait === 'dense' && job === 'miner'){
                        stress_level -= planetTraits.dense.vars()[1];
                    }
                    if (global.race['freespirit'] && job !== 'farmer' && job !== 'lumberjack' && job !== 'quarry_worker' && job !== 'crystal_miner' && job !== 'scavenger'){
                        stress_level /= 1 + (traits.freespirit.vars()[0] / 100);
                    }

                    stress -= global.civic[job].workers / stress_level;
                }
            }
        });
        global.civic[global.civic.d_job].workers += global.resource[global.race.species].amount - total;

        Object.keys(job_desc).forEach(function (job){
            if (job !== 'craftsman' && global.civic[job] && global.civic[job].workers < global.civic[job].assigned && global.civic[global.civic.d_job].workers > 0 && global.civic[job].workers < global.civic[job].max){
                global.civic[job].workers++;
                global.civic[global.civic.d_job].workers--;
            }
        });

        let entertainment = 0;
        if (global.tech['theatre']){
            entertainment += global.civic.entertainer.workers * global.tech.theatre;
            if (global.race['musical']){
                entertainment += global.civic.entertainer.workers * traits.musical.vars()[0];
            }
            if (global.race['emotionless']){
                entertainment *= 1 - (traits.emotionless.vars()[0] / 100);
            }
        }
        if (global.civic.govern.type === 'democracy'){
            let democracy = global.tech['high_tech'] && global.tech['high_tech'] >= 2 ? ( global.tech['high_tech'] >= 12 ? 1.3 : 1.25 ) : 1.2;
            entertainment *= democracy;
        }
        global.city.morale.entertain = entertainment;
        morale += entertainment;

        if (global.tech['broadcast']){
            let gasVal = govActive('gaslighter',0);
            let mVal = gasVal ? gasVal + global.tech.broadcast : global.tech.broadcast;
            global.city.morale.broadcast = global.city.wardenclyffe.on * mVal;
            morale += global.city.wardenclyffe.on * mVal;
        }
        if (support_on['vr_center']){
            let gasVal = govActive('gaslighter',1);
            let vr_morale = gasVal ? gasVal + 1 : 1;
            global.city.morale.vr = support_on['vr_center'] * vr_morale;
            morale += support_on['vr_center'] * vr_morale;
        }
        if (int_on['zoo']){
            global.city.morale.zoo = int_on['zoo'] * 5;
            morale += int_on['zoo'] * 5;
        }
        if (eventActive('summer')){
            let boost = (global.resource.Thermite.diff * 2.5) / (global.resource.Thermite.diff * 2.5 + 500) * 500;
            global.city.morale['bonfire'] = boost;
            morale += boost;
        }
        else {
            delete global.city.morale['bonfire'];
        }

        if (global.civic.govern.type === 'anarchy'){
            stress /= 2;
        }
        if (global.civic.govern.type === 'autocracy'){
            stress *= global.tech['high_tech'] && global.tech['high_tech'] >= 2 ? ( global.tech['high_tech'] >= 12 ? 1.1 : 1.18 ) : 1.25;
        }
        if (global.civic.govern.type === 'socialist'){
            stress *= 1.1;
        }
        if (global.race['emotionless']){
            stress *= 1 - (traits.emotionless.vars()[1] / 100);
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

        if (((global.civic.govern.type !== 'autocracy' && !global.race['blood_thirst']) || global.race['immoral']) && global.civic.garrison.protest + global.civic.garrison.fatigue > 2){
            let immoral = global.race['immoral'] ? 1 + (traits.strong.vars()[0] / 100) : 1;
            let warmonger = Math.round(Math.log2(global.civic.garrison.protest + global.civic.garrison.fatigue) * immoral);
            global.city.morale.warmonger = global.race['immoral'] ? warmonger : -(warmonger);
            morale += global.city.morale.warmonger;
        }
        else {
            global.city.morale.warmonger = 0;
        }

        let mBaseCap = 100;
        mBaseCap += global.city['casino'] ? p_on['casino'] : 0;
        mBaseCap += global.space['spc_casino'] ? p_on['spc_casino'] : 0;

        if (global.city['amphitheatre']){
            let athVal = govActive('athleticism',0);
            mBaseCap += athVal ? (global.city.amphitheatre.count * athVal) : global.city.amphitheatre.count;
        }

        if (support_on['vr_center']){
            mBaseCap += support_on['vr_center'] * 2;
        }
        if (int_on['zoo']){
            mBaseCap += int_on['zoo'] * 2;
        }
        if (p_on['resort']){
            mBaseCap += p_on['resort'] * 2;
        }
        if (global.tech['superstar']){
            mBaseCap += global.civic.entertainer.workers;
        }
        moraleCap = mBaseCap;

        if (global.tech['monuments']){
            let gasVal = govActive('gaslighter',2);
            let mcap = gasVal ? (2 - gasVal) : 2;
            moraleCap += global.tech['monuments'] * mcap;
        }

        if (global.civic.taxes.tax_rate < 20 && !global.race['banana']){
            moraleCap += 10 - Math.floor(global.civic.taxes.tax_rate / 2);
        }

        if (global.stats.achieve['joyless']){
            moraleCap += global.stats.achieve['joyless'].l * 2;
        }

        let m_min = global.race['optimistic'] ? 60 : 50;
        if (global.race['truepath']){
            m_min -= 25;
        }
        if (global.civic.govern.fr > 0){
            let rev = morale / 2;
            global.city.morale.rev = rev;
            morale -= rev;
            m_min -= 10;
        }
        else {
            global.city.morale.rev = 0;
        }

        global.city.morale.potential = +(morale).toFixed(1);
        if (morale < m_min){
            morale = m_min;
        }
        else if (morale > moraleCap){
            morale = moraleCap;
        }
        global.city.morale.cap = moraleCap;
        global.city.morale.current = morale;

        if (global.city.morale.current < 100){
            if (global.race['blissful']){
                let mVal = global.city.morale.current - 100;
                let bliss = traits.blissful.vars()[0] / 100;
                global_multiplier *= 1 + (mVal * bliss / 100);
                breakdown.p['Global'][loc('morale')] = (mVal * bliss) + '%';
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
            global_multiplier *= 1 - (traits.lazy.vars()[0] / 100);
        }
        if (global.race['distracted']){
            breakdown.p['Global'][loc('event_m_curious3_bd')] = '-5%';
            global_multiplier *= 0.95;
        }
        if (global.race['stimulated']){
            breakdown.p['Global'][loc('event_m_curious4_bd')] = '+10%';
            global_multiplier *= 1.1;
        }

        if (global.race['selenophobia']){
            let moon = global.city.calendar.moon > 14 ? 28 - global.city.calendar.moon : global.city.calendar.moon;
            breakdown.p['Global'][loc('moon_phase')] = (-(moon) + traits.selenophobia.vars()[0]) + '%';
            moon = 1 + (traits.selenophobia.vars()[0] / 100) - (moon / 100);
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

                    if (ejected > 0){
                        breakdown.p.consume[res][loc('interstellar_blackhole_name')] = -(ejected);
                    }

                    if (ejected * time_multiplier > global.resource[res].amount){
                        ejected = global.resource[res].amount / time_multiplier;
                    }
                    if (ejected < 0){
                        ejected = 0;
                    }

                    modRes(res, -(time_multiplier * ejected));
                    mass += ejected * atomic_mass[res];
                    if (global.race.universe !== 'magic' && (res === 'Elerium' || res === 'Infernite')){
                        exotic += ejected * atomic_mass[res];
                    }
                }
            });
            global.interstellar.mass_ejector.mass = mass;
            global.interstellar.mass_ejector.total = total;

            global.interstellar.stellar_engine.mass += mass / 10000000000 * time_multiplier;
            global.interstellar.stellar_engine.exotic += exotic / 10000000000 * time_multiplier;
        }

        if (global.portal['transport'] && global.portal['purifier']){
            let total = 0;
            let supply = 0;
            let bireme_rating = global.blood['spire'] && global.blood.spire >= 2 ? 0.8 : 0.85;
            Object.keys(global.portal.transport.cargo).forEach(function (res){
                if (supplyValue[res]){
                    let shipped = global.portal.transport.cargo[res];
                    if (total + shipped > gal_on['transport'] * 5){
                        shipped = gal_on['transport'] * 5 - total;
                    }
                    total += shipped;

                    let volume = shipped * supplyValue[res].out;
                    while (volume * time_multiplier > global.resource[res].amount && volume > 0){
                        volume -= supplyValue[res].out;
                        shipped--;
                    }
                    if (volume > 0){
                        breakdown.p.consume[res][loc('portal_transport_title')] = -(volume);
                    }

                    let bireme = 1 - (bireme_rating ** (gal_on['bireme'] || 0));

                    modRes(res, -(time_multiplier * volume));
                    supply += Number(shipped * supplyValue[res].in * time_multiplier * bireme);
                }
            });
            if (global.portal['mechbay']){
                for (let i = 0; i < global.portal.mechbay.active; i++) {
                    let mech = global.portal.mechbay.mechs[i];
                    if (mech.size === 'collector') {
                        supply += mechCollect(mech) * time_multiplier;
                    }
                }
            }
            global.portal.purifier.supply += supply;
            global.portal.purifier.diff = supply / time_multiplier;
            if (global.portal.purifier.supply > global.portal.purifier.sup_max){
                global.portal.purifier.supply = global.portal.purifier.sup_max;
            }
        }

        if (global.race['carnivore'] && !global.race['herbivore'] && !global.race['soul_eater'] && !global.race['artifical']){
            if (global.resource['Food'].amount > 10){
                let rot = +((global.resource['Food'].amount - 10) * (0.5)).toFixed(3);
                if (global.city['smokehouse']){
                    rot *= 0.9 ** global.city.smokehouse.count;
                }
                modRes('Food', -(rot * time_multiplier));
                breakdown.p.consume['Food'][loc('spoilage')] = -(rot);
            }
        }

        if (global.race['gnawer']){
            let res = global.race['kindling_kindred'] || global.race['smoldering'] ? 'Stone' : 'Lumber';
            if (global.resource[res].display){
                let pop = global.resource[global.race.species].amount + global.civic.garrison.workers;
                let res_cost = pop * traits.gnawer.vars()[0];
                breakdown.p.consume[res][loc('trait_gnawer_bd')] = -(res_cost);
                modRes(res, -(res_cost * time_multiplier));
            }
        }

        // Consumption
        var fed = true;
        if (global.resource[global.race.species].amount >= 1 || global.city['farm'] || global.city['soul_well'] || global.city['compost'] || global.city['tourist_center'] || global.city['transmitter']){
            let food_bd = {};
            let food_base = 0;
            if (global.race['artifical']){
                if (global.city['transmitter']){
                    food_base = p_on['transmitter'] * production('transmitter');
                    food_bd[loc('city_transmitter')] = food_base + 'v';
                }
            }
            else {
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
                        let c_factor = traits.detritivore.vars()[0] / 100;
                        let food_compost = operating * (1.2 + (global.tech['compost'] * c_factor));
                        food_compost *= global.city.biome === 'grassland' ? biomes.grassland.vars()[0] : 1;
                        food_compost *= global.city.biome === 'volcanic' ? biomes.volcanic.vars()[0] : 1;
                        food_compost *= global.city.biome === 'hellscape' ? biomes.hellscape.vars()[0] : 1;
                        food_compost *= global.city.ptrait === 'trashed' ? planetTraits.trashed.vars()[0] : 1;
                        food_bd[loc('city_compost_heap')] = food_compost + 'v';
                        food_base += food_compost;
                    }
                }
                if (global.race['carnivore'] || global.race['soul_eater']){
                    let strength = global.tech['military'] ? (global.tech.military >= 5 ? global.tech.military - 1 : global.tech.military) : 1;
                    let food_hunt = global.civic.hunter.workers * strength * (global.race['carnivore'] ? 2 : 0.5);
                    if (global.race['ghostly']){
                        food_hunt *= 1 + (traits.ghostly.vars()[0] / 100);
                    }
                    food_bd[loc('job_hunter')] = food_hunt + 'v';

                    if (global.race['carnivore'] && global.city['lodge'] && food_hunt > 0){
                        food_hunt *= 1 + (global.city.lodge.count / 20);
                        food_bd[`ᄂ${loc('city_lodge')}`] = (global.city.lodge.count * 5) + '%';
                    }

                    if (global.city['soul_well']){
                        let souls = global.city['soul_well'].count * (global.race['ghostly'] ? (2 + traits.ghostly.vars()[1]) : 2);
                        food_hunt += souls;
                        food_bd[loc('city_soul_well')] = souls + 'v';
                    }
                    food_base += food_hunt;
                }
                if (global.city['farm'] || global.race['forager']) {
                    let weather_multiplier = 1;
                    if (!global.race['submerged']){
                        if (global.city.calendar.temp === 0){
                            if (global.city.calendar.weather === 0){
                                weather_multiplier *= global.race['chilled'] ? (1 + traits.chilled.vars()[3] / 100) : 0.7;
                            }
                            else {
                                weather_multiplier *= global.race['chilled'] ? (1 + traits.chilled.vars()[4] / 100) : 0.85;
                            }
                        }
                        if (global.city.calendar.weather === 2){
                            weather_multiplier *= global.race['chilled'] ? (1 - traits.chilled.vars()[5] / 100) : 1.1;
                        }
                    }

                    if (global.race['forager']){
                        let forage = 1 + (global.tech['foraging'] ? 0.75 * global.tech['foraging'] : 0);
                        let food_forage = global.civic.forager.workers * forage * 0.35;
                        food_bd[loc('job_forager')] = food_forage + 'v';
                        food_base += food_forage;
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
                        food_base += (food * weather_multiplier * mill_multiplier);

                        if (food > 0){
                            food_bd[`ᄂ${loc('city_mill_title1')}`] = ((mill_multiplier - 1) * 100) + '%';
                            food_bd[`ᄂ${loc('morale_weather')}`] = ((weather_multiplier - 1) * 100) + '%';
                        }
                    }
                }
            }

            let hunting = 0;
            if (global.tech['military']){
                hunting = (global.race['herbivore'] && !global.race['carnivore']) || global.race['artifical'] ? 0 : armyRating(garrisonSize(),'hunting') / 3;
            }

            let biodome = 0;
            if (global.tech['mars']){
                biodome = support_on['biodome'] * global.civic.colonist.workers * production('biodome','food');
                if (global.race['cataclysm']){
                    biodome += support_on['biodome'] * production('biodome','cat_food');
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

            let consume = (global.resource[global.race.species].amount + soldiers - ((global.civic.unemployed.workers + global.civic.hunter.workers) * 0.5));
            if (global.race['forager']){
                consume -= global.civic.forager.workers;
            }
            consume *= (global.race['gluttony'] ? (1 + traits.gluttony.vars()[0] / 100) : 1);
            if (global.race['high_metabolism']){
                consume *= 1 + (traits.high_metabolism.vars()[0] / 100);
            }
            if (global.race['sticky']){
                consume *= 1 - (traits.sticky.vars()[0] / 100);
            }
            if (global.race['photosynth']){
                switch(global.city.calendar.weather){
                    case 0:
                        consume *= global.city.calendar.temp === 0 ? 1 : (1 - (traits.photosynth.vars()[2] / 100));
                        break;
                    case 1:
                        consume *= 1 - (traits.photosynth.vars()[1] / 100);
                        break;
                    case 2:
                        consume *= 1 - (traits.photosynth.vars()[0] / 100);
                        break;
                }
            }
            if (global.race['ravenous']){
                consume *= 1 + (traits.ravenous.vars()[0] / 100);
                consume += (global.resource.Food.amount / traits.ravenous.vars()[1]);
            }
            if (global.race['hibernator'] && global.city.calendar.season === 3){
                consume *= 1 - (traits.hibernator.vars()[0] / 100);
            }
            breakdown.p.consume.Food[flib('name')] = -(consume);

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

            let zoo = 0;
            if (global.interstellar['zoo']){
                zoo = int_on['zoo'] * 12000;
                breakdown.p.consume.Food[loc('tech_zoo')] = -(zoo);
            }

            let delta = generated - consume - tourism - spaceport - starport - starbase - space_station - space_marines - embassy - zoo;

            food_bd[global.race['artifical'] ? loc('space_red_signal_tower_title') : loc('space_red_biodome_title')] = biodome + 'v';
            food_bd[loc('soldiers')] = hunting + 'v';
            breakdown.p['Food'] = food_bd;

            if (!modRes('Food', delta * time_multiplier)){
                fed = false;
                let threshold = 1.25;
                if (global.race['slow_digestion']){
                    threshold += traits.slow_digestion.vars()[0];
                }
                if (global.race['humpback']){
                    threshold += traits.humpback.vars()[0];
                }
                if (global.race['atrophy']){
                    threshold -= traits.atrophy.vars()[0];
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
            if (global.race['artifical'] || (global.race['spongy'] && global.city.calendar.weather === 0)){
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
                    lowerBound *= traits.fast_growth.vars()[0];
                    lowerBound += traits.fast_growth.vars()[1];
                }
                if (global.race['spores'] && global.city.calendar.wind === 1){
                    if (global.race['parasite']){
                        lowerBound += traits.spores.vars()[2];
                    }
                    else {
                        lowerBound += traits.spores.vars()[0];
                        lowerBound *= traits.spores.vars()[1];
                    }
                }
                if (global.tech['reproduction'] && global.tech.reproduction >= 2 && global.city['hospital']){
                    lowerBound += global.city.hospital.count;
                }
                if (global.genes['birth']){
                    lowerBound += global.genes['birth'];
                }
                if (global.race['promiscuous']){
                    lowerBound += traits.promiscuous.vars()[0] * global.race['promiscuous'];
                }
                let base = global.city.ptrait === 'toxic' ? global['resource'][global.race.species].amount * planetTraits.toxic.vars()[1] : global['resource'][global.race.species].amount;
                if (global.race['parasite'] && global.race['cataclysm']){
                    lowerBound = Math.round(lowerBound / 5);
                    base *= 3;
                }
                if(Math.rand(0, base * (3 - (2 ** time_multiplier))) <= lowerBound){
                    global['resource'][global.race.species].amount++;
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
            let area = galaxy_ship_types[j].area;
            let region = galaxy_ship_types[j].region;
            for (let i=0; i<galaxy_ship_types[j].ships.length; i++){
                let ship = galaxy_ship_types[j].ships[i];
                let req = galaxy_ship_types[j].hasOwnProperty('req') ? (p_on[galaxy_ship_types[j].req] > 0 ? true : false) : true;
                if (p_on['s_gate'] && req && global[area][ship] && (global[area][ship].crew > 0 || global[area][ship].mil > 0)){
                    let operating = 0;
                    if (actions[area][region][ship].ship.civ > 0){
                        operating = Math.floor(global[area][ship].crew / actions[area][region][ship].ship.civ);
                    }
                    if (actions[area][region][ship].ship.mil > 0){
                        let mil_operating = Math.floor(global[area][ship].mil / actions[area][region][ship].ship.mil);
                        if (actions[area][region][ship].ship.civ === 0 || mil_operating < operating){
                            operating = mil_operating;
                        }
                    }

                    if (actions[area][region][ship].ship.hasOwnProperty('helium')){
                        let increment = +int_fuel_adjust(actions[area][region][ship].ship.helium).toFixed(2);
                        let consume = (operating * increment);
                        while (consume * time_multiplier > global.resource.Helium_3.amount + (global.resource.Helium_3.diff > 0 ? global.resource.Helium_3.diff * time_multiplier : 0) && consume > 0){
                            consume -= increment;
                            operating--;
                        }
                        modRes('Helium_3', -(consume * time_multiplier));
                        andromeda_helium += consume;
                    }

                    if (actions[area][region][ship].ship.hasOwnProperty('deuterium')){
                        let increment = +int_fuel_adjust(actions[area][region][ship].ship.deuterium).toFixed(2);
                        let consume = (operating * increment);
                        while (consume * time_multiplier > global.resource.Deuterium.amount + (global.resource.Deuterium.diff > 0 ? global.resource.Deuterium.diff * time_multiplier : 0) && consume > 0){
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

        if (global.space['shipyard'] && global.space.shipyard['ships']){
            let fuels = {
                Oil: 0,
                Helium_3: 0,
                Uranium: 0,
                Elerium: 0
            };
            global.space.shipyard.ships.forEach(function(ship){
                if (ship.location !== 'spc_dwarf'){
                    let fuel = shipFuelUse(ship);
                    if (fuel.res && fuel.burn > 0){
                        if (fuel.burn * time_multiplier < global.resource[fuel.res].amount + (global.resource[fuel.res].diff > 0 ? global.resource[fuel.res].diff * time_multiplier : 0)){
                            modRes(fuel.res, -(fuel.burn * time_multiplier));
                            ship.fueled = true;
                            fuels[fuel.res] += fuel.burn;
                        }
                        else {
                            ship.fueled = false;
                        }
                    }
                    else {
                        ship.fueled = true;
                    }
                }
            });

            breakdown.p.consume.Oil[loc('outer_shipyard_fleet')] = -(fuels.Oil);
            breakdown.p.consume.Helium_3[loc('outer_shipyard_fleet')] = -(fuels.Helium_3);
            breakdown.p.consume.Uranium[loc('outer_shipyard_fleet')] = -(fuels.Uranium);
            breakdown.p.consume.Elerium[loc('outer_shipyard_fleet')] = -(fuels.Elerium);
        }

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
            hunger -= traits.angry.vars()[0] / 100;
        }
        if (global.race['malnutrition'] && fed === false){
            hunger += traits.malnutrition.vars()[0] / 100;
        }

        // Furs
        let fur_bd = {};
        if (global.resource.Furs.display){
            if (global.race['evil'] || global.race['artifical']){
                let weapons = global.tech['military'] ? (global.tech.military >= 5 ? global.tech.military - 1 : global.tech.military) : 1;
                let hunters = global.civic.hunter.workers * weapons / 20;
                fur_bd[loc('job_hunter')] = hunters  + 'v';
                modRes('Furs', hunters * hunger * global_multiplier * time_multiplier);

                if (!global.race['soul_eater'] && global.race['evil']){
                    let reclaimers = global.civic.lumberjack.workers;
                    reclaimers *= racialTrait(global.civic.lumberjack.workers,'lumberjack') / 4;
                    fur_bd[loc('job_reclaimer')] = reclaimers  + 'v';
                    modRes('Furs', reclaimers * hunger * global_multiplier * time_multiplier);
                }
            }

            let hunting = armyRating(garrisonSize(),'hunting') / 10;
            if (global.city.biome === 'oceanic'){
                hunting *= biomes.oceanic.vars()[2];
            }
            else if (global.city.biome === 'tundra'){
                hunting *= biomes.tundra.vars()[0];
            }
            fur_bd[loc('soldiers')] = hunting  + 'v';

            let delta = hunting;

            if (global.race['forager']){
                let forage = 1 + (global.tech['foraging'] ? 0.5 * global.tech['foraging'] : 0);
                let forage_base = global.civic.forager.workers * forage * 0.05;
                fur_bd[loc('job_forager')] = forage_base + 'v';
                modRes('Furs', forage_base * hunger * time_multiplier);
            }

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
                sundial_base += planetTraits.magnetic.vars()[0];
            }
            if (global.race['ascended']){
                sundial_base += 2;
            }

            let professors_base = global.civic.professor.workers;
            professors_base *= global.race['studious'] ? global.civic.professor.impact + traits.studious.vars()[0] : global.civic.professor.impact;
            professors_base *= global.race['pompous'] ? (1 - traits.pompous.vars()[0] / 100) : 1;
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
                scientist_base *= global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 0.75 : 0.6 ) : 0.5;
            }

            let lib_multiplier = 0.05;
            let muckVal = govActive('muckraker',2);
            if (muckVal){
                lib_multiplier -= (muckVal / 100);
            }
            if (global.race['autoignition']){
                lib_multiplier -= (traits.autoignition.vars()[0] / 100);
                if (lib_multiplier < 0){
                    lib_multiplier = 0;
                }
            }
            let library_mult = global.city['library'] ? 1 + (global.city.library.count * lib_multiplier) : 1;

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
                if (global.arpa.hasOwnProperty('sequence') && global.arpa.sequence.time === null){
                    global.arpa.sequence.time = global.arpa.sequence.max;
                }
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
                    delta *= 1 + (traits.toxic.vars()[0] / 100);
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
                if (global.race['inflation']){
                    delta *= 1 + (global.race.inflation / 1250);
                }

                FactoryMoney = delta * hunger;

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
                    factory_output *= 1 + (traits.toxic.vars()[0] / 100);
                }
                if (global.civic.govern.type === 'corpocracy'){
                    factory_output *= global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? 1.4 : 1.3;
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

                if (delta > 0){
                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        delta *= 0.5;
                        fur_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }

                    if (global.tech['q_factory']){
                        let q_bonus = (quantum_level - 1) / 8 + 1;
                        delta *= q_bonus;
                        fur_bd[`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                    }
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
                    factory_output *= 1 + (traits.toxic.vars()[0] / 100);
                }
                if (global.tech['alloy']){
                    factory_output *= 1.37;
                }
                if (global.race['metallurgist']){
                    factory_output *= 1 + (traits.metallurgist.vars()[0] * global.race['metallurgist'] / 100);
                }
                if (global.civic.govern.type === 'corpocracy'){
                    factory_output *= global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? 1.4 : 1.3;
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

                if (delta > 0){
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
                }
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

                let oilIncrement = global.race['kindling_kindred'] || global.race['smoldering'] ? (assembly ? f_rate.Polymer.oil_kk[global.tech['factory']] : f_rate.Polymer.oil_kk[0]) : (assembly ? f_rate.Polymer.oil[global.tech['factory']] : f_rate.Polymer.oil[0]);
                let lumberIncrement = global.race['kindling_kindred'] || global.race['smoldering'] ? 0 : (assembly ? f_rate.Polymer.lumber[global.tech['factory']] : f_rate.Polymer.lumber[0]);
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
                    factory_output *= 1 + (traits.toxic.vars()[0] / 100);
                }
                if (global.tech['polymer'] >= 2){
                    factory_output *= 1.42;
                }
                if (global.civic.govern.type === 'corpocracy'){
                    factory_output *= global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? 1.4 : 1.3;
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

                if (delta > 0){
                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        delta *= 0.5;
                        polymer_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }

                    if (global.tech['q_factory']){
                        let q_bonus = (quantum_level - 1) / 2 + 1;
                        delta *= q_bonus;
                        polymer_bd[`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                    }
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
                    factory_output *= 1 + (traits.toxic.vars()[1] / 100);
                }
                if (global.tech['polymer'] >= 2){
                    factory_output *= 1.42;
                }
                if (global.civic.govern.type === 'corpocracy'){
                    factory_output *= global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? 1.4 : 1.3;
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

                if (delta > 0){
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
                }
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
                    factory_output *= 1 + (traits.toxic.vars()[1] / 100);
                }
                if (global.civic.govern.type === 'corpocracy'){
                    factory_output *= global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? 1.4 : 1.3;
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

                if (delta > 0){
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
                }
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
                factory_output *= global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? 1.4 : 1.3;
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

        let shrineMetal = getShrineBonus('metal');

        // Smelters
        let iron_smelter = 0;
        let star_forge = 0;
        let iridium_smelter = 0;
        let titanium_bd = {};
        if (global.city['smelter'] && (global.city.smelter.count > 0 || global.race['cataclysm'])){
            let capacity = global.city.smelter.count;
            if (p_on['stellar_forge'] && global.tech['star_forge'] && global.tech['star_forge'] >= 2){
                capacity += p_on['stellar_forge'] * 2;
            }
            if (p_on['hell_forge']){
                capacity += p_on['hell_forge'] * 3;
            }
            if (global.tech['m_smelting'] && global.space['hell_smelter']){
                capacity += global.space.hell_smelter.count * 2;
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

            if ((global.race['kindling_kindred'] || global.race['smoldering']) && !global.race['evil']){
                global.city.smelter.Wood = 0;
            }
            let coal_fuel = global.race['kindling_kindred'] || global.race['smoldering'] ? 0.15 : 0.25;

            let total_fuel = 0;
            ['Wood', 'Coal', 'Oil', 'Star', 'Inferno'].forEach(function(fuel){
                if (total_fuel + global.city.smelter[fuel] > global.city.smelter.cap){
                    global.city.smelter[fuel] = global.city.smelter.cap - total_fuel;
                }
                total_fuel += global.city.smelter[fuel]
            });
            if (global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium > global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno){
                let fueled = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno;
                let overflow = global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium - fueled;
                global.city.smelter.Iron -= overflow;
                if (global.city.smelter.Iron < 0){
                    overflow = global.city.smelter.Iron;
                    global.city.smelter.Iron = 0;
                    global.city.smelter.Iridium += overflow;
                    if (global.city.smelter.Iridium < 0){
                        overflow = global.city.smelter.Iridium;
                        global.city.smelter.Iridium = 0;
                    }
                    global.city.smelter.Steel += overflow;
                    if (global.city.smelter.Steel < 0){
                        global.city.smelter.Steel = 0;
                    }
                }
            }
            else if (global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium < global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno){
                let irid_smelt = global.tech['irid_smelting'] || (global.tech['m_smelting'] && global.tech.m_smelting >= 2) ? true : false;
                if (!(global.resource.Iridium.display && irid_smelt) && !(global.resource.Steel.display && global.tech.smelting >= 2 && !global.race['steelen'])){
                    global.city.smelter.Iron++;
                }
            }

            if (global.tech['star_forge'] >= 2){
                global.city.smelter.StarCap = p_on['stellar_forge'] * 2;
            }
            else {
                global.city.smelter.StarCap = 0;
            }
            if (global.city.smelter.Star > global.city.smelter.StarCap){
                let overflow = global.city.smelter.Star - global.city.smelter.StarCap;
                global.city.smelter.Star = global.city.smelter.StarCap;
                global.city.smelter.Oil += overflow;
            }

            let consume_wood = global.race['forge'] ? 0 : global.city.smelter.Wood * (global.race['evil'] && (!global.race['soul_eater'] || global.race.species === 'wendigo') ? 1 : 3);
            let consume_coal = global.race['forge'] ? 0 : global.city.smelter.Coal * coal_fuel;
            let consume_oil = global.race['forge'] ? 0 : global.city.smelter.Oil * 0.35;
            iron_smelter = global.city.smelter.Iron;
            let steel_smelter = global.city.smelter.Steel;
            iridium_smelter = global.city.smelter.Iridium;
            let oil_bonus = global.race['forge'] ? global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno : global.city.smelter.Oil;
            star_forge = global.race['forge'] ? 0 : global.city.smelter.Star;
            let inferno_bonus = global.race['forge'] ? 0 : global.city.smelter.Inferno;

            if (global.race['steelen']) {
                iron_smelter += steel_smelter;
                steel_smelter = 0;
            }

            while (iron_smelter + steel_smelter + iridium_smelter > global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno){
                if (steel_smelter > 0){
                    steel_smelter--;
                }
                else if (iron_smelter > 0){
                    iron_smelter--;
                }
                else {
                    iridium_smelter--;
                }
            }

            let l_type = global.race['soul_eater'] && global.race.species !== 'wendigo' ? 'Food' : (global.race['evil'] ? 'Furs' : 'Lumber');
            while (consume_wood * time_multiplier > global.resource[l_type].amount && consume_wood > 0){
                consume_wood -= (global.race['evil'] && (!global.race['soul_eater'] || global.race.species === 'wendigo') ? 1 : 3);
                if (steel_smelter > 0){
                    steel_smelter--;
                }
                else if (iron_smelter > 0){
                    iron_smelter--;
                }
                else {
                    iridium_smelter--;
                }
            }
            while (consume_coal * time_multiplier > global.resource.Coal.amount && consume_coal > 0){
                consume_coal -= coal_fuel;
                if (steel_smelter > 0){
                    steel_smelter--;
                }
                else if (iron_smelter > 0){
                    iron_smelter--;
                }
                else {
                    iridium_smelter--;
                }
            }
            while (consume_oil * time_multiplier > global.resource.Oil.amount && consume_oil > 0){
                consume_oil -= 0.35;
                oil_bonus--;
                if (steel_smelter > 0){
                    steel_smelter--;
                }
                else if (iron_smelter > 0){
                    iron_smelter--;
                }
                else {
                    iridium_smelter--;
                }
            }

            if (inferno_bonus > 0){
                let inferno_rate = {
                    Oil: 35,
                    Coal: 50,
                    Infernite: 0.5
                };
                Object.keys(inferno_rate).forEach(function(fuel){
                    while (inferno_rate[fuel] * inferno_bonus * time_multiplier > global.resource[fuel].amount && inferno_bonus > 0){
                        inferno_bonus--;
                        if (steel_smelter > 0){
                            steel_smelter--;
                        }
                        else if (iron_smelter > 0){
                            iron_smelter--;
                        }
                        else {
                            iridium_smelter--;
                        }
                    }
                });

                consume_oil += inferno_rate.Oil * inferno_bonus;
                consume_coal += inferno_rate.Coal * inferno_bonus;

                let consume_infernite = inferno_rate.Infernite * inferno_bonus;
                breakdown.p.consume.Infernite[loc('city_smelter')] = -(consume_infernite);
                modRes('Infernite', -(consume_infernite * time_multiplier));
            }

            iron_smelter *= global.tech['smelting'] >= 3 ? 1.2 : 1;
            if (iridium_smelter > 0){
                iridium_smelter = 1 + (iridium_smelter * 0.05);
            }

            if (global.tech['smelting'] >= 7){
                iron_smelter *= 1.25;
                iridium_smelter *= 1.25;
            }
            if (oil_bonus > 0){
                iron_smelter *= 1 + (oil_bonus / 200);
                iridium_smelter *= 1 + (oil_bonus / 200);
            }
            if (inferno_bonus > 0){
                iron_smelter *= 1 + (inferno_bonus / 125);
                iridium_smelter *= 1 + (inferno_bonus / 125);
            }
            if (global.race['pyrophobia']){
                iron_smelter *= 1 - (traits.pyrophobia.vars()[0] / 100);
                iridium_smelter *= 1 - (traits.pyrophobia.vars()[0] / 100);
            }
            if (iridium_smelter < 1){ iridium_smelter = 1; }

            if (global.race['evil']){
                if (global.race['soul_eater'] && global.race.species !== 'wendigo' && !global.race['artifical']){
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
                if (inferno_bonus > 0){
                    steel_smelter *= 1 + (inferno_bonus / 125);
                }

                let smelter_output = steel_smelter * steel_base;
                if (global.race['pyrophobia']){
                    smelter_output *= 1 - (traits.pyrophobia.vars()[0] / 100);
                }

                let delta = smelter_output;
                delta *= hunger * global_multiplier * shrineMetal.mult;

                let steel_bd = {};
                steel_bd[loc('city_smelter')] = smelter_output + 'v';
                steel_bd[loc('city_shrine')] = ((shrineMetal.mult - 1) * 100).toFixed(1) + '%';
                steel_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Steel'] = steel_bd;
                modRes('Steel', delta * time_multiplier);

                if (global.tech['titanium'] && global.tech['titanium'] >= 1){
                    let titanium = smelter_output * hunger;
                    if (star_forge > 0){
                        delta *= 1 + (star_forge / 100);
                    }
                    if (global.city.geology['Titanium']){
                        delta *= global.city.geology['Titanium'] + 1;
                    }
                    if (global.city.biome === 'oceanic'){
                        delta *= biomes.oceanic.vars()[1];
                    }
                    delta *= shrineMetal.mult;
                    let divisor = global.tech['titanium'] >= 3 ? 10 : 25;
                    modRes('Titanium', (delta * time_multiplier) / divisor);
                    titanium_bd[loc('resource_Steel_name')] = (titanium / divisor) + 'v';
                }
            }
        }

        // Graphene
        let graph_source = global.race['truepath'] ? 'space' : 'interstellar';
        if (global[graph_source]['g_factory'] && global[graph_source]['g_factory'].count > 0){
            if (global.race['kindling_kindred'] || global.race['smoldering']){
                global[graph_source].g_factory.Lumber = 0;
            }

            let in_operation = global.race['truepath'] ? support_on['g_factory'] : int_on['g_factory'];
            while (in_operation < global[graph_source].g_factory.Lumber + global[graph_source].g_factory.Coal + global[graph_source].g_factory.Oil){
                if (global[graph_source].g_factory.Oil > 0){
                    global[graph_source].g_factory.Oil--;
                }
                else if (global[graph_source].g_factory.Coal > 0){
                    global[graph_source].g_factory.Coal--;
                }
                else if (global[graph_source].g_factory.Lumber > 0){
                    global[graph_source].g_factory.Lumber--;
                }
            }
            if (in_operation > 0){
                let consume_wood = global[graph_source].g_factory.Lumber * 350;
                let consume_coal = global[graph_source].g_factory.Coal * 25;
                let consume_oil = global[graph_source].g_factory.Oil * 15;

                let graphene_production = global[graph_source].g_factory.Lumber + global[graph_source].g_factory.Coal + global[graph_source].g_factory.Oil;

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

                if (global.race['truepath']){
                    let titan_colonists = p_on['ai_colonist'] ? global.civic.titan_colonist.workers + p_on['ai_colonist'] : global.civic.titan_colonist.workers;
                    graphene_production *= 0.05 * titan_colonists;
                }
                else {
                    graphene_production *= 0.6;
                }

                breakdown.p.consume.Lumber[loc('interstellar_g_factory_bd')] = -(consume_wood);
                breakdown.p.consume.Coal[loc('interstellar_g_factory_bd')] = -(consume_coal);
                breakdown.p.consume.Oil[loc('interstellar_g_factory_bd')] = -(consume_oil);

                modRes('Lumber', -(consume_wood * time_multiplier));
                modRes('Coal', -(consume_coal * time_multiplier));
                modRes('Oil', -(consume_oil * time_multiplier));

                if (global.civic.govern.type === 'corpocracy'){
                    graphene_production *= global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? 1.4 : 1.3;
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
                let synd = global.race['truepath'] ? syndicate('spc_titan') : 1;
                let delta = graphene_production * ai * zigguratBonus() * hunger * global_multiplier * synd;
                graphene_bd[loc('interstellar_g_factory_bd')] = (graphene_production * zigguratBonus()) + 'v';
                graphene_bd[`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';

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
                vitreloy_production *= production('vitreloy_plant');

                breakdown.p.consume.Money[loc('galaxy_vitreloy_plant_bd')] = -(consume_money);
                breakdown.p.consume.Bolognium[loc('galaxy_vitreloy_plant_bd')] = -(consume_bolognium);
                breakdown.p.consume.Stanene[loc('galaxy_vitreloy_plant_bd')] = -(consume_stanene);

                modRes('Money', -(consume_money * time_multiplier));
                modRes('Bolognium', -(consume_bolognium * time_multiplier));
                modRes('Stanene', -(consume_stanene * time_multiplier));

                let pirate = piracy('gxy_alien1');

                vitreloy_bd[loc('galaxy_vitreloy_plant_bd')] = (vitreloy_production) + 'v';

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    vitreloy_production *= 0.5;
                    vitreloy_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                vitreloy_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                vitreloy_bd[`ᄂ${loc('galaxy_piracy')}+0`] = -((1 - pirate) * 100) + '%';
                modRes('Vitreloy', vitreloy_production * hunger * global_multiplier * pirate * time_multiplier);
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

        let cipher_bd = {};
        if (global.space['lander'] && global.space['crashed_ship'] && global.space.crashed_ship.count === 100){
            let synd = syndicate('spc_triton');
            let base = support_on['lander'] * production('lander');
            let delta = base * global_multiplier * synd * hunger;

            cipher_bd[loc('space_lander_title')] = base + 'v';
            cipher_bd[`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
            cipher_bd[`ᄂ${loc('hunger')}`] = ((hunger - 1) * 100) + '%';

            modRes('Cipher', delta * time_multiplier);

            if (global.resource.Cipher.display && global.tech['outer'] && global.tech.outer === 2){
                global.tech.outer = 3;
                drawTech();
            }
        }

        if (global.space['digsite'] && global.space.digsite.count === 100){
            if (!global.tech['dig_control']){
                global.tech['dig_control'] = 1;
                drawTech();
            }

            let synd = syndicate('spc_eris');
            let shock_base = support_on['shock_trooper'] * production('shock_trooper');
            let tank_base = support_on['tank'] * production('tank');

            cipher_bd[loc('space_shock_trooper_title')] = shock_base + 'v';
            cipher_bd[`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
            cipher_bd[loc('space_tank_title')] = tank_base + 'v';
            cipher_bd[`ᄂ${loc('space_syndicate')}+2`] = -((1 - synd) * 100) + '%';

            let delta = (shock_base + tank_base) * global_multiplier * synd;
            modRes('Cipher', delta * time_multiplier);
        }
        breakdown.p['Cipher'] = cipher_bd;

        // Lumber
        { //block scope
            if (global.race['cataclysm']){
                if (global.tech['mars'] && support_on['biodome'] && !global.race['kindling_kindred'] && !global.race['smoldering']){
                    let lumber_bd = {};
                    let lumber = support_on['biodome'] * global.civic.colonist.workers * production('biodome','lumber');

                    lumber_bd[loc('space_red_biodome_title')] = lumber  + 'v';
                    lumber_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                    breakdown.p['Lumber'] = lumber_bd;

                    modRes('Lumber', lumber * hunger * global_multiplier * time_multiplier);
                }
            }
            else if (global.race['soul_eater'] && global.race.species !== 'wendigo' && global.race['evil']){
                let lumber_bd = {};
                let weapons = global.tech['military'] ? (global.tech.military >= 5 ? global.tech.military - 1 : global.tech.military) : 1;
                let hunters = global.civic.hunter.workers * weapons / 2;

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
                if (global.race['forager']){
                    let forage = 1;
                    let forage_base = global.civic.forager.workers * forage * 0.25;
                    lumber_bd[loc('job_forager')] = forage_base  + 'v';
                    modRes('Lumber', forage_base * hunger * global_multiplier * time_multiplier);
                }
                lumber_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Lumber'] = lumber_bd;
                modRes('Lumber', reclaimers * hunger * graveyard * global_multiplier * time_multiplier);
                modRes('Lumber', soldiers * hunger * global_multiplier * time_multiplier);
            }
            else {
                let lumber_base = global.civic.lumberjack.workers;
                lumber_base *= global.city.biome === 'forest' ? biomes.forest.vars()[0] : 1;
                lumber_base *= global.city.biome === 'desert' ? biomes.desert.vars()[2] : 1;
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

                if (global.race['forager']){
                    let forage = 1;
                    let forage_base = global.civic.forager.workers * forage * 0.25;
                    lumber_bd[loc('job_forager')] = forage_base  + 'v';
                    modRes('Lumber', forage_base * hunger * global_multiplier * time_multiplier);
                }

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

                let stone_base = global.resource[global.race.species].amount * traits.sappy.vars()[0];
                stone_bd[flib('name')] = stone_base + 'v';
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
                stone_base *= biomes.desert.vars()[0];
            }
            if (global.tech['explosives'] && global.tech['explosives'] >= 2){
                stone_base *= global.tech['explosives'] >= 3 ? 1.75 : 1.5;
            }

            let asbestos_base = 0;
            if (global.race['smoldering'] && global.resource.Chrysotile.display && global.city['rock_quarry']){
                asbestos_base = stone_base;
                stone_base *= (100 - global.city.rock_quarry.asbestos) / 100;
                asbestos_base *= global.city.rock_quarry.asbestos / 100;
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
            let chrysotile_bd = {};
            stone_bd[loc('workers')] = stone_base + 'v';
            if (stone_base > 0){
                stone_bd[`ᄂ${loc('city_rock_quarry')}`] = ((rock_quarry - 1) * 100) + '%';
                stone_bd[`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
            }
            if (global.race['smoldering'] && global.resource.Chrysotile.display){
                chrysotile_bd[loc('workers')] = asbestos_base + 'v';
                if (asbestos_base > 0){
                    chrysotile_bd[`ᄂ${loc('city_rock_quarry')}`] = ((rock_quarry - 1) * 100) + '%';
                    chrysotile_bd[`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
                }
            }

            if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['rock_quarry'] > 0){
                power_mult = (power_mult - 1) * 0.5 + 1;
                stone_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                if (global.race['smoldering'] && global.resource.Chrysotile.display){
                    chrysotile_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }
            }

            if (global.race['cataclysm']){
                if (global.tech['mars'] && support_on['red_mine']){
                    stone_base = support_on['red_mine'] * global.civic.colonist.workers * production('red_mine','stone');
                    stone_bd[loc('space_red_mine_title')] = stone_base + 'v';
                    if (global.race['smoldering'] && global.resource.Chrysotile.display){
                        asbestos_base = support_on['red_mine'] * global.civic.colonist.workers * production('red_mine','asbestos');
                        chrysotile_bd[loc('space_red_mine_title')] = asbestos_base + 'v';
                    }
                }
                power_mult = 1;
                rock_quarry = 1;
            }

            let delta = stone_base * power_mult * rock_quarry;
            delta *= hunger * global_multiplier;

            if (global.race['forager'] && global.resource.Stone.display){
                let forage = 1;
                let forage_base = global.civic.forager.workers * forage * 0.22;
                stone_bd[loc('job_forager')] = forage_base  + 'v';
                modRes('Stone', forage_base * hunger * global_multiplier * time_multiplier);
            }

            stone_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
            breakdown.p['Stone'] = stone_bd;
            modRes('Stone', delta * time_multiplier);

            if (global.race['smoldering'] && global.resource.Chrysotile.display){
                let a_delta = asbestos_base * power_mult * rock_quarry;
                a_delta *= hunger * global_multiplier;

                chrysotile_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Chrysotile'] = chrysotile_bd;
                modRes('Chrysotile', a_delta * time_multiplier);
            }

            // Aluminium
            if ((global.city['metal_refinery'] && global.city['metal_refinery'].count > 0) || global.race['cataclysm']){
                let base = stone_base * rock_quarry * power_mult * (global.race['cataclysm'] ? 0.16 : 0.08);
                if (global.city.geology['Aluminium']){
                    base *= global.city.geology['Aluminium'] + 1;
                }

                let delta = base * shrineMetal.mult * hunger * global_multiplier;

                if (global.tech['alumina'] >= 2){
                    refinery += p_on['metal_refinery'] * 6;
                }

                delta *= 1 + (refinery / 100);

                alumina_bd[global.race['cataclysm'] ? loc('space_red_mine_title') : loc('workers')] = base + 'v';
                alumina_bd[loc('city_shrine')] = ((shrineMetal.mult - 1) * 100).toFixed(1) + '%';
                alumina_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';

                modRes('Aluminium', delta * time_multiplier);
            }
        }

        // Water
        if (global.resource.Water.display){
            let water_bd = {};
            if (support_on['water_freighter']){
                let synd = syndicate('spc_enceladus');

                let base = production('water_freighter') * support_on['water_freighter'];
                let delta = base * hunger * global_multiplier * synd;

                water_bd[loc('space_water_freighter_title')] = base + 'v';
                water_bd[`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                water_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';

                modRes('Water', delta * time_multiplier);
            }
            breakdown.p['Water'] = water_bd;
        }

        // Mana
        if (global.resource.Mana.display){
            let mana_bd = {};
            if (global.race['casting']){
                ['farmer','miner','lumberjack','science','factory','army','hunting','crafting'].forEach(function (spell){
                    if (global.race.casting[spell] && global.race.casting[spell] > 0){
                        let consume_mana = manaCost(global.race.casting[spell]);
                        breakdown.p.consume.Mana[loc(`modal_pylon_spell_${spell}`)] = -(consume_mana);

                        let buffer = global.resource.Mana.diff > 0 ? global.resource.Mana.diff * time_multiplier : 0
                        if (!modRes('Mana', -(consume_mana * time_multiplier), false, buffer)){
                            global.race.casting[spell]--;
                        }
                    }
                    else {
                        delete breakdown.p.consume.Mana[loc(`modal_pylon_spell_${spell}`)];
                    }
                });
            }

            if (global.city['pylon'] || global.space['pylon']){
                let mana_base = (global.race['cataclysm'] ? global.space.pylon.count : global.city.pylon.count) * (global.race['cataclysm'] ? 0.005 : 0.01);
                mana_base *= darkEffect('magic');

                let delta = mana_base * hunger * global_multiplier;
                mana_bd[loc(global.race['cataclysm'] ? 'space_red_pylon' : 'city_pylon')] = mana_base+'v';

                if (global.tech['nexus']){
                    let nexus = global.tech['nexus'] * 5;
                    delta *= 1 + (nexus / 100);
                    mana_bd[`ᄂ${loc('arpa_projects_nexus_title')}`] = nexus+'%';
                }

                modRes('Mana', delta * time_multiplier);
            }

            if (global.tech['cleric'] && global.civic.priest.display){
                let mana_base = global.civic.priest.workers * 0.0025;
                mana_base *= darkEffect('magic');
                let delta = mana_base * hunger * global_multiplier;

                mana_bd[loc('job_priest')] = mana_base+'v';
                modRes('Mana', delta * time_multiplier);
            }

            if (global.race.universe === 'magic' && global.civic.scientist.display){
                let mana_base = global.civic.scientist.workers * 0.025;
                mana_base *= darkEffect('magic');

                let delta = mana_base * hunger * global_multiplier;
                mana_bd[loc('job_wizard')] = mana_base+'v';

                if (global.civic.govern.type === 'magocracy'){
                    delta *= 1.25;
                    mana_bd[`ᄂ${loc('govern_magocracy')}`] = '25%';
                }

                modRes('Mana', delta * time_multiplier);
            }

            if (global.race.universe === 'magic' && global.tech['syphon']){
                let mana_base = global.tech.syphon / 3;
                mana_base *= darkEffect('magic');

                let delta = mana_base * hunger * global_multiplier;
                mana_bd[loc('arpa_syphon_title')] = mana_base+'v';

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

            if (global.civic.govern.type === 'magocracy'){
                let bonus = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 50 : 40 ) : 25;
                crystal_base *= 1 + (bonus / 100);
                crystal_bd[`ᄂ${loc('govern_magocracy')}`] = `${bonus}%`;
            }

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
                miner_base *= 1 + (traits.tough.vars()[0] / 100);
            }
            if (global.race['industrious']){
                let bonus = 1 + (traits.industrious.vars()[0] * global.race['industrious'] / 100);
                miner_base *= bonus;
            }
            if (global.city.ptrait === 'dense'){
                miner_base *= planetTraits.dense.vars()[0];
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
                    copper_base *= biomes.volcanic.vars()[1];
                }

                let copper_power = power_mult;
                copper_bd[loc('job_miner')] = (copper_base) + 'v';
                if (copper_base > 0){
                    copper_bd[`ᄂ${loc('power')}`] = ((copper_power - 1) * 100) + '%';
                    if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['mine'] > 0){
                        copper_power = (copper_power - 1) * 0.5 + 1;
                        copper_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }
                }
                let delta = copper_base * shrineMetal.mult * copper_power;
                delta *= hunger * global_multiplier;

                modRes('Copper', delta * time_multiplier);

                if (global.race['forager'] && global.tech['dowsing']){
                    let forage = global.tech.dowsing >= 2 ? 5 : 1;
                    let forage_base = global.civic.forager.workers * forage * 0.025;
                    if (global.city.geology['Copper']){
                        forage_base *= global.city.geology['Copper'] + 1;
                    }
                    if (global.city.biome === 'volcanic'){
                        forage_base *= biomes.volcanic.vars()[1];
                    }
                    copper_bd[loc('job_forager')] = forage_base  + 'v';
                    modRes('Copper', forage_base * hunger * global_multiplier * time_multiplier);
                }
            }

            // Iron
            if (global.resource.Iron.display){
                let iron_bd = {};
                let iron_mult = 1/4;
                let iron_base = miner_base * iron_mult;
                if (global.race['iron_allergy']){
                    iron_base *= 1 - (traits.iron_allergy.vars()[0] / 100);
                }
                let smelter_mult = 1 + (iron_smelter * 0.1);

                if (global.city.geology['Iron']){
                    iron_base *= global.city.geology['Iron'] + 1;
                }

                if (global.city.biome === 'volcanic'){
                    iron_base *= biomes.volcanic.vars()[2];
                }

                let space_iron = 0;

                let synd = syndicate('spc_belt');
                if (support_on['iron_ship']){
                    space_iron = support_on['iron_ship'] * production('iron_ship');
                    space_iron *= synd;
                }

                let iron_power = power_mult;
                iron_bd[loc('job_miner')] = (iron_base) + 'v';
                if (iron_base > 0){
                    iron_bd[`ᄂ${loc('power')}`] = ((iron_power - 1) * 100) + '%';
                    if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['mine'] > 0){
                        iron_power = (iron_power - 1) * 0.5 + 1;
                        iron_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }
                }

                let delta = ((iron_base * iron_power) + space_iron) * smelter_mult * shrineMetal.mult;
                delta *= hunger * global_multiplier;

                iron_bd[loc('job_space_miner')] = space_iron + 'v';
                iron_bd[`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                iron_bd[loc('city_smelter')] = ((smelter_mult - 1) * 100) + '%';
                iron_bd[loc('city_shrine')] = ((shrineMetal.mult - 1) * 100).toFixed(1) + '%';

                if (global.race['forager'] && global.tech['dowsing']){
                    let forage = global.tech.dowsing >= 2 ? 5 : 1;
                    let forage_base = global.civic.forager.workers * forage * 0.035;
                    if (global.city.geology['Iron']){
                        forage_base *= global.city.geology['Iron'] + 1;
                    }
                    if (global.city.biome === 'volcanic'){
                        forage_base *= biomes.volcanic.vars()[2];
                    }
                    iron_bd[loc('job_forager')] = forage_base  + 'v';
                    modRes('Iron', forage_base * hunger * global_multiplier * time_multiplier);
                }

                iron_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                breakdown.p['Iron'] = iron_bd;
                modRes('Iron', delta * time_multiplier);

                if (global.tech['titanium'] && global.tech['titanium'] >= 2){
                    let labor_base = support_on['iron_ship'] ? (global.civic.miner.workers / 4) + (support_on['iron_ship'] / 2) : (global.civic.miner.workers / 4);
                    let iron = labor_base * iron_smelter * 0.1;
                    delta = iron * global_multiplier;
                    if (star_forge > 0){
                        delta *= 1 + (star_forge / 100);
                    }
                    if (global.city.geology['Titanium']){
                        delta *= global.city.geology['Titanium'] + 1;
                    }
                    if (global.city.biome === 'oceanic'){
                        delta *= biomes.oceanic.vars()[0];
                    }
                    delta *= shrineMetal.mult;
                    let divisor = global.tech['titanium'] >= 3 ? 10 : 25;
                    modRes('Titanium', (delta * time_multiplier) / divisor);
                    titanium_bd[loc('resource_Iron_name')] = (iron / divisor) + 'v';
                }
            }

            if (global.race['sappy']){
                // Alt Aluminium
                if ((global.city['metal_refinery'] && global.city['metal_refinery'].count > 0) || global.race['cataclysm']){
                    let base = 0;
                    if (global.race['cataclysm']){
                        if (global.tech['mars'] && support_on['red_mine']){
                            base = support_on['red_mine'] * global.civic.colonist.workers * production('red_mine','aluminium');
                        }
                    }
                    else {
                        base = miner_base * power_mult * 0.088;
                    }

                    if (global.city.geology['Aluminium']){
                        base *= global.city.geology['Aluminium'] + 1;
                    }

                    let delta = base * shrineMetal.mult * hunger * global_multiplier;

                    if (global.tech['alumina'] >= 2){
                        refinery += p_on['metal_refinery'] * 6;
                    }

                    delta *= 1 + (refinery / 100);

                    alumina_bd[global.race['cataclysm'] ? loc('space_red_mine_title') : loc('job_miner')] = base + 'v';
                    alumina_bd[loc('city_shrine')] = ((shrineMetal.mult - 1) * 100) + '%';
                    alumina_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';

                    modRes('Aluminium', delta * time_multiplier);
                }

                // Alt Chrysotile
                if (global.race['smoldering'] && global.resource.Chrysotile.display){
                    let chrysotile_bd = {};

                    let cry_base = miner_base / 2;
                    let cry_power = power_mult;
                    chrysotile_bd[loc('job_miner')] = (cry_base) + 'v';
                    if (cry_base > 0){
                        chrysotile_bd[`ᄂ${loc('power')}`] = ((cry_power - 1) * 100) + '%';
                        if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['mine'] > 0){
                            cry_power = (cry_power - 1) * 0.5 + 1;
                            chrysotile_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                        }
                    }
                    let delta = cry_base * cry_power;
                    delta *= hunger * global_multiplier;

                    chrysotile_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
                    breakdown.p['Chrysotile'] = chrysotile_bd;
                    modRes('Chrysotile', delta * time_multiplier);
                }
            }
        }

        {
            // Aluminium Mining Droids
            if (global.interstellar['mining_droid'] && miner_droids['alum'] > 0){
                let base = miner_droids['alum'] * 2.75 * zigguratBonus();
                let delta = base * shrineMetal.mult * global_multiplier;
                delta *= 1 + (refinery / 100);

                alumina_bd[loc('interstellar_mining_droid_title')] = base + 'v';

                modRes('Aluminium', delta * time_multiplier);
            }

            // Aluminium Titan Mines
            if (global.resource.Aluminium.display && global.space['titan_mine']){
                let synd = syndicate('spc_titan');
                let titan_colonists = p_on['ai_colonist'] ? global.civic.titan_colonist.workers + p_on['ai_colonist'] : global.civic.titan_colonist.workers;
                let alum_base = production('titan_mine','aluminium') * support_on['titan_mine'] * titan_colonists;
                let alum_delta = alum_base * shrineMetal.mult * global_multiplier * synd;
                alum_delta *= 1 + (refinery / 100);
                alumina_bd[loc('city_mine')] = +(alum_base).toFixed(3) + 'v';
                alumina_bd[`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                modRes('Aluminium', alum_delta * time_multiplier);
            }

            if (refinery > 0){
                alumina_bd[loc('city_metal_refinery')] = refinery + '%';
            }
            breakdown.p['Aluminium'] = alumina_bd;
        }

        // Mars Mining
        if (support_on['red_mine'] && support_on['red_mine'] > 0){
            let synd = syndicate('spc_red');

            let copper_base = support_on['red_mine'] * global.civic.colonist.workers * production('red_mine','copper').f;
            copper_base *= shrineMetal.mult;
            copper_bd[loc('space_red_mine_desc_bd', [races[global.race.species].solar.red])] = (copper_base) + 'v';
            copper_bd[`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
            modRes('Copper', copper_base * time_multiplier * global_multiplier * hunger * synd);

            let titanium_base = support_on['red_mine'] * global.civic.colonist.workers * hunger * production('red_mine','titanium').f;
            titanium_base *= shrineMetal.mult;
            titanium_bd[loc('space_red_mine_desc_bd', [races[global.race.species].solar.red])] = (titanium_base) + 'v';
            titanium_bd[`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
            modRes('Titanium', titanium_base * time_multiplier * global_multiplier  * synd);
        }
        if (shrineBonusActive()){
            copper_bd[loc('city_shrine')] = ((shrineMetal.mult - 1) * 100).toFixed(1) + '%';
            titanium_bd[loc('city_shrine')] = ((shrineMetal.mult - 1) * 100).toFixed(1) + '%';
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
                coal_base *= 1 + (traits.tough.vars()[0] / 100);
            }
            if (global.race['resilient']){
                let bonus = 1 + (traits.resilient.vars()[0] * global.race['resilient'] / 100);
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

            if (global.race['cataclysm'] && support_on['iridium_mine']){
                coal_base = support_on['iridium_mine'] * production('iridium_mine','coal');
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

        // Kuiper Uranium
        if (global.space['uranium_mine'] && p_on['uranium_mine']){
            let synd = syndicate('spc_kuiper');

            let mine_base = p_on['uranium_mine'] * production('uranium_mine');
            let mine_delta = mine_base * global_multiplier * synd;
            uranium_bd[loc('space_kuiper_mine',[global.resource.Uranium.name])] = mine_base + 'v';
            uranium_bd[`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
            modRes('Uranium', mine_delta * time_multiplier);
        }

        breakdown.p['Uranium'] = uranium_bd;

        // Oil
        if (global.city['oil_well']){
            let oil_extractor = p_on['oil_extractor'] * production('oil_extractor');
            let oil_well = production('oil_well') * global.city.oil_well.count;

            let synd = syndicate('spc_gas_moon');

            let delta = oil_well + (oil_extractor * synd);
            delta *= hunger * global_multiplier;

            let oil_bd = {};
            oil_bd[loc('city_oil_well')] = oil_well + 'v';
            oil_bd[loc('space_gas_moon_oil_extractor_title')] = oil_extractor + 'v';
            oil_bd[`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
            oil_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
            breakdown.p['Oil'] = oil_bd;
            modRes('Oil', delta * time_multiplier);
        }

        // Iridium
        let iridium_bd = {};
        if (support_on['iridium_mine']){
            let iridium_base = support_on['iridium_mine'] * production('iridium_mine','iridium').f;
            let synd = syndicate('spc_moon');
            let delta = iridium_base * hunger * shrineMetal.mult * global_multiplier * synd * iridium_smelter;

            iridium_bd[loc('space_moon_iridium_mine_title')] = iridium_base + 'v';
            iridium_bd[`ᄂ${loc('city_smelter')}+0`] = ((iridium_smelter - 1) * 100) + '%';
            iridium_bd[`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
            modRes('Iridium', delta * time_multiplier);
        }

        if (support_on['iridium_ship']){
            let iridium_base = support_on['iridium_ship'] * production('iridium_ship');
            let synd = syndicate('spc_belt');
            let delta = iridium_base * hunger * shrineMetal.mult * global_multiplier * synd * iridium_smelter;

            iridium_bd[loc('job_space_miner')] = iridium_base + 'v';
            iridium_bd[`ᄂ${loc('city_smelter')}+1`] = ((iridium_smelter - 1) * 100) + '%';
            iridium_bd[`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
            modRes('Iridium', delta * time_multiplier);
        }

        if (p_on['s_gate'] && global.resource.Adamantite.display && global.galaxy['armed_miner'] && gal_on['armed_miner'] > 0){
            let base = gal_on['armed_miner'] * 0.65 * zigguratBonus();
            let foothold = 1 + (gal_on['ore_processor'] * 0.1);
            let pirate = piracy('gxy_alien2');
            let delta = base * global_multiplier * pirate * foothold * hunger * shrineMetal.mult;

            iridium_bd[loc('galaxy_armed_miner_bd')] = base + 'v';
            iridium_bd[`ᄂ${loc('galaxy_ore_processor')}`] = -((1 - foothold) * 100) + '%';
            iridium_bd[`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
            modRes('Iridium', delta * time_multiplier);
        }

        if (shrineBonusActive()){
            iridium_bd[loc('city_shrine')] = ((shrineMetal.mult - 1) * 100).toFixed(1) + '%';
        }
        iridium_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
        breakdown.p['Iridium'] = iridium_bd;

        // Helium 3
        let helium_bd = {};
        if (global.space['moon_base'] && support_on['helium_mine']){
            let helium_base = support_on['helium_mine'] * production('helium_mine').f;
            let synd = syndicate('spc_moon');
            let delta = helium_base * hunger * global_multiplier * synd;

            helium_bd[loc('space_moon_helium_mine_title')] = helium_base + 'v';
            helium_bd[`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
            modRes('Helium_3', delta * time_multiplier);
        }

        if (global.space['gas_mining'] && p_on['gas_mining']){
            let gas_mining = p_on['gas_mining'] * production('gas_mining');
            let synd = syndicate('spc_gas');
            let delta = gas_mining * hunger * global_multiplier * synd;

            helium_bd[loc('space_gas_mining_title')] = gas_mining + 'v';
            helium_bd[`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
            modRes('Helium_3', delta * time_multiplier);
        }

        let deuterium_bd = {};
        if (global.interstellar['harvester'] && int_on['harvester']){
            let gas_mining = int_on['harvester'] * production('harvester','helium');
            let delta = gas_mining * hunger * global_multiplier;

            helium_bd[loc('interstellar_harvester_title')] = gas_mining + 'v';
            if (global.race['discharge'] && global.race['discharge'] > 0){
                delta *= 0.5;
                helium_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            modRes('Helium_3', delta * time_multiplier);

            if (global.tech['ram_scoop']){
                let deut_mining = int_on['harvester'] * production('harvester','deuterium');
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
            let p_values = production('outpost',true);

            neutronium_bd[loc('space_gas_moon_outpost_bd')] = (p_values.b * p_on['outpost']) + 'v';
            if (global.tech['drone']){
                neutronium_bd[`ᄂ${loc('tech_worker_drone')}`] = (p_values.d * 100) + '%';
            }
            let synd = syndicate('spc_gas_moon');
            neutronium_bd[`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';

            let delta = p_on['outpost'] * p_values.n * hunger * global_multiplier * synd;

            if (global.race['discharge'] && global.race['discharge'] > 0){
                delta *= 0.5;
                neutronium_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            modRes('Neutronium', delta * time_multiplier);
        }

        if (p_on['neutron_miner']){
            let n_base = p_on['neutron_miner'] * production('neutron_miner');
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

        // Kuiper Neutronium
        if (global.space['neutronium_mine'] && p_on['neutronium_mine']){
            let synd = syndicate('spc_kuiper');

            let mine_base = p_on['neutronium_mine'] * production('neutronium_mine');
            let mine_delta = mine_base * global_multiplier * synd;
            neutronium_bd[loc('space_kuiper_mine',[global.resource.Neutronium.name])] = mine_base + 'v';
            neutronium_bd[`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
            modRes('Neutronium', mine_delta * time_multiplier);
        }

        neutronium_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
        breakdown.p['Neutronium'] = neutronium_bd;

        // Elerium
        let elerium_bd = {};
        if (support_on['elerium_ship']){
            let elerium_base = support_on['elerium_ship'] * production('elerium_ship');
            let synd = syndicate('spc_belt');
            let delta = elerium_base * hunger * global_multiplier * synd;
            elerium_bd[loc('job_space_miner')] = elerium_base + 'v';
            elerium_bd[`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';

            if (global.race['discharge'] && global.race['discharge'] > 0){
                delta *= 0.75;
                elerium_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-25%';
            }

            modRes('Elerium', delta * time_multiplier);
        }

        // Prospector
        if (int_on['elerium_prospector']){
            let elerium_base = int_on['elerium_prospector'] * production('elerium_prospector');
            let delta = elerium_base * hunger * global_multiplier;
            elerium_bd[loc('interstellar_elerium_prospector_bd')] = elerium_base + 'v';
            modRes('Elerium', delta * time_multiplier);
        }
        elerium_bd[loc('hunger')] = ((hunger - 1) * 100) + '%';
        breakdown.p['Elerium'] = elerium_bd;

        // Kuiper Elerium
        if (global.space['elerium_mine'] && p_on['elerium_mine']){
            let synd = syndicate('spc_kuiper');

            let mine_base = p_on['elerium_mine'] * production('elerium_mine');
            let mine_delta = mine_base * global_multiplier * synd;
            elerium_bd[loc('space_kuiper_mine',[global.resource.Elerium.name])] = mine_base + 'v';
            elerium_bd[`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
            modRes('Elerium', mine_delta * time_multiplier);
        }

        // Adamantite
        let adamantite_bd = {};
        if (global.resource.Adamantite.display && global.interstellar['mining_droid'] && miner_droids['adam'] > 0){
            let driod_base = miner_droids['adam'] * 0.075 * zigguratBonus();
            let driod_delta = driod_base * shrineMetal.mult * global_multiplier;
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
            modRes('Adamantite', driod_delta * time_multiplier);
        }

        if (p_on['s_gate'] && global.resource.Adamantite.display && global.galaxy['armed_miner'] && gal_on['armed_miner'] > 0){
            let base = gal_on['armed_miner'] * 0.23 * zigguratBonus();
            let foothold = 1 + (gal_on['ore_processor'] * 0.1);
            let pirate = piracy('gxy_alien2');
            let delta = base * global_multiplier * pirate * foothold * shrineMetal.mult;

            adamantite_bd[loc('galaxy_armed_miner_bd')] = base + 'v';
            adamantite_bd[`ᄂ${loc('galaxy_ore_processor')}`] = -((1 - foothold) * 100) + '%';
            adamantite_bd[`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
            modRes('Adamantite', delta * time_multiplier);
        }

        if (global.resource.Adamantite.display && global.space['titan_mine']){
            let synd = syndicate('spc_titan');
            let titan_colonists = p_on['ai_colonist'] ? global.civic.titan_colonist.workers + p_on['ai_colonist'] : global.civic.titan_colonist.workers;
            let adam_base = production('titan_mine','adamantite') * support_on['titan_mine'] * titan_colonists;
            let adam_delta = adam_base * shrineMetal.mult * global_multiplier * synd;
            adamantite_bd[loc('city_mine')] = adam_base + 'v';
            adamantite_bd[`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
            modRes('Adamantite', adam_delta * time_multiplier);
        }

        if (shrineBonusActive()){
            adamantite_bd[loc('city_shrine')] = ((shrineMetal.mult - 1) * 100).toFixed(1) + '%';
        }
        breakdown.p['Adamantite'] = adamantite_bd;

        // Infernite
        let infernite_bd = {};
        if (global.resource.Infernite.display){

            if (global.civic.hell_surveyor.workers > 0){
                let rate = global.tech.infernite >= 3 ? 0.015 : 0.01;
                let surveyor_base = global.civic.hell_surveyor.workers * rate;

                let sensors = 1;
                if (global.tech['infernite'] >= 2 && p_on['sensor_drone']){
                    let drone_rate = global.tech.infernite >= 4 ? (global.tech.infernite >= 6 ? 0.5 : 0.2) : 0.1;
                    sensors = 1 + (p_on['sensor_drone'] * drone_rate);
                }

                let surveyor_delta = surveyor_base * sensors * global_multiplier;

                infernite_bd[loc('job_hell_surveyor')] = surveyor_base + 'v';
                infernite_bd[`ᄂ${loc('portal_sensor_drone_title')}`] = ((sensors - 1) * 100) + '%';
                modRes('Infernite', surveyor_delta * time_multiplier);
            }

            if (p_on['infernite_mine']){
                let sup = hellSupression('gate');
                let rate = 0.5 * sup.supress;
                let mine_base = p_on['infernite_mine'] * rate;

                let mine_delta = mine_base * global_multiplier;

                infernite_bd[loc('city_mine')] = mine_base + 'v';
                modRes('Infernite', mine_delta * time_multiplier);
            }

        }
        breakdown.p['Infernite'] = infernite_bd;

        // Bolognium
        let bolognium_bd = {};
        if (p_on['s_gate'] && global.resource.Bolognium.display && global.galaxy['bolognium_ship'] && gal_on['bolognium_ship'] > 0){
            let base = gal_on['bolognium_ship'] * production('bolognium_ship');
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
            let base = p_on['excavator'] * production('excavator');
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

        // Kuiper Orichalcum
        if (global.space['orichalcum_mine'] && p_on['orichalcum_mine']){
            let synd = syndicate('spc_kuiper');

            let mine_base = p_on['orichalcum_mine'] * production('orichalcum_mine');
            let mine_delta = mine_base * global_multiplier * synd;
            orichalcum_bd[loc('space_kuiper_mine',[global.resource.Orichalcum.name])] = mine_base + 'v';
            orichalcum_bd[`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
            modRes('Orichalcum', mine_delta * time_multiplier);
        }

        breakdown.p['Orichalcum'] = orichalcum_bd;

        // Income
        let rawCash = FactoryMoney ? FactoryMoney * global_multiplier : 0;
        if (global.tech['currency'] >= 1){
            let income_base = global.resource[global.race.species].amount + global.civic.garrison.workers - global.civic.unemployed.workers;
            income_base *= global.race['truepath'] ? 0.2 : 0.4;
            if (global.race['greedy']){
                income_base *= 1 - (traits.greedy.vars()[0] / 100);
            }

            if (fed){
                if (global.tech['banking'] && global.tech['banking'] >= 2){
                    let impact = global.civic.banker.impact;
                    if (global.tech['banking'] >= 10){
                        impact += 0.02 * global.tech['stock_exchange'];
                    }
                    if (global.race['truthful']){
                        impact *= 1 - (traits.truthful.vars()[0] / 100);
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
                income_base *= global.tech['high_tech'] && global.tech['high_tech'] >= 2 ? ( global.tech['high_tech'] >= 12 ? 1 : 0.98 ) : 0.95;
            }
            if (global.civic.govern.type === 'corpocracy'){
                income_base *= 0.5;
            }
            if (global.civic.govern.type === 'socialist'){
                income_base *= 0.8;
            }
            if (global.race['banana']){
                income_base *= 0.05;
            }

            let temple_mult = 1;
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 4){
                if (global.race['truepath']){
                    let merchsales = global.resource[global.race.species].amount * global.city.temple.count * 0.08;
                    money_bd[loc('city_temple')] = (merchsales) + 'v';
                    modRes('Money', +(merchsales * global_multiplier * time_multiplier).toFixed(2));
                }
                else {
                    temple_mult += (global.race['cataclysm'] ? global.space.ziggurat.count : global.city.temple.count) * 0.025;
                }
            }

            let upkeep = 0;
            if (!global.tech['world_control'] && global.civic.govern.type !== 'federation'){
                for (let i=0; i<3; i++){
                    if (global.civic.foreign[`gov${i}`].buy){
                        upkeep += income_base * 0.2;
                    }
                }
            }

            let getShrineResult = getShrineBonus('tax');

            let delta = (income_base - upkeep) * temple_mult * getShrineResult.mult;
            delta *= global_multiplier;

            money_bd[loc('morale_tax')] = (income_base) + 'v';
            if (income_base > 0){
                money_bd[`ᄂ${loc('civics_spy_purchase_bd')}`] = -(upkeep) + 'v';
                money_bd[global.race['cataclysm'] ? `ᄂ${loc('space_red_ziggurat_title')}` : `ᄂ${loc('city_temple')}`] = ((temple_mult - 1) * 100) + '%';
                money_bd[`ᄂ${loc('city_shrine')}`] = ((getShrineResult.mult - 1) * 100) + '%';
            }
            money_bd[loc('city_factory')] = FactoryMoney + 'v';
            if (global.race['discharge'] && global.race['discharge'] > 0 && FactoryMoney > 0){
                money_bd[`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }
            modRes('Money', +(delta * time_multiplier).toFixed(2));
            rawCash += delta;
        }

        if (global.tech['gambling'] && (p_on['casino'] || p_on['spc_casino'])){
            let casinos = 0;
            if (p_on['casino']){ casinos += p_on['casino']; }
            if (p_on['spc_casino']){ casinos += p_on['spc_casino']; }

            let cash = Math.log2(1 + global.resource[global.race.species].amount);
            let revenue = 2.5;
            if (global.race['gambler']){
                revenue *= 1 + (traits.gambler.vars()[0] * global.race['gambler'] / 100);
            }
            cash *= revenue;
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
            if (global.race['inflation']){
                cash *= 1 + (global.race.inflation / 1250);
            }
            let racVal = govActive('racketeer',1);
            if (racVal){
                cash *= 1 + (racVal / 100);
            }
            cash *= casinos;
            money_bd[loc('city_casino')] = cash + 'v';
            modRes('Money', +(cash * time_multiplier * global_multiplier * hunger).toFixed(2));
            rawCash += cash * global_multiplier * hunger;
        }

        if (global.city['tourist_center']){
            let tourism = 0;
            let amp = global.tech['monument'] && global.tech.monument >= 3 && p_on['s_gate'] ? 3 : 1;
            if (global.city['amphitheatre']){
                tourism += global.city['tourist_center'].on * global.city.amphitheatre.count * amp;
            }
            if (global.city['casino']){
                tourism += global.city['tourist_center'].on * global.city.casino.count * 5 * amp;
            }
            if (global.space['spc_casino']){
                tourism += global.city['tourist_center'].on * global.space.spc_casino.count * 5 * amp;
            }
            if (global.tech['monuments']){
                tourism += global.city['tourist_center'].on * global.tech['monuments'] * 2 * amp;
            }
            if (global.city['trade'] && global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 4){
                tourism += global.city['tourist_center'].on * global.city.trade.count * 3 * amp;
            }
            let piousVal = govActive('pious',1);
            if (piousVal && global.city['temple']){
                tourism += global.city['tourist_center'].on * global.city.temple.count * piousVal * amp;
            }
            if (global.civic.govern.type === 'corpocracy'){
                tourism *= 2;
            }
            if (global.civic.govern.type === 'socialist'){
                tourism *= 0.8;
            }
            money_bd[loc('tech_tourism')] = Math.round(tourism) + 'v';
            modRes('Money', +(tourism * time_multiplier * global_multiplier * hunger).toFixed(2));
            rawCash += tourism* global_multiplier * hunger;
        }

        {
            let racVal = govActive('racketeer',0);
            if (racVal){
                let theft = -(Math.round(rawCash * (racVal / 100)));
                breakdown.p.consume.Money[loc('gov_trait_racketeer_bd')] = theft;
                modRes('Money', +(theft * time_multiplier).toFixed(2));
            }
        }

        {
            let psVal = govActive('pious',0);
            if (psVal){
                let tithe = -(Math.round(rawCash * (psVal / 100)));
                breakdown.p.consume.Money[loc('gov_trait_pious_bd')] = tithe;
                modRes('Money', +(tithe * time_multiplier).toFixed(2));
            }
        }

        breakdown.p['Money'] = money_bd;

        // Crafting
        if (global.tech['foundry']){
            let craft_costs = global.race['resourceful'] ? (1 - traits.resourceful.vars()[0] / 100) : 1;
            let crafting_costs = craftCost();
            let crafting_usage = {};

            craftingRatio('','',true); //Recalculation
            Object.keys(crafting_costs).forEach(function (craft){
                if (craft === 'Thermite' && !eventActive('summer')){
                    return;
                }
                breakdown.p[craft] = {};
                let num = global.city.foundry[craft];
                let craft_ratio = craftingRatio(craft,'auto').multiplier;

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

                breakdown.p[craft][loc(`job_craftsman`)] = (volume * speed / 140) + 'v';

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

        if (firstRun){
            if (global.tech['piracy']){
                renderSpace();
            }
            if (global.settings.portal.ruins){
                vBind({el: `#srprtl_ruins`},'update');
                vBind({el: `#foundry`},'update');
            }
            if (global.settings.portal.gate){
                vBind({el: `#srprtl_gate`},'update');
            }
        }
    }

    if (global.civic['garrison'] && global.civic.garrison.workers < global.civic.garrison.max){
        let rate = 2.5;
        if (global.race['diverse']){
            rate /= 1 + (traits.diverse.vars()[0] / 100);
        }
        if (global.city['boot_camp']){
            let train = global.tech['boot_camp'] >= 2 ? 0.08 : 0.05;
            if (global.blood['lust']){
                train += global.blood.lust * 0.002;
            }
            let milVal = govActive('militant',0);
            if (milVal){
                train *= 1 + (milVal / 100);
            }
            rate *= 1 + (global.city['boot_camp'].count * train);
        }
        if (global.race['beast']){
            rate *= 1 + (traits.beast.vars()[2] / 100);
        }
        global.civic.garrison.rate = rate * time_multiplier;
        if (global.race['brute']){
            global.civic.garrison.rate += traits.brute.vars()[1] / 40 * time_multiplier;
        }
        global.civic.garrison.progress += global.civic.garrison.rate;
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
            diffCalc(res,webWorker.mt);
        }
    });

    if (global.settings.expose){
        if (!window['evolve']){
            enableDebug();
        }
        updateDebugData();
    }

    let easter = eventActive('easter');
    if (easter.active){
        for (i=1; i<=15; i++){
            if ($(`#egg${i}`).length > 0 && !$(`#egg${i}`).hasClass('binded')){
                easterEggBind(i);
                $(`#egg${i}`).addClass('binded');
            }
        }
    }

    let halloween = eventActive('halloween');
    if (halloween.active){
        for (i=1; i<=7; i++){
            if ($(`#treat${i}`).length > 0 && !$(`#treat${i}`).hasClass('binded')){
                trickOrTreatBind(i,false);
                $(`#treat${i}`).addClass('binded');
            }
        }
        for (i=1; i<=7; i++){
            if ($(`#trick${i}`).length > 0 && !$(`#trick${i}`).hasClass('binded')){
                trickOrTreatBind(i,true);
                $(`#trick${i}`).addClass('binded');
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
            Slave: 0,
            Mana: 0,
            Knowledge: global.stats.achieve['extinct_junker'] && global.stats.achieve['extinct_junker'].l >= 1 ? 1000 : 100,
            Zen: 0,
            Food: 1000,
            Crates: 0,
            Containers: 0,
            Lumber: 200,
            Stone: 200,
            Chrysotile: 200,
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
            Water: 0,
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
            Orichalcum: 0,
            Cipher: 0,
            Nanite: 0,
        };
        // labor caps
        var lCaps = {
            unemployed: -1,
            hunter: -1,
            forager: -1,
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
            titan_colonist: 0,
            space_miner: 0,
            hell_surveyor: 0,
            archaeologist: 0,
            crew: 0
        };

        if (global.race['cataclysm']){
            caps['Money'] += 250000;
            caps['Knowledge'] += 100000;
            caps['Lumber'] += 100000;
            caps['Stone'] += 100000;
            caps['Chrysotile'] += 100000;
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

        if (global.stats.feat['adept'] && global.stats.achieve['whitehole'] && global.stats.achieve.whitehole.l > 0){
            let rank = Math.min(global.stats.achieve.whitehole.l,global.stats.feat['adept']);
            caps['Lumber'] += rank * 60;
            caps['Stone'] += rank * 60;
        }

        var bd_Money = { [loc('base')]: caps['Money']+'v' };
        var bd_Citizen = {};
        var bd_Slave = {};
        var bd_Mana = { [loc('base')]: caps['Mana']+'v' };
        var bd_Knowledge = { [loc('base')]: caps['Knowledge']+'v' };
        var bd_Zen = {};
        var bd_Crates = {};
        var bd_Containers = {};
        var bd_Food = { [loc('base')]: caps['Food']+'v' };
        var bd_Lumber = { [loc('base')]: caps['Lumber']+'v' };
        var bd_Stone = { [loc('base')]: caps['Stone']+'v' };
        var bd_Chrysotile = { [loc('base')]: caps['Chrysotile']+'v' };
        var bd_Crystal = { [loc('base')]: caps['Crystal']+'v' };
        var bd_Furs = { [loc('base')]: caps['Furs']+'v' };
        var bd_Copper = { [loc('base')]: caps['Copper']+'v' };
        var bd_Iron = { [loc('base')]: caps['Iron']+'v' };
        var bd_Cement = { [loc('base')]: caps['Cement']+'v' };
        var bd_Coal = { [loc('base')]: caps['Coal']+'v' };
        var bd_Oil = { [loc('base')]: caps['Oil']+'v' };
        var bd_Uranium = { [loc('base')]: caps['Uranium']+'v' };
        var bd_Steel = { [loc('base')]: caps['Steel']+'v' };
        var bd_Aluminium = { [loc('base')]: caps['Aluminium']+'v' };
        var bd_Titanium = { [loc('base')]: caps['Titanium']+'v' };
        var bd_Alloy = { [loc('base')]: caps['Alloy']+'v' };
        var bd_Polymer = { [loc('base')]: caps['Polymer']+'v' };
        var bd_Iridium = { [loc('base')]: caps['Iridium']+'v' };
        var bd_Helium = { [loc('base')]: caps['Helium_3']+'v' };
        var bd_Water = { [loc('base')]: caps['Water']+'v' };
        var bd_Deuterium = { [loc('base')]: caps['Deuterium']+'v' };
        var bd_Neutronium = { [loc('base')]: caps['Neutronium']+'v' };
        var bd_Adamantite = { [loc('base')]: caps['Adamantite']+'v' };
        var bd_Infernite = { [loc('base')]: caps['Infernite']+'v' };
        var bd_Elerium = { [loc('base')]: caps['Elerium']+'v' };
        var bd_Nano_Tube = { [loc('base')]: caps['Nano_Tube']+'v' };
        var bd_Graphene = { [loc('base')]: caps['Graphene']+'v' };
        var bd_Stanene = { [loc('base')]: caps['Stanene']+'v' };
        var bd_Bolognium = { [loc('base')]: caps['Bolognium']+'v' };
        var bd_Vitreloy = { [loc('base')]: caps['Vitreloy']+'v' };
        var bd_Orichalcum = { [loc('base')]: caps['Orichalcum']+'v' };
        var bd_Cipher = { [loc('base')]: caps['Cipher']+'v' };
        var bd_Nanite = { [loc('base')]: caps['Nanite']+'v' };

        caps[global.race.species] = 0;

        if (global.city['nanite_factory']){
            let gain = global.city.nanite_factory.count * spatialReasoning(2500);
            caps['Nanite'] += gain;
            bd_Nanite[loc('city_nanite_factory')] = gain+'v';
        }
        if (p_on['transmitter'] && global.race['artifical']){
            let gain = p_on['transmitter'] * spatialReasoning(100);
            caps['Food'] += gain;
            bd_Food[loc('city_transmitter')] = gain+'v';
        }
        if (global.city['pylon'] || global.space['pylon']){
            let gain = (global.race['cataclysm'] ? global.space.pylon.count : global.city.pylon.count) * spatialReasoning(global.race['cataclysm'] ? 2 : 5);
            caps['Mana'] += gain;
            bd_Mana[loc(global.race['cataclysm'] ? 'space_red_pylon' : 'city_pylon')] = gain+'v';
        }
        if (global.city['farm']){
            if (global.tech['farm']){
                caps[global.race.species] += global.city.farm.count;
                bd_Citizen[loc('city_farm')] = global.city.farm.count + 'v';
            }
        }
        if (global.city['wharf']){
            let vol = global.tech['world_control'] ? 15 : 10;
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                vol *= 2;
            }
            caps['Crates'] += (global.city.wharf.count * vol);
            bd_Crates[loc('city_wharf')] = (global.city.wharf.count * vol) + 'v';
            caps['Containers'] += (global.city.wharf.count * vol);
            bd_Containers[loc('city_wharf')] = (global.city.wharf.count * vol) + 'v';
        }
        if (global.space['munitions_depot']){
            let vol = 25;
            caps['Crates'] += (global.space.munitions_depot.count * vol);
            bd_Crates[loc('tech_munitions_depot')] = (global.space.munitions_depot.count * vol) + 'v';
            caps['Containers'] += (global.space.munitions_depot.count * vol);
            bd_Containers[loc('tech_munitions_depot')] = (global.space.munitions_depot.count * vol) + 'v';
        }
        if (global.interstellar['cargo_yard']){
            caps['Crates'] += (global.interstellar.cargo_yard.count * 50);
            bd_Crates[loc('interstellar_cargo_yard_title')] = (global.interstellar.cargo_yard.count * 50) + 'v';
            caps['Containers'] += (global.interstellar.cargo_yard.count * 50);
            bd_Containers[loc('interstellar_cargo_yard_title')] = (global.interstellar.cargo_yard.count * 50) + 'v';

            let gain = (global.interstellar.cargo_yard.count * spatialReasoning(200));
            caps['Neutronium'] += gain;
            bd_Neutronium[loc('interstellar_cargo_yard_title')] = gain+'v';

            gain = (global.interstellar.cargo_yard.count * spatialReasoning(150));
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
            if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 1){
                size += 10;
            }
            if (global.tech['world_control']){
                size += 10;
            }
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                size *= 2;
            }
            caps['Crates'] += (global.city['storage_yard'].count * size);
            bd_Crates[loc('city_storage_yard')] = (global.city['storage_yard'].count * size) + 'v';
        }
        if (global.space['garage']){
            let g_vol = global.tech['particles'] >= 4 ? 20 + global.tech['supercollider'] : 20;
            if (global.tech['world_control'] || global.race['cataclysm']){
                g_vol += 10;
            }
            caps['Containers'] += (global.space.garage.count * g_vol);
            bd_Containers[loc('space_red_garage_title')] = (global.space.garage.count * g_vol) + 'v';
            if (global.race['cataclysm']){
                caps['Crates'] += (global.space.garage.count * g_vol);
                bd_Crates[loc('space_red_garage_title')] = (global.space.garage.count * g_vol) + 'v';
            }
        }
        if (global.tech['tp_depot']){
            caps['Containers'] += (global.tech.tp_depot * 50);
            bd_Containers[loc('galaxy_gateway_depot')] = (global.tech.tp_depot * 50) + 'v';
            caps['Crates'] += (global.tech.tp_depot * 50);
            bd_Crates[loc('galaxy_gateway_depot')] = (global.tech.tp_depot * 50) + 'v';
        }
        if (global.city['warehouse']){
            let volume = global.tech['steel_container'] >= 2 ? 20 : 10;
            if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 2){
                volume += 10;
            }
            if (global.tech['world_control']){
                volume += 10;
            }
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                volume *= 2;
            }
            caps['Containers'] += (global.city['warehouse'].count * volume);
            bd_Containers[loc('city_warehouse')] = (global.city['warehouse'].count * volume) + 'v';
        }
        if (global.city['rock_quarry']){
            let gain = BHStorageMulti(global.city.rock_quarry.count * spatialReasoning(100));
            caps['Stone'] += gain;
            bd_Stone[loc('city_rock_quarry')] = gain+'v';

            caps['Chrysotile'] += gain;
            bd_Chrysotile[loc('city_rock_quarry')] = gain+'v';
        }
        if (global.city['lumber_yard']){
            let gain = BHStorageMulti(global.city.lumber_yard.count * spatialReasoning(100));
            caps['Lumber'] += gain;
            bd_Lumber[loc('city_lumber_yard')] = gain+'v';
        }
        else if (global.city['graveyard']){
            let gain = BHStorageMulti(global.city.graveyard.count * spatialReasoning(100));
            caps['Lumber'] += gain;
            bd_Lumber[loc('city_graveyard')] = gain+'v';
        }
        if (global.city['sawmill']){
            let gain = BHStorageMulti(global.city.sawmill.count * spatialReasoning(200));
            caps['Lumber'] += gain;
            bd_Lumber[loc('city_sawmill')] = gain+'v';
        }
        if (global.city['mine']){
            lCaps['miner'] += global.city.mine.count;
        }
        if (global.city['coal_mine']){
            lCaps['coal_miner'] += global.city.coal_mine.count;
        }
        if (global.city['bank']){
            lCaps['banker'] += global.city.bank.count;
        }
        if (global.city['amphitheatre']){
            let athVal = govActive('athleticism',1);
            lCaps['entertainer'] += athVal ? (global.city.amphitheatre.count * athVal) : global.city.amphitheatre.count;
        }
        if (global.city['casino']){
            lCaps['entertainer'] += global.city.casino.count;
        }
        if (global.space['spc_casino']){
            lCaps['entertainer'] += global.space.spc_casino.count;
        }
        if (global.galaxy['resort']){
            lCaps['entertainer'] += p_on['resort'] * 2;
        }
        if (global.city['cement_plant']){
            lCaps['cement_worker'] += global.city.cement_plant.count * 2;
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
                        messageQueue(loc('civics_garrison_autodeoccupy_desc',[govTitle(i)]),'danger',false,['spy']);
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
        if (global.race['calm'] && global.city['meditation']) {
            caps['Zen'] = global.city.meditation.count * traits.calm.vars()[0];
            bd_Zen[loc('city_meditation')] = global.city.meditation.count * traits.calm.vars()[0] + 'v';
            global.resource.Zen.amount = (global.resource[global.race.species].amount * 2) + global.civic.garrison.workers;
            if (global.resource.Zen.amount > global.resource.Zen.max){
                global.resource.Zen.amount = global.resource.Zen.max;
            }
            let zen = global.resource.Zen.amount / (global.resource.Zen.amount + 5000);
            bd_Zen[loc('trait_calm_desc')] = `+${(zen * 100).toFixed(2)}%`;
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
            let extraVal = govActive('extravagant',2);
            let pop = extraVal ? 5 + extraVal : 5;
            caps[global.race.species] += p_on['apartment'] * pop;
            bd_Citizen[housingLabel('large')] = (p_on['apartment'] * pop)+'v';
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
        if (p_on['arcology']){
            caps[global.race.species] += p_on['arcology'] * 8;
            bd_Citizen[loc('portal_arcology_title')] = (p_on['arcology'] * 8)+'v';
            lCaps['garrison'] += p_on['arcology'] * 5;

            caps['Containers'] += (p_on['arcology'] * Math.round(quantum_level) * 10);
            bd_Containers[loc('portal_arcology_title')] = (p_on['arcology'] * Math.round(quantum_level) * 10) + 'v';
            caps['Crates'] += (p_on['arcology'] * Math.round(quantum_level) * 10);
            bd_Crates[loc('portal_arcology_title')] = (p_on['arcology'] * Math.round(quantum_level) * 10) + 'v';

            let sup = hellSupression('ruins');
            let money = (p_on['arcology'] * spatialReasoning(bank_vault() * 8 * sup.supress));
            caps['Money'] += money;
            bd_Money[loc('portal_arcology_title')] = money+'v';
        }
        if (p_on['operating_base']){
            lCaps['garrison'] += Math.min(support_on['operating_base'],p_on['operating_base']) * 4;
        }
        if (p_on['fob']){
            lCaps['garrison'] += 10;
        }
        if (global.space['living_quarters']){
            let base = global.race['cataclysm'] ? 2 : 1;
            if (support_on['biodome']){
                let pop = global.tech.mars >= 6 ? 0.1 : 0.05;
                base += pop * support_on['biodome'];
            }
            let gain = Math.round(support_on['living_quarters'] * base);
            caps[global.race.species] += gain;
            lCaps['colonist'] += support_on['living_quarters'];
            bd_Citizen[`${races[global.race.species].solar.red}`] = gain + 'v';

            if (global.race['cataclysm'] && global.tech['home_safe']){
                let gain = (support_on['living_quarters']  * spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 100000 : 50000) : 25000));
                caps['Money'] += gain;
                bd_Money[loc('space_red_living_quarters_title')] = gain+'v';
            }
        }
        if (support_on['biodome'] && global.race['artifical']){
            let gain = support_on['biodome'] * spatialReasoning(500);
            caps['Food'] += gain;
            bd_Food[loc('space_red_signal_tower_title')] = gain+'v';
        }
        if (global.space['titan_quarters']){
            let base = 1;
            let gain = Math.round(support_on['titan_quarters'] * base);
            caps[global.race.species] += gain;
            lCaps['titan_colonist'] += support_on['titan_quarters'];
            bd_Citizen[`${genusVars[races[global.race.species].type].solar.titan}`] = gain + 'v';
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

            gain = (global.city['shed'].count * (spatialReasoning(300 * multiplier)));
            caps['Chrysotile'] += gain;
            bd_Chrysotile[label] = gain+'v';

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

            if (global.tech['shelving'] && global.tech.shelving >= 3 && global.resource.Graphene.display){
                gain = (global.city['shed'].count * (spatialReasoning(15 * multiplier)));
                caps['Graphene'] += gain;
                bd_Graphene[label] = gain+'v';
            }

            if (global.tech['shelving'] && global.tech.shelving >= 3 && global.resource.Stanene.display){
                gain = (global.city['shed'].count * (spatialReasoning(25 * multiplier)));
                caps['Stanene'] += gain;
                bd_Stanene[label] = gain+'v';
            }
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

            gain = (global.interstellar['warehouse'].count * (spatialReasoning(750 * multiplier)));
            caps['Chrysotile'] += gain;
            bd_Chrysotile[label] = gain+'v';

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

        if (global.space['storehouse']){
            var multiplier = storehouseMultiplier(false);
            var h_multiplier = storehouseMultiplier(true);
            let gain = 0;
            let label = loc('space_storehouse_title');
            gain = (global.space.storehouse.count * (spatialReasoning(3000 * multiplier)));
            caps['Lumber'] += gain;
            bd_Lumber[label] = gain+'v';

            gain = (global.space.storehouse.count * (spatialReasoning(3000 * multiplier)));
            caps['Stone'] += gain;
            bd_Stone[label] = gain+'v';

            gain = (global.space.storehouse.count * (spatialReasoning(3000 * multiplier)));
            caps['Chrysotile'] += gain;
            bd_Chrysotile[label] = gain+'v';

            gain = (global.space.storehouse.count * (spatialReasoning(1700 * multiplier)));
            caps['Furs'] += gain;
            bd_Furs[label] = gain+'v';

            gain = (global.space.storehouse.count * (spatialReasoning(1520 * h_multiplier)));
            caps['Copper'] += gain;
            bd_Copper[label] = gain+'v';

            gain = (global.space.storehouse.count * (spatialReasoning(1400 * h_multiplier)));
            caps['Iron'] += gain;
            bd_Iron[label] = gain+'v';

            gain = (global.space.storehouse.count * (spatialReasoning(1280 * multiplier)));
            caps['Aluminium'] += gain;
            bd_Aluminium[label] = gain+'v';

            gain = (global.space.storehouse.count * (spatialReasoning(1120 * multiplier)));
            caps['Cement'] += gain;
            bd_Cement[label] = gain+'v';

            gain = (global.space.storehouse.count * (spatialReasoning(480 * multiplier)));
            caps['Coal'] += gain;
            bd_Coal[label] = gain+'v';

            gain = (global.space.storehouse.count * (spatialReasoning(240 * h_multiplier)));
            caps['Steel'] += gain;
            bd_Steel[label] = gain+'v';

            gain = (global.space.storehouse.count * (spatialReasoning(160 * h_multiplier)));
            caps['Titanium'] += gain;
            bd_Titanium[label] = gain+'v';

            gain = (global.space.storehouse.count * (spatialReasoning(180 * multiplier)));
            caps['Alloy'] += gain;
            bd_Alloy[label] = gain+'v';

            gain = (global.space.storehouse.count * (spatialReasoning(150 * multiplier)));
            caps['Polymer'] += gain;
            bd_Polymer[label] = gain+'v';

            gain = (global.space.storehouse.count * (spatialReasoning(175 * h_multiplier)));
            caps['Iridium'] += gain;
            bd_Iridium[label] = gain+'v';

            if (global.resource.Nano_Tube.display){
                gain = (global.space.storehouse.count * (spatialReasoning(120 * multiplier)));
                caps['Nano_Tube'] += gain;
                bd_Nano_Tube[label] = gain+'v';
            }

            if (global.resource.Neutronium.display){
                gain = (global.space.storehouse.count * (spatialReasoning(64 * h_multiplier)));
                caps['Neutronium'] += gain;
                bd_Neutronium[label] = gain+'v';
            }

            if (global.resource.Adamantite.display){
                gain = (global.space.storehouse.count * (spatialReasoning(72 * h_multiplier)));
                caps['Adamantite'] += gain;
                bd_Adamantite[label] = gain+'v';
            }
        }

        if (global.galaxy['gateway_depot']){
            let containers = global.tech['world_control'] ? 150 : 100;
            caps['Crates'] += (global.galaxy.gateway_depot.count * containers);
            bd_Crates[loc('galaxy_gateway_depot')] = (global.galaxy.gateway_depot.count * containers) + 'v';
            caps['Containers'] += (global.galaxy.gateway_depot.count * containers);
            bd_Containers[loc('galaxy_gateway_depot')] = (global.galaxy.gateway_depot.count * containers) + 'v';

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
            if (global.tech['shelving'] && global.tech.shelving >= 3){ multiplier *= 1.5; }
            multiplier *= global.stats.achieve['blackhole'] ? 1 + (global.stats.achieve.blackhole.l * 0.05) : 1;
            let h_multiplier = global.tech['shelving'] && global.tech.shelving >= 2 ? multiplier * 3 : multiplier;

            let gain = (global.space.garage.count * (spatialReasoning(6500 * h_multiplier)));
            caps['Copper'] += gain;
            bd_Copper[loc('space_red_garage_title')] = gain+'v';

            gain = (global.space.garage.count * (spatialReasoning(5500 * h_multiplier)));
            caps['Iron'] += gain;
            bd_Iron[loc('space_red_garage_title')] = gain+'v';

            gain = (global.space.garage.count * (spatialReasoning((global.race.cataclysm ? 10500 : 6000) * multiplier)));
            caps['Cement'] += gain;
            bd_Cement[loc('space_red_garage_title')] = gain+'v';

            gain = (global.space.garage.count * (spatialReasoning(4500 * h_multiplier)));
            caps['Steel'] += gain;
            bd_Steel[loc('space_red_garage_title')] = gain+'v';

            gain = (global.space.garage.count * (spatialReasoning(3500 * h_multiplier)));
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
                gain = (global.space.garage.count * (spatialReasoning(125 * h_multiplier)));
                caps['Neutronium'] += gain;
                bd_Neutronium[loc('space_red_garage_title')] = gain+'v';
            }

            if (global.resource.Infernite.display){
                gain = (global.space.garage.count * (spatialReasoning(75 * h_multiplier)));
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

                gain = (global.space.garage.count * (spatialReasoning(7500 * multiplier)));
                caps['Lumber'] += gain;
                bd_Lumber[loc('space_red_garage_title')] = gain+'v';

                gain = (global.space.garage.count * (spatialReasoning(7500 * multiplier)));
                caps['Chrysotile'] += gain;
                bd_Chrysotile[loc('space_red_garage_title')] = gain+'v';

                gain = (global.space.garage.count * (spatialReasoning(7500 * multiplier)));
                caps['Stone'] += gain;
                bd_Stone[loc('space_red_garage_title')] = gain+'v';

                gain = (global.space.garage.count * (spatialReasoning(2200 * multiplier)));
                caps['Furs'] += gain;
                bd_Furs[loc('space_red_garage_title')] = gain+'v';
            }
        }

        if (global.portal['harbour'] && p_on['harbour']){
            let gain = (p_on['harbour'] * (spatialReasoning(30000)));
            caps['Oil'] += gain;
            bd_Oil[loc('portal_harbour_title')] = gain+'v';

            gain = (p_on['harbour'] * (spatialReasoning(250000)));
            caps['Alloy'] += gain;
            bd_Alloy[loc('portal_harbour_title')] = gain+'v';

            gain = (p_on['harbour'] * (spatialReasoning(250000)));
            caps['Polymer'] += gain;
            bd_Polymer[loc('portal_harbour_title')] = gain+'v';

            gain = (p_on['harbour'] * (spatialReasoning(200000)));
            caps['Iridium'] += gain;
            bd_Iridium[loc('portal_harbour_title')] = gain+'v';

            gain = (p_on['harbour'] * (spatialReasoning(18000)));
            caps['Helium_3'] += gain;
            bd_Helium[loc('portal_harbour_title')] = gain+'v';

            gain = (p_on['harbour'] * (spatialReasoning(12000)));
            caps['Deuterium'] += gain;
            bd_Deuterium[loc('portal_harbour_title')] = gain+'v';

            gain = (p_on['harbour'] * (spatialReasoning(180000)));
            caps['Neutronium'] += gain;
            bd_Neutronium[loc('portal_harbour_title')] = gain+'v';

            gain = (p_on['harbour'] * (spatialReasoning(150000)));
            caps['Adamantite'] += gain;
            bd_Adamantite[loc('portal_harbour_title')] = gain+'v';

            gain = (p_on['harbour'] * (spatialReasoning(75000)));
            caps['Infernite'] += gain;
            bd_Infernite[loc('portal_harbour_title')] = gain+'v';

            gain = (p_on['harbour'] * (spatialReasoning(750000)));
            caps['Nano_Tube'] += gain;
            bd_Nano_Tube[loc('portal_harbour_title')] = gain+'v';

            gain = (p_on['harbour'] * (spatialReasoning(1200000)));
            caps['Graphene'] += gain;
            bd_Graphene[loc('portal_harbour_title')] = gain+'v';

            gain = (p_on['harbour'] * (spatialReasoning(1200000)));
            caps['Stanene'] += gain;
            bd_Stanene[loc('portal_harbour_title')] = gain+'v';

            gain = (p_on['harbour'] * (spatialReasoning(130000)));
            caps['Bolognium'] += gain;
            bd_Bolognium[loc('portal_harbour_title')] = gain+'v';

            gain = (p_on['harbour'] * (spatialReasoning(130000)));
            caps['Orichalcum'] += gain;
            bd_Orichalcum[loc('portal_harbour_title')] = gain+'v';
        }

        if (global.city['silo']){
            let gain = BHStorageMulti(global.city['silo'].count * spatialReasoning(500));
            caps['Food'] += gain;
            bd_Food[loc('city_silo')] = gain+'v';
        }
        if (global.city['compost']){
            let gain = BHStorageMulti(global.city['compost'].count * spatialReasoning(200));
            caps['Food'] += gain;
            bd_Food[loc('city_compost_heap')] = gain+'v';
        }
        if (global.city['soul_well']){
            let gain = BHStorageMulti(global.city['soul_well'].count * spatialReasoning(500));
            caps['Food'] += gain;
            bd_Food[loc('city_soul_well')] = gain+'v';
        }
        if (global.city['smokehouse']){
            let gain = BHStorageMulti(global.city['smokehouse'].count * spatialReasoning(100));
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
        if (shrineBonusActive()){
            let getShrineResult = getShrineBonus('know');
            caps['Knowledge'] += getShrineResult.add;
            bd_Knowledge[loc('city_shrine')] = getShrineResult.add+'v';
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
                multiplier += (support_on['observatory'] * 0.05);
            }
            if (global.portal['sensor_drone'] && global.tech['science'] >= 14){
                multiplier += (p_on['sensor_drone'] * 0.02);
            }
            if (global.race['hard_of_hearing']){
                multiplier *= 1 - (traits.hard_of_hearing.vars()[0] / 100);
            }
            if (global.race['curious']){
                multiplier *= 1 + (traits.curious.vars()[0] / 100 * global.resource[global.race.species].amount);
            }
            if (p_on['s_gate'] && gal_on['scavenger']){
                let uni = gal_on['scavenger'] * pirate_alien2 / 4;
                multiplier *= 1 + uni;
            }
            let teachVal = govActive('teacher',0);
            if (teachVal){
                multiplier *= 1 + (teachVal / 100);
            }
            let athVal = govActive('athleticism',2);
            if (athVal){
                multiplier *= 1 - (athVal / 100);
            }
            if (shrineBonusActive()){
                let shrineBonus = getShrineBonus('know');
                multiplier *= shrineBonus.mult;
            }
            let gain = (global.city.university.count * base * multiplier);
            lCaps['professor'] += global.city.university.count;
            if (global.tech['supercollider']){
                let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech.particles >= 3) ? 12.5: 25;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('city_university')] = gain+'v';
        }
        if (global.city['library']){
            let shelving = 125;
            if (global.race['nearsighted']){
                shelving *= 1 - (traits.nearsighted.vars()[0] / 100);
            }
            if (global.race['studious']){
                shelving *= 1 + (traits.studious.vars()[1] / 100);
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
            let teachVal = govActive('teacher',0);
            if (teachVal){
                shelving *= 1 + (teachVal / 100);
            }
            let athVal = govActive('athleticism',2);
            if (athVal){
                shelving *= 1 - (athVal / 100);
            }
            let muckVal = govActive('muckraker',1);
            if (muckVal){
                shelving *= 1 + (muckVal / 100);
            }
            let gain = Math.round(global.city.library.count * shelving);
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('city_library')] = gain+'v';
            if (global.tech['science'] && global.tech['science'] >= 3){
                global.civic.professor.impact = 0.5 + (global.city.library.count * 0.01)
            }
        }
        if (global.city['wardenclyffe']){
            let gain_base = 1000;
            if (global.city.ptrait === 'magnetic'){
                gain_base += planetTraits.magnetic.vars()[1];
            }
            let gain = global.city['wardenclyffe'].count * gain_base;
            lCaps['scientist'] += global.city['wardenclyffe'].count;
            let powered_gain = global.tech['science'] >= 7 ? 1500 : 1000;
            gain += (p_on['wardenclyffe'] * powered_gain);
            if (global.tech['supercollider']){
                let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 12.5: 25;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            if (global.space['satellite']){
                gain *= 1 + (global.space.satellite.count * 0.04);
            }
            let athVal = govActive('athleticism',2);
            if (athVal){
                gain *= 1 - (athVal / 100);
            }
            caps['Knowledge'] += gain;
            bd_Knowledge[wardenLabel()] = gain+'v';

            if (global.race.universe === 'magic'){
                let mana = global.city.wardenclyffe.count * spatialReasoning(8);
                caps['Mana'] += mana;
                bd_Mana[wardenLabel()] = mana+'v';
            }

            if (global.race['artifical']){
                let gain = p_on['wardenclyffe'] * spatialReasoning(250);
                caps['Food'] += gain;
                bd_Food[wardenLabel()] = gain+'v';
            }
        }
        if (global.race['logical']){
            let factor = global.tech.hasOwnProperty('high_tech') ? global.tech.high_tech : 0;
            factor += global.tech.hasOwnProperty('science') ? global.tech.science : 0;
            let gain = global.resource[global.race.species].amount * traits.logical.vars()[1] * factor;
            caps['Knowledge'] += gain;
            bd_Knowledge[races[global.race.species].name] = gain+'v';
        }
        if (global.portal['sensor_drone']){
            let gain = p_on['sensor_drone'] * (global.tech.infernite >= 6 ? 2500 : 1000);
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('portal_sensor_drone_title')] = gain+'v';
        }
        if (global.space['satellite']){
            let gain = (global.space.satellite.count * (global.race['cataclysm'] ? 2000 : 750));
            if (global.race['cataclysm'] && global.tech['supercollider']){
                let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 5: 10;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('space_home_satellite_title')] = gain+'v';
        }
        if (global.space['observatory'] && global.space.observatory.count > 0){
            let gain = (support_on['observatory'] * 5000);
            if (global.race['cataclysm'] && global.space['satellite'] && global.space.satellite.count > 0){
                gain *= 1 + (global.space.satellite.count * 0.25);
            }

            caps['Knowledge'] += gain;
            bd_Knowledge[loc('space_moon_observatory_title')] = gain+'v';

            if (global.race['cataclysm']){
                lCaps['professor'] += support_on['observatory'];
            }
        }
        if (global.interstellar['laboratory'] && int_on['laboratory'] > 0){
            if (global.tech.science >= 16){
                lCaps['scientist'] += int_on['laboratory'];
            }
            let gain = (int_on['laboratory'] * 10000);
            if (global.tech.science >= 15){
                gain *= 1 + ((global.race['cataclysm'] ? support_on['exotic_lab'] : global.city.wardenclyffe.count) * 0.02);
            }
            if (global.race['cataclysm'] && p_on['s_gate'] && gal_on['scavenger']){
                gain *= 1 + (gal_on['scavenger'] * piracy('gxy_alien2') * 0.75);
            }
            if (global.tech['science'] >= 21){
                gain *= 1.45;
            }
            caps['Knowledge'] += gain;
            bd_Knowledge[loc(global.race.universe === 'magic' ? 'tech_sanctum' : 'interstellar_laboratory_title')] = gain+'v';

            if (global.race.universe === 'magic'){
                let mana = int_on['laboratory'] * spatialReasoning(12);
                caps['Mana'] += mana;
                bd_Mana[loc(global.race.universe === 'magic' ? 'tech_sanctum' : 'interstellar_laboratory_title')] = mana+'v';
            }
        }
        if (global.city['biolab']){
            let gain = 3000;
            if (global.portal['sensor_drone'] && global.tech['science'] >= 14){
                gain *= 1 + (p_on['sensor_drone'] * 0.02);
            }
            if (global.tech['science'] >= 20){
                gain *= 3;
            }
            if (global.tech['science'] >= 21){
                gain *= 1.45;
            }
            if (global.tech['biotech'] >= 1){
                gain *= 2.5;
            }
            caps['Knowledge'] += (p_on['biolab'] * gain);
            bd_Knowledge[loc('city_biolab')] = (p_on['biolab'] * gain)+'v';
        }
        if (global.space['zero_g_lab'] && Math.min(support_on['zero_g_lab'],p_on['zero_g_lab']) > 0){
            let using = Math.min(support_on['zero_g_lab'],p_on['zero_g_lab']);
            let synd = syndicate('spc_enceladus');
            let gain = Math.round(using * 10000 * synd);
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('tech_zero_g_lab')] = gain+'v';

            if (global.resource.Cipher.display){
                let cipher = 10000 * using;
                caps['Cipher'] += cipher;
                bd_Cipher[loc('tech_zero_g_lab')] = cipher+'v';
            }
        }

        if (global.portal['archaeology']){
            let sup = hellSupression('ruins');
            let gain = Math.round(250000 * sup.supress);
            caps['Knowledge'] += (global.civic.archaeologist.workers * gain);
            bd_Knowledge[loc('portal_archaeology_bd')] = (global.civic.archaeologist.workers * gain)+'v';
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
                if (global.race['inflation']){
                    g_vault *= 2;
                }
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

        if (global.space['titan_bank']){
            let vault = bank_vault() * 2;
            let banks = global.space.titan_bank.count;
            let gain = (banks * spatialReasoning(vault));
            caps['Money'] += gain;
            bd_Money[`${genusVars[races[global.race.species].type].solar.titan} ${loc('city_bank')}`] = gain+'v';
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
            if (global.tech['gambling'] >= 5){
                casino_capacity += global.tech['gambling'] >= 6 ? 240000 : 60000;
            }
            let vault = casinos * spatialReasoning(casino_capacity);
            if (global.race['gambler']){
                vault *= 1 + (traits.gambler.vars()[0] * global.race['gambler'] / 100);
            }
            if (global.tech['world_control']){
                vault = Math.round(vault * 1.25);
            }
            if (global.tech['stock_exchange'] && global.tech['gambling'] >= 4){
                vault *= 1 + (global.tech['stock_exchange'] * 0.05);
            }
            if (global.race['inflation']){
                vault *= 1 + (global.race.inflation / 100);
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
        if (support_on['exotic_lab']){
            let el_gain = support_on['exotic_lab'] * spatialReasoning(10);
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
            if (global.race['cataclysm'] && support_on['observatory']){
                sci *= 1 + (support_on['observatory'] * 0.25);
            }
            if (global.race['cataclysm'] && global.portal['sensor_drone'] && global.tech['science'] >= 14){
                sci *= 1 + (p_on['sensor_drone'] * 0.02);
            }
            if (global.tech['science'] >= 21){
                sci *= 1.45;
            }
            let gain = support_on['exotic_lab'] * global.civic.colonist.workers * sci;
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('tech_exotic_bd')] = gain+'v';

            if (global.race['cataclysm']){
                lCaps['scientist'] += support_on['exotic_lab'];
            }
        }
        if (support_on['decoder']){
            let titan_colonists = p_on['ai_colonist'] ? global.civic.titan_colonist.workers + p_on['ai_colonist'] : global.civic.titan_colonist.workers;
            let gain = support_on['decoder'] * titan_colonists * 2500;
            if (p_on['ai_core2']){
                gain *= 1.25;
            }
            caps['Knowledge'] += gain;
            bd_Knowledge[loc('space_decoder_title')] = gain+'v';
        }
        if (p_on['elerium_contain']){
            let el_gain = p_on['elerium_contain'] * spatialReasoning(100);
            caps['Elerium'] += el_gain;
            bd_Elerium[loc('space_dwarf_elerium_contain_title')] = el_gain+'v';
        }
        if (global.city['foundry']){
            lCaps['craftsman'] += global.city['foundry'].count;
        }
        if (support_on['fabrication']){
            lCaps['craftsman'] += support_on['fabrication'];
            if (global.race['cataclysm']){
                lCaps['cement_worker'] += support_on['fabrication'];
            }
        }
        if (p_on['stellar_forge']){
            lCaps['craftsman'] += p_on['stellar_forge'] * 2;
        }
        if (global.portal['carport']){
            lCaps['hell_surveyor'] += global.portal.carport.count - global.portal.carport.damaged;
        }
        if (p_on['archaeology']){
            lCaps['archaeologist'] += p_on['archaeology'] * 2;
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
        breakdown['t_route'] = {};
        global.city.market.mtrade = 0;
        if (global.race['banana']){
            global.city.market.mtrade++;
            breakdown.t_route[loc('base')] = 1;
        }
        if (global.city['trade']){
            let routes = global.race['nomadic'] || global.race['xenophobic'] ? global.tech.trade : global.tech.trade + 1;
            if (global.tech['trade'] && global.tech['trade'] >= 3){
                routes--;
            }
            global.city.market.mtrade += routes * global.city.trade.count;
            breakdown.t_route[loc('city_trade')] = routes * global.city.trade.count;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 3){
                let r_count = global.race['cataclysm'] ? global.space.ziggurat.count : global.city.temple.count;
                global.city.market.mtrade += r_count;
                breakdown.t_route[global.race['cataclysm'] ? loc('space_red_ziggurat_title') : loc('city_temple')] = r_count;
            }
        }
        if (global.city['wharf']){
            let r_count = global.city.wharf.count * 2;
            global.city.market.mtrade += r_count;
            breakdown.t_route[loc('city_wharf')] = r_count;
        }
        if (global.space['gps'] && global.space.gps.count >= 4){
            let r_count = global.space.gps.count * 2;
            global.city.market.mtrade += global.space.gps.count * 2;
            breakdown.t_route[loc('space_home_gps_title')] = r_count;
        }
        if (global.city['storage_yard'] && global.tech['trade'] && global.tech['trade'] >= 3){
            let r_count = global.city.storage_yard.count;
            global.city.market.mtrade += r_count;
            breakdown.t_route[loc('city_storage_yard')] = r_count;
        }
        if (global.tech['railway']){
            let routes = 0;
            if (global.race['cataclysm']){
                routes = global.space['gps'] ? Math.floor(global.space.gps.count / 3) : 0;
            }
            else {
                routes = global.city['storage_yard'] ? Math.floor(global.city.storage_yard.count / 6) : 0;
            }
            if (global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 2){
                routes++;
            }
            global.city.market.mtrade += global.tech['railway'] * routes;
            breakdown.t_route[loc('arpa_projects_railway_title')] = global.tech['railway'] * routes;
        }
        if (p_on['titan_spaceport']){
            let water = p_on['titan_spaceport'] * spatialReasoning(250);
            caps['Water'] += water;
            bd_Water[loc('space_red_spaceport_title')] = water+'v';
        }
        breakdown['gt_route'] = {};
        if (global.galaxy['freighter']){
            breakdown.gt_route[loc('galaxy_freighter')] = gal_on['freighter'] * 2;
        }
        if (global.galaxy['super_freighter']){
            breakdown.gt_route[loc('galaxy_super_freighter')] = gal_on['super_freighter'] * 5;
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
        if (global.portal['transport']){
            lCaps['crew'] += global.portal.transport.on * actions.portal.prtl_lake.transport.ship.civ;
        }

        ['inspired','distracted','stimulated'].forEach(function(t){
            if (global.race[t]){
                global.race[t]--;
                if (global.race[t] <= 0){
                    delete global.race[t];
                }
            }
        });

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
            Zen: bd_Zen,
            Crates: bd_Crates,
            Containers: bd_Containers,
            Food: bd_Food,
            Lumber: bd_Lumber,
            Stone: bd_Stone,
            Chrysotile: bd_Chrysotile,
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
            Water: bd_Water,
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
            Nanite: bd_Nanite,
            Cipher: bd_Cipher
        };

        let tempCrates = caps['Crates'], tempContainers = caps['Containers'];
        Object.keys(caps).forEach(function (res){
            caps['Crates'] -= global.resource[res].crates;
        });
        Object.keys(caps).forEach(function (res){
            caps['Containers'] -= global.resource[res].containers;
        });
        if (caps['Crates'] < 0){
            let diff = 0 - caps['Crates'];
            Object.keys(caps).forEach(function (res){
                if (diff > 0){
                    let subAmount = global.resource[res].crates;
                    if (subAmount > diff){
                        subAmount = diff;
                    }
                    caps['Crates'] += subAmount;
                    global.resource[res].crates -= subAmount;
                    diff -= subAmount;
                }
            });
        }
        if (caps['Containers'] < 0){
            let diff = 0 - caps['Containers'];
            Object.keys(caps).forEach(function (res){
                if (diff > 0){
                    let subAmount = global.resource[res].containers;
                    if (subAmount > diff){
                        subAmount = diff;
                    }
                    caps['Containers'] += subAmount;
                    global.resource[res].containers -= subAmount;
                    diff -= subAmount;
                }
            });
        }

        bd_Crates[loc('crates_used')] = (caps['Crates'] - tempCrates) + 'v';
        bd_Containers[loc('crates_used')] = (caps['Containers'] - tempContainers) + 'v';

        let create_value = crateValue();
        let container_value = containerValue();
        Object.keys(caps).forEach(function (res){
            let crate = global.resource[res].crates * create_value;
            caps[res] += crate;
            let container = global.resource[res].containers * container_value;
            caps[res] += container;
            if (breakdown.c[res]){
                breakdown.c[res][loc('resource_Crates_plural')] = crate+'v';
                breakdown.c[res][loc('resource_Containers_plural')] = container+'v';
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

        if (global.portal.hasOwnProperty('transport')){
            let max = 0;
            if (gal_on['transport']){
                max = gal_on['transport'] * 5;
            }
            global.portal.transport.cargo.max = max;
        }

        if (global.portal.hasOwnProperty('purifier')){
            let max = 100;
            let port_value = 10000;
            if (spire_on['base_camp']){
                port_value *= 1 + (spire_on['base_camp'] * 0.4);
            }
            if (spire_on['port']){
                max += spire_on['port'] * port_value;
            }
            global.portal.purifier.sup_max = Math.round(max);
        }

        let espEnd = global.race['truepath'] ? 5 : 3;
        for (let i=0; i<espEnd; i++){
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
                                messageQueue(loc('civics_spy_influence_success',[govTitle(i),covert]),'success',false,['spy']);
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
                                messageQueue(loc('civics_spy_sabotage_success',[govTitle(i),covert]),'success',false,['spy']);
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
                                messageQueue(loc('civics_spy_incite_success',[govTitle(i),covert]),'success',false,['spy']);
                            }
                            break;
                        case 'annex':
                            if (i >= 3){ break; }
                            let drawTechs = !global.tech['gov_fed'] && !checkControlling();
                            global.civic.foreign[`gov${i}`].anx = true;
                            messageQueue(loc('civics_spy_annex_success',[govTitle(i)]),'success',false,['spy']);
                            if (drawTechs){
                                drawTech();
                            }
                            break;
                        case 'purchase':
                            if (i >= 3){ break; }
                            let drawTechsAlt = !global.tech['gov_fed'] && !checkControlling();
                            global.civic.foreign[`gov${i}`].buy = true;
                            messageQueue(loc('civics_spy_purchase_success',[govTitle(i)]),'success',false,['spy']);
                            if (drawTechsAlt){
                                drawTech();
                            }
                            break;
                    }
                }
            }
        }

        if (global.race['banana']){
            let exporting = false;
            let importing = 0;
            Object.keys(global.resource).forEach(function(res){
                if (global.resource[res].hasOwnProperty('trade') && global.resource[res].trade < 0){
                    if (exporting){
                        global.resource[res].trade = 0;
                    }
                    else {
                        exporting = res;
                    }
                }
                if (global.resource[res].hasOwnProperty('trade') && global.resource[res].trade > 0){
                    importing += global.resource[res].trade;
                }
            });
            if (global.resource[exporting] && global.resource[exporting].trade <= -500){
                let affix = universeAffix();
                global.stats.banana.b4[affix] = true;
                if (affix !== 'm' && affix !== 'l'){
                    global.stats.banana.b4.l = true;
                }
                if (importing >= 500){
                    unlockFeat('banana');
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

        let cityList = Object.keys(global.city);
        if (global.race['hooved']){
            cityList.push('horseshoe');
        }
        if (global.tech['slaves'] && global.tech['slaves'] >= 2){
            cityList.push('slave_market');
        }
        cityList.forEach(function (action){
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

        if (global.space['swarm_control']){
            global.space.swarm_control.s_max = global.space.swarm_control.count * actions.space.spc_sun.swarm_control.support();
        }

        if (global.arpa['sequence'] && global.arpa.sequence.on && gene_sequence){
            let labs = global.race['cataclysm'] ? support_on['exotic_lab'] : p_on['biolab'];
            if (labs > 0 && global.city.ptrait === 'toxic'){
                labs += planetTraits.toxic.vars()[0];
            }
            global.arpa.sequence.labs = labs;
            global.arpa.sequence.time -= global.arpa.sequence.boost ? labs * 2 : labs;
            global.arpa.sequence.progress = global.arpa.sequence.max - global.arpa.sequence.time;
            if (global.arpa.sequence.time <= 0){
                global.arpa.sequence.max = 50000 * (1 + (global.race.mutation ** 2));
                if (global.race['adaptable']){
                    let adapt = 1 - (traits.adaptable.vars()[0] / 100);
                    global.arpa.sequence.max = Math.floor(global.arpa.sequence.max * adapt);
                }
                global.arpa.sequence.progress = 0;
                global.arpa.sequence.time = global.arpa.sequence.max;
                if (global.tech['genetics'] === 2){
                    messageQueue(loc('genome',[flib('name')]),'success',false,['progress']);
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
                    arpa('Crispr');
                    messageQueue(loc('gene_therapy',[loc('trait_' + trait + '_name'),gene,plasma,plasmid_type]),'success',false,['progress']);
                }
                arpa('Genetics');
                drawTech();
            }
        }

        if (global.city['foundry']){
            let fworkers = global.civic.craftsman.workers;
            if ((global.race['kindling_kindred'] || global.race['smoldering']) && global.city.foundry['Plywood'] > 0){
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

        if (global.tech['foundry'] === 3 && (global.race['kindling_kindred'] || global.race['smoldering'])){
            global.tech['foundry'] = 4;
        }

        if (global.race['kindling_kindred'] || global.race['smoldering']){
            global.civic.lumberjack.workers = 0;
            global.resource.Lumber.crates = 0;
            global.resource.Lumber.containers = 0;
            global.resource.Lumber.trade = 0;
        }
        if ((global.race['kindling_kindred'] || global.race['smoldering']) && global.city['foundry'] && global.city.foundry['Plywood']){
            global.city.foundry['Plywood'] = 0;
        }

        q_check(false);

        let belt_mining = support_on['iron_ship'] + support_on['iridium_ship'];
        if (belt_mining > 0 && global.tech['asteroid'] && global.tech['asteroid'] === 3){
            if (Math.rand(0,250) <= belt_mining){
                global.tech['asteroid'] = 4;
                global.resource.Elerium.display = true;
                modRes('Elerium',1);
                drawTech();
                messageQueue(loc('discover_elerium'),'info',false,['progress']);
            }
        }

        if (global.tech['asteroid'] && global.tech.asteroid === 4 && global.resource.Elerium.amount === 0){
            modRes('Elerium',1);
        }

        if (p_on['outpost'] > 0 && global.tech['gas_moon'] && global.tech['gas_moon'] === 1){
            if (Math.rand(0,100) <= p_on['outpost']){
                global.space['oil_extractor'] = { count: 0, on: 0 };
                global.tech['gas_moon'] = 2;
                messageQueue(loc('discover_oil',[races[global.race.species].solar.gas_moon]),'info',false,['progress']);
                renderSpace();
            }
        }

        if (global.portal.hasOwnProperty('mechbay') && global.tech['hell_spire'] && global.tech.hell_spire >= 9){
            if (!global.portal.spire['boss']){
                genSpireFloor();
            }
            updateMechbay();

            let progress = 0;
            for (let i = 0; i < global.portal.mechbay.active; i++) {
                let mech = global.portal.mechbay.mechs[i];
                if (global.portal.hasOwnProperty('waygate') && global.tech.hasOwnProperty('waygate') && global.portal.waygate.on === 1 && global.tech.waygate >= 2 && global.portal.waygate.progress < 100){
                    progress += mechRating(mech,true);
                }
                else {
                    progress += mechRating(mech,false);
                }
            }

            if (global.portal.hasOwnProperty('waygate') && global.tech.hasOwnProperty('waygate') && global.portal.waygate.on === 1 && global.tech.waygate >= 2 && global.portal.waygate.progress < 100){
                global.portal.waygate.progress += progress;
                global.portal.waygate.time = progress === 0 ? timeFormat(-1) : timeFormat((100 - global.portal.waygate.progress) / progress);
                global.portal.spire.time = timeFormat(-1);
            }
            else {
                global.portal.spire.progress += progress;
                global.portal.spire.time = progress === 0 ? timeFormat(-1) : timeFormat((100 - global.portal.spire.progress) / progress);
                if (global.tech['waygate'] && global.tech.waygate >= 2){
                    global.portal.waygate.time = timeFormat(-1);
                }
            }
            if (global.portal.hasOwnProperty('waygate') && global.portal.waygate.on === 1 && global.portal.waygate.progress >= 100){
                global.portal.waygate.progress = 100;
                global.portal.waygate.on = 0;
                global.tech.waygate = 3;
                global.resource.Demonic_Essence.display = true;
                global.resource.Demonic_Essence.amount = 1;
                drawTech();
            }
            if (global.portal.spire.progress >= 100){
                global.portal.spire.progress = 0;
                global.resource.Blood_Stone.display = true;
                let rank = Number(alevel());
                let stones = rank;
                if (global.genes['blood'] && global.genes['blood'] >= 2){
                    stones *= 2;
                }
                global.resource.Blood_Stone.amount += stones;
                global.stats.blood += stones;
                arpa('Blood');
                if (!global.tech.hasOwnProperty('b_stone')){
                    global.tech['b_stone'] = 1;
                    drawTech();
                }

                messageQueue(
                    `${loc('portal_spire_conquest',[loc(`portal_mech_boss_${global.portal.spire.boss}`),global.portal.spire.count])} ${loc(stones === 1 ? 'portal_spire_conquest_stone' : 'portal_spire_conquest_stones',[stones])}`
                ,'info',false,['progress','hell']);

                global.portal.spire.count++;
                if (global.portal.spire.count > 10){
                    global.tech['hell_spire'] = 10;
                    drawTech();
                }

                let affix = universeAffix();
                if (!global.stats.spire.hasOwnProperty(affix)){
                    global.stats.spire[affix] = { s0: 0, s1: 0, s2: 0, s3: 0, s4: 0 };
                }
                if (global.portal.spire.count > global.stats.spire[affix][`s${rank-1}`]){
                    global.stats.spire[affix][`s${rank-1}`] = global.portal.spire.count;
                }
                if (!global.stats.spire[affix].hasOwnProperty(global.portal.spire.boss) || rank > global.stats.spire[affix][global.portal.spire.boss]){
                    global.stats.spire[affix][global.portal.spire.boss] = rank;
                }

                genSpireFloor();
                renderFortress();
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

            if ($(`#popper[data-id="city-s_alter"]`).length > 0){
                updateDesc(actions.city.s_alter,'city','s_alter');
            }
        }

        if (global.race['casting']){
            let total = 0;
            ['farmer','miner','lumberjack','science','factory','army','hunting','crafting'].forEach(function (spell){
                if (global.race.casting[spell]){
                    total += global.race.casting[spell];
                }
            });
            global.race.casting.total = total;
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
                time = global.settings.qAny_res ? 0 : time;

                if (t_action['grant'] && global.tech[t_action.grant[0]] && global.tech[t_action.grant[0]] >= t_action.grant[1]){
                    global.r_queue.queue.splice(i,1);
                    clearPopper(`rq${c_action.id}`);
                    break;
                }
                else {
                    if (checkAffordable(t_action,true)){
                        global.r_queue.queue[i].cna = false;
                        let t_time = global.settings.qAny_res ? timeCheck(t_action) : timeCheck(t_action, spent);
                        if (t_time >= 0){
                            if (checkAffordable(t_action) && !stop){
                                c_action = t_action;
                                idx = i;
                            }
                            else {
                                time += t_time;
                            }
                            global.r_queue.queue[i]['time'] = time;
                            stop = global.settings.qAny_res ? false : true;
                        }
                        else {
                            global.r_queue.queue[i]['time'] = t_time;
                        }
                    }
                    else {
                        global.r_queue.queue[i].cna = true;
                        global.r_queue.queue[i]['time'] = -1;
                    }
                }
                global.r_queue.queue[i].qa = global.settings.qAny_res ? true : false;
            }
            if (idx >= 0 && c_action && !global.r_queue.pause){
                if (c_action.action()){
                    messageQueue(loc('research_success',[global.r_queue.queue[idx].label]),'success',false,['queue','research_queue']);
                    gainTech(global.r_queue.queue[idx].type);
                    if (c_action['post']) {
                        c_action.post();
                    }
                    global.r_queue.queue.splice(idx,1);
                    clearPopper(`rq${c_action.id}`);
                    resQueue();
                }
            }
            if (global.r_queue.queue.length > global.r_queue.max){
                global.r_queue.queue.splice(global.r_queue.max);
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
            if (global.settings.qAny){
                spent = { t: 0, r: {}, id: {}};
                time = 0;
            }
            let struct = global.queue.queue[i];

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

            if (t_action && t_action['no_queue'] && t_action.no_queue() && !t_action['grant'] && !t_action['q_once']){
                clearPopper(`q${t_action.id}${i}`);
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
                        clearPopper(`q${t_action.id}${i}`);
                        global.queue.queue[i].q -= queued[global.queue.queue[i].id] - t_action.queue_complete();
                        if (global.queue.queue[i].q <= 0){
                            global.queue.queue.splice(i,1);
                            buildQueue();
                            break;
                        }
                    }
                }
            }

            if (struct.action === 'arpa'){
                let remain = (100 - global.arpa[global.queue.queue[i].type].complete) / 100;
                let spent_r = spent.r;
                let t_time = arpaTimeCheck(t_action, remain, spent);
                if (t_time >= 0){
                    time += t_time;
                    global.queue.queue[i]['time'] = time;
                    if (global.queue.queue[i].q > 1){
                        for (let j=1; j<global.queue.queue[i].q; j++){
                            time += arpaTimeCheck(t_action, 1, spent);
                        }
                    }
                    global.queue.queue[i]['t_max'] = time;
                    if (global.settings.qAny && !global.queue.pause){
                        if (Math.floor(global.queue.queue[i]['time']) <= 1){
                            if (!stop){
                                c_action = t_action;
                                idx = i;
                                arpa = true;
                            }
                            stop = true;
                        }
                        else {
                            buildArpa(global.queue.queue[i].type,100,true);
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
                else {
                    global.queue.queue[i]['time'] = t_time;
                }
            }
            else if (t_action['grant'] && global.tech[t_action.grant[0]] && global.tech[t_action.grant[0]] >= t_action.grant[1]){
                clearPopper(`q${t_action.id}${i}`);
                global.queue.queue.splice(i,1);
                buildQueue();
                break;
            }
            else {
                if (checkAffordable(t_action,true)){
                    global.queue.queue[i].cna = false;
                    let t_time = timeCheck(t_action, spent);
                    if (t_time >= 0){
                        if (checkAffordable(t_action) && !stop){
                            c_action = t_action;
                            idx = i;
                            arpa = false;
                        }
                        else {
                            time += t_time;
                        }
                        global.queue.queue[i]['time'] = time;
                        stop = global.settings.qAny ? false : true;
                        if (global.queue.queue[i].q > 1){
                            for (let j=1; j<global.queue.queue[i].q; j++){
                                time += timeCheck(t_action, spent);
                            }
                        }
                        global.queue.queue[i]['t_max'] = time;
                    }
                    else {
                        global.queue.queue[i]['time'] = t_time;
                    }
                }
                else {
                    global.queue.queue[i].cna = true;
                    global.queue.queue[i]['time'] = -1;
                }
            }
            global.queue.queue[i].qa = global.settings.qAny ? true : false;
        }
        if (idx >= 0 && c_action && !global.queue.pause){
            if (arpa){
                let label = global.queue.queue[idx].label;
                let id = global.queue.queue[idx].id;
                if (buildArpa(global.queue.queue[idx].type,100,true)){
                    messageQueue(loc('build_success',[label]),'success',false,['queue','building_queue']);
                    if (id !== 'arpalaunch_facility') {
                        if (global.queue.queue[idx].q > 1){
                            global.queue.queue[idx].q--;
                        }
                        else {
                            clearPopper(`q${c_action.id}${idx}`);
                            global.queue.queue.splice(idx,1);
                            buildQueue();
                        }
                    }
                }
            }
            else {
                let attempts = global.queue.queue[idx].q;
                let struct = global.queue.queue[idx];
                let triggerd = false;
                for (var i=0; i<attempts; i++){
                    if (c_action.action()){
                        triggerd = true;
                        if (c_action['queue_complete']){
                            if (c_action.queue_complete() <= 0){
                                messageQueue(loc('build_success',[global.queue.queue[idx].label]),'success',false,['queue','building_queue']);
                            }
                        }
                        else {
                            messageQueue(loc('build_success',[global.queue.queue[idx].label]),'success',false,['queue','building_queue']);
                        }
                        if (global.queue.queue[idx].q > 1){
                            global.queue.queue[idx].q--;
                        }
                        else {
                            clearPopper(`q${c_action.id}${idx}`);
                            global.queue.queue.splice(idx,1);
                            buildQueue();
                        }
                        if (global.race['inflation'] && global.tech['primitive']){
                            if (!c_action.hasOwnProperty('inflation') || c_action.inflation){
                                global.race.inflation++;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
                if (triggerd){
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
                    updateDesc(c_action,struct.action,struct.type);
                    if (c_action['post']){
                        setTimeout(function(){
                            c_action.post();
                        }, 250);
                    }
                }
            }
        }

        let last = false;
        let used_slots = 0;
        let merged_queue = [];
        let update_queue = false;
        for (let i=0; i<global.queue.queue.length; i++){
            used_slots += Math.ceil(global.queue.queue[i].q / global.queue.queue[i].qs);
            if (used_slots > global.queue.max){
                let remaining = (Math.ceil(global.queue.queue[i].q / global.queue.queue[i].qs)) - (used_slots - global.queue.max);
                if (remaining === 0){
                    global.queue.queue.splice(i);
                }
                else {
                    global.queue.queue[i].q = remaining * global.queue.queue[i].qs;
                    global.queue.queue.splice(i+1);
                }
            }

            if (global.settings.q_merge === 'merge_nearby'){
                if (last === global.queue.queue[i].id){
                    clearPopper(`q${global.queue.queue[i].id}${i}`);
                    global.queue.queue[i-1].q += global.queue.queue[i].q;
                    global.queue.queue.splice(i,1);
                    buildQueue();
                    break;
                }
                last = global.queue.queue[i].id;
            }
            else if (global.settings.q_merge === 'merge_all'){
                let found = false;
                for (let k=0; k<merged_queue.length; k++){
                    if (merged_queue[k].id === global.queue.queue[i].id){
                        found = true;
                        update_queue = true;
                        merged_queue[k].q += global.queue.queue[i].q;
                        clearPopper(`q${global.queue.queue[i].id}${i}`);
                        break;
                    }
                }
                if (!found){
                    merged_queue.push(global.queue.queue[i]);
                }
            }
        }
        if (update_queue){
            for (let i=merged_queue.length; i<global.queue.queue.length; i++){
                clearPopper(`q${global.queue.queue[i].id}${i}`);
            }
            global.queue.queue = merged_queue;
            buildQueue();
        }
    }

    resourceAlt();

    $(`.costList`).each(function (){
        $(this).children().each(function (){
            let elm = $(this);
            this.className.split(/\s+/).forEach(function(cls){
                if (cls.startsWith(`res-`)){
                    let res = cls.split(`-`)[1];
                    if (global.resource.hasOwnProperty(res)){
                        let res_val = elm.attr(`data-${res}`);
                        let fail_max = global.resource[res].max >= 0 && res_val > global.resource[res].max ? true : false;
                        let avail = elm.attr(`data-ok`) ? elm.attr(`data-ok`) : 'has-text-dark';
                        if (global.resource[res].amount + global.resource[res].diff < res_val || fail_max){
                            if (elm.hasClass(avail)){
                                elm.removeClass(avail);
                                elm.addClass('has-text-danger');
                            }
                        }
                        else if (elm.hasClass('has-text-danger') || elm.hasClass('has-text-alert')){
                            elm.removeClass('has-text-danger');
                            elm.addClass(avail);
                        }
                    }
                }
            });
        });
    });

    {
        let msgHeight = $(`#msgQueue`).height();
        let buildHeight = $(`#buildQueue`).height();
        let totHeight = $(`.leftColumn`).height();
        let rem = $(`#topBar`).height();
        let min = rem * 5;
        let max = totHeight - (5 * rem);

        if (msgHeight < min) {
            if (buildHeight > min){
                buildHeight -= (min - msgHeight);
            }
            msgHeight = min;
        }
        if (buildHeight < min) {
            buildHeight = min;
        }
        if (msgHeight + buildHeight > max){
            msgHeight -= (msgHeight + buildHeight) - max;
            if (msgHeight < rem) {
                msgHeight = rem;
            }
            if (msgHeight + buildHeight > max){
                buildHeight -= (msgHeight + buildHeight) - max;
                if (buildHeight < rem) {
                    buildHeight = rem;
                }
            }
        }

        if ($(`#msgQueue`).hasClass('right')){
            $(`#resources`).height(`calc(100vh - 5rem)`);
            if ($(`#msgQueue`).hasClass('vscroll')){
                $(`#msgQueue`).removeClass('vscroll');
                $(`#msgQueue`).addClass('sticky');
            }
            msgHeight = `calc(100vh - ${buildHeight}px - 6rem)`;
        }
        else {
            $(`#resources`).height(`calc(100vh - 5rem - ${buildHeight}px - ${msgHeight}px)`);
            if ($(`#msgQueue`).hasClass('sticky')){
                $(`#msgQueue`).removeClass('sticky');
                $(`#msgQueue`).addClass('vscroll');
                msgHeight = 100;
            }
        }

        $(`#msgQueue`).height(msgHeight);
        $(`#buildQueue`).height(buildHeight);
        global.settings.msgQueueHeight = msgHeight;
        global.settings.buildQueueHeight = buildHeight;
    }

    if ($(`#mechList`).length > 0){
        $(`#mechList`).css('height',`calc(100vh - 11.5rem - ${$(`#mechAssembly`).height()}px)`);
    }
    if ($(`#shipList`).length > 0){
        $(`#shipList`).css('height',`calc(100vh - 11.5rem - ${$(`#shipPlans`).height()}px)`);
    }
}

let sythMap = {
    1: 1.1,
    2: 1.25,
    3: 1.5,
};

var kplv = 60;
function longLoop(){
    const date = new Date();
    if (global.race.species !== 'protoplasm'){
        let grids = gridDefs();
        let updatePowerGrid = false;
        Object.keys(grids).forEach(function(grid){
            grids[grid].l.forEach(function(struct){
                let parts = struct.split(":");
                let space = parts[0].substr(0,4) === 'spc_' ? 'space' : (parts[0].substr(0,5) === 'prtl_' ? 'portal' : (parts[0].substr(0,4) === 'gxy_' ? 'galaxy' : 'interstellar'));
                let region = parts[0] === 'city' ? parts[0] : space;
                let c_action = parts[0] === 'city' ? actions.city[parts[1]] : actions[space][parts[0]][parts[1]];
                let breaker = $(`#pg${c_action.id}${grid}`);

                if (grids[grid].s && (breaker.length === 0 || (gridEnabled(c_action,region,parts[0],parts[1]) && breaker.hasClass('inactive')))){
                    updatePowerGrid = true;
                }
            });
        });
        if (updatePowerGrid){
            setPowerGrid();
        }

        if (global.tech['syphon'] && global.tech.syphon >= 80){
            if (webWorker.w){
                webWorker.w.terminate();
            }
            let bang = $('<div class="bigbang"></div>');
            $('body').append(bang);
            setTimeout(function(){
                bang.addClass('burn');
            }, 125);
            setTimeout(function(){
                bang.addClass('b');
            }, 150);
            setTimeout(function(){
                bang.addClass('c');
            }, 2000);
            setTimeout(function(){
                vacuumCollapse();
            }, 4000);
        }

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
            let fluxVal = govActive('risktaker',0) ? 2 : 4;
            Object.keys(resource_values).forEach(function (res) {
                let r_val = global.race['truepath'] ? resource_values[res] * 2 : resource_values[res];
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
                if (global.resource[res].display && Math.rand(0,fluxVal) === 0){
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

        if (global.race['blood_thirst']){
            if (!global.city.morale['blood_thirst']){
                global.city.morale['blood_thirst'] = 0;
            }
            if (!global.race.hasOwnProperty('blood_thirst_count')){
                global.race['blood_thirst_count'] = 1;
            }
            if (global.race.blood_thirst_count > 1){
                global.race.blood_thirst_count--;
            }
        }

        if (global.race['truepath'] && global.civic.foreign.gov3.mil < 500){
            if (Math.rand(0, 50) === 0){
                global.civic.foreign.gov3.mil++;
            }
        }

        // Soldier Healing
        if (global.civic.garrison.wounded > 0){
            let healed = global.race['regenerative'] ? traits.regenerative.vars()[0] : 1;
            let hc = global.city['hospital'] ? global.city.hospital.count : 0;
            if (global.race['artifical'] && global.city['boot_camp']){
                hc = global.city.boot_camp.count;
            }
            if (global.tech['medic'] && global.tech['medic'] >= 2){
                hc *= global.tech['medic'];
            }
            if (global.race['fibroblast']){
                hc += traits.fibroblast.vars()[0] * global.race['fibroblast'];
            }
            if (global.race['cannibalize'] && global.city['s_alter'] && global.city.s_alter.regen > 0){
                hc >= 20 ? hc *= (1 + traits.cannibalize.vars()[0] / 100) : hc += Math.floor(traits.cannibalize.vars()[0] / 5);
            }
            let painVal = govActive('nopain',0);
            if (painVal){
                hc *= 1 + (painVal / 100);
            }

            let max_bound = 20;
            if (global.race['slow_regen']){
                max_bound *= 1 + (traits.slow_regen.vars()[0] / 100);
            }
            hc = Math.round(hc);
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

        if (global.race['rainbow_active'] && global.race['rainbow_active'] > 1){
            global.race['rainbow_active']--;
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
                        global.race['rainbow_active'] = 1;
                    }
                    global.city.calendar.weather = 0;
                }
                else if (sky >= 1 && sky <= 2){
                    if (global.race['rainbow']){
                        global.race['rainbow_active'] = 1;
                    }
                    global.city.calendar.weather = 1;
                }
                else {
                    if (global.race['rainbow'] && global.city.calendar.weather === 0){
                        global.race['rainbow_active'] = Math.rand(10,20);
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
                messageQueue(loc('deterioration1',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 1 && deterioration < 20000000){
                global.race.deterioration = 2;
                let death_clock = Math.round(deterioration / (global.city.calendar.orbit * (1 + global.race.mutation)));
                messageQueue(loc('deterioration2',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 2 && deterioration < 5000000){
                global.race.deterioration = 3;
                let death_clock = Math.round(deterioration / (global.city.calendar.orbit * (1 + global.race.mutation)));
                messageQueue(loc('deterioration3',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 3 && deterioration < 1000000){
                global.race.deterioration = 4;
                let death_clock = Math.round(deterioration / (global.city.calendar.orbit * (1 + global.race.mutation)));
                messageQueue(loc('deterioration4',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 4 && deterioration <= 0){
                global.race.deterioration = 5;
                global.race['decayed'] = global.stats.days;
                global.tech['decay'] = 1;
                messageQueue(loc('deterioration5',[flib('name')]),'danger',false,['progress']);
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
            if (global.tech['decay'] >= 3){
                fortify *= 100;
            }
            global.race.gene_fortify = fortify;
        }
        else {
            global.race.gene_fortify = 0;
        }

        if (!global.tech['genesis'] && global.race.deterioration >= 1 && global.tech['high_tech'] && global.tech['high_tech'] >= 10){
            global.tech['genesis'] = 1;
            messageQueue(loc('genesis'),'special',false,['progress']);
            drawTech();
        }

        if (global.settings['cLabels'] && $('#city-dist-outskirts').length === 0){
            drawCity();
        }
        if (!global.settings['cLabels'] && $('#city-dist-outskirts').length > 0){
            drawCity();
        }

        if (global.tech['xeno'] && global.tech['xeno'] >= 5 && !global.tech['piracy']){
            if (Math.rand(0,5) === 0){
                global.tech['piracy'] = 1;
                messageQueue(loc('galaxy_piracy_msg',[races[global.galaxy.alien2.id].name]),'info',false,['progress']);
                renderSpace();
            }
        }

        if (global.race['cheese']){
            global.race.cheese--;
            if (global.race.cheese <= 0){
                delete global.race.cheese;
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

        if (global.tech['syndicate'] && global.race['truepath']){
            let regions = spaceTech();
            Object.keys(regions).forEach(function(region){
                if (regions[region].info.hasOwnProperty('syndicate') && regions[region].info.syndicate()){
                    let cap = regions[region].info.hasOwnProperty('syndicate_cap') ? regions[region].info.syndicate_cap() : 500;
                    if (!global.space.syndicate.hasOwnProperty(region)){
                        global.space.syndicate[region] = 0;
                    }
                    let reinforce = region === 'spc_triton' ? 5 : 10;
                    if (global.space.syndicate[region] < (cap) && Math.rand(0, reinforce) === 0){
                        global.space.syndicate[region]++;
                    }
                    if (global.space.syndicate[region] > cap){
                        global.space.syndicate[region] = cap;
                    }
                }
            });

            if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                let eScan = 0;
                global.space.shipyard.ships.forEach(function(ship){
                    if (ship.transit > 0 && ship.fueled){
                        ship.transit--;
                        let trip = 1 - (ship.transit / ship.dist);
                        let mx = Math.abs(ship.origin.x - ship.destination.x) * trip;
                        let my = Math.abs(ship.origin.y - ship.destination.y) * trip;
                        if (ship.origin.x <= ship.destination.x){ ship.xy.x = ship.origin.x + mx; } else { ship.xy.x = ship.origin.x - mx; }
                        if (ship.origin.y <= ship.destination.y){ ship.xy.y = ship.origin.y + my; } else { ship.xy.y = ship.origin.y - my; }
                    }
                    if (ship.transit === 0){
                        ship.xy = genXYcoord(ship.location);
                        ship.origin = deepClone(ship.xy);
                        ship.dist = 0;
                    }
                    if (ship.damage > 0 && p_on['shipyard']){
                        ship.damage--;
                    }
                    if (ship.location !== 'spc_dwarf' && Math.rand(0, 10) === 0){
                        let dm = ship.location === 'spc_triton' ? 2 : 1;
                        switch (ship.armor){
                            case 'steel':
                                ship.damage += Math.rand(1, 8 * dm);
                                break;
                            case 'alloy':
                                ship.damage += Math.rand(1, 6 * dm);
                                break;
                            case 'neutronium':
                                ship.damage += Math.rand(1, 4 * dm);
                                break;
                        }
                        if (ship.damage > 90){ ship.damage = 90; }
                    }
                    if (global.tech.hasOwnProperty('eris_scan') && ship.location === 'spc_eris' && ship.transit === 0){
                        eScan += sensorRange(ship.sensor) * 2;
                    }
                });
                if (global.tech.hasOwnProperty('eris_scan') && global.tech.hasOwnProperty('eris') && global.tech.eris === 1 && eScan >= 100){
                    global.tech.eris = 2;
                    messageQueue(loc('space_eris_scan',[genusVars[races[global.race.species].type].solar.eris]),'info',false,['progress']);
                    renderSpace();
                }
                if (global.space.hasOwnProperty('position')){
                    Object.keys(spacePlanetStats).forEach(function(planet){
                        if (global.space.position.hasOwnProperty(planet)){
                            let orbit = spacePlanetStats[planet].orbit === -1 ? global.city.calendar.orbit : spacePlanetStats[planet].orbit;
                            if (orbit === 0){
                                global.space.position[planet] = 0;
                            }
                            else {
                                global.space.position[planet] += +(360 / orbit).toFixed(4);
                                if (global.space.position[planet] >= 360){
                                    global.space.position[planet] -= 360;
                                }
                            }
                        }
                    });
                }
            }

            if (global.tech['triton'] && global.tech.triton >= 3){
                tritonWar();
            }
            if (global.tech['eris'] && global.tech.eris >= 3){
                erisWar();
            }
        }

        if (global.race['infiltrator']){
            let tech_source = global.tech['world_control'] ? `trait_infiltrator_steal_alt` : `trait_infiltrator_steal`;
            let know_adjust = traits.infiltrator.vars()[0] / 100;
            if (global.resource.Knowledge.max >= (4000 * know_adjust) && !global.race['steelen'] && global.tech['smelting'] && global.tech.smelting === 1){
                messageQueue(loc(tech_source,[loc('tech_steel')]),'info',false,['progress']);
                global.resource.Steel.display = true;
                global.tech.smelting = 2;
                defineIndustry();
                drawTech();
            }
            if (global.resource.Knowledge.max >= (10000 * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 1){
                messageQueue(loc(tech_source,[loc('tech_electricity')]),'info',false,['progress']);
                global.tech.high_tech = 2;
                global.city['power'] = 0;
                global.city['powered'] = true;
                global.city['coal_power'] = {
                    count: 0,
                    on: 0
                };
                global.settings.showPowerGrid = true;
                setPowerGrid();
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (40000 * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 3 && global.tech['titanium']){
                messageQueue(loc(tech_source,[loc('tech_electronics')]),'info',false,['progress']);
                global.tech.high_tech = 4;
                if (global.race['terrifying']){
                    global.tech['gambling'] = 1;
                    global.city['casino'] = { count: 0 };
                    global.space['spc_casino'] = { count: 0 };
                }
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (72000 * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 4 && global.tech['uranium']){
                messageQueue(loc(tech_source,[loc('tech_fission')]),'info',false,['progress']);
                global.tech.high_tech = 5;
                global.city['fission_power'] = {
                    count: 0,
                    on: 0
                };
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (105000 * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 6){
                messageQueue(loc(tech_source,[loc('tech_rocketry')]),'info',false,['progress']);
                global.tech.high_tech = 7;
                arpa('Physics');
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (310000 * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 9){
                messageQueue(loc(tech_source,[loc('tech_artificial_intelligence')]),'info',false,['progress']);
                global.tech.high_tech = 10;
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (420000 * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 10 && global.tech['nano']){
                messageQueue(loc(tech_source,[loc('tech_quantum_computing')]),'info',false,['progress']);
                global.tech.high_tech = 11;
                drawTech();
                drawCity();
            }
            if (
                global.resource.Knowledge.max >= (580000 * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 11 && global.tech['stanene']
                    && ((global.tech['infernite'] && global.tech['alpha'] && global.tech['alpha'] >= 2) || (global.race['truepath']))
                ){
                messageQueue(loc(tech_source,[loc('tech_virtual_reality')]),'info',false,['progress']);
                global.tech.high_tech = 12;
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (835000 * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 13){
                messageQueue(loc(tech_source,[loc('tech_shields')]),'info',false,['progress']);
                global.tech.high_tech = 14;
                global.settings.space.neutron = true;
                global.settings.space.blackhole = true;
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (1420000 * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 14 && global.tech['blackhole'] && global.tech['blackhole'] >= 3){
                messageQueue(loc(tech_source,[loc('tech_ai_core')]),'info',false,['progress']);
                global.tech.high_tech = 15;
                global.interstellar['citadel'] = { count: 0, on: 0 };
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (2250000 * know_adjust) && global.tech['ai_core'] && global.tech.ai_core === 2){
                messageQueue(loc(tech_source,[loc('tech_graphene_processing')]),'info',false,['progress']);
                global.tech.ai_core = 3;
                drawTech();
            }
            if (global.resource.Knowledge.max >= (8075000 * know_adjust) && global.tech['science'] && global.tech.science >= 18 && !global.tech['nanoweave']){
                messageQueue(loc(tech_source,[loc('tech_nanoweave')]),'info',false,['progress']);
                global.tech['nanoweave'] = 1;
                global.resource.Nanoweave.display = true;
                drawTech();
                loadFoundry();
            }
            if (global.resource.Knowledge.max >= (11590000 * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 16 && global.tech['chthonian'] && global.tech['chthonian'] >= 3){
                messageQueue(loc(tech_source,[loc('tech_orichalcum_analysis')]),'info',false,['progress']);
                messageQueue(loc('tech_orichalcum_analysis_result'),'info',false,['progress']);
                global.tech.high_tech = 17;
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (24750000 * know_adjust) && global.tech['smelting'] && global.tech.smelting === 7 && global.tech['hell_ruins'] && global.tech['hell_ruins'] >= 4){
                messageQueue(loc(tech_source,[loc('tech_infernium_fuel')]),'info',false,['progress']);
                global.tech.smelting = 8;
                defineIndustry();
                drawTech();
            }
        }

        if (global.civic.govern['protest'] && global.civic.govern.protest > 0){
            global.civic.govern.protest--;
        }
        if (global.civic.govern['scandal'] && global.civic.govern.scandal > 0){
            global.civic.govern.scandal--;
        }

        {
            let tax_cap = govCivics('tax_cap');
            let tax_min = govCivics('tax_cap',true);
            if (global.civic.taxes.tax_rate > tax_cap){
                global.civic.taxes.tax_rate = tax_cap;
            }
            else if (global.civic.taxes.tax_rate < tax_min){
                global.civic.taxes.tax_rate = tax_min;
            }
        }

        if (global.queue.display){
            calcQueueMax();
        }
        if (global.r_queue.display){
            calcRQueueMax();
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
            messageQueue(loc('interstellar_blackhole_unstable'),'danger',false,['progress']);
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
            messageQueue(loc('galaxy_encounter'),'info',false,['progress']);
            drawTech();
        }

        if (global.galaxy['scavenger'] && global.tech['conflict'] && global.tech['conflict'] === 4 && gal_on['scavenger'] > 0 && Math.rand(0, 50) <= gal_on['scavenger']){
            global.tech['conflict'] = 5;
            messageQueue(loc('galaxy_scavenger_find'),'info',false,['progress']);
            drawTech();
        }

        if (!global.tech['syndicate'] && global.tech['outer'] && Math.rand(0, 20) === 0){
            messageQueue(loc('outer_syndicate',[govTitle(4)]),'info',false,['progress']);
            global.tech['syndicate'] = 1;
            global.space['syndicate'] = {};
        }

        if (!global.tech['corrupted_ai'] && p_on['ai_core2'] && calcAIDrift() === 100){
            global.tech['corrupted_ai'] = 1;
            drawTech();
        }

        if (global.arpa.sequence && global.arpa.sequence['auto'] && global.tech['genetics'] && global.tech['genetics'] === 7){
            buildGene();
        }

        govern();
    }

    // Event triggered
    if (!global.race.seeded || (global.race.seeded && global.race['chose'])){
        if (Math.rand(0,global.event.t) === 0){
            let event_pool = eventList('major');
            if (event_pool.length > 0){
                let event = event_pool[Math.floor(Math.seededRandom(0,event_pool.length))];
                let msg = events[event].effect();
                messageQueue(msg,'caution',false,['events','major_events']);
                global.event.l = event;
            }
            global.event.t = 999;
        }
        else {
            global.event.t--;
        }

        if (global.race.species !== 'protoplasm'){
            if (Math.rand(0,global.m_event.t) === 0){
                let event_pool = eventList('minor');
                if (event_pool.length > 0){
                    let event = event_pool[Math.floor(Math.seededRandom(0,event_pool.length))];
                    let msg = events[event].effect();
                    messageQueue(msg,false,false,['events','minor_events']);
                    global.m_event.l = event;
                }
                global.m_event.t = 850;
            }
            else {
                global.m_event.t--;
            }
        }
    }

    if (date.getMonth() === 11 && date.getDate() >= 17 && date.getDate() <= 24){
        global.special.gift[`g${date.getFullYear()}`] = true;
        global.tech['santa'] = 1;
    }
    else {
        delete global.tech['santa'];
    }

    if (eventActive('fool')){
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
    global.stats['current'] = Date.now();
    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));

    if (global.race.species !== 'protoplasm' && (global.stats.days + global.stats.tdays) % 100000 === 99999){
        messageQueue(loc(`backup_warning`), 'advanced', true);
    }

    kplv--;
    if (kplv <= 0){
        kplv = 60;
        tagEvent('page_view',{ page_title: `Game Loop` });
    }

    if (global.settings.pause && webWorker.s){
        gameLoop('stop');
    }
    if (global.settings.at > 0){
        global.settings.at--;
        if (global.settings.at <= 0){
            gameLoop('stop');
            gameLoop('start');
        }
    }
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
        if (global.space['ai_core2']){
            let core = load ? global.space.ai_core2.on : p_on['ai_core2']
            if (global.tech['titan_ai_core'] && core > 0){
                qbits *= 1.25;
            }
        }
        if (global.stats.achieve['obsolete'] && global.stats.achieve[`obsolete`].l >= 5 && global.race.AICore.count > 0){
            qbits *= 2 - (0.99 ** global.race.AICore.count);
        }
        if (global.race['linked']){
            let factor = traits.linked.vars()[0] / 100 * global.resource[global.race.species].amount;
            if (factor > traits.linked.vars()[1] / 100){
                factor -= traits.linked.vars()[1] / 100;
                factor = factor / (factor + 200 - traits.linked.vars()[1]);
                factor += traits.linked.vars()[1] / 100;
            }
            qbits *= 1 + factor;
        }
        set_qlevel(+(qbits).toFixed(3));
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
        messageQueue(loc('steel_sample'),'info',false,['progress']);
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
            let egg = easterEgg(2);
            if (egg.length > 0){
                $('#moon').append(egg);
            }
            else {
                $('#moon').addClass('wi-moon-full');
            }
            break;
        case 15:
            clearElement($('#moon'));
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
    ['#resources > .resource','.tab-item > .market-item','#galaxyTrade > .market-item'].forEach(function(id){
        let alt = false;
        $(`${id}:visible`).each(function(){
            if (alt){
                $(this).addClass('alt');
                alt = false;
            }
            else {
                $(this).removeClass('alt');
                alt = true;
            }
        });
    });
}

function spyCaught(i){
    if (global.civic.foreign[`gov${i}`].spy > 0){
        global.civic.foreign[`gov${i}`].spy -= global.race['elusive'] ? 0 : 1;
    }
    switch (i){
        case 0:
            messageQueue(loc(global.race['elusive'] ? 'event_spy_fail' : 'event_spy',[govTitle(i)]),'danger',false,['spy']);
            break;
        case 1:
            messageQueue(loc(global.race['elusive'] ? 'event_spy_fail' : 'event_spy',[govTitle(i)]),'danger',false,['spy']);
            break;
        case 2:
            messageQueue(loc(global.race['elusive'] ? 'event_spy_fail' : 'event_spy',[govTitle(i)]),'danger',false,['spy']);
            break;
    }
}

intervals['version_check'] = setInterval(function(){
    $.ajax({
        url: 'https://pmotschmann.github.io/Evolve/package.json',
        type: 'GET',
        dataType: 'json',
        success: function(res){
            if (res['version'] && res['version'] != global['version'] && !global['beta']){
                $('#topBar .version > a').html(`<span class="has-text-warning">${loc(`update_avail`)}</span> v`+global.version+revision);
            }
        }
    });
}, 900000);

let changeLog = $(`<div class="infoBox"></div>`);
popover('versionLog',getTopChange(changeLog),{ wide: true });

if (global.race['start_cataclysm']){
    start_cataclysm();
}
