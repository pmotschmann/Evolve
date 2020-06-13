import { global, poppers, keyMultiplier, p_on } from './vars.js';
import { vBind, clearElement, powerCostMod, spaceCostMultiplier, messageQueue } from './functions.js';
import { traits } from './races.js';
import { armyRating } from './civics.js';
import { payCosts, setAction } from './actions.js';
import { checkRequirements, incrementStruct } from './space.js';
import { loc } from './locale.js';

const fortressModules = {
    prtl_fortress: {
        info: {
            name: loc('portal_fortress_name'),
            desc: loc('portal_fortress_desc'),
            repair(){
                let repair = 200;
                if (p_on['repair_droid']){
                    repair *= 0.95 ** p_on['repair_droid'];
                }
                return Math.round(repair);
            }
        },
        turret: {
            id: 'portal-turret',
            title(){
                let type = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 'portal_turret_title3' : 'portal_turret_title2') : 'portal_turret_title1';
                return loc(type);
            },
            desc(){
                let type = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 'portal_turret_title3' : 'portal_turret_title2') : 'portal_turret_title1';
                return `<div>${loc(type)}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('turret', offset, 350000, 1.28, 'portal'); },
                Copper(offset){ return spaceCostMultiplier('turret', offset, 50000, 1.28, 'portal'); },
                Adamantite(offset){ return spaceCostMultiplier('turret', offset, 8000, 1.28, 'portal'); },
                Elerium(offset){ return spaceCostMultiplier('turret', offset, 15, 1.28, 'portal'); },
                Nano_Tube(offset){ return spaceCostMultiplier('turret', offset, 28000, 1.28, 'portal'); }
            },
            powered(){
                return powerCostMod(global.tech['turret'] ? 4 + global.tech['turret'] : 4);
            },
            postPower(o){
                p_on['turret'] = global.portal.turret.on;
                vBind({el: `#fort`},'update');
            },
            effect(){
                let rating = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 70 : 50) : 35;
                let power = $(this)[0].powered();
                return `<div>${loc('portal_turret_effect',[rating])}</div><div class="has-text-caution">${loc('minus_power',[power])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('turret','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.turret.on++;
                        p_on['turret']++;
                        vBind({el: `#fort`},'update');
                    }
                    return true;
                }
                return false;
            }
        },
        carport: {
            id: 'portal-carport',
            title: loc('portal_carport_title'),
            desc(){
                return loc('portal_carport_desc');
            },
            reqs: { portal: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('carport', offset, 250000, 1.3, 'portal'); },
                Cement(offset){ return spaceCostMultiplier('carport', offset, 18000, 1.3, 'portal'); },
                Oil(offset){ return spaceCostMultiplier('carport', offset, 6500, 1.3, 'portal'); },
                Plywood(offset){ return spaceCostMultiplier('carport', offset, 8500, 1.3, 'portal'); }
            },
            repair(){
                let repair = 180;
                if (p_on['repair_droid']){
                    repair *= 0.95 ** p_on['repair_droid'];
                }
                return Math.round(repair);
            },
            effect(){
                return `${loc('portal_carport_effect')}`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('carport','portal');
                    global.civic.hell_surveyor.display = true;
                    global.resource.Infernite.display = true;
                    if (!global.tech['infernite']){
                        global.tech['infernite'] = 1;
                    }
                    return true;
                }
                return false;
            }
        },
        war_droid: {
            id: 'portal-war_droid',
            title: loc('portal_war_droid_title'),
            desc(){
                return `<div>${loc('portal_war_droid_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('war_droid', offset, 495000, 1.26, 'portal'); },
                Neutronium(offset){ return spaceCostMultiplier('war_droid', offset, 1250, 1.26, 'portal'); },
                Elerium(offset){ return spaceCostMultiplier('war_droid', offset, 18, 1.26, 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('war_droid', offset, 37500, 1.26, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('war_droid', offset, 1, 1.26, 'portal'); }
            },
            powered(){ return powerCostMod(2); },
            effect(){
                return `<div>${loc('portal_war_droid_effect')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('war_droid','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.war_droid.on++;
                    }
                    return true;
                }
                return false;
            },
            flair: loc('portal_war_droid_flair')
        },
        repair_droid: {
            id: 'portal-repair_droid',
            title: loc('portal_repair_droid_title'),
            desc(){
                return `<div>${loc('portal_repair_droid_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 6 },
            cost: {
                Money(offset){ return spaceCostMultiplier('repair_droid', offset, 444000, 1.26, 'portal'); },
                Iron(offset){ return spaceCostMultiplier('repair_droid', offset, 88000, 1.26, 'portal'); },
                Iridium(offset){ return spaceCostMultiplier('repair_droid', offset, 17616, 1.26, 'portal'); },
                Infernite(offset){ return spaceCostMultiplier('repair_droid', offset, 666, 1.26, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('repair_droid', offset, 1, 1.15, 'portal'); }
            },
            powered(){ return powerCostMod(3); },
            effect(){
                return `<div>${loc('portal_repair_droid_effect',[5])}</div><div>${loc('portal_repair_droid_effect2',[5])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('repair_droid','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.repair_droid.on++;
                    }
                    return true;
                }
                return false;
            },
            flair: loc('portal_repair_droid_flair')
        },
    },
    prtl_badlands: {
        info: {
            name: loc('portal_badlands_name'),
            desc: loc('portal_badlands_desc'),
        },
        war_drone: {
            id: 'portal-war_drone',
            title: loc('portal_war_drone_title'),
            desc(){
                return `<div>${loc('portal_war_drone_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 3 },
            powered(){ return powerCostMod(5); },
            cost: {
                Money(offset){ return spaceCostMultiplier('war_drone', offset, 650000, 1.28, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('war_drone', offset, 60000, 1.28, 'portal'); },
                Graphene(offset){ return spaceCostMultiplier('war_drone', offset, 100000, 1.28, 'portal'); },
                Elerium(offset){ return spaceCostMultiplier('war_drone', offset, 25, 1.28, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('war_drone', offset, 1, 1.28, 'portal'); }
            },
            effect(){
                return `<div>${loc('portal_war_drone_effect')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('war_drone','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.war_drone.on++;
                    }
                    return true;
                }
                return false;
            },
            flair: loc('portal_war_drone_flair')
        },
        sensor_drone: {
            id: 'portal-sensor_drone',
            title: loc('portal_sensor_drone_title'),
            desc(){
                return `<div>${loc('portal_sensor_drone_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { infernite: 2 },
            powered(){ return powerCostMod(3); },
            cost: {
                Money(offset){ return spaceCostMultiplier('sensor_drone', offset, 500000, 1.25, 'portal'); },
                Polymer(offset){ return spaceCostMultiplier('sensor_drone', offset, 25000, 1.25, 'portal'); },
                Adamantite(offset){ return spaceCostMultiplier('sensor_drone', offset, 12500, 1.25, 'portal'); },
                Infernite(offset){ return spaceCostMultiplier('sensor_drone', offset, 100, 1.25, 'portal'); }
            },
            effect(){
                let bonus = global.tech.infernite >= 4 ? (global.tech.infernite >= 6 ? 50 : 20) : 10;
                let know = global.tech.infernite >= 6 ? 2500 : 1000;
                let sci = global.tech['science'] >= 14 ? `<div>${loc('city_max_knowledge',[know])}</div><div>${loc('space_moon_observatory_effect',[2])}</div><div>${loc('portal_sensor_drone_effect2',[2])}</div>` : '';
                return `<div>${loc('portal_sensor_drone_effect',[bonus])}</div>${sci}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('sensor_drone','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.sensor_drone.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        attractor: {
            id: 'portal-attractor',
            title: loc('portal_attractor_title'),
            desc(){
                return `<div>${loc('portal_attractor_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 4 },
            powered(){ return powerCostMod(3); },
            cost: {
                Money(offset){ return spaceCostMultiplier('attractor', offset, 350000, 1.25, 'portal'); },
                Aluminium(offset){ return spaceCostMultiplier('attractor', offset, 175000, 1.25, 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('attractor', offset, 90000, 1.25, 'portal'); },
            },
            effect(){
                return `<div>${loc('portal_attractor_effect1')}</div><div>${loc('portal_attractor_effect2',[global.resource.Soul_Gem.name])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('attractor','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.attractor.on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    prtl_pit: {
        info: {
            name: loc('portal_pit_name'),
            desc: loc('portal_pit_desc'),
        },
        pit_mission: {
            id: 'portal-pit_mission',
            title: loc('portal_pit_mission_title'),
            desc: loc('portal_pit_mission_title'),
            reqs: { hell_pit: 1 },
            grant: ['hell_pit',2],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Money(){ return 5000000; },
                Helium_3(){ return 300000; },
                Deuterium(){ return 200000; }
            },
            effect: loc('portal_pit_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('portal_pit_mission_result'),'info');
                    return true;
                }
                return false;
            }
        },
        assault_forge: {
            id: 'portal-assault_forge',
            title: loc('portal_assault_forge_title'),
            desc: loc('portal_assault_forge_title'),
            reqs: { hell_pit: 2 },
            grant: ['hell_pit',3],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Money(){ return 10000000; },
                HellArmy(){
                    return Math.round(650 / armyRating(1,'army'));
                },
                Cement(){ return 10000000; },
                Adamantite(){ return 1250000; },
                Elerium(){ return 2400; },
                Stanene(){ return 900000; }
            },
            effect: loc('portal_assault_forge_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('portal_assault_forge_result'),'info');
                    return true;
                }
                return false;
            }
        },
        soul_forge: {
            id: 'portal-soul_forge',
            title: loc('portal_soul_forge_title'),
            desc(){
                return `<div>${loc('portal_soul_forge_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_pit: 4 },
            no_queue(){ return global.portal.soul_forge.count < 1 ? false : true },
            queue_complete(){ return global.portal.soul_forge.count >= 1 ? true : false; },
            powered(){ return powerCostMod(30); },
            postPower(o){
                vBind({el: `#fort`},'update');
            },
            cost: {
                Money(offset){ return global.portal.hasOwnProperty('soul_forge') && global.portal.soul_forge.count >= 1 ? 0 : spaceCostMultiplier('soul_forge', offset, 25000000, 1.25, 'portal'); },
                Graphene(offset){ return global.portal.hasOwnProperty('soul_forge') && global.portal.soul_forge.count >= 1 ? 0 : spaceCostMultiplier('soul_forge', offset, 1500000, 1.25, 'portal'); },
                Infernite(offset){ return global.portal.hasOwnProperty('soul_forge') && global.portal.soul_forge.count >= 1 ? 0 : spaceCostMultiplier('soul_forge', offset, 25000, 1.25, 'portal'); },
                Bolognium(offset){ return global.portal.hasOwnProperty('soul_forge') && global.portal.soul_forge.count >= 1 ? 0 : spaceCostMultiplier('soul_forge', offset, 100000, 1.25, 'portal'); },
            },
            effect(){
                let desc = `<div>${loc('portal_soul_forge_effect',[global.resource.Soul_Gem.name])}</div>`;
                if (global.portal.hasOwnProperty('soul_forge') && global.portal.soul_forge.count >= 1){
                    let cap = global.tech.hell_pit >= 6 ? 750000 : 1000000;
                    if (global.tech.hell_pit >= 7 && p_on['soul_attractor'] > 0){
                        cap *= 0.97 ** p_on['soul_attractor'];
                    }
                    desc = desc + `<div>${loc('portal_soul_forge_effect2',[global.portal.soul_forge.kills,Math.round(cap)])}</div>`;
                }
                let soldiers = soulForgeSoldiers();
                return `${desc}<div><span class="has-text-caution">${loc('portal_soul_forge_soldiers',[soldiers])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.portal.soul_forge.count < 1){
                        incrementStruct('soul_forge','portal');
                        if (global.city.powered && global.city.power >= $(this)[0].powered()){
                            global.portal.soul_forge.on++;
                        }
                    }
                    return true;
                }
                return false;
            }
        },
        gun_emplacement: {
            id: 'portal-gun_emplacement',
            title: loc('portal_gun_emplacement_title'),
            desc(){
                return `<div>${loc('portal_gun_emplacement_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_gun: 1 },
            powered(){ return powerCostMod(3); },
            cost: {
                Money(offset){ return spaceCostMultiplier('gun_emplacement', offset, 4000000, 1.25, 'portal'); },
                Coal(offset){ return spaceCostMultiplier('gun_emplacement', offset, 250000, 1.25, 'portal'); },
                Steel(offset){ return spaceCostMultiplier('gun_emplacement', offset, 1200000, 1.25, 'portal'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('gun_emplacement', offset, 200000, 1.25, 'portal'); },
            },
            effect(){
                let soldiers = global.tech.hell_gun >= 2 ? 2 : 1;
                let min = global.tech.hell_gun >= 2 ? 35 : 20;
                let max = global.tech.hell_gun >= 2 ? 75 : 40;
                return `<div>${loc('portal_gun_emplacement_effect',[soldiers])}</div><div>${loc('portal_gun_emplacement_effect2',[min,max])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('gun_emplacement','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.gun_emplacement.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        soul_attractor: {
            id: 'portal-soul_attractor',
            title: loc('portal_soul_attractor_title'),
            desc(){
                return `<div>${loc('portal_soul_attractor_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_pit: 5 },
            powered(){ return powerCostMod(4); },
            cost: {
                Money(offset){ return spaceCostMultiplier('soul_attractor', offset, 12000000, 1.25, 'portal'); },
                Stone(offset){ return spaceCostMultiplier('soul_attractor', offset, 23000000, 1.25, 'portal'); },
                Nano_Tube(offset){ return spaceCostMultiplier('soul_attractor', offset, 314159, 1.25, 'portal'); },
                Vitreloy(offset){ return spaceCostMultiplier('soul_attractor', offset, 1618, 1.25, 'portal'); },
                Aerogel(offset){ return spaceCostMultiplier('soul_attractor', offset, 180000, 1.25, 'portal'); },
            },
            effect(){
                let link = global.tech.hell_pit >= 7 ? `<div>${loc('portal_soul_attractor_effect2',[3])}</div>` : ``;
                return `<div>${loc('portal_soul_attractor_effect',[40,120])}</div>${link}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('soul_attractor','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.soul_attractor.on++;
                    }
                    return true;
                }
                return false;
            }
        },
    }
};

function soulForgeSoldiers(){
    let soldiers = Math.round(650 / armyRating(1,'army'));
    if (p_on['gun_emplacement']){
        soldiers -= p_on['gun_emplacement'] * (global.tech.hell_gun >= 2 ? 2 : 1);
        if (soldiers < 0){
            soldiers = 0;
        }
    }
    return soldiers;
}

export function fortressTech(){
    return fortressModules;
}

export function renderFortress(){
    let parent = $('#portal');
    clearElement(parent);
    parent.append($(`<h2 class="is-sr-only">${loc('tab_portal')}</h2>`));
    if (!global.tech['portal'] || global.tech['portal'] < 2){
        return;
    }

    Object.keys(fortressModules).forEach(function (region){
        let show = region.replace("prtl_","");
        if (global.settings.portal[`${show}`]){
            let name = typeof fortressModules[region].info.name === 'string' ? fortressModules[region].info.name : fortressModules[region].info.name();
            let desc = typeof fortressModules[region].info.desc === 'string' ? fortressModules[region].info.desc : fortressModules[region].info.desc();
            
            if (fortressModules[region].info['support']){
                let support = fortressModules[region].info['support'];
                parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3> <span v-show="s_max">{{ support }}/{{ s_max }}</span></div></div>`);
                vBind({
                    el: `#sr${region}`,
                    data: global.portal[support]
                });
            }
            else {
                parent.append(`<div id="${region}" class="space"><div><h3 class="name has-text-warning">${name}</h3></div></div>`);
            }
            
            $(`#${region} h3.name`).on('mouseover',function(){
                var popper = $(`<div id="pop${region}" class="popper has-background-light has-text-dark"></div>`);
                $('#main').append(popper);
                
                popper.append($(`<div>${desc}</div>`));
                popper.show();
                poppers[region] = new Popper($(`#${region} h3.name`),popper);
            });
            $(`#${region} h3.name`).on('mouseout',function(){
                $(`#pop${region}`).hide();
                if (poppers[region]){
                    poppers[region].destroy();
                }
                clearElement($(`#pop${region}`),true);
            });

            if (region === 'prtl_fortress'){
                buildFortress(parent,true);
                buildFortress($('#fortress'),false);
            } 

            Object.keys(fortressModules[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(fortressModules,region,tech)){
                    let c_action = fortressModules[region][tech];
                    setAction(c_action,'portal',tech);
                }
            });
        }
    });
}

function buildFortress(parent,full){
    let id = full ? 'fort' : 'gFort';
    let fort = full ? $(`<div id="${id}" class="fort"></div>`) : $('#gFort');
    if (full){
        parent.append(fort);
    }
    else {
        if (fort.length > 0){
            clearElement(fort);
        }
        else {
            fort = $(`<div id="${id}" class="fort gFort"></div>`);
            parent.append(fort);
        }
        fort.append(`<div><h3 class="has-text-warning">${loc('portal_fortress_name')}</h3></div>`);
    }
    

    let status = $('<div></div>');
    fort.append(status);

    let defense = $(`<span class="defense has-text-success" :aria-label="defense()">${loc('fortress_defense')} {{ f.garrison | defensive }}</span>`);
    status.append(defense);
    let activity = $(`<b-tooltip :label="hostiles()" position="is-bottom" multilined animated><span class="has-text-danger pad" :aria-label="hostiles()">${loc('fortress_spotted')} {{ f.threat }}</span></b-tooltip>`);
    status.append(activity);
    let threatLevel = $(`<b-tooltip :label="threatLevel()" position="is-bottom" multilined animated><span :class="threaten()" :aria-label="threatLevel()">{{ f.threat | threat }}</span></b-tooltip>`);
    status.append(threatLevel);

    let wallStatus = $('<div></div>');
    fort.append(wallStatus);

    wallStatus.append($(`<span class="has-text-warning" :aria-label="defense()">${loc('fortress_wall')} <span :class="wall()">{{ f.walls }}%</span></span>`))

    let station = $(`<div></div>`);
    fort.append(station);
    
    station.append($(`<span>${loc('fortress_army')}</span>`));
    station.append($('<span role="button" aria-label="remove soldiers from the fortress" class="sub has-text-danger" @click="aLast"><span>&laquo;</span></span>'));
    station.append($('<b-tooltip :label="armyLabel()" position="is-bottom" multilined animated><span class="current">{{ f.garrison | patrolling }}</span></b-tooltip>'));
    station.append($('<span role="button" aria-label="add soldiers to the fortress" class="add has-text-success" @click="aNext"><span>&raquo;</span></span>'));
    
    station.append($(`<span>${loc('fortress_patrol')}</span>`));
    station.append($('<span role="button" aria-label="reduce number of patrols" class="sub has-text-danger" @click="patDec"><span>&laquo;</span></span>'));
    station.append($('<b-tooltip :label="patLabel()" position="is-bottom" multilined animated><span class="current">{{ f.patrols }}</span></b-tooltip>'));
    station.append($('<span role="button" aria-label="increase number of patrols" class="add has-text-success" @click="patInc"><span>&raquo;</span></span>'));

    station.append($(`<span>${loc('fortress_patrol_size')}</span>`));
    station.append($('<span role="button" aria-label="reduce size of each patrol" class="sub has-text-danger" @click="patSizeDec"><span>&laquo;</span></span>'));
    station.append($('<b-tooltip :label="patSizeLabel()" position="is-bottom" multilined animated><span class="current">{{ f.patrol_size }}</span></b-tooltip>'));
    station.append($('<span role="button" aria-label="increase size of each patrol" class="add has-text-success" @click="patSizeInc"><span>&raquo;</span></span>'));

    station.append($(`<b-tooltip :label="hireLabel()" size="is-small merctip" position="is-bottom" animated><button v-show="g.mercs" class="button merc" @click="hire">${loc('civics_garrison_hire_mercenary')}</button></b-tooltip>`));

    let color = global.settings.theme === 'light' ? ` type="is-light"` : ` type="is-dark"`;
    let reports = $(`<div></div>`);
    station.append(reports);
    reports.append($(`<b-checkbox class="patrol" v-model="f.notify" true-value="Yes" false-value="No"${color}>${loc('fortress_patrol_reports')}</b-checkbox>`));
    reports.append($(`<b-checkbox class="patrol" v-model="f.s_ntfy" true-value="Yes" false-value="No"${color}>${loc('fortress_surv_reports')}</b-checkbox>`));

    if (full){
        fort.append($(`<div class="training"><span>${loc('civics_garrison_training')}</span> <progress class="progress" :value="g.progress" max="100">{{ g.progress }}%</progress></div>`));
    }

    vBind({
        el: `#${id}`,
        data: {
            f: global.portal.fortress,
            g: global.civic.garrison
        },
        methods: {
            defense(){
                return loc('fortress_defense');
            },
            hostiles(){
                if (global.portal.fortress.threat >= 2000){
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_high')}`;
                }
                else if (global.portal.fortress.threat < 1000){
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_low')}`;
                }
                else {
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_medium')}`;
                }
            },
            armyLabel(){
                return loc('fortress_stationed');
            },
            patLabel(){
                return loc('fortress_patrol_desc',[global.portal.fortress.patrols]);
            },
            patSizeLabel(){
                return loc('fortress_patrol_size_desc',[global.portal.fortress.patrol_size]);
            },
            threatLevel(){
                let t = global.portal.fortress.threat;
                if (t < 1000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level1')}`;
                }
                else if (t < 1500){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level2')}`;
                }
                else if (t >= 5000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level6')}`;
                }
                else if (t >= 3000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level5')}`;
                }
                else if (t >= 2000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level4')}`;
                }
                else {
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level3')}`;
                }
            },
            aNext(){
                let inc = keyMultiplier();
                if (global.portal.fortress.garrison < global.civic.garrison.workers){
                    global.portal.fortress.garrison += inc;
                    if (global.portal.fortress.garrison > global.civic.garrison.workers){
                        global.portal.fortress.garrison = global.civic.garrison.workers;
                    }
                    global.portal.fortress['assigned'] = global.portal.fortress.garrison;
                    vBind({el: `#garrison`},'update');
                }
            },
            aLast(){
                let dec = keyMultiplier();
                let min = global.portal.fortress.patrols * global.portal.fortress.patrol_size;
                if (p_on['soul_forge']){
                    min += soulForgeSoldiers();
                }
                if (global.portal.fortress.garrison > min){
                    global.portal.fortress.garrison -= dec;
                    if (global.portal.fortress.garrison < min){
                        global.portal.fortress.garrison = min;
                    }
                    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
                        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
                    }
                    global.portal.fortress['assigned'] = global.portal.fortress.garrison;
                    vBind({el: `#garrison`},'update');
                }
            },
            patInc(){
                let inc = keyMultiplier();
                if (global.portal.fortress.patrols * global.portal.fortress.patrol_size < global.portal.fortress.garrison){
                    global.portal.fortress.patrols += inc;
                    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
                        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
                    }
                }
            },
            patDec(){
                let dec = keyMultiplier();
                if (global.portal.fortress.patrols > 0){
                    global.portal.fortress.patrols -= dec;
                    if (global.portal.fortress.patrols < 0){
                        global.portal.fortress.patrols = 0;
                    }
                }
            },
            patSizeInc(){
                let inc = keyMultiplier();
                if (global.portal.fortress.patrol_size < global.portal.fortress.garrison){
                    global.portal.fortress.patrol_size += inc;
                    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
                        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
                    }
                }
            },
            patSizeDec(){
                let dec = keyMultiplier();
                if (global.portal.fortress.patrol_size > 1){
                    global.portal.fortress.patrol_size -= dec;
                    if (global.portal.fortress.patrol_size < 1){
                        global.portal.fortress.patrol_size = 1;
                    }
                }
            },
            wall(){
                let val = global.portal.fortress.walls;
                if (val >= 75){
                    return "has-text-success";
                }
                else if (val <= 25){
                    return "has-text-danger";
                }
                else {
                    return "has-text-warning";
                }
            },
            threaten(){
                let val = global.portal.fortress.threat;
                if (val < 1000){
                    return "has-text-success";
                }
                else if (val >= 2000){
                    return "has-text-danger";
                }
                else {
                    return "has-text-warning";
                }
            },
            hire(){
                let cost = Math.round((1.24 ** global.civic.garrison.workers) * 75) - 50;
                if (cost > 25000){
                    cost = 25000;
                }
                if (global.civic.garrison.m_use > 0){
                    cost *= 1.1 ** global.civic.garrison.m_use;
                }
                if (global.race['brute']){
                    cost = cost / 2;
                }
                cost = Math.round(cost);
                if (global.civic['garrison'].workers < global.civic['garrison'].max && global.resource.Money.amount >= cost){
                    global.resource.Money.amount -= cost;
                    global.civic['garrison'].workers++;
                    global.civic.garrison.m_use++;
                    global.portal.fortress.garrison++;
                    global.portal.fortress['assigned'] = global.portal.fortress.garrison;
                    vBind({el: `#garrison`},'update');
                }
            },
            hireLabel(){
                let cost = Math.round((1.24 ** global.civic.garrison.workers) * 75) - 50;
                if (cost > 25000){
                    cost = 25000;
                }
                if (global.civic.garrison.m_use > 0){
                    cost *= 1.1 ** global.civic.garrison.m_use;
                }
                if (global.race['brute']){
                    cost = cost / 2;
                }
                cost = Math.round(cost);
                return loc('civics_garrison_hire_mercenary_cost',[cost]);
            }
        },
        filters: {
            defensive(v){
                return fortressDefenseRating(v);
            },
            patrolling(v){
                let stationed =  v - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
                if (p_on['soul_forge']){
                    let forge = soulForgeSoldiers();
                    if (forge <= stationed){
                        stationed -= forge;
                    }
                }
                return stationed;
            },
            threat(t){
                if (t < 1000){
                    return loc('fortress_threat_level1');
                }
                else if (t < 1500){
                    return loc('fortress_threat_level2');
                }
                else if (t >= 5000){
                    return loc('fortress_threat_level6');
                }
                else if (t >= 3000){
                    return loc('fortress_threat_level5');
                }
                else if (t >= 2000){
                    return loc('fortress_threat_level4');
                }
                else {
                    return loc('fortress_threat_level3');
                }
            }
        }
    });
}

function fortressDefenseRating(v){
    let army = v - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
    if (p_on['soul_forge']){
        let forge = soulForgeSoldiers();
        if (forge <= army){
            army -= forge;
        }
    }
    let wounded = 0;
    if (global.civic.garrison.wounded > global.civic.garrison.workers - global.portal.fortress.garrison){
        wounded = global.civic.garrison.wounded - (global.civic.garrison.workers - global.portal.fortress.garrison);
        if (wounded > army){
            wounded = army;
        }
    }
    if (p_on['war_droid']){
        let droids = p_on['war_droid'] - global.portal.fortress.patrols > 0 ? p_on['war_droid'] - global.portal.fortress.patrols : 0;
        army += global.tech['hdroid'] ? droids * 2 : droids;
    }
    let turret = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 70 : 50) : 35;
    return Math.round(armyRating(army,'army',wounded)) + (p_on['turret'] ? p_on['turret'] * turret : 0);
}

function casualties(demons,pat_armor,ambush){
    let casualties = Math.round(Math.log2((demons / global.portal.fortress.patrol_size) / (pat_armor || 1))) - Math.rand(0,pat_armor);
    let dead = 0;
    if (casualties > 0){
        if (casualties > global.portal.fortress.patrol_size){
            casualties = global.portal.fortress.patrol_size;
        }
        casualties = Math.rand(ambush ? 1 : 0,casualties + 1);
        dead = Math.rand(0,casualties + 1);
        let wounded = casualties - dead;
        global.civic.garrison.wounded += wounded;
        global.civic.garrison.workers -= dead;
        global.stats.died += dead;
    }
    return dead;
}

export function bloodwar(){
    let pat_armor = global.tech['armor'] ? global.tech['armor'] : 0;
    if (global.race['armored']){
        pat_armor += traits.armored.vars[1];
    }
    if (global.race['scales']){
        pat_armor += traits.scales.vars[2];
    }

    let forgeOperating = false;                    
    if (p_on['soul_forge']){
        let troops = global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
        let forge = soulForgeSoldiers();
        if (forge <= troops){
            forgeOperating = true;
            $(`#portal-soul_forge .on`).removeClass('altwarn');
        }
        else {
            forgeOperating = false;
            $(`#portal-soul_forge .on`).addClass('altwarn');
        }
    }
    else {
        $(`#portal-soul_forge .on`).addClass('altwarn');
    }

    // Drones
    if (global.tech['portal'] >= 3 && p_on['war_drone']){
        for (let i=0; i<p_on['war_drone']; i++){
            if (Math.rand(0,global.portal.fortress.threat) >= Math.rand(0,999)){
                let demons = Math.rand(Math.floor(global.portal.fortress.threat / 50), Math.floor(global.portal.fortress.threat / 10));
                let killed = global.tech.portal >= 7 ? Math.rand(50,125) : Math.rand(25,75);
                let remain = demons - killed;
                if (remain > 0){
                    global.portal.fortress.threat -= demons - remain;
                    global.stats.dkills += demons - remain;
                    if (forgeOperating){
                        global.portal.soul_forge.kills += demons - remain;
                    }
                }
                else {
                    global.portal.fortress.threat -= demons;
                    global.stats.dkills += demons;
                    if (forgeOperating){
                        global.portal.soul_forge.kills += demons;
                    }
                }
            }
        }
    }

    if (!global.portal.fortress['pity']){
        global.portal.fortress['pity'] = 0;
    }

    let game_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 9000 : 10000;
    let gem_chance = game_base - global.portal.fortress.pity;
    if (global.race.universe === 'evil' && global.race.Dark.count > 0){
        let de = global.race.Dark.count;
        if (global.race.Harmony.count > 0){
            de *= 1 + (global.race.Harmony.count * 0.01);
        }
        gem_chance -= Math.round(Math.log2(de) * 2);
    }
    
    if (global.tech['portal'] >= 4 && p_on['attractor']){
        for (let i=0; i<p_on['attractor']; i++){
            gem_chance = Math.round(gem_chance * 0.92);
        }
    }
    if (global.race['ghostly']){
        gem_chance = Math.round(gem_chance * ((100 - traits.ghostly.vars[2]) / 100));
    }

    // Patrols
    let dead = 0;
    let terminators = p_on['war_droid'] ? p_on['war_droid'] : 0;
    let failed_drop = false;
    let wounded = 0;
    if (global.civic.garrison.wounded > global.civic.garrison.workers - global.portal.fortress.garrison){
        wounded = global.civic.garrison.wounded - (global.civic.garrison.workers - global.portal.fortress.garrison);
        if (wounded > global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size)){
            wounded -= global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
            wounded /= global.portal.fortress.patrols;
        }
        else {
            wounded = 0;
        }
    }
    let brkpnt = +(wounded % 1).toFixed(10);
    for (let i=0; i<global.portal.fortress.patrols; i++){
        let hurt = brkpnt > (1 / global.portal.fortress.patrols * i) ? Math.ceil(wounded) : Math.floor(wounded);
        if (Math.rand(0,global.portal.fortress.threat) >= Math.rand(0,999)){
            let pat_size = global.portal.fortress.patrol_size;
            if (terminators > 0){
                pat_size += global.tech['hdroid'] ? 2 : 1;
                terminators--;
            }
            let pat_rating = Math.round(armyRating(pat_size,'army',hurt));

            let demons = Math.rand(Math.floor(global.portal.fortress.threat / 50), Math.floor(global.portal.fortress.threat / 10));

            if (global.race['frenzy']){
                global.race['frenzy'] += Math.rand(0,Math.ceil(demons / 10));
                if (global.race['frenzy'] > 1000000){
                    global.race['frenzy'] = 1000000;
                }
            }

            if (Math.rand(0,global.race['chameleon'] || global.race['elusive'] ? 50 : 30) === 0){
                dead += casualties(Math.round(demons * (1 + Math.random() * 3)),0,true);
                let remain = demons - Math.round(pat_rating / 2);
                if (remain > 0){
                    global.portal.fortress.threat -= demons - remain;
                    global.stats.dkills += demons - remain;
                    if (forgeOperating){
                        global.portal.soul_forge.kills += demons - remain;
                    }
                }
                else {
                    global.portal.fortress.threat -= demons;
                    global.stats.dkills += demons;
                    if (forgeOperating){
                        global.portal.soul_forge.kills += demons;
                    }
                }
            }
            else {
                let remain = demons - pat_rating;
                if (remain > 0){
                    global.portal.fortress.threat -= demons - remain;
                    global.stats.dkills += demons - remain;
                    if (forgeOperating){
                        global.portal.soul_forge.kills += demons - remain;
                    }
                    dead += casualties(remain,pat_armor,false);
                }
                else {
                    global.portal.fortress.threat -= demons;
                    global.stats.dkills += demons;
                    if (forgeOperating){
                        global.portal.soul_forge.kills += demons;
                    }
                }
                if (Math.rand(0,gem_chance) === 0){
                    global.resource.Soul_Gem.amount++;
                    global.portal.fortress.pity = 0;
                    if (!global.resource.Soul_Gem.display){
                        global.resource.Soul_Gem.display = true;
                        messageQueue(loc('portal_first_gem'),'info');
                    }
                }
                else {
                    failed_drop = true;
                }
            }
        }
    }

    let revive = 0;
    if (global.race['revive']){
        revive = Math.round(Math.seededRandom(0,(dead / 3) + 0.25));
        global.civic.garrison.workers += revive;
    }

    // Soldier Rebalancing
    if (global.civic.garrison.wounded > global.civic.garrison.workers){
        global.civic.garrison.wounded = global.civic.garrison.workers;
    }
    if (global.civic.garrison.workers < global.portal.fortress.garrison){
        global.portal.fortress.garrison = global.civic.garrison.workers;
    }
    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
    }

    if (dead > 0 && global.portal.fortress.notify === 'Yes'){
        if (revive > 0){
            messageQueue(loc('fortress_patrol_casualties_revive',[dead,revive]));
        }
        else {
            messageQueue(loc('fortress_patrol_casualties',[dead]));
        }
    }
    
    if (failed_drop && global.portal.fortress.pity < 10000){
        global.portal.fortress.pity++;
    }

    // Siege Chance
    if (global.portal.fortress.garrison > 0 && global.portal.fortress.siege > 0){
        global.portal.fortress.siege--;
    }
    if (global.portal.fortress.siege <= 900 && global.portal.fortress.garrison > 0 && 1 > Math.rand(0,global.portal.fortress.siege)){
        let defense = fortressDefenseRating(global.portal.fortress.garrison);
        let defend = defense / 35 > 1 ? defense / 35 : 1;
        let siege = Math.round(global.portal.fortress.threat / 2);

        let damage = 0;
        let killed = 0;
        let destroyed = false;
        while (siege > 0 && global.portal.fortress.walls > 0){
            let terminated = Math.round(Math.rand(1,defend + 1));
            if (terminated > siege){
                terminated = siege;
            }
            siege -= terminated;
            global.portal.fortress.threat -= terminated;
            global.stats.dkills += terminated;
            if (forgeOperating){
                global.portal.soul_forge.kills += terminated;
            }
            killed += terminated;
            if (siege > 0){
                damage++;
                global.portal.fortress.walls--;
                if (global.portal.fortress.walls === 0){
                    destroyed = true;
                    break;
                }
            }
        }

        if (destroyed){
            messageQueue(loc('fortress_lost'));
            global.resource[global.race.species].amount -= global.civic.hell_surveyor.workers;
            global.civic.hell_surveyor.workers = 0;

            global.portal.fortress.patrols = 0;
            global.stats.died += global.portal.fortress.garrison;
            global.civic.garrison.workers -= global.portal.fortress.garrison;
            global.portal.fortress.garrison = 0;
            global.portal.fortress['assigned'] = 0;
        }
        else {
            messageQueue(loc('fortress_sieged',[killed,damage]));
        }

        global.portal.fortress.siege = 999;
    }

    if (global.portal.fortress.threat < 10000){
        let influx = ((10000 - global.portal.fortress.threat) / 2500) + 1;
        if (global.tech['portal'] >= 4 && p_on['attractor']){
            influx *= 1 + (p_on['attractor'] * 0.22);
        }
        global.portal.fortress.threat += Math.rand(Math.round(10 * influx),Math.round(50 * influx));
    }

    // Surveyor threats
    if (global.civic.hell_surveyor.display && global.civic.hell_surveyor.workers > 0){
        let divisor = 1000;
        if (global.race['blurry']){
            divisor *= 1 + (traits.blurry.vars[0] / 100);
        }
        if (global.tech['infernite'] && global.tech.infernite >= 5){
            divisor += 250;
        }
        let danger = global.portal.fortress.threat / divisor;
        let exposure = global.civic.hell_surveyor.workers > 10 ? 10 : global.civic.hell_surveyor.workers;
        let risk = 10 - (Math.rand(0,exposure + 1));

        if (danger > risk){
            let cap = Math.round(danger);
            let dead = Math.rand(0,cap + 1);
            if (dead > global.civic.hell_surveyor.workers){
                dead = global.civic.hell_surveyor.workers;
            }
            if (dead === 1 && global.portal.fortress.s_ntfy === 'Yes'){
                messageQueue(loc('fortress_killed'));
            }
            else if (dead > 1 && global.portal.fortress.s_ntfy === 'Yes'){
                messageQueue(loc('fortress_eviscerated',[dead]));
            }
            if (dead > 0){
                global.civic.hell_surveyor.workers -= dead;
                global.resource[global.race.species].amount -= dead;
                global.portal.carport.damaged += dead;
            }
        }
    }

    if (global.stats.dkills >= 1000000 && global.tech['gateway'] && !global.tech['hell_pit']){
        global.tech['hell_pit'] = 1;
        global.settings.portal.pit = true;
        messageQueue(loc('portal_hell_pit_found'),'info');
        renderFortress();
    }

    if (global.tech['hell_pit']){
        if (forgeOperating && global.tech.hell_pit >= 5 && p_on['soul_attractor']){
            global.portal.soul_forge.kills += p_on['soul_attractor'] * Math.rand(40,120);
        }

        if (forgeOperating && global.tech['hell_gun'] && p_on['gun_emplacement']){
            let gunKills = 0;
            for (let i=0; i<p_on['gun_emplacement']; i++){
                gunKills += global.tech.hell_gun >= 2 ? Math.rand(35,75) : Math.rand(20,40);
            }
            global.portal.soul_forge.kills += gunKills;
            global.stats.dkills += gunKills;
            let gun_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 6750 : 7500;
            if (global.tech.hell_pit >= 7 && p_on['soul_attractor'] > 0){
                gun_base *= 0.94 ** p_on['soul_attractor'];
            }
            for (let i=0; i<p_on['gun_emplacement']; i++){
                if (Math.rand(0,Math.round(gun_base)) === 0){
                    global.resource.Soul_Gem.amount++;
                }
            }
        }

        if (forgeOperating){
            let forgeKills = Math.rand(25,150);
            global.stats.dkills += forgeKills;
            global.portal.soul_forge.kills += forgeKills;
            let forge_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 4500 : 5000;
            if (Math.rand(0,forge_base) === 0){
                global.resource.Soul_Gem.amount++;
            }
        }

        let cap = global.tech.hell_pit >= 6 ? 750000 : 1000000;
        if (global.tech.hell_pit >= 7 && p_on['soul_attractor'] > 0){
            cap *= 0.97 ** p_on['soul_attractor'];
        }
        if (forgeOperating && global.portal.soul_forge.kills >= Math.round(cap)){
            global.portal.soul_forge.kills = 0;
            global.resource.Soul_Gem.amount++;
        }
    }
}
