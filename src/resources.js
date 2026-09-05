import { global, tmp_vars, keyMultiplier, breakdown, sizeApproximation, p_on, support_on, active_rituals } from './vars.js';
import { vBind, clearElement, modRes, flib, calc_mastery, calcPillar, eventActive, easterEgg, trickOrTreat, popover, harmonyEffect, darkEffect, hoovedRename, messageQueue } from './functions.js';
import { races, traits, fathomCheck, geneBonus, geneFlat, geneRank, geneVars} from './races.js';
import { templeCount, actions } from './actions.js';
import { workerScale, job_data } from './jobs.js';
import { hellSupression } from './portal.js';
import { syndicate, womlingArtisans, freightCapacity, freightCargo, freightLoad, freightWeight, freightSpeedPenalty, dispatchFreighter, startFreightRoute, stopFreightRoute, shipFleet, shipArrivalTime, shipSpeed, seedStarterSupplyRoutes } from './truepath.js';
import { govActive, govTaskActive, defineGovernor } from './governor.js';
import { autoRouteOn, toggleAutoRoute } from './autoroute.js';
import { govEffect, rivalCollapsed } from './civics.js';
import { highPopAdjust, production, teamster, technicianCount } from './prod.js';
import { astrologySign, astroVal } from './seasons.js';
import { loc } from './locale.js';
import { supplyMode, supplyPools, supplyPool, supplyZone, supplyRegions, poolRegions, supplyRegionName, regCrates, regContainers, regAmount, regMax, regDiff, poolMod, syncTotal, zoneCitizens, CAPITAL } from './supply.js';
import { planetName } from './space.js';
import { buildSolarMap } from './stars.js';

export const resource_values = {
    Food: 5,
    Lumber: 5,
    Chrysotile: 5,
    Stone: 5,
    Crystal: 6,
    Furs: 8,
    Copper: 25,
    Iron: 40,
    Aluminium: 50,
    Cement: 15,
    Coal: 20,
    Oil: 75,
    Uranium: 550,
    Steel: 100,
    Titanium: 150,
    Alloy: 350,
    Polymer: 250,
    Iridium: 420,
    Helium_3: 620,
    Deuterium: 950,
    Elerium: 2000,
    Water: 2,
    Neutronium: 1500,
    Adamantite: 2250,
    Infernite: 2750,
    Nano_Tube: 750,
    Graphene: 3000,
    Stanene: 3600,
    Bolognium: 9000,
    Vitreloy: 10200,
    Orichalcum: 99000,
    Asphodel_Powder: 249000,
    Horseshoe: 0,
    Nanite: 0,
    Genes: 0,
    Soul_Gem: 0,
    Corrupt_Gem: 0,
    Codex: 0,
    Cipher: 0,
    Demonic_Essence: 0,
    Blessed_Essence: 0
};

export const black_market_values = {
    Food: {p: 500, v: 20},
    Lumber: {p: 500, v: 20},
    Chrysotile: {p: 500, v: 10},
    Stone: {p: 500, v: 20},
    Crystal: {p: 600, v: 4},
    Furs: {p: 800, v: 10},
    Copper: {p: 5000, v: 10},
    Iron: {p: 4000, v: 10},
    Aluminium: {p: 5000, v: 10},
    Cement: {p: 1500, v: 10},
    Coal: {p: 2000, v: 10},
    Oil: {p: 7500, v: 5},
    Uranium: {p: 8500, v: 1.2},
    Steel: {p: 6000, v: 5},
    Titanium: {p: 9500, v: 2.5},
    Alloy: {p: 6500, v: 2},
    Polymer: {p: 5500, v: 2},
    Iridium: {p: 4200, v: 1},
    Helium_3: {p: 850, v: 1},
    Elerium: {p: 21500, v: 0.2},
    Water: {p: 200, v: 20},
    Neutronium: {p: 15000, v: 0.5},
    Adamantite: {p: 22500, v: 0.5},
    Nano_Tube: {p: 7500, v: 10},
    Graphene: {p: 8000, v: 1},
    Stanene: {p: 8000, v: 1},
    Bolognium: {p: 35000, v: 1.2},
    Orichalcum: {p: 38000, v: 0.5},
    Unobtainium: {p: 88000, v: 0.25},
    Plywood: {p: 10000, v: 1},
    Brick: {p: 10000, v: 1},
    Wrought_Iron: {p: 10000, v: 1},
    Sheet_Metal: {p: 10000, v: 1},
    Mythril: {p: 15000, v: 1},
    Quantium: {p: 25000, v: 1},
    Aerographene: {p: 25000, v: 1},
};

export const tradeRatio = {
    Food: 2,
    Lumber: 2,
    Chrysotile: 1,
    Stone: 2,
    Crystal: 0.4,
    Furs: 1,
    Copper: 1,
    Iron: 1,
    Aluminium: 1,
    Cement: 1,
    Coal: 1,
    Oil: 0.5,
    Uranium: 0.12,
    Steel: 0.5,
    Titanium: 0.25,
    Alloy: 0.2,
    Polymer: 0.2,
    Iridium: 0.1,
    Helium_3: 0.1,
    Deuterium: 0.1,
    Elerium: 0.02,
    Water: 2,
    Neutronium: 0.05,
    Adamantite: 0.05,
    Infernite: 0.01,
    Nano_Tube: 0.1,
    Graphene: 0.1,
    Stanene: 0.1,
    Bolognium: 0.12,
    Vitreloy: 0.12,
    Orichalcum: 0.05
}

export const atomic_mass = {
    Food: 4.355,
    Lumber: 7.668,
    Chrysotile: 15.395,
    Stone: 20.017,
    Crystal: 5.062,
    Furs: 13.009,
    Copper: 63.546,
    Iron: 55.845,
    Aluminium: 26.9815,
    Cement: 20.009,
    Coal: 12.0107,
    Oil: 5.342,
    Uranium: 238.0289,
    Steel: 55.9,
    Titanium: 47.867,
    Alloy: 45.264,
    Polymer: 120.054,
    Iridium: 192.217,
    Helium_3: 3.0026,
    Deuterium: 2.014,
    Tungsten: 183.84,
    Neutronium: 248.74,
    Adamantite: 178.803,
    Infernite: 222.666,
    Elerium: 297.115,
    Nano_Tube: 15.083,
    Graphene: 26.9615,
    Stanene: 33.9615,
    Bolognium: 75.898,
    Unobtainium: 168.59,
    Vitreloy: 41.08,
    Orichalcum: 237.8,
    Asphodel_Powder: 0.01,
    Elysanite: 13.666,
    Water: 18.01,
    Plywood: 7.666,
    Brick: 20.009,
    Wrought_Iron: 55.845,
    Sheet_Metal: 26.9815,
    Mythril: 94.239,
    Aerogel: 7.84,
    Nanoweave: 23.71,
    Scarletite: 188.6,
    Quantium: 241.35,
    Aerographene: 4.62
};

export const supplyValue = {
    Lumber: { in: 0.5, out: 25000 },
    Chrysotile: { in: 0.5, out: 25000 },
    Stone: { in: 0.5, out: 25000 },
    Crystal: { in: 3, out: 25000 },
    Furs: { in: 3, out: 25000 },
    Copper: { in: 1.5, out: 25000 },
    Iron: { in: 1.5, out: 25000 },
    Aluminium: { in: 2.5, out: 25000 },
    Cement: { in: 3, out: 25000 },
    Coal: { in: 1.5, out: 25000 },
    Oil: { in: 2.5, out: 12000 },
    Uranium: { in: 5, out: 300 },
    Steel: { in: 3, out: 25000 },
    Titanium: { in: 3, out: 25000 },
    Alloy: { in: 6, out: 25000 },
    Polymer: { in: 6, out: 25000 },
    Iridium: { in: 8, out: 25000 },
    Helium_3: { in: 4.5, out: 12000 },
    Deuterium: { in: 4, out: 1000 },
    Neutronium: { in: 15, out: 1000 },
    Adamantite: { in: 12.5, out: 1000 },
    Infernite: { in: 25, out: 250 },
    Elerium: { in: 30, out: 250 },
    Nano_Tube: { in: 6.5, out: 1000 },
    Graphene: { in: 5, out: 1000 },
    Stanene: { in: 4.5, out: 1000 },
    Bolognium: { in: 18, out: 1000 },
    Vitreloy: { in: 14, out: 1000 },
    Orichalcum: { in: 10, out: 1000 },
    Plywood: { in: 10, out: 250 },
    Brick: { in: 10, out: 250 },
    Wrought_Iron: { in: 10, out: 250 },
    Sheet_Metal: { in: 10, out: 250 },
    Mythril: { in: 12.5, out: 250 },
    Aerogel: { in: 16.5, out: 250 },
    Nanoweave: { in: 18, out: 250 },
    Scarletite: { in: 35, out: 250 }
};

export function craftCost(manual=false){
    let costs = {
        Plywood: [{ r: 'Lumber', a: 100 }],
        Brick: global.race['flier'] ? [{ r: 'Stone', a: 60 }] : [{ r: 'Cement', a: 40 }],
        Wrought_Iron: [{ r: 'Iron', a: 80 }],
        Sheet_Metal: [{ r: 'Aluminium', a: 120 }],
        Mythril: [{ r: 'Iridium', a: 100 },{ r: 'Alloy', a: 250 }],
        Aerogel: [{ r: 'Graphene', a: 2500 },{ r: 'Infernite', a: 50 }],
        Nanoweave: [{ r: 'Nano_Tube', a: 1000 },{ r: 'Vitreloy', a: 40 }],
        Scarletite: [{ r: 'Iron', a: 250000 },{ r: 'Adamantite', a: 7500 },{ r: 'Orichalcum', a: 500 }],
        Quantium: [{ r: 'Nano_Tube', a: 1000 },{ r: 'Graphene', a: 1000 },{ r: 'Elerium', a: 25 }],
        Aerographene: [{ r: 'Graphene', a: 5000 },{ r: 'Nano_Tube', a: 5000 }],
        Thermite: [{ r: 'Iron', a: 180 },{ r: 'Aluminium', a: 60 }],
    };
    if (global.race['wasteful']){
        let rate = 1 + traits.wasteful.vars()[0] / 100;
        Object.keys(costs).forEach(function(res){
            for (let i=0; i<costs[res].length; i++){
                costs[res][i].a = Math.round(costs[res][i].a * rate);
            }
        });
    }
    if (global.race['high_pop'] && !manual){
        let rate = 1 / traits.high_pop.vars()[0];
        Object.keys(costs).forEach(function(res){
            for (let i=0; i<costs[res].length; i++){
                costs[res][i].a = Math.round(costs[res][i].a * rate);
            }
        });
    }
    return costs;
}

export const craftingRatio = (function(){
    var crafting = {};
    
    return function (res,type,recalc){
        if (recalc){
            let noEarth = global.race['cataclysm'] || global.race['orbit_decayed'] ? true : false;
            crafting = {
                general: {
                    add: [],
                    multi: []
                },
                Plywood: {
                    add: [],
                    multi: []
                },
                Brick: {
                    add: [],
                    multi: []
                },
                Wrought_Iron: {
                    add: [],
                    multi: []
                },
                Sheet_Metal: {
                    add: [],
                    multi: []
                },
                Mythril: {
                    add: [],
                    multi: []
                },
                Aerogel: {
                    add: [],
                    multi: []
                },
                Nanoweave: {
                    add: [],
                    multi: []
                },
                Aerographene: {
                    add: [],
                    multi: []
                },
                Scarletite: {
                    add: [],
                    multi: []
                },
                Quantium: {
                    add: [],
                    multi: []
                },
                Thermite: {
                    add: [],
                    multi: []
                }
            };
            // Womling artisans working a craftworks, a percent each on everything crafted.
            {
                let artisans = womlingArtisans();
                if (artisans > 0){
                    crafting.general.multi.push({
                        name: loc(`tau_red_womling_craftworks`),
                        manual: 1 + (artisans / 100),
                        auto: 1 + (artisans / 100)
                    });
                }
            }
            if (global.tech['foundry'] >= 2){
                let skill = global.tech['foundry'] >= 5 ? (global.tech['foundry'] >= 8 ? 0.08 : 0.05) : 0.03;
                crafting.general.add.push({
                    name: loc(`city_foundry`),
                    manual: global.city.foundry.count * skill,
                    auto: global.city.foundry.count * skill
                });
            }
            if (global.tech['foundry'] >= 3){
                Object.keys(crafting).forEach(function(resource){
                    if (global.city.foundry[resource] && global.city.foundry[resource] > 1){
                        crafting[resource].add.push({
                            name: loc(`tech_apprentices`),
                            manual: (global.city.foundry[resource] - 1) * highPopAdjust(0.03),
                            auto: (global.city.foundry[resource] - 1) * highPopAdjust(0.03)
                        });
                    }
                });
            }
            if (global.tech['foundry'] >= 4 && global.city['sawmill']){
                crafting.Plywood.add.push({
                    name: loc(`city_sawmill`),
                    manual: global.city['sawmill'].count * 0.02,
                    auto: global.city['sawmill'].count * 0.02
                });
            }
            if (global.tech['foundry'] >= 6){
                crafting.Brick.add.push({
                    name: loc(`city_foundry`),
                    manual: global.city['foundry'].count * 0.02,
                    auto: global.city['foundry'].count * 0.02
                });
            }
            if (global.tech['foundry'] >= 7){
                crafting.general.add.push({
                    name: loc(`city_factory`) + ` (${loc(`tab_city5`)})`,
                    manual: p_on['factory'] * 0.05,
                    auto: p_on['factory'] * 0.05
                });
                if (global.tech['mars'] >= 4){
                    crafting.general.add.push({
                        name: loc(`city_factory`) + ` (${loc(`tab_space`)})`,
                        manual: p_on['red_factory'] * 0.05,
                        auto: p_on['red_factory'] * 0.05
                    });
                }
                if (global.interstellar['int_factory'] && p_on['int_factory']){
                    crafting.general.add.push({
                        name: loc(`interstellar_int_factory_title`),
                        manual: p_on['int_factory'] * 0.1,
                        auto: p_on['int_factory'] * 0.1
                    });
                }
            }
            // Technicians add to crafting wherever it happens, not just on the complex they staff. This
            // sits outside the foundry >= 7 gate above because it is the job doing the work, not a
            // factory automating it.
            {
                let rate = technicianCount() * (job_data.technician.craftRate() / 100);
                if (rate > 0){
                    crafting.general.add.push({
                        name: job_data.technician.name(),
                        manual: rate,
                        auto: rate
                    });
                }
            }
            // The workshop only multiplies what the complexes on the same surface are turning out, so
            // it is worth nothing on its own — and nothing at all while the descender is stopped.
            if (global.space['workshop'] && support_on['workshop'] && support_on['industrial_complex']
                && actions.space.spc_venus.descender.operating()){
                let rate = support_on['workshop'] * support_on['industrial_complex']
                    * (actions.space.spc_venus.workshop.crafting() / 100);
                crafting.general.add.push({
                    name: loc(`space_workshop_title`),
                    manual: rate,
                    auto: rate
                });
            }
            if (global.portal['demon_forge'] && p_on['demon_forge']){
                crafting.general.add.push({
                    name: loc(`portal_demon_forge_title`),
                    manual: 0,
                    auto: p_on['demon_forge'] * actions.portal.prtl_wasteland.demon_forge.crafting() / 100
                });
            }
            if (global.portal['hell_factory'] && p_on['hell_factory']){
                crafting.general.add.push({
                    name: loc(`portal_factory_title`),
                    manual: p_on['hell_factory'] * 0.25,
                    auto: p_on['hell_factory'] * 0.25
                });
            }
            if (global.space['fabrication'] && support_on['fabrication']){
                crafting.general.add.push({
                    name: loc(`space_red_fabrication_title`),
                    manual: support_on['fabrication'] * global.civic.colonist.workers * (noEarth ? highPopAdjust(0.05) : highPopAdjust(0.02)),
                    auto: support_on['fabrication'] * global.civic.colonist.workers * (noEarth ? highPopAdjust(0.05) : highPopAdjust(0.02))
                });
            }
            if (global.race['artisan']){
                crafting.general.multi.push({
                    name: loc(`trait_artisan_name`),
                    manual: 1,
                    auto: 1 + (traits.artisan.vars()[0] / 100)
                });
            }
            if (p_on['stellar_forge']){
                crafting.Mythril.add.push({
                    name: loc(`interstellar_stellar_forge_title`),
                    manual: p_on['stellar_forge'] * 0.05,
                    auto: p_on['stellar_forge'] * 0.05
                });
                crafting.general.add.push({
                    name: loc(`interstellar_stellar_forge_title`),
                    manual: 0,
                    auto: p_on['stellar_forge'] * 0.1
                });
            }
            if (p_on['hell_forge']){
                let sup = hellSupression('ruins');
                crafting.general.add.push({
                    name: loc(`portal_hell_forge_title`),
                    manual: 0,
                    auto: p_on['hell_forge'] * 0.75 * sup.supress
                });
                crafting.Scarletite.multi.push({
                    name: loc(`portal_ruins_supressed`),
                    manual: 1,
                    auto: sup.supress
                });
            }
            if (global.tauceti['tau_factory'] && support_on['tau_factory']){
                crafting.general.add.push({
                    name: loc(`tau_home_tau_factory`),
                    manual: 0,
                    auto: (support_on['tau_factory'] * (global.tech['isolation'] ? 2.75 : 0.9))
                });
            }
            if (global.tech['isolation'] && global.tauceti['colony'] && support_on['colony']){
                crafting.general.add.push({
                    name: loc(`tau_home_colony`),
                    manual: support_on['colony'] * 0.5,
                    auto: support_on['colony'] * 0.5
                });
            }
            if ((support_on['zero_g_lab'] && p_on['zero_g_lab']) || (support_on['infectious_disease_lab'] && p_on['infectious_disease_lab'])){
                let synd = syndicate('spc_enceladus');
                crafting.Quantium.multi.push({
                    name: loc(`space_syndicate`),
                    manual: 1,
                    auto: synd
                });
            }
            if (global.tech['alien_crafting'] && support_on['infectious_disease_lab'] && p_on['infectious_disease_lab']){
                let qCraft = 1 + (0.65 * Math.min(support_on['infectious_disease_lab'],p_on['infectious_disease_lab']));
                crafting.Quantium.multi.push({
                    name: loc(`tech_infectious_disease_lab_alt`),
                    manual: 1,
                    auto: qCraft
                });
            }
            if (global.race['crafty']){
                crafting.general.add.push({
                    name: loc(`wiki_arpa_crispr_crafty`),
                    manual: 0.03,
                    auto: 0.03
                });
            }
            if (global.race['ambidextrous']){
                crafting.general.add.push({
                    name: loc(`trait_ambidextrous_name`),
                    manual: geneVars('ambidextrous')[0] * global.race['ambidextrous'] / 100,
                    auto: geneVars('ambidextrous')[0] * global.race['ambidextrous'] / 100
                });
            }
            if (global.race['rigid']){
                crafting.general.add.push({
                    name: loc(`trait_rigid_name`),
                    manual: -(traits.rigid.vars()[0] / 100),
                    auto: -(traits.rigid.vars()[0] / 100)
                });
            }
            if (global.civic.govern.type === 'socialist'){
                crafting.general.multi.push({
                    name: loc(`govern_socialist`),
                    manual: 1 + (govEffect.socialist()[0] / 100),
                    auto: 1 + (govEffect.socialist()[0] / 100)
                });
            }
            if (global.race['casting'] && active_rituals['crafting']){
                let num_rituals = active_rituals['crafting'];
                let boost_m = 1 + (num_rituals / (num_rituals + 75));
                let boost_a = 1 + (2 * num_rituals / (2 * num_rituals + 75));
                crafting.general.multi.push({
                    name: loc(`modal_pylon_casting`),
                    manual: boost_m,
                    auto: boost_a
                });
            }
            if (global.race['universe'] === 'magic'){
                crafting.general.multi.push({
                    name: loc(`universe_magic`),
                    manual: 0.8,
                    auto: 0.8
                });
            }
            if (global.tech['v_train']){
                crafting.general.multi.push({
                    name: loc(`tech_vocational_training`),
                    manual: 1,
                    auto: 2
                });
            }
            if (global.genes['crafty']){
                crafting.general.multi.push({
                    name: loc(`tab_arpa_crispr`) + ' ' + loc(`wiki_arpa_crispr_crafty`),
                    manual: 1,
                    auto: 1 + ((global.genes.crafty - 1) * 0.5)
                });
            }
            if (global.race['living_tool']){
                crafting.general.multi.push({
                    name: loc(`trait_living_tool_name`),
                    manual: 1,
                    auto: 1 + (traits.living_tool.vars()[1] / 100)
                });
            }
            if (global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 1){
                crafting.general.multi.push({
                    name: loc(`evo_challenge_orbit_decay`),
                    manual: 1,
                    auto: 1.1
                });
            }
            if (global.race['ambidextrous']){
                crafting.general.multi.push({
                    name: loc(`trait_ambidextrous_name`),
                    manual: 1,
                    auto: 1 + (geneVars('ambidextrous')[1] * global.race['ambidextrous'] / 100)
                });
            }
            // Versatile: the humanoid genus turns out more of whatever it is making.
            if (geneRank('versatile') > 0){
                crafting.general.multi.push({
                    name: loc(`trait_versatile_name`),
                    manual: geneBonus('versatile'),
                    auto: geneBonus('versatile')
                });
            }
            if (global.blood['artisan']){
                crafting.general.multi.push({
                    name: loc(`tab_arpa_blood`) + ' ' + loc(`arpa_blood_artisan_title`),
                    manual: 1,
                    auto: 1 + (global.blood.artisan / 100)
                });
            }
            let faith = faithBonus();
            if (faith > 0){
                crafting.general.multi.push({
                    name: loc(`faith`),
                    manual: 1,
                    auto: 1 + (faith / (global.race.universe === 'antimatter' ? 1.5 : 3))
                });
            }
            if (global.prestige.Plasmid.count > 0){
                crafting.general.multi.push({
                    name: loc(`resource_Plasmid_plural_name`),
                    manual: plasmidBonus() / 8 + 1,
                    auto: plasmidBonus() / 8 + 1
                });
            }
            if (global.genes['challenge'] && global.genes['challenge'] >= 2){
                crafting.general.multi.push({
                    name: loc(`mastery`),
                    manual: 1 + (calc_mastery() / (global.race['weak_mastery'] ? 50 : 100)),
                    auto: 1 + (calc_mastery() / (global.race['weak_mastery'] ? 50 : 100))
                });
            }
            if (global.race['gravity_well']){
                crafting.general.multi.push({
                    name: loc(`evo_challenge_gravity_well`),
                    manual: teamster(1),
                    auto: teamster(1)
                });
            }
        }
        else {
            let multiplier = 1;
            let add_bd = {};
            let multi_bd = {};
            if (crafting['general']){
                for (let i=0; i<crafting.general.add.length; i++){
                    let curr = crafting.general.add[i];
                    add_bd[curr.name] = curr[type];
                    multiplier += curr[type];
                }
                for (let i=0; i<crafting[res].add.length; i++){
                    let curr = crafting[res].add[i];
                    add_bd[curr.name] = curr[type] + (add_bd[curr.name] ? add_bd[curr.name] : 0);
                    multiplier += curr[type];
                }
                multi_bd[loc(`craft_tools`)] = multiplier - 1;
                for (let i=0; i<crafting.general.multi.length; i++){
                    let curr = crafting.general.multi[i];
                    multi_bd[curr.name] = +(curr[type]) - 1;
                    multiplier *= curr[type];
                }
                for (let i=0; i<crafting[res].multi.length; i++){
                    let curr = crafting[res].multi[i];
                    multi_bd[curr.name] = (curr[type] * (1 + (multi_bd[curr.name] ? +(multi_bd[curr.name]) : 0))) - 1;
                    multiplier *= curr[type];
                }
            }

            Object.keys(add_bd).forEach(function(add){
                add_bd[add] = (+(add_bd[add]) * 100).toFixed(2) + '%';
            });
            Object.keys(multi_bd).forEach(function(multi){
                multi_bd[multi] = (+(multi_bd[multi]) * 100).toFixed(2) + '%';
            });

            let craft_total = {
                multiplier: multiplier,
                add_bd: add_bd,
                multi_bd: multi_bd
                
            }
            return craft_total;
        }
    }
})();

export function initResourceTabs(tab){
    if (tab){
        switch (tab){
            case 'market':
                initMarket();
                break;
            case 'storage':
                initStorage();
                break;
            case 'ejector':
                initEjector();
                break;
            case 'supply':
                initSupply();
                break;
            case 'alchemy':
                initAlchemy();
                break;
            case 'supply_zones':
                initSupplyZones();
                break;
        }
    }
    else {
        initMarket();
        initStorage();
        initEjector();
        initSupply();
        initAlchemy();
        initSupplyZones();
    }
}

export function drawResourceTab(tab){
    if (tab === 'market'){
        if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
            return;
        }
        initResourceTabs('market');
        if (supplyMode() !== 'global'){
            loadBlackMarket();
            return;
        }
        if (tmp_vars.hasOwnProperty('resource')){
            Object.keys(tmp_vars.resource).forEach(function(name){
                let color = tmp_vars.resource[name].color;
                let tradable = tmp_vars.resource[name].tradable;
                if (tradable){
                    var market_item = $(`<div id="market-${name}" class="market-item" v-show="r.display"></div>`);
                    $('#market').append(market_item);
                    marketItem(`#market-${name}`,market_item,name,color,true);
                }
            });
        }
        tradeSummery();
    }
    else if (tab === 'storage'){
        if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 1)){
            return;
        }
        initResourceTabs('storage');
        if (tmp_vars.hasOwnProperty('resource')){
            Object.keys(tmp_vars.resource).forEach(function(name){
                let color = tmp_vars.resource[name].color;
                let stackable = tmp_vars.resource[name].stackable;
                if (stackable){
                    var market_item = $(`<div id="stack-${name}" class="market-item" v-show="display"></div>`);
                    $('#resStorage').append(market_item);
                    containerItem(`#stack-${name}`,market_item,name,color,true);
                }
            });
        }
        tradeSummery();
    }
    else if (tab === 'ejector'){
        if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 2)){
            return;
        }
        initResourceTabs('ejector');
        if (tmp_vars.hasOwnProperty('resource')){
            Object.keys(tmp_vars.resource).forEach(function(name){
                let color = tmp_vars.resource[name].color;
                if (atomic_mass[name]){
                    loadEjector(name,color);
                }
            });
        }
    }
    else if (tab === 'supply'){
        if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 3)){
            return;
        }
        initResourceTabs('supply');
        if (tmp_vars.hasOwnProperty('resource')){
            Object.keys(tmp_vars.resource).forEach(function(name){
                let color = tmp_vars.resource[name].color;
                if (supplyValue[name]){
                    loadSupply(name,color);
                }
            });
        }
    }
    else if (tab === 'alchemy'){
        if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 4)){
            return;
        }
        initResourceTabs('alchemy');
        if (tmp_vars.hasOwnProperty('resource')){
            Object.keys(tmp_vars.resource).forEach(function(name){
                let color = tmp_vars.resource[name].color;
                let tradable = tmp_vars.resource[name].tradable;
                if (tradeRatio[name] && global.race.universe === 'magic'){
                    global['resource'][name]['basic'] = tradable;
                    loadAlchemy(name,color,tradable);
                }
            });
        }
    }
    // Supply-zone controls now live in the Resources tab.
    else if (tab === 'supply_zones'){
        if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 5)){
            return;
        }
        initResourceTabs('supply_zones');
    }
    else if (tab === 'region'){
        drawResourceTab('storage');
    }
}

// Sets up resource definitions
// Add the regional resource-list selector when supply zones unlock.
export function loadRegionSwitch(){
    const host = $('#resources');
    if (!host.length){ return; }
    $('#resRegionSwitch').remove();
    if (supplyMode() === 'global'){ return; }
    host.prepend($(`<div id="resRegionSwitch" class="resRegionSwitch">
        <span role="button" aria-label="${loc('supply_switch_prev')}" class="sub has-text-danger" @click="cycle(-1)"><span>&laquo;</span></span>
        <span class="viewing has-text-warning">{{ label() }}</span>
        <span role="button" aria-label="${loc('supply_switch_next')}" class="add has-text-success" @click="cycle(1)"><span>&raquo;</span></span>
    </div>`));
    vBind({
        el: '#resRegionSwitch',
        data: global.settings,
        methods: {
            label(){
                const at = global.settings.resRegion;
                return !at || at === 'all' ? loc('supply_switch_all') : supplyRegionName(at);
            },
            cycle(step){
                // Rebuild the selector from the current supply pools.
                const stops = ['all'].concat(supplyPools());
                let at = stops.indexOf(global.settings.resRegion || 'all');
                if (at < 0){ at = 0; }
                pointResourceListAt(stops[(at + step + stops.length) % stops.length]);
            }
        }
    });
}

// Select a supply pool and redraw the resource rows.
export function pointResourceListAt(zone){
    if (!zone || global.settings.resRegion === zone){ return; }
    global.settings.resRegion = zone;
    for (const res of Object.keys(global.resource)){
        vBind({ el: `#res${res}` }, 'update');
    }
    vBind({ el: '#resRegionSwitch' }, 'update');
}

// Show the resource pool that will pay for the selected building.
export function showZoneFor(c_action){
    if (supplyMode() === 'global' || !c_action){ return; }
    supplyRegions();                        // make sure the tree has been tagged with its zones
    if (!c_action.s_zone){ return; }        // not a building standing anywhere — a tech, say
    pointResourceListAt(supplyPool(c_action.s_zone));
}

export function defineResources(wiki){
    if (!wiki){ loadRegionSwitch(); }
    if (global.race.species === 'protoplasm'){
        let base = 100;
        if (global.stats.achieve['mass_extinction'] && global.stats.achieve['mass_extinction'].l > 1){
            base += 50 * (global.stats.achieve['mass_extinction'].l - 1);
        }
        loadResource('RNA',wiki,base,1,false);
        loadResource('DNA',wiki,base,1,false);
    }
    
    loadResource('Money',wiki,1000,1,false,false,'success');
    loadResource(global.race.species,wiki,0,0,false,false,'warning');
    loadResource('Slave',wiki,0,0,false,false,'warning');
    loadResource('Authority',wiki,0,0,false,false,'warning');
    loadResource('Mana',wiki,0,1,false,false,'warning');
    loadResource('Energy',wiki,0,0,false,false,'warning');
    loadResource('Sus',wiki,0,0,false,false,'warning');
    loadResource('Knowledge',wiki,100,1,false,false,'warning');
    loadResource('Omniscience',wiki,100,1,false,false,'warning');
    loadResource('Zen',wiki,0,0,false,false,'warning');
    loadResource('Crates',wiki,0,0,false,false,'warning');
    loadResource('Containers',wiki,0,0,false,false,'warning');
    loadResource('Food',wiki,250,1,true,true);
    loadResource('Lumber',wiki,200,1,true,true);
    loadResource('Chrysotile',wiki,200,1,true,true);
    loadResource('Stone',wiki,200,1,true,true);
    loadResource('Crystal',wiki,200,1,true,true);
    loadResource('Useless',wiki,-2,0,false,false);
    loadResource('Furs',wiki,100,1,true,true);
    loadResource('Copper',wiki,100,1,true,true);
    loadResource('Iron',wiki,100,1,true,true);
    loadResource('Aluminium',wiki,50,1,true,true);
    loadResource('Cement',wiki,100,1,true,true);
    loadResource('Coal',wiki,50,1,true,true);
    loadResource('Oil',wiki,0,1,true,false);
    loadResource('Uranium',wiki,10,1,true,false);
    loadResource('Steel',wiki,50,1,true,true);
    loadResource('Titanium',wiki,50,1,true,true);
    loadResource('Alloy',wiki,50,1,true,true);
    loadResource('Polymer',wiki,50,1,true,true);
    loadResource('Iridium',wiki,0,1,true,true);
    loadResource('Helium_3',wiki,0,1,true,false);
    loadResource('Water',wiki,0,1,false,false,'advanced');
    loadResource('Deuterium',wiki,0,1,false,false,'advanced');
    loadResource('Tungsten',wiki,0,1,false,true,'advanced');
    loadResource('Neutronium',wiki,0,1,false,false,'advanced');
    loadResource('Adamantite',wiki,0,1,false,true,'advanced');
    loadResource('Infernite',wiki,0,1,false,false,'advanced');
    loadResource('Elerium',wiki,1,1,false,false,'advanced');
    loadResource('Nano_Tube',wiki,0,1,false,false,'advanced');
    loadResource('Graphene',wiki,0,1,false,true,'advanced');
    loadResource('Stanene',wiki,0,1,false,true,'advanced');
    loadResource('Bolognium',wiki,0,1,false,true,'advanced');
    loadResource('Vitreloy',wiki,0,1,false,true,'advanced');
    loadResource('Orichalcum',wiki,0,1,false,true,'advanced');
    loadResource('Asphodel_Powder',wiki,0,1,false,false,'advanced');
    loadResource('Elysanite',wiki,0,1,false,true,'advanced');
    loadResource('Unobtainium',wiki,0,1,false,false,'advanced');
    loadResource('Positronium',wiki,0,1,false,false,'advanced');
    loadResource('Materials',wiki,0,1,false,false,'advanced');
    loadResource('Horseshoe',wiki,-2,0,false,false,'advanced');
    loadResource('Nanite',wiki,0,1,false,false,'advanced');
    loadResource('Genes',wiki,-2,0,false,false,'advanced');
    loadResource('Soul_Gem',wiki,-2,0,false,false,'advanced');
    loadResource('Plywood',wiki,-1,0,false,false,'danger');
    loadResource('Brick',wiki,-1,0,false,false,'danger');
    loadResource('Wrought_Iron',wiki,-1,0,false,false,'danger');
    loadResource('Sheet_Metal',wiki,-1,0,false,false,'danger');
    loadResource('Mythril',wiki,-1,0,false,false,'danger');
    loadResource('Aerogel',wiki,-1,0,false,false,'danger');
    loadResource('Nanoweave',wiki,-1,0,false,false,'danger');
    loadResource('Scarletite',wiki,-1,0,false,false,'danger');
    loadResource('Quantium',wiki,-1,0,false,false,'danger');
    loadResource('Aerographene',wiki,-1,0,false,false,'danger');
    loadResource('Thermite',wiki,-1,0,false,false,'danger');
    loadResource('Corrupt_Gem',wiki,-2,0,false,false,'caution');
    loadResource('Codex',wiki,-2,0,false,false,'caution');
    loadResource('Cipher',wiki,0,1,false,false,'caution');
    loadResource('Demonic_Essence',wiki,-2,0,false,false,'caution');
    loadResource('Blessed_Essence',wiki,-2,0,false,false,'caution');
    if (wiki){ return; }
    loadSpecialResource('Blood_Stone','caution');
    loadSpecialResource('Artifact','caution');
    loadResource('Knockoff',wiki,-2,0,false,false,'special');
    loadSpecialResource('Plasmid');
    loadSpecialResource('AntiPlasmid');
    loadSpecialResource('Supercoiled');
    loadSpecialResource('Phage');
    loadSpecialResource('Dark');
    loadSpecialResource('Harmony');
    loadSpecialResource('AICore');
    loadSpecialResource('TALENs');
}

export function tradeSummery(){
    if (global.race.species !== 'protoplasm'){
        loadRouteCounter();
        initGalaxyTrade();
        loadContainerCounter();
    }
}

// Load resource function
// This function defines each resource, loads saved values from localStorage
// And it creates Vue binds for various resource values
function loadResource(name,wiki,max,rate,tradable,stackable,color){
    color = color || 'info';
    if (!global.resource[name]){
        global.resource[name] = {};
    }

    setResourceName(name);

    if (global.race['artifical']){
        if (name === 'Food'){
            stackable = false;
        }
    }

    if (wiki){ return; }

    if (!global.resource[name].hasOwnProperty('display')){
        global.resource[name]['display'] = false;
    }
    if (!global.resource[name].hasOwnProperty('value')){
        global.resource[name]['value'] = global.race['truepath'] ? resource_values[name] * 2 : resource_values[name];
    }
    if (!global.resource[name].hasOwnProperty('amount')){
        global.resource[name]['amount'] = 0;
    }
    if (!global.resource[name].hasOwnProperty('max')){
        global.resource[name]['max'] = max;
    }
    if (!global.resource[name].hasOwnProperty('diff')){
        global.resource[name]['diff'] = 0;
    }
    if (!global.resource[name].hasOwnProperty('delta')){
        global.resource[name]['delta'] = 0;
    }
    if (!global.resource[name].hasOwnProperty('rate')){
        global.resource[name]['rate'] = rate;
    }
    if (!global.settings.resBar.hasOwnProperty(name)){
        global.settings.resBar[name] = true;
    }
    if (!global.resource[name].hasOwnProperty('bar')){
        global.resource[name]['bar'] = global.settings.resBar[name];
    }

    if (name === 'Mana'){
        global['resource'][name]['gen'] = 0;
        global['resource'][name]['gen_d'] = 0;
    }  

    global['resource'][name]['stackable'] = stackable;
    if (!global['resource'][name]['crates']){
        global['resource'][name]['crates'] = 0;
    }
    if (!global['resource'][name]['containers']){
        global['resource'][name]['containers'] = 0;
    }
    // Store per-pool amounts, capacity, and assigned stacks for regional resources.
    if (!global['resource'][name].hasOwnProperty('reg')){
        global['resource'][name]['reg'] = {};
    }
    if (!global['resource'][name].hasOwnProperty('regMax')){
        global['resource'][name]['regMax'] = {};
    }
    if (!global['resource'][name].hasOwnProperty('regCrate')){
        global['resource'][name]['regCrate'] = {};
    }
    if (!global['resource'][name].hasOwnProperty('regCon')){
        global['resource'][name]['regCon'] = {};
    }
    if (!global['resource'][name]['trade'] && tradable){
        global['resource'][name]['trade'] = 0;
    }

    var res_container;
    if (global.resource[name].max === -1 || global.resource[name].max === -2){
        res_container = $(`<div class="resource crafted" v-show="display"><div><h3 class="res has-text-${color}">{{ namespace(name) }}</h3><span id="cnt${name}" class="count">{{ diffSize(amount) }}</span></div></div>`);
    }
    else {
        // Read amounts and capacity from the selected pool when applicable.
        res_container = $(`<div class="resource${global.settings.resBar[name] ? ` showBar` : ``}" v-show="display" :style="{ '--percent-full': (bar && room() > 0 ? (held()/room())*100 : 0) + '%' }"><div><h3 class="res has-text-${color} bar" @click="toggle('${name}')">{{ namespace(name) }}</h3><span id="cnt${name}" class="count">{{ size(held()) }} / {{ size(room()) }}</span></div></div>`);
    }
    var bind_container = $(`<div id="res${name}"></div>`);
    bind_container.append(res_container);

    if (stackable){
        res_container.append($(`<span><span id="con${name}" v-if="showTrigger()" class="interact has-text-success" @click="trigModal" role="button" aria-label="Open crate management for ${global.resource[name].name}">+</span></span>`));
    }
    else if (max !== -1 || (max === -1 && rate === 0 && global.race['no_craft']) || name === 'Scarletite' || name === 'Quantium'){
        res_container.append($('<span></span>'));
    }
    
    let infopops = false;
    if (rate !== 0 || (max === -1 && rate === 0 && global.race['no_craft']) || name === 'Scarletite' || name === 'Quantium'){
        res_container.append($(`<span id="inc${name}" class="diff" :aria-label="resRate('${name}')">{{ diffSize(flow()) }} /s</span>`));
    }
    else if (max === -1 && !global.race['no_craft'] && name !== 'Scarletite' && name !== 'Quantium'){
        let craft = $('<span class="craftable"></span>');
        res_container.append(craft);

        let inc = [1,5];
        for (let i=0; i<inc.length; i++){
            craft.append($(`<span id="inc${name}${inc[i]}"><a @click="craft('${name}',${inc[i]})" aria-label="craft ${inc[i]} ${global.resource[name].name}" role="button">+<span class="craft" data-val="${inc[i]}">${inc[i]}</span></a></span>`));
        }
        craft.append($(`<span id="inc${name}A"><a @click="craft('${name}','A')" aria-label="craft max ${global.resource[name].name}" role="button">+<span class="craft" data-val="${'A'}">A</span></a></span>`));
        infopops = true;
    }
    else if(global.race['fasting'] && name === global.race.species){
        res_container.append($(`<span id="inc${name}" class="diff" :aria-label="resRate('${name}')">{{ diffSize(diff) }}</span>`));
    }
    else {
        res_container.append($(`<span></span>`));
    }
    
    $('#resources').append(bind_container);
    
    vBind({
        el: `#res${name}`,
        data: global['resource'][name],
        methods: {
            // Return the selected pool’s resource amount and capacity.
            viewingRegionalCitizens(){
                const at = global.settings.resRegion;
                return name === global.race.species && supplyMode() === 'regional' && at && at !== 'all';
            },
            held(){
                const at = global.settings.resRegion;
                if (this.viewingRegionalCitizens()){ return zoneCitizens(at); }
                return zoneHeld(name);
            },
            room(){
                const at = global.settings.resRegion;
                if (this.viewingRegionalCitizens()){
                    const housing = global.race.zoneHousing || {};
                    return poolRegions(at).reduce((total, zone) => total + (housing[zone] || 0), 0);
                }
                return zoneRoom(name);
            },
            // Return the selected pool’s production rate without shadowing `rate` data.
            flow(){
                return zoneFlow(name);
            },
            size: function (value){
                return value ? sizeApproximation(value,0) : value;
            },
            diffSize: function (value){
                if (name === 'Horseshoe' && !global.race['hooved'] && eventActive('fool',2023)){
                    value = 5;
                }
                return sizeApproximation(value,2);
            },
            namespace(val){
                return val.replace("_", " ");
            },
            resRate(n){
                let diff = sizeApproximation(global.resource[n].diff,2);
                return `${global.resource[name].name} ${diff} per second`;
            },
            trigModal(){
                this.$buefy.modal.open({
                    hasModalCard: false,
                    customClass: 'evolve-modal',
                    content: '<div id="modalBox" class="modalBox"></div>',
                    onCancel: () => {
                        // Modal closed
                    }
                });
                
                var checkExist = setInterval(function(){
                   if ($('#modalBox').length > 0) {
                      clearInterval(checkExist);
                      drawModal(name,color);
                   }
                }, 50);
            },
            showTrigger(){
                return global.resource.Crates.display;
            },
            craft(res,vol){
                if (!global.race['no_craft']){
                    let craft_bonus = craftingRatio(res,'manual').multiplier;
                    let craft_costs = craftCost(true);
                    let volume = Math.floor(global.resource[craft_costs[res][0].r].amount / craft_costs[res][0].a);
                    for (let i=1; i<craft_costs[res].length; i++){
                        let temp = Math.floor(global.resource[craft_costs[res][i].r].amount / craft_costs[res][i].a);
                        if (temp < volume){
                            volume = temp;
                        }
                    }
                    if (vol !== 'A'){
                        let total = vol * keyMultiplier();
                        if (total < volume){
                            volume = total;
                        }
                    }
                    for (let i=0; i<craft_costs[res].length; i++){
                        let num = volume * craft_costs[res][i].a;
                        global.resource[craft_costs[res][i].r].amount -= num;
                    }
                    global.resource[res].amount += volume * craft_bonus;
                }
            },
            craftCost(res,vol){
                let costs = '';
                let craft_costs = craftCost(true);
                for (let i=0; i<craft_costs[res].length; i++){
                    let num = vol * craft_costs[res][i].a * keyMultiplier();
                    costs = costs + `<div>${global.resource[craft_costs[res][i].r].name} ${num}</div>`;
                }
                return costs;
            },
            toggle(res){
                if (global.settings.resBar[res]){
                    global.settings.resBar[res] = false;
                    $(`#res${name}`).removeClass('showBar');
                }
                else {
                    global.settings.resBar[res] = true;
                    $(`#res${name}`).addClass('showBar');
                }
                global.resource[name]['bar'] = global.settings.resBar[name];
            }
        }
    });

    breakdownPopover(`cnt${name}`,name,'c');

    if (infopops){
        let inc = [1,5,'A'];
        for (let i=0; i<inc.length; i++){
            let extra = function(){
                let popper = $(`<div></div>`);
                let res = name;
                let vol = inc[i];
                let bonus = +(craftingRatio(res,'manual').multiplier * 100).toFixed(0);
                popper.append($(`<div class="has-text-info">${loc('manual_crafting_hover_bonus',[bonus.toLocaleString(),global.resource[res].name])}</div>`));
                
                let craft_costs = craftCost(true);
                let crafts = $(`<div><span class="has-text-success">${loc('manual_crafting_hover_craft')} </span></div>`);
                let num_crafted = 0;
                if (typeof vol !== 'number'){
                    num_crafted = global.resource[craft_costs[res][0].r].amount / craft_costs[res][0].a;
                    if (craft_costs[res].length > 1){
                        for (let i=1; i<craft_costs[res].length; i++){
                            let curr_max = global.resource[craft_costs[res][i].r].amount / craft_costs[res][i].a;
                            if (curr_max < num_crafted){
                                num_crafted = curr_max;
                            }
                        }
                    }
                    crafts.append($(`<span class="has-text-advanced">${sizeApproximation((bonus / 100) * num_crafted,1)} ${global.resource[res].name}</span>`));
                }
                else {
                    num_crafted = keyMultiplier() * vol;
                    let total_crafted = sizeApproximation((bonus / 100) * num_crafted,1);
                    crafts.append($(`<span class="has-text-advanced"><span class="craft" data-val="${(sizeApproximation((bonus / 100) * vol))}">${total_crafted}</span> ${global.resource[res].name}</span>`));
                }
                let costs = $(`<div><span class="has-text-danger">${loc('manual_crafting_hover_use')} </span></div>`);
                for (let i=0; i<craft_costs[res].length; i++){
                    costs.append($(`<span class="craft-elm has-text-caution">${sizeApproximation(num_crafted * craft_costs[res][i].a,1)} ${global.resource[craft_costs[res][i].r].name}</span>`));
                    if (i + 1 < craft_costs[res].length){
                        costs.append($(`<span>, </span>`));
                    }
                }
                popper.append(crafts);
                popper.append(costs);
                
                return popper;
            }
            
            craftingPopover(`inc${name}${inc[i]}`,name,'manual',extra);
        }
    }

    if (stackable){
        popover(`con${name}`,function(){
            var popper = $(`<div>${loc('resource_Crates_plural')} ${global.resource[name].crates}</div>`);
            if (global.tech['steel_container']){
                popper.append($(`<div>${loc('resource_Containers_plural')} ${global.resource[name].containers}</div>`));
            }
            return popper;
        });
    }

    if ((name !== global.race.species || global.race['fasting']) && name !== 'Crates' && name !== 'Containers' && max !== -1){
        breakdownPopover(`inc${name}`,name,'p');
    }
    else if (max === -1){
        craftingPopover(`inc${name}`,name,'auto');
    }

    $(`#res${name}`).on('mouseover',function(){
        $(`.res-${name}`).each(function(){
            if (global.resource[name].amount >= $(this).attr(`data-${name}`)){
                $(this).addClass('hl-ca');
            }
            else {
                $(this).addClass('hl-cna');
            }
        });
    });
    $(`#res${name}`).on('mouseout',function(){
        $(`.res-${name}`).each(function(){
            $(this).removeClass('hl-ca');
            $(this).removeClass('hl-cna');
        });
    });

    if (typeof tmp_vars['resource'] === 'undefined'){
        tmp_vars['resource'] = {};
    }

    tmp_vars.resource[name] = {
        color: color,
        tradable: tradable,
        stackable: stackable,
        temp_max: 0
    };
}

export function setResourceName(name){
    if (name === global.race.species){
        global.resource[name].name = flib('name');
    }
    else {
        global.resource[name].name = name === 'Money' ? '$' : loc(`resource_${name}_name`);
    }

    if (name === 'Useless'){
        if (!global.resource.Lumber.display){
            global.resource.Useless.name = loc('resource_Lumber_name');
        }
        else if (!global.resource.Chrysotile.display){
            global.resource.Useless.name = loc('resource_Chrysotile_name');
        }
        else if (!global.resource.Crystal.display){
            global.resource.Useless.name = loc('resource_Crystal_name');
        }
        else {
            global.resource.Useless.name = loc('resource_Bronze_name');
        }
    }
    
    if (eventActive('fool',2022)){
        switch(name){
            case 'Lumber':
                global['resource'][name].name = loc('resource_Stone_name');
                break;
            case 'Stone':
                global['resource'][name].name = loc('resource_Lumber_name');
                break;
            case 'Copper':
                global['resource'][name].name = loc('resource_Iron_name');
                break;
            case 'Iron':
                global['resource'][name].name = loc('resource_Copper_name');
                break;
            case 'Steel':
                global['resource'][name].name = loc('resource_Titanium_name');
                break;
            case 'Titanium':
                global['resource'][name].name = loc('resource_Steel_name');
                break;
            case 'Coal':
                global['resource'][name].name = loc('resource_Oil_name');
                break;
            case 'Oil':
                global['resource'][name].name = loc('resource_Coal_name');
                break;
            case 'Alloy':
                global['resource'][name].name = loc('resource_Polymer_name');
                break;
            case 'Polymer':
                global['resource'][name].name = loc('resource_Alloy_name');
                break;
            case 'Graphene':
                global['resource'][name].name = loc('resource_Stanene_name');
                break;
            case 'Stanene':
                global['resource'][name].name = loc('resource_Graphene_name');
                break;
            case 'Plywood':
                global['resource'][name].name = loc('resource_Brick_name');
                break;
            case 'Brick':
                global['resource'][name].name = loc('resource_Plywood_name');
                break;
            case 'Genes':
                global['resource'][name].name = loc('resource_Soul_Gem_name');
                break;
            case 'Soul_Gem':
                global['resource'][name].name = loc('resource_Genes_name');
                break;
            case 'Slave':
                global['resource'][name].name = loc('resource_Peon_name');
                break;
        }
    }

    if (name === 'Horseshoe'){
        global.resource[name].name = hoovedRename();
    }

    if (global.race['artifical']){
        if (name === 'Genes'){
            global.resource[name].name = loc(`resource_Program_name`);
        }
    }

    if (global.race['sappy']){
        switch(name){
            case 'Stone':
                global['resource'][name].name = loc('resource_Amber_name');
                break;
        }
    }
    else if (global.race['flier']){
        switch(name){
            case 'Stone':
                global['resource'][name].name = loc('resource_Clay_name');
                break;
            case 'Brick':
                global['resource'][name].name = loc('resource_Mud_Brick_name');
                break;
        }
    }

    if (global.race['soul_eater']){
        switch(name){
            case 'Food':
                global['resource'][name].name = loc('resource_Souls_name');
                break;
        }
    }

    if (global.race['evil']){
        switch(name){
            case 'Lumber':
                global['resource'][name].name = loc('resource_Bones_name');
                break;
            case 'Furs':
                global['resource'][name].name = loc('resource_Flesh_name');
                break;
            case 'Plywood':
                global['resource'][name].name = loc('resource_Boneweave_name');
                break;
        }
    }

    if (global.race['artifical']){
        switch(name){
            case 'Food':
                global['resource'][name].name = loc('resource_Signal_name');
                break;
        }
    }

    let genusType = races[global.race.species].type === 'hybrid' ? global.race.maintype : races[global.race.species].type;
    if (genusType === 'reptilian'){
        switch(name){
            case 'Furs':
                global['resource'][name].name = loc('resource_Scales_name');
                break;
        }
    }

    if (global.city.biome === 'ashland'){
        switch(name){
            case 'Cement':
                global['resource'][name].name = loc('resource_Ashcrete_name');
                break;
        }
    }

    if (global.city.universe === 'antimatter'){
        switch(name){
            case 'Positronium':
                global['resource'][name].name = loc('resource_Electronium_name');
                break;
        }
    }

    let hallowed = eventActive('halloween');
    if (hallowed.active){
        switch(name){
            case 'Food':
                global['resource'][name].name = loc('resource_Candy_name');
                break;
            case 'Lumber':
                global['resource'][name].name = loc('resource_Bones_name');
                break;
            case 'Stone':
                global['resource'][name].name = loc('resource_RockCandy_name');
                break;
            case 'Furs':
                global['resource'][name].name = loc('resource_Webs_name');
                break;
            case 'Plywood':
                global['resource'][name].name = loc('resource_Boneweave_name');
                break;
            case 'Brick':
                global['resource'][name].name = loc('resource_Tombstone_name');
                break;
            case 'Soul_Gem':
                global['resource'][name].name = loc('resource_CandyCorn_name');
                break;
            case 'Slave':
                global['resource'][name].name = loc('events_halloween_ghoul');
                break;
        }
    }
}

function loadSpecialResource(name,color) {
    if ($(`#res${name}`).length){
        let bind = $(`#res${name}`);
        bind.detach();
        $('#resources').append(bind);
        return;
    }
    color = color || 'special';

    var res_container = $(`<div id="res${name}"><div class="resource" v-show="count"><div><span class="res has-text-${color}">${loc(`resource_${name}_name`)}</span><span class="count">{{ round(count) }}</span></div></div></div>`);
    $('#resources').append(res_container);

    vBind({
        el: `#res${name}`,
        data: global.prestige[name],
        methods: {
            round(n){ return n ? sizeApproximation(n, 3, false, true) : n; }
        }
    });

    if (name === "Artifact" || name === "Blood_Stone"){
        return;
    }

    popover(`res${name}`, function(){
        let desc = $(`<div></div>`);
        switch (name){
            case 'Plasmid':
                {
                    let potential = global.race.p_mutation + (global.race['wish'] && global.race['wishStats'] ? global.race.wishStats.plas : 0);
                    let active = global.race['no_plasmid'] ? Math.min(potential, global.prestige.Plasmid.count) : global.prestige.Plasmid.count;
                    desc.append($(`<span>${loc(`resource_${name}_desc`,[active, +(plasmidBonus('plasmid') * 100).toFixed(2)])}</span>`));
                    if (global.genes['store'] && (global.race.universe !== 'antimatter' || global.genes['bleed'] >= 3)){
                        let plasmidSpatial = spatialReasoning(1,'plasmid');
                        if (plasmidSpatial > 1){
                            desc.append($(`<span> ${loc(`resource_Plasmid_desc2`,[+((plasmidSpatial - 1) * 100).toFixed(2)])}</span>`));
                        }   
                    }
                }
                break;
    
            case 'AntiPlasmid':
                {
                    desc.append($(`<span>${loc(`resource_${name}_desc`,[global.prestige.AntiPlasmid.count, +(plasmidBonus('antiplasmid') * 100).toFixed(2)])}</span>`));
                    let antiSpatial = spatialReasoning(1,'anti');
                    if (global.genes['store'] && (global.race.universe === 'antimatter' || global.genes['bleed'] >= 3)){
                        if (antiSpatial > 1){
                            desc.append($(`<span> ${loc(`resource_Plasmid_desc2`,[+((antiSpatial - 1) * 100).toFixed(2)])}</span>`));
                        }
                    }
                }
                break;
    
            case 'Phage':
                {
                    desc.append($(`<span>${loc(global.prestige.AntiPlasmid.count > 0 ? `resource_Phage_desc2` : `resource_Phage_desc`,[250 + global.prestige.Phage.count])}</span>`));
                    let phageSpatial = spatialReasoning(1,'phage');
                    if (global.genes['store'] && global.genes['store'] >= 4){
                        if (phageSpatial > 1){
                            desc.append($(`<span> ${loc(`resource_Plasmid_desc2`,[+((phageSpatial - 1) * 100).toFixed(2)])}</span>`));
                        }
                    }
                }
                break;
    
            case 'Dark':
                {
                    switch (global.race.universe){
                        case 'standard':
                            desc.append($(`<span>${loc(`resource_${name}_desc_s`,[+((darkEffect('standard') - 1) * 100).toFixed(2)])}</span>`));
                            break;
        
                        case 'evil':
                            desc.append($(`<span>${loc(`resource_${name}_desc_e`,[+((darkEffect('evil') - 1) * 100).toFixed(2),+((darkEffect('evil',true) - 1) * 100).toFixed(2)])}</span>`));
                            break;
        
                        case 'micro':
                            desc.append($(`<span>${loc(`resource_${name}_desc_m`,[darkEffect('micro',false),darkEffect('micro',true)])}</span>`));
                            break;
        
                        case 'heavy':
                            let hDE = darkEffect('heavy');
                            let space = 0.25 + (0.5 * hDE);
                            let int = 0.2 + (0.3 * hDE);
                            desc.append($(`<span>${loc(`resource_${name}_desc_h`,[+(space * 100).toFixed(4),+(int * 100).toFixed(4)])}</span>`));
                            break;
        
                        case 'antimatter':
                            desc.append($(`<span>${loc(`resource_${name}_desc_a`,[+((darkEffect('antimatter') - 1) * 100).toFixed(2)])}</span>`));
                            break;

                        case 'magic':
                            desc.append($(`<span>${loc(`resource_${name}_desc_mg`,[loc('resource_Mana_name'),+((darkEffect('magic') - 1) * 100).toFixed(2)])}</span>`));
                            break;
                    }
                }
                break;
    
            case 'Harmony':
                desc.append($(`<span>${loc(`resource_${name}_desc`,[global.race.universe === 'standard' ? 0.1 : 1, harmonyEffect()])}</span>`));
                break;

            case 'AICore':
                {
                    let bonus = +((1 - (0.99 ** global.prestige.AICore.count)) * 100).toFixed(2);
                    desc.append($(`<span>${loc(`resource_${name}_desc`,[bonus])}</span>`));
                }
                break;

            case 'Supercoiled':
                {
                    let coiled = global.prestige.Supercoiled.count;
                    let bonus = (coiled / (coiled + 5000)) * 100;
                    desc.append($(`<span>${loc(`resource_${name}_desc`,[+bonus.toFixed(2)])}</span>`));
                    if (global.genes.hasOwnProperty('trader') && global.genes.trader >= 2){
                        let trade = (coiled / (coiled + 500)) * 100;
                        desc.append($(`<span> ${loc(`resource_${name}_trade_desc`,[+trade.toFixed(2)])}</span>`));
                    }
                }
                break;

            case 'TALENs':
                {
                    let talens = global.prestige.TALENs.count;
                    desc.append($(`<span>${loc(`resource_${name}_desc`)}</span>`));
                }
                break;

            case 'Exons':
                {
                    let exons = global.prestige.Exons.count;
                    desc.append($(`<span>${loc(`resource_${name}_desc`)}</span>`));
                }
                break;
        }
        return desc;
    });
}

// Mobile Market route multiplier; desktop uses the keyboard multiplier.
let mobileRouteMultiplier = 1;
function marketRouteMultiplier(){
    return window.innerWidth <= 768 ? mobileRouteMultiplier : keyMultiplier();
}

function loadMarketRouteMultiplier(){
    const picker = $(
        '<div id="marketRouteMultiplier" class="marketRouteMultiplier" role="radiogroup" aria-label="' + loc('resource_market_routes') + '">' +
            '<button role="radio" :aria-checked="multiplier === 1" :class="multiplier === 1 ? &quot;is-selected has-text-warning&quot; : &quot;&quot;" @click="set(1)">1X</button>' +
            '<button role="radio" :aria-checked="multiplier === 5" :class="multiplier === 5 ? &quot;is-selected has-text-warning&quot; : &quot;&quot;" @click="set(5)">5X</button>' +
            '<button role="radio" :aria-checked="multiplier === 10" :class="multiplier === 10 ? &quot;is-selected has-text-warning&quot; : &quot;&quot;" @click="set(10)">10X</button>' +
            '<button role="radio" :aria-checked="multiplier === 25" :class="multiplier === 25 ? &quot;is-selected has-text-warning&quot; : &quot;&quot;" @click="set(25)">25X</button>' +
            '<button role="radio" :aria-checked="multiplier === 100" :class="multiplier === 100 ? &quot;is-selected has-text-warning&quot; : &quot;&quot;" @click="set(100)">100X</button>' +
        '</div>'
    );
    $('#market').append(picker);
    vBind({
        el: '#marketRouteMultiplier',
        data: { multiplier: mobileRouteMultiplier },
        methods: {
            set(multiplier){
                mobileRouteMultiplier = multiplier;
                this.multiplier = multiplier;
            }
        }
    });
}

// Mobile Storage multiplier for crate and container actions.
let mobileStorageMultiplier = 1;
function storageMultiplier(){
    return window.innerWidth <= 768 ? mobileStorageMultiplier : keyMultiplier();
}

function loadStorageMultiplier(){
    const picker = $(
        '<div id="storageMultiplier" class="storageMultiplier" role="radiogroup" aria-label="' + loc('tab_storage') + '">' +
            '<button role="radio" :aria-checked="multiplier === 1" :class="multiplier === 1 ? &quot;is-selected has-text-warning&quot; : &quot;&quot;" @click="set(1)">1X</button>' +
            '<button role="radio" :aria-checked="multiplier === 5" :class="multiplier === 5 ? &quot;is-selected has-text-warning&quot; : &quot;&quot;" @click="set(5)">5X</button>' +
            '<button role="radio" :aria-checked="multiplier === 10" :class="multiplier === 10 ? &quot;is-selected has-text-warning&quot; : &quot;&quot;" @click="set(10)">10X</button>' +
            '<button role="radio" :aria-checked="multiplier === 25" :class="multiplier === 25 ? &quot;is-selected has-text-warning&quot; : &quot;&quot;" @click="set(25)">25X</button>' +
            '<button role="radio" :aria-checked="multiplier === 100" :class="multiplier === 100 ? &quot;is-selected has-text-warning&quot; : &quot;&quot;" @click="set(100)">100X</button>' +
        '</div>'
    );
    $('#resStorage').append(picker);
    vBind({
        el: '#storageMultiplier',
        data: { multiplier: mobileStorageMultiplier },
        methods: {
            set(multiplier){
                mobileStorageMultiplier = multiplier;
                this.multiplier = multiplier;
            }
        }
    });
}

function exportRouteEnabled(route){
    let routeCap = global.tech.currency >= 6 ? -1000000 : (global.tech.currency >= 4 ? -100 : -25);
    if (global.race['banana']){
        let exporting = false;
        Object.keys(global.resource).forEach(function(res){
            if (global.resource[res].hasOwnProperty('trade') && global.resource[res].trade < 0){
                exporting = res;
            }
        });
        if (exporting && exporting !== route){
            return false;
        }
        routeCap = global.tech.currency >= 6 ? -1000000 : (global.tech.currency >= 4 ? -25 : -10);
    }
    if (global.resource[route].trade <= routeCap){
        return false;
    }
    return true;
}

function importRouteEnabled(route){
    let routeCap = global.tech.currency >= 6 ? 1000000 : (global.tech.currency >= 4 ? 100 : 25);
    if (global.resource[route].trade >= routeCap){
        return false;
    }
    return true;
}

// --- The black market ----------------------------------------------------------------------------
// Routes deliver resources to individual supply zones.

// Available resources that are known to the civilization.
export function blackMarketable(){
    return Object.keys(black_market_values).filter(res => global.resource[res] && global.resource[res].display);
}

// Price multiplier based on this zone's shortage and storage level.
export function blackMarketRate(res, pool){
    const held = regAmount(res, pool);
    const cap = regMax(res, pool);
    const perDay = (regDiff(res)[pool] || 0) * 5;
    let mult = 1;
    if (perDay < 0){
        // Shortages raise prices as reserves run down.
        const days = held / -perDay;
        mult *= 1 + Math.min(1.5, Math.max(0, (30 - days) / 30) * 1.5);
    }
    if (cap > 0){
        // Full stores reduce demand.
        mult *= 1 - Math.min(0.4, Math.max(0, (held / cap) - 0.5) * 0.8);
    }
    return +Math.max(0.6, Math.min(2.5, mult)).toFixed(3);
}

export function blackMarketPrice(res, pool){
    const entry = black_market_values[res];
    if (!entry){ return 0; }
    let price = entry.p * blackMarketRate(res, pool);
    // The pressures that move the open market move this one too.
    if (global.race['inflation']){ price *= 1 + (global.race.inflation / 300); }
    return +price.toFixed(1);
}

// How much more a route carries than the bare rate, from everything the civilisation brings to a
// bargain: a merchant's tongue, a governor's dealmaking, the right stars. Shared by both markets so
// the two cannot come to disagree about what a trader is worth.
export function tradeVolumeBonus(){
    let rate = 1;
    const dealVal = govActive('dealmaker',0);
    if (dealVal){ rate *= 1 + (dealVal / 100); }
    if (global.race['persuasive']){
        rate *= 1 + (geneVars('persuasive')[0] * global.race['persuasive'] / 100);
    }
    if (global.race['merchant']){
        rate *= 1 + (traits.merchant.vars()[1] / 100);
    }
    if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.c){
        rate *= 1 + ((70 * (traits.ocular_power.vars()[1] / 100)) / 100);
    }
    const fathom = fathomCheck('goblin');
    if (fathom > 0){
        rate *= 1 + (traits.merchant.vars(1)[1] / 100 * fathom);
    }
    if (astrologySign() === 'capricorn'){
        rate *= 1 + (astroVal('capricorn')[0] / 100);
    }
    if (global.race['devious']){
        rate *= 1 - (traits.devious.vars()[0] / 100);
    }
    if (global.genes['trader']){
        rate *= 1 + (calc_mastery() / 100);
        if (global.genes.trader >= 2){
            const coiled = global.prestige.Supercoiled.count;
            rate *= 1 + (coiled / (coiled + 500));
        }
    }
    if (global.stats.achieve.hasOwnProperty('trade')){
        rate *= 1 + (Math.min(10, global.stats.achieve.trade.l * 2) / 100);
    }
    if (global.race['truepath'] && !rivalCollapsed()){
        rate *= 1 - (global.civic.foreign.gov3.hstl / 101);
    }
    return rate;
}

// What one route brings in. The smugglers are traders like any other, so a silver tongue buys as much
// from them as it does on the open market.
export function blackMarketVolume(res){
    return black_market_values[res] ? black_market_values[res].v * tradeVolumeBonus() : 0;
}

// Route assignments are tracked separately for each supply zone.
export function bmLedger(){
    if (!global.city.market['bm']){ global.city.market['bm'] = {}; }
    return global.city.market.bm;
}

export function bmRoutes(res, pool){
    const bm = bmLedger();
    return bm[pool] && bm[pool][res] ? bm[pool][res] : 0;
}

export function bmUsed(){
    const bm = bmLedger();
    let n = 0;
    for (const pool in bm){ for (const res in bm[pool]){ n += bm[pool][res]; } }
    return n;
}

export function bmAdjust(res, pool, delta){
    const bm = bmLedger();
    if (!bm[pool]){ bm[pool] = {}; }
    const now = bm[pool][res] || 0;
    let next = now + delta;
    if (next > now){
        // Respect the shared route limit.
        next = now + Math.min(delta, Math.max(0, global.city.market.mtrade - bmUsed()));
    }
    if (next <= 0){ delete bm[pool][res]; }
    else { bm[pool][res] = next; }
    global.city.market.trade = bmUsed();
    return bm[pool][res] || 0;
}

// Build the zone selector and available resource offers.
export function loadBlackMarket(){
    clearElement($('#market'));
    const host = $('#market');
    const zones = supplyPools();
    if (!zones.length){ return; }
    if (!global.city.market['bmZone'] || !zones.includes(global.city.market.bmZone)){
        global.city.market.bmZone = zones[0];
    }

    host.append($(`<div id="bmZone" class="bmZone">
        <span role="button" aria-label="${loc('supply_switch_prev')}" class="sub has-text-danger" @click="cycle(-1)"><span>&laquo;</span></span>
        <span class="viewing has-text-warning">{{ zoneName() }}</span>
        <span role="button" aria-label="${loc('supply_switch_next')}" class="add has-text-success" @click="cycle(1)"><span>&raquo;</span></span>
        <span class="bmNote">${loc('resource_black_market_note')}</span>
    </div>`));
    vBind({
        el: '#bmZone',
        data: global.city.market,
        methods: {
            zoneName(){ return supplyRegionName(global.city.market.bmZone); },
            cycle(step){
                const at = zones.indexOf(global.city.market.bmZone);
                global.city.market.bmZone = zones[(at + step + zones.length) % zones.length];
                drawResourceTab('market');
            }
        }
    });
    host.append($('<div id="blackMarketBoard" class="blackMarketBoard"></div>'));
    const board = $('#blackMarketBoard');

    blackMarketable().forEach(function(res){
        const id = `bm-${res}`;
        board.append($(`<div id="${id}" class="market-item bmRow">
            <h3 class="res has-text-${tmp_vars.resource[res] ? tmp_vars.resource[res].color : 'info'}">{{ name() }}</h3>
            <span class="bmPrice">\${{ price() }}</span>
            <span class="bmVolume">{{ volume() }}</span>
            <span class="trade">
                <span role="button" aria-label="fewer ${global.resource[res].name} routes" class="sub has-text-danger" @click="less()"><span>-</span></span>
                <span class="current">{{ routes() }}</span>
                <span role="button" aria-label="more ${global.resource[res].name} routes" class="add has-text-success" @click="more()"><span>+</span></span>
                <span role="button" class="zero has-text-advanced" @click="none()">${loc('cancel_routes')}</span>
            </span>
        </div>`));
        vBind({
            el: `#${id}`,
            data: global.city.market,
            methods: {
                name(){ return global.resource[res].name.replace('_',' '); },
                price(){ return sizeApproximation(blackMarketPrice(res, global.city.market.bmZone), 1); },
                volume(){ return loc('resource_black_market_volume',[+(blackMarketVolume(res)).toFixed(2)]); },
                routes(){ return bmRoutes(res, global.city.market.bmZone); },
                more(){ bmAdjust(res, global.city.market.bmZone, marketRouteMultiplier()); },
                less(){ bmAdjust(res, global.city.market.bmZone, -marketRouteMultiplier()); },
                none(){ bmAdjust(res, global.city.market.bmZone, -bmRoutes(res, global.city.market.bmZone)); }
            }
        });
    });

    tradeSummery();
    // Remove open-market rows mounted after the Black Market board.
    const ownPanel = () => $('#market').children('.market-item').not('.bmRow').not('#tradeTotal').remove();
    ownPanel();
    setTimeout(ownPanel, 0);
}

export function marketItem(mount,market_item,name,color,full){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
        return;
    }

    if ((global.race['artifical'] || global.race['fasting']) && name === 'Food'){
        return;
    }

    if (full){
        market_item.append($(`<h3 class="res has-text-${color}">{{ namespace(r.name) }}</h3>`));
    }

    if (!global.race['no_trade']){
        market_item.append($(`<span class="buy"><span class="has-text-success">${loc('resource_market_buy')}</span></span>`));
        market_item.append($(`<span role="button" class="order" @click="purchase('${name}')">\${{ buy(r.value) }}</span>`));
        
        market_item.append($(`<span class="sell"><span class="has-text-danger">${loc('resource_market_sell')}</span></span>`));
        market_item.append($(`<span role="button" class="order" @click="sell('${name}')">\${{ sell_f(r.value) }}</span>`));
    }

    if (full && ((global.race['banana'] && name === 'Food') || (global.tech['trade'] && !global.race['terrifying']))){
        let trade = $(`<span class="trade" v-show="m.active"><span class="has-text-warning">${loc('resource_market_routes')}</span></span>`);
        market_item.append(trade);
        trade.append($(`<b-tooltip :label="aSell('${name}')" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="export ${global.resource[name].name}" class="sub has-text-danger" @click="autoSell('${name}')"><span>-</span></span></b-tooltip>`));
        trade.append($(`<span class="current" v-html="trade(r.trade)"></span>`));
        trade.append($(`<b-tooltip :label="aBuy('${name}')" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="import ${global.resource[name].name}" class="add has-text-success" @click="autoBuy('${name}')"><span>+</span></span></b-tooltip>`));
        trade.append($(`<span role="button" class="zero has-text-advanced" @click="zero('${name}')">${loc('cancel_routes')}</span>`));
        tradeRouteColor(name);
    }
    
    vBind({
        el: mount,
        data: { 
            r: global.resource[name],
            m: global.city.market
        },
        methods: {
            aSell(res){
                let unit = tradeRatio[res] === 1 ? loc('resource_market_unit') : loc('resource_market_units');
                let price = tradeSellPrice(res);
                let rate = tradeRatio[res];
                if (global.stats.achieve.hasOwnProperty('trade')){
                    let rank = global.stats.achieve.trade.l;
                    if (rank > 5){ rank = 5; }
                    rate *= 1 - (rank / 100);
                }
                rate = +(rate).toFixed(3);
                return loc('resource_market_auto_sell_desc',[rate,unit,price]);
            },
            aBuy(res){
                let rate = tradeRatio[res];
                let dealVal = govActive('dealmaker',0);
                if (dealVal){
                    rate *= 1 + (dealVal / 100);
                }
                if (global.race['persuasive']){
                    rate *= 1 + (geneVars('persuasive')[0] * global.race['persuasive'] / 100);
                }
                if (astroSign === 'capricorn'){
                    rate *= 1 + (astroVal('capricorn')[0] / 100);
                }
                if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.c){
                    let trade = 70 * (traits.ocular_power.vars()[1] / 100);
                    rate *= 1 + (trade / 100);
                }
                if (global.race['devious']){
                    rate *= 1 - (traits.devious.vars()[0] / 100);
                }
                if (global.race['merchant']){
                    rate *= 1 + (traits.merchant.vars()[1] / 100);
                }
                let fathom = fathomCheck('goblin');
                if (fathom > 0){
                    rate *= 1 + (traits.merchant.vars(1)[1] / 100 * fathom);
                }
                if (global.genes['trader']){
                    let mastery = calc_mastery();
                    rate *= 1 + (mastery / 100);
                }
                if (global.stats.achieve.hasOwnProperty('trade')){
                    let rank = global.stats.achieve.trade.l;
                    if (rank > 5){ rank = 5; }
                    rate *= 1 + (rank / 50);
                }
                if (global.race['truepath'] && !rivalCollapsed()){
                    rate *= 1 - (global.civic.foreign.gov3.hstl / 101);
                }
                rate = +(rate).toFixed(3);
                let unit = rate === 1 ? loc('resource_market_unit') : loc('resource_market_units');
                let price = tradeBuyPrice(res);
                return loc('resource_market_auto_buy_desc',[rate,unit,price]);
            },
            purchase(res){
                if (!global.race['no_trade'] && !global.settings.pause){
                    let qty = global.city.market.qty;
                    let value = global.resource[res].value;
                    if (global.race['arrogant']){
                        value *= 1 + (traits.arrogant.vars()[0] / 100);
                    }
                    if (global.race['conniving']){
                        value *= 1 - (traits.conniving.vars()[0] / 100);
                    }
                    let fathom = fathomCheck('imp');
                    if (fathom > 0){
                        value *= 1 - (traits.conniving.vars(1)[0] / 100 * fathom);
                    }
                    let amount = Math.floor(Math.min(qty, global.resource.Money.amount / value,
                      global.resource[res].max - global.resource[res].amount));
                    if (amount > 0){
                        global.resource[res].amount += amount;
                        global.resource.Money.amount -= Math.round(value * amount);

                        global.resource[res].value += Number((amount / Math.rand(1000,10000)).toFixed(2));
                    }
                }
            },
            sell(res){
                if (!global.race['no_trade'] && !global.settings.pause){
                    let qty = global.city.market.qty;
                    let divide = 4;
                    if (global.race['merchant']){
                        divide *= 1 - (traits.merchant.vars()[0] / 100);
                    }
                    let gobFathom = fathomCheck('goblin');
                    if (gobFathom > 0){
                        divide *= 1 - (traits.merchant.vars(1)[0] / 100 * gobFathom);
                    }
                    if (global.race['asymmetrical']){
                        divide *= 1 + (traits.asymmetrical.vars()[0] / 100);
                    }
                    if (global.race['conniving']){
                        divide *= 1 - (traits.conniving.vars()[1] / 100);
                    }
                    let impFathom = fathomCheck('imp');
                    if (impFathom > 0){
                        divide *= 1 - (traits.conniving.vars(1)[1] / 100 * impFathom);
                    }
                    let price = global.resource[res].value / divide;
                    let amount = Math.floor(Math.min(qty, global.resource[res].amount,
                      (global.resource.Money.max - global.resource.Money.amount) / price));
                    if (amount > 0) {
                        global.resource[res].amount -= amount;
                        global.resource.Money.amount += Math.round(price * amount);

                        global.resource[res].value -= Number((amount / Math.rand(1000,10000)).toFixed(2));
                        if (global.resource[res].value < Number(resource_values[res] / 2)){
                            global.resource[res].value = Number(resource_values[res] / 2);
                        }
                    }
                }
            },
            autoBuy(res, keyMult = marketRouteMultiplier()){
                for (let i=0; i<keyMult; i++){
                    if (govActive('dealmaker',0)){
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
                        if (exporting <= importing){
                            break;
                        }
                    }
                    if (global.resource[res].trade >= 0){
                        if (importRouteEnabled(res) && global.city.market.trade < global.city.market.mtrade){
                            global.city.market.trade++;
                            global.resource[res].trade++;
                        }
                        else {
                            break;
                        }
                    }
                    else {
                        global.city.market.trade--;
                        global.resource[res].trade++;
                    }
                }
                tradeRouteColor(res);
            },
            autoSell(res, keyMult = marketRouteMultiplier()){
                for (let i=0; i<keyMult; i++){
                    if (global.resource[res].trade <= 0){
                        if (exportRouteEnabled(res) && global.city.market.trade < global.city.market.mtrade){
                            global.city.market.trade++;
                            global.resource[res].trade--;
                        }
                        else {
                            break;
                        }
                    }
                    else {
                        global.city.market.trade--;
                        global.resource[res].trade--;
                    }
                }
                tradeRouteColor(res);
            },
            zero(res){
                if (global.resource[res].trade > 0){
                    this.autoSell(res, global.resource[res].trade);
                }
                else if (global.resource[res].trade < 0){
                    this.autoBuy(res, -global.resource[res].trade);
                }
            },
            buy(value){
                if (global.race['arrogant']){
                    value *= 1 + (traits.arrogant.vars()[0] / 100);
                }
                return sizeApproximation(value * global.city.market.qty,0);
            },
            sell_f(value){
                let divide = 4;
                if (global.race['merchant']){
                    divide *= 1 - (traits.merchant.vars()[0] / 100);
                }
                let fathom = fathomCheck('goblin');
                if (fathom > 0){
                    divide *= 1 - (traits.merchant.vars(1)[0] / 100 * fathom);
                }
                if (global.race['devious']){
                    divide *= 1 - (traits.devious.vars()[0] / 100);
                }
                if (global.race['asymmetrical']){
                    divide *= 1 + (traits.asymmetrical.vars()[0] / 100);
                }
                return sizeApproximation(value * global.city.market.qty / divide,0);
            },
            trade(val){
                if (name === 'Stone' && (val === 31 || val === -31)){
                    let trick = trickOrTreat(3,12,false);
                    if (trick.length > 0){
                        return trick;
                    }
                }
                if (val < 0){
                    val = 0 - val;
                    return `-${val}`;
                }
                else if (val > 0){
                    return `+${val}`;
                }
                else {
                    return 0;
                }
            },
            namespace(val){
                return val.replace("_", " ");
            }
        }
    });
}

function initGalaxyTrade(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
        return;
    }
    $('#galaxyTrade').remove();
    $('#market').append($(`<div id="galaxyTrade"><div v-show="t.xeno && t.xeno >= 5" class="gTrade market-header galaxyTrade"><h2 class="is-sr-only">${loc('galaxy_trade')}</h2></div></div>`));
    galacticTrade();
}

export function galaxyOffers(){
    let offers = [
        {
            buy: { res: 'Deuterium', vol: 5 },
            sell: { res: 'Helium_3', vol: 25 }
        },
        {
            buy: { res: 'Neutronium', vol: 2.5 },
            sell: { res: 'Copper', vol: 200 }
        },
        {
            buy: { res: 'Adamantite', vol: 3 },
            sell: { res: 'Iron', vol: 300 }
        },
        {
            buy: { res: 'Elerium', vol: 1 },
            sell: { res: 'Oil', vol: 125 }
        },
        {
            buy: { res: 'Nano_Tube', vol: 10 },
            sell: { res: 'Titanium', vol: 20 }
        },
        {
            buy: { res: 'Graphene', vol: 25 },
            sell: { res: global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? 'Chrysotile' : 'Stone') : 'Lumber', vol: 1000 }
        },
        {
            buy: { res: 'Stanene', vol: 40 },
            sell: { res: 'Aluminium', vol: 800 }
        },
        {
            buy: { res: 'Bolognium', vol: 0.75 },
            sell: { res: 'Uranium', vol: 4 }
        },
        {
            buy: { res: 'Vitreloy', vol: 1 },
            sell: { res: 'Infernite', vol: 1 }
        }
    ];
    return offers;
}

export function galacticTrade(modal){
    let galaxyTrade = modal ? modal : $(`#galaxyTrade .gTrade`);
    if (!modal){
        clearElement($(`#galaxyTrade .gTrade`));
    }

    if (global.galaxy['trade']){
        galaxyTrade.append($(`<div class="market-item trade-header"><span class="has-text-special">${loc('galaxy_trade')}</span></div>`));

        let offers = galaxyOffers();
        for (let i=0; i<offers.length; i++){
            let offer = $(`<div class="market-item trade-offer"></div>`);
            galaxyTrade.append(offer);

            offer.append($(`<span class="offer-item has-text-success">${global.resource[offers[i].buy.res].name}</span>`));
            offer.append($(`<span class="offer-vol has-text-advanced">+{{ t_vol('${i}') }}/s</span>`));
            
            offer.append($(`<span class="offer-item has-text-danger">${global.resource[offers[i].sell.res].name}</span>`));
            offer.append($(`<span class="offer-vol has-text-caution">-{{ s_vol('${i}') }}/s</span>`));

            let trade = $(`<span class="trade"><span class="has-text-warning">${loc('resource_market_routes')}</span></span>`);
            offer.append(trade);
            
            let assign = loc('galaxy_freighter_assign',[global.resource[offers[i].buy.res].name,global.resource[offers[i].sell.res].name]);
            let unassign = loc('galaxy_freighter_unassign',[global.resource[offers[i].buy.res].name,global.resource[offers[i].sell.res].name]);
            trade.append($(`<b-tooltip :label="desc('${unassign}')" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="${unassign}" class="sub has-text-danger" @click="less('${i}')"><span>-</span></span></b-tooltip>`));
            trade.append($(`<span class="current">{{ g.f${i} }}</span>`));
            trade.append($(`<b-tooltip :label="desc('${assign}')" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="${assign}" class="add has-text-success" @click="more('${i}')"><span>+</span></span></b-tooltip>`));
            trade.append($(`<span role="button" class="zero has-text-advanced" @click="zero('${i}')">${loc('cancel_routes')}</span>`));
        }

        let totals = $(`<div class="market-item trade-offer"><div id="galacticTradeTotal"><span class="tradeTotal"><span class="has-text-caution">${loc('resource_market_galactic_trade_routes')}</span> {{ g.cur }} / {{ g.max }}</span></div></div>`);
        totals.append($(`<span role="button" class="zero has-text-advanced" @click="zero()">${loc('cancel_all_routes')}</span>`));
        galaxyTrade.append(totals);
    }

    vBind({
            el: modal ? '#specialModal' : '#galaxyTrade',
            data: {
                g: global.galaxy.trade,
                t: global.tech
            },
            methods: {
            less(idx){
                let keyMutipler = keyMultiplier();
                if (global.galaxy.trade[`f${idx}`] >= keyMutipler){
                    global.galaxy.trade[`f${idx}`] -= keyMutipler;
                    global.galaxy.trade.cur -= keyMutipler;
                }
                else {
                    global.galaxy.trade.cur -= global.galaxy.trade[`f${idx}`];
                    global.galaxy.trade[`f${idx}`] = 0;
                }
            },
            more(idx){
                let keyMutipler = keyMultiplier();
                if (global.galaxy.trade.cur < global.galaxy.trade.max){
                    if (keyMutipler > global.galaxy.trade.max - global.galaxy.trade.cur){
                        keyMutipler = global.galaxy.trade.max - global.galaxy.trade.cur;
                    }
                    global.galaxy.trade[`f${idx}`] += keyMutipler;
                    global.galaxy.trade.cur += keyMutipler;
                }
            },
            zero(idx){
                if (idx){
                    global.galaxy.trade.cur -= global.galaxy.trade[`f${idx}`];
                    global.galaxy.trade[`f${idx}`] = 0;
                }
                else {
                    let offers = galaxyOffers();
                    for (let i=0; i<offers.length; i++){
                        global.galaxy.trade.cur -= global.galaxy.trade[`f${i}`];
                        global.galaxy.trade[`f${i}`] = 0;
                    }
                }
            },
            desc(s){
                return s; 
            },
            t_vol(idx){
                let offers = galaxyOffers();
                let buy_vol = offers[idx].buy.vol;
                if (global.race['persuasive']){
                    buy_vol *= 1 + (geneVars('persuasive')[0] * global.race['persuasive'] / 100);
                }
                if (global.race['devious']){
                    buy_vol *= 1 - (traits.devious.vars()[0] / 100);
                }
                if (global.race['merchant']){
                    buy_vol *= 1 + (traits.merchant.vars()[1] / 100);
                }
                let fathom = fathomCheck('goblin');
                if (fathom > 0){
                    buy_vol *= 1 + (traits.merchant.vars(1)[1] / 100 * fathom);
                }
                if (global.genes['trader']){
                    let mastery = calc_mastery();
                    buy_vol *= 1 + (mastery / 100);
                }
                if (global.stats.achieve.hasOwnProperty('trade')){
                    let rank = global.stats.achieve.trade.l;
                    if (rank > 5){ rank = 5; }
                    buy_vol *= 1 + (rank / 50);
                }
                buy_vol = +(buy_vol).toFixed(2);
                return buy_vol;
            },
            s_vol(idx){
                let offers = galaxyOffers();
                let sell_vol = offers[idx].sell.vol;
                if (global.stats.achieve.hasOwnProperty('trade')){
                    let rank = global.stats.achieve.trade.l;
                    if (rank > 5){ rank = 5; }
                    sell_vol *= 1 - (rank / 100);
                }
                sell_vol = +(sell_vol).toFixed(2);
                return sell_vol;
            }
        }
    });

    popover(`galacticTradeTotal`,function(){
        let bd = $(`<div class="resBreakdown"></div>`);
        if (breakdown.hasOwnProperty('gt_route')){
            Object.keys(breakdown.gt_route).forEach(function(k){
                if (breakdown.gt_route[k] > 0){
                    bd.append(`<div class="modal_bd"><span class="has-text-warning">${k}</span> <span>+${breakdown.gt_route[k]}</span></div>`);
                }
            });
        }
        bd.append(`<div class="modal_bd ${global.galaxy.trade.max > 0 ? 'sum' : ''}"><span class="has-text-caution">${loc('resource_market_galactic_trade_routes')}</span> <span>${global.galaxy.trade.max}</span></div>`);
        return bd;
    },{
        elm: `#galacticTradeTotal > span`
    });
}

// Resolve the pool used for storage-stack assignment.
function stackMod(res,field,pool,val){
    if (supplyMode() === 'global'){ return; }
    const ledger = field === 'crates' ? regCrates(res) : regContainers(res);
    const regions = poolRegions(pool || CAPITAL);
    if (val >= 0){
        // Assign new stacks to the pool’s primary region.
        const at = regions[0];
        ledger[at] = Math.max(0, (ledger[at] || 0) + val);
        return;
    }
    // Leaving one: taken off the world holding the most, so a shared store empties evenly rather
    // than stripping one of its members bare while the other keeps everything.
    let left = -val;
    for (const region of regions.slice().sort((a,b) => (ledger[b] || 0) - (ledger[a] || 0))){
        const take = Math.min(left, ledger[region] || 0);
        ledger[region] = (ledger[region] || 0) - take;
        left -= take;
        if (left <= 0){ break; }
    }
}

function unassignCrate(res,pool){
    let keyMutipler = storageMultiplier();
    let cap = crateValue();
    if (keyMutipler > stackHeld(res,'crates',pool)){
        keyMutipler = stackHeld(res,'crates',pool);
    }
    if (keyMutipler > 0){
        global.resource.Crates.amount += keyMutipler;
        global.resource.Crates.max += keyMutipler;
        global.resource[res].crates -= keyMutipler;
        global.resource[res].max -= (cap * keyMutipler);
        stackMod(res,'crates',pool,-keyMutipler);
    }
}

function assignCrate(res,pool){
    let keyMutipler = storageMultiplier();
    let cap = crateValue();
    if (keyMutipler > global.resource.Crates.amount){
        keyMutipler = global.resource.Crates.amount;
    }
    if (keyMutipler > 0){
        global.resource.Crates.amount -= keyMutipler;
        global.resource.Crates.max -= keyMutipler;
        global.resource[res].crates += keyMutipler;
        global.resource[res].max += (cap * keyMutipler);
        stackMod(res,'crates',pool,keyMutipler);
    }
}

function unassignContainer(res,pool){
    let keyMutipler = storageMultiplier();
    let cap = containerValue();
    if (keyMutipler > stackHeld(res,'containers',pool)){
        keyMutipler = stackHeld(res,'containers',pool);
    }
    if (keyMutipler > 0){
        global.resource.Containers.amount += keyMutipler;
        global.resource.Containers.max += keyMutipler;
        global.resource[res].containers -= keyMutipler;
        global.resource[res].max -= (cap * keyMutipler);
        stackMod(res,'containers',pool,-keyMutipler);
    }
}

function assignContainer(res,pool){
    let keyMutipler = storageMultiplier();
    let cap = containerValue();
    if (keyMutipler > global.resource.Containers.amount){
        keyMutipler = global.resource.Containers.amount;
    }
    if (keyMutipler > 0){
        global.resource.Containers.amount -= keyMutipler;
        global.resource.Containers.max -= keyMutipler;
        global.resource[res].containers += keyMutipler;
        global.resource[res].max += (cap * keyMutipler);
        stackMod(res,'containers',pool,keyMutipler);
    }
}

// Limit stack removal to the selected region’s assigned stacks.
export function stackHeld(res,field,pool){
    if (supplyMode() === 'global'){ return global.resource[res][field]; }
    const ledger = field === 'crates' ? regCrates(res) : regContainers(res);
    // Everything the store can draw on, which for two connected worlds is both their holdings —
    // the same reckoning the storage figure beside it is made on, so the two agree.
    let held = 0;
    for (const region of poolRegions(pool || CAPITAL)){ held += ledger[region] || 0; }
    return held;
}

// Keep only one regional resource breakdown expanded at a time.
let openStack = false;

export function containerItem(mount,market_item,name,color){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 1)){
        return;
    }

    // If global storage is not enabled the each resource gets a sub section for distribution.
    const zoned = supplyMode() !== 'global' && atomic_mass[name];
    let head = market_item;
    if (zoned){
        market_item.addClass('stacked');
        head = $(`<div role="button" class="stackHead" aria-label="show ${global.resource[name].name} distribution" @click="toggleZones"></div>`);
        market_item.append(head);
        head.append($(`<span class="expander has-text-warning" :aria-expanded="open()">{{ caret() }}</span>`));
        head.append($(`<h3 class="res has-text-${color}">{{ name }}</h3>`));
        head.append($(`<span class="stored">{{ whole() }}</span>`));
        head.append(global.resource.Crates.display
            ? $(`<span class="stackTotal" v-html="cCnt(crates,'${name}')"></span>`) : $(`<span></span>`));
        head.append(global.resource.Containers.display
            ? $(`<span class="stackTotal" v-html="trick(containers)"></span>`) : $(`<span></span>`));

        let zones = $(`<div class="stackZones" v-show="open()"></div>`);
        market_item.append(zones);
        for (const pool of supplyPools()){
            const where = supplyRegionName(pool);
            let line = $(`<div class="stackZone"></div>`);
            zones.append(line);
            line.append($(`<span class="zoneName">${where}</span>`));
            line.append($(`<span class="stored">{{ held('${pool}') }}</span>`));
            line.append(global.resource.Crates.display ? $(`<span class="adjust">
                <span role="button" aria-label="remove ${global.resource[name].name} ${global.resource.Crates.name} from ${where}" class="sub has-text-danger" @click="subCrate('${name}','${pool}')">&laquo;</span>
                <span class="current">{{ stacks('${pool}','crates') }}</span>
                <span role="button" aria-label="add ${global.resource[name].name} ${global.resource.Crates.name} to ${where}" class="add has-text-success" @click="addCrate('${name}','${pool}')">&raquo;</span>
            </span>`) : $(`<span></span>`));
            line.append(global.resource.Containers.display ? $(`<span class="adjust">
                <span role="button" aria-label="remove ${global.resource[name].name} ${global.resource.Containers.name} from ${where}" class="sub has-text-danger" @click="subCon('${name}','${pool}')">&laquo;</span>
                <span class="current">{{ stacks('${pool}','containers') }}</span>
                <span role="button" aria-label="add ${global.resource[name].name} ${global.resource.Containers.name} to ${where}" class="add has-text-success" @click="addCon('${name}','${pool}')">&raquo;</span>
            </span>`) : $(`<span></span>`));
        }
    }
    else {
        head.append($(`<h3 class="res has-text-${color}">{{ name }}</h3>`));
        head.append($(`<span class="storage-total">{{ stored() }}</span>`));

        if (global.resource.Crates.display){
            let crate = $(`<span class="trade storage-crate-control"><span class="has-text-warning">${global.resource.Crates.name}</span></span>`);
            head.append(crate);
            crate.append($(`<span role="button" aria-label="remove ${global.resource[name].name} ${global.resource.Crates.name}" class="sub has-text-danger" @click="subCrate('${name}')"><span>&laquo;</span></span>`));
            crate.append($(`<span class="current" v-html="cCnt(crates,'${name}')"></span>`));
            crate.append($(`<span role="button" aria-label="add ${global.resource[name].name} ${global.resource.Crates.name}" class="add has-text-success" @click="addCrate('${name}')"><span>&raquo;</span></span>`));
        }

        if (global.resource.Containers.display){
            let container = $(`<span class="trade storage-container-control"><span class="has-text-warning">${global.resource.Containers.name}</span></span>`);
            head.append(container);
            container.append($(`<span role="button" aria-label="remove ${global.resource[name].name} ${global.resource.Containers.name}" class="sub has-text-danger" @click="subCon('${name}')"><span>&laquo;</span></span>`));
            container.append($(`<span class="current" v-html="trick(containers)"></span>`));
            container.append($(`<span role="button" aria-label="add ${global.resource[name].name} ${global.resource.Containers.name}" class="add has-text-success" @click="addCon('${name}')"><span>&raquo;</span></span>`));
        }
    }

    vBind({
        el: mount,
        data: global.resource[name],
        methods: {
            open(){
                return openStack === name;
            },
            caret(){
                return this.open() ? '▼' : '▶';
            },
            toggleZones(){
                const was = openStack;
                openStack = was === name ? false : name;
                // Each resource is its own Vue app, so the one being closed has to be told to
                // repaint — nothing else is watching a variable that lives outside all of them.
                if (was && was !== name){ vBind({ el: `#stack-${was}` }, 'update'); }
            },
            held(pool){
                return `${sizeApproximation(regAmount(name,pool),1)} / ${sizeApproximation(regMax(name,pool),1)}`;
            },
            // The civilisation's own total, in the same column the zone lines put their share.
            whole(){
                return `${sizeApproximation(global.resource[name].amount,1)} / ${sizeApproximation(global.resource[name].max,1)}`;
            },
            stacks(pool,field){
                return stackHeld(name,field,pool);
            },
            addCrate(res,pool){
                assignCrate(res,pool);
            },
            subCrate(res,pool){
                unassignCrate(res,pool);
            },
            addCon(res,pool){
                assignContainer(res,pool);
            },
            subCon(res,pool){
                unassignContainer(res,pool);
            },
            stored(){
                return `${sizeApproximation(global.resource[name].amount,1)} / ${sizeApproximation(global.resource[name].max,1)}`;
            },
            trick(v){
                if (name === 'Stone' && global.resource[name].crates === 10 && global.resource[name].containers === 31){
                    let trick = trickOrTreat(4,13,true);
                    if (trick.length > 0){
                        return trick;
                    }
                }
                return v;
            },
            cCnt(ct,res){
                if ((res === 'Food' && !global.race['artifical']) || (global.race['artifical'] && res === 'Coal') || res === 'Souls'){
                    let egg = easterEgg(13,10);
                    if (ct === 10 && egg.length > 0){
                        return '1'+egg;
                    }
                }
                return ct;
            }
        }
    });
}

export function tradeSellPrice(res){
    let divide = 4;
    if (global.race['merchant']){
        divide *= 1 - (traits.merchant.vars()[0] / 100);
    }
    let fathom = fathomCheck('goblin');
    if (fathom > 0){
        divide *= 1 - (traits.merchant.vars(1)[0] / 100 * fathom);
    }
    if (global.race['asymmetrical']){
        divide *= 1 + (traits.asymmetrical.vars()[0] / 100);
    }
    if (global.race['devious']){
        divide *= 1 + (traits.devious.vars()[0] / 100);
    }
    if (global.race['conniving']){
        divide--;
    }
    let price = global.resource[res].value * tradeRatio[res] / divide;
    if (global.city['wharf']){
        price = price * (1 + (global.city['wharf'].count * 0.01));
    }
    if (global.space['gps'] && global.space['gps'].count > 3){
        price = price * (1 + (global.space['gps'].count * 0.01));
    }
    if (global.tech['railway']){
        let boost = global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 1 ? 0.03 : 0.02;
        price = price * (1 + (global.tech['railway'] * boost));
    }
    if (global.race['truepath'] && !global.race['lone_survivor'] && !rivalCollapsed()){
        price *= 1 - (global.civic.foreign.gov3.hstl / 101);
    }
    if (global.race['inflation']){
        price *= 1 + (global.race.inflation / 500);
    }
    if (global.race['witch_hunter'] && global.resource.Sus.amount > 50){
        let wariness = (global.resource.Sus.amount - 50) / 52;
        price *= 1 - wariness;
    }
    price *= production('psychic_cash');
    price = +(price).toFixed(1);
    return price;
}

export function tradeBuyPrice(res){
    let rate = global.resource[res].value;
    // Cunning drives the buying price down. The selling price is untouched by it.
    rate *= 2 - geneBonus('cunning');
    if (global.race['arrogant']){
        rate *= 1 + (traits.arrogant.vars()[0] / 100);
    }
    if (global.race['conniving']){
        rate *= 1 - (traits.conniving.vars()[0] / 100);
    }
    let impFathom = fathomCheck('imp');
    if (impFathom > 0){
        rate *= 1 - (traits.conniving.vars(1)[0] / 100 * impFathom);
    }
    let price = rate * tradeRatio[res];
    if (global.city['wharf']){
        price = price * (0.99 ** global.city['wharf'].count);
    }
    if (global.space['gps'] && global.space['gps'].count > 3){
        price = price * (0.99 ** global.space['gps'].count);
    }
    if (global.tech['railway']){
        let boost = global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 1 ? 0.97 : 0.98;
        price = price * (boost ** global.tech['railway']);
    }
    if (global.race['truepath'] && !global.race['lone_survivor'] && !rivalCollapsed()){
        price *= 1 + (global.civic.foreign.gov3.hstl / 101);
    }
    if (global.race['inflation']){
        price *= 1 + (global.race.inflation / 300);
    }
    if (global.race['quarantine']){
        price *= 1 + Math.round(global.race.quarantine ** 3.5);
    }
    if (global.race['witch_hunter'] && global.resource.Sus.amount > 50){
        let wariness = (global.resource.Sus.amount - 50) / 8;
        price *= 1 + wariness;
    }
    price = +(price).toFixed(1);
    return price;
}

// Breakdown modifier keys can carry arbitrary locale/user text (translated titles, custom
// planet names) that may contain quotes, backslashes or even newlines. These popovers embed
// that text into a live Vue `{{ }}` expression, so the key must be a valid JS string literal —
// JSON.stringify escapes every such character (a stray newline previously crashed the whole
// template compile with "Invalid or unexpected token", blanking the resource's breakdown).
function bdKey(mod){
    return JSON.stringify(mod);
}

// Escape a breakdown label for safe embedding as HTML text content, and neutralize any mustache
// delimiters so Vue does not try to compile embedded {{ }} in the label as an interpolation.
function bdLabel(label){
    return label.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/\{\{/g,'{&#123;').replace(/\}\}/g,'}&#125;');
}

export function craftingPopover(id,res,type,extra){
    // Reuse the same regional breakdown for popover markup and values.
    let view = false;
    popover(`${id}`,function(){
        let bd = $(`<div class="resBreakdown"><div class="has-text-info">{{ namespace(res.name) }}</div></div>`);
        let table = $(`<div class="parent"></div>`);
        bd.append(table);

        // The craftsmen work at home and what they make lands at home, so pointed anywhere else this
        // Show each zone only its share of pooled crafting activity.
        const regional = type === 'auto' ? regionalBreakdown(res) : false;
        if (regional && !regional.local){
            table.append($(`<div><div class="modal_bd"><span>${bdLabel(loc('supply_zone_inert',[global.resource[res].name]))}</span></div></div>`));
            return bd;
        }
        const made = regional ? regional.production : breakdown.p[res];
        const used = regional ? regional.consume : (breakdown.p.consume && breakdown.p.consume[res]);
        view = { made, used };

        let craft_total = craftingRatio(res,type);

        let col1 = $(`<div></div>`);
        table.append(col1);
        if (type === 'auto' && made){
            Object.keys(made).forEach(function (mod){
                let raw = made[mod];
                let val = parseFloat(raw.slice(0,-1));
                if (val != 0 && !isNaN(val)){
                    let type = val > 0 ? 'success' : 'danger';
                    let label = mod.replace(/\+.+$/,"");
                    col1.append(`<div class="modal_bd"><span>${bdLabel(label)}</span><span class="has-text-${type}">{{ translate(${res}[${bdKey(mod)}]) }}</span></div>`);
                }
            });
        }
        Object.keys(craft_total.multi_bd).forEach(function (mod){
            let raw = craft_total.multi_bd[mod];
            let val = parseFloat(raw.slice(0,-1));
            if (val != 0 && !isNaN(val)){
                let type = val > 0 ? 'success' : 'danger';
                let label = mod.replace(/\+.+$/,"");
                col1.append(`<div class="modal_bd"><span>${bdLabel(label)}</span><span class="has-text-${type}">{{ translate(craft.multi_bd[${bdKey(mod)}]) }}</span></div>`);
            }
        });
        
        let col2 = $(`<div class="col"></div>`);
        let title = $(`<div class="has-text-info">${loc(`craft_tools_multi`)}</div>`);
        col2.append(title);
        let count = 0;
        Object.keys(craft_total.add_bd).forEach(function (mod){
            let raw = craft_total.add_bd[mod];
            let val = parseFloat(raw.slice(0,-1));
            if (val != 0 && !isNaN(val)){
                count++;
                let type = val > 0 ? 'success' : 'danger';
                let label = mod.replace(/\+.+$/,"");
                col2.append(`<div class="modal_bd"><span>${bdLabel(label)}</span><span class="has-text-${type}">{{ translate(craft.add_bd[${bdKey(mod)}]) }}</span></div>`);
            }
        });
        if (count > 0){
            table.append(col2);
        }

        if (used){
            let col3 = $(`<div class="col"></div>`);
            let count = 0;
            Object.keys(used).forEach(function (mod){
                let val = used[mod];
                if (val != 0 && !isNaN(val)){
                    count++;
                    let type = val > 0 ? 'success' : 'danger';
                    let label = mod.replace(/\+.+$/,"");
                    col3.append(`<div class="modal_bd"><span>${bdLabel(label)}</span><span class="has-text-${type}">{{ translate(fix(consume.${res}[${bdKey(mod)}])) }}</span></div>`);
                }
            });
            if (count > 0){
                table.append(col3);
            }
        }
        
        if (global['resource'][res].diff < 0 && global['resource'][res].amount > 0){
            bd.append(`<div class="modal_bd sum"><span>${loc('to_empty')}</span><span class="has-text-danger">{{ counter(res.amount) }}</span></div>`);
        }
        
        if (extra){
            bd.append(`<div class="modal_bd sum"></div>`);
            bd.append(extra);
        }
        return bd;
    },{
        in: function(){
            vBind({
                el: `#popper > div`,
                data: {
                    [res]: view.made,
                    res: global['resource'][res],
                    'consume': { [res]: view.used },
                    craft: craftingRatio(res,type)
                },
                methods: {
                    translate(raw){
                        let type = raw[raw.length -1];
                        let val = parseFloat(raw.slice(0,-1));
                        let precision = (val > 0 && val < 1) || (val < 0 && val > -1) ? 4 
                            : ((val > 0 && val < 10) || (val < 0 && val > -10) ? 3 : 2);
                        val = +(val).toFixed(precision);
                        let suffix = type === '%' ? '%' : '';
                        if (val > 0){
                            return '+' + sizeApproximation(val,precision) + suffix;
                        }
                        else if (val < 0){
                            return sizeApproximation(val,precision) + suffix;
                        }
                    },
                    fix(val){
                        return val + 'v';
                    },
                    counter(val){
                        let rate = -global['resource'][res].diff;
                        let time = +(val / rate).toFixed(0);
                        
                        if (time > 60){
                            let secs = time % 60;
                            let mins = (time - secs) / 60;
                            if (mins >= 60){
                                let r = mins % 60;
                                let hours = (mins - r) / 60;
                                return `${hours}h ${r}m`;
                            }
                            else {
                                return `${mins}m ${secs}s`;
                            }
                        }
                        else {
                            return `${time}s`;
                        }
                    },
                    namespace(name){
                        return name.replace("_"," ");
                    }
                }
            });
        },
        out: function(){
            vBind({el: `#popper > div`},'destroy');
        },
        classes: `breakdown has-background-light has-text-dark`,
        prop: {
            modifiers: {
                preventOverflow: { enabled: false },
                hide: { enabled: false }
            }
        }
    });
}

// Return the selected pool when the resource uses regional storage.
function viewedZone(name){
    const at = global.settings.resRegion;
    if (supplyMode() === 'global' || !at || at === 'all' || !atomic_mass[name]){ return false; }
    return at;
}

// Return amount, capacity, and rate for the viewed region.
function zoneHeld(name){
    const at = viewedZone(name);
    return at ? regAmount(name, at) : global.resource[name].amount;
}

function zoneRoom(name){
    const at = viewedZone(name);
    return at ? regMax(name, at) : global.resource[name].max;
}

function zoneFlow(name){
    const at = viewedZone(name);
    return at ? (regDiff(name)[at] || 0) : global.resource[name].diff;
}

// Return storage totals for the viewed pool or the global store.
function bdSource(type,name){
    const at = viewedZone(name);
    if (type !== 'c' || !at){
        return breakdown[type];
    }
    // Sum storage breakdown entries across every region in the viewed pool.
    const merged = {};
    for (const region of poolRegions(at)){
        const from = breakdown.creg[region];
        if (!from){ continue; }
        for (const res in from){
            if (!merged[res]){ merged[res] = {}; }
            for (const label in from[res]){
                // Two worlds in a zone may each have the same kind of building, and the popover
                // should say what the pair of them provide rather than only the last one seen.
                const add = parseFloat(from[res][label]);
                const had = merged[res][label] ? parseFloat(merged[res][label]) : 0;
                merged[res][label] = (had + (isNaN(add) ? 0 : add)) + 'v';
            }
        }
    }
    return merged;
}

// Map exceptional ledger labels to their owning structures for zone attribution.
const BD_ALIASES = {
    // Mars, and the four Makemake mines, are named after the world and the resource rather than
    // after themselves.
    space_red_mine_desc_bd:             { at: 'space:red_mine', vars: () => [planetName().red] },
    space_makemake_mine:                {
        at: { Uranium: 'space:uranium_mine', Neutronium: 'space:neutronium_mine',
              Elerium: 'space:elerium_mine', Orichalcum: 'space:orichalcum_mine' },
        vars: res => [global.resource[res].name]
    },
    // The infernite mine below the gate is written "Mine", the same word as the city's own mine.
    // Only the hell mine makes infernite, so the resource tells the two apart.
    city_mine:                          { at: 'portal:infernite_mine', res: 'Infernite' },
    space_gas_moon_outpost_bd:          'space:outpost',
    tech_space_marines_bd:              'space:space_barracks',
    tech_fob:                           'space:fob',
    outer_shipyard_fleet:               'space:shipyard',
    interstellar_neutron_miner_bd:      { at: 'interstellar:neutron_miner', res: 'Neutronium' },
    interstellar_elerium_prospector_bd: 'interstellar:elerium_prospector',
    interstellar_nexus_bd:              'interstellar:nexus',
    interstellar_blackhole_name:        'int_blackhole',
    galaxy_armed_miner_bd:              'galaxy:armed_miner',
    galaxy_vitreloy_plant_bd:           'galaxy:vitreloy_plant',
    // The galaxy's fuel bill and what the pirates take are both the fleet's, and the fleet is based
    // at the gateway starbase.
    galaxy_fuel_consume:                'galaxy:starbase',
    galaxy_piracy:                      'galaxy:starbase',
    tau_red_womlings:                   'tauceti:womling_farm',
    eden_restaurant_bd:                 'eden:restaurant',
    portal_fortress_name:               'prtl_fortress',
    portal_tunneler_bd:                 'portal:tunneler',
};

// Index ledger source titles by supply zone for regional breakdowns.
// An alias that speaks for one resource only, looked up per entry rather than baked into the shared
// index — the index has to mean the same thing for every resource or it cannot be cached at all.
function scopedAlias(label, name){
    for (const key in BD_ALIASES){
        const spec = BD_ALIASES[key];
        if (typeof spec !== 'object' || spec.res !== name){ continue; }
        const at = typeof spec.at === 'object' ? spec.at[name] : spec.at;
        if (!at){ continue; }
        const text = spec.vars ? loc(key, spec.vars(name)) : loc(key);
        if (text === label){ return at; }
    }
    return false;
}

const titleCache = { at: 0, index: false };
function titleZones(){
    // Rebuilt at most once a second rather than on every hover. The titles do move — they are
    // translated, swapped out for the seasonal events, and several name a planet rolled per run — but
    // none of that happens between two hovers, and walking the whole action tree for each one is what
    // made the resource popovers slow to open.
    const now = Date.now();
    if (titleCache.index && now - titleCache.at < 1000){ return titleCache.index; }
    supplyRegions();   // tags every action with its s_zone before the walk below
    const index = {};
    const note = (title, zone) => {
        // Prefer the first matching zone when labels are ambiguous.
        if (title && !index.hasOwnProperty(title)){ index[title] = zone; }
    };
    // Register exceptional labels before generic title matching.
    for (const key in BD_ALIASES){
        const raw = BD_ALIASES[key];
        const spec = typeof raw === 'string' ? { at: raw } : raw;
        if (spec.res){ continue; }   // one resource only: scopedAlias answers for those
        // An alias covering several buildings reads differently for each — the four Makemake mines are
        // "<resource> Mine" — so every variant is noted and the index stays the same for everyone.
        const each = typeof spec.at === 'object' ? Object.keys(spec.at) : [false];
        for (const res of each){
            const at = res ? spec.at[res] : spec.at;
            if (!at){ continue; }
            const label = spec.vars ? loc(key, spec.vars(res || undefined)) : loc(key);
            if (label !== key){ note(label, supplyZone(at)); }
        }
    }
    for (const cat of ['city','space','interstellar','galaxy','portal','tauceti','eden']){
        const groups = actions[cat];
        if (!groups){ continue; }
        const buckets = cat === 'city' ? [groups] : Object.values(groups);
        for (const bucket of buckets){
            if (!bucket || typeof bucket !== 'object'){ continue; }
            for (const c_action of Object.values(bucket)){
                if (!c_action || typeof c_action !== 'object' || !c_action.s_zone || !c_action.title){ continue; }
                let title;
                try { title = typeof c_action.title === 'function' ? c_action.title() : c_action.title; }
                catch (e){ continue; }
                note(title, c_action.s_zone);
            }
        }
    }
    // Attribute jobs to their declared zone or the home world.
    for (const job of Object.values(job_data)){
        if (!job || typeof job.name !== 'function'){ continue; }
        let title;
        try { title = job.name(); }
        catch (e){ continue; }
        note(title, job.zone ? supplyZone(job.zone) : CAPITAL);
    }
    titleCache.at = now;
    titleCache.index = index;
    return index;
}

// Sum pooled-industry ledger entries across the viewed supply pool.
function zoneLedger(name, at){
    const out = { p: {}, consume: {}, placed: { p: {}, consume: {} } };
    for (const zone in breakdown.preg){
        const from = breakdown.preg[zone];
        const mine = poolRegions(at).includes(zone);
        for (const label in (from[name] || {})){
            out.placed.p[label] = true;
            if (mine){ out.p[label] = ((parseFloat(out.p[label]) || 0) + (parseFloat(from[name][label]) || 0)) + 'v'; }
        }
        const used = (from.consume || {})[name] || {};
        for (const label in used){
            out.placed.consume[label] = true;
            if (mine){ out.consume[label] = (out.consume[label] || 0) + used[label]; }
        }
    }
    return out;
}

// Return a ledger entry’s zone tag, if present.
function bdTag(label){
    const at = label.indexOf('+');
    if (at < 0){ return false; }
    const tag = label.slice(at + 1);
    return /^[a-z]+-[a-z0-9_]+$/.test(tag) || /^(spc|int|gxy|prtl|tau|eden)_[a-z0-9_]+$/.test(tag) ? tag : false;
}

// Filter resource-ledger entries to the viewed supply pool.
function regionalBreakdown(name){
    const at = viewedZone(name);
    if (!at){ return false; }
    const index = titleZones();
    const zoneOf = label => {
        // Use ids or zone keys to attribute repeated ledger labels.
        const tag = bdTag(label);
        if (tag){ return supplyPool(supplyZone(tag.replace('-', ':'))); }
        const plain = label.replace(/\+.+$/,'');
        const scoped = scopedAlias(plain, name);
        if (scoped){ return supplyPool(supplyZone(scoped)); }
        return supplyPool(index[plain] || CAPITAL);
    };
    // Ignore ledger entries that produce or consume nothing.
    const live = v => { const n = parseFloat(v); return !isNaN(n) && n !== 0; };
    const own = zoneLedger(name, at);
    // Discard ledger entries from other supply pools.
    const ELSEWHERE = ' ';

    const production = {};
    let group = false;      // the pool the entry above belongs to, for the modifiers hanging off it
    let made = false;       // whether anything here is a source of its own, rather than a modifier
    Object.entries(breakdown.p[name] || {}).forEach(function([label, value]){
        if (label.charAt(0) === 'ᄂ'){
            if (group === false || group === at){ production[label] = value; }
        }
        else if (typeof value === 'string' && value.slice(-1) === '%'){
            production[label] = value;
            group = false;
        }
        else if (own.placed.p[label]){
            // Read pooled-industry entries from their recorded zone shares.
            group = own.p.hasOwnProperty(label) ? at : ELSEWHERE;
            if (group === at){ production[label] = own.p[label]; made = made || live(own.p[label]); }
        }
        else {
            group = zoneOf(label);
            if (group === at){ production[label] = value; made = made || live(value); }
        }
    });

    // Consumption carries no modifier lines: every entry is a flat amount taken by one named thing.
    const consume = {};
    let spent = false;
    Object.entries((breakdown.p.consume && breakdown.p.consume[name]) || {}).forEach(function([label, value]){
        if (own.placed.consume[label]){
            if (own.consume.hasOwnProperty(label)){
                consume[label] = own.consume[label];
                spent = spent || live(own.consume[label]);
            }
        }
        else if (zoneOf(label) === at){ consume[label] = value; spent = spent || live(value); }
    });

    // Hide global production modifiers when the viewed zone has no production.
    return { production: made ? production : {}, consume, made, local: made || spent };
}

function breakdownPopover(id,name,type){
    // Reuse one regional ledger breakdown for popover markup and values.
    let view = false;
    popover(`${id}`,function(){
        const regional = type === 'p' ? regionalBreakdown(name) : false;
        view = {
            regional,
            // The global multipliers go with a zone's own production, and only with it: a world that
            // makes none of the resource is not doing anything to it either.
            src: regional
                ? { [name]: regional.production, Global: regional.made ? breakdown.p['Global'] : undefined }
                : bdSource(type,name),
            consume: regional ? regional.consume : (breakdown[type].consume && breakdown[type].consume[name])
        };
        let bd = $(`<div class="resBreakdown"><div class="has-text-info">{{ namespace(res.name) }}</div></div>`);
        if(type === 'p' && name === global.race.species){
            bd = $(`<div class="resBreakdown"><div class="has-text-info">${loc('starvation_resist')}</div></div>`);
        }
        let table = $(`<div class="parent"></div>`);
        bd.append(table);
        let prevCol = false;
        
        const src = view.src;
        if (src[name] && !(global.race.species === name && type === 'p')){
            let col1 = $(`<div></div>`);
            table.append(col1);
            // The global multipliers are shown whichever world the list is pointed at: they are
            // applied to everything the civilisation makes, wherever it makes it.
            let types = [name,'Global'];
            for (var i = 0; i < types.length; i++){
                let t = types[i];
                if (src[t]){
                    Object.keys(src[t]).forEach(function (mod){
                        let raw = src[t][mod];
                        let val = parseFloat(raw.slice(0,-1));
                        if (val != 0 && !isNaN(val)){
                            prevCol = true;
                            let type = val > 0 ? 'success' : 'danger';
                            let label = mod.replace(/\+.+$/,"");
                            col1.append(`<div class="modal_bd"><span>${bdLabel(label)}</span><span class="has-text-${type}">{{ translate(${t}[${bdKey(mod)}]) }}</span></div>`);
                        }
                    });
                }
            }
        }

        const consumption = view.consume;
        if (consumption){
            let col2 = $(`<div class="${prevCol ? 'col' : ''}"></div>`);
            let count = 0;
            Object.keys(consumption).forEach(function (mod){
                let val = consumption[mod];
                if (val != 0 && !isNaN(val)){
                    count++;
                    let type = val > 0 ? 'success' : 'danger';
                    let label = mod.replace(/\+.+$/,"");
                    col2.append(`<div class="modal_bd"><span>${bdLabel(label)}</span><span class="has-text-${type}">{{ translate(fix(consume.${name}[${bdKey(mod)}])) }}</span></div>`);
                }
            });
            if (count > 0){
                table.append(col2);
            }
        }

        if (view.regional && !view.regional.local){
            // A blank note reads as a broken one, so the zone says so in words. It may well still be
            // holding a stockpile — it simply is not doing anything with it.
            table.append($(`<div><div class="modal_bd"><span>${bdLabel(loc('supply_zone_inert',[global.resource[name].name]))}</span></div></div>`));
        }
        else if (type === 'p' && name !== global.race.species){
            // Read popover values from the currently viewed supply pool.
            let dir = zoneFlow(name) > 0 ? 'success' : 'danger';
            bd.append(`<div class="modal_bd sum"><span>{{ direction(flow()) }}</span><span class="has-text-${dir}">{{ counter(held()) }}</span></div>`);
        }

        return bd;
    },{
        in: function(){
            // Recompute the viewed pool in the popover callback scope.
            vBind({
                el: `#popper > div`,
                data: {
                    'Global': view.src['Global'],
                    [name]: view.src[name],
                    'consume': { [name]: view.consume },
                    res: global['resource'][name]
                },
                methods: {
                    held(){
                        return zoneHeld(name);
                    },
                    flow(){
                        return zoneFlow(name);
                    },
                    translate(raw){
                        let type = raw[raw.length -1];
                        let val = parseFloat(raw.slice(0,-1));
                        let precision = (val > 0 && val < 1) || (val < 0 && val > -1) ? 4 
                            : ((val > 0 && val < 10) || (val < 0 && val > -10) ? 3 : 2);
                        let suffix = type === '%' ? '%' : '';
                        if (val > 0){
                            return '+' + sizeApproximation(val,precision) + suffix;
                        }
                        else if (val < 0){
                            return sizeApproximation(val,precision) + suffix;
                        }
                    },
                    fix(val){
                        return val + 'v';
                    },
                    counter(val){
                        let rate = zoneFlow(name);
                        let time = 0;
                        if (rate < 0){
                            rate *= -1;
                            time = +(val / rate).toFixed(0);
                        }
                        else {
                            let gap = zoneRoom(name) - val;
                            time = +(gap / rate).toFixed(0);
                        }

                        if (time === Infinity || Number.isNaN(time)){
                            return 'Never';
                        }
                        
                        if (time > 60){
                            let secs = time % 60;
                            let mins = (time - secs) / 60;
                            if (mins >= 60){
                                let r = mins % 60;
                                let hours = (mins - r) / 60;
                                return `${hours}h ${r}m`;
                            }
                            else {
                                return `${mins}m ${secs}s`;
                            }
                        }
                        else {
                            return `${time}s`;
                        }
                    },
                    direction(val){
                        return val >= 0 ? loc('to_full') : loc('to_empty');
                    },
                    namespace(name){
                        return name.replace("_"," ");
                    }
                }
            });
        },
        out: function(){
            vBind({el: `#popper > div`},'destroy');
        },
        classes: `breakdown has-background-light has-text-dark`,
        prop: {
            modifiers: {
                preventOverflow: { enabled: false },
                hide: { enabled: false }
            }
        }
    });
}

function loadRouteCounter(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
        return;
    }

    let no_market = global.race['no_trade'] ? ' nt' : '';
    var market_item = $(`<div id="tradeTotal" v-show="active" class="market-item"><div id="tradeTotalPopover"><span class="tradeTotal${no_market}"><span class="has-text-caution">${loc('resource_market_trade_routes')}</span> <span v-html="tdeCnt(trade)"></span> / {{ mtrade }}</span></div></div>`);
    market_item.append($(`<span role="button" class="zero has-text-advanced" @click="zero()">${loc('cancel_all_routes')}</span>`));
    $('#tradeTotal').remove();
    $('#market').append(market_item);
    vBind({
        el: '#tradeTotal',
        data: global.city.market,
        methods: {
            zero(){
                // The smugglers' routes are booked per region
                if (supplyMode() !== 'global'){
                    const bm = global.city.market['bm'] || {};
                    for (const pool in bm){ delete bm[pool]; }
                    global.city.market.trade = 0;
                    drawResourceTab('market');
                    return;
                }
                Object.keys(global.resource).forEach(function(res){
                    if (global.resource[res]['trade']){
                        global.city.market.trade -= Math.abs(global.resource[res].trade);
                        global.resource[res].trade = 0;
                        tradeRouteColor(res);
                    }
                });
            },
            tdeCnt(ct){
                let egg17 = easterEgg(17,11);
                if (((ct === 100 && !global.tech['isolation'] && !global.race['cataclysm']) || (ct === 10 && (global.tech['isolation'] || global.race['cataclysm']))) && egg17.length > 0){
                    return '10'+egg17;
                }
                return ct;
            }
        }
    });

    popover(`tradeTotalPopover`,function(){
        let bd = $(`<div class="resBreakdown"></div>`);
        if (breakdown.hasOwnProperty('t_route')){
            Object.keys(breakdown.t_route).forEach(function(k){
                if (breakdown.t_route[k] > 0){
                    bd.append(`<div class="modal_bd"><span class="has-text-warning">${k}</span> <span>+${breakdown.t_route[k]}</span></div>`);
                }
            });
        }
        bd.append(`<div class="modal_bd ${global.city.market.mtrade > 0 ? 'sum' : ''}"><span class="has-text-caution">${loc('resource_market_trade_routes')}</span> <span>${global.city.market.mtrade}</span></div>`);
        return bd;
    },{
        elm: `#tradeTotalPopover > span`
    });
}

function loadContainerCounter(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 1)){
        return;
    }

    var market_item = $(`<div id="crateTotal" class="market-item"><span v-show="cr.display" class="crtTotal"><span class="has-text-warning">${global.resource.Crates.name}</span><span>{{ cr.amount }} / {{ cr.max }}</span></span><span v-show="cn.display" class="cntTotal"><span class="has-text-warning">${global.resource.Containers.name}</span><span>{{ cn.amount }} / {{ cn.max }}</span></span></div>`);
    $('#resStorage').append(market_item);

    vBind({
        el: '#crateTotal',
        data: {
            cr: global.resource.Crates,
            cn: global.resource.Containers
        }
    });
}

function tradeRouteColor(res){
    $(`#market-${res} .trade .current`).removeClass('has-text-warning');
    $(`#market-${res} .trade .current`).removeClass('has-text-danger');
    $(`#market-${res} .trade .current`).removeClass('has-text-success');
    if (global.resource[res].trade > 0){
        $(`#market-${res} .trade .current`).addClass('has-text-success');
    }
    else if (global.resource[res].trade < 0){
        $(`#market-${res} .trade .current`).addClass('has-text-danger');
    }
    else {
        $(`#market-${res} .trade .current`).addClass('has-text-warning');
    }
}

function buildCrateLabel(){
    let material = global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? global.resource.Chrysotile.name : global.resource.Stone.name) : (global.resource['Plywood'] ? global.resource.Plywood.name : global.resource.Plywood.name);
    if (global.race['iron_wood']){ material = global.resource.Lumber.name; }
    let cost = global.race['kindling_kindred'] || global.race['smoldering'] || global.race['iron_wood'] ? 200 : 10
    return loc('resource_modal_crate_construct_desc',[cost,material,crateValue()]);
}

function buildContainerLabel(){
    return loc('resource_modal_container_construct_desc',[125,containerValue()]);
}

export function crateGovHook(type,num){
    switch (type){
        case 'crate':
            buildCrate(num);
            break;
        case 'container':
            buildContainer(num);
            break;
    }
}

function buildCrate(num){
    let keyMutipler = num || storageMultiplier();
    let material = global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? 'Chrysotile' : 'Stone') : 'Plywood';
    if (global.race['iron_wood']){ material = 'Lumber'; }
    let cost = global.race['kindling_kindred'] || global.race['smoldering'] || global.race['iron_wood'] ? 200 : 10;
    if (keyMutipler + global.resource.Crates.amount > global.resource.Crates.max){
        keyMutipler = global.resource.Crates.max - global.resource.Crates.amount;
    }
    if (global.resource[material].amount < cost * keyMutipler){
        keyMutipler = Math.floor(global.resource[material].amount / cost);
    }
    if (global.resource[material].amount >= (cost * keyMutipler) && global.resource.Crates.amount < global.resource.Crates.max){
        modRes(material, -(cost * keyMutipler), true);
        global.resource.Crates.amount += keyMutipler;
    }
}

function buildContainer(num){
    let keyMutipler = num || storageMultiplier();
    if (keyMutipler + global.resource.Containers.amount > global.resource.Containers.max){
        keyMutipler = global.resource.Containers.max - global.resource.Containers.amount;
    }
    if (global.resource['Steel'].amount < 125 * keyMutipler){
        keyMutipler = Math.floor(global.resource['Steel'].amount / 125);
    }
    if (global.resource['Steel'].amount >= (125 * keyMutipler) && global.resource.Containers.amount < global.resource.Containers.max){
        modRes('Steel', -(125 * keyMutipler), true);
        global.resource.Containers.amount += keyMutipler;
    }
}

function drawModal(name){
    $('#modalBox').append($('<p id="modalBoxTitle" class="has-text-warning modalTitle">{{ name }} - {{ size(amount) }}/{{ size(max) }}</p>'));
    
    let body = $('<div class="modalBody crateModal"></div>');
    $('#modalBox').append(body);

    if ((name === 'Food' && !global.race['artifical']) || (global.race['artifical'] && name === 'Coal') || name === 'Souls'){
        let egg = easterEgg(7,10);
        if (egg.length > 0){
            $('#modalBoxTitle').prepend(egg);
        }
    }

    if (name === 'Stone'){
        let trick = trickOrTreat(1,12,false);
        if (trick.length > 0){
            $('#modalBoxTitle').prepend(trick);
        }
    }
    
    let crates = $('<div id="modalCrates" class="crates"></div>');
    body.append(crates);
    
    crates.append($(`<div class="crateHead"><span>${loc('resource_modal_crate_owned')} {{ crates.amount }}/{{ crates.max }}</span><span>${loc('resource_modal_crate_assigned')} {{ res.crates }}</span></div>`));
    
    let buildCr = $(`<button class="button construct" @click="buildCrate()">${loc('resource_modal_crate_construct')}</button>`);
    let removeCr = $(`<button class="button unassign" @click="subCrate('${name}')">${loc('resource_modal_crate_unassign')}</button>`);
    let addCr = $(`<button class="button assign" @click="addCrate('${name}')">${loc('resource_modal_crate_assign')}</button>`);
    
    crates.append(buildCr);
    crates.append(removeCr);
    crates.append(addCr);
    
    vBind({
        el: `#modalCrates`,
        data: { 
            crates: global['resource']['Crates'],
            res: global['resource'][name],
        },
        methods: {
            buildCrate(){
                buildCrate();
            },
            subCrate(res){
                unassignCrate(res);
            },
            addCrate(res){
                assignCrate(res);
            }
        }
    });
    
    if (global.resource.Containers.display){
        let containers = $('<div id="modalContainers" class="crates divide"></div>');
        body.append(containers);
        
        containers.append($(`<div class="crateHead"><span>${loc('resource_modal_container_owned')} {{ containers.amount }}/{{ containers.max }}</span><span>${loc('resource_modal_container_assigned')} {{ res.containers }}</span></div>`));

        let buildCon = $(`<button class="button construct" @click="buildContainer()">${loc('resource_modal_container_construct')}</button>`);
        let removeCon = $(`<button class="button unassign" @click="removeContainer('${name}')">${loc('resource_modal_container_unassign')}</button>`);
        let addCon = $(`<button class="button assign" @click="addContainer('${name}')">${loc('resource_modal_container_assign')}</button>`);
        
        containers.append(buildCon);
        containers.append(removeCon);
        containers.append(addCon);
        
        vBind({
            el: `#modalContainers`,
            data: { 
                containers: global['resource']['Containers'],
                res: global['resource'][name],
            },
            methods: {
                buildContainer(){
                    buildContainer();
                },
                removeContainer(res){
                    unassignContainer(res);
                },
                addContainer(res){
                    assignContainer(res);
                }
            }
        });
    }

    vBind({
        el: `#modalBoxTitle`,
        data: global['resource'][name], 
        methods: {
            size: function (value){
                return sizeApproximation(value,0);
            },
            diffSize: function (value){
                return sizeApproximation(value,2);
            }
        }
    });

    function tooltip(type,subtype){
        if (type === 'modalContainers'){
            let cap = containerValue();
            switch (subtype){
                case 'assign':
                    return loc('resource_modal_container_assign_desc',[cap]);
                case 'unassign':
                    return loc('resource_modal_container_unassign_desc',[cap]);
                case 'construct':
                    return buildContainerLabel();
            }
        }
        else {
            let cap = crateValue();
            switch (subtype){
                case 'assign':
                    return loc('resource_modal_crate_assign_desc',[cap]);
                case 'unassign':
                    return loc('resource_modal_crate_unassign_desc',[cap]);
                case 'construct':
                    return buildCrateLabel();
            }
        }
    }

    ['modalCrates','modalContainers'].forEach(function(type){
        ['assign','unassign','construct'].forEach(function(subtype){
            popover(`${type}${subtype}`,tooltip(type,subtype), {
                elm: $(`#${type} > .${subtype}`),
                attach: '#main',
            });
        });
    });
}

function unlockStorage(){
    // If this is the first resource subtab to unlock, then mark it as the visible subtab
    if (!global.settings.showResources) {
        global.settings.marketTabs = 1;
    }

    // Enable display for resource tab and storage subtab
    global.settings.showResources = true;
    global.settings.showStorage = true;

    // Possibly draw or redraw the storage subtab
    drawResourceTab('storage');

    // Redraw the governor, who has actions to build and manage storage
    defineGovernor();
}

// Crates are always initially unlocked by the Freight Yard building.
// Other buildings that provide crates do not need to call this function.
export function unlockCrates(){
    if (!global.resource.Crates.display){
        // Message about unlocking crates for the first time
        messageQueue(loc('city_storage_yard_msg'),'info',false,['progress']);

        // Enable display for crates
        global.resource.Crates.display = true;

        // Unlock the storage tab
        unlockStorage();
    }
}

// Containers are optional to clear the game, so every building that provides Containers might be the very first one.
// All buildings that provide containers, not just the Container Port, should call this function.
export function unlockContainers(){
    if (!global.resource.Containers.display){
        // Message about unlocking containers for the first time
        messageQueue(loc('city_warehouse_msg'),'info',false,['progress']);

        // Enable display for containers
        global.resource.Containers.display = true;

        // Unlock the storage tab
        unlockStorage();
    }
}

export function crateValue(){
    let create_value = global.tech['container'] && global.tech['container'] >= 2 ? 500 : 350;
    if (global.tech['container'] && global.tech['container'] >= 4){
        create_value += global.tech['container'] >= 5 ? 500 : 250;
    }
    if (global.tech['container'] && global.tech['container'] >= 6){
        create_value += global.tech['container'] >= 7 ? 1200 : 500;
    }
    if (global.tech['container'] && global.tech['container'] >= 8){
        create_value += global.tech['container'] >= 9 ? 7800 : 4000;
    }
    create_value *= geneBonus('stockpiler');
    if (global.race['pack_rat']){
        create_value *= 1 + (traits.pack_rat.vars()[0] / 100);
    }
    let fathom = fathomCheck('kobold');
    if (fathom > 0){
        create_value *= 1 + (traits.pack_rat.vars(1)[0] / 100 * fathom);
    }
    if (global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 3){
        create_value *= 1.1;
    }
    create_value *= global.stats.achieve['blackhole'] ? 1 + (global.stats.achieve.blackhole.l * 0.05) : 1;
    return Math.round(spatialReasoning(create_value));
}

export function containerValue(){
    let container_value = global.tech['steel_container'] && global.tech['steel_container'] >= 3 ? 1200 : 800;
    if (global.tech['steel_container'] && global.tech['steel_container'] >= 4){
        container_value += global.tech['steel_container'] >= 5 ? 1000 : 400;
    }
    if (global.tech['steel_container'] && global.tech['steel_container'] >= 6){
        container_value += global.tech['steel_container'] >= 7 ? 7500 : 1000;
    }
    if (global.tech['steel_container'] && global.tech['steel_container'] >= 8){
        container_value += global.tech['steel_container'] >= 9 ? 15300 : 8000;
    }
    if (global.race['pack_rat']){
        container_value *= 1 + (traits.pack_rat.vars()[0] / 100);
    }
    let fathom = fathomCheck('kobold');
    if (fathom > 0){
        container_value *= 1 + (traits.pack_rat.vars(1)[0] / 100 * fathom);
    }
    container_value *= global.stats.achieve['blackhole'] ? 1 + (global.stats.achieve.blackhole.l * 0.05) : 1;
    return Math.round(spatialReasoning(container_value));
}

function initMarket(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
        return;
    }
    clearElement($('#market'));
    loadMarketRouteMultiplier();
    if (supplyMode() !== 'global'){
        loadBlackMarket();
        return;
    }
    let market = $(`<div id="market-qty" class="market-header"><h2 class="is-sr-only">${loc('resource_market')}</h2></div>`);
    $('#market').append(market);
    loadMarket();
}

// Update only the inbound cards while cargo is travelling. Redrawing the whole tab every second
// made the zone cards flash; the full render happens only when an arrival changes their state.
let supplyZonesArrivalTimer = false;
let supplyZonesInboundIds = [];
let supplyZonesInboundShips = [];

function refreshInboundSupplyZones(){
    supplyZonesArrivalTimer = false;
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 5)){ return; }
    if (supplyZonesInboundShips.some(ship => !ship.inTransit)){
        initSupplyZones();
        return;
    }
    supplyZonesInboundIds.forEach(id => vBind({ el: `#${id}` }, 'update'));
    supplyZonesArrivalTimer = setTimeout(refreshInboundSupplyZones, 1000);
}

function freightGroups(ships){
    const seen = new Set(), groups = [];
    for (const ship of ships){
        if (seen.has(ship)){ continue; }
        const fleet = ship.fid ? shipFleet(ship).filter(member => member.class === 'freighter' && ships.includes(member)) : [];
        const members = fleet.length >= 2 ? fleet : [ship];
        members.forEach(member => seen.add(member));
        const flagship = ship.fid ? (global.space.shipyard.ships || []).find(member => member.fid === ship.fid && member.flag) : false;
        groups.push({
            ships: members,
            name: members.length > 1 ? loc('supply_freighter_fleet',[flagship ? flagship.name : members[0].name, members.length]) : ship.name
        });
    }
    return groups;
}

// Render a freight route with its stops, pickups, and current stop.
function routeSummary(ship){
    const route = ship && ship.tradeRoute;
    if (!route || !Array.isArray(route.stops)){ return []; }
    return route.stops.map(function(stop, i){
        const pickups = (stop.pickups || []).filter(res => global.resource[res]);
        return {
            number: i + 1,
            zone: supplyRegionName(stop.zone),
            pickups: pickups.map(res => global.resource[res].name).join(', '),
            here: i === route.index
        };
    });
}

// Return whether a governor controls this route and its mode.
const routeKinds = {
    relief: 'supply_freighter_route_relief',
    build: 'supply_freighter_route_build',
    balance: 'supply_freighter_route_balance'
};
function routeManaged(ship){
    const auto = ship && ship.tradeRoute ? ship.tradeRoute.auto : false;
    return auto && routeKinds[auto] ? loc(routeKinds[auto]) : '';
}

// Render route stops for docked and inbound freighter cards.
const routeSummaryMarkup = `<div class="supplyRouteSummary" v-show="hasRoute()">
    <div class="supplyRouteSummaryHead"><span>${loc('supply_freighter_route_current')}</span><span class="supplyRouteGovernor" v-show="managed()">{{ managed() }}</span></div>
    <ol class="supplyRouteSummaryStops">
        <li v-for="stop in summary()" :class="{ 'is-here': stop.here }" :aria-label="stop.here ? '${loc('supply_freighter_route_here')}' : '${loc('supply_freighter_route_stop', [''])}' + stop.number">
            <span class="supplyRouteSummaryNumber">{{ stop.number }}</span>
            <span class="supplyRouteSummaryDetails"><span class="supplyRouteSummaryZone">{{ stop.zone }}</span><span class="supplyRouteSummaryPickup" v-show="stop.pickups">${loc('supply_freighter_route_pickup', ['{{ stop.pickups }}'])}</span></span>
            <span class="supplyRouteSummaryCurrent" v-show="stop.here">${loc('supply_freighter_route_here')}</span>
        </li>
    </ol>
</div>`;

function freightGroupCargo(ships){
    const cargo = {};
    ships.forEach(function(ship){
        Object.entries(freightCargo(ship)).forEach(function([res, amount]){
            cargo[res] = (cargo[res] || 0) + (Number(amount) || 0);
        });
    });
    return cargo;
}

function freightGroupLoad(ships){
    return ships.reduce((total, ship) => total + freightLoad(ship), 0);
}

function freightGroupCapacity(ships){
    return ships.reduce((total, ship) => total + freightCapacity(ship), 0);
}

function freightGroupWeight(ships){
    return ships.reduce((total, ship) => total + freightWeight(ship), 0);
}

// Routes travel at the pace of the slowest full fleet member, including any escorts.
function freightRouteSpeed(ships){
    const fleet = shipFleet(ships[0]);
    const group = fleet.length ? fleet : ships;
    return Math.round((149597870.7 / 225 / 24 / 3600) * Math.min(...group.map(shipSpeed)));
}

// Fill the least-loaded holds first. This leaves every freighter's total cargo within one unit
// whenever their capacities permit it, including after a previously uneven load.
function loadFreightGroup(ships, res, amount){
    let remaining = amount;
    while (remaining > 0){
        const open = ships.filter(ship => freightLoad(ship) < freightCapacity(ship));
        if (!open.length){ break; }
        open.sort((a,b) => freightLoad(a) - freightLoad(b));
        const low = freightLoad(open[0]);
        const matching = open.filter(ship => freightLoad(ship) === low);
        const next = open.find(ship => freightLoad(ship) > low);
        // Mixed Extra Fuel / Extra Cargo fleets can have different hold ceilings. Raise equal
        // loads together only as far as the smallest hold in that tied group permits.
        const rise = Math.min(...matching.map(ship => freightCapacity(ship) - low), next ? freightLoad(next) - low : Infinity);
        const each = Math.min(rise, Math.floor(remaining / matching.length));
        if (each > 0){
            matching.forEach(ship => { const cargo = freightCargo(ship); cargo[res] = (cargo[res] || 0) + each; });
            remaining -= each * matching.length;
        }
        else {
            matching.slice(0, remaining).forEach(ship => { const cargo = freightCargo(ship); cargo[res] = (cargo[res] || 0) + 1; });
            remaining = 0;
        }
    }
    return amount - remaining;
}

function unloadFreightGroup(ships, res, amount){
    let remaining = amount;
    while (remaining > 0){
        const loaded = ships.filter(ship => (freightCargo(ship)[res] || 0) > 0);
        if (!loaded.length){ break; }
        const each = Math.max(1, Math.floor(remaining / loaded.length));
        let moved = 0;
        loaded.forEach(function(ship){
            const cargo = freightCargo(ship);
            const take = Math.min(each, cargo[res] || 0, remaining - moved);
            if (take <= 0){ return; }
            cargo[res] -= take;
            if (cargo[res] <= 0){ delete cargo[res]; }
            moved += take;
        });
        if (!moved){ break; }
        remaining -= moved;
    }
    return amount - remaining;
}

function freightSolarMapModal(buefy, ship){
    if (!ship?.location?.position){ return; }
    buefy.modal.open({ hasModalCard: false, wide: true, customClass: 'evolve-modal', content: '<div id="modalBox" class="modalBox"></div>' });
    const checkExist = setInterval(function(){
        if (!$('#modalBox').length){ return; }
        clearInterval(checkExist);
        $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('solar_system')}</p>`));
        buildSolarMap($('#modalBox'), false, ship.location.position);
    }, 50);
}

function freightRoutePickupModal(buefy, stop, resources, refresh){
    const modal = buefy.modal.open({ hasModalCard: false, wide: true, customClass: 'evolve-modal', content: '<div id="modalBox" class="modalBox supplyLoadModal"></div>' });
    const checkExist = setInterval(function(){
        if (!$('#modalBox').length){ return; }
        clearInterval(checkExist);
        const available = resources.filter(res => (regDiff(res)[stop.zone] || 0) > 0);
        $('#modalBox').append($(`<p class="has-text-warning modalTitle">${loc('supply_freighter_route_pickup_title',[supplyRegionName(stop.zone)])}</p><div id="supplyRoutePickup"><div class="supplyRoutePickerHead"><button class="button is-info" @click="done">${loc('supply_freighter_route_pickup_done')}</button><span class="supplyRouteSelectionSummary" :class="{ 'has-text-caution': !picks.length }">{{ selectedText() }}</span></div><div class="supplyLoadResourceList">${available.map(res => `<button class="button supplyLoadResource supplyRouteResource" :class="{ 'is-info': selected('${res}'), 'supplyRouteResourceSelected': selected('${res}') }" :aria-pressed="selected('${res}')" @click="toggle('${res}')"><span class="supplyRouteResourceName"><span class="supplyRouteResourceMark" aria-hidden="true">{{ selected('${res}') ? '✓' : '+' }}</span>${global.resource[res].name}</span><span class="has-text-caution">{{ available('${res}') }}</span></button>`).join('')}</div></div>`));
        vBind({ el: '#supplyRoutePickup', data: { picks: Array.isArray(stop.pickups) ? stop.pickups.slice() : [] }, methods: {
            selected(res){ return this.picks.includes(res); },
            selectedText(){ return this.picks.length ? this.picks.map(res => global.resource[res].name).join(', ') : loc('supply_freighter_route_no_pickup'); },
            available(res){ return sizeApproximation(regAmount(res, stop.zone), 0); },
            toggle(res){ this.picks = this.picks.includes(res) ? this.picks.filter(pick => pick !== res) : this.picks.concat([res]); },
            done(){ stop.pickups = this.picks.slice(); refresh(); if (modal && modal.close){ modal.close(); } }
        }});
    }, 50);
}

function freightLoadModal(buefy, ships, pool, resources){
    const modal = buefy.modal.open({
        hasModalCard: false,
        wide: true,
        customClass: 'evolve-modal',
        content: '<div id="modalBox" class="modalBox supplyLoadModal"></div>'
    });
    const checkExist = setInterval(function(){
        if (!$('#modalBox').length){ return; }
        clearInterval(checkExist);
        const available = resources.filter(res => regAmount(res, pool) > 0);
        $('#modalBox').append($(`<p class="has-text-warning modalTitle">${loc('supply_freighter_load_title',[supplyRegionName(pool)])}</p>`));
        if (!available.length){
            $('#modalBox').append($(`<div class="supplyLoadEmpty has-text-caution">${loc('supply_freighter_no_resources')}</div>`));
            return;
        }
        const options = available.map(res => `<button class="button supplyLoadResource" @click="load('${res}')"><span>${global.resource[res].name}</span><span class="has-text-caution">{{ available('${res}') }}</span></button>`).join('');
        $('#modalBox').append($(`<div id="supplyLoadPicker"><div class="supplyLoadAmount"><label>${loc('supply_freighter_load_amount')}</label><b-input v-model.number="amount" type="number" min="1" step="1"></b-input><button class="button is-small" @click="max">${loc('supply_freighter_max')}</button><span class="supplyLoadCapacity has-text-caution">{{ cargo() }} / ${sizeApproximation(freightGroupCapacity(ships),0)}</span></div><div class="supplyLoadResourceList">${options}</div></div>`));
        vBind({ el: '#supplyLoadPicker', data: { amount: 10000 }, methods: {
            max(){ this.amount = Math.max(0, Math.floor(freightGroupCapacity(ships) - freightGroupLoad(ships))); },
            cargo(){ return sizeApproximation(freightGroupLoad(ships), 0); },
            available(res){ return sizeApproximation(regAmount(res, pool), 0); },
            load(res){
                const requested = Math.max(0, Math.floor(Number(this.amount) || 0));
                const free = Math.max(0, Math.floor(freightGroupCapacity(ships) - freightGroupLoad(ships)));
                const moved = Math.min(requested, free, Math.floor(regAmount(res, pool)));
                if (moved <= 0){ return; }
                const loaded = loadFreightGroup(ships, res, moved);
                if (loaded <= 0){ return; }
                poolMod(res, pool, -loaded);
                syncTotal(res);
                if (modal && modal.close){ modal.close(); }
                initSupplyZones();
            }
        }});
    }, 50);
}

export function initSupplyZones(){
    // Also migrates existing regional saves: the unlock already happened there, so the tech action
    // will not run again to seed the new starter routes.
    seedStarterSupplyRoutes();
    if (supplyZonesArrivalTimer){ clearTimeout(supplyZonesArrivalTimer); supplyZonesArrivalTimer = false; }
    supplyZonesInboundIds = [];
    supplyZonesInboundShips = [];
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 5)){ return; }
    const host = $('#resSupplyZones');
    clearElement(host);
    if (supplyMode() !== 'regional'){
        host.append($(`<div class="storage-header">${loc('supply_zones_locked')}</div>`));
        return;
    }
    host.append($(`<div class="storage-header supplyZonesTitle"><h2>${loc('tab_supply_zones')}</h2></div>`));
    const resources = Object.keys(global.resource).filter(res => atomic_mass[res] && global.resource[res].display);
    supplyPools().forEach(function(pool, index){
        const members = poolRegions(pool);
        const docked = (global.space.shipyard?.ships || []).filter(ship => ship.class === 'freighter' && !ship.inTransit && supplyPool(ship.location.name) === pool);
        const incoming = (global.space.shipyard?.ships || []).filter(ship => ship.class === 'freighter' && ship.inTransit && ship.destination && supplyPool(ship.destination.name) === pool);
        const card = $(`<section id="supplyZone${index}" class="market-item supplyZone"><header class="supplyZoneHead"><div><h3 class="res has-text-warning">${supplyRegionName(pool)}</h3><div class="supplyZoneMeta"><span>${loc('supply_zone_primary',[supplyRegionName(pool)])}</span><span>${loc('supply_zone_linked',[members.map(member => supplyRegionName(member, true)).join(', ')])}</span></div></div><span class="supplyZoneCount">${docked.length + incoming.length}</span></header></section>`);
        host.append(card);
        if (!docked.length && !incoming.length){ card.append(`<div class="supplyZoneEmpty has-text-caution">${loc('supply_zone_no_freighters')}</div>`); return; }
        if (incoming.length){
            const arrivals = $('<div class="supplyFreighterList supplyInboundList"></div>');
            card.append(arrivals);
            freightGroups(incoming).forEach(function(group, groupIndex){
                const ships = group.ships;
                const id = `supplyInbound${index}_${groupIndex}`;
                supplyZonesInboundIds.push(id);
                supplyZonesInboundShips.push(...ships);
                arrivals.append($(`<article id="${id}" class="supplyFreighter supplyFreighterIncoming"><header class="supplyFreighterHead"><div><span class="supplyFreighterName has-text-info">${group.name}</span><span class="supplyInboundStatus has-text-caution">{{ arrival() }}</span></div><div class="supplyFreighterStats"><span>${loc('supply_freighter_load')}: {{ load() }} / ${sizeApproximation(freightGroupCapacity(ships),0)}</span><span>${loc('supply_freighter_weight')}: {{ weight() }}</span><span v-show="route()">${loc('supply_freighter_route_speed',['{{ speed() }}'])}</span></div></header><div class="supplyInboundCargo" v-show="contents()">{{ contents() }}</div>${routeSummaryMarkup}<div class="supplyFreighterActions"><button class="button is-small" @click="openMap">${loc('outer_shipyard_map')}</button><button class="button is-small" v-show="route()" @click="stopRoute">${loc('supply_freighter_stop_route')}</button></div></article>`));
                vBind({ el: `#${id}`, data: ships[0], methods: {
                    route(){ return !!ships[0].tradeRoute; },
                    hasRoute(){ return !!ships[0].tradeRoute; },
                    summary(){ return routeSummary(ships[0]); },
                    managed(){ return routeManaged(ships[0]); },
                    openMap(){ freightSolarMapModal(this.$buefy, ships[0]); },
                    stopRoute(){ if (stopFreightRoute(ships[0])){ initSupplyZones(); } },
                    arrival(){ return loc('supply_freighter_arriving',[shipArrivalTime(ships[0])]); },
                    load(){ return sizeApproximation(freightGroupLoad(ships), 0); },
                    weight(){ return sizeApproximation(freightGroupWeight(ships), 0); },
                    speed(){ return freightRouteSpeed(ships); },
                    contents(){ return Object.entries(freightGroupCargo(ships)).filter(([,amount]) => amount > 0).map(([res,amount]) => `${global.resource[res].name}: ${sizeApproximation(amount,0)}`).join(', '); }
                }});
            });
        }
        if (!docked.length){ return; }
        const freightHost = $('<div class="supplyFreighterList"></div>');
        card.append(freightHost);
        freightGroups(docked).forEach(function(group, groupIndex){
            const ships = group.ships;
            const id = `supplyFreighter${index}_${groupIndex}`;
            const destinations = supplyPools().filter(target => target !== pool).map(target => `<button class="button is-small" @click="send('${target}')">${supplyRegionName(target)}</button>`).join('');
            freightHost.append($(`<article id="${id}" class="supplyFreighter"><header class="supplyFreighterHead"><div><span class="supplyFreighterName has-text-info">${group.name}</span><span class="supplyFreighterCapacity">{{ load() }} / ${sizeApproximation(freightGroupCapacity(ships),0)}</span></div><div class="supplyFreighterStats"><span>${loc('supply_freighter_weight')}: {{ weight() }}</span><span v-show="penalty()">{{ penalty() }}</span><span v-show="hasRoute()">${loc('supply_freighter_route_speed',['{{ speed() }}'])}</span></div></header><div class="supplyFreighterTabs"><button class="button is-small" :class="{ 'is-info': tab === 'cargo' }" @click="tab = 'cargo'">${loc('supply_freighter_cargo')}</button><button class="button is-small" :class="{ 'is-info': tab === 'route' }" @click="tab = 'route'">${loc('supply_freighter_routes')}</button><button class="button is-small" :class="{ 'is-success': auto }" v-show="showAuto()" @click="toggleAuto">{{ autoText() }}</button><button class="button is-small supplyFreighterMap" @click="openMap">${loc('outer_shipyard_map')}</button></div><section class="supplyManifest" v-show="tab === 'cargo'"><div class="supplyManifestHead"><span>${loc('supply_freighter_manifest')}</span><button class="button is-small is-info" @click="openLoad">${loc('supply_freighter_load_cargo')}</button></div><div class="supplyCargoRows" v-show="cargo().length"><div class="supplyCargoRow" v-for="item in cargo()"><span>{{ item.name }}</span><span class="has-text-caution">{{ item.amount }}</span><button class="button is-small" @click="unload(item.res)">${loc('supply_freighter_unload_all')}</button></div></div><div class="supplyCargoEmpty" v-show="!cargo().length">${loc('supply_freighter_empty')}</div></section><section class="supplyRoutePanel" v-show="tab === 'route'">${routeSummaryMarkup}<div class="supplyRouteStops" v-show="!hasRoute()"><div class="supplyRouteStop" v-for="(stop,index) in stops"><span class="supplyRouteNumber">{{ index + 1 }}</span><b-select v-model="stop.zone" :disabled="index === 0"><option v-for="zone in zones" :value="zone">{{ zoneName(zone) }}</option></b-select><button class="button is-small" @click="pick(index)">{{ pickupText(stop) }}</button><button class="button is-small" v-show="index > 1" @click="remove(index)">×</button></div></div><div class="supplyRouteActions" v-show="!hasRoute()"><button class="button is-small" @click="add">${loc('supply_freighter_route_add_stop')}</button><button class="button is-info" @click="start">${loc('supply_freighter_route_start')}</button></div><div class="supplyRouteActions" v-show="hasRoute()"><button class="button is-small" @click="stopRoute">${loc('supply_freighter_stop_route')}</button></div><p class="has-text-danger" v-show="routeError">${loc('supply_freighter_route_invalid')}</p></section><footer class="supplyDispatch"><span>${loc('supply_freighter_send')}:</span><div>${destinations}</div></footer></article>`));
            const route = ships[0].tradeRoute;
            const zones = supplyPools();
            const firstNext = zones.find(zone => zone !== pool) || pool;
            const stops = route?.stops?.length ? route.stops.map(stop => ({ zone: stop.zone, pickups: Array.isArray(stop.pickups) ? stop.pickups.slice() : [] })) : [{ zone: pool, pickups: [] }, { zone: firstNext, pickups: [] }];
            vBind({ el: `#${id}`, data: { tab: 'cargo', zones, stops, routeError: false, auto: autoRouteOn(ships[0]) }, methods: {
                // Show freight-governor controls only for opted-in routes.
                showAuto(){ return govTaskActive('freight'); },
                autoText(){ return this.auto ? loc('supply_freighter_auto_on') : loc('supply_freighter_auto_off'); },
                toggleAuto(){ this.auto = toggleAutoRoute(ships[0]); },
                load(){ return sizeApproximation(freightGroupLoad(ships), 0); },
                weight(){ return sizeApproximation(freightGroupWeight(ships), 0); },
                penalty(){ const penalty = Math.max(...ships.map(freightSpeedPenalty)); return penalty ? loc('supply_freighter_speed_penalty',[penalty]) : ''; },
                speed(){ return freightRouteSpeed(ships); },
                cargo(){ return Object.entries(freightGroupCargo(ships)).filter(([,amount]) => amount > 0).map(([res,amount]) => ({ res, name: global.resource[res].name, amount: sizeApproximation(amount,0) })); },
                openLoad(){ freightLoadModal(this.$buefy, ships, pool, resources); },
                openMap(){ freightSolarMapModal(this.$buefy, ships[0]); },
                hasRoute(){ return !!ships[0].tradeRoute; },
                summary(){ return routeSummary(ships[0]); },
                managed(){ return routeManaged(ships[0]); },
                zoneName(zone){ return supplyRegionName(zone); },
                pickupText(stop){ return stop.pickups.length ? stop.pickups.map(res => global.resource[res].name).join(', ') : loc('supply_freighter_route_no_pickup'); },
                pick(index){ freightRoutePickupModal(this.$buefy, this.stops[index], resources, () => vBind({ el: `#${id}` }, 'update')); },
                add(){ this.stops.push({ zone: this.zones.find(zone => zone !== pool) || pool, pickups: [] }); },
                remove(index){ this.stops.splice(index, 1); },
                start(){ this.routeError = !startFreightRoute(ships[0], this.stops); if (!this.routeError){ initSupplyZones(); } },
                stopRoute(){ if (stopFreightRoute(ships[0])){ initSupplyZones(); } },
                unload(res){
                    const held = freightGroupCargo(ships)[res] || 0;
                    if (held <= 0){ return; }
                    const spill = poolMod(res, pool, held);
                    const moved = held - Math.max(0, spill);
                    if (moved <= 0){ return; }
                    unloadFreightGroup(ships, res, moved);
                    syncTotal(res);
                    vBind({ el: `#${id}` }, 'update');
                },
                send(destination){ if (dispatchFreighter(ships[0], destination)){ initSupplyZones(); } }
            }});
        });
    });
    if (supplyZonesInboundIds.length){
        supplyZonesArrivalTimer = setTimeout(refreshInboundSupplyZones, 1000);
    }
}

function initStorage(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 1)){
        return;
    }
    let store = $(`<div id="createHead" class="storage-header"><h2 class="is-sr-only">${loc('tab_storage')}</h2></div>`);
    clearElement($('#resStorage'));
    loadStorageMultiplier();
    $('#resStorage').append(store);

    if (supplyMode() !== 'global'){
        $('#resStorage').append($(`<div class="stackLegend">
            <span></span><span></span>
            <span class="stored">${loc('tab_storage')}</span>
            <span>${global.resource.Crates.name}</span>
            <span>${global.resource.Containers.name}</span>
        </div>`));
    }
    
    if (global.resource['Crates'] && global.resource['Containers']){
        store.append($(`<b-tooltip :label="buildCrateDesc()" position="is-bottom" class="crate" animated multilined><button :aria-label="buildCrateDesc()" v-show="cr.display" class="button" @click="crate">${loc('resource_modal_crate_construct')}</button></b-tooltip>`));
        store.append($(`<b-tooltip :label="buildContainerDesc()" position="is-bottom" class="container" animated multilined><button :aria-label="buildContainerDesc()" v-show="cn.display" class="button" @click="container">${loc('resource_modal_container_construct')}</button></b-tooltip>`));

        vBind({
            el: '#createHead',
            data: {
                cr: global.resource.Crates,
                cn: global.resource.Containers
            },
            methods: {
                crate(){
                    buildCrate();
                },
                container(){
                    buildContainer();
                },
                buildCrateDesc(){
                    return buildCrateLabel();
                },
                buildContainerDesc(){
                    return buildContainerLabel();
                },
            }
        });
    }
}

function loadMarket(){
    if (supplyMode() !== 'global'){ return; }
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
        return;
    }

    let market = $('#market-qty');
    clearElement(market);

    if (!global.race['no_trade']){
        market.append($(`<h3 class="is-sr-only">${loc('resource_trade_qty')}</h3>`));
        market.append($(`<b-field class="market"><span class="button has-text-danger" role="button" @click="less">-</span><b-numberinput :input="val()" min="1" :max="limit()" v-model="qty" :controls="false"></b-numberinput><span class="button has-text-success" role="button" @click="more">+</span></b-field>`));

        vBind({
            el: `#market-qty`,
            data: global.city.market,
            methods: {
                val(){
                    if (global.city.market.qty < 1){
                        global.city.market.qty = 1;
                    }
                    else if (global.city.market.qty > tradeMax()){
                        global.city.market.qty = tradeMax();
                    }
                },
                limit(){
                    return tradeMax();
                },
                less(){
                    global.city.market.qty -= keyMultiplier();
                },
                more(){
                    global.city.market.qty += keyMultiplier();
                }
            }
        });
    }
}

function tradeMax(){
    if (global.tech['currency'] >= 6){
        return 1000000;
    }
    else if (global.tech['currency'] >= 4){
        return 5000;
    }
    else {
        return 100;
    }
}

function initEjector(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 2)){
        return;
    }
    clearElement($('#resEjector'));
    if (global.interstellar['mass_ejector']){
        let ejector = $(`<div id="eject" class="market-item"><h3 class="res has-text-warning">${loc('interstellar_mass_ejector_vol')}</h3></div>`);
        $('#resEjector').append(ejector);

        let eject = $(`<span class="trade"></span>`);
        ejector.append(eject);

        eject.append($(`<span>{{ total }} / {{ max(on) }}{{ real(on) }}</span><span class="mass">${loc('interstellar_mass_ejector_mass')}: {{ approx(mass) }} kt/s</span>`));

        vBind({
            el: `#eject`,
            data: global.interstellar.mass_ejector,
            methods: {
                max(num){
                    return num * 1000;
                },
                real(num){
                    if (p_on['mass_ejector'] < num){
                        return ` (${loc('interstellar_mass_ejector_active',[p_on['mass_ejector'] * 1000])})`;
                    }
                    return '';
                },
                approx(tons){
                    return sizeApproximation(tons,2);
                }
            }
        });
    }
}

export function loadEjector(name,color){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 2)){
        return;
    }
    else if (global.race['artifical'] && name === 'Food'){
        return;
    }
    if (atomic_mass[name] && global.interstellar['mass_ejector']){
        if (global.race.universe !== 'magic' && (name === 'Elerium' || name === 'Infernite')){
            color = 'caution';
        }
        let ejector = $(`<div id="eject${name}" class="market-item" v-show="r.display"><h3 class="res has-text-${color}">${global.resource[name].name}</h3></div>`);
        $('#resEjector').append(ejector);

        let res = $(`<span class="trade"></span>`);
        ejector.append(res);

        res.append($(`<span role="button" aria-label="eject less ${global.resource[name].name}" class="sub has-text-danger" @click="ejectLess('${name}')"><span>&laquo;</span></span>`));
        res.append($(`<span class="current">{{ e.${name} }}</span>`));
        res.append($(`<span role="button" aria-label="eject more ${global.resource[name].name}" class="add has-text-success" @click="ejectMore('${name}')"><span>&raquo;</span></span>`));

        res.append($(`<span class="mass">${loc('interstellar_mass_ejector_per')}: <span class="has-text-warning">${atomic_mass[name]}</span> kt</span>`));

        if (!global.interstellar.mass_ejector.hasOwnProperty(name)){
            global.interstellar.mass_ejector[name] = 0;
        }

        vBind({
            el: `#eject${name}`,
            data: {
                r: global.resource[name],
                e: global.interstellar.mass_ejector
            },
            methods: {
                ejectMore(r){
                    let keyMutipler = keyMultiplier();
                    if (keyMutipler + global.interstellar.mass_ejector.total > p_on['mass_ejector'] * 1000){
                        keyMutipler = p_on['mass_ejector'] * 1000 - global.interstellar.mass_ejector.total;
                    }
                    global.interstellar.mass_ejector[r] += keyMutipler;
                    global.interstellar.mass_ejector.total += keyMutipler;
                },
                ejectLess(r){
                    let keyMutipler = keyMultiplier();
                    if (keyMutipler > global.interstellar.mass_ejector[r]){
                        keyMutipler = global.interstellar.mass_ejector[r];
                    }
                    if (global.interstellar.mass_ejector[r] > 0){
                        global.interstellar.mass_ejector[r] -= keyMutipler;
                        global.interstellar.mass_ejector.total -= keyMutipler;
                    }
                },
            }
        });
    }
}

function initSupply(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 3)){
        return;
    }
    clearElement($('#resCargo'));
    if (global.portal['transport']){
        let supply = $(`<div id="spireSupply"><h3 class="res has-text-warning pad">${loc('portal_transport_supply')}</h3></div>`);
        $('#resCargo').append(supply);

        let cargo = $(`<span class="pad">{{ used }} / {{ max }}</span>`);
        supply.append(cargo);

        vBind({
            el: `#spireSupply`,
            data: global.portal.transport.cargo
        });
    }
}

export function loadSupply(name,color){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 3)){
        return;
    }
    if (supplyValue[name] && global.portal['transport']){
        let ejector = $(`<div id="supply${name}" class="market-item" v-show="r.display"><h3 class="res has-text-${color}">${global.resource[name].name}</h3></div>`);
        $('#resCargo').append(ejector);

        let res = $(`<span class="trade"></span>`);
        ejector.append(res);

        res.append($(`<span role="button" aria-label="eject less ${loc('resource_'+name+'_name')}" class="sub has-text-danger" @click="supplyLess('${name}')"><span>&laquo;</span></span>`));
        res.append($(`<span class="current">{{ e.${name} }}</span>`));
        res.append($(`<span role="button" aria-label="eject more ${loc('resource_'+name+'_name')}" class="add has-text-success" @click="supplyMore('${name}')"><span>&raquo;</span></span>`));

        let volume = sizeApproximation(supplyValue[name].out);
        res.append($(`<span class="mass">${loc('portal_transport_item',[`<span class="has-text-caution">${volume}</span>`,`<span class="has-text-success">${supplyValue[name].in}</span>`])}</span>`));

        if (!global.portal.transport.cargo.hasOwnProperty(name)){
            global.portal.transport.cargo[name] = 0;
        }

        vBind({
            el: `#supply${name}`,
            data: {
                r: global.resource[name],
                e: global.portal.transport.cargo
            },
            methods: {
                supplyMore(r){
                    let keyMutipler = keyMultiplier();
                    if (keyMutipler + global.portal.transport.cargo.used > global.portal.transport.cargo.max){
                        keyMutipler = global.portal.transport.cargo.max - global.portal.transport.cargo.used;
                        if (global.portal.transport.cargo[r] + keyMutipler < 0){
                            keyMutipler = -global.portal.transport.cargo[r];
                        }
                    }
                    global.portal.transport.cargo[r] += keyMutipler;
                    global.portal.transport.cargo.used += keyMutipler;
                },
                supplyLess(r){
                    let keyMutipler = keyMultiplier();
                    if (keyMutipler > global.portal.transport.cargo[r]){
                        keyMutipler = global.portal.transport.cargo[r];
                    }
                    if (global.portal.transport.cargo[r] > 0){
                        global.portal.transport.cargo[r] -= keyMutipler;
                        global.portal.transport.cargo.used -= keyMutipler;
                    }
                },
            }
        });
    }
}

function initAlchemy(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 4)){
        return;
    }
    clearElement($('#resAlchemy'));
}

export function loadAlchemy(name,color,basic){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 4)){
        return;
    }
    else if (global.race['artifical'] && name === 'Food'){
        return;
    }
    if (global.tech['alchemy'] && (basic || global.tech.alchemy >= 2) && name !== 'Crystal'){
        let alchemy = $(`<div id="alchemy${name}" class="market-item" v-show="r.display"><h3 class="res has-text-${color}">${global.resource[name].name}</h3></div>`);
        $('#resAlchemy').append(alchemy);

        let res = $(`<span class="trade"></span>`);
        alchemy.append(res);

        res.append($(`<span role="button" aria-label="transmute less ${global.resource[name].name}" class="sub has-text-danger" @click="subSpell('${name}')"><span>&laquo;</span></span>`));
        res.append($(`<span class="current">{{ a.${name} }}</span>`));
        res.append($(`<span role="button" aria-label="transmute more ${global.resource[name].name}" class="add has-text-success" @click="addSpell('${name}')"><span>&raquo;</span></span>`));

        if (!global.race.alchemy.hasOwnProperty(name)){
            global.race.alchemy[name] = 0;
        }

        vBind({
            el: `#alchemy${name}`,
            data: {
                r: global.resource[name],
                a: global.race.alchemy
            },
            methods: {
                addSpell(spell){
                    let keyMult = keyMultiplier();
                    let change = Math.min(Math.floor(global.resource.Mana.diff), keyMult);
                    if (change > 0) {
                        global.race.alchemy[spell] += change;
                        global.resource.Mana.diff -= change;
                    }
                },
                subSpell(spell){
                    let keyMult = keyMultiplier();
                    let change = Math.min(global.race.alchemy[spell], keyMult);
                    if (change > 0) {
                        global.race.alchemy[spell] -= change;
                        global.resource.Mana.diff += change;
                    }
                },
            }
        });

        popover(`alchemy${name}`,function(){
            let rate = basic && global.tech.alchemy >= 2 ? tradeRatio[name] * 8 : tradeRatio[name] * 2;
            if (global.race['witch_hunter']){ rate *= 3; }
            if (global.stats.achieve['soul_sponge'] && global.stats.achieve.soul_sponge['mg']){
                rate *= global.stats.achieve.soul_sponge.mg + 1;
            }
            return $(`<div>${loc('resource_alchemy',[1,loc(`resource_Mana_name`),0.15,loc(`resource_Crystal_name`),+rate.toFixed(2), global.resource[name].name])}</div>`);
        },
        {
            elm: `#alchemy${name} h3`
        });
    }
}

export const spatialReasoning = (function(){
    var spatial = {};
    return function (value,type,recalc){
        let tkey = type ? type : 'a';
        let key = [
            global.race.universe,
            global.prestige.Plasmid.count,
            global.prestige.AntiPlasmid.count,
            global.prestige.Phage.count,
            global.race['no_plasmid'] || '0',
            global.race['p_mutation'] || '0',
            global.race['nerfed'] || '0',
            global.genes['store'] || '0',
            global.genes['bleed'] || '0',
            templeCount(false) || '0',
            templeCount(true) || '0',
            global.race['cataclysm'] ? global.race.cataclysm : '0',
            global.race['orbit_decayed'] ? global.race.orbit_decayed : '0',
            global.genes['ancients'] || '0',
            global.civic['priest'] ? global.civic.priest.workers : '0'
        ].join('-');

        if (!spatial[tkey]){
            spatial[tkey] = {};
        }
        if (!spatial[tkey][key] || recalc){            
            let modifier = 1;
            if (global.genes['store']){
                let plasmids = 0;
                if (!type || (type && ((type === 'plasmid' && global.race.universe !== 'antimatter') || (type === 'anti' && global.race.universe === 'antimatter')))){
                    plasmids = global.race.universe === 'antimatter' ? global.prestige.AntiPlasmid.count : global.prestige.Plasmid.count;
                    let raw = plasmids;
                    if (global.race['no_plasmid']){
                        let active = global.race.p_mutation + (global.race['wish'] && global.race['wishStats'] ? global.race.wishStats.plas : 0);
                        raw = Math.min(active, plasmids);
                    }
                    else if (global.race['nerfed']){
                        raw = Math.floor(plasmids / (global.race.universe === 'antimatter' ? 2 : 5));
                    }
                    plasmids = Math.round(raw * (global.race['nerfed'] ? 0.5 : 1));
                }
                if (!type || (type && type === 'phage')){
                    if (global.genes['store'] >= 4){
                        plasmids += Math.round(global.prestige.Phage.count * (global.race['nerfed'] ? (1/3) : 1));
                    }
                }
                let divisor = global.genes.store >= 2 ? (global.genes.store >= 3 ? 1250 : 1666) : 2500;
                if (global.race.universe === 'antimatter'){
                    divisor *= 2;
                }
                if (global.genes['bleed'] && global.genes['bleed'] >= 3){
                    if (!type || (type && ((type === 'plasmid' && global.race.universe === 'antimatter') || (type === 'anti' && global.race.universe !== 'antimatter')))){
                        let raw = global.race.universe === 'antimatter' ? global.prestige.Plasmid.count / 5 : global.prestige.AntiPlasmid.count / 10;
                        plasmids += Math.round(raw * (global.race['nerfed'] ? 0.5 : 1));
                    }
                }
                modifier *= 1 + (plasmids / divisor);
            }
            if (global.race.universe === 'standard'){
                modifier *= darkEffect('standard');
            }
            if (global.race.universe === 'antimatter' && faithTempleCount()){
                let temple = 0.06;
                if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                    let priest = global.genes['ancients'] >= 5 ? 0.0012 : (global.genes['ancients'] >= 3 ? 0.001 : 0.0008);
                    if (global.race['high_pop']){
                        priest = highPopAdjust(priest);
                    }
                    temple += priest * global.civic.priest.workers;
                }
                modifier *= 1 + (faithTempleCount() * temple);
            }
            if (!type){
                if (global['pillars']){
                    let harmonic = calcPillar();
                    modifier *= harmonic[1];
                }
            }
            spatial[tkey] = {};
            spatial[tkey][key] = modifier;
        }
        return type ? (spatial[tkey][key] * value) : Math.round(spatial[tkey][key] * value);
    }
})();

export function faithTempleCount(){
    let noEarth = global.race['cataclysm'] || global.race['orbit_decayed'] ? true : false;
    return templeCount(noEarth);
}

export function faithBonus(num_temples = -1){
    // Zealot for everyone, Radiant for the angelic. Applied to the returned figure at the end.
    if (global.race['no_plasmid'] || global.race.universe === 'antimatter'){
        if (num_temples == -1){
            num_temples = faithTempleCount();
        }

        if (num_temples > 0){
            let temple_bonus = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 0.016 : 0.01;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                let indoc = workerScale(global.civic.professor.workers,'professor') * highPopAdjust(global.race.universe === 'antimatter' ? 0.0002 : 0.0004);
                temple_bonus += indoc;
            }
            if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                let priest_bonus = global.genes['ancients'] >= 5 ? 0.00015 : (global.genes['ancients'] >= 3 ? 0.000125 : 0.0001);
                temple_bonus += highPopAdjust(priest_bonus) * workerScale(global.civic.priest.workers,'priest');
            }
            if (global.race.universe === 'antimatter'){
                temple_bonus /= (global.race['nerfed'] ? 3 : 2);
            }
            else if (global.race['nerfed']){
                temple_bonus /= 2;
            }
            if (global.race['spiritual']){
                temple_bonus *= 1 + (traits.spiritual.vars()[0] / 100);
            }
            let fathom = fathomCheck('seraph');
            if (fathom > 0){
                temple_bonus *= 1 + (traits.spiritual.vars(1)[0] / 100 * fathom);
            }
            if (global.race['blasphemous']){
                temple_bonus *= 1 - (traits.blasphemous.vars()[0] / 100);
            }
            if (global.civic.govern.type === 'theocracy'){
                temple_bonus *= 1 + (govEffect.theocracy()[0] / 100);
            }
            if (global.race['ooze']){
                temple_bonus *= 1 - (traits.ooze.vars()[1] / 100);
            }

            return num_temples * temple_bonus * geneBonus('zealot') * geneBonus('radiant');
        }
    }
    return 0;
}

export function templePlasmidBonus(num_temples = -1){
    if (!global.race['no_plasmid'] && global.race.universe !== 'antimatter'){
        if (num_temples == -1){
            num_temples = faithTempleCount();
        }

        if (num_temples > 0){
            let temple_bonus = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 0.08 : 0.05;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                let indoc = workerScale(global.civic.professor.workers,'professor') * highPopAdjust(0.002);
                temple_bonus += indoc;
            }
            if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                let priest_bonus = global.genes['ancients'] >= 5 ? 0.0015 : (global.genes['ancients'] >= 3 ? 0.00125 : 0.001);
                temple_bonus += highPopAdjust(priest_bonus) * workerScale(global.civic.priest.workers,'priest');
            }
            if (global.race['spiritual']){
                temple_bonus *= 1 + (traits.spiritual.vars()[0] / 100);
            }
            let fathom = fathomCheck('seraph');
            if (fathom > 0){
                temple_bonus *= 1 + (traits.spiritual.vars(1)[0] / 100 * fathom);
            }
            if (global.race['blasphemous']){
                temple_bonus *= 1 - (traits.blasphemous.vars()[0] / 100);
            }
            if (global.civic.govern.type === 'theocracy'){
                temple_bonus *= 1 + (govEffect.theocracy()[0] / 100);
            }
            if (global.race['ooze']){
                temple_bonus *= 1 - (traits.ooze.vars()[1] / 100);
            }
            if (global.race['orbit_decayed'] && global.race['truepath']){
                temple_bonus *= 0.1;
            }

            return num_temples * temple_bonus;
        }
    }
    return 0;
}

export const plasmidBonus = (function (){
    var plasma = {};
    return function(type){
        let key = [
            global.race.universe,
            global.prestige.Plasmid.count,
            global.prestige.AntiPlasmid.count,
            global.prestige.Phage.count,
            global.civic.govern.type,
            global.civic.professor.assigned,
            global.genes['bleed'] || '0',
            global.race['decayed'] || '0',
            global.race['gene_fortify'] || '0',
            global.tech['anthropology'] || '0',
            global.tech['fanaticism'] || '0',
            global.race['nerfed'] || '0',
            global.race['no_plasmid'] || '0',
            global.genes['ancients'] || '0',
            templeCount(false) || '0',
            templeCount(true) || '0',
            global.civic['priest'] ? global.civic.priest.workers : '0',
            global.race['orbit_decayed'] ? global.race.orbit_decayed : '0',
            global.race['spiritual'] || '0',
            global.tech['outpost_boost'] || '0',
            p_on['alien_outpost'] || '0',
        ].join('-');

        if (!plasma[key]){
            let standard = 0;
            let anti = 0; 
            if (global.race.universe !== 'antimatter' || global.genes['bleed']){
                let active = global.race.p_mutation + (global.race['wish'] && global.race['wishStats'] ? global.race.wishStats.plas : 0);
                let plasmids = global.race['no_plasmid'] ? Math.min(active, global.prestige.Plasmid.count) : global.prestige.Plasmid.count;
                if (global.race.universe === 'antimatter' && global.genes['bleed']){
                    plasmids *= 0.025
                }
                if (global.race['decayed']){
                    plasmids -= Math.round((global.stats.days - global.race.decayed) / (300 + global.race.gene_fortify * 6));
                }
                let p_cap = 250 + global.prestige.Phage.count;
                if (plasmids > p_cap){
                    standard = (+((Math.log(p_cap + 50) - 3.91202)).toFixed(5) / 2.888) + ((Math.log(plasmids + 1 - p_cap) / Math.LN2 / 250));
                }
                else if (plasmids < 0){
                    standard = 0;
                }
                else {
                    standard = +((Math.log(plasmids + 50) - 3.91202)).toFixed(5) / 2.888;
                }
                if (global.tech['outpost_boost'] && global.race['truepath'] && p_on['alien_outpost']){
                    standard *= 2;
                }

                let temple_bonus = templePlasmidBonus();
                standard *= 1 + temple_bonus;
            }

            if (global.race.universe === 'antimatter' || (global.genes['bleed'] && global.genes['bleed'] >= 2)){
                let plasmids = global.prestige.AntiPlasmid.count;
                if (global.race.universe !== 'antimatter' && global.genes['bleed'] && global.genes['bleed'] >= 2){
                    plasmids *= 0.25
                }
                if (global.race['decayed']){
                    plasmids -= Math.round((global.stats.days - global.race.decayed) / (300 + global.race.gene_fortify * 6));
                }
                let p_cap = 250 + global.prestige.Phage.count;
                if (plasmids > p_cap){
                    anti = (+((Math.log(p_cap + 50) - 3.91202)).toFixed(5) / 2.888) + ((Math.log(plasmids + 1 - p_cap) / Math.LN2 / 250));
                }
                else if (plasmids < 0){
                    anti = 0;
                }
                else {
                    anti = +((Math.log(plasmids + 50) - 3.91202)).toFixed(5) / 2.888;
                }
                if (global.tech['outpost_boost'] && global.race['truepath'] && p_on['alien_outpost']){
                    anti *= 2;
                }
                anti /= 3;
            }

            if (global.race['nerfed']){
                if (global.race.universe === 'antimatter'){
                    standard /= 2;
                    anti /= 2;
                }
                else {
                    standard /= 5;
                    anti /= 5;
                }
            }

            plasma = {};
            let final = (1 + standard) * (1 + anti) - 1;            
            plasma[key] = [final,standard,anti];
        }

        if (type && type === 'raw'){
            return plasma[key];
        }
        else if (type && type === 'plasmid'){
            return plasma[key][1];
        }
        else if (type && type === 'antiplasmid'){
            return plasma[key][2];
        }
        else {
            return plasma[key][0];
        }
    }
})();
