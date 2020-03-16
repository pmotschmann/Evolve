import { global, poppers, keyMultiplier, sizeApproximation, srSpeak } from './vars.js';
import { clearElement, timeFormat, vBind, messageQueue, removeFromQueue } from './functions.js';
import { dragQueue } from './civics.js';
import { actions, drawTech, drawCity, addAction, removeAction } from './actions.js';
import { races, traits, cleanAddTrait, cleanRemoveTrait } from './races.js';
import { space } from './space.js';
import { unlockFeat } from './achieve.js';
import { loc } from './locale.js'

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
        case 'GeneTech':
            return genePool;
        case 'Crispr':
            crispr();
            break;
    }
}

export const arpaProjects = {
    lhc: {
        title: loc('arpa_projects_lhc_title'),
        desc: loc('arpa_projects_lhc_desc'),
        reqs: { high_tech: 6 },
        grant: 'supercollider',
        effect(){
            let sc = global.tech['particles'] && global.tech['particles'] >= 3 ? 8 : 4;
            if (global.tech['storage'] >= 6){
                if (global.tech['particles'] && global.tech['particles'] >= 4){
                    return loc('arpa_projects_lhc_effect3',[sc,global.race['evil'] ? loc('city_babel_title') : loc('city_wardenclyffe')]);
                }
                else {
                    return loc('arpa_projects_lhc_effect2',[sc,global.race['evil'] ? loc('city_babel_title') : loc('city_wardenclyffe')]);
                }
            }
            else {
                return loc('arpa_projects_lhc_effect1',[sc,global.race['evil'] ? loc('city_babel_title') : loc('city_wardenclyffe')]);
            }
        },
        cost: {
            Money(offset){ return costMultiplier('lhc', offset, 2500000, 1.05); },
            Knowledge(offset){ return costMultiplier('lhc', offset, 500000, 1.05); },
            Copper(offset){ return costMultiplier('lhc', offset, 125000, 1.05); },
            Cement(offset){ return costMultiplier('lhc', offset, 250000, 1.05); },
            Aluminium(offset){ return costMultiplier('lhc', offset, 350000, 1.05); },
            Titanium(offset){ return costMultiplier('lhc', offset, 50000, 1.05); },
            Polymer(offset){ return costMultiplier('lhc', offset, 12000, 1.05); }
        }
    },
    stock_exchange: {
        title: loc('arpa_projects_stock_exchange_title'),
        desc: loc('arpa_projects_stock_exchange_desc'),
        reqs: { banking: 9 },
        grant: 'stock_exchange',
        effect(){
            if (global.tech['banking'] >= 10){
                return loc('arpa_projects_stock_exchange_effect2');
            }
            else {
                return loc('arpa_projects_stock_exchange_effect1');
            }
        },
        cost: {
            Money(offset){ return costMultiplier('stock_exchange', offset, 3000000, 1.06); },
            Plywood(offset){ return costMultiplier('stock_exchange', offset, 25000, 1.06); },
            Brick(offset){ return costMultiplier('stock_exchange', offset, 20000, 1.06); },
            Wrought_Iron(offset){ return costMultiplier('stock_exchange', offset, 10000, 1.06); }
        }
    },
    launch_facility: {
        id: 'arpalaunch_facility',
        title: loc('arpa_projects_launch_facility_title'),
        desc: loc('arpa_projects_launch_facility_desc'),
        reqs: { high_tech: 7 },
        grant: 'launch_facility',
        rank: 1,
        no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
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
        title(){ 
            switch(global.arpa.m_type){
                case 'Obelisk':
                    return loc('arpa_project_monument_obelisk');
                case 'Statue':
                    return loc('arpa_project_monument_statue');
                case 'Sculpture':
                    return loc('arpa_project_monument_sculpture');
                case 'Monolith':
                    return loc('arpa_project_monument_monolith');
            }
        },
        desc: loc('arpa_projects_monument_desc'),
        reqs: { monument: 1 },
        grant: 'monuments',
        effect(){
            return loc('arpa_projects_monument_effect1');
        },
        cost: {
            Stone(offset){ return monument_costs('Stone', offset) },
            Aluminium(offset){ return monument_costs('Aluminium', offset) },
            Cement(offset){ return monument_costs('Cement', offset) },
            Steel(offset){ return monument_costs('Steel', offset) }
        }
    },
    railway: {
        title: loc('arpa_projects_railway_title'),
        desc: loc('arpa_projects_railway_desc'),
        reqs: { high_tech: 6, trade: 3 },
        grant: 'railway',
        effect(){
            let routes = global.city['storage_yard'] ? Math.floor(global.city.storage_yard.count / 6) : 0;
            return loc('arpa_projects_railway_effect1',[routes,2,6,1]);
        },
        cost: {
            Money(offset){ return costMultiplier('railway', offset, 2500000, 1.08); },
            Lumber(offset){ return costMultiplier('railway', offset, 750000, 1.08); },
            Iron(offset){ return costMultiplier('railway', offset, 300000, 1.08); },
            Steel(offset){ return costMultiplier('railway', offset, 450000, 1.08); }
        }
    },
};

const genePool = {
    genetic_memory: {
        id: 'genes-genetic_memory',
        title: loc('arpa_genepool_genetic_memory_title'),
        desc: loc('arpa_genepool_genetic_memory_desc'),
        reqs: {},
        grant: ['creep',1],
        cost: 25,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('genetic_memory')){
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
        cost: 75,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('animus')){
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
        cost: 225,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('divine_remembrance')){
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
        cost: 618,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('divine_proportion')){
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
        cost: 999,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('genetic_repository')){
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
        cost: 50,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('spatial_reasoning')){
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
        cost: 125,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('spatial_superiority')){
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
        cost: 325,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('spatial_supremacy')){
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
        cost: 500,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('dimensional_warping')){
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
        cost: 10,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('morphogenesis')){
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
        cost: 35,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('recombination')){
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
        cost: 25,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('synthesis')){
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
        cost: 40,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('karyokinesis')){
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
        cost: 55,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('cytokinesis')){
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
        cost: 90,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('mitosis')){
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
        cost: 165,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('mitosis')){
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
        cost: 1250,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('mutation')){
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
        cost: 1500,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('transformation')){
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
        cost: 1750,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('metamorphosis')){
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
        cost: 65,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('replication')){
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
        cost: 45,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('artificer')){
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
        cost: 90,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('detail_oriented')){
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
        cost: 135,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('rigorous')){
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
        cost: 75,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('geographer')){
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
        cost: 160,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('architect')){
                return true;
            }
            return false;
        }
    },
    hardened_genes: {
        id: 'genes-hardened_genes',
        title: loc('arpa_genepool_hardened_genes_title'),
        desc: loc('arpa_genepool_hardened_genes_desc'),
        reqs: {},
        grant: ['challenge',1],
        cost: 5,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('hardened_genes')){
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
        cost: 50,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('unlocked')){
                return true;
            }
            return false;
        }
    },
    ancients: {
        id: 'genes-ancients',
        title: loc('arpa_genepool_ancients_title'),
        desc: loc('arpa_genepool_ancients_desc'),
        reqs: { evolve: 2, old_gods: 1 },
        grant: ['ancients',1],
        cost: 120,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('ancients')){
                global.genes['ancients'] = 1;
                drawTech();
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
        cost: 3000,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('transcendence')){
                global.genes['transcendence'] = 1;
                drawTech();
                return true;
            }
            return false;
        }
    },
    bleeding_effect: {
        id: 'genes-bleeding_effect',
        title: loc('arpa_genepool_bleeding_effect_title'),
        desc: loc('arpa_genepool_bleeding_effect_desc',[2.5]),
        reqs: { creep: 2 },
        grant: ['bleed',1],
        condition(){
            return global.race.universe === 'antimatter' ? true : false;
        },
        cost: 100,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('bleeding_effect')){
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
        cost: 500,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('synchronicity')){
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
        cost: 1000,
        effect(){ return crispr_effect($(this)[0].cost); },
        action(){
            if (payPlasmids('astral_awareness')){
                return true;
            }
            return false;
        }
    }
}

function crispr_effect(cost){
    let plasmid = global.race.universe === 'antimatter' ? loc('arpa_genepool_effect_antiplasmid') : loc('arpa_genepool_effect_plasmid');
    return `<div class="cost"><span class="has-text-special">${plasmid}</span>: <span>${cost}</span></div>`;
}

function payPlasmids(gene){
    if (global.race.universe === 'antimatter'){
        if (global.race.Plasmid.anti >= genePool[gene].cost){
            global.race.Plasmid.anti -= genePool[gene].cost;
            return true;
        }
    }
    else {
        if (global.race.Plasmid.count >= genePool[gene].cost){
            global.race.Plasmid.count -= genePool[gene].cost;
            return true;
        }
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

export function gainGene(action){
    var gene = actions.genes[action].grant[0];
    global.genes[gene] = actions.genes[action].grant[1];
    crispr();
}

function pick_monument(){
    switch(Math.rand(0,4)){
        case 0:
            return 'Obelisk';
        case 1:
            return 'Statue';
        case 2:
            return 'Sculpture';
        case 3:
            return 'Monolith';
    }
}

function monument_costs(res,offset){
    switch(global.arpa.m_type){
        case 'Obelisk':
            return res === 'Stone' ? costMultiplier('monument', offset, 1000000, 1.1) : 0;
        case 'Statue':
            return res === 'Aluminium' ? costMultiplier('monument', offset, 350000, 1.1) : 0;
        case 'Sculpture':
            return res === 'Steel' ? costMultiplier('monument', offset, 300000, 1.1) : 0;
        case 'Monolith':
            return res === 'Cement' ? costMultiplier('monument', offset, 300000, 1.1) : 0;
    }
}

function checkRequirements(tech){
    var isMet = true;
    Object.keys(arpaProjects[tech].reqs).forEach(function (req) {
        if (!global.tech[req] || global.tech[req] < arpaProjects[tech].reqs[req]){
            isMet = false;
        }
    });
    return isMet;
}

function payCosts(costs){
    costs = adjustCosts(costs);
    if (checkCosts(costs)){
        Object.keys(costs).forEach(function (res){
            global['resource'][res].amount -= costs[res]() / 100;
        });
        return true;
    }
    return false;
}

function checkCosts(costs){
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

function adjustCosts(costs){
    return kindlingAdjust(costs);
}

function kindlingAdjust(costs){
    if (global.race['kindling_kindred'] && (costs['Lumber'] || costs['Plywood'])){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res !== 'Lumber' && res !== 'Plywood'){
                newCosts[res] = function(){ return costs[res](); }
            }
        });
        return newCosts;
    }
    return costs;
}

function costMultiplier(project,offset,base,mutiplier){
    var rank = global.arpa[project] ? global.arpa[project].rank : 0;
    if (global.race['creative']){
        mutiplier -= 0.01;
    }
    if (offset){
        rank += offset;
    }
    return Math.round((mutiplier ** rank) * base);
}

function physics(){
    let parent = $('#arpaPhysics');
    clearElement(parent);
    addProject(parent,'lhc');
    addProject(parent,'stock_exchange');
    addProject(parent,'launch_facility');
    addProject(parent,'monument');
    addProject(parent,'railway');
}

function genetics(){
    let parent = $('#arpaGenetics');
    clearElement(parent);
    if (!global.settings.arpa.genetics){
        return false;
    }

    if (global.tech['genetics'] > 1){
        let genome = $(`<div id="arpaSequence" class="genome"></div>`);
        parent.append(genome);

        if (!global.arpa['sequence']){
            global.arpa['sequence'] = {
                max: 50000,
                progress: 0,
                time: 50000,
                on: true
            };
        }

        if (!global.arpa.sequence['boost']){
            global.arpa.sequence['boost'] = false;
        }

        if (!global.arpa.sequence['auto']){
            global.arpa.sequence['auto'] = false;
        }

        let label = global.tech.genetics > 2 ? loc('arpa_gene_mutation') : loc('arpa_sequence_genome');
        let sequence = $(`<div><b-tooltip class="has-text-warning" :label="seq()" position="is-bottom" size="is-small" multilined animated>${label}</b-tooltip> - ${loc('arpa_to_complete')} {{ time | timer }}</div>`);
        genome.append(sequence);
        let progress = $(`<progress class="progress" :value="progress" max="${global.arpa.sequence.max}">{{ progress }}%</progress>`);
        genome.append(progress);
        let b_label = global.tech.genetics > 2 ? loc('arpa_mutate') : loc('arpa_sequence');
        let button = $(`<button class="button seq" @click="toggle">${b_label}</button>`);
        genome.append(button);

        if (global.tech['genetics'] >= 5){
            let boost = $(`<b-tooltip :label="boostLabel(false)" position="is-bottom" animated multilined><button class="button boost" @click="booster" :aria-label="boostLabel(true)">${loc('arpa_boost')}</button></b-tooltip>`);
            genome.append(boost);
        }

        if (global.tech['genetics'] >= 6){
            let boost = $(`<b-tooltip :label="novoLabel()" position="is-bottom" animated multilined><button class="button" @click="novo" :aria-label="novoLabel()">${loc('arpa_novo')}</button></b-tooltip>`);
            genome.append(boost);
        }

        if (global.tech['genetics'] >= 7){
            let boost = $(`<b-tooltip :label="autoLabel(false)" position="is-bottom" animated multilined><button class="button auto" @click="auto_seq" :aria-label="autoLabel(true)">${loc('arpa_auto_sequence')}</button></b-tooltip>`);
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
                seq(){
                    if (global.tech.genetics > 2){
                        return loc('arpa_mutate_desc');
                    }
                    else {
                        return loc('arpa_sequence_desc');
                    }
                },
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
                    return loc('arpa_boost_label') + (sr ? (global.arpa.sequence.boost ? loc('city_on') : loc('city_off')) : '');
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
                    return loc('arpa_novo_label',['200k']);
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
                    return loc('arpa_auto_seq_label') + (sr ? (global.arpa.sequence.boost ? loc('city_on') : loc('city_off')) : '');
                }
            },
            filters: {
                timer(val){
                    if (global.city.biolab.on > 0){
                        let labs = global.city.ptrait === 'toxic' ? global.city.biolab.on + 1 : global.city.biolab.on;
                        if (global.arpa.sequence.boost){
                            return timeFormat(val / (labs * 2));
                        }
                        else {
                            return timeFormat(val / labs);
                        }
                    }
                    else {
                        return loc('time_never');
                    }
                }
            }
        });
    }
    if (global.tech['genetics'] > 2){
        let breakdown = $('<div id="geneticBreakdown" class="geneticTraits"></div>');
        $('#arpaGenetics').append(breakdown);

        let minor = false;
        if (global.tech['decay'] && global.tech['decay'] >= 2){
            let trait = 'fortify';
            minor = true;
            let m_trait = $(`<div class="trait t-${trait} traitRow"></div>`);
            let gene = $(`<b-tooltip :label="geneCost('${trait}')" position="is-bottom" multilined animated><span v-bind:class="['basic-button', 'gene', genePurchasable('${trait}') ? '' : 'has-text-fade']" role="button" :aria-label="geneCost('${trait}')" @click="gene('${trait}')">${global.resource.Genes.name} (${global.race.minor[trait] || 0})</span></b-tooltip>`);
            m_trait.append(gene);
            if (global.race.Phage.count > 0){
                let phage = $(`<b-tooltip :label="phageCost('${trait}')" position="is-bottom" multilined animated><span v-bind:class="['basic-button', 'gene', phagePurchasable('${trait}') ? '' : 'has-text-fade']" role="button" :aria-label="phageCost('${trait}')" @click="phage('${trait}')">Phage (${global.genes.minor[trait] || 0})</span></b-tooltip>`);
                m_trait.append(phage);
            }
            if (global.race[trait] > 1){
                m_trait.append(`<span class="has-text-warning">(${global.race[trait]}) ${traits[trait].desc}</span>`);
            }
            else {
                m_trait.append(`<span class="has-text-warning">${traits[trait].desc}</span>`);
            }
            breakdown.append(m_trait);
        }

        Object.keys(global.race).forEach(function (trait){
            if (traits[trait] && traits[trait].type === 'minor'){
                minor = true;
                let m_trait = $(`<div class="trait t-${trait} traitRow"></div>`);
                let gene = $(`<b-tooltip :label="geneCost('${trait}')" position="is-bottom" multilined animated><span v-bind:class="['basic-button', 'gene', genePurchasable('${trait}') ? '' : 'has-text-fade']" role="button" :aria-label="geneCost('${trait}')" @click="gene('${trait}')">${global.resource.Genes.name} (${global.race.minor[trait] || 0})</span></b-tooltip>`);
                m_trait.append(gene);
                if (global.race.Phage.count > 0){
                    let phage = $(`<b-tooltip :label="phageCost('${trait}')" position="is-bottom" multilined animated><span v-bind:class="['basic-button', 'gene', phagePurchasable('${trait}') ? '' : 'has-text-fade']" role="button" :aria-label="phageCost('${trait}')" @click="phage('${trait}')">Phage (${global.genes.minor[trait] || 0})</span></b-tooltip>`);
                    m_trait.append(phage);
                }
                if (global.race[trait] > 1){
                    m_trait.append(`<span class="has-text-warning">(${global.race[trait]}) ${traits[trait].desc}</span>`);
                }
                else {
                    m_trait.append(`<span class="has-text-warning">${traits[trait].desc}</span>`);
                }
                breakdown.append(m_trait);
            }
        });

        breakdown.append(`<div class="trait major has-text-success">${loc('arpa_race_genetic_traids',[races[global.race.species].name])}</div>`)
        
        Object.keys(global.race).forEach(function (trait){
            if (traits[trait] && traits[trait].type !== 'minor' && traits[trait].type !== 'special' && trait !== 'evil' && trait !== 'soul_eater'){
                if ((traits[trait].type === 'major' && global.genes['mutation']) || (traits[trait].type === 'genus' && global.genes['mutation'] && global.genes['mutation'] >= 2)){
                    let major = $(`<div class="traitRow"></div>`);
                    let purge = $(`<b-tooltip :label="removeCost('${trait}')" position="is-bottom" multilined animated><span class="basic-button has-text-danger" role="button" :aria-label="removeCost('${trait}')" @click="purge('${trait}')">Remove</span></b-tooltip>`);
                    
                    major.append(purge);
                    major.append($(`<span class="trait has-text-warning">${traits[trait].desc}</span>`));

                    breakdown.append(major);
                }
                else {
                    breakdown.append(`<div class="trait has-text-warning">${traits[trait].desc}</div>`);
                }
            }
        });
        
        if (global.genes['mutation'] && global.genes['mutation'] >= 3){
            breakdown.append(`<div class="trait major has-text-success">${loc('arpa_race_genetic_gain')}</div>`)

            let trait_list = [];
            let conflict_traits = ['dumb','smart','carnivore','herbivore']; //Conflicting traits are paired together
            Object.keys(races).forEach(function (race){
                if (races[race].type === races[global.race.species].type){
                    Object.keys(races[race].traits).forEach(function (trait){
                        if (!global.race[trait] && trait !== 'soul_eater'){
                            let conflict_pos = conflict_traits.indexOf(trait);
                            if (conflict_pos === -1){
                                trait_list.push(trait);
                            }
                            else{
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

            for (let i=0; i<trait_list.length; i++){
                let trait = trait_list[i];
                let major = $(`<div class="traitRow"></div>`);
                let add = $(`<b-tooltip :label="addCost('${trait}')" position="is-bottom" multilined animated><span class="basic-button has-text-success" role="button" :aria-label="addCost('${trait}')" @click="gain('${trait}')">Gain</span></b-tooltip>`);
                
                major.append(add);
                major.append($(`<span class="trait has-text-warning">${traits[trait].desc}</span>`));

                breakdown.append(major);
            }
        }

        if (minor){
            breakdown.prepend(`<div class="trait minor has-text-success">${loc('arpa_race_genetic_minor_traits',[races[global.race.species].name])}</div>`)
        }

        vBind({
            el: `#geneticBreakdown`,
            data: {
                genes: global.genes,
                race: global.race
            },
            methods: {
                gene(t){
                    let cost = fibonacci(global.race.minor[t] ? global.race.minor[t] + 4 : 4);
                    if (global.resource.Genes.amount >= cost){
                        global.resource.Genes.amount -= cost;
                        global.race.minor[t] ? global.race.minor[t]++ : global.race.minor[t] = 1;
                        global.race[t] ? global.race[t]++ : global.race[t] = 1;
                        genetics();
                    }
                },
                phage(t){
                    let cost = fibonacci(global.genes.minor[t] ? global.genes.minor[t] + 4 : 4);
                    if (global.race.Phage.count >= cost){
                        global.race.Phage.count -= cost;
                        global.genes.minor[t] ? global.genes.minor[t]++ : global.genes.minor[t] = 1;
                        global.race[t] ? global.race[t]++ : global.race[t] = 1;
                        genetics();
                    }
                },
                purge(t){
                    let cost = global.race['modified'] ? global.race['modified'] * 25 : 10;
                    if ((global.race.universe !== 'antimatter' && global.race.Plasmid.count >= cost) || (global.race.universe === 'antimatter' && global.race.Plasmid.anti >= cost)){
                        if (global.race.universe === 'antimatter'){
                            global.race.Plasmid.anti -= cost;
                        }
                        else {
                            global.race.Plasmid.count -= cost;
                        }
                        delete global.race[t];
                        if (!global.race['modified']){
                            global.race['modified'] = 1;
                        }
                        else {
                            global.race['modified']++;
                        }
                        cleanRemoveTrait(t);
                        genetics();
                        drawTech();
                        drawCity();

                        let count = 0;
                        Object.keys(global.race).forEach(function (trait){
                            if (traits[trait] && (traits[trait].type == 'major' || traits[trait].type == 'genus')){
                                count++;
                            }
                        });
                        if (count === 0){
                            unlockFeat('blank_slate');
                        }
                    }
                },
                gain(t){
                    let cost = global.race['modified'] ? global.race['modified'] * 25 : 10;
                    if ((global.race.universe !== 'antimatter' && global.race.Plasmid.count >= cost) || (global.race.universe === 'antimatter' && global.race.Plasmid.anti >= cost)){
                        if (global.race.universe === 'antimatter'){
                            global.race.Plasmid.anti -= cost;
                        }
                        else {
                            global.race.Plasmid.count -= cost;
                        }
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
                    let cost = sizeApproximation(fibonacci(global.race.minor[t] ? global.race.minor[t] + 4 : 4));
                    return loc('arpa_gene_buy',[loc('trait_' + t + '_name'),cost]);
                },
                phageCost(t){
                    let cost = sizeApproximation(fibonacci(global.genes.minor[t] ? global.genes.minor[t] + 4 : 4));
                    return loc('arpa_phage_buy',[loc('trait_' + t + '_name'),cost]);
                },
                removeCost(t){
                    let cost = global.race['modified'] ? global.race['modified'] * 25 : 10;
                    return loc('arpa_remove',[loc('trait_' + t + '_name'),cost,global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name')]);
                },
                addCost(t){
                    let cost = global.race['modified'] ? global.race['modified'] * 25 : 10;
                    return loc('arpa_gain',[loc('trait_' + t + '_name'),cost,global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name')]);
                },
                genePurchasable(t){
                    let cost = fibonacci(global.race.minor[t] ? global.race.minor[t] + 4 : 4);
                    return global.resource.Genes.amount >= cost;
                },
                phagePurchasable(t){
                    let cost = fibonacci(global.genes.minor[t] ? global.genes.minor[t] + 4 : 4);
                    return global.race.Phage.count >= cost;
                }
            }
        });
    }
}

function fibonacci(num, memo){
    memo = memo || {};
    if (memo[num]) return memo[num];
    if (num <= 1) return 1;
    return memo[num] = fibonacci(num - 1, memo) + fibonacci(num - 2, memo);
}

function crispr(){
    if (global.tech['genetics'] > 3){
        clearElement($('#arpaCrispr'));
        $('#arpaCrispr').append(`<div class="has-text-warning">${loc('arpa_crispr_desc')}</div>`);
        $('#arpaCrispr').append('<div id="genes"></div>');
        drawGenes();
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
        let head = $(`<div class="head"><span aria-hidden="true" class="desc has-text-warning">${title}</span><a v-on:click="srDesc" class="is-sr-only">${title}</a><span aria-hidden="true" v-show="rank" class="rank">Level - {{ rank }}</span><a v-on:click="srLevel" class="is-sr-only">Level - {{ rank }}</a></div>`);
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
                        if (!(arpaProjects[pro]['no_queue'] && arpaProjects[pro].no_queue())) {
                            let arpaId = `arpa${pro}`;
                            let max_queue = global.tech['queue'] >= 2 ? (global.tech['queue'] >= 3 ? 8 : 5) : 3;
                            if (global.stats.feat['journeyman'] && global.stats.feat['journeyman'] >= 2){
                                max_queue += global.stats.feat['journeyman'] >= 4 ? 2 : 1;
                            }
                            if (global.genes['queue'] && global.genes['queue'] >= 2){
                                max_queue *= 2;
                            }
                            let used = 0;
                            for (var j=0; j<global.queue.queue.length; j++){
                                used += Math.ceil(global.queue.queue[j].q / global.queue.queue[j].qs);
                            }
                            if (used < max_queue){
                                if (global.queue.queue.length > 0 && global.queue.queue[global.queue.queue.length-1].id === arpaId){
                                    global.queue.queue[global.queue.queue.length-1].q++;
                                }
                                else {
                                    global.queue.queue.push({ id: arpaId, action: pro, type: 'arpa', label: typeof arpaProjects[pro].title === 'string' ? arpaProjects[pro].title : arpaProjects[pro].title(), cna: false, time: 0, q: 1, qs: 1, t_max: 0 });
                                }
                                dragQueue();
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
                    var costs = adjustCosts(arpaProjects[project].cost);
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
                }
            }
        });

        $(`#arpa${project} .head .desc`).on('mouseover',function(){
            var popper = $(`<div id="popArpa${project}" class="popper has-background-light has-text-dark">${arpaProjects[project].desc}</div>`);
            $('#main').append(popper);
            popper.show();
            poppers[`popArpa${project}`] = new Popper($(`#arpa${project} .head`),popper);
        });
        $(`#arpa${project} .head .desc`).on('mouseout',function(){
            $(`#popArpa${project}`).hide();
            if (poppers[`popArpa${project}`]){
                poppers[`popArpa${project}`].destroy();
            }
            clearElement($(`#popArpa${project}`),true);
        });

        $(`#arpa${project} .head .rank`).on('mouseover',function(){
            let effect = arpaProjects[project].effect();
            var popper = $(`<div id="popArpa${project}" class="popper has-background-light has-text-dark">${effect}</div>`);
            $('#main').append(popper);
            popper.show();
            poppers[`popArpa${project}`] = new Popper($(`#arpa${project} .head`),popper);
        });
        $(`#arpa${project} .head .rank`).on('mouseout',function(){
            $(`#popArpa${project}`).hide();
            if (poppers[`popArpa${project}`]){
                poppers[`popArpa${project}`].destroy();
            }
            clearElement($(`#popArpa${project}`),true);
        });

        let classes = [1,10,25,100];
        for (let i=0; i<classes.length; i++){
            let id = classes[i];
            $(`#arpa${project} .buy .x${id}`).on('mouseover',function(){
                var cost = arpaProjectCosts(id,project);
                var popper = $(`<div id="popArpa${project}" class="popper has-background-light has-text-dark"></div>`);
                popper.append(cost);
                $('#main').append(popper);
                popper.show();
                poppers[`popArpa${project}`] = new Popper($(`#arpa${project}`),popper);
            });
            $(`#arpa${project} .buy .x${id}`).on('mouseout',function(){
                $(`#popArpa${project}`).hide();
                if (poppers[`popArpa${project}`]){
                    poppers[`popArpa${project}`].destroy();
                }
                clearElement($(`#popArpa${project}`),true);
            });
        }
    }
}

export function buildArpa(pro,num,update){
    let oNum = num;
    let completed = false;
    if (num === 100){
        num = 100 - global.arpa[pro].complete;
    }
    for (let i=0; i<num; i++){
        if (payCosts(arpaProjects[pro].cost)){
            global.arpa[pro].complete++;
            if (global.arpa[pro].complete >= 100){
                global.arpa[pro].rank++;
                global.arpa[pro].complete = 0;
                global.tech[arpaProjects[pro].grant] = global.arpa[pro].rank;
                completed = true;
                if (pro === 'monument'){
                    global.arpa['m_type'] = pick_monument();
                    $(`#arpa${pro} .head .desc`).html(arpaProjects[pro].title());
                }
                if (pro === 'launch_facility'){
                    removeFromQueue(['arpalaunch_facility']);
                    global.settings.showSpace = true;
                    global.tech['space'] = 1;
                    $(`#popArpa${pro}`).hide();
                    if (poppers[`popArpa${pro}`]){
                        poppers[`popArpa${pro}`].destroy();
                    }
                    clearElement($(`#popArpa${pro}`),true);
                    physics();
                    space();
                    messageQueue(loc('arpa_projects_launch_facility_msg'),'success');
                }
                drawTech();
            }
        }
    }
    if (update && $(`#popArpa${pro}`).length > 0){
        clearElement($(`#popArpa${pro}`));
        $(`#popArpa${pro}`).append(arpaProjectCosts(oNum,pro));
    }
    return completed;
}

function arpaProjectCosts(id,project){
    let inc = id === 100 ? 100 - global.arpa[project].complete : id;
    var cost = $('<div></div>');
    var costs = adjustCosts(arpaProjects[project].cost);
    Object.keys(costs).forEach(function (res){
        var res_cost = +(costs[res]() * (inc / 100)).toFixed(0);
        if (res_cost > 0){
            var label = res === 'Money' ? '$' : global.resource[res].name + ': ';
            var color = global.resource[res].amount >= res_cost ? 'has-text-dark' : 'has-text-danger';
            cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}${sizeApproximation(res_cost,2)}</div>`));
        }
    });
    return cost;
}
