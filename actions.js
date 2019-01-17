import { global, vues, save, messageQueue, keyMultiplier } from './vars.js';
import { races, genus_traits, traits } from './races.js';
import { defineResources } from './resources.js';

export const actions = {
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
                Lumber: function(){ return costMultiplier('basic_housing', 10, 1.22); },
                Stone: function(){ 
                    if (global.city['basic_housing'] && global.city['basic_housing'].count >= 25){ 
                        return costMultiplier('basic_housing', 7, 1.22);
                    } 
                    else { 
                        return costMultiplier('basic_housing', 8, 1.22); 
                    }
                },
                Cement: function(){ 
                    if (global.city['basic_housing'] && global.city['basic_housing'].count >= 25){ 
                        return costMultiplier('basic_housing', 2, 1.18);
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
                Lumber: function(){ return costMultiplier('cottage', 220, 1.25); },
                Iron: function(){ return costMultiplier('cottage', 105, 1.25); },
                Copper: function(){ return costMultiplier('cottage', 20, 1.25); },
                Cement: function(){ return costMultiplier('cottage', 135, 1.25); }
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
        apartment: {
            id: 'city-apartment',
            title: 'Apartment',
            desc: 'Construct an apartmnet building',
            reqs: { housing: 3 },
            cost: { 
                Money: function(){ return costMultiplier('apartment', 1750, 1.25) - 500; },
                Copper: function(){ return costMultiplier('apartment', 650, 1.30) - 500; },
                Cement: function(){ return costMultiplier('apartment', 700, 1.30) - 500; },
                Steel: function(){ return costMultiplier('apartment', 800, 1.30) - 500; }
            },
            effect: 'Constructs housing for 5 citizens. Each apartment building uses 1kW.',
            powered: 1,
            action: function (){
                if (payCosts(actions.city.apartment.cost)){
                    global['resource'][races[global.race.species].name].max += 5;
                    global.city['apartment'].count++;
                    global.city['apartment'].on++;
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
                Money: function(){ return costMultiplier('mill', 1000, 1.3); },
                Lumber: function(){ return costMultiplier('mill', 600, 1.32); },
                Iron: function(){ return costMultiplier('mill', 150, 1.32); },
                Cement: function(){ return costMultiplier('mill', 125, 1.32); },
            },
            effect: 'Increases farmer efficency by 3%',
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
                Lumber: function(){ return costMultiplier('shed', 60, 1.3); },
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
                    global['resource']['Lumber'].max += (200 * multiplier);
                    global['resource']['Stone'].max += (200 * multiplier);
                    global['resource']['Copper'].max += (75 * multiplier);
                    global['resource']['Iron'].max += (100 * multiplier);
                    global['resource']['Cement'].max += (80 * multiplier);
                    global['resource']['Coal'].max += (50 * multiplier);
                    global.city['shed'].count++;
                    return true;
                }
                return false;
            }
        },
        storage_yard: {
            id: 'city-storage_yard',
            title: 'Freight Yard',
            desc: 'Build a Freight Yard',
            reqs: { container: 1 },
            cost: { 
                Money: function(){ return costMultiplier('storage_yard', 5, 1.85); },
                Iron: function(){ return costMultiplier('storage_yard', 4, 1.8); },
                Cement: function(){ return costMultiplier('storage_yard', 6, 1.9); }
            },
            effect: 'Freight yards are open paved areas with rails used for storing cargo. Each yard increases your crate capacity.',
            action: function (){
                if (payCosts(actions.city.storage_yard.cost)){
                    if (global.resource.Crates.display === false){
                        messageQueue('You have unlocked a new method of resource management, click the + symbol next to a resource to manage it.','success');
                    }
                    global.city['storage_yard'].count++;
                    global.resource.Crates.display = true;
                    global.resource.Crates.max += 50;
                    return true;
                }
                return false;
            }
        },
        warehouse: {
            id: 'city-warehouse',
            title: 'Warehouse',
            desc: 'Build a Warehouse',
            reqs: { steel_container: 1 },
            cost: { 
                Money: function(){ return costMultiplier('warehouse', 400, 1.25); },
                Cement: function(){ return costMultiplier('warehouse', 75, 1.25); },
                Steel: function(){ return costMultiplier('warehouse', 100, 1.25); }
            },
            effect: 'Warehouses are large storage facilities. Each warehouse is capable of storing 50 containters.',
            action: function (){
                if (payCosts(actions.city.warehouse.cost)){
                    if (global.resource.Containers.display === false){
                        messageQueue('You can now construct containers, click the + symbol next to a resource to manage containers.','success');
                    }
                    global.city['warehouse'].count++;
                    global.resource.Containers.display = true;
                    global.resource.Containers.max += 50;
                    return true;
                }
                return false;
            }
        },
        lumber_yard: {
            id: 'city-lumber_yard',
            title: 'Lumber Yard',
            desc: 'Build a lumber yard',
            reqs: { axe: 1 },
            cost: { 
                Money: function(){ if (global.city['lumber_yard'] && global.city['lumber_yard'].count >= 5){ return costMultiplier('lumber_yard', 5, 1.85);} else { return 0; } },
                Lumber: function(){ return costMultiplier('lumber_yard', 6, 1.9); },
                Stone: function(){ return costMultiplier('lumber_yard', 2, 1.95); }
            },
            effect: 'Each lumber yard allows 2 workers to be assigned as lumber jacks and stores some lumber.',
            action: function (){
                if (payCosts(actions.city.lumber_yard.cost)){
                    global.city['lumber_yard'].count++;
                    global.civic.lumberjack.display = true;
                    global.civic.lumberjack.max = global.city.lumber_yard.count * 2;
                    global['resource']['Lumber'].max += 100;
                    return true;
                }
                return false;
            }
        },
        sawmill: {
            id: 'city-sawmill',
            title: 'Sawmill',
            desc: 'Build a sawmill',
            reqs: { saw: 1 },
            cost: { 
                Money: function(){ return costMultiplier('sawmill', 3000, 1.25); },
                Lumber: function(){ return costMultiplier('sawmill', 800, 1.25); },
                Iron: function(){ return costMultiplier('sawmill', 400, 1.25); },
                Cement: function(){ return costMultiplier('sawmill', 420, 1.25); }
            },
            effect: function(){
                let impact = global.tech['saw'] >= 2 ? 8 : 5;
                if (global.city.powered){
                    return `Each sawmill increases the amount of lumber harvested per lumberjack by ${impact}%. Each powered sawmill consumes 1kW but produces 10% more lumber.`; 
                }
                else {
                    return `Each sawmill increases the amount of lumber harvested per lumberjack by ${impact}%`;
                }
            },
            powered: 1,
            action: function (){
                if (payCosts(actions.city.sawmill.cost)){
                    global.city['sawmill'].count++;
                    let impact = global.tech['saw'] >= 2 ? 0.08 : 0.05;
                    global.civic.lumberjack.impact = (global.city['sawmill'].count * impact) + 1;
                    global['resource']['Lumber'].max += 200;
                    if (global.city.powered){
                        global.city['sawmill'].on++;
                    }
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
                Money: function(){ if (global.city['rock_quarry'] && global.city['rock_quarry'].count >= 2){ return costMultiplier('rock_quarry', 20, 1.55);} else { return 0; } },
                Lumber: function(){ return costMultiplier('rock_quarry', 50, 1.35); },
                Stone: function(){ return costMultiplier('rock_quarry', 10, 1.35); }
            },
            effect: 'Allows workers to quarry for stone',
            action: function (){
                if (payCosts(actions.city.rock_quarry.cost)){
                    global.city['rock_quarry'].count++;
                    global.civic.quarry_worker.display = true;
                    global.civic.quarry_worker.max = global.city.rock_quarry.count;
                    global['resource']['Stone'].max += 100;
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
        },
        smelter: {
            id: 'city-smelter',
            title: 'Smelter',
            desc: 'Build a smelter',
            reqs: { smelting: 1 },
            cost: { 
                Money: function(){ return costMultiplier('smelter', 1000, 1.3); },
                Iron: function(){ return costMultiplier('smelter', 500, 1.32); }
            },
            effect: function(){ 
                var iron_yield = global.tech['smelting'] >= 3 ? 12 : 10;
                if (global.resource.Steel.display){
                    return `Smelters can either increase Iron yield by ${iron_yield}% per smelter or produce Steel by consuming Iron and Coal. Smelters require fuel to opperate.`;
                }
                else {
                    return `Smelters increase Iron yield by ${iron_yield}% per smelter but require fuel to opperate.`;
                }
            },
            special: true,
            action: function (){
                if (payCosts(actions.city.smelter.cost)){
                    global.city['smelter'].count++;
                    global.city['smelter'].Wood++;
                    global.city['smelter'].Iron++;
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
        coal_mine: {
            id: 'city-coal_mine',
            title: 'Coal Mine',
            desc: 'Build a Coal mine',
            reqs: { mining: 4 },
            cost: { 
                Money: function(){ return costMultiplier('coal_mine', 480, 1.4); },
                Lumber: function(){ return costMultiplier('coal_mine', 250, 1.35); },
                Iron: function(){ return costMultiplier('coal_mine', 180, 1.35); }
            },
            effect: 'Creates a mine shaft in a coal rich area allowing a coal miner to product coal.',
            action: function (){
                if (payCosts(actions.city.coal_mine.cost)){
                    global.city['coal_mine'].count++;
                    global.resource.Coal.display = true;
                    global.civic.coal_miner.display = true;
                    global.civic.coal_miner.max = global.city.coal_mine.count;
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
            effect: function(){
                let entity = races[global.race.gods].entity;
                return `Construct a temple devoted to your race's deities. Your race believes it was created by a species of ${entity}.`;
            },
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
            effect: function (){ 
                let vault = 1000;
                if (global.tech['banking'] >= 5){
                    vault = 5000;
                }
                else if (global.tech['banking'] >= 3){
                    vault = 2500;
                }
                return `Increases money capacity by \$${vault}`; 
            },
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
                Money: function(){ return costMultiplier('university', 900, 1.5) - 500; },
                Lumber: function(){ return costMultiplier('university', 500, 1.35) - 100; },
                Stone: function(){ return costMultiplier('university', 750, 1.35) - 150; }
            },
            effect: function (){
                let gain = 500;
                if (global.tech['science'] >= 4){
                    gain *= 1 + (global.city['library'].count * 0.02);
                    gain = gain.toFixed(0);
                }
                return `Contributes to the advancement of science. Each university can support one professor and increases knowledge cap by ${gain}.`;
            },
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
            effect: function (){
                let gain = global.race['nearsighted'] ? '110' : '125';
                return `Increases the maximum amount of knowledge you can store by ${gain}`; 
            },
            action: function (){
                if (payCosts(actions.city.library.cost)){
                    global['resource']['Knowledge'].max += global.race['nearsighted'] ? 110 : 125;
                    global.city.library.count++;
                    if (global.tech['science'] && global.tech['science'] >= 3){
                        global.civic.professor.impact = 0.5 + (global.city.library.count * 0.01)
                    }
                    return true;
                }
                return false;
            }
        },
        wardenclyffe: {
            id: 'city-wardenclyffe',
            title: 'Wardenclyffe',
            desc: 'Construct a Wardenclyffe Tower',
            reqs: { high_tech: 1 },
            cost: { 
                Money: function(){ return costMultiplier('wardenclyffe', 5000, 1.2); },
                Knowledge: function(){ return costMultiplier('wardenclyffe', 1000, 1.2); },
                Copper: function(){ return costMultiplier('wardenclyffe', 500, 1.2); },
                Cement: function(){ return costMultiplier('wardenclyffe', 350, 1.2); },
                Steel: function(){ return costMultiplier('wardenclyffe', 900, 1.2); }
            },
            effect: function (){
                let gain = 1000;
                return `Increases the maximum amount of knowledge you can store by ${gain}`; 
            },
            action: function (){
                if (payCosts(actions.city.wardenclyffe.cost)){
                    global['resource']['Knowledge'].max += 1000;
                    global.city.wardenclyffe.count++;
                    global.civic.scientist.display = true;
                    global.civic.scientist.max = global.city.wardenclyffe.count;
                    return true;
                }
                return false;
            }
        },
        coal_power: {
            id: 'city-coal_power',
            title: 'Coal Powerplant',
            desc: 'Construct a Coal Powerplant',
            reqs: { high_tech: 2 },
            cost: { 
                Money: function(){ return costMultiplier('coal_power', 10000, 1.2); },
                Copper: function(){ return costMultiplier('coal_power', 1800, 1.2) - 1000; },
                Cement: function(){ return costMultiplier('coal_power', 600, 1.2); },
                Steel: function(){ return costMultiplier('coal_power', 2000, 1.2) - 1000; }
            },
            effect: function (){
                let consume = 0.3;
                return `A powerplant that runs on coal, generates 5 kW per plant. Consumes ${consume} coal per plant.`; 
            },
            powered: -5,
            action: function (){
                if (payCosts(actions.city.coal_power.cost)){
                    global['resource']['Knowledge'].max += 1000;
                    global.city.coal_power.count++;
                    global.city.coal_power.on++;
                    global.city.power += 5;
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
            effect: 'Learn to construct basic housing for your citizens.',
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
            effect: 'Learn to construct more comfortable housing for couples.',
            action: function (){
                if (payCosts(actions.tech.cottage.cost)){
                    global.city['cottage'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        apartment: {
            id: 'tech-apartment',
            title: 'Apartments',
            desc: 'Apartments',
            reqs: { housing: 2, high_tech: 2 },
            grant: ['housing',3],
            cost: { 
                Knowledge: function(){ return 17500; }
            },
            effect: 'Design high occupancy housing complexes.',
            action: function (){
                if (payCosts(actions.tech.apartment.cost)){
                    global.city['apartment'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        steel_beams: {
            id: 'tech-steel_beams',
            title: 'Steel Beams',
            desc: 'Reduce cost of housing',
            reqs: { housing: 2, smelting: 2 },
            grant: ['housing_reduction',1],
            cost: { 
                Knowledge: function(){ return 12500; },
                Steel: function(){ return 2500; }
            },
            effect: 'Reduce material costs of Cabins and Cottages by introducing strong steel beams.',
            action: function (){
                if (payCosts(actions.tech.steel_beams.cost)){
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
            effect: 'Learn to plant crops and harvest them for food.',
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
        mill: {
            id: 'tech-mill',
            title: 'Grain Mill',
            desc: 'Develope mills to increase food production',
            reqs: { agriculture: 2, mining: 3 },
            grant: ['agriculture',3],
            cost: { 
                Knowledge: function(){ return 6000; }
            },
            effect: 'Creates plans for a grain mill, grain mills boost farm effectiveness.',
            action: function (){
                if (payCosts(actions.tech.mill.cost)){
                    global.city['mill'] = { count: 0 };
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
            effect: 'Learn how to dig up stone slabs from a quarry.',
            action: function (){
                if (payCosts(actions.tech.mining.cost)){
                    global.city['rock_quarry'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        smelting: {
            id: 'tech-smelting',
            title: 'Smelting',
            desc: 'Design smelting facilities to refine ore',
            reqs: { mining: 3 },
            grant: ['smelting',1],
            cost: { 
                Knowledge: function(){ return 4500; }
            },
            effect: 'Learn advanced techniques for smelting ore that will increase yield.',
            action: function (){
                if (payCosts(actions.tech.smelting.cost)){
                    global.city['smelter'] = { 
                        count: 0,
                        Wood: 0,
                        Coal: 0,
                        Oil: 0,
                        Iron: 0,
                        Steel: 0
                    };
                    return true;
                }
                return false;
            }
        },
        steel: {
            id: 'tech-steel',
            title: 'Crucible Steel',
            desc: 'Learn to smelt steel',
            reqs: { smelting: 1 },
            grant: ['smelting',2],
            cost: { 
                Knowledge: function(){ return 5500; }
            },
            effect: 'Upgrade your smelters so they can produce steel.',
            action: function (){
                if (payCosts(actions.tech.steel.cost)){
                    global.resource.Steel.display = true;
                    return true;
                }
                return false;
            }
        },
        blast_furnace: {
            id: 'tech-blast_furnace',
            title: 'Blast Furnace',
            desc: 'Upgrade your smelters',
            reqs: { smelting: 2 },
            grant: ['smelting',3],
            cost: { 
                Knowledge: function(){ return 15000; },
                Coal: function(){ return 2000; }
            },
            effect: 'Increases output of smelters by 20%',
            action: function (){
                if (payCosts(actions.tech.blast_furnace.cost)){
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
            effect: 'Learn how to mine and refine copper into a pure form.',
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
            effect: 'Learn how to extract iron ore from mines.',
            action: function (){
                if (payCosts(actions.tech.iron_mining.cost)){
                    global.resource.Iron.display = true;
                    return true;
                }
                return false;
            }
        },
        coal_mining: {
            id: 'tech-coal_mining',
            title: 'Coal Mining',
            desc: 'Discover Coal',
            reqs: { mining: 3 },
            grant: ['mining',4],
            cost: { 
                Knowledge: function(){ return 4800; }
            },
            effect: 'Learn about how coal can be used to as a resource.',
            action: function (){
                if (payCosts(actions.tech.coal_mining.cost)){
                    global.city['coal_mine'] = { count: 0 };
                    global.resource.Coal.display = true;
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
        containerization: {
            id: 'tech-containerization',
            title: 'Containerization',
            desc: 'Research scalable new storage solutions',
            reqs: { cement: 1 },
            grant: ['container',1],
            cost: { 
                Knowledge: function(){ return 3000; }
            },
            effect: 'Designs a scalable storage solution for all your storage needs.',
            action: function (){
                if (payCosts(actions.tech.containerization.cost)){
                    global.city['storage_yard'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        reinforced_crates: {
            id: 'tech-reinforced_crates',
            title: 'Reinforced Crates',
            desc: 'Reinforced Crates',
            reqs: { container: 1, smelting: 2 },
            grant: ['container',2],
            cost: { 
                Knowledge: function(){ return 7500; },
                Steel: function(){ return 250; }
            },
            effect: 'Upgrade wooden crates by reinforcing them with steel.',
            action: function (){
                if (payCosts(actions.tech.reinforced_crates.cost)){
                    return true;
                }
                return false;
            }
        },
        steel_containers: {
            id: 'tech-steel_containers',
            title: 'Steel Containers',
            desc: 'Design better steel containers',
            reqs: { smelting: 2, container: 1 },
            grant: ['steel_container',1],
            cost: { 
                Knowledge: function(){ return 10000; },
                Steel: function(){ return 500; }
            },
            effect: 'Replace cheap wooden crates with more durable steel containers.',
            action: function (){
                if (payCosts(actions.tech.steel_containers.cost)){
                    global.city['warehouse'] = { count: 0 };
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
                Knowledge: function(){ return 25; },
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
        market: {
            id: 'tech-market',
            title: 'Marketplace',
            desc: 'Open a commodities market',
            reqs: { banking: 1, currency: 1 },
            grant: ['currency',2],
            cost: { 
                Knowledge: function(){ return 2000; }
            },
            effect: 'Opens a commodities market where you can buy and sell resources.',
            action: function (){
                if (payCosts(actions.tech.market.cost)){
                    global.main_tabs.data.showMarket = true;
                    return true;
                }
                return false;
            }
        },
        tax_rates: {
            id: 'tech-tax_rates',
            title: 'Tax Rates',
            desc: 'Enables tax rates',
            reqs: { banking: 2, currency: 2 },
            grant: ['currency',3],
            cost: { 
                Knowledge: function(){ return 3750; }
            },
            effect: 'Allows government to adjust the tax rate.',
            action: function (){
                if (payCosts(actions.tech.tax_rates.cost)){
                    global.civic['taxes'].display = true;
                    return true;
                }
                return false;
            }
        },
        large_trades: {
            id: 'tech-large_trades',
            title: 'Large Volume Trading',
            desc: 'Upgrades marketplace for large orders',
            reqs: { currency: 3 },
            grant: ['currency',4],
            cost: { 
                Knowledge: function(){ return 7500; }
            },
            effect: 'Upgrades the commodities market to allow for buying and selling at higher volumes.',
            action: function (){
                if (payCosts(actions.tech.large_trades.cost)){
                    var tech = actions.tech.large_trades.grant[0];
                    global.tech[tech] = actions.tech.large_trades.grant[1];
                    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                    window.location.reload();;
                }
                return false;
            }
        },
        massive_trades: {
            id: 'tech-massive_trades',
            title: 'Massive Volume Trading',
            desc: 'Upgrades marketplace for massive orders',
            reqs: { currency: 5 },
            grant: ['currency',6],
            cost: { 
                Knowledge: function(){ return 1000000; }
            },
            effect: 'Upgrades the commodities market to allow for buying and selling at very high volumes.',
            action: function (){
                if (payCosts(actions.tech.massive_trades.cost)){
                    var tech = actions.tech.massive_trades.grant[0];
                    global.tech[tech] = actions.tech.massive_trades.grant[1];
                    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                    window.location.reload();;
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
                Knowledge: function(){ return 4000; },
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
        steel_vault: {
            id: 'tech-steel_vault',
            title: 'Steel Vault',
            desc: 'Steel Vaults',
            reqs: { banking: 4, smelting: 2 },
            grant: ['banking',5],
            cost: {
                Money: function(){ return 30000; },
                Knowledge: function(){ return 7500; },
                Steel: function(){ return 3000; }
            },
            effect: 'Reinforce your bank vaults with heavy steel doors and walls, increases $ storage capacity.',
            action: function (){
                if (payCosts(actions.tech.steel_vault.cost)){
                    return true;
                }
                return false;
            }
        },
        bonds: {
            id: 'tech-bonds',
            title: 'Savings Bonds',
            desc: 'Savings Bonds',
            reqs: { banking: 3 },
            grant: ['banking',4],
            cost: {
                Money: function(){ return 20000; },
                Knowledge: function(){ return 5500; }
            },
            effect: 'Raise new capital by creating a series of savings bonds. With savings bonds each citizen will increase your money cap by $250.',
            action: function (){
                if (payCosts(actions.tech.bonds.cost)){
                    return true;
                }
                return false;
            }
        },
        eebonds: {
            id: 'tech-eebonds',
            title: 'Series EE Bonds',
            desc: 'Series EE Bonds',
            reqs: { banking: 5, high_tech: 1 },
            grant: ['banking',6],
            cost: {
                Money: function(){ return 75000; },
                Knowledge: function(){ return 20000; }
            },
            effect: 'Create new series EE savings bonds which mature at a much higher value. Each citizen will increase your money cap by $600.',
            action: function (){
                if (payCosts(actions.tech.eebonds.cost)){
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
                Knowledge: function(){ return 75; }
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
        thesis: {
            id: 'tech-thesis',
            title: 'Thesis Papers',
            desc: 'Professors will require their students to write thesis papers',
            reqs: { science: 2 },
            grant: ['science',3],
            cost: {
                Knowledge: function(){ return 2000; }
            },
            effect: 'Libraries will have a minor effect on professor effectiveness.',
            action: function (){
                if (payCosts(actions.tech.library.cost)){
                    return true;
                }
                return false;
            }
        },
        research_grant: {
            id: 'tech-research_grant',
            title: 'Research Grants',
            desc: 'Research Grants',
            reqs: { science: 3 },
            grant: ['science',4],
            cost: {
                Knowledge: function(){ return 3600; }
            },
            effect: 'Libraries will boost the effect of universities by 2% per library',
            action: function (){
                if (payCosts(actions.tech.research_grant.cost)){
                    return true;
                }
                return false;
            }
        },
        mad_science: {
            id: 'tech-mad_science',
            title: 'Mad Science',
            desc: 'Mad Science',
            reqs: { science: 2, smelting: 2 },
            grant: ['high_tech',1],
            cost: {
                Money: function(){ return 10000; },
                Knowledge: function(){ return 7500; },
                Steel: function(){ return 1000; }
            },
            effect: 'The greatest leaps in science are often made by "misunderstood" individuals.',
            action: function (){
                if (payCosts(actions.tech.mad_science.cost)){
                    global.city['wardenclyffe'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        electricity: {
            id: 'tech-electricity',
            title: 'Electricity',
            desc: 'Electricity',
            reqs: { high_tech: 1 },
            grant: ['high_tech',2],
            cost: {
                Knowledge: function(){ return 15000; },
                Copper: function(){ return 1000; }
            },
            effect: 'Discover electricity, no kites required.',
            action: function (){
                if (payCosts(actions.tech.electricity.cost)){
                    global.city['power'] = 0;
                    global.city['powered'] = true;
                    global.city['coal_power'] = { count: 0 };
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
                    global.city['lumber_yard'] = { count: 0 };
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
        iron_saw: {
            id: 'tech-iron_saw',
            title: 'Sawmills',
            desc: 'Create plans for a sawmill',
            reqs: { axe: 1, mining: 3 },
            grant: ['saw',1],
            cost: {
                Knowledge: function(){ return 3750; },
                Iron: function(){ return 400; }
            },
            effect: 'Sawmills increase the lumber yeild of your lumberjacks.',
            action: function (){
                if (payCosts(actions.tech.iron_saw.cost)){
                    global.city['sawmill'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        steel_saw: {
            id: 'tech-steel_saw',
            title: 'Steel Saws',
            desc: 'Steel Sawmill blades',
            reqs: { smelting: 2, saw: 1 },
            grant: ['saw',2],
            cost: {
                Knowledge: function(){ return 12000; },
                Steel: function(){ return 400; }
            },
            effect: 'Upgrade sawmills with steel blades.',
            action: function (){
                if (payCosts(actions.tech.steel_saw.cost)){
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
        steel_axes: {
            id: 'tech-steel_axes',
            title: 'Steel Axe',
            desc: 'Create a superior axe made from steel',
            reqs: { axe: 3, smelting: 2 },
            grant: ['axe',4],
            cost: {
                Knowledge: function(){ return 10000; },
                Steel: function(){ return 250; }
            },
            effect: 'Upgrade axe technology to durable axes made from steel. Improves lumber harvesting.',
            action: function (){
                if (payCosts(actions.tech.steel_axes.cost)){
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
        steel_pickaxe: {
            id: 'tech-steel_pickaxe',
            title: 'Steel Pickaxe',
            desc: 'Create a pickaxe made from steel',
            reqs: { pickaxe: 2, smelting: 2},
            grant: ['pickaxe',3],
            cost: {
                Knowledge: function(){ return 10000; },
                Steel: function(){ return 250; }
            },
            effect: 'Upgrades pickaxe technology to steel pickaxes. Improves mining activities.',
            action: function (){
                if (payCosts(actions.tech.steel_pickaxe.cost)){
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
            desc: 'Create farming tools made from iron',
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
        },
        steel_hoe: {
            id: 'tech-steel_hoe',
            title: 'Steel Hoes',
            desc: 'Create better farming tools made from steel',
            reqs: { hoe: 2, smelting: 2 },
            grant: ['hoe',3],
            cost: {
                Knowledge: function(){ return 14000; },
                Steel: function(){ return 500; }
            },
            effect: 'Create tools made from steel that aid farming. Improves farm efficiency.',
            action: function (){
                if (payCosts(actions.tech.steel_hoe.cost)){
                    return true;
                }
                return false;
            }
        },
        garrison: {
            id: 'tech-garrison',
            title: 'Garrison',
            desc: 'Found the military',
            reqs: { science: 1, housing: 1, unavailable_tech: 1 },
            grant: ['military',1],
            cost: {
                Knowledge: function(){ return 80; }
            },
            effect: 'Establish a military to keep your people safe from external threats, or to conquer your enemies with.',
            action: function (){
                if (payCosts(actions.tech.garrison.cost)){
                    global.civic['garrison'].display = true;
                    global.city['garrison'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        bows: {
            id: 'tech-bows',
            title: 'Bows',
            desc: 'Discover Ranged Weaponary',
            reqs: { military: 1 },
            grant: ['military',2],
            cost: {
                Knowledge: function(){ return 250; },
                Lumber: function(){ return 250; }
            },
            effect: 'Create the bow, and outfit your army with ranged weapons. Sure to give you dominance over the primates.',
            action: function (){
                if (payCosts(actions.tech.bows.cost)){
                    return true;
                }
                return false;
            }
        },
        black_powder: {
            id: 'tech-black_powder',
            title: 'Black Powder',
            desc: 'Discover black powder',
            reqs: { mining: 4 },
            grant: ['explosives',1],
            cost: {
                Knowledge: function(){ return 5000; },
                Coal: function(){ return 500; }
            },
            effect: 'Usher in a new era of things that go boom. Surely nothing bad can happen thanks to this discovery.',
            action: function (){
                if (payCosts(actions.tech.black_powder.cost)){
                    return true;
                }
                return false;
            }
        },
        dynamite: {
            id: 'tech-dynamite',
            title: 'Dynamite',
            desc: 'Discover black powder',
            reqs: { explosives: 1 },
            grant: ['explosives',2],
            cost: {
                Knowledge: function(){ return 5200; },
                Coal: function(){ return 750; }
            },
            effect: 'Dynamite can be used to increase the efficiency of rock mining, no one would ever misuse this invention for nefarious purposes.',
            action: function (){
                if (payCosts(actions.tech.dynamite.cost)){
                    return true;
                }
                return false;
            }
        },
        rebar: {
            id: 'tech-rebar',
            title: 'Rebar',
            desc: 'Steel Rebar',
            reqs: { smelting: 2, cement: 1 },
            grant: ['cement',2],
            cost: {
                Knowledge: function(){ return 7500; },
                Steel: function(){ return 750; }
            },
            effect: 'Adding rebar to concrete will makes it much stronger and reduce cement costs.',
            action: function (){
                if (payCosts(actions.tech.rebar.cost)){
                    return true;
                }
                return false;
            }
        }
    }
};

export function checkCityRequirements(action){
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

export function checkTechRequirements(tech){
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

export function addAction(action,type){
    if (global.race['kindling_kindred'] && action === 'tech' && type === 'stone_axe'){
        return;
    }
    var id = actions[action][type].id;
    var parent = $(`<div id="${id}" class="action"></div>`);
    var element = $('<a class="button is-dark" v-on:click="action">{{ title }}</a>');
    parent.append(element);

    if (actions[action][type]['special']){
        var special = $(`<div class="special" title="${type} options" @click="trigModal"><svg version="1.1" x="0px" y="0px" width="12px" height="12px" viewBox="340 140 280 279.416" enable-background="new 340 140 280 279.416" xml:space="preserve">
            <path class="gear" d="M620,305.666v-51.333l-31.5-5.25c-2.333-8.75-5.833-16.917-9.917-23.917L597.25,199.5l-36.167-36.75l-26.25,18.083
                c-7.583-4.083-15.75-7.583-23.916-9.917L505.667,140h-51.334l-5.25,31.5c-8.75,2.333-16.333,5.833-23.916,9.916L399.5,163.333
                L362.75,199.5l18.667,25.666c-4.083,7.584-7.583,15.75-9.917,24.5l-31.5,4.667v51.333l31.5,5.25
                c2.333,8.75,5.833,16.334,9.917,23.917l-18.667,26.25l36.167,36.167l26.25-18.667c7.583,4.083,15.75,7.583,24.5,9.917l5.25,30.916
                h51.333l5.25-31.5c8.167-2.333,16.333-5.833,23.917-9.916l26.25,18.666l36.166-36.166l-18.666-26.25
                c4.083-7.584,7.583-15.167,9.916-23.917L620,305.666z M480,333.666c-29.75,0-53.667-23.916-53.667-53.666s24.5-53.667,53.667-53.667
                S533.667,250.25,533.667,280S509.75,333.666,480,333.666z"/>
            </svg></div>`);
        parent.append(special);
    }
    if (actions[action][type]['powered'] && global.tech['high_tech'] && global.tech['high_tech'] >= 2){
        if (!global[action][type]['on']){
            global[action][type]['on'] = 0;
        }
        var powerOn = $('<div class="on" @click="power_on" title="ON">{{ act.on }}</div>');
        var powerOff = $('<div class="off" @click="power_off" title="OFF">{{ act.on | off }}</div>');
        parent.append(powerOn);
        parent.append(powerOff);
    }
    if (action !== 'tech' && global[action][type] && global[action][type].count >= 0){
        element.append($('<span class="count">{{ act.count }}</span>'));
    }
    $('#'+action).append(parent);
    if (action !== 'tech' && global[action][type] && global[action][type].count === 0){
        $(`#${id} .count`).css('display','none');
        $(`#${id} .special`).css('display','none');
        $(`#${id} .on`).css('display','none');
        $(`#${id} .off`).css('display','none');
    }

    var modal = {
        template: '<div id="modalBox" class="modalBox"></div>'
    };

    vues[id] = new Vue({
        data: {
            title: typeof actions[action][type].title === 'string' ? actions[action][type].title : actions[action][type].title(),
            act: global[action][type]
        },
        methods: {
            action: function(){
                var keyMult = (action === 'tech' ? 1 : keyMultiplier());
                for (var i=0; i<keyMult; i++){
                    if (actions[action][type].action()){
                        if (action === 'tech'){
                            gainTech(type);
                        }
                        else {
                            updateDesc(action,type);
                        }
                    }
                    else {
                        break;
                    }
                }
            },
            trigModal: function(){
                this.$modal.open({
                    parent: this,
                    component: modal
                });
                
                var checkExist = setInterval(function() {
                   if ($('#modalBox').length > 0) {
                      clearInterval(checkExist);
                      drawModal(action,type);
                   }
                }, 50);
            },
            power_on: function(){
                if (global[action][type].on < global[action][type].count){
                    global[action][type].on++;
                }
            },
            power_off: function(){
                if (global[action][type].on > 0){
                    global[action][type].on--;
                }
            },
        },
        filters: {
            off: function(value){
                return global[action][type].count - value;
            }
        }
    });
    vues[id].$mount('#'+id);
    var popper = $(`<div id="pop${id}" class="popper has-background-light has-text-dark"></div>`);
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
                cost.append($(`<div class="${color}">${label}${res_cost}</div>`));
            }
        });
        parent.append(cost);
    }
    if (actions[action][type].effect){ 
        var effect = typeof actions[action][type].effect === 'string' ? actions[action][type].effect : actions[action][type].effect();
        parent.append($(`<div>${effect}</div>`)); 
    }
}

function removeAction(id){
    $('#'+id).remove();
    $('#pop'+id).remove();
}

function updateDesc(category,action){
    var id = actions[category][action].id;
    if (category !== 'tech'){
        $(`#${id} .count`).html(global[category][action].count);
        if (global[category][action] && global[category][action].count > 0){
            $(`#${id} .count`).css('display','inline-block');
            $(`#${id} .special`).css('display','block');
            $(`#${id} .on`).css('display','block');
            $(`#${id} .off`).css('display','block');
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
        return rebarAdjust(newCosts);
    }
    else if ((global.race['smart'] || global.race['dumb']) && costs['Knowledge']){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Knowledge'){
                newCosts[res] = function(){ return Math.round(costs[res]() * (global.race['smart'] ? 0.9 : 1.05)); }
            }
            else {
                newCosts[res] = function(){ return costs[res](); }
            }
        });
        return rebarAdjust(newCosts);
    }
    return rebarAdjust(costs);
}

function rebarAdjust(costs){
    if (costs['Cement'] && global.tech['cement'] && global.tech['cement'] >= 2){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Cement'){
                newCosts[res] = function(){ return Math.round(costs[res]() * 0.9) || 0; }
            }
            else {
                newCosts[res] = function(){ return Math.round(costs[res]()); }
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
    if (global.tech['housing_reduction'] && (structure === 'basic_housing' || structure === 'cottage')){
        mutiplier -= 0.02;
    }
    var count = global.city[structure] ? global.city[structure].count : 0;
    return Math.round((mutiplier ** count) * base);
}

function drawModal(action,type){
    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${actions[action][type].title}</p>`));
    
    var body = $('<div id="specialModal" class="modalBody"></div>');
    $('#modalBox').append(body);

    switch(type){
        case 'smelter':
            smelterModal(body);
            break;
    }
}

function smelterModal(modal){
    let fuel = $('<div><span class="has-text-warning">Fueled:</span> <span class="has-text-info">{{count | on}}/{{ count }}</span></div>');
    modal.append(fuel);

    let fuelTypes = $('<div></div>');
    modal.append(fuelTypes);

    let wood = $(`<b-tooltip :label="buildLabel('wood')" position="is-bottom" type="is-dark" animated><span class="current">Wood {{ Wood }}</span></b-tooltip>`);
    let subWood = $('<span class="sub" @click="subWood">&laquo;</span>');
    let addWood = $('<span class="add" @click="addWood">&raquo;</span>');
    fuelTypes.append(subWood);
    fuelTypes.append(wood);
    fuelTypes.append(addWood);

    if (global.resource.Coal.display){
        let coal = $(`<b-tooltip :label="buildLabel('coal')" position="is-bottom" type="is-dark" animated><span class="current">Coal {{ Coal }}</span></b-tooltip>`);
        let subCoal = $('<span class="sub" @click="subCoal">&laquo;</span>');
        let addCoal = $('<span class="add" @click="addCoal">&raquo;</span>');
        fuelTypes.append(subCoal);
        fuelTypes.append(coal);
        fuelTypes.append(addCoal);
    }

    if (global.resource.Steel.display){
        let smelt = $('<div class="smelting"></div>');
        let ironSmelt = $(`<b-tooltip :label="ironLabel()" position="is-left" size="is-small" type="is-dark" animated multilined><button class="button" @click="ironSmelting()">Iron Smelting: {{ Iron }}</button></b-tooltip>`);
        let steelSmelt = $(`<b-tooltip :label="steelLabel()" position="is-right" size="is-small" type="is-dark" animated multilined><button class="button" @click="steelSmelting()">Steel Smelting: {{ Steel }}</button></b-tooltip>`);
        modal.append(smelt);
        smelt.append(ironSmelt);
        smelt.append(steelSmelt);
    }

    vues['specialModal'] = new Vue({
        data: global.city['smelter'],
        methods: {
            subWood: function(){
                if (global.city.smelter.Wood > 0){
                    global.city.smelter.Wood--;
                    if (global.city.smelter.Iron + global.city.smelter.Steel > global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil){
                        if (global.city.smelter.Steel > 0){
                            global.city.smelter.Steel--;
                        }
                        else {
                            global.city.smelter.Iron--;
                        }
                    }
                }
            },
            addWood: function(){
                if (global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil < global.city.smelter.count){
                    global.city.smelter.Wood++;
                }
            },
            subCoal: function(){
                if (global.city.smelter.Coal > 0){
                    global.city.smelter.Coal--;
                    if (global.city.smelter.Iron + global.city.smelter.Steel > global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil){
                        if (global.city.smelter.Steel > 0){
                            global.city.smelter.Steel--;
                        }
                        else {
                            global.city.smelter.Iron--;
                        }
                    }
                }
            },
            addCoal: function(){
                if (global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil < global.city.smelter.count){
                    global.city.smelter.Coal++;
                }
            },
            ironLabel: function(){
                let boost = global.tech['smelting'] >= 3 ? 12 : 10;
                return `Smelt Iron, boosts Iron production by ${boost}%`;
            },
            steelLabel: function(){
                let boost = global.tech['smelting'] >= 3 ? 1.2 : 1;
                return `Smelt Steel, consumes 0.5 Coal and 2 Iron per tick but produces ${boost} Steel`;
            },
            ironSmelting: function(){
                let count = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil;
                if (global.city.smelter.Iron + global.city.smelter.Steel < count){
                    global.city.smelter.Iron++;
                }
                else if (global.city.smelter.Iron < count && global.city.smelter.Steel > 0){
                    global.city.smelter.Iron++;
                    global.city.smelter.Steel--;
                }
            },
            steelSmelting: function(){
                let count = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil;
                if (global.city.smelter.Iron + global.city.smelter.Steel < count){
                    global.city.smelter.Steel++;
                }
                else if (global.city.smelter.Steel < count && global.city.smelter.Iron > 0){
                    global.city.smelter.Steel++;
                    global.city.smelter.Iron--;
                }
            },
            buildLabel: function(type){
                switch(type){
                    case 'wood':
                        return 'Consume 3 Lumber/s to fuel a smelter';
                        break;
                    case 'coal':
                        return 'Consume 0.25 Coal/s to fuel a smelter';
                        break;
                }
            }
        },
        filters: {
            on: function(count){
                return global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil;
            }
        }
    });

    vues['specialModal'].$mount('#specialModal');
}
