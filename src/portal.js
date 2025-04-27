import { global, seededRandom, keyMultiplier, p_on, support_on, gal_on, spire_on, hell_reports, hell_graphs, sizeApproximation, keyMap } from './vars.js';
import { vBind, clearElement, popover, clearPopper, timeFormat, powerCostMod, spaceCostMultiplier, messageQueue, powerModifier, calcPillar, deepClone, popCost, calcPrestige, get_qlevel, shrineBonusActive, getShrineBonus, buildQueue, timeCheck } from './functions.js';
import { unlockAchieve, alevel, universeAffix } from './achieve.js';
import { traits, races, fathomCheck, traitCostMod, orbitLength } from './races.js';
import { spatialReasoning, unlockContainers, drawResourceTab } from './resources.js';
import { loadFoundry, jobScale, limitCraftsmen } from './jobs.js';
import { armyRating, govCivics, garrisonSize, mercCost, soldierDeath } from './civics.js';
import { payCosts, powerOnNewStruct, setAction, drawTech, bank_vault, updateDesc, actions, initStruct, storageMultipler, casinoEffect, structName, absorbRace, buildTemplate } from './actions.js';
import { checkRequirements, incrementStruct, astrialProjection, ascendLab, planetName } from './space.js';
import { asphodelResist } from './edenic.js';
import { production, highPopAdjust } from './prod.js';
import { govActive, defineGovernor } from './governor.js';
import { descension } from './resets.js';
import { renderEdenic } from './edenic.js';
import { loadTab } from './index.js';
import { loc } from './locale.js';
import { defineIndustry, addSmelter } from './industry.js';
import { arpa } from './arpa.js';
import { jobName } from './jobs.js';

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
            not_trait: ['warlord'],
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
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['turret','portal']
                };
            }
        },
        carport: {
            id: 'portal-carport',
            title: loc('portal_carport_title'),
            desc(){
                return loc('portal_carport_desc',[jobScale(1)]);
            },
            reqs: { portal: 2 },
            not_trait: ['warlord'],
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
                if (global.race['high_pop']){
                    repair /= traits.high_pop.vars()[2];
                }
                return Math.round(repair);
            },
            effect(){
                return `${loc('portal_carport_effect',[jobScale(1)])}`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('carport','portal');
                    global.civic.hell_surveyor.display = true;
                    global.civic.hell_surveyor.max += jobScale(1);
                    global.resource.Infernite.display = true;
                    if (!global.tech['infernite']){
                        global.tech['infernite'] = 1;
                        drawTech();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, damaged: 0, repair: 0 },
                    p: ['carport','portal']
                };
            }
        },
        war_droid: {
            id: 'portal-war_droid',
            title: loc('portal_war_droid_title'),
            desc(){
                return `<div>${loc('portal_war_droid_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 5 },
            not_trait: ['warlord'],
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
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['war_droid','portal']
                };
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
            not_trait: ['warlord'],
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
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['repair_droid','portal']
                };
            },
            flair: loc('portal_repair_droid_flair')
        },
    },
    prtl_badlands: {
        info: {
            name: loc('portal_badlands_name'),
            desc: loc('portal_badlands_desc'),
            support: 'minions',
            hide_support: true,
            prop(){
                let desc = '';
                if (global.portal['minions'] && global.portal.minions.count > 0){
                    desc = ` <span class="has-text-danger">${loc('portal_minions_bd')}:</span> <span class="has-text-caution">{{ spawns | approx }}</span>`;
                }
                return desc;
            },
            filter(v,type){
                switch (type){
                    case 'approx':
                        return sizeApproximation(v);
                }
            }
        },
        war_drone: {
            id: 'portal-war_drone',
            title: loc('portal_war_drone_title'),
            desc(){
                return `<div>${loc('portal_war_drone_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 3 },
            not_trait: ['warlord'],
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
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['war_drone','portal']
                };
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
            not_trait: ['warlord'],
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
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['sensor_drone','portal']
                };
            }
        },
        attractor: {
            id: 'portal-attractor',
            title: loc('portal_attractor_title'),
            desc(){
                return `<div>${loc('portal_attractor_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 4 },
            not_trait: ['warlord'],
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
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['attractor','portal']
                };
            }
        },
        minions: {
            id: 'portal-minions',
            title: loc('portal_minions_title'),
            desc(){ return rankDesc(loc('portal_minions_title'),'minions'); },
            reqs: { hellspawn: 3 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('minions', offset, 150000, 1.22, 'portal'); },
                Furs(offset){ return spaceCostMultiplier('minions', offset, 35000, 1.22, 'portal'); },
                Infernite(offset){ return spaceCostMultiplier('minions', offset, 500, 1.22, 'portal'); },
                Orichalcum(offset){ return spaceCostMultiplier('minions', offset, 25000, 1.22, 'portal'); },
            },
            powered(){ return 0; },
            effect(){
                let troops = $(this)[0].soldiers();
                let low_troops = troops - 10;
                if (global.race['infectious']){
                    troops += traits.infectious.vars()[1];
                    low_troops += traits.infectious.vars()[0];
                }
                let desc = `<div>${loc('portal_minions_effect',[low_troops,troops])}</div>`;
                desc += `<div>${loc('plus_max_resource',[1,global.resource.Authority.name])}</div>`;
                return desc;
            },
            action(){
                if (global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.minions.rank < 5){
                    global.portal.throne.points--;
                    global.portal.minions.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('minions','portal');
                    global.portal.minions.on++;
                    if (global.portal.minions.count === 1){
                        renderFortress();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, spawns: 0, rank: 1 },
                    p: ['minions','portal']
                };
            },
            soldiers(){
                let absorb = (global.race?.absorbed?.length || 1);
                return 20 + absorb + global.portal.minions.rank;
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.minions?.rank < 5){
                    return 'blue';
                }
                return false;
            },
            flair(){ return loc('portal_minions_flair'); }
        },
        reaper: {
            id: 'portal-reaper',
            title: loc('portal_reaper_title'),
            desc(){ return rankDesc(loc('portal_reaper_title'),'reaper'); },
            reqs: { hellspawn: 4 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('reaper', offset, 1200000, 1.2, 'portal'); },
                Furs(offset){ return spaceCostMultiplier('reaper', offset, 118000, 1.2, 'portal'); },
                Iron(offset){ return spaceCostMultiplier('reaper', offset, 340000, 1.2, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('reaper', offset, 1, 1.1, 'portal'); },
            },
            effect(){
                let desc = `<div>${loc('portal_reaper_effect')}</div>`;
                return desc;
            },
            action(){
                if (global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.reaper.rank < 5){
                    global.portal.throne.points--;
                    global.portal.reaper.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('reaper','portal');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['reaper','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.reaper?.rank < 5){
                    return 'blue';
                }
                return false;
            }
        },
        corpse_pile: {
            id: 'portal-corpse_pile',
            title: loc('portal_corpse_pile_title'),
            desc(){ return rankDesc(loc('portal_corpse_pile_desc'),'corpse_pile'); },
            reqs: { hellspawn: 7 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('corpse_pile', offset, 2500000, 1.25, 'portal'); },
                Lumber(offset){ return spaceCostMultiplier('corpse_pile', offset, 2420000, 1.25, 'portal'); },
                Furs(offset){ return spaceCostMultiplier('corpse_pile', offset, 1563000, 1.25, 'portal'); },
            },
            effect(){
                let power = 0.75 + (global.portal?.corpse_pile?.rank || 1) * 0.25;
                let desc = `<div>${loc('portal_corpse_pile_effect',[power,loc('portal_incinerator_title')])}</div>`;
                return desc;
            },
            action(){
                if (global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.corpse_pile.rank < 5){
                    global.portal.throne.points--;
                    global.portal.corpse_pile.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('corpse_pile','portal');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['corpse_pile','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.corpse_pile?.rank < 5){
                    return 'blue';
                }
                return false;
            }
        },
        mortuary: {
            id: 'portal-mortuary',
            title: loc('portal_mortuary_title'),
            desc(){ return `<div>${loc('portal_mortuary_desc',[loc('portal_corpse_pile_title')])}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { hellspawn: 9 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('mortuary', offset, 1010101010, 1.25, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('mortuary', offset, 56565656, 1.25, 'portal'); },
                Scarletite(offset){ return spaceCostMultiplier('mortuary', offset, 4545450, 1.25, 'portal'); },
            },
            powered(){ return powerCostMod(10); },
            effect(){
                let omniscience = (global.portal?.corpse_pile?.count || 0) * 2;
                let desc = `<div>${loc(`eden_ascension_machine_effect1`,[loc(`eden_encampment_title`),+omniscience.toFixed(0),global.resource.Omniscience.name])}</div>`;

                let ghost = (global.portal?.corpse_pile?.count || 0) / 8;
                desc += `<div>${loc(`eden_ascension_machine_effect2`,[loc(`job_ghost_trapper`),+ghost.toFixed(2)])}</div>`;

                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('mortuary','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['mortuary','portal']
                };
            }
        },
        codex: {
            id: 'portal-codex',
            title: loc('portal_codex_title'),
            desc: loc('portal_codex_title'),
            reqs: { war_vault: 1 },
            trait: ['warlord'],
            condition(){ return global.portal?.codex?.count === 0 ? true : false; },
            wiki: global.race['warlord'] ? true : false,
            queue_complete(){ 
                if (global.portal.codex.s >= 10 && global.portal.minions.spawns >= 2500){
                    return 1 - global.portal.codex.count; 
                }
                else {
                    return 0;
                }
            },
            cost: {
                Money(o){ return 100000000; },
                Furs(o){ return 35000000; },
            },
            effect(){
                let desc = `<div>${loc('portal_codex_effect',[])}</div>`;
                desc += `<div class="has-text-${global.resource.Money.amount >= $(this)[0].cost.Money() ? 'success' : 'danger'}">${loc('portal_codex_money',[sizeApproximation(global.resource.Money.amount),sizeApproximation($(this)[0].cost.Money())])}</div>`;
                desc += `<div class="has-text-${global.resource.Furs.amount >= $(this)[0].cost.Furs() ? 'success' : 'danger'}">${loc('portal_codex_res',[sizeApproximation(global.resource.Furs.amount),sizeApproximation($(this)[0].cost.Furs()),global.resource.Furs.name])}</div>`;
                desc += `<div class="has-text-${global.portal.minions.spawns >= 3000 ? 'success' : 'danger'}">${loc('portal_codex_res',[global.portal.minions.spawns,3000,loc('portal_codex_demon')])}</div>`;
                desc += `<div class="has-text-${global.portal.codex.s >= 10 ? 'success' : 'danger'}">${loc('portal_codex_res',[global.portal.codex.s,10,loc('portal_codex_sac')])}</div>`;
                return desc;
            },
            action(){
                if (global.portal.minions.spawns >= 3000 && global.portal.codex.s >= 10 && global.portal.codex.count === 0 && payCosts($(this)[0])){
                    global.portal.minions.spawns -= 3000;
                    global.resource.Codex.amount = 1;
                    global.resource.Codex.display = true;
                    global.tech['scarletite'] = 1;
                    global.tech['hell_ruins'] = 4;
                    global.resource.Scarletite.display = true;
                    initStruct(actions.portal.prtl_ruins.hell_forge);
                    if (global.race.universe !== 'micro' && !global.pillars[global.race.species]){
                        global.tech['fusable'] = 1;
                    }
                    else {
                        if (global.race.universe !== 'micro'){
                            let rank = alevel();
                            if (rank > global.pillars[global.race.species]){
                                global.pillars[global.race.species] = rank;
                            }
                        }
                        global.tech['pillars'] = 2;
                    }
                    incrementStruct('codex','portal');
                    loadFoundry();
                    drawTech();
                    renderFortress();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, s: 0 },
                    p: ['codex','portal']
                };
            }
        },
    },
    prtl_wasteland: {
        info: {
            name: loc('portal_wasteland_name'),
            desc: loc('portal_wasteland_desc'),
        },
        throne: {
            id: 'portal-throne',
            title: loc('portal_throne_of_evil_title'),
            desc: loc('portal_throne_of_evil_desc'),
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {},
            queue_complete(){ return 0; },
            wide: true,
            class: 'w30',
            effect(wiki){
                let knowCap = (global.race?.absorbed?.length || 1) * 500000;
                if (shrineBonusActive()){
                    let shrineBonus = getShrineBonus('know');
                    knowCap *= shrineBonus.mult;
                }
                let desc = `<div>${loc('plus_max_resource',[sizeApproximation(knowCap),global.resource.Knowledge.name])}</div>`;

                let muckVal2 = govActive('muckraker',2);
                let know = muckVal2 ? (5 - muckVal2) : 5;
                if (global.race['autoignition']){
                    know -= traits.autoignition.vars()[0];
                    if (know < 0){ know = 0; }
                }
                desc += `<div>${loc('city_library_effect',[Math.round((global.race?.absorbed?.length || 1) * 10 * know)])}</div>`;
                desc += `<div>${loc('plus_res_duo',[500,global.resource.Crates.name,global.resource.Containers.name])}</div>`;
                desc += `<div>${loc('plus_max_resource',[(global.race?.absorbed?.length || 1),global.resource.Authority.name])}</div>`;

                if (global.race['absorbed']){
                    let essense = global.race.absorbed.map(r => races[r].name).join(', ');
                    desc += `<div>${loc('portal_throne_of_evil_effect',[essense])}</div>`;
                }
                
                if (global.portal['throne'] && global.portal.throne.hearts.length > 0){
                    let hearts = global.portal.throne.hearts.map(r => races[r].name).join(', ');
                    desc += `<div class="has-text-success">${loc('portal_throne_of_evil_capture',[hearts])}</div>`;
                    desc += `<div class="has-text-danger">${loc('portal_throne_of_evil_capture2',[races[global.portal.throne.hearts[0]].name])}</div>`;
                }
                else if (global.portal.throne.points > 0 && checkSkillPointAssignments() > 0){
                    if (global.portal.throne.skill){
                        desc += `<div class="has-text-info">${loc('portal_throne_of_evil_skill2')} ${loc('portal_throne_of_evil_skill',[global.portal.throne.points])}</div>`;
                        console.log('Yes');
                    }
                    else {
                        desc += `<div class="has-text-info">${loc('portal_throne_of_evil_skill1')} ${loc('portal_throne_of_evil_skill',[global.portal.throne.points])}</div>`;
                        console.log('No');
                    }
                }

                return desc;
            },
            action(){
                if (global.portal['throne'] && global.portal.throne.hearts.length === 0 && global.portal.throne.points > 0){
                    global.portal.throne.skill = global.portal.throne.skill ? false : true;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (global.portal['throne'] && global.portal.throne.hearts.length > 0){
                    let redraw = false;
                    let heart = global.portal.throne.hearts[0];
                    if (!global.race.absorbed.includes(heart)){
                        global.portal.throne.points++;
                    }
                    absorbRace(heart);
                    global.portal.throne.hearts.splice(0,1);
                    if (global.portal.throne.hearts.length === 0){
                        $(`#portal-throne .orange`).removeClass('orange');
                    }
                    if (['mantis','unicorn','capybara'].includes(heart)){
                        redraw = true;
                    }
                    if (!global.settings.portal.pit){
                        global.settings.portal.pit = true;
                        global.tech['hell_pit'] = 5;
                        redraw = true;
                    }
                    else if (!global.tech['war_vault'] && global.race?.absorbed?.length >= 13){
                        global.tech['hell_ruins'] = 2;
                        global.tech['war_vault'] = 1;
                        global.settings.portal.ruins = true;
                        initStruct(fortressModules.prtl_ruins.war_vault);
                        initStruct(fortressModules.prtl_badlands.codex);
                        redraw = true;
                    }
                    else if (global.tech['war_vault'] && global.portal['codex'] && global.portal.codex.s < 10){
                        global.portal.codex.s++;
                    }
                    else if (!global.settings.portal.lake && global.race?.absorbed?.length >= 33){
                        global.tech['hell_lake'] = 6;
                        global.tech['hell_spire'] = 9;
                        global.settings.portal.lake = true;
                        global.settings.portal.spire = true;
                        global.settings.showCargo = true;
                        initStruct(fortressModules.prtl_lake.harbor);
                        initStruct(fortressModules.prtl_lake.cooling_tower);
                        initStruct(fortressModules.prtl_lake.bireme);
                        initStruct(fortressModules.prtl_lake.transport);
                        initStruct(fortressModules.prtl_spire.purifier);
                        initStruct(fortressModules.prtl_spire.port);
                        initStruct(fortressModules.prtl_spire.base_camp);
                        initStruct(fortressModules.prtl_spire.mechbay);
                        initStruct(fortressModules.prtl_spire.spire);
                        genSpireFloor();
                        redraw = true;
                    }
                    else if (global.race?.absorbed?.length >= 43 && global.tech.hellspawn === 4){
                        global.tech.hellspawn = 5;
                        redraw = true;
                    }
                    if (global.race?.absorbed?.length >= 53){
                        global.stats.warlord.k = true;
                        checkWarlordAchieve();
                    }
                    if (p_on['soul_forge']){
                        let troops = garrisonSize(false,{no_forge: true});
                        let forge = soulForgeSoldiers();
                        if (forge <= troops){
                            global.portal.soul_forge.kills += 250000;
                        }
                    }
                    if (redraw){
                        renderFortress();
                        drawTech();
                    }
                    return true;
                }
                return false;
            },
            aura(){
                if (global.portal['throne'] && global.portal.throne.hearts.length > 0){
                    return 'orange';
                }
                else if (global.portal['throne'] && global.portal.throne.skill){
                    return 'green';
                }
                return false;
            },
            struct(){
                return {
                    d: { enemy: [], hearts: [], spawned: [], points: 1, skill: false },
                    p: ['throne','portal']
                };
            },
        },
        incinerator: {
            id: 'portal-incinerator',
            title: loc('portal_incinerator_title'),
            desc(){ return rankDesc(loc('portal_incinerator_desc'),'incinerator'); },
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('incinerator', offset, 220000, 1.3, 'portal'); },
                Coal(offset){ return spaceCostMultiplier('incinerator', offset, 80000, 1.3, 'portal'); },
                Neutronium(offset){ return spaceCostMultiplier('incinerator', offset, 5000, 1.3, 'portal'); },
                Infernite(offset){ return spaceCostMultiplier('incinerator', offset, 4000, 1.3, 'portal'); },
            },
            powered(wiki){
                let power = 22.5 + (global.portal?.incinerator?.rank || 1) * 2.5;
                if (global.race['forge']){
                    power += traits.forge.vars()[0] * 5;
                }
                if (global.tech['hellspawn'] && global.tech.hellspawn >= 6){
                    power += (global.portal?.incinerator?.rank || 1) * 2.5;
                }
                if (global.tech['hellspawn'] && global.tech.hellspawn >= 7 && global.portal['corpse_pile']){
                    power += (0.75 + global.portal.corpse_pile.rank * 0.25) * global.portal.corpse_pile.count;
                }
                return powerModifier(-(power));
            },
            effect(wiki){
                let desc = `<div>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered(wiki))])}</div>`;
                if ((global.portal?.incinerator?.rank || 1) > 1){
                    let rank = global.portal.incinerator.rank - 1;
                    desc += `<div>${loc('portal_incinerator_effect',[15 * rank,loc('portal_twisted_lab_title'),global.resource.Graphene.name])}</div>`;
                }
                return desc;
            },
            action(){
                if (global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.incinerator.rank < 5){
                    global.portal.throne.points--;
                    global.portal.incinerator.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('incinerator','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['incinerator','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.incinerator?.rank < 5){
                    return 'blue';
                }
                return false;
            },
            flair: loc('portal_incinerator_flair')
        },
        warehouse: {
            id: 'portal-warehouse',
            title(){ return loc('city_shed_title3'); },
            desc(){ return rankDesc(loc('city_shed_title3'),'warehouse'); },
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('warehouse', offset, 175000, 1.28, 'portal'); },
                Lumber(offset){ return spaceCostMultiplier('warehouse', offset, 300000, 1.28, 'portal'); },
                Aluminium(offset){ return spaceCostMultiplier('warehouse', offset, 180000, 1.28, 'portal'); },
                Cement(offset){ return spaceCostMultiplier('warehouse', offset, 95000, 1.28, 'portal'); }
            },
            res(){
                let r_list = [
                    'Lumber','Stone','Chrysotile','Furs','Copper','Iron','Aluminium','Steel','Titanium',
                    'Cement','Coal','Uranium','Alloy','Polymer','Iridium','Nano_Tube','Neutronium',
                    'Adamantite','Infernite','Bolognium','Orichalcum','Graphene','Stanene','Oil','Helium_3'
                ];
                return r_list;
            },
            val(res){
                switch (res){
                    case 'Lumber':
                        return 650 + (global.portal?.warehouse?.rank || 1) * 100;
                    case 'Stone':
                        return 650 + (global.portal?.warehouse?.rank || 1) * 100;
                    case 'Chrysotile':
                        return 700 + (global.portal?.warehouse?.rank || 1) * 50;
                    case 'Furs':
                        return 400 + (global.portal?.warehouse?.rank || 1) * 25;
                    case 'Copper':
                        return 330 + (global.portal?.warehouse?.rank || 1) * 50;
                    case 'Iron':
                        return 320 + (global.portal?.warehouse?.rank || 1) * 30;
                    case 'Aluminium':
                        return 290 + (global.portal?.warehouse?.rank || 1) * 30;
                    case 'Cement':
                        return 260 + (global.portal?.warehouse?.rank || 1) * 20;
                    case 'Coal':
                        return 135 + (global.portal?.warehouse?.rank || 1) * 15;
                    case 'Steel':
                        return 52 + (global.portal?.warehouse?.rank || 1) * 8;
                    case 'Titanium':
                        return 32 + (global.portal?.warehouse?.rank || 1) * 8;
                    case 'Uranium':
                        return global.portal?.warehouse?.rank || 1;
                    case 'Alloy':
                        return 31 + (global.portal?.warehouse?.rank || 1) * 4;
                    case 'Polymer':
                        return 31 + (global.portal?.warehouse?.rank || 1) * 4;
                    case 'Iridium':
                        return 28 + (global.portal?.warehouse?.rank || 1) * 4;
                    case 'Nano_Tube':
                        return 50 + (global.portal?.warehouse?.rank || 1) * 18;
                    case 'Neutronium':
                        return 12 + (global.portal?.warehouse?.rank || 1) * 4;
                    case 'Adamantite':
                        return 15 + (global.portal?.warehouse?.rank || 1) * 3;
                    case 'Infernite':
                        return 3 + global.portal?.warehouse?.rank || 1;
                    case 'Bolognium':
                        return 6 + global.portal?.warehouse?.rank || 3;
                    case 'Orichalcum':
                        return 8 + global.portal?.warehouse?.rank || 4;
                    case 'Graphene':
                        return 14 + global.portal?.warehouse?.rank || 3;
                    case 'Stanene':
                        return 14 + global.portal?.warehouse?.rank || 3;
                    case 'Oil':
                        return 18 + global.portal?.warehouse?.rank || 2;
                    case 'Helium_3':
                        return 17 + global.portal?.warehouse?.rank || 2;
                    default:
                        return 0;
                }
            },
            wide: true,
            effect(wiki){
                let storage = '<div class="aTable">';
                let multiplier = storageMultipler(1, wiki);
                if (global.race['warlord'] && global.eden['corruptor'] && global.tech.asphodel >= 12){
                    multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 13 ? 0.16 : 0.12);
                }
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let val = sizeApproximation(+(spatialReasoning($(this)[0].val(res)) * multiplier).toFixed(0),1);
                        storage += `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                storage += `<span>${loc('plus_max_resource',[65 + (global.portal?.warehouse?.rank || 1) * 35, global.resource.Crates.name])}</span>`;
                storage += `<span>${loc('plus_max_resource',[65 + (global.portal?.warehouse?.rank || 1) * 35, global.resource.Containers.name])}</span>`;
                storage += '</div>';
                return storage;
            },
            action(){
                if (global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.warehouse.rank < 5){
                    global.portal.throne.points--;
                    global.portal.warehouse.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('warehouse','portal');
                    let multiplier = storageMultipler();
                    if (global.race['warlord'] && global.eden['corruptor'] && global.tech.asphodel >= 12){
                        multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 13 ? 0.16 : 0.12);
                    }
                    for (const res of $(this)[0].res()){
                        if (global.resource[res].display){
                            global.resource[res].max += (spatialReasoning($(this)[0].val(res) * multiplier));
                        }
                    };
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, rank: 1 },
                    p: ['warehouse','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.warehouse?.rank < 5){
                    return 'blue';
                }
                return false;
            }
        },
        hovel: {
            id: 'portal-hovel',
            title: loc('portal_hovel_title'),
            desc(){ return rankDesc(loc('portal_hovel_title'),'hovel'); },
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('hovel', offset, 145000, 1.3, 'portal'); },
                Stone(offset){ return spaceCostMultiplier('hovel', offset, 185000, 1.3, 'portal'); },
                Furs(offset){ return spaceCostMultiplier('hovel', offset, 66600, 1.3, 'portal'); },
            },
            effect(){
                let pop = $(this)[0].citizens();
                return global.race['sappy'] ? `<div>${loc('plus_max_resource',[pop,loc('citizen')])}</div><div>${loc('city_grove_effect',[2.5])}</div>` : loc('plus_max_resource',[pop,loc('citizen')]);
            },
            action(){
                if (global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.hovel.rank < 5){
                    global.portal.throne.points--;
                    global.portal.hovel.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('hovel','portal');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['hovel','portal']
                };
            },
            citizens(){
                let pop = 18 + (global.portal?.hovel?.rank || 1) * 2;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.hovel?.rank < 5){
                    return 'blue';
                }
                return false;
            }
        },
        hell_casino: {
            id: 'portal-hell_casino',
            title(){ return structName('casino'); },
            desc(){ return `<div>${rankDesc(structName('casino'),'hell_casino')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { hellspawn: 1, gambling: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('hell_casino', offset, traitCostMod('untrustworthy',400000), 1.3, 'portal'); },
                Furs(offset){ return spaceCostMultiplier('hell_casino', offset, traitCostMod('untrustworthy',175000), 1.3, 'portal'); },
                Stone(offset){ return spaceCostMultiplier('hell_casino', offset, traitCostMod('untrustworthy',350000), 1.3, 'portal'); },
                Plywood(offset){ return spaceCostMultiplier('hell_casino', offset, traitCostMod('untrustworthy',65000), 1.3, 'portal'); }
            },
            effect(){
                let desc = casinoEffect();
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 2 ? 2 : 3); },
            action(){
                if (global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.hell_casino.rank < 5){
                    global.portal.throne.points--;
                    global.portal.hell_casino.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('hell_casino','portal');
                    if (global.tech['theatre'] && !global.race['joyless']){
                        global.civic.entertainer.max += jobScale(3);
                        global.civic.entertainer.display = true;
                    }
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['hell_casino','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.hell_casino?.rank < 5){
                    return 'blue';
                }
                return false;
            },
            flair: loc('portal_casino_flair')
        },
        twisted_lab: {
            id: 'portal-twisted_lab',
            title: loc('portal_twisted_lab_title'),
            desc(){ return `<div>${rankDesc(loc('portal_twisted_lab_title'),'twisted_lab')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { hellspawn: 1, science: 9 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('twisted_lab', offset, 350000, 1.3, 'portal'); },
                Knowledge(offset){ return spaceCostMultiplier('twisted_lab', offset, 69000, 1.3, 'portal'); },
                Copper(offset){ return spaceCostMultiplier('twisted_lab', offset, 375000, 1.3, 'portal'); },
                Polymer(offset){ return spaceCostMultiplier('twisted_lab', offset, 289000, 1.3, 'portal'); },
                Graphene(offset){ return spaceCostMultiplier('twisted_lab', offset, 230000, 1.3, 'portal'); }
            },
            effect(){
                let baseVal = 6000 + (global.portal?.twisted_lab?.rank || 1) * 2000;
                let know = global.race['absorbed'] ? global.race.absorbed.length * baseVal : baseVal;
                if (global.tech['supercollider']){
                    let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 12.5: 25;
                    know *= (global.tech['supercollider'] / ratio) + 1;
                }
                let desc = `<div>${loc('plus_max_resource',[(+know.toFixed(0)).toLocaleString(),global.resource.Knowledge.name])}</div>`;
                desc += `<div>${loc('city_university_effect',[jobScale(3)])}</div>`;
                desc += `<div>${loc('plus_max_resource',[jobScale(2),jobName('scientist')])}</div>`;
                desc += `<div>${loc('interstellar_g_factory_effect')}</div>`;
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return 4; },
            special: true,
            action(){
                if (global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.twisted_lab.rank < 5){
                    global.portal.throne.points--;
                    global.portal.twisted_lab.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('twisted_lab','portal');
                    if (powerOnNewStruct($(this)[0])){
                        global.portal.twisted_lab.Coal++;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, Lumber: 0, Coal: 0, Oil: 0, rank: 1 },
                    p: ['twisted_lab','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.twisted_lab?.rank < 5){
                    return 'blue';
                }
                return false;
            },
            flair(){ return loc('portal_twisted_lab_flair'); }
        },
        demon_forge: {
            id: 'portal-demon_forge',
            title: loc('portal_demon_forge_title'),
            desc(){ return `<div>${rankDesc(loc('portal_demon_forge_title'),'demon_forge')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('demon_forge', offset, 480000, 1.3, 'portal'); },
                Iridium(offset){ return spaceCostMultiplier('demon_forge', offset, 265000, 1.3, 'portal'); },
                Iron(offset){ return spaceCostMultiplier('demon_forge', offset, 535000, 1.3, 'portal'); },
                Sheet_Metal(offset){ return spaceCostMultiplier('demon_forge', offset, 155000, 1.3, 'portal'); },
            },
            effect(){
                let desc = `<div>${loc('city_foundry_effect1',[jobScale(8)])}</div><div>${loc('interstellar_stellar_forge_effect',[40])}</div>`;
                let num_smelters = $(this)[0].smelting();
                if (num_smelters > 0){
                    desc += `<div>${loc('interstellar_stellar_forge_effect3',[num_smelters])}</div>`;
                }
                return `${desc}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(3); },
            special: true,
            smelting(){
                return 18 + (global.portal?.demon_forge?.rank || 1) * 2;
            },
            action(){
                if (global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.demon_forge.rank < 5){
                    global.portal.throne.points--;
                    global.portal.demon_forge.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('demon_forge','portal');
                    if (powerOnNewStruct($(this)[0])){
                        global.civic.craftsman.max += jobScale(10);
                        let num_smelters = $(this)[0].smelting();
                        if (num_smelters > 0){
                            addSmelter(Math.floor(num_smelters / 2), 'Iron', 'Coal');
                            addSmelter(Math.floor(num_smelters / 2), 'Steel', 'Coal');
                        }
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['demon_forge','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.demon_forge?.rank < 5){
                    return 'blue';
                }
                return false;
            }
        },
        hell_factory: {
            id: 'portal-hell_factory',
            title: loc('portal_factory_title'),
            desc(){ return `<div>${rankDesc(loc('portal_factory_title'),'hell_factory')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('hell_factory', offset, 720000, 1.3, 'portal'); },
                Titanium(offset){ return spaceCostMultiplier('hell_factory', offset, 550000, 1.3, 'portal'); },
                Nano_Tube(offset){ return spaceCostMultiplier('hell_factory', offset, 55000, 1.3, 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('hell_factory', offset, 375000, 1.3, 'portal'); }
            },
            effect(){
                let desc = `<div>${loc('portal_factory_effect',[$(this)[0].lines()])}</div><div>${loc('city_crafted_mats',[25])}</div>`;
                desc += `<div>${loc('plus_max_resource',[jobScale(5),jobName('cement_worker')])}</div>`;
                if ((global.portal?.hell_factory?.rank || 1) > 1){
                    desc += `<div>${loc('production',[(global.portal?.hell_factory?.rank || 1) * 8 - 8,global.resource.Cement.name])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(5); },
            special: true,
            action(){
                if (global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.hell_factory.rank < 5){
                    global.portal.throne.points--;
                    global.portal.hell_factory.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('hell_factory','portal');
                    if (powerOnNewStruct($(this)[0])){
                        global.city.factory.Alloy += $(this)[0].lines();
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            lines(){
                return 3 + (global.portal?.hell_factory?.rank || 1);
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['hell_factory','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.hell_factory?.rank < 5){
                    return 'blue';
                }
                return false;
            },
            flair(){ return loc(`portal_factory_flair`); }
        },
        pumpjack: {
            id: 'portal-pumpjack',
            title(){ return loc('portal_pumpjack_title'); },
            desc(){ return rankDesc(loc('portal_pumpjack_title'),'pumpjack'); },
            reqs: { hellspawn: 1, oil: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('pumpjack', offset, 295000, 1.3, 'portal'); },
                Cement(offset){ return spaceCostMultiplier('pumpjack', offset, 185000, 1.3, 'portal'); },
                Steel(offset){ return spaceCostMultiplier('pumpjack', offset, 275000, 1.3, 'portal'); }
            },
            effect(){
                let oil = +(production('oil_well')).toFixed(2);
                let oc = spatialReasoning(500);
                let desc = `<div>${loc('plus_res_combo',[oil,oc,global.resource.Oil.name])}</div>`;

                let storage = spatialReasoning(250);
                let values = production('helium_mine');
                let helium = +(values.b).toFixed(3);
                desc += `<div>${loc('plus_res_combo',[helium,storage,global.resource.Helium_3.name])}</div>`;

                if (global.race['blubber'] && global.portal.hasOwnProperty('pumpjack')){
                    let maxDead = global.portal.pumpjack.count;
                    desc += `<div>${loc('city_oil_well_bodies',[+(global.city.oil_well.dead).toFixed(1),50 * maxDead])}</div>`;
                    desc += `<div>${loc('city_oil_well_consume',[traits.blubber.vars()[0]])}</div>`;
                }
                return desc;
            },
            action(){
                if (global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.pumpjack.rank < 5){
                    global.portal.throne.points--;
                    global.portal.pumpjack.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('pumpjack','portal');
                    global['resource']['Oil'].max += spatialReasoning(500);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, dead: 0, rank: 1 },
                    p: ['pumpjack','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.pumpjack?.rank < 5){
                    return 'blue';
                }
                return false;
            },
            flair: loc('portal_pumpjack_flair')
        },
        dig_demon: {
            id: 'portal-dig_demon',
            title: loc('portal_dig_demon_title'),
            desc(){ return rankDesc(loc('portal_dig_demon_title'),'dig_demon'); },
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('dig_demon', offset, 315000, 1.3, 'portal'); },
                Adamantite(offset){ return spaceCostMultiplier('dig_demon', offset, 188000, 1.3, 'portal'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('dig_demon', offset, 150000, 1.3, 'portal'); },
            },
            powered(){ return true; },
            effect(wiki){
                let pop = $(this)[0].citizens();
                return loc('plus_resource',[pop,jobName('miner')]);
            },
            action(){
                if (global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.dig_demon.rank < 5){
                    global.portal.throne.points--;
                    global.portal.dig_demon.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('dig_demon','portal');
                    if (powerOnNewStruct($(this)[0])){
                        let count = $(this)[0].citizens();
                        global.resource[global.race.species].max += count;
                        global.resource[global.race.species].amount += count;
                        global.civic.miner.max += count;
                        global.civic.miner.workers += count;
                        global.civic.miner.assigned += count;
                    }
                    return true;
                }
                return false;
            },
            postPower(o){
                let count = $(this)[0].citizens();
                if (o){
                    global.resource[global.race.species].max += count;
                    global.resource[global.race.species].amount += count;
                    global.civic.miner.max += count;
                    global.civic.miner.workers += count;
                    global.civic.miner.assigned += count;
                }
                else {
                    global.resource[global.race.species].max -= count;
                    global.resource[global.race.species].amount -= count;
                    if (global.resource[global.race.species].amount < 0){ global.resource[global.race.species].amount = 0; }
                    if (global.resource[global.race.species].max < 0){ global.resource[global.race.species].max = 0; }
                    global.civic.miner.max -= count;
                    global.civic.miner.workers -= count;
                    global.civic.miner.assigned -= count;
                }
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['dig_demon','portal']
                };
            },
            citizens(){
                let pop = 15 + (global.portal?.dig_demon?.rank || 1);
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.dig_demon?.rank < 5){
                    return 'blue';
                }
                return false;
            }
        },
        tunneler: {
            id: 'portal-tunneler',
            title: loc('portal_tunneler_title'),
            desc(){ return rankDesc(loc('portal_tunneler_desc'),'tunneler'); },
            reqs: { hellspawn: 2 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('tunneler', offset, 275000, 1.3, 'portal'); },
                Food(offset){ return spaceCostMultiplier('tunneler', offset, 135000, 1.3, 'portal'); },
                Uranium(offset){ return spaceCostMultiplier('tunneler', offset, 135, 1.3, 'portal'); },
            },
            effect(wiki){
                let boost = (global.portal?.tunneler?.rank || 1) + 3;
                let desc = `<div>${loc('portal_tunneler_effect',[boost])}</div>`;
                desc += `<div>${loc('portal_tunneler_effect2')}</div>`;
                return desc;
            },
            action(){
                if (global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.tunneler.rank < 5){
                    global.portal.throne.points--;
                    global.portal.tunneler.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('tunneler','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['tunneler','portal']
                };
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.tunneler?.rank < 5){
                    return 'blue';
                }
                return false;
            }
        },
        brute: {
            id: 'portal-brute',
            title: loc('portal_brute_title'),
            desc(){ return rankDesc(loc('portal_brute_title'),'brute'); },
            reqs: { hellspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            cost: {
                Money(offset){ return spaceCostMultiplier('brute', offset, 300000, 1.25, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('brute', offset, 238000, 1.25, 'portal'); },
                Bolognium(offset){ return spaceCostMultiplier('brute', offset, 65000, 1.25, 'portal'); },
                Mythril(offset){ return spaceCostMultiplier('brute', offset, 178000, 1.25, 'portal'); },
            },
            powered(){ return 0; },
            effect(){
                let troops = $(this)[0].soldiers();
                let desc = `<div>${loc('plus_max_soldiers',[troops])}</div>`;
                desc += `<div>${loc('plus_max_resource',[1,global.resource.Authority.name])}</div>`;
                return desc;
            },
            action(){
                if (global.portal['throne'] && global.portal.throne.skill && global.portal.throne.points > 0 && global.portal.brute.rank < 5){
                    global.portal.throne.points--;
                    global.portal.brute.rank++;
                    checkSkillPointAssignments();
                    return true;
                }
                else if (payCosts($(this)[0])){
                    incrementStruct('brute','portal');
                    global.portal.brute.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, rank: 1 },
                    p: ['brute','portal']
                };
            },
            soldiers(){
                let soldiers = 7 + (global.portal?.brute?.rank || 1);
                if (global.race['grenadier']){
                    soldiers -= 4;
                }
                return jobScale(soldiers);
            },
            aura(){
                if (global.portal?.throne?.skill && global.portal?.brute?.rank < 5){
                    return 'blue';
                }
                return false;
            },
            flair(){ return loc('portal_brute_flair'); }
        },
        s_alter: buildTemplate(`s_alter`,'portal'),
        shrine: buildTemplate(`shrine`,'portal'),
        meditation: buildTemplate(`meditation`,'portal'),
        banquet: buildTemplate(`banquet`, 'portal'),
        wonder_gardens: {
            id: 'portal-wonder_gardens',
            title(){
                return loc('portal_wonder_skulls');
            },
            desc(){
                return loc('portal_wonder_skulls');
            },
            reqs: {},
            condition(){
                return global.race['wish'] && global.race['wishStats'] && global.portal['wonder_gardens'] ? true : false;
            },
            trait: ['wish'],
            queue_complete(){ return false; },
            effect(){
                return loc(`city_wonder_effect`,[5]);
            },
            action(){
                return false;
            },
            flair(){ return loc('portal_wonder_skulls_flair'); }
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
                Bolognium(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_forge') ? global.portal.soul_forge.count : 0)) < 1 ? (global.race['warlord'] ? 500000 : 100000) : 0; },
            },
            effect(wiki){
                let desc = `<div>${loc(global.race['warlord'] ? 'portal_soul_forge_warlord' : 'portal_soul_forge_effect',[global.resource.Soul_Gem.name])}</div>`;
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('soul_forge') ? global.portal.soul_forge.count : 0);
                if (count >= 1){
                    let cap = global.tech.hell_pit >= 6 ? 750000 : 1000000;
                    let num_s_attractor_on = (wiki ? global.portal.soul_attractor.on : p_on['soul_attractor']);
                    if (global.tech.hell_pit >= 7 && num_s_attractor_on > 0){
                        cap *= 0.97 ** num_s_attractor_on;
                    }
                    if (global.race['ghostly'] && global.race['warlord']){
                        cap *= 2 - traits.ghostly.vars()[1];
                    }
                    desc = desc + `<div>${loc('portal_soul_forge_effect2',[global.portal['soul_forge'] ? global.portal.soul_forge.kills.toLocaleString() : 0,Math.round(cap).toLocaleString()])}</div>`;
                }
                let soldiers = soulForgeSoldiers(wiki);
                return `${desc}<div><span class="has-text-caution">${loc('portal_soul_forge_soldiers',[soldiers])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.portal.soul_forge.count < 1){
                        incrementStruct('soul_forge','portal');
                        powerOnNewStruct($(this)[0]);
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, kills: 0 },
                    p: ['soul_forge','portal']
                };
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
                let soldiers = global.tech.hell_gun >= 2 ? jobScale(2) : jobScale(1);
                let min = global.tech.hell_gun >= 2 ? 35 : 20;
                let max = global.tech.hell_gun >= 2 ? 75 : 40;
                return `<div>${loc('portal_gun_emplacement_effect',[soldiers])}</div><div>${loc('portal_gun_emplacement_effect2',[min,max])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('gun_emplacement','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['gun_emplacement','portal']
                };
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
                let attract = global.blood['attract'] ? global.blood.attract * 5 : 0;
                if (global.tech['hell_pit'] && global.tech.hell_pit >= 8){ attract *= 2; }
                let low = 40 + attract;
                let high = 120 + attract;

                if (global.race['ghostly'] && global.race['warlord']){
                    low *= 1 + (traits.ghostly.vars()[0] / 100);
                    low = Math.round(low);
                    high *= 1 + (traits.ghostly.vars()[0] / 100);
                    high = Math.round(high);
                }

                let desc = `<div>${loc('portal_soul_attractor_effect',[low, high])}</div>`;
                if (global.tech.hell_pit >= 7){
                    desc += `<div>${loc('portal_soul_attractor_effect2',[3])}</div>`;
                }
                if (global.tech['pitspawn']){
                    desc += `<div>${loc('production',[global.tech.pitspawn >= 3 ? 20 : 10,loc('portal_shadow_mine_title')])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;

                return desc;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('soul_attractor','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['soul_attractor','portal']
                };
            }
        },
        soul_capacitor: {
            id: 'portal-soul_capacitor',
            title: loc('portal_soul_capacitor_title'),
            desc(){
                return `<div>${loc('portal_soul_capacitor_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { forbidden: 2 },
            powered(){ return powerCostMod(125); },
            queue_complete(){ return 40 - global.portal.soul_capacitor.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 750000000, 1.01, 'portal'); },
                Crystal(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 1250000, 1.01, 'portal'); },
                Adamantite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 6500000, 1.01, 'portal'); },
                Infernite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 10000, 1.01, 'portal'); },
                Stanene(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 2500000, 1.01, 'portal'); },
                Bolognium(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 1000000, 1.01, 'portal'); },
                Soul_Gem(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 3, 1.01, 'portal'); },
                Mythril(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.count : 0)) >= 40 ? 0 : spaceCostMultiplier('soul_capacitor', offset, 1250000, 1.01, 'portal'); },
            },
            effect(){
                let cap = 2500000;
                let eCap = global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.ecap : 0;
                let energy = global.portal.hasOwnProperty('soul_capacitor') ? global.portal.soul_capacitor.energy : 0;
                let desc = `<div>${loc('portal_soul_capacitor_effect',[energy.toLocaleString()])}</div>`;
                desc += `<div>${loc('portal_soul_capacitor_effect2',[eCap.toLocaleString()])}</div>`;
                desc += `<div>${loc('portal_soul_capacitor_effect3',[cap.toLocaleString()])}</div>`;
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            action(){
                if (global.portal.soul_capacitor.count < 40 && payCosts($(this)[0])){
                    global.portal.soul_capacitor.count++;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, energy: 0, ecap: 0 },
                    p: ['soul_capacitor','portal']
                };
            },
            postPower(){
                updateDesc($(this)[0],'portal','soul_capacitor');
            },
        },
        absorption_chamber: {
            id: 'portal-absorption_chamber',
            title: loc('portal_absorption_chamber_title'),
            desc(wiki){
                if (!global.interstellar.hasOwnProperty('absorption_chamber') || global.portal.absorption_chamber.count < 100 || wiki){
                    return `<div>${loc('portal_absorption_chamber_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('portal_absorption_chamber_title')}</div>`;
                }
            },
            reqs: { forbidden: 3 },
            queue_size: 5,
            queue_complete(){ return 100 - global.portal.absorption_chamber.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('absorption_chamber') ? global.portal.absorption_chamber.count : 0)) < 100 ? 75000000 : 0; },
                Alloy(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('absorption_chamber') ? global.portal.absorption_chamber.count : 0)) < 100 ? 750000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('absorption_chamber') ? global.portal.absorption_chamber.count : 0)) < 100 ? 125000 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('absorption_chamber') ? global.portal.absorption_chamber.count : 0)) < 100 ? 1000 : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('absorption_chamber') ? global.portal.absorption_chamber.count : 0)) < 100 ? 250000 : 0; },
                Nanoweave(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('absorption_chamber') ? global.portal.absorption_chamber.count : 0)) < 100 ? 75000 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('absorption_chamber') ? global.portal.absorption_chamber.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('portal_absorption_chamber_incomplete')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    if (global.tech.forbidden === 5){
                        return `<div>${loc('portal_absorption_chamber_effect_eld',[(100000000).toLocaleString()])}</div><div class="has-text-special">${loc('tech_demonic_infusion_effect2',[calcPrestige('descend').artifact])}</div>`;
                    }
                    else {
                        let reward = astrialProjection();
                        return `<div>${loc(`portal_absorption_chamber_effect`,[(100000000).toLocaleString()])}</div><div>${reward}</div>`;
                    }
                }
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.portal.absorption_chamber.count < 100){
                        incrementStruct('absorption_chamber','portal');
                        if (global.portal.absorption_chamber.count >= 100){
                            global.tech.forbidden = 4;
                        }
                        return true;
                    }
                    else if (global.portal.soul_capacitor.energy >= 100000000){
                        if (global.tech.forbidden === 5){
                            descension();
                        }
                        else {
                            ascendLab();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['absorption_chamber','portal']
                };
            }
        },
        shadow_mine: {
            id: 'portal-shadow_mine',
            title: loc('portal_shadow_mine_title'),
            desc(){
                return `<div>${loc('portal_shadow_mine_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { pitspawn: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            powered(){ return powerCostMod(5); },
            powerBalancer(){
                return [{ r: 'Infernite', k: 'lpmod' }];
            },
            cost: {
                Money(offset){ return spaceCostMultiplier('shadow_mine', offset, 10000000, 1.25, 'portal'); },
                Lumber(offset){ return spaceCostMultiplier('shadow_mine', offset, 4650000, 1.25, 'portal'); },
                Adamantite(offset){ return spaceCostMultiplier('shadow_mine', offset, 2350000, 1.25, 'portal'); },
            },
            effect(wiki){
                let elerium_cap = spatialReasoning(200);
                let elerium = production('shadow_mine', 'elerium', wiki);
                let infernite = production('shadow_mine', 'infernite', wiki);
                let vitreloy = production('shadow_mine', 'vitreloy', wiki);
                let desc = `<div>${loc('gain',[+(elerium).toFixed(3), global.resource.Elerium.name])}</div>`;
                desc += `<div>${loc('gain',[+(infernite).toFixed(3), global.resource.Infernite.name])}</div>`;
                desc += `<div>${loc('gain',[+(vitreloy).toFixed(3), global.resource.Vitreloy.name])}</div>`;
                desc += `<div>${loc('plus_max_resource',[elerium_cap, global.resource.Elerium.name])}</div>`;
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('shadow_mine','portal');
                    powerOnNewStruct($(this)[0]);
                    global.resource.Vitreloy.display = true;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['shadow_mine','portal']
                };
            },
            flair(){ return loc('portal_shadow_mine_flair'); }
        },
        tavern: {
            id: 'portal-tavern',
            title: loc('portal_tavern_title'),
            desc(){
                return `<div>${loc('portal_tavern_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { pitspawn: 2 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            powered(){ return powerCostMod(3); },
            powerBalancer(){
                return [{ r: 'Infernite', k: 'lpmod' }];
            },
            cost: {
                Money(offset){ return spaceCostMultiplier('tavern', offset, 12500000, 1.25, 'portal'); },
                Food(offset){ return spaceCostMultiplier('tavern', offset, 250000, 1.25, 'portal'); },
                Oil(offset){ return spaceCostMultiplier('tavern', offset, 125000, 1.25, 'portal'); },
                Brick(offset){ return spaceCostMultiplier('tavern', offset, 138000, 1.25, 'portal'); },
            },
            effect(wiki){
                let desc = '';
                if (!global.race['joyless']){
                    desc += `<div>${loc('plus_resource_per',[0.35,loc('morale'),loc('portal_shadow_mine_title')])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('tavern','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['tavern','portal']
                };
            },
            flair(){ return loc('portal_tavern_flair'); }
        },
    },
    prtl_ruins: {
        info: {
            name: loc('portal_ruins_name'),
            desc: loc('portal_ruins_desc'),
            support: 'guard_post',
            prop(){
                if (global.race['warlord']){ return ''; }
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
                    global.portal['stonehedge'] = { count: 0 };
                    initStruct(fortressModules.prtl_ruins.vault);
                    initStruct(fortressModules.prtl_ruins.archaeology);
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
            not_trait: ['warlord'],
            cost: {
                Money(offset){ return spaceCostMultiplier('guard_post', offset, 8000000, 1.06, 'portal'); },
                Lumber(offset){ return spaceCostMultiplier('guard_post', offset, 6500000, 1.06, 'portal'); },
                Sheet_Metal(offset){ return spaceCostMultiplier('guard_post', offset, 300000, 1.06, 'portal'); },
            },
            powered(){ return powerCostMod(5); },
            support(){ return 1; },
            effect(){
                let holy = global.race['holy'] ? 1 + (traits.holy.vars()[1] / 100) : 1;
                let unicornFathom = fathomCheck('unicorn');
                if (unicornFathom > 0){
                    holy *= 1 + (traits.holy.vars(1)[1] / 100 * unicornFathom);
                }
                let rating = Math.round(holy * armyRating(jobScale(1),'hellArmy',0));
                return `<div>${loc('portal_guard_post_effect1',[rating])}</div><div class="has-text-caution">${loc('portal_guard_post_effect2',[jobScale(1),$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('guard_post','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['guard_post','portal']
                };
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
            not_trait: ['warlord'],
            wiki: global.race['warlord'] ? false : true,
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
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('vault') ? global.portal.vault.count : 0);
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
            struct(){
                return {
                    d: { count: 0 },
                    p: ['vault','portal']
                };
            },
            post(){
                if (global.portal.vault.count === 2){
                    drawTech();
                    renderFortress();
                    clearPopper();
                }
            }
        },
        war_vault: {
            id: 'portal-war_vault',
            title: loc('portal_vault_title'),
            desc: loc('portal_vault_title'),
            reqs: { hell_ruins: 2, war_vault: 1 },
            trait: ['warlord'],
            wiki: global.race['warlord'] ? true : false,
            queue_complete(){ return 1 - global.portal.war_vault.count; },
            cost: {
                Codex(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('war_vault') ? global.portal.war_vault.count : 0)) === 0 ? 1 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('war_vault') ? global.portal.war_vault.count : 0);
                return count < 1 ? loc('portal_war_vault_effect',[100,global.resource.Soul_Gem.name]) : loc('portal_war_vault_effect2'); },
            action(){
                if (global.portal.war_vault.count < 1){
                    if (payCosts($(this)[0])){
                        incrementStruct('war_vault','portal');
                        if (global.portal.war_vault.count === 1){
                            global.resource.Codex.display = false;
                            global.resource.Soul_Gem.amount += 100;
                            messageQueue(loc('portal_war_vault_result',[global.resource.Soul_Gem.name]),'info',false,['progress','hell']);
                        }
                        return true;
                    }
                    else {
                        messageQueue(loc('portal_war_vault_fail',[global.resource.Soul_Gem.name]),'info',false,['progress','hell']);
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['war_vault','portal']
                };
            },
            post(){
                if (global.portal.war_vault.count === 2){
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
            not_trait: ['warlord'],
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
                        let hiredMax = jobScale(2);
                        global.civic.archaeologist.max += hiredMax;

                        let hired = Math.min(hiredMax, global.civic[global.civic.d_job].workers);
                        global.civic[global.civic.d_job].workers -= hired;
                        global.civic.archaeologist.workers += hired;
                    }  
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['archaeology','portal']
                };
            },
        },
        arcology: {
            id: 'portal-arcology',
            title: loc('portal_arcology_title'),
            desc(){
                return `<div>${loc('portal_arcology_title')}</div><div class="has-text-special">${loc('requires_security')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { housing: 4 },
            not_trait: ['warlord'],
            cost: {
                Money(offset){ return spaceCostMultiplier('arcology', offset, traitCostMod('untrustworthy',180000000), 1.22, 'portal'); },
                Graphene(offset){ return spaceCostMultiplier('arcology', offset, traitCostMod('untrustworthy',7500000), 1.22, 'portal'); },
                Bolognium(offset){ return spaceCostMultiplier('arcology', offset, traitCostMod('untrustworthy',2800000), 1.22, 'portal'); },
                Orichalcum(offset){ return spaceCostMultiplier('arcology', offset, traitCostMod('untrustworthy',5500000), 1.22, 'portal'); },
                Nanoweave(offset){ return spaceCostMultiplier('arcology', offset, traitCostMod('untrustworthy',650000), 1.22, 'portal'); },
                Horseshoe(){ return global.race['hooved'] ? 13 : 0; }
            },
            powered(){ return powerCostMod(25); },
            effect(wiki){
                let sup = hellSupression('ruins', 0, wiki);
                let vault = spatialReasoning(bank_vault() * 8 * sup.supress);
                vault = +(vault).toFixed(0);
                let containers = Math.round(get_qlevel(wiki)) * 10;
                let container_string = `<div>${loc('plus_max_resource',[containers,global.resource.Crates.name])}</div><div>${loc('plus_max_resource',[containers,global.resource.Containers.name])}</div>`;
                return `<div>${loc('plus_max_resource',[`\$${vault.toLocaleString()}`,loc('resource_Money_name')])}</div><div>${loc('plus_max_citizens',[$(this)[0].citizens()])}</div><div>${loc('plus_max_resource',[$(this)[0].soldiers(),loc('civics_garrison_soldiers')])}</div><div>${loc('portal_guard_post_effect1',[75])}</div>${container_string}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('arcology','portal');

                    if (powerOnNewStruct($(this)[0])){
                        global['resource'][global.race.species].max += 8;
                    }
                    if (!global.resource.Containers.display){
                        unlockContainers();
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
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['arcology','portal']
                };
            },
            soldiers(){
                let soldiers = global.race['grenadier'] ? 3 : 5;
                return jobScale(soldiers);
            },
            citizens(){
                return jobScale(8);
            }
        },
        hell_forge: {
            id: 'portal-hell_forge',
            title(){ return loc('portal_hell_forge_title'); },
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
            smelting(){
                return 3;
            },
            special: true,
            effect(wiki){
                let sup = hellSupression('ruins', 0, wiki);
                let craft = +(75 * sup.supress).toFixed(1);
                let reactor = global.tech['inferno_power'] ? `<div>${loc('portal_hell_forge_effect2',[global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 1 ? 12 : 10,loc(`portal_inferno_power_title`)])}</div>` : ``;
                return `<div>${loc('portal_hell_forge_effect',[jobScale(1)])}</div>${reactor}<div>${loc('interstellar_stellar_forge_effect3',[$(this)[0].smelting()])}</div><div>${loc('interstellar_stellar_forge_effect',[craft])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('hell_forge','portal');
                    if (powerOnNewStruct($(this)[0])){
                        addSmelter($(this)[0].smelting());
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['hell_forge','portal']
                };
            },
            post(){
                loadFoundry();
            },
            postPower(on){
                limitCraftsmen('Scarletite');
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
            powered(wiki){
                let power = 20;
                let infernal_forges_on = wiki ? (global.portal?.hell_forge?.on ?? 0) : p_on['hell_forge'];
                if (infernal_forges_on){
                    power += infernal_forges_on * (global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 1 ? 12 : 10); 
                }
                return powerModifier(-(power));
            },
            fuel: {
                Infernite: 5,
                Coal: 100,
                Oil: 80
            },
            effect(wiki){
                let fuel = $(this)[0].fuel;
                return `<div>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered(wiki))])}</div><div class="has-text-caution">${loc('portal_inferno_power_effect',[fuel.Infernite,global.resource.Infernite.name,fuel.Coal,global.resource.Coal.name,fuel.Oil,global.resource.Oil.name])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('inferno_power','portal');
                    global.portal.inferno_power.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['inferno_power','portal']
                };
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
                Harmony(offset,wiki){
                    if (offset !== undefined){
                        return offset + Object.keys(global.pillars).length < Object.keys(races).length - 1 ? 1 : 0;
                    }
                    return global.race.universe !== 'micro' && global.tech['pillars'] && global.tech.pillars === 1 ? 1 : 0;
                },
                Scarletite(offset,wiki){
                    if (offset !== undefined){
                        let pillars = offset + Object.keys(global.pillars).length;
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
                let pillars = (wiki?.count ?? 0) + Object.keys(global.pillars).length;
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
                        if (global.race['warlord']){
                            global.stats.warlord.p = true;
                            checkWarlordAchieve();
                        }
                        else if (global.tech?.hell_gate >= 2){
                            towerSize(true);
                            fortressModules.prtl_gate.west_tower.post(); //unlock towers if both are complete now
                            fortressModules.prtl_gate.east_tower.post();
                        }
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
                    return `<div>${loc('portal_west_tower')}</div><div class="has-text-special">${loc('requires_segments',[size])}</div>`;
                }
                else {
                    return `<div>${loc('portal_west_tower')}</div>`;
                }
            },
            reqs: { hell_gate: 2 },
            queue_size: 25,
            queue_complete(){ return towerSize() - global.portal.west_tower.count; },
            cost: {
                Money(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(10000000,wiki) : 0; },
                Stone(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(100000,wiki) : 0; },
                Uranium(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(1000,wiki) : 0; },
                Adamantite(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(18000,wiki) : 0; },
                Vitreloy(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(25000,wiki) : 0; },
                Soul_Gem(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? 1 : 0; },
                Scarletite(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(5000,wiki) : 0; },
            },
            effect(wiki){
                let size = towerSize();
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0);
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
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['west_tower','portal']
                };
            },
            post(){
                if (global.portal.west_tower.count >= towerSize()){
                    global.tech['wtower'] = 1;
                    if (global.tech['wtower'] && global.tech['etower'] && !global.tech['hell_lake']){
                        global.tech['hell_lake'] = 1;
                        global.settings.portal.lake = true;
                        initStruct(fortressModules.prtl_lake.harbor);
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
                    return `<div>${loc('portal_east_tower')}</div><div class="has-text-special">${loc('requires_segments',[size])}</div>`;
                }
                else {
                    return `<div>${loc('portal_east_tower')}</div>`;
                }
            },
            reqs: { hell_gate: 2 },
            queue_size: 25,
            queue_complete(){ return towerSize() - global.portal.east_tower.count; },
            cost: {
                Money(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(10000000,wiki) : 0; },
                Stone(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(100000,wiki) : 0; },
                Uranium(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(1000,wiki) : 0; },
                Adamantite(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(18000,wiki) : 0; },
                Vitreloy(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(25000,wiki) : 0; },
                Soul_Gem(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? 1 : 0; },
                Scarletite(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(5000,wiki) : 0; },
            },
            effect(wiki){
                let size = towerSize();
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0);
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
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['east_tower','portal']
                };
            },
            post(){
                if (global.portal.east_tower.count >= towerSize()){
                    global.tech['etower'] = 1;
                    if (global.tech['wtower'] && global.tech['etower'] && !global.tech['hell_lake']){
                        global.tech['hell_lake'] = 1;
                        global.settings.portal.lake = true;
                        global.portal['harbor'] = { count: 0, on: 0, support: 0, s_max: 0 };
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
                let unicornFathom = fathomCheck('unicorn');
                if (unicornFathom > 0){
                    security *= 1 + (traits.holy.vars(1)[1] / 100 * unicornFathom);
                }
                let min = global.tech.hell_gun >= 2 ? 65 : 40;
                let max = global.tech.hell_gun >= 2 ? 100 : 60;
                return `<div>${loc('portal_gate_turret_effect',[Math.round(security)])}</div><div>${loc('portal_gate_turret_effect2',[min,max])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('gate_turret','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['gate_turret','portal']
                };
            },
            post(){
                vBind({el: `#srprtl_gate`},'update');
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
            effect(wiki){
                let mining = production('infernite_mine', '', wiki);
                return `<div>${loc('portal_infernite_mine_effect',[+(mining).toFixed(3)])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('infernite_mine','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['infernite_mine','portal']
                };
            },
        },
    },
    prtl_lake: {
        info: {
            name: loc('portal_lake_name'),
            desc: loc('portal_lake_desc'),
            support: 'harbor',
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
        harbor: {
            id: 'portal-harbor',
            title(){ return loc('portal_harbor_title'); },
            desc(){
                return `<div>${loc('portal_harbor_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_lake: 3 },
            powered(wiki){
                let num_cooling_tower = wiki ? (global.portal?.cooling_tower?.on ?? 0) : p_on['cooling_tower'];
                let factor = num_cooling_tower || 0;
                return +(powerCostMod(500 * (0.92 ** factor))).toFixed(2);
            },
            support(){ return 1; },
            cost: {
                Money(offset){ return spaceCostMultiplier('harbor', offset, 225000000, spireCreep(1.18), 'portal'); },
                Cement(offset){ return spaceCostMultiplier('harbor', offset, 50000000, spireCreep(1.18), 'portal'); },
                Iridium(offset){ return spaceCostMultiplier('harbor', offset, 7500000, spireCreep(1.18), 'portal'); },
                Infernite(offset){ return spaceCostMultiplier('harbor', offset, 800000, spireCreep(1.18), 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('harbor', offset, 17500000, spireCreep(1.18), 'portal'); },
            },
            wide: true,
            res(){
                let list = [
                    'Oil','Alloy','Polymer','Iridium','Helium_3','Deuterium','Neutronium','Adamantite',
                    'Infernite','Nano_Tube','Graphene','Stanene','Bolognium','Orichalcum'
                ];
                if (global.race['warlord']){
                    list.push('Lumber');
                    list.push('Stone');
                    list.push('Copper');
                    list.push('Iron');
                    list.push('Aluminium');
                    list.push('Cement');
                    list.push('Steel');
                    list.push('Titanium');
                    list.push('Coal');
                }
                return list;
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
                    case 'Lumber':
                        return 1500000;
                    case 'Stone':
                        return 1500000;
                    case 'Copper':
                        return 650000;
                    case 'Iron':
                        return 650000;
                    case 'Steel':
                        return 650000;
                    case 'Aluminium':
                        return 425000;
                    case 'Titanium':
                        return 350000;
                    case 'Cement':
                        return 550000;
                    case 'Coal':
                        return 275000;
                    default:
                        return 0;
                }
            },
            effect(wiki){
                let storage = '<div class="aTable">';
                let multiplier = 1;
                if (global.race['warlord'] && global.eden['corruptor'] && global.tech?.asphodel >= 12){
                    multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech?.asphodel >= 13 ? 0.12 : 0.1);
                }
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let val = sizeApproximation(+(spatialReasoning($(this)[0].val(res) * multiplier)).toFixed(0),1);
                        storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                storage = storage + '</div>';
                return `<div>${loc('portal_harbor_effect',[1])}</div>${storage}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered(wiki)])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('harbor','portal');
                    if (powerOnNewStruct($(this)[0])){
                        let multiplier = 1;
                        if (global.race['warlord'] && global.eden['corruptor'] && global.tech?.asphodel >= 12){
                            multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech?.asphodel >= 13 ? 0.12 : 0.1);
                        }
                        for (const res of $(this)[0].res()){
                            if (global.resource[res].display){
                                global.resource[res].max += (spatialReasoning($(this)[0].val(res) * multiplier));
                            }
                        };
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['harbor','portal']
                };
            },
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
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['cooling_tower','portal']
                };
            },
        },
        bireme: {
            id: 'portal-bireme',
            title: loc('portal_bireme_title'),
            desc(){
                return `<div>${loc('portal_bireme_title')}</div><div class="has-text-special">${loc('space_support',[loc('lake')])}</div>`;
            },
            reqs: { hell_lake: 4 },
            powered(){ return 0; },
            s_type: 'lake',
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
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, crew: 0, mil: 0 },
                    p: ['bireme','portal']
                };
            }
        },
        transport: {
            id: 'portal-transport',
            title: loc('portal_transport_title'),
            desc(){
                return `<div>${loc('portal_transport_title')}</div><div class="has-text-special">${loc('space_support',[loc('lake')])}</div>`;
            },
            reqs: { hell_lake: 5 },
            powered(){ return 0; },
            s_type: 'lake',
            support(){ return -1; },
            cost: {
                Money(offset){ return spaceCostMultiplier('transport', offset, 300000000, 1.22, 'portal'); },
                Oil(offset){ return spaceCostMultiplier('transport', offset, 180000, 1.22, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('transport', offset, 18000000, 1.22, 'portal'); },
                Graphene(offset){ return spaceCostMultiplier('transport', offset, 12500000, 1.22, 'portal'); },
                Soul_Gem(offset){ return spaceCostMultiplier('transport', offset, 5, 1.22, 'portal'); },
                Scarletite(offset){ return spaceCostMultiplier('transport', offset, 250000, 1.22, 'portal'); },
            },
            effect(wiki){
                let rating = global.blood['spire'] && global.blood.spire >= 2 ? 0.8 : 0.85;
                let num_on = wiki ? (global.portal?.bireme?.on ?? 0) : gal_on['bireme'];
                let bireme = +((rating ** num_on) * 100).toFixed(1);
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
                    powerOnNewStruct($(this)[0]);
                    if (!global.settings.portal.spire){
                        global.settings.portal.spire = true;
                        global.settings.showCargo = true;
                        global.tech['hell_spire'] = 1;
                        initStruct(fortressModules.prtl_spire.purifier);
                        initStruct(fortressModules.prtl_spire.port);
                        messageQueue(loc('portal_transport_unlocked'),'info',false,['progress','hell']);
                        drawResourceTab('supply');
                        renderFortress();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0, on: 0, crew: 0, mil: 0,
                        cargo: {
                            used: 0, max: 0,
                            Crystal: 0, Lumber: 0,
                            Stone: 0, Furs: 0,
                            Copper: 0, Iron: 0,
                            Aluminium: 0, Cement: 0,
                            Coal: 0, Oil: 0,
                            Uranium: 0, Steel: 0,
                            Titanium: 0, Alloy: 0,
                            Polymer: 0, Iridium: 0,
                            Helium_3: 0, Deuterium: 0,
                            Neutronium: 0, Adamantite: 0,
                            Infernite: 0, Elerium: 0,
                            Nano_Tube: 0, Graphene: 0,
                            Stanene: 0, Bolognium: 0,
                            Vitreloy: 0, Orichalcum: 0,
                            Plywood: 0, Brick: 0,
                            Wrought_Iron: 0, Sheet_Metal: 0,
                            Mythril: 0, Aerogel: 0,
                            Nanoweave: 0, Scarletite: 0
                        }
                    },
                    p: ['transport','portal']
                };
            }
        },
        oven: {
            id: 'portal-oven',
            title: loc('portal_oven_title'),
            desc(wiki){
                if (!global.portal.hasOwnProperty('oven') || global.portal.oven.count < 100 || wiki){
                    return `<div>${loc('portal_oven_title')}</div><div class="has-text-special">${loc('requires_segments', [100])}</div>` + (global.portal.hasOwnProperty('oven') && global.portal.oven.count >= 100 ? `<div class="has-text-special">${loc('requires_power')}</div>` : ``);
                }
            },
            reqs: { dish:2 },
            condition(){
                return global.portal.oven.count < 100;
            },
            queue_size: 10,
            queue_complete(){ return 100 - global.portal.oven.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('oven') ? global.portal.oven.count : 0)) < 100 ? 190000000 : 0; },
                Steel(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('oven') ? global.portal.oven.count : 0)) < 100 ? 2000000 : 0; },
                Infernite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('oven') ? global.portal.oven.count : 0)) < 100 ? 600000 : 0; },
                Bolognium(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('oven') ? global.portal.oven.count : 0)) < 100 ? 1000000 : 0; },
                Scarletite(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('oven') ? global.portal.oven.count : 0)) < 100 ? 15000 : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('oven') ? global.portal.oven.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('portal_oven_effect1')}</div><div class="has-text-special">${loc('requires_segments',[remain])}</div>`;
                }
                else {
                    return fortressModules.prtl_lake.oven_complete.effect();
                }
            },
            action(){
                if (global.portal.oven.count < 100 && payCosts($(this)[0])){
                    global.portal['oven'].count++;
                    if (global.portal.oven.count >= 100){
                        global.tech['dish'] = 3;
                        initStruct(fortressModules.prtl_lake.oven_complete);
                        incrementStruct('oven_complete','portal');
                        if (global.settings.alwaysPower){
                            powerOnNewStruct(fortressModules.prtl_lake.oven_complete);
                        }
                        initStruct(fortressModules.prtl_lake.devilish_dish);
                        renderFortress();
                        clearPopper();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['oven','portal']
                };
            },
        },
        oven_complete: {
            id: 'portal-oven_complete',
            title: loc('portal_oven_title'),
            desc(){
                return `<div>${loc('portal_oven_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            wiki: false,
            reqs: { dish: 3 },
            condition(){
                return global.portal.oven.count >= 100;
            },
            queue_complete(){ return 0; },
            cost: {},
            effect(wiki){
                let fuel = $(this)[0].p_fuel();
                return `<div>${loc(`portal_oven_desc`)}</div>${global.tech['dish'] === 4 ? `<div class="has-text-special">${loc('portal_oven_desc2')}</div>` : ``}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}, ${loc('spend', [fuel.a, fuel.r])}</div>`;
            },
            powered(){ return powerCostMod(3500); },
            p_fuel(){ return { r: 'Infernite', a: 225 }},
            action(){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['oven_complete','portal']
                };
            }
        },
        devilish_dish: {
            id: 'portal-devilish_dish',
            title: loc('portal_devilish_dish_title'),
            desc: loc('portal_devilish_dish_title'),
            reqs: { dish: 3 },
            queue_complete(){ return 0; },
            cost: {},
            effect(){
                const progress = (global.portal['devilish_dish'] ? global.portal['devilish_dish'].done : 0);
                return `<div>${loc(`portal_devilish_dish_desc`,[progress.toFixed(1)])}</div><div>${loc(`portal_devilish_dish_flavor${progress >= 100 ? 6 : Math.ceil(progress/20)}`)}</div>`;
            },
            action(){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, done: 0, time: 0 },
                    p: ['devilish_dish','portal']
                };
            }
        },
        dish_soul_steeper: {
            id: 'portal-dish_soul_steeper',
            title: loc('portal_dish_soul_steeper_title'),
            desc: loc('portal_dish_soul_steeper_desc'),
            reqs: { dish: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('dish_soul_steeper', offset, 750000000, spireCreep(1.3), 'portal'); },
                Bolognium(offset){ return spaceCostMultiplier('dish_soul_steeper', offset, 12000000, spireCreep(1.3), 'portal'); },
                Scarletite(offset){ return spaceCostMultiplier('dish_soul_steeper', offset, 300000, spireCreep(1.3), 'portal'); },
            },
            powered(){ return 0; },
            effect(){
                return `<div>${loc('portal_dish_soul_steeper_effect1')}</div><div class="has-text-danger">${loc('portal_dish_soul_steeper_effect2', [3 + (global.race['malnutrition'] ? 1 : 0) + (global.race['angry'] ? -1 : 0)])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.portal['dish_soul_steeper'].count++;
                    global.portal['dish_soul_steeper'].on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['dish_soul_steeper','portal']
                };
            },
            flair: loc('portal_dish_soul_steeper_flair')
        },
        dish_life_infuser: {
            id: 'portal-dish_life_infuser',
            title: loc('portal_dish_life_infuser_title'),
            desc: loc('portal_dish_life_infuser_desc'),
            reqs: { dish: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('dish_life_infuser', offset, 280000000, spireCreep(1.2), 'portal'); },
                Bolognium(offset){ return spaceCostMultiplier('dish_life_infuser', offset, 8000000, spireCreep(1.2), 'portal'); },
                Orichalcum(offset){ return spaceCostMultiplier('dish_life_infuser', offset, 8000000, spireCreep(1.2), 'portal'); },
                Species(offset){ return popCost(10)}
            },
            powered(){ return 0; },
            effect(){
                return `<div>${loc('portal_dish_life_infuser_effect1', [15])}</div><div class="has-text-danger">${loc('portal_dish_life_infuser_effect2', [5])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.portal['dish_life_infuser'].count++;
                    global.portal['dish_life_infuser'].on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['dish_life_infuser','portal']
                };
            },
            flair: loc('portal_dish_life_infuser_flair')
        }
    },
    prtl_spire: {
        info: {
            name: loc('portal_spire_name'),
            desc: loc('portal_spire_desc'),
            support: 'purifier',
            prop(){
                let desc = ` - <span class="has-text-advanced">${loc('portal_spire_supply')}:</span> <span class="has-text-caution">{{ supply | filter }} / {{ sup_max | filter }}</span>`;
                return desc + ` (<span class="has-text-success">+{{ diff | filter(2) }}/s</span>)`;
            },
            filter(v,fix){
                let val = fix ? +(v).toFixed(fix) : Math.floor(v);
                return val.toLocaleString();
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
            title(){ return global.race['warlord'] ? loc('portal_putrifier_title') : loc('portal_purifier_title'); },
            desc(){
                return `<div>${global.race['warlord'] ? loc('portal_putrifier_desc') : loc('portal_purifier_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_spire: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('purifier', offset, 85000000, spireCreep(1.15), 'portal'); },
                Supply(offset){ return global.portal['purifier'] && global.portal.purifier.count === 0 ? 100 : spaceCostMultiplier('purifier', offset, 4200, spireCreep(1.2), 'portal'); },
            },
            powered(){ return global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 2 ? powerCostMod(100) : powerCostMod(125); },
            support(){
                let base = global.tech['b_stone'] && global.tech.b_stone >= 3 ? 1.25 : 1;
                if (global.tech['hell_spire'] && global.tech.hell_spire >= 11 && global.eden['asphodel_harvester'] && support_on['asphodel_harvester']){
                    base *= 1 + (support_on['asphodel_harvester'] / 50);
                }
                return +(base).toFixed(2);
            },
            effect(){
                return `<div>${loc('portal_purifier_effect',[$(this)[0].support()])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('purifier','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0, supply: 0, sup_max: 100, diff: 0 },
                    p: ['purifier','portal']
                };
            },
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
            powered(){ return 0; },
            s_type: 'spire',
            support(){ return -1; },
            effect(wiki){
                let port_value = 10000;
                let num_base_camps_on = wiki ? (global.portal?.base_camp?.on ?? 0) : spire_on['base_camp'];
                if (num_base_camps_on > 0){
                    port_value *= 1 + (num_base_camps_on * 0.4);
                }
                return `<div class="has-text-caution">${loc('portal_port_effect1',[$(this)[0].support()])}</div><div>${loc('portal_port_effect2',[Math.round(port_value)])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('port','portal');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech.hell_spire === 3){
                        global.tech.hell_spire = 4;
                        initStruct(fortressModules.prtl_spire.base_camp);
                        renderFortress();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['port','portal']
                };
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
            powered(){ return 0; },
            s_type: 'spire',
            support(){ return -1; },
            effect(){
                return `<div class="has-text-caution">${loc('portal_port_effect1',[$(this)[0].support()])}</div><div>${loc('portal_base_camp_effect',[40])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('base_camp','portal');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech.hell_spire === 4){
                        global.tech.hell_spire = 5;
                        initStruct(fortressModules.prtl_spire.bridge);
                        messageQueue(loc('portal_spire_bridge_collapse'),'info',false,['progress','hell']);
                        renderFortress();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['base_camp','portal']
                };
            }
        },
        bridge: {
            id: 'portal-bridge',
            title: loc('portal_bridge_title'),
            desc(wiki){
                if (!global.portal.hasOwnProperty('bridge') || global.portal.bridge.count < 10 || wiki){
                    return `<div>${loc('portal_bridge_title')}</div><div class="has-text-special">${loc('requires_segments',[10])}</div>`;
                }
                else {
                    return `<div>${loc('portal_bridge_title')}</div>`;
                }
            },
            reqs: { hell_spire: 5 },
            not_trait: ['warlord'],
            queue_size: 1,
            queue_complete(){ return 10 - global.portal.bridge.count; },
            cost: {
                Species(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('bridge') ? global.portal.bridge.count : 0)) < 10 ? popCost(10) : 0; },
                Money(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('bridge') ? global.portal.bridge.count : 0)) < 10 ? 500000000 : 0; },
                Supply(offset){ return ((offset || 0) + (global.portal.hasOwnProperty('bridge') ? global.portal.bridge.count : 0)) < 10 ? 100000 : 0; },
            },
            effect(wiki){
                let size = 10;
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('bridge') ? global.portal.bridge.count : 0);
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
                        initStruct(fortressModules.prtl_spire.sphinx);
                        global.tech.hell_spire = 6;
                        renderFortress();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['bridge','portal']
                };
            }
        },
        sphinx: {
            id: 'portal-sphinx',
            title(){ return global.race['warlord'] ? loc('portal_sphinx_warlord') : (global.tech.hell_spire === 7 ? loc('portal_sphinx_solve') : loc('portal_sphinx_title')); },
            desc(){ return global.race['warlord'] ? loc('portal_sphinx_warlord_desc') : loc('portal_sphinx_desc'); },
            reqs: { hell_spire: 6 },
            queue_complete(){ return 8 - global.tech.hell_spire; },
            cost: {
                Knowledge(offset){
                    let count = (offset || 0) + (!global.tech['hell_spire'] || global.tech.hell_spire < 7 ? 0 : global.tech.hell_spire === 7 ? 1 : 2);
                    return count === 1 ? 50000000 : count === 0 ? 40000000 : 0;
                }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (!global.tech['hell_spire'] || global.tech.hell_spire < 7 ? 0 : global.tech.hell_spire === 7 ? 1 : 2);
                if (count === 1){
                    return loc('portal_sphinx_effect2');
                }
                else if (count === 2){
                    return global.race['warlord'] ? loc('portal_sphinx_warlord_effect') :loc('portal_sphinx_effect3');
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
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['sphinx','portal']
                };
            }
        },
        bribe_sphinx: {
            id: 'portal-bribe_sphinx',
            title: loc('portal_sphinx_bribe'),
            desc: loc('portal_sphinx_desc'),
            reqs: { hell_spire: 7 },
            not_trait: ['warlord'],
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
            not_trait: ['warlord'],
            queue_complete(){ return global.tech.hell_spire >= 9 ? 0 : 1; },
            cost: {
                Oil(){ return 1200000; },
                Helium_3(){ return 900000; },
            },
            effect: loc('portal_spire_survey_effect'),
            action(){
                if (payCosts($(this)[0])){
                    initStruct(fortressModules.prtl_spire.mechbay);
                    initStruct(fortressModules.prtl_spire.spire);
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
            title(){ return global.race['warlord'] ? loc('portal_demon_artificer_title') : loc('portal_mechbay_title'); },
            desc(){
                return `<div>${loc('portal_demon_artificer_title')}</div><div class="has-text-special">${loc('portal_spire_support')}</div>`;
            },
            reqs: { hell_spire: 9 },
            cost: {
                Money(offset){ return spaceCostMultiplier('mechbay', offset, 100000000, 1.2, 'portal'); },
                Supply(offset){ return spaceCostMultiplier('mechbay', offset, 250000, 1.2, 'portal'); },
            },
            powered(){ return 0; },
            s_type: 'spire',
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
                return `<div class="has-text-caution">${loc('portal_port_effect1',[$(this)[0].support()])}</div><div>${loc(global.race['warlord'] ? 'portal_demon_artificer_effect' : 'portal_mechbay_effect')}</div><div>${loc('portal_mechbay_effect2',[bay,max])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('mechbay','portal');
                    if (powerOnNewStruct($(this)[0])){
                        global.portal.mechbay.max += 25;
                    }
                    global.settings.showMechLab = true;
                    if (global.portal.mechbay.count === 1){
                        messageQueue(loc('portal_mechbay_unlocked'),'info',false,['progress','hell']);
                        drawMechLab();
                        defineGovernor();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, bay: 0, max: 0, active: 0, scouts: 0, mechs: [] },
                    p: ['mechbay','portal']
                };
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
            },
            struct(){
                return {
                    d: { count: 1, progress: 0, boss: '', type: '', status: {} },
                    p: ['spire','portal']
                };
            },
        },
        waygate: {
            id: 'portal-waygate',
            title: loc('portal_waygate_title'),
            desc(wiki){
                if (!global.portal.hasOwnProperty('waygate') || (global.tech['waygate'] && global.tech.waygate < 2) || wiki){
                    return `<div>${loc('portal_waygate_title')}</div><div class="has-text-special">${loc('requires_segments',[10])}</div>`;
                }
                else {
                    return `<div>${loc('portal_waygate_title')}</div>`;
                }
            },
            reqs: { waygate: 1 },
            condition(){
                return global.tech['edenic'] && global.tech.edenic >= 2 ? false : true;
            },
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
                let count = (wiki?.count ?? 0) + (global.tech['waygate'] && global.tech.waygate >= 2 ? 10 : global.portal.hasOwnProperty('waygate') ? global.portal.waygate.count : 0);
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
                        if (global.settings.alwaysPower){
                            global.portal.waygate.on = 1;
                        }
                        renderFortress();
                        drawTech();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, progress: 0, on: 0 },
                    p: ['waygate','portal']
                };
            },
        },
        edenic_gate:{
            id: 'portal-edenic_gate',
            title(wiki){
                return loc(global.tech['edenic'] && global.tech.edenic >= 3 ? 'portal_edenic_gate_title' : 'portal_waygate_title');
            },
            desc(wiki){
                return $(this)[0].title();
            },
            reqs: { waygate: 3, edenic: 2 },
            queue_size: 1,
            queue_complete(){ return global.tech.edenic >= 3 ? 0 : 1; },
            cost: {
                Money(o){
                    return global.tech['edenic'] && global.tech.edenic < 3 ? 10000000000 : 0;
                },
                Supply(o){
                    return global.tech['edenic'] && global.tech.edenic < 3 ? 1000000 : 0;
                },
                Blessed_Essence(o){
                    return global.tech['edenic'] && global.tech.edenic < 3 ? 1 : 0;
                },
            },
            effect(wiki){
                if (global.tech['edenic'] && global.tech.edenic <= 2){
                    return `<div>${loc('portal_edenic_gate_effect')}</div>`;
                }
                else {
                    return `<div>${loc('portal_edenic_gate_effect_complete')}</div>`;
                }
            },
            action(){
                if (global.tech['edenic'] && global.tech.edenic === 2 && payCosts($(this)[0])){
                    global.tech.edenic = 3;
                    global.settings.showEden = true;
                    global.settings.eden.asphodel = true;
                    global.settings.spaceTabs = 7;
                    global.resource.Blessed_Essence.display = false;
                    initStruct(actions.eden.eden_asphodel.encampment);
                    renderFortress();
                    renderEdenic();
                    return true;
                }
                return false;
            }
        },
        bazaar: {
            id: 'portal-bazaar',
            title: loc('portal_bazaar_title'),
            desc: loc('portal_bazaar_title'),
            reqs: { hellspawn: 8 },
            trait: ['warlord'],
            cost: {
                Money(offset){ return spaceCostMultiplier('bazaar', offset, 1000000000, 1.25, 'portal'); },
                Supply(offset){ return spaceCostMultiplier('bazaar', offset, 250000, 1.25, 'portal'); },
            },
            effect(wiki){
                let vault = spatialReasoning(bank_vault() * (global.portal?.spire?.count || 1) / 3);
                vault = +(vault).toFixed(0);
                let containers = (global.portal?.spire?.count || 1) * 8;
                let mon = (global.portal?.spire?.count || 1);

                let desc = `<div>${loc('plus_max_resource',[`\$${vault.toLocaleString()}`,loc('resource_Money_name')])}</div>`;
                desc += `<div>${loc('city_tourist_center_effect2',[mon,loc(`arpa_project_monument_title`)])}</div>`;
                desc += `<div>${loc('plus_max_resource',[containers,global.resource.Crates.name])}</div><div>${loc('plus_max_resource',[containers,global.resource.Containers.name])}</div>`;
                desc += `<div>${loc('city_trade_effect',[(global.portal?.spire?.count || 1)])}</div>`;

                return desc;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('bazaar','portal');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['bazaar','portal']
                };
            },
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
                    size -= global.pillars[pillar] * 2 + 2;
                }
            });            
        }
        if (size < 250){ size = 250; }
        return size;
    }
})();

function towerPrice(cost, wiki){
    let sup = hellSupression('gate', 0, wiki);
    return Math.round(cost / (sup.supress > 0.01 ? sup.supress : 0.01));
}

export function soulForgeSoldiers(wiki){
    let base = global.race['warlord'] ? 400 : 650;
    let num_gun_emplacement = wiki ? (global.portal?.gun_emplacement?.on ?? 0) : p_on['gun_emplacement'];
    let num_soldiers_saved = num_gun_emplacement * (global.tech.hell_gun >= 2 ? jobScale(2) : jobScale(1));

    // To avoid divide-by-0 type issues, force the average soldier combat rating to be at least 1
    let avg_rating = Math.max(armyRating(1, 'hellArmy'), highPopAdjust(1));
    let soldiers = Math.ceil(base / avg_rating);
    soldiers = Math.max(0, soldiers - num_soldiers_saved);

    if (global.race['hivemind']){
        // Permit actual soldiers to count as a group for combat rating adjustment
        // Gun emplacements use the combat rating of the remaining soldiers
        // Both soldiers=0 and soldiers=1 cases use the combat rating of 1 soldier alone
        soldiers = 0;
        while ((soldiers + num_soldiers_saved) * avg_rating < base){
            soldiers++;
            avg_rating = armyRating(soldiers, 'hellArmy') / soldiers;
            avg_rating = Math.max(avg_rating, highPopAdjust(1));
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

            if (typeof fortressModules[region].info['support'] && global.portal[fortressModules[region].info['support']]){
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
                if (global.race['warlord']){
                    buildEnemyFortress(parent);
                }
                else {
                    buildFortress(parent,true);
                }
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

function buildEnemyFortress(parent){
    if (!global.race['warlord']){
        return;
    }
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

    let id = 'fort';
    let fort = $(`<div id="${id}" class="fort"></div>`);
    parent.append(fort);

    let enemy = $(`<div v-for="(e, index) of enemy" :key="index" class="enemyFortress">
        <div class="fortRow"><span class="has-text-success">{{ e.r | species }}</span><span class="has-text-warning">${loc(`fortress_wall`)} {{ e.f }}%</span></div>
        <div class="fortRow second"><span class="has-text-caution">${loc(`fortress_demon_kills`)} {{ e.k | kills }}</span><a class="button" v-on:click="action(index)">${loc(`civics_garrison_attack`)}</a></div>
    </div>`);
    fort.append(enemy);

    vBind({
        el: `#${id}`,
        data: global.portal.throne,
        methods: {
            action(idx){
                let horde = Math.floor(global.portal.minions.spawns * seededRandom(6, 10, true) / 10);
                let scale = global.race['hivemind'] ? traits.hivemind.vars()[0] : 1;
                let rating = armyRating(scale,'hellArmy',0) / scale;
                let died = seededRandom((250 + global.portal.throne.enemy[idx].s * 250) / rating, (500 + global.portal.throne.enemy[idx].s * 1250) / rating, true);
                if (global.race['armored']){
                    died *= 1 - (traits.armored.vars()[0] / 100);
                    died = Math.round(died);
                }
                let range = global.portal.throne.enemy[idx].f;
                for (let i=0; i<range; i++){
                    died += seededRandom(global.portal.throne.enemy[idx].s * 250 / rating, global.portal.throne.enemy[idx].s * 1250 / rating, true);
                    if (horde > died){
                        global.portal.throne.enemy[idx].f--;
                    }
                    else {
                        break;
                    }
                }
                died = Math.round(died);
                if (global.portal.minions.spawns < died){ died = global.portal.minions.spawns; }
                global.portal.minions.spawns -= died;
                global.portal.throne.enemy[idx].k += died;
                   
                if (p_on['soul_forge']){
                    let troops = garrisonSize(false,{no_forge: true});
                    let forge = soulForgeSoldiers();
                    if (forge <= troops){
                        global.portal.soul_forge.kills += died;
                    }
                }

                if (global.portal.throne.enemy[idx].f <= 0){
                    messageQueue(loc('fortress_enemy_defeat',[races[global.portal.throne.enemy[idx].r].name]),'info',false,['progress']);
                    global.portal.throne.hearts.push(global.portal.throne.enemy[idx].r);
                    global.portal.throne.enemy.splice(idx,1);
                    renderFortress();
                }
            }
        },
        filters: {
            species(v){
                return races[v].name;
            },
            kills(v){
                return sizeApproximation(v);
            }
        }
    });
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

    wallStatus.append($(`<span class="has-text-warning" :aria-label="defense()">${loc('fortress_wall')} <span :class="wall()">{{ f.walls }}%</span></span>`));

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

    var bunks = $('<div class="bunks"></div>');
    station.append(bunks);
    bunks.append($(`<span class="has-text-warning">${loc('civics_garrison')}: </span>`));
    let soldier_title = global.tech['world_control'] && !global.race['truepath'] ? loc('civics_garrison_peacekeepers') : loc('civics_garrison_soldiers');
    bunks.append($(`<span><span class="soldier">${soldier_title}</span> <span v-html="$options.filters.stationed(g.workers)"></span> / <span>{{ g.max | s_max }} | <span></span>`));
    bunks.append($(`<span v-show="g.crew > 0"><span class="crew">${loc('civics_garrison_crew')}</span> <span>{{ g.crew }} | </span></span>`));
    bunks.append($(`<span><span class="wounded">${loc('civics_garrison_wounded')}</span> <span>{{ g.wounded }}</span></span>`));

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
                if (p_on['soul_forge'] && !global.race['warlord']){
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
                    let cost = mercCost();
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
            },
            stationed(){
                return garrisonSize();
            },
            s_max(v){
                return garrisonSize(true);
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
        soldierDeath(dead);
    }
    return dead;
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

export function bloodwar(){
    let day_report = {
        start: global.portal.fortress.threat,
        foundGems: 0,
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
                surveyors: 0,
                compactor: 0
            },
        }
    };

    let pat_armor = global.tech['armor'] ? global.tech['armor'] : 0;
    if (global.race['armored']){
        pat_armor += traits.armored.vars()[1];
    }
    let torFathom = fathomCheck('tortoisan');
    if (torFathom > 0){
        pat_armor += Math.floor(traits.armored.vars(1)[1] * torFathom);
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
                    soulCapacitor(killed);
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
    
    if (global.tech['portal'] >= 4 && p_on['attractor']){
        gem_chance = Math.round(gem_chance * (0.948 ** p_on['attractor']));
    }

    if (global.race['ghostly']){
        gem_chance = Math.round(gem_chance * ((100 - traits.ghostly.vars()[2]) / 100));
    }

    let wendFathom = fathomCheck('wendigo');
    if (wendFathom > 0){
        gem_chance = Math.round(gem_chance * ((100 - (traits.ghostly.vars(1)[2] * wendFathom)) / 100));
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
            if (global.race['chicken']){
                odds -= Math.round(traits.chicken.vars()[0] / 5);
            }
            if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.f){
                odds += Math.round(3 * traits.ocular_power.vars()[1] / 100);
            }

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
                    soulCapacitor(killed);
                }
                patrol_report.kills = killed;
                if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p){
                    global.race.ocularPowerConfig.ds += Math.round(killed * traits.ocular_power.vars()[1]);
                }
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
                    soulCapacitor(killed);
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
                    if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p){
                        global.race.ocularPowerConfig.ds += Math.round(killed * traits.ocular_power.vars()[1]);
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
                soulCapacitor(terminated);
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
        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p){
            global.race.ocularPowerConfig.ds += Math.round(killed * traits.ocular_power.vars()[1]);
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
            soldierDeath(global.portal.fortress.garrison);
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
        if (global.race['chicken']){
            influx *= 1 + traits.chicken.vars()[0] / 100;
        }
        if (global.race.universe === 'evil'){
            influx *= 1.1;
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
        let fathom = fathomCheck('yeti');
        if (fathom > 0){
            divisor *= 1 + (traits.blurry.vars(1)[0] / 100 * fathom);
        }
        if (global.race['instinct']){
            divisor *= 1 + (traits.instinct.vars()[0] / 100);
        }
        if (global.tech['infernite'] && global.tech.infernite >= 5){
            divisor += 250;
        }
        // Higher danger increases both chance of death and average number of deaths, with no limit
        let danger = jobScale(global.portal.fortress.threat / divisor);

        // Higher exposure increases only chance of death, up to a limit
        let max_risk = jobScale(10);
        let exposure = Math.min(max_risk, global.civic.hell_surveyor.workers);
        let risk = max_risk - Math.rand(0,exposure + 1);

        if (danger > risk){
            let cap = Math.round(danger);
            let dead = Math.rand(0,cap + 1); // +1 for inclusive cap
            if (dead > 0){
                if (dead > global.civic.hell_surveyor.workers){
                    dead = global.civic.hell_surveyor.workers;
                }
                if (global.portal.fortress.s_ntfy === 'Yes'){
                    if (dead === 1){
                        messageQueue(loc('fortress_killed'),false,false,['hell']);
                    }
                    else {
                        messageQueue(loc('fortress_eviscerated',[dead]),false,false,['hell']);
                    }
                }
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
            let drone_kills_left = drone_kills;
            for (let i=0; i<global.civic.hell_surveyor.workers; i++){
                let surv_report = { gem: 0, bodies: 0 };
                // Avoid rounding error in total number of drone kills to distribute
                let max_search_chance = Math.round(drone_kills_left / (global.civic.hell_surveyor.workers - i));
                let min_search_chance = Math.round(max_search_chance / 2);
                drone_kills_left -= max_search_chance;

                // Each surveyor may search from 50% to 100% of 1 equal share of drone kills
                let searched = Math.rand(min_search_chance, max_search_chance+1);
                // Limit to 100 bodies per surveyor
                let search_limit = highPopAdjust(100);
                if (searched > search_limit){ searched = search_limit; }
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
            let attract = global.blood['attract'] ? global.blood.attract * 5 : 0;
            if (global.tech['hell_pit'] && global.tech.hell_pit >= 8){ attract *= 2; }
            let souls = p_on['soul_attractor'] * Math.rand(40 + attract, 120 + attract);
            global.portal.soul_forge.kills += souls;
            day_report.soul_attractors = souls;
            soulCapacitor(souls);
        }

        if (forgeOperating && global.tech['asphodel'] && global.tech.asphodel >= 2 && support_on['ectoplasm_processor']){
            let attract = global.blood['attract'] ? global.blood.attract * 5 : 0;
            let souls = global.civic.ghost_trapper.workers * Math.rand(150 + attract, 250 + attract);
            if (p_on['ascension_trigger'] && global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
                let heatSink = actions.interstellar.int_sirius.ascension_trigger.heatSink();
                heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;
                if (heatSink > 0){
                    souls *= 1 + (heatSink / 12500);
                }
            }
            souls = Math.floor(souls * asphodelResist());
            global.portal.soul_forge.kills += souls;
            soulCapacitor(souls);
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
            soulCapacitor(gunKills);
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
            soulCapacitor(forgeKills);
            if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p){
                global.race.ocularPowerConfig.ds += Math.round(forgeKills * traits.ocular_power.vars()[1]);
            }
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
            let gems = Math.floor(global.portal.soul_forge.kills / Math.round(cap));
            global.portal.soul_forge.kills -= Math.round(cap) * gems;
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
                global.resource.Soul_Gem.amount += gems;
                day_report.stats.gems.crafted += gems;
            }
        }
    }

    if (global.tech['hell_gate'] && global.tech['hell_gate'] >= 3){
        if (p_on['gate_turret']){
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
            if (forgeOperating){
                day_report.stats.kills.turrets = gunKills;
                global.portal.soul_forge.kills += gunKills;
                soulCapacitor(gunKills);
            }
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

    if (global.eden.hasOwnProperty('soul_compactor') && global.eden.soul_compactor.count === 1){
        day_report.stats.gems.compactor = global.eden.soul_compactor.report;
        global.eden.soul_compactor.report = 0;
    }
    
    global.portal.observe.stats.total.days++;
    global.portal.observe.stats.period.days++;
    Object.keys(day_report.stats).forEach(function(stat){
        if (['kills','gems'].includes(stat)){
            Object.keys(day_report.stats[stat]).forEach(function(subStat){
                if (stat === 'gems' && day_report.stats[stat][subStat]){
                    day_report.foundGems += day_report.stats[stat][subStat];
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

export function hellguard(){
    if (global.race['warlord'] && global.portal['minions'] && global.portal.minions.count > 0){
        if ((global.portal.throne.enemy.length === 0 || 
            (global.portal.throne.spawned.length >= 3 && global.portal.throne.enemy.length <= 1) ||
            (global.portal.throne.spawned.length >= 8 && global.portal.throne.enemy.length <= 2)
        ) && Math.rand(0,10) === 0 && global.portal.minions.spawns > 0){
            if (global.portal.throne.spawned.length === 0){
                addHellEnemy(['basic']);
            }
            else {
                if (global.portal.throne.spawned.length % 3 === 0 && global.portal.throne.spawned.length % 5 === 0){
                    addHellEnemy(['advanced','rare']);
                }
                else if (global.portal.throne.spawned.length % 3 === 0){
                    addHellEnemy(['advanced']);
                }
                else if (global.portal.throne.spawned.length % 5 === 0){
                    addHellEnemy(['rare']);
                }
                else {
                    addHellEnemy(['basic']);
                }
            }
        }

        if (global.portal.minions.on > 0){
            let spawn = fortressModules.prtl_badlands.minions.soldiers();
            let low_spawn = spawn - 10;
            if (global.race['infectious']){
                spawn += traits.infectious.vars()[1];
                low_spawn += traits.infectious.vars()[0];
            }
            global.portal.minions.spawns += Math.rand(global.portal.minions.on * low_spawn, global.portal.minions.on * spawn);
        }

        let forgeOperating = false;
        if (p_on['soul_forge']){
            let troops = garrisonSize(false,{no_forge: true});
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

        if (global.portal.throne.enemy.length > 0){
            let scale = global.race['hivemind'] ? traits.hivemind.vars()[0] : 1;
            let rating = armyRating(scale,'hellArmy',0) / scale;
            global.portal.throne.enemy.forEach(function(e){
                let eRating = e.s + (global.portal.minions.spawns / 9000) ** 8;
                let reapEffect = global.race['blurry'] ? 102 - traits.blurry.vars()[0] : 102;
                reapEffect -= (global.portal?.reaper?.rank || 1) * 2;
                if (reapEffect < 1){ reapEffect = 1; }
                let reaper = 0.25 + (eRating * 0.01) - ((global.portal?.reaper?.count || 0) ** (1 + ((global.portal?.reaper?.rank || 1) - 1) / 25) / reapEffect);
                if (reaper < 0.01){ reaper = 0.01; }
                let bound = Math.round(global.portal.minions.spawns * (0.5 * eRating) * (eRating ** reaper) / rating);
                let kills = Math.rand(e.s, bound);
                if (kills > global.portal.minions.spawns){ kills = global.portal.minions.spawns; }
                global.portal.minions.spawns -= kills;
                e.k += kills;
                if (forgeOperating){
                    global.portal.soul_forge.kills += kills;
                }

                if (e.f < 100 && Math.rand(0, 10) === 0){
                    e.f++;
                }

                if (global.race['revive']){
                    let revive = Math.round(Math.rand(0,(kills / (traits.revive.vars()[6] * 20))));
                    global.portal.minions.spawns += revive;
                }
            });
        }

        if (forgeOperating && global.tech.hell_pit >= 5 && p_on['soul_attractor']){
            let attract = global.blood['attract'] ? global.blood.attract * 5 : 0;
            if (global.tech['hell_pit'] && global.tech.hell_pit >= 8){ attract *= 2; }
            let souls = p_on['soul_attractor'] * Math.rand(40 + attract, 120 + attract);
            if (global.race['ghostly']){
                souls *= 1 + (traits.ghostly.vars()[0] / 100);
                souls = Math.round(souls);
            }
            global.portal.soul_forge.kills += souls;
        }

        if (forgeOperating && global.tech['asphodel'] && global.tech.asphodel >= 2 && support_on['ectoplasm_processor']){
            let attract = global.blood['attract'] ? global.blood.attract * 5 : 0;
            let souls = global.civic.ghost_trapper.workers * Math.rand(150 + attract, 250 + attract);
            if (global.portal['mortuary'] && global.portal['corpse_pile']){
                let corpse = (global.portal?.corpse_pile?.count || 0) * (p_on['mortuary'] || 0);
                if (corpse > 0){
                    souls *= 1 + corpse / 800;
                }
            }
            souls = Math.floor(souls * asphodelResist());
            global.portal.soul_forge.kills += souls;
        }

        let cap = global.tech.hell_pit >= 6 ? 750000 : 1000000;
        if (global.tech.hell_pit >= 7 && p_on['soul_attractor'] > 0){
            cap *= 0.97 ** p_on['soul_attractor'];
        }
        if (global.race['ghostly']){
            cap *= 2 - traits.ghostly.vars()[1];
        }
        if (forgeOperating && global.portal.soul_forge.kills >= Math.round(cap)){
            let gems = Math.floor(global.portal.soul_forge.kills / Math.round(cap));
            global.portal.soul_forge.kills -= Math.round(cap) * gems;
            global.resource.Soul_Gem.amount += gems;
        }
    }

    if (global.race['warlord'] && global.resource.Authority.amount >= 250 && global.resource.Authority.max >= 250){
        global.stats.warlord.a = true;
        checkWarlordAchieve();
    }

    ['incinerator','warehouse','hovel','hell_casino','twisted_lab','demon_forge','hell_factory','pumpjack','dig_demon','tunneler','brute','minions','reaper','corpse_pile'].forEach(function(s){
        if (global.portal[s] && (!global.portal[s]['rank'] || global.portal[s].rank > 5)){
            global.portal[s]['rank'] = 1;
        }
    });
}

function checkSkillPointAssignments(){
    let remaining = 0;
    ['incinerator','warehouse','hovel','hell_casino','twisted_lab','demon_forge','hell_factory','pumpjack','dig_demon','tunneler','brute','minions','reaper','corpse_pile'].forEach(function(s){
        if (global.portal[s]){
            remaining += 5 - global.portal[s].rank;
            if (global.portal[s].rank >= 5 || !global.portal.throne.skill || global.portal.throne.points <= 0){
                $(`#portal-${s} a.button`).removeClass('blue');
            }
            else if (global.portal[s].rank < 5 && global.portal.throne.skill && global.portal.throne.points > 0){
                $(`#portal-${s} a.button`).addClass('blue');
            }
        }
    });
    if (!global.portal.throne.skill || global.portal.throne.points <= 0 || remaining === 0){
        global.portal.throne.skill = false;
        $(`#portal-throne a.button`).removeClass('green');
    }
    else if (global.portal.throne.skill && global.portal.throne.points > 0){
        $(`#portal-throne a.button`).addClass('green');
    }
    console.log(remaining);
    return remaining;
}

function rankDesc(label, struct){
    return global.portal[struct].rank <= 1 ? label : `${label} (<span class="has-text-${global.portal[struct].rank === 5 ? 'caution' : 'info'}">${loc('wiki_trait_rank')} ${global.portal[struct].rank}</span>)`;
}

function addHellEnemy(type = [], allowRecursion = true, allowRepeat = false){
    let invaders = [];
    if (type.includes('basic')){
        [
            'human','elven','orc','cath','wolven','vulpine','centaur','rhinotaur','capybara','kobold','goblin',
            'gnome','ogre','cyclops','troll','tortoisan','gecko','slitheryn','arraak','pterodacti','dracnid',
            'entish','cacti','pinguicula','sporgar','shroomi','moldling','mantis','scorpid','antid'
        ].forEach(function(r){
            if (allowRepeat || (!global.portal.throne.spawned.includes(r) && ![global.race.gods,global.race.old_gods,global.race.origin].includes(r))){
                invaders.push(r);
            }
        });
    }
    if (type.includes('advanced')){
        ['sharkin','octigoran','dryad','satyr','phoenix','salamander','yeti','wendigo','tuskin','kamel','balorg','imp','seraph','unicorn','synth'].forEach(function(r){
            if (allowRepeat || (!global.portal.throne.spawned.includes(r) && ![global.race.gods,global.race.old_gods,global.race.origin].includes(r))){
                invaders.push(r);
            }
        });
    }
    if (type.includes('rare')){
        ['ghast','shoggoth','dwarf','raccoon','lichen','wyvern','beholder','djinn','narwhal','bombardier','nephilim'].forEach(function(r){
            if (allowRepeat || (!global.portal.throne.spawned.includes(r) && ![global.race.gods,global.race.old_gods,global.race.origin].includes(r))){
                invaders.push(r);
            }
        });
    }
    if (invaders.length === 0 && allowRecursion){
        addHellEnemy(['basic','advanced','rare'],false);
    }
    else if (invaders.length === 0){
        addHellEnemy(['basic','advanced','rare'],false,true);
    }
    else {
        let race = invaders[Math.floor(seededRandom(0,invaders.length))];
        global.portal.throne.enemy.push({
            r: race,
            f: 100,
            s: global.portal.throne.spawned.length+1,
            k: 0
        });
        global.portal.throne.spawned.push(race);
        messageQueue(loc('portal_invasion_msg',[races[race].entity]),'info',false,['progress']);
        if (!global.settings.portal.fortress){
            global.settings.portal.fortress = true;
            renderFortress();
        }
    }
}

function soulCapacitor(souls){
    if (global.race['witch_hunter'] && global.portal.hasOwnProperty('soul_capacitor') && p_on['soul_capacitor'] > 0){
        global.portal.soul_capacitor.energy += souls;
        if (global.portal.soul_capacitor.energy > global.portal.soul_capacitor.ecap){
            global.portal.soul_capacitor.energy = global.portal.soul_capacitor.ecap;
        }
    }
}

export function hellSupression(area, val, wiki){
    // It might be nice to set suppression to 100% in the wiki before unlocking the ruins
    switch (area){
        case 'ruins':
            {
                let guard_posts_on = wiki ? (global.portal?.guard_post?.on ?? 0) : p_on['guard_post'];
                let army = val || jobScale(guard_posts_on);
                let arc = (wiki ? (global.portal?.arcology?.on ?? 0) : p_on['arcology']) * 75;
                let aRating = armyRating(army,'hellArmy',0);
                if (global.race['holy']){
                    aRating *= 1 + (traits.holy.vars()[1] / 100);
                }
                let unicornFathom = fathomCheck('unicorn');
                if (unicornFathom > 0){
                    aRating *= 1 + (traits.holy.vars(1)[1] / 100 * unicornFathom);
                }
                let supress = global.race['warlord'] ? 1 : (aRating + arc) / 5000;
                return {
                    supress: supress > 1 ? 1 : supress,
                    rating: aRating + arc
                };
            }
        case 'gate':
            {
                let gSup = hellSupression('ruins',val,wiki);
                let turret = (wiki ? (global.portal?.gate_turret?.on ?? 0) : p_on['gate_turret']) * 100;
                if (global.race['holy']){
                    turret *= 1 + (traits.holy.vars()[1] / 100);
                }
                let unicornFathom = fathomCheck('unicorn');
                if (unicornFathom > 0){
                    turret *= 1 + (traits.holy.vars(1)[1] / 100 * unicornFathom);
                }
                let supress = global.race['warlord'] ? 1 : (gSup.rating + turret) / 7500;
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
            tesla: 0.65,
            claws: 0.5,
            venom: 0.62,
            cold: 1.25,
            shock: 0.68,
            fire: 0,
            acid: 0.25,
            stone: 0.5,
            iron: 0.5,
            flesh: 0.3,
            ice: 1.12,
            magma: 0,
            axe: 0.5,
            hammer: 0.5
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
            tesla: 0.75,
            claws: 0.4,
            venom: 0.8,
            cold: 1.1,
            shock: 0.68,
            fire: 0.8,
            acid: 0.25,
            stone: 0.4,
            iron: 0.3,
            flesh: 0.5,
            ice: 1.1,
            magma: 0.75,
            axe: 0.45,
            hammer: 0.45
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
            tesla: 0,
            claws: 0.7,
            venom: 0.25,
            cold: 0.35,
            shock: 0,
            fire: 0.9,
            acid: 1,
            stone: 0.5,
            iron: 0.65,
            flesh: 0.3,
            ice: 0.3,
            magma: 0.9,
            axe: 0.2,
            hammer: 1
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
            tesla: 0.15,
            claws: 0.75,
            venom: 0,
            cold: 0.2,
            shock: 0.15,
            fire: 0.4,
            acid: 0.85,
            stone: 0.9,
            iron: 1,
            flesh: 0.15,
            ice: 0.3,
            magma: 0.9,
            axe: 0.65,
            hammer: 1.2
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
            tesla: 1,
            claws: 0.38,
            venom: 0.1,
            cold: 0.5,
            shock: 1.1,
            fire: 0.5,
            acid: 0.75,
            stone: 0.5,
            iron: 0.5,
            flesh: 0.15,
            ice: 0.3,
            magma: 0.9,
            axe: 0.6,
            hammer: 0.4
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
            tesla: 0.38,
            claws: 0.25,
            venom: 0.25,
            cold: 0.65,
            shock: 0.28,
            fire: 1,
            acid: 0.45,
            stone: 0.6,
            iron: 0.5,
            flesh: 0.5,
            ice: 0.55,
            magma: 1,
            axe: 0.25,
            hammer: 0.15
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
            tesla: 0.6,
            claws: 1,
            venom: 0.5,
            cold: 0.5,
            shock: 0.75,
            fire: 0.5,
            acid: 0.5,
            stone: 0.7,
            iron: 0.8,
            flesh: 0.9,
            ice: 0.4,
            magma: 0.5,
            axe: 1,
            hammer: 0.75
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
            tesla: 0.35,
            claws: 0.6,
            venom: 1.1,
            cold: 0.5,
            shock: 0.3,
            fire: 0.5,
            acid: 1,
            stone: 0.6,
            iron: 0.9,
            flesh: 0.3,
            ice: 0.4,
            magma: 0.55,
            axe: 0.75,
            hammer: 0.6
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
            tesla: 0.15,
            claws: 0,
            venom: 0.15,
            cold: 1.5,
            shock: 0.2,
            fire: 0.6,
            acid: 0.5,
            stone: 0,
            iron: 0,
            flesh: 0,
            ice: 1.25,
            magma: 0.7,
            axe: 0,
            hammer: 0
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
            tesla: 0.05,
            claws: 0.85,
            venom: 0,
            cold: 0.2,
            shock: 0.35,
            fire: 0.95,
            acid: 0.5,
            stone: 0.5,
            iron: 0.5,
            flesh: 0.35,
            ice: 0.25,
            magma: 0.9,
            axe: 1,
            hammer: 0.5
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
            tesla: 0.66,
            claws: 0.85,
            venom: 0.5,
            cold: 0.5,
            shock: 0.88,
            fire: 0.6,
            acid: 0.6,
            stone: 1,
            iron: 0.85,
            flesh: 0.45,
            ice: 0.5,
            magma: 0.65,
            axe: 0.9,
            hammer: 0.6
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
            tesla: 0.5,
            claws: 0.35,
            venom: 0.15,
            cold: 0,
            shock: 0.6,
            fire: 1.2,
            acid: 0.5,
            stone: 0.35,
            iron: 1,
            flesh: 0.3,
            ice: 0,
            magma: 1.1,
            axe: 0.5,
            hammer: 1
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
            tesla: 0.45,
            claws: 0.05,
            venom: 0.01,
            cold: 0.8,
            shock: 0.75,
            fire: 0.8,
            acid: 0.75,
            stone: 0.03,
            iron: 0.03,
            flesh: 0.03,
            ice: 0.3,
            magma: 0.5,
            axe: 0.01,
            hammer: 0.05
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
            tesla: 0.15,
            claws: 0.38,
            venom: 0.88,
            cold: 0.8,
            shock: 0.35,
            fire: 0,
            acid: 0.85,
            stone: 0.03,
            iron: 0.03,
            flesh: 0.03,
            ice: 0.3,
            magma: 0,
            axe: 0.4,
            hammer: 0.55
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
            tesla: 1,
            claws: 0.28,
            venom: 0,
            cold: 0.35,
            shock: 1,
            fire: 0.15,
            acid: 0.72,
            stone: 0.5,
            iron: 0.5,
            flesh: 0.5,
            ice: 0.2,
            magma: 0.15,
            axe: 0.25,
            hammer: 0.8
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
            tesla: 1,
            claws: 0.28,
            venom: 0,
            cold: 0.45,
            shock: 1.1,
            fire: 0.22,
            acid: 0.68,
            stone: 0.55,
            iron: 0.55,
            flesh: 0.4,
            ice: 0.4,
            magma: 0.18,
            axe: 0.42,
            hammer: 0.95
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
            tesla: 0.3,
            claws: 0.48,
            venom: 0.9,
            cold: 0.88,
            shock: 0.24,
            fire: 0.18,
            acid: 0.9,
            stone: 0.72,
            iron: 0.45,
            flesh: 0.85,
            ice: 0.92,
            magma: 0.16,
            axe: 0.44,
            hammer: 0.08
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
            tesla: 0.01,
            claws: 0.18,
            venom: 0.65,
            cold: 1,
            shock: 0.02,
            fire: 0.38,
            acid: 0.48,
            stone: 0.22,
            iron: 0.24,
            flesh: 0.35,
            ice: 1,
            magma: 0.4,
            axe: 0.15,
            hammer: 0.05
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
            tesla: 0.65,
            claws: 0.3,
            venom: 0.65,
            cold: 0.55,
            shock: 0.65,
            fire: 0.75,
            acid: 0.85,
            stone: 0.25,
            iron: 0.15,
            flesh: 0.2,
            ice: 0.55,
            magma: 0.75,
            axe: 0.45,
            hammer: 0.65
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
            tesla: 0.5,
            claws: 0.48,
            venom: 0.22,
            cold: 0.25,
            shock: 0.65,
            fire: 0.15,
            acid: 0.95,
            stone: 0.55,
            iron: 0.95,
            flesh: 0.25,
            ice: 0.35,
            magma: 0.2,
            axe: 0.55,
            hammer: 0.35
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
            tesla: 0.5,
            claws: 0.4,
            venom: 0.01,
            cold: 0.1,
            shock: 0.5,
            fire: 0.1,
            acid: 0.1,
            stone: 0.35,
            iron: 0.25,
            flesh: 0.95,
            ice: 0.1,
            magma: 0.1,
            axe: 0.4,
            hammer: 1
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
            tesla: 0.68,
            claws: 0.65,
            venom: 0.95,
            cold: 0.5,
            shock: 0.5,
            fire: 0.75,
            acid: 0.65,
            stone: 0.5,
            iron: 0.5,
            flesh: 0.5,
            ice: 0.5,
            magma: 0.75,
            axe: 0.65,
            hammer: 0.5
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
            tesla: 0.25,
            claws: 1,
            venom: 0.15,
            cold: 0.5,
            shock: 0.25,
            fire: 0.5,
            acid: 0.5,
            stone: 0.5,
            iron: 0.8,
            flesh: 0.5,
            ice: 0.5,
            magma: 0.5,
            axe: 1,
            hammer: 0.5
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
            tesla: 0.75,
            claws: 1,
            venom: 0.5,
            cold: 1,
            shock: 0.75,
            fire: 0.05,
            acid: 0.08,
            stone: 0.6,
            iron: 0.5,
            flesh: 0.25,
            ice: 0.95,
            magma: 0.05,
            axe: 0.75,
            hammer: 0.5
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
            tesla: 0.4,
            claws: 0.18,
            venom: 0.12,
            cold: 0.9,
            shock: 0.45,
            fire: 0.3,
            acid: 0.1,
            stone: 0.2,
            iron: 0.95,
            flesh: 0.2,
            ice: 0.9,
            magma: 0.3,
            axe: 0.12,
            hammer: 0
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
            tesla: 0.5,
            claws: 0.5,
            venom: 0.02,
            cold: 0.75,
            shock: 0.5,
            fire: 0.5,
            acid: 0.5,
            stone: 0.5,
            iron: 0.5,
            flesh: 0.5,
            ice: 0.75,
            magma: 0.5,
            axe: 0.5,
            hammer: 0.5
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
            tesla: 0.01,
            claws: 0.65,
            venom: 0.01,
            cold: 0,
            shock: 0.01,
            fire: 0.88,
            acid: 0.95,
            stone: 0.6,
            iron: 0.45,
            flesh: 0.55,
            ice: 0,
            magma: 0.88,
            axe: 0.7,
            hammer: 0.4
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
            tesla: 0.18,
            claws: 0.12,
            venom: 0.05,
            cold: 0.5,
            shock: 0.32,
            fire: 1,
            acid: 0.65,
            stone: 0.8,
            iron: 0.5,
            flesh: 0.5,
            ice: 0.5,
            magma: 1,
            axe: 0.18,
            hammer: 0.75
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
            tesla: 0.6,
            claws: 0.5,
            venom: 0.5,
            cold: 0.8,
            shock: 0.75,
            fire: 0.15,
            acid: 0.95,
            stone: 0.25,
            iron: 0.5,
            flesh: 0.8,
            ice: 0.8,
            magma: 0.15,
            axe: 0.5,
            hammer: 0.25
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
            tesla: 0.5,
            claws: 0.65,
            venom: 0.1,
            cold: 0.65,
            shock: 0.5,
            fire: 0.2,
            acid: 0.5,
            stone: 0.25,
            iron: 0.75,
            flesh: 1,
            ice: 0.65,
            magma: 0.2,
            axe: 0.75,
            hammer: 0.25
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
            tesla: 0.58,
            claws: 0.1,
            venom: 0.1,
            cold: 0.8,
            shock: 0.65,
            fire: 0.15,
            acid: 0.5,
            stone: 0.1,
            iron: 0.1,
            flesh: 0.5,
            ice: 0.8,
            magma: 0.2,
            axe: 0.1,
            hammer: 0.1
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
            tesla: 0.26,
            claws: 0.42,
            venom: 0.3,
            cold: 0.48,
            shock: 0.28,
            fire: 0.1,
            acid: 0.85,
            stone: 1,
            iron: 0.25,
            flesh: 0.75,
            ice: 0.52,
            magma: 0.12,
            axe: 0.34,
            hammer: 1
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
            tesla: 0.09,
            claws: 0.5,
            venom: 0.95,
            cold: 0.3,
            shock: 0.8,
            fire: 0.38,
            acid: 0.9,
            stone: 0.6,
            iron: 0.75,
            flesh: 0.4,
            ice: 0.28,
            magma: 0.32,
            axe: 0.45,
            hammer: 0.25
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
            tesla: 1,
            claws: 0.02,
            venom: 0.01,
            cold: 0,
            shock: 1,
            fire: 0.25,
            acid: 0.55,
            stone: 0.15,
            iron: 0.15,
            flesh: 0.95,
            ice: 0,
            magma: 0.25,
            axe: 0.01,
            hammer: 0.05
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
            tesla: 0.01,
            claws: 0.1,
            venom: 0,
            cold: 0.5,
            shock: 0.01,
            fire: 0.02,
            acid: 1,
            stone: 0.25,
            iron: 0.75,
            flesh: 0.1,
            ice: 0.5,
            magma: 0.03,
            axe: 0.1,
            hammer: 0.5
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
            tesla: 0.2,
            claws: 0.45,
            venom: 0.05,
            cold: 0.15,
            shock: 0.08,
            fire: 0.38,
            acid: 0.85,
            stone: 1,
            iron: 0.85,
            flesh: 0.25,
            ice: 0.15,
            magma: 0.35,
            axe: 0.42,
            hammer: 1
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
            tesla: 0.8,
            claws: 0.92,
            venom: 0.5,
            cold: 0.45,
            shock: 0.8,
            fire: 0.56,
            acid: 0.4,
            stone: 0.5,
            iron: 0.5,
            flesh: 0.5,
            ice: 0.48,
            magma: 0.54,
            axe: 0.88,
            hammer: 0.42
        },
        nozone: {},
        amp: {}
    },
    gorgon: {
        weapon: {
            laser: 0.65,
            flame: 0.65,
            plasma: 0.64,
            kinetic: 0.65,
            missile: 0.66,
            sonic: 0.65,
            shotgun: 0.65,
            tesla: 0.65,
            claws: 0.65,
            venom: 0.65,
            cold: 0.65,
            shock: 0.65,
            fire: 0.65,
            acid: 0.65,
            stone: 0.65,
            iron: 0.65,
            flesh: 0.65,
            ice: 0.65,
            magma: 0.65,
            axe: 0.65,
            hammer: 0.65
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
            tesla: 0.85,
            claws: 0.32,
            venom: 0.8,
            cold: 0.66,
            shock: 0.82,
            fire: 0.33,
            acid: 0.75,
            stone: 0.45,
            iron: 0.35,
            flesh: 0.4,
            ice: 0.66,
            magma: 0.33,
            axe: 0.36,
            hammer: 0.5
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
            tesla: 0.2,
            claws: 0.85,
            venom: 0.4,
            cold: 0.12,
            shock: 0.22,
            fire: 1,
            acid: 0.13,
            stone: 0.65,
            iron: 0.68,
            flesh: 0.95,
            ice: 0.18,
            magma: 0.9,
            axe: 0.85,
            hammer: 0.65
        },
        nozone: {},
        amp: {}
    },
    giant_chicken: {
        weapon: {
            laser: 0.95,
            flame: 0.95,
            plasma: 0.95,
            kinetic: 0.95,
            missile: 0.95,
            sonic: 0.95,
            shotgun: 0.95,
            tesla: 0.95,
            claws: 0.95,
            venom: 0.96,
            cold: 0.95,
            shock: 0.95,
            fire: 0.95,
            acid: 0.95,
            stone: 0.95,
            iron: 0.95,
            flesh: 0.94,
            ice: 0.95,
            magma: 0.95,
            axe: 0.95,
            hammer: 0.95
        },
        nozone: {},
        amp: {}
    },
    skeleton_pack: {
        weapon: {
            laser: 0.5,
            flame: 0.1,
            plasma: 0.5,
            kinetic: 1,
            missile: 1.2,
            sonic: 0.5,
            shotgun: 1.05,
            tesla: 0.2,
            claws: 0.65,
            venom: 0,
            cold: 0.11,
            shock: 0.22,
            fire: 0.1,
            acid: 0.5,
            stone: 1,
            iron: 0.65,
            flesh: 0.25,
            ice: 0.1,
            magma: 0.12,
            axe: 0.15,
            hammer: 1.08
        },
        nozone: {},
        amp: {}
    }
};

export function mechCost(size,infernal,standardize){
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
        case 'minion':
            {
                let baseCost = global.blood['prepared'] && global.blood.prepared >= 2 ? 30000 : 50000;
                cost = infernal ? baseCost * 2.5 : baseCost;
                soul = infernal ? 10 : 1;
            }
            break;
        case 'fiend':
            {
                cost = infernal ? 300000 : 125000;
                soul = infernal ? 40 : 4;
            }
            break;
        case 'cyberdemon':
            {
                cost = infernal ? 625000 : 250000;
                soul = infernal ? 120 : 12;
            }
            break;
        case 'archfiend':
            {
                cost = infernal ? 1200000 : 600000;
                soul = infernal ? 250 : 25;
            }
            break;
    }
    if (standardize){
        return {
            Soul_Gem(){ return soul; },
            Supply(){ return cost; }
        };
    }
    return { s: soul, c: cost };
}

function bossResists(boss){
    let weak = `laser`;
    let resist = `laser`;
    
    let standardList = ['laser','flame','plasma','kinetic','missile','sonic','shotgun','tesla'];
    Object.keys(monsters[boss].weapon).forEach(function(weapon){
        if (global.race['warlord'] || standardList.includes(weapon)){
            if (checkBossResist(boss,weapon) > checkBossResist(boss,weak)){
                weak = weapon;
            }
            if (checkBossResist(boss,weapon) < checkBossResist(boss,resist)){
                resist = weapon;
            }
        }
    });
    if (weak === resist){
        weak = 'none';
        resist = 'none';
    }
    return { w: weak, r: resist };
}

function checkBossResist(boss,weapon){
    let effectiveness = monsters[boss].weapon[weapon];
    
    let seed = global.stats.reset + (global.portal?.spire?.count || 1);
    let seed_r1 = Math.floor(seededRandom(0,25000,false,seed + (global.portal?.spire?.count || 1) * 2));
    let seed_w1 = Math.floor(seededRandom(0,25000,false,seed + global.stats.reset * 2));
    
    let weaponList = global.race['warlord'] 
        ? ['laser','kinetic','shotgun','missile','flame','plasma','sonic','tesla','claws','venom','cold','shock','fire','acid','stone','iron','flesh','ice','magma','axe','hammer']
        : ['laser','kinetic','shotgun','missile','flame','plasma','sonic','tesla'];

    let resist = weaponList[Math.floor(seededRandom(0,weaponList.length,false,seed_r1))];
    let weak = weaponList[Math.floor(seededRandom(0,weaponList.length,false,seed_w1))];

    if (weapon === resist){
        let seed_r2 = Math.floor(seededRandom(0,25000,false,seed_r1 + (global.portal?.spire?.count || 1) * 3));
        effectiveness -= Math.floor(seededRandom(0,26,false,seed_r2)) / 100;
        if (effectiveness < 0){ effectiveness = 0; }
    }
    else if (weapon === weak){
        let seed_w2 = Math.floor(seededRandom(0,25000,false,seed_w1 + global.stats.reset * 3));
        effectiveness += Math.floor(seededRandom(0,26,false,seed_w2)) / 100;
    }
    return effectiveness;
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

        let title = $(`<div><span class="has-text-caution">${loc(global.race['warlord'] ? `portal_mech_spawn` : `portal_mech_assembly`)}</span> - <span>{{ b.size | slabel }} {{ b.chassis | clabel }}</span></div>`);
        assemble.append(title);

        title.append(` | <span><span class="has-text-warning">${loc(global.race['warlord'] ? `portal_mech_lair_space` : 'portal_mech_bay_space')}</span>: {{ m.bay }} / {{ m.max }}</span>`);
        title.append(` | <span><span class="has-text-warning">${loc('portal_mech_sup_avail')}</span>: {{ p.supply | round }} / {{ p.sup_max }}</span>`);

        let infernal = global.blood['prepared'] && global.blood.prepared >= 3 ? `<b-checkbox class="patrol" v-model="b.infernal">${loc('portal_mech_infernal')} (${loc('portal_mech_infernal_effect',[25])})</b-checkbox>` : ``;
        assemble.append(`<div><span class="has-text-warning">${loc(global.race['warlord'] ? `portal_mech_lair` : `portal_mech_space`)}</span> <span class="has-text-danger">{{ b.size | bay }}</span> | <span class="has-text-warning">${loc(`portal_mech_cost`)}</span> <span class="has-text-danger">{{ b.size | price }}</span> | <span class="has-text-warning">${loc(`portal_mech_soul`,[global.resource.Soul_Gem.name])}</span> <span class="has-text-danger">{{ b.size | soul }}</span>${infernal}</div>`)
        assemble.append(`<div>{{ b.size | desc }}</div>`);

        let options = $(`<div class="bayOptions"></div>`);
        assemble.append(options);

        let sizes = ``;
        let sizeTypes = global.race['warlord'] ? ['minion','fiend','cyberdemon','archfiend'] : ['small','medium','large','titan','collector'];
        sizeTypes.forEach(function(size,idx){
            sizes += `<b-dropdown-item aria-role="listitem" v-on:click="setSize('${size}')" class="size r0 a${idx}" data-val="${size}">${loc(`portal_mech_size_${size}`)}</b-dropdown-item>`;
        });

        options.append(`<b-dropdown :triggers="['hover', 'click']" aria-role="list">
            <button class="button is-info" slot="trigger">
                <span>${loc(`portal_mech_size`)}: {{ b.size | slabel }}</span>
                <b-icon icon="menu-down"></b-icon>
            </button>${sizes}
        </b-dropdown>`);

        let chassis = ``;
        let typeList = ['wheel','tread','biped','quad','spider','hover'];
        if (global.race['warlord']){
            switch (global.portal.mechbay.blueprint.size){
                case 'minion':
                    typeList = ['imp','flying_imp','hound','harpy','barghest'];
                    break;
                case 'fiend':
                    typeList = ['cambion','minotaur','nightmare','rakshasa','golem'];
                    break;
                case 'cyberdemon':
                    typeList = ['wheel','tread','biped','quad','spider','hover'];
                    break;
                case 'archfiend':
                    typeList = ['dragon','snake','gorgon','hydra'];
                    break;
            }
        }
        typeList.forEach(function(val,idx){
            chassis += `<b-dropdown-item aria-role="listitem" v-on:click="setType('${val}')" class="chassis r0 a${idx}" data-val="${val}">${loc(`portal_mech_chassis_${val}`)}</b-dropdown-item>`;
        });

        options.append(`<b-dropdown :triggers="['hover', 'click']" aria-role="list">
            <button class="button is-info" slot="trigger">
                <span>${loc(`portal_mech_type`)}: {{ b.chassis | clabel }}</span>
                <b-icon icon="menu-down"></b-icon>
            </button>${chassis}
        </b-dropdown>`);

        for (let i=0; i<4; i++){
            let weapons = ``;
            let weaponList = validWeapons(global.portal.mechbay.blueprint.size,global.portal.mechbay.blueprint.chassis,i);
            weaponList.forEach(function(val,idx){
                weapons += `<b-dropdown-item aria-role="listitem" v-on:click="setWep('${val}',${i})" class="weapon r${i} a${idx}" data-val="${val}">${loc(`portal_mech_weapon_${val}`)}</b-dropdown-item>`;
            });

            options.append(`<b-dropdown :triggers="['hover', 'click']" aria-role="list" v-show="vis(${i})">
                <button class="button is-info" slot="trigger">
                    <span>${loc(`portal_mech_weapon`)}: {{ b.hardpoint[${i}] || 'laser' | wlabel }}</span>
                    <b-icon icon="menu-down"></b-icon>
                </button>${weapons}
            </b-dropdown>`);
        }

        let e_cap = global.blood['prepared'] ? 5 : 4;
        for (let i=0; i<e_cap; i++){
            let equip = ``;
            let equipTypes = validEquipment(global.portal.mechbay.blueprint.size,global.portal.mechbay.blueprint.chassis,i);
            equipTypes.forEach(function(val,idx){
                equip += `<b-dropdown-item aria-role="listitem" v-on:click="setEquip('${val}',${i})" class="equip r${i} a${idx}" data-val="${val}">{{ '${val}' | equipment }}</b-dropdown-item>`;
            });

            options.append(`<b-dropdown :triggers="['hover', 'click']" aria-role="list" v-show="eVis(${i})">
                <button class="button is-info" slot="trigger">
                    <span>${loc(global.race['warlord'] ? `portal_mech_attribute` : `portal_mech_equipment`)}: {{ b.equip[${i}] || 'shields' | equipment }}</span>
                    <b-icon icon="menu-down"></b-icon>
                </button>${equip}
            </b-dropdown>`);
        }

        assemble.append(`<div class="mechAssemble"><button class="button is-info" slot="trigger" v-on:click="build()"><span>${global.race['warlord'] ? loc('portal_mech_summon') : loc('portal_mech_construct')}</span></button></div>`);

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
                    if (!(global.settings.qKey && keyMap.q) && global.portal.purifier.supply >= cost && avail >= size && global.resource.Soul_Gem.amount >= soul){
                        global.portal.purifier.supply -= cost;
                        global.resource.Soul_Gem.amount -= soul;
                        buildMech(global.portal.mechbay.blueprint);
                    }
                    else {
                        let used = 0;
                        for (let j=0; j<global.queue.queue.length; j++){
                            used += Math.ceil(global.queue.queue[j].q / global.queue.queue[j].qs);
                        }
                        if (used < global.queue.max){
                            let blueprint = deepClone(global.portal.mechbay.blueprint);
                            global.queue.queue.push({ 
                                id: `hell-mech-${Math.rand(0,100000)}`, 
                                action: 'hell-mech', 
                                type: blueprint,
                                label: `${loc(`portal_mech_size_${blueprint.size}`)} ${loc(`portal_mech_chassis_${blueprint.chassis}`)}`, 
                                cna: false, 
                                time: 0, 
                                q: 1, 
                                qs: 1, 
                                t_max: 0, 
                                bres: false 
                            });
                            buildQueue();
                        }
                    }
                },
                setSize(s){
                    global.portal.mechbay.blueprint.size = s;
                    if (s === 'collector'){
                        global.portal.mechbay.blueprint.hardpoint.length = 0;
                    }
                    else if (s === 'small' || s === 'medium' || s === 'minion' || s === 'fiend'){
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
                        if (s === 'titan' || s === 'archfiend'){
                            if (global.portal.mechbay.blueprint.hardpoint.length === 2){
                                global.portal.mechbay.blueprint.hardpoint.push(global.portal.mechbay.blueprint.hardpoint.includes('laser')  ? 'shotgun' : 'laser');
                                global.portal.mechbay.blueprint.hardpoint.push(global.portal.mechbay.blueprint.hardpoint.includes('laser')  ? 'kinetic' : 'laser');
                            }
                        }
                        else {
                            global.portal.mechbay.blueprint.hardpoint.length = 2;
                        }
                    }
                    if (global.race['warlord']){ 
                        global.portal.mechbay.blueprint.equip[0] = validEquipment(s,global.portal.mechbay.blueprint.chassis)[0]; 
                        global.portal.mechbay.blueprint.equip.length = 1;
                    }
                    switch (s){
                        case 'small':
                        case 'minion':
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[0]);
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 1 : 0;
                            break;
                        case 'medium':
                        case 'fiend':
                            if (global.portal.mechbay.blueprint.equip.length < 1){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[0]);
                            }
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[1]);
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 2 : 1;
                            break;
                        case 'collector':
                        case 'large':
                        case 'cyberdemon':
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
                        case 'archfiend':
                            if (global.portal.mechbay.blueprint.equip.length < 1){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[0]);
                            }
                            if (global.portal.mechbay.blueprint.equip.length < 2){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[1]);
                            }
                            if (global.portal.mechbay.blueprint.equip.length < 3){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[2]);
                            }
                            if (global.portal.mechbay.blueprint.equip.length < 4){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[3]);
                            }
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[4]);
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 5 : 4;
                            break;
                    }
                    if (global.race['warlord']){
                        switch (s){
                            case 'minion':
                                global.portal.mechbay.blueprint.chassis = 'imp';
                                break;
                            case 'fiend':
                                global.portal.mechbay.blueprint.chassis = 'cambion';
                                break;
                            case 'cyberdemon':
                                global.portal.mechbay.blueprint.chassis = 'biped';
                                global.portal.mechbay.blueprint.hardpoint[1] = validWeapons(s,global.portal.mechbay.blueprint.chassis,1)[1];
                                break;
                            case 'archfiend':
                                global.portal.mechbay.blueprint.chassis = 'dragon';
                                global.portal.mechbay.blueprint.hardpoint[1] = validWeapons(s,global.portal.mechbay.blueprint.chassis,1)[0];
                                break;
                        }
                        global.portal.mechbay.blueprint.hardpoint[0] = validWeapons(s,global.portal.mechbay.blueprint.chassis,0)[0];
                        drawMechLab();
                        clearPopper();
                    }
                },
                setType(c){
                    global.portal.mechbay.blueprint.chassis = c;
                    if (global.race['warlord']){
                        global.portal.mechbay.blueprint.hardpoint[0] = validWeapons(global.portal.mechbay.blueprint.size,c,0)[0];
                        if (c === 'hydra'){
                            global.portal.mechbay.blueprint.hardpoint[1] = validWeapons(global.portal.mechbay.blueprint.size,c,1)[0];
                            global.portal.mechbay.blueprint.hardpoint[2] = validWeapons(global.portal.mechbay.blueprint.size,c,2)[0];
                            global.portal.mechbay.blueprint.hardpoint[3] = validWeapons(global.portal.mechbay.blueprint.size,c,3)[0];
                        }
                        drawMechLab();
                        clearPopper();
                    }
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
                    if (hp === 0 || (['large','cyberdemon'].includes(global.portal.mechbay.blueprint.size) && hp < 2) || global.portal.mechbay.blueprint.size === 'titan'){
                        return true;
                    }
                    else if (global.portal.mechbay.blueprint.size === 'archfiend'){
                        switch (global.portal.mechbay.blueprint.chassis){
                            case 'dragon':
                            case 'snake':
                            case 'gorgon':
                                return hp < 2 ? true : false;
                            case 'hydra':
                                return hp < 4 ? true : false;
                        }
                    }
                    return false;
                },
                eVis(es){
                    let prep = global.blood['prepared'] ? 1 : 0;
                    switch (global.portal.mechbay.blueprint.size){
                        case 'small':
                        case 'minion':
                            return prep === 1 && es === 0 ? true : false;
                        case 'medium':
                        case 'fiend':
                            return es <= (0 + prep) ? true : false;
                        case 'collector':
                        case 'large':
                        case 'cyberdemon':
                            return es <= (1 + prep) ? true : false;
                        case 'titan':
                        case 'archfiend':
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
                        case 'cyberdemon':
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
                                case 'cyberdemon':
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

export function buildMechQueue(action){
    let size = mechSize(action.bp.size);
    let avail = global.portal.mechbay.max - global.portal.mechbay.bay;
    if (avail >= size && payCosts(false, action.cost)){
        buildMech(deepClone(action.bp,true));
        return true;
    }
    return false;
}

function buildMech(bp, queue){
    let mech = deepClone(bp);
    global.portal.mechbay.mechs.push(mech);
    global.portal.mechbay.bay += mechSize(mech.size);
    global.portal.mechbay.active++;
}

export function mechDesc(parent,obj){
    let mech = obj.type;
    let costs = mechCost(mech.size,mech.infernal,true);

    console.log(mech);

    var desc = $(`<div class="shipPopper"></div>`);
    var mechPattern = $(`<div class="divider">${mech.infernal ? `${loc('portal_mech_infernal')} ` : ''}${loc(`portal_mech_size_${mech.size}`)} ${loc(`portal_mech_chassis_${mech.chassis}`)}</div>`);
    parent.append(desc);
    desc.append(mechPattern);

    var cost = $('<div class="costList"></div>');
    desc.append(cost);

    let weapons = [];
    mech.hardpoint.forEach(function(hp){
        weapons.push(`<span class="has-text-danger">${loc(`portal_mech_weapon_${hp}`)}</span>`);
    });
    desc.append(`<div>${weapons.join(', ')}</div>`);

    let equip = [];
    mech.equip.forEach(function(eq){
        equip.push(`<span class="has-text-warning">${loc(`portal_mech_equip_${eq}`)}</span>`);
    });
    desc.append(`<div>${equip.join(', ')}</div>`);

    let tc = timeCheck({ id: `${mech.size}${Math.rand(0,100)}` , cost: costs, doNotAdjustCost: true }, false, true);
    Object.keys(costs).forEach(function (res){
        if (costs[res]() > 0){
            let label = res === 'Money' ? '$' : (res === 'Supply' ? loc('resource_Supply_name') : global.resource[res].name) + ': ';
            let amount = res === 'Supply' ? global.portal.purifier.supply : global.resource[res].amount;
            let color = amount >= costs[res]() ? 'has-text-dark' : ( res === tc.r ? 'has-text-danger' : 'has-text-alert');
            cost.append($(`<div class="${color}" data-${res}="${costs[res]()}">${label}${sizeApproximation(costs[res](),2)}</div>`));
        }
    });

    if (tc && tc['t']){
        desc.append($(`<div class="divider"></div><div id="popTimer" class="flair has-text-advanced">{{ t | timer }}</div>`));
        vBind({
            el: '#popTimer',
            data: tc,
            filters: {
                timer(t){
                    return loc('action_ready',[timeFormat(t)]);
                }
            }
        });
    }
    
    return desc;
}

export function validWeapons(size,type,point){
    let weaponList = ['laser','kinetic','shotgun','missile','flame','plasma','sonic','tesla'];
    if (global.race['warlord']){
        switch (size){
            case 'minion':
                if (type === 'harpy'){
                    weaponList = ['claws','venom'];
                }
                else if (type === 'hound'){
                    weaponList = ['cold','shock','fire','acid'];
                }
                else if (type === 'barghest'){
                    weaponList = ['claws','venom'];
                }
                break;
            case 'fiend':
                if (type === 'minotaur'){
                    weaponList = ['axe','hammer'];
                }
                else if (type === 'nightmare'){
                    weaponList = ['cold','shock','fire','acid'];
                }
                else if (type === 'golem'){
                    weaponList = ['stone','iron','flesh','ice','magma'];
                }
                break;
            case 'archfiend':
                if (point === undefined || point === false){
                    weaponList = ['claws','venom','cold','shock','fire','acid'];
                    switch (type){
                        case 'dragon':
                            weaponList = ['claws','cold','shock','fire','acid'];
                            break;
                        case 'snake':
                            weaponList = ['venom','cold','shock','fire','acid'];
                            break;
                        case 'gorgon':
                            weaponList = ['axe','hammer','cold','shock','fire','acid'];
                            break;
                        case 'hydra':
                            weaponList = ['cold','shock','fire','acid'];
                            break;
                    }
                }
                else {
                    switch (type){
                        case 'dragon':
                            weaponList = point === 0 ? ['claws'] : ['cold','shock','fire','acid'];
                            break;
                        case 'snake':
                            weaponList = point === 0 ? ['venom'] : ['cold','shock','fire','acid'];
                            break;
                        case 'gorgon':
                            weaponList = point === 0 ? ['axe','hammer'] : ['cold','shock','fire','acid'];
                            break;
                        case 'hydra':
                            let list = ['cold','shock','fire','acid'];
                            weaponList = [list[point]];
                            break;
                    }
                }
                break;
        }
    }
    return weaponList;
}

export function validEquipment(size,type,point){
    let equipList = ['special','shields','sonar','grapple','infrared','flare','radiator','coolant','ablative','stabilizer','seals'];
    if (global.race['warlord']){
        switch (size){
            case 'minion':
                equipList = ['scavenger','scouter','darkvision','echo','thermal','manashield','cold','heat','athletic','lucky','stoneskin'];
                break;
            case 'fiend':
            case 'archfiend':
                equipList = ['darkvision','echo','thermal','manashield','cold','heat','athletic','lucky','stoneskin'];
                break;
        }
    }
    return equipList;
}

function drawMechs(){
    clearMechDrag();
    clearElement($('#mechList'));
    let list = $('#mechList');

    list.append(`
      <div v-for="(mech, index) of mechs" :key="index" class="mechRow" :class="index < active ? '' : 'inactive-row' ">
        <a class="scrap" @click="scrap(index)">${loc(global.race['warlord'] ? 'portal_mech_unsummon' : 'portal_mech_scrap')}</a>
        <span> | </span><span>${loc(global.race['warlord'] ? 'portal_demon' : 'portal_mech')} #{{index + 1}}: </span>
        <span class="has-text-caution">{{ mech.infernal ? "${loc('portal_mech_infernal')} " : "" }}{{ mech | size }} {{ mech | chassis }}</span>
        <div :class="'gearList '+mech.size">
          <div>
            <template v-for="hp of mech.hardpoint">
              <span> | </span>
              <span class="has-text-danger">{{ hp | weapon }}</span>
            </template>
          </div>
        </div>
        <div :class="'gearList '+mech.size">
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
                    case 'cyberdemon':
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
        case 'minion':
            return 1;
        case 'small':
            return 2;
        case 'fiend':
            return global.blood['prepared'] && global.blood.prepared >= 2 ? 3 : 4;
        case 'medium':
            return global.blood['prepared'] && global.blood.prepared >= 2 ? 4 : 5;
        case 'cyberdemon':
            return global.blood['prepared'] && global.blood.prepared >= 2 ? 6 : 8;
        case 'large':
            return global.blood['prepared'] && global.blood.prepared >= 2 ? 8 : 10;
        case 'archfiend':
            return global.blood['prepared'] && global.blood.prepared >= 2 ? 15 : 20;
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
            if (mech.size === 'small' || mech.size === 'minion') {
                scouts++;
            }
            if (mech.equip.includes('scouter')){
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
    global.portal.spire.type = types[Math.floor(seededRandom(0,types.length))];
    if (global.portal.spire.count >= 10){
        global.portal.spire.status = {};
        let effects = ['freeze','hot','corrosive','humid','windy','hilly','mountain','radioactive','quake','dust','river','tar','steam','flooded','fog','rain','hail','chasm','dark','gravity'];
        assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
        
        if (global.portal.spire.count >= 25 && global.portal.spire.count <= 100){
            let odds = 105 - global.portal.spire.count;
            if (Math.floor(seededRandom(0,odds) <= 5)){
                assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            }
        }
        else if (global.portal.spire.count > 100 && global.portal.spire.count <= 250){
            assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            let odds = 260 - global.portal.spire.count;
            if (Math.floor(seededRandom(0,odds) <= 10)){
                assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            }
        }
        else if (global.portal.spire.count > 250 && global.portal.spire.count <= 1000){
            assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            let odds = 1025 - global.portal.spire.count;
            if (Math.floor(seededRandom(0,odds) <= 25)){
                assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            }
        }
        else if (global.portal.spire.count > 1000){
            assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
        }
    }

    let mobs = Object.keys(monsters).filter(function (k){
        let exclude = Object.keys(monsters[k].nozone);
        if (exclude.some(i => Object.keys(global.portal.spire.status).includes(i)) || exclude.includes(global.portal.spire.type)){
            return false;
        }
        return true;
    });
    global.portal.spire.boss = mobs[Math.floor(seededRandom(0,mobs.length))];
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
    if (mech.equip.includes('special') && (mech.size === 'large' || mech.size === 'cyberdemon')){
        power *= 1.02;
    }
    return power;
}

function statusEffect(mech,effect){
    let rating = 1;
    switch (effect){
        case 'freeze':
            {
                if (!mech.equip.includes('radiator') && !mech.equip.includes('cold')){
                    rating = 0.25;
                }
            }
            break;
        case 'hot':
            {
                if (!mech.equip.includes('coolant') && !mech.equip.includes('heat')){
                    rating = 0.25;
                }
            }
            break;
        case 'corrosive':
            {
                if (!mech.equip.includes('ablative')){
                    if (mech.equip.includes('stoneskin')){
                        rating = 0.9;
                    }
                    else if (mech.equip.includes('shields')){
                        rating = 0.75;
                    }
                    else {
                        rating = mech.equip.includes('manashield') ? 0.5 : 0.25;
                    }
                }
            }
            break;
        case 'humid':
            {
                if (!mech.equip.includes('seals')){
                    rating = mech.equip.includes('heat') ? 0.85 : 0.75;
                }
            }
            break;
        case 'windy':
            {
                if (['hover','flying_imp','harpy','dragon'].includes(mech.chassis)){
                    rating = 0.5;
                }
            }
            break;
        case 'hilly':
            {
                if (!['spider','flying_imp','harpy','dragon'].includes(mech.chassis)){
                    rating = 0.75;
                }
            }
            break;
        case 'mountain':
            {
                if (mech.chassis !== 'spider' && !mech.equip.includes('grapple')){
                    rating = mech.equip.includes('flare') || mech.equip.includes('echo') ? 0.75 : 0.5;
                }
            }
            break;
        case 'radioactive':
            {
                if (!mech.equip.includes('shields') && mech.equip.includes('manashield')){
                    rating = 0.5;
                }
            }
            break;
        case 'quake':
            {
                if (!mech.equip.includes('stabilizer')){
                    rating = mech.equip.includes('athletic') ? 0.75 : 0.25;
                }
            }
            break;
        case 'dust':
            {
                if (!mech.equip.includes('seals') && !mech.equip.includes('thermal')){
                    rating = 0.5;
                }
            }
            break;
        case 'river':
            {
                if (!['hover','flying_imp','harpy','dragon'].includes(mech.chassis)){
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
                if (!mech.equip.includes('shields') && !mech.equip.includes('heat')){
                    rating = 0.75;
                }
            }
            break;
        case 'flooded':
            {
                if (mech.chassis !== 'hover'){
                    rating = ['snake'].includes(mech.chassis) ? 0.85 : 0.35;
                }
            }
            break;
        case 'fog':
            {
                if (!mech.equip.includes('sonar') && !mech.equip.includes('echo')){
                    rating = 0.2;
                }
            }
            break;
        case 'rain':
            {
                if (!mech.equip.includes('seals')){
                    rating = mech.equip.includes('cold') ? 0.9 : 0.75;
                }
            }
            break;
        case 'hail':
            {
                if (!mech.equip.includes('ablative') && !mech.equip.includes('shields') && !mech.equip.includes('manashield') && !mech.equip.includes('stoneskin')){
                    rating = 0.75;
                }
            }
            break;
        case 'chasm':
            {
                if (!mech.equip.includes('grapple') && !['flying_imp','harpy','dragon'].includes(mech.chassis)){
                    rating = mech.equip.includes('athletic') ? 0.35 : 0.1;
                }
            }
            break;
        case 'dark':
            {
                if (!mech.equip.includes('infrared') && !mech.equip.includes('darkvision')){
                    rating = mech.equip.includes('flare') ? 0.25 : 0.1;
                }
            }
            break;
        case 'gravity':
            {
                switch (mech.size){
                    case 'fiend':
                    case 'medium':
                        rating = 0.8;
                        break;
                    case 'cyberdemon':
                        rating = 0.5;
                    case 'large':
                        rating = 0.45;
                        break;
                    case 'archfiend':
                        rating = 0.35;
                    case 'titan':
                        rating = 0.25;
                        break;
                }
                if (['flying_imp','harpy','dragon'].includes(mech.chassis)){
                    rating -= 0.15;
                }
                if (mech.equip.includes('athletic') && rating < 1){
                    rating += 0.1;
                }
            }
            break;
    }
    if (mech.equip.includes('lucky')){
        rating += 0.01 * Math.floor(seededRandom(1,10,false, global.stats.resets + (global.portal?.spire?.count || 1) * 42 ));
        if (rating > 1){ rating = 1; }
    }
    return rating;
}

export function terrainEffect(mech,type){
    let terrain = type || global.portal.spire.type;
    let terrainFactor = 1;
    switch (mech.chassis){
        case 'wheel':
        case 'nightmare':
        case 'hound':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.9 : 0.85;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.35 : 0.18;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.92 : 0.85;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.65 : 0.5;
                        break;
                    case 'gravel':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1 : 0.95;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.85 : 0.58;
                        break;
                    case 'grass':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.3 : 1.2;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.9 : 0.8;
                        break;
                    case 'concrete':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.1 : 1;
                        break;
                }
            }
            break;
        case 'tread':
        case 'rakshasa':
        case 'harpy':
        case 'dragon':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.15 : 1.1;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.55 : 0.4;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1 : 0.95;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.95 : 0.9;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.65 : 0.5;
                        break;
                    case 'gravel':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.3 : 1.2;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.88 : 0.72;
                        break;
                }
            }
            break;
        case 'cambion':
        case 'biped':
        case 'imp':
        case 'gorgon':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.78 : 0.65;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.68 : 0.5;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1 : 0.95;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.82 : 0.7;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.48 : 0.4;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.85 : 0.7;
                        break;
                    case 'grass':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.25 : 1.2;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.92 : 0.85;
                        break;
                }
            }
            break;
        case 'quad':
        case 'golem':
        case 'barghest':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.86 : 0.75;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.58 : 0.42;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.25 : 1.2;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.95 : 0.9;
                        break;
                    case 'gravel':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.9 : 0.8;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.68 : 0.5;
                        break;
                    case 'grass':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1 : 0.95;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.95 : 0.9;
                        break;
                }
            }
            break;
        case 'spider':
        case 'minotaur':
        case 'hydra':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.75 : 0.65;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.9 : 0.78;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.82 : 0.75;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.77 : 0.65;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.25 : 1.2;
                        break;
                    case 'gravel':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.86 : 0.75;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.92 : 0.82;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1 : 0.95;
                        break;
                }
            }
            break;
        case 'hover':
        case 'flying_imp':
        case 'snake':
            {
                switch (terrain){
                    case 'swamp':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.35 : 1.2;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.65 : 0.48;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.55 : 0.35;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.82 : 0.68;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.15 : 1.08;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.78 : 0.7;
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
    if (global.race['warlord']){
        rating *= 0.1;
    }
    return rating;
}

export function mechWeaponPower(size){
    switch (size){
        case 'minion':
            return 0.0015;
        case 'small':
            return 0.0025;
        case 'fiend':
            return 0.006;
        case 'medium':
            return 0.0075;
        case 'cyberdemon':
            return 0.009;
        case 'large':
            return 0.01;
        case 'archfiend':
            return 0.011;
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
    if (global.blood['wrath']){
        rating *= 1 + (global.blood.wrath / 20);
    }
    if (mech.size === 'archfiend' && mech.chassis != 'hydra'){
        rating *= 2;
    }

    if (boss){
        if (global.stats.achieve['gladiator'] && global.stats.achieve.gladiator.l > 0){
            rating *= 1 + global.stats.achieve.gladiator.l * 0.1;
        }
        if (mech.size === 'titan' || mech.size === 'archfiend'){
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
            damage += rating * weaponPower(mech,1);
        }
        return damage;
    }
    else {
        if (global.stats.achieve['gladiator'] && global.stats.achieve.gladiator.l > 0){
            rating *= 1 + global.stats.achieve.gladiator.l * 0.2;
        }

        if (global.portal.spire.type === 'concrete'){
            switch (mech.size){
                case 'minion':
                case 'small':
                    rating *= 0.92;
                    break;
                case 'fiend':
                case 'medium':
                    rating *= 0.95;
                    break;
                case 'archfiend':
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
            let effect = checkBossResist(global.portal.spire.boss,mech.hardpoint[i]);
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
            num = sizeApproximation(num, 5, global.portal.observe.settings.expanded);
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
            <div v-show="sg.display"><h2>{{ st.${type}.gems, 'gems', s.average | genericMulti }}</h2><h2 class="text-button has-text-advanced" aria-label="${loc('hell_analysis_toggle_bd',[global.resource.Soul_Gem.name])}" @click="toggleDropdown('dropGems')">{{ s.dropGems | dropdownLabel }}</h2></div>
            <div v-show="sg.display && s.dropGems">
                <div><h2>{{ st.${type}.gems.patrols, 'gems_patrols', s.average | genericSub }}</h2></div>
                <div v-show="p.gun_emplacement"><h2>{{ st.${type}.gems.guns, 'gems_guns', s.average | genericSub }}</h2></div>
                <div v-show="p.soul_forge"><h2>{{ st.${type}.gems.soul_forge, 'gems_soul_forge', s.average | genericSub }}</h2></div>
                <div v-show="p.soul_forge"><h2>{{ st.${type}.gems.crafted, 'gems_crafted', s.average | genericSub }}</h2></div>
                <div v-show="p.gate_turret"><h2>{{ st.${type}.gems.turrets, 'gems_turrets', s.average | genericSub }}</h2></div>
                <div v-show="p.war_drone && p.carport"><h2>{{ st.${type}.gems.surveyors, 'gems_surveyors', s.average | genericSub }}</h2></div>
                <div v-show="e.soul_compactor"><h2>{{ st.${type}.gems.compactor, 'gems_compactor', s.average | genericSub }}</h2></div>
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
                sg: global.resource.Soul_Gem,
                e: global.eden,
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
                        let val = sizeApproximation(num, 5, global.portal.observe.settings.expanded);
                        return loc('hell_analysis_number_display', [loc(`hell_analysis_${name}`), val]);
                    }
                    return loc('hell_analysis_number_display',[loc(`hell_analysis_${name}`),calcAverage(num,global.portal.observe.stats[type].days,global.portal.observe.settings.display)]);
                },
                genericSub(num, name, average){
                    if (!average){
                        let val = sizeApproximation(num, 5, global.portal.observe.settings.expanded);
                        return 'ᄂ' + loc('hell_analysis_number_display', [loc(`hell_analysis_${name}`), val]);
                    }
                    return 'ᄂ' + loc('hell_analysis_number_display',[loc(`hell_analysis_${name}`),calcAverage(num,global.portal.observe.stats[type].days,global.portal.observe.settings.display)]);
                },
                genericMulti(group, name, average){
                    let num = 0;
                    Object.keys(group).forEach(function(type){
                        num += group[type];
                    });
                    if (!average){
                        let val = sizeApproximation(num, 5, global.portal.observe.settings.expanded);
                        return loc('hell_analysis_number_display', [loc(`hell_analysis_${name}`), val]);
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
                    let formattedTime = sizeApproximation(days, global.portal.observe.settings.expanded ? 8 : 5, global.portal.observe.settings.expanded);
                    return loc('hell_analysis_time', [loc(`hell_analysis_time_${units}`), formattedTime]);
                },
                resetLabel(){
                    return loc('hell_analysis_period_reset');
                },
                startLabel(start){
                    return loc('hell_analysis_start',[start.year, start.day]);
                },
                dropdownLabel(open){
                    return open ? '▲' : '▼';
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
            for (startDay; startDay<=orbitLength(); startDay++){
                let gemString = ""; let gemCount = hell_reports[`year-${startYear}`][`day-${startDay}`].foundGems;
                if (gemCount) {
                    gemString = `<span class="has-text-advanced" aria-label="${loc(`hell_report_log_soul_gem_aria`)}">${gemCount >= 5 ? `&#9830x${gemCount}` : "&#9830".repeat(gemCount)}</span>`;
                }
                list = `
                    <div class="text-button"><span @click="reportLoad('${startYear}','${startDay}')">${loc('year') + " " + startYear + " | " + loc('day') + " " + startDay}${gemString}</span></div>
                ` + list;
            }
            startDay = 1;
        }
        //Remaining days in current year.
        for (startDay; startDay<global.city.calendar.day; startDay++){
            let gemString = ""; let gemCount = hell_reports[`year-${startYear}`][`day-${startDay}`].foundGems;
            if (gemCount) {
                gemString = `<span class="has-text-advanced" aria-label="${loc(`hell_report_log_soul_gem_aria`)}">${gemCount >= 5 ? `&#9830x${gemCount}` : "&#9830".repeat(gemCount)}</span>`;
            }
            list = `
                <div class="text-button"><span @click="reportLoad('${startYear}','${startDay}')">${loc('year') + " " + startYear + " | " + loc('day') + " " + startDay}${gemString}</span></div>
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

        if (curr_report.soul_attractors){
            info.append(`<p>${loc('hell_report_log_soul_attractors',[curr_report.soul_attractors])}</p>`);
        }
        if (curr_report.ghost_trappers){
            info.append(`<p>${loc('hell_report_log_ghost_trappers',[curr_report.ghost_trappers])}</p>`);
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

        if (curr_report.stats.gems.compactor){
            let displayText = $(`<p></p>`);
            if (curr_report.stats.gems.compactor){
                displayText.append(`<span class="has-text-success">${loc('hell_report_log_compactor',[curr_report.stats.gems.compactor, global.resource.Soul_Gem.name])}</span>`);
            }
            info.append(displayText);
        }

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
                let name = loc('hell_report_log_obj_counter',[jobName('hell_surveyor'),num]);

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
            lastReportDay = orbitLength();
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

        let approx = ((Object.keys(hell_reports).length - 1) * orbitLength()) + global.city.calendar.day;

        if (approx > threshold){
            let firstYear = Object.keys(hell_reports[Object.keys(hell_reports)[0]]).length;
            if (approx - orbitLength() + firstYear > threshold){
                removed = true;
                approx -= firstYear;
                delete hell_reports[Object.keys(hell_reports)[0]];
            }
            while (approx > threshold){
                approx -= orbitLength();
                delete hell_reports[Object.keys(hell_reports)[0]];
            }
        }
        return removed;
    }
}

export function checkWarlordAchieve(){
    if (global.race['warlord']){
        let tasks = 0;
        Object.keys(global.stats.warlord).forEach(function(k){
            if (global.stats.warlord[k]){
                tasks++;
            }
        });
        if (tasks > 0){
            unlockAchieve('what_is_best',false,tasks);
        }
    }
}

export function warlordSetup(){
    if (global.race['warlord'] && global.race.universe === 'evil'){
        global.tech['aerogel'] = 1;
        global.tech['agriculture'] = 7;
        global.tech['alloy'] = 1;
        global.tech['alumina'] = 2;
        global.tech['asteroid'] = 7;
        global.tech['banking'] = 11;
        global.tech['biotech'] = 1;
        global.tech['boot_camp'] = 2;
        global.tech['container'] = 8;
        global.tech['copper'] = 1;
        global.tech['currency'] = 6;
        global.tech['drone'] = 1;
        global.tech['elerium'] = 2;
        global.tech['explosives'] = 3;
        global.tech['factory'] = 3;
        global.tech['farm'] = 1;
        global.tech['foundry'] = 8;
        global.tech['gambling'] = 4;
        global.tech['gas_giant'] = 1;
        global.tech['gas_moon'] = 2;
        global.tech['genesis'] = 2;
        global.tech['genetics'] = 2;
        global.tech['gov_corp'] = 1;
        global.tech['gov_fed'] = 1;
        global.tech['gov_soc'] = 1;
        global.tech['gov_theo'] = 1;
        global.tech['govern'] = 3;
        global.tech['graphene'] = 1;
        global.tech['helium'] = 1;
        global.tech['hell'] = 1;
        global.tech['high_tech'] = 17;
        global.tech['hoe'] = 5;
        global.tech['home_safe'] = 2;
        global.tech['housing'] = 3;
        global.tech['housing_reduction'] = 3;
        global.tech['infernite'] = 6;
        global.tech['kuiper'] = 2;
        global.tech['launch_facility'] = 1;
        global.tech['luna'] = 2;
        global.tech['marines'] = 2;
        global.tech['mars'] = 5;
        global.tech['mass'] = 1;
        global.tech['medic'] = 3;
        global.tech['military'] = 10;
        global.tech['mine_conveyor'] = 1;
        global.tech['mining'] = 4;
        global.tech['monument'] = 1;
        global.tech['nano'] = 1;
        global.tech['oil'] = 7;
        global.tech['pickaxe'] = 5;
        global.tech['polymer'] = 2;
        global.tech['primitive'] = 3;
        global.tech['q_factory'] = 1;
        global.tech['quantium'] = 1;
        global.tech['queue'] = 3;
        global.tech['reclaimer'] = 8;
        global.tech['r_queue'] = 1;
        global.tech['reproduction'] = 1;
        global.tech['rival'] = 1;
        global.tech['satellite'] = 1;
        global.tech['science'] = 21;
        global.tech['shelving'] = 3;
        global.tech['shipyard'] = 1;
        global.tech['smelting'] = 6;
        global.tech['solar'] = 5;
        global.tech['space'] = 6;
        global.tech['space_explore'] = 4;
        global.tech['space_housing'] = 1;
        global.tech['spy'] = 5;
        global.tech['stanene'] = 1;
        global.tech['steel_container'] = 7;
        global.tech['storage'] = 5;
        global.tech['swarm'] = 6;
        global.tech['syndicate'] = 0;
        global.tech['synthetic_fur'] = 1;
        global.tech['theology'] = 2;
        global.tech['titanium'] = 3;
        global.tech['trade'] = 3;
        global.tech['unify'] = 2;
        global.tech['uranium'] = 4;
        global.tech['v_train'] = 1;
        global.tech['vault'] = 4;
        global.tech['wharf'] = 1;
        global.tech['world_control'] = 1;
        global.tech['wsc'] = 0;
        global.tech['portal'] = 3;
        global.tech['hell_pit'] = 1;
        global.tech['hellspawn'] = 1;

        if (!global.race['joyless']){
            global.tech['theatre'] = 3;
            global.tech['broadcast'] = 2;
        }

        if (!global.race['flier']){
            global.tech['cement'] = 6;
            global.resource.Cement.display = true;
        }

        global.settings.showSpace = false;
        global.settings.showPortal = true;

        global.settings.showCity = false;
        global.settings.showIndustry = true;
        global.settings.showPowerGrid = true;
        global.settings.showResearch = true;
        global.settings.showCivic = true;
        global.settings.showMil = true;
        global.settings.showResources = true;
        global.settings.showMarket = true;
        global.settings.showStorage = true;
        global.settings.civTabs = 1;
        global.settings.spaceTabs = 6;
        global.settings.showGenetics = true;
        global.settings.arpa.physics = true;
        global.settings.arpa.genetics = true

        //global.civic.garrison.display = true;
        global.resource[global.race.species].display = true;
        global.resource.Knowledge.display = true;
        global.resource.Money.display = true;
        global.resource.Crates.display = true;
        global.resource.Containers.display = true;

        global.resource.Food.display = true;
        global.resource.Stone.display = true;
        global.resource.Furs.display = true;
        global.resource.Copper.display = true;
        global.resource.Iron.display = true;
        global.resource.Aluminium.display = true;
        global.resource.Coal.display = true;
        global.resource.Oil.display = true;
        global.resource.Uranium.display = true;
        global.resource.Steel.display = true;
        global.resource.Titanium.display = true;
        global.resource.Alloy.display = true;
        global.resource.Polymer.display = true;
        global.resource.Iridium.display = true;
        global.resource.Helium_3.display = true;

        global.resource.Neutronium.display = true;
        global.resource.Adamantite.display = true;
        global.resource.Elerium.display = true;
        global.resource.Nano_Tube.display = true;
        global.resource.Graphene.display = true;
        global.resource.Stanene.display = true;
        global.resource.Orichalcum.display = true;
        global.resource.Bolognium.display = true;
        global.resource.Infernite.display = true;

        global.resource.Brick.display = true;
        global.resource.Wrought_Iron.display = true;
        global.resource.Sheet_Metal.display = true;
        global.resource.Mythril.display = true;
        global.resource.Aerogel.display = true;

        if (!global.race['kindling_kindred'] && !global.race['smoldering']){
            global.civic.lumberjack.display = true;
            global.resource.Lumber.display = true;
            global.resource.Plywood.display = true;
            global.resource.Lumber.max = 10000000;
            global.resource.Lumber.amount = 10000000;
            global.resource.Plywood.amount = 2500000;
            global.resource.Lumber.crates = 30;
            global.resource.Lumber.containers = 30;
            global.tech['axe'] = 5;
        }
        if (global.race['smoldering']){
            global.resource.Chrysotile.display = true;
            global.resource.Chrysotile.max = 5000000;
            global.resource.Chrysotile.amount = 5000000;
        }
        if (!global.race['sappy']){
            global.tech['hammer'] = 4;
        }
        if (!global.race['apex_predator']){
            global.tech['armor'] = 3;
        }

        global.resource.Crates.amount = 1000;
        global.resource.Containers.amount = 1000;
        global.resource.Money.max = 1000000000;
        global.resource.Money.amount = 1000000000;
        global.resource.Knowledge.max = 4321200;
        global.resource.Knowledge.amount = 4321200;
        global.resource.Food.max = 10000;
        global.resource.Food.amount = 10000;
        global.resource.Oil.max = 500000;
        global.resource.Oil.amount = 500000;
        global.resource.Helium_3.max = 500000;
        global.resource.Helium_3.amount = 500000;
        global.resource.Uranium.max = 500000;
        global.resource.Uranium.amount = 500000;
        global.resource.Stone.max = 10000000;
        global.resource.Stone.amount = 10000000;
        global.resource.Furs.max = 5000000;
        global.resource.Furs.amount = 5000000;
        global.resource.Copper.max = 5000000;
        global.resource.Copper.amount = 5000000;
        global.resource.Iron.max = 5000000;
        global.resource.Iron.amount = 5000000;
        global.resource.Steel.max = 5000000;
        global.resource.Steel.amount = 5000000;
        global.resource.Aluminium.max = 5000000;
        global.resource.Aluminium.amount = 5000000;
        global.resource.Cement.max = 5000000;
        global.resource.Cement.amount = 5000000;
        global.resource.Titanium.max = 5000000;
        global.resource.Titanium.amount = 5000000;
        global.resource.Coal.max = 5000000;
        global.resource.Coal.amount = 5000000;
        global.resource.Alloy.max = 5000000;
        global.resource.Alloy.amount = 5000000;
        global.resource.Polymer.max = 5000000;
        global.resource.Polymer.amount = 5000000;
        global.resource.Iridium.max = 5000000;
        global.resource.Iridium.amount = 5000000;
        global.resource.Neutronium.max = 500000;
        global.resource.Neutronium.amount = 500000;
        global.resource.Adamantite.max = 5000000;
        global.resource.Adamantite.amount = 5000000;
        global.resource.Elerium.max = 1000;
        global.resource.Elerium.amount = 1000;
        global.resource.Nano_Tube.max = 5000000;
        global.resource.Nano_Tube.amount = 5000000;
        global.resource.Graphene.max = 5000000;
        global.resource.Graphene.amount = 5000000;
        global.resource.Stanene.max = 5000000;
        global.resource.Stanene.amount = 5000000;
        global.resource.Bolognium.max = 5000000;
        global.resource.Bolognium.amount = 5000000;
        global.resource.Orichalcum.max = 5000000;
        global.resource.Orichalcum.amount = 5000000;
        global.resource.Brick.amount = 2500000;
        global.resource.Wrought_Iron.amount = 2500000;
        global.resource.Sheet_Metal.amount = 2500000;
        global.resource.Mythril.amount = 2500000;
        global.resource.Aerogel.amount = 2500000;
        global.resource.Authority.amount = 80;

        if (!global.race['artifical']){
            global.resource.Food.crates = 10;
            global.resource.Food.containers = 10;
        }

        global.resource.Stone.crates = 30;
        global.resource.Stone.containers = 30;
        global.resource.Furs.crates = 30;
        global.resource.Furs.containers = 30;
        global.resource.Coal.crates = 10;
        global.resource.Coal.containers = 10;
        global.resource.Copper.crates = 30;
        global.resource.Copper.containers = 30;
        global.resource.Iron.crates = 30;
        global.resource.Iron.containers = 30;
        global.resource.Aluminium.crates = 30;
        global.resource.Aluminium.containers = 30;
        global.resource.Steel.crates = 30;
        global.resource.Steel.containers = 30;
        global.resource.Titanium.crates = 30;
        global.resource.Titanium.containers = 30;
        global.resource.Alloy.crates = 30;
        global.resource.Alloy.containers = 30;
        global.resource.Polymer.crates = 30;
        global.resource.Polymer.containers = 30;
        global.resource.Iridium.crates = 30;
        global.resource.Iridium.containers = 30;
        global.resource.Adamantite.crates = 30;
        global.resource.Adamantite.containers = 30;
        global.resource.Graphene.crates = 30;
        global.resource.Graphene.containers = 30;
        global.resource.Stanene.crates = 30;
        global.resource.Stanene.containers = 30;
        global.resource.Bolognium.crates = 30;
        global.resource.Bolognium.containers = 30;
        global.resource.Orichalcum.crates = 30;
        global.resource.Orichalcum.containers = 30;

        global.civic.taxes.display = true;

        if (!global.race['flier']){
            global.civic.cement_worker.display = true;
            global.resource.Cement.crates = 30;
            global.resource.Cement.containers = 30;
        }

        global.civic.professor.display = true;
        global.civic.scientist.display = true;
        global.civic.banker.display = true;

        global.civic.professor.max = 1;
        global.civic.professor.workers = 1;

        global.city.calendar.day++;
        global.city.market.active = true;
        global.city['power'] = 0;
        global.city['powered'] = true;

        if (global.race['artifical']){
            global.city['transmitter'] = { count: 0, on: 0 };
        }

        initStruct(actions.city.factory);
        initStruct(actions.city.foundry);
        initStruct(actions.city.smelter);

        initStruct(actions.city.amphitheatre);
        initStruct(actions.city.apartment);
        initStruct(actions.city.bank);
        initStruct(actions.city.basic_housing);
        initStruct(actions.city.biolab);
        initStruct(actions.city.boot_camp);
        initStruct(actions.city.casino);
        initStruct(actions.city.cement_plant);
        initStruct(actions.city.coal_mine);
        initStruct(actions.city.coal_power);
        initStruct(actions.city.cottage);
        initStruct(actions.city.fission_power);
        initStruct(actions.city.garrison);
        initStruct(actions.city.hospital);
        initStruct(actions.city.library);
        initStruct(actions.city.lumber_yard);
        initStruct(actions.city.mass_driver);
        initStruct(actions.city.metal_refinery);
        initStruct(actions.city.mine);
        initStruct(actions.city.oil_depot);
        initStruct(actions.city.oil_power);
        initStruct(actions.city.oil_well);
        initStruct(actions.city.rock_quarry);
        initStruct(actions.city.sawmill);
        initStruct(actions.city.shed);
        initStruct(actions.city.storage_yard);
        initStruct(actions.city.temple);
        initStruct(actions.city.tourist_center);
        initStruct(actions.city.trade);
        initStruct(actions.city.university);
        initStruct(actions.city.wardenclyffe);
        initStruct(actions.city.warehouse);
        initStruct(actions.city.wharf);

        initStruct(actions.space.spc_belt.elerium_ship);
        initStruct(actions.space.spc_belt.iridium_ship);
        initStruct(actions.space.spc_belt.iron_ship);
        initStruct(actions.space.spc_belt.space_station);
        initStruct(actions.space.spc_dwarf.e_reactor);
        initStruct(actions.space.spc_dwarf.elerium_contain);
        initStruct(actions.space.spc_dwarf.shipyard);
        initStruct(actions.space.spc_gas.gas_mining);
        initStruct(actions.space.spc_gas.gas_storage);
        initStruct(actions.space.spc_gas_moon.drone);
        initStruct(actions.space.spc_gas_moon.oil_extractor);
        initStruct(actions.space.spc_gas_moon.outpost);
        initStruct(actions.space.spc_hell.geothermal);
        initStruct(actions.space.spc_hell.hell_smelter);
        initStruct(actions.space.spc_hell.spc_casino);
        initStruct(actions.space.spc_hell.swarm_plant);
        initStruct(actions.space.spc_home.gps);
        initStruct(actions.space.spc_home.nav_beacon);
        initStruct(actions.space.spc_home.propellant_depot);
        initStruct(actions.space.spc_home.satellite);
        initStruct(actions.space.spc_moon.helium_mine);
        initStruct(actions.space.spc_moon.iridium_mine);
        initStruct(actions.space.spc_moon.moon_base);
        initStruct(actions.space.spc_moon.observatory);
        initStruct(actions.space.spc_red.biodome);
        initStruct(actions.space.spc_red.exotic_lab);
        initStruct(actions.space.spc_red.fabrication);
        initStruct(actions.space.spc_red.garage);
        initStruct(actions.space.spc_red.living_quarters);
        initStruct(actions.space.spc_red.red_factory);
        initStruct(actions.space.spc_red.red_mine);
        initStruct(actions.space.spc_red.red_tower);
        initStruct(actions.space.spc_red.space_barracks);
        initStruct(actions.space.spc_red.spaceport);
        initStruct(actions.space.spc_red.vr_center);
        initStruct(actions.space.spc_red.ziggurat);
        initStruct(actions.space.spc_sun.swarm_control);
        initStruct(actions.space.spc_sun.swarm_satellite);

        global.civic['garrison'] = {
            display: true,
            disabled: false,
            progress: 0,
            tactic: 0,
            workers: 2,
            wounded: 0,
            raid: 0,
            max: 2
        };

        global.arpa['sequence'] = {
            max: 50000,
            progress: 0,
            time: 50000,
            on: true,
            boost: false,
            auto: false,
            labs: 0,
        };

        global.tech['stock_exchange'] = 0;
        global.tech['monuments'] = 0;
        global.tech['supercollider'] = 0;
        global.tech['railway'] = 0;
        global.arpa['m_type'] = arpa('Monument');

        if (!global.settings.msgFilters.hell.unlocked){
            global.settings.msgFilters.hell.unlocked = true;
            global.settings.msgFilters.hell.vis = true;
        }

        global.settings.showPortal = true;
        global.settings.portal.fortress = false;
        global.settings.portal.badlands = true;
        global.settings.portal.pit = false;
        global.settings.portal.wasteland = true;
        global.settings.portal.ruins = false;
        global.settings.portal.gate = false;
        global.settings.portal.lake = false;
        global.settings.portal.spire = false;
        global.settings.showCargo = false;
        global.settings.spaceTabs = 4;

        initStruct(fortressModules.prtl_fortress.turret);
        initStruct(fortressModules.prtl_fortress.carport);
        initStruct(fortressModules.prtl_badlands.war_drone);
        initStruct(fortressModules.prtl_pit.soul_forge);
        initStruct(fortressModules.prtl_pit.soul_attractor);
        initStruct(fortressModules.prtl_ruins.guard_post);
        initStruct(fortressModules.prtl_lake.harbor);
        initStruct(fortressModules.prtl_spire.purifier);
        initStruct(fortressModules.prtl_spire.port);

        initStruct(fortressModules.prtl_wasteland.throne);
        initStruct(fortressModules.prtl_wasteland.incinerator); global.portal.incinerator.count = 1; global.portal.incinerator.on = 1;
        initStruct(fortressModules.prtl_wasteland.warehouse); global.portal.warehouse.count = 1;
        initStruct(fortressModules.prtl_wasteland.hovel); global.portal.hovel.count = 1;
        initStruct(fortressModules.prtl_wasteland.dig_demon); global.portal.dig_demon.count = 1; global.portal.dig_demon.on = 1;
        initStruct(fortressModules.prtl_wasteland.hell_casino); global.portal.hell_casino.count = 1; global.portal.hell_casino.on = 1;
        initStruct(fortressModules.prtl_wasteland.demon_forge); global.portal.demon_forge.count = 1; global.portal.demon_forge.on = 1;
        initStruct(fortressModules.prtl_wasteland.hell_factory); global.portal.hell_factory.count = 1; global.portal.hell_factory.on = 1;
        initStruct(fortressModules.prtl_wasteland.twisted_lab); global.portal.twisted_lab.count = 1; global.portal.twisted_lab.on = 1; global.portal.twisted_lab.Coal = 1;
        initStruct(fortressModules.prtl_wasteland.pumpjack); global.portal.pumpjack.count = 1;
        initStruct(fortressModules.prtl_wasteland.brute); global.portal.brute.count = 1; global.portal.brute.on = 1;

        addSmelter(10, 'Iron', 'Coal'); addSmelter(10, 'Steel', 'Coal');
        global.city.factory.Alloy = 2;
        global.city.factory.Polymer = 2;
        global.city.factory.Nano_Tube = 1;
        global.city.factory.Stanene = 1;

        global.civic.d_job = 'lumberjack';
        global.civic.miner.display = true;
        if (!global.race['joyless']){
            global.civic.entertainer.display = true;
        }
        global.civic.craftsman.display = true;

        let citizens = actions.portal.prtl_wasteland.dig_demon.citizens() + actions.portal.prtl_wasteland.hovel.citizens();

        global.resource[global.race.species].max = citizens;
        global.resource[global.race.species].amount = citizens;

        global.civic.miner.max = actions.portal.prtl_wasteland.dig_demon.citizens();
        global.civic.miner.workers = actions.portal.prtl_wasteland.dig_demon.citizens();
        global.civic.miner.assigned = actions.portal.prtl_wasteland.dig_demon.citizens();

        global.civic.cement_worker.max = 5;
        global.civic.cement_worker.workers = 5;
        global.civic.cement_worker.assigned = 5;

        if (!global.race['joyless']){
            global.civic.entertainer.max = 3;
            global.civic.entertainer.workers = 3;
            global.civic.entertainer.assigned = 3;
        }

        global.civic.banker.max = 1;
        global.civic.banker.workers = 1;
        global.civic.banker.assigned = 1;

        global.civic.professor.max = 3;
        global.civic.professor.workers = 3;
        global.civic.professor.assigned = 3;

        global.civic.scientist.max = 2;
        global.civic.scientist.workers = 2;
        global.civic.scientist.assigned = 2;

        global.civic.govern.type = 'autocracy';

        if (global.race['calm']){
            global.resource.Zen.display = true;
            initStruct(actions.city.meditation);
        }
        if (global.race['cannibalize']){
            initStruct(actions.city.s_alter);
        }
        if (global.race['magnificent']){
            initStruct(actions.city.shrine);
        }

        global.portal['fortress'] = {
            threat: 10000,
            garrison: 0,
            walls: 100,
            repair: 0,
            patrols: 0,
            patrol_size: 10,
            siege: 999,
            notify: 'Yes',
            s_ntfy: 'Yes',
            nocrew: false,
        };
        global.portal.observe = {
            settings: {
                expanded: false,
                average: false,
                hyperSlow: false,
                display: 'game_days',
                dropKills: true,
                dropGems: true
            },
            stats: {
                total: {
                    start: { year: global.city.calendar.year, day: global.city.calendar.day },
                    days: 0,
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
                },
                period: {
                    start: { year: global.city.calendar.year, day: global.city.calendar.day },
                    days: 0,
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
            },
            graphID: 0,
            graphs: {}
        };

        drawTech();
        arpa('Physics');
        loadFoundry();
        renderFortress();
    }
}
