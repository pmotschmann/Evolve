import { global, vues, save, poppers, messageQueue, keyMultiplier, modRes } from './vars.js';
import { unlockAchieve } from './achieve.js';
import { races, genus_traits, randomMinorTrait } from './races.js';
import { defineResources, loadMarket, spatialReasoning } from './resources.js';
import { loadFoundry } from './jobs.js';
import { defineGarrison } from './civics.js';
import { arpa, gainGene } from './arpa.js';

export const actions = {
    evolution: {
        rna: {
            id: 'evo-rna',
            title: 'RNA',
            desc(){
                let rna = global.race['rapid_mutation'] ? 2 : 1;
                return `Creates ${rna} RNA`;
            },
            action(){
                if(global['resource']['RNA'].amount < global['resource']['RNA'].max){
                    modRes('RNA',global.race['rapid_mutation'] ? 2 : 1);
                }
                return false;
            }
        },
        dna: {
            id: 'evo-dna',
            title: 'Form DNA',
            desc: 'Creates a new strand of DNA',
            cost: { RNA(){ return 2; } },
            action(){
                if (global['resource']['RNA'].amount >= 2 && global['resource']['DNA'].amount < global['resource']['DNA'].max){
                    modRes('RNA',-2);
                    modRes('DNA',1);
                }
                return false;
            },
            effect: 'Turn 2 RNA into 1 DNA'
        },
        membrane: {
            id: 'evo-membrane',
            title: 'Membrane',
            desc: 'Evolve Membranes',
            cost: { RNA(){ return (global.evolution['membrane'].count * 2) + 2; } },
            effect(){
                let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 5 + 5 : 5;
                return `Increases RNA capacity by ${effect}`;
            },
            action(){
                if (payCosts(actions.evolution.membrane.cost)){
                    global['resource']['RNA'].max += global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 5 + 5 : 5;
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
                RNA(){ return (global.evolution['organelles'].count * 8) + 12; },
                DNA(){ return (global.evolution['organelles'].count * 4) + 4; }
            },
            effect(){
                let rna = global.race['rapid_mutation'] ? 2 : 1;
                if (global.evolution['sexual_reproduction'] && global.evolution['sexual_reproduction'].count > 0){
                    rna++;
                }
                return `Automatically generate ${rna} RNA`; 
            },
            action(){
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
                RNA(){ return (global.evolution['nucleus'].count * (global.evolution['multicellular'] && global.evolution['multicellular'].count > 0 ? 16 : 32)) + 38; },
                DNA(){ return (global.evolution['nucleus'].count * (global.evolution['multicellular'] && global.evolution['multicellular'].count > 0 ? 12 : 16)) + 18; }
            },
            effect(){
                let dna = global.evolution['bryophyte'] || global.evolution['protostomes'] || global.evolution['deuterostome'] ? 2 : 1;
                return `Automatically consume 2 RNA to create ${dna} DNA`;
            },
            action(){
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
                RNA(){ return (global.evolution['eukaryotic_cell'].count * 20) + 20; },
                DNA(){ return (global.evolution['eukaryotic_cell'].count * 12) + 40; }
            },
            effect(){
                let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 10 + 10 : 10;
                return `Increases DNA capacity by ${effect}`;
            },
            action(){
                if (payCosts(actions.evolution.eukaryotic_cell.cost)){
                    global.evolution['eukaryotic_cell'].count++;
                    global['resource']['DNA'].max += global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 10 + 10 : 10;
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
                RNA(){ return (global.evolution['mitochondria'].count * 50) + 75; },
                DNA(){ return (global.evolution['mitochondria'].count * 35) + 65; }
            },
            effect: 'Increases the effect of membranes and eukaryotic cells',
            action(){
                if (payCosts(actions.evolution.mitochondria.cost)){
                    global.evolution['mitochondria'].count++;
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
                DNA(){ return 150; }
            },
            effect: 'Increases RNA generation from organelles',
            action(){
                if (payCosts(actions.evolution.sexual_reproduction.cost)){
                    global.evolution['sexual_reproduction'].count++;
                    removeAction(actions.evolution.sexual_reproduction.id);
                    
                    global.evolution['phagocytosis'] = { count: 0 };
                    addAction('evolution','phagocytosis');
                    global.evolution['chloroplasts'] = { count: 0 };
                    addAction('evolution','chloroplasts');
                    global.evolution['chitin'] = { count: 0 };
                    addAction('evolution','chitin');

                    global.evolution['final'] = 20;
                    evoProgress();
                }
                return false;
            }
        },
        phagocytosis: {
            id: 'evo-phagocytosis',
            title: 'Phagocytosis',
            desc: 'Evolve Phagocytosis',
            cost: {
                DNA(){ return 175; }
            },
            effect: 'Evolve in the direction of the animal kingdom. This is a major evolutionary fork.',
            action(){
                if (payCosts(actions.evolution.phagocytosis.cost)){
                    global.evolution['phagocytosis'].count++;
                    removeAction(actions.evolution.phagocytosis.id);
                    removeAction(actions.evolution.chloroplasts.id);
                    removeAction(actions.evolution.chitin.id);
                    delete global.evolution.chloroplasts;
                    delete global.evolution.chitin;
                    global.evolution['multicellular'] = { count: 0 };
                    global.evolution['final'] = 40;
                    addAction('evolution','multicellular');
                    evoProgress();
                }
                return false;
            }
        },
        chloroplasts: {
            id: 'evo-chloroplasts',
            title: 'Chloroplasts',
            desc: 'Evolve Chloroplasts',
            cost: {
                DNA(){ return 175; }
            },
            effect: 'Evolve in the direction of the plant kingdom. This is a major evolutionary fork.',
            action(){
                if (payCosts(actions.evolution.chloroplasts.cost)){
                    global.evolution['chloroplasts'].count++;
                    removeAction(actions.evolution.chloroplasts.id);
                    removeAction(actions.evolution.phagocytosis.id);
                    removeAction(actions.evolution.chitin.id);
                    delete global.evolution.phagocytosis;
                    delete global.evolution.chitin;
                    global.evolution['multicellular'] = { count: 0 };
                    global.evolution['final'] = 40;
                    addAction('evolution','multicellular');
                    evoProgress();
                }
                return false;
            }
        },
        chitin: {
            id: 'evo-chitin',
            title: 'Chitin',
            desc: 'Evolve Chitin',
            cost: {
                DNA(){ return 175; }
            },
            effect: 'Evolve in the direction of the fungi kingdom. This is a major evolutionary fork.',
            action(){
                if (payCosts(actions.evolution.chitin.cost)){
                    global.evolution['chitin'].count++;
                    removeAction(actions.evolution.chitin.id);
                    removeAction(actions.evolution.phagocytosis.id);
                    removeAction(actions.evolution.chloroplasts.id);
                    delete global.evolution.phagocytosis;
                    delete global.evolution.chloroplasts;
                    global.evolution['multicellular'] = { count: 0 };
                    global.evolution['final'] = 40;
                    addAction('evolution','multicellular');
                    evoProgress();
                }
                return false;
            }
        },
        multicellular: {
            id: 'evo-multicellular',
            title: 'Multicellular',
            desc: 'Evolve Multicellular',
            cost: {
                DNA(){ return 200; }
            },
            effect: 'Decreases cost of producing new nucleus',
            action(){
                if (payCosts(actions.evolution.multicellular.cost)){
                    global.evolution['multicellular'].count++;
                    removeAction(actions.evolution.multicellular.id);
                    global.evolution['final'] = 60;
                    
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
                    evoProgress();
                }
                return false;
            }
        },
        spores: {
            id: 'evo-spores',
            title: 'Spores',
            desc: 'Evolve Spores',
            cost: {
                DNA(){ return 230; }
            },
            effect: 'Increases DNA generation from nucleus',
            action(){
                if (payCosts(actions.evolution.spores.cost)){
                    global.evolution['spores'].count++;
                    removeAction(actions.evolution.spores.id);
                    global.evolution['bryophyte'] = { count: 0 };
                    global.evolution['final'] = 80;
                    addAction('evolution','bryophyte');
                    evoProgress();
                }
                return false;
            }
        },
        poikilohydric: {
            id: 'evo-poikilohydric',
            title: 'Poikilohydric',
            desc: 'Evolve Poikilohydric',
            cost: {
                DNA(){ return 230; }
            },
            effect: 'Increases DNA generation from nucleus',
            action(){
                if (payCosts(actions.evolution.poikilohydric.cost)){
                    global.evolution['poikilohydric'].count++;
                    removeAction(actions.evolution.poikilohydric.id);
                    global.evolution['bryophyte'] = { count: 0 };
                    global.evolution['final'] = 80;
                    addAction('evolution','bryophyte');
                    evoProgress();
                }
                return false;
            }
        },
        bilateral_symmetry: {
            id: 'evo-bilateral_symmetry',
            title: 'Bilateral Symmetry',
            desc: 'Evolve Bilateral Symmetry',
            cost: {
                DNA(){ return 230; }
            },
            effect: 'Increases DNA generation from nucleus',
            action(){
                if (payCosts(actions.evolution.bilateral_symmetry.cost)){
                    global.evolution['bilateral_symmetry'].count++;
                    removeAction(actions.evolution.bilateral_symmetry.id);
                    global.evolution['final'] = 80;
                    
                    global.evolution['athropods'] = { count: 0 };
                    addAction('evolution','athropods');
                    global.evolution['mammals'] = { count: 0 };
                    addAction('evolution','mammals');
                    global.evolution['eggshell'] = { count: 0 };
                    addAction('evolution','eggshell');

                    evoProgress();
                }
                return false;
            }
        },
        bryophyte: {
            id: 'evo-bryophyte',
            title: 'Bryophyte',
            desc: 'Evolve Bryophyte',
            cost: {
                DNA(){ return 260; }
            },
            effect: 'Continue evolving towards sentience',
            action(){
                if (payCosts(actions.evolution.bryophyte.cost)){
                    global.evolution['bryophyte'].count++;
                    removeAction(actions.evolution.bryophyte.id);
                    global.evolution['final'] = 100;
                    
                    global.evolution['sentience'] = { count: 0 };
                    addAction('evolution','sentience');
                    evoProgress();
                }
                return false;
            }
        },
        athropods: {
            id: 'evo-athropods',
            title: 'Arthropods',
            desc: 'Evolve Arthropods',
            cost: {
                DNA(){ return 260; }
            },
            effect: 'Evolve in the direction of arthropods. This is an evolutionary fork.',
            action(){
                if (payCosts(actions.evolution.athropods.cost)){
                    global.evolution['athropods'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    delete global.evolution.mammals;
                    delete global.evolution.eggshell;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    evoProgress();
                }
                return false;
            }
        },
        mammals: {
            id: 'evo-mammals',
            title: 'Mammals',
            desc: 'Evolve Mammals',
            cost: {
                DNA(){ return 245; }
            },
            effect: 'Evolve in the direction of mammals. This is an evolutionary fork.',
            action(){
                if (payCosts(actions.evolution.mammals.cost)){
                    global.evolution['mammals'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    delete global.evolution.athropods;
                    delete global.evolution.eggshell;
                    global.evolution['humanoid'] = { count: 0 };
                    global.evolution['gigantism'] = { count: 0 };
                    global.evolution['dwarfism'] = { count: 0 };
                    global.evolution['animalism'] = { count: 0 };
                    global.evolution['final'] = 90;
                    addAction('evolution','humanoid');
                    addAction('evolution','gigantism');
                    addAction('evolution','dwarfism');
                    addAction('evolution','animalism');
                    evoProgress();
                }
                return false;
            }
        },
        humanoid: {
            id: 'evo-humanoid',
            title: 'Humanoid',
            desc: 'Evolve Humanoid',
            cost: {
                DNA(){ return 260; }
            },
            effect: 'Evolve in the direction of humanoids. This is an evolutionary fork.',
            action(){
                if (payCosts(actions.evolution.humanoid.cost)){
                    global.evolution['humanoid'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    delete global.evolution.gigantism;
                    delete global.evolution.dwarfism;
                    delete global.evolution.animalism;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    evoProgress();
                }
                return false;
            }
        },
        gigantism: {
            id: 'evo-gigantism',
            title: 'Gigantism',
            desc: 'Evolve Gigantism',
            cost: {
                DNA(){ return 260; }
            },
            effect: 'Evolve in the direction of gigantism. This is an evolutionary fork.',
            action(){
                if (payCosts(actions.evolution.gigantism.cost)){
                    global.evolution['gigantism'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    delete global.evolution.humanoid;
                    delete global.evolution.dwarfism;
                    delete global.evolution.animalism;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    evoProgress();
                }
                return false;
            }
        },
        dwarfism: {
            id: 'evo-dwarfism',
            title: 'Dwarfism',
            desc: 'Evolve Dwarfism',
            cost: {
                DNA(){ return 260; }
            },
            effect: 'Evolve in the direction of dwarfism. This is an evolutionary fork.',
            action(){
                if (payCosts(actions.evolution.dwarfism.cost)){
                    global.evolution['dwarfism'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    delete global.evolution.humanoid;
                    delete global.evolution.gigantism;
                    delete global.evolution.animalism;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    evoProgress();
                }
                return false;
            }
        },
        animalism: {
            id: 'evo-animalism',
            title: 'Animalism',
            desc: 'Evolve Animalism',
            cost: {
                DNA(){ return 260; }
            },
            effect: 'Evolve in the direction of animalism. This is an evolutionary fork.',
            action(){
                if (payCosts(actions.evolution.animalism.cost)){
                    global.evolution['animalism'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    delete global.evolution.humanoid;
                    delete global.evolution.gigantism;
                    delete global.evolution.dwarfism;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    evoProgress();
                }
                return false;
            }
        },
        eggshell: {
            id: 'evo-eggshell',
            title: 'Eggshell',
            desc: 'Evolve Eggshell',
            cost: {
                DNA(){ return 245; }
            },
            effect: 'Evolve in the direction of egg laying reproduction. This is an evolutionary fork.',
            action(){
                if (payCosts(actions.evolution.eggshell.cost)){
                    global.evolution['eggshell'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    delete global.evolution.athropods;
                    delete global.evolution.mammals;
                    global.evolution['endothermic'] = { count: 0 };
                    global.evolution['ectothermic'] = { count: 0 };
                    global.evolution['final'] = 90;
                    addAction('evolution','endothermic');
                    addAction('evolution','ectothermic');
                    evoProgress();
                }
                return false;
            }
        },
        endothermic: {
            id: 'evo-endothermic',
            title: 'Endothermic',
            desc: 'Evolve Endothermic',
            cost: {
                DNA(){ return 260; }
            },
            effect: 'Evolve in the direction of avians. This is an evolutionary fork.',
            action(){
                if (payCosts(actions.evolution.endothermic.cost)){
                    global.evolution['endothermic'].count++;
                    removeAction(actions.evolution.endothermic.id);
                    removeAction(actions.evolution.ectothermic.id);
                    delete global.evolution.ectothermic;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    evoProgress();
                }
                return false;
            }
        },
        ectothermic: {
            id: 'evo-ectothermic',
            title: 'Ectothermic',
            desc: 'Evolve Ectothermic',
            cost: {
                DNA(){ return 260; }
            },
            effect: 'Evolve in the direction of reptiles. This is an evolutionary fork.',
            action(){
                if (payCosts(actions.evolution.ectothermic.cost)){
                    global.evolution['ectothermic'].count++;
                    removeAction(actions.evolution.endothermic.id);
                    removeAction(actions.evolution.ectothermic.id);
                    delete global.evolution.endothermic;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    evoProgress();
                }
                return false;
            }
        },
        sentience: {
            id: 'evo-sentience',
            title: 'Sentience',
            desc: 'Evolve Sentience',
            cost: {
                RNA(){ return 300; },
                DNA(){ return 300; }
            },
            effect: 'Complete your evolution by evolving into a species which has achieved sentience',
            action(){
                if (payCosts(actions.evolution.sentience.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    
                    // Trigger Next Phase of game
                    var path = Math.floor(Math.seededRandom(0,100));
                    if (global.evolution['humanoid']){
                        if (path < 33){
                            global.race.species = 'elven';
                        }
                        else if (path < 67){
                            global.race.species = 'orc';
                        }
                        else {
                            global.race.species = 'human';
                        }
                    }
                    else if (global.evolution['gigantism']){
                        if (path < 33){
                            global.race.species = 'troll';
                        }
                        else if (path < 67){
                            global.race.species = 'orge';
                        }
                        else {
                            global.race.species = 'cyclops';
                        }
                    }
                    else if (global.evolution['dwarfism']){
                        if (path < 33){
                            global.race.species = 'kobold';
                        }
                        else if (path < 67){
                            global.race.species = 'goblin';
                        }
                        else {
                            global.race.species = 'gnome';
                        }
                    }
                    else if (global.evolution['animalism']){
                        if (path < 33){
                            global.race.species = 'cath';
                        }
                        else if (path < 67){
                            global.race.species = 'wolven';
                        }
                        else {
                            global.race.species = 'centaur';
                        }
                    }
                    else if (global.evolution['ectothermic']){
                        if (path < 33){
                            global.race.species = 'tortoisan';
                        }
                        else if (path < 67){
                            global.race.species = 'gecko';
                        }
                        else {
                            global.race.species = 'slitheryn';
                        }
                    }
                    else if (global.evolution['endothermic']){
                        if (path < 33){
                            global.race.species = 'arraak';
                        }
                        else if (path < 67){
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
                    else if (global.evolution['chloroplasts']){
                        if (path < 50){
                            global.race.species = 'entish';
                        }
                        else {
                            global.race.species = 'cacti';
                        }
                    }
                    else if (global.evolution['eggshell']){
                        global.race.species = 'dracnid';
                    }
                    else {
                        global.race.species = 'human';
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
                    if (!global.race['kindling_kindred']){
                        global.resource.Lumber.display = true;
                        global.city['lumber'] = 1;
                    }
                    else {
                        global.resource.Stone.display = true;
                        global.city['stone'] = 1;
                    }
                    registerTech('club');
                    
                    global.city.calendar.day = 0;
                    
                    var city_actions = global.race['kindling_kindred'] ? ['food','stone'] : ['food','lumber','stone'];
                    for (var i = 0; i < city_actions.length; i++) {
                        if (global.city[city_actions[i]]){
                            addAction('city',city_actions[i]);
                        }
                    }
                    
                    global.settings.civTabs = 1;
                    global.settings.showEvolve = false;
                    global.settings.showCity = true;
                    
                    if (global.race.gods !== 'none'){
                        global.tech['religion'] = 1;
                    }

                    if (global.genes['evolve'] && global.genes['evolve'] >= 2){
                        randomMinorTrait();
                    }

                    messageQueue(`Congratulations! You have evolved into a ${races[global.race.species].type} species of ${races[global.race.species].entity} called "${races[global.race.species].name}"`);

                    if (global.race['slow'] || global.race['hyper']){
                        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                        window.location.reload();
                    }

                    defineGarrison();
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
            reqs: { primitive: 1 },
            action(){
                if(global['resource']['Food'].amount < global['resource']['Food'].max){
                    modRes('Food',global.race['strong'] ? 2 : 1);
                }
                return false;
            }
        },
        lumber: {
            id: 'city-lumber',
            title: 'Gather Lumber',
            desc: 'Harvest lumber from the forest',
            reqs: {},
            action(){
                if(global['resource']['Lumber'].amount < global['resource']['Lumber'].max){
                    modRes('Lumber',global.race['strong'] ? 2 : 1);
                }
                return false;
            }
        },
        stone: {
            id: 'city-stone',
            title: 'Gather Stone',
            desc: 'Gather stone from a quarry',
            reqs: { primitive: 2 },
            action(){
                if(global['resource']['Stone'].amount < global['resource']['Stone'].max){
                    modRes('Stone',global.race['strong'] ? 2 : 1);
                }
                return false;
            }
        },
        garrison: {
            id: 'city-garrison',
            title: 'Barracks',
            desc: 'Increases soldier capacity',
            reqs: { military: 1, housing: 1 },
            cost: { 
                Money(){ return costMultiplier('garrison', 240, 1.5); },
                Stone(){ return costMultiplier('garrison', 260, 1.45); }
            },
            effect() {
                let bunks = global.tech['military'] >= 5 ? 3 : 2;
                if (global.race['chameleon']){
                    bunks--;
                }
                return `+${bunks} Max Soldiers`;
            },
            action(){
                if (payCosts(actions.city.garrison.cost)){
                    let gain = global.tech['military'] >= 5 ? 3 : 2;
                    if (global.race['chameleon']){
                        gain -= global.city.garrison.count;
                    }
                    global.civic['garrison'].max += gain;
                    global.city['garrison'].count++;
                    global.resource.Furs.display = true;
                    return true;
                }
                return false;
            }
        },
        basic_housing: {
            id: 'city-house',
            title(){
                return basicHousingLabel();
            },
            desc: 'Basic housing for one citizen',
            reqs: { housing: 1 },
            cost: { 
                Money(){ 
                    if (global.city['basic_housing'] && global.city['basic_housing'].count >= 5){ 
                        return costMultiplier('basic_housing', 20, 1.16);
                    } 
                    else { 
                        return 0; 
                    } 
                },
                Lumber(){ return global.race['kindling_kindred'] ? 0 : costMultiplier('basic_housing', 10, 1.22); },
                Stone(){ return global.race['kindling_kindred'] ? costMultiplier('basic_housing', 10, 1.22) : 0; }
            },
            effect: '+1 Max Citizen',
            action(){
                if (payCosts(actions.city.basic_housing.cost)){
                    global['resource'][races[global.race.species].name].display = true;
                    global['resource'][races[global.race.species].name].max += 1;
                    global.city['basic_housing'].count++;
                    global.settings.showCivic = true;
                    return true;
                }
                return false;
            }
        },
        cottage: {
            id: 'city-cottage',
            title: 'Cottage',
            desc: 'Cozy housing for 2 citizens',
            reqs: { housing: 2 },
            cost: { 
                Money(){ return costMultiplier('cottage', 900, 1.15); },
                Plywood(){ return costMultiplier('cottage', 25, 1.25); },
                Brick(){ return costMultiplier('cottage', 20, 1.25); },
                Wrought_Iron(){ return costMultiplier('cottage', 15, 1.25); }
            },
            effect(){
                if (global.tech['home_safe']){
                    let safe = spatialReasoning(1000);
                    return `<div>+2 Max Citizens</div><div>+${safe} Max Money</div>`;
                }
                else {
                    return '+2 Max Citizens';
                }
            },
            action(){
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
            desc: '<div>Housing complex for 5 citizens</div><div>Requires power</div>',
            reqs: { housing: 3 },
            cost: { 
                Money(){ return costMultiplier('apartment', 1750, 1.25) - 500; },
                Furs(){ return costMultiplier('apartment', 725, 1.30) - 500; },
                Copper(){ return costMultiplier('apartment', 650, 1.30) - 500; },
                Cement(){ return costMultiplier('apartment', 700, 1.30) - 500; },
                Steel(){ return costMultiplier('apartment', 800, 1.30) - 500; }
            },
            effect(){
                if (global.tech['home_safe']){
                    let safe = spatialReasoning(2000);
                    return `<div>+5 Max Citizens. -1kW.</div><div>+${safe} Max Money</div>`;
                }
                else {
                    return '+5 Max Citizens. -1kW.';
                }
            },
            powered: 1,
            action(){
                if (payCosts(actions.city.apartment.cost)){
                    global['resource'][races[global.race.species].name].max += 5;
                    global.city['apartment'].count++;
                    if (global.city.power > 0){
                        global.city['apartment'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        lodge: {
            id: 'city-lodge',
            title: 'Lodge',
            desc: 'Increases hunter capacity',
            reqs: { hunting: 2 },
            cost: { 
                Money(){ return costMultiplier('lodge', 50, 1.30); },
                Lumber(){ return costMultiplier('lodge', 20, 1.35); },
                Stone(){ return costMultiplier('lodge', 10, 1.35); }
            },
            effect(){ return '+1 Max Citizen'; },
            action(){
                if (payCosts(actions.city.lodge.cost)){
                    global.city['lodge'].count++;
                    global['resource'][races[global.race.species].name].max += 1;
                    return true;
                }
                return false;
            }
        },
        smokehouse: {
            id: 'city-smokehouse',
            title: 'Smokehouse',
            desc: 'Increases food storage capacity',
            reqs: { hunting: 1 },
            cost: { 
                Money(){ return costMultiplier('smokehouse', 85, 1.30); },
                Lumber(){ return costMultiplier('smokehouse', 65, 1.35) },
                Stone(){ return costMultiplier('smokehouse', 50, 1.35); }
            },
            effect(){ 
                let food = spatialReasoning(500);
                return `+${food} Max Food`; 
            },
            action(){
                if (payCosts(actions.city.smokehouse.cost)){
                    global.city['smokehouse'].count++;
                    global['resource']['Food'].max += spatialReasoning(500);
                    return true;
                }
                return false;
            }
        },
        farm: {
            id: 'city-farm',
            title: 'Farm',
            desc: 'Increases farmer capacity',
            reqs: { agriculture: 1 },
            cost: { 
                Money(){ if (global.city['farm'] && global.city['farm'].count >= 3){ return costMultiplier('farm', 50, 1.30);} else { return 0; } },
                Lumber(){ return costMultiplier('farm', 20, 1.35); },
                Stone(){ return costMultiplier('farm', 10, 1.35); }
            },
            effect(){ return global.tech['farm'] ? '+1 Max Farmers. +1 Max Citizen' : '+1 Max Farmers'; },
            action(){
                if (payCosts(actions.city.farm.cost)){
                    global.city['farm'].count++;
                    global.civic.farmer.display = true;
                    global.civic.farmer.max++;
                    if (global.tech['farm']){
                        global['resource'][races[global.race.species].name].max += 1;
                    }
                    return true;
                }
                return false;
            },
            flair(){ return global.tech.agriculture >= 6 ? '100% Inorganic' : '100% Organic'; }
        },
        mill: {
            id: 'city-mill',
            title(){
                return global.tech['agriculture'] >= 5 ? 'Windmill' : 'Mill';
            },
            desc(){ 
                let bonus = global.tech['agriculture'] >= 5 ? 5 : 3;
                if (global.tech['agriculture'] >= 6){
                    return `+${bonus}% Farmer efficiency OR +1kW`;
                }
                else {
                    return `Increases farmer efficiency by ${bonus}%`;
                }
            },
            reqs: { agriculture: 4 },
            cost: { 
                Money(){ return costMultiplier('mill', 1000, 1.3); },
                Lumber(){ return costMultiplier('mill', 600, 1.32); },
                Iron(){ return costMultiplier('mill', 150, 1.32); },
                Cement(){ return costMultiplier('mill', 125, 1.32); },
            },
            powered: -1,
            power_reqs: { agriculture: 6 },
            action(){
                if (payCosts(actions.city.mill.cost)){
                    global.city['mill'].count++;
                    return true;
                }
                return false;
            },
            effect(){
                if (global.tech['agriculture'] >= 6){
                    return '<span class="has-text-success">ON</span> for power, <span class="has-text-danger">OFF</span> for grain mill.';
                }
                else {
                    return false;
                }
            }
        },
        silo: {
            id: 'city-silo',
            title: 'Grain Silo',
            desc: 'Increases food storage capacity',
            reqs: { agriculture: 3 },
            cost: { 
                Money(){ return costMultiplier('silo', 85, 1.30); },
                Lumber(){ return costMultiplier('silo', 65, 1.35) },
                Stone(){ return costMultiplier('silo', 50, 1.35); }
            },
            effect(){ 
                let food = spatialReasoning(500);
                return `+${food} Max Food`; 
            },
            action(){
                if (payCosts(actions.city.silo.cost)){
                    global.city['silo'].count++;
                    global['resource']['Food'].max += spatialReasoning(500);
                    return true;
                }
                return false;
            }
        },
        shed: {
            id: 'city-shed',
            title(){ 
                return global.tech['storage'] <= 2 ? 'Shed' : (global.tech['storage'] >= 4 ? 'Warehouse' : 'Barn'); 
            },
            desc(){
                let storage = global.tech['storage'] >= 3 ? (global.tech['storage'] >= 4 ? 'large storage' : 'storage') : 'small storage';
                return `A ${storage} facility for your various resources`;
            },
            reqs: { storage: 1 },
            cost: { 
                Money(){ return costMultiplier('shed', 75, 1.2); },
                Lumber(){
                    if (global.tech['storage'] && global.tech['storage'] < 4){ 
                        return costMultiplier('shed', 55, 1.3);
                    }
                    else { 
                        return 0; 
                    }
                },
                Stone(){
                    if (global.tech['storage'] && global.tech['storage'] < 3){ 
                        return costMultiplier('shed', 45, 1.3);
                    }
                    else { 
                        return 0; 
                    }
                },
                Iron(){
                    if (global.tech['storage'] && global.tech['storage'] >= 4){
                        return costMultiplier('shed', 22, 1.3);
                    }
                    else {
                        return 0; 
                    }
                },
                Cement(){ 
                    if (global.tech['storage'] && global.tech['storage'] >= 3){
                        return costMultiplier('shed', 18, 1.3);
                    }
                    else {
                        return 0; 
                    }
                }
            },
            effect(){
                let storage = '';
                let multiplier = storageMultipler();
                if (global.resource.Lumber.display){
                    let val = +(spatialReasoning(200) * multiplier).toFixed(1);
                    storage = storage + `+${val} Max Lumber.`;
                }
                if (global.resource.Stone.display){
                    let val = +(spatialReasoning(200) * multiplier).toFixed(1);
                    storage = storage + `+${val} Max Stone.`;
                }
                if (global.resource.Furs.display){
                    let val = +(spatialReasoning(100) * multiplier).toFixed(1);
                    storage = storage + `+${val} Max Furs.`;
                }
                if (global.resource.Copper.display){
                    let val = +(spatialReasoning(75) * multiplier).toFixed(1);
                    storage = storage + `+${val} Max Copper.`;
                }
                if (global.resource.Iron.display){
                    let val = +(spatialReasoning(100) * multiplier).toFixed(1);
                    storage = storage + `+${val} Max Iron.`;
                }
                if (global.resource.Cement.display){
                    let val = +(spatialReasoning(80) * multiplier).toFixed(1);
                    storage = storage + `+${val} Max Cement.`;
                }
                if (global.resource.Coal.display){
                    let val = +(spatialReasoning(50) * multiplier).toFixed(1);
                    storage = storage + `+${val} Max Coal.`;
                }
                if (global.tech['storage'] >= 3 && global.resource.Steel.display){
                    let val = +(spatialReasoning(25) * multiplier).toFixed(1);
                    storage = storage + `+${val} Max Steel.`;
                }
                if (global.tech['storage'] >= 4 && global.resource.Titanium.display){
                    let val = +(spatialReasoning(10) * multiplier).toFixed(1);
                    storage = storage + `+${val} Max Titanium.`;
                }
                return storage;
            },
            action(){
                if (payCosts(actions.city.shed.cost)){
                    let multiplier = storageMultipler();
                    global['resource']['Lumber'].max += (spatialReasoning(200) * multiplier);
                    global['resource']['Stone'].max += (spatialReasoning(200) * multiplier);
                    global['resource']['Copper'].max += (spatialReasoning(75) * multiplier);
                    global['resource']['Iron'].max += (spatialReasoning(100) * multiplier);
                    global['resource']['Cement'].max += (spatialReasoning(80) * multiplier);
                    global['resource']['Coal'].max += (spatialReasoning(50) * multiplier);
                    if (global.tech['storage'] >= 3){
                        global['resource']['Steel'].max += (global.city['shed'].count * (spatialReasoning(25) * multiplier));
                    }
                    if (global.tech['storage'] >= 4){
                        global['resource']['Titanium'].max += (global.city['shed'].count * (spatialReasoning(10) * multiplier));
                    }
                    global.city['shed'].count++;
                    return true;
                }
                return false;
            }
        },
        storage_yard: {
            id: 'city-storage_yard',
            title: 'Freight Yard',
            desc: 'Increases crate capacity',
            reqs: { container: 1 },
            cost: { 
                Money(){ return costMultiplier('storage_yard', 10, 1.35); },
                Brick(){ return costMultiplier('storage_yard', 3, 1.35); },
                Wrought_Iron(){ return costMultiplier('storage_yard', 5, 1.35); }
            },
            effect(){
                let cap = global.tech.container >= 3 ? 20 : 10;
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    cap *= 2;
                }
                return `+${cap} Max Crates`; 
            },
            action(){
                if (payCosts(actions.city.storage_yard.cost)){
                    if (global.resource.Crates.display === false){
                        messageQueue('You have unlocked a new method of resource management, click the + symbol next to a resource to manage it.','success');
                    }
                    global.city['storage_yard'].count++;
                    global.resource.Crates.display = true;
                    let cap = global.tech.container >= 3 ? 20 : 10;
                    if (global.tech['particles'] && global.tech['particles'] >= 2){
                        cap *= 2;
                    }
                    global.resource.Crates.max += cap;
                    $('#resources').empty();
                    defineResources();
                    return true;
                }
                return false;
            }
        },
        warehouse: {
            id: 'city-warehouse',
            title: 'Container Port',
            desc: 'Increases container capacity',
            reqs: { steel_container: 1 },
            cost: { 
                Money(){ return costMultiplier('warehouse', 400, 1.25); },
                Cement(){ return costMultiplier('warehouse', 75, 1.25); },
                Sheet_Metal(){ return costMultiplier('warehouse', 25, 1.25); }
            },
            effect(){
                let cap = global.tech.steel_container >= 2 ? 20 : 10;
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    cap *= 2;
                }
                return `+${cap} Max Containers`; 
            },
            action(){
                if (payCosts(actions.city.warehouse.cost)){
                    if (global.resource.Containers.display === false){
                        messageQueue('You can now construct containers, click the + symbol next to a resource to manage containers.','success');
                    }
                    global.city['warehouse'].count++;
                    global.resource.Containers.display = true;
                    let cap = global.tech['steel_container'] >= 2 ? 20 : 10;
                    if (global.tech['particles'] && global.tech['particles'] >= 2){
                        cap *= 2;
                    }
                    global.resource.Containers.max += cap;
                    return true;
                }
                return false;
            }
        },
        bank: {
            id: 'city-bank',
            title: 'Bank',
            desc(){
                let planet = races[global.race.species].home;
                return `Bank of ${planet}`;
            },
            reqs: { banking: 1 },
            cost: { 
                Money(){ return costMultiplier('bank', 250, 1.5); },
                Lumber(){ return costMultiplier('bank', 75, 1.30); },
                Stone(){ return costMultiplier('bank', 100, 1.45); }
            },
            effect(){ 
                let vault = 1500;
                if (global.tech['banking'] >= 5){
                    vault = 7500;
                }
                else if (global.tech['banking'] >= 3){
                    vault = 3500;
                }
                if (global.race['paranoid']){
                    vault *= 0.9;
                }
                else if (global.race['hoarder']){
                    vault *= 1.1;
                }
                if (global.tech['banking'] >= 7){
                    vault *= 1 + (global.civic.banker.workers * 0.05);
                }
                if (global.tech['banking'] >= 8){
                    vault += 25 * global.resource[races[global.race.species].name].amount;
                }
                if (global.tech['stock_exchange']){
                    vault *= 1 + (global.tech['stock_exchange'] * 0.1);
                }
                vault = spatialReasoning(vault);
                vault = +(vault).toFixed(0);
                if (global.tech['banking'] >= 2){
                    return `<div>+\$${vault} Max Money</div><div>+1 Max Banker</div>`; 
                }
                else {
                    return `+\$${vault} Max Money.`; 
                }
            },
            action(){
                if (payCosts(actions.city.bank.cost)){
                    global['resource']['Money'].max += 1000;
                    global.city.bank.count++;
                    global.civic.banker.max = global.city.bank.count;
                    return true;
                }
                return false;
            }
        },
        lumber_yard: {
            id: 'city-lumber_yard',
            title: 'Lumber Yard',
            desc: 'Increases lumberjack capacity',
            reqs: { axe: 1 },
            cost: { 
                Money(){ if (global.city['lumber_yard'] && global.city['lumber_yard'].count >= 5){ return costMultiplier('lumber_yard', 5, 1.85);} else { return 0; } },
                Lumber(){ return costMultiplier('lumber_yard', 6, 1.9); },
                Stone(){ return costMultiplier('lumber_yard', 2, 1.95); }
            },
            effect:  function(){
                let lum = spatialReasoning(100);
                return `<div>+2 Max Lumberjacks</div><div>+${lum} Max Lumber</div>`;
            },
            action(){
                if (payCosts(actions.city.lumber_yard.cost)){
                    global.city['lumber_yard'].count++;
                    global.civic.lumberjack.display = true;
                    global.civic.lumberjack.max = global.city.lumber_yard.count * 2;
                    global['resource']['Lumber'].max += spatialReasoning(100);
                    return true;
                }
                return false;
            }
        },
        sawmill: {
            id: 'city-sawmill',
            title: 'Sawmill',
            desc: 'Increases lumber output',
            reqs: { saw: 1 },
            cost: { 
                Money(){ return costMultiplier('sawmill', 3000, 1.25); },
                Iron(){ return costMultiplier('sawmill', 400, 1.25); },
                Cement(){ return costMultiplier('sawmill', 420, 1.25); }
            },
            effect(){
                let impact = global.tech['saw'] >= 2 ? 8 : 5;
                let lum = spatialReasoning(200);
                let desc = `<div>+${lum} Max Lumber</div><div>Lumberjack efficiency +${impact}%</div>`;
                if (global.tech['foundry'] && global.tech['foundry'] >= 4){
                    desc = desc + `<div>+2% Plywood Crafting</div>`; 
                }
                if (global.city.powered){
                    desc = desc + `<div>Each powered sawmill uses 1kW but produces 5% more lumber</div>`; 
                }
                return desc;
            },
            powered: 1,
            action(){
                if (payCosts(actions.city.sawmill.cost)){
                    global.city['sawmill'].count++;
                    let impact = global.tech['saw'] >= 2 ? 0.08 : 0.05;
                    global.civic.lumberjack.impact = (global.city['sawmill'].count * impact) + 1;
                    global['resource']['Lumber'].max += spatialReasoning(200);
                    if (global.city.powered && global.city.power > 0){
                        global.city.sawmill.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        rock_quarry: {
            id: 'city-rock_quarry',
            title: 'Rock Quarry',
            desc: 'Allows workers to quarry for stone',
            reqs: { mining: 1 },
            cost: { 
                Money(){ if (global.city['rock_quarry'] && global.city['rock_quarry'].count >= 2){ return costMultiplier('rock_quarry', 20, 1.45);} else { return 0; } },
                Lumber(){ return costMultiplier('rock_quarry', 50, 1.35); },
                Stone(){ return costMultiplier('rock_quarry', 10, 1.35); }
            },
            effect() {
                let stone = spatialReasoning(100);
                if (global.tech['mine_conveyor']){
                    return `<div>+1 Max Quarry Worker</div><div>+${stone} Max Stone</div><div>If powered consumes 1kW but increases rock yield by 5%</div>`;
                }
                else {
                    return `<div>+1 Max Quarry Worker</div><div>+${stone} Max Stone</div>`;
                }
            },
            powered: 1,
            power_reqs: { mine_conveyor: 1 },
            action(){
                if (payCosts(actions.city.rock_quarry.cost)){
                    global.city['rock_quarry'].count++;
                    global.civic.quarry_worker.display = true;
                    global.civic.quarry_worker.max = global.city.rock_quarry.count;
                    global['resource']['Stone'].max += 100;
                    if (global.tech['mine_conveyor'] && global.city.power > 0){
                        global.city['rock_quarry'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        cement_plant: {
            id: 'city-cement_plant',
            title: 'Cement Factory',
            desc: 'Employs cement plant workers',
            reqs: { cement: 1 },
            cost: { 
                Money(){ return costMultiplier('cement_plant', 3000, 1.5); },
                Lumber(){ return costMultiplier('cement_plant', 1800, 1.35); },
                Stone(){ return costMultiplier('cement_plant', 2000, 1.3); }
            },
            effect: '+2 Max Cement Plant Workers',
            effect() { 
                if (global.tech['cement'] >= 5){
                    return '<div>+2 Max Cement Plant Workers</div><div>If powered consumes 2kW but increases cement production by 5%</div>';
                }
                else {
                    return '+2 Max Cement Plant Workers';
                }
            },
            powered: 2,
            power_reqs: { cement: 5 },
            action(){
                if (payCosts(actions.city.cement_plant.cost)){
                    global.resource.Cement.display = true;
                    global.city.cement_plant.count++;
                    global.civic.cement_worker.display = true;
                    global.civic.cement_worker.max = global.city.cement_plant.count * 2;
                    if (global.tech['cement'] && global.tech['cement'] >= 5 && global.city.power >= 2){
                        global.city['cement_plant'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        foundry: {
            id: 'city-foundry',
            title: 'Foundry',
            desc: 'Manufacture building materials from raw materials',
            reqs: { foundry: 1 },
            cost: {
                Money(){ return costMultiplier('foundry', 750, 1.35); },
                Copper(){ return costMultiplier('foundry', 250, 1.35); },
                Stone(){ return costMultiplier('foundry', 100, 1.35); }
            },
            effect(){
                let desc = `<div>+1 Craftsman</div>`;
                if (global.tech['foundry'] >= 2){
                    let skill = global.tech['foundry'] >= 5 ? 5 : 3;
                    desc = desc + `<div>+${skill}% Crafted Materials</div>`;
                }
                if (global.tech['foundry'] >= 6){
                    desc = desc + `<div>+2% Brick Crafting</div>`;
                }
                return desc;
            },
            action(){
                if (payCosts(actions.city.foundry.cost)){
                    global.city['foundry'].count++;
                    global.civic.craftsman.max++;
                    global.civic.craftsman.display = true;
                    if (!global.race['kindling_kindred']){
                        global.resource.Plywood.display = true;
                    }
                    global.resource.Brick.display = true;
                    if (global.resource.Iron.display){
                        global.resource.Wrought_Iron.display = true;
                    }
                    if (global.tech['smelting'] && global.tech['smelting'] >= 2){
                        global.resource.Sheet_Metal.display = true;
                    }
                    loadFoundry();
                    return true;
                }
                return false;
            }
        },
        factory: {
            id: 'city-factory',
            title: 'Factory',
            desc: 'Produces manufactured goods',
            reqs: { high_tech: 3 },
            cost: { 
                Money(){ return costMultiplier('factory', 25000, 1.3); },
                Cement(){ return costMultiplier('factory', 1000, 1.3); },
                Steel(){ return costMultiplier('factory', 7500, 1.3); },
                Titanium(){ return costMultiplier('factory', 2500, 1.3); }
            },
            effect(){ 
                return `Factories can be used to produce any number of manufactured goods. Uses 3kW per factory.`;
            },
            powered: 3,
            special: true,
            action(){
                if (payCosts(actions.city.factory.cost)){
                    global.city['factory'].count++;
                    global.resource.Alloy.display = true;
                    if (global.city.power > 2){
                        global.city['factory'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        smelter: {
            id: 'city-smelter',
            title: 'Smelter',
            desc: 'Increase iron output',
            reqs: { smelting: 1 },
            cost: { 
                Money(){ return costMultiplier('smelter', 1000, 1.3); },
                Iron(){ return costMultiplier('smelter', 500, 1.32); }
            },
            effect(){ 
                var iron_yield = global.tech['smelting'] >= 3 ? 12 : 10;
                if (global.race['pyrophobia']){
                    iron_yield *= 0.9;
                }
                if (global.tech['smelting'] >= 2){
                    return `Smelters can either increase Iron yield by ${iron_yield}% per smelter or produce Steel by consuming Iron and Coal. Smelters require fuel to operate.`;
                }
                else {
                    return `Smelters increase Iron yield by ${iron_yield}% per smelter but require fuel to operate.`;
                }
            },
            special: true,
            action(){
                if (payCosts(actions.city.smelter.cost)){
                    global.city['smelter'].count++;
                    if (global.race['kindling_kindred']){
                        global.city['smelter'].Coal++;
                    }
                    else {
                        global.city['smelter'].Wood++;
                    }
                    global.city['smelter'].Iron++;
                    return true;
                }
                return false;
            },
            flair: '<div>40% Zinc, 40% Titanium, 30% Iron,<div></div>40% Dolomite, 40% Lead, 0.04% Nickel</div>'
        },
        mine: {
            id: 'city-mine',
            title: 'Mine',
            desc: 'Employs miners',
            reqs: { mining: 2 },
            cost: { 
                Money(){ return costMultiplier('mine', 60, 1.6); },
                Lumber(){ return costMultiplier('mine', 175, 1.35); }
            },
            effect() { 
                if (global.tech['mine_conveyor']){
                    return '<div>+1 Max Miner</div><div>If powered consumes 1kW but increases ore yield by 5%</div>';
                }
                else {
                    return '+1 Max Miner';
                }
            },
            powered: 1,
            power_reqs: { mine_conveyor: 1 },
            action(){
                if (payCosts(actions.city.mine.cost)){
                    global.city['mine'].count++;
                    global.resource.Copper.display = true;
                    global.civic.miner.display = true;
                    global.civic.miner.max = global.city.mine.count;
                    if (global.tech['mine_conveyor'] && global.city.power > 0){
                        global.city['mine'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        coal_mine: {
            id: 'city-coal_mine',
            title: 'Coal Mine',
            desc: 'Employs coal miners',
            reqs: { mining: 4 },
            cost: { 
                Money(){ return costMultiplier('coal_mine', 480, 1.4); },
                Lumber(){ return costMultiplier('coal_mine', 250, 1.35); },
                Wrought_Iron(){ return costMultiplier('coal_mine', 18, 1.35); }
            },
            effect() { 
                if (global.tech['mine_conveyor']){
                    return '<div>+1 Max Coal Miner</div><div>If powered consumes 1kW but increases coal yield by 5%</div>';
                }
                else {
                    return '+1 Max Coal Miner';
                }
            },
            powered: 1,
            power_reqs: { mine_conveyor: 1 },
            action(){
                if (payCosts(actions.city.coal_mine.cost)){
                    global.city['coal_mine'].count++;
                    global.resource.Coal.display = true;
                    global.civic.coal_miner.display = true;
                    global.civic.coal_miner.max = global.city.coal_mine.count;
                    if (global.tech['mine_conveyor'] && global.city.power > 0){
                        global.city['coal_mine'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        oil_well: {
            id: 'city-oil_well',
            title: 'Oil Derrick',
            desc: 'Extract oil from deep underground',
            reqs: { oil: 1 },
            cost: { 
                Money(){ return costMultiplier('oil_well', 5000, 1.5); },
                Cement(){ return costMultiplier('oil_well', 5250, 1.5); },
                Steel(){ return costMultiplier('oil_well', 6000, 1.5); }
            },
            effect() { 
                let oil = global.tech['oil'] >= 4 ? 0.48 : 0.4;
                if (global.tech['oil'] >= 5){
                    oil *= global.tech['oil'] >= 6 ? 1.75 : 1.25;
                }
                let oc = spatialReasoning(500);
                return `+${oil} oil per second. +${oc} Max Oil.`;
            },
            action(){
                if (payCosts(actions.city.oil_well.cost)){
                    global.city['oil_well'].count++;
                    global.resource.Oil.display = true;
                    global['resource']['Oil'].max += spatialReasoning(500);
                    return true;
                }
                return false;
            },
            flair: 'Roxxon'
        },
        oil_depot: {
            id: 'city-oil_depot',
            title: 'Fuel Depot',
            desc: 'Special storage for fuels',
            reqs: { oil: 2 },
            cost: { 
                Money(){ return costMultiplier('oil_depot', 2500, 1.45); },
                Cement(){ return costMultiplier('oil_depot', 3750, 1.45); },
                Sheet_Metal(){ return costMultiplier('oil_depot', 100, 1.45); }
            },
            effect() { 
                let oil = spatialReasoning(1000);
                let effect = `<div>+${oil} Max Oil.</div>`;
                if (global.tech['uranium'] >= 2){
                    let val = spatialReasoning(250);
                    effect = effect + `<div>+${val} Max Uranium.</div>`;
                }
                return effect;
            },
            action(){
                if (payCosts(actions.city.oil_depot.cost)){
                    global.city['oil_depot'].count++;
                    global['resource']['Oil'].max += spatialReasoning(1000);
                    if (global.tech['uranium'] >= 2){
                        global['resource']['Uranium'].max += spatialReasoning(250);
                    }
                    return true;
                }
                return false;
            }
        },
        trade: {
            id: 'city-trade',
            title: 'Trade Post',
            desc: 'Increases trade route capacity',
            reqs: { trade: 1 },
            cost: { 
                Money(){ return costMultiplier('trade', 500, 1.35); },
                Lumber(){ return costMultiplier('trade', 125, 1.35); },
                Stone(){ return costMultiplier('trade', 50, 1.35); },
                Furs(){ return costMultiplier('trade', 65, 1.35); }
            },
            effect(){
                let routes = global.race['xenophobic'] ? global.tech.trade : global.tech.trade + 1;
                return `+${routes} Trade Routes`; 
            },
            action(){
                if (payCosts(actions.city.trade.cost)){
                    global.city['trade'].count++;
                    global.city.market.mtrade += global.race['xenophobic'] ? global.tech.trade : global.tech.trade + 1;
                    if (global.race['resourceful']){
                        global.city.market.mtrade++;
                    }
                    return true;
                }
                return false;
            }
        },
        amphitheatre: {
            id: 'city-amphitheatre',
            title: 'Amphitheatre',
            desc: 'A stage for the performing arts',
            reqs: { theatre: 1 },
            cost: {
                Money(){ return costMultiplier('amphitheatre', 500, 1.55); },
                Lumber(){ return costMultiplier('amphitheatre', 50, 1.75); },
                Stone(){ return costMultiplier('amphitheatre', 200, 1.75); }
            },
            effect: '<div>+1 Max Entertainer</div><div>+1% Max Morale</div>',
            action(){
                if (payCosts(actions.city.amphitheatre.cost)){
                    global.city['amphitheatre'].count++;
                    global.civic.entertainer.max++;
                    global.civic.entertainer.display = true;
                    return true;
                }
                return false;
            },
            flair: `Admission is free, but tomatoes are $9.99 each.`
        },
        temple: {
            id: 'city-temple',
            title: 'Temple',
            desc(){
                let entity = races[global.race.gods.toLowerCase()].entity;
                return `Your race believes it was created by a species of ${entity}. Devote a temple to them.`;
            },
            reqs: { theology: 2 },
            cost: {
                Money(){ return costMultiplier('temple', 50, 1.35); },
                Lumber(){ return costMultiplier('temple', 25, 1.35); },
                Furs(){ return costMultiplier('temple', 15, 1.35); },
                Cement(){ return costMultiplier('temple', 10, 1.35); }
            },
            effect(){
                let plasmid = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 8 : 5;
                if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                    plasmid += +(global.civic.professor.workers * 0.2).toFixed(1);
                }
                let desc = `<div>Increases the production effect of Plasmids by ${plasmid}%.</div>`;
                if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 3){
                    desc = desc + '<div>+1 Trade Route</div>';
                }
                if (global.tech['anthropology'] && global.tech['anthropology'] >= 4){
                    desc = desc + '<div>+2.5% Tax Income</div>';
                }
                return desc;
            },
            action(){
                if (payCosts(actions.city.temple.cost)){
                    global.city['temple'].count++;
                    return true;
                }
                return false;
            }
        },
        university: {
            id: 'city-university',
            title: 'University',
            desc(){
                let planet = races[global.race.species].home;
                return `${planet} University`;
            },
            reqs: { science: 1 },
            cost: {
                Money(){ return costMultiplier('university', 900, 1.5) - 500; },
                Lumber(){ return costMultiplier('university', 500, 1.35) - 200; },
                Stone(){ return costMultiplier('university', 750, 1.35) - 350; }
            },
            effect(){
                let gain = global.tech['science'] && global.tech['science'] >= 8 ? 700 : 500;
                if (global.tech['science'] >= 4){
                    gain *= 1 + (global.city['library'].count * 0.02);
                }
                if (global.race['hard_of_hearing']){
                    gain *= 0.95;
                }
                if (global.tech['supercollider']){
                    let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                    gain *= (global.tech['supercollider'] / ratio) + 1;
                }
                gain = gain.toFixed(0);
                return `<div>+1 Max Professor</div><div>+${gain} Max Knowledge</div>`;
            },
            action(){
                if (payCosts(actions.city.university.cost)){
                    let gain = global.tech['science'] && global.tech['science'] >= 8 ? 700 : 500;
                    if (global.tech['science'] >= 4){
                        gain *= 1 + (global.city['library'].count * 0.02);
                    }
                    if (global.tech['supercollider']){
                        let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                        gain *= (global.tech['supercollider'] / ratio) + 1;
                    }
                    global['resource']['Knowledge'].max += gain;
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
            desc(){
                let planet = races[global.race.species].home;
                return `Library of ${planet}`;
            },
            reqs: { science: 2 },
            cost: {
                Money(){ return costMultiplier('library', 45, 1.2); },
                Furs(){ return costMultiplier('library', 22, 1.20); },
                Plywood(){ return costMultiplier('library', 20, 1.20); },
                Brick(){ return costMultiplier('library', 15, 1.20); }
            },
            effect(){
                let gain = global.race['nearsighted'] ? 110 : 125;
                if (global.tech['science'] && global.tech['science'] >= 8){
                    gain *= 1.4;
                }
                if (global.tech['anthropology'] && global.tech['anthropology'] >= 2){
                    gain *= 1 + (global.city.temple.count * 0.05);
                }
                if (global.tech['science'] && global.tech['science'] >= 5){
                    gain *= 1 + (global.civic.scientist.workers * 0.12);
                }
                gain = +(gain).toFixed(1);
                return `<div>+${gain} Max Knowledge</div><div>+5% Knowledge Production</div>`; 
            },
            action(){
                if (payCosts(actions.city.library.cost)){
                    global['resource']['Knowledge'].max += global.race['nearsighted'] ? 110 : 125;
                    global.city.library.count++;
                    if (global.tech['science'] && global.tech['science'] >= 3){
                        global.civic.professor.impact = 0.5 + (global.city.library.count * 0.01)
                    }
                    return true;
                }
                return false;
            },
            flair: 'No bonfires please'
        },
        wardenclyffe: {
            id: 'city-wardenclyffe',
            title: 'Wardenclyffe',
            desc: 'Advanced science facility',
            reqs: { high_tech: 1 },
            cost: { 
                Money(){ return costMultiplier('wardenclyffe', 5000, 1.2); },
                Knowledge(){ return costMultiplier('wardenclyffe', 1000, 1.2); },
                Copper(){ return costMultiplier('wardenclyffe', 500, 1.2); },
                Cement(){ return costMultiplier('wardenclyffe', 350, 1.2); },
                Sheet_Metal(){ return costMultiplier('wardenclyffe', 125, 1.2); }
            },
            effect(){
                let gain = 1000;
                if (global.tech['supercollider']){
                    let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                    gain *= (global.tech['supercollider'] / ratio) + 1;
                }
                if (global.city.powered){
                    let pgain = global.tech['science'] >= 7 ? 2500 : 2000;
                    if (global.tech['supercollider']){
                        let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                        pgain *= (global.tech['supercollider'] / ratio) + 1;
                    }
                    let desc = `<div>+1 Max Scientist</div><div>+${gain} Max Knowledge</div>`;
                    if (global.tech['broadcast']){
                        let morale = global.tech['broadcast'];
                        desc = desc + `<div>If powered uses 2kW but increases its Max Knowledge to ${pgain} and morale by ${morale}%</div>`
                    }
                    else {
                        desc = desc + `<div>If powered uses 2kW but increases its Max Knowledge to ${pgain}</div>`;
                    }
                    return desc;
                }
                else {
                    return `<div>+1 Max Scientist</div><div>+${gain} Max Knowledge</div>`;
                }
            },
            powered: 2,
            action(){
                if (payCosts(actions.city.wardenclyffe.cost)){
                    let gain = 1000;
                    global.city.wardenclyffe.count++;
                    global.civic.scientist.display = true;
                    global.civic.scientist.max = global.city.wardenclyffe.count;
                    if (global.city.powered && global.city.power >= 2){
                        global.city.wardenclyffe.on++;
                        gain = global.tech['science'] >= 7 ? 2500 : 2000;
                    }
                    if (global.tech['supercollider']){
                        let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                        gain *= (global.tech['supercollider'] / ratio) + 1;
                    }
                    global['resource']['Knowledge'].max += gain;
                    return true;
                }
                return false;
            },
            flair: `<div>I don't care that they stole my idea...</div><div>I care that they don't have any of their own.</div>`
        },
        biolab: {
            id: 'city-biolab',
            title: 'Bioscience Lab',
            desc: '<div>Bioscience Labratory</div><div>Requires Power</div>',
            reqs: { genetics: 1 },
            cost: { 
                Money(){ return costMultiplier('biolab', 25000, 1.28); },
                Knowledge(){ return costMultiplier('biolab', 5000, 1.28); },
                Copper(){ return costMultiplier('biolab', 1250, 1.28); },
                Alloy(){ return costMultiplier('biolab', 350, 1.28); }
            },
            effect(){
                let gain = 3000;
                return `+${gain} Max Knowledge, -2kW`;
            },
            powered: 2,
            action(){
                if (payCosts(actions.city.biolab.cost)){
                    global.city.biolab.count++;
                    if (global.city.powered && global.city.power >= 2){
                        global.resource.Knowledge.max += 3000;
                        global.city.biolab.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        coal_power: {
            id: 'city-coal_power',
            title: 'Coal Powerplant',
            desc: 'Generates electricity from coal',
            reqs: { high_tech: 2 },
            cost: { 
                Money(){ return costMultiplier('coal_power', 10000, 1.2); },
                Copper(){ return costMultiplier('coal_power', 1800, 1.2) - 1000; },
                Cement(){ return costMultiplier('coal_power', 600, 1.2); },
                Steel(){ return costMultiplier('coal_power', 2000, 1.2) - 1000; }
            },
            effect(){
                let consume = 0.35;
                return `+5kW. -${consume} Coal per second.`;
            },
            powered: -5,
            action(){
                if (payCosts(actions.city.coal_power.cost)){
                    global.city.coal_power.count++;
                    global.city.coal_power.on++;
                    global.city.power += 5;
                    return true;
                }
                return false;
            }
        },
        oil_power: {
            id: 'city-oil_power',
            title: 'Oil Powerplant',
            desc: 'Generates electricity from oil',
            reqs: { oil: 3 },
            cost: { 
                Money(){ return costMultiplier('oil_power', 50000, 1.2); },
                Copper(){ return costMultiplier('oil_power', 6500, 1.2) + 1000; },
                Cement(){ return costMultiplier('oil_power', 5600, 1.2) + 1000; },
                Steel(){ return costMultiplier('oil_power', 9000, 1.2) + 3000; }
            },
            effect(){
                let consume = 0.65;
                return `+6kW. -${consume} Oil per second.`;
            },
            powered: -6,
            action(){
                if (payCosts(actions.city.oil_power.cost)){
                    global.city.oil_power.count++;
                    global.city.oil_power.on++;
                    global.city.power += 6;
                    return true;
                }
                return false;
            }
        },
        fission_power: {
            id: 'city-fission_power',
            title: 'Fission Reactor',
            desc: 'Uses nuclear fission to generate large amounts of power',
            reqs: { high_tech: 5 },
            cost: { 
                Money(){ return costMultiplier('fission_power', 250000, 1.35); },
                Copper(){ return costMultiplier('fission_power', 13500, 1.35); },
                Cement(){ return costMultiplier('fission_power', 10800, 1.35); },
                Titanium(){ return costMultiplier('fission_power', 7500, 1.35); }
            },
            effect(){
                let consume = 0.1;
                return `+14kW. -${consume} Uranium per second.`;
            },
            powered: -14,
            action(){
                if (payCosts(actions.city.fission_power.cost)){
                    global.city.fission_power.count++;
                    global.city.fission_power.on++;
                    global.city.power += 14;
                    return true;
                }
                return false;
            }
        }
    },
    tech: {
        club: {
            id: 'tech-club',
            title: 'Club',
            desc: 'Make a basic club',
            reqs: {},
            grant: ['primitive',1],
            cost: {
                Lumber(){ return global.race['kindling_kindred'] ? 0 : 5; },
                Stone(){ return global.race['kindling_kindred'] ? 5 : 0; }
            },
            action(){
                if (payCosts(actions.tech.club.cost)){
                    global.resource.Food.display = true;
                    return true;
                }
                return false;
            }
        },
        bone_tools: {
            id: 'tech-bone_tools',
            title: 'Bone Tools',
            desc: 'Create tools out of animal bones',
            reqs: { primitive: 1 },
            grant: ['primitive',2],
            cost: {
                Food(){ return 10; }
            },
            action(){
                if (payCosts(actions.tech.bone_tools.cost)){
                    global.resource.Stone.display = true;
                    return true;
                }
                return false;
            }
        },
        sundial: {
            id: 'tech-sundial',
            title: 'Sundial',
            desc: 'Construct a sundial',
            reqs: { primitive: 2 },
            grant: ['primitive',3],
            cost: {
                Lumber(){ return 8; },
                Stone(){ return 10; }
            },
            effect: 'Start tracking the days and begin building a settlement.',
            action(){
                if (payCosts(actions.tech.sundial.cost)){
                    global.resource.Knowledge.display = true;
                    global.city.calendar.day++;
                    return true;
                }
                return false;
            }
        },
        housing: {
            id: 'tech-housing',
            title: 'Housing',
            desc: 'Discover Housing',
            reqs: { primitive: 3 },
            grant: ['housing',1],
            cost: { 
                Knowledge(){ return 10; }
            },
            effect: 'Learn to construct basic housing for your citizens.',
            action(){
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
                Knowledge(){ return 3600; }
            },
            effect: 'Learn to construct more comfortable housing for couples.',
            action(){
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
                Knowledge(){ return 15750; }
            },
            effect: 'Design high occupancy housing complexes.',
            action(){
                if (payCosts(actions.tech.apartment.cost)){
                    global.city['apartment'] = {
                        count: 0,
                        on: 0
                    };
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
                Knowledge(){ return 11250; },
                Steel(){ return 2500; }
            },
            effect(){
                let label = basicHousingLabel();
                return `Reduce material costs of ${label}s and Cottages by introducing strong steel beams.`;
            },
            action(){
                if (payCosts(actions.tech.steel_beams.cost)){
                    return true;
                }
                return false;
            }
        },
        aphrodisiac: {
            id: 'tech-aphrodisiac',
            title: 'Aphrodisiac',
            desc: 'Study population growth and how to enhance it',
            reqs: { housing: 2 },
            grant: ['reproduction',1],
            cost: { 
                Knowledge(){ return 4500; }
            },
            effect: 'Develop a substance that aids with population growth.',
            action(){
                if (payCosts(actions.tech.aphrodisiac.cost)){
                    return true;
                }
                return false;
            }
        },
        smokehouse: {
            id: 'tech-smokehouse',
            title: 'Smokehouse',
            desc: 'Devise a method of preserving meat',
            reqs: { primitive: 3, storage: 1 },
            grant: ['hunting',1],
            cost: { 
                Knowledge(){ return 80; }
            },
            effect: 'Creates plans for a long term storage medium for meat.',
            action(){
                if (payCosts(actions.tech.smokehouse.cost)){
                    global.city['smokehouse'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        lodge: {
            id: 'tech-lodge',
            title: 'Hunting Lodge',
            desc: 'Hunting Lodge',
            reqs: { hunting: 1, housing: 1, currency: 1 },
            grant: ['hunting',2],
            cost: {
                Knowledge(){ return 180; }
            },
            effect: 'Design a hunting lodge to help bolster your food income.',
            action(){
                if (payCosts(actions.tech.lodge.cost)){
                    global.city['lodge'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        agriculture: {
            id: 'tech-agriculture',
            title: 'Agriculture',
            desc: 'Discover the basics of agriculture',
            reqs: { primitive: 3 },
            grant: ['agriculture',1],
            cost: { 
                Knowledge(){ return 10; }
            },
            effect: 'Learn to plant crops and harvest them for food.',
            action(){
                if (payCosts(actions.tech.agriculture.cost)){
                    global.city['farm'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        farm_house: {
            id: 'tech-farm_house',
            title: 'Farm Houses',
            desc: 'Add a house to every farm',
            reqs: { agriculture: 1, housing: 1, currency: 1 },
            grant: ['farm',1],
            cost: {
                Money(){ return 50; },
                Knowledge(){ return 180; }
            },
            effect: 'Learn the joys of a short commute by living at work!',
            action(){
                if (payCosts(actions.tech.farm_house.cost)){
                    return true;
                }
                return false;
            }
        },
        irrigation: {
            id: 'tech-irrigation',
            title: 'Irrigation',
            desc: 'Discover the benefits of irrigation',
            reqs: { agriculture: 1 },
            grant: ['agriculture',2],
            cost: { 
                Knowledge(){ return 55; }
            },
            effect: 'Increase farm efficiency by 66% with irrigation.',
            action(){
                if (payCosts(actions.tech.irrigation.cost)){
                    global.civic.farmer.impact = 2.5;
                    return true;
                }
                return false;
            }
        },
        silo: {
            id: 'tech-silo',
            title: 'Grain Silo',
            desc: 'Devise a structure to house grain',
            reqs: { agriculture: 2, storage: 1 },
            grant: ['agriculture',3],
            cost: { 
                Knowledge(){ return 80; }
            },
            effect: 'Creates plans for a storage medium for food.',
            action(){
                if (payCosts(actions.tech.silo.cost)){
                    global.city['silo'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        mill: {
            id: 'tech-mill',
            title: 'Grain Mill',
            desc: 'Develop mills to increase food production',
            reqs: { agriculture: 3, mining: 3 },
            grant: ['agriculture',4],
            cost: { 
                Knowledge(){ return 5400; }
            },
            effect: 'Creates plans for a grain mill, grain mills boost farm effectiveness.',
            action(){
                if (payCosts(actions.tech.mill.cost)){
                    global.city['mill'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        windmill: {
            id: 'tech-windmill',
            title: 'Windmill',
            desc: 'Upgrade your grain mills with windmill sail',
            reqs: { agriculture: 4, high_tech: 1 },
            grant: ['agriculture',5],
            cost: { 
                Knowledge(){ return 16200; }
            },
            effect: 'Add a windmill sail to your grain mills, boosts the effectiveness of mills.',
            action(){
                if (payCosts(actions.tech.windmill.cost)){
                    return true;
                }
                return false;
            }
        },
        windturbine: {
            id: 'tech-windturbine',
            title: 'Wind Turbine',
            desc: 'Wind Turbine',
            reqs: { agriculture: 5, high_tech: 4 },
            grant: ['agriculture',6],
            cost: { 
                Knowledge(){ return 66000; }
            },
            effect: 'Add a turbine to your windmills allowing you to use them for power instead of milling.',
            action(){
                if (payCosts(actions.tech.windturbine.cost)){
                    return true;
                }
                return false;
            }
        },
        gmfood: {
            id: 'tech-gmfood',
            title: 'GM Food',
            desc: 'Genetically Modified Food',
            reqs: { agriculture: 6, genetics: 1 },
            grant: ['agriculture',7],
            cost: { 
                Knowledge(){ return 95000; }
            },
            effect: 'Genetically modify your crops to yield more usable food.',
            action(){
                if (payCosts(actions.tech.gmfood.cost)){
                    return true;
                }
                return false;
            }
        },
        foundry: {
            id: 'tech-foundry',
            title: 'Foundry',
            desc: 'Foundry',
            reqs: { mining: 1, cement: 1 },
            grant: ['foundry',1],
            cost: {
                Knowledge(){ return 650; }
            },
            effect: 'Design the foundry, a place for craftsman to produce manufactured materials.',
            action(){
                if (payCosts(actions.tech.foundry.cost)){
                    global.city['foundry'] = {
                        count: 0,
                        crafting: 0,
                        Plywood: 0,
                        Brick: 0,
                        Bronze: 0,
                        Wrought_Iron: 0,
                        Sheet_Metal: 0
                    };
                    return true;
                }
                return false;
            }
        },
        artisans: {
            id: 'tech-artisans',
            title: 'Artisans',
            desc: 'Artisans',
            reqs: { foundry: 1 },
            grant: ['foundry',2],
            cost: {
                Knowledge(){ return 1500; }
            },
            effect: 'Craftsman produce an extra 3% for each Foundry.',
            action(){
                if (payCosts(actions.tech.artisans.cost)){
                    return true;
                }
                return false;
            }
        },
        apprentices: {
            id: 'tech-apprentices',
            title: 'Apprentices',
            desc: 'Foundry',
            reqs: { foundry: 2 },
            grant: ['foundry',3],
            cost: {
                Knowledge(){ return 3200; }
            },
            effect: 'Each craftsman beyond the first assigned to a resource increases production of that resource by 3%.',
            action(){
                if (payCosts(actions.tech.apprentices.cost)){
                    return true;
                }
                return false;
            }
        },
        carpentry: {
            id: 'tech-carpentry',
            title: 'Carpentry',
            desc: 'Carpentry',
            reqs: { foundry: 3, saw: 1 },
            grant: ['foundry',4],
            cost: {
                Knowledge(){ return 5200; }
            },
            effect: 'Sawmills increase Plywood production by 2%.',
            action(){
                if (payCosts(actions.tech.carpentry.cost)){
                    return true;
                }
                return false;
            }
        },
        master_craftsman: {
            id: 'tech-master_craftsman',
            title: 'Master Craftsman',
            desc: 'Master Craftsman',
            reqs: { foundry: 4 },
            grant: ['foundry',5],
            cost: {
                Knowledge(){ return 12000; }
            },
            effect: 'Craftsman produce an extra 5% for each Foundry.',
            action(){
                if (payCosts(actions.tech.master_craftsman.cost)){
                    return true;
                }
                return false;
            }
        },
        brickworks: {
            id: 'tech-brickworks',
            title: 'Brickworks',
            desc: 'Brickworks',
            reqs: { foundry: 5 },
            grant: ['foundry',6],
            cost: {
                Knowledge(){ return 18500; }
            },
            effect: 'New specialied brickmaking equipment adds an extra 2% bonus to brick crafting per foundry.',
            action(){
                if (payCosts(actions.tech.brickworks.cost)){
                    return true;
                }
                return false;
            }
        },
        theatre: {
            id: 'tech-theatre',
            title: 'Theatre',
            desc: 'Theatre',
            reqs: { housing: 1, currency: 1, cement: 1 },
            grant: ['theatre',1],
            cost: {
                Knowledge(){ return 750; }
            },
            effect: 'Design a space for shows to help uplift your spirits.',
            action(){
                if (payCosts(actions.tech.theatre.cost)){
                    global.city['amphitheatre'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        playwright: {
            id: 'tech-playwright',
            title: 'Playwright',
            desc: 'Playwright',
            reqs: { theatre: 1, science: 2 },
            grant: ['theatre',2],
            cost: {
                Knowledge(){ return 1080; }
            },
            effect: 'Playwrights will increase the quality of entertainment increasing the effectiveness of entertainers.',
            action(){
                if (payCosts(actions.tech.playwright.cost)){
                    return true;
                }
                return false;
            }
        },
        magic: {
            id: 'tech-magic',
            title: 'Techno Wizards',
            desc: 'Techno Wizards',
            reqs: { theatre: 2, high_tech: 1 },
            grant: ['theatre',3],
            cost: {
                Knowledge(){ return 7920; }
            },
            effect: 'Techno Wizards are a new type of stage performer that uses technology to preform "Magic". Increases effectiveness of entertainers.',
            action(){
                if (payCosts(actions.tech.magic.cost)){
                    return true;
                }
                return false;
            }
        },
        radio: {
            id: 'tech-radio',
            title: 'Radio',
            desc: 'Radio',
            reqs: { theatre: 3, high_tech: 2 },
            grant: ['broadcast',1],
            cost: {
                Knowledge(){ return 16200; }
            },
            effect: 'Powered Wardenclyffe towers broadcast radio signals which help entertain your citizens.',
            action(){
                if (payCosts(actions.tech.radio.cost)){
                    return true;
                }
                return false;
            }
        },
        tv: {
            id: 'tech-tv',
            title: 'Television',
            desc: 'Television',
            reqs: { broadcast: 1, high_tech: 4 },
            grant: ['broadcast',2],
            cost: {
                Knowledge(){ return 67500; }
            },
            effect: 'New broadcast TV signals double the entertainment value of Wardenclyffe towers.',
            action(){
                if (payCosts(actions.tech.tv.cost)){
                    return true;
                }
                return false;
            }
        },
        mining: {
            id: 'tech-mining',
            title: 'Mining',
            desc: 'Learn the basics of mining',
            reqs: { primitive: 3 },
            grant: ['mining',1],
            cost: { 
                Knowledge(){ return 45; }
            },
            effect: 'Learn how to dig up stone slabs from a quarry.',
            action(){
                if (payCosts(actions.tech.mining.cost)){
                    global.city['rock_quarry'] = { 
                        count: 0, 
                        on: 0 
                    };
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
                Knowledge(){ return 4050; }
            },
            effect: 'Learn advanced techniques for smelting ore that will increase yield.',
            action(){
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
            reqs: { smelting: 1, mining: 4 },
            grant: ['smelting',2],
            cost: { 
                Knowledge(){ return 4950; },
                Steel(){ return 25; }
            },
            effect: 'Upgrade your smelters so they can produce steel.',
            action(){
                if (payCosts(actions.tech.steel.cost)){
                    global.resource.Steel.display = true;
                    global.resource.Sheet_Metal.display = true;
                    loadFoundry();
                    return true;
                }
                return false;
            }
        },
        blast_furnace: {
            id: 'tech-blast_furnace',
            title: 'Blast Furnace',
            desc: 'Blast Furnace',
            reqs: { smelting: 2 },
            grant: ['smelting',3],
            cost: { 
                Knowledge(){ return 13500; },
                Coal(){ return 2000; }
            },
            effect: 'Increases Iron output of smelters by 20%',
            action(){
                if (payCosts(actions.tech.blast_furnace.cost)){
                    return true;
                }
                return false;
            }
        },
        bessemer_process: {
            id: 'tech-bessemer_process',
            title: 'Bessemer Process',
            desc: 'Bessemer Process',
            reqs: { smelting: 3 },
            grant: ['smelting',4],
            cost: { 
                Knowledge(){ return 19800; },
                Coal(){ return 5000; }
            },
            effect: 'Increases Steel output of smelters by 20%',
            action(){
                if (payCosts(actions.tech.bessemer_process.cost)){
                    return true;
                }
                return false;
            }
        },
        oxygen_converter: {
            id: 'tech-oxygen_converter',
            title: 'Oxygen Converter',
            desc: 'Oxygen Converter',
            reqs: { smelting: 4, high_tech: 3 },
            grant: ['smelting',5],
            cost: { 
                Knowledge(){ return 46800; },
                Coal(){ return 10000; }
            },
            effect: 'Increases Steel output of smelters by 20%',
            action(){
                if (payCosts(actions.tech.oxygen_converter.cost)){
                    return true;
                }
                return false;
            }
        },
        electric_arc_furnace: {
            id: 'tech-electric_arc_furnace',
            title: 'Electric Arc Furnace',
            desc: 'Electric Arc Furnace',
            reqs: { smelting: 5, high_tech: 4 },
            grant: ['smelting',6],
            cost: { 
                Knowledge(){ return 85500; },
                Copper(){ return 25000; }
            },
            effect: 'Increases Steel output of smelters by 20%',
            action(){
                if (payCosts(actions.tech.electric_arc_furnace.cost)){
                    return true;
                }
                return false;
            }
        },
        rotary_kiln: {
            id: 'tech-rotary_kiln',
            title: 'Rotary Kiln',
            desc: 'Rotary Kiln',
            reqs: { smelting: 3, high_tech: 3 },
            grant: ['copper',1],
            cost: { 
                Knowledge(){ return 57600; },
                Coal(){ return 8000; }
            },
            effect: 'Advanced smelting processes improve copper refinement by 20%',
            action(){
                if (payCosts(actions.tech.rotary_kiln.cost)){
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
                Knowledge(){ return 350; }
            },
            effect: 'Learn how to mine and refine copper into a pure form.',
            action(){
                if (payCosts(actions.tech.metal_working.cost)){
                    global.city['mine'] = {
                        count: 0,
                        on: 0
                    };
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
                Knowledge(){ return 2500; }
            },
            effect: 'Learn how to extract iron ore from mines.',
            action(){
                if (payCosts(actions.tech.iron_mining.cost)){
                    global.resource.Iron.display = true;
                    if (global.city['foundry'] && global.city['foundry'].count > 0){
                        global.resource.Wrought_Iron.display = true;
                        loadFoundry();
                    }
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
                Knowledge(){ return 4320; }
            },
            effect: 'Learn about how coal can be used as a resource.',
            action(){
                if (payCosts(actions.tech.coal_mining.cost)){
                    global.city['coal_mine'] = {
                        count: 0,
                        on: 0
                    };
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
            reqs: { primitive: 3, currency: 1 },
            grant: ['storage',1],
            cost: { 
                Knowledge(){ return 20; }
            },
            effect: 'Designs a small storage shed.',
            action(){
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
                Money(){ return 3750; },
                Knowledge(){ return 2250; },
                Iron(){ return 750; },
                Cement(){ return 500; }
            },
            effect: 'Reinforce your sheds with newer materials to increase storage capacity.',
            action(){
                if (payCosts(actions.tech.reinforced_shed.cost)){
                    return true;
                }
                return false;
            }
        },
        barns: {
            id: 'tech-barns',
            title: 'Barns',
            desc: 'Replace sheds with barns',
            reqs: { storage: 2, smelting: 2 },
            grant: ['storage',3],
            cost: {
                Knowledge(){ return 15750; },
                Steel(){ return 5000; }
            },
            effect: 'Replace smaller storage sheds with larger storage barns, a 100% increase in storage capactiy.',
            action(){
                if (payCosts(actions.tech.barns.cost)){
                    return true;
                }
                return false;
            }
        },
        warehouse: {
            id: 'tech-warehouse',
            title: 'Warehouse',
            desc: 'Replace barns with warehouses',
            reqs: { high_tech: 3, smelting: 2 },
            grant: ['storage',4],
            cost: {
                Knowledge(){ return 40500; },
                Titanium(){ return 3000; }
            },
            effect: 'Replace your barns with huge storage facilities known as "warehouses".',
            action(){
                if (payCosts(actions.tech.warehouse.cost)){
                    return true;
                }
                return false;
            }
        },
        cameras: {
            id: 'tech-cameras',
            title: 'Security Cameras',
            desc: 'Upgrade warehouses with cameras',
            reqs: { high_tech: 4 },
            grant: ['storage',5],
            cost: {
                Money(){ return 90000; },
                Knowledge(){ return 65000; }
            },
            effect: 'Security cameras make monitoring large storage spaces easier, increasing storage potential.',
            action(){
                if (payCosts(actions.tech.cameras.cost)){
                    return true;
                }
                return false;
            }
        },
        pocket_dimensions: {
            id: 'tech-pocket_dimensions',
            title: 'Pocket Dimensions',
            desc: 'Learn to create interior spaces that are larger than exterior spaces.',
            reqs: { particles: 1, storage: 5 },
            grant: ['storage',6],
            cost: {
                Knowledge(){ return 108000; }
            },
            effect: 'The ultimate upgrade for warehouses. Extra supercollider levels will increase the effectiveness of this technology.',
            action(){
                if (payCosts(actions.tech.pocket_dimensions.cost)){
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
                Knowledge(){ return 2700; }
            },
            effect: 'Designs a scalable storage solution for all your storage needs.',
            action(){
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
                Knowledge(){ return 6750; },
                Sheet_Metal(){ return 100; }
            },
            effect: 'Upgrade wooden crates by reinforcing them with steel.',
            action(){
                if (payCosts(actions.tech.reinforced_crates.cost)){
                    return true;
                }
                return false;
            }
        },
        cranes: {
            id: 'tech-cranes',
            title: 'Cranes',
            desc: 'Freight Cranes',
            reqs: { container: 2, high_tech: 2 },
            grant: ['container',3],
            cost: { 
                Knowledge(){ return 18000; },
                Copper(){ return 1000; },
                Steel(){ return 2500; }
            },
            effect: 'Upgrade your freight yards with cranes, doubling the amount of crates that can be stored in each yard.',
            action(){
                if (payCosts(actions.tech.cranes.cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_crates: {
            id: 'tech-titanium_crates',
            title: 'Titanium Banded Crates',
            desc: 'Titanium Banded Crates',
            reqs: { container: 3, titanium: 1 },
            grant: ['container',4],
            cost: { 
                Knowledge(){ return 67500; },
                Titanium(){ return 1000; }
            },
            effect: 'Increase the maximum load of crates by adding strong titanium bands.',
            action(){
                if (payCosts(actions.tech.titanium_crates.cost)){
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
                Knowledge(){ return 9000; },
                Sheet_Metal(){ return 200; }
            },
            effect: 'Replace cheap wooden crates with more durable steel containers.',
            action(){
                if (payCosts(actions.tech.steel_containers.cost)){
                    global.city['warehouse'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        gantry_crane: {
            id: 'tech-gantry_crane',
            title: 'Gantry Cranes',
            desc: 'Add gantry cranes to container ports',
            reqs: { steel_container: 1, high_tech: 2 },
            grant: ['steel_container',2],
            cost: { 
                Knowledge(){ return 22500; },
                Steel(){ return 5000; }
            },
            effect: 'Upgrade your container ports with gantry cranes. This doubles the number of containers that can be stored at each port.',
            action(){
                if (payCosts(actions.tech.gantry_crane.cost)){
                    return true;
                }
                return false;
            }
        },
        alloy_containers: {
            id: 'tech-alloy_containers',
            title: 'Alloy Containers',
            desc: 'New larger containers made from alloy',
            reqs: { steel_container: 2, storage: 4 },
            grant: ['steel_container',3],
            cost: { 
                Knowledge(){ return 49500; },
                Alloy(){ return 2500; }
            },
            effect: 'Increase container capacity by 50% with new alloy containers.',
            action(){
                if (payCosts(actions.tech.alloy_containers.cost)){
                    return true;
                }
                return false;
            }
        },
        currency: {
            id: 'tech-currency',
            title: 'Currency',
            desc: 'Invent the concept of currency',
            reqs: { housing: 1 },
            grant: ['currency',1],
            cost: { 
                Knowledge(){ return 22; },
                Lumber(){ return 10; } 
            },
            effect: 'Unlocks currency, an important step in developing a society. Also creates taxes, not quite as popular with the public.',
            action(){
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
                Knowledge(){ return 1800; }
            },
            effect: 'Opens a commodities market where you can buy and sell resources.',
            action(){
                if (payCosts(actions.tech.market.cost)){
                    global.settings.showMarket = true;
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
                Knowledge(){ return 3375; }
            },
            effect: 'Allows government to adjust the tax rate.',
            action(){
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
                Knowledge(){ return 6750; }
            },
            effect: 'Upgrades the commodities market to allow for buying and selling at higher volumes.',
            action(){
                if (payCosts(actions.tech.large_trades.cost)){
                    var tech = actions.tech.large_trades.grant[0];
                    global.tech[tech] = actions.tech.large_trades.grant[1];
                    loadMarket();
                    return true;
                }
                return false;
            }
        },
        corruption: {
            id: 'tech-corruption',
            title: 'Corrupt Politicians',
            desc: 'Enable Extreme Taxes',
            reqs: { currency: 4, high_tech: 3 },
            grant: ['currency',5],
            cost: { 
                Knowledge(){ return 36000; }
            },
            effect: 'Corrupt politicians enable the setting of extreme tax strategies.',
            action(){
                if (payCosts(actions.tech.corruption.cost)){
                    return true;
                }
                return false;
            }
        },
        massive_trades: {
            id: 'tech-massive_trades',
            title: 'Massive Volume Trading',
            desc: 'Upgrades marketplace for massive orders',
            reqs: { currency: 5, high_tech: 4 },
            grant: ['currency',6],
            cost: { 
                Knowledge(){ return 108000; }
            },
            effect: 'Upgrades the commodities market to allow for buying and selling at very high volumes.',
            action(){
                if (payCosts(actions.tech.massive_trades.cost)){
                    var tech = actions.tech.massive_trades.grant[0];
                    global.tech[tech] = actions.tech.massive_trades.grant[1];
                    loadMarket();
                    return true;
                }
                return false;
            }
        },
        trade: {
            id: 'tech-trade',
            title: 'Trade Routes',
            desc: 'Establish trade routes',
            reqs: { currency: 2, military: 1 },
            grant: ['trade',1],
            cost: { 
                Knowledge(){ return 4500; }
            },
            effect: 'Create trade routes with your neighbors.',
            action(){
                if (payCosts(actions.tech.trade.cost)){
                    global.city['trade'] = { count: 0 };
                    global.city.market.active = true;
                    return true;
                }
                return false;
            }
        },
        diplomacy: {
            id: 'tech-diplomacy',
            title: 'Diplomacy',
            desc: 'Negotiate new trade routes',
            reqs: { trade: 1, high_tech: 1 },
            grant: ['trade',2],
            cost: { 
                Knowledge(){ return 16200; }
            },
            effect: 'Increase the effectiveness of each trade post by 1.',
            action(){
                if (payCosts(actions.tech.diplomacy.cost)){
                    return true;
                }
                return false;
            }
        },
        freight: {
            id: 'tech-freight',
            title: 'Freight Trains',
            desc: 'Increase trade volume with trains',
            reqs: { trade: 2, high_tech: 3 },
            grant: ['trade',3],
            cost: { 
                Knowledge(){ return 37800; }
            },
            effect: 'Increase the effectiveness of each trade post by 1.',
            action(){
                if (payCosts(actions.tech.freight.cost)){
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
                Knowledge(){ return 90; }
            },
            effect: 'Creates the concept of banking, allowing govenment to accumulate massive wealth. Also gives the plebs somewhere to store their money.',
            action(){
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
                Money(){ return 2500; },
                Knowledge(){ return 900; }
            },
            effect: 'Discover the principles of investing, unlocks the banker job.',
            action(){
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
                Money(){ return 2000; },
                Knowledge(){ return 3600; },
                Iron(){ return 500; },
                Cement(){ return 750; }
            },
            effect: 'Upgrade your banks with vaults made out of concrete, increases $ storage capacity.',
            action(){
                if (payCosts(actions.tech.vault.cost)){
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
                Money(){ return 20000; },
                Knowledge(){ return 5000; }
            },
            effect: 'Raise new capital by creating a series of savings bonds. With savings bonds each citizen will increase your money cap by $250.',
            action(){
                if (payCosts(actions.tech.bonds.cost)){
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
                Money(){ return 30000; },
                Knowledge(){ return 6750; },
                Steel(){ return 3000; }
            },
            effect: 'Reinforce your bank vaults with heavy steel doors and walls, increases $ storage capacity.',
            action(){
                if (payCosts(actions.tech.steel_vault.cost)){
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
                Money(){ return 75000; },
                Knowledge(){ return 18000; }
            },
            effect: 'Create new series EE savings bonds which mature at a much higher value. Each citizen will increase your money cap by $600.',
            action(){
                if (payCosts(actions.tech.eebonds.cost)){
                    return true;
                }
                return false;
            }
        },
        swiss_banking: {
            id: 'tech-swiss_banking',
            title: 'Swiss Banking',
            desc: 'Swiss Banking',
            reqs: { banking: 6 },
            grant: ['banking',7],
            cost: {
                Money(){ return 125000; },
                Knowledge(){ return 45000; }
            },
            effect: 'With new training your bankers will learn how to creatively store money. Increases bank vault capacity by 5% per banker.',
            action(){
                if (payCosts(actions.tech.swiss_banking.cost)){
                    return true;
                }
                return false;
            }
        },
        safety_deposit: {
            id: 'tech-safety_deposit',
            title: 'Safety Deposit Box',
            desc: 'Safety Deposit Box',
            reqs: { banking: 7, high_tech: 4 },
            grant: ['banking',8],
            cost: {
                Money(){ return 250000; },
                Knowledge(){ return 67500; }
            },
            effect: 'Banks will offer safety deposit boxes, increasing bank capacity by $25 per citizen.',
            action(){
                if (payCosts(actions.tech.safety_deposit.cost)){
                    return true;
                }
                return false;
            }
        },
        stock_market: {
            id: 'tech-stock_market',
            title: 'Stock Exchange',
            desc: 'Stock Exchange',
            reqs: { banking: 8, high_tech: 6 },
            grant: ['banking',9],
            cost: {
                Money(){ return 325000; },
                Knowledge(){ return 108000; }
            },
            effect: 'Establish a stock exchange to increase wealth potential.',
            action(){
                if (payCosts(actions.tech.stock_market.cost)){
                    var tech = actions.tech.stock_market.grant[0];
                    global.tech[tech] = actions.tech.stock_market.grant[1];
                    arpa('Physics');
                    return true;
                }
                return false;
            }
        },
        hedge_funds: {
            id: 'tech-hedge_funds',
            title: 'Hedge Funds',
            desc: 'Hedge Funds',
            reqs: { banking: 9, stock_exchange: 1 },
            grant: ['banking',10],
            cost: {
                Money(){ return 375000; },
                Knowledge(){ return 126000; }
            },
            effect: 'Bankers also manage hedge funds, increasing the amount of money generated per banker by 2% per stock market level.',
            action(){
                if (payCosts(actions.tech.hedge_funds.cost)){
                    return true;
                }
                return false;
            }
        },
        four_oh_one: {
            id: 'tech-four_oh_one',
            title: '401K',
            desc: '401K',
            reqs: { banking: 10 },
            grant: ['banking',11],
            cost: {
                Money(){ return 425000; },
                Knowledge(){ return 144000; }
            },
            effect: 'Encourage citizens to establish 401K plans increasing the total amount of wealth available.',
            action(){
                if (payCosts(actions.tech.four_oh_one.cost)){
                    return true;
                }
                return false;
            }
        },
        home_safe: {
            id: 'tech-home_safe',
            title: 'House Safe',
            desc: 'House Safe',
            reqs: { banking: 5 },
            grant: ['home_safe',1],
            cost: {
                Money(){ return 42000; },
                Knowledge(){ return 8000; },
                Steel(){ return 4500; }
            },
            effect: 'Install a safe in every cottage and apartment to store valuables.',
            action(){
                if (payCosts(actions.tech.home_safe.cost)){
                    return true;
                }
                return false;
            }
        },
        monument: {
            id: 'tech-monument',
            title: 'Monuments',
            desc: 'Monuments',
            reqs: { high_tech: 6 },
            grant: ['monument',1],
            cost: {
                Knowledge(){ return 120000; }
            },
            effect: `Plan the construction of a monument to celebrate your civilizations greatness.`,
            action(){
                if (payCosts(actions.tech.monument.cost)){
                    var tech = actions.tech.monument.grant[0];
                    global.tech[tech] = actions.tech.monument.grant[1];
                    global.arpa['m_type'] = arpa('Monument');
                    arpa('Physics');
                    return true;
                }
                return false;
            }
        },
        science: {
            id: 'tech-science',
            title: 'Scientific Method',
            desc: 'Begin a journey of testing and discovery',
            reqs: { housing: 1 },
            grant: ['science',1],
            cost: {
                Knowledge(){ return 65; }
            },
            effect: 'Conceive of the scientific method. This will set your race down a path of science and discovery.',
            action(){
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
                Knowledge(){ return 720; }
            },
            effect: 'Create a system for organizing and storing knowledge in large storage buildings designed specifically for books.',
            action(){
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
                Knowledge(){ return 1125; }
            },
            effect: 'Libraries will have a minor effect on professor effectiveness.',
            action(){
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
                Knowledge(){ return 3240; }
            },
            effect: 'Libraries will boost the effect of universities by 2% per library.',
            action(){
                if (payCosts(actions.tech.research_grant.cost)){
                    return true;
                }
                return false;
            }
        },
        scientific_journal: {
            id: 'tech-scientific_journal',
            title: 'Scientific Journal',
            desc: 'Publish a Scientific Journal',
            reqs: { science: 4, high_tech: 3 },
            grant: ['science',5],
            cost: {
                Knowledge(){ return 27000; }
            },
            effect: 'Each scientist will publish their work in a scientific journal. Libraries max knowledge increased by 12% per scientist.',
            action(){
                if (payCosts(actions.tech.scientific_journal.cost)){
                    return true;
                }
                return false;
            }
        },
        adjunct_professor: {
            id: 'tech-adjunct_professor',
            title: 'Adjunct Professors',
            desc: 'Adjunct Professors',
            reqs: { science: 5 },
            grant: ['science',6],
            cost: {
                Knowledge(){ return 36000; }
            },
            effect: 'Professors will boost the effectiveness of scientists by 1% per powered wardenclyffe tower.',
            action(){
                if (payCosts(actions.tech.adjunct_professor.cost)){
                    return true;
                }
                return false;
            }
        },
        tesla_coil: {
            id: 'tech-tesla_coil',
            title: 'Tesla Coil',
            desc: 'Tesla Coil',
            reqs: { science: 6, high_tech: 3 },
            grant: ['science',7],
            cost: {
                Knowledge(){ return 51750; }
            },
            effect: 'Upgrade wardenclyffe towers with tesla coils increasing their science potential when powered.',
            action(){
                if (payCosts(actions.tech.tesla_coil.cost)){
                    return true;
                }
                return false;
            }
        },
        internet: {
            id: 'tech-internet',
            title: 'Internet',
            desc: 'Internet',
            reqs: { science: 7, high_tech: 4 },
            grant: ['science',8],
            cost: {
                Knowledge(){ return 61200; }
            },
            effect: 'The internet is a revolution which massively changes how information is exchanged. Increases the base value of Universities and Libraries by 40%.',
            action(){
                if (payCosts(actions.tech.internet.cost)){
                    return true;
                }
                return false;
            }
        },
        bioscience: {
            id: 'tech-bioscience',
            title: 'Bioscience',
            desc: 'Bioscience',
            reqs: { science: 8 },
            grant: ['genetics',1],
            cost: {
                Knowledge(){ return 67500; }
            },
            effect: 'Begin unlocking the mysteries of life.',
            action(){
                if (payCosts(actions.tech.bioscience.cost)){
                    global.city['biolab'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        genetics: {
            id: 'tech-genetics',
            title: 'Genetics',
            desc: 'Genetics',
            reqs: { genetics: 1, high_tech: 6 },
            grant: ['genetics',2],
            cost: {
                Knowledge(){ return 108000; }
            },
            effect: 'Begin unlocking the secrets of DNA.',
            action(){
                if (payCosts(actions.tech.genetics.cost)){
                    var tech = actions.tech.genetics.grant[0];
                    global.tech[tech] = actions.tech.genetics.grant[1];
                    global.settings.arpa.genetics = true;
                    arpa('Genetics');
                    return true;
                }
                return false;
            }
        },
        crispr: {
            id: 'tech-crispr',
            title: 'Crispr Cas9',
            desc: 'Crispr Cas9',
            reqs: { genetics: 3 },
            grant: ['genetics',4],
            cost: {
                Knowledge(){ return 125000; }
            },
            effect: 'Crispr is a breakthrough in genetic engineering that will allow you to permanently modify your own genome.',
            action(){
                if (payCosts(actions.tech.crispr.cost)){
                    var tech = actions.tech.crispr.grant[0];
                    global.tech[tech] = actions.tech.crispr.grant[1];
                    global.settings.arpa.crispr = true;
                    global.settings.arpa.arpaTabs = 2;
                    arpa('Genetics');
                    arpa('Crispr');
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
                Money(){ return 10000; },
                Knowledge(){ return 6750; },
                Steel(){ return 1000; }
            },
            effect: 'The greatest leaps in science are often made by "misunderstood" individuals.',
            action(){
                if (payCosts(actions.tech.mad_science.cost)){
                    global.city['wardenclyffe'] = {
                        count: 0,
                        on: 0
                    };
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
                Knowledge(){ return 13500; },
                Copper(){ return 1000; }
            },
            effect: 'Discover electricity, no kites required.',
            action(){
                if (payCosts(actions.tech.electricity.cost)){
                    global.city['power'] = 0;
                    global.city['powered'] = true;
                    global.city['coal_power'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        industrialization: {
            id: 'tech-industrialization',
            title: 'Industrialization',
            desc: 'Industrialization',
            reqs: { high_tech: 2, cement: 2, steel_container: 1 },
            grant: ['high_tech',3],
            cost: {
                Knowledge(){ return 25200; }
            },
            effect: 'Bring about the industrial revolution. Leads to all sorts of new technological developments.',
            action(){
                if (payCosts(actions.tech.industrialization.cost)){
                    global.resource.Titanium.display = true;
                    global.city['factory'] = {
                        count: 0,
                        on: 0,
                        Lux: 0,
                        Alloy: 0,
                        Polymer: 0
                    };
                    return true;
                }
                return false;
            }
        },
        electronics: {
            id: 'tech-electronics',
            title: 'Electronics',
            desc: 'Electronics',
            reqs: { high_tech: 3, titanium: 1 },
            grant: ['high_tech',4],
            cost: {
                Knowledge(){ return 50000; }
            },
            effect: 'Electronics is the next major step forward in technological advancement.',
            action(){
                if (payCosts(actions.tech.electronics.cost)){
                    return true;
                }
                return false;
            }
        },
        fission: {
            id: 'tech-fission',
            title: 'Nuclear Fission',
            desc: 'Nuclear Fission',
            reqs: { high_tech: 4, uranium: 1 },
            grant: ['high_tech',5],
            cost: {
                Knowledge(){ return 77400; },
                Uranium(){ return 10; }
            },
            effect: 'Learn to split the atom, a powerful but terrifying new development.',
            action(){
                if (payCosts(actions.tech.fission.cost)){
                    global.city['fission_power'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        arpa: {
            id: 'tech-arpa',
            title: 'A.R.P.A.',
            desc: 'Advanced Reseach Projects Agency',
            reqs: { high_tech: 5 },
            grant: ['high_tech',6],
            cost: {
                Knowledge(){ return 90000; }
            },
            effect: 'Establish the Advanced Research Projects Agency (A.R.P.A.). This advanced labratory is dedicated to providing the facilties to progress all your special projects.',
            action(){
                if (payCosts(actions.tech.arpa.cost)){
                    global.settings.showGenetics = true;
                    var tech = actions.tech.arpa.grant[0];
                    global.tech[tech] = actions.tech.arpa.grant[1];
                    arpa('Physics');
                    return true;
                }
                return false;
            }
        },
        rocketry: {
            id: 'tech-rocketry',
            title: 'Rocketry',
            desc: 'Rocketry',
            reqs: { high_tech: 6 },
            grant: ['high_tech',7],
            cost: {
                Knowledge(){ return 112500; },
                Oil(){ return 6800; }
            },
            effect: 'Establish the the field of rocketry. Leads to all sorts of new ballistic technologies.',
            action(){
                if (payCosts(actions.tech.rocketry.cost)){
                    var tech = actions.tech.rocketry.grant[0];
                    global.tech[tech] = actions.tech.rocketry.grant[1];
                    arpa('Physics');
                    return true;
                }
                return false;
            }
        },
        lasers: {
            id: 'tech-lasers',
            title: 'Lasers',
            desc: 'Light Amplification by Stimulated Emission of Radiation',
            reqs: { high_tech: 7, supercollider: 1, locked: 1 },
            grant: ['high_tech',8],
            cost: {
                Knowledge(){ return 160000; }
            },
            effect: 'Laser technology finally made practical. This could lead to all sorts of new breakthroughs.',
            action(){
                if (payCosts(actions.tech.lasers.cost)){
                    return true;
                }
                return false;
            }
        },
        uranium: {
            id: 'tech-uranium',
            title: 'Uranium Extraction',
            desc: 'Uranium Extraction',
            reqs: { high_tech: 4 },
            grant: ['uranium',1],
            cost: {
                Knowledge(){ return 72000; }
            },
            effect: 'Learn how to extract trace amounts of uranium from coal deposits.',
            action(){
                if (payCosts(actions.tech.uranium.cost)){
                    global.resource.Uranium.display = true;
                    return true;
                }
                return false;
            }
        },
        uranium_storage: {
            id: 'tech-uranium_storage',
            title: 'Uranium Storage',
            desc: 'Uranium Storage',
            reqs: { uranium: 1 },
            grant: ['uranium',2],
            cost: {
                Knowledge(){ return 75600; },
                Alloy(){ return 2500; }
            },
            effect: 'Upgrade your fuel depots with specially designed areas for storing uranium.',
            action(){
                if (payCosts(actions.tech.uranium_storage.cost)){
                    return true;
                }
                return false;
            }
        },
        uranium_ash: {
            id: 'tech-uranium_ash',
            title: 'Uranium Ash',
            desc: 'Uranium Ash',
            reqs: { uranium: 2 },
            grant: ['uranium',3],
            cost: {
                Knowledge(){ return 122000; }
            },
            effect: 'Learn how to extract trace amounts of uranium from coal ash.',
            action(){
                if (payCosts(actions.tech.uranium_ash.cost)){
                    return true;
                }
                return false;
            }
        },
        mine_conveyor: {
            id: 'tech-mine_conveyor',
            title: 'Mine Conveyor Belts',
            desc: 'Mine Conveyor Belts',
            reqs: { high_tech: 2 },
            grant: ['mine_conveyor',1],
            cost: {
                Knowledge(){ return 16200; },
                Copper(){ return 2250; },
                Steel(){ return 1750; }
            },
            effect: 'Add mining conveyor belts to your mining operations. Greatly increasing mining excavation rates.',
            action(){
                if (payCosts(actions.tech.mine_conveyor.cost)){
                    return true;
                }
                return false;
            }
        },
        oil_well: {
            id: 'tech-oil_well',
            title: 'Oil Derrick',
            desc: 'Oil Derrick',
            reqs: { high_tech: 3 },
            grant: ['oil',1],
            cost: {
                Knowledge(){ return 27000; }
            },
            effect: 'Unlock oil derrecks and begin the age of big oil.',
            action(){
                if (payCosts(actions.tech.oil_well.cost)){
                    global.city['oil_well'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        oil_depot: {
            id: 'tech-oil_depot',
            title: 'Fuel Depot',
            desc: 'Fuel Depot',
            reqs: { oil: 1 },
            grant: ['oil',2],
            cost: {
                Knowledge(){ return 32000; }
            },
            effect: 'Design a facility specially made to increase your oil reserves.',
            action(){
                if (payCosts(actions.tech.oil_depot.cost)){
                    global.city['oil_depot'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        oil_power: {
            id: 'tech-oil_power',
            title: 'Oil Powerplant',
            desc: 'Oil Powerplant',
            reqs: { oil: 2 },
            grant: ['oil',3],
            cost: {
                Knowledge(){ return 44000; }
            },
            effect: 'Design a power facility that runs on oil.',
            action(){
                if (payCosts(actions.tech.oil_power.cost)){
                    global.city['oil_power'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        polymer: {
            id: 'tech-polymer',
            title: 'Polymer',
            desc: 'Polymer',
            reqs: { genetics: 1 },
            grant: ['polymer',1],
            cost: {
                Knowledge(){ return 80000; },
                Oil(){ return 5000; },
                Alloy(){ return 450; }
            },
            effect: 'Create a new high tech polymer material that can be used for a wide variety of applications.',
            action(){
                if (payCosts(actions.tech.polymer.cost)){
                    global.resource.Polymer.display = true;
                    messageQueue('Polymer is now available for manufacture');
                    return true;
                }
                return false;
            }
        },
        fluidized_bed_reactor: {
            id: 'tech-fluidized_bed_reactor',
            title: 'Fluidized Bed Reactor',
            desc: 'Fluidized Bed Reactor',
            reqs: { polymer: 1, high_tech: 6 },
            grant: ['polymer',2],
            cost: {
                Knowledge(){ return 99000; }
            },
            effect: 'Fluidized bed reactors revolutionize the manufacturing of polymers boosting output by an astonishing 42%',
            action(){
                if (payCosts(actions.tech.fluidized_bed_reactor.cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_drills: {
            id: 'tech-titanium_drills',
            title: 'Titanium Drills',
            desc: 'Titanium Drills',
            reqs: { oil: 3 },
            grant: ['oil',4],
            cost: {
                Knowledge(){ return 54000; },
                Titanium(){ return 3500; }
            },
            effect: 'New oil drills made from titanium will increase oil production by an estimated 20%.',
            action(){
                if (payCosts(actions.tech.titanium_drills.cost)){
                    return true;
                }
                return false;
            }
        },
        alloy_drills: {
            id: 'tech-alloy_drills',
            title: 'Alloy Drills',
            desc: 'Alloy Drills',
            reqs: { oil: 4 },
            grant: ['oil',5],
            cost: {
                Knowledge(){ return 77000; },
                Alloy(){ return 1000; }
            },
            effect: 'Enhanced drills made with new alloys increase oil production by another estimated 25%.',
            action(){
                if (payCosts(actions.tech.alloy_drills.cost)){
                    return true;
                }
                return false;
            }
        },
        fracking: {
            id: 'tech-fracking',
            title: 'Fracking',
            desc: 'Fracking',
            reqs: { oil: 5, high_tech: 6 },
            grant: ['oil',6],
            cost: {
                Knowledge(){ return 132000; }
            },
            effect: 'A new oil mining technique, controversial but effective. Improves oil derrick output by 40%',
            action(){
                if (payCosts(actions.tech.fracking.cost)){
                    return true;
                }
                return false;
            }
        },
        stone_axe: {
            id: 'tech-stone_axe',
            title: 'Primitive Axes',
            desc: 'Create the first axe',
            reqs: { primitive: 3 },
            grant: ['axe',1],
            cost: {
                Knowledge(){ return 45; },
                Lumber(){ return 20; },
                Stone(){ return 20; }
            },
            effect: 'Creates a primitive axe made from stone lashed to a stick. Enables lumber harvesting.',
            action(){
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
            title: 'Bronze Axe',
            desc: 'Create an axe made from bronze',
            reqs: { axe: 1, mining: 2 },
            grant: ['axe',2],
            cost: {
                Knowledge(){ return 540; },
                Copper(){ return 25; }
            },
            effect: 'Upgrade axe technology to metal axes made from bronze. Improves lumber harvesting.',
            action(){
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
                Knowledge(){ return 3375; },
                Iron(){ return 400; }
            },
            effect: 'Sawmills increase the lumber yield of your lumberjacks.',
            action(){
                if (payCosts(actions.tech.iron_saw.cost)){
                    global.city['sawmill'] = {
                        count: 0,
                        on: 0
                    };
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
                Knowledge(){ return 10800; },
                Steel(){ return 400; }
            },
            effect: 'Upgrade sawmills with steel blades.',
            action(){
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
                Knowledge(){ return 2700; },
                Iron(){ return 250; }
            },
            effect: 'Upgrade axe technology to metal axes made from iron. Improves lumber harvesting.',
            action(){
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
                Knowledge(){ return 9000; },
                Steel(){ return 250; }
            },
            effect: 'Upgrade axe technology to durable axes made from steel. Improves lumber harvesting.',
            action(){
                if (payCosts(actions.tech.steel_axes.cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_axes: {
            id: 'tech-titanium_axes',
            title: 'Titanium Axe',
            desc: 'Create the ultimate axe made from titanium',
            reqs: { axe: 4, high_tech: 3 },
            grant: ['axe',5],
            cost: {
                Knowledge(){ return 38000; },
                Titanium(){ return 350; }
            },
            effect: 'Upgrade axe technology to durable axes made from titanium. Improves lumber harvesting.',
            action(){
                if (payCosts(actions.tech.titanium_axes.cost)){
                    return true;
                }
                return false;
            }
        },
        copper_sledgehammer: {
            id: 'tech-copper_sledgehammer',
            title: 'Bronze Sledgehammer',
            desc: 'Create a sledgehammer with a bronze head',
            reqs: { mining: 2 },
            grant: ['hammer',1],
            cost: {
                Knowledge(){ return 540; },
                Copper(){ return 25; }
            },
            effect: 'Create sledgehammers made from bronze. Improves rock quarrying.',
            action(){
                if (payCosts(actions.tech.copper_sledgehammer.cost)){
                    return true;
                }
                return false;
            }
        },
        iron_sledgehammer: {
            id: 'tech-iron_sledgehammer',
            title: 'Iron Sledgehammer',
            desc: 'Create a sledgehammer with an iron head',
            reqs: { hammer: 1, mining: 3 },
            grant: ['hammer',2],
            cost: {
                Knowledge(){ return 2700; },
                Iron(){ return 250; }
            },
            effect: 'Upgrade to more durable sledgehammers made from iron. Improves rock quarrying.',
            action(){
                if (payCosts(actions.tech.iron_sledgehammer.cost)){
                    return true;
                }
                return false;
            }
        },
        steel_sledgehammer: {
            id: 'tech-steel_sledgehammer',
            title: 'Steel Sledgehammer',
            desc: 'Create a sledgehammer with a steel head',
            reqs: { hammer: 2, smelting: 2 },
            grant: ['hammer',3],
            cost: {
                Knowledge(){ return 7200; },
                Steel(){ return 250; }
            },
            effect: 'Upgrade to stronger sledgehammers made from steel. Improves rock quarrying.',
            action(){
                if (payCosts(actions.tech.steel_sledgehammer.cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_sledgehammer: {
            id: 'tech-titanium_sledgehammer',
            title: 'Titanium Sledgehammer',
            desc: 'Create a sledgehammer with a titanium head',
            reqs: { hammer: 3, high_tech: 3 },
            grant: ['hammer',4],
            cost: {
                Knowledge(){ return 40000; },
                Titanium(){ return 400; }
            },
            effect: 'Upgrade to stronger sledgehammers made from titanium. Improves rock quarrying.',
            action(){
                if (payCosts(actions.tech.titanium_sledgehammer.cost)){
                    return true;
                }
                return false;
            }
        },
        copper_pickaxe: {
            id: 'tech-copper_pickaxe',
            title: 'Bronze Pickaxe',
            desc: 'Create a pickaxe made from bronze',
            reqs: { mining: 2 },
            grant: ['pickaxe',1],
            cost: {
                Knowledge(){ return 675; },
                Copper(){ return 25; }
            },
            effect: 'Create metal pickaxes made with bronze heads. Improves mining activities.',
            action(){
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
                Knowledge(){ return 3200; },
                Iron(){ return 250; }
            },
            effect: 'Upgrades pickaxe technology to metal pickaxes made from iron. Improves mining activities.',
            action(){
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
                Knowledge(){ return 9000; },
                Steel(){ return 250; }
            },
            effect: 'Upgrades pickaxe technology to steel pickaxes. Improves mining activities.',
            action(){
                if (payCosts(actions.tech.steel_pickaxe.cost)){
                    return true;
                }
                return false;
            }
        },
        jackhammer: {
            id: 'tech-jackhammer',
            title: 'Jackhammer',
            desc: 'Invent the Jackhammer',
            reqs: { pickaxe: 3, high_tech: 2},
            grant: ['pickaxe',4],
            cost: {
                Knowledge(){ return 22500; },
                Copper(){ return 5000; }
            },
            effect: 'Replace old mining pick technology with jackhammers. Improves mining activities.',
            action(){
                if (payCosts(actions.tech.jackhammer.cost)){
                    return true;
                }
                return false;
            }
        },
        jackhammer_mk2: {
            id: 'tech-jackhammer_mk2',
            title: 'Electric Jackhammer',
            desc: 'Modern Jackhammers',
            reqs: { pickaxe: 4, high_tech: 4},
            grant: ['pickaxe',5],
            cost: {
                Knowledge(){ return 67500; },
                Titanium(){ return 2000; },
                Alloy(){ return 500; }
            },
            effect: 'Upgrade your jackhammers with newer models. Improves mining activities.',
            action(){
                if (payCosts(actions.tech.jackhammer_mk2.cost)){
                    return true;
                }
                return false;
            }
        },
        copper_hoe: {
            id: 'tech-copper_hoe',
            title: 'Bronze Hoes',
            desc: 'Create farming tools made from bronze',
            reqs: { mining: 2, agriculture: 1 },
            grant: ['hoe',1],
            cost: {
                Knowledge(){ return 720; },
                Copper(){ return 50; }
            },
            effect: 'Create tools made from bronze that aid farming. Improves farm efficiency.',
            action(){
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
            reqs: { hoe: 1, mining: 3, agriculture: 1 },
            grant: ['hoe',2],
            cost: {
                Knowledge(){ return 3600; },
                Iron(){ return 500; }
            },
            effect: 'Create tools made from iron that aid farming. Improves farm efficiency.',
            action(){
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
            reqs: { hoe: 2, smelting: 2, agriculture: 1 },
            grant: ['hoe',3],
            cost: {
                Knowledge(){ return 12600; },
                Steel(){ return 500; }
            },
            effect: 'Create tools made from steel that aid farming. Improves farm efficiency.',
            action(){
                if (payCosts(actions.tech.steel_hoe.cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_hoe: {
            id: 'tech-titanium_hoe',
            title: 'Titanium Hoes',
            desc: 'Create better farming tools made from titanium',
            reqs: { hoe: 3, high_tech: 3, agriculture: 1 },
            grant: ['hoe',4],
            cost: {
                Knowledge(){ return 44000; },
                Titanium(){ return 500; }
            },
            effect: 'Create tools made from titanium that aid farming. Improves farm efficiency.',
            action(){
                if (payCosts(actions.tech.titanium_hoe.cost)){
                    return true;
                }
                return false;
            }
        },
        garrison: {
            id: 'tech-garrison',
            title: 'Garrison',
            desc: 'Found the military',
            reqs: { science: 1, housing: 1 },
            grant: ['military',1],
            cost: {
                Knowledge(){ return 70; }
            },
            effect: 'Establish a military to keep your people safe from external threats, or to conquer your enemies with.',
            action(){
                if (payCosts(actions.tech.garrison.cost)){
                    global.civic['garrison'].display = true;
                    global.city['garrison'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        mercs: {
            id: 'tech-mercs',
            title: 'Mercenaries',
            desc: 'Establish a mercenary recruitment center',
            reqs: { military: 1 },
            grant: ['mercs',1],
            cost: {
                Money(){ return 10000 },
                Knowledge(){ return 4500; }
            },
            effect: 'Unlocks the ability to hire mercenaries. You can pay a man to die for you afterall.',
            action(){
                if (payCosts(actions.tech.mercs.cost)){
                    global.civic.garrison['mercs'] = true;
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
                Knowledge(){ return 225; },
                Lumber(){ return 250; }
            },
            effect: `Create the bow and outfit your army with ranged weapons. It's sure to give you dominance over the primates.`,
            action(){
                if (payCosts(actions.tech.bows.cost)){
                    return true;
                }
                return false;
            }
        },
        flintlock_rifle: {
            id: 'tech-flintlock_rifle',
            title: 'Flintlock Rifle',
            desc: 'Flintlock Rifles',
            reqs: { military: 2, explosives: 1 },
            grant: ['military',3],
            cost: {
                Knowledge(){ return 5400; },
                Coal(){ return 750; }
            },
            effect: 'Outfit your army with firearms, much deadlier than primitive bows and arrows.',
            action(){
                if (payCosts(actions.tech.flintlock_rifle.cost)){
                    return true;
                }
                return false;
            }
        },
        machine_gun: {
            id: 'tech-machine_gun',
            title: 'Machine Gun',
            desc: 'Machine Gun',
            reqs: { military: 3, oil: 1 },
            grant: ['military',4],
            cost: {
                Knowledge(){ return 33750; },
                Oil(){ return 1500; }
            },
            effect: 'Decimate your foes with rapid fire weaponary.',
            action(){
                if (payCosts(actions.tech.machine_gun.cost)){
                    return true;
                }
                return false;
            }
        },
        bunk_beds: {
            id: 'tech-bunk_beds',
            title: 'Bunk Beds',
            desc: 'Bunk Beds',
            reqs: { military: 4, high_tech: 4 },
            grant: ['military',5],
            cost: {
                Knowledge(){ return 76500; },
                Furs(){ return 25000; },
                Alloy(){ return 3000; }
            },
            effect: 'Upgrade your garrisons to house additional soldiers.',
            action(){
                if (payCosts(actions.tech.bunk_beds.cost)){
                    return true;
                }
                return false;
            }
        },
        armor: {
            id: 'tech-armor',
            title: 'Leather Armor',
            desc: 'Create Leather Armor',
            reqs: { military: 1 },
            grant: ['armor',1],
            cost: {
                Money(){ return 250; },
                Knowledge(){ return 225; },
                Furs(){ return 250; }
            },
            effect: 'Basic armor made from leather, will reduce the number of casulaties you take during military actions.',
            action(){
                if (payCosts(actions.tech.armor.cost)){
                    return true;
                }
                return false;
            }
        },
        plate_armor: {
            id: 'tech-plate_armor',
            title: 'Plate Armor',
            desc: 'Create Plate Armor',
            reqs: { armor: 1, mining: 3 },
            grant: ['armor',2],
            cost: {
                Knowledge(){ return 3400; },
                Iron(){ return 600; },
            },
            effect: 'Armor reinforced with iron plates, heavy but offers better protection for your soldiers.',
            action(){
                if (payCosts(actions.tech.plate_armor.cost)){
                    return true;
                }
                return false;
            }
        },
        kevlar: {
            id: 'tech-kevlar',
            title: 'Kevlar',
            desc: 'Create Kevlar Vests',
            reqs: { armor: 2, polymer: 1 },
            grant: ['armor',3],
            cost: {
                Knowledge(){ return 86000; },
                Polymer(){ return 750; },
            },
            effect: 'New armor made out of kevlar provides modern protection for your soldiers.',
            action(){
                if (payCosts(actions.tech.kevlar.cost)){
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
                Knowledge(){ return 4500; },
                Coal(){ return 500; }
            },
            effect: 'Usher in a new era of things that go boom. Surely nothing bad can happen thanks to this discovery.',
            action(){
                if (payCosts(actions.tech.black_powder.cost)){
                    return true;
                }
                return false;
            }
        },
        dynamite: {
            id: 'tech-dynamite',
            title: 'Dynamite',
            desc: 'Dynamite',
            reqs: { explosives: 1 },
            grant: ['explosives',2],
            cost: {
                Knowledge(){ return 4800; },
                Coal(){ return 750; }
            },
            effect: 'Dynamite can be used to increase the efficiency of mining, no one would ever misuse this invention for nefarious purposes.',
            action(){
                if (payCosts(actions.tech.dynamite.cost)){
                    return true;
                }
                return false;
            }
        },
        anfo: {
            id: 'tech-anfo',
            title: 'ANFO',
            desc: 'ANFO',
            reqs: { explosives: 2, oil: 1 },
            grant: ['explosives',3],
            cost: {
                Knowledge(){ return 42000; },
                Oil(){ return 2500; }
            },
            effect: 'ANFO is a powerful explosive that can greatly aid mining activities.',
            action(){
                if (payCosts(actions.tech.anfo.cost)){
                    return true;
                }
                return false;
            }
        },
        mad: {
            id: 'tech-mad',
            title: 'Mutual Destruction',
            desc: 'Mutual Assured Destruction',
            reqs: { uranium: 1, explosives: 3, high_tech: 7 },
            grant: ['mad',1],
            cost: {
                Knowledge(){ return 120000; },
                Oil(){ return 8500; },
                Uranium(){ return 1250; }
            },
            effect: 'Create a network of nuclear armed ICBMs to counter a similar threat by your enemies.',
            action(){
                if (payCosts(actions.tech.mad.cost)){
                    global.civic.mad.display = true;
                    return true;
                }
                return false;
            }
        },
        cement: {
            id: 'tech-cement',
            title: 'Cement',
            desc: 'Learn how to turn stone into cement',
            reqs: { mining: 1, storage: 1, science: 1 },
            grant: ['cement',1],
            cost: {
                Knowledge(){ return 500; }
            },
            effect: 'Learn how to make cement from stone.',
            action(){
                if (payCosts(actions.tech.cement.cost)){
                    global.city['cement_plant'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        rebar: {
            id: 'tech-rebar',
            title: 'Rebar',
            desc: 'Rebar',
            reqs: { mining: 3, cement: 1 },
            grant: ['cement',2],
            cost: {
                Knowledge(){ return 3200; },
                Iron(){ return 750; }
            },
            effect: 'Adding rebar to concrete will make it much stronger and reduce cement costs.',
            action(){
                if (payCosts(actions.tech.rebar.cost)){
                    return true;
                }
                return false;
            }
        },
        steel_rebar: {
            id: 'tech-steel_rebar',
            title: 'Steel Rebar',
            desc: 'Steel Rebar',
            reqs: { smelting: 2, cement: 2 },
            grant: ['cement',3],
            cost: {
                Knowledge(){ return 6750; },
                Steel(){ return 750; }
            },
            effect: 'Use stronger steel as rebar, further reducing cement costs.',
            action(){
                if (payCosts(actions.tech.steel_rebar.cost)){
                    return true;
                }
                return false;
            }
        },
        portland_cement: {
            id: 'tech-portland_cement',
            title: 'Portland Cement',
            desc: 'Portland Cement',
            reqs: { cement: 3, high_tech: 3 },
            grant: ['cement',4],
            cost: {
                Knowledge(){ return 32000; }
            },
            effect: 'Portland cement is easier to make boosting productivity of cement workers by 20%',
            action(){
                if (payCosts(actions.tech.portland_cement.cost)){
                    return true;
                }
                return false;
            }
        },
        screw_conveyor: {
            id: 'tech-screw_conveyor',
            title: 'Screw Conveyor',
            desc: 'Screw Conveyor',
            reqs: { cement: 4, high_tech: 4 },
            grant: ['cement',5],
            cost: {
                Knowledge(){ return 72000; }
            },
            effect: 'Screw conveyors can greatly increase the output of cement factories, however they require power to operate.',
            action(){
                if (payCosts(actions.tech.screw_conveyor.cost)){
                    return true;
                }
                return false;
            }
        },
        hunter_process: {
            id: 'tech-hunter_process',
            title: 'Hunter Process',
            desc: 'Hunter Process',
            reqs: { high_tech: 3, smelting: 2 },
            grant: ['titanium',1],
            cost: {
                Knowledge(){ return 45000; },
                Titanium(){ return 1000; }
            },
            effect: 'Steel smelting will result in small amounts of titanium production.',
            action(){
                if (payCosts(actions.tech.hunter_process.cost)){
                    return true;
                }
                return false;
            }
        },
        kroll_process: {
            id: 'tech-kroll_process',
            title: 'Kroll Process',
            desc: 'Kroll Process',
            reqs: { titanium: 1, high_tech: 4 },
            grant: ['titanium',2],
            cost: {
                Knowledge(){ return 78000; },
                Titanium(){ return 10000; }
            },
            effect: 'Iron smelting will result in small amounts of titanium production.',
            action(){
                if (payCosts(actions.tech.kroll_process.cost)){
                    return true;
                }
                return false;
            }
        },
        cambridge_process: {
            id: 'tech-cambridge_process',
            title: 'Cambridge Process',
            desc: 'Cambridge Process',
            reqs: { titanium: 2, supercollider: 1 },
            grant: ['titanium',3],
            cost: {
                Knowledge(){ return 135000; },
                Titanium(){ return 17500; }
            },
            effect: 'Modern techniques result in more efficent production of titanium from smelters.',
            action(){
                if (payCosts(actions.tech.cambridge_process.cost)){
                    return true;
                }
                return false;
            }
        },
        pynn_partical: {
            id: 'tech-pynn_partical',
            title: 'Pynn Particals',
            desc: 'Pynn Particals',
            reqs: { supercollider: 1 },
            grant: ['particles',1],
            cost: {
                Knowledge(){ return 100000; }
            },
            effect: 'Subatomic particles discovered by Dr Hank Pynn using the supercollider. Has applications in dimensional physics.',
            action(){
                if (payCosts(actions.tech.pynn_partical.cost)){
                    return true;
                }
                return false;
            }
        },
        matter_compression: {
            id: 'tech-matter_compression',
            title: 'Matter Compression',
            desc: 'Matter Compression',
            reqs: { particles: 1 },
            grant: ['particles',2],
            cost: {
                Knowledge(){ return 112500; }
            },
            effect: 'Use pynn particals to shrink containers down to half size, therefore doubling the amount you can store.',
            action(){
                if (payCosts(actions.tech.matter_compression.cost)){
                    return true;
                }
                return false;
            }
        },
        higgs_boson: {
            id: 'tech-higgs_boson',
            title: 'Higgs Boson',
            desc: 'Higgs Boson',
            reqs: { particles: 2, supercollider: 2 },
            grant: ['particles',3],
            cost: {
                Knowledge(){ return 125000; }
            },
            effect: 'Discover the Higgs Boson. No one knows what practical application this has but excitement about it will raise the contribution to science from supercolliders.',
            action(){
                if (payCosts(actions.tech.higgs_boson.cost)){
                    return true;
                }
                return false;
            }
        },
        theology: {
            id: 'tech-theology',
            title: 'Theology',
            desc: 'Theology',
            reqs: { theology: 1, housing: 1, cement: 1 },
            grant: ['theology',2],
            cost: {
                Knowledge(){ return 900; }
            },
            effect: 'Explore the mysteries of creation and faith.',
            action(){
                if (payCosts(actions.tech.theology.cost)){
                    global.city['temple'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        fanaticism: {
            id: 'tech-fanaticism',
            title: 'Fanaticism',
            desc: 'Fanaticism',
            reqs: { theology: 2 },
            grant: ['theology',3],
            cost: {
                Knowledge(){ return 2500; }
            },
            effect: '<div>Revere your creators as literal gods and attempt to mimic them.</div><div class="has-text-special">This is mutually exclusive with Anthropology, choose wisely.</div>',
            action(){
                if (payCosts(actions.tech.fanaticism.cost)){
                    global.tech['fanaticism'] = 1;
                    if (global.race.gods === global.race.species){
                        unlockAchieve(`second_evolution`);
                        randomMinorTrait();
                        return true;
                    }
                    switch (global.race.gods){
                        case 'human':
                            global.race['creative'] = 1;
                            break;
                        case 'elven':
                            global.race['studious'] = 1;
                            break;
                        case 'orc':
                            global.race['brute'] = 1;
                            break;
                        case 'cath':
                            global.race['carnivore'] = 1;
                            if (global.tech['farm'] >= 1){
                                global.tech['hunting'] = 2;
                            }
                            else if (global.tech['agriculture'] >= 3){
                                global.tech['hunting'] = 1;
                            }
                            if (global.city['farm']){
                                global.city['lodge'] = { count: global.city.farm.count };
                                delete global.city['farm'];
                            }
                            if (global.city['silo']){
                                global.city['smokehouse'] = { count: global.city.silo.count };
                                delete global.city['silo'];
                            }
                            if (global.city['mill']){
                                delete global.city['mill'];
                            }
                            delete global.tech['agriculture'];
                            delete global.tech['farm'];
                            global.civic.farmer.display = false;
                            if (global.race.species === 'entish'){
                                unlockAchieve(`madagascar_tree`);
                            }
                            break;
                        case 'wolven':
                            global.race['tracker'] = 1;
                            break;
                        case 'centaur':
                            global.race['beast_of_burden'] = 1;
                            break;
                        case 'kobold':
                            global.race['pack_rat'] = 1;
                            break;
                        case 'goblin':
                            global.race['merchant'] = 1;
                            break;
                        case 'gnome':
                            global.race['smart'] = 1;
                            break;
                        case 'orge':
                            global.race['tough'] = 1;
                            break;
                        case 'cyclops':
                            global.race['intelligent'] = 1;
                            break;
                        case 'troll':
                            global.race['regenerative'] = 1;
                            break;
                        case 'tortoisan':
                            global.race['armored'] = 1;
                            break;
                        case 'gecko':
                            global.race['optimistic'] = 1;
                            break;
                        case 'slitheryn':
                            global.race['slow_digestion'] = 1;
                            break;
                        case 'arraak':
                            global.race['resourceful'] = 1;
                            break;
                        case 'pterodacti':
                            global.race['leathery'] = 1;
                            break;
                        case 'dracnid':
                            global.race['hoarder'] = 1;
                            break;
                        case 'entish':
                            global.race['kindling_kindred'] = 1;
                            global.resource.Lumber.display = false;
                            global.resource.Plywood.display = false;
                            global.city['lumber'] = 0;
                            if (global.city['sawmill']){
                                delete global.city['sawmill'];
                            }
                            if (global.city['lumber_yard']){
                                delete global.city['lumber_yard'];
                            }
                            delete global.tech['axe'];
                            delete global.tech['saw'];
                            global.civic.lumberjack.display = false;
                            if (global.tech['foundry']){
                                global.civic.craftsman.workers -= global.city.foundry['Plywood'];
                                global.city.foundry.crafting -= global.city.foundry['Plywood'];
                                global.city.foundry['Plywood'] = 0;
                                loadFoundry();
                            }
                            break;
                        case 'cacti':
                            global.race['hyper'] = 1;
                            break;
                        case 'sporgar':
                            global.race['mushy'] = 1;
                            break;
                        case 'shroomi':
                            global.race['toxic'] = 1;
                            break;
                        case 'mantis':
                            global.race['malnutrition'] = 1;
                            break;
                        case 'scorpid':
                            global.race['claws'] = 1;
                            break;
                        case 'antid':
                            global.race['hivemind'] = 1;
                            break;
                    }
                    return true;
                }
                return false;
            }
        },
        indoctrination: {
            id: 'tech-indoctrination',
            title: 'Indoctrination',
            desc: 'Indoctrination',
            reqs: { fanaticism: 1 },
            grant: ['fanaticism',2],
            cost: {
                Knowledge(){ return 5000; }
            },
            effect: 'Professors will help spread your ideology. Each professor gives a minor boost to temple effectivenss',
            action(){
                if (payCosts(actions.tech.indoctrination.cost)){
                    return true;
                }
                return false;
            }
        },
        missionary: {
            id: 'tech-missionary',
            title: 'Missionary',
            desc: 'Missionary',
            reqs: { fanaticism: 2 },
            grant: ['fanaticism',3],
            cost: {
                Knowledge(){ return 10000; }
            },
            effect: 'Missionaries will go forth to spread the word. Incidentally they will help establish new trade routes.',
            action(){
                if (payCosts(actions.tech.missionary.cost)){
                    return true;
                }
                return false;
            }
        },
        zealotry: {
            id: 'tech-zealotry',
            title: 'Zealotry',
            desc: 'Zealotry',
            reqs: { fanaticism: 3 },
            grant: ['fanaticism',4],
            cost: {
                Knowledge(){ return 25000; }
            },
            effect: 'Your fanatical followers will fight to the death making you feared in combat. Temples add a minor bonus to soldier effectiveness.',
            action(){
                if (payCosts(actions.tech.zealotry.cost)){
                    return true;
                }
                return false;
            }
        },
        anthropology: {
            id: 'tech-anthropology',
            title: 'Anthropology',
            desc: 'Anthropology',
            reqs: { theology: 2 },
            grant: ['theology',3],
            cost: {
                Knowledge(){ return 2500; }
            },
            effect: '<div>Study your ancient creators and attempt to learn from them.</div><div class="has-text-special">This is mutually exclusive with Fanaticism, choose wisely.</div>',
            action(){
                if (payCosts(actions.tech.anthropology.cost)){
                    global.tech['anthropology'] = 1;
                    return true;
                }
                return false;
            }
        },
        mythology: {
            id: 'tech-mythology',
            title: 'Mythology',
            desc: 'Mythology',
            reqs: { anthropology: 1 },
            grant: ['anthropology',2],
            cost: {
                Knowledge(){ return 5000; }
            },
            effect: 'Mythological stories of the creators boost your libraries by 5% per temple',
            action(){
                if (payCosts(actions.tech.mythology.cost)){
                    return true;
                }
                return false;
            }
        },
        archaeology: {
            id: 'tech-archaeology',
            title: 'Archaeology',
            desc: 'Archaeology',
            reqs: { anthropology: 2 },
            grant: ['anthropology',3],
            cost: {
                Knowledge(){ return 10000; }
            },
            effect: 'Professors studying the past history of the creators are boosted in effectiveness by 5% per temple',
            action(){
                if (payCosts(actions.tech.archaeology.cost)){
                    return true;
                }
                return false;
            }
        },
        merchandising: {
            id: 'tech-merchandising',
            title: 'Merchandising',
            desc: 'Merchandising',
            reqs: { anthropology: 3 },
            grant: ['anthropology',4],
            cost: {
                Knowledge(){ return 25000; }
            },
            effect: 'The popularity of the creators among your culture has led to great merchandising opportunities. Tax income is boosted by 2.5% per temple.',
            action(){
                if (payCosts(actions.tech.merchandising.cost)){
                    return true;
                }
                return false;
            }
        }
    },
    genes: arpa('GeneTech')
};

export function storageMultipler(){
    var multiplier = (global.tech['storage'] - 1) * 0.75 + 1;
    if (global.tech['storage'] >= 3){
        multiplier *= global.tech['storage'] >= 4 ? 2 : 1.5;
    }
    if (global.race['pack_rat']){
        multiplier *= 1.05;
    }
    if (global.tech['storage'] >= 6){
        multiplier *= 1 + (global.tech['supercollider'] / 20);
    }
    return multiplier;
}

export function checkCityRequirements(action){
    if (global.race['kindling_kindred'] && action === 'lumber'){
        return false;
    }
    else if (global.race['kindling_kindred'] && action === 'stone'){
        return true;
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

export function checkOldTech(tech){
    let tch = actions.tech[tech].grant[0];
    if (global.tech[tch] && global.tech[tch] >= actions.tech[tech].grant[1]){
        return true;
    }
    return false;
}

export function checkPowerRequirements(action,type){
    var isMet = true;
    if (actions[action][type]['power_reqs']){
        Object.keys(actions[action][type].power_reqs).forEach(function (req) {
            if (!global.tech[req] || global.tech[req] < actions[action][type].power_reqs[req]){
                isMet = false;
            }
        });
    }
    return isMet;
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
    drawCity();
    drawTech();
}

export function drawCity(){
    Object.keys(actions.city).forEach(function (city) {
        removeAction(actions.city[city].id);
        if (checkCityRequirements(city)){
            addAction('city',city);
        }
    });
}

export function drawTech(){
    Object.keys(actions.tech).forEach(function (tech) {
        removeAction(actions.tech[tech].id);
        if (checkTechRequirements(tech)){
            addAction('tech',tech);
        }
        if (checkOldTech(tech)){
            oldTech(tech);
        }
    });
}

export function evalAffordable(){
    Object.keys(global.resource).forEach(function (res){
        $(`[data-${res}]`).each(function (i,v){
            if (global.resource[res].amount < $(this).attr(`data-${res}`)){
                if ($(this).hasClass('has-text-dark')){
                    $(this).removeClass('has-text-dark');
                    $(this).addClass('has-text-danger');
                }
            }
            else if ($(this).hasClass('has-text-danger')){
                $(this).removeClass('has-text-danger');
                $(this).addClass('has-text-dark');
            }
        });
    });
}

export function oldTech(tech){
    if (tech !== 'fanaticism' && tech !== 'anthropology'){
        addAction('tech',tech,true);
    }
    else if (tech === 'fanaticism' && global.tech['fanaticism']){
        addAction('tech',tech,true);
    }
    else if (tech === 'anthropology' && global.tech['anthropology']){
        addAction('tech',tech,true);
    }
}

export function addAction(action,type,old){
    if (global.race['kindling_kindred'] && action === 'tech' && type === 'stone_axe'){
        return;
    }
    if (global.race['carnivore'] && action === 'tech' && type === 'agriculture'){
        return;
    }
    else if (!global.race['carnivore'] && action === 'tech' && type === 'smokehouse'){
        return;
    }
    if (global.race['herbivore'] && action === 'tech' && type === 'fanaticism'){
        return;
    }
    if (actions[action][type]['powered'] && !global[action][type]['on']){
        global[action][type]['on'] = 0;
    }
    var id = actions[action][type].id;
    var parent = $(`<div id="${id}" class="action"></div>`);
    if (!checkAffordable(action,type)){
        parent.addClass('cna');
    }
    if (!checkAffordable(action,type,true)){
        parent.addClass('cnam');
    }
    if (old){
        var element = $('<span class="oldTech is-dark"><span class="aTitle">{{ title }}</span></span>');
        parent.append(element);
    }
    else {
        var element = $('<a class="button is-dark" v-on:click="action"><span class="aTitle">{{ title }}</span></a>');
        parent.append(element);
    }

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
    if (actions[action][type]['powered'] && global.tech['high_tech'] && global.tech['high_tech'] >= 2 && checkPowerRequirements(action,type)){
        var powerOn = $('<div class="on" @click="power_on" title="ON">{{ act.on }}</div>');
        var powerOff = $('<div class="off" @click="power_off" title="OFF">{{ act.on | off }}</div>');
        parent.append(powerOn);
        parent.append(powerOff);
    }
    if (action !== 'tech' && global[action][type] && global[action][type].count >= 0){
        element.append($('<span class="count">{{ act.count }}</span>'));
    }
    if (old){
        $('#oldTech').append(parent);
    }
    else {
        $('#'+action).append(parent);
    }
    if (action !== 'tech' && global[action][type] && global[action][type].count === 0){
        $(`#${id} .count`).css('display','none');
        $(`#${id} .special`).css('display','none');
        $(`#${id} .on`).css('display','none');
        $(`#${id} .off`).css('display','none');
    }

    var modal = {
        template: '<div id="modalBox" class="modalBox"></div>'
    };

    if (vues[id]){
        vues[id].$destroy();
    }
    vues[id] = new Vue({
        data: {
            title: typeof actions[action][type].title === 'string' ? actions[action][type].title : actions[action][type].title(),
            act: global[action][type]
        },
        methods: {
            action(){
                switch (action){
                    case 'tech':
                        if (actions[action][type].action()){
                            gainTech(type);
                        }
                        break;
                    case 'genes':
                        if (actions[action][type].action()){
                            gainGene(type);
                        }
                        break;
                    default:
                        var keyMult = keyMultiplier();
                        for (var i=0; i<keyMult; i++){
                            if (!actions[action][type].action()){
                                break;
                            }
                        }
                        updateDesc(action,type);
                        if (!checkAffordable(action,type)){
                            let id = actions[action][type].id;
                            $(`#${id}`).addClass('cna');
                        }
                        break;
                }
            },
            trigModal(){
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
            power_on(){
                if (global[action][type].on < global[action][type].count){
                    global[action][type].on++;
                }
            },
            power_off(){
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
    $('#'+id).on('mouseover',function(){
            var popper = $(`<div id="pop${id}" class="popper has-background-light has-text-dark"></div>`);
            $('#main').append(popper);
            actionDesc(popper,action,type,old);
            popper.show();
            poppers[id] = new Popper($('#'+id),popper);
        });
    $('#'+id).on('mouseout',function(){
            $(`#pop${id}`).hide();
            poppers[id].destroy();
            $(`#pop${id}`).remove();
        });
}

function actionDesc(parent,action,type,old){
    parent.empty();
    var desc = typeof actions[action][type].desc === 'string' ? actions[action][type].desc : actions[action][type].desc();
    parent.append($('<div>'+desc+'</div>'));
    if (actions[action][type].cost && !old){ 
        var cost = $('<div></div>');
        var costs = adjustCosts(actions[action][type].cost);
        Object.keys(costs).forEach(function (res) {
            var res_cost = costs[res]();
            if (res_cost > 0){
                var label = res === 'Money' ? '$' : res+': ';
                label = label.replace("_", " ");
                var color = global.resource[res].amount >= res_cost ? 'has-text-dark' : 'has-text-danger';
                cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}${res_cost}</div>`));
            }
        });
        parent.append(cost);
    }
    if (actions[action][type].effect){
        var effect = typeof actions[action][type].effect === 'string' ? actions[action][type].effect : actions[action][type].effect();
        if (effect){
            parent.append($(`<div>${effect}</div>`));
        }
    }
    if (actions[action][type].flair){
        var flair = typeof actions[action][type].flair === 'string' ? actions[action][type].flair : actions[action][type].flair();
        parent.append($(`<div class="flair has-text-special">${flair}</div>`));
        parent.addClass('flair');
    }
}

export function removeAction(id){
    $('#'+id).remove();
    $('#pop'+id).remove();
}

function updateDesc(category,action){
    var id = actions[category][action].id;
    if (global[category] && global[category][action] && global[category][action]['count']){
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
    if ((costs['RNA'] || costs['DNA']) && global.genes['evolve']){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'RNA' || res === 'DNA'){
                newCosts[res] = function(){ return Math.round(costs[res]() * 0.8); }
            }
        });
        return newCosts;
    }
    costs = kindlingAdjust(costs);
    costs = scienceAdjust(costs);
    costs = rebarAdjust(costs);
    return craftAdjust(costs);
}

function scienceAdjust(costs){
    if ((global.race['smart'] || global.race['dumb']) && costs['Knowledge']){
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
    return costs;
}

function kindlingAdjust(costs){
    if (global.race['kindling_kindred'] && (costs['Lumber'] || costs['Plywood'])){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res !== 'Lumber' && res !== 'Plywood'){
                newCosts[res] = function(){ return Math.round(costs[res]() * 1.05) || 0; }
            }
        });
        return newCosts;
    }
    return costs;
}

function craftAdjust(costs){
    if (global.race['hollow_bones'] && (costs['Plywood'] || costs['Brick'] || costs['Wrought_Iron'] || costs['Sheet_Metal'])){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Plywood' || res === 'Brick' || res === 'Wrought_Iron' || res === 'Sheet_Metal'){
                newCosts[res] = function(){ return Math.round(costs[res]() * 0.95); }
            }
            else {
                newCosts[res] = function(){ return Math.round(costs[res]()); }
            }
        });
        return newCosts;
    }
    return costs;
}

function rebarAdjust(costs){
    if (costs['Cement'] && global.tech['cement'] && global.tech['cement'] >= 2){
        let discount = global.tech['cement'] >= 3 ? 0.8 : 0.9;
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Cement'){
                newCosts[res] = function(){ return Math.round(costs[res]() * discount) || 0; }
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
            let cost = costs[res]();
            global['resource'][res].amount -= cost;
            if (res === 'Knowledge'){
                global.stats.know += cost;
            }
        });
        return true;
    }
    return false;
}

export function checkAffordable(type,action,max){
    if (actions[type][action].cost){
        if (max){
            return checkMaxCosts(adjustCosts(actions[type][action].cost));
        }
        else {
            return checkCosts(adjustCosts(actions[type][action].cost));
        }
    }
    return true;
} 

function checkMaxCosts(costs){
    var test = true;
    Object.keys(costs).forEach(function (res){
        var testCost = Number(costs[res]()) || 0;
        if (testCost > Number(global['resource'][res].max) && Number(global['resource'][res].max) !== -1) {
            test = false;
            return false;
        }
    });
    return test;
}

function checkCosts(costs){
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
    if (global.race['tunneler'] && (structure === 'mine' || structure === 'coal_mine')){ mutiplier -= 0.01; }
    if (global.tech['housing_reduction'] && (structure === 'basic_housing' || structure === 'cottage')){
        mutiplier -= 0.02;
    }
    if (structure === 'basic_housing'){
        if (global.race['solitary']){
            mutiplier -= 0.02;
        }
        if (global.race['pack_mentality']){
            mutiplier += 0.03;
        }
    }
    if (structure === 'cottage'){
        if (global.race['solitary']){
            mutiplier += 0.02;
        }
        if (global.race['pack_mentality']){
            mutiplier -= 0.02;
        }
    }
    if (global.genes['creep']){
        mutiplier -= global.genes['creep'] * 0.01;
    }
    if (mutiplier < 0.01){
        mutiplier = 0.01;
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
        case 'factory':
            factoryModal(body);
            break;
    }
}

function smelterModal(modal){
    let fuel = $('<div><span class="has-text-warning">Fueled:</span> <span class="has-text-info">{{count | on}}/{{ count }}</span></div>');
    modal.append(fuel);

    let fuelTypes = $('<div></div>');
    modal.append(fuelTypes);

    if (!global.race['kindling_kindred']){
        let wood = $(`<b-tooltip :label="buildLabel('wood')" position="is-bottom" animated><span class="current">Wood {{ Wood }}</span></b-tooltip>`);
        let subWood = $('<span class="sub" @click="subWood">&laquo;</span>');
        let addWood = $('<span class="add" @click="addWood">&raquo;</span>');
        fuelTypes.append(subWood);
        fuelTypes.append(wood);
        fuelTypes.append(addWood);
    }

    if (global.resource.Coal.display){
        let coal = $(`<b-tooltip :label="buildLabel('coal')" position="is-bottom" animated><span class="current">Coal {{ Coal }}</span></b-tooltip>`);
        let subCoal = $('<span class="sub" @click="subCoal">&laquo;</span>');
        let addCoal = $('<span class="add" @click="addCoal">&raquo;</span>');
        fuelTypes.append(subCoal);
        fuelTypes.append(coal);
        fuelTypes.append(addCoal);
    }

    if (global.resource.Oil.display){
        let oil = $(`<b-tooltip :label="buildLabel('oil')" position="is-bottom" animated><span class="current">Oil {{ Oil }}</span></b-tooltip>`);
        let subOil = $('<span class="sub" @click="subOil">&laquo;</span>');
        let addOil = $('<span class="add" @click="addOil">&raquo;</span>');
        fuelTypes.append(subOil);
        fuelTypes.append(oil);
        fuelTypes.append(addOil);
    }

    if (global.resource.Steel.display && global.tech.smelting >= 2){
        let smelt = $('<div class="smelting"></div>');
        let ironSmelt = $(`<b-tooltip :label="ironLabel()" position="is-left" size="is-small" animated multilined><button class="button" @click="ironSmelting()">Iron Smelting: {{ Iron }}</button></b-tooltip>`);
        let steelSmelt = $(`<b-tooltip :label="steelLabel()" position="is-right" size="is-small" animated multilined><button class="button" @click="steelSmelting()">Steel Smelting: {{ Steel }}</button></b-tooltip>`);
        modal.append(smelt);
        smelt.append(ironSmelt);
        smelt.append(steelSmelt);
    }

    vues['specialModal'] = new Vue({
        data: global.city['smelter'],
        methods: {
            subWood(){
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
            addWood(){
                if (global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil < global.city.smelter.count){
                    global.city.smelter.Wood++;
                    global.city.smelter.Iron++;
                }
            },
            subCoal(){
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
            addCoal(){
                if (global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil < global.city.smelter.count){
                    global.city.smelter.Coal++;
                    global.city.smelter.Iron++;
                }
            },
            subOil(){
                if (global.city.smelter.Oil > 0){
                    global.city.smelter.Oil--;
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
            addOil(){
                if (global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil < global.city.smelter.count){
                    global.city.smelter.Oil++;
                    global.city.smelter.Iron++;
                }
            },
            ironLabel(){
                let boost = global.tech['smelting'] >= 3 ? 12 : 10;
                if (global.race['pyrophobia']){
                    boost *= 0.9;
                }
                return `Smelt Iron, boosts Iron production by ${boost}%`;
            },
            steelLabel(){
                let boost = global.tech['smelting'] >= 4 ? 1.2 : 1;
                if (global.tech['smelting'] >= 5){
                    boost *= 1.2;
                }
                if (global.tech['smelting'] >= 6){
                    boost *= 1.2;
                }
                if (global.race['pyrophobia']){
                    boost *= 0.9;
                }
                return `Smelt Steel, consumes 0.25 Coal and 2 Iron per second but produces ${boost} Steel`;
            },
            ironSmelting(){
                let count = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil;
                if (global.city.smelter.Iron + global.city.smelter.Steel < count){
                    global.city.smelter.Iron++;
                }
                else if (global.city.smelter.Iron < count && global.city.smelter.Steel > 0){
                    global.city.smelter.Iron++;
                    global.city.smelter.Steel--;
                }
            },
            steelSmelting(){
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
                        let coal_fuel = global.race['kindling_kindred'] ? 0.15 : 0.25;
                        return `Consume ${coal_fuel} Coal/s to fuel a smelter`;
                        break;
                    case 'oil':
                        return 'Consume 0.35 Oil/s to fuel a smelter';
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

function factoryModal(modal){
    let fuel = $('<div><span class="has-text-warning">Operating:</span> <span class="has-text-info">{{count | on}}/{{ on }}</span></div>');
    modal.append(fuel);

    let lux = $(`<div class="factory"><b-tooltip :label="buildLabel('Lux')" position="is-left" size="is-small" multilined animated><span>Luxury Goods</span></b-tooltip></div>`);
    modal.append(lux);

    let luxCount = $(`<span class="current">{{ Lux }}</span>`);
    let subLux = $(`<span class="sub" @click="subItem('Lux')">&laquo;</span>`);
    let addLux = $(`<span class="add" @click="addItem('Lux')">&raquo;</span>`);
    lux.append(subLux);
    lux.append(luxCount);
    lux.append(addLux);

    let alloy = $(`<div class="factory"><b-tooltip :label="buildLabel('Alloy')" position="is-left" size="is-small" multilined animated><span>Alloy</span></b-tooltip></div>`);
    modal.append(alloy);

    let alloyCount = $(`<span class="current">{{ Alloy }}</span>`);
    let subAlloy = $(`<span class="sub" @click="subItem('Alloy')">&laquo;</span>`);
    let addAlloy = $(`<span class="add" @click="addItem('Alloy')">&raquo;</span>`);
    alloy.append(subAlloy);
    alloy.append(alloyCount);
    alloy.append(addAlloy);

    if (global.tech['polymer']){
        let polymer = $(`<div class="factory"><b-tooltip :label="buildLabel('Polymer')" position="is-left" size="is-small" multilined animated><span>Polymer</span></b-tooltip></div>`);
        modal.append(polymer);

        let polymerCount = $(`<span class="current">{{ Polymer }}</span>`);
        let subPolymer= $(`<span class="sub" @click="subItem('Polymer')">&laquo;</span>`);
        let addPolymer = $(`<span class="add" @click="addItem('Polymer')">&raquo;</span>`);
        polymer.append(subPolymer);
        polymer.append(polymerCount);
        polymer.append(addPolymer);
    }

    vues['specialModal'] = new Vue({
        data: global.city['factory'],
        methods: {
            subItem: function(item){
                if (global.city.factory[item] > 0){
                    global.city.factory[item]--;
                }
            },
            addItem: function(item){
                if (global.city.factory.Lux + global.city.factory.Alloy + global.city.factory.Polymer < global.city.factory.on){
                    global.city.factory[item]++;
                }
            },
            buildLabel: function(type){
                switch(type){
                    case 'Lux':
                        let demand = +(global.resource[races[global.race.species].name].amount * 0.14).toFixed(2);
                        return `Consume 2 Furs/s to produce luxury goods worth \$${demand}`;
                        break;
                    case 'Alloy':
                        return 'Consume 0.75 Copper and 0.15 Titanium/s to produce Alloy';
                        break;
                    case 'Polymer':
                        if (global.race['kindling_kindred']){
                            return 'Consume 0.22 Oil/s to produce Polymer';
                        }
                        else {
                            return 'Consume 0.18 Oil and 15 Lumber/s to produce Polymer';
                        }
                        break;
                }
            }
        },
        filters: {
            on: function(count){
                return global.city.factory.Lux + global.city.factory.Alloy + global.city.factory.Polymer;
            }
        }
    });

    vues['specialModal'].$mount('#specialModal');
}

export function evoProgress(){
    $('#evolution .evolving').remove();
    let progress = $(`<div class="evolving"><progress class="progress" value="${global.evolution.final}" max="100">${global.evolution.final}%</progress></div>`);
    $('#evolution').append(progress);
}

export function basicHousingLabel(){
    switch (global.race.species){
        case 'orc':
            return 'Hut';
        case 'wolven':
            return 'Den';
        case 'entish':
            return 'Grove';
        case 'arraak':
            return 'Nest';
        case 'pterodacti':
            return 'Nest';
        default:
            return 'Cabin';
    }
}
