import { races, genus_traits, traits } from './races.js';

var save = window.localStorage;
var intervals = {};
var global = {
    seed: 1,
    resource: {},
    evolution: {},
    tech: {},
    city: {},
    civic: { free: 0 },
    main_tabs: {
        data: {
            civTabs: 0,
            showEvolve: true,
            showCity: false,
            showResearch: false,
            showCivic: false,
            showMarket: false,
            showGenetics: false,
            showSpace: false,
            animated: true,
            disableReset: false
        }
    },
    stats: {
        start: Date.now()
    },
    event: 200
};
var vues = {};

const resource_values = {
    Food: 1,
    Lumber: 1,
    Stone: 1,
    Copper: 5,
    Iron: 8,
    Cement: 3,
    Steel: 20,
    Titanium: 30,
    Iridium: 40,
    Deuterium: 100
};

const job_desc = {
    farmer: function(){
        var multiplier = (global.tech['hoe'] && global.tech['hoe'] > 0 ? global.tech['hoe'] * (1/3) : 0) + 1;
        var gain = +(global.civic.farmer.impact * multiplier).toFixed(1);
        return 'Farmers create food to feed your population. Each farmer generates '+gain+' food per tick.';
    },
    lumberjack: function(){
        var multiplier = (global.tech['axe'] && global.tech['axe'] > 0 ? (global.tech['axe'] - 1) * 0.25 : 0) + 1;
        var gain = +(global.civic.lumberjack.impact * multiplier).toFixed(1);
        return 'Lumberjacks harvet lumber from the forests. Each lumberjack generates '+gain+' lumber per tick.';
    },
    quarry_worker: function(){
        var multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.25 : 0) + 1;
        var gain = +(global.civic.quarry_worker.impact * multiplier).toFixed(1);
        return 'Quarry Workers mine stone from rock quarries. Each quarry worker generates '+gain+' stone per tick.';
    },
    miner: function(){
        return 'Miners dig up useful minerals from shafts dug deep in the ground. Each miner can generate a variable amount of minerals of various types.';
    },
    cement_worker: function(){
        var cement_multiplier = 1;
        var gain = global.civic.cement_worker.impact * cement_multiplier;
        return 'Cement plant workers turn stone into cement, each worker produces '+gain+' cement and consumes 3 stone per tick.';
    },
    banker: function(){
        var interest = global.civic.banker.impact * 100;
        return 'Bankers manage your banks increasing tax revenue. Each banker increases tax income by '+interest+'% per tax cycle.';
    },
    professor: function(){
        return 'Professors help educate your citizens and contribute to knowledge gain. Each professor generates '+global.civic.professor.impact+' knowledge per tick.';
    }
}

const events = {
    dna_replication: {
        reqs: { 
            race: 'protoplasm',
            resource: 'DNA'
        },
        effect: function(){
            var gain = Math.rand(1,Math.round(global.resource.DNA.max / 3));
            var res = global.resource.DNA.amount + gain;
            if (res > global.resource.DNA.max){ res = global.resource.DNA.max; }
            global.resource.DNA.amount = res;
            return 'Some DNA molecules have replicated, you gain '+gain+' DNA.';
        }
    },
    rna_meteor: {
        reqs: { 
            race: 'protoplasm',
            resource: 'RNA'
        },
        effect: function(){
            var gain = Math.rand(1,Math.round(global.resource.RNA.max / 2));
            var res = global.resource.RNA.amount + gain;
            if (res > global.resource.RNA.max){ res = global.resource.RNA.max; }
            global.resource.RNA.amount = res;
            return 'A meteor has impacted the planet bringing new genetic material with it, gained '+gain+' RNA.';
        }
    },
    inspiration: {
        reqs: { 
            resource: 'Knowledge'
        },
        effect: function(){
            var gain = Math.rand(10,100);
            var res = global.resource.Knowledge.amount + gain;
            if (res > global.resource.Knowledge.max){ res = global.resource.Knowledge.max; }
            global.resource.Knowledge.amount = res;
            return 'Your scientists have become inspired, gain '+gain+' Knowledge.';
        }
    },
    fire: {
        reqs: { 
            resource: 'Lumber'
        },
        effect: function(){
            var loss = Math.rand(1,Math.round(global.resource.Lumber.amount / 4));
            var res = global.resource.Lumber.amount - loss;
            if (res < 0){ res = 0; }
            global.resource.Lumber.amount = res;
            return 'A fire has broken out destroying '+loss+' lumber.';
        }
    }
};

const actions = {
    evolution: {
        rna: {
            id: 'evo-rna',
            title: 'RNA',
            desc: 'Creates new RNA',
            action: function (){
                if(global['resource']['RNA'].amount < global['resource']['RNA'].max){
                    global['resource']['RNA'].amount++;
                }
                return false;
            }
        },
        dna: {
            id: 'evo-dna',
            title: 'Form DNA',
            desc: 'Creates a new strand of DNA',
            cost: { RNA: function(){ return 2; } },
            action: function (){
                if (global['resource']['RNA'].amount >= 2 && global['resource']['DNA'].amount < global['resource']['DNA'].max){
                    global['resource']['DNA'].amount++;
                    global['resource']['RNA'].amount -= 2;
                }
                return false;
            }
        },
        membrane: {
            id: 'evo-membrane',
            title: 'Membrane',
            desc: 'Evolve Membranes',
            cost: { RNA: function(){ return (global.evolution['membrane'].count * 2) + 2; } },
            effect: 'Increases RNA capacity by 5',
            action: function (){
                if (payCosts(actions.evolution.membrane.cost)){
                    global['resource']['RNA'].max += 5;
                    global.evolution['membrane'].count++;
                    return true;
                }
                return false;
            }
        },
        organelles: {
            id: 'evo-organelles',
            title: 'Organelles',
            desc: 'Evolve Organelles',
            cost: { 
                RNA: function(){ return (global.evolution['organelles'].count * 8) + 12; },
                DNA: function(){ return (global.evolution['organelles'].count * 4) + 4; },
            },
            effect: 'Automatically generate RNA',
            action: function (){
                if (payCosts(actions.evolution.organelles.cost)){
                    global.evolution['organelles'].count++;
                    return true;
                }
                return false;
            }
        },
        nucleus: {
            id: 'evo-nucleus',
            title: 'Nucleus',
            desc: 'Evolve Nucleus',
            cost: { 
                RNA: function(){ return (global.evolution['nucleus'].count * 45) + 75; },
                DNA: function(){ return (global.evolution['nucleus'].count * 18) + 30; },
            },
            effect: 'Automatically consume RNA to create DNA',
            action: function (){
                if (payCosts(actions.evolution.nucleus.cost)){
                    global.evolution['nucleus'].count++;
                    return true;
                }
                return false;
            }
        },
        eukaryotic_cell: {
            id: 'evo-eukaryotic_cell',
            title: 'Eukaryotic Cell',
            desc: 'Evolve Eukaryotic Cell',
            cost: { 
                RNA: function(){ return (global.evolution['eukaryotic_cell'].count * 20) + 20; },
                DNA: function(){ return (global.evolution['eukaryotic_cell'].count * 12) + 40; },
            },
            effect: 'Increases DNA capacity by 10',
            action: function (){
                if (payCosts(actions.evolution.eukaryotic_cell.cost)){
                    global.evolution['eukaryotic_cell'].count++;
                    global['resource']['DNA'].max += 10;
                    return true;
                }
                return false;
            }
        },
        mitochondria: {
            id: 'evo-mitochondria',
            title: 'Mitochondria',
            desc: 'Evolve Mitochondria',
            cost: { 
                RNA: function(){ return (global.evolution['mitochondria'].count * 50) + 150; },
                DNA: function(){ return (global.evolution['mitochondria'].count * 35) + 120; },
            },
            effect: 'Increases DNA capacity by 25 and RNA capacity by 50',
            action: function (){
                if (payCosts(actions.evolution.mitochondria.cost)){
                    global.evolution['mitochondria'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 50;
                    return true;
                }
                return false;
            }
        },
        sexual_reproduction: {
            id: 'evo-sexual_reproduction',
            title: 'Sexual Reproduction',
            desc: 'Evolve Sexual Reproduction',
            cost: { 
                DNA: function(){ return 225; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.sexual_reproduction.cost)){
                    global.evolution['sexual_reproduction'].count++;
                    removeAction(actions.evolution.sexual_reproduction.id);
                    
                    var path = Math.floor(Math.seededRandom(0,100));
                    if (path < 84){
                        global.evolution['phagocytosis'] = { count: 0 };
                        addAction('evolution','phagocytosis');
                    }
                    else if (path < 92){
                        global.evolution['chloroplasts'] = { count: 0 };
                        addAction('evolution','chloroplasts');
                    }
                    else {
                        global.evolution['chitin'] = { count: 0 };
                        addAction('evolution','chitin');
                    }
                }
                return false;
            }
        },
        phagocytosis: {
            id: 'evo-phagocytosis',
            title: 'Phagocytosis',
            desc: 'Evolve Phagocytosis',
            cost: { 
                DNA: function(){ return 250; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.phagocytosis.cost)){
                    global.evolution['phagocytosis'].count++;
                    removeAction(actions.evolution.phagocytosis.id);
                    global.evolution['multicellular'] = { count: 0 };
                    addAction('evolution','multicellular');
                }
                return false;
            }
        },
        chloroplasts: {
            id: 'evo-chloroplasts',
            title: 'Chloroplasts',
            desc: 'Evolve Chloroplasts',
            cost: { 
                DNA: function(){ return 250; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.chloroplasts.cost)){
                    global.evolution['chloroplasts'].count++;
                    removeAction(actions.evolution.chloroplasts.id);
                    global.evolution['multicellular'] = { count: 0 };
                    addAction('evolution','multicellular');
                }
                return false;
            }
        },
        chitin: {
            id: 'evo-chitin',
            title: 'Chitin',
            desc: 'Evolve Chitin',
            cost: { 
                DNA: function(){ return 250; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.chitin.cost)){
                    global.evolution['chitin'].count++;
                    removeAction(actions.evolution.chitin.id);
                    global.evolution['multicellular'] = { count: 0 };
                    addAction('evolution','multicellular');
                }
                return false;
            }
        },
        multicellular: {
            id: 'evo-multicellular',
            title: 'Multicellular',
            desc: 'Evolve Multicellular',
            cost: { 
                DNA: function(){ return 275; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.multicellular.cost)){
                    global.evolution['multicellular'].count++;
                    removeAction(actions.evolution.multicellular.id);
                    
                    if (global.evolution['phagocytosis']){
                        global.evolution['bilateral_symmetry'] = { count: 0 };
                        addAction('evolution','bilateral_symmetry');
                    }
                    else if (global.evolution['chloroplasts']){
                        global.evolution['poikilohydric'] = { count: 0 };
                        addAction('evolution','poikilohydric');
                    }
                    else if (global.evolution['chitin']) {
                        global.evolution['spores'] = { count: 0 };
                        addAction('evolution','spores');
                    }
                }
                return false;
            }
        },
        spores: {
            id: 'evo-spores',
            title: 'Spores',
            desc: 'Evolve Spores',
            cost: { 
                DNA: function(){ return 300; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.spores.cost)){
                    global.evolution['spores'].count++;
                    removeAction(actions.evolution.spores.id);
                    global.evolution['bryophyte'] = { count: 0 };
                    addAction('evolution','bryophyte');
                }
                return false;
            }
        },
        poikilohydric: {
            id: 'evo-poikilohydric',
            title: 'Poikilohydric',
            desc: 'Evolve Poikilohydric',
            cost: { 
                DNA: function(){ return 300; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.poikilohydric.cost)){
                    global.evolution['poikilohydric'].count++;
                    removeAction(actions.evolution.poikilohydric.id);
                    global.evolution['bryophyte'] = { count: 0 };
                    addAction('evolution','bryophyte');
                }
                return false;
            }
        },
        bilateral_symmetry: {
            id: 'evo-bilateral_symmetry',
            title: 'Bilateral Symmetry',
            desc: 'Evolve Bilateral Symmetry',
            cost: { 
                DNA: function(){ return 300; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.bilateral_symmetry.cost)){
                    global.evolution['bilateral_symmetry'].count++;
                    removeAction(actions.evolution.bilateral_symmetry.id);
                    
                    var path = Math.floor(Math.seededRandom(0,100));
                    if (path < 14){
                        global.evolution['protostomes'] = { count: 0 };
                        addAction('evolution','protostomes');
                    }
                    else {
                        global.evolution['deuterostome'] = { count: 0 };
                        addAction('evolution','deuterostome');
                    }
                }
                return false;
            }
        },
        bryophyte: {
            id: 'evo-bryophyte',
            title: 'Bryophyte',
            desc: 'Evolve Bryophyte',
            cost: { 
                DNA: function(){ return 330; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.bryophyte.cost)){
                    global.evolution['bryophyte'].count++;
                    removeAction(actions.evolution.bryophyte.id);
                    
                    if (global.evolution['spores']){
                        global.evolution['vascular'] = { count: 0 };
                        addAction('evolution','vascular');
                    }
                    else {
                        var path = Math.floor(Math.seededRandom(0,100));
                        if (path < 50){
                            global.evolution['vascular'] = { count: 0 };
                            addAction('evolution','vascular');
                        }
                        else {
                            global.evolution['homoiohydric'] = { count: 0 };
                            addAction('evolution','homoiohydric');
                        }
                    }
                }
                return false;
            }
        },
        protostomes: {
            id: 'evo-protostomes',
            title: 'Protostomes',
            desc: 'Evolve Protostomes',
            cost: { 
                DNA: function(){ return 330; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.protostomes.cost)){
                    global.evolution['protostomes'].count++;
                    removeAction(actions.evolution.protostomes.id);
                    global.evolution['athropods'] = { count: 0 };
                    addAction('evolution','athropods');
                }
                return false;
            }
        },
        deuterostome: {
            id: 'evo-deuterostome',
            title: 'Deuterostome',
            desc: 'Evolve Deuterostome',
            cost: { 
                DNA: function(){ return 330; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.deuterostome.cost)){
                    global.evolution['deuterostome'].count++;
                    removeAction(actions.evolution.deuterostome.id);
                    
                    var path = Math.floor(Math.seededRandom(0,100));
                    if (path < 67){
                        global.evolution['mammals'] = { count: 0 };
                        addAction('evolution','mammals');
                    }
                    else {
                        global.evolution['eggshell'] = { count: 0 };
                        addAction('evolution','eggshell');
                    }
                }
                return false;
            }
        },
        vascular: {
            id: 'evo-vascular',
            title: 'Vascular',
            desc: 'Evolve Vascular',
            cost: { 
                DNA: function(){ return 360; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.vascular.cost)){
                    global.evolution['vascular'].count++;
                    removeAction(actions.evolution.vascular.id);
                    global.evolution['sentience'] = { count: 0 };
                    addAction('evolution','sentience');
                }
                return false;
            }
        },
        homoiohydric: {
            id: 'evo-homoiohydric',
            title: 'Homoiohydric',
            desc: 'Evolve Homoiohydric',
            cost: { 
                DNA: function(){ return 360; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.homoiohydric.cost)){
                    global.evolution['homoiohydric'].count++;
                    removeAction(actions.evolution.homoiohydric.id);
                    global.evolution['sentience'] = { count: 0 };
                    addAction('evolution','sentience');
                }
                return false;
            }
        },
        athropods: {
            id: 'evo-athropods',
            title: 'Athropods',
            desc: 'Evolve Athropods',
            cost: { 
                DNA: function(){ return 360; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.athropods.cost)){
                    global.evolution['athropods'].count++;
                    removeAction(actions.evolution.athropods.id);
                    global.evolution['sentience'] = { count: 0 };
                    addAction('evolution','sentience');
                }
                return false;
            }
        },
        mammals: {
            id: 'evo-mammals',
            title: 'Mammals',
            desc: 'Evolve Mammals',
            cost: { 
                DNA: function(){ return 360; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.mammals.cost)){
                    global.evolution['mammals'].count++;
                    removeAction(actions.evolution.mammals.id);
                    global.evolution['sentience'] = { count: 0 };
                    addAction('evolution','sentience');
                }
                return false;
            }
        },
        eggshell: {
            id: 'evo-eggshell',
            title: 'Eggshell',
            desc: 'Evolve Eggshell',
            cost: { 
                DNA: function(){ return 360; },
            },
            effect: 'Unlocks the next step in evolution',
            action: function (){
                if (payCosts(actions.evolution.eggshell.cost)){
                    global.evolution['eggshell'].count++;
                    removeAction(actions.evolution.eggshell.id);
                    global.evolution['sentience'] = { count: 0 };
                    addAction('evolution','sentience');
                }
                return false;
            }
        },
        sentience: {
            id: 'evo-sentience',
            title: 'Sentience',
            desc: 'Evolve Sentience',
            cost: { 
                DNA: function(){ return 400; },
            },
            effect: 'Evolve into a species which has achieved sentience',
            action: function (){
                if (payCosts(actions.evolution.sentience.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    
                    // Trigger Next Phase of game
                    var path = Math.floor(Math.seededRandom(0,100));
                    if (global.evolution['mammals']){
                        if (path < 8){
                            global.race.species = 'cath';
                        }
                        else if (path < 16){
                            global.race.species = 'wolven';
                        }
                        else if (path < 24){
                            global.race.species = 'centaur';
                        }
                        else if (path < 32){
                            global.race.species = 'kobold';
                        }
                        else if (path < 40){
                            global.race.species = 'goblin';
                        }
                        else if (path < 48){
                            global.race.species = 'gnome';
                        }
                        else if (path < 56){
                            global.race.species = 'troll';
                        }
                        else if (path < 64){
                            global.race.species = 'orge';
                        }
                        else if (path < 72){
                            global.race.species = 'cyclops';
                        }
                        else if (path < 81){
                            global.race.species = 'elven';
                        }
                        else if (path < 90){
                            global.race.species = 'orc';
                        }
                        else {
                            global.race.species = 'human';
                        }
                    }
                    else if (global.evolution['eggshell']){
                        if (path < 17){
                            global.race.species = 'tortollan';
                        }
                        else if (path < 34){
                            global.race.species = 'gecko';
                        }
                        else if (path < 50){
                            global.race.species = 'sethrak';
                        }
                        else if (path < 67){
                            global.race.species = 'arrakoa';
                        }
                        else if (path < 84){
                            global.race.species = 'pterodacti';
                        }
                        else {
                            global.race.species = 'dracnid';
                        }
                    }
                    else if (global.evolution['chitin']){
                        if (path < 50){
                            global.race.species = 'sporgar';
                        }
                        else {
                            global.race.species = 'shroomi';
                        }
                    }
                    else if (global.evolution['athropods']){
                        if (path < 33){
                            global.race.species = 'mantis';
                        }
                        else if (path < 67){
                            global.race.species = 'scorpid';
                        }
                        else {
                            global.race.species = 'antid';
                        }
                    }
                    else if (global.evolution['chloroplasts'] && global.evolution['vascular']){
                        global.race.species = 'entish';
                    }
                    else if (global.evolution['chloroplasts'] && global.evolution['homoiohydric']){
                        global.race.species = 'cacti';
                    }
                    
                    global.resource.RNA.display = false;
                    global.resource.DNA.display = false;
                    
                    var evolve_actions = ['rna','dna','membrane','organelles','nucleus','eukaryotic_cell','mitochondria'];
                    for (var i = 0; i < evolve_actions.length; i++) {
                        if (global.race[evolve_actions[i]]){
                            $('#'+actions.evolution[evolve_actions[i]].id).remove();
                            $('#pop'+actions.evolution[evolve_actions[i]].id).remove();
                        }
                    }
                    
                    Object.keys(genus_traits[races[global.race.species].type]).forEach(function (trait) {
                        global.race[trait] = genus_traits[races[global.race.species].type][trait];
                    });
                    Object.keys(races[global.race.species].traits).forEach(function (trait) {
                        global.race[trait] = races[global.race.species].traits[trait];
                    });
                    
                    defineResources();
                    global.resource.Knowledge.display = true;
                    global.resource.Food.display = true;
                    if (!global.race['kindling_kindred']){
                        global.resource.Lumber.display = true;
                    }
                    global.resource.Stone.display = true;
                    
                    global['city'] = { food: 1, lumber: 1, stone: 1 };
                    
                    var city_actions = global.race['kindling_kindred'] ? ['food','stone'] : ['food','lumber','stone'];
                    for (var i = 0; i < city_actions.length; i++) {
                        if (global.city[city_actions[i]]){
                            addAction('city',city_actions[i]);
                        }
                    }
                    
                    global.main_tabs.data.civTabs = 1;
                    global.main_tabs.data.showEvolve = false;
                    global.main_tabs.data.showCity = true;
                    
                    registerTech('agriculture');
                    registerTech('housing');
                    registerTech('storage');
                    
                    if (global.race.gods !== 'none'){
                        global.tech['religion'] = 1;
                    }
                    
                    if (global.race['slow'] || global.race['hyper']){
                        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                        window.location.reload();
                    }
                }
                return false;
            }
        }
    },
    city: {
        food: {
            id: 'city-food',
            title: 'Gather Food',
            desc: 'Harvest and preserve food.',
            reqs: {},
            action: function (){
                if(global['resource']['Food'].amount < global['resource']['Food'].max){
                    global['resource']['Food'].amount += global.race['strong'] ? global.race['strong'] + 1 : 1;
                }
                return false;
            }
        },
        lumber: {
            id: 'city-lumber',
            title: 'Gather Lumber',
            desc: 'Harvest lumber from the forest',
            reqs: {},
            action: function (){
                if(global['resource']['Lumber'].amount < global['resource']['Lumber'].max){
                    global['resource']['Lumber'].amount += global.race['strong'] ? global.race['strong'] + 1 : 1;
                }
                return false;
            }
        },
        stone: {
            id: 'city-stone',
            title: 'Gather Stone',
            desc: 'Gather stone from a quarry',
            reqs: {},
            action: function (){
                if(global['resource']['Stone'].amount < global['resource']['Stone'].max){
                    global['resource']['Stone'].amount += global.race['strong'] ? global.race['strong'] + 1 : 1;
                }
                return false;
            }
        },
        basic_housing: {
            id: 'city-house',
            title: 'Cabin',
            desc: 'Construct a cabin',
            reqs: { housing: 1 },
            cost: { 
                Money: function(){ 
                    if (global.city['basic_housing'] && global.city['basic_housing'].count >= 5){ 
                        return costMultiplier('basic_housing', 20, 1.15);
                    } 
                    else { 
                        return 0; 
                    } 
                },
                Lumber: function(){ return costMultiplier('basic_housing', 10, 1.28); },
                Stone: function(){ 
                    if (global.city['basic_housing'] && global.city['basic_housing'].count >= 25){ 
                        return costMultiplier('basic_housing', 7, 1.28);
                    } 
                    else { 
                        return costMultiplier('basic_housing', 8, 1.28); 
                    }
                },
                Cement: function(){ 
                    if (global.city['basic_housing'] && global.city['basic_housing'].count >= 25){ 
                        return costMultiplier('basic_housing', 2, 1.2);
                    } 
                    else { 
                        return 0; 
                    } 
                }
            },
            effect: 'Constructs housing for one citizen',
            action: function (){
                if (payCosts(actions.city.basic_housing.cost)){
                    global['resource'][races[global.race.species].name].display = true;
                    global['resource'][races[global.race.species].name].max += 1;
                    global.city['basic_housing'].count++;
                    global.main_tabs.data.showCivic = true;
                    return true;
                }
                return false;
            }
        },
        cottage: {
            id: 'city-cottage',
            title: 'Cottage',
            desc: 'Construct a cottage',
            reqs: { housing: 2 },
            cost: { 
                Money: function(){ return costMultiplier('cottage', 900, 1.15); },
                Lumber: function(){ return costMultiplier('cottage', 220, 1.3); },
                Iron: function(){ return costMultiplier('cottage', 105, 1.3); },
                Cement: function(){ return costMultiplier('cottage', 135, 1.3); }
            },
            effect: 'Constructs housing for 2 citizens',
            action: function (){
                if (payCosts(actions.city.cottage.cost)){
                    global['resource'][races[global.race.species].name].max += 2;
                    global.city['cottage'].count++;
                    return true;
                }
                return false;
            }
        },
        apartments: {
            id: 'city-apartments',
            title: 'Apartmnet',
            desc: 'Construct an apartmnet building',
            reqs: { housing: 3 },
            cost: { 
                Money: function(){ return costMultiplier('apartments', 250, 1.15); },
                Lumber: function(){ return costMultiplier('apartments', 100, 1.3); },
                Iron: function(){ return costMultiplier('apartments', 30, 1.3); },
                Cement: function(){ return costMultiplier('apartments', 50, 1.3); }
            },
            effect: 'Constructs housing for 5 citizens',
            action: function (){
                if (payCosts(actions.city.apartments.cost)){
                    global['resource'][races[global.race.species].name].max += 5;
                    global.city['apartments'].count++;
                    return true;
                }
                return false;
            }
        },
        farm: {
            id: 'city-farm',
            title: 'Farm',
            desc: 'Build a farm',
            reqs: { agriculture: 1 },
            cost: { 
                Money: function(){ if (global.city['farm'] && global.city['farm'].count >= 2){ return costMultiplier('farm', 50, 1.30);} else { return 0; } },
                Lumber: function(){ return costMultiplier('farm', 20, 1.35); },
                Stone: function(){ return costMultiplier('farm', 10, 1.35); }
            },
            effect: 'Increases farmer capacity by one',
            action: function (){
                if (payCosts(actions.city.farm.cost)){
                    global.city['farm'].count++;
                    global.civic.farmer.display = true;
                    global.civic.farmer.max++;
                    return true;
                }
                return false;
            }
        },
        silo: {
            id: 'city-silo',
            title: 'Grain Silo',
            desc: 'Build a grain silo',
            reqs: { agriculture: 2 },
            cost: { 
                Money: function(){ return costMultiplier('silo', 500, 1.30); },
                Lumber: function(){ return costMultiplier('silo', 150, 1.35); },
                Cement: function(){ return costMultiplier('silo', 50, 1.35); }
            },
            effect: 'Increases food storage capacity by 250',
            action: function (){
                if (payCosts(actions.city.silo.cost)){
                    global.city['silo'].count++;
                    global['resource']['Food'].max += 250;
                    return true;
                }
                return false;
            }
        },
        mill: {
            id: 'city-mill',
            title: 'Mill',
            desc: 'Build a mill',
            reqs: { agriculture: 3 },
            cost: { 
                Money: function(){ return costMultiplier('mill', 500, 1.2); },
                Lumber: function(){ return costMultiplier('mill', 250, 1.35); },
                Stone: function(){ return costMultiplier('mill', 50, 1.35); }
            },
            effect: 'Increases the efficency of farmers by 10%',
            action: function (){
                if (payCosts(actions.city.mill.cost)){
                    global.city['mill'].count++;
                    return true;
                }
                return false;
            }
        },
        shed: {
            id: 'city-shed',
            title: 'Shed',
            desc: 'Construct a shed',
            reqs: { storage: 1 },
            cost: { 
                Money: function(){ return costMultiplier('shed', 75, 1.2); },
                Lumber: function(){ return costMultiplier('shed', 60, 1.35); },
                Stone: function(){
                    if (global.tech['storage'] && global.tech['storage'] === 1){ 
                        return costMultiplier('shed', 40, 1.35);
                    }
                    else { 
                        return 0; 
                    }
                },
                Iron: function(){
                    if (global.tech['storage'] && global.tech['storage'] >= 2){
                        return costMultiplier('shed', 22, 1.3);
                    }
                    else {
                        return 0; 
                    }
                },
                Cement: function(){ 
                    if (global.tech['storage'] && global.tech['storage'] >= 2){
                        return costMultiplier('shed', 18, 1.3);
                    }
                    else {
                        return 0; 
                    }
                }
            },
            effect: 'A small storage facility which increases your storage capacity of various resources',
            action: function (){
                if (payCosts(actions.city.shed.cost)){
                    var multiplier = (global.tech['storage'] - 1) * 0.5 + 1;
                    global['resource']['Lumber'].max += (250 * multiplier);
                    global['resource']['Stone'].max += (250 * multiplier);
                    global['resource']['Copper'].max += (100 * multiplier);
                    global['resource']['Iron'].max += (100 * multiplier);
                    global['resource']['Cement'].max += (100 * multiplier);
                    global.city['shed'].count++;
                    return true;
                }
                return false;
            }
        },
        rock_quarry: {
            id: 'city-rock_quarry',
            title: 'Rock Quarry',
            desc: 'Build a stone quarry',
            reqs: { mining: 1 },
            cost: { 
                Money: function(){ if (global.city['rock_quarry'] && global.city['rock_quarry'].count >= 2){ return costMultiplier('rock_quarry', 20, 1.75);} else { return 0; } },
                Lumber: function(){ return costMultiplier('rock_quarry', 50, 1.35); },
                Stone: function(){ return costMultiplier('rock_quarry', 10, 1.35); }
            },
            effect: 'Allows workers to quarry for stone',
            action: function (){
                if (payCosts(actions.city.rock_quarry.cost)){
                    global.city['rock_quarry'].count++;
                    global.civic.quarry_worker.display = true;
                    global.civic.quarry_worker.max = global.city.rock_quarry.count;
                    return true;
                }
                return false;
            }
        },
        mine: {
            id: 'city-mine',
            title: 'Mine',
            desc: 'Build a mine',
            reqs: { mining: 2 },
            cost: { 
                Money: function(){ return costMultiplier('mine', 60, 1.6); },
                Lumber: function(){ return costMultiplier('mine', 175, 1.35); }
            },
            effect: 'Builds a mine shaft allowing miners to mine minerals from the ground.',
            action: function (){
                if (payCosts(actions.city.mine.cost)){
                    global.city['mine'].count++;
                    global.resource.Copper.display = true;
                    global.civic.miner.display = true;
                    global.civic.miner.max = global.city.mine.count;
                    return true;
                }
                return false;
            }
        },
        temple: {
            id: 'city-temple',
            title: 'Temple',
            desc: 'Build a temple',
            reqs: { religion: 1 },
            cost: { 
                Lumber: function(){ return costMultiplier('temple', 50, 1.35); },
                Stone: function(){ return costMultiplier('temple', 10, 1.35); }
            },
            effect: 'Construct a temple devoted to your race\'s deities',
            action: function (){
                if (payCosts(actions.city.temple.cost)){
                    global.city['temple'].count++;
                    return true;
                }
                return false;
            }
        },
        bank: {
            id: 'city-bank',
            title: 'Bank',
            desc: 'Build a bank',
            reqs: { banking: 1 },
            cost: { 
                Money: function(){ return costMultiplier('bank', 250, 1.5); },
                Lumber: function(){ return costMultiplier('bank', 75, 1.30); },
                Stone: function(){ return costMultiplier('bank', 100, 1.45); }
            },
            effect: function (){ return global.tech['banking'] >= 3 ? 'Increases money capacity by $2500' : 'Increases money capacity by $1000'; },
            action: function (){
                if (payCosts(actions.city.bank.cost)){
                    global['resource']['Money'].max += 1000;
                    global.city.bank.count++;
                    global.civic.banker.max = global.city.bank.count;
                    return true;
                }
                return false;
            }
        },
        university: {
            id: 'city-university',
            title: 'University',
            desc: 'Construct a university',
            reqs: { science: 1 },
            cost: { 
                Money: function(){ return costMultiplier('university', 1000, 1.5); },
                Lumber: function(){ return costMultiplier('university', 500, 1.35); },
                Stone: function(){ return costMultiplier('university', 750, 1.35); }
            },
            effect: 'Contributes to the advancement of science',
            action: function (){
                if (payCosts(actions.city.university.cost)){
                    global['resource']['Knowledge'].max += 500;
                    global.city.university.count++;
                    global.civic.professor.display = true;
                    global.civic.professor.max = global.city.university.count;
                    return true;
                }
                return false;
            }
        },
        library: {
            id: 'city-library',
            title: 'Library',
            desc: 'Construct a library',
            reqs: { science: 2 },
            cost: { 
                Money: function(){ return costMultiplier('library', 45, 1.2); },
                Lumber: function(){ return costMultiplier('library', 35, 1.20); },
                Cement: function(){ return costMultiplier('library', 20, 1.20); }
            },
            effect: 'Increases knowledge capacity by 125',
            action: function (){
                if (payCosts(actions.city.library.cost)){
                    global['resource']['Knowledge'].max += 125;
                    global.city.library.count++;
                    return true;
                }
                return false;
            }
        },
        cement_plant: {
            id: 'city-cement_plant',
            title: 'Cement Factory',
            desc: 'Construct a Cement Factory',
            reqs: { cement: 1 },
            cost: { 
                Money: function(){ return costMultiplier('cement_plant', 3000, 1.5); },
                Lumber: function(){ return costMultiplier('cement_plant', 1800, 1.35); },
                Stone: function(){ return costMultiplier('cement_plant', 2000, 1.3); }
            },
            effect: 'Cement plants turn stone into cement, each plant can support 3 workers.',
            action: function (){
                if (payCosts(actions.city.cement_plant.cost)){
                    global.resource.Cement.display = true;
                    global.city.cement_plant.count++;
                    global.civic.cement_worker.display = true;
                    global.civic.cement_worker.max = global.city.cement_plant.count * 3;
                    return true;
                }
                return false;
            }
        }
    },
    tech: {
        housing: {
            id: 'tech-housing',
            title: 'Housing',
            desc: 'Discover Housing',
            reqs: {},
            grant: ['housing',1],
            cost: { 
                Knowledge: function(){ return 10; }
            },
            effect: 'Learn to construct basic housing for your citizens',
            action: function (){
                if (payCosts(actions.tech.housing.cost)){
                    global.city['basic_housing'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        cottage: {
            id: 'tech-cottage',
            title: 'Cottages',
            desc: 'Design a newer housing unit',
            reqs: { housing: 1, cement: 1, mining: 3 },
            grant: ['housing',2],
            cost: { 
                Knowledge: function(){ return 4000; }
            },
            effect: 'Learn to construct more comfortable housing for couples',
            action: function (){
                if (payCosts(actions.tech.cottage.cost)){
                    global.city['cottage'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        agriculture: {
            id: 'tech-agriculture',
            title: 'Agriculture',
            desc: 'Discover the basics of agriculture',
            reqs: {},
            grant: ['agriculture',1],
            cost: { 
                Knowledge: function(){ return 10; }
            },
            effect: 'Learn to plant crops and harvest them for food',
            action: function (){
                if (payCosts(actions.tech.agriculture.cost)){
                    global.city['farm'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        aphrodisiac: {
            id: 'tech-aphrodisiac',
            title: 'Aphrodisiac',
            desc: 'Study population grown and how to enhance it',
            reqs: { housing: 2 },
            grant: ['reproduction',1],
            cost: { 
                Knowledge: function(){ return 5000; }
            },
            effect: 'Develop a substance that aids with population growth.',
            action: function (){
                if (payCosts(actions.tech.aphrodisiac.cost)){
                    return true;
                }
                return false;
            }
        },
        silo: {
            id: 'tech-silo',
            title: 'Grain Silo',
            desc: 'Devise a structure to house grain',
            reqs: { agriculture: 1, storage: 1, cement: 1 },
            grant: ['agriculture',2],
            cost: { 
                Knowledge: function(){ return 1250; }
            },
            effect: 'Creates plans for a storage medium for food.',
            action: function (){
                if (payCosts(actions.tech.agriculture.cost)){
                    global.city['silo'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        mining: {
            id: 'tech-mining',
            title: 'Mining',
            desc: 'Learn the basics of mining',
            reqs: {},
            grant: ['mining',1],
            cost: { 
                Knowledge: function(){ return 50; }
            },
            effect: 'Learn how to dig up stone slabs from a quarry',
            action: function (){
                if (payCosts(actions.tech.mining.cost)){
                    global.city['rock_quarry'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        metal_working: {
            id: 'tech-metal_working',
            title: 'Metal Working',
            desc: 'Learn the basics of smelting and metalworking',
            reqs: { mining: 1 },
            grant: ['mining',2],
            cost: { 
                Knowledge: function(){ return 500; }
            },
            effect: 'Learn how to mine and refine copper into a pure form',
            action: function (){
                if (payCosts(actions.tech.metal_working.cost)){
                    global.city['mine'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        iron_mining: {
            id: 'tech-iron_mining',
            title: 'Iron Mining',
            desc: 'Learn how to mine iron',
            reqs: { mining: 2 },
            grant: ['mining',3],
            cost: { 
                Knowledge: function(){ return 3000; }
            },
            effect: 'Learn how to extract iron ore from mines',
            action: function (){
                if (payCosts(actions.tech.iron_mining.cost)){
                    global.resource.Iron.display = true;
                    return true;
                }
                return false;
            }
        },
        storage: {
            id: 'tech-storage',
            title: 'Basic Storage',
            desc: 'Design a structure to house resources',
            reqs: {},
            grant: ['storage',1],
            cost: { 
                Knowledge: function(){ return 20; }
            },
            effect: 'Designs a small storage shed.',
            action: function (){
                if (payCosts(actions.tech.storage.cost)){
                    global.city['shed'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        reinforced_shed: {
            id: 'tech-reinforced_shed',
            title: 'Reinforced Sheds',
            desc: 'Upgrade your sheds',
            reqs: { storage: 1, cement: 1 },
            grant: ['storage',2],
            cost: {
                Money: function(){ return 3750; },
                Knowledge: function(){ return 2500; },
                Iron: function(){ return 750; },
                Cement: function(){ return 500; }
            },
            effect: 'Reinforce your sheds with newer materials to increase storage capacity.',
            action: function (){
                if (payCosts(actions.tech.cement.cost)){
                    return true;
                }
                return false;
            }
        },
        currency: {
            id: 'tech-currency',
            title: 'Currency',
            desc: 'Invent the concept of currency',
            reqs: { agriculture: 1 },
            grant: ['currency',1],
            cost: { 
                Knowledge: function(){ return 50; },
                Lumber: function(){ return 10; } 
            },
            effect: 'Unlocks currency, an important step in developing a society. Also creates taxes, not quite as popular with the public.',
            action: function (){
                if (payCosts(actions.tech.currency.cost)){
                    global.resource.Money.display = true;
                    return true;
                }
                return false;
            }
        },
        banking: {
            id: 'tech-banking',
            title: 'Banking',
            desc: 'Invent Banking',
            reqs: { currency: 1 },
            grant: ['banking',1],
            cost: { 
                Knowledge: function(){ return 100; }
            },
            effect: 'Creates the concept of banking, allowing govenment to accumulate massive wealth. Also gives the plebs somewhere to store their money',
            action: function (){
                if (payCosts(actions.tech.banking.cost)){
                    global.city['bank'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        investing: {
            id: 'tech-investing',
            title: 'Investing',
            desc: 'Invent Investing',
            reqs: { banking: 1 },
            grant: ['banking',2],
            cost: { 
                Money: function(){ return 2500; },
                Knowledge: function(){ return 1000; }
            },
            effect: 'Discover the principles of investing, unlocks the banker job.',
            action: function (){
                if (payCosts(actions.tech.investing.cost)){
                    global.civic.banker.display = true;
                    return true;
                }
                return false;
            }
        },
        vault: {
            id: 'tech-vault',
            title: 'Bank Vault',
            desc: 'Concrete Vaults',
            reqs: { banking: 2, cement: 1 },
            grant: ['banking',3],
            cost: { 
                Money: function(){ return 2000; },
                Knowledge: function(){ return 5000; },
                Iron: function(){ return 500; },
                Cement: function(){ return 750; }
            },
            effect: 'Upgrade your banks with vaults made out of concrete, increases $ storage capacity.',
            action: function (){
                if (payCosts(actions.tech.vault.cost)){
                    return true;
                }
                return false;
            }
        },
        science: {
            id: 'tech-science',
            title: 'Scientific Method',
            desc: 'Begin a journey of testing and discovery',
            reqs: { agriculture: 1 },
            grant: ['science',1],
            cost: { 
                Knowledge: function(){ return 100; }
            },
            effect: 'Conceive of the scientific method. This will set your race down a path of science and discovery.',
            action: function (){
                if (payCosts(actions.tech.science.cost)){
                    global.city['university'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        library: {
            id: 'tech-library',
            title: 'Dewey Decimal System',
            desc: 'Oraganize and store all the knowledge of your race',
            reqs: { science: 1, cement: 1 },
            grant: ['science',2],
            cost: { 
                Knowledge: function(){ return 800; }
            },
            effect: 'Create a system for organizing and storing knowledge in large storage buildings designed specifically for books.',
            action: function (){
                if (payCosts(actions.tech.library.cost)){
                    global.city['library'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        cement: {
            id: 'tech-cement',
            title: 'Cement',
            desc: 'Learn how to turn stone into cement',
            reqs: {},
            grant: ['cement',1],
            cost: { 
                Knowledge: function(){ return 1000; }
            },
            effect: 'Learn how to make cement from stone.',
            action: function (){
                if (payCosts(actions.tech.cement.cost)){
                    global.city['cement_plant'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        stone_axe: {
            id: 'tech-stone_axe',
            title: 'Primitive Axes',
            desc: 'Create the first axe',
            reqs: { storage: 1 },
            grant: ['axe',1],
            cost: { 
                Knowledge: function(){ return 50; },
                Lumber: function(){ return 20; },
                Stone: function(){ return 20; }
            },
            effect: 'Creates a primitive axe made from stone lashed to a stick. Enables lumber harvesting.',
            action: function (){
                if (payCosts(actions.tech.stone_axe.cost)){
                    global.civic.lumberjack.display = true;
                    global.civic.lumberjack.max = 10;
                    return true;
                }
                return false;
            }
        },
        copper_axes: {
            id: 'tech-copper_axes',
            title: 'Copper Axe',
            desc: 'Create an axe made from copper',
            reqs: { axe: 1, mining: 2 },
            grant: ['axe',2],
            cost: { 
                Knowledge: function(){ return 750; },
                Copper: function(){ return 25; }
            },
            effect: 'Upgrade axe technology to metal axes made from copper. Improves lumber harvesting.',
            action: function (){
                if (payCosts(actions.tech.copper_axes.cost)){
                    return true;
                }
                return false;
            }
        },
        iron_axes: {
            id: 'tech-iron_axes',
            title: 'Iron Axe',
            desc: 'Create a sturdy axe made from iron',
            reqs: { axe: 2, mining: 3 },
            grant: ['axe',3],
            cost: { 
                Knowledge: function(){ return 3500; },
                Iron: function(){ return 250; }
            },
            effect: 'Upgrade axe technology to metal axes made from iron. Improves lumber harvesting.',
            action: function (){
                if (payCosts(actions.tech.iron_axes.cost)){
                    return true;
                }
                return false;
            }
        },
        copper_pickaxe: {
            id: 'tech-copper_pickaxe',
            title: 'Copper Pickaxe',
            desc: 'Create a pickaxe made from copper',
            reqs: { mining: 2 },
            grant: ['pickaxe',1],
            cost: { 
                Knowledge: function(){ return 750; },
                Copper: function(){ return 25; }
            },
            effect: 'Upgrades pickaxe technology to metal pickaxes made from copper. Improves mining activities.',
            action: function (){
                if (payCosts(actions.tech.copper_pickaxe.cost)){
                    return true;
                }
                return false;
            }
        },
        iron_pickaxe: {
            id: 'tech-iron_pickaxe',
            title: 'Iron Pickaxe',
            desc: 'Create a pickaxe made from iron',
            reqs: { pickaxe: 1, mining: 3 },
            grant: ['pickaxe',2],
            cost: { 
                Knowledge: function(){ return 3500; },
                Iron: function(){ return 250; }
            },
            effect: 'Upgrades pickaxe technology to metal pickaxes made from iron. Improves mining activities.',
            action: function (){
                if (payCosts(actions.tech.iron_pickaxe.cost)){
                    return true;
                }
                return false;
            }
        },
        copper_hoe: {
            id: 'tech-copper_hoe',
            title: 'Copper Hoes',
            desc: 'Create farming tools made from copper',
            reqs: { mining: 2 },
            grant: ['hoe',1],
            cost: { 
                Knowledge: function(){ return 800; },
                Copper: function(){ return 50; }
            },
            effect: 'Create tools made from copper that aid farming. Improves farm efficiency.',
            action: function (){
                if (payCosts(actions.tech.copper_hoe.cost)){
                    return true;
                }
                return false;
            }
        },
        iron_hoe: {
            id: 'tech-iron_hoe',
            title: 'Iron Hoes',
            desc: 'Create farming tools made from copper',
            reqs: { hoe: 1, mining: 3 },
            grant: ['hoe',2],
            cost: { 
                Knowledge: function(){ return 4000; },
                Iron: function(){ return 500; }
            },
            effect: 'Create tools made from iron that aid farming. Improves farm efficiency.',
            action: function (){
                if (payCosts(actions.tech.iron_hoe.cost)){
                    return true;
                }
                return false;
            }
        }
    }
};

Math.rand = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

Math.seed = 2;
Math.seededRandom = function(min, max) {
    max = max || 1;
    min = min || 0;
 
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280;
    global.seed = Math.seed;
    return min + rnd * (max - min);
}

// Main game init
var global_data = save.getItem('evolved') || false;
if (global_data) {
    // Load preexiting game data
    global = JSON.parse(LZString.decompressFromUTF16(global_data));
    Math.seed = global.seed;
}
else {
    newGame();
}

vues['vue_tabs'] = new Vue(global.main_tabs);
vues['vue_tabs'].$mount('#tabs');

// Load Resources
defineResources();
defineJobs();

vues['race'] = new Vue({
    data: global.race,
    methods: {
        name: function(){
            return races[global.race.species].name;
        },
        desc: function(){
            return races[global.race.species].desc;
        }
    }
});
vues['race'].$mount('#race');

if (global.race.species === 'protoplasm'){
    global.resource.RNA.display = true;
    addAction('evolution','rna');
    var evolve_actions = ['dna','membrane','organelles','nucleus','eukaryotic_cell','mitochondria'];
    for (var i = 0; i < evolve_actions.length; i++) {
        if (global.race[evolve_actions[i]]){
            addAction('evolution',evolve_actions[i]);
        }
    }
    if (global.evolution['sexual_reproduction'] && !global.evolution['phagocytosis'] && !global.evolution['chloroplasts'] && !global.evolution['chitin']){
        addAction('evolution','sexual_reproduction');
    }
    else if (global.evolution['phagocytosis'] && global.evolution['phagocytosis'].count == 0){
        addAction('evolution','phagocytosis');
    }
    else if (global.evolution['chloroplasts'] && global.evolution['chloroplasts'].count == 0){
        addAction('evolution','chloroplasts');
    }
    else if (global.evolution['chitin'] && global.evolution['chitin'].count == 0){
        addAction('evolution','chitin');
    }
    else if ((global.evolution['phagocytosis'] || global.evolution['chloroplasts'] || global.evolution['chitin']) && !global.evolution['multicellular']){
        if (global.evolution['phagocytosis']){
            addAction('evolution','phagocytosis');
        }
        else if (global.evolution['chloroplasts']){
            addAction('evolution','chloroplasts');
        }
        else if (global.evolution['chitin']){
            addAction('evolution','chitin');
        }
    }
    else {
        var late_actions = ['multicellular','spores','poikilohydric','bilateral_symmetry','bryophyte','protostomes','deuterostome','vascular','homoiohydric','athropods','mammals','eggshell','sentience'];
        for (var i = 0; i < late_actions.length; i++) {
            if (global.race[late_actions[i]] && global.race[late_actions[i]].count == 0){
                addAction('evolution',late_actions[i]);
            }
        }
    }
}
else {
    Object.keys(actions.city).forEach(function (city) {
        if (checkCityRequirements(city)){
            addAction('city',city);
        }
    });
    Object.keys(actions.tech).forEach(function (tech) {
        if (checkTechRequirements(tech)){
            addAction('tech',tech);
        }
    });
}

// Start game loop
mainLoop();

// Main game loop
function mainLoop() {
    var fed = true;
    var tax_multiplier = 1;
    var main_timer = global.race['slow'] ? 1100 : (global.race['hyper'] ? 950 : 1000);
    intervals['main_loop'] = setInterval(function() {
            
        if (global.race.species === 'protoplasm'){
            // Early Evolution Game
            
            // Gain RNA & DNA
            if (global.evolution['nucleus'] && global['resource']['DNA'].amount < global['resource']['DNA'].max){
                var increment = global.evolution['nucleus'].count;
                while (global['resource']['RNA'].amount < increment * 2){
                    increment--;
                    if (increment <= 0){ break; }
                }
                var count = global['resource']['DNA'].amount + increment;
                if (count > global['resource']['DNA'].max){ count = global['resource']['DNA'].max; }
                global['resource']['DNA'].amount = count;
                global['resource']['RNA'].amount -= increment * 2;
            }
            if (global.evolution['organelles'] && global['resource']['RNA'].amount < global['resource']['RNA'].max){
                var count = global['resource']['RNA'].amount + global.evolution['organelles'].count;
                if (count > global['resource']['RNA'].max){ count = global['resource']['RNA'].max; }
                global['resource']['RNA'].amount = count;
            }
            // Detect new unlocks
            if (global['resource']['RNA'].amount >= 2 && !global.evolution['dna']){
                global.evolution['dna'] = 1;
                addAction('evolution','dna');
                global.resource.DNA.display = true;
            }
            else if (global['resource']['RNA'].amount >= 10 && !global.evolution['membrane']){
                global.evolution['membrane'] = { count: 0 };
                addAction('evolution','membrane');
            }
            else if (global['resource']['DNA'].amount >= 4 && !global.evolution['organelles']){
                global.evolution['organelles'] = { count: 0 };
                addAction('evolution','organelles');
            }
            else if (global.evolution['organelles'] && global.evolution['organelles'].count >= 2 && !global.evolution['nucleus']){
                global.evolution['nucleus'] = { count: 0 };
                addAction('evolution','nucleus');
            }
            else if (global.evolution['nucleus'] && global.evolution['nucleus'].count >= 1 && !global.evolution['eukaryotic_cell']){
                global.evolution['eukaryotic_cell'] = { count: 0 };
                addAction('evolution','eukaryotic_cell');
            }
            else if (global.evolution['eukaryotic_cell'] && global.evolution['eukaryotic_cell'].count >= 1 && !global.evolution['mitochondria']){
                global.evolution['mitochondria'] = { count: 0 };
                addAction('evolution','mitochondria');
            }
            else if (global.evolution['mitochondria'] && global.evolution['mitochondria'].count >= 1 && !global.evolution['sexual_reproduction']){
                global.evolution['sexual_reproduction'] = { count: 0 };
                addAction('evolution','sexual_reproduction');
            }
        }
        else {
            // Rest of game
            
            // Detect labor anomalies
            var total = 0;
            Object.keys(job_desc).forEach(function (job) {
                total += global.civic[job].workers;
                if (total > global.resource[races[global.race.species].name].amount){
                    global.civic[job].workers -= total - global.resource[races[global.race.species].name].amount;
                }
                global.civic.free = global.resource[races[global.race.species].name].amount - total;
            });
            
            // Consumption
            fed = true;
            if (global.resource[races[global.race.species].name].amount >= 1 || global.city['farm']){
                var consume = global.resource[races[global.race.species].name].amount * (global.race['gluttony'] ? ((global.race['gluttony'] * 0.25) + 1) : 1);
                if (global.race['photosynth']){
                    consume /= 2;
                }
                var food_multiplier = (global.tech['hoe'] && global.tech['hoe'] > 0 ? global.tech['hoe'] * (1/3) : 0) + 1;
                food_multiplier *= ((tax_multiplier - 1) / 2) + 1;
                var count = global.resource.Food.amount + (global.civic.farmer.workers * global.civic.farmer.impact * food_multiplier) - consume;
                if (count > global.resource.Food.max){ 
                    count = global.resource.Food.max;
                }
                else if (count < 0){
                    fed = false;
                    count = 0;
                }
                global.resource.Food.amount = count;
            }
            
            // Citizen Growth
            if (fed && global['resource']['Food'].amount > 10 && global['resource'][races[global.race.species].name].max > global['resource'][races[global.race.species].name].amount){
                var lowerBound = global.tech['reproduction'] ? global.tech['reproduction'] : 0;
                if(Math.rand(0,2 * global['resource'][races[global.race.species].name].amount) <= lowerBound){
                    global['resource'][races[global.race.species].name].amount++;
                }
            }
            
            // Resource Income
            if (fed){
                // Knowledge
                var know_multiplier = global.civic.professor.impact * tax_multiplier;
                var count = global.resource.Knowledge.amount + (global.civic.professor.workers * know_multiplier) + 1;
                if (count > global.resource.Knowledge.max){ count = global.resource.Knowledge.max; }
                global.resource.Knowledge.amount = count;
                
                // Cement
                if (global.resource.Cement.display && global.resource.Cement.amount < global.resource.Cement.max){
                    var consume = global.civic.cement_worker.workers * 3;
                    var workDone = global.civic.cement_worker.workers;
                    while (consume > global.resource.Stone.amount && consume > 0){
                        consume -= 3;
                        workDone--;
                    }
                    global.resource.Stone.amount -= consume;
                    var cement_multiplier = 1;
                    cement_multiplier *= tax_multiplier;
                    count = global.resource.Cement.amount + ((workDone * global.civic.cement_worker.impact) * cement_multiplier);
                    if (count > global.resource.Cement.max){ count = global.resource.Cement.max; }
                    global.resource.Cement.amount = count;
                }
                
                // Lumber
                var lum_multiplier = (global.tech['axe'] && global.tech['axe'] > 0 ? (global.tech['axe'] - 1) * 0.25 : 0) + 1;
                lum_multiplier *= tax_multiplier;
                count = global.resource.Lumber.amount + (global.civic.lumberjack.workers * global.civic.lumberjack.impact * lum_multiplier);
                if (count > global.resource.Lumber.max){ count = global.resource.Lumber.max; }
                global.resource.Lumber.amount = count;
                
                // Stone
                var stone_multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.25 : 0) + 1;
                stone_multiplier *= tax_multiplier;
                count = global.resource.Stone.amount + (global.civic.quarry_worker.workers * global.civic.quarry_worker.impact * stone_multiplier);
                if (count > global.resource.Stone.max){ count = global.resource.Stone.max; }
                global.resource.Stone.amount = count;
                
                // Copper
                var copper_multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.1 : 0) + 1;
                copper_multiplier *= tax_multiplier;
                count = global.resource.Copper.amount + ((global.civic.miner.workers / 5) * copper_multiplier);
                if (count > global.resource.Copper.max){ count = global.resource.Copper.max; }
                global.resource.Copper.amount = count;
                
                // Iron
                if (global.resource.Iron.display){
                    var iron_multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.1 : 0) + 1;
                    iron_multiplier *= tax_multiplier;
                    count = global.resource.Iron.amount + ((global.civic.miner.workers / 3) * iron_multiplier);
                    if (count > global.resource.Iron.max){ count = global.resource.Iron.max; }
                    global.resource.Iron.amount = count;
                }
            }
            
            // Detect new unlocks
            if (!global.main_tabs.data.showResearch && global.resource.Knowledge.amount >= 10){
                global.main_tabs.data.showResearch = true;
            }
        }
        
        // main resource delta tracking
        Object.keys(global.resource).forEach(function (res) {
            if (global['resource'][res].rate === 1){
                diffCalc(res,main_timer);
            }
        });
    }, main_timer);
    
    var mid_timer = global.race['slow'] ? 2200 : (global.race['hyper'] ? 1900 : 2000);
    intervals['mid_loop'] = setInterval(function() {
        if (global.race.species !== 'protoplasm'){
            
            // Resource caps
            var caps = {
                Money: 1000,
                Knowledge: 100,
                Food: 250,
                Lumber: 250,
                Stone: 250,
                Copper: 100,
                Iron: 100,
                Cement: 100
            };
            // labor caps
            var lCaps = {
                farmer: 0,
                lumberjack: 10,
                quarry_worker: 0,
                miner: 0,
                cement_worker: 0,
                banker: 0,
                professor: 0
            };
            caps[races[global.race.species].name] = 0;
            if (global.city['farm']){
                lCaps['farmer'] += global.city['farm'].count;
            }
            if (global.city['rock_quarry']){
                lCaps['quarry_worker'] += global.city['rock_quarry'].count;
            }
            if (global.city['mine']){
                lCaps['miner'] += global.city['mine'].count;
            }
            if (global.city['bank']){
                lCaps['banker'] += global.city['bank'].count;
            }
            if (global.city['cement_plant']){
                lCaps['cement_worker'] += global.city['cement_plant'].count * 3;
            }
            if (global.city['basic_housing']){
                caps[races[global.race.species].name] += global.city['basic_housing'].count;
            }
            if (global.city['cottage']){
                caps[races[global.race.species].name] += global.city['cottage'].count * 2;
            }
            if (global.city['apartments']){
                caps[races[global.race.species].name] += global.city['apartments'].count * 5;
            }
            if (global.city['shed']){
                var multiplier = (global.tech['storage'] - 1) * 0.5 + 1;
                caps['Lumber'] += (global.city['shed'].count * (250 * multiplier));
                caps['Stone'] += (global.city['shed'].count * (250 * multiplier));
                caps['Copper'] += (global.city['shed'].count * (100 * multiplier));
                caps['Iron'] += (global.city['shed'].count * (100 * multiplier));
                caps['Cement'] += (global.city['shed'].count * (100 * multiplier));
            }
            if (global.city['silo']){
                caps['Food'] += (global.city['silo'].count * 250);
            }
            if (global.city['university']){
                caps['Knowledge'] += (global.city['university'].count * 500);
                lCaps['professor'] += global.city['university'].count;
            }
            if (global.city['library']){
                caps['Knowledge'] += (global.city['library'].count * 125);
            }
            if (global.city['bank']){
                caps['Money'] += (global.city['bank'].count * (global.tech['banking'] >= 3 ? 2500 : 1000));
            }
            
            Object.keys(caps).forEach(function (res){
                global.resource[res].max = caps[res];
                if (global.resource[res].amount > global.resource[res].max){
                    global.resource[res].amount = global.resource[res].max;
                }
            });
            
            Object.keys(lCaps).forEach(function (job){
                global.civic[job].max = lCaps[job];
                if (global.civic[job].workers > global.civic[job].max){
                    global.civic[job].workers = global.civic[job].max;
                }
            });
            
            // medium resource delta tracking
            Object.keys(global.resource).forEach(function (res) {
                if (global['resource'][res].rate === 2){
                    diffCalc(res,mid_timer);
                }
            });
        }
    }, mid_timer);
    
    var long_timer = global.race['slow'] ? 5500 : (global.race['hyper'] ? 4750 : 5000);
    intervals['long_loop'] = setInterval(function() {
            
        if (global.race.species !== 'protoplasm'){
            // Tax Income
            if (global.tech['currency'] >= 1){
                var income = (global.resource[races[global.race.species].name].amount - global.civic.free) * ( global.race['greedy'] ? 1 : 2 );
                if (fed){
                    if (global.tech['banking'] && global.tech['banking'] >= 2){
                        income *= 1 + (global.civic.banker.workers * global.civic.banker.impact);
                    }
                }
                else {
                    income = income / 2;
                }
                var count = global.resource.Money.amount + Math.round(income);
                if (count > global.resource.Money.max){ count = global.resource.Money.max; }
                global.resource.Money.amount = count;
            }
        }
        
        // Event triggered
        if (Math.rand(0,global.event) === 0){
            var event_pool = [];
            Object.keys(events).forEach(function (event) {
                var isOk = true;
                Object.keys(events[event].reqs).forEach(function (req) {
                    switch(req){
                        case 'race':
                            if (events[event].reqs[req] !== global.race.species){
                                isOk = false;
                            }
                            break;
                        case 'resource':
                            if (!global.resource[events[event].reqs[req]] || !global.resource[events[event].reqs[req]].display){
                                isOk = false;
                            }
                            break;
                        case 'tech':
                            if (!global.tech[events[event].reqs[req]]){
                                isOk = false;
                            }
                            break;
                        default:
                            isOk = false;
                            break;
                    }
                });
                if (isOk){
                    event_pool.push(event);
                }
            });
            if (event_pool.length > 0){
                var msg = events[event_pool[Math.floor(Math.seededRandom(0,event_pool.length))]].effect();
                messageQueue(msg);
            }
            global.event = 999;
        }
        else {
            global.event--;
        }
        
        // slow resource delta tracking
        Object.keys(global.resource).forEach(function (res) {
            if (global['resource'][res].rate === 3){
                diffCalc(res,long_timer);
            }
        });
        
        // Save game state
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    }, long_timer);
}

// Sets up resource definitions
function defineResources() {
    if (global.race.species === 'protoplasm'){
        loadResource('RNA',100,1);
        loadResource('DNA',100,1);
    }
    else {
        loadResource('Money',1000,3,'success');
        loadResource(races[global.race.species].name,0,1,'warning');
        loadResource('Knowledge',100,1,'warning');
        loadResource('Food',250,1);
        loadResource('Lumber',250,1);
        loadResource('Stone',250,1);
        loadResource('Copper',100,1);
        loadResource('Iron',100,1);
        loadResource('Cement',100,1);
        //loadResource('Steel',50,1);
        //loadResource('Titanium',50,1);
        //loadResource('Iridium',50,1);
        //loadResource('Deuterium',20,1);
    }
}
// Sets up jobs in civics tab
function defineJobs(){
    loadUnemployed();
    loadJob('farmer','Farmer',3);
    loadJob('lumberjack','Lumberjack',1);
    loadJob('quarry_worker','Quarry Worker',1);
    loadJob('miner','Miner',1);
    loadJob('cement_worker','Cement Plant Worker',0.25);
    loadJob('professor','Professor',0.5);
    loadJob('banker','Banker',0.1);
}

// Load resource function
// This function defines each resource, loads saved values from localStorage
// And it creates Vue binds for various resource values
function loadResource(name,max,rate,color) {
    color = color || 'info';
    if (!global['resource'][name]){
        global['resource'][name] = {
            name: name === 'Money' ? '$' : name,
            display: false,
            value: resource_values[name],
            amount: 0,
            last: 0,
            diff: 0,
            max: max,
            rate: rate
        };
    }
    
    if (global['resource'][name]['max'] > 0){
        var res_container = $('<div id="res-' + name + '" class="resource" v-show="display"><span class="res has-text-' + color + '">{{ name }}</span><span class="count">{{ amount | size }} / {{ max | size }}</span><span class="diff">{{ diff | diffSize }} /s</span></div>');
        $('#resources').append(res_container);
    }
    else {
        var res_container = $('<div id="res-' + name + '" class="resource" v-show="display"><span class="res has-text-' + color + '">{{ name }}</span><span class="count">{{ amount | size }}</span><span class="diff">{{ diff | diffSize }} /s</span></div>');
        $('#resources').append(res_container);
    }
    
    vues['res_'+name] = new Vue({
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
    vues['res_'+name].$mount('#res-' + name);
}

function loadUnemployed(){
    var color = 'warning';
    
    var id = 'civ-free';
    var civ_container = $('<div id="' + id + '" class="job"></div>');
    var job_label = $('<div class="job_label"><span class="has-text-' + color + '">Unemployed</span><span class="count">{{ free }}</span></div>');
    civ_container.append(job_label);
    $('#civic').append(civ_container);
    
    vues['civ_free'] = new Vue({
        data: global.civic,
    });
    vues['civ_free'].$mount('#'+id);
    
    var popper = $('<div id="pop'+id+'" class="popper has-background-light has-text-dark">The number of unemployed citizens. Unemployed citizens do not pay taxes.</div>');
    popper.hide();
    $('#main').append(popper);
    $('#'+id+' .job_label').on('mouseover',function(){
            popper.show();
            new Popper($('#'+id+' .job_label'),popper);
        });
    $('#'+id+' .job_label').on('mouseout',function(){
            popper.hide();
        });
}

function loadJob(job, name, impact, color){
    color = color || 'info';
    if (!global['civic'][job]){
        global['civic'][job] = {
            job: job,
            name: name,
            display: false,
            workers: 0,
            max: 0,
            impact: impact
        };
    }
    
    var id = 'civ-' + job;
    
    var civ_container = $('<div id="' + id + '" v-show="display" class="job"></div>');
    var controls = $('<div class="controls"></div>');
    var job_label = $('<div class="job_label"><span class="has-text-' + color + '">{{ name }}</span><span class="count">{{ workers }} / {{ max }}</span></div>');
    civ_container.append(job_label);
    civ_container.append(controls);
    $('#civic').append(civ_container);
    
    var sub = $('<span class="sub" @click="sub">&laquo;</span>');
    var add = $('<span class="add" @click="add">&raquo;</span>');
    
    controls.append(sub);
    controls.append(add);
    
    vues['civ_'+job] = new Vue({
        data: global.civic[job],
        methods: {
            add(){
                if (global.civic[job].workers < global['civic'][job].max && global.civic.free > 0){
                    global.civic[job].workers++;
                    global.civic.free--;
                }
            },
            sub(){
                if (global.civic[job].workers > 0){
                    global.civic[job].workers--;
                    global.civic.free++;
                }
            }
        }
    });
    vues['civ_'+job].$mount('#'+id);
    
    var popper = $('<div id="pop'+id+'" class="popper has-background-light has-text-dark">'+ job_desc[job]() +'</div>');
    popper.hide();
    $('#main').append(popper);
    $('#'+id+' .job_label').on('mouseover',function(){
            popper.show();
            new Popper($('#'+id+' .job_label'),popper);
        });
    $('#'+id+' .job_label').on('mouseout',function(){
            popper.hide();
        });
}

function sizeApproximation(value,precision){
    if (value <= 9999){
        return +value.toFixed(precision);
    }
    else if (value <= 1000000){
        return +(value / 1000).toFixed(1) + 'K';
    }
    else if (value <= 1000000000){
        return +(value / 1000000).toFixed(1) + 'M';
    }
    else if (value <= 1000000000000){
        return +(value / 1000000000).toFixed(1) + 'G';
    }
    else if (value <= 1000000000000000){
        return +(value / 1000000000000).toFixed(1) + 'T';
    }
    else if (value <= 1000000000000000000){
        return +(value / 1000000000000000).toFixed(1) + 'P';
    }
    else if (value <= 1000000000000000000000){
        return +(value / 1000000000000000000).toFixed(1) + 'E';
    }
    else if (value <= 1000000000000000000000000){
        return +(value / 1000000000000000000000).toFixed(1) + 'Z';
    }
    else {
        return +(value / 1000000000000000000000000).toFixed(1) + 'Y';
    }
}

function checkCityRequirements(action){
    if (global.race['kindling_kindred'] && action === 'lumber'){
        return false;
    }
    var isMet = true;
    Object.keys(actions.city[action].reqs).forEach(function (req) {
        if (!global.tech[req] || global.tech[req] < actions.city[action].reqs[req]){
            isMet = false;
        }
    });
    return isMet;
}

function checkTechRequirements(tech){
    var isMet = true;
    Object.keys(actions.tech[tech].reqs).forEach(function (req) {
        if (!global.tech[req] || global.tech[req] < actions.tech[tech].reqs[req]){
            isMet = false;
        }
    });
    if (isMet && (!global.tech[actions.tech[tech].grant[0]] || global.tech[actions.tech[tech].grant[0]] < actions.tech[tech].grant[1])){
        return true;
    }
    return false;
}

function registerTech(action){
    var tech = actions.tech[action].grant[0];
    if (!global.tech[tech]){
        global.tech[tech] = 0;
    }
    addAction('tech',action);
}

function gainTech(action){
    var tech = actions.tech[action].grant[0];
    global.tech[tech] = actions.tech[action].grant[1];
    
    Object.keys(actions.city).forEach(function (city) {
        removeAction(actions.city[city].id);
        if (checkCityRequirements(city)){
            addAction('city',city);
        }
    });
    Object.keys(actions.tech).forEach(function (tech) {
        removeAction(actions.tech[tech].id);
        if (checkTechRequirements(tech)){
            addAction('tech',tech);
        }
    });
}

function addAction(action,type){
    if (global.race['kindling_kindred'] && action === 'tech' && type === 'stone_axe'){
        return;
    }
    var id = actions[action][type].id;
    var element = $('<a id="'+id+'" class="button is-dark" v-on:click="action">{{ title }}</a>');
    if (action !== 'tech' && global[action][type] && global[action][type].count >= 0){
        element.append($('<span class="count">{{ count }}</span>'));
    }
    $('#'+action).append(element);
    if (action !== 'tech' && global[action][type] && global[action][type].count === 0){
        $('#'+id+' .count').css('display','none');
    }
    vues[id] = new Vue({
        data: {
            title: typeof actions[action][type].title === 'string' ? actions[action][type].title : actions[action][type].title(),
            count: action !== 'tech' && global[action][type] ? global[action][type].count : 0
        },
        methods: {
            action: function(){ 
                if (actions[action][type].action()){
                    if (action === 'tech'){
                        gainTech(type);
                    }
                    else {
                        updateDesc(action,type);
                    }
                }
            }
        },
    });
    vues[id].$mount('#'+id);
    var popper = $('<div id="pop'+id+'" class="popper has-background-light has-text-dark"></div>');
    popper.hide();
    $('#main').append(popper);
    $('#'+id).on('mouseover',function(){
            actionDesc(popper,action,type);
            popper.show();
            new Popper($('#'+id),popper);
        });
    $('#'+id).on('mouseout',function(){
            popper.hide();
        });
}

function actionDesc(parent,action,type){
    parent.empty();
    var desc = typeof actions[action][type].desc === 'string' ? actions[action][type].desc : actions[action][type].desc();
    parent.append($('<div>'+desc+'</div>'));
    if (actions[action][type].cost){ 
        var cost = $('<div></div>');
        var costs = adjustCosts(actions[action][type].cost);
        Object.keys(costs).forEach(function (res) {
            var res_cost = costs[res]();
            if (res_cost > 0){
                var label = res === 'Money' ? '$' : res+': ';
                var color = global.resource[res].amount >= res_cost ? 'has-text-dark' : 'has-text-danger';
                cost.append($('<div class="'+color+'">'+label+res_cost+'</div>'));
            }
        });
        parent.append(cost);
    }
    if (actions[action][type].effect){ 
        var effect = typeof actions[action][type].effect === 'string' ? actions[action][type].effect : actions[action][type].effect();
        parent.append($('<div>'+effect+'</div>')); 
    }
}

function removeAction(id){
    $('#'+id).remove();
    $('#pop'+id).remove();
}

function updateDesc(category,action){
    var id = actions[category][action].id;
    if (category !== 'tech'){
        $('#'+id+' .count').html(global[category][action].count);
        if (global[category][action] && global[category][action].count > 0){
            $('#'+id+' .count').css('display','inline-block');
        }
    }
    actionDesc($('#pop'+id),category,action);
}

function adjustCosts(costs){
    if (global.race['kindling_kindred'] && costs['Lumber']){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res !== 'Lumber'){
                newCosts[res] = function(){ return Math.round(costs[res]() * 1.2) || 0; }
            }
        });
        return newCosts;
    }
    return costs;
}

function payCosts(costs){
    costs = adjustCosts(costs);
    if (checkCosts(costs)){
        Object.keys(costs).forEach(function (res){
            global['resource'][res].amount -= costs[res]();
        });
        return true;
    }
    return false;
}

function checkCosts(costs){
    costs = adjustCosts(costs);
    var test = true;
    Object.keys(costs).forEach(function (res){
        var testCost = Number(costs[res]()) || 0;
        if (testCost > Number(global['resource'][res].amount)) {
            test = false;
            return false;
        }
    });
    return test;
}

function costMultiplier(structure,base,mutiplier){
    if (global.race['small']){ mutiplier -= 0.01; }
    else if (global.race['large']){ mutiplier += 0.01; }
    var count = global.city[structure] ? global.city[structure].count : 0;
    return Math.round((mutiplier ** count) * base);
}

function diffCalc(res,period){
    if (global['resource'][res].amount !== global['resource'][res].max && global['resource'][res].amount !== 0){
        global['resource'][res].diff = +((global['resource'][res].amount - global['resource'][res].last) / (period / 1000)).toFixed(2);
        global['resource'][res].last = global['resource'][res].amount;
    }
    if (global['resource'][res].diff < 0 && !$('#res-'+res+' .diff').hasClass('has-text-danger')){
        $('#res-'+res+' .diff').addClass('has-text-danger');
    }
    else if (global['resource'][res].diff >= 0 && $('#res-'+res+' .diff').hasClass('has-text-danger')){
        $('#res-'+res+' .diff').removeClass('has-text-danger');
    }
}

function messageQueue(msg){
    var new_message = $('<p class="has-text-warning">'+msg+'</p>');
    $('#msgQueue').prepend(new_message);
}

function newGame(){
    global['race'] = { species : 'protoplasm', gods: 'none' };
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;
}

window.exportGame = function exportGame(){
    $('#importExport').val(LZString.compressToBase64(JSON.stringify(global)));
}

window.importGame = function importGame(){
    if ($('#importExport').val().length > 0){
        global = JSON.parse(LZString.decompressFromBase64($('#importExport').val()));
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        window.location.reload();
    }
}

window.cheat = function cheat(){
    global.resource.DNA.max = 10000;
    global.resource.RNA.max = 10000;
    global.resource.DNA.amount = 10000;
    global.resource.RNA.amount = 10000;
}

// executes a hard reset
window.reset = function reset(){
    localStorage.removeItem('evolved');
    global = null;
    window.location.reload();
}
