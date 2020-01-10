import { global, save, poppers, keyMultiplier, clearStates, keyMap, srSpeak, sizeApproximation, p_on, moon_on, quantum_level } from './vars.js';
import { loc } from './locale.js';
import { timeCheck, timeFormat, vBind, costMultiplier, genCivName, powerModifier, challenge_multiplier, adjustCosts, modRes, messageQueue, format_emblem } from './functions.js';
import { unlockAchieve, unlockFeat, drawAchieve, checkAchievements } from './achieve.js';
import { races, genus_traits, randomMinorTrait, cleanAddTrait, biomes, planetTraits } from './races.js';
import { defineResources, loadMarket, spatialReasoning, resource_values, atomic_mass } from './resources.js';
import { loadFoundry } from './jobs.js';
import { loadIndustry } from './industry.js';
import { defineIndustry, defineGarrison, buildGarrison, foreignGov, armyRating, dragQueue } from './civics.js';
import { spaceTech, interstellarTech, space, deepSpace } from './space.js';
import { renderFortress, fortressTech } from './portal.js';
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
                if (payCosts($(this)[0].cost)){
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
                if (payCosts($(this)[0].cost)){
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
                let dna = global.evolution['bilateral_symmetry'] || global.evolution['poikilohydric'] || global.evolution['spores'] ? 2 : 1;
                return loc('evo_nucleus_effect',[dna]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
                if (payCosts($(this)[0].cost)){
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
                if (payCosts($(this)[0].cost)){
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
                if (payCosts($(this)[0].cost)){
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
                if (payCosts($(this)[0].cost)){
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
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_chloroplasts_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_chloroplasts_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
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
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_chitin_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_chitin_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
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
                if (payCosts($(this)[0].cost)){
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
                if (payCosts($(this)[0].cost)){
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
                if (payCosts($(this)[0].cost)){
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
                if (payCosts($(this)[0].cost)){
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
                    if (global.city.biome === 'forest'){
                        global.evolution['fey'] = { count: 0 };
                        addAction('evolution','fey');
                    }
                    if (global.city.biome === 'desert'){
                        global.evolution['sand'] = { count: 0 };
                        addAction('evolution','sand');
                    }
                    if (global.city.biome === 'volcanic'){
                        global.evolution['heat'] = { count: 0 };
                        addAction('evolution','heat');
                    }
                    if (global.city.biome === 'tundra'){
                        global.evolution['polar'] = { count: 0 };
                        addAction('evolution','polar');
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['bryophyte'].count++;
                    removeAction(actions.evolution.bryophyte.id);
                    global.evolution['final'] = 100;
                    global.evolution['sentience'] = { count: 0 };
                    addAction('evolution','sentience');
                    if (global.race.seeded || global.stats.achieve['creator']){
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
            title: loc('evo_athropods_title'),
            desc: loc('evo_athropods_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_athropods_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_athropods_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
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
                    if (global.city.biome === 'forest'){
                        removeAction(actions.evolution.fey.id);
                        delete global.evolution.fey;
                    }
                    if (global.city.biome === 'desert'){
                        removeAction(actions.evolution.sand.id);
                        delete global.evolution.sand;
                    }
                    if (global.city.biome === 'volcanic'){
                        removeAction(actions.evolution.heat.id);
                        delete global.evolution.heat;
                    }
                    if (global.city.biome === 'tundra'){
                        removeAction(actions.evolution.polar.id);
                        delete global.evolution.polar;
                    }
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded || global.stats.achieve['creator']){
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
                if (payCosts($(this)[0].cost)){
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
                    if (global.city.biome === 'forest'){
                        removeAction(actions.evolution.fey.id);
                        delete global.evolution.fey;
                    }
                    if (global.city.biome === 'desert'){
                        removeAction(actions.evolution.sand.id);
                        delete global.evolution.sand;
                    }
                    if (global.city.biome === 'volcanic'){
                        removeAction(actions.evolution.heat.id);
                        delete global.evolution.heat;
                    }
                    if (global.city.biome === 'tundra'){
                        removeAction(actions.evolution.polar.id);
                        delete global.evolution.polar;
                    }
                    if (global.city.biome === 'hellscape'){
                        global.evolution['demonic'] = { count: 0 };
                        addAction('evolution','demonic');
                    }
                    if (global.city.biome === 'eden'){
                        global.evolution['celestial'] = { count: 0 };
                        addAction('evolution','celestial');
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
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_humanoid_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_humanoid_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['humanoid'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    delete global.evolution.gigantism;
                    delete global.evolution.dwarfism;
                    delete global.evolution.animalism;
                    if (global.city.biome === 'hellscape'){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden'){
                        removeAction(actions.evolution.celestial.id);
                        delete global.evolution.celestial;
                    }
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded || global.stats.achieve['creator']){
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
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_gigantism_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_gigantism_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['gigantism'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    delete global.evolution.humanoid;
                    delete global.evolution.dwarfism;
                    delete global.evolution.animalism;
                    if (global.city.biome === 'hellscape'){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden'){
                        removeAction(actions.evolution.celestial.id);
                        delete global.evolution.celestial;
                    }
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded || global.stats.achieve['creator']){
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
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_dwarfism_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_dwarfism_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['dwarfism'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    delete global.evolution.humanoid;
                    delete global.evolution.gigantism;
                    delete global.evolution.animalism;
                    if (global.city.biome === 'hellscape'){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden'){
                        removeAction(actions.evolution.celestial.id);
                        delete global.evolution.celestial;
                    }
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded || global.stats.achieve['creator']){
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
        animalism: {
            id: 'evo-animalism',
            title: loc('evo_animalism_title'),
            desc: loc('evo_animalism_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_animalism_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_animalism_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['animalism'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    delete global.evolution.humanoid;
                    delete global.evolution.gigantism;
                    delete global.evolution.dwarfism;
                    if (global.city.biome === 'hellscape'){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden'){
                        removeAction(actions.evolution.celestial.id);
                        delete global.evolution.celestial;
                    }
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded || global.stats.achieve['creator']){
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
        celestial: {
            id: 'evo-celestial',
            title: loc('evo_celestial_title'),
            desc: loc('evo_celestial_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return loc('evo_celestial_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['celestial'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    removeAction(actions.evolution.celestial.id);
                    delete global.evolution.humanoid;
                    delete global.evolution.gigantism;
                    delete global.evolution.dwarfism;
                    delete global.evolution.animalism;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded || global.stats.achieve['creator']){
                        global.evolution['seraph'] = { count: 0 };
                        global.evolution['unicorn'] = { count: 0 };
                        addAction('evolution','seraph');
                        addAction('evolution','unicorn');
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
        demonic: {
            id: 'evo-demonic',
            title: loc('evo_demonic_title'),
            desc: loc('evo_demonic_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe === 'evil' ? `<div>${loc('evo_demonic_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_demonic_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['demonic'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    removeAction(actions.evolution.demonic.id);
                    delete global.evolution.humanoid;
                    delete global.evolution.gigantism;
                    delete global.evolution.dwarfism;
                    delete global.evolution.animalism;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded || global.stats.achieve['creator']){
                        global.evolution['balorg'] = { count: 0 };
                        global.evolution['imp'] = { count: 0 };
                        addAction('evolution','balorg');
                        addAction('evolution','imp');
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
                if (payCosts($(this)[0].cost)){
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
                    if (global.race.seeded || global.stats.achieve['creator']){
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
        fey: {
            id: 'evo-fey',
            title: loc('evo_fey_title'),
            desc: loc('evo_fey_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_fey_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['fey'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    removeAction(actions.evolution.fey.id);
                    delete global.evolution.athropods;
                    delete global.evolution.mammals;
                    delete global.evolution.eggshell;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded || global.stats.achieve['creator']){
                        global.evolution['dryad'] = { count: 0 };
                        global.evolution['satyr'] = { count: 0 };
                        addAction('evolution','dryad');
                        addAction('evolution','satyr');
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
        heat: {
            id: 'evo-heat',
            title: loc('evo_heat_title'),
            desc: loc('evo_heat_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_heat_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['heat'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    removeAction(actions.evolution.heat.id);
                    delete global.evolution.athropods;
                    delete global.evolution.mammals;
                    delete global.evolution.eggshell;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded || global.stats.achieve['creator']){
                        global.evolution['phoenix'] = { count: 0 };
                        global.evolution['salamander'] = { count: 0 };
                        addAction('evolution','phoenix');
                        addAction('evolution','salamander');
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
        polar: {
            id: 'evo-polar',
            title: loc('evo_polar_title'),
            desc: loc('evo_polar_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_polar_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['polar'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    removeAction(actions.evolution.polar.id);
                    delete global.evolution.athropods;
                    delete global.evolution.mammals;
                    delete global.evolution.eggshell;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded || global.stats.achieve['creator']){
                        global.evolution['yeti'] = { count: 0 };
                        global.evolution['wendigo'] = { count: 0 };
                        addAction('evolution','yeti');
                        addAction('evolution','wendigo');
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
        sand: {
            id: 'evo-sand',
            title: loc('evo_sand_title'),
            desc: loc('evo_sand_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_sand_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sand'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    removeAction(actions.evolution.sand.id);
                    delete global.evolution.athropods;
                    delete global.evolution.mammals;
                    delete global.evolution.eggshell;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded || global.stats.achieve['creator']){
                        global.evolution['tuskin'] = { count: 0 };
                        global.evolution['kamel'] = { count: 0 };
                        addAction('evolution','tuskin');
                        addAction('evolution','kamel');
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
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_eggshell_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_eggshell_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
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
                    if (global.city.biome === 'forest'){
                        removeAction(actions.evolution.fey.id);
                        delete global.evolution.fey;
                    }
                    if (global.city.biome === 'desert'){
                        removeAction(actions.evolution.sand.id);
                        delete global.evolution.sand;
                    }
                    if (global.city.biome === 'volcanic'){
                        removeAction(actions.evolution.heat.id);
                        delete global.evolution.heat;
                    }
                    if (global.city.biome === 'tundra'){
                        removeAction(actions.evolution.polar.id);
                        delete global.evolution.polar;
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['endothermic'].count++;
                    removeAction(actions.evolution.endothermic.id);
                    removeAction(actions.evolution.ectothermic.id);
                    delete global.evolution.ectothermic;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded || global.stats.achieve['creator']){
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['ectothermic'].count++;
                    removeAction(actions.evolution.endothermic.id);
                    removeAction(actions.evolution.ectothermic.id);
                    delete global.evolution.endothermic;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    if (global.race.seeded || global.stats.achieve['creator']){
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
                if (payCosts($(this)[0].cost)){
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
                    else if (global.evolution['fey']){
                        if (path < 50){
                            global.race.species = 'dryad';
                        }
                        else {
                            global.race.species = 'satyr';
                        }
                    }
                    else if (global.evolution['heat']){
                        if (path < 50){
                            global.race.species = 'phoenix';
                        }
                        else {
                            global.race.species = 'salamander';
                        }
                    }
                    else if (global.evolution['polar']){
                        if (path < 50){
                            global.race.species = 'yeti';
                        }
                        else {
                            global.race.species = 'wendigo';
                        }
                    }
                    else if (global.evolution['sand']){
                        if (path < 50){
                            global.race.species = 'tuskin';
                        }
                        else {
                            global.race.species = 'kamel';
                        }
                    }
                    else if (global.evolution['demonic']){
                        if (path < 50){
                            global.race.species = 'balorg';
                        }
                        else {
                            global.race.species = 'imp';
                        }
                    }
                    else if (global.evolution['celestial']){
                        if (path < 50){
                            global.race.species = 'seraph';
                        }
                        else {
                            global.race.species = 'unicorn';
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
            emblem(){
                if (global.evolution['humanoid']){
                    return format_emblem('genus_humanoid');
                }
                else if (global.evolution['gigantism']){
                    return format_emblem('genus_giant');
                }
                else if (global.evolution['dwarfism']){
                    return format_emblem('genus_small');
                }
                else if (global.evolution['animalism']){
                    return format_emblem('genus_animal');
                }
                else if (global.evolution['ectothermic']){
                    return format_emblem('genus_reptilian');
                }
                else if (global.evolution['endothermic']){
                    return format_emblem('genus_avian');
                }
                else if (global.evolution['chitin']){
                    return format_emblem('genus_fungi');
                }
                else if (global.evolution['athropods']){
                    return format_emblem('genus_insectoid');
                }
                else if (global.evolution['chloroplasts']){
                    return format_emblem('genus_plant');
                }
                else if (global.evolution['aquatic']){
                    return format_emblem('genus_aquatic');
                }
                else if (global.evolution['demonic']){
                    return format_emblem('genus_demonic');
                }
                else if (global.evolution['celestial']){
                    return format_emblem('genus_angelic');
                }
                else {
                    return '';
                }
            }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'human';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_human'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'orc';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_orc'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'elven';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_elven'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'troll';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_troll'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'orge';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_orge'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'cyclops';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_cyclops'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'kobold';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_kobold'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'goblin';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_goblin'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'gnome';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_gnome'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'cath';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_cath'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'wolven';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_wolven'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'centaur';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_centaur'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'tortoisan';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_tortoisan'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'gecko';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_gecko'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'slitheryn';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_slitheryn'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'arraak';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_arraak'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'pterodacti';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_pterodacti'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'dracnid';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_dracnid'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'sporgar';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_sporgar'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'shroomi';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_shroomi'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'mantis';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_mantis'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'scorpid';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_scorpid'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'antid';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_antid'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'entish';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_entish'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'cacti';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_cacti'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'sharkin';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_sharkin'); }
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
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'octigoran';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_octigoran'); }
        },
        dryad: {
            id: 'evo-dryad',
            title(){ return races.dryad.name; },
            desc(){ return `${loc("evo_evolve")} ${races.dryad.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.dryad.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'dryad';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_dryad'); }
        },
        satyr: {
            id: 'evo-satyr',
            title(){ return races.satyr.name; },
            desc(){ return `${loc("evo_evolve")} ${races.satyr.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.satyr.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'satyr';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_satyr'); }
        },
        phoenix: {
            id: 'evo-phoenix',
            title(){ return races.phoenix.name; },
            desc(){ return `${loc("evo_evolve")} ${races.phoenix.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.phoenix.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'phoenix';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_phoenix'); }
        },
        salamander: {
            id: 'evo-salamander',
            title(){ return races.salamander.name; },
            desc(){ return `${loc("evo_evolve")} ${races.salamander.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.salamander.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'salamander';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_salamander'); }
        },
        yeti: {
            id: 'evo-yeti',
            title(){ return races.yeti.name; },
            desc(){ return `${loc("evo_evolve")} ${races.yeti.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.yeti.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'yeti';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_yeti'); }
        },
        wendigo: {
            id: 'evo-wendigo',
            title(){ return races.wendigo.name; },
            desc(){ return `${loc("evo_evolve")} ${races.wendigo.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.wendigo.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'wendigo';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_wendigo'); }
        },
        tuskin: {
            id: 'evo-tuskin',
            title(){ return races.tuskin.name; },
            desc(){ return `${loc("evo_evolve")} ${races.tuskin.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.tuskin.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'tuskin';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_tuskin'); }
        },
        kamel: {
            id: 'evo-kamel',
            title(){ return races.kamel.name; },
            desc(){ return `${loc("evo_evolve")} ${races.kamel.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.kamel.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'kamel';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_kamel'); }
        },
        balorg: {
            id: 'evo-balorg',
            title(){ return races.balorg.name; },
            desc(){ return `${loc("evo_evolve")} ${races.balorg.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.balorg.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'balorg';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_balorg'); }
        },
        imp: {
            id: 'evo-imp',
            title(){ return races.imp.name; },
            desc(){ return `${loc("evo_evolve")} ${races.imp.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.imp.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'imp';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_imp'); }
        },
        seraph: {
            id: 'evo-seraph',
            title(){ return races.seraph.name; },
            desc(){ return `${loc("evo_evolve")} ${races.seraph.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.seraph.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'seraph';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_seraph'); }
        },
        unicorn: {
            id: 'evo-unicorn',
            title(){ return races.unicorn.name; },
            desc(){ return `${loc("evo_evolve")} ${races.unicorn.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.unicorn.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'unicorn';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_unicorn'); }
        },
        bunker: {
            id: 'evo-bunker',
            title: loc('evo_bunker'),
            desc(){ return `<div>${loc('evo_bunker')}</div><div class="has-text-special">${loc('evo_challenge')}</div>`; },
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_bunker_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['bunker'] = { count: 1 };
                    removeAction(actions.evolution.bunker.id);
                    evoProgress();
                    if (global.race.universe === 'antimatter'){
                        global.evolution['mastery'] = { count: 0 };
                    }
                    else {
                        global.evolution['plasmid'] = { count: 0 };
                    }
                    global.evolution['trade'] = { count: 0 };
                    global.evolution['craft'] = { count: 0 };
                    global.evolution['crispr'] = { count: 0 };
                    global.evolution['junker'] = { count: 0 };
                    global.evolution['joyless'] = { count: 0 };
                    if (global.stats.achieve['whitehole']){
                        global.evolution['decay'] = { count: 0 };
                    }
                    challengeGeneHeader();
                    if (global.race.universe === 'antimatter'){
                        addAction('evolution','mastery');
                    }
                    else {
                        addAction('evolution','plasmid');
                    }
                    addAction('evolution','trade');
                    addAction('evolution','craft');
                    addAction('evolution','crispr');
                    challengeActionHeader();
                    addAction('evolution','junker');
                    addAction('evolution','joyless');
                    if (global.stats.achieve['whitehole']){
                        addAction('evolution','decay');
                    }
                }
                return false;
            },
            flair: loc('evo_bunker_flair')
        },
        plasmid: {
            id: 'evo-plasmid',
            title: loc('evo_challenge_plasmid'),
            desc: loc('evo_challenge_plasmid'),
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_challenge_plasmid_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.race['no_plasmid']){
                        delete global.race['no_plasmid'];
                        $(`#${$(this)[0].id}`).removeClass('hl');
                    }
                    else {
                        global.race['no_plasmid'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');
                    }
                    drawAchieve();
                }
                return false;
            },
            highlight(){ return global.race['no_plasmid'] ? true : false; }
        },
        mastery: {
            id: 'evo-mastery',
            title: loc('evo_challenge_mastery'),
            desc: loc('evo_challenge_mastery'),
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_challenge_mastery_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.race['weak_mastery']){
                        delete global.race['weak_mastery'];
                        $(`#${$(this)[0].id}`).removeClass('hl');
                    }
                    else {
                        global.race['weak_mastery'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');
                    }
                    drawAchieve();
                }
                return false;
            },
            highlight(){ return global.race['weak_mastery'] ? true : false; }
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
                if (payCosts($(this)[0].cost)){
                    if (global.race['no_trade']){
                        delete global.race['no_trade'];
                        $(`#${$(this)[0].id}`).removeClass('hl');
                    }
                    else {
                        global.race['no_trade'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');
                    }
                    drawAchieve();
                }
                return false;
            },
            highlight(){ return global.race['no_trade'] ? true : false; }
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
                if (payCosts($(this)[0].cost)){
                    if (global.race['no_craft']){
                        delete global.race['no_craft'];
                        $(`#${$(this)[0].id}`).removeClass('hl');
                    }
                    else {
                        global.race['no_craft'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');
                    }
                    drawAchieve();
                }
                return false;
            },
            highlight(){ return global.race['no_craft'] ? true : false; }
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
                if (payCosts($(this)[0].cost)){
                    if (payCosts($(this)[0].cost)){
                        if (global.race['no_crispr']){
                            delete global.race['no_crispr'];
                            $(`#${$(this)[0].id}`).removeClass('hl');
                        }
                        else {
                            global.race['no_crispr'] = 1;
                            $(`#${$(this)[0].id}`).addClass('hl');
                        }
                        drawAchieve();
                    }
                    drawAchieve();
                }
                return false;
            },
            highlight(){ return global.race['no_crispr'] ? true : false; }
        },
        junker: {
            id: 'evo-junker',
            title: loc('evo_challenge_junker'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div class="has-text-danger">${loc('evo_no_toggle')}</div>` : `<div>${loc('evo_challenge_junker_desc')}</div><div class="has-text-danger">${loc('evo_no_toggle')}</div>`; },
            cost: {
                DNA(){ return 25; }
            },
            effect(){ 
                let challengeType = global.race.universe === 'antimatter' ? loc('evo_challenge_mastery') : loc('evo_challenge_plasmid');
                return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_challenge_junker_effect',[challengeType])}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_challenge_junker_effect',[challengeType]); },
            action(){
                if (payCosts(actions.evolution.junker.cost)){
                    global.race.species = 'junker';
                    global.race['junker'] = 1;
                    if (global.race.universe === 'antimatter') {
                        global.race['weak_mastery'] = 1; 
                    }
                    else {
                        global.race['no_plasmid'] = 1;
                    }
                    global.race['no_trade'] = 1;
                    global.race['no_craft'] = 1;
                    global.race['no_crispr'] = 1;
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_junker'); },
            flair: loc('evo_challenge_junker_flair')
        },
        joyless: {
            id: 'evo-joyless',
            title: loc('evo_challenge_joyless'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div>${loc('evo_challenge_joyless_desc')}</div>` : loc('evo_challenge_joyless_desc'); },
            cost: {
                DNA(){ return 25; }
            },
            effect: loc('evo_challenge_joyless_effect'),
            action(){
                if (payCosts(actions.evolution.joyless.cost)){
                    if (payCosts($(this)[0].cost)){
                        if (global.race['joyless']){
                            delete global.race['joyless'];
                            $(`#${$(this)[0].id}`).removeClass('hl');
                        }
                        else {
                            global.race['joyless'] = 1;
                            $(`#${$(this)[0].id}`).addClass('hl');
                        }
                        drawAchieve();
                    }
                }
                return false;
            },
            emblem(){ return format_emblem('joyless'); },
            flair: loc('evo_challenge_joyless_flair'),
            highlight(){ return global.race['joyless'] ? true : false; }
        },
        decay: {
            id: 'evo-decay',
            title: loc('evo_challenge_decay'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div>${loc('evo_challenge_decay_desc')}</div>` : loc('evo_challenge_decay_desc'); },
            cost: {
                DNA(){ return 25; }
            },
            effect: loc('evo_challenge_decay_effect'),
            action(){
                if (payCosts(actions.evolution.decay.cost)){
                    if (payCosts($(this)[0].cost)){
                        if (global.race['decay']){
                            delete global.race['decay'];
                            $(`#${$(this)[0].id}`).removeClass('hl');
                        }
                        else {
                            global.race['decay'] = 1;
                            $(`#${$(this)[0].id}`).addClass('hl');
                        }
                        drawAchieve();
                    }
                }
                return false;
            },
            emblem(){ return format_emblem('dissipated'); },
            flair: loc('evo_challenge_decay_flair'),
            highlight(){ return global.race['decay'] ? true : false; }
        },
    },
    city: {
        gift: {
            id: 'city-gift',
            title: loc('city_gift'),
            desc: loc('city_gift_desc'),
            category: 'outskirts',
            reqs: { primitive: 1 },
            no_queue(){ return true },
            not_tech: ['santa'],
            condition(){
                const date = new Date();
                if (date.getMonth() !== 11 || (date.getMonth() === 11 && (date.getDate() <= 16 || date.getDate() >= 25))){
                    return global['special'] && global.special['gift'] ? true : false;
                }
                return false;
            },
            action(){
                const date = new Date();
                if (date.getMonth() !== 11 || (date.getMonth() === 11 && (date.getDate() <= 16 || date.getDate() >= 25))){
                    if (global['special'] && global.special['gift']){
                        delete global.special['gift'];
                        if (global.race.universe === 'antimatter'){
                            global.race.Plasmid.anti += 100;
                            global.stats.antiplasmid += 100;
                            messageQueue(loc('city_gift_msg',[100,loc('arpa_genepool_effect_antiplasmid')]),'success');
                        }
                        else {
                            global.race.Plasmid.count += 100;
                            global.stats.plasmid += 100;
                            messageQueue(loc('city_gift_msg',[100,loc('arpa_genepool_effect_plasmid')]),'success');
                        }
                        drawCity();
                    }
                }
                return false;
            }
        },
        food: {
            id: 'city-food',
            title(){
                const date = new Date();
                if (date.getMonth() === 9 && date.getDate() === 31){
                    return loc('city_trick');
                }
                else {
                    return loc('city_food');
                }
            },
            desc(){
                const date = new Date();
                if (date.getMonth() === 9 && date.getDate() === 31){
                    return loc('city_trick_desc');
                }
                else {
                    return loc('city_food_desc');
                }
            },
            category: 'outskirts',
            reqs: { primitive: 1 },
            not_trait: ['soul_eater'],
            no_queue(){ return true },
            action(){
                if(global['resource']['Food'].amount < global['resource']['Food'].max){
                    modRes('Food',global.race['strong'] ? 2 : 1);
                }
                return false;
            }
        },
        lumber: {
            id: 'city-lumber',
            title(){
                const date = new Date();
                if (date.getMonth() === 9 && date.getDate() === 31){
                    return loc('city_dig');
                }
                else {
                    return loc('city_lumber');
                }
            },
            desc(){
                const date = new Date();
                if (date.getMonth() === 9 && date.getDate() === 31){
                    return loc('city_dig_desc');
                }
                else {
                    return loc('city_lumber_desc');
                }
            },
            category: 'outskirts',
            reqs: {},
            not_trait: ['evil'],
            no_queue(){ return true },
            action(){
                if (global['resource']['Lumber'].amount < global['resource']['Lumber'].max){
                    modRes('Lumber',global.race['strong'] ? 2 : 1);
                }
                return false;
            }
        },
        stone: {
            id: 'city-stone',
            title: loc('city_stone'),
            desc: loc('city_stone_desc'),
            category: 'outskirts',
            reqs: { primitive: 2 },
            no_queue(){ return true },
            action(){
                if (global['resource']['Stone'].amount < global['resource']['Stone'].max){
                    modRes('Stone',global.race['strong'] ? 2 : 1);
                }
                return false;
            }
        },
        slaughter: {
            id: 'city-slaughter',
            title: loc('city_evil'),
            desc(){
                if (global.race['soul_eater']){
                    return global.tech['primitive'] ? (global.resource.Furs.display ? loc('city_evil_desc3') : loc('city_evil_desc2')) : loc('city_evil_desc1');
                }
                else {
                    return global.resource.Furs.display ? loc('city_evil_desc4') : loc('city_evil_desc1');
                }
            },
            category: 'outskirts',
            reqs: {},
            trait: ['evil'],
            not_trait: ['kindling_kindred'],
            no_queue(){ return true },
            action(){
                if (global['resource']['Lumber'].amount < global['resource']['Lumber'].max){
                    modRes('Lumber',1);
                }
                if (global.race['soul_eater'] && global.tech['primitive'] && global['resource']['Food'].amount < global['resource']['Food'].max){
                    modRes('Food',1);
                }
                if (global.resource.Furs.display && global['resource']['Furs'].amount < global['resource']['Furs'].max){
                    modRes('Furs',1);
                }
                return false;
            }
        },
        slave_market: {
            id: 'city-slave_market',
            title: loc('city_slave_market'),
            desc: loc('city_slave_market_desc'),
            category: 'outskirts',
            reqs: { slaves: 2 },
            trait: ['slaver'],
            cost: {
                Money(){ return 25000 },
            },
            no_queue(){ return true },
            action(){
                if (global.race['slaver'] && global.city['slave_pen']){
                    let max = global.city.slave_pen.count * 5;
                    let keyMult = keyMultiplier();
                    for (var i=0; i<keyMult; i++){
                        if (max > global.city.slave_pen.slaves){
                            if (payCosts($(this)[0].cost)){
                                global.city.slave_pen.slaves++;
                            }
                            else {
                                break;
                            }
                        }
                        else {
                            break;
                        }
                    }
                }
                return false;
            }
        },
        s_alter: {
            id: 'city-s_alter',
            title: loc('city_s_alter'),
            desc(){
                return global.city['s_alter'].count >= 1 ? `<div>${loc('city_s_alter')}</div><div class="has-text-special">${loc('city_s_alter_desc')}</div>` : loc('city_s_alter');
            },
            category: 'outskirts',
            reqs: { mining: 1 },
            trait: ['cannibalize'],
            cost: {
                Stone(){ return global.city['s_alter'].count >= 1 ? 0 : 100; }
            },
            effect(){
                let desc = '';
                if (global.city.s_alter.rage > 0){
                    desc = desc + `<div>${loc('city_s_alter_rage',[15,timeFormat(global.city.s_alter.rage)])}</div>`;
                }
                if (global.city.s_alter.regen > 0){
                    desc = desc + `<div>${loc('city_s_alter_regen',[15,timeFormat(global.city.s_alter.regen)])}</div>`;
                }
                if (global.city.s_alter.mind > 0){
                    desc = desc + `<div>${loc('city_s_alter_mind',[15,timeFormat(global.city.s_alter.mind)])}</div>`;
                }
                if (global.city.s_alter.mine > 0){
                    desc = desc + `<div>${loc('city_s_alter_mine',[15,timeFormat(global.city.s_alter.mine)])}</div>`;
                }
                if (global.city.s_alter.harvest > 0){
                    let jobType = global.race['evil'] && !global.race['soul_eater'] ? loc('job_reclaimer') : loc('job_lumberjack');
                    desc = desc + `<div>${loc('city_s_alter_harvest',[15,timeFormat(global.city.s_alter.harvest),jobType])}</div>`;
                }
                return desc;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.city['s_alter'].count === 0){
                        global.city['s_alter'].count++;
                    }
                    else {
                        if (global['resource'][global.race.species].amount > 0){
                            global['resource'][global.race.species].amount--;
                            global['resource'].Food.amount += Math.rand(250,1000);
                            let low = 300;
                            let high = 600;
                            if (global.tech['sacrifice']){
                                switch (global.tech['sacrifice']){
                                    case 1:
                                        low = 900;
                                        high = 1800;
                                        break;
                                    case 2:
                                        low = 1800;
                                        high = 3600;
                                        break;
                                    case 3:
                                        low = 3600;
                                        high = 7200;
                                        break;
                                }
                            }
                            switch (Math.rand(0,5)){
                                case 0:
                                    global.city.s_alter.rage += Math.rand(low,high);
                                    break;
                                case 1:
                                    global.city.s_alter.mind += Math.rand(low,high);
                                    break;
                                case 2:
                                    global.city.s_alter.regen += Math.rand(low,high);
                                    break;
                                case 3:
                                    global.city.s_alter.mine += Math.rand(low,high);
                                    break;
                                case 4:
                                    global.city.s_alter.harvest += Math.rand(low,high);
                                    break;
                            }
                        }
                    }
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
            desc: loc('city_basic_housing_desc'),
            category: 'residential',
            reqs: { housing: 1 },
            cost: { 
                Money(offset){ 
                    if (global.city['basic_housing'] && global.city['basic_housing'].count >= 5){ 
                        return costMultiplier('basic_housing', offset, 20, 1.17);
                    } 
                    else { 
                        return 0; 
                    } 
                },
                Lumber(offset){ return global.race['kindling_kindred'] ? 0 : costMultiplier('basic_housing', offset, 10, 1.23); },
                Stone(offset){ return global.race['kindling_kindred'] ? costMultiplier('basic_housing', offset, 10, 1.23) : 0; }
            },
            effect: loc('plus_max_resource',[1,loc('citizen')]),
            action(){
                if (payCosts($(this)[0].cost)){
                    global['resource'][global.race.species].display = true;
                    global['resource'][global.race.species].max += 1;
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
                return housingLabel('medium');
            },
            desc: loc('city_cottage_desc'),
            category: 'residential',
            reqs: { housing: 2 },
            cost: { 
                Money(offset){ return costMultiplier('cottage', offset, 900, 1.15); },
                Plywood(offset){ return costMultiplier('cottage', offset, 25, 1.25); },
                Brick(offset){ return costMultiplier('cottage', offset, 20, 1.25); },
                Wrought_Iron(offset){ return costMultiplier('cottage', offset, 15, 1.25); }
            },
            effect(){
                if (global.tech['home_safe']){
                    let safe = spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? '5000' : '2000') : '1000');
                    return `<div>${loc('plus_max_citizens',[2])}</div><div>${loc('plus_max_resource',[`\$${safe}`,loc('resource_Money_name')])}</div>`;
                }
                else {
                    return loc('plus_max_citizens',[2]);
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global['resource'][global.race.species].max += 2;
                    global.city['cottage'].count++;
                    return true;
                }
                return false;
            }
        },
        apartment: {
            id: 'city-apartment',
            title(){
                return housingLabel('large');
            },
            desc: `<div>${loc('city_apartment_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            category: 'residential',
            reqs: { housing: 3 },
            cost: { 
                Money(offset){ return costMultiplier('apartment', offset, 1750, 1.26) - 500; },
                Furs(offset){ return costMultiplier('apartment', offset, 725, 1.32) - 500; },
                Copper(offset){ return costMultiplier('apartment', offset, 650, 1.32) - 500; },
                Cement(offset){ return costMultiplier('apartment', offset, 700, 1.32) - 500; },
                Steel(offset){ return costMultiplier('apartment', offset, 800, 1.32) - 500; }
            },
            effect(){
                if (global.tech['home_safe']){
                    let safe = spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? '10000' : '5000') : '2000');
                    return `<div>${loc('plus_max_citizens',[5])}. ${loc('minus_power',[1])}</div><div>${loc('plus_max_resource',[`\$${safe}`,loc('resource_Money_name')])}</div>`;
                }
                else {
                    return `${loc('plus_max_citizens',[5])}. ${loc('minus_power',[1])}`;
                }
            },
            powered(){ return 1; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['apartment'].count++;
                    if (global.city.power >= $(this)[0].powered()){
                        global['resource'][global.race.species].max += 5;
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
            category: 'residential',
            reqs: { housing: 1, currency: 1 },
            condition(){
                return (global.race['soul_eater'] && global.tech['s_lodge']) || (global.tech['hunting'] && global.tech['hunting'] >= 2) ? true : false; 
            },
            cost: { 
                Money(offset){ return costMultiplier('lodge', offset, 50, 1.32); },
                Lumber(offset){ return costMultiplier('lodge', offset, 20, 1.36); },
                Stone(offset){ return costMultiplier('lodge', offset, 10, 1.36); }
            },
            effect(){ return loc('plus_max_resource',[1,loc('citizen')]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['lodge'].count++;
                    global['resource'][global.race.species].max += 1;
                    return true;
                }
                return false;
            }
        },
        smokehouse: {
            id: 'city-smokehouse',
            title: loc('city_smokehouse'),
            desc: loc('city_food_storage'),
            category: 'trade',
            reqs: { hunting: 1 },
            cost: { 
                Money(offset){ return costMultiplier('smokehouse', offset, 85, 1.32); },
                Lumber(offset){ return costMultiplier('smokehouse', offset, 65, 1.36) },
                Stone(offset){ return costMultiplier('smokehouse', offset, 50, 1.36); }
            },
            effect(){ 
                let food = spatialReasoning(500);
                if (global.stats.achieve['blackhole']){ food = Math.round(food * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                return loc('plus_max_resource',[food, loc('resource_Food_name')]); 
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['smokehouse'].count++;
                    global['resource']['Food'].max += spatialReasoning(500);
                    return true;
                }
                return false;
            }
        },
        soul_well: {
            id: 'city-soul_well',
            title: loc('city_soul_well'),
            desc: loc('city_soul_well_desc'),
            category: 'trade',
            reqs: { soul_eater: 1 },
            cost: { 
                Money(offset){ if (global.city['soul_well'] && global.city['soul_well'].count >= 3){ return costMultiplier('soul_well', offset, 50, 1.32);} else { return 0; } },
                Lumber(offset){ return costMultiplier('soul_well', offset, 20, 1.36); },
                Stone(offset){ return costMultiplier('soul_well', offset, 10, 1.36); }
            },
            effect(){
                let souls = spatialReasoning(500);
                if (global.stats.achieve['blackhole']){ souls = Math.round(souls * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                return `<div>${loc('city_soul_well_effect',[global.race['ghostly'] ? 3.5 : 2])}</div><div>${loc('plus_max_resource',[souls, loc('resource_Souls_name')])}</div>`; 
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['soul_well'].count++;
                    return true;
                }
                return false;
            }
        },
        slave_pen: {
            id: 'city-slave_pen',
            title: loc('city_slave_pen'),
            desc: loc('city_slave_pen'),
            category: 'commercial',
            reqs: { slaves: 1 },
            cost: { 
                Money(offset){ return costMultiplier('slave_pen', offset, 250, 1.32); },
                Lumber(offset){ return costMultiplier('slave_pen', offset, 100, 1.36); },
                Stone(offset){ return costMultiplier('slave_pen', offset, 75, 1.36); },
                Copper(offset){ return costMultiplier('slave_pen', offset, 10, 1.36); }
            },
            effect(){
                let max = global.city.slave_pen.count * 5;
                return `<div>${loc('city_slave_pen_effect',[5])}</div><div>${loc('city_slave_pen_effect2',[global.city.slave_pen.slaves,max])}</div>`; 
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['slave_pen'].count++;
                    return true;
                }
                return false;
            }
        },
        farm: {
            id: 'city-farm',
            title: loc('city_farm'),
            desc: loc('city_farm_desc'),
            category: 'residential',
            reqs: { agriculture: 1 },
            cost: { 
                Money(offset){ if (global.city['farm'] && global.city['farm'].count >= 3){ return costMultiplier('farm', offset, 50, 1.32);} else { return 0; } },
                Lumber(offset){ return costMultiplier('farm', offset, 20, 1.36); },
                Stone(offset){ return costMultiplier('farm', offset, 10, 1.36); }
            },
            effect(){
                let farming = global.tech['agriculture'] >= 2 ? 1.25 : 0.75;
                farming *= global.city.biome === 'grassland' ? 1.1 : 1;
                farming *= global.tech['agriculture'] >= 7 ? 1.1 : 1;
                farming *= global.city.biome === 'hellscape' ? 0.25 : 1;
                farming *= global.city.ptrait === 'trashed' ? 0.75 : 1;
                farming = +farming.toFixed(2);
                return global.tech['farm'] ? `<div>${loc('city_farm_effect',[farming])}</div><div>${loc('plus_max_resource',[1,loc('citizen')])}</div>` : loc('city_farm_effect',[farming]); 
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['farm'].count++;
                    global.civic.farmer.display = true;
                    if (global.tech['farm']){
                        global['resource'][global.race.species].max += 1;
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
                    let power = global.race['environmentalist'] ? 1.5 : 1;
                    return loc('city_mill_desc2',[bonus,power]);
                }
                else {
                    return loc('city_mill_desc1',[bonus]);
                }
            },
            category: 'utility',
            reqs: { agriculture: 4 },
            not_tech: ['wind_plant'],
            cost: { 
                Money(offset){ return costMultiplier('mill', offset, 1000, 1.31); },
                Lumber(offset){ return costMultiplier('mill', offset, 600, 1.33); },
                Iron(offset){ return costMultiplier('mill', offset, 150, 1.33); },
                Cement(offset){ return costMultiplier('mill', offset, 125, 1.33); },
            },
            powered(){ return global.race['environmentalist'] ? -1.5 : -1; },
            power_reqs: { agriculture: 6 },
            action(){
                if (payCosts($(this)[0].cost)){
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
        windmill: {
            id: 'city-windmill',
            title(){
                return loc('city_mill_title2');
            },
            desc(){
                let power = global.race['environmentalist'] ? 1.5 : 1;
                return loc('city_windmill_desc',[power]);
            },
            category: 'utility',
            reqs: { wind_plant: 1 },
            cost: { 
                Money(offset){ return costMultiplier('windmill', offset, 1000, 1.31); },
                Lumber(offset){ return costMultiplier('windmill', offset, 600, 1.33); },
                Iron(offset){ return costMultiplier('windmill', offset, 150, 1.33); },
                Cement(offset){ return costMultiplier('windmill', offset, 125, 1.33); },
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['windmill'].count++;
                    return true;
                }
                return false;
            }
        },
        silo: {
            id: 'city-silo',
            title: loc('city_silo'),
            desc: loc('city_food_storage'),
            category: 'trade',
            reqs: { agriculture: 3 },
            cost: { 
                Money(offset){ return costMultiplier('silo', offset, 85, 1.32); },
                Lumber(offset){ return costMultiplier('silo', offset, 65, 1.36) },
                Stone(offset){ return costMultiplier('silo', offset, 50, 1.36); }
            },
            effect(){ 
                let food = spatialReasoning(500);
                if (global.stats.achieve['blackhole']){ food = Math.round(food * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                return loc('plus_max_resource',[food, loc('resource_Food_name')]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
            category: 'military',
            reqs: { military: 1, housing: 1 },
            cost: { 
                Money(offset){ return costMultiplier('garrison', offset, 240, 1.5); },
                Stone(offset){ return costMultiplier('garrison', offset, 260, 1.46); }
            },
            effect(){
                let bunks = global.tech['military'] >= 5 ? 3 : 2;
                if (global.race['chameleon']){
                    bunks--;
                }
                return loc('plus_max_resource',[bunks,loc('civics_garrison_soldiers')]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.civic['garrison'].display = true;
                    let gain = global.tech['military'] >= 5 ? 3 : 2;
                    if (global.race['chameleon']){
                        gain -= global.city.garrison.count;
                    }
                    global.civic['garrison'].max += gain;
                    global.city['garrison'].count++;
                    global.resource.Furs.display = true;
                    global.settings['showMil'] = true;
                    vBind({el: `#garrison`},'update');
                    vBind({el: `#c_garrison`},'update');
                    return true;
                }
                return false;
            }
        },
        hospital: {
            id: 'city-hospital',
            title: loc('city_hospital'),
            desc: loc('city_hospital_desc'),
            category: 'military',
            reqs: { medic: 1 },
            cost: { 
                Money(offset){ return costMultiplier('hospital', offset, 22000, 1.32); },
                Furs(offset){ return costMultiplier('hospital', offset, 4000, 1.32); },
                Aluminium(offset){ return costMultiplier('hospital', offset, 10000, 1.32); }
            },
            effect(){
                let healing = global.tech['medic'] >= 2 ? 10 : 5;
                return loc('city_hospital_effect',[healing]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
            category: 'military',
            reqs: { boot_camp: 1 },
            cost: { 
                Money(offset){ return costMultiplier('boot_camp', offset, 50000, 1.32); },
                Lumber(offset){ return costMultiplier('boot_camp', offset, 21500, 1.32); },
                Aluminium(offset){ return costMultiplier('boot_camp', offset, 12000, 1.32); },
                Brick(offset){ return costMultiplier('boot_camp', offset, 1400, 1.32); }
            },
            effect(){
                let rate = global.tech['boot_camp'] >= 2 ? 8 : 5;
                return global.tech['spy'] && global.tech['spy'] >= 3 ? `<div>${loc('city_boot_camp_effect',[rate])}</div><div>${loc('city_boot_camp_effect2',[10])}</div>` : loc('city_boot_camp_effect',[rate]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
            category: 'trade',
            reqs: { storage: 1 },
            cost: {
                Money(offset){ return costMultiplier('shed', offset, 75, 1.22); },
                Lumber(offset){
                    if (global.tech['storage'] && global.tech['storage'] < 4){ 
                        return costMultiplier('shed', offset, 55, 1.32);
                    }
                    else { 
                        return 0; 
                    }
                },
                Stone(offset){
                    if (global.tech['storage'] && global.tech['storage'] < 3){ 
                        return costMultiplier('shed', offset, 45, 1.32);
                    }
                    else { 
                        return 0; 
                    }
                },
                Iron(offset){
                    if (global.tech['storage'] && global.tech['storage'] >= 4){
                        return costMultiplier('shed', offset, 22, 1.32);
                    }
                    else {
                        return 0; 
                    }
                },
                Cement(offset){ 
                    if (global.tech['storage'] && global.tech['storage'] >= 3){
                        return costMultiplier('shed', offset, 18, 1.32);
                    }
                    else {
                        return 0; 
                    }
                }
            },
            effect(){
                let storage = '<div class="aTable">';
                let multiplier = storageMultipler();
                if (global.resource.Lumber.display){
                    let val = sizeApproximation(+(spatialReasoning(300) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Lumber.name])}</span>`;
                }
                if (global.resource.Stone.display){
                    let val = sizeApproximation(+(spatialReasoning(300) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Stone.name])}</span>`;
                }
                if (global.resource.Furs.display){
                    let val = sizeApproximation(+(spatialReasoning(125) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Furs.name])}</span>`;
                }
                if (global.resource.Copper.display){
                    let val = sizeApproximation(+(spatialReasoning(90) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Copper.name])}</span>`;
                }
                if (global.resource.Iron.display){
                    let val = sizeApproximation(+(spatialReasoning(125) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Iron.name])}</span>`;
                }
                if (global.resource.Aluminium.display){
                    let val = sizeApproximation(+(spatialReasoning(90) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Aluminium.name])}</span>`;
                }
                if (global.resource.Cement.display){
                    let val = sizeApproximation(+(spatialReasoning(100) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Cement.name])}</span>`;
                }
                if (global.resource.Coal.display){
                    let val = sizeApproximation(+(spatialReasoning(75) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Coal.name])}</span>`;
                }
                if (global.tech['storage'] >= 3 && global.resource.Steel.display){
                    let val = sizeApproximation(+(spatialReasoning(40) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Steel.name])}</span>`;
                }
                if (global.tech['storage'] >= 4 && global.resource.Titanium.display){
                    let val = sizeApproximation(+(spatialReasoning(20) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Titanium.name])}</span>`;
                }
                storage = storage + '</div>';
                return storage;
            },
            wide: true,
            action(){
                if (payCosts($(this)[0].cost)){
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
            category: 'trade',
            reqs: { container: 1 },
            cost: {
                Money(offset){ return costMultiplier('storage_yard', offset, 10, 1.36); },
                Brick(offset){ return costMultiplier('storage_yard', offset, 3, 1.35); },
                Wrought_Iron(offset){ return costMultiplier('storage_yard', offset, 5, 1.35); }
            },
            effect(){
                let cap = global.tech.container >= 3 ? 20 : 10;
                if (global.tech['world_control']){
                    cap += 10;
                }
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    cap *= 2;
                }
                if (global.tech['trade'] && global.tech['trade'] >= 3){
                    return `<div>${loc('plus_max_resource',[cap,loc('resource_Crates_name')])}</div><div>${loc('city_trade_effect',[1])}</div>`;
                }
                else {
                    return loc('plus_max_resource',[cap,loc('resource_Crates_name')]);
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.resource.Crates.display === false){
                        messageQueue(loc('city_storage_yard_msg'),'success');
                    }
                    global.city['storage_yard'].count++;
                    global.settings.showResources = true;
                    global.settings.showStorage = true;
                    if (!global.settings.showMarket) {
                        global.settings.marketTabs = 1;
                    }
                    let cap = global.tech.container >= 3 ? 20 : 10;
                    if (global.tech['world_control']){
                        cap += 10;
                    }
                    if (global.tech['particles'] && global.tech['particles'] >= 2){
                        cap *= 2;
                    }
                    global.resource.Crates.max += cap;
                    if (!global.resource.Crates.display){
                        global.resource.Crates.display = true;
                        $('#resources').empty();
                        defineResources();
                    }
                    return true;
                }
                return false;
            }
        },
        warehouse: {
            id: 'city-warehouse',
            title: loc('city_warehouse'),
            desc: loc('city_warehouse_desc'),
            category: 'trade',
            reqs: { steel_container: 1 },
            cost: {
                Money(offset){ return costMultiplier('warehouse', offset, 400, 1.26); },
                Cement(offset){ return costMultiplier('warehouse', offset, 75, 1.26); },
                Sheet_Metal(offset){ return costMultiplier('warehouse', offset, 25, 1.25); }
            },
            effect(){
                let cap = global.tech.steel_container >= 2 ? 20 : 10;
                if (global.tech['world_control']){
                    cap += 10;
                }
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    cap *= 2;
                }
                return loc('plus_max_resource',[cap,loc('resource_Containers_name')]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.resource.Containers.display === false){
                        messageQueue(loc('city_warehouse_msg'),'success');
                    }
                    global.city['warehouse'].count++;
                    global.settings.showResources = true;
                    global.settings.showStorage = true;
                    let cap = global.tech['steel_container'] >= 2 ? 20 : 10;
                    if (global.tech['world_control']){
                        cap += 10;
                    }
                    if (global.tech['particles'] && global.tech['particles'] >= 2){
                        cap *= 2;
                    }
                    global.resource.Containers.max += cap;
                    if (!global.resource.Containers.display){
                        global.resource.Containers.display = true;
                        $('#resources').empty();
                        defineResources();
                    }
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
            category: 'commercial',
            reqs: { banking: 1 },
            cost: { 
                Money(offset){ return costMultiplier('bank', offset, 250, 1.35); },
                Lumber(offset){ return costMultiplier('bank', offset, 75, 1.32); },
                Stone(offset){ return costMultiplier('bank', offset, 100, 1.35); }
            },
            effect(){ 
                let vault = bank_vault();
                vault = spatialReasoning(vault);
                vault = +(vault).toFixed(0);

                vault = '$'+vault;
                if (global.tech['banking'] >= 2){
                    return `<div>${loc('plus_max_resource',[vault,loc('resource_Money_name')])}</div><div>${loc('plus_max_resource',[1,loc('banker_name')])}</div>`; 
                }
                else {
                    return loc('plus_max_resource',[vault,loc('resource_Money_name')]);
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global['resource']['Money'].max += spatialReasoning(1800);
                    global.city.bank.count++;
                    global.civic.banker.max = global.city.bank.count;
                    return true;
                }
                return false;
            }
        },
        graveyard: {
            id: 'city-graveyard',
            title: loc('city_graveyard'),
            desc: loc('city_graveyard_desc'),
            category: 'industrial',
            reqs: { reclaimer: 1 },
            cost: { 
                Money(offset){ if (global.city['graveyard'] && global.city['graveyard'].count >= 5){ return costMultiplier('graveyard', offset, 5, 1.85);} else { return 0; } },
                Lumber(offset){ return costMultiplier('graveyard', offset, 2, 1.95); },
                Stone(offset){ return costMultiplier('graveyard', offset, 6, 1.9); }
            },
            effect:  function(){
                let lum = spatialReasoning(100);
                if (global.stats.achieve['blackhole']){ lum = Math.round(lum * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                return `<div>${loc('city_graveyard_effect',[8])}</div><div>${loc('plus_max_resource',[lum,global.resource.Lumber.name])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['graveyard'].count++;
                    global['resource']['Lumber'].max += spatialReasoning(100);
                    return true;
                }
                return false;
            }
        },
        lumber_yard: {
            id: 'city-lumber_yard',
            title: loc('city_lumber_yard'),
            desc: loc('city_lumber_yard_desc'),
            category: 'industrial',
            reqs: { axe: 1 },
            cost: { 
                Money(offset){ if (global.city['lumber_yard'] && global.city['lumber_yard'].count >= 5){ return costMultiplier('lumber_yard', offset, 5, 1.85);} else { return 0; } },
                Lumber(offset){ return costMultiplier('lumber_yard', offset, 6, 1.9); },
                Stone(offset){ return costMultiplier('lumber_yard', offset, 2, 1.95); }
            },
            effect:  function(){
                let lum = spatialReasoning(100);
                if (global.stats.achieve['blackhole']){ lum = Math.round(lum * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                return `<div>${loc('city_lumber_yard_effect',[2])}</div><div>${loc('plus_max_resource',[lum,global.resource.Lumber.name])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
            category: 'industrial',
            reqs: { saw: 1 },
            cost: { 
                Money(offset){ return costMultiplier('sawmill', offset, 3000, 1.26); },
                Iron(offset){ return costMultiplier('sawmill', offset, 400, 1.26); },
                Cement(offset){ return costMultiplier('sawmill', offset, 420, 1.26); }
            },
            effect(){
                let impact = global.tech['saw'] >= 2 ? 8 : 5;
                let lum = spatialReasoning(200);
                if (global.stats.achieve['blackhole']){ lum = Math.round(lum * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                let desc = `<div>${loc('plus_max_resource',[lum,global.resource.Lumber.name])}</div><div>${loc('city_sawmill_effect1',[impact])}</div>`;
                if (global.tech['foundry'] && global.tech['foundry'] >= 4){
                    desc = desc + `<div>${loc('city_sawmill_effect2',[2])}</div>`; 
                }
                if (global.city.powered){
                    desc = desc + `<div>${loc('city_sawmill_effect3',[4])}</div>`; 
                }
                return desc;
            },
            powered(){ return 1; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['sawmill'].count++;
                    let impact = global.tech['saw'] >= 2 ? 0.08 : 0.05;
                    global.civic.lumberjack.impact = (global.city['sawmill'].count * impact) + 1;
                    global['resource']['Lumber'].max += spatialReasoning(200);
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
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
            category: 'industrial',
            reqs: { mining: 1 },
            cost: { 
                Money(offset){ if (global.city['rock_quarry'] && global.city['rock_quarry'].count >= 2){ return costMultiplier('rock_quarry', offset, 20, 1.45);} else { return 0; } },
                Lumber(offset){ return costMultiplier('rock_quarry', offset, 50, 1.36); },
                Stone(offset){ return costMultiplier('rock_quarry', offset, 10, 1.36); }
            },
            effect() {
                let stone = spatialReasoning(100);
                if (global.stats.achieve['blackhole']){ stone = Math.round(stone * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                if (global.tech['mine_conveyor']){
                    return `<div>${loc('city_rock_quarry_effect1',[2])}</div><div>${loc('plus_max_resource',[stone,global.resource.Stone.name])}</div><div>${loc('city_rock_quarry_effect2',[4])}</div>`;
                }
                else {
                    return `<div>${loc('city_rock_quarry_effect1',[2])}</div><div>${loc('plus_max_resource',[stone,global.resource.Stone.name])}</div>`;
                }
            },
            powered(){ return 1; },
            power_reqs: { mine_conveyor: 1 },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['rock_quarry'].count++;
                    global.civic.quarry_worker.display = true;
                    global['resource']['Stone'].max += 100;
                    if (global.tech['mine_conveyor'] && global.city.power >= $(this)[0].powered()){
                        global.city['rock_quarry'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        cement_plant: {
            id: 'city-cement_plant',
            title: loc('city_cement_plant'),
            desc: loc('city_cement_plant_desc'),
            category: 'industrial',
            reqs: { cement: 1 },
            cost: { 
                Money(offset){ return costMultiplier('cement_plant', offset, 3000, 1.5); },
                Lumber(offset){ return costMultiplier('cement_plant', offset, 1800, 1.36); },
                Stone(offset){ return costMultiplier('cement_plant', offset, 2000, 1.32); }
            },
            effect(){ 
                if (global.tech['cement'] >= 5){
                    let screws = global.tech['cement'] >= 6 ? 8 : 5;
                    return `<div>${loc('city_cement_plant_effect1',[2])}</div><div>${loc('city_cement_plant_effect2',[$(this)[0].powered(),screws])}</div>`;
                }
                else {
                    return loc('city_cement_plant_effect1',[2]);
                }
            },
            powered(){ return 2; },
            power_reqs: { cement: 5 },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Cement.display = true;
                    global.city.cement_plant.count++;
                    global.civic.cement_worker.display = true;
                    global.civic.cement_worker.max = global.city.cement_plant.count * 2;
                    if (global.tech['cement'] && global.tech['cement'] >= 5 && global.city.power >= $(this)[0].powered()){
                        global.city['cement_plant'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        foundry: {
            id: 'city-foundry',
            title: loc('city_foundry'),
            desc: loc('city_foundry_desc'),
            category: 'industrial',
            reqs: { foundry: 1 },
            cost: {
                Money(offset){ return costMultiplier('foundry', offset, 750, 1.36); },
                Copper(offset){ return costMultiplier('foundry', offset, 250, 1.36); },
                Stone(offset){ return costMultiplier('foundry', offset, 100, 1.36); }
            },
            effect(){
                let desc = `<div>${loc('city_foundry_effect1',[1])}</div>`;
                if (global.tech['foundry'] >= 2){
                    let skill = global.tech['foundry'] >= 5 ? (global.tech['foundry'] >= 8 ? 8 : 5) : 3;
                    desc = desc + `<div>${loc('city_crafted_mats',[skill])}</div>`;
                }
                if (global.tech['foundry'] >= 6){
                    desc = desc + `<div>${loc('city_foundry_effect2',[2])}</div>`;
                }
                return desc;
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('city_factory'),
            desc: `<div>${loc('city_factory_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`, 
            category: 'industrial',
            reqs: { high_tech: 3 },
            cost: { 
                Money(offset){ return costMultiplier('factory', offset, 25000, 1.32); },
                Cement(offset){ return costMultiplier('factory', offset, 1000, 1.32); },
                Steel(offset){ return costMultiplier('factory', offset, 7500, 1.32); },
                Titanium(offset){ return costMultiplier('factory', offset, 2500, 1.32); }
            },
            effect(){
                let desc = `<div>${loc('city_factory_effect',[$(this)[0].powered()])}</div>`;
                if (global.tech['foundry'] >= 7){
                    desc = desc + `<div>${loc('city_crafted_mats',[5])}</div>`;
                }
                return desc;
            },
            powered(){ return 3; },
            special: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['factory'].count++;
                    global.resource.Alloy.display = true;
                    if (global.city.power >= $(this)[0].powered()){
                        global.city['factory'].on++;
                    }
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        smelter: {
            id: 'city-smelter',
            title: loc('city_smelter'),
            desc: loc('city_smelter_desc'),
            category: 'industrial',
            reqs: { smelting: 1 },
            cost: { 
                Money(offset){ return costMultiplier('smelter', offset, 1000, 1.32); },
                Iron(offset){ return costMultiplier('smelter', offset, 500, 1.33); }
            },
            effect(){ 
                var iron_yield = global.tech['smelting'] >= 3 ? (global.tech['smelting'] >= 7 ? 15 : 12) : 10;
                if (global.race['pyrophobia']){
                    iron_yield *= 0.9;
                }
                if (global.tech['smelting'] >= 2){
                    return loc('city_smelter_effect2',[iron_yield]);
                }
                else {
                    return loc('city_smelter_effect1',[iron_yield]);
                }
            },
            special: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['smelter'].count++;
                    if (global.race['kindling_kindred']){
                        global.city['smelter'].Coal++;
                    }
                    else {
                        global.city['smelter'].Wood++;
                    }
                    global.city['smelter'].Iron++;
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            },
            flair: `<div>${loc('city_smelter_flair1')}<div></div>${loc('city_smelter_flair2')}</div>`
        },
        metal_refinery: {
            id: 'city-metal_refinery',
            title: loc('city_metal_refinery'),
            desc: loc('city_metal_refinery_desc'),
            category: 'industrial',
            reqs: { alumina: 1 },
            cost: { 
                Money(offset){ return costMultiplier('metal_refinery', offset, 2500, 1.35); },
                Steel(offset){ return costMultiplier('metal_refinery', offset, 350, 1.35); }
            },
            powered(){ return 2; },
            power_reqs: { alumina: 2 },
            effect() {
                if (global.tech['alumina'] >= 2){
                    return `<div>${loc('city_metal_refinery_effect2',[6,12,$(this)[0].powered()])}</div>`;
                }
                else {
                    return `<div>${loc('city_metal_refinery_effect',[6])}</div>`;
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['metal_refinery'].count++;
                    global.resource.Aluminium.display = true;
                    if (global.tech['foundry']){
                        global.resource.Sheet_Metal.display = true;
                    }
                    if (global.tech['alumina'] >= 2 && global.city.power >= $(this)[0].powered()){
                        global.city['metal_refinery'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        mine: {
            id: 'city-mine',
            title: loc('city_mine'),
            desc: loc('city_mine_desc'),
            category: 'industrial',
            reqs: { mining: 2 },
            cost: { 
                Money(offset){ return costMultiplier('mine', offset, 60, 1.6); },
                Lumber(offset){ return costMultiplier('mine', offset, 175, 1.38); }
            },
            effect() { 
                if (global.tech['mine_conveyor']){
                    return `<div>${loc('city_mine_effect1')}</div><div>${loc('city_mine_effect2',[$(this)[0].powered(),5])}</div>`;
                }
                else {
                    return loc('city_mine_effect1');
                }
            },
            powered(){ return 1; },
            power_reqs: { mine_conveyor: 1 },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['mine'].count++;
                    global.resource.Copper.display = true;
                    global.civic.miner.display = true;
                    global.civic.miner.max = global.city.mine.count;
                    if (global.tech['mine_conveyor'] && global.city.power >= $(this)[0].powered()){
                        global.city['mine'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        coal_mine: {
            id: 'city-coal_mine',
            title: loc('city_coal_mine'),
            desc: loc('city_coal_mine_desc'),
            category: 'industrial',
            reqs: { mining: 4 },
            cost: { 
                Money(offset){ return costMultiplier('coal_mine', offset, 480, 1.4); },
                Lumber(offset){ return costMultiplier('coal_mine', offset, 250, 1.36); },
                Wrought_Iron(offset){ return costMultiplier('coal_mine', offset, 18, 1.36); }
            },
            effect() { 
                if (global.tech['mine_conveyor']){
                    return `<div>${loc('city_coal_mine_effect1')}</div><div>${loc('city_coal_mine_effect2',[$(this)[0].powered(),5])}</div>`;
                }
                else {
                    return loc('city_coal_mine_effect1');
                }
            },
            powered(){ return 1; },
            power_reqs: { mine_conveyor: 1 },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['coal_mine'].count++;
                    global.resource.Coal.display = true;
                    global.civic.coal_miner.display = true;
                    global.civic.coal_miner.max = global.city.coal_mine.count;
                    if (global.tech['mine_conveyor'] && global.city.power >= $(this)[0].powered()){
                        global.city['coal_mine'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        oil_well: {
            id: 'city-oil_well',
            title: loc('city_oil_well'),
            desc: loc('city_oil_well_desc'),
            category: 'industrial',
            reqs: { oil: 1 },
            cost: { 
                Money(offset){ return costMultiplier('oil_well', offset, 5000, 1.5); },
                Cement(offset){ return costMultiplier('oil_well', offset, 5250, 1.5); },
                Steel(offset){ return costMultiplier('oil_well', offset, 6000, 1.5); }
            },
            effect() { 
                let oil = global.tech['oil'] >= 4 ? 0.48 : 0.4;
                if (global.tech['oil'] >= 7){
                    oil *= 2;
                }
                else if (global.tech['oil'] >= 5){
                    oil *= global.tech['oil'] >= 6 ? 1.75 : 1.25;
                }
                if (global.city.geology['Oil']){
                    oil *= global.city.geology['Oil'] + 1;
                }
                oil = +oil.toFixed(2);
                let oc = spatialReasoning(500);
                return loc('city_oil_well_effect',[oil,oc]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('city_oil_depot'),
            desc: loc('city_oil_depot_desc'),
            category: 'trade',
            reqs: { oil: 2 },
            cost: { 
                Money(offset){ return costMultiplier('oil_depot', offset, 2500, 1.46); },
                Cement(offset){ return costMultiplier('oil_depot', offset, 3750, 1.46); },
                Sheet_Metal(offset){ return costMultiplier('oil_depot', offset, 100, 1.45); }
            },
            effect() { 
                let oil = spatialReasoning(1000);
                oil *= global.tech['world_control'] ? 1.5 : 1;
                let effect = `<div>${loc('plus_max_resource',[oil,loc('resource_Oil_name')])}.</div>`;
                if (global.resource['Helium_3'].display){
                    let val = spatialReasoning(400);
                    val *= global.tech['world_control'] ? 1.5 : 1;
                    effect = effect + `<div>${loc('plus_max_resource',[val,loc('resource_Helium_3_name')])}.</div>`;
                }
                if (global.tech['uranium'] >= 2){
                    let val = spatialReasoning(250);
                    val *= global.tech['world_control'] ? 1.5 : 1;
                    effect = effect + `<div>${loc('plus_max_resource',[val,loc('resource_Uranium_name')])}.</div>`;
                }
                return effect;
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('city_trade'),
            desc: loc('city_trade_desc'),
            category: 'trade',
            reqs: { trade: 1 },
            cost: { 
                Money(offset){ return costMultiplier('trade', offset, 500, 1.36); },
                Lumber(offset){ return costMultiplier('trade', offset, 125, 1.36); },
                Stone(offset){ return costMultiplier('trade', offset, 50, 1.36); },
                Furs(offset){ return costMultiplier('trade', offset, 65, 1.36); }
            },
            effect(){
                let routes = global.race['xenophobic'] ? global.tech.trade : global.tech.trade + 1;
                if (global.tech['trade'] && global.tech['trade'] >= 3){
                    routes--;
                }
                return loc('city_trade_effect',[routes]); 
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('city_wharf'),
            desc: loc('city_wharf_desc'),
            category: 'trade',
            reqs: { wharf: 1 },
            not_trait: ['thalassophobia'],
            cost: { 
                Money(offset){ return costMultiplier('wharf', offset, 62000, 1.32); },
                Lumber(offset){ return costMultiplier('wharf', offset, 44000, 1.32); },
                Cement(offset){ return costMultiplier('wharf', offset, 3000, 1.32); },
                Oil(offset){ return costMultiplier('wharf', offset, 750, 1.32); }
            },
            effect(){
                let routes = global.race['xenophobic'] ? 1 : 2;
                let containers = global.tech['world_control'] ? 15 : 10;
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    containers *= 2;
                }
                return `<div>${loc('city_trade_effect',[routes])}</div><div>${loc('city_wharf_effect')}</div><div>${loc('plus_max_crates',[containers])}</div><div>${loc('plus_max_containers',[containers])}</div>`; 
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('city_tourist_center'),
            desc: loc('city_tourist_center_desc'),
            category: 'commercial',
            reqs: { monument: 2 },
            cost: { 
                Money(offset){ return costMultiplier('tourist_center', offset, 100000, 1.36); },
                Stone(offset){ return costMultiplier('tourist_center', offset, 25000, 1.36); },
                Furs(offset){ return costMultiplier('tourist_center', offset, 7500, 1.36); },
                Plywood(offset){ return costMultiplier('tourist_center', offset, 5000, 1.36); },
            },
            effect(){
                return `<div>${loc('city_tourist_center_effect1',[global.resource.Food.name])}</div><div>${loc('city_tourist_center_effect2')}</div><div>${loc('city_tourist_center_effect3')}</div><div>${loc('city_tourist_center_effect4')}</div>`; 
            },
            powered(){ return 1; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['tourist_center'].count++;
                    global.city['tourist_center'].on++;
                    return true;
                }
                return false;
            }
        },
        amphitheatre: {
            id: 'city-amphitheatre',
            title: loc('city_amphitheatre'),
            desc: loc('city_amphitheatre_desc'),
            category: 'commercial',
            reqs: { theatre: 1 },
            not_trait: ['joyless'],
            cost: {
                Money(offset){ return costMultiplier('amphitheatre', offset, 500, 1.55); },
                Lumber(offset){ return costMultiplier('amphitheatre', offset, 50, 1.75); },
                Stone(offset){ return costMultiplier('amphitheatre', offset, 200, 1.75); }
            },
            effect: `<div>${loc('city_max_entertainer')}</div><div>${loc('city_max_morale')}</div>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['amphitheatre'].count++;
                    global.civic.entertainer.max++;
                    global.civic.entertainer.display = true;
                    return true;
                }
                return false;
            },
            flair: loc('city_amphitheatre_flair')
        },
        casino: {
            id: 'city-casino',
            title: loc('city_casino'),
            desc: loc('city_casino_desc'),
            category: 'commercial',
            reqs: { gambling: 1 },
            cost: {
                Money(offset){ return costMultiplier('casino', offset, 350000, 1.35); },
                Furs(offset){ return costMultiplier('casino', offset, 60000, 1.35); },
                Plywood(offset){ return costMultiplier('casino', offset, 10000, 1.35); },
                Brick(offset){ return costMultiplier('casino', offset, 6000, 1.35); }
            },
            effect(){
                let money = spatialReasoning(global.tech['gambling'] >= 3 ? 60000 : 40000);
                if (global.race['gambler']){
                    money *= 1 + (global.race['gambler'] * 0.04);
                }
                if (global.civic.govern.type === 'corpocracy'){
                    money *= 2;
                }
                if (global.tech['world_control']){
                    money = money * 1.25;
                }
                money = Math.round(money);
                money = '$'+money;
                let joy = global.race['joyless'] ? '' : `<div>${loc('city_max_entertainer')}</div>`;
                let desc = `<div>${loc('plus_max_resource',[money,loc('resource_Money_name')])}</div>${joy}<div>${loc('city_max_morale')}</div>`;
                if (global.tech['gambling'] >= 2){
                    let cash = (Math.log2(global.resource[global.race.species].amount) * (global.race['gambler'] ? 2.5 + (global.race['gambler'] / 10) : 2.5)).toFixed(2);
                    desc = desc + `<div>${loc('tech_casino_effect2',[$(this)[0].powered(),cash])}</div>`
                }
                return desc;
            },
            powered(){ return global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 2 ? 3 : 4; },
            power_reqs: { gambling: 2 },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['casino'].count++;
                    if (!global.race['joyless']){
                        global.civic.entertainer.max++;
                        global.civic.entertainer.display = true;
                    }
                    return true;
                }
                return false;
            },
            flair: loc('city_casino_flair')
        },
        temple: {
            id: 'city-temple',
            title: loc('city_temple'),
            desc(){
                let entity = races[global.race.gods.toLowerCase()].entity;
                return loc('city_temple_desc',[entity]);
            },
            category: 'commercial',
            reqs: { theology: 2 },
            cost: {
                Money(offset){ return costMultiplier('temple', offset, 50, 1.36); },
                Lumber(offset){ return costMultiplier('temple', offset, 25, 1.36); },
                Furs(offset){ return costMultiplier('temple', offset, 15, 1.36); },
                Cement(offset){ return costMultiplier('temple', offset, 10, 1.36); }
            },
            effect(){
                let desc;
                if (global.race.universe === 'antimatter'){
                    let faith = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 0.8 : 0.5;
                    if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                        faith += global.civic.professor.workers * 0.02;
                    }
                    if (global.race['spiritual']){
                        faith *= 1.13;
                    }
                    if (global.civic.govern.type === 'theocracy'){
                        faith *= 1.05;
                    }
                    faith = +(faith).toFixed(2);
                    desc = `<div>${loc('city_temple_effect1',[faith])}</div><div>${loc('city_temple_effect5',[6])}</div>`;
                }
                else if (global.race['no_plasmid']){
                    let faith = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 1.6 : 1;
                    if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                        faith += +(global.civic.professor.workers * 0.04).toFixed(2);
                    }
                    if (global.race['spiritual']){
                        faith *= 1.13;
                    }
                    if (global.civic.govern.type === 'theocracy'){
                        faith *= 1.05;
                    }
                    faith = +(faith).toFixed(2);
                    desc = `<div>${loc('city_temple_effect1',[faith])}</div>`;
                }
                else {
                    let plasmid = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 8 : 5;
                    if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                        plasmid += +(global.civic.professor.workers * 0.2).toFixed(1);
                    }
                    if (global.race['spiritual']){
                        plasmid *= 1.13;
                    }
                    if (global.civic.govern.type === 'theocracy'){
                        plasmid *= 1.05;
                    }
                    plasmid = +(plasmid).toFixed(2);
                    desc = `<div>${loc('city_temple_effect2',[plasmid])}</div>`;
                }
                if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 3){
                    desc = desc + `<div>${loc('city_temple_effect3')}</div>`;
                }
                if (global.tech['anthropology'] && global.tech['anthropology'] >= 4){
                    desc = desc + `<div>${loc('city_temple_effect4')}</div>`;
                }
                return desc;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['temple'].count++;
                    return true;
                }
                return false;
            }
        },
        shrine: {
            id: 'city-shrine',
            title: loc('city_shrine'),
            desc(){
                return loc('city_shrine_desc');
            },
            category: 'commercial',
            reqs: { theology: 2 },
            trait: ['magnificent'],
            cost: {
                Money(offset){ return costMultiplier('shrine', offset, 75, 1.32); },
                Stone(offset){ return costMultiplier('shrine', offset, 65, 1.32); },
                Furs(offset){ return costMultiplier('shrine', offset, 10, 1.32); },
                Copper(offset){ return costMultiplier('shrine', offset, 15, 1.32); }
            },
            effect(){
                let desc = `<div class="has-text-special">${loc('city_shrine_effect')}</div>`;
                if (global.city.shrine.morale > 0){
                    let morale = global.city.shrine.morale;
                    desc = desc + `<div>${loc('city_shrine_morale',[morale])}</div>`;
                }
                if (global.city.shrine.metal > 0){
                    let metal = global.city.shrine.metal;
                    desc = desc + `<div>${loc('city_shrine_metal',[metal])}</div>`;
                }
                if (global.city.shrine.know > 0){
                    let know = global.city.shrine.know * 500;
                    desc = desc + `<div>${loc('city_shrine_know',[know])}</div>`;
                }
                if (global.city.shrine.tax > 0){
                    let tax = global.city.shrine.tax;
                    desc = desc + `<div>${loc('city_shrine_tax',[tax])}</div>`;
                }
                return desc;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city.shrine.count++;
                    switch (Math.floor(Math.seededRandom(0,4))){
                        case 0:
                            global.city.shrine.morale++;
                            break;
                        case 1:
                            global.city.shrine.metal++;
                            break;
                        case 2:
                            global.city.shrine.know++;
                            break;
                        case 3:
                            global.city.shrine.tax++;
                            break;
                    }
                    return true;
                }
                return false;
            }
        },
        university: {
            id: 'city-university',
            title: loc('city_university'),
            desc(){
                let planet = races[global.race.species].home;
                return loc('city_university_desc',[planet]);
            },
            category: 'science',
            reqs: { science: 1 },
            cost: {
                Money(offset){ return costMultiplier('university', offset, 900, 1.5) - 500; },
                Lumber(offset){ return costMultiplier('university', offset, 500, 1.36) - 200; },
                Stone(offset){ return costMultiplier('university', offset, 750, 1.36) - 350; }
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
                if (global.portal['sensor_drone']){
                    multiplier += (p_on['sensor_drone'] * 0.02);
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
                return `<div>${loc('city_university_effect')}</div><div>${loc('city_max_knowledge',[gain])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('city_library'),
            desc(){
                let planet = races[global.race.species].home;
                return loc('city_library_desc',[planet]);
            },
            category: 'science',
            reqs: { science: 2 },
            cost: {
                Money(offset){ return costMultiplier('library', offset, 45, 1.2); },
                Furs(offset){ return costMultiplier('library', offset, 22, 1.20); },
                Plywood(offset){ return costMultiplier('library', offset, 20, 1.20); },
                Brick(offset){ return costMultiplier('library', offset, 15, 1.20); }
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
                return `<div>${loc('city_max_knowledge',[gain])}</div><div>${loc('city_library_effect',[global.race['autoignition'] ? 3 : 5])}</div>`; 
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
            title(){ return global.race['evil'] ? loc('city_babel_title') : loc('city_wardenclyffe'); },
            desc: loc('city_wardenclyffe_desc'),
            category: 'science',
            reqs: { high_tech: 1 },
            cost: { 
                Money(offset){ return costMultiplier('wardenclyffe', offset, 5000, 1.22); },
                Knowledge(offset){ return costMultiplier('wardenclyffe', offset, 1000, 1.22); },
                Copper(offset){ return costMultiplier('wardenclyffe', offset, 500, 1.22); },
                Cement(offset){ return costMultiplier('wardenclyffe', offset, 350, 1.22); },
                Sheet_Metal(offset){ return costMultiplier('wardenclyffe', offset, 125, 1.2); }
            },
            effect(){
                let gain = global.city.ptrait === 'magnetic' ? 1100 : 1000;
                if (global.tech['supercollider']){
                    let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                    gain *= (global.tech['supercollider'] / ratio) + 1;
                }
                if (global.space['satellite']){
                    gain *= 1 + (global.space.satellite.count * 0.04);
                }
                gain = +(gain).toFixed(1);
                let desc = `<div>${loc('city_wardenclyffe_effect1')}</div><div>${loc('city_max_knowledge',[gain])}</div>`;
                if (global.city.powered){
                    let pgain = global.tech['science'] >= 7 ? 2500 : 2000;
                    if (global.city.ptrait === 'magnetic'){
                        pgain += 100;
                    }
                    if (global.space['satellite']){
                        pgain *= 1 + (global.space.satellite.count * 0.04);
                    }
                    if (global.tech['supercollider']){
                        let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                        pgain *= (global.tech['supercollider'] / ratio) + 1;
                    }
                    pgain = +(pgain).toFixed(1);
                    if (global.tech.science >= 15){
                        desc = desc + `<div>${loc('city_wardenclyffe_effect4',[2])}</div>`;
                    }
                    if (global.tech['broadcast']){
                        let morale = global.tech['broadcast'];
                        desc = desc + `<div>${loc('city_wardenclyffe_effect3',[$(this)[0].powered(),pgain,morale])}</div>`
                    }
                    else {
                        desc = desc + `<div>${loc('city_wardenclyffe_effect2',[$(this)[0].powered(),pgain])}</div>`;
                    }
                }
                return desc;
            },
            powered(){ return 2; },
            action(){
                if (payCosts($(this)[0].cost)){
                    let gain = 1000;
                    global.city.wardenclyffe.count++;
                    global.civic.scientist.display = true;
                    global.civic.scientist.max = global.city.wardenclyffe.count;
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
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
            flair(){ return global.race['evil'] ? `<div>${loc('city_babel_flair')}</div>` : `<div>${loc('city_wardenclyffe_flair1')}</div><div>${loc('city_wardenclyffe_flair2')}</div>`; }
        },
        biolab: {
            id: 'city-biolab',
            title: loc('city_biolab'),
            desc: `<div>${loc('city_biolab_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            category: 'science',
            reqs: { genetics: 1 },
            cost: { 
                Money(offset){ return costMultiplier('biolab', offset, 25000, 1.3); },
                Knowledge(offset){ return costMultiplier('biolab', offset, 5000, 1.3); },
                Copper(offset){ return costMultiplier('biolab', offset, 1250, 1.3); },
                Alloy(offset){ return costMultiplier('biolab', offset, 350, 1.3); }
            },
            effect(){
                let gain = 3000;
                if (global.portal['sensor_drone']){
                    gain *= 1 + (p_on['sensor_drone'] * 0.02);
                    gain = +(gain).toFixed(0);
                }
                return `${loc('city_max_knowledge',[gain])}, -${$(this)[0].powered()}kW`;
            },
            powered(){ return 2; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city.biolab.count++;
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
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
            title(){
                return global.race['environmentalist'] ? loc('city_hydro_power') : loc('city_coal_power');
            },
            desc(){
                return global.race['environmentalist'] 
                    ? `<div>${loc('city_hydro_power_desc')}</div>`
                    : `<div>${loc('city_coal_power_desc')}</div><div class="has-text-special">${loc('requires_res',[loc('resource_Coal_name')])}</div>`;
            },
            category: 'utility',
            reqs: { high_tech: 2 },
            cost: { 
                Money(offset){ return costMultiplier('coal_power', offset, 10000, 1.22); },
                Copper(offset){ return costMultiplier('coal_power', offset, 1800, 1.22) - 1000; },
                Cement(offset){ return costMultiplier('coal_power', offset, 600, 1.22); },
                Steel(offset){ return costMultiplier('coal_power', offset, 2000, 1.22) - 1000; }
            },
            effect(){
                let consume = 0.35;
                let power = -($(this)[0].powered());
                return global.race['environmentalist'] ? `+${power}kW` : `+${power}kW. ${loc('city_coal_power_effect',[consume])}`;
            },
            powered(){
                return global.race['environmentalist']
                    ? powerModifier(global.stats.achieve['dissipated'] ? -5 : -4)
                    : powerModifier(global.stats.achieve['dissipated'] ? -6 : -5);
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
            title(){
                return global.race['environmentalist'] ? loc('city_wind_power') : loc('city_oil_power');
            },
            desc(){
                return global.race['environmentalist'] 
                    ? `<div>${loc('city_wind_power_desc')}</div>`
                    : `<div>${loc('city_oil_power_desc')}</div><div class="has-text-special">${loc('requires_res',[loc('resource_Oil_name')])}</div>`
            },
            category: 'utility',
            reqs: { oil: 3 },
            cost: { 
                Money(offset){ return costMultiplier('oil_power', offset, 50000, 1.22); },
                Copper(offset){ return costMultiplier('oil_power', offset, 6500, 1.22) + 1000; },
                Aluminium(offset){ return costMultiplier('oil_power', offset, 12000, 1.22); },
                Cement(offset){ return costMultiplier('oil_power', offset, 5600, 1.22) + 1000; }
            },
            effect(){
                let consume = 0.65;
                let power = -($(this)[0].powered());
                return global.race['environmentalist'] ? `+${power}kW` : `+${power}kW. ${loc('city_oil_power_effect',[consume])}`;
            },
            powered(){
                if (global.race['environmentalist']){
                    if (global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 3){
                        let base = global.city.calendar.wind === 1 ? -7 : -5;
                        return powerModifier(global.stats.achieve['dissipated'].l >= 5 ? (base - 2) : (base - 1));
                    }
                    else {
                        return powerModifier(global.city.calendar.wind === 1 ? -7 : -5);
                    }
                }
                else {
                    if (global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 3){
                        return powerModifier(global.stats.achieve['dissipated'].l >= 5 ? -8 : -7);
                    }
                    else {
                        return powerModifier(-6);
                    }
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('city_fission_power'),
            desc: `<div>${loc('city_fission_power_desc')}</div><div class="has-text-special">${loc('requires_res',[loc('resource_Uranium_name')])}</div>`,
            category: 'utility',
            reqs: { high_tech: 5 },
            cost: { 
                Money(offset){ return costMultiplier('fission_power', offset, 250000, 1.36); },
                Copper(offset){ return costMultiplier('fission_power', offset, 13500, 1.36); },
                Cement(offset){ return costMultiplier('fission_power', offset, 10800, 1.36); },
                Titanium(offset){ return costMultiplier('fission_power', offset, 7500, 1.36); }
            },
            effect(){
                let consume = 0.1;
                return `+${-($(this)[0].powered())}kW. ${loc('city_fission_power_effect',[consume])}`;
            },
            powered(){ return powerModifier(global.tech['uranium'] >= 4 ? -18 : -14); },
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('city_mass_driver'),
            desc: `<div>${loc('city_mass_driver_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            category: 'utility',
            reqs: { mass: 1 },
            cost: { 
                Money(offset){ return costMultiplier('mass_driver', offset, 375000, 1.32); },
                Copper(offset){ return costMultiplier('mass_driver', offset, 33000, 1.32); },
                Iron(offset){ return costMultiplier('mass_driver', offset, 42500, 1.32); },
                Iridium(offset){ return costMultiplier('mass_driver', offset, 2200, 1.32); }
            },
            effect(){
                return loc('city_mass_driver_effect',[5,$(this)[0].powered(),races[global.race.species].name]);
            },
            powered(){ return global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 4 ? 4 : 5; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city.mass_driver.count++;
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
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
            title: loc('tech_club'),
            desc: loc('tech_club_desc'),
            category: 'research',
            reqs: {},
            grant: ['primitive',1],
            cost: {
                Lumber(){ return global.race['kindling_kindred'] ? 0 : 5; },
                Stone(){ return global.race['kindling_kindred'] ? 5 : 0; }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Food.display = true;
                    return true;
                }
                return false;
            }
        },
        bone_tools: {
            id: 'tech-bone_tools',
            title: loc('tech_bone_tools'),
            desc: loc('tech_bone_tools_desc'),
            category: 'research',
            reqs: { primitive: 1 },
            grant: ['primitive',2],
            condition(){
                return global.race.species === 'wendigo' ? false : true; 
            },
            cost: {
                Food(){ return global.race['evil'] ? 0 : 10; },
                Lumber(){ return global.race['evil'] ? 10 : 0; },
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Stone.display = true;
                    return true;
                }
                return false;
            }
        },
        wooden_tools: {
            id: 'tech-wooden_tools',
            title() {
                return global.race['evil'] ? loc('tech_bone_tools') : loc('tech_wooden_tools');
            },
            desc() {
                return global.race['evil'] ? loc('tech_bone_tools_desc') : loc('tech_wooden_tools_desc');
            },
            category: 'research',
            reqs: { primitive: 1 },
            grant: ['primitive',2],
            condition(){
                return global.race.species === 'wendigo' ? true : false; 
            },
            cost: {
                Lumber(){ return 10; },
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Stone.display = true;
                    return true;
                }
                return false;
            }
        },
        sundial: {
            id: 'tech-sundial',
            title: loc('tech_sundial'),
            desc: loc('tech_sundial_desc'),
            category: 'research',
            reqs: { primitive: 2 },
            grant: ['primitive',3],
            cost: {
                Lumber(){ return 8; },
                Stone(){ return 10; }
            },
            effect: loc('tech_sundial_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('tech_sundial_msg'),'success');
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
            title: loc('tech_housing'),
            desc: loc('tech_housing_desc'),
            category: 'research',
            reqs: { primitive: 3 },
            grant: ['housing',1],
            cost: { 
                Knowledge(){ return 10; }
            },
            effect: loc('tech_housing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['basic_housing'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        cottage: {
            id: 'tech-cottage',
            title(){
                return housingLabel('medium');
            },
            desc: loc('tech_cottage_desc'),
            category: 'research',
            reqs: { housing: 1, cement: 1, mining: 3 },
            grant: ['housing',2],
            cost: { 
                Knowledge(){ return 3600; }
            },
            effect: loc('tech_cottage_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['cottage'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        apartment: {
            id: 'tech-apartment',
            title(){
                return housingLabel('large');
            },
            desc(){
                return housingLabel('large');
            },
            category: 'research',
            reqs: { housing: 2, high_tech: 2 },
            grant: ['housing',3],
            cost: { 
                Knowledge(){ return 15750; }
            },
            effect: loc('tech_apartment_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_steel_beams'),
            desc: loc('tech_housing_cost'),
            category: 'upgrade',
            reqs: { housing: 2, smelting: 2 },
            grant: ['housing_reduction',1],
            cost: { 
                Knowledge(){ return 11250; },
                Steel(){ return 2500; }
            },
            effect(){
                let label = housingLabel('small');
                let cLabel = housingLabel('medium');
                return loc('tech_steel_beams_effect',[label,cLabel]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mythril_beams: {
            id: 'tech-mythril_beams',
            title: loc('tech_mythril_beams'),
            desc: loc('tech_housing_cost'),
            category: 'upgrade',
            reqs: { housing_reduction: 1, space: 3 },
            grant: ['housing_reduction',2],
            cost: { 
                Knowledge(){ return 175000; },
                Mythril(){ return 1000; }
            },
            effect(){
                let label = housingLabel('small');
                let cLabel = housingLabel('medium');
                return loc('tech_mythril_beams_effect',[label,cLabel]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        neutronium_walls: {
            id: 'tech-neutronium_walls',
            title: loc('tech_neutronium_walls'),
            desc: loc('tech_housing_cost'),
            category: 'upgrade',
            reqs: { housing_reduction: 2, gas_moon: 1 },
            grant: ['housing_reduction',3],
            cost: { 
                Knowledge(){ return 300000; },
                Neutronium(){ return 850; }
            },
            effect(){
                let label = housingLabel('small');
                let cLabel = housingLabel('medium');
                return loc('tech_neutronium_walls_effect',[label,cLabel]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        aphrodisiac: {
            id: 'tech-aphrodisiac',
            title: loc('tech_aphrodisiac'),
            desc: loc('tech_aphrodisiac_desc'),
            category: 'upgrade',
            reqs: { housing: 2 },
            grant: ['reproduction',1],
            cost: { 
                Knowledge(){ return 4500; }
            },
            effect: loc('tech_aphrodisiac_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        smokehouse: {
            id: 'tech-smokehouse',
            title: loc('tech_smokehouse'),
            desc: loc('tech_smokehouse_desc'),
            category: 'research',
            reqs: { primitive: 3, storage: 1 },
            trait: ['carnivore'],
            grant: ['hunting',1],
            cost: { 
                Knowledge(){ return 80; }
            },
            effect: loc('tech_smokehouse_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['smokehouse'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        lodge: {
            id: 'tech-lodge',
            title: loc('tech_lodge'),
            desc: loc('tech_lodge'),
            category: 'research',
            reqs: { hunting: 1, housing: 1, currency: 1 },
            grant: ['hunting',2],
            not_trait: ['soul_eater'],
            cost: {
                Knowledge(){ return 180; }
            },
            effect: loc('tech_lodge_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['lodge'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        soul_lodge: {
            id: 'tech-soul_lodge',
            title: loc('tech_lodge'),
            desc: loc('tech_lodge'),
            category: 'research',
            reqs: { housing: 1, currency: 1 },
            trait: ['soul_eater'],
            grant: ['s_lodge',1],
            condition(){
                return global.race.species === 'wendigo' ? true : false; 
            },
            cost: {
                Knowledge(){ return 180; }
            },
            effect: loc('tech_lodge_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['lodge'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        soul_well: {
            id: 'tech-soul_well',
            title: loc('tech_soul_well'),
            desc: loc('tech_soul_well'),
            category: 'research',
            reqs: { primitive: 3 },
            trait: ['soul_eater'],
            grant: ['soul_eater',1],
            cost: { 
                Knowledge(){ return 10; }
            },
            effect: loc('tech_soul_well_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['soul_well'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        agriculture: {
            id: 'tech-agriculture',
            title: loc('tech_agriculture'),
            desc: loc('tech_agriculture_desc'),
            category: 'research',
            reqs: { primitive: 3 },
            not_trait: ['carnivore','soul_eater'],
            grant: ['agriculture',1],
            cost: { 
                Knowledge(){ return 10; }
            },
            effect: loc('tech_agriculture_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['farm'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        farm_house: {
            id: 'tech-farm_house',
            title: loc('tech_farm_house'),
            desc: loc('tech_farm_house_desc'),
            category: 'upgrade',
            reqs: { agriculture: 1, housing: 1, currency: 1 },
            grant: ['farm',1],
            cost: {
                Money(){ return 50; },
                Knowledge(){ return 180; }
            },
            effect: loc('tech_farm_house_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        irrigation: {
            id: 'tech-irrigation',
            title: loc('tech_irrigation'),
            desc: loc('tech_irrigation_desc'),
            category: 'upgrade',
            reqs: { agriculture: 1 },
            grant: ['agriculture',2],
            cost: { 
                Knowledge(){ return 55; }
            },
            effect: loc('tech_irrigation_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        silo: {
            id: 'tech-silo',
            title: loc('tech_silo'),
            desc: loc('tech_silo_desc'),
            category: 'research',
            reqs: { agriculture: 2, storage: 1 },
            grant: ['agriculture',3],
            cost: { 
                Knowledge(){ return 80; }
            },
            effect: loc('tech_silo_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['silo'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        mill: {
            id: 'tech-mill',
            title: loc('tech_mill'),
            desc: loc('tech_mill_desc'),
            category: 'research',
            reqs: { agriculture: 3, mining: 3 },
            grant: ['agriculture',4],
            cost: { 
                Knowledge(){ return 5400; }
            },
            effect: loc('tech_mill_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_windmill'),
            desc: loc('tech_windmill_desc'),
            category: 'upgrade',
            reqs: { agriculture: 4, high_tech: 1 },
            grant: ['agriculture',5],
            cost: { 
                Knowledge(){ return 16200; }
            },
            effect: loc('tech_windmill_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        windturbine: {
            id: 'tech-windturbine',
            title: loc('tech_windturbine'),
            desc: loc('tech_windturbine'),
            category: 'research',
            reqs: { agriculture: 5, high_tech: 4 },
            grant: ['agriculture',6],
            cost: { 
                Knowledge(){ return 66000; }
            },
            effect: loc('tech_windturbine_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        wind_plant: {
            id: 'tech-wind_plant',
            title: loc('tech_windmill'),
            desc: loc('tech_windmill'),
            category: 'research',
            reqs: { hunting: 2, high_tech: 4 },
            grant: ['wind_plant',1],
            not_trait: ['soul_eater'],
            cost: { 
                Knowledge(){ return 66000; }
            },
            effect: loc('tech_wind_plant_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['windmill'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        evil_wind_plant: {
            id: 'tech-evil_wind_plant',
            title: loc('tech_windmill'),
            desc: loc('tech_windmill'),
            category: 'upgrade',
            reqs: { high_tech: 4 },
            grant: ['wind_plant',1],
            trait: ['soul_eater'],
            cost: { 
                Knowledge(){ return 66000; }
            },
            effect: loc('tech_wind_plant_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['windmill'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        gmfood: {
            id: 'tech-gmfood',
            title: loc('tech_gmfood'),
            desc: loc('tech_gmfood_desc'),
            category: 'upgrade',
            reqs: { agriculture: 6, genetics: 1 },
            grant: ['agriculture',7],
            cost: { 
                Knowledge(){ return 95000; }
            },
            effect: loc('tech_gmfood_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        foundry: {
            id: 'tech-foundry',
            title: loc('tech_foundry'),
            desc: loc('tech_foundry'),
            category: 'research',
            reqs: { mining: 2 },
            grant: ['foundry',1],
            cost: {
                Knowledge(){ return 650; }
            },
            effect: loc('tech_foundry_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['foundry'] = {
                        count: 0,
                        crafting: 0,
                        Plywood: 0,
                        Brick: 0,
                        Bronze: 0,
                        Wrought_Iron: 0,
                        Sheet_Metal: 0,
                        Mythril: 0,
                        Aerogel: 0
                    };
                    return true;
                }
                return false;
            }
        },
        artisans: {
            id: 'tech-artisans',
            title: loc('tech_artisans'),
            desc: loc('tech_artisans'),
            category: 'upgrade',
            reqs: { foundry: 1 },
            grant: ['foundry',2],
            cost: {
                Knowledge(){ return 1500; }
            },
            effect: loc('tech_artisans_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        apprentices: {
            id: 'tech-apprentices',
            title: loc('tech_apprentices'),
            desc: loc('tech_apprentices'),
            category: 'upgrade',
            reqs: { foundry: 2 },
            grant: ['foundry',3],
            cost: {
                Knowledge(){ return 3200; }
            },
            effect: loc('tech_apprentices_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        carpentry: {
            id: 'tech-carpentry',
            title: loc('tech_carpentry'),
            desc: loc('tech_carpentry'),
            category: 'upgrade',
            reqs: { foundry: 3, saw: 1 },
            grant: ['foundry',4],
            not_trait: ['evil'],
            cost: {
                Knowledge(){ return 5200; }
            },
            effect: loc('tech_carpentry_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        demonic_craftsman: {
            id: 'tech-demonic_craftsman',
            title: loc('tech_master_craftsman'),
            desc: loc('tech_master_craftsman'),
            category: 'upgrade',
            reqs: { foundry: 3 },
            grant: ['foundry',5],
            trait: ['evil'],
            cost: {
                Knowledge(){ return 12000; }
            },
            effect: loc('tech_master_craftsman_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        master_craftsman: {
            id: 'tech-master_craftsman',
            title: loc('tech_master_craftsman'),
            desc: loc('tech_master_craftsman'),
            category: 'upgrade',
            reqs: { foundry: 4 },
            grant: ['foundry',5],
            not_trait: ['evil'],
            cost: {
                Knowledge(){ return 12000; }
            },
            effect: loc('tech_master_craftsman_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        brickworks: {
            id: 'tech-brickworks',
            title: loc('tech_brickworks'),
            desc: loc('tech_brickworks'),
            category: 'upgrade',
            reqs: { foundry: 5 },
            grant: ['foundry',6],
            cost: {
                Knowledge(){ return 18500; }
            },
            effect: loc('tech_brickworks_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        machinery: {
            id: 'tech-machinery',
            title: loc('tech_machinery'),
            desc: loc('tech_machinery'),
            category: 'upgrade',
            reqs: { foundry: 6, high_tech: 4 },
            grant: ['foundry',7],
            cost: {
                Knowledge(){ return 66000; }
            },
            effect: loc('tech_machinery_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        cnc_machine: {
            id: 'tech-cnc_machine',
            title: loc('tech_cnc_machine'),
            desc: loc('tech_cnc_machine'),
            category: 'upgrade',
            reqs: { foundry: 7, high_tech: 8 },
            grant: ['foundry',8],
            cost: {
                Knowledge(){ return 132000; }
            },
            effect: loc('tech_cnc_machine_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        vocational_training: {
            id: 'tech-vocational_training',
            title: loc('tech_vocational_training'),
            desc: loc('tech_vocational_training'),
            category: 'upgrade',
            reqs: { foundry: 1, high_tech: 3 },
            grant: ['v_train',1],
            cost: {
                Knowledge(){ return 30000; }
            },
            effect: loc('tech_vocational_training_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        assembly_line: {
            id: 'tech-assembly_line',
            title: loc('tech_assembly_line'),
            desc: loc('tech_assembly_line'),
            category: 'upgrade',
            reqs: { high_tech: 4 },
            grant: ['factory',1],
            cost: {
                Knowledge(){ return 72000; },
                Copper(){ return 125000; }
            },
            effect: `<span>${loc('tech_assembly_line_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        automation: {
            id: 'tech-automation',
            title: loc('tech_automation'),
            desc: loc('tech_automation'),
            category: 'upgrade',
            reqs: { high_tech: 8, factory: 1},
            grant: ['factory',2],
            cost: {
                Knowledge(){ return 165000; }
            },
            effect: `<span>${loc('tech_automation_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        laser_cutters: {
            id: 'tech-laser_cutters',
            title: loc('tech_laser_cutters'),
            desc: loc('tech_laser_cutters'),
            category: 'upgrade',
            reqs: { high_tech: 9, factory: 2 },
            grant: ['factory',3],
            cost: {
                Knowledge(){ return 300000; },
                Elerium(){ return 200; }
            },
            effect: `<span>${loc('tech_laser_cutters_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        theatre: {
            id: 'tech-theatre',
            title: loc('tech_theatre'),
            desc: loc('tech_theatre'),
            category: 'research',
            reqs: { housing: 1, currency: 1, cement: 1 },
            grant: ['theatre',1],
            not_trait: ['joyless'],
            cost: {
                Knowledge(){ return 750; }
            },
            effect: loc('tech_theatre_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['amphitheatre'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        playwright: {
            id: 'tech-playwright',
            title: loc('tech_playwright'),
            desc: loc('tech_playwright'),
            category: 'upgrade',
            reqs: { theatre: 1, science: 2 },
            grant: ['theatre',2],
            cost: {
                Knowledge(){ return 1080; }
            },
            effect: loc('tech_playwright_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        magic: {
            id: 'tech-magic',
            title: loc('tech_magic'),
            desc: loc('tech_magic'),
            category: 'upgrade',
            reqs: { theatre: 2, high_tech: 1 },
            grant: ['theatre',3],
            cost: {
                Knowledge(){ return 7920; }
            },
            effect: loc('tech_magic_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        superstars: {
            id: 'tech-superstars',
            title: loc('tech_superstars'),
            desc: loc('tech_superstars'),
            category: 'upgrade',
            reqs: { theatre: 3, high_tech: 12 },
            grant: ['superstar',1],
            cost: {
                Knowledge(){ return 660000; }
            },
            effect: loc('tech_superstars_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        radio: {
            id: 'tech-radio',
            title: loc('tech_radio'),
            desc: loc('tech_radio'),
            category: 'upgrade',
            reqs: { theatre: 3, high_tech: 2 },
            grant: ['broadcast',1],
            cost: {
                Knowledge(){ return 16200; }
            },
            effect(){ return loc('tech_radio_effect',[global.race['evil'] ? loc('city_babel') : loc('city_wardenclyffe')]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        tv: {
            id: 'tech-tv',
            title: loc('tech_tv'),
            desc: loc('tech_tv'),
            category: 'upgrade',
            reqs: { broadcast: 1, high_tech: 4 },
            grant: ['broadcast',2],
            cost: {
                Knowledge(){ return 67500; }
            },
            effect(){ return loc('tech_tv_effect',[global.race['evil'] ? loc('city_babel') : loc('city_wardenclyffe')]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        vr_center: {
            id: 'tech-vr_center',
            title: loc('tech_vr_center'),
            desc: loc('tech_vr_center'),
            category: 'research',
            reqs: { broadcast: 2, high_tech: 12, stanene: 1 },
            grant: ['broadcast',3],
            cost: {
                Knowledge(){ return 620000; }
            },
            effect(){ return loc('tech_vr_center_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['vr_center'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        casino: {
            id: 'tech-casino',
            title: loc('tech_casino'),
            desc: loc('tech_casino'),
            category: 'research',
            reqs: { high_tech: 4, currency: 5 },
            grant: ['gambling',1],
            cost: {
                Knowledge(){ return 95000; }
            },
            effect: loc('tech_casino_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['casino'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        dazzle: {
            id: 'tech-dazzle',
            title: loc('tech_dazzle'),
            desc: loc('tech_dazzle'),
            category: 'upgrade',
            reqs: { gambling: 1 },
            grant: ['gambling',2],
            cost: {
                Knowledge(){ return 125000; }
            },
            effect: loc('tech_dazzle_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        casino_vault: {
            id: 'tech-casino_vault',
            title: loc('tech_casino_vault'),
            desc: loc('tech_casino_vault'),
            category: 'upgrade',
            reqs: { gambling: 2, space: 3 },
            grant: ['gambling',3],
            cost: {
                Knowledge(){ return 145000; },
                Iridium(){ return 2500; }
            },
            effect: loc('tech_casino_vault_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mining: {
            id: 'tech-mining',
            title: loc('tech_mining'),
            desc: loc('tech_mining_desc'),
            category: 'research',
            reqs: { primitive: 3 },
            grant: ['mining',1],
            cost: { 
                Knowledge(){ return 45; }
            },
            effect: loc('tech_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['rock_quarry'] = { 
                        count: 0, 
                        on: 0 
                    };
                    if (global.race['cannibalize']){
                        global.city['s_alter'] = {
                            count: 0,
                            rage: 0,
                            mind: 0,
                            regen: 0,
                            mine: 0,
                            harvest: 0,
                        };
                    }
                    return true;
                }
                return false;
            }
        },
        bayer_process: {
            id: 'tech-bayer_process',
            title: loc('tech_bayer_process'),
            desc: loc('tech_bayer_process_desc'),
            category: 'research',
            reqs: { smelting: 2 },
            grant: ['alumina',1],
            cost: { 
                Knowledge(){ return 4500; }
            },
            effect: loc('tech_bayer_process_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['metal_refinery'] = { count: 0, on: 0 };
                    global.resource.Sheet_Metal.display = true;
                    loadFoundry();
                    return true;
                }
                return false;
            }
        },
        elysis_process: {
            id: 'tech-elysis_process',
            title: loc('tech_elysis_process'),
            desc: loc('tech_elysis_process'),
            category: 'upgrade',
            reqs: { alumina: 1, stanene: 1, graphene: 1 },
            grant: ['alumina',2],
            cost: { 
                Knowledge(){ return 675000; },
                Graphene(){ return 45000; },
                Stanene(){ return 75000; },
            },
            effect: loc('tech_elysis_process_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        smelting: {
            id: 'tech-smelting',
            title: loc('tech_smelting'),
            desc: loc('tech_smelting_desc'),
            category: 'research',
            reqs: { mining: 3 },
            grant: ['smelting',1],
            cost: { 
                Knowledge(){ return 4050; }
            },
            effect: loc('tech_smelting_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_steel'),
            desc: loc('tech_steel_desc'),
            category: 'research',
            reqs: { smelting: 1, mining: 4 },
            grant: ['smelting',2],
            cost: { 
                Knowledge(){ return 4950; },
                Steel(){ return 25; }
            },
            effect: loc('tech_steel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.resource.Steel.display = true;
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        blast_furnace: {
            id: 'tech-blast_furnace',
            title: loc('tech_blast_furnace'),
            desc: loc('tech_blast_furnace'),
            category: 'upgrade',
            reqs: { smelting: 2 },
            grant: ['smelting',3],
            cost: { 
                Knowledge(){ return 13500; },
                Coal(){ return 2000; }
            },
            effect: loc('tech_blast_furnace_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        bessemer_process: {
            id: 'tech-bessemer_process',
            title: loc('tech_bessemer_process'),
            desc: loc('tech_bessemer_process'),
            category: 'upgrade',
            reqs: { smelting: 3 },
            grant: ['smelting',4],
            cost: { 
                Knowledge(){ return 19800; },
                Coal(){ return 5000; }
            },
            effect: loc('tech_bessemer_process_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        oxygen_converter: {
            id: 'tech-oxygen_converter',
            title: loc('tech_oxygen_converter'),
            desc: loc('tech_oxygen_converter'),
            category: 'upgrade',
            reqs: { smelting: 4, high_tech: 3 },
            grant: ['smelting',5],
            cost: { 
                Knowledge(){ return 46800; },
                Coal(){ return 10000; }
            },
            effect: loc('tech_oxygen_converter_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        electric_arc_furnace: {
            id: 'tech-electric_arc_furnace',
            title: loc('tech_electric_arc_furnace'),
            desc: loc('tech_electric_arc_furnace'),
            category: 'upgrade',
            reqs: { smelting: 5, high_tech: 4 },
            grant: ['smelting',6],
            cost: { 
                Knowledge(){ return 85500; },
                Copper(){ return 25000; }
            },
            effect: loc('tech_electric_arc_furnace_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        hellfire_furnace: {
            id: 'tech-hellfire_furnace',
            title: loc('tech_hellfire_furnace'),
            desc: loc('tech_hellfire_furnace'),
            category: 'upgrade',
            reqs: { smelting: 6, infernite: 1 },
            grant: ['smelting',7],
            cost: { 
                Knowledge(){ return 615000; },
                Infernite(){ return 2000; },
                Soul_Gem(){ return 2; }
            },
            effect: loc('tech_hellfire_furnace_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        rotary_kiln: {
            id: 'tech-rotary_kiln',
            title: loc('tech_rotary_kiln'),
            desc: loc('tech_rotary_kiln'),
            category: 'upgrade',
            reqs: { smelting: 3, high_tech: 3 },
            grant: ['copper',1],
            cost: { 
                Knowledge(){ return 57600; },
                Coal(){ return 8000; }
            },
            effect: loc('tech_rotary_kiln_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        metal_working: {
            id: 'tech-metal_working',
            title: loc('tech_metal_working'),
            desc: loc('tech_metal_working_desc'),
            category: 'research',
            reqs: { mining: 1 },
            grant: ['mining',2],
            cost: { 
                Knowledge(){ return 350; }
            },
            effect: loc('tech_metal_working_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_iron_mining'),
            desc: loc('tech_iron_mining_desc'),
            category: 'research',
            reqs: { mining: 2 },
            grant: ['mining',3],
            cost: { 
                Knowledge(){ return 2500; }
            },
            effect: loc('tech_iron_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_coal_mining'),
            desc: loc('tech_coal_mining_desc'),
            category: 'research',
            reqs: { mining: 3 },
            grant: ['mining',4],
            cost: {
                Knowledge(){ return 4320; }
            },
            effect: loc('tech_coal_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_storage'),
            desc: loc('tech_storage_desc'),
            category: 'research',
            reqs: { primitive: 3, currency: 1 },
            grant: ['storage',1],
            cost: { 
                Knowledge(){ return 20; }
            },
            effect: loc('tech_storage_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['shed'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        reinforced_shed: {
            id: 'tech-reinforced_shed',
            title: loc('tech_reinforced_shed'),
            desc: loc('tech_reinforced_shed_desc'),
            category: 'upgrade',
            reqs: { storage: 1, cement: 1 },
            grant: ['storage',2],
            cost: {
                Money(){ return 3750; },
                Knowledge(){ return 2250; },
                Iron(){ return 750; },
                Cement(){ return 500; }
            },
            effect: loc('tech_reinforced_shed_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        barns: {
            id: 'tech-barns',
            title: loc('tech_barns'),
            desc: loc('tech_barns_desc'),
            category: 'upgrade',
            reqs: { storage: 2, smelting: 2, alumina: 1 },
            grant: ['storage',3],
            cost: {
                Knowledge(){ return 15750; },
                Aluminium(){ return 3000; },
                Steel(){ return 3000; }
            },
            effect: loc('tech_barns_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        warehouse: {
            id: 'tech-warehouse',
            title: loc('tech_warehouse'),
            desc: loc('tech_warehouse_desc'),
            category: 'upgrade',
            reqs: { storage: 3, high_tech: 3, smelting: 2 },
            grant: ['storage',4],
            cost: {
                Knowledge(){ return 40500; },
                Titanium(){ return 3000; }
            },
            effect: loc('tech_warehouse_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        cameras: {
            id: 'tech-cameras',
            title: loc('tech_cameras'),
            desc: loc('tech_cameras_desc'),
            category: 'upgrade',
            reqs: { storage: 4, high_tech: 4 },
            grant: ['storage',5],
            cost: {
                Money(){ return 90000; },
                Knowledge(){ return 65000; }
            },
            effect: loc('tech_cameras_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        pocket_dimensions: {
            id: 'tech-pocket_dimensions',
            title: loc('tech_pocket_dimensions'),
            desc: loc('tech_pocket_dimensions_desc'),
            category: 'upgrade',
            reqs: { particles: 1, storage: 5 },
            grant: ['storage',6],
            cost: {
                Knowledge(){ return 108000; }
            },
            effect: loc('tech_pocket_dimensions_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        ai_logistics: {
            id: 'tech-ai_logistics',
            title: loc('tech_ai_logistics'),
            desc: loc('tech_ai_logistics'),
            category: 'upgrade',
            reqs: { storage: 6, proxima: 2, science: 13 },
            grant: ['storage',7],
            cost: {
                Knowledge(){ return 650000; }
            },
            effect: loc('tech_ai_logistics_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        containerization: {
            id: 'tech-containerization',
            title: loc('tech_containerization'),
            desc: loc('tech_containerization_desc'),
            category: 'research',
            reqs: { cement: 1 },
            grant: ['container',1],
            cost: {
                Knowledge(){ return 2700; }
            },
            effect: loc('tech_containerization_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['storage_yard'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        reinforced_crates: {
            id: 'tech-reinforced_crates',
            title: loc('tech_reinforced_crates'),
            desc: loc('tech_reinforced_crates'),
            category: 'upgrade',
            reqs: { container: 1, smelting: 2 },
            grant: ['container',2],
            cost: {
                Knowledge(){ return 6750; },
                Sheet_Metal(){ return 100; }
            },
            effect: loc('tech_reinforced_crates_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        cranes: {
            id: 'tech-cranes',
            title: loc('tech_cranes'),
            desc: loc('tech_cranes_desc'),
            category: 'upgrade',
            reqs: { container: 2, high_tech: 2 },
            grant: ['container',3],
            cost: {
                Knowledge(){ return 18000; },
                Copper(){ return 1000; },
                Steel(){ return 2500; }
            },
            effect: loc('tech_cranes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_crates: {
            id: 'tech-titanium_crates',
            title: loc('tech_titanium_crates'),
            desc: loc('tech_titanium_crates'),
            category: 'upgrade',
            reqs: { container: 3, titanium: 1 },
            grant: ['container',4],
            cost: {
                Knowledge(){ return 67500; },
                Titanium(){ return 1000; }
            },
            effect: loc('tech_titanium_crates_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mythril_crates: {
            id: 'tech-mythril_crates',
            title: loc('tech_mythril_crates'),
            desc: loc('tech_mythril_crates'),
            category: 'upgrade',
            reqs: { container: 4, space: 3 },
            grant: ['container',5],
            cost: {
                Knowledge(){ return 145000; },
                Mythril(){ return 350; }
            },
            effect: loc('tech_mythril_crates_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        infernite_crates: {
            id: 'tech-infernite_crates',
            title: loc('tech_infernite_crates'),
            desc: loc('tech_infernite_crates_desc'),
            category: 'upgrade',
            reqs: { container: 5, infernite: 1 },
            grant: ['container',6],
            cost: {
                Knowledge(){ return 575000; },
                Infernite(){ return 1000; }
            },
            effect: loc('tech_infernite_crates_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        graphene_crates: {
            id: 'tech-graphene_crates',
            title: loc('tech_graphene_crates'),
            desc: loc('tech_graphene_crates'),
            category: 'upgrade',
            reqs: { container: 6, graphene: 1 },
            grant: ['container',7],
            cost: {
                Knowledge(){ return 725000; },
                Graphene(){ return 75000; }
            },
            effect: loc('tech_graphene_crates_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_containers: {
            id: 'tech-steel_containers',
            title: loc('tech_steel_containers'),
            desc: loc('tech_steel_containers_desc'),
            category: 'research',
            reqs: { smelting: 2, container: 1 },
            grant: ['steel_container',1],
            cost: {
                Knowledge(){ return 9000; },
                Steel(){ return 250; }
            },
            effect: loc('tech_steel_containers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['warehouse'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        gantry_crane: {
            id: 'tech-gantry_crane',
            title: loc('tech_gantry_crane'),
            desc: loc('tech_gantry_crane_desc'),
            category: 'upgrade',
            reqs: { steel_container: 1, high_tech: 2 },
            grant: ['steel_container',2],
            cost: {
                Knowledge(){ return 22500; },
                Steel(){ return 5000; }
            },
            effect: loc('tech_gantry_crane_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        alloy_containers: {
            id: 'tech-alloy_containers',
            title: loc('tech_alloy_containers'),
            desc: loc('tech_alloy_containers_desc'),
            category: 'upgrade',
            reqs: { steel_container: 2, storage: 4 },
            grant: ['steel_container',3],
            cost: {
                Knowledge(){ return 49500; },
                Alloy(){ return 2500; }
            },
            effect: loc('tech_alloy_containers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mythril_containers: {
            id: 'tech-mythril_containers',
            title: loc('tech_mythril_containers'),
            desc: loc('tech_mythril_containers_desc'),
            category: 'upgrade',
            reqs: { steel_container: 3, space: 3 },
            grant: ['steel_container',4],
            cost: {
                Knowledge(){ return 165000; },
                Mythril(){ return 500; }
            },
            effect: loc('tech_mythril_containers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adamantite_containers: {
            id: 'tech-adamantite_containers',
            title: loc('tech_adamantite_containers'),
            desc: loc('tech_adamantite_containers_desc'),
            category: 'upgrade',
            reqs: { steel_container: 4, alpha: 2 },
            grant: ['steel_container',5],
            cost: {
                Knowledge(){ return 525000; },
                Adamantite(){ return 17500; }
            },
            effect: loc('tech_adamantite_containers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        aerogel_containers: {
            id: 'tech-aerogel_containers',
            title: loc('tech_aerogel_containers'),
            desc: loc('tech_aerogel_containers'),
            category: 'upgrade',
            reqs: { steel_container: 5, aerogel: 1 },
            grant: ['steel_container',6],
            cost: {
                Knowledge(){ return 775000; },
                Aerogel(){ return 500; }
            },
            effect: loc('tech_aerogel_containers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        evil_planning: {
            id: 'tech-evil_planning',
            title: loc('tech_urban_planning'),
            desc: loc('tech_urban_planning'),
            category: 'upgrade',
            reqs: { banking: 2 },
            grant: ['queue',1],
            trait: ['terrifying'],
            cost: {
                Knowledge(){ return 2500; }
            },
            effect: loc('tech_urban_planning_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.queue.display = true;
                    return true;
                }
                return false;
            }
        },
        urban_planning: {
            id: 'tech-urban_planning',
            title: loc('tech_urban_planning'),
            desc: loc('tech_urban_planning'),
            category: 'upgrade',
            reqs: { banking: 2, currency: 2 },
            grant: ['queue',1],
            not_trait: ['terrifying'],
            cost: {
                Knowledge(){ return 2500; }
            },
            effect: loc('tech_urban_planning_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.queue.display = true;
                    return true;
                }
                return false;
            }
        },
        zoning_permits: {
            id: 'tech-zoning_permits',
            title: loc('tech_zoning_permits'),
            desc: loc('tech_zoning_permits'),
            category: 'upgrade',
            reqs: { queue: 1, high_tech: 3 },
            grant: ['queue',2],
            cost: {
                Knowledge(){ return 28000; }
            },
            effect(){
                return loc('tech_zoning_permits_effect',[global.genes['queue'] && global.genes['queue'] >= 2 ? 4 : 2]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        urbanization: {
            id: 'tech-urbanization',
            title: loc('tech_urbanization'),
            desc: loc('tech_urbanization'),
            category: 'upgrade',
            reqs: { queue: 2, high_tech: 6 },
            grant: ['queue',3],
            cost: {
                Knowledge(){ return 95000; }
            },
            effect(){
                return loc('tech_urbanization_effect',[global.genes['queue'] && global.genes['queue'] >= 2 ? 6 : 3]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        assistant: {
            id: 'tech-assistant',
            title: loc('tech_assistant'),
            desc: loc('tech_assistant'),
            category: 'upgrade',
            reqs: { queue: 1, science: 4 },
            grant: ['r_queue',1],
            cost: {
                Knowledge(){ return 5000; }
            },
            effect: loc('tech_assistant_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.r_queue.display = true;
                    return true;
                }
                return false;
            }
        },
        government: {
            id: 'tech-government',
            title: loc('tech_government'),
            desc: loc('tech_government_desc'),
            category: 'research',
            reqs: { currency: 1 },
            grant: ['govern',1],
            cost: {
                Knowledge(){ return 750; }
            },
            effect: loc('tech_government_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    vBind({el: '#govType'},'update');
                    vBind({el: '#foreign'},'update');
                    return true;
                }
                return false;
            }
        },
        theocracy: {
            id: 'tech-theocracy',
            title: loc('govern_theocracy'),
            desc: loc('govern_theocracy'),
            category: 'research',
            reqs: { govern: 1, theology: 2 },
            grant: ['gov_theo',1],
            cost: {
                Knowledge(){ return 1200; }
            },
            effect: loc('tech_theocracy_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        republic: {
            id: 'tech-republic',
            title: loc('govern_republic'),
            desc: loc('govern_republic'),
            category: 'research',
            reqs: { govern: 1 },
            condition(){
                return (global.tech['trade'] && global.tech['trade'] >= 2) || global.race['terrifying'] ? true : false;
            },
            grant: ['govern',2],
            cost: {
                Knowledge(){ return 17000; }
            },
            effect: loc('tech_republic_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        socialist: {
            id: 'tech-socialist',
            title: loc('govern_socialist'),
            desc: loc('govern_socialist'),
            category: 'research',
            reqs: { govern: 1 },
            condition(){
                return (global.tech['trade'] && global.tech['trade'] >= 2) || global.race['terrifying'] ? true : false;
            },
            grant: ['gov_soc',1],
            cost: {
                Knowledge(){ return 17000; }
            },
            effect: loc('tech_socialist_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        corpocracy: {
            id: 'tech-corpocracy',
            title: loc('govern_corpocracy'),
            desc: loc('govern_corpocracy'),
            category: 'research',
            reqs: { govern: 2, high_tech: 3 },
            grant: ['gov_corp',1],
            cost: {
                Knowledge(){ return 26000; }
            },
            effect: loc('tech_corpocracy_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        technocracy: {
            id: 'tech-technocracy',
            title: loc('govern_technocracy'),
            desc: loc('govern_technocracy'),
            category: 'research',
            reqs: { govern: 2, high_tech: 3 },
            grant: ['govern',3],
            cost: {
                Knowledge(){ return 26000; }
            },
            effect: loc('tech_technocracy_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        spy: {
            id: 'tech-spy',
            title: loc('tech_spy'),
            desc: loc('tech_spy'),
            category: 'research',
            reqs: { govern: 1 },
            grant: ['spy',1],
            cost: {
                Knowledge(){ return 1250; }
            },
            effect: loc('tech_spy_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: '#foreign'},'update');
                    return true;
                }
                return false;
            }
        },
        espionage: {
            id: 'tech-espionage',
            title: loc('tech_espionage'),
            desc: loc('tech_espionage'),
            category: 'upgrade',
            reqs: { spy: 1, high_tech: 1 },
            grant: ['spy',2],
            cost: {
                Knowledge(){ return 7500; }
            },
            effect: loc('tech_espionage_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: '#foreign'},'update');
                    return true;
                }
                return false;
            }
        },
        spy_training: {
            id: 'tech-spy_training',
            title: loc('tech_spy_training'),
            desc: loc('tech_spy_training'),
            category: 'upgrade',
            reqs: { spy: 2, boot_camp: 1 },
            grant: ['spy',3],
            cost: {
                Knowledge(){ return 10000; }
            },
            effect: loc('tech_spy_training_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        spy_gadgets: {
            id: 'tech-spy_gadgets',
            title: loc('tech_spy_gadgets'),
            desc: loc('tech_spy_gadgets'),
            category: 'upgrade',
            reqs: { spy: 3, high_tech: 2 },
            grant: ['spy',4],
            cost: {
                Knowledge(){ return 15000; }
            },
            effect: loc('tech_spy_gadgets_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        code_breakers: {
            id: 'tech-code_breakers',
            title: loc('tech_code_breakers'),
            desc: loc('tech_code_breakers'),
            category: 'upgrade',
            reqs: { spy: 4, high_tech: 4 },
            grant: ['spy',5],
            cost: {
                Knowledge(){ return 55000; }
            },
            effect: loc('tech_code_breakers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        currency: {
            id: 'tech-currency',
            title: loc('tech_currency'),
            desc: loc('tech_currency_desc'),
            category: 'research',
            reqs: { housing: 1 },
            grant: ['currency',1],
            cost: {
                Knowledge(){ return 22; },
                Lumber(){ return 10; } 
            },
            effect: loc('tech_currency_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Money.display = true;
                    return true;
                }
                return false;
            }
        },
        market: {
            id: 'tech-market',
            title: loc('tech_market'),
            desc: loc('tech_market_desc'),
            category: 'research',
            reqs: { banking: 1, govern: 1 },
            not_trait: ['terrifying'],
            grant: ['currency',2],
            cost: {
                Knowledge(){ return 1800; }
            },
            effect: loc('tech_market_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.showResources = true;
                    global.settings.showMarket = true;
                    return true;
                }
                return false;
            }
        },
        tax_rates: {
            id: 'tech-tax_rates',
            title: loc('tech_tax_rates'),
            desc: loc('tech_tax_rates_desc'),
            category: 'research',
            reqs: { banking: 2, currency: 2, queue: 1 },
            grant: ['currency',3],
            cost: {
                Knowledge(){ return 3375; }
            },
            effect: loc('tech_tax_rates_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.civic['taxes'].display = true;
                    return true;
                }
                return false;
            }
        },
        large_trades: {
            id: 'tech-large_trades',
            title: loc('tech_large_trades'),
            desc: loc('tech_large_trades_desc'),
            category: 'upgrade',
            reqs: { currency: 3 },
            grant: ['currency',4],
            cost: {
                Knowledge(){ return 6750; }
            },
            effect: loc('tech_large_trades_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    loadMarket();
                    return true;
                }
                return false;
            },
            post(){
                if (global.race['noble']){
                    global.tech['currency'] = 5;
                    drawTech();
                }
            }
        },
        corruption: {
            id: 'tech-corruption',
            title: loc('tech_corruption'),
            desc: loc('tech_corruption_desc'),
            category: 'upgrade',
            reqs: { currency: 4, high_tech: 3 },
            grant: ['currency',5],
            not_trait: ['noble'],
            cost: {
                Knowledge(){ return 36000; }
            },
            effect: loc('tech_corruption_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        massive_trades: {
            id: 'tech-massive_trades',
            title: loc('tech_massive_trades'),
            desc: loc('tech_massive_trades_desc'),
            category: 'upgrade',
            reqs: { currency: 5, high_tech: 4 },
            grant: ['currency',6],
            cost: {
                Knowledge(){ return 108000; }
            },
            effect: loc('tech_massive_trades_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    loadMarket();
                    return true;
                }
                return false;
            }
        },
        trade: {
            id: 'tech-trade',
            title: loc('tech_trade'),
            desc: loc('tech_trade_desc'),
            category: 'research',
            reqs: { currency: 2, military: 1 },
            grant: ['trade',1],
            cost: {
                Knowledge(){ return 4500; }
            },
            effect: loc('tech_trade_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['trade'] = { count: 0 };
                    global.city.market.active = true;
                    return true;
                }
                return false;
            }
        },
        diplomacy: {
            id: 'tech-diplomacy',
            title: loc('tech_diplomacy'),
            desc: loc('tech_diplomacy_desc'),
            category: 'upgrade',
            reqs: { trade: 1, high_tech: 1 },
            grant: ['trade',2],
            cost: {
                Knowledge(){ return 16200; }
            },
            effect: loc('tech_diplomacy_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        freight: {
            id: 'tech-freight',
            title: loc('tech_freight'),
            desc: loc('tech_freight_desc'),
            category: 'upgrade',
            reqs: { trade: 2, high_tech: 3 },
            grant: ['trade',3],
            cost: {
                Knowledge(){ return 37800; }
            },
            effect: loc('tech_freight_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.tech['high_tech'] >= 6) {
                        arpa('Physics');
                    }
                    return true;
                }
                return false;
            }
        },
        wharf: {
            id: 'tech-wharf',
            title: loc('tech_wharf'),
            desc: loc('tech_wharf_desc'),
            category: 'research',
            reqs: { trade: 1, high_tech: 3, oil: 1 },
            not_trait: ['thalassophobia'],
            grant: ['wharf',1],
            cost: {
                Knowledge(){ return 44000; }
            },
            effect: loc('tech_wharf_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['wharf'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        banking: {
            id: 'tech-banking',
            title: loc('tech_banking'),
            desc: loc('tech_banking_desc'),
            category: 'research',
            reqs: { currency: 1 },
            grant: ['banking',1],
            cost: {
                Knowledge(){ return 90; }
            },
            effect: loc('tech_banking_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['bank'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        investing: {
            id: 'tech-investing',
            title: loc('tech_investing'),
            desc: loc('tech_investing_desc'),
            category: 'research',
            reqs: { banking: 1 },
            grant: ['banking',2],
            cost: {
                Money(){ return 2500; },
                Knowledge(){ return 900; }
            },
            effect: loc('tech_investing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.civic.banker.display = true;
                    return true;
                }
                return false;
            }
        },
        vault: {
            id: 'tech-vault',
            title: loc('tech_vault'),
            desc: loc('tech_vault_desc'),
            category: 'upgrade',
            reqs: { banking: 2, cement: 1 },
            grant: ['banking',3],
            cost: {
                Money(){ return 2000; },
                Knowledge(){ return 3600; },
                Iron(){ return 500; },
                Cement(){ return 750; }
            },
            effect: loc('tech_vault_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        bonds: {
            id: 'tech-bonds',
            title: loc('tech_bonds'),
            desc: loc('tech_bonds'),
            category: 'upgrade',
            reqs: { banking: 3 },
            grant: ['banking',4],
            cost: {
                Money(){ return 20000; },
                Knowledge(){ return 5000; }
            },
            effect: loc('tech_bonds_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_vault: {
            id: 'tech-steel_vault',
            title: loc('tech_steel_vault'),
            desc: loc('tech_steel_vault'),
            category: 'upgrade',
            reqs: { banking: 4, smelting: 2 },
            grant: ['banking',5],
            cost: {
                Money(){ return 30000; },
                Knowledge(){ return 6750; },
                Steel(){ return 3000; }
            },
            effect: loc('tech_steel_vault_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        eebonds: {
            id: 'tech-eebonds',
            title: loc('tech_eebonds'),
            desc: loc('tech_eebonds'),
            category: 'upgrade',
            reqs: { banking: 5, high_tech: 1 },
            grant: ['banking',6],
            cost: {
                Money(){ return 75000; },
                Knowledge(){ return 18000; }
            },
            effect: loc('tech_eebonds_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        swiss_banking: {
            id: 'tech-swiss_banking',
            title: loc('tech_swiss_banking'),
            desc: loc('tech_swiss_banking'),
            category: 'upgrade',
            reqs: { banking: 6 },
            grant: ['banking',7],
            cost: {
                Money(){ return 125000; },
                Knowledge(){ return 45000; }
            },
            effect: loc('tech_swiss_banking_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        safety_deposit: {
            id: 'tech-safety_deposit',
            title: loc('tech_safety_deposit'),
            desc: loc('tech_safety_deposit'),
            category: 'upgrade',
            reqs: { banking: 7, high_tech: 4 },
            grant: ['banking',8],
            cost: {
                Money(){ return 250000; },
                Knowledge(){ return 67500; }
            },
            effect: loc('tech_safety_deposit_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        stock_market: {
            id: 'tech-stock_market',
            title: loc('tech_stock_market'),
            desc: loc('tech_stock_market'),
            category: 'research',
            reqs: { banking: 8, high_tech: 6 },
            grant: ['banking',9],
            cost: {
                Money(){ return 325000; },
                Knowledge(){ return 108000; }
            },
            effect: loc('tech_stock_market_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    arpa('Physics');
                    return true;
                }
                return false;
            }
        },
        hedge_funds: {
            id: 'tech-hedge_funds',
            title: loc('tech_hedge_funds'),
            desc: loc('tech_hedge_funds'),
            category: 'upgrade',
            reqs: { banking: 9, stock_exchange: 1 },
            grant: ['banking',10],
            cost: {
                Money(){ return 375000; },
                Knowledge(){ return 126000; }
            },
            effect: loc('tech_hedge_funds_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        four_oh_one: {
            id: 'tech-four_oh_one',
            title: loc('tech_four_oh_one'),
            desc: loc('tech_four_oh_one'),
            category: 'upgrade',
            reqs: { banking: 10 },
            grant: ['banking',11],
            cost: {
                Money(){ return 425000; },
                Knowledge(){ return 144000; }
            },
            effect: loc('tech_four_oh_one_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            },
            flair(){
                return loc('tech_four_oh_one_flair');
            }
        },
        exchange: {
            id: 'tech-exchange',
            title: loc('tech_exchange'),
            desc: loc('tech_exchange'),
            category: 'research',
            reqs: { banking: 11, alpha: 2, graphene: 1 },
            grant: ['banking',12],
            cost: {
                Money(){ return 1000000; },
                Knowledge(){ return 675000; }
            },
            effect: loc('tech_exchange_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['exchange'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        mythril_vault: {
            id: 'tech-mythril_vault',
            title: loc('tech_mythril_vault'),
            desc: loc('tech_mythril_vault'),
            category: 'upgrade',
            reqs: { banking: 5, space: 3 },
            grant: ['vault',1],
            cost: {
                Money(){ return 500000; },
                Knowledge(){ return 150000; },
                Mythril(){ return 750; }
            },
            effect: loc('tech_mythril_vault_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        neutronium_vault: {
            id: 'tech-neutronium_vault',
            title: loc('tech_neutronium_vault'),
            desc: loc('tech_neutronium_vault'),
            category: 'upgrade',
            reqs: { vault: 1, gas_moon: 1 },
            grant: ['vault',2],
            cost: {
                Money(){ return 750000; },
                Knowledge(){ return 280000; },
                Neutronium(){ return 650; }
            },
            effect: loc('tech_neutronium_vault_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adamantite_vault: {
            id: 'tech-adamantite_vault',
            title: loc('tech_adamantite_vault'),
            desc: loc('tech_adamantite_vault'),
            category: 'upgrade',
            reqs: { vault: 2, alpha: 2 },
            grant: ['vault',3],
            cost: {
                Money(){ return 2000000; },
                Knowledge(){ return 560000; },
                Adamantite(){ return 20000; }
            },
            effect: loc('tech_adamantite_vault_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        graphene_vault: {
            id: 'tech-graphene_vault',
            title: loc('tech_graphene_vault'),
            desc: loc('tech_graphene_vault'),
            category: 'upgrade',
            reqs: { vault: 3, graphene: 1 },
            grant: ['vault',4],
            cost: {
                Money(){ return 3000000; },
                Knowledge(){ return 750000; },
                Graphene(){ return 400000; }
            },
            effect: loc('tech_graphene_vault_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        home_safe: {
            id: 'tech-home_safe',
            title: loc('tech_home_safe'),
            desc: loc('tech_home_safe'),
            category: 'upgrade',
            reqs: { banking: 5 },
            grant: ['home_safe',1],
            cost: {
                Money(){ return 42000; },
                Knowledge(){ return 8000; },
                Steel(){ return 4500; }
            },
            effect: loc('tech_home_safe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        fire_proof_safe: {
            id: 'tech-fire_proof_safe',
            title: loc('tech_fire_proof_safe'),
            desc: loc('tech_fire_proof_safe'),
            category: 'upgrade',
            reqs: { home_safe: 1, space: 3 },
            grant: ['home_safe',2],
            cost: {
                Money(){ return 250000; },
                Knowledge(){ return 120000; },
                Iridium(){ return 1000; }
            },
            effect: loc('tech_fire_proof_safe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        tamper_proof_safe: {
            id: 'tech-tamper_proof_safe',
            title: loc('tech_tamper_proof_safe'),
            desc: loc('tech_tamper_proof_safe'),
            category: 'upgrade',
            reqs: { home_safe: 2, infernite: 1 },
            grant: ['home_safe',3],
            cost: {
                Money(){ return 2500000; },
                Knowledge(){ return 600000; },
                Infernite(){ return 800; }
            },
            effect: loc('tech_tamper_proof_safe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        monument: {
            id: 'tech-monument',
            title: loc('tech_monument'),
            desc: loc('tech_monument'),
            category: 'research',
            reqs: { high_tech: 6 },
            grant: ['monument',1],
            cost: {
                Knowledge(){ return 120000; }
            },
            effect: loc('tech_monument_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.arpa['m_type'] = arpa('Monument');
                    arpa('Physics');
                    return true;
                }
                return false;
            }
        },
        tourism: {
            id: 'tech-tourism',
            title: loc('tech_tourism'),
            desc: loc('tech_tourism'),
            category: 'research',
            reqs: { monuments: 2 },
            grant: ['monument',2],
            cost: {
                Knowledge(){ return 150000; }
            },
            effect: loc('tech_tourism_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['tourist_center'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        science: {
            id: 'tech-science',
            title: loc('tech_science'),
            desc: loc('tech_science_desc'),
            category: 'research',
            reqs: { housing: 1 },
            grant: ['science',1],
            cost: {
                Knowledge(){ return 65; }
            },
            effect: loc('tech_science_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['university'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        library: {
            id: 'tech-library',
            title: loc('tech_library'),
            desc: loc('tech_library_desc'),
            category: 'research',
            reqs: { science: 1, cement: 1 },
            grant: ['science',2],
            cost: {
                Knowledge(){ return 720; }
            },
            effect: loc('tech_library_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['library'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        thesis: {
            id: 'tech-thesis',
            title: loc('tech_thesis'),
            desc: loc('tech_thesis_desc'),
            category: 'upgrade',
            reqs: { science: 2 },
            grant: ['science',3],
            cost: {
                Knowledge(){ return 1125; }
            },
            effect: loc('tech_thesis_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        research_grant: {
            id: 'tech-research_grant',
            title: loc('tech_research_grant'),
            desc: loc('tech_research_grant_desc'),
            category: 'upgrade',
            reqs: { science: 3 },
            grant: ['science',4],
            cost: {
                Knowledge(){ return 3240; }
            },
            effect: loc('tech_research_grant_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        scientific_journal: {
            id: 'tech-scientific_journal',
            title: loc('tech_scientific_journal'),
            desc: loc('tech_scientific_journal_desc'),
            category: 'upgrade',
            reqs: { science: 4, high_tech: 3 },
            grant: ['science',5],
            cost: {
                Knowledge(){ return 27000; }
            },
            effect: loc('tech_scientific_journal_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adjunct_professor: {
            id: 'tech-adjunct_professor',
            title: loc('tech_adjunct_professor'),
            desc: loc('tech_adjunct_professor'),
            category: 'upgrade',
            reqs: { science: 5 },
            grant: ['science',6],
            cost: {
                Knowledge(){ return 36000; }
            },
            effect(){ return loc('tech_adjunct_professor_effect',[global.race['evil'] ? loc('city_babel') : loc('city_wardenclyffe')]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        tesla_coil: {
            id: 'tech-tesla_coil',
            title: loc('tech_tesla_coil'),
            desc: loc('tech_tesla_coil_desc'),
            category: 'upgrade',
            reqs: { science: 6, high_tech: 3 },
            grant: ['science',7],
            cost: {
                Knowledge(){ return 51750; }
            },
            effect(){ return loc('tech_tesla_coil_effect',[global.race['evil'] ? loc('city_babel') : loc('city_wardenclyffe')]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        internet: {
            id: 'tech-internet',
            title: loc('tech_internet'),
            desc: loc('tech_internet'),
            category: 'upgrade',
            reqs: { science: 7, high_tech: 4 },
            grant: ['science',8],
            cost: {
                Knowledge(){ return 61200; }
            },
            effect: loc('tech_internet_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.race['toxic'] && global.race.species === 'troll'){
                        unlockAchieve('godwin');
                    }
                    return true;
                }
                return false;
            }
        },
        observatory: {
            id: 'tech-observatory',
            title: loc('tech_observatory'),
            desc: loc('tech_observatory'),
            category: 'research',
            reqs: { science: 8, space: 3, luna: 1 },
            grant: ['science',9],
            cost: {
                Knowledge(){ return 148000; }
            },
            effect: loc('tech_observatory_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_world_collider'),
            desc: loc('tech_world_collider'),
            category: 'research',
            reqs: { science: 9, elerium: 2 },
            grant: ['science',10],
            cost: {
                Knowledge(){ return 350000; }
            },
            effect(){ return loc('tech_world_collider_effect',[races[global.race.species].solar.dwarf]); },
            action(){
                if (payCosts($(this)[0].cost)){
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
            flair: `<div>${loc('tech_world_collider_flair1')}</div><div>${loc('tech_world_collider_flair2')}</div>`
        },
        laboratory: {
            id: 'tech-laboratory',
            title: loc('tech_laboratory'),
            desc: loc('tech_laboratory_desc'),
            category: 'research',
            reqs: { science: 11, alpha: 2 },
            grant: ['science',12],
            cost: {
                Knowledge(){ return 500000; }
            },
            effect(){ return loc('tech_laboratory_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['laboratory'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            },
            flair: loc('tech_laboratory_flair')
        },
        virtual_assistant: {
            id: 'tech-virtual_assistant',
            title: loc('tech_virtual_assistant'),
            desc: loc('tech_virtual_assistant'),
            category: 'upgrade',
            reqs: { science: 12, high_tech: 12 },
            grant: ['science',13],
            cost: {
                Knowledge(){ return 635000; }
            },
            effect(){ return loc('tech_virtual_assistant_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        dimensional_readings: {
            id: 'tech-dimensional_readings',
            title: loc('tech_dimensional_readings'),
            desc: loc('tech_dimensional_readings'),
            category: 'upgrade',
            reqs: { science: 13, infernite: 2 },
            grant: ['science',14],
            cost: {
                Knowledge(){ return 750000; }
            },
            effect(){ return loc('tech_dimensional_readings_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        quantum_entanglement: {
            id: 'tech-quantum_entanglement',
            title: loc('tech_quantum_entanglement'),
            desc: loc('tech_quantum_entanglement'),
            category: 'upgrade',
            reqs: { science: 14, neutron: 1 },
            grant: ['science',15],
            cost: {
                Knowledge(){ return 850000; },
                Neutronium(){ return 7500; },
                Soul_Gem(){ return 2; }
            },
            effect(){ return loc('tech_quantum_entanglement_effect',[2]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        bioscience: {
            id: 'tech-bioscience',
            title: loc('tech_bioscience'),
            desc: loc('tech_bioscience_desc'),
            category: 'research',
            reqs: { science: 8 },
            grant: ['genetics',1],
            cost: {
                Knowledge(){ return 67500; }
            },
            effect: loc('tech_bioscience_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['biolab'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        genetics: {
            id: 'tech-genetics',
            title: loc('tech_genetics'),
            desc: loc('tech_genetics'),
            category: 'research',
            reqs: { genetics: 1, high_tech: 6 },
            grant: ['genetics',2],
            cost: {
                Knowledge(){ return 108000; }
            },
            effect: loc('tech_genetics_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.settings.arpa.genetics = true;
                    arpa('Genetics');
                    return true;
                }
                return false;
            }
        },
        crispr: {
            id: 'tech-crispr',
            title: loc('tech_crispr'),
            desc: loc('tech_crispr'),
            category: 'research',
            reqs: { genetics: 3 },
            grant: ['genetics',4],
            cost: {
                Knowledge(){ return 125000; }
            },
            effect: loc('tech_crispr_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.settings.arpa.crispr = true;
                    global.settings.arpa.arpaTabs = 2;
                    arpa('Genetics');
                    arpa('Crispr');
                    return true;
                }
                return false;
            }
        },
        shotgun_sequencing: {
            id: 'tech-shotgun_sequencing',
            title: loc('tech_shotgun_sequencing'),
            desc: loc('tech_shotgun_sequencing_desc'),
            category: 'upgrade',
            reqs: { genetics: 4 },
            grant: ['genetics',5],
            cost: {
                Knowledge(){ return 165000; }
            },
            effect: loc('tech_shotgun_sequencing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.arpa.sequence.boost = true;
                    arpa('Genetics');
                    return true;
                }
                return false;
            }
        },
        de_novo_sequencing: {
            id: 'tech-de_novo_sequencing',
            title: loc('tech_de_novo_sequencing'),
            desc: loc('tech_de_novo_sequencing'),
            category: 'research',
            reqs: { genetics: 5 },
            grant: ['genetics',6],
            cost: {
                Knowledge(){ return 220000; }
            },
            effect: loc('tech_de_novo_sequencing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    arpa('Genetics');
                    return true;
                }
                return false;
            }
        },
        dna_sequencer: {
            id: 'tech-dna_sequencer',
            title: loc('tech_dna_sequencer'),
            desc: loc('tech_dna_sequencer'),
            category: 'research',
            reqs: { genetics: 6 },
            grant: ['genetics',7],
            cost: {
                Knowledge(){ return 300000; }
            },
            effect: loc('tech_dna_sequencer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.arpa.sequence.auto = true;
                    arpa('Genetics');
                    return true;
                }
                return false;
            }
        },
        rapid_sequencing: {
            id: 'tech-rapid_sequencing',
            title: loc('tech_rapid_sequencing'),
            desc: loc('tech_rapid_sequencing'),
            category: 'upgrade',
            reqs: { genetics: 7, high_tech: 12 },
            grant: ['genetics',8],
            cost: {
                Knowledge(){ return 800000; }
            },
            effect: loc('tech_rapid_sequencing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mad_science: {
            id: 'tech-mad_science',
            title: loc('tech_mad_science'),
            desc: loc('tech_mad_science'),
            category: 'research',
            reqs: { science: 2, smelting: 2 },
            grant: ['high_tech',1],
            cost: {
                Money(){ return 10000; },
                Knowledge(){ return 6750; },
                Aluminium(){ return 1000; }
            },
            effect: loc('tech_mad_science_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.race['terrifying']){
                        global.civic['taxes'].display = true;
                    }
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
            title: loc('tech_electricity'),
            desc: loc('tech_electricity'),
            category: 'research',
            reqs: { high_tech: 1 },
            grant: ['high_tech',2],
            cost: {
                Knowledge(){ return 13500; },
                Copper(){ return 1000; }
            },
            effect: loc('tech_electricity_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_industrialization'),
            desc: loc('tech_industrialization'),
            category: 'research',
            reqs: { high_tech: 2, cement: 2, steel_container: 1 },
            grant: ['high_tech',3],
            cost: {
                Knowledge(){ return 25200; }
            },
            effect: loc('tech_industrialization_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Titanium.display = true;
                    global.city['factory'] = {
                        count: 0,
                        on: 0,
                        Lux: 0,
                        Alloy: 0,
                        Polymer: 0,
                        Nano: 0,
                        Stanene: 0
                    };
                    return true;
                }
                return false;
            }
        },
        electronics: {
            id: 'tech-electronics',
            title: loc('tech_electronics'),
            desc: loc('tech_electronics'),
            category: 'research',
            reqs: { high_tech: 3, titanium: 1 },
            grant: ['high_tech',4],
            cost: {
                Knowledge(){ return 50000; }
            },
            effect: loc('tech_electronics_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.race['terrifying']){
                        global.tech['gambling'] = 1;
                        global.city['casino'] = { count: 0 };
                    }
                    return true;
                }
                return false;
            }
        },
        fission: {
            id: 'tech-fission',
            title: loc('tech_fission'),
            desc: loc('tech_fission'),
            category: 'research',
            reqs: { high_tech: 4, uranium: 1 },
            grant: ['high_tech',5],
            cost: {
                Knowledge(){ return 77400; },
                Uranium(){ return 10; }
            },
            effect: loc('tech_fission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('tech_fission_msg'),'success');
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
            title: loc('tech_arpa'),
            desc: loc('tech_arpa_desc'),
            category: 'research',
            reqs: { high_tech: 5 },
            grant: ['high_tech',6],
            cost: {
                Knowledge(){ return 90000; }
            },
            effect: loc('tech_arpa_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.showGenetics = true;
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    arpa('Physics');
                    return true;
                }
                return false;
            }
        },
        rocketry: {
            id: 'tech-rocketry',
            title: loc('tech_rocketry'),
            desc: loc('tech_rocketry'),
            category: 'research',
            reqs: { high_tech: 6 },
            grant: ['high_tech',7],
            cost: {
                Knowledge(){ return 112500; },
                Oil(){ return 6800; }
            },
            effect: loc('tech_rocketry_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    arpa('Physics');
                    return true;
                }
                return false;
            }
        },
        robotics: {
            id: 'tech-robotics',
            title: loc('tech_robotics'),
            desc: loc('tech_robotics'),
            category: 'research',
            reqs: { high_tech: 7 },
            grant: ['high_tech',8],
            cost: {
                Knowledge(){ return 125000; }
            },
            effect: loc('tech_robotics_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        lasers: {
            id: 'tech-lasers',
            title: loc('tech_lasers'),
            desc: loc('tech_lasers_desc'),
            category: 'research',
            reqs: { high_tech: 8, space: 3, supercollider: 1, elerium: 1 },
            grant: ['high_tech',9],
            cost: {
                Knowledge(){ return 280000; },
                Elerium(){ return 100; }
            },
            effect: loc('tech_lasers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        artifical_intelligence: {
            id: 'tech-artifical_intelligence',
            title: loc('tech_artificial_intelligence'),
            desc: loc('tech_artificial_intelligence'),
            category: 'research',
            reqs: { high_tech: 9 },
            grant: ['high_tech',10],
            cost: {
                Knowledge(){ return 325000; }
            },
            effect: loc('tech_artificial_intelligence_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            },
            flair(){
                return loc('tech_artificial_intelligence_flair');
            }
        },
        quantum_computing: {
            id: 'tech-quantum_computing',
            title: loc('tech_quantum_computing'),
            desc: loc('tech_quantum_computing'),
            category: 'research',
            reqs: { high_tech: 10, nano: 1 },
            grant: ['high_tech',11],
            cost: {
                Knowledge(){ return 435000; },
                Elerium(){ return 250 },
                Nano_Tube(){ return 100000 }
            },
            effect: loc('tech_quantum_computing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            },
            flair(){
                return loc('tech_quantum_computing_flair');
            }
        },
        virtual_reality: {
            id: 'tech-virtual_reality',
            title: loc('tech_virtual_reality'),
            desc: loc('tech_virtual_reality'),
            category: 'research',
            reqs: { high_tech: 11, alpha: 2, infernite: 1, stanene: 1 },
            grant: ['high_tech',12],
            cost: {
                Knowledge(){ return 600000; },
                Stanene(){ return 1250 },
                Soul_Gem(){ return 1 }
            },
            effect: loc('tech_virtual_reality_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            },
            flair(){
                return loc('tech_virtual_reality_flair');
            }
        },
        plasma: {
            id: 'tech-plasma',
            title: loc('tech_plasma'),
            desc: loc('tech_plasma'),
            category: 'research',
            reqs: { high_tech: 12 },
            grant: ['high_tech',13],
            cost: {
                Knowledge(){ return 755000; },
                Infernite(){ return 1000; },
                Stanene(){ return 250000 }
            },
            effect: loc('tech_plasma_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        shields: {
            id: 'tech-shields',
            title: loc('tech_shields'),
            desc: loc('tech_shields'),
            category: 'research',
            reqs: { high_tech: 13 },
            grant: ['high_tech',14],
            cost: {
                Knowledge(){ return 850000; },
            },
            effect: loc('tech_shields_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.space.neutron = true;
                    global.settings.space.blackhole = true;
                    return true;
                }
                return false;
            }
        },
        ai_core: {
            id: 'tech-ai_core',
            title: loc('tech_ai_core'),
            desc: loc('tech_ai_core'),
            category: 'research',
            reqs: { high_tech: 14, science: 15, blackhole: 3 },
            grant: ['high_tech',15],
            cost: {
                Knowledge(){ return 1500000; },
            },
            effect: loc('tech_ai_core_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['citadel'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        cement_processing: {
            id: 'tech-cement_processing',
            title: loc('tech_cement_processing'),
            desc: loc('tech_cement_processing'),
            category: 'research',
            reqs: { high_tech: 15 },
            grant: ['ai_core',1],
            cost: {
                Knowledge(){ return 1750000; },
            },
            effect: loc('tech_cement_processing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adamantite_processing: {
            id: 'tech-adamantite_processing',
            title: loc('tech_adamantite_processing'),
            desc: loc('tech_adamantite_processing'),
            category: 'research',
            reqs: { ai_core: 1 },
            grant: ['ai_core',2],
            cost: {
                Knowledge(){ return 2000000; },
            },
            effect: loc('tech_adamantite_processing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        graphene_processing: {
            id: 'tech-graphene_processing',
            title: loc('tech_graphene_processing'),
            desc: loc('tech_graphene_processing'),
            category: 'research',
            reqs: { ai_core: 2 },
            grant: ['ai_core',3],
            cost: {
                Knowledge(){ return 2500000; },
            },
            effect: loc('tech_graphene_processing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        fusion_power: {
            id: 'tech-fusion_power',
            title: loc('tech_fusion_power'),
            desc: loc('tech_fusion_power'),
            category: 'research',
            reqs: { ram_scoop: 1 },
            grant: ['fusion',1],
            cost: {
                Knowledge(){ return 640000; }
            },
            effect: loc('tech_fusion_power_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['fusion'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        thermomechanics: {
            id: 'tech-thermomechanics',
            title: loc('tech_thermomechanics'),
            desc: loc('tech_thermomechanics_desc'),
            category: 'upgrade',
            reqs: { high_tech: 4 },
            grant: ['alloy',1],
            cost: {
                Knowledge(){ return 60000; },
            },
            effect(){ return loc('tech_thermomechanics_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        quantum_manufacturing: {
            id: 'tech-quantum_manufacturing',
            title: loc('tech_quantum_manufacturing'),
            desc: loc('tech_quantum_manufacturing'),
            category: 'upgrade',
            reqs: { high_tech: 11 },
            grant: ['q_factory',1],
            cost: {
                Knowledge(){ return 465000; }
            },
            effect: loc('tech_quantum_manufacturing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        worker_drone: {
            id: 'tech-worker_drone',
            title: loc('tech_worker_drone'),
            desc: loc('tech_worker_drone'),
            category: 'research',
            reqs: { nano: 1 },
            grant: ['drone',1],
            cost: {
                Knowledge(){ return 400000; },
            },
            effect(){ return loc('tech_worker_drone_effect',[races[global.race.species].solar.gas_moon]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['drone'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        uranium: {
            id: 'tech-uranium',
            title: loc('tech_uranium'),
            desc: loc('tech_uranium'),
            category: 'research',
            reqs: { high_tech: 4 },
            grant: ['uranium',1],
            cost: {
                Knowledge(){ return 72000; }
            },
            effect: loc('tech_uranium_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Uranium.display = true;
                    return true;
                }
                return false;
            }
        },
        uranium_storage: {
            id: 'tech-uranium_storage',
            title: loc('tech_uranium_storage'),
            desc: loc('tech_uranium_storage'),
            category: 'research',
            reqs: { uranium: 1 },
            grant: ['uranium',2],
            cost: {
                Knowledge(){ return 75600; },
                Alloy(){ return 2500; }
            },
            effect: loc('tech_uranium_storage_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        uranium_ash: {
            id: 'tech-uranium_ash',
            title: loc('tech_uranium_ash'),
            desc: loc('tech_uranium_ash'),
            category: 'research',
            reqs: { uranium: 2 },
            grant: ['uranium',3],
            cost: {
                Knowledge(){ return 122000; }
            },
            effect: loc('tech_uranium_ash_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        breeder_reactor: {
            id: 'tech-breeder_reactor',
            title: loc('tech_breeder_reactor'),
            desc: loc('tech_breeder_reactor'),
            category: 'upgrade',
            reqs: { high_tech: 5, uranium: 3, space: 3 },
            grant: ['uranium',4],
            cost: {
                Knowledge(){ return 160000; },
                Uranium(){ return 250; },
                Iridium(){ return 1000; }
            },
            effect: loc('tech_breeder_reactor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mine_conveyor: {
            id: 'tech-mine_conveyor',
            title: loc('tech_mine_conveyor'),
            desc: loc('tech_mine_conveyor'),
            category: 'upgrade',
            reqs: { high_tech: 2 },
            grant: ['mine_conveyor',1],
            cost: {
                Knowledge(){ return 16200; },
                Copper(){ return 2250; },
                Steel(){ return 1750; }
            },
            effect: loc('tech_mine_conveyor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        oil_well: {
            id: 'tech-oil_well',
            title: loc('tech_oil_well'),
            desc: loc('tech_oil_well'),
            category: 'research',
            reqs: { high_tech: 3 },
            grant: ['oil',1],
            cost: {
                Knowledge(){ return 27000; }
            },
            effect: loc('tech_oil_well_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['oil_well'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        oil_depot: {
            id: 'tech-oil_depot',
            title: loc('tech_oil_depot'),
            desc: loc('tech_oil_depot'),
            category: 'research',
            reqs: { oil: 1 },
            grant: ['oil',2],
            cost: {
                Knowledge(){ return 32000; }
            },
            effect: loc('tech_oil_depot_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['oil_depot'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        oil_power: {
            id: 'tech-oil_power',
            title(){
                return global.race['environmentalist'] ? loc('city_wind_power') : loc('tech_oil_power');
            },
            desc(){
                return global.race['environmentalist'] ? loc('city_wind_power') : loc('tech_oil_power');
            },
            category: 'research',
            reqs: { oil: 2 },
            grant: ['oil',3],
            cost: {
                Knowledge(){ return 44000; }
            },
            effect(){
                return global.race['environmentalist'] ? loc('tech_wind_power_effect') : loc('tech_oil_power_effect');
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['oil_power'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        titanium_drills: {
            id: 'tech-titanium_drills',
            title: loc('tech_titanium_drills'),
            desc: loc('tech_titanium_drills'),
            category: 'upgrade',
            reqs: { oil: 3 },
            grant: ['oil',4],
            cost: {
                Knowledge(){ return 54000; },
                Titanium(){ return 3500; }
            },
            effect: loc('tech_titanium_drills_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        alloy_drills: {
            id: 'tech-alloy_drills',
            title: loc('tech_alloy_drills'),
            desc: loc('tech_alloy_drills'),
            category: 'upgrade',
            reqs: { oil: 4 },
            grant: ['oil',5],
            cost: {
                Knowledge(){ return 77000; },
                Alloy(){ return 1000; }
            },
            effect: loc('tech_alloy_drills_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        fracking: {
            id: 'tech-fracking',
            title: loc('tech_fracking'),
            desc: loc('tech_fracking'),
            category: 'upgrade',
            reqs: { oil: 5, high_tech: 6 },
            grant: ['oil',6],
            cost: {
                Knowledge(){ return 132000; }
            },
            effect: loc('tech_fracking_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mythril_drills: {
            id: 'tech-mythril_drills',
            title: loc('tech_mythril_drills'),
            desc: loc('tech_mythril_drills'),
            category: 'upgrade',
            reqs: { oil: 6, space: 3 },
            grant: ['oil',7],
            cost: {
                Knowledge(){ return 165000; },
                Mythril(){ return 100; }
            },
            effect: loc('tech_mythril_drills_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mass_driver: {
            id: 'tech-mass_driver',
            title: loc('tech_mass_driver'),
            desc: loc('tech_mass_driver'),
            category: 'research',
            reqs: { oil: 6, space: 3 },
            grant: ['mass',1],
            cost: {
                Knowledge(){ return 160000; }
            },
            effect: loc('tech_mass_driver_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_polymer'),
            desc: loc('tech_polymer'),
            category: 'research',
            reqs: { genetics: 1 },
            grant: ['polymer',1],
            cost: {
                Knowledge(){ return 80000; },
                Oil(){ return 5000; },
                Alloy(){ return 450; }
            },
            effect: loc('tech_polymer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.resource.Polymer.display = true;
                    messageQueue(loc('tech_polymer_avail'));
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        fluidized_bed_reactor: {
            id: 'tech-fluidized_bed_reactor',
            title: loc('tech_fluidized_bed_reactor'),
            desc: loc('tech_fluidized_bed_reactor'),
            category: 'upgrade',
            reqs: { polymer: 1, high_tech: 6 },
            grant: ['polymer',2],
            cost: {
                Knowledge(){ return 99000; }
            },
            effect: loc('tech_fluidized_bed_reactor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        stanene: {
            id: 'tech-stanene',
            title: loc('tech_stanene'),
            desc: loc('tech_stanene'),
            category: 'research',
            reqs: { infernite: 1 },
            grant: ['stanene',1],
            cost: {
                Knowledge(){ return 590000; },
                Aluminium(){ return 500000; },
                Infernite(){ return 1000; }
            },
            effect: loc('tech_stanene_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.resource.Stanene.display = true;
                    messageQueue(loc('tech_stanene_avail'));
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        nano_tubes: {
            id: 'tech-nano_tubes',
            title: loc('tech_nano_tubes'),
            desc: loc('tech_nano_tubes'),
            category: 'research',
            reqs: { high_tech: 10 },
            grant: ['nano',1],
            cost: {
                Knowledge(){ return 375000; },
                Coal(){ return 100000; },
                Neutronium(){ return 1000; }
            },
            effect: loc('tech_nano_tubes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.resource.Nano_Tube.display = true;
                    global.city.factory['Nano'] = 0;
                    messageQueue('Nano Tubes are now available for manufacture');
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        reclaimer: {
            id: 'tech-reclaimer',
            title: loc('tech_reclaimer'),
            desc: loc('tech_reclaimer_desc'),
            category: 'research',
            reqs: { primitive: 3 },
            grant: ['reclaimer',1],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 45; },
                Lumber(){ return 20; },
                Stone(){ return 20; }
            },
            effect: loc('tech_reclaimer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.civic.lumberjack.display = true;
                    global.city['graveyard'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        shovel: {
            id: 'tech-shovel',
            title: loc('tech_shovel'),
            desc: loc('tech_shovel'),
            category: 'upgrade',
            reqs: { reclaimer: 1, mining: 2 },
            grant: ['reclaimer',2],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 540; },
                Copper(){ return 25; }
            },
            effect: loc('tech_shovel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        iron_shovel: {
            id: 'tech-iron_shovel',
            title: loc('tech_iron_shovel'),
            desc: loc('tech_iron_shovel'),
            category: 'upgrade',
            reqs: { reclaimer: 2, mining: 3 },
            grant: ['reclaimer',3],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 2700; },
                Iron(){ return 250; }
            },
            effect: loc('tech_iron_shovel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_shovel: {
            id: 'tech-steel_shovel',
            title: loc('tech_steel_shovel'),
            desc: loc('tech_steel_shovel'),
            category: 'upgrade',
            reqs: { reclaimer: 3, smelting: 2 },
            grant: ['reclaimer',4],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 9000; },
                Steel(){ return 250; }
            },
            effect: loc('tech_steel_shovel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_shovel: {
            id: 'tech-titanium_shovel',
            title: loc('tech_titanium_shovel'),
            desc: loc('tech_titanium_shovel'),
            category: 'upgrade',
            reqs: { reclaimer: 4, high_tech: 3 },
            grant: ['reclaimer',5],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 38000; },
                Titanium(){ return 350; }
            },
            effect: loc('tech_titanium_shovel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        alloy_shovel: {
            id: 'tech-alloy_shovel',
            title: loc('tech_alloy_shovel'),
            desc: loc('tech_alloy_shovel'),
            category: 'upgrade',
            reqs: { reclaimer: 5, high_tech: 4 },
            grant: ['reclaimer',6],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 67500; },
                Alloy(){ return 750; }
            },
            effect: loc('tech_alloy_shovel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mythril_shovel: {
            id: 'tech-mythril_shovel',
            title: loc('tech_mythril_shovel'),
            desc: loc('tech_mythril_shovel'),
            category: 'upgrade',
            reqs: { reclaimer: 6, space: 3 },
            grant: ['reclaimer',7],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 160000; },
                Mythril(){ return 880; }
            },
            effect: loc('tech_mythril_shovel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adamantite_shovel: {
            id: 'tech-adamantite_shovel',
            title: loc('tech_adamantite_shovel'),
            desc: loc('tech_adamantite_shovel'),
            category: 'upgrade',
            reqs: { reclaimer: 7, alpha: 2 },
            grant: ['reclaimer',8],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 525000; },
                Adamantite(){ return 10000; }
            },
            effect: loc('tech_adamantite_shovel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        stone_axe: {
            id: 'tech-stone_axe',
            title: loc('tech_stone_axe'),
            desc: loc('tech_stone_axe_desc'),
            category: 'research',
            reqs: { primitive: 3 },
            grant: ['axe',1],
            not_trait: ['kindling_kindred','evil'],
            cost: {
                Knowledge(){ return 45; },
                Lumber(){ return 20; },
                Stone(){ return 20; }
            },
            effect: loc('tech_stone_axe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.civic.lumberjack.display = true;
                    global.city['lumber_yard'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        copper_axes: {
            id: 'tech-copper_axes',
            title: loc('tech_copper_axes'),
            desc: loc('tech_copper_axes_desc'),
            category: 'upgrade',
            reqs: { axe: 1, mining: 2 },
            grant: ['axe',2],
            cost: {
                Knowledge(){ return 540; },
                Copper(){ return 25; }
            },
            effect: loc('tech_copper_axes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        iron_saw: {
            id: 'tech-iron_saw',
            title: loc('tech_iron_saw'),
            desc: loc('tech_iron_saw_desc'),
            category: 'upgrade',
            reqs: { axe: 1, mining: 3 },
            grant: ['saw',1],
            cost: {
                Knowledge(){ return 3375; },
                Iron(){ return 400; }
            },
            effect: loc('tech_iron_saw_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_steel_saw'),
            desc: loc('tech_steel_saw_desc'),
            category: 'upgrade',
            reqs: { smelting: 2, saw: 1 },
            grant: ['saw',2],
            cost: {
                Knowledge(){ return 10800; },
                Steel(){ return 400; }
            },
            effect: loc('tech_steel_saw_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        iron_axes: {
            id: 'tech-iron_axes',
            title: loc('tech_iron_axes'),
            desc: loc('tech_iron_axes_desc'),
            category: 'upgrade',
            reqs: { axe: 2, mining: 3 },
            grant: ['axe',3],
            cost: {
                Knowledge(){ return 2700; },
                Iron(){ return 250; }
            },
            effect: loc('tech_iron_axes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_axes: {
            id: 'tech-steel_axes',
            title: loc('tech_steel_axes'),
            desc: loc('tech_steel_axes_desc'),
            category: 'upgrade',
            reqs: { axe: 3, smelting: 2 },
            grant: ['axe',4],
            cost: {
                Knowledge(){ return 9000; },
                Steel(){ return 250; }
            },
            effect: loc('tech_steel_axes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_axes: {
            id: 'tech-titanium_axes',
            title: loc('tech_titanium_axes'),
            desc: loc('tech_titanium_axes_desc'),
            category: 'upgrade',
            reqs: { axe: 4, high_tech: 3 },
            grant: ['axe',5],
            cost: {
                Knowledge(){ return 38000; },
                Titanium(){ return 350; }
            },
            effect: loc('tech_titanium_axes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        chainsaws: {
            id: 'tech-chainsaws',
            title: loc('tech_chainsaws'),
            desc: loc('tech_chainsaws_desc'),
            category: 'upgrade',
            reqs: { axe: 5, alpha: 2 },
            grant: ['axe',6],
            cost: {
                Knowledge(){ return 560000; },
                Oil(){ return 10000; },
                Adamantite(){ return 2000; },
            },
            effect: loc('tech_chainsaws_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            },
            flair(){ return `<div>${loc('tech_chainsaws_flair1')}</div><div>${loc('tech_chainsaws_flair2')}</div>`; }
        },
        copper_sledgehammer: {
            id: 'tech-copper_sledgehammer',
            title: loc('tech_copper_sledgehammer'),
            desc: loc('tech_copper_sledgehammer_desc'),
            category: 'upgrade',
            reqs: { mining: 2 },
            grant: ['hammer',1],
            cost: {
                Knowledge(){ return 540; },
                Copper(){ return 25; }
            },
            effect: loc('tech_copper_sledgehammer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        iron_sledgehammer: {
            id: 'tech-iron_sledgehammer',
            title: loc('tech_iron_sledgehammer'),
            desc: loc('tech_iron_sledgehammer_desc'),
            category: 'upgrade',
            reqs: { hammer: 1, mining: 3 },
            grant: ['hammer',2],
            cost: {
                Knowledge(){ return 2700; },
                Iron(){ return 250; }
            },
            effect: loc('tech_iron_sledgehammer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_sledgehammer: {
            id: 'tech-steel_sledgehammer',
            title: loc('tech_steel_sledgehammer'),
            desc: loc('tech_steel_sledgehammer_desc'),
            category: 'upgrade',
            reqs: { hammer: 2, smelting: 2 },
            grant: ['hammer',3],
            cost: {
                Knowledge(){ return 7200; },
                Steel(){ return 250; }
            },
            effect: loc('tech_steel_sledgehammer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_sledgehammer: {
            id: 'tech-titanium_sledgehammer',
            title: loc('tech_titanium_sledgehammer'),
            desc: loc('tech_titanium_sledgehammer_desc'),
            category: 'upgrade',
            reqs: { hammer: 3, high_tech: 3 },
            grant: ['hammer',4],
            cost: {
                Knowledge(){ return 40000; },
                Titanium(){ return 400; }
            },
            effect: loc('tech_titanium_sledgehammer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        copper_pickaxe: {
            id: 'tech-copper_pickaxe',
            title: loc('tech_copper_pickaxe'),
            desc: loc('tech_copper_pickaxe_desc'),
            category: 'upgrade',
            reqs: { mining: 2 },
            grant: ['pickaxe',1],
            cost: {
                Knowledge(){ return 675; },
                Copper(){ return 25; }
            },
            effect: loc('tech_copper_pickaxe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        iron_pickaxe: {
            id: 'tech-iron_pickaxe',
            title: loc('tech_iron_pickaxe'),
            desc: loc('tech_iron_pickaxe_desc'),
            category: 'upgrade',
            reqs: { pickaxe: 1, mining: 3 },
            grant: ['pickaxe',2],
            cost: {
                Knowledge(){ return 3200; },
                Iron(){ return 250; }
            },
            effect: loc('tech_iron_pickaxe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_pickaxe: {
            id: 'tech-steel_pickaxe',
            title: loc('tech_steel_pickaxe'),
            desc: loc('tech_steel_pickaxe_desc'),
            category: 'upgrade',
            reqs: { pickaxe: 2, smelting: 2},
            grant: ['pickaxe',3],
            cost: {
                Knowledge(){ return 9000; },
                Steel(){ return 250; }
            },
            effect: loc('tech_steel_pickaxe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        jackhammer: {
            id: 'tech-jackhammer',
            title: loc('tech_jackhammer'),
            desc: loc('tech_jackhammer_desc'),
            category: 'upgrade',
            reqs: { pickaxe: 3, high_tech: 2},
            grant: ['pickaxe',4],
            cost: {
                Knowledge(){ return 22500; },
                Copper(){ return 5000; }
            },
            effect: loc('tech_jackhammer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        jackhammer_mk2: {
            id: 'tech-jackhammer_mk2',
            title: loc('tech_jackhammer_mk2'),
            desc: loc('tech_jackhammer_mk2'),
            category: 'upgrade',
            reqs: { pickaxe: 4, high_tech: 4},
            grant: ['pickaxe',5],
            cost: {
                Knowledge(){ return 67500; },
                Titanium(){ return 2000; },
                Alloy(){ return 500; }
            },
            effect: loc('tech_jackhammer_mk2_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adamantite_hammer: {
            id: 'tech-adamantite_hammer',
            title: loc('tech_adamantite_hammer'),
            desc: loc('tech_adamantite_hammer'),
            category: 'upgrade',
            reqs: { pickaxe: 5, alpha: 2},
            grant: ['pickaxe',6],
            cost: {
                Knowledge(){ return 535000; },
                Adamantite(){ return 12500; }
            },
            effect: loc('tech_adamantite_hammer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        copper_hoe: {
            id: 'tech-copper_hoe',
            title: loc('tech_copper_hoe'),
            desc: loc('tech_copper_hoe_desc'),
            category: 'upgrade',
            reqs: { mining: 2, agriculture: 1 },
            grant: ['hoe',1],
            cost: {
                Knowledge(){ return 720; },
                Copper(){ return 50; }
            },
            effect: loc('tech_copper_hoe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        iron_hoe: {
            id: 'tech-iron_hoe',
            title: loc('tech_iron_hoe'),
            desc: loc('tech_iron_hoe_desc'),
            category: 'upgrade',
            reqs: { hoe: 1, mining: 3, agriculture: 1 },
            grant: ['hoe',2],
            cost: {
                Knowledge(){ return 3600; },
                Iron(){ return 500; }
            },
            effect: loc('tech_iron_hoe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_hoe: {
            id: 'tech-steel_hoe',
            title: loc('tech_steel_hoe'),
            desc: loc('tech_steel_hoe_desc'),
            category: 'upgrade',
            reqs: { hoe: 2, smelting: 2, agriculture: 1 },
            grant: ['hoe',3],
            cost: {
                Knowledge(){ return 12600; },
                Steel(){ return 500; }
            },
            effect: loc('tech_steel_hoe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_hoe: {
            id: 'tech-titanium_hoe',
            title: loc('tech_titanium_hoe'),
            desc: loc('tech_titanium_hoe_desc'),
            category: 'upgrade',
            reqs: { hoe: 3, high_tech: 3, agriculture: 1 },
            grant: ['hoe',4],
            cost: {
                Knowledge(){ return 44000; },
                Titanium(){ return 500; }
            },
            effect: loc('tech_titanium_hoe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adamantite_hoe: {
            id: 'tech-adamantite_hoe',
            title: loc('tech_adamantite_hoe'),
            desc: loc('tech_adamantite_hoe_desc'),
            category: 'upgrade',
            reqs: { hoe: 4, alpha: 2 },
            grant: ['hoe',5],
            cost: {
                Knowledge(){ return 530000; },
                Adamantite(){ return 1000; }
            },
            effect: loc('tech_adamantite_hoe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        slave_pens: {
            id: 'tech-slave_pens',
            title: loc('tech_slave_pens'),
            desc: loc('tech_slave_pens'),
            category: 'research',
            reqs: { military: 1, mining: 1 },
            grant: ['slaves',1],
            trait: ['slaver'],
            cost: {
                Knowledge(){ return 150; }
            },
            effect: loc('tech_slave_pens_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['slave_pen'] = { count: 0, slaves: 0 };
                    return true;
                }
                return false;
            }
        },
        slave_market: {
            id: 'tech-slave_market',
            title: loc('tech_slave_market'),
            desc: loc('tech_slave_market'),
            category: 'research',
            reqs: { slaves: 1, high_tech: 1 },
            grant: ['slaves',2],
            trait: ['slaver'],
            cost: {
                Knowledge(){ return 8000; }
            },
            effect: loc('tech_slave_market_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        ceremonial_dagger: {
            id: 'tech-ceremonial_dagger',
            title: loc('tech_ceremonial_dagger'),
            desc: loc('tech_ceremonial_dagger'),
            category: 'upgrade',
            reqs: { mining: 1 },
            grant: ['sacrifice',1],
            trait: ['cannibalize'],
            cost: { 
                Knowledge(){ return 60; }
            },
            effect: loc('tech_ceremonial_dagger_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        last_rites: {
            id: 'tech-last_rites',
            title: loc('tech_last_rites'),
            desc: loc('tech_last_rites'),
            category: 'upgrade',
            reqs: { sacrifice: 1, theology: 2 },
            grant: ['sacrifice',2],
            trait: ['cannibalize'],
            cost: { 
                Knowledge(){ return 1000; }
            },
            effect: loc('tech_last_rites_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        ancient_infusion: {
            id: 'tech-ancient_infusion',
            title: loc('tech_ancient_infusion'),
            desc: loc('tech_ancient_infusion'),
            category: 'upgrade',
            reqs: { sacrifice: 2, theology: 4 },
            grant: ['sacrifice',3],
            trait: ['cannibalize'],
            cost: { 
                Knowledge(){ return 182000; }
            },
            effect: loc('tech_ancient_infusion_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        garrison: {
            id: 'tech-garrison',
            title: loc('tech_garrison'),
            desc: loc('tech_garrison_desc'),
            category: 'research',
            reqs: { science: 1, housing: 1 },
            grant: ['military',1],
            cost: {
                Knowledge(){ return 70; }
            },
            effect: loc('tech_garrison_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['garrison'] = { count: 0 };
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    $('#garrison').empty();
                    $('#c_garrison').empty();
                    buildGarrison($('#garrison'),true);
                    buildGarrison($('#c_garrison'),false);
                    return true;
                }
                return false;
            }
        },
        mercs: {
            id: 'tech-mercs',
            title: loc('tech_mercs'),
            desc: loc('tech_mercs_desc'),
            category: 'research',
            reqs: { military: 1 },
            grant: ['mercs',1],
            cost: {
                Money(){ return 10000 },
                Knowledge(){ return 4500; }
            },
            effect: loc('tech_mercs_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.civic.garrison['mercs'] = true;
                    return true;
                }
                return false;
            }
        },
        signing_bonus: {
            id: 'tech-signing_bonus',
            title: loc('tech_signing_bonus'),
            desc: loc('tech_signing_bonus_desc'),
            category: 'upgrade',
            reqs: { mercs: 1, high_tech: 3 },
            grant: ['mercs',2],
            cost: {
                Money(){ return 50000 },
                Knowledge(){ return 32000; }
            },
            effect: loc('tech_signing_bonus_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        hospital: {
            id: 'tech-hospital',
            title: loc('tech_hospital'),
            desc: loc('tech_hospital'),
            category: 'research',
            reqs: { military: 1, alumina: 1 },
            grant: ['medic',1],
            cost: {
                Knowledge(){ return 5000; }
            },
            effect: loc('tech_hospital_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['hospital'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        bac_tanks: {
            id: 'tech-bac_tanks',
            title: loc('tech_bac_tanks'),
            desc: loc('tech_bac_tanks_desc'),
            category: 'upgrade',
            reqs: { medic: 1, infernite: 1 },
            grant: ['medic',2],
            cost: {
                Knowledge(){ return 600000; },
                Infernite(){ return 250; }
            },
            effect: loc('tech_bac_tanks_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        boot_camp: {
            id: 'tech-boot_camp',
            title: loc('tech_boot_camp'),
            desc: loc('tech_boot_camp_desc'),
            category: 'research',
            reqs: { high_tech: 1 },
            grant: ['boot_camp',1],
            cost: {
                Knowledge(){ return 8000; }
            },
            effect: loc('tech_boot_camp_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['boot_camp'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        vr_training: {
            id: 'tech-vr_training',
            title: loc('tech_vr_training'),
            desc: loc('tech_vr_training'),
            category: 'upgrade',
            reqs: { boot_camp: 1, high_tech: 12 },
            grant: ['boot_camp',2],
            cost: {
                Knowledge(){ return 625000; }
            },
            effect(){ return loc('tech_vr_training_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        bows: {
            id: 'tech-bows',
            title: loc('tech_bows'),
            desc: loc('tech_bows_desc'),
            category: 'upgrade',
            reqs: { military: 1 },
            grant: ['military',2],
            cost: {
                Knowledge(){ return 225; },
                Lumber(){ return 250; }
            },
            effect: loc('tech_bows_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    return true;
                }
                return false;
            }
        },
        flintlock_rifle: {
            id: 'tech-flintlock_rifle',
            title: loc('tech_flintlock_rifle'),
            desc: loc('tech_flintlock_rifle'),
            category: 'upgrade',
            reqs: { military: 2, explosives: 1 },
            grant: ['military',3],
            cost: {
                Knowledge(){ return 5400; },
                Coal(){ return 750; }
            },
            effect: loc('tech_flintlock_rifle_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    return true;
                }
                return false;
            }
        },
        machine_gun: {
            id: 'tech-machine_gun',
            title: loc('tech_machine_gun'),
            desc: loc('tech_machine_gun'),
            category: 'upgrade',
            reqs: { military: 3, oil: 1 },
            grant: ['military',4],
            cost: {
                Knowledge(){ return 33750; },
                Oil(){ return 1500; }
            },
            effect: loc('tech_machine_gun_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    return true;
                }
                return false;
            }
        },
        bunk_beds: {
            id: 'tech-bunk_beds',
            title: loc('tech_bunk_beds'),
            desc: loc('tech_bunk_beds'),
            category: 'upgrade',
            reqs: { military: 4, high_tech: 4 },
            grant: ['military',5],
            cost: {
                Knowledge(){ return 76500; },
                Furs(){ return 25000; },
                Alloy(){ return 3000; }
            },
            effect: loc('tech_bunk_beds_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        rail_guns: {
            id: 'tech-rail_guns',
            title: loc('tech_rail_guns'),
            desc: loc('tech_rail_guns'),
            category: 'upgrade',
            reqs: { military: 5, mass: 1 },
            grant: ['military',6],
            cost: {
                Knowledge(){ return 200000; },
                Iridium(){ return 2500; }
            },
            effect: loc('tech_rail_guns_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    return true;
                }
                return false;
            }
        },
        laser_rifles: {
            id: 'tech-laser_rifles',
            title: loc('tech_laser_rifles'),
            desc: loc('tech_laser_rifles'),
            category: 'upgrade',
            reqs: { military: 6, high_tech: 9, elerium: 1 },
            grant: ['military',7],
            cost: {
                Knowledge(){ return 325000; },
                Elerium(){ return 250; }
            },
            effect: loc('tech_laser_rifles_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    if (global.race.species === 'sharkin'){
                        unlockAchieve('laser_shark');
                    }
                    return true;
                }
                return false;
            }
        },
        plasma_rifles: {
            id: 'tech-plasma_rifles',
            title: loc('tech_plasma_rifles'),
            desc: loc('tech_plasma_rifles'),
            category: 'upgrade',
            reqs: { military: 7, high_tech: 13 },
            grant: ['military',8],
            cost: {
                Knowledge(){ return 780000; },
                Elerium(){ return 500; }
            },
            effect: loc('tech_plasma_rifles_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    return true;
                }
                return false;
            }
        },
        disruptor_rifles: {
            id: 'tech-disruptor_rifles',
            title: loc('tech_disruptor_rifles'),
            desc: loc('tech_disruptor_rifles'),
            category: 'upgrade',
            reqs: { military: 8, high_tech: 14, science: 15, infernite: 1 },
            grant: ['military',9],
            cost: {
                Knowledge(){ return 1000000; },
                Infernite(){ return 1000; }
            },
            effect: loc('tech_disruptor_rifles_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    return true;
                }
                return false;
            }
        },
        space_marines: {
            id: 'tech-space_marines',
            title: loc('tech_space_marines'),
            desc: loc('tech_space_marines_desc'),
            category: 'research',
            reqs: { space: 3, mars: 2 },
            grant: ['marines',1],
            cost: {
                Knowledge(){ return 210000; }
            },
            effect(){ return `<div>${loc('tech_space_marines_effect1')}</div><div>${loc('tech_space_marines_effect2',[races[global.race.species].solar.red])}</div>` },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['space_barracks'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            },
            flair: 'Outer space treaty be damned.'
        },
        cruiser: {
            id: 'tech-cruiser',
            title: loc('tech_cruiser'),
            desc: loc('tech_cruiser'),
            category: 'research',
            reqs: { high_tech: 14, proxima: 2, aerogel: 1 },
            grant: ['cruiser',1],
            cost: {
                Knowledge(){ return 860000; },
            },
            effect: loc('tech_cruiser_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['cruiser'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        armor: {
            id: 'tech-armor',
            title: loc('tech_armor'),
            desc: loc('tech_armor_desc'),
            category: 'upgrade',
            reqs: { military: 1 },
            not_trait: ['apex_predator'],
            grant: ['armor',1],
            cost: {
                Money(){ return 250; },
                Knowledge(){ return 225; },
                Furs(){ return 250; }
            },
            effect: loc('tech_armor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        plate_armor: {
            id: 'tech-plate_armor',
            title: loc('tech_plate_armor'),
            desc: loc('tech_plate_armor_desc'),
            category: 'upgrade',
            reqs: { armor: 1, mining: 3 },
            grant: ['armor',2],
            cost: {
                Knowledge(){ return 3400; },
                Iron(){ return 600; },
            },
            effect: loc('tech_plate_armor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        kevlar: {
            id: 'tech-kevlar',
            title: loc('tech_kevlar'),
            desc: loc('tech_kevlar_desc'),
            category: 'upgrade',
            reqs: { armor: 2, polymer: 1 },
            grant: ['armor',3],
            cost: {
                Knowledge(){ return 86000; },
                Polymer(){ return 750; },
            },
            effect: loc('tech_kevlar_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        laser_turret: {
            id: 'tech-laser_turret',
            title: loc('tech_laser_turret'),
            desc: loc('tech_laser_turret'),
            category: 'upgrade',
            reqs: { high_tech: 9, portal: 2 },
            grant: ['turret',1],
            cost: {
                Knowledge(){ return 600000; },
                Elerium(){ return 100; }
            },
            effect(){ return `<div>${loc('tech_laser_turret_effect1')}</div><div class="has-text-special">${loc('tech_laser_turret_effect2')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#fort`},'update');
                    return true;
                }
                return false;
            }
        },
        plasma_turret: {
            id: 'tech-plasma_turret',
            title: loc('tech_plasma_turret'),
            desc: loc('tech_plasma_turret'),
            category: 'upgrade',
            reqs: { high_tech: 13, turret: 1 },
            grant: ['turret',2],
            cost: {
                Knowledge(){ return 760000; },
                Elerium(){ return 350; }
            },
            effect(){ return `<div>${loc('tech_plasma_turret_effect')}</div><div class="has-text-special">${loc('tech_laser_turret_effect2')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#fort`},'update');
                    return true;
                }
                return false;
            }
        },
        black_powder: {
            id: 'tech-black_powder',
            title: loc('tech_black_powder'),
            desc: loc('tech_black_powder_desc'),
            category: 'research',
            reqs: { mining: 4 },
            grant: ['explosives',1],
            cost: {
                Knowledge(){ return 4500; },
                Coal(){ return 500; }
            },
            effect: loc('tech_black_powder_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        dynamite: {
            id: 'tech-dynamite',
            title: loc('tech_dynamite'),
            desc: loc('tech_dynamite'),
            category: 'research',
            reqs: { explosives: 1 },
            grant: ['explosives',2],
            cost: {
                Knowledge(){ return 4800; },
                Coal(){ return 750; }
            },
            effect: loc('tech_dynamite_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        anfo: {
            id: 'tech-anfo',
            title: loc('tech_anfo'),
            desc: loc('tech_anfo'),
            category: 'upgrade',
            reqs: { explosives: 2, oil: 1 },
            grant: ['explosives',3],
            cost: {
                Knowledge(){ return 42000; },
                Oil(){ return 2500; }
            },
            effect: loc('tech_anfo_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mad: {
            id: 'tech-mad',
            title: loc('tech_mad'),
            desc: loc('tech_mad_desc'),
            category: 'research',
            reqs: { uranium: 1, explosives: 3, high_tech: 7 },
            grant: ['mad',1],
            cost: {
                Knowledge(){ return 120000; },
                Oil(){ return 8500; },
                Uranium(){ return 1250; }
            },
            effect: loc('tech_mad_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.civic.mad.display = true;
                    return true;
                }
                return false;
            }
        },
        cement: {
            id: 'tech-cement',
            title: loc('tech_cement'),
            desc: loc('tech_cement_desc'),
            category: 'research',
            reqs: { mining: 1, storage: 1, science: 1 },
            grant: ['cement',1],
            cost: {
                Knowledge(){ return 500; }
            },
            effect: loc('tech_cement_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_rebar'),
            desc: loc('tech_rebar'),
            category: 'upgrade',
            reqs: { mining: 3, cement: 1 },
            grant: ['cement',2],
            cost: {
                Knowledge(){ return 3200; },
                Iron(){ return 750; }
            },
            effect: loc('tech_rebar_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_rebar: {
            id: 'tech-steel_rebar',
            title: loc('tech_steel_rebar'),
            desc: loc('tech_steel_rebar'),
            category: 'upgrade',
            reqs: { smelting: 2, cement: 2 },
            grant: ['cement',3],
            cost: {
                Knowledge(){ return 6750; },
                Steel(){ return 750; }
            },
            effect: loc('tech_steel_rebar_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        portland_cement: {
            id: 'tech-portland_cement',
            title: loc('tech_portland_cement'),
            desc: loc('tech_portland_cement'),
            category: 'upgrade',
            reqs: { cement: 3, high_tech: 3 },
            grant: ['cement',4],
            cost: {
                Knowledge(){ return 32000; }
            },
            effect: loc('tech_portland_cement_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        screw_conveyor: {
            id: 'tech-screw_conveyor',
            title: loc('tech_screw_conveyor'),
            desc: loc('tech_screw_conveyor'),
            category: 'upgrade',
            reqs: { cement: 4, high_tech: 4 },
            grant: ['cement',5],
            cost: {
                Knowledge(){ return 72000; }
            },
            effect: loc('tech_screw_conveyor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adamantite_screws: {
            id: 'tech-adamantite_screws',
            title: loc('tech_adamantite_screws'),
            desc: loc('tech_adamantite_screws'),
            category: 'upgrade',
            reqs: { cement: 5, alpha: 2 },
            grant: ['cement',6],
            cost: {
                Knowledge(){ return 500000; },
                Adamantite(){ return 10000; }
            },
            effect: loc('tech_adamantite_screws_effect',[3]),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        hunter_process: {
            id: 'tech-hunter_process',
            title: loc('tech_hunter_process'),
            desc: loc('tech_hunter_process'),
            category: 'research',
            reqs: { high_tech: 3, smelting: 2 },
            grant: ['titanium',1],
            cost: {
                Knowledge(){ return 45000; },
                Titanium(){ return 1000; }
            },
            effect: loc('tech_hunter_process_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Titanium.value = resource_values['Titanium'];
                    return true;
                }
                return false;
            }
        },
        kroll_process: {
            id: 'tech-kroll_process',
            title: loc('tech_kroll_process'),
            desc: loc('tech_kroll_process'),
            category: 'upgrade',
            reqs: { titanium: 1, high_tech: 4 },
            grant: ['titanium',2],
            cost: {
                Knowledge(){ return 78000; },
                Titanium(){ return 10000; }
            },
            effect: loc('tech_kroll_process_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        cambridge_process: {
            id: 'tech-cambridge_process',
            title: loc('tech_cambridge_process'),
            desc: loc('tech_cambridge_process'),
            category: 'upgrade',
            reqs: { titanium: 2, supercollider: 1 },
            grant: ['titanium',3],
            cost: {
                Knowledge(){ return 135000; },
                Titanium(){ return 17500; }
            },
            effect: loc('tech_cambridge_process_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        pynn_partical: {
            id: 'tech-pynn_partical',
            title: loc('tech_pynn_partical'),
            desc: loc('tech_pynn_partical'),
            category: 'research',
            reqs: { supercollider: 1 },
            grant: ['particles',1],
            cost: {
                Knowledge(){ return 100000; }
            },
            effect: loc('tech_pynn_partical_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        matter_compression: {
            id: 'tech-matter_compression',
            title: loc('tech_matter_compression'),
            desc: loc('tech_matter_compression'),
            category: 'upgrade',
            reqs: { particles: 1 },
            grant: ['particles',2],
            cost: {
                Knowledge(){ return 112500; }
            },
            effect: loc('tech_matter_compression_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        higgs_boson: {
            id: 'tech-higgs_boson',
            title: loc('tech_higgs_boson'),
            desc: loc('tech_higgs_boson'),
            category: 'upgrade',
            reqs: { particles: 2, supercollider: 2 },
            grant: ['particles',3],
            cost: {
                Knowledge(){ return 125000; }
            },
            effect: loc('tech_higgs_boson_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        dimensional_compression: {
            id: 'tech-dimensional_compression',
            title: loc('tech_dimensional_compression'),
            desc: loc('tech_dimensional_compression'),
            category: 'upgrade',
            reqs: { particles: 3, science: 11, supercollider: 3 },
            grant: ['particles',4],
            cost: {
                Knowledge(){ return 425000; }
            },
            effect: loc('tech_dimensional_compression_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        theology: {
            id: 'tech-theology',
            title: loc('tech_theology'),
            desc: loc('tech_theology'),
            category: 'research',
            reqs: { theology: 1, housing: 1, cement: 1 },
            grant: ['theology',2],
            cost: {
                Knowledge(){ return 900; }
            },
            effect: loc('tech_theology_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['temple'] = { count: 0 };
                    if (global.race['magnificent']){
                        global.city['shrine'] = {
                            count: 0,
                            morale: 0,
                            metal: 0,
                            know: 0,
                            tax: 0
                        };
                    }
                    return true;
                }
                return false;
            }
        },
        fanaticism: {
            id: 'tech-fanaticism',
            title: loc('tech_fanaticism'),
            desc: loc('tech_fanaticism'),
            category: 'research',
            reqs: { theology: 2 },
            grant: ['theology',3],
            not_gene: ['transcendence'],
            cost: {
                Knowledge(){ return 2500; }
            },
            effect: `<div>${loc('tech_fanaticism_effect')}</div><div class="has-text-special">${loc('tech_fanaticism_warning')}</div>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    global.tech['fanaticism'] = 1;
                    if (global.race.gods === global.race.species){
                        unlockAchieve(`second_evolution`);
                    }
                    fanaticism(global.race.gods);
                    return true;
                }
                return false;
            }
        },
        alt_fanaticism: {
            id: 'tech-alt_fanaticism',
            title: loc('tech_fanaticism'),
            desc: loc('tech_fanaticism'),
            category: 'research',
            reqs: { theology: 2 },
            grant: ['fanaticism',1],
            gene: ['transcendence'],
            cost: {
                Knowledge(){ return 2500; }
            },
            effect: `<div>${loc('tech_fanaticism_effect')}</div>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.tech['theology'] === 2){
                        global.tech['theology'] = 3;
                    }
                    if (global.race.gods === global.race.species){
                        unlockAchieve(`second_evolution`);
                    }
                    fanaticism(global.race.gods);
                    return true;
                }
                return false;
            }
        },
        ancient_theology: {
            id: 'tech-ancient_theology',
            title: loc('tech_ancient_theology'),
            desc: loc('tech_ancient_theology'),
            category: 'research',
            reqs: { theology: 3, mars: 2 },
            grant: ['theology',4],
            cost: {
                Knowledge(){ return 180000; }
            },
            effect(){ return loc('tech_ancient_theology_effect',[races[global.race.old_gods.toLowerCase()].entity,races[global.race.gods.toLowerCase()].entity]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['ziggurat'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        study: {
            id: 'tech-study',
            title: loc('tech_study'),
            desc: loc('tech_study_desc'),
            category: 'research',
            reqs: { theology: 4 },
            grant: ['theology',5],
            cost: {
                Knowledge(){ return 195000; }
            },
            effect(){ return `<div>${loc('tech_study_effect',[races[global.race.old_gods.toLowerCase()].entity])}</div><div class="has-text-special">${loc('tech_study_warning')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.tech['ancient_study'] = 1;
                    return true;
                }
                return false;
            }
        },
        deify: {
            id: 'tech-deify',
            title: loc('tech_deify'),
            desc: loc('tech_deify_desc'),
            category: 'research',
            reqs: { theology: 4 },
            grant: ['theology',5],
            cost: {
                Knowledge(){ return 195000; }
            },
            effect(){ return `<div>${loc('tech_deify_effect',[races[global.race.old_gods.toLowerCase()].entity])}</div><div class="has-text-special">${loc('tech_deify_warning')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.tech['ancient_deify'] = 1;
                    fanaticism(global.race.old_gods);
                    return true;
                }
                return false;
            }
        },
        indoctrination: {
            id: 'tech-indoctrination',
            title: loc('tech_indoctrination'),
            desc: loc('tech_indoctrination'),
            category: 'upgrade',
            reqs: { fanaticism: 1 },
            grant: ['fanaticism',2],
            cost: {
                Knowledge(){ return 5000; }
            },
            effect: loc('tech_indoctrination_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        missionary: {
            id: 'tech-missionary',
            title: loc('tech_missionary'),
            desc: loc('tech_missionary'),
            category: 'upgrade',
            reqs: { fanaticism: 2 },
            grant: ['fanaticism',3],
            cost: {
                Knowledge(){ return 10000; }
            },
            effect: loc('tech_missionary_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        zealotry: {
            id: 'tech-zealotry',
            title: loc('tech_zealotry'),
            desc: loc('tech_zealotry'),
            category: 'upgrade',
            reqs: { fanaticism: 3 },
            grant: ['fanaticism',4],
            cost: {
                Knowledge(){ return 25000; }
            },
            effect: loc('tech_zealotry_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        anthropology: {
            id: 'tech-anthropology',
            title: loc('tech_anthropology'),
            desc: loc('tech_anthropology'),
            category: 'research',
            reqs: { theology: 2 },
            grant: ['theology',3],
            not_gene: ['transcendence'],
            cost: {
                Knowledge(){ return 2500; }
            },
            effect: `<div>${loc('tech_anthropology_effect')}</div><div class="has-text-special">${loc('tech_anthropology_warning')}</div>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    global.tech['anthropology'] = 1;
                    return true;
                }
                return false;
            }
        },
        alt_anthropology: {
            id: 'tech-alt_anthropology',
            title: loc('tech_anthropology'),
            desc: loc('tech_anthropology'),
            category: 'research',
            reqs: { theology: 2 },
            grant: ['anthropology',1],
            gene: ['transcendence'],
            cost: {
                Knowledge(){ return 2500; }
            },
            effect: `<div>${loc('tech_anthropology_effect')}</div>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.tech['theology'] === 2){
                        global.tech['theology'] = 3;
                    }
                    return true;
                }
                return false;
            }
        },
        mythology: {
            id: 'tech-mythology',
            title: loc('tech_mythology'),
            desc: loc('tech_mythology'),
            category: 'upgrade',
            reqs: { anthropology: 1 },
            grant: ['anthropology',2],
            cost: {
                Knowledge(){ return 5000; }
            },
            effect: loc('tech_mythology_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        archaeology: {
            id: 'tech-archaeology',
            title: loc('tech_archaeology'),
            desc: loc('tech_archaeology'),
            category: 'upgrade',
            reqs: { anthropology: 2 },
            grant: ['anthropology',3],
            cost: {
                Knowledge(){ return 10000; }
            },
            effect: loc('tech_archaeology_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        merchandising: {
            id: 'tech-merchandising',
            title: loc('tech_merchandising'),
            desc: loc('tech_merchandising'),
            category: 'upgrade',
            reqs: { anthropology: 3 },
            grant: ['anthropology',4],
            cost: {
                Knowledge(){ return 25000; }
            },
            effect: loc('tech_merchandising_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        astrophysics: {
            id: 'tech-astrophysics',
            title: loc('tech_astrophysics'),
            desc: loc('tech_astrophysics_desc'),
            category: 'research',
            reqs: { space: 2 },
            grant: ['space_explore',1],
            cost: {
                Knowledge(){ return 125000; }
            },
            effect: loc('tech_astrophysics_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['propellant_depot'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        rover: {
            id: 'tech-rover',
            title: loc('tech_rover'),
            desc: loc('tech_rover'),
            category: 'research',
            reqs: { space_explore: 1 },
            grant: ['space_explore',2],
            cost: {
                Knowledge(){ return 135000; },
                Alloy(){ return 22000 },
                Polymer(){ return 18000 },
                Uranium(){ return 750 }
            },
            effect: loc('tech_rover_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_probes'),
            desc: loc('tech_probes'),
            category: 'research',
            reqs: { space_explore: 2 },
            grant: ['space_explore',3],
            cost: {
                Knowledge(){ return 168000; },
                Steel(){ return 100000 },
                Iridium(){ return 5000 },
                Uranium(){ return 2250 },
                Helium_3(){ return 3500 }
            },
            effect: loc('tech_probes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_starcharts'),
            desc: loc('tech_starcharts'),
            category: 'research',
            reqs: { space_explore: 3, science: 9 },
            grant: ['space_explore',4],
            cost: {
                Knowledge(){ return 185000; }
            },
            effect: loc('tech_starcharts_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_colonization'),
            desc(){ return loc('tech_colonization_desc',[races[global.race.species].solar.red]); },
            category: 'research',
            reqs: { space: 4, mars: 1 },
            grant: ['mars',2],
            cost: {
                Knowledge(){ return 172000; }
            },
            effect(){ return loc('tech_colonization_effect',[races[global.race.species].solar.red]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['biodome'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        red_tower: {
            id: 'tech-red_tower',
            title(){ return loc('tech_red_tower',[races[global.race.species].solar.red]); },
            desc(){ return loc('tech_red_tower',[races[global.race.species].solar.red]); },
            category: 'research',
            reqs: { mars: 2 },
            grant: ['mars',3],
            cost: {
                Knowledge(){ return 195000; }
            },
            effect(){ return loc('tech_red_tower_effect',[races[global.race.species].solar.red]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['red_tower'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        space_manufacturing: {
            id: 'tech-space_manufacturing',
            title: loc('tech_space_manufacturing'),
            desc: loc('tech_space_manufacturing_desc'),
            category: 'research',
            reqs: { mars: 3 },
            grant: ['mars',4],
            cost: {
                Knowledge(){ return 220000; }
            },
            effect(){ return loc('tech_space_manufacturing_effect',[races[global.race.species].solar.red]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['red_factory'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        exotic_lab: {
            id: 'tech-energy_lab',
            title: loc('tech_exotic_lab'),
            desc: loc('tech_exotic_lab_desc'),
            category: 'research',
            reqs: { mars: 4, asteroid: 5 },
            grant: ['mars',5],
            cost: {
                Knowledge(){ return 250000; }
            },
            effect: loc('tech_exotic_lab_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['exotic_lab'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        dyson_sphere: {
            id: 'tech-dyson_sphere',
            title: loc('tech_dyson_sphere'),
            desc: loc('tech_dyson_sphere'),
            category: 'research',
            reqs: { solar: 1 },
            grant: ['solar',2],
            cost: {
                Knowledge(){ return 195000; }
            },
            effect: loc('tech_dyson_sphere_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        dyson_swarm: {
            id: 'tech-dyson_swarm',
            title: loc('tech_dyson_swarm'),
            desc: loc('tech_dyson_swarm'),
            category: 'research',
            reqs: { solar: 2 },
            grant: ['solar',3],
            cost: {
                Knowledge(){ return 210000; }
            },
            effect: loc('tech_dyson_swarm_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['swarm_satellite'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        swarm_plant: {
            id: 'tech-swarm_plant',
            title: loc('tech_swarm_plant'),
            desc: loc('tech_swarm_plant'),
            category: 'research',
            reqs: { solar: 3, hell: 1, gas_moon: 1 },
            grant: ['solar',4],
            cost: {
                Knowledge(){ return 250000; }
            },
            effect(){ return loc('tech_swarm_plant_effect',[races[global.race.species].home,races[global.race.species].solar.hell]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['swarm_plant'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        space_sourced: {
            id: 'tech-space_sourced',
            title: loc('tech_space_sourced'),
            desc: loc('tech_space_sourced_desc'),
            category: 'research',
            reqs: { solar: 4, asteroid: 3 },
            grant: ['solar',5],
            cost: {
                Knowledge(){ return 300000; }
            },
            effect: loc('tech_space_sourced_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        swarm_plant_ai: {
            id: 'tech-swarm_plant_ai',
            title: loc('tech_swarm_plant_ai'),
            desc: loc('tech_swarm_plant_ai'),
            category: 'upgrade',
            reqs: { solar: 4, high_tech: 10 },
            grant: ['swarm',1],
            cost: {
                Knowledge(){ return 335000; }
            },
            effect: loc('tech_swarm_plant_ai_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        swarm_control_ai: {
            id: 'tech-swarm_control_ai',
            title: loc('tech_swarm_control_ai'),
            desc: loc('tech_swarm_control_ai'),
            category: 'upgrade',
            reqs: { swarm: 1 },
            grant: ['swarm',2],
            cost: {
                Knowledge(){ return 360000; }
            },
            effect: loc('tech_swarm_control_ai_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        quantum_swarm: {
            id: 'tech-quantum_swarm',
            title: loc('tech_quantum_swarm'),
            desc: loc('tech_quantum_swarm'),
            category: 'upgrade',
            reqs: { swarm: 2, high_tech: 11 },
            grant: ['swarm',3],
            cost: {
                Knowledge(){ return 450000; }
            },
            effect: loc('tech_quantum_swarm_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        perovskite_cell: {
            id: 'tech-perovskite_cell',
            title: loc('tech_perovskite_cell'),
            desc: loc('tech_perovskite_cell'),
            category: 'upgrade',
            reqs: { swarm: 3 },
            grant: ['swarm',4],
            cost: {
                Knowledge(){ return 525000; },
                Titanium(){ return 100000; }
            },
            effect: loc('tech_perovskite_cell_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        swarm_convection: {
            id: 'tech-swarm_convection',
            title: loc('tech_swarm_convection'),
            desc: loc('tech_swarm_convection'),
            category: 'upgrade',
            reqs: { swarm: 4, stanene: 1 },
            grant: ['swarm',5],
            cost: {
                Knowledge(){ return 725000; },
                Stanene(){ return 100000; }
            },
            effect: loc('tech_swarm_convection_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        dyson_net: {
            id: 'tech-dyson_net',
            title: loc('tech_dyson_net'),
            desc: loc('tech_dyson_net'),
            category: 'research',
            reqs: { solar: 3, proxima: 2, stanene: 1 },
            grant: ['proxima',3],
            cost: {
                Knowledge(){ return 800000; }
            },
            effect: loc('tech_dyson_net_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['dyson'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        gps: {
            id: 'tech-gps',
            title: loc('tech_gps'),
            desc: loc('tech_gps'),
            category: 'research',
            reqs: { space_explore: 1 },
            not_trait: ['terrifying'],
            grant: ['satellite',1],
            cost: {
                Knowledge(){ return 150000; }
            },
            effect: loc('tech_gps_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['gps'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        nav_beacon: {
            id: 'tech-nav_beacon',
            title: loc('tech_nav_beacon'),
            desc: loc('tech_nav_beacon'),
            category: 'research',
            reqs: { luna: 1 },
            grant: ['luna',2],
            cost: {
                Knowledge(){ return 180000; }
            },
            effect: loc('tech_nav_beacon_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['nav_beacon'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        subspace_signal: {
            id: 'tech-subspace_signal',
            title: loc('tech_subspace_signal'),
            desc: loc('tech_subspace_signal'),
            category: 'upgrade',
            reqs: { science: 13, luna: 2, stanene: 1 },
            grant: ['luna',3],
            cost: {
                Knowledge(){ return 700000; },
                Stanene(){ return 125000; }
            },
            effect(){ return loc('tech_subspace_signal_effect',[races[global.race.species].solar.red]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        atmospheric_mining: {
            id: 'tech-atmospheric_mining',
            title: loc('tech_atmospheric_mining'),
            desc: loc('tech_atmospheric_mining'),
            category: 'research',
            reqs: { space: 5 },
            grant: ['gas_giant',1],
            cost: {
                Knowledge(){ return 190000; }
            },
            effect: loc('tech_atmospheric_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['gas_mining'] = { count: 0, on: 0 };
                    global.space['gas_storage'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        helium_attractor: {
            id: 'tech-helium_attractor',
            title: loc('tech_helium_attractor'),
            desc: loc('tech_helium_attractor'),
            category: 'upgrade',
            reqs: { gas_giant: 1, elerium: 1 },
            grant: ['helium',1],
            cost: {
                Knowledge(){ return 290000; },
                Elerium(){ return 250; }
            },
            effect(){ return loc('tech_helium_attractor_effect',[races[global.race.species].solar.gas]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        ram_scoops: {
            id: 'tech-ram_scoops',
            title: loc('tech_ram_scoops'),
            desc: loc('tech_ram_scoops'),
            category: 'research',
            reqs: { nebula: 2 },
            grant: ['ram_scoop',1],
            cost: {
                Knowledge(){ return 580000; }
            },
            effect(){ return loc('tech_ram_scoops_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        elerium_prospecting: {
            id: 'tech-elerium_prospecting',
            title: loc('tech_elerium_prospecting'),
            desc: loc('tech_elerium_prospecting'),
            category: 'research',
            reqs: { nebula: 2 },
            grant: ['nebula',3],
            cost: {
                Knowledge(){ return 610000; }
            },
            effect(){ return loc('tech_elerium_prospecting_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['elerium_prospector'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        zero_g_mining: {
            id: 'tech-zero_g_mining',
            title: loc('tech_zero_g_mining'),
            desc: loc('tech_zero_g_mining'),
            category: 'research',
            reqs: { asteroid: 1, high_tech: 8 },
            grant: ['asteroid',2],
            cost: {
                Knowledge(){ return 210000; }
            },
            effect: loc('tech_zero_g_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_elerium_mining'),
            desc: loc('tech_elerium_mining'),
            category: 'research',
            reqs: { asteroid: 4 },
            grant: ['asteroid',5],
            cost: {
                Knowledge(){ return 235000; },
                Elerium(){ return 1; }
            },
            effect: loc('tech_elerium_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['elerium_ship'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        laser_mining: {
            id: 'tech-laser_mining',
            title: loc('tech_laser_mining'),
            desc: loc('tech_laser_mining'),
            category: 'upgrade',
            reqs: { asteroid: 5, elerium: 1, high_tech: 9 },
            grant: ['asteroid',6],
            cost: {
                Knowledge(){ return 350000; },
            },
            effect: loc('tech_laser_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        plasma_mining: {
            id: 'tech-plasma_mining',
            title: loc('tech_plasma_mining'),
            desc: loc('tech_plasma_mining'),
            category: 'upgrade',
            reqs: { asteroid: 6, high_tech: 13 },
            grant: ['asteroid',7],
            cost: {
                Knowledge(){ return 825000; },
            },
            effect: loc('tech_plasma_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        elerium_tech: {
            id: 'tech-elerium_tech',
            title: loc('tech_elerium_tech'),
            desc: loc('tech_elerium_tech'),
            category: 'research',
            reqs: { asteroid: 5 },
            grant: ['elerium',1],
            cost: {
                Knowledge(){ return 275000; },
                Elerium(){ return 20; }
            },
            effect: loc('tech_elerium_tech_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        elerium_reactor: {
            id: 'tech-elerium_reactor',
            title: loc('tech_elerium_reactor'),
            desc: loc('tech_elerium_reactor'),
            category: 'research',
            reqs: { dwarf: 1, elerium: 1 },
            grant: ['elerium',2],
            cost: {
                Knowledge(){ return 325000; },
                Elerium(){ return 180; }
            },
            effect: loc('tech_elerium_reactor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['e_reactor'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        neutronium_housing: {
            id: 'tech-neutronium_housing',
            title: loc('tech_neutronium_housing'),
            desc: loc('tech_neutronium_housing'),
            category: 'upgrade',
            reqs: { gas_moon: 1 },
            grant: ['space_housing',1],
            cost: {
                Knowledge(){ return 275000; },
                Neutronium(){ return 350; }
            },
            effect(){ return loc('tech_neutronium_housing_effect',[races[global.race.species].solar.red]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        unification: {
            id: 'tech-unification',
            title: loc('tech_unification'),
            desc(){ return loc('tech_unification_desc',[races[global.race.species].home]); },
            category: 'research',
            reqs: { mars: 2 },
            grant: ['unify',1],
            cost: {
                Knowledge(){ return 200000; }
            },
            effect: loc('tech_unification_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        wc_conquest: {
            id: 'tech-wc_conquest',
            title: loc('tech_wc_conquest'),
            desc(){
                return `<div>${loc('tech_wc_conquest_desc',[races[global.race.species].home])}</div><div class="has-text-special">${loc('tech_wc_conquest_desc_req')}</div>`;
            },
            category: 'research',
            reqs: { unify: 1 },
            grant: ['unify',2],
            not_tech: ['m_boost'],
            cost: {
                Army(){
                    return global.civic.foreign.gov0.occ && global.civic.foreign.gov1.occ && global.civic.foreign.gov2.occ ? true : false;
                }
            },
            effect(){ return `<div>${loc('tech_wc_conquest_effect')}</div><div class="has-text-special">${loc('tech_unification_warning')}</div>`; },
            action(){
                if (global.civic.foreign.gov0.occ && global.civic.foreign.gov1.occ && global.civic.foreign.gov2.occ){
                    global.tech['world_control'] = 1;
                    $('#garrison').empty();
                    $('#c_garrison').empty();
                    buildGarrison($('#garrison'),true);
                    buildGarrison($('#c_garrison'),false);
                    unlockAchieve(`world_domination`);
                    if (global.stats.attacks === 0){
                        unlockAchieve(`pacifist`);
                    }
                    for (let i=0; i<3; i++){
                        if (global.civic.foreign[`gov${i}`].occ){
                            global.civic['garrison'].max += 20;
                            global.civic['garrison'].workers += 20;
                            global.civic.foreign[`gov${i}`].occ = false;
                        }
                        global.civic.foreign[`gov${i}`].sab = 0;
                        global.civic.foreign[`gov${i}`].act = 'none';
                    }
                    return true;
                }
                return false;
            }
        },
        wc_morale: {
            id: 'tech-wc_morale',
            title: loc('tech_wc_morale'),
            desc(){
                let morale = (global.civic.foreign.gov0.unrest + global.civic.foreign.gov1.unrest + global.civic.foreign.gov2.unrest) / 5;
                morale += (300 - (global.civic.foreign.gov0.hstl + global.civic.foreign.gov1.hstl + global.civic.foreign.gov2.hstl)) / 7.5;
                morale = +(200 - morale).toFixed(1);
                return `<div>${loc('tech_wc_morale_desc',[races[global.race.species].home])}</div><div class="has-text-special">${loc('tech_wc_morale_desc_req',[morale])}</div>`;
            },
            category: 'research',
            reqs: { unify: 1 },
            grant: ['unify',2],
            not_tech: ['m_boost'],
            cost: {
                Morale(){
                    let morale = (global.civic.foreign.gov0.unrest + global.civic.foreign.gov1.unrest + global.civic.foreign.gov2.unrest) / 5;
                    morale += (300 - (global.civic.foreign.gov0.hstl + global.civic.foreign.gov1.hstl + global.civic.foreign.gov2.hstl)) / 7.5;
                    return +(200 - morale).toFixed(1);
                }
            },
            effect(){
                return `<div>${loc('tech_wc_morale_effect',[races[global.race.species].home])}</div><div class="has-text-special">${loc('tech_unification_warning')}</div>`;
            }, 
            action(){
                let morale = (global.civic.foreign.gov0.unrest + global.civic.foreign.gov1.unrest + global.civic.foreign.gov2.unrest) / 5;
                morale += (300 - (global.civic.foreign.gov0.hstl + global.civic.foreign.gov1.hstl + global.civic.foreign.gov2.hstl)) / 7.5;
                morale = +(200 - morale).toFixed(1);
                if (global.city.morale.current >= morale){
                    global.tech['world_control'] = 1;
                    $('#garrison').empty();
                    $('#c_garrison').empty();
                    buildGarrison($('#garrison'),true);
                    buildGarrison($('#c_garrison'),false);
                    unlockAchieve(`illuminati`);
                    if (global.stats.attacks === 0){
                        unlockAchieve(`pacifist`);
                    }
                    for (let i=0; i<3; i++){
                        if (global.civic.foreign[`gov${i}`].occ){
                            global.civic['garrison'].max += 20;
                            global.civic['garrison'].workers += 20;
                            global.civic.foreign[`gov${i}`].occ = false;
                        }
                        global.civic.foreign[`gov${i}`].sab = 0;
                        global.civic.foreign[`gov${i}`].act = 'none';
                    }
                    return true;
                }
                return false;
            }
        },
        wc_money: {
            id: 'tech-wc_money',
            title: loc('tech_wc_money'),
            desc(){
                let price = global.civic.foreign.gov0.eco + global.civic.foreign.gov1.eco + global.civic.foreign.gov2.eco;
                price = sizeApproximation(price * 15384);
                return `<div>${loc('tech_wc_money_desc',[races[global.race.species].home])}</div><div class="has-text-special">${loc('tech_wc_money_desc_req',[price])}</div>`;
            },
            category: 'research',
            reqs: { unify: 1 },
            grant: ['unify',2],
            not_tech: ['m_boost'],
            cost: {
                Money(){
                    let price = global.civic.foreign.gov0.eco + global.civic.foreign.gov1.eco + global.civic.foreign.gov2.eco;
                    price *= 15384;
                    return price;
                }
            },
            effect(){ return `<div>${loc('tech_wc_money_effect',[races[global.race.species].home])}</div><div class="has-text-special">${loc('tech_unification_warning')}</div>`; },
            action(){
                let price = global.civic.foreign.gov0.eco + global.civic.foreign.gov1.eco + global.civic.foreign.gov2.eco;
                price *= 15384;
                if (global.resource.Money.amount >= price){
                    global.resource.Money.amount -= price;
                    global.tech['world_control'] = 1;
                    $('#garrison').empty();
                    $('#c_garrison').empty();
                    buildGarrison($('#garrison'),true);
                    buildGarrison($('#c_garrison'),false);
                    unlockAchieve(`syndicate`);
                    if (global.stats.attacks === 0){
                        unlockAchieve(`pacifist`);
                    }
                    for (let i=0; i<3; i++){
                        if (global.civic.foreign[`gov${i}`].occ){
                            global.civic['garrison'].max += 20;
                            global.civic['garrison'].workers += 20;
                            global.civic.foreign[`gov${i}`].occ = false;
                        }
                        global.civic.foreign[`gov${i}`].sab = 0;
                        global.civic.foreign[`gov${i}`].act = 'none';
                    }
                    return true;
                }
                return false;
            }
        },
        wc_reject: {
            id: 'tech-wc_reject',
            title: loc('tech_wc_reject'),
            desc: loc('tech_wc_reject'),
            category: 'research',
            reqs: { unify: 1 },
            grant: ['unify',2],
            not_tech: ['world_control'],
            cost: {},
            effect(){ return `<div>${loc('tech_wc_reject_effect')}</div><div class="has-text-special">${loc('tech_wc_reject_warning')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.tech['m_boost'] = 1;
                    unlockAchieve(`cult_of_personality`);
                    return true;
                }
                return false;
            }
        },
        genesis: {
            id: 'tech-genesis',
            title: loc('tech_genesis'),
            desc: loc('tech_genesis'),
            category: 'research',
            reqs: { genesis: 1 },
            grant: ['genesis',2],
            cost: {
                Knowledge(){ return 350000; }
            },
            effect: loc('tech_genesis_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        star_dock: {
            id: 'tech-star_dock',
            title: loc('tech_star_dock'),
            desc: loc('tech_star_dock'),
            category: 'research',
            reqs: { genesis: 2, space: 5 },
            grant: ['genesis',3],
            cost: {
                Knowledge(){ return 380000; },
            },
            effect: loc('tech_star_dock_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
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
            title: loc('tech_interstellar'),
            desc: loc('tech_interstellar'),
            category: 'research',
            reqs: { genesis: 3 },
            grant: ['genesis',4],
            cost: {
                Knowledge(){ return 400000; },
            },
            effect: loc('tech_interstellar_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.starDock['probes'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        genesis_ship: {
            id: 'tech-genesis_ship',
            title: loc('tech_genesis_ship'),
            desc: loc('tech_genesis_ship'),
            category: 'research',
            reqs: { genesis: 4 },
            grant: ['genesis',5],
            cost: {
                Knowledge(){ return 425000; },
            },
            effect: loc('tech_genesis_ship_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.starDock['seeder'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        genetic_decay: {
            id: 'tech-genetic_decay',
            title: loc('tech_genetic_decay'),
            desc: loc('tech_genetic_decay'),
            category: 'research',
            reqs: { decay: 1 },
            grant: ['decay',2],
            cost: {
                Knowledge(){ return 200000; }
            },
            effect: loc('tech_genetic_decay_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        tachyon: {
            id: 'tech-tachyon',
            title: loc('tech_tachyon'),
            desc: loc('tech_tachyon'),
            category: 'research',
            reqs: { wsc: 1 },
            grant: ['ftl',1],
            cost: {
                Knowledge(){ return 435000; }
            },
            effect: loc('tech_tachyon_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        warp_drive: {
            id: 'tech-warp_drive',
            title: loc('tech_warp_drive'),
            desc: loc('tech_warp_drive'),
            category: 'research',
            reqs: { ftl: 1 },
            grant: ['ftl',2],
            cost: {
                Knowledge(){ return 450000; }
            },
            effect: loc('tech_warp_drive_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.showDeep = true;
                    global.settings.space.alpha = true;
                    global.interstellar['starport'] = {
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
        habitat: {
            id: 'tech-habitat',
            title: loc('tech_habitat'),
            desc: loc('tech_habitat_desc'),
            category: 'research',
            reqs: { alpha: 2, droids: 1 },
            grant: ['alpha',3],
            cost: {
                Knowledge(){ return 480000; }
            },
            effect: loc('tech_habitat_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['habitat'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        graphene: {
            id: 'tech-graphene',
            title: loc('tech_graphene'),
            desc: loc('tech_graphene'),
            category: 'research',
            reqs: { alpha: 3, infernite: 1 },
            grant: ['graphene',1],
            cost: {
                Knowledge(){ return 540000; },
                Adamantite(){ return 10000; }
            },
            effect: loc('tech_graphene_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['g_factory'] = { count: 0, on: 0, Lumber: 0, Coal: 0, Oil: 0 };
                    return true;
                }
                return false;
            }
        },
        aerogel: {
            id: 'tech-aerogel',
            title: loc('tech_aerogel'),
            desc: loc('tech_aerogel'),
            category: 'research',
            reqs: { graphene: 1, science: 13 },
            grant: ['aerogel',1],
            cost: {
                Knowledge(){ return 750000; },
                Graphene(){ return 50000; },
                Infernite(){ return 500; }
            },
            effect: loc('tech_aerogel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Aerogel.display = true;
                    loadFoundry();
                    return true;
                }
                return false;
            }
        },
        stellar_engine: {
            id: 'tech-stellar_engine',
            title: loc('tech_stellar_engine'),
            desc: loc('tech_stellar_engine'),
            category: 'research',
            reqs: { blackhole: 2 },
            grant: ['blackhole',3],
            cost: {
                Knowledge(){ return 1000000; }
            },
            effect: loc('tech_stellar_engine_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['stellar_engine'] = { count: 0, mass: 8, exotic: 0 };
                    return true;
                }
                return false;
            }
        },
        mass_ejector: {
            id: 'tech-mass_ejector',
            title: loc('tech_mass_ejector'),
            desc: loc('tech_mass_ejector'),
            category: 'research',
            reqs: { blackhole: 4 },
            grant: ['blackhole',5],
            cost: {
                Knowledge(){ return 1100000; }
            },
            effect: loc('tech_mass_ejector_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['mass_ejector'] = {
                        count: 0, on: 0, total: 0, mass: 0,
                        Food: 0, Lumber: 0,
                        Stone: 0, Furs: 0,
                        Copper: 0, Iron: 0,
                        Aluminium: 0, Cement: 0,
                        Coal: 0, Oil: 0,
                        Uranium: 0, Steel: 0,
                        Titanium: 0, Alloy: 0,
                        Polymer: 0, Iridium: 0,
                        Helium_3: 0, Deuterium: 0,
                        Neutronium: 0, Adamantite: 0,
                        Infernite: 0, Elerium: 0,
                        Nano_Tube: 0, Graphene: 0,
                        Stanene: 0, Plywood: 0,
                        Brick: 0, Wrought_Iron: 0,
                        Sheet_Metal: 0, Mythril: 0,
                        Aerogel: 0
                    };
                    return true;
                }
                return false;
            }
        },
        exotic_infusion: {
            id: 'tech-exotic_infusion',
            title: loc('tech_exotic_infusion'),
            desc: loc('tech_exotic_infusion'),
            category: 'research',
            reqs: { whitehole: 1 },
            grant: ['whitehole',2],
            cost: {
                Knowledge(){ return 1500000; },
                Soul_Gem(){ return 10; }
            },
            effect(){ return `<div>${loc('tech_exotic_infusion_effect',[global.resource.Soul_Gem.name])}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Soul_Gem.amount += 10;
                    global.resource.Knowledge.amount += 1500000;
                    return true;
                }
                return false;
            },
            flair(){ return loc('tech_exotic_infusion_flair'); }
        },
        infusion_check: {
            id: 'tech-infusion_check',
            title: loc('tech_infusion_check'),
            desc: loc('tech_infusion_check'),
            category: 'research',
            reqs: { whitehole: 2 },
            grant: ['whitehole',3],
            cost: {
                Knowledge(){ return 1500000; },
                Soul_Gem(){ return 10; }
            },
            effect(){ return `<div>${loc('tech_infusion_check_effect')}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Soul_Gem.amount += 10;
                    global.resource.Knowledge.amount += 1500000;
                    return true;
                }
                return false;
            },
            flair(){ return loc('tech_infusion_check_flair'); }
        },
        infusion_confirm: {
            id: 'tech-infusion_confirm',
            title: loc('tech_infusion_confirm'),
            desc: loc('tech_infusion_confirm'),
            category: 'research',
            reqs: { whitehole: 3 },
            grant: ['whitehole',4],
            cost: {
                Knowledge(){ return 1500000; },
                Soul_Gem(){ return 10; }
            },
            effect(){ return `<div>${loc('tech_infusion_confirm_effect')}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    let bang = $('<div class="bigbang"></div>');
                    $('body').append(bang);
                    setTimeout(function(){
                        bang.addClass('burn');
                    }, 125);
                    setTimeout(function(){
                        bang.addClass('b');
                    }, 150);
                    setTimeout(function(){
                        bang.addClass('c');
                    }, 2000);
                    setTimeout(function(){
                        big_bang();
                    }, 4000);
                    return false;
                }
                return false;
            },
            flair(){ return loc('tech_infusion_confirm_flair'); }
        },
        stabilize_blackhole: {
            id: 'tech-stabilize_blackhole',
            title: loc('tech_stabilize_blackhole'),
            desc(){ return `<div>${loc('tech_stabilize_blackhole')}</div><div class="has-text-danger">${loc('tech_stabilize_blackhole2')}</div>`; },
            category: 'research',
            reqs: { whitehole: 1 },
            grant: ['stablized',1],
            cost: {
                Knowledge(){ return 1500000; },
                Neutronium(){ return 20000; }
            },
            effect: loc('tech_stabilize_blackhole_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar.stellar_engine.mass += (atomic_mass.Neutronium * 20000 / 10000000000);
                    global.interstellar.stellar_engine.mass += global.interstellar.stellar_engine.exotic * 25;
                    global.interstellar.stellar_engine.exotic = 0;
                    delete global.tech['whitehole'];
                    return true;
                }
                return false;
            }
        },
        gravitational_waves: {
            id: 'tech-gravitational_waves',
            title: loc('tech_gravitational_waves'),
            desc: loc('tech_gravitational_waves'),
            category: 'research',
            reqs: { blackhole: 4 },
            grant: ['gravity',1],
            cost: {
                Knowledge(){ return 1250000; }
            },
            effect: loc('tech_gravitational_waves_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        gravity_convection: {
            id: 'tech-gravity_convection',
            title: loc('tech_gravity_convection'),
            desc: loc('tech_gravity_convection'),
            category: 'upgrade',
            reqs: { gravity: 1 },
            grant: ['gravity',2],
            cost: {
                Knowledge(){ return 1350000; }
            },
            effect: loc('tech_gravity_convection_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        wormholes: {
            id: 'tech-wormholes',
            title: loc('tech_wormholes'),
            desc: loc('tech_wormholes'),
            category: 'research',
            reqs: { gravity: 1, locked: 1 },
            grant: ['stargate',1],
            cost: {
                Knowledge(){ return 1500000; }
            },
            effect: loc('tech_wormholes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        portal: {
            id: 'tech-portal',
            title: loc('tech_portal'),
            desc: loc('tech_portal_desc'),
            category: 'research',
            reqs: { wsc: 1 },
            grant: ['portal',1],
            cost: {
                Knowledge(){ return 500000; }
            },
            effect: loc('tech_portal_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        fortifications: {
            id: 'tech-fort',
            title: loc('tech_fort'),
            desc: loc('tech_fort_desc'),
            category: 'research',
            reqs: { portal: 1 },
            grant: ['portal',2],
            cost: {
                Knowledge(){ return 550000; },
                Stone(){ return 1000000; }
            },
            effect: loc('tech_fort_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.showPortal = true;
                    global.settings.portal.fortress = true;
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.portal['fortress'] = {
                        threat: 10000,
                        garrison: 0,
                        walls: 100,
                        repair: 0,
                        patrols: 0,
                        patrol_size: 10,
                        siege: 999,
                        notify: 'Yes',
                        s_ntfy: 'Yes',
                    };
                    global.portal['turret'] = { count: 0, on: 0 };
                    global.portal['carport'] = { count: 0, damaged: 0, repair: 0 };
                    if (global.race['evil']){
                        unlockAchieve('blood_war');
                    }
                    else {
                        unlockAchieve('pandemonium');
                    }
                    return true;
                }
                return false;
            }
        },
        war_drones: {
            id: 'tech-war_drones',
            title: loc('tech_war_drones'),
            desc: loc('tech_war_drones'),
            category: 'research',
            reqs: { portal: 2, graphene: 1 },
            grant: ['portal',3],
            cost: {
                Knowledge(){ return 700000; },
            },
            effect: loc('tech_war_drones_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.portal.badlands = true;
                    global.portal['war_drone'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        demon_attractor: {
            id: 'tech-demon_attractor',
            title: loc('tech_demon_attractor'),
            desc: loc('tech_demon_attractor'),
            category: 'research',
            reqs: { portal: 3, stanene: 1 },
            grant: ['portal',4],
            cost: {
                Knowledge(){ return 745000; },
            },
            effect: loc('tech_demon_attractor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.portal['attractor'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        combat_droids: {
            id: 'tech-combat_droids',
            title: loc('tech_combat_droids'),
            desc: loc('tech_combat_droids'),
            category: 'research',
            reqs: { portal: 4 },
            grant: ['portal',5],
            cost: {
                Knowledge(){ return 762000; },
                Soul_Gem(){ return 1; }
            },
            effect: loc('tech_combat_droids_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.portal['war_droid'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            },
            flair(){
                return loc('tech_combat_droids_flair');
            }
        },
        sensor_drone: {
            id: 'tech-sensor_drone',
            title: loc('tech_sensor_drone'),
            desc: loc('tech_sensor_drone'),
            category: 'research',
            reqs: { portal: 3, infernite: 1, stanene: 1, graphene: 1 },
            grant: ['infernite',2],
            cost: {
                Knowledge(){ return 725000; },
            },
            effect: loc('tech_sensor_drone_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.portal['sensor_drone'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        map_terrain: {
            id: 'tech-map_terrain',
            title: loc('tech_map_terrain'),
            desc: loc('tech_map_terrain'),
            category: 'upgrade',
            reqs: { infernite: 2 },
            grant: ['infernite',3],
            cost: {
                Knowledge(){ return 948000; },
            },
            effect(){ return loc('tech_map_terrain_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        calibrated_sensors: {
            id: 'tech-calibrated_sensors',
            title: loc('tech_calibrated_sensors'),
            desc: loc('tech_calibrated_sensors'),
            category: 'upgrade',
            reqs: { infernite: 3 },
            grant: ['infernite',4],
            cost: {
                Knowledge(){ return 1125000; },
                Infernite(){ return 3500; }
            },
            effect(){ return loc('tech_calibrated_sensors_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
    },
    genes: arpa('GeneTech'),
    space: spaceTech(),
    interstellar: interstellarTech(),
    starDock: {
        probes: {
            id: 'spcdock-probes',
            title: loc('star_dock_probe'),
            desc(){
                return `<div>${loc('star_dock_probe_desc')}</div>`;
            },
            reqs: { genesis: 4 },
            cost: {
                Money(offset){ return costMultiplier('probes', offset, 350000, 1.25,'starDock'); },
                Alloy(offset){ return costMultiplier('probes', offset, 75000, 1.25,'starDock'); },
                Polymer(offset){ return costMultiplier('probes', offset, 85000, 1.25,'starDock'); },
                Iridium(offset){ return costMultiplier('probes', offset, 12000, 1.25,'starDock'); },
                Mythril(offset){ return costMultiplier('probes', offset, 3500, 1.25,'starDock'); },
            },
            effect(){
                return `<div>${loc('star_dock_probe_effect')}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
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
            no_queue(){ return global.starDock.seeder.count < 100 ? false : true },
            queue_size: 10,
            queue_complete(){ return global.starDock.seeder.count >= 100 ? true : false; },
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
                if (global.starDock.seeder.count < 100 && payCosts($(this)[0].cost)){
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
        prep_ship: {
            id: 'spcdock-prep_ship',
            title: loc('star_dock_prep'),
            desc(){
                return `<div>${loc('star_dock_prep_desc')}</div><div class="has-text-danger">${loc('star_dock_genesis_desc2')}</div>`;
            },
            reqs: { genesis: 6 },
            cost: {},
            no_queue(){ return true },
            effect(){
                let garrisoned = global.civic.garrison.workers;
                for (let i=0; i<3; i++){
                    if (global.civic.foreign[`gov${i}`].occ){
                        garrisoned += 20;
                    }
                }
                let pop = global['resource'][global.race.species].amount + garrisoned;
                let plasmid = Math.round(pop / 3);
                let k_base = global.stats.know;
                let k_inc = 50000;
                while (k_base > k_inc){
                    plasmid++;
                    k_base -= k_inc;
                    k_inc *= 1.015;
                }
                let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
                plasmid = challenge_multiplier(plasmid,'bioseed');
                let phage = challenge_multiplier(Math.floor(Math.log2(plasmid) * Math.E),'bioseed');
                return `<div>${loc('star_dock_prep_effect')}</div><div class="has-text-special">${loc('star_dock_genesis_effect2',[plasmid,plasmidType])}</div><div class="has-text-special">${loc('star_dock_genesis_effect3',[phage])}</div>`;
            },
            action(){
                global.tech['genesis'] = 7;
                $('#popspcdock-seeder').remove();
                $('#modalBox').empty();
                let c_action = actions.space.spc_gas.star_dock;
                drawModal(c_action,'star_dock');
                return true;
            },
        },
        launch_ship: {
            id: 'spcdock-launch_ship',
            title: loc('star_dock_genesis'),
            desc(){
                return `<div>${loc('star_dock_genesis_desc1')}</div><div class="has-text-danger">${loc('star_dock_genesis_desc2')}</div>`;
            },
            reqs: { genesis: 7 },
            cost: {},
            no_queue(){ return true },
            effect(){
                let garrisoned = global.civic.garrison.workers;
                for (let i=0; i<3; i++){
                    if (global.civic.foreign[`gov${i}`].occ){
                        garrisoned += 20;
                    }
                }
                let pop = global['resource'][global.race.species].amount + garrisoned;
                let plasmid = Math.round(pop / 3);
                let k_base = global.stats.know;
                let k_inc = 50000;
                while (k_base > k_inc){
                    plasmid++;
                    k_base -= k_inc;
                    k_inc *= 1.015;
                }
                let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
                plasmid = challenge_multiplier(plasmid,'bioseed');
                let phage = challenge_multiplier(Math.floor(Math.log2(plasmid) * Math.E),'bioseed');
                return `<div>${loc('star_dock_genesis_effect1')}</div><div class="has-text-special">${loc('star_dock_genesis_effect2',[plasmid,plasmidType])}</div><div class="has-text-special">${loc('star_dock_genesis_effect3',[phage])}</div>`;
            },
            action(){
                bioseed();
                return false;
            },
        },
    },
    portal: fortressTech()
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
        multiplier *= 1 + global.stats.achieve.blackhole.l * 0.05;
    }
    multiplier *= global.tech['world_control'] ? 3 : 1;
    if (global.tech['storage'] >= 7 && global.interstellar['cargo_yard']){
        multiplier *= 1 + ((global.interstellar['cargo_yard'].count * quantum_level) / 100);
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
    Object.keys(actions.city[action].reqs).forEach(function (req){
        if (!global.tech[req] || global.tech[req] < actions.city[action].reqs[req]){
            isMet = false;
        }
    });
    return isMet;
}

export function checkTechRequirements(tech){
    var isMet = true;
    Object.keys(actions.tech[tech].reqs).forEach(function (req){
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
        Object.keys(c_action.power_reqs).forEach(function (req){
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

export function gainTech(action){
    var tech = actions.tech[action].grant[0];
    global.tech[tech] = actions.tech[action].grant[1];
    drawCity();
    drawTech();
    space();
    deepSpace();
    renderFortress();
}

export function drawCity(){
    let city_buildings = {};
    Object.keys(actions.city).forEach(function (city_name) {
        removeAction(actions.city[city_name].id);
        
        if(!checkCityRequirements(city_name))
            return;
        
        let action = actions.city[city_name];
        let category = 'category' in action ? action.category : 'utility';

        if(!(category in city_buildings)) {
            city_buildings[category] = [];
        }

        if (global.settings['cLabels']){
            city_buildings[category].push(city_name);
        }
        else {
            addAction('city', city_name);
        }
    });

    let city_categories =  [
        'outskirts', 
        'residential', 
        'commercial', 
        'science', 
        'military', 
        'trade', 
        'industrial', 
        'utility'
    ];

    city_categories.forEach(function(category) {
        $(`#city-dist-${category}`).remove();
        if (global.settings['cLabels']){
            if(!(category in city_buildings))
                return;

            $(`<div id="city-dist-${category}" class="city"></div>`)
                .appendTo('#city')
                .append(`<div><h3 class="name has-text-warning">${loc(`city_dist_${category}`)}</h3></div>`);

            city_buildings[category].forEach(function(city_name) {
                addAction('city', city_name);
            });
        }
    });
}

export function drawTech(){
    let techs = {};
    Object.keys(actions.tech).forEach(function (tech_name) {
        removeAction(actions.tech[tech_name].id);
        
        if (checkOldTech(tech_name)){
            oldTech(tech_name);
        }

        if (!checkTechRequirements(tech_name))
            return;
        
        let action = actions.tech[tech_name];
        let category = 'category' in action ? action.category : 'research';

        if (!(category in techs)) {
            techs[category] = [];
        }

        if (global.settings['tLabels']){
            techs[category].push(tech_name);
        }
        else {
            addAction('tech', tech_name);
        }
    });

    let tech_categories =  [
        'research',
        'upgrade'
    ];

    tech_categories.forEach(function(category) {
        $(`#tech-dist-${category}`).remove();
        if (global.settings['tLabels']){
            if(!(category in techs))
                return;

            $(`<div id="tech-dist-${category}" class="tech"></div>`)
                .appendTo('#tech')
                .append(`<div><h3 class="name has-text-warning">${loc(`tech_dist_${category}`)}</h3></div>`);

            techs[category].forEach(function(tech_name) {
                addAction('tech', tech_name);
            });
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
    if (tech !== 'fanaticism' && tech !== 'anthropology' && tech !== 'deify' && tech !== 'study'){
        addAction('tech',tech,true);
    }
    else if (tech === 'fanaticism' && global.tech['fanaticism']){
        addAction('tech',tech,true);
    }
    else if (tech === 'anthropology' && global.tech['anthropology']){
        addAction('tech',tech,true);
    }
    else if (tech === 'deify' && global.tech['ancient_deify']){
        addAction('tech',tech,true);
    }
    else if (tech === 'study' && global.tech['ancient_study']){
        addAction('tech',tech,true);
    }
}

export function addAction(action,type,old){
    let c_action = actions[action][type];
    setAction(c_action,action,type,old)
}

export function setAction(c_action,action,type,old){
    if (c_action['condition'] && !c_action.condition()){
        return;
    }
    if (c_action['not_trait']){
        for (let i=0; i<c_action.not_trait.length; i++){
            if (global.race[c_action.not_trait[i]]){
                return;
            }
        }
    }
    if (c_action['trait']){
        for (let i=0; i<c_action.trait.length; i++){
            if (!global.race[c_action.trait[i]]){
                return;
            }
        }
    }
    if (c_action['not_gene']){
        for (let i=0; i<c_action.not_gene.length; i++){
            if (global.genes[c_action.not_gene[i]]){
                return;
            }
        }
    }
    if (c_action['gene']){
        for (let i=0; i<c_action.gene.length; i++){
            if (!global.genes[c_action.gene[i]]){
                return;
            }
        }
    }
    if (c_action['not_tech']){
        for (let i=0; i<c_action.not_tech.length; i++){
            if (global.tech[c_action.not_tech[i]]){
                return;
            }
        }
    }
    if (type === 'ancient_theology' && !global.genes['ancients']){
        return;
    }
    if (c_action['powered'] && !global[action][type]['on']){
        global[action][type]['on'] = 0;
    }
    var id = c_action.id;
    removeAction(id);
    var parent = c_action['highlight'] && c_action.highlight() ? $(`<div id="${id}" class="action hl"></div>`) : $(`<div id="${id}" class="action"></div>`);
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
        let cst = '';
        let data = '';
        if (c_action['cost']){
            var costs = adjustCosts(c_action.cost);
            Object.keys(costs).forEach(function (res){
                let cost = costs[res]();
                if (cost > 0){
                    cst = cst + ` res-${res}`;
                    data = data + ` data-${res}="${cost}"`;
                }
            });
        }

        var element = $(`<a class="button is-dark${cst}"${data} v-on:click="action"><span class="aTitle">{{ title }}</span></a><a v-on:click="describe" class="is-sr-only">{{ title }} description</a>`);
        parent.append(element);
    }

    if (c_action['special']){
        var special = $(`<div class="special" role="button" title="${type} options" @click="trigModal"><svg version="1.1" x="0px" y="0px" width="12px" height="12px" viewBox="340 140 280 279.416" enable-background="new 340 140 280 279.416" xml:space="preserve">
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
    if (action !== 'tech' && global[action] && global[action][type] && typeof(global[action][type]['repair']) !== 'undefined'){
        element.append($(`<div class="repair"><progress class="progress" :value="repair()" max="${c_action.repair}"></progress></div>`));
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

    if (c_action['emblem']){
        let emblem = c_action.emblem();
        parent.append($(emblem));
    }

    var modal = {
        template: '<div id="modalBox" class="modalBox"></div>'
    };

    vBind({
        el: '#'+id,
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
                            if (!(global.settings.qKey && keyMap.q) && c_action.action()){
                                gainTech(type);
                                if (c_action['post']){
                                    c_action.post();
                                }
                            }
                            else {
                                if (!(c_action['no_queue'] && c_action['no_queue']()) && global.tech['r_queue']){
                                    let max_queue = 3;
                                    if (global.stats.feat['journeyman']){
                                        max_queue += global.stats.feat['journeyman'] >= 3 ? (global.stats.feat['journeyman'] >= 5 ? 3 : 2) : 1;
                                    }
                                    if (global.genes['queue'] && global.genes['queue'] >= 2){
                                        max_queue *= 2;
                                    }
                                    if (global.r_queue.queue.length < max_queue){
                                        let queued = false;
                                        for (let tech in global.r_queue.queue){
                                            if (global.r_queue.queue[tech].id === c_action.id){
                                                queued = true;
                                                break;
                                            }
                                        }
                                        if (!queued){
                                            global.r_queue.queue.push({ id: c_action.id, action: action, type: type, label: typeof c_action.title === 'string' ? c_action.title : c_action.title(), cna: false, time: 0 });
                                            resDragQueue();
                                        }
                                    }
                                }
                            }
                            break;
                        case 'genes':
                            if (c_action.action()){
                                gainGene(type);
                                if (c_action['post']){
                                    c_action.post();
                                }
                            }
                            break;
                        default:
                            if (keyMap.d && 1 === 2){
                                if (global[action][type]['count'] && global[action][type]['count'] > 0){
                                    global[action][type]['count']--;
                                    if (global[action][type]['on'] && global[action][type]['on'] > global[action][type]['count']){
                                        global[action][type]['on']--;
                                    }
                                    if (global[action][type]['count'] === 0){
                                        drawCity();
                                        space();
                                        var id = c_action.id;
                                        $(`#pop${id}`).hide();
                                        if (poppers[id]){
                                            poppers[id].destroy();
                                        }
                                        $(`#pop${id}`).remove();
                                    }
                                    else {
                                        updateDesc(c_action,action,type);
                                    }
                                }
                                break;
                            }
                            else {
                                let keyMult = keyMultiplier();
                                if (c_action['grant']){
                                    keyMult = 1;
                                }
                                let grant = false;
                                let no_queue = action === 'evolution' || (c_action['no_queue'] && c_action['no_queue']()) ? true : false;
                                for (var i=0; i<keyMult; i++){
                                    if ((global.settings.qKey && keyMap.q) || !c_action.action()){
                                        if (!no_queue && global.tech['queue'] && keyMult === 1){
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
                                                let q_size = c_action['queue_size'] ? c_action['queue_size'] : 1;
                                                if (global.queue.queue.length > 0 && global.queue.queue[global.queue.queue.length-1].id === c_action.id){
                                                    global.queue.queue[global.queue.queue.length-1].q += q_size;
                                                }
                                                else {
                                                    global.queue.queue.push({ id: c_action.id, action: action, type: type, label: typeof c_action.title === 'string' ? c_action.title : c_action.title(), cna: false, time: 0, q: q_size, qs: q_size, t_max: 0 });
                                                }
                                                dragQueue();
                                            }
                                        }
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
                                    deepSpace();
                                    renderFortress();
                                }
                                else if (c_action['refresh']){
                                    removeAction(c_action.id);
                                    drawCity();
                                    drawTech();
                                    space();
                                    deepSpace();
                                    renderFortress();
                                }
                                updateDesc(c_action,action,type);
                                break;
                            }
                    }
                }
            },
            describe(){
                srSpeak(srDesc(c_action,old));
            },
            trigModal(){
                this.$buefy.modal.open({
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
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[action][type].on < global[action][type].count){
                        global[action][type].on++;
                    }
                    else {
                        break;
                    }
                }
                if (c_action['postPower']){
                    c_action.postPower();
                }
            },
            power_off(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[action][type].on > 0){
                        global[action][type].on--;
                    }
                    else {
                        break;
                    }
                }
                if (c_action['postPower']){
                    c_action.postPower();
                }
            },
            repair(){
                return global[action][type].repair;
            }
        },
        filters: {
            off: function(value){
                return global[action][type].count - value;
            }
        }
    });
    let pop_target = action === 'starDock' ? 'body .modal' : '#main';
    $('#'+id).on('mouseover',function(){
            let wide = c_action['wide'] ? ' wide' : '';
            var popper = $(`<div id="pop${id}" class="popper${wide} has-background-light has-text-dark"><div id="popDesc"></div></div>`);
            $(pop_target).append(popper);
            actionDesc(popper,c_action,global[action][type],old);
            popper.show();
            poppers[id] = new Popper($('#'+id),popper);
        });
    $('#'+id).on('mouseout',function(){
            $(`#pop${id}`).hide();
            vBind({el: `#popTimer`},'destroy');
            if (poppers[id]){
                poppers[id].destroy();
            }
            $(`#pop${id}`).remove();
        });
}

export function setPlanet(hell){
    var biome = 'grassland';
    let max_bound = !hell && global.stats.portals >= 1 ? 7 : 6;
    switch (Math.floor(Math.seededRandom(0,max_bound))){
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
        case 6:
            biome = global.race.universe === 'evil' ? 'eden' : 'hellscape';
            break;
        default:
            biome = 'grassland';
            break;
    }

    let trait = 'none';
    switch (Math.floor(Math.seededRandom(0,12))){
        case 0:
            trait = 'toxic';
            break;
        case 1:
            trait = 'mellow';
            break;
        case 2:
            trait = 'rage';
            break;
        case 3:
            trait = 'stormy';
            break;
        case 4:
            trait = 'ozone';
            break;
        case 5:
            trait = 'magnetic';
            break;
        case 6:
            trait = 'trashed';
            break;
        default:
            trait = 'none';
            break;
    }
    
    let geology = {};
    let max = Math.floor(Math.seededRandom(0,3));
    let top = 30;
    if (global.stats.achieve['whitehole']){
        top += global.stats.achieve['whitehole'].l * 5;
        max += global.stats.achieve['whitehole'].l;
    }

    for (let i=0; i<max; i++){
        switch (Math.floor(Math.seededRandom(0,10))){
            case 0:
                geology['Copper'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                break;
            case 1:
                geology['Iron'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                break;
            case 2:
                geology['Aluminium'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                break;
            case 3:
                geology['Coal'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                break;
            case 4:
                geology['Oil'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                break;
            case 5:
                geology['Titanium'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                break;
            case 6:
                geology['Uranium'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                break;
            case 7:
                if (global.stats.achieve['whitehole']){
                    geology['Iridium'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                }
                break;
            default:
                break;
        }
    }

    let num = Math.floor(Math.seededRandom(0,10000));
    var id = biome+num;
    id = id.charAt(0).toUpperCase() + id.slice(1);

    var orbit = 365;
    switch (biome){
        case 'hellscape':
            orbit = 666;
            break;
        case 'eden':
            orbit = 777;
            break;
        default:
            orbit = Math.floor(Math.seededRandom(200,600));
            break;
    }

    let title = trait === 'none' ? `${biomes[biome].label} ${num}` : `${planetTraits[trait].label} ${biomes[biome].label} ${num}`;
    var parent = $(`<div id="${id}" class="action"></div>`);
    var element = $(`<a class="button is-dark" v-on:click="action"><span class="aTitle">${title}</span></a>`);
    parent.append(element);

    $('#evolution').append(parent);

    $('#'+id).on('click',function(){
        global.race['chose'] = id;
        global.city.biome = biome;
        global.city.calendar.orbit = orbit;
        global.city.geology = geology;
        global.city.ptrait = trait;
        $('#evolution').empty();
        $(`#pop${id}`).hide();
        if (poppers[id]){
            poppers[id].destroy();
        }
        $(`#pop${id}`).remove();
        addAction('evolution','rna');
    });

    $('#'+id).on('mouseover',function(){
            var popper = $(`<div id="pop${id}" class="popper has-background-light has-text-dark"></div>`);
            $('#main').append(popper);
            
            popper.append($(`<div>${loc('set_planet',[title,biomes[biome].label,orbit])}</div>`));
            popper.append($(`<div>${biomes[biome].desc}</div>`));
            if (trait !== 'none'){
                popper.append($(`<div>${planetTraits[trait].desc}</div>`));
            }

            let good = $('<div></div>');
            let bad = $('<div></div>');
            let goodCnt = 0;
            let badCnt = 0;
            for (let key in geology){
                if (key !== 0){
                    if (geology[key] > 0) {
                        goodCnt++;
                        if (goodCnt === 1) {
                            good.append($(`<div>${loc('set_planet_extra_rich')}</div>`));
                        }
                        let res_val = `<div class="has-text-advanced">${loc(`resource_${key}_name`)}`;
                        if (global.stats.achieve['miners_dream']) {
                            res_val += `: <span class="has-text-success">+${Math.round((geology[key] + 1) * 100 - 100)}%</span>`;
                        }
                        res_val += `</div>`;
                        good.append(res_val);
                    }
                    else if (geology[key] < 0){
                        badCnt++;
                        if (badCnt === 1) {
                            bad.append($(`<div>${loc('set_planet_extra_poor')}</div>`));
                        }
                        let res_val = `<div class="has-text-warning">${loc(`resource_${key}_name`)}`;
                        if (global.stats.achieve['miners_dream']) {
                            res_val += `: <span class="has-text-danger">${Math.round((geology[key] + 1) * 100 - 100)}%</span>`;
                        }
                        res_val += `</div>`;
                        bad.append(res_val);
                    }
                }
            }
            if (badCnt > 0){
                good.append(bad);
            }
            if (goodCnt > 0 || badCnt > 0) {
                popper.append(good);
            }
            popper.show();
            poppers[id] = new Popper($('#'+id),popper);
        });
    $('#'+id).on('mouseout',function(){
            $(`#pop${id}`).hide();
            if (poppers[id]){
                poppers[id].destroy();
            }
            $(`#pop${id}`).remove();
        });
    return biome === 'eden' ? 'hellscape' : biome;
}

function srDesc(c_action,old){
    let desc = typeof c_action.desc === 'string' ? c_action.desc : c_action.desc();
    desc = desc + '. ';
    if (c_action.cost && !old){
        if (checkAffordable(c_action)){
            desc = desc + loc('affordable') + '. ';
        }
        else {
            desc = desc + loc('not_affordable') + '. ';
        }
        desc = desc + 'Costs: ';
        var costs = adjustCosts(c_action.cost);
        Object.keys(costs).forEach(function (res) {
            var res_cost = costs[res]();
            if (res_cost > 0){
                let label = res === 'Money' ? '$' : global.resource[res].name+': ';
                label = label.replace("_", " ");
                
                let display_cost = sizeApproximation(res_cost,1);
                desc = desc + `${label}${display_cost}. `;
                if (global.resource[res].amount < res_cost){
                    desc = desc + `${loc('insufficient')} ${global.resource[res].name}. `;
                }
            }
        });
    }

    if (c_action.effect){
        let effect = typeof c_action.effect === 'string' ? c_action.effect : c_action.effect();
        if (effect){
            desc = desc + effect + '. ';
        }
    }
    if (c_action.flair){
        let flair = typeof c_action.flair === 'string' ? c_action.flair : c_action.flair();
        if (flair){
            desc = desc + flair + '.';
        }
    }

    return desc.replace("..",".");
}

function actionDesc(parent,c_action,obj,old){
    parent.empty();
    var desc = typeof c_action.desc === 'string' ? c_action.desc : c_action.desc();
    parent.append($('<div>'+desc+'</div>'));

    let tc = timeCheck(c_action,false,true);
    if (c_action.cost && !old){
        var cost = $('<div></div>');
        var costs = adjustCosts(c_action.cost);
        Object.keys(costs).forEach(function (res){
            if (res !== 'Morale' && res !== 'Army'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    let label = res === 'Money' ? '$' : global.resource[res].name+': ';
                    label = label.replace("_", " ");
                    let color = 'has-text-dark';
                    if (global.resource[res].amount < res_cost){
                        color = tc.r === res ? 'has-text-danger' : 'has-text-alert';
                    }
                    let display_cost = sizeApproximation(res_cost,1);
                    cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}${display_cost}</div>`));
                }
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
        parent.append($(`<div class="flair has-text-flair">${flair}</div>`));
        parent.addClass('flair');
    }
    if (!old && !checkAffordable(c_action) && checkAffordable(c_action,true)){
        if (obj && obj['time']){
            parent.append($(`<div id="popTimer" class="flair has-text-advanced">{{ time | timer }}</div>`));
            vBind({
                el: '#popTimer',
                data: obj,
                filters: {
                    timer(t){
                        return loc('action_ready',[t]);
                    }
                }
            });
        }
        else {
            let time = timeFormat(tc.t);
            parent.append($(`<div class="flair has-text-advanced">${loc('action_ready',[time])}</div>`));
        }
    }
}

export function removeAction(id){
    $('#'+id).remove();
    $('#pop'+id).remove();
}

export function updateDesc(c_action,category,action){
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
    actionDesc($('#pop'+id),c_action,global[category][action]);
}

export function payCosts(costs){
    costs = adjustCosts(costs);
    if (checkCosts(costs)){
        Object.keys(costs).forEach(function (res){
            if (res !== 'Morale' && res !== 'Army'){
                let cost = costs[res]();
                global['resource'][res].amount -= cost;
                if (res === 'Knowledge'){
                    global.stats.know += cost;
                }
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
        if (res !== 'Morale' && res !== 'Army'){
            var testCost = Number(costs[res]()) || 0;
            if (global.resource[res].max >= 0 && testCost > Number(global.resource[res].max) && Number(global.resource[res].max) !== -1) {
                test = false;
                return false;
            }
        }
        else if (res === 'Morale' && global.city.morale.current < Number(costs[res]())){
            test = false;
            return false;
        }
        else if (res === 'Army' && armyRating(global.civic.garrison.raid,'army') < Number(costs[res]())){
            test = false;
            return false;
        }
    });
    return test;
}

function checkCosts(costs){
    var test = true;
    Object.keys(costs).forEach(function (res){
        if (res !== 'Morale' && res !== 'Army'){
            var testCost = Number(costs[res]()) || 0;
            let fail_max = global.resource[res].max >= 0 && testCost > global.resource[res].max ? true : false;
            if (testCost > Number(global.resource[res].amount) + global.resource[res].diff || fail_max){
                test = false;
                return false;
            }
        }
        else if (res === 'Morale' && global.city.morale.current < Number(costs[res]())){
            test = false;
            return false;
        }
        else if (res === 'Army' && costs[res]() === false){
            test = false;
            return false;
        }
    });
    return test;
}

export function challengeGeneHeader(){
    let challenge = $(`<div class="challenge"></div>`);
    $('#evolution').append(challenge);
    challenge.append($(`<div class="divider has-text-warning"><h2 class="has-text-danger">${loc('evo_challenge_genes')}</h2></div>`));
    challenge.append($(`<div class="has-text-advanced">${loc('evo_challenge_genes_desc')}</div>`));
    if (global.genes['challenge'] && global.genes['challenge'] >= 2){
        challenge.append($(`<div class="has-text-advanced">${loc('evo_challenge_genes_mastery')}</div>`));
    }
}

export function challengeActionHeader(){
    let challenge = $(`<div class="challenge"></div>`);
    $('#evolution').append(challenge);
    challenge.append($(`<div class="divider has-text-warning"><h2 class="has-text-danger">${loc('evo_challenge_run')}</h2></div>`));
    challenge.append($(`<div class="has-text-advanced">${loc('evo_challenge_run_desc')}</div>`));
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
        case 'mining_droid':
            droidModal(body);
            break;
        case 'g_factory':
            grapheneModal(body);
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

    if (global.tech['genesis'] === 6){
        let c_action = actions.starDock.prep_ship;
        setAction(c_action,'starDock','prep_ship');
    }

    if (global.tech['genesis'] >= 7){
        let c_action = actions.starDock.launch_ship;
        setAction(c_action,'starDock','launch_ship');
    }
}

function smelterModal(modal){
    loadIndustry('smelter',modal);
}

function factoryModal(modal){
    loadIndustry('factory',modal);
}

function droidModal(modal){
    loadIndustry('droid',modal);
}

function grapheneModal(modal){
    loadIndustry('graphene',modal);
}

export function evoProgress(){
    $('#evolution .evolving').remove();
    let progress = $(`<div class="evolving"><progress class="progress" value="${global.evolution.final}" max="100">${global.evolution.final}%</progress></div>`);
    $('#evolution').append(progress);
}

function basicHousingLabel(){
    switch (global.race.species){
        case 'orc':
            return loc('city_basic_housing_orc_title');
        case 'wolven':
            return loc('city_basic_housing_wolven_title');
        case 'entish':
            return loc('city_basic_housing_entish_title');
        case 'arraak':
            return loc('city_basic_housing_nest_title');
        case 'pterodacti':
            return loc('city_basic_housing_nest_title');
        case 'sporgar':
            return loc('city_basic_housing_sporgar_title');
        case 'dracnid':
            return loc('city_basic_housing_title7');
        case 'balorg':
            return loc('city_basic_housing_title7');
        case 'imp':
            return loc('city_basic_housing_title8');
        case 'seraph':
            return loc('city_basic_housing_seraph_title');
        case 'unicorn':
            return loc('city_basic_housing_unicorn_title');
        case 'tuskin':
            return loc('city_basic_housing_sand_title');
        case 'kamel':
            return loc('city_basic_housing_sand_title');
        default:
            return global.city.ptrait === 'trashed' ? loc('city_basic_housing_trash_title') : loc('city_basic_housing_title');
    }
}

function mediumHousingLabel(){
    switch (global.race.species){
        case 'sporgar':
            return loc('city_cottage_title2');
        case 'balorg':
            return loc('city_cottage_title3');
        case 'imp':
            return loc('city_basic_housing_title7');
        case 'seraph':
            return loc('city_cottage_title4');
        case 'unicorn':
            return loc('city_cottage_title5');
        default:
            return loc('city_cottage_title1');
    }
}

function largeHousingLabel(){
    switch (global.race.species){
        case 'sporgar':
            return loc('city_apartment_title2');
        case 'balorg':
            return loc('city_apartment_title3');
        case 'imp':
            return loc('city_apartment_title3');
        case 'seraph':
            return loc('city_apartment_title4');
        case 'unicorn':
            return loc('city_apartment_title4');
        default:
            return loc('city_apartment_title1');
    }
}

export function housingLabel(type){
    switch (type){
        case 'small':
            return basicHousingLabel();
        case 'medium':
            return mediumHousingLabel();
        case 'large':
            return largeHousingLabel();
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

    const date = new Date();
    if (global.race.species === 'elven' && date.getMonth() === 11 && date.getDate() >= 17){
        global.race['slaver'] = 1;
    }

    if (global.race['no_crispr']){
        let bad = ['diverse','arrogant','angry','lazy','herbivore','paranoid','greedy','puny','dumb','nearsighted','gluttony','slow','hard_of_hearing','pessimistic','solitary','pyrophobia','skittish','nyctophilia','fraile','atrophy','invertebrate','pathetic'];
        for (let i=0; i<10; i++){
            let trait = bad[Math.rand(0,bad.length)];
            if ((global.race['carnivore'] && trait === 'herbivore') || (global.race['smart'] && trait === 'dumb')) {
                continue;
            }
            if (!global.race[trait]){
                global.race[trait] = 1;
                break;
            }
        }
    }

    if (global.race.universe === 'evil'){
        if (global.race['evil']){
            delete global.race['evil'];
        }
        else if (races[global.race.species].type !== 'angelic'){
            global.race['evil'] = 1;
        }
    }

    if (global.race['unified']){
        global.tech['world_control'] = 1;
        global.tech['unify'] = 2;
    }

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
    if (global.race['evil'] && !global.race['kindling_kindred']){
        global.city['slaughter'] = 1;
        city_actions = ['slaughter'];
    }
    for (var i = 0; i < city_actions.length; i++) {
        if (global.city[city_actions[i]]){
            addAction('city',city_actions[i]);
        }
    }

    global.settings.civTabs = 1;
    global.settings.showEvolve = false;
    global.settings.showCity = true;

    global.civic.govern.type = 'anarchy';
    global.civic.govern.rev = 0;
    global.civic.govern.fr = 0;

    if (global.race.gods !== 'none'){
        global.tech['religion'] = 1;
    }
    if (global.genes['queue']){
        global.tech['queue'] = 1;
        global.tech['r_queue'] = 1;
        global.queue.display = true;
        global.r_queue.display = true;
    }

    Object.keys(global.genes.minor).forEach(function (trait){
        global.race[trait] = global.genes.minor[trait];
    });

    if (global.genes['evolve'] && global.genes['evolve'] >= 2){
        randomMinorTrait();
    }

    let civ0name = genCivName();
    global.civic.foreign.gov0['name'] = {
        s0: civ0name.s0,
        s1: civ0name.s1
    };
    let civ1name = genCivName();
    while (civ0name.s0 === civ1name.s0 && civ0name.s1 === civ1name.s1){
        civ1name = genCivName();
    }
    global.civic.foreign.gov1['name'] = {
        s0: civ1name.s0,
        s1: civ1name.s1
    };
    let civ2name = genCivName();
    while ((civ0name.s0 === civ2name.s0 && civ0name.s1 === civ2name.s1) || (civ1name.s0 === civ2name.s0 && civ1name.s1 === civ2name.s1)){
        civ2name = genCivName();
    }
    global.civic.foreign.gov2['name'] = {
        s0: civ2name.s0,
        s1: civ2name.s1
    };

    messageQueue(loc('sentience',[races[global.race.species].type,races[global.race.species].entity,races[global.race.species].name]));

    if (global.race['slow'] || global.race['hyper']){
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        window.location.reload();
    }

    defineGarrison();
}

function fanaticism(god){
    switch (god){
        case 'human':
            fanaticTrait('creative');
            break;
        case 'elven':
            fanaticTrait('studious');
            break;
        case 'orc':
            fanaticTrait('brute');
            break;
        case 'cath':
            if (global.race['herbivore']){
                randomMinorTrait();
                arpa('Genetics');
            }
            else {
                fanaticTrait('carnivore');
                if (global.race.species === 'entish'){
                    unlockAchieve(`madagascar_tree`);
                }
            }
            break;
        case 'wolven':
            fanaticTrait('tracker');
            break;
        case 'centaur':
            fanaticTrait('beast_of_burden');
            break;
        case 'kobold':
            fanaticTrait('pack_rat');
            break;
        case 'goblin':
            fanaticTrait('merchant');
            break;
        case 'gnome':
            if (global.race['dumb']){
                randomMinorTrait();
                arpa('Genetics');
            }
            else {
                fanaticTrait('smart');
            }
            break;
        case 'orge':
            fanaticTrait('tough');
            break;
        case 'cyclops':
            fanaticTrait('intelligent');
            break;
        case 'troll':
            fanaticTrait('regenerative');
            break;
        case 'tortoisan':
            fanaticTrait('armored');
            break;
        case 'gecko':
            fanaticTrait('optimistic');
            break;
        case 'slitheryn':
            fanaticTrait('slow_digestion');
            break;
        case 'arraak':
            fanaticTrait('resourceful');
            break;
        case 'pterodacti':
            fanaticTrait('leathery');
            break;
        case 'dracnid':
            fanaticTrait('hoarder');
            break;
        case 'entish':
            fanaticTrait('kindling_kindred');
            break;
        case 'cacti':
            fanaticTrait('hyper');
            break;
        case 'sporgar':
            fanaticTrait('infectious');
            if (global.race.species === 'human'){
                unlockAchieve(`infested`);
            }
            break;
        case 'shroomi':
            fanaticTrait('toxic');
            break;
        case 'mantis':
            fanaticTrait('cannibalize');
            break;
        case 'scorpid':
            fanaticTrait('claws');
            break;
        case 'antid':
            fanaticTrait('hivemind');
            break;
        case 'sharkin':
            fanaticTrait('frenzy');
            break;
        case 'octigoran':
            fanaticTrait('suction_grip');
            break;
        case 'dryad':
            fanaticTrait('befuddle');
            break;
        case 'satyr':
            fanaticTrait('musical');
            break;
        case 'phoenix':
            fanaticTrait('revive');
            break;
        case 'salamander':
            fanaticTrait('forge');
            break;
        case 'yeti':
            fanaticTrait('blurry');
            break;
        case 'wendigo':
            fanaticTrait('ghostly');
            break;
        case 'tuskin':
            fanaticTrait('lawless');
            break;
        case 'kamel':
            fanaticTrait('humpback');
            break;
        case 'balorg':
            fanaticTrait('fiery');
            break;
        case 'imp':
            fanaticTrait('conniving');
            break;
        case 'seraph':
            fanaticTrait('spiritual');
            break;
        case 'unicorn':
            fanaticTrait('magnificent');
            break;
        default:
            randomMinorTrait();
            arpa('Genetics');
            break;
    }
}

function fanaticTrait(trait){
    if (global.race[trait]){
        randomMinorTrait();
        arpa('Genetics');
    }
    else {
        global.race[trait] = 1;
        cleanAddTrait(trait);
    }
}

export function resQueue(){
    $('#resQueue').empty();

    let queue = $(`<ul class="buildList"></ul>`);
    $('#resQueue').append(queue);

    queue.append($(`<li v-for="(item, index) in queue"><a class="queued" v-bind:class="{ 'qany': item.qa }" @click="remove(index)"><span class="has-text-warning">{{ item.label }}</span> [<span v-bind:class="{ 'has-text-danger': item.cna, 'has-text-success': !item.cna }">{{ item.time | time }}</span>]</a></li>`));
    
    try {
        vBind({
            el: '#resQueue .buildList',
            data: global.r_queue,
            methods: {
                remove(index){
                    global.r_queue.queue.splice(index,1);
                }
            },
            filters: {
                time(time){
                    return timeFormat(time);
                }
            }
        });
        resDragQueue();
    }
    catch {
        global.r_queue.queue = [];
    }
}

export function resDragQueue(){
    let el = $('#resQueue .buildList')[0];
    Sortable.create(el,{
        onEnd(e){
            let order = global.r_queue.queue;
            order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
            global.r_queue.queue = order;
            resQueue();
        }
    });
}

export function bank_vault(){
    let vault = 1800;
    if (global.tech['vault'] >= 1){
        vault = (global.tech['vault'] + 1) * 7500;
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
        vault += 25 * global.resource[global.race.species].amount;
    }
    if (global.tech['stock_exchange']){
        vault *= 1 + (global.tech['stock_exchange'] * 0.1);
    }
    if (global.tech['world_control']){
        vault *= 1.25;
    }
    return vault;
}

function bioseed(){
    let god = global.race.species;
    let old_god = global.race.gods;
    let genus = races[god].type;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let plasmid = global.race.Plasmid.count;
    let antiplasmid = global.race.Plasmid.anti;
    let phage = global.race.Phage.count;
    let garrisoned = global.civic.garrison.workers;
    for (let i=0; i<3; i++){
        if (global.civic.foreign[`gov${i}`].occ){
            garrisoned += 20;
        }
    }
    let pop = global['resource'][global.race.species].amount + garrisoned;
    let new_plasmid = Math.round(pop / 3);
    let k_base = global.stats.know;
    let k_inc = 50000;
    while (k_base > k_inc){
        new_plasmid++;
        k_base -= k_inc;
        k_inc *= 1.015;
    }
    new_plasmid = challenge_multiplier(new_plasmid,'bioseed');
    let new_phage = challenge_multiplier(Math.floor(Math.log2(new_plasmid) * Math.E),'bioseed');
    phage += new_phage;
    global.stats.reset++;
    global.stats.bioseed++;
    global.stats.tdays += global.stats.days;
    global.stats.days = 0;
    global.stats.tknow += global.stats.know;
    global.stats.know = 0;
    global.stats.tstarved += global.stats.starved;
    global.stats.starved = 0;
    global.stats.tdied += global.stats.died;
    global.stats.died = 0;
    if (global.race.universe === 'antimatter'){
        antiplasmid += new_plasmid;
        global.stats.antiplasmid += new_plasmid;
    }
    else {
        plasmid += new_plasmid;
        global.stats.plasmid += new_plasmid;
    }
    global.stats.phage += new_phage;
    unlockAchieve(`seeder`);
    let new_biome = unlockAchieve(`biome_${biome}`);
    if (atmo !== 'none'){
        unlockAchieve(`atmo_${atmo}`);
    }
    let new_genus = unlockAchieve(`genus_${genus}`);
    let new_achieve = false;

    if (global.race.species === 'junker'){
        new_achieve = unlockFeat('organ_harvester');
    }
    if (global.city.biome === 'hellscape' && races[global.race.species].type !== 'demonic'){
        if (unlockFeat('ill_advised')){ new_achieve = true; };
    }
    let good_rocks = 0;
    let bad_rocks = 0;
    Object.keys(global.city.geology).forEach(function (g){
        if (global.city.geology[g] > 0) {
            good_rocks++;
        }
        else if (global.city.geology[g] < 0){
            bad_rocks++;
        }
    });
    if (good_rocks >= 4) {
        if (unlockAchieve('miners_dream')){ new_achieve = true; };
    }
    if (bad_rocks >= 3){
        if (unlockFeat('rocky_road')){ new_achieve = true; };
    }

    switch (global.race.universe){
        case 'heavy':
            if (unlockFeat(`heavy_genus_${genus}`)){ new_achieve = true; };
            break;
        default:
            break;
    }

    if (global.race['small'] || global.race['compact']){
        if (unlockAchieve(`macro`,true)){ new_achieve = true; }
    }
    else {
        if (unlockAchieve(`marble`,true)){ new_achieve = true; }
    }

    checkAchievements();

    let probes = global.starDock.probes.count + 1;
    if (global.stats.achieve['explorer']){
        probes += global.stats.achieve['explorer'].l;
    }
    global['race'] = { 
        species : 'protoplasm', 
        gods: god,
        old_gods: old_god,
        Plasmid: { count: plasmid, anti: antiplasmid },
        Phage: { count: phage },
        Dark: { count: global.race.Dark.count },
        universe: global.race.universe,
        seeded: true,
        probes: probes,
        seed: Math.floor(Math.seededRandom(10000)),
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
        biome: biome,
        ptrait: atmo
    };
    global.tech = { theology: 1 };
    clearStates();
    if (!new_biome && !new_genus && !new_achieve){
        global.lastMsg = false;
    }
    global.new = true;
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;
    
    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

function big_bang(){
    switch (global.race.universe){
        case 'heavy':
            unlockAchieve(`heavy`);
            break;
        case 'antimatter':
            unlockAchieve(`canceled`);
            break;
        case 'evil':
            unlockAchieve(`eviltwin`);
            break;
        case 'micro':
            unlockAchieve(`microbang`,true);
            break;
        default:
            unlockAchieve(`whitehole`);
            break;
    }

    if (global.race.universe === 'evil' && races[global.race.species].type === 'angelic'){
        unlockFeat('nephilim');
    }
    if (global.race.species === 'junker'){
        unlockFeat('the_misery');
    }
    if (global.race['decay']){
        unlockAchieve(`dissipated`);
    }

    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let plasmid = global.race.Plasmid.count;
    let antiplasmid = global.race.Plasmid.anti;
    let phage = global.race.Phage.count;
    let dark = global.race.Dark.count;
    let garrisoned = global.civic.garrison.workers;
    for (let i=0; i<3; i++){
        if (global.civic.foreign[`gov${i}`].occ){
            garrisoned += 20;
        }
    }
    let pop = global['resource'][global.race.species].amount + garrisoned;
    let new_plasmid = Math.round(pop / 2);
    let k_base = global.stats.know;
    let k_inc = 40000;
    while (k_base > k_inc){
        new_plasmid++;
        k_base -= k_inc;
        k_inc *= 1.012;
    }
    new_plasmid = challenge_multiplier(new_plasmid,'bigbang');
    let new_phage = challenge_multiplier(Math.floor(Math.log2(new_plasmid) * Math.E * 2.5),'bigbang');
    let new_dark = +(Math.log(1 + (global.interstellar.stellar_engine.exotic * 40))).toFixed(3);
    new_dark += +(Math.log2(global.interstellar.stellar_engine.mass - 7)/2.5).toFixed(3);
    new_dark = challenge_multiplier(new_dark,'bigbang',3);

    checkAchievements();

    phage += new_phage;
    global.stats.reset++;
    global.stats.blackhole++;
    global.stats.tdays += global.stats.days;
    global.stats.days = 0;
    global.stats.tknow += global.stats.know;
    global.stats.know = 0;
    global.stats.tstarved += global.stats.starved;
    global.stats.starved = 0;
    global.stats.tdied += global.stats.died;
    global.stats.died = 0;
    if (global.race.universe === 'antimatter'){
        antiplasmid += new_plasmid;
        global.stats.antiplasmid += new_plasmid;
    }
    else {
        plasmid += new_plasmid;
        global.stats.plasmid += new_plasmid;
    }
    global.stats.phage += new_phage;
    global.stats.universes++;
    global['race'] = { 
        species : 'protoplasm', 
        gods: god,
        old_gods: old_god,
        Plasmid: { count: plasmid, anti: antiplasmid },
        Phage: { count: phage },
        Dark: { count: +(dark + new_dark).toFixed(3) },
        universe: 'bigbang',
        seeded: true,
        bigbang: true,
        probes: 4,
        seed: Math.floor(Math.seededRandom(10000)),
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
        biome: biome,
        ptrait: atmo
    };
    global.tech = { theology: 1 };
    clearStates();
    global.new = true;
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;
    
    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}
