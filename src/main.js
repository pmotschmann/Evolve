import { global, save, seededRandom, webWorker, intervals, keyMap, atrack, resizeGame, breakdown, sizeApproximation, keyMultiplier, power_generated, p_on, support_on, int_on, gal_on, spire_on, set_qlevel, quantum_level, callback_queue } from './vars.js';
import { loc } from './locale.js';
import { unlockAchieve, checkAchievements, drawAchieve, alevel, universeAffix, challengeIcon, unlockFeat, checkAdept } from './achieve.js';
import { gameLoop, vBind, popover, clearPopper, flib, tagEvent, timeCheck, arpaTimeCheck, timeFormat, powerModifier, modRes, initMessageQueue, messageQueue, calc_mastery, calcPillar, darkEffect, calcQueueMax, calcRQueueMax, buildQueue, shrineBonusActive, getShrineBonus, eventActive, easterEggBind, trickOrTreatBind, powerGrid, deepClone, addATime, exceededATimeThreshold, loopTimers, calcQuantumLevel, drawPet } from './functions.js';
import { races, traits, racialTrait, orbitLength, servantTrait, randomMinorTrait, biomes, planetTraits, shapeShift, fathomCheck, blubberFill, cleanRemoveTrait } from './races.js';
import { defineResources, resource_values, spatialReasoning, craftCost, plasmidBonus, faithBonus, faithTempleCount, tradeRatio, craftingRatio, crateValue, containerValue, tradeSellPrice, tradeBuyPrice, atomic_mass, supplyValue, galaxyOffers } from './resources.js';
import { defineJobs, job_desc, loadFoundry, farmerValue, jobName, jobScale, workerScale, limitCraftsmen, loadServants} from './jobs.js';
import { defineIndustry, f_rate, manaCost, setPowerGrid, gridEnabled, gridDefs, nf_resources, replicator, luxGoodPrice, smelterUnlocked, smelterFuelConfig } from './industry.js';
import { checkControlling, garrisonSize, armyRating, govTitle, govCivics, govEffect, weaponTechModifer } from './civics.js';
import { actions, updateDesc, checkTechRequirements, drawEvolution, BHStorageMulti, storageMultipler, checkAffordable, checkPowerRequirements, drawCity, drawTech, gainTech, housingLabel, updateQueueNames, wardenLabel, planetGeology, resQueue, bank_vault, start_cataclysm, orbitDecayed, postBuild, skipRequirement, structName, templeCount, initStruct, casino_vault, casinoEarn, doCallbacks, cLabels } from './actions.js';
import { renderSpace, convertSpaceSector, fuel_adjust, int_fuel_adjust, zigguratBonus, planetName, genPlanets, setUniverse, universe_types, gatewayStorage, piracy, spaceTech, universe_affixes, galaxyRegions, gatewayArmada, galaxy_ship_types } from './space.js';
import { renderFortress, bloodwar, soulForgeSoldiers, hellSupression, genSpireFloor, mechRating, mechCollect, updateMechbay, hellguard, buildMechQueue, mechCost } from './portal.js';
import { asphodelResist, mechStationEffect, renderEdenic } from './edenic.js';
import { renderTauCeti, syndicate, shipFuelUse, spacePlanetStats, genXYcoord, shipCrewSize, tpStorageMultiplier, tritonWar, sensorRange, erisWar, calcAIDrift, drawMap, tauEnabled, shipCosts, buildTPShipQueue } from './truepath.js';
import { arpa, buildArpa, sequenceLabs } from './arpa.js';
import { events, eventList } from './events.js';
import { govern, govActive, removeTask } from './governor.js';
import { production, highPopAdjust, teamster, factoryBonus } from './prod.js';
import { swissKnife } from './tech.js';
import { vacuumCollapse } from './resets.js';
import { index, mainVue, initTabs, loadTab } from './index.js';
import { setWeather, seasonDesc, astrologySign, astroVal } from './seasons.js';
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
                if (global.settings.civTabs !== quickMap[k]) {
                    global.settings.civTabs = quickMap[k];
                }
                else {
                    let s = global.settings;
                    let tabName = null;
                    let tabList = null;
                    switch(quickMap[k]) {
                            // Some sub tabs are always visible, and JavaScript strings
                            // are truthy, so the sub tab name is used for clarity.
                        case quickMap.showCiv:
                            tabName = 'spaceTabs';
                            tabList = [s.showCity, s.showSpace, s.showDeep, s.showGalactic, s.showPortal, s.showOuter, s.showTau, s.showEden];
                            break;
                        case quickMap.showCivic:
                            // not reaching Military
                            tabName = 'govTabs';
                            tabList = ["Government", s.showIndustry, s.showPowerGrid, s.showMil, s.showMechLab, s.showShipYard, s.showPsychic, s.showWish];
                            break;
                        case quickMap.showResearch:
                            tabName = 'resTabs';
                            tabList = ["New", "Completed"]; // always visible
                            break;
                        case quickMap.showResources:
                            tabName = 'marketTabs';
                            tabList = [s.showMarket, s.showStorage, s.showEjector, s.showCargo, s.showAlchemy];
                            break;
                        case quickMap.showGenetics:
                            s = global.settings.arpa;
                            tabName = 'arpaTabs';
                            tabList = [s.physics, s.genetics, s.crispr, s.blood];
                            break;
                        case quickMap.showAchieve:
                            tabName = 'statsTabs';
                            tabList = ["Stats", "Achievements", "Perks"]; // always visible
                            break;
                        case quickMap.settings:
                        default:
                            // no sub tabs
                            tabName = '';
                            tabList = [];
                            break;
                    }
                    for (let i = 1; i < tabList.length; i+=1) {
                        let next = (s[tabName] + i) % tabList.length
                        if (tabList[next]) {
                            s[tabName] = next;
                            break;
                        }
                    }
                }
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
if (global.interstellar['starport']){
    p_on['starport'] = global.interstellar.starport.on;
}
if (global.interstellar['fusion']){
    int_on['fusion'] = global.interstellar.fusion.on;
}
if (global.interstellar['s_gate']){
    p_on['s_gate'] = global.interstellar.s_gate.on;
}
if (global.portal['hell_forge']){
    p_on['hell_forge'] = global.portal.hell_forge.on;
}
if (global.portal['demon_forge']){
    p_on['demon_forge'] = global.portal.demon_forge.on;
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
if (global.tauceti['fusion_generator']){
    p_on['fusion_generator'] = global.tauceti.fusion_generator.on;
}
if (global.eden['encampment']){
    p_on['encampment'] = global.eden.encampment.on;
}
if (global.eden['soul_engine']){
    p_on['soul_engine'] = global.eden.soul_engine.on;
    support_on['soul_engine'] = global.eden.soul_engine.on;
}
if (global.eden['corruptor']){
    p_on['corruptor'] = global.eden.corruptor.on;
}
if (global.eden['ectoplasm_processor']){
    p_on['ectoplasm_processor'] = global.eden.ectoplasm_processor.on;
    support_on['ectoplasm_processor'] = global.eden.ectoplasm_processor.on;
}
if (global.eden['research_station']){
    p_on['research_station'] = global.eden.research_station.on;
    support_on['research_station'] = global.eden.research_station.on;
}
if (global.eden['bunker']){
    p_on['bunker'] = global.eden.bunker.on;
    support_on['bunker'] = global.eden.bunker.on;
}
if (global.eden['spirit_vacuum']){
    p_on['spirit_vacuum'] = global.eden.spirit_vacuum.on;
}
if (global.eden['spirit_battery']){
    p_on['spirit_battery'] = global.eden.spirit_battery.on;
}
if (global.city['replicator'] && global.race?.replicator?.pow && global.race?.governor?.config?.replicate?.pow?.on){
    if (Object.values(global.race.governor.tasks).includes('replicate')){
        global.city.replicator.on = 0;
        global.city.replicator.count = 0;
        global.race.replicator.pow = 0;
    }
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
        replicate(kw){
            if (global.race.hasOwnProperty('governor') && global.race.governor.hasOwnProperty('tasks') && global.race.hasOwnProperty('replicator') && Object.values(global.race.governor.tasks).includes('replicate') && global.race.governor.config.replicate.pow.on && global.race.replicator.pow > 0){
                return kw + global.race.replicator.pow;
            }
            return kw;
        },
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
                    let democracy = 1 + (govEffect.democracy()[0] / 100);
                    value /= democracy;
                }

                let label = {  }

                obj.popper.append(`<p class="modal_bd"><span>${loc(`morale_${morale}`)}</span> <span class="has-text-${type}"> ${+(value).toFixed(1)}%</span></p>`)

                if (morale === 'entertain' && global.civic.govern.type === 'democracy'){
                    let democracy = govEffect.democracy()[0];
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
            let penalty = govEffect.corpocracy()[3];
            total -= penalty;
            obj.popper.append(`<p class="modal_bd"><span>${loc('govern_corpocracy')}</span> <span class="has-text-danger"> -${penalty}%</span></p>`);
        }
        if (global.civic.govern.type === 'republic'){
            let repub = govEffect.republic()[1];
            total += repub;
            obj.popper.append(`<p class="modal_bd"><span>${loc('govern_republic')}</span> <span class="has-text-success"> ${repub}%</span></p>`);
        }
        if (global.civic.govern.type === 'federation'){
            let fed = govEffect.federation()[1];
            total += fed;
            obj.popper.append(`<p class="modal_bd"><span>${loc('govern_federation')}</span> <span class="has-text-success"> ${fed}%</span></p>`);
        }

        let milVal = govActive('militant',1);
        if (milVal){
            total -= milVal;
            obj.popper.append(`<p class="modal_bd"><span>${loc('gov_trait_militant')}</span> <span class="has-text-danger"> -${milVal}%</span></p>`);
        }

        if (global.race['cheese']){
            let raw_cheese = global.stats.hasOwnProperty('reset') ? global.stats.reset + 1 : 1;
            let cheese = +(raw_cheese / (raw_cheese + 10) * 11).toFixed(2);
            total += cheese;
            obj.popper.append(`<p class="modal_bd"><span>${swissKnife(true,false)}</span> <span class="has-text-success"> ${cheese}%</span></p>`);
        }

        if (global.race['motivated']){
            let boost = Math.ceil(global.race['motivated'] ** 0.4);
            total += boost;
            obj.popper.append(`<p class="modal_bd"><span>${loc(`event_motivation_bd`)}</span> <span class="has-text-success"> ${boost}%</span></p>`);
        }

        if (global.race['artisan'] && global.civic.craftsman.workers > 0){
            let boost = +(traits.artisan.vars()[2] * global.civic.craftsman.workers).toFixed(2);
            total += boost;
            obj.popper.append(`<p class="modal_bd"><span>${loc(`trait_artisan_name`)}</span> <span class="has-text-success"> ${boost}%</span></p>`)
        }

        if (global.race['pet']){
            let change = 1;
            if (global.race['catnip']){
                change = traits.catnip.vars()[0];
            }
            else if (global.race['anise']){
                change = traits.anise.vars()[0];
            }
            if (global.race['pet']){
                if (global.race.pet.event > 0){
                    if (global.race['catnip']){
                        change += traits.catnip.vars()[0];
                    }
                    else if (global.race['anise']){
                        change += traits.anise.vars()[0];
                    }
                    else {
                        change++;
                    }
                }
                if (global.race.pet.pet > 0){
                    change += global.race.pet.type === 'cat' ? (global.race['catnip'] ? traits.catnip.vars()[1] : 2) : (global.race['anise'] ? traits.anise.vars()[1] : 1);
                }
                else if (global.race.pet.pet < 0){
                    change -= global.race.pet.type === 'cat' ? (global.race['catnip'] ? traits.catnip.vars()[1] : 2) : (global.race['anise'] ? traits.anise.vars()[1] : 1);
                }
            }
            if (change !== 0){
                total += change;
                let style = change > 0 ? 'success' : 'danger';
                obj.popper.append(`<p class="modal_bd"><span>${loc(`event_pet_${global.race.pet.type}_owner`)}</span> <span class="has-text-${style}"> ${change}%</span></p>`);
            }
        }

        if (global.race['wishStats'] && global.race.wishStats.fame !== 0){
            total += global.race.wishStats.fame;
            if (global.race.wishStats.fame > 0){
                obj.popper.append(`<p class="modal_bd"><span>${loc(`wish_reputable`)}</span> <span class="has-text-success"> ${global.race.wishStats.fame}%</span></p>`);
            }
            else {
                obj.popper.append(`<p class="modal_bd"><span>${loc(`wish_notorious`)}</span> <span class="has-text-danger"> ${global.race.wishStats.fame}%</span></p>`);
            }
        }

        if (global.civic['homeless']){
            let homeless = global.civic.homeless / 2;
            total -= homeless;
            obj.popper.append(`<p class="modal_bd"><span>${loc(`homeless`)}</span> <span class="has-text-danger"> -${homeless}%</span></p>`);
        }

        if (global.tech['vax_c'] || global.tech['vax_f']){
            let drop = global.tech['vax_c'] ? 10 : 50;
            total -= drop;
            obj.popper.append(`<p class="modal_bd"><span>${loc(global.tech['vax_c'] ? `tech_vax_strat4_bd` : `tech_vax_strat2_bd`)}</span> <span class="has-text-danger"> -${drop}%</span></p>`);
        }
        else if (global.tech['vax_s']){
            let gain = 20;
            total += gain;
            obj.popper.append(`<p class="modal_bd"><span>${loc(`tech_vax_strat3_bd`)}</span> <span class="has-text-success"> ${gain}%</span></p>`);
        }

        if (global.city['tormented']){
            total -= global.city.tormented;
            obj.popper.append(`<p class="modal_bd"><span>${loc(`trait_tormented_name`)}</span> <span class="has-text-danger"> -${global.city.tormented}%</span></p>`);
        }

        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.bad > 0){
            let badPress = Math.floor(global.race.wishStats.bad / 75) + 1;
            total -= badPress * 5;
            obj.popper.append(`<p class="modal_bd"><span>${loc(`wish_bad`)}</span> <span class="has-text-danger"> -${badPress * 5}%</span></p>`);
        }

        total = +(total).toFixed(1);

        let container = $(`<div></div>`);
        obj.popper.append(container);

        container.append(`<div class="modal_bd sum"><span>${loc('morale_total')}</span> <span class="has-text-warning"> ${+(total).toFixed(1)}%</span></div>`);
        container.append(`<div class="modal_bd"><span>${loc('morale_max')}</span> <span class="has-text-${total > moraleCap ? 'caution' : 'warning'}"> ${+(moraleCap).toFixed(1)}%</span></div>`);
        container.append(`<div class="modal_bd"><span>${loc('morale_current')}</span> <span class="has-text-warning"> ${+(global.city.morale.current).toFixed(1)}%</span></div>`);

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
                let gen = +power_generated[k];
                obj.popper.append(`<p class="modal_bd"><span>${k}</span> <span class="has-text-success">+${+gen.toFixed(2)}</span></p>`);
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
        sign(){
            return seasonDesc('sign');
        },
        getAstroSign(){
            return seasonDesc('astrology');
        },
        weather(){
            return seasonDesc('weather');
        },
        temp(){
            return seasonDesc('temp');
        },
        moon(){
            return seasonDesc('moon');
        },
        season() {
            return seasonDesc('season');
        },
        showUniverse(){
            return global.race.universe === 'standard' || global.race.universe === 'bigbang' ? false : true;
        },
        showSim(){
            return global['sim'] ? true : false;
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
        },
        showPet(){
            return global.race['pet'] ? true : false;
        },
        petPet(){
            if (global.race['pet'] && global.race.pet.pet === 0){
                let outcome = global.race.pet.type === 'cat' ? Math.rand(0,3) : Math.rand(0,10);
                if (outcome === 0){
                    global.race.pet.pet = -60;
                    messageQueue(loc(`event_${global.race.pet.type}_pet_failure`,[loc(`event_${global.race.pet.type}_name${global.race.pet.name}`)]),false,false,['events','minor_events']);
                }
                else {
                    global.race.pet.pet = 60;
                    messageQueue(loc(`event_${global.race.pet.type}_pet_success`,[loc(`event_${global.race.pet.type}_name${global.race.pet.name}`)]),false,false,['events','minor_events']);
                }
            }
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
            let minutes = Math.ceil(at * loopTimers().longTimer / 60000);
            if (minutes > 0){
                let hours = Math.floor(minutes / 60);
                minutes -= hours * 60;
                return `${hours}:${minutes.toString().padStart(2,'0')}`;
            }
            return;
        }
    }
});

['astroSign'].forEach(function(topId){
    popover(`${topId}`,function(){
        return seasonDesc('sign');
    }, {
        elm: $(`#${topId}`)
    });
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
            if (trait.length > 0){
                let traits = '';
                trait.forEach(function(t){
                    if (planetTraits.hasOwnProperty(t)){
                        if (t === 'mellow' && global.race.species === 'entish'){
                            traits += `${loc('planet_mellow_eg')} `;
                        }
                        else {
                            traits += `${planetTraits[t].label} `;
                        }
                    }
                });
                planet_label = `${traits}${planet_label}`;
            }
            let orbit = orbitLength();

            let geo_traits = planetGeology(global.city.geology);

            let challenges = '';
            if (global.race['truepath']){
                challenges = challenges + `<div>${loc('evo_challenge_truepath_recap')}</div>`;
            }
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
            if (global.race['witch_hunter']){
                challenges = challenges + `<div>${loc('evo_challenge_witch_hunter_desc')}</div>`;
            }
            if (global.race['nonstandard']){
                challenges = challenges + `<div>${loc('evo_challenge_nonstandard_desc')}</div>`;
            }
            if (global.race['gravity_well']){
                challenges = challenges + `<div>${loc('evo_challenge_gravity_well_desc')}</div>`;
            }
            if (global.race['warlord']){
                challenges = challenges + `<div>${loc('evo_challenge_warlord_desc')}</div>`;
            }
            if (global.race['fasting']){
                challenges = challenges + `<div>${loc('evo_challenge_fasting_desc')}</div>`;
            }
            if (global.race['lone_survivor']){
                challenges = challenges + `<div>${loc('evo_challenge_lone_survivor_desc')}</div>`;
            }
            if (global.race['sludge']){
                challenges = challenges + `<div>${loc('evo_challenge_sludge_desc')} ${loc('evo_challenge_sludge_conditions')}</div>`;
            }
            if (global.race['ultra_sludge']){
                challenges = challenges + `<div>${loc('evo_challenge_ultra_sludge_desc')} ${loc('evo_challenge_ultra_sludge_conditions')}</div>`;
            }
            if (global.race['orbit_decay']){
                let impact = global.race['orbit_decayed'] ? '' : loc('evo_challenge_orbit_decay_impact',[global.race['orbit_decay'] - global.stats.days]);
                let state = global.race['orbit_decayed'] ? (global.race['tidal_decay'] ? loc(`planet_kamikaze_msg`) : loc('evo_challenge_orbit_decay_impacted',[races[global.race.species].home])) : loc('evo_challenge_orbit_decay_desc');
                challenges = challenges + `<div>${state} ${loc('evo_challenge_orbit_decay_conditions')} ${impact}</div>`;
                if (calc_mastery() >= 100 && global.race.universe !== 'antimatter'){
                    challenges = challenges + `<div class="has-text-caution">${loc('evo_challenge_cataclysm_warn')}</div>`;
                }
                else {
                    challenges = challenges + `<div class="has-text-danger">${loc('evo_challenge_scenario_warn')}</div>`;
                }
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

popover('topBarSimulation',
    function(obj){
        obj.popper.append($(`<div>${loc(`evo_challenge_simulation_topbar`)}</div>`));
        return undefined;
    },
    {
        elm: `#topBar .planetWrap .simulation`,
        classes: `has-background-light has-text-dark`
    }
);

if (global.race['orbit_decay'] && !global.race['orbit_decayed']){
    popover(`infoTimer`, function(){
        return global.race['orbit_decayed'] ? '' : loc('evo_challenge_orbit_decay_impact',[global.race['orbit_decay'] - global.stats.days]);
    },
    {
        elm: `#infoTimer`,
        classes: `has-background-light has-text-dark`
    });
}

challengeIcon();
drawPet();

if (global.race.species === 'protoplasm'){
    global.resource.RNA.display = true;
    let perk_rank = global.stats.feat['master'] && global.stats.achieve['ascended'] && global.stats.achieve.ascended.l > 0 ? Math.min(global.stats.achieve.ascended.l,global.stats.feat['master']) : 0;
    if (global['sim']){ perk_rank = 5; }
    if (perk_rank > 0 && !global.evolution['mloaded']){
        let evolve_actions = ['dna','membrane','organelles','nucleus','eukaryotic_cell','mitochondria'];
        for (let i = 0; i < evolve_actions.length; i++) {
            if (!global.evolution[evolve_actions[i]]){
                global.evolution[evolve_actions[i]] = { count: 0 };
            }
        }
        global.evolution['dna'] = 1;
        global.resource.DNA.display = true;
        global.evolution.membrane.count = perk_rank * 2;
        global.evolution.eukaryotic_cell.count = perk_rank;
        global.evolution.mitochondria.count = perk_rank;
        global.evolution.organelles.count = perk_rank * 2;
        global.evolution.nucleus.count = perk_rank * 2;
        global.tech['evo'] = 2;
        global.evolution['mloaded'] = 1;
    }
    let grand_rank = global.stats.feat['grandmaster'] && global.stats.achieve['corrupted'] && global.stats.achieve.corrupted.l > 0 ? Math.min(global.stats.achieve.corrupted.l,global.stats.feat['grandmaster']) : 0;
    if (global['sim']){ grand_rank = 5; }
    if (grand_rank >= 5 && !global.evolution['gmloaded']){
        global.tech['evo'] = 6;
        global.evolution['gselect'] = true;
        global.evolution['gmloaded'] = 1;
        global.evolution['final'] = 80;
        global.tech['evo_humanoid'] = 1;
        global.tech['evo_giant'] = 1;
        global.tech['evo_small'] = 1;
        global.tech['evo_animalism'] = 2;
        global.tech['evo_demonic'] = 1;
        global.tech['evo_angelic'] = 1;
        global.tech['evo_insectoid'] = 1;
        global.tech['evo_eggshell'] = 2;
        global.tech['evo_eldritch'] = 1;
        global.tech['evo_sand'] = 1;
        global.tech['evo_polar'] = 1;
        global.tech['evo_heat'] = 1;
        global.tech['evo_fey'] = 1;
        global.tech['evo_aquatic'] = 1;
    }
    if (global.race.universe === 'bigbang'){
        global.seed = global.race.seed;
        setUniverse();
    }
    else if (global.race.seeded && !global.race['chose']){
        global.seed = global.race.seed;
        genPlanets();
    }
    else {
        drawEvolution();
    }
}
else {
    if (global.portal.hasOwnProperty('soul_forge') && global.portal.soul_forge.on){
        p_on['soul_forge'] = 1;
    }
    setWeather();
}

set_qlevel(calcQuantumLevel(true));

$('#lbl_city').html('Village');

var loopTick = 0; // Used to synchronize the fast, mid, and long loops to each other
export function execGameLoops(periods = 1){
    // Currently there is no smart catch-up mechanism
    // Limit to 1 minute (12 game days) of simulation per call
    const maxCatchUp = webWorker.longRatio * 12;
    periods = Math.min(periods, maxCatchUp); 

    while (webWorker.s && periods--){
        ++loopTick;
        const doMid = (loopTick % webWorker.midRatio) === 0;
        const doLong = (loopTick % webWorker.longRatio) === 0;

        // Always run a faster loop before a slower loop
        fastLoop();
        if (doMid){ midLoop(); }

        // Perform callbacks before longLoop, so that any permanent results can be saved during longLoop
        doCallbacks();
        if (doLong){ longLoop(); }

        // Overflow prevention
        if (doMid && doLong){ loopTick = 0; }
    }
}

if (window.Worker){
    webWorker.w = new Worker("evolve/evolve.js");
    webWorker.w.addEventListener('message', function(e){
        const data = e.data;
        switch (data.loop) {
            case 'main':
                execGameLoops(data.periods);
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
    const astroSign = astrologySign();
    breakdown.p['Global'] = {};
    var global_multiplier = 1;
    let applyPlasmid = false;
    let pBonus = plasmidBonus('raw');
    if (global.prestige.Plasmid.count > 0 && ((global.race.universe !== 'antimatter') || (global.genes['bleed'] && global.race.universe === 'antimatter'))){
        breakdown.p['Global'][loc('resource_Plasmid_name')] = (pBonus[1] * 100) + '%';
        applyPlasmid = true;
    }
    if (global.prestige.AntiPlasmid.count > 0 && ((global.race.universe === 'antimatter') || (global.genes['bleed'] && global.genes['bleed'] >= 2 && global.race.universe !== 'antimatter'))){
        breakdown.p['Global'][loc('resource_AntiPlasmid_name')] = (pBonus[2] * 100) + '%';
        applyPlasmid = true;
    }
    if (applyPlasmid){
        global_multiplier += pBonus[0];
    }
    if (global.prestige.Supercoiled.count > 0){
        let bonus = (global.prestige.Supercoiled.count / (global.prestige.Supercoiled.count + 5000));
        breakdown.p['Global'][loc('resource_Supercoiled_short')] = +(bonus * 100).toFixed(2) + '%';
        global_multiplier *= (1 + bonus);
    }
    if (global.race['no_plasmid'] || global.race.universe === 'antimatter'){
        if (faithTempleCount()){
            let faith = faithBonus();
            breakdown.p['Global'][loc('faith')] = (faith * 100) + '%';
            global_multiplier *= (1 + faith);
        }
    }
    if (global.race.universe === 'evil' && global.resource.Authority.display){
        if (global.resource.Authority.amount < 100){
            let malus = (100 - global.resource.Authority.amount) * 0.0035;
            breakdown.p['Global'][global.resource.Authority.name] = -(malus * 100).toFixed(2) + '%';
            global_multiplier *= (1 - malus);
        }
        else if (global.resource.Authority.amount > 100){
            let bonus = (global.resource.Authority.amount - 100) * 0.0015;
            breakdown.p['Global'][global.resource.Authority.name] = +(bonus * 100).toFixed(2) + '%';
            global_multiplier *= (1 + bonus);
        }
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
    if (global.race['gloomy'] && global.city.calendar.weather <= 1){
        breakdown.p['Global'][loc('trait_gloomy_name')] = `${traits.gloomy.vars()[0]}%`;
        global_multiplier *= 1 + (traits.gloomy.vars()[0] / 100);
    }
    if (global.race['floating'] && global.city.calendar.wind === 1){
        breakdown.p['Global'][loc('trait_floating_name')] = `-${traits.floating.vars()[0]}%`;
        global_multiplier *= 1 - (traits.floating.vars()[0] / 100);
    }
    if (global.tech['world_control']){
        let bonus = 25;
        if (global.civic.govern.type === 'federation'){
            bonus = govEffect.federation()[2];
        }
        if (global.race['unified']){
            bonus += traits.unified.vars()[0];
        }
        if (astroSign === 'taurus'){
            bonus += astroVal('taurus')[0];
        }
        breakdown.p['Global'][loc('tech_unification')] = `${bonus}%`;
        global_multiplier *= 1 + (bonus / 100);
    }
    else {
        let occupy = 0;
        for (let i=0; i<3; i++){
            if (global.civic.foreign[`gov${i}`].occ || global.civic.foreign[`gov${i}`].anx || global.civic.foreign[`gov${i}`].buy){
                occupy += global.civic.govern.type === 'federation' ? (5 + govEffect.federation()[0]) : 5;
            }
        }
        if (occupy > 0){
            breakdown.p['Global'][loc('civics_garrison_occupy')] = `${occupy}%`;
            global_multiplier *= 1 + (occupy / 100);
        }
    }
    if (global.genes['challenge'] && global.genes.challenge >= 2){
        let mastery = calc_mastery();
        breakdown.p['Global'][loc('mastery')] = mastery + '%';
        global_multiplier *= 1 + (mastery / 100);
    }
    if (global['pillars']){
        let harmonic = calcPillar();
        breakdown.p['Global'][loc('harmonic')] = `${(harmonic[0] - 1) * 100}%`;
        global_multiplier *= harmonic[0];
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
    if (global.race['rejuvenated']){
        let decay = global.stats.days < 996 ? (1000 - global.stats.days) / 2000 : 0.02;
        breakdown.p['Global'][loc('rejuvenated')] = `${decay * 100}%`;
        global_multiplier *= 1 + decay;
    }
    let octFathom = fathomCheck('octigoran');
    if (global.race['suction_grip'] || octFathom > 0){
        let bonus = 0;
        if (global.race['suction_grip']){
            bonus += traits.suction_grip.vars()[0];
        }
        if (octFathom > 0){
            bonus += +(traits.suction_grip.vars(1)[0] * octFathom).toFixed(2);
        }
        breakdown.p['Global'][loc('trait_suction_grip_bd')] = bonus+'%';
        global_multiplier *= 1 + (bonus / 100);
    }

    let cyclopsFathom = fathomCheck('cyclops');
    if (global.race['intelligent'] || cyclopsFathom > 0){
        let bonus = 0;
        if (global.race['intelligent']){
            bonus += (workerScale(global.civic.scientist.workers,'scientist') * traits.intelligent.vars()[1]) + (workerScale(global.civic.professor.workers,'professor') * traits.intelligent.vars()[0]);
        }
        if (cyclopsFathom > 0){
            bonus += (workerScale(global.civic.scientist.workers,'scientist') * traits.intelligent.vars(1)[1] * cyclopsFathom) + (workerScale(global.civic.professor.workers,'professor') * traits.intelligent.vars(1)[0] * cyclopsFathom);
        }
        if (global.race['high_pop']){
            bonus = highPopAdjust(bonus);
        }
        breakdown.p['Global'][loc('trait_intelligent_bd')] = bonus+'%';
        global_multiplier *= 1 + (bonus / 100);
    }
    if (global.race['slaver'] && global.city['slave_pen'] && global.city['slave_pen']){
        let bonus = (global.resource.Slave.amount * traits.slaver.vars()[0]);
        breakdown.p['Global'][loc('trait_slaver_bd')] = bonus+'%';
        global_multiplier *= 1 + (bonus / 100);
    }
    if ((global.city.ptrait.includes('trashed') || global.race['scavenger'] || (global.race['servants'] && global.race.servants['force_scavenger'])) && global.civic['scavenger']){
        let scavenger = global.city.ptrait.includes('trashed') || global.race['scavenger'] ? workerScale(global.civic.scavenger.workers,'scavenger') : 0;
        if (global.race['servants']){ scavenger += jobScale(global.race.servants.jobs.scavenger); }
        if (scavenger > 0){
            let bonus = (scavenger * traits.scavenger.vars()[0]);
            if (global.city.ptrait.includes('trashed') && global.race['scavenger']){
                bonus *= 1 + (traits.scavenger.vars()[1] / 100);
            }
            if (global.city.ptrait.includes('trashed')){
                bonus *= planetTraits.trashed.vars()[1];
            }
            if (global.race['high_pop']){
                bonus = highPopAdjust(bonus);
            }
            breakdown.p['Global'][jobName('scavenger')] = bonus+'%';
            global_multiplier *= 1 + (bonus / 100);
        }
    }
    if (global.race['unfathomable'] && global.city['surfaceDwellers'] && global.city['captive_housing']){
        let thralls = 0;
        let rank = global.stats.achieve['nightmare'] && global.stats.achieve.nightmare['mg'] ? global.stats.achieve.nightmare.mg : 0;
        if (global.city.hasOwnProperty('surfaceDwellers')){
            for (let i = 0; i < global.city.surfaceDwellers.length; i++){
                thralls += global.city.captive_housing[`race${i}`];
            }
            if (thralls > global.civic.torturer.workers * rank / 2){
                let unsupervised = thralls - (global.civic.torturer.workers * rank / 2);
                thralls -= Math.ceil(unsupervised / 3);
            }
        }
        if (thralls > 0){
            let bonus = (thralls * traits.unfathomable.vars()[2] * rank / 5);
            if (global.race['psychic']){
                bonus *= 1 + (traits.psychic.vars()[1] / 100);
            }
            breakdown.p['Global'][loc('trait_unfathomable_bd')] = bonus+'%';
            global_multiplier *= 1 + (bonus / 100);
        }
    }
    if (global.city.ptrait.includes('mellow')){
        breakdown.p['Global'][loc('planet_mellow_bd')] = '-' + (100 - (planetTraits.mellow.vars()[2] * 100)) + '%';
        global_multiplier *= planetTraits.mellow.vars()[2];
    }
    if (global.city.ptrait.includes('ozone') && global.city['sun']){
        let uv = global.city['sun'] * planetTraits.ozone.vars()[0];
        breakdown.p['Global'][loc('planet_ozone_bd')] = `-${uv}%`;
        global_multiplier *= 1 - (uv / 100);
    }
    let phoenixFathom = fathomCheck('phoenix');
    if ((global.race['smoldering'] || phoenixFathom > 0) && global.city['hot']){
        let heat = 0;
        if (global.race['smoldering']){
            if (global.city['hot'] > 100){
                heat += 100 * traits.smoldering.vars()[1];
                heat += (global.city['hot'] - 100) * traits.smoldering.vars()[2];
            }
            else {
                heat += global.city['hot'] * traits.smoldering.vars()[1];
            }
        }
        if (phoenixFathom > 0){
            if (global.city['hot'] > 100){
                heat += 100 * traits.smoldering.vars(0.25)[1] * phoenixFathom;
                heat += (global.city['hot'] - 100) * traits.smoldering.vars(0.25)[2] * phoenixFathom;
            }
            else {
                heat += global.city['hot'] * traits.smoldering.vars(0.25)[1] * phoenixFathom;
            }
        }
        breakdown.p['Global'][loc('trait_smoldering_name')] = `${heat}%`;
        global_multiplier *= 1 + (heat / 100);
    }
    if (global.race['heat_intolerance'] && global.city['hot']){
        let heat = Math.min(100, global.city['hot'] * traits.heat_intolerance.vars()[0]);
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
        let cold = Math.min(100, global.city['cold'] * traits.cold_intolerance.vars()[0]);
        breakdown.p['Global'][loc('cold')] = `-${cold}%`;
        global_multiplier *= 1 - (cold / 100);
    }
    if (global.civic.govern.type === 'anarchy' && global.resource[global.race.species].amount > jobScale(10)){
        let chaos = (global.resource[global.race.species].amount - jobScale(10)) * (global.race['high_pop'] ? (0.25 / traits.high_pop.vars()[0]) : 0.25);
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
    let capyFathom = fathomCheck('capybara');
    if (capyFathom > 0 || (global.race['calm'] && global.city['meditation'] && global.resource.Zen.display)){
        let rawZen = global.resource.Zen.amount;
        if (capyFathom > 0){
            rawZen += Math.round(capyFathom * 500);
        }
        let zen = rawZen / (rawZen + 5000);
        breakdown.p['Global'][loc('trait_calm_bd')] = `+${(zen * 100).toFixed(2)}%`;
        global_multiplier *= 1 + zen;
    }
    if (global.city['firestorm'] && global.city.firestorm > 0){
        global.city.firestorm--;
        breakdown.p['Global'][loc('event_flare_bd')] = `-${20}%`;
        global_multiplier *= 0.8;
    }

    if (
        (races[global.race.species].type === 'aquatic' && !['swamp','oceanic'].includes(global.city.biome)) ||
        (races[global.race.species].type === 'fey' && !['forest','swamp','taiga'].includes(global.city.biome)) ||
        (races[global.race.species].type === 'heat' && !['ashland','volcanic'].includes(global.city.biome)) ||
        (races[global.race.species].type === 'polar' && !['tundra','taiga'].includes(global.city.biome)) ||
        (races[global.race.species].type === 'sand' && !['ashland','desert'].includes(global.city.biome)) ||
        (races[global.race.species].type === 'demonic' && global.city.biome !== 'hellscape') ||
        (races[global.race.species].type === 'angelic' && global.city.biome !== 'eden')
    ){
        if (!global.race['warlord']){
            let unsuited = 1;
            if (global.blood['unbound'] && global.blood.unbound >= 4){
                unsuited = global.race['rejuvenated'] ? 0.975 : 0.95;
            }
            else if (global.blood['unbound'] && global.blood.unbound >= 2){
                unsuited = global.race['rejuvenated'] ? 0.95 : 0.9;
            }
            else {
                unsuited = global.race['rejuvenated'] ? 0.9 : 0.8;
            }
        
            breakdown.p['Global'][loc('unsuited')] = `-${Math.round((1 - unsuited) * 100)}%`;
            global_multiplier *= unsuited;
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

    let resList = [
        'Money','Knowledge','Omniscience','Food','Lumber','Stone','Chrysotile','Crystal','Furs','Copper','Iron',
        'Cement','Coal','Oil','Uranium','Aluminium','Steel','Titanium','Alloy','Polymer','Iridium','Helium_3',
        'Water','Deuterium','Neutronium','Adamantite','Infernite','Elerium','Nano_Tube','Graphene','Stanene',
        'Bolognium','Vitreloy','Orichalcum','Asphodel_Powder','Elysanite','Unobtainium','Quantium',
        'Plywood','Brick','Wrought_Iron','Sheet_Metal','Mythril','Aerogel','Nanoweave','Scarletite',
        'Cipher','Nanite','Mana','Authority'
    ];

    breakdown.p['consume'] = {};
    resList.forEach(function(res){
        breakdown.p['consume'][res] = {};
        breakdown.p[res] = {};
    });
    if(global.race['fasting']){
        breakdown.p['consume'][global.race.species] = {};
        breakdown.p[global.race.species] = {};
    }

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
            if (global.tech['evo'] && global.tech.evo >= 5){
                increment *= 2;
            }
            modRes('DNA', increment * global_multiplier * time_multiplier);
            modRes('RNA', -(rna * 2 * time_multiplier));
        }
        if (global.evolution['organelles']){
            let rna_multiplier = global.race['rapid_mutation'] ? 2 : 1;
            if (global.tech['evo'] && global.tech.evo >= 2){
                rna_multiplier++;
            }
            modRes('RNA',global.evolution['organelles'].count * rna_multiplier * global_multiplier * time_multiplier);
        }

        if (((global.stats.feat['novice'] && global.stats.achieve['apocalypse'] && global.stats.achieve.apocalypse.l > 0) || global['sim']) && global.race.universe !== 'bigbang' && (!global.race.seeded || (global.race.seeded && global.race['chose']))){
            let rank = global['sim'] ? 5 : Math.min(global.stats.achieve.apocalypse.l,global.stats.feat['novice']);
            modRes('RNA', (rank / 2) * time_multiplier * global_multiplier);
            if (global.resource.DNA.display){
                modRes('DNA', (rank / 4) * time_multiplier * global_multiplier);
            }
        }
        // Detect new unlocks
        if (global['resource']['RNA'].amount >= 2 && !global.evolution['dna']){
            global.evolution['dna'] = 1;
            global.resource.DNA.display = true;
            if (global.stats.achieve['mass_extinction'] && global.stats.achieve['mass_extinction'].l > 1){
                modRes('RNA', global.resource.RNA.max);
                modRes('DNA', global.resource.RNA.max);
            }
            drawEvolution();
        }
        else if (global['resource']['RNA'].amount >= 10 && !global.evolution['membrane']){
            global.evolution['membrane'] = { count: 0 };
            drawEvolution();
        }
        else if (global['resource']['DNA'].amount >= 4 && !global.evolution['organelles']){
            global.evolution['organelles'] = { count: 0 };
            drawEvolution();
        }
        else if (global.evolution['organelles'] && global.evolution.organelles.count >= 2 && !global.evolution['nucleus']){
            global.evolution['nucleus'] = { count: 0 };
            drawEvolution();
        }
        else if (global.evolution['nucleus'] && global.evolution.nucleus.count >= 1 && !global.evolution['eukaryotic_cell']){
            global.evolution['eukaryotic_cell'] = { count: 0 };
            drawEvolution();
        }
        else if (global.evolution['eukaryotic_cell'] && global.evolution.eukaryotic_cell.count >= 1 && !global.evolution['mitochondria']){
            global.evolution['mitochondria'] = { count: 0 };
            drawEvolution();
        }
        else if (global.evolution['mitochondria'] && !global.tech['evo']){
            global.tech['evo'] = 1;
            drawEvolution();
        }
    }
    else {
        // Rest of game
        let zigVal = zigguratBonus();
        let morale = 100;
        let q_multiplier = 1;
        let qs_multiplier = 1;
        if (global.race['quarantine'] && global.race['qDays']){
            let qDays = 1 - ((global.race.qDays <= 1000 ? global.race.qDays : 1000) / 1000);
            switch (global.race.quarantine){
                case 1:
                    q_multiplier = 0.5 + (0.5 * qDays);
                    break;
                case 2:
                    q_multiplier = 0.25 + (0.25 * qDays);
                    qs_multiplier = 0.5 + (0.5 * qDays);
                    break;
                case 3:
                    q_multiplier = 0.1 + (0.15 * qDays);
                    qs_multiplier = 0.25 + (0.25 * qDays);
                    break;
                case 4:
                    q_multiplier = 0.08 + (0.02 * qDays);;
                    qs_multiplier = 0.12 + (0.13 * qDays);;
                    break;
            }

            if (global.race['vax'] && global.tech['focus_cure'] && global.tech.focus_cure >= 4){
                let vax = +global.race.vax.toFixed(2) / 100;
                if (vax > 1){ vax = 1; }
                q_multiplier = q_multiplier + ((1 - q_multiplier) * vax);
                qs_multiplier = qs_multiplier + ((1 - qs_multiplier) * vax);
            }
        }

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
                morale -= global.race['leathery'] ? traits.leathery.vars()[0] : 5;
                global.city.morale.season = global.race['leathery'] ? -(traits.leathery.vars()[0]) : -5;
            }
        }
        else {
            global.city.morale.season = 0;
        }

        if (global.race['cheese']){
            let raw_cheese = global.stats.hasOwnProperty('reset') ? global.stats.reset + 1 : 1;
            let cheese = +(raw_cheese / (raw_cheese + 10) * 11).toFixed(2);
            morale += cheese;
        }

        if (global.civic['homeless']){
            morale -= global.civic.homeless / 2;
        }

        if (global.tech['vax_c'] || global.tech['vax_f']){
            morale -= global.tech['vax_c'] ? 10 : 50;
        }
        else if (global.tech['vax_s']){
            morale += 20;
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
        else {
            global.city.morale.shrine = 0;
        }

        let milVal = govActive('militant',1);
        if (milVal){
            morale -= milVal;
        }
        if (global.civic.govern.type === 'corpocracy'){
            morale -= govEffect.corpocracy()[3];
        }
        if (global.civic.govern.type === 'republic'){
            morale += govEffect.republic()[1];
        }
        if (global.civic.govern.type === 'federation'){
            morale += govEffect.federation()[1];
        }

        if (global.race['blood_thirst'] && global.race.blood_thirst_count >= 1){
            let blood_thirst = Math.ceil(Math.log2(global.race.blood_thirst_count));
            global.city.morale.blood_thirst = blood_thirst;
            morale += blood_thirst;
        }
        else {
            global.city.morale.blood_thirst = 0;
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
                        weather_morale = global.race['leathery'] ? -(traits.leathery.vars()[0]) : -5;
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

        if (global.race['motivated']){
            let boost = Math.ceil(global.race['motivated'] ** 0.4);
            morale += boost;
        }

        if (global.race['pet']){
            morale++;
            if (global.race.pet.event > 0){
                morale++;
            }
            if (global.race.pet.pet > 0){
                morale += global.race.pet.type === 'cat' ? 2 : 1
            }
            else if (global.race.pet.pet < 0){
                morale -= global.race.pet.type === 'cat' ? 2 : 1;
            }
        }

        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.fame !== 0){
            morale += global.race.wishStats.fame;
        }

        if (global.race['artisan'] && !global.race['joyless']){
            morale += traits.artisan.vars()[2] * global.civic.craftsman.workers;
        }

        let stress = 0;

        let divisor = 5;
        global.city.morale.unemployed = 0;
        if (!global.city.ptrait.includes('mellow')){
            let unemployed = global.civic.unemployed.workers / (global.race['high_pop'] ? traits.high_pop.vars()[0] : 1);
            morale -= unemployed;
            global.city.morale.unemployed = -(unemployed);
        }
        else {
            divisor *= planetTraits.mellow.vars()[0];
        }

        let vulFathom = fathomCheck('vulpine');
        if (global.civic.hunter.display && (global.race['playful'] || vulFathom > 0)){
            let val = 0;
            if (vulFathom > 0){
                val += traits.playful.vars(1)[0] * vulFathom;
            }
            if (global.race['playful']){
                val += traits.playful.vars()[0];
            }
            morale += global.civic.hunter.workers * val;
            global.city.morale.unemployed = global.civic.hunter.workers * val;
        }
        else {
            stress -= global.civic.hunter.workers / divisor;
        }

        if (global.race['optimistic']){
            stress += traits.optimistic.vars()[0];
        }
        let geckoFathom = fathomCheck('gecko');
        if (geckoFathom > 0){
            stress += traits.optimistic.vars(1)[0] * geckoFathom;
        }

        if (global.race['pessimistic']){
            stress -= traits.pessimistic.vars()[0];
        }

        if (global.civic['garrison']){
            let divisor = 2;
            if (global.city.ptrait.includes('mellow')){
                divisor *= planetTraits.mellow.vars()[0];
            }
            let army_stress = global.civic.garrison.max / divisor;
            if (global.race['high_pop']){
                army_stress /= traits.high_pop.vars()[0]
            }

            stress -= army_stress;
        }

        breakdown.p.consume.Money[loc('trade')] = 0;

        // trade routes
        if (global.tech['trade'] || (global.race['banana'] && global.tech['primitive'] && global.tech.primitive >= 3)){
            let used_trade = 0;
            let dealVal = govActive('dealmaker',0);
            if (dealVal){
                let exporting = 0;
                let importing = 0;
                Object.keys(global.resource).forEach(function(res){
                    if (global.resource[res].hasOwnProperty('trade') && global.resource[res].trade < 0){
                        exporting -= global.resource[res].trade;
                    }
                    if (global.resource[res].hasOwnProperty('trade') && global.resource[res].trade > 0){
                        importing += global.resource[res].trade;
                    }
                });
                if (exporting < importing){
                    Object.keys(global.resource).forEach(function(res){
                        global.resource[res].trade = 0;
                    });
                }
            }
            Object.keys(global.resource).forEach(function (res){
                let routes = global.resource[res].trade;
                if (routes > 0){
                    used_trade += routes;
                    let price = tradeBuyPrice(res);
                    const affordable_routes = Math.floor(global.resource.Money.amount / (price * time_multiplier));
                    routes = Math.min(routes, affordable_routes);

                    if (routes > 0){
                        price *= routes;
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
                        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.c){
                            let trade = 70 * (traits.ocular_power.vars()[1] / 100);
                            rate *= 1 + (trade / 100);
                        }
                        let fathom = fathomCheck('goblin');
                        if (fathom > 0){
                            rate *= 1 + (traits.merchant.vars(1)[1] / 100 * fathom);
                        }
                        if (astroSign === 'capricorn'){
                            rate *= 1 + (astroVal('capricorn')[0] / 100);
                        }
                        if (global.race['devious']){
                            rate *= 1 - (traits.devious.vars()[0] / 100);
                        }
                        if (global.genes['trader']){
                            let mastery = calc_mastery();
                            rate *= 1 + (mastery / 100);
                            if (global.genes.trader >= 2){
                                let coiled = global.prestige.Supercoiled.count;
                                rate *= 1 + (coiled / (coiled + 500));
                            }
                        }
                        if (global.stats.achieve.hasOwnProperty('trade')){
                            let rank = global.stats.achieve.trade.l * 2;
                            if (rank > 10){ rank = 10; }
                            rate *= 1 + (rank / 100);
                        }
                        if (global.race['truepath']){
                            rate *= 1 - (global.civic.foreign.gov3.hstl / 101);
                        }
                        modRes(res,routes * time_multiplier * rate);
                        modRes('Money', -(price * time_multiplier));
                        breakdown.p.consume.Money[loc('trade')] -= price;
                        breakdown.p.consume[res][loc('trade')] = routes * rate;
                    }
                    steelCheck();
                }
                else if (routes < 0){
                    used_trade -= routes;

                    let rate = tradeRatio[res];
                    if (global.stats.achieve.hasOwnProperty('trade')){
                        let rank = global.stats.achieve.trade.l;
                        if (rank > 5){ rank = 5; }
                        rate *= 1 - (rank / 100);
                    }

                    const affordable_routes = Math.floor(global.resource[res].amount / (rate * time_multiplier));
                    routes = Math.max(routes, -affordable_routes);
                    if (routes < 0){
                        let price = tradeSellPrice(res) * routes;
                        modRes(res,routes * time_multiplier * rate);
                        modRes('Money', -(price * time_multiplier));
                        breakdown.p.consume.Money[loc('trade')] -= price;
                        breakdown.p.consume[res][loc('trade')] = routes * rate;
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
            let totTransmute = 0;
            Object.keys(global.race.alchemy).forEach(function (res){
                if (global.race.alchemy[res] > 0){
                    let trasmute = Number(global.race.alchemy[res]);
                    if (global.resource.Mana.amount < trasmute){
                        trasmute = global.resource.Mana.amount;
                    }
                    if (global.resource.Crystal.amount < trasmute * 0.15){
                        trasmute = Math.floor(global.resource.Crystal.amount * (1/0.15));
                    }
                    totTransmute += trasmute;

                    if (trasmute >= time_multiplier){
                        let rate = global.resource[res].basic && global.tech.alchemy >= 2 ? tradeRatio[res] * 8 : tradeRatio[res] * 2;
                        if (global.race['witch_hunter']){ rate *= 3; }
                        if (global.stats.achieve['soul_sponge'] && global.stats.achieve.soul_sponge['mg']){
                            rate *= global.stats.achieve.soul_sponge.mg + 1;
                        }
                        modRes(res,trasmute * time_multiplier * rate);
                        modRes('Mana', -(trasmute * time_multiplier));
                        modRes('Crystal', -(trasmute * 0.15 * time_multiplier));
                        totMana -= trasmute;
                        totCrystal -= trasmute * 0.15;
                        breakdown.p.consume[res][loc('tab_alchemy')] = trasmute * rate;
                        if (global.race.universe === 'magic' && !global.resource[res].basic && global.tech.alchemy >= 2){
                            unlockAchieve('fullmetal');
                        }
                    }
                }
            });
            global.race['totTransmute'] = totTransmute;
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
                let fathom = fathomCheck('goblin');
                if (fathom > 0){
                    imprt_vol *= 1 + (traits.merchant.vars(1)[1] / 100 * fathom);
                }
                if (astroSign === 'capricorn'){
                    imprt_vol *= 1 + (astroVal('capricorn')[0] / 100);
                }
                if (global.race['devious']){
                    imprt_vol *= 1 - (traits.devious.vars()[0] / 100);
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
                            breakdown.p.consume['Nanite'][global.resource[r].name] = nanite_vol / time_multiplier;
                            modRes('Nanite',nanite_vol);
                        }
                    }
                }
            });
        }

        let power_grid = 0;
        let max_power = 0;

        if (global.tauceti['ringworld'] && global.tauceti.ringworld.count >= 1000){
            let output = global.race['lone_survivor'] ? 100 : 10000;
            max_power -= output;
            power_grid += output;
            power_generated[loc('tau_star_ringworld')] = output;
        }

        if (global.interstellar['elysanite_sphere'] && global.interstellar.elysanite_sphere.count > 0){
            let output = 0;
            if (global.interstellar.elysanite_sphere.count >= 1000){
                output = powerModifier(22500);
            }
            else {
                output = powerModifier(1750 + (global.interstellar.elysanite_sphere.count * 18));
            }
            max_power -= output;
            power_grid += output;
            power_generated[loc('interstellar_dyson_sphere_title')] = output;
            delete power_generated[loc('tech_dyson_net')];
        }
        else if (global.interstellar['orichalcum_sphere'] && global.interstellar.orichalcum_sphere.count > 0){
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
            let output = actions.interstellar.int_blackhole.stellar_engine.powered();
            max_power += output;
            power_grid -= output;
            power_generated[loc('tech_stellar_engine')] = -output;
        }

        [
            {r:'city',s:'coal_power'},{r:'city',s:'oil_power'},{r:'city',s:'fission_power'},{r:'spc_hell',s:'geothermal'},{r:'spc_dwarf',s:'e_reactor'},
            {r:'int_alpha',s:'fusion'},{r:'tau_home',s:'fusion_generator'},{r:'tau_gas2',s:'alien_space_station'}
        ].forEach(function(generator){
            let space = convertSpaceSector(generator.r);
            let region = generator.r === 'city' ? generator.r : space;
            let c_action = generator.r === 'city' ? actions.city : actions[space][generator.r];
            let title = typeof c_action[generator.s].title === 'string' ? c_action[generator.s].title : c_action[generator.s].title();

            if (global[region][generator.s] && global[region][generator.s]['on']){
                let watts = c_action[generator.s].powered();
                p_on[generator.s] = global[region][generator.s].on;

                if (c_action[generator.s].hasOwnProperty('p_fuel')){
                    let s_fuels = c_action[generator.s].p_fuel();
                    if (!Array.isArray(s_fuels)){
                        s_fuels = [s_fuels];
                    }
                    for (let j=0; j<s_fuels.length; j++){
                        let fuel = s_fuels[j];
                        let fuel_cost = fuel.a;
                        if (['Oil','Helium_3'].includes(fuel.r) && region !== 'city'){
                            fuel_cost = region === 'space' ? +fuel_adjust(fuel_cost,true) : +int_fuel_adjust(fuel_cost);
                        }

                        let mb_consume = p_on[generator.s] * fuel_cost;
                        breakdown.p.consume[fuel.r][title] = -(mb_consume);
                        for (let k=0; k<p_on[generator.s]; k++){
                            if (!modRes(fuel.r, -(time_multiplier * fuel_cost))){
                                mb_consume -= (p_on[generator.s] * fuel_cost) - (k * fuel_cost);
                                p_on[generator.s] = k;
                                break;
                            }
                        }
                    }
                }

                let power = p_on[generator.s] * watts;
                max_power += power;
                power_grid -= power;
                power_generated[title] = -(power);

                if (p_on[generator.s] !== global[region][generator.s].on){
                    $(`#${region}-${generator.s} .on`).addClass('warn');
                    $(`#${region}-${generator.s} .on`).prop('title',`ON ${p_on[generator.s]}/${global[region][generator.s].on}`);
                }
                else {
                    $(`#${region}-${generator.s} .on`).removeClass('warn');
                    $(`#${region}-${generator.s} .on`).prop('title',`ON`);
                }
            }
            else {
                power_generated[title] = 0;
                p_on[generator.s] = 0;
                $(`#${region}-${generator.s} .on`).removeClass('warn');
                $(`#${region}-${generator.s} .on`).prop('title',`ON`);
            }
        });

        // Uranium Ash (from coal powerplants)
        if (global.tech['uranium'] && global.tech['uranium'] >= 3 && p_on['coal_power']){
            const fuel = actions.city.coal_power.p_fuel();
            if (fuel.r === 'Coal' && fuel.a > 0){
                let coal = p_on['coal_power'] * fuel.a;
                let ash = coal / 65;
                if (global.city.geology['Uranium']){
                    ash *= global.city.geology['Uranium'] + 1;
                }
                ash *= production('psychic_boost','Uranium');
                modRes('Uranium', ash * time_multiplier);
                // Display on the right side of the breakdown to demonstrate that there is no global production scaling
                breakdown.p.consume['Uranium'][loc('city_coal_ash')] = ash;
            }
        }

        if (global.space['hydrogen_plant']){
            let output = actions.space.spc_titan.hydrogen_plant.powered();
            if (global.space.hydrogen_plant.on > global.space.electrolysis.on){
                global.space.hydrogen_plant.on = global.space.electrolysis.on;
            }
            let power = global.space.hydrogen_plant.on * output;
            max_power += power;
            power_grid -= power;
            power_generated[loc('space_hydrogen_plant_title')] = -(power);
        }

        if (global.portal['incinerator']){
            let output = actions.portal.prtl_wasteland.incinerator.powered();
            let power = global.portal.incinerator.on * output;
            max_power += power;
            power_grid -= power;
            power_generated[loc('portal_incinerator_title')] = -(power);
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

        if (global.eden['soul_engine'] && global.tech['asphodel'] && global.tech.asphodel >= 4){
            let power = (support_on['soul_engine'] || 0) * actions.eden.eden_asphodel.soul_engine.powered();
            max_power += power;
            power_grid -= power;
            power_generated[loc('eden_soul_engine_title')] = -(power);
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

        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.potato){
            let power = powerModifier(global.race.wishStats.potato);
            max_power -= power;
            power_grid += power;
            power_generated[loc('wish_potato')] = power;
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

        if (global.race['elemental'] && traits.elemental.vars()[0] === 'electric'){
            let power = powerModifier(highPopAdjust((global.resource[global.race.species].amount * traits.elemental.vars()[1]) ** 1.28));
            max_power -= power;
            power_grid += power;
            power_generated[loc('trait_elemental_name')] = power;
        }

        if (global.race['powered']){
            let citizens = traits.powered.vars()[0] * global.resource[global.race.species].amount;
            if (global.race['discharge'] && global.race['discharge'] > 0){
                citizens = +(citizens * 1.25).toFixed(3);
            }
            power_grid -= citizens;
        }

        if (global.race['replicator']){
            global.city['replicator'] = { count: global.race.replicator.pow, on: global.race.replicator.pow };
        }

        // Power usage
        let p_structs = global.power;

        // Determine total power demand across all structs and get a list of powered structs that support load balancing
        let totalPowerDemand = 0;
        let pb_list = [];
        for (let i=0; i<p_structs.length; i++){
            const parts = p_structs[i].split(":");
            const struct = parts[1];
            const region = parts[0] === 'city' ? parts[0] : convertSpaceSector(parts[0]);
            const c_action = parts[0] === 'city' ? actions.city[struct] : actions[region][parts[0]][struct];
            if (global[region][struct]?.on){
                if (checkPowerRequirements(c_action) && (region !== 'galaxy' || p_on['s_gate'])){
                    totalPowerDemand += global[region][struct].on * c_action.powered();
                    p_on[struct] = global[region][struct].on;
                } else {
                    p_on[struct] = 0;
                }
            }
            if (global.settings.lowPowerBalance && c_action.hasOwnProperty('powerBalancer')){
                pb_list.push(p_structs[i]);
            }
        }

        // When short of power, proportionally reduce power demanded by supported structures (starting from lowest priority)
        if (global.settings.lowPowerBalance && totalPowerDemand > power_grid){
            let totalPowerUsage = totalPowerDemand;
            for (let i=pb_list.length-1; i >= 0; i--){
                const parts = pb_list[i].split(":");
                const struct = parts[1];
                let on = p_on[struct];

                if (totalPowerUsage > power_grid && on > 0){
                    const region = parts[0] === 'city' ? parts[0] : convertSpaceSector(parts[0]);
                    const c_action = parts[0] === 'city' ? actions.city[struct] : actions[region][parts[0]][struct];

                    let balValues = c_action.powerBalancer();
                    if (balValues){
                        balValues.forEach(function(v){
                            let off = 0;
                            if (v.hasOwnProperty('r') && v.hasOwnProperty('k')){
                                let val = global[region][struct][v.k] ?? 0;
                                if (global.resource[v.r]['odif'] && global.resource[v.r]['odif'] < 0) { global.resource[v.r]['odif'] = 0; }
                                let diff = global.resource[v.r].diff + (global.resource[v.r]['odif'] ? global.resource[v.r]['odif'] : 0);
                                while (diff - (off * val) > val && on > 0 && totalPowerUsage > power_grid){
                                    on--;
                                    off++;
                                    totalPowerUsage -= c_action.powered();
                                }
                                global.resource[v.r]['odif'] = val * off;
                            }
                            else if (v.hasOwnProperty('s')){
                                let sup = c_action.support();
                                if (global[region][struct]['soff'] && global[region][struct]['soff'] < 0) { global[region][struct]['soff'] = 0; }
                                let support = v.s + (global[region][struct]['soff'] ? global[region][struct]['soff'] : 0);
                                while (support - (sup * off) >= sup && on > 0 && totalPowerUsage > power_grid){
                                    on--;
                                    off++;
                                    totalPowerUsage -= c_action.powered();
                                }
                                global[region][struct]['soff'] = sup * off;
                            }
                        });
                        p_on[struct] = on;
                    }
                }
            }
        }

        // Power structures in priority order
        let power_grid_temp = power_grid;
        for (let i=0; i<p_structs.length; i++){
            const parts = p_structs[i].split(":");
            const struct = parts[1];
            const region = parts[0] === 'city' ? parts[0] : convertSpaceSector(parts[0]);
            const c_action = parts[0] === 'city' ? actions.city[struct] : actions[region][parts[0]][struct];
            if (global[region][struct]?.on){
                let power = p_on[struct] * c_action.powered();
                // Use a loop specifically because of citadel stations, which have variable power cost. Other buildings would accept a closed form.
                while (power > power_grid_temp && power > 0){
                    p_on[struct]--;
                    power = p_on[struct] * c_action.powered();
                }

                if (c_action.hasOwnProperty('p_fuel')){
                    let s_fuels = c_action.p_fuel();
                    if (!Array.isArray(s_fuels)){
                        s_fuels = [s_fuels];
                    }
                    for (let j=0; j<s_fuels.length; j++){
                        const title = typeof c_action.title === 'string' ? c_action.title : c_action.title();
                        const fuel = s_fuels[j];
                        const fuel_cost = ['Oil','Helium_3'].includes(fuel.r) && region === 'space' ? fuel_adjust(fuel.a,true) : fuel.a;
                        let mb_consume = p_on[struct] * fuel_cost;
                        for (let k=0; k<p_on[struct]; k++){
                            if (!modRes(fuel.r, -(time_multiplier * fuel_cost))){
                                mb_consume = k * fuel_cost;
                                p_on[struct] = k;
                                power = p_on[struct] * c_action.powered();
                                break;
                            }
                        }
                        breakdown.p.consume[fuel.r][title] = -(mb_consume);
                    }
                }
                power_grid_temp -= power;

                if (p_on[struct] !== global[region][struct].on){
                    $(`#${region}-${struct} .on`).addClass('warn');
                    $(`#${region}-${struct} .on`).prop('title',`ON ${p_on[struct]}/${global[region][struct].on}`);
                    // Remove the reset actions for reset structures that lose power
                    if (['matrix', 'atmo_terraformer', 'ascension_trigger'].includes(struct)){
                        callback_queue.set([c_action, 'postPower'], [true]);
                    }
                }
                else {
                    $(`#${region}-${struct} .on`).removeClass('warn');
                    $(`#${region}-${struct} .on`).prop('title',`ON`);
                }
            }
            else {
                p_on[struct] = 0;
                $(`#${region}-${struct} .on`).removeClass('warn');
                $(`#${region}-${struct} .on`).prop('title',`ON`);
            }
        }
        power_grid -= totalPowerDemand;

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

                let total = garrisonSize(false,{nofob: true});
                let troopReq = jobScale(3);
                let deployed = support_on['lander'] * troopReq;
                if (deployed <= total){
                    global.space.fob.troops = deployed;
                }
                else {
                    support_on['lander'] -= Math.ceil((deployed - total) / troopReq);
                    global.space.fob.troops = support_on['lander'] * troopReq;
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
                    $(`#space-lander .on`).prop('title',`ON ${support_on['lander']}/${global.space.lander.on}`);
                }
                else {
                    $(`#space-lander .on`).removeClass('warn');
                    $(`#space-lander .on`).prop('title',`ON`);
                }
            }
            else {
                global.space.fob.troops = 0;
                $(`#space-lander .on`).addClass('warn');
                $(`#space-lander .on`).prop('title',`ON 0/${global.space.lander.on}`);
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

        if(global.race['fasting']){
            const foodBuildings = ["city:tourist_center", "space:spaceport", "int_:starport", "gxy_:starbase"/*, "space:space_station", "space:embassy"*/, "space:space_barracks", "int_:zoo", "eden_:restaurant"];
            //titan quarters is excluded but not necessary because the scenario is incompatible with true path.
            //some buildings are excluded to make progression not impossible.
            for(let i=0;i<foodBuildings.length;i++){
                let parts = foodBuildings[i].split(":");
                let space = convertSpaceSector(parts[0]);
                let region = parts[0] === 'city' ? parts[0] : space;
                if (global[region][parts[1]] && global[region][parts[1]]['on']){
                    if(p_on[parts[1]]){
                        p_on[parts[1]] = 0;
                    }
                    $(`#${region}-${parts[1]} .on`).addClass('warn');
                    $(`#${region}-${parts[1]} .on`).prop('title',`ON 0`);
                }else {
                    $(`#${region}-${parts[1]} .on`).removeClass('warn');
                    $(`#${region}-${parts[1]} .on`).prop('title',`ON`);
                }
            }
            global.civic.meditator.display = true;
        }

        // Moon Bases, Spaceports, Etc
        [
            { a: 'space', r: 'spc_moon', s: 'moon_base', g: 'moon' },
            { a: 'space', r: 'spc_red', s: 'spaceport', g: 'red' },
            { a: 'space', r: 'spc_titan', s: 'electrolysis', g: 'titan' },
            { a: 'space', r: 'spc_titan', r2: 'spc_enceladus', s: 'titan_spaceport', g: 'enceladus' },
            { a: 'space', r: 'spc_eris', s: 'drone_control', g: 'eris' },
            { a: 'tauceti', r: 'tau_home', s: 'orbital_station', g: 'tau_home' },
            { a: 'tauceti', r: 'tau_red', s: 'orbital_platform', g: 'tau_red' },
            { a: 'tauceti', r: 'tau_roid', s: 'patrol_ship', g: 'tau_roid', oc: true },
            { a: 'eden', r: 'eden_asphodel', s: 'encampment', g: 'asphodel' },
        ].forEach(function(sup){
            sup['r2'] = sup['r2'] || sup.r;
            if (global[sup.a][sup.s] && global[sup.a][sup.s].count > 0){
                if (!p_structs.includes(`${sup.r}:${sup.s}`)){
                    p_on[sup.s] = global[sup.a][sup.s].on;
                }

                if (actions[sup.a][sup.r][sup.s].hasOwnProperty('support_fuel')){
                    let s_fuels = actions[sup.a][sup.r][sup.s].support_fuel();
                    if (!Array.isArray(s_fuels)){
                        s_fuels = [s_fuels];
                    }
                    for (let j=0; j<s_fuels.length; j++){
                        let fuel = s_fuels[j];
                        let fuel_cost = ['Oil','Helium_3'].includes(fuel.r) ? (sup.a === 'space' ? +fuel_adjust(fuel.a,true) : +int_fuel_adjust(fuel.a)) : fuel.a;
                        let mb_consume = p_on[sup.s] * fuel_cost;
                        breakdown.p.consume[fuel.r][actions[sup.a][sup.r][sup.s].title] = -(mb_consume);
                        for (let i=0; i<p_on[sup.s]; i++){
                            if (!modRes(fuel.r, -(time_multiplier * fuel_cost))){
                                mb_consume -= (p_on[sup.s] * fuel_cost) - (i * fuel_cost);
                                p_on[sup.s] = i;
                                break;
                            }
                        }
                        if (p_on[sup.s] < global[sup.a][sup.s].on){
                            $(`#space-${sup.s} .on`).addClass('warn');
                            $(`#space-${sup.s} .on`).prop('title',`ON ${p_on[sup.s]}/${global[sup.a][sup.s].on}`);
                        }
                        else {
                            $(`#space-${sup.s} .on`).removeClass('warn');
                            $(`#space-${sup.s} .on`).prop('title',`ON`);
                        }
                    }
                }

                global[sup.a][sup.s].s_max = p_on[sup.s] * actions[sup.a][sup.r][sup.s].support();
                switch (sup.g){
                    case 'moon':
                        {
                            global[sup.a][sup.s].s_max += global.tech['luna'] && global.tech['luna'] >= 2 ? p_on['nav_beacon'] * actions.space.spc_home.nav_beacon.support() : 0;
                        }
                        break;
                    case 'red':
                        {
                            global[sup.a][sup.s].s_max += global.tech['mars'] && global.tech['mars'] >= 3 ? p_on['red_tower'] * actions.space.spc_red.red_tower.support() : 0;
                            global[sup.a][sup.s].s_max += global.tech['luna'] && global.tech['luna'] >= 3 ? p_on['nav_beacon'] * actions.space.spc_home.nav_beacon.support() : 0;
                        }
                        break;
                    case 'tau_home':
                        {
                            global[sup.a][sup.s].s_max += p_on['tau_farm'] ? p_on['tau_farm'] : 0;
                        }
                        break;
                    case 'asphodel':
                        {
                            global[sup.a][sup.s].s_max += (p_on['rectory'] ? p_on['rectory'] : 0) * actions.eden.eden_asphodel.rectory.support();
                            global[sup.a][sup.s].s_max += (p_on['corruptor'] ? p_on['corruptor'] : 0) * actions.eden.eden_asphodel.corruptor.support();
                        }
                        break;
                }
            }

            if (global[sup.a][sup.s] && sup.r === 'spc_eris' && !p_on['ai_core2']){
                global[sup.a][sup.s].s_max = 0;
            }

            if (global[sup.a][sup.s]){
                let used_support = 0;
                let area_structs = global.support[sup.g].map(x => x.split(':')[1]);
                for (var i = 0; i < area_structs.length; i++){
                    if (global[sup.a][area_structs[i]]){
                        let id = actions[sup.a][sup.r2][area_structs[i]].id;
                        let supportSize = actions[sup.a][sup.r2][area_structs[i]].hasOwnProperty('support') ? actions[sup.a][sup.r2][area_structs[i]].support() * -1 : 1;
                        let operating = global[sup.a][area_structs[i]].on;
                        let remaining_support = global[sup.a][sup.s].s_max - used_support;

                        if ((operating * supportSize > remaining_support) && !sup.oc){
                            operating = Math.floor(remaining_support / supportSize);
                            $(`#${id} .on`).addClass('warn');
                            $(`#${id} .on`).prop('title',`ON ${operating}/${global[sup.a][area_structs[i]].on}`);
                        }
                        else {
                            $(`#${id} .on`).removeClass('warn');
                            $(`#${id} .on`).prop('title',`ON`);
                        }

                        if (actions[sup.a][sup.r2][area_structs[i]].hasOwnProperty('support_fuel')){
                            let s_fuels = actions[sup.a][sup.r2][area_structs[i]].support_fuel();
                            if (!Array.isArray(s_fuels)){
                                s_fuels = [s_fuels];
                            }
                            for (let j=0; j<s_fuels.length; j++){
                                let fuel = s_fuels[j];
                                let fuel_cost = ['Oil','Helium_3'].includes(fuel.r) ? (sup.a === 'space' ? +fuel_adjust(fuel.a,true) : +int_fuel_adjust(fuel.a)) : fuel.a;
                                let mb_consume = operating * fuel_cost;
                                breakdown.p.consume[fuel.r][actions[sup.a][sup.r2][area_structs[i]].title] = -(mb_consume);
                                for (let i=0; i<operating; i++){
                                    if (!modRes(fuel.r, -(time_multiplier * fuel_cost))){
                                        mb_consume -= (operating * fuel_cost) - (i * fuel_cost);
                                        operating -= i;
                                        break;
                                    }
                                }
                            }
                        }

                        used_support += operating * supportSize;
                        support_on[area_structs[i]] = operating;
                    }
                    else {
                        support_on[area_structs[i]] = 0;
                    }
                }
                global[sup.a][sup.s].support = used_support;
            }
        });

        let womling_technician = 1;
        if (global.tech['womling_technicians']){
            womling_technician = 1 + (p_on['womling_station'] * (global.tech['isolation'] ? 0.30 : 0.08));
            if (global.tech['womling_gene']){
                womling_technician *= 1.25;
            }
        }

        // Space Marines
        if (global.space['space_barracks'] && !global.race['fasting']){
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
            breakdown.p.consume.Helium_3[structName('factory')] = -(h_consume);
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
                        $(`#${id} .on`).prop('title',`ON ${operating}/${global.interstellar[structs[i]].on}`);
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                        $(`#${id} .on`).prop('title',`ON`);
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
                let on_droid = int_on['mining_droid'];
                let max_droid = global.interstellar.mining_droid.on;
                let eff = max_droid > 0 ? on_droid / max_droid : 0;
                let remaining = max_droid;

                ['adam','uran','coal','alum'].forEach(function(res){
                    remaining -= global.interstellar.mining_droid[res];
                    if (remaining < 0) {
                        global.interstellar.mining_droid[res] += remaining;
                        remaining = 0;
                    }
                    miner_droids[res] = global.interstellar.mining_droid[res] * eff;
                });
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
            if (p_on['s_gate']){
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
            else {
                global.galaxy.starbase.s_max = 0;
            }
        }

        if (global.galaxy['starbase']){
            let used_support = 0;
            let gateway_structs = global.support.gateway.map(x => x.split(':')[1]);
            for (var i = 0; i < gateway_structs.length; i++){
                if (global.galaxy[gateway_structs[i]]){
                    let operating = global.galaxy[gateway_structs[i]].on;
                    let id = actions.galaxy.gxy_gateway[gateway_structs[i]].id;
                    let operating_cost = -(actions.galaxy.gxy_gateway[gateway_structs[i]].support());
                    let max_operating = Math.floor((global.galaxy.starbase.s_max - used_support) / operating_cost);
                    if (operating > max_operating){
                        operating = max_operating;
                        $(`#${id} .on`).addClass('warn');
                        $(`#${id} .on`).prop('title',`ON ${operating}/${global.galaxy[gateway_structs[i]].on}`);
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                        $(`#${id} .on`).prop('title',`ON`);
                    }
                    used_support += operating * operating_cost;
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
            global.galaxy.foothold.s_max = p_on['s_gate'] * p_on['foothold'] * actions.galaxy.gxy_alien2.foothold.support();
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
                if (army < jobScale(global.portal.guard_post.on)){
                    global.portal.guard_post.on = Math.floor(army / jobScale(1));
                }
            }

            global.portal.guard_post.support = global.portal.guard_post.on;
        }

        // harbor
        if (global.portal['harbor']){
            global.portal.harbor.s_max = p_on['harbor'] * actions.portal.prtl_lake.harbor.support();
        }

        // Purifier
        if (global.portal['purifier']){
            global.portal.purifier.s_max = +(p_on['purifier'] * actions.portal.prtl_spire.purifier.support()).toFixed(2);

            let used_support = 0;
            let purifier_structs = global.support.spire.map(x => x.split(':')[1]);
            for (var i = 0; i < purifier_structs.length; i++){
                if (global.portal[purifier_structs[i]]){
                    let operating = global.portal[purifier_structs[i]].on;
                    let id = actions.portal.prtl_spire[purifier_structs[i]].id;
                    if (used_support + operating > global.portal.purifier.s_max){
                        operating -= (used_support + operating) - global.portal.purifier.s_max;
                        $(`#${id} .on`).addClass('warn');
                        $(`#${id} .on`).prop('title',`ON ${operating}/${global.portal[purifier_structs[i]].on}`);
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                        $(`#${id} .on`).prop('title',`ON`);
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
                        $(`#${id} .on`).prop('title',`ON ${operating}/${global.space[belt_structs[i]].on}`);
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                        $(`#${id} .on`).prop('title',`ON`);
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
                        $(`#${id} .on`).prop('title',`ON ${operating}/${global.interstellar[structs[i]].on}`);
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                        $(`#${id} .on`).prop('title',`ON`);
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

        // Pillbox
        if (global.eden['pillbox']){
            let pillsize = jobScale(10);
            if (p_on['pillbox']){
                var staff = p_on['pillbox'] * pillsize;
                let soldiers = garrisonSize(false,{nopill: true});
                if (soldiers < staff){
                    staff = Math.floor(soldiers / pillsize) * pillsize;
                }
                global.eden.pillbox.staffed = staff;
            }
            else {
                global.eden.pillbox.staffed = 0;
            }

            if (global.eden.pillbox.staffed < p_on['pillbox'] * pillsize){
                $(`#eden-pillbox .on`).addClass('warn');
            }
            else {
                $(`#eden-pillbox .on`).removeClass('warn')
            }
        }

        // Graphene Hack
        if (global.tech['isolation'] && global.race['truepath']){
            support_on['g_factory'] = p_on['refueling_station'];
            global.space.g_factory.count = global.tauceti.refueling_station.count;
            global.space.g_factory.on = global.tauceti.refueling_station.on;
        }

        if (global.race['replicator'] && p_on['replicator']){
            let res = global.race.replicator.res;
            if (!['Asphodel_Powder','Elysanite'].includes(res)){
                let vol = replicator(res,p_on['replicator']);
                breakdown.p.consume[res][loc('tau_replicator_db')] = vol;
                modRes(res, time_multiplier * vol);
            }
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

        let crew_civ = 0;
        let crew_mil = 0;
        let total = 0;
        let andromeda_helium = 0;
        let andromeda_deuterium = 0;

        for (let j=0; j<galaxy_ship_types.length; j++){
            const area = galaxy_ship_types[j].area;
            const region = galaxy_ship_types[j].region;
            const req = galaxy_ship_types[j].hasOwnProperty('req') ? p_on[galaxy_ship_types[j].req] > 0 : true;
            const support_home = actions[area][region].info?.support;
            let used_support = 0;
            for (let i=0; i<galaxy_ship_types[j].ships.length; i++){
                const ship = galaxy_ship_types[j].ships[i];
                if (global[area][ship]){
                    let operating = 0;
                    if (global[area][ship].hasOwnProperty('on') && req && (p_on['s_gate'] || area !== 'galaxy')){
                        const id = actions[area][region][ship].id;
                        const num_on = global[area][ship].on;
                        operating = num_on;

                        // Support cost
                        const operating_cost = actions[area][region][ship].hasOwnProperty('support') ? -(actions[area][region][ship].support()) : 0;
                        if (operating_cost > 0){
                            const max_operating = Math.floor((global[area][support_home].s_max - used_support) / operating_cost);
                            operating = Math.min(operating, max_operating);
                        }

                        if (actions[area][region][ship].hasOwnProperty('ship')){
                            if (actions[area][region][ship].ship.civ && global[area][ship].hasOwnProperty('crew')){
                                // Civilian ships can only be crewed at a rate of 1 ship (per type) per fast tick
                                let civPerShip = actions[area][region][ship].ship.civ();
                                if (civPerShip > 0){
                                    if (global[area][ship].crew < 0){
                                        global[area][ship].crew = 0;
                                    }
                                    if (global[area][ship].crew < operating * civPerShip){
                                        if (total < global.resource[global.race.species].amount){
                                            if (global.civic[global.civic.d_job].workers >= civPerShip){
                                                global.civic[global.civic.d_job].workers -= civPerShip;
                                                global.civic.crew.workers += civPerShip;
                                                global[area][ship].crew += civPerShip;
                                            }
                                        }
                                    }
                                    else if (global[area][ship].crew > operating * civPerShip){
                                        global.civic[global.civic.d_job].workers += civPerShip;
                                        global.civic.crew.workers -= civPerShip;
                                        global[area][ship].crew -= civPerShip;
                                    }
                                    global.civic.crew.assigned = global.civic.crew.workers;
                                    crew_civ += global[area][ship].crew;
                                    total += global[area][ship].crew;
                                    operating = Math.min(operating, Math.floor(global[area][ship].crew / civPerShip));
                                }
                            }

                            if (actions[area][region][ship].ship.mil && global[area][ship].hasOwnProperty('mil')){
                                // All military ships can be crewed instantly
                                let milPerShip = actions[area][region][ship].ship.mil();
                                if (milPerShip > 0){
                                    if (global[area][ship].mil !== operating * milPerShip){
                                        global[area][ship].mil = operating * milPerShip;
                                    }
                                    if (global.civic.garrison.workers - global.portal.fortress.garrison < 0){
                                        let underflow = global.civic.garrison.workers - global.portal.fortress.garrison;
                                        global[area][ship].mil -= underflow;
                                    }
                                    if (crew_mil + global[area][ship].mil > global.civic.garrison.workers - global.portal.fortress.garrison){
                                        global[area][ship].mil = global.civic.garrison.workers - global.portal.fortress.garrison - crew_mil;
                                    }
                                    if (global[area][ship].mil < 0){
                                        global[area][ship].mil = 0;
                                    }
                                    crew_mil += global[area][ship].mil;
                                    operating = Math.min(operating, Math.floor(global[area][ship].mil / milPerShip));
                                }
                            }

                            if (actions[area][region][ship].ship.hasOwnProperty('helium')){
                                let increment = +int_fuel_adjust(actions[area][region][ship].ship.helium).toFixed(2);
                                let consume = operating * increment;
                                while (consume * time_multiplier > global.resource.Helium_3.amount + (global.resource.Helium_3.diff > 0 ? global.resource.Helium_3.diff * time_multiplier : 0) && operating > 0){
                                    consume -= increment;
                                    operating--;
                                }
                                modRes('Helium_3', -(consume * time_multiplier));
                                andromeda_helium += consume;
                            }

                            if (actions[area][region][ship].ship.hasOwnProperty('deuterium')){
                                let increment = +int_fuel_adjust(actions[area][region][ship].ship.deuterium).toFixed(2);
                                let consume = operating * increment;
                                while (consume * time_multiplier > global.resource.Deuterium.amount + (global.resource.Deuterium.diff > 0 ? global.resource.Deuterium.diff * time_multiplier : 0) && operating > 0){
                                    consume -= increment;
                                    operating--;
                                }
                                modRes('Deuterium', -(consume * time_multiplier));
                                andromeda_deuterium += consume;
                            }
                        }

                        if (operating < num_on){
                            $(`#${id} .on`).addClass('warn');
                            $(`#${id} .on`).prop('title',`ON ${operating}/${num_on}`);
                        }
                        else {
                            $(`#${id} .on`).removeClass('warn');
                            $(`#${id} .on`).prop('title',`ON`);
                        }

                        used_support += operating * operating_cost;
                    }
                    gal_on[ship] = operating;
                }
            }
            if (support_home && global?.[area]?.[support_home]?.hasOwnProperty('support')){
                global[area][support_home].support = used_support;
            }
        }

        breakdown.p.consume.Helium_3[loc('galaxy_fuel_consume')] = -(andromeda_helium);
        breakdown.p.consume.Deuterium[loc('galaxy_fuel_consume')] = -(andromeda_deuterium);

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
                    if (!global.civic[job].display || global.civic[job].workers < 0){
                        global.civic[job].workers = 0;
                    }
                }
                if (job !== 'unemployed' && job !== 'hunter' && job !== 'forager'){
                    let stress_level = global.civic[job].stress;
                    if (global.city.ptrait.includes('mellow')){
                        stress_level += planetTraits.mellow.vars()[1];
                    }
                    if (global.race['content']){
                        let effectiveness = job === 'hell_surveyor' ? 0.2 : 0.4;
                        stress_level += global.race['content'] * effectiveness;
                    }
                    if (global.city.ptrait.includes('dense') && job === 'miner'){
                        stress_level -= planetTraits.dense.vars()[1];
                    }
                    if (global.race['freespirit'] && job !== 'farmer' && job !== 'lumberjack' && job !== 'quarry_worker' && job !== 'crystal_miner' && job !== 'scavenger'){
                        stress_level /= 1 + (traits.freespirit.vars()[0] / 100);
                    }

                    let workers = global.civic[job].workers;
                    if (global.race['high_pop']){
                        workers /= traits.high_pop.vars()[0];
                    }

                    if (global.race['sky_lover'] && ['miner','coal_miner','crystal_miner','pit_miner'].includes(job)){
                        workers *= 1 + (traits.sky_lover.vars()[0] / 100);
                    }

                    stress -= workers / stress_level;
                }
            }
        });
        global.civic[global.civic.d_job].workers += global.resource[global.race.species].amount - total;
        if (global.civic[global.civic.d_job].workers < 0){
            global.civic[global.civic.d_job].workers = 0;
        }

        Object.keys(job_desc).forEach(function (job){
            if (job !== 'craftsman' && global.civic[job] && global.civic[job].display && global.civic[job].workers < global.civic[job].assigned && global.civic[global.civic.d_job].workers > 0 && global.civic[job].workers < global.civic[job].max){
                global.civic[job].workers++;
                global.civic[global.civic.d_job].workers--;
            }
        });

        let entertainment = 0;
        if (global.tech['theatre'] && !global.race['joyless']){
            entertainment += workerScale(global.civic.entertainer.workers,'entertainer') * global.tech.theatre;
            if (global.race['musical']){
                entertainment += workerScale(global.civic.entertainer.workers,'entertainer') * traits.musical.vars()[0];
            }
            if (astroSign === 'sagittarius'){
                entertainment *= 1 + (astroVal('sagittarius')[0] / 100);
            }
            if (global.race['emotionless']){
                entertainment *= 1 - (traits.emotionless.vars()[0] / 100);
            }
            if (global.race['high_pop']){
                entertainment *= traits.high_pop.vars()[1] / 100;
            }
        }
        if (global.civic.govern.type === 'democracy'){
            let democracy = 1 + (govEffect.democracy()[0] / 100);
            entertainment *= democracy;
        }
        global.city.morale.entertain = entertainment;
        morale += entertainment;

        if (global.tech['broadcast'] && !global.race['joyless']){
            let gasVal = govActive('gaslighter',0) || 0;
            let signalVal;
            let mVal = gasVal + global.tech.broadcast;
            if (global.race['orbit_decayed']) {
                signalVal = p_on['nav_beacon'] || 0;
                mVal /= 2; // 50% effectiveness also applies to Media governor
            }
            else if (global.tech['isolation'] && global.race['truepath']){
                signalVal = support_on['colony'];
                mVal *= 2;
            }
            else {
                signalVal = p_on['wardenclyffe'];
            }
            global.city.morale.broadcast = signalVal * mVal;
            morale += signalVal * mVal;
        }
        else {
            global.city.morale.broadcast = 0;
        }
        if (support_on['vr_center'] && !global.race['joyless']){
            let gasVal = govActive('gaslighter',1) || 0;
            let vr_morale = gasVal + 1;
            if (global.race['orbit_decayed']){
                vr_morale += 2;
            }
            global.city.morale.vr = support_on['vr_center'] * vr_morale;
            morale += support_on['vr_center'] * vr_morale;
        }
        else {
            global.city.morale.vr = 0;
        }
        if (int_on['zoo'] && !global.race['fasting']){
            global.city.morale.zoo = int_on['zoo'] * 5;
            morale += int_on['zoo'] * 5;
        }
        else {
            global.city.morale.zoo = 0;
        }
        if (p_on['tavern'] && !global.race['joyless']){
            global.city.morale.tavern = p_on['tavern'] * p_on['shadow_mine'] * 0.35;
            morale += p_on['tavern'] * p_on['shadow_mine'] * 0.35;
        }
        else {
            global.city.morale.tavern = 0;
        }
        if (support_on['bliss_den'] && !global.race['joyless']){
            global.city.morale.bliss_den = support_on['bliss_den'] * 8;
            morale += support_on['bliss_den'] * 8;
        }
        else {
            global.city.morale.bliss_den = 0;
        }
        if (p_on['restaurant'] && !global.race['fasting'] && !global.race['joyless']){
            let val = 0;
            val += global.eden.hasOwnProperty('pillbox') && p_on['pillbox'] ? 0.35 * p_on['pillbox'] : 0;
            val += global.civic.elysium_miner.workers * 0.15;
            val += global.eden.hasOwnProperty('archive') && p_on['archive'] ? 0.4 * p_on['archive'] : 0;
            global.city.morale.restaurant = p_on['restaurant'] * val;
            morale += p_on['restaurant'] * val;
        }
        else {
            global.city.morale.restaurant = 0;
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
            stress *= 1 + (govEffect.autocracy()[0] / 100);
        }
        if (global.civic.govern.type === 'socialist'){
            stress *= 1 + (govEffect.socialist()[2] / 100);
        }
        if (global.race['emotionless']){
            stress *= 1 - (traits.emotionless.vars()[1] / 100);
        }
        for (let i=0; i<3; i++){
            if (global.civic.govern.type !== 'federation' && global.civic.foreign[`gov${i}`].anx){
                stress *= 1.1;
            }
        }

        if (global.civic.govern.type === 'dictator'){
            stress *= 1 + (govEffect.dictator()[0] / 100);
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
            let immoral = global.race['immoral'] ? 1 + (traits.immoral.vars()[0] / 100) : 1;
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
        mBaseCap += global.tauceti['tauceti_casino'] ? p_on['tauceti_casino'] : 0;
        mBaseCap += global.portal['hell_casino'] ? p_on['hell_casino'] : 0;

        if (global.city['amphitheatre']){
            let athVal = govActive('athleticism',0);
            mBaseCap += athVal ? (global.city.amphitheatre.count * athVal) : global.city.amphitheatre.count;
        }
        if (support_on['vr_center']){
            mBaseCap += support_on['vr_center'] * 2;
        }
        if (int_on['zoo'] && !global.race['fasting']){
            mBaseCap += int_on['zoo'] * 2;
        }
        if (support_on['bliss_den']){
            mBaseCap += support_on['bliss_den'] * 2;
        }
        if (p_on['resort']){
            mBaseCap += p_on['resort'] * 2;
        }
        if (global.eden['rushmore'] && global.eden.rushmore.count === 1){
            mBaseCap += 10;
        }
        if (global.tech['superstar']){
            let mcapval = global.race['high_pop'] ? highPopAdjust(1) : 1;
            mBaseCap += workerScale(global.civic.entertainer.workers,'entertainer') * mcapval;
        }
        moraleCap = mBaseCap;

        if (global.tech['monuments']){
            let gasVal = govActive('gaslighter',2);
            let mcap = gasVal ? (2 - gasVal) : 2;
            let monuments = global.tech.monuments;
            if (global.race['wish'] && global.race['wishStats']){
                if (global.city['wonder_lighthouse']){ monuments += 5; }
                if (global.city['wonder_pyramid']){ monuments += 5; }
                if (global.space['wonder_statue']){ monuments += 5; }
                if (global.interstellar['wonder_gardens'] || global.space['wonder_gardens'] || global.portal['wonder_gardens']){ monuments += 5; }
            }
            moraleCap += monuments * mcap;
        }

        if (global.civic.taxes.tax_rate < 20 && !global.race['banana']){
            moraleCap += 10 - Math.floor(global.civic.taxes.tax_rate / 2);
        }

        if (global.stats.achieve['joyless']){
            moraleCap += global.stats.achieve['joyless'].l * 2;
        }

        if (global.race['motivated']){
            let boost = Math.ceil(global.race['motivated'] ** 0.4);
            moraleCap += Math.round(boost / 2);
        }

        let m_min = 50;
        if (global.race['optimistic']){
            m_min += traits.optimistic.vars()[1];
        }
        if (geckoFathom > 0){
            m_min += Math.round(traits.optimistic.vars(1)[1] * geckoFathom);
        }
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

        if (global.race['tormented']){
            if (morale > 100){
                let excess = morale - 100;
                excess = Math.ceil(excess * traits.tormented.vars()[0] / 100);
                morale -= excess;
                global.city['tormented'] = excess;
            }
            else {
                global.city['tormented'] = 0;
            }
        }
        else {
            delete global.city['tormented'];
        }

        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.bad > 0){
            let badPress = Math.floor(global.race.wishStats.bad / 75) + 1;
            morale -= badPress * 5;
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
                breakdown.p['Global'][loc('morale')] = +(global.city.morale.current - 100).toFixed(2) + '%';
            }
        }
        else {
            global_multiplier *= 1 + ((global.city.morale.current - 100) / 200);
            breakdown.p['Global'][loc('morale')] = +((global.city.morale.current - 100) / 2).toFixed(2) + '%';
        }

        if (global.race['lazy'] && global.city.calendar.temp === 2){
            breakdown.p['Global'][loc('trait_lazy_bd')] = '-' + traits.lazy.vars()[0] + '%';
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

        if (global.civic.govern.type === 'dictator'){
            breakdown.p['Global'][loc('wish_dictator')] = `+${govEffect.dictator()[1]}%`;
            global_multiplier *= 1 + (govEffect.dictator()[1] / 100);
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
            let cargoSize = global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 4 ? 8 : 5;
            Object.keys(global.portal.transport.cargo).forEach(function (res){
                if (supplyValue[res]){
                    let shipped = global.portal.transport.cargo[res];
                    if (total + shipped > gal_on['transport'] * cargoSize){
                        shipped = gal_on['transport'] * cargoSize - total;
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
            if (global.tech['hell_lake'] && global.tech.hell_lake >= 7 && global.tech['railway']){
                supply *= 1 + (global.tech.railway / 100);
            }
            if (global.portal['mechbay']){
                for (let i = 0; i < global.portal.mechbay.active; i++) {
                    let mech = global.portal.mechbay.mechs[i];
                    if (mech.size === 'collector') {
                        supply += mechCollect(mech) * time_multiplier;
                    }
                    else if (mech.size === 'minion' && mech.equip.includes('scavenger')){
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
                let rotPercent = traits.carnivore.vars()[0] / 100;
                let rot = +((global.resource['Food'].amount - 10) * (rotPercent)).toFixed(3);
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
                if(global.race['high_pop']){
                    pop /= traits.high_pop.vars()[0];
                }
                let res_cost = pop * traits.gnawer.vars()[0];
                breakdown.p.consume[res][loc('trait_gnawer_bd')] = -(res_cost);
                modRes(res, -(res_cost * time_multiplier));
            }
        }

        // Consumption
        var fed = true;
        if (global.resource[global.race.species].amount >= 1 || global.city['farm'] || global.city['soul_well'] || global.city['compost'] || global.city['tourist_center'] || global.city['transmitter']){
            let food_base = 0;
            let virgo = astroSign === 'virgo' ? 1 + (astroVal('virgo')[0] / 100) : 1;

            if (global.race['artifical']){
                if (global.city['transmitter']){
                    food_base = p_on['transmitter'] * production('transmitter') * production('psychic_boost','Food');
                    breakdown.p['Food'][loc('city_transmitter')] = food_base + 'v';
                    global.city.transmitter['lpmod'] = production('transmitter') * global_multiplier * production('psychic_boost','Food');
                }
            }
            else {
                if (global.race['detritivore']){
                    if (global.city['compost']){
                        let operating = global.city.compost.on;
                        if (!global.race['kindling_kindred'] && !global.race['smoldering']){
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
                        food_compost *= global.city.biome === 'savanna' ? biomes.savanna.vars()[0] : 1;
                        food_compost *= global.city.biome === 'ashland' ? biomes.ashland.vars()[0] : 1;
                        food_compost *= global.city.biome === 'volcanic' ? biomes.volcanic.vars()[0] : 1;
                        food_compost *= global.city.biome === 'hellscape' ? biomes.hellscape.vars()[0] : 1;
                        food_compost *= global.city.ptrait.includes('trashed') ? planetTraits.trashed.vars()[0] : 1;
                        food_compost *= production('psychic_boost','Food');
                        breakdown.p['Food'][loc('city_compost_heap')] = food_compost + 'v';
                        food_base += food_compost;
                    }
                }
                else if (global.race['carnivore'] || global.race['soul_eater']){
                    let strength = weaponTechModifer();
                    let food_hunt = workerScale(global.civic.hunter.workers,'hunter');
                    food_hunt *= racialTrait(food_hunt,'hunting');
                    if (global.race['servants']){
                        let serve_hunt = global.race.servants.jobs.hunter;
                        serve_hunt *= servantTrait(global.race.servants.jobs.hunter,'hunting');
                        food_hunt += serve_hunt;
                    }
                    food_hunt *= strength * (global.race['carnivore'] ? 2 : 0.5);
                    if (global.race['ghostly']){
                        food_hunt *= 1 + (traits.ghostly.vars()[0] / 100);
                    }
                    food_hunt *= production('psychic_boost','Food');
                    breakdown.p['Food'][jobName('hunter')] = food_hunt + 'v';

                    if (global.race['carnivore'] && global.city['lodge'] && food_hunt > 0){
                        food_hunt *= 1 + (global.city.lodge.count / 20);
                        breakdown.p['Food'][`ᄂ${loc('city_lodge')}`] = (global.city.lodge.count * 5) + '%';
                    }

                    if (global.city['soul_well']){
                        let souls = global.city['soul_well'].count * (global.race['ghostly'] ? (2 + traits.ghostly.vars()[1]) : 2);
                        food_hunt += souls * production('psychic_boost','Food');
                        breakdown.p['Food'][loc('city_soul_well')] = souls + 'v';
                    }
                    food_base += food_hunt;
                }
                else if (global.race['unfathomable']){
                    if (global.city['captive_housing']){
                        let strength = weaponTechModifer();
                        let hunt = workerScale(global.civic.hunter.workers,'hunter')
                        hunt *= racialTrait(hunt,'hunting') * strength;
                        if (global.race['servants']){
                            let serve_hunt = global.race.servants.jobs.hunter * strength;
                            serve_hunt *= servantTrait(global.race.servants.jobs.hunter,'hunting');
                            hunt += serve_hunt;
                        }
                        let minHunt = hunt * 0.008;

                        if (global.city.captive_housing.cattle < global.city.captive_housing.cattleCap && hunt > 0){
                            hunt -= Math.round(global.city.captive_housing.cattle ** 1.25);
                            if (hunt < minHunt){ hunt = minHunt; }
                            global.city.captive_housing.cattleCatch += hunt * time_multiplier;
                            if (global.city.captive_housing.cattleCatch >= global.city.captive_housing.cattle ** 2){
                                global.city.captive_housing.cattle++;
                                global.city.captive_housing.cattleCatch = 0;
                            }
                            if (global.city.captive_housing.cattle > 0 && global.resource.Food.amount < global.resource.Food.max * 0.01){
                                global.city.captive_housing.cattle--;
                                modRes('Food', 1000, true);
                                global.stats.cattle++;
                            }
                        }

                        if (global.city.captive_housing.cattle > 0){
                            let food = global.city.captive_housing.cattle / 3 * production('psychic_boost','Food');
                            breakdown.p['Food'][loc('city_captive_housing_cattle_bd')] = food + 'v';
                            food_base += food;
                        }
                    }
                }
                else if (global.city['farm'] || global.race['forager'] || global.race['warlord']) {
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
                        let foragers = workerScale(global.civic.forager.workers,'forager');
                        foragers *= racialTrait(foragers,'forager');
                        if (global.race['servants']){
                            let serve = global.race.servants.jobs.forager;
                            serve *= servantTrait(global.race.servants.jobs.forager,'forager');
                            foragers += serve;
                        }
                        let food_forage = foragers * forage * 0.35;
                        breakdown.p['Food'][jobName('forager')] = food_forage + 'v';
                        food_base += food_forage;
                    }

                    if (global.race['warlord']){
                        let food = workerScale(global.civic.lumberjack.workers,'farmer') * farmerValue(true);
                        breakdown.p['Food'][jobName('lumberjack')] = food + 'v';
                        food_base += food;
                    }

                    if (global.city['farm']){
                        let farmers = workerScale(global.civic.farmer.workers,'farmer');
                        let farmhands = 0;
                        if (farmers > jobScale(global.city.farm.count)){
                            farmhands = farmers - jobScale(global.city.farm.count);
                            farmers = jobScale(global.city.farm.count);
                        }
                        let food = (farmers * farmerValue(true)) + (farmhands * farmerValue(false));

                        if (global.race['servants']){
                            let servants = global.race.servants.jobs.farmer;
                            let servehands = 0;
                            let open = global.city.farm.count - (farmers / (global.race['high_pop'] ? traits.high_pop.vars()[0] : 1));
                            if (servants > open){
                                servehands = servants - open;
                                servants = open;
                            }
                            food += (servants * farmerValue(true,true)) + (servehands * farmerValue(false,true));
                        }

                        let mill_multiplier = 1;
                        if (global.city['mill']){
                            let mill_bonus = global.tech['agriculture'] >= 5 ? 0.05 : 0.03;
                            let working = global.city['mill'].count - global.city['mill'].on;
                            mill_multiplier += (working * mill_bonus);
                        }

                        breakdown.p['Food'][jobName('farmer')] = (food) + 'v';
                        food_base += (food * virgo * weather_multiplier * mill_multiplier * q_multiplier * production('psychic_boost','Food'));

                        if (food > 0){
                            breakdown.p['Food'][`ᄂ${loc('city_mill_title1')}`] = ((mill_multiplier - 1) * 100) + '%';
                            breakdown.p['Food'][`ᄂ${loc('sign_virgo')}+0`] = ((virgo - 1) * 100) + '%';
                            breakdown.p['Food'][`ᄂ${loc('morale_weather')}`] = ((weather_multiplier - 1) * 100) + '%';
                            breakdown.p['Food'][`ᄂ${loc('quarantine')}+0`] = ((q_multiplier - 1) * 100) + '%';
                        }
                    }
                }
            }

            if (global.tauceti['tau_farm'] && p_on['tau_farm']){
                let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);
                let food_base = production('tau_farm','food') * p_on['tau_farm'] * production('psychic_boost','Food');
                let delta = food_base * global_multiplier * colony_val;

                breakdown.p['Food'][loc('tau_home_tau_farm')] = food_base + 'v';
                if (food_base > 0){
                    breakdown.p['Food'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                }

                modRes('Food', delta * time_multiplier);
            }

            let hunting = 0;
            if (global.tech['military']){
                hunting = (global.race['herbivore'] && !global.race['carnivore']) || global.race['artifical'] ? 0 : armyRating(garrisonSize(),'hunting') / 3;
                hunting *= production('psychic_boost','Food');
            }

            let biodome = 0;
            let red_synd = syndicate('spc_red');
            if (global.tech['mars']){
                biodome = support_on['biodome'] * workerScale(global.civic.colonist.workers,'colonist') * production('biodome','food') * production('psychic_boost','Food');
                if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    biodome += support_on['biodome'] * production('biodome','cat_food') * production('psychic_boost','Food');
                }
            }

            breakdown.p['Food'][actions.space.spc_red.biodome.title()] = biodome + 'v';
            if (biodome > 0){
                breakdown.p['Food'][`ᄂ${loc('space_syndicate')}+0`] = -((1 - red_synd) * 100) + '%';
                breakdown.p['Food'][`ᄂ${loc('space_red_ziggurat_title')}+0`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Food'][`ᄂ${loc('sign_virgo')}+0`] = ((virgo - 1) * 100) + '%';
            }

            let generated = food_base + (hunting * q_multiplier) + (biodome * red_synd * zigVal * virgo);
            generated *= global_multiplier;

            let soldiers = global.civic.garrison.workers;
            if (global.race['parasite'] && !global.tech['isolation']){
                soldiers -= jobScale(traits.parasite.vars()[0]);
                if (soldiers < 0){
                    soldiers = 0;
                }
            }

            let consume = 0;
            let food_consume_mod = 1;
            if(global.race['gluttony']){
                food_consume_mod *= 1 + traits.gluttony.vars()[0] / 100;
            }
            if (global.race['high_metabolism']){
                food_consume_mod *= 1 + (traits.high_metabolism.vars()[0] / 100);
            }
            if (global.race['sticky']){
                food_consume_mod *= 1 - (traits.sticky.vars()[0] / 100);
            }
            let pingFathom = fathomCheck('pinguicula');
            if (pingFathom > 0){
                food_consume_mod *= 1 - (traits.sticky.vars(1)[0] / 100 * pingFathom);
            }
            if (global.race['photosynth']){
                switch(global.city.calendar.weather){
                    case 0:
                        food_consume_mod *= global.city.calendar.temp === 0 ? 1 : (1 - (traits.photosynth.vars()[2] / 100));
                        break;
                    case 1:
                        food_consume_mod *= 1 - (traits.photosynth.vars()[1] / 100);
                        break;
                    case 2:
                        food_consume_mod *= 1 - (traits.photosynth.vars()[0] / 100);
                        break;
                }
            }
            if (global.race['ravenous']){
                food_consume_mod *= 1 + (traits.ravenous.vars()[0] / 100);
            }
            if (global.race['hibernator'] && global.city.calendar.season === 3){
                food_consume_mod *= 1 - (traits.hibernator.vars()[0] / 100);
            }
            if (global.race['high_pop']){
                food_consume_mod /= traits.high_pop.vars()[0];
            }
            let banquet = 1;
            if(global.city.banquet){
                if(global.city.banquet.on){
                    banquet *= ((global.city.banquet.count >= 5 ? 1.02 : 1.022)**global.city.banquet.strength);
                }
                else{
                    global.city.banquet.strength = 0;
                }
            }

            let ravenous = 0;
            let tourism = 0;
            let spaceport = 0;
            let starport = 0;
            let starbase = 0;
            let space_station = 0;
            let space_marines = 0;
            let embassy = 0;
            let zoo = 0;
            let restaurant = 0;
            if(!global.race['fasting']){
                consume = (global.resource[global.race.species].amount + soldiers - ((global.civic.unemployed.workers + workerScale(global.civic.hunter.workers,'hunter')) * 0.5)) * food_consume_mod;
                if (global.race['forager']){
                    consume -= workerScale(global.civic.forager.workers,'forager');
                }
                if(global.race['ravenous']){
                    ravenous = (global.resource.Food.amount / traits.ravenous.vars()[1]);
                }
                breakdown.p.consume.Food[flib('name')] = -(consume + ravenous);
                if(global.city.banquet && global.city.banquet.on){
                    consume = Math.max(consume, 100); //minimum consumption for banquet hall
                }
                if(consume * banquet + ravenous >= global.resource.Food.amount){
                    if(global.city.banquet && banquet > 1){
                        global.city.banquet.strength = 0;
                    }
                }
                else{
                    if(banquet > 1){
                        breakdown.p.consume.Food[`${loc('city_banquet')}`] = -(consume*(banquet-1));
                    }
                    consume *= banquet;
                }

                if (global.city['tourist_center']){
                    tourism = global.city['tourist_center'].on * 50;
                    breakdown.p.consume.Food[loc('tech_tourism')] = -(tourism);
                }

                if (global.space['spaceport']){
                    spaceport = p_on['spaceport'] * (global.race['cataclysm'] || global.race['orbit_decayed'] ? 2 : 25);
                    breakdown.p.consume.Food[loc('space_red_spaceport_title')] = -(spaceport);
                }

                if (global.interstellar['starport']){
                    starport = p_on['starport'] * 100;
                    breakdown.p.consume.Food[loc('interstellar_alpha_starport_title')] = -(starport);
                }

                if (global.galaxy['starbase']){
                    starbase = p_on['s_gate'] * p_on['starbase'] * 250;
                    breakdown.p.consume.Food[loc('galaxy_starbase')] = -(starbase);
                }

                if (global.space['space_station']){
                    space_station = p_on['space_station'] * (global.race['cataclysm'] ? 1 : 10);
                    breakdown.p.consume.Food[loc('space_belt_station_title')] = -(space_station);
                }

                if (global.space['space_barracks'] && !global.race['cataclysm']){
                    space_marines = global.space.space_barracks.on * 10;
                    breakdown.p.consume.Food[loc('tech_space_marines_bd')] = -(space_marines);
                }

                if (global.galaxy['embassy']){
                    embassy = p_on['s_gate'] * p_on['embassy'] * 7500;
                    breakdown.p.consume.Food[loc('galaxy_embassy')] = -(embassy);
                }

                if (global.interstellar['zoo']){
                    zoo = int_on['zoo'] * 12000;
                    breakdown.p.consume.Food[loc('tech_zoo')] = -(zoo);
                }

                if (global.eden['restaurant']){
                    restaurant = p_on['restaurant'] * 250000;
                    breakdown.p.consume.Food[loc('eden_restaurant_bd')] = -(restaurant);
                }
            }

            breakdown.p['Food'][loc('soldiers')] = hunting + 'v';
            if (hunting > 0){
                breakdown.p['Food'][`ᄂ${loc('quarantine')}+1`] = ((q_multiplier - 1) * 100) + '%';
            }
            if(global.race['fasting']){
                breakdown.p['Food'][`${loc('evo_challenge_fasting')}`] = '-100%';
                generated *= 0;
            }

            let delta = generated - consume - ravenous - tourism - spaceport - starport - starbase - space_station - space_marines - embassy - zoo - restaurant;

            if (!modRes('Food', delta * time_multiplier) || global.race['fasting']){
                if (global.race['anthropophagite'] && global.resource[global.race.species].amount > 1 && !global.race['fasting']){
                    global.resource[global.race.species].amount--;
                    modRes('Food', 10000 * traits.anthropophagite.vars()[0]);
                    global.stats.murders++;
                    blubberFill(1);
                }
                else {
                    fed = false;
                    if(global.resource[global.race.species].amount > 0){
                        let threshold = 1.25;
                        let digestion = 0;
                        let humpback = 0;
                        let meditators = 0;
                        let atrophy = 0;
                        let infusion = 1;
                        if (global.race['slow_digestion']){
                            digestion += traits.slow_digestion.vars()[0];
                        }
                        let fathom = fathomCheck('slitheryn');
                        if (fathom > 0){
                            digestion += traits.slow_digestion.vars(1)[0] * fathom;
                        }
                        if (global.race['humpback']){
                            humpback = traits.humpback.vars()[0];
                        }
                        if(global.race['fasting']){
                            meditators = highPopAdjust(global.civic.meditator.workers) * 0.03;
                        }
                        if (global.race['atrophy']){
                            atrophy = traits.atrophy.vars()[0];
                        }
                        if(global.portal['dish_life_infuser'] && global.portal['dish_life_infuser'].on){
                            infusion = 0.95 ** global.portal['dish_life_infuser'].on;
                        }
                        threshold += digestion + humpback + meditators;
                        threshold -= atrophy;
                        threshold *= infusion
                        if(global.race['fasting']){
                            let base = global.resource[global.race.species].amount/100;
                            breakdown.p.consume[global.race.species][global.resource[global.race.species].name] = -(base).toFixed(2);
                            breakdown.p.consume[global.race.species][loc('genelab_traits')] = (1 - food_consume_mod) * (base).toFixed(2);
                            breakdown.p.consume[global.race.species][loc('Threshold')] = (threshold).toFixed(2);
                            global.resource[global.race.species].delta = -(base * food_consume_mod - threshold) * time_multiplier;
                            /*for(const x in breakdown.p.consume[global.race.species]){
                                breakdown.p.consume[global.race.species][x] = (breakdown.p.consume[global.race.species][x] / time_multiplier).toFixed(2);
                            }*/
                        }
                        // threshold can be thought of as the inverse of nutrition ratio per unit of food.
                        // So if the generated food doesn't have enough nutrition for the consuming population, they starve.
                        if (Math.rand(0, 10) === 0){
                            if(global.race['fasting']){
                                let starved = (global.resource[global.race.species].amount) / 100 * food_consume_mod - threshold;
                                if(starved < 0){
                                    starved = 0;
                                }
                                if(starved%1 > Math.random()){
                                    starved = Math.ceil(starved);
                                }
                                else{
                                    starved = Math.floor(starved);
                                }
                                if(starved > global.resource[global.race.species].amount){
                                    starved = global.resource[global.race.species].amount;
                                }
                                global.resource[global.race.species].amount -= starved;
                                global.stats.starved += starved;
                                blubberFill(starved);
                            }
                            else if (generated < consume / threshold){
                                global['resource'][global.race.species].amount--;
                                global.stats.starved++;
                                blubberFill(1);
                            }
                        }
                    }
                }
            }

            if (global.race['anthropophagite'] && global.resource[global.race.species].amount > 1 && Math.rand(0,400) === 0){
                global.resource[global.race.species].amount--;
                modRes('Food', 10000 * traits.anthropophagite.vars()[0]);
                global.stats.murders++;
                blubberFill(1);
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

        // Energy Recharge
        if (global.race['psychic'] && global.resource.Energy.display){
            let energy_bd = {};
            let charge = traits.psychic.vars()[2];
            energy_bd[loc('trait_psychic_name')] = charge + 'v';
            modRes(`Energy`, (charge * time_multiplier));
            breakdown.p['Energy'] = energy_bd;
        }

        // Citizen Growth
        if (global.civic.homeless > 0){
            let missing = Math.min(global.civic.homeless, global.resource[global.race.species].max - global.resource[global.race.species].amount);
            global.civic.homeless -= missing;
            global.resource[global.race.species].amount += missing;
            global.civic[global.civic.d_job].workers++;
        }
        else if (((fed && global['resource']['Food'].amount > 0) || global.race['fasting']) && global['resource'][global.race.species].max > global['resource'][global.race.species].amount){
            if (global.race['artifical'] || (global.race['spongy'] && global.city.calendar.weather === 0)){
                // Do Nothing
            }
            else if (global.race['parasite'] && global.city.calendar.wind === 0 && !global.race['cataclysm'] && !global.race['orbit_decayed']){
                // Do Nothing
            }
            else if (global.race['vax'] && global.race.vax >= 100){
                // Do Nothing
            }
            else {
                let lowerBound = global.tech['reproduction'] ? global.tech['reproduction'] : 0;
                let upperBound = global['resource'][global.race.species].amount;

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
                if(global.race['fasting']){
                    lowerBound += highPopAdjust(global.civic.meditator.workers) * 0.15;
                }
                if(global.city.banquet && global.city.banquet.on && global.city.banquet.count >= 1){
                    lowerBound *= 1 + (global.city.banquet.strength ** 0.75) / 100;
                }
                if (astroSign === 'libra'){
                    lowerBound *= 1 + (astroVal('libra')[0] / 100);
                }
                if (global.race['high_pop']){
                    lowerBound *= traits.high_pop.vars()[2];
                    upperBound /= jobScale(1);
                }
                if (global.city.biome === 'taiga'){
                    lowerBound *= biomes.taiga.vars()[1];
                }
                if (global.city.ptrait.includes('toxic')){
                    upperBound *= planetTraits.toxic.vars()[1];
                }
                if (global.race['parasite'] && (global.race['cataclysm'] || global.race['orbit_decayed'])){
                    lowerBound = Math.round(lowerBound / 5);
                    upperBound *= 3;
                }

                upperBound *= (3 - (2 ** time_multiplier));
                if(Math.rand(0, upperBound) <= lowerBound){
                    global['resource'][global.race.species].amount++;
                    global.civic[global.civic.d_job].workers++;
                }
            }
        }

        if (global.space['shipyard'] && global.space.shipyard['ships']){
            let fuels = {
                Oil: 0,
                Helium_3: 0,
                Uranium: 0,
                Elerium: 0
            };
            global.space.shipyard.ships.forEach(function(ship){
                if (ship.location !== 'spc_dwarf' || ship.transit !== 0){
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
        if(global.portal['dish_soul_steeper'] && global.portal['dish_soul_steeper'].on){
            hunger -= (0.03 + (global.race['malnutrition'] ? 0.01 : 0) + (global.race['angry'] ? -0.01 : 0)) * global.portal['dish_soul_steeper'].on;
        }
        hunger = Math.max(hunger, 0);

        // Furs
        if (global.resource.Furs.display){
            if (global.race['evil'] || global.race['artifical'] || global.race['unfathomable']){
                let weapons = weaponTechModifer();
                let hunters = workerScale(global.civic.hunter.workers,'hunter');
                hunters *= racialTrait(hunters,'hunting');
                if (global.race['servants']){
                    let serve = jobScale(global.race.servants.jobs.hunter);
                    serve *= servantTrait(global.race.servants.jobs.hunter,'hunting');
                    hunters += serve;
                }
                if (global.city.biome === 'oceanic'){
                    hunters *= biomes.oceanic.vars()[2];
                }
                else if (global.city.biome === 'tundra'){
                    hunters *= biomes.tundra.vars()[0];
                }
                hunters *= weapons / 20;
                hunters *= production('psychic_boost','Furs');
                breakdown.p['Furs'][jobName('hunter')] = hunters  + 'v';
                if (hunters > 0){
                    breakdown.p['Furs'][`ᄂ${loc('quarantine')}+0`] = ((q_multiplier - 1) * 100) + '%';
                }
                modRes('Furs', hunters * hunger * global_multiplier * time_multiplier * q_multiplier);

                if (!global.race['soul_eater'] && global.race['evil']){
                    let reclaimers = workerScale(global.civic.lumberjack.workers,'lumberjack');
                    reclaimers *= racialTrait(reclaimers,'lumberjack');
                    if (global.race['warlord'] && global.race['playful']){
                        reclaimers *= 1 + traits.playful.vars()[0];
                    }

                    if (global.race['servants']){
                        let serve = global.race.servants.jobs.lumberjack;
                        serve *= servantTrait(global.race.servants.jobs.lumberjack,'lumberjack');
                        reclaimers += serve;
                    }

                    reclaimers /= 4;
                    reclaimers *= production('psychic_boost','Furs');
                    breakdown.p['Furs'][jobName('lumberjack')] = reclaimers  + 'v';
                    if (reclaimers > 0){
                        breakdown.p['Furs'][`ᄂ${loc('quarantine')}+1`] = ((q_multiplier - 1) * 100) + '%';
                    }
                    modRes('Furs', reclaimers * hunger * global_multiplier * time_multiplier * q_multiplier);
                }
            }

            let hunting = armyRating(garrisonSize(),'hunting') / 10;
            if (global.city.biome === 'oceanic'){
                hunting *= biomes.oceanic.vars()[2];
            }
            else if (global.city.biome === 'tundra'){
                hunting *= biomes.tundra.vars()[0];
            }
            hunting *= production('psychic_boost','Furs');

            breakdown.p['Furs'][loc('soldiers')] = hunting  + 'v';
            if (hunting > 0){
                breakdown.p['Furs'][`ᄂ${loc('quarantine')}+2`] = ((q_multiplier - 1) * 100) + '%';
            }
            modRes('Furs', hunting * hunger * global_multiplier * q_multiplier * time_multiplier);

            if (global.race['forager']){
                let forage = 1 + (global.tech['foraging'] ? 0.5 * global.tech['foraging'] : 0);
                let foragers = workerScale(global.civic.forager.workers,'forager');
                foragers *= racialTrait(foragers,'forager');

                if (global.race['servants']){
                    let serve = global.race.servants.jobs.forager;
                    serve *= servantTrait(global.race.servants.jobs.forager,'forager');
                    foragers += serve;
                }

                let forage_base = foragers * forage * 0.05 * production('psychic_boost','Furs');
                breakdown.p['Furs'][jobName('forager')] = forage_base + 'v';
                if (forage_base > 0){
                    breakdown.p['Furs'][`ᄂ${loc('quarantine')}+3`] = ((q_multiplier - 1) * 100) + '%';
                }
                modRes('Furs', forage_base * hunger * q_multiplier * time_multiplier);
            }
        }

        if (global.resource.Furs.display && global.tech['isolation'] && global.tauceti['womling_farm']){
            let base = global.tauceti.womling_farm.farmers * production('psychic_boost','Furs');
            let delta = base * global_multiplier;
            breakdown.p['Furs'][loc('tau_red_womlings')] = base + 'v';
            modRes('Furs', delta);
        }

        if (global.race['unfathomable'] && global.civic.hunter.display){
            let weapons = weaponTechModifer();
            let hunters = workerScale(global.civic.hunter.workers,'hunter');
            hunters *= racialTrait(hunters,'hunting');

            if (global.race['servants']){
                let serve = jobScale(global.race.servants.jobs.hunter);
                serve *= servantTrait(global.race.servants.jobs.hunter,'hunting');
                hunters += highPopAdjust(serve);
            }

            hunters *= weapons / 20;

            let stealable = ['Lumber','Chrysotile','Stone','Crystal','Copper','Iron','Aluminium','Cement','Coal','Oil','Uranium','Steel','Titanium','Alloy','Polymer','Iridium'];
            stealable.forEach(function(res){
                if (global.resource[res].display){
                    let raid = hunters * production('psychic_boost',res) * tradeRatio[res] / 5;
                    if (['Crystal','Uranium'].includes(res)){ raid *= 0.2; }
                    else if (['Alloy','Polymer','Iridium'].includes(res)){ raid *= 0.35; }
                    else if (['Steel','Cement'].includes(res)){ raid *= 0.85; }
                    else if (['Titanium'].includes(res)){ raid *= 0.65; }
                    breakdown.p[res][jobName('hunter')] = raid  + 'v';
                    if (raid > 0){
                        breakdown.p[res][`ᄂ${loc('quarantine')}+99`] = ((q_multiplier - 1) * 100) + '%';
                    }
                    modRes(res, raid * hunger * global_multiplier * time_multiplier * q_multiplier);
                }
            });
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
            if (global.city.ptrait.includes('magnetic')){
                sundial_base += planetTraits.magnetic.vars()[0];
            }
            if (global.race['ascended']){
                sundial_base += 2;
            }

            let professors_base = workerScale(global.civic.professor.workers,'professor');
            let prof_impact = global.race['studious'] ? global.civic.professor.impact + traits.studious.vars()[0] : global.civic.professor.impact;
            let fathom = fathomCheck('elven');
            if (fathom > 0){
                prof_impact += traits.studious.vars(1)[0] * fathom;
            }
            professors_base *= prof_impact
            professors_base *= global.race['pompous'] ? (1 - traits.pompous.vars()[0] / 100) : 1;
            professors_base *= racialTrait(workerScale(global.civic.professor.workers,'professor'),'science');
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 3){
                professors_base *= 1 + faithTempleCount() * 0.05;
            }
            if (global.civic.govern.type === 'theocracy'){
                professors_base *= 1 - (govEffect.theocracy()[1] / 100);
            }

            let scientist_base = workerScale(global.civic.scientist.workers,'scientist');
            scientist_base *= global.civic.scientist.impact;
            scientist_base *= racialTrait(workerScale(global.civic.scientist.workers,'scientist'),'science');
            if (global.tech['science'] >= 6 && global.city['wardenclyffe']){
                let professor = workerScale(global.civic.professor.workers,'professor');
                if (global.race['high_pop']){
                    professor = highPopAdjust(professor);
                }
                scientist_base *= 1 + (professor * p_on['wardenclyffe'] * 0.01);
            }
            if (global.space['satellite']){
                scientist_base *= 1 + (global.space.satellite.count * 0.01);
            }
            if (global.civic.govern.type === 'theocracy'){
                scientist_base *= 1 - (govEffect.theocracy()[2] / 100);
            }

            let gene_consume = 0;
            if (global.arpa['sequence'] && global.arpa.sequence.on && global.arpa.sequence.time > 0 && sequenceLabs() > 0){
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

            let womling = global.tauceti.hasOwnProperty('womling_lab') ? global.tauceti.womling_lab.scientist * (global.tech['womling_gene'] ? 10 : 8) : 0;

            let delta = professors_base + scientist_base + womling;
            delta *= hunger * global_multiplier;
            delta += sundial_base * global_multiplier;

            breakdown.p['Knowledge'][jobName('professor')] = professors_base + 'v';
            if (global.race.universe === 'magic'){
                breakdown.p['Knowledge'][jobName('wizard')] = scientist_base + 'v';
            }
            else {
                breakdown.p['Knowledge'][(global.civic?.scientist?.name || jobName('scientist'))] = scientist_base + 'v';
            }
            breakdown.p['Knowledge'][loc('tau_red_womlings')] = womling + 'v';
            breakdown.p['Knowledge'][loc('hunger')] = ((hunger - 1) * 100) + '%';
            breakdown.p['Knowledge'][global.race['unfathomable'] ? loc('tech_moondial') : loc('tech_sundial')] = sundial_base + 'v';

            if (global.race['inspired']){
                breakdown.p['Knowledge'][loc('event_inspiration_bd')] = '100%';
                delta *= 2;
            }
            if (global.city['library'] || global.race['warlord']){
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
                let lib_count = global.race['warlord'] ? ((global.race?.absorbed?.length || 1) * 10) : global.city.library.count;
                let library_mult = 1 + (lib_count * lib_multiplier);
                breakdown.p['Knowledge'][global.race['warlord'] ? loc('portal_throne_of_evil_title') : loc('city_library')] = ((library_mult - 1) * 100) + '%';
                delta *= library_mult;
            }
            if (astroSign === 'gemini'){
                let astro_mult = 1 + (astroVal('gemini')[0] / 100);
                breakdown.p['Knowledge'][loc(`sign_${astroSign}`)] = ((astro_mult - 1) * 100) + '%';
                delta *= astro_mult;
            }
            if (global.tech['isolation'] && support_on['infectious_disease_lab']){
                let lab_mult = 1 + support_on['infectious_disease_lab'] * 0.75;
                breakdown.p['Knowledge'][actions.tauceti.tau_home.infectious_disease_lab.title()] = ((lab_mult - 1) * 100) + '%';
                delta *= lab_mult;
            }
            if (global.civic.govern.type === 'technocracy'){
                breakdown.p['Knowledge'][loc('govern_technocracy')] = govEffect.technocracy()[2] + '%';
                delta *= 1 + (govEffect.technocracy()[2] / 100);
            }

            if (gene_consume > 0) {
                delta -= gene_consume;
                breakdown.p.consume.Knowledge[loc('genome_bd')] = -(gene_consume);
            }

            modRes('Knowledge', delta * time_multiplier);

            if (global.tech['tau_gas2'] && global.tech.tau_gas2 >= 6 && (!global.tech['alien_data'] || global.tech.alien_data < 6) && global.tauceti['alien_space_station'] && p_on['alien_space_station']) {
                let focus = (global.tauceti.alien_space_station.focus / 100) * delta
                breakdown.p.consume.Knowledge[loc('tau_gas2_alien_station')] = -(focus);
                modRes('Knowledge', -(focus) * time_multiplier);
                global.tauceti.alien_space_station.decrypted += +(focus).toFixed(3);
                global.stats.know += +(focus).toFixed(0);
                if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 1000000 : 250000000) && !global.tech['alien_data']){
                    global.tech['alien_data'] = 1;
                    messageQueue(loc('tau_gas2_alien_station_data1',[loc('tech_dist_womling')]),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 2000000 : 500000000) && global.tech['alien_data'] && global.tech.alien_data === 1){
                    global.tech.alien_data = 2;
                    global.race.tau_food_item = Math.rand(0,10);
                    messageQueue(loc('tau_gas2_alien_station_data2',[loc(`tau_gas2_alien_station_data2_r${global.race.tau_food_item || 0}`)]),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 3000000 : 750000000) && global.tech['alien_data'] && global.tech.alien_data === 2){
                    global.tech.alien_data = 3;
                    messageQueue(loc('tau_gas2_alien_station_data3'),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 4800000 : 1200000000) && global.tech['alien_data'] && global.tech.alien_data === 3){
                    global.tech.alien_data = 4;
                    global.race.tau_junk_item = Math.rand(0,10);
                    messageQueue(loc('tau_gas2_alien_station_data4',[loc(`tau_gas2_alien_station_data4_r${global.race.tau_junk_item || 0}`)]),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 6000000 : 1500000000) && global.tech['alien_data'] && global.tech.alien_data === 4){
                    global.tech.alien_data = 5;
                    messageQueue(loc('tau_gas2_alien_station_data5'),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 10000000 : 2500000000) && global.tech['alien_data'] && global.tech.alien_data === 5){
                    global.tech.alien_data = 6;
                    global.tauceti.alien_space_station.decrypted = 2500000000;
                    if (global.race['lone_survivor']){
                        global.settings.tau.star = true;
                        global.tech['matrix'] = 2;
                        global.tauceti['ringworld'] = { count: 0 };
                        messageQueue(loc('tau_gas2_alien_station_data6_alt'),'success',false,['progress']);
                    }
                    else {
                        messageQueue(loc('tau_gas2_alien_station_data6'),'success',false,['progress']);
                    }
                    drawTech();
                }
            }
        }

        // Omniscience
        if (global.resource.Omniscience.display){
            if (support_on['research_station']){
                let ghost_base = workerScale(global.civic.ghost_trapper.workers,'ghost_trapper');
                ghost_base *= racialTrait(ghost_base,'science');
                ghost_base *= global.race['pompous'] ? (1 - traits.pompous.vars()[0] / 100) : 1;
                let corruptor = 1;
                if (global.race['warlord'] && global.eden['corruptor']){
                    corruptor = 1 + (p_on['corruptor'] || 0) * 0.04;
                }

                let ghost_gain = support_on['research_station'] * ghost_base * 0.0000325 * corruptor;
                breakdown.p['Omniscience'][loc('eden_research_station_title')] = ghost_gain + 'v';
                if (corruptor > 1){
                    breakdown.p['Omniscience'][`ᄂ${loc('eden_corruptor_title')}`] = ((corruptor - 1) * 100) + '%';
                }

                let delta = ghost_gain;
                delta *= hunger * global_multiplier;

                modRes('Omniscience', delta * time_multiplier);
            }

            if (global.tech['science'] && global.tech.science >= 23){
                let scientist = workerScale(global.civic.scientist.workers,'scientist');
                scientist *= racialTrait(scientist,'science');
                scientist *= global.race['pompous'] ? (1 - traits.pompous.vars()[0] / 100) : 1;

                let sci_gain = scientist * 0.000707;
                breakdown.p['Omniscience'][global.civic.scientist.name] = sci_gain + 'v';

                let delta = sci_gain;
                delta *= hunger * global_multiplier;

                modRes('Omniscience', delta * time_multiplier);
            }
        }

        // Factory
        let FactoryMoney = 0;
        if (global.city['factory']){
            let on_factories = (p_on['factory'] || 0)
                + (p_on['red_factory'] || 0)
                + ((p_on['int_factory'] || 0) * 2)
                + ((p_on['hell_factory'] || 0) * actions.portal.prtl_wasteland.hell_factory.lines())
                + ((support_on['tau_factory'] || 0) * (global.tech['isolation'] ? 5 : 3));
            let max_factories = global.city['factory'].on
                + (global.space['red_factory'] ? global.space['red_factory'].on : 0)
                + (global.interstellar['int_factory'] ? global.interstellar['int_factory'].on * 2 : 0)
                + (global.portal['hell_factory'] ? global.portal['hell_factory'].on * actions.portal.prtl_wasteland.hell_factory.lines() : 0)
                + (global.tauceti['tau_factory'] ? global.tauceti['tau_factory'].on * (global.tech['isolation'] ? 5 : 3) : 0);
            let eff = max_factories > 0 ? on_factories / max_factories : 0;
            let remaining = max_factories;

            ['Lux','Furs','Alloy','Polymer','Nano','Stanene'].forEach(function(res){
                remaining -= global.city.factory[res];
                if (remaining < 0) {
                    global.city.factory[res] += remaining;
                    remaining = 0;
                }
            });

            let assembly = global.tech['factory'] || 0;
            let tauBonus = global.tech['isolation'] ? 1 + ((support_on['colony'] || 0) * 0.5) : 1;

            if (global.city.factory['Lux'] && global.city.factory['Lux'] > 0){
                let fur_cost = global.city.factory.Lux * f_rate.Lux.fur[assembly] * eff;
                let workDone = global.city.factory.Lux;

                while (fur_cost * time_multiplier > global.resource.Furs.amount && fur_cost > 0){
                    fur_cost -= f_rate.Lux.fur[assembly] * eff;
                    workDone--;
                }

                breakdown.p.consume.Furs[loc('city_factory')] = -(fur_cost);
                modRes('Furs', -(fur_cost * time_multiplier));

                let demand = highPopAdjust(global.resource[global.race.species].amount) * f_rate.Lux.demand[assembly] * eff;
                demand = luxGoodPrice(demand);

                let delta = workDone * demand;
                if (global.race['gravity_well']){ delta = teamster(delta); }
                FactoryMoney = delta;

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                }

                modRes('Money', delta * hunger * global_multiplier * time_multiplier);
            }

            if (global.city.factory['Furs'] && global.city.factory['Furs'] > 0){
                let moneyIncrement = f_rate.Furs.money[assembly] * eff;
                let polymerIncrement =  f_rate.Furs.polymer[assembly] * eff;
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

                let factory_output = workDone * f_rate.Furs.output[assembly] * eff * production('psychic_boost','Furs');
                factory_output = factoryBonus(factory_output);

                let delta = factory_output * tauBonus;
                delta *= hunger * global_multiplier;
                if (global.race['gravity_well']){ delta = teamster(delta); }

                breakdown.p['Furs'][loc('city_factory')] = factory_output + 'v';

                if (delta > 0){
                    if (tauBonus > 0){
                        breakdown.p['Furs'][`ᄂ${loc('tau_home_colony')}`] = ((tauBonus - 1) * 100) + '%';
                    }

                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        delta *= 0.5;
                        breakdown.p['Furs'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }

                    if (global.tech['q_factory']){
                        let q_bonus = (quantum_level - 1) / 8 + 1;
                        delta *= q_bonus;
                        breakdown.p['Furs'][`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                    }
                }

                if (global.race['gravity_well']){
                    breakdown.p['Furs'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }

                modRes('Furs', delta * time_multiplier);
            }

            if (global.city.factory['Alloy'] && global.city.factory['Alloy'] > 0){
                let copper_cost = global.city.factory.Alloy * f_rate.Alloy.copper[assembly] * eff;
                let aluminium_cost = global.city.factory.Alloy * f_rate.Alloy.aluminium[assembly] * eff;
                let workDone = global.city.factory.Alloy;

                while (copper_cost * time_multiplier > global.resource.Copper.amount && copper_cost > 0){
                    copper_cost -= f_rate.Alloy.copper[assembly] * eff;
                    aluminium_cost -= f_rate.Alloy.aluminium[assembly] * eff;
                    workDone--;
                }
                while (aluminium_cost * time_multiplier > global.resource.Aluminium.amount && aluminium_cost > 0){
                    copper_cost -= f_rate.Alloy.copper[assembly] * eff;
                    aluminium_cost -= f_rate.Alloy.aluminium[assembly] * eff;
                    workDone--;
                }

                breakdown.p.consume.Copper[loc('city_factory')] = -(copper_cost);
                breakdown.p.consume.Aluminium[loc('city_factory')] = -(aluminium_cost);
                modRes('Copper', -(copper_cost * time_multiplier));
                modRes('Aluminium', -(aluminium_cost * time_multiplier));

                let factory_output = workDone * f_rate.Alloy.output[assembly] * eff * production('psychic_boost','Alloy');
                factory_output = factoryBonus(factory_output);

                if (global.tech['alloy']){
                    factory_output *= 1.37;
                }
                if (global.race['metallurgist']){
                    factory_output *= 1 + (traits.metallurgist.vars()[0] * global.race['metallurgist'] / 100);
                }

                let delta = factory_output * tauBonus;
                delta *= hunger * global_multiplier;
                if (global.race['gravity_well']){ delta = teamster(delta); }

                breakdown.p['Alloy'][loc('city_factory')] = factory_output + 'v';

                if (delta > 0){
                    if (tauBonus > 0){
                        breakdown.p['Alloy'][`ᄂ${loc('tau_home_colony')}`] = ((tauBonus - 1) * 100) + '%';
                    }

                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        delta *= 0.5;
                        breakdown.p['Alloy'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }

                    if (global.tech['q_factory']){
                        let q_bonus = (quantum_level - 1) / 2 + 1;
                        delta *= q_bonus;
                        breakdown.p['Alloy'][`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                    }
                    breakdown.p['Alloy'][loc('hunger')] = ((hunger - 1) * 100) + '%';
                }

                if (global.race['gravity_well']){
                    breakdown.p['Alloy'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }

                modRes('Alloy', delta * time_multiplier);
            }
            else {
                breakdown.p['Alloy'] = 0;
            }

            if (global.city.factory['Polymer'] && global.city.factory['Polymer'] > 0){
                let oilIncrement = global.race['kindling_kindred'] || global.race['smoldering'] ? f_rate.Polymer.oil_kk[assembly] * eff : f_rate.Polymer.oil[assembly] * eff;
                let lumberIncrement = global.race['kindling_kindred'] || global.race['smoldering'] ? 0 : f_rate.Polymer.lumber[assembly] * eff;
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

                let factory_output = workDone * f_rate.Polymer.output[assembly] * eff * production('psychic_boost','Polymer');
                factory_output = factoryBonus(factory_output);
                
                if (global.tech['polymer'] >= 2){
                    factory_output *= 1.42;
                }

                let delta = factory_output * tauBonus;
                delta *= hunger * global_multiplier;
                if (global.race['gravity_well']){ delta = teamster(delta); }

                breakdown.p['Polymer'][loc('city_factory')] = factory_output + 'v';

                if (delta > 0){
                    if (tauBonus > 0){
                        breakdown.p['Polymer'][`ᄂ${loc('tau_home_colony')}`] = ((tauBonus - 1) * 100) + '%';
                    }

                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        delta *= 0.5;
                        breakdown.p['Polymer'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }

                    if (global.tech['q_factory']){
                        let q_bonus = (quantum_level - 1) / 2 + 1;
                        delta *= q_bonus;
                        breakdown.p['Polymer'][`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                    }
                }

                if (global.race['gravity_well']){
                    breakdown.p['Polymer'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }

                modRes('Polymer', delta * time_multiplier);
            }

            if (p_on['s_gate'] && global.galaxy['raider'] && gal_on['raider'] > 0){
                let base = gal_on['raider'] * 2.3 * production('psychic_boost','Polymer');
                let pirate = piracy('gxy_chthonian');
                let delta = base * global_multiplier * pirate * hunger * zigVal;

                breakdown.p['Polymer'][loc('galaxy_raider')] = base + 'v';
                if (base > 0){
                    breakdown.p['Polymer'][`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                    breakdown.p['Polymer'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                }
                modRes('Polymer', delta * time_multiplier);
            }
            breakdown.p['Polymer'][loc('hunger')] = ((hunger - 1) * 100) + '%';

            if (global.city.factory['Nano'] && global.city.factory['Nano'] > 0){
                let coalIncrement = f_rate.Nano_Tube.coal[assembly] * eff;
                let neutroniumIncrement = f_rate.Nano_Tube.neutronium[assembly] * eff;
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

                let factory_output = workDone * f_rate.Nano_Tube.output[assembly] * eff * production('psychic_boost','Nano_Tube');
                factory_output = factoryBonus(factory_output);

                let delta = factory_output * tauBonus;
                delta *= hunger * global_multiplier;
                if (global.race['gravity_well']){ delta = teamster(delta); }

                breakdown.p['Nano_Tube'][loc('city_factory')] = factory_output + 'v';

                if (delta > 0){
                    if (tauBonus > 0){
                        breakdown.p['Nano_Tube'][`ᄂ${loc('tau_home_colony')}`] = ((tauBonus - 1) * 100) + '%';
                    }

                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        delta *= 0.5;
                        breakdown.p['Nano_Tube'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }

                    if (global.tech['q_factory']){
                        let q_bonus = (quantum_level - 1) / 2 + 1;
                        delta *= q_bonus;
                        breakdown.p['Nano_Tube'][`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                    }
                    breakdown.p['Nano_Tube'][loc('hunger')] = ((hunger - 1) * 100) + '%';
                }

                if (global.race['gravity_well']){
                    breakdown.p['Nano_Tube'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }

                modRes('Nano_Tube', delta * time_multiplier);
            }
            else {
                breakdown.p['Nano_Tube'] = 0;
            }

            if (global.city.factory['Stanene'] && global.city.factory['Stanene'] > 0){
                let alumIncrement = f_rate.Stanene.aluminium[assembly] * eff;
                let nanoIncrement = f_rate.Stanene.nano[assembly] * eff;
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

                let factory_output = workDone * f_rate.Stanene.output[assembly] * eff * production('psychic_boost','Stanene');
                factory_output = factoryBonus(factory_output);

                let delta = factory_output * tauBonus;
                delta *= hunger * global_multiplier;
                if (global.race['gravity_well']){ delta = teamster(delta); }

                breakdown.p['Stanene'][loc('city_factory')] = factory_output + 'v';

                if (delta > 0){
                    if (tauBonus > 0){
                        breakdown.p['Stanene'][`ᄂ${loc('tau_home_colony')}`] = ((tauBonus - 1) * 100) + '%';
                    }

                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        delta *= 0.5;
                        breakdown.p['Stanene'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }

                    if (global.tech['q_factory']){
                        let q_bonus = (quantum_level - 1) / 2 + 1;
                        delta *= q_bonus;
                        breakdown.p['Stanene'][`ᄂ${loc('quantum')}`] = ((q_bonus - 1) * 100) + '%';
                    }
                    breakdown.p['Stanene'][loc('hunger')] = ((hunger - 1) * 100) + '%';
                }

                if (global.race['gravity_well']){
                    breakdown.p['Stanene'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }

                modRes('Stanene', delta * time_multiplier);
            }
            else {
                breakdown.p['Stanene'] = 0;
            }
        }

        if (global.resource.Furs.display){
            breakdown.p['Furs'][loc('hunger')] = ((hunger - 1) * 100) + '%';
        }

        // Cement
        if (global.resource.Cement.display){
            let unit_price = global.race['high_pop'] ? 3 / traits.high_pop.vars()[0] : 3;
            if (global.city.biome === 'ashland'){
                unit_price *= biomes.ashland.vars()[1];
            }
            let stone_cost = workerScale(global.civic.cement_worker.workers,'cement_worker') * unit_price;
            let workDone = workerScale(global.civic.cement_worker.workers,'cement_worker');
            while (stone_cost * time_multiplier > global.resource.Stone.amount && stone_cost > 0){
                stone_cost -= unit_price;
                workDone--;
            }

            let tauBonus = global.tech['isolation'] ? 1 + ((support_on['colony'] || 0) * 0.5) : 1;
            breakdown.p.consume.Stone[loc(global.tech['isolation'] ? 'job_cement_worker_bd' : 'city_cement_plant_bd')] = -(stone_cost);
            modRes('Stone', -(stone_cost * time_multiplier));

            let cement_base = global.tech['cement'] >= 4 ? (global.tech.cement >= 7 ? 1.45 : 1.2) : 1;
            cement_base *= global.civic.cement_worker.impact;
            cement_base *= racialTrait(workerScale(global.civic.cement_worker.workers,'cement_worker'),'factory');
            if (global.city.biome === 'ashland'){
                cement_base *= biomes.ashland.vars()[1];
            }
            if (global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 3){
                cement_base *= 1.1;
            }

            let factory_output = workDone * cement_base * production('psychic_boost','Cement');
            if (global.civic.govern.type === 'corpocracy'){
                factory_output *= 1 + (govEffect.corpocracy()[4] / 100);
            }
            if (global.civic.govern.type === 'socialist'){
                factory_output *= 1 + (govEffect.socialist()[1] / 100);
            }

            let powered_mult = 1;
            let power_single = 1;
            if (global.city.powered && p_on['cement_plant']){
                let rate = global.tech['cement'] >= 6 ? 0.08 : 0.05;
                powered_mult += (p_on['cement_plant'] * rate);
                power_single += rate;
            }

            let ai_core = 1;
            if (global.tech['ai_core'] && p_on['citadel'] > 0){
                let ai = +(quantum_level / 1.75).toFixed(1) / 100;
                ai_core += (p_on['citadel'] * ai);
            }

            let hell_factory = 1;
            if (global.race['warlord'] && global.portal['hell_factory'] && p_on['hell_factory'] > 0){
                hell_factory += p_on['hell_factory'] * 8 * (global.portal.hell_factory.rank - 1) / 100
            }

            let mining_pit = global.tech['isolation'] ? 1 + (support_on['mining_pit'] * 0.08) : 1;

            let cq_multiplier = global.tech['isolation'] ? 1 : q_multiplier;
            breakdown.p['Cement'][loc(global.tech['isolation'] ? 'job_cement_worker_bd' : 'city_cement_plant_bd')] = factory_output + 'v';
            if (factory_output > 0){
                if (global.tech['isolation']){
                    breakdown.p['Cement'][`ᄂ${loc('tau_home_colony')}+0`] = ((tauBonus - 1) * 100) + '%';
                    breakdown.p['Cement'][`ᄂ${loc('tau_home_mining_pit')}+0`] = ((mining_pit - 1) * 100) + '%';
                }
                breakdown.p['Cement'][`ᄂ${loc('power')}+0`] = ((powered_mult - 1) * 100) + '%';
                breakdown.p['Cement'][`ᄂ${loc('quarantine')}+0`] = ((cq_multiplier - 1) * 100) + '%';
            }

            if (hell_factory > 1){
                breakdown.p['Cement'][`ᄂ${loc('portal_factory_title')}+0`] = ((hell_factory - 1) * 100) + '%';
            }

            if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['cement_plant'] > 0){
                powered_mult = (powered_mult - 1) * 0.5 + 1;
                power_single = (power_single - 1) * 0.5 + 1;
                breakdown.p['Cement'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            let delta = factory_output * ai_core * tauBonus * mining_pit * hell_factory;
            if (global.city['cement_plant']){
                global.city.cement_plant['cnvay'] = +(delta * hunger * cq_multiplier * global_multiplier * (power_single - 1)).toFixed(5);
            }
            delta *= powered_mult * hunger * cq_multiplier * global_multiplier;

            if (global.tech['ai_core'] && p_on['citadel'] > 0){
                breakdown.p['Cement'][loc('interstellar_citadel_effect_bd')] = ((ai_core - 1) * 100) + '%';
            }
            breakdown.p['Cement'][loc('hunger')] = ((hunger - 1) * 100) + '%';
            modRes('Cement', delta * time_multiplier);
        }

        let shrineMetal = getShrineBonus('metal');

        // Smelters
        let iron_smelter = 0;
        let star_forge = 0;
        let iridium_smelter = 0;
        if (smelterUnlocked()){
            let capacity = global.city.smelter.count;
            if (p_on['stellar_forge']){
                star_forge = p_on['stellar_forge'] * actions.interstellar.int_neutron.stellar_forge.smelting();
                global.city.smelter.Star = Math.max(global.city.smelter.Star, star_forge);
                capacity += star_forge;
            }
            if (p_on['hell_forge']){
                capacity += p_on['hell_forge'] * actions.portal.prtl_ruins.hell_forge.smelting();
            }
            if (p_on['demon_forge']){
                capacity += p_on['demon_forge'] * actions.portal.prtl_wasteland.demon_forge.smelting();
            }
            if (p_on['sacred_smelter']){
                capacity += p_on['sacred_smelter'] * actions.eden.eden_elysium.sacred_smelter.smelting();
            }
            if (p_on['ore_refinery']){
                capacity += p_on['ore_refinery'] * actions.tauceti.tau_gas.ore_refinery.smelting();
            }
            if (global.space['hell_smelter']){
                capacity += global.space.hell_smelter.count * actions.space.spc_hell.hell_smelter.smelting();
            }
            if (p_on['geothermal']){
                capacity += p_on['geothermal'] * actions.space.spc_hell.geothermal.smelting();
            }
            global.city.smelter.cap = capacity;
            global.city.smelter.StarCap = star_forge;

            if (global.race['forge']){
                global.city.smelter.Wood = 0;
                global.city.smelter.Coal = 0;
                global.city.smelter.Oil = Math.max(0, global.city.smelter.cap - global.city.smelter.Star - global.city.smelter.Inferno);
            }

            if ((global.race['kindling_kindred'] || global.race['smoldering']) && !global.race['evil']){
                if (global.city.smelter.Wood !== 0){
                    global.city.smelter.Coal += global.city.smelter.Wood;
                    global.city.smelter.Wood = 0;
                }
            }

            let total_fuel = 0;
            ['Wood', 'Coal', 'Oil', 'Star', 'Inferno'].forEach(function(fuel){
                if (total_fuel + global.city.smelter[fuel] > global.city.smelter.cap){
                    global.city.smelter[fuel] = global.city.smelter.cap - total_fuel;
                }
                total_fuel += global.city.smelter[fuel]
            });

            if (global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium > total_fuel){
                let overflow = global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium - total_fuel;
                global.city.smelter.Iron -= overflow;
                if (global.city.smelter.Iron < 0){
                    overflow = global.city.smelter.Iron;
                    global.city.smelter.Iron = 0;
                    global.city.smelter.Iridium += overflow;
                    if (global.city.smelter.Iridium < 0){
                        overflow = global.city.smelter.Iridium;
                        global.city.smelter.Iridium = 0;
                    }
                    else {
                        overflow = 0;
                    }
                    global.city.smelter.Steel += overflow;
                    if (global.city.smelter.Steel < 0){
                        global.city.smelter.Steel = 0;
                    }
                }
            }
            else if (global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium < total_fuel){
                let irid_smelt = global.tech['irid_smelting'] || (global.tech['m_smelting'] && global.tech.m_smelting >= 2) ? true : false;
                if (!(global.resource.Iridium.display && irid_smelt) && !(global.resource.Steel.display && global.tech.smelting >= 2 && !global.race['steelen'])){
                    global.city.smelter.Iron++;
                }
            }

            if (global.city.smelter.Star > global.city.smelter.StarCap){
                let overflow = global.city.smelter.Star - global.city.smelter.StarCap;
                global.city.smelter.Star = global.city.smelter.StarCap;
                global.city.smelter.Oil += overflow;
            }

            let fuel_config = smelterFuelConfig();
            let consume_wood = global.city.smelter.Wood * fuel_config.l_cost;
            let consume_coal = global.city.smelter.Coal * fuel_config.c_cost;
            let consume_oil = global.city.smelter.Oil * fuel_config.o_cost;
            iron_smelter = global.city.smelter.Iron;
            let steel_smelter = global.city.smelter.Steel;
            iridium_smelter = global.city.smelter.Iridium;
            let oil_bonus = global.city.smelter.Oil;
            let inferno_bonus = global.city.smelter.Inferno;

            if (global.race['steelen']) {
                iron_smelter += steel_smelter;
                steel_smelter = 0;
            }

            let disable_smelters = Math.max(0, iron_smelter + steel_smelter + iridium_smelter - total_fuel);

            if (consume_wood > 0){
                let max_operable = Math.max(0, Math.floor(global.resource[fuel_config.l_type].amount / (fuel_config.l_cost * time_multiplier)));
                if (max_operable < global.city.smelter.Wood){
                    disable_smelters += global.city.smelter.Wood - max_operable;
                    consume_wood = max_operable * fuel_config.l_cost;
                }
            }

            if (consume_coal > 0){
                let max_operable = Math.max(0, Math.floor(global.resource.Coal.amount / (fuel_config.c_cost * time_multiplier)));
                if (max_operable < global.city.smelter.Coal){
                    disable_smelters += global.city.smelter.Coal - max_operable;
                    consume_coal = max_operable * fuel_config.c_cost;
                }
            }

            if (consume_oil > 0){
                let max_operable = Math.max(0, Math.floor(global.resource.Oil.amount / (fuel_config.o_cost * time_multiplier)));
                if (max_operable < oil_bonus){
                    disable_smelters += oil_bonus - max_operable;
                    consume_oil = max_operable * fuel_config.o_cost;
                    oil_bonus = max_operable;
                }
            }

            if (inferno_bonus > 0){
                let inferno_rate = {
                    Oil: 35,
                    Coal: 50,
                    Infernite: 0.5
                };
                let max_operable_oil = Math.floor((global.resource.Oil.amount - consume_oil) / (inferno_rate.Oil * time_multiplier));
                let max_operable_coal = Math.floor((global.resource.Coal.amount - consume_coal) / (inferno_rate.Coal * time_multiplier));
                let max_operable_infernite = Math.floor(global.resource.Infernite.amount / (inferno_rate.Infernite * time_multiplier));
                let max_operable = Math.max(0, Math.min(max_operable_oil, max_operable_coal, max_operable_infernite));
                if (max_operable < inferno_bonus){
                    disable_smelters += inferno_bonus - max_operable;
                    inferno_bonus = max_operable;
                }

                consume_oil += inferno_rate.Oil * inferno_bonus;
                consume_coal += inferno_rate.Coal * inferno_bonus;

                let consume_infernite = inferno_rate.Infernite * inferno_bonus;
                breakdown.p.consume.Infernite[loc('city_smelter')] = -(consume_infernite);
                modRes('Infernite', -(consume_infernite * time_multiplier));
            }

            if (disable_smelters > 0){
                let disable_steel = Math.min(disable_smelters, steel_smelter);
                steel_smelter -= disable_steel;
                disable_smelters -= disable_steel;

                let disable_iron = Math.min(disable_smelters, iron_smelter);
                iron_smelter -= disable_iron;
                disable_smelters -= disable_iron;

                let disable_iridium = Math.min(disable_smelters, iridium_smelter);
                iridium_smelter -= disable_iridium;
                disable_smelters -= disable_iridium;
            }

            iron_smelter *= global.tech['smelting'] >= 3 ? 1.2 : 1;
            iridium_smelter *= 0.05;

            let dirtVal = govActive('dirty_jobs',2);
            if (dirtVal){
                iron_smelter *= 1 + (dirtVal / 100);
                iridium_smelter *= 1 + (dirtVal / 100);
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
            if (star_forge > 0){
                iron_smelter *= 1 + (star_forge / 500);
                iridium_smelter *= 1 + (star_forge / 75);
            }
            if (global.race['pyrophobia']){
                iron_smelter *= 1 - (traits.pyrophobia.vars()[0] / 100);
                iridium_smelter *= 1 - (traits.pyrophobia.vars()[0] / 100);
            }
            if (global.race['elemental'] && traits.elemental.vars()[0] === 'fire'){
                iron_smelter *= 1 + highPopAdjust(traits.elemental.vars()[3] * global.resource[global.race.species].amount / 100);
                iridium_smelter *= 1 + highPopAdjust(traits.elemental.vars()[3] * global.resource[global.race.species].amount / 100);
            }

            let salFathom = fathomCheck('salamander');
            if (salFathom > 0){
                iron_smelter *= 1 + (0.2 * salFathom);
                iridium_smelter *= 1 + (0.2 * salFathom);
            }

            breakdown.p.consume[fuel_config.l_type][loc('city_smelter')] = -(consume_wood);
            breakdown.p.consume.Coal[loc('city_smelter')] = -(consume_coal);
            breakdown.p.consume.Oil[loc('city_smelter')] = -(consume_oil);

            modRes(fuel_config.l_type, -(consume_wood * time_multiplier));
            modRes('Coal', -(consume_coal * time_multiplier));
            modRes('Oil', -(consume_oil * time_multiplier));

            // Uranium Ash (from coal smelters)
            if (consume_coal > 0 && global.tech['uranium'] && global.tech['uranium'] >= 3){
                let ash = consume_coal / 65;
                if (global.city.geology['Uranium']){
                    ash *= global.city.geology['Uranium'] + 1;
                }
                ash *= production('psychic_boost','Uranium');
                modRes('Uranium', ash * time_multiplier);
                // Display on the right side of the breakdown to demonstrate that there is no global production scaling
                breakdown.p.consume['Uranium'][loc('city_coal_ash')] = (breakdown.p.consume['Uranium'][loc('city_coal_ash')] ?? 0) + ash;
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
                if (global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 2){
                    steel_base *= 1.1;
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
                if (star_forge){
                    steel_smelter *= 1 + (star_forge / 500);
                }
                if (dirtVal){
                    steel_smelter *= 1 + (dirtVal / 100);
                }
                if (global.race['elemental'] && traits.elemental.vars()[0] === 'fire'){
                    steel_smelter *= 1 + highPopAdjust(traits.elemental.vars()[3] * global.resource[global.race.species].amount / 100);
                }
                if (salFathom > 0){
                    steel_smelter *= 1 + (0.2 * salFathom);
                }

                let smelter_output = steel_smelter * steel_base * production('psychic_boost','Steel');
                if (global.race['pyrophobia']){
                    smelter_output *= 1 - (traits.pyrophobia.vars()[0] / 100);
                }

                let delta = smelter_output;
                delta *= hunger * global_multiplier * shrineMetal.mult;

                breakdown.p['Steel'][loc('city_smelter')] = smelter_output + 'v';
                breakdown.p['Steel'][loc('city_shrine')] = ((shrineMetal.mult - 1) * 100).toFixed(1) + '%';
                breakdown.p['Steel'][loc('hunger')] = ((hunger - 1) * 100) + '%';
                modRes('Steel', delta * time_multiplier);

                if (global.tech['titanium'] && global.tech['titanium'] >= 1){
                    let titanium = smelter_output * hunger * production('psychic_boost','Titanium');
                    if (star_forge > 0){
                        delta *= 1 + (star_forge / 50);
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
                    breakdown.p['Titanium'][loc('resource_Steel_name')] = (titanium / divisor) + 'v';
                }
            }
        }

        // Graphene
        let graph_source = global.race['truepath'] ? 'space' : 'interstellar';
        let graph_struct = 'g_factory';
        if (global.race['warlord']){
            graph_source = 'portal'; graph_struct = 'twisted_lab';
        }
        if (global[graph_source][graph_struct] && global[graph_source][graph_struct].count > 0){
            let on_graph = global.race['truepath'] ? support_on['g_factory'] : (global.race['warlord'] ? p_on['twisted_lab'] : int_on['g_factory']);
            let max_graph = global[graph_source][graph_struct].on;
            let eff = max_graph > 0 ? on_graph / max_graph : 0;
            let remaining = max_graph;

            if (global.race['kindling_kindred'] || global.race['smoldering']){
                global[graph_source][graph_struct].Lumber = 0;
            }

            ['Oil','Coal','Lumber'].forEach(function(res){
                remaining -= global[graph_source][graph_struct][res];
                if (remaining < 0) {
                    global[graph_source][graph_struct][res] += remaining;
                    remaining = 0;
                }
            });

            let graphene_production = global[graph_source][graph_struct].Lumber + global[graph_source][graph_struct].Coal + global[graph_source][graph_struct].Oil;
            if (graphene_production > 0){
                let consume_wood = global[graph_source][graph_struct].Lumber * 350 * eff;
                let consume_coal = global[graph_source][graph_struct].Coal * 25 * eff;
                let consume_oil = global[graph_source][graph_struct].Oil * 15 * eff;

                while (consume_wood * time_multiplier > global.resource.Lumber.amount && consume_wood > 0){
                    consume_wood -= 350 * eff;
                    graphene_production--;
                }
                while (consume_coal * time_multiplier > global.resource.Coal.amount && consume_coal > 0){
                    consume_coal -= 25 * eff;
                    graphene_production--;
                }
                while (consume_oil * time_multiplier > global.resource.Oil.amount && consume_oil > 0){
                    consume_oil -= 15 * eff;
                    graphene_production--;
                }

                graphene_production *= production('g_factory') * production('psychic_boost','Graphene');

                breakdown.p.consume.Lumber[global.race['warlord'] ? loc('portal_twisted_lab_title') : loc('interstellar_g_factory_bd')] = -(consume_wood);
                breakdown.p.consume.Coal[global.race['warlord'] ? loc('portal_twisted_lab_title') : loc('interstellar_g_factory_bd')] = -(consume_coal);
                breakdown.p.consume.Oil[global.race['warlord'] ? loc('portal_twisted_lab_title') : loc('interstellar_g_factory_bd')] = -(consume_oil);

                modRes('Lumber', -(consume_wood * time_multiplier));
                modRes('Coal', -(consume_coal * time_multiplier));
                modRes('Oil', -(consume_oil * time_multiplier));

                if (global.civic.govern.type === 'corpocracy'){
                    graphene_production *= 1 + (govEffect.corpocracy()[4] / 100);
                }
                if (global.civic.govern.type === 'socialist'){
                    graphene_production *= 1 + (govEffect.socialist()[1] / 100);
                }

                let ai = 1;
                if (global.tech['ai_core'] >= 3){
                    let graph = +(quantum_level / 5).toFixed(1) / 100;
                    ai += graph * p_on['citadel'];
                }

                let incinerator = 1;
                if (global.race['warlord'] && global.portal.hasOwnProperty('incinerator') && global.portal.incinerator.rank > 1){
                    let rank = global.portal.incinerator.rank - 1;
                    incinerator += rank * 15 * global.portal.incinerator.on / 100;
                }

                let synd = global.race['truepath'] ? syndicate('spc_titan') : 1;
                let delta = graphene_production * ai * zigVal * hunger * global_multiplier * synd * eff * incinerator;
                breakdown.p['Graphene'][global.race['warlord'] ? loc('portal_twisted_lab_title') : loc('interstellar_g_factory_bd')] = (graphene_production) + 'v';
                if (global.tech['isolation'] && graphene_production > 0){
                    delta *= womling_technician;
                    if (womling_technician > 1){
                        breakdown.p['Graphene'][`ᄂ${loc('tau_red_womlings')}+0`] = ((womling_technician - 1) * 100) + '%';
                    }
                }

                if (incinerator > 1){
                    breakdown.p['Graphene'][`ᄂ${loc('portal_incinerator_title')}`] = ((incinerator - 1) * 100) + '%';
                }

                if (graphene_production > 0){
                    breakdown.p['Graphene'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                    breakdown.p['Graphene'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                }

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    breakdown.p['Graphene'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                if (p_on['citadel'] > 0){
                    breakdown.p['Graphene'][loc('interstellar_citadel_effect_bd')] = ((ai - 1) * 100) + '%';
                }
                breakdown.p['Graphene'][loc('hunger')] = ((hunger - 1) * 100) + '%';
                modRes('Graphene', delta * time_multiplier);
            }
            else {
                breakdown.p['Graphene'] = 0;
            }
        }

        // Vitreloy
        if (global.galaxy['vitreloy_plant'] && p_on['vitreloy_plant'] > 0){

            let consume_money = 50000;
            let consume_bolognium = 2.5;
            let consume_stanene = 100;
            let vitreloy_production = p_on['vitreloy_plant'];

            vitreloy_production = Math.min(vitreloy_production, Math.floor(global.resource.Money.amount / (consume_money * time_multiplier)));
            vitreloy_production = Math.min(vitreloy_production, Math.floor(global.resource.Bolognium.amount / (consume_bolognium * time_multiplier)));
            vitreloy_production = Math.min(vitreloy_production, Math.floor(global.resource.Stanene.amount / (consume_stanene * time_multiplier)));
            vitreloy_production = Math.max(vitreloy_production, 0);

            if (vitreloy_production > 0){
                consume_money *= vitreloy_production;
                consume_bolognium *= vitreloy_production;
                consume_stanene *= vitreloy_production;
                vitreloy_production *= production('vitreloy_plant') * production('psychic_boost','Vitreloy');

                breakdown.p.consume.Money[loc('galaxy_vitreloy_plant_bd')] = -(consume_money);
                breakdown.p.consume.Bolognium[loc('galaxy_vitreloy_plant_bd')] = -(consume_bolognium);
                breakdown.p.consume.Stanene[loc('galaxy_vitreloy_plant_bd')] = -(consume_stanene);

                modRes('Money', -(consume_money * time_multiplier));
                modRes('Bolognium', -(consume_bolognium * time_multiplier));
                modRes('Stanene', -(consume_stanene * time_multiplier));

                let pirate = piracy('gxy_alien1');

                breakdown.p['Vitreloy'][loc('galaxy_vitreloy_plant_bd')] = (vitreloy_production) + 'v';

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    vitreloy_production *= 0.5;
                    breakdown.p['Vitreloy'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                if (vitreloy_production > 0){
                    breakdown.p['Vitreloy'][`ᄂ${loc('galaxy_piracy')}+0`] = -((1 - pirate) * 100) + '%';
                    breakdown.p['Vitreloy'][`ᄂ${loc('space_red_ziggurat_title')}+0`] = ((zigVal - 1) * 100) + '%';
                }
                modRes('Vitreloy', vitreloy_production * hunger * global_multiplier * pirate * time_multiplier * zigVal);
            }
        }

        if (p_on['shadow_mine']){
            let attract = p_on['soul_attractor'] ? 1 + (p_on['soul_attractor'] * (global.tech.pitspawn >= 3 ? 0.2 : 0.1)) : 1;

            if (global.resource.Vitreloy.display){ // Vitreloy
                let rate = production('shadow_mine','vitreloy');
                let mine_base = p_on['shadow_mine'] * rate * production('psychic_boost','Vitreloy');
                let mine_delta = mine_base * attract * global_multiplier;

                if (mine_base > 0){
                    breakdown.p['Vitreloy'][loc('portal_shadow_mine_title')] = mine_base + 'v';
                    breakdown.p['Vitreloy'][`ᄂ${loc('portal_soul_attractor_title')}+0`] = ((attract - 1) * 100) + '%';
                }
                modRes('Vitreloy', mine_delta * time_multiplier);
            }
            
            if (global.resource.Elerium.display){ // Elerium
                let rate = production('shadow_mine','elerium');
                let mine_base = p_on['shadow_mine'] * rate * production('psychic_boost','Elerium');

                let mine_delta = mine_base * attract * global_multiplier;

                if (mine_base > 0){
                    breakdown.p['Elerium'][loc('portal_shadow_mine_title')] = mine_base + 'v';
                    breakdown.p['Elerium'][`ᄂ${loc('portal_soul_attractor_title')}+0`] = ((attract - 1) * 100) + '%';
                }
                modRes('Elerium', mine_delta * time_multiplier);
            }

            if (global.resource.Infernite.display){ // Infernite
                let rate = production('shadow_mine','infernite');
                let mine_base = p_on['shadow_mine'] * rate * production('psychic_boost','Infernite');

                let mine_delta = mine_base * attract * global_multiplier;

                if (mine_base > 0){
                    breakdown.p['Infernite'][loc('portal_shadow_mine_title')] = mine_base + 'v';
                    breakdown.p['Infernite'][`ᄂ${loc('portal_soul_attractor_title')}+0`] = ((attract - 1) * 100) + '%';
                }
                modRes('Infernite', mine_delta * time_multiplier);
            }
        }

        if (p_on['s_gate'] && global.galaxy['raider'] && gal_on['raider'] > 0){
            let base = gal_on['raider'] * 0.05 * production('psychic_boost','Vitreloy');
            let pirate = piracy('gxy_chthonian');
            let delta = base * global_multiplier * pirate * hunger * zigVal;

            breakdown.p['Vitreloy'][loc('galaxy_raider')] = base + 'v';
            if (base > 0){
                breakdown.p['Vitreloy'][`ᄂ${loc('galaxy_piracy')}+1`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Vitreloy'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = ((zigVal - 1) * 100) + '%';
            }
            modRes('Vitreloy', delta * time_multiplier);
        }
        breakdown.p['Vitreloy'][loc('hunger')] = ((hunger - 1) * 100) + '%';

        if (!global.tech['isolation'] && global.space['lander'] && global.space['crashed_ship'] && global.space.crashed_ship.count === 100){
            let synd = syndicate('spc_triton');
            let base = support_on['lander'] * production('lander');
            let delta = base * global_multiplier * synd * hunger;

            breakdown.p['Cipher'][loc('space_lander_title')] = base + 'v';
            breakdown.p['Cipher'][`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
            breakdown.p['Cipher'][`ᄂ${loc('hunger')}`] = ((hunger - 1) * 100) + '%';

            modRes('Cipher', delta * time_multiplier);

            if (global.resource.Cipher.display && global.tech['outer'] && global.tech.outer === 2){
                global.tech.outer = 3;
                drawTech();
            }
        }

        if (!global.tech['isolation'] && global.space['digsite'] && global.space.digsite.count === 100){
            if (!global.tech['dig_control']){
                global.tech['dig_control'] = 1;
                drawTech();
            }

            let synd = syndicate('spc_eris');
            let shock_base = support_on['shock_trooper'] * production('shock_trooper');
            let tank_base = support_on['tank'] * production('tank');

            if (support_on['shock_trooper']){
                breakdown.p['Cipher'][loc('space_shock_trooper_title')] = shock_base + 'v';
                breakdown.p['Cipher'][`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
            }
            if (support_on['tank']){
                breakdown.p['Cipher'][loc('space_tank_title')] = tank_base + 'v';
                breakdown.p['Cipher'][`ᄂ${loc('space_syndicate')}+2`] = -((1 - synd) * 100) + '%';
            }

            let delta = (shock_base + tank_base) * global_multiplier * synd;
            modRes('Cipher', delta * time_multiplier);
        }
        
        if(global.portal['oven_complete'] && p_on['oven_complete'] && !global.tech['dish_reset'] && global.portal['devilish_dish'].done >= 100){
            global.tech['dish_reset'] = 1;
            drawTech();
        }

        if (global.tech['isolation'] && global.tauceti['alien_outpost'] && p_on['alien_outpost']){
            let base = production('alien_outpost');
            let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);

            breakdown.p['Cipher'][loc('tech_alien_outpost')] = base + 'v';
            if (base > 0){
                breakdown.p['Cipher'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
            }

            let delta = base * global_multiplier * colony_val;
            modRes('Cipher', delta * time_multiplier);
        }

        // Extractor Ship & Ore Refinery
        let e_ship = {};
        if (global.tauceti['ore_refinery'] && global.tauceti['mining_ship'] && global.tech['tau_roid'] && global.tech.tau_roid >= 4){
            global.tauceti.ore_refinery.max = global.tauceti.ore_refinery.count * 1000;

            // Refine Ore
            if (global.tauceti.ore_refinery.fill > 0){
                let raw = p_on['ore_refinery'] * production('ore_refinery');
                if (raw > global.tauceti.ore_refinery.fill){
                    raw = global.tauceti.ore_refinery.fill;
                }
                global.tauceti.ore_refinery.fill -= raw * time_multiplier;

                let c_ratio = global.tech.tau_roid >= 5 ? 0.6 : 0.64;
                let u_ratio = global.tech.tau_roid >= 5 ? 0.35 : 0.36;

                e_ship['iron'] = raw * c_ratio * (100 - global.tauceti.mining_ship.common) / 100 * production('mining_ship_ore','iron') * production('psychic_boost','Iron');
                e_ship['aluminium'] = raw * c_ratio * global.tauceti.mining_ship.common / 100 * production('mining_ship_ore','aluminium') * production('psychic_boost','Aluminium');
                e_ship['iridium'] = raw * u_ratio * (100 - global.tauceti.mining_ship.uncommon) / 100 * production('mining_ship_ore','iridium') * production('psychic_boost','Iridium');
                e_ship['neutronium'] = raw * u_ratio * global.tauceti.mining_ship.uncommon / 100 * production('mining_ship_ore','neutronium') * production('psychic_boost','Neutronium');

                if (global.tech.tau_roid >= 5){
                    e_ship['orichalcum'] = raw * 0.05 * (100 - global.tauceti.mining_ship.rare) / 10 * production('mining_ship_ore','orichalcum') * production('psychic_boost','Orichalcum');
                    e_ship['elerium'] = raw * 0.05 * global.tauceti.mining_ship.rare / 10 * production('mining_ship_ore','elerium') * production('psychic_boost','Elerium');
                }
            }

            // Get new Ore
            let ore = support_on['mining_ship'] * production('mining_ship');
            global.tauceti.ore_refinery.fill += ore * time_multiplier;
            if (global.tauceti.ore_refinery.fill > global.tauceti.ore_refinery.max){
                global.tauceti.ore_refinery.fill = global.tauceti.ore_refinery.max;
            }
        }

        // Lumber
        { //block scope
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                if (global.tech['mars'] && support_on['biodome'] && !global.race['kindling_kindred'] && !global.race['smoldering']){
                    let lumber = support_on['biodome'] * workerScale(global.civic.colonist.workers,'colonist') * production('biodome','lumber') * production('psychic_boost','Lumber');

                    breakdown.p['Lumber'][actions.space.spc_red.biodome.title()] = lumber  + 'v';
                    if (lumber > 0){
                        breakdown.p['Lumber'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                    }
                    breakdown.p['Lumber'][loc('hunger')] = ((hunger - 1) * 100) + '%';

                    modRes('Lumber', lumber * hunger * global_multiplier * time_multiplier * zigVal);
                }
            }
            else if (global.race['soul_eater'] && global.race.species !== 'wendigo' && global.race['evil']){
                let weapons = weaponTechModifer();
                let hunters = workerScale(global.civic.hunter.workers,'hunter');
                hunters *= racialTrait(hunters,'hunting');

                if (global.race['servants']){
                    let serve = jobScale(global.race.servants.jobs.hunter);
                    serve *= servantTrait(global.race.servants.jobs.hunter,'hunting');
                    hunters += highPopAdjust(serve);
                }

                hunters *= weapons / 2;
                hunters *= production('psychic_boost','Lumber');

                let soldiers = armyRating(garrisonSize(),'hunting') / 3;
                soldiers *= production('psychic_boost','Lumber');

                breakdown.p['Lumber'][jobName('hunter')] = hunters  + 'v';
                breakdown.p['Lumber'][loc('soldiers')] = soldiers  + 'v';
                breakdown.p['Lumber'][loc('hunger')] = ((hunger - 1) * 100) + '%';
                modRes('Lumber', hunters * hunger * global_multiplier * time_multiplier);
                modRes('Lumber', soldiers * hunger * global_multiplier * time_multiplier);
            }
            else if (global.race['evil']){
                let reclaimers = workerScale(global.civic.lumberjack.workers,'lumberjack');
                reclaimers *= racialTrait(reclaimers,'lumberjack');

                if (global.race['servants']){
                    let serve = global.race.servants.jobs.lumberjack;
                    serve *= servantTrait(global.race.servants.jobs.lumberjack,'lumberjack');
                    reclaimers += serve;
                }

                reclaimers *= production('psychic_boost','Lumber');

                let graveyard = 1;
                if (global.city['graveyard']){
                    graveyard += global.city['graveyard'].count * 0.08;
                }

                let soldiers = armyRating(garrisonSize(),'hunting') / 5;
                soldiers *= production('psychic_boost','Lumber');

                breakdown.p['Lumber'][jobName('lumberjack')] = reclaimers  + 'v';
                if (reclaimers > 0){
                    breakdown.p['Lumber'][`ᄂ${loc('city_graveyard')}+0`] = ((graveyard - 1) * 100) + '%';
                    breakdown.p['Lumber'][`ᄂ${loc('quarantine')}+0`] = ((q_multiplier - 1) * 100) + '%';
                }
                breakdown.p['Lumber'][loc('soldiers')] = soldiers  + 'v';
                if (soldiers > 0){
                    breakdown.p['Lumber'][`ᄂ${loc('quarantine')}+1`] = ((q_multiplier - 1) * 100) + '%';
                }
                if (global.race['forager']){
                    let forage = 1;
                    let foragers = workerScale(global.civic.forager.workers,'forager');
                    foragers *= racialTrait(foragers,'forager');

                    if (global.race['servants']){
                        let serve = global.race.servants.jobs.forager;
                        serve *= servantTrait(global.race.servants.jobs.forager,'forager');
                        foragers += serve;
                    }

                    let forage_base = foragers * forage * 0.25;
                    breakdown.p['Lumber'][jobName('forager')] = forage_base  + 'v';
                    if (forage_base > 0){
                        breakdown.p['Lumber'][`ᄂ${loc('city_graveyard')}+1`] = ((graveyard - 1) * 100) + '%';
                        breakdown.p['Lumber'][`ᄂ${loc('quarantine')}+2`] = ((q_multiplier - 1) * 100) + '%';
                    }
                    modRes('Lumber', forage_base * hunger * graveyard * global_multiplier * q_multiplier * time_multiplier);
                }
                breakdown.p['Lumber'][loc('hunger')] = ((hunger - 1) * 100) + '%';
                modRes('Lumber', reclaimers * hunger * graveyard * global_multiplier * q_multiplier * time_multiplier);
                modRes('Lumber', soldiers * hunger * global_multiplier * q_multiplier * time_multiplier);
            }
            else {
                let lumber_base = workerScale(global.civic.lumberjack.workers,'lumberjack');
                lumber_base *= racialTrait(lumber_base,'lumberjack');

                if (global.race['servants']){
                    let serve = global.race.servants.jobs.lumberjack;
                    serve *= servantTrait(global.race.servants.jobs.lumberjack,'lumberjack');
                    lumber_base += serve;
                }

                lumber_base *= global.city.biome === 'forest' ? biomes.forest.vars()[0] : 1;
                lumber_base *= global.city.biome === 'savanna' ? biomes.savanna.vars()[2] : 1;
                lumber_base *= global.city.biome === 'desert' ? biomes.desert.vars()[2] : 1;
                lumber_base *= global.city.biome === 'swamp' ? biomes.swamp.vars()[2] : 1;
                lumber_base *= global.city.biome === 'taiga' ? biomes.taiga.vars()[0] : 1;
                lumber_base *= global.civic.lumberjack.impact;
                if (global.race['living_tool']){
                    lumber_base *= traits.living_tool.vars()[0] * (global.tech['science'] && global.tech.science > 0 ? global.tech.science * 0.25 : 0) + 1;
                }
                else {
                    lumber_base *= (global.tech['axe'] && global.tech.axe > 1 ? (global.tech.axe - 1) * 0.35 : 0) + 1;
                }
                lumber_base *= production('psychic_boost','Lumber');

                let sawmills = 1;
                if (global.city['sawmill']){
                    let saw = global.tech['saw'] >= 2 ? 0.08 : 0.05;
                    sawmills *= (global.city.sawmill.count * saw) + 1;
                }
                let power_mult = 1;
                let power_single = 1;
                if (global.city.powered && global.city.sawmill && p_on['sawmill']){
                    power_mult += (p_on['sawmill'] * 0.04);
                    power_single += 0.04;
                }
                let lumber_yard = 1;
                if (global.city['lumber_yard']){
                    lumber_yard += global.city['lumber_yard'].count * 0.02;
                }

                breakdown.p['Lumber'][jobName('lumberjack')] = lumber_base + 'v';
                if (lumber_base > 0){
                    breakdown.p['Lumber'][`ᄂ${loc('city_lumber_yard')}`] = ((lumber_yard - 1) * 100) + '%';
                    breakdown.p['Lumber'][`ᄂ${loc('city_sawmill')}`] = ((sawmills - 1) * 100) + '%';
                    breakdown.p['Lumber'][`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
                    breakdown.p['Lumber'][`ᄂ${loc('quarantine')}+0`] = ((q_multiplier - 1) * 100) + '%';
                }
                if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['sawmill'] > 0){
                    power_mult = (power_mult - 1) * 0.5 + 1;
                    power_single = (power_single - 1) * 0.5 + 1;
                    breakdown.p['Lumber'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                let delta = lumber_base * sawmills * lumber_yard;
                if (global.city['sawmill']){
                    global.city.sawmill['psaw'] = +(delta * hunger * q_multiplier * global_multiplier * (power_single - 1)).toFixed(5);
                }
                delta *= power_mult * hunger * q_multiplier * global_multiplier;

                if (global.race['forager']){
                    let forage = 1;
                    let foragers = workerScale(global.civic.forager.workers,'forager');
                    foragers *= racialTrait(foragers,'forager');

                    if (global.race['servants']){
                        let serve = global.race.servants.jobs.forager;
                        serve *= servantTrait(global.race.servants.jobs.forager,'forager');
                        foragers += serve;
                    }

                    let forage_base = foragers * forage * 0.25 * production('psychic_boost','Lumber');
                    breakdown.p['Lumber'][jobName('forager')] = forage_base  + 'v';
                    if (lumber_base > 0){
                        breakdown.p['Lumber'][`ᄂ${loc('city_lumber_yard')}`] = ((lumber_yard - 1) * 100) + '%';
                        breakdown.p['Lumber'][`ᄂ${loc('city_sawmill')}`] = ((sawmills - 1) * 100) + '%';
                        breakdown.p['Lumber'][`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
                        breakdown.p['Lumber'][`ᄂ${loc('quarantine')}+0`] = ((q_multiplier - 1) * 100) + '%';
                    }

                    modRes('Lumber', forage_base * hunger * q_multiplier * sawmills * lumber_yard * power_mult * global_multiplier * time_multiplier);
                }

                breakdown.p['Lumber'][loc('hunger')] = ((hunger - 1) * 100) + '%';
                modRes('Lumber', delta * time_multiplier);
            }
        }

        let refinery = global.city['metal_refinery'] ? global.city['metal_refinery'].count * 6 : 0;
        refinery *= q_multiplier;

        // Stone / Amber
        if (global.race['sappy']){
            if (global.tech['mining'] && global.resource[global.race.species].amount > 0){
                let stone_base = global.resource[global.race.species].amount * traits.sappy.vars()[0] * production('psychic_boost','Stone');
                if (global.race['high_pop']){
                    stone_base = highPopAdjust(stone_base);
                }
                let cactiFathom = fathomCheck('cacti');
                if (cactiFathom > 0){
                    stone_base *= 1 + (0.32 * cactiFathom);
                }
                breakdown.p['Stone'][flib('name')] = stone_base + 'v';
                if (global.city.hasOwnProperty('basic_housing')){
                    let grove = global.city.basic_housing.count * 0.025;
                    stone_base *= 1 + grove;
                    breakdown.p['Stone'][`ᄂ${housingLabel('small')}`] = (grove * 100) + '%';
                }

                let soldiers = 0;
                if (global.civic.hasOwnProperty('garrison')){
                    soldiers = global.civic.garrison.workers * traits.sappy.vars()[0];
                    if (global.race['high_pop']){
                        soldiers = highPopAdjust(soldiers);
                    }
                    breakdown.p['Stone'][loc('soldiers')] = soldiers + 'v';
                }

                let delta = (stone_base + soldiers) * hunger * global_multiplier;
                breakdown.p['Stone'][loc('hunger')] = ((hunger - 1) * 100) + '%';

                modRes('Stone', delta * time_multiplier);
            }
        }
        else {
            let quarriers = global.race['warlord'] ? global.civic.miner.workers : global.civic.quarry_worker.workers;
            let stone_prod_name = global.race['warlord'] ? jobName('miner') : loc('workers');
            quarriers = workerScale(quarriers,'quarry_worker');
            let stone_base = quarriers * racialTrait(quarriers,'miner');
            let cactiFathom = fathomCheck('cacti');
            if (cactiFathom > 0){
                stone_base *= 1 + (0.32 * cactiFathom);
            }

            if (global.race['servants']){
                let serve = global.race.servants.jobs.quarry_worker;
                serve *= servantTrait(global.race.servants.jobs.quarry_worker,'miner');
                stone_base += serve;
            }
            stone_base *= global.civic.quarry_worker.impact;

            let asbestos_base = 0;

            let forage_base = 0;
            if (global.race['forager'] && global.resource.Stone.display){
                let foragers = workerScale(global.civic.forager.workers,'forager');
                forage_base = foragers * racialTrait(foragers,'forager');

                if (global.race['servants']){
                    let serve = global.race.servants.jobs.forager;
                    serve *= servantTrait(global.race.servants.jobs.forager,'forager');
                    forage_base += serve;
                }
                forage_base *= 0.22;
            }

            // Foragers excluded from use of tools
            if (global.race['living_tool'] || global.race['tusk']){
                // buffed twice with racial trait on purpose
                let lt = global.race['living_tool'] ? traits.living_tool.vars()[0] * (global.tech['science'] && global.tech.science > 0 ? global.tech.science * 0.06 : 0) + 1 : 1;
                let tusk = global.race['tusk'] ? ((traits.tusk.vars()[0] / 100) * (armyRating(jobScale(1),'army',0) / 100)) + 1 : 1;
                stone_base *= lt > tusk ? lt : tusk;
            }
            else {
                stone_base *= (global.tech['hammer'] && global.tech['hammer'] > 0 ? global.tech['hammer'] * 0.4 : 0) + 1;
            }

            let stone_environment = 1;
            if (global.city.biome === 'desert'){
                stone_environment *= biomes.desert.vars()[0];
            }
            if (global.city.biome === 'swamp'){
                stone_environment *= biomes.swamp.vars()[3];
            }
            if (global.tech['explosives'] && global.tech.explosives >= 2){
                stone_environment *= 1 + (global.tech.explosives * 0.25);
            }

            stone_base *= stone_environment;
            forage_base *= stone_environment;

            let tunneler = 1;
            if (global.race['warlord'] && global.portal['tunneler']){
                tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
            }

            let rock_quarry = 1;
            let power_single = 1;
            let power_mult = 1;
            let quarry_discharge = false;
            let zigValStone = 1;
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                stone_prod_name = structName('mine');

                if (global.tech['mars'] && support_on['red_mine']){
                    let mine_base = support_on['red_mine'] * workerScale(global.civic.colonist.workers,'colonist');
                    stone_base = mine_base * production('red_mine','stone');
                    zigValStone = zigVal;

                    if (global.race['smoldering'] && global.resource.Chrysotile.display){
                        asbestos_base = mine_base * production('red_mine','asbestos');
                        asbestos_base *= production('psychic_boost','Chrysotile');
                    }
                }
            }
            else if (global.city['rock_quarry']){
                rock_quarry += global.city['rock_quarry'].count * 0.02;
                if (p_on['rock_quarry']){
                    power_single += 0.04;
                    power_mult += (p_on['rock_quarry'] * 0.04);
                    quarry_discharge = global.race['discharge'] && global.race['discharge'] > 0;
                }

                // Foragers cannot find any chrysotile without rock quarries
                if (global.race['smoldering'] && global.resource.Chrysotile.display){
                    let asbestos_ratio = global.city.rock_quarry.asbestos / 100;
                    asbestos_base = (stone_base + forage_base) * asbestos_ratio;
                    asbestos_base *= production('psychic_boost','Chrysotile');

                    let stone_ratio = (100 - global.city.rock_quarry.asbestos) / 100;
                    stone_base *= stone_ratio;
                    forage_base *= stone_ratio;
                }
            }
            // Deferred until here so that Chrysotile cannot get both boosts
            stone_base *= production('psychic_boost','Stone');
            forage_base *= production('psychic_boost','Stone');

            breakdown.p['Stone'][stone_prod_name] = stone_base + 'v';
            if (stone_base > 0){
                if (zigValStone > 1){
                    breakdown.p['Stone'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                }
                breakdown.p['Stone'][`ᄂ${loc('city_rock_quarry')}`] = ((rock_quarry - 1) * 100) + '%';
                breakdown.p['Stone'][`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
                if (quarry_discharge){
                    breakdown.p['Stone'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }
                breakdown.p['Stone'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                breakdown.p['Stone'][`ᄂ${loc('quarantine')}+0`] = ((q_multiplier - 1) * 100) + '%';
            }

            if (global.race['smoldering'] && global.resource.Chrysotile.display){
                breakdown.p['Chrysotile'][stone_prod_name] = asbestos_base + 'v';
                if (asbestos_base > 0){
                    if (zigValStone > 1){
                        breakdown.p['Chrysotile'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                    }
                    breakdown.p['Chrysotile'][`ᄂ${loc('city_rock_quarry')}`] = ((rock_quarry - 1) * 100) + '%';
                    breakdown.p['Chrysotile'][`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
                    if (quarry_discharge){
                        breakdown.p['Chrysotile'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }
                    breakdown.p['Chrysotile'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p['Chrysotile'][`ᄂ${loc('quarantine')}+0`] = ((q_multiplier - 1) * 100) + '%';
                }
            }

            if (forage_base > 0){
                breakdown.p['Stone'][jobName('forager')] = forage_base + 'v';
                if (forage_base > 0){
                    breakdown.p['Stone'][`ᄂ${loc('city_rock_quarry')}+1`] = ((rock_quarry - 1) * 100) + '%';
                    breakdown.p['Stone'][`ᄂ${loc('power')}+1`] = ((power_mult - 1) * 100) + '%';
                    if (quarry_discharge){
                        breakdown.p['Stone'][`ᄂ${loc('evo_challenge_discharge')}+1`] = '-50%';
                    }
                    breakdown.p['Stone'][`ᄂ${loc('portal_tunneler_bd')}+1`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p['Stone'][`ᄂ${loc('quarantine')}+1`] = ((q_multiplier - 1) * 100) + '%';
                }
            }

            if (quarry_discharge){
                power_mult = (power_mult - 1) * 0.5 + 1;
                power_single = (power_single - 1) * 0.5 + 1;
            }

            let delta = (stone_base * zigValStone + forage_base) * rock_quarry * tunneler;
            if (global.city['rock_quarry']){
                global.city.rock_quarry['cnvay'] = +(delta * hunger * q_multiplier * global_multiplier * (power_single - 1)).toFixed(5);
            }
            delta *= power_mult * hunger * q_multiplier * global_multiplier;

            breakdown.p['Stone'][loc('hunger')] = ((hunger - 1) * 100) + '%';
            modRes('Stone', delta * time_multiplier);

            if (global.race['smoldering'] && global.resource.Chrysotile.display){
                // Different implementation from stone is intentional: foragers find 100% stone / 0% chrysotile without rock quarries
                let a_delta = asbestos_base * zigValStone * rock_quarry * tunneler;
                a_delta *=  power_mult * hunger * q_multiplier * global_multiplier;

                breakdown.p['Chrysotile'][loc('hunger')] = ((hunger - 1) * 100) + '%';
                modRes('Chrysotile', a_delta * time_multiplier);
            }

            // Aluminium
            if (global.city['metal_refinery'] && (global.city['metal_refinery'].count > 0 || global.race['cataclysm'] || global.race['orbit_decayed'] || global.race['warlord'])){
                let alum_ratio = global.race['cataclysm'] ? 0.16 : 0.08;
                let base = stone_base * alum_ratio;

                // Temporarily undo the effects of Discharge for better breakdown clarity
                if (quarry_discharge){
                    power_mult = (power_mult - 1) * 2 + 1;
                    power_single = (power_single - 1) * 2 + 1;
                }

                if (base > 0){
                    // This works in Cataclysm and Orbital Decay
                    if (global.city.geology['Aluminium']){
                        base *= global.city.geology['Aluminium'] + 1;
                    }
                    base *= production('psychic_boost','Aluminium');

                    breakdown.p['Aluminium'][stone_prod_name] = base + 'v';
                    if (global.race['cataclysm'] || global.race['orbit_decayed']){
                        breakdown.p['Aluminium'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                    }
                    breakdown.p['Aluminium'][`ᄂ${loc('city_rock_quarry')}+0`] = ((rock_quarry - 1) * 100) + '%';
                    breakdown.p['Aluminium'][`ᄂ${loc('power')}+0`] = ((power_mult - 1) * 100) + '%';
                    if (quarry_discharge){
                        breakdown.p['Aluminium'][`ᄂ${loc('evo_challenge_discharge')}+0`] = '-50%';
                    }
                    breakdown.p['Aluminium'][`ᄂ${loc('portal_tunneler_bd')}+0`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p['Aluminium'][`ᄂ${loc('quarantine')}+0`] = ((q_multiplier - 1) * 100) + '%';
                }

                let forage_alum_base = forage_base * alum_ratio;
                if (forage_alum_base > 0){
                    if (global.city.geology['Aluminium']){
                        forage_alum_base *= global.city.geology['Aluminium'] + 1;
                    }
                    forage_alum_base *= production('psychic_boost','Aluminium');

                    breakdown.p['Aluminium'][jobName('forager')] = forage_alum_base + 'v';
                    breakdown.p['Aluminium'][`ᄂ${loc('city_rock_quarry')}+1`] = ((rock_quarry - 1) * 100) + '%';
                    breakdown.p['Aluminium'][`ᄂ${loc('power')}+1`] = ((power_mult - 1) * 100) + '%';
                    if (quarry_discharge){
                        breakdown.p['Aluminium'][`ᄂ${loc('evo_challenge_discharge')}+1`] = '-50%';
                    }
                    breakdown.p['Aluminium'][`ᄂ${loc('portal_tunneler_bd')}+1`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p['Aluminium'][`ᄂ${loc('quarantine')}+1`] = ((q_multiplier - 1) * 100) + '%';
                }

                // Redo the effects of Discharge
                if (quarry_discharge){
                    power_mult = (power_mult - 1) * 0.5 + 1;
                    power_single = (power_single - 1) * 0.5 + 1;
                }

                // Factors for rock quarries and rock quarry power are applied quadratically on purpose
                let delta = (base * zigValStone + forage_alum_base);
                delta *= rock_quarry * tunneler * shrineMetal.mult * hunger * q_multiplier * global_multiplier;
                global.city.metal_refinery['cnvay'] = +(delta * (power_single - 1)).toFixed(5);
                global.city.rock_quarry['almcvy'] = global.city.metal_refinery['cnvay'];
                delta *= power_mult;

                if (global.tech['alumina'] >= 2){
                    refinery += p_on['metal_refinery'] * 6 * q_multiplier;
                    let ref_single = 6 * q_multiplier / 100;
                    global.city.metal_refinery['pwr'] = +(delta * ref_single).toFixed(5);
                }

                delta *= 1 + (refinery / 100);
                breakdown.p['Aluminium'][loc('city_shrine')] = ((shrineMetal.mult - 1) * 100).toFixed(1) + '%';
                breakdown.p['Aluminium'][loc('hunger')] = ((hunger - 1) * 100) + '%';

                modRes('Aluminium', delta * time_multiplier);
            }
        }

        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p && global.race.ocularPowerConfig.ds > 0){
            if (!global.race.ocularPowerConfig.hasOwnProperty('ticks') || global.race.ocularPowerConfig.ticks <= 0){
                global.race.ocularPowerConfig['dsl'] = Math.round(global.race.ocularPowerConfig.ds / 10);
                global.race.ocularPowerConfig.ds = 0;
                global.race.ocularPowerConfig['ticks'] = Math.round(10 / time_multiplier);
                
            }

            let base = global.race.ocularPowerConfig.dsl;
            let delta = base * hunger * q_multiplier * global_multiplier;
            global.race.ocularPowerConfig.ticks--;

            breakdown.p['Stone'][loc('ocular_petrification')] = base + 'v';
            modRes('Stone', delta * time_multiplier);
        }

        // Water
        if (global.resource.Water.display){
            if (support_on['water_freighter']){
                let synd = syndicate('spc_enceladus');

                let base = production('water_freighter') * support_on['water_freighter'] * production('psychic_boost','Water');;
                let delta = base * hunger * global_multiplier * synd * zigVal;

                breakdown.p['Water'][loc('space_water_freighter_title')] = base + 'v';
                if (base > 0){
                    breakdown.p['Water'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                    breakdown.p['Water'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                    breakdown.p['Water'][`ᄂ${loc('hunger')}`] = ((hunger - 1) * 100) + '%';
                }

                modRes('Water', delta * time_multiplier);
            }

            if (global.tech['isolation'] && global.tauceti['tau_farm'] && p_on['tau_farm']){
                let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);

                let base = production('tau_farm','water') * p_on['tau_farm'] * production('psychic_boost','Water');
                let delta = base * global_multiplier * colony_val;

                breakdown.p['Water'][loc('tau_home_tau_farm')] = base + 'v';
                if (base > 0){
                    breakdown.p['Water'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                }

                modRes('Water', delta * time_multiplier);
            }
        }

        if (global.eden['palace'] && p_on['spirit_vacuum'] && global.tech['isle']){
            let drain = 1653439 * p_on['spirit_vacuum'];
            if (global.tech.isle >= 6 && p_on['spirit_battery']){
                let battery = p_on['spirit_battery'] || 0;
                let boost = 0.08;
                if (global.race['warlord'] && global.eden['corruptor'] && global.tech?.asphodel >= 13){
                    boost *= 1 + (p_on['corruptor'] || 0) * 0.03;
                }
                drain *= 1 + (battery * boost);
            }

            if (global.eden['soul_compactor'] && global.eden.soul_compactor.count === 1){
                global.eden.soul_compactor.energy += Math.round(drain / 2);
                if (global.eden.soul_compactor.energy >= 1000000000){
                    global.eden.soul_compactor.energy -= 1000000000;
                    global.resource.Soul_Gem.amount++;
                    global.eden.soul_compactor.report++;
                }
            }

            if (global.eden.palace.energy > 0){
                global.eden.palace.rate = drain;
                global.eden.palace.energy -= drain * time_multiplier;
                global.eden.palace.energy = Math.round(global.eden.palace.energy);

                if (global.eden.palace.energy <= 0){
                    global.eden.palace.energy = 0;
                    global.tech['palace'] = 1;
                    drawTech();
                    renderEdenic();
                }
            }
        }

        // Mana
        if (global.resource.Mana.display){
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

            if (global.city['pylon'] || global.space['pylon'] || global.tauceti['pylon']){
                let mana_base = 0;
                let name = 'city_pylon';
                if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.space['pylon']){
                    mana_base = global.space.pylon.count * 0.005;
                    name = 'space_red_pylon';
                }
                else if (global.tech['isolation'] && global.tauceti['pylon']){
                    mana_base = global.tauceti.pylon.count * 0.0125;
                    name = 'tau_home_pylon';
                }
                else if (global.city['pylon']){
                    mana_base = global.city.pylon.count * 0.01;
                }

                mana_base *= darkEffect('magic');

                let delta = mana_base * hunger * global_multiplier;
                breakdown.p['Mana'][loc(name)] = mana_base+'v';

                if (global.tech['nexus']){
                    let nexus = global.tech['nexus'] * 5;
                    delta *= 1 + (nexus / 100);
                    breakdown.p['Mana'][`ᄂ${loc('arpa_projects_nexus_title')}`] = nexus+'%';
                }

                modRes('Mana', delta * time_multiplier);
            }

            if (global.tech['cleric'] && global.civic.priest.display){
                let mana_base = workerScale(global.civic.priest.workers,'priest') * 0.0025;
                if (global.race['high_pop']){
                    mana_base = highPopAdjust(mana_base);
                }
                mana_base *= darkEffect('magic');
                let delta = mana_base * hunger * global_multiplier;

                breakdown.p['Mana'][jobName('priest')] = mana_base+'v';
                modRes('Mana', delta * time_multiplier);
            }

            if (global.race.universe === 'magic' && global.civic.scientist.display){
                let mana_base = workerScale(global.civic.scientist.workers,'scientist') * 0.025;
                if (global.race['high_pop']){
                    mana_base = highPopAdjust(mana_base);
                }
                mana_base *= darkEffect('magic');

                let delta = mana_base * hunger * global_multiplier;
                breakdown.p['Mana'][jobName('wizard')] = mana_base+'v';

                if (global.civic.govern.type === 'magocracy'){
                    delta *= 1 + (govEffect.magocracy()[0] / 100);
                    breakdown.p['Mana'][`ᄂ${loc('govern_magocracy')}`] = govEffect.magocracy()[0] + '%';
                }

                modRes('Mana', delta * time_multiplier);
            }

            if (global.race.universe === 'magic' && global.tech['syphon']){
                let mana_base = global.tech.syphon / 3;
                mana_base *= darkEffect('magic');

                let delta = mana_base * hunger * global_multiplier;
                breakdown.p['Mana'][loc('arpa_syphon_title')] = mana_base+'v';

                modRes('Mana', delta * time_multiplier);
            }

            breakdown.p['Mana'][loc('hunger')] = ((hunger - 1) * 100) + '%';
        }

        // Crystal
        if (global.resource.Crystal.display){
            let crystal_base = workerScale(global.civic.crystal_miner.workers,'crystal_miner');
            crystal_base *= racialTrait(crystal_base,'miner');

            if (global.race['servants']){
                let serve = global.race.servants.jobs.crystal_miner;
                serve *= servantTrait(global.race.servants.jobs.crystal_miner,'miner');
                crystal_base += serve;
            }

            crystal_base *= global.civic.crystal_miner.impact * production('psychic_boost','Crystal');

            breakdown.p['Crystal'][jobName('crystal_miner')] = crystal_base + 'v';

            if (global.civic.govern.type === 'magocracy'){
                let bonus = govEffect.magocracy()[1];
                crystal_base *= 1 + (bonus / 100);
                breakdown.p['Crystal'][`ᄂ${loc('govern_magocracy')}`] = `${bonus}%`;
            }

            let delta = crystal_base * hunger * global_multiplier;

            breakdown.p['Crystal'][loc('hunger')] = ((hunger - 1) * 100) + '%';
            modRes('Crystal', delta * time_multiplier);
        }

        // Miners
        if (global.resource.Copper.display || global.resource.Iron.display){
            let miner_base = workerScale(global.civic.miner.workers,'miner');
            miner_base *= racialTrait(miner_base,'miner');
            miner_base *= global.civic.miner.impact;
            if (global.race['tough']){
                miner_base *= 1 + (traits.tough.vars()[0] / 100);
            }
            let ogreFathom = fathomCheck('ogre');
            if (ogreFathom > 0){
                miner_base *= 1 + (traits.tough.vars(1)[0] / 100 * ogreFathom);
            }
            if (global.race['industrious']){
                let bonus = 1 + (traits.industrious.vars()[0] * global.race['industrious'] / 100);
                miner_base *= bonus;
            }
            if (global.city.ptrait.includes('dense')){
                miner_base *= planetTraits.dense.vars()[0];
            }
            if (global.city.ptrait.includes('permafrost')){
                miner_base *= planetTraits.permafrost.vars()[0];
            }
            if (!global.race['living_tool'] && !global.race['tusk']){
                miner_base *= (global.tech['pickaxe'] && global.tech.pickaxe > 0 ? global.tech.pickaxe * 0.15 : 0) + 1;
            }
            if (global.tech['explosives'] && global.tech.explosives >= 2){
                miner_base *= 0.95 + (global.tech.explosives * 0.15);
            }

            let power_mult = 1;
            let pow_single = 1;
            if (global.city['mine']['on']){
                power_mult += (p_on['mine'] * 0.05);
                pow_single += 1.05;
            }

            let tunneler = 1;
            if (global.race['warlord'] && global.portal['tunneler']){
                tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
            }

            // Copper
            if (global.resource.Copper.display){
                let copper_mult = 1/7;
                if (global.tech['copper']) {
                    copper_mult *= 1.2;
                }

                let copper_base = miner_base * copper_mult * production('psychic_boost','Copper');
                if (global.city.geology['Copper']){
                    copper_base *= global.city.geology['Copper'] + 1;
                }

                if (global.city.biome === 'volcanic'){
                    copper_base *= biomes.volcanic.vars()[1];
                }
                else if (global.city.biome === 'ashland'){
                    copper_base *= biomes.ashland.vars()[2];
                }

                let copper_power = power_mult;
                let cop_single = pow_single;
                breakdown.p['Copper'][jobName('miner')] = (copper_base) + 'v';
                if (copper_base > 0){
                    breakdown.p['Copper'][`ᄂ${loc('power')}`] = ((copper_power - 1) * 100) + '%';
                    breakdown.p['Copper'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p['Copper'][`ᄂ${loc('quarantine')}+0`] = ((q_multiplier - 1) * 100) + '%';
                    if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['mine'] > 0){
                        copper_power = (copper_power - 1) * 0.5 + 1;
                        cop_single = (cop_single - 1) * 0.5 + 1;
                        breakdown.p['Copper'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }
                }
                let delta = copper_base * shrineMetal.mult * tunneler * hunger * q_multiplier * global_multiplier;
                global.city.mine['cpow'] = +(delta * (cop_single - 1)).toFixed(5);
                delta *= copper_power;

                modRes('Copper', delta * time_multiplier);

                if (global.race['forager'] && global.tech['dowsing']){
                    let forage = global.tech.dowsing >= 2 ? 5 : 1;
                    let foragers = workerScale(global.civic.forager.workers,'forager');
                    foragers *= racialTrait(foragers,'forager');

                    if (global.race['servants']){
                        let serve = global.race.servants.jobs.forager;
                        serve *= servantTrait(global.race.servants.jobs.forager,'forager');
                        foragers += serve;
                    }

                    let forage_base = foragers * forage * 0.025 * production('psychic_boost','Copper');
                    if (global.city.geology['Copper']){
                        forage_base *= global.city.geology['Copper'] + 1;
                    }
                    if (global.city.biome === 'volcanic'){
                        forage_base *= biomes.volcanic.vars()[1];
                    }
                    else if (global.city.biome === 'ashland'){
                        forage_base *= biomes.ashland.vars()[2];
                    }
                    breakdown.p['Copper'][jobName('forager')] = forage_base  + 'v';
                    if (forage_base > 0){
                        breakdown.p['Copper'][`ᄂ${loc('quarantine')}+1`] = ((q_multiplier - 1) * 100) + '%';
                    }
                    modRes('Copper', forage_base * hunger * global_multiplier * q_multiplier * time_multiplier);
                }
            }

            // Iron
            if (global.resource.Iron.display){
                let iron_mult = 1/4;
                let iron_base = miner_base * iron_mult * production('psychic_boost','Iron');
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
                else if (global.city.biome === 'ashland'){
                    iron_base *= biomes.ashland.vars()[2];
                }

                let space_iron = 0;

                let synd = syndicate('spc_belt');
                if (support_on['iron_ship']){
                    space_iron = support_on['iron_ship'] * production('iron_ship') * production('psychic_boost','Iron');
                    space_iron *= synd;
                }

                let iron_power = power_mult;
                let iron_single = power_mult;
                breakdown.p['Iron'][jobName('miner')] = (iron_base) + 'v';
                if (iron_base > 0){
                    breakdown.p['Iron'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p['Iron'][`ᄂ${loc('power')}`] = ((iron_power - 1) * 100) + '%';
                    if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['mine'] > 0){
                        iron_power = (iron_power - 1) * 0.5 + 1;
                        iron_single = (iron_single - 1) * 0.5 + 1;
                        breakdown.p['Iron'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }
                    breakdown.p['Iron'][`ᄂ${loc('quarantine')}+0`] = ((q_multiplier - 1) * 100) + '%';
                }

                let pit_miner = 0; let womling = 0;
                if (global.tech['isolation'] && global.race['lone_survivor']){
                    { // Pit Miner
                        let miner_base = workerScale(global.civic.pit_miner.workers,'pit_miner');
                        miner_base *= racialTrait(miner_base,'miner');
                        let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);

                        let pit_base = miner_base * production('psychic_boost','Iron');
                        pit_base *= production('mining_pit','iron');
                        pit_miner = pit_base * colony_val;

                        breakdown.p['Iron'][jobName('pit_miner')] = pit_base + 'v';
                        if (pit_base > 0){
                            breakdown.p['Iron'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                        }
                    }

                    if (global.tauceti.hasOwnProperty('womling_mine') && global.tauceti.hasOwnProperty('overseer')){ // Womling Mine
                        let prod = global.tauceti.overseer.prod / 100;
                        let iron_base = global.tauceti.womling_mine.miners * production('womling_mine','iron') * production('psychic_boost','Iron');
                        breakdown.p['Iron'][loc('tau_red_womlings')] = iron_base + 'v';
                        womling = iron_base * prod;

                        if (iron_base > 0){
                            breakdown.p['Iron'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                        }
                    }
                }

                breakdown.p['Iron'][jobName('space_miner')] = space_iron + 'v';
                if (space_iron > 0){
                    breakdown.p['Iron'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                    breakdown.p['Iron'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                    breakdown.p['Iron'][`ᄂ${loc('quarantine')}+1`] = ((qs_multiplier - 1) * 100) + '%';
                }
                if (global.race['gravity_well']){ space_iron = teamster(space_iron); }
                if (global.race['gravity_well']){
                    breakdown.p['Iron'][`ᄂ${loc('evo_challenge_gravity_well')}+1`] = -((1 - teamster(1)) * 100) + '%';
                }

                let eship_iron = e_ship['iron'] ? e_ship.iron * womling_technician : 0;
                let delta = ((iron_base * tunneler * iron_power * q_multiplier) + (space_iron * qs_multiplier * zigVal) + (eship_iron) + (pit_miner) + (womling)) * smelter_mult * shrineMetal.mult;
                global.city.mine['ipow'] = +(iron_base * q_multiplier * hunger * global_multiplier * (iron_single - 1)).toFixed(5);
                delta *= hunger * global_multiplier;

                if (e_ship['iron'] && e_ship.iron > 0){
                    breakdown.p['Iron'][loc('tau_roid_mining_ship')] = e_ship.iron + 'v';
                    if (womling_technician > 1){
                        breakdown.p['Iron'][`ᄂ${loc('tau_red_womlings')}+0`] = ((womling_technician - 1) * 100) + '%';
                    }
                }

                breakdown.p['Iron'][loc('city_smelter')] = ((smelter_mult - 1) * 100) + '%';
                breakdown.p['Iron'][loc('city_shrine')] = ((shrineMetal.mult - 1) * 100).toFixed(1) + '%';

                if (global.race['forager'] && global.tech['dowsing']){
                    let forage = global.tech.dowsing >= 2 ? 2 : 1;
                    let foragers = workerScale(global.civic.forager.workers,'forager');
                    foragers *= racialTrait(foragers,'forager');

                    if (global.race['servants']){
                        let serve = global.race.servants.jobs.forager;
                        serve *= servantTrait(global.race.servants.jobs.forager,'forager');
                        foragers += serve;
                    }

                    let forage_base = foragers * forage * 0.035 * production('psychic_boost','Iron');;
                    if (global.city.geology['Iron']){
                        forage_base *= global.city.geology['Iron'] + 1;
                    }
                    if (global.city.biome === 'volcanic'){
                        forage_base *= biomes.volcanic.vars()[2];
                    }
                    else if (global.city.biome === 'ashland'){
                        forage_base *= biomes.ashland.vars()[2];
                    }
                    breakdown.p['Iron'][jobName('forager')] = forage_base  + 'v';
                    if (forage_base > 0){
                        breakdown.p['Iron'][`ᄂ${loc('quarantine')}+2`] = ((q_multiplier - 1) * 100) + '%';
                    }
                    modRes('Iron', forage_base * hunger * global_multiplier * q_multiplier * time_multiplier);
                }

                breakdown.p['Iron'][loc('hunger')] = ((hunger - 1) * 100) + '%';
                modRes('Iron', delta * time_multiplier);

                if (global.tech['titanium'] && global.tech['titanium'] >= 2){
                    let labor_base = highPopAdjust(workerScale(global.civic.miner.workers,'miner')) / 4;
                    if(support_on['iron_ship']){
                        labor_base += support_on['iron_ship'] / 2;
                    }
                    let iron = labor_base * iron_smelter * 0.1;
                    delta = iron * global_multiplier;
                    if (star_forge > 0){
                        delta *= 1 + (star_forge / 50);
                    }
                    if (global.city.geology['Titanium']){
                        delta *= global.city.geology['Titanium'] + 1;
                    }
                    if (global.city.biome === 'oceanic'){
                        delta *= biomes.oceanic.vars()[0];
                    }
                    delta *= shrineMetal.mult * production('psychic_boost','Titanium');
                    let divisor = global.tech['titanium'] >= 3 ? 10 : 25;
                    modRes('Titanium', (delta * time_multiplier) / divisor);
                    breakdown.p['Titanium'][loc('resource_Iron_name')] = (iron / divisor) + 'v';
                }
            }

            if (global.race['sappy']){
                // Alt Aluminium
                if ((global.city['metal_refinery'] && global.city['metal_refinery'].count > 0) || global.race['cataclysm'] || global.race['orbit_decayed']){
                    let base = 0;
                    if (global.race['cataclysm'] || global.race['orbit_decayed']){
                        if (global.tech['mars'] && support_on['red_mine']){
                            base = support_on['red_mine'] * workerScale(global.civic.colonist.workers,'colonist') * production('red_mine','aluminium');
                        }
                    }
                    else {
                        base = miner_base * power_mult * 0.088;
                    }

                    if (global.city.geology['Aluminium']){
                        base *= global.city.geology['Aluminium'] + 1;
                    }
                    base *= production('psychic_boost','Aluminium');

                    let delta = base * shrineMetal.mult * hunger * global_multiplier;

                    if (global.tech['alumina'] >= 2){
                        refinery += p_on['metal_refinery'] * 6;
                    }

                    delta *= 1 + (refinery / 100);

                    breakdown.p['Aluminium'][`${global.race['cataclysm'] || global.race['orbit_decayed'] ? structName('mine') : jobName('miner')}+2`] = base + 'v';
                    if ((global.race['cataclysm'] || global.race['orbit_decayed']) && base > 0 && zigVal > 0){
                        delta *= zigVal;
                        breakdown.p['Aluminium'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                    }
                    breakdown.p['Aluminium'][loc('city_shrine')] = ((shrineMetal.mult - 1) * 100) + '%';
                    breakdown.p['Aluminium'][loc('hunger')] = ((hunger - 1) * 100) + '%';

                    modRes('Aluminium', delta * time_multiplier);
                }

                // Alt Chrysotile
                if (global.race['smoldering'] && global.resource.Chrysotile.display){
                    let cry_base = miner_base / 2 * production('psychic_boost','Chrysotile');
                    let cry_power = power_mult;
                    breakdown.p['Chrysotile'][jobName('miner')] = (cry_base) + 'v';
                    if (cry_base > 0){
                        breakdown.p['Chrysotile'][`ᄂ${loc('power')}`] = ((cry_power - 1) * 100) + '%';
                        if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['mine'] > 0){
                            cry_power = (cry_power - 1) * 0.5 + 1;
                            breakdown.p['Chrysotile'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                        }
                    }
                    let delta = cry_base * cry_power;
                    delta *= hunger * global_multiplier;

                    breakdown.p['Chrysotile'][loc('hunger')] = ((hunger - 1) * 100) + '%';
                    modRes('Chrysotile', delta * time_multiplier);
                }
            }
        }

        {
            // Aluminium Mining Droids
            if (global.interstellar['mining_droid'] && miner_droids['alum'] > 0){
                let base = miner_droids['alum'] * 2.75 * production('psychic_boost','Aluminium');
                let delta = base * shrineMetal.mult * global_multiplier * zigVal;
                delta *= 1 + (refinery / 100);

                breakdown.p['Aluminium'][loc('interstellar_mining_droid_title')] = base + 'v';
                if (base > 0){
                    breakdown.p['Aluminium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = ((zigVal - 1) * 100) + '%';
                }

                modRes('Aluminium', delta * time_multiplier);
            }

            // Aluminium Titan Mines
            if (global.resource.Aluminium.display && global.space['titan_mine']){
                let synd = syndicate('spc_titan');
                let titan_colonists = p_on['ai_colonist'] ? workerScale(global.civic.titan_colonist.workers,'titan_colonist') + jobScale(p_on['ai_colonist']) : workerScale(global.civic.titan_colonist.workers,'titan_colonist');
                let alum_base = production('titan_mine','aluminium') * support_on['titan_mine'] * titan_colonists * production('psychic_boost','Aluminium');
                let alum_delta = alum_base * shrineMetal.mult * global_multiplier * qs_multiplier * synd * zigVal;
                alum_delta *= 1 + (refinery / 100);
                breakdown.p['Aluminium'][`${loc('city_mine')}+0`] = +(alum_base).toFixed(3) + 'v';
                if (alum_base > 0){
                    breakdown.p['Aluminium'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                    breakdown.p['Aluminium'][`ᄂ${loc('space_red_ziggurat_title')}+2`] = ((zigVal - 1) * 100) + '%';
                    breakdown.p['Aluminium'][`ᄂ${loc('quarantine')}+2`] = ((qs_multiplier - 1) * 100) + '%';
                }
                modRes('Aluminium', alum_delta * time_multiplier);
            }

            // Aluminium Extractor Ship
            if (global.resource.Aluminium.display && e_ship['aluminium'] && e_ship.aluminium > 0){
                let alum_delta = e_ship.aluminium * shrineMetal.mult * global_multiplier * womling_technician;
                alum_delta *= 1 + (refinery / 100);
                breakdown.p['Aluminium'][loc('tau_roid_mining_ship')] = e_ship.aluminium + 'v';
                if (womling_technician > 1){
                    breakdown.p['Aluminium'][`ᄂ${loc('tau_red_womlings')}+0`] = ((womling_technician - 1) * 100) + '%';
                }
                modRes('Aluminium', alum_delta * time_multiplier);
            }

            if (refinery > 0){
                breakdown.p['Aluminium'][loc('city_metal_refinery')] = refinery + '%';
                breakdown.p['Aluminium'][`ᄂ${loc('quarantine')}+3`] = ((q_multiplier - 1) * 100) + '%';
            }
        }

        // Mars Mining
        if (support_on['red_mine'] && support_on['red_mine'] > 0){
            let synd = syndicate('spc_red');

            let copper_base = support_on['red_mine'] * workerScale(global.civic.colonist.workers,'colonist') * production('red_mine','copper').f;
            copper_base *= production('psychic_boost','Copper');
            breakdown.p['Copper'][loc('space_red_mine_desc_bd', [planetName().red])] = (copper_base) + 'v';
            if (copper_base > 0){
                breakdown.p['Copper'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                breakdown.p['Copper'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Copper'][`ᄂ${loc('quarantine')}+1`] = ((qs_multiplier - 1) * 100) + '%';
            }
            modRes('Copper', copper_base * shrineMetal.mult * time_multiplier * global_multiplier * qs_multiplier * hunger * synd * zigVal);

            let titanium_base = support_on['red_mine'] * workerScale(global.civic.colonist.workers,'colonist') * hunger * production('red_mine','titanium').f;
            titanium_base *= production('psychic_boost','Titanium');
            breakdown.p['Titanium'][loc('space_red_mine_desc_bd', [planetName().red])] = (titanium_base) + 'v';
            if (titanium_base > 0){
                breakdown.p['Titanium'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                breakdown.p['Titanium'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Titanium'][`ᄂ${loc('quarantine')}+0`] = ((qs_multiplier - 1) * 100) + '%';
            }
            modRes('Titanium', titanium_base * shrineMetal.mult * time_multiplier * global_multiplier * qs_multiplier * synd * zigVal);
        }
        if (shrineBonusActive()){
            breakdown.p['Copper'][loc('city_shrine')] = ((shrineMetal.mult - 1) * 100).toFixed(1) + '%';
            breakdown.p['Titanium'][loc('city_shrine')] = ((shrineMetal.mult - 1) * 100).toFixed(1) + '%';
        }
        breakdown.p['Copper'][loc('hunger')] = ((hunger - 1) * 100) + '%';

        if (breakdown.p['Uranium'].hasOwnProperty(loc('city_coal_ash'))){
            breakdown.p['Uranium'][loc('city_coal_ash')] = breakdown.p['Uranium'][loc('city_coal_ash')] + 'v';
        }

        // Coal
        if (global.resource.Coal.display){
            let coal_base = workerScale(global.race['warlord'] ? global.civic.miner.workers : global.civic.coal_miner.workers,'coal_miner');
            coal_base *= racialTrait(coal_base,'miner');
            if (global.race['tough']){
                coal_base *= 1 + (traits.tough.vars()[0] / 100);
            }
            let ogreFathom = fathomCheck('ogre');
            if (ogreFathom > 0){
                coal_base *= 1 + (traits.tough.vars(1)[0] / 100 * ogreFathom);
            }
            if (global.race['resilient']){
                let bonus = 1 + (traits.resilient.vars()[0] * global.race['resilient'] / 100);
                coal_base *= bonus;
            }
            if (!global.race['living_tool'] && !global.race['tusk']){
                coal_base *= (global.tech['pickaxe'] && global.tech.pickaxe > 0 ? global.tech.pickaxe * 0.12 : 0) + 1;
            }
            if (global.tech['explosives'] && global.tech.explosives >= 2){
                coal_base *= 0.95 + (global.tech.explosives * 0.15);
            }
            if (global.city.geology['Coal']){
                coal_base *= global.city.geology['Coal'] + 1;
            }

            let power_mult = 1;
            let coal_single = 1;
            if (global.city['coal_mine']['on']){
                power_mult += (p_on['coal_mine'] * 0.05);
                coal_single += 0.05;
            }

            let tunneler = 1;
            if (global.race['warlord'] && global.portal['tunneler']){
                tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
            }

            coal_base *= global.civic.coal_miner.impact * production('psychic_boost','Coal');
            breakdown.p['Coal'][global.race['warlord'] ? jobName('miner') : jobName('coal_miner')] = coal_base + 'v';
            if (coal_base > 0){
                breakdown.p['Coal'][`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
                breakdown.p['Coal'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                breakdown.p['Coal'][`ᄂ${loc('quarantine')}+0`] = ((q_multiplier - 1) * 100) + '%';
            }

            if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['coal_mine'] > 0){
                power_mult = (power_mult - 1) * 0.5 + 1;
                coal_single = (coal_single - 1) * 0.5 + 1;
                breakdown.p['Coal'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            if (global.race['cataclysm'] && support_on['iridium_mine']){
                coal_base = support_on['iridium_mine'] * production('iridium_mine','coal');
                coal_base *= production('psychic_boost','Coal');
                breakdown.p['Coal'][loc('space_moon_iridium_mine_title')] = coal_base + 'v';
                if (coal_base > 0){
                    breakdown.p['Coal'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                    breakdown.p['Coal'][`ᄂ${loc('quarantine')}+0`] = ((q_multiplier - 1) * 100) + '%';
                }
                power_mult = 1 * zigVal;
            }

            let delta = coal_base * tunneler * hunger * q_multiplier * global_multiplier;
            global.city.coal_mine['cpow'] = +(delta * (coal_single - 1)).toFixed(5);
            delta *= power_mult;

            breakdown.p['Coal'][loc('hunger')] = ((hunger - 1) * 100) + '%';

            if (global.interstellar['mining_droid'] && miner_droids['coal'] > 0){
                let driod_base = miner_droids['coal'] * 3.75 * production('psychic_boost','Coal');
                let driod_delta = driod_base * global_multiplier * zigVal;
                breakdown.p['Coal'][loc('interstellar_mining_droid_title')] = driod_base + 'v';
                if (driod_base > 0){
                    breakdown.p['Coal'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = ((zigVal - 1) * 100) + '%';
                }
                modRes('Coal', driod_delta * time_multiplier);
            }

            modRes('Coal', delta * time_multiplier);

            // Uranium (from coal miners)
            if (global.resource.Uranium.display){
                let uranium = delta / (global.race['cataclysm'] ? 48 : 115) * production('psychic_boost','Uranium');
                global.city.coal_mine['upow'] = +(global.city.coal_mine['cpow'] / (global.race['cataclysm'] ? 48 : 115)).toFixed(5);
                if (global.city.geology['Uranium']){
                    uranium *= global.city.geology['Uranium'] + 1;
                }
                // Exclude global multiplier to get the base value for display purpose
                breakdown.p['Uranium'][global.race['cataclysm'] ? loc('space_moon_iridium_mine_title') : (global.race['warlord'] ? jobName('miner') : jobName('coal_miner'))] = uranium / global_multiplier + 'v';

                let u_delta = uranium * tunneler;
                if (u_delta > 0){
                    breakdown.p['Uranium'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                }

                modRes('Uranium', u_delta * time_multiplier);
            }
        }

        // Warlord Supplimental Resources
        if (global.race['warlord'] && global.portal['tunneler'] && global.portal.tunneler.count > 0){
            let res_base = workerScale(global.civic.miner.workers,'miner');
            res_base *= racialTrait(res_base,'miner');
            if (global.race['tough']){
                res_base *= 1 + (traits.tough.vars()[0] / 100);
            }
            let ogreFathom = fathomCheck('ogre');
            if (ogreFathom > 0){
                res_base *= 1 + (traits.tough.vars(1)[0] / 100 * ogreFathom);
            }
            if (global.race['resilient']){
                let bonus = 1 + (traits.resilient.vars()[0] * global.race['resilient'] / 100);
                res_base *= bonus;
            }
            if (!global.race['living_tool'] && !global.race['tusk']){
                res_base *= (global.tech['pickaxe'] && global.tech.pickaxe > 0 ? global.tech.pickaxe * 0.12 : 0) + 1;
            }
            if (global.tech['explosives'] && global.tech.explosives >= 2){
                res_base *= 0.95 + (global.tech.explosives * 0.15);
            }

            let tunneler = 1;
            if (global.race['warlord'] && global.portal['tunneler']){
                tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
            }

            ['Neutronium','Adamantite','Bolognium','Orichalcum'].forEach(function(res){
                let cur_base = res_base;
                cur_base *= production('psychic_boost',res);
                switch (res){
                    case 'Neutronium':
                        cur_base /= 10;
                        break;
                    case 'Adamantite':
                        cur_base /= 5;
                        break;
                    case 'Bolognium':
                        cur_base /= 8;
                        break;
                    case 'Orichalcum':
                        cur_base /= 6;
                        break;
                }

                breakdown.p[res][jobName('miner')] = cur_base + 'v';
                if (cur_base > 0){
                    breakdown.p[res][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p[res][loc('hunger')] = ((hunger - 1) * 100) + '%';
                }

                let delta = cur_base * tunneler;
                delta *= hunger * q_multiplier * global_multiplier;

                modRes(res, delta * time_multiplier);
            });
        }

        // Space Uranium
        if (global.interstellar['mining_droid'] && miner_droids['uran'] > 0){
            let driod_base = miner_droids['uran'] * 0.12 * production('psychic_boost','Uranium');
            let driod_delta = driod_base * global_multiplier * zigVal;
            breakdown.p['Uranium'][loc('interstellar_mining_droid_title')] = driod_base + 'v';
            if (driod_base > 0){
                breakdown.p['Uranium'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
            }
            modRes('Uranium', driod_delta * time_multiplier);
        }

        // Kuiper Uranium
        if (global.space['uranium_mine'] && p_on['uranium_mine']){
            let synd = syndicate('spc_kuiper');

            let mine_base = p_on['uranium_mine'] * production('uranium_mine') * production('psychic_boost','Uranium');
            let mine_delta = mine_base * global_multiplier * qs_multiplier * synd * zigVal;
            breakdown.p['Uranium'][loc('space_kuiper_mine',[global.resource.Uranium.name])] = mine_base + 'v';
            if (mine_base > 0){
                breakdown.p['Uranium'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                breakdown.p['Uranium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Uranium'][`ᄂ${loc('quarantine')}+0`] = ((qs_multiplier - 1) * 100) + '%';
            }
            modRes('Uranium', mine_delta * time_multiplier);
        }

        // Oil
        if (global.resource.Oil.display){
            // Whaling Ship & Whale Processor
            let whale_oil = 0;
            if (global.tauceti['whaling_station'] && global.tauceti['whaling_ship']){
                global.tauceti.whaling_station.max = global.tauceti.whaling_station.count * 750;

                // Refine Oil
                if (global.tauceti.whaling_station.fill > 0){
                    let raw = p_on['whaling_station'] * production('whaling_station');
                    if (raw > global.tauceti.whaling_station.fill){
                        raw = global.tauceti.whaling_station.fill;
                    }
                    global.tauceti.whaling_station.fill -= raw * time_multiplier;

                    whale_oil = raw * production('whaling_ship_oil') * production('psychic_boost','Oil');
                }

                let blubber = support_on['whaling_ship'] * production('whaling_ship');
                global.tauceti.whaling_station.fill += blubber * time_multiplier;
                if (global.tauceti.whaling_station.fill > global.tauceti.whaling_station.max){
                    global.tauceti.whaling_station.fill = global.tauceti.whaling_station.max;
                }
            }

            let synd = syndicate('spc_gas_moon');
            let fueled_oil_wells = global.race['warlord'] ? global.portal.pumpjack.count : global.city.oil_well.count;
            let fueled_oil_extractor = p_on['oil_extractor'];
            let oil_prod = global.city['oil_well'] ? production('oil_well') : 0;
            let oil_prod_mod = q_multiplier;
            let extract_prod = global.space['oil_extractor'] ? production('oil_extractor') : 0;
            let extract_prod_mod = qs_multiplier * synd * zigVal;
            if (global.race['blubber']){
                let tick = traits.blubber.vars()[0] * time_multiplier / 5;
                let check_dead = function(amount){
                    if (amount > 0){
                        if (global.city.oil_well.dead < amount * tick){
                            amount = Math.floor(global.city.oil_well.dead / tick);
                        }
                        global.city.oil_well.dead -= amount * tick;
                        if (global.city.oil_well.dead < tick){
                            global.city.oil_well.dead = 0;
                        }
                    }
                    return amount;
                }
                if(oil_prod * oil_prod_mod >= extract_prod * extract_prod_mod){ /* swap order of extractors and wells based on which produces more */
                    fueled_oil_wells = check_dead(fueled_oil_wells);
                    fueled_oil_extractor = check_dead(fueled_oil_extractor);
                }
                else{
                    fueled_oil_extractor = check_dead(fueled_oil_extractor);
                    fueled_oil_wells = check_dead(fueled_oil_wells);
                }
            }
            let oil_well = oil_prod * fueled_oil_wells;
            let oil_extractor = extract_prod * fueled_oil_extractor;
            oil_extractor *= production('psychic_boost','Oil');
            oil_well *= production('psychic_boost','Oil');

            let delta = (oil_well * oil_prod_mod) + (oil_extractor * extract_prod_mod) + (whale_oil * womling_technician);
            delta *= hunger * global_multiplier;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            if (global.space['oil_extractor']){
                global.space.oil_extractor['lpmod'] = production('oil_extractor') * qs_multiplier * synd * zigVal;
            }

            breakdown.p['Oil'][global.race['warlord'] ? loc('portal_pumpjack_title') : loc('city_oil_well')] = oil_well + 'v';
            if (oil_well > 0){
                breakdown.p['Oil'][`ᄂ${loc('quarantine')}+0`] = ((q_multiplier - 1) * 100) + '%';
            }
            breakdown.p['Oil'][loc('space_gas_moon_oil_extractor_title')] = oil_extractor + 'v';
            if (oil_extractor > 0){
                breakdown.p['Oil'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                breakdown.p['Oil'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Oil'][`ᄂ${loc('quarantine')}+1`] = ((qs_multiplier - 1) * 100) + '%';
            }
            breakdown.p['Oil'][loc('tau_roid_whaling_ship')] = whale_oil + 'v';
            if (womling_technician > 1){
                breakdown.p['Oil'][`ᄂ${loc('tau_red_womlings')}+0`] = ((womling_technician - 1) * 100) + '%';
            }
            if (global.race['gravity_well']){
                breakdown.p['Oil'][`${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
            }

            breakdown.p['Oil'][loc('hunger')] = ((hunger - 1) * 100) + '%';
            modRes('Oil', delta * time_multiplier);
        }

        // Iridium
        let iridium_smelter_mult = 1 + iridium_smelter;
        if (support_on['iridium_mine'] || global.race['warlord']){
            let iridium_base = 0;

            if (global.race['warlord']){
                iridium_base = workerScale(global.civic.miner.workers,'miner');
                iridium_base *= racialTrait(iridium_base,'miner');
                iridium_base *= 0.45;
            }
            else {
                iridium_base = support_on['iridium_mine'] * production('iridium_mine','iridium').f;
            }

            let tunneler = 1;
            if (global.race['warlord'] && global.portal['tunneler']){
                tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
            }

            iridium_base *= production('psychic_boost','Iridium');
            let synd = syndicate('spc_moon');
            let delta = iridium_base * tunneler * hunger * shrineMetal.mult * global_multiplier * synd * qs_multiplier * iridium_smelter_mult * zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            breakdown.p['Iridium'][global.race['warlord'] ? jobName('miner') : loc('space_moon_iridium_mine_title')] = iridium_base + 'v';
            if (iridium_base > 0){
                breakdown.p['Iridium'][`ᄂ${loc('city_smelter')}+0`] = (iridium_smelter * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('portal_tunneler_bd')}+0`] = ((tunneler - 1) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_red_ziggurat_title')}+0`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('quarantine')}+0`] = ((qs_multiplier - 1) * 100) + '%';
                if (global.race['gravity_well']){
                    breakdown.p['Iridium'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }
            }
            modRes('Iridium', delta * time_multiplier);
        }

        if (support_on['iridium_ship']){
            let iridium_base = support_on['iridium_ship'] * production('iridium_ship');
            iridium_base *= production('psychic_boost','Iridium');
            let synd = syndicate('spc_belt');
            let delta = iridium_base * hunger * shrineMetal.mult * global_multiplier * synd * qs_multiplier * iridium_smelter_mult * zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            breakdown.p['Iridium'][jobName('space_miner')] = iridium_base + 'v';
            if (iridium_base > 0){
                breakdown.p['Iridium'][`ᄂ${loc('city_smelter')}+1`] = (iridium_smelter * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('quarantine')}+1`] = ((qs_multiplier - 1) * 100) + '%';
                if (global.race['gravity_well']){
                    breakdown.p['Iridium'][`ᄂ${loc('evo_challenge_gravity_well')}+1`] = -((1 - teamster(1)) * 100) + '%';
                }
            }
            modRes('Iridium', delta * time_multiplier);
        }

        if (p_on['s_gate'] && global.resource.Adamantite.display && global.galaxy['armed_miner'] && gal_on['armed_miner'] > 0){
            let base = gal_on['armed_miner'] * 0.65 * production('psychic_boost','Iridium');
            let foothold = 1 + ((gal_on['ore_processor'] ?? 0) * 0.1);
            let pirate = piracy('gxy_alien2');
            let delta = base * global_multiplier * pirate * foothold * hunger * shrineMetal.mult * iridium_smelter_mult * zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            breakdown.p['Iridium'][loc('galaxy_armed_miner_bd')] = base + 'v';
            if (base > 0){
                breakdown.p['Iridium'][`ᄂ${loc('galaxy_ore_processor')}`] = -((1 - foothold) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('city_smelter')}+2`] = (iridium_smelter * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_red_ziggurat_title')}+2`] = ((zigVal - 1) * 100) + '%';
                if (global.race['gravity_well']){
                    breakdown.p['Iridium'][`ᄂ${loc('evo_challenge_gravity_well')}+2`] = -((1 - teamster(1)) * 100) + '%';
                }
            }
            modRes('Iridium', delta * time_multiplier);
        }

        // Iridium Extractor Ship
        if (global.resource.Iridium.display && e_ship['iridium'] && e_ship.iridium > 0){
            let iridium_delta = e_ship.iridium * shrineMetal.mult * global_multiplier * iridium_smelter_mult * hunger * womling_technician;
            if (global.race['gravity_well']){
                iridium_delta = teamster(iridium_delta);
            }
            breakdown.p['Iridium'][loc('tau_roid_mining_ship')] = e_ship.iridium + 'v';
            breakdown.p['Iridium'][`ᄂ${loc('city_smelter')}+3`] = (iridium_smelter * 100) + '%';
            if (womling_technician > 1){
                breakdown.p['Iridium'][`ᄂ${loc('tau_red_womlings')}+0`] = ((womling_technician - 1) * 100) + '%';
            }
            if (global.race['gravity_well']){
                breakdown.p['Iridium'][`ᄂ${loc('evo_challenge_gravity_well')}+3`] = -((1 - teamster(1)) * 100) + '%';
            }
            modRes('Iridium', iridium_delta * time_multiplier);
        }

        // Helium 3
        if ((global.space['moon_base'] && support_on['helium_mine']) || global.race['warlord']){
            let helium_base = (global.race['warlord'] ? global.portal.pumpjack.count : support_on['helium_mine']) * production('helium_mine').f;
            helium_base *= production('psychic_boost','Helium_3');
            let synd = syndicate('spc_moon');
            let delta = helium_base * hunger * global_multiplier * synd * qs_multiplier * zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            breakdown.p['Helium_3'][global.race['warlord'] ? loc('portal_pumpjack_title') : loc('space_moon_helium_mine_title')] = helium_base + 'v';
            if (helium_base > 0){
                breakdown.p['Helium_3'][`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
                breakdown.p['Helium_3'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Helium_3'][`ᄂ${loc('quarantine')}+0`] = ((qs_multiplier - 1) * 100) + '%';
                if (global.race['gravity_well']){
                    breakdown.p['Helium_3'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }
            }
            modRes('Helium_3', delta * time_multiplier);
        }

        if (global.space['gas_mining'] && p_on['gas_mining']){
            let gas_mining = p_on['gas_mining'] * production('gas_mining');
            gas_mining *= production('psychic_boost','Helium_3');
            let synd = syndicate('spc_gas');
            let delta = gas_mining * hunger * global_multiplier * synd * qs_multiplier * zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            breakdown.p['Helium_3'][loc('space_gas_mining_title')] = gas_mining + 'v';
            if (gas_mining > 0){
                breakdown.p['Helium_3'][`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
                breakdown.p['Helium_3'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Helium_3'][`ᄂ${loc('quarantine')}+1`] = ((qs_multiplier - 1) * 100) + '%';
                if (global.race['gravity_well']){
                    breakdown.p['Helium_3'][`ᄂ${loc('evo_challenge_gravity_well')}+1`] = -((1 - teamster(1)) * 100) + '%';
                }
            }
            modRes('Helium_3', delta * time_multiplier);
        }

        if (p_on['refueling_station']){
            let gas_mining = (p_on['refueling_station'] * production('refueling_station'));
            gas_mining *= production('psychic_boost','Helium_3');
            let delta = gas_mining * hunger * global_multiplier * womling_technician;

            breakdown.p['Helium_3'][loc('tau_gas_refueling_station_title')] = gas_mining + 'v';
            if (womling_technician > 1){
                breakdown.p['Helium_3'][`ᄂ${loc('tau_red_womlings')}+0`] = ((womling_technician - 1) * 100) + '%';
            }
            modRes('Helium_3', delta * time_multiplier);
        }

        if (global.interstellar['harvester'] && int_on['harvester']){
            let gas_mining = int_on['harvester'] * production('harvester','helium');
            gas_mining *= production('psychic_boost','Helium_3');
            let delta = gas_mining * hunger * global_multiplier * zigVal;

            breakdown.p['Helium_3'][loc('interstellar_harvester_title')] = gas_mining + 'v';
            if (gas_mining > 0){
                breakdown.p['Helium_3'][`ᄂ${loc('space_red_ziggurat_title')}+2`] = ((zigVal - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    breakdown.p['Helium_3'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }
            }

            modRes('Helium_3', delta * time_multiplier);

            if (global.tech['ram_scoop']){
                let deut_mining = int_on['harvester'] * production('harvester','deuterium');
                deut_mining *= production('psychic_boost','Deuterium');
                let deut_delta = deut_mining * hunger * global_multiplier * zigVal;

                breakdown.p['Deuterium'][loc('interstellar_harvester_title')] = deut_mining + 'v';
                if (deut_mining > 0){
                    breakdown.p['Deuterium'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                }
                modRes('Deuterium', deut_delta * time_multiplier);

            }
        }

        if (p_on['s_gate'] && global.galaxy['raider'] && gal_on['raider'] > 0){
            let base = gal_on['raider'] * 0.65 * production('psychic_boost','Deuterium');
            let pirate = piracy('gxy_chthonian');
            let delta = base * global_multiplier * pirate * hunger * zigVal;

            breakdown.p['Deuterium'][loc('galaxy_raider')] = base + 'v';
            if (base > 0){
                breakdown.p['Deuterium'][`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Deuterium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = ((zigVal - 1) * 100) + '%';
            }
            modRes('Deuterium', delta * time_multiplier);
        }

        breakdown.p['Helium_3'][loc('hunger')] = ((hunger - 1) * 100) + '%';
        breakdown.p['Deuterium'][loc('hunger')] = ((hunger - 1) * 100) + '%';

        // Neutronium
        if (p_on['outpost']){
            let p_values = production('outpost');
            let psy = production('psychic_boost','Neutronium');

            breakdown.p['Neutronium'][loc('space_gas_moon_outpost_bd')] = (p_values.b * psy * p_on['outpost']) + 'v';
            if (global.tech['drone']){
                breakdown.p['Neutronium'][`ᄂ${loc('tech_worker_drone')}`] = (p_values.d * 100) + '%';
            }
            let synd = syndicate('spc_gas_moon');

            let delta = p_on['outpost'] * p_values.n * psy * hunger * global_multiplier * qs_multiplier * synd * zigVal;
            global.space.outpost['lpmod'] = p_values.n * psy * hunger * global_multiplier * qs_multiplier * synd * zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }
            if (p_values.b > 0){
                breakdown.p['Neutronium'][`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
                breakdown.p['Neutronium'][`ᄂ${loc('space_red_ziggurat_title')}+0`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Neutronium'][`ᄂ${loc('quarantine')}+0`] = ((qs_multiplier - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    global.space.outpost['lpmod'] *= 0.5;
                    breakdown.p['Neutronium'][`ᄂ${loc('evo_challenge_discharge')}+0`] = '-50%';
                }
                if (global.race['gravity_well']){
                    breakdown.p['Neutronium'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }
            }

            modRes('Neutronium', delta * time_multiplier);
        }

        if (p_on['neutron_miner']){
            let n_base = p_on['neutron_miner'] * production('neutron_miner') * production('psychic_boost','Neutronium');
            let delta = n_base * hunger * global_multiplier * zigVal;
            breakdown.p['Neutronium'][loc('interstellar_neutron_miner_bd')] = n_base + 'v';
            global.interstellar.neutron_miner['lpmod'] = production('neutron_miner') * hunger * global_multiplier * zigVal;

            if (n_base > 0){
                breakdown.p['Neutronium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = ((zigVal - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    global.interstellar.neutron_miner['lpmod'] *= 0.5;
                    breakdown.p['Neutronium'][`ᄂ${loc('evo_challenge_discharge')}+1`] = '-50%';
                }
            }

            modRes('Neutronium', delta * time_multiplier);
        }

        if (p_on['s_gate'] && global.galaxy['raider'] && gal_on['raider'] > 0){
            let base = gal_on['raider'] * 0.8 * production('psychic_boost','Neutronium');
            let pirate = piracy('gxy_chthonian');
            let delta = base * global_multiplier * pirate * hunger * zigVal;

            breakdown.p['Neutronium'][loc('galaxy_raider')] = base + 'v';
            if (base > 0){
                breakdown.p['Neutronium'][`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Neutronium'][`ᄂ${loc('space_red_ziggurat_title')}+2`] = ((zigVal - 1) * 100) + '%';
            }
            modRes('Neutronium', delta * time_multiplier);
        }

        // Kuiper Neutronium
        if (global.space['neutronium_mine'] && p_on['neutronium_mine']){
            let synd = syndicate('spc_kuiper');

            let mine_base = p_on['neutronium_mine'] * production('neutronium_mine') * production('psychic_boost','Neutronium');
            let mine_delta = mine_base * global_multiplier * qs_multiplier * synd * zigVal;
            breakdown.p['Neutronium'][loc('space_kuiper_mine',[global.resource.Neutronium.name])] = mine_base + 'v';
            if (mine_base > 0){
                breakdown.p['Neutronium'][`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
                breakdown.p['Neutronium'][`ᄂ${loc('space_red_ziggurat_title')}+3`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Neutronium'][`ᄂ${loc('quarantine')}+1`] = ((qs_multiplier - 1) * 100) + '%';
            }
            modRes('Neutronium', mine_delta * time_multiplier);
        }

        // Neutronium Extractor Ship
        if (global.resource.Neutronium.display && e_ship['neutronium'] && e_ship.neutronium > 0){
            let neutronium_delta = e_ship.neutronium * global_multiplier * womling_technician;
            breakdown.p['Neutronium'][loc('tau_roid_mining_ship')] = e_ship.neutronium + 'v';
            if (womling_technician > 1){
                breakdown.p['Neutronium'][`ᄂ${loc('tau_red_womlings')}+0`] = ((womling_technician - 1) * 100) + '%';
            }
            modRes('Neutronium', neutronium_delta * time_multiplier);
        }

        // Elerium
        if (support_on['elerium_ship']){
            let elerium_base = support_on['elerium_ship'] * production('elerium_ship') * production('psychic_boost','Elerium');
            let synd = syndicate('spc_belt');
            let delta = elerium_base * hunger * global_multiplier * qs_multiplier * synd * zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }
            breakdown.p['Elerium'][jobName('space_miner')] = elerium_base + 'v';

            if (elerium_base > 0){
                breakdown.p['Elerium'][`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
                breakdown.p['Elerium'][`ᄂ${loc('space_red_ziggurat_title')}+0`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Elerium'][`ᄂ${loc('quarantine')}+0`] = ((qs_multiplier - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.75;
                    breakdown.p['Elerium'][`ᄂ${loc('evo_challenge_discharge')}`] = '-25%';
                }
                if (global.race['gravity_well']){
                    breakdown.p['Elerium'][`ᄂ${loc('evo_challenge_gravity_well')}+1`] = -((1 - teamster(1)) * 100) + '%';
                }
            }

            modRes('Elerium', delta * time_multiplier);
        }

        // Prospector
        if (int_on['elerium_prospector']){
            let elerium_base = int_on['elerium_prospector'] * production('elerium_prospector') * production('psychic_boost','Elerium');
            let delta = elerium_base * hunger * global_multiplier * zigVal;
            breakdown.p['Elerium'][loc('interstellar_elerium_prospector_bd')] = elerium_base + 'v';
            if (elerium_base > 0){
                breakdown.p['Elerium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = ((zigVal - 1) * 100) + '%';
            }
            modRes('Elerium', delta * time_multiplier);
        }

        // Kuiper Elerium
        if (global.space['elerium_mine'] && p_on['elerium_mine']){
            let synd = syndicate('spc_kuiper');

            let mine_base = p_on['elerium_mine'] * production('elerium_mine') * production('psychic_boost','Elerium');
            let mine_delta = mine_base * global_multiplier * qs_multiplier * synd * hunger * zigVal;
            breakdown.p['Elerium'][loc('space_kuiper_mine',[global.resource.Elerium.name])] = mine_base + 'v';
            if (mine_base > 0){
                breakdown.p['Elerium'][`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
                breakdown.p['Elerium'][`ᄂ${loc('space_red_ziggurat_title')}+2`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Elerium'][`ᄂ${loc('quarantine')}+1`] = ((qs_multiplier - 1) * 100) + '%';
            }
            modRes('Elerium', mine_delta * time_multiplier);
        }

        // Elerium Extractor Ship
        if (global.resource.Elerium.display && e_ship['elerium'] && e_ship.elerium > 0){
            let elerium_delta = e_ship.elerium * global_multiplier * womling_technician;
            breakdown.p['Elerium'][loc('tau_roid_mining_ship')] = e_ship.elerium + 'v';
            if (womling_technician > 1){
                breakdown.p['Elerium'][`ᄂ${loc('tau_red_womlings')}+0`] = ((womling_technician - 1) * 100) + '%';
            }
            modRes('Elerium', elerium_delta * time_multiplier);
        }

        breakdown.p['Elerium'][loc('hunger')] = ((hunger - 1) * 100) + '%';

        // Adamantite
        if (global.resource.Adamantite.display && global.interstellar['mining_droid'] && miner_droids['adam'] > 0){
            let driod_base = miner_droids['adam'] * 0.075 * production('psychic_boost','Adamantite');
            let driod_delta = driod_base * shrineMetal.mult * global_multiplier * zigVal;
            breakdown.p['Adamantite'][loc('interstellar_mining_droid_title')] = driod_base + 'v';
            if (driod_base > 0){
                if (global.interstellar['processing'] && int_on['processing']){
                    let rate = 0.12;
                    if (global.tech['ai_core'] && global.tech['ai_core'] >= 2 && p_on['citadel'] > 0){
                        rate += (p_on['citadel'] * 0.02);
                    }
                    let bonus = int_on['processing'] * rate;
                    driod_delta *= 1 + bonus;
                    breakdown.p['Adamantite'][`ᄂ${loc('interstellar_processing_title')}`] = (bonus * 100) + '%';

                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        driod_delta *= 0.5;
                        breakdown.p['Adamantite'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }
                }
                breakdown.p['Adamantite'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
            }
            modRes('Adamantite', driod_delta * time_multiplier);
        }

        if (p_on['s_gate'] && global.resource.Adamantite.display && global.galaxy['armed_miner'] && gal_on['armed_miner'] > 0){
            let base = gal_on['armed_miner'] * 0.23 * production('psychic_boost','Adamantite');
            let foothold = 1 + ((gal_on['ore_processor'] ?? 0) * 0.1);
            let pirate = piracy('gxy_alien2');
            let delta = base * global_multiplier * pirate * foothold * shrineMetal.mult * zigVal;

            breakdown.p['Adamantite'][loc('galaxy_armed_miner_bd')] = base + 'v';
            if (base > 0){
                breakdown.p['Adamantite'][`ᄂ${loc('galaxy_ore_processor')}`] = -((1 - foothold) * 100) + '%';
                breakdown.p['Adamantite'][`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Adamantite'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = ((zigVal - 1) * 100) + '%';
            }
            modRes('Adamantite', delta * time_multiplier);
        }

        if (global.resource.Adamantite.display && global.space['titan_mine']){
            let synd = syndicate('spc_titan');
            let titan_colonists = p_on['ai_colonist'] ? workerScale(global.civic.titan_colonist.workers,'titan_colonist') + jobScale(p_on['ai_colonist']) : workerScale(global.civic.titan_colonist.workers,'titan_colonist');
            let adam_base = production('titan_mine','adamantite') * support_on['titan_mine'] * titan_colonists * production('psychic_boost','Adamantite');
            let adam_delta = adam_base * shrineMetal.mult * global_multiplier * qs_multiplier * synd * zigVal;
            breakdown.p['Adamantite'][loc('city_mine')] = adam_base + 'v';
            if (adam_base > 0){
                breakdown.p['Adamantite'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                breakdown.p['Adamantite'][`ᄂ${loc('space_red_ziggurat_title')}+2`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Adamantite'][`ᄂ${loc('quarantine')}+0`] = ((qs_multiplier - 1) * 100) + '%';
            }
            modRes('Adamantite', adam_delta * time_multiplier);
        }

        // Infernite
        if (global.resource.Infernite.display){

            let workers = global.race['warlord'] ? (global.tech?.hellspawn >= 2 && global.portal?.tunneler?.count >= 1 ? global.civic.miner.workers : 0) : global.civic.hell_surveyor.workers;
            if (workers > 0){
                let rate = global.tech.infernite >= 3 ? 0.015 : 0.01;
                if (global.race['warlord']){ rate = 0.0075; }
                let surveyor_base = workerScale(highPopAdjust(workers),'hell_surveyor') * rate * production('psychic_boost','Infernite');

                let sensors = 1;
                if (global.tech['infernite'] >= 2 && p_on['sensor_drone']){
                    let drone_rate = global.tech.infernite >= 4 ? (global.tech.infernite >= 6 ? 0.5 : 0.2) : 0.1;
                    sensors = 1 + (p_on['sensor_drone'] * drone_rate);
                }

                let tunneler = 1;
                if (global.race['warlord'] && global.portal['tunneler']){
                    tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
                }

                let surveyor_delta = surveyor_base * tunneler * sensors * global_multiplier;

                breakdown.p['Infernite'][global.race['warlord'] ? jobName('miner') : jobName('hell_surveyor')] = surveyor_base + 'v';
                breakdown.p['Infernite'][`ᄂ${loc('portal_sensor_drone_title')}`] = ((sensors - 1) * 100) + '%';
                breakdown.p['Infernite'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                modRes('Infernite', surveyor_delta * time_multiplier);
            }

            if (p_on['infernite_mine']){
                let rate = production('infernite_mine');
                let mine_base = p_on['infernite_mine'] * rate * production('psychic_boost','Infernite');

                let mine_delta = mine_base * global_multiplier;
                global.portal.infernite_mine['lpmod'] = rate * global_multiplier;

                breakdown.p['Infernite'][loc('city_mine')] = mine_base + 'v';
                modRes('Infernite', mine_delta * time_multiplier);
            }
        }

        // Bolognium
        if (p_on['s_gate'] && global.resource.Bolognium.display && global.galaxy['bolognium_ship'] && gal_on['bolognium_ship'] > 0){
            let base = gal_on['bolognium_ship'] * production('bolognium_ship') * production('psychic_boost','Bolognium');
            let pirate = piracy('gxy_gateway');
            let delta = base * global_multiplier * pirate * zigVal;

            breakdown.p['Bolognium'][loc('galaxy_bolognium_ship')] = base + 'v';
            if (base > 0){
                breakdown.p['Bolognium'][`ᄂ${loc('galaxy_piracy')}+0`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Bolognium'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    breakdown.p['Bolognium'][`ᄂ${loc('evo_challenge_discharge')}+0`] = '-50%';
                }
            }

            modRes('Bolognium', delta * time_multiplier);
        }

        if (global.eden['asphodel_harvester'] && support_on['asphodel_harvester']){
            let powder_base = support_on['asphodel_harvester'] * production('asphodel_harvester','powder');
            powder_base *= production('psychic_boost','Asphodel_Powder');
            let delta = powder_base * hunger * global_multiplier;
            
            breakdown.p['Asphodel_Powder'][loc('eden_asphodel_harvester_title')] = powder_base + 'v';

            if (global.tech.asphodel >= 5){
                let penalty = asphodelResist();
                delta *= penalty;
                if (penalty <= 1){
                    breakdown.p['Asphodel_Powder'][`ᄂ${loc('eden_asphodel_hostility')}+0`] = -((1 - penalty) * 100) + '%';
                }
                else {
                    breakdown.p['Asphodel_Powder'][`ᄂ${loc('eden_mech_station_overkill')}+0`] = ((penalty - 1) * 100) + '%';
                }
            }

            modRes('Asphodel_Powder', delta * time_multiplier);
        }

        // Elysanite
        if (global.resource.Elysanite.display){
            if (global.civic.elysium_miner.display){
                let miner_base = workerScale(global.civic.elysium_miner.workers,'elysium_miner');
                miner_base *= racialTrait(miner_base,'miner') * 0.36;

                if (!global.race['living_tool'] && !global.race['tusk']){
                    miner_base *= (global.tech['pickaxe'] && global.tech.pickaxe > 0 ? global.tech.pickaxe * 0.15 : 0) + 1;
                }
                if (global.tech['explosives'] && global.tech.explosives >= 2){
                    miner_base *= 0.95 + (global.tech.explosives * 0.15);
                }
                if (global.race['tough']){
                    miner_base *= 1 + (traits.tough.vars()[0] / 100);
                }
                let ogreFathom = fathomCheck('ogre');
                if (ogreFathom > 0){
                    miner_base *= 1 + (traits.tough.vars(1)[0] / 100 * ogreFathom);
                }
                miner_base *= production('psychic_boost','Elysanite');

                breakdown.p['Elysanite'][jobName('elysium_miner')] = miner_base + 'v';

                let delta = miner_base;
                delta *= hunger * global_multiplier;

                modRes('Elysanite', delta * time_multiplier);
            }
        }

        // Pit Miner
        if (global.civic.pit_miner.display){
            if (tauEnabled()){
                let miner_base = workerScale(global.civic.pit_miner.workers,'pit_miner');
                miner_base *= racialTrait(miner_base,'miner');
                let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);

                { // Bolognium
                    let bol_base = miner_base * production('psychic_boost','Bolognium');
                    bol_base *= production('mining_pit','bolognium');
                    let delta = bol_base * global_multiplier * colony_val;

                    breakdown.p['Bolognium'][jobName('pit_miner')] = bol_base + 'v';
                    if (bol_base > 0){
                        breakdown.p['Bolognium'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                    }

                    modRes('Bolognium', delta * time_multiplier);
                }

                { // Stone
                    let stone_base = miner_base * production('psychic_boost','Stone');
                    stone_base *= production('mining_pit','stone');
                    let delta = stone_base * global_multiplier * colony_val;

                    breakdown.p['Stone'][jobName('pit_miner')] = stone_base + 'v';
                    if (stone_base > 0){
                        breakdown.p['Stone'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                    }

                    modRes('Stone', delta * time_multiplier);
                }

                if (global.race['smoldering']){ // Chrysotile
                    let cry_base = miner_base * production('psychic_boost','Chrysotile');
                    cry_base *= production('mining_pit','chrysotile');
                    let delta = cry_base * global_multiplier * colony_val * hunger;

                    breakdown.p['Chrysotile'][jobName('pit_miner')] = cry_base + 'v';
                    if (cry_base > 0){
                        breakdown.p['Chrysotile'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                        breakdown.p['Chrysotile'][loc('hunger')] = ((hunger - 1) * 100) + '%';
                    }
                    modRes('Chrysotile', delta * time_multiplier);
                }

                { // Adamantite
                    let adam_base = miner_base * production('psychic_boost','Adamantite');
                    adam_base *= production('mining_pit','adamantite');
                    let delta = adam_base * shrineMetal.mult * global_multiplier * colony_val;

                    breakdown.p['Adamantite'][jobName('pit_miner')] = adam_base + 'v';
                    if (adam_base > 0){
                        breakdown.p['Adamantite'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                    }

                    modRes('Adamantite', delta * time_multiplier);
                }

                if (global.tech['isolation']){
                    { // Copper
                        let copper_base = miner_base * production('psychic_boost','Copper');
                        copper_base *= production('mining_pit','copper');
                        let delta = copper_base * shrineMetal.mult * global_multiplier * colony_val;

                        breakdown.p['Copper'][jobName('pit_miner')] = copper_base + 'v';
                        if (copper_base > 0){
                            breakdown.p['Copper'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                        }

                        modRes('Copper', delta * time_multiplier);
                    }

                    { // Coal
                        let coal_base = miner_base * production('psychic_boost','Coal');
                        coal_base *= production('mining_pit','coal');
                        let delta = coal_base * global_multiplier * colony_val;

                        breakdown.p['Coal'][jobName('pit_miner')] = coal_base + 'v';
                        if (coal_base > 0){
                            breakdown.p['Coal'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                        }

                        modRes('Coal', delta * time_multiplier);
                    }

                    if (global.race['lone_survivor']){ // Aluminium
                        let alum_base = miner_base * production('psychic_boost','Aluminium');
                        alum_base *= production('mining_pit','aluminium');
                        let delta = alum_base * shrineMetal.mult * global_multiplier * colony_val;

                        breakdown.p['Aluminium'][jobName('pit_miner')] = alum_base + 'v';
                        if (alum_base > 0){
                            breakdown.p['Aluminium'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                        }

                        modRes('Aluminium', delta * time_multiplier);
                    }
                }
            }
            else {
                let materials_bd = {};
                let miner_base = workerScale(global.civic.pit_miner.workers,'pit_miner');
                miner_base *= racialTrait(miner_base,'miner');
                miner_base *= production('mining_pit','materials');

                let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);
                let delta = miner_base * global_multiplier * colony_val;

                materials_bd[jobName('pit_miner')] = miner_base + 'v';
                if (miner_base > 0){
                    materials_bd[`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                }

                breakdown.p['Materials'] = materials_bd;
                modRes('Materials', delta * time_multiplier);
            }
        }

        if (global.tauceti['tau_farm'] && p_on['tau_farm']){
            let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);

            if (!global.race['kindling_kindred'] && !global.race['smoldering']){
                let lumber_base = production('tau_farm','lumber') * p_on['tau_farm'] * production('psychic_boost','Lumber');
                let delta = lumber_base * global_multiplier * colony_val;

                breakdown.p['Lumber'][loc('tau_home_tau_farm')] = lumber_base + 'v';
                if (lumber_base > 0){
                    breakdown.p['Lumber'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
                }

                modRes('Lumber', delta * time_multiplier);
            }
        }

        if (shrineBonusActive()){
            breakdown.p['Adamantite'][loc('city_shrine')] = ((shrineMetal.mult - 1) * 100).toFixed(1) + '%';
        }

        if (p_on['s_gate'] && global.resource.Bolognium.display && global.galaxy['armed_miner'] && gal_on['armed_miner'] > 0){
            let base = gal_on['armed_miner'] * 0.032 * production('psychic_boost','Bolognium');
            let foothold = 1 + ((gal_on['ore_processor'] ?? 0)* 0.1);
            let pirate = piracy('gxy_alien2');
            let delta = base * global_multiplier * pirate * foothold * zigVal;

            breakdown.p['Bolognium'][loc('galaxy_armed_miner_bd')] = base + 'v';
            if (base > 0){
                breakdown.p['Bolognium'][`ᄂ${loc('galaxy_ore_processor')}`] = -((1 - foothold) * 100) + '%';
                breakdown.p['Bolognium'][`ᄂ${loc('galaxy_piracy')}+1`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Bolognium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = ((zigVal - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    breakdown.p['Bolognium'][`ᄂ${loc('evo_challenge_discharge')}+1`] = '-50%';
                }
            }

            modRes('Bolognium', delta * time_multiplier);
        }

        // Orichalcum
        if (p_on['s_gate'] && global.resource.Orichalcum.display && global.galaxy['excavator'] && p_on['excavator'] > 0){
            let base = p_on['excavator'] * production('excavator') * production('psychic_boost','Orichalcum');
            let pirate = piracy('gxy_chthonian');
            let delta = base * global_multiplier * pirate * zigVal;
            global.galaxy.excavator['lpmod'] = production('excavator') * global_multiplier * pirate * zigVal

            breakdown.p['Orichalcum'][loc('galaxy_excavator')] = base + 'v';
            if (base > 0){
                breakdown.p['Orichalcum'][`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Orichalcum'][`ᄂ${loc('space_red_ziggurat_title')}`] = ((zigVal - 1) * 100) + '%';
                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    global.galaxy.excavator['lpmod'] *= 0.5;
                    breakdown.p['Orichalcum'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }
            }

            modRes('Orichalcum', delta * time_multiplier);
        }

        // Kuiper Orichalcum
        if (global.space['orichalcum_mine'] && p_on['orichalcum_mine']){
            let synd = syndicate('spc_kuiper');

            let mine_base = p_on['orichalcum_mine'] * production('orichalcum_mine') * production('psychic_boost','Orichalcum');
            let mine_delta = mine_base * global_multiplier * qs_multiplier * synd * zigVal;
            breakdown.p['Orichalcum'][loc('space_kuiper_mine',[global.resource.Orichalcum.name])] = mine_base + 'v';
            if (mine_base > 0){
                breakdown.p['Orichalcum'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                breakdown.p['Orichalcum'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = ((zigVal - 1) * 100) + '%';
                breakdown.p['Orichalcum'][`ᄂ${loc('quarantine')}+0`] = ((qs_multiplier - 1) * 100) + '%';
            }
            modRes('Orichalcum', mine_delta * time_multiplier);
        }

        // Orichalcum Extractor Ship
        if (global.resource.Orichalcum.display && e_ship['orichalcum'] && e_ship.orichalcum > 0){
            let orichalcum_delta = e_ship.orichalcum * global_multiplier * womling_technician;
            breakdown.p['Orichalcum'][loc('tau_roid_mining_ship')] = e_ship.orichalcum + 'v';
            if (womling_technician > 1){
                breakdown.p['Orichalcum'][`ᄂ${loc('tau_red_womlings')}+0`] = ((womling_technician - 1) * 100) + '%';
            }
            modRes('Orichalcum', orichalcum_delta * time_multiplier);
        }

        // Womling Production
        if (global.race['truepath'] && global.tech['tau_red'] && global.tech.tau_red >= 5){
            if (global.tauceti['womling_mine'] && global.tauceti['overseer']){
                let miner_base = global.tauceti.womling_mine.miners * production('womling_mine','unobtainium') * production('psychic_boost','Unobtainium');
                let prod = global.tauceti.overseer.prod / 100;
                let miner_delta = miner_base * prod * global_multiplier;

                breakdown.p['Unobtainium'][loc('tau_red_womlings')] = miner_base + 'v';
                if (miner_base > 0){
                    breakdown.p['Unobtainium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                }
                modRes('Unobtainium', miner_delta * time_multiplier);

                if (global.tech['isolation']){
                    let uranium_base = global.tauceti.womling_mine.miners * production('womling_mine','uranium') * production('psychic_boost','Uranium');
                    breakdown.p['Uranium'][loc('tau_red_womlings')] = uranium_base + 'v';
                    let uranium_delta = uranium_base * prod * global_multiplier;

                    if (uranium_base > 0){
                        breakdown.p['Uranium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                    }
                    modRes('Uranium', uranium_delta * time_multiplier);

                    let titanium_base = global.tauceti.womling_mine.miners * production('womling_mine','titanium') * production('psychic_boost','Titanium');
                    breakdown.p['Titanium'][loc('tau_red_womlings')] = titanium_base + 'v';
                    let titanium_delta = titanium_base * prod * shrineMetal.mult * global_multiplier;

                    if (titanium_base > 0){
                        breakdown.p['Titanium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                    }
                    modRes('Titanium', titanium_delta * time_multiplier);

                    if (global.race['lone_survivor']){
                        let copper_base = global.tauceti.womling_mine.miners * production('womling_mine','copper') * production('psychic_boost','Copper');
                        breakdown.p['Copper'][loc('tau_red_womlings')] = copper_base + 'v';
                        let copper_delta = copper_base * prod * shrineMetal.mult * global_multiplier;

                        if (copper_delta > 0){
                            breakdown.p['Copper'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                        }
                        modRes('Copper', copper_delta * time_multiplier);

                        let alumina_base = global.tauceti.womling_mine.miners * production('womling_mine','aluminium') * production('psychic_boost','Aluminium');
                        breakdown.p['Aluminium'][loc('tau_red_womlings')] = alumina_base + 'v';
                        let alumina_delta = alumina_base * prod * shrineMetal.mult * global_multiplier;

                        if (alumina_base > 0){
                            breakdown.p['Aluminium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                        }
                        modRes('Aluminium', alumina_delta * time_multiplier);

                        let iridium_base = global.tauceti.womling_mine.miners * production('womling_mine','iridium') * production('psychic_boost','Iridium');
                        breakdown.p['Iridium'][loc('tau_red_womlings')] = iridium_base + 'v';
                        let iridium_delta = iridium_base * prod * hunger * shrineMetal.mult * global_multiplier;

                        if (iridium_base > 0){
                            breakdown.p['Iridium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                        }
                        modRes('Iridium', iridium_delta * time_multiplier);

                        let neutronium_base = global.tauceti.womling_mine.miners * production('womling_mine','neutronium') * production('psychic_boost','Neutronium');
                        breakdown.p['Neutronium'][loc('tau_red_womlings')] = neutronium_base + 'v';
                        let neutronium_delta = neutronium_base * prod * hunger * global_multiplier;

                        if (neutronium_base > 0){
                            breakdown.p['Neutronium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                        }
                        modRes('Neutronium', neutronium_delta * time_multiplier);
                    }
                }
            }
        }

        breakdown.p['Neutronium'][loc('hunger')] = ((hunger - 1) * 100) + '%';

        if (shrineBonusActive()){
            breakdown.p['Iridium'][loc('city_shrine')] = ((shrineMetal.mult - 1) * 100).toFixed(1) + '%';
        }
        breakdown.p['Iridium'][loc('hunger')] = ((hunger - 1) * 100) + '%';

        // Income
        let rawCash = FactoryMoney ? FactoryMoney * global_multiplier * hunger : 0;
        if (FactoryMoney && global.race['discharge'] && global.race['discharge'] > 0){rawCash *= 0.5;}
        if (global.tech['currency'] >= 1){
            let income_base = global.resource[global.race.species].amount + global.civic.garrison.workers - global.civic.unemployed.workers;
            if (global.race['high_pop']){
                income_base = highPopAdjust(income_base);
            }
            income_base *= global.race['truepath'] ? 0.2 : 0.4;
            if (global.race['greedy']){
                income_base *= 1 - (traits.greedy.vars()[0] / 100);
            }
            if (global.tech['isolation']){
                income_base *= 15;
            }
            income_base *= production('psychic_cash');

            if (fed && global.tech['banking'] && global.tech['banking'] >= 2){
                let impact = +workerScale(global.civic.banker.impact,'banker');
                if (global.tech['banking'] >= 10){
                    impact += 0.02 * global.tech['stock_exchange'];
                }
                if (global.race['truthful']){
                    impact *= 1 - (traits.truthful.vars()[0] / 100);
                }
                if (global.civic.govern.type === 'republic'){
                    impact *= 1 + (govEffect.republic()[0] / 100);
                }
                if (global.race['high_pop']){
                    impact = highPopAdjust(impact);
                }
                income_base *= 1 + (global.civic.banker.workers * impact);
            }

            income_base *= (global.civic.taxes.tax_rate / 20);
            if (global.civic.govern.type === 'oligarchy'){
                income_base *= 1 - (govEffect.oligarchy()[0] / 100);
            }
            if (global.civic.govern.type === 'corpocracy'){
                income_base *= 0.5;
            }
            if (global.civic.govern.type === 'socialist'){
                income_base *= 1 - (govEffect.socialist()[3] / 100);
            }
            if (global.race['banana']){
                income_base *= 0.05;
            }

            let temple_mult = 1;
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 4 && !global.race['truepath']){
                temple_mult += faithTempleCount() * 0.025;
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

            let delta = (income_base - upkeep) * temple_mult * hunger * getShrineResult.mult;
            delta *= global_multiplier;

            breakdown.p['Money'][loc('morale_tax')] = (income_base) + 'v';
            if (income_base > 0){
                breakdown.p['Money'][`ᄂ${loc('civics_spy_purchase_bd')}`] = -(upkeep) + 'v';
                breakdown.p['Money'][global.race['cataclysm'] || global.race['orbit_decayed'] ? `ᄂ${loc('space_red_ziggurat_title')}` : `ᄂ${structName('temple')}`] = ((temple_mult - 1) * 100) + '%';
                breakdown.p['Money'][`ᄂ${loc('city_shrine')}`] = ((getShrineResult.mult - 1) * 100) + '%';
            }
            breakdown.p['Money'][loc('city_factory')] = FactoryMoney + 'v';
            if (global.race['discharge'] && global.race['discharge'] > 0 && FactoryMoney > 0){
                breakdown.p['Money'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }
            modRes('Money', +(delta * time_multiplier).toFixed(2));
            rawCash += delta;
        }

        if (global.tech['gambling'] && (p_on['casino'] || p_on['spc_casino'] || p_on['tauceti_casino'] || p_on['hell_casino'])){
            let casinos = 0;
            if (p_on['casino']){ casinos += p_on['casino']; }
            if (p_on['spc_casino']){ casinos += p_on['spc_casino']; }
            if (p_on['tauceti_casino']){ casinos += p_on['tauceti_casino']; }
            if (p_on['hell_casino']){ casinos += p_on['hell_casino']; }

            let cash = casinos * casinoEarn();
            breakdown.p['Money'][structName('casino')] = cash + 'v';
            modRes('Money', +(cash * time_multiplier * global_multiplier * hunger).toFixed(2));
            rawCash += cash * global_multiplier * hunger;
        }

        if (global.city['tourist_center'] && global.city['tourist_center'].on && !global.race['fasting'] && !global.race['warlord']){
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
                let monuments = global.tech.monuments;
                if (global.race['wish'] && global.race['wishStats']){
                    if (global.city['wonder_lighthouse']){ monuments += 5; }
                    if (global.city['wonder_pyramid']){ monuments += 5; }
                    if (global.space['wonder_statue']){ monuments += 5; }
                    if (global.interstellar['wonder_gardens'] || global.space['wonder_gardens']){ monuments += 5; }
                }
                tourism += global.city['tourist_center'].on * monuments * 2 * amp;
            }
            if (global.city['trade'] && global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 4){
                tourism += global.city['tourist_center'].on * global.city.trade.count * 3 * amp;
            }
            let piousVal = govActive('pious',1);
            if (piousVal && global.city['temple']){
                tourism += global.city['tourist_center'].on * templeCount() * piousVal * amp;
            }
            if (global.civic.govern.type === 'corpocracy'){
                tourism *= 1 + (govEffect.corpocracy()[2] / 100);
            }
            if (global.civic.govern.type === 'socialist'){
                tourism *= 1 - (govEffect.socialist()[3] / 100);
            }
            if (astroSign === 'aquarius'){
                tourism *= 1 + (astroVal('aquarius')[0] / 100);
            }
            tourism *= production('psychic_cash');
            breakdown.p['Money'][loc('tech_tourism')] = Math.round(tourism) + 'v';
            if (astroSign === 'aquarius'){
                breakdown.p['Money'][`ᄂ${loc('sign_aquarius')}`] = astroVal('aquarius')[0] + '%';
            }
            modRes('Money', +(tourism * time_multiplier * global_multiplier * hunger).toFixed(2));
            rawCash += tourism * global_multiplier * hunger;
        }

        if (global.portal['bazaar'] && global.portal['spire'] && global.tech['monuments']){
            let monuments = global.tech.monuments;
            if (global.race['wish'] && global.race['wishStats'] && global.portal['wonder_gardens']){
                 monuments += 5;
            }
            let revenue = global.portal.bazaar.count * monuments * global.portal.spire.count;
            revenue *= production('psychic_cash');

            breakdown.p['Money'][loc('portal_bazaar_title')] = Math.round(revenue) + 'v';
            if (astroSign === 'aquarius'){
                revenue *= 1 + (astroVal('aquarius')[0] / 100);
                breakdown.p['Money'][`ᄂ${loc('sign_aquarius')}`] = astroVal('aquarius')[0] + '%';
            }

            modRes('Money', +(revenue * time_multiplier * global_multiplier * hunger).toFixed(2));
            rawCash += revenue * global_multiplier * hunger;
        }

        if (global.tauceti['tau_cultural_center']){
            let revenue = 0;
            if (global.tauceti['tauceti_casino']){
                revenue += p_on['tau_cultural_center'] * p_on['tauceti_casino'] * 20;
            }
            if (global.tech['monuments']){
                let monuments = global.tech.monuments;
                if (global.race['wish'] && global.race['wishStats']){
                    if (global.city['wonder_lighthouse']){ monuments += 5; }
                    if (global.city['wonder_pyramid']){ monuments += 5; }
                    if (global.space['wonder_statue']){ monuments += 5; }
                    if (global.interstellar['wonder_gardens'] || global.space['wonder_gardens']){ monuments += 5; }
                }
                revenue += p_on['tau_cultural_center'] * monuments * 5;
            }
            if (global.tech['tau_culture'] && global.tech.tau_culture >= 2){
                revenue += p_on['tau_cultural_center'] * support_on['colony'] * 15;
            }
            if (global.civic.govern.type === 'corpocracy'){
                revenue *= 1 + (govEffect.corpocracy()[2] / 100);
            }
            else if (global.civic.govern.type === 'socialist'){
                revenue *= 1 - (govEffect.socialist()[3] / 100);
            }
            revenue *= production('psychic_cash');
            breakdown.p['Money'][loc('tech_cultural_center')] = Math.round(revenue) + 'v';
            if (astroSign === 'aquarius'){
                revenue *= 1 + (astroVal('aquarius')[0] / 100);
                breakdown.p['Money'][`ᄂ${loc('sign_aquarius')}`] = astroVal('aquarius')[0] + '%';
            }
            modRes('Money', +(revenue * time_multiplier * global_multiplier * hunger).toFixed(2));
            rawCash += revenue * global_multiplier * hunger;
        }

        if (global.tech['tau_junksale']){
            let revenue = support_on['womling_village'] * 40;
            let culture = p_on['tau_cultural_center'] ? 1 + (p_on['tau_cultural_center'] * 0.08) : 1;
            breakdown.p['Money'][loc('tau_red_womling_village')] = Math.round(revenue) + 'v';
            breakdown.p['Money'][`ᄂ${loc('tech_cultural_center')}+1`] = ((culture - 1) * 100) + '%';
            modRes('Money', +(revenue * culture * time_multiplier * global_multiplier * hunger).toFixed(2));
            rawCash += revenue * culture * global_multiplier * hunger;
        }

        if (global.race['gravity_well'] && global.tech['teamster'] && global.tech.teamster >= 2){
            let teamsters = global.civic.teamster.workers;
            let revenue = teamsters * rawCash * 0.01;
            breakdown.p['Money'][jobName('teamster')] = Math.round(revenue / global_multiplier) + 'v';
            // Allow quadratic hunger penalty, but remove quadratic global production bonus
            modRes('Money', +(revenue * time_multiplier * hunger).toFixed(2));
            rawCash += revenue * hunger;
        }
        breakdown.p['Money'][loc('hunger')] = ((hunger - 1) * 100) + '%';

        if (global.tech['anthropology'] && global.tech['anthropology'] >= 4 && global.race['truepath']){
            let merchsales = global.resource[global.race.species].amount * templeCount() * 0.08;
            breakdown.p['Money'][structName('temple')] = (merchsales) + 'v';
            modRes('Money', +(merchsales * global_multiplier * time_multiplier).toFixed(2));
            rawCash += merchsales * global_multiplier;
        }

        // Tribute
        if (global.race['truepath'] && global.tauceti['overseer']){
            let rate = (global.tauceti.overseer.loyal + global.tauceti.overseer.morale) / 200;
            let pop = global.tauceti.overseer.pop;
            if (p_on['womling_station']){
                pop += p_on['womling_station'] * 2;
            }
            let base = pop * rate * (global.tech['isolation'] ? 25 : 12);
            let culture = p_on['tau_cultural_center'] ? 1 + (p_on['tau_cultural_center'] * 0.08) : 1;
            let delta = base * global_multiplier * culture;

            breakdown.p['Money'][loc('tau_red_womlings')] = base + 'v';
            breakdown.p['Money'][`ᄂ${loc('tech_cultural_center')}`] = ((culture - 1) * 100) + '%';
            modRes('Money', +(delta * time_multiplier).toFixed(2));
            rawCash += delta;
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

        // Crafting
        if (global.tech['foundry']){
            let craft_costs = global.race['resourceful'] ? (1 - traits.resourceful.vars()[0] / 100) : 1;
            let arraakFathom = fathomCheck('arraak');
            if (arraakFathom > 0){
                craft_costs -= traits.resourceful.vars(1)[0] / 100 * arraakFathom;
            }
            let crafting_costs = craftCost();
            let crafting_usage = {};

            craftingRatio('','',true); //Recalculation
            Object.keys(crafting_costs).forEach(function (craft){
                if (craft === 'Thermite' && !eventActive('summer')){
                    return;
                }
                breakdown.p[craft] = {};
                let num = workerScale(global.city.foundry[craft],'craftsman');
                if (global.race['servants'] && global.race.servants.hasOwnProperty('sjobs') && global.race.servants.sjobs.hasOwnProperty(craft)){
                    num += jobScale(global.race.servants.sjobs[craft]);
                }
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

                if (global.race['high_pop']){
                    volume = highPopAdjust(volume);
                }

                breakdown.p[craft][jobName('craftsman')] = (volume * speed / 140) + 'v';

                modRes(craft, craft_ratio * volume * speed * time_multiplier / 140 * production('psychic_boost',craft));
            });

            Object.keys(crafting_usage).forEach(function (used){
                if (crafting_usage[used] > 0){
                    breakdown.p.consume[used][jobName('craftsman')] = -(crafting_usage[used]);
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

        if (global.resource.Asphodel_Powder.display){
            if (global.resource.Asphodel_Powder.amount > 0){
                let decay = +((global.resource.Asphodel_Powder.amount) * 0.0045).toFixed(3);

                let stabilize = 0.92;
                if (p_on['ascension_trigger'] && global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
                    let heatSink = actions.interstellar.int_sirius.ascension_trigger.heatSink();
                    heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;
                    if (heatSink > 0){
                        let coefficent = 0.08 * (1 + (heatSink / 17500));
                        stabilize = 1 - coefficent;
                    }
                }
                if (global.race['warlord'] && global.eden['corruptor'] && p_on['corruptor']){
                    stabilize -= 0.004 * p_on['corruptor'];
                }
                if (stabilize < 0.01){ stabilize = 0.01; }

                if (global.eden['stabilizer']){
                    decay *= stabilize ** global.eden.stabilizer.count;
                }
                modRes('Asphodel_Powder', -(decay * time_multiplier));
                breakdown.p.consume.Asphodel_Powder[loc('evo_challenge_decay')] = -(decay);
            }
            else {
                delete breakdown.p.consume.Asphodel_Powder[loc('evo_challenge_decay')];
            }
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
        if (global.race['high_pop']){
            rate *= traits.high_pop.vars()[2];
        }
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
            rate *= 1 + ((global.race['orbit_decayed'] && global.space['space_barracks'] ? global.space.space_barracks.on : global.city.boot_camp.count) * train);
        }
        if (global.tech['celestial_warfare'] && global.tech.celestial_warfare >= 5 && global.eden['bunker']){
            let train = 0.1;
            if (global.blood['lust']){
                train += global.blood.lust * 0.002;
            }
            let milVal = govActive('militant',0);
            if (milVal){
                train *= 1 + (milVal / 100);
            }
            rate *= 1 + (global.eden.bunker.count * train);
        }
        if (global.race['beast']){
            rate *= 1 + (traits.beast.vars()[2] / 100);
        }
        global.civic.garrison.rate = rate * time_multiplier;
        if (global.race['brute']){
            global.civic.garrison.rate += traits.brute.vars()[1] / 40 * time_multiplier;
        }
        let fathom = fathomCheck('orc');
        if (fathom > 0){
            global.civic.garrison.rate += traits.brute.vars(1)[1] / 40 * fathom * time_multiplier;
        }
        global.civic.garrison.progress += global.civic.garrison.rate;
        while (global.civic.garrison.progress >= 100){
            global.civic.garrison.progress -= 100;
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
            //limit carport damage to account for removing high population
            global.portal.carport.damaged = Math.min(global.portal.carport.damaged, jobScale(global.portal.carport.count));
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
    if(global.race['fasting']){
        diffCalc(global.race.species,webWorker.mt);
    }

    if (global.settings.expose){
        if (!window['evolve']){
            enableDebug();
        }
        updateDebugData();
    }

    let easter = eventActive('easter');
    if (easter.active){
        for (i=1; i<=18; i++){
            if ($(`#egg${i}`).length > 0 && !$(`#egg${i}`).hasClass('binded')){
                easterEggBind(i);
                $(`#egg${i}`).addClass('binded');
            }
        }
    }

    let halloween = eventActive('halloween');
    if (halloween.active){
        for (i=1; i<=8; i++){
            if ($(`#treat${i}`).length > 0 && !$(`#treat${i}`).hasClass('binded')){
                trickOrTreatBind(i,false);
                $(`#treat${i}`).addClass('binded');
            }
        }
        for (i=1; i<=8; i++){
            if ($(`#trick${i}`).length > 0 && !$(`#trick${i}`).hasClass('binded')){
                trickOrTreatBind(i,true);
                $(`#trick${i}`).addClass('binded');
            }
        }
    }

    firstRun = false;
}

function midLoop(){
    const astroSign = astrologySign();
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
                    if (checkAffordable(c_action,true)){
                        if (element.hasClass('cnam')){
                            element.removeClass('cnam');
                        }
                        if (checkAffordable(c_action)){
                            if (element.hasClass('cna')){
                                element.removeClass('cna');
                            }
                        }
                        else if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                    else {
                        if (!element.hasClass('cnam')){
                            element.addClass('cnam');
                        }
                        if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
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
            Authority: global.race['cataclysm'] || global.race['orbit_decayed'] ? 90 : (global.race['lone_survivor'] ? 100 : 80),
            Mana: 0,
            Energy: 100,
            Sus: 100,
            Knowledge: global.stats.achieve['extinct_junker'] && global.stats.achieve['extinct_junker'].l >= 1 ? 1000 : 100,
            Omniscience: 0,
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
            Asphodel_Powder: 0,
            Elysanite: 0,
            Unobtainium: 0,
            Cipher: 0,
            Nanite: 0,
            Materials: 0,
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
            teamster: -1,
            meditator: -1,
            torturer: 0,
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
            ghost_trapper: 0,
            elysium_miner: 0,
            pit_miner: 0,
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
        else if (global.race['lone_survivor']){
            caps['Money'] += 1000000000;
            caps['Knowledge'] += 100000;
            caps['Food'] += 9000;
            caps['Water'] += 10000;
            caps['Elerium'] += 999;
        }

        if (global.stats.feat['adept']){
            let rank = checkAdept();
            caps['Lumber'] += rank * 60;
            caps['Stone'] += rank * 60;
        }

        if (global.race.hasOwnProperty('psychicPowers') && global.race.psychicPowers.hasOwnProperty('channel')){
            caps['Energy'] -= global.race.psychicPowers.channel.boost;
            caps['Energy'] -= global.race.psychicPowers.channel.assault;
            caps['Energy'] -= global.race.psychicPowers.channel.cash;
            if (caps['Energy'] < 0){
                caps['Energy'] = 100;
                global.race.psychicPowers.channel.boost = 0;
                global.race.psychicPowers.channel.assault = 0;
                global.race.psychicPowers.channel.cash = 0;
            }
        }

        caps[global.race.species] = 0;

        breakdown.c = {};
        Object.keys(caps).forEach(function(res){
            breakdown.c[res] = { [loc('base')]: caps[res]+'v' };
        });

        if (global.race.universe === 'evil' && global.tech['primitive'] && global.tech.primitive >= 3){
            global.resource.Authority.display = true;
            let garrison = garrisonSize() || 0;

            if (global.civic.govern.type === 'autocracy'){
                let gain = 10;
                caps.Authority += gain;
                breakdown.c.Authority[loc('govern_autocracy')] = gain+'v';
            }
            else if (global.civic.govern.type === 'oligarchy'){
                let gain = 20;
                caps.Authority += gain;
                breakdown.c.Authority[loc('govern_oligarchy')] = gain+'v';
            }
            if (global.city['garrison']){
                let gain = global.city.garrison.on * 0.5;
                caps.Authority += gain;
                breakdown.c.Authority[actions.city.garrison.title()] = gain+'v';
            }
            if (global.city['temple'] && !global.race['warlord']){
                let gain = templeCount() * 0.5;
                caps.Authority += gain;
                breakdown.c.Authority[structName('temple')] = gain+'v';
            }
            if (global.space['space_barracks']){
                let gain = global.space.space_barracks.on * (global.race['cataclysm'] ? 2 : 1);
                caps.Authority += gain;
                breakdown.c.Authority[loc('space_red_space_barracks_title')] = gain+'v';
            }
            if (global.interstellar['cruiser'] && int_on['cruiser']){
                let gain = int_on['cruiser'];
                caps.Authority += gain;
                breakdown.c.Authority[loc('interstellar_cruiser_title')] = gain+'v';
            }
            if (global.race['warlord']){
                let gain = global.race?.absorbed?.length || 1;
                caps.Authority += gain;
                breakdown.c.Authority[loc('portal_throne_of_evil_title')] = gain+'v';
            }
            if (global.portal['brute']){
                let gain = global.portal.brute.on;
                caps.Authority += gain;
                breakdown.c.Authority[loc('portal_brute_bd')] = gain+'v';
            }
            if (global.portal['minions']){
                let gain = global.portal.minions.on;
                caps.Authority += gain;
                breakdown.c.Authority[loc('portal_minions_bd')] = gain+'v';
            }
            if (global.race['warlord'] && global.eden['bunker'] && support_on['bunker']){
                let gain = support_on['bunker'];
                caps.Authority += gain;
                breakdown.c.Authority[loc('eden_bunker_title')] = gain+'v';
            }
            if (global.race['lone_survivor'] || global.tech['isolation']){
                let gain = p_on['orbital_station'];
                caps.Authority += gain;
                breakdown.c.Authority[loc('tau_home_orbital_station')] = gain+'v';
            }

            let pet = 0;
            if (global.race['pet']){
                pet = 1;
                if (global.race['pet']){
                    if (global.race.pet.event > 0){
                        pet++;
                    }
                    if (global.race.pet.pet > 0){
                        pet += global.race.pet.type === 'cat' ? 2 : 1;
                    }
                    else if (global.race.pet.pet < 0){
                        pet -= global.race.pet.type === 'cat' ? 2 : 1
                    }
                }
                caps.Authority += pet;
                breakdown.c.Authority[loc(`event_pet_${global.race.pet.type}_owner`)] = pet+'v';
            }

            global.resource.Authority.amount = global.race['cataclysm'] || global.race['orbit_decayed'] ? 90 : (global.race['lone_survivor'] ? 100 : 80);
            if (global.city.morale.current > 100){
                let excess = global.city.morale.current - 100;
                if (global.civic.govern.type === 'democracy'){
                    excess *= 0.9;
                }
                global.resource.Authority.amount -= excess;
            }

            if (global.civic['garrison']){
                let adjust = 0.7;
                if (global.tech['evil']){
                    adjust += 0.1 * global.tech.evil;
                }
                if (global.portal['fortress']){
                    garrison += global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
                }
                let gain = highPopAdjust(garrison) * adjust;
                if (global.race['grenadier']){ gain *= 1.75; }
                if (global.civic.govern.type === 'autocracy'){
                    gain *= 1.08;
                }
                else if (global.civic.govern.type === 'dictator'){
                    gain *= 1.12;
                }
                global.resource.Authority.amount += gain;
            }

            if (pet !== 0){
                global.resource.Authority.amount += pet;
            }

            if ((global.race['lone_survivor'] || global.tech['isolation']) && global.tauceti['colony'] && support_on['colony']){
                global.resource.Authority.amount += support_on['colony'] * 5;
            }

            global.resource.Authority.amount = Math.floor(global.resource.Authority.amount);
            if (global.resource.Authority.amount < 0){ global.resource.Authority.amount = 0; }
        }
        else {
            global.resource.Authority.display = false;
        }

        if (global.race['unfathomable'] && global.city['captive_housing']){
            let strength = weaponTechModifer();
            let hunt = workerScale(global.civic.hunter.workers,'hunter')
            hunt *= racialTrait(hunt,'hunting') * strength;
            if (global.race['swift']){
                hunt *= 1 + (traits.swift.vars()[1] / 100);
            }

            if (global.race['servants']){
                let serve = global.race.servants.jobs.hunter * strength;
                serve *= servantTrait(global.race.servants.jobs.hunter,'hunting');
                hunt += serve;
            }

            let usedCap = 0;
            let thralls = 0;
            let imprisoned = [];
            if (global.city.hasOwnProperty('surfaceDwellers')){
                for (let i = 0; i < global.city.surfaceDwellers.length; i++){
                    let mindbreak = global.city.captive_housing[`race${i}`];
                    let jailed = global.city.captive_housing[`jailrace${i}`];
                    usedCap += mindbreak + jailed;
                    thralls += mindbreak;
                    if (jailed > 0){
                        imprisoned.push(i);
                    }
                }
            }

            let catchVar = Math.round(40 / traits.unfathomable.vars()[1]);
            if (usedCap < global.city.captive_housing.raceCap && Math.rand(0,(catchVar * usedCap) - hunt) <= 0){
                let k = Math.rand(0,global.city.surfaceDwellers.length);
                global.city.captive_housing[`jailrace${k}`]++;
            }

            if (global.tech['unfathomable'] && global.tech.unfathomable >= 2 && global.civic.torturer.workers > 0 && imprisoned.length > 0){
                if (Math.rand(0,Math.ceil((thralls+1) ** 1.45)) < (global.civic.torturer.workers / 2) * (1 + traits.psychic.vars()[0])){
                    let k = imprisoned[Math.rand(0,imprisoned.length)];
                    global.city.captive_housing[`jailrace${k}`]--;
                    global.city.captive_housing[`race${k}`]++;
                }
            }
        }

        if (global.race['psychic']){
            if (global.race['psychicPowers'] && global.race.psychicPowers.boostTime > 0){
                global.race.psychicPowers.boostTime--;
                if (global.race.psychicPowers.boostTime < 0 || global.race.psychicPowers.boostTime > 360){
                    global.race.psychicPowers.boostTime = 0;
                }
            }
            if (global.race['psychicPowers'] && global.race.psychicPowers['assaultTime'] && global.race.psychicPowers.assaultTime > 0){
                global.race.psychicPowers.assaultTime--;
                if (global.race.psychicPowers.assaultTime < 0 || global.race.psychicPowers.assaultTime > 360){
                    global.race.psychicPowers.assaultTime = 0;
                }
            }
            if (global.race['psychicPowers'] && global.race.psychicPowers['cash'] && global.race.psychicPowers.cash > 0){
                global.race.psychicPowers.cash--;
                if (global.race.psychicPowers.cash < 0 || global.race.psychicPowers.cash > 360){
                    global.race.psychicPowers.cash = 0;
                }
            }
        }

        if (global.city['nanite_factory']){
            let gain = global.city.nanite_factory.count * spatialReasoning(2500);
            caps['Nanite'] += gain;
            breakdown.c.Nanite[loc('city_nanite_factory')] = gain+'v';
        }
        if (p_on['transmitter'] && global.race['artifical']){
            let gain = p_on['transmitter'] * spatialReasoning(100);
            caps['Food'] += gain;
            breakdown.c.Food[loc('city_transmitter')] = gain+'v';
        }
        if (global.city['pylon'] || global.space['pylon'] || global.tauceti['pylon']){
            let gain = 0;
            let name = 'city_pylon';
            if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.space['pylon']){
                gain = spatialReasoning(2) * global.space.pylon.count;
                name = 'space_red_pylon';
            }
            else if (global.tech['isolation'] && global.tauceti['pylon']){
                gain = spatialReasoning(2) * global.tauceti.pylon.count;;
                name = 'tau_home_pylon';
            }
            else if (global.city['pylon']){
                gain = spatialReasoning(5) * global.city.pylon.count;;
            }

            caps['Mana'] += gain;
            breakdown.c.Mana[loc(name)] = gain+'v';
        }
        if (global.city['captive_housing']){
            let houses = global.city.captive_housing.count;
            global.city.captive_housing.raceCap = houses * (global.tech['unfathomable'] && global.tech.unfathomable >= 3 ? 3 : 2);
            global.city.captive_housing.cattleCap = houses * 5;
        }
        if (global.city['farm']){
            if (global.tech['farm']){
                let pop = global.city.farm.count * actions.city.farm.citizens();
                caps[global.race.species] += pop;
                breakdown.c[global.race.species][loc('city_farm')] = pop + 'v';
            }
        }
        if (global.city['wharf']){
            let vol = global.tech['world_control'] ? 15 : 10;
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                vol *= 2;
            }
            caps['Crates'] += (global.city.wharf.count * vol);
            breakdown.c.Crates[loc('city_wharf')] = (global.city.wharf.count * vol) + 'v';
            caps['Containers'] += (global.city.wharf.count * vol);
            breakdown.c.Containers[loc('city_wharf')] = (global.city.wharf.count * vol) + 'v';
        }
        if (global.space['munitions_depot']){
            let vol = 25;
            caps['Crates'] += (global.space.munitions_depot.count * vol);
            breakdown.c.Crates[loc('tech_munitions_depot')] = (global.space.munitions_depot.count * vol) + 'v';
            caps['Containers'] += (global.space.munitions_depot.count * vol);
            breakdown.c.Containers[loc('tech_munitions_depot')] = (global.space.munitions_depot.count * vol) + 'v';
        }
        if (global.interstellar['cargo_yard']){
            caps['Crates'] += (global.interstellar.cargo_yard.count * 50);
            breakdown.c.Crates[loc('interstellar_cargo_yard_title')] = (global.interstellar.cargo_yard.count * 50) + 'v';
            caps['Containers'] += (global.interstellar.cargo_yard.count * 50);
            breakdown.c.Containers[loc('interstellar_cargo_yard_title')] = (global.interstellar.cargo_yard.count * 50) + 'v';

            let gain = (global.interstellar.cargo_yard.count * spatialReasoning(200));
            caps['Neutronium'] += gain;
            breakdown.c.Neutronium[loc('interstellar_cargo_yard_title')] = gain+'v';

            gain = (global.interstellar.cargo_yard.count * spatialReasoning(150));
            caps['Infernite'] += gain;
            breakdown.c.Infernite[loc('interstellar_cargo_yard_title')] = gain+'v';
        }
        if (global.interstellar['neutron_miner'] && p_on['neutron_miner']){
            let gain = (p_on['neutron_miner'] * spatialReasoning(500));
            caps['Neutronium'] += gain;
            breakdown.c.Neutronium[loc('interstellar_neutron_miner_title')] = gain+'v';
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
            breakdown.c.Crates[loc('city_storage_yard')] = (global.city['storage_yard'].count * size) + 'v';
        }
        if (global.space['garage']){
            let g_vol = global.tech['particles'] >= 4 ? 20 + global.tech['supercollider'] : 20;
            if (global.tech['world_control'] || global.race['cataclysm']){
                g_vol += 10;
            }
            caps['Containers'] += (global.space.garage.count * g_vol);
            breakdown.c.Containers[loc('space_red_garage_title')] = (global.space.garage.count * g_vol) + 'v';
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                caps['Crates'] += (global.space.garage.count * g_vol);
                breakdown.c.Crates[loc('space_red_garage_title')] = (global.space.garage.count * g_vol) + 'v';
            }
        }
        if (global.tech['tp_depot']){
            caps['Containers'] += (global.tech.tp_depot * 50);
            breakdown.c.Containers[loc('galaxy_gateway_depot')] = (global.tech.tp_depot * 50) + 'v';
            caps['Crates'] += (global.tech.tp_depot * 50);
            breakdown.c.Crates[loc('galaxy_gateway_depot')] = (global.tech.tp_depot * 50) + 'v';
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
            breakdown.c.Containers[loc('city_warehouse')] = (global.city['warehouse'].count * volume) + 'v';
        }
        if (global.city['rock_quarry']){
            let gain = BHStorageMulti(global.city.rock_quarry.count * spatialReasoning(100));
            caps['Stone'] += gain;
            breakdown.c.Stone[loc('city_rock_quarry')] = gain+'v';

            caps['Chrysotile'] += gain;
            breakdown.c.Chrysotile[loc('city_rock_quarry')] = gain+'v';
        }
        if (global.city['lumber_yard']){
            let gain = BHStorageMulti(global.city.lumber_yard.count * spatialReasoning(100));
            caps['Lumber'] += gain;
            breakdown.c.Lumber[loc('city_lumber_yard')] = gain+'v';
        }
        else if (global.city['graveyard']){
            let gain = BHStorageMulti(global.city.graveyard.count * spatialReasoning(100));
            caps['Lumber'] += gain;
            breakdown.c.Lumber[loc('city_graveyard')] = gain+'v';
        }
        if (global.city['sawmill']){
            let gain = BHStorageMulti(global.city.sawmill.count * spatialReasoning(200));
            caps['Lumber'] += gain;
            breakdown.c.Lumber[loc('city_sawmill')] = gain+'v';
        }
        if (global.city['mine']){
            lCaps['miner'] += jobScale(global.city.mine.count);
        }
        if (global.portal['dig_demon'] && global.race['warlord']){
            let demons = global.portal.dig_demon.on * actions.portal.prtl_wasteland.dig_demon.citizens();
            caps[global.race.species] += demons;
            breakdown.c[global.race.species][loc('portal_dig_demon_title')] = demons + 'v';
            lCaps['miner'] += demons;
            global.civic.miner.max = demons;
            global.civic.miner.workers = demons;
            global.civic.miner.assigned = demons;
        }
        if (global.city['coal_mine']){
            lCaps['coal_miner'] += jobScale(global.city.coal_mine.count);
        }
        if (global.city['bank']){
            lCaps['banker'] += jobScale(global.city.bank.count);
        }
        if (global.city['amphitheatre']){
            let athVal = govActive('athleticism',1);
            lCaps['entertainer'] += jobScale(athVal ? (global.city.amphitheatre.count * athVal) : global.city.amphitheatre.count);
        }
        if (global.city['casino']){
            if (global.tech['theatre'] && !global.race['joyless']){
                lCaps['entertainer'] += jobScale(global.city.casino.count);
            }
        }
        if (global.space['spc_casino']){
            if (global.tech['theatre'] && !global.race['joyless']){
                lCaps['entertainer'] += jobScale(global.space.spc_casino.count);
            }
            if (global.race['orbit_decayed']){
                lCaps['banker'] += jobScale(global.space.spc_casino.count);
            }
        }
        if (global.portal['hell_casino']){
            if (global.tech['theatre'] && !global.race['joyless']){
                lCaps['entertainer'] += jobScale(global.portal.hell_casino.count * 3);
            }
            lCaps['banker'] += jobScale(global.portal.hell_casino.count);
        }
        if (global.tauceti['tauceti_casino']){
            if (global.tech['theatre'] && !global.race['joyless']){
                lCaps['entertainer'] += jobScale(global.tauceti.tauceti_casino.count);
            }
            if (global.tech['isolation']){
                lCaps['banker'] += jobScale(global.tauceti.tauceti_casino.count);

                let pop = p_on['tauceti_casino'] * actions.tauceti.tau_home.tauceti_casino.citizens();
                caps[global.race.species] += pop;
                breakdown.c[global.race.species][structName('casino')] = pop + 'v';
            }
        }
        if (global.galaxy['resort']){
            if (global.tech['theatre'] && !global.race['joyless']){
                lCaps['entertainer'] += jobScale(p_on['resort'] * 2);
            }
        }
        if (global.city['cement_plant']){
            lCaps['cement_worker'] += jobScale(global.city.cement_plant.count * 2);
        }
        if (global.eden['eden_cement']){
            let ec = p_on['eden_cement'] || 0;
            lCaps['cement_worker'] += jobScale(ec * 5);
        }
        if (global.race['orbit_decayed'] && p_on['red_factory']){
            lCaps['cement_worker'] += jobScale(p_on['red_factory']);
        }
        if (global.race['parasite'] && !global.tech['isolation']){
            lCaps['garrison'] += jobScale(traits.parasite.vars()[0]);
        }
        if (global.city['garrison']){
            lCaps['garrison'] += global.city.garrison.on * actions.city.garrison.soldiers();
        }
        if (global.space['space_barracks'] && !global.race['fasting']){
            let soldiers = actions.space.spc_red.space_barracks.soldiers();
            lCaps['garrison'] += Math.round(global.space.space_barracks.on * soldiers);
        }
        if (global.interstellar['cruiser']){
            let soldiers = actions.interstellar.int_proxima.cruiser.soldiers();
            lCaps['garrison'] += int_on['cruiser'] * soldiers;
        }
        if (global.portal['brute']){
            let soldiers = actions.portal.prtl_wasteland.brute.soldiers();
            lCaps['garrison'] += global.portal.brute.on * soldiers;
        }
        if (global.race['wish'] && global.race['wishStats']){
            lCaps['garrison'] += jobScale(global.race.wishStats.troop);
        }
        if (p_on['s_gate'] && global.galaxy['starbase']){
            let soldiers = actions.galaxy.gxy_gateway.starbase.soldiers();
            lCaps['garrison'] += p_on['starbase'] * soldiers;
        }
        if (global.eden['bunker']){
            let soldiers = actions.eden.eden_asphodel.bunker.soldiers();
            lCaps['garrison'] += support_on['bunker'] * soldiers;
        }
        if (global.eden['fire_support_base'] && global.eden.fire_support_base.count === 100){
            lCaps['garrison'] += actions.eden.eden_elysium.fire_support_base.soldiers();
        }
        if (global.race['orbit_decayed'] && global.space.hasOwnProperty('red_mine')){
            lCaps['miner'] += jobScale(support_on['red_mine']);
            lCaps['coal_miner'] += jobScale(support_on['red_mine']);
        }
        if (!global.tech['world_control']){
            let occ_amount = jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
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
            breakdown.c.Slave[loc('city_slave_housing',[global.resource.Slave.name])] = global.city.slave_pen.count * 4 + 'v';

            if (caps['Slave'] < global.resource.Slave.amount){
                global.resource.Slave.amount = caps['Slave'];
            }
        }
        if (global.race['calm'] && global.city['meditation']) {
            caps['Zen'] = global.city.meditation.count * traits.calm.vars()[0];
            breakdown.c.Zen[loc('city_meditation')] = global.city.meditation.count * traits.calm.vars()[0] + 'v';
            global.resource.Zen.amount = (global.resource[global.race.species].amount * 2) + global.civic.garrison.workers;
            if (global.resource.Zen.amount > global.resource.Zen.max){
                global.resource.Zen.amount = global.resource.Zen.max;
            }
            let zen = global.resource.Zen.amount / (global.resource.Zen.amount + 5000);
            breakdown.c.Zen[loc('trait_calm_desc')] = `+${(zen * 100).toFixed(2)}%`;
        }
        if (global.city['basic_housing']){
            let pop = global.city.basic_housing.count * actions.city.basic_housing.citizens();
            caps[global.race.species] += pop;
            breakdown.c[global.race.species][housingLabel('small')] = pop + 'v';
        }
        if (global.tauceti['tau_housing'] && global.tech['isolation']){
            let pop = global.tauceti.tau_housing.count * actions.tauceti.tau_home.tau_housing.citizens();
            caps[global.race.species] += pop;
            breakdown.c[global.race.species][housingLabel('small')] = pop + 'v';
        }
        if (global.city['cottage']){
            let pop = global.city.cottage.count * actions.city.cottage.citizens();
            caps[global.race.species] += pop;
            breakdown.c[global.race.species][housingLabel('medium')] = pop + 'v';
            if (global.tech['home_safe']){
                let gain = (global.city['cottage'].count * spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 5000 : 2000) : 1000));
                caps['Money'] += gain;
                breakdown.c.Money[housingLabel('medium')] = gain+'v';
            }
        }
        if (global.city['apartment']){
            let pop = p_on['apartment'] * actions.city.apartment.citizens();
            caps[global.race.species] += pop;
            breakdown.c[global.race.species][housingLabel('large')] = pop + 'v';
            if (global.tech['home_safe']){
                let gain = (p_on['apartment']  * spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 10000 : 5000) : 2000));
                caps['Money'] += gain;
                breakdown.c.Money[housingLabel('large')] = gain+'v';
            }
        }
        if (global.eden['rectory']){
            let pop = p_on['rectory'] * actions.eden.eden_asphodel.rectory.citizens();
            caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc(`eden_rectory_title`)] = pop + 'v';
        }
        if (p_on['s_gate'] && global.galaxy['consulate'] && global.galaxy.consulate.count >= 1){
            let pop = actions.galaxy.gxy_alien1.consulate.citizens();
            caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('galaxy_consulate')] = pop + 'v';
        }
        if (p_on['s_gate'] && p_on['embassy'] && global.tech.xeno >= 11){
            let pop = actions.galaxy.gxy_gorddon.embassy.citizens();
            caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('galaxy_embassy')] = pop + 'v';
        }
        if (p_on['s_gate'] && p_on['embassy'] && global.galaxy['dormitory']){
            let pop = p_on['dormitory'] * actions.galaxy.gxy_gorddon.dormitory.citizens();
            caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('galaxy_dormitory')] = pop + 'v';
        }
        if (p_on['arcology']){
            let pop = p_on['arcology'] * actions.portal.prtl_ruins.arcology.citizens();
            caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('portal_arcology_title')] = pop + 'v';
            lCaps['garrison'] += p_on['arcology'] * actions.portal.prtl_ruins.arcology.soldiers();

            caps['Containers'] += (p_on['arcology'] * Math.round(quantum_level) * 10);
            breakdown.c.Containers[loc('portal_arcology_title')] = (p_on['arcology'] * Math.round(quantum_level) * 10) + 'v';
            caps['Crates'] += (p_on['arcology'] * Math.round(quantum_level) * 10);
            breakdown.c.Crates[loc('portal_arcology_title')] = (p_on['arcology'] * Math.round(quantum_level) * 10) + 'v';

            let sup = hellSupression('ruins');
            let money = (p_on['arcology'] * spatialReasoning(bank_vault() * 8 * sup.supress));
            caps['Money'] += money;
            breakdown.c.Money[loc('portal_arcology_title')] = money+'v';
        }

        if (global.portal['bazaar'] && global.portal['spire']){
            let containers = (global.portal.bazaar.count * global.portal.spire.count * 8);
            caps['Containers'] += containers;
            breakdown.c.Containers[loc('portal_bazaar_title')] = containers + 'v';
            caps['Crates'] += containers;
            breakdown.c.Crates[loc('portal_bazaar_title')] = containers + 'v';

            let money = spatialReasoning(bank_vault() * global.portal.spire.count * global.portal.bazaar.count / 3);
            caps['Money'] += money;
            breakdown.c.Money[loc('portal_bazaar_title')] = money+'v';
        }

        if (support_on['colony']){
            let containers = global.tech['isolation'] ? 900 : 250;
            caps['Containers'] += (support_on['colony'] * containers);
            breakdown.c.Containers[loc('tau_home_colony')] = (support_on['colony'] * containers) + 'v';
            caps['Crates'] += (support_on['colony'] * containers);
            breakdown.c.Crates[loc('tau_home_colony')] = (support_on['colony'] * containers) + 'v';

            let pop = support_on['colony'] * actions.tauceti.tau_home.colony.citizens();
            caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('tau_home_colony')] = pop + 'v';
        }
        if (p_on['operating_base']){
            lCaps['garrison'] += Math.min(support_on['operating_base'],p_on['operating_base']) * actions.space.spc_enceladus.operating_base.soldiers();
        }
        if (p_on['fob']){
            lCaps['garrison'] += actions.space.spc_triton.fob.soldiers();
        }
        if (global.space['living_quarters']){
            let gain = Math.round(support_on['living_quarters'] * actions.space.spc_red.living_quarters.citizens());
            caps[global.race.species] += gain;
            lCaps['colonist'] += jobScale(support_on['living_quarters']);
            breakdown.c[global.race.species][`${planetName().red}`] = gain + 'v';

            if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.tech['home_safe']){
                let gain = (support_on['living_quarters'] * spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 100000 : 50000) : 25000));
                caps['Money'] += gain;
                breakdown.c.Money[loc('space_red_living_quarters_title')] = gain+'v';
            }
        }
        if (support_on['biodome'] && (global.race['artifical'] || global.race['orbit_decayed'])){
            let gain = support_on['biodome'] * spatialReasoning(global.race['artifical'] ? 500 : 100);
            caps['Food'] += gain;
            breakdown.c.Food[loc('space_red_signal_tower_title')] = gain+'v';
        }
        if (global.space['titan_quarters']){
            let gain = Math.round(support_on['titan_quarters'] * actions.space.spc_titan.titan_quarters.citizens());
            caps[global.race.species] += gain;
            lCaps['titan_colonist'] += jobScale(support_on['titan_quarters']);
            breakdown.c[global.race.species][`${planetName().titan}`] = gain + 'v';
        }

        if (global.interstellar['habitat'] && p_on['habitat']){
            let pop = p_on['habitat'] * actions.interstellar.int_alpha.habitat.citizens();
            caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('interstellar_habitat_title')] = pop + 'v';
        }
        if (global.interstellar['luxury_condo'] && p_on['luxury_condo']){
            let cit = p_on['luxury_condo'] * actions.interstellar.int_alpha.luxury_condo.citizens();
            caps[global.race.species] += cit;
            breakdown.c[global.race.species][loc('tech_luxury_condo')] = cit + 'v';
            let gain = (p_on['luxury_condo']  * spatialReasoning(750000));
            caps['Money'] += gain;
            breakdown.c.Money[loc('tech_luxury_condo')] = gain+'v';
        }
        if (global.city['lodge']){
            let cit = global.city.lodge.count * actions.city.lodge.citizens();
            caps[global.race.species] += cit;
            breakdown.c[global.race.species][loc('city_lodge')] = cit + 'v';
        }
        if (global.portal['hovel']){
            let cit = global.portal.hovel.count * actions.portal.prtl_wasteland.hovel.citizens();
            caps[global.race.species] += cit;
            breakdown.c[global.race.species][loc('portal_hovel_title')] = cit + 'v';
        }
        if (global.space['outpost']){
            let gain = global.space['outpost'].count * spatialReasoning(500);
            caps['Neutronium'] += gain;
            breakdown.c.Neutronium[loc('space_gas_moon_outpost_title')] = gain+'v';
        }
        if (global.city['shed']){
            var multiplier = storageMultipler();
            let label = global.tech['storage'] <= 2 ? loc('city_shed_title1') : (global.tech['storage'] >= 4 ? loc('city_shed_title3') : loc('city_shed_title2'));
            for (const res of actions.city.shed.res()){
                if (global.resource[res].display){
                    let gain = global.city.shed.count * spatialReasoning(actions.city.shed.val(res) * multiplier);
                    caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.race['lone_survivor']){
            breakdown.c[global.race.species][loc('base')] = '1v';
            caps[global.race.species] = 1;
        }

        if (global.interstellar['warehouse']){
            var multiplier = storageMultipler();
            let label = loc('interstellar_alpha_name');
            for (const res of actions.interstellar.int_alpha.warehouse.res()){
                if (global.resource[res].display){
                    let gain = global.interstellar.warehouse.count * spatialReasoning(actions.interstellar.int_alpha.warehouse.val(res) * multiplier);
                    caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.eden['warehouse']){
            var multiplier = storageMultipler(global.race['warlord'] ? 1 : 0.2);
            if (global.race['warlord'] && global.eden['corruptor']){
                multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 12 ? (global.tech.asphodel >= 13 ? 0.16 : 0.12) : 0.08);
            }
            let label = loc('eden_asphodel_name');
            for (const res of actions.eden.eden_asphodel.warehouse.res()){
                if (global.resource[res].display){
                    let gain = global.eden.warehouse.count * spatialReasoning(actions.eden.eden_asphodel.warehouse.val(res) * multiplier);
                    caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.portal['warehouse']){
            var multiplier = storageMultipler();
            if (global.race['warlord'] && global.eden['corruptor'] && global.tech.asphodel >= 12){
                multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 13 ? 0.16 : 0.12);
            }
            let label = global.tech['storage'] <= 2 ? loc('city_shed_title1') : (global.tech['storage'] >= 4 ? loc('city_shed_title3') : loc('city_shed_title2'));
            for (const res of actions.portal.prtl_wasteland.warehouse.res()){
                if (global.resource[res].display){
                    let gain = global.portal.warehouse.count * spatialReasoning(actions.portal.prtl_wasteland.warehouse.val(res) * multiplier);
                    caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
            let cc_gain = global.portal.warehouse.count * (65 + global.portal.warehouse.rank * 35);
            caps['Crates'] += cc_gain;
            breakdown.c['Crates'][label] = cc_gain+'v';
            caps['Containers'] += cc_gain;
            breakdown.c['Containers'][label] = cc_gain+'v';
        }

        if (global.space['storehouse']){
            var multiplier = tpStorageMultiplier('storehouse',false);
            var h_multiplier = tpStorageMultiplier('storehouse',true);
            let label = loc('space_storehouse_title');
            for (const res of actions.space.spc_titan.storehouse.res()){
                if (global.resource[res].display){
                    let heavy = actions.space.spc_titan.storehouse.heavy(res);
                    let gain = global.space.storehouse.count * spatialReasoning(actions.space.spc_titan.storehouse.val(res) * (heavy ? h_multiplier : multiplier));
                    caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.tauceti['repository']){
            var multiplier = tpStorageMultiplier('repository');
            let label = loc('tech_repository');
            for (const res of actions.tauceti.tau_home.repository.res()){
                if (global.resource[res].display){
                    let gain = global.tauceti.repository.count * spatialReasoning(actions.tauceti.tau_home.repository.val(res) * multiplier);
                    caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
            if (global.tech['isolation']){
                let containers = 250;
                caps['Containers'] += (global.tauceti.repository.count * containers);
                breakdown.c.Containers[loc('tech_repository')] = (global.tauceti.repository.count * containers) + 'v';
                caps['Crates'] += (global.tauceti.repository.count * containers);
                breakdown.c.Crates[loc('tech_repository')] = (global.tauceti.repository.count * containers) + 'v';
            }
        }

        if (global.tech['isolation'] && p_on['tau_farm'] && global.race['artifical']){
            let gain = p_on['tau_farm'] * spatialReasoning(350);
            caps['Food'] += gain;
            breakdown.c.Food[loc('tau_home_tau_farm')] = gain+'v';
        }

        if (global.galaxy['gateway_depot']){
            let containers = global.tech['world_control'] ? 150 : 100;
            caps['Crates'] += (global.galaxy.gateway_depot.count * containers);
            breakdown.c.Crates[loc('galaxy_gateway_depot')] = (global.galaxy.gateway_depot.count * containers) + 'v';
            caps['Containers'] += (global.galaxy.gateway_depot.count * containers);
            breakdown.c.Containers[loc('galaxy_gateway_depot')] = (global.galaxy.gateway_depot.count * containers) + 'v';

            let label = loc('galaxy_gateway_depot');
            let multiplier = gatewayStorage();

            if (global.resource.Uranium.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(3000 * multiplier)));
                caps['Uranium'] += gain;
                breakdown.c.Uranium[label] = gain+'v';
            }

            if (global.resource.Nano_Tube.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(250000 * multiplier)));
                caps['Nano_Tube'] += gain;
                breakdown.c.Nano_Tube[label] = gain+'v';
            }

            if (global.resource.Neutronium.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(9001 * multiplier)));
                caps['Neutronium'] += gain;
                breakdown.c.Neutronium[label] = gain+'v';
            }

            if (global.resource.Infernite.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(6660 * multiplier)));
                caps['Infernite'] += gain;
                breakdown.c.Infernite[label] = gain+'v';
            }

            if (global.resource.Elerium.display && p_on['gateway_depot'] && p_on['s_gate']){
                let gain = (p_on['gateway_depot'] * (spatialReasoning(200)));
                caps['Elerium'] += gain;
                breakdown.c.Elerium[label] = gain+'v';
            }
        }

        if (global.resource.Infernite.display && global.portal['fortress'] && !global.race['warlord']){
            let gain = spatialReasoning(1000);
            caps['Infernite'] += gain;
            breakdown.c.Infernite[loc('portal_fortress_name')] = gain+'v';
        }

        if (global.space['garage']){
            var multiplier = actions.space.spc_red.garage.multiplier(false);
            var h_multiplier = actions.space.spc_red.garage.multiplier(true);
            let label = loc('space_red_garage_title');
            for (const res of actions.space.spc_red.garage.res()){
                if (global.resource[res].display){
                    let heavy = actions.space.spc_red.garage.heavy(res);
                    let gain = global.space.garage.count * spatialReasoning(actions.space.spc_red.garage.val(res) * (heavy ? h_multiplier : multiplier));
                    caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.portal['harbor'] && p_on['harbor']){
            let multiplier = 1;
            if (global.race['warlord'] && global.eden['corruptor'] && global.tech?.asphodel >= 12){
                multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 13 ? 0.12 : 0.1);
            }
            let label = loc('portal_harbor_title');
            for (const res of actions.portal.prtl_lake.harbor.res()){
                if (global.resource[res].display){
                    let gain = p_on['harbor'] * spatialReasoning(actions.portal.prtl_lake.harbor.val(res) * multiplier);
                    caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.city['silo']){
            let gain = BHStorageMulti(global.city['silo'].count * spatialReasoning(500));
            caps['Food'] += gain;
            breakdown.c.Food[loc('city_silo')] = gain+'v';
        }
        if (global.city['compost']){
            let gain = BHStorageMulti(global.city['compost'].count * spatialReasoning(200));
            caps['Food'] += gain;
            breakdown.c.Food[loc('city_compost_heap')] = gain+'v';
        }
        if (global.city['soul_well']){
            let gain = BHStorageMulti(global.city['soul_well'].count * spatialReasoning(500));
            caps['Food'] += gain;
            breakdown.c.Food[loc('city_soul_well')] = gain+'v';
        }
        if (global.city['smokehouse']){
            let gain = BHStorageMulti(global.city['smokehouse'].count * spatialReasoning(100));
            caps['Food'] += gain;
            breakdown.c.Food[loc('city_smokehouse')] = gain+'v';
        }
        if (global.city['oil_well']){
            let gain = (global.city['oil_well'].count * spatialReasoning(500));
            caps['Oil'] += gain;
            breakdown.c.Oil[loc('city_oil_well')] = gain+'v';
        }
        if (global.city['oil_depot']){
            let gain = (global.city['oil_depot'].count * spatialReasoning(1000));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Oil'] += gain;
            breakdown.c.Oil[loc('city_oil_depot')] = gain+'v';
            if (global.tech['uranium'] >= 2){
                gain = (global.city['oil_depot'].count * spatialReasoning(250));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                caps['Uranium'] += gain;
                breakdown.c.Uranium[loc('city_oil_depot')] = gain+'v';
            }
            if (global.resource['Helium_3'].display){
                gain = (global.city['oil_depot'].count * spatialReasoning(400));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                caps['Helium_3'] += gain;
                breakdown.c.Helium_3[loc('city_oil_depot')] = gain+'v';
            }
        }
        if (global.space['propellant_depot']){
            let gain = (global.space['propellant_depot'].count * spatialReasoning(1250));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Oil'] += gain;
            breakdown.c.Oil[loc('space_home_propellant_depot_title')] = gain+'v';
            if (global.resource['Helium_3'].display){
                gain = (global.space['propellant_depot'].count * spatialReasoning(1000));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                caps['Helium_3'] += gain;
                breakdown.c.Helium_3[loc('space_home_propellant_depot_title')] = gain+'v';
            }
        }
        if (p_on['orbital_station']){
            let gain = (p_on['orbital_station'] * spatialReasoning(15000));
            caps['Helium_3'] += gain;
            breakdown.c.Helium_3[loc('tau_home_orbital_station')] = gain+'v';
        }
        if (p_on['refueling_station']){
            let h_gain = (p_on['refueling_station'] * spatialReasoning(10000));
            caps['Helium_3'] += h_gain;
            breakdown.c.Helium_3[loc('tau_gas_refueling_station_title')] = h_gain+'v';

            if (global.tech['tau_whale'] >= 2){
                let o_gain = (p_on['refueling_station'] * spatialReasoning(6500));
                caps['Oil'] += o_gain;
                breakdown.c.Oil[loc('tau_gas_refueling_station_title')] = o_gain+'v';
            }
        }
        if (p_on['orbital_platform']){
            let gain = (p_on['orbital_platform'] * spatialReasoning(17500));
            caps['Oil'] += gain;
            breakdown.c.Oil[loc('tau_red_orbital_platform')] = gain+'v';
        }
        if (global.space['gas_storage']){
            let gain = (global.space['gas_storage'].count * spatialReasoning(3500));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Oil'] += gain;
            breakdown.c.Oil[`${planetName().gas} ${loc('depot')}`] = gain+'v';

            gain = (global.space['gas_storage'].count * spatialReasoning(2500));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Helium_3'] += gain;
            breakdown.c.Helium_3[`${planetName().gas} ${loc('depot')}`] = gain+'v';

            gain = (global.space['gas_storage'].count * spatialReasoning(1000));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            caps['Uranium'] += gain;
            breakdown.c.Uranium[`${planetName().gas} ${loc('depot')}`] = gain+'v';
        }
        if (p_on['xfer_station']){
            let gain = (p_on['xfer_station'] * spatialReasoning(5000));
            caps['Helium_3'] += gain;
            breakdown.c.Helium_3[loc('interstellar_xfer_station_title')] = gain+'v';

            gain = (p_on['xfer_station'] * spatialReasoning(4000));
            caps['Oil'] += gain;
            breakdown.c.Oil[loc('interstellar_xfer_station_title')] = gain+'v';

            gain = (p_on['xfer_station'] * spatialReasoning(2500));
            caps['Uranium'] += gain;
            breakdown.c.Uranium[loc('interstellar_xfer_station_title')] = gain+'v';

            if (global.resource.Deuterium.display){
                let deuterium_gain = p_on['xfer_station'] * spatialReasoning(2000);
                caps['Deuterium'] += deuterium_gain;
                breakdown.c.Deuterium[loc('interstellar_xfer_station_title')] = deuterium_gain+'v';
            }
        }
        if (global.space['helium_mine']){
            let gain = (global.space['helium_mine'].count * spatialReasoning(100));
            caps['Helium_3'] += gain;
            breakdown.c.Helium_3[loc('space_moon_helium_mine_title')] = gain+'v';
        }
        if (global.portal['pumpjack']){
            let gain = (global.portal.pumpjack.count * spatialReasoning(500));
            caps['Oil'] += gain;
            breakdown.c.Oil[loc('portal_pumpjack_title')] = gain+'v';
        }
        if (global.portal['pumpjack']){
            let gain = (global.portal.pumpjack.count * spatialReasoning(250));
            caps['Helium_3'] += gain;
            breakdown.c.Helium_3[loc('portal_pumpjack_title')] = gain+'v';
        }
        if (shrineBonusActive()){
            let getShrineResult = getShrineBonus('know');
            caps['Knowledge'] += getShrineResult.add;
            breakdown.c.Knowledge[loc('city_shrine')] = getShrineResult.add+'v';
        }
        if (global.city['temple'] && global.genes['ancients'] && global.genes['ancients'] >= 2){
            lCaps['priest'] += jobScale(templeCount());
        }
        if (global.space['ziggurat'] && global.genes['ancients'] && global.genes['ancients'] >= 4){
            lCaps['priest'] += jobScale(templeCount(true));
        }
        if (global.eden['rectory'] && global.genes['ancients'] && global.genes['ancients'] >= 2 && p_on['rectory']){
            lCaps['priest'] += jobScale(p_on['rectory']);
        }
        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.priest){
            lCaps['priest'] += jobScale(global.race.wishStats.priest);
        }
        let pirate_alien2 = piracy('gxy_alien2');
        if (global.city['university']){
            let gain = actions.city.university.knowVal() * global.city.university.count;
            lCaps['professor'] += jobScale(global.city.university.count);
            caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('city_university')] = gain+'v';
        }
        if (global.race['lone_survivor'] && global.tauceti['alien_outpost']){
            lCaps['professor'] += jobScale(global.tauceti.alien_outpost.count);
        }
        if (global.city['library']){
            let shelving = 125;
            if (global.race['nearsighted']){
                shelving *= 1 - (traits.nearsighted.vars()[0] / 100);
            }
            if (global.race['studious']){
                shelving *= 1 + (traits.studious.vars()[1] / 100);
            }
            let fathom = fathomCheck('elven');
            if (fathom > 0){
                shelving *= 1 + (traits.studious.vars(1)[1] / 100 * fathom);
            }
            if (global.tech['science'] && global.tech['science'] >= 8){
                shelving *= 1.4;
            }
            if (global.tech['science'] && global.tech['science'] >= 5){
                let sci_val = workerScale(global.civic.scientist.workers,'scientist');
                if (global.race['high_pop']){
                    sci_val = highPopAdjust(sci_val);
                }
                shelving *= 1 + (sci_val * 0.12);
            }
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 2){
                shelving *= 1 + faithTempleCount() * 0.05;
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
            breakdown.c.Knowledge[loc('city_library')] = gain+'v';
            if (global.tech['science'] && global.tech['science'] >= 3){
                global.civic.professor.impact = 0.5 + (global.city.library.count * 0.01)
            }
        }
        if (global.city['wardenclyffe']){
            let gain_base = 1000;
            if (global.city.ptrait.includes('magnetic')){
                gain_base += planetTraits.magnetic.vars()[1];
            }
            let gain = global.city['wardenclyffe'].count * gain_base;
            lCaps['scientist'] += jobScale(global.city['wardenclyffe'].count);
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
            breakdown.c.Knowledge[wardenLabel()] = gain+'v';

            if (global.race.universe === 'magic'){
                let mana = global.city.wardenclyffe.count * spatialReasoning(8);
                caps['Mana'] += mana;
                breakdown.c.Mana[wardenLabel()] = mana+'v';
            }

            if (global.race['artifical']){
                let gain = p_on['wardenclyffe'] * spatialReasoning(250);
                caps['Food'] += gain;
                breakdown.c.Food[wardenLabel()] = gain+'v';
            }
        }
        if (global.race['logical']){
            let factor = global.tech.hasOwnProperty('high_tech') ? global.tech.high_tech : 0;
            factor += global.tech.hasOwnProperty('science') ? global.tech.science : 0;
            let gain = global.resource[global.race.species].amount * traits.logical.vars()[1] * factor;
            caps['Knowledge'] += gain;
            breakdown.c.Knowledge[races[global.race.species].name] = gain+'v';
        }
        if (global.portal['sensor_drone']){
            let gain = p_on['sensor_drone'] * (global.tech.infernite >= 6 ? 2500 : 1000);
            caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('portal_sensor_drone_title')] = gain+'v';
        }
        if (global.space['satellite']){
            let gain = (global.space.satellite.count * (global.race['cataclysm'] || global.race['orbit_decayed'] ? 2000 : 750));
            if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.tech['supercollider']){
                let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 5: 10;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('space_home_satellite_title')] = gain+'v';
        }
        if (global.space['observatory'] && global.space.observatory.count > 0){
            let gain = (support_on['observatory'] * 5000);
            if (global.race['cataclysm'] && global.space['satellite'] && global.space.satellite.count > 0){
                gain *= 1 + (global.space.satellite.count * 0.25);
            }

            caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('space_moon_observatory_title')] = gain+'v';

            if (global.race['cataclysm']){
                lCaps['professor'] += jobScale(support_on['observatory']);
            }
        }
        if (global.interstellar['laboratory'] && int_on['laboratory'] > 0){
            if (global.tech.science >= 16){
                lCaps['scientist'] += jobScale(int_on['laboratory']);
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
            breakdown.c.Knowledge[loc(global.race.universe === 'magic' ? 'tech_sanctum' : 'interstellar_laboratory_title')] = gain+'v';

            if (global.race.universe === 'magic'){
                let mana = int_on['laboratory'] * spatialReasoning(12);
                caps['Mana'] += mana;
                breakdown.c.Mana[loc(global.race.universe === 'magic' ? 'tech_sanctum' : 'interstellar_laboratory_title')] = mana+'v';
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
            if (global.race['elemental'] && traits.elemental.vars()[0] === 'frost'){
                gain *= 1 + highPopAdjust(traits.elemental.vars()[4] * global.resource[global.race.species].amount / 100);
            }

            caps['Knowledge'] += (p_on['biolab'] * gain);
            breakdown.c.Knowledge[loc('city_biolab')] = (p_on['biolab'] * gain)+'v';
        }
        if (global.space['zero_g_lab'] && Math.min(support_on['zero_g_lab'],p_on['zero_g_lab']) > 0){
            let using = Math.min(support_on['zero_g_lab'],p_on['zero_g_lab']);
            let synd = syndicate('spc_enceladus');
            let gain = Math.round(using * 10000 * synd);
            caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('tech_zero_g_lab')] = gain+'v';

            if (global.resource.Cipher.display){
                let cipher = 10000 * using;
                caps['Cipher'] += cipher;
                breakdown.c.Cipher[loc('tech_zero_g_lab')] = cipher+'v';
            }
        }
        if (global.race['warlord']){
            let gain = (global.race?.absorbed?.length || 1) * 500000;
            if (shrineBonusActive()){
                let shrineBonus = getShrineBonus('know');
                gain *= shrineBonus.mult;
            }
            caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('portal_throne_of_evil_title')] = gain+'v';

            caps['Crates'] += 500;
            breakdown.c.Crates[loc('portal_throne_of_evil_title')] = 500 + 'v';
            caps['Containers'] += 500;
            breakdown.c.Containers[loc('portal_throne_of_evil_title')] = 500 + 'v';
        }
        if (global.portal['twisted_lab'] && global.portal.twisted_lab.count > 0 && global.race['absorbed']){
            let baseVal = 6000 + global.portal.twisted_lab.rank * 2000;
            let gain = (p_on['twisted_lab'] * baseVal * global.race.absorbed.length);
            if (global.tech['supercollider'] && global.race['warlord']){
                let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 12.5: 25;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('portal_twisted_lab_title')] = gain+'v';
        }

        //Omniscience
        if (global.resource.Omniscience.display){
            if (global.eden['research_station']){
                let corruptor = 1;
                if (global.race['warlord'] && global.eden['corruptor']){
                    corruptor = 1 + (p_on['corruptor'] || 0) * 0.04;
                }
                let gain = (support_on['research_station'] || 0) * Math.round(777 * corruptor);
                caps['Omniscience'] += gain;
                breakdown.c.Omniscience[loc('eden_research_station_title')] = gain+'v';
            }

            if (global.race['warlord'] && global.portal['mortuary'] && global.portal['corpse_pile']){
                let gain = global.portal.corpse_pile.count * (p_on['mortuary'] || 0) * (p_on['encampment'] || 0) * 2; 
                caps['Omniscience'] += gain;
                breakdown.c.Omniscience[loc('eden_encampment_title')] = gain+'v';
            }
            else if (p_on['ascension_trigger'] && global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
                let heatSink = actions.interstellar.int_sirius.ascension_trigger.heatSink();
                heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;
                let omniscience = +(150 + (heatSink ** 0.95 / 10)).toFixed(0);

                let gain = (p_on['encampment'] || 0) * omniscience;
                caps['Omniscience'] += gain;
                breakdown.c.Omniscience[loc('eden_encampment_title')] = gain+'v';
            }

            if (global.eden['archive']){
                let gain = (p_on['archive'] || 0) * 1013;
                caps['Omniscience'] += gain;
                breakdown.c.Omniscience[loc('eden_archive_bd')] = gain+'v';
            }
        }

        if (global.tech['isolation'] && global.tauceti['alien_outpost'] && global.resource.Cipher.display){
            let cipher = 200000;
            caps['Cipher'] += cipher;
            breakdown.c.Cipher[loc('tech_alien_outpost')] = cipher+'v';
        }

        if (global.portal['archaeology']){
            let sup = hellSupression('ruins');
            let value = 250000;
            if (global.race['high_pop']){
                value = highPopAdjust(value);
            }
            let gain = Math.round(value * sup.supress);
            caps['Knowledge'] += (workerScale(global.civic.archaeologist.workers,'archaeologist') * gain);
            breakdown.c.Knowledge[loc('portal_archaeology_bd')] = (workerScale(global.civic.archaeologist.workers,'archaeologist') * gain)+'v';
        }

        if (p_on['embassy'] && global.galaxy['symposium']){
            let dorm = 1750 * p_on['dormitory'];
            let gtrade = 650 * global.galaxy.trade.cur;
            let leave = 0;
            if (global.tech.xeno >= 7){
                for (let j = 0; j < galaxy_ship_types.length; j++){
                    const area = galaxy_ship_types[j].area;
                    const region = galaxy_ship_types[j].region;
                    if (area !== 'galaxy') { continue; }

                    let crew = 0;
                    for (const ship of gatewayArmada){
                        crew += global.galaxy.defense[region][ship] * (actions[area]['gxy_gateway'][ship].ship.civ() + actions[area]['gxy_gateway'][ship].ship.mil());
                    }

                    for (let i=0; i<galaxy_ship_types[j].ships.length; i++){
                        const ship = galaxy_ship_types[j].ships[i];
                        if (!gatewayArmada.includes(ship) && actions[area][region][ship].hasOwnProperty('ship') && gal_on[ship]){
                            // Every ship with the 'ship' property has both civ() and mil() functions
                            crew += gal_on[ship] * (actions[area][region][ship].ship.civ() + actions[area][region][ship].ship.mil());
                        }
                    }

                    if (region === 'gxy_gorddon'){
                        leave += +highPopAdjust(crew).toFixed(2) * 300;
                    }
                    else {
                        leave += +highPopAdjust(crew).toFixed(2) * 100 * piracy(region);
                    }
                }
            }
            let pirate = piracy('gxy_gorddon');
            let know = (dorm + gtrade + leave) * pirate * p_on['symposium'];
            caps['Knowledge'] += know;
            breakdown.c.Knowledge[loc('galaxy_symposium')] = know +'v';
        }

        if (global.city['bank'] || (global.race['cataclysm'] && p_on['spaceport'])){
            let vault = global.race['cataclysm'] || global.race['orbit_decayed'] ? bank_vault() * 4 : bank_vault();
            let banks = global.race['cataclysm'] || global.race['orbit_decayed'] ? p_on['spaceport'] : global.city['bank'].count;

            let gain = (banks * spatialReasoning(vault));
            caps['Money'] += gain;

            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                breakdown.c.Money[loc('space_red_spaceport_title')] = gain+'v';
            }
            else {
                breakdown.c.Money[loc('city_bank')] = gain+'v';
            }

            if (global.interstellar['exchange']){
                if (global.eden['eternal_bank']){ banks += global.eden.eternal_bank.count * 2; }
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
                breakdown.c.Money[loc('interstellar_exchange_bd')] = g_vault+'v';
            }
        }

        if (global.eden['eternal_bank']){
            let vault = bank_vault() * (global.race['warlord'] ? 20 : 10);
            if (global.race['warlord'] && global.eden['corruptor'] && global.tech.asphodel >= 12){
                vault *= 1 + (p_on['corruptor'] || 0) * 0.08;
            }
            let banks = global.eden.eternal_bank.count;
            let gain = (banks * spatialReasoning(vault));
            caps['Money'] += gain;
            breakdown.c.Money[loc('eden_eternal_bank_title')] = gain+'v';
        }

        if (global.space['titan_bank']){
            let vault = bank_vault() * 2;
            let banks = global.space.titan_bank.count;
            let gain = (banks * spatialReasoning(vault));
            caps['Money'] += gain;
            breakdown.c.Money[`${planetName().titan} ${loc('city_bank')}`] = gain+'v';
        }

        if (global.tauceti['colony'] && global.tech['isolation']){
            let vault = bank_vault() * 25;
            let gain = (global.tauceti.colony.count * spatialReasoning(vault));
            caps['Money'] += gain;
            breakdown.c.Money[loc('tau_home_colony')] = gain+'v';
        }

        if (global.city['casino'] || global.space['spc_casino'] || global.tauceti['tauceti_casino'] || global.portal['hell_casino']){
            let casinos = 0;
            if (global.city['casino'] && global.city.casino.count > 0){
                casinos += global.city.casino.count;
            }
            if (global.space['spc_casino'] && global.space.spc_casino.count > 0){
                casinos += global.space.spc_casino.count;
            }
            if (global.tauceti['tauceti_casino'] && global.tauceti.tauceti_casino.count > 0){
                casinos += global.tauceti.tauceti_casino.count;
            }
            if (global.portal['hell_casino'] && global.portal.hell_casino.count > 0){
                casinos += global.portal.hell_casino.count;
            }

            let vault = casinos * casino_vault();
            caps['Money'] += vault;
            breakdown.c.Money[structName('casino')] = vault+'v';
        }
        if (global.galaxy['resort']){
            let vault = p_on['resort'] * spatialReasoning(global.tech['world_control'] ? 1875000 : 1500000);
            caps['Money'] += vault;
            breakdown.c.Money[loc('galaxy_resort')] = vault+'v';
        }
        if (global.tech['banking'] >= 4){
            let cm = 250;
            if (global.tech.banking >= 14){
                cm = 1000000;
            }
            else if (global.tech.banking >= 11){
                cm = 1000;
            }
            else if (global.tech.banking >= 6){
                cm = 600;
            }
            let gain = cm * (global.resource[global.race.species].amount + global.civic.garrison.workers);
            if (global.race['high_pop']){
                gain = highPopAdjust(gain);
            }
            caps['Money'] += gain;
            breakdown.c.Money[global.tech.banking >= 14 ? loc('tech_crypto_currency') : loc('tech_bonds')] = gain+'v';
        }
        if (p_on['moon_base']){
            let gain = p_on['moon_base'] * spatialReasoning(500);
            caps['Iridium'] += gain;
            breakdown.c.Iridium[loc('space_moon_base_title')] = gain+'v';
        }
        if (p_on['space_station']){
            lCaps['space_miner'] += jobScale(p_on['space_station'] * 3);
            if (global.tech['asteroid'] >= 5){
                let gain = p_on['space_station'] * spatialReasoning(5);
                caps['Elerium'] += gain;
                breakdown.c.Elerium[loc('space_belt_station_title')] = gain+'v';
            }
        }
        if (support_on['exotic_lab']){
            let el_gain = support_on['exotic_lab'] * spatialReasoning(10);
            caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('space_red_exotic_lab_bd')] = el_gain+'v';
            let sci = 500;
            if (global.tech['science'] >= 13 && global.interstellar['laboratory']){
                sci += int_on['laboratory'] * 25;
            }
            if (global.tech['ancient_study'] && global.tech['ancient_study'] >= 2){
                sci += templeCount(true) * 15;
            }
            if (global.tech.mass >= 2){
                let brain = workerScale(global.civic.scientist.workers,'scientist');
                if (global.race['high_pop']){
                    brain = highPopAdjust(brain);
                }
                sci += p_on['mass_driver'] * brain;
            }
            if (global.race['cataclysm'] && support_on['observatory']){
                sci *= 1 + (support_on['observatory'] * 0.25);
            }
            if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.portal['sensor_drone'] && global.tech['science'] >= 14){
                sci *= 1 + (p_on['sensor_drone'] * 0.02);
            }
            if (global.tech['science'] >= 21){
                sci *= 1.45;
            }
            if (global.race['high_pop']){
                sci = highPopAdjust(sci);
            }
            let gain = support_on['exotic_lab'] * workerScale(global.civic.colonist.workers,'colonist') * sci;
            caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('tech_exotic_bd')] = gain+'v';

            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                lCaps['scientist'] += jobScale(support_on['exotic_lab']);
            }
        }

        if (support_on['research_station']){
            let attact = global.blood['attract'] ? global.blood.attract * 5 : 0;
            let sci = 200 + attact;
            if (global.tech['science'] && global.tech.science >= 22 && p_on['embassy'] && p_on['symposium']){
                sci *= 1 + (p_on['symposium'] * piracy('gxy_gorddon'));
            }
            let gain = support_on['research_station'] * highPopAdjust(global.civic.ghost_trapper.workers) * sci;
            caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('eden_research_station_title')] = gain+'v';
        }

        if (global.tech['isolation'] && support_on['infectious_disease_lab']){
            lCaps['professor'] += jobScale(support_on['infectious_disease_lab'] * 2);
            lCaps['scientist'] += jobScale(support_on['infectious_disease_lab']);
        }

        if (global.race['warlord'] && p_on['twisted_lab']){
            lCaps['professor'] += jobScale(p_on['twisted_lab'] * 3);
            lCaps['scientist'] += jobScale(p_on['twisted_lab'] * 2);
        }

        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.prof){
            lCaps['scientist'] += jobScale(global.race.wishStats.prof);
        }

        if (support_on['decoder']){
            let titan_colonists = p_on['ai_colonist'] ? workerScale(global.civic.titan_colonist.workers,'titan_colonist') + jobScale(p_on['ai_colonist']) : workerScale(global.civic.titan_colonist.workers,'titan_colonist');
            let gain = support_on['decoder'] * titan_colonists * 2500;
            if (global.race['high_pop']){
                gain = highPopAdjust(gain);
            }
            if (p_on['ai_core2']){
                gain *= 1.25;
            }
            caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('space_decoder_title')] = gain+'v';
        }
        if (p_on['elerium_contain']){
            let el_gain = p_on['elerium_contain'] * spatialReasoning(100);
            caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('space_dwarf_elerium_contain_title')] = el_gain+'v';
        }
        if (p_on['elerium_containment']){
            let el_gain = p_on['elerium_containment'] * spatialReasoning(1000);
            caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('eden_elerium_containment',[global.resource.Elerium.name])] = el_gain+'v';
        }
        if (p_on['shadow_mine']){
            let el_gain = p_on['shadow_mine'] * spatialReasoning(200);
            caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('portal_shadow_mine_title')] = el_gain+'v';
        }
        if (p_on['corruptor']){
            let el_gain = p_on['corruptor'] * spatialReasoning(200);
            caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('eden_corruptor_title')] = el_gain+'v';
        }
        if (global.city['foundry']){
            lCaps['craftsman'] += jobScale(global.city['foundry'].count);
        }
        if (support_on['fabrication']){
            lCaps['craftsman'] += jobScale(support_on['fabrication']);
            if (global.race['cataclysm']){
                lCaps['cement_worker'] += jobScale(support_on['fabrication']);
            }
        }
        if (global.tech['isolation'] && support_on['tau_factory']){
            lCaps['craftsman'] += jobScale(support_on['tau_factory'] * 5);
            lCaps['cement_worker'] += jobScale(support_on['tau_factory'] * 2);
        }
        if (global.race['warlord'] && p_on['hell_factory']){
            lCaps['cement_worker'] += jobScale(p_on['hell_factory'] * 5);
        }
        if (p_on['womling_station']){
            lCaps['craftsman'] += jobScale(p_on['womling_station'] * 1);
            lCaps['cement_worker'] += jobScale(p_on['womling_station'] * 1);
        }
        if (p_on['stellar_forge']){
            lCaps['craftsman'] += jobScale(p_on['stellar_forge'] * 2);
        }
        if (p_on['demon_forge']){
            lCaps['craftsman'] += jobScale(p_on['demon_forge'] * actions.portal.prtl_wasteland.demon_forge.crafters());
        }
        if (global.tech['elysium'] && global.tech.elysium >= 18 && p_on['sacred_smelter']){
            lCaps['craftsman'] += jobScale(p_on['sacred_smelter'] * 3);
        }
        if (global.portal['carport']){
            lCaps['hell_surveyor'] += jobScale(global.portal.carport.count) - global.portal.carport.damaged;
        }
        if (p_on['archaeology']){
            lCaps['archaeologist'] += jobScale(p_on['archaeology'] * 2);
        }
        if (support_on['ectoplasm_processor']){
            lCaps['ghost_trapper'] += jobScale(support_on['ectoplasm_processor'] * 5);
        }
        if (p_on['elysanite_mine']){
            lCaps['elysium_miner'] += jobScale(p_on['elysanite_mine'] * 2);
        }
        if (p_on['nexus']){
            let helium_gain = p_on['nexus'] * spatialReasoning(4000);
            caps['Helium_3'] += helium_gain;
            breakdown.c.Helium_3[loc('interstellar_nexus_title')] = helium_gain+'v';

            let oil_gain = (p_on['nexus'] * spatialReasoning(3500));
            caps['Oil'] += oil_gain;
            breakdown.c.Oil[loc('interstellar_nexus_title')] = oil_gain+'v';

            let deuterium_gain = p_on['nexus'] * spatialReasoning(3000);
            caps['Deuterium'] += deuterium_gain;
            breakdown.c.Deuterium[loc('interstellar_nexus_title')] = deuterium_gain+'v';

            let elerium_gain = p_on['nexus'] * spatialReasoning(25);
            caps['Elerium'] += elerium_gain;
            breakdown.c.Elerium[loc('interstellar_nexus_title')] = elerium_gain+'v';
        }
        if (p_on['s_gate'] && global.galaxy['gateway_station']){
            let helium_gain = p_on['gateway_station'] * spatialReasoning(2000);
            caps['Helium_3'] += helium_gain;
            breakdown.c.Helium_3[loc('galaxy_gateway_station')] = helium_gain+'v';

            let deuterium_gain = p_on['gateway_station'] * spatialReasoning(4500);
            caps['Deuterium'] += deuterium_gain;
            breakdown.c.Deuterium[loc('galaxy_gateway_station')] = deuterium_gain+'v';

            let gain = p_on['gateway_station'] * spatialReasoning(50);
            caps['Elerium'] += gain;
            breakdown.c.Elerium[loc('galaxy_gateway_station')] = gain+'v';
        }
        if (p_on['s_gate'] && p_on['telemetry_beacon']){
            let base_val = global.tech['telemetry'] ? 1200 : 800;
            if (global.tech.science >= 17){
                base_val += gal_on['scout_ship'] * 25;
            }
            let gain = p_on['telemetry_beacon'] ** 2 * base_val;
            caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('galaxy_telemetry_beacon_bd')] = gain+'v';
        }
        if (p_on['s_gate'] && gal_on['scavenger']){
            let gain = gal_on['scavenger'] * Math.round(pirate_alien2 * 25000);
            caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('galaxy_scavenger')] = gain+'v';
        }

        if (global.eden['encampment']){
            let powder = global.eden.encampment.count * spatialReasoning(250);
            caps['Asphodel_Powder'] += powder;
            breakdown.c.Asphodel_Powder[loc('eden_encampment_title')] = powder+'v';
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
            if (global.race['flier']){
                routes += traits.flier.vars()[1];
            }
            global.city.market.mtrade += routes * global.city.trade.count;
            breakdown.t_route[loc('city_trade')] = routes * global.city.trade.count;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 3){
                let r_count = faithTempleCount();
                global.city.market.mtrade += r_count;
                breakdown.t_route[global.race['cataclysm'] ? loc('space_red_ziggurat_title') : structName('temple')] = r_count;
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
        if (global.portal['bazaar'] && global.portal['spire']){
            let r_count = global.portal.bazaar.count * global.portal.spire.count;
            global.city.market.mtrade += r_count;
            breakdown.t_route[loc('portal_bazaar_title')] = r_count;
        }
        if (global.tech['railway']){
            let routes = 0;
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                routes = global.space['gps'] ? Math.floor(global.space.gps.count / 3) : 0;
            }
            else if (global.race['warlord']){
                routes = 5;
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
            breakdown.c.Water[loc('space_red_spaceport_title')] = water+'v';
        }

        if (global.tauceti['mining_pit']){
            lCaps['pit_miner'] += jobScale(support_on['mining_pit'] * (global.tech['isolation'] ? 6 : 8));
            caps['Materials'] += support_on['mining_pit'] * 1000000;
        }

        if (global.civic.torturer.display && global.tech['unfathomable'] && global.tech.unfathomable >= 2){
            lCaps['torturer'] = global.city.captive_housing.count;
        }

        if (global.race['universe'] === 'magic' && global.race['witch_hunter']){
            let sus = 0;

            if (global.city['wardenclyffe']){
                let wiz = global.city.wardenclyffe.count;
                wiz += p_on['wardenclyffe'];

                if (global.tech['roguemagic'] && global.tech.roguemagic >= 6){
                    wiz /= 2;
                }

                breakdown.c.Sus[wardenLabel()] = wiz+'v';
                sus += wiz;
            }

            if (global.civic.scientist.workers > 0){
                let wiz = global.civic.scientist.workers;
                if (global.civic.govern.type === 'magocracy'){
                    wiz /= 2;
                }
                wiz = highPopAdjust(wiz);
                breakdown.c.Sus[jobName('wizard')] = wiz+'v';
                sus += wiz;
            }

            if (global.city['coal_power'] && !global.race['environmentalist']){
                let mana_engine = p_on['coal_power'];

                if (global.tech['roguemagic'] && global.tech.roguemagic >= 6){
                    mana_engine /= 2;
                }

                breakdown.c.Sus[loc('city_mana_engine')] = mana_engine+'v';
                sus += mana_engine;
            }

            if (global.city['pylon'] || global.space['pylon'] || global.tauceti['pylon']){
                let p_count = 0;
                let name = 'city_pylon';
                if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.space['pylon']){
                    p_count = global.space.pylon.count;
                    name = 'space_red_pylon';
                }
                else if (global.tech['isolation'] && global.tauceti['pylon']){
                    p_count = global.tauceti.pylon.count;
                    name = 'tau_home_pylon';
                }
                else if (global.city['pylon']){
                    p_count = global.city.pylon.count;
                }

                if (global.tech['roguemagic'] && global.tech.roguemagic >= 5){
                    p_count /= 3;
                }

                breakdown.c.Sus[loc(name)] = p_count+'v';
                sus += p_count;
            }

            if (global.race['casting']){
                let ritual = global.race.casting.total;
                if (global.tech['roguemagic'] && global.tech.roguemagic >= 2){
                    if (global.tech.roguemagic >= 4){
                        ritual /= 4;
                    }

                    ritual -= highPopAdjust(global.civic.priest.workers);
                    if (ritual < 0){
                        ritual = 0;
                    }
                }
                breakdown.c.Sus[loc('tech_rituals')] = ritual+'v';
                sus += ritual;
            }

            if (global.race['totTransmute'] && global.race.totTransmute > 0){
                let transmute = global.race.totTransmute / 5;
                breakdown.c.Sus[loc('tech_alchemy')] = transmute+'v';
                sus += transmute;
            }

            let mtech = 0;
            if (global.tech['explosives']){
                mtech += 4;
            }
            if (global.tech['military']){
                if (global.tech.military >= 10){
                    mtech += 28;
                }
                else if (global.tech.military >= 9){
                    mtech += 24;
                }
                else if (global.tech.military >= 8){
                    mtech += 20;
                }
                else if (global.tech.military >= 7){
                    mtech += 16;
                }
                else if (global.tech.military >= 6){
                    mtech += 12;
                }
                else if (global.tech.military >= 4){
                    mtech += 8;
                }
                else if (global.tech.military >= 3){
                    mtech += 4;
                }
            }
            breakdown.c.Sus[loc('witch_hunter_magic_tech')] = mtech+'v';
            sus += mtech;

            if (!global.tech['roguemagic']){
                breakdown.c.Sus[loc('overt')] = (sus*5-sus)+'v';
                sus *= 5;
            }

            if (global.tech['nexus']){
                let nexus = global.tech['nexus'] * 0.15;
                breakdown.c.Sus[loc('arpa_projects_nexus_title')] = nexus+'v';
                sus += nexus;
            }

            if (global.tech['syphon']){
                let syphon = global.tech['syphon'] * 2.5;
                breakdown.c.Sus[loc('arpa_syphon_title')] = syphon+'v';
                sus += syphon;
            }

            if (global.portal.hasOwnProperty('soul_capacitor')){
                let capacitors = p_on['soul_capacitor'] || 0;
                global.portal.soul_capacitor['ecap'] = 2500000 * capacitors;
                breakdown.c.Sus[loc('portal_soul_capacitor_title')] = (capacitors / 3)+'v';
                sus += capacitors / 3;
            }

            if (global.tech['roguemagic'] && global.tech.roguemagic >= 3 && global.city['conceal_ward']){
                let wards = global.city.conceal_ward.count;
                if (global.tech.roguemagic >= 8){
                    wards *= 1.25;
                }
                breakdown.c.Sus[loc('city_conceal_ward')] = -(wards)+'v';
                sus -= wards;
            }

            if (sus < 0){ sus = 0; }
            sus = Math.floor(sus);
            global.resource.Sus.amount = sus;

            if (sus >= 50 && !global.race['witch_hunter_warned']){
                global.race['witch_hunter_warned'] = 1;
                messageQueue(loc('witch_hunter_warning'),'danger',false,['progress']);
            }
            else if (sus >= 80 && global.race['witch_hunter_warned'] && global.race.witch_hunter_warned === 1){
                global.race.witch_hunter_warned = 2;
                messageQueue(loc('witch_hunter_warning2'),'danger',false,['progress']);
            }

            if (sus >= 100){
                global.civic.foreign.gov0.hstl = 100;
                global.civic.foreign.gov1.hstl = 100;
                global.civic.foreign.gov2.hstl = 100;
                if (global.race['truepath']){
                    global.civic.foreign.gov3.hstl = 100;
                }
            }
        }

        breakdown['gt_route'] = {};
        if (global.galaxy['freighter']){
            breakdown.gt_route[loc('galaxy_freighter')] = gal_on['freighter'] * 2;
        }
        if (global.galaxy['super_freighter']){
            breakdown.gt_route[loc('galaxy_super_freighter')] = gal_on['super_freighter'] * 5;
        }
        if (global.galaxy['bolognium_ship']){
            lCaps['crew'] += global.galaxy.bolognium_ship.on * actions.galaxy.gxy_gateway.bolognium_ship.ship.civ();
        }
        if (global.galaxy['scout_ship']){
            lCaps['crew'] += global.galaxy.scout_ship.on * actions.galaxy.gxy_gateway.scout_ship.ship.civ();
        }
        if (global.galaxy['corvette_ship']){
            lCaps['crew'] += global.galaxy.corvette_ship.on * actions.galaxy.gxy_gateway.corvette_ship.ship.civ();
        }
        if (global.galaxy['frigate_ship']){
            lCaps['crew'] += global.galaxy.frigate_ship.on * actions.galaxy.gxy_gateway.frigate_ship.ship.civ();
        }
        if (global.galaxy['cruiser_ship']){
            lCaps['crew'] += global.galaxy.cruiser_ship.on * actions.galaxy.gxy_gateway.cruiser_ship.ship.civ();
        }
        if (global.galaxy['dreadnought']){
            lCaps['crew'] += global.galaxy.dreadnought.on * actions.galaxy.gxy_gateway.dreadnought.ship.civ();
        }
        if (global.galaxy['freighter']){
            lCaps['crew'] += global.galaxy.freighter.on * actions.galaxy.gxy_gorddon.freighter.ship.civ();
        }
        if (global.galaxy['super_freighter']){
            lCaps['crew'] += global.galaxy.super_freighter.on * actions.galaxy.gxy_alien1.super_freighter.ship.civ();
        }
        if (global.galaxy['armed_miner']){
            lCaps['crew'] += global.galaxy.armed_miner.on * actions.galaxy.gxy_alien2.armed_miner.ship.civ();
        }
        if (global.galaxy['scavenger']){
            lCaps['crew'] += global.galaxy.scavenger.on * actions.galaxy.gxy_alien2.scavenger.ship.civ();
        }
        if (global.portal['transport']){
            lCaps['crew'] += global.portal.transport.on * actions.portal.prtl_lake.transport.ship.civ();
        }

        if (global.tauceti['infectious_disease_lab']){
            let gain = 39616;
            if (global.tech['supercollider'] && global.tech['isolation']){
                let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 12.5: 25;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            caps['Knowledge'] += (p_on['infectious_disease_lab'] * Math.round(gain));
            breakdown.c.Knowledge[actions.tauceti.tau_home.infectious_disease_lab.title()] = (p_on['infectious_disease_lab'] * gain)+'v';

            if (global.tech['isolation']){
                let el_gain = support_on['infectious_disease_lab'] * spatialReasoning(375);
                caps['Elerium'] += el_gain;
                breakdown.c.Elerium[actions.tauceti.tau_home.infectious_disease_lab.title()] = el_gain+'v';
            }
        }

        // Womlings
        if (global.race['truepath'] && global.tauceti['overseer'] && global.tech['tau_red'] && global.tech.tau_red >= 5){
            let pop = 0; let injured = global.tauceti.overseer.injured; let morale = 0; let loyal = 0; let prod = 0;

            if (global.race['womling_friend']){
                loyal += 25 + (support_on['overseer'] * actions.tauceti.tau_red.overseer.val());
                morale += 75 + (support_on['womling_fun'] * actions.tauceti.tau_red.womling_fun.val());
            }
            else if (global.race['womling_god']){
                loyal += 75 + (support_on['overseer'] * actions.tauceti.tau_red.overseer.val());
                morale += 40 + (support_on['womling_fun'] * actions.tauceti.tau_red.womling_fun.val());
            }
            else if (global.race['womling_lord']){
                loyal += support_on['overseer'] * actions.tauceti.tau_red.overseer.val();
                morale += 30 + (support_on['womling_fun'] * actions.tauceti.tau_red.womling_fun.val());
            }

            let vil_pop = global.tech['womling_pop'] && global.tech.womling_pop >= 2 ? 6 : 5;
            pop = support_on['womling_village'] * vil_pop;
            let farmers = support_on['womling_farm'] * 2;
            if (farmers > pop){ farmers = pop; }
            let crop_per_farmer = global.tech['womling_pop'] ? 8 : 6;
            if (global.tech['womling_gene']){ crop_per_farmer += 2; }
            if (pop > farmers * crop_per_farmer){
                pop = farmers * crop_per_farmer;
            }
            let unemployed = pop - farmers - injured;

            let scientist = 0;
            if (support_on['womling_lab']){
                scientist = support_on['womling_lab'];
                if (scientist > unemployed){ scientist = unemployed; }
                unemployed -= scientist;

                let gain = scientist * Math.round(25000 * global.tauceti.overseer.prod / 100);
                caps['Knowledge'] += gain;
                breakdown.c.Knowledge[loc('interstellar_laboratory_title')] = gain+'v';

                if (Math.rand(0,10) < global.tauceti.womling_lab.scientist){
                    global.tauceti.womling_lab.tech += Math.rand(0,global.tauceti.womling_lab.scientist + 1);
                    let expo = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 4.9 : 5;
                    if (global.race['lone_survivor']){ expo -= 0.1; }
                    if (global.tauceti.womling_lab.tech >= Math.round((global.tech.womling_tech + 2) ** expo)){
                        global.tech.womling_tech++;
                        global.tauceti.womling_lab.tech = 0;
                        messageQueue(loc('tau_red_womling_advancement',[global.tech.womling_tech]),'advanced',false,['progress']);
                        drawTech();
                    }
                }
            }

            let miners = support_on['womling_mine'] * 6;
            if (miners > unemployed){ miners = unemployed; }
            unemployed -= miners;

            let heal_chance = global.tech['tech_womling_firstaid'] ? 3 : 4;
            if (Math.rand(0,10) === 0){
                let raw = Math.rand(0,miners + scientist);
                if (raw > injured){
                    injured = raw;
                }
            }
            else if (injured > 0 && Math.rand(0,heal_chance) === 0){
                injured--;
            }

            if (global.tauceti.hasOwnProperty('womling_farm')){
                global.tauceti.womling_farm.farmers = farmers;
            }
            if (global.tauceti.hasOwnProperty('womling_mine')){
                global.tauceti.womling_mine.miners = miners;
            }
            if (global.tauceti.hasOwnProperty('womling_lab')){
                global.tauceti.womling_lab.scientist = scientist;
            }

            loyal -= miners;
            morale -= miners;
            morale -= farmers;
            morale -= injured;
            if (loyal > 100){ loyal = 100; }
            else if (loyal < 0){ loyal = 0; }
            if (morale > 100){ morale = 100; }
            else if (morale < 0){ morale = 0; }

            prod = Math.round((loyal + morale) / 2);
            global.tauceti.overseer.loyal = loyal;
            global.tauceti.overseer.morale = morale;
            global.tauceti.overseer.pop = pop;
            global.tauceti.overseer.working = farmers + miners + scientist;
            global.tauceti.overseer.injured = injured;
            global.tauceti.overseer.prod = prod;
        }

        ['inspired','distracted','stimulated','motivated'].forEach(function(t){
            if (global.race[t]){
                global.race[t]--;
                if (global.race[t] <= 0){
                    delete global.race[t];
                }
            }
        });

        let pop_loss = global.resource[global.race.species].amount - caps[global.race.species];
        if (pop_loss > 0){
            if (global.race['orbit_decayed'] && global.stats.days === global.race['orbit_decay']){
                messageQueue(loc('tragic_death',[pop_loss]),'danger');
            }
            else {
                messageQueue(loc(pop_loss === 1 ? 'abandon1' : 'abandon2',[pop_loss]),'danger');
                global.civic.homeless += pop_loss;
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
            breakdown.c.Knowledge[loc('space_dwarf_collider_title')] = gain+'v';
        }

        if (p_on['alien_outpost']){
            let iso = 0;
            if (global.tech['isolation']){
                iso = global.race['lone_survivor'] ? 3500000 : 6500000;
                caps['Knowledge'] += iso;
            }
            let boost = 0.2;
            let gain = Math.round(caps['Knowledge'] * boost);
            caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('tech_alien_outpost')] = gain+iso+'v';
        }

        if (global.eden['fortress'] && global.tech.hasOwnProperty('celestial_warfare')){
            let warefare_bonus = global.tech.celestial_warfare * 10;
            if (warefare_bonus > 30){ warefare_bonus = 30; }
            global.eden.fortress.detector = 100 - warefare_bonus;
            if (support_on['bunker'] && global.tech.celestial_warfare >= 4){
                global.eden.fortress.detector -= support_on['bunker'] * 3;
                if (global.eden.fortress.detector < 0){ global.eden.fortress.detector = 0; }
            }
        }

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

        breakdown.c.Crates[loc('crates_used')] = (caps['Crates'] - tempCrates) + 'v';
        breakdown.c.Containers[loc('crates_used')] = (caps['Containers'] - tempContainers) + 'v';

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
            if (global.resource[res].amount > global.resource[res].max && res != 'Sus'){
                global.resource[res].amount = global.resource[res].max;
            }
            else if (global.resource[res].amount < 0){
                //global.resource[res].amount = 0;
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

        let unlock_servants = false;
        let total_servants = 0;
        let not_scavanger_jobs_avail = 0;
        Object.keys(lCaps).forEach(function (job){
            if (global.civic[job].max === -1 && global.civic[job].display && job !== 'unemployed' && job !== 'scavenger'){
                not_scavanger_jobs_avail++;
            }
        });

        // Limit craftsmen for resources that require specific structs. Combined craftsman worker limits are done below.
        ['Scarletite','Quantium'].forEach(function (res){
            limitCraftsmen(res);
        });

        Object.keys(lCaps).forEach(function (job){
            global.civic[job].max = lCaps[job];
            if (global.civic[job].workers > global.civic[job].max && global.civic[job].max !== -1){
                global.civic[job].workers = global.civic[job].max;
            }
            else if (!global.civic[job].display || global.civic[job].workers < 0){
                global.civic[job].workers = 0;
            }

            if (global.race['servants']){
                if (global.civic[job].max === -1 && !global.race.servants.jobs.hasOwnProperty(job)){
                    global.race.servants.jobs[job] = 0;
                    unlock_servants = true;
                }
                if (global.race.servants.jobs.hasOwnProperty(job)){
                    if (!global.civic[job].display && (job !== 'scavenger' || not_scavanger_jobs_avail > 0)){
                        global.race.servants.jobs[job] = 0;
                    }
                    else {
                        total_servants += global.race.servants.jobs[job];
                    }
                    if (total_servants > global.race.servants.max && global.race.servants.jobs[job] > 0){
                        global.race.servants.jobs[job]--;
                        total_servants--;
                    }
                }
            }
        });
        if (unlock_servants){
            loadServants();
        }
        else if (global.race['servants']){
            global.race.servants['force_scavenger'] = not_scavanger_jobs_avail === 0 ? true : false;
            global.race.servants.used = total_servants;
        }

        if (global.race['servants'] && global.race.servants.hasOwnProperty('smax') && global.race.servants.smax > 0){
            let used = 0;
            Object.keys(global.race.servants.sjobs).forEach(function(res){
                if (!global.resource[res].display){
                    global.race.servants.sjobs[res] = 0;
                }
                used += global.race.servants.sjobs[res];
                if (used > global.race.servants.smax){
                    global.race.servants.sjobs[res] -= used - global.race.servants.smax;
                }
                if (global.race.servants.sjobs[res] < 0){
                    global.race.servants.sjobs[res] = 0;
                }
            });
            global.race.servants.sused = used;
        }

        if (global.race['gravity_well']){
            let teamster = 0;

            [
                'hunter',
                'forager',
                'farmer',
                'lumberjack',
                'quarry_worker',
                'crystal_miner',
                'scavenger',
                'miner',
                'coal_miner',
                'craftsman',
                'cement_worker',
                'space_miner',
                'hell_surveyor',
                'pit_miner',
            ].forEach(function (job){
                teamster += global.civic[job].workers;
                if (global.race['servants'] && global.race.servants.jobs[job]){
                    teamster += global.race.servants.jobs[job];
                }
            });

            if (global.city['oil_well']){
                teamster += global.city.oil_well.count * (global.tech['teamster'] && global.tech.teamster >= 3 ? 0 : 2);
            }

            if (global.city['factory'] && p_on['factory']){
                teamster += p_on['factory'] * 2;
            }

            if (global.space['red_factory'] && p_on['red_factory']){
                teamster += p_on['red_factory'] * 2;
            }

            if (global.space['moon_base'] && support_on['iridium_mine']){
                teamster += support_on['iridium_mine'] * 2;
            }

            if (global.space['moon_base'] && support_on['helium_mine']){
                teamster += support_on['helium_mine'];
            }

            if (global.tech['mars'] && support_on['red_mine']){
                teamster += support_on['red_mine'] * 3;
            }

            if (p_on['outpost']){
                teamster += p_on['outpost'] * 3;
            }

            if (global.race['servants'] && global.race.servants.hasOwnProperty('smax') && global.race.servants.smax > 0){
                teamster += global.race.servants.sused;
            }

            global.race['teamster'] = teamster;
        }

        if (global.civic.space_miner.display && global.space['space_station']){
            global.space.space_station.s_max = workerScale(global.civic.space_miner.workers,'space_miner');
        }

        if (global.portal.hasOwnProperty('transport')){
            let max = 0;
            if (gal_on['transport']){
                max = gal_on['transport'] * (global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 4 ? 8 : 5);
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
        let spyCatchMod = global.race['blurry'] ? 2 : 0;
        let yetiFathom = fathomCheck('yeti');
        if (yetiFathom >= 0.25){
            spyCatchMod += yetiFathom >= 0.5 ? 2 : 1;
        }
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
                            if (Math.floor(seededRandom(0,4 + spyCatchMod)) === 0){
                                spyCaught(i);
                            }
                            else {
                                let covert = Math.floor(seededRandom(global.tech['spy'] >= 5 ? 2 : 1, global.tech['spy'] >= 5 ? 8 : 6));
                                if (astroSign === 'scorpio'){
                                    covert += astroVal('scorpio')[1];
                                }
                                global.civic.foreign[`gov${i}`].hstl -= covert;
                                if (global.civic.foreign[`gov${i}`].hstl < 0){
                                    global.civic.foreign[`gov${i}`].hstl = 0;
                                }
                                messageQueue(loc('civics_spy_influence_success',[govTitle(i),covert]),'success',false,['spy']);
                            }
                            break;
                        case 'sabotage':
                            if (Math.floor(seededRandom(0,3 + spyCatchMod)) === 0){
                                spyCaught(i);
                            }
                            else {
                                let covert = Math.floor(seededRandom(global.tech['spy'] >= 5 ? 2 : 1, global.tech['spy'] >= 5 ? 8 : 6));
                                if (astroSign === 'scorpio'){
                                    covert += astroVal('scorpio')[1];
                                }
                                global.civic.foreign[`gov${i}`].mil -= covert;
                                if (global.civic.foreign[`gov${i}`].mil < 50){
                                    global.civic.foreign[`gov${i}`].mil = 50;
                                }
                                messageQueue(loc('civics_spy_sabotage_success',[govTitle(i),covert]),'success',false,['spy']);
                            }
                            break;
                        case 'incite':
                            if (Math.floor(seededRandom(0,2 + Math.floor(spyCatchMod / 2))) === 0){
                                spyCaught(i);
                            }
                            else {
                                let covert = Math.floor(seededRandom(global.tech['spy'] >= 5 ? 2 : 1, global.tech['spy'] >= 5 ? 8 : 6));
                                if (astroSign === 'scorpio'){
                                    covert += astroVal('scorpio')[1];
                                }
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
            // Check both ships and regions in reverse order to prioritize bigger ships and later systems above smaller ships and earlier systems
            for (let i = gatewayArmada.length - 1; i >= 0; i--){
                let ship = gatewayArmada[i];
                let count = 0;
                for (let j = galaxyRegions.length - 1; j >= 0; j--){
                    let region = galaxyRegions[j];
                    if (global.galaxy.defense.hasOwnProperty(region)){
                        count += global.galaxy.defense[region][ship];
                        if (isNaN(global.galaxy.defense[region][ship])){
                            global.galaxy.defense[region][ship] = 0;
                        }
                        if (count > gal_on[ship]){
                            let overflow = count - gal_on[ship];
                            global.galaxy.defense[region][ship] -= overflow;
                        }
                        if (global.galaxy.defense[region][ship] < 0){
                            global.galaxy.defense[region][ship] = 0;
                        }
                    }
                }
                if (count < gal_on[ship]){
                    let underflow = gal_on[ship] - count;
                    global.galaxy.defense.gxy_gateway[ship] += underflow;
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
                if (element.length > 0){
                    if (checkAffordable(c_action,true)){
                        if (element.hasClass('cnam')){
                            element.removeClass('cnam');
                        }
                        if (checkAffordable(c_action)){
                            if (element.hasClass('cna')){
                                element.removeClass('cna');
                            }
                        }
                        else if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                    else {
                        if (!element.hasClass('cnam')){
                            element.addClass('cnam');
                        }
                        if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
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
                    if (checkAffordable(c_action,true)){
                        if (element.hasClass('cnam')){
                            element.removeClass('cnam');
                        }
                        if (checkAffordable(c_action)){
                            if (element.hasClass('cna')){
                                element.removeClass('cna');
                            }
                        }
                        else if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                    else {
                        if (!element.hasClass('cnam')){
                            element.addClass('cnam');
                        }
                        if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                }
            }
        });

        let spc_locations = ['space','interstellar','galaxy','portal','tauceti','eden'];
        for (let i=0; i<spc_locations.length; i++){
            let location = spc_locations[i];
            Object.keys(actions[location]).forEach(function (region){
                Object.keys(actions[location][region]).forEach(function (action){
                    let s_region = actions[location][region][action] && actions[location][region][action].hasOwnProperty('region') ? actions[location][region][action].region : location;
                    if ((global[s_region][action] || actions[location][region][action].grant) && actions[location][region][action] && actions[location][region][action].cost){
                        let c_action = actions[location][region][action];
                        let element = $('#'+c_action.id);
                        if (element.length > 0){
                            if (checkAffordable(c_action,true)){
                                if (element.hasClass('cnam')){
                                    element.removeClass('cnam');
                                }
                                if (checkAffordable(c_action)){
                                    if (element.hasClass('cna')){
                                        element.removeClass('cna');
                                    }
                                }
                                else if (!element.hasClass('cna')){
                                    element.addClass('cna');
                                }
                            }
                            else {
                                if (!element.hasClass('cnam')){
                                    element.addClass('cnam');
                                }
                                if (!element.hasClass('cna')){
                                    element.addClass('cna');
                                }
                            }
                        }
                        if (global[s_region][action]){
                            global[s_region][action]['time'] = timeFormat(timeCheck(c_action));
                        }
                    }
                });
            });
        }

        if (global.space['swarm_control']){
            global.space.swarm_control.s_max = global.space.swarm_control.count * actions.space.spc_sun.swarm_control.support();
        }

        if (global.arpa['sequence'] && global.arpa.sequence.on && gene_sequence){
            let labs = sequenceLabs();
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
                        global.prestige.AntiPlasmid.count += plasma;
                        unlockAchieve('cross');
                    }
                    else {
                        plasmid_type = loc('resource_Plasmid' + plasmid_type + '_name');
                        global.stats.plasmid += plasma;
                        global.prestige.Plasmid.count += plasma;
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
            drawTech();
        }

        if (global.race['kindling_kindred'] || global.race['smoldering']){
            global.civic.lumberjack.workers = 0;
            global.civic.lumberjack.assigned = 0;
            global.resource.Lumber.crates = 0;
            global.resource.Lumber.containers = 0;
            global.resource.Lumber.trade = 0;
        }
        if ((global.race['kindling_kindred'] || global.race['smoldering']) && global.city['foundry'] && global.city.foundry['Plywood']){
            global.city.foundry['Plywood'] = 0;
        }

        if (eventActive('fool',2023) && !global.race['hooved']){
            global.resource.Horseshoe.display = true;
        }
        else if (!global.race['hooved']){
            global.resource.Horseshoe.display = false;
        }

        set_qlevel(calcQuantumLevel(false));

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
                initStruct(actions.space.spc_gas_moon.oil_extractor);
                global.tech['gas_moon'] = 2;
                messageQueue(loc('discover_oil',[planetName().gas_moon]),'info',false,['progress']);
                renderSpace();
            }
        }

        if (global.portal.hasOwnProperty('mechbay') && global.tech['hell_spire'] && global.tech.hell_spire >= 9){
            if (!global.portal.spire['boss']){
                genSpireFloor();
            }
            updateMechbay();

            if (global.portal.hasOwnProperty('spire') && global.portal.spire.count >= 50 && !global.tech['edenic'] && Object.keys(global.pillars).length >= 10){
                messageQueue(loc('eden_purify_well_msg',[50]),'info',false,['progress']);
                global.tech['edenic'] = 1;
                drawTech();
            }

            let progress = 0;
            let mechSkips = global.eden['mech_station'] ? global.eden.mech_station.mechs : 0;
            for (let i = 0; i < global.portal.mechbay.active; i++) {
                let mech = global.portal.mechbay.mechs[i];
                if (mechSkips > 0 && mech.size !== 'collector'){
                    mechSkips--;
                }
                else {
                    if (global.portal.hasOwnProperty('waygate') && global.tech.hasOwnProperty('waygate') && global.portal.waygate.on === 1 && global.tech.waygate >= 2 && global.portal.waygate.progress < 100){
                        progress += mechRating(mech,true);
                    }
                    else {
                        progress += mechRating(mech,false);
                    }
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
                let rank = Number(alevel());
                let stones = rank;
                if (global.genes['blood'] && global.genes['blood'] >= 2){
                    stones *= 2;
                }
                global.prestige.Blood_Stone.count += stones;
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
                if (global.portal.spire.count > 10 && global.tech['hell_spire'] && global.tech.hell_spire < 10){
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

                if ((global.portal.spire.boss === 'djinni' && global.race.species === 'djinn') || global.portal.spire.boss === global.race.species){
                    unlockAchieve('doppelganger');
                }

                genSpireFloor();
                renderFortress();
            }
        }
        
        if(global.race['fasting'] && global.portal['oven_complete']){
            let progress = 0;
            if(p_on['oven_complete']){
                progress = 0.00025;
                if(global.portal['dish_life_infuser'] && global.portal['dish_life_infuser'].on){
                    let hunger = 0.5;
                    if (global.race['angry']){
                        hunger -= traits.angry.vars()[0] / 100;
                    }
                    if (global.race['malnutrition']){
                        hunger += traits.malnutrition.vars()[0] / 100;
                    }
                    let working = Math.min(global.portal['dish_life_infuser'].on, Math.floor(hunger / 0.02));
                    progress *= 1 + (0.15 * working);
                }
                if(global.portal['dish_soul_steeper'] && global.portal['dish_soul_steeper'].on && global.portal['spire']){
                    progress *= 1 + (0.05 * global.portal['spire'].count * global.portal['dish_soul_steeper'].on);
                }
                global.portal['devilish_dish'].done += progress;
                global.portal['devilish_dish'].done = Math.min(global.portal['devilish_dish'].done, 100);
                global.portal['devilish_dish'].count = Math.floor(global.portal['devilish_dish'].done);
                if(global.portal['devilish_dish'].done >= 0.05 && global.tech['dish'] === 3){
                    messageQueue(loc('dish_progress'),'info',false,['progress']);
                    global.tech['dish'] = 4;
                    drawTech();
                }
            }
            global.portal['devilish_dish'].time = progress === 0 ? timeFormat(-1) : timeFormat((100 - global.portal['devilish_dish'].done) / progress);
        }

        if (global.tech['asphodel'] && global.tech.asphodel === 4 && Math.rand(0,25) === 0){
            global.tech['asphodel'] = 5;
            drawTech();
            messageQueue(loc('eden_asphodel_hostile'),'info',false,['progress']);
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
            let time = 0; let untime = 0;
            let spent = { t: {t:0,rt:0}, r: {}, rr: {}, id: {}};
            for (let i=0; i<global.r_queue.queue.length; i++){
                let struct = global.r_queue.queue[i];
                let t_action = actions[struct.action][struct.type];
                time = global.settings.qAny_res ? 0 : time;
                untime = global.settings.qAny_res ? 0 : untime;

                if (t_action['grant'] && global.tech[t_action.grant[0]] && global.tech[t_action.grant[0]] >= t_action.grant[1]){
                    global.r_queue.queue.splice(i,1);
                    clearPopper(`rq${c_action.id}`);
                    break;
                }
                else {
                    if (checkAffordable(t_action,true)){
                        global.r_queue.queue[i].cna = false;
                        let reqMet = checkTechRequirements(struct.type,false);
                        let t_time = global.settings.qAny_res ? timeCheck(t_action) : timeCheck(t_action, spent, false, reqMet);
                        if (t_time >= 0){
                            if (!stop && checkAffordable(t_action) && reqMet){
                                c_action = t_action;
                                idx = i;
                                if (global.settings.qAny_res){
                                    stop = true;
                                }
                            }
                            else {
                                if (reqMet){
                                    time += t_time;
                                }
                                untime += t_time;
                            }
                            if (!global.settings.qAny_res && reqMet){
                                stop = true;
                            }
                            global.r_queue.queue[i]['time'] = reqMet ? time : untime;
                        }
                        else {
                            global.r_queue.queue[i]['time'] = t_time;
                        }
                        global.r_queue.queue[i]['req'] = reqMet ? true : false;
                    }
                    else {
                        global.r_queue.queue[i].cna = true;
                        global.r_queue.queue[i]['time'] = -1;
                    }
                }
                global.r_queue.queue[i].qa = global.settings.qAny_res ? true : false;
            }
            if (idx >= 0 && c_action && !global.r_queue.pause){
                if (c_action.action({isQueue: true})){
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

            let q_techs = {}; let remove = [];
            checkTechRequirements('club',q_techs);
            for (let i=0; i<global.r_queue.queue.length; i++){
                Object.keys(actions.tech[global.r_queue.queue[i].type].reqs).forEach(function(req){
                    if (skipRequirement(req, global.tech[req] || 0)){ return; }
                    if (
                        (!global.tech[req] || global.tech[req] < actions.tech[global.r_queue.queue[i].type].reqs[req])
                        &&
                        (!q_techs[req] || (q_techs[req] && q_techs[req].v < actions.tech[global.r_queue.queue[i].type].reqs[req]))
                        ){
                        remove.push(i);
                    }
                });
            }
            if (remove.length > 0){
                for (let i=remove.length - 1; i>=0; i--){
                    global.r_queue.queue.splice(remove[i],1);
                }
            }
        }

        if (global.arpa.sequence && global.arpa.sequence['auto'] && global.tech['genetics'] && global.tech['genetics'] >= 8){
            buildGene();
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
        let deepScan = ['space','interstellar','galaxy','portal','tauceti','eden'];
        let time = 0;
        let spent = { t: {t:0,rt:0}, r: {}, rr: {}, id: {}};
        let arpa = false;
        for (let i=0; i<global.queue.queue.length; i++){
            if (global.settings.qAny){
                spent = { t: {t:0,rt:0}, r: {}, rr: {}, id: {}};
                time = 0;
            }
            let struct = global.queue.queue[i];

            let t_action = false;
            if (struct.action === 'tp-ship'){
                let raw = shipCosts(struct.type);
                let costs = {};
                Object.keys(raw).forEach(function(res){
                    costs[res] = function(){ return raw[res]; }
                });
                t_action = { 
                    id: struct.id,
                    cost: costs,
                    type: 'tp-ship',
                    bp: struct.type,
                    doNotAdjustCost: true,
                };
            }
            else if (struct.action === 'hell-mech'){
                let costs = mechCost(struct.type.size,struct.type.infernal,true);
                t_action = { 
                    id: struct.id,
                    cost: costs,
                    type: 'hell-mech',
                    bp: struct.type,
                    doNotAdjustCost: true,
                };
            }
            else if (deepScan.includes(struct.action)){
                for (let region in actions[struct.action]) {
                    if (actions[struct.action][region][struct.type]){
                        t_action = actions[struct.action][region][struct.type];
                        break;
                    }
                }
            }
            else {
                t_action = actions[struct.action][struct.type];
            }

            if (struct.action === 'arpa'){
                let remain = (100 - global.arpa[struct.type].complete) / 100;
                let t_time = arpaTimeCheck(t_action, remain, spent);
                struct['bres'] = false;
                if (t_time >= 0){
                    time += t_time;
                    struct['time'] = time;
                    for (let j=1; j<struct.q; j++){
                        let tc = arpaTimeCheck(t_action, 1, spent, true);
                        time += tc.t;
                        struct['bres'] = tc.r;
                    }
                    struct['t_max'] = time;
                }
                else {
                    struct['time'] = -1;
                }

                if (arpaTimeCheck(t_action, 0.01) >= 0){
                    if (global.settings.qAny && !global.queue.pause && struct['time'] > 1){
                        buildArpa(struct.type,100,true);
                    }
                    else if (!stop){
                        c_action = t_action;
                        idx = i;
                        arpa = true;
                        stop = true;
                    }
                }
            }
            else {
                if (checkAffordable(t_action,true,t_action['doNotAdjustCost'] ? true : false,true)){
                    struct.cna = false;
                    let t_time = timeCheck(t_action, spent);
                    struct['bres'] = false;
                    if (t_time >= 0){
                        if (!stop && checkAffordable(t_action,false,t_action['doNotAdjustCost'] ? true : false)){
                            c_action = t_action;
                            idx = i;
                            arpa = false;
                            if (global.settings.qAny){
                                stop = true;
                            }
                        }
                        else {
                            time += t_time;
                        }
                        if (!global.settings.qAny){
                            stop = true;
                        }
                        struct['time'] = time;
                        let br = false;
                        for (let j=1; j<struct.q; j++){
                            let tc = timeCheck(t_action, spent, true);
                            time += tc.t;
                            br = tc.r;
                        }
                        struct['t_max'] = time;
                        struct['bres'] = br;
                    }
                    else {
                        struct['time'] = t_time;
                    }
                }
                else {
                    struct.cna = true;
                    struct['time'] = -1;
                }
            }
            struct.qa = global.settings.qAny ? true : false;
        }
        if (idx >= 0 && c_action && !global.queue.pause){
            let triggerd = false;
            if (arpa){
                let label = global.queue.queue[idx].label;
                if (buildArpa(global.queue.queue[idx].type,100,true,true)){
                    messageQueue(loc('build_success',[label]),'success',false,['queue','building_queue']);
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
            else if (c_action.hasOwnProperty('type') && c_action.type === 'tp-ship'){
                if (buildTPShipQueue(c_action)){
                    clearPopper(`q${c_action.id}${idx}`);
                    global.queue.queue.splice(idx,1);
                    buildQueue();
                }
            }
            else if (c_action.hasOwnProperty('type') && c_action.type === 'hell-mech'){
                if (buildMechQueue(c_action)){
                    clearPopper(`q${c_action.id}${idx}`);
                    global.queue.queue.splice(idx,1);
                    buildQueue();
                }
            }
            else {
                let attempts = global.queue.queue[idx].q;
                let struct = global.queue.queue[idx];
                let report_in = c_action['queue_complete'] ? c_action.queue_complete() : 1;
                for (let i=0; i<attempts; i++){
                    if (c_action.action({isQueue: true}) !== false){
                        triggerd = true;
                        if (report_in - i <= 1){
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
                    postBuild(c_action,struct.action,struct.type);
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

        if (global.settings.q_resize !== 'manual') {
            const buildQueueElement = $(`#buildQueue`).get(0);
            if (['auto', 'grow'].includes(global.settings.q_resize) &&
                buildQueueElement.scrollHeight > buildQueueElement.clientHeight
            ) {
                // The build queue has a scroll-bar.
                buildHeight += buildQueueElement.scrollHeight - buildQueueElement.clientHeight;
            } else if (['auto', 'shrink'].includes(global.settings.q_resize)) {
                let minHeight = rem;
                buildQueueElement.childNodes.forEach(function (e) {
                    minHeight += e.clientHeight || 0;
                });

                if (buildQueueElement.clientHeight > minHeight) {
                    // The build queue is larger than it needs to be.
                    buildHeight = Math.min(buildHeight, minHeight);
                }
            }
        }

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
    const astroSign = astrologySign();
    if (global.race.species !== 'protoplasm'){

        if (global.settings.tabLoad || (global.settings.civTabs === 2 && global.settings.govTabs === 2)){
            let grids = gridDefs();
            let updatePowerGrid = false;
            Object.keys(grids).forEach(function(grid){
                grids[grid].l.forEach(function(struct){
                    let parts = struct.split(":");
                    let space = convertSpaceSector(parts[0]);
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

        if (global.portal['fortress'] && !global.race['warlord']){
            bloodwar();
        }
        else if (global.race['warlord'] && global.portal['minions'] && global.portal.minions.count > 0){
            hellguard();
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

        if (global.city.ptrait.includes('trashed') || global.race['scavenger']){
            global.civic.scavenger.display = true;
        }
        else {
            global.civic.scavenger.display = false;
            global.civic.scavenger.workers = 0;
        }

        // Homeless
        if (global.civic.homeless > 0){
            let railway = global.arpa['railway'] ? global.arpa.railway.rank : 0;
            let abandon_odds = Math.floor(railway / (railway + 25) * 10);
            if (Math.rand(0,10) <= abandon_odds){
                global.civic.homeless--;
            }
        }

        if (global.race['unstable']){
            if (global.resource[global.race.species].amount > 0 && Math.rand(0,100) < traits.unstable.vars()[0]){
                let bound = Math.ceil((global.resource[global.race.species].amount ** 0.9) * traits.unstable.vars()[1] / 100);
                let died = Math.rand(0,bound);
                global.resource[global.race.species].amount -= died;
                if (global.resource[global.race.species].amount < 0){ global.resource[global.race.species].amount = 0; }
                global.stats.uDead += died;
            }
        }

        if (global.race['blubber'] && global.resource[global.race.species].amount >= 50){
            let oldAge = Math.rand(0,1 + Math.floor(global.resource[global.race.species].amount / 50));
            blubberFill(oldAge);
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

        if (global.race['pet']){
            if (global.race.pet.event > 0){
                global.race.pet.event--;
            }
            if (global.race.pet.pet > 0){
                global.race.pet.pet--;
            }
            else if (global.race.pet.pet < 0){
                global.race.pet.pet++;
            }
        }

        // Soldier Healing
        if (global.civic.garrison.wounded > 0){
            let healed = global.race['regenerative'] ? traits.regenerative.vars()[0] : 1;

            let hc = global.city['hospital'] ? global.city.hospital.count : 0;
            if (global.race['orbit_decayed'] && global.race['truepath']){
                hc = Math.min(support_on['operating_base'],p_on['operating_base']);
            }
            else if (global.race['artifical'] && global.city['boot_camp']){
                hc = global.city.boot_camp.count;
            }
            if (global.race['rejuvenated'] && global.stats.achieve['lamentis']){
                let bonus = global.stats.achieve.lamentis.l;
                if (bonus > 5){ bonus = 5; }
                hc += bonus;
            }
            if (astroSign === 'cancer'){
                hc += astroVal('cancer')[0];
                if (hc < 0){ hc = 0; }
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
            let mantisFathom = fathomCheck('mantis');
            if (mantisFathom > 0){
                hc >= 20 ? hc *= (1 + traits.cannibalize.vars(1)[0] / 100 * mantisFathom) : hc += Math.floor(traits.cannibalize.vars(1)[0] / 5 * mantisFathom);
            }
            if (global.race['high_pop']){
                hc *= traits.high_pop.vars()[2]
            }
            let painVal = govActive('nopain',0);
            if (painVal){
                hc *= 1 + (painVal / 100);
            }
            if(global.city.banquet && global.city.banquet.on && global.city.banquet.count >= 2){
                hc *= 1 + (global.city.banquet.strength ** 0.65) / 100;
            }
            let fathom = fathomCheck('troll');
            if (fathom > 0){
                hc += Math.round(20 * traits.regenerative.vars(1)[0] * fathom);
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
                if (Math.rand(0,max_bound) < hc){
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

        if (global.civic.garrison['m_use'] && global.civic.garrison.m_use > 0){
            let merc_bound = global.tech['mercs'] && global.tech['mercs'] >= 2 ? 3 : 4;
            let max_merc_roll = global.race['high_pop'] ? traits.high_pop.vars()[0] : 1;
            let num_restore = 0;
            for (let roll_num = 0; roll_num < max_merc_roll; roll_num++){
                if (Math.rand(0, merc_bound) === 0){
                    num_restore++;
                }
            }
            global.civic.garrison.m_use = Math.max(0, global.civic.garrison.m_use - num_restore);
        }

        if (global.race['rainbow_active'] && global.race['rainbow_active'] > 1){
            global.race['rainbow_active']--;
        }

        if (global.city.calendar.day > 0){
            // Time
            global.city.calendar.day++;
            global.stats.days++;
            if (global.city.calendar.day > orbitLength()){
                global.city.calendar.day = 1;
                global.city.calendar.year++;
            }

            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                global.city.calendar.season = -1;
            }
            else {
                let s_segments = global.city.ptrait.includes('elliptical') ? 6 : 4;
                let season_length = Math.round(orbitLength() / s_segments);
                let days = global.city.calendar.day;
                let season = 0;
                while (days > season_length){
                    days -= season_length;
                    season++;
                }
                if (global.city.ptrait.includes('elliptical')){
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
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
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
                    case 'swamp':
                        if (Math.rand(0,2) === 0 && sky > 0){
                            sky--;
                        }
                        break;
                    case 'tundra':
                    case 'taiga':
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
                    case 'ashland':
                        if (Math.rand(0,2) === 0){
                            if (sky < 1){
                                sky++;
                            }
                            else if (sky > 2){
                                sky--;
                            }
                        }
                    case 'volcanic':
                        if (global.city.calendar.season === 1){
                            temp = 2;
                        }
                        else if (Math.rand(0,2) === 0 && temp < 2 && !global.city.ptrait.includes('permafrost')){
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

                if (global.city.ptrait.includes('stormy') && wind > 0){
                    if (global.race['rejuvenated'] || Math.rand(0,2) === 0){
                        wind--;
                    }
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
                    if (global.race['darkness']){
                        if (Math.rand(0, 7 - traits.darkness.vars()[0]) === 0){
                            global.city.calendar.weather = 1;
                        }
                    }
                }
                if (temp === 0){ // Get colder
                    let new_temp = global.city.calendar.temp - 1;
                    if (new_temp < 0){
                        new_temp = 0;
                    }
                    if (global.city.calendar.season === 1 && new_temp === 0){
                        new_temp = 1;
                    }
                    if (new_temp === 0 && global.city.biome === 'hellscape' && !global.city.ptrait.includes('permafrost')){
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
            if (!global.race['orbit_decayed']){
                if (global.city.ptrait.includes('retrograde')){
                    global.city.calendar.moon--;
                    if (global.city.calendar.moon < 0){
                        global.city.calendar.moon = 27;
                    }
                }
                else {
                    global.city.calendar.moon++;
                    if (global.city.calendar.moon > 27){
                        global.city.calendar.moon = 0;
                    }
                }
            }

            setWeather();
        }

        if (!global.race['cataclysm'] && !global.race['orbit_decayed'] && !global.race['lone_survivor'] && !global.race['vax']){
            let deterioration = Math.floor(50000000 / (1 + global.race.mutation)) - global.stats.days;
            if (global.race.deterioration === 0 && deterioration < 40000000){
                global.race.deterioration = 1;
                let death_clock = Math.round(deterioration / orbitLength());
                messageQueue(loc('deterioration1',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 1 && deterioration < 20000000){
                global.race.deterioration = 2;
                let death_clock = Math.round(deterioration / orbitLength());
                messageQueue(loc('deterioration2',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 2 && deterioration < 5000000){
                global.race.deterioration = 3;
                let death_clock = Math.round(deterioration / orbitLength());
                messageQueue(loc('deterioration3',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 3 && deterioration < 1000000){
                global.race.deterioration = 4;
                let death_clock = Math.round(deterioration / orbitLength());
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

        if (global.settings['cLabels'] !== cLabels){
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

        if (global.race['wish'] && global.race['wishStats']){
            if (global.race.wishStats.minor > 0){
                global.race.wishStats.minor--;
            }
            if (global.race.wishStats.major > 0){
                global.race.wishStats.major--;
            }
            if (global.race.wishStats.bad > 0){
                global.race.wishStats.bad--;
            }
        }

        if (global.portal['archaeology'] && global.tech.hasOwnProperty('hell_ruins') && global.tech.hell_ruins >= 2 && !global.tech['hell_vault']){
            let sup = hellSupression('ruins');
            let value = 250000;
            if (global.race['high_pop']){
                value = highPopAdjust(value);
            }
            value = Math.round(value * sup.supress) * workerScale(global.civic.archaeologist.workers,'archaeologist') / 1000;

            if (Math.rand(0,10000) + 1 <= value){
                global.tech['hell_vault'] = 1;
                messageQueue(loc('portal_ruins_vault'),'info',false,['progress']);
                renderFortress();
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
                let tScan = 0;
                let tShip = false;
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
                        eScan += sensorRange(ship);
                    }
                    if (global.tech.hasOwnProperty('tauceti') && ship.location === 'tauceti' && ship.transit === 0){
                        tScan += sensorRange(ship);
                        tShip = ship.name;
                    }
                });
                if (global.tech.hasOwnProperty('eris_scan') && global.tech.hasOwnProperty('eris') && global.tech.eris === 1 && eScan > 50){
                    global.tech.eris_scan += eScan - 50;
                    if (global.tech.eris_scan >= 100){
                        global.tech.eris_scan = 100;
                        global.tech.eris = 2;
                        messageQueue(loc('space_eris_scan',[planetName().eris]),'info',false,['progress']);
                        renderSpace();
                    }
                }
                if (global.tech.hasOwnProperty('tauceti') && global.tech.tauceti >= 1 && tScan >= 1){
                    if (global.tech.tauceti === 1){
                        initStruct(actions.tauceti.tau_home.orbital_station);
                        initStruct(actions.tauceti.tau_red.orbital_platform);
                        global.tech.tauceti = 2;
                        global.settings.showTau = true;
                        global.settings.tau.home = true;
                        global.settings.tau.red = true;
                        global.settings.tau.gas = false;
                        global.settings.tau.roid = false;
                        messageQueue(loc('tau_scan',[tShip]),'info',false,['progress']);
                        renderTauCeti();
                    }
                }
                if (global.space.hasOwnProperty('position')){
                    Object.keys(spacePlanetStats).forEach(function(planet){
                        if (global.space.position.hasOwnProperty(planet)){
                            let orbit = spacePlanetStats[planet].orbit === -1 ? orbitLength() : spacePlanetStats[planet].orbit;
                            if (orbit === -2){
                                return;
                            }
                            else if (orbit === 0){
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

                if ($('#mapCanvas').length > 0) {
                    drawMap();
                }
            }

            if (global.tech['triton'] && global.tech.triton >= 3){
                tritonWar();
            }
            if (global.tech['eris'] && global.tech.eris >= 3){
                erisWar();
            }
        }

        if (!global.race['warlord'] && (global.stats.matrix > 0 || global.stats.retire > 0) && !global.race['servants'] && Math.rand(0,25) === 0){
            let womlings = Math.min(global.stats.matrix,100) + Math.min(global.stats.retire,100) + Math.min(global.stats.eden,100);
            let skilled = Math.min(Math.min(global.stats.matrix, global.stats.retire),100);
            skilled += global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 5 ? 2 : 0;
            if (global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5){
                universe_affixes.forEach(function(uni){
                    if (global.stats.achieve.overlord[uni] >= 5){
                        skilled++;
                        womlings += 2;
                    }
                });
            }
            global.race['servants'] = {
                max: womlings,
                used: 0,
                smax: skilled,
                sused: 0,
                jobs: {},
                sjobs: {},
                force_scavenger: false
            };
            messageQueue((womlings + skilled) === 1 ? loc('civics_servants_msg1') : loc('civics_servants_msg2',[womlings + skilled]),'caution',false,['events','major_events']);
        }

        if (global.race['truepath'] && global.tech['focus_cure'] && global.tech.focus_cure >= 2 && global.tauceti['infectious_disease_lab']){
            if (global.tauceti.infectious_disease_lab.cure < 100){
                let labs = (support_on['infectious_disease_lab'] || 0) / 100;
                if (labs > 1){ labs = 1; }
                let gain = +flib('curve',labs).toFixed(5) / 5;
                global.tauceti.infectious_disease_lab.cure += gain;
                if (global.tauceti.infectious_disease_lab.cure > 100){ global.tauceti.infectious_disease_lab.cure = 100; }
            }
            else if (global.tauceti.infectious_disease_lab.cure >= 100 && global.tech.focus_cure === 2){
                global.tech.focus_cure = 3;
                if (races[global.race.species].type === 'synthetic'){
                    messageQueue(loc('tech_decode_virus_msg2s'),'info',false,['progress']);
                }
                else {
                    messageQueue(loc('tech_decode_virus_msg2'),'info',false,['progress']);
                }
            }
            else if (global.tech.focus_cure >= 4 && global.race.hasOwnProperty('vax')){
                let med = global.race['artifical'] ? global.city.boot_camp.count : global.city.hospital.count;
                if (global.race['orbit_decayed']){
                    med = Math.min(support_on['operating_base'],p_on['operating_base']);
                }

                if (global.tech.focus_cure === 4 && global.race.vax < 25){
                    global.race.vax += Math.rand(0, med * 2) / 150;
                }
                else if (global.tech.focus_cure === 4 && global.race.vax >= 25){
                    global.tech.focus_cure = 5;
                    messageQueue(loc('tech_vaccine_campaign_msg1'),'info',false,['progress']);
                }
                else if (global.tech.focus_cure === 5 && global.race.vax < 50){
                    global.race.vax += Math.rand(0, med * 2) / 450;
                }
                else if (global.tech.focus_cure === 5 && global.race.vax < 75){
                    global.race.vax += Math.rand(0, med * 2) / 1200;
                }
                else if (global.tech.focus_cure === 6 && global.race.vax < 100){
                    let div = 1000;
                    if (global.tech['vax_p']){ div = 250; }
                    else if (global.tech['vax_s']){ div = 390; }
                    else if (global.tech['vax_f']){ div = 25; }
                    else if (global.tech['vax_c']){ div = 125; }
                    global.race.vax += Math.rand(0, med * 2) / div;
                }
                else if (global.race.vax >= 100 && global.tech.focus_cure <= 6){
                    global.race.vax = 100;
                    global.tech.focus_cure = 7;
                    messageQueue(loc('tech_vaccine_campaign_msg2'),'info',false,['progress']);
                    removeTask('assemble');
                }
            }
        }

        if (global.race['infiltrator']){
            let tech_source = global.tech['world_control'] ? `trait_infiltrator_steal_alt` : `trait_infiltrator_steal`;
            let know_adjust = traits.infiltrator.vars()[0] / 100;
            if (global.resource.Knowledge.max >= (actions.tech.steel.cost.Knowledge() * know_adjust) && !global.race['steelen'] && global.tech['smelting'] && global.tech.smelting === 1){
                messageQueue(loc(tech_source,[loc('tech_steel')]),'info',false,['progress']);
                global.resource.Steel.display = true;
                global.tech.smelting = 2;
                defineIndustry();
                drawTech();
            }
            if (global.resource.Knowledge.max >= (actions.tech.electricity.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 1){
                messageQueue(loc(tech_source,[loc('tech_electricity')]),'info',false,['progress']);
                global.tech.high_tech = 2;
                global.city['power'] = 0;
                global.city['powered'] = true;
                initStruct(actions.city.coal_power);
                global.settings.showPowerGrid = true;
                setPowerGrid();
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.electronics.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 3 && global.tech['titanium']){
                messageQueue(loc(tech_source,[loc('tech_electronics')]),'info',false,['progress']);
                global.tech.high_tech = 4;
                if (global.race['terrifying']){
                    global.tech['gambling'] = 1;
                    initStruct(actions.city.casino);
                    initStruct(actions.space.spc_hell.spc_casino);
                }
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.fission.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 4 && global.tech['uranium']){
                messageQueue(loc(tech_source,[loc('tech_fission')]),'info',false,['progress']);
                global.tech.high_tech = 5;
                initStruct(actions.city.fission_power);
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.rocketry.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 6){
                messageQueue(loc(tech_source,[loc('tech_rocketry')]),'info',false,['progress']);
                global.tech.high_tech = 7;
                if (global.race['truepath'] && !global.tech['rival']){
                    global.tech['rival'] = 1;
                    messageQueue(loc(`civics_rival_unlocked`,[govTitle(3)]),'info',false,['progress','combat']);
                }
                arpa('Physics');
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.artifical_intelligence.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 9){
                messageQueue(loc(tech_source,[loc('tech_artificial_intelligence')]),'info',false,['progress']);
                global.tech.high_tech = 10;
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.quantum_computing.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 10 && global.tech['nano']){
                messageQueue(loc(tech_source,[loc('tech_quantum_computing')]),'info',false,['progress']);
                global.tech.high_tech = 11;
                drawTech();
                drawCity();
            }
            if (
                global.resource.Knowledge.max >= (actions.tech[global.race['truepath'] ? 'virtual_reality_tp' : 'virtual_reality'].cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 11 && global.tech['stanene']
                    && ((global.tech['infernite'] && global.tech['alpha'] && global.tech['alpha'] >= 2) || (global.race['truepath']))
                ){
                messageQueue(loc(tech_source,[loc('tech_virtual_reality')]),'info',false,['progress']);
                global.tech.high_tech = 12;
                drawTech();
                drawCity();
            }
            if (global.race['truepath']){
                if (global.resource.Knowledge.max >= (actions.tech.quantium.cost.Knowledge() * know_adjust) && global.tech['supercollider'] && global.tech.supercollider >= 10 && global.tech['enceladus'] && global.tech.enceladus >= 3 && !global.tech['quantium']){
                    messageQueue(loc(tech_source,[loc('tech_quantium')]),'info',false,['progress']);
                    global.tech['quantium'] = 1;
                    global.resource.Quantium.display = true;
                    drawTech();
                    loadFoundry();
                }
                if (global.resource.Knowledge.max >= (actions.tech.alien_biotech.cost.Knowledge() * know_adjust) && global.tech['genetics'] && global.tech.genetics >= 8 && global.tech['kuiper'] && !global.tech['biotech']){
                    messageQueue(loc(tech_source,[loc('tech_alien_biotech')]),'info',false,['progress']);
                    global.tech['biotech'] = 1;
                    drawTech();
                }
            }
            else {
                if (global.resource.Knowledge.max >= (actions.tech.shields.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 13){
                    messageQueue(loc(tech_source,[loc('tech_shields')]),'info',false,['progress']);
                    global.tech.high_tech = 14;
                    global.settings.space.neutron = true;
                    global.settings.space.blackhole = true;
                    drawTech();
                    drawCity();
                }
                if (global.resource.Knowledge.max >= (actions.tech.ai_core.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 14 && global.tech['blackhole'] && global.tech['blackhole'] >= 3){
                    messageQueue(loc(tech_source,[loc('tech_ai_core')]),'info',false,['progress']);
                    global.tech.high_tech = 15;
                    initStruct(actions.interstellar.int_neutron.citadel);
                    drawTech();
                    drawCity();
                }
                if (global.resource.Knowledge.max >= (actions.tech.graphene_processing.cost.Knowledge() * know_adjust) && global.tech['ai_core'] && global.tech.ai_core === 2){
                    messageQueue(loc(tech_source,[loc('tech_graphene_processing')]),'info',false,['progress']);
                    global.tech.ai_core = 3;
                    drawTech();
                }
                if (global.resource.Knowledge.max >= (actions.tech.nanoweave.cost.Knowledge() * know_adjust) && global.tech['science'] && global.tech.science >= 18 && !global.tech['nanoweave']){
                    messageQueue(loc(tech_source,[loc('tech_nanoweave')]),'info',false,['progress']);
                    global.tech['nanoweave'] = 1;
                    global.resource.Nanoweave.display = true;
                    drawTech();
                    loadFoundry();
                }
                if (global.resource.Knowledge.max >= (actions.tech.orichalcum_analysis.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 16 && global.tech['chthonian'] && global.tech['chthonian'] >= 3){
                    messageQueue(loc(tech_source,[loc('tech_orichalcum_analysis')]),'info',false,['progress']);
                    messageQueue(loc('tech_orichalcum_analysis_result'),'info',false,['progress']);
                    global.tech.high_tech = 17;
                    drawTech();
                    drawCity();
                }
                if (global.resource.Knowledge.max >= (actions.tech.infernium_fuel.cost.Knowledge() * know_adjust) && global.tech['smelting'] && global.tech.smelting === 7 && global.tech['hell_ruins'] && global.tech['hell_ruins'] >= 4){
                    messageQueue(loc(tech_source,[loc('tech_infernium_fuel')]),'info',false,['progress']);
                    global.tech.smelting = 8;
                    defineIndustry();
                    drawTech();
                }
            }
        }

        let moldFathom = fathomCheck('moldling');
        if (moldFathom > 0){
            let tech_source = `trait_infiltrator_thrall`;
            let know_adjust = 1 - (100 - traits.infiltrator.vars(1)[0]) * moldFathom / 100;
            if (moldFathom >= 0.02 && global.resource.Knowledge.max >= (actions.tech.smelting.cost.Knowledge() * know_adjust) && checkTechRequirements('smelting',false) && !global.tech['smelting']){
                messageQueue(loc(tech_source,[loc('tech_smelting')]),'info',false,['progress']);
                global.tech['smelting'] = 1;
                initStruct(actions.city.smelter);
                if (global.race['steelen']){
                    global.tech['smelting'] = 2;
                }
                drawTech();
                drawCity();
            }
            if (moldFathom >= 0.04 && global.resource.Knowledge.max >= (actions.tech.dynamite.cost.Knowledge() * know_adjust) && checkTechRequirements('dynamite',false) && global.tech['explosives'] && global.tech.explosives === 1){
                messageQueue(loc(tech_source,[loc('tech_dynamite')]),'info',false,['progress']);
                global.tech.explosives = 2;
                drawTech();
            }
            if (moldFathom >= 0.08 && global.resource.Knowledge.max >= (actions.tech.portland_cement.cost.Knowledge() * know_adjust) && checkTechRequirements('portland_cement',false) && global.tech['cement'] && global.tech.cement === 3){
                messageQueue(loc(tech_source,[loc('tech_portland_cement')]),'info',false,['progress']);
                global.tech.cement = 4;
                drawTech();
            }
            if (moldFathom >= 0.12 && global.resource.Knowledge.max >= (actions.tech.oxygen_converter.cost.Knowledge() * know_adjust) && checkTechRequirements('oxygen_converter',false) && global.tech['smelting'] && global.tech.smelting === 4){
                messageQueue(loc(tech_source,[loc('tech_oxygen_converter')]),'info',false,['progress']);
                global.tech.smelting = 5;
                drawTech();
            }
            if (moldFathom >= 0.15 && global.resource.Knowledge.max >= (actions.tech.machinery.cost.Knowledge() * know_adjust) && checkTechRequirements('machinery',false) && global.tech['foundry'] && global.tech.foundry === 6){
                messageQueue(loc(tech_source,[loc('tech_machinery')]),'info',false,['progress']);
                global.tech.foundry = 7;
                drawTech();
            }
            if (moldFathom >= 0.20 && global.resource.Knowledge.max >= (actions.tech.uranium_storage.cost.Knowledge() * know_adjust) && checkTechRequirements('uranium_storage',false) && global.tech['uranium'] && global.tech.uranium === 1){
                messageQueue(loc(tech_source,[loc('tech_uranium_storage')]),'info',false,['progress']);
                global.tech.uranium = 1;
                drawTech();
            }
            if (moldFathom >= 0.25 && global.resource.Knowledge.max >= (actions.tech.synthetic_fur.cost.Knowledge() * know_adjust) && checkTechRequirements('synthetic_fur',false) && !global.tech['synthetic_fur']){
                messageQueue(loc(tech_source,[actions.tech.synthetic_fur.title()]),'info',false,['progress']);
                global.tech['synthetic_fur'] = 1;
                drawTech();
            }
            if (moldFathom >= 0.35 && global.resource.Knowledge.max >= (actions.tech.rover.cost.Knowledge() * know_adjust) && checkTechRequirements('rover',false) && global.tech['space_explore'] && global.tech.space_explore === 1){
                messageQueue(loc(tech_source,[loc('tech_rover')]),'info',false,['progress']);
                global.tech.space_explore = 2;
                global.settings.space.moon = true;
                global.space['moon_base'] = {
                    count: 0,
                    on: 0,
                    support: 0,
                    s_max: 0
                };
                drawTech();
            }
            let late_tech_source = `trait_infiltrator_thrall_alt`;
            if (moldFathom >= 0.4 && global.resource.Knowledge.max >= (actions.tech.starcharts.cost.Knowledge() * know_adjust) && checkTechRequirements('starcharts',false) && global.tech['space_explore'] && global.tech.space_explore === 3){
                messageQueue(loc(late_tech_source,[loc('tech_starcharts')]),'info',false,['progress']);
                global.tech.space_explore = 4;
                drawTech();
            }
            if (moldFathom >= 0.5 && global.resource.Knowledge.max >= (actions.tech.nano_tubes.cost.Knowledge() * know_adjust) && checkTechRequirements('nano_tubes',false) && !global.tech['nano']){
                messageQueue(loc(late_tech_source,[loc('tech_nano_tubes')]),'info',false,['progress']);
                global.tech['nano'] = 1;
                global.resource.Nano_Tube.display = true;
                drawTech();
            }
            if (global.race['truepath']){
                if (moldFathom >= 0.65 && global.resource.Knowledge.max >= (actions.tech.stanene_tp.cost.Knowledge() * know_adjust) && checkTechRequirements('stanene_tp',false) && !global.tech['stanene']){
                    messageQueue(loc(late_tech_source,[loc('tech_stanene')]),'info',false,['progress']);
                    global.tech['stanene'] = 1;
                    global.resource.Stanene.display = true;
                    drawTech();
                }
                if (moldFathom >= 0.8 && global.resource.Knowledge.max >= (actions.tech.anitgrav_bunk.cost.Knowledge() * know_adjust) && checkTechRequirements('anitgrav_bunk',false) && global.tech['marines'] && global.tech.marines === 1){
                    messageQueue(loc(late_tech_source,[loc('tech_anitgrav_bunk')]),'info',false,['progress']);
                    global.tech.marines = 2;
                    drawTech();
                }
            }
            else {
                if (moldFathom >= 0.65 && global.resource.Knowledge.max >= (actions.tech.stanene.cost.Knowledge() * know_adjust) && checkTechRequirements('stanene',false) && !global.tech['stanene']){
                    messageQueue(loc(late_tech_source,[loc('tech_stanene')]),'info',false,['progress']);
                    global.tech['stanene'] = 1;
                    global.resource.Stanene.display = true;
                    drawTech();
                }
                if (moldFathom >= 0.78 && global.resource.Knowledge.max >= (actions.tech.hydroponics.cost.Knowledge() * know_adjust) && checkTechRequirements('hydroponics',false) && global.tech['mars'] && global.tech.mars === 5){
                    messageQueue(loc(late_tech_source,[loc('tech_hydroponics')]),'info',false,['progress']);
                    global.tech.mars = 6;
                    drawTech();
                }
                if (moldFathom >= 0.92 && global.resource.Knowledge.max >= (actions.tech.orichalcum_panels.cost.Knowledge() * know_adjust) && checkTechRequirements('orichalcum_panels',false) && global.tech['swarm'] && global.tech.swarm === 5){
                    messageQueue(loc(late_tech_source,[loc('tech_orichalcum_panels')]),'info',false,['progress']);
                    global.tech.swarm = 6;
                    drawTech();
                }
                if (moldFathom >= 1 && global.resource.Knowledge.max >= (actions.tech.cybernetics.cost.Knowledge() * know_adjust) && checkTechRequirements('cybernetics',false) && global.tech['high_tech'] && global.tech.high_tech === 17){
                    messageQueue(loc(late_tech_source,[loc('tech_cybernetics')]),'info',false,['progress']);
                    global.tech.high_tech = 18;
                    drawTech();
                }
            }
        }

        if (global.race['truepath'] && global.tech['tauceti'] && global.tech.tauceti === 3 && global.space.hasOwnProperty('jump_gate') && global.tauceti.hasOwnProperty('jump_gate') && global.space.jump_gate.count >= 100 && global.tauceti.jump_gate.count >= 100){
            global.tech.tauceti = 4;
            global.resource.Materials.display = false;
            global.resource.Bolognium.display = true;
            renderSpace();
            renderTauCeti();
            drawTech();
        }

        if (global.race['truepath'] && global.tech['tauceti'] && !global.race['lone_survivor']){
            if (global.tech.tauceti === 5 && !global.tech['plague'] && Math.rand(0,50) === 0){
                global.tech['plague'] = 1;
                messageQueue(loc('tau_plague',[govTitle(3)]),'info',false,['progress']);
            }
            else if (global.tech['plague'] && global.tech['tau_roid'] && global.tech['tau_whale']){
                if (global.tech.plague === 1 && (global.tech.tau_roid >= 4 || global.tech.tau_whale >= 2) && Math.rand(0,50) === 0){
                    global.tech.plague = 2;
                    global.race['quarantine'] = 1;
                    global.race['qDays'] = 0;
                    messageQueue(loc('tau_plague2',[govTitle(3)]),'info',false,['progress']);
                }
                else if (global.tech.plague === 2 && global.tech.tau_roid >= 5 && global.tech.tau_whale >= 2 && Math.rand(0,50) === 0){
                    global.tech.plague = 3;
                    global.race['quarantine'] = 2;
                    global.race['qDays'] = 0;
                    messageQueue(loc('tau_plague3',[govTitle(3),races[global.race.species].home]),'info',false,['progress']);
                }
                else if (global.tech['isolation']){
                    if (global.tech.plague < 5 && Math.rand(0,50) === 0){
                        global.tech.plague = 5;
                        delete global.race['quarantine'];
                        delete global.race['qDays'];
                        messageQueue(loc('tau_plague5b',[races[global.race.species].home]),'info',false,['progress']);
                        drawTech();
                    }
                }
                else if (global.tech.plague === 3 && global.tech['disease'] && global.tech.disease >= 2 && Math.rand(0,50) === 0){
                    global.tech.plague = 4;
                    global.race['quarantine'] = 3;
                    global.race['qDays'] = 0;
                    messageQueue(loc('tau_plague5a',[races[global.race.species].home]),'info',false,['progress']);
                }
                else if (global.tech.plague === 4 && global.tech['disease'] && global.tech.disease >= 3 && Math.rand(0,50) === 0){
                    global.tech.plague = 5;
                    global.race['quarantine'] = 4;
                    global.race['qDays'] = 0;
                    messageQueue(loc('tau_plague5a',[races[global.race.species].home]),'info',false,['progress']);
                }

                if (global.race['quarantine']){
                    if (!global.race.hasOwnProperty('qDays')){
                        global.race['qDays'] = 0;
                    }
                    global.race.qDays++;
                }
            }
        }
        else if (global.tech['tau_gas'] && global.tech.tau_gas >= 4 && !global.tech['plague'] && global.race['lone_survivor']){
            global.tech['plague'] = 5;
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
            if (!global.race.governor.config.hasOwnProperty('trash') || (global.race.governor.config.hasOwnProperty('trash') && !global.race.governor.config.trash['stab'])){
                messageQueue(loc('interstellar_blackhole_unstable'),'danger',false,['progress']);
            }
            drawTech();
        }
        else if (global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.exotic >= 0.025){
            if (global.tech['whitehole'] && global.tech['stablized']){
                delete global.tech['stablized'];
                drawTech();
            }
        }

        if (!global.tech['xeno'] && global.galaxy['scout_ship'] && gal_on['scout_ship'] > 0 && Math.rand(0, 10) === 0){
            global.tech['xeno'] = 1;
            global.galaxy.scout_ship.count--;
            global.galaxy.scout_ship.on--;
            let civPerShip = actions.galaxy.gxy_gateway.scout_ship.ship.civ();
            let milPerShip = actions.galaxy.gxy_gateway.scout_ship.ship.mil();
            global.galaxy.scout_ship.crew -= civPerShip;
            global.galaxy.scout_ship.mil -= milPerShip;
            global.resource[global.race.species].amount -= civPerShip;
            global.civic.garrison.workers -= milPerShip;
            global.civic.garrison.crew -= milPerShip;
            messageQueue(loc('galaxy_encounter'),'info',false,['progress']);
            drawTech();
        }

        if (global.galaxy['scavenger'] && global.tech['conflict'] && global.tech['conflict'] === 4 && gal_on['scavenger'] > 0 && Math.rand(0, 50) <= gal_on['scavenger']){
            global.tech['conflict'] = 5;
            messageQueue(loc('galaxy_scavenger_find'),'info',false,['progress']);
            drawTech();
        }

        if (!global.tech['syndicate'] && !global.race['lone_survivor'] && global.tech['outer'] && Math.rand(0, 20) === 0){
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

        if (global.race['orbit_decay']){
            if (!global.race['orbit_decayed']){
                $(`#infoTimer`).html(`T-${global.race['orbit_decay'] - global.stats.days}`);
            }
            orbitDecayed();
        }
        if (global.race['truepath'] && global.city.ptrait.includes('kamikaze') && orbitLength() <= 10){
            global.race['orbit_decay'] = 1;
            global.race['tidal_decay'] = 1;
            orbitDecayed();
        }

        if (global.race['living_materials']){
            ['city','space','interstellar','galaxy','portal','eden','tauceti'].forEach(function(sector){
                Object.keys(global[sector]).forEach(function(struct){
                    if (global[sector][struct].hasOwnProperty('l_m')){
                        global[sector][struct].l_m++;
                    }
                });
            });
        }

        govern();
    }

    // Event triggered
    if (!global.race.seeded || (global.race.seeded && global.race['chose'])){
        if (Math.rand(0,global.event.t) === 0){
            let event_pool = eventList('major');
            if (event_pool.length > 0){
                let event = event_pool[Math.floor(seededRandom(0,event_pool.length))];
                let msg = events[event].effect();
                messageQueue(msg,'caution',false,['events','major_events']);
                global.event.l = event;
            }
            global.event.t = 999;
            if (astroSign === 'pisces'){
                global.event.t -= astroVal('pisces')[0];
            }
        }
        else {
            global.event.t--;
        }

        if (global.race.species !== 'protoplasm'){
            if (Math.rand(0,global.m_event.t) === 0){
                let event_pool = eventList('minor');
                if (!global.race['pet'] && ((global.race['catnip'] && global.race.catnip >= 2) || (global.race['anise'] && global.race.anise >= 2))){
                    event_pool = ['pet'];
                }
                if (event_pool.length > 0){
                    let event = event_pool[Math.floor(seededRandom(0,event_pool.length))];
                    let msg = events[event].effect();
                    messageQueue(msg,false,false,['events','minor_events']);
                    global.m_event.l = event;
                }
                global.m_event.t = 850;
                if (astroSign === 'pisces'){
                    global.m_event.t -= astroVal('pisces')[1];
                }
            }
            else {
                global.m_event.t--;
            }
        }

        if (global.race['witch_hunter'] && global.resource.Sus.amount >= 100){
            let odds = 300 - global.resource.Sus.amount;
            if (odds < 1){ odds = 1; }
            if (Math.rand(0,odds) === 0){
                let msg = events['witch_hunt_crusade'].effect();
                messageQueue(msg,'caution',false,['events','major_events']);
            }
        }
        if (global.race['witch_hunter'] && global.resource.Sus.amount >= 50 && global.civic.scientist.workers > 0){
            let odds = 250 - global.resource.Sus.amount * 2;
            if (odds < 50){ odds = 50; }
            if (Math.rand(0,odds) === 0){
                let msg = events['witch_hunt'].effect();
                messageQueue(msg,false,false,['events','minor_events']);
            }
        }
        if(global.stats.achieve['endless_hunger'] && global.city.banquet && global.city.banquet.on){
            global.city.banquet.strength++;
        }

        if (global.eden['mech_station']){
            mechStationEffect()
        }
    }

    if (global.race['warlord'] && global.race['shapeshifter']){
        cleanRemoveTrait('shapeshifter');
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

    const currentTimestamp = date.valueOf();
    // Checking if a substantial amount of time elapsed since last longLoop, indicating system suspension,
    // hibernation or something similar (the threshold is the same as for counting accelerated time during pause).
    let restartNeeded = false;
    if (!global.settings.pause && exceededATimeThreshold(currentTimestamp)){
        // Adding accelerated time based on last current time which is updated below.
        addATime(currentTimestamp);
        // The restart is needed to update the duration of the loop interval.
        restartNeeded = true;
    }

    // Save game state
    global.stats['current'] = currentTimestamp;
    if (!global.race.hasOwnProperty('geck')){
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    }

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

    if (atrack.t > 0){
        atrack.t--;
        global.settings.at--;
        if (global.settings.at <= 0 || atrack.t <= 0){
            global.settings.at = 0;
            restartNeeded = true;
        }
    }

    if (restartNeeded){
        gameLoop('stop');
        gameLoop('start');
    }
}

function buildGene(){
    // Reduce size of Knowledge buffer when daily production is under 10000 to avoid jumping in front of the research queue
    let buffer = global.resource.Knowledge.diff < 10000 ? global.resource.Knowledge.diff : 10000;
    if (global.resource.Knowledge.amount >= 200000 && global.resource.Knowledge.amount >= global.resource.Knowledge.max - buffer){
        global.resource.Knowledge.amount -= 200000;
        let gene = global.genes['synthesis'] ? sythMap[global.genes['synthesis']] : 1;
        global.resource.Genes.amount += gene;
    }
}

function diffCalc(res,period){
    let sec = 1000;
    if (global.race['slow']){
        let slow = 1 + (traits.slow.vars()[0] / 100);
        sec = Math.floor(sec * slow);
    }
    if (global.race['hyper']){
        let fast = 1 - (traits.hyper.vars()[0] / 100);
        sec = Math.floor(sec * fast);
    }

    global.resource[res].diff = +(global.resource[res].delta / (period / sec)).toFixed(2);
    global.resource[res].delta = 0;

    if (global.resource[res].hasOwnProperty('gen') && global.resource[res].hasOwnProperty('gen_d')){
        global.resource[res].gen = +(global.resource[res].gen_d / (period / sec)).toFixed(2);
        global.resource[res].gen_d = 0;
    }

    let el = $(`#res${res} .diff`);
    if (global.race['decay']){
        if (global.resource[res].diff < 0){
            if (global.resource[res].diff >= breakdown.p.consume[res][loc('evo_challenge_decay')]){
                if (!el.hasClass('has-text-warning')){
                    el.removeClass('has-text-danger');
                    el.addClass('has-text-warning');
                }
            }
            else {
                if (!el.hasClass('has-text-danger')){
                    el.removeClass('has-text-warning');
                    el.addClass('has-text-danger');
                }
            }
        }
        else if (global.resource[res].diff >= 0 && (el.hasClass('has-text-danger') || el.hasClass('has-text-warning'))){
            el.removeClass('has-text-danger');
            el.removeClass('has-text-warning');
        }
    }
    else if(res === global.race.species && global.race['fasting']){
        if(global.resource[res].diff >= 0 && global.resource[res].diff < 0.75){
            el.addClass('has-text-warning');
            el.removeClass('has-text-danger');
        }
        else if(global.resource[res].diff < 0){
            el.removeClass('has-text-warning');
            el.addClass('has-text-danger');
        }
        else if(global.resource[res].diff >= 0.75){
            el.removeClass('has-text-danger');
            el.removeClass('has-text-warning');
        }
    }
    else {
        if (global.resource[res].diff < 0 && !el.hasClass('has-text-danger')){
            el.addClass('has-text-danger');
        }
        else if (global.resource[res].diff >= 0 && el.hasClass('has-text-danger')){
            el.removeClass('has-text-danger');
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
    let escape = global.race['elusive'] || Math.floor(seededRandom(0,3)) === 0 ? true : false;
    let fathom = fathomCheck('satyr');
    if (fathom > 0 && Math.floor(seededRandom(0,100)) <= fathom * 100){
        escape = true;
    }
    if (!escape && global.civic.foreign[`gov${i}`].spy > 0){
        global.civic.foreign[`gov${i}`].spy -= 1;
    }
    if (!escape && Math.floor(seededRandom(0,4)) === 0){
        messageQueue(loc('event_spy_sellout',[govTitle(i)]),'danger',false,['spy']);
        let max = global.race['mistrustful'] ? 5 + traits.mistrustful.vars()[0] : 5;
        global.civic.foreign[`gov${i}`].hstl += Math.floor(seededRandom(1,max));
        if (global.civic.foreign[`gov${i}`].hstl > 100){
            global.civic.foreign[`gov${i}`].hstl = 100;
        }
    }
    else {
        messageQueue(loc(escape ? 'event_spy_fail' : 'event_spy',[govTitle(i)]),'danger',false,['spy']);
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
