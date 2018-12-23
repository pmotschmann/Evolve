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
            title: function (){ return setTitle('Membrane','race','membrane'); },
            desc: 'Evolve Membranes',
            cost: { RNA: function(){ return (global.race['membrane'].count * 2) + 2; } },
            effect: 'Increases RNA capacity by 5',
            action: function (){
                if (payCosts(actions.evolution.membrane.cost)){
                    global['resource']['RNA'].max += 5;
                    global.race['membrane'].count++;
                    updateDesc('evolution','membrane');
                    return true;
                }
                return false;
            }
        },
        organelles: {
            id: 'evo-organelles',
            title: function (){ return setTitle('Organelles','race','organelles'); },
            desc: 'Evolve Organelles',
            cost: { 
                RNA: function(){ return (global.race['organelles'].count * 8) + 12; },
                DNA: function(){ return (global.race['organelles'].count * 4) + 4; },
            },
            effect: 'Automatically generate RNA',
            action: function (){
                if (payCosts(actions.evolution.organelles.cost)){
                    global.race['organelles'].count++;
                    return true;
                }
                return false;
            }
        },
        nucleus: {
            id: 'evo-nucleus',
            title: function (){ return setTitle('Nucleus','race','nucleus'); },
            desc: 'Evolve Nucleus',
            cost: { 
                RNA: function(){ return (global.race['nucleus'].count * 45) + 75; },
                DNA: function(){ return (global.race['nucleus'].count * 18) + 30; },
            },
            effect: 'Automatically consume RNA to create DNA',
            action: function (){
                if (payCosts(actions.evolution.nucleus.cost)){
                    global.race['nucleus'].count++;
                    return true;
                }
                return false;
            }
        },
        eukaryotic_cell: {
            id: 'evo-eukaryotic_cell',
            title: function (){ return setTitle('Eukaryotic Cell','race','eukaryotic_cell'); },
            desc: 'Evolve Eukaryotic Cell',
            cost: { 
                RNA: function(){ return (global.race['eukaryotic_cell'].count * 20) + 20; },
                DNA: function(){ return (global.race['eukaryotic_cell'].count * 12) + 40; },
            },
            effect: 'Increases DNA capacity by 10',
            action: function (){
                if (payCosts(actions.evolution.eukaryotic_cell.cost)){
                    global.race['eukaryotic_cell'].count++;
                    global['resource']['DNA'].max += 10;
                    return true;
                }
                return false;
            }
        },
        mitochondria: {
            id: 'evo-mitochondria',
            title: function (){ return setTitle('Mitochondria','race','mitochondria'); },
            desc: 'Evolve Mitochondria',
            cost: { 
                RNA: function(){ return (global.race['mitochondria'].count * 50) + 150; },
                DNA: function(){ return (global.race['mitochondria'].count * 35) + 120; },
            },
            effect: 'Increases DNA capacity by 25 and RNA capacity by 50',
            action: function (){
                if (payCosts(actions.evolution.mitochondria.cost)){
                    global.race['mitochondria'].count++;
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
                    global.race['sexual_reproduction'].count++;
                    removeAction(actions.evolution.sexual_reproduction.id);
                    
                    var path = Math.floor(Math.seededRandom(0,100));
                    if (path < 84){
                        global.race['phagocytosis'] = { count: 0 };
                        addAction('evolution','phagocytosis');
                    }
                    else if (path < 92){
                        global.race['chloroplasts'] = { count: 0 };
                        addAction('evolution','chloroplasts');
                    }
                    else {
                        global.race['chitin'] = { count: 0 };
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
                    global.race['phagocytosis'].count++;
                    removeAction(actions.evolution.phagocytosis.id);
                    global.race['multicellular'] = { count: 0 };
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
                    global.race['chloroplasts'].count++;
                    removeAction(actions.evolution.chloroplasts.id);
                    global.race['multicellular'] = { count: 0 };
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
                    global.race['chitin'].count++;
                    removeAction(actions.evolution.chitin.id);
                    global.race['multicellular'] = { count: 0 };
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
                    global.race['multicellular'].count++;
                    removeAction(actions.evolution.multicellular.id);
                    
                    if (global.race['phagocytosis']){
                        global.race['bilateral_symmetry'] = { count: 0 };
                        addAction('evolution','bilateral_symmetry');
                    }
                    else if (global.race['chloroplasts']){
                        global.race['poikilohydric'] = { count: 0 };
                        addAction('evolution','poikilohydric');
                    }
                    else if (global.race['chitin']) {
                        global.race['spores'] = { count: 0 };
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
                    global.race['spores'].count++;
                    removeAction(actions.evolution.spores.id);
                    global.race['bryophyte'] = { count: 0 };
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
                    global.race['poikilohydric'].count++;
                    removeAction(actions.evolution.poikilohydric.id);
                    global.race['bryophyte'] = { count: 0 };
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
                    global.race['bilateral_symmetry'].count++;
                    removeAction(actions.evolution.bilateral_symmetry.id);
                    
                    var path = Math.floor(Math.seededRandom(0,100));
                    if (path < 14){
                        global.race['protostomes'] = { count: 0 };
                        addAction('evolution','protostomes');
                    }
                    else {
                        global.race['deuterostome'] = { count: 0 };
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
                    global.race['bryophyte'].count++;
                    removeAction(actions.evolution.bryophyte.id);
                    
                    if (global.race['spores']){
                        global.race['vascular'] = { count: 0 };
                        addAction('evolution','vascular');
                    }
                    else {
                        var path = Math.floor(Math.seededRandom(0,100));
                        if (path < 50){
                            global.race['vascular'] = { count: 0 };
                            addAction('evolution','vascular');
                        }
                        else {
                            global.race['homoiohydric'] = { count: 0 };
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
                    global.race['protostomes'].count++;
                    removeAction(actions.evolution.protostomes.id);
                    global.race['athropods'] = { count: 0 };
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
                    global.race['deuterostome'].count++;
                    removeAction(actions.evolution.deuterostome.id);
                    
                    var path = Math.floor(Math.seededRandom(0,100));
                    if (path < 67){
                        global.race['mammals'] = { count: 0 };
                        addAction('evolution','mammals');
                    }
                    else {
                        global.race['eggshell'] = { count: 0 };
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
                    global.race['vascular'].count++;
                    removeAction(actions.evolution.vascular.id);
                    global.race['sentience'] = { count: 0 };
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
                    global.race['homoiohydric'].count++;
                    removeAction(actions.evolution.homoiohydric.id);
                    global.race['sentience'] = { count: 0 };
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
                    global.race['athropods'].count++;
                    removeAction(actions.evolution.athropods.id);
                    global.race['sentience'] = { count: 0 };
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
                    global.race['mammals'].count++;
                    removeAction(actions.evolution.mammals.id);
                    global.race['sentience'] = { count: 0 };
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
                    global.race['eggshell'].count++;
                    removeAction(actions.evolution.eggshell.id);
                    global.race['sentience'] = { count: 0 };
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
                    global.race['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    
                    // Trigger Next Phase of game
                    var path = Math.floor(Math.seededRandom(0,100));
                    if (global.race['mammals']){
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
                    else if (global.race['eggshell']){
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
                    else if (global.race['chitin']){
                        if (path < 50){
                            global.race.species = 'sporgar';
                        }
                        else {
                            global.race.species = 'shroomi';
                        }
                    }
                    else if (global.race['athropods']){
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
                    else if (global.race['chloroplasts'] && global.race['vascular']){
                        global.race.species = 'entish';
                    }
                    else if (global.race['chloroplasts'] && global.race['homoiohydric']){
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
            title: function (){ return setTitle('Cabin','city','basic_housing'); },
            desc: 'Construct a cabin',
            reqs: { housing: 1 },
            cost: { 
                Money: function(){ if (global.city['basic_housing'] && global.city['basic_housing'].count >= 5){ return costMultiplier('basic_housing', 20, 1.15);} else { return 0; } },
                Lumber: function(){ return costMultiplier('basic_housing', 10, 1.28); },
                Stone: function(){ return costMultiplier('basic_housing', 8, 1.28); }
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
        farm: {
            id: 'city-farm',
            title: function (){ return setTitle('Farm','city','farm'); },
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
        shed: {
            id: 'city-shed',
            title: function (){ return setTitle('Shed','city','shed'); },
            desc: 'Construct a shed',
            reqs: { storage: 1 },
            cost: { 
                Money: function(){ return costMultiplier('shed', 75, 1.2); },
                Lumber: function(){ return costMultiplier('shed', 60, 1.35); },
                Stone: function(){ return costMultiplier('shed', 40, 1.35); }
            },
            effect: 'A small storage facility which increases your storage capacity of various resources',
            action: function (){
                if (payCosts(actions.city.shed.cost)){
                    global['resource']['Lumber'].max += 250;
                    global['resource']['Stone'].max += 250;
                    global['resource']['Copper'].max += 100;
                    global['resource']['Iron'].max += 100;
                    global['resource']['Concrete'].max += 100;
                    global.city['shed'].count++;
                    return true;
                }
                return false;
            }
        },
        mill: {
            id: 'city-mill',
            title: function (){ return setTitle('Mill','city','mill'); },
            desc: 'Build a mill',
            reqs: { agriculture: 2 },
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
        rock_quarry: {
            id: 'city-rock_quarry',
            title: function (){ return setTitle('Rock Quarry','city','rock_quarry'); },
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
                    global.civic.quarry_worker.max = global.city.rock_quarry.count * 2;
                    return true;
                }
                return false;
            }
        },
        mine: {
            id: 'city-mine',
            title: function (){ return setTitle('Mine','city','mine'); },
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
                    global.civic.miner.max = global.city.mine.count * 2;
                    return true;
                }
                return false;
            }
        },
        temple: {
            id: 'city-temple',
            title: function (){ return setTitle('Temple','city','temple'); },
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
            title: function (){ return setTitle('Bank','city','bank'); },
            desc: 'Build a bank',
            reqs: { banking: 1 },
            cost: { 
                Money: function(){ return costMultiplier('bank', 250, 1.5); },
                Lumber: function(){ return costMultiplier('bank', 75, 1.30); },
                Stone: function(){ return costMultiplier('bank', 100, 1.45); }
            },
            effect: 'Increases money capacity by $1000',
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
            title: function (){ return setTitle('University','city','university'); },
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
                    global.civic.professor.max = global.city.university.count * 2;
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
                if (payCosts(actions.tech.agriculture.cost)){
                    global.city['basic_housing'] = { count: 0 };
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
                Knowledge: function(){ return 5000; }
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
            effect: 'Creates a primitive axe made from stone lashed to a stick.',
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
            desc: 'Create tools made from copper',
            reqs: { axe: 1, mining: 2 },
            grant: ['axe',2],
            cost: { 
                Knowledge: function(){ return 750; },
                Copper: function(){ return 25; }
            },
            effect: 'Upgrade axe technology to metal axes made from copper',
            action: function (){
                if (payCosts(actions.tech.copper_axes.cost)){
                    return true;
                }
                return false;
            }
        }
    }
};

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
    $('#'+action).append(element);
    vues[id] = new Vue({
        data: {
            title: typeof actions[action][type].title === 'string' ? actions[action][type].title : actions[action][type].title()
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

function setTitle(title,category,action){
    var label = title;
    if (global[category][action] && global[category][action].count > 0){
        title += ' ('+global[category][action].count+')';
    }
    return title;
}

function updateDesc(category,action){
    var id = actions[category][action].id;
    actionDesc($('#pop'+id),category,action);
    $('#'+id).html(actions[category][action].title());
}

function adjustCosts(costs){
    if (global.race['kindling_kindred'] && costs['Lumber']){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res !== 'Lumber'){
                //var newcost = Math.round(costs[res]() * 1.2);
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
