import { global, vues, poppers, keyMultiplier } from './vars.js';
import { actions, drawTech, addAction, removeAction } from './actions.js';
import { races, traits } from './races.js';
import { space } from './space.js';
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

const arpaProjects = {
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
            Money: function(){ return costMultiplier('lhc', 2500000, 1.05); },
            Knowledge: function(){ return costMultiplier('lhc', 500000, 1.05); },
            Copper: function(){ return costMultiplier('lhc', 125000, 1.05); },
            Cement: function(){ return costMultiplier('lhc', 250000, 1.05); },
            Steel: function(){ return costMultiplier('lhc', 187500, 1.05); },
            Titanium: function(){ return costMultiplier('lhc', 50000, 1.05); },
            Polymer: function(){ return costMultiplier('lhc', 12000, 1.05); }
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
            Money: function(){ return costMultiplier('stock_exchange', 3000000, 1.06); },
            Plywood: function(){ return costMultiplier('stock_exchange', 25000, 1.06); },
            Brick: function(){ return costMultiplier('stock_exchange', 20000, 1.06); },
            Wrought_Iron: function(){ return costMultiplier('stock_exchange', 10000, 1.06); }
        }
    },
    launch_facility: {
        title: loc('arpa_projects_launch_facility_title'),
        desc: loc('arpa_projects_launch_facility_desc'),
        reqs: { high_tech: 7 },
        grant: 'launch_facility',
        rank: 1,
        effect(){
            return loc('arpa_projects_launch_facility_effect1');
        },
        cost: {
            Money: function(){ return costMultiplier('launch_facility', 2000000, 1.1); },
            Knowledge: function(){ return costMultiplier('launch_facility', 500000, 1.1); },
            Cement: function(){ return costMultiplier('launch_facility', 150000, 1.1); },
            Oil: function(){ return costMultiplier('launch_facility', 20000, 1.1); },
            Sheet_Metal: function(){ return costMultiplier('launch_facility', 15000, 1.1); },
            Alloy: function(){ return costMultiplier('launch_facility', 25000, 1.1); }
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
            Stone: function(){ return monument_costs('Stone') },
            Aluminium: function(){ return monument_costs('Aluminium') },
            Cement: function(){ return monument_costs('Cement') },
            Steel: function(){ return monument_costs('Steel') }
        }
    }
};

const genePool = {
    genetic_memory: {
        id: 'genes-genetic_memory',
        title: loc('arpa_genepool_genetic_memory_title'),
        desc: loc('arpa_genepool_genetic_memory_desc'),
        reqs: {},
        grant: ['creep',1],
        cost: 25,
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>25</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>75</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>225</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>618</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>999</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>50</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>125</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>325</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>500</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>10</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>35</span></div>`,
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
        desc: loc('arpa_genepool_synthesis_desc',[2]),
        reqs: { evolve: 1 },
        grant: ['synthesis',1],
        cost: 25,
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>25</span></div>`,
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
        desc: loc('arpa_genepool_synthesis_desc',[3]),
        reqs: { synthesis: 1 },
        grant: ['synthesis',2],
        cost: 40,
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>40</span></div>`,
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
        desc: loc('arpa_genepool_synthesis_desc',[4]),
        reqs: { synthesis: 2 },
        grant: ['synthesis',3],
        cost: 55,
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>55</span></div>`,
        action(){
            if (payPlasmids('cytokinesis')){
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>65</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>45</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>90</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>135</span></div>`,
        action(){
            if (payPlasmids('rigorous')){
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>5</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>50</span></div>`,
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
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>120</span></div>`,
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
        reqs: { ancients: 1, creep: 5, locked: 1 },
        grant: ['ancients',2],
        cost: 1500,
        effect: `<div class="cost"><span class="has-text-special">${loc('arpa_genepool_effect_plasmid')}</span>: <span>1500</span></div>`,
        action(){
            if (payPlasmids('transcendence')){
                return true;
            }
            return false;
        }
    }
}

function payPlasmids(gene){
    if (global.race.Plasmid.count >= genePool[gene].cost){
        global.race.Plasmid.count -= genePool[gene].cost;
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

function monument_costs(res){
    switch(global.arpa.m_type){
        case 'Obelisk':
            return res === 'Stone' ? costMultiplier('monument', 1000000, 1.1) : 0;
        case 'Statue':
            return res === 'Aluminium' ? costMultiplier('monument', 350000, 1.1) : 0;
        case 'Sculpture':
            return res === 'Steel' ? costMultiplier('monument', 300000, 1.1) : 0;
        case 'Monolith':
            return res === 'Cement' ? costMultiplier('monument', 300000, 1.1) : 0;
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

function costMultiplier(project,base,mutiplier){
    var rank = global.arpa[project] ? global.arpa[project].rank : 0;
    if (global.race['creative']){
        mutiplier -= 0.01;
    }
    return Math.round((mutiplier ** rank) * base);
}

function physics(){
    let parent = $('#arpaPhysics');
    parent.empty();
    addProject(parent,'lhc');
    addProject(parent,'stock_exchange');
    addProject(parent,'launch_facility');
    addProject(parent,'monument');
}

function genetics(){
    let parent = $('#arpaGenetics');
    parent.empty();
    if (!global.settings.arpa.genetics){
        return false;
    }

    if (global.tech['genetics'] > 1){
        if (vues[`arpaSequence`]){
            vues[`arpaSequence`].$destroy();
        }
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

        let label = global.tech.genetics > 2 ? loc('arpa_gene_mutation') : loc('arpa_sequence_genome');
        let sequence = $(`<div><b-tooltip class="has-text-warning" :label="seq()" position="is-bottom" size="is-small" multilined animated>${label}</b-tooltip> - ${loc('arpa_to_complete')} {{ time | timer }}</div>`);
        genome.append(sequence);
        let progress = $(`<progress class="progress" :value="progress" max="${global.arpa.sequence.max}">{{ progress }}%</progress>`);
        genome.append(progress);
        let b_label = global.tech.genetics > 2 ? loc('arpa_mutate') : loc('arpa_sequence');
        let button = $(`<button class="button seq" @click="toggle">${b_label}</button>`);
        genome.append(button);

        if (global.tech['genetics'] >= 5){
            let boost = $(`<b-tooltip :label="boostLabel()" position="is-bottom" animated multilined><button class="button boost" @click="booster" :aria-label="boostLabel()">${loc('arpa_boost')}</button></b-tooltip>`);
            genome.append(boost);
        }

        if (global.tech['genetics'] >= 6){
            let boost = $(`<b-tooltip :label="novoLabel()" position="is-bottom" animated multilined><button class="button" @click="novo" :aria-label="novoLabel()">${loc('arpa_novo')}</button></b-tooltip>`);
            genome.append(boost);
        }
        
        if (global.arpa.sequence.on){
            $('#arpaSequence button.seq').addClass('has-text-success');
        }

        if (global.arpa.sequence.boost){
            $('#arpaSequence button.boost').addClass('has-text-success');
        }

        vues[`arpaSequence`] = new Vue({
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
                boostLabel(){
                    return loc('arpa_boost_label');
                },
                novo(){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if (global.resource.Knowledge.amount >= 125000){
                            global.resource.Knowledge.amount -= 125000;
                            global.resource.Genes.amount++;
                        }
                        else {
                            break;
                        }
                    }
                },
                novoLabel(){
                    return loc('arpa_novo_label',['125k']);
                }
            },
            filters: {
                timer(val){
                    if (global.city.biolab.on > 0){
                        if (global.arpa.sequence.boost){
                            return (val / (global.city.biolab.on * 2)).toFixed(0) + 's';
                        }
                        else {
                            return (val / global.city.biolab.on).toFixed(0) + 's';
                        }
                    }
                    else {
                        return loc('time_never');
                    }
                }
            }
        });
        vues[`arpaSequence`].$mount(`#arpaSequence`);
    }
    if (global.tech['genetics'] > 2){
        let breakdown = $('<div id="geneticBreakdown" class="geneticTraits"></div>');
        $('#arpaGenetics').append(breakdown);

        let minor = false;
        Object.keys(global.race).forEach(function (trait){
            if (traits[trait] && traits[trait].type === 'minor'){
                minor = true;
                let m_trait = $(`<div class="trait t-${trait}"></div>`);
                let gene = $(`<b-tooltip :label="geneCost('${trait}')" position="is-bottom" multilined animated><span class="basic-button" role="button" :aria-label="geneCost('${trait}')" @click="gene('${trait}')">${global.resource.Genes.name}</span></b-tooltip>`);
                m_trait.append(gene);
                if (global.race.Phage.count > 0){
                    let phage = $(`<b-tooltip :label="phageCost('${trait}')" position="is-bottom" multilined animated><span class="basic-button" role="button" :aria-label="phageCost('${trait}')" @click="phage('${trait}')">Phage</span></b-tooltip>`);
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
            if (traits[trait] && traits[trait].type !== 'minor'){
                breakdown.append(`<div class="trait has-text-warning">${traits[trait].desc}</div>`);
            }
        });
        
        if (minor){
            breakdown.prepend(`<div class="trait minor has-text-success">${loc('arpa_race_genetic_minor_traits',[races[global.race.species].name])}</div>`)
        }

        if (vues[`arpaGenes`]){
            vues[`arpaGenes`].$destroy();
        }
        vues[`arpaGenes`] = new Vue({
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
                geneCost(t){
                    let cost = fibonacci(global.race.minor[t] ? global.race.minor[t] + 4 : 4);
                    return loc('arpa_gene_buy',[t,cost]);
                },
                phageCost(t){
                    let cost = fibonacci(global.genes.minor[t] ? global.genes.minor[t] + 4 : 4);
                    return loc('arpa_phage_buy',[t,cost]);
                }
            }
        });
        vues[`arpaGenes`].$mount(`#geneticBreakdown`);
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
        $('#arpaCrispr').empty();
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
        let head = $(`<div class="head"><span class="desc has-text-warning">${title}</span><span v-show="rank" class="rank">Level - {{ rank }}</span></div>`);
        current.append(head);

        let progress = $(`<div class="pbar"><progress class="progress" :value="complete" max="100"></progress><span class="progress-value has-text-danger">{{ complete }}%</span></div>`);
        head.append(progress);

        let buy = $('<div class="buy"></div>');
        current.append(buy);

        buy.append($(`<button class="button x1" @click="build('${project}',1)">1%</button>`));
        buy.append($(`<button class="button x10" @click="build('${project}',10)">10%</button>`));
        buy.append($(`<button class="button x25" @click="build('${project}',25)">25%</button>`));
        buy.append($(`<button class="button x100" @click="build('${project}',100)">{{ complete | remain }}%</button>`));

        vues[`arpa${project}`] = new Vue({
            data: global.arpa[project],
            methods: {
                build(pro,num){
                    if (num === 100){
                        num = 100 - global.arpa[project].complete;
                    }
                    for (let i=0; i<num; i++){
                        if (payCosts(arpaProjects[pro].cost)){
                            global.arpa[pro].complete++;
                            if (global.arpa[pro].complete >= 100){
                                global.arpa[pro].rank++;
                                global.arpa[pro].complete = 0;
                                global.tech[arpaProjects[pro].grant] = global.arpa[pro].rank;
                                if (pro === 'monument'){
                                    global.arpa['m_type'] = pick_monument();
                                    $(`#arpa${pro} .head .desc`).html(arpaProjects[pro].title());
                                }
                                if (pro === 'launch_facility'){
                                    global.settings.showSpace = true;
                                    global.tech['space'] = 1;
                                    $(`#popArpa${pro}`).hide();
                                    poppers[`popArpa${pro}`].destroy();
                                    $(`#popArpa${pro}`).remove();
                                    physics();
                                    space();
                                }
                                drawTech();
                            }
                        }
                    }
                }
            },
            filters: {
                remain(val){
                    return 100 - val;
                }
            }
        });
        vues[`arpa${project}`].$mount(`#arpa${project}`);

        $(`#arpa${project} .head .desc`).on('mouseover',function(){
            var popper = $(`<div id="popArpa${project}" class="popper has-background-light has-text-dark">${arpaProjects[project].desc}</div>`);
            $('#main').append(popper);
            popper.show();
            poppers[`popArpa${project}`] = new Popper($(`#arpa${project} .head`),popper);
        });
        $(`#arpa${project} .head .desc`).on('mouseout',function(){
            $(`#popArpa${project}`).hide();
            poppers[`popArpa${project}`].destroy();
            $(`#popArpa${project}`).remove();
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
            poppers[`popArpa${project}`].destroy();
            $(`#popArpa${project}`).remove();
        });

        let classes = ['1','10','25','100'];
        for (let i=0; i<classes.length; i++){
            let id = classes[i];
            $(`#arpa${project} .buy .x${id}`).on('mouseover',function(){
                let inc = id === '100' ? 100 - global.arpa[project].complete : id;
                var cost = $('<div></div>');
                var costs = adjustCosts(arpaProjects[project].cost);
                Object.keys(costs).forEach(function (res){
                    var res_cost = (costs[res]() * (inc / 100)).toFixed(0);
                    if (res_cost > 0){
                        var label = res === 'Money' ? '$' : global.resource[res].name + ': ';
                        var color = global.resource[res].amount >= res_cost ? 'has-text-dark' : 'has-text-danger';
                        cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}${res_cost}</div>`));
                    }
                });
                var popper = $(`<div id="popArpa${project}" class="popper has-background-light has-text-dark"></div>`);
                popper.append(cost);
                $('#main').append(popper);
                popper.show();
                poppers[`popArpa${project}`] = new Popper($(`#arpa${project}`),popper);
            });
            $(`#arpa${project} .buy .x${id}`).on('mouseout',function(){
                $(`#popArpa${project}`).hide();
                poppers[`popArpa${project}`].destroy();
                $(`#popArpa${project}`).remove();
            });
        }
    }
}
