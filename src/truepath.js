import { $ } from './dom.js';
import { global, p_on, support_on, sizeApproximation, seededRandom, webWorker, battle_log, keyMap } from './vars.js';
import { vBind, clearPopper, messageQueue, powerCostMod, powerModifier, spaceCostMultiplier, get_qlevel, flib,
         darkEffect, adjustCosts, getWeaselTechLevelRequirement, calcPrestige, modRes, clearElement, popover,
         deepClone, buildQueue, timeCheck, timeFormat, actionPool, poolHeld, modalCloseButton } from './functions.js';
import { races, traits, geneBonus, traitCostMod, fathomCheck, orbitLength } from './races.js';
import { spatialReasoning, unlockContainers, atomic_mass } from './resources.js';
import { armyRating, garrisonSize, govEffect, soldierDeath, soldierTrainingRate, soldierRecoveryRate, buildGarrison,
         rivalCollapsed, govTitle } from './civics.js';
import { jobScale, jobStackStep, job_data, loadFoundry, limitCraftsmen, workerScale, hugeScale } from './jobs.js';
import { production, highPopAdjust, hugeAdjust, infiltratorFactor } from './prod.js';
import { actions, payCosts, powerOnNewStruct, drawTech, bank_vault, structName, initStruct, getStructNumActive,
         buildTemplate, casinoEffect, housingLabel, setAction, drawCity, hugeEffect } from './actions.js';
import { fuel_adjust, renderSpace, incrementStruct, planetName, int_fuel_adjust, checkRequirements, spaceTech,
         sceneryBodies } from './space.js';
import { govActive, defineGovernor, removeTask } from './governor.js';
import { defineIndustry, addSmelter, factoryData, nf_resources, cancelRituals, setupRituals, setPowerGrid } from './industry.js';
import { arpa } from './arpa.js';
import { matrix, retirement, gardenOfEden, zApocalypse } from './resets.js';
import { loadTab } from './index.js';
import { zombieGenociderTask, shadowWarTask } from './achieve.js';
import { genXYZcoord, randomCoord, dist3, setOrbits, starData, buildSolarMap, starConstants } from './stars.js';
import { loc } from './locale.js';
import { supplyMode, supplyRegionName, activeSupplyRegions, capitalGone, supplyPool, partitioned, regAmount, poolMod,
         syncTotal } from './supply.js';
import { refundUnderground } from './iceage.js';
import { retiredShipFields } from './shipsave.js';
import { shipDockedAt, allShips, fleetCmd, fleetCmdUnlocked, fleetCmdDay, shipArmorSoak, shipSpeed, shipArmorFactor,
         fleetDamageSoak, shipClassFactor, shipAttackPower, shipCrewSize, leaveFleet, sensorRange, shipClassSoak,
         minHullToLaunch, fleetCmdRange, shipMoving, shipPort, TPShipInitTransit, initializeShipTrip, planShipTrip,
         fleetPace, shipDestination, shipPosition, tripDays, regionReachable, shipBound, hastenShip, tradeFleet,
         tradeFreighters, freightCargo, freightLoad, shipFleet, tradeLeader, patrolsUnlocked, shipPatrol,
         advancePatrol, sensorRangeAU, sendShipTo, advanceShip, getRandomShipName, repairSupplyFreighters,
         shipyardPayer, buildTPShip, shipPower, shipPowerStats, explorerRetired, shipSpecialAllowed, shipDefaultSpecial, shipParts,
         shipPartAvailable, shipSlotOpen, shipSpecial, shipBombardPower, shipFuelUse, tankerFuelRange, shipCosts,
         shipPartKey, shipyardZone, primaryYards, yardChoiceUnlocked, setShipyardPrimary, fleetMembers, shipFuelTank, shipFuelAmount, jumpGates, shipLegLeft,
         activeRepairYards, locSystem, shipLeg, shipTripDays, legDays, freightCapacity, canManuallyRefuel,
         manuallyRefuelShip, stopPatrol, refitAllowed, fleetCommandRating, fleetEscortCount, fleetCommandUsed,
         shipFlagship, fleetsFor, fleetWorthForming, shipyardLocations, shipSpaceworthy, sensorUpgrade,
         improvedSensors, dockedFields, shipCanMakeTrip, startPatrol, tradeLegDays, locSystemName, shipDestinations,
         shipCanLaunch, shipManned, refitParts, refitDesign, refitCosts, refitChanged, refitBlocked, refitDrains,
         applyRefit, fleetCommandCost, fleetCommandFree, formFleet, joinFleet, withdrawShips, massRelaySpeedBoost } from './ships.js';

const outerTruth = {
    spc_titan: {
        info: {
            name(){
                return planetName().titan;
            },
            desc(){
                return loc('space_titan_info_desc',[planetName().titan, races[global.race.species].home]);
            },
            support: 'electrolysis',
            zone: 'outer',
            showDest(){
                let show = global.settings.space.titan || global.tech?.resettle >= 3 ? true : false;
                return {r: show, l: show};
            },
            syndicate(){ if (global.tech['resettle']){ return false; } return global.tech['titan'] && global.tech.titan >= 3 && global.tech['enceladus'] && global.tech.enceladus >= 2 ? true : false; },
            syndicate_cap(){
                if (global.tech['triton']){
                    return global.tech.outer >= 4 ? 2000 : 1000;
                }
                return 600;
            },
            // Shut off for the resettlement arc until the outer distress signals reopen the long legs.
            nav(){ return (global.settings.space.titan && !global.tech['resettle']) || global.tech?.resettle >= 12 ? true : false; }
        },
        titan_mission: {
            id: 'space-titan_mission',
            title(){
                return loc('space_mission_title',[planetName().titan]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().titan]);
            },
            reqs: { outer: 1 },
            grant: ['titan',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.titan >= 1 ? 0 : 1; },
            cost: {
                Helium_3(o,wiki){ return +fuel_adjust(250000,false,wiki).toFixed(0); },
                Elerium(){ return 100; }
            },
            effect(){
                return loc('space_titan_mission_effect',[planetName().titan]);
            },
            action(){
                if (payCosts(this)){
                    messageQueue(loc('space_titan_mission_action',[planetName().titan, races[global.race.species].home]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        titan_spaceport: {
            id: 'space-titan_spaceport',
            title(){ return loc('space_red_spaceport_title'); },
            desc(){ return `<div>${loc('space_red_spaceport_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            type: 'outpost',
            reqs: { titan: 1 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('titan_spaceport', r.offset, 2500000, 1.32); },
                Lumber(r={}){ return spaceCostMultiplier('titan_spaceport', r.offset, 750000, 1.32); },
                Cement(r={}){ return spaceCostMultiplier('titan_spaceport', r.offset, 350000, 1.32); },
                Mythril(r={}){ return spaceCostMultiplier('titan_spaceport', r.offset, 10000, 1.32); }
            },
            effect(){
                let water = global.resource.Water.display ? `<div>${loc('plus_max_resource',[sizeApproximation(spatialReasoning(this.storage.res('Water') * this.storage.multiplier())),global.resource.Water.name])}</div>` : ``;
                let support = global.tech['enceladus'] && global.tech.enceladus >= 2 ? `<div>+${loc(`galaxy_alien2_support`,[this.support(),planetName().enceladus])}</div>` : ``;
                let storage = global.tech['titan'] && global.tech.titan >= 5 ? `<div>${loc(`space_titan_spaceport_storage`,[hugeEffect(25)])}</div>` : ``;
                return `${support}${water}${storage}<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
            },
            support(){ return 2; },
            powered(){ return powerCostMod(10); },
            storage: {
                res(res){
                    let list = {
                        'Water': 250
                    };
                    return res ? (list[res] || 0) : list;
                },
                multiplier(wiki){
                    return 1;
                },
                count(){
                    return p_on['titan_spaceport'] || 0;
                }
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('titan_spaceport');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['titan_spaceport','space']
                };
            },
            post(){
                if (global.tech['titan'] === 1){
                    global.tech['titan'] = 2;
                    drawTech();
                }
            }
        },
        electrolysis: {
            id: 'space-electrolysis',
            title(){ return loc('space_electrolysis_title'); },
            desc(){ return `<div>${loc('space_electrolysis_title')}</div><div class="has-text-special">${loc('space_electrolysis_req',[global.resource.Water.name])}</div>`; },
            type: 'industry',
            reqs: { titan: 3 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('electrolysis', r.offset, 1000000, 1.25); },
                Copper(r={}){ return spaceCostMultiplier('electrolysis', r.offset, 185000, 1.25); },
                Steel(r={}){ return spaceCostMultiplier('electrolysis', r.offset, 220000, 1.25); },
                Polymer(r={}){ return spaceCostMultiplier('electrolysis', r.offset, 380000, 1.25); }
            },
            effect(wiki){
                let support = `<div>+${loc(`galaxy_alien2_support`,[this.support(wiki),planetName().titan])}</div>`;
                return `${support}<div class="has-text-caution">${loc('space_electrolysis_use',[+(this.support_fuel().a).toFixed(0),global.resource.Water.name,this.powered()])}</div>`;
            },
            support(wiki){
                // Positronium electrolysis or AI core upgrade. These are mutually exclusive.
                if (global.tech['titan'] && global.tech.titan >= 11){ return 3; }
                return global.tech['titan_ai_core'] && global.tech.titan_ai_core >= 2 && (wiki ? global.space.ai_core2.on : p_on['ai_core2']) ? 3 : 2;
            },
            support_fuel(){ return { r: 'Water', a: hugeAdjust(35) }; },
            powered(){ return powerCostMod(8); },
            action(){
                if (payCosts(this)){
                    incrementStruct('electrolysis');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['electrolysis','space']
                };
            },
            post(){
                if (global.tech['titan'] === 3){
                    global.tech['titan'] = 4;
                    drawTech();
                }
            }
        },
        hydrogen_plant: {
            id: 'space-hydrogen_plant',
            title(){ return loc('space_hydrogen_plant_title'); },
            desc(){ return `<div>${loc('space_hydrogen_plant_title')}</div><div class="has-text-special">${loc('space_hydrogen_plant_req')}</div>`; },
            type: 'power',
            reqs: { titan_power: 1 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('hydrogen_plant', r.offset, 1500000, 1.28); },
                Iridium(r={}){ return spaceCostMultiplier('hydrogen_plant', r.offset, 292000, 1.28); },
                Stanene(r={}){ return spaceCostMultiplier('hydrogen_plant', r.offset, 599000, 1.28); },
                Cement(r={}){ return spaceCostMultiplier('hydrogen_plant', r.offset, 180000, 1.28); }
            },
            effect(){
                return `<span>${loc('space_dwarf_reactor_effect1',[-(this.powered())])}</span>, <span class="has-text-caution">${loc('space_hydrogen_plant_effect',[1,loc('space_electrolysis_title')])}</span>`;
            },
            support(){
                return 2;
            },
            powered(){ return powerModifier(-22); },
            power_limit(){ return global.space.electrolysis?.on || 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('hydrogen_plant');
                    if (global.space.electrolysis.on > global.space.hydrogen_plant.on){
                        global.space.hydrogen_plant.on++;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['hydrogen_plant','space']
                };
            }
        },
        titan_quarters: {
            id: 'space-titan_quarters',
            title(){ return loc('interstellar_habitat_title'); },
            desc(){
                return `<div>${loc('interstellar_habitat_title')}</div><div class="has-text-special">${loc('space_habitat_req',[planetName().titan, global.resource.Food.name, global.resource.Water.name])}</div>`;
            },
            type: 'housing',
            reqs: { titan: 4 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('titan_quarters', r.offset, 1200000, 1.28); },
                Furs(r={}){ return spaceCostMultiplier('titan_quarters', r.offset, 85000, 1.28); },
                Plywood(r={}){ return spaceCostMultiplier('titan_quarters', r.offset, 100000, 1.28); },
                Horseshoe(){ return global.race['hooved'] ? 1 : 0; }
            },
            effect(){
                let gain = jobScale(1);
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().titan])}</div><div>${loc('plus_max_resource',[jobScale(1),global.race['truepath'] ? loc('job_colonist_tp',[planetName().titan]) : loc('colonist')])}</div><div>${loc('plus_max_resource',[gain,loc('citizen')])}</div>
                        <div class="has-text-caution">${loc(`spend`,[+(this.support_fuel()[0].a).toFixed(0),global.resource[this.support_fuel()[0].r].name])}</div><div class="has-text-caution">${loc(`spend`,[+(this.support_fuel()[1].a).toFixed(0),global.resource[this.support_fuel()[1].r].name])}</div>`;
            },
            s_type: 'titan',
            support(){ return -1; },
            support_fuel(){ return [{ r: 'Water', a: hugeAdjust(12) },{ r: 'Food', a: hugeAdjust(supplyMode() === 'global' ? 500 : 250) }]; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('titan_quarters');
                    global.civic.titan_colonist.display = true;
                    if (powerOnNewStruct(this)){
                        let hiredMax = jobStackStep(global.space.titan_quarters.on);
                        global.resource[global.race.species].max += hiredMax;

                        global.civic.titan_colonist.max += hiredMax;

                        let hired = Math.min(hiredMax, global.civic[global.civic.d_job].workers);
                        global.civic[global.civic.d_job].workers -= hired;
                        global.civic.titan_colonist.workers += hired;
                        // Raise the job's target too, or a later dip in population never refills these seats.
                        global.civic.titan_colonist.assigned = (global.civic.titan_colonist.assigned || 0) + hired;
                    }
                    if (global.space.titan_quarters.count === 1){
                        renderSpace();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['titan_quarters','space']
                };
            },
            citizens(){
                let gain = 1;
                if (global.race['high_pop']){
                    gain *= traits.high_pop.vars()[0];
                }
                return gain;
            }
        },
        titan_mine: {
            id: 'space-titan_mine',
            title(){ return structName('titan_mine'); },
            desc(){
                return `<div>${loc('space_red_mine_desc')}</div><div class="has-text-special">${loc('space_support',[planetName().titan])}</div>`;
            },
            type: 'mining',
            reqs: { titan: 4 },
            condition(){ return global.space['titan_quarters'] && global.space.titan_quarters.count > 0 ? true : false; },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('titan_mine', r.offset, 475000, 1.28); },
                Lumber(r={}){ return spaceCostMultiplier('titan_mine', r.offset, 568000, 1.28); },
                Wrought_Iron(r={}){ return spaceCostMultiplier('titan_mine', r.offset, 250000, 1.28); }
            },
            effect(){
                let adam_val = production('titan_mine','adamantite');
                let alum_val = production('titan_mine','aluminium');
                let adamantite = hugeEffect(adam_val, 3);
                let aluminium = hugeEffect(alum_val, 3);
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().titan])}</div><div>${loc('space_red_mine_effect',[adamantite,global.resource.Adamantite.name])}</div><div>${loc('space_red_mine_effect',[aluminium,global.resource.Aluminium.name])}</div>`;
                if (global.tech['resettle']){
                    let stone = hugeEffect(production('titan_mine','stone'), 4);
                    desc += `<div>${loc('space_red_mine_effect',[stone,global.resource.Stone.name])}</div>`;
                }
                if (global.tech['resettle'] && global.resource.Chrysotile.display){
                    let chrysotile = hugeEffect(production('titan_mine','chrysotile'), 4);
                    desc += `<div>${loc('space_red_mine_effect',[chrysotile,global.resource.Chrysotile.name])}</div>`;
                }
                return desc;
            },
            s_type: 'titan',
            support(){ return -1; },
            powered(){ return 0; },
            special(){ return true; },
            action(){
                if (payCosts(this)){
                    incrementStruct('titan_mine');
                    powerOnNewStruct(this);
                    if (global.space.titan_mine.count === 1){
                        global.resource.Adamantite.display = true;
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, ratio: 90 },
                    p: ['titan_mine','space']
                };
            }
        },
        storehouse: {
            id: 'space-storehouse',
            title(){ return loc('space_storehouse_title'); },
            desc(){ return loc('space_storehouse_title'); },
            type: 'storage',
            reqs: { titan: 5 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('storehouse', r.offset, 175000, 1.28); },
                Lumber(r={}){ return spaceCostMultiplier('storehouse', r.offset, 100000, 1.28); },
                Aluminium(r={}){ return spaceCostMultiplier('storehouse', r.offset, 120000, 1.28); },
                Cement(r={}){ return spaceCostMultiplier('storehouse', r.offset, 45000, 1.28); }
            },
            wide: true,
            storage: {
                res(res){
                    let list = {
                        'Lumber': 3000,
                        'Stone': 3000,
                        'Furs': 1700,
                        'Copper': 1520,
                        'Iron': 1400,
                        'Aluminium': 1280,
                        'Cement': 1120,
                        'Coal': 480,
                        'Steel': 240,
                        'Titanium': 160,
                        'Alloy': 180,
                        'Polymer': 150,
                        'Iridium': 175,
                        'Chrysotile': 3000,
                        'Nano_Tube': 120,
                        'Neutronium': 64,
                        'Adamantite': 72
                    };
                    if (global.resource.Tungsten.display){
                        list['Tungsten'] = 480;
                    }
                    if (global.resource.Water.display && global.tech['resettle']){
                        list['Water'] = 2;
                    }
                    if (global.tech['shadow']){
                        list['Graphene'] = 500;
                        list['Stanene'] = 500;
                        list['Bolognium'] = 250;
                        list['Orichalcum'] = 250;
                        list['Unobtainium'] = 75;
                    }
                    return res ? list[res] || 0 : list;
                },
                multiplier(wiki){
                    return tpStorageMultiplier('storehouse',false,wiki);
                },
                h_multiplier(wiki){
                    return tpStorageMultiplier('storehouse',true,wiki);
                },
                mtype(res){
                    return ['Copper','Iron','Steel','Titanium','Iridium','Neutronium','Adamantite','Tungsten'].includes(res) ? 'h_multiplier' : 'multiplier';
                }
            },
            effect(wiki){
                let storage = '<div class="aTable">';
                let list = this.storage.res();
                for (const res of Object.keys(list)){
                    if (global.resource[res].display){
                        let multiplier = this.storage[this.storage.mtype(res)](wiki);
                        let val = sizeApproximation(spatialReasoning(list[res] * multiplier),1);
                        storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                storage = storage + '</div>';
                return storage;
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('storehouse');
                    let list = this.storage.res();
                    for (const res of Object.keys(list)){
                        if (global.resource[res].display){
                            let multiplier = this.storage[this.storage.mtype(res)]();
                            global.resource[res].max += (spatialReasoning(list[res]) * multiplier);
                        }
                    };
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['storehouse','space']
                };
            }
        },
        titan_bank: {
            id: 'space-titan_bank',
            title(){ return loc('city_bank'); },
            desc(){
                return loc('city_bank_desc',[planetName().titan]);
            },
            type: 'finance',
            reqs: { titan: 6 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('titan_bank', r.offset, traitCostMod('untrustworthy',2500000), 1.32); },
                Titanium(r={}){ return spaceCostMultiplier('titan_bank', r.offset, traitCostMod('untrustworthy',380000), 1.32); },
                Neutronium(r={}){ return spaceCostMultiplier('titan_bank', r.offset, traitCostMod('untrustworthy',5000), 1.32); }
            },
            effect(){
                let vault = spatialReasoning(this.storage.res('Money') * this.storage.multiplier());
                return loc('plus_max_resource',[`\$${vault.toLocaleString()}`,loc('resource_Money_name')]);
            },
            storage: {
                res(res){
                    let list = {
                        'Money': bank_vault() * 2
                    };
                    return res ? (list[res] || 0) : list;
                },
                multiplier(wiki){
                    return 1;
                }
            },
            action(){
                if (payCosts(this)){
                    global['resource']['Money'].max += spatialReasoning(this.storage.res('Money') * this.storage.multiplier());
                    incrementStruct('titan_bank');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['titan_bank','space']
                };
            }
        },
        g_factory: {
            id: 'space-g_factory',
            title(){ return loc('interstellar_g_factory_title'); },
            desc(){ return `<div>${loc('interstellar_g_factory_title')}</div><div class="has-text-special">${loc('space_support',[planetName().titan])}</div>`; },
            type: 'industry',
            reqs: { graphene: 1 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('g_factory', r.offset, 950000, 1.28); },
                Copper(r={}){ return spaceCostMultiplier('g_factory', r.offset, 165000, 1.28); },
                Stone(r={}){ return spaceCostMultiplier('g_factory', r.offset, 220000, 1.28); },
                Adamantite(r={}){ return spaceCostMultiplier('g_factory', r.offset, 12500, 1.28); }
            },
            effect(){
                let graphene = 0.05;
                if (global.race['high_pop']){
                    graphene = +(highPopAdjust(graphene)).toFixed(3);
                }
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().titan])}</div><div>${loc('space_red_mine_effect',[hugeEffect(graphene, 1, 2),global.resource.Graphene.name])}</div><div>${loc('interstellar_g_factory_effect')}</div>`;
            },
            s_type: 'titan',
            support(){ return -1; },
            powered(){ return 0; },
            special: true,
            action(){
                if (payCosts(this)){
                    incrementStruct('g_factory');
                    global.resource.Graphene.display = true;
                    if (powerOnNewStruct(this)){
                        if (global.race['kindling_kindred'] || global.race['smoldering']){
                            global.space.g_factory.Oil++;
                        }
                        else {
                            global.space.g_factory.Lumber++;
                        }
                    }
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, Lumber: 0, Coal: 0, Oil: 0 },
                    p: ['g_factory','space']
                };
            }
        },
        metalworks: {
            id: 'space-metalworks',
            title(){ return loc('space_metalworks_title'); },
            desc(){ return `<div>${loc('space_metalworks_title')}</div><div class="has-text-special">${loc('space_support',[planetName().titan])}</div>`; },
            type: 'industry',
            reqs: { titan: 10 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('metalworks', r.offset, 425000000, 1.28); },
                Coal(r={}){ return spaceCostMultiplier('metalworks', r.offset, 4200000, 1.28); },
                Graphene(r={}){ return spaceCostMultiplier('metalworks', r.offset, 2600000, 1.28); },
                Neutronium(r={}){ return spaceCostMultiplier('metalworks', r.offset, 165000, 1.28); }
            },
            effect(wiki){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().titan])}</div>`;
                desc += `<div>${loc('space_metalworks_effect',[1,planetName().titan])}</div>`;
                let split = '<div class="aTable center">';
                for (const res of this.res()){
                    let boost = +((production('metalworks',res,wiki) - 1) * 100).toFixed(2);
                    split += `<span>${loc('space_metalworks_effect2',[global.resource[res].name,boost])}</span>`;
                }
                desc += split + '</div>';
                return desc;
            },
            wide: true,
            res(){
                return ['Steel','Iridium','Iron','Copper','Aluminium','Titanium'];
            },
            s_type: 'titan',
            support(){ return -1; },
            powered(){ return 0; },
            special: true,
            action(){
                if (payCosts(this)){
                    incrementStruct('metalworks');
                    powerOnNewStruct(this);
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            },
            struct(){
                let d = { count: 0, on: 0 };
                // Start with the pool split evenly and fully assigned; an uneven split hands the spare
                // points out one each from the top of the list so the shares always total 100.
                let metals = this.res();
                let share = Math.floor(100 / metals.length);
                let spare = 100 - (share * metals.length);
                metals.forEach(function(res,i){ d[res] = share + (i < spare ? 1 : 0); });
                return {
                    d: d,
                    p: ['metalworks','space']
                };
            }
        },
        comedy_club: {
            id: 'space-comedy_club',
            title(){ return loc('space_comedy_club_title'); },
            desc(){
                return `<div>${loc('space_comedy_club_title')}</div><div class="has-text-special">${loc('space_support',[planetName().titan])}</div>`;
            },
            type: 'entertainment',
            reqs: { titan: 12 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('comedy_club', r.offset, 250000000, 1.3); },
                Iron(r={}){ return spaceCostMultiplier('comedy_club', r.offset, 490000000, 1.3); },
                Polymer(r={}){ return spaceCostMultiplier('comedy_club', r.offset, 75000000, 1.3); },
                Bolognium(r={}){ return spaceCostMultiplier('comedy_club', r.offset, 25000000, 1.3); }
            },
            effect(){
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().titan])}</div>`
                     + `<div>${loc('plus_max_resource',[jobScale(1),job_data.entertainer.name()])}</div>`;
            },
            s_type: 'titan',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct(this);
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['comedy_club','space']
                };
            },
            flair(){
                return loc('space_comedy_club_flair');
            }
        },
        sam: {
            id: 'space-sam',
            title(){ return loc('space_sam_title'); },
            desc(){
                return `<div>${loc('space_sam_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'military',
            reqs: { titan: 7 },
            condition(){ return !global.tech['resettle'] ? true : false; },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('sam', r.offset, 2500000, 1.28); },
                Steel(r={}){ return spaceCostMultiplier('sam', r.offset, 450000, 1.28); },
                Elerium(r={}){ return spaceCostMultiplier('sam', r.offset, 120, 1.28); },
                Brick(r={}){ return spaceCostMultiplier('sam', r.offset, 160000, 1.28); },
            },
            effect(){
                let desc = `<div>${loc('galaxy_defense_platform_effect',[hugeEffect(25)])}</div>`;
                return desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
            },
            powered(){ return powerCostMod(5); },
            action(){
                if (payCosts(this)){
                    incrementStruct('sam');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['sam','space']
                };
            },
            post(){
                vBind({el: `#spc_titansynd`},'update');
            }
        },
        decoder: {
            id: 'space-decoder',
            title(){ return loc('space_decoder_title'); },
            desc(){
                return `<div>${loc('space_decoder_title')}</div><div class="has-text-special">${loc('requires_power_support_combo',[planetName().titan, global.resource.Cipher.name])}</div>`;
            },
            type: 'science',
            reqs: { titan: 8 },
            condition(){ return !global.tech['resettle'] ? true : false; },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('decoder', r.offset, 12500000, 1.275); },
                Elerium(r={}){ return spaceCostMultiplier('decoder', r.offset, 750, 1.275); },
                Orichalcum(r={}){ return spaceCostMultiplier('decoder', r.offset, 330000, 1.275); },
                Quantium(r={}){ return spaceCostMultiplier('decoder', r.offset, 180000, 1.275); },
            },
            effect(wiki){
                let cipher = this.support_fuel().a;
                let know = this.knowVal(wiki);
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().titan])}</div>`;
                desc += `<div>${loc('space_red_exotic_lab_effect1',[know])}</div>`;
                return desc + `<div class="has-text-caution">${loc('spend',[+(cipher).toFixed(2),global.resource[this.support_fuel().r].name])}</div>`;
            },
            knowVal(wiki){
                let gain = 2500
                if (global.race['high_pop']){
                    gain = highPopAdjust(gain);
                }
                if (wiki ? (global.space?.ai_core2?.on ?? 0) : p_on['ai_core2']){
                    gain *= 1.25;
                }
                gain *= infiltratorFactor('spc_titan','decoder');
                gain = hugeAdjust(gain);
                return gain;
            },
            s_type: 'titan',
            support(){ return -1; },
            powered(){ return 0; },
            support_fuel(){ return { r: 'Cipher', a: hugeAdjust(0.06) }; },
            action(){
                if (payCosts(this)){
                    incrementStruct('decoder');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['decoder','space']
                };
            }
        },
        ai_core: {
            id: 'space-ai_core',
            title(){ return loc('space_ai_core'); },
            desc(wiki){
                if (!global.space.hasOwnProperty('ai_core') || global.space.ai_core.count < 100 || wiki){
                    return `<div>${loc('space_ai_core')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>` + (global.space.hasOwnProperty('ai_core') && global.space.ai_core.count >= 100 ? `<div class="has-text-special">${loc('requires_power')}</div>` : ``);
                }
                else {
                    return `<div>${loc('space_ai_core')}</div>`;
                }
            },
            type: 'megaproject',
            reqs: { titan: 9 },
            path: ['truepath'],
            condition(){
                return global.space.ai_core.count >= 100 || global.tech['resettle'] ? false : true;
            },
            queue_size: 10,
            queue_complete(){ return 100 - global.space.ai_core.count; },
            cost: {
                Money(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 2500000 : 0; },
                Cement(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 180000 : 0; },
                Aluminium(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 250000 : 0; },
                Elerium(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 250 : 0; },
                Nano_Tube(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 125000 : 0; },
                Orichalcum(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 50000 : 0; },
                Quantium(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 100000 : 0; },
                Cipher(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0)) < 100 ? 750 : 0; },
            },
            effect(wiki){
                let effectText = `<div>${loc('space_ai_core_effect')}</div>`;
                let count = ((wiki?.count ?? 0) + (global.space.hasOwnProperty('ai_core') ? global.space.ai_core.count : 0));
                if (count < 100){
                    let remain = 100 - count;
                    effectText += `<div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return outerTruth.spc_titan.ai_core2.effect(wiki);
                }
                return effectText;
            },
            action(){
                if (payCosts(this)){
                    if (global.space.ai_core.count < 100){
                        incrementStruct('ai_core');
                        if (global.space.ai_core.count >= 100){
                            global.tech['titan_ai_core'] = 1;
                            initStruct(outerTruth.spc_titan.ai_core2);
                            incrementStruct('ai_core2','space');
                            powerOnNewStruct(outerTruth.spc_titan.ai_core2);
                            renderSpace();
                            drawTech();
                            if (global.city.ptrait.includes('kamikaze') && !global.race['tidal_decay']){
                                messageQueue(loc('planet_kamikaze_stabilize',[races[global.race.species].home,100]),'info',false,['progress']);
                            }
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['ai_core','space']
                };
            }
        },
        ai_core2: {
            id: 'space-ai_core2',
            title(){ return loc('space_ai_core'); },
            desc(){
                return `<div>${loc('space_ai_core')}</div><div class="has-text-special">${loc('space_electrolysis_req',[global.resource[this.p_fuel().r].name])}</div>`;
            },
            type: 'megaproject',
            reqs: { titan_ai_core: 1 },
            path: ['truepath'],
            condition(){
                return !global.tech['resettle'] && global.space.hasOwnProperty('ai_core') && global.space.ai_core.count >= 100 ? true : false;
            },
            wiki: false,
            queue_complete(){ return 0; },
            cost: {},
            powered(){
                return powerCostMod(100, true);
            },
            p_fuel(){ return { r: 'Water', a: 1000 }; },
            effect(wiki){
                let value = 25;
                let desc = `<div class="has-text-warning">${loc('interstellar_citadel_stat',[+(get_qlevel(wiki)).toFixed(1)])}</div>`;
                desc += `<div>${loc('interstellar_citadel_effect',[value])}</div><div>${loc('space_ai_core_effect2',[value])}</div>`;
                if (global.tech['titan_ai_core'] && global.tech.titan_ai_core >= 2){
                    desc += `<div>${loc('space_ai_core_effect3',[50])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('space_electrolysis_use',[this.p_fuel().a,global.resource[this.p_fuel().r].name,this.powered()])}</div>`;
                if (global.tech['titan_ai_core'] && global.tech.titan_ai_core >= 3){
                    let drift = +calcAIDrift(wiki).toFixed(1);
                    desc += `<div class="has-text-advanced">${loc('space_ai_core_effect4',[drift])}</div>`;
                }
                return desc;
            },
            action(){
                return false;
            },
            flair(){
                return global.space.hasOwnProperty('ai_core2') && global.space.ai_core2.on >= 1 ? loc(`space_ai_core_flair`) : loc(`space_ai_core_flair2`);
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['ai_core2','space']
                };
            }
        },
        ai_colonist: {
            id: 'space-ai_colonist',
            title(){ return loc('space_ai_colonist_title'); },
            desc(){
                return `<div>${loc('space_ai_colonist_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'housing',
            reqs: { titan_ai_core: 3 },
            condition(){ return !global.tech['resettle'] ? true : false; },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('ai_colonist', r.offset, 112000000, 1.35); },
                Alloy(r={}){ return spaceCostMultiplier('ai_colonist', r.offset, 750000, 1.35); },
                Elerium(r={}){ return spaceCostMultiplier('ai_colonist', r.offset, 500, 1.35); },
                Nano_Tube(r={}){ return spaceCostMultiplier('ai_colonist', r.offset, 525000, 1.35); },
                Quantium(r={}){ return spaceCostMultiplier('ai_colonist', r.offset, 150000, 1.35); },
                Cipher(r={}){ return spaceCostMultiplier('ai_colonist', r.offset, 10000, 1.35); },
            },
            effect(){
                return `<div>${loc('plus_max_resource',[jobScale(1),global.race['truepath'] ? loc('job_colonist_tp',[planetName().titan]) : loc('colonist')])}</div><div>${loc('space_ai_colonist_effect',[jobScale(1),planetName().titan])}</div><div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
            },
            powered(){ return powerCostMod(10); },
            action(){
                if (payCosts(this)){
                    incrementStruct('ai_colonist');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['ai_colonist','space']
                };
            },
            flair: loc(`tech_combat_droids_flair`)
        },
        wonder_gardens: {
            id: 'space-wonder_gardens',
            title(){
                return loc('space_wonder_gardens',[planetName().titan]);
            },
            desc(){
                return loc('space_wonder_gardens',[planetName().titan]);
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
            }
        },
    },
    spc_enceladus: {
        info: {
            name(){
                return planetName().enceladus;
            },
            desc(){
                return loc('space_enceladus_info_desc',[planetName().enceladus, races[global.race.species].home]);
            },
            support: 'titan_spaceport',
            zone: 'outer',
            showDest(){
                let show = global.settings.space.enceladus || global.tech?.resettle >= 3 ? true : false;
                return {r: show, l: show};
            },
            syndicate(){ if (global.tech['resettle']){ return false; } return global.tech['titan'] && global.tech.titan >= 3 && global.tech['enceladus'] && global.tech.enceladus >= 2 ? true : false; },
            syndicate_cap(){
                if (global.tech['triton']){
                    return global.tech.outer >= 4 ? 1500 : 1000;
                }
                return 600;
            },
            // Shut off for the resettlement arc until the outer distress signals reopen the long legs.
            nav(){ return !global.tech['resettle'] || global.tech.resettle >= 12 ? true : false; }
        },
        enceladus_mission: {
            id: 'space-enceladus_mission',
            title(){
                return loc('space_mission_title',[planetName().enceladus]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().enceladus]);
            },
            reqs: { outer: 1 },
            grant: ['enceladus',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.enceladus >= 1 ? 0 : 1; },
            cost: {
                Helium_3(r={}){ return +fuel_adjust(250000,false,r.wiki).toFixed(0); },
                Elerium(){ return 100; }
            },
            effect(){
                return loc('space_titan_mission_effect',[planetName().enceladus]);
            },
            action(){
                if (payCosts(this)){
                    messageQueue(loc('space_enceladus_mission_action',[planetName().enceladus]),'info',false,['progress']);
                    global.resource.Water.display = true;
                    return true;
                }
                return false;
            }
        },
        water_freighter: {
            id: 'space-water_freighter',
            title(){ return loc('space_water_freighter_title'); },
            desc(){
                return `<div>${loc('space_water_freighter_title')}</div><div class="has-text-special">${loc('space_support',[planetName().enceladus])}</div>`;
            },
            type: 'ship',
            reqs: { enceladus: 2 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('water_freighter', r.offset, 450000, 1.25); },
                Iron(r={}){ return spaceCostMultiplier('water_freighter', r.offset, 362000, 1.25); },
                Nano_Tube(r={}){ return spaceCostMultiplier('water_freighter', r.offset, 125000, 1.25); },
                Sheet_Metal(r={}){ return spaceCostMultiplier('water_freighter', r.offset, 75000, 1.25); }
            },
            effect(wiki){
                let helium = fuel_adjust(5,true,wiki);
                let water = +(production('water_freighter')).toFixed(2);
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().enceladus])}</div><div>${loc('produce',[water,global.resource.Water.name])}</div><div class="has-text-caution">${loc(`space_belt_station_effect3`,[hugeEffect(helium, 2)])}</div>`;
            },
            s_type: 'enceladus',
            support(){ return -1; },
            support_fuel(){ return { r: 'Helium_3', a: +hugeAdjust(fuel_adjust(5,true)) }; },
            support_fuel_adjust: false,
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('water_freighter');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['water_freighter','space']
                };
            }
        },
        zero_g_lab: {
            id: 'space-zero_g_lab',
            title(){ return loc('tech_zero_g_lab'); },
            desc(){
                return `<div>${loc('tech_zero_g_lab')}</div><div class="has-text-special">${loc('requires_power_support',[planetName().enceladus])}</div>`;
            },
            type: 'science',
            reqs: { enceladus: 3 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('zero_g_lab', r.offset, 5000000, 1.25); },
                Alloy(r={}){ return spaceCostMultiplier('zero_g_lab', r.offset, 125000, 1.25); },
                Graphene(r={}){ return spaceCostMultiplier('zero_g_lab', r.offset, 225000, 1.25); },
                Stanene(r={}){ return spaceCostMultiplier('zero_g_lab', r.offset, 600000, 1.25); }
            },
            effect(){
                let know = Math.round(this.knowVal());
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().enceladus])}</div><div>${loc('city_max_knowledge',[know])}</div>`;
                if (global.resource.Quantium.display){
                    desc = desc + `<div>${loc('space_zero_g_lab_effect',[jobScale(1)])}</div>`;
                }
                if (global.resource.Cipher.display){
                    desc = desc + `<div>${loc('plus_max_resource',[hugeEffect(this.storage.res('Cipher') * this.storage.multiplier(), 0),global.resource.Cipher.name])}</div>`;
                }
                return desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
            },
            knowVal(){
                let synd = syndicate('spc_enceladus');
                let gain = 10000 * synd;
                gain *= infiltratorFactor('spc_enceladus','zero_g_lab');
                gain = hugeAdjust(gain);
                return gain;
            },
            s_type: 'enceladus',
            support(){ return -1; },
            powered(){ return powerCostMod(12); },
            storage: {
                res(res){
                    let list = {
                        'Cipher': hugeAdjust(100000)
                    };
                    return res ? (list[res] || 0) : list;
                },
                multiplier(wiki){
                    return infiltratorFactor('spc_enceladus','zero_g_lab');
                },
                count(){
                    return Math.min(support_on['zero_g_lab'] || 0,p_on['zero_g_lab'] || 0)
                },
                gain(res, val, multiplier, count){
                    return Math.floor(count * val * multiplier);
                }
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('zero_g_lab');
                    powerOnNewStruct(this);
                    if (global.space.zero_g_lab.count === 1 && global.tech['quantium']){
                        loadFoundry();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['zero_g_lab','space']
                };
            },
            postPower(on){
                limitCraftsmen('Quantium');
            }
        },
        operating_base: {
            id: 'space-operating_base',
            title(){ return loc('tech_operating_base'); },
            desc(){
                return `<div>${loc('tech_operating_base')}</div><div class="has-text-special">${loc('requires_power_support',[planetName().enceladus])}</div>`;
            },
            type: 'military',
            reqs: { enceladus: 4 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('operating_base', r.offset, 7500000, 1.3); },
                Furs(r={}){ return spaceCostMultiplier('operating_base', r.offset, 500000, 1.3); },
                Adamantite(r={}){ return spaceCostMultiplier('operating_base', r.offset, 375000, 1.3); },
                Stanene(r={}){ return spaceCostMultiplier('operating_base', r.offset, 750000, 1.3); },
                Mythril(r={}){ return spaceCostMultiplier('operating_base', r.offset, 225000, 1.3); },
                Horseshoe(){ return global.race['hooved'] ? 4 : 0; }
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().enceladus])}</div>`;
                if (!global.tech['resettle']){
                    desc += `<div>${loc('galaxy_defense_platform_effect',[hugeEffect(50, 0)])}</div>`;
                }
                desc += loc('plus_max_resource',[this.soldiers(),loc('civics_garrison_soldiers')]);
                if (global.race['orbit_decayed'] && global.tech['medic']){
                    let healing = global.tech['medic'] * 5;
                    desc += `<div>${loc('city_hospital_effect',[hugeEffect(healing)])}</div>`;
                }
                return desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
            },
            s_type: 'enceladus',
            support(){ return -1; },
            powered(){ return powerCostMod(10); },
            action(){
                if (payCosts(this)){
                    incrementStruct('operating_base');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['operating_base','space']
                };
            },
            soldiers(){
                let soldiers = global.race['grenadier'] ? 3 : 4;
                soldiers *= geneBonus('quartermaster');
                soldiers = hugeAdjust(soldiers);
                return +(jobScale(soldiers)).toFixed(3);
            },
            post(){
                vBind({el: `#spc_enceladussynd`},'update');
            }
        },
        munitions_depot: {
            id: 'space-munitions_depot',
            title(){ return loc('tech_munitions_depot'); },
            desc(){ return loc('tech_munitions_depot'); },
            type: 'military',
            category: 'storage',
            era: 'solar',
            reqs: { enceladus: 5 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('munitions_depot', r.offset, 5000000, 1.22); },
                Iron(r={}){ return spaceCostMultiplier('munitions_depot', r.offset, 185000, 1.22); },
                Sheet_Metal(r={}){ return spaceCostMultiplier('munitions_depot', r.offset, 100000, 1.22); },
            },
            effect(){
                let containers = 25;
                return `<div>${loc('plus_max_crates',[containers])}</div><div>${loc('plus_max_containers',[containers])}</div>`;
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('munitions_depot');
                    global.resource.Crates.max += 25;
                    global.resource.Containers.max += 25;
                    if (!global.resource.Containers.display){
                        unlockContainers();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['munitions_depot','space']
                };
            },
        }
    },
    spc_triton: {
        info: {
            name(){
                return planetName().triton;
            },
            desc(){
                return loc('space_triton_info_desc',[planetName().triton, races[global.race.species].home]);
            },
            zone: 'outer',
            showDest(){
                let show = global.settings.space.triton || global.tech?.resettle >= 3 ? true : false;
                return {r: show, l: show};
            },
            syndicate(){ if (global.tech['resettle']){ return false; } return global.tech['triton'] && global.tech.triton >= 2 ? true : false; },
            syndicate_cap(){ return global.tech['outer'] && global.tech.outer >= 4 ? 5000 : 3000; },
            nav(){ return global.tech['resettle'] || !global.settings.space.triton ? false : true; },
            extra(region){
                if (global.tech['triton'] && global.tech.triton >= 3){
                    $(`#${region}`).append(`<div id="${region}resist" v-show="${region}" class="syndThreat has-text-caution">${loc('space_ground_resist')} <span class="has-text-danger" v-html="threat(enemy,troops)"></span></div>`);
                    vBind({
                        el: `#${region}resist`,
                        data: global.space.fob,
                        methods: {
                            threat(e,t){
                                let wounded = global.civic.garrison.wounded - garrisonSize();
                                if (wounded < 0){ wounded = 0; }
                                let d = +(e - armyRating(t,'army',wounded)).toFixed(0);
                                return d < 0 ? 0 : d;
                            }
                        }
                    });
                }
            }
        },
        triton_mission: {
            id: 'space-triton_mission',
            title(){
                return loc('space_mission_title',[planetName().triton]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().triton]);
            },
            reqs: { outer: 2 },
            grant: ['triton',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.triton >= 1 ? 0 : 1; },
            cost: {
                Helium_3(r={}){ return +fuel_adjust(600000,false,r.wiki).toFixed(0); },
                Elerium(){ return 2500; }
            },
            effect(){
                return loc('space_triton_mission_effect',[planetName().triton]);
            },
            action(){
                if (payCosts(this)){
                    messageQueue(loc('space_triton_mission_action',[planetName().triton]),'info',false,['progress']);
                    global.space.syndicate['spc_triton'] = 1250;
                    global.space.syndicate['spc_titan'] += 250;
                    global.space.syndicate['spc_enceladus'] += 250;
                    return true;
                }
                return false;
            }
        },
        fob: {
            id: 'space-fob',
            title(){ return loc('space_fob_title'); },
            desc(){
                return `<div>${loc('tech_fob')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Helium_3.name])}</div>`;
            },
            type: 'military',
            reqs: { triton: 2 },
            path: ['truepath'],
            queue_complete(){ return 1 - global.space.fob.count; },
            cost: {
                Money(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) >= 1  ? 0 : spaceCostMultiplier('fob', r.offset, 250000000, 1.1); },
                Copper(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) >= 1 ? 0 : spaceCostMultiplier('fob', r.offset, 8000000, 1.1); },
                Uranium(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) >= 1 ? 0 : spaceCostMultiplier('fob', r.offset, 50000, 1.1); },
                Nano_Tube(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) >= 1 ? 0 : spaceCostMultiplier('fob', r.offset, 2500000, 1.1); },
                Graphene(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) >= 1 ? 0 : spaceCostMultiplier('fob', r.offset, 3000000, 1.1); },
                Sheet_Metal(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) >= 1 ? 0 : spaceCostMultiplier('fob', r.offset, 7500000, 1.1); },
                Quantium(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) >= 1 ? 0 : spaceCostMultiplier('fob', r.offset, 500000, 1.1); },
                Horseshoe(r={}){ return global.race['hooved'] && ((r.offset || 0) + (global.space.hasOwnProperty('fob') ? global.space.fob.count : 0)) < 1 ? 10 : 0; }
            },
            effect(wiki){
                let troops = garrisonSize();
                let max_troops = garrisonSize(true);
                let desc = `<div>${loc('galaxy_defense_platform_effect',[500])}</div>`;
                desc += loc('plus_max_resource',[this.soldiers(),loc('civics_garrison_soldiers')]);
                desc += `<div class="has-text-warning"><span class="soldier">${loc('civics_garrison_soldiers')}:</span> <span>${troops}</span> / <span>${max_troops}<span></div>`;
                desc += `<div class="has-text-warning"><span class="wounded">${loc('civics_garrison_wounded')}:</span> <span>${global.civic['garrison'] ? global.civic.garrison.wounded : 0}</span></div>`;
                desc += `<div class="has-text-warning">${loc('space_fob_landed',[global.space['fob'] ? global.space.fob.troops : 0])}</div>`;
                let helium = +(fuel_adjust(125,true,wiki)).toFixed(2);
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[this.powered(),helium,global.resource.Helium_3.name])}</div>`;
            },
            powered(){ return powerCostMod(50, true); },
            action(){
                if (global.space.fob.count < 1 && payCosts(this)){
                    incrementStruct('fob');
                    powerOnNewStruct(this);
                    if (global.tech['triton'] === 2){ global.tech['triton'] = 3; }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, troops: 0, enemy: 0 },
                    p: ['fob','space']
                };
            },
            soldiers(){
                let soldiers = global.race['grenadier'] ? 6 : 10;
                soldiers *= geneBonus('quartermaster');
                return +(jobScale(soldiers)).toFixed(3);
            },
            post(){
                drawTech();
                renderSpace();
                messageQueue(loc('space_fob_msg'),'info',false,['progress']);
            }
        },
        lander: {
            id: 'space-lander',
            title(){ return loc('space_lander_title'); },
            desc(){
                return `<div>${loc('space_lander_title')}</div><div class="has-text-special">${loc('requires_soldiers')}</div><div class="has-text-special">${loc('space_red_space_barracks_desc_req')}</div>`;
            },
            type: 'military',
            reqs: { triton: 3 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('lander', r.offset, 2400000, 1.15); },
                Aluminium(r={}){ return spaceCostMultiplier('lander', r.offset, 185000, 1.15); },
                Neutronium(r={}){ return spaceCostMultiplier('lander', r.offset, 10000, 1.15); },
                Nano_Tube(r={}){ return spaceCostMultiplier('lander', r.offset, 158000, 1.15); },
            },
            powered(){ return 0; },
            effect(wiki){
                let oil = fuel_adjust(50,true,wiki);
                let data = ``;
                if (global.space['crashed_ship'] && global.space.crashed_ship.count === 100){
                    data = `<div>${loc(`space_lander_effect3`,[production('lander'),global.resource.Cipher.name])}</div>`;
                }
                return `<div>${loc('space_lander_effect',[planetName().triton])}</div>${data}<div class="has-text-warning">${loc(`space_lander_effect2`,[hugeScale(jobScale(3))])}</div><div class="has-text-caution">${loc('space_red_space_barracks_effect2',[hugeEffect(oil, 2)])}</div>`;
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('lander');
                    global.space.lander.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['lander','space']
                };
            }
        },
        crashed_ship: {
            id: 'space-crashed_ship',
            title(){ return loc('space_crashed_ship_title'); },
            desc(){
                return `<div>${loc('space_crashed_ship_title')}</div>`;
            },
            type: 'utility',
            reqs: { triton: 3 },
            path: ['truepath'],
            queue_complete(){ return 0; },
            cost: {},
            effect(){
                let control = global.space['crashed_ship'] ? global.space.crashed_ship.count : 0;
                return `<div>${loc(`space_crashed_ship_effect`,[control])}</div>`;
            },
            action(){
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['crashed_ship','space']
                };
            }
        },
    },
    spc_makemake: {
        info: {
            name(){
                return planetName().makemake;
            },
            desc(){
                return loc('space_makemake_info_desc',[planetName().makemake]);
            },
            zone: 'outer',
            showDest(){
                return {r: true, l: global.settings.space.makemake};
            },
            syndicate(){ if (global.tech['resettle']){ return false; } return global.tech['makemake'] ? true : false; },
            syndicate_cap(){ return 2500; },
            nav(){ return global.tech['resettle'] || !global.settings.space.makemake ? false : true; }
        },
        makemake_mission: {
            id: 'space-makemake_mission',
            title(){
                return loc('space_mission_title',[planetName().makemake]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().makemake]);
            },
            reqs: { outer: 7 },
            grant: ['makemake',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.makemake >= 1 ? 0 : 1; },
            cost: {
                Helium_3(r={}){ return +fuel_adjust(1000000,false,r.wiki).toFixed(0); },
                Elerium(){ return 1000; }
            },
            effect(){
                return loc('space_makemake_mission_effect',[planetName().makemake]);
            },
            action(){
                if (payCosts(this)){
                    initStruct(outerTruth.spc_makemake.orichalcum_mine);
                    initStruct(outerTruth.spc_makemake.uranium_mine);
                    initStruct(outerTruth.spc_makemake.neutronium_mine);
                    global.space.syndicate['spc_makemake'] = 500;
                    messageQueue(loc('space_makemake_mission_action',[planetName().makemake]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        orichalcum_mine: {
            id: 'space-orichalcum_mine',
            title(){ return loc('space_makemake_mine',[global.resource.Orichalcum.name]); },
            desc(){
                return `<div>${loc('space_makemake_mine',[global.resource.Orichalcum.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            type: 'mining',
            reqs: { makemake: 1 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('orichalcum_mine', r.offset, 25000000, 1.25); },
                Graphene(r={}){ return spaceCostMultiplier('orichalcum_mine', r.offset, 900000, 1.25); },
                Elerium(r={}){ return spaceCostMultiplier('orichalcum_mine', r.offset, 200, 1.25); },
                Mythril(r={}){ return spaceCostMultiplier('orichalcum_mine', r.offset, 450000, 1.25); },
                Quantium(r={}){ return spaceCostMultiplier('orichalcum_mine', r.offset, 150000, 1.25); },
            },
            effect(wiki){
                let mineral = +(production('orichalcum_mine')).toFixed(3);
                let fuel = +fuel_adjust(this.p_fuel().a,true,wiki).toFixed(1);
                let desc = `<div>${loc('gain',[mineral,global.resource.Orichalcum.name])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[this.powered(),fuel,global.resource[this.p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(10); },
            p_fuel(){ return { r: 'Oil', a: hugeAdjust(200) }; },
            action(){
                if (payCosts(this)){
                    incrementStruct('orichalcum_mine');
                    global.resource.Orichalcum.display = true;
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['orichalcum_mine','space']
                };
            }
        },
        uranium_mine: {
            id: 'space-uranium_mine',
            title(){ return loc('space_makemake_mine',[global.resource.Uranium.name]); },
            desc(){
                return `<div>${loc('space_makemake_mine',[global.resource.Uranium.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            type: 'mining',
            reqs: { makemake: 1 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('uranium_mine', r.offset, 5000000, 1.25); },
                Iridium(r={}){ return spaceCostMultiplier('uranium_mine', r.offset, 250000, 1.25); },
                Steel(r={}){ return spaceCostMultiplier('uranium_mine', r.offset, 620000, 1.25); }
            },
            effect(wiki){
                let mineral = +(production('uranium_mine')).toFixed(3);
                let fuel = +fuel_adjust(this.p_fuel().a,true,wiki).toFixed(1);
                let desc = `<div>${loc('gain',[mineral,global.resource.Uranium.name])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[this.powered(),fuel,global.resource[this.p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(5); },
            p_fuel(){ return { r: 'Oil', a: hugeAdjust(60) }; },
            action(){
                if (payCosts(this)){
                    incrementStruct('uranium_mine');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['uranium_mine','space']
                };
            }
        },
        neutronium_mine: {
            id: 'space-neutronium_mine',
            title(){ return loc('space_makemake_mine',[global.resource.Neutronium.name]); },
            desc(){
                return `<div>${loc('space_makemake_mine',[global.resource.Neutronium.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            type: 'mining',
            reqs: { makemake: 1 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('neutronium_mine', r.offset, 8000000, 1.25); },
                Adamantite(r={}){ return spaceCostMultiplier('neutronium_mine', r.offset, 650000, 1.25); },
                Stanene(r={}){ return spaceCostMultiplier('neutronium_mine', r.offset, 1250000, 1.25); },
            },
            effect(wiki){
                let mineral = +(production('neutronium_mine')).toFixed(3);
                let fuel = +fuel_adjust(this.p_fuel().a,true,wiki).toFixed(1);
                let desc = `<div>${loc('gain',[mineral,global.resource.Neutronium.name])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[this.powered(),fuel,global.resource[this.p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(8); },
            p_fuel(){ return { r: 'Oil', a: hugeAdjust(60) }; },
            action(){
                if (payCosts(this)){
                    incrementStruct('neutronium_mine');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['neutronium_mine','space']
                };
            }
        },
        elerium_mine: {
            id: 'space-elerium_mine',
            title(){ return loc('space_makemake_mine',[global.resource.Elerium.name]); },
            desc(){
                return `<div>${loc('space_makemake_mine',[global.resource.Elerium.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            type: 'mining',
            reqs: { makemake: 2 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('elerium_mine', r.offset, 20000000, 1.25); },
                Titanium(r={}){ return spaceCostMultiplier('elerium_mine', r.offset, 250000, 1.25); },
                Neutronium(r={}){ return spaceCostMultiplier('elerium_mine', r.offset, 120000, 1.25); },
                Orichalcum(r={}){ return spaceCostMultiplier('elerium_mine', r.offset, 175000, 1.25); },
            },
            effect(wiki){
                let mineral = +(production('elerium_mine')).toFixed(3);
                let fuel = +fuel_adjust(this.p_fuel().a,true,wiki).toFixed(1);
                let desc = `<div>${loc('gain',[mineral,global.resource.Elerium.name])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[this.powered(),fuel,global.resource[this.p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(12); },
            p_fuel(){ return { r: 'Oil', a: hugeAdjust(125) }; },
            action(){
                if (payCosts(this)){
                    incrementStruct('elerium_mine');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['elerium_mine','space']
                };
            }
        },
    },
    spc_eris: {
        info: {
            name(){
                return planetName().eris;
            },
            desc(){
                return loc('space_eris_info_desc',[planetName().eris]);
            },
            support: 'drone_control',
            zone: 'outer',
            showDest(){
                return {r: global.settings.space.eris || global.tech?.resettle >= 3, l: global.settings.space.eris};
            },
            syndicate(){ if (global.tech['resettle']){ return false; } return global.tech['eris'] ? true : false; },
            syndicate_cap(){ return 7500; },
            nav(){ return global.tech['resettle'] || !global.settings.space.eris ? false : true; },
            extra(region){
                if (global.tech['eris'] && global.tech['eris'] === 1){
                    $(`#${region}`).append(`<div id="${region}scanned" v-show="${region}" class="syndThreat has-text-caution">${loc('space_scanned')} <span class="has-text-info">{{ eris_scan }}%</span></div>`);
                    vBind({
                        el: `#${region}scanned`,
                        data: global.tech
                    });
                }
            }
        },
        eris_mission: {
            id: 'space-eris_mission',
            title(){
                return loc('space_mission_title',[planetName().eris]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().eris]);
            },
            reqs: { outer: 7 },
            grant: ['eris',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.eris >= 1 ? 0 : 1; },
            cost: {
                Helium_3(r={}){ return +fuel_adjust(1250000,false,r.wiki).toFixed(0); },
                Elerium(){ return 1250; }
            },
            effect(){
                return loc('space_eris_mission_effect',[planetName().eris]);
            },
            action(){
                if (payCosts(this)){
                    global.space.syndicate['spc_eris'] = 4000;
                    messageQueue(loc('space_eris_mission_action',[planetName().eris]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        drone_control: {
            id: 'space-drone_control',
            title(){ return loc('space_drone_control',[planetName().titan]); },
            desc(){
                return `<div>${loc('space_drone_control',[planetName().titan])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource[this.p_fuel().r].name])}</div>`;
            },
            type: 'military',
            reqs: { eris: 3 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('drone_control', r.offset, 75000000, 1.3); },
                Neutronium(r={}){ return spaceCostMultiplier('drone_control', r.offset, 100000, 1.3); },
                Stanene(r={}){ return spaceCostMultiplier('drone_control', r.offset, 450000, 1.3); },
                Quantium(r={}){ return spaceCostMultiplier('drone_control', r.offset, 300000, 1.3); },
            },
            effect(){
                let fuel = this.p_fuel().a;
                let desc = `<div>+${loc(`galaxy_alien2_support`,[this.support(),planetName().eris])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[this.powered(),+(fuel).toFixed(1),global.resource[this.p_fuel().r].name])}</div>`;
            },
            support(){ return p_on["ai_core2"] ? 5 : 0; },
            powered(){ return powerCostMod(25); },
            p_fuel(){ return { r: 'Uranium', a: hugeAdjust(5) }; },
            action(){
                if (payCosts(this)){
                    incrementStruct('drone_control');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['drone_control','space']
                };
            }
        },
        shock_trooper: {
            id: 'space-shock_trooper',
            title(){ return loc('space_shock_trooper_title'); },
            desc(){
                return `<div>${loc('space_shock_trooper_title')}</div><div class="has-text-special">${loc('space_support',[planetName().eris])}</div>`;
            },
            type: 'military',
            reqs: { eris: 3 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('shock_trooper', r.offset, 4250000, 1.225); },
                Polymer(r={}){ return spaceCostMultiplier('shock_trooper', r.offset, 375000, 1.225); },
                Adamantite(r={}){ return spaceCostMultiplier('shock_trooper', r.offset, 500000, 1.225); },
                Graphene(r={}){ return spaceCostMultiplier('shock_trooper', r.offset, 220000, 1.225); },
                Elerium(r={}){ return spaceCostMultiplier('shock_trooper', r.offset, 350, 1.225); },
            },
            effect(){
                let rating = Math.round(armyRating(hugeAdjust(1),'army',0) * syndicate('spc_eris'));
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().eris])}</div>`;
                if (global.space['digsite'] && global.space.digsite.count === 100){
                    desc = `<div>${loc(`space_lander_effect3`,[production('shock_trooper'),global.resource.Cipher.name])}</div>`;
                }
                return desc + `<div>${loc(`space_digsite_offense`,[rating])}</div>`;
            },
            s_type: 'eris',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('shock_trooper');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['shock_trooper','space']
                };
            }
        },
        tank: {
            id: 'space-tank',
            title(){ return loc('space_tank_title'); },
            desc(){
                return `<div>${loc('space_tank_title')}</div><div class="has-text-special">${loc('space_support',[planetName().eris])}</div>`;
            },
            type: 'military',
            reqs: { eris: 4 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('tank', r.offset, 100000000, 1.25); },
                Alloy(r={}){ return spaceCostMultiplier('tank', r.offset, 1250000, 1.25); },
                Orichalcum(r={}){ return spaceCostMultiplier('tank', r.offset, 600000, 1.25); },
                Mythril(r={}){ return spaceCostMultiplier('tank', r.offset, 500000, 1.25); },
                Uranium(r={}){ return spaceCostMultiplier('tank', r.offset, 25000, 1.25); },
            },
            effect(){
                let rating = hugeEffect(100 * syndicate('spc_eris'), 0);
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().eris])}</div>`;
                if (global.space['digsite'] && global.space.digsite.count === 100){
                    desc = `<div>${loc(`space_lander_effect3`,[production('tank'),global.resource.Cipher.name])}</div>`;
                }
                return desc + `<div>${loc(`space_digsite_offense`,[rating])}</div>`;
            },
            s_type: 'eris',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('tank');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['tank','space']
                };
            }
        },
        digsite: {
            id: 'space-digsite',
            title(){ return loc('space_digsite_title'); },
            desc(){
                return `<div>${loc('space_digsite_title')}</div>`;
            },
            type: 'utility',
            reqs: { eris: 3 },
            path: ['truepath'],
            queue_complete(){ return 0; },
            cost: {},
            effect(){
                let control = global.space['digsite'] ? global.space.digsite.count : 0;
                return `<div>${loc(`space_crashed_ship_effect`,[control])}</div>`;
            },
            action(){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, enemy: 10000 },
                    p: ['digsite','space']
                };
            }
        },
    },
    spc_venus: {
        info: {
            name(){
                return planetName().venus;
            },
            desc(){
                // A blockade shuts down the planet
                let blockade = venusBlockade();
                if (blockade > 0){
                    return `<div class="has-text-danger">${loc('space_venus_info_desc_blockade',[blockade,planetName().venus])}</div><div>${loc('space_venus_info_desc',[planetName().venus])}</div>`;
                }
                // Show the traced syndicate guard at Venus.
                let guard = syndicateGuard().length;
                if (guard > 0){
                    return `<div class="has-text-danger">${loc('space_venus_info_desc_syndicate',[guard,planetName().venus])}</div><div>${loc('space_venus_info_desc',[planetName().venus])}</div>`;
                }
                if (global.tech['venus'] && global.tech.venus <= 2){
                    return `<div class="has-text-warning">${loc('space_venus_info_desc_not_scouted',[planetName().venus])}</div><div>${loc('space_venus_info_desc',[planetName().venus])}</div>`;
                }
                else {
                    return loc('space_venus_info_desc',[planetName().venus]);
                }
            },
            support: 'cloud_city',
            zone: 'inner',
            showDest(){
                return {r: true, l: venusReachable()};
            },
            syndicate(){ return false; },
            nav(){ return venusReachable(); }
        },
        cloud_city: {
            id: 'space-cloud_city',
            title(){ return loc('space_cloud_city_title'); },
            desc(){ return `<div>${loc('space_cloud_city_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            type: 'outpost',
            reqs: { venus: 4 },
            path: ['truepath'],
            // Nothing goes up while the horde holds the orbit. Every Venus structure should carry this.
            condition(){ return venusBlockade() === 0; },
            cost: {
                Money(r={}){ return spaceCostMultiplier('cloud_city', r.offset, 20000000, 1.28); },
                Aluminium(r={}){ return spaceCostMultiplier('cloud_city', r.offset, 5800000, 1.28); },
                Nano_Tube(r={}){ return spaceCostMultiplier('cloud_city', r.offset, 1200000, 1.28); },
                Stanene(r={}){ return spaceCostMultiplier('cloud_city', r.offset, 3500000, 1.28); },
                Aerographene(r={}){ return spaceCostMultiplier('cloud_city', r.offset, 500000, 1.28); }
            },
            effect(){
                return `<div>+${loc(`galaxy_alien2_support`,[this.support(),planetName().venus])}</div><div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
            },
            support(){ return 3; },
            powered(){ return powerCostMod(10); },
            action(){
                if (payCosts(this)){
                    if (global.tech.venus === 4){
                        global.tech.venus = 5;
                        beginTungstenSurvey();
                        drawTech();
                    }
                    incrementStruct('cloud_city');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['cloud_city','space']
                };
            }
        },
        descender: {
            id: 'space-descender',
            title(){ return loc('space_descender_title'); },
            desc(wiki){
                if (!global.space.hasOwnProperty('descender') || global.space.descender.count < 100 || wiki){
                    return `<div>${loc('space_descender_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                return `<div>${loc('space_descender_title')}</div><div class="has-text-special">${loc('space_support',[planetName().venus])}</div>`;
            },
            type: 'megaproject',
            reqs: { venus: 6, resettle: 15 },
            path: ['truepath'],
            condition(){ return venusBlockade() === 0; },
            queue_size: 5,
            queue_complete(){ return 100 - (global.space.hasOwnProperty('descender') ? global.space.descender.count : 0); },
            cost: {
                Money(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('descender') ? global.space.descender.count : 0)) < 100 ? 50000000 : 0; },
                Tungsten(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('descender') ? global.space.descender.count : 0)) < 100 ? 12000000 : 0; },
                Graphene(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('descender') ? global.space.descender.count : 0)) < 100 ? 8500000 : 0; },
                Nano_Tube(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('descender') ? global.space.descender.count : 0)) < 100 ? 9000000 : 0; },
                Unobtainium(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('descender') ? global.space.descender.count : 0)) < 100 ? 100000 : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.space.hasOwnProperty('descender') ? global.space.descender.count : 0);
                if (count < 100){
                    return `<div>${loc('space_descender_effect',[loc('space_cloud_city_title')])}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[100 - count])}</div>`;
                }
                else {
                    let desc =  `<div>${loc('space_descender_effect',[loc('space_cloud_city_title')])}</div>`
                    desc += `<div class="has-text-caution">${loc('space_used_support_more',[-this.support(),planetName().venus])}</div>`;
                    if (this.powered() > 0){
                        desc += `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
                    }
                    return desc;
                }                
            },
            s_type: 'venus',
            support(){ return -3; },
            powered(){
                let cost = 5000 - (support_on['nitrogen_harvester'] || 0) * actions.space.spc_venus.nitrogen_harvester.cooling();
                if (cost < 0){ cost = 0; }
                return powerCostMod(cost);
            },
            // Half a tether is not a thing you can switch on, so there is nothing to offer until fully constructed
            switchable(){ return global.space.hasOwnProperty('descender') && global.space.descender.count >= 100; },
            operating(){
                if (!global.space.hasOwnProperty('descender') || global.space.descender.count < 100){ return false; }
                return getStructNumActive(this) > 0;
            },
            on_cap(){ return global.space.hasOwnProperty('descender') && global.space.descender.count >= 100 ? 1 : 0; },
            action(){
                if (global.space.hasOwnProperty('descender') && global.space.descender.count >= 100){ return false; }
                if (payCosts(this)){
                    incrementStruct(this);
                    if (global.space.descender.count >= 100){
                        global.tech.resettle = 16;
                        global.space.descender.on = 1;
                        initStruct(actions.space.spc_venus.alien_facility);
                        messageQueue(loc('space_descender_complete',[planetName().venus]),'success',false,['progress']);
                        drawTech();
                        renderSpace();
                        clearPopper();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['descender','space']
                };
            }
        },
        nitrogen_harvester: {
            id: 'space-nitrogen_harvester',
            title(){ return loc('space_nitrogen_harvester_title'); },
            desc(){ return `<div>${loc('space_nitrogen_harvester_title')}</div><div class="has-text-special">${loc('space_support',[planetName().venus])}</div>`; },
            type: 'mining',
            reqs: { venus: 7 },
            path: ['truepath'],
            condition(){ return venusBlockade() === 0; },
            cost: {
                Money(r={}){ return spaceCostMultiplier('nitrogen_harvester', r.offset, 42000000, 1.24); },
                Coal(r={}){ return spaceCostMultiplier('nitrogen_harvester', r.offset, 5000000, 1.24); },
                Polymer(r={}){ return spaceCostMultiplier('nitrogen_harvester', r.offset, 9500000, 1.24); },
                Sheet_Metal(r={}){ return spaceCostMultiplier('nitrogen_harvester', r.offset, 1250000, 1.24); }
            },
            effect(){
                let desc = `<div>${loc('produce',[+(production('nitrogen_harvester','food')).toFixed(2),global.resource.Food.name])}</div>`;
                if (!global.race['kindling_kindred'] && !global.race['smoldering']){
                    desc = desc + `<div>${loc('produce',[+(production('nitrogen_harvester','lumber')).toFixed(2),global.resource.Lumber.name])}</div>`;
                }
                desc += `<div>${loc('space_nitrogen_harvester_effect',[this.cooling(),loc('space_descender_title')])}</div>`;
                desc += `<div class="has-text-caution">${loc('space_used_support',[planetName().venus])}</div>`;
                return desc;
            },
            s_type: 'venus',
            support(){ return -1; },
            powered(){ return 0; },
            // What one running harvester takes off the descender's draw.
            cooling(){ return hugeAdjust(500); },
            action(){
                if (payCosts(this)){
                    incrementStruct(this);
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['nitrogen_harvester','space']
                };
            }
        },
        alien_facility: {
            id: 'space-alien_facility',
            title(){ return loc('space_alien_facility_title'); },
            desc(){ return `<div>${loc('space_alien_facility_title')}</div><div class="has-text-special">${loc('space_alien_facility_req',[loc('space_descender_title')])}</div>`; },
            type: 'science',
            reqs: { resettle: 16 },
            path: ['truepath'],
            cost: {},
            queue_complete(){ return 0; },
            researchDivisor(){ return 40; },
            researchTotal(){ return 10800; },
            studying(){
                if (!global.space['alien_facility']){ return false; }
                return actions.space.spc_venus.descender.operating();
            },
            progress(){
                if (!global.space['alien_facility']){ return 0; }
                let pct = global.space.alien_facility.research / this.researchTotal() * 100;
                if (pct > 100){ pct = 100; }
                return +(pct).toFixed(2);
            },
            uplinkKnowledge(){ return 50; },
            uplinked(){ return global.tech['resettle'] && global.tech.resettle >= 18 ? true : false; },
            effect(){
                let desc = `<div>${loc('space_alien_facility_effect',[this.progress()])}</div>`;
                if (this.uplinked()){
                    desc += `<div>${loc('space_alien_facility_university',[this.uplinkKnowledge(),loc('space_university_title')])}</div>`;
                }
                if (!this.studying()){
                    desc += `<div class="has-text-warning">${loc('space_alien_facility_stalled',[loc('space_descender_title')])}</div>`;
                }
                return desc;
            },
            action(){ return false; },
            struct(){
                return {
                    d: { count: 1, research: 0 },
                    p: ['alien_facility','space']
                };
            }
        },
        cloud_quarters: {
            id: 'space-cloud_quarters',
            title(){ return loc('space_cloud_quarters_title'); },
            desc(){ return `<div>${loc('space_cloud_quarters_title')}</div><div class="has-text-special">${loc('space_support',[planetName().venus])}</div>`; },
            type: 'housing',
            reqs: { venus: 8 },
            path: ['truepath'],
            condition(){ return venusBlockade() === 0; },
            cost: {
                Money(r={}){ return spaceCostMultiplier('cloud_quarters', r.offset, 222000000, 1.24); },
                Furs(r={}){ return spaceCostMultiplier('cloud_quarters', r.offset, 12800000, 1.24); },
                Copper(r={}){ return spaceCostMultiplier('cloud_quarters', r.offset, 30000000, 1.24); },
                Alloy(r={}){ return spaceCostMultiplier('cloud_quarters', r.offset, 22000000, 1.24); },
                Horseshoe(){ return global.race['hooved'] ? 2 : 0; }
            },
            effect(){
                let desc = `<div>${loc('plus_max_resource',[this.citizens(),loc('citizen')])}</div>`;
                desc += `<div class="has-text-caution">${loc('space_used_support',[planetName().venus])}</div>`;
                return desc;
            },
            s_type: 'venus',
            support(){ return -1; },
            powered(){ return 0; },
            citizens(){
                let gain = 4;
                if (global.race['high_pop']){
                    gain *= traits.high_pop.vars()[0];
                }
                return global.race['lone_survivor'] ? 0 : gain;
            },
            action(){
                if (payCosts(this)){
                    incrementStruct(this);
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['cloud_quarters','space']
                };
            }
        },
        industrial_complex: {
            id: 'space-industrial_complex',
            title(){ return loc('space_industrial_complex_title'); },
            desc(){ return `<div>${loc('space_industrial_complex_title')}</div><div class="has-text-special">${loc('space_industrial_complex_req',[loc('space_descender_title'),planetName().venus])}</div>`; },
            type: 'industry',
            reqs: { venus: 9 },
            path: ['truepath'],
            condition(){ return venusBlockade() === 0; },
            cost: {
                Money(r={}){ return spaceCostMultiplier('industrial_complex', r.offset, 268000000, 1.26); },
                Titanium(r={}){ return spaceCostMultiplier('industrial_complex', r.offset, 24500000, 1.26); },
                Tungsten(r={}){ return spaceCostMultiplier('industrial_complex', r.offset, 39000000, 1.26); },
                Bolognium(r={}){ return spaceCostMultiplier('industrial_complex', r.offset, 8800000, 1.26); },
                Elerium(r={}){ return spaceCostMultiplier('industrial_complex', r.offset, 25000, 1.26); }
            },
            effect(){
                let desc = `<div>${loc('space_industrial_complex_effect',[this.lines()])}</div>`;
                desc += `<div>${loc('plus_max_resource',[jobScale(this.technicians()),loc('job_technician')])}</div>`;
                desc += `<div class="has-text-caution">${loc('space_used_support',[planetName().venus])}</div>`;
                if (!actions.space.spc_venus.descender.operating()){
                    desc += `<div class="has-text-warning">${loc('space_industrial_complex_stalled',[loc('space_descender_title')])}</div>`;
                }
                return desc;
            },
            s_type: 'venus',
            support(){ return -1; },
            powered(){ return 0; },
            special: true,
            lines(){ return 2; },
            technicians(){ return 2; },
            action(){
                if (payCosts(this)){
                    incrementStruct(this);
                    powerOnNewStruct(this);
                    if (!global.civic.technician.display){
                        global.civic.technician.display = true;
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['industrial_complex','space']
                };
            }
        },
        workshop: {
            id: 'space-workshop',
            title(){ return loc('space_workshop_title'); },
            desc(){ return `<div>${loc('space_workshop_title')}</div><div class="has-text-special">${loc('space_industrial_complex_req',[loc('space_descender_title'),planetName().venus])}</div>`; },
            type: 'industry',
            reqs: { venus: 10 },
            path: ['truepath'],
            condition(){ return venusBlockade() === 0; },
            cost: {
                Money(r={}){ return spaceCostMultiplier('workshop', r.offset, 99000000, 1.26); },
                Lumber(r={}){ return spaceCostMultiplier('workshop', r.offset, 63000000, 1.26); },
                Aerographene(r={}){ return spaceCostMultiplier('workshop', r.offset, 3400000, 1.26); },
                Orichalcum(r={}){ return spaceCostMultiplier('workshop', r.offset, 9200000, 1.26); }
            },
            effect(){
                let desc = `<div>${loc('plus_max_resource',[jobScale(this.crafters()),loc('job_craftsman')])}</div>`;
                desc += `<div>${loc('space_workshop_effect',[+(this.crafting()).toFixed(1),loc('space_industrial_complex_title')])}</div>`;
                desc += `<div class="has-text-caution">${loc('space_used_support',[planetName().venus])}</div>`;
                if (!actions.space.spc_venus.descender.operating()){
                    desc += `<div class="has-text-warning">${loc('space_industrial_complex_stalled',[loc('space_descender_title')])}</div>`;
                }
                return desc;
            },
            s_type: 'venus',
            support(){ return -1; },
            powered(){ return 0; },
            crafters(){ return 3; },
            crafting(){ return hugeAdjust(20); },
            action(){
                if (payCosts(this)){
                    incrementStruct(this);
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['workshop','space']
                };
            }
        },
        university: {
            id: 'space-university',
            title(){ return loc('space_university_title'); },
            desc(){ return `<div>${loc('space_university_title')}</div><div class="has-text-special">${loc('space_support',[planetName().venus])}</div>`; },
            type: 'science',
            reqs: { venus: 11 },
            path: ['truepath'],
            condition(){ return venusBlockade() === 0; },
            cost: {
                Money(r={}){ return spaceCostMultiplier('university', r.offset, 118000000, 1.26); },
                Knowledge(r={}){ return spaceCostMultiplier('university', r.offset, 2500000, 1.26); },
                Iron(r={}){ return spaceCostMultiplier('university', r.offset, 60000000, 1.26); },
                Plywood(r={}){ return spaceCostMultiplier('university', r.offset, 42000000, 1.26); }
            },
            effect(){
                let desc = `<div>${loc('space_university_effect',[this.knowledge().toLocaleString(),global.resource.Knowledge.name,job_data.professor.name()])}</div>`;
                desc += `<div>${loc('plus_max_resource',[jobScale(this.professors()),job_data.professor.name()])}</div>`;
                desc += `<div class="has-text-caution">${loc('space_used_support',[planetName().venus])}</div>`;
                return desc;
            },
            s_type: 'venus',
            support(){ return -1; },
            powered(){ return 0; },
            knowVal(){
                let profs = workerScale(global.civic.professor.workers,'professor');
                if (global.race['high_pop']){
                    profs = highPopAdjust(profs);
                }
                return this.knowledge() * profs;
            },
            professors(){ return 2; },
            knowledge(){
                let facility = actions.space.spc_venus.alien_facility;
                let val = 2222;
                if (facility.uplinked()){
                    val *= 1 + (facility.uplinkKnowledge() / 100);
                }
                return val;
            },
            action(){
                if (payCosts(this)){
                    incrementStruct(this);
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['university','space']
                };
            }
        }
    },
    // The moon that turns out to be worth landing on.
    spc_survey: {
        info: {
            name(){
                return surveyBody() ? planetName()[surveyBody()] : loc('survey_region_unknown');
            },
            desc(){
                let moon = surveyBody();
                if (!moon){ return loc('survey_region_unknown'); }
                return `<div>${loc(`space_${moon}_info_desc`,[planetName()[moon]])}</div><div class="has-text-success">${loc('survey_info_desc_rich',[global.resource.Tungsten.name])}</div>`;
            },
            zone: 'outer',
            showDest(){
                let show = surveyFound();
                return {r: show, l: show};
            },
            syndicate(){ return false; },
            nav(){ return surveyFound(); }
        },
        mineshaft: {
            id: 'space-mineshaft',
            title(){ return loc('space_mineshaft_title'); },
            desc(){
                let moon = surveyBody();
                return `<div>${loc('space_mineshaft_desc',[moon ? planetName()[moon] : loc('survey_region_unknown')])}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'mining',
            reqs: { survey: 2 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('mineshaft', r.offset, 15000000, 1.26); },
                Lumber(r={}){ return spaceCostMultiplier('mineshaft', r.offset, 18000000, 1.26); },
                Iron(r={}){ return spaceCostMultiplier('mineshaft', r.offset, 21750000, 1.26); },
            },
            effect(){
                let tungsten = +(production('mineshaft')).toFixed(3);
                return `<div>${loc('gain',[tungsten,global.resource.Tungsten.name])}</div><div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
            },
            powered(){ return powerCostMod(8); },
            action(){
                if (payCosts(this)){
                    incrementStruct(this);
                    powerOnNewStruct(this);
                    if (!global.resource.Tungsten.display){
                        global.resource.Tungsten.display = true;
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['mineshaft','space']
                };
            }
        },
        // Resorts is themed depending on location
        survey_resort: {
            id: 'space-survey_resort',
            title(){ return loc(`space_resort_${surveyTheme()}_title`); },
            desc(){ return `<div>${loc(`space_resort_${surveyTheme()}_title`)}</div><div class="has-text-special">${loc(`space_resort_${surveyTheme()}_desc`)}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            type: 'entertainment',
            category: 'commercial',
            reqs: { survey: 3 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('survey_resort', r.offset, 125000000, 1.28); },
                Food(r={}){ return spaceCostMultiplier('survey_resort', r.offset, global.race['artifical'] ? 0 : 5500000, 1.28); },
                Furs(r={}){ return spaceCostMultiplier('survey_resort', r.offset, 180000000, 1.28); },
                Water(r={}){ return spaceCostMultiplier('survey_resort', r.offset, 125000, 1.28); },
                Plywood(r={}){ return spaceCostMultiplier('survey_resort', r.offset, 3500000, 1.28); }
            },
            morale(){ return hugeAdjust(5); },
            effect(){
                return `<div>${loc('city_shrine_morale',[+(this.morale()).toFixed(1)])}</div><div>${loc('plus_max_resource',[jobScale(1),loc('job_entertainer')])}</div><div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
            },
            powered(){ return powerCostMod(5); },
            action(){
                if (payCosts(this)){
                    incrementStruct(this);
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['survey_resort','space']
                };
            }
        },
        survey_warehouse: {
            id: 'space-survey_warehouse',
            title(){ return loc('city_shed_title3'); },
            desc(){
                let moon = surveyBody();
                return `<div>${loc('space_survey_warehouse_desc',[moon ? planetName()[moon] : loc('survey_region_unknown')])}</div>`;
            },
            type: 'storage',
            reqs: { survey: 4 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('survey_warehouse', r.offset, 141000000, 1.28); },
                Cement(r={}){ return spaceCostMultiplier('survey_warehouse', r.offset, 3300000, 1.28); },
                Adamantite(r={}){ return spaceCostMultiplier('survey_warehouse', r.offset, 2250000, 1.28); }
            },
            wide: true,
            storage: {
                res(res){
                    let list = {
                        'Lumber': 680000,
                        'Stone': 680000,
                        'Furs': 552000,
                        'Copper': 551200,
                        'Iron': 564000,
                        'Aluminium': 546800,
                        'Cement': 507200,
                        'Coal': 258800,
                        'Steel': 254400,
                        'Titanium': 249600,
                        'Alloy': 130800,
                        'Polymer': 129000,
                        'Iridium': 160500,
                        'Chrysotile': 680000,
                        'Nano_Tube': 137200,
                        'Neutronium': 123840,
                        'Adamantite': 134320,
                        'Tungsten': 527600,
                        'Graphene': 135000,
                        'Stanene': 136000,
                        'Bolognium': 58000,
                        'Unobtainium': 10000,
                        'Uranium': 2700,
                        'Water': 150,
                        'Orichalcum': 25000
                    };
                    return res ? list[res] || 0 : list;
                },
                multiplier(wiki){
                    return tpStorageMultiplier('warehouse',false,wiki);
                }
            },
            effect(wiki){
                let storage = '<div class="aTable">';
                let multiplier = this.storage.multiplier(wiki);
                let list = this.storage.res();
                for (const res of Object.keys(list)){
                    if (global.resource[res].display){
                        let val = sizeApproximation(spatialReasoning(list[res] * multiplier),1);
                        storage += `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                storage += '</div>';
                return storage;
            },
            action(){
                if (payCosts(this)){
                    incrementStruct(this);
                    let multiplier = this.storage.multiplier();
                    let list = this.storage.res();
                    for (const res of Object.keys(list)){
                        if (global.resource[res].display){
                            global.resource[res].max += (spatialReasoning(list[res]) * multiplier);
                        }
                    };
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['survey_warehouse','space']
                };
            }
        },
        fort_knox: {
            id: 'space-fort_knox',
            title(){ return loc('space_fort_knox_title'); },
            desc(wiki){
                let moon = surveyBody();
                if (!global.space.hasOwnProperty('fort_knox') || global.space.fort_knox.count < 100 || wiki){
                    return `<div>${loc('space_fort_knox_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                return `<div>${loc('space_fort_knox_title')}</div>`;
            },
            type: 'megaproject',
            reqs: { survey: 5 },
            path: ['truepath'],
            queue_size: 5,
            queue_complete(){ return 100 - (global.space.hasOwnProperty('fort_knox') ? global.space.fort_knox.count : 0); },
            cost: {
                Money(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('fort_knox') ? global.space.fort_knox.count : 0)) < 100 ? 42000000 : 0; },
                Brick(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('fort_knox') ? global.space.fort_knox.count : 0)) < 100 ? 7500000 : 0; },
                Orichalcum(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('fort_knox') ? global.space.fort_knox.count : 0)) < 100 ? 2500000 : 0; },
                Cement(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('fort_knox') ? global.space.fort_knox.count : 0)) < 100 ? 12500000 : 0; },
                Neutronium(r={}){ return ((r.offset || 0) + (global.space.hasOwnProperty('fort_knox') ? global.space.fort_knox.count : 0)) < 100 ? 2600000 : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.space.hasOwnProperty('fort_knox') ? global.space.fort_knox.count : 0);
                if (count < 100){
                    return `<div class="has-text-special">${loc('space_dwarf_collider_effect2',[100 - count])}</div>`;
                }
                return `<div>${loc('plus_max_resource',[`\$${spatialReasoning(this.storage.res('Money') * this.storage.multiplier()).toLocaleString()}`,loc('resource_Money_name')])}</div><div>${loc('plus_max_resource',[this.soldiers(),loc('civics_garrison_soldiers')])}</div>`;
            },
            storage: {
                res(res){
                    let list = {
                        'Money': spatialReasoning(65000000)
                    };
                    return res ? (list[res] || 0) : list;
                },
                multiplier(wiki){
                    let mult = hugeAdjust(1);
                    if (global.tech['extra_vault']){
                        mult *= 1 + (global.tech.extra_vault * 0.1);
                    }
                    if (global.race['paranoid']){
                        mult *= 1 - (traits.paranoid.vars()[0] / 100);
                    }
                    if (global.race['hoarder']){
                        mult *= 1 + (traits.hoarder.vars()[0] / 100);
                    }
                    let fathom = fathomCheck('dracnid');
                    if (fathom > 0){
                        mult *= 1 + (traits.hoarder.vars(1)[0] / 100 * fathom);
                    }
                    if (global.race['inflation']){
                        mult *= 1 + (global.race.inflation / 125);
                    }
                    return mult;
                },
                count(){
                    // Only once the last segment is in; a part-built vault holds nothing.
                    return global.space.fort_knox?.count >= 100 ? 1 : 0;
                }
            },
            soldiers(){
                let troops = 20;
                if (global.tech['guard_station']){
                    troops += global.tech.guard_station * 2;
                }
                return jobScale(troops);
            },
            action(){
                if (global.space.hasOwnProperty('fort_knox') && global.space.fort_knox.count >= 100){ return false; }
                if (payCosts(this)){
                    incrementStruct(this);
                    if (global.space.fort_knox.count >= 100){
                        if (global.tech['survey'] && global.tech.survey < 6){
                            global.tech.survey = 6;
                        }
                        let moon = surveyBody();
                        drawTech();
                        renderSpace();
                        clearPopper();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['fort_knox','space']
                };
            }
        },
    },
};

// Which of the five moons to use for theming
export function surveyTheme(){
    return surveyFound() ? surveyBody() : 'europa';
}

// What the investigation turns up, and how far in. Checked in order, one rank per tick, so a long offline
// catch-up still walks the player through the findings rather than skipping to the end.
export const facilityFindings = [
    { r: 1, p: 5,   m: 'space_alien_facility_data1', v(){ return [planetName().home]; } },
    { r: 2, p: 15,  m: 'space_alien_facility_data2', v(){ return [races[global.race.species].name]; } },
    { r: 3, p: 30,  m: 'space_alien_facility_data3' },
    { r: 4, p: 50,  m: 'space_alien_facility_data4' },
    { r: 5, p: 75,  m: 'space_alien_facility_data5', v(){ return [planetName().home]; } },
    { r: 6, p: 100, m: 'space_alien_facility_data6' }
];

// places to look for Tungsten
const surveyMoons = ['titania','oberon','io','europa','callisto'];

function surveyState(){
    return global.space['survey'] || false;
}

// The bare moon name of the body that held the deposit ('io', 'europa', …), or false while the search
// is still running. Everything spc_survey shows about itself comes from this.
export function surveyBody(){
    let s = surveyState();
    return s && s.rich ? s.rich : false;
}

// Whether the deposit has actually been found, which is what makes spc_survey a real place.
function surveyFound(){
    return global.tech['survey'] && global.tech.survey >= 2 && surveyBody() ? true : false;
}

// spc_survey has no entry of its own in the position table — it stands in for a real moon, and which one is not
// known until the roll.
export function resolveBody(locationName){
    if (locationName === 'spc_survey'){
        let moon = surveyBody();
        return moon ? `spc_${moon}` : locationName;
    }
    return locationName;
}

// Moon survey canadidates
function surveyPoint(moon){
    return `survey_${moon}`;
}

// Opened by the first cloud city: the descent problem becomes concrete, and the search for the metal
// that solves it begins. The roll is made once and kept, so reloading cannot reshuffle the answer.
export function beginTungstenSurvey(){
    if (global.tech['survey']){ return; }
    global.tech['survey'] = 1;
    global.space['survey'] = {
        rich: surveyMoons[Math.floor(seededRandom(0,surveyMoons.length,true))],
        done: {}
    };

    // Each candidate becomes a destination on the moon itself, carried in `b` so the point orbits
    // with it. The x/y/z is only where it stood the day the survey opened, kept as a fallback.
    if (!global.race['tempCoordinates']){ global.race['tempCoordinates'] = {}; }
    surveyMoons.forEach(function(moon){
        let c = genXYZcoord(`spc_${moon}`);
        global.race.tempCoordinates[surveyPoint(moon)] = {
            n: planetName()[moon], a: true, s: 'spc_sun', b: `spc_${moon}`, x: c.x, y: c.y, z: c.z
        };
    });

    messageQueue(loc('survey_begin',[global.resource.Tungsten.name,loc('outer_shipyard_sensor_quantum')]),'info',false,['progress']);
    renderSpace();
    drawShipYard();
}

// Strike a candidate off: the point stays in the table so a ship parked on it can still say where it
// is, but it stops being somewhere you can be sent.
function closeSurveyPoint(moon){
    let point = global.race['tempCoordinates'] ? global.race.tempCoordinates[surveyPoint(moon)] : false;
    if (point){ point.a = false; }
}

// Survey moon for Tungsten
function repairSurveyPoints(){
    let s = surveyState();
    if (!s || !s.rich){ return; }

    if (s.rich.startsWith('spc_')){
        s.rich = s.rich.substring(4);
        let done = {};
        Object.keys(s.done).forEach(function(key){
            done[key.startsWith('spc_') ? key.substring(4) : key] = s.done[key];
        });
        s.done = done;
    }

    if (!global.race['tempCoordinates']){ return; }
    // A survey opened before the points learned to track their moon has no `b`, so it is still aimed
    // at a spot the moon has since left. Give it one.
    surveyMoons.forEach(function(moon){
        let point = global.race.tempCoordinates[surveyPoint(moon)];
        if (point && !point.b){ point.b = `spc_${moon}`; }
    });
    surveyMoons.forEach(function(moon){
        let stale = `survey_spc_${moon}`;
        if (!global.race.tempCoordinates.hasOwnProperty(stale)){ return; }
        let old = global.race.tempCoordinates[stale];
        let key = surveyPoint(moon);
        if (!global.race.tempCoordinates.hasOwnProperty(key)){
            let c = genXYZcoord(`spc_${moon}`);
            global.race.tempCoordinates[key] = {
                n: planetName()[moon], a: old.a && !s.done[moon], s: 'spc_sun', b: `spc_${moon}`, x: c.x, y: c.y, z: c.z
            };
        }
        // A ship parked on the bad point keeps somewhere to be — named, so it does not read as
        // undefined — but it is no longer offered as a destination. Otherwise the point simply goes.
        if (allShips().some(ship => shipDockedAt(ship) === stale)){
            old.n = planetName()[moon];
            old.a = false;
        }
        else {
            delete global.race.tempCoordinates[stale];
        }
    });
}

export function checkTungstenSurvey(){
    if (!global.tech['survey']){ return; }
    repairSurveyPoints();
    if (global.tech.survey !== 1){ return; }
    let s = surveyState();
    if (!s){ return; }

    for (let moon of surveyMoons){
        if (s.done[moon]){ continue; }
        let point = surveyPoint(moon);
        if (!allShips().some(ship => shipDockedAt(ship) === point && ship.sensor === 'quantum')){ continue; }

        s.done[moon] = true;
        if (moon === s.rich){
            // Found. Everything still on the list is struck off with it; there is no reason to go and
            // look at the rest, and leaving them open would only invite wasted trips.
            global.tech['survey'] = 2;
            surveyMoons.forEach(function(m){
                s.done[m] = true;
                closeSurveyPoint(m);
            });
            global.settings.space['survey'] = true;
            messageQueue(loc('survey_rich',[planetName()[moon],global.resource.Tungsten.name]),'success',false,['progress']);
            renderSpace();
            drawShipYard();
            return;
        }

        closeSurveyPoint(moon);
        messageQueue(loc('survey_poor',[planetName()[moon]]),'info',false,['progress']);
        renderSpace();
        drawShipYard();
    }
}

export const tauCetiModules = {
    tau_star: {
        info: {
            name(){
                return loc('tab_tauceti');
            },
            desc(){
                return loc('tau_star',[loc('tab_tauceti'),loc('space_sun_info_name')]);
            },
            nav(){ return false; }
        },
        ringworld: {
            id: 'tauceti-ringworld',
            title(){ return loc('tau_star_ringworld'); },
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('ringworld') || global.tauceti.ringworld.count < 1000 || wiki){
                    return `<div>${loc('tau_star_ringworld')}</div><div class="has-text-special">${loc('requires_segments',[1000])}</div>`;
                }
                else {
                    return `<div>${loc('tau_star_ringworld')}</div>`;
                }
            },
            type: 'megaproject',
            reqs: { matrix: 2 },
            path: ['truepath'],
            queue_size: 50,
            queue_complete(){ return 1000 - global.tauceti.ringworld.count; },
            cost: {
                Money(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? (global.race['lone_survivor'] ? 10000000 : 100000000) : 0; },
                Neutronium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? (global.race['lone_survivor'] ? 20000 : 100000) : 0; },
                Nano_Tube(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? (global.race['lone_survivor'] ? 70000 : 350000) : 0; },
                Adamantite(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? (global.race['lone_survivor'] ? 200000 : 1000000) : 0; },
                Bolognium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? (global.race['lone_survivor'] ? 17600 : 88000) : 0; },
                Orichalcum(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? (global.race['lone_survivor'] ? 25000 : 125000) : 0; },
                Unobtainium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? (global.race['lone_survivor'] ? 360 : 1800) : 0; },
                Quantium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0)) < 1000 ? wom_recycle(global.race['lone_survivor'] ? 10100 : 101000) : 0; },
            },
            effect(wiki){
                let effectText = '';
                let count = (wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('ringworld') ? global.tauceti.ringworld.count : 0);
                if (count < 1000){
                    let remain = 1000 - count;
                    effectText += `<div>${loc('tau_star_ringworld_effect')}</div>`;
                    effectText += `<div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    effectText += `<div class="has-text-special">${loc('space_dwarf_reactor_effect1',[global.race['lone_survivor'] ? 100 : 10000])}</div>`;
                }
                return effectText;
            },
            action(){
                if (payCosts(this)){
                    if (global.tauceti.ringworld.count < 1000){
                        incrementStruct('ringworld','tauceti');
                        if (global.tauceti.ringworld.count >= 1000){
                            if (global.race['lone_survivor']){
                                global.tech['eden'] = 1;
                            }
                            else {
                                global.tech.matrix = 3;
                                global.tauceti['matrix'] = { count: 1, on: 0 };
                            }
                            drawTech();
                            renderTauCeti();
                            clearPopper();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['ringworld','tauceti']
                };
            }
        },
        server_farm: {
            id: 'tauceti-server_farm',
            title(){ return loc('tau_star_server_farm'); },
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('server_farm') || global.tauceti.server_farm.count < 100 || wiki){
                    return `<div>${loc('tau_star_server_farm')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                return `<div>${loc('tau_star_server_farm')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'megaproject',
            reqs: { shadow: 1 },
            path: ['truepath'],
            queue_size: 5,
            queue_complete(){ return 100 - (global.tauceti.hasOwnProperty('server_farm') ? global.tauceti.server_farm.count : 0); },
            cost: {
                Money(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('server_farm') ? global.tauceti.server_farm.count : 0)) < 100 ? 150000000 : 0; },
                Copper(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('server_farm') ? global.tauceti.server_farm.count : 0)) < 100 ? 80000000 : 0; },
                Polymer(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('server_farm') ? global.tauceti.server_farm.count : 0)) < 100 ? 6000000 : 0; },
                Graphene(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('server_farm') ? global.tauceti.server_farm.count : 0)) < 100 ? 1250000 : 0; },
                Orichalcum(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('server_farm') ? global.tauceti.server_farm.count : 0)) < 100 ? 750000 : 0; },
                Quantium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('server_farm') ? global.tauceti.server_farm.count : 0)) < 100 ? wom_recycle(750000) : 0; }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('server_farm') ? global.tauceti.server_farm.count : 0);
                if (count < 100){
                    return `<div class="has-text-special">${loc('space_dwarf_collider_effect2',[100 - count])}</div>`;
                }
                let effectText = `<div>${loc('plus_max_resource',['50%',global.resource.Knowledge.name])}</div>`;
                if (global.resource.Positronium.display){
                    let store = Math.floor(global.resource.Knowledge.max / 1000);
                    effectText += `<div>${loc('plus_max_resource',[store.toLocaleString(),global.resource.Positronium.name])}</div>`;
                }
                if (global.tech['shadow'] && global.tech.shadow >= 4){
                    effectText += `<div>${loc('produce',[0.025,global.resource.Cipher.name])}</div>`;
                }
                return effectText + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
            },
            powered(){ return 7500; },
            switchable(){ return global.tauceti.hasOwnProperty('server_farm') && global.tauceti.server_farm.count >= 100; },
            operating(){
                if (!global.tauceti.hasOwnProperty('server_farm') || global.tauceti.server_farm.count < 100){ return false; }
                return getStructNumActive(this) > 0;
            },
            on_cap(){ return global.tauceti.hasOwnProperty('server_farm') && global.tauceti.server_farm.count >= 100 ? 1 : 0; },
            action(){
                if (global.tauceti.hasOwnProperty('server_farm') && global.tauceti.server_farm.count >= 100){ return false; }
                if (payCosts(this)){
                    incrementStruct(this);
                    if (global.tauceti.server_farm.count >= 100){
                        global.tauceti.server_farm.on = 1;
                        messageQueue(loc('tau_star_server_farm_complete'),'success',false,['progress']);
                        drawTech();
                        renderTauCeti();
                        clearPopper();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['server_farm','tauceti']
                };
            }
        },
        matrix: {
            id: 'tauceti-matrix',
            title(){ return loc('tau_star_matrix'); },
            desc(){ return `<div>${loc('tau_star_matrix')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { matrix: 3 },
            condition(){
                return global.tauceti.ringworld.count >= 1000 ? true : false;
            },
            queue_complete(){ return 0; },
            cost: {},
            powered(){ return 10000; },
            postPower(o){
                if (o && p_on['matrix']){
                    // Powered on and energized
                    global.tech.matrix = 4;
                    renderTauCeti();
                }
                else {
                    if (global.tech.matrix > 3){
                        // Disabled or lost power
                        global.tech.matrix = 3;
                        renderTauCeti();
                    }
                    if (o){
                        // Not powered yet, check again soon
                        return true;
                    }
                }
            },
            effect(){
                let reward = matrixProjection();
                let power = this.powered();
                let power_label = power > 0 ? `<div class="has-text-caution">${loc('minus_power',[power])}</div>` : '';
                return `<div>${loc('tau_star_matrix_effect')}</div>${reward}${power_label}`;
            },
            action(){
                return false;
            }
        },
        blue_pill: {
            id: 'tauceti-blue_pill',
            title(){ return loc('tau_star_blue_pill'); },
            desc(){ return loc('tau_star_blue_pill'); },
            wiki: false,
            reqs: { matrix: 4 },
            queue_complete(){ return 0; },
            no_multi: true,
            cost: {},
            effect(){
                let reward = matrixProjection();
                return `<div>${loc('tau_star_blue_pill_effect')}</div>${reward}`;
            },
            action(){
                if (payCosts(this)){
                    $(`body`).append(`<canvas id="matrix" class="font-overlay"/>`);
                    const canvas = document.getElementById('matrix');
                    const ctx = canvas.getContext('2d');
                    const w = canvas.width = document.body.offsetWidth;
                    const h = canvas.height = document.body.offsetHeight;
                    const cols = Math.floor(w / 20) + 1;
                    const ypos = Array(cols).fill(0);

                    function pill() {
                        ctx.fillStyle = '#0001';
                        ctx.fillRect(0, 0, w, h);
                        ctx.fillStyle = '#0f0';
                        ctx.font = '15pt monospace';
                        ypos.forEach((y, ind) => {
                            const text = String.fromCharCode(Math.rand(0xFF66, 0xFF9E));//String.fromCharCode(Math.random() * 128);
                            const x = ind * 20;
                            ctx.fillText(text, x, y);
                            if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
                            else ypos[ind] = y + 20;
                        });
                    }

                    setInterval(pill, 50);
                    setTimeout(function(){
                        matrix();
                    }, 5000);

                    return true;
                }
                return false;
            }
        },
        goe_facility: {
            id: 'tauceti-goe_facility',
            title(){ return loc('tau_star_goe_facility'); },
            desc(){ return `<div>${loc('tau_star_goe_facility')}</div>`; },
            type: 'megaproject',
            reqs: { eden: 2 },
            condition(){
                return global.tauceti.ringworld.count >= 1000 ? true : false;
            },
            queue_complete(){ return 0; },
            cost: {
                Money(o){ return 1000000; },
                Copper(o){ return 10000000; },
                Graphene(o){ return 5000000; },
                Stanene(o){ return 8000000; },
                Elerium(o){ return 10000; },
            },
            effect(){
                let reward = edenProjection();
                return `<div>${loc('tau_star_goe_facility_effect')}</div>${reward}`;
            },
            action(){
                if (payCosts(this)){
                    let costs = adjustCosts(tauCetiModules.tau_star.goe_facility);
                    Object.keys(costs).forEach(function(res){
                        global.resource[res].amount += costs[res]();
                    });
                    gardenOfEden();
                    return false;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['goe_facility','tauceti']
                };
            }
        },
    },
    tau_home: {
        info: {
            name(){
                return loc('tau_planet',[races[global.race.species].home]);
            },
            desc(){
                return loc('tau_home',[races[global.race.species].home]);
            },
            nav(){ return global.tech['resettle'] || global.tech['shadow'] && global.tech.shadow >= 4 ? true : false; },
            support: 'orbital_station',
            extra(region){
                if (global.tech['tau_home'] && global.tech.tau_home >= 2 && !tauEnabled()){
                    $(`#${region}`).append(`<div id="${region}Mats" v-show="tauShow()" class="syndThreat has-text-warning">${loc('resource_Materials_name')} <span class="has-text-info">{{ locale(round(amount)) }}</span> / <span class="has-text-info">{{ locale(round(max)) }}</span></div>`);
                    vBind({
                        el: `#${region}Mats`,
                        data: global.resource.Materials,
                        methods: {
                            tauShow(){
                                return !tauEnabled();
                            },
                            round(v){
                                return +v.toFixed(0);
                            },
                            locale(v){
                                return v.toLocaleString();
                            }
                        }
                    });
                }
            }
        },
        home_mission: {
            id: 'tauceti-home_mission',
            title(){ return loc('tau_new_mission_title',[races[global.race.species].home]); },
            desc(){ return loc('tau_new_mission_title',[races[global.race.species].home]); },
            reqs: { tauceti: 2 },
            grant: ['tau_home',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_home >= 1 ? 0 : 1; },
            cost: {
                Money(){ return 1000000000; }
            },
            effect(){ return loc('tau_new_mission_effect',[races[global.race.species].home]); },
            action(){
                if (payCosts(this)){
                    initStruct(tauCetiModules.tau_home.colony);
                    initStruct(tauCetiModules.tau_home.mining_pit);
                    messageQueue(loc('tau_home_mission_result',[races[global.race.species].home]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        dismantle: {
            id: 'tauceti-dismantle',
            title(){ return loc('tau_home_dismantle'); },
            desc(){ return loc('tau_home_dismantle'); },
            reqs: { tau_home: 1 },
            grant: ['tau_home',2],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_home >= 2 ? 0 : 1; },
            cost: {
                Money(){ return 100000000; }
            },
            effect(){
                let explorer = 'Explorer';
                if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                    let shipId = global.space.shipyard.ships.findIndex(x => shipDockedAt(x) === 'tauceti' && x.class === 'explorer');
                    if (shipId !== -1){
                        explorer = global.space.shipyard.ships[shipId].name;
                    }
                }
                return loc('tau_home_dismantle_effect',[explorer]);
            },
            action(){
                let shipId = -1;
                if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                    shipId = global.space.shipyard.ships.findIndex(x => shipDockedAt(x) === 'tauceti' && x.class === 'explorer');
                }
                if (shipId >= 0 && payCosts(this)){
                    global.space.shipyard.ships.splice(shipId,1);
                    incrementStruct('orbital_station','tauceti');
                    incrementStruct('colony','tauceti');
                    incrementStruct('mining_pit','tauceti');
                    global.civic.pit_miner.display = true;
                    global.resource.Materials.display = true;
                    if (powerOnNewStruct($(tauCetiModules.tau_home.orbital_station)[0])){
                        global.tauceti.colony.on++;
                        global.tauceti.mining_pit.on++;

                        let hiredMax = $(tauCetiModules.tau_home.mining_pit)[0].workers();
                        global.civic.pit_miner.max += hiredMax;

                        let hired = Math.min(hiredMax, global.civic[global.civic.d_job].workers);
                        global.civic[global.civic.d_job].workers -= hired;
                        global.civic.pit_miner.workers += hired;
                        global.civic.pit_miner.assigned = (global.civic.pit_miner.assigned || 0) + hired;
                    }
                    drawShips();
                    return true;
                }
                return false;
            }
        },
        orbital_station: {
            id: 'tauceti-orbital_station',
            title(){ return loc('tau_home_orbital_station'); },
            desc(){ return `<div>${loc('tau_home_orbital_station')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            type: 'outpost',
            reqs: { tau_home: 2 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('orbital_station', r.offset, 80000000, 1.3, 'tauceti'); },
                Materials(r={}){ return tauEnabled() ? 0 : spaceCostMultiplier('orbital_station', r.offset, 500000, 1.3, 'tauceti'); },
                Helium_3(r={}){ return tauEnabled() ? spaceCostMultiplier('orbital_station', r.offset, int_fuel_adjust(250000), 1.3, 'tauceti') : 0; },
                Copper(r={}){ return tauEnabled() ? spaceCostMultiplier('orbital_station', r.offset, 1250000, 1.3, 'tauceti') : 0; },
                Adamantite(r={}){ return tauEnabled() ? spaceCostMultiplier('orbital_station', r.offset, 900000, 1.3, 'tauceti') : 0; },
            },
            effect(){
                let helium = spatialReasoning(this.storage.res('Helium_3') * this.storage.multiplier());
                let fuel = +int_fuel_adjust(this.support_fuel().a).toFixed(1);
                let desc = `<div>${loc('space_red_spaceport_effect1',[loc('tau_planet',[races[global.race.species].home]),this.support()])}</div>`;
                desc += `<div>${loc('plus_max_resource',[helium.toLocaleString(),global.resource.Helium_3.name])}</div>`;
                if (global.race.universe === 'evil' && (global.race['lone_survivor'] || global.tech['isolation'])){
                    desc += `<div>${loc('plus_max_resource',[hugeEffect(1),global.resource.Authority.name])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('spend_power',[fuel,global.resource[this.support_fuel().r].name,this.powered()])}</div>`;
                return desc;
            },
            support_fuel(){ return { r: 'Helium_3', a: hugeAdjust(global.tech['isolation'] ? (global.race['lone_survivor'] ? 5 : 25) : 400) }; },
            support(){ return 3; },
            powered(){ return powerCostMod(global.tech['isolation'] ? (global.race['lone_survivor'] ? 4 : 6) : 30); },
            refresh: true,
            storage: {
                res(res){
                    let list = {
                        'Helium_3': 15000
                    };
                    return res ? (list[res] || 0) : list;
                },
                multiplier(wiki){
                    return 1;
                },
                count(){
                    return p_on['orbital_station'] || 0;
                }
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('orbital_station','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['orbital_station','tauceti']
                };
            }
        },
        colony: {
            id: 'tauceti-colony',
            title(){ return loc('tau_home_colony'); },
            desc(){
                return `<div>${loc('tau_home_colony_desc',[races[global.race.species].home])}</div><div class="has-text-special">${loc('requires_power_support_combo',[races[global.race.species].home,global.resource.Food.name])}</div>`;
            },
            type: 'housing',
            reqs: { tau_home: 2 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('colony', r.offset, 15750000, 1.225, 'tauceti'); },
                Materials(r={}){ return tauEnabled() ? 0 : spaceCostMultiplier('colony', r.offset, 650000, 1.225, 'tauceti'); },
                Furs(r={}){ return tauEnabled() ? spaceCostMultiplier('colony', r.offset, 720000, 1.225, 'tauceti') : 0; },
                Graphene(r={}){ return tauEnabled() ? spaceCostMultiplier('colony', r.offset, 485000, 1.225, 'tauceti') : 0; },
                Brick(r={}){ return tauEnabled() ? spaceCostMultiplier('colony', r.offset, wom_recycle(880000), 1.225, 'tauceti') : 0; },
            },
            effect(){
                let pop = this.citizens();
                let containers = global.tech['isolation'] ? 900 : 250;
                let fuel = +(this.support_fuel().a).toFixed(1);
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[this.support(), races[global.race.species].home])}</div>`;
                
                if (!global.race['lone_survivor']){
                    desc = desc + `<div>${loc('plus_max_citizens',[pop])}</div>`;
                }

                if (global.tech['isolation']){
                    let vault = spatialReasoning(this.storage.res('Money') * this.storage.multiplier());
                    desc += `<div>${loc('plus_max_resource',[`\$${vault.toLocaleString()}`,global.resource.Money.name])}</div>`;
                }

                desc += `<div>${loc('tau_home_colony_effect',[hugeEffect(50, 0),races[global.race.species].home])}</div>`;
                
                if (global.tech['isolation']){
                    let gasVal = govActive('gaslighter',0);
                    let mVal = ((gasVal || 0) + (global.tech.broadcast || 0)) * 2;
                    desc += `<div>${loc('space_red_vr_center_effect1',[hugeEffect(mVal)])}</div>`;
                }
                
                desc += `<div>${loc('plus_max_resource',[containers,global.resource.Crates.name])}</div><div>${loc('plus_max_resource',[containers,global.resource.Containers.name])}</div>`;

                if (global.race.universe === 'evil' && (global.race['lone_survivor'] || global.tech['isolation'])){
                    desc += `<div>${loc('plus_resource',[hugeEffect(5),global.resource.Authority.name])}</div>`;
                }

                if (global.race['lone_survivor']){
                    desc += `<div>${loc('gain',[-(fuel).toFixed(1),global.resource[this.support_fuel().r].name])}</div>`;
                }
                else {
                    desc += `<div class="has-text-caution">${loc('spend',[+(fuel).toFixed(0),global.resource[this.support_fuel().r].name])}</div>`;
                }
                return desc;
            },
            s_type: 'tau_home',
            support(){ return -2; },
            support_fuel(){ return { r: 'Food', a: hugeAdjust(global.tech['isolation'] ? (global.race['lone_survivor'] ? -2 : 75) : 1000) }; },
            powered(){ return 0; },
            storage: {
                res(res){
                    let list = {
                        'Money': bank_vault() * 25
                    };
                    if (!global.tech['isolation']){
                        delete list.Money;
                    }
                    return res ? (list[res] || 0) : list;
                },
                multiplier(wiki){
                    return 1;
                }
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('colony','tauceti');
                    powerOnNewStruct(this);
                    if (!global.resource.Containers.display){
                        unlockContainers();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['colony','tauceti']
                };
            },
            citizens(){
                let pop = global.tech['isolation'] ? 8 : 5;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return global.race['lone_survivor'] ? 0 : pop;
            }
        },
        tau_housing: {
            id: 'tauceti-tau_housing',
            title(){
                return housingLabel('small');
            },
            desc(){
                return this.citizens() === 1 ? loc('city_basic_housing_desc') : loc('city_basic_housing_desc_plural',[this.citizens()]);
            },
            type: 'housing',
            category: 'residential',
            reqs: { housing: 1, isolation: 1 },
            condition(){ return global.race['lone_survivor'] ? false : true; },
            cost: {
                Money(r={}){return spaceCostMultiplier('tau_housing', r.offset, 150000, 1.15, 'tauceti'); },
                Lumber(r={}){ return global.race['kindling_kindred'] || global.race['smoldering'] ? 0 : spaceCostMultiplier('tau_housing', r.offset, 125000, 1.25, 'tauceti'); },
                Stone(r={}){ return global.race['kindling_kindred'] ? spaceCostMultiplier('tau_housing', r.offset, 125000, 1.25, 'tauceti') : 0; },
                Chrysotile(r={}){ return global.race['smoldering'] ? spaceCostMultiplier('tau_housing', r.offset, 50000, 1.25, 'tauceti') : 0; },
                Horseshoe(){ return global.race['hooved'] ? 1 : 0; }
            },
            effect(){
                let pop = this.citizens();
                return global.race['sappy'] ? `<div>${loc('plus_max_resource',[pop,loc('citizen')])}</div><div>${loc('city_grove_effect',[hugeEffect(2.5)])}</div>` : loc('plus_max_resource',[pop,loc('citizen')]);
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('tau_housing','tauceti');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['tau_housing','tauceti']
                };
            },
            citizens(){
                let pop = 1;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            }
        },
        captive_housing: buildTemplate(`captive_housing`,'tauceti'),
        pylon: {
            id: 'tauceti-pylon',
            title(){ return loc('tau_home_pylon'); },
            desc(){ return loc('tau_home_pylon'); },
            type: 'religion',
            reqs: { magic: 2 },
            condition(){ return global.tech['isolation'] && global.tauceti.hasOwnProperty('pylon') ? true : false; },
            cost: {
                Money(r={}){ return spaceCostMultiplier('pylon', r.offset, 50, 1.48, 'tauceti'); },
                Stone(r={}){ return spaceCostMultiplier('pylon', r.offset, 100, 1.42, 'tauceti'); },
                Crystal(r={}){ return spaceCostMultiplier('pylon', r.offset, 8, 1.42, 'tauceti') - 3; }
            },
            effect(){
                let max = spatialReasoning(this.storage.res('Mana') * this.storage.multiplier());

                let mana = hugeEffect(0.0125 * darkEffect('magic'), 3);
                return `<div>${loc('gain',[mana,global.resource.Mana.name])}</div><div>${loc('plus_max_resource',[max,global.resource.Mana.name])}</div>`;
            },
            special(){ return global.tech['magic'] && global.tech.magic >= 3 ? true : false; },
            storage: {
                res(res){
                    let list = {
                        'Mana': 2
                    };
                    return res ? (list[res] || 0) : list;
                },
                multiplier(wiki){
                    return 1;
                }
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('pylon','tauceti');
                    global.resource.Mana.max += spatialReasoning(2);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['pylon','tauceti']
                };
            }
        },
        cloning_facility: {
            id: `tauceti-cloning_facility`,
            title(){ return loc('tau_home_cloning'); },
            desc(){ return loc('tau_home_cloning_desc',[races[global.race.species].name]); },
            type: 'housing',
            category: 'military',
            reqs: { cloning: 1 },
            path: ['truepath'],
            queue_complete(){ return global.resource[global.race.species].max - global.resource[global.race.species].amount; },
            cost: {
                Money(r={}){ return global['resource'][global.race.species].amount ? spaceCostMultiplier('citizen', r.offset, Math.round((global.race['high_pop'] ? 100000 : 125000) / jobScale(1)), global.race['high_pop'] ? 1.01 : 1.02, 'tauceti', global.race['high_pop'] ? 1.003 : 1.005) : 0; },
                Copper(r={}){ return !global.race['artifical'] || global.race['deconstructor'] ? 0 : global['resource'][global.race.species].amount >= 5 ? spaceCostMultiplier('citizen', r.offset, Math.round(50 / jobScale(1)), 1.01, 'tauceti', global.race['high_pop'] ? 1.0032 : 1.005) : 0; },
                Aluminium(r={}){ return !global.race['artifical'] || global.race['deconstructor'] ? 0 : global['resource'][global.race.species].amount >= 5 ? spaceCostMultiplier('citizen', r.offset, Math.round(50 / jobScale(1)), 1.01, 'tauceti', global.race['high_pop'] ? 1.0032 : 1.005) : 0; },
                Nanite(r={}){ return global.race['deconstructor'] ? (global['resource'][global.race.species].amount >= 3 ? spaceCostMultiplier('citizen', r.offset, Math.round(500 / jobScale(1)), 1.01, 'tauceti', global.race['high_pop'] ? 1.0032 : 1.005) : 0) : 0; },
            },
            effect(){
                let warn = '';
                if (global['resource'][global.race.species].max === global['resource'][global.race.species].amount){
                    warn = `<div class="has-text-caution">${loc('city_assembly_effect_warn')}</div>`;
                }
                return `<div>${loc('tau_home_cloning_effect',[races[global.race.species].name])}</div>${warn}`;
            },
            action(){
                if (global['resource'][global.race.species].max > global['resource'][global.race.species].amount && payCosts(this)){
                    global['resource'][global.race.species].amount++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['cloning_facility','tauceti']
                };
            }
        },
        horseshoe: buildTemplate(`horseshoe`,'tauceti'),
        bonfire: buildTemplate(`bonfire`,'tauceti'),
        firework: buildTemplate(`firework`,'tauceti'),
        assembly: buildTemplate(`assembly`,'tauceti'),
        nanite_factory: buildTemplate(`nanite_factory`,'tauceti'),
        tau_farm: {
            id: 'tauceti-tau_farm',
            title(){ return loc('tau_home_tau_farm'); },
            desc(){
                return `<div>${loc('tau_home_tau_farm')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'farming',
            reqs: { tau_home: 7 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('tau_farm', r.offset, 135000000, 1.25, 'tauceti'); },
                Stone(r={}){ return spaceCostMultiplier('tau_farm', r.offset, 9210000, 1.25, 'tauceti'); },
                Steel(r={}){ return spaceCostMultiplier('tau_farm', r.offset, 6295000, 1.25, 'tauceti'); },
                Water(r={}){ return spaceCostMultiplier('tau_farm', r.offset, 10000, 1.25, 'tauceti'); },
            },
            effect(){
                let desc = `<div>${loc('space_red_spaceport_effect1',[loc('tau_planet',[races[global.race.species].home]),this.support()])}</div>`;
                desc = desc + `<div>${loc('produce',[+(production('tau_farm','food')).toFixed(2),global.resource.Food.name])}</div>`;
                if (!global.race['kindling_kindred'] && !global.race['smoldering']){
                    desc = desc + `<div>${loc('produce',[+(production('tau_farm','lumber')).toFixed(2),global.resource.Lumber.name])}</div>`;
                }
                if (global.tech['isolation']){
                    let water = +(production('tau_farm','water')).toFixed(2);
                    desc = desc + `<div>${loc('produce',[water,global.resource.Water.name])}</div>`;
                    if (global.race['artifical']){
                        let sig_cap = spatialReasoning(this.storage.res('Food') * this.storage.multiplier());
                        desc = desc + `<div>${loc('city_transmitter_effect',[sig_cap])}</div>`;
                    }
                }
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
                return desc;
            },
            support(){ return 1; },
            s_type: 'tau_home',
            powered(){ return powerCostMod(global.tech['isolation'] ? 1 : 4); },
            storage: {
                res(res){
                    let list = {
                        'Food': 350
                    };
                    if (!global.race['artifical']){
                        delete list.Food;
                    }
                    return res ? (list[res] || 0) : list;
                },
                multiplier(wiki){
                    return 1;
                },
                count(){
                    return p_on['tau_farm'] || 0;
                }
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('tau_farm','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['tau_farm','tauceti']
                };
            }
        },
        mining_pit: {
            id: 'tauceti-mining_pit',
            title(){ return loc('tau_home_mining_pit'); },
            desc(){
                return `<div>${loc('tau_home_mining_pit')}</div><div class="has-text-special">${loc('space_support',[races[global.race.species].home])}</div>`;
            },
            type: 'mining',
            reqs: { tau_home: 2 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('mining_pit', r.offset, 4250000, 1.225, 'tauceti'); },
                Materials(r={}){ return tauEnabled() ? 0 : spaceCostMultiplier('mining_pit', r.offset, 350000, 1.225, 'tauceti'); },
                Lumber(r={}){ return tauEnabled() ? spaceCostMultiplier('mining_pit', r.offset, 2350000, 1.225, 'tauceti') : 0; },
                Iron(r={}){ return tauEnabled() ? spaceCostMultiplier('mining_pit', r.offset, 835000, 1.225, 'tauceti') : 0; },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[this.support(), races[global.race.species].home])}</div>`;
                desc = desc + `<div>${loc('plus_max_resource',[this.workers(),loc('job_pit_miner')])}</div>`;
                if (!tauEnabled()){
                    desc = desc + `<div>${loc('plus_max_resource',[+(this.storage.res('Materials') * this.storage.multiplier()).toFixed(0),loc('resource_Materials_name')])}</div>`;
                    desc = desc + `<div>${loc('tau_home_mining_pit_effect',[global.resource.Materials.name])}</div>`;
                }
                else {
                    if (global.tech['isolation']){
                        if (global.race['lone_survivor']){
                            let res_list = [global.resource.Bolognium.name,global.resource.Adamantite.name,global.resource.Stone.name,global.resource.Copper.name,global.resource.Iron.name,global.resource.Aluminium.name,global.resource.Coal.name];
                            if (global.race['smoldering']){
                                res_list.push(global.resource.Chrysotile.name);
                                desc = desc + `<div>${loc('tau_home_mining_pit_effect2cs',res_list)}</div>`;
                            }
                            else {
                                desc = desc + `<div>${loc('tau_home_mining_pit_effect2c',res_list)}</div>`;
                            }
                        }
                        else {
                            let res_list = [global.resource.Bolognium.name,global.resource.Adamantite.name,global.resource.Stone.name,global.resource.Copper.name,global.resource.Coal.name];
                            if (global.race['smoldering']){
                                res_list.push(global.resource.Chrysotile.name);
                                desc = desc + `<div>${loc('tau_home_mining_pit_effect2bs',res_list)}</div>`;
                            }
                            else {
                                desc = desc + `<div>${loc('tau_home_mining_pit_effect2b',res_list)}</div>`;
                            }
                        }
                        desc = desc + `<div>${loc('production',[hugeEffect(8),global.resource.Cement.name])}</div>`;
                    }
                    else {
                        let res_list = [global.resource.Bolognium.name,global.resource.Adamantite.name,global.resource.Stone.name];
                        if (global.race['smoldering']){
                            res_list.push(global.resource.Chrysotile.name);
                            desc = desc + `<div>${loc('tau_home_mining_pit_effect2s',res_list)}</div>`;
                        }
                        else {
                            desc = desc + `<div>${loc('tau_home_mining_pit_effect2',res_list)}</div>`;
                        }
                    }
                }
                return desc;
            },
            s_type: 'tau_home',
            support(){ return -1; },
            powered(){ return 0; },
            workers(){ return jobScale(global.tech['isolation'] ? 6 : 8); },
            storage: {
                res(res){
                    let list = {
                        'Materials': hugeAdjust(1000000)
                    };
                    if (tauEnabled()){
                        delete list.Materials;
                    }
                    return res ? (list[res] || 0) : list;
                },
                multiplier(wiki){
                    return 1;
                },
                count(){
                    return support_on['mining_pit'] || 0;
                },
                gain(res, val, multiplier, count){ //not affected by spatial
                    return Math.floor(count * val * multiplier);
                }
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('mining_pit','tauceti');
                    if (powerOnNewStruct(this)){
                        let hiredMax = this.workers();
                        global.civic.pit_miner.max += hiredMax;

                        let hired = Math.min(hiredMax, global.civic[global.civic.d_job].workers);
                        global.civic[global.civic.d_job].workers -= hired;
                        global.civic.pit_miner.workers += hired;
                        global.civic.pit_miner.assigned = (global.civic.pit_miner.assigned || 0) + hired;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['mining_pit','tauceti']
                };
            }
        },
        excavate: {
            id: 'tauceti-excavate',
            title(){ return loc('tau_home_excavate'); },
            desc(){
                return `<div>${loc('tau_home_excavate')}</div>`;
            },
            reqs: { tau_home: 2 },
            grant: ['tau_home',3],
            path: ['truepath'],
            cost: {
                Money(o){ return 1650000000; },
                Materials(o){ return 750000; },
            },
            effect(){
                return loc('tau_home_excavate_effect');
            },
            action(){
                if (payCosts(this)){
                    messageQueue(loc('tau_home_excavate_msg'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        alien_outpost: {
            id: 'tauceti-alien_outpost',
            title(){ return loc('tech_alien_outpost'); },
            desc(){
                return `<div>${loc('tech_alien_outpost')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'science',
            reqs: { tau_home: 4 },
            path: ['truepath'],
            cost: {},
            queue_complete(){ return 0; },
            effect(){
                let desc = `<div>${loc('plus_max_resource',[20+'%',global.resource.Knowledge.name])}</div>`;
                if (global.tech['isolation']){
                    desc = desc + `<div>${loc('plus_max_resource',[(this.knowVal()).toLocaleString(),global.resource.Knowledge.name])}</div>`;
                    desc = desc + `<div>${loc('plus_max_resource',[+((this.storage.res('Cipher') * this.storage.multiplier()).toFixed(0)).toLocaleString(),global.resource.Cipher.name])}</div>`;
                    desc = desc + `<div>${loc(`space_lander_effect3`,[production('alien_outpost'),global.resource.Cipher.name])}</div>`;
                }
                if (global.tech['outpost_boost']){
                    desc = desc + `<div>${loc('tech_alien_outpost_effect2')}</div>`;
                }
                if (global.race['lone_survivor']){
                    desc = desc + `<div>${loc('city_wardenclyffe_effect1',[jobScale(1), job_data.professor.name()])}</div>`;
                }
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
                return desc;
            },
            knowVal(){ //does not contain percentage increase
                let gain = 0;
                if (global.tech['isolation']){
                    gain = (global.race['lone_survivor'] ? 3500000 : 6500000) * infiltratorFactor('tau_home','alien_outpost');
                }
                return gain;
            },
            powered(){ return powerCostMod(global.tech['isolation'] ? (global.race['lone_survivor'] ? 8 : 25) : 100, true); },
            special(){
                return global.tech['replicator'] ? true : false;
            },
            storage: {
                res(res){
                    let list = {
                        'Cipher': 200000
                    };
                    if (!global.tech['isolation']){
                        delete list.Cipher;
                    }
                    return res ? (list[res] || 0) : list;
                },
                multiplier(wiki){
                    return infiltratorFactor('tau_home','alien_outpost');
                },
                count(){
                    return 1;
                },
                gain(res, val, multiplier, count){ //not affected by spatial
                    return Math.floor(count * val * multiplier);
                }
            },
            action(){
                return false;
            },
            struct(){
                return {
                    d: { count: 1, on: 0 },
                    p: ['alien_outpost','tauceti']
                };
            }
        },
        data_decoder: {
            id: 'tauceti-data_decoder',
            title(){ return loc('tau_home_data_decoder'); },
            desc(){ return `<div>${loc('tau_home_data_decoder')}</div><div class="has-text-special">${loc('requires_power_support',[loc('tau_planet',[races[global.race.species].home])])}</div>`; },
            type: 'science',
            reqs: { tau_home: 9 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('data_decoder', r.offset, 780000000, 1.25, 'tauceti'); },
                Water(r={}){ return spaceCostMultiplier('data_decoder', r.offset, 128000, 1.25, 'tauceti'); },
                Orichalcum(r={}){ return spaceCostMultiplier('data_decoder', r.offset, 24500000, 1.25, 'tauceti'); },
                Positronium(r={}){ return spaceCostMultiplier('data_decoder', r.offset, 13500, 1.25, 'tauceti'); },
            },
            effect(wiki){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('tau_planet',[races[global.race.species].home])])}</div>`;
                let quantum_lv = +(get_qlevel(wiki)).toFixed(2);
                desc = desc + `<div>${loc('tau_home_data_decoder_effect',[global.resource.Cipher.name,loc('tech_alien_outpost'),quantum_lv])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
                return desc;
            },
            s_type: 'tau_home',
            support(){ return -1; },
            powered(){ return powerCostMod(6); },
            action(){
                if (payCosts(this)){
                    incrementStruct('data_decoder','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['data_decoder','tauceti']
                };
            }
        },
        jump_gate: {
            id: 'tauceti-jump_gate',
            title(){ return global.tech['resettle'] ? loc('tau_jump_gate_target',[actions.space.spc_sun.info.name()]) : loc('tau_jump_gate'); },
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('jump_gate') || global.tauceti.jump_gate.count < 100 || wiki){
                    return `<div>${loc('tau_jump_gate')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('tau_jump_gate')}</div>`;
                }
            },
            type: 'megaproject',
            reqs: { tauceti: 3 },
            condition(){ return global.tech['isolation'] && !global.tech['resettle'] ? 0 : 1; },
            path: ['truepath'],
            queue_size: 10,
            queue_complete(){ return 100 - global.tauceti.jump_gate.count; },
            cost: {
                Money(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('jump_gate') ? global.tauceti.jump_gate.count : 0)) < 100 ? 1000000 : 0; },
                Materials(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('jump_gate') ? global.tauceti.jump_gate.count : 0)) < 100 ? 12500 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('jump_gate') ? global.tauceti.jump_gate.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('tau_jump_gate_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else if (global.tech['resettle']){
                    return global.tech.resettle >= 3 ? loc('tau_jump_gate_effect2',[actions.space.spc_sun.info.name()]) : loc('tau_jump_gate_disabled');
                }
                else {
                    return loc('tau_jump_gate_effect');
                }
            },
            action(){
                if (payCosts(this)){
                    if (global.tauceti.jump_gate.count < 100){
                        incrementStruct('jump_gate','tauceti');
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['jump_gate','tauceti']
                };
            }
        },
        fusion_generator: {
            id: 'tauceti-fusion_generator',
            title(){ return loc('tech_fusion_generator'); },
            desc(){
                return `<div>${loc('tech_fusion_generator')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Helium_3.name])}</div>`;
            },
            type: 'power',
            reqs: { tau_home: 6 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('fusion_generator', r.offset, 188000000, 1.25, 'tauceti'); },
                Iridium(r={}){ return  spaceCostMultiplier('fusion_generator', r.offset, 5550000, 1.25, 'tauceti'); },
                Stanene(r={}){ return spaceCostMultiplier('fusion_generator', r.offset, 7003500, 1.25, 'tauceti'); },
                Sheet_Metal(r={}){ return spaceCostMultiplier('fusion_generator', r.offset, wom_recycle(95000), 1.25, 'tauceti'); },
            },
            effect(){
                let fuel = +int_fuel_adjust(this.p_fuel().a).toFixed(1);
                let desc = `<div>${loc('space_dwarf_reactor_effect1',[-(this.powered())])}</div>`;
                if (global.race['lone_survivor']){
                    desc = desc + `<div>${loc('gain',[-(fuel),global.resource[this.p_fuel().r].name])}</div>`;
                }
                else {
                    desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[this.p_fuel().r].name])}</div>`;
                }
                return desc;
            },
            p_fuel(){ return { r: 'Helium_3', a: hugeAdjust(global.tech['isolation'] ? (global.race['lone_survivor'] ? -15 : 75) : 500) }; },
            powered(){ return powerModifier(-32); },
            action(){
                if (payCosts(this)){
                    incrementStruct('fusion_generator','tauceti');
                    global.tauceti.fusion_generator.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['fusion_generator','tauceti']
                };
            }
        },
        repository: {
            id: 'tauceti-repository',
            title(){ return loc('tech_repository'); },
            desc(){ return loc('tech_repository'); },
            type: 'storage',
            reqs: { tau_home: 5 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('repository', r.offset, 10280000, 1.28, 'tauceti'); },
                Iron(r={}){ return spaceCostMultiplier('repository', r.offset, 1800000, 1.28, 'tauceti'); },
                Cement(r={}){ return spaceCostMultiplier('repository', r.offset, 1500000, 1.28, 'tauceti'); },
                Neutronium(r={}){ return spaceCostMultiplier('repository', r.offset, 215000, 1.28, 'tauceti'); },
            },
            wide: true,
            storage: {
                res(res){
                    let list = {
                        'Lumber': 30000,
                        'Stone': 30000,
                        'Furs': 17000,
                        'Copper': 15200,
                        'Iron': 14000,
                        'Aluminium': 12800,
                        'Cement': 11200,
                        'Coal': 4800,
                        'Steel': 2400,
                        'Titanium': 1600,
                        'Crystal': 10,
                        'Alloy': 1800,
                        'Polymer': 1500,
                        'Iridium': 1750,
                        'Chrysotile': 30000,
                        'Nano_Tube': 1200,
                        'Neutronium': 640,
                        'Adamantite': 720,
                        'Unobtainium': 1000
                    };
                    if (global.tech['isolation']){
                        list['Oil'] = 680;
                        list['Helium_3'] = 575;
                        list['Uranium'] = 125;
                        list['Water'] = 15;
                    }
                    if (global.tech['shadow']){
                        list['Graphene'] = 1000;
                        list['Stanene'] = 1000;
                        list['Bolognium'] = 750;
                        list['Orichalcum'] = 750;
                        if (global.tech.shadow >= 5){
                            list['Unobtainium'] = 1500;
                        }
                    }
                    if (global.resource.Tungsten.display){
                        list['Tungsten'] = 2000;
                    }
                    return res ? list[res] || 0 : list;
                },
                multiplier(wiki){
                    return tpStorageMultiplier('repository',false,wiki);
                }
            },
            effect(wiki){
                let storage = '<div class="aTable">';
                let multiplier = this.storage.multiplier(wiki);
                let containers = 250;
                let list = this.storage.res();
                for (const res of Object.keys(list)){
                    if (global.resource[res].display){
                        let val = sizeApproximation(spatialReasoning(list[res] * multiplier),1);
                        storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                if (global.tech['isolation']){
                    storage = storage + `<span>${loc('plus_max_resource',[containers,global.resource.Crates.name])}</span><span>${loc('plus_max_resource',[containers,global.resource.Containers.name])}</span>`;
                }
                storage = storage + '</div>';
                return storage;
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('repository','tauceti');

                    let containers = 250;
                    global.resource.Crates.max += containers;
                    global.resource.Containers.max += containers;
                    if (!global.resource.Containers.display){
                        unlockContainers();
                    }

                    let multiplier = this.storage.multiplier();
                    let list = this.storage.res();
                    for (const res of Object.keys(list)){
                        if (global.resource[res].display){
                            global.resource[res].max += (spatialReasoning(list[res]) * multiplier);
                        }
                    };
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0 },
                    p: ['repository','tauceti']
                };
            }
        },
        tau_factory: {
            id: 'tauceti-tau_factory',
            title(){ return loc('tau_home_tau_factory'); },
            desc(){
                return `<div>${loc('tau_home_tau_factory')}</div><div class="has-text-special">${loc('requires_power_support',[races[global.race.species].home])}</div>`;
            },
            type: 'industry',
            reqs: { tau_home: 8 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('tau_factory', r.offset, 269000000, 1.25, 'tauceti'); },
                Titanium(r={}){ return spaceCostMultiplier('tau_factory', r.offset, 3000000, 1.25, 'tauceti'); },
                Elerium(r={}){ return spaceCostMultiplier('tau_factory', r.offset, 850, 1.25, 'tauceti'); },
                Bolognium(r={}){ return spaceCostMultiplier('tau_factory', r.offset, 250000, 1.25, 'tauceti'); },
                Quantium(r={}){ return spaceCostMultiplier('tau_factory', r.offset, wom_recycle(425000), 1.25, 'tauceti'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[this.support(), races[global.race.species].home])}</div>`;
                desc = desc + `<div>${loc('tau_home_tau_factory_effect',[this.manufacturing()])}</div>`;
                if (global.tech['isolation']){
                    if (!global.race['flier']){
                        desc = desc + `<div>${loc('plus_max_resource',[jobScale(2),loc('job_resource_worker',[global.resource.Cement.name])])}</div>`;
                    }
                    desc = desc + `<div>${loc('space_red_fabrication_effect1',[jobScale(5)])}</div>`;
                }
                desc = desc + `<div>${loc('city_crafted_mats',[hugeEffect(global.tech['isolation'] ? 275 : 90)])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
                return desc;
            },
            special: true,
            s_type: 'tau_home',
            support(){ return -1; },
            powered(){ return powerCostMod(global.tech['isolation'] ? 2 : 5); },
            manufacturing() { return global.tech['isolation'] ? 5 : 3; },
            action(){
                if (payCosts(this)){
                    global.civic.craftsman.display = true; // Needed in Lone Survivor
                    incrementStruct('tau_factory','tauceti');
                    if (powerOnNewStruct(this)){
                        factoryData.addFactoryLines(this.manufacturing());
                    }
                    return true;
                }
                return false;
            },
            post(){
                if (global.race['lone_survivor']){
                    defineIndustry();
                }
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['tau_factory','tauceti']
                };
            }
        },
        infectious_disease_lab: {
            id: 'tauceti-infectious_disease_lab',
            title(){ return global.tech['isolation'] ? loc('tech_infectious_disease_lab_alt') : (loc(global.race['artifical'] ? 'tech_infectious_disease_lab_s' : 'tech_infectious_disease_lab')); },
            desc(){
                return `<div>${this.title()}</div><div class="has-text-special">${loc('requires_power_support',[races[global.race.species].home])}</div>`;
            },
            type: 'science',
            reqs: { disease: 1 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('infectious_disease_lab', r.offset, 1000000000, 1.25, 'tauceti'); },
                Alloy(r={}){ return spaceCostMultiplier('infectious_disease_lab', r.offset, 32500000, 1.25, 'tauceti'); },
                Polymer(r={}){ return spaceCostMultiplier('infectious_disease_lab', r.offset, 50000000, 1.25, 'tauceti'); },
                Bolognium(r={}){ return spaceCostMultiplier('infectious_disease_lab', r.offset, 2500000, 1.25, 'tauceti'); },
                Unobtainium(r={}){ return spaceCostMultiplier('infectious_disease_lab', r.offset, 64000, 1.25, 'tauceti'); },
            },
            effect(){
                let sci = this.knowVal();
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[this.support(), races[global.race.species].home])}</div>`;
                desc = desc + `<div>${loc('city_max_knowledge',[Math.round(sci).toLocaleString()])}</div>`;
                if (global.tech['isolation']){
                    let elerium = spatialReasoning(this.storage.res('Elerium') * this.storage.multiplier());
                    desc = desc + `<div>${loc('plus_max_resource',[elerium,global.resource.Elerium.name])}</div>`;
                    desc = desc + `<div>${loc('city_wardenclyffe_effect1',[jobScale(2), job_data.professor.name()])}</div>`;
                    desc = desc + `<div>${loc('city_wardenclyffe_effect1',[jobScale(1), job_data.scientist.name()])}</div>`;
                    desc = desc + `<div>${loc('space_zero_g_lab_effect',[jobScale(1)])}</div>`;
                    desc = desc + `<div>${loc('city_library_effect',[hugeEffect(75)])}</div>`;
                }
                if (global.tech['alien_crafting']){
                    desc = desc + `<div>${loc('production',[hugeEffect(65),global.resource.Quantium.name])}</div>`;
                }
                if (global.tech['focus_cure']){
                    desc = desc + `<div>${loc('tau_home_disease_lab_cure',[+global.tauceti.infectious_disease_lab.cure.toFixed(1)])}</div>`;
                    if (global.race.hasOwnProperty('vax')){
                        desc = desc + `<div>${loc('tau_home_disease_lab_vax',[+global.race.vax.toFixed(2)])}</div>`;
                    }
                }
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
                return desc;
            },
            knowVal(){
                let gain = 39616;
                if (global.tech['supercollider'] && global.tech['isolation']){
                    let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 12.5: 25;
                    gain *= (global.tech['supercollider'] / ratio) + 1;
                }
                gain *= infiltratorFactor('tau_home','infectious_disease_lab');
                gain = hugeAdjust(gain);
                return gain;
            },
            s_type: 'tau_home',
            support(){ return -1; },
            powered(){ return powerCostMod(global.tech['isolation'] ? (global.race['lone_survivor'] ? 2 : 8) : 35); },
            storage: {
                res(res){
                    let list = {
                        'Elerium': 375
                    };
                    if (!global.tech['isolation']){
                        delete list.Elerium;
                    }
                    return res ? (list[res] || 0) : list;
                },
                multiplier(wiki){
                    return infiltratorFactor('tau_home','infectious_disease_lab');
                },
                count(){ //powered makes more sense for elerium (was support_on before this)
                    return p_on['infectious_disease_lab'] || 0;
                }
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('infectious_disease_lab','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, cure: 0 },
                    p: ['infectious_disease_lab','tauceti']
                };
            },
            post(){
                if (global.tech.disease === 1){
                    global.tech.disease = 2;
                    messageQueue(loc('tau_plague4',[loc('tab_tauceti')]),'info',false,['progress']);
                    drawTech();
                }
                loadFoundry();
            },
            postPower(on){
                limitCraftsmen('Quantium');
            }
        },
        tauceti_casino: {
            id: 'tauceti-tauceti_casino',
            title(){ return structName('casino'); },
            desc(){ return structName('casino'); },
            type: 'gambling',
            category: 'commercial',
            reqs: { gambling: 1, isolation: 1 },
            cost: {
                Money(r={}){ return spaceCostMultiplier('tauceti_casino', r.offset, 1450000, 1.35, 'tauceti'); },
                Furs(r={}){ return spaceCostMultiplier('tauceti_casino', r.offset, 95000, 1.35, 'tauceti'); },
                Cement(r={}){ return spaceCostMultiplier('tauceti_casino', r.offset, 120000, 1.35, 'tauceti'); },
                Plywood(r={}){ return spaceCostMultiplier('tauceti_casino', r.offset, wom_recycle(55000), 1.35, 'tauceti'); }
            },
            effect(){
                let pop = this.citizens();
                let desc = global.race['lone_survivor'] ? `` : `<div>${loc('plus_max_resource',[pop,loc('citizen')])}</div>`;
                desc = desc + casinoEffect();
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(global.race['lone_survivor'] ? 1 : 2); },
            action(){
                if (payCosts(this)){
                    incrementStruct('tauceti_casino','tauceti');
                    if (global.tech['theatre'] && !global.race['joyless']){
                        global.civic.entertainer.max += jobScale(1);
                        global.civic.entertainer.display = true;
                    }
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['tauceti_casino','tauceti']
                };
            },
            citizens(){
                let gain = 1;
                if (global.race['high_pop']){
                    gain *= traits.high_pop.vars()[0];
                }
                return global.race['lone_survivor'] ? 0 : gain;
            },
            flair: loc('city_casino_flair')
        },
        tau_cultural_center: {
            id: 'tauceti-tau_cultural_center',
            title(){ return loc('tech_cultural_center'); },
            desc(){
                return `<div>${loc('tech_cultural_center')}</div><div class="has-text-special">${loc('space_electrolysis_req',[global.resource[this.p_fuel().r].name])}</div>`;
            },
            type: 'entertainment',
            category: 'commercial',
            reqs: { tau_culture: 1 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('tau_cultural_center', r.offset, 91450000, 1.35, 'tauceti'); },
                Copper(r={}){ return spaceCostMultiplier('tau_cultural_center', r.offset, 5850000, 1.35, 'tauceti'); },
                Coal(r={}){ return spaceCostMultiplier('tau_cultural_center', r.offset, 465000, 1.35, 'tauceti'); },
                Polymer(r={}){ return spaceCostMultiplier('tau_cultural_center', r.offset, 3792000, 1.35, 'tauceti'); },
            },
            effect(){
                let womling = 8;
                let modifier = 1;
                if (global.civic.govern.type === 'corpocracy'){
                    modifier = 1 + (govEffect.corpocracy()[2] / 100);
                }
                else if (global.civic.govern.type === 'socialist'){
                    modifier = 1 - (govEffect.socialist()[3] / 100);
                }
                modifier = hugeAdjust(modifier);

                let cas = +(20 * modifier).toFixed(2);
                let mon = +(5 * modifier).toFixed(2);
                let bake = +(15 * modifier).toFixed(2);

                let desc = `<div class="has-text-caution">${loc('tau_home_cultureal_effect1',[+(this.p_fuel().a).toFixed(0),global.resource[this.p_fuel().r].name,typeof this.title === 'string' ? this.title : this.title()])}</div>`;
                desc += `<div>${loc('city_tourist_center_effect2',[cas,structName('casino')])}</div>`;
                desc += `<div>${loc('city_tourist_center_effect2',[mon,loc(`arpa_project_monument_title`)])}</div>`;
                desc += `<div>${loc('tau_home_cultureal_effect2',[womling,loc('tau_red_womlings')])}</div>`;
                if (global.tech.tau_culture >= 2){
                    desc += `<div>${loc('tau_home_cultureal_effect3',[bake,loc(`tau_gas2_alien_station_data2_r${global.race.tau_food_item || 0}`)])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(1); },
            p_fuel(){ return { r: 'Food', a: hugeAdjust(global.race['lone_survivor'] ? 25 : 500) }; },
            action(){
                if (payCosts(this)){
                    incrementStruct('tau_cultural_center','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['tau_cultural_center','tauceti']
                };
            }
        },
        marine_barracks: {
            id: 'tauceti-marine_barracks',
            title(){ return loc('tau_home_marine_barracks'); },
            desc(){ return `<div>${loc('tau_home_marine_barracks')}</div><div class="has-text-special">${loc('space_support',[loc('tau_planet',[races[global.race.species].home])])}</div>`; },
            type: 'military',
            reqs: { resettle: 2 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('marine_barracks', r.offset, 42000000, 1.25, 'tauceti'); },
                Stone(r={}){ return spaceCostMultiplier('marine_barracks', r.offset, 2600000, 1.25, 'tauceti'); },
                Furs(r={}){ return spaceCostMultiplier('marine_barracks', r.offset, 2200000, 1.25, 'tauceti'); },
                Water(r={}){ return spaceCostMultiplier('marine_barracks', r.offset, 15000, 1.25, 'tauceti'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('tau_planet',[races[global.race.species].home])])}</div>`;
                desc += `<div>${loc('plus_max_soldiers',[this.soldiers()])}</div>`;
                return desc;
            },
            s_type: 'tau_home',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('marine_barracks','tauceti');
                    powerOnNewStruct(this);
                    tauEnableSoldiers();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['marine_barracks','tauceti']
                };
            },
            soldiers(){
                let soldiers = 6 * geneBonus('quartermaster');
                soldiers = hugeAdjust(soldiers);
                return +(jobScale(soldiers)).toFixed(3);
            }
        },
    },
    tau_red: {
        info: {
            name(){
                return loc('tau_planet',[planetName().red]);
            },
            desc(){
                return loc('tau_red',[planetName().red]);
            },
            nav(){ return global.tech['resettle'] || global.tech['shadow'] && global.tech.shadow >= 4 ? true : false; },
            support: 'orbital_platform',
            extra(region){
                if (global.tech['tau_red'] && global.tech.tau_red >= 5){
                    $(`#${region}`).append(`<div id="${region}Womlings" class="syndThreat has-text-warning">${loc('tau_red_womling_prod')} <span class="has-text-info">{{ prod }}%</span></div>`);
                    vBind({
                        el: `#${region}Womlings`,
                        data: global.tauceti.overseer,
                    });
                }
            }
        },
        red_mission: {
            id: 'tauceti-red_mission',
            title(){ return loc('tau_new_mission_title',[planetName().red]); },
            desc(){ return loc('tau_new_mission_title',[planetName().red]); },
            reqs: { tauceti: 2 },
            grant: ['tau_red',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 1 ? 0 : 1; },
            cost: {
                Money(){ return 1000000000; }
            },
            effect(){ return loc('tau_new_mission_effect',[planetName().red]); },
            action(){
                if (payCosts(this)){
                    global.tauceti['settlement'] = { count: 0, on: 0 };
                    messageQueue(loc('tau_red_mission_result',[planetName().red]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        orbital_platform: {
            id: 'tauceti-orbital_platform',
            title(){ return loc('tau_red_orbital_platform'); },
            desc(){ return `<div>${loc('tau_red_orbital_platform')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            type: 'outpost',
            reqs: { tau_red: 1, tauceti: 4 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('orbital_platform', r.offset, 50000000, 1.3, 'tauceti'); },
                Oil(r={}){ return tauEnabled() ? spaceCostMultiplier('orbital_platform', r.offset, int_fuel_adjust(wom_repulse(275000)), 1.3, 'tauceti') : 0; },
                Aluminium(r={}){ return spaceCostMultiplier('orbital_platform', r.offset, 1780000, 1.3, 'tauceti'); },
                Bolognium(r={}){ return spaceCostMultiplier('orbital_platform', r.offset, 450000, 1.3, 'tauceti'); },
            },
            effect(){
                let oil = spatialReasoning(this.storage.res('Oil') * this.storage.multiplier());
                let fuel = +int_fuel_adjust(this.support_fuel().a).toFixed(1);
                let desc = `<div>${loc('space_red_spaceport_effect1',[loc('tau_planet',[planetName().red]),this.support()])}</div>`;
                desc = desc + `<div>${loc('plus_max_resource',[oil.toLocaleString(),global.resource.Oil.name])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend_power',[fuel,global.resource[this.support_fuel().r].name,this.powered()])}</div>`;
                return desc;
            },
            support_fuel(){ return { r: global.race['lone_survivor'] ? 'Helium_3' : 'Oil', a: hugeAdjust(global.tech['isolation'] ? (global.race['lone_survivor'] ? 8 : 32) : 125) }; },
            support(){
                let sup = global.tech['womling_pop'] && global.tech.womling_pop >= 3 ? 3 : (global.tech['womling_logistics'] ? 2.5 : 2);
                if (global.race['lone_survivor']){ sup *= 2; }
                return sup;
            },
            powered(){ return powerCostMod(global.tech['isolation'] ? (global.race['lone_survivor'] ? 2 : 3) : 18); },
            refresh: true,
            storage: {
                res(res){
                    let list = {
                        'Oil': 17500
                    };
                    return res ? (list[res] || 0) : list;
                },
                multiplier(wiki){
                    return 1;
                },
                count(){
                    return p_on['orbital_platform'] || 0;
                }
            },
            action(){
                if (tauEnabled() && payCosts(this)){
                    incrementStruct('orbital_platform','tauceti');
                    powerOnNewStruct(this);
                    if (global.tech['tau_red'] === 1){
                        global.tech['tau_red'] = 2;
                        messageQueue(loc('tau_red_orbital_platform_msg',[loc('tau_planet',[planetName().red]),loc('tau_planet',[races[global.race.species].home])]),'info',false,['progress']);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['orbital_platform','tauceti']
                };
            }
        },
        contact: {
            id: 'tauceti-contact',
            title(){ return loc('tau_red_contact'); },
            desc(){ return loc('tau_red_contact'); },
            reqs: { tau_red: 4 },
            grant: ['tau_red',5],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 5 ? 0 : 1; },
            cost: {
                Money(){ return 600000000; },
                Food(){ return global.race['lone_survivor'] && global.race['artifical'] ? 62000 : 2500000; }
            },
            effect(){ return loc('tau_red_contact_effect'); },
            action(){
                if (payCosts(this)){
                    global.race['womling_friend'] = 1;
                    defineWomlings();
                    return true;
                }
                return false;
            }
        },
        introduce: {
            id: 'tauceti-introduce',
            title(){ return loc('tau_red_introduce'); },
            desc(){ return loc('tau_red_introduce'); },
            reqs: { tau_red: 4 },
            grant: ['tau_red',5],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 5 ? 0 : 1; },
            cost: {
                Knowledge(){ return 7000000; }
            },
            effect(){ return loc('tau_red_introduce_effect'); },
            action(){
                if (payCosts(this)){
                    global.race['womling_god'] = 1;
                    defineWomlings();
                    return true;
                }
                return false;
            }
        },
        subjugate: {
            id: 'tauceti-subjugate',
            title(){ return loc('tau_red_subjugate'); },
            desc(){ return loc('tau_red_subjugate'); },
            reqs: { tau_red: 4 },
            grant: ['tau_red',5],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 5 ? 0 : 1; },
            cost: {
                Money(){ return 2850000000; }
            },
            effect(){ return loc('tau_red_subjugate_effect'); },
            action(){
                if (payCosts(this)){
                    global.race['womling_lord'] = 1;
                    defineWomlings();
                    return true;
                }
                return false;
            }
        },
        jeff: {
            id: 'tauceti-jeff',
            title(){ return loc('tau_red_jeff'); },
            desc(){ return loc('tau_red_jeff'); },
            reqs: { tau_red: 5 },
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_red >= 5 ? 0 : 1; },
            cost: {},
            effect(){
                let injured = global.tauceti['overseer'] ? global.tauceti.overseer.injured : 0;
                if (global.tauceti['overseer'] && global.tauceti.overseer.pop < injured){ injured = global.tauceti.overseer.pop; }
                let desc = `<div>${loc('tau_red_jeff_effect1',[global.tauceti['overseer'] ? global.tauceti.overseer.pop : 0])}</div>`;
                desc = desc + `<div>${loc('tau_red_jeff_effect2',[global.tauceti['overseer'] ? global.tauceti.overseer.working : 0])}</div>`;
                desc = desc + `<div>${loc('tau_red_jeff_effect3',[injured])}</div>`;
                desc = desc + `<div>${loc('tau_red_jeff_effect4',[global.tauceti['overseer'] ? global.tauceti.overseer.loyal : 0])}</div>`;
                desc = desc + `<div>${loc('tau_red_jeff_effect5',[global.tauceti['overseer'] ? global.tauceti.overseer.morale : 0])}</div>`;
                if (global.tech.hasOwnProperty('womling_tech')){
                    desc = desc + `<div>${loc('tau_red_jeff_effect6',[global.tech.womling_tech])}</div>`;
                }
                desc = desc + `<div class="divide-line">${loc('job_farmer')}: ${global.tauceti['womling_farm'] ? global.tauceti.womling_farm.farmers : 0}</div>`;
                desc = desc + `<div>${loc('job_miner')}: ${global.tauceti['womling_mine'] ? global.tauceti.womling_mine.miners : 0}</div>`;
                if (global.tauceti['womling_lab']){
                    desc = desc + `<div>${loc('job_scientist')}: ${global.tauceti['womling_lab'] ? global.tauceti.womling_lab.scientist : 0}</div>`;
                }
                if (global.tauceti['womling_craftworks']){
                    desc = desc + `<div>${loc('job_artisan')}: ${womlingArtisans()}</div>`;
                }
                return desc;
            },
            action(){
                return false;
            }
        },
        overseer: {
            id: 'tauceti-overseer',
            title(){ return this.name(); },
            desc(){ return `<div>${this.name()}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'outpost',
            name(){
                if (global.race['womling_lord']){
                    return loc('tau_red_overseer');
                }
                else if (global.race['womling_god']){
                    return loc('tau_red_womgod');
                }
                else {
                    return loc('tau_red_womally');
                }
            },
            reqs: { tau_red: 5 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('overseer', r.offset, 6000000, 1.28, 'tauceti'); },
                Cement(r={}){ return spaceCostMultiplier('overseer', r.offset, 2450000, 1.28, 'tauceti'); },
                Alloy(r={}){ return global.race['womling_friend'] ? spaceCostMultiplier('overseer', r.offset, 1850000, 1.28, 'tauceti') : 0; },
                Neutronium(r={}){ return global.race['womling_lord'] ? spaceCostMultiplier('overseer', r.offset, 165000, 1.28, 'tauceti') : 0; },
                Titanium(r={}){ return global.race['womling_god'] ? spaceCostMultiplier('overseer', r.offset, 2250000, 1.28, 'tauceti') : 0; },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[this.support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_overseer_effect',[this.val()])}</div>`;
                return desc;
            },
            val(){
                let val = 0;
                if (global.race['womling_lord']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 12 : 10;
                }
                else if (global.race['womling_god']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 6 : 5;
                }
                else if (global.race['womling_friend']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 10 : 8;
                }
                if (global.race['lone_survivor']){
                    val *= 2;
                }
                val = hugeEffect(val);
                return +(val).toFixed(1);
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('overseer','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, pop: 0, working: 0, injured: 0, morale: 0, loyal: 0, prod: 0 },
                    p: ['overseer','tauceti']
                };
            }
        },
        womling_village: {
            id: 'tauceti-womling_village',
            title(){ return loc('tau_red_womling_village'); },
            desc(){ return `<div>${loc('tau_red_womling_village')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'housing',
            reqs: { tau_red: 5 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('womling_village', r.offset, 10000000, 1.28, 'tauceti'); },
                Stone(r={}){ return spaceCostMultiplier('womling_village', r.offset, 2250000, 1.28, 'tauceti'); },
                Plywood(r={}){ return spaceCostMultiplier('womling_village', r.offset, wom_recycle(1250000), 1.28, 'tauceti'); },
                Wrought_Iron(r={}){ return spaceCostMultiplier('womling_village', r.offset, wom_recycle(400000), 1.28, 'tauceti'); },
            },
            effect(){
                let pop = womlingVillagePop();
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[this.support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_village_effect',[+(pop).toFixed(1)])}</div>`;
                if (global.tech['tau_junksale']){
                    desc = desc + `<div>${loc('tau_red_womling_village_effect2',[hugeEffect(40),loc(`tau_gas2_alien_station_data4_r${global.race.tau_junk_item || 0}`)])}</div>`;
                }
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('womling_village','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 1, on: 1 },
                    p: ['womling_village','tauceti']
                };
            }
        },
        womling_farm: {
            id: 'tauceti-womling_farm',
            title(){ return loc('tau_red_womling_farm'); },
            desc(){ return `<div>${loc('tau_red_womling_farm')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'farming',
            reqs: { tau_red: 5 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('womling_farm', r.offset, 24000000, 1.28, 'tauceti'); },
                Iron(r={}){ return spaceCostMultiplier('womling_farm', r.offset, 9500000, 1.28, 'tauceti'); },
                Water(r={}){ return spaceCostMultiplier('womling_farm', r.offset, 5000, 1.28, 'tauceti'); },
            },
            effect(){
                let food = womlingFarmFood();
                let farmers = global.tauceti.hasOwnProperty('womling_farm') ? global.tauceti.womling_farm.farmers : 0;
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[this.support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_farm_effect',[hugeEffect(food, 1)])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_employ',[hugeEffect(2)])}</div>`;
                if (global.tech['isolation']){
                    desc = desc + `<div>${loc('tau_red_womling_generate',[global.resource.Furs.name])}</div>`;
                }
                desc = desc + `<div>${loc('tau_red_womling_farm_effect2',[+(food / 2 * farmers).toFixed(1),loc('resource_Food_name')])}</div>`;
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('womling_farm','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 1, on: 1, farmers: 0 },
                    p: ['womling_farm','tauceti']
                };
            }
        },
        womling_mine: {
            id: 'tauceti-womling_mine',
            title(){ return loc('tau_red_womling_mine'); },
            desc(){ return `<div>${loc('tau_red_womling_mine')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'mining',
            reqs: { tau_red: 5 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('womling_mine', r.offset, 12500000, 1.28, 'tauceti'); },
                Lumber(r={}){ return spaceCostMultiplier('womling_mine', r.offset, 12800000, 1.28, 'tauceti'); },
                Steel(r={}){ return spaceCostMultiplier('womling_mine', r.offset, 4500000, 1.28, 'tauceti'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[this.support(), planetName().red])}</div>`;
                if (global.tech['isolation']){
                    if (global.race['lone_survivor']){
                        desc = desc + `<div>${loc('tau_red_womling_mine_effect_c',[
                            global.resource.Unobtainium.name,global.resource.Uranium.name,global.resource.Titanium.name,global.resource.Iron.name,
                            global.resource.Copper.name,global.resource.Aluminium.name,global.resource.Neutronium.name,global.resource.Iridium.name
                        ])}</div>`;
                    }
                    else {
                        desc = desc + `<div>${loc('tau_red_womling_mine_effect_b',[global.resource.Unobtainium.name,global.resource.Uranium.name,global.resource.Titanium.name])}</div>`;
                    }
                }
                else {
                    desc = desc + `<div>${loc('tau_red_womling_mine_effect_a',[global.resource.Unobtainium.name])}</div>`;
                }
                desc = desc + `<div>${loc('tau_red_womling_employ',[hugeEffect(6)])}</div>`;
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('womling_mine','tauceti');
                    global.resource.Unobtainium.display = true;
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, miners: 0 },
                    p: ['womling_mine','tauceti']
                };
            },
            flair(){ return loc('tau_red_womling_mine_flair'); }
        },
        womling_fun: {
            id: 'tauceti-womling_fun',
            title(){ return this.name(); },
            desc(){ return `<div>${this.name()}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'entertainment',
            name(){
                if (global.race['womling_lord']){
                    return loc('tau_red_womling_fun1');
                }
                else if (global.race['womling_god']){
                    return loc('tau_red_womling_fun2');
                }
                else {
                    return loc('tau_red_womling_fun3');
                }
            },
            reqs: { tau_red: 6 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('womling_fun', r.offset, 3800000, 1.28, 'tauceti'); },
                Food(r={}){ return global.race['womling_friend'] ? spaceCostMultiplier('womling_fun', r.offset, 175000, 1.28, 'tauceti') : 0; },
                Lumber(r={}){ return spaceCostMultiplier('womling_fun', r.offset, 500000, 1.28, 'tauceti'); },
                Stone(r={}){ return spaceCostMultiplier('womling_fun', r.offset, 500000, 1.28, 'tauceti'); },
                Furs(r={}){ return global.race['womling_lord'] || global.race['womling_god'] ? spaceCostMultiplier('womling_fun', r.offset, 835000, 1.28, 'tauceti') : 0; },
                Copper(r={}){ return global.race['womling_lord'] ? spaceCostMultiplier('womling_fun', r.offset, 1125000, 1.28, 'tauceti') : 0; },
                Alloy(r={}){ return global.race['womling_god'] ? spaceCostMultiplier('womling_fun', r.offset, 656000, 1.28, 'tauceti') : 0; },
                Water(r={}){ return global.race['womling_friend'] ? spaceCostMultiplier('womling_fun', r.offset, 3500, 1.28, 'tauceti') : 0; },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[this.support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_fun_effect',[+(this.val()).toFixed(1)])}</div>`;
                return desc;
            },
            val(){
                let val = 0;
                if (global.race['womling_lord']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 24 : 20;
                }
                else if (global.race['womling_god']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 12 : 10;
                }
                else if (global.race['womling_friend']){
                    val = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 18 : 15;
                }
                if (global.race['lone_survivor']){
                    val *= 2;
                }
                val = hugeAdjust(2);
                return val;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('womling_fun','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['womling_fun','tauceti']
                };
            },
        },
        womling_lab: {
            id: 'tauceti-womling_lab',
            title(){ return loc('interstellar_laboratory_title'); },
            desc(){ return `<div>${loc('interstellar_laboratory_title')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'science',
            reqs: { tau_red: 7 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('womling_lab', r.offset, 65000000, 1.28, 'tauceti'); },
                Elerium(r={}){ return spaceCostMultiplier('womling_lab', r.offset, 1200, 1.28, 'tauceti'); },
                Orichalcum(r={}){ return spaceCostMultiplier('womling_lab', r.offset, 2500000, 1.28, 'tauceti'); },
                Unobtainium(r={}){ return spaceCostMultiplier('womling_lab', r.offset, 10000, 1.28, 'tauceti'); },
                Quantium(r={}){ return spaceCostMultiplier('womling_lab', r.offset, wom_recycle(95000), 1.28, 'tauceti'); },
            },
            effect(){
                let know = this.knowVal();
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[this.support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_lab_effect',[this.knowVal()])}</div>`;
                if (global.race['humongous']){
                    desc = desc + `<div>${loc('tau_red_womling_employ',[hugeEffect(1)])}</div>`;
                }
                else{
                    desc = desc + `<div>${loc('tau_red_womling_employ_single',[1])}</div>`;
                }

                // How far along the Womlings are is only legible to someone who has ruled them before.
                if (global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5){
                    const progress = global.tauceti.womling_lab.tech / getWeaselTechLevelRequirement() * 100;
                    desc = desc + `<div class="has-text-advanced">${loc('tau_red_womling_lab_tech_level',[global.tech.womling_tech ?? 0, progress.toFixed(2)])}</div>`;
                }
                return desc;
            },
            knowVal(){
                let overseer = global.tauceti.hasOwnProperty('overseer') ? global.tauceti.overseer.prod : 100;
                let gain = Math.round(25000 * overseer / 100);
                gain *= infiltratorFactor('tau_red','womling_lab');
                gain = hugeAdjust(gain);
                return gain;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('womling_lab','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, scientist: 0, tech: 0 },
                    p: ['womling_lab','tauceti']
                };
            },
        },
        antimatter_reactor: {
            id: 'tauceti-antimatter_reactor',
            title(){ return loc('tech_antimatter_reactor'); },
            desc(){
                return `<div>${loc('tech_antimatter_reactor')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Helium_3.name])}</div>`;
            },
            type: 'power',
            reqs: { womling_energy: 1 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('antimatter_reactor', r.offset, 1000000000, 1.3, 'tauceti'); },
                Neutronium(r={}){ return  spaceCostMultiplier('antimatter_reactor', r.offset, 3750000, 1.3, 'tauceti'); },
                Orichalcum(r={}){ return spaceCostMultiplier('antimatter_reactor', r.offset, 75000000, 1.3, 'tauceti'); },
                Quantium(r={}){ return spaceCostMultiplier('antimatter_reactor', r.offset, wom_recycle(420000), 1.3, 'tauceti'); },
            },
            effect(){
                let fuel = +int_fuel_adjust(this.p_fuel().a).toFixed(2);
                let desc = `<div>${loc('space_dwarf_reactor_effect1',[-(this.powered())])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[this.p_fuel().r].name])}</div>`;
                return desc;
            },
            p_fuel(){ return { r: 'Positronium', a: hugeAdjust(0.12) }; },
            powered(){ return powerModifier(-48); },
            action(){
                if (payCosts(this)){
                    incrementStruct('antimatter_reactor','tauceti');
                    global.tauceti.antimatter_reactor.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['antimatter_reactor','tauceti']
                };
            }
        },
        womling_rangers: {
            id: 'tauceti-womling_rangers',
            title(){ return loc('tau_red_womling_rangers'); },
            desc(){ return `<div>${loc('tau_red_womling_rangers')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'military',
            reqs: { womling_military: 1 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('womling_rangers', r.offset, 38000000, 1.28, 'tauceti'); },
                Food(r={}){ return spaceCostMultiplier('womling_rangers', r.offset, global.race['artifical'] ? 20000 : 2000000, 1.28, 'tauceti'); },
                Cement(r={}){ return spaceCostMultiplier('womling_rangers', r.offset, 1800000, 1.28, 'tauceti'); },
                Unobtainium(r={}){ return spaceCostMultiplier('womling_rangers', r.offset, 675000, 1.28, 'tauceti'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().red])}</div>`;
                desc += `<div>${loc('plus_max_soldiers',[this.soldiers()])}</div>`;
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('womling_rangers','tauceti');
                    powerOnNewStruct(this);
                    tauEnableSoldiers();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['womling_rangers','tauceti']
                };
            },
            soldiers(){
                let soldiers = 5 * geneBonus('quartermaster');
                soldiers = hugeAdjust(soldiers);
                return +(jobScale(soldiers)).toFixed(3);
            }
        },
        womling_craftworks: {
            id: 'tauceti-womling_craftworks',
            title(){ return loc('tau_red_womling_craftworks'); },
            desc(){ return `<div>${loc('tau_red_womling_craftworks')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'industry',
            reqs: { womling_technicians: 2 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('womling_craftworks', r.offset, 78000000, 1.28, 'tauceti'); },
                Stone(r={}){ return spaceCostMultiplier('womling_craftworks', r.offset, 6400000, 1.28, 'tauceti'); },
                Adamantite(r={}){ return spaceCostMultiplier('womling_craftworks', r.offset, 1850000, 1.28, 'tauceti'); },
                Orichalcum(r={}){ return spaceCostMultiplier('womling_craftworks', r.offset, 3100000, 1.28, 'tauceti'); },
                Quantium(r={}){ return spaceCostMultiplier('womling_craftworks', r.offset, wom_recycle(120000), 1.28, 'tauceti'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[this.support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_employ',[womlingArtisansPer()])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_craftworks_effect',[1])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_craftworks_effect2',[1])}</div>`;
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('womling_craftworks','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, artisan: 0 },
                    p: ['womling_craftworks','tauceti']
                };
            },
        },
        womling_market: {
            id: 'tauceti-womling_market',
            title(){ return loc('tau_red_womling_market'); },
            desc(){ return `<div>${loc('tau_red_womling_market')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`; },
            type: 'finance',
            reqs: { womling_logistics: 3 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('womling_market', r.offset, 125000000, 1.28, 'tauceti'); },
                Furs(r={}){ return spaceCostMultiplier('womling_market', r.offset, 4200000, 1.28, 'tauceti'); },
                Iron(r={}){ return spaceCostMultiplier('womling_market', r.offset, 12000000, 1.28, 'tauceti'); },
                Brick(r={}){ return spaceCostMultiplier('womling_market', r.offset, wom_recycle(1800000), 1.28, 'tauceti'); },
            },
            effect(){
                let routes = hugeAdjust(1, 1, 2);
                let desc = `<div class="has-text-caution">${loc('tau_new_support',[this.support(), planetName().red])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_market_effect',[routes,tauCetiModules.tau_red.womling_village.title()])}</div>`;
                desc = desc + `<div>${loc('tau_red_womling_market_effect2',[hugeAdjust(1)])}</div>`;
                return desc;
            },
            s_type: 'tau_red',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('womling_market','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['womling_market','tauceti']
                };
            },
            flair(){ return loc('tau_red_womling_market_flair'); },
        },
    },
    tau_gas: {
        info: {
            name(n,k){
                let key = k || 'gas_name';
                let ns = key === 'gas_name' ? 0 : 1;
                if (n || global.race[key]){
                    switch (n || global.race[key]){
                        case 1:
                        {
                            let tracked = global.race.universe === 'antimatter' ? 'plasmid' : 'antiplasmid';
                            switch (Math.round(global.stats[tracked] + ns) % 3){
                                case 1:
                                    return loc('tau_planet',[planetName().gas]);
                                case 2:
                                    return loc('tau_gas_title0a',[planetName().gas]);
                                default:
                                    return loc('tau_gas_title0b',[planetName().gas]);
                            }
                        }
                        case 2:
                        {
                            switch (Math.round(global.stats.reset + ns) % 3){
                                case 1:
                                    return loc('tau_gas_title1a');
                                case 2:
                                    return loc('tau_gas_title1b');
                                default:
                                    return loc('tau_gas_title1c');
                            }
                        }
                        case 3:
                        {
                            switch (Math.round(global.stats.mad + ns) % 3){
                                case 1:
                                    return loc('tau_gas_title2a');
                                case 2:
                                    return loc('tau_gas_title2b');
                                default:
                                    return loc('tau_gas_title2c');
                            }
                        }
                        case 4:
                        {
                            switch (Math.round(global.stats.bioseed + ns) % 3){
                                case 1:
                                    return loc('tau_gas_title3a',[races[global.race.gods].solar.gas]);
                                case 2:
                                    return loc('tau_gas_title3b',[races[global.race.old_gods].name]);
                                default:
                                    return loc('tau_gas_title3c',[races[global.race.species].name]);
                            }
                        }
                        case 5:
                        {
                            switch (Math.round(global.stats.portals + ns) % 3){
                                case 1:
                                    return loc('tau_gas_title4a',[planetName().gas]);
                                case 2:
                                    return loc('tau_gas_title4b',[flib('reverse',planetName().gas)]);
                                default:
                                    return loc('tau_gas_title4c');
                            }
                        }
                        case 6:
                        {

                            switch (Math.round(global.stats.womling.friend.l + global.stats.womling.lord.l + global.stats.womling.god.l + ns) % 3){
                                case 1:
                                    return loc('tau_gas_title5a');
                                case 2:
                                    return loc('tau_gas_title5b');
                                default:
                                    return loc('tau_gas_title5c');
                            }
                        }
                        case 7:
                        {
                            switch (Math.round(global.stats.tdays + ns) % 3){
                                case 1:
                                    return loc('tau_gas_title6a');
                                case 2:
                                    return loc('tau_gas_title6b');
                                default:
                                    return loc('tau_gas_title6c');
                            }
                        }
                        default:
                            return key === 'gas_name' ? loc('tau_gas_title') : loc('tau_gas2_title');
                    }
                }
                return key === 'gas_name' ? loc('tau_gas_title') : loc('tau_gas2_title');
            },
            desc(){
                return loc('tau_gas_desc');
            },
            nav(){ return global.tech['resettle'] || global.tech['shadow'] && global.tech.shadow >= 4 ? true : false; }
        },
        gas_contest: {
            id: 'tauceti-gas_contest',
            title(){ return loc('tau_gas_contest_title'); },
            desc(){ return loc('tau_gas_contest_title'); },
            reqs: { tauceti: 5 },
            grant: ['tau_gas',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_gas >= 1 ? 0 : 1; },
            cost: {
                Money(){ return 10000000; }
            },
            effect(){ return global.race['lone_survivor'] ? loc('tau_gas_contest_effect_alt') : loc('tau_gas_contest_effect'); },
            action(){
                if (payCosts(this)){
                    return true;
                }
                return false;
            }
        },
        refueling_station: {
            id: 'tauceti-refueling_station',
            title(){ return loc('tau_gas_refueling_station_title'); },
            desc(){
                return `<div>${loc('tau_gas_refueling_station_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'industry',
            reqs: { tau_gas: 2 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('refueling_station', r.offset, 68000000, 1.28, 'tauceti'); },
                Graphene(r={}){ return spaceCostMultiplier('refueling_station', r.offset, 2500000, 1.28, 'tauceti'); },
                Unobtainium(r={}){ return spaceCostMultiplier('refueling_station', r.offset, 5500, 1.28, 'tauceti'); },
                Mythril(r={}){ return spaceCostMultiplier('refueling_station', r.offset, wom_recycle(60000), 1.28, 'tauceti'); },
            },
            powered(){ return powerCostMod(global.tech['isolation'] ? 2 : 5); },
            effect(){
                let helium_prod = +(production('refueling_station')).toFixed(2);
                let helium_tank = spatialReasoning(this.storage.res('Helium_3') * this.storage.multiplier());
                let desc = `<div>${loc('space_gas_mining_effect1',[helium_prod])}</div>`;
                desc = desc + `<div>${loc('plus_max_resource',[helium_tank.toLocaleString(),global.resource.Helium_3.name])}</div>`;
                if (global.tech['tau_whale'] >= 2){
                    let oil_tank = spatialReasoning(this.storage.res('Oil') * this.storage.multiplier());
                    desc = desc + `<div>${loc('plus_max_resource',[oil_tank.toLocaleString(),global.resource.Oil.name])}</div>`;
                }
                if (global.tech['isolation']){
                    desc = desc +  `<div>${loc('interstellar_g_factory_effect')}</div>`;
                }
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
                return desc;
            },
            special(){ return global.tech['isolation'] ? true : false; },
            storage: {
                res(res){
                    let list = {
                        'Helium_3': 10000,
                        'Oil': 6500
                    };
                    if (global.tech['tau_whale'] < 2){
                        delete list.Oil;
                    }
                    return res ? (list[res] || 0) : list;
                },
                multiplier(wiki){
                    return 1;
                },
                count(){
                    return p_on['refueling_station'] || 0;
                }
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('refueling_station','tauceti');
                    if (powerOnNewStruct(this)) {
                        if (global.tech['isolation']){
                            if (global.race['kindling_kindred'] || global.race['smoldering']){
                                global.tauceti.refueling_station.Oil++;
                            }
                            else {
                                global.tauceti.refueling_station.Lumber++;
                            }
                        }
                    }
                    return true;
                }
                return false;
            },
            struct(){
                // Carries its own graphene fuel allocation.
                return {
                    d: { count: 0, on: 0, Lumber: 0, Coal: 0, Oil: 0 },
                    p: ['refueling_station','tauceti']
                };
            },
            post(){
                if (global.tech.tau_gas === 2){
                    global.tech.tau_gas = 3;
                    defineIndustry();
                    drawTech();
                }
            }
        },
        ore_refinery: {
            id: 'tauceti-ore_refinery',
            title(){ return loc('tau_gas_ore_refinery_title'); },
            desc(){
                return `<div>${loc('tau_gas_ore_refinery_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'industry',
            reqs: { tau_gas: 4 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('ore_refinery', r.offset, 52000000, 1.28, 'tauceti'); },
                Iridium(r={}){ return spaceCostMultiplier('ore_refinery', r.offset, 1600000, 1.28, 'tauceti'); },
                Unobtainium(r={}){ return spaceCostMultiplier('ore_refinery', r.offset, 800, 1.28, 'tauceti'); },
                Sheet_Metal(r={}){ return spaceCostMultiplier('ore_refinery', r.offset, wom_recycle(118000), 1.28, 'tauceti'); },
            },
            powered(){ return powerCostMod(global.tech['isolation'] ? 2 : 8); },
            smelting(){ return global.tech['isolation'] ? 12 : 4; },
            effect(){
                let ore = global.tauceti.hasOwnProperty('ore_refinery') ? global.tauceti.ore_refinery.fill : 0;
                let max = global.tauceti.hasOwnProperty('ore_refinery') ? global.tauceti.ore_refinery.max : 0;
                let refine = +(production('ore_refinery')).toFixed(2);
                let desc = `<div>${loc('tau_gas_ore_refinery_effect',[+ore.toFixed(2)])}</div>`;
                desc = desc + `<div>${loc('tau_gas_ore_refinery_effect2',[max])}</div>`;
                desc = desc + `<div>${loc('tau_gas_ore_refinery_effect3',[refine])}</div>`;
                desc = desc + `<div>${loc('interstellar_stellar_forge_effect3',[this.smelting()])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
                return desc;
            },
            special: true,
            action(){
                if (payCosts(this)){
                    incrementStruct('ore_refinery','tauceti');
                    if (powerOnNewStruct(this)){
                        let num_smelters = this.smelting();
                        addSmelter(num_smelters, 'Steel', global.race['evil'] ? 'Wood' : 'Oil');
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, max: 0, fill: 0 },
                    p: ['ore_refinery','tauceti']
                };
            },
            post(){
                if (global.tech.tau_roid === 3){
                    global.tech.tau_roid = 4;
                    renderTauCeti();
                    drawTech();
                }
            }
        },
        whaling_station: {
            id: 'tauceti-whaling_station',
            title(){ return loc('tau_gas_whaling_station_title'); },
            desc(){
                return `<div>${loc('tau_gas_whaling_station_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'farming',
            reqs: { tau_whale: 1 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('whaling_station', r.offset, 72000000, 1.28, 'tauceti'); },
                Steel(r={}){ return spaceCostMultiplier('whaling_station', r.offset, 1800000, 1.28, 'tauceti'); },
                Polymer(r={}){ return spaceCostMultiplier('whaling_station', r.offset, 955000, 1.28, 'tauceti'); },
                Orichalcum(r={}){ return spaceCostMultiplier('whaling_station', r.offset, 268000, 1.28, 'tauceti'); },
            },
            powered(){ return powerCostMod(global.tech['isolation'] ? 2 : 6); },
            effect(){
                let blubber = global.tauceti.hasOwnProperty('whaling_station') ? global.tauceti.whaling_station.fill : 0;
                let max = global.tauceti.hasOwnProperty('whaling_station') ? global.tauceti.whaling_station.max : 0;
                let refine = +(production('whaling_station')).toFixed(2);
                let desc = `<div>${loc('tau_gas_whaling_station_effect',[+blubber.toFixed(2)])}</div>`;
                desc = desc + `<div>${loc('tau_gas_whaling_station_effect2',[max])}</div>`;
                desc = desc + `<div>${loc('tau_gas_whaling_station_effect3',[refine])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
                return desc;
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('whaling_station','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, max: 0, fill: 0 },
                    p: ['whaling_station','tauceti']
                };
            },
            post(){
                if (global.tech.tau_whale === 1){
                    global.tech.tau_whale = 2;
                    renderTauCeti();
                }
            }
        },
        womling_station: {
            id: 'tauceti-womling_station',
            title(){ return loc('tau_gas_womling_station_title'); },
            desc(){
                return `<div>${loc('tau_gas_womling_station_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'outpost',
            reqs: { womling_technicians: 1 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('womling_station', r.offset, 133400000, 1.26, 'tauceti'); },
                Furs(r={}){ return spaceCostMultiplier('womling_station', r.offset, 3805000, 1.26, 'tauceti'); },
                Aluminium(r={}){ return spaceCostMultiplier('womling_station', r.offset, 8500000, 1.26, 'tauceti'); },
                Nano_Tube(r={}){ return spaceCostMultiplier('womling_station', r.offset, 909000, 1.26, 'tauceti'); },
            },
            powered(){ return powerCostMod(global.tech['isolation'] ? 3 : 6); },
            effect(){
                let prod = global.tech['isolation'] ? 30 : 8;
                if (global.tech['womling_gene']){
                    prod *= 1.25;
                }
                let desc = `<div>${loc('production',[hugeEffect(prod, 2),tauCetiModules.tau_gas.info.name()])}</div>`;
                if (!global.race['flier']){
                    desc = desc + `<div>${loc('plus_max_resource',[jobScale(1),loc('job_resource_worker',[global.resource.Cement.name])])}</div>`;
                }
                desc = desc + `<div>${loc('space_red_fabrication_effect1',[jobScale(1)])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
                return desc;
            },
            action(){
                if (payCosts(this)){
                    global.civic.craftsman.display = true; // Unlikely but possible to unlock this way in Lone Survivor
                    incrementStruct('womling_station','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['womling_station','tauceti']
                };
            },
        },
        gas_shipyard: {
            id: 'tauceti-gas_shipyard',
            title(){ return loc('tau_shipyard_title'); },
            desc(){
                return `<div>${loc('tau_shipyard_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'outpost',
            reqs: { syard_fleet: 3 },
            condition(){ return global.tech['resettle'] ? false : true; },
            path: ['truepath'],
            cost: {
                Money(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('gas_shipyard') ? global.tauceti.gas_shipyard.count : 0)) < 1 ? 1000000000 : 0; },
                Aluminium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('gas_shipyard') ? global.tauceti.gas_shipyard.count : 0)) < 1 ? 135000000 : 0; },
                Titanium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('gas_shipyard') ? global.tauceti.gas_shipyard.count : 0)) < 1 ? 85000000 : 0; },
                Iridium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('gas_shipyard') ? global.tauceti.gas_shipyard.count : 0)) < 1 ? 125000000 : 0; },
                Neutronium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('gas_shipyard') ? global.tauceti.gas_shipyard.count : 0)) < 1 ? 2500000 : 0; },
                Unobtainium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('gas_shipyard') ? global.tauceti.gas_shipyard.count : 0)) < 1 ? 2000000 : 0; },
            },
            queue_complete(){ return 1 - (global.tauceti.hasOwnProperty('gas_shipyard') ? global.tauceti.gas_shipyard.count : 0); },
            effect(){
                return `<div>${loc('outer_shipyard_effect')}</div><div>${loc('tau_gas_shipyard_effect')}</div><div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
            },
            powered(){ return powerCostMod(50, true); },
            special: true,
            sAction(){
                if (p_on['gas_shipyard']){
                    global.settings.civTabs = 2;
                    global.settings.govTabs = 5;
                    if (!global.settings.tabLoad){
                        loadTab('mTabCivic');
                        clearPopper(`tauceti-gas_shipyard`);
                    }
                }
            },
            action(args){
                if (global.tauceti.gas_shipyard.count < 1 && payCosts(this)){
                    incrementStruct('gas_shipyard','tauceti');
                    if (powerOnNewStruct(this)){
                        global.settings.showShipYard = true;
                    }
                    drawShipYard();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['gas_shipyard','tauceti']
                };
            }
        },
        gas_mass_relay: {
            id: 'tauceti-gas_mass_relay',
            title(){ return loc('space_dwarf_mass_relay_title'); },
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('gas_mass_relay') || global.tauceti.gas_mass_relay.count < 100 || wiki){
                    return `<div>${loc('space_dwarf_mass_relay_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
            },
            type: 'megaproject',
            reqs: { syard_fleet: 3 },
            path: ['truepath'],
            condition(){
                return !global.tech['resettle'] && (!global.tauceti.hasOwnProperty('gas_mass_relay') || global.tauceti.gas_mass_relay.count < 100) ? true : false;
            },
            queue_size: 5,
            queue_complete(){ return 100 - (global.tauceti.hasOwnProperty('gas_mass_relay') ? global.tauceti.gas_mass_relay.count : 0); },
            cost: {
                Money(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('gas_mass_relay') ? global.tauceti.gas_mass_relay.count : 0)) < 100 ? 85000000 : 0; },
                Neutronium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('gas_mass_relay') ? global.tauceti.gas_mass_relay.count : 0)) < 100 ? 75000 : 0; },
                Adamantite(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('gas_mass_relay') ? global.tauceti.gas_mass_relay.count : 0)) < 100 ? 180000 : 0; },
                Positronium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('gas_mass_relay') ? global.tauceti.gas_mass_relay.count : 0)) < 100 ? 250 : 0; },
                Stanene(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('gas_mass_relay') ? global.tauceti.gas_mass_relay.count : 0)) < 100 ? 1000000 : 0; },
                Quantium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('gas_mass_relay') ? global.tauceti.gas_mass_relay.count : 0)) < 100 ? 250000 : 0; },
            },
            effect(wiki){
                let count = ((wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('gas_mass_relay') ? global.tauceti.gas_mass_relay.count : 0));
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('space_dwarf_mass_relay_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return tauCetiModules.tau_gas.gas_relay.effect();
                }
            },
            action(args){
                if (!global.tauceti.hasOwnProperty('gas_mass_relay')){ initStruct(this); }
                if (global.tauceti.gas_mass_relay.count < 100 && payCosts(this)){
                    global.tauceti.gas_mass_relay.count++;
                    if (global.tauceti.gas_mass_relay.count >= 100){
                        initStruct(tauCetiModules.tau_gas.gas_relay);
                        incrementStruct('gas_relay','tauceti');
                        powerOnNewStruct(tauCetiModules.tau_gas.gas_relay);
                        drawTech();
                        renderTauCeti();
                        clearPopper();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['gas_mass_relay','tauceti']
                };
            }
        },
        gas_relay: {
            id: 'tauceti-gas_relay',
            title(){ return loc('space_dwarf_mass_relay_title'); },
            desc(){
                return `<div>${loc('space_dwarf_mass_relay_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'megaproject',
            reqs: { syard_fleet: 3 },
            path: ['truepath'],
            condition(){
                return !global.tech['resettle'] && global.tauceti.hasOwnProperty('gas_mass_relay') && global.tauceti.gas_mass_relay.count >= 100 ? true : false;
            },
            wiki: false,
            queue_complete(){ return 0; },
            cost: {},
            powered(){
                return powerCostMod(50, true);
            },
            effect(){
                let charge = Math.floor(global.tauceti.gas_relay.charged / 10) / 10;
                return `<div>${loc('space_dwarf_mass_relay_effect2',[tauCetiModules.tau_gas.info.name()])}</div><div class="has-text-caution">${loc('minus_power',[this.powered()])}</div><div>${loc('space_dwarf_mass_relay_charged',[charge])}</div>`;
            },
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, charged: 0 },
                    p: ['gas_relay','tauceti']
                };
            }
        },
    },
    tau_roid: {
        info: {
            name(){
                return loc('tau_roid_title');
            },
            desc(){
                return loc('tau_roid_desc');
            },
            nav(){ return global.tech['resettle'] ? true : false; },
            support: 'patrol_ship',
            support_unlimited: true,
        },
        roid_mission: {
            id: 'tauceti-roid_mission',
            title(){
                return loc('space_mission_title',[loc('tau_roid_title')]);
            },
            desc(){
                return loc('space_mission_desc',[loc('tau_roid_title')]);
            },
            reqs: { tauceti: 5 },
            grant: ['tau_roid',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_roid >= 1 ? 0 : 1; },
            cost: {
                Helium_3(r={}){ return +int_fuel_adjust(1250000,false,r.wiki).toFixed(0); },
            },
            effect(){
                return loc('tau_roid_mission_effect',[loc('tau_roid_title')]);
            },
            action(){
                if (payCosts(this)){
                    messageQueue(loc('tau_roid_mission_result'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        patrol_ship: {
            id: 'tauceti-patrol_ship',
            title(){ return loc('tau_roid_patrol_ship'); },
            desc(){ return `<div>${loc('tau_roid_patrol_ship')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Helium_3.name])}</div>`; },
            type: 'ship',
            reqs: { tau_roid: 3 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('patrol_ship', r.offset, 45000000, 1.25, 'tauceti'); },
                Adamantite(r={}){ return spaceCostMultiplier('patrol_ship', r.offset, 1800000, 1.25, 'tauceti'); },
                Elerium(r={}){ return spaceCostMultiplier('patrol_ship', r.offset, 520, 1.25, 'tauceti'); },
                Stanene(r={}){ return spaceCostMultiplier('patrol_ship', r.offset, 2675000, 1.25, 'tauceti'); },
                Bolognium(r={}){ return spaceCostMultiplier('patrol_ship', r.offset, 1150000, 1.25, 'tauceti'); },
            },
            effect(){
                let fuel = +int_fuel_adjust(this.support_fuel().a).toFixed(1);
                let desc = `<div>${loc('tau_roid_patrol_ship_security',[this.support()])}</div>`;
                desc = desc + `<div>${loc('tau_roid_patrol_ship_effect')}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[this.support_fuel().r].name])}</div>`;
                return desc;
            },
            support_fuel(){ return { r: 'Helium_3', a: hugeAdjust(global.tech['isolation'] ? 15 : 250) }; },
            support(){ return global.tech['tau_roid'] && global.tech.tau_roid >= 7 ? 2 : 1; },
            powered(){ return 0; },
            refresh: true,
            action(){
                if (payCosts(this)){
                    incrementStruct('patrol_ship','tauceti');
                    global.tauceti.patrol_ship.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['patrol_ship','tauceti']
                };
            }
        },
        mining_ship: {
            id: 'tauceti-mining_ship',
            title(){ return loc('tau_roid_mining_ship'); },
            desc(){ return `<div>${loc('tau_roid_mining_ship')}</div>`; },
            type: 'ship',
            reqs: { tau_roid: 4 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('mining_ship', r.offset, 28000000, 1.28, 'tauceti'); },
                Uranium(r={}){ return spaceCostMultiplier('mining_ship', r.offset, 12500, 1.28, 'tauceti'); },
                Titanium(r={}){ return spaceCostMultiplier('mining_ship', r.offset, 2200000, 1.28, 'tauceti'); },
                Alloy(r={}){ return spaceCostMultiplier('mining_ship', r.offset, 1750000, 1.28, 'tauceti'); },
            },
            effect(){
                let fuel = +int_fuel_adjust(this.support_fuel().a).toFixed(1);
                let mine = +(production('mining_ship')).toFixed(2);
                let desc = `<div>${loc('tau_roid_mining_ship_effect',[mine])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[this.support_fuel().r].name])}</div>`;
                return desc;
            },
            s_type: 'tau_roid',
            support_fuel(){ return { r: 'Helium_3', a: hugeAdjust(global.tech['isolation'] ? 12 : 75) }; },
            support(){ return -1; },
            powered(){ return 0; },
            special: true,
            action(){
                if (payCosts(this)){
                    incrementStruct('mining_ship','tauceti');
                    powerOnNewStruct(this);
                    if (global.tauceti.mining_ship.count === 1){
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, common: 50, uncommon: 50, rare: 50 },
                    p: ['mining_ship','tauceti']
                };
            }
        },
        whaling_ship: {
            id: 'tauceti-whaling_ship',
            title(){ return loc('tau_roid_whaling_ship'); },
            desc(){ return `<div>${loc('tau_roid_whaling_ship')}</div>`; },
            type: 'ship',
            reqs: { tau_whale: 2 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('whaling_ship', r.offset, 35000000, 1.28, 'tauceti'); },
                Aluminium(r={}){ return spaceCostMultiplier('whaling_ship', r.offset, 3400000, 1.28, 'tauceti'); },
                Neutronium(r={}){ return spaceCostMultiplier('whaling_ship', r.offset, 168000, 1.28, 'tauceti'); },
                Nano_Tube(r={}){ return spaceCostMultiplier('whaling_ship', r.offset, 800000, 1.28, 'tauceti'); },
            },
            effect(){
                let fuel = +int_fuel_adjust(this.support_fuel().a).toFixed(1);
                let mine = +(production('whaling_ship')).toFixed(2);
                let desc = `<div>${loc('tau_roid_whaling_ship_effect',[mine])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[this.support_fuel().r].name])}</div>`;
                return desc;
            },
            s_type: 'tau_roid',
            support_fuel(){ return { r: 'Helium_3', a: hugeAdjust(global.tech['isolation'] ? 14 : 90) }; },
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts(this)){
                    incrementStruct('whaling_ship','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['whaling_ship','tauceti']
                };
            }
        },
        synthesizer: {
            id: 'tauceti-synthesizer',
            title(){ return loc('tau_roid_synthesizer_title'); },
            desc(){
                return `<div>${loc('tau_roid_synthesizer_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'industry',
            reqs: { tau_roid: 6 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return spaceCostMultiplier('synthesizer', r.offset, 90000000, 1.26, 'tauceti'); },
                Adamantite(r={}){ return spaceCostMultiplier('synthesizer', r.offset, 2500000, 1.26, 'tauceti'); },
                Graphene(r={}){ return spaceCostMultiplier('synthesizer', r.offset, 2000000, 1.26, 'tauceti'); },
                Elerium(r={}){ return spaceCostMultiplier('synthesizer', r.offset, 1250, 1.26, 'tauceti'); },
                Unobtainium(r={}){ return spaceCostMultiplier('synthesizer', r.offset, 72000, 1.26, 'tauceti'); },
            },
            support(){ return -1; },
            s_type: 'tau_roid',
            powered(){ return powerCostMod(10); },
            effect(){
                let pos = +(production('synthesizer')).toFixed(4);
                let desc = `<div>${loc('tau_roid_synthesizer_effect',[pos,global.resource.Positronium.name,tauCetiModules.tau_roid.mining_ship.title()])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
                return desc;
            },
            action(){
                if (payCosts(this)){
                    incrementStruct('synthesizer','tauceti');
                    powerOnNewStruct(this);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['synthesizer','tauceti']
                };
            }
        },
    },
    tau_gas2: {
        info: {
            name(n){
                return tauCetiModules.tau_gas.info.name(n || global.race['gas_name2'] || false, 'gas_name2');
            },
            desc(){
                return loc('tau_gas2_desc',[tauCetiModules.tau_gas.info.name()]);
            },
            nav(){ return global.tech['resettle'] ? true : false; }
        },
        gas_contest2: {
            id: 'tauceti-gas_contest2',
            title(){ return loc('tau_gas2_contest_title'); },
            desc(){ return loc('tau_gas2_contest_title'); },
            reqs: { tau_gas2: 1 },
            grant: ['tau_gas2',2],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_gas2 >= 1 ? 0 : 1; },
            cost: {
                Money(){ return 25000000; }
            },
            effect(){ return loc('tau_gas2_contest_effect'); },
            action(){
                if (payCosts(this)){
                    return true;
                }
                return false;
            },
            flair(){ return loc('tau_gas2_contest_flair'); }
        },
        alien_station_survey: {
            id: 'tauceti-alien_station_survey',
            title(){ return loc('tau_gas2_alien_station'); },
            desc(){ return loc('tau_gas2_alien_station'); },
            reqs: { tau_gas2: 3 },
            grant: ['tau_gas2',4],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_gas3 >= 4 ? 0 : 1; },
            cost: {
                Money(){ return global.race['lone_survivor'] ? 1500000000 : 3000000000; },
                Helium_3(){ return 5000000; }
            },
            effect(){ return loc('tau_gas2_alien_station_repair_effect',[tauCetiModules.tau_gas2.info.name()]); },
            action(){
                if (payCosts(this)){
                    initStruct(tauCetiModules.tau_gas2.alien_station);
                    messageQueue(loc('tau_gas2_alien_station_msg',[tauCetiModules.tau_gas2.info.name()]),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        alien_station: {
            id: 'tauceti-alien_station',
            title(){ return loc('tau_gas2_alien_station'); },
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('alien_station') || global.tauceti.alien_station.count < 100 || wiki){
                    return `<div>${loc('tau_gas2_alien_station')}</div>` + (global.tauceti.hasOwnProperty('alien_station') && global.tauceti.alien_station.count >= 100 ? `<div class="has-text-special">${loc('space_dwarf_reactor_desc_req')}</div>` : `<div class="has-text-special">${loc('tau_gas2_alien_station_repair')}</div>`);
                }
                else {
                    return `<div>${loc('tau_gas2_alien_station')}</div>`;
                }
            },
            type: 'outpost',
            reqs: { tau_gas2: 4 },
            condition(){ return global.tauceti.alien_station.count < 100 ? true : false; },
            path: ['truepath'],
            queue_size: 5,
            queue_complete(){ return 100 - global.tauceti.alien_station.count; },
            cost: {
                Money(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('alien_station') ? global.tauceti.alien_station.count : 0)) < 100 ? (global.race['lone_survivor'] ? 12000000 : 50000000) : 0; },
                Aluminium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('alien_station') ? global.tauceti.alien_station.count : 0)) < 100 ? (global.race['lone_survivor'] ? 256000 : 2560000) : 0; },
                Polymer(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('alien_station') ? global.tauceti.alien_station.count : 0)) < 100 ? (global.race['lone_survivor'] ? 198900 : 989000) : 0; },
                Mythril(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('alien_station') ? global.tauceti.alien_station.count : 0)) < 100 ? wom_recycle(125000) : 0; },
                Cipher(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('alien_station') ? global.tauceti.alien_station.count : 0)) < 100 ? (global.race['lone_survivor'] ? 256 : 2001) : 0; },
            },
            effect(wiki){
                let effectText = '';
                let count = (wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('alien_station') ? global.tauceti.alien_station.count : 0);
                if (count < 100){
                    effectText += `<div class="has-text-special">${loc('tau_gas2_alien_station_repaired',[count])}</div>`;
                    return effectText;
                }
                else {
                    return tauCetiModules.tau_gas2.alien_space_station.effect(wiki);
                }
            },
            action(){
                if (payCosts(this)){
                    if (global.tauceti.alien_station.count < 100){
                        incrementStruct('alien_station','tauceti');
                        if (global.tauceti.alien_station.count >= 100){
                            global.tech.tau_gas2 = 5;
                            global.tauceti['alien_space_station'] = { count: 1, on: 0 };
                            drawTech();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['alien_station','tauceti']
                };
            },
            post(){
                if (global.tauceti.hasOwnProperty('alien_space_station')){
                    if (global.resource.Elerium.diff >= 10){
                        global.tauceti.alien_space_station.on = 1;
                    }
                    renderTauCeti();
                }
            }
        },
        alien_space_station: {
            id: 'tauceti-alien_space_station',
            title(){ return loc('tau_gas2_alien_station'); },
            desc(){
                return `<div>${loc('tau_gas2_alien_station')}</div><div class="has-text-special">${loc('space_dwarf_reactor_desc_req')}</div>`;
            },
            reqs: { tau_gas2: 5 },
            path: ['truepath'],
            cost: {},
            queue_complete(){ return 0; },
            special(){ return global.tech['tau_gas2'] && global.tech.tau_gas2 === 6 && (!global.tech['alien_data'] || global.tech.alien_data < 6) ? true : false; },
            wiki: false,
            effect(){
                let fuel = this.p_fuel().a;
                let desc = `<div>${loc('space_dwarf_reactor_effect1',[-(this.powered())])}</div>`;
                if (global.tech['tau_gas2'] && global.tech.tau_gas2 >= 6 && global.tauceti.alien_space_station.hasOwnProperty('decrypted')){
                    let devisor = global.race['lone_survivor'] ? 100000 : 25000000;
                    let decrypted = +(global.tauceti.alien_space_station.decrypted / devisor).toFixed(2);
                    if (decrypted > 100){ decrypted = 100; }
                    desc = desc + `<div>${loc('tau_gas2_alien_station_effect',[decrypted])}</div>`;
                }
                desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[this.p_fuel().r].name])}</div>`;
                if (global.tech['m_ignite'] && global.tech.m_ignite >= 2){
                    desc = desc + `<div>${loc('tau_gas2_ignite_gas_giant_effect3')}</div>`;
                    desc += retireProjection();
                }
                return desc;
            },
            p_fuel(){ return { r: 'Elerium', a: ( (global.tech['m_ignite'] && global.tech.m_ignite >= 2) || global.race['lone_survivor'] ? 1 : 10) }; },
            powered(){ return powerModifier(-75, true); },
            action(){
                if (global.tech['m_ignite'] && global.tech.m_ignite >= 2){
                    retirement();
                    return true;
                }
                return false;
            }
        },
        matrioshka_brain: {
            id: 'tauceti-matrioshka_brain',
            title(){ return loc('tech_matrioshka_brain'); },
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('matrioshka_brain') || global.tauceti.matrioshka_brain.count < 1000 || wiki){
                    return `<div>${loc('tech_matrioshka_brain')}</div><div class="has-text-special">${loc('requires_segments',[1000])}</div>`;
                }
                else {
                    return `<div>${loc('tech_matrioshka_brain')}</div>`;
                }
            },
            type: 'megaproject',
            reqs: { tau_gas2: 7 },
            condition(){ return global.tauceti['matrioshka_brain'] ? true : false; },
            path: ['truepath'],
            queue_size: 50,
            queue_complete(){ return 1000 - global.tauceti.matrioshka_brain.count; },
            cost: {
                Money(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? 20000000 : 0; },
                Neutronium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? 45000 : 0; },
                Nano_Tube(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? 160000 : 0; },
                Adamantite(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? 666000 : 0; },
                Stanene(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? 61600 : 0; },
                Bolognium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? 44000 : 0; },
                Unobtainium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? 1200 : 0; },
                Mythril(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0)) < 1000 ? wom_recycle(64000) : 0; },
            },
            effect(wiki){
                let effectText = '';
                let count = (wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('matrioshka_brain') ? global.tauceti.matrioshka_brain.count : 0);
                if (count < 1000){
                    effectText += `<div class="has-text-special">${loc('tau_gas2_matrioshka_brain_seg',[1000 - count])}</div>`;
                }
                else if (global.tech['m_ignite'] && global.tech.m_ignite >= 2){
                    let boost = 50;
                    effectText += `<div>${loc('plus_max_resource',[boost+'%',global.resource.Knowledge.name])}</div>`;
                    if (global.resource.Positronium.display){
                        let store = Math.floor(global.resource.Knowledge.max / 1000);
                        effectText += `<div>${loc('plus_max_resource',[store.toLocaleString(),global.resource.Positronium.name])}</div>`;
                    }
                }
                return effectText;
            },
            aura(){ return global.tech['m_ignite'] && global.tech.m_ignite >= 2 ? 'ignite' : false; },
            action(){
                if (payCosts(this)){
                    if (global.tauceti.matrioshka_brain.count < 1000){
                        incrementStruct('matrioshka_brain','tauceti');
                        if (global.tauceti.matrioshka_brain.count >= 1000){
                            global.tech['m_brain'] = 1;
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['matrioshka_brain','tauceti']
                };
            },
        },
        ignition_device: {
            id: 'tauceti-ignition_device',
            title(){ return loc('tech_ignition_device'); },
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('ignition_device') || global.tauceti.ignition_device.count < 10 || wiki){
                    return `<div>${loc('tech_ignition_device')}</div><div class="has-text-special">${loc('requires_segments',[10])}</div>`;
                }
                else {
                    return `<div>${loc('tech_ignition_device')}</div>`;
                }
            },
            type: 'megaproject',
            reqs: { tau_gas2: 8 },
            condition(){ return global.tauceti['ignition_device'] && global.tauceti.ignition_device.count < 10 ? true : false; },
            path: ['truepath'],
            queue_size: 1,
            queue_complete(){ return 10 - global.tauceti.ignition_device.count; },
            cost: {
                Money(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0)) < 10 ? 250000000 : 0; },
                Uranium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0)) < 10 ? 50000 : 0; },
                Elerium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0)) < 10 ? 25000 : 0; },
                Graphene(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0)) < 10 ? 22500000 : 0; },
                Orichalcum(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0)) < 10 ? 15000000 : 0; },
                Quantium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0)) < 10 ? wom_recycle(8000000) : 0; },
            },
            effect(wiki){
                let effectText = '';
                let count = (wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('ignition_device') ? global.tauceti.ignition_device.count : 0);
                if (count < 10){
                    effectText += `<div class="has-text-special">${loc('tau_gas2_ignition_device_seg',[10 - count])}</div>`;
                }
                return effectText;
            },
            action(){
                if (payCosts(this)){
                    if (global.tauceti.ignition_device.count < 10){
                        incrementStruct('ignition_device','tauceti');
                        if (global.tauceti.ignition_device.count >= 10){
                            global.tech['m_ignite'] = 1;
                            renderTauCeti();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['ignition_device','tauceti']
                };
            },
        },
        ignite_gas_giant: {
            id: 'tauceti-ignite_gas_giant',
            title(){return loc('tau_gas2_ignite_gas_giant',[tauCetiModules.tau_gas2.info.name()]); },
            desc(){return loc('tau_gas2_ignite_gas_giant',[tauCetiModules.tau_gas2.info.name()]); },
            reqs: { tau_gas2: 8, m_ignite: 1 },
            grant: ['m_ignite',2],
            condition(){ return global.tech['m_ignite'] && global.tech.m_ignite >= 2 ? false : true; },
            queue_size: 1,
            queue_complete(){ return false; },
            path: ['truepath'],
            cost: {
                Helium_3(){ return 7500000; },
            },
            effect(){
                let desc = `<div>${loc('tau_gas2_ignite_gas_giant_effect',[loc('tech_matrioshka_brain')])}</div>`;
                if (!global.tech['m_brain']){
                    desc = desc + `<div class="has-text-warning">${loc('tau_gas2_ignite_gas_giant_effect2',[loc('tech_matrioshka_brain')])}</div>`;
                }
                return desc;
            },
            action(){
                if (global.tech['m_brain'] && payCosts(this)){
                    return true;
                }
                return false;
            }
        },
        adv_shipyard: {
            id: 'tauceti-adv_shipyard',
            title(){ return loc('tau_shipyard_title'); },
            desc(){
                return `<div>${loc('tau_shipyard_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'outpost',
            reqs: { resettle: 1 },
            path: ['truepath'],
            cost: {
                Money(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('adv_shipyard') ? global.tauceti.adv_shipyard.count : 0)) < 1 ? 1000000000 : 0; },
                Aluminium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('adv_shipyard') ? global.tauceti.adv_shipyard.count : 0)) < 1 ? 135000000 : 0; },
                Titanium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('adv_shipyard') ? global.tauceti.adv_shipyard.count : 0)) < 1 ? 85000000 : 0; },
                Iridium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('adv_shipyard') ? global.tauceti.adv_shipyard.count : 0)) < 1 ? 125000000 : 0; },
                Neutronium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('adv_shipyard') ? global.tauceti.adv_shipyard.count : 0)) < 1 ? 2500000 : 0; },
                Unobtainium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('adv_shipyard') ? global.tauceti.adv_shipyard.count : 0)) < 1 ? 5000000 : 0; },
            },
            queue_complete(){ return 1 - global.tauceti.adv_shipyard.count; },
            effect(){
                return `<div>${loc('outer_shipyard_effect')}</div><div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
            },
            powered(){ return powerCostMod(50, true); },
            special: true,
            sAction(){
                if (p_on['adv_shipyard']){
                    global.settings.civTabs = 2;
                    global.settings.govTabs = 5;
                    if (!global.settings.tabLoad){
                        loadTab('mTabCivic');
                        clearPopper(`tauceti-shipyard`);
                    }
                }
            },
            action(args){
                if (global.tauceti.adv_shipyard.count < 1 && payCosts(this)){
                    incrementStruct('adv_shipyard','tauceti');
                    if (powerOnNewStruct(this)){
                        global.settings.showShipYard = true;
                    }
                    drawShipYard();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['adv_shipyard','tauceti']
                };
            }
        },
        mass_relay: {
            id: 'tauceti-mass_relay',
            title(){ return loc('space_dwarf_mass_relay_title'); },
            desc(wiki){
                if (!global.tauceti.hasOwnProperty('mass_relay') || global.tauceti.mass_relay.count < 100 || wiki){
                    return `<div>${loc('space_dwarf_mass_relay_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
            },
            type: 'megaproject',
            reqs: { m_ignite: 3 },
            path: ['truepath'],
            condition(){
                return global.tauceti.mass_relay.count < 100 ? true : false;
            },
            queue_size: 5,
            queue_complete(){ return 100 - global.tauceti.mass_relay.count; },
            cost: {
                Money(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('mass_relay') ? global.tauceti.mass_relay.count : 0)) < 100 ? 85000000 : 0; },
                Neutronium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('mass_relay') ? global.tauceti.mass_relay.count : 0)) < 100 ? 75000 : 0; },
                Adamantite(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('mass_relay') ? global.tauceti.mass_relay.count : 0)) < 100 ? 180000 : 0; },
                Positronium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('mass_relay') ? global.tauceti.mass_relay.count : 0)) < 100 ? 250 : 0; },
                Stanene(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('mass_relay') ? global.tauceti.mass_relay.count : 0)) < 100 ? 1000000 : 0; },
                Quantium(r={}){ return ((r.offset || 0) + (global.tauceti.hasOwnProperty('mass_relay') ? global.tauceti.mass_relay.count : 0)) < 100 ? 250000 : 0; },
            },
            effect(wiki){
                let count = ((wiki?.count ?? 0) + (global.tauceti.hasOwnProperty('mass_relay') ? global.tauceti.mass_relay.count : 0));
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('space_dwarf_mass_relay_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return tauCetiModules.tau_gas2.tcm_relay.effect();
                }
            },
            action(args){
                if (global.tauceti.mass_relay.count < 100 && payCosts(this)){
                    global.tauceti.mass_relay.count++;
                    if (global.tauceti.mass_relay.count >= 100){
                        global.tech['m_ignite'] = 4;
                        initStruct(tauCetiModules.tau_gas2.tcm_relay);
                        incrementStruct('tcm_relay','tauceti');
                        powerOnNewStruct(tauCetiModules.tau_gas2.tcm_relay);
                        drawTech();
                        renderTauCeti();
                        clearPopper();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['mass_relay','tauceti']
                };
            }
        },
        tcm_relay: {
            id: 'tauceti-tcm_relay',
            title(){ return loc('space_dwarf_mass_relay_title'); },
            desc(){
                return `<div>${loc('space_dwarf_mass_relay_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            type: 'megaproject',
            reqs: { m_ignite: 4 },
            path: ['truepath'],
            condition(){
                return global.tauceti.mass_relay.count >= 100 ? true : false;
            },
            wiki: false,
            queue_complete(){ return 0; },
            cost: {},
            powered(){
                return powerCostMod(50, true);
            },
            effect(){
                let charge = Math.floor(global.tauceti.tcm_relay.charged / 10) / 10;
                return `<div>${loc('space_dwarf_mass_relay_effect2',[loc('tab_tauceti')])}</div><div class="has-text-caution">${loc('minus_power',[this.powered()])}</div><div>${loc('space_dwarf_mass_relay_charged',[charge])}</div>`;
            },
            action(args){
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, charged: 0 },
                    p: ['tcm_relay','tauceti']
                };
            }
        },
    },
};

for (let i=1; i<9; i++){
    tauCetiModules.tau_gas[`gas_contest-a${i}`] = {
        id: `tauceti-gas_contest-a${i}`,
        title(){ return tauCetiModules.tau_gas.info.name(i); },
        desc(){ return tauCetiModules.tau_gas.info.name(i); },
        reqs: { tau_gas: 1 },
        grant: ['tau_gas',2],
        path: ['truepath'],
        wiki: false,
        queue_complete(){ return global.tech.tau_gas >= 2 ? 0 : 1; },
        cost: {},
        effect(){ return loc(i === 8 ? 'tau_gas_contest_reject' : 'tau_gas_contest_pick',[tauCetiModules.tau_gas.info.name(i)]); },
        action(){
            if (payCosts(this)){
                global.race['gas_name'] = i;
                initStruct(tauCetiModules.tau_gas.refueling_station);
                return true;
            }
            return false;
        }
    };
    tauCetiModules.tau_gas2[`gas_contest-b${i}`] = {
        id: `tauceti-gas_contest-b${i}`,
        title(){ return tauCetiModules.tau_gas2.info.name(i); },
        desc(){ return tauCetiModules.tau_gas2.info.name(i); },
        reqs: { tau_gas2: 2 },
        grant: ['tau_gas2',3],
        path: ['truepath'],
        wiki: false,
        queue_complete(){ return global.tech.tau_gas2 >= 3 ? 0 : 1; },
        cost: {},
        effect(){ return loc(i === 8 ? 'tau_gas2_contest_reject' : 'tau_gas_contest_pick',[tauCetiModules.tau_gas2.info.name(i)]); },
        action(){
            if (payCosts(this)){
                global.race['gas_name2'] = i;
                return true;
            }
            return false;
        }
    }; 
}

function matrixProjection(){
    let gains = calcPrestige('matrix');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    let skilled = global.stats.retire === global.stats.matrix + 1 ? `<div class="has-text-advanced">${loc('tau_star_matrix_skilled',[1])}</div>` : ``;
    return `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.phage,loc('resource_Phage_name')])}</div><div class="has-text-advanced">${loc('tau_star_matrix_servants',[1])}</div>${skilled}`;
}

function retireProjection(){
    let gains = calcPrestige('retired');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    let skilled = global.stats.retire + 1 === global.stats.matrix ? `<div class="has-text-advanced">${loc('tau_star_matrix_skilled',[1])}</div>` : ``;
    return `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.phage,loc('resource_Phage_name')])}</div><div class="has-text-advanced">${loc('tau_star_matrix_servants',[1])}</div>${skilled}`;
}

function edenProjection(){
    let gains = calcPrestige('eden');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    return `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.phage,loc('resource_Phage_name')])}</div><div class="has-text-advanced">${loc('tau_star_matrix_servants',[1])}</div>`;
}

function defineWomlings(){
    initStruct(tauCetiModules.tau_red.overseer);
    initStruct(tauCetiModules.tau_red.womling_village);
    initStruct(tauCetiModules.tau_red.womling_mine);
    initStruct(tauCetiModules.tau_red.womling_fun);
    initStruct(tauCetiModules.tau_red.womling_farm);
    if (global.race['lone_survivor']){
        global.tauceti.womling_village.count = 2;
        global.tauceti.womling_village.on = 2;
        global.tauceti.womling_mine.count = 1;
        global.tauceti.womling_mine.on = 1;
    }
}

function wom_repulse(v){
    if (global.tech['womling_tech'] && global.tech['womling_logistics'] && global.tech.womling_logistics >= 2){
        v *= 0.94 ** global.tech.womling_tech;
    }
    return v;
}

function wom_recycle(v){
    if (global.tech['womling_tech'] && global.tech['womling_recycling'] && global.tech.womling_recycling >= 1){
        v *= (global.tech['isolation'] ? 0.97 : 0.98) ** global.tech.womling_tech;
    }
    return v;
}

export function outerTruthTech(){
    return outerTruth;
}

export function tauCetiTech(){
    return tauCetiModules;
}

// Womlings one village houses. Read by the game loop as well as the village's own effect text, so it
// lives in one place rather than being restated in both.
export function womlingVillagePop(){
    let pop = 5;
    if (global.tech['womling_pop']){
        if (global.tech.womling_pop >= 3){ pop = 8; }
        if (global.tech.womling_pop >= 2){ pop = 6; }
    }
    return hugeAdjust(pop);
}

// Womlings one farm can feed. Two farmers work a farm, so the loop halves this to get the per-farmer
// figure it caps the population with.
export function womlingFarmFood(){
    let food = global.tech['womling_pop'] && global.tech.womling_pop >= 3 ? 20 : (global.tech['womling_pop'] ? 16 : 12);
    if (global.tech['womling_gene']){ food += 4; }
    return food;
}

// Womlings one craftworks puts to work as artisans.
export const womlingArtisansPer = () => hugeAdjust(5);

// Womlings currently working the artisan job. Each one lends a skilled pair of hands to your own
// crafters and adds a percent to everything crafted, so the loop and the UI both read this.
export function womlingArtisans(){
    return global.tauceti && global.tauceti.hasOwnProperty('womling_craftworks') ? (global.tauceti.womling_craftworks.artisan || 0) : 0;
}

// Return overseer Womlings, including orbital-station workers.
export function womlingPop(){
    if (!global.tauceti || !global.tauceti['overseer']){ return 0; }
    let pop = global.tauceti.overseer.pop || 0;
    if (p_on['womling_station']){ pop += Math.floor(hugeAdjust(p_on['womling_station']) * 2); }
    return pop;
}

// Return active Womling market routes.
export function womlingMarketRoutes(){
    return Math.floor(hugeAdjust(support_on['womling_market'] || 0) * (support_on['womling_village'] || 0));
}

export function tauEnabled(){
    if (global.tech['tauceti'] && global.tech.tauceti >= 4){
        return true;
    }
    return false;
}

export function checkPathRequirements(era,region,action){
    switch (era){
        case 'tauceti':
            return checkRequirements(tauCetiModules,region,action);
    }
}

// Structures the horde can raze, per infested region.
const razeTargets = {
    spc_moon: { c: 'space', s: ['moon_base','iridium_mine','helium_mine','observatory'] },
    spc_red: { c: 'space', s: ['spaceport','red_tower','living_quarters','pylon','vr_center','garage','red_mine','fabrication','red_factory','biodome','exotic_lab','ziggurat','space_barracks','botanical'] },
    spc_venus: { c: 'space', s: ['cloud_city','nitrogen_harvester','cloud_quarters','industrial_complex','workshop','university'] },
    spc_hell: { c: 'space', s: ['geothermal','hell_smelter','spc_casino','swarm_plant','mercury_mine'] },
    spc_titan: { c: 'space', s: ['titan_spaceport','electrolysis','hydrogen_plant','titan_quarters','titan_mine','storehouse','titan_bank','g_factory','sam','decoder','ai_colonist','metalworks','comedy_club'] },
    //spc_enceladus: { c: 'space', s: ['water_freighter','zero_g_lab','operating_base','munitions_depot'] },
    //spc_dwarf: { c: 'space', s: ['elerium_contain','e_reactor'] },
    tau_home: { c: 'tauceti', s: ['colony','tau_housing','pylon','tau_farm','mining_pit','fusion_generator','repository','tau_factory','infectious_disease_lab','tauceti_casino','tau_cultural_center','marine_barracks','data_decoder'] },
    tau_red: { c: 'tauceti', s: ['overseer','womling_village','womling_farm','womling_mine','womling_fun','womling_lab','womling_craftworks','womling_market','antimatter_reactor','womling_rangers'] }
};

// Ships shoot the horde from orbit, but bombardment is a blunt instrument against a scattered mob —
// their firepower counts for a fraction of what the same fight is worth with boots on the ground.
const orbitalStrikeRate = 0.05;
// Survivors razed per day: one structure guaranteed per this many zombies still active, with the
// remainder rolled as a fractional chance, and never more than razeCap in a single day.
const zombiesPerRazing = 100000;
const razeCap = 5;
// Starting infected Planets
const hiddenInfestation = ['spc_red','spc_titan'];
// Don't advertise
const inertInfestation = ['spc_home'];

// Daily war messages
function zMessage(msg,type){
    if (fleetCmd()['zquiet']){ return; }
    messageQueue(msg,type,false,['combat']);
}

// True once a region's horde is known about, which for everywhere but hiddenInfestation is immediately.
function infestationFound(region){
    return !hiddenInfestation.includes(region) || (global.race['zfound'] ? global.race.zfound[region] : false);
}

// Zombies to display for a region, or 0 when there is nothing to show (empty, or still undiscovered).
export function infestationCount(region){
    if (!global.race['zhorde'] || !global.race.zhorde[region] || inertInfestation.includes(region) || !infestationFound(region)){
        return 0;
    }
    return global.race.zhorde[region];
}

// The infestation readout that renders alongside a region's support line. Returns markup only when the
// region currently has a visible horde; the v-show then hides it again if the horde is wiped out.
export function infestationLabel(region){
    if (infestationCount(region) <= 0){ return ``; }
    return ` <span class="infestation has-text-caution" v-show="zombies()">${loc('space_infestation')} <span class="has-text-danger">{{ zombieCount() }}</span></span>`;
}

// The assault warning that hangs under Earth. Bound to global.race.zfleet rather than written once, so
// the countdown follows the day clock without anything having to redraw the region.
export function zAssaultBanner(region){
    if (region !== 'spc_home'){ return ``; }
    return `<div class="zassault has-text-danger" v-show="warn()"><span :class="pulse()">{{ warnText() }}</span></div>`;
}

export function zAssaultMethods(){
    return {
        warn(){ return zUplinkWarning() || (zAssault() && !zEndless()) ? true : false; },
        // Only the signature warning pulses; once it becomes a countdown it holds still so the number stays readable.
        pulse(){ return zUplinkWarning() ? 'zpulse' : ''; },
        warnText(){
            return zUplinkWarning()
                ? loc('zfleet_uplink_banner_signatures')
                : loc('zfleet_uplink_banner_survive',[zAssaultLeft()]);
        }
    };
}

// The warning that hangs under Venus while the horde holds its orbit.
export function blockadeBanner(region){
    if (region !== 'spc_venus'){ return ``; }
    return `<div class="zassault has-text-danger" v-show="blockaded()"><span class="zpulse">{{ blockadeText() }}</span></div>`;
}

export function blockadeMethods(){
    return {
        blockaded(){ return venusBlockade() > 0; },
        blockadeText(){ return loc('space_venus_blockade_danger'); }
    };
}

export function infestationMethods(region){
    return {
        zombies(){ return infestationCount(region); },
        // Exact mode: the count ticks down a little every day, and rounding it to "40K" would hide that.
        zombieCount(){ return sizeApproximation(infestationCount(region),1,false,true); }
    };
}

export function trackInfestation(){
    if (!global.race['zhorde']){
        global.race['zhorde'] = {
            spc_home: 9000000000, // Earth
            spc_moon: 0, // Moon
            spc_red: 40000, // Mars
            spc_venus: 0, // Venus
            spc_hell: 0, // Mercury
            spc_titan: 25000, // Titan (Saturn)
            spc_enceladus: 0, // Enceladus (Saturn)
            spc_dwarf: 0, // Ceres
            tau_home: 0, // Tau Ceti Homeworld
            tau_red: 0 // Tau Ceti Womling World
        };
    }

    Object.keys(global.race.zhorde).forEach(function(region){
        if (!inertInfestation.includes(region) && global.race.zhorde[region] > 0){
            infestationCombat(region);
        }
    });

    zTitanWatch();
    zFleetDay();
    if (fleetCmdUnlocked()){ fleetCmdDay(); }
}

// Prevent infestation from spiralling infinitely. Once current infestation reaches the softcap, crashing enemy ships 
// start accidentally hitting existing zombies, which effectively reduces their incoming numbers. 
// infestationSoftCapCrushed indicates the amount crushed by a landed ship, reaching a hardcap at 2*softcap.
// Thresholds are the same as zFleetHulls.
export function infestationSoftCap(resettle){
    let resettleStage = resettle ?? global.tech.resettle ?? 0;
    if (global.tech.overmind) // Bleed Overmind
        return Infinity;
    if (resettleStage < 11) // Initial resettlement
        return 25000;
    if (resettleStage >= 11 && resettleStage < 14) // Zombie Intelligence Tech
        return 40000;
    if (resettleStage >= 14 && resettleStage < 19) // Zombie Counter Tech, before Assault
        return 80000;
    if (resettleStage == 19) // Sever Uplink Assault
        return 160000;
    if (resettleStage >= 20) // After Assault
        return 80000;
}
export function infestationSoftCapCrushed(current, amount){
    let softCap = infestationSoftCap();
    if (current <= softCap) // Not enough infestation on surface to hit anything accidentally
        return 0;

    if (current >= softCap * 2) // Hardcap, on average hits the same amount as incoming
        return Math.round(amount * seededRandom(0.75, 1.25, true));

    // Quadratically increasing up to hardcap
    let x = current / softCap - 1; //0..1
    return Math.round(amount * (x * x) * seededRandom(0.75, 1.25, true));
}

// Regions the resettlement arc keeps off the board until Titan is properly reoccupied. Until then their
// hordes are unknown and their ruins are not yours to worry about.
const titanRegions = ['spc_titan','spc_enceladus'];

// True once Titan has been reoccupied far enough to see what is down there.
export function titanReclaimed(){
    return global.tech['resettle'] && global.tech.resettle >= 13 ? true : false;
}

// Titan's support grid, whatever survived the razing. This is the baseline the reveal measures against.
function titanSupportMax(){
    return global.space['electrolysis'] && global.space.electrolysis['s_max'] > 0 ? global.space.electrolysis.s_max : 0;
}

// Titan's horde 
function zTitanWatch(){
    if (titanReclaimed()){ return; }
    // Ordered behind the outer distress signals, so the stages cannot be leapfrogged.
    if (!global.tech['resettle'] || global.tech.resettle < 12){ return; }
    // Saves that reached the beacons before this existed get their baseline on the next day.
    if (!(titanSupportMax() > 0)){ return; }

    global.tech['resettle'] = 13;
    if (!global.race['zfound']){ global.race['zfound'] = {}; }
    global.race.zfound['spc_titan'] = true;
    messageQueue(loc('zfleet_titan_found',[regionName('spc_titan')]),'danger',false,['combat','progress']);
    renderSpace();
}

// Infested Fleet
function zFleetTargets(){
    let targets = ['spc_red','spc_hell'];
    if (global.tech['luna'] && global.tech.luna >= 3){ targets.push('spc_moon'); }
    if (global.tech['resettle'] && global.tech.resettle >= 13){ targets.push('spc_titan'); }
    if (global.tech['resettle'] && global.tech.resettle >= 19){
        targets.push('spc_venus');
        targets.push('tau_home');
        targets.push('tau_red');
    }
    return targets;
}

// Hulls the zombie horde flies, smallest first. `weight` is how often a class comes up relative to the others
const zFleetHulls = {
    corvette:      { weight(){ return global.tech['resettle'] && global.tech.resettle >= 19 ? 0 : 1; }, avail(){ return true; },  horde(){ return 350; } },
    frigate:       { weight(){ return 1; },   avail(){ return global.tech['overmind'] ? false : true; },  horde(){ return 825; } },
    destroyer:     { weight(){ return 1; },   avail(){ return global.tech['resettle'] && global.tech.resettle >= 11 ? true : false; }, horde(){ return 1700; } },
    cruiser:       { weight(){ return 1; },   avail(){ return global.tech['resettle'] && global.tech.resettle >= 14 ? true : false; }, horde(){ return 4100; } },
    battlecruiser: { weight(){ return global.tech['resettle'] && global.tech.resettle >= 19 ? 1 : 0.5; }, avail(){ return global.tech['resettle'] && global.tech.resettle >= 15 ? true : false; }, horde(){ return 10300; } },
    dreadnought:   { weight(){ return global.tech['overmind'] ? 1 : 0.5; }, avail(){ return global.tech['resettle'] && global.tech.resettle >= 19 && global.tech.resettle < 20 || global.tech['overmind'] ? true : false; }, horde(){ return 24750; } }
};

// The classes cleared to fly right now.
function zFleetClasses(){
    return Object.keys(zFleetHulls).filter(function(cls){
        let avail = zFleetHulls[cls].avail;
        return typeof avail === 'function' ? avail() : avail ? true : false;
    });
}

// How often a class comes up, read the same way avail is: a function is called, anything else is taken
// as the rate itself, and a class that names no rate is drawn as often as an ordinary hull.
function zFleetWeight(cls){
    let weight = zFleetHulls[cls].weight;
    if (typeof weight === 'function'){ weight = weight(); }
    return weight === undefined ? 1 : weight;
}

// One class drawn from those cleared to fly, by weight rather than evenly. Each hull of a sortie is
// rolled on its own, so a pair can still come up two heavy.
function zFleetClass(avail){
    let total = avail.reduce((sum,cls) => sum + zFleetWeight(cls),0);
    if (!(total > 0)){ return avail[Math.floor(seededRandom(0,avail.length,true))]; }
    let roll = seededRandom(0,total,true);
    for (let cls of avail){
        roll -= zFleetWeight(cls);
        if (roll < 0){ return cls; }
    }
    return avail[avail.length - 1];
}

// Zombie ships are constructed with legacy tech only
const zFleetParts = {
    power: ['solar','diesel','fission','fusion','elerium'],
    weapon: ['railgun','laser','p_laser','plasma','phaser','disruptor'],
    armor: ['steel','alloy','neutronium'],
    engine: ['ion','tie','pulse','photon','vacuum'],
    sensor: ['visual','radar','lidar','quantum']
};

const zFleetDelayMin = 10;      // game days after the trigger before the first hull can lift
const zFleetDelayMax = 25;
const zFleetRampDays = 150;     // days of raiding before launches and cargoes reach full strength
const zFleetOddsStart = 0.08;   // chance of a launch on the first day
const zFleetOddsEnd = 0.40;     // ...and once the ramp is complete.
const zAssaultOdds = 0.60;       // stands in for the above during the assault.
const zFleetLoadStart = 0.25;   // share of a hull's cargo that lands on the first day

// --- The zombie assault ---------------------------------------------------------------------------
const zUplinkSilent = 25;     // game days of nothing whatsoever after the uplink is cut
const zUplinkWarn = 5;        // days the warning hangs over Earth before the assault proper
const zUplinkSurvive = 100;   // days the assault runs

// Days since the uplink was severed, or false on a run that never cut it.
export function zUplinkDays(){
    let fleet = global.race['zfleet'];
    return fleet && typeof fleet.uz === 'number' ? fleet.uz : false;
}

// The horde is massing and sending nothing: from the moment the uplink is cut until the assault opens.
function zUplinkSilence(){
    let d = zUplinkDays();
    return d !== false && d < zUplinkSilent + zUplinkWarn;
}

// The warning is up but the assault has not started. resettle stays at 18 through this.
export function zUplinkWarning(){
    let d = zUplinkDays();
    return d !== false && d >= zUplinkSilent && d < zUplinkSilent + zUplinkWarn;
}

// Brainless route activated
export function zEndless(){
    return global.tech['overmind'] ? true : false;
}

// zAssault active
export function zAssault(){
    return (global.tech['resettle'] && global.tech.resettle === 19) || zEndless() ? true : false;
}

// Days still to survive, for the banner's countdown.
export function zAssaultLeft(){
    let d = zUplinkDays();
    if (d === false){ return 0; }
    let left = zUplinkSurvive - (d - zUplinkSilent - zUplinkWarn);
    return left > 0 ? left : 0;
}

// Zombies still holding ground anywhere. Deliberately not infestationCount: that reports 0 for a horde
// nobody has found yet, and one lying low on Mars or Titan has not been dealt with.
export function zInfestationLeft(){
    if (!global.race['zhorde']){ return 0; }
    let left = 0;
    Object.keys(global.race.zhorde).forEach(function(region){
        // Earth's billions are a fact of the setting, not something a fleet can work on.
        if (inertInfestation.includes(region)){ return; }
        if (global.race.zhorde[region] > 0){ left += global.race.zhorde[region]; }
    });
    return left;
}

// Structures the horde pulled down that have not been put back up.
export function zRazedLeft(){
    let razed = 0;
    Object.keys(razeTargets).forEach(function(region){
        let cat = razeTargets[region].c;
        if (!global[cat]){ return; }
        razeTargets[region].s.forEach(function(s){
            if (global[cat][s] && global[cat][s].razed > 0){ razed += global[cat][s].razed; }
        });
    });
    return razed;
}

// The system swept clean: nothing left alive out there and nothing left in ruins. Only ever looked at
// while the arc is sitting at 20, so it cannot fire before the assault or a second time after it.
function zRecoveryWatch(){
    if (!global.tech['resettle'] || global.tech.resettle !== 20){ return; }
    if (zInfestationLeft() > 0 || zRazedLeft() > 0){ return; }
    global.tech.resettle = 21;
    drawTech();
    renderSpace();
    messageQueue(loc('zfleet_recovered'),'success',false,['combat','progress']);
    zombieGenociderTask('z4');
}

// Everything still standing that the horde is able to take, across every region it can reach. Read
// off razeTargets so it can never disagree with what razing actually removes.
export function zRazeStanding(){
    let standing = 0;
    Object.keys(razeTargets).forEach(function(region){
        let cat = razeTargets[region].c;
        if (!global[cat]){ return; }
        razeTargets[region].s.forEach(function(s){
            if (global[cat][s] && global[cat][s].count > 0){ standing += global[cat][s].count; }
        });
    });
    return standing;
}

// How long the screen bleeds before the reset actually runs.
const zBleedTime = 4000;
const zBleedDrips = 26;

// The screen bleeding out. A sheet of red runs down from the top edge with a scatter of drips leading
// ahead of it, and the run ends underneath it.
function zBleedOut(){
    if (webWorker.w){
        webWorker.w.terminate();
    }
    clearPopper();

    let drips = ``;
    for (let i=0; i<zBleedDrips; i++){
        // Scattered rather than evenly spaced, so it reads as something running rather than a bar chart.
        let left = +(seededRandom(0,100,true)).toFixed(2);
        let width = +(seededRandom(0.4,2.6,true)).toFixed(2);
        drips += `<div class="bleed-drip" style="left:${left}%;width:${width}rem"></div>`;
    }
    $(`body`).append(`<div id="zBleed" class="bleed-wrapper"><div class="bleed-sheet"></div>${drips}</div>`);

    // The drips run ahead of the sheet and each at its own pace; the sheet then closes over the lot.
    $(`#zBleed .bleed-drip`).each(function(){
        $(this).animate({ height: `${Math.round(seededRandom(25,105,true))}%` },
            Math.round(seededRandom(zBleedTime * 0.35,zBleedTime * 0.85,true)));
    });
    $(`#zBleed .bleed-sheet`).animate({ height: '100%' }, Math.round(zBleedTime * 0.9));

    setTimeout(function(){
        zApocalypse();
    }, zBleedTime);
}

// Watch for the end. Only armed once the Overmind begins its endless assault.
function zApocalypseWatch(){
    if (!zEndless() || global.race['zapoc']){ return; }
    if (zRazeStanding() > 0){ return; }
    global.race['zapoc'] = true;
    zBleedOut();
}

// Advance the uplink clock and move the arc on when it reaches each mark.
function zUplinkWatch(fleet){
    if (!global.tech['resettle'] || global.tech.resettle < 18){ return; }
    if (typeof fleet.uz !== 'number'){ fleet.uz = 0; }
    if (fleet.uz >= zUplinkSilent + zUplinkWarn + zUplinkSurvive){ return; }
    fleet.uz++;

    if (fleet.uz === zUplinkSilent){
        global.settings.civTabs = 1;
        renderSpace();
        messageQueue(loc('zfleet_uplink_signatures',[regionName('spc_home')]),'danger',false,['combat','progress']);
    }
    else if (fleet.uz === zUplinkSilent + zUplinkWarn){
        global.tech.resettle = 19;
        drawTech();
        renderSpace();
        messageQueue(loc('zfleet_uplink_assault',[zUplinkSurvive]),'danger',false,['combat','progress']);
    }
    else if (fleet.uz === zUplinkSilent + zUplinkWarn + zUplinkSurvive){
        global.tech.resettle = 20;
        drawTech();
        renderSpace();
        messageQueue(loc('zfleet_uplink_survived'),'success',false,['combat','progress']);
    }
}

// Ships in one sortie.
const zAssaultSizes = [[0.50,3],[0.35,4],[0.15,5]];
const zAftermathSizes = [[0.50,1],[0.40,2],[0.10,3]];
function zFleetSize(fleet){
    if (global.tech.overmind){
        // Sizes get progressively larger as overmind keeps being bled.
        // Each survived 20 days adds on average +1 ship to the fleet size
        let rampDays = global.race.daysSinceBleedOvermind ?? 0;

        let baseAmount = Math.floor(rampDays / 20);
        let remainder = rampDays / 20 - baseAmount;
        if (seededRandom(0, 1, true) < remainder)
            baseAmount++;
        
        let roll = seededRandom(0, 1, true);
        for (let i=0; i < zAssaultSizes.length; i++){
            roll -= zAssaultSizes[i][0];
            if (roll < 0)
                return baseAmount + zAssaultSizes[i][1];
        }
        return baseAmount + zAssaultSizes[zAssaultSizes.length - 1][1];
    }

    let table = zAssault() ? zAssaultSizes : (global.tech['resettle'] && global.tech.resettle >= 20 ? zAftermathSizes : false);
    if (table){
        let roll = seededRandom(0,1,true);
        for (let i=0; i<table.length; i++){
            roll -= table[i][0];
            if (roll < 0){ return table[i][1]; }
        }
        return table[table.length - 1][1];
    }
    return fleet.tw && seededRandom(0,1,true) < zPairOdds ? zPairSize : 1;
}

// The final tech list for zombie fleets, only the best.
const zOvermindParts = {
    power: 'elerium',
    weapon: 'disruptor',
    armor: 'neutronium',
    engine: 'vacuum',
    sensor: 'quantum'
};

// What the horde fleet ships can equip.
function zFleetPartRange(part){
    if (zEndless() && zOvermindParts.hasOwnProperty(part)){ return [zOvermindParts[part]]; }
    if (!zAssault()){ return zFleetParts[part]; }
    switch (part){
        case 'power':  return zFleetParts.power.slice(4);    // elerium, nothing else
        case 'weapon': return zFleetParts.weapon.slice(3);   // plasma, phaser or disruptor
        case 'sensor': return zFleetParts.sensor.slice(1);   // anything better than visual
        case 'engine': return zFleetParts.engine.slice(1);   // never ion
    }
    return zFleetParts[part];
}

// The one scripted sortie: days after Titan comes under threat, then where it goes and what flies it.
const zTauStrikeDay = 100;
const zTauStrikeTarget = 'tau_home';
const zTauStrikeHulls = ['cruiser','frigate','frigate'];
// Having managed that once, the horde starts sending some of its ordinary raids out in company.
const zPairOdds = 0.25;
const zPairSize = 2;

// One day of the infested fleet: arm the countdown when the conditions are met, advance anything under
// way, then decide whether another hull lifts.
function zFleetDay(){
    // The whole system belongs to the resettlement arc; nothing here happens on a run that never went
    // back to Sol.
    if (!global.tech['resettle']){ return; }

    if (!global.race['zfleet']){
        // Mercury salvaged and Mars swept clean: the horde on Earth notices, and starts preparing.
        if (global.tech['hell'] && global.tech.hell >= 3 && global.race.zhorde['spc_red'] === 0){
            global.race['zfleet'] = { t: Math.floor(seededRandom(zFleetDelayMin,zFleetDelayMax + 1,true)), d: 0, s: [] };
        }
        return;
    }

    if (global.tech.resettle === 9){
        global.tech.resettle = 10;
    }

    let fleet = global.race.zfleet;
    if (!fleet.s){ fleet.s = []; }

    zUplinkWatch(fleet);
    zRecoveryWatch();
    zFleetMove(fleet);

    // The blockade runs on its own rules rather than act like a raid
    zVenusBlockade(fleet);
    zBlockadeDay(fleet);

    if (fleet.t > 0){
        fleet.t--;
        if (fleet.t === 0){
            messageQueue(loc('zfleet_first_launch',[regionName('spc_home')]),'danger',false,['combat','progress']);
        }
        return;
    }

    fleet.d++;
    zTauStrike(fleet);
    let ramp = Math.min(fleet.d / zFleetRampDays, 1);
    // Nothing lifts at all while the horde is massing for the assault. Anything already under way
    // still flies its leg — zFleetMove above runs regardless — this only stops new launches.
    if (!zUplinkSilence()){
        // Through the assault enemy fleets take off more frequently.
        let oddsEnd = zAssault() ? zAssaultOdds : zFleetOddsEnd;
        if (seededRandom(0,1,true) < zFleetOddsStart + (oddsEnd - zFleetOddsStart) * ramp){
            zFleetLaunch(fleet,ramp);
        }
    }

    zGroundFire(fleet);

    // Last thing in the day, so a razing that finishes the job this morning ends the run this evening
    // rather than a day later.
    zApocalypseWatch();
}

const zGroundFireDay = 50;      // days after the first hull lifts before the surface starts shooting back
const zGroundFireMin = 2;       // hull points an unarmoured ship in orbit loses per day once it does
const zGroundFireMax = 9;
const zGroundFireTargets = 2;         // ships the batteries can track and engage in one day
const zAssaultGroundFireTargets = 5;  // ...and during the assault, with the whole surface firing at once

// How many ships the surface can hold a firing solution on.
function zGroundFireCount(){
    let targets = zAssault() ? zAssaultGroundFireTargets : zGroundFireTargets;
    if (global.race.universe === 'micro'){ targets *= 2; } // Not everything in life is fair.
    return targets;
}

// Plating is described against steel, which is the zero point for both figures: it soaks a full hit.
function armorDesc(armor){
    let desc = loc(`outer_shipyard_armor_${armor}_desc`);
    if (armor === 'steel'){ return `${desc} ${loc(`outer_shipyard_armor_baseline`)}`; }

    let steel = loc(`outer_shipyard_armor_steel`);
    let notes = [];

    let soak = shipArmorSoak.hasOwnProperty(armor) ? shipArmorSoak[armor] : shipArmorSoak.steel;
    let cut = Math.round((1 - soak / shipArmorSoak.steel) * 100);
    if (cut > 0){ notes.push(loc(`outer_shipyard_armor_soak`,[cut,steel])); }

    let bp = global.space.shipyard.blueprint;
    let plain = shipSpeed(Object.assign({},bp,{ armor: 'steel' }));
    let clad = shipSpeed(Object.assign({},bp,{ armor: armor }));
    let delta = Math.round((clad / plain - 1) * 100);
    if (delta !== 0){
        notes.push(loc(delta > 0 ? `outer_shipyard_armor_faster` : `outer_shipyard_armor_slower`,[Math.abs(delta),steel]));
    }

    return notes.length ? `${desc} ${notes.join(' ')}` : desc;
}

// Whatever taught the horde to fly also taught it to aim. Some weeks after the first launch, anything
// of yours sitting over Earth starts taking fire from the ground.
function zGroundFire(fleet){
    if (typeof fleet.l !== 'number' || fleet.d - fleet.l < zGroundFireDay){ return; }
    if (!global.space.hasOwnProperty('shipyard') || !global.space.shipyard.hasOwnProperty('ships')){ return; }

    // Everything parked over Earth is in range, but the batteries can only hold a firing solution on so
    // a few targets per day. The same hull is never shot twice in one day.
    let overhead = global.space.shipyard.ships.filter(s => shipDockedAt(s) === 'spc_home');

    let hit = 0;
    // Drawn without replacement, so the same hull is never worked over twice in one day.
    let targets = zGroundFireCount();
    for (let i=0; i<targets && overhead.length > 0; i++){
        let ship = overhead.splice(Math.floor(seededRandom(0,overhead.length,true)),1)[0];
        // Armour soaks part of every hit, but never all of it — a barrage that lands still scores. A
        // flagship's escort screens it here the same as it does under fire in orbit.
        let dmg = seededRandom(zGroundFireMin,zGroundFireMax + 1,true) * shipArmorFactor(ship) * (1 - fleetDamageSoak(ship));
        ship.damage += Math.max(1,Math.floor(dmg));
        if (ship.damage > 90){ ship.damage = 90; }
        hit++;
    }

    if (hit > 0 && !fleet.gf){
        fleet.gf = true;
        messageQueue(loc('zfleet_ground_fire',[regionName('spc_home')]),'danger',false,['combat','progress']);
    }
}

// Space Combat

const zCombatSpeedWeight = 2;      // how hard a target's speed works against a firing solution
const zCombatDamageDivisor = 50;  // firepower per point of hull damage

// A player fleet uses combined scan value
function playerAccuracy(scan,foe){
    if (scan <= 0){ return 0; }
    let evade = Math.max(1,shipSpeed(foe)) * zCombatSpeedWeight;
    return scan / (scan + evade);
}

// The horde aims with whatever each hull was built with, one ship at a time.
const zSensorAccuracy = { visual: 0.15, radar: 0.3, lidar: 0.45, quantum: 0.6 };
const zHomeAccuracy = 2;    // accuracy multiplier for the horde while the fight is over Earth
function foeAccuracy(foe,locationName){
    let acc = zSensorAccuracy.hasOwnProperty(foe.sensor) ? zSensorAccuracy[foe.sensor] : 0.25;
    if (locationName === 'spc_home'){ acc *= zHomeAccuracy; }
    // Accuracy over 100% is reduced to 100%
    return Math.min(1,acc);
}

// How much harder the horde hits once the Overmind final assault is launched.
const zOvermindDamage = 10;

// Firepower turned into hull damage.
function combatDamage(attacker,defender){
    // A station firing beyond its own orbit lands only part of its firepower.
    let raw = shipAttackPower(attacker) * (attacker.fire ?? 1) / zCombatDamageDivisor;
    // Apply corsair weapons independently from horde weapon bonuses.
    if (attacker.enemy && !attacker.syn && zEndless()){ raw *= zOvermindDamage; }
    return Math.max(1,Math.round(raw * shipArmorFactor(defender) * shipClassFactor(defender) * (1 - fleetDamageSoak(defender))));
}

// Your ships holding a location, able to shoot.
function guardsAt(locationName){
    let guards = [];
    if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
        guards = global.space.shipyard.ships.filter(s => shipDockedAt(s) === locationName);
    }
    // Sector Command defends Jupiter and Ganymede alongside anything in orbit.
    const station = sectorCommandGuard(locationName);
    if (station){ guards.push(station); }
    return guards;
}

// A ship shot out from under its crew. The ship is gone from the roster and the crew with it.
function destroyPlayerShip(ship,locationName){
    if (ship.station){ sectorCommandDown(locationName); return; }
    let crew = shipCrewSize(ship);
    // Losing the flagship scatters the fleet it was holding together, so stand it down before the hull
    // leaves the roster and the fleet id goes with it.
    leaveFleet(ship);
    let idx = global.space.shipyard.ships.indexOf(ship);
    if (idx >= 0){ global.space.shipyard.ships.splice(idx,1); }
    global.civic.garrison.crew -= crew;
    if (global.civic.garrison.crew < 0){ global.civic.garrison.crew = 0; }
    soldierDeath(crew);
    messageQueue(loc('zcombat_ship_lost',[ship.name,regionName(locationName),crew]),'danger',false,['combat']);
}

// --- Battle log ----------------------------------------------------------------------------------
const zBattleLogMax = 100;   // engagements kept; the oldest falls off the end

function zBattleDate(days){
    let orbit = orbitLength();
    return loc('battle_log_date',[Math.floor(days / orbit),(days % orbit) + 1]);
}

export function zBattleLog_read(){
    return battle_log;
}

// Engagement information
function zBattleRoster(ships){
    let roster = {};
    ships.forEach(function(s){
        if (!s || !s.class){ return; }
        roster[s.class] = (roster[s.class] || 0) + 1;
    });
    return roster;
}

// Also the guard for reading an engagement back: a row written with a figure that was never a number
// is a row that would otherwise print as NaN for the rest of the run.
function zBattleHull(damage){
    return Number.isFinite(damage) ? Math.round(damage * 10) / 10 : 0;
}

// Written the moment the volleys are resolved, before the wrecks are cleared away.
function zBattleLog(locationName,guards,foes,dealt,taken,lost,downed){
    if (!global.space['shipyard']){ return; }
    battle_log.unshift({
        d: global.stats.days,           // game day
        l: locationName,                // where it happened
        p: zBattleRoster(guards),       // your hulls
        e: zBattleRoster(foes),         // theirs
        pd: zBattleHull(dealt),         // hull you landed
        ed: zBattleHull(taken),         // hull they landed
        pl: lost,                       // your ships destroyed
        el: downed                      // theirs destroyed
    });
    if (battle_log.length > zBattleLogMax){
        battle_log.length = zBattleLogMax;
    }
}

// Resolve a single orbital combat volley.
function zVolley(locationName,guards,foes,tally){
    let alive = guards.filter(s => s.damage < 100);
    let scan = alive.reduce((t,s) => t + (sensorRange(s) || 0), 0);

    alive.forEach(function(ship){
        let live = foes.filter(f => f.damage < 100);
        if (live.length === 0){ return; }
        let foe = live[Math.floor(seededRandom(0,live.length,true))];
        if (seededRandom(0,1,true) >= playerAccuracy(scan,foe)){ return; }
        let hit = combatDamage(ship,foe);
        foe.damage += hit;
        tally.dealt += hit;
        if (foe.damage >= 100){
            foe.damage = 100;
            tally.downed.push(foe);
        }
    });

    // Return fire from everything still flying.
    foes.forEach(function(foe){
        if (foe.damage >= 100){ return; }
        let live = guards.filter(s => s.damage < 100);
        if (live.length === 0){ return; }
        let ship = live[Math.floor(seededRandom(0,live.length,true))];
        if (seededRandom(0,1,true) >= foeAccuracy(foe,locationName)){ return; }
        let hit = combatDamage(foe,ship);
        ship.damage += hit;
        tally.taken += hit;
        if (ship.damage >= 100){
            ship.damage = 100;
            tally.lost.push(ship);
        }
    });
}

// Resolve up to a set number of orbital combat volleys.
function zBattle(locationName,foes,rounds){
    let guards = guardsAt(locationName);
    if (guards.length === 0 || foes.length === 0){ return false; }

    let tally = { dealt: 0, taken: 0, lost: [], downed: [] };
    for (let round = 0; round < rounds; round++){
        zVolley(locationName,guards,foes,tally);
        if (!guards.some(s => s.damage < 100) || !foes.some(f => f.damage < 100)){ break; }
    }

    zBattleLog(locationName,guards,foes,tally.dealt,tally.taken,tally.lost.length,tally.downed.length);

    // Select combat messages from the defeated enemy type.
    let synd = foes.some(f => f.syn);

    zMessage(loc(synd ? 'syndicate_orbit_engage' : 'zcombat_engage',[guards.length,foes.length,regionName(locationName)]),'warning');
    tally.lost.forEach(function(ship){ destroyPlayerShip(ship,locationName); });
    if (tally.lost.length > 0){ drawShips(); }

    if (tally.downed.length > 1 && !synd){ 
        //TBA: syndicate multiple message
        zMessage(loc('zcombat_foe_destroyed_multiple', [tally.downed.length, regionName(locationName)]), 'success');
    }
    else if (tally.downed.length == 1){
        zMessage(loc(synd ? 'syndicate_orbit_destroyed' : 'zcombat_foe_destroyed',[foe.name,regionName(locationName)]),'success');
    }
    else{ 
        //TBA: syndicate multiple message
        tally.downed.forEach(function(foe){
            zMessage(loc('syndicate_orbit_destroyed', [foe.name,regionName(locationName)]),'success');
        });
    }

    // Award the horde task only for destroyed horde enemies.
    if (tally.downed.some(foe => !foe.syn)){
        zombieGenociderTask('z2');
    }

    return tally.downed.length > 0;
}

// Resolve a single-volley orbital intercept.
export function zEngage(locationName,foes){
    return zBattle(locationName,foes,1);
}

// Strip out raiders that were shot down, so a wreck never reaches its target.
function zCullDowned(list){
    return list.filter(f => f.damage < 100);
}

// zWarfare Variables
export function zWarfareVars(){
    return {
        // Ground war against a horde already on a world
        orbitalStrike: orbitalStrikeRate,
        zombiesPerRazing: zombiesPerRazing,
        razeCap: razeCap,
        hidden: hiddenInfestation,
        inert: inertInfestation,
        // The infested fleet
        delayMin: zFleetDelayMin,
        delayMax: zFleetDelayMax,
        rampDays: zFleetRampDays,
        oddsStart: zFleetOddsStart,
        oddsEnd: zFleetOddsEnd,
        loadStart: zFleetLoadStart,
        pairOdds: zPairOdds,
        pairSize: zPairSize,
        hulls: zFleetHulls,
        parts: zFleetParts,
        classOrder: shipClassSizes,
        targets: zFleetTargets(),
        // Ship to ship combat
        speedWeight: zCombatSpeedWeight,
        damageDivisor: zCombatDamageDivisor,
        sensorAccuracy: zSensorAccuracy,
        armorSoak: shipArmorSoak,
        classSoak: shipClassSoak,
        // Earth shooting back, and the standing orders that answer it
        groundFireDay: zGroundFireDay,
        groundFireMin: zGroundFireMin,
        groundFireMax: zGroundFireMax,
        groundFireTargets: zGroundFireCount(),
        fleetCmd: fleetCmdRange,
        minHull: minHullToLaunch
    };
}

function zFleetMove(fleet){
    let landings = {};
    for (let i=fleet.s.length-1; i>=0; i--){
        let ship = fleet.s[i];
        if (ship.damage >= 100){
            fleet.s.splice(i,1);
            continue;
        }
        if (!shipMoving(ship)){
            // The Venus blockade is not a delivery. It takes station in orbit and stays there, so it is
            // left in the fleet rather than landed and turned into a horde on the ground.
            if (ship.vb){ continue; }
            fleet.s.splice(i,1);
            const at = shipPort(ship);
            if (!landings[at]){ landings[at] = []; }
            landings[at].push(ship);
        }
    }

    // Everything arriving at the same world this day meets its defenders together, so a lone picket is
    // not made to fight the same raid several times over.
    Object.keys(landings).forEach(function(locationName){
        let arrivals = landings[locationName];
        zEngage(locationName,arrivals);

        let message_log = {};
        zCullDowned(arrivals).forEach(function(ship){
            const at = shipPort(ship);
            if (!global.race.zhorde.hasOwnProperty(at)){ return; }
            // A mauled hull spills part of its cargo on the way down: a percent of the horde for every
            // two percent of hull it lost getting here.
            let load = Math.max(0,Math.round(ship.load * (1 - ship.damage / 200)));
            if (load <= 0){ return; }

            let crushed = infestationSoftCapCrushed(global.race.zhorde[at], load);

            global.race.zhorde[at] += load - crushed;
            let regName = regionName(at);
            if (message_log.hasOwnProperty(regName))
                message_log[regName].push({shipName: ship.name, load: load, crushed: crushed});
            else
                message_log[regName] = [{shipName: ship.name, load: load, crushed: crushed}];

            // A landing on a region whose horde was a secret gives the game away.
            if (!global.race['zfound']){ global.race['zfound'] = {}; }
            global.race.zfound[at] = true;
        });
        Object.keys(message_log).forEach(reg => {
            let msg = message_log[reg];
            if (msg.length > 1){
                let totalInflux = msg.reduce((t, i) => t + i.load, 0);
                let totalCrushed = msg.reduce((t, i) => t + i.crushed, 0);

                if (msg[0].crushed == 0)
                    zMessage(loc('zfleet_landing_multiple',[msg.length, reg, totalInflux.toLocaleString()]),'danger');
                else
                    zMessage(loc('zfleet_landing_crushed_multiple',[msg.length, reg, totalInflux.toLocaleString(), totalCrushed.crushed.toLocaleString()]),'danger');
            }
            else{
                if (msg[0].crushed == 0)
                    zMessage(loc('zfleet_landing',[msg[0].shipName, reg, msg[0].load.toLocaleString()]),'danger');
                else
                    zMessage(loc('zfleet_landing_crushed',[msg[0].shipName, reg, msg[0].load.toLocaleString(), msg[0].crushed.toLocaleString()]),'danger');
            }
        });
        renderSpace();
    });
}

// The wrecks adrift in the outer system, dealt out to the beacons that find them. Twelve signals, one
// per hull, in a fixed mix shuffled so which beacon is worth the long trip changes every run.
const outerBeaconHulls = [
    'battlecruiser',
    'cruiser','cruiser',
    'destroyer','destroyer','destroyer',
    'frigate','frigate','frigate',
    'corvette','corvette','corvette'
];
const outerBeaconMinAU = 2;
const outerBeaconMaxAU = 19;

// The horde fielding a real warship is what pushes the search outward. Twelve fresh distress signals
// light up across the outer system, and with them the reach to go and answer them.
function outerBeacons(){
    if (!global.race['tempCoordinates']){ global.race['tempCoordinates'] = {}; }

    let hulls = outerBeaconHulls.slice();
    for (let i=hulls.length-1; i>0; i--){
        let j = Math.floor(seededRandom(0,i+1,true));
        let swap = hulls[i];
        hulls[i] = hulls[j];
        hulls[j] = swap;
    }

    // Numbered on from the five inner beacons, so the two sets never collide.
    for (let i=0; i<hulls.length; i++){
        let n = i + 6;
        let c = randomCoord('spc_sun',outerBeaconMinAU,outerBeaconMaxAU);
        global.race.tempCoordinates[`beacon${n}`] = driftingPoint({ n: loc(`scout_beacon`,[n]), d: hulls[i] }, 'spc_sun', c);
    }

    global.tech['resettle'] = 12;
    // Snapshot Titan's surviving support now — the reveal wants a plant you put there, not one you found.
    global.race['ztitan'] = titanSupportMax();
    // The long-range legs need the outer system on the map before they can be flown.
    global.settings.showOuter = true;
    global.settings.space.titan = true;
    global.settings.space.enceladus = true;

    if (global.space.hasOwnProperty('wonder_gardens')){
        global.space.wonder_gardens.count = 1;
        global.space.wonder_gardens.razed = 0;
    }
    ['sam','decoder','ai_core','ai_core2','ai_colonist'].forEach(function(item){
        if (global.space.hasOwnProperty(item)){
            global.space[item].count = 0;
            global.space[item].razed = 0;
        }
    });
    if (global.space.hasOwnProperty('electrolysis')){
        global.space.electrolysis.s_max = 0;
        global.space.electrolysis.support = 0;
        global.space.electrolysis.count = 0;
        global.space.electrolysis.on = 0;
    }

    messageQueue(loc('scout_outer_signals'),'info',false,['progress']);
    renderSpace();
    drawShipYard();
}

// True while any beacon still has someone waiting on it. Used to hold the arc back until the signals
// already on the board have been run down, rather than piling a new set on top of an unfinished one.
export function beaconsActive(){
    let temps = global.race['tempCoordinates'];
    if (!temps){ return false; }
    return Object.keys(temps).some(key => key.startsWith('beacon') && temps[key] && temps[key].a);
}

// The last of the wrecks, scattered out past the gas giants where nobody was looking for them.
const finalBeaconMinAU = 18;
const finalBeaconMaxAU = 30;

// One beacon for every hull still adrift.
export function finalBeacons(){
    let pool = global.race.inactive?.ships;
    if (!pool || pool.length === 0){ return 0; }
    if (!global.race['tempCoordinates']){ global.race['tempCoordinates'] = {}; }

    // Shuffled so which beacon is worth the long haul is not simply the order the old fleet was built in.
    let hulls = pool.map(s => s.class);
    for (let i=hulls.length-1; i>0; i--){
        let j = Math.floor(seededRandom(0,i+1,true));
        let swap = hulls[i];
        hulls[i] = hulls[j];
        hulls[j] = swap;
    }

    // Numbered on from the highest beacon already issued
    let last = 0;
    Object.keys(global.race.tempCoordinates).forEach(function(key){
        let match = key.match(/^beacon(\d+)$/);
        if (match && Number(match[1]) > last){ last = Number(match[1]); }
    });

    for (let i=0; i<hulls.length; i++){
        let n = last + i + 1;
        let c = randomCoord('spc_sun',finalBeaconMinAU,finalBeaconMaxAU);
        global.race.tempCoordinates[`beacon${n}`] = driftingPoint({ n: loc(`scout_beacon`,[n]), d: hulls[i] }, 'spc_sun', c);
    }

    return hulls.length;
}

// One raider hull of a given class, fitted out and sitting over Earth.
function zFleetHull(cls,best){
    let ship = {
        class: cls,
        name: `${loc(`outer_shipyard_class_${cls}`)} ${Math.floor(seededRandom(100,10000,true))}`,
        damage: 0, fueled: true
    };
    TPShipInitTransit(ship, 'spc_home');
    Object.keys(zFleetParts).forEach(function(part){
        let list = zFleetPartRange(part);
        ship[part] = best ? list[list.length - 1] : list[Math.floor(seededRandom(0,list.length,true))];
    });
    return ship;
}


// Lift a group of hulls together for one target.
function zFleetSortie(fleet,classes,target,ramp,opts){
    opts = opts || {};
    let ships = classes.map(cls => zFleetHull(cls,opts.best));
    if (opts.mark){
        ships.forEach(function(ship){ ship[opts.mark] = true; });
    }
    zEngage('spc_home',ships);
    let flying = zCullDowned(ships);
    if (flying.length === 0){ return 0; }

    // One trip for the whole sortie, planned on its slowest hull exactly as sendShipTo does for a fleet of yours.
    let trip = planShipTrip(fleetPace(flying),target);
    if (!trip)
        return;

    // Stamp the sortie on anything that lifted in company.
    if (flying.length > 1){
        fleet.n = (fleet.n || 0) + 1;
        flying.forEach(function(ship){ ship.zf = fleet.n; });
    }

    // Put a built hull on course and add it to the fleet. Early raids still land lighter than late ones:
    // the cargo ramp scales whatever the hull would otherwise deliver. 
    flying.forEach(function(ship){ 
        let hull = zFleetHulls[ship.class];
        ship.load = Math.max(1,Math.round(hull.horde() * (zFleetLoadStart + (1 - zFleetLoadStart) * ramp)));
        ship.enemy = true;

        initializeShipTrip(ship, target, trip);

        fleet.s.push(ship);
    });

    if (flying.length > 0) {
        // Remember the day the first hull ever lifted; the surface batteries wake a while after it.
        if (typeof fleet.l !== 'number'){ fleet.l = fleet.d; }
    }

    return flying.length;
}

// The ordinary raid: a target and a hull drawn from whatever is cleared to fly.
function zFleetLaunch(fleet,ramp){
    let targets = zFleetTargets();
    if (targets.length === 0){ return; }
    let target = targets[Math.floor(seededRandom(0,targets.length,true))];

    let avail = zFleetClasses();
    if (avail.length === 0){ return; }

    let count = zFleetSize(fleet);
    let classes = [];
    for (let i=0; i<count; i++){
        let cls = zFleetClass(avail);
        classes.push(cls);
        // The first hull heavier than a frigate triggers expansion of progression
        if (cls === 'destroyer' && !fleet.dz){
            fleet.dz = true;
            outerBeacons();
        }
    }

    zFleetSortie(fleet,classes,target,ramp);
}

// The strike on the colony at Tau Ceti: a hundred days after Titan comes under threat the horde puts together
// something heavier than a raid and sends it across.
function zTauStrike(fleet){
    if (!titanReclaimed()){ return; }
    if (typeof fleet.tz !== 'number'){
        fleet.tz = fleet.d;
        return;
    }
    if (fleet.tw || fleet.d - fleet.tz < zTauStrikeDay){ return; }

    // Marked as spent whether or not anything gets away: stopping it over Earth is a win, not a reason
    // for the horde to try the same thing again.
    fleet.tw = true;
    let sent = zFleetSortie(fleet,zTauStrikeHulls.slice(),zTauStrikeTarget,1);
    if (sent > 0){
        //messageQueue(loc('zfleet_tau_strike',[sent,regionName(zTauStrikeTarget)]),'danger',false,['combat','progress']);
    }
}

// The Blockade Over Venus
const zVenusBlockadeHulls = ['dreadnought','cruiser','cruiser','destroyer','destroyer','frigate','frigate'];
const zVenusBlockadeTarget = 'spc_venus';
// Hull a blockade ship recovers on a day nobody engages it. Leaving it alone lets it patch up, so a
// half-finished attack is worse than none — the fight wants to be pressed until it is over.
const zBlockadeRepair = 2;

// Infested hulls actually holding station over Venus. Ships still crossing are not blockading anything
// yet, which is what makes the arrival the moment the planet closes.
export function venusBlockade(){
    let fleet = global.race['zfleet'];
    if (!fleet || !fleet.s){ return 0; }
    return fleet.s.filter(s => s.vb && !shipMoving(s)).length;
}

// Sent once, the moment the outpost on the surface is identified. Whatever is down there does not want
// it looked at, and it commits the best hulls the horde can field rather than the usual scavenged mix.
function zVenusBlockade(fleet){
    if (fleet.vb || !global.tech['venus'] || global.tech.venus < 3){ return; }

    // Marked spent whether or not any of it survives the climb out, the same as the Tau Ceti strike:
    // stopping it over Earth is a win, not an invitation to try again.
    fleet.vb = true;
    let sent = zFleetSortie(fleet,zVenusBlockadeHulls.slice(),zVenusBlockadeTarget,1,{ best: true, mark: 'vb' });
    if (sent > 0){
        messageQueue(loc('zfleet_blockade_launch',[sent,regionName('spc_home'),regionName(zVenusBlockadeTarget)]),'danger',false,['combat','progress']);
    }
    else {
        // Broken up before it ever left orbit. It still counts as beaten.
        fleet.vbd = true;
        zombieGenociderTask('z3');
        messageQueue(loc('zfleet_blockade_broken',[regionName(zVenusBlockadeTarget)]),'success',false,['combat','progress']);
    }
}

// One day of the blockade. It never goes down to the surface, so the only way past it is to destroy it:
// anything of yours in orbit trades a volley with it, and on a day nobody comes it patches itself up.
function zBlockadeDay(fleet){
    if (!fleet.vb || fleet.vbd){ return; }

    let ships = fleet.s.filter(s => s.vb);
    if (ships.length === 0){
        fleet.vbd = true;
        zombieGenociderTask('z3');
        messageQueue(loc('zfleet_blockade_broken',[regionName(zVenusBlockadeTarget)]),'success',false,['combat','progress']);
        renderSpace();
        return;
    }

    let onStation = ships.filter(s => !shipMoving(s));
    if (onStation.length === 0){ return; }

    // Taking station is what closes the planet, so it is announced the day it happens rather than the
    // day the fleet left.
    if (!fleet.vba){
        fleet.vba = true;
        messageQueue(loc('zfleet_blockade_arrive',[onStation.length,regionName(zVenusBlockadeTarget)]),'danger',false,['combat','progress']);
        renderSpace();
    }

    if (guardsAt(zVenusBlockadeTarget).length > 0){
        zEngage(zVenusBlockadeTarget,onStation);
        // Culled here rather than left to the next day's move pass, so the blockade is known to be
        // broken on the day the last hull goes down.
        for (let i=fleet.s.length-1; i>=0; i--){
            if (fleet.s[i].vb && fleet.s[i].damage >= 100){ fleet.s.splice(i,1); }
        }
    }
    else {
        onStation.forEach(function(ship){
            if (ship.damage > 0){ ship.damage = Math.max(0, ship.damage - zBlockadeRepair); }
        });
    }
}

// --- The syndicate corsairs ---------------------------------------------------------------------

// Shared Syndicate Warfare settings, also used by the wiki.
export const sWarfare = {
    startMin: 10,           // Earliest day after Syndicate Threat Analysis that corsairs appear.
    startMax: 25,           // Latest day after Syndicate Threat Analysis that corsairs appear.
    homeBerths: 2,          // Corsairs the outer base fields at once, until shadow 12.
    venusBerths: 1,         // Corsairs the Venus base fields once Syndicate Tactics wakes it.
    lostMin: 25,            // Minimum respawn delay after a loss.
    lostMax: 50,            // Maximum respawn delay after a loss.
    repair: 4,              // Hull repair per day.
    haulRepair: 10,         // Hull repair per day after a successful haul.
    overdriveAU: 0.25,      // Distance that enables overdrive.
    catchAU: 0.05,          // Interception distance.
    huntDays: 30,           // Longest trip a corsair will make for a freighter or a raid.
    innerAU: 3.5,           // Radius from the Sun of the worlds a corsair prowls with nothing in reach.
    stealth: 0.25,          // Sensor-range multiplier against corsairs.
    overdrive: 2,           // Speed multiplier while pursuing a target.
    rounds: 5,              // Maximum combat rounds before retreating.
    evade: 20,              // Reference scan range for escort evasion.
    chaseDays: 5,           // Patrol pursuit duration.
    chaseSpeed: 1.1,        // Patrol speed multiplier while pursuing.
    sneak: 2,               // Opening raid shots.
    sneakDetected: 1,       // Opening raid shots when a detector array had the approach.
    plunder: 1000000,       // Maximum raid cargo units.
    engagements: 5,         // Engagements required to advance Shadow War.
    studyFights: 250,       // Engagements needed to complete stealth study.
    studyKills: 1,          // Destroyed corsairs needed to complete stealth study.
    // Corsair hull loadout.
    fit: { class: 'corsair', power: 'elerium', engine: 'vacuum', weapon: 'phaser', armor: 'alloy', sensor: 'quantum', special: 'none' },
    flotillaEngine: 'electrokinetic',   // Drive fitted to corsairs launched once a base has three berths.
    // Guard-post location and combat settings.
    guardRegion: 'spc_venus',
    guardFights: 50,        // Engagements needed to trace the guard.
    guardFleet: 6,          // Corsairs in the guard fleet.
    guardRepair: 1,         // Guard hull repair per day.
    guardRounds: 50,        // Maximum daily guard combat rounds.
    // Ground detector settings; use detectorSegments() for orbit-decay adjustments.
    detectorSegments: 10,   // Segments to finish one array.
    detectorSegmentsLost: 12,   // Segments to finish one array with no homeworld to build on.
    detectorRange: 1,       // Detection radius in AU.
    detectorStealthRange: 0.5,  // Detection radius against a stealth hull, until Stealth Detection.
    // Alien Containment settings.
    containmentStops: 10,       // Infiltrators stopped to unlock Alien Containment.
    containmentSegments: 25,    // Construction segments required.
    containmentCapacity: 25,    // Captives the completed facility can hold.
    containmentCapture: 0.1,    // Capture chance per successful officer action.
    takedownCapture: 2,         // Capture chance multiplier from Takedown Tactics.
    interrogationTime: 600,     // Seconds per captive interrogation.
    interrogationCut: 0.25,     // Share of interrogation time removed by We Have Ways.
    intelMin: 50,               // Minimum Alien Intel per interrogation.
    intelMax: 100,              // Maximum Alien Intel per interrogation.
    // Sector Command at Jupiter.
    commandSegments: 10,        // Construction segments required.
    commandPower: 10,           // Power draw once complete.
    commandMoonFire: 0.5,       // Share of its firepower that reaches Ganymede.
    commandRepair: 2,           // Hull repaired per day while powered.
    commandFit: { class: 'dreadnought', power: 'none', engine: 'none', weapon: 'disruptor', armor: 'neutronium', sensor: 'quantum', special: 'none' }
};

const counterEspionageZoneDefs = [
    { id: 'city', cat: 'city', active: 'spc_home' },
    { id: 'spc_moon', cat: 'space' }, { id: 'spc_red', cat: 'space' },
    { id: 'spc_hell', cat: 'space' }, { id: 'spc_belt', cat: 'space' },
    { id: 'spc_gas_moon', cat: 'space' }, { id: 'spc_titan', cat: 'space', name(){ return planetName().titan; } },
    { id: 'spc_enceladus', cat: 'space', name(){ return planetName().enceladus; } }, { id: 'spc_makemake', cat: 'space' },
    { id: 'tau_home', cat: 'tauceti' }, { id: 'tau_red', cat: 'tauceti' }
];

// Initialize the captured-base Counter Espionage state and identify the infiltrator species.
export function revealAlienInfiltrators(){
    if (global.race.alien){ return global.race.alien; }
    const player = global.race.species === 'custom' ? global.custom?.race0 : (global.race.species === 'hybrid' ? global.custom?.race1 : races[global.race.species]);
    const playerType = player?.type || player?.genus;
    const choices = Object.keys(races).filter(r => !['custom','hybrid'].includes(r) && races[r].type && races[r].type !== playerType);
    const race = choices[Math.floor(seededRandom(0,choices.length,true))];
    global.race.alien = {
        r: race,
        infiltrators: {},
        caught: 0,
        officers: { available: 0, assigned: {}, injured: [], training: false, m: true },
        next: global.stats.days + Math.floor(seededRandom(4,9,true))
    };
    const entity = typeof races[race].entity === 'function' ? races[race].entity() : races[race].entity;
    messageQueue(loc('syndicate_alien_reveal',[entity]),'danger',false,['progress','combat']);
    return global.race.alien;
}

// Return Counter Espionage state after captured-base data identifies the infiltrators.
export function counterEspionage(){
    const alien = global.race.alien;
    if (!alien){ return false; }
    if (!alien.infiltrators || typeof alien.infiltrators !== 'object' || Array.isArray(alien.infiltrators)){ alien.infiltrators = {}; }
    if (typeof alien.caught !== 'number'){ alien.caught = 0; }
    if (!alien.officers){ alien.officers = { available: 0, assigned: {}, injured: [], training: false }; }
    if (!alien.officers.assigned){ alien.officers.assigned = {}; }
    if (!Array.isArray(alien.officers.injured)){ alien.officers.injured = []; }
    if (typeof alien.officers.available !== 'number'){ alien.officers.available = 0; }
    if (alien.officers.training && typeof alien.officers.training !== 'object'){ alien.officers.training = { p: 0 }; }
    const assigned = Object.values(alien.officers.assigned).reduce((sum,count) => sum + count, 0);
    const officerSlots = alien.officers.available + assigned + (alien.officers.training ? 1 : 0);
    if (!alien.officers.m){
        if (global.civic.garrison){ global.civic.garrison.max += officerSlots; }
        alien.officers.m = true;
    }
    if (global.civic.garrison){
        global.civic.garrison.workers = Math.min(global.civic.garrison.workers, Math.max(0,global.civic.garrison.max - officerSlots));
    }
    if (typeof alien.next !== 'number'){ alien.next = global.stats.days + Math.floor(seededRandom(4,9,true)); }
    return alien;
}

// Return zones that can host infiltrators in the current run.
export function counterEspionageZones(){
    const active = activeSupplyRegions();
    return counterEspionageZoneDefs.filter(zone => !capitalGone() || zone.id !== 'city')
        .filter(zone => active.includes(zone.active || zone.id))
        .map(zone => ({ ...zone, name: zone.name ? zone.name() : supplyRegionName(zone.active || zone.id) }));
}

function counterEspionageTargets(){
    const targets = [];
    counterEspionageZones().forEach(function(zone){
        const source = zone.cat === 'tauceti' ? tauCetiModules[zone.id] : (zone.cat === 'city' ? actions.city : actions.space[zone.id]);
        const state = global[zone.cat];
        if (!source || !state){ return; }
        Object.keys(source).forEach(function(key){
            const action = source[key];
            const struct = state[key];
            if (!action || !struct || !struct.count){ return; }
            if (!['industry','mining','power','science'].includes(action.type) && !key.startsWith('detector')){ return; }
            // Only target structures that are currently operating.
            const running = struct.hasOwnProperty('on') ? (p_on[key] > 0 || support_on[key] > 0 || struct.on > 0) : true;
            if (!running){ return; }
            if (infiltratorFactor(zone.id,key) <= 0){ return; }
            targets.push({ z: zone.id, b: key });
        });
    });
    return targets;
}

// Count all active infiltrators across every zone.
function infiltratorTotal(alien){
    return Object.values(alien.infiltrators).reduce((total,zone) => total + Object.values(zone).reduce((sum,count) => sum + count, 0), 0);
}

export function intelligenceOfficerCost(){
    const alien = counterEspionage();
    if (!alien){ return 0; }
    const assigned = Object.values(alien.officers.assigned).reduce((sum,count) => sum + count, 0);
    return Math.round(5000000 * (1 + (alien.officers.available + assigned) * 0.25));
}

// Start training one Intelligence Officer when funds are available.
export function trainIntelligenceOfficer(){
    const alien = counterEspionage();
    const cost = intelligenceOfficerCost();
    if (!alien || alien.officers.training || global.resource.Money.amount < cost || garrisonSize() < 1){ return false; }
    modRes('Money',-cost);
    global.civic.garrison.workers--;
    alien.officers.training = { p: 0 };
    return true;
}

// Return training days remaining for the current Intelligence Officer.
export function intelligenceOfficerTrainingTime(){
    const training = counterEspionage()?.officers.training;
    return training ? Math.ceil((1 - training.p) * 125 / soldierTrainingRate()) : 0;
}

// Return recovery days remaining for the first injured Intelligence Officer.
export function intelligenceOfficerRecoveryTime(){
    const injured = counterEspionage()?.officers.injured;
    return injured?.length ? Math.ceil((1 - injured[0].p) * 75 / soldierRecoveryRate()) : 0;
}

// Return one unassigned Intelligence Officer to the garrison.
export function dismissIntelligenceOfficer(){
    const alien = counterEspionage();
    if (!alien || alien.officers.available < 1 || !global.civic.garrison){ return false; }
    alien.officers.available--;
    global.civic.garrison.workers++;
    return true;
}
// Assign an available Intelligence Officer to or from a Counter Espionage zone.
export function assignIntelligenceOfficer(zone, change){
    const alien = counterEspionage();
    if (!alien || !counterEspionageZones().some(entry => entry.id === zone)){ return false; }
    const assigned = alien.officers.assigned;
    const current = assigned[zone] || 0;
    if (change > 0 && alien.officers.available > 0){ assigned[zone] = current + 1; alien.officers.available--; return true; }
    if (change < 0 && current > 0){ assigned[zone] = current - 1; alien.officers.available++; return true; }
    return false;
}

// Advance officer training, searches, and infiltrator recruitment once per game day.
export function counterEspionageDay(){
    const alien = counterEspionage();
    if (!alien){ return; }
    if (alien.officers.training){
        alien.officers.training.p += soldierTrainingRate() / 125;
        if (alien.officers.training.p >= 1){
            alien.officers.training = false;
            alien.officers.available++;
        }
    }
    if (alien.officers.injured.length > 0){
        const officer = alien.officers.injured[0];
        officer.p += soldierRecoveryRate() / 75;
        if (officer.p >= 1){
            alien.officers.injured.shift();
            if (counterEspionageZones().some(zone => zone.id === officer.z)){ alien.officers.assigned[officer.z] = (alien.officers.assigned[officer.z] || 0) + 1; }
            else { alien.officers.available++; }
            messageQueue(loc('counter_espionage_recovered'),'success',false,['combat']);
        }
    }
    if (global.stats.days >= alien.next){
        if (infiltratorTotal(alien) < global.tech.shadow * 5){
            const targets = counterEspionageTargets();
            if (targets.length > 0){
                const target = targets[Math.floor(seededRandom(0,targets.length,true))];
                if (!alien.infiltrators[target.z]){ alien.infiltrators[target.z] = {}; }
                alien.infiltrators[target.z][target.b] = (alien.infiltrators[target.z][target.b] || 0) + 1;
            }
        }
        alien.next = global.stats.days + Math.floor(seededRandom(4,9,true));
    }
    for (const zone of counterEspionageZones()){
        const officers = alien.officers.assigned[zone.id] || 0;
        const targets = Object.keys(alien.infiltrators[zone.id] || {});
        if (!officers || !targets.length || seededRandom(0,1,true) >= Math.min(0.35,officers * 0.025)){ continue; }
        const target = targets[Math.floor(seededRandom(0,targets.length,true))];
        if (seededRandom(0,1,true) < 0.18){
            alien.officers.assigned[zone.id]--;
            alien.officers.injured.push({ z: zone.id, p: 0 });
            messageQueue(loc('counter_espionage_officer_injured',[zone.name]),'warning',false,['combat']);
        }
        else {
            alien.infiltrators[zone.id][target]--;
            if (alien.infiltrators[zone.id][target] === 0){
                delete alien.infiltrators[zone.id][target];
                if (Object.keys(alien.infiltrators[zone.id]).length === 0){ delete alien.infiltrators[zone.id]; }
            }
            alien.caught++;
            const facility = containmentActive() && containmentBuilt();
            if (facility && facility.captives < sWarfare.containmentCapacity && seededRandom(0,1,true) < containmentCaptureChance()){
                facility.captives++;
                messageQueue(loc('counter_espionage_captured',[zone.name,loc('space_dwarf_alien_containment_title')]),'success',false,['combat']);
            }
            else {
                messageQueue(loc('counter_espionage_caught',[zone.name]),'success',false,['combat']);
            }
        }
    }
    // Unlock Alien Containment after enough infiltrators are stopped.
    if (global.tech['shadow'] === 13 && alien.caught >= sWarfare.containmentStops){
        global.tech.shadow = 14;
        global.resource.Alien_Intel.display = true;
        drawTech();
    }
}

// --- Alien Containment ---------------------------------------------------------------------------
// Chance a successful officer takes an infiltrator alive; Takedown Tactics (spy 6) multiplies it.
export function containmentCaptureChance(takedown = global.tech['spy'] >= 6){
    return sWarfare.containmentCapture * (takedown ? sWarfare.takedownCapture : 1);
}

// Seconds to interrogate one captive; We Have Ways (spy 7) shortens it.
export function interrogationDuration(ways = global.tech['spy'] >= 7){
    return sWarfare.interrogationTime * (ways ? 1 - sWarfare.interrogationCut : 1);
}

// Manage captured infiltrators and convert them to Alien Intel.

// Return the completed facility state, or false.
export function containmentBuilt(){
    const facility = global.space['alien_containment'];
    if (!facility || !(facility.count >= sWarfare.containmentSegments)){ return false; }
    for (const field of ['captives','p']){
        if (typeof facility[field] !== 'number' || !Number.isFinite(facility[field])){ facility[field] = 0; }
    }
    facility.captives = Math.min(sWarfare.containmentCapacity, Math.max(0, Math.floor(facility.captives)));
    return facility;
}

// Return whether the completed facility has power.
export function containmentActive(){
    return containmentBuilt() && p_on['alien_containment'] > 0 ? true : false;
}

// Consecutive long-loop passes without facility power.
let containmentDark = 0;

// Process captive interrogations and power-loss escapes.
export function alienContainmentTick(seconds){
    const facility = containmentBuilt();
    if (!facility){ return; }
    if (!containmentActive()){
        containmentDark++;
        if (containmentDark >= 2 && facility.captives > 0){
            facility.captives = 0;
            facility.p = 0;
            messageQueue(loc('space_dwarf_alien_containment_lost',[loc('space_dwarf_alien_containment_title')]),'danger',false,['combat']);
        }
        return;
    }
    containmentDark = 0;
    if (facility.captives <= 0){
        facility.p = 0;
        return;
    }
    facility.p += seconds;
    const duration = interrogationDuration();
    while (facility.captives > 0 && facility.p >= duration){
        facility.p -= duration;
        facility.captives--;
        const intel = Math.floor(seededRandom(sWarfare.intelMin,sWarfare.intelMax + 1,true));
        if (!global.resource.Alien_Intel.display){ global.resource.Alien_Intel.display = true; }
        modRes('Alien_Intel',intel,true);
    }
    if (facility.captives <= 0){ facility.p = 0; }
}

// The raiding arc, which picks up exactly where syndicateActive() leaves off: that one switches itself
// off at shadow 5, and this one begins after it.
export function corsairsActive(){
    return global.race['sy_base'] && global.race.sy_base['home'] ? true : false;
}

// The two bases: Venus, and whichever cold rock the syndicate made its home.
export function syndicateBases(){
    return corsairsActive() ? ['spc_venus', global.race.sy_base.home] : [];
}

// Return whether a corsair base is active; Venus awaits Syndicate Tactics.
function corsairBaseAwake(region){
    if (region !== sWarfare.guardRegion){ return true; }
    return global.tech['shadow'] && global.tech.shadow >= 8 ? true : false;
}

// Return a base's corsair fleet, migrating legacy saves.
function corsairFleet(base){
    if (!base){ return []; }
    if (!Array.isArray(base.ships)){
        base.ships = base.ship ? [base.ship] : [];
        delete base.ship;
    }
    return base.ships;
}

// Return a base's concurrent corsair capacity.
function corsairBerths(region){
    if (region === sWarfare.guardRegion){ return sWarfare.venusBerths; }
    return global.tech['shadow'] && global.tech.shadow >= 12 ? 3 : sWarfare.homeBerths;
}

// Every corsair currently off its dock, for the map and for anything hunting them.
export function syndicateShips(){
    return syndicateBases()
        .reduce((all,region) => all.concat(corsairFleet(global.race.sy_base[region])),[])
        .filter(ship => ship && ship.damage < 100);
}

// Start the corsair offensive a seeded 10–25 days after Syndicate Threat Analysis.
function syndicateWatch(){
    delete global.race['sy_watch'];
    if (corsairsActive() || !global.tech['shadow'] || global.tech.shadow < 5){
        delete global.race['sy_start'];
        return;
    }
    if (typeof global.race['sy_start'] !== 'number'){
        global.race['sy_start'] = global.stats.days + Math.floor(seededRandom(sWarfare.startMin,sWarfare.startMax + 1,true));
    }
    if (global.stats.days < global.race.sy_start){ return; }
    delete global.race['sy_start'];
    startCorsairs();
    drawTech();
}

// Launch the corsair offensive from the outer base; the Venus base is set up but stays dormant.
export function startCorsairs(){
    if (corsairsActive()){ return; }
    global.tech['shadow'] = 6;
    // Choose each corsair base from seeded world data.
    let home = seededRandom(0,2) < 1 ? 'spc_pluto' : 'spc_haumea';
    global.race['sy_base'] = { home: home };
    // Initialize revealed bases with prebuilt corsairs.
    [ 'spc_venus', home ].forEach(function(region){
        global.race.sy_base[region] = {
            ships: [],                                      // Active corsairs.
            ready: global.stats.days,                       // Next launch day.
            day: global.stats.days,                         // Last processed game day.
            launched: 0,                                    // Corsairs launched.
            lost: 0,                                        // Corsairs lost.
            taken: 0,                                       // Freighters robbed.
            sunk: 0,                                        // Freighters destroyed.
            looted: 0,                                      // Worlds raided.
            haul: 0                                         // Cargo returned to base.
        };
    });
    messageQueue(loc('syndicate_corsairs_msg'),'danger',false,['combat','progress']);
}

function corsairHull(region){
    let ship = Object.assign({},sWarfare.fit);
    // Use flotilla engines after a base fields three corsairs.
    if (corsairBerths(region) >= 3){ ship.engine = sWarfare.flotillaEngine; }
    ship.name = loc('syndicate_corsair_name',[Math.floor(seededRandom(100,10000,true))]);
    ship.damage = 0;
    ship.fueled = true;
    ship.enemy = true;      // Use enemy movement and fuel rules.
    ship.syn = region;      // Source corsair base.
    ship.stealth = sWarfare.stealth;
    ship.haul = 0;
    TPShipInitTransit(ship, region);
    return ship;
}

// The name to file an engagement under: a fight in open space is logged against wherever the ship
// being jumped was headed, which is the only place name either party would recognise.
function encounterWhere(ship){
    return shipDestination(ship) || shipPort(ship);
}

// Hunt freighters first, then raid a world.
function corsairHunt(corsair){
    return corsairChase(corsair) || corsairSortie(corsair);
}

// Chase the nearest reachable freighter.
function corsairChase(corsair){
    const from = shipPosition(corsair);
    if (!from){ return false; }
    const prey = (global.space.shipyard?.ships || [])
        .filter(ship => ship.class === 'freighter' && ship.damage < 100 && shipPosition(ship))
        .sort((a,b) => dist3(from,shipPosition(a)) - dist3(from,shipPosition(b)));
    const tried = new Set();
    for (const ship of prey){
        const target = encounterWhere(ship);
        if (tried.has(target)){ continue; }
        tried.add(target);
        if (shipDockedAt(corsair) === target){ continue; }
        if (corsairLaunch(corsair,target,false)){ return true; }
    }
    return false;
}

// Raid a reachable world when no freighter can be chased.
function corsairSortie(corsair){
    for (const target of corsairMarks(corsair)){
        if (shipDockedAt(corsair) === target){
            // Raid immediately when already in orbit.
            corsair.od = false;
            corsair.home = false;
            corsair.prowl = false;
            corsair.raid = target;
            corsairAssault(corsair);
            return true;
        }
        if (corsairLaunch(corsair,target,true)){
            return true;
        }
    }
    return false;
}

// Launch a hunt, raid, or prowl route.
function corsairLaunch(corsair,target,raid,prowl){
    const trip = planShipTrip(corsair,target);
    if (!trip || (!prowl && tripDays(trip) > sWarfare.huntDays)){ return false; }
    initializeShipTrip(corsair,target,trip);
    corsair.od = false;
    corsair.home = false;
    corsair.raid = raid ? target : false;
    corsair.prowl = prowl ? true : false;
    return true;
}

// List reachable inner-system prowl stops.
function corsairBeat(){
    const sun = genXYZcoord('spc_sun');
    return Object.keys(spaceTech()).filter(region => region !== 'spc_sun_gate'
        && !syndicateBases().includes(region)
        && regionReachable(region)
        && dist3(genXYZcoord(region),sun) <= sWarfare.innerAU);
}

// Move between inner-system stops until a hunt is available.
function corsairProwl(corsair){
    const stops = corsairBeat();
    if (corsair.prowl && shipMoving(corsair) && stops.includes(shipDestination(corsair))){ return true; }
    const at = shipBound(corsair);
    const next = stops.filter(region => region !== at);
    if (next.length === 0){ return false; }
    return corsairLaunch(corsair,next[Math.floor(seededRandom(0,next.length,true))],false,true);
}

// Return whether a region is a valid raid target.
function corsairRaidable(region){
    if (syndicateBases().includes(region)){ return false; }
    if (region === 'spc_sun_gate'){ return false; }     // Gates cannot be raided.
    if (!regionReachable(region)){ return false; }
    return activeSupplyRegions().includes(region);
}

// List reachable raid targets, prioritizing stocked worlds.
function corsairMarks(corsair){
    const from = shipPosition(corsair);
    if (!from){ return []; }
    const reachable = activeSupplyRegions().filter(corsairRaidable)
        .sort((a,b) => dist3(from,genXYZcoord(a)) - dist3(from,genXYZcoord(b)));
    const stocked = reachable.filter(corsairZoneStocked);
    return stocked.length > 0 ? stocked : reachable;
}

// Return whether a region's supply pool has stock.
function corsairZoneStocked(region){
    if (supplyMode() === 'global'){ return false; }
    const pool = supplyPool(region);
    for (const res in atomic_mass){
        if (!global.resource[res] || !partitioned(res)){ continue; }
        if (regAmount(res,pool) >= 1){ return true; }
    }
    return false;
}

// Return home and cancel any pending raid.
function corsairGoHome(corsair){
    corsair.od = false;
    corsair.raid = false;
    corsair.prowl = false;
    // Mark the corsair as returning before plotting its route.
    corsair.home = true;
    if (shipDockedAt(corsair) === corsair.syn){ return true; }
    const trip = planShipTrip(corsair,corsair.syn);
    if (!trip){ return false; }
    initializeShipTrip(corsair,corsair.syn,trip);
    return true;
}

// The drive opens up once it has a firing solution, and the rest of the crossing is flown at twice the
// speed. The trip is already plotted, so what doubles is what is left of it.
function corsairEngageDrive(corsair){
    if (corsair.od){ return; }
    corsair.od = true;
    hastenShip(corsair, sWarfare.overdrive);
}

// The escort's chance of seeing one coming.
function corsairSpotted(group){
    const scan = group.reduce((t,s) => t + (sensorRange(s) || 0),0) * sensorStealth();
    if (scan <= 0){ return false; }
    return seededRandom(0,1,true) < scan / (scan + sWarfare.evade);
}

// Resolve corsair combat and return damage totals.
function corsairFight(corsair,group,where,sneak){
    let dealt = 0, taken = 0;
    const lost = [], downed = [];
    const mark = function(){
        const live = group.filter(s => s.damage < 100);
        return live.length ? live[Math.floor(seededRandom(0,live.length,true))] : false;
    };
    const shootAt = function(ship){
        const hit = combatDamage(corsair,ship);
        ship.damage += hit;
        taken += hit;
        if (ship.damage >= 100){ ship.damage = 100; lost.push(ship); }
    };

    for (let shot = 0; shot < sneak; shot++){
        const surprised = mark();
        if (!surprised){ break; }
        shootAt(surprised);
    }

    for (let round = 0; round < sWarfare.rounds && corsair.damage < 100; round++){
        // Apply corsair stealth to defender sensor range.
        const scan = group.filter(s => s.damage < 100).reduce((t,s) => t + (sensorRange(s) || 0),0) * sensorStealth();
        group.forEach(function(ship){
            if (ship.damage >= 100 || corsair.damage >= 100){ return; }
            if (seededRandom(0,1,true) >= playerAccuracy(scan,corsair)){ return; }
            const hit = combatDamage(ship,corsair);
            corsair.damage += hit;
            dealt += hit;
            if (corsair.damage >= 100){ corsair.damage = 100; downed.push(corsair); }
        });
        if (corsair.damage >= 100){ break; }
        const target = mark();
        if (!target){ break; }
        if (seededRandom(0,1,true) < foeAccuracy(corsair,where)){ shootAt(target); }
    }

    zBattleLog(where,group,[corsair],dealt,taken,lost.length,downed.length);
    lost.forEach(function(ship){ destroyPlayerShip(ship,where); });
    if (lost.length > 0){ drawShips(); }
    corsairEngaged();
    return { alive: corsair.damage < 100, dealt: dealt, taken: taken };
}

// Count corsair engagements and advance Shadow War when the threshold is reached.
function corsairEngaged(){
    global.race['sy_fights'] = (global.race['sy_fights'] || 0) + 1;
    if (global.tech['shadow'] === 6 && global.race.sy_fights >= sWarfare.engagements){
        global.tech['shadow'] = 7;
        drawTech();
    }
    // Refresh technology when corsair study reaches its threshold.
    if (global.race.sy_fights === sWarfare.studyFights){
        drawTech();
    }
}

// Corsairs this run has traded fire with, and corsairs it has actually put down. Both live on
// global.race, so both reset with the run.
export function corsairsFought(){
    return global.race['sy_fights'] || 0;
}

export function corsairsDestroyed(){
    const bases = global.race['sy_base'];
    if (!bases){ return 0; }
    // Ignore the home-region alias when counting destroyed corsairs.
    return Object.keys(bases).reduce((total,region) => total + (bases[region] && bases[region].lost ? bases[region].lost : 0), 0);
}

// What it takes to work out how a corsair hides. A wreck to take apart is worth any amount of
// watching one get away, so either will do.
export function stealthStudied(){
    return corsairsFought() >= sWarfare.studyFights || corsairsDestroyed() >= sWarfare.studyKills ? true : false;
}

// The corsair is lost: the base that built it goes quiet for a while.
function corsairLost(corsair,where){
    const base = global.race.sy_base[corsair.syn];
    if (base){
        const fleet = corsairFleet(base);
        const at = fleet.indexOf(corsair);
        if (at >= 0){ fleet.splice(at,1); }
        base.lost++;
        // Delay all base launches after a loss.
        base.ready = global.stats.days + Math.round(seededRandom(sWarfare.lostMin,sWarfare.lostMax,true));
    }
    zMessage(loc('syndicate_corsair_destroyed',[corsair.name,regionName(where)]),'success');
}

// Scale plunder capacity by remaining hull integrity.
function corsairHold(corsair){
    return Math.floor(sWarfare.plunder * Math.max(0,100 - (corsair.damage || 0)) / 100);
}

// Return surviving freighters in a trade fleet.
function corsairHolds(freighter){
    return tradeFreighters(tradeFleet(freighter)).filter(ship => ship.damage < 100);
}

// Format stolen resources for raid messages.
function corsairManifest(taken){
    return Object.keys(taken)
        .sort((a,b) => taken[b] - taken[a])
        .map(res => `${global.resource[res] ? global.resource[res].name : res}: ${sizeApproximation(taken[res],0)}`)
        .join(', ');
}

// Strip cargo off a fleet, fullest hold and biggest consignment first, until the corsair is full.
function corsairPlunderHolds(corsair,freighters){
    let room = corsairHold(corsair);
    let took = 0;
    const taken = {};
    const order = freighters.slice().sort((a,b) => freightLoad(b) - freightLoad(a));
    for (const ship of order){
        if (room <= 0){ break; }
        const cargo = freightCargo(ship);
        for (const res of Object.keys(cargo).sort((a,b) => cargo[b] - cargo[a])){
            if (room <= 0){ break; }
            const take = Math.min(room,cargo[res]);
            cargo[res] -= take;
            if (cargo[res] <= 0){ delete cargo[res]; }
            room -= take;
            took += take;
            taken[res] = (taken[res] || 0) + take;
        }
    }
    corsair.haul += took;
    return { total: took, taken: taken };
}

// Plunder regional stock until the corsair is full.
function corsairPlunderZone(corsair,region){
    if (supplyMode() === 'global'){ return { total: 0, taken: {} }; }
    const pool = supplyPool(region);
    let room = corsairHold(corsair);
    let took = 0;
    const taken = {};
    const stock = Object.keys(atomic_mass)
        .filter(res => global.resource[res] && partitioned(res) && regAmount(res,pool) >= 1)
        .sort((a,b) => regAmount(b,pool) - regAmount(a,pool));
    for (const res of stock){
        if (room <= 0){ break; }
        const take = Math.min(room,Math.floor(regAmount(res,pool)));
        if (take <= 0){ continue; }
        poolMod(res,pool,-take);
        syncTotal(res);
        room -= take;
        took += take;
        taken[res] = (taken[res] || 0) + take;
    }
    corsair.haul += took;
    return { total: took, taken: taken };
}

// A freighter caught on its own. Cargo is stolen, if the fleet is empty it is instead destroyed.
function corsairRaid(corsair,freighter){
    const where = encounterWhere(freighter);
    const base = global.race.sy_base[corsair.syn];
    const load = corsairPlunderHolds(corsair,corsairHolds(freighter));
    if (load.total > 0){
        if (base){ base.taken++; base.haul += load.total; }
        zMessage(loc('syndicate_cargo_taken',[freighter.name,regionName(where),corsairManifest(load.taken)]),'danger');
        corsairGoHome(corsair);
    }
    else {
        if (base){ base.sunk++; }
        destroyPlayerShip(freighter,where);
        drawShips();
        zMessage(loc('syndicate_freighter_lost',[freighter.name,regionName(where)]),'danger');
        corsairHunt(corsair) || corsairProwl(corsair);
    }
}

// Resolve escort combat, then plunder only after a corsair victory.
function corsairAmbush(corsair,escort,freighter){
    const where = encounterWhere(freighter);
    const seen = corsairSpotted(escort);
    zMessage(loc(seen ? 'syndicate_escort_spotted' : 'syndicate_escort_ambushed',[regionName(where)]),seen ? 'warning' : 'danger');
    const fight = corsairFight(corsair,escort,where,seen ? 0 : 1);
    if (!fight.alive){ corsairLost(corsair,where); return; }
    if (fight.taken > fight.dealt){
        const base = global.race.sy_base[corsair.syn];
        const load = corsairPlunderHolds(corsair,corsairHolds(freighter));
        if (load.total > 0){
            if (base){ base.taken++; base.haul += load.total; }
            zMessage(loc('syndicate_cargo_taken',[freighter.name,regionName(where),corsairManifest(load.taken)]),'danger');
        }
    }
    else {
        zMessage(loc('syndicate_escort_held',[regionName(where)]),'success');
    }
    corsairGoHome(corsair);
}

// Resolve a corsair raid after it reaches its target world.
function corsairAssault(corsair){
    if (!corsair.raid || corsair.home || shipDockedAt(corsair) !== corsair.raid){ return false; }
    const where = corsair.raid;
    corsair.raid = false;
    // Recheck the raid target after arrival.
    if (!corsairRaidable(where)){ corsairGoHome(corsair); return true; }
    const base = global.race.sy_base[corsair.syn];
    const guard = guardsAt(where).filter(ship => ship.damage < 100);

    let plunder = guard.length === 0;
    if (plunder){
        zMessage(loc('syndicate_world_open',[regionName(where)]),'danger');
    }
    else {
        // Detector contact reduces a raider's opening volleys.
        const seen = detectorContact(corsair);
        const volleys = seen ? sWarfare.sneakDetected : sWarfare.sneak;
        zMessage(loc(seen ? 'syndicate_world_warned' : 'syndicate_world_struck',[regionName(where),volleys]),'danger');
        const fight = corsairFight(corsair,guard,where,volleys);
        if (!fight.alive){ corsairLost(corsair,where); return true; }
        plunder = fight.taken > fight.dealt;
        if (!plunder){ zMessage(loc('syndicate_world_held',[regionName(where)]),'success'); }
    }

    if (plunder){
        const load = corsairPlunderZone(corsair,where);
        if (load.total > 0){
            if (base){ base.looted = (base.looted || 0) + 1; base.haul += load.total; }
            zMessage(loc('syndicate_world_looted',[regionName(where),corsairManifest(load.taken)]),'danger');
        }
    }
    corsairGoHome(corsair);
    return true;
}

// Advance corsair pursuit and resolve arrived raids.
function corsairStalk(corsair){
    if (!shipMoving(corsair)){ corsairAssault(corsair); return; }
    if (corsair.home){ return; }
    const from = shipPosition(corsair);
    if (!from){ return; }

    const ships = global.space.shipyard?.ships || [];
    let quarry = false, near = Infinity;
    for (const ship of ships){
        if (ship.class !== 'freighter' || ship.damage >= 100){ continue; }
        const at = shipPosition(ship);
        if (!at){ continue; }
        const away = dist3(from,at);
        if (away < near){ quarry = ship; near = away; }
    }
    if (!quarry){ return; }

    if (near <= sWarfare.overdriveAU && !corsair.od){
        corsairEngageDrive(corsair);
        zMessage(loc('syndicate_corsair_lock',[quarry.name]),'warning');
    }
    if (near > sWarfare.catchAU){ return; }

    // Resolve interception as a robbery or escort fight.
    const company = shipFleet(quarry).filter(s => s.class !== 'freighter' && s.damage < 100);
    // A freighter docked under Sector Command's guns is defended by it.
    const station = sectorCommandGuard(shipDockedAt(quarry));
    if (station){ company.push(station); }
    if (company.length > 0){ corsairAmbush(corsair,company,quarry); }
    else { corsairRaid(corsair,quarry); }
}

// Pirate base ship daily routine
function corsairBaseDay(region){
    const base = global.race.sy_base[region];
    if (!base){ return; }
    // Skip operations for a destroyed base.
    if (base.closed){ return; }
    // Initialize missing base timers for older saves.
    if (typeof base.day !== 'number'){ base.day = global.stats.days; }
    if (typeof base.ready !== 'number'){ base.ready = global.stats.days; }
    const elapsed = Math.max(0,global.stats.days - base.day);
    base.day = global.stats.days;

    const fleet = corsairFleet(base);

    // Launch a corsair into an available berth.
    if (corsairBaseAwake(region) && fleet.length < corsairBerths(region) && global.stats.days >= base.ready){
        const ship = corsairHull(region);
        fleet.push(ship);
        base.launched++;
        corsairHunt(ship) || corsairProwl(ship);
    }

    // Iterate over a copy because processing can remove a corsair.
    fleet.slice().forEach(corsair => corsairBaseShipDay(corsair,region,elapsed));
}

// Process one corsair's daily state.
function corsairBaseShipDay(corsair,region,elapsed){
    if (corsair.damage >= 100){ corsairLost(corsair,shipPort(corsair)); return; }
    const awake = corsairBaseAwake(region);
    // A dormant base recalls anything it already had out.
    if (!awake && !corsair.home && shipDockedAt(corsair) !== region){
        corsairGoHome(corsair);
        return;
    }
    if (shipMoving(corsair)){
        // Interrupt prowling for a reachable hunt.
        if (corsair.prowl){ corsairHunt(corsair); }
        return;
    }

    // Repair and relaunch corsairs at their base.
    if (shipDockedAt(corsair) === region){
        corsair.home = false;
        if (corsair.damage > 0){
            corsair.damage = Math.max(0,corsair.damage - (corsair.haul > 0 ? sWarfare.haulRepair : sWarfare.repair) * Math.max(1,elapsed));
            if (corsair.damage > 0){ return; }
        }
        corsair.haul = 0;
        if (awake){ corsairHunt(corsair) || corsairProwl(corsair); }
        return;
    }

    // Resolve an arrived raid before assigning a new target.
    if (corsairAssault(corsair)){ return; }

    // Hunt, prowl, or return home when idle.
    if (!awake || (!corsairHunt(corsair) && !corsairProwl(corsair))){ corsairGoHome(corsair); }
}

// --- Your patrols hunting for enemies --------------------------------------------------------------

// A patrolling fleet that sees a corsair goes after it.
function patrolHunt(){
    // Patrol orders saved before Sector Command existed wait for it to be built.
    if (!patrolsUnlocked()){ return; }
    const ships = global.space.shipyard?.ships || [];
    const corsairs = syndicateShips().filter(c => shipMoving(c) && shipPosition(c));
    if (corsairs.length === 0){ return; }

    const seen = new Set();
    for (const ship of ships){
        if (seen.has(ship) || !shipPatrol(ship)){ continue; }
        const group = tradeFleet(ship);
        group.forEach(member => seen.add(member));
        const lead = tradeLeader(group);
        const patrol = shipPatrol(lead);
        const at = shipPosition(lead);
        if (!at){ continue; }

        // End pursuits that exceed the chase limit.
        if (patrol.chase){
            if (global.stats.days - patrol.chase >= sWarfare.chaseDays){
                setPatrolChase(group,false);
                if (!shipMoving(lead)){ advancePatrol(group); }
            }
            continue;
        }

        // Pursue the nearest corsair detected by fleet or ground sensors.
        let quarry = false, near = Infinity;
        for (const corsair of corsairs){
            const away = dist3(at,shipPosition(corsair));
            if (away >= near){ continue; }
            if (away <= sensorRangeAU(lead) * sensorStealth() || detectorCue(at,corsair)){ quarry = corsair; near = away; }
        }
        if (!quarry){ continue; }

        const target = encounterWhere(quarry);
        const id = global.space.shipyard.ships.indexOf(lead);
        if (id < 0 || !sendShipTo(id,target,true)){ continue; }
        // Apply the patrol pursuit speed multiplier.
        group.forEach(member => hastenShip(member, sWarfare.chaseSpeed));
        setPatrolChase(group,global.stats.days);
        zMessage(loc('syndicate_patrol_chase',[regionName(target)]),'warning');
    }
}

function setPatrolChase(group,day){
    group.forEach(function(ship){
        if (!ship.patrol){ return; }
        if (day === false){ delete ship.patrol.chase; }
        else { ship.patrol.chase = day; }
    });
}

// A patrol that catches an enemy ship engages it in combat.
function patrolStrike(){
    const ships = global.space.shipyard?.ships || [];
    const corsairs = syndicateShips().filter(c => shipPosition(c));
    if (corsairs.length === 0){ return; }

    const seen = new Set();
    for (const ship of ships){
        if (seen.has(ship) || !shipPatrol(ship) || !shipPatrol(ship).chase){ continue; }
        const group = tradeFleet(ship);
        group.forEach(member => seen.add(member));
        const lead = tradeLeader(group);
        const at = shipPosition(lead);
        if (!at){ continue; }

        for (const corsair of corsairs){
            if (dist3(at,shipPosition(corsair)) > sWarfare.catchAU){ continue; }
            const where = encounterWhere(lead);
            const guns = group.filter(s => s.damage < 100);
            if (guns.length === 0){ break; }
            if (corsairFight(corsair,guns,where,0).alive){ corsairGoHome(corsair); }
            else {
                corsairLost(corsair,where);
                // Award the task only for patrol-destroyed corsairs.
                shadowWarTask('s1');
            }
            setPatrolChase(group,false);
            if (!shipMoving(lead)){ advancePatrol(group); }
            break;
        }
    }
}

// --- Syndicate guard post -------------------------------------------------------------------------
// Trace and defend the stationary Syndicate guard post at Venus.

// Venus is reachable after scouting or tracing the guard post.
function venusReachable(){
    return global.tech['venus'] || (global.tech['shadow'] && global.tech.shadow >= 11) ? true : false;
}

// Return surviving guard-post corsairs.
export function syndicateGuard(){
    const post = global.race['sy_guard'];
    return post && Array.isArray(post.s) ? post.s.filter(s => s.damage < 100) : [];
}

// Return whether the guard post has been engaged and remains defended.
export function syndicateGuardHeld(){
    const post = global.race['sy_guard'];
    return post && post.hit && syndicateGuard().length > 0 ? true : false;
}

// Trace the guard post after enough detected engagements.
function syndicateTrace(){
    if (!global.tech['shadow'] || global.tech.shadow !== 10){ return; }
    // Start tracing from the Stealth Detection milestone.
    if (typeof global.race['sy_trace'] !== 'number'){ global.race['sy_trace'] = corsairsFought(); }
    if (corsairsFought() - global.race.sy_trace < sWarfare.guardFights){ return; }

    global.tech['shadow'] = 11;
    syndicateGuardPost();
    messageQueue(loc('syndicate_base_traced',[regionName(sWarfare.guardRegion)]),'danger',false,['combat','progress']);
    renderSpace();
    drawTech();
}

// Create the stationary guard fleet.
function syndicateGuardPost(){
    if (global.race['sy_guard']){ return; }
    const guard = [];
    for (let i = 0; i < sWarfare.guardFleet; i++){
        const ship = corsairHull(sWarfare.guardRegion);
        ship.guard = true;      // Keep guard ships in orbit.
        guard.push(ship);
    }
    global.race['sy_guard'] = { s: guard, hit: false };
}

// Mark the Venus Syndicate base as destroyed.
function syndicateBaseTaken(){
    const post = global.race['sy_guard'];
    post.taken = true;
    global.tech['shadow'] = 12;
    const base = global.race.sy_base[sWarfare.guardRegion];
    if (base){ base.closed = true; }
    messageQueue(loc('syndicate_base_destroyed',[regionName(sWarfare.guardRegion)]),'success',false,['combat','progress']);
    // Refresh the map and tech UI after the base is destroyed.
    renderSpace();
    drawTech();
}

// Resolve daily combat and repairs at the guard post.
function syndicateGuardDay(){
    const post = global.race['sy_guard'];
    if (!post || !Array.isArray(post.s) || post.taken){ return; }

    if (post.s.length > 0 && guardsAt(sWarfare.guardRegion).length > 0){
        post.hit = true;
        // Resolve guard combat before daily repairs.
        zBattle(sWarfare.guardRegion,syndicateGuard(),sWarfare.guardRounds);
    }

    // Remove destroyed guards before checking base status or repairing.
    for (let i = post.s.length - 1; i >= 0; i--){
        if (post.s[i].damage >= 100){ post.s.splice(i,1); }
    }

    if (post.s.length === 0){
        // Take the base only if player guards survive the battle.
        if (guardsAt(sWarfare.guardRegion).length > 0){ syndicateBaseTaken(); }
        else if (!post.broke){
            post.broke = true;
            messageQueue(loc('syndicate_base_broken',[regionName(sWarfare.guardRegion)]),'success',false,['combat','progress']);
            renderSpace();
        }
        return;
    }

    post.s.forEach(function(ship){
        if (ship.damage > 0){ ship.damage = Math.max(0,ship.damage - sWarfare.guardRepair); }
    });
}

// --- The day, and the tick ---------------------------------------------------------------------------

// Advance Syndicate bases, guard post, and patrols each day.
export function syndicateDay(){
    counterEspionageDay();
    sectorCommandDay();
    syndicateWatch();
    if (!corsairsActive()){ return; }
    syndicateBases().forEach(corsairBaseDay);
    syndicateTrace();
    syndicateGuardDay();
    patrolHunt();
}

// Every movement step: corsairs closing on freight, and patrols closing on corsairs.
export function syndicateMove(step){
    if (!corsairsActive()){ return; }
    syndicateShips().forEach(function(corsair){
        if (shipMoving(corsair)){ advanceShip(corsair,step); }
    });
    syndicateShips().forEach(corsairStalk);
    patrolStrike();
}

// One day of fighting in a single infested region: the fleet in orbit kills what it can, then whatever horde is
// left goes looking for something to tear down.
function infestationCombat(region){
    if (infestationFound(region)){
        let crew = 0;
        let bombard = 0;
        if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
            global.space.shipyard.ships.forEach(function(ship){
                if (shipDockedAt(ship) === region){
                    crew += shipCrewSize(ship);
                    let rating = shipAttackPower(ship);
                    bombard += ship.damage > 0 ? Math.round(rating * (100 - ship.damage) / 100) : rating;
                }
            });
        }

        // Crews fight as a landed squad, so they rate exactly as soldiers do everywhere else.
        let firepower = armyRating(crew,'army',0) + Math.round(bombard * orbitalStrikeRate);
        let kills = Math.min(Math.floor(seededRandom(0,Math.round(firepower) + 1,true)),global.race.zhorde[region]);

        global.race.zhorde[region] -= kills;
        global.stats.zkills += kills;

        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p){
            global.race.ocularPowerConfig.ds += Math.round(kills * traits.ocular_power.vars()[1]);
        }

        if (global.race.zhorde[region] <= 0){
            if (kills > 0){
                //messageQueue(loc('infestation_cleared',[regionName(region)]),'success',false,['combat']);
            }
            return;
        }
    }

    let survivors = global.race.zhorde[region];
    let zombiesPerRazingFinal = zombiesPerRazing;
    if (global.race['chicken']){ // Even zombies love chicken
        zombiesPerRazingFinal *= 1 - (traits.chicken.vars()[2] / 100);
        zombiesPerRazingFinal = Math.round(zombiesPerRazingFinal);
    }
    if (global.race['chameleon']){ // Good at hiding from zombies
        zombiesPerRazingFinal *= 1 + (traits.chameleon.vars()[2] / 100);
        zombiesPerRazingFinal = Math.round(zombiesPerRazingFinal);
    }
    if (global.race.universe === 'micro'){
        // Looking for easy prestige farming? Nope. Lets make it interesting.
        zombiesPerRazingFinal *= 0.5;
    }
    if (global.tech['overmind']){
        zombiesPerRazingFinal *= 0.25;
    }
    let maxRaze = global.tech['overmind'] ? razeCap * 4 : razeCap;
    let razings = Math.min(Math.floor(survivors / zombiesPerRazingFinal),maxRaze);
    if (razings < maxRaze && seededRandom(0,1,true) < (survivors % zombiesPerRazingFinal) / zombiesPerRazingFinal){
        razings++;
    }
    if (razings > 0){
        razeStructures(region,razings);
    }
}

// Pick `razings` structures at random from the region's target list and level them, moving each unit out
// of count and into razed so rebuilding it later is discounted the way any other razed structure is.
function razeStructures(region,razings){
    if (!razeTargets.hasOwnProperty(region)){ return; }
    let cat = razeTargets[region].c;
    if (!global.hasOwnProperty(cat)){ return; }

    let losses = {};
    for (let i=0; i<razings; i++){
        let standing = razeTargets[region].s.filter(s => global[cat][s]?.count > (losses[s] || 0));
        if (standing.length === 0){ break; }
        let target = standing[Math.floor(seededRandom(0,standing.length,true))];
        losses[target] = (losses[target] || 0) + 1;
    }

    let ambush = Object.keys(losses).length > 0 && !infestationFound(region);

    let messageLog = {};
    Object.keys(losses).forEach(function(s){
        let lost = losses[s];
        global[cat][s].count -= lost;
        global[cat][s]['razed'] = (global[cat][s]['razed'] || 0) + lost;

        if (global[cat][s].hasOwnProperty('on')){
            let turned_off = lost;
            if (global[cat][s].on < turned_off){
                turned_off = global[cat][s].on;
            }
            global[cat][s].on -= turned_off;
        }
        
        let regName = regionName(region);
        if (messageLog.hasOwnProperty(regName))
            messageLog[regName].push({name: structTitle(cat,region,s), count: lost});
        else
            messageLog[regName] = [{name: structTitle(cat,region,s), count: lost}];
    });
    Object.keys(messageLog).forEach(reg => {
        let destroyed;
        messageLog[reg].forEach(o => {
            if (destroyed)
                destroyed += ', ' + o.count.toLocaleString() + ' ' + o.name;
            else
                destroyed = o.count.toLocaleString() + ' ' + o.name;
        });
        zMessage(loc('infestation_razed',[destroyed, reg]),'danger');
    });

    // A razed factory takes lines out of the shared pool, so bank what it was making here rather than leaving it to
    // the next production tick.
    if (Object.keys(losses).some(s => factoryData.factoryStructs.includes(s))){
        factoryData.trimFactoryLines(factoryData.factoryCapacity());
    }

    // A hidden horde that just leveled something has announced itself: report the ambush once, then redraw so its
    // numbers appear.
    if (ambush){
        if (!global.race['zfound']){ global.race['zfound'] = {}; }
        global.race.zfound[region] = true;
        messageQueue(loc('infestation_discovered',[regionName(region)]),'danger',false,['combat','progress']);
        if (cat === 'tauceti'){ renderTauCeti(); }
        else { renderSpace(); }
    }
}

// Return a region label, including map-only scenery bodies.
export function regionName(region){
    let cat = razeTargets.hasOwnProperty(region) && razeTargets[region].c === 'tauceti' ? 'tauceti' : 'space';
    let info = actions[cat]?.[region]?.info;
    if (!info || !info.name){
        if (sceneryBodies[region]){
            let named = planetName()[sceneryBodies[region]];
            if (named){ return named; }
        }
        return region;
    }
    return typeof info.name === 'function' ? info.name() : info.name;
}

function structTitle(cat,region,struct){
    let title = actions[cat]?.[region]?.[struct]?.title;
    if (!title){ return struct; }
    return typeof title === 'function' ? title.call(actions[cat][region][struct]) : title;
}

// Hull classes ordered smallest to largest. Explorers are deliberately absent: they are a one-off Tau
// Ceti hull rather than a size tier, so a class-targeted salvage never returns one.
const shipClassSizes = ['corvette','frigate','destroyer','cruiser','battlecruiser','dreadnought'];

// The wrecks a salvage would choose between.
export function salvageCandidates(maxClass){
    let pool = global.race.inactive?.ships;
    if (!pool || pool.length === 0){ return []; }
    if (!maxClass){ return pool.slice(); }

    let top = shipClassSizes.indexOf(maxClass);
    if (top < 0){ return []; }
    // Largest first, so the search settles for the biggest hull still within the request.
    for (let i=top; i>=0; i--){
        let hulls = pool.filter(s => s.class === shipClassSizes[i]);
        if (hulls.length > 0){ return hulls; }
    }
    return [];
}

// A derelict predates the player's return to Sol, so it carries early-era equipment rather than
// anything tech-gated — randomised within those tiers so each seeded wreck is its own ship.
const derelictParts = {
    power: ['solar','diesel','fission'],
    weapon: ['railgun','laser','p_laser'],
    armor: ['steel','alloy'],
    engine: ['ion','tie','pulse'],
    sensor: ['visual','radar','lidar']
};

// Build a random corvette. Salvage that must always have something to offer falls back on this when
// nothing it can use is adrift. Not added to the wreck pool by the caller unless it wants it there.
function newDerelict(){
    let ship = {
        class: 'corvette',
        name: getRandomShipName(),
        damage: 0, fueled: false
    };
    TPShipInitTransit(ship, 'tau_gas2');

    Object.keys(derelictParts).forEach(function(part){
        ship[part] = derelictParts[part][Math.floor(seededRandom(0,derelictParts[part].length))];
    });
    return ship;
}

// Reserved wrecks, keyed by whoever reserved them — one shared store rather than a variable per building, so any
// number of things can hold a hull aside.
export function salvagePins(){
    if (!global.race['salvagePins']){ global.race['salvagePins'] = {}; }
    return global.race.salvagePins;
}

// The wreck reserved under `key`, or false. Safe to call from a render path — it reserves nothing.
export function salvagePin(key){
    return salvagePins()[key] || false;
}

// Reserve the wreck that the `key` salvage will advertise and hand over, lifting it out of the pool so nothing
// else can take it.
export function pinSalvage(key,maxClass){
    let pins = salvagePins();
    if (pins[key]){ return pins[key]; }

    if (!global.race.hasOwnProperty('inactive')){ global.race['inactive'] = {}; }
    if (!global.race.inactive.ships){ global.race.inactive.ships = []; }

    let choices = salvageCandidates(maxClass);
    let ship;
    if (choices.length > 0){
        ship = choices[Math.floor(seededRandom(0,choices.length))];
        global.race.inactive.ships.splice(global.race.inactive.ships.indexOf(ship),1);
    }
    else {
        ship = newDerelict();
    }
    pins[key] = ship;
    return ship;
}

// Take one derelict.
function pickDerelict(maxClass,pin){
    if (pin){
        let pins = salvagePins();
        let ship = pins[pin];
        if (!ship){ return false; }
        delete pins[pin];
        return ship;
    }

    let pool = global.race.inactive?.ships;
    if (!pool || pool.length === 0){ return false; }

    let choices = salvageCandidates(maxClass);
    if (choices.length === 0){ return false; }

    let ship = choices[Math.floor(seededRandom(0,choices.length))];
    return pool.splice(pool.indexOf(ship),1)[0];
}

// `maxClass` is either one class applied to every hull recovered, or a list naming a class per hull — which is how
// a single find can ask for, say, a corvette and a frigate and still report as one haul.
export function salvageShip(qty, locationName, sLocation, eventStyle, maxClass, pin){
    let wants = Array.isArray(maxClass) ? maxClass : new Array(Math.max(qty,0)).fill(maxClass || false);
    if (wants.length > 0){
        let salvaged = 0;
        for (let i=0; i<wants.length; i++){
            // A pin only ever names one hull, so it applies to the first recovery; anything further falls through to the
            // ordinary class search.
            let ship = pickDerelict(wants[i], i === 0 ? pin : false);
            if (!ship){ continue; }
            TPShipInitTransit(ship, sLocation);
            ship.damage = Math.floor(seededRandom(75,90));
            ship.fueled = false;
            let num = 1;
            let name = ship.name;
            while (global.space.shipyard.ships.filter(s => s.name === name).length > 0){
                num++;
                name = ship.name + ` ${num}`;
            }
            ship.name = name;
            global.space.shipyard.ships.push(ship);
            salvaged++;
        }
        if (salvaged > 0){
            if (eventStyle){
                let key = `scout_salvage_ship${Math.rand(0,10)}`;
                messageQueue(loc(key,[locationName]),'info',false,['progress']);
            }
            else {
                if (salvaged === 1){
                    messageQueue(loc('scout_spc_found_ship',[locationName]),'info',false,['progress']);
                }
                else {
                    messageQueue(loc('scout_spc_found_ships',[locationName,salvaged]),'info',false,['progress']);
                }
            }
            drawShipYard();
        }
        else {
            messageQueue(loc('scout_salvage_ship_fail',[locationName]),'info',false,['progress']);
        }
    }
}

export function renderTauCeti(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 6)){
        return;
    }
    let parent = $('#tauceti');
    clearElement(parent);
    parent.append($(`<h2 class="is-sr-only">${loc('tab_tauceti')}</h2>`));
    if (!global.tech['tauceti'] || global.tech.tauceti < 2){
        return;
    }

    Object.keys(tauCetiModules).forEach(function (region){
        let show = region.replace("tau_","");
        if (global.settings.tau[`${show}`]){
            let name = typeof tauCetiModules[region].info.name === 'string' ? tauCetiModules[region].info.name : tauCetiModules[region].info.name();
            
            let property = ``;
            if (tauCetiModules[region].info.hasOwnProperty('prop')){
                property = tauCetiModules[region].info.prop();
            }

            // The horde readout follows the support line when there is one.
            let infest = infestationLabel(region);

            if (tauCetiModules[region].info['support']){
                let support = tauCetiModules[region].info['support'];
                if (tauCetiModules[region].info['hide_support']){
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3>${infest}${property}</div></div>`);
                }
                else {
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3> <span v-show="s_max">{{ support }}/{{ s_max }}</span>${infest}${property}</div></div>`);
                }
                vBind({
                    el: `#sr${region}`,
                    data: global.tauceti[support],
                    methods: Object.assign({
                        filter(){
                            return tauCetiModules[region].info.filter(...arguments);
                        }
                    },infestationMethods(region))
                });
            }
            else {
                parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3>${infest}${property}</div></div>`);
                if (infest){
                    vBind({
                        el: `#sr${region}`,
                        data: global.race.zhorde,
                        methods: infestationMethods(region)
                    });
                }
            }

            popover(region, function(){
                    return typeof tauCetiModules[region].info.desc === 'string' ? tauCetiModules[region].info.desc : tauCetiModules[region].info.desc();
                },
                {
                    elm: `#${region} h3.name`,
                    classes: `has-background-light has-text-dark`
                }
            );

            Object.keys(tauCetiModules[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(tauCetiModules,region,tech)){
                    let c_action = tauCetiModules[region][tech];
                    setAction(c_action,'tauceti',tech);
                }
            });

            if (tauCetiModules[region].info.hasOwnProperty('extra')){
                tauCetiModules[region].info.extra(region);
            }
        }
    });
}

// Return a shipyard's localized home name.
export function yardLabel(zone){
    switch (zone){
        case 'tau_gas':
            return tauCetiModules.tau_gas.info.name();
        case 'tau_gas2':
            return tauCetiModules.tau_gas2.info.name();
        default:
            return planetName().dwarf;
    }
}

export function drawShipYard(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 5)){
        return;
    }
    setOrbits();
    repairSupplyFreighters();
    clearShipDrag();
    clearElement($('#dwarfShipYard'));
    if (global.space.hasOwnProperty('shipyard') && global.settings.showShipYard){
        let yard = $(`#dwarfShipYard`);

        if (!global.space.shipyard.hasOwnProperty('copy')){
            global.space.shipyard['copy'] = false;
        }

        fleetTemplate();

        if (!global.space.shipyard.hasOwnProperty('blueprint')){
            global.space.shipyard['blueprint'] = {
                class: 'corvette',
                armor: 'steel',
                weapon: 'railgun',
                engine: 'ion',
                power: 'diesel',
                sensor: 'radar',
                special: 'none',
                name: getRandomShipName()
            };
        }

        // A blueprint saved before the special slot existed has no entry for it.
        global.space.shipyard.blueprint.special = shipSpecial(global.space.shipyard.blueprint);
        if (!shipSpecialAllowed(global.space.shipyard.blueprint.special,global.space.shipyard.blueprint.class)){
            global.space.shipyard.blueprint.special = shipDefaultSpecial(global.space.shipyard.blueprint.class);
        }
        if (global.space.shipyard.blueprint.class === 'freighter' && global.space.shipyard.blueprint.special === 'none'){
            global.space.shipyard.blueprint.special = 'extra_fuel';
        }

        // Once the Explorer is retired, scrub it and the emdrive from any saved blueprint so a stale
        // configuration can't be constructed.
        if (explorerRetired()){
            if (global.space.shipyard.blueprint.class === 'explorer'){
                global.space.shipyard.blueprint.class = 'corvette';
            }
            if (global.space.shipyard.blueprint.engine === 'emdrive'){
                global.space.shipyard.blueprint.engine = 'ion';
            }
        }

        let plans = $(`<div id="shipPlans"></div>`);
        yard.append(plans);

        // Show the selector when both shipyards are operating.
        if (yardChoiceUnlocked()){
            let yards = ``;
            primaryYards.forEach(function(zone){
                yards += `<b-dropdown-item aria-role="listitem" class="yard_${zone}" @click="setYard('${zone}')">${yardLabel(zone)}</b-dropdown-item>`;
            });
            plans.append(`<div class="yardPrimary"><b-dropdown :triggers="['hover', 'click']" aria-role="list">
                <template #trigger>
                    <button class="button is-info">
                        <span>${loc('outer_shipyard_primary')}: {{ yardName() }}</span>
                    </button>
                </template>${yards}
            </b-dropdown></div>`);
        }

        let shipStats = $(`<div class="stats"></div>`);
        plans.append(shipStats);

        shipStats.append(`<div class="registry"><span class="has-text-caution">${loc(`outer_shipyard_registry`)}</span>: <b-input v-model="b.name" maxlength="25" class="nameplate"></b-input></div>`);
        shipStats.append(`<div><span class="has-text-caution">${loc(`crew`)}</span> <span v-html="crewText()"></span></div>`);
        shipStats.append(`<div><span class="has-text-caution">${loc(`power`)}</span> <span v-html="powerText()"></span></div>`);
        shipStats.append(`<div><span class="has-text-caution">${loc(`firepower`)}</span> <span v-html="fireText()"></span></div>`);
        shipStats.append(`<div v-show="bombardVis()"><span class="has-text-caution">${loc(`outer_shipyard_bombard`)}</span> <span v-html="bombardText()"></span></div>`);
        shipStats.append(`<div><span class="has-text-caution">${loc(`outer_shipyard_sensors`)}</span> <span v-html="sensorText()"></span></div>`);
        shipStats.append(`<div><span class="has-text-caution">${loc(`speed`)}</span> <span v-html="speedText()"></span></div>`);
        shipStats.append(`<div><span class="has-text-caution">${loc(`outer_shipyard_fuel`)}</span> <span v-html="fuelText()"></span></div>`);

        plans.append(`<div id="shipYardCosts" class="costList"></div>`);

        let options = $(`<div class="shipBayOptions"></div>`);
        plans.append(options);

        Object.keys(shipParts).forEach(function(k){
            let values = ``;
            shipParts[k].forEach(function(v,idx){
                values += `<b-dropdown-item aria-role="listitem" @click="setVal('${k}','${v}')" class="${k} a${idx}" data-val="${v}" v-show="avail('${k}','${idx}','${v}')">{{ lbl('${v}', '${k}') }}</b-dropdown-item>`;
            });

            // The special mount is not part of a hull until it has been researched, so the whole
            // control stays out of the yard rather than sitting there reading "None".
            let slot = (k === 'special' || k === 'weapon') ? ` v-show="slotOpen('${k}')"` : ``;
            options.append(`<b-dropdown :triggers="['hover', 'click']" aria-role="list"${slot}>
                <template #trigger>
                    <button class="button is-info">
                        <span>${loc(`outer_shipyard_${k}`)}: {{ lbl(b.${k}, '${k}') }}</span>
                    </button>
                </template>${values}
            </b-dropdown>`);
        });

        let assemble = $(`<div class="assemble"></div>`);
        assemble.append(`<button class="button is-info" v-on:click="build()"><span>${loc('outer_shipyard_build')}</span></button>`);
        assemble.append(`<button class="button is-info" v-show="fleetDesignerAvailable()" @click="fleetDesigner()">${loc('outer_shipyard_fleet_designer')}</button>`);
        assemble.append(`<span><b-checkbox class="patrol" v-model="s.expand" @change="redraw()">${loc('outer_shipyard_fleet_details')}</b-checkbox></span>`);
        assemble.append(`<span><b-checkbox class="patrol" v-model="s.sort" @change="redraw()">${loc('outer_shipyard_fleet_sort')}</b-checkbox></span>`);
        assemble.append(`<span><b-checkbox class="patrol" v-model="s.copy" @change="redraw()">${loc('outer_shipyard_copy_mode')}</b-checkbox></span>`);

        // Filter by system or shipyard locations
        if (shipyardViewUnlocked()){
            let systems = `<b-dropdown-item aria-role="listitem" class="sysAll" @click="setSys('all')">${systemLabel('all')}</b-dropdown-item>`;
            systems += `<b-dropdown-item aria-role="listitem" class="sysYards" @click="setSys('yards')">${systemLabel('yards')}</b-dropdown-item>`;
            shipyardSystems().forEach(function(sys){
                systems += `<b-dropdown-item aria-role="listitem" class="sys_${sys}" @click="setSys('${sys}')">${systemLabel(sys)}</b-dropdown-item>`;
            });
            assemble.append(`<span class="shipView"><b-dropdown :triggers="['hover', 'click']" aria-role="list">
                <template #trigger>
                    <button class="button is-info">
                        <span>${loc('outer_shipyard_view_system')}: {{ sysLabel() }}</span>
                    </button>
                </template>${systems}
            </b-dropdown></span>`);
            assemble.append(`<span><b-checkbox class="patrol" v-model="v.group" @change="redraw()">${loc('outer_shipyard_view_group')}</b-checkbox></span>`);
        }

        plans.append(assemble);

        assemble.append(`<div><span>{{ parkText() }}</span><a href="#" class="solarMap" @click="trigModal">${loc(`outer_shipyard_map`)}</span></a>`);

        updateCosts();

        vBind({
            el: '#shipPlans',
            data: {
                b: global.space.shipyard.blueprint,
                s: global.space.shipyard,
                v: shipyardView()
            },
            methods: {
                yardName(){
                    return yardLabel(shipyardZone());
                },
                parkText(){
                    return loc('outer_shipyard_park',[yardLabel(shipyardZone())]);
                },
                setYard(zone){
                    if (setShipyardPrimary(zone)){
                        vBind({el: `#shipPlans`},'update');
                        updateCosts();
                        drawShips();
                    }
                },
                fleetDesignerAvailable(){
                    return global.tech['syard_fleet'] ? true : false;
                },
                fleetDesigner(){
                    openFleetDesigner(this.$buefy.modal);
                },
                sysLabel(){
                    return systemLabel(shipyardView().sys);
                },
                setSys(sys){
                    shipyardView().sys = sys;
                    vBind({el: `#shipPlans`},'update');
                    drawShips();
                },
                setVal(b,v){
                    if (b === 'class' && v === 'freighter'){
                        global.space.shipyard.blueprint.weapon = 'none';
                        global.space.shipyard.blueprint.special = 'extra_fuel';
                    }
                    else if (b === 'class' && v === 'explorer'){
                        global.space.shipyard.blueprint.engine = 'emdrive';
                        global.space.shipyard.blueprint.weapon = 'railgun';
                        if (global.tech.syard_armor >= 3){ global.space.shipyard.blueprint.armor = 'neutronium'; }
                        if (global.tech.syard_sensor >= 4){ global.space.shipyard.blueprint.sensor = 'quantum'; }
                        if (global.tech.syard_power >= 4){ global.space.shipyard.blueprint.power = 'elerium'; }
                    }
                    else if (b === 'class' && v !== 'freighter' && global.space.shipyard.blueprint.class === 'freighter'){
                        // A freighter is forced to carry no weapon, so leaving the plan on 'none' after switching to a hull that can shoot
                        // means quietly designing an unarmed warship.
                        global.space.shipyard.blueprint.weapon = 'railgun';
                    }
                    else if (b === 'class' && v !== 'explorer' && global.space.shipyard.blueprint.class === 'explorer'){
                        global.space.shipyard.blueprint.engine = 'ion';
                    }
                    // Remove special if not allowed on ship class
                    if (b === 'class' && !shipSpecialAllowed(global.space.shipyard.blueprint.special,v)){
                        global.space.shipyard.blueprint.special = shipDefaultSpecial(v);
                    }
                    // Supply Ships have no weapon mount.
                    if (b === 'class' && v === 'supply_ship'){
                        global.space.shipyard.blueprint.weapon = 'none';
                    }
                    else if (b === 'class' && global.space.shipyard.blueprint.class === 'supply_ship' && global.space.shipyard.blueprint.weapon === 'none'){
                        global.space.shipyard.blueprint.weapon = 'railgun';
                    }
                    global.space.shipyard.blueprint[b] = v;
                    updateCosts();
                    vBind({el: `#shipPlans`},'update');
                },
                slotOpen(k){
                    return shipSlotOpen(k,global.space.shipyard.blueprint.class);
                },
                avail(k,i,v){
                    return shipPartAvailable(k,i,v,global.space.shipyard.blueprint.class);
                },
                crewText(){
                    return shipCrewSize(global.space.shipyard.blueprint);
                },
                powerText(){
                    let power = shipPower(global.space.shipyard.blueprint);
                    if (power < 0){
                        return `<span class="has-text-danger">${power}kW</span>`;
                    }
                    return `${power}kW`;
                },
                fireText(){
                    return shipAttackPower(global.space.shipyard.blueprint);
                },
                // Only worth a line on the design once there is a mount fitted to rate.
                bombardVis(){
                    return shipBombardPower(global.space.shipyard.blueprint) > 0;
                },
                bombardText(){
                    return shipBombardPower(global.space.shipyard.blueprint);
                },
                sensorText(){
                    return loc('outer_shipyard_sensor_range',[sensorRange(global.space.shipyard.blueprint)]);
                },
                speedText(){
                    let speed = shipSpeed(global.space.shipyard.blueprint) * starConstants.KM_S_PER_SHIPUNIT;
                    return Math.round(speed) + 'km/s';
                },
                fuelText(){
                    let fuel = shipFuelUse(global.space.shipyard.blueprint);
                    if (fuel.res){
                        return `-${fuel.burn} ${global.resource[fuel.res].name}`;
                    }
                    else {
                        return `N/A`;
                    }
                },
                build(){
                    if (shipPower(global.space.shipyard.blueprint) >= 0){
                        let raw = shipCosts(global.space.shipyard.blueprint);
                        let costs = {};
                        Object.keys(raw).forEach(function(res){
                            costs[res] = function(){ return raw[res]; }
                        });
                        if (!(global.settings.qKey && keyMap.q) && payCosts(shipyardPayer(), costs)){
                            let ship = deepClone(global.space.shipyard.blueprint);
                            buildTPShip(ship,false);
                        }
                        else if (queueTPShip(global.space.shipyard.blueprint)){
                            // The hull on the slipway has been spoken for, so the yard rolls a
                            // registry name for the next one.
                            global.space.shipyard.blueprint.name = getRandomShipName();
                            buildQueue();
                        }
                    }
                },
                trigModal(){
                    this.$buefy.modal.open({
                        hasModalCard: false,
                        content: '<div id="modalBox" class="modalBox"></div>'
                    });
                    // The star map provides its own close control.

                    let checkExist = setInterval(function(){
                        if ($('#modalBox').length > 0) {
                            clearInterval(checkExist);
                            solarModal();
                        }
                    }, 50);
                },
                redraw(){
                    drawShips();
                },
                lbl(l,c){
                    return loc(shipPartKey(c,l));
                }
            }
        });

        Object.keys(shipParts).forEach(function(type){
            for (let i=0; i<$(`#shipPlans .${type}`).length; i++){
                popover(`shipPlans${type}${i}`, function(obj){
                    let val = $(obj.this).attr(`data-val`);
                    if (type === 'armor'){ return armorDesc(val); }
                    if (val === 'fuel_tanker'){ return loc(`outer_shipyard_special_fuel_tanker_desc`,[tankerFuelRange]); }
                    if (val === 'mobile_storage'){ return loc(`outer_shipyard_special_mobile_storage_desc`); }
                    return loc(`${shipPartKey(type,val)}_desc`);
                },
                {
                    elm: `#shipPlans .${type}.a${i}`,
                    placement: 'right'
                });
            }
        });

        yard.append($(`<div id="shipList" class="sticky"></div>`));
        drawShips();
    }
}

export function TPShipDesc(parent,obj){
    let ship = obj.type;
    let raw = shipCosts(ship);
    let costs = {};
    Object.keys(raw).forEach(function(res){
        costs[res] = function(){ return raw[res]; }
    });

    var desc = $(`<div class="shipPopper"></div>`);
    var shipPattern = $(`<div class="divider">${loc(`outer_shipyard_class_${ship.class}`)} | ${loc(`outer_shipyard_engine_${ship.engine}`)} | ${loc(`outer_shipyard_weapon_${ship.weapon}`)} | ${loc(`outer_shipyard_power_${ship.power}`)} | ${loc(shipPartKey('sensor',ship.sensor))}</div>`);
    parent.append(desc);

    desc.append(shipPattern);

    // Charge hull costs to the active shipyard world.
    let payer = { id: 'tp-ship', cost: costs, doNotAdjustCost: true, supply(){ return shipyardZone(); } };
    let pool = actionPool(payer);

    var cost = $(`<div class="costList"${pool ? ` data-pool="${pool}"` : ``}></div>`);
    desc.append(cost);

    let tc = timeCheck(payer, false, true);
    Object.keys(costs).forEach(function (res){
        if (costs[res]() > 0){
            var label = res === 'Money' ? '$' : global.resource[res].name + ': ';
            var color = poolHeld(res, pool) >= costs[res]() ? 'has-text-dark' : ( res === tc.r ? 'has-text-danger' : 'has-text-alert');
            cost.append($(`<div class="${color} res-${res}" data-${res}="${costs[res]()}">${label}${sizeApproximation(costs[res](),2)}</div>`));
        }
    });

    if (tc && tc['t']){
        desc.append($(`<div class="divider"></div><div id="popTimer" class="flair has-text-advanced">{{ timer(t) }}</div>`));
        vBind({
            el: '#popTimer',
            data: tc,
            methods: {
                timer(t){
                    return loc('action_ready',[timeFormat(t)]);
                }
            }
        });
    }
    
    return desc;
}

export function updateCosts(){
    let costs = shipCosts(global.space.shipyard.blueprint);
    clearElement($(`#shipYardCosts`));

    // Read blueprint costs from the active shipyard world.
    let pool = actionPool(shipyardPayer());
    if (pool){ $(`#shipYardCosts`).attr(`data-pool`,pool); }
    else { $(`#shipYardCosts`).removeAttr(`data-pool`); }

    Object.keys(costs).forEach(function(k){
        let color = poolHeld(k, pool) >= costs[k] ? `has-text-success` : `has-text-danger`;
        if (k === 'Money'){
            $(`#shipYardCosts`).append(`<span class="res-${k} ${color}" data-${k}="${costs[k]}" data-ok="has-text-success">${global.resource[k].name}${sizeApproximation(costs[k])}</span>`);
        }
        else {
            $(`#shipYardCosts`).append(`<span> | </span><span class="res-${k} ${color}" data-${k}="${costs[k]}" data-ok="has-text-success">${global.resource[k].name} ${sizeApproximation(costs[k])}</span>`);
        }
    });
}

export function clearShipDrag(){
    let el = $('#shipList')[0];
    if (el){
        let sort = Sortable.get(el);
        if (sort){
            sort.destroy();
        }
    }
}

function dragShipList(){
    let el = $('#shipList')[0];
    if (el){
        Sortable.create(el,{
            onEnd(e){
                let order = global.space.shipyard.ships;
                order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
                global.space.shipyard.ships = order;
                drawShips();
            }
        });
    }
}

// Ship List View Options
export function shipyardViewUnlocked(){
    return global.tech['resettle'] || global.tech['shadow'] ? true : false;
}

// Held under global.space.shipyard so it saves with the yard. Created and backfilled on read rather
// than migrated, so an older save picks it up the first time the tab is drawn.
export function shipyardView(){
    let yard = global.space.shipyard;
    if (!yard['view'] || typeof yard.view !== 'object'){ yard['view'] = {}; }
    let v = yard.view;
    if (typeof v['sys'] !== 'string'){ v['sys'] = 'all'; }
    if (typeof v['group'] !== 'boolean'){ v['group'] = false; }
    if (!v['fold'] || typeof v.fold !== 'object'){ v['fold'] = {}; }
    // Folded fleets, keyed by fleet id, kept apart from the folded locations so the two cannot collide.
    if (!v['ffold'] || typeof v.ffold !== 'object'){ v['ffold'] = {}; }
    return v;
}

// The view as it should actually be applied.
function activeShipyardView(){
    return shipyardViewUnlocked() ? shipyardView() : { sys: 'all', group: false, fold: {}, ffold: shipyardView().ffold };
}

// The ships a row's readout describes.
function rowGroup(ship){
    if (!ship){ return []; }
    if (global.tech['syard_fleet'] && ship.flag && ship.fid && shipyardView().ffold[ship.fid]){
        let crew = fleetMembers(ship.fid);
        if (crew.length > 1){ return crew; }
    }
    return [ship];
}

// A folded fleet still exposes the tanks that govern its range, but identical fuel types are
// consolidated so five diesel hulls read as one Oil total instead of five repeated Oil labels.
function groupFuelText(group){
    const fuels = {};
    const order = [];
    group.forEach(function(ship){
        const fuel = shipFuelUse(ship);
        if (!fuel.res){ return; }
        if (!fuels[fuel.res]){
            fuels[fuel.res] = { amount: 0, tank: 0 };
            order.push(fuel.res);
        }
        fuels[fuel.res].amount += shipFuelAmount(ship);
        fuels[fuel.res].tank += shipFuelTank(ship);
    });
    if (!order.length){ return loc('outer_shipyard_fuel_solar'); }
    return order.map(function(res){
        const total = fuels[res];
        return `${global.resource[res].name} ${sizeApproximation(total.amount,0)} / ${sizeApproximation(total.tank,0)}`;
    }).join(`, `);
}

// Systems the fleet can be spread across: home, plus wherever the jump gate network reaches.
function shipyardSystems(){
    let seen = { sun: true };
    Object.keys(jumpGates).forEach(function(gate){ seen[jumpGates[gate].system] = true; });
    return Object.keys(seen);
}

// Display name of a system key, the same label locSystemName puts on a location.
function systemLabel(sys){
    if (sys === 'all'){ return loc('outer_shipyard_system_all'); }
    if (sys === 'yards'){ return loc('outer_shipyard_system_yards'); }
    let star = sys === 'sun' ? starData.spc_sun : starData[sys];
    return star && star.label ? star.label : sys;
}

const shipyardRanks = {
    // Lower number -> higher in the auto-sorted list
    location: {
        spc_dwarf: 1,
        spc_moon: 2,
        spc_red: 3,
        spc_belt: 4,
        spc_gas: 5,
        spc_gas_moon: 6,
        spc_titan: 7,
        spc_enceladus: 8,
        spc_triton: 9,
        spc_makemake: 10,
        spc_eris: 11,
        tauceti: 12,
        tau_home: 13,
        tau_red: 14,
        tau_gas: 15,
        tau_gas2: 16,
        tau_roid: 17,
        spc_sun_gate: 18,
        spc_home: 19,
    },
    class: {
        corvette: 1,
        frigate: 2,
        destroyer: 3,
        cruiser: 4,
        battlecruiser: 5,
        dreadnought: 6,
        explorer: 7,
        freighter: 8,
        supply_ship: 9,
    },
    engine: {
        ion: 1,
        tie: 3,
        pulse: 2,
        photon: 4,
        vacuum: 5,
        emdrive: 6,
        electrokinetic: 7
    },
    power: {
        solar: 1,
        diesel: 2,
        fission: 3,
        fusion: 4,
        elerium: 5,
    }
};

// A ship at a yard that can currently take it in comes first, whatever the location table says: those are the ones
// being worked on, and they are what you came to the list to look at.
function shipyardShipCompare(a,b,yards){
    yards = yards || activeRepairYards();
    return (
        (yards.includes(shipPort(a)) ? 0 : 1) - (yards.includes(shipPort(b)) ? 0 : 1)
        || (shipyardRanks.location[shipPort(a)] ?? 0) - (shipyardRanks.location[shipPort(b)] ?? 0)
        || shipMoving(a) - shipMoving(b)
        || shipLegLeft(a) - shipLegLeft(b)
        || (shipyardRanks.class[a.class] ?? 0) - (shipyardRanks.class[b.class] ?? 0)
        || (shipyardRanks.engine[a.engine] ?? 0) - (shipyardRanks.engine[b.engine] ?? 0)
        || (shipyardRanks.power[a.power] ?? 0) - (shipyardRanks.power[b.power] ?? 0)
    );
}

// Draw a fleet as the one thing it is: each flagship keeps whatever place the ordering gave it, and the ships
// under its command are lifted out of wherever they landed and set down directly behind it.
function clusterFleets(ships){
    if (!global.tech['syard_fleet']){ return ships; }

    let escorts = {};
    ships.forEach(function(s){
        if (!s.fid || s.flag){ return; }
        if (!escorts[s.fid]){ escorts[s.fid] = []; }
        escorts[s.fid].push(s);
    });
    if (Object.keys(escorts).length === 0){ return ships; }

    let placed = {};
    let ordered = [];
    ships.forEach(function(s){
        // An escort is positioned by its flagship, so it is passed over here and picked up below.
        if (s.fid && !s.flag && escorts.hasOwnProperty(s.fid)){ return; }
        ordered.push(s);
        if (s.flag && escorts.hasOwnProperty(s.fid) && !placed[s.fid]){
            placed[s.fid] = true;
            escorts[s.fid].forEach(function(e){ ordered.push(e); });
        }
    });

    // Nothing should be left holding a fleet id with no flagship still flying, but a ship dropped here
    // would vanish off the list entirely rather than merely sit in the wrong place, so put any back.
    Object.keys(escorts).forEach(function(fid){
        if (placed[fid]){ return; }
        escorts[fid].forEach(function(e){ ordered.push(e); });
    });

    return ordered;
}

// Room left in the build queue, counted the way the queue itself counts it.
function queueSpace(){
    let used = 0;
    for (let j=0; j<global.queue.queue.length; j++){
        used += Math.ceil(global.queue.queue[j].q / global.queue.queue[j].qs);
    }
    return global.queue.max - used;
}

// Put one ship design on the build queue.
function queueTPShip(design, fleetBuild){
    if (queueSpace() <= 0){ return false; }
    let blueprint = deepClone(design);
    // Remove automated routing from queued designs.
    delete blueprint.autoRoute;
    global.queue.queue.push({
        id: `tp-ship-${Math.rand(0,100000)}`,
        action: 'tp-ship',
        type: blueprint,
        fleetBuild: fleetBuild ? { id: fleetBuild.id, flagship: fleetBuild.flagship } : false,
        label: blueprint.name,
        cna: false,
        time: 0,
        q: 1,
        qs: 1,
        t_max: 0,
        bres: false
    });
    return true;
}

// Open the Fleet Designer with a blueprint draft.
function openFleetDesigner(modalApi, draft = deepClone(global.space.shipyard.blueprint)){
    let modal = modalApi.open({
        hasModalCard: false,
        content: '<div id="modalBox" class="modalBox"></div>'
    });
    modalCloseButton();
    let checkExist = setInterval(function(){
        if ($('#modalBox').length > 0){
            clearInterval(checkExist);
            fleetDesignerModal(modal, draft);
        }
    }, 50);
    return modal;
}

// Populate the opened Fleet Designer modal.
function fleetDesignerModal(modal, draft){
    let box = $('#modalBox');
    box.closest('.animation-content').addClass('fleetDesignerModal');
    box.append($('<p id="modalBoxTitle" class="has-text-warning modalTitle">' + loc('outer_shipyard_fleet_designer') + '</p>'));
    let designer = $('<div id="fleetDesigner" class="fleetDesigner"></div>');
    let controls = $('<section class="fleetTemplateControls" aria-label="' + loc('outer_shipyard_fleet_designer') + '"></section>');
    controls.append('<div class="fleetDesignSummary"><div class="registry"><span class="has-text-caution">' + loc('outer_shipyard_registry') + '</span><b-input v-model="b.name" maxlength="25" class="nameplate"></b-input></div><div class="fleetDesignStats has-text-info" aria-live="polite"><div>{{ templateStats(b) }}</div><div v-html="powerStats(b)"></div></div></div>');
    let partGrid = $('<div class="fleetPartGrid"></div>');
    Object.keys(shipParts).forEach(function(part){
        let values = '';
        shipParts[part].forEach(function(value, index){
            values += '<b-dropdown-item aria-role="listitem" @click="setVal(\'' + part + '\',\'' + value + '\')" class="' + part + ' a' + index + '" data-val="' + value + '" v-show="avail(\'' + part + '\',\'' + index + '\',\'' + value + '\')">{{ lbl(\'' + value + '\', \'' + part + '\') }}</b-dropdown-item>';
        });
        let slot = (part === 'special' || part === 'weapon') ? ' v-show="slotOpen(\'' + part + '\')"' : '';
        partGrid.append('<div class="fleetPart"' + slot + '><span class="fleetPartLabel">' + loc('outer_shipyard_' + part) + '</span><b-dropdown :triggers="[\'click\']" aria-role="list"><template #trigger><button type="button" class="button is-info"><span>{{ lbl(b.' + part + ', \'' + part + '\') }}</span></button></template>' + values + '</b-dropdown></div>');
    });
    controls.append(partGrid);
    designer.append(controls);
    let template = $('<section class="fleetTemplate" aria-label="' + loc('outer_shipyard_fleet_template') + '"></section>');
    template.append('<div class="fleetTemplateHead"><span class="has-text-caution">' + loc('outer_shipyard_fleet_template') + '</span><span class="fleetTemplateCommand" v-show="t.length > 0">{{ templateCommand() }}</span></div>');
    template.append('<div v-show="t.length === 0" class="fleetTemplateEmpty has-text-info">' + loc('outer_shipyard_fleet_template_empty') + '</div>');
    template.append('<div class="fleetTemplateShips"><div v-for="(ship, index) in t" class="fleetTemplateShip"><div class="fleetTemplateShipHead"><span>{{ templateLabel(ship, index) }}</span><button type="button" class="fleetTemplateRemove has-text-danger" @click="removeTemplate(index)" :aria-label="removeTemplateLabel(ship)">✖</button></div><div class="has-text-info">{{ templateStats(ship) }}</div><div class="fleetTemplatePower" v-html="powerStats(ship)"></div></div></div>');
    template.append('<div class="fleetTemplateActions"><button type="button" class="button is-info" v-show="t.length === 0" :disabled="!canAddFlagship()" @click="addFlagship()">' + loc('outer_shipyard_fleet_template_flagship') + '</button><button type="button" class="button is-info" v-show="t.length > 0" @click="addEscort()">' + loc('outer_shipyard_fleet_template_escort') + '</button><button type="button" class="button is-primary" v-show="t.length > 0" :disabled="!templateQueueReady()" @click="queueTemplate()">' + loc('outer_shipyard_fleet_template_queue') + '</button><button type="button" class="button is-danger" v-show="t.length > 0" @click="clearTemplate()">' + loc('outer_shipyard_fleet_template_clear') + '</button></div>');
    template.append('<div class="fleetTemplateStatus has-text-danger" v-show="templateStatus()" role="alert">{{ templateStatus() }}</div>');
    designer.append(template);
    box.append(designer);
    vBind({
        el: '#fleetDesigner',
        data: { b: draft, t: fleetTemplate() },
        methods: {
            templateLabel(ship, index){
                let role = loc(index === 0 ? 'outer_shipyard_fleet_template_flagship' : 'outer_shipyard_fleet_template_escort');
                return role + ': ' + ship.name + ' (' + loc('outer_shipyard_class_' + ship.class) + ')';
            },
            templateStats(ship){
                let speed = Math.round(shipSpeed(ship) * starConstants.KM_S_PER_SHIPUNIT) + 'km/s';
                let roleStat = ship.class === 'freighter'
                    ? loc('supply_freighter_load') + ': ' + freightCapacity(ship)
                    : ship.class === 'supply_ship'
                        ? loc('outer_shipyard_special') + ': ' + loc('outer_shipyard_special_' + shipSpecial(ship))
                        : loc('firepower') + ': ' + shipAttackPower(ship);
                return loc('speed') + ': ' + speed + ' | ' + roleStat + ' | ' + loc('outer_shipyard_sensors') + ': ' + loc('outer_shipyard_sensor_range',[sensorRange(ship)]);
            },
            powerStats(ship){
                let power = shipPowerStats(ship);
                let reserve = power.balance >= 0
                    ? '<span class="has-text-success">+' + power.balance + 'kW ' + loc('outer_shipyard_power_reserve') + '</span>'
                    : '<span class="has-text-danger">' + power.balance + 'kW ' + loc('outer_shipyard_power_deficit') + '</span>';
                return loc('power') + ': ' + power.output + 'kW ' + loc('outer_shipyard_power_output')
                    + ' | ' + power.draw + 'kW ' + loc('outer_shipyard_power_draw') + ' | ' + reserve;
            },
            lbl(label, category){
                return loc(shipPartKey(category,label));
            },
            setVal(part, value){
                if (part === 'class' && value === 'freighter'){
                    this.b.weapon = 'none';
                    this.b.special = 'extra_fuel';
                }
                else if (part === 'class' && value === 'explorer'){
                    this.b.engine = 'emdrive';
                    this.b.weapon = 'railgun';
                    if (global.tech.syard_armor >= 3){ this.b.armor = 'neutronium'; }
                    if (global.tech.syard_sensor >= 4){ this.b.sensor = 'quantum'; }
                    if (global.tech.syard_power >= 4){ this.b.power = 'elerium'; }
                }
                else if (part === 'class' && value !== 'freighter' && this.b.class === 'freighter'){
                    this.b.weapon = 'railgun';
                }
                else if (part === 'class' && value !== 'explorer' && this.b.class === 'explorer'){
                    this.b.engine = 'ion';
                }
                if (part === 'class' && !shipSpecialAllowed(this.b.special,value)){
                    this.b.special = shipDefaultSpecial(value);
                }
                if (part === 'class' && value === 'supply_ship'){
                    this.b.weapon = 'none';
                }
                else if (part === 'class' && this.b.class === 'supply_ship' && this.b.weapon === 'none'){
                    this.b.weapon = 'railgun';
                }
                this.b[part] = value;
                this.$forceUpdate();
            },
            slotOpen(part){
                return shipSlotOpen(part,this.b.class);
            },
            avail(part, index, value){
                return shipPartAvailable(part,index,value,this.b.class);
            },
            removeTemplateLabel(ship){
                return loc('outer_shipyard_fleet_template_remove',[ship.name]);
            },
            canAddFlagship(){
                return global.tech['syard_fleet'] && fleetCommandRating(this.b) > 0 && shipPower(this.b) >= 0;
            },
            addFlagship(){
                if (!this.canAddFlagship()){ return; }
                let template = fleetTemplate();
                template.splice(0, template.length, deepClone(this.b));
                this.b.name = getRandomShipName();
                this.$forceUpdate();
            },
            addEscort(){
                let template = fleetTemplate();
                if (template.length === 0 || shipPower(this.b) < 0){ return; }
                template.push(deepClone(this.b));
                this.b.name = getRandomShipName();
                this.$forceUpdate();
            },
            removeTemplate(index){
                fleetTemplate().splice(index, 1);
                this.$forceUpdate();
            },
            clearTemplate(){
                fleetTemplate().splice(0);
                this.$forceUpdate();
            },
            templateCommand(){
                let template = fleetTemplate();
                let used = template.slice(1).reduce(function(total, ship){ return total + fleetCommandCost(ship); }, 0);
                let rating = template[0] ? fleetCommandRating(template[0]) : 0;
                return loc('outer_shipyard_fleet_template_command',[used,rating]);
            },
            templateQueueReady(){
                return fleetTemplateValid() && queueSpace() >= fleetTemplate().length;
            },
            templateStatus(){
                let template = fleetTemplate();
                if (template.length === 0){ return ''; }
                if (fleetCommandRating(template[0]) <= 0){ return loc('outer_shipyard_fleet_template_flagship_invalid'); }
                let used = template.slice(1).reduce(function(total, ship){ return total + fleetCommandCost(ship); }, 0);
                if (used > fleetCommandRating(template[0])){ return loc('outer_shipyard_fleet_template_command_invalid'); }
                return queueSpace() < template.length ? loc('outer_shipyard_fleet_template_queue_full') : '';
            },
            queueTemplate(){
                let queued = queueFleetTemplate();
                if (queued <= 0){ return; }
                fleetTemplate().splice(0);
                buildQueue();
                messageQueue(loc('outer_shipyard_fleet_template_queued',[queued]),'info',false,['progress']);
                modal.close();
            }
        }
    });
}

// Return the saved Fleet Designer template.
function fleetTemplate(){
    let yard = global.space.shipyard;
    if (!Array.isArray(yard.fleetTemplate)){ yard.fleetTemplate = []; }
    return yard.fleetTemplate;
}

// Return whether every ship in a fleet draft can join its flagship.
function fleetTemplateValid(template = fleetTemplate()){
    let flagship = template[0];
    if (!global.tech['syard_fleet'] || !flagship || fleetCommandRating(flagship) <= 0 || shipPower(flagship) < 0){ return false; }
    let command = template.slice(1).reduce(function(total, ship){ return total + fleetCommandCost(ship); }, 0);
    return command <= fleetCommandRating(flagship) && template.every(ship => shipPower(ship) >= 0);
}

// Queue the flagship first, followed by every escort carrying the same fleet-build token.
function queueFleetTemplate(){
    let template = fleetTemplate();
    if (!fleetTemplateValid(template) || queueSpace() < template.length){ return 0; }
    let yard = global.space.shipyard;
    yard.fleetBuildId = (yard.fleetBuildId || 0) + 1;
    let id = yard.fleetBuildId;
    template.forEach(function(ship, index){
        queueTPShip(ship, { id: id, flagship: index === 0 });
    });
    return template.length;
}

// Copy a ship design without its runtime state or cargo.
function copyShipDesign(ship){
    let design = deepClone(ship);
    [
        // Position and transit state, including the fields of older saves.
        'location','movement',...retiredShipFields,'transit','damage','crew','ret',
        // Fleet membership.
        'fid','flag',
        // Assigned patrol or freight route.
        'patrol','tradeRoute',
        // Cargo resources.
        'cargo',
        // Starter-freighter assignment flags.
        'supplyGrant','supplyRouteStarter','supplyDockFixed'
    ].forEach(function(runtime){
        delete design[runtime];
    });
    if (!shipSpecialAllowed(design.special,design.class)){ design.special = shipDefaultSpecial(design.class); }
    // Exclude tanker reserves from copied ship designs.
    delete design.tanker;
    design.name = getRandomShipName();
    return design;
}

export function drawShips(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 5)){
        return;
    }
    clearShipDrag();
    clearElement($('#shipList'));

    if (global.tech['isolation'] && !global.tech['resettle']){
        return;
    }

    let list = $('#shipList');

    let repairYards = activeRepairYards();
    if (global.space.shipyard.sort){
        global.space.shipyard.ships = global.space.shipyard.ships.sort(function(a,b){ return shipyardShipCompare(a,b,repairYards); });
    }
    global.space.shipyard.ships = clusterFleets(global.space.shipyard.ships);


    const spaceRegions = spaceTech();
    let regionNames = {};
    Object.keys(spaceRegions).forEach(function(region){
        let name = typeof spaceRegions[region].info.name === 'string' ? spaceRegions[region].info.name : spaceRegions[region].info.name();
        regionNames[region] = name;
    });
    Object.keys(tauCetiModules).forEach(function(region){
        if (tauCetiModules[region].info.nav()){
            let name = typeof tauCetiModules[region].info.name === 'string' ? tauCetiModules[region].info.name : tauCetiModules[region].info.name();
            regionNames[region] = name;
        }
    });
    regionNames['tauceti'] = loc('tech_era_tauceti');
    if (global.race['tempCoordinates']){
        Object.keys(global.race.tempCoordinates).forEach(function(key){
            if (global.race.tempCoordinates[key]){ regionNames[key] = global.race.tempCoordinates[key].n; }
        });
    }
    // Use supply-region names for freighter locations outside combat dispatch zones.
    global.space.shipyard.ships.forEach(function(ship){
        const location = shipBound(ship);
        if (!regionNames[location]){ regionNames[location] = supplyRegionName(location); }
    });

    let view = activeShipyardView();

    // A fleet that has since been stood down leaves its fold state behind. Drop it, so a long game does
    // not accumulate a record for every fleet that ever flew — fleet ids are never reused.
    Object.keys(view.ffold).forEach(function(fid){
        if (!global.space.shipyard.ships.some(s => s.flag && `${s.fid}` === fid)){ delete view.ffold[fid]; }
    });

    // What to draw and in what order, as [index, ship] pairs. The index is the ship's real place in the
    // array — a row binds and acts on that, so it stays correct however the list is arranged on screen.
    let entries = [];
    let collapsed = false;
    global.space.shipyard.ships.forEach(function(ship,i){
        // Which tab should the ship be drawn in
        let shipDisplayLocation = shipBound(ship);

        // 'yards' filters for locations with shipyards rather then star systems
        if (view.sys === 'yards'){
            if (!repairYards.includes(shipDisplayLocation)){ return; }
        }
        else if (view.sys !== 'all' && locSystem(shipDisplayLocation) !== view.sys){ return; }
        // A folded fleet shows its flagship and nothing else
        if (ship.fid && !ship.flag && view.ffold[ship.fid]){
            collapsed = true;
            return;
        }
        entries.push({ i: i, ship: ship, dispLoc: shipDisplayLocation });
    });

    if (view.group){
        // One header per location, in the order the locations first come up in the list — so with Auto
        // Sort on the groups follow the same ranking the ships do.
        let order = [];
        let byLoc = {};
        entries.forEach(function(e){
            if (!byLoc.hasOwnProperty(e.dispLoc)){
                byLoc[e.dispLoc] = [];
                order.push(e.dispLoc);
            }
            byLoc[e.dispLoc].push(e);
        });
        order.forEach(function(locationName,group){
            drawShipGroup(list,group,locationName,regionNames,repairYards);
            if (!view.fold[locationName]){
                byLoc[locationName].forEach(function(e){ drawShipRow(list,e.i,e.ship,regionNames); });
            }
        });
    }
    else {
        entries.forEach(function(e){ drawShipRow(list,e.i,e.ship,regionNames); });
    }

    // Hand-ordering moves a ship by its position in the list, which only means anything while the list and the array
    // agree.
    if (view.sys === 'all' && !view.group && !collapsed){
        dragShipList();
    }
}

// The collapsed summary for one location: what is there, without the detail.
function drawShipGroup(list,g,locationName,regionNames,repairYards){
    let yard = repairYards.includes(locationName)
        ? `<span class="dispatchYard" title="${loc('outer_shipyard_repair_yard')}" aria-label="${loc('outer_shipyard_repair_yard')}">🛠️</span>`
        : ``;
    // The toggle has to be an inner element: Vue treats the element it mounts on as an inert container
    // and never compiles directives written on it.
    let head = $(`<div id="shipGrp${g}" class="shipGroup"></div>`);
    head.append(`<a class="groupFold" @click="fold()" role="button" :aria-expanded="folded() ? 'false' : 'true'"><span class="groupArrow" v-html="arrow()"></span> <span class="name has-text-caution">${regionNames[locationName] || locationName}</span>${yard}</a>`);
    head.append(`<span class="shipStat"><span class="has-text-warning">${loc('outer_shipyard_group_ships')}</span> <span class="pad" v-html="count()"></span></span><wbr>`);
    head.append(`<span class="shipStat"><span class="has-text-warning">${loc('firepower')}</span> <span class="pad" v-html="fire()"></span></span><wbr>`);
    head.append(`<span class="shipStat"><span class="has-text-warning">${loc('crew')}</span> <span class="pad" v-html="crew()"></span></span><wbr>`);
    head.append(`<span class="shipStat" v-show="transit() > 0"><span class="has-text-warning">${loc('outer_shipyard_group_transit')}</span> <span class="pad" v-html="transit()"></span></span><wbr>`);
    list.append(head);

    // Ships of this group, read fresh on every render so the summary cannot go stale.
    let here = function(){
        return global.space.shipyard.ships.filter(function(s){ return shipBound(s) === locationName; });
    };

    // Bound to the view options behind a wrapper key rather than to the yard itself.
    vBind({
        el: `#shipGrp${g}`,
        data: { v: shipyardView() },
        methods: {
            folded(){
                return shipyardView().fold[locationName] ? true : false;
            },
            arrow(){
                return shipyardView().fold[locationName] ? `&#9656;` : `&#9662;`;
            },
            fold(){
                let fold = shipyardView().fold;
                if (fold[locationName]){ delete fold[locationName]; }
                else { fold[locationName] = true; }
                drawShips();
            },
            count(){
                return here().length;
            },
            fire(){
                return here().reduce(function(t,s){ return t + shipAttackPower(s); },0);
            },
            crew(){
                return here().reduce(function(t,s){ return t + shipCrewSize(s); },0);
            },
            transit(){
                return here().filter(shipMoving).length;
            }
        }
    });
}

function drawShipRow(list,i,ship,regionNames){
    {
        let dispatch = `<button id="ship${i}loc" class="button is-info" @click="pickDest(${i})">
            <span>${regionNames[shipBound(ship)]}</span>
        </button>`;

        // A ship serving under a flagship is indented behind it, so a fleet reads as one block whether
        // or not it is folded.
        let escort = ship.fid && !ship.flag ? ` escort` : ``;

        if (global.space.shipyard.expand){
            let ship_class = `${loc(`outer_shipyard_engine_${ship.engine}`)} ${loc(`outer_shipyard_class_${ship.class}`)}`;
            let desc = $(`<div id="shipReg${i}" class="shipRow ship${i}${escort}"></div>`);
            let row1 = $(`<div class="row1"><span class="name has-text-caution">${ship.name}</span> <span v-show="scrapAllowed(${i})">| </span><a class="scrap${i}" v-show="scrapAllowed(${i})" @click="scrap(${i})" role="button">${loc(`outer_shipyard_scrap`)}</a><span v-show="refitShow(${i})"> | <a class="shipRefitOpen" @click="refitAction(${i})" role="button">${loc(`outer_shipyard_refit`)}</a></span><span v-show="copyMode()"> | <a class="loadDesign" @click="loadDesign(${i})" role="button">${loc(`outer_shipyard_copy_design`)}</a> | <a class="copyBuild" @click="copyBuild(${i})" role="button">${loc(`outer_shipyard_copy_build`)}</a></span><span v-show="loadFleetShow(${i})"> | <a class="loadFleet" @click="loadFleet(${i})" role="button">${loc('outer_shipyard_fleet_template_load')}</a></span><a class="fleetFold" v-show="fleetFoldShow(${i})" @click="fleetFold(${i})" role="button" :aria-expanded="fleetFolded(${i}) ? 'false' : 'true'" :aria-label="fleetFoldLabel(${i})"><span class="groupArrow" v-html="fleetArrow(${i})"></span></a><span v-show="fleetTag(${i})" class="flagship" v-html="fleetTag(${i})"></span><span v-show="fleetShow(${i})"> | <a class="fleetToggle" @click="fleetAction(${i})" role="button" v-html="fleetText(${i})"></a></span> | <span class="has-text-warning">${ship_class}</span> | <span class="has-text-danger">${loc(`outer_shipyard_weapon_${ship.weapon}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_power_${ship.power}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_armor_${ship.armor}`)}</span> | <span class="has-text-warning">${loc(shipPartKey('sensor',ship.sensor))}</span></div>`);
            let row2 = $(`<div class="row2"></div>`);
            let row3 = $(`<div class="row3"></div>`);
            let row4 = $(`<div class="location">${dispatch}</div>`);

            row2.append(`<span class="shipStat"><span class="has-text-warning">${loc(`crew`)}</span> <span class="pad" v-html="crewText(${i})"></span></span><wbr>`);
            row2.append(`<span class="shipStat" v-show="!isUnarmed(${i})"><span class="has-text-warning">${loc(`firepower`)}</span> <span class="pad" v-html="fireText(${i})"></span></span><wbr>`);
            row2.append(`<span class="shipStat"><span class="has-text-warning">${loc(`outer_shipyard_sensors`)}</span> <span class="pad" v-html="sensorText(${i})"></span></span><wbr>`);
            row2.append(`<span class="shipStat"><span class="has-text-warning">${loc(`speed`)}</span> <span class="pad" v-bind:class="{ 'has-text-info': speedRelay(${i}) }" v-html="speedText(${i})"></span></span><wbr>`);
            row2.append(`<span class="shipStat"><span class="has-text-warning">${loc(`outer_shipyard_fuel`)}</span> <span class="pad" v-bind:class="{ 'has-text-danger': fuelShort(${i}) }" v-html="fuelText(${i})"></span></span><wbr>`);
            row2.append(`<button class="button is-small is-info shipRefuel" v-show="manualRefuelShow(${i})" @click="manualRefuel(${i})">${loc('outer_shipyard_refuel')}</button><wbr>`);
            row2.append(`<span class="shipStat" v-show="cargoText(${i})"><span class="has-text-warning">${loc('supply_freighter_load')}</span> <span class="pad" v-html="cargoText(${i})"></span></span><wbr>`);
            row2.append(`<span class="shipStat" v-show="hullShow(${i})"><span class="has-text-warning">${loc(`outer_shipyard_hull`)}</span> <span class="pad" v-bind:class="hullDamage(${i})" v-html="hullText(${i})"></span></span><wbr>`);

            row3.append(`<span v-show="show(${i})" class="has-text-caution" v-html="dest(${i})"></span>`);
            row3.append(`<span v-show="retShow(${i})" class="shipReturn has-text-info"><span v-html="retText(${i})"></span> <a class="retCancel" @click="retCancel(${i})" role="button">${loc(`outer_shipyard_return_cancel`)}</a></span>`);
            row3.append(`<span v-show="patrolShow(${i})" class="shipPatrolTag has-text-info"><span v-html="patrolText(${i})"></span> <a class="patrolCancel" @click="patrolCancel(${i})" role="button">${loc(`outer_shipyard_patrol_stop`)}</a></span>`);

            desc.append(row1);
            desc.append(row2);
            desc.append(row3);
            desc.append(row4);
            list.append(desc);
        }
        else {
            let desc = $(`<div id="shipReg${i}" class="shipRow ship${i}${escort} compact"></div>`);
            let row1 = $(`<div class="row1"></div>`);
            let row3 = $(`<div class="row3"></div>`);
            let row4 = $(`<div class="location">${dispatch}</div>`);

            row1.append(`<span class="name has-text-caution">${ship.name}</span><span v-show="copyMode()"> | <a class="loadDesign" @click="loadDesign(${i})" role="button">${loc(`outer_shipyard_copy_design`)}</a> | <a class="copyBuild" @click="copyBuild(${i})" role="button">${loc(`outer_shipyard_copy_build`)}</a></span><span v-show="loadFleetShow(${i})"> | <a class="loadFleet" @click="loadFleet(${i})" role="button">${loc('outer_shipyard_fleet_template_load')}</a></span><a class="fleetFold" v-show="fleetFoldShow(${i})" @click="fleetFold(${i})" role="button" :aria-expanded="fleetFolded(${i}) ? 'false' : 'true'" :aria-label="fleetFoldLabel(${i})"><span class="groupArrow" v-html="fleetArrow(${i})"></span></a><span v-show="fleetTag(${i})" class="flagship" v-html="fleetTag(${i})"></span><span v-show="fleetShow(${i})"> | <a class="fleetToggle" @click="fleetAction(${i})" role="button" v-html="fleetText(${i})"></a></span> | `);
            row1.append(`<span class="shipStat" v-show="!isUnarmed(${i})"><span class="has-text-warning">${loc(`firepower`)}</span> <span class="pad" v-html="fireText(${i})"></span></span><wbr>`);
            row1.append(`<span class="shipStat"><span class="has-text-warning">${loc(`outer_shipyard_sensors`)}</span> <span class="pad" v-html="sensorText(${i})"></span></span><wbr>`);
            row1.append(`<span class="shipStat"><span class="has-text-warning">${loc(`speed`)}</span> <span class="pad" v-bind:class="{ 'has-text-info': speedRelay(${i}) }" v-html="speedText(${i})"></span></span><wbr>`);
            row1.append(`<span class="shipStat"><span class="has-text-warning">${loc(`outer_shipyard_fuel`)}</span> <span class="pad" v-bind:class="{ 'has-text-danger': fuelShort(${i}) }" v-html="fuelText(${i})"></span></span><wbr>`);
            row1.append(`<button class="button is-small is-info shipRefuel" v-show="manualRefuelShow(${i})" @click="manualRefuel(${i})">${loc('outer_shipyard_refuel')}</button><wbr>`);
            row1.append(`<span class="shipStat" v-show="cargoText(${i})"><span class="has-text-warning">${loc('supply_freighter_load')}</span> <span class="pad" v-html="cargoText(${i})"></span></span><wbr>`);
            row1.append(`<span class="shipStat" v-show="hullShow(${i})"><span class="has-text-warning">${loc(`outer_shipyard_hull`)}</span> <span class="pad" v-bind:class="hullDamage(${i})" v-html="hullText(${i})"></span></span><wbr>`);

            row3.append(`<span v-show="show(${i})" class="has-text-caution" v-html="dest(${i})"></span>`);
            row3.append(`<span v-show="retShow(${i})" class="shipReturn has-text-info"><span v-html="retText(${i})"></span> <a class="retCancel" @click="retCancel(${i})" role="button">${loc(`outer_shipyard_return_cancel`)}</a></span>`);
            row3.append(`<span v-show="patrolShow(${i})" class="shipPatrolTag has-text-info"><span v-html="patrolText(${i})"></span> <a class="patrolCancel" @click="patrolCancel(${i})" role="button">${loc(`outer_shipyard_patrol_stop`)}</a></span>`);

            desc.append(row1);
            desc.append(row3);
            desc.append(row4);
            list.append(desc);
        }

        vBind({
            el: `#shipReg${i}`,
            data: global.space.shipyard.ships[i],
            methods: {
                scrap(id){
                    let s = global.space.shipyard.ships[id];
                    if (this.scrapAllowed(id)){
                        // A flagship being broken up takes its fleet apart with it.
                        leaveFleet(s);
                        global.space.shipyard.ships.splice(id,1);
                        drawShips();
                        updateCosts();
                    }
                },
                // Show refit only for eligible docked ships in detailed rows.
                refitShow(id){
                    return refitAllowed(global.space.shipyard.ships[id]);
                },
                refitAction(id){
                    if (!this.refitShow(id)){ return; }
                    let modal = this.$buefy.modal.open({
                        hasModalCard: false,
                        content: '<div id="modalBox" class="modalBox"></div>'
                    });
                    modalCloseButton();

                    let checkExist = setInterval(function(){
                        if ($('#modalBox').length > 0) {
                            clearInterval(checkExist);
                            shipRefitModal(id, modal);
                        }
                    }, 50);
                },
                // Whether the yard's copy controls are switched on, which is what puts the copy
                // links on every row rather than leaving them there permanently.
                copyMode(){
                    return global.space.shipyard['copy'] ? true : false;
                },
                // Copy a built ship's design back into the yard so a sister ship can be ordered without setting every dropdown
                // again.
                loadDesign(id){
                    let s = global.space.shipyard.ships[id];
                    if (!s){ return; }
                    let bp = global.space.shipyard.blueprint;
                    ['class','engine','weapon','armor','sensor','power'].forEach(function(part){
                        if (s[part] !== undefined){ bp[part] = s[part]; }
                    });
                    // A special the copied class cannot carry falls back exactly the way the class
                    // dropdown makes it fall back.
                    bp.special = s['special'] !== undefined ? s.special : shipDefaultSpecial(bp.class);
                    if (!shipSpecialAllowed(bp.special,bp.class)){ bp.special = shipDefaultSpecial(bp.class); }
                },
                // The same copy, plus a hull on the queue for it. The yard is loaded as well so the
                // design is sitting there to adjust if the next one wants to differ.
                copyBuild(id){
                    let s = global.space.shipyard.ships[id];
                    if (!s){ return; }
                    this.loadDesign(id);
                    if (queueTPShip(copyShipDesign(s))){
                        buildQueue();
                    }
                },
                // Show Load Fleet for a flagship while Copy Controls are enabled.
                loadFleetShow(id){
                    let ship = global.space.shipyard.ships[id];
                    return global.space.shipyard.copy && ship && ship.flag && ship.fid ? true : false;
                },
                loadFleet(id){
                    let flagship = global.space.shipyard.ships[id];
                    if (!flagship || !flagship.flag || !flagship.fid){ return; }
                    let members = fleetMembers(flagship.fid);
                    let template = fleetTemplate();
                    template.splice(0, template.length, copyShipDesign(flagship), ...members.filter(ship => ship !== flagship).map(copyShipDesign));
                    openFleetDesigner(this.$buefy.modal, copyShipDesign(flagship));
                },
                // Only at a yard, and only while actually docked there rather than crossing to it.
                scrapAllowed(id){
                    let s = global.space.shipyard.ships[id];
                    return s && shipyardLocations.includes(shipDockedAt(s)) ? true : false;
                },
                // Which fleet a ship belongs to, shown against its name.
                fleetTag(id){
                    let s = global.space.shipyard.ships[id];
                    if (s && s.class === 'freighter' && !s.fid){ return `<span class="has-text-info">📦 ${loc('outer_shipyard_class_freighter')}</span>`; }
                    if (!global.tech['syard_fleet'] || !s || !s.fid){ return ``; }
                    let flag = shipFlagship(s);
                    if (!flag){ return ``; }
                    let mark = `<span class="flag has-text-caution" title="${loc('outer_shipyard_fleet_flagship')}" aria-label="${loc('outer_shipyard_fleet_flagship')}">⚑</span>`;
                    if (!s.flag){ return `${mark} ${flag.name}`; }
                    let cargo = fleetMembers(s.fid).some(member => member.class === 'freighter') ? ` <span class="has-text-info">📦</span>` : ``;
                    let tag = `${mark} ${loc('outer_shipyard_fleet_command',[fleetCommandUsed(s.fid),fleetCommandRating(s)])}${cargo}`;
                    // Folded, the ships underneath have no rows of their own, so the flagship says how
                    // many are down there rather than leaving them unaccounted for.
                    let hidden = shipyardView().ffold[s.fid] ? fleetEscortCount(s.fid) : 0;
                    return hidden > 0 ? `${tag} <span class="has-text-info">${loc('outer_shipyard_fleet_hidden',[hidden])}</span>` : tag;
                },
                // A fleet folds away like a location does, so only a flagship with something under it
                // carries the toggle.
                fleetFoldShow(id){
                    let s = global.space.shipyard.ships[id];
                    return global.tech['syard_fleet'] && s && s.flag && fleetEscortCount(s.fid) > 0 ? true : false;
                },
                fleetFolded(id){
                    let s = global.space.shipyard.ships[id];
                    return s && s.fid && shipyardView().ffold[s.fid] ? true : false;
                },
                fleetArrow(id){
                    return this.fleetFolded(id) ? `&#9656;` : `&#9662;`;
                },
                fleetFoldLabel(id){
                    let s = global.space.shipyard.ships[id];
                    return loc(this.fleetFolded(id) ? 'outer_shipyard_fleet_expand' : 'outer_shipyard_fleet_collapse',[s ? s.name : ``]);
                },
                fleetFold(id){
                    let s = global.space.shipyard.ships[id];
                    if (!s || !s.fid || !s.flag){ return; }
                    let ffold = shipyardView().ffold;
                    if (ffold[s.fid]){ delete ffold[s.fid]; }
                    else { ffold[s.fid] = true; }
                    drawShips();
                },
                // The link only appears when there is something it could actually do: leave a fleet, stand one down, or put this
                // ship into one.
                fleetShow(id){
                    let s = global.space.shipyard.ships[id];
                    if (!global.tech['syard_fleet'] || !s || shipMoving(s)){ return false; }
                    if (s.fid){ return true; }
                    // Freighters may escort an existing fleet but cannot create one. Keep their
                    // join dialog available so a docked freighter can see eligible flagships.
                    if (s.class === 'freighter'){ return true; }
                    return fleetsFor(s).length > 0 || fleetWorthForming(s);
                },
                fleetText(id){
                    let s = global.space.shipyard.ships[id];
                    if (!s){ return ``; }
                    if (s.flag){ return loc('outer_shipyard_fleet_disband'); }
                    return s.fid ? loc('outer_shipyard_fleet_leave') : loc('outer_shipyard_fleet_join');
                },
                fleetAction(id){
                    let s = global.space.shipyard.ships[id];
                    if (!global.tech['syard_fleet'] || !s || shipMoving(s)){ return; }
                    // Already flying with someone: the link takes it back out, and does so directly —
                    // there is nothing to choose between.
                    if (s.fid){
                        leaveFleet(s);
                        drawShips();
                        return;
                    }
                    // Otherwise it is a choice of who to serve under, so put it to the player.
                    let modal = this.$buefy.modal.open({
                        hasModalCard: false,
                        content: '<div id="modalBox" class="modalBox"></div>'
                    });
                    modalCloseButton();

                    let checkExist = setInterval(function(){
                        if ($('#modalBox').length > 0) {
                            clearInterval(checkExist);
                            fleetJoinModal(id, modal);
                        }
                    }, 50);
                },
                pickDest(id){
                    let modal = this.$buefy.modal.open({
                        hasModalCard: false,
                        content: '<div id="modalBox" class="modalBox"></div>'
                    });
                    modalCloseButton();

                    let checkExist = setInterval(function(){
                        if ($('#modalBox').length > 0) {
                            clearInterval(checkExist);
                            shipDispatchModal(id, modal);
                        }
                    }, 50);
                },
                // Hide firepower for unarmed hulls.
                isUnarmed(id){
                    let ship = global.space.shipyard.ships[id];
                    return ship && (ship.class === 'freighter' || ship.class === 'supply_ship');
                },
                cargoText(id){
                    let ship = global.space.shipyard.ships[id];
                    if (!ship || ship.class !== 'freighter'){ return ``; }
                    let contents = Object.entries(freightCargo(ship)).filter(([,amount]) => amount > 0)
                        .map(([res,amount]) => `${global.resource[res].name}: ${sizeApproximation(amount,0)}`).join(', ');
                    return `${sizeApproximation(freightLoad(ship),0)} / ${freightCapacity(ship)}${contents ? ` — ${contents}` : ``}`;
                },
                // Every readout below speaks for whatever rowGroup hands back: the one ship normally,
                // the whole fleet when a folded flagship is standing in for it.
                crewText(id){
                    return rowGroup(global.space.shipyard.ships[id]).reduce((t,s) => t + shipCrewSize(s),0);
                },
                fireText(id){
                    return rowGroup(global.space.shipyard.ships[id]).reduce((t,s) => t + shipAttackPower(s),0);
                },
                // A fleet aims as one body, so what it is worth is the best dish it carries.
                sensorText(id){
                    let group = rowGroup(global.space.shipyard.ships[id]);
                    // Math.max of nothing is -Infinity, and a row can outlive its ship by a frame.
                    if (group.length === 0){ return loc('outer_shipyard_sensor_range',[0]); }
                    return loc('outer_shipyard_sensor_range',[Math.max(...group.map(s => sensorRange(s) || 0))]);
                },
                // A fleet keeps pace with its slowest ship, which is what its trips are planned on.
                speedText(id){
                    let ship = global.space.shipyard.ships[id];
                    if (ship.speed)
                        return Math.round(ship.speed * starConstants.KM_S_PER_SHIPUNIT) + 'km/s'

                    let pace = fleetPace(rowGroup(ship));
                    if (!pace){ return `0km/s`; }
                    let speed = shipSpeed(pace) * starConstants.KM_S_PER_SHIPUNIT;

                    return Math.round(speed) + 'km/s';
                },
                // Highlight ships sped up by the mass relay
                speedRelay(id){
                    let ship = global.space.shipyard.ships[id];
                    if (ship.relayBoost)
                        return ship.relayBoost > 1;

                    let boost = massRelaySpeedBoost(ship);
                    return boost > 1;
                },
                fuelText(id){
                    return groupFuelText(rowGroup(global.space.shipyard.ships[id]));
                },
                // The worst hull in the group: a fleet leaves together or not at all, so that is the
                // one that decides whether it can.
                hullText(id){
                    let group = rowGroup(global.space.shipyard.ships[id]);
                    if (group.length === 0){ return `100%`; }
                    return `${100 - Math.max(...group.map(s => s.damage))}%`;
                },
                // An undamaged hull is the norm and says nothing worth the space, so the readout only
                // appears once a ship has taken damage.
                hullShow(id){
                    return rowGroup(global.space.shipyard.ships[id]).some(s => s.damage > 0);
                },
                // Colorize hull damage at threshold
                hullDamage(id){
                    let group = rowGroup(global.space.shipyard.ships[id]);
                    if (group.length === 0){ return ``; }
                    let damage = Math.max(...group.map(s => s.damage));
                    if (damage <= 10){
                        return `has-text-success`;
                    }
                    else if (damage >= 65){
                        return `has-text-danger`;
                    }
                    else if (group.some(s => !shipSpaceworthy(s))){
                        return `has-text-caution`;
                    }
                    return ``;
                },
                // A fleet is only as fuelled as its worst-off ship — one dry hull holds up the group.
                fuelShort(id){
                    return rowGroup(global.space.shipyard.ships[id]).some(s => !s.fueled);
                },
                manualRefuelShow(id){
                    return rowGroup(global.space.shipyard.ships[id]).some(s => canManuallyRefuel(s));
                },
                manualRefuel(id){
                    rowGroup(global.space.shipyard.ships[id]).forEach(s => manuallyRefuelShip(s));
                    drawShips();
                },
                dest(id){
                    let s = global.space.shipyard.ships[id];
                    let name = s.class === 'explorer' ? loc('tech_era_tauceti') : regionNames[shipDestination(s)];
                    return loc(`outer_shipyard_arrive`,[
                        name,
                        // (Total time) minus (time already traversed on current step)
                        shipMoving(s) ? Math.round(shipTripDays(s) - (legDays(shipLeg(s)) - shipLegLeft(s))) : 0
                    ]);
                },
                show(id){
                    return shipMoving(global.space.shipyard.ships[id]);
                },
                // A ship pulled out of the line for repairs remembers where it was posted. Say so, and
                // let the player call the arrangement off without having to re-order the ship by hand.
                retShow(id){
                    let s = global.space.shipyard.ships[id];
                    return s && s['ret'] ? true : false;
                },
                retText(id){
                    let s = global.space.shipyard.ships[id];
                    return s && s['ret'] ? loc('outer_shipyard_return',[regionNames[s.ret] || s.ret]) : '';
                },
                retCancel(id){
                    let s = global.space.shipyard.ships[id];
                    if (s && s['ret']){
                        delete s.ret;
                        // Calling off the return calls off the rejoin with it — the ship is staying put.
                        if (s['rfid']){ delete s.rfid; }
                        drawShips();
                    }
                },
                // Display and cancel active patrols from the fleet row.
                patrolShow(id){
                    return shipPatrol(global.space.shipyard.ships[id]) ? true : false;
                },
                patrolText(id){
                    let patrol = shipPatrol(global.space.shipyard.ships[id]);
                    return patrol ? loc('outer_shipyard_patrol_on',[patrol.stops.length]) : '';
                },
                patrolCancel(id){
                    stopPatrol(global.space.shipyard.ships[id]);
                }
            }
        });

    }
}

// The first Tau Ceti soldier building (marine barracks / womling rangers) re-enables the soldier
// options on the civics government tab, which are otherwise hidden once isolation is reached.
function tauEnableSoldiers(){
    if (!global.tech['tau_soldiers']){
        global.tech['tau_soldiers'] = 1;
        global.settings.showMil = true;
        if (!global.settings.msgFilters.combat.unlocked){
            global.settings.msgFilters.combat.unlocked = true;
            global.settings.msgFilters.combat.vis = true;
        }
        if (!global.civic.garrison.display){
            global.civic.garrison.display = true;
        }
        buildGarrison($('#garrison'),true);
        buildGarrison($('#c_garrison'),false);
    }
}

// Whether the syndicate is operating at all
export function syndicateActive(){
    if (global.tech['shadow'] && global.tech['shadow'] >= 5){ return false; }
    return !global.tech['isolation'] && global.tech['syndicate'] && global.race['truepath'] && global.space['syndicate'] ? true : false;
}

export function syndicate(region,extra){
    if (syndicateActive() && global.space.syndicate.hasOwnProperty(region)){
        let divisor = 1000;

        // A collapsed rival government is no longer keeping the syndicate off you, nor egging it on.
        let rival = 0;
        if (!rivalCollapsed()){
            if (global.civic.foreign.gov3.hstl < 10){
                rival = 250 - (25 * global.civic.foreign.gov3.hstl);
            }
            else if (global.civic.foreign.gov3.hstl > 60){
                rival = (-13 * (global.civic.foreign.gov3.hstl - 60));
            }
        }

        switch (region){
            case 'spc_home':
            case 'spc_moon':
            case 'spc_red':
            case 'spc_hell':
                divisor = 1250 + rival;
                break;
            case 'spc_gas':
            case 'spc_gas_moon':
            case 'spc_belt':
                divisor = 1020 + rival;
                break;
            case 'spc_titan':
            case 'spc_enceladus':
                divisor = actions.space[region].info.syndicate_cap();
                break;
            case 'spc_triton':
            case 'spc_makemake':
            case 'spc_eris':
                divisor = actions.space[region].info.syndicate_cap();
                break;
        }

        let piracy = global.space.syndicate[region];
        if (global.race['chicken']){
            piracy *= 1 + (traits.chicken.vars()[1] / 100);
            piracy = Math.round(piracy);
        }
        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.f){
            piracy *= 1 - (traits.ocular_power.vars()[1] / 500);
            piracy = Math.round(piracy);
        }
        let patrol = 0;
        let sensor = 0;
        let overkill = 0;
        if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
            global.space.shipyard.ships.forEach(function(ship){
                if (shipDockedAt(ship) === region && ship.fueled){
                    let rating = shipAttackPower(ship);
                    patrol += ship.damage > 0 ? Math.round(rating * (100 - ship.damage) / 100) : rating;
                    sensor += sensorRange(ship);
                }
            });

            if (region === 'spc_enceladus' && Math.min(support_on['operating_base'],p_on['operating_base']) > 0){
                let active = Math.min(support_on['operating_base'],p_on['operating_base']);
                patrol += hugeAdjust(active) * 50;
            }
            else if (region === 'spc_titan' && p_on['sam'] > 0){
                patrol += hugeAdjust(p_on['sam']) * 25;
            }
            else if (region === 'spc_triton' && p_on['fob'] > 0){
                patrol += 500;
                sensor += 10;
            }

            if (sensor > 100){
                sensor = Math.round((sensor - 100) / ((sensor - 100) + 200) * 100) + 100;
            }

            patrol = Math.round(patrol * ((sensor + 25) / 125));
            if (patrol > piracy){
                overkill = patrol - piracy;
            }
            piracy = piracy - patrol > 0 ? piracy - patrol : 0;
        }

        if (extra){
            return {
                p: 1 - +(piracy / divisor).toFixed(4),
                r: piracy,
                s: sensor,
                o: overkill,
            };
        }
        return 1 - +(piracy / divisor).toFixed(4);
    }

    if (extra){
        return { p: 1, r: 0, s: 0, o: 0 };
    }
    return 1;
}

// Return the sensor-range multiplier against a target.
export function sensorStealth(foe){
    const stealth = foe ? (foe.stealth || 1) : sWarfare.stealth;
    return stealth < 1 && improvedSensors() ? Math.max(stealth, sensorUpgrade.stealth) : stealth;
}

// Whether an enemy hull is currently detected, by anything of yours that can see it.
export function foeDetected(foe){
    if (!shipPosition(foe)){ return false; }
    return sensorContact(foe) || detectorContact(foe);
}

// Anything of yours with the point inside its sensor bubble. A hull built to be hard to see shrinks
// that bubble rather than hiding outright: `stealth` is what is left of a set's reach against it.
function sensorContact(foe){
    // Sector Command watches from Jupiter by the same rules as a ship parked there.
    const station = sectorCommandGuard('spc_gas');
    if (station && dist3(shipPosition(station), shipPosition(foe)) <= sensorRangeAU(station) * sensorStealth(foe)){ return true; }
    if (!global.space['shipyard'] || !Array.isArray(global.space.shipyard['ships'])){ return false; }
    for (let ship of global.space.shipyard.ships){
        const at = shipPosition(ship);
        if (!at){ continue; }
        if (dist3(at, shipPosition(foe)) <= sensorRangeAU(ship) * sensorStealth(foe)){ return true; }
    }
    return false;
}

// --- Sector Command ----------------------------------------------------------------------------------
// Combat, sensor, and repair helpers for the Jupiter defense platform.

// Return the completed structure, or false.
export function sectorCommandBuilt(){
    const command = global.space['sector_command'];
    if (!command || !(command.count >= sWarfare.commandSegments)){ return false; }
    if (typeof command.damage !== 'number' || !Number.isFinite(command.damage)){ command.damage = 0; }
    return command;
}

// Whether it is complete, powered, and not knocked out.
export function sectorCommandActive(){
    const command = sectorCommandBuilt();
    return command && !command.down && p_on['sector_command'] > 0 ? true : false;
}

// Return Sector Command as a defending ship at one of its supported locations.
function sectorCommandGuard(where){
    if (where !== 'spc_gas' && where !== 'spc_gas_moon'){ return false; }
    if (!sectorCommandActive()){ return false; }
    const command = sectorCommandBuilt();
    const hull = Object.assign({}, sWarfare.commandFit, {
        name: loc('space_gas_sector_command_title'),
        station: true,
        fire: where === 'spc_gas' ? 1 : sWarfare.commandMoonFire,
        ...dockedFields('spc_gas', genXYZcoord('spc_gas'))
    });
    Object.defineProperty(hull, 'damage', {
        get(){ return command.damage; },
        set(v){ command.damage = v; },
        enumerable: true
    });
    return hull;
}

// Knocked out in combat: it stays offline until fully repaired.
function sectorCommandDown(where){
    const command = sectorCommandBuilt();
    if (!command || command.down){ return; }
    command.damage = 100;
    command.down = true;
    messageQueue(loc('space_gas_sector_command_lost',[loc('space_gas_sector_command_title'),regionName(where)]),'danger',false,['combat']);
}

// Daily repairs while powered.
function sectorCommandDay(){
    const command = sectorCommandBuilt();
    if (!command || command.damage <= 0 || !(p_on['sector_command'] > 0)){ return; }
    command.damage = Math.max(0, command.damage - sWarfare.commandRepair);
    if (command.down && command.damage === 0){
        command.down = false;
        messageQueue(loc('space_gas_sector_command_restored',[loc('space_gas_sector_command_title'),planetName().gas]),'success',false,['combat']);
    }
}

// Construction finished: patrols can now be ordered.
export function sectorCommandComplete(){
    if (!global.tech['syard_fleet'] || global.tech.syard_fleet < 4){ global.tech['syard_fleet'] = 4; }
    messageQueue(loc('space_gas_sector_command_complete'),'warning',false,['progress','combat']);
    drawTech();
    drawShipYard();
}

// --- Detectors -----------------------------------------------------------------------------------
// Ground detector structures and detection helpers.

// Detector site definitions and map anchors.
const detectorSiteData = {
    city:      { region: 'city',  key: 'detector',       map: 'spc_home',  world: 'home' },
    spc_red:   { region: 'space', key: 'detector_red',   map: 'spc_red',   world: 'red' },
    spc_hell:  { region: 'space', key: 'detector_hell',  map: 'spc_hell',  world: 'hell' },
    spc_dwarf: { region: 'space', key: 'detector_dwarf', map: 'spc_dwarf', world: 'dwarf' }
};

// Return detector sites that remain available after orbit decay.
export function detectorSites(){
    const sites = { ...detectorSiteData };
    if (capitalGone()){ delete sites.city; }
    return sites;
}

// Return detector segments required for the current capital state.
export function detectorSegments(){
    return capitalGone() ? sWarfare.detectorSegmentsLost : sWarfare.detectorSegments;
}

// Return whether a site's array is fully assembled.
function detectorBuilt(at){
    const struct = global[at.region] ? global[at.region][at.key] : false;
    return struct && struct.count >= detectorSegments() ? true : false;
}

// Return whether a completed detector is powered.
function detectorOn(at){
    return detectorBuilt(at) && p_on[at.key] > 0 ? true : false;
}

// A network requires every available detector site; power does not affect completion.
export function detectorNetwork(){
    const sites = detectorSites();
    return Object.keys(sites).every(site => detectorBuilt(sites[site]));
}

// Detection radius against a stealth hull. Halved, until Stealth Detection teaches the arrays what
// a corsair looks like and they read one as far as they read anything else.
export function detectorStealthAU(){
    return global.tech['shadow'] && global.tech.shadow >= 10 ? sWarfare.detectorRange : sWarfare.detectorStealthRange;
}

// Detection radius against one hull.
function detectorReach(ship, site){
    const reach = (ship.stealth || 1) < 1 ? detectorStealthAU() : sWarfare.detectorRange;
    return site ? reach * infiltratorFactor(site.region === 'city' ? 'city' : site.map, site.key) : reach;
}

// Detect hulls within the active detector radius.
function detectorContact(foe){
    const sites = detectorSites();
    for (const site of Object.keys(sites)){
        if (!detectorOn(sites[site])){ continue; }
        if (dist3(genXYZcoord(sites[site].map), shipPosition(foe)) <= detectorReach(foe,sites[site])){ return true; }
    }
    return false;
}

// Return whether one active detector reaches both the fleet and corsair.
function detectorCue(at, foe){
    const sites = detectorSites();
    for (const site of Object.keys(sites)){
        if (!detectorOn(sites[site])){ continue; }
        const post = genXYZcoord(sites[site].map);
        if (dist3(post, shipPosition(foe)) <= detectorReach(foe,sites[site]) && dist3(post, at) <= sWarfare.detectorRange){ return true; }
    }
    return false;
}

// Build the Detector action for one site.
export function detectorTemplate(site){
    const at = detectorSiteData[site];
    const region = at.region, key = at.key;
    // Completed detector segments.
    const built = function(){ return global[region].hasOwnProperty(key) ? global[region][key].count : 0; };
    const priced = function(r){ return ((r.offset || 0) + built()) < detectorSegments(); };
    return {
        id: `${region}-${key}`,
        title(){ return loc('detector_title',[planetName()[at.world]]); },
        desc(wiki){
            let head = `<div>${loc('detector_desc',[planetName()[at.world]])}</div>`;
            if (built() < detectorSegments() || wiki){
                return head + `<div class="has-text-special">${loc('requires_segments',[detectorSegments()])}</div>`;
            }
            return head + `<div class="has-text-special">${loc('requires_power')}</div>`;
        },
        type: 'megaproject',
        category: 'military',
        reqs: { planet_defense: 1 },
        condition(){ return site !== 'city' || !capitalGone(); },
        path: ['truepath'],
        queue_size: 5,
        queue_complete(){ return detectorSegments() - built(); },
        cost: {
            Money(r={}){ return priced(r) ? 30000000 : 0; },
            Adamantite(r={}){ return priced(r) ? 1200000 : 0; },
            Stanene(r={}){ return priced(r) ? 1800000 : 0; },
            Bolognium(r={}){ return priced(r) ? 750000 : 0; },
            Elerium(r={}){ return priced(r) ? 350 : 0; }
        },
        effect(wiki){
            let count = (wiki?.count ?? 0) + built();
            let desc = `<div>${loc('detector_effect',[sWarfare.detectorRange,planetName()[at.world],detectorStealthAU()])}</div>`;
            if (count < detectorSegments()){
                return desc + `<div class="has-text-special">${loc('space_dwarf_collider_effect2',[detectorSegments() - count])}</div>`;
            }
            return desc + `<div class="has-text-caution">${loc('minus_power',[this.powered()])}</div>`;
        },
        powered(){ return powerCostMod(10); },
        // Enable power controls after all segments are complete.
        switchable(){ return built() >= detectorSegments(); },
        on_cap(){ return built() >= detectorSegments() ? 1 : 0; },
        action(){
            if (built() >= detectorSegments()){ return false; }
            if (payCosts(this)){
                incrementStruct(this);
                if (global[region][key].count >= detectorSegments()){
                    global[region][key].on = 1;
                    if (region === 'city'){ drawCity(); }
                    else { renderSpace(); }
                    clearPopper();
                }
                return true;
            }
            return false;
        },
        struct(){
            return {
                d: { count: 0, on: 0 },
                p: [key,region]
            };
        }
    };
}

export function tritonWar(){
    if (global.space['fob']){
        global.civic.garrison.wounded = Math.max(0, Number(global.civic.garrison.wounded) || 0);
        if (global.space.fob.enemy <= 1000){
            let upper = global.tech['outer'] && global.tech.outer >= 4 ? 125 : 100;
            global.space.fob.enemy += Math.rand(25,upper);
        }

        let wound_cap = Math.ceil(jobScale(global.space.fob.enemy) / 5);

        // Count wounded units deployed outside the home garrison.
        let wounded = Math.max(0, global.civic.garrison.wounded - Math.max(0,garrisonSize()));
        let defense = armyRating(global.space.fob.troops,'army',wounded);

        let died = Math.min(global.civic.garrison.wounded, Math.rand(0,wounded + 1));
        soldierDeath(died);
        global.civic.garrison.wounded = Math.max(0, global.civic.garrison.wounded - died);

        let kills = Math.min(Math.rand(0,defense),global.space.fob.enemy);
        global.space.fob.enemy -= kills;
        if (global.space.fob.enemy < 0){
            global.space.fob.enemy = 0; 
        }

        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p){
            global.race.ocularPowerConfig.ds += Math.round(kills * traits.ocular_power.vars()[1]);
        }

        let hurt = Math.rand(0,global.space.fob.troops + 1);
        if (hurt > wound_cap){ hurt = wound_cap; }
        if (global.race['armored']){ hurt -= jobScale(1); }
        if (global.race['scales']){ hurt -= jobScale(1); }
        if (global.tech['armor']){ hurt -= jobScale(global.tech['armor']); }
        if (hurt < 0){ hurt = 0; }

        if (global.race['revive'] && died > 0){
            let revive = Math.round(Math.rand(0,died + 1));
            global.civic.garrison.workers += revive;
        }

        global.civic.garrison.wounded += hurt;
        let woundMax = Math.max(0,garrisonSize(false,{nofob: true}));
        if (global.civic.garrison.wounded > woundMax){
            global.civic.garrison.wounded = woundMax;
        }

        {
            let wounded = Math.max(0, global.civic.garrison.wounded - Math.max(0,garrisonSize()));
            let danger = global.space.fob.enemy - armyRating(global.space.fob.troops,'army',wounded);
            if (danger <= 0 && global.space.crashed_ship.count < 100){
                global.space.crashed_ship.count++;
            }
            else if (danger > 0 && global.space.crashed_ship.count > 0){
                global.space.crashed_ship.count--;
            }
            if (global.space.crashed_ship.count === 100){
                global.resource.Cipher.display = true;
            }
        }
    }
}

export function erisWar(){
    if (global.space['digsite']){
        if (global.space.digsite.enemy <= 10000){
            let upper = 250;
            global.space.digsite.enemy += Math.rand(25,upper);
        }

        let offense = armyRating(hugeAdjust(support_on['shock_trooper']),'army',0);
        if (support_on['tank']){
            offense += hugeAdjust(support_on['tank']) * 100;
        }
        offense *= syndicate('spc_eris');

        global.space.digsite.enemy -= Math.rand(0,offense);
        if (global.space.digsite.enemy < 0){ global.space.digsite.enemy = 0; }
        else if (global.space.digsite.enemy > 10000){ global.space.digsite.enemy = 10000; }

        global.space.digsite.count = Math.floor(100 - global.space.digsite.enemy / 100);
    }
}

// Which star system a location belongs to.
export function tempCoord(locationName){
    let temps = global.race['tempCoordinates'];
    return temps && typeof locationName === 'string' && temps.hasOwnProperty(locationName) ? temps[locationName] : false;
}

// A temp point comes in three shapes, and `b` is what tells them apart: no `b`                  a fixed point in
// deep space — a signal heard once, and it stays put `b` alone               pinned to that body, exactly where it

// The parent body a point rides, or false. A parent that is itself a temp point is refused, since
// resolving it would recurse.
export function tempParent(entry){
    return entry && entry.b && !tempCoord(entry.b) && starData[entry.b] ? entry.b : false;
}

// Where the point sits relative to its parent, `days` from now. Pinned points sit on it exactly.
export function tempOffset(entry, days){
    if (!(entry.r > 0)){ return { x: 0, y: 0, z: entry.zo || 0 }; }
    let deg = (entry.p || 0) + (entry.o > 0 ? days * (360 / entry.o) : 0);
    let rad = deg * (Math.PI / 180);
    return { x: Math.cos(rad) * entry.r, y: Math.sin(rad) * entry.r, z: entry.zo || 0 };
}

// A period that reads right for something drifting at `au` from its primary: the same third-power law
// the real thing follows, so a far derelict crawls and a near one comes round inside a few years.
function driftPeriod(au){
    return Math.max(Math.round(365 * Math.pow(Math.max(au, 0.05), 1.5)), 1);
}

// Set a temp point adrift around `parent`, reading its radius, height and angle off a position it is
// already standing at. Used both when a point is first placed and when an older fixed one is adopted.
function setTempOrbit(entry, parent, pos){
    let base = genXYZcoord(parent);
    let dx = pos.x - base.x, dy = pos.y - base.y;
    entry.b = parent;
    entry.r = Math.hypot(dx, dy);
    entry.zo = pos.z - base.z;
    entry.p = ((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360;
    entry.o = driftPeriod(entry.r);
    return entry;
}

// A temp point placed adrift around a body, ready to drop into global.race.tempCoordinates.
export function driftingPoint(fields, parent, pos){
    return setTempOrbit(Object.assign({ a: true, s: parent, x: pos.x, y: pos.y, z: pos.z }, fields), parent, pos);
}

// Once a day: carry every orbiting point round, and adopt any derelict signal still held as a fixed point from
// before they drifted.
export function moveTempCoordinates(days = 0.2){
    if (!global.race['tempCoordinates']){ return; }
    Object.keys(global.race.tempCoordinates).forEach(function(key){
        let t = global.race.tempCoordinates[key];
        if (!t){ return; }
        if (!t.b && key.startsWith('beacon')){ setTempOrbit(t, 'spc_sun', { x: t.x, y: t.y, z: t.z }); }
        if (t.o > 0){
            let p = ((((t.p || 0) + 360 * days / t.o) % 360) + 360) % 360;
            p = Math.round(p * 1e6) / 1e6;
            t.p = p >= 360 ? 0 : p;
        }
        // Keep the fallback position current, so anything reading x/y/z directly is not left behind.
        if (tempParent(t)){
            let now = genXYZcoord(key);
            t.x = now.x; t.y = now.y; t.z = now.z;
        }
    });
}

// The system a temp point belongs to.
export function tempSystem(entry){
    // A point riding a body belongs to whatever system that body does, whatever `s` was recorded as.
    let parent = tempParent(entry);
    if (parent){
        if (starData[parent].startype){ return parent === 'spc_sun' ? 'sun' : parent; }
        return starData[parent].star ? starData[parent].star : 'sun';
    }
    let body = entry.s ? starData[entry.s] : false;
    if (!body || entry.s === 'spc_sun'){ return 'sun'; }
    if (body.star){ return body.star; }
    return body.startype ? entry.s : 'sun';
}

export function tpStorageMultiplier(type,heavy,wiki){
    let multiplier = 1;
    if (global.race['pack_rat']){
        multiplier *= 1 + (traits.pack_rat.vars()[1] / 100);
    }
    if (global.stats.achieve['blackhole']){
        multiplier *= 1 + global.stats.achieve.blackhole.l * 0.05;
    }
    if (global.tech['world_control']){
        multiplier *= 3;
    }
    switch (type){
        case 'storehouse':
        {
            let titan_spaceport_on = wiki ? (global.space?.titan_spaceport?.on ?? 0) : p_on['titan_spaceport'];
            if (titan_spaceport_on){
                multiplier *= 1 + hugeAdjust(titan_spaceport_on * 0.25);
            }
            if (heavy && global.tech['shelving']){
                multiplier *= 2;
            }
            if (global.tech['shelving'] && global.tech.shelving >= 3){
                multiplier *= 1.5;
            }
        }
        case 'repository':
        {
            if (global.tech['isolation']){
                multiplier *= 3;
                if (global.tech['tp_depot']){
                    multiplier *= 1 + (global.tech['tp_depot'] / 20);
                }
            }
        }
        break;
        case 'warehouse':
        {
            if (global.underground['storage_space_perk']){
                multiplier *= 1 + (0.08 * global.underground['storage_space_perk'].count);
            }
        }
    }
    return multiplier;
}

export function jumpGateShutdown(){
    let inactive = { city: {}, space: {}, ships: []};
    inactive.ships = [...global.space.shipyard.ships];
    global.space.shipyard.ships = [];

    global.settings.spaceTabs = 6;
    global.settings.showSpace = false;
    global.settings.showOuter = false
    global.settings.showCity = false;
    global.settings.showShipYard = false;
    if (global.settings.govTabs === 5){
        global.settings.govTabs = 0;
    }

    clearShipDrag();
    refundUnderground();
    clearElement($('#shipList'));
    
    Object.keys(actions.city).forEach(function (k){
        if (global.city.hasOwnProperty(k) && global.city[k].hasOwnProperty('count')){
            if (global.race['hooved']){
                if (actions.city[k].cost?.hasOwnProperty('Horseshoe')){
                    global.race['shoecnt'] -= actions.city[k].cost.Horseshoe() * global.city[k].count;
                }
            }
            inactive.city[k] = {c: global.city[k].count};
            global.city[k].count = 0;
            if (global.city[k].hasOwnProperty('on')){
                inactive.city[k]['o'] = global.city[k].on;
                global.city[k].on = 0;
            }
        }
    });

    [
        'spc_home','spc_moon','spc_red','spc_hell','spc_sun','spc_gas','spc_gas_moon','spc_belt',
        'spc_dwarf','spc_titan','spc_enceladus','spc_triton','spc_makemake','spc_eris'
    ].forEach(function(sector){
        Object.keys(actions.space[sector]).forEach(function (k){
            if (global.space.hasOwnProperty(k) && global.space[k].hasOwnProperty('count')){
                if (global.race['hooved']){
                    if (actions.space[sector][k].cost?.hasOwnProperty('Horseshoe')){
                        global.race['shoecnt'] -= actions.space[sector][k].cost.Horseshoe() * global.space[k].count;
                    }
                }
                inactive.space[k] = {c: global.space[k].count};
                global.space[k].count = 0;
                if (global.space[k].hasOwnProperty('on')){
                    inactive.space[k]['o'] = global.space[k].on;
                    global.space[k].on = 0;
                }
            }
        });
    });

    if (global.race['hooved'] && global.race['shoecnt'] < 5){
        global.race.shoecnt = 5;
    }
    if (global.resource.Zen.display){
        global.resource.Zen.display = false;
    }
    if (global.resource.Slave.display){
        global.resource.Slave.display = false;
        global.resource.Slave.amount = 0;
        removeTask('slave');
    }
    if (global.race['deconstructor']){
        nf_resources.forEach(function (res){
            global.city.nanite_factory[res] = 0;
        });
    }
    Object.keys(global.resource).forEach(function (res){
        if (global.resource[res].hasOwnProperty('trade')){
            global.resource[res].trade = 0;
        }
    });

    Object.keys(job_data).forEach(function (job){
        if (!['professor','scientist','pit_miner','cement_worker','craftsman'].includes(job)){
            global.civic[job].workers = 0;
            global.civic[job].assigned = 0;
        }
    });

    ['forager','farmer','lumberjack','quarry_worker','miner','coal_miner','priest','colonist','titan_colonist','space_miner'].forEach(function (job){
        global.civic[job].display = false;
    });

    if (global.civic.hunter.display){
        global.civic.d_job = 'hunter';
    }
    else {
        global.civic.d_job = 'unemployed';
    }

    if (global.arpa['sequence']){
        global.arpa.sequence.on = false;
        global.arpa.sequence.boost = false;
    }

    for (let building of Object.values(global.race.purgatory.city)){
        if (building.hasOwnProperty('count')){
            building.count = 0;
        }
        if (building.hasOwnProperty('on')){
            building.on = 0;
        }
    }
    for (let building of Object.values(global.race.purgatory.space)){
        if (building.hasOwnProperty('count')){
            building.count = 0;
        }
        if (building.hasOwnProperty('on')){
            building.on = 0;
        }
    }
    if (global.queue.hasOwnProperty('queue')){
        for (let i = global.queue.queue.length-1; i >= 0; i--){
            let item = global.queue.queue[i];
            if (item.action === 'city' || item.action === 'space' || item.action === 'starDock'){
                global.queue.queue.splice(i,1);
            }
        }
    }

    if (global.tech['magic'] && global.tech.magic >= 2){
        global.tauceti['pylon'] = { count: 0 };
        cancelRituals();
    }

    initStruct(tauCetiModules.tau_home.tauceti_casino);
    initStruct(tauCetiModules.tau_home.tau_housing);
    
    let pop = support_on['colony'] * tauCetiModules.tau_home.colony.citizens();
    if (global.resource[global.race.species].amount > pop){ global.resource[global.race.species].amount = pop; }

    removeTask('spy');
    removeTask('spyop');
    removeTask('combo_spy');
    defineGovernor();

    clearElement($(`#infoTimer`));
    global.race['inactive'] = inactive;
}

export function jumpGateRestart(){
    messageQueue(loc('tech_jump_jump_gate_msg'),'info',false,['progress']);
    let regions = {
        space: [
            'home','moon','red','hell','gas','gas_moon','belt','dwarf',
            'titan','enceladus','triton','eris','makemake'
        ]
    };
    Object.keys(regions).forEach(function(r){
        regions[r].forEach(function(v){
            if (global.settings[r].hasOwnProperty(v)){
                global.settings[r][v] = false;
            }
        });
    });

    Object.keys(global.race.inactive.space).forEach(function (k){
        if (global.space.hasOwnProperty(k) && global.space[k].hasOwnProperty('count')){
            global.space[k]['razed'] = global.race.inactive.space[k].c;
        }
    });

    global.space.jump_gate.count = 100;
    global.space.jump_gate.razed = 0;

    // Reserve the derelict the spc_sun "Salvage" building offers, so the choice (and the name on the button) stays
    // fixed until it is salvaged.
    pinSalvage('spc_sun','corvette');

    // global.settings.showSpace = true; global.settings.civTabs = 1; global.settings.spaceTabs = 1; renderSpace();
}

export function loneSurvivor(){
    if (global.race['lone_survivor']){
        global.tech['alloy'] = 1;
        global.tech['alumina'] = 2;
        global.tech['asteroid'] = 7;
        global.tech['banking'] = 11;
        global.tech['biotech'] = 1;
        global.tech['boot_camp'] = 2;
        global.tech['container'] = 7;
        global.tech['copper'] = 1;
        global.tech['currency'] = 6;
        global.tech['disease'] = 2;
        global.tech['drone'] = 1;
        global.tech['elerium'] = 2;
        global.tech['explosives'] = 3;
        global.tech['factory'] = 3;
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
        global.tech['high_tech'] = 13;
        global.tech['home_safe'] = 2;
        global.tech['housing'] = 3;
        global.tech['housing_reduction'] = 3;
        global.tech['makemake'] = 2;
        global.tech['launch_facility'] = 1;
        global.tech['luna'] = 2;
        global.tech['m_smelting'] = 2;
        global.tech['marines'] = 2;
        global.tech['mars'] = 5;
        global.tech['mass'] = 1;
        global.tech['medic'] = 3;
        global.tech['military'] = 8;
        global.tech['mine_conveyor'] = 1;
        global.tech['mining'] = 4;
        global.tech['monument'] = 1;
        global.tech['nano'] = 1;
        global.tech['oil'] = 7;
        global.tech['outer'] = 8;
        global.tech['pickaxe'] = 5;
        global.tech['polymer'] = 2;
        global.tech['primitive'] = 3;
        global.tech['q_factory'] = 1;
        global.tech['quantium'] = 1;
        global.tech['queue'] = 3;
        global.tech['r_queue'] = 1;
        global.tech['reproduction'] = 1;
        global.tech['rival'] = 1;
        global.tech['satellite'] = 1;
        global.tech['science'] = 9;
        global.tech['shelving'] = 3;
        global.tech['shipyard'] = 1;
        global.tech['smelting'] = 6;
        global.tech['solar'] = 5;
        global.tech['space'] = 6;
        global.tech['space_explore'] = 4;
        global.tech['space_housing'] = 1;
        global.tech['spy'] = 5;
        global.tech['stanene'] = 1;
        global.tech['steel_container'] = 6;
        global.tech['storage'] = 5;
        global.tech['swarm'] = 6;
        global.tech['syard_armor'] = 3;
        global.tech['syard_class'] = 6;
        global.tech['syard_engine'] = 5;
        global.tech['syard_power'] = 5;
        global.tech['syard_sensor'] = 4;
        global.tech['syard_weapon'] = 6;
        global.tech['syndicate'] = 0;
        global.tech['synthetic_fur'] = 1;
        global.tech['tau_home'] = 6;
        global.tech['tauceti'] = 4;
        global.tech['theology'] = 2;
        global.tech['titan'] = 9;
        global.tech['titan_ai_core'] = 3;
        global.tech['titan_power'] = 1;
        global.tech['titanium'] = 3;
        global.tech['trade'] = 3;
        global.tech['unify'] = 2;
        global.tech['uranium'] = 4;
        global.tech['v_train'] = 1;
        global.tech['vault'] = 4;
        global.tech['wharf'] = 1;
        global.tech['world_control'] = 1;
        global.tech['wsc'] = 0;

        // Note: Joyless cannot be completed in Lone Survivor, and there is no reward for trying.
        if (!global.race['joyless']){
            global.tech['theatre'] = 3;
            global.tech['broadcast'] = 2;
        }

        if (!global.race['flier']){
            global.tech['cement'] = 5;
            global.resource.Cement.display = true;
        }

        if (global.race.universe === 'magic'){
            global.tech['gov_mage'] = 1;
            global.tech['magic'] = 4;
            global.tech['conjuring'] = 2;
            global.resource.Mana.display = true;
            global.resource.Crystal.display = true;
            global.civic.crystal_miner.display = true;
            global.tauceti['pylon'] = { count: 0 };
            setupRituals(true);
        }
        if(global.race.universe === 'evil'){
            global.tech['reclaimer'] = 1;
        }

        global.settings.showSpace = false;
        global.settings.showTau = true;
        global.settings.tau.home = true;

        global.settings.showCity = false;
        global.settings.showIndustry = true;
        global.settings.showPowerGrid = true;
        global.settings.showResearch = true;
        global.settings.showCivic = true;
        global.settings.showResources = true;
        global.settings.showMarket = true;
        global.settings.showStorage = true;
        global.settings.civTabs = 1;
        global.settings.spaceTabs = 6;
        global.settings.showGenetics = true;
        global.settings.arpa.physics = true;
        global.settings.arpa.genetics = true

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

        global.resource.Water.display = true;
        global.resource.Neutronium.display = true;
        global.resource.Adamantite.display = true;
        global.resource.Elerium.display = true;
        global.resource.Nano_Tube.display = true;
        global.resource.Graphene.display = true;
        global.resource.Stanene.display = true;
        global.resource.Orichalcum.display = true;
        global.resource.Bolognium.display = true;
        global.resource.Unobtainium.display = true;

        global.resource.Brick.display = true;
        global.resource.Wrought_Iron.display = true;
        global.resource.Sheet_Metal.display = true;
        global.resource.Mythril.display = true;
        global.resource.Quantium.display = true;
        global.resource.Cipher.display = true;

        if (!global.race['kindling_kindred'] && !global.race['smoldering']){
            global.civic.lumberjack.display = true;
            global.resource.Lumber.display = true;
            global.resource.Plywood.display = true;
            global.resource.Lumber.max = 10000000;
            global.resource.Lumber.amount = 10000000;
            global.resource.Plywood.amount = 2500000;
            global.resource.Lumber.crates = 25;
            global.resource.Lumber.containers = 25;
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

        global.resource[global.race.species].max = 1;
        global.resource[global.race.species].amount = 1;
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
        global.resource.Water.max = 25000;
        global.resource.Water.amount = 25000;
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
        global.resource.Quantium.amount = 2500000;

        if (!global.race['artifical']){
            global.resource.Food.crates = 10;
            global.resource.Food.containers = 10;
        }
        global.resource.Stone.crates = 25;
        global.resource.Stone.containers = 25;
        global.resource.Furs.crates = 25;
        global.resource.Furs.containers = 25;
        global.resource.Coal.crates = 10;
        global.resource.Coal.containers = 10;
        global.resource.Copper.crates = 25;
        global.resource.Copper.containers = 25;
        global.resource.Iron.crates = 25;
        global.resource.Iron.containers = 25;
        global.resource.Aluminium.crates = 25;
        global.resource.Aluminium.containers = 25;
        global.resource.Steel.crates = 25;
        global.resource.Steel.containers = 25;
        global.resource.Titanium.crates = 25;
        global.resource.Titanium.containers = 25;
        global.resource.Alloy.crates = 25;
        global.resource.Alloy.containers = 25;
        global.resource.Polymer.crates = 25;
        global.resource.Polymer.containers = 25;
        global.resource.Iridium.crates = 25;
        global.resource.Iridium.containers = 25;
        global.resource.Adamantite.crates = 25;
        global.resource.Adamantite.containers = 25;
        global.resource.Graphene.crates = 25;
        global.resource.Graphene.containers = 25;
        global.resource.Stanene.crates = 25;
        global.resource.Stanene.containers = 25;
        global.resource.Bolognium.crates = 25;
        global.resource.Bolognium.containers = 25;
        global.resource.Orichalcum.crates = 25;
        global.resource.Orichalcum.containers = 25;

        global.civic.taxes.display = true;

        if (!global.race['flier']){
            global.civic.cement_worker.display = true;
            global.resource.Cement.crates = 25;
            global.resource.Cement.containers = 25;
        }

        if (!global.race['sappy']){
            global.civic.quarry_worker.display = true
        }
        global.civic.professor.display = true;
        global.civic.scientist.display = true;
        global.civic.banker.display = true;
        global.civic.pit_miner.display = true;

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
        initStruct(actions.space.spc_dwarf.mass_relay); global.space.mass_relay.count = 100;
        initStruct(actions.space.spc_dwarf.shipyard);
        initStruct(actions.space.spc_enceladus.munitions_depot);
        initStruct(actions.space.spc_enceladus.operating_base);
        initStruct(actions.space.spc_enceladus.water_freighter);
        initStruct(actions.space.spc_enceladus.zero_g_lab);
        initStruct(actions.space.spc_eris.digsite);
        initStruct(actions.space.spc_eris.drone_control);
        initStruct(actions.space.spc_eris.shock_trooper);
        initStruct(actions.space.spc_eris.tank);
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
        initStruct(actions.space.spc_makemake.elerium_mine);
        initStruct(actions.space.spc_makemake.neutronium_mine);
        initStruct(actions.space.spc_makemake.orichalcum_mine);
        initStruct(actions.space.spc_makemake.uranium_mine);
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
        initStruct(actions.space.spc_titan.ai_colonist);
        initStruct(actions.space.spc_titan.decoder);
        initStruct(actions.space.spc_titan.electrolysis);
        initStruct(actions.space.spc_titan.g_factory);
        initStruct(actions.space.spc_titan.hydrogen_plant);
        initStruct(actions.space.spc_titan.storehouse);
        initStruct(actions.space.spc_titan.titan_bank);
        initStruct(actions.space.spc_titan.titan_mine);
        initStruct(actions.space.spc_titan.titan_quarters);
        initStruct(actions.space.spc_titan.titan_spaceport);
        initStruct(actions.space.spc_triton.crashed_ship); global.space.crashed_ship.count = 100;
        initStruct(actions.space.spc_triton.fob);
        initStruct(actions.space.spc_triton.lander);

        initStruct(actions.tauceti.tau_gas.refueling_station);
        initStruct(actions.tauceti.tau_home.alien_outpost); global.tauceti.alien_outpost.count = 1; global.tauceti.alien_outpost.on = 1;
        initStruct(actions.tauceti.tau_home.colony); global.tauceti.colony.count = 1; global.tauceti.colony.on = 1;
        initStruct(actions.tauceti.tau_home.fusion_generator); global.tauceti.fusion_generator.count = 1; global.tauceti.fusion_generator.on = 1;
        initStruct(actions.tauceti.tau_home.infectious_disease_lab);
        initStruct(actions.tauceti.tau_home.mining_pit); global.tauceti.mining_pit.count = 1; global.tauceti.mining_pit.on = 1;
        initStruct(actions.tauceti.tau_home.orbital_station); global.tauceti.orbital_station.count = 1; global.tauceti.orbital_station.on = 1;
        initStruct(actions.tauceti.tau_home.repository); global.tauceti.repository.count = 2;
        initStruct(actions.tauceti.tau_home.tauceti_casino);
        initStruct(actions.tauceti.tau_red.orbital_platform);

        global.space['ai_core'] = { count: 100 };
        global.space['ai_core2'] = { count: 0, on: 0 };
        global.space['m_relay'] = { count: 0, on: 0 };

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
        global.tech['tp_depot'] = 0;
        global.tech['railway'] = 0;
        global.tech['isolation'] = 1;
        global.race['truepath'] = 1;
        global.arpa['m_type'] = arpa('Monument');

        drawTech();
        renderTauCeti();
        arpa('Physics');
        loadFoundry();
    }
}

export function calcAIDrift(wiki){
    let drift = 0;
    let ai_colonist_on = wiki ? global.space.ai_colonist.on : p_on['ai_colonist'];
    let decoder_on = wiki ? global.space.decoder.on : support_on['decoder'];
    let shock_trooper_on = wiki ? global.space.shock_trooper.on : support_on['shock_trooper'];
    let tank_on = wiki ? global.space.tank.on : support_on['tank'];
    if (ai_colonist_on && decoder_on){
        drift += ai_colonist_on * decoder_on * 0.35;
    }
    if (shock_trooper_on){
        drift += shock_trooper_on * 2;
    }
    if (tank_on){
        drift += tank_on * 2;
    }
    drift = hugeScale(drift);
    if (drift > 100){
        drift = 100;
    }
    return drift;
}

function solarModal(){
    const box = $('#modalBox');
    box.closest('.animation-content').addClass('solarMapModal');
    box.append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('solar_system')}</p>`));
    buildSolarMap(box);
}

function shipDispatchModal(id, modal){
    let ship = global.space.shipyard.ships[id];
    if (!ship){ return; }

    // Dispatching any member of a fleet moves the whole fleet, so the modal describes the group.
    let crew = shipFleet(ship);
    let group = crew.length ? crew : [ship];
    let isFleet = crew.length > 1;

    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${isFleet ? loc('outer_shipyard_dispatch_fleet',[group.length]) : loc('outer_shipyard_dispatch',[ship.name])}</p>`));

    // Stats — mirrors the fleet row readout so the player can weigh what is being sent.
    let slowest = fleetPace(group);
    let fuel = shipFuelUse(slowest);
    let fuelText = fuel.res ? `${fuel.burn} ${global.resource[fuel.res].name}/s` : `N/A`;
    let speed = Math.round(shipSpeed(slowest) * starConstants.KM_S_PER_SHIPUNIT);
    let damage = Math.max(...group.map(s => s.damage));
    let hullClass = damage <= 10 ? `has-text-success` : (damage >= 65 ? `has-text-danger` : (damage >= 40 ? `has-text-caution` : ``));
    let sum = fn => group.reduce((t,s) => t + fn(s), 0);
    let stats = $(`<div class="shipDispatchStats"></div>`);
    stats.append(`<span><span class="has-text-warning">${loc('crew')}</span> <span class="pad">${sum(shipCrewSize)}</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('firepower')}</span> <span class="pad">${sum(shipAttackPower)}</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('outer_shipyard_sensors')}</span> <span class="pad">${loc('outer_shipyard_sensor_range',[Math.max(...group.map(sensorRange))])}</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('speed')}</span> <span class="pad">${speed}km/s</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('outer_shipyard_fuel')}</span> <span class="pad">${fuelText}</span></span>`);
    stats.append(`<span><span class="has-text-warning">${loc('outer_shipyard_hull')}</span> <span class="pad ${hullClass}">${100 - damage}%</span></span>`);
    $('#modalBox').append(stats);

    let list = $(`<div class="shipDispatch"></div>`);
    $('#modalBox').append(list);

    // A fleet can only go where every one of its ships can go, or it would not arrive as a unit —
    // an explorer, for instance, can only ever make for Tau Ceti.
    let dests = shipDestinations(group[0]);
    for (let i=1; i<group.length; i++){
        let reachable = new Set(shipDestinations(group[i]).map(d => d.region));
        dests = dests.filter(d => reachable.has(d.region));
    }

    // Crew check
    let crewNeed = group.reduce((t,s) => t + (shipManned(s) ? 0 : shipCrewSize(s)), 0);
    let crewFree = Math.max(0, global.civic.garrison.workers - global.civic.garrison.crew);

    // A hull under the launch minimum holds the ship in dry dock
    if (group.some(s => !shipCanLaunch(s))){
        list.append(`<span class="has-text-danger">${loc('outer_shipyard_dispatch_damaged',[minHullToLaunch])}</span>`);
    }
    else if (crewNeed > crewFree){
        list.append(`<span class="has-text-danger">${loc(group.length > 1 ? 'outer_shipyard_dispatch_crew_fleet' : 'outer_shipyard_dispatch_crew',[crewNeed,crewFree])}</span>`);
    }
    else if (dests.length === 0){
        list.append(`<span class="has-text-caution">${loc('outer_shipyard_dispatch_none')}</span>`);
    }
    else {
        // Once the jump gates are running a ship can cross between systems, so the list spans more
        // than one star and each destination says which it belongs to.
        let showSystem = global.tech['resettle'] && global.tech.resettle >= 3 || global.tech['shadow'] && global.tech.shadow >= 4;
        // Somewhere a battered hull can actually be put back together is worth picking out of the list.
        let yards = activeRepairYards();
        // Track patrol planning state for destination buttons.
        let planning = false;
        let plan = [];
        let addStop = function(){};
        let destButtons = [];

        dests.forEach(function(d){
            let trip = planShipTrip(slowest, d.region);
            if (!trip)
                return;

            let days = trip ? Math.round(tripDays(trip)) : 0;
            let fuelReady = group.every(s => shipCanMakeTrip(s, trip));
            let sysName = showSystem ? locSystemName(d.region) : '';
            let sys = sysName ? `<span class="dispatchSystem has-text-info">${sysName}</span>` : ``;
            let yard = yards.includes(d.region) ? `<span class="dispatchYard" title="${loc('outer_shipyard_repair_yard')}" aria-label="${loc('outer_shipyard_repair_yard')}">🛠️</span>` : ``;
            let button = $(`<button class="button is-info ${d.region}" ${fuelReady ? '' : 'disabled'}><span class="dispatchName">${d.name}${yard}</span>${sys}<span class="dispatchDays has-text-caution">${fuelReady ? loc('transit_time',[days]) : loc('outer_shipyard_fuel_insufficient')}</span></button>`)
                .on('click', function(){
                    // Add destinations as patrol stops while planning.
                    if (planning){ addStop(d.region); return; }
                    if (!fuelReady){ return; }
                    sendShipTo(id, d.region);
                    if (modal && modal.close){ modal.close(); }
                })
                .appendTo(list);
            destButtons.push({ region: d.region, el: button, days: days, fuelReady: fuelReady });
        });

        // Show patrol-route controls after Ship Patrols is researched.
        if (patrolsUnlocked()){
            $('#modalBox').append(`<hr class="patrolDivider">`);
            let box = $(`<div class="shipPatrol"></div>`);
            $('#modalBox').append(box);

            // Return leg duration, or false when unreachable.
            let patrolLegDays = function(from, to){
                let days = tradeLegDays(group, from, to);
                return isFinite(days) ? Math.round(days) : false;
            };
            let legText = function(from, to){
                let days = patrolLegDays(from, to);
                return days === false
                    ? `<span class="has-text-danger">${loc('outer_shipyard_patrol_unreachable')}</span>`
                    : `<span class="has-text-caution">${loc('transit_time',[days])}</span>`;
            };

            // Anchor the route at the fleet's current or destination region.
            let anchor = shipBound(group[0]);

            // Reprice destinations from the current planned stop.
            let refreshDests = function(){
                let from = planning ? (plan.length ? plan[plan.length - 1] : anchor) : false;
                destButtons.forEach(function(dest){
                    let text, ok;
                    if (!planning){
                        ok = dest.fuelReady;
                        text = ok ? loc('transit_time',[dest.days]) : loc('outer_shipyard_fuel_insufficient');
                    }
                    else if (dest.region === from){
                        // Do not add the current route stop twice.
                        ok = false;
                        text = loc('outer_shipyard_patrol_last');
                    }
                    else {
                        let days = patrolLegDays(from, dest.region);
                        ok = days !== false;
                        text = ok ? loc('transit_time',[days]) : loc('outer_shipyard_patrol_unreachable');
                    }
                    dest.el.find('.dispatchDays').html(text);
                    if (ok){ dest.el.removeAttr('disabled'); }
                    else { dest.el.attr('disabled','disabled'); }
                });
            };

            let renderPatrol = function(){
                refreshDests();
                clearElement(box);
                box.append(`<div class="patrolTitle has-text-warning">${loc('outer_shipyard_patrol_title')}</div>`);

                // Include the anchor before planned stops.
                let route = planning ? [anchor].concat(plan) : (shipPatrol(group[0]) ? shipPatrol(group[0]).stops : []);
                if (planning){
                    box.append(`<div class="patrolHint has-text-caution">${loc('outer_shipyard_patrol_hint')}</div>`);
                }

                if (route.length === 0){
                    box.append(`<div class="patrolStops has-text-caution">${loc('outer_shipyard_patrol_empty')}</div>`);
                }
                else {
                    // Display each stop's inbound leg duration.
                    let stops = $(`<div class="patrolStops"></div>`);
                    route.forEach(function(region, idx){
                        let prev = route[(idx + route.length - 1) % route.length];
                        let stop = $(`<div class="patrolStop"><span class="patrolNum has-text-info">${idx + 1}.</span> <span>${regionName(region)}</span> ${region === anchor
                            ? `<span class="patrolHere has-text-caution">${loc('outer_shipyard_patrol_here')}</span>`
                            : legText(prev, region)}</div>`);
                        // Allow removal of planned stops, but not the anchor.
                        if (planning && idx > 0){
                            $(`<a class="patrolDrop has-text-danger" role="button" aria-label="${loc('outer_shipyard_patrol_remove',[regionName(region)])}">✖</a>`)
                                .on('click', function(){
                                    plan.splice(idx - 1, 1);
                                    renderPatrol();
                                })
                                .appendTo(stop);
                        }
                        stops.append(stop);
                    });
                    box.append(stops);

                    if (route.length > 1){
                        let total = 0, whole = true;
                        for (let i=0; i<route.length; i++){
                            let days = patrolLegDays(route[i], route[(i + 1) % route.length]);
                            if (days === false){ whole = false; break; }
                            total += days;
                        }
                        box.append(`<div class="patrolTotal">${loc('outer_shipyard_patrol_loop')} ${whole
                            ? `<span class="has-text-caution">${loc('transit_time',[total])}</span>`
                            : `<span class="has-text-danger">${loc('outer_shipyard_patrol_unreachable')}</span>`}</div>`);
                    }
                }

                let controls = $(`<div class="patrolControls"></div>`);
                box.append(controls);

                $(`<button class="button is-info patrolPlan">${loc(planning ? 'outer_shipyard_patrol_finish' : 'outer_shipyard_patrol_set')}</button>`)
                    .on('click', function(){
                        if (!planning){
                            planning = true;
                            plan = [];
                            renderPatrol();
                            return;
                        }
                        planning = false;
                        if (plan.length > 0 && startPatrol(group[0], [anchor].concat(plan))){
                            if (modal && modal.close){ modal.close(); }
                            return;
                        }
                        // Reset an empty or invalid plan.
                        plan = [];
                        renderPatrol();
                    })
                    .appendTo(controls);

                if (planning){
                    $(`<button class="button is-danger patrolReset" ${plan.length ? '' : 'disabled'}>${loc('outer_shipyard_patrol_reset')}</button>`)
                        .on('click', function(){
                            if (!plan.length){ return; }
                            plan = [];
                            renderPatrol();
                        })
                        .appendTo(controls);
                }
                else if (shipPatrol(group[0])){
                    $(`<button class="button is-danger patrolClear">${loc('outer_shipyard_patrol_clear')}</button>`)
                        .on('click', function(){
                            stopPatrol(group[0]);
                            renderPatrol();
                        })
                        .appendTo(controls);
                }
            };

            addStop = function(region){
                plan.push(region);
                renderPatrol();
            };

            renderPatrol();
        }
    }
}

// The battle log. Newest first, one row per engagement: when and where it happened, what each side
// brought, and what each side landed. Read-only — it is a record, not a control.
export function battleLogModal(){
    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('battle_log_title')}</p>`));

    let log = zBattleLog_read();
    let list = $(`<div class="battleLog"></div>`);
    $('#modalBox').append(list);

    if (log.length === 0){
        list.append(`<span class="has-text-caution">${loc('battle_log_empty')}</span>`);
        return;
    }

    // A hull tally rendered as "2 Corvettes, 1 Destroyer", using the same class names the shipyard uses.
    // Include enemy-only hulls in battle rosters.
    let roster = function(tally){
        let parts = shipClassSizes.concat(['explorer','corsair']).filter(c => tally[c] > 0).map(function(c){
            return `${tally[c]} ${loc(`outer_shipyard_class_${c}`)}`;
        });
        return parts.length ? parts.join(`, `) : loc('battle_log_unknown');
    };

    log.forEach(function(b){
        let row = $(`<div class="battleRow"></div>`);
        // A fight you walked away from unscathed reads differently from one that cost you a hull, so the
        // outcome is colored rather than left for the player to work out from the numbers.
        let tone = b.pl > 0 ? `has-text-danger` : (b.el > 0 ? `has-text-success` : `has-text-warning`);
        row.append(`<div class="battleHead"><span class="${tone}">${loc('battle_log_where',[regionName(b.l)])}</span> <span class="has-text-caution">${zBattleDate(b.d)}</span></div>`);
        // Rounded here as well as at write time: engagements recorded before damage was rounded
        // still hold full-precision doubles, and "dealt 154.9204903865691 hull" is unreadable.
        row.append(`<div class="battleSide"><span class="has-text-success">${loc('battle_log_yours')}</span> <span>${roster(b.p)}</span> <span class="has-text-warning">${loc('battle_log_dealt',[zBattleHull(b.pd)])}</span>${b.pl > 0 ? ` <span class="has-text-danger">${loc('battle_log_lost',[b.pl])}</span>` : ``}</div>`);
        row.append(`<div class="battleSide"><span class="has-text-danger">${loc('battle_log_theirs')}</span> <span>${roster(b.e)}</span> <span class="has-text-warning">${loc('battle_log_dealt',[zBattleHull(b.ed)])}</span>${b.el > 0 ? ` <span class="has-text-success">${loc('battle_log_destroyed',[b.el])}</span>` : ``}</div>`);
        list.append(row);
    });
}

// Render the ship-refit modal and update costs for each plan change.
function shipRefitModal(id, modal){
    let ship = global.space.shipyard.ships[id];
    if (!ship){ return; }

    // Start with the ship's current equipment.
    let plan = {};
    refitParts.forEach(function(part){ plan[part] = ship[part]; });

    let box = $('#modalBox');
    box.append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('outer_shipyard_refit_title',[ship.name])}</p>`));
    // Hull class is displayed but cannot be changed by refitting.
    box.append(`<div class="shipDispatchStats"><span><span class="has-text-warning">${loc('outer_shipyard_refit_hull')}</span> <span class="pad">${loc(`outer_shipyard_class_${ship.class}`)}</span></span></div>`);

    let bay = $(`<div class="shipRefit"></div>`);
    box.append(bay);

    let paint = function(){
        clearElement(bay);
        let design = refitDesign(ship, plan);

        refitParts.forEach(function(part){
            if (!shipSlotOpen(part,ship.class)){ return; }
            // Show the original part when the plan changes this slot.
            let fitted = part === 'special' ? shipSpecial(design) : design[part];
            let held = part === 'special' ? shipSpecial(ship) : ship[part];
            let was = held === fitted ? `` : ` <span class="refitWas has-text-info">${loc('outer_shipyard_refit_was',[loc(shipPartKey(part,held))])}</span>`;
            let row = $(`<div class="refitSlot"><span class="refitLabel has-text-warning">${loc(`outer_shipyard_${part}`)}</span>${was}</div>`);
            let offered = 0;
            shipParts[part].forEach(function(v,idx){
                if (!shipPartAvailable(part,idx,v,ship.class)){ return; }
                offered++;
                // Mark the selected part visually and for assistive technology.
                let on = fitted === v;
                $(`<button class="button is-small ${on ? `is-success refitOn` : `is-info`}" aria-pressed="${on}">${on ? `&#10003; ` : ``}${loc(shipPartKey(part,v))}</button>`)
                    .on('click', function(){ plan[part] = v; paint(); })
                    .appendTo(row);
            });
            // Show fixed slots that have no available alternatives.
            if (offered === 0){
                row.append(`<span class="refitFixed has-text-caution">${loc(shipPartKey(part,fitted))} <span class="has-text-info">(${loc('outer_shipyard_refit_fixed')})</span></span>`);
            }
            bay.append(row);
        });

        // Compare both designs with the same fleet, cargo, and dock effects.
        let rate = function(source){
            let hull = refitDesign(ship, source);
            hull.fid = ship.fid;
            hull.flag = ship.flag;
            hull.cargo = ship.cargo;
            return hull;
        };
        let bare = rate(false), next = rate(plan);

        // Display current and planned performance values.
        let stats = $(`<div class="shipDispatchStats refitStats"></div>`);
        let shift = function(label, before, after){
            let value = String(before) === String(after) ? `${after}` : `${before} <span class="has-text-caution">&rarr;</span> ${after}`;
            stats.append(`<span><span class="has-text-warning">${label}</span> <span class="pad">${value}</span></span>`);
        };
        let powerText = function(bp){
            let watts = shipPower(bp);
            return watts < 0 ? `<span class="has-text-danger">${watts}kW</span>` : `${watts}kW`;
        };
        let speedText = function(bp){
            return Math.round(shipSpeed(bp) * starConstants.KM_S_PER_SHIPUNIT) + 'km/s';
        };
        let fuelText = function(bp){
            let fuel = shipFuelUse(bp);
            return fuel.res ? `-${fuel.burn} ${global.resource[fuel.res].name}` : loc('outer_shipyard_fuel_solar');
        };
        shift(loc('power'), powerText(bare), powerText(next));
        if (ship.class !== 'freighter'){
            shift(loc('firepower'), shipAttackPower(bare), shipAttackPower(next));
        }
        shift(loc('outer_shipyard_sensors'), loc('outer_shipyard_sensor_range',[sensorRange(bare)]), loc('outer_shipyard_sensor_range',[sensorRange(next)]));
        shift(loc('speed'), speedText(bare), speedText(next));
        shift(loc('outer_shipyard_fuel'), fuelText(bare), fuelText(next));
        bay.append(stats);

        // Render refit costs using standard resource affordability styling.
        let costs = refitCosts(ship, plan);
        // Charge refits to the ship's docked shipyard world.
        let pool = actionPool({ id: 'tp-refit', supply(){ return shipPort(ship); } });
        let bill = $(`<div class="costList refitCost"${pool ? ` data-pool="${pool}"` : ``}></div>`);
        let res_list = Object.keys(costs).sort(function(a,b){
            return a === 'Money' ? -1 : b === 'Money' ? 1 : 0;
        });
        if (res_list.length === 0){
            bill.append(`<span class="has-text-success">${loc('outer_shipyard_refit_free')}</span>`);
        }
        res_list.forEach(function(res,idx){
            if (idx > 0){ bill.append(`<span> | </span>`); }
            let color = poolHeld(res, pool) >= costs[res] ? `has-text-success` : `has-text-danger`;
            bill.append(`<span class="res-${res} ${color}" data-${res}="${costs[res]}" data-ok="has-text-success">${global.resource[res].name} ${sizeApproximation(costs[res])}</span>`);
        });
        bay.append(bill);

        if (refitDrains(ship, plan)){
            bay.append(`<div class="refitWarn has-text-caution">${loc('outer_shipyard_refit_drain')}</div>`);
        }

        let act = $(`<div class="refitAct"></div>`);
        let blocked = refitBlocked(ship, plan);
        if (blocked){
            act.append(`<span class="has-text-danger">${loc(blocked)}</span>`);
        }
        else if (!refitChanged(ship, plan)){
            act.append(`<span class="has-text-caution">${loc('outer_shipyard_refit_none')}</span>`);
        }
        else {
            $(`<button class="button is-info refitGo">${loc('outer_shipyard_refit')}</button>`)
                .on('click', function(){
                    if (applyRefit(ship, plan)){
                        messageQueue(loc('outer_shipyard_refit_msg',[ship.name]),'info',false,['progress']);
                        if (modal && modal.close){ modal.close(); }
                        drawShips();
                        updateCosts();
                    }
                })
                .appendTo(act);
        }
        bay.append(act);
    };

    paint();
}

function fleetJoinModal(id, modal){
    let ship = global.space.shipyard.ships[id];
    if (!ship){ return; }

    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('outer_shipyard_fleet_assign',[ship.name])}</p>`));

    let cost = fleetCommandCost(ship);
    let stats = $(`<div class="shipDispatchStats"></div>`);
    stats.append(`<span><span class="has-text-warning">${loc('outer_shipyard_fleet_cost')}</span> <span class="pad">${cost}</span></span>`);
    if (fleetCommandRating(ship) > 0){
        stats.append(`<span><span class="has-text-warning">${loc('outer_shipyard_fleet_rating')}</span> <span class="pad">${fleetCommandRating(ship)}</span></span>`);
    }
    $('#modalBox').append(stats);

    let list = $(`<div class="shipDispatch"></div>`);
    $('#modalBox').append(list);

    let redraw = function(){
        if (modal && modal.close){ modal.close(); }
        drawShips();
    };

    if (fleetWorthForming(ship)){
        $(`<button class="button is-info fleetNew"><span class="dispatchName">${loc('outer_shipyard_fleet_form')}</span><span class="dispatchDays has-text-caution">${loc('outer_shipyard_fleet_command',[0,fleetCommandRating(ship)])}</span></button>`)
            .on('click', function(){
                if (formFleet(ship)){ redraw(); }
            })
            .appendTo(list);
    }

    let options = fleetsFor(ship);
    options.forEach(function(flag){
        let free = fleetCommandFree(flag.fid);
        $(`<button class="button is-info fleetJoin"><span class="dispatchName"><span class="flag has-text-caution">⚑</span> ${flag.name}</span><span class="dispatchSystem has-text-info">${loc(`outer_shipyard_class_${flag.class}`)}</span><span class="dispatchDays has-text-caution">${loc('outer_shipyard_fleet_room',[free,fleetCommandRating(flag)])}</span></button>`)
            .on('click', function(){
                if (joinFleet(ship,flag.fid)){ redraw(); }
            })
            .appendTo(list);
    });

    if (options.length === 0 && !fleetWorthForming(ship)){
        list.append(`<span class="has-text-caution">${loc('outer_shipyard_fleet_nowhere')}</span>`);
    }
}

// Syndicate withdrawal from TP3 combat zones
export function syndicateWithdrawal(){
    const abandoned = ['spc_eris','spc_triton'];

    global.tech['shadow'] = 4;
    delete global.race['syndicate_withdraw'];

    withdrawShips(abandoned,'spc_dwarf');

    // The outposts stay standing, but nothing is running in them any more.
    abandoned.forEach(function(region){
        Object.keys(actions.space[region]).forEach(function(k){
            if (global.space.hasOwnProperty(k) && global.space[k].hasOwnProperty('on')){
                global.space[k].on = 0;
            }
        });
    });

    // Both worlds stop being places you can send a ship (their nav() reads this) and drop off the outer system tab.
    global.settings.space.eris = false;
    global.settings.space.triton = false;

    // The Server Farm takes over as the source of encrypted data.
    global.resource.Cipher.display = true;

    messageQueue(loc('space_syndicate_withdraw',[govTitle(4),planetName().eris,planetName().triton]),'info',false,['progress','combat']);
    renderSpace();
    setPowerGrid();
    drawTech();
}
