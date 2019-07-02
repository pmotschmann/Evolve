import { global, vues, save, poppers, messageQueue, keyMultiplier, modRes, sizeApproximation, moon_on } from './vars.js';
import { loc } from './locale.js';
import { unlockAchieve } from './achieve.js';
import { races, genus_traits, randomMinorTrait, biomes } from './races.js';
import { defineResources, loadMarket, spatialReasoning, resource_values } from './resources.js';
import { loadFoundry } from './jobs.js';
import { defineGarrison, buildGarrison, armyRating, challenge_multiplier } from './civics.js';
import { spaceTech, space } from './space.js';
import { arpa, gainGene } from './arpa.js';

export const actions = {
    evolution: {
        rna: {
            id: 'evo-rna',
            title: 'RNA',
            desc(){
                let rna = global.race['rapid_mutation'] ? 2 : 1;
                return loc('evo_rna',[rna]);
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
            title: loc('evo_dna_title'),
            desc: loc('evo_dna_desc'),
            cost: { RNA(){ return 2; } },
            action(){
                if (global['resource']['RNA'].amount >= 2 && global['resource']['DNA'].amount < global['resource']['DNA'].max){
                    modRes('RNA',-2);
                    modRes('DNA',1);
                }
                return false;
            },
            effect: loc('evo_dna_effect')
        },
        membrane: {
            id: 'evo-membrane',
            title: loc('evo_membrane_title'),
            desc: loc('evo_membrane_desc'),
            cost: { RNA(){ return (global.evolution['membrane'].count * 2) + 2; } },
            effect(){
                let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 5 + 5 : 5;
                return loc('evo_membrane_effect',[effect]);
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
            title: loc('evo_organelles_title'),
            desc: loc('evo_organelles_desc'),
            cost: {
                RNA(){ return (global.evolution['organelles'].count * 8) + 12; },
                DNA(){ return (global.evolution['organelles'].count * 4) + 4; }
            },
            effect(){
                let rna = global.race['rapid_mutation'] ? 2 : 1;
                if (global.evolution['sexual_reproduction'] && global.evolution['sexual_reproduction'].count > 0){
                    rna++;
                }
                return loc('evo_organelles_effect',[rna]); 
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
            title: loc('evo_nucleus_title'),
            desc: loc('evo_nucleus_desc'),
            cost: {
                RNA(){ return (global.evolution['nucleus'].count * (global.evolution['multicellular'] && global.evolution['multicellular'].count > 0 ? 16 : 32)) + 38; },
                DNA(){ return (global.evolution['nucleus'].count * (global.evolution['multicellular'] && global.evolution['multicellular'].count > 0 ? 12 : 16)) + 18; }
            },
            effect(){
                let dna = global.evolution['bryophyte'] || global.evolution['protostomes'] || global.evolution['deuterostome'] ? 2 : 1;
                return loc('evo_nucleus_effect',[dna]);
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
            title: loc('evo_eukaryotic_title'),
            desc: loc('evo_eukaryotic_desc'),
            cost: {
                RNA(){ return (global.evolution['eukaryotic_cell'].count * 20) + 20; },
                DNA(){ return (global.evolution['eukaryotic_cell'].count * 12) + 40; }
            },
            effect(){
                let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 10 + 10 : 10;
                return loc('evo_eukaryotic_effect',[effect]);
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
            title: loc('evo_mitochondria_title'),
            desc: loc('evo_mitochondria_desc'),
            cost: {
                RNA(){ return (global.evolution['mitochondria'].count * 50) + 75; },
                DNA(){ return (global.evolution['mitochondria'].count * 35) + 65; }
            },
            effect: loc('evo_mitochondria_effect'),
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
            title: loc('evo_sexual_reproduction_title'),
            desc: loc('evo_sexual_reproduction_desc'),
            cost: {
                DNA(){ return 150; }
            },
            effect: loc('evo_sexual_reproduction_effect'),
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
            title: loc('evo_phagocytosis_title'),
            desc: loc('evo_phagocytosis_desc'),
            cost: {
                DNA(){ return 175; }
            },
            effect: loc('evo_phagocytosis_effect'),
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
            title: loc('evo_chloroplasts_title'),
            desc: loc('evo_chloroplasts_desc'),
            cost: {
                DNA(){ return 175; }
            },
            effect: loc('evo_chloroplasts_effect'),
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
            title: loc('evo_chitin_title'),
            desc: loc('evo_chitin_desc'),
            cost: {
                DNA(){ return 175; }
            },
            effect: loc('evo_chitin_effect'),
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
            title: loc('evo_multicellular_title'),
            desc: loc('evo_multicellular_desc'),
            cost: {
                DNA(){ return 200; }
            },
            effect: loc('evo_multicellular_effect'),
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
            title: loc('evo_spores_title'),
            desc: loc('evo_spores_desc'),
            cost: {
                DNA(){ return 230; }
            },
            effect: loc('evo_nucleus_boost'),
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
            title: loc('evo_poikilohydric_title'),
            desc: loc('evo_poikilohydric_desc'),
            cost: {
                DNA(){ return 230; }
            },
            effect: loc('evo_nucleus_boost'),
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
            title: loc('evo_bilateral_symmetry_title'),
            desc: loc('evo_bilateral_symmetry_desc'),
            cost: {
                DNA(){ return 230; }
            },
            effect: loc('evo_nucleus_boost'),
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

                    if (global.city.biome === 'oceanic'){
                        global.evolution['aquatic'] = { count: 0 };
                        addAction('evolution','aquatic');
                    }

                    evoProgress();
                }
                return false;
            }
        },
        bryophyte: {
            id: 'evo-bryophyte',
            title: loc('evo_bryophyte_title'),
            desc: loc('evo_bryophyte_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_bryophyte_effect'),
            action(){
                if (payCosts(actions.evolution.bryophyte.cost)){
                    global.evolution['bryophyte'].count++;
                    removeAction(actions.evolution.bryophyte.id);
                    global.evolution['final'] = 100;
                    global.evolution['sentience'] = { count: 0 };
                    addAction('evolution','sentience');
                    if (global.race.seeded){
                        if (global.evolution['chitin']){
                            global.evolution['sporgar'] = { count: 0 };
                            global.evolution['shroomi'] = { count: 0 };
                            addAction('evolution','sporgar');
                            addAction('evolution','shroomi');
                        }
                        else {
                            global.evolution['entish'] = { count: 0 };
                            global.evolution['cacti'] = { count: 0 };
                            addAction('evolution','entish');
                            addAction('evolution','cacti');
                        }
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        athropods: {
            id: 'evo-athropods',
            title: loc('evo_bryophyte_title'),
            desc: loc('evo_athropods_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_athropods_effect'),
            action(){
                if (payCosts(actions.evolution.athropods.cost)){
                    global.evolution['athropods'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    delete global.evolution.mammals;
                    delete global.evolution.eggshell;
                    if (global.city.biome === 'oceanic'){
                        removeAction(actions.evolution.aquatic.id);
                        delete global.evolution.aquatic;
                    }
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded){
                        global.evolution['mantis'] = { count: 0 };
                        global.evolution['scorpid'] = { count: 0 };
                        global.evolution['antid'] = { count: 0 };
                        addAction('evolution','mantis');
                        addAction('evolution','scorpid');
                        addAction('evolution','antid');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        mammals: {
            id: 'evo-mammals',
            title: loc('evo_mammals_title'),
            desc: loc('evo_mammals_desc'),
            cost: {
                DNA(){ return 245; }
            },
            effect: loc('evo_mammals_effect'),
            action(){
                if (payCosts(actions.evolution.mammals.cost)){
                    global.evolution['mammals'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    delete global.evolution.athropods;
                    delete global.evolution.eggshell;
                    if (global.city.biome === 'oceanic'){
                        removeAction(actions.evolution.aquatic.id);
                        delete global.evolution.aquatic;
                    }
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
            title: loc('evo_humanoid_title'),
            desc: loc('evo_humanoid_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_humanoid_effect'),
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
                    if (global.race.seeded){
                        global.evolution['human'] = { count: 0 };
                        global.evolution['orc'] = { count: 0 };
                        global.evolution['elven'] = { count: 0 };
                        addAction('evolution','human');
                        addAction('evolution','orc');
                        addAction('evolution','elven');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        gigantism: {
            id: 'evo-gigantism',
            title: loc('evo_gigantism_title'),
            desc: loc('evo_gigantism_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_gigantism_effect'),
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
                    if (global.race.seeded){
                        global.evolution['troll'] = { count: 0 };
                        global.evolution['orge'] = { count: 0 };
                        global.evolution['cyclops'] = { count: 0 };
                        addAction('evolution','troll');
                        addAction('evolution','orge');
                        addAction('evolution','cyclops');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        dwarfism: {
            id: 'evo-dwarfism',
            title: loc('evo_dwarfism_title'),
            desc: loc('evo_dwarfism_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_dwarfism_effect'),
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
                    if (global.race.seeded){
                        global.evolution['kobold'] = { count: 0 };
                        global.evolution['goblin'] = { count: 0 };
                        global.evolution['gnome'] = { count: 0 };
                        addAction('evolution','kobold');
                        addAction('evolution','goblin');
                        addAction('evolution','gnome');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        aquatic: {
            id: 'evo-aquatic',
            title: loc('evo_aquatic_title'),
            desc: loc('evo_aquatic_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_aquatic_effect'),
            action(){
                if (payCosts(actions.evolution.aquatic.cost)){
                    global.evolution['aquatic'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    removeAction(actions.evolution.aquatic.id);
                    delete global.evolution.athropods;
                    delete global.evolution.mammals;
                    delete global.evolution.eggshell;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded){
                        global.evolution['sharkin'] = { count: 0 };
                        global.evolution['octigoran'] = { count: 0 };
                        addAction('evolution','sharkin');
                        addAction('evolution','octigoran');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        animalism: {
            id: 'evo-animalism',
            title: loc('evo_animalism_title'),
            desc: loc('evo_animalism_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_animalism_effect'),
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
                    if (global.race.seeded){
                        global.evolution['cath'] = { count: 0 };
                        global.evolution['wolven'] = { count: 0 };
                        global.evolution['centaur'] = { count: 0 };
                        addAction('evolution','cath');
                        addAction('evolution','wolven');
                        addAction('evolution','centaur');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        eggshell: {
            id: 'evo-eggshell',
            title: loc('evo_eggshell_title'),
            desc: loc('evo_eggshell_desc'),
            cost: {
                DNA(){ return 245; }
            },
            effect: loc('evo_eggshell_effect'),
            action(){
                if (payCosts(actions.evolution.eggshell.cost)){
                    global.evolution['eggshell'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    delete global.evolution.athropods;
                    delete global.evolution.mammals;
                    if (global.city.biome === 'oceanic'){
                        removeAction(actions.evolution.aquatic.id);
                        delete global.evolution.aquatic;
                    }
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
            title: loc('evo_endothermic_title'),
            desc: loc('evo_endothermic_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_endothermic_effect'),
            action(){
                if (payCosts(actions.evolution.endothermic.cost)){
                    global.evolution['endothermic'].count++;
                    removeAction(actions.evolution.endothermic.id);
                    removeAction(actions.evolution.ectothermic.id);
                    delete global.evolution.ectothermic;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded){
                        global.evolution['arraak'] = { count: 0 };
                        global.evolution['pterodacti'] = { count: 0 };
                        global.evolution['dracnid'] = { count: 0 };
                        addAction('evolution','arraak');
                        addAction('evolution','pterodacti');
                        addAction('evolution','dracnid');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        ectothermic: {
            id: 'evo-ectothermic',
            title: loc('evo_ectothermic_title'),
            desc: loc('evo_ectothermic_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_ectothermic_effect'),
            action(){
                if (payCosts(actions.evolution.ectothermic.cost)){
                    global.evolution['ectothermic'].count++;
                    removeAction(actions.evolution.endothermic.id);
                    removeAction(actions.evolution.ectothermic.id);
                    delete global.evolution.endothermic;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded){
                        global.evolution['tortoisan'] = { count: 0 };
                        global.evolution['gecko'] = { count: 0 };
                        global.evolution['slitheryn'] = { count: 0 };
                        addAction('evolution','tortoisan');
                        addAction('evolution','gecko');
                        addAction('evolution','slitheryn');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        sentience: {
            id: 'evo-sentience',
            title: loc('evo_sentience_title'),
            desc: loc('evo_sentience_desc'),
            cost: {
                RNA(){ return 300; },
                DNA(){ return 300; }
            },
            effect: loc('evo_sentience_effect'),
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
                    else if (global.evolution['aquatic']){
                        if (path < 50){
                            global.race.species = 'sharkin';
                        }
                        else {
                            global.race.species = 'octigoran';
                        }
                    }
                    else if (global.evolution['eggshell']){
                        global.race.species = 'dracnid';
                    }
                    else {
                        global.race.species = 'human';
                    }

                    sentience();
                }
                return false;
            },
        },
        human: {
            id: 'evo-human',
            title(){ return races.human.name; },
            desc(){ return `${loc("evo_evolve")} ${races.human.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.human.name]); },
            action(){
                if (payCosts(actions.evolution.human.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'human';
                    sentience();
                }
                return false;
            }
        },
        orc: {
            id: 'evo-orc',
            title(){ return races.orc.name; },
            desc(){ return `${loc("evo_evolve")} ${races.orc.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.orc.name]); },
            action(){
                if (payCosts(actions.evolution.orc.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'orc';
                    sentience();
                }
                return false;
            }
        },
        elven: {
            id: 'evo-elven',
            title(){ return races.elven.name; },
            desc(){ return `${loc("evo_evolve")} ${races.elven.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.elven.name]); },
            action(){
                if (payCosts(actions.evolution.elven.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'elven';
                    sentience();
                }
                return false;
            }
        },
        troll: {
            id: 'evo-troll',
            title(){ return races.troll.name; },
            desc(){ return `${loc("evo_evolve")} ${races.troll.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.troll.name]); },
            action(){
                if (payCosts(actions.evolution.troll.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'troll';
                    sentience();
                }
                return false;
            }
        },
        orge: {
            id: 'evo-orge',
            title(){ return races.orge.name; },
            desc(){ return `${loc("evo_evolve")} ${races.orge.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.orge.name]); },
            action(){
                if (payCosts(actions.evolution.orge.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'orge';
                    sentience();
                }
                return false;
            }
        },
        cyclops: {
            id: 'evo-cyclops',
            title(){ return races.cyclops.name; },
            desc(){ return `${loc("evo_evolve")} ${races.cyclops.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.cyclops.name]); },
            action(){
                if (payCosts(actions.evolution.cyclops.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'cyclops';
                    sentience();
                }
                return false;
            }
        },
        kobold: {
            id: 'evo-kobold',
            title(){ return races.kobold.name; },
            desc(){ return `${loc("evo_evolve")} ${races.kobold.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.kobold.name]); },
            action(){
                if (payCosts(actions.evolution.kobold.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'kobold';
                    sentience();
                }
                return false;
            }
        },
        goblin: {
            id: 'evo-goblin',
            title(){ return races.goblin.name; },
            desc(){ return `${loc("evo_evolve")} ${races.goblin.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.goblin.name]); },
            action(){
                if (payCosts(actions.evolution.goblin.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'goblin';
                    sentience();
                }
                return false;
            }
        },
        gnome: {
            id: 'evo-gnome',
            title(){ return races.gnome.name; },
            desc(){ return `${loc("evo_evolve")} ${races.gnome.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.gnome.name]); },
            action(){
                if (payCosts(actions.evolution.gnome.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'gnome';
                    sentience();
                }
                return false;
            }
        },
        cath: {
            id: 'evo-cath',
            title(){ return races.cath.name; },
            desc(){ return `${loc("evo_evolve")} ${races.cath.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.cath.name]); },
            action(){
                if (payCosts(actions.evolution.cath.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'cath';
                    sentience();
                }
                return false;
            }
        },
        wolven: {
            id: 'evo-wolven',
            title(){ return races.wolven.name; },
            desc(){ return `${loc("evo_evolve")} ${races.wolven.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.wolven.name]); },
            action(){
                if (payCosts(actions.evolution.wolven.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'wolven';
                    sentience();
                }
                return false;
            }
        },
        centaur: {
            id: 'evo-centaur',
            title(){ return races.centaur.name; },
            desc(){ return `${loc("evo_evolve")} ${races.centaur.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.centaur.name]); },
            action(){
                if (payCosts(actions.evolution.centaur.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'centaur';
                    sentience();
                }
                return false;
            }
        },
        tortoisan: {
            id: 'evo-tortoisan',
            title(){ return races.tortoisan.name; },
            desc(){ return `${loc("evo_evolve")} ${races.tortoisan.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.tortoisan.name]); },
            action(){
                if (payCosts(actions.evolution.tortoisan.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'tortoisan';
                    sentience();
                }
                return false;
            }
        },
        gecko: {
            id: 'evo-gecko',
            title(){ return races.gecko.name; },
            desc(){ return `${loc("evo_evolve")} ${races.gecko.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.gecko.name]); },
            action(){
                if (payCosts(actions.evolution.gecko.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'gecko';
                    sentience();
                }
                return false;
            }
        },
        slitheryn: {
            id: 'evo-slitheryn',
            title(){ return races.slitheryn.name; },
            desc(){ return `${loc("evo_evolve")} ${races.slitheryn.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.slitheryn.name]); },
            action(){
                if (payCosts(actions.evolution.slitheryn.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'slitheryn';
                    sentience();
                }
                return false;
            }
        },
        arraak: {
            id: 'evo-arraak',
            title(){ return races.arraak.name; },
            desc(){ return `${loc("evo_evolve")} ${races.arraak.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.arraak.name]); },
            action(){
                if (payCosts(actions.evolution.arraak.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'arraak';
                    sentience();
                }
                return false;
            }
        },
        pterodacti: {
            id: 'evo-pterodacti',
            title(){ return races.pterodacti.name; },
            desc(){ return `${loc("evo_evolve")} ${races.pterodacti.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.pterodacti.name]); },
            action(){
                if (payCosts(actions.evolution.pterodacti.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'pterodacti';
                    sentience();
                }
                return false;
            }
        },
        dracnid: {
            id: 'evo-dracnid',
            title(){ return races.dracnid.name; },
            desc(){ return `${loc("evo_evolve")} ${races.dracnid.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.dracnid.name]); },
            action(){
                if (payCosts(actions.evolution.dracnid.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'dracnid';
                    sentience();
                }
                return false;
            }
        },
        sporgar: {
            id: 'evo-sporgar',
            title(){ return races.sporgar.name; },
            desc(){ return `${loc("evo_evolve")} ${races.sporgar.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.sporgar.name]); },
            action(){
                if (payCosts(actions.evolution.sporgar.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'sporgar';
                    sentience();
                }
                return false;
            }
        },
        shroomi: {
            id: 'evo-shroomi',
            title(){ return races.shroomi.name; },
            desc(){ return `${loc("evo_evolve")} ${races.shroomi.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.shroomi.name]); },
            action(){
                if (payCosts(actions.evolution.shroomi.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'shroomi';
                    sentience();
                }
                return false;
            }
        },
        mantis: {
            id: 'evo-mantis',
            title(){ return races.mantis.name; },
            desc(){ return `${loc("evo_evolve")} ${races.mantis.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.mantis.name]); },
            action(){
                if (payCosts(actions.evolution.mantis.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'mantis';
                    sentience();
                }
                return false;
            }
        },
        scorpid: {
            id: 'evo-scorpid',
            title(){ return races.scorpid.name; },
            desc(){ return `${loc("evo_evolve")} ${races.scorpid.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.scorpid.name]); },
            action(){
                if (payCosts(actions.evolution.scorpid.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'scorpid';
                    sentience();
                }
                return false;
            }
        },
        antid: {
            id: 'evo-antid',
            title(){ return races.antid.name; },
            desc(){ return `${loc("evo_evolve")} ${races.antid.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.antid.name]); },
            action(){
                if (payCosts(actions.evolution.antid.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'antid';
                    sentience();
                }
                return false;
            }
        },
        entish: {
            id: 'evo-entish',
            title(){ return races.entish.name; },
            desc(){ return `${loc("evo_evolve")} ${races.entish.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.entish.name]); },
            action(){
                if (payCosts(actions.evolution.entish.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'entish';
                    sentience();
                }
                return false;
            }
        },
        cacti: {
            id: 'evo-cacti',
            title(){ return races.cacti.name; },
            desc(){ return `${loc("evo_evolve")} ${races.cacti.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.cacti.name]); },
            action(){
                if (payCosts(actions.evolution.cacti.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'cacti';
                    sentience();
                }
                return false;
            }
        },
        sharkin: {
            id: 'evo-sharkin',
            title(){ return races.sharkin.name; },
            desc(){ return `${loc("evo_evolve")} ${races.sharkin.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.sharkin.name]); },
            action(){
                if (payCosts(actions.evolution.sharkin.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'sharkin';
                    sentience();
                }
                return false;
            }
        },
        octigoran: {
            id: 'evo-octigoran',
            title(){ return races.octigoran.name; },
            desc(){ return `${loc("evo_evolve")} ${races.octigoran.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.octigoran.name]); },
            action(){
                if (payCosts(actions.evolution.octigoran.cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'octigoran';
                    sentience();
                }
                return false;
            }
        },
        bunker: {
            id: 'evo-bunker',
            title: 'Bunker Gene',
            desc(){ return `<div>Bunker Gene</div><div class="has-text-special">${loc('evo_challenge')}</div>`; },
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_bunker'),
            action(){
                if (payCosts(actions.evolution.bunker.cost)){
                    global.evolution['bunker'] = { count: 1 };
                    removeAction(actions.evolution.bunker.id);
                    global.evolution['plasmid'] = { count: 0 };
                    global.evolution['trade'] = { count: 0 };
                    global.evolution['craft'] = { count: 0 };
                    global.evolution['crispr'] = { count: 0 };
                    addAction('evolution','plasmid');
                    addAction('evolution','trade');
                    addAction('evolution','craft');
                    addAction('evolution','crispr');
                    evoProgress();
                }
                return false;
            }
        },
        plasmid: {
            id: 'evo-plasmid',
            title: loc('evo_challenge_pladmid'),
            desc: loc('evo_challenge_pladmid'),
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_challenge_pladmid_effect'),
            action(){
                if (payCosts(actions.evolution.plasmid.cost)){
                    global.race['no_plasmid'] = 1;
                    global.evolution['plasmid'] = { count: 1 };
                    removeAction(actions.evolution.plasmid.id);
                    evoProgress();
                }
                return false;
            }
        },
        trade: {
            id: 'evo-trade',
            title: loc('evo_challenge_trade'),
            desc: loc('evo_challenge_trade'),
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_challenge_trade_effect'),
            action(){
                if (payCosts(actions.evolution.trade.cost)){
                    global.race['no_trade'] = 1;
                    global.evolution['trade'] = { count: 1 };
                    removeAction(actions.evolution.trade.id);
                    evoProgress();
                }
                return false;
            }
        },
        craft: {
            id: 'evo-craft',
            title: loc('evo_challenge_craft'),
            desc: loc('evo_challenge_craft'),
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_challenge_craft_effect'),
            action(){
                if (payCosts(actions.evolution.craft.cost)){
                    global.race['no_craft'] = 1;
                    global.evolution['craft'] = { count: 1 };
                    removeAction(actions.evolution.craft.id);
                    evoProgress();
                }
                return false;
            }
        },
        crispr: {
            id: 'evo-crispr',
            title: loc('evo_challenge_crispr'),
            desc: loc('evo_challenge_crispr_desc'),
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_challenge_crispr_effect'),
            action(){
                if (payCosts(actions.evolution.crispr.cost)){
                    global.race['no_crispr'] = 1;
                    global.evolution['crispr'] = { count: 1 };
                    removeAction(actions.evolution.crispr.id);
                    evoProgress();
                }
                return false;
            }
        },
    },
    city: {
        food: {
            id: 'city-food',
            title: loc('city_food'),
            desc: loc('city_food_desc'),
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
            title: loc('city_lumber'),
            desc: loc('city_lumber_desc'),
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
            title: loc('city_stone'),
            desc: loc('city_stone_desc'),
            reqs: { primitive: 2 },
            action(){
                if(global['resource']['Stone'].amount < global['resource']['Stone'].max){
                    modRes('Stone',global.race['strong'] ? 2 : 1);
                }
                return false;
            }
        },
        basic_housing: {
            id: 'city-house',
            title(){
                return basicHousingLabel();
            },
            desc: loc('city_basic_housing_desc'),
            reqs: { housing: 1 },
            cost: { 
                Money(){ 
                    if (global.city['basic_housing'] && global.city['basic_housing'].count >= 5){ 
                        return costMultiplier('basic_housing', 20, 1.17);
                    } 
                    else { 
                        return 0; 
                    } 
                },
                Lumber(){ return global.race['kindling_kindred'] ? 0 : costMultiplier('basic_housing', 10, 1.23); },
                Stone(){ return global.race['kindling_kindred'] ? costMultiplier('basic_housing', 10, 1.23) : 0; }
            },
            effect: loc('city_one_citizen'),
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
            title(){
                return global.race.species === 'sporgar' ? loc('city_cottage_title2') : loc('city_cottage_title1');
            },
            desc: loc('city_cottage_desc'),
            reqs: { housing: 2 },
            cost: { 
                Money(){ return costMultiplier('cottage', 900, 1.15); },
                Plywood(){ return costMultiplier('cottage', 25, 1.25); },
                Brick(){ return costMultiplier('cottage', 20, 1.25); },
                Wrought_Iron(){ return costMultiplier('cottage', 15, 1.25); }
            },
            effect(){
                if (global.tech['home_safe']){
                    let safe = spatialReasoning(global.tech.home_safe > 1 ? 2000 : 1000);
                    return `<div>${loc('city_cottage_effect')}</div><div>${loc('city_max_money',[safe])}</div>`;
                }
                else {
                    return loc('city_cottage_effect');
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
            title(){
                return global.race.species === 'sporgar' ? loc('city_apartment_title2') : loc('city_apartment_title1');
            },
            desc: `<div>${loc('city_apartment_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { housing: 3 },
            cost: { 
                Money(){ return costMultiplier('apartment', 1750, 1.26) - 500; },
                Furs(){ return costMultiplier('apartment', 725, 1.32) - 500; },
                Copper(){ return costMultiplier('apartment', 650, 1.32) - 500; },
                Cement(){ return costMultiplier('apartment', 700, 1.32) - 500; },
                Steel(){ return costMultiplier('apartment', 800, 1.32) - 500; }
            },
            effect(){
                if (global.tech['home_safe']){
                    let safe = spatialReasoning(global.tech.home_safe > 1 ? 5000 : 2000);
                    return `<div>${loc('city_apartment_effect')}</div><div>${loc('city_max_money',[safe])}</div>`;
                }
                else {
                    return loc('city_apartment_effect');
                }
            },
            powered: 1,
            action(){
                if (payCosts(actions.city.apartment.cost)){
                    global.city['apartment'].count++;
                    if (global.city.power > 0){
                        global['resource'][races[global.race.species].name].max += 5;
                        global.city['apartment'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        lodge: {
            id: 'city-lodge',
            title: loc('city_lodge'),
            desc: loc('city_lodge_desc'),
            reqs: { hunting: 2 },
            cost: { 
                Money(){ return costMultiplier('lodge', 50, 1.32); },
                Lumber(){ return costMultiplier('lodge', 20, 1.36); },
                Stone(){ return costMultiplier('lodge', 10, 1.36); }
            },
            effect(){ return loc('city_one_citizen'); },
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
            title: loc('city_smokehouse'),
            desc: loc('city_food_storage'),
            reqs: { hunting: 1 },
            cost: { 
                Money(){ return costMultiplier('smokehouse', 85, 1.32); },
                Lumber(){ return costMultiplier('smokehouse', 65, 1.36) },
                Stone(){ return costMultiplier('smokehouse', 50, 1.36); }
            },
            effect(){ 
                let food = spatialReasoning(500);
                if (global.stats.achieve['blackhole']){ food = Math.round(food * (1 + (global.stats.achieve.blackhole * 0.05))) };
                return loc('city_max_food',[food]); 
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
            title: loc('city_farm'),
            desc: loc('city_farm_desc'),
            reqs: { agriculture: 1 },
            cost: { 
                Money(){ if (global.city['farm'] && global.city['farm'].count >= 3){ return costMultiplier('farm', 50, 1.32);} else { return 0; } },
                Lumber(){ return costMultiplier('farm', 20, 1.36); },
                Stone(){ return costMultiplier('farm', 10, 1.36); }
            },
            effect(){
                let farming = global.tech['agriculture'] >= 2 ? 1.25 : 0.75;
                farming *= global.city.biome === 'grassland' ? 1.1 : 1;
                farming *= global.tech['agriculture'] >= 7 ? 1.1 : 1;
                farming = +farming.toFixed(2);
                return global.tech['farm'] ? `<div>${loc('city_farm_effect',[farming])}</div><div>${loc('city_one_citizen')}</div>` : loc('city_farm_effect',[farming]); 
            },
            action(){
                if (payCosts(actions.city.farm.cost)){
                    global.city['farm'].count++;
                    global.civic.farmer.display = true;
                    if (global.tech['farm']){
                        global['resource'][races[global.race.species].name].max += 1;
                    }
                    return true;
                }
                return false;
            },
            flair(){ return global.tech.agriculture >= 7 ? loc('city_farm_flair2') : loc('city_farm_flair1'); }
        },
        mill: {
            id: 'city-mill',
            title(){
                return global.tech['agriculture'] >= 5 ? loc('city_mill_title2') : loc('city_mill_title1');
            },
            desc(){ 
                let bonus = global.tech['agriculture'] >= 5 ? 5 : 3;
                if (global.tech['agriculture'] >= 6){
                    return loc('city_mill_desc2',[bonus]);
                }
                else {
                    return loc('city_mill_desc1',[bonus]);
                }
            },
            reqs: { agriculture: 4 },
            cost: { 
                Money(){ return costMultiplier('mill', 1000, 1.31); },
                Lumber(){ return costMultiplier('mill', 600, 1.33); },
                Iron(){ return costMultiplier('mill', 150, 1.33); },
                Cement(){ return costMultiplier('mill', 125, 1.33); },
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
                    return `<span class="has-text-success">${loc('city_on')}</span> ${loc('city_mill_effect1')} <span class="has-text-danger">${loc('city_off')}</span> ${loc('city_mill_effect2')}`;
                }
                else {
                    return false;
                }
            }
        },
        silo: {
            id: 'city-silo',
            title: loc('city_silo'),
            desc: loc('city_food_storage'),
            reqs: { agriculture: 3 },
            cost: { 
                Money(){ return costMultiplier('silo', 85, 1.32); },
                Lumber(){ return costMultiplier('silo', 65, 1.36) },
                Stone(){ return costMultiplier('silo', 50, 1.36); }
            },
            effect(){ 
                let food = spatialReasoning(500);
                if (global.stats.achieve['blackhole']){ food = Math.round(food * (1 + (global.stats.achieve.blackhole * 0.05))) };
                return loc('city_max_food',[food]);
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
        garrison: {
            id: 'city-garrison',
            title: loc('city_garrison'),
            desc: loc('city_garrison_desc'),
            reqs: { military: 1, housing: 1 },
            cost: { 
                Money(){ return costMultiplier('garrison', 240, 1.5); },
                Stone(){ return costMultiplier('garrison', 260, 1.46); }
            },
            effect(){
                let bunks = global.tech['military'] >= 5 ? 3 : 2;
                if (global.race['chameleon']){
                    bunks--;
                }
                return loc('city_garrison_effect',[bunks]);
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
        hospital: {
            id: 'city-hospital',
            title: loc('city_hospital'),
            desc: loc('city_hospital_desc'),
            reqs: { medic: 1 },
            cost: { 
                Money(){ return costMultiplier('hospital', 22000, 1.32); },
                Furs(){ return costMultiplier('hospital', 4000, 1.32); },
                Aluminium(){ return costMultiplier('hospital', 10000, 1.32); }
            },
            effect(){
                return loc('city_hospital_effect',[5]);
            },
            action(){
                if (payCosts(actions.city.hospital.cost)){
                    global.city['hospital'].count++;
                    return true;
                }
                return false;
            }
        },
        boot_camp: {
            id: 'city-boot_camp',
            title: loc('city_boot_camp'),
            desc: loc('city_boot_camp_desc'),
            reqs: { boot_camp: 1 },
            cost: { 
                Money(){ return costMultiplier('boot_camp', 50000, 1.32); },
                Lumber(){ return costMultiplier('boot_camp', 21500, 1.32); },
                Aluminium(){ return costMultiplier('boot_camp', 12000, 1.32); },
                Brick(){ return costMultiplier('boot_camp', 2800, 1.32); }
            },
            effect(){
                return loc('city_boot_camp_effect',[5]);
            },
            action(){
                if (payCosts(actions.city.boot_camp.cost)){
                    global.city['boot_camp'].count++;
                    return true;
                }
                return false;
            }
        },
        shed: {
            id: 'city-shed',
            title(){ 
                return global.tech['storage'] <= 2 ? loc('city_shed_title1') : (global.tech['storage'] >= 4 ? loc('city_shed_title3') : loc('city_shed_title2')); 
            },
            desc(){
                let storage = global.tech['storage'] >= 3 ? (global.tech['storage'] >= 4 ? loc('city_shed_desc_size3') : loc('city_shed_desc_size2')) : loc('city_shed_desc_size1');
                return loc('city_shed_desc',[storage]);
            },
            reqs: { storage: 1 },
            cost: {
                Money(){ return costMultiplier('shed', 75, 1.22); },
                Lumber(){
                    if (global.tech['storage'] && global.tech['storage'] < 4){ 
                        return costMultiplier('shed', 55, 1.32);
                    }
                    else { 
                        return 0; 
                    }
                },
                Stone(){
                    if (global.tech['storage'] && global.tech['storage'] < 3){ 
                        return costMultiplier('shed', 45, 1.32);
                    }
                    else { 
                        return 0; 
                    }
                },
                Iron(){
                    if (global.tech['storage'] && global.tech['storage'] >= 4){
                        return costMultiplier('shed', 22, 1.32);
                    }
                    else {
                        return 0; 
                    }
                },
                Cement(){ 
                    if (global.tech['storage'] && global.tech['storage'] >= 3){
                        return costMultiplier('shed', 18, 1.32);
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
                    let val = sizeApproximation(+(spatialReasoning(300) * multiplier).toFixed(0),1);
                    storage = storage + `+${val} ${loc('max')} ${loc('resource_Lumber_name')}. `;
                }
                if (global.resource.Stone.display){
                    let val = sizeApproximation(+(spatialReasoning(300) * multiplier).toFixed(0),1);
                    storage = storage + `+${val} ${loc('max')} ${loc('resource_Stone_name')}. `;
                }
                if (global.resource.Furs.display){
                    let val = sizeApproximation(+(spatialReasoning(125) * multiplier).toFixed(0),1);
                    storage = storage + `+${val} ${loc('max')} ${loc('resource_Furs_name')}. `;
                }
                if (global.resource.Copper.display){
                    let val = sizeApproximation(+(spatialReasoning(90) * multiplier).toFixed(0),1);
                    storage = storage + `+${val} ${loc('max')} ${loc('resource_Copper_name')}. `;
                }
                if (global.resource.Iron.display){
                    let val = sizeApproximation(+(spatialReasoning(125) * multiplier).toFixed(0),1);
                    storage = storage + `+${val} ${loc('max')} ${loc('resource_Iron_name')}. `;
                }
                if (global.resource.Aluminium.display){
                    let val = sizeApproximation(+(spatialReasoning(90) * multiplier).toFixed(0),1);
                    storage = storage + `+${val} ${loc('max')} ${loc('resource_Aluminium_name')}. `;
                }
                if (global.resource.Cement.display){
                    let val = sizeApproximation(+(spatialReasoning(100) * multiplier).toFixed(0),1);
                    storage = storage + `+${val} ${loc('max')} ${loc('resource_Cement_name')}. `;
                }
                if (global.resource.Coal.display){
                    let val = sizeApproximation(+(spatialReasoning(75) * multiplier).toFixed(0),1);
                    storage = storage + `+${val} ${loc('max')} ${loc('resource_Coal_name')}. `;
                }
                if (global.tech['storage'] >= 3 && global.resource.Steel.display){
                    let val = sizeApproximation(+(spatialReasoning(40) * multiplier).toFixed(0),1);
                    storage = storage + `+${val} ${loc('max')} ${loc('resource_Steel_name')}. `;
                }
                if (global.tech['storage'] >= 4 && global.resource.Titanium.display){
                    let val = sizeApproximation(+(spatialReasoning(20) * multiplier).toFixed(0),1);
                    storage = storage + `+${val} ${loc('max')} ${loc('resource_Titanium_name')}.`;
                }
                return storage;
            },
            action(){
                if (payCosts(actions.city.shed.cost)){
                    let multiplier = storageMultipler();
                    global['resource']['Lumber'].max += (spatialReasoning(300) * multiplier);
                    global['resource']['Stone'].max += (spatialReasoning(300) * multiplier);
                    global['resource']['Copper'].max += (spatialReasoning(90) * multiplier);
                    global['resource']['Iron'].max += (spatialReasoning(125) * multiplier);
                    global['resource']['Aluminium'].max += (spatialReasoning(90) * multiplier);
                    global['resource']['Furs'].max += (spatialReasoning(125) * multiplier);
                    global['resource']['Cement'].max += (spatialReasoning(100) * multiplier);
                    global['resource']['Coal'].max += (spatialReasoning(75) * multiplier);
                    if (global.tech['storage'] >= 3){
                        global['resource']['Steel'].max += (global.city['shed'].count * (spatialReasoning(40) * multiplier));
                    }
                    if (global.tech['storage'] >= 4){
                        global['resource']['Titanium'].max += (global.city['shed'].count * (spatialReasoning(20) * multiplier));
                    }
                    global.city['shed'].count++;
                    return true;
                }
                return false;
            }
        },
        storage_yard: {
            id: 'city-storage_yard',
            title: loc('city_storage_yard'),
            desc: loc('city_storage_yard_desc'),
            reqs: { container: 1 },
            cost: {
                Money(){ return costMultiplier('storage_yard', 10, 1.36); },
                Brick(){ return costMultiplier('storage_yard', 3, 1.35); },
                Wrought_Iron(){ return costMultiplier('storage_yard', 5, 1.35); }
            },
            effect(){
                let cap = global.tech.container >= 3 ? 20 : 10;
                if (global.tech['world_control']){
                    cap += 10;
                }
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    cap *= 2;
                }
                return loc('city_storage_yard_effect',[cap]); 
            },
            action(){
                if (payCosts(actions.city.storage_yard.cost)){
                    if (global.resource.Crates.display === false){
                        messageQueue(loc('city_storage_yard_msg'),'success');
                    }
                    global.city['storage_yard'].count++;
                    global.resource.Crates.display = true;
                    let cap = global.tech.container >= 3 ? 20 : 10;
                    if (global.tech['world_control']){
                        cap += 10;
                    }
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
            title: loc('city_warehouse'),
            desc: loc('city_warehouse_desc'),
            reqs: { steel_container: 1 },
            cost: {
                Money(){ return costMultiplier('warehouse', 400, 1.26); },
                Cement(){ return costMultiplier('warehouse', 75, 1.26); },
                Sheet_Metal(){ return costMultiplier('warehouse', 25, 1.25); }
            },
            effect(){
                let cap = global.tech.steel_container >= 2 ? 20 : 10;
                if (global.tech['world_control']){
                    cap += 10;
                }
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    cap *= 2;
                }
                return loc('city_warehouse_effect',[cap]);
            },
            action(){
                if (payCosts(actions.city.warehouse.cost)){
                    if (global.resource.Containers.display === false){
                        messageQueue(loc('city_warehouse_msg'),'success');
                    }
                    global.city['warehouse'].count++;
                    global.resource.Containers.display = true;
                    let cap = global.tech['steel_container'] >= 2 ? 20 : 10;
                    if (global.tech['world_control']){
                        cap += 10;
                    }
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
            title: loc('city_bank'),
            desc(){
                let planet = races[global.race.species].home;
                return loc('city_bank_desc',[planet]);
            },
            reqs: { banking: 1 },
            cost: { 
                Money(){ return costMultiplier('bank', 250, 1.35); },
                Lumber(){ return costMultiplier('bank', 75, 1.32); },
                Stone(){ return costMultiplier('bank', 100, 1.35); }
            },
            effect(){ 
                let vault = 1800;
                if (global.tech['vault'] >= 1){
                    vault = global.tech['vault'] >= 2 ? 22500 : 15000;
                } 
                else if (global.tech['banking'] >= 5){
                    vault = 9000;
                }
                else if (global.tech['banking'] >= 3){
                    vault = 4000;
                }
                if (global.race['paranoid']){
                    vault *= 0.9;
                }
                else if (global.race['hoarder']){
                    vault *= 1.2;
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
                if (global.tech['world_control']){
                    vault *= 1.25;
                }
                vault = spatialReasoning(vault);
                vault = +(vault).toFixed(0);
                if (global.tech['banking'] >= 2){
                    return `<div>${loc('city_max_money',[vault])}</div><div>${loc('city_banker',[1])}</div>`; 
                }
                else {
                    return loc('city_max_money',[vault]); 
                }
            },
            action(){
                if (payCosts(actions.city.bank.cost)){
                    global['resource']['Money'].max += spatialReasoning(1800);
                    global.city.bank.count++;
                    global.civic.banker.max = global.city.bank.count;
                    return true;
                }
                return false;
            }
        },
        lumber_yard: {
            id: 'city-lumber_yard',
            title: loc('city_lumber_yard'),
            desc: loc('city_lumber_yard_desc'),
            reqs: { axe: 1 },
            cost: { 
                Money(){ if (global.city['lumber_yard'] && global.city['lumber_yard'].count >= 5){ return costMultiplier('lumber_yard', 5, 1.85);} else { return 0; } },
                Lumber(){ return costMultiplier('lumber_yard', 6, 1.9); },
                Stone(){ return costMultiplier('lumber_yard', 2, 1.95); }
            },
            effect:  function(){
                let lum = spatialReasoning(100);
                if (global.stats.achieve['blackhole']){ lum = Math.round(lum * (1 + (global.stats.achieve.blackhole * 0.05))) };
                return `<div>${loc('city_lumber_yard_effect',[2])}</div><div>${loc('city_lumber_effect',[lum])}</div>`;
            },
            action(){
                if (payCosts(actions.city.lumber_yard.cost)){
                    global.city['lumber_yard'].count++;
                    global.civic.lumberjack.display = true;
                    global['resource']['Lumber'].max += spatialReasoning(100);
                    return true;
                }
                return false;
            }
        },
        sawmill: {
            id: 'city-sawmill',
            title: loc('city_sawmill'),
            desc: loc('city_sawmill_desc'),
            reqs: { saw: 1 },
            cost: { 
                Money(){ return costMultiplier('sawmill', 3000, 1.26); },
                Iron(){ return costMultiplier('sawmill', 400, 1.26); },
                Cement(){ return costMultiplier('sawmill', 420, 1.26); }
            },
            effect(){
                let impact = global.tech['saw'] >= 2 ? 8 : 5;
                let lum = spatialReasoning(200);
                if (global.stats.achieve['blackhole']){ lum = Math.round(lum * (1 + (global.stats.achieve.blackhole * 0.05))) };
                let desc = `<div>${loc('city_lumber_effect',[lum])}</div><div>${loc('city_sawmill_effect1',[impact])}</div>`;
                if (global.tech['foundry'] && global.tech['foundry'] >= 4){
                    desc = desc + `<div>${loc('city_sawmill_effect2',[2])}</div>`; 
                }
                if (global.city.powered){
                    desc = desc + `<div>${loc('city_sawmill_effect3',[4])}</div>`; 
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
            title: loc('city_rock_quarry'),
            desc: loc('city_rock_quarry_desc'),
            reqs: { mining: 1 },
            cost: { 
                Money(){ if (global.city['rock_quarry'] && global.city['rock_quarry'].count >= 2){ return costMultiplier('rock_quarry', 20, 1.45);} else { return 0; } },
                Lumber(){ return costMultiplier('rock_quarry', 50, 1.36); },
                Stone(){ return costMultiplier('rock_quarry', 10, 1.36); }
            },
            effect() {
                let stone = spatialReasoning(100);
                if (global.stats.achieve['blackhole']){ stone = Math.round(stone * (1 + (global.stats.achieve.blackhole * 0.05))) };
                if (global.tech['mine_conveyor']){
                    return `<div>${loc('city_rock_quarry_effect1',[2])}</div><div>${loc('city_stone_effect',[stone])}</div><div>${loc('city_rock_quarry_effect2',[4])}</div>`;
                }
                else {
                    return `<div>${loc('city_rock_quarry_effect1',[2])}</div><div>${loc('city_stone_effect',[stone])}</div>`;
                }
            },
            powered: 1,
            power_reqs: { mine_conveyor: 1 },
            action(){
                if (payCosts(actions.city.rock_quarry.cost)){
                    global.city['rock_quarry'].count++;
                    global.civic.quarry_worker.display = true;
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
                Lumber(){ return costMultiplier('cement_plant', 1800, 1.36); },
                Stone(){ return costMultiplier('cement_plant', 2000, 1.32); }
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
                Money(){ return costMultiplier('foundry', 750, 1.36); },
                Copper(){ return costMultiplier('foundry', 250, 1.36); },
                Stone(){ return costMultiplier('foundry', 100, 1.36); }
            },
            effect(){
                let desc = `<div>+1 Craftsman</div>`;
                if (global.tech['foundry'] >= 2){
                    let skill = global.tech['foundry'] >= 5 ? (global.tech['foundry'] >= 8 ? 8 : 5) : 3;
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
                    if (global.resource.Aluminium.display){
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
            desc: '<div>Produces manufactured goods</div><div class="has-text-special">Requires Power</div>',
            reqs: { high_tech: 3 },
            cost: { 
                Money(){ return costMultiplier('factory', 25000, 1.32); },
                Cement(){ return costMultiplier('factory', 1000, 1.32); },
                Steel(){ return costMultiplier('factory', 7500, 1.32); },
                Titanium(){ return costMultiplier('factory', 2500, 1.32); }
            },
            effect(){
                let desc = `<div>Factories can be used to produce any number of manufactured goods. Uses 3kW per factory.</div>`;
                if (global.tech['foundry'] >= 7){
                    desc = desc + `<div>+5% Crafted Materials</div>`;
                }
                return desc;
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
                Money(){ return costMultiplier('smelter', 1000, 1.32); },
                Iron(){ return costMultiplier('smelter', 500, 1.33); }
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
        metal_refinery: {
            id: 'city-metal_refinery',
            title: 'Metal Refinery',
            desc: 'Refines aluminium',
            reqs: { alumina: 1 },
            cost: { 
                Money(){ return costMultiplier('metal_refinery', 2500, 1.35); },
                Steel(){ return costMultiplier('metal_refinery', 350, 1.35); }
            },
            effect() {
                return '<div>Enables aluminium mining by quarry workers and boosts aluminium production by 6%</div>';
            },
            action(){
                if (payCosts(actions.city.metal_refinery.cost)){
                    global.city['metal_refinery'].count++;
                    global.resource.Aluminium.display = true;
                    if (global.tech['foundry']){
                        global.resource.Sheet_Metal.display = true;
                    }
                    return true;
                }
                return false;
            }
        },
        mine: {
            id: 'city-mine',
            title: 'Mine',
            desc: 'Employs miners',
            reqs: { mining: 2 },
            cost: { 
                Money(){ return costMultiplier('mine', 60, 1.6); },
                Lumber(){ return costMultiplier('mine', 175, 1.38); }
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
                Lumber(){ return costMultiplier('coal_mine', 250, 1.36); },
                Wrought_Iron(){ return costMultiplier('coal_mine', 18, 1.36); }
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
                if (global.tech['oil'] >= 7){
                    oil *= 2;
                }
                else if (global.tech['oil'] >= 5){
                    oil *= global.tech['oil'] >= 6 ? 1.75 : 1.25;
                }
                oil = +oil.toFixed(2);
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
                Money(){ return costMultiplier('oil_depot', 2500, 1.46); },
                Cement(){ return costMultiplier('oil_depot', 3750, 1.46); },
                Sheet_Metal(){ return costMultiplier('oil_depot', 100, 1.45); }
            },
            effect() { 
                let oil = spatialReasoning(1000);
                oil *= global.tech['world_control'] ? 1.5 : 1;
                let effect = `<div>+${oil} Max Oil.</div>`;
                if (global.resource['Helium_3'].display){
                    let val = spatialReasoning(400);
                    val *= global.tech['world_control'] ? 1.5 : 1;
                    effect = effect + `<div>+${val} Max Helium-3.</div>`;
                }
                if (global.tech['uranium'] >= 2){
                    let val = spatialReasoning(250);
                    val *= global.tech['world_control'] ? 1.5 : 1;
                    effect = effect + `<div>+${val} Max Uranium.</div>`;
                }
                return effect;
            },
            action(){
                if (payCosts(actions.city.oil_depot.cost)){
                    global.city['oil_depot'].count++;
                    global['resource']['Oil'].max += spatialReasoning(1000) * (global.tech['world_control'] ? 1.5 : 1);
                    if (global.resource['Helium_3'].display){
                        global['resource']['Helium_3'].max += spatialReasoning(400) * (global.tech['world_control'] ? 1.5 : 1);
                    }
                    if (global.tech['uranium'] >= 2){
                        global['resource']['Uranium'].max += spatialReasoning(250) * (global.tech['world_control'] ? 1.5 : 1);
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
                Money(){ return costMultiplier('trade', 500, 1.36); },
                Lumber(){ return costMultiplier('trade', 125, 1.36); },
                Stone(){ return costMultiplier('trade', 50, 1.36); },
                Furs(){ return costMultiplier('trade', 65, 1.36); }
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
        wharf: {
            id: 'city-wharf',
            title: 'Wharf',
            desc: 'Wharfs offer a place for ships to dock',
            reqs: { wharf: 1 },
            cost: { 
                Money(){ return costMultiplier('wharf', 62000, 1.32); },
                Lumber(){ return costMultiplier('wharf', 44000, 1.32); },
                Cement(){ return costMultiplier('wharf', 3000, 1.32); },
                Oil(){ return costMultiplier('wharf', 750, 1.32); }
            },
            effect(){
                let routes = global.race['xenophobic'] ? 1 : 2;
                let containers = global.tech['world_control'] ? 15 : 10;
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    containers *= 2;
                }
                return `<div>+${routes} Trade Routes</div><div>+1% Trade Route Profitability</div><div>+${containers} Max Crates</div><div>+${containers} Max Containers</div>`; 
            },
            action(){
                if (payCosts(actions.city.wharf.cost)){
                    global.city['wharf'].count++;
                    global.city.market.mtrade += 2;
                    let vol = global.tech['world_control'] ? 15 : 10
                    if (global.tech['particles'] && global.tech['particles'] >= 2){
                        vol *= 2;
                    }
                    global.resource.Crates.max += vol;
                    global.resource.Containers.max += vol;
                    return true;
                }
                return false;
            }
        },
        tourist_center: {
            id: 'city-tourist_center',
            title: 'Tourist Center',
            desc: 'Generates tourism revenue',
            reqs: { monument: 2 },
            cost: { 
                Money(){ return costMultiplier('tourist_center', 100000, 1.36); },
                Stone(){ return costMultiplier('tourist_center', 25000, 1.36); },
                Furs(){ return costMultiplier('tourist_center', 7500, 1.36); },
                Plywood(){ return costMultiplier('tourist_center', 5000, 1.36); },
            },
            effect(){
                return `<div>-50 Food per Tourist Center</div><div>+$1 per Amphitheatre</div><div>+$5 per Casino</div><div>+$2 per Monument</div>`; 
            },
            powered: 1,
            action(){
                if (payCosts(actions.city.tourist_center.cost)){
                    global.city['tourist_center'].count++;
                    global.city['tourist_center'].on++;
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
        casino: {
            id: 'city-casino',
            title: 'Casino',
            desc: 'A new form of entertainment for your population',
            reqs: { gambling: 1 },
            cost: {
                Money(){ return costMultiplier('casino', 350000, 1.35); },
                Furs(){ return costMultiplier('casino', 60000, 1.35); },
                Plywood(){ return costMultiplier('casino', 10000, 1.35); },
                Brick(){ return costMultiplier('casino', 6000, 1.35); }
            },
            effect(){
                let money = spatialReasoning(global.tech['gambling'] >= 2 ? 60000 : 40000);
                if (global.tech['world_control']){
                    money = Math.round(money * 1.25);
                }
                return `<div>${loc('city_max_money',[money])}</div><div>+1 Max Entertainer</div><div>+1% Max Morale</div>`;
            },
            action(){
                if (payCosts(actions.city.casino.cost)){
                    global.city['casino'].count++;
                    global.civic.entertainer.max++;
                    global.civic.entertainer.display = true;
                    return true;
                }
                return false;
            },
            flair: `The house always wins.`
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
                Money(){ return costMultiplier('temple', 50, 1.36); },
                Lumber(){ return costMultiplier('temple', 25, 1.36); },
                Furs(){ return costMultiplier('temple', 15, 1.36); },
                Cement(){ return costMultiplier('temple', 10, 1.36); }
            },
            effect(){
                let desc;
                if (global.race['no_plasmid']){
                    let faith = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 1.6 : 1;
                    if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                        faith += +(global.civic.professor.workers * 0.04).toFixed(1);
                    }
                    desc = `<div>Increases production by ${faith}%.</div>`;
                }
                else {
                    let plasmid = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 8 : 5;
                    if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                        plasmid += +(global.civic.professor.workers * 0.2).toFixed(1);
                    }
                    desc = `<div>Increases the production effect of Plasmids by ${plasmid}%.</div>`;
                }
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
                Lumber(){ return costMultiplier('university', 500, 1.36) - 200; },
                Stone(){ return costMultiplier('university', 750, 1.36) - 350; }
            },
            effect(){
                let multiplier = 1;
                let gain = global.tech['science'] && global.tech['science'] >= 8 ? 700 : 500;
                if (global.tech['science'] >= 4){
                    multiplier += (global.city['library'].count * 0.02);
                }
                if (global.space['observatory'] && global.space.observatory.count > 0){
                    multiplier += (moon_on['observatory'] * 0.05);
                }
                if (global.race['hard_of_hearing']){
                    multiplier *= 0.95;
                }
                gain *= multiplier;
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
                Money(){ return costMultiplier('wardenclyffe', 5000, 1.22); },
                Knowledge(){ return costMultiplier('wardenclyffe', 1000, 1.22); },
                Copper(){ return costMultiplier('wardenclyffe', 500, 1.22); },
                Cement(){ return costMultiplier('wardenclyffe', 350, 1.22); },
                Sheet_Metal(){ return costMultiplier('wardenclyffe', 125, 1.2); }
            },
            effect(){
                let gain = 1000;
                if (global.tech['supercollider']){
                    let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                    gain *= (global.tech['supercollider'] / ratio) + 1;
                }
                if (global.space['satellite']){
                    gain *= 1 + (global.space.satellite.count * 0.04);
                }
                gain = +(gain).toFixed(1);
                if (global.city.powered){
                    let pgain = global.tech['science'] >= 7 ? 2500 : 2000;
                    if (global.space['satellite']){
                        pgain *= 1 + (global.space.satellite.count * 0.02);
                    }
                    if (global.tech['supercollider']){
                        let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                        pgain *= (global.tech['supercollider'] / ratio) + 1;
                    }
                    pgain = +(pgain).toFixed(1);
                    let desc = `<div>+1 Max Scientist</div><div>+${gain} Max Knowledge</div>`;
                    if (global.tech['broadcast']){
                        let morale = global.tech['broadcast'];
                        desc = desc + `<div>If powered uses ${actions.city.wardenclyffe.powered}kW but increases its Max Knowledge to ${pgain} and morale by ${morale}%</div>`
                    }
                    else {
                        desc = desc + `<div>If powered uses ${actions.city.wardenclyffe.powered}kW but increases its Max Knowledge to ${pgain}</div>`;
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
            desc: '<div>Bioscience Labratory</div><div class="has-text-special">Requires Power</div>',
            reqs: { genetics: 1 },
            cost: { 
                Money(){ return costMultiplier('biolab', 25000, 1.3); },
                Knowledge(){ return costMultiplier('biolab', 5000, 1.3); },
                Copper(){ return costMultiplier('biolab', 1250, 1.3); },
                Alloy(){ return costMultiplier('biolab', 350, 1.3); }
            },
            effect(){
                let gain = 3000;
                return `+${gain} Max Knowledge, -${actions.city.biolab.powered}kW`;
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
            desc: '<div>Generates electricity from coal</div><div class="has-text-special">Requires Coal</div>',
            reqs: { high_tech: 2 },
            cost: { 
                Money(){ return costMultiplier('coal_power', 10000, 1.22); },
                Copper(){ return costMultiplier('coal_power', 1800, 1.22) - 1000; },
                Cement(){ return costMultiplier('coal_power', 600, 1.22); },
                Steel(){ return costMultiplier('coal_power', 2000, 1.22) - 1000; }
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
            desc: '<div>Generates electricity from oil</div><div class="has-text-special">Requires Oil</div>',
            reqs: { oil: 3 },
            cost: { 
                Money(){ return costMultiplier('oil_power', 50000, 1.22); },
                Copper(){ return costMultiplier('oil_power', 6500, 1.22) + 1000; },
                Aluminium(){ return costMultiplier('oil_power', 12000, 1.22); },
                Cement(){ return costMultiplier('oil_power', 5600, 1.22) + 1000; }
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
            desc: '<div>Uses nuclear fission to generate large amounts of power</div><div class="has-text-special">Requires Uranium</div>',
            reqs: { high_tech: 5 },
            cost: { 
                Money(){ return costMultiplier('fission_power', 250000, 1.36); },
                Copper(){ return costMultiplier('fission_power', 13500, 1.36); },
                Cement(){ return costMultiplier('fission_power', 10800, 1.36); },
                Titanium(){ return costMultiplier('fission_power', 7500, 1.36); }
            },
            effect(){
                let consume = 0.1;
                let output = global.tech['uranium'] >= 4 ? 18 : 14;
                return `+${output}kW. -${consume} Uranium per second.`;
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
        },
        mass_driver: {
            id: 'city-mass_driver',
            title: 'Mass Driver',
            desc: '<div>Eletromagnetic launch system</div><div class="has-text-special">Requires Power</div>',
            reqs: { mass: 1 },
            cost: { 
                Money(){ return costMultiplier('mass_driver', 375000, 1.32); },
                Copper(){ return costMultiplier('mass_driver', 33000, 1.32); },
                Iron(){ return costMultiplier('mass_driver', 42500, 1.32); },
                Iridium(){ return costMultiplier('mass_driver', 2200, 1.32); }
            },
            effect(){
                return `-5% space fuel costs. -${actions.city.mass_driver.powered}kW.`;
            },
            powered: 5,
            action(){
                if (payCosts(actions.city.mass_driver.cost)){
                    global.city.mass_driver.count++;
                    if (global.city.powered && global.city.power >= actions.city.mass_driver.powered){
                        global.city.mass_driver.on++;
                    }
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
                    messageQueue('You have founded a settlement.','success');
                    global.resource.Knowledge.display = true;
                    global.city.calendar.day++;
                    if (global.race['infectious']){
                        global.civic.garrison.display = true;
                        global.settings.showCivic = true;
                        global.city['garrison'] = { count: 0 };
                    }
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
            title(){
                return global.race.species === 'sporgar' ? 'Spore Colony' : 'Cottages';
            },
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
            title(){
                return global.race.species === 'sporgar' ? 'Spore Nexus' : 'Apartments';
            },
            desc(){
                return global.race.species === 'sporgar' ? 'Spore Nexus' : 'Apartments';
            },
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
                let cLabel = global.race.species === 'sporgar' ? 'Spore Colony' : 'Cottage';
                return `Reduce material costs of ${label}s and ${cLabel}s by introducing strong steel beams.`;
            },
            action(){
                if (payCosts(actions.tech.steel_beams.cost)){
                    return true;
                }
                return false;
            }
        },
        mythril_beams: {
            id: 'tech-mythril_beams',
            title: 'Mythril Beams',
            desc: 'Reduce cost of housing',
            reqs: { housing_reduction: 1, space: 3 },
            grant: ['housing_reduction',2],
            cost: { 
                Knowledge(){ return 175000; },
                Mythril(){ return 1000; }
            },
            effect(){
                let label = basicHousingLabel();
                let cLabel = global.race.species === 'sporgar' ? 'Spore Colony' : 'Cottage';
                return `Reduce material costs of ${label}s and ${cLabel}s by introducing unbreakble mythril beams.`;
            },
            action(){
                if (payCosts(actions.tech.mythril_beams.cost)){
                    return true;
                }
                return false;
            }
        },
        neutronium_walls: {
            id: 'tech-neutronium_walls',
            title: 'Neutronium Walls',
            desc: 'Reduce cost of housing',
            reqs: { housing_reduction: 2, gas_moon: 1 },
            grant: ['housing_reduction',3],
            cost: { 
                Knowledge(){ return 300000; },
                Neutronium(){ return 850; }
            },
            effect(){
                let label = basicHousingLabel();
                return `Reduce material costs of ${label}s and Cottages by adding load bearing walls made out of Neutronium.`;
            },
            action(){
                if (payCosts(actions.tech.neutronium_walls.cost)){
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
            effect: 'Create plans for a long term storage medium for meat.',
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
            effect: 'Create plans for a storage medium for food.',
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
            effect: 'Create plans for a grain mill, grain mills boost farm effectiveness.',
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
            effect: 'Add a turbine to your windmills, allowing you to use them for power instead of milling.',
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
            reqs: { mining: 2 },
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
                        Sheet_Metal: 0,
                        Mythril: 0
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
            effect: 'New specialized brickmaking equipment adds an extra 2% bonus to brick crafting per foundry.',
            action(){
                if (payCosts(actions.tech.brickworks.cost)){
                    return true;
                }
                return false;
            }
        },
        machinery: {
            id: 'tech-machinery',
            title: 'Machinery',
            desc: 'Machinery',
            reqs: { foundry: 6, high_tech: 4 },
            grant: ['foundry',7],
            cost: {
                Knowledge(){ return 66000; }
            },
            effect: 'New manufacturing machines add a crafting bonus to factories.',
            action(){
                if (payCosts(actions.tech.machinery.cost)){
                    return true;
                }
                return false;
            }
        },
        cnc_machine: {
            id: 'tech-cnc_machine',
            title: 'CNC Machine',
            desc: 'CNC Machine',
            reqs: { foundry: 7, high_tech: 8 },
            grant: ['foundry',8],
            cost: {
                Knowledge(){ return 132000; }
            },
            effect: 'CNC machines are a new high tech tool for craftsman.',
            action(){
                if (payCosts(actions.tech.cnc_machine.cost)){
                    return true;
                }
                return false;
            }
        },
        vocational_training: {
            id: 'tech-vocational_training',
            title: 'Vocational Training',
            desc: 'Vocational Training',
            reqs: { foundry: 1, high_tech: 3 },
            grant: ['v_train',1],
            cost: {
                Knowledge(){ return 30000; }
            },
            effect: 'Vocational training for your craftsman will double the effectiveness of crafting upgrades on them.',
            action(){
                if (payCosts(actions.tech.vocational_training.cost)){
                    return true;
                }
                return false;
            }
        },
        assembly_line: {
            id: 'tech-assembly_line',
            title: 'Assembly Line',
            desc: 'Assembly Line',
            reqs: { high_tech: 4 },
            grant: ['factory',1],
            cost: {
                Knowledge(){ return 72000; },
                Copper(){ return 125000; }
            },
            effect: '<span>The assembly line revolutionizes manufacturing speeding up factory production by 50%.</span> <span class="has-text-special">This increases both consumption and production.</span>',
            action(){
                if (payCosts(actions.tech.assembly_line.cost)){
                    return true;
                }
                return false;
            }
        },
        automation: {
            id: 'tech-automation',
            title: 'Factory Automation',
            desc: 'Factory Automation',
            reqs: { high_tech: 8, factory: 1},
            grant: ['factory',2],
            cost: {
                Knowledge(){ return 165000; }
            },
            effect: '<span>High tech robotic machinery can boost the production of factories by an additional 33%.</span> <span class="has-text-special">This increases both consumption and production.</span>',
            action(){
                if (payCosts(actions.tech.automation.cost)){
                    return true;
                }
                return false;
            }
        },
        laser_cutters: {
            id: 'tech-laser_cutters',
            title: 'Laser Cutters',
            desc: 'Laser Cutters',
            reqs: { high_tech: 9, factory: 2 },
            grant: ['factory',3],
            cost: {
                Knowledge(){ return 300000; },
                Elerium(){ return 200; }
            },
            effect: '<span>Laser cutters provide a 25% boost to manufacturing speed.</span> <span class="has-text-special">This increases both consumption and production.</span>',
            action(){
                if (payCosts(actions.tech.laser_cutters.cost)){
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
            effect: 'Techno Wizards are a new type of stage performer that uses technology to perform "Magic". Increases effectiveness of entertainers.',
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
        casino: {
            id: 'tech-casino',
            title: 'Casino',
            desc: 'Casino',
            reqs: { high_tech: 4, currency: 5 },
            grant: ['gambling',1],
            cost: {
                Knowledge(){ return 95000; }
            },
            effect: 'Casinos not only offer entertainment for your populace but a new revenue source for you.',
            action(){
                if (payCosts(actions.tech.casino.cost)){
                    global.city['casino'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        casino_vault: {
            id: 'tech-casino_vault',
            title: 'Casino Vault',
            desc: 'Casino Vault',
            reqs: { gambling: 1, space: 3 },
            grant: ['gambling',2],
            cost: {
                Knowledge(){ return 145000; },
                Iridium(){ return 2500; }
            },
            effect: 'Upgrade your casino vaults to store 50% more money.',
            action(){
                if (payCosts(actions.tech.casino_vault.cost)){
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
        bayer_process: {
            id: 'tech-bayer_process',
            title: 'Bayer Process',
            desc: 'Learn to extract Aluminium from mines',
            reqs: { smelting: 2 },
            grant: ['alumina',1],
            cost: { 
                Knowledge(){ return 4500; }
            },
            effect: 'Learn how to remove Aluminium from previously unusable waste material produced by your rock quarries.',
            action(){
                if (payCosts(actions.tech.bayer_process.cost)){
                    global.city['metal_refinery'] = { 
                        count: 0
                    };
                    global.resource.Sheet_Metal.display = true;
                    loadFoundry();
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
            effect: 'Increases Iron output of smelters by 20%.',
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
            effect: 'Increases Steel output of smelters by 20%.',
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
            effect: 'Increases Steel output of smelters by 20%.',
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
            effect: 'Increases Steel output of smelters by 20%.',
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
            effect: 'Advanced smelting processes improve copper refinement by 20%.',
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
            effect: 'Design a small storage shed.',
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
            reqs: { storage: 2, smelting: 2, alumina: 1 },
            grant: ['storage',3],
            cost: {
                Knowledge(){ return 15750; },
                Aluminium(){ return 3000; },
                Steel(){ return 3000; }
            },
            effect: 'Replace smaller storage sheds with larger storage barns, a significant increase in storage capacity.',
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
            reqs: { storage: 3, high_tech: 3, smelting: 2 },
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
            reqs: { storage: 4, high_tech: 4 },
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
            effect: 'Upgrade wooden crates by reinforcing them with metal plates.',
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
        mythril_crates: {
            id: 'tech-mythril_crates',
            title: 'Mythril Plated Crates',
            desc: 'Mythril Plated Crates',
            reqs: { container: 4, space: 3 },
            grant: ['container',5],
            cost: {
                Knowledge(){ return 145000; },
                Mythril(){ return 350; }
            },
            effect: 'Increase the maximum load of crates by plating them with mythril.',
            action(){
                if (payCosts(actions.tech.mythril_crates.cost)){
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
                Steel(){ return 250; }
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
        mythril_containers: {
            id: 'tech-mythril_containers',
            title: 'Mythril Containers',
            desc: 'Reinforce containers with mythril struts',
            reqs: { steel_container: 3, space: 3 },
            grant: ['steel_container',4],
            cost: {
                Knowledge(){ return 165000; },
                Mythril(){ return 500; }
            },
            effect: 'Increase container capacity by adding mythril struts.',
            action(){
                if (payCosts(actions.tech.mythril_containers.cost)){
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
        wharf: {
            id: 'tech-wharf',
            title: 'Wharfs',
            desc: 'Establish sea routes with wharfs',
            reqs: { trade: 1, high_tech: 3, oil: 1 },
            grant: ['wharf',1],
            cost: {
                Knowledge(){ return 44000; }
            },
            effect: 'Zone coastal areas of your city for constructing wharfs.',
            action(){
                if (payCosts(actions.tech.wharf.cost)){
                    global.city['wharf'] = { count: 0 };
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
            effect: 'Creates the concept of banking, allowing government to accumulate massive wealth. Also gives the plebs somewhere to store their money.',
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
        mythril_vault: {
            id: 'tech-mythril_vault',
            title: 'Mythril Vault',
            desc: 'Mythril Vault',
            reqs: { banking: 5, space: 3 },
            grant: ['vault',1],
            cost: {
                Money(){ return 500000; },
                Knowledge(){ return 150000; },
                Mythril(){ return 750; }
            },
            effect: 'Upgrade banks with impenetrable mythil plated vaults, increases $ storage capacity.',
            action(){
                if (payCosts(actions.tech.mythril_vault.cost)){
                    return true;
                }
                return false;
            }
        },
        neutronium_vault: {
            id: 'tech-neutronium_vault',
            title: 'Neutronium Vault',
            desc: 'Neutronium Vault',
            reqs: { vault: 1, gas_moon: 1 },
            grant: ['vault',2],
            cost: {
                Money(){ return 750000; },
                Knowledge(){ return 280000; },
                Neutronium(){ return 650; }
            },
            effect: 'Upgrade your bank vault doors with neutronium, increases $ storage capacity.',
            action(){
                if (payCosts(actions.tech.neutronium_vault.cost)){
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
            effect: 'Install a safe in every cottage and apartment to store valuables. Adds $ storage to housing.',
            action(){
                if (payCosts(actions.tech.home_safe.cost)){
                    return true;
                }
                return false;
            }
        },
        fire_proof_safe: {
            id: 'tech-fire_proof_safe',
            title: 'Fire Proof Safe',
            desc: 'Fire Proof Safe',
            reqs: { home_safe: 1, space: 3 },
            grant: ['home_safe',2],
            cost: {
                Money(){ return 250000; },
                Knowledge(){ return 120000; },
                Iridium(){ return 1000; }
            },
            effect: 'Upgrade house safes with newer fire resistant materials, increases $ storage capacity.',
            action(){
                if (payCosts(actions.tech.fire_proof_safe.cost)){
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
            effect: `Plan the construction of a monument to celebrate your civilization's greatness.`,
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
        tourism: {
            id: 'tech-tourism',
            title: 'Tourism',
            desc: 'Tourism',
            reqs: { monuments: 2 },
            grant: ['monument',2],
            cost: {
                Knowledge(){ return 150000; }
            },
            effect: `Promote tourism of your city.`,
            action(){
                if (payCosts(actions.tech.tourism.cost)){
                    global.city['tourist_center'] = { count: 0, on: 0 };
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
        observatory: {
            id: 'tech-observatory',
            title: 'Space Observatory',
            desc: 'Space Observatory',
            reqs: { science: 8, space: 3, luna: 1 },
            grant: ['science',9],
            cost: {
                Knowledge(){ return 148000; }
            },
            effect: 'Create plans for a moon based observatory, the lack of atmosphere makes this an ideal location for observing the stars.',
            action(){
                if (payCosts(actions.tech.observatory.cost)){
                    global.space['observatory'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        world_collider: {
            id: 'tech-world_collider',
            title: 'World Collider',
            desc: 'World Collider',
            reqs: { science: 9, elerium: 2 },
            grant: ['science',10],
            cost: {
                Knowledge(){ return 350000; }
            },
            effect(){ return `Design the largest supercollider ever conceived, a massive 1859 mile track that spans the entire circumference of ${races[global.race.species].solar.dwarf}.` },
            action(){
                if (payCosts(actions.tech.world_collider.cost)){
                    global.space['world_collider'] = {
                        count: 0
                    };
                    global.space['world_controller'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            },
            flair: `<div>Despite its dramatic name,</div><div>this does not smash actual worlds together.</div>`
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
                Aluminium(){ return 1000; }
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
                    messageQueue('Electricity is a major advancement for your people, the future possibilities are endless.','success');
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
                        Polymer: 0,
                        Nano: 0
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
                    messageQueue('Your scientists have unlocked the secrets of the atom, the atomic age has begun.','success');
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
            effect: 'Establish the Advanced Research Projects Agency (A.R.P.A.). This advanced labratory is dedicated to providing the facilities to progress all your special projects.',
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
        robotics: {
            id: 'tech-robotics',
            title: 'Advanced Robotics',
            desc: 'Advanced Robotics',
            reqs: { high_tech: 7 },
            grant: ['high_tech',8],
            cost: {
                Knowledge(){ return 125000; }
            },
            effect: 'New breakthroughs in robotics could lead to new technologies that increase productivity.',
            action(){
                if (payCosts(actions.tech.robotics.cost)){
                    return true;
                }
                return false;
            }
        },
        lasers: {
            id: 'tech-lasers',
            title: 'Lasers',
            desc: 'Light Amplification by Stimulated Emission of Radiation',
            reqs: { high_tech: 8, space: 3, supercollider: 1, elerium: 1 },
            grant: ['high_tech',9],
            cost: {
                Knowledge(){ return 280000; },
                Elerium(){ return 100; }
            },
            effect: 'Laser technology finally made practical. This could lead to all sorts of new breakthroughs.',
            action(){
                if (payCosts(actions.tech.lasers.cost)){
                    return true;
                }
                return false;
            }
        },
        artifical_intelligence: {
            id: 'tech-artifical_intelligence',
            title: 'Artifical Intelligence',
            desc: 'Artifical Intelligence',
            reqs: { high_tech: 9 },
            grant: ['high_tech',10],
            cost: {
                Knowledge(){ return 325000; }
            },
            effect: `SciFi says this isn't a good idea, but what do a bunch of self important SciFi writers know?`,
            action(){
                if (payCosts(actions.tech.artifical_intelligence.cost)){
                    return true;
                }
                return false;
            },
            flair(){
                return `When the testing is over, you will be missed.`;
            }
        },
        quantum_computing: {
            id: 'tech-quantum_computing',
            title: 'Quantum Computing',
            desc: 'Quantum Computing',
            reqs: { high_tech: 10, nano: 1 },
            grant: ['high_tech',11],
            cost: {
                Knowledge(){ return 435000; },
                Elerium(){ return 250 },
                Nano_Tube(){ return 100000 }
            },
            effect: `Quantium computing is a great leap forwards in processing power.`,
            action(){
                if (payCosts(actions.tech.quantum_computing.cost)){
                    return true;
                }
                return false;
            },
            flair(){
                return `It's as cool as it sounds.`;
            }
        },
        worker_drone: {
            id: 'tech-worker_drone',
            title: 'Mining Drones',
            desc: 'Mining Drones',
            reqs: { nano: 1 },
            grant: ['drone',1],
            cost: {
                Knowledge(){ return 400000; },
            },
            effect(){ return `Mining drones can help expedite neutronium mining on ${races[global.race.species].solar.gas_moon}.`; },
            action(){
                if (payCosts(actions.tech.polymer.cost)){
                    global.space['drone'] = { count: 0 };
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
        breeder_reactor: {
            id: 'tech-breeder_reactor',
            title: 'Breeder Reactor',
            desc: 'Breeder Reactor',
            reqs: { high_tech: 5, uranium: 3, space: 3 },
            grant: ['uranium',4],
            cost: {
                Knowledge(){ return 160000; },
                Uranium(){ return 250; },
                Iridium(){ return 1000; }
            },
            effect: 'Breeder reactors allow you to more fully consume nuclear fuel, which increases the total output of fission reactors.',
            action(){
                if (payCosts(actions.tech.breeder_reactor.cost)){
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
            effect: 'Unlock oil derricks and begin the age of big oil.',
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
            effect: 'A new oil mining technique, controversial but effective. Improves oil derrick output by 40%.',
            action(){
                if (payCosts(actions.tech.fracking.cost)){
                    return true;
                }
                return false;
            }
        },
        mythril_drills: {
            id: 'tech-mythril_drills',
            title: 'Mythril Drills',
            desc: 'Mythril Drills',
            reqs: { oil: 6, space: 3 },
            grant: ['oil',7],
            cost: {
                Knowledge(){ return 165000; },
                Mythril(){ return 100; }
            },
            effect: 'New mythril drills that will improve the efficiency of your oil derricks.',
            action(){
                if (payCosts(actions.tech.mythril_drills.cost)){
                    return true;
                }
                return false;
            }
        },
        mass_driver: {
            id: 'tech-mass_driver',
            title: 'Mass Driver',
            desc: 'Mass Driver',
            reqs: { oil: 6, space: 3 },
            grant: ['mass',1],
            cost: {
                Knowledge(){ return 160000; }
            },
            effect: 'Mass drivers use an electromagnetic rail to launch payloads into orbit, and can be used to reduce fuel consumption required by traditional rocket launches.',
            action(){
                if (payCosts(actions.tech.mass_driver.cost)){
                    global.city['mass_driver'] = {
                        count: 0,
                        on: 0
                    };
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
            effect: 'Fluidized bed reactors revolutionize the manufacturing of polymers boosting output by an astonishing 42%.',
            action(){
                if (payCosts(actions.tech.fluidized_bed_reactor.cost)){
                    return true;
                }
                return false;
            }
        },
        nano_tubes: {
            id: 'tech-nano_tubes',
            title: 'Nano Tubes',
            desc: 'Nano Tubes',
            reqs: { high_tech: 10 },
            grant: ['nano',1],
            cost: {
                Knowledge(){ return 375000; },
                Coal(){ return 100000; },
                Neutronium(){ return 1000; }
            },
            effect: 'Advanced computer models could help design a super material known as carbon nano tubes.',
            action(){
                if (payCosts(actions.tech.polymer.cost)){
                    global.resource.Nano_Tube.display = true;
                    global.city.factory['Nano'] = 0;
                    messageQueue('Nano Tubes are now available for manufacture');
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
            desc: 'Electric Jackhammers',
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
            effect: 'Unlocks the ability to hire mercenaries. You can pay a man to die for you after all.',
            action(){
                if (payCosts(actions.tech.mercs.cost)){
                    global.civic.garrison['mercs'] = true;
                    return true;
                }
                return false;
            }
        },
        signing_bonus: {
            id: 'tech-signing_bonus',
            title: 'Signing Bonus',
            desc: 'Signing Bonus',
            reqs: { mercs: 1, high_tech: 3 },
            grant: ['mercs',2],
            cost: {
                Money(){ return 50000 },
                Knowledge(){ return 32000; }
            },
            effect: 'Regererate the mercenary pool faster by offering signing bonuses.',
            action(){
                if (payCosts(actions.tech.signing_bonus.cost)){
                    return true;
                }
                return false;
            }
        },
        hospital: {
            id: 'tech-hospital',
            title: 'Hospital',
            desc: 'Design a medical facility for your wounded',
            reqs: { military: 1, alumina: 1 },
            grant: ['medic',1],
            cost: {
                Knowledge(){ return 5000; }
            },
            effect: 'Establish a triage center which can be used to accelerate the healing of wounded soldiers.',
            action(){
                if (payCosts(actions.tech.hospital.cost)){
                    global.city['hospital'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        boot_camp: {
            id: 'tech-boot_camp',
            title: 'Boot Camp',
            desc: 'Design a military training facility',
            reqs: { high_tech: 1 },
            grant: ['boot_camp',1],
            cost: {
                Knowledge(){ return 8000; }
            },
            effect: 'Accelerate the training of new soldiers with a specialized training facility.',
            action(){
                if (payCosts(actions.tech.boot_camp.cost)){
                    global.city['boot_camp'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        bows: {
            id: 'tech-bows',
            title: 'Bows',
            desc: 'Discover Ranged Weaponry',
            reqs: { military: 1 },
            grant: ['military',2],
            cost: {
                Knowledge(){ return 225; },
                Lumber(){ return 250; }
            },
            effect: `Create the bow and outfit your army with ranged weapons. It's sure to give you dominance over the primates.`,
            action(){
                if (payCosts(actions.tech.bows.cost)){
                    var tech = actions.tech.bows.grant[0];
                    global.tech[tech] = actions.tech.bows.grant[1];
                    global.civic['garrison'].workers--;
                    global.civic['garrison'].workers++;
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
                    var tech = actions.tech.flintlock_rifle.grant[0];
                    global.tech[tech] = actions.tech.flintlock_rifle.grant[1];
                    global.civic['garrison'].workers--;
                    global.civic['garrison'].workers++;
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
            effect: 'Decimate your foes with rapid fire weaponry.',
            action(){
                if (payCosts(actions.tech.machine_gun.cost)){
                    var tech = actions.tech.machine_gun.grant[0];
                    global.tech[tech] = actions.tech.machine_gun.grant[1];
                    global.civic['garrison'].workers--;
                    global.civic['garrison'].workers++;
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
        rail_guns: {
            id: 'tech-rail_guns',
            title: 'Rail Guns',
            desc: 'Rail Guns',
            reqs: { military: 5, mass: 1 },
            grant: ['military',6],
            cost: {
                Knowledge(){ return 200000; },
                Iridium(){ return 2500; }
            },
            effect: 'New more powerful weaponry for your army.',
            action(){
                if (payCosts(actions.tech.rail_guns.cost)){
                    var tech = actions.tech.rail_guns.grant[0];
                    global.tech[tech] = actions.tech.rail_guns.grant[1];
                    global.civic['garrison'].workers--;
                    global.civic['garrison'].workers++;
                    return true;
                }
                return false;
            }
        },
        laser_rifles: {
            id: 'tech-laser_rifles',
            title: 'Laser Rifles',
            desc: 'Laser Rifles',
            reqs: { military: 6, high_tech: 9, elerium: 1 },
            grant: ['military',7],
            cost: {
                Knowledge(){ return 325000; },
                Elerium(){ return 250; }
            },
            effect: 'High tech weapons for the future.',
            action(){
                if (payCosts(actions.tech.laser_rifles.cost)){
                    var tech = actions.tech.laser_rifles.grant[0];
                    global.tech[tech] = actions.tech.laser_rifles.grant[1];
                    global.civic['garrison'].workers--;
                    global.civic['garrison'].workers++;

                    if (global.race.species === 'sharkin'){
                        unlockAchieve('laser_shark');
                    }

                    return true;
                }
                return false;
            }
        },
        space_marines: {
            id: 'tech-space_marines',
            title: 'Space Marines',
            desc: 'Space Marines',
            reqs: { space: 3, mars: 2 },
            grant: ['marines',1],
            cost: {
                Knowledge(){ return 210000; }
            },
            effect(){ return `<div>Militarize space with</div><div>a ${races[global.race.species].solar.red} garrison.</div>` },
            action(){
                if (payCosts(actions.tech.space_marines.cost)){
                    global.space['space_barracks'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            },
            flair: 'Outer space treaty be damned.'
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
            effect: 'Basic armor made from leather, will reduce the number of casualties you take during military actions.',
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
            effect: 'Adding rebar to concrete will make it much stronger and reduce building cement costs.',
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
            effect: 'Use stronger steel as rebar, further reducing building cement costs.',
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
            effect: 'Portland cement is easier to make boosting productivity of cement workers by 20%.',
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
                    global.resource.Titanium.value = resource_values['Titanium'];
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
        dimensional_compression: {
            id: 'tech-dimensional_compression',
            title: 'Dimension Compression',
            desc: 'Dimensional Compression',
            reqs: { particles: 3, science: 11, supercollider: 3 },
            grant: ['particles',4],
            cost: {
                Knowledge(){ return 425000; }
            },
            effect: 'Supercollider space compression effect now applies to garages.',
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
                            global.civic.farmer.workers = 0;
                            global.civic.farmer.max = 0;
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
                            global.civic.lumberjack.workers = 0;
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
                            global.race['infectious'] = 1;
                            if (global.race.species === 'human'){
                                unlockAchieve(`infested`);
                            }
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
                        case 'sharkin':
                            global.race['frenzy'] = 1;
                            break;
                        case 'octigoran':
                            global.race['suction_grip'] = 1;
                            break;
                        case 'balorg':
                            global.race['suction_grip'] = 1;
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
            effect: 'Professors will help spread your ideology. Each professor gives a minor boost to temple effectiveness.',
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
            effect: 'Mythological stories of the creators boost your libraries by 5% per temple.',
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
            effect: 'Professors studying the past history of the creators are boosted in effectiveness by 5% per temple.',
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
        },
        astrophysics: {
            id: 'tech-astrophysics',
            title: 'Astrophysics',
            desc: 'Astrophysics',
            reqs: { space: 2 },
            grant: ['space_explore',1],
            cost: {
                Knowledge(){ return 125000; }
            },
            effect: 'Navigating space requires research into a new branch of science called astrophysics.',
            action(){
                if (payCosts(actions.tech.astrophysics.cost)){
                    global.space['propellant_depot'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        rover: {
            id: 'tech-rover',
            title: 'Rovers',
            desc: 'Rovers',
            reqs: { space_explore: 1 },
            grant: ['space_explore',2],
            cost: {
                Knowledge(){ return 135000; },
                Alloy(){ return 22000 },
                Polymer(){ return 18000 },
                Uranium(){ return 750 }
            },
            effect: 'Design an unmanned vehicle which can be used to explore other planets and determine their potential.',
            action(){
                if (payCosts(actions.tech.rover.cost)){
                    global.settings.space.moon = true;
                    global.space['moon_base'] = {
                        count: 0,
                        on: 0,
                        support: 0,
                        s_max: 0
                    };
                    return true;
                }
                return false;
            }
        },
        probes: {
            id: 'tech-probes',
            title: 'Space Probes',
            desc: 'Space Probes',
            reqs: { space_explore: 2 },
            grant: ['space_explore',3],
            cost: {
                Knowledge(){ return 168000; },
                Steel(){ return 100000 },
                Iridium(){ return 5000 },
                Uranium(){ return 2250 },
                Helium_3(){ return 3500 }
            },
            effect: 'Design an unmanned space craft which can be used to survey far away planetoids.',
            action(){
                if (payCosts(actions.tech.probes.cost)){
                    global.settings.space.red = true;
                    global.settings.space.hell = true;
                    global.space['spaceport'] = {
                        count: 0,
                        on: 0,
                        support: 0,
                        s_max: 0
                    };
                    return true;
                }
                return false;
            }
        },
        starcharts: {
            id: 'tech-starcharts',
            title: 'Star Charts',
            desc: 'Star Charts',
            reqs: { space_explore: 3, science: 9 },
            grant: ['space_explore',4],
            cost: {
                Knowledge(){ return 185000; }
            },
            effect: `Map the planets' orbits to determine the best routes for visiting further away destinations.`,
            action(){
                if (payCosts(actions.tech.starcharts.cost)){
                    global.settings.space.gas = true;
                    global.settings.space.sun = true;
                    global.space['swarm_control'] = { count: 0, support: 0, s_max: 0 };
                    return true;
                }
                return false;
            }
        },
        colonization: {
            id: 'tech-colonization',
            title: 'Colonization',
            desc(){ return `${races[global.race.species].solar.red} Colonization`; },
            reqs: { space: 4, mars: 1 },
            grant: ['mars',2],
            cost: {
                Knowledge(){ return 172000; }
            },
            effect(){ return `They say you technically haven't colonized a place until you grow crops there. "Colonize" ${races[global.race.species].solar.red} by designing a biodome.`; },
            action(){
                if (payCosts(actions.tech.colonization.cost)){
                    global.space['biodome'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        red_tower: {
            id: 'tech-red_tower',
            title(){ return `${races[global.race.species].solar.red} Control Tower`; },
            desc(){ return `${races[global.race.species].solar.red} Control Tower`; },
            reqs: { mars: 2 },
            grant: ['mars',3],
            cost: {
                Knowledge(){ return 195000; }
            },
            effect(){ return `Space traffic control towers can help regulate the traffic coming in and out of ${races[global.race.species].solar.red}.`; },
            action(){
                if (payCosts(actions.tech.red_tower.cost)){
                    global.space['red_tower'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        space_manufacturing: {
            id: 'tech-space_manufacturing',
            title: 'Space Manufacturing',
            desc: 'Space Manufacturing',
            reqs: { mars: 3 },
            grant: ['mars',4],
            cost: {
                Knowledge(){ return 220000; }
            },
            effect(){ return `Research the logistics of manufacturing on ${races[global.race.species].solar.red}`; },
            action(){
                if (payCosts(actions.tech.space_manufacturing.cost)){
                    global.space['red_factory'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        exotic_lab: {
            id: 'tech-energy_lab',
            title: 'Exotic Materials Lab',
            desc: 'Exotic Materials Laboratory',
            reqs: { mars: 4, asteroid: 5 },
            grant: ['mars',5],
            cost: {
                Knowledge(){ return 250000; }
            },
            effect(){ return `Design a special high tech laboratory to study exotic materials.`; },
            action(){
                if (payCosts(actions.tech.exotic_lab.cost)){
                    global.space['exotic_lab'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        dyson_sphere: {
            id: 'tech-dyson_sphere',
            title: 'Dyson Sphere',
            desc: 'Dyson Sphere',
            reqs: { solar: 1 },
            grant: ['solar',2],
            cost: {
                Knowledge(){ return 195000; }
            },
            effect: 'Science fiction has popularized the idea of a Dyson Sphere, try to figure out how to make one.',
            action(){
                if (payCosts(actions.tech.dyson_sphere.cost)){
                    return true;
                }
                return false;
            }
        },
        dyson_swarm: {
            id: 'tech-dyson_swarm',
            title: 'Dyson Swarm',
            desc: 'Dyson Swarm',
            reqs: { solar: 2 },
            grant: ['solar',3],
            cost: {
                Knowledge(){ return 210000; }
            },
            effect: 'A Dyson Sphere turns out to be completely impractical, if not impossible. Instead design a network of solar satellites known as a Dyson Swarm.',
            action(){
                if (payCosts(actions.tech.dyson_swarm.cost)){
                    global.space['swarm_satellite'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        swarm_plant: {
            id: 'tech-swarm_plant',
            title: 'Swarm Plant',
            desc: 'Swarm Plant',
            reqs: { solar: 3, hell: 1, gas_moon: 1 },
            grant: ['solar',4],
            cost: {
                Knowledge(){ return 250000; }
            },
            effect(){ return `Manufacturing and deploying swarm satellites is expensive because of the distance from ${races[global.race.species].home}. By establishing automated facilities on ${races[global.race.species].solar.hell}, which is much closer to the sun, you can lower the costs.` },
            action(){
                if (payCosts(actions.tech.swarm_plant.cost)){
                    global.space['swarm_plant'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        space_sourced: {
            id: 'tech-space_sourced',
            title: 'Space Sourced',
            desc: 'Space Sourced Iron',
            reqs: { solar: 4, asteroid: 3 },
            grant: ['solar',5],
            cost: {
                Knowledge(){ return 300000; }
            },
            effect(){ return `Space sourced iron can reduce the volume needed to construct swarm plants.` },
            action(){
                if (payCosts(actions.tech.space_sourced.cost)){
                    return true;
                }
                return false;
            }
        },
        swarm_plant_ai: {
            id: 'tech-swarm_plant_ai',
            title: 'Swarm Plant AI',
            desc: 'Swarm Plant AI',
            reqs: { solar: 4, high_tech: 10 },
            grant: ['swarm',1],
            cost: {
                Knowledge(){ return 335000; }
            },
            effect(){ return `Advanced AI controlling the production at swarm facilities could boost their productivity.` },
            action(){
                if (payCosts(actions.tech.swarm_plant_ai.cost)){
                    return true;
                }
                return false;
            }
        },
        swarm_control_ai: {
            id: 'tech-swarm_control_ai',
            title: 'Swarm Control AI',
            desc: 'Swarm Control AI',
            reqs: { swarm: 1 },
            grant: ['swarm',2],
            cost: {
                Knowledge(){ return 360000; }
            },
            effect(){ return `With AI controlling your solar swarm, you can operate up to 6 satellites per control station.` },
            action(){
                if (payCosts(actions.tech.swarm_control_ai.cost)){
                    return true;
                }
                return false;
            }
        },
        quantium_swarm: {
            id: 'tech-quantium_swarm',
            title: 'Quantium Swarm',
            desc: 'Quantium Swarm',
            reqs: { swarm: 2, high_tech: 11 },
            grant: ['swarm',3],
            cost: {
                Knowledge(){ return 465000; }
            },
            effect(){ return `By upgrading your swarm plant AI with quantium processors the efficiency of the plants are limited only by your capacity for knowledge.` },
            action(){
                if (payCosts(actions.tech.quantium_swarm.cost)){
                    return true;
                }
                return false;
            }
        },
        gps: {
            id: 'tech-gps',
            title: 'GPS Constellation',
            desc: 'GPS Constellation',
            reqs: { space_explore: 1 },
            grant: ['satellite',1],
            cost: {
                Knowledge(){ return 150000; }
            },
            effect: 'Design a network of navigation satellites.',
            action(){
                if (payCosts(actions.tech.gps.cost)){
                    global.space['gps'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        nav_beacon: {
            id: 'tech-nav_beacon',
            title: 'Navigation Beacon',
            desc: 'Navigation Beacon',
            reqs: { luna: 1 },
            grant: ['luna',2],
            cost: {
                Knowledge(){ return 180000; }
            },
            effect: 'Navigation assist beacons will help guide space traffic.',
            action(){
                if (payCosts(actions.tech.nav_beacon.cost)){
                    global.space['nav_beacon'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        atmospheric_mining: {
            id: 'tech-atmospheric_mining',
            title: 'Atmospheric Mining',
            desc: 'Atmospheric Mining',
            reqs: { space: 5 },
            grant: ['gas_giant',1],
            cost: {
                Knowledge(){ return 190000; }
            },
            effect: 'Learn the physics of operating a gas giant orbital mining platform.',
            action(){
                if (payCosts(actions.tech.atmospheric_mining.cost)){
                    global.space['gas_mining'] = { count: 0, on: 0 };
                    global.space['gas_storage'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        helium_attractor: {
            id: 'tech-helium_attractor',
            title: 'Helium Attractor',
            desc: 'Helium Attractor',
            reqs: { gas_giant: 1, elerium: 1 },
            grant: ['helium',1],
            cost: {
                Knowledge(){ return 290000; },
                Elerium(){ return 250; }
            },
            effect(){ return `Increase efficiency of ${races[global.race.species].solar.gas} Helium-3 collectors.` },
            action(){
                if (payCosts(actions.tech.helium_attractor.cost)){
                    return true;
                }
                return false;
            }
        },
        zero_g_mining: {
            id: 'tech-zero_g_mining',
            title: 'Zero G Mining',
            desc: 'Zero G Mining',
            reqs: { asteroid: 1, high_tech: 8 },
            grant: ['asteroid',2],
            cost: {
                Knowledge(){ return 210000; }
            },
            effect: 'Asteroid mining in Zero G presents new challenges that must be studied before this resource can be developed.',
            action(){
                if (payCosts(actions.tech.zero_g_mining.cost)){
                    global.space['space_station'] = { count: 0, on: 0, support: 0, s_max: 0 };
                    global.space['iridium_ship'] = { count: 0, on: 0 };
                    global.space['iron_ship'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        elerium_mining: {
            id: 'tech-elerium_mining',
            title: 'Elerium Mining',
            desc: 'Elerium Mining',
            reqs: { asteroid: 4 },
            grant: ['asteroid',5],
            cost: {
                Knowledge(){ return 235000; },
                Elerium(){ return 1; }
            },
            effect: 'Elerium is a rare new highly energetic element discovered in the asteroid belt, mining this element safely will require specialized harvesting equipment and containment vessels.',
            action(){
                if (payCosts(actions.tech.elerium_mining.cost)){
                    global.space['elerium_ship'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        laser_mining: {
            id: 'tech-laser_mining',
            title: 'Laser Mining',
            desc: 'Laser Mining',
            reqs: { asteroid: 5, elerium: 1, high_tech: 9 },
            grant: ['asteroid',6],
            cost: {
                Knowledge(){ return 350000; },
            },
            effect: 'Laser mining drills can cut through asteroids quicker then traditional drills.',
            action(){
                if (payCosts(actions.tech.laser_mining.cost)){
                    return true;
                }
                return false;
            }
        },
        elerium_tech: {
            id: 'tech-elerium_tech',
            title: 'Elerium Theory',
            desc: 'Elerium Theory',
            reqs: { asteroid: 5 },
            grant: ['elerium',1],
            cost: {
                Knowledge(){ return 275000; },
                Elerium(){ return 20; }
            },
            effect: `Study the elerium to unlock its mysteries.`,
            action(){
                if (payCosts(actions.tech.elerium_tech.cost)){
                    return true;
                }
                return false;
            }
        },
        elerium_reactor: {
            id: 'tech-elerium_reactor',
            title: 'Elerium Reactor',
            desc: 'Elerium Reactor',
            reqs: { dwarf: 1, elerium: 1 },
            grant: ['elerium',2],
            cost: {
                Knowledge(){ return 325000; },
                Elerium(){ return 180; }
            },
            effect(){ return `Elerium is highly energetic, and the prospect of making a power source out of it is too good to ignore.` },
            action(){
                if (payCosts(actions.tech.elerium_reactor.cost)){
                    global.space['e_reactor'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        neutronium_housing: {
            id: 'tech-neutronium_housing',
            title: 'Neutronium Housing',
            desc: 'Neutronium Housing',
            reqs: { gas_moon: 1 },
            grant: ['space_housing',1],
            cost: {
                Knowledge(){ return 275000; },
                Neutronium(){ return 350; }
            },
            effect(){ return `Neutronium supports make Living Quarters cheaper to produce on ${races[global.race.species].solar.red}.` },
            action(){
                if (payCosts(actions.tech.neutronium_housing.cost)){
                    return true;
                }
                return false;
            }
        },
        unification: {
            id: 'tech-unification',
            title: 'Unification',
            desc(){ return `${races[global.race.species].home} Unification`; },
            reqs: { mars: 2 },
            grant: ['unify',1],
            cost: {
                Knowledge(){ return 200000; }
            },
            effect(){ return `Come up with a plan to unify the world under your control.`; },
            action(){
                if (payCosts(actions.tech.unification.cost)){
                    return true;
                }
                return false;
            }
        },
        wc_conquest: {
            id: 'tech-wc_conquest',
            title: 'Conquest',
            desc(){
                let military = global.race['no_plasmid'] ? 525 : 600;
                if (global.race['no_crispr']){
                    military -= 75;
                }
                return `<div>${races[global.race.species].home} Conquest</div><div class="has-text-special">Requires ${military} Army Rating</div>`;
            },
            reqs: { unify: 1 },
            grant: ['unify',2],
            cost: {},
            effect(){
                return `<div>Attempt to conquer the world with your superior military might.</div><div class="has-text-special">Unification changes the game, there will be no more conflict but you'll gain huge amounts of resources.</div>`;
            },
            action(){
                let rating = global.race['no_plasmid'] ? 525 : 600;
                if (global.race['no_crispr']){
                    rating -= 75;
                }
                if (armyRating(global.civic.garrison.raid,'army') >= rating){
                    global.tech['world_control'] = 1;
                    $('#garrison').empty();
                    buildGarrison($('#garrison'));
                    unlockAchieve(`world_domination`);
                    return true;
                }
                return false;
            }
        },
        wc_morale: {
            id: 'tech-wc_morale',
            title: 'Cultural Supremacy',
            desc(){
                let morale = global.race['no_plasmid'] ? 140 : 150;
                if (global.race['no_crispr']){
                    morale -= 10;
                }
                return `<div>${races[global.race.species].home} Cultural Supremacy</div><div class="has-text-special">Requires ${morale}% Morale</div>`;
            },
            reqs: { unify: 1 },
            grant: ['unify',2],
            cost: {},
            effect(){
                return `<div>Use your superior culture to try and take over ${races[global.race.species].home}.</div><div class="has-text-special">Unification changes the game, there will be no more conflict but you'll gain huge amounts of resources.</div>`;
            },
            action(){
                let morale = global.race['no_plasmid'] ? 140 : 150;
                if (global.race['no_crispr']){
                    morale -= 10;
                }
                if (global.city.morale.current >= morale){
                    global.tech['world_control'] = 1;
                    $('#garrison').empty();
                    buildGarrison($('#garrison'));
                    unlockAchieve(`illuminati`);
                    return true;
                }
                return false;
            }
        },
        wc_money: {
            id: 'tech-wc_money',
            title: 'Buy the World',
            desc(){
                let price = global.race['no_plasmid'] ? 3 : 5;
                if (global.race['no_crispr']){
                    price -= 1;
                }
                return `<div>${races[global.race.species].home} Subversion</div><div class="has-text-special">Requires \$${price} Million</div>`;
            },
            reqs: { unify: 1 },
            grant: ['unify',2],
            cost: {},
            effect(){
                return `<div>Attempt to seize control of ${races[global.race.species].home} by funding subversive activities.</div><div class="has-text-special">Unification changes the game, there will be no more conflict but you'll gain huge amounts of resources.</div>`;
            },
            action(){
                let price = global.race['no_plasmid'] ? 3000000 : 5000000;
                if (global.race['no_crispr']){
                    price -= 1000000;
                }
                if (global.resource.Money.amount >= price){
                    global.resource.Money.amount -= price;
                    global.tech['world_control'] = 1;
                    $('#garrison').empty();
                    buildGarrison($('#garrison'));
                    unlockAchieve(`syndicate`);
                    return true;
                }
                return false;
            }
        },
        wc_reject: {
            id: 'tech-wc_reject',
            title: 'Reject Unity',
            desc(){ return `Reject Unity`; },
            reqs: { unify: 1 },
            grant: ['unify',2],
            cost: {},
            effect(){ return `<div>Give up on your plans for world domination. Instead focus on improving your own society</div><div class="has-text-special">Game stays the same, gain a 20% morale bonus.</div>`; },
            action(){
                if (payCosts(actions.tech.wc_reject.cost)){
                    global.tech['m_boost'] = 1;
                    unlockAchieve(`cult_of_personality`);
                    return true;
                }
                return false;
            }
        },
        genesis: {
            id: 'tech-genesis',
            title: 'Genesis Project',
            desc: 'Genesis Project',
            reqs: { genesis: 1 },
            grant: ['genesis',2],
            cost: {
                Knowledge(){ return 350000; }
            },
            effect(){ return `Our species appears to be doomed, research the possibly of leaving behind a lasting legacy by bioseeding a planet in another star system with life of our design.` },
            action(){
                if (payCosts(actions.tech.genesis.cost)){
                    return true;
                }
                return false;
            }
        },
        star_dock: {
            id: 'tech-star_dock',
            title: 'Star Dock',
            desc: 'Star Dock',
            reqs: { genesis: 2, space: 5 },
            grant: ['genesis',3],
            cost: {
                Knowledge(){ return 380000; },
            },
            effect(){ return `Design a space based ship yard which can be used to construct advanced ships.` },
            action(){
                if (payCosts(actions.tech.star_dock.cost)){
                    global.space['star_dock'] = {
                        count: 0,
                        ship: 0,
                        probe: 0,
                        template: global.race.species
                    };
                    return true;
                }
                return false;
            }
        },
        interstellar: {
            id: 'tech-interstellar',
            title: 'Interstellar Probes',
            desc: 'Interstellar Probes',
            reqs: { genesis: 3 },
            grant: ['genesis',4],
            cost: {
                Knowledge(){ return 400000; },
            },
            effect(){ return `Scouting outside the solar system will require much more advanced probe designs than what is currently employed.` },
            action(){
                if (payCosts(actions.tech.interstellar.cost)){
                    global.starDock['probes'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        genesis_ship: {
            id: 'tech-genesis_ship',
            title: 'Genesis Ship',
            desc: 'Genesis Ship',
            reqs: { genesis: 4 },
            grant: ['genesis',5],
            cost: {
                Knowledge(){ return 425000; },
            },
            effect(){ return `Design the genesis ship which will be used to bioseed a far away planet.` },
            action(){
                if (payCosts(actions.tech.genesis_ship.cost)){
                    global.starDock['seeder'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        genetic_decay: {
            id: 'tech-genetic_decay',
            title: 'Gene Therapy',
            desc: 'Gene Therapy',
            reqs: { decay: 1 },
            grant: ['decay',2],
            cost: {
                Knowledge(){ return 200000; }
            },
            effect(){ return `Research the genetic decay problem and try to find a solution.` },
            action(){
                if (payCosts(actions.tech.genetic_decay.cost)){
                    return true;
                }
                return false;
            }
        },
    },
    genes: arpa('GeneTech'),
    space: spaceTech(),
    starDock: {
        probes: {
            id: 'spcdock-probes',
            title: loc('star_dock_probe'),
            desc(){
                return `<div>${loc('star_dock_probe_desc')}</div>`;
            },
            reqs: { genesis: 4 },
            cost: {
                Money(){ return costMultiplier('probes', 500000, 1.25,'starDock'); },
                Alloy(){ return costMultiplier('probes', 125000, 1.25,'starDock'); },
                Polymer(){ return costMultiplier('probes', 150000, 1.25,'starDock'); },
                Iridium(){ return costMultiplier('probes', 20000, 1.25,'starDock'); },
                Mythril(){ return costMultiplier('probes', 5000, 1.25,'starDock'); },
            },
            effect(){
                return `<div>${loc('star_dock_probe_effect')}</div>`;
            },
            action(){
                if (payCosts(actions.starDock.probes.cost)){
                    global.starDock.probes.count++;
                    return true;
                }
                return false;
            },
        },
        seeder: {
            id: 'spcdock-seeder',
            title: loc('star_dock_seeder'),
            desc(){
                if (global.starDock.seeder.count >= 100){
                    return `<div>${loc('star_dock_seeder')}</div><div class="has-text-special">${loc('star_dock_seeder_desc2')}</div>`;
                }
                else {
                    return `<div>${loc('star_dock_seeder')}</div><div class="has-text-special">${loc('star_dock_seeder_desc1')}</div>`;
                }
            },
            reqs: { genesis: 5 },
            cost: {
                Money(){ return global.starDock.seeder.count < 100 ? 100000 : 0; },
                Steel(){ return global.starDock.seeder.count < 100 ? 25000 : 0; },
                Neutronium(){ return global.starDock.seeder.count < 100 ? 240 : 0; },
                Elerium(){ return global.starDock.seeder.count < 100 ? 10 : 0; },
                Nano_Tube(){ return global.starDock.seeder.count < 100 ? 12000 : 0; },
            },
            effect(){
                let remain = global.starDock.seeder.count < 100 ? loc('star_dock_seeder_status1',[100 - global.starDock.seeder.count]) : loc('star_dock_seeder_status2');
                return `<div>${loc('star_dock_seeder_effect')}</div><div class="has-text-special">${remain}</div>`;
            },
            action(){
                if (global.starDock.seeder.count < 100 && payCosts(actions.starDock.seeder.cost)){
                    global.starDock.seeder.count++;
                    if (global.starDock.seeder.count >= 100){
                        global.tech.genesis = 6;
                        $('#popspcdock-seeder').remove();
                        $('#modalBox').empty();
                        let c_action = actions.space.spc_gas.star_dock;
                        drawModal(c_action,'star_dock');
                    }
                    return true;
                }
                return false;
            },
        },
        launch_ship: {
            id: 'spcdock-launch_ship',
            title: loc('star_dock_genesis'),
            desc(){
                return `<div>${loc('star_dock_genesis_desc1')}</div><div class="has-text-danger">${loc('star_dock_genesis_desc2')}</div>`;
            },
            reqs: { genesis: 6 },
            cost: {},
            effect(){
                let pop = global['resource'][races[global.race.species].name].amount + global.civic.garrison.workers;
                let plasmid = Math.round(pop / 3);
                let k_base = global.stats.know;
                let k_inc = 50000;
                while (k_base > k_inc){
                    plasmid++;
                    k_base -= k_inc;
                    k_inc *= 1.015;
                }
                plasmid = challenge_multiplier(plasmid);
                return `<div>${loc('star_dock_genesis_effect1')}</div><div class="has-text-special">${loc('star_dock_genesis_effect2',[plasmid])}</div>`;
            },
            action(){
                bioseed();
                return false;
            },
        },
    }
};

export function storageMultipler(){
    var multiplier = (global.tech['storage'] - 1) * 1.25 + 1;
    if (global.tech['storage'] >= 3){
        multiplier *= global.tech['storage'] >= 4 ? 3 : 1.5;
    }
    if (global.race['pack_rat']){
        multiplier *= 1.05;
    }
    if (global.tech['storage'] >= 6){
        multiplier *= 1 + (global.tech['supercollider'] / 20);
    }
    if (global.stats.achieve['blackhole']){
        multiplier *= 1 + global.stats.achieve.blackhole * 0.05;
    }
    multiplier *= global.tech['world_control'] ? 3 : 1;
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

function checkPowerRequirements(c_action){
    var isMet = true;
    if (c_action['power_reqs']){
        Object.keys(c_action.power_reqs).forEach(function (req) {
            if (!global.tech[req] || global.tech[req] < c_action.power_reqs[req]){
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
    space();
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
    let c_action = actions[action][type];
    setAction(c_action,action,type,old)
}

export function setAction(c_action,action,type,old){
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
    if (global.race['apex_predator'] && action === 'tech' && type === 'armor'){
        return;
    }
    if (c_action['powered'] && !global[action][type]['on']){
        global[action][type]['on'] = 0;
    }
    var id = c_action.id;
    var parent = $(`<div id="${id}" class="action"></div>`);
    if (!checkAffordable(c_action)){
        parent.addClass('cna');
    }
    if (!checkAffordable(c_action,true)){
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

    if (c_action['special']){
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
    if (c_action['powered'] && global.tech['high_tech'] && global.tech['high_tech'] >= 2 && checkPowerRequirements(c_action)){
        var powerOn = $('<span role="button" :aria-label="on_label()" class="on" @click="power_on" title="ON">{{ act.on }}</span>');
        var powerOff = $('<span role="button" :aria-label="off_label()" class="off" @click="power_off" title="OFF">{{ act.on | off }}</span>');
        parent.append(powerOn);
        parent.append(powerOff);
    }
    if (action !== 'tech' && global[action] && global[action][type] && global[action][type].count >= 0){
        element.append($('<span class="count">{{ act.count }}</span>'));
    }
    if (old){
        $('#oldTech').append(parent);
    }
    else {
        $('#'+action).append(parent);
    }
    if (action !== 'tech' && global[action] && global[action][type] && global[action][type].count === 0){
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
            title: typeof c_action.title === 'string' ? c_action.title : c_action.title(),
            act: global[action][type]
        },
        methods: {
            action(){
                if (c_action.id === 'spcdock-launch_ship'){
                    c_action.action();
                }
                else {
                    switch (action){
                        case 'tech':
                            if (c_action.action()){
                                gainTech(type);
                            }
                            break;
                        case 'genes':
                            if (c_action.action()){
                                gainGene(type);
                            }
                            break;
                        default:
                            let keyMult = keyMultiplier();
                            if (c_action['grant']){
                                keyMult = 1;
                            }
                            let grant = false;
                            for (var i=0; i<keyMult; i++){
                                if (!c_action.action()){
                                    break;
                                }
                                grant = true;
                            }
                            if (!checkAffordable(c_action)){
                                let id = c_action.id;
                                $(`#${id}`).addClass('cna');
                            }
                            if (c_action['grant'] && grant){
                                let tech = c_action.grant[0];
                                global.tech[tech] = c_action.grant[1];
                                removeAction(c_action.id);
                                drawCity();
                                drawTech();
                                space();
                            }
                            else if (c_action['refresh']){
                                removeAction(c_action.id);
                                drawCity();
                                drawTech();
                                space();
                            }
                            updateDesc(c_action,action,type);
                            break;
                    }
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
                      drawModal(c_action,type);
                   }
                }, 50);
            },
            on_label(){
                return `on: ${global[action][type].on}`;
            },
            off_label(){
                return `off: ${global[action][type].count - global[action][type].on}`;
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
    let pop_target = action === 'starDock' ? 'body .modal' : '#main';
    $('#'+id).on('mouseover',function(){
            var popper = $(`<div id="pop${id}" class="popper has-background-light has-text-dark"></div>`);
            $(pop_target).append(popper);
            actionDesc(popper,c_action,old);
            popper.show();
            poppers[id] = new Popper($('#'+id),popper);
        });
    $('#'+id).on('mouseout',function(){
            $(`#pop${id}`).hide();
            poppers[id].destroy();
            $(`#pop${id}`).remove();
        });
}

export function setPlanet(){
    var biome = 'grassland';
    switch (Math.floor(Math.seededRandom(0,6))){
        case 0:
            biome = 'grassland';
            break;
        case 1:
            biome = 'oceanic';
            break;
        case 2:
            biome = 'forest';
            break;
        case 3:
            biome = 'desert';
            break;
        case 4:
            biome = 'volcanic';
            break;
        case 5:
            biome = 'tundra';
            break;
        default:
            biome = 'grassland';
            break;
    }

    var id = biome+Math.floor(Math.seededRandom(0,10000));
    id = id.charAt(0).toUpperCase() + id.slice(1);

    var orbit = Math.floor(Math.seededRandom(200,600));

    var parent = $(`<div id="${id}" class="action"></div>`);
    var element = $(`<a class="button is-dark" v-on:click="action"><span class="aTitle">${id}</span></a>`);
    parent.append(element);

    $('#evolution').append(parent);

    $('#'+id).on('click',function(){
        global.race['chose'] = id;
        global.city.biome = biome;
        global.city.calendar.orbit = orbit;
        $('#evolution').empty();
        $(`#pop${id}`).hide();
        poppers[id].destroy();
        $(`#pop${id}`).remove();
        addAction('evolution','rna');
    });

    $('#'+id).on('mouseover',function(){
            var popper = $(`<div id="pop${id}" class="popper has-background-light has-text-dark"></div>`);
            $('#main').append(popper);
            
            popper.append($(`<div>${id}</div>`));
            popper.append($(`<div>${loc('set_planet',[id,biome,orbit])}`));
            popper.append($(`<div>${biomes[biome]}</div>`));

            popper.show();
            poppers[id] = new Popper($('#'+id),popper);
        });
    $('#'+id).on('mouseout',function(){
            $(`#pop${id}`).hide();
            poppers[id].destroy();
            $(`#pop${id}`).remove();
        });
}

function actionDesc(parent,c_action,old){
    parent.empty();
    var desc = typeof c_action.desc === 'string' ? c_action.desc : c_action.desc();
    parent.append($('<div>'+desc+'</div>'));
    if (c_action.cost && !old){ 
        var cost = $('<div></div>');
        var costs = adjustCosts(c_action.cost);
        Object.keys(costs).forEach(function (res) {
            var res_cost = costs[res]();
            if (res_cost > 0){
                let label = res === 'Money' ? '$' : global.resource[res].name+': ';
                label = label.replace("_", " ");
                let color = global.resource[res].amount >= res_cost ? 'has-text-dark' : 'has-text-danger';
                let display_cost = sizeApproximation(res_cost,1);
                cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}${display_cost}</div>`));
            }
        });
        parent.append(cost);
    }
    if (c_action.effect){
        var effect = typeof c_action.effect === 'string' ? c_action.effect : c_action.effect();
        if (effect){
            parent.append($(`<div>${effect}</div>`));
        }
    }
    if (c_action.flair){
        var flair = typeof c_action.flair === 'string' ? c_action.flair : c_action.flair();
        parent.append($(`<div class="flair has-text-special">${flair}</div>`));
        parent.addClass('flair');
    }
}

export function removeAction(id){
    $('#'+id).remove();
    $('#pop'+id).remove();
}

function updateDesc(c_action,category,action){
    var id = c_action.id;
    if (global[category] && global[category][action] && global[category][action]['count']){
        $(`#${id} .count`).html(global[category][action].count);
        if (global[category][action] && global[category][action].count > 0){
            $(`#${id} .count`).css('display','inline-block');
            $(`#${id} .special`).css('display','block');
            $(`#${id} .on`).css('display','block');
            $(`#${id} .off`).css('display','block');
        }
    }
    actionDesc($('#pop'+id),c_action);
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
    if (global.race['hollow_bones'] && (costs['Plywood'] || costs['Brick'] || costs['Wrought_Iron'] || costs['Sheet_Metal'] || costs['Mythril'])){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Plywood' || res === 'Brick' || res === 'Wrought_Iron' || res === 'Sheet_Metal' || res === 'Mythril'){
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

export function payCosts(costs){
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

export function checkAffordable(c_action,max){
    if (c_action.cost){
        if (max){
            return checkMaxCosts(adjustCosts(c_action.cost));
        }
        else {
            return checkCosts(adjustCosts(c_action.cost));
        }
    }
    return true;
} 

function checkMaxCosts(costs){
    var test = true;
    Object.keys(costs).forEach(function (res){
        var testCost = Number(costs[res]()) || 0;
        if (testCost > Number(global.resource[res].max) && Number(global.resource[res].max) !== -1) {
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
        let fail_max = global.resource[res].max >= 0 && testCost > global.resource[res].max ? true : false;
        if (testCost > Number(global.resource[res].amount) + global.resource[res].diff || fail_max){
            test = false;
            return false;
        }
    });
    return test;
}

function costMultiplier(structure,base,mutiplier,cat){
    if (!cat){
        cat = 'city';
    }
    if (global.race['small']){ mutiplier -= 0.01; }
    else if (global.race['large']){ mutiplier += 0.01; }
    if (global.race['tunneler'] && (structure === 'mine' || structure === 'coal_mine')){ mutiplier -= 0.01; }
    if (global.tech['housing_reduction'] && (structure === 'basic_housing' || structure === 'cottage')){
        mutiplier -= global.tech['housing_reduction'] * 0.02;
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
    if (structure === 'apartment'){
        if (global.race['pack_mentality']){
            mutiplier -= 0.02;
        }
    }
    if (global.genes['creep'] && !global.race['no_crispr']){
        mutiplier -= global.genes['creep'] * 0.01;
    }
    if (mutiplier < 0.01){
        mutiplier = 0.01;
    }
    var count = global[cat][structure] ? global[cat][structure].count : 0;
    return Math.round((mutiplier ** count) * base);
}

function drawModal(c_action,type){
    if (type === 'red_factory'){
        type = 'factory';
    }

    let title = typeof c_action.title === 'string' ? c_action.title : c_action.title();
    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${title}</p>`));
    
    var body = $('<div id="specialModal" class="modalBody"></div>');
    $('#modalBox').append(body);

    switch(type){
        case 'smelter':
            smelterModal(body);
            break;
        case 'factory':
            factoryModal(body);
            break;
        case 'star_dock':
            starDockModal(body);
            break;
    }
}

function starDockModal(modal){
    if (global.tech['genesis'] < 4){
        let warn = $(`<div><span class="has-text-warning">${loc('stardock_warn')}</span></div>`);
        modal.append(warn);
        return;
    }

    let dock = $(`<div id="starDock" class="actionSpace"></div>`);
    modal.append(dock);

    let c_action = actions.starDock.probes;
    setAction(c_action,'starDock','probes');
    
    if (global.tech['genesis'] >= 5){
        let c_action = actions.starDock.seeder;
        setAction(c_action,'starDock','seeder');
    }

    if (global.tech['genesis'] >= 6){
        let c_action = actions.starDock.launch_ship;
        setAction(c_action,'starDock','launch_ship');
    }
}

function smelterModal(modal){
    let fuel = $(`<div><span class="has-text-warning">${loc('modal_smelter_fuel')}:</span> <span class="has-text-info">{{count | on}}/{{ count }}</span></div>`);
    modal.append(fuel);

    let fuelTypes = $('<div></div>');
    modal.append(fuelTypes);

    if (!global.race['kindling_kindred']){
        let wood = $(`<b-tooltip :label="buildLabel('wood')" position="is-bottom" animated><span class="current">${loc('resource_Lumber_name')} {{ Wood }}</span></b-tooltip>`);
        let subWood = $('<span class="sub" @click="subWood">&laquo;</span>');
        let addWood = $('<span class="add" @click="addWood">&raquo;</span>');
        fuelTypes.append(subWood);
        fuelTypes.append(wood);
        fuelTypes.append(addWood);
    }

    if (global.resource.Coal.display){
        let coal = $(`<b-tooltip :label="buildLabel('coal')" position="is-bottom" animated><span class="current">${loc('resource_Coal_name')} {{ Coal }}</span></b-tooltip>`);
        let subCoal = $('<span class="sub" @click="subCoal">&laquo;</span>');
        let addCoal = $('<span class="add" @click="addCoal">&raquo;</span>');
        fuelTypes.append(subCoal);
        fuelTypes.append(coal);
        fuelTypes.append(addCoal);
    }

    if (global.resource.Oil.display){
        let oil = $(`<b-tooltip :label="buildLabel('oil')" position="is-bottom" animated multilined><span class="current">${loc('resource_Oil_name')} {{ Oil }}</span></b-tooltip>`);
        let subOil = $('<span class="sub" @click="subOil">&laquo;</span>');
        let addOil = $('<span class="add" @click="addOil">&raquo;</span>');
        fuelTypes.append(subOil);
        fuelTypes.append(oil);
        fuelTypes.append(addOil);
    }

    if (global.resource.Steel.display && global.tech.smelting >= 2){
        let smelt = $('<div class="smelting"></div>');
        let ironSmelt = $(`<b-tooltip :label="ironLabel()" position="is-left" size="is-small" animated multilined><button class="button" @click="ironSmelting()">${loc('resource_Iron_name')} ${loc('modal_smelting')}: {{ Iron }}</button></b-tooltip>`);
        let steelSmelt = $(`<b-tooltip :label="steelLabel()" position="is-right" size="is-small" animated multilined><button class="button" @click="steelSmelting()">${loc('resource_Steel_name')} ${loc('modal_smelting')}: {{ Steel }}</button></b-tooltip>`);
        modal.append(smelt);
        smelt.append(ironSmelt);
        smelt.append(steelSmelt);
    }

    vues['specialModal'] = new Vue({
        data: global.city['smelter'],
        methods: {
            subWood(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
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
                    else {
                        break;
                    }
                }
            },
            addWood(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil < global.city.smelter.count){
                        global.city.smelter.Wood++;
                        global.city.smelter.Iron++;
                    }
                    else {
                        break;
                    }
                }
            },
            subCoal(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
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
                    else {
                        break;
                    }
                }
            },
            addCoal(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil < global.city.smelter.count){
                        global.city.smelter.Coal++;
                        global.city.smelter.Iron++;
                    }
                    else {
                        break;
                    }
                }
            },
            subOil(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
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
                    else {
                        break;
                    }
                }
            },
            addOil(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil < global.city.smelter.count){
                        global.city.smelter.Oil++;
                        global.city.smelter.Iron++;
                    }
                    else {
                        break;
                    }
                }
            },
            ironLabel(){
                let boost = global.tech['smelting'] >= 3 ? 12 : 10;
                if (global.race['pyrophobia']){
                    boost *= 0.9;
                }
                return loc('modal_smelter_iron',[boost,loc('resource_Iron_name')]);
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
                return loc('modal_smelter_steel',[boost,loc('resource_Steel_name'),loc('resource_Coal_name'),loc('resource_Iron_name')]);
            },
            ironSmelting(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    let count = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil;
                    if (global.city.smelter.Iron + global.city.smelter.Steel < count){
                        global.city.smelter.Iron++;
                    }
                    else if (global.city.smelter.Iron < count && global.city.smelter.Steel > 0){
                        global.city.smelter.Iron++;
                        global.city.smelter.Steel--;
                    }
                    else {
                        break;
                    }
                }
            },
            steelSmelting(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    let count = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil;
                    if (global.city.smelter.Iron + global.city.smelter.Steel < count){
                        global.city.smelter.Steel++;
                    }
                    else if (global.city.smelter.Steel < count && global.city.smelter.Iron > 0){
                        global.city.smelter.Steel++;
                        global.city.smelter.Iron--;
                    }
                    else {
                        break;
                    }
                }
            },
            buildLabel: function(type){
                switch(type){
                    case 'wood':
                        return loc('modal_build_wood',[loc('resource_Lumber_name')]);
                    case 'coal':
                        let coal_fuel = global.race['kindling_kindred'] ? 0.15 : 0.25;
                        if (global.tech['uranium'] && global.tech['uranium'] >= 3){
                            return loc('modal_build_coal2',[coal_fuel,loc('resource_Coal_name'),loc('resource_Uranium_name')]);
                        }
                        else {
                            return loc('modal_build_coal1',[coal_fuel,loc('resource_Coal_name')]);
                        }
                    case 'oil':
                        return loc('modal_build_oil',['0.35',loc('resource_Oil_name')]);
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

export const f_rate = {
    Lux: {
        demand: [0.14,0.21,0.28,0.35],
        fur: [2,3,4,5]
    },
    Alloy: {
        copper: [0.75,1.12,1.49,1.86],
        aluminium: [1,1.5,2,2.5],
        output: [0.075,0.112,0.149,0.186]
    },
    Polymer: {
        oil_kk: [0.22,0.33,0.44,0.55],
        oil: [0.18,0.27,0.36,0.45],
        lumber: [15,22,29,36],
        output: [0.125,0.187,0.249,0.311],
    },
    Nano_Tube: {
        coal: [8,12,16,20],
        neutronium: [0.05,0.075,0.1,0.125],
        output: [0.2,0.3,0.4,0.5],
    }
};

function factoryModal(modal){
    let fuel = $(`<div><span class="has-text-warning">${loc('modal_factory_operate')}:</span> <span class="has-text-info">{{count | on}}/{{ on | max }}</span></div>`);
    modal.append(fuel);

    let lux = $(`<div class="factory"><b-tooltip :label="buildLabel('Lux')" position="is-left" size="is-small" multilined animated><span>${loc('modal_factory_lux')}</span></b-tooltip></div>`);
    modal.append(lux);

    let luxCount = $(`<span class="current">{{ Lux }}</span>`);
    let subLux = $(`<span class="sub" @click="subItem('Lux')">&laquo;</span>`);
    let addLux = $(`<span class="add" @click="addItem('Lux')">&raquo;</span>`);
    lux.append(subLux);
    lux.append(luxCount);
    lux.append(addLux);

    let alloy = $(`<div class="factory"><b-tooltip :label="buildLabel('Alloy')" position="is-left" size="is-small" multilined animated><span>${loc('resource_Alloy_name')}</span></b-tooltip></div>`);
    modal.append(alloy);

    let alloyCount = $(`<span class="current">{{ Alloy }}</span>`);
    let subAlloy = $(`<span class="sub" @click="subItem('Alloy')">&laquo;</span>`);
    let addAlloy = $(`<span class="add" @click="addItem('Alloy')">&raquo;</span>`);
    alloy.append(subAlloy);
    alloy.append(alloyCount);
    alloy.append(addAlloy);

    if (global.tech['polymer']){
        let polymer = $(`<div class="factory"><b-tooltip :label="buildLabel('Polymer')" position="is-left" size="is-small" multilined animated><span>${loc('resource_Polymer_name')}</span></b-tooltip></div>`);
        modal.append(polymer);

        let polymerCount = $(`<span class="current">{{ Polymer }}</span>`);
        let subPolymer= $(`<span class="sub" @click="subItem('Polymer')">&laquo;</span>`);
        let addPolymer = $(`<span class="add" @click="addItem('Polymer')">&raquo;</span>`);
        polymer.append(subPolymer);
        polymer.append(polymerCount);
        polymer.append(addPolymer);
    }

    if (global.tech['nano']){
        let nano = $(`<div class="factory"><b-tooltip :label="buildLabel('Nano')" position="is-left" size="is-small" multilined animated><span>${loc('resource_Nano_Tube_name')}</span></b-tooltip></div>`);
        modal.append(nano);

        let nanoCount = $(`<span class="current">{{ Nano }}</span>`);
        let subNano= $(`<span class="sub" @click="subItem('Nano')">&laquo;</span>`);
        let addNano = $(`<span class="add" @click="addItem('Nano')">&raquo;</span>`);
        nano.append(subNano);
        nano.append(nanoCount);
        nano.append(addNano);
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
                let max = global.space['red_factory'] ? global.space.red_factory.on + global.city.factory.on : global.city.factory.on;
                if (global.city.factory.Lux + global.city.factory.Alloy + global.city.factory.Polymer + global.city.factory.Nano < max){
                    global.city.factory[item]++;
                }
            },
            buildLabel: function(type){
                let assembly = global.tech['factory'] ? true : false;
                switch(type){
                    case 'Lux':
                        let demand = +(global.resource[races[global.race.species].name].amount * (assembly ? f_rate.Lux.demand[global.tech['factory']] : f_rate.Lux.demand[0])).toFixed(2);
                        let fur = assembly ? f_rate.Lux.fur[global.tech['factory']] : f_rate.Lux.fur[0];
                        return loc('modal_factory_lux_label',[fur,loc('resource_Furs_name'),demand]);
                    case 'Alloy':
                        let copper = assembly ? f_rate.Alloy.copper[global.tech['factory']] : f_rate.Alloy.copper[0];
                        let aluminium = assembly ? f_rate.Alloy.aluminium[global.tech['factory']] : f_rate.Alloy.aluminium[0];
                        return loc('modal_factory_alloy_label',[copper,loc('resource_Copper_name'),aluminium,loc('resource_Aluminium_name'),loc('resource_Alloy_name')]);
                    case 'Polymer':
                        if (global.race['kindling_kindred']){
                            let oil = assembly ? f_rate.Polymer.oil_kk[global.tech['factory']] : f_rate.Polymer.oil_kk[0];
                            return loc('modal_factory_polymer_label2',[oil,loc('resource_Oil_name'),loc('resource_Polymer_name')]);
                        }
                        else {
                            let oil = assembly ? f_rate.Polymer.oil[global.tech['factory']] : f_rate.Polymer.oil[0];
                            let lumber = assembly ? f_rate.Polymer.lumber[global.tech['factory']] : f_rate.Polymer.lumber[0];
                            return loc('modal_factory_polymer_label1',[oil,loc('resource_Oil_name'),lumber,loc('resource_Lumber_name'),loc('resource_Polymer_name')]);
                        }
                    case 'Nano':
                        let coal = assembly ? f_rate.Nano_Tube.coal[global.tech['factory']] : f_rate.Nano_Tube.coal[0];
                        let neutronium = assembly ? f_rate.Nano_Tube.neutronium[global.tech['factory']] : f_rate.Nano_Tube.neutronium[0];
                        return loc('modal_factory_nano_label',[coal,loc('resource_Coal_name'),neutronium,loc('resource_Neutronium_name'),loc('resource_Nano_Tube_name')]);
                }
            }
        },
        filters: {
            on(){
                return global.city.factory.Lux + global.city.factory.Alloy + global.city.factory.Polymer + global.city.factory.Nano;
            },
            max(){
                return global.space['red_factory'] ? global.space.red_factory.on + global.city.factory.on : global.city.factory.on;
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
            return loc('city_basic_housing_title2');
        case 'wolven':
            return loc('city_basic_housing_title3');
        case 'entish':
            return loc('city_basic_housing_title4');
        case 'arraak':
            return loc('city_basic_housing_title5');
        case 'pterodacti':
            return loc('city_basic_housing_title5');
        case 'sporgar':
            return loc('city_basic_housing_title6');
        default:
            return loc('city_basic_housing_title1');
    }
}

function sentience(){
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

    messageQueue(loc('sentience',[races[global.race.species].type,races[global.race.species].entity,races[global.race.species].name]));

    if (global.race['slow'] || global.race['hyper']){
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        window.location.reload();
    }

    defineGarrison();
}

function bioseed(){
    Object.keys(vues).forEach(function (v){
        vues[v].$destroy();
    });
    let god = global.race.species;
    let old_god = global.race.gods;
    let genus = races[god].type;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let plasmid = global.race.Plasmid.count;
    let pop = global['resource'][races[global.race.species].name].amount + global.civic.garrison.workers;
    let new_plasmid = Math.round(pop / 3);
    let k_base = global.stats.know;
    let k_inc = 50000;
    while (k_base > k_inc){
        new_plasmid++;
        k_base -= k_inc;
        k_inc *= 1.015;
    }
    if (global.stats.died === 0){
        unlockAchieve(`pacifist`);
    }
    new_plasmid = challenge_multiplier(new_plasmid);
    plasmid += new_plasmid;
    global.stats.reset++;
    global.stats.tdays += global.stats.days;
    global.stats.days = 0;
    global.stats.tknow += global.stats.know;
    global.stats.know = 0;
    global.stats.tstarved += global.stats.starved;
    global.stats.starved = 0;
    global.stats.tdied += global.stats.died;
    global.stats.died = 0;
    global.stats.plasmid += new_plasmid;
    unlockAchieve(`seeder`);
    let new_biome = unlockAchieve(`biome_${biome}`);
    let new_genus = unlockAchieve(`genus_${genus}`);
    global['race'] = { 
        species : 'protoplasm', 
        gods: god,
        old_gods: old_god,
        Plasmid: { count: plasmid },
        seeded: true,
        probes: global.starDock.probes.count,
        seed: Math.floor(Math.random(0,10000)),
    };
    global.city = {
        calendar: {
            day: 0,
            year: 0,
            weather: 2,
            temp: 1,
            moon: 0,
            wind: 0,
            orbit: orbit
        },
        biome: biome
    };
    global.space = {};
    global.starDock = {};
    global.civic = { free: 0 };
    global.resource = {};
    global.evolution = {};
    global.tech = { theology: 1 };
    global.event = 100;
    global.settings.civTabs = 0;
    global.settings.showEvolve = true;
    global.settings.showCity = false;
    global.settings.showIndustry = false;
    global.settings.showResearch = false;
    global.settings.showCivic = false;
    global.settings.showMarket = false;
    global.settings.showGenetics = false;
    global.settings.showSpace = false;
    global.settings.space.home = true;
    global.settings.space.moon = false;
    global.settings.space.red = false;
    global.settings.space.hell = false;
    global.settings.space.sun = false;
    global.settings.space.gas = false;
    global.settings.space.gas_moon = false;
    global.settings.space.belt = false;
    global.settings.space.dwarf = false;
    global.settings.space.blackhole = false;
    global.settings.arpa = false;
    global.settings.resTabs = 0;
    global.arpa = {};
    if (!new_biome && !new_genus){
        global.lastMsg = false;
    }
    global.new = true;
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;
    
    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}
