import { global, keyMultiplier, p_on, gal_on, spire_on, quantum_level, hell_reports, hell_graphs, sizeApproximation } from './vars.js';
import { vBind, clearElement, popover, clearPopper, timeFormat, powerCostMod, spaceCostMultiplier, messageQueue, powerModifier, calcPillar, deepClone, popCost } from './functions.js';
import { unlockAchieve, alevel, universeAffix } from './achieve.js';
import { traits, races } from './races.js';
import { defineResources, spatialReasoning } from './resources.js';
import { loadFoundry, jobScale } from './jobs.js';
import { armyRating, govCivics } from './civics.js';
import { payCosts, powerOnNewStruct, setAction, drawTech, bank_vault } from './actions.js';
import { checkRequirements, incrementStruct } from './space.js';
import { production } from './prod.js';
import { govActive } from './governor.js';
import { loadTab } from './index.js';
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
                if (payCosts($(this)[0])){
                    incrementStruct('turret','portal');
                    if (powerOnNewStruct($(this)[0])){
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
                return loc('portal_carport_desc',[1]);
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
                    repair *= 0.92 ** p_on['repair_droid'];
                }
                return Math.round(repair);
            },
            effect(){
                return `${loc('portal_carport_effect',[1])}`;
            },
            action(){
                if (payCosts($(this)[0])){
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
                if (payCosts($(this)[0])){
                    incrementStruct('war_droid','portal');
                    powerOnNewStruct($(this)[0])
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
                return `<div>${loc('portal_repair_droid_effect',[5])}</div><div>${loc('portal_repair_droid_effect2',[8])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('repair_droid','portal');
                    powerOnNewStruct($(this)[0])
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
                if (payCosts($(this)[0])){
                    incrementStruct('war_drone','portal');
                    powerOnNewStruct($(this)[0])
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
                if (payCosts($(this)[0])){
                    incrementStruct('sensor_drone','portal');
                    powerOnNewStruct($(this)[0])
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
                if (payCosts($(this)[0])){
                    incrementStruct('attractor','portal');
                    powerOnNewStruct($(this)[0])
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
            queue_complete(){ return global.tech.hell_pit >= 2 ? 0 : 1; },
            cost: {
                Money(){ return 5000000; },
                Helium_3(){ return 300000; },
                Deuterium(){ return 200000; }
            },
            effect: loc('portal_pit_mission_effect'),
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('portal_pit_mission_result'),'info',false,['progress','hell']);
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
            queue_complete(){ return global.tech.hell_pit >= 3 ? 0 : 1; },
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
                if (payCosts($(this)[0])){
                    messageQueue(loc('portal_assault_forge_result'),'info',false,['progress','hell']);
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
            queue_complete(){ return 1 - global.portal.soul_forge.count; },
            powered(){ return powerCostMod(30); },
            postPower(o){
                vBind({el: `#fort`},'update');
            },
            cost: {
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_forge') ? global.portal.soul_forge.count : 0)) < 1 ? 25000000 : 0; },
                Graphene(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_forge') ? global.portal.soul_forge.count : 0)) < 1 ? 1500000 : 0; },
                Infernite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_forge') ? global.portal.soul_forge.count : 0)) < 1 ? 25000 : 0; },
                Bolognium(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_forge') ? global.portal.soul_forge.count : 0)) < 1 ? 100000 : 0; },
            },
            effect(wiki){
                let desc = `<div>${loc('portal_soul_forge_effect',[global.resource.Soul_Gem.name])}</div>`;
                let count = (wiki || 0) + (global.portal.hasOwnProperty('soul_forge') ? global.portal.soul_forge.count : 0);
                if (count >= 1){
                    let cap = global.tech.hell_pit >= 6 ? 750000 : 1000000;
                    if (global.tech.hell_pit >= 7 && p_on['soul_attractor'] > 0){
                        cap *= 0.97 ** p_on['soul_attractor'];
                    }
                    desc = desc + `<div>${loc('portal_soul_forge_effect2',[global.portal['soul_forge'] ? global.portal.soul_forge.kills.toLocaleString() : 0,Math.round(cap).toLocaleString()])}</div>`;
                }
                let soldiers = soulForgeSoldiers();
                return `${desc}<div><span class="has-text-caution">${loc('portal_soul_forge_soldiers',[soldiers])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.portal.soul_forge.count < 1){
                        incrementStruct('soul_forge','portal');
                        powerOnNewStruct($(this)[0])
                        return true;
                    }
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
                if (payCosts($(this)[0])){
                    incrementStruct('gun_emplacement','portal');
                    powerOnNewStruct($(this)[0])
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
                if (payCosts($(this)[0])){
                    incrementStruct('soul_attractor','portal');
                    powerOnNewStruct($(this)[0])
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
            queue_complete(){ return global.tech.hell_ruins >= 2 ? 0 : 1; },
            cost: {
                Money(){ return 100000000; },
                Oil(){ return 500000; },
                Helium_3(){ return 500000; }
            },
            effect: loc('portal_ruins_mission_effect'),
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('portal_ruins_mission_result'),'info',false,['progress','hell']);
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
                let holy = global.race['holy'] ? 1 + (traits.holy.vars()[1] / 100) : 1;
                let rating = Math.round(holy * armyRating(jobScale(1),'hellArmy',0));
                return `<div>${loc('portal_guard_post_effect1',[rating])}</div><div class="has-text-caution">${loc('portal_guard_post_effect2',[jobScale(1),$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
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
            reqs: { hell_ruins: 2, hell_vault: 1 },
            condition(){
                return global.portal.vault.count >= 2 ? false : true;
            },
            queue_complete(){ return 2 - global.portal.vault.count; },
            cost: {
                Soul_Gem(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('vault') ? global.portal.vault.count : 0)) === 0 ? 100 : 0; },
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('vault') ? global.portal.vault.count : 0)) === 1 ? 250000000 : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('vault') ? global.portal.vault.count : 0)) === 1 ? 12500000 : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('vault') ? global.portal.vault.count : 0)) === 1 ? 30000000 : 0; },
            },
            effect(wiki){
                let count = (wiki || 0) + (global.portal.hasOwnProperty('vault') ? global.portal.vault.count : 0);
                return count < 1 ? loc('portal_vault_effect',[100]) : loc('portal_vault_effect2'); },
            action(){
                if (global.portal.vault.count < 2 && payCosts($(this)[0])){
                    incrementStruct('vault','portal');
                    if (global.portal.vault.count === 2){
                        global.tech.hell_ruins = 3;
                        global.resource.Codex.display = true;
                        global.resource.Codex.amount = 1;
                        messageQueue(loc('portal_vault_result'),'info',false,['progress','hell']);
                    }
                    return true;
                }
                return false;
            },
            post(){
                if (global.portal.vault.count === 2){
                    drawTech();
                    renderFortress();
                    clearPopper();
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
                return `<div>${loc('portal_archaeology_effect',[jobScale(2)])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('archaeology','portal');
                    global.civic.archaeologist.display = true;
                    if (powerOnNewStruct($(this)[0])){
                        if (global.civic[global.civic.d_job].workers > 0){
                            let hired = global.civic[global.civic.d_job].workers - jobScale(2) < 0 ? global.civic[global.civic.d_job].workers : jobScale(2);
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
                Horseshoe(){ return global.race['hooved'] ? 13 : 0; }
            },
            powered(){ return powerCostMod(25); },
            effect(){
                let sup = hellSupression('ruins');
                let vault = spatialReasoning(bank_vault() * 8 * sup.supress);
                vault = +(vault).toFixed(0);
                let containers = Math.round(quantum_level) * 10;
                let container_string = `<div>${loc('plus_max_resource',[containers,loc('resource_Crates_name')])}</div><div>${loc('plus_max_resource',[containers,loc('resource_Containers_name')])}</div>`;
                return `<div>${loc('plus_max_resource',[`\$${vault.toLocaleString()}`,loc('resource_Money_name')])}</div><div>${loc('plus_max_citizens',[$(this)[0].citizens()])}</div><div>${loc('plus_max_resource',[jobScale(5),loc('civics_garrison_soldiers')])}</div><div>${loc('portal_guard_post_effect1',[75])}</div>${container_string}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('arcology','portal');
                    if (powerOnNewStruct($(this)[0])){
                        global['resource'][global.race.species].max += 8;
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
                vBind({el: `#srprtl_gate`},'update');
            },
            citizens(){
                let pop = 8;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
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
                let reactor = global.tech['inferno_power'] ? `<div>${loc('portal_hell_forge_effect2',[10,loc(`portal_inferno_power_title`)])}</div>` : ``;
                return `<div>${loc('portal_hell_forge_effect',[jobScale(1)])}</div>${reactor}<div>${loc('interstellar_stellar_forge_effect3',[3])}</div><div>${loc('interstellar_stellar_forge_effect',[craft])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('hell_forge','portal');
                    if (powerOnNewStruct($(this)[0])){
                        global.city.smelter.cap += 3;
                        global.city.smelter.Oil += 3;
                        global.city.smelter.Iron += 3;
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
                Neutronium(offset){ return spaceCostMultiplier('inferno_power', offset, 3750000, 1.18, 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('inferno_power', offset, 12000000, 1.18, 'portal'); },
                Bolognium(offset){ return spaceCostMultiplier('inferno_power', offset, 8000000, 1.18, 'portal'); },
            },
            powered(){
                let power = 20;
                if (p_on.hasOwnProperty('hell_forge')){
                    power += p_on['hell_forge'] * 10; 
                }
                return powerModifier(-(power));
            },
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
                if (payCosts($(this)[0])){
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
            queue_complete(){ return global.tech['pillars'] && global.tech.pillars === 1 && global.race.universe !== 'micro' ? 1 : 0; },
            cost: {
                Harmony(wiki){
                    if (wiki !== undefined){
                        return wiki + Object.keys(global.pillars).length < Object.keys(races).length - 1 ? 1 : 0;
                    }
                    return global.race.universe !== 'micro' && global.tech['pillars'] && global.tech.pillars === 1 ? 1 : 0;
                },
                Scarletite(wiki){
                    if (wiki !== undefined){
                        let pillars = wiki + Object.keys(global.pillars).length;
                        return pillars < Object.keys(races).length - 1 ? pillars * 125000 + 1000000 : 0;
                    }
                    return global.race.universe !== 'micro' && global.tech['pillars'] && global.tech.pillars === 1 ? Object.keys(global.pillars).length * 125000 + 1000000 : 0;
                },
            },
            count(){
                return Object.keys(races).length - 1;
            },
            on(){
                return Object.keys(global.pillars).length;
            },
            effect(wiki){
                let pillars = (wiki || 0) + Object.keys(global.pillars).length;
                if (pillars >= 1){
                    return `<div>${loc('portal_ancient_pillars_effect2',[Object.keys(races).length - 1,pillars])}</div>`;
                }
                else {
                    return `<div>${loc('portal_ancient_pillars_effect',[Object.keys(races).length - 1])}</div>`;
                }
            },
            action(){
                if (global.tech['pillars'] && global.tech.pillars === 1 && global.race.universe !== 'micro'){
                    if (payCosts($(this)[0])){
                        global.pillars[global.race.species] = alevel();
                        global.tech.pillars = 2;
                        spatialReasoning(0,false,true);
                        calcPillar(true);
                        towerSize(true);
                        unlockAchieve('resonance');
                        vBind({el: `#portal-ancient_pillars`},'update');
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
            queue_complete(){ return global.tech.hell_gate >= 1 ? 0 : 1; },
            cost: {
                Money(){ return 250000000; },
                Knowledge(){ return 27500000; }
            },
            effect: loc('portal_gate_mission_effect'),
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('portal_gate_mission_result'),'info',false,['progress','hell']);
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
            queue_size: 25,
            queue_complete(){ return towerSize() - global.portal.west_tower.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(10000000) : 0; },
                Stone(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(100000) : 0; },
                Uranium(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(1000) : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(18000) : 0; },
                Vitreloy(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(25000) : 0; },
                Soul_Gem(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? 1 : 0; },
                Scarletite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(5000) : 0; },
            },
            effect(wiki){
                let size = towerSize();
                let count = (wiki || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0);
                if (count < size){
                    let remain = size - count;
                    return `<div>${loc('portal_tower_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div><div class="has-text-caution">${loc('portal_tower_effect2')}</div>`;
                }
                else {
                    return loc('portal_tower_effect');
                }
            },
            action(){
                if (global.portal.west_tower.count < towerSize() && payCosts($(this)[0])){
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
                        messageQueue(loc('portal_gate_open'),'info',false,['progress','hell']);
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
            queue_size: 25,
            queue_complete(){ return towerSize() - global.portal.east_tower.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(10000000) : 0; },
                Stone(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(100000) : 0; },
                Uranium(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(1000) : 0; },
                Adamantite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(18000) : 0; },
                Vitreloy(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(25000) : 0; },
                Soul_Gem(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? 1 : 0; },
                Scarletite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(5000) : 0; },
            },
            effect(wiki){
                let size = towerSize();
                let count = (wiki || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0);
                if (count < size){
                    let remain = size - count;
                    return `<div>${loc('portal_tower_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div><div class="has-text-caution">${loc('portal_tower_effect2')}</div>`;
                }
                else {
                    return loc('portal_tower_effect');
                }
            },
            action(){
                if (global.portal.east_tower.count < towerSize() && payCosts($(this)[0])){
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
                        messageQueue(loc('portal_gate_open'),'info',false,['progress','hell']);
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
                    security *= 1 + (traits.holy.vars()[1] / 100);
                }
                let min = global.tech.hell_gun >= 2 ? 65 : 40;
                let max = global.tech.hell_gun >= 2 ? 100 : 60;
                return `<div>${loc('portal_gate_turret_effect',[Math.round(security)])}</div><div>${loc('portal_gate_turret_effect2',[min,max])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('gate_turret','portal');
                    powerOnNewStruct($(this)[0])
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
            powerBalancer(){
                return [{ r: 'Infernite', k: 'lpmod' }];
            },
            cost: {
                Money(offset){ return spaceCostMultiplier('infernite_mine', offset, 75000000, 1.26, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('infernite_mine', offset, 2450000, 1.26, 'portal'); },
                Orichalcum(offset){ return spaceCostMultiplier('infernite_mine', offset, 1650000, 1.26, 'portal'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('infernite_mine', offset, 680000, 1.26, 'portal'); },
            },
            effect(){
                let mining = production('infernite_mine');
                return `<div>${loc('portal_infernite_mine_effect',[+(mining).toFixed(3)])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('infernite_mine','portal');
                    powerOnNewStruct($(this)[0])
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
            queue_complete(){ return global.tech.hell_lake >= 2 ? 0 : 1; },
            cost: {
                Money(){ return 500000000; },
                Oil(){ return 750000; },
                Helium_3(){ return 600000; }
            },
            effect: loc('portal_lake_mission_effect'),
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('portal_lake_mission_result'),'info',false,['progress','hell']);
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
            res(){
                return [
                    'Oil','Alloy','Polymer','Iridium','Helium_3','Deuterium','Neutronium','Adamantite',
                    'Infernite','Nano_Tube','Graphene','Stanene','Bolognium','Orichalcum'
                ];
            },
            val(res){
                switch (res){
                    case 'Oil':
                        return 30000;
                    case 'Alloy':
                        return 250000;
                    case 'Polymer':
                        return 250000;
                    case 'Iridium':
                        return 200000;
                    case 'Helium_3':
                        return 18000;
                    case 'Deuterium':
                        return 12000;
                    case 'Neutronium':
                        return 180000;
                    case 'Adamantite':
                        return 150000;
                    case 'Infernite':
                        return 75000;
                    case 'Nano_Tube':
                        return 750000;
                    case 'Graphene':
                        return 1200000;
                    case 'Stanene':
                        return 1200000;
                    case 'Bolognium':
                        return 130000;
                    case 'Orichalcum':
                        return 130000;
                    default:
                        return 0;
                }
            },
            effect(){
                let storage = '<div class="aTable">';
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let val = sizeApproximation(+(spatialReasoning($(this)[0].val(res))).toFixed(0),1);
                        storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                storage = storage + '</div>';
                return `<div>${loc('portal_harbour_effect',[1])}</div>${storage}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('harbour','portal');
                    if (powerOnNewStruct($(this)[0])){
                        for (const res of $(this)[0].res()){
                            if (global.resource[res].display){
                                global.resource[res].max += (spatialReasoning($(this)[0].val(res)));
                            }
                        };
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
                if (payCosts($(this)[0])){
                    incrementStruct('cooling_tower','portal');
                    powerOnNewStruct($(this)[0])
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
                return `<div class="has-text-caution">${loc('space_used_support',[loc('lake')])}</div><div>${loc('portal_bireme_effect',[rating])}</div><div class="has-text-caution">${loc('galaxy_starbase_mil_crew',[$(this)[0].ship.mil()])}</div>`;
            },
            ship: {
                civ(){ return 0; },
                mil(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 2 : 2; },
            },
            action(){
                if (payCosts($(this)[0])){
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
                Oil(offset){ return spaceCostMultiplier('transport', offset, 180000, 1.22, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('transport', offset, 18000000, 1.22, 'portal'); },
                Graphene(offset){ return spaceCostMultiplier('transport', offset, 12500000, 1.22, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('transport', offset, 5, 1.22, 'portal'); },
                Scarletite(offset){ return spaceCostMultiplier('transport', offset, 250000, 1.22, 'portal'); },
            },
            effect(){
                let rating = global.blood['spire'] && global.blood.spire >= 2 ? 0.8 : 0.85;
                let bireme = +((rating ** (gal_on['bireme'] || 0)) * 100).toFixed(1);
                return `<div class="has-text-caution">${loc('space_used_support',[loc('lake')])}</div><div>${loc('portal_transport_effect',[5])}</div><div class="has-text-danger">${loc('portal_transport_effect2',[bireme])}</div><div class="has-text-caution">${loc('galaxy_starbase_civ_crew',[$(this)[0].ship.civ()])}</div>`;
            },
            special: true,
            sAction(){
                global.settings.civTabs = 4;
                global.settings.marketTabs = 3;
                if (!global.settings.tabLoad){
                    loadTab('mTabResource');
                    clearPopper(`portal-transport`);
                }
            },
            ship: {
                civ(){ return global.race['high_pop'] ? traits.high_pop.vars()[0] * 3 : 3; },
                mil(){ return 0; },
            },
            action(){
                if (payCosts($(this)[0])){
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
                        messageQueue(loc('portal_transport_unlocked'),'info',false,['progress','hell']);
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
            queue_complete(){ return global.tech.hell_spire >= 2 ? 0 : 1; },
            cost: {
                Species(){ return popCost(50); },
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
                if (payCosts($(this)[0])){
                    messageQueue(loc('portal_spire_mission_result'),'info',false,['progress','hell']);
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
                if (payCosts($(this)[0])){
                    incrementStruct('purifier','portal');
                    powerOnNewStruct($(this)[0])
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
                if (payCosts($(this)[0])){
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
                if (payCosts($(this)[0])){
                    incrementStruct('base_camp','portal');
                    if (global.portal.purifier.support < global.portal.purifier.s_max){
                        global.portal.base_camp.on++;
                    }
                    if (global.tech.hell_spire === 4){
                        global.tech.hell_spire = 5;
                        global.portal['bridge'] = { count: 0 };
                        messageQueue(loc('portal_spire_bridge_collapse'),'info',false,['progress','hell']);
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
            queue_size: 1,
            queue_complete(){ return 10 - global.portal.bridge.count; },
            cost: {
                Species(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('bridge') ? global.portal.bridge.count : 0)) < 10 ? popCost(10) : 0; },
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('bridge') ? global.portal.bridge.count : 0)) < 10 ? 500000000 : 0; },
                Supply(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('bridge') ? global.portal.bridge.count : 0)) < 10 ? 100000 : 0; },
            },
            effect(wiki){
                let size = 10;
                let count = (wiki || 0) + (global.portal.hasOwnProperty('bridge') ? global.portal.bridge.count : 0);
                if (count < size){
                    let remain = size - count;
                    return `<div>${loc('portal_bridge_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div><div class="has-text-caution">${loc('portal_bridge_effect2')}</div>`;
                }
                else {
                    return loc('portal_bridge_complete');
                }
            },
            action(){
                if (global.portal.bridge.count < 10 && payCosts($(this)[0])){
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
            queue_complete(){ return 8 - global.tech.hell_spire; },
            cost: {
                Knowledge(offset){
                    let count = (offset || 0) + (!global.tech['hell_spire'] || global.tech.hell_spire < 7 ? 0 : global.tech.hell_spire === 7 ? 1 : 2);
                    return count === 1 ? 50000000 : count === 0 ? 40000000 : 0;
                }
            },
            effect(wiki){
                let count = (wiki || 0) + (!global.tech['hell_spire'] || global.tech.hell_spire < 7 ? 0 : global.tech.hell_spire === 7 ? 1 : 2);
                if (count === 1){
                    return loc('portal_sphinx_effect2');
                }
                else if (count === 2){
                    return loc('portal_sphinx_effect3');
                }
                return loc('portal_sphinx_effect');
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.tech.hell_spire === 6){
                        global.tech.hell_spire = 7;
                        messageQueue(loc('portal_sphinx_msg'),'info',false,['progress','hell']);
                        renderFortress();
                        return true;
                    }
                    else if (global.tech.hell_spire === 7){
                        global.tech.hell_spire = 8;
                        renderFortress();
                        messageQueue(loc('portal_sphinx_answer_msg'),'info',false,['progress','hell']);  
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
                if (payCosts($(this)[0])){
                    if (global.tech.hell_spire === 7 && !global.tech['sphinx_bribe']){
                        global.tech['sphinx_bribe'] = 1;
                        global.resource.Codex.display = true;
                        global.resource.Codex.amount = 1;
                        messageQueue(loc('portal_sphinx_bribe_msg'),'info',false,['progress','hell']);                        
                        return true;
                    }
                }
                return false;
            },
            post(){
                if (global.tech['sphinx_bribe']){
                    drawTech();
                    renderFortress();
                    clearPopper('portal-bribe_sphinx');
                }
            }
        },
        spire_survey: {
            id: 'portal-spire_survey',
            title: loc('portal_spire_survey_title'),
            desc: loc('portal_spire_survey_title'),
            reqs: { hell_spire: 8 },
            grant: ['hell_spire',9],
            queue_complete(){ return global.tech.hell_spire >= 9 ? 0 : 1; },
            cost: {
                Oil(){ return 1200000; },
                Helium_3(){ return 900000; },
            },
            effect: loc('portal_spire_survey_effect'),
            action(){
                if (payCosts($(this)[0])){
                    global.portal['mechbay'] = { count: 0, on: 0, bay: 0, max: 0, active: 0, scouts: 0, mechs: [] };
                    global.portal['spire'] = { count: 1, progress: 0, boss: '', type: '', status: {} };
                    genSpireFloor();
                    messageQueue(loc('portal_spire_survey_msg'),'info',false,['progress','hell']);
                    return true;
                }
                return false;
            },
            post(){
                if (global.tech['hell_spire'] && global.tech.hell_spire === 9){
                    renderFortress();
                    clearPopper('portal-spire_survey');
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
                global.settings.govTabs = 4;
                if (!global.settings.tabLoad){
                    loadTab('mTabCivic');
                    clearPopper(`portal-mechbay`);
                }
            },
            effect(){
                let bay = global.portal.hasOwnProperty('mechbay') ? global.portal.mechbay.bay : 0;
                let max = global.portal.hasOwnProperty('mechbay') ? global.portal.mechbay.max : 0;
                return `<div class="has-text-caution">${loc('portal_port_effect1',[$(this)[0].support()])}</div><div>${loc('portal_mechbay_effect')}</div><div>${loc('portal_mechbay_effect2',[bay,max])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('mechbay','portal');
                    if (global.portal.purifier.support < global.portal.purifier.s_max){
                        global.portal.mechbay.on++;
                        global.portal.mechbay.max += 25;
                    }
                    global.settings.showMechLab = true;
                    if (global.portal.mechbay.count === 1){
                        messageQueue(loc('portal_mechbay_unlocked'),'info',false,['progress','hell']);
                        drawMechLab();
                    }
                    return true;
                }
                return false;
            },
            postPower(){
                updateMechbay();
            }
        },
        spire: {
            id: 'portal-spire',
            title: loc('portal_spire_title'),
            desc: loc('portal_spire_title'),
            reqs: { hell_spire: 9 },
            queue_complete(){ return 0; },
            cost: {},
            effect(){
                let floor = global.portal.hasOwnProperty('spire') ? global.portal.spire.count : 0;
                let terrain = global.portal.hasOwnProperty('spire') ? `<span class="has-text-warning">${loc(`portal_spire_type_${global.portal.spire.type}`)}</span>` : '?';
                let status = ``;
                if (global.portal.hasOwnProperty('spire') && Object.keys(global.portal.spire.status).length > 0){
                    status = `<div>${loc('portal_spire_hazard',[Object.keys(global.portal.spire.status).map(v => `<span class="has-text-warning">${loc(`portal_spire_status_${v}`)}</span>`).join(', ')])}</div>`;
                }
                let progress = global.portal.hasOwnProperty('spire') ? `<span class="has-text-warning">${+(global.portal.spire.progress).toFixed(3)}%</span>` : '0%';
                let leftSide = `<div>${loc('portal_spire_effect',[floor])}</div><div>${loc('portal_spire_type',[terrain])}</div>${status}<div>${loc('portal_spire_progress',[progress])}</div>`;
                
                let boss = global.portal.hasOwnProperty('spire') ? global.portal.spire.boss : 'crazed';
                let threat = `<div>${loc('portal_spire_mob',[`<span class="has-text-danger">${loc(`portal_mech_boss_${boss}`)}</span>`])}</div>`;

                let weak = `???`;
                let resist = `???`;
                if (global.stats['spire']){
                    let resists = bossResists(boss);
                    let level = $(this)[0].mscan();
                    if (level > 0){
                        weak = loc(`portal_mech_weapon_${resists.w}`);
                    }
                    if (level >= 5){
                        resist = loc(`portal_mech_weapon_${resists.r}`);
                    }
                }
                let rightSide = `<div>${threat}<div>${loc('portal_spire_mob_weak',[`<span class="has-text-warning">${weak}</span>`])}</div><div>${loc('portal_spire_mob_resist',[`<span class="has-text-warning">${resist}</span>`])}</div></div>`;

                return `<div class="split"><div>${leftSide}</div><div>${rightSide}</div></div>`;
            },
            mscan(){
                let level = 0;
                Object.keys(global.stats.spire).forEach(function(uni){
                    let boss = global.portal.hasOwnProperty('spire') ? global.portal.spire.boss : 'crazed';
                    if (global.stats.spire.hasOwnProperty(uni) && global.stats.spire[uni].hasOwnProperty(boss) && global.stats.spire[uni][boss] > level){
                        level = global.stats.spire[uni][boss];
                    }
                });
                return level;
            },
            wide: true,
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
            queue_size: 1,
            queue_complete(){ return global.tech.waygate >= 2 ? 0 : 10 - global.portal.waygate.count; },
            cost: {
                Species(offset){
                    if (offset){
                        return offset + (global.portal.hasOwnProperty('waygate') ? global.portal.waygate.count : 0) < 10 ? popCost(25) : 0;
                    }
                    return !global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) ? popCost(25) : 0;
                },
                Money(offset){
                    if (offset){
                        return offset + (global.portal.hasOwnProperty('waygate') ? global.portal.waygate.count : 0) < 10 ? 1000000000 : 0;
                    }
                    return !global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) ? 1000000000 : 0;
                },
                Supply(offset){
                    if (offset){
                        return offset + (global.portal.hasOwnProperty('waygate') ? global.portal.waygate.count : 0) < 10 ? 500000 : 0;
                    }
                    return !global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) ? 500000 : 0;
                },
                Blood_Stone(offset){
                    if (offset){
                        return offset + (global.portal.hasOwnProperty('waygate') ? global.portal.waygate.count : 0) < 10 ? 5 : 0;
                    }
                    return !global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) ?  5 : 0;
                },
            },
            powered(){
                return global.portal.hasOwnProperty('waygate') && global.portal.waygate.count >= 10 ? 1 : 0;
            },
            power_reqs: { waygate: 2 },
            effect(wiki){
                let count = (wiki || 0) + (global.tech['waygate'] && global.tech.waygate >= 2 ? 10 : global.portal.hasOwnProperty('waygate') ? global.portal.waygate.count : 0);
                if (count >= 10){
                    let progress = global.portal.hasOwnProperty('waygate') ? `<span class="has-text-warning">${+(global.portal.waygate.progress).toFixed(3)}%</span>` : '0%';
                    return `<div>${loc('portal_waygate_open')}</div><div>${loc('portal_waygate_progress',[progress])}</div>`;
                }
                else {
                    let size = 10;
                    let remain = size - count;
                    return `<div>${loc('portal_waygate_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(){
                if (global.portal.waygate.count < 10 && global.tech['waygate'] && global.tech.waygate === 1 && payCosts($(this)[0])){
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

export const towerSize = (function(){
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
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 4)){
        return;
    }
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

export function checkHellRequirements(region,tech){
    return checkRequirements(fortressModules,region,tech);
}

function fortressData(dt){
    switch (dt){
        case 'hostiles':
            {
                if (global.portal.fortress.threat >= 2000){
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_high')}`;
                }
                else if (global.portal.fortress.threat < 1000){
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_low')}`;
                }
                else {
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_medium')}`;
                }
            }
        case 'threatLevel':
            {
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
            }
        case 'hireLabel':
            {
                let cost = Math.round(govCivics('m_cost')).toLocaleString();
                return loc('civics_garrison_hire_mercenary_cost',[cost]);
            }
    }
}

export function buildFortress(parent,full){
    if (!global.settings.tabLoad){
        switch (global.settings.civTabs){
            case 1:
                if (global.settings.spaceTabs !== 4){
                    return;
                }
                break;
            case 2:
                if (global.settings.govTabs !== 3){
                    return;
                }
                break;
            default:
                return;
        }
    }
    if (!global.tech['portal'] || global.tech['portal'] < 2){
        return;
    }
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
        fort.append(`<div><h3 class="has-text-warning">${loc('portal_fortress_name')}</h3><button class="button observe right" @click="observation">${loc('hell_observation_button')}</button></div>`);
    }
    

    let status = $('<div></div>');
    fort.append(status);

    let defense = $(`<span class="defense has-text-success" :aria-label="defense()">${loc('fortress_defense')} {{ f.garrison | defensive }}</span>`);
    status.append(defense);
    let activity = $(`<span class="has-text-danger pad hostiles" :aria-label="hostiles()">${loc('fortress_spotted')} {{ f.threat }}</span>`);
    status.append(activity);
    let threatLevel = $(`<span class="pad threatLevel" :class="threaten()" :aria-label="threatLevel()">{{ f.threat | threat }}</span>`);
    status.append(threatLevel);

    let wallStatus = $('<div></div>');
    fort.append(wallStatus);

    wallStatus.append($(`<span class="has-text-warning" :aria-label="defense()">${loc('fortress_wall')} <span :class="wall()">{{ f.walls }}%</span></span>`))

    let station = $(`<div></div>`);
    fort.append(station);
    
    station.append($(`<span>${loc('fortress_army')}</span>`));
    station.append($('<span role="button" aria-label="remove soldiers from the fortress" class="sub has-text-danger" @click="aLast"><span>&laquo;</span></span>'));
    station.append($('<span class="current armyLabel">{{ f.garrison | patrolling }}</span>'));
    station.append($('<span role="button" aria-label="add soldiers to the fortress" class="add has-text-success" @click="aNext"><span>&raquo;</span></span>'));
    
    station.append($(`<span>${loc('fortress_patrol')}</span>`));
    station.append($('<span role="button" aria-label="reduce number of patrols" class="sub has-text-danger" @click="patDec"><span>&laquo;</span></span>'));
    station.append($('<span class="current patLabel">{{ f.patrols }}</span>'));
    station.append($('<span role="button" aria-label="increase number of patrols" class="add has-text-success" @click="patInc"><span>&raquo;</span></span>'));

    station.append($(`<span>${loc('fortress_patrol_size')}</span>`));
    station.append($('<span role="button" aria-label="reduce size of each patrol" class="sub has-text-danger" @click="patSizeDec"><span>&laquo;</span></span>'));
    station.append($('<span class="current patSizeLabel">{{ f.patrol_size }}</span>'));
    station.append($('<span role="button" aria-label="increase size of each patrol" class="add has-text-success" @click="patSizeInc"><span>&raquo;</span></span>'));

    station.append($(`<span class="hireLabel"><button v-show="g.mercs" class="button merc" @click="hire" :aria-label="hireLabel()">${loc('civics_garrison_hire_mercenary')}</button></span>`));

    let color = global.settings.theme === 'light' ? ` type="is-light"` : ` type="is-dark"`;
    let reports = $(`<div></div>`);
    station.append(reports);
    reports.append($(`<b-checkbox class="patrol" v-model="f.notify" true-value="Yes" false-value="No"${color}>${loc('fortress_patrol_reports')}</b-checkbox>`));
    reports.append($(`<b-checkbox class="patrol" v-model="f.s_ntfy" true-value="Yes" false-value="No"${color}>${loc('fortress_surv_reports')}</b-checkbox>`));
    reports.append($(`<b-checkbox class="patrol" v-model="f.nocrew"${color} v-show="s.showGalactic">${loc('fortress_nocrew')}</b-checkbox>`));

    if (full){
        fort.append($(`<div class="training"><span>${loc('civics_garrison_training')} - ${loc('arpa_to_complete')} {{ g.rate, g.progress | trainTime }}</span><button class="button observe right" @click="observation">${loc('hell_observation_button')}</button> <progress class="progress" :value="g.progress" max="100">{{ g.progress }}%</progress></div>`));
    }

    vBind({
        el: `#${id}`,
        data: {
            f: global.portal.fortress,
            g: global.civic.garrison,
            s: global.settings
        },
        methods: {
            defense(){
                return loc('fortress_defense');
            },
            hostiles(){
                return fortressData('hostiles');
            },
            threatLevel(){
                return fortressData('threatLevel');
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
                    min += jobScale(global.portal.guard_post.on);
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
                let repeats = keyMultiplier();
                let canBuy = true;
                while (canBuy && repeats > 0){
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
                    else {
                        canBuy = false;
                    }
                    repeats--;
                }
            },
            hireLabel(){
                return fortressData('hireLabel');
            },
            observation(){
                global.settings.civTabs = $(`#mainTabs > nav ul li`).length - 1;
                if (!global.settings.tabLoad){
                    drawHellObservations();
                }
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
                    stationed -= jobScale(global.portal.guard_post.on);
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
            },
            trainTime(r,p){
                return r === 0 ? timeFormat(-1) : timeFormat((100 - p) / (r * 4));
            }
        }
    });

    ['hostiles','threatLevel','armyLabel','patLabel','patSizeLabel','hireLabel'].forEach(function(k){
        popover(`hf${id}${k}`, function(){
                switch(k){
                    case 'hostiles':
                        return fortressData('hostiles');
                    case 'threatLevel':
                        return fortressData('hostiles');
                    case 'armyLabel':
                        return loc('fortress_stationed');
                    case 'patLabel':
                        return loc('fortress_patrol_desc',[global.portal.fortress.patrols]);
                    case 'patSizeLabel':
                        return loc('fortress_patrol_size_desc',[global.portal.fortress.patrol_size]);
                    case 'hireLabel':
                        return fortressData('hireLabel');
                }
            },
            {
                elm: `#${id} span.${k}`
            }
        );
    });
    popover(`hf${id}observe`, function(){
            return loc('hell_observation_tooltip');
        },
        {
            elm: `#${id} button.observe`
        }
    );
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
        army -= jobScale(global.portal.guard_post.on);
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
        army += global.tech['hdroid'] ? jobScale(droids * 2) : jobScale(droids);
    }
    let turret = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 70 : 50) : 35;
    return Math.round(armyRating(army,'hellArmy',wounded)) + (p_on['turret'] ? p_on['turret'] * turret : 0);
}

function casualties(demons,pat_armor,ambush,report){
    let casualties = Math.round(Math.log2((demons / global.portal.fortress.patrol_size) / (pat_armor || 1))) - Math.rand(0,pat_armor);
    let dead = 0;
    if (casualties > 0){
        if (casualties > global.portal.fortress.patrol_size){
            casualties = global.portal.fortress.patrol_size;
        }
        casualties = Math.rand(ambush ? 1 : 0,casualties + 1);
        dead = Math.rand(0,casualties + 1);
        let wounded = casualties - dead;
        if (global.race['instinct']){
            let reduction = Math.floor(dead * (traits.instinct.vars()[1] / 100));
            dead -= reduction;
            wounded += reduction;
        }
        report.wounded = wounded;
        report.died = dead;
        global.civic.garrison.wounded += wounded;
        global.civic.garrison.workers -= dead;
        global.stats.died += dead;
    }
    return dead;
}

export function bloodwar(){
    let day_report = {
        start: global.portal.fortress.threat,
        foundGem: false,
        stats: {
            wounded: 0, died: 0, revived: 0, surveyors: 0, sieges: 0,
            kills: {
                drones: 0,
                patrols: 0,
                sieges: 0,
                guns: 0,
                soul_forge: 0,
                turrets: 0
            },
            gems: {
                patrols: 0,
                guns: 0,
                soul_forge: 0,
                crafted: 0,
                turrets: 0,
                surveyors: 0
            },
        }
    };
    let pat_armor = global.tech['armor'] ? global.tech['armor'] : 0;
    if (global.race['armored']){
        pat_armor += traits.armored.vars()[1];
    }
    if (global.race['scales']){
        pat_armor += traits.scales.vars()[2];
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
    let drone_kills = 0;
    if (global.tech['portal'] >= 3 && p_on['war_drone']){
        day_report.drones = {};
        for (let i=0; i<p_on['war_drone']; i++){
            let drone_report = { encounter: false, kills: 0 };
            if (Math.rand(0,global.portal.fortress.threat) >= Math.rand(0,999)){
                let demons = Math.rand(Math.floor(global.portal.fortress.threat / 50), Math.floor(global.portal.fortress.threat / 10));
                let killed = global.tech.portal >= 7 ? Math.rand(50,125) : Math.rand(25,75);
                if (demons < killed){
                    killed = demons;
                }
                global.portal.fortress.threat -= killed;
                global.stats.dkills += killed;
                if (forgeOperating){
                    global.portal.soul_forge.kills += killed;
                }
                drone_report = { encounter: true, kills: killed };
                day_report.stats.kills.drones += killed;
                drone_kills += killed;
            }
            day_report.drones[i+1] = drone_report;
        }
    }

    if (!global.portal.fortress['pity']){
        global.portal.fortress['pity'] = 0;
    }

    let game_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 9000 : 10000;
    let gem_chance = game_base - global.portal.fortress.pity;
    if (global.race.universe === 'evil' && global.prestige.Dark.count > 1){
        let de = global.prestige.Dark.count;
        if (global.prestige.Harmony.count > 0){
            de *= 1 + (global.prestige.Harmony.count * 0.01);
        }
        gem_chance -= Math.round(Math.log2(de) * 2);
    }
    
    if (global.tech['portal'] >= 4 && p_on['attractor']){
        gem_chance = Math.round(gem_chance * (0.948 ** p_on['attractor']));
    }

    if (global.race['ghostly']){
        gem_chance = Math.round(gem_chance * ((100 - traits.ghostly.vars()[2]) / 100));
    }

    if (gem_chance < 12){
        gem_chance = 12;
    }

    // Patrols
    let dead = 0;
    let terminators = p_on['war_droid'] ? p_on['war_droid'] : 0;
    let has_drop = false;
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
    day_report.patrols = {};
    for (let i=0; i<global.portal.fortress.patrols; i++){
        let patrol_report = { encounter: false, droid: false, ambush: false, gem: 0, kills: 0, wounded: 0, died: 0};
        let hurt = brkpnt > (1 / global.portal.fortress.patrols * i) ? Math.ceil(wounded) : Math.floor(wounded);
        if (Math.rand(0,global.portal.fortress.threat) >= Math.rand(0,999)){
            patrol_report.encounter = true;
            let pat_size = global.portal.fortress.patrol_size;
            if (terminators > 0){
                patrol_report.droid = true;
                pat_size += global.tech['hdroid'] ? jobScale(2) : jobScale(1);
                terminators--;
            }
            let pat_rating = Math.round(armyRating(pat_size,'hellArmy',hurt));

            let demons = Math.rand(Math.floor(global.portal.fortress.threat / 50), Math.floor(global.portal.fortress.threat / 10));

            if (global.race['blood_thirst']){
                global.race['blood_thirst_count'] += Math.rand(0,Math.ceil(demons / 10));
                if (global.race['blood_thirst_count'] > traits.blood_thirst.vars()[0]){
                    global.race['blood_thirst_count'] = traits.blood_thirst.vars()[0];
                }
            }

            let odds = 30 + Math.max(global.race['chameleon'] ? traits.chameleon.vars()[1] : 0,
                                     global.race['elusive'] ? traits.elusive.vars()[0] : 0);
            if (Math.rand(0,odds) === 0){
                patrol_report.ambush = true;
                dead += casualties(Math.round(demons * (1 + Math.random() * 3)),0,true,patrol_report);
                let killed = Math.round(pat_rating / 2);
                if (demons < killed){
                    killed = demons;
                }
                global.portal.fortress.threat -= killed;
                global.stats.dkills += killed;
                if (forgeOperating){
                    global.portal.soul_forge.kills += killed;
                }
                patrol_report.kills = killed;
            }
            else {
                let killed = pat_rating;
                if (demons <= killed){
                    killed = demons;
                }
                else {
                    dead += casualties(demons-killed,pat_armor,false,patrol_report);
                }
                patrol_report.kills = killed;
                global.portal.fortress.threat -= killed;
                global.stats.dkills += killed;
                if (forgeOperating){
                    global.portal.soul_forge.kills += killed;
                }
                if (killed > 0){
                    let div = 35 - Math.floor(p_on['attractor'] / 3);
                    if (div < 5){ div = 5; }
                    let chances = Math.round(killed / div);
                    for (let j=0; j<chances; j++){
                        if (Math.rand(0,gem_chance) === 0){
                            patrol_report.gem++;
                            day_report.stats.gems.patrols++;
                            global.resource.Soul_Gem.amount++;
                            global.portal.fortress.pity = 0;
                            if (!global.resource.Soul_Gem.display){
                                global.resource.Soul_Gem.display = true;
                                messageQueue(loc('portal_first_gem'),'info',false,['progress','hell']);
                            }
                            has_drop = true;
                        }
                    }
                }
            }
                
            day_report.stats.kills.patrols += patrol_report.kills;
            day_report.stats.wounded += patrol_report.wounded;
            day_report.stats.died += patrol_report.died;
        }
        day_report.patrols[i+1] = patrol_report;
    }

    let revive = 0;
    if (global.race['revive']){
        revive = Math.round(Math.rand(0,(dead / traits.revive.vars()[6]) + 0.25));
        day_report.revived = revive;
        day_report.stats.revived = revive;
        global.civic.garrison.workers += revive;
    }

    // Soldier Rebalancing
    if (global.civic.garrison.wounded > global.civic.garrison.workers){
        global.civic.garrison.wounded = global.civic.garrison.workers;
    }
    let garrison_size = global.portal.fortress.nocrew ? global.civic.garrison.workers - global.civic.garrison.crew : global.civic.garrison.workers;
    if (garrison_size < global.portal.fortress.garrison){
        global.portal.fortress.garrison = garrison_size;
    }
    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
        let patrol_start = global.portal.fortress.patrols;
        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
        day_report.patrols_lost = patrol_start - global.portal.fortress.patrols;
    }

    if (dead > 0 && global.portal.fortress.notify === 'Yes'){
        if (revive > 0){
            messageQueue(loc('fortress_patrol_casualties_revive',[dead,revive]),false,false,['hell']);
        }
        else {
            messageQueue(loc('fortress_patrol_casualties',[dead]),false,false,['hell']);
        }
    }

    // Siege Chance
    if (global.portal.fortress.garrison > 0 && global.portal.fortress.siege > 0){
        global.portal.fortress.siege--;
    }
    if (global.portal.fortress.siege <= 900 && global.portal.fortress.garrison > 0 && 1 > Math.rand(0,global.portal.fortress.siege)){
        let siege_report = { destroyed: false, damage: 0, kills: 0, surveyors: 0, soldiers: 0};
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
                    siege_report.destroyed = true;
                    destroyed = true;
                    break;
                }
            }
        }
        siege_report.damage = damage;
        siege_report.kills = killed;
        day_report.stats.kills.sieges = killed;
        
        if (destroyed){
            messageQueue(loc('fortress_lost'),false,false,['hell']);
            siege_report.surveyors = global.civic.hell_surveyor.workers;
            global.resource[global.race.species].amount -= global.civic.hell_surveyor.workers;
            global.civic.hell_surveyor.workers = 0;
            global.civic.hell_surveyor.assigned = 0;

            siege_report.soldiers = global.portal.fortress.garrison;
            day_report.stats.died += global.portal.fortress.garrison;
            global.portal.fortress.patrols = 0;
            global.stats.died += global.portal.fortress.garrison;
            global.civic.garrison.workers -= global.portal.fortress.garrison;
            global.portal.fortress.garrison = 0;
            global.portal.fortress['assigned'] = 0;
        }
        else {
            messageQueue(loc('fortress_sieged',[killed,damage]),false,false,['hell']);
        }

        global.portal.fortress.siege = 999;
        day_report.stats.sieges++;
        day_report.siege = siege_report;
    }

    if (global.portal.fortress.threat < 10000){
        let influx = ((10000 - global.portal.fortress.threat) / 2500) + 1;
        if (global.tech['portal'] >= 4 && p_on['attractor']){
            influx *= 1 + (p_on['attractor'] * 0.22);
        }
        let demon_spawn = Math.rand(Math.round(10 * influx),Math.round(50 * influx));
        global.portal.fortress.threat += demon_spawn;
        day_report.demons = demon_spawn;
    }

    // Surveyor threats
    if (global.civic.hell_surveyor.display && global.civic.hell_surveyor.workers > 0){
        let divisor = 1000;
        let painVal = govActive('nopain',1);
        if (painVal){
            divisor *= 1 + (painVal / 100);
        }
        if (global.race['blurry']){
            divisor *= 1 + (traits.blurry.vars()[0] / 100);
        }
        if (global.race['instinct']){
            divisor *= 1 + (traits.instinct.vars()[0] / 100);
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
                messageQueue(loc('fortress_killed'),false,false,['hell']);
            }
            else if (dead > 1 && global.portal.fortress.s_ntfy === 'Yes'){
                messageQueue(loc('fortress_eviscerated',[dead]),false,false,['hell']);
            }
            if (dead > 0){
                day_report.surveyors = dead;
                day_report.stats.surveyors = dead;
                global.civic.hell_surveyor.workers -= dead;
                global.civic.hell_surveyor.max -= dead;
                global.resource[global.race.species].amount -= dead;
                global.portal.carport.damaged += dead;
            }
        }

        day_report.surveyor_finds = {};
        if (global.civic.hell_surveyor.workers > 0 && drone_kills > 0){
            for (let i=0; i<global.civic.hell_surveyor.workers; i++){
                let surv_report = { gem: 0, bodies: 0 };
                let searched = Math.rand(
                    Math.round(drone_kills / 2 / global.civic.hell_surveyor.workers),
                    Math.round(drone_kills / global.civic.hell_surveyor.workers)
                );
                if (searched > 100){ searched = 100; }
                surv_report.bodies = searched;
                if (searched > 0){
                    let div = 25 - Math.floor(p_on['attractor'] / 5);
                    if (div < 5){ div = 5; }
                    let chances = Math.round(searched / div);
                    for (let j=0; j<chances; j++){
                        if (Math.rand(0,gem_chance) === 0){
                            surv_report.gem++;
                            day_report.stats.gems.surveyors++;
                            global.resource.Soul_Gem.amount++;
                            global.portal.fortress.pity = 0;
                            if (!global.resource.Soul_Gem.display){
                                global.resource.Soul_Gem.display = true;
                                messageQueue(loc('portal_first_gem'),'info',false,['progress','hell']);
                            }
                            has_drop = true;
                        }
                    }
                }
                day_report.surveyor_finds[i+1] = surv_report;
            }
        } 
    }

    if (!has_drop && global.portal.fortress.pity < 10000){
        global.portal.fortress.pity++;
    }

    if (global.stats.dkills >= 1000000 && global.tech['gateway'] && !global.tech['hell_pit']){
        global.tech['hell_pit'] = 1;
        global.settings.portal.pit = true;
        messageQueue(loc('portal_hell_pit_found'),'info',false,['progress','hell']);
        renderFortress();
    }

    if (global.tech['hell_pit']){
        if (forgeOperating && global.tech.hell_pit >= 5 && p_on['soul_attractor']){
            let attact = global.blood['attract'] ? global.blood.attract * 5 : 0;
            let souls = p_on['soul_attractor'] * Math.rand(40 + attact, 120 + attact);
            global.portal.soul_forge.kills += souls;
            day_report.soul_attractors = souls;
        }

        if (forgeOperating && global.tech['hell_gun'] && p_on['gun_emplacement']){
            day_report.gun_emplacements = {};
            let gunKills = 0;
            for (let i=0; i<p_on['gun_emplacement']; i++){
                day_report.gun_emplacements[i+1] = { kills: 0, gem: false };
                let kills = global.tech.hell_gun >= 2 ? Math.rand(35,75) : Math.rand(20,40);
                gunKills += kills;
                day_report.gun_emplacements[i+1].kills = kills;
            }
            day_report.stats.kills.guns = gunKills;
            global.portal.soul_forge.kills += gunKills;
            global.stats.dkills += gunKills;
            let gun_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 6750 : 7500;
            if (global.tech.hell_pit >= 7 && p_on['soul_attractor'] > 0){
                gun_base *= 0.94 ** p_on['soul_attractor'];
            }
            for (let i=0; i<p_on['gun_emplacement']; i++){
                if (Math.rand(0,Math.round(gun_base)) === 0){
                    day_report.gun_emplacements[i+1].gem = true;
                    day_report.stats.gems.guns++;
                    global.resource.Soul_Gem.amount++;
                }
            }
        }

        if (forgeOperating){
            day_report.soul_forge = { kills: 0, gem: false, gem_craft: false, corrupt: false };
            let forgeKills = Math.rand(25,150);
            day_report.stats.kills.soul_forge = forgeKills;
            day_report.soul_forge.kills = forgeKills;
            global.stats.dkills += forgeKills;
            global.portal.soul_forge.kills += forgeKills;
            let forge_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 4500 : 5000;
            if (Math.rand(0,forge_base) === 0){
                day_report.soul_forge.gem = true;
                day_report.stats.gems.soul_forge++;
                global.resource.Soul_Gem.amount++;
            }
        }

        let cap = global.tech.hell_pit >= 6 ? 750000 : 1000000;
        if (global.tech.hell_pit >= 7 && p_on['soul_attractor'] > 0){
            cap *= 0.97 ** p_on['soul_attractor'];
        }
        if (forgeOperating && global.portal.soul_forge.kills >= Math.round(cap)){
            day_report.soul_forge.gem_craft = true;
            global.portal.soul_forge.kills = 0;
            let c_max = 10 - p_on['soul_attractor'] > 0 ? 10 - p_on['soul_attractor'] : 1;
            if (global.tech.high_tech >= 16 && !global.tech['corrupt'] && Math.rand(0,c_max + 1) === 0){
                day_report.soul_forge.corrupt = true;
                global.resource.Corrupt_Gem.amount++;                  
                global.resource.Corrupt_Gem.display = true;
                messageQueue(loc('portal_corrupt_gem'),'info',false,['progress','hell']);
                global.tech['corrupt'] = 1;
                drawTech();
            }
            else {
                global.resource.Soul_Gem.amount++;
                day_report.stats.gems.crafted++;
            }
        }
    }

    if (global.tech['hell_gate'] && global.tech['hell_gate'] >= 3){
        if (forgeOperating && p_on['gate_turret']){
            day_report.gate_turrets = {};
            let gunKills = 0;
            let min = global.tech.hell_gun >= 2 ? 65 : 40;
            let max = global.tech.hell_gun >= 2 ? 100 : 60;
            for (let i=0; i<p_on['gate_turret']; i++){
                day_report.gate_turrets[i+1] = { kills: 0, gem: false };
                let kills = Math.rand(min,max);
                gunKills += kills;
                day_report.gate_turrets[i+1].kills = kills;
            }
            day_report.stats.kills.turrets = gunKills;
            global.portal.soul_forge.kills += gunKills;
            global.stats.dkills += gunKills;
            let gun_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 2700 : 3000;
            for (let i=0; i<p_on['gate_turret']; i++){
                if (Math.rand(0,Math.round(gun_base)) === 0){
                    day_report.gate_turrets[i+1].gem = true;
                    day_report.stats.gems.turrets++;
                    global.resource.Soul_Gem.amount++;
                }
            }
        }
    }
    
    global.portal.observe.stats.total.days++;
    global.portal.observe.stats.period.days++;
    Object.keys(day_report.stats).forEach(function(stat){
        if (['kills','gems'].includes(stat)){
            Object.keys(day_report.stats[stat]).forEach(function(subStat){
                if (stat === 'gems' && day_report.stats[stat][subStat]){
                    day_report.foundGem = true;
                }
                global.portal.observe.stats.total[stat][subStat] += day_report.stats[stat][subStat];
                global.portal.observe.stats.period[stat][subStat] += day_report.stats[stat][subStat];
            });
        }
        else {
            global.portal.observe.stats.total[stat] += day_report.stats[stat];
            global.portal.observe.stats.period[stat] += day_report.stats[stat];
        }
    });
    if (!hell_reports[`year-${global.city.calendar.year}`]){
        hell_reports[`year-${global.city.calendar.year}`] = {};
    }
    hell_reports[`year-${global.city.calendar.year}`][`day-${global.city.calendar.day}`] = day_report;
    
    purgeReports();
    
    Object.keys(global.portal.observe.graphs).forEach(function (id){
        if (!!document.getElementById(global.portal.observe.graphs[id].chartID)){
            let newData = [];
            hell_graphs[id].data.forEach(function (dataPoint){
                newData.push(dataPoint.length === 3 ? global.portal.observe.stats[dataPoint[0]][dataPoint[1]][dataPoint[2]] : global.portal.observe.stats[dataPoint[0]][dataPoint[1]]);
            });
            hell_graphs[id].graph.data.datasets[0].data = newData;
            hell_graphs[id].graph.update();
        }
    });
}

export function hellSupression(area, val){
    switch (area){
        case 'ruins':
            {
                let army = val || jobScale(p_on['guard_post']);
                let arc = (p_on['arcology'] || 0) * 75;
                let aRating = armyRating(army,'hellArmy',0);
                if (global.race['holy']){
                    aRating *= 1 + (traits.holy.vars()[1] / 100);
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
                    turret *= 1 + (traits.holy.vars()[1] / 100);
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

export function mechCost(size,infernal){
    let soul = 9999;
    let cost = 10000000;
    switch (size){
        case 'small':
            {
                let baseCost = global.blood['prepared'] && global.blood.prepared >= 2 ? 50000 : 75000;
                cost = infernal ? baseCost * 2.5 : baseCost;
                soul = infernal ? 20 : 1;
            }
            break;
        case 'medium':
            {
                cost = infernal ? 450000 : 180000;
                soul = infernal ? 100 : 4;
            }
            break;
        case 'large':
            {
                cost = infernal ? 925000 : 375000;
                soul = infernal ? 500 : 20;
            }
            break;
        case 'titan':
            {
                cost = infernal ? 1500000 : 750000;
                soul = infernal ? 1500 : 75;
            }
            break;
        case 'collector':
            {
                let baseCost = global.blood['prepared'] && global.blood.prepared >= 2 ? 8000 : 10000;
                cost = infernal ? baseCost * 2.5 : baseCost;
                soul = 1;
            }
            break;
    }
    return { s: soul, c: cost };
};

function bossResists(boss){
    let weak = `laser`;
    let resist = `laser`;
    
    Object.keys(monsters[boss].weapon).forEach(function(weapon){
        if (monsters[boss].weapon[weapon] > monsters[boss].weapon[weak]){
            weak = weapon;
        }
        if (monsters[boss].weapon[weapon] < monsters[boss].weapon[resist]){
            resist = weapon;
        }
    });
    if (weak === resist){
        weak = 'none';
        resist = 'none';
    }
    return { w: weak, r: resist };
}

export function drawMechLab(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 4)){
        return;
    }
    clearElement($('#mechLab'));
    if (global.portal.hasOwnProperty('mechbay') && global.settings.showMechLab){
        let lab = $(`#mechLab`);

        if (!global.portal.mechbay.hasOwnProperty('blueprint')){
            global.portal.mechbay['blueprint'] = {
                size: 'small',
                hardpoint: ['laser'],
                chassis: 'tread',
                equip: [],
                infernal: false
            };
        }

        let assemble = $(`<div id="mechAssembly" class="mechAssembly"></div>`);
        lab.append(assemble);

        let title = $(`<div><span class="has-text-caution">${loc(`portal_mech_assembly`)}</span> - <span>{{ b.size | slabel }} {{ b.chassis | clabel }}</span></div>`);
        assemble.append(title);

        title.append(` | <span><span class="has-text-warning">${loc('portal_mech_bay_space')}</span>: {{ m.bay }} / {{ m.max }}</span>`);
        title.append(` | <span><span class="has-text-warning">${loc('portal_mech_sup_avail')}</span>: {{ p.supply | round }} / {{ p.sup_max }}</span>`);

        let infernal = global.blood['prepared'] && global.blood.prepared >= 3 ? `<b-checkbox class="patrol" v-model="b.infernal">${loc('portal_mech_infernal')} (${loc('portal_mech_infernal_effect',[25])})</b-checkbox>` : ``;
        assemble.append(`<div><span class="has-text-warning">${loc(`portal_mech_space`)}</span> <span class="has-text-danger">{{ b.size | bay }}</span> | <span class="has-text-warning">${loc(`portal_mech_cost`)}</span> <span class="has-text-danger">{{ b.size | price }}</span> | <span class="has-text-warning">${loc(`portal_mech_soul`,[global.resource.Soul_Gem.name])}</span> <span class="has-text-danger">{{ b.size | soul }}</span>${infernal}</div>`)
        assemble.append(`<div>{{ b.size | desc }}</div>`);

        let options = $(`<div class="bayOptions"></div>`);
        assemble.append(options);

        let sizes = ``;
        ['small','medium','large','titan','collector'].forEach(function(size,idx){
            sizes += `<b-dropdown-item aria-role="listitem" v-on:click="setSize('${size}')" class="size r0 a${idx}" data-val="${size}">${loc(`portal_mech_size_${size}`)}</b-dropdown-item>`;
        });

        options.append(`<b-dropdown :triggers="['hover']" aria-role="list">
            <button class="button is-info" slot="trigger">
                <span>${loc(`portal_mech_size`)}: {{ b.size | slabel }}</span>
                <b-icon icon="menu-down"></b-icon>
            </button>${sizes}
        </b-dropdown>`);

        let chassis = ``;
        ['wheel','tread','biped','quad','spider','hover'].forEach(function(val,idx){
            chassis += `<b-dropdown-item aria-role="listitem" v-on:click="setType('${val}')" class="chassis r0 a${idx}" data-val="${val}">${loc(`portal_mech_chassis_${val}`)}</b-dropdown-item>`;
        });

        options.append(`<b-dropdown :triggers="['hover']" aria-role="list">
            <button class="button is-info" slot="trigger">
                <span>${loc(`portal_mech_type`)}: {{ b.chassis | clabel }}</span>
                <b-icon icon="menu-down"></b-icon>
            </button>${chassis}
        </b-dropdown>`);

        for (let i=0; i<4; i++){
            let weapons = ``;
            ['laser','kinetic','shotgun','missile','flame','plasma','sonic','tesla'].forEach(function(val,idx){
                weapons += `<b-dropdown-item aria-role="listitem" v-on:click="setWep('${val}',${i})" class="weapon r${i} a${idx}" data-val="${val}">${loc(`portal_mech_weapon_${val}`)}</b-dropdown-item>`;
            });

            options.append(`<b-dropdown :triggers="['hover']" aria-role="list" v-show="vis(${i})">
                <button class="button is-info" slot="trigger">
                    <span>${loc(`portal_mech_weapon`)}: {{ b.hardpoint[${i}] || 'laser' | wlabel }}</span>
                    <b-icon icon="menu-down"></b-icon>
                </button>${weapons}
            </b-dropdown>`);
        }

        let e_cap = global.blood['prepared'] ? 5 : 4;
        for (let i=0; i<e_cap; i++){
            let equip = ``;
            ['special','shields','sonar','grapple','infrared','flare','radiator','coolant','ablative','stabilizer','seals'].forEach(function(val,idx){
                equip += `<b-dropdown-item aria-role="listitem" v-on:click="setEquip('${val}',${i})" class="equip r${i} a${idx}" data-val="${val}">{{ '${val}' | equipment }}</b-dropdown-item>`;
            });

            options.append(`<b-dropdown :triggers="['hover']" aria-role="list" v-show="eVis(${i})">
                <button class="button is-info" slot="trigger">
                    <span>${loc(`portal_mech_equipment`)}: {{ b.equip[${i}] || 'shields' | equipment }}</span>
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
                    let costs = mechCost(global.portal.mechbay.blueprint.size,global.portal.mechbay.blueprint.infernal);

                    let cost = costs.c;
                    let soul = costs.s;
                    let size = mechSize(global.portal.mechbay.blueprint.size);

                    let avail = global.portal.mechbay.max - global.portal.mechbay.bay;
                    if (global.portal.purifier.supply >= cost && avail >= size && global.resource.Soul_Gem.amount >= soul){
                        global.portal.purifier.supply -= cost;
                        global.resource.Soul_Gem.amount -= soul;
                        let mech = deepClone(global.portal.mechbay.blueprint);
                        global.portal.mechbay.mechs.push(mech);
                        global.portal.mechbay.bay += size;
                        global.portal.mechbay.active++;
                    }
                },
                setSize(s){
                    global.portal.mechbay.blueprint.size = s;
                    if (s === 'collector'){
                        global.portal.mechbay.blueprint.hardpoint.length = 0;
                    }
                    else if (s === 'small' || s === 'medium'){
                        if (global.portal.mechbay.blueprint.hardpoint.length === 0){
                            global.portal.mechbay.blueprint.hardpoint.push('laser');
                        }
                        global.portal.mechbay.blueprint.hardpoint.length = 1;
                    }
                    else {
                        if (global.portal.mechbay.blueprint.hardpoint.length === 0){
                            global.portal.mechbay.blueprint.hardpoint.push('laser');
                        }
                        if (global.portal.mechbay.blueprint.hardpoint.length === 1){
                            global.portal.mechbay.blueprint.hardpoint.push(global.portal.mechbay.blueprint.hardpoint.includes('laser') ? 'plasma' : 'laser');
                        }
                        if (s === 'titan'){
                            if (global.portal.mechbay.blueprint.hardpoint.length === 2){
                                global.portal.mechbay.blueprint.hardpoint.push(global.portal.mechbay.blueprint.hardpoint.includes('laser')  ? 'shotgun' : 'laser');
                                global.portal.mechbay.blueprint.hardpoint.push(global.portal.mechbay.blueprint.hardpoint.includes('laser')  ? 'kinetic' : 'laser');
                            }
                        }
                        else {
                            global.portal.mechbay.blueprint.hardpoint.length = 2;
                        }
                    }
                    switch (s){
                        case 'small':
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push('special');
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 1 : 0;
                            break;
                        case 'medium':
                            if (global.portal.mechbay.blueprint.equip.length < 1){
                                global.portal.mechbay.blueprint.equip.push('special');
                            }
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push('shields');
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 2 : 1;
                            break;
                        case 'collector':
                        case 'large':
                            if (global.portal.mechbay.blueprint.equip.length < 1){
                                global.portal.mechbay.blueprint.equip.push('special');
                            }
                            if (global.portal.mechbay.blueprint.equip.length < 2){
                                global.portal.mechbay.blueprint.equip.push('shields');
                            }
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push('grapple');
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 3 : 2;
                            break;
                        case 'titan':
                            if (global.portal.mechbay.blueprint.equip.length < 1){
                                global.portal.mechbay.blueprint.equip.push('special');
                            }
                            if (global.portal.mechbay.blueprint.equip.length < 2){
                                global.portal.mechbay.blueprint.equip.push('shields');
                            }
                            if (global.portal.mechbay.blueprint.equip.length < 3){
                                global.portal.mechbay.blueprint.equip.push('grapple');
                            }
                            if (global.portal.mechbay.blueprint.equip.length < 4){
                                global.portal.mechbay.blueprint.equip.push('seals');
                            }
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push('stabilizer');
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 5 : 4;
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
                    if (global.portal.mechbay.blueprint.size === 'collector'){
                        return false;
                    }
                    if (hp === 0 || (global.portal.mechbay.blueprint.size === 'large' && hp < 2) || global.portal.mechbay.blueprint.size === 'titan'){
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
                        case 'collector':
                        case 'large':
                            return es <= (1 + prep) ? true : false;
                        case 'titan':
                            return true;
                    }
                }
            },
            filters: {
                bay(s){
                    return mechSize(s);
                },
                price(s){
                    let costs = mechCost(s,global.portal.mechbay.blueprint.infernal);
                    return costs.c;
                },
                soul(s){
                    let costs = mechCost(s,global.portal.mechbay.blueprint.infernal);
                    return costs.s;
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
                desc(s){
                    return loc(`portal_mech_size_${s}_desc`);
                },
                round(v){
                    return Math.round(v);
                },
                equipment(e){
                    if (e !== 'special'){
                        return loc(`portal_mech_equip_${e}`);
                    }
                    let type = 'jumpjet';
                    switch (global.portal.mechbay.blueprint.size){
                        case 'large':
                            type = 'battery';
                            break;
                        case 'titan':
                            type = 'target';
                            break;
                    }
                    return loc(`portal_mech_equip_${type}`);
                }
            }
        });

        ['size','chassis','weapon','equip'].forEach(function(type){
            let range = 1;
            if (type === 'weapon'){
                range = 4;
            }
            else if (type === 'equip'){
                range = e_cap;
            }

            for (let idx=0; idx<range; idx++){
                for (let i=0; i<$(`#mechAssembly .${type}.r${idx}`).length; i++){
                    popover(`mechAssembly${type}${idx}${i}`, function(obj){
                        let val = $(obj.this).attr(`data-val`);
                        if (val === 'special'){
                            switch (global.portal.mechbay.blueprint.size){
                                case 'large':
                                    val = 'battery';
                                    break;
                                case 'titan':
                                    val = 'target';
                                    break;
                                default:
                                    val = 'jumpjet';
                                    break;
                            }
                        }
                        return loc(`portal_mech_${type}_${val}_desc`);
                    },
                    {
                        elm: `#mechAssembly .${type}.r${idx}.a${i}`,
                        placement: 'right'
                    });
                }
            }
        });

        let mechs = $(`<div id="mechList" class="sticky mechList"></div>`);
        lab.append(mechs);
        drawMechs();
    }
}

function drawMechs(){
    clearMechDrag();
    clearElement($('#mechList'));
    let list = $('#mechList');

    list.append(`
      <div v-for="(mech, index) of mechs" :key="index" class="mechRow" :class="index < active ? '' : 'inactive-row' ">
        <a class="scrap" @click="scrap(index)">${loc('portal_mech_scrap')}</a>
        <span> | </span><span>${loc('portal_mech')} #{{index + 1}}: </span>
        <span class="has-text-caution">{{ mech.infernal ? "${loc('portal_mech_infernal')} " : "" }}{{ mech | size }} {{ mech | chassis }}</span>
        <div :class="'gearList '+mech.size">
          <div>
            <template v-for="hp of mech.hardpoint">
              <span> | </span>
              <span class="has-text-danger">{{ hp | weapon }}</span>
            </template>
          </div>
          <div>
            <template v-for="eq of mech.equip">
              <span> | </span>
              <span class="has-text-warning">{{ eq, mech.size | equipment }}</span>
            </template>
          </div>
        </div>
      </div>`);

    vBind({
        el: '#mechList',
        data: global.portal.mechbay,
        methods: {
            scrap(id){
                if (global.portal.mechbay.mechs[id]){
                    let costs = mechCost(global.portal.mechbay.mechs[id].size,global.portal.mechbay.mechs[id].infernal);
                    let size = mechSize(global.portal.mechbay.mechs[id].size);
                    global.portal.purifier.supply += Math.floor(costs.c / 3);
                    global.resource.Soul_Gem.amount += Math.floor(costs.s / 2);

                    if (global.portal.purifier.supply > global.portal.purifier.sup_max){
                        global.portal.purifier.supply = global.portal.purifier.sup_max;
                    }
                    global.portal.mechbay.mechs.splice(id,1);
                    global.portal.mechbay.bay -= size;
                    global.portal.mechbay.active--;
                }
            }
        },
        filters: {
            equipment(e,size){
                if (e !== 'special'){
                    return loc(`portal_mech_equip_${e}`);
                }
                let type = 'jumpjet';
                switch (size){
                    case 'large':
                        type = 'battery';
                        break;
                    case 'titan':
                        type = 'target';
                        break;
                }
                return loc(`portal_mech_equip_${type}`);
            },
            weapon(hp) {
                return loc(`portal_mech_weapon_${hp}`);
            },
            size(m) {
                return loc(`portal_mech_size_${m.size}`);
            },
            chassis(m) {
                return loc(`portal_mech_chassis_${m.chassis}`);
            }
        }
    });

    dragMechList();

    $(`#mechList .scrap`).each(function(i, node){
        popover(`mechList-scrap${i}`, function(){
            let costs = mechCost(global.portal.mechbay.mechs[i].size,global.portal.mechbay.mechs[i].infernal);
            return loc(`portal_mech_scrap_refund`,[Math.floor(costs.c / 3),Math.floor(costs.s / 2)]);
        },
        {
            elm: node,
        });
    });
}

export function mechSize(s){
    switch (s){
        case 'small':
            return 2;
        case 'medium':
            return global.blood['prepared'] && global.blood.prepared >= 2 ? 4 : 5;
        case 'large':
            return global.blood['prepared'] && global.blood.prepared >= 2 ? 8 : 10;
        case 'titan':
            return global.blood['prepared'] && global.blood.prepared >= 2 ? 20 : 25;
        case 'collector':
            return 1;
        case 'default':
            return 25;
    }
}

export function clearMechDrag(){
    let el = $('#mechList')[0];
    if (el){
        let sort = Sortable.get(el);
        if (sort){
            sort.destroy();
        }
    }
}

function dragMechList(){
    let el = $('#mechList')[0];
    Sortable.create(el,{
        onEnd(e){
            let items = e.from.querySelectorAll(':scope > .mechRow');
            e.from.insertBefore(e.item, items[e.oldIndex + (e.oldIndex > e.newIndex)]);

            let order = global.portal.mechbay.mechs;
            order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
            updateMechbay();
        }
    });
}

export function updateMechbay(){
    let max = (spire_on['mechbay'] || 0) * 25;
    let bay = 0;
    let active = 0;
    let scouts = 0;
    for (let mech of global.portal.mechbay.mechs) {
        bay += mechSize(mech.size);
        if (bay <= max){
            active++;
            if (mech.size === 'small') {
                scouts++;
            }
        }
    }
    global.portal.mechbay.bay = bay;
    global.portal.mechbay.max = max;
    global.portal.mechbay.active = active;
    global.portal.mechbay.scouts = scouts;
}

export function genSpireFloor(){
    let types = ['sand','swamp','forest','jungle','rocky','gravel','muddy','grass','brush','concrete'];
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

function terrainRating(mech,rating,effects){
    if (mech.equip.includes('special') && (mech.size === 'small' || mech.size === 'medium' || mech.size === 'collector')){
        if (rating < 1){
            rating += (1 - rating) * (effects.includes('gravity') ? 0.1 : 0.2);
        }
    }
    if (mech.size !== 'small' && rating < 1){
        rating += (effects.includes('fog') || effects.includes('dark') ? 0.005 : 0.01) * global.portal.mechbay.scouts;
        if (rating > 1){
            rating = 1;
        }
    }
    return rating;
}

function weaponPower(mech,power){
    if (power < 1 && power !== 0){
        if (mech.equip.includes('special') && mech.size === 'titan'){
            power += (1 - power) * 0.25;
        }
    }
    if (mech.equip.includes('special') && mech.size === 'large'){
        power *= 1.02;
    }
    return power;
}

function statusEffect(mech,effect){
    let rating = 1;
    switch (effect){
        case 'freeze':
            {
                if (!mech.equip.includes('radiator')){
                    rating = 0.25;
                }
            }
            break;
        case 'hot':
            {
                if (!mech.equip.includes('coolant')){
                    rating = 0.25;
                }
            }
            break;
        case 'corrosive':
            {
                if (!mech.equip.includes('ablative')){
                    rating = mech.equip.includes('shields') ? 0.75 : 0.25;
                }
            }
            break;
        case 'humid':
            {
                if (!mech.equip.includes('seals')){
                    rating = 0.75;
                }
            }
            break;
        case 'windy':
            {
                if (mech.chassis === 'hover'){
                    rating = 0.5;
                }
            }
            break;
        case 'hilly':
            {
                if (mech.chassis !== 'spider'){
                    rating = 0.75;
                }
            }
            break;
        case 'mountain':
            {
                if (mech.chassis !== 'spider' && !mech.equip.includes('grapple')){
                    rating = mech.equip.includes('flare') ? 0.75 : 0.5;
                }
            }
            break;
        case 'radioactive':
            {
                if (!mech.equip.includes('shields')){
                    rating = 0.5;
                }
            }
            break;
        case 'quake':
            {
                if (!mech.equip.includes('stabilizer')){
                    rating = 0.25;
                }
            }
            break;
        case 'dust':
            {
                if (!mech.equip.includes('seals')){
                    rating = 0.5;
                }
            }
            break;
        case 'river':
            {
                if (mech.chassis !== 'hover'){
                    rating = 0.65;
                }
            }
            break;
        case 'tar':
            {
                if (mech.chassis !== 'quad'){
                    rating = mech.chassis === 'tread' || mech.chassis === 'wheel' ? 0.5 : 0.75;
                }
            }
            break;
        case 'steam':
            {
                if (!mech.equip.includes('shields')){
                    rating = 0.75;
                }
            }
            break;
        case 'flooded':
            {
                if (mech.chassis !== 'hover'){
                    rating = 0.35;
                }
            }
            break;
        case 'fog':
            {
                if (!mech.equip.includes('sonar')){
                    rating = 0.2;
                }
            }
            break;
        case 'rain':
            {
                if (!mech.equip.includes('seals')){
                    rating = 0.75;
                }
            }
            break;
        case 'hail':
            {
                if (!mech.equip.includes('ablative') && !mech.equip.includes('shields')){
                    rating = 0.75;
                }
            }
            break;
        case 'chasm':
            {
                if (!mech.equip.includes('grapple')){
                    rating = 0.1;
                }
            }
            break;
        case 'dark':
            {
                if (!mech.equip.includes('infrared')){
                    rating = mech.equip.includes('flare') ? 0.25 : 0.1;
                }
            }
            break;
        case 'gravity':
            {
                switch (mech.size){
                    case 'medium':
                        rating = 0.8;
                        break;
                    case 'large':
                        rating = 0.45;
                        break;
                    case 'titan':
                        rating = 0.25;
                        break;
                }
            }
            break;
    }
    return rating;
}

export function terrainEffect(mech,type){
    let terrain = type || global.portal.spire.type;
    let terrainFactor = 1;
    switch (mech.chassis){
        case 'wheel':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.9 : 0.85;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.35 : 0.18;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.92 : 0.85;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.65 : 0.5;
                        break;
                    case 'gravel':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 1 : 0.95;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.85 : 0.58;
                        break;
                    case 'grass':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 1.3 : 1.2;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.9 : 0.8;
                        break;
                    case 'concrete':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 1.1 : 1;
                        break;
                }
            }
            break;
        case 'tread':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 1.15 : 1.1;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.55 : 0.4;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 1 : 0.95;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.95 : 0.9;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.65 : 0.5;
                        break;
                    case 'gravel':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 1.3 : 1.2;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.88 : 0.72;
                        break;
                }
            }
            break;
        case 'biped':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.78 : 0.65;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.68 : 0.5;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 1 : 0.95;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.82 : 0.7;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.48 : 0.4;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.85 : 0.7;
                        break;
                    case 'grass':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 1.25 : 1.2;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.92 : 0.85;
                        break;
                }
            }
            break;
        case 'quad':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.86 : 0.75;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.58 : 0.42;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 1.25 : 1.2;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.95 : 0.9;
                        break;
                    case 'gravel':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.9 : 0.8;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.68 : 0.5;
                        break;
                    case 'grass':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 1 : 0.95;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.95 : 0.9;
                        break;
                }
            }
            break;
        case 'spider':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.75 : 0.65;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.9 : 0.78;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.82 : 0.75;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.77 : 0.65;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 1.25 : 1.2;
                        break;
                    case 'gravel':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.86 : 0.75;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.92 : 0.82;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 1 : 0.95;
                        break;
                }
            }
            break;
        case 'hover':
            {
                switch (terrain){
                    case 'swamp':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 1.35 : 1.2;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.65 : 0.48;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.55 : 0.35;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.82 : 0.68;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 1.15 : 1.08;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium'].includes(mech.size) ? 0.78 : 0.7;
                        break;
                }
            }
            break;
    }
    return terrainFactor;
}

export function mechCollect(mech){
    let rating = mech.infernal ? 31.25 : 25;
    let terrainFactor = terrainEffect(mech);
    let effects = [];
    Object.keys(global.portal.spire.status).forEach(function(effect){
        effects.push(effect);
        rating *= statusEffect(mech,effect);
    });
    rating *= terrainRating(mech,terrainFactor,effects);
    return rating;
}

export function mechWeaponPower(size){
    switch (size){
        case 'small':
            return 0.0025;
        case 'medium':
            return 0.0075;
        case 'large':
            return 0.01;
        case 'titan':
            return 0.012;
        default:
            return 0;
    }
}

export function mechRating(mech,boss){
    let rating = mechWeaponPower(mech.size);
    if (rating === 0){
        return 0;
    }

    if (mech.hasOwnProperty('infernal') && mech.infernal && global.blood['prepared'] && global.blood.prepared >= 3){
        rating *= 1.25;
    }

    if (boss){
        if (global.stats.achieve['gladiator'] && global.stats.achieve.gladiator.l > 0){
            rating *= 1 + global.stats.achieve.gladiator.l * 0.1;
        }
        if (global.blood['wrath']){
            rating *= 1 + (global.blood.wrath / 20);
        }
        if (mech.size === 'titan'){
            rating *= 1.1;
        }

        let affix = universeAffix();
        if (global.stats.spire.hasOwnProperty(affix) && global.stats.spire[affix].hasOwnProperty('dlstr')){
            rating /= 100 + (global.stats.spire[affix].dlstr * 25);
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

        if (global.portal.spire.type === 'concrete'){
            switch (mech.size){
                case 'small':
                    rating *= 0.92;
                    break;
                case 'medium':
                    rating *= 0.95;
                    break;
                case 'titan':
                    rating *= 1.25;
                    break;
            }
        }

        let terrainFactor = terrainEffect(mech);

        let effects = [];
        Object.keys(global.portal.spire.status).forEach(function(effect){
            effects.push(effect);
            rating *= statusEffect(mech,effect);
        });

        rating *= terrainRating(mech,terrainFactor,effects);

        rating /= global.portal.spire.count;
        let damage = 0;
        for (let i=0; i<mech.hardpoint.length; i++){
            let effect = monsters[global.portal.spire.boss].weapon[mech.hardpoint[i]];
            damage += rating * weaponPower(mech,effect);
        }
        return damage;
    }
}


export function drawHellObservations(startup){
    if (!global.settings.tabLoad && global.settings.civTabs !== ($(`#mainTabs > nav ul li`).length - 1) && !startup){
        return;
    }
    let info = $('#mTabObserve');
    clearElement(info);
    
    let observe = $(`<div id="hellObservations"></div>`);
    info.append(observe);
    
    observe.append(`<b-tabs id="hellTabs" class="resTabs" v-model="s.hellTabs" :animated="s.animated" @input="swapTab">
        <b-tab-item id="h_Report">
            <template slot="header">
                <span>${loc('hell_tabs_reports')}</span>
            </template>
        </b-tab-item>
        <b-tab-item id="h_Analysis">
            <template slot="header">
                <span>${loc('hell_tabs_analysis')}</span>
            </template>
        </b-tab-item>
    </b-tabs>`);
    
    vBind({
        el: `#hellObservations`,
        data: {
            s: global.settings
        },
        methods: {
            swapTab(tab){
                if (!global.settings.tabLoad){
                    clearElement($(`#h_Report`));
                    clearElement($(`#h_Analysis`));
                    switch (tab){
                        case 0:
                            drawHellReports();
                            break;
                        case 1:
                            drawHellAnalysis();
                            break;
                    }
                }
                return tab;
            }
        }
    });
    
    if (!global.settings.tabLoad){
        switch (global.settings.hellTabs){
            case 0:
                drawHellReports();
                break;
            case 1:
                drawHellAnalysis();
                break;
        }
    }
    else {
        drawHellReports();
        drawHellAnalysis();
    }
}

function drawHellAnalysis(){
    if (!global.settings.tabLoad && global.settings.hellTabs !== 1){
        return;
    }
    let info = ($(`#h_Analysis`));
    let stats = $(`<div id="hellAnalysis" class="vscroll"></div>`);
    info.append(stats);
    let bd_settings = $(`<div></div>`);
    stats.append(bd_settings);
    let analysis = $(`<div class="hellAnalysis"></div>`);
    stats.append(analysis);
    let breakdown = $(`<div class="hellAnalysis"></div>`);
    analysis.append(breakdown);
    
    let totalAnal = $(`<div id="hellAnalysisTotal" class="analysisColumn"></div>`);
    let partialAnal = $(`<div id="hellAnalysisPeriod" class="analysisColumn"></div>`);
    breakdown.append(totalAnal);
    breakdown.append(partialAnal);
    
    bd_settings.append(`
        <div>
            <h2 class="has-text-warning">${loc('tab_settings')}</h2>
        </div>
        <div>
            <b-checkbox v-model="s.expanded">${loc('hell_analysis_expanded')}</b-checkbox>
            <b-checkbox v-model="s.average">${loc('hell_analysis_average')}</b-checkbox>
            <b-checkbox v-show="r.hyper || r.slow" v-model="s.hyperSlow">${loc('hell_analysis_hyperSlow')}</b-checkbox>
        </div>
        <div>
            <b-radio v-model="s.display" native-value="game_days">${loc('hell_analysis_time_game_days')}</b-radio>
            <b-radio v-model="s.display" native-value="seconds">${loc('hell_analysis_time_seconds')}</b-radio>
            <b-radio v-model="s.display" native-value="minutes">${loc('hell_analysis_time_minutes')}</b-radio>
            <b-radio v-model="s.display" native-value="hours">${loc('hell_analysis_time_hours')}</b-radio>
            <b-radio v-model="s.display" native-value="days">${loc('hell_analysis_time_days')}</b-radio>
        </div>
    `);
    
    vBind({
        el: '#hellAnalysis',
        data: {
            s: global.portal.observe.settings,
            r: global.race
        }
    });
    
    let expandedLocaleNum = function(num,sigFigs){
        num = num.toFixed(sigFigs);
        let whole = Math.floor(num);
        let decimals = (+(num - whole).toFixed(sigFigs)).toString().substring(1);
        return whole.toLocaleString() + decimals;
    };
    
    let calcAverage = function(num,gameDays,units){
        if (num){
            if (units !== 'game_days' && global.portal.observe.settings.hyperSlow){
                if (global.race['slow']){
                    gameDays *= 1 + (traits.slow.vars()[0] / 100);
                }
                if (global.race['hyper']){
                    gameDays *= 1 - (traits.hyper.vars()[0] / 100);
                }
            }
            num /= gameDays;
            switch (units){
                case 'seconds':
                    num /= 5;
                    break;
                case 'minutes':
                    num *= 12;
                    break;
                case 'hours':
                    num *= 720;
                    break;
                case 'days':
                    num *= 17280;
                    break;
                default:
                    break;
            }
            num = global.portal.observe.settings.expanded ? expandedLocaleNum(num,5) : sizeApproximation(num,5,true);
        }
        return loc('hell_analysis_time_average',[num,loc(`hell_analysis_time_${units}_abbr`)])
    };
    
    let drawStats = function(id,type){
        if (!id){
            return;
        }
        let elem = $(`#${id}`)
        clearElement(elem);
        
        elem.append(`
            <div><h2 class="has-text-warning">${loc('hell_analysis_' + type)}</h2>${type === 'period' ? '<h2 id="resetHellObservation" class="text-button has-text-danger" @click="resetObservations()">{{ | resetLabel }}</h2>' : ''}</div>
            <div><h2 class="has-text-alert">{{ st.${type}.start | startLabel }}</h2></div>
            <div><h2>{{ st.${type}.days, s.display | time }}</h2></div>
            <div><h2>{{ st.${type}.kills, 'kills', s.average | genericMulti }}</h2><h2 class="text-button has-text-advanced" aria-label="${loc('hell_analysis_toggle_bd',[loc('hell_analysis_toggle_bd_kills')])}" @click="toggleDropdown('dropKills')">{{ s.dropKills | dropdownLabel }}</h2></div>
            <div v-show="s.dropKills">
                <div v-show="p.war_drone"><h2>{{ st.${type}.kills.drones, 'kills_drones', s.average | genericSub }}</h2></div>
                <div><h2>{{ st.${type}.kills.patrols, 'kills_patrols', s.average | genericSub }}</h2></div>
                <div><h2>{{ st.${type}.kills.sieges, 'kills_sieges', s.average | genericSub }}</h2></div>
                <div v-show="p.gun_emplacement"><h2>{{ st.${type}.kills.guns, 'kills_guns', s.average | genericSub }}</h2></div>
                <div v-show="p.soul_forge"><h2>{{ st.${type}.kills.soul_forge, 'kills_soul_forge', s.average | genericSub }}</h2></div>
                <div v-show="p.gate_turret"><h2>{{ st.${type}.kills.turrets, 'kills_turrets', s.average | genericSub }}</h2></div>
            </div>
            <div v-show="sg.display"><h2>{{ st.${type}.gems, 'gems', s.average | genericMulti }}</h2><h2 class="text-button has-text-advanced" aria-label="${loc('hell_analysis_toggle_bd',[loc('resource_Soul_Gem_name')])}" @click="toggleDropdown('dropGems')">{{ s.dropGems | dropdownLabel }}</h2></div>
            <div v-show="sg.display && s.dropGems">
                <div><h2>{{ st.${type}.gems.patrols, 'gems_patrols', s.average | genericSub }}</h2></div>
                <div v-show="p.gun_emplacement"><h2>{{ st.${type}.gems.guns, 'gems_guns', s.average | genericSub }}</h2></div>
                <div v-show="p.soul_forge"><h2>{{ st.${type}.gems.soul_forge, 'gems_soul_forge', s.average | genericSub }}</h2></div>
                <div v-show="p.soul_forge"><h2>{{ st.${type}.gems.crafted, 'gems_crafted', s.average | genericSub }}</h2></div>
                <div v-show="p.gate_turret"><h2>{{ st.${type}.gems.turrets, 'gems_turrets', s.average | genericSub }}</h2></div>
                <div v-show="p.war_drone && p.carport"><h2>{{ st.${type}.gems.surveyors, 'gems_surveyors', s.average | genericSub }}</h2></div>
            </div>
            <div><h2>{{ st.${type}.wounded, 'wounded', s.average | generic }}</h2></div>
            <div><h2>{{ st.${type}.died, 'died', s.average | generic }}</h2></div>
            <div v-show="r.revive"><h2>{{ st.${type}.revived, 'revived', s.average | generic }}</h2></div>
            <div><h2>{{ st.${type}.surveyors, 'surveyors', s.average | generic }}</h2></div>
            <div><h2>{{ st.${type}.sieges, 'sieges', s.average | generic }}</h2></div>
        `);
    
        vBind({
            el: `#${id}`,
            data: {
                st: global.portal.observe.stats,
                s: global.portal.observe.settings,
                p: global.portal,
                r: global.race,
                sg: global.resource.Soul_Gem
            },
            methods: {
                resetObservations(){
                    Object.keys(global.portal.observe.stats.period).forEach(function(stat){
                        if (['kills','gems'].includes(stat)){
                            Object.keys(global.portal.observe.stats.period[stat]).forEach(function(subStat){
                                global.portal.observe.stats.period[stat][subStat] = 0;
                            });
                        }
                        else if (stat === 'start'){
                            global.portal.observe.stats.period.start = { year: global.city.calendar.year, day: global.city.calendar.day }
                        }
                        else {
                            global.portal.observe.stats.period[stat] = 0;
                        }
                    });
                },
                toggleDropdown(type){
                    global.portal.observe.settings[type] = !global.portal.observe.settings[type];
                }
            },
            filters: {
                generic(num, name, average){
                    if (!average){
                        return loc('hell_analysis_number_display',[loc(`hell_analysis_${name}`),global.portal.observe.settings.expanded ? (+(num).toFixed(5)).toLocaleString() : sizeApproximation(num,5,true)]);
                    }
                    return loc('hell_analysis_number_display',[loc(`hell_analysis_${name}`),calcAverage(num,global.portal.observe.stats[type].days,global.portal.observe.settings.display)]);
                },
                genericSub(num, name, average){
                    if (!average){
                        return 'ᄂ' + loc('hell_analysis_number_display',[loc(`hell_analysis_${name}`),global.portal.observe.settings.expanded ? (+(num).toFixed(5)).toLocaleString() : sizeApproximation(num,5,true)]);
                    }
                    return 'ᄂ' + loc('hell_analysis_number_display',[loc(`hell_analysis_${name}`),calcAverage(num,global.portal.observe.stats[type].days,global.portal.observe.settings.display)]);
                },
                genericMulti(group, name, average){
                    let num = 0;
                    Object.keys(group).forEach(function(type){
                        num += group[type];
                    });
                    if (!average){
                        return loc('hell_analysis_number_display',[loc(`hell_analysis_${name}`),global.portal.observe.settings.expanded ? (+(num).toFixed(5)).toLocaleString() : sizeApproximation(num,5,true)]);
                    }
                    return loc('hell_analysis_number_display',[loc(`hell_analysis_${name}`),calcAverage(num,global.portal.observe.stats[type].days,global.portal.observe.settings.display)]);
                },
                time(days, units){
                    if (units !== 'game_days' && global.portal.observe.settings.hyperSlow){
                        if (global.race['slow']){
                            days *= 1 + (traits.slow.vars()[0] / 100);
                        }
                        if (global.race['hyper']){
                            days *= 1 - (traits.hyper.vars()[0] / 100);
                        }
                    }
                    switch (units){
                        case 'seconds':
                            days *= 5;
                            break;
                        case 'minutes':
                            days /= 12;
                            break;
                        case 'hours':
                            days /= 720;
                            break;
                        case 'days':
                            days /= 17280;
                            break;
                        default:
                            break;
                    }
                    return loc('hell_analysis_time',[loc(`hell_analysis_time_${units}`),global.portal.observe.settings.expanded ? expandedLocaleNum(days,8) : sizeApproximation(days,5,true)]);
                },
                resetLabel(){
                    return loc('hell_analysis_period_reset');
                },
                startLabel(start){
                    return loc('hell_analysis_start',[start.year, start.day]);
                },
                dropdownLabel(open){
                    return open ? '⮝' : '⮟';
                }
            }
        });
    }
    drawStats('hellAnalysisTotal','total');
    drawStats('hellAnalysisPeriod','period');
    
    stats = ($(`#hellAnalysis`));
    let graphs = $(`<div></div>`);
    stats.append(graphs);
    graphs.append(`<div><h2 id="hellGraphCreator" class="text-button has-text-success" @click="createGraph()">${loc('hell_graph_create')}</h2></div>`);
    let graphArea = $(`<div id="hellGraphingArea" class="graphingArea"></div>`);
    graphs.append(graphArea);
    
    vBind({
        el: '#hellGraphCreator',
        methods: {
            createGraph(){
                let modal = {
                    template: '<div id="modalBox" class="modalBox"></div>'
                };
                this.$buefy.modal.open({
                    parent: this,
                    component: modal
                });

                let checkExist = setInterval(function(){
                    if ($('#modalBox').length > 0){
                        clearInterval(checkExist);
                        $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('hell_graph_title')}</p>`));

                        var body = $('<div id="specialModal" class="modalBody vscroll"></div>');
                        $('#modalBox').append(body);
                        let creator = $(`<div class="graphCreator"></div>`);
                        body.append(creator);

                        let settings = {
                            chartType: 'pie',
                            name: '',
                            chartName: '',
                            data: [],
                            radioFake: '',
                            showGroups: true
                        };
                        let error = {
                            show: false,
                            message: ''
                        }
                        
                        creator.append(`
                            <div><h2 class="has-text-warning">${loc('hell_graph_name')}</h2> <b-input v-model="s.name" :input="nameUpdate(s.name)"></b-input></div>
                        `)
                        creator.append(`
                            <div>
                                <div>
                                    <h2 class="has-text-warning">${loc('hell_graph_type')}</h2>
                                </div>
                                <div>
                                    <b-radio v-model="s.chartType" native-value="pie" @click.native="dataOptions('pie')">${loc('hell_graph_pie')}</b-radio>
                                </div>
                            </div>
                        `);
                        
                        let dataRegion = $(`<div id="graphDataSelection"></div>`);
                        creator.append(dataRegion); 
                        dataRegion.append(`<div><h2 class="has-text-warning">${loc('hell_graph_data')}</h2></div>`);
                        Object.keys(global.portal.observe.stats).forEach(function(dataSet){
                            ['kills','gems'].forEach(function(group){
                                dataRegion.append(`<div>
                                    <b-radio v-show="${group === 'gems' ? 'sg.display && ' : ''}s.showGroups" v-model="s.radioFake" native-value="${dataSet}${group}" @click.native="setData('${dataSet}','${group}')">${loc('hell_graph_datapoint',[loc(`hell_analysis_${dataSet}`),loc(`hell_analysis_${group}`)])}</b-radio>
                                </div>`);
                            });
                        });

                        creator.append(`
                            <div>
                                <div v-show="e.show">
                                    <h2 class="has-text-danger">{{ e.message }}</h2>
                                </div>
                                <div>
                                    <button class="button" @click="createGraph()">${loc('hell_graph_create')}</button>
                                </div>
                            </div>
                        `);
                        
                        vBind({
                            el: `#specialModal`,
                            data: {
                                s: settings,
                                e: error,
                                sg: global.resource.Soul_Gem
                            },
                            methods: {
                                nameUpdate(name){
                                    if (settings.chartName !== name){
                                        error.show = false;
                                        settings.chartName = name;
                                    }
                                },
                                dataOptions(type){
                                    switch (type){
                                        case 'pie':
                                            settings.showGroups = true;
                                            break;
                                        case 'bar':
                                            settings.showGroups = false;
                                            break;
                                    }
                                },
                                setData(type,group){
                                    error.show = false;
                                    settings.data = [type,group];
                                },
                                createGraph(){
                                    if (!settings.name){
                                        error.show = true;
                                        error.message = loc('hell_graph_error_name_blank');
                                        return;
                                    }
                                    else if (settings.data.length === 0){
                                        error.show = true;
                                        error.message = loc('hell_graph_error_data_missing');
                                        return;
                                    }
                                    let graphLabels = [];
                                    let graphData = [];
                                    switch(settings.chartType){
                                        case 'pie':
                                            Object.keys(global.portal.observe.stats[settings.data[0]][settings.data[1]]).forEach(function(dataPoint){
                                                graphLabels.push(loc(`hell_analysis_${settings.data[1]}_${dataPoint}`));
                                                graphData.push([settings.data[0],settings.data[1],dataPoint]);
                                            });
                                            break;
                                        case 'bar':
                                            break;
                                    }
                                    let graphID = newGraph(settings.chartName,settings.chartType,graphLabels,graphData,{title: settings.chartName});
                                    drawGraph(graphArea,global.portal.observe.graphs[graphID]);
                                    //Exit the modal
                                    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}));
                                    document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Escape'}));
                                }
                            }
                        });
                    }
                }, 50);
            }
        }
    });
    
    //Draw existing graphs.
    Object.keys(global.portal.observe.graphs).forEach(function(id){
        drawGraph(graphArea,global.portal.observe.graphs[id]);
    });
}

function newGraph(name,type,labels,data,settings){
    let id = `hellGraph-${global.portal.observe.graphID}`;
    global.portal.observe.graphID++;
    global.portal.observe.graphs[id] = {
        id: id,
        chartID: `${id}-chart`,
        name: name,
        type: type,
        labels: labels,
        data: data,
        settings: settings
    };
    return id;
}

function drawGraph(info,graphInfo){
    let id = graphInfo.id;
    if (hell_graphs[id]){
        hell_graphs[id].graph.destroy();
    }
    
    let chartCont = $(`<div id="graph-${id}-container" class="graphContainer"></div>`);
    info.append(chartCont);
    chartCont.append(`<div id="graph-${id}-controls" class="graphControls">
        <div>
            <h2></h2>
            <h2 class="text-button has-text-danger" @click="deleteGraph()">Delete</h2>
        </div>
        <div class="graphTitle">
            <h2>${graphInfo.name}</h2>
        </div>
    </div>`);
    let graph = $(`<div class="graph"></div>`);
    chartCont.append(graph);
    
    vBind({
        el: `#graph-${id}-controls`,
        methods: {
            deleteGraph(){
                hell_graphs[id].graph.destroy();
                delete hell_graphs[id];
                delete global.portal.observe.graphs[id];
                clearElement($(`#graph-${id}-container`),true);
                return;
            }
        }
    });
    
    let newChart = $(`<canvas id="${graphInfo.chartID}"></canvas>`);
    graph.append(newChart);
    
    hell_graphs[id] = {
        data: graphInfo.data
    };
    switch (graphInfo.type){
        case 'pie':
            hell_graphs[id].graph = drawPieChart(newChart,graphInfo.labels,graphInfo.data,graphInfo.settings);
            break;
        default:
            break;
    }
}

function drawPieChart(info,labels,data,settings){
    let drawData = [];
    data.forEach(function (dataPath){
        drawData.push(dataPath.length === 3 ? global.portal.observe.stats[dataPath[0]][dataPath[1]][dataPath[2]] : global.portal.observe.stats[dataPath[0]][dataPath[1]]);
    });
    return new Chart(info, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: drawData,
                backgroundColor: ['rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
                'rgb(201, 203, 207)',
                'rgb(75, 192, 192)',
                '#B86BFF',
                '#48c774'],
                hoverOffset: 4
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function drawHellReports(){
    if (!global.settings.tabLoad && global.settings.hellTabs !== 0){
        return;
    }
    purgeReports();
    
    let list = ``;
    
    let info = ($(`#h_Report`));
    let reports = $(`<div id="hellReport" class="hellReports"></div>`);
    info.append(reports);
    let reportListSection = $(`<div class="reportList vscroll"></div>`);
    reports.append(reportListSection);
    reportListSection.append(`<div id="hellReportLogTitle"><h2 class="has-text-info">${loc('hell_report_log')}</h2><span class="refresh" @click="updateList()" aria-label="${loc('hell_report_log_refresh_aria')}">
        <svg version="1.1" x="0px" y="0px" viewBox="0 0 492.883 492.883" enable-background="new 0 0 492.883 492.883" xml:space="preserve">
            <path d="M122.941,374.241c-20.1-18.1-34.6-39.8-44.1-63.1c-25.2-61.8-13.4-135.3,35.8-186l45.4,45.4c2.5,2.5,7,0.7,7.6-3    l24.8-162.3c0.4-2.7-1.9-5-4.6-4.6l-162.4,24.8c-3.7,0.6-5.5,5.1-3,7.6l45.5,45.5c-75.1,76.8-87.9,192-38.6,282    c14.8,27.1,35.3,51.9,61.4,72.7c44.4,35.3,99,52.2,153.2,51.1l10.2-66.7C207.441,421.641,159.441,407.241,122.941,374.241z"/>
		    <path d="M424.941,414.341c75.1-76.8,87.9-192,38.6-282c-14.8-27.1-35.3-51.9-61.4-72.7c-44.4-35.3-99-52.2-153.2-51.1l-10.2,66.7    c46.6-4,94.7,10.4,131.2,43.4c20.1,18.1,34.6,39.8,44.1,63.1c25.2,61.8,13.4,135.3-35.8,186l-45.4-45.4c-2.5-2.5-7-0.7-7.6,3    l-24.8,162.3c-0.4,2.7,1.9,5,4.6,4.6l162.4-24.8c3.7-0.6,5.4-5.1,3-7.6L424.941,414.341z"/>
        </svg>
    </span></div>`);
    let reportList = $(`<div id="hellReportList"></div>`);
    reportListSection.append(reportList);
    reports.append($(`<div id="hellReportDisplay" class="reportDisplay is-vertical vscroll"></div>`));
    
    let recentDay = { year: 0, day: 0 };
    if (Object.keys(hell_reports).length){
        recentDay.year = Object.keys(hell_reports)[0].split('-')[1];
        recentDay.day = Object.keys(hell_reports[`year-${recentDay.year}`])[0].split('-')[1];
    }

    let updateList = function(startYear,startDay){
        if (purgeReports(true)){
            list = ``;
            startYear = Object.keys(hell_reports)[0].split('-')[1];
            startDay = Object.keys(hell_reports[`year-${recentDay.year}`])[0].split('-')[1];
        }
        for (startYear; startYear<global.city.calendar.year; startYear++){
            for (startDay; startDay<=global.city.calendar.orbit; startDay++){
                list = `
                    <div class="text-button"><span @click="reportLoad('${startYear}','${startDay}')">${loc('year') + " " + startYear + " | " + loc('day') + " " + startDay}</span>${hell_reports[`year-${startYear}`][`day-${startDay}`].foundGem ? '<span class="has-text-advanced">&#9830</span>' : ''}</div>
                ` + list;
            }
            startDay = 1;
        }
        //Remaining days in current year.
        for (startDay; startDay<global.city.calendar.day; startDay++){
            list = `
                <div class="text-button"><span @click="reportLoad('${startYear}','${startDay}')">${loc('year') + " " + startYear + " | " + loc('day') + " " + startDay}</span>${hell_reports[`year-${startYear}`][`day-${startDay}`].foundGem ? `<span class="has-text-advanced" aria-label="${loc(`hell_report_log_soul_gem_aria`)}">&#9830</span>` : ''}</div>
            ` + list;
        }
        recentDay.year = startYear;
        recentDay.day = startDay;
        
        let reportList = ($(`#hellReportList`));
        clearElement(reportList);
        reportList.append(list);
        vBind({
            el: '#hellReportList',
            methods: {
                reportLoad(year,day){
                    loadReport(year,day);
                }
            }
        });
    }

    let loadReport = function(year,day){
        if (!year || !day){
            return;
        }
        let info = $(`#hellReportDisplay`);
        clearElement(info);
        let curr_report = hell_reports[`year-${year}`][`day-${day}`];

        let statsBar = $(`<div id="hellReportStats" class="reportStats"></div>`);
        info.append(statsBar);
        let kills = 0;
        let gems = 0;
        Object.keys(curr_report.stats.kills).forEach(function(killType){
            kills += curr_report.stats.kills[killType];
        });
        Object.keys(curr_report.stats.gems).forEach(function(gemType){
            gems += curr_report.stats.gems[gemType];
        });
        statsBar.append(`<div><h2 class="has-text-info">${loc('hell_report_log_stats',[year,day])}</h2></div>`);
        statsBar.append(`<div>
            <h2>${loc('hell_report_log_stats_kills',[kills])}</h2>
            <h2 v-show="g.display">${loc('hell_report_log_stats_gems',[gems])}</h2>
            <h2>${loc('hell_report_log_stats_wounded',[curr_report.stats.wounded])}</h2>
            <h2>${loc('hell_report_log_stats_died',[curr_report.stats.died])}</h2>
        </div>`);

        info.append(`<div><h2 class="has-text-info">${loc('hell_report_log_report',[year,day])}</h2></div>`);
        info.append(`<p class="has-text-danger">${loc('hell_report_log_start',[curr_report.start])}</p>`);
        if (curr_report.drones){
            Object.keys(curr_report.drones).forEach(function(num){
                let drone = curr_report.drones[num];
                let name = loc('hell_report_log_obj_counter',[loc('portal_war_drone_title'),num]);
                if (drone.encounter){
                    info.append(`<p>${loc('hell_report_log_encounter',[name,drone.kills])}</p>`);
                }
                else {
                    info.append(`<p class="has-text-warning">${loc('hell_report_log_encounter_fail',[name])}</p>`);
                }
            });
        }
        if (curr_report.patrols){
            Object.keys(curr_report.patrols).forEach(function(num){
                let patrol = curr_report.patrols[num];
                let name = loc('hell_report_log_obj_counter',[loc('hell_report_log_patrol'),num]);
                name = patrol.droid ? loc('hell_report_log_patrol_droid',[name]) : name;
                if (patrol.encounter){
                    let displayText = $(`<p></p>`);
                    if (patrol.ambush){
                        displayText.append(`<span class="has-text-warning">${loc('hell_report_log_patrol_ambush',[name,patrol.kills])}</span>`);
                    }
                    else {
                        displayText.append(`<span>${loc('hell_report_log_encounter',[name,patrol.kills])}</span>`);
                    }
                    if (patrol.wounded){
                        displayText.append(`<span class="has-text-danger">${patrol.wounded > 1 ? loc('hell_report_log_patrol_wounded_plural',[patrol.wounded]) : loc('hell_report_log_patrol_wounded')}</span>`);
                    }
                    if (patrol.died){
                        displayText.append(`<span class="has-text-danger">${patrol.died > 1 ? loc('hell_report_log_patrol_killed_plural',[patrol.died]) : loc('hell_report_log_patrol_killed')}</span>`);
                    }
                    if (patrol.gem > 0){
                        displayText.append(`<span class="has-text-success">${loc('hell_report_log_soul_find',[global.resource.Soul_Gem.name,patrol.gem])}</span>`);
                    }
                    info.append(displayText);
                }
                else {
                    info.append(`<p class="has-text-warning">${loc('hell_report_log_encounter_fail',[name])}</p>`);
                }
            });
        }

        if (curr_report.surveyor_finds){
            Object.keys(curr_report.surveyor_finds).forEach(function(num){
                let surveyor = curr_report.surveyor_finds[num];
                let name = loc('hell_report_log_obj_counter',[loc('job_hell_surveyor'),num]);

                let displayText = $(`<p></p>`);
                displayText.append(`<span>${loc('hell_report_log_search',[name,surveyor.bodies])}</span>`);
                if (surveyor.gem > 0){
                    displayText.append(`<span class="has-text-success">${loc('hell_report_log_soul_search',[global.resource.Soul_Gem.name,surveyor.gem])}</span>`);
                }
                info.append(displayText);
            });
        }

        if (curr_report.revived){
            info.append(`<p>${curr_report.revived > 1 ? loc('hell_report_log_revived_plural',[curr_report.revived]) : loc('hell_report_log_revived')}</p>`);
        }
        if (curr_report.patrols_lost){
            info.append(`<p class="has-text-danger">${loc('hell_report_log_patrols_lost',[curr_report.patrols_lost])}</p>`);
        }
        if (curr_report.siege){
            if (curr_report.siege.destroyed){
                info.append(`<p class="has-text-danger">${loc('hell_report_log_siege',[curr_report.siege.surveyors,curr_report.siege.soldiers,curr_report.siege.kills])}</p>`);
            }
            else {
                info.append(`<p class="has-text-warning">${loc('hell_report_log_siege_fail',[curr_report.siege.damage,curr_report.siege.kills])}</p>`);
            }
        }
        if (curr_report.demons){
            info.append(`<p class="has-text-danger">${loc('hell_report_log_demons',[curr_report.demons])}</p>`);
        }
        if (curr_report.surveyors){
            info.append(`<p class="has-text-danger">${curr_report.surveyors > 1 ? loc('hell_report_log_surveyors_plural',[curr_report.surveyors]) : loc('hell_report_log_surveyors')}</p>`);
        }
        if (curr_report.soul_attractors){
            info.append(`<p>${loc('hell_report_log_soul_attractors',[curr_report.soul_attractors])}</p>`);
        }
        if (curr_report.gun_emplacements){
            Object.keys(curr_report.gun_emplacements).forEach(function(num){
                let displayText = $(`<p></p>`);
                let gun = curr_report.gun_emplacements[num];
                let name = loc('hell_report_log_obj_counter',[loc('portal_gun_emplacement_title'),num]);
                displayText.append($(`<span>${loc('hell_report_log_misc_kills',[name,gun.kills,loc('portal_pit_name')])}</span>`));
                if (gun.gem){
                    displayText.append(`<span class="has-text-success">${loc('hell_report_log_soul_find',[global.resource.Soul_Gem.name,1])}</span>`);
                }
                info.append(displayText);
            });
        }
        if (curr_report.soul_forge){
            let displayText = $(`<p></p>`);
            displayText.append(`<span>${loc('hell_report_log_soul_forge',[curr_report.soul_forge.kills])}</span>`);
            if (curr_report.soul_forge.gem){
                displayText.append(`<span class="has-text-success">${loc('hell_report_log_soul_find',[global.resource.Soul_Gem.name,1])}</span>`);
            }
            if (curr_report.soul_forge.gem_craft){
                displayText.append(`<span class="has-text-success">${loc('hell_report_log_soul_craft',[curr_report.soul_forge.corrupt ? loc('resource_Corrupt_Gem_name') : global.resource.Soul_Gem.name])}</span>`);
            }
            info.append(displayText);
        }
        if (curr_report.gate_turrets){
            Object.keys(curr_report.gate_turrets).forEach(function(num){
                let displayText = $(`<p></p>`);
                let turret = curr_report.gate_turrets[num];
                let name = loc('hell_report_log_obj_counter',[loc('portal_gate_turret_title'),num]);
                displayText.append(`<span>${loc('hell_report_log_misc_kills',[name,turret.kills,loc('portal_gate_name')])}</span>`);
                if (turret.gem){
                    displayText.append(`<span class="has-text-success">${loc('hell_report_log_soul_find',[global.resource.Soul_Gem.name,1])}</span>`);
                }
                info.append(displayText);
            });
        }
    
        vBind({
            el: '#hellReportDisplay',
            data: {
                g: global.resource.Soul_Gem
            }
        });
    }

    if (recentDay.day !== 0){
        updateList(recentDay.year, recentDay.day);
        let lastReportYear = recentDay.year;
        let lastReportDay = recentDay.day;
        if (lastReportDay - 1 === 0){
            lastReportYear--;
            lastReportDay = global.city.calendar.orbit;
        }
        else {
            lastReportDay--;
        }
        loadReport(lastReportYear,lastReportDay);
    }
    else {
        recentDay.year = global.city.calendar.year;
        recentDay.day = global.city.calendar.day;
    }

    vBind({
        el: '#hellReportLogTitle',
        methods: {
            updateList(){
                updateList(recentDay.year, recentDay.day);
            }
        }
    });

    popover(`hellReportLogs`, function(){
            return loc(`hell_report_log_tooltip`,[2500]);
        },
        {
            elm: `#hellReport .reportList div:first-child h2`
        }
    );
}

function purgeReports(refresh){
    if (!(!!document.getElementById(`hellReportList`)) || refresh){
        let removed = false;
        let threshold = 2500;

        let approx = ((Object.keys(hell_reports).length - 1) * global.city.calendar.orbit) + global.city.calendar.day;

        if (approx > threshold){
            let firstYear = Object.keys(hell_reports[Object.keys(hell_reports)[0]]).length;
            if (approx - global.city.calendar.orbit + firstYear > threshold){
                removed = true;
                approx -= firstYear;
                delete hell_reports[Object.keys(hell_reports)[0]];
            }
            while (approx > threshold){
                approx -= global.city.calendar.orbit;
                delete hell_reports[Object.keys(hell_reports)[0]];
            }
        }
        return removed;
    }
}