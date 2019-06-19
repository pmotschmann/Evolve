import { global, vues, poppers, messageQueue, modRes } from './vars.js';
import { actions, drawCity, drawTech, addAction, removeAction } from './actions.js';
import { races, traits } from './races.js';
import { space } from './space.js';

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
        title: 'Supercollider',
        desc: 'A supercollider will help expand your understanding of theoretical sciences',
        reqs: { high_tech: 6 },
        grant: 'supercollider',
        effect() {
            let sc = global.tech['particles'] && global.tech['particles'] >= 3 ? 8 : 4;
            if (global.tech['storage'] >= 6){
                if (global.tech['particles'] && global.tech['particles'] >= 4){
                    return `Each completed supercollider increases wardenclyffe and university science caps by ${sc}%. They also boost warehouse and garage capacity by 5%.`;
                }
                else {
                    return `Each completed supercollider increases wardenclyffe and university science caps by ${sc}%. They also boost warehouse capacity by 5%.`;
                }
            }
            else {
                return `Each completed supercollider increases wardenclyffe and university science caps by ${sc}%.`;
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
        title: 'Stock Exchange',
        desc: 'The stock exchange will boost the amount of money your banks can trade in.',
        reqs: { banking: 9 },
        grant: 'stock_exchange',
        effect() {
            if (global.tech['banking'] >= 10){
                return 'Each level of stock exchange will boost bank capacity by 10% and banker effectiveness by 2%.';
            }
            else {
                return 'Each level of stock exchange will boost bank capacity by 10%.';
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
        title: 'Launch Facility',
        desc: 'A launch facility allows for construction and firing of rockets, and thus space exploration.',
        reqs: { high_tech: 7 },
        grant: 'launch_facility',
        rank: 1,
        effect(){
            return `Enables the space tab, does this description matter? it shouldn't because no one should be reading it.`;
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
        title(){ return global.arpa.m_type },
        desc: `Construct a monument to your civilization's greatness.`,
        reqs: { monument: 1 },
        grant: 'monuments',
        effect(){
            return 'Each monument increases maximum morale by 2%';
        },
        cost: {
            Stone: function(){ return monument_costs('Stone') },
            Wrought_Iron: function(){ return monument_costs('Wrought_Iron') },
            Cement: function(){ return monument_costs('Cement') },
            Steel: function(){ return monument_costs('Steel') }
        }
    }
};

const genePool = {
    genetic_memory: {
        id: 'genes-genetic_memory',
        title: 'Genetic Memory',
        desc: 'Reduces cost creep by 0.01',
        reqs: {},
        grant: ['creep',1],
        cost: 25,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>25</span></div>',
        action(){
            if (payPlasmids('genetic_memory')){
                return true;
            }
            return false;
        }
    },
    animus: {
        id: 'genes-animus',
        title: 'Animus',
        desc: 'Reduces cost creep by 0.02',
        reqs: { creep: 1 },
        grant: ['creep',2],
        cost: 75,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>75</span></div>',
        action(){
            if (payPlasmids('animus')){
                return true;
            }
            return false;
        }
    },
    divine_remembrance: {
        id: 'genes-divine_remembrance',
        title: 'Divine Remembrance',
        desc: 'Reduces cost creep by 0.03',
        reqs: { creep: 2 },
        grant: ['creep',3],
        cost: 225,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>225</span></div>',
        action(){
            if (payPlasmids('divine_remembrance')){
                return true;
            }
            return false;
        }
    },
    divine_proportion: {
        id: 'genes-divine_proportion',
        title: 'Divine Proportion',
        desc: 'Reduces cost creep by 0.04',
        reqs: { creep: 3 },
        grant: ['creep',4],
        cost: 618,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>618</span></div>',
        action(){
            if (payPlasmids('divine_proportion')){
                return true;
            }
            return false;
        }
    },
    genetic_repository: {
        id: 'genes-genetic_repository',
        title: 'Genetic Repository',
        desc: 'Reduces cost creep by 0.05',
        reqs: { creep: 4 },
        grant: ['creep',5],
        cost: 999,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>999</span></div>',
        action(){
            if (payPlasmids('genetic_repository')){
                return true;
            }
            return false;
        }
    },
    spatial_reasoning: {
        id: 'genes-spatial_reasoning',
        title: 'Spatial Reasoning',
        desc: 'Plasmids boost storage space',
        reqs: {},
        grant: ['store',1],
        cost: 50,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>50</span></div>',
        action(){
            if (payPlasmids('spatial_reasoning')){
                return true;
            }
            return false;
        }
    },
    spatial_superiority: {
        id: 'genes-spatial_superiority',
        title: 'Spatial Superiority',
        desc: 'Plasmid storage effect +50%',
        reqs: { store: 1 },
        grant: ['store',2],
        cost: 125,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>125</span></div>',
        action(){
            if (payPlasmids('spatial_superiority')){
                return true;
            }
            return false;
        }
    },
    spatial_supremacy: {
        id: 'genes-spatial_supremacy',
        title: 'Spatial Supremacy',
        desc: 'Plasmid storage effect +33%',
        reqs: { store: 2 },
        grant: ['store',3],
        cost: 325,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>325</span></div>',
        action(){
            if (payPlasmids('spatial_supremacy')){
                return true;
            }
            return false;
        }
    },
    morphogenesis: {
        id: 'genes-morphogenesis',
        title: 'Morphogenesis',
        desc: 'Decreases evolution costs',
        reqs: {},
        grant: ['evolve',1],
        cost: 10,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>10</span></div>',
        action(){
            if (payPlasmids('morphogenesis')){
                return true;
            }
            return false;
        }
    },
    recombination: {
        id: 'genes-recombination',
        title: 'Recombination',
        desc: 'Gain a minor trait when evolving',
        reqs: { evolve: 1 },
        grant: ['evolve',2],
        cost: 35,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>35</span></div>',
        action(){
            if (payPlasmids('recombination')){
                return true;
            }
            return false;
        }
    },
    replication: {
        id: 'genes-replication',
        title: 'Replication',
        desc: 'Increases Birth Rate',
        reqs: { evolve: 1 },
        grant: ['birth',1],
        cost: 65,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>65</span></div>',
        action(){
            if (payPlasmids('replication')){
                return true;
            }
            return false;
        }
    },
    artificer: {
        id: 'genes-artificer',
        title: 'Artificer',
        desc: 'Craftsman trigger twice a month',
        reqs: { evolve: 1 },
        grant: ['crafty',1],
        cost: 45,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>45</span></div>',
        action(){
            if (payPlasmids('artificer')){
                return true;
            }
            return false;
        }
    },
    detail_oriented: {
        id: 'genes-detail_oriented',
        title: 'Detail Oriented',
        desc: 'Auto crafting produces 33% more product',
        reqs: { crafty: 1 },
        grant: ['crafty',2],
        cost: 90,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>90</span></div>',
        action(){
            if (payPlasmids('detail_oriented')){
                return true;
            }
            return false;
        }
    },
    rigorous: {
        id: 'genes-rigorous',
        title: 'Rigorous',
        desc: 'Auto crafting produces 66% more product',
        reqs: { crafty: 2 },
        grant: ['crafty',3],
        cost: 135,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>135</span></div>',
        action(){
            if (payPlasmids('rigorous')){
                return true;
            }
            return false;
        }
    },
    hardened_genes: {
        id: 'genes-hardened_genes',
        title: 'Hardened Genes',
        desc: 'Unlocks challenge traits',
        reqs: {},
        grant: ['challenge',1],
        cost: 5,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>5</span></div>',
        action(){
            if (payPlasmids('hardened_genes')){
                return true;
            }
            return false;
        }
    },
    unlocked: {
        id: 'genes-unlocked',
        title: 'Unlocked',
        desc: 'Achievements grant a small production bonus',
        reqs: {challenge:1},
        grant: ['challenge',2],
        cost: 50,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>50</span></div>',
        action(){
            if (payPlasmids('unlocked')){
                return true;
            }
            return false;
        }
    },
    transcendence: {
        id: 'genes-transcendence',
        title: 'Transcendence',
        desc: 'Can unlock both fanaticism and anthropology',
        reqs: { creep: 1, birth: 1, store: 1, locked: 1 },
        grant: ['transcendence',1],
        cost: 5000,
        effect: '<div class="cost"><span class="has-text-special">Plasmid</span>: <span>5000</span></div>',
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
            return res === 'Wrought_Iron' ? costMultiplier('monument', 25000, 1.1) : 0;
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
    if (global.race['creative']){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            newCosts[res] = function(){ return Math.round(costs[res]() * 0.98) || 0; }
        });
        return newCosts;
    }
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
                on: false
            };
        }

        let label = global.tech.genetics > 2 ? 'Gene Mutation' : 'Sequence Genome';
        let sequence = $(`<div><b-tooltip class="has-text-warning" :label="seq()" position="is-bottom" size="is-small" multilined animated>${label}</b-tooltip> - To Complete: {{ time | timer }}</div>`);
        genome.append(sequence);
        let progress = $(`<progress class="progress" :value="progress" max="${global.arpa.sequence.max}">{{ progress }}%</progress>`);
        genome.append(progress);
        let b_label = global.tech.genetics > 2 ? 'Mutate' : 'Sequence';
        let button = $(`<button class="button" @click="toggle">${b_label}</button>`);
        genome.append(button);
        if (global.arpa.sequence.on){
            $('#arpaSequence button').addClass('has-text-success');
        }

        vues[`arpaSequence`] = new Vue({
            data: global.arpa.sequence,
            methods: {
                seq(){
                    if (global.tech.genetics > 2){
                        return 'Research beneficial gene mutations. More Bio Labs will make this go faster';
                    }
                    else {
                        return 'Sequence your genome, this will unlock the secrets of DNA. More Bio Labs will make this go faster';
                    }
                },
                toggle(){
                    if (global.arpa.sequence.on){
                        global.arpa.sequence.on = false;
                        $('#arpaSequence button').removeClass('has-text-success');
                    }
                    else {
                        global.arpa.sequence.on = true;
                        $('#arpaSequence button').addClass('has-text-success');
                    }
                },
            },
            filters: {
                timer(val){
                    if (global.city.biolab.on > 0){
                        return (val / global.city.biolab.on).toFixed(0) + 's';
                    }
                    else {
                        return 'Never';
                    }
                }
            }
        });
        vues[`arpaSequence`].$mount(`#arpaSequence`);
    }
    if (global.tech['genetics'] > 2){
        let breakdown = $('<div id="geneticBreakdown"></div>');
        $('#arpaGenetics').append(breakdown);
        breakdown.append(`<div class="trait has-text-success">${races[global.race.species].name} Genetic Traits</div>`)
        
        Object.keys(global.race).forEach(function (trait){
            if (traits[trait]){
                if (global.race[trait]> 1){
                    breakdown.append(`<div class="trait has-text-warning">(${global.race[trait]}) ${traits[trait].desc}</div>`);
                }
                else {
                    breakdown.append(`<div class="trait has-text-warning">${traits[trait].desc}</div>`);
                }
            }
        });
    }
}

function crispr(){
    if (global.tech['genetics'] > 3){
        $('#arpaCrispr').empty();
        $('#arpaCrispr').append('<div class="has-text-warning">Permanently alter your DNA. These upgrades carry over across resets.</div>');
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
        buy.append($(`<button class="button x100" @click="build('${project}',100)">100%</button>`));

        vues[`arpa${project}`] = new Vue({
            data: global.arpa[project],
            methods: {
                build(pro,num){
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
                var cost = $('<div></div>');
                var costs = adjustCosts(arpaProjects[project].cost);
                Object.keys(costs).forEach(function (res) {
                    var res_cost = (costs[res]() * (id / 100)).toFixed(0);
                    if (res_cost > 0){
                        var label = res === 'Money' ? '$' : res+': ';
                        label = label.replace("_", " ");
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
