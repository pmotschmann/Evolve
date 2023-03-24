import { global, tmp_vars, keyMultiplier, breakdown, sizeApproximation, p_on, support_on } from './vars.js';
import { vBind, clearElement, modRes, flib, calc_mastery, calcPillar, eventActive, easterEgg, trickOrTreat, popover, harmonyEffect, darkEffect, hoovedRename } from './functions.js';
import { traits } from './races.js';
import { hellSupression } from './portal.js';
import { syndicate } from './truepath.js';
import { govActive } from './governor.js';
import { govEffect } from './civics.js';
import { highPopAdjust } from './prod.js';
import { loc } from './locale.js';

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
    Horseshoe: 0,
    Nanite: 0,
    Genes: 0,
    Soul_Gem: 0,
    Corrupt_Gem: 0,
    Codex: 0,
    Cipher: 0,
    Demonic_Essence: 0
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
    Water: 18.01,
    Plywood: 7.666,
    Brick: 20.009,
    Wrought_Iron: 55.845,
    Sheet_Metal: 26.9815,
    Mythril: 94.239,
    Aerogel: 7.84,
    Nanoweave: 23.71,
    Scarletite: 188.6,
    Quantium: 241.35
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

export function craftCost(){
    let costs = {
        Plywood: [{ r: 'Lumber', a: 100 }],
        Brick: [{ r: 'Cement', a: 40 }],
        Wrought_Iron: [{ r: 'Iron', a: 80 }],
        Sheet_Metal: [{ r: 'Aluminium', a: 120 }],
        Mythril: [{ r: 'Iridium', a: 100 },{ r: 'Alloy', a: 250 }],
        Aerogel: [{ r: 'Graphene', a: 2500 },{ r: 'Infernite', a: 50 }],
        Nanoweave: [{ r: 'Nano_Tube', a: 1000 },{ r: 'Vitreloy', a: 40 }],
        Scarletite: [{ r: 'Iron', a: 250000 },{ r: 'Adamantite', a: 7500 },{ r: 'Orichalcum', a: 500 }],
        Quantium: [{ r: 'Nano_Tube', a: 1000 },{ r: 'Graphene', a: 1000 },{ r: 'Elerium', a: 25 }],
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
    if (global.race['high_pop']){
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
            if (global.space['fabrication'] && support_on['fabrication']){
                crafting.general.add.push({
                    name: loc(`space_red_fabrication_title`),
                    manual: support_on['fabrication'] * global.civic.colonist.workers * (noEarth ? highPopAdjust(0.05) : highPopAdjust(0.02)),
                    auto: support_on['fabrication'] * global.civic.colonist.workers * (noEarth ? highPopAdjust(0.05) : highPopAdjust(0.02))
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
                    manual: traits.ambidextrous.vars()[0] * global.race['ambidextrous'] / 100,
                    auto: traits.ambidextrous.vars()[0] * global.race['ambidextrous'] / 100
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
            if (global.race['casting'] && global.race.casting['crafting']){
                let boost_m = 1 + (global.race.casting['crafting'] / (global.race.casting['crafting'] + 75));
                let boost_a = 1 + (2 * global.race.casting['crafting'] / (2 * global.race.casting['crafting'] + 75));
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
                    auto: 1 + (traits.ambidextrous.vars()[1] * global.race['ambidextrous'] / 100)
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
        }
    }
    else {
        initMarket();
        initStorage();
        initEjector();
        initSupply();
        initAlchemy();
    }
}

// Sets up resource definitions
export function defineResources(wiki){
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
    loadResource('Mana',wiki,0,1,false,false,'warning');
    loadResource('Knowledge',wiki,100,1,false,false,'warning');
    loadResource('Zen',wiki,0,0,false,false,'warning');
    loadResource('Crates',wiki,0,0,false,false,'warning');
    loadResource('Containers',wiki,0,0,false,false,'warning');
    loadResource('Food',wiki,250,1,true,true);
    loadResource('Lumber',wiki,200,1,true,true);
    loadResource('Chrysotile',wiki,200,1,true,true);
    loadResource('Stone',wiki,200,1,true,true);
    loadResource('Crystal',wiki,200,1,true,true);
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
    loadResource('Unobtainium',wiki,0,1,false,false,'advanced');
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
    loadResource('Corrupt_Gem',wiki,-2,0,false,false,'caution');
    loadResource('Codex',wiki,-2,0,false,false,'caution');
    loadResource('Cipher',wiki,0,1,false,false,'caution');
    loadResource('Demonic_Essence',wiki,-2,0,false,false,'caution');
    if (wiki){ return; }
    loadSpecialResource('Blood_Stone','caution');
    loadSpecialResource('Artifact','caution');
    loadSpecialResource('Plasmid');
    loadSpecialResource('AntiPlasmid');
    loadSpecialResource('Phage');
    loadSpecialResource('Dark');
    loadSpecialResource('Harmony');
    loadSpecialResource('AICore');
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
    if (!global['resource'][name]['trade'] && tradable){
        global['resource'][name]['trade'] = 0;
    }

    var res_container;
    if (global.resource[name].max === -1 || global.resource[name].max === -2){
        res_container = $(`<div id="res${name}" class="resource crafted" v-show="display"><h3 class="res has-text-${color}">{{ name | namespace }}</h3><span id="cnt${name}" class="count">{{ amount | diffSize }}</span></div>`);
    }
    else {
        res_container = $(`<div id="res${name}" class="resource" v-show="display"><h3 class="res has-text-${color}">{{ name | namespace }}</h3><span id="cnt${name}" class="count">{{ amount | size }} / {{ max | size }}</span></div>`);
    }

    if (stackable){
        res_container.append($(`<span><span id="con${name}" v-if="showTrigger()" class="interact has-text-success" @click="trigModal" role="button" aria-label="Open crate management for ${name}">+</span></span>`));
    }
    else if (max !== -1 || (max === -1 && rate === 0 && global.race['no_craft']) || name === 'Scarletite' || name === 'Quantium'){
        res_container.append($('<span></span>'));
    }
    
    let infopops = false;
    if (rate !== 0 || (max === -1 && rate === 0 && global.race['no_craft']) || name === 'Scarletite' || name === 'Quantium'){
        res_container.append($(`<span id="inc${name}" class="diff" :aria-label="resRate('${name}')">{{ diff | diffSize }} /s</span>`));
    }
    else if (max === -1 && !global.race['no_craft'] && name !== 'Scarletite' && name !== 'Quantium'){
        let craft = $('<span class="craftable"></span>');
        res_container.append(craft);

        let inc = [1,5];
        for (let i=0; i<inc.length; i++){
            craft.append($(`<span id="inc${name}${inc[i]}"><a @click="craft('${name}',${inc[i]})" aria-label="craft ${inc[i]} ${name}">+<span class="craft" data-val="${inc[i]}">${inc[i]}</span></a></span>`));
        }
        craft.append($(`<span id="inc${name}A"><a @click="craft('${name}','A')" aria-label="craft max ${name}">+<span class="craft" data-val="${'A'}">A</span></a></span>`));
        infopops = true;
    }
    else {
        res_container.append($(`<span></span>`));
    }
    
    $('#resources').append(res_container);

    var modal = {
            template: '<div id="modalBox" class="modalBox"></div>'
        };
    
    vBind({
        el: `#res${name}`,
        data: global['resource'][name], 
        filters: {
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
            }
        },
        methods: {
            resRate(n){
                let diff = sizeApproximation(global.resource[n].diff,2);
                return `${n} ${diff} per second`;
            },
            trigModal(){
                this.$buefy.modal.open({
                    parent: this,
                    component: modal
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
                    let craft_costs = craftCost();
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
                let craft_costs = craftCost();
                for (let i=0; i<craft_costs[res].length; i++){
                    let num = vol * craft_costs[res][i].a * keyMultiplier();
                    costs = costs + `<div>${global.resource[craft_costs[res][i].r].name} ${num}</div>`;
                }
                return costs;
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
                
                let craft_costs = craftCost();
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

    if (name !== global.race.species && name !== 'Crates' && name !== 'Containers' && max !== -1){
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
        stackable: stackable
    };
}

export function setResourceName(name){
    if (name === global.race.species){
        global.resource[name].name = flib('name');
    }
    else {
        global.resource[name].name = name === 'Money' ? '$' : loc(`resource_${name}_name`);
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

    /* Too many hard coded string references to cement, maybe some other day
    if (global.city.biome === 'ashland'){
        switch(name){
            case 'Cement':
                global['resource'][name].name = loc('resource_Ashcrete_name');
                break;
        }
    }*/

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

    var res_container = $(`<div id="res${name}" class="resource" v-show="count"><span class="res has-text-${color}">${loc(`resource_${name}_name`)}</span><span class="count">{{ count | round }}</span></div>`);
    $('#resources').append(res_container);
    
    vBind({
        el: `#res${name}`,
        data: global.prestige[name],
        filters: {
            round(n){ return +(n).toFixed(3); }
        }
    });

    if (name === "Artifact" || name === "Blood_Stone"){
        return;
    }

    popover(`res${name}`, function(){
        let desc = $(`<div></div>`);
        switch (name){
            case 'Plasmid':
                let active = global.race['no_plasmid'] ? Math.min(global.race.p_mutation, global.prestige.Plasmid.count) : global.prestige.Plasmid.count;
                desc.append($(`<span>${loc(`resource_${name}_desc`,[active, +(plasmidBonus('plasmid') * 100).toFixed(2)])}</span>`));
                if (global.genes['store'] && (global.race.universe !== 'antimatter' || global.genes['bleed'] >= 3)){
                    let plasmidSpatial = spatialReasoning(1,'plasmid');
                    if (plasmidSpatial > 1){
                        desc.append($(`<span> ${loc(`resource_Plasmid_desc2`,[+((plasmidSpatial - 1) * 100).toFixed(2)])}</span>`));
                    }   
                }
                break;
    
            case 'AntiPlasmid':
                desc.append($(`<span>${loc(`resource_${name}_desc`,[global.prestige.AntiPlasmid.count, +(plasmidBonus('antiplasmid') * 100).toFixed(2)])}</span>`));
                let antiSpatial = spatialReasoning(1,'anti');
                if (global.genes['store'] && (global.race.universe === 'antimatter' || global.genes['bleed'] >= 3)){
                    if (antiSpatial > 1){
                        desc.append($(`<span> ${loc(`resource_Plasmid_desc2`,[+((antiSpatial - 1) * 100).toFixed(2)])}</span>`));
                    }
                }
                break;
    
            case 'Phage':
                desc.append($(`<span>${loc(global.prestige.AntiPlasmid.count > 0 ? `resource_Phage_desc2` : `resource_Phage_desc`,[250 + global.prestige.Phage.count])}</span>`));
                let phageSpatial = spatialReasoning(1,'phage');
                if (global.genes['store'] && global.genes['store'] >= 4){
                    if (phageSpatial > 1){
                        desc.append($(`<span> ${loc(`resource_Plasmid_desc2`,[+((phageSpatial - 1) * 100).toFixed(2)])}</span>`));
                    }
                }
                break;
    
            case 'Dark':
                switch (global.race.universe){
                    case 'standard':
                        desc.append($(`<span>${loc(`resource_${name}_desc_s`,[+((darkEffect('standard') - 1) * 100).toFixed(2)])}</span>`));
                        break;
    
                    case 'evil':
                        desc.append($(`<span>${loc(`resource_${name}_desc_e`,[+((darkEffect('evil') - 1) * 100).toFixed(2)])}</span>`));
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
                break;
    
            case 'Harmony':
                desc.append($(`<span>${loc(`resource_${name}_desc`,[global.race.universe === 'standard' ? 0.1 : 1, harmonyEffect()])}</span>`));
                break;

            case 'AICore':
                let bonus = +((1 - (0.99 ** global.prestige.AICore.count)) * 100).toFixed(2);
                desc.append($(`<span>${loc(`resource_${name}_desc`,[bonus])}</span>`));
                break;
        }
        return desc;
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

export function marketItem(mount,market_item,name,color,full){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
        return;
    }

    if (global.race['artifical'] && name === 'Food'){
        return;
    }

    if (full){
        market_item.append($(`<h3 class="res has-text-${color}">{{ r.name | namespace }}</h3>`));
    }

    if (!global.race['no_trade']){
        market_item.append($(`<span class="buy"><span class="has-text-success">${loc('resource_market_buy')}</span></span>`));
        market_item.append($(`<span role="button" class="order" @click="purchase('${name}')">\${{ r.value | buy }}</span>`));
        
        market_item.append($(`<span class="sell"><span class="has-text-danger">${loc('resource_market_sell')}</span></span>`));
        market_item.append($(`<span role="button" class="order" @click="sell('${name}')">\${{ r.value | sell }}</span>`));
    }

    if (full && ((global.race['banana'] && name === 'Food') || (global.tech['trade'] && !global.race['terrifying']))){
        let trade = $(`<span class="trade" v-show="m.active"><span class="has-text-warning">${loc('resource_market_routes')}</span></span>`);
        market_item.append(trade);
        trade.append($(`<b-tooltip :label="aSell('${name}')" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="export ${name}" class="sub has-text-danger" @click="autoSell('${name}')"><span>-</span></span></b-tooltip>`));
        trade.append($(`<span class="current" v-html="$options.filters.trade(r.trade)"></span>`));
        trade.append($(`<b-tooltip :label="aBuy('${name}')" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="import ${name}" class="add has-text-success" @click="autoBuy('${name}')"><span>+</span></span></b-tooltip>`));
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
                    rate *= 1 + (global.race['persuasive'] / 100);
                }
                if (global.race['merchant']){
                    rate *= 1 + (traits.merchant.vars()[1] / 100);
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
                if (global.race['truepath']){
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
                    if (global.race['asymmetrical']){
                        divide *= 1 + (traits.asymmetrical.vars()[0] / 100);
                    }
                    if (global.race['conniving']){
                        divide *= 1 - (traits.conniving.vars()[1] / 100);
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
            autoBuy(res){
                let keyMult = keyMultiplier();
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
            autoSell(res){
                let keyMult = keyMultiplier();
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
                global.city.market.trade -= Math.abs(global.resource[res].trade);
                global.resource[res].trade = 0;
                tradeRouteColor(res);
            }
        },
        filters: {
            buy(value){
                if (global.race['arrogant']){
                    value *= 1 + (traits.arrogant.vars()[0] / 100);
                }
                return sizeApproximation(value * global.city.market.qty,0);
            },
            sell(value){
                let divide = 4;
                if (global.race['merchant']){
                    divide *= 1 - (traits.merchant.vars()[0] / 100);
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
    $('#market').append($(`<div id="galaxyTrade" v-show="t.xeno && t.xeno >= 5" class="market-header galaxyTrade"><h2 class="is-sr-only">${loc('galaxy_trade')}</h2></div>`));
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
    let galaxyTrade = modal ? modal : $(`#galaxyTrade`);
    if (!modal){
        clearElement($(`#galaxyTrade`));
    }

    if (global.galaxy['trade']){
        galaxyTrade.append($(`<div class="market-item trade-header"><span class="has-text-special">${loc('galaxy_trade')}</span></div>`));

        let offers = galaxyOffers();
        for (let i=0; i<offers.length; i++){
            let offer = $(`<div class="market-item trade-offer"></div>`);
            galaxyTrade.append(offer);

            offer.append($(`<span class="offer-item has-text-success">${global.resource[offers[i].buy.res].name}</span>`));
            offer.append($(`<span class="offer-vol has-text-advanced">+{{ '${i}' | t_vol }}/s</span>`));
            
            offer.append($(`<span class="offer-item has-text-danger">${global.resource[offers[i].sell.res].name}</span>`));
            offer.append($(`<span class="offer-vol has-text-caution">-{{ '${i}' | s_vol }}/s</span>`));

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
            }
        },
        filters: {
            t_vol(idx){
                let offers = galaxyOffers();
                let buy_vol = offers[idx].buy.vol;
                if (global.race['persuasive']){
                    buy_vol *= 1 + (global.race['persuasive'] / 100);
                }
                if (global.race['merchant']){
                    buy_vol *= 1 + (traits.merchant.vars()[1] / 100);
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

function unassignCrate(res){
    let keyMutipler = keyMultiplier();
    let cap = crateValue();
    if (keyMutipler > global.resource[res].crates){
        keyMutipler = global.resource[res].crates;
    }
    if (keyMutipler > 0){
        global.resource.Crates.amount += keyMutipler;
        global.resource.Crates.max += keyMutipler;
        global.resource[res].crates -= keyMutipler;
        global.resource[res].max -= (cap * keyMutipler);
    }
}

function assignCrate(res){
    let keyMutipler = keyMultiplier();
    let cap = crateValue();
    if (keyMutipler > global.resource.Crates.amount){
        keyMutipler = global.resource.Crates.amount;
    }
    if (keyMutipler > 0){
        global.resource.Crates.amount -= keyMutipler;
        global.resource.Crates.max -= keyMutipler;
        global.resource[res].crates += keyMutipler;
        global.resource[res].max += (cap * keyMutipler);
    }
}

function unassignContainer(res){
    let keyMutipler = keyMultiplier();
    let cap = containerValue();
    if (keyMutipler > global.resource[res].containers){
        keyMutipler = global.resource[res].containers;
    }
    if (keyMutipler > 0){
        global.resource.Containers.amount += keyMutipler;
        global.resource.Containers.max += keyMutipler;
        global.resource[res].containers -= keyMutipler;
        global.resource[res].max -= (cap * keyMutipler);
    }
}

function assignContainer(res){
    let keyMutipler = keyMultiplier();
    let cap = containerValue();
    if (keyMutipler > global.resource.Containers.amount){
        keyMutipler = global.resource.Containers.amount;
    }
    if (keyMutipler > 0){
        global.resource.Containers.amount -= keyMutipler;
        global.resource.Containers.max -= keyMutipler;
        global.resource[res].containers += keyMutipler;
        global.resource[res].max += (cap * keyMutipler);
    }
}

export function containerItem(mount,market_item,name,color){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 1)){
        return;
    }

    market_item.append($(`<h3 class="res has-text-${color}">{{ name }}</h3>`));

    if (global.resource.Crates.display){
        let crate = $(`<span class="trade"><span class="has-text-warning">${loc('resource_Crates_name')}</span></span>`);
        market_item.append(crate);

        crate.append($(`<span role="button" aria-label="remove ${name} ${loc('resource_Crates_name')}" class="sub has-text-danger" @click="subCrate('${name}')"><span>&laquo;</span></span>`));
        crate.append($(`<span class="current" v-html="$options.filters.cCnt(crates,'${name}')"></span>`));
        crate.append($(`<span role="button" aria-label="add ${name} ${loc('resource_Crates_name')}" class="add has-text-success" @click="addCrate('${name}')"><span>&raquo;</span></span>`));
    }

    if (global.resource.Containers.display){
        let container = $(`<span class="trade"><span class="has-text-warning">${loc('resource_Containers_name')}</span></span>`);
        market_item.append(container);

        container.append($(`<span role="button" aria-label="remove ${name} ${loc('resource_Containers_name')}" class="sub has-text-danger" @click="subCon('${name}')"><span>&laquo;</span></span>`));
        container.append($(`<span class="current" v-html="$options.filters.trick(containers)"></span>`));
        container.append($(`<span role="button" aria-label="add ${name} ${loc('resource_Containers_name')}" class="add has-text-success" @click="addCon('${name}')"><span>&raquo;</span></span>`));
    }

    vBind({
        el: mount,
        data: global.resource[name],
        methods: {
            addCrate(res){
                assignCrate(res);
            },
            subCrate(res){
                unassignCrate(res);
            },
            addCon(res){
                assignContainer(res);
            },
            subCon(res){
                unassignContainer(res);
            }
        },
        filters: {
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
                if (res === 'Food'){
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
    if (global.race['asymmetrical']){
        divide *= 1 + (traits.asymmetrical.vars()[0] / 100);
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
    if (global.race['truepath'] && !global.race['lone_survivor']){
        price *= 1 - (global.civic.foreign.gov3.hstl / 101);
    }
    if (global.race['inflation']){
        price *= 1 + (global.race.inflation / 500);
    }
    price = +(price).toFixed(1);
    return price;
}

export function tradeBuyPrice(res){
    let rate = global.resource[res].value;
    if (global.race['arrogant']){
        rate *= 1 + (traits.arrogant.vars()[0] / 100);
    }
    if (global.race['conniving']){
        rate *= 1 - (traits.conniving.vars()[0] / 100);
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
    if (global.race['truepath'] && !global.race['lone_survivor']){
        price *= 1 + (global.civic.foreign.gov3.hstl / 101);
    }
    if (global.race['inflation']){
        price *= 1 + (global.race.inflation / 300);
    }
    if (global.race['quarantine']){
        price *= 1 + Math.round(global.race.quarantine ** 3.5);
    }
    price = +(price).toFixed(1);
    return price;
}

export function craftingPopover(id,res,type,extra){
    popover(`${id}`,function(){
        let bd = $(`<div class="resBreakdown"><div class="has-text-info">{{ res.name | namespace }}</div></div>`);
        let table = $(`<div class="parent"></div>`);
        bd.append(table);
        
        let craft_total = craftingRatio(res,type);

        let col1 = $(`<div></div>`);
        table.append(col1);
        if (type === 'auto' && breakdown.p[res]){
            Object.keys(breakdown.p[res]).forEach(function (mod){
                let raw = breakdown.p[res][mod];
                let val = parseFloat(raw.slice(0,-1));
                if (val != 0 && !isNaN(val)){
                    let type = val > 0 ? 'success' : 'danger';
                    let label = mod.replace(/\+.+$/,"");
                    mod = mod.replace(/'/g, "\\'");
                    col1.append(`<div class="modal_bd"><span>${label}</span><span class="has-text-${type}">{{ ${[res]}['${mod}'] | translate }}</span></div>`);
                }
            });
        }
        Object.keys(craft_total.multi_bd).forEach(function (mod){
            let raw = craft_total.multi_bd[mod];
            let val = parseFloat(raw.slice(0,-1));
            if (val != 0 && !isNaN(val)){
                let type = val > 0 ? 'success' : 'danger';
                let label = mod.replace(/\+.+$/,"");
                mod = mod.replace(/'/g, "\\'");
                col1.append(`<div class="modal_bd"><span>${label}</span><span class="has-text-${type}">{{ craft.multi_bd['${mod}'] | translate }}</span></div>`);
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
                mod = mod.replace(/'/g, "\\'");
                col2.append(`<div class="modal_bd"><span>${label}</span><span class="has-text-${type}">{{ craft.add_bd['${mod}'] | translate }}</span></div>`);
            }
        });
        if (count > 0){
            table.append(col2);
        }

        if (breakdown.p.consume && breakdown.p.consume[res]){
            let col3 = $(`<div class="col"></div>`);
            let count = 0;
            Object.keys(breakdown.p.consume[res]).forEach(function (mod){                
                let val = breakdown.p.consume[res][mod];
                if (val != 0 && !isNaN(val)){
                    count++;
                    let type = val > 0 ? 'success' : 'danger';
                    let label = mod.replace(/\+.+$/,"");
                    mod = mod.replace(/'/g, "\\'");
                    col3.append(`<div class="modal_bd"><span>${label}</span><span class="has-text-${type}">{{ consume.${res}['${mod}'] | fix | translate }}</span></div>`);
                }
            });
            if (count > 0){
                table.append(col3);
            }
        }
        
        if (global['resource'][res].diff < 0 && global['resource'][res].amount > 0){
            bd.append(`<div class="modal_bd sum"><span>${loc('to_empty')}</span><span class="has-text-danger">{{ res.amount | counter }}</span></div>`);
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
                    [res]: breakdown.p[res],
                    res: global['resource'][res],
                    'consume': breakdown.p['consume'],
                    craft: craftingRatio(res,type)
                }, 
                filters: {
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

function breakdownPopover(id,name,type){
    popover(`${id}`,function(){
        let bd = $(`<div class="resBreakdown"><div class="has-text-info">{{ res.name | namespace }}</div></div>`);
        let table = $(`<div class="parent"></div>`);
        bd.append(table);
        let prevCol = false;
        
        if (breakdown[type][name]){
            let col1 = $(`<div></div>`);
            table.append(col1);
            let types = [name];
            types.push('Global');
            for (var i = 0; i < types.length; i++){
                let t = types[i];
                if (breakdown[type][t]){
                    Object.keys(breakdown[type][t]).forEach(function (mod){
                        let raw = breakdown[type][t][mod];
                        let val = parseFloat(raw.slice(0,-1));
                        if (val != 0 && !isNaN(val)){
                            prevCol = true;
                            let type = val > 0 ? 'success' : 'danger';
                            let label = mod.replace(/\+.+$/,"");
                            mod = mod.replace(/'/g, "\\'");
                            col1.append(`<div class="modal_bd"><span>${label}</span><span class="has-text-${type}">{{ ${t}['${mod}'] | translate }}</span></div>`);
                        }
                    });
                }
            }
        }

        if (breakdown[type].consume && breakdown[type].consume[name]){
            let col2 = $(`<div class="${prevCol ? 'col' : ''}"></div>`);
            let count = 0;
            Object.keys(breakdown[type].consume[name]).forEach(function (mod){                
                let val = breakdown[type].consume[name][mod];
                if (val != 0 && !isNaN(val)){
                    count++;
                    let type = val > 0 ? 'success' : 'danger';
                    let label = mod.replace(/\+.+$/,"");
                    mod = mod.replace(/'/g, "\\'");
                    col2.append(`<div class="modal_bd"><span>${label}</span><span class="has-text-${type}">{{ consume.${name}['${mod}'] | fix | translate }}</span></div>`);
                }
            });
            if (count > 0){
                table.append(col2);
            }
        }

        if (type === 'p'){
            let dir = global['resource'][name].diff > 0 ? 'success' : 'danger';
            bd.append(`<div class="modal_bd sum"><span>{{ res.diff | direction }}</span><span class="has-text-${dir}">{{ res.amount | counter }}</span></div>`);
        }

        return bd;
    },{
        in: function(){
            vBind({
                el: `#popper > div`,
                data: {
                    'Global': breakdown[type]['Global'],
                    [name]: breakdown[type][name],
                    'consume': breakdown[type]['consume'],
                    res: global['resource'][name]
                }, 
                filters: {
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
                        let rate = global['resource'][name].diff;
                        let time = 0;
                        if (rate < 0){
                            rate *= -1;
                            time = +(val / rate).toFixed(0);
                        }
                        else {
                            let gap = global['resource'][name].max - val;
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
    var market_item = $(`<div id="tradeTotal" v-show="active" class="market-item"><div id="tradeTotalPopover"><span class="tradeTotal${no_market}"><span class="has-text-caution">${loc('resource_market_trade_routes')}</span> {{ trade }} / {{ mtrade }}</span></div></div>`);
    market_item.append($(`<span role="button" class="zero has-text-advanced" @click="zero()">${loc('cancel_all_routes')}</span>`));
    $('#market').append(market_item);
    vBind({
        el: '#tradeTotal',
        data: global.city.market,
        methods: {
            zero(){
                Object.keys(global.resource).forEach(function(res){
                    if (global.resource[res]['trade']){
                        global.city.market.trade -= Math.abs(global.resource[res].trade);
                        global.resource[res].trade = 0;
                        tradeRouteColor(res);
                    }
                });
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

    var market_item = $(`<div id="crateTotal" class="market-item"><span v-show="cr.display" class="crtTotal"><span class="has-text-warning">${loc('resource_Crates_name')}</span><span>{{ cr.amount }} / {{ cr.max }}</span></span><span v-show="cn.display" class="cntTotal"><span class="has-text-warning">${loc('resource_Containers_name')}</span><span>{{ cn.amount }} / {{ cn.max }}</span></span></div>`);
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
    let material = global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? global.resource.Chrysotile.name : global.resource.Stone.name) : (global.resource['Plywood'] ? global.resource.Plywood.name : loc('resource_Plywood_name'));
    let cost = global.race['kindling_kindred'] || global.race['smoldering'] ? 200 : 10
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
    let keyMutipler = num || keyMultiplier();
    let material = global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? 'Chrysotile' : 'Stone') : 'Plywood';
    let cost = global.race['kindling_kindred'] || global.race['smoldering'] ? 200 : 10;
    if (keyMutipler + global.resource.Crates.amount > global.resource.Crates.max){
        keyMutipler = global.resource.Crates.max - global.resource.Crates.amount;
    }
    if (global.resource[material].amount < cost * keyMutipler){
        keyMutipler = Math.floor(global.resource[material].amount / cost);
    }
    if (global.resource[material].amount >= (cost * keyMutipler) && global.resource.Crates.amount < global.resource.Crates.max){
        modRes(material,-(cost * keyMutipler));
        global.resource.Crates.amount += keyMutipler;
    }
}

function buildContainer(num){
    let keyMutipler = num || keyMultiplier();
    if (keyMutipler + global.resource.Containers.amount > global.resource.Containers.max){
        keyMutipler = global.resource.Containers.max - global.resource.Containers.amount;
    }
    if (global.resource['Steel'].amount < 125 * keyMutipler){
        keyMutipler = Math.floor(global.resource['Steel'].amount / 125);
    }
    if (global.resource['Steel'].amount >= (125 * keyMutipler) && global.resource.Containers.amount < global.resource.Containers.max){
        modRes('Steel',-(125 * keyMutipler));
        global.resource.Containers.amount += keyMutipler;
    }
}

function drawModal(name){
    $('#modalBox').append($('<p id="modalBoxTitle" class="has-text-warning modalTitle">{{ name }} - {{ amount | size }}/{{ max | size }}</p>'));
    
    let body = $('<div class="modalBody crateModal"></div>');
    $('#modalBox').append(body);

    if (name === 'Food'){
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
        filters: {
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

export function crateValue(){
    let create_value = global.tech['container'] && global.tech['container'] >= 2 ? 500 : 350;
    if (global.tech['container'] && global.tech['container'] >= 4){
        create_value += global.tech['container'] >= 5 ? 500 : 250;
    }
    if (global.tech['container'] && global.tech['container'] >= 6){
        create_value += global.tech['container'] >= 7 ? 1200 : 500;
    }
    if (global.tech['container'] && global.tech['container'] >= 8){
        create_value += 4000;
    }
    if (global.race['pack_rat']){
        create_value *= 1 + (traits.pack_rat.vars()[0] / 100);
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
        container_value += 8000;
    }
    if (global.race['pack_rat']){
        container_value *= 1 + (traits.pack_rat.vars()[0] / 100);
    }
    container_value *= global.stats.achieve['blackhole'] ? 1 + (global.stats.achieve.blackhole.l * 0.05) : 1;
    return Math.round(spatialReasoning(container_value));
}

function initMarket(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
        return;
    }
    let market = $(`<div id="market-qty" class="market-header"><h2 class="is-sr-only">${loc('resource_market')}</h2></div>`);
    clearElement($('#market'));
    $('#market').append(market);
    loadMarket();
}

function initStorage(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 1)){
        return;
    }
    let store = $(`<div id="createHead" class="storage-header"><h2 class="is-sr-only">${loc('tab_storage')}</h2></div>`);
    clearElement($('#resStorage'));
    $('#resStorage').append(store);
    
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
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
        return;
    }

    let market = $('#market-qty');
    clearElement(market);

    if (!global.race['no_trade']){
        market.append($(`<h3 class="is-sr-only">${loc('resource_trade_qty')}</h3>`));
        market.append($(`<b-field class="market"><span class="button has-text-danger" role="button" @click="less">-</span><b-numberinput :input="val()" min="1" :max="limit()" v-model="qty" :controls="false"></b-numberinput><span class="button has-text-success" role="button" @click="more">+</span></b-field>`));
    }

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

        eject.append($(`<span>{{ total }} / {{ on | max }}{{ on | real }}</span><span class="mass">${loc('interstellar_mass_ejector_mass')}: {{ mass | approx }} kt/s</span>`));

        vBind({
            el: `#eject`,
            data: global.interstellar.mass_ejector,
            filters: {
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

        res.append($(`<span role="button" aria-label="eject less ${loc('resource_'+name+'_name')}" class="sub has-text-danger" @click="ejectLess('${name}')"><span>&laquo;</span></span>`));
        res.append($(`<span class="current">{{ e.${name} }}</span>`));
        res.append($(`<span role="button" aria-label="eject more ${loc('resource_'+name+'_name')}" class="add has-text-success" @click="ejectMore('${name}')"><span>&raquo;</span></span>`));

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

        res.append($(`<span role="button" aria-label="transmute less ${loc('resource_'+name+'_name')}" class="sub has-text-danger" @click="subSpell('${name}')"><span>&laquo;</span></span>`));
        res.append($(`<span class="current">{{ a.${name} }}</span>`));
        res.append($(`<span role="button" aria-label="transmute more ${loc('resource_'+name+'_name')}" class="add has-text-success" @click="addSpell('${name}')"><span>&raquo;</span></span>`));

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
                    for (let i=0; i<keyMult; i++){
                        if (global.resource.Mana.diff >= 1){
                            global.race.alchemy[spell]++;
                            global.resource.Mana.diff--;
                        }
                        else {
                            break;
                        }
                    }
                },
                subSpell(spell){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if (global.race.alchemy[spell] > 0){
                            global.race.alchemy[spell]--;
                            global.resource.Mana.diff++;
                        }
                        else {
                            break;
                        }
                    }
                },
            }
        });

        popover(`alchemy${name}`,function(){
            return $(`<div>${loc('resource_alchemy',[1,loc(`resource_Mana_name`),0.5,loc(`resource_Crystal_name`),basic && global.tech.alchemy >= 2 ? +(tradeRatio[name] * 8).toFixed(2) : +(tradeRatio[name] * 2).toFixed(2), global.resource[name].name])}</div>`);
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
            global.city['temple'] ? global.city.temple.count : '0',
            global.space['ziggurat'] ? global.space.ziggurat.count : '0',
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
            let noEarth = global.race['cataclysm'] || global.race['orbit_decayed'] ? true : false;
            if (global.genes['store']){
                let plasmids = 0;
                if (!type || (type && ((type === 'plasmid' && global.race.universe !== 'antimatter') || (type === 'anti' && global.race.universe === 'antimatter')))){
                    plasmids = global.race.universe === 'antimatter' ? global.prestige.AntiPlasmid.count : global.prestige.Plasmid.count;
                    let raw = plasmids;
                    if (global.race['no_plasmid']){
                        raw = Math.min(global.race.p_mutation, plasmids);
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
            if (global.race.universe === 'antimatter' && ((!noEarth && global.city['temple'] && global.city['temple'].count) || (noEarth && global.space['ziggurat'] && global.space['ziggurat'].count))){
                let temple = 0.06;
                if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                    let priest = global.genes['ancients'] >= 5 ? 0.0012 : (global.genes['ancients'] >= 3 ? 0.001 : 0.0008);
                    if (global.race['high_pop']){
                        priest = highPopAdjust(priest);
                    }
                    temple += priest * global.civic.priest.workers;
                }
                modifier *= 1 + ((noEarth ? global.space.ziggurat.count : global.city.temple.count) * temple);
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

export function faithBonus(){
    if (global.race['no_plasmid'] || global.race.universe === 'antimatter'){
        let noEarth = global.race['cataclysm'] || global.race['orbit_decayed'] ? true : false;
        if ((noEarth && global.space['ziggurat'] && global.space.ziggurat.count) || (global.city['temple'] && global.city['temple'].count)){
            let temple_bonus = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 0.016 : 0.01;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                let indoc = global.civic.professor.workers * (global.race.universe === 'antimatter' ? 0.0002 : 0.0004);
                if (global.race['high_pop']){
                    indoc = highPopAdjust(indoc);
                }
                temple_bonus += indoc;
            }
            if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                let priest_bonus = global.genes['ancients'] >= 5 ? 0.00015 : (global.genes['ancients'] >= 3 ? 0.000125 : 0.0001);
                if (global.race['high_pop']){
                    priest_bonus = highPopAdjust(priest_bonus);
                }
                temple_bonus += priest_bonus * global.civic.priest.workers;
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
            if (global.civic.govern.type === 'theocracy'){
                temple_bonus *= 1.12;
            }
            if (global.race['ooze']){
                temple_bonus *= 1 - (traits.ooze.vars()[1] / 100);
            }
            return (noEarth ? global.space.ziggurat.count : global.city.temple.count) * temple_bonus;
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
            global.city['temple'] ? global.city.temple.count : '0',
            global.space['ziggurat'] ? global.space.ziggurat.count : '0',
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
                let plasmids = global.race['no_plasmid'] ? Math.min(global.race.p_mutation, global.prestige.Plasmid.count) : global.prestige.Plasmid.count;
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

                let shrines = 0;
                if (global.race['orbit_decayed'] && global.space['ziggurat']){
                    shrines = global.space.ziggurat.count;
                }
                else if (global.city['temple']){
                    shrines = global.city.temple.count;
                }

                if (shrines > 0 && !global.race['no_plasmid'] && global.race.universe !== 'antimatter'){
                    let temple_bonus = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 0.08 : 0.05;
                    if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                        let indoc = global.civic.professor.workers * 0.002;
                        if (global.race['high_pop']){
                            indoc = highPopAdjust(indoc);
                        }
                        temple_bonus += indoc;
                    }
                    if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                        let priest_bonus = global.genes['ancients'] >= 5 ? 0.0015 : (global.genes['ancients'] >= 3 ? 0.00125 : 0.001);
                        if (global.race['high_pop']){
                            priest_bonus = highPopAdjust(priest_bonus);
                        }
                        temple_bonus += priest_bonus * global.civic.priest.workers;
                    }
                    if (global.race['spiritual']){
                        temple_bonus *= 1 + (traits.spiritual.vars()[0] / 100);
                    }
                    if (global.civic.govern.type === 'theocracy'){
                        temple_bonus *= 1.12;
                    }
                    if (global.race['ooze']){
                        temple_bonus *= 1 - (traits.ooze.vars()[1] / 100);
                    }
                    if (global.race['orbit_decayed'] && global.race['truepath']){
                        temple_bonus *= 0.1;
                    }
                    standard *= 1 + (shrines * temple_bonus);
                }
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
