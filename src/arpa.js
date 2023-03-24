import { global, keyMultiplier, sizeApproximation, srSpeak } from './vars.js';
import { clearElement, popover, clearPopper, flib, eventActive, timeFormat, vBind, messageQueue, adjustCosts, calcQueueMax, calcRQueueMax, buildQueue, calcPrestige, calc_mastery, darkEffect, easterEgg, getTraitDesc, removeFromQueue, arpaTimeCheck, deepClone } from './functions.js';
import { actions, updateQueueNames, drawTech, drawCity, addAction, removeAction, wardenLabel, checkCosts } from './actions.js';
import { races, traits, cleanAddTrait, cleanRemoveTrait, traitSkin } from './races.js';
import { renderSpace } from './space.js';
import { drawMechLab } from './portal.js';
import { govActive, defineGovernor } from './governor.js';
import { unlockFeat } from './achieve.js';
import { loc } from './locale.js';

export function arpa(type) {
    switch(type){
        case 'Physics':
            physics();
            break;
        case 'Genetics':
            genetics();
            break;
        case 'Monument':
            return pick_monument();
        case 'PhysicsTech':
            return arpaProjects;
        case 'GeneTech':
            return genePool;
        case 'BloodTech':
            return bloodPool;
        case 'Crispr':
            crispr();
            break;
        case 'Blood':
            blood();
            break;
    }
}

export const arpaProjects = {
    lhc: {
        title(){ return eventActive('fool',2022) ? loc('arpa_projects_railway_title') : loc('arpa_projects_lhc_title'); },
        desc(){ return eventActive('fool',2022) ? loc('arpa_projects_railway_desc') : loc('arpa_projects_lhc_desc'); },
        reqs: { high_tech: 6 },
        grant: 'supercollider',
        effect(nofool){
            if (eventActive('fool',2022) && !nofool){
                return arpaProjects.railway.effect(true);
            }
            let sc = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? (global.race['cataclysm'] ? 20 : 8) : (global.race['cataclysm'] ? 10 : 4);
            if (global.tech['storage'] >= 6){
                if (global.tech['particles'] && global.tech['particles'] >= 4){
                    return global.race['cataclysm'] ? loc('arpa_projects_lhc_cataclysm3',[sc]) : loc('arpa_projects_lhc_effect3',[sc,global.race['orbit_decayed'] ? loc('space_home_satellite_title') : wardenLabel()]);
                }
                else {
                    return global.race['cataclysm'] ? loc('arpa_projects_lhc_cataclysm2',[sc]) : loc('arpa_projects_lhc_effect2',[sc,global.race['orbit_decayed'] ? loc('space_home_satellite_title') : wardenLabel()]);
                }
            }
            else {
                return global.race['cataclysm'] ? loc('arpa_projects_lhc_cataclysm1',[sc]) : global.tech['isolation'] ? loc('arpa_projects_lhc_iso1',[sc,loc('tech_infectious_disease_lab_alt')]) : (loc('arpa_projects_lhc_effect1',[sc,global.race['orbit_decayed'] ? loc('space_home_satellite_title') : wardenLabel()]));
            }
        },
        cost: {
            Money(offset,wiki){ return costMultiplier('lhc', offset, 2500000, 1.05, wiki); },
            Knowledge(offset,wiki){ return costMultiplier('lhc', offset, 500000, 1.05, wiki); },
            Copper(offset,wiki){ return costMultiplier('lhc', offset, 125000, 1.05, wiki); },
            Cement(offset,wiki){ return costMultiplier('lhc', offset, 250000, 1.05, wiki); },
            Aluminium(offset,wiki){ return costMultiplier('lhc', offset, 350000, 1.05, wiki); },
            Titanium(offset,wiki){ return costMultiplier('lhc', offset, 50000, 1.05, wiki); },
            Polymer(offset,wiki){ return costMultiplier('lhc', offset, 12000, 1.05, wiki); }
        }
    },
    stock_exchange: {
        title: loc('arpa_projects_stock_exchange_title'),
        desc: loc('arpa_projects_stock_exchange_desc'),
        reqs: { banking: 9 },
        grant: 'stock_exchange',
        effect(){
            if (global.tech['banking'] >= 10){
                if (global.race['cataclysm']){
                    return global.tech['gambling'] && global.tech['gambling'] >= 4 ? loc('arpa_projects_stock_exchange_cataclysm2') : loc('arpa_projects_stock_exchange_cataclysm1');
                }
                else {
                    return global.tech['gambling'] && global.tech['gambling'] >= 4 ? loc('arpa_projects_stock_exchange_effect3') : loc('arpa_projects_stock_exchange_effect2');
                }
            }
            else {
                return loc('arpa_projects_stock_exchange_effect1');
            }
        },
        cost: {
            Money(offset,wiki){ return costMultiplier('stock_exchange', offset, 3000000, 1.06, wiki); },
            Plywood(offset,wiki){ return costMultiplier('stock_exchange', offset, 25000, 1.06, wiki); },
            Brick(offset,wiki){ return costMultiplier('stock_exchange', offset, 20000, 1.06, wiki); },
            Wrought_Iron(offset,wiki){ return costMultiplier('stock_exchange', offset, 10000, 1.06, wiki); }
        }
    },
    tp_depot: {
        title: loc('galaxy_gateway_depot'),
        desc: loc('arpa_projects_depot_desc'),
        reqs: { high_tech: 6, storage: 4 },
        grant: 'tp_depot',
        path: ['truepath'],
        effect(){
            return loc(global.tech['isolation'] ? 'arpa_projects_depot_effect_iso' : 'arpa_projects_depot_effect',[5,50]);
        },
        cost: {
            Money(offset,wiki){ return costMultiplier('tp_depot', offset, 1800000, 1.08, wiki); },
            Stone(offset,wiki){ return costMultiplier('tp_depot', offset, 750000, 1.08, wiki); },
            Iron(offset,wiki){ return costMultiplier('tp_depot', offset, 250000, 1.08, wiki); },
            Alloy(offset,wiki){ return costMultiplier('tp_depot', offset, 30000, 1.08, wiki); }
        }
    },
    launch_facility: {
        id: 'arpalaunch_facility',
        title: loc('arpa_projects_launch_facility_title'),
        desc: loc('arpa_projects_launch_facility_desc'),
        reqs: { high_tech: 7 },
        condition(){
            return global.race['cataclysm'] || global.race['lone_survivor'] ? false : true;
        },
        grant: 'launch_facility',
        rank: 1,
        queue_complete(){ return global.tech.space >= 1 ? 0 : 1; },
        effect(){
            return loc('arpa_projects_launch_facility_effect1');
        },
        cost: {
            Money(offset){ return costMultiplier('launch_facility', offset, 2000000, 1.1); },
            Knowledge(offset){ return costMultiplier('launch_facility', offset, 500000, 1.1); },
            Cement(offset){ return costMultiplier('launch_facility', offset, 150000, 1.1); },
            Oil(offset){ return costMultiplier('launch_facility', offset, 20000, 1.1); },
            Sheet_Metal(offset){ return costMultiplier('launch_facility', offset, 15000, 1.1); },
            Alloy(offset){ return costMultiplier('launch_facility', offset, 25000, 1.1); }
        }
    },
    monument: {
        title(wiki){
            if (wiki){
                return loc('arpa_project_monument_title');
            }
            switch(global.arpa.m_type){
                case 'Obelisk':
                    return loc('arpa_project_monument_obelisk');
                case 'Statue':
                    return loc('arpa_project_monument_statue');
                case 'Sculpture':
                    return loc('arpa_project_monument_sculpture');
                case 'Monolith':
                    return loc('arpa_project_monument_monolith');
                case 'Pillar':
                    return loc('arpa_project_monument_pillar');
                case 'Megalith':
                    return loc('arpa_project_monument_megalith');
            }
        },
        desc: loc('arpa_projects_monument_desc'),
        reqs: { monument: 1 },
        grant: 'monuments',
        effect(){
            let gasVal = govActive('gaslighter',2);
            let mcap = gasVal ? 2 - gasVal: 2;
            return loc('arpa_projects_monument_effect1',[mcap]);
        },
        cost: {
            Stone(offset,wiki){ return monument_costs('Stone', offset, wiki) },
            Aluminium(offset,wiki){ return monument_costs('Aluminium', offset, wiki) },
            Cement(offset,wiki){ return monument_costs('Cement', offset, wiki) },
            Steel(offset,wiki){ return monument_costs('Steel', offset, wiki) },
            Lumber(offset,wiki){ return monument_costs('Lumber', offset, wiki) },
            Crystal(offset,wiki){ return monument_costs('Crystal', offset, wiki) }
        }
    },
    railway: {
        title(){ return eventActive('fool',2022) ? loc('arpa_projects_lhc_title') : loc('arpa_projects_railway_title'); },
        desc(){ return eventActive('fool',2022) ? loc('arpa_projects_lhc_desc') : loc('arpa_projects_railway_desc'); },
        reqs: { high_tech: 6, trade: 3 },
        grant: 'railway',
        effect(nofool){
            if (eventActive('fool',2022) && !nofool){
                return arpaProjects.lhc.effect(true);
            }
            let routes = global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 2 ? 1 : 0;
            let profit = global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 1 ? 3 : 2;
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                routes += global.space['gps'] ? Math.floor(global.space.gps.count / 3) : 0;
                return loc('arpa_projects_railway_cataclysm1',[routes,profit,3,1]);
            }
            else {
                routes += global.city['storage_yard'] ? Math.floor(global.city.storage_yard.count / 6) : 0;
                return loc('arpa_projects_railway_effect1',[routes,profit,6,1]);
            }
        },
        cost: {
            Money(offset,wiki){ return costMultiplier('railway', offset, 2500000, 1.08, wiki); },
            Lumber(offset,wiki){ return costMultiplier('railway', offset, 750000, 1.08, wiki); },
            Iron(offset,wiki){ return costMultiplier('railway', offset, 300000, 1.08, wiki); },
            Steel(offset,wiki){ return costMultiplier('railway', offset, 450000, 1.08, wiki); }
        }
    },
    roid_eject: {
        title(){ return loc('arpa_projects_roid_eject_title',[roid_eject_type()]); },
        desc(){ return loc(global.tech['roid_eject'] <= 10 ? 'arpa_projects_roid_eject_desc' : 'arpa_projects_roid_eject_desc2',[roid_eject_type()]); },
        reqs: { blackhole: 6, gateway: 3 },
        grant: 'roid_eject',
        effect(){
            let mass = 0;
            let next = 0;
            if (global.tech['roid_eject']){
                mass += 0.225 * global.tech['roid_eject'] * (1 + (global.tech['roid_eject'] / 12));
                next = (0.225 * (global.tech['roid_eject'] + 1) * (1 + ((global.tech['roid_eject'] + 1) / 12))) - mass;
            }
            return `<div>${loc('arpa_projects_roid_eject_effect1')}</div><div>${loc('arpa_projects_roid_eject_effect2',[+(mass).toFixed(3),+(next).toFixed(3),roid_eject_type()])}</div>`;
        },
        cost: {
            Money(offset,wiki){ return costMultiplier('roid_eject', offset, 18750000, 1.075, wiki); },
            Deuterium(offset,wiki){ return costMultiplier('roid_eject', offset, 375000, 1.075, wiki); },
            Bolognium(offset,wiki){ return costMultiplier('roid_eject', offset, 15000, 1.075, wiki); }
        }
    },
    nexus: {
        title: loc('arpa_projects_nexus_title'),
        desc: loc('arpa_projects_nexus_desc'),
        reqs: { magic: 5 },
        grant: 'nexus',
        effect(){
            return loc('arpa_projects_nexus_effect1',[5]);
        },
        cost: {
            Money(offset,wiki){ return costMultiplier('nexus', offset, 5000000, 1.12, wiki); },
            Crystal(offset,wiki){ return costMultiplier('nexus', offset, 60000, 1.12, wiki); },
            Iridium(offset,wiki){ return costMultiplier('nexus', offset, 35000, 1.12, wiki); }
        }
    },
    syphon: {
        title: loc('arpa_syphon_title'),
        desc(){
            if (global.tech['syphon'] && global.tech.syphon >= 0){
                return `<div>${loc('arpa_syphon_desc')}</div><div class="has-text-danger">${loc('arpa_syphon_desc_warn2')}</div>`;
            }
            else {
                return `<div>${loc('arpa_syphon_desc')}</div><div class="has-text-danger">${loc('arpa_syphon_desc_warn1')}</div>`;
            }
        },
        reqs: { veil: 2 },
        grant: 'syphon',
        effect(){
            let mana = +(1/3 * darkEffect('magic')).toFixed(3);
            if (global.tech['syphon'] && global.tech.syphon >= 60){
                let gains = calcPrestige('vacuum');
                let plasmidType = loc('resource_Plasmid_plural_name');
                return `<div>${loc('arpa_syphon_effect_main',[mana])}</div><div class="has-text-caution">${loc('arpa_syphon_effect4')}</div><div class="has-text-advanced">${loc('arpa_syphon_effect_reward',[gains.plasmid,gains.phage,gains.dark,plasmidType,80])}</div>`;
            }
            else if (global.tech['syphon'] && global.tech.syphon >= 40){
                return `<div>${loc('arpa_syphon_effect_main',[mana])}</div><div class="has-text-caution">${loc('arpa_syphon_effect3')}</div>`;
            }
            else if (global.tech['syphon'] && global.tech.syphon >= 20){
                return `<div>${loc('arpa_syphon_effect_main',[mana])}</div><div class="has-text-caution">${loc('arpa_syphon_effect2')}</div>`;
            }
            else {
                return `<div>${loc('arpa_syphon_effect_main',[mana])}</div><div class="has-text-caution">${loc('arpa_syphon_effect1')}</div>`;
            }
        },
        cost: {
            Money(offset,wiki){ return costMultiplier('syphon', offset, 7500000, 1.025, wiki); },
            Mana(offset,wiki){ return costMultiplier('syphon', offset, 5000, 1.025, wiki); },
            Crystal(offset,wiki){ return costMultiplier('syphon', offset, 100000, 1.025, wiki); },
            Infernite(offset,wiki){ return costMultiplier('syphon', offset, 10000, 1.025, wiki); },
        }
    },
};

function roid_eject_type(){
    if (!global.tech['roid_eject'] || global.tech['roid_eject'] <= 10){
        return loc('arpa_projects_roid_eject_asteroid');;
    }
    else if (global.tech['roid_eject'] <= 25){
        return loc('arpa_projects_roid_eject_moon');;
    }
    else if (global.tech['roid_eject'] <= 40){
        return loc('arpa_projects_roid_eject_dwarf');;
    }
    else if (global.tech['roid_eject'] <= 60){
        return loc('arpa_projects_roid_eject_planet');;
    }
    else {
        return loc('arpa_projects_roid_eject_remnant');;
    }
}

export const genePool = {
    genetic_memory: {
        id: 'genes-genetic_memory',
        title: loc('arpa_genepool_genetic_memory_title'),
        desc: loc('arpa_genepool_genetic_memory_desc'),
        reqs: {},
        grant: ['creep',1],
        cost: { Plasmid(){ return 25; } },
        action(){
            if (payCrispr('genetic_memory')){
                return true;
            }
            return false;
        }
    },
    animus: {
        id: 'genes-animus',
        title: loc('arpa_genepool_animus_title'),
        desc: loc('arpa_genepool_animus_desc'),
        reqs: { creep: 1 },
        grant: ['creep',2],
        cost: { Plasmid(){ return 75; } },
        action(){
            if (payCrispr('animus')){
                return true;
            }
            return false;
        }
    },
    divine_remembrance: {
        id: 'genes-divine_remembrance',
        title: loc('arpa_genepool_divine_remembrance_title'),
        desc: loc('arpa_genepool_divine_remembrance_desc'),
        reqs: { creep: 2 },
        grant: ['creep',3],
        cost: { Plasmid(){ return 225; } },
        action(){
            if (payCrispr('divine_remembrance')){
                return true;
            }
            return false;
        }
    },
    divine_proportion: {
        id: 'genes-divine_proportion',
        title: loc('arpa_genepool_divine_proportion_title'),
        desc: loc('arpa_genepool_divine_proportion_desc'),
        reqs: { creep: 3 },
        grant: ['creep',4],
        cost: { Plasmid(){ return 618; } },
        action(){
            if (payCrispr('divine_proportion')){
                return true;
            }
            return false;
        }
    },
    genetic_repository: {
        id: 'genes-genetic_repository',
        title: loc('arpa_genepool_genetic_repository_title'),
        desc: loc('arpa_genepool_genetic_repository_desc'),
        reqs: { creep: 4 },
        grant: ['creep',5],
        cost: { Plasmid(){ return 999; } },
        action(){
            if (payCrispr('genetic_repository')){
                return true;
            }
            return false;
        }
    },
    spatial_reasoning: {
        id: 'genes-spatial_reasoning',
        title: loc('arpa_genepool_spatial_reasoning_title'),
        desc: loc('arpa_genepool_spatial_reasoning_desc'),
        reqs: {},
        grant: ['store',1],
        cost: { Plasmid(){ return 50; } },
        action(){
            if (payCrispr('spatial_reasoning')){
                return true;
            }
            return false;
        }
    },
    spatial_superiority: {
        id: 'genes-spatial_superiority',
        title: loc('arpa_genepool_spatial_superiority_title'),
        desc: loc('arpa_genepool_spatial_superiority_desc'),
        reqs: { store: 1 },
        grant: ['store',2],
        cost: { Plasmid(){ return 125; } },
        action(){
            if (payCrispr('spatial_superiority')){
                return true;
            }
            return false;
        }
    },
    spatial_supremacy: {
        id: 'genes-spatial_supremacy',
        title: loc('arpa_genepool_spatial_supremacy_title'),
        desc: loc('arpa_genepool_spatial_supremacy_desc'),
        reqs: { store: 2 },
        grant: ['store',3],
        cost: { Plasmid(){ return 325; } },
        action(){
            if (payCrispr('spatial_supremacy')){
                return true;
            }
            return false;
        }
    },
    dimensional_warping: {
        id: 'genes-dimensional_warping',
        title: loc('arpa_genepool_dimensional_warping_title'),
        desc: loc('arpa_genepool_dimensional_warping_desc'),
        reqs: { store: 3 },
        grant: ['store',4],
        cost: { Plasmid(){ return 500; } },
        action(){
            if (payCrispr('dimensional_warping')){
                return true;
            }
            return false;
        }
    },
    enhanced_muscle_fiber: {
        id: 'genes-enhanced_muscle_fiber',
        title: loc('arpa_genepool_enhanced_muscle_fiber_title'),
        desc: loc('arpa_genepool_enhanced_muscle_fiber_desc'),
        reqs: {},
        grant: ['enhance',1],
        cost: { Plasmid(){ return 25; } },
        action(){
            if (payCrispr('enhanced_muscle_fiber')){
                return true;
            }
            return false;
        }
    },
    morphogenesis: {
        id: 'genes-morphogenesis',
        title: loc('arpa_genepool_morphogenesis_title'),
        desc: loc('arpa_genepool_morphogenesis_desc'),
        reqs: {},
        grant: ['evolve',1],
        cost: { Plasmid(){ return 10; } },
        action(){
            if (payCrispr('morphogenesis')){
                return true;
            }
            return false;
        }
    },
    recombination: {
        id: 'genes-recombination',
        title: loc('arpa_genepool_recombination_title'),
        desc: loc('arpa_genepool_recombination_desc'),
        reqs: { evolve: 1 },
        grant: ['evolve',2],
        cost: { Plasmid(){ return 35; } },
        action(){
            if (payCrispr('recombination')){
                return true;
            }
            return false;
        }
    },
    homologous_recombination: {
        id: 'genes-homologous_recombination',
        title: loc('arpa_genepool_homologous_recombination_title'),
        desc: loc('arpa_genepool_homologous_recombination_desc'),
        reqs: { evolve: 2 },
        grant: ['evolve',3],
        cost: { Plasmid(){ return 70; } },
        action(){
            if (payCrispr('homologous_recombination')){
                return true;
            }
            return false;
        }
    },
    genetic_reshuffling: {
        id: 'genes-genetic_reshuffling',
        title: loc('arpa_genepool_genetic_reshuffling_title'),
        desc: loc('arpa_genepool_genetic_reshuffling_desc'),
        reqs: { evolve: 3 },
        grant: ['evolve',4],
        cost: { Plasmid(){ return 175; } },
        action(){
            if (payCrispr('genetic_reshuffling')){
                return true;
            }
            return false;
        }
    },
    recombinant_dna: {
        id: 'genes-recombinant_dna',
        title: loc('arpa_genepool_recombinant_dna_title'),
        desc: loc('arpa_genepool_recombinant_dna_desc'),
        reqs: { evolve: 4 },
        grant: ['evolve',5],
        cost: { Plasmid(){ return 440; } },
        action(){
            if (payCrispr('recombinant_dna')){
                return true;
            }
            return false;
        }
    },
    chimeric_dna: {
        id: 'genes-chimeric_dna',
        title: loc('arpa_genepool_chimeric_dna_title'),
        desc: loc('arpa_genepool_chimeric_dna_desc'),
        reqs: { evolve: 5 },
        grant: ['evolve',6],
        cost: { Plasmid(){ return 1100; } },
        action(){
            if (payCrispr('chimeric_dna')){
                return true;
            }
            return false;
        }
    },
    molecular_cloning: {
        id: 'genes-molecular_cloning',
        title: loc('arpa_genepool_molecular_cloning_title'),
        desc: loc('arpa_genepool_molecular_cloning_desc'),
        reqs: { evolve: 6 },
        grant: ['evolve',7],
        cost: { Plasmid(){ return 2750; } },
        action(){
            if (payCrispr('molecular_cloning')){
                return true;
            }
            return false;
        }
    },
    transgenes: {
        id: 'genes-transgenes',
        title: loc('arpa_genepool_transgenes_title'),
        desc: loc('arpa_genepool_transgenes_desc'),
        reqs: { evolve: 7 },
        grant: ['evolve',8],
        cost: { Plasmid(){ return 6875; } },
        action(){
            if (payCrispr('transgenes')){
                return true;
            }
            return false;
        }
    },
    synthesis: {
        id: 'genes-synthesis',
        title: loc('arpa_genepool_synthesis_title'),
        desc: loc('arpa_genepool_synthesis_desc',[2,10]),
        reqs: { evolve: 1 },
        grant: ['synthesis',1],
        cost: { Plasmid(){ return 25; } },
        action(){
            if (payCrispr('synthesis')){
                return true;
            }
            return false;
        }
    },
    karyokinesis: {
        id: 'genes-karyokinesis',
        title: loc('arpa_genepool_karyokinesis_title'),
        desc: loc('arpa_genepool_synthesis_desc',[3,25]),
        reqs: { synthesis: 1 },
        grant: ['synthesis',2],
        cost: { Plasmid(){ return 40; } },
        action(){
            if (payCrispr('karyokinesis')){
                return true;
            }
            return false;
        }
    },
    cytokinesis: {
        id: 'genes-cytokinesis',
        title: loc('arpa_genepool_cytokinesis_title'),
        desc: loc('arpa_genepool_synthesis_desc',[4,50]),
        reqs: { synthesis: 2 },
        grant: ['synthesis',3],
        cost: { Plasmid(){ return 55; } },
        action(){
            if (payCrispr('cytokinesis')){
                return true;
            }
            return false;
        }
    },
    mitosis: {
        id: 'genes-mitosis',
        title: loc('arpa_genepool_mitosis_title'),
        desc: loc('arpa_genepool_mitosis_desc',[3]),
        reqs: { synthesis: 3, evolve: 2 },
        grant: ['plasma',1],
        cost: { Plasmid(){ return 90; } },
        action(){
            if (payCrispr('mitosis')){
                return true;
            }
            return false;
        }
    },
    metaphase: {
        id: 'genes-metaphase',
        title: loc('arpa_genepool_metaphase_title'),
        desc: loc('arpa_genepool_mitosis_desc',[5]),
        reqs: { plasma: 1 },
        grant: ['plasma',2],
        cost: { Plasmid(){ return 165; } },
        action(){
            if (payCrispr('mitosis')){
                return true;
            }
            return false;
        }
    },
    mutation: {
        id: 'genes-mutation',
        title: loc('arpa_genepool_mutation_title'),
        desc: loc('arpa_genepool_mutation_desc'),
        reqs: { synthesis: 3, creep: 5 },
        grant: ['mutation',1],
        cost: { Plasmid(){ return 1250; } },
        action(){
            if (payCrispr('mutation')){
                global.genes['mutation'] = 1;
                genetics();
                return true;
            }
            return false;
        }
    },
    transformation: {
        id: 'genes-transformation',
        title: loc('arpa_genepool_transformation_title'),
        desc: loc('arpa_genepool_transformation_desc'),
        reqs: { mutation: 1 },
        grant: ['mutation',2],
        cost: { Plasmid(){ return 1500; } },
        action(){
            if (payCrispr('transformation')){
                global.genes['mutation'] = 2;
                genetics();
                return true;
            }
            return false;
        }
    },
    metamorphosis: {
        id: 'genes-metamorphosis',
        title: loc('arpa_genepool_metamorphosis_title'),
        desc: loc('arpa_genepool_metamorphosis_desc'),
        reqs: { mutation: 2 },
        grant: ['mutation',3],
        cost: { Plasmid(){ return 1750; } },
        action(){
            if (payCrispr('metamorphosis')){
                global.genes['mutation'] = 3;
                genetics();
                return true;
            }
            return false;
        }
    },
    replication: {
        id: 'genes-replication',
        title: loc('arpa_genepool_replication_title'),
        desc: loc('arpa_genepool_replication_desc'),
        reqs: { evolve: 1 },
        grant: ['birth',1],
        cost: { Plasmid(){ return 65; } },
        action(){
            if (payCrispr('replication')){
                return true;
            }
            return false;
        }
    },
    artificer: {
        id: 'genes-artificer',
        title: loc('arpa_genepool_artificer_title'),
        desc: loc('arpa_genepool_artificer_desc'),
        reqs: { evolve: 1 },
        grant: ['crafty',1],
        cost: { Plasmid(){ return 45; } },
        action(){
            if (payCrispr('artificer')){
                return true;
            }
            return false;
        }
    },
    detail_oriented: {
        id: 'genes-detail_oriented',
        title: loc('arpa_genepool_detail_oriented_title'),
        desc: loc('arpa_genepool_crafting_desc',['50']),
        reqs: { crafty: 1 },
        grant: ['crafty',2],
        cost: { Plasmid(){ return 90; } },
        action(){
            if (payCrispr('detail_oriented')){
                return true;
            }
            return false;
        }
    },
    rigorous: {
        id: 'genes-rigorous',
        title: loc('arpa_genepool_rigorous_title'),
        desc: loc('arpa_genepool_crafting_desc',['100']),
        reqs: { crafty: 2 },
        grant: ['crafty',3],
        cost: { Plasmid(){ return 135; } },
        action(){
            if (payCrispr('rigorous')){
                return true;
            }
            return false;
        }
    },
    geographer: {
        id: 'genes-geographer',
        title: loc('arpa_genepool_geographer_title'),
        desc: loc('arpa_genepool_geographer_desc'),
        reqs: { store: 1 },
        grant: ['queue',1],
        cost: { Plasmid(){ return 75; } },
        action(){
            if (payCrispr('geographer')){
                return true;
            }
            return false;
        }
    },
    architect: {
        id: 'genes-architect',
        title: loc('arpa_genepool_architect_title'),
        desc: loc('arpa_genepool_architect_desc'),
        reqs: { queue: 1 },
        grant: ['queue',2],
        cost: { Plasmid(){ return 160; } },
        action(){
            if (payCrispr('architect')){
                return true;
            }
            return false;
        },
        post(){
            calcQueueMax();
            calcRQueueMax();
        }
    },
    precognition: {
        id: 'genes-precognition',
        title: loc('arpa_genepool_precognition_title'),
        desc: loc('arpa_genepool_precognition_desc'),
        reqs: { queue: 2 },
        grant: ['queue',3],
        condition(){ return global.stats.aiappoc > 0 ? true : false; },
        cost: {
            Plasmid(){ return 3500; },
            Phage(){ return 100; },
            AICore(){ return 1; }
        },
        action(){
            if (payCrispr('precognition')){
                return true;
            }
            return false;
        }
    },
    governance: {
        id: 'genes-governance',
        title: loc('arpa_genepool_governance_title'),
        desc: loc('arpa_genepool_governance_desc'),
        reqs: { queue: 2 },
        grant: ['governor',1],
        cost: {
            Plasmid(){ return 300; },
            Phage(){ return 25; }
        },
        action(){
            if (payCrispr('governance')){
                return true;
            }
            return false;
        }
    },
    civil_service: {
        id: 'genes-civil_service',
        title: loc('arpa_genepool_civil_service_title'),
        desc: loc('arpa_genepool_civil_service_desc'),
        reqs: { governor: 1 },
        grant: ['governor',2],
        cost: {
            Plasmid(){ return 1000; },
            Harmony(){ return 1; }
        },
        action(){
            if (payCrispr('civil_service')){
                return true;
            }
            return false;
        },
        post(){
            if (global.race.hasOwnProperty('governor') && global.race.governor.hasOwnProperty('tasks')){
                for (let i=0; i<6; i++){
                    if (!global.race.governor.tasks.hasOwnProperty(`t${i}`)){
                        global.race.governor.tasks[`t${i}`] = 'none';
                    }
                }
            }
            defineGovernor();
        }
    },
    hardened_genes: {
        id: 'genes-hardened_genes',
        title: loc('arpa_genepool_hardened_genes_title'),
        desc: loc('arpa_genepool_hardened_genes_desc'),
        reqs: {},
        grant: ['challenge',1],
        cost: { Plasmid(){ return 5; } },
        action(){
            if (payCrispr('hardened_genes')){
                return true;
            }
            return false;
        }
    },
    unlocked: {
        id: 'genes-unlocked',
        title: loc('arpa_genepool_unlocked_title'),
        desc: loc('arpa_genepool_unlocked_desc'),
        reqs: {challenge:1},
        grant: ['challenge',2],
        cost: { Plasmid(){ return 50; } },
        action(){
            if (payCrispr('unlocked')){
                return true;
            }
            return false;
        },
        post(){
            calc_mastery(true);
        }
    },
    universal: {
        id: 'genes-universal',
        title: loc('arpa_genepool_universal_title'),
        desc: loc('arpa_genepool_universal_desc'),
        reqs: {challenge:2},
        grant: ['challenge',3],
        condition(){
            return global.race.universe !== 'standard' ? true : false;
        },
        cost: { Plasmid(){ return 400; } },
        action(){
            if (payCrispr('universal')){
                return true;
            }
            return false;
        },
        post(){
            calc_mastery(true);
        }
    },
    standard: {
        id: 'genes-standard',
        title: loc('arpa_genepool_standard_title'),
        desc: loc('arpa_genepool_standard_desc'),
        reqs: {challenge:3},
        grant: ['challenge',4],
        condition(){
            return global.race.universe !== 'standard' ? true : false;
        },
        cost: { Plasmid(){ return 2500; } },
        action(){
            if (payCrispr('standard')){
                return true;
            }
            return false;
        },
        post(){
            calc_mastery(true);
        }
    },
    mastered: {
        id: 'genes-mastered',
        title: loc('arpa_genepool_mastered_title'),
        desc: loc('arpa_genepool_mastered_desc'),
        reqs: {challenge:4},
        grant: ['challenge',5],
        cost: { Plasmid(){ return 4000; } },
        action(){
            if (payCrispr('mastered')){
                return true;
            }
            return false;
        }
    },
    negotiator: {
        id: 'genes-negotiator',
        title: loc('arpa_genepool_negotiator_title'),
        desc: loc('arpa_genepool_negotiator_desc'),
        reqs: {challenge:2},
        grant: ['trader',1],
        cost: { Plasmid(){ return 750; } },
        action(){
            if (payCrispr('negotiator')){
                global.genes['trader'] = 1;
                updateTrades();
                return true;
            }
            return false;
        }
    },
    ancients: {
        id: 'genes-ancients',
        title: loc('arpa_genepool_ancients_title'),
        desc: loc('arpa_genepool_ancients_desc'),
        reqs: { evolve: 2 },
        condition(){
            return global.genes['old_gods'] ? true : false;
        },
        grant: ['ancients',1],
        cost: { Plasmid(){ return 120; } },
        action(){
            if (payCrispr('ancients')){
                global.genes['ancients'] = 1;
                drawTech();
                return true;
            }
            return false;
        }
    },
    faith: {
        id: 'genes-faith',
        title: loc('arpa_genepool_faith_title'),
        desc: loc('arpa_genepool_faith_desc'),
        reqs: { ancients: 1 },
        grant: ['ancients',2],
        cost: { Plasmid(){ return 300; } },
        action(){
            if (payCrispr('faith')){
                global.civic.priest.display = true;
                return true;
            }
            return false;
        }
    },
    devotion: {
        id: 'genes-devotion',
        title: loc('arpa_genepool_devotion_title'),
        desc: loc('arpa_genepool_devotion_desc'),
        reqs: { ancients: 2 },
        grant: ['ancients',3],
        cost: { Plasmid(){ return 600; } },
        action(){
            if (payCrispr('devotion')){
                return true;
            }
            return false;
        }
    },
    acolyte: {
        id: 'genes-acolyte',
        title: loc('arpa_genepool_acolyte_title'),
        desc: loc('arpa_genepool_acolyte_desc'),
        reqs: { ancients: 3 },
        grant: ['ancients',4],
        cost: { Plasmid(){ return 1000; } },
        action(){
            if (payCrispr('acolyte')){
                return true;
            }
            return false;
        }
    },
    conviction: {
        id: 'genes-conviction',
        title: loc('arpa_genepool_conviction_title'),
        desc: loc('arpa_genepool_conviction_desc'),
        reqs: { ancients: 4 },
        grant: ['ancients',5],
        cost: { Plasmid(){ return 1500; } },
        action(){
            if (payCrispr('conviction')){
                return true;
            }
            return false;
        }
    },
    transcendence: {
        id: 'genes-transcendence',
        title: loc('arpa_genepool_transcendence_title'),
        desc: loc('arpa_genepool_transcendence_desc'),
        reqs: { ancients: 1, mutation: 3 },
        grant: ['transcendence',1],
        cost: { Plasmid(){ return 3000; } },
        action(){
            if (payCrispr('transcendence')){
                global.genes['transcendence'] = 1;
                drawTech();
                return true;
            }
            return false;
        }
    },
    /*preeminence: {
        id: 'genes-preeminence',
        title: loc('arpa_genepool_preeminence_title'),
        desc: loc('arpa_genepool_preeminence_desc'),
        reqs: {transcendence: 1, challenge:3},
        grant: ['transcendence',2],
        cost: { Plasmid(){ return 4200; } },
        action(){
            if (payCrispr('preeminence')){
                return true;
            }
            return false;
        }
    },*/
    bleeding_effect: {
        id: 'genes-bleeding_effect',
        title: loc('arpa_genepool_bleeding_effect_title'),
        desc: loc('arpa_genepool_bleeding_effect_desc',[2.5]),
        reqs: { creep: 2 },
        grant: ['bleed',1],
        condition(){
            return global.race.universe === 'antimatter' ? true : false;
        },
        cost: { Plasmid(){ return 100; } },
        action(){
            if (payCrispr('bleeding_effect')){
                return true;
            }
            return false;
        }
    },
    synchronicity: {
        id: 'genes-synchronicity',
        title: loc('arpa_genepool_synchronicity_title'),
        desc: loc('arpa_genepool_synchronicity_desc',[25]),
        reqs: { bleed: 1 },
        grant: ['bleed',2],
        cost: { Plasmid(){ return 500; } },
        action(){
            if (payCrispr('synchronicity')){
                return true;
            }
            return false;
        }
    },
    astral_awareness: {
        id: 'genes-astral_awareness',
        title: loc('arpa_genepool_astral_awareness_title'),
        desc: loc('arpa_genepool_astral_awareness_desc'),
        reqs: { bleed: 2 },
        grant: ['bleed',3],
        cost: { Plasmid(){ return 1000; } },
        action(){
            if (payCrispr('astral_awareness')){
                return true;
            }
            return false;
        }
    },
    blood_remembrance: {
        id: 'genes-blood_remembrance',
        title: loc('arpa_genepool_blood_remembrance_title'),
        desc: loc('arpa_genepool_blood_remembrance_desc'),
        reqs: {},
        grant: ['blood',1],
        condition(){
            return global.prestige.Blood_Stone.count >= 1 ? true : false;
        },
        cost: {
            Plasmid(){ return 1000; },
            Phage(){ return 10; }
        },
        action(){
            if (payCrispr('blood_remembrance')){
                return true;
            }
            return false;
        }
    },
    blood_sacrifice: {
        id: 'genes-blood_sacrifice',
        title: loc('arpa_genepool_blood_sacrifice_title'),
        desc: loc('arpa_genepool_blood_sacrifice_desc'),
        reqs: { blood: 1 },
        grant: ['blood',2],
        cost: {
            Plasmid(){ return 3000; },
            Phage(){ return 100; },
            Artifact(){ return 1; }
        },
        action(){
            if (payCrispr('blood_sacrifice')){
                return true;
            }
            return false;
        }
    },
    essence_absorber: {
        id: 'genes-essence_absorber',
        title: loc('arpa_genepool_essence_absorber_title'),
        desc: loc('arpa_genepool_essence_absorber_desc'),
        reqs: { blood: 2 },
        grant: ['blood',3],
        cost: {
            Plasmid(){ return 7500; },
            Phage(){ return 250; },
            Artifact(){ return 1; }
        },
        action(){
            if (payCrispr('essence_absorber')){
                return true;
            }
            return false;
        },
        post(){
            blood();
        }
    },
}

export const bloodPool = {
    purify: {
        id: 'blood-purify',
        title: loc('arpa_blood_purify_title'),
        desc: loc('arpa_blood_purify_desc'),
        reqs: {},
        grant: ['spire',1],
        cost: { Blood_Stone(){ return 10; } },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    chum: {
        id: 'blood-chum',
        title: loc('arpa_blood_chum_title'),
        desc: loc('arpa_blood_chum_desc'),
        reqs: { spire: 1 },
        grant: ['spire',2],
        cost: { Blood_Stone(){ return 25; } },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    lust: {
        id: 'blood-lust',
        title: loc('arpa_blood_lust_title'),
        desc: loc('arpa_blood_lust_desc'),
        reqs: {},
        grant: ['lust','*'],
        cost: {
            Blood_Stone(wiki){ return ((wiki || 0) + (global.blood['lust'] || 0)) * 15 + 15; },
            Artifact(wiki){ return ((wiki || 0) + (global.blood['lust'] || 0)) % 5 === 0 ? 1 : 0; }
        },
        effect(){ return `<span class="has-text-caution">${loc('arpa_blood_repeat')}</span>`; },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    illuminate: {
        id: 'blood-illuminate',
        title: loc('arpa_blood_illuminate_title'),
        desc: loc('arpa_blood_illuminate_desc'),
        reqs: {},
        grant: ['illuminate','*'],
        cost: {
            Blood_Stone(wiki){ return ((wiki || 0) + (global.blood['illuminate'] || 0)) * 12 + 12; },
            Artifact(wiki){ return ((wiki || 0) + (global.blood['illuminate'] || 0)) % 5 === 0 ? 1 : 0; }
        },
        effect(){ return `<span class="has-text-caution">${loc('arpa_blood_repeat')}</span>`; },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    greed: {
        id: 'blood-greed',
        title: loc('arpa_blood_greed_title'),
        desc: loc('arpa_blood_greed_desc'),
        reqs: {},
        grant: ['greed','*'],
        cost: {
            Blood_Stone(wiki){ return ((wiki || 0) + (global.blood['greed'] || 0)) * 16 + 16; },
            Artifact(wiki){ return ((wiki || 0) + (global.blood['greed'] || 0)) % 5 === 0 ? 1 : 0; }
        },
        effect(){ return `<span class="has-text-caution">${loc('arpa_blood_repeat')}</span>`; },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    hoarder: {
        id: 'blood-hoarder',
        title: loc('arpa_blood_hoarder_title'),
        desc: loc('arpa_blood_hoarder_desc'),
        reqs: {},
        grant: ['hoarder','*'],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: {
            Blood_Stone(wiki){ return ((wiki || 0) + (global.blood['hoarder'] || 0)) * 14 + 14; },
            Artifact(wiki){ return ((wiki || 0) + (global.blood['hoarder'] || 0)) % 5 === 0 ? 1 : 0; }
        },
        effect(){ return `<span class="has-text-caution">${loc('arpa_blood_repeat')}</span>`; },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    artisan: {
        id: 'blood-artisan',
        title: loc('arpa_blood_artisan_title'),
        desc: loc('arpa_blood_artisan_desc'),
        reqs: {},
        grant: ['artisan','*'],
        cost: {
            Blood_Stone(wiki){ return ((wiki || 0) + (global.blood['artisan'] || 0)) * 8 + 8; },
            Artifact(wiki){ return ((wiki || 0) + (global.blood['artisan'] || 0)) % 5 === 0 ? 1 : 0; }
        },
        effect(){ return `<span class="has-text-caution">${loc('arpa_blood_repeat')}</span>`; },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    attract: {
        id: 'blood-attract',
        title: loc('arpa_blood_attract_title'),
        desc: loc('arpa_blood_attract_desc'),
        reqs: {},
        grant: ['attract','*'],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: {
            Blood_Stone(wiki){ return ((wiki || 0) + (global.blood['attract'] || 0)) * 4 + 4; },
            Artifact(wiki){ return ((wiki || 0) + (global.blood['attract'] || 0)) % 5 === 0 ? 1 : 0; }
        },
        effect(){ return `<span class="has-text-caution">${loc('arpa_blood_repeat')}</span>`; },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    wrath: {
        id: 'blood-wrath',
        title: loc('arpa_blood_wrath_title'),
        desc: loc('arpa_blood_wrath_desc'),
        reqs: {},
        grant: ['wrath','*'],
        cost: {
            Blood_Stone(wiki){ return ((wiki || 0) + (global.blood['wrath'] || 0)) * 2 + 2; },
            Artifact(){ return 1; }
        },
        effect(){ return `<span class="has-text-caution">${loc('arpa_blood_repeat')}</span>`; },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    prepared: {
        id: 'blood-prepared',
        title: loc('arpa_blood_prepared_title'),
        desc: loc('arpa_blood_prepared_desc'),
        reqs: {},
        grant: ['prepared',1],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: { Blood_Stone(){ return 50; } },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        },
        post(){
            drawMechLab();
        }
    },
    compact: {
        id: 'blood-compact',
        title: loc('arpa_blood_compact_title'),
        desc: loc('arpa_blood_compact_desc'),
        reqs: { prepared: 1 },
        grant: ['prepared',2],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: { Blood_Stone(){ return 75; } },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    infernal: {
        id: 'blood-infernal',
        title: loc('arpa_blood_infernal_title'),
        desc: loc('arpa_blood_infernal_desc'),
        reqs: { prepared: 2 },
        grant: ['prepared',3],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: {
            Blood_Stone(){ return 125; },
            Artifact(){ return 1; }
        },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    unbound: {
        id: 'blood-unbound',
        title: loc('arpa_blood_unbound_title'),
        desc: loc('arpa_blood_unbound_desc'),
        reqs: {},
        grant: ['unbound',1],
        cost: { Blood_Stone(){ return 50; }, },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    unbound_resistance: {
        id: 'blood-unbound_resistance',
        title: loc('arpa_blood_unbound_resistance_title'),
        desc: loc('arpa_blood_unbound_resistance_desc'),
        reqs: { unbound: 1 },
        grant: ['unbound',2],
        cost: { Blood_Stone(){ return 100; } },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    shadow_war: {
        id: 'blood-shadow_war',
        title: loc('arpa_blood_shadow_war_title'),
        desc: loc('arpa_blood_shadow_war_desc'),
        reqs: { unbound: 2 },
        grant: ['unbound',3],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: {
            Blood_Stone(){ return 250; },
            Artifact(){ return 2; }
        },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    unbound_immunity: {
        id: 'blood-unbound_immunity',
        title: loc('arpa_blood_unbound_immunity_title'),
        desc: loc('arpa_blood_unbound_immunity_desc'),
        reqs: { unbound: 3 },
        grant: ['unbound',4],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: { Blood_Stone(){ return 500; } },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    blood_aware: {
        id: 'blood-blood_aware',
        title: loc('arpa_blood_blood_aware_title'),
        desc: loc('arpa_blood_blood_aware_desc'),
        reqs: {},
        grant: ['aware',1],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: { Blood_Stone(){ return 10; } },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
}

function payCrispr(gene){
    let afford = true;
    let costs = genePool[gene].cost;
    Object.keys(costs).forEach(function(res){
        let oRes = res;
        if (res === 'Plasmid' && global.race.universe === 'antimatter'){
            res = 'AntiPlasmid';
        }
        if (global.prestige[res].count < costs[oRes]()){
            afford = false;
        }
    });

    if (afford){
        Object.keys(costs).forEach(function(res){
            let oRes = res;
            if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                res = 'AntiPlasmid';
            }
            global.prestige[res].count -= costs[oRes]();
        });
        return true;
    }
    return false;
}

export function payBloodPrice(costs){
    if (checkCosts(costs)){
        Object.keys(costs).forEach(function (res){
            global.prestige[res].count -= costs[res]();
        });
        return true;
    }
    return false;
}

export function drawGenes(){
    Object.keys(actions.genes).forEach(function (gene) {
        removeAction(actions.genes[gene].id);
        if (checkGeneRequirements(gene)){
            addAction('genes',gene);
        }
    });
}

export function drawBlood(){
    Object.keys(actions.blood).forEach(function (trait) {
        removeAction(actions.blood[trait].id);
        if (checkBloodRequirements(trait)){
            addAction('blood',trait);
        }
    });
}

export function checkGeneRequirements(gene){
    var isMet = true;
    Object.keys(actions.genes[gene].reqs).forEach(function (req) {
        if (!global.genes[req] || global.genes[req] < actions.genes[gene].reqs[req]){
            isMet = false;
        }
    });
    if (isMet && (!global.genes[actions.genes[gene].grant[0]] || global.genes[actions.genes[gene].grant[0]] < actions.genes[gene].grant[1])){
        return true;
    }
    return false;
}

export function checkBloodRequirements(trait){
    var isMet = true;
    Object.keys(actions.blood[trait].reqs).forEach(function (req) {
        if (!global.blood[req] || global.blood[req] < actions.blood[trait].reqs[req]){
            isMet = false;
        }
    });
    if (isMet && (!global.blood[actions.blood[trait].grant[0]] || actions.blood[trait].grant[1] === '*' || global.blood[actions.blood[trait].grant[0]] < actions.blood[trait].grant[1])){
        return true;
    }
    return false;
}

export function gainGene(action){
    var gene = actions.genes[action].grant[0];
    global.genes[gene] = actions.genes[action].grant[1];
    crispr();
}

export function gainBlood(action){
    var trait = actions.blood[action].grant[0];
    if (actions.blood[action].grant[1] === '*'){
        global.blood[trait] ? global.blood[trait]++ : global.blood[trait] = 1;
    }
    else {
        global.blood[trait] = actions.blood[action].grant[1];
    }
    blood();
}

function pick_monument(){
    let monuments = [];
    ['Obelisk','Statue','Sculpture','Monolith'].forEach(function (type){
        if (type !== global.arpa['m_type']){
            monuments.push(type);
        }
    });
    if (global.race['evil'] && global.arpa['m_type'] !== 'Pillar' && !global.race['kindling_kindred'] && !global.race['smoldering']){
        monuments.push('Pillar');
    }
    if (global.race.universe === 'magic' && global.arpa['m_type'] !== 'Megalith'){
        monuments.push('Megalith');
    }
    return monuments[Math.rand(0,monuments.length)];
}

function monument_costs(res,offset,wiki){
    let type = wiki ? wiki.m_type : global.arpa.m_type;
    switch(type){
        case 'Obelisk':
            return res === 'Stone' ? costMultiplier('monument', offset, 1000000, 1.1, wiki) : 0;
        case 'Statue':
            return res === 'Aluminium' ? costMultiplier('monument', offset, 350000, 1.1, wiki) : 0;
        case 'Sculpture':
            return res === 'Steel' ? costMultiplier('monument', offset, 300000, 1.1, wiki) : 0;
        case 'Monolith':
            return res === 'Cement' ? costMultiplier('monument', offset, 300000, 1.1, wiki) : 0;
        case 'Pillar':
            return res === 'Lumber' ? costMultiplier('monument', offset, 1000000, 1.1, wiki) : 0;
        case 'Megalith':
            return res === 'Crystal' ? costMultiplier('monument', offset, 55000, 1.1, wiki) : 0;
    }
}

function checkRequirements(tech){
    if (arpaProjects[tech]['condition'] && !arpaProjects[tech].condition()){
        return false;
    }
    let c_path = global.race['truepath'] ? 'truepath' : 'standard';
    if (arpaProjects[tech].hasOwnProperty('path') && !arpaProjects[tech].path.includes(c_path)){
        return false;
    }
    var isMet = true;
    Object.keys(arpaProjects[tech].reqs).forEach(function (req) {
        if (!global.tech[req] || global.tech[req] < arpaProjects[tech].reqs[req]){
            isMet = false;
        }
    });
    return isMet;
}

function payArpaCosts(costs){
    costs = arpaAdjustCosts(costs);
    if (checkArpaCosts(costs)){
        Object.keys(costs).forEach(function (res){
            global['resource'][res].amount -= costs[res]() / 100;
        });
        return true;
    }
    return false;
}

function checkArpaCosts(costs){
    var test = true;
    Object.keys(costs).forEach(function (res){
        var testCost = Number(costs[res]()) / 100;
        if (testCost > Number(global['resource'][res].amount)) {
            test = false;
            return false;
        }
    });
    return test;
}

export function arpaAdjustCosts(costs,offset,wiki){
    costs = creativeAdjust(costs,offset,wiki);
    return adjustCosts({ 'cost': costs },offset,wiki);
}

function creativeAdjust(costs,offset,wiki){
    if ((wiki && wiki.creative) || (!wiki && global.race['creative'])){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            newCosts[res] = function(){ return costs[res](offset,wiki) * (1 - traits.creative.vars()[1] / 100); }
        });
        return newCosts;
    }
    return costs;
}

function costMultiplier(project,offset,base,mutiplier,wiki){
    var rank = global.arpa[project] ? global.arpa[project].rank : 0;
    if (((wiki && wiki.creative) || (!wiki && global.race['creative'])) && project !== 'syphon'){
        mutiplier -= traits.creative.vars()[0];
    }
    if (offset){
        rank += offset;
    }
    return Math.round((mutiplier ** rank) * base);
}

function physics(){
    if (global.tech['high_tech'] && global.tech.high_tech >= 6){
        let parent = $('#arpaPhysics');
        clearElement(parent);
        Object.keys(arpaProjects).forEach(function (project){
            addProject(parent,project);
        });
    }
}

export function clearGeneticsDrag(){
    let el = $('#geneticMinor')[0];
    if (el){
        let sort = Sortable.get(el);
        if (sort){
            sort.destroy();
        }
    }
}

function dragGeneticsList(){
    let el = $('#geneticMinor')[0];
    if (el){
        Sortable.create(el,{
            onEnd(e){
                let order = global.settings.mtorder;
                order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
                global.settings.mtorder = order;
                genetics();
            }
        });
    }
}

function genetics(){
    let parent = $('#arpaGenetics');
    clearGeneticsDrag();
    clearElement(parent);
    if (!global.settings.arpa.genetics){
        return false;
    }

    if (global.tech['genetics'] > 1){
        let genome = $(`<div id="arpaSequence" class="genome"></div>`);
        parent.append(genome);

        let label = global.tech.genetics > 2 ? loc('arpa_gene_mutation') : loc('arpa_sequence_genome');
        if (global.race['artifical']){
            label = global.tech.genetics > 2 ? loc('arpa_code_modification') : loc('arpa_decompile_source');
        }
        let sequence = $(`<div><span class="seqlbl has-text-warning">${label}</span> - ${loc('arpa_to_complete')} <span v-html="$options.filters.timer(time)"></span></div>`);
        genome.append(sequence);
        let progress = $(`<progress class="progress" :value="progress" max="${global.arpa.sequence.max}">{{ progress }}%</progress>`);
        genome.append(progress);
        let b_label = global.tech.genetics > 2 ? loc('arpa_mutate') : loc('arpa_sequence');
        if (global.race['artifical']){
            b_label = global.tech.genetics > 2 ? loc('arpa_modify') : loc('arpa_decompile');
        }
        let button = $(`<button class="button seq" @click="toggle">${b_label}</button>`);
        genome.append(button);

        if (global.tech['genetics'] >= 5){
            let boost = $(`<b-tooltip :label="boostLabel(false)" position="is-bottom" animated multilined><button class="button boost" @click="booster" :aria-label="boostLabel(true)">${loc('arpa_boost')}</button></b-tooltip>`);
            genome.append(boost);
        }

        if (global.tech['genetics'] >= 6){
            let boost = $(`<b-tooltip :label="novoLabel()" position="is-bottom" animated multilined><button class="button" @click="novo" :aria-label="novoLabel()">${loc(global.race['artifical'] ? 'arpa_novo_artifical' : 'arpa_novo')}</button></b-tooltip>`);
            genome.append(boost);
        }

        if (global.tech['genetics'] >= 7){
            let boost = $(`<b-tooltip :label="autoLabel(false)" position="is-bottom" animated multilined><button class="button auto" @click="auto_seq" :aria-label="autoLabel(true)">${loc(global.race['artifical'] ? 'arpa_auto_compile' : 'arpa_auto_sequence')}</button></b-tooltip>`);
            genome.append(boost);
        }

        if (global.arpa.sequence.on){
            $('#arpaSequence button.seq').addClass('has-text-success');
        }

        if (global.arpa.sequence.boost){
            $('#arpaSequence button.boost').addClass('has-text-success');
        }

        if (global.arpa.sequence.auto){
            $('#arpaSequence button.auto').addClass('has-text-success');
        }

        vBind({
            el: `#arpaSequence`,
            data: global.arpa.sequence,
            methods: {
                toggle(){
                    if (global.arpa.sequence.on){
                        global.arpa.sequence.on = false;
                        $('#arpaSequence button.seq').removeClass('has-text-success');
                    }
                    else {
                        global.arpa.sequence.on = true;
                        $('#arpaSequence button.seq').addClass('has-text-success');
                    }
                },
                booster(){
                    if (global.arpa.sequence.boost){
                        global.arpa.sequence.boost = false;
                        $('#arpaSequence button.boost').removeClass('has-text-success');
                    }
                    else {
                        global.arpa.sequence.boost = true;
                        $('#arpaSequence button.boost').addClass('has-text-success');
                    }
                },
                boostLabel(sr){
                    return loc(global.race['artifical'] ? 'arpa_boost_artifical_label' : 'arpa_boost_label') + (sr ? (global.arpa.sequence.boost ? loc('city_on') : loc('city_off')) : '');
                },
                novo(){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if (global.resource.Knowledge.amount >= 200000){
                            global.resource.Knowledge.amount -= 200000;
                            global.resource.Genes.amount++;
                        }
                        else {
                            break;
                        }
                    }
                },
                novoLabel(){
                    return loc(global.race['artifical'] ? 'arpa_novo_artifical_label' : 'arpa_novo_label',['200k']);
                },
                auto_seq(){
                    if (global.arpa.sequence.auto){
                        global.arpa.sequence.auto = false;
                        $('#arpaSequence button.auto').removeClass('has-text-success');
                    }
                    else {
                        global.arpa.sequence.auto = true;
                        $('#arpaSequence button.auto').addClass('has-text-success');
                    }
                },
                autoLabel(sr){
                    return loc(global.race['artifical'] ? 'arpa_auto_compile_label' : 'arpa_auto_seq_label') + (sr ? (global.arpa.sequence.boost ? loc('city_on') : loc('city_off')) : '');
                }
            },
            filters: {
                timer(val){
                    if (global.arpa.sequence.on && global.arpa.sequence.labs > 0){
                        if (global.arpa.sequence.boost){
                            return timeFormat(val / (global.arpa.sequence.labs * 2));
                        }
                        else {
                            return timeFormat(val / global.arpa.sequence.labs);
                        }
                    }
                    else {
                        let egg = easterEgg(14,12);
                        if (egg.length > 0){
                            return egg;
                        }
                        return loc('time_never');
                    }
                }
            }
        });

        popover(`popArpaSeq`, function(){
            if (global.tech.genetics > 2){
                return global.race['artifical'] ? loc('arpa_modify_desc') : loc('arpa_mutate_desc');
            }
            else {
                return global.race['artifical'] ? loc('arpa_decompile_desc') : loc('arpa_sequence_desc');
            }
        },
        {
            elm: `#arpaSequence .seqlbl`,
            classes: `has-background-light has-text-dark`
        });
    }

    if (global.tech['genetics'] > 2){
        let breakdown = $('<div id="geneticBreakdown" class="geneticTraits"></div>');
        $('#arpaGenetics').append(breakdown);

        let minorList = $('<div id="geneticMinor" class="traitListing"></div>');
        breakdown.append(minorList);

        if (global.tech['decay'] && global.tech['decay'] >= 2){
            if (!global.settings.mtorder.includes('fortify')){
                global.settings.mtorder.push('fortify');
            }
        }

        Object.keys(global.race).forEach(function (trait){
            if (traits[trait] && traits[trait].type === 'minor'){
                if (!global.settings.mtorder.includes(trait)){
                    global.settings.mtorder.push(trait);
                }
            }
        });

        if (global.genes['challenge'] && global.genes['challenge'] >= 5){
            if (!global.settings.mtorder.includes('mastery')){
                global.settings.mtorder.push('mastery');
            }
        }

        let minor = false;
        let minor_list = [];
        global.settings.mtorder.forEach(function(trait){
            if ((traits[trait] && traits[trait].type === 'minor') || trait === 'mastery' || trait === 'fortify'){
                if (trait !== 'fortify' || (global.tech['decay'] && global.tech['decay'] >= 2)){
                    if ((!['promiscuous','content','resilient','industrious','tactical','fibroblast'].includes(trait) && global.race['lone_survivor']) || !global.race['lone_survivor']){
                        minor = true;
                        bindTrait(minorList,trait);
                        minor_list.push(trait);
                    }
                }
            }
        });

        breakdown.append(`<div class="trait major has-text-success">${loc('arpa_race_genetic_traids',[flib('name')])}</div>`)

        let traitName = traitSkin('name');

        let remove_list = [];
        let null_list = [];
        let traitListing = $(`<div class="traitListing"></div>`);
        breakdown.append(traitListing);
        let trait_listing = deepClone(global.race);
        if (eventActive('fool',2023)){
            trait_listing['hooved'] = 1;
        }
        Object.keys(trait_listing).forEach(function (trait){
            if (traits[trait] && traits[trait].type !== 'minor' && traits[trait].type !== 'special' && trait !== 'evil' && trait !== 'soul_eater' && trait !== 'artifical'){
                let readOnly = false;
                if ((global.race['ss_traits'] && global.race.ss_traits.includes(trait)) || (global.race['iTraits'] && global.race.iTraits.hasOwnProperty(trait))){
                    readOnly = true;
                }
                else if (global.race.species === 'sludge' && (trait === 'ooze' || global.race['modified'])){
                    readOnly = true;
                }
                else if (!global.race.hasOwnProperty(trait)){
                    readOnly = true;
                }
                if (!readOnly && ((traits[trait].type === 'major' && global.genes['mutation']) || (traits[trait].type === 'genus' && global.genes['mutation'] && global.genes['mutation'] >= 2))){
                    let major = $(`<div class="traitRow"></div>`);
                    let purge = $(`<span class="remove${trait} basic-button has-text-danger" role="button" :aria-label="removeCost('${trait}')" @click="purge('${trait}')">${loc('arpa_remove_button')}</span>`);
                    remove_list.push(trait);

                    major.append(purge);
                    major.append($(`<span class="trait has-text-warning" id="raceTrait${trait}">${traitName[trait] ? traitName[trait] : traits[trait].name} (${loc(`arpa_genepool_rank`,[trait_listing[trait]])})</span>`));

                    traitListing.append(major);
                }
                else {
                    null_list.push(trait);
                    traitListing.append(`<div class="traitRow trait${trait}"><div class="trait has-text-warning${global.genes['mutation'] ? ' indent' : ''}">${traitName[trait] ? traitName[trait] : traits[trait].name} (${loc(`arpa_genepool_rank`,[trait_listing[trait]])})</div></div>`);
                }
            }
        });

        let trait_list = [];
        if (global.genes['mutation'] && global.genes['mutation'] >= 3){
            if (global.race.species !== 'sludge' || !global.race['modified']){
                breakdown.append(`<div class="trait major has-text-success">${loc('arpa_race_genetic_gain')}</div>`)

                let conflict_traits = ['dumb','smart']; //Conflicting traits are paired together
                Object.keys(races).forEach(function (race){
                    if (race !== 'junker' && race !== 'sludge' && race !== 'custom' && races[race].type === races[global.race.species].type){
                        Object.keys(races[race].traits).forEach(function (trait){
                            if (!global.race[trait] && trait !== 'soul_eater'){
                                let conflict_pos = conflict_traits.indexOf(trait);
                                if (conflict_pos === -1){
                                    trait_list.push(trait);
                                }
                                else {
                                    let is_conflict = false;
                                    switch (conflict_pos % 2){
                                        case 0:
                                            if (global.race[conflict_traits[conflict_pos + 1]]){
                                                is_conflict = true;
                                            }
                                            break;
                                        case 1:
                                            if (global.race[conflict_traits[conflict_pos - 1]]){
                                                is_conflict = true;
                                            }
                                            break;
                                    }
                                    if (!is_conflict) {
                                        trait_list.push(trait);
                                    }
                                }
                            }
                        });
                    }
                });

                let addListing = $(`<div class="traitListing"></div>`);
                breakdown.append(addListing);
                for (let i=0; i<trait_list.length; i++){
                    let trait = trait_list[i];
                    let major = $(`<div class="traitRow"></div>`);
                    let add = $(`<span class="add${trait} basic-button has-text-success" role="button" :aria-label="addCost('${trait}')" @click="gain('${trait}')">${loc('arpa_gain_button')}</span>`);

                    major.append(add);
                    major.append($(`<span class="trait has-text-warning" id="raceTrait${trait}">${traitName[trait] ? traitName[trait] : traits[trait].name}</span>`));

                    addListing.append(major);
                }
            }
        }

        if (minor){
            breakdown.prepend(`<div class="trait minor has-text-success">${loc('arpa_race_genetic_minor_traits',[flib('name')])}</div>`)
        }

        let rmCost = function(t){
            let cost = traits[t].val * 5;
            if (global.race.species === 'custom' || global.race.species === 'sludge'){
                cost *= 10;
            }
            if (cost < 0){
                cost *= -1;
            }
            return loc('arpa_remove',[traitSkin('name',t),cost,global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name')]);
        };

        let addCost = function(t){
            let cost = traits[t].val * 5;
            if (global.race.species === 'custom' || global.race.species === 'sludge'){
                cost *= 10;
            }
            if (cost < 0){
                cost *= -1;
            }
            return loc('arpa_gain',[traitSkin('name',t),cost,global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name')]);
        };

        let mGeneCost = function(t){
            let cost = fibonacci(global.race.minor[t] ? global.race.minor[t] + 4 : 4);
            if (t === 'mastery'){ cost *= 5; }
            return loc('arpa_gene_buy',[traitSkin('name',t),sizeApproximation(cost),global.resource.Genes.name]);
        };

        let mPhageCost = function(t){
            let cost = fibonacci(global.genes.minor[t] ? global.genes.minor[t] + 4 : 4);
            if (t === 'mastery'){ cost *= 2; }
            return loc('arpa_phage_buy',[traitSkin('name',t),sizeApproximation(cost),loc(`resource_Phage_name`)]);
        };

        vBind({
            el: `#geneticBreakdown`,
            data: {
                genes: global.genes,
                race: global.race
            },
            methods: {
                gene(t){
                    let curr_iteration = 0;
                    let iterations = keyMultiplier();
                    let can_purchase = true;
                    let redraw = false;
                    while (curr_iteration < iterations && can_purchase){
                        let cost = fibonacci(global.race.minor[t] ? global.race.minor[t] + 4 : 4);
                        if (t === 'mastery'){ cost *= 5; }
                        if (global.resource.Genes.amount >= cost){
                            global.resource.Genes.amount -= cost;
                            global.race.minor[t] ? global.race.minor[t]++ : global.race.minor[t] = 1;
                            global.race[t] ? global.race[t]++ : global.race[t] = 1;
                            redraw = true;
                        }
                        else {
                            can_purchase = false;
                        }
                        curr_iteration++;
                    }
                    if (redraw){
                        if (t === 'mastery'){
                            calc_mastery(true);
                        }
                        genetics();
                        if (t === 'persuasive'){
                            updateTrades();
                        }
                    }
                },
                phage(t){
                    let curr_iteration = 0;
                    let iterations = keyMultiplier();
                    let can_purchase = true;
                    let redraw = false;
                    while (curr_iteration < iterations && can_purchase){
                        let cost = fibonacci(global.genes.minor[t] ? global.genes.minor[t] + 4 : 4);
                        if (t === 'mastery'){ cost *= 2; }
                        if (global.prestige.Phage.count >= cost){
                            global.prestige.Phage.count -= cost;
                            global.genes.minor[t] ? global.genes.minor[t]++ : global.genes.minor[t] = 1;
                            global.race[t] ? global.race[t]++ : global.race[t] = 1;
                            redraw = true;
                        }
                        else {
                            can_purchase = false;
                        }
                        curr_iteration++;
                    }
                    if (redraw){
                        if (t === 'mastery'){
                            calc_mastery(true);
                        }
                        genetics();
                        if (t === 'persuasive'){
                            updateTrades();
                        }
                    }
                },
                purge(t){
                    if (global.race.species === 'sludge' && (global.race['modified'] || t === 'ooze')){
                        return;
                    }
                    let cost = traits[t].val * 5;
                    if (global.race.species === 'custom' || global.race.species === 'sludge'){
                        cost *= 10;
                    }
                    if (cost < 0){
                        cost *= -1;
                    }
                    let res = global.race.universe === 'antimatter' ? 'AntiPlasmid' : 'Plasmid';
                    if (global.prestige[res].count >= cost){
                        global.prestige[res].count -= cost;
                        let rank = global.race[t];
                        delete global.race[t];
                        if (!global.race['modified']){
                            global.race['modified'] = 1;
                        }
                        else {
                            global.race['modified']++;
                        }
                        cleanRemoveTrait(t,rank);
                        genetics();
                        drawTech();
                        drawCity();

                        let count = 0;
                        Object.keys(global.race).forEach(function (trait){
                            if ((traits[trait] && (traits[trait].type == 'major' || traits[trait].type == 'genus')) && trait !== 'evil'){
                                count++;
                            }
                        });
                        if (count === 0){
                            unlockFeat('blank_slate');
                        }
                    }
                },
                gain(t){
                    if (global.race.species === 'sludge' && global.race['modified']){
                        return;
                    }
                    let cost = traits[t].val * 5;
                    if (global.race.species === 'sludge'){
                        cost *= 2;
                    }
                    if (global.race.species === 'custom'){
                        cost *= 10;
                    }
                    if (cost < 0){
                        cost *= -1;
                    }
                    let res = global.race.universe === 'antimatter' ? 'AntiPlasmid' : 'Plasmid';
                    if (global.prestige[res].count >= cost){
                        global.prestige[res].count -= cost;
                        global.race[t] = 1;
                        if (!global.race['modified']){
                            global.race['modified'] = 1;
                        }
                        else {
                            global.race['modified']++;
                        }
                        cleanAddTrait(t);
                        genetics();
                        drawTech();
                        drawCity();
                    }
                },
                geneCost(t){
                    return mGeneCost(t);
                },
                phageCost(t){
                    return mPhageCost(t);
                },
                traitEffect(t){
                    return loc(`trait_${t}_effect`);
                },
                removeCost(t){
                    return rmCost(t);
                },
                addCost(t){
                    return addCost(t);
                },
                genePurchasable(t){
                    let cost = fibonacci(global.race.minor[t] ? global.race.minor[t] + 4 : 4);
                    if (t === 'mastery'){ cost *= 5; }
                    return global.resource.Genes.amount >= cost;
                },
                phagePurchasable(t){
                    let cost = fibonacci(global.genes.minor[t] ? global.genes.minor[t] + 4 : 4);
                    if (t === 'mastery'){ cost *= 2; }
                    return global.prestige.Phage.count >= cost;
                }
            }
        });

        minor_list.forEach(function (t){
            popover(`popGenetrait${t}`, function(){
                return mGeneCost(t);
            },
            {
                elm: `#geneticBreakdown .t-${t} .gbuy`,
                classes: `has-background-light has-text-dark`
            });

            if (global.prestige.Phage.count > 0){
                popover(`popGenetrait${t}`, function(){
                    return mPhageCost(t);
                },
                {
                    elm: `#geneticBreakdown .t-${t} .pbuy`,
                    classes: `has-background-light has-text-dark`
                });
            }

            popover(`popGenetrait${t}`, function(){
                if (global.stats.feat['novice'] && global.stats.achieve['apocalypse'] && global.stats.achieve.apocalypse.l > 0){
                    return `<div>${traitSkin('desc',t)}</div><div>${loc(`trait_${t}_effect`)}</div>`;
                }
                else {
                    return traitSkin('desc',t);
                }
            },
            {
                elm: `#geneticBreakdown .t-${t} .name`,
                classes: `has-background-light has-text-dark`
            });
        });

        remove_list.forEach(function (t){
            popover(`popRemoveBkdwn${t}`, function(){
                return rmCost(t);
            },
            {
                elm: `#geneticBreakdown .remove${t}`,
                classes: `has-background-light has-text-dark`
            });

            let id = `raceTrait${t}`;
            let desc = $(`<div></div>`);
            getTraitDesc(desc, t, { trank: global.race[t] });
            popover(id,desc,{ wide: true, classes: 'w30' });
        });

        null_list.forEach(function (t){
            let id = `raceTrait${t}`;
            let desc = $(`<div></div>`);
            getTraitDesc(desc, t, { trank: global.race[t] });
            popover(id, desc, { elm: `#geneticBreakdown .trait${t}`, wide: true, classes: 'w30' });
        });

        trait_list.forEach(function (t){
            popover(`popAddBkdwn${t}`, function(){
                return addCost(t);
            },
            {
                elm: `#geneticBreakdown .add${t}`,
                classes: `has-background-light has-text-dark`
            });

            let id = `raceTrait${t}`;
            let desc = $(`<div></div>`);
            getTraitDesc(desc, t, { trank: global.race[t] });
            popover(id,desc,{ wide: true, classes: 'w30' });
        });

        dragGeneticsList();
    }
}

function bindTrait(breakdown,trait){
    let m_trait = $(`<div class="trait t-${trait} traitRow"></div>`);
    let gene = $(`<span v-bind:class="['basic-button', 'gene', 'gbuy', genePurchasable('${trait}') ? '' : 'has-text-fade']" role="button" :aria-label="geneCost('${trait}')" @click="gene('${trait}')">${global.resource.Genes.name} (${global.race.minor[trait] || 0})</span>`);
    m_trait.append(gene);
    if (global.prestige.Phage.count > 0){
        let phage = $(`<span v-bind:class="['basic-button', 'gene', 'pbuy', phagePurchasable('${trait}') ? '' : 'has-text-fade']" role="button" :aria-label="phageCost('${trait}')" @click="phage('${trait}')">${loc('resource_Phage_name')} (${global.genes.minor[trait] || 0})</span>`);
        m_trait.append(phage);
    }

    let total = global.race[trait] > 1 ? `(${global.race[trait]}) ` : '';
    m_trait.append(`<span class="has-text-warning name">${total}${traitSkin('name',trait)}</span>`);

    breakdown.append(m_trait);
}

function fibonacci(num, memo){
    memo = memo || {};
    if (memo[num]) return memo[num];
    if (num <= 1) return 1;
    return memo[num] = fibonacci(num - 1, memo) + fibonacci(num - 2, memo);
}

function crispr(){
    if ((global.tech['genetics'] && global.tech['genetics'] > 3) || global['sim']){
        clearElement($('#arpaCrispr'));
        $('#arpaCrispr').append(`<div class="has-text-warning">${loc('arpa_crispr_desc')}</div>`);
        $('#arpaCrispr').append('<div id="genes"></div>');
        drawGenes();
    }
}

function blood(){
    if (global.tech['b_stone'] && global.tech['b_stone'] >= 2){
        clearElement($('#arpaBlood'));
        $('#arpaBlood').append(`<div class="has-text-warning">${loc('arpa_blood_desc')}</div>`);
        $('#arpaBlood').append('<div id="blood"></div>');
        drawBlood();
    }
}

function addProject(parent,project){
    if (checkRequirements(project)){
        if (!global.arpa[project]){
            global.arpa[project] = {
                complete: 0,
                rank: 0
            };
        }
        if (arpaProjects[project]['rank'] && global.arpa[project].rank >= arpaProjects[project].rank){
            return;
        }
        let current = $(`<div id="arpa${project}" class="arpaProject"></div>`);
        parent.append(current);

        let title = typeof arpaProjects[project].title === 'string' ? arpaProjects[project].title : arpaProjects[project].title();
        let head = $(`<div class="head"><span aria-hidden="true" class="desc has-text-warning">${title}</span><a v-on:click="srDesc" class="is-sr-only">${title}</a><span aria-hidden="true" v-show="rank" class="rank">{{ rank | level }}</span><a v-on:click="srLevel" class="is-sr-only">{{ rank | level }}</a></div>`);
        current.append(head);

        let progress = $(`<div class="pbar"><progress class="progress" :value="complete" max="100"></progress><span class="progress-value has-text-danger">{{ complete }}%</span></div>`);
        head.append(progress);

        let buy = $('<div class="buy"></div>');
        current.append(buy);

        buy.append($(`<button aria-label="${loc('queue')} ${project}" class="button" @click="queue('${project}')">${loc('queue')}</button>`));
        buy.append($(`<button :aria-label="arpaProjectSRCosts('1','${project}')" class="button x1" @click="build('${project}',1)">1%</button>`));
        buy.append($(`<button :aria-label="arpaProjectSRCosts('10','${project}')" class="button x10" @click="build('${project}',10)">10%</button>`));
        buy.append($(`<button :aria-label="arpaProjectSRCosts('25','${project}')" class="button x25" @click="build('${project}',25)">25%</button>`));
        buy.append($(`<button :aria-label="arpaProjectSRCosts('100','${project}')" class="button x100" @click="build('${project}',100)">{{ complete | remain }}%</button>`));

        vBind({
            el: `#arpa${project}`,
            data: global.arpa[project],
            methods: {
                queue(pro){
                    if (global.tech['queue']){
                        let keyMult = keyMultiplier();
                        for (let i=0; i<keyMult; i++){
                            let arpaId = `arpa${pro}`;
                            let used = 0;
                            let buid_max = arpaProjects[pro]['queue_complete'] ? arpaProjects[pro].queue_complete() : Number.MAX_SAFE_INTEGER;
                            for (var j=0; j<global.queue.queue.length; j++){
                                used += Math.ceil(global.queue.queue[j].q / global.queue.queue[j].qs);
                                if (global.queue.queue[j].id === arpaId) {
                                    buid_max -= global.queue.queue[j].q;
                                }
                            }
                            if (used < global.queue.max && buid_max > 0){
                                if (global.settings.q_merge !== 'merge_never' && global.queue.queue.length > 0 && global.queue.queue[global.queue.queue.length-1].id === arpaId){
                                    global.queue.queue[global.queue.queue.length-1].q++;
                                }
                                else {
                                    let title = typeof arpaProjects[pro].title === 'string' ? arpaProjects[pro].title : arpaProjects[pro].title();
                                    global.queue.queue.push({ id: arpaId, action: 'arpa', type: pro, label: title, cna: false, time: 0, q: 1, qs: 1, t_max: 0 });
                                }
                                buildQueue();
                            }
                            else {
                                break;
                            }
                        }
                    }
                },
                build(pro,num){
                    buildArpa(pro,num,true);
                },
                srDesc(){
                    return srSpeak(arpaProjects[project].desc);
                },
                srLevel(){
                    return srSpeak(arpaProjects[project].effect());
                },
                arpaProjectSRCosts(id,project){
                    let inc = id === '100' ? 100 - global.arpa[project].complete : id;
                    var cost = `Construct ${inc}%. Costs:`;
                    var costs = arpaAdjustCosts(arpaProjects[project].cost);
                    Object.keys(costs).forEach(function (res){
                        var res_cost = +(costs[res]() * (inc / 100)).toFixed(0);
                        if (res_cost > 0){
                            var label = res === 'Money' ? '$' : global.resource[res].name + ': ';
                            var afford = global.resource[res].amount >= res_cost ? '' : ` ${loc('insufficient')} ${global.resource[res].name}.`;
                            cost = cost + ` ${label} ${sizeApproximation(res_cost,2)}.${afford}`;
                        }
                    });
                    return cost;
                }
            },
            filters: {
                remain(val){
                    return 100 - val;
                },
                level(num){
                    return loc('arpa_level',[num]);
                }
            }
        });

        popover(`popArpa${project}`, function(){
                return arpaProjects[project].desc;
            },
            {
                elm: `#arpa${project} .head .desc`,
                classes: `has-background-light has-text-dark`
            }
        );

        popover(`popArpa${project}`, function(){
                return arpaProjects[project].effect();
            },
            {
                elm: `#arpa${project} .head .rank`,
                classes: `has-background-light has-text-dark`
            }
        );

        let classes = [1,10,25,100];
        for (let i=0; i<classes.length; i++){
            let id = classes[i];
            popover(`popArpa${project}${id}`, function(){
                    return arpaProjectCosts(id,project);
                },
                {
                    elm: `#arpa${project} .buy .x${id}`,
                    classes: `has-background-light has-text-dark`
                }
            );
        }
    }
}

export function buildArpa(pro,num,update){
    let completed = false;
    if (num === 100){
        num = 100 - global.arpa[pro].complete;
    }
    for (let i=0; i<num; i++){
        if (payArpaCosts(arpaProjects[pro].cost)){
            global.arpa[pro].complete++;
            if (global.arpa[pro].complete >= 100){
                global.arpa[pro].rank++;
                global.arpa[pro].complete = 0;
                global.tech[arpaProjects[pro].grant] = global.arpa[pro].rank;
                completed = true;
                if (pro === 'monument'){
                    global.arpa['m_type'] = pick_monument();
                    $(`#arpa${pro} .head .desc`).html(arpaProjects[pro].title());
                    updateQueueNames(false, ['arpamonument']);
                }
                if (pro === 'roid_eject'){
                    $(`#arpa${pro} .head .desc`).html(arpaProjects[pro].title());
                    updateQueueNames(false, ['arparoid_eject']);
                }
                if (pro === 'launch_facility'){
                    global.settings.showSpace = true;
                    global.tech['space'] = 1;
                    clearPopper('popArpalaunch_facility');
                    [1,10,25,100].forEach(function(amount){
                        clearPopper(`popArpalaunch_facility${amount}`);
                    });
                    removeFromQueue(['arpalaunch_facility']);
                    physics();
                    renderSpace();
                    messageQueue(loc('arpa_projects_launch_facility_msg'),'info',false,['progress']);
                }
                if (global.race['inflation']){
                    global.race.inflation += 10;
                }
                drawTech();
            }
        }
    }
    if (update){
        let amounts = [1,10,25,100];
        let popper = $('#popper');
        let pid = popper.data('id');
        for (let i=0; i<amounts.length; i++){
            if (pid === `popArpa${pro}${amounts[i]}`){
                clearElement(popper);
                popper.append(arpaProjectCosts(amounts[i],pro));
                break;
            }
        }
    }
    return completed;
}

export function arpaProjectCosts(id,project){
    let inc = id === 100 ? 100 - global.arpa[project].complete : id;
    var cost = $('<div></div>');
    var costs = arpaAdjustCosts(arpaProjects[project].cost);
    let tc = arpaTimeCheck(arpaProjects[project], inc / 100, false, true);

    Object.keys(costs).forEach(function (res){
        var res_cost = +(costs[res]() * (inc / 100)).toFixed(0);
        if (res_cost > 0){
            var label = res === 'Money' ? '$' : global.resource[res].name + ': ';
            var color = global.resource[res].amount >= res_cost ? 'has-text-dark' : ( res === tc.r ? 'has-text-danger' : 'has-text-alert');
            cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}${sizeApproximation(res_cost,2)}</div>`));
        }
    });
    return cost;
}

function updateTrades() {
    Object.keys(global.resource).forEach(function (res){
        vBind({el: `#market-${res}`},'update');
    });
    vBind({el: `#galaxyTrade`},'update');
}
