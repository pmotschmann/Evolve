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
            }
        },
        membrane: {
            id: 'evo-membrane',
            title: function (){ 
                var label = 'Membrane';
                if (global.race['membrane'] && global.race['membrane'].count > 0){
                    label += ' ('+global.race.membrane.count+')';
                }
                return label;
            },
            desc: 'Evolve Membranes',
            cost: { RNA: function(){ return (global.race['membrane'].count * 2) + 10; } },
            effect: 'Increases RNA capacity by 5',
            action: function (){
                if (checkCosts(actions.evolution.membrane.cost)){
                    var rna_cost = actions.evolution.membrane.cost['RNA']();
                    global['resource']['RNA'].amount -= rna_cost;
                    global['resource']['RNA'].max += 5;
                    global.race['membrane'].count++;
                    var id = actions.evolution.membrane.id;
                    $('#pop'+id).empty();
                    actionDesc($('#pop'+id),'evolution','membrane');
                    $('#'+id).html(actions.evolution.membrane.title());
                }
            }
        },
        organelles: {
            id: 'evo-organelles',
            title: function (){ 
                var label = 'Organelles';
                if (global.race['organelles'] && global.race['organelles'].count > 0){
                    label += ' ('+global.race.organelles.count+')';
                }
                return label;
            },
            desc: 'Evolve Organelles',
            cost: { 
                RNA: function(){ return (global.race['organelles'].count * 10) + 50; },
                DNA: function(){ return (global.race['organelles'].count * 5) + 5; },
            },
            effect: 'Increases RNA generation rate',
            action: function (){
                if (checkCosts(actions.evolution.organelles.cost)){
                    global['resource']['RNA'].amount -= actions.evolution.organelles.cost['RNA']();
                    global['resource']['DNA'].amount -= actions.evolution.organelles.cost['DNA']();
                    global.race['organelles'].count++;
                    var id = actions.evolution.organelles.id;
                    $('#pop'+id).empty();
                    actionDesc($('#pop'+id),'evolution','organelles');
                    $('#'+id).html(actions.evolution.organelles.title());
                }
            }
        },
        nucleus: {
            id: 'evo-nucleus',
            title: function (){ 
                var label = 'Nucleus';
                if (global.race['nucleus'] && global.race['nucleus'].count > 0){
                    label += ' ('+global.race.nucleus.count+')';
                }
                return label;
            },
            desc: 'Evolve Nucleus',
            cost: { 
                RNA: function(){ return (global.race['nucleus'].count * 75) + 75; },
                DNA: function(){ return (global.race['nucleus'].count * 50) + 50; },
            },
            effect: 'Automatically consume RNA to create DNA',
            action: function (){
                if (checkCosts(actions.evolution.nucleus.cost)){
                    global['resource']['RNA'].amount -= actions.evolution.nucleus.cost['RNA']();
                    global['resource']['DNA'].amount -= actions.evolution.nucleus.cost['DNA']();
                    global.race['nucleus'].count++;
                    var id = actions.evolution.nucleus.id;
                    $('#pop'+id).empty();
                    actionDesc($('#pop'+id),'evolution','nucleus');
                    $('#'+id).html(actions.evolution.nucleus.title());
                }
            }
        },
        eukaryotic_cell: {
            id: 'evo-eukaryotic_cell',
            title: function (){ 
                var label = 'Eukaryotic Cell';
                if (global.race['eukaryotic_cell'] && global.race['eukaryotic_cell'].count > 0){
                    label += ' ('+global.race.eukaryotic_cell.count+')';
                }
                return label;
            },
            desc: 'Evolve Eukaryotic Cell',
            cost: { 
                RNA: function(){ return (global.race['eukaryotic_cell'].count * 25) + 25; },
                DNA: function(){ return (global.race['eukaryotic_cell'].count * 15) + 50; },
            },
            effect: 'Increases DNA capacity by 10',
            action: function (){
                if (checkCosts(actions.evolution.eukaryotic_cell.cost)){
                    global['resource']['RNA'].amount -= actions.evolution.eukaryotic_cell.cost['RNA']();
                    global['resource']['DNA'].amount -= actions.evolution.eukaryotic_cell.cost['DNA']();
                    global.race['eukaryotic_cell'].count++;
                    global['resource']['DNA'].max += 10;
                    var id = actions.evolution.eukaryotic_cell.id;
                    $('#pop'+id).empty();
                    actionDesc($('#pop'+id),'evolution','eukaryotic_cell');
                    $('#'+id).html(actions.evolution.eukaryotic_cell.title());
                }
            }
        },
        mitochondria: {
            id: 'evo-mitochondria',
            title: function (){ 
                var label = 'Mitochondria';
                if (global.race['mitochondria'] && global.race['mitochondria'].count > 0){
                    label += ' ('+global.race.mitochondria.count+')';
                }
                return label;
            },
            desc: 'Evolve Mitochondria',
            cost: { 
                RNA: function(){ return (global.race['mitochondria'].count * 70) + 200; },
                DNA: function(){ return (global.race['mitochondria'].count * 65) + 150; },
            },
            effect: 'Increases DNA capacity by 25 and RNA capacity by 50',
            action: function (){
                if (checkCosts(actions.evolution.mitochondria.cost)){
                    global['resource']['RNA'].amount -= actions.evolution.mitochondria.cost['RNA']();
                    global['resource']['DNA'].amount -= actions.evolution.mitochondria.cost['DNA']();
                    global.race['mitochondria'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 50;
                    var id = actions.evolution.mitochondria.id;
                    $('#pop'+id).empty();
                    actionDesc($('#pop'+id),'evolution','mitochondria');
                    $('#'+id).html(actions.evolution.mitochondria.title());
                }
            }
        },
        sexual_reproduction: {
            id: 'evo-sexual_reproduction',
            title: 'Sexual Reproduction',
            desc: 'Evolve Sexual Reproduction',
            cost: { 
                DNA: function(){ return 250; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.sexual_reproduction.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.sexual_reproduction.cost['DNA']();
                    global.race['sexual_reproduction'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.sexual_reproduction.id).remove();
                    $('#pop'+actions.evolution.sexual_reproduction.id).remove();
                    
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
            }
        },
        phagocytosis: {
            id: 'evo-phagocytosis',
            title: 'Phagocytosis',
            desc: 'Evolve Phagocytosis',
            cost: { 
                DNA: function(){ return 300; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.phagocytosis.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.phagocytosis.cost['DNA']();
                    global.race['phagocytosis'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.phagocytosis.id).remove();
                    $('#pop'+actions.evolution.phagocytosis.id).remove();
                    global.race['multicellular'] = { count: 0 };
                    addAction('evolution','multicellular');
                }
            }
        },
        chloroplasts: {
            id: 'evo-chloroplasts',
            title: 'Chloroplasts',
            desc: 'Evolve Chloroplasts',
            cost: { 
                DNA: function(){ return 300; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.chloroplasts.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.chloroplasts.cost['DNA']();
                    global.race['chloroplasts'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.chloroplasts.id).remove();
                    $('#pop'+actions.evolution.chloroplasts.id).remove();
                    global.race['multicellular'] = { count: 0 };
                    addAction('evolution','multicellular');
                }
            }
        },
        chitin: {
            id: 'evo-chitin',
            title: 'Chitin',
            desc: 'Evolve Chitin',
            cost: { 
                DNA: function(){ return 300; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.chitin.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.chitin.cost['DNA']();
                    global.race['chitin'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.chitin.id).remove();
                    $('#pop'+actions.evolution.chitin.id).remove();
                    global.race['multicellular'] = { count: 0 };
                    addAction('evolution','multicellular');
                }
            }
        },
        multicellular: {
            id: 'evo-multicellular',
            title: 'Multicellular',
            desc: 'Evolve Multicellular',
            cost: { 
                DNA: function(){ return 330; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.multicellular.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.multicellular.cost['DNA']();
                    global.race['multicellular'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.multicellular.id).remove();
                    $('#pop'+actions.evolution.multicellular.id).remove();
                    
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
            }
        },
        spores: {
            id: 'evo-spores',
            title: 'Spores',
            desc: 'Evolve Spores',
            cost: { 
                DNA: function(){ return 360; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.spores.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.spores.cost['DNA']();
                    global.race['spores'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.spores.id).remove();
                    $('#pop'+actions.evolution.spores.id).remove();
                    global.race['bryophyte'] = { count: 0 };
                    addAction('evolution','bryophyte');
                }
            }
        },
        poikilohydric: {
            id: 'evo-poikilohydric',
            title: 'Poikilohydric',
            desc: 'Evolve Poikilohydric',
            cost: { 
                DNA: function(){ return 360; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.poikilohydric.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.poikilohydric.cost['DNA']();
                    global.race['poikilohydric'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.poikilohydric.id).remove();
                    $('#pop'+actions.evolution.poikilohydric.id).remove();
                    global.race['bryophyte'] = { count: 0 };
                    addAction('evolution','bryophyte');
                }
            }
        },
        bilateral_symmetry: {
            id: 'evo-bilateral_symmetry',
            title: 'Bilateral Symmetry',
            desc: 'Evolve Bilateral Symmetry',
            cost: { 
                DNA: function(){ return 360; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.bilateral_symmetry.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.bilateral_symmetry.cost['DNA']();
                    global.race['bilateral_symmetry'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.bilateral_symmetry.id).remove();
                    $('#pop'+actions.evolution.bilateral_symmetry.id).remove();
                    
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
            }
        },
        bryophyte: {
            id: 'evo-bryophyte',
            title: 'Bryophyte',
            desc: 'Evolve Bryophyte',
            cost: { 
                DNA: function(){ return 400; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.bryophyte.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.bryophyte.cost['DNA']();
                    global.race['bryophyte'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.bryophyte.id).remove();
                    $('#pop'+actions.evolution.bryophyte.id).remove();
                    
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
            }
        },
        protostomes: {
            id: 'evo-protostomes',
            title: 'Protostomes',
            desc: 'Evolve Protostomes',
            cost: { 
                DNA: function(){ return 400; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.protostomes.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.protostomes.cost['DNA']();
                    global.race['protostomes'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.protostomes.id).remove();
                    $('#pop'+actions.evolution.protostomes.id).remove();
                    global.race['athropods'] = { count: 0 };
                    addAction('evolution','athropods');
                }
            }
        },
        deuterostome: {
            id: 'evo-deuterostome',
            title: 'Deuterostome',
            desc: 'Evolve Deuterostome',
            cost: { 
                DNA: function(){ return 400; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.deuterostome.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.deuterostome.cost['DNA']();
                    global.race['deuterostome'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.deuterostome.id).remove();
                    $('#pop'+actions.evolution.deuterostome.id).remove();
                    
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
            }
        },
        vascular: {
            id: 'evo-vascular',
            title: 'Vascular',
            desc: 'Evolve Vascular',
            cost: { 
                DNA: function(){ return 450; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.vascular.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.vascular.cost['DNA']();
                    global.race['vascular'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.vascular.id).remove();
                    $('#pop'+actions.evolution.vascular.id).remove();
                    global.race['sentience'] = { count: 0 };
                    addAction('evolution','sentience');
                }
            }
        },
        homoiohydric: {
            id: 'evo-homoiohydric',
            title: 'Homoiohydric',
            desc: 'Evolve Homoiohydric',
            cost: { 
                DNA: function(){ return 450; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.homoiohydric.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.homoiohydric.cost['DNA']();
                    global.race['homoiohydric'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.homoiohydric.id).remove();
                    $('#pop'+actions.evolution.homoiohydric.id).remove();
                    global.race['sentience'] = { count: 0 };
                    addAction('evolution','sentience');
                }
            }
        },
        athropods: {
            id: 'evo-athropods',
            title: 'Athropods',
            desc: 'Evolve Athropods',
            cost: { 
                DNA: function(){ return 450; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.athropods.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.athropods.cost['DNA']();
                    global.race['athropods'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.athropods.id).remove();
                    $('#pop'+actions.evolution.athropods.id).remove();
                    global.race['sentience'] = { count: 0 };
                    addAction('evolution','sentience');
                }
            }
        },
        mammals: {
            id: 'evo-mammals',
            title: 'Mammals',
            desc: 'Evolve Mammals',
            cost: { 
                DNA: function(){ return 450; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.mammals.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.mammals.cost['DNA']();
                    global.race['mammals'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.mammals.id).remove();
                    $('#pop'+actions.evolution.mammals.id).remove();
                    global.race['sentience'] = { count: 0 };
                    addAction('evolution','sentience');
                }
            }
        },
        eggshell: {
            id: 'evo-eggshell',
            title: 'Eggshell',
            desc: 'Evolve Eggshell',
            cost: { 
                DNA: function(){ return 450; },
            },
            effect: 'Unlocks the next step in evolution. Max RNA & DNA + 25',
            action: function (){
                if (checkCosts(actions.evolution.eggshell.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.eggshell.cost['DNA']();
                    global.race['eggshell'].count++;
                    global['resource']['DNA'].max += 25;
                    global['resource']['RNA'].max += 25;
                    $('#'+actions.evolution.eggshell.id).remove();
                    $('#pop'+actions.evolution.eggshell.id).remove();
                    global.race['sentience'] = { count: 0 };
                    addAction('evolution','sentience');
                }
            }
        },
        sentience: {
            id: 'evo-sentience',
            title: 'Sentience',
            desc: 'Evolve Sentience',
            cost: { 
                DNA: function(){ return 500; },
            },
            effect: 'Evolve into a species which has achieved sentience',
            action: function (){
                if (checkCosts(actions.evolution.sentience.cost)){
                    global['resource']['DNA'].amount -= actions.evolution.sentience.cost['DNA']();
                    global.race['sentience'].count++;
                    $('#'+actions.evolution.sentience.id).remove();
                    $('#pop'+actions.evolution.sentience.id).remove();
                    
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
                    
                    defineResources();
                    global.resource.Food.display = true;
                    global.resource.Lumber.display = true;
                    global.resource.Stone.display = true;
                    
                    global['city'] = { food: 1, lumber: 1, stone: 1 };
                    
                    var city_actions = ['food','lumber','stone'];
                    for (var i = 0; i < city_actions.length; i++) {
                        if (global.city[city_actions[i]]){
                            addAction('city',city_actions[i]);
                        }
                    }
                    
                    Object.keys(genus_traits[races[global.race.species].type]).forEach(function (trait) {
                        global.race[trait] = genus_traits[races[global.race.species].type][trait];
                    });
                }
            }
        }
    },
    city: {
        food: {
            id: 'city-food',
            title: 'Gather Food',
            desc: 'Harvest and preserve food from the land.',
            action: function (){
                if(global['resource']['Food'].amount < global['resource']['Food'].max){
                    global['resource']['Food'].amount++;
                }
            }
        },
        lumber: {
            id: 'city-lumber',
            title: 'Gather Lumber',
            desc: 'Harvest lumber from the forest',
            action: function (){
                if(global['resource']['Lumber'].amount < global['resource']['Lumber'].max){
                    global['resource']['Lumber'].amount++;
                }
            }
        },
        stone: {
            id: 'city-stone',
            title: 'Gather Stone',
            desc: 'Harvest lumber from the forest',
            action: function (){
                if(global['resource']['Stone'].amount < global['resource']['Stone'].max){
                    global['resource']['Stone'].amount++;
                }
            }
        }
    }
};

function checkCosts(costs) {
    var test = true;
    Object.keys(costs).forEach(function (res) {
        var testCost = Number(costs[res]()) || 0;
        if (testCost > Number(global['resource'][res].amount)) {
            test = false;
            return false;
        }
    });
    return test;
}
