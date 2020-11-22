import { global, save, webWorker, keyMultiplier, p_on, gal_on, spire_on, quantum_level, poppers, sizeApproximation, clearStates } from './vars.js';
import { vBind, clearElement, popover, powerCostMod, spaceCostMultiplier, messageQueue, powerModifier, calcPillar, deepClone } from './functions.js';
import { unlockAchieve, unlockFeat, alevel, universeAffix, checkAchievements } from './achieve.js';
import { traits, races } from './races.js';
import { defineResources, spatialReasoning } from './resources.js';
import { loadFoundry } from './jobs.js';
import { armyRating } from './civics.js';
import { payCosts, setAction, drawTech, bank_vault, cleanTechPopOver } from './actions.js';
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
                        drawTech();
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
                let sci_bonus = global.race['cataclysm'] ? `<div>${loc('space_moon_observatory_cata_effect',[2])}</div>` : `<div>${loc('space_moon_observatory_effect',[2])}</div><div>${loc('portal_sensor_drone_effect2',[2])}</div>`;
                let sci = global.tech['science'] >= 14 ? `<div>${loc('city_max_knowledge',[know])}</div>${sci_bonus}` : '';
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
                    return Math.round(650 / armyRating(1,'hellArmy'));
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
            queue_complete(){ return 1 - global.portal.soul_forge.count; },
            powered(){ return powerCostMod(30); },
            postPower(o){
                vBind({el: `#fort`},'update');
            },
            cost: {
                Money(wiki){ return !global.portal.hasOwnProperty('soul_forge') || global.portal.soul_forge.count < 1 || wiki ? 25000000 : 0; },
                Graphene(wiki){ return !global.portal.hasOwnProperty('soul_forge') || global.portal.soul_forge.count < 1 || wiki ? 1500000 : 0; },
                Infernite(wiki){ return !global.portal.hasOwnProperty('soul_forge') || global.portal.soul_forge.count < 1 || wiki ? 25000 : 0; },
                Bolognium(wiki){ return !global.portal.hasOwnProperty('soul_forge') || global.portal.soul_forge.count < 1 || wiki ? 100000 : 0; },
            },
            effect(){
                let desc = `<div>${loc('portal_soul_forge_effect',[global.resource.Soul_Gem.name])}</div>`;
                if (global.portal.hasOwnProperty('soul_forge') && global.portal.soul_forge.count >= 1){
                    let cap = global.tech.hell_pit >= 6 ? 750000 : 1000000;
                    if (global.tech.hell_pit >= 7 && p_on['soul_attractor'] > 0){
                        cap *= 0.97 ** p_on['soul_attractor'];
                    }
                    desc = desc + `<div>${loc('portal_soul_forge_effect2',[global.portal.soul_forge.kills.toLocaleString(),Math.round(cap).toLocaleString()])}</div>`;
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
                let attact = global.blood['attract'] ? global.blood.attract * 5 : 0;
                return `<div>${loc('portal_soul_attractor_effect',[40 + attact, 120 + attact])}</div>${link}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
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
    },
    prtl_ruins: {
        info: {
            name: loc('portal_ruins_name'),
            desc: loc('portal_ruins_desc'),
            support: 'guard_post',
            prop(){
                let desc = ` - <span class="has-text-advanced">${loc('portal_ruins_security')}:</span> <span class="has-text-caution">{{ on | filter('army') }}</span>`;
                desc = desc + ` - <span class="has-text-advanced">${loc('portal_ruins_supressed')}:</span> <span class="has-text-caution">{{ on | filter('sup') }}</span>`;
                return desc;
            },
            filter(v,type){
                let sup = hellSupression('ruins');
                switch (type){
                    case 'army':
                        return Math.round(sup.rating);
                    case 'sup':
                        let supress = +(sup.supress * 100).toFixed(2);
                        return `${supress}%`;
                }
            }
        },
        ruins_mission: {
            id: 'portal-ruins_mission',
            title: loc('portal_ruins_mission_title'),
            desc: loc('portal_ruins_mission_title'),
            reqs: { hell_ruins: 1 },
            grant: ['hell_ruins',2],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Money(){ return 100000000; },
                Oil(){ return 500000; },
                Helium_3(){ return 500000; }
            },
            effect: loc('portal_ruins_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('portal_ruins_mission_result'),'info');
                    global.portal['vault'] = { count: 0 };
                    global.portal['stonehedge'] = { count: 0 };
                    global.portal['archaeology'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        guard_post: {
            id: 'portal-guard_post',
            title: loc('portal_guard_post_title'),
            desc(){
                return `<div>${loc('portal_guard_post_title')}</div><div class="has-text-special">${loc('requires_soldiers')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_ruins: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('guard_post', offset, 8000000, 1.06, 'portal'); },
                Lumber(offset){ return spaceCostMultiplier('guard_post', offset, 6500000, 1.06, 'portal'); },
                Sheet_Metal(offset){ return spaceCostMultiplier('guard_post', offset, 300000, 1.06, 'portal'); },
            },
            powered(){ return powerCostMod(5); },
            support(){ return 1; },
            effect(){
                let rating = Math.round(armyRating(1,'hellArmy',0));
                return `<div>${loc('portal_guard_post_effect1',[rating])}</div><div class="has-text-caution">${loc('portal_guard_post_effect2',[1,$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('guard_post','portal');
                    global.portal.guard_post.on++;
                    return true;
                }
                return false;
            },
            postPower(){
                vBind({el: `#srprtl_ruins`},'update');
                vBind({el: `#srprtl_gate`},'update');
            }
        },
        vault: {
            id: 'portal-vault',
            title: loc('portal_vault_title'),
            desc: loc('portal_vault_title'),
            reqs: { hell_ruins: 2 },
            condition(){
                return global.portal.vault.count >= 2 ? false : true;
            },
            cost: {
                Soul_Gem(wiki){ return !global.portal.hasOwnProperty('vault') || global.portal.vault.count === 0 || wiki ? 100 : 0; },
                Money(wiki){ return !global.portal.hasOwnProperty('vault') || global.portal.vault.count === 1 || wiki ? 250000000 : 0; },
                Adamantite(wiki){ return !global.portal.hasOwnProperty('vault') || global.portal.vault.count === 1 || wiki ? 12500000 : 0; },
                Orichalcum(wiki){ return !global.portal.hasOwnProperty('vault') || global.portal.vault.count === 1 || wiki ? 30000000 : 0; },
            },
            effect(){ return !global.portal.hasOwnProperty('vault') || global.portal.vault.count < 1 ? loc('portal_vault_effect',[100]) : loc('portal_vault_effect2'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('vault','portal');
                    if (global.portal.vault.count === 2){
                        global.tech.hell_ruins = 3;
                        global.resource.Codex.display = true;
                        global.resource.Codex.amount = 1;
                        messageQueue(loc('portal_vault_result'),'info');
                    }
                    return true;
                }
                return false;
            },
            post(){
                if (global.portal.vault.count === 2){
                    drawTech();
                    renderFortress();
                    setTimeout(function(){
                        let id = 'portal-vault';
                        $(`#pop${id}`).hide();
                        if (poppers[id]){
                            poppers[id].destroy();
                        }
                        clearElement($(`#pop${id}`),true);
                    },250);
                }
            }
        },
        archaeology: {
            id: 'portal-archaeology',
            title: loc('portal_archaeology_title'),
            desc(){
                return `<div>${loc('portal_archaeology_title')}</div><div class="has-text-special">${loc('requires_security')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_ruins: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('archaeology', offset, 100000000, 1.25, 'portal'); },
                Titanium(offset){ return spaceCostMultiplier('archaeology', offset, 3750000, 1.25, 'portal'); },
                Mythril(offset){ return spaceCostMultiplier('archaeology', offset, 1250000, 1.25, 'portal'); },
            },
            powered(){ return powerCostMod(8); },
            effect(){
                return `<div>${loc('portal_archaeology_effect',[2])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('archaeology','portal');
                    global.civic.archaeologist.display = true;
                    if (global.city.power >= $(this)[0].powered()){
                        global.portal.archaeology.on++;
                        if (global.civic.d_job === 'unemployed'){
                            if (global.civic.free > 0){
                                let hired = global.civic.free - 2 < 0 ? 1 : 2;
                                global.civic.free -= hired;
                                global.civic.archaeologist.workers += hired;
                            }
                        }
                        else if (global.civic[global.civic.d_job].workers > 0){
                            let hired = global.civic[global.civic.d_job].workers - 2 < 0 ? 1 : 2;
                            global.civic[global.civic.d_job].workers -= hired;
                            global.civic.archaeologist.workers += hired;
                        }
                    }  
                    return true;
                }
                return false;
            }
        },
        arcology: {
            id: 'portal-arcology',
            title: loc('portal_arcology_title'),
            desc(){
                return `<div>${loc('portal_arcology_title')}</div><div class="has-text-special">${loc('requires_security')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { housing: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('arcology', offset, 180000000, 1.22, 'portal'); },
                Graphene(offset){ return spaceCostMultiplier('arcology', offset, 7500000, 1.22, 'portal'); },
                Bolognium(offset){ return spaceCostMultiplier('arcology', offset, 2800000, 1.22, 'portal'); },
                Orichalcum(offset){ return spaceCostMultiplier('arcology', offset, 5500000, 1.22, 'portal'); },
                Nanoweave(offset){ return spaceCostMultiplier('arcology', offset, 650000, 1.22, 'portal'); },
            },
            powered(){ return powerCostMod(25); },
            effect(){
                let sup = hellSupression('ruins');
                let vault = spatialReasoning(bank_vault() * 8 * sup.supress);
                vault = +(vault).toFixed(0);
                let containers = Math.round(quantum_level) * 10;
                let container_string = `<div>${loc('plus_max_resource',[containers,loc('resource_Crates_name')])}</div><div>${loc('plus_max_resource',[containers,loc('resource_Containers_name')])}</div>`;
                return `<div>${loc('plus_max_resource',[`\$${vault.toLocaleString()}`,loc('resource_Money_name')])}</div><div>${loc('plus_max_citizens',[8])}</div><div>${loc('plus_max_resource',[5,loc('civics_garrison_soldiers')])}</div><div>${loc('portal_guard_post_effect1',[75])}</div>${container_string}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('arcology','portal');
                    if (global.city.power >= $(this)[0].powered()){
                        global['resource'][global.race.species].max += 8;
                        global.portal.arcology.on++;
                    }
                    return true;
                }
                return false;
            },
            post(){
                vBind({el: `#srprtl_ruins`},'update');
                drawTech();
            },
            postPower(){
                vBind({el: `#srprtl_ruins`},'update');
            }
        },
        hell_forge: {
            id: 'portal-hell_forge',
            title: loc('portal_hell_forge_title'),
            desc(){
                return `<div>${loc('portal_hell_forge_title')}</div><div class="has-text-special">${loc('requires_security')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { scarletite: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('hell_forge', offset, 250000000, 1.15, 'portal'); },
                Coal(offset){ return spaceCostMultiplier('hell_forge', offset, 1650000, 1.22, 'portal'); },
                Steel(offset){ return spaceCostMultiplier('hell_forge', offset, 3800000, 1.22, 'portal'); },
                Iridium(offset){ return spaceCostMultiplier('hell_forge', offset, 1200000, 1.22, 'portal'); },
                Neutronium(offset){ return spaceCostMultiplier('hell_forge', offset, 280000, 1.22, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('hell_forge', offset, 5, 1.22, 'portal'); },
            },
            powered(){ return powerCostMod(12); },
            special: true,
            effect(){
                let sup = hellSupression('ruins');
                let craft = +(75 * sup.supress).toFixed(1);
                return `<div>${loc('portal_hell_forge_effect',[1])}</div><div>${loc('interstellar_stellar_forge_effect3',[3])}</div><div>${loc('interstellar_stellar_forge_effect',[craft])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('hell_forge','portal');
                    if (global.city.power >= $(this)[0].powered()){
                        global.portal.hell_forge.on++;
                        global.city.smelter.cap += 3;
                        global.city.smelter.Oil += 3;
                    }
                    return true;
                }
                return false;
            },
            post(){
                loadFoundry();
            },
            postPower(on){
                if (!on){
                    if (global.portal.hell_forge.on < global.city.foundry.Scarletite){
                        let diff = global.city.foundry.Scarletite - global.portal.hell_forge.on;
                        global.civic.craftsman.workers -= diff;
                        global.city.foundry.crafting -= diff;
                        global.city.foundry.Scarletite -= diff;
                    }
                }
                loadFoundry();
            }
        },
        inferno_power: {
            id: 'portal-inferno_power',
            title: loc('portal_inferno_power_title'),
            desc(){
                return `<div>${loc('portal_inferno_power_title')}</div>`;
            },
            reqs: { inferno_power: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('inferno_power', offset, 275000000, 1.16, 'portal'); },
                Neutronium(offset){ return spaceCostMultiplier('inferno_power', offset, 5000000, 1.18, 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('inferno_power', offset, 12000000, 1.18, 'portal'); },
                Bolognium(offset){ return spaceCostMultiplier('inferno_power', offset, 8000000, 1.18, 'portal'); },
            },
            powered(){ return powerModifier(-50); },
            fuel: {
                Infernite: 5,
                Coal: 100,
                Oil: 80
            },
            effect(){
                let fuel = $(this)[0].fuel;
                return `<div>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered())])}</div><div class="has-text-caution">${loc('portal_inferno_power_effect',[fuel.Infernite,global.resource.Infernite.name,fuel.Coal,global.resource.Coal.name,fuel.Oil,global.resource.Oil.name])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('inferno_power','portal');
                    global.portal.inferno_power.on++;
                    return true;
                }
                return false;
            },
            post(){
                vBind({el: `#foundry`},'update');
            },
        },
        ancient_pillars: {
            id: 'portal-ancient_pillars',
            title: loc('portal_ancient_pillars_title'),
            desc: loc('portal_ancient_pillars_desc'),
            reqs: { hell_ruins: 2 },
            cost: {
                Harmony(){ return global.race.universe !== 'micro' && global.tech['pillars'] && global.tech.pillars === 1 ? 1 : 0; },
                Scarletite(){ return global.race.universe !== 'micro' && global.tech['pillars'] && global.tech.pillars === 1 ? Object.keys(global.pillars).length * 125000 + 1000000 : 0; },
            },
            no_queue(){ return true },
            effect(){
                if (Object.keys(global.pillars).length >= 1){
                    return `<div>${loc('portal_ancient_pillars_effect2',[Object.keys(races).length - 1,Object.keys(global.pillars).length])}</div>`;
                }
                else {
                    return `<div>${loc('portal_ancient_pillars_effect',[Object.keys(races).length - 1])}</div>`;
                }
            },
            action(){
                if (global.tech['pillars'] && global.tech.pillars === 1 && global.race.universe !== 'micro'){
                    if (payCosts($(this)[0].cost)){
                        global.pillars[global.race.species] = alevel();
                        global.tech.pillars = 2;
                        spatialReasoning(0,false,true);
                        calcPillar(true);
                        towerSize(true);
                        unlockAchieve('resonance');
                        return true;
                    }
                }
                return false;
            }
        },
    },
    prtl_gate: {
        info: {
            name: loc('portal_gate_name'),
            desc(){
                return `${loc('portal_gate_desc')} ${loc(global.tech['wtower'] && global.tech['etower'] ? 'portal_gate_open' : 'portal_gate_closed')}`;
            },
            support: 'guard_post',
            hide_support: true,
            prop(){
                let desc = ` - <span class="has-text-advanced">${loc('portal_ruins_security')}:</span> <span class="has-text-caution">{{ on | filter('army') }}</span>`;
                desc = desc + ` - <span class="has-text-advanced">${loc('portal_ruins_supressed')}:</span> <span class="has-text-caution">{{ on | filter('sup') }}</span>`;
                return desc;
            },
            filter(v,type){
                let sup = hellSupression('gate');
                switch (type){
                    case 'army':
                        return Math.round(sup.rating);
                    case 'sup':
                        let supress = +(sup.supress * 100).toFixed(2);
                        return `${supress}%`;
                }
            }
        },
        gate_mission: {
            id: 'portal-gate_mission',
            title: loc('portal_gate_mission_title'),
            desc: loc('portal_gate_mission_title'),
            reqs: { high_tech: 18 },
            grant: ['hell_gate',1],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Money(){ return 250000000; },
                Knowledge(){ return 27500000; }
            },
            effect: loc('portal_gate_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('portal_gate_mission_result'),'info');
                    return true;
                }
                return false;
            }
        },
        west_tower: {
            id: 'portal-west_tower',
            title: loc('portal_west_tower'),
            desc(wiki){
                let size = towerSize();
                if (!global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < size || wiki){
                    return `<div>${loc('portal_west_tower')}</div><div class="has-text-special">${loc('requires_segmemts',[size])}</div>`;
                }
                else {
                    return `<div>${loc('portal_west_tower')}</div>`;
                }
            },
            reqs: { hell_gate: 2 },
            no_queue(){ return global.portal.west_tower.count < towerSize() ? false : true },
            queue_size: 25,
            queue_complete(){ return towerSize() - global.portal.west_tower.count; },
            cost: {
                Money(wiki){ return !global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < towerSize() || wiki ? towerPrice(10000000) : 0; },
                Stone(wiki){ return !global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < towerSize() || wiki ? towerPrice(100000) : 0; },
                Uranium(wiki){ return !global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < towerSize() || wiki ? towerPrice(1000) : 0; },
                Adamantite(wiki){ return !global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < towerSize() || wiki ? towerPrice(18000) : 0; },
                Vitreloy(wiki){ return !global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < towerSize() || wiki ? towerPrice(25000) : 0; },
                Soul_Gem(wiki){ return !global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < towerSize() || wiki ? 1 : 0; },
                Scarletite(wiki){ return !global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < towerSize() || wiki ? towerPrice(5000) : 0; },
            },
            effect(){
                let size = towerSize();
                if (!global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < size){
                    let remain = global.portal.hasOwnProperty('west_tower') ? size - global.portal.west_tower.count : size;
                    return `<div>${loc('portal_tower_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div><div class="has-text-caution">${loc('portal_tower_effect2')}</div>`;
                }
                else {
                    return loc('portal_tower_effect');
                }
            },
            action(){
                if (global.portal.west_tower.count < towerSize() && payCosts($(this)[0].cost)){
                    incrementStruct('west_tower','portal');
                    return true;
                }
                return false;
            },
            post(){
                if (global.portal.west_tower.count >= towerSize()){
                    global.tech['wtower'] = 1;
                    if (global.tech['wtower'] && global.tech['etower'] && !global.tech['hell_lake']){
                        global.tech['hell_lake'] = 1;
                        global.settings.portal.lake = true;
                        global.portal['harbour'] = { count: 0, on: 0, support: 0, s_max: 0 };
                        messageQueue(loc('portal_gate_open'),'info');
                        renderFortress();
                    }
                }
            }
        },
        east_tower: {
            id: 'portal-east_tower',
            title: loc('portal_east_tower'),
            desc(wiki){
                let size = towerSize();
                if (!global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < size || wiki){
                    return `<div>${loc('portal_east_tower')}</div><div class="has-text-special">${loc('requires_segmemts',[size])}</div>`;
                }
                else {
                    return `<div>${loc('portal_east_tower')}</div>`;
                }
            },
            reqs: { hell_gate: 2 },
            no_queue(){ return global.portal.east_tower.count < towerSize() ? false : true },
            queue_size: 25,
            queue_complete(){ return towerSize() - global.portal.east_tower.count; },
            cost: {
                Money(wiki){ return !global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < towerSize() || wiki ? towerPrice(10000000) : 0; },
                Stone(wiki){ return !global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < towerSize() || wiki ? towerPrice(100000) : 0; },
                Uranium(wiki){ return !global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < towerSize() || wiki ? towerPrice(1000) : 0; },
                Adamantite(wiki){ return !global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < towerSize() || wiki ? towerPrice(18000) : 0; },
                Vitreloy(wiki){ return !global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < towerSize() || wiki ? towerPrice(25000) : 0; },
                Soul_Gem(wiki){ return !global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < towerSize() || wiki ? 1 : 0; },
                Scarletite(wiki){ return !global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < towerSize() || wiki ? towerPrice(5000) : 0; },
            },
            effect(){
                let size = towerSize();
                if (!global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < size){
                    let remain = global.portal.hasOwnProperty('east_tower') ? size - global.portal.east_tower.count : size;
                    return `<div>${loc('portal_tower_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div><div class="has-text-caution">${loc('portal_tower_effect2')}</div>`;
                }
                else {
                    return loc('portal_tower_effect');
                }
            },
            action(){
                if (global.portal.east_tower.count < towerSize() && payCosts($(this)[0].cost)){
                    incrementStruct('east_tower','portal');
                    return true;
                }
                return false;
            },
            post(){
                if (global.portal.east_tower.count >= towerSize()){
                    global.tech['etower'] = 1;
                    if (global.tech['wtower'] && global.tech['etower'] && !global.tech['hell_lake']){
                        global.tech['hell_lake'] = 1;
                        global.settings.portal.lake = true;
                        global.portal['harbour'] = { count: 0, on: 0, support: 0, s_max: 0 };
                        messageQueue(loc('portal_gate_open'),'info');
                        renderFortress();
                    }
                }
            }
        },
        gate_turret: {
            id: 'portal-gate_turret',
            title: loc('portal_gate_turret_title'),
            desc(){
                return `<div>${loc('portal_gate_turret_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_gate: 3 },
            powered(){ return powerCostMod(6); },
            cost: {
                Money(offset){ return spaceCostMultiplier('gate_turret', offset, 3750000, 1.22, 'portal'); },
                Iron(offset){ return spaceCostMultiplier('gate_turret', offset, 4250000, 1.22, 'portal'); },
                Elerium(offset){ return spaceCostMultiplier('gate_turret', offset, 275, 1.22, 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('gate_turret', offset, 850000, 1.22, 'portal'); },
            },
            effect(){
                let security = 100;
                if (global.race['holy']){
                    security *= 1 + (traits.holy.vars[1] / 100);
                }
                let min = global.tech.hell_gun >= 2 ? 65 : 40;
                let max = global.tech.hell_gun >= 2 ? 100 : 60;
                return `<div>${loc('portal_gate_turret_effect',[security])}</div><div>${loc('portal_gate_turret_effect2',[min,max])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('gate_turret','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.gate_turret.on++;
                    }
                    return true;
                }
                return false;
            },
            postPower(){
                vBind({el: `#srprtl_gate`},'update');
            }
        },
        infernite_mine: {
            id: 'portal-infernite_mine',
            title: loc('portal_infernite_mine_title'),
            desc(){
                return `<div>${loc('portal_infernite_mine_title')}</div><div class="has-text-special">${loc('requires_security')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_gate: 4 },
            powered(){ return powerCostMod(5); },
            cost: {
                Money(offset){ return spaceCostMultiplier('infernite_mine', offset, 75000000, 1.26, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('infernite_mine', offset, 2450000, 1.26, 'portal'); },
                Orichalcum(offset){ return spaceCostMultiplier('infernite_mine', offset, 1650000, 1.26, 'portal'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('infernite_mine', offset, 680000, 1.26, 'portal'); },
            },
            effect(){                
                let sup = hellSupression('gate');
                let mining = 0.5 * sup.supress;
                return `<div>${loc('portal_infernite_mine_effect',[+(mining).toFixed(3)])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('infernite_mine','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.infernite_mine.on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    prtl_lake: {
        info: {
            name: loc('portal_lake_name'),
            desc: loc('portal_lake_desc'),
            support: 'harbour',
        },
        lake_mission: {
            id: 'portal-lake_mission',
            title: loc('portal_lake_mission_title'),
            desc: loc('portal_lake_mission_title'),
            reqs: { hell_lake: 1 },
            grant: ['hell_lake',2],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Money(){ return 500000000; },
                Oil(){ return 750000; },
                Helium_3(){ return 600000; }
            },
            effect: loc('portal_lake_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('portal_lake_mission_result'),'info');
                    return true;
                }
                return false;
            }
        },
        harbour: {
            id: 'portal-harbour',
            title: loc('portal_harbour_title'),
            desc(){
                return `<div>${loc('portal_harbour_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_lake: 3 },
            powered(){
                let factor = p_on['cooling_tower'] || 0;
                return +(powerCostMod(500 * (0.92 ** factor))).toFixed(2);
            },
            support(){ return 1; },
            cost: {
                Money(offset){ return spaceCostMultiplier('harbour', offset, 225000000, spireCreep(1.18), 'portal'); },
                Cement(offset){ return spaceCostMultiplier('harbour', offset, 50000000, spireCreep(1.18), 'portal'); },
                Iridium(offset){ return spaceCostMultiplier('harbour', offset, 7500000, spireCreep(1.18), 'portal'); },
                Infernite(offset){ return spaceCostMultiplier('harbour', offset, 800000, spireCreep(1.18), 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('harbour', offset, 17500000, spireCreep(1.18), 'portal'); },
            },
            wide: true,
            effect(){
                let storage = '<div class="aTable">';
                if (global.resource.Oil.display){
                    let val = sizeApproximation(+(spatialReasoning(30000)).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Oil.name])}</span>`
                }
                if (global.resource.Alloy.display){
                    let val = sizeApproximation(+(spatialReasoning(250000)).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Alloy.name])}</span>`
                }
                if (global.resource.Polymer.display){
                    let val = sizeApproximation(+(spatialReasoning(250000)).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Polymer.name])}</span>`
                }
                if (global.resource.Iridium.display){
                    let val = sizeApproximation(+(spatialReasoning(200000)).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Iridium.name])}</span>`
                }
                if (global.resource.Helium_3.display){
                    let val = sizeApproximation(+(spatialReasoning(18000)).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Helium_3.name])}</span>`
                }
                if (global.resource.Deuterium.display){
                    let val = sizeApproximation(+(spatialReasoning(12000)).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Deuterium.name])}</span>`
                }
                if (global.resource.Neutronium.display){
                    let val = sizeApproximation(+(spatialReasoning(180000)).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Neutronium.name])}</span>`
                }
                if (global.resource.Adamantite.display){
                    let val = sizeApproximation(+(spatialReasoning(150000)).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Adamantite.name])}</span>`
                }
                if (global.resource.Infernite.display){
                    let val = sizeApproximation(+(spatialReasoning(75000)).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Infernite.name])}</span>`
                }
                if (global.resource.Nano_Tube.display){
                    let val = sizeApproximation(+(spatialReasoning(750000)).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Nano_Tube.name])}</span>`
                }
                if (global.resource.Graphene.display){
                    let val = sizeApproximation(+(spatialReasoning(1200000)).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Graphene.name])}</span>`
                }
                if (global.resource.Stanene.display){
                    let val = sizeApproximation(+(spatialReasoning(1200000)).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Stanene.name])}</span>`
                }
                if (global.resource.Bolognium.display){
                    let val = sizeApproximation(+(spatialReasoning(130000)).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Bolognium.name])}</span>`
                }
                if (global.resource.Orichalcum.display){
                    let val = sizeApproximation(+(spatialReasoning(130000)).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Orichalcum.name])}</span>`
                }
                storage = storage + '</div>';
                return `<div>${loc('portal_harbour_effect',[1])}</div>${storage}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('harbour','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.harbour.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        cooling_tower: {
            id: 'portal-cooling_tower',
            title: loc('portal_cooling_tower_title'),
            desc(){
                return `<div>${loc('portal_cooling_tower_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_lake: 6 },
            powered(){ return powerCostMod(10); },
            cost: {
                Money(offset){ return spaceCostMultiplier('cooling_tower', offset, 250000000, 1.2, 'portal'); },
                Polymer(offset){ return spaceCostMultiplier('cooling_tower', offset, 12000000, 1.2, 'portal'); },
                Orichalcum(offset){ return spaceCostMultiplier('cooling_tower', offset, 8500000, 1.2, 'portal'); },
                Brick(offset){ return spaceCostMultiplier('cooling_tower', offset, 250000, 1.2, 'portal'); },
            },
            effect(){
                return `<div>${loc('portal_cooling_tower_effect',[8])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('cooling_tower','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.cooling_tower.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        bireme: {
            id: 'portal-bireme',
            title: loc('portal_bireme_title'),
            desc(){
                return `<div>${loc('portal_bireme_title')}</div><div class="has-text-special">${loc('space_support',[loc('lake')])}</div>`;
            },
            reqs: { hell_lake: 4 },
            powered(){ return powerCostMod(1); },
            support(){ return -1; },
            cost: {
                Money(offset){ return spaceCostMultiplier('bireme', offset, 190000000, 1.24, 'portal'); },
                Helium_3(offset){ return spaceCostMultiplier('bireme', offset, 225000, 1.24, 'portal'); },
                Adamantite(offset){ return spaceCostMultiplier('bireme', offset, 15000000, 1.24, 'portal'); },
                Nano_Tube(offset){ return spaceCostMultiplier('bireme', offset, 18000000, 1.24, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('bireme', offset, 10, 1.24, 'portal'); },
                Scarletite(offset){ return spaceCostMultiplier('bireme', offset, 125000, 1.24, 'portal'); },
            },
            effect(){
                let rating = global.blood['spire'] && global.blood.spire >= 2 ? 20 : 15;
                return `<div class="has-text-caution">${loc('space_used_support',[loc('lake')])}</div><div>${loc('portal_bireme_effect',[rating])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil])}</div>`;
            },
            ship: {
                civ: 0,
                mil: 2
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('bireme','portal');
                    if (global.portal.harbour.support < global.portal.harbour.s_max){
                        global.portal.bireme.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        transport: {
            id: 'portal-transport',
            title: loc('portal_transport_title'),
            desc(){
                return `<div>${loc('portal_transport_title')}</div><div class="has-text-special">${loc('space_support',[loc('lake')])}</div>`;
            },
            reqs: { hell_lake: 5 },
            powered(){ return powerCostMod(1); },
            support(){ return -1; },
            cost: {
                Money(offset){ return spaceCostMultiplier('transport', offset, 300000000, 1.22, 'portal'); },
                Oil(offset){ return spaceCostMultiplier('bireme', offset, 180000, 1.22, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('bireme', offset, 18000000, 1.22, 'portal'); },
                Graphene(offset){ return spaceCostMultiplier('bireme', offset, 12500000, 1.22, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('bireme', offset, 5, 1.22, 'portal'); },
                Scarletite(offset){ return spaceCostMultiplier('bireme', offset, 250000, 1.22, 'portal'); },
            },
            effect(){
                let rating = global.blood['spire'] && global.blood.spire >= 2 ? 0.8 : 0.85;
                let bireme = +((rating ** (gal_on['bireme'] || 0)) * 100).toFixed(1);
                return `<div class="has-text-caution">${loc('space_used_support',[loc('lake')])}</div><div>${loc('portal_transport_effect',[5])}</div><div class="has-text-danger">${loc('portal_transport_effect2',[bireme])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ])}</div>`;
            },
            special: true,
            sAction(){
                global.settings.civTabs = 4;
                global.settings.marketTabs = 3;
            },
            ship: {
                civ: 3,
                mil: 0
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('transport','portal');
                    if (global.portal.harbour.support < global.portal.harbour.s_max){
                        global.portal.transport.on++;
                    }
                    if (!global.settings.portal.spire){
                        global.settings.portal.spire = true;
                        global.settings.showCargo = true;
                        clearElement($('#resources'));
                        defineResources();
                        global.tech['hell_spire'] = 1;
                        global.portal['purifier'] = { count: 0, on: 0, support: 0, s_max: 0, supply: 0, sup_max: 100, diff: 0 };
                        global.portal['port'] = { count: 0, on: 0 };
                        messageQueue(loc('portal_transport_unlocked'),'info');
                        renderFortress();
                    }
                    return true;
                }
                return false;
            }
        },
    },
    prtl_spire: {
        info: {
            name: loc('portal_spire_name'),
            desc: loc('portal_spire_desc'),
            support: 'purifier',
            prop(){
                let desc = ` - <span class="has-text-advanced">${loc('portal_spire_supply')}:</span> <span class="has-text-caution">{{ supply | filter }} / {{ sup_max }}</span>`;
                return desc + ` (<span class="has-text-success">+{{ diff | filter(2) }}/s</span>)`;
            },
            filter(v,fix){
                return fix ? +(v).toFixed(fix) : Math.floor(v);
            }
        },
        spire_mission: {
            id: 'portal-spire_mission',
            title: loc('portal_spire_mission_title'),
            desc: loc('portal_spire_mission_title'),
            reqs: { hell_spire: 1 },
            grant: ['hell_spire',2],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                [global.race.species](){ return 50; },
                Oil(){ return 900000; },
                Helium_3(){ return 750000; },
                Structs(){
                    return {
                        portal: {
                            bireme: { s: 'prtl_lake', count: 1, on: 1 },
                            transport: { s: 'prtl_lake', count: 1, on: 1 },
                        }
                    };
                }
            },
            effect: loc('portal_spire_mission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('portal_spire_mission_result'),'info');
                    return true;
                }
                return false;
            },
            flair: loc('portal_spire_mission_flair'),
        },
        purifier: {
            id: 'portal-purifier',
            title: loc('portal_purifier_title'),
            desc(){
                return `<div>${loc('portal_purifier_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_spire: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('purifier', offset, 85000000, spireCreep(1.15), 'portal'); },
                Supply(offset){ return global.portal['purifier'] && global.portal.purifier.count === 0 ? 100 : spaceCostMultiplier('purifier', offset, 4200, spireCreep(1.2), 'portal'); },
            },
            powered(){ return powerCostMod(125); },
            support(){ return global.tech['b_stone'] && global.tech.b_stone >= 3 ? 1.25 : 1; },
            effect(){
                return `<div>${loc('portal_purifier_effect',[$(this)[0].support()])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('purifier','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.portal.purifier.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        port: {
            id: 'portal-port',
            title: loc('portal_port_title'),
            desc(){
                return `<div>${loc('portal_port_title')}</div><div class="has-text-special">${loc('portal_spire_support')}</div>`;
            },
            reqs: { hell_spire: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('port', offset, 135000000, spireCreep(1.2), 'portal'); },
                Supply(offset){ return global.portal.hasOwnProperty('port') && global.portal.port.count === 0 ? 100 : spaceCostMultiplier('port', offset, 6250, spireCreep(1.2), 'portal'); },
            },
            powered(){ return powerCostMod(1); },
            support(){ return -1; },
            effect(){
                let port_value = 10000;
                if (spire_on['base_camp']){
                    port_value *= 1 + (spire_on['base_camp'] * 0.4);
                }
                return `<div class="has-text-caution">${loc('portal_port_effect1',[$(this)[0].support()])}</div><div>${loc('portal_port_effect2',[Math.round(port_value)])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('port','portal');
                    if (global.portal.purifier.support < global.portal.purifier.s_max){
                        global.portal.port.on++;
                    }
                    if (global.tech.hell_spire === 3){
                        global.tech.hell_spire = 4;
                        global.portal['base_camp'] = { count: 0, on: 0 };
                        renderFortress();
                    }
                    return true;
                }
                return false;
            }
        },
        base_camp: {
            id: 'portal-base_camp',
            title: loc('portal_base_camp_title'),
            desc(){
                return `<div>${loc('portal_base_camp_title')}</div><div class="has-text-special">${loc('portal_spire_support')}</div>`;
            },
            reqs: { hell_spire: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('base_camp', offset, 425000000, spireCreep(1.2), 'portal'); },
                Supply(offset){ return spaceCostMultiplier('base_camp', offset, 50000, spireCreep(1.2), 'portal'); },
            },
            powered(){ return powerCostMod(1); },
            support(){ return -1; },
            effect(){
                return `<div class="has-text-caution">${loc('portal_port_effect1',[$(this)[0].support()])}</div><div>${loc('portal_base_camp_effect',[40])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('base_camp','portal');
                    if (global.portal.purifier.support < global.portal.purifier.s_max){
                        global.portal.base_camp.on++;
                    }
                    if (global.tech.hell_spire === 4){
                        global.tech.hell_spire = 5;
                        global.portal['bridge'] = { count: 0 };
                        messageQueue(loc('portal_spire_bridge_collapse'),'info');
                        renderFortress();
                    }
                    return true;
                }
                return false;
            }
        },
        bridge: {
            id: 'portal-bridge',
            title: loc('portal_bridge_title'),
            desc(wiki){
                if (!global.portal.hasOwnProperty('bridge') || global.portal.bridge.count < 10 || wiki){
                    return `<div>${loc('portal_bridge_title')}</div><div class="has-text-special">${loc('requires_segmemts',[10])}</div>`;
                }
                else {
                    return `<div>${loc('portal_bridge_title')}</div>`;
                }
            },
            reqs: { hell_spire: 5 },
            no_queue(){ return global.portal.bridge.count < 10 ? false : true },
            queue_size: 1,
            queue_complete(){ return 10 - global.portal.bridge.count; },
            cost: {
                [global.race.species](wiki){ return !global.portal.hasOwnProperty('bridge') || global.portal.bridge.count < 10 || wiki ? 10 : 0; },
                Money(wiki){ return !global.portal.hasOwnProperty('bridge') || global.portal.bridge.count < 10 || wiki ? 500000000 : 0; },
                Supply(wiki){ return !global.portal.hasOwnProperty('bridge') || global.portal.bridge.count < 10 || wiki ? 100000 : 0; },
            },
            effect(){
                let size = 10;
                if (!global.portal.hasOwnProperty('bridge') || global.portal.bridge.count < size){
                    let remain = global.portal.hasOwnProperty('bridge') ? size - global.portal.bridge.count : size;
                    return `<div>${loc('portal_bridge_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div><div class="has-text-caution">${loc('portal_bridge_effect2')}</div>`;
                }
                else {
                    return loc('portal_bridge_complete');
                }
            },
            action(){
                if (global.portal.bridge.count < 10 && payCosts($(this)[0].cost)){
                    incrementStruct('bridge','portal');
                    if (global.portal.bridge.count >= 10){
                        global.portal['sphinx'] = { count: 0 };
                        global.tech.hell_spire = 6;
                        renderFortress();
                    }
                    return true;
                }
                return false;
            }
        },
        sphinx: {
            id: 'portal-sphinx',
            title(){ return global.tech.hell_spire === 7 ? loc('portal_sphinx_solve') : loc('portal_sphinx_title'); },
            desc: loc('portal_sphinx_desc'),
            reqs: { hell_spire: 6 },
            no_queue(){ return global.tech.hell_spire < 8 ? false : true; },
            cost: {
                Knowledge(wiki){ return global.tech.hell_spire === 6 || global.tech.hell_spire === 7 || wiki ? (global.tech.hell_spire === 7 ? 50000000 : 40000000) : 0; }
            },
            effect(){
                if (global.tech.hell_spire === 6){
                    return loc('portal_sphinx_effect');
                }
                else if (global.tech.hell_spire === 7){
                    return loc('portal_sphinx_effect2');
                }
                else if (global.tech.hell_spire >= 8){
                    return loc('portal_sphinx_effect3');
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.tech.hell_spire === 6){
                        global.tech.hell_spire = 7;
                        messageQueue(loc('portal_sphinx_msg'),'info');
                        renderFortress();
                        return true;
                    }
                    else if (global.tech.hell_spire === 7){
                        global.tech.hell_spire = 8;
                        renderFortress();
                        messageQueue(loc('portal_sphinx_answer_msg'),'info');  
                        return true;
                    }
                }
                return false;
            }
        },
        bribe_sphinx: {
            id: 'portal-bribe_sphinx',
            title: loc('portal_sphinx_bribe'),
            desc: loc('portal_sphinx_desc'),
            reqs: { hell_spire: 7 },
            condition(){
                return global.tech['hell_spire'] && global.tech.hell_spire === 7 && !global.tech['sphinx_bribe'] ? true : false;
            },
            cost: {
                Soul_Gem(){ return 250; },
                Supply(){ return 500000; }
            },
            effect(){
                return loc('portal_sphinx_bribe_effect');
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.tech.hell_spire === 7 && !global.tech['sphinx_bribe']){
                        global.tech['sphinx_bribe'] = 1;
                        global.resource.Codex.display = true;
                        global.resource.Codex.amount = 1;
                        messageQueue(loc('portal_sphinx_bribe_msg'),'info');                        
                        return true;
                    }
                }
                return false;
            },
            post(){
                if (global.tech['sphinx_bribe']){
                    drawTech();
                    renderFortress();
                    cleanTechPopOver('portal-bribe_sphinx');
                }
            }
        },
        spire_survey: {
            id: 'portal-spire_survey',
            title: loc('portal_spire_survey_title'),
            desc: loc('portal_spire_survey_title'),
            reqs: { hell_spire: 8 },
            grant: ['hell_spire',9],
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: {
                Oil(){ return 1200000; },
                Helium_3(){ return 900000; },
            },
            effect: loc('portal_spire_survey_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.portal['mechbay'] = { count: 0, on: 0, bay: 0, max: 0, mechs: [] };
                    global.portal['spire'] = { count: 1, progress: 0, boss: '', type: '', status: {} };
                    genSpireFloor();
                    messageQueue(loc('portal_spire_survey_msg'),'info');
                    return true;
                }
                return false;
            },
            post(){
                if (global.tech['hell_spire'] && global.tech.hell_spire === 9){
                    renderFortress();
                    cleanTechPopOver('portal-spire_survey');
                }
            }
        },
        mechbay: {
            id: 'portal-mechbay',
            title: loc('portal_mechbay_title'),
            desc(){
                return `<div>${loc('portal_mechbay_title')}</div><div class="has-text-special">${loc('portal_spire_support')}</div>`;
            },
            reqs: { hell_spire: 9 },
            cost: {
                Money(offset){ return spaceCostMultiplier('mechbay', offset, 100000000, 1.2, 'portal'); },
                Supply(offset){ return spaceCostMultiplier('mechbay', offset, 250000, 1.2, 'portal'); },
            },
            powered(){ return powerCostMod(1); },
            support(){ return -1; },
            special: true,
            sAction(){
                global.settings.civTabs = 2;
                global.settings.govTabs = 3;
            },
            effect(){
                let bay = global.portal.hasOwnProperty('mechbay') ? global.portal.mechbay.bay : 0;
                let max = global.portal.hasOwnProperty('mechbay') ? global.portal.mechbay.max : 0;
                return `<div class="has-text-caution">${loc('portal_port_effect1',[$(this)[0].support()])}</div><div>${loc('portal_mechbay_effect')}</div><div>${loc('portal_mechbay_effect2',[bay,max])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('mechbay','portal');
                    if (global.portal.purifier.support < global.portal.purifier.s_max){
                        global.portal.mechbay.on++;
                        global.portal.mechbay.max += 25;
                    }
                    global.settings.showMechLab = true;
                    if (global.portal.mechbay.count === 1){
                        messageQueue(loc('portal_mechbay_unlocked'),'info');
                        drawMechLab();
                    }
                    return true;
                }
                return false;
            }
        },
        spire: {
            id: 'portal-spire',
            title: loc('portal_spire_title'),
            desc: loc('portal_spire_title'),
            reqs: { hell_spire: 9 },
            no_queue(){ return true; },
            cost: {},
            effect(){
                let floor = global.portal.hasOwnProperty('spire') ? global.portal.spire.count : 0;
                let terrain = global.portal.hasOwnProperty('spire') ? `<span class="has-text-warning">${loc(`portal_spire_type_${global.portal.spire.type}`)}</span>` : '?';
                let status = ``;
                if (global.portal.hasOwnProperty('spire') && Object.keys(global.portal.spire.status).length > 0){
                    status = `<div>${Object.keys(global.portal.spire.status).map(v => `<span class="has-text-warning">${loc(`portal_spire_status_${v}`)}</span>`).join(', ')}</div>`;
                }
                let progress = global.portal.hasOwnProperty('spire') ? `<span class="has-text-warning">${+(global.portal.spire.progress).toFixed(3)}%</span>` : '0%';
                let boss = global.portal.hasOwnProperty('spire') ? global.portal.spire.boss : 'crazed';
                return `<div>${loc('portal_spire_effect',[floor])}</div><div>${loc('portal_spire_type',[terrain])}</div><div>${loc('portal_spire_mob',[`<span class="has-text-danger">${loc(`portal_mech_boss_${boss}`)}</span>`])}</div>${status}<div>${loc('portal_spire_progress',[progress])}</div>`;
            },
            action(){
                return false;
            }
        },
        waygate: {
            id: 'portal-waygate',
            title: loc('portal_waygate_title'),
            desc(wiki){
                if (!global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) || wiki){
                    return `<div>${loc('portal_waygate_title')}</div><div class="has-text-special">${loc('requires_segmemts',[10])}</div>`;
                }
                else {
                    return `<div>${loc('portal_waygate_title')}</div>`;
                }
            },
            reqs: { waygate: 1 },
            no_queue(){ return global.tech['waygate'] && global.tech.waygate < 2 ? false : true },
            queue_size: 1,
            queue_complete(){ return global.tech['waygate'] && global.tech.waygate >= 2 ? 0 : 10 - global.portal.waygate.count; },
            cost: {
                [global.race.species](wiki){ return !global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) || wiki ? 25 : 0; },
                Money(wiki){ return !global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) || wiki ? 1000000000 : 0; },
                Supply(wiki){ return !global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) || wiki ? 500000 : 0; },
                Blood_Stone(wiki){ return !global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) || wiki ? 5 : 0; },
            },
            powered(){
                return global.portal.hasOwnProperty('waygate') && global.portal.waygate.count >= 10 ? 1 : 0;
            },
            power_reqs: { waygate: 2 },
            effect(){
                if (global.tech['waygate'] && global.tech.waygate >= 2){
                    let progress = global.portal.hasOwnProperty('waygate') ? `<span class="has-text-warning">${+(global.portal.waygate.progress).toFixed(3)}%</span>` : '0%';
                    return `<div>${loc('portal_waygate_open')}</div><div>${loc('portal_waygate_progress',[progress])}</div>`;
                }
                else {
                    let size = 10;
                    let remain = global.portal.hasOwnProperty('waygate') ? size - global.portal.waygate.count : size;
                    return `<div>${loc('portal_waygate_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(){
                if (global.portal.waygate.count < 10 && global.tech['waygate'] && global.tech.waygate === 1 && payCosts($(this)[0].cost)){
                    incrementStruct('waygate','portal');
                    if (global.portal.waygate.count >= 10){
                        global.tech.waygate = 2;
                        global.portal.waygate.count = 1;
                        renderFortress();
                    }
                    return true;
                }
                return false;
            }
        },

    }
};

function spireCreep(base){
    let creep = global.portal.hasOwnProperty('spire') && global.blood['spire'] ? base - ((global.portal.spire.count - 1) / 2500) : base;
    return creep >= 1.01 ? creep : 1.01;
}

const towerSize = (function(){
    var size;
    return function(recalc){
        if (size && !recalc){
            return size;
        }
        size = 1000;
        if (global.hasOwnProperty('pillars')){
            Object.keys(global.pillars).forEach(function(pillar){
                if (global.pillars[pillar]){
                    size -= 12;
                }
            });            
        }
        return size;
    }
})();

function towerPrice(cost){
    let sup = hellSupression('gate');
    return Math.round(cost / (sup.supress > 0.01 ? sup.supress : 0.01));
}

export function soulForgeSoldiers(){
    let soldiers = Math.round(650 / armyRating(1,'hellArmy'));
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
            
            let property = ``;
            if (fortressModules[region].info.hasOwnProperty('prop')){
                property = fortressModules[region].info.prop();
            }

            if (fortressModules[region].info['support']){
                let support = fortressModules[region].info['support'];
                if (fortressModules[region].info['hide_support']){
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3>${property}</div></div>`);
                }
                else {
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3> <span v-show="s_max">{{ support }}/{{ s_max }}</span>${property}</div></div>`);
                }
                vBind({
                    el: `#sr${region}`,
                    data: global.portal[support],
                    filters: {
                        filter(){
                            return fortressModules[region].info.filter(...arguments);
                        }
                    }
                });
            }
            else {
                parent.append(`<div id="${region}" class="space"><div><h3 class="name has-text-warning">${name}</h3>${property}</div></div>`);
            }

            popover(region, function(){
                    return typeof fortressModules[region].info.desc === 'string' ? fortressModules[region].info.desc : fortressModules[region].info.desc();
                },
                {
                    elm: `#${region} h3.name`,
                    classes: `has-background-light has-text-dark`
                }
            );

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
                if (global.portal.hasOwnProperty('guard_post')){
                    min += global.portal.guard_post.on;
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
                if (global.portal.hasOwnProperty('guard_post')){
                    stationed -= global.portal.guard_post.on;
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
    if (global.portal.hasOwnProperty('guard_post')){
        army -= global.portal.guard_post.on;
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
    return Math.round(armyRating(army,'hellArmy',wounded)) + (p_on['turret'] ? p_on['turret'] * turret : 0);
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
            let pat_rating = Math.round(armyRating(pat_size,'hellArmy',hurt));

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
            global.civic.hell_surveyor.assigned = 0;

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
            let attact = global.blood['attract'] ? global.blood.attract * 5 : 0;
            global.portal.soul_forge.kills += p_on['soul_attractor'] * Math.rand(40 + attact, 120 + attact);
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
            let c_max = 10 - p_on['soul_attractor'] > 0 ? 10 - p_on['soul_attractor'] : 1;
            if (global.tech.high_tech >= 16 && !global.tech['corrupt'] && Math.rand(0,c_max + 1) === 0){
                global.resource.Corrupt_Gem.amount++;                  
                global.resource.Corrupt_Gem.display = true;
                messageQueue(loc('portal_corrupt_gem'),'info');
                global.tech['corrupt'] = 1;
                drawTech();
            }
            else {
                global.resource.Soul_Gem.amount++;
            }
        }
    }

    if (global.tech['gate_turret']){
        if (forgeOperating && p_on['gate_turret']){
            let gunKills = 0;
            let min = global.tech.hell_gun >= 2 ? 65 : 40;
            let max = global.tech.hell_gun >= 2 ? 100 : 60;
            for (let i=0; i<p_on['gate_turret']; i++){
                gunKills += Math.rand(min,max);
            }
            global.portal.soul_forge.kills += gunKills;
            global.stats.dkills += gunKills;
            let gun_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 2700 : 3000;
            for (let i=0; i<p_on['gate_turret']; i++){
                if (Math.rand(0,Math.round(gun_base)) === 0){
                    global.resource.Soul_Gem.amount++;
                }
            }
        }
    }
}

export function hellSupression(area, val){
    switch (area){
        case 'ruins':
            {
                let army = val || p_on['guard_post'];
                let arc = (p_on['arcology'] || 0) * 75;
                let aRating = armyRating(army,'hellArmy',0);
                if (global.race['holy']){
                    aRating *= 1 + (traits.holy.vars[1] / 100);
                }
                let supress = (aRating + arc) / 5000;
                return {
                    supress: supress > 1 ? 1 : supress,
                    rating: aRating + arc
                };
            }
        case 'gate':
            {
                let gSup = hellSupression('ruins',val);
                let turret = (p_on['gate_turret'] || 0) * 100;
                if (global.race['holy']){
                    turret *= 1 + (traits.holy.vars[1] / 100);
                }
                let supress = (gSup.rating + turret) / 7500;
                return {
                    supress: supress > 1 ? 1 : supress,
                    rating: gSup.rating + turret
                };
            }
        default:
            return 0;
    }
}

export const monsters = {
    fire_elm: {
        weapon: {
            laser: 1.05,
            flame: 0,
            plasma: 0.25,
            kinetic: 0.5,
            missile: 0.5,
            sonic: 1,
            shotgun: 0.75,
            tesla: 0.65
        },
        nozone: {
            freeze: true,
            flooded: true,
        },
        amp: {
            hot: 1.75,
            humid: 0.8,
            steam: 0.9,
        }
    },
    water_elm: {
        weapon: {
            laser: 0.65,
            flame: 0.5,
            plasma: 1,
            kinetic: 0.2,
            missile: 0.5,
            sonic: 0.5,
            shotgun: 0.25,
            tesla: 0.75
        },
        nozone: {
            hot: true,
            freeze: true,
        },
        amp: {
            steam: 1.5,
            river: 1.1,
            flooded: 2,
            rain: 1.75,
            humid: 1.25,
        }
    },
    rock_golem: {
        weapon: {
            laser: 1,
            flame: 0.5,
            plasma: 1,
            kinetic: 0.65,
            missile: 0.95,
            sonic: 0.75,
            shotgun: 0.35,
            tesla: 0
        },
        nozone: {},
        amp: {}
    },
    bone_golem: {
        weapon: {
            laser: 0.45,
            flame: 0.35,
            plasma: 0.55,
            kinetic: 1,
            missile: 1,
            sonic: 0.75,
            shotgun: 0.75,
            tesla: 0.15
        },
        nozone: {},
        amp: {}
    },
    mech_dino: {
        weapon: {
            laser: 0.85,
            flame: 0.05,
            plasma: 0.55,
            kinetic: 0.45,
            missile: 0.5,
            sonic: 0.35,
            shotgun: 0.5,
            tesla: 1
        },
        nozone: {},
        amp: {}
    },
    plant: {
        weapon: {
            laser: 0.42,
            flame: 1,
            plasma: 0.65,
            kinetic: 0.2,
            missile: 0.25,
            sonic: 0.75,
            shotgun: 0.35,
            tesla: 0.38
        },
        nozone: {},
        amp: {}
    },
    crazed: {
        weapon: {
            laser: 0.5,
            flame: 0.85,
            plasma: 0.65,
            kinetic: 1,
            missile: 0.35,
            sonic: 0.15,
            shotgun: 0.95,
            tesla: 0.6
        },
        nozone: {},
        amp: {}
    },
    minotaur: {
        weapon: {
            laser: 0.32,
            flame: 0.5,
            plasma: 0.82,
            kinetic: 0.44,
            missile: 1,
            sonic: 0.15,
            shotgun: 0.2,
            tesla: 0.35
        },
        nozone: {},
        amp: {}
    },
    ooze: {
        weapon: {
            laser: 0.2,
            flame: 0.65,
            plasma: 1,
            kinetic: 0,
            missile: 0,
            sonic: 0.85,
            shotgun: 0,
            tesla: 0.15
        },
        nozone: {},
        amp: {}
    },
    zombie: {
        weapon: {
            laser: 0.35,
            flame: 1,
            plasma: 0.45,
            kinetic: 0.08,
            missile: 0.8,
            sonic: 0.18,
            shotgun: 0.95,
            tesla: 0.05
        },
        nozone: {},
        amp: {}
    },
    raptor: {
        weapon: {
            laser: 0.68,
            flame: 0.55,
            plasma: 0.85,
            kinetic: 1,
            missile: 0.44,
            sonic: 0.22,
            shotgun: 0.33,
            tesla: 0.66
        },
        nozone: {},
        amp: {}
    },
    frost_giant: {
        weapon: {
            laser: 0.9,
            flame: 0.82,
            plasma: 1,
            kinetic: 0.25,
            missile: 0.08,
            sonic: 0.45,
            shotgun: 0.28,
            tesla: 0.5
        },
        nozone: {
            hot: true
        },
        amp: {
            freeze: 2.5,
            hail: 1.65
        }
    },
    swarm: {
        weapon: {
            laser: 0.02,
            flame: 1,
            plasma: 0.04,
            kinetic: 0.01,
            missile: 0.08,
            sonic: 0.66,
            shotgun: 0.38,
            tesla: 0.45
        },
        nozone: {},
        amp: {}
    },
    dragon: {
        weapon: {
            laser: 0.18,
            flame: 0,
            plasma: 0.12,
            kinetic: 0.35,
            missile: 1,
            sonic: 0.22,
            shotgun: 0.65,
            tesla: 0.15
        },
        nozone: {},
        amp: {}
    },
    mech_dragon: {
        weapon: {
            laser: 0.84,
            flame: 0.1,
            plasma: 0.68,
            kinetic: 0.18,
            missile: 0.75,
            sonic: 0.22,
            shotgun: 0.28,
            tesla: 1
        },
        nozone: {},
        amp: {}
    },
    construct: {
        weapon: {
            laser: 0.5,
            flame: 0.2,
            plasma: 0.6,
            kinetic: 0.34,
            missile: 0.9,
            sonic: 0.08,
            shotgun: 0.28,
            tesla: 1
        },
        nozone: {},
        amp: {}
    },
    beholder: {
        weapon: {
            laser: 0.75,
            flame: 0.15,
            plasma: 1,
            kinetic: 0.45,
            missile: 0.05,
            sonic: 0.01,
            shotgun: 0.12,
            tesla: 0.3
        },
        nozone: {},
        amp: {}
    },
    worm: {
        weapon: {
            laser: 0.55,
            flame: 0.38,
            plasma: 0.45,
            kinetic: 0.2,
            missile: 0.05,
            sonic: 1,
            shotgun: 0.02,
            tesla: 0.01
        },
        nozone: {},
        amp: {}
    },
    hydra: {
        weapon: {
            laser: 0.85,
            flame: 0.75,
            plasma: 0.85,
            kinetic: 0.25,
            missile: 0.45,
            sonic: 0.5,
            shotgun: 0.6,
            tesla: 0.65
        },
        nozone: {},
        amp: {}
    },
    colossus: {
        weapon: {
            laser: 1,
            flame: 0.05,
            plasma: 0.75,
            kinetic: 0.45,
            missile: 1,
            sonic: 0.35,
            shotgun: 0.35,
            tesla: 0.5
        },
        nozone: {},
        amp: {}
    },
    lich: {
        weapon: {
            laser: 0.1,
            flame: 0.1,
            plasma: 0.1,
            kinetic: 0.45,
            missile: 0.75,
            sonic: 0.35,
            shotgun: 0.75,
            tesla: 0.5
        },
        nozone: {},
        amp: {}
    },
    ape: {
        weapon: {
            laser: 1,
            flame: 0.95,
            plasma: 0.85,
            kinetic: 0.5,
            missile: 0.5,
            sonic: 0.05,
            shotgun: 0.35,
            tesla: 0.68
        },
        nozone: {},
        amp: {}
    },
    bandit: {
        weapon: {
            laser: 0.65,
            flame: 0.5,
            plasma: 0.85,
            kinetic: 1,
            missile: 0.5,
            sonic: 0.25,
            shotgun: 0.75,
            tesla: 0.25
        },
        nozone: {},
        amp: {}
    },
    croc: {
        weapon: {
            laser: 0.65,
            flame: 0.05,
            plasma: 0.6,
            kinetic: 0.5,
            missile: 0.5,
            sonic: 1,
            shotgun: 0.2,
            tesla: 0.75
        },
        nozone: {},
        amp: {}
    },
    djinni: {
        weapon: {
            laser: 0,
            flame: 0.35,
            plasma: 1,
            kinetic: 0.15,
            missile: 0,
            sonic: 0.65,
            shotgun: 0.22,
            tesla: 0.4
        },
        nozone: {},
        amp: {}
    },
    snake: {
        weapon: {
            laser: 0.5,
            flame: 0.5,
            plasma: 0.5,
            kinetic: 0.5,
            missile: 0.5,
            sonic: 0.5,
            shotgun: 0.5,
            tesla: 0.5
        },
        nozone: {},
        amp: {}
    },
    centipede: {
        weapon: {
            laser: 0.5,
            flame: 0.85,
            plasma: 0.95,
            kinetic: 0.65,
            missile: 0.6,
            sonic: 0,
            shotgun: 0.5,
            tesla: 0.01
        },
        nozone: {},
        amp: {}
    },
    spider: {
        weapon: {
            laser: 0.65,
            flame: 1,
            plasma: 0.22,
            kinetic: 0.75,
            missile: 0.15,
            sonic: 0.38,
            shotgun: 0.9,
            tesla: 0.18
        },
        nozone: {},
        amp: {}
    },
    manticore: {
        weapon: {
            laser: 0.05,
            flame: 0.25,
            plasma: 0.95,
            kinetic: 0.5,
            missile: 0.15,
            sonic: 0.48,
            shotgun: 0.4,
            tesla: 0.6
        },
        nozone: {},
        amp: {}
    },
    fiend: {
        weapon: {
            laser: 0.75,
            flame: 0.25,
            plasma: 0.5,
            kinetic: 0.25,
            missile: 0.75,
            sonic: 0.25,
            shotgun: 0.5,
            tesla: 0.5
        },
        nozone: {},
        amp: {}
    },
    bat: {
        weapon: {
            laser: 0.16,
            flame: 0.18,
            plasma: 0.12,
            kinetic: 0.25,
            missile: 0.02,
            sonic: 1,
            shotgun: 0.9,
            tesla: 0.58
        },
        nozone: {},
        amp: {}
    },
    medusa: {
        weapon: {
            laser: 0.35,
            flame: 0.1,
            plasma: 0.3,
            kinetic: 0.95,
            missile: 1,
            sonic: 0.15,
            shotgun: 0.88,
            tesla: 0.26
        },
        nozone: {},
        amp: {}
    },
    ettin: {
        weapon: {
            laser: 0.5,
            flame: 0.35,
            plasma: 0.8,
            kinetic: 0.5,
            missile: 0.25,
            sonic: 0.3,
            shotgun: 0.6,
            tesla: 0.09
        },
        nozone: {},
        amp: {}
    },
    faceless: {
        weapon: {
            laser: 0.6,
            flame: 0.28,
            plasma: 0.6,
            kinetic: 0,
            missile: 0.05,
            sonic: 0.8,
            shotgun: 0.15,
            tesla: 1
        },
        nozone: {},
        amp: {}
    },
    enchanted: {
        weapon: {
            laser: 1,
            flame: 0.02,
            plasma: 0.95,
            kinetic: 0.2,
            missile: 0.7,
            sonic: 0.05,
            shotgun: 0.65,
            tesla: 0.01
        },
        nozone: {},
        amp: {}
    },
    gargoyle: {
        weapon: {
            laser: 0.15,
            flame: 0.4,
            plasma: 0.3,
            kinetic: 0.5,
            missile: 0.5,
            sonic: 0.85,
            shotgun: 1,
            tesla: 0.2
        },
        nozone: {},
        amp: {}
    },
    chimera: {
        weapon: {
            laser: 0.38,
            flame: 0.6,
            plasma: 0.42,
            kinetic: 0.85,
            missile: 0.35,
            sonic: 0.5,
            shotgun: 0.65,
            tesla: 0.8
        },
        nozone: {},
        amp: {}
    },
    gorgon: {
        weapon: {
            laser: 0.65,
            flame: 0.65,
            plasma: 0.65,
            kinetic: 0.65,
            missile: 0.65,
            sonic: 0.65,
            shotgun: 0.65,
            tesla: 0.65
        },
        nozone: {},
        amp: {}
    },
    kraken: {
        weapon: {
            laser: 0.75,
            flame: 0.35,
            plasma: 0.75,
            kinetic: 0.35,
            missile: 0.5,
            sonic: 0.18,
            shotgun: 0.05,
            tesla: 0.85
        },
        nozone: {},
        amp: {}
    },
    homunculus: {
        weapon: {
            laser: 0.05,
            flame: 1,
            plasma: 0.1,
            kinetic: 0.85,
            missile: 0.65,
            sonic: 0.5,
            shotgun: 0.75,
            tesla: 0.2
        },
        nozone: {},
        amp: {}
    }
};

export function drawMechLab(){    
    clearElement($('#mechLab'));
    if (global.portal.hasOwnProperty('mechbay') && global.settings.showMechLab){
        let lab = $(`#mechLab`);

        if (!global.portal.mechbay.hasOwnProperty('blueprint')){
            global.portal.mechbay['blueprint'] = {
                size: 'small',
                hardpoint: ['laser'],
                chassis: 'tread',
                equip: []
            };
        }

        let assemble = $(`<div id="mechAssembly" class="mechAssembly"></div>`);
        lab.append(assemble);

        let title = $(`<div><span class="has-text-caution">${loc(`portal_mech_assembly`)}</span> - <span>{{ b.size | slabel }} {{ b.chassis | clabel }}</span></div>`);
        assemble.append(title);

        title.append(` | <span><span class="has-text-warning">${loc('portal_mech_bay_space')}</span>: {{ m.bay }} / {{ m.max }}</span>`);
        title.append(` | <span><span class="has-text-warning">${loc('portal_mech_sup_avail')}</span>: {{ p.supply | round }} / {{ p.sup_max }}</span>`);

        assemble.append(`<div><span class="has-text-warning">${loc(`portal_mech_space`)}</span> <span class="has-text-danger">{{ b.size | bay }}</span> | <span class="has-text-warning">${loc(`portal_mech_cost`)}</span> <span class="has-text-danger">{{ b.size | price }}</span> | <span class="has-text-warning">${loc(`portal_mech_soul`,[global.resource.Soul_Gem.name])}</span> <span class="has-text-danger">{{ b.size | soul }}</span></div>`)
        assemble.append(`<div>{{ b.size | desc }}</div>`);

        let options = $(`<div class="bayOptions"></div>`);
        assemble.append(options);

        let sizes = ``;
        ['small','medium','large','titan'].forEach(function(size){
            sizes += `<b-dropdown-item aria-role="listitem" v-on:click="setSize('${size}')" class="size r0" data-val="${size}">${loc(`portal_mech_size_${size}`)}</b-dropdown-item>`;
        });

        options.append(`<b-dropdown :triggers="['hover']" aria-role="list">
            <button class="button is-info" slot="trigger">
                <span>${loc(`portal_mech_size`)}: {{ b.size | slabel }}</span>
                <b-icon icon="menu-down"></b-icon>
            </button>${sizes}
        </b-dropdown>`);

        let chassis = ``;
        ['wheel','tread','biped','quad','spider','hover'].forEach(function(val){
            chassis += `<b-dropdown-item aria-role="listitem" v-on:click="setType('${val}')" class="chassis r0" data-val="${val}">${loc(`portal_mech_chassis_${val}`)}</b-dropdown-item>`;
        });

        options.append(`<b-dropdown :triggers="['hover']" aria-role="list">
            <button class="button is-info" slot="trigger">
                <span>${loc(`portal_mech_type`)}: {{ b.chassis | clabel }}</span>
                <b-icon icon="menu-down"></b-icon>
            </button>${chassis}
        </b-dropdown>`);

        for (let i=0; i<2; i++){
            let weapons = ``;
            ['laser','kinetic','shotgun','missile','flame','plasma','sonic','tesla'].forEach(function(val){
                weapons += `<b-dropdown-item aria-role="listitem" v-on:click="setWep('${val}',${i})" class="weapon r${i}" data-val="${val}">${loc(`portal_mech_weapon_${val}`)}</b-dropdown-item>`;
            });

            options.append(`<b-dropdown :triggers="['hover']" aria-role="list" v-show="vis(${i})">
                <button class="button is-info" slot="trigger">
                    <span>${loc(`portal_mech_weapon`)}: {{ b.hardpoint[${i}] || 'laser' | wlabel }}</span>
                    <b-icon icon="menu-down"></b-icon>
                </button>${weapons}
            </b-dropdown>`);
        }

        let e_cap = global.blood['prepared'] ? 4 : 3;
        for (let i=0; i<e_cap; i++){
            let equip = ``;
            ['shields','sonar','grapple','infrared','flare','radiator','coolant','ablative','stabilizer','seals'].forEach(function(val){
                equip += `<b-dropdown-item aria-role="listitem" v-on:click="setEquip('${val}',${i})" class="equip r${i}" data-val="${val}">${loc(`portal_mech_equip_${val}`)}</b-dropdown-item>`;
            });

            options.append(`<b-dropdown :triggers="['hover']" aria-role="list" v-show="eVis(${i})">
                <button class="button is-info" slot="trigger">
                    <span>${loc(`portal_mech_equipment`)}: {{ b.equip[${i}] || 'shields' | elabel }}</span>
                    <b-icon icon="menu-down"></b-icon>
                </button>${equip}
            </b-dropdown>`);
        }

        assemble.append(`<div class="mechAssemble"><button class="button is-info" slot="trigger" v-on:click="build()"><span>${loc('portal_mech_construct')}</span></button></div>`);

        vBind({
            el: '#mechAssembly',
            data: {
                p: global.portal.purifier,
                m: global.portal.mechbay,
                b: global.portal.mechbay.blueprint
            },
            methods: {
                build(){
                    let cost = 10000000;
                    let size = 25;
                    let soul = 10;
                    switch (global.portal.mechbay.blueprint.size){
                        case 'small':
                            cost = global.blood['prepared'] && global.blood.prepared >= 2 ? 50000 : 75000;
                            size = 2;
                            soul = 1;
                            break;
                        case 'medium':
                            cost = 180000;
                            size = 5;
                            soul = 2;
                            break;
                        case 'large':
                            cost = 375000;
                            size = 10;
                            soul = 5;
                            break;
                        case 'titan':
                            cost = 750000;
                            size = 25;
                            soul = 10;
                            break;
                    }

                    let avail = global.portal.mechbay.max - global.portal.mechbay.bay;
                    if (global.portal.purifier.supply >= cost && avail >= size && global.resource.Soul_Gem.amount >= soul){
                        global.portal.purifier.supply -= cost;
                        global.resource.Soul_Gem.amount -= soul;
                        let mech = deepClone(global.portal.mechbay.blueprint);
                        global.portal.mechbay.mechs.push(mech);
                        global.portal.mechbay.bay += size;
                        drawMechs();
                    }
                },
                setSize(s){
                    global.portal.mechbay.blueprint.size = s;
                    if (s === 'small' || s === 'medium'){
                        global.portal.mechbay.blueprint.hardpoint.length = 1;
                    }
                    else {
                        if (global.portal.mechbay.blueprint.hardpoint.length === 1){
                            global.portal.mechbay.blueprint.hardpoint.push(global.portal.mechbay.blueprint.hardpoint[0]);
                        }
                    }
                    switch (s){
                        case 'small':
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push('infrared');
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 1 : 0;
                            break;
                        case 'medium':
                            if (global.portal.mechbay.blueprint.equip.length < 1){
                                global.portal.mechbay.blueprint.equip.push('shields');
                            }
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push('infrared');
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 2 : 1;
                            break;
                        case 'large':
                            if (global.portal.mechbay.blueprint.equip.length < 1){
                                global.portal.mechbay.blueprint.equip.push('shields');
                            }
                            if (global.portal.mechbay.blueprint.equip.length < 2){
                                global.portal.mechbay.blueprint.equip.push('sonar');
                            }
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push('infrared');
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 3 : 2;
                            break;
                        case 'titan':
                            if (global.portal.mechbay.blueprint.equip.length < 1){
                                global.portal.mechbay.blueprint.equip.push('shields');
                            }
                            if (global.portal.mechbay.blueprint.equip.length < 2){
                                global.portal.mechbay.blueprint.equip.push('sonar');
                            }
                            if (global.portal.mechbay.blueprint.equip.length < 3){
                                global.portal.mechbay.blueprint.equip.push('grapple');
                            }
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push('infrared');
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 4 : 3;
                            break;
                    }
                },
                setType(c){
                    global.portal.mechbay.blueprint.chassis = c;
                },
                setWep(w,i){
                    global.portal.mechbay.blueprint.hardpoint[i] = w;
                    vBind({el: `#mechAssembly`},'update');
                },
                setEquip(e,i){
                    global.portal.mechbay.blueprint.equip[i] = e;
                    vBind({el: `#mechAssembly`},'update');
                },
                vis(hp){
                    if (hp === 0 || global.portal.mechbay.blueprint.size === 'large' || global.portal.mechbay.blueprint.size === 'titan'){
                        return true;
                    }
                    return false;
                },
                eVis(es){
                    let prep = global.blood['prepared'] ? 1 : 0;
                    switch (global.portal.mechbay.blueprint.size){
                        case 'small':
                            return prep === 1 && es === 0 ? true : false;
                        case 'medium':
                            return es <= (0 + prep) ? true : false;
                        case 'large':
                            return es <= (1 + prep) ? true : false;
                        case 'titan':
                            return true;
                    }
                }
            },
            filters: {
                bay(s){
                    switch (s){
                        case 'small':
                            return 2;
                        case 'medium':
                            return global.blood['prepared'] && global.blood.prepared >= 2 ? 4 : 5;
                        case 'large':
                            return global.blood['prepared'] && global.blood.prepared >= 2 ? 8 : 10;
                        case 'titan':
                            return global.blood['prepared'] && global.blood.prepared >= 2 ? 20 : 25;
                    }
                },
                price(s){
                    switch (s){
                        case 'small':
                            return global.blood['prepared'] && global.blood.prepared >= 2 ? 50000 : 75000;
                        case 'medium':
                            return 180000;
                        case 'large':
                            return 375000;
                        case 'titan':
                            return 750000;
                    }
                },
                soul(s){
                    switch (s){
                        case 'small':
                            return 1
                        case 'medium':
                            return 2;
                        case 'large':
                            return 5;
                        case 'titan':
                            return 10;
                    }
                },
                slabel(s){
                    return loc(`portal_mech_size_${s}`);
                },
                clabel(c){
                    return loc(`portal_mech_chassis_${c}`);
                },
                wlabel(w){
                    return loc(`portal_mech_weapon_${w}`);
                },
                elabel(e){
                    return loc(`portal_mech_equip_${e}`);
                },
                desc(s){
                    return loc(`portal_mech_size_${s}_desc`);
                },
                round(v){
                    return Math.round(v);
                }
            }
        });

        ['size','chassis','weapon','equip'].forEach(function(type){
            let range = 1;
            if (type === 'weapon'){
                range = 2;
            }
            else if (type === 'equip'){
                range = e_cap;
            }

            for (let idx=0; idx<range; idx++){
                popover(`mechAssembly${type}${idx}`, function(obj){
                    return loc(`portal_mech_${type}_${$(obj.this).attr(`data-val`)}_desc`);
                },
                {
                    elm: `#mechAssembly .${type}.r${idx}`,
                    prop: {
                        modifiers: {
                            preventOverflow: { enabled: false },
                            hide: { enabled: false },
                            flip: {
                                behavior: ['left','right']
                            }
                        },
                        placement: 'right'
                    }
                });
            }
        });

        let mechs = $(`<div id="mechList"></div>`);
        lab.append(mechs);
        drawMechs();
    }
}

function drawMechs(){
    clearElement($('#mechList'));
    let list = $('#mechList');
    for (let i=0; i<global.portal.mechbay.mechs.length; i++){
        let mech = global.portal.mechbay.mechs[i];
        let desc = $(`<div><a @click="scrap(${i})">${loc(`portal_mech_scrap`)}</a> | <span>${loc(`portal_mech`)} #${i+1}</span>: <span class="has-text-caution">${loc(`portal_mech_size_${mech.size}`)} ${loc(`portal_mech_chassis_${mech.chassis}`)}</span></div>`);
        mech.hardpoint.forEach(function(hp){
            desc.append(` | <span class="has-text-danger">${loc(`portal_mech_weapon_${hp}`)}</span>`);
        });
        mech.equip.forEach(function(eq){
            desc.append(` | <span class="has-text-warning">${loc(`portal_mech_equip_${eq}`)}</span>`);
        });
        list.append(desc);
    }

    vBind({
        el: '#mechList',
        data: global.portal.mechbay.mechs,
        methods: {
            scrap(id){
                switch (global.portal.mechbay.mechs[id].size){
                    case 'small':
                        global.portal.purifier.supply += 25000;
                        break;
                    case 'medium':
                        global.portal.purifier.supply += 60000;
                        break;
                    case 'large':
                        global.portal.purifier.supply += 125000;
                        break;
                    case 'titan':
                        global.portal.purifier.supply += 250000;
                        break;
                }
                if (global.portal.purifier.supply > global.portal.purifier.sup_max){
                    global.portal.purifier.supply = global.portal.purifier.sup_max;
                }
                global.portal.mechbay.mechs.splice(id,1);
                drawMechs();
            }
        }
    });
}

export function genSpireFloor(){
    let types = ['sand','swamp','forest','jungle','rocky','gravel','muddy','grass','brush'];
    global.portal.spire.type = types[Math.floor(Math.seededRandom(0,types.length))];
    if (global.portal.spire.count >= 10){
        global.portal.spire.status = {};
        let effects = ['freeze','hot','corrosive','humid','windy','hilly','mountain','radioactive','quake','dust','river','tar','steam','flooded','fog','rain','hail','chasm','dark','gravity'];
        assignValidStatus(effects[Math.floor(Math.seededRandom(0,effects.length))]);
        
        if (global.portal.spire.count >= 25 && global.portal.spire.count <= 100){
            let odds = 105 - global.portal.spire.count;
            if (Math.floor(Math.seededRandom(0,odds) <= 5)){
                assignValidStatus(effects[Math.floor(Math.seededRandom(0,effects.length))]);
            }
        }
        else if (global.portal.spire.count > 100 && global.portal.spire.count <= 250){
            assignValidStatus(effects[Math.floor(Math.seededRandom(0,effects.length))]);
            let odds = 260 - global.portal.spire.count;
            if (Math.floor(Math.seededRandom(0,odds) <= 10)){
                assignValidStatus(effects[Math.floor(Math.seededRandom(0,effects.length))]);
            }
        }
        else if (global.portal.spire.count > 250 && global.portal.spire.count <= 1000){
            assignValidStatus(effects[Math.floor(Math.seededRandom(0,effects.length))]);
            assignValidStatus(effects[Math.floor(Math.seededRandom(0,effects.length))]);
            let odds = 1025 - global.portal.spire.count;
            if (Math.floor(Math.seededRandom(0,odds) <= 25)){
                assignValidStatus(effects[Math.floor(Math.seededRandom(0,effects.length))]);
            }
        }
        else if (global.portal.spire.count > 1000){
            assignValidStatus(effects[Math.floor(Math.seededRandom(0,effects.length))]);
            assignValidStatus(effects[Math.floor(Math.seededRandom(0,effects.length))]);
            assignValidStatus(effects[Math.floor(Math.seededRandom(0,effects.length))]);
        }
    }

    let mobs = Object.keys(monsters).filter(function (k){
        let exclude = Object.keys(monsters[k].nozone);
        if (exclude.some(i => Object.keys(global.portal.spire.status).includes(i)) || exclude.includes(global.portal.spire.type)){
            return false;
        }
        return true;
    });
    global.portal.spire.boss = mobs[Math.floor(Math.seededRandom(0,mobs.length))];
}

function assignValidStatus(effect){
    if (global.portal.spire.status['freeze'] || global.portal.spire.status['hot']){
        if (effect !== 'freeze' && effect !== 'hot'){
            global.portal.spire.status[effect] = true;
        }
    }
    else if (global.portal.spire.status['rain'] || global.portal.spire.status['hail']){
        if (effect !== 'rain' && effect !== 'hail'){
            global.portal.spire.status[effect] = true;
        }
    }
    else {
        global.portal.spire.status[effect] = true;
    }
}

export function mechRating(mech,boss){
    let rating = 0;
    switch (mech.size){
        case 'small':
            rating = 0.002;
            break;
        case 'medium':
            rating = 0.005;
            break;
        case 'large':
            rating = 0.01;
            break;
        case 'titan':
            rating = 0.02;
            break;
    }

    if (boss){
        if (global.stats.achieve['gladiator'] && global.stats.achieve.gladiator.l > 0){
            rating *= 1 + global.stats.achieve.gladiator.l * 0.1;
        }
        if (global.blood['wrath']){
            rating *= 1 + (global.blood.wrath / 20);
        }

        let affix = universeAffix();
        if (global.stats.spire.hasOwnProperty(affix) && global.stats.spire[affix].hasOwnProperty('lord')){
            global.stats.spire[affix].lord;
            rating /= 100 + (global.stats.spire[affix].lord * 25);
        }
        else {
            rating /= 100;
        }

        let damage = 0;
        for (let i=0; i<mech.hardpoint.length; i++){
            damage += rating;
        }
        return damage;
    }
    else {
        if (global.stats.achieve['gladiator'] && global.stats.achieve.gladiator.l > 0){
            rating *= 1 + global.stats.achieve.gladiator.l * 0.2;
        }
        if (global.blood['wrath']){
            rating *= 1 + (global.blood.wrath / 20);
        }

        switch (mech.chassis){
            case 'wheel':
                {
                    switch (global.portal.spire.type){
                        case 'sand':
                            rating *= ['small','medium'].includes(mech.size) ? 0.9 : 0.85;
                            break;
                        case 'swamp':
                            rating *= ['small','medium'].includes(mech.size) ? 0.35 : 0.25;
                            break;
                        case 'jungle':
                            rating *= ['small','medium'].includes(mech.size) ? 0.92 : 0.85;
                            break;
                        case 'rocky':
                            rating *= ['small','medium'].includes(mech.size) ? 0.65 : 0.5;
                            break;
                        case 'gravel':
                            rating *= ['small','medium'].includes(mech.size) ? 1 : 0.95;
                            break;
                        case 'muddy':
                            rating *= ['small','medium'].includes(mech.size) ? 0.85 : 0.65;
                            break;
                        case 'grass':
                            rating *= ['small','medium'].includes(mech.size) ? 1.3 : 1.2;
                            break;
                        case 'brush':
                            rating *= ['small','medium'].includes(mech.size) ? 0.9 : 0.8;
                            break;
                    }
                }
                break;
            case 'tread':
                {
                    switch (global.portal.spire.type){
                        case 'sand':
                            rating *= ['small','medium'].includes(mech.size) ? 1.15 : 1.1;
                            break;
                        case 'swamp':
                            rating *= ['small','medium'].includes(mech.size) ? 0.55 : 0.45;
                            break;
                        case 'forest':
                            rating *= ['small','medium'].includes(mech.size) ? 1 : 0.95;
                            break;
                        case 'jungle':
                            rating *= ['small','medium'].includes(mech.size) ? 0.95 : 0.9;
                            break;
                        case 'rocky':
                            rating *= ['small','medium'].includes(mech.size) ? 0.65 : 0.5;
                            break;
                        case 'gravel':
                            rating *= ['small','medium'].includes(mech.size) ? 1.3 : 1.2;
                            break;
                        case 'muddy':
                            rating *= ['small','medium'].includes(mech.size) ? 0.88 : 0.75;
                            break;
                    }
                }
                break;
            case 'biped':
                {
                    switch (global.portal.spire.type){
                        case 'sand':
                            rating *= ['small','medium'].includes(mech.size) ? 0.78 : 0.65;
                            break;
                        case 'swamp':
                            rating *= ['small','medium'].includes(mech.size) ? 0.68 : 0.55;
                            break;
                        case 'forest':
                            rating *= ['small','medium'].includes(mech.size) ? 1 : 0.95;
                            break;
                        case 'jungle':
                            rating *= ['small','medium'].includes(mech.size) ? 0.82 : 0.7;
                            break;
                        case 'rocky':
                            rating *= ['small','medium'].includes(mech.size) ? 0.48 : 0.4;
                            break;
                        case 'muddy':
                            rating *= ['small','medium'].includes(mech.size) ? 0.85 : 0.75;
                            break;
                        case 'grass':
                            rating *= ['small','medium'].includes(mech.size) ? 1.25 : 1.2;
                            break;
                        case 'brush':
                            rating *= ['small','medium'].includes(mech.size) ? 0.92 : 0.85;
                            break;
                    }
                }
                break;
            case 'quad':
                {
                    switch (global.portal.spire.type){
                        case 'sand':
                            rating *= ['small','medium'].includes(mech.size) ? 0.86 : 0.75;
                            break;
                        case 'swamp':
                            rating *= ['small','medium'].includes(mech.size) ? 0.58 : 0.45;
                            break;
                        case 'forest':
                            rating *= ['small','medium'].includes(mech.size) ? 1.25 : 1.2;
                            break;
                        case 'rocky':
                            rating *= ['small','medium'].includes(mech.size) ? 0.95 : 0.9;
                            break;
                        case 'gravel':
                            rating *= ['small','medium'].includes(mech.size) ? 0.9 : 0.8;
                            break;
                        case 'muddy':
                            rating *= ['small','medium'].includes(mech.size) ? 0.68 : 0.55;
                            break;
                        case 'grass':
                            rating *= ['small','medium'].includes(mech.size) ? 1 : 0.95;
                            break;
                        case 'brush':
                            rating *= ['small','medium'].includes(mech.size) ? 0.95 : 0.9;
                            break;
                    }
                }
                break;
            case 'spider':
                {
                    switch (global.portal.spire.type){
                        case 'sand':
                            rating *= ['small','medium'].includes(mech.size) ? 0.75 : 0.65;
                            break;
                        case 'swamp':
                            rating *= ['small','medium'].includes(mech.size) ? 0.9 : 0.8;
                            break;
                        case 'forest':
                            rating *= ['small','medium'].includes(mech.size) ? 0.82 : 0.75;
                            break;
                        case 'jungle':
                            rating *= ['small','medium'].includes(mech.size) ? 0.77 : 0.65;
                            break;
                        case 'rocky':
                            rating *= ['small','medium'].includes(mech.size) ? 1.25 : 1.2;
                            break;
                        case 'gravel':
                            rating *= ['small','medium'].includes(mech.size) ? 0.86 : 0.75;
                            break;
                        case 'muddy':
                            rating *= ['small','medium'].includes(mech.size) ? 0.92 : 0.85;
                            break;
                        case 'brush':
                            rating *= ['small','medium'].includes(mech.size) ? 1 : 0.95;
                            break;
                    }
                }
                break;
            case 'hover':
                {
                    switch (global.portal.spire.type){
                        case 'swamp':
                            rating *= ['small','medium'].includes(mech.size) ? 1.3 : 1.2;
                            break;
                        case 'forest':
                            rating *= ['small','medium'].includes(mech.size) ? 0.74 : 0.65;
                            break;
                        case 'jungle':
                            rating *= ['small','medium'].includes(mech.size) ? 0.6 : 0.5;
                            break;
                        case 'rocky':
                            rating *= ['small','medium'].includes(mech.size) ? 0.82 : 0.75;
                            break;
                        case 'muddy':
                            rating *= ['small','medium'].includes(mech.size) ? 1.15 : 1.1;
                            break;
                        case 'brush':
                            rating *= ['small','medium'].includes(mech.size) ? 0.78 : 0.7;
                            break;
                    }
                }
                break;
        }

        Object.keys(global.portal.spire.status).forEach(function(effect){
            switch (effect){
                case 'freeze':
                    {
                        if (!mech.equip.includes('radiator')){
                            rating *= 0.25;
                        }
                    }
                    break;
                case 'hot':
                    {
                        if (!mech.equip.includes('coolant')){
                            rating *= 0.25;
                        }
                    }
                    break;
                case 'corrosive':
                    {
                        if (!mech.equip.includes('ablative')){
                            rating *= mech.equip.includes('shields') ? 0.75 : 0.25;
                        }
                    }
                    break;
                case 'humid':
                    {
                        if (!mech.equip.includes('seals')){
                            rating *= 0.75;
                        }
                    }
                    break;
                case 'windy':
                    {
                        if (mech.chassis === 'hover'){
                            rating *= 0.5;
                        }
                    }
                    break;
                case 'hilly':
                    {
                        if (mech.chassis !== 'spider'){
                            rating *= 0.75;
                        }
                    }
                    break;
                case 'mountain':
                    {
                        if (mech.chassis !== 'spider' && !mech.equip.includes('grapple')){
                            rating *= mech.equip.includes('flare') ? 0.75 : 0.5;
                        }
                    }
                    break;
                case 'radioactive':
                    {
                        if (!mech.equip.includes('shields')){
                            rating *= 0.5;
                        }
                    }
                    break;
                case 'quake':
                    {
                        if (!mech.equip.includes('stabilizer')){
                            rating *= 0.25;
                        }
                    }
                    break;
                case 'dust':
                    {
                        if (!mech.equip.includes('seals')){
                            rating *= 0.5;
                        }
                    }
                    break;
                case 'river':
                    {
                        if (mech.chassis !== 'hover'){
                            rating *= 0.65;
                        }
                    }
                    break;
                case 'tar':
                    {
                        if (mech.chassis !== 'quad'){
                            rating *= mech.chassis === 'tread' || mech.chassis === 'wheel' ? 0.5 : 0.75;
                        }
                    }
                    break;
                case 'steam':
                    {
                        if (!mech.equip.includes('shields')){
                            rating *= 0.75;
                        }
                    }
                    break;
                case 'flooded':
                    {
                        if (mech.chassis !== 'hover'){
                            rating *= 0.35;
                        }
                    }
                    break;
                case 'fog':
                    {
                        if (!mech.equip.includes('sonar')){
                            rating *= 0.2;
                        }
                    }
                    break;
                case 'rain':
                    {
                        if (!mech.equip.includes('seals')){
                            rating *= 0.75;
                        }
                    }
                    break;
                case 'hail':
                    {
                        if (!mech.equip.includes('ablative') && !mech.equip.includes('shields')){
                            rating *= 0.75;
                        }
                    }
                    break;
                case 'chasm':
                    {
                        if (!mech.equip.includes('grapple')){
                            rating *= 0.1;
                        }
                    }
                    break;
                case 'dark':
                    {
                        if (!mech.equip.includes('infrared')){
                            rating *= mech.equip.includes('flare') ? 0.25 : 0.1;
                        }
                    }
                    break;
                case 'gravity':
                    {
                        switch (mech.size){
                            case 'medium':
                                rating *= 0.75;
                                break;
                            case 'large':
                                rating *= 0.5;
                                break;
                            case 'titan':
                                rating *= 0.25;
                                break;
                        }
                    }
                    break;
            }
        });

        rating /= global.portal.spire.count;
        let damage = 0;
        for (let i=0; i<mech.hardpoint.length; i++){
            damage += rating * monsters[global.portal.spire.boss].weapon[mech.hardpoint[i]];
        }
        return damage;
    }
}

export function descension(){
    if (webWorker.w){
        webWorker.w.terminate();
    }
    global.lastMsg = false;

    unlockAchieve(`extinct_${global.race.species}`);
    unlockAchieve(`corrupted`);
    if (races[global.race.species].type === 'angelic'){
        unlockFeat('twisted');
    }

    if (global.race.species === 'junker'){
        unlockFeat('the_misery');
    }

    let artifacts = 0;
    switch (global.race.universe){
        case 'micro':
            artifacts = 1;
            break;
        default:
            artifacts = alevel();
            break;
    }
    global.resource.Artifact.amount += artifacts;
    global.resource.Artifact.display = true;

    let affix = universeAffix();
    if (global.stats.spire.hasOwnProperty(affix)){
        if (global.stats.spire[affix].hasOwnProperty('lord')){
            global.stats.spire[affix].lord++;
        }
        else {
            global.stats.spire[affix]['lord'] = 1;
        }
    }

    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;
    let plasmid = global.race.Plasmid.count;
    let antiplasmid = global.race.Plasmid.anti;
    let phage = global.race.Phage.count;
    let harmony = global.race.Harmony.count;

    global.stats.artifact += artifacts;
    global.stats.reset++;
    global.stats.descend++;
    global.stats.tdays += global.stats.days;
    global.stats.days = 0;
    global.stats.tknow += global.stats.know;
    global.stats.know = 0;
    global.stats.tstarved += global.stats.starved;
    global.stats.starved = 0;
    global.stats.tdied += global.stats.died;
    global.stats.died = 0;

    checkAchievements();

    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        Plasmid: { count: plasmid, anti: antiplasmid },
        Phage: { count: phage },
        Dark: { count: global.race.Dark.count },
        Harmony: { count: harmony },
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(Math.seededRandom(10000)),
        corruption: 5,
    };

    global.city = {
        calendar: {
            day: 0,
            year: 0,
            weather: 2,
            temp: 1,
            moon: 0,
            wind: 0,
            orbit: orbit
        },
        biome: biome,
        ptrait: atmo,
        geology: geo
    };
    global.tech = { theology: 1 };
    clearStates();
    global.new = true;
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}
