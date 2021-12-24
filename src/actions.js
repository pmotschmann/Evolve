import { global, save, webWorker, keyMultiplier, keyMap, srSpeak, sizeApproximation, p_on, support_on, gal_on, quantum_level } from './vars.js';
import { loc } from './locale.js';
import { timeCheck, timeFormat, vBind, popover, clearPopper, flib, tagEvent, clearElement, costMultiplier, darkEffect, genCivName, powerModifier, powerCostMod, calcPrestige, adjustCosts, modRes, messageQueue, buildQueue, format_emblem, calc_mastery, calcPillar, calcGenomeScore, getShrineBonus, eventActive, easterEgg, getHalloween, trickOrTreat } from './functions.js';
import { unlockAchieve, challengeIcon, alevel } from './achieve.js';
import { races, traits, genus_traits, neg_roll_traits, randomMinorTrait, cleanAddTrait, biomes, planetTraits, setJType, altRace, setTraitRank, setImitation, shapeShift } from './races.js';
import { defineResources, galacticTrade, spatialReasoning, resource_values } from './resources.js';
import { loadFoundry, defineJobs } from './jobs.js';
import { loadIndustry } from './industry.js';
import { defineGovernment, defineIndustry, defineGarrison, buildGarrison, commisionGarrison, foreignGov, armyRating } from './civics.js';
import { spaceTech, interstellarTech, galaxyTech, universe_affixes, renderSpace, piracy } from './space.js';
import { renderFortress, fortressTech } from './portal.js';
import { arpa, gainGene, gainBlood } from './arpa.js';
import { production } from './prod.js';
import { techList, techPath } from './tech.js';
import { govActive } from './governor.js';
import { bioseed } from './resets.js';
import { loadTab } from './index.js';

export const actions = {
    evolution: {
        rna: {
            id: 'evolution-rna',
            title: loc('resource_RNA_name'),
            desc(){
                let rna = global.race['rapid_mutation'] ? 2 : 1;
                return loc('evo_rna',[rna]);
            },
            action(){
                if(global['resource']['RNA'].amount < global['resource']['RNA'].max){
                    modRes('RNA',global.race['rapid_mutation'] ? 2 : 1,true);
                }
                return false;
            }
        },
        dna: {
            id: 'evolution-dna',
            title: loc('evo_dna_title'),
            desc: loc('evo_dna_desc'),
            cost: { RNA(){ return 2; } },
            action(){
                if (global['resource']['RNA'].amount >= 2 && global['resource']['DNA'].amount < global['resource']['DNA'].max){
                    modRes('RNA',-2,true);
                    modRes('DNA',1,true);
                }
                return false;
            },
            effect: loc('evo_dna_effect')
        },
        membrane: {
            id: 'evolution-membrane',
            title: loc('evo_membrane_title'),
            desc: loc('evo_membrane_desc'),
            cost: { RNA(offset){ return evolveCosts('membrane',2,2,offset); } },
            effect(){
                let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 5 + 5 : 5;
                return loc('evo_membrane_effect',[effect]);
            },
            action(){
                if (payCosts($(this)[0])){
                    global['resource']['RNA'].max += global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 5 + 5 : 5;
                    global.evolution['membrane'].count++;
                    return true;
                }
                return false;
            },
            queueable: true
        },
        organelles: {
            id: 'evolution-organelles',
            title: loc('evo_organelles_title'),
            desc: loc('evo_organelles_desc'),
            cost: {
                RNA(offset){ return evolveCosts('organelles',12,8,offset); },
                DNA(offset){ return evolveCosts('organelles',4,4,offset); }
            },
            effect(){
                let rna = global.race['rapid_mutation'] ? 2 : 1;
                if (global.evolution['sexual_reproduction'] && global.evolution['sexual_reproduction'].count > 0){
                    rna++;
                }
                return loc('evo_organelles_effect',[rna]);
            },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['organelles'].count++;
                    return true;
                }
                return false;
            },
            queueable: true
        },
        nucleus: {
            id: 'evolution-nucleus',
            title: loc('evo_nucleus_title'),
            desc: loc('evo_nucleus_desc'),
            cost: {
                RNA(offset){ return evolveCosts('nucleus',38, global.evolution['multicellular'] && global.evolution['multicellular'].count > 0 ? 16 : 32, offset ); },
                DNA(offset){ return evolveCosts('nucleus',18, global.evolution['multicellular'] && global.evolution['multicellular'].count > 0 ? 12 : 16, offset ); }
            },
            effect(){
                let dna = (global.evolution['bilateral_symmetry'] && global.evolution['bilateral_symmetry'].count > 0) || (global.evolution['poikilohydric'] && global.evolution['poikilohydric'].count > 0) || (global.evolution['spores'] && global.evolution['spores'].count > 0) ? 2 : 1;
                return loc('evo_nucleus_effect',[dna]);
            },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['nucleus'].count++;
                    return true;
                }
                return false;
            },
            queueable: true
        },
        eukaryotic_cell: {
            id: 'evolution-eukaryotic_cell',
            title: loc('evo_eukaryotic_title'),
            desc: loc('evo_eukaryotic_desc'),
            cost: {
                RNA(offset){ return evolveCosts('eukaryotic_cell',20,20,offset); },
                DNA(offset){ return evolveCosts('eukaryotic_cell',40,12,offset); }
            },
            effect(){
                let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 10 + 10 : 10;
                return loc('evo_eukaryotic_effect',[effect]);
            },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['eukaryotic_cell'].count++;
                    global['resource']['DNA'].max += global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 10 + 10 : 10;
                    return true;
                }
                return false;
            },
            queueable: true
        },
        mitochondria: {
            id: 'evolution-mitochondria',
            title: loc('evo_mitochondria_title'),
            desc: loc('evo_mitochondria_desc'),
            cost: {
                RNA(offset){ return evolveCosts('mitochondria',75,50,offset); },
                DNA(offset){ return evolveCosts('mitochondria',65,35,offset); }
            },
            effect: loc('evo_mitochondria_effect'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['mitochondria'].count++;
                    return true;
                }
                return false;
            },
            queueable: true
        },
        sexual_reproduction: {
            id: 'evolution-sexual_reproduction',
            title: loc('evo_sexual_reproduction_title'),
            desc: loc('evo_sexual_reproduction_desc'),
            cost: {
                DNA(){ return 150; }
            },
            effect: loc('evo_sexual_reproduction_effect'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['sexual_reproduction'].count++;
                    removeAction(actions.evolution.sexual_reproduction.id);

                    global.evolution['phagocytosis'] = { count: 0 };
                    addAction('evolution','phagocytosis');
                    global.evolution['chloroplasts'] = { count: 0 };
                    addAction('evolution','chloroplasts');
                    global.evolution['chitin'] = { count: 0 };
                    addAction('evolution','chitin');
                    if (global.stats.achieve['obsolete'] && global.stats.achieve[`obsolete`].l >= 5){
                        global.evolution['exterminate'] = { count: 0 };
                        addAction('evolution','exterminate');
                    }
                    global.evolution['final'] = 20;
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        phagocytosis: {
            id: 'evolution-phagocytosis',
            title: loc('evo_phagocytosis_title'),
            desc: loc('evo_phagocytosis_desc'),
            cost: {
                DNA(){ return 175; }
            },
            effect: loc('evo_phagocytosis_effect'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['phagocytosis'].count++;
                    removeAction(actions.evolution.phagocytosis.id);
                    removeAction(actions.evolution.chloroplasts.id);
                    removeAction(actions.evolution.chitin.id);
                    delete global.evolution.chloroplasts;
                    delete global.evolution.chitin;
                    if (global.stats.achieve['obsolete'] && global.stats.achieve[`obsolete`].l >= 5){
                        removeAction(actions.evolution.exterminate.id);
                        delete global.evolution.exterminate;
                    }
                    global.evolution['multicellular'] = { count: 0 };
                    global.evolution['final'] = 40;
                    addAction('evolution','multicellular');
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        chloroplasts: {
            id: 'evolution-chloroplasts',
            title: loc('evo_chloroplasts_title'),
            desc: loc('evo_chloroplasts_desc'),
            cost: {
                DNA(){ return 175; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_chloroplasts_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_chloroplasts_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['chloroplasts'].count++;
                    removeAction(actions.evolution.chloroplasts.id);
                    removeAction(actions.evolution.phagocytosis.id);
                    removeAction(actions.evolution.chitin.id);
                    delete global.evolution.phagocytosis;
                    delete global.evolution.chitin;
                    if (global.stats.achieve['obsolete'] && global.stats.achieve[`obsolete`].l >= 5){
                        removeAction(actions.evolution.exterminate.id);
                        delete global.evolution.exterminate;
                    }
                    global.evolution['multicellular'] = { count: 0 };
                    global.evolution['final'] = 40;
                    addAction('evolution','multicellular');
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        chitin: {
            id: 'evolution-chitin',
            title: loc('evo_chitin_title'),
            desc: loc('evo_chitin_desc'),
            cost: {
                DNA(){ return 175; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_chitin_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_chitin_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['chitin'].count++;
                    removeAction(actions.evolution.chitin.id);
                    removeAction(actions.evolution.phagocytosis.id);
                    removeAction(actions.evolution.chloroplasts.id);
                    delete global.evolution.phagocytosis;
                    delete global.evolution.chloroplasts;
                    if (global.stats.achieve['obsolete'] && global.stats.achieve[`obsolete`].l >= 5){
                        removeAction(actions.evolution.exterminate.id);
                        delete global.evolution.exterminate;
                    }
                    global.evolution['multicellular'] = { count: 0 };
                    global.evolution['final'] = 40;
                    addAction('evolution','multicellular');
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        exterminate: {
            id: 'evolution-exterminate',
            title: loc('evo_exterminate_title'),
            desc: loc('evo_exterminate_desc'),
            cost: {
                DNA(){ return 200; }
            },
            effect(){ return loc('evo_exterminate_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['exterminate'].count++;
                    removeAction(actions.evolution.chitin.id);
                    removeAction(actions.evolution.phagocytosis.id);
                    removeAction(actions.evolution.chloroplasts.id);
                    removeAction(actions.evolution.exterminate.id);
                    delete global.evolution.chitin;
                    delete global.evolution.phagocytosis;
                    delete global.evolution.chloroplasts;
                    cleanEvolution($(this)[0].id);
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['synth']);
                    addRaces(['nano']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'synthetic'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        multicellular: {
            id: 'evolution-multicellular',
            title: loc('evo_multicellular_title'),
            desc: loc('evo_multicellular_desc'),
            cost: {
                DNA(){ return 200; }
            },
            effect: loc('evo_multicellular_effect'),
            action(){
                if (payCosts($(this)[0])){
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
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        spores: {
            id: 'evolution-spores',
            title: loc('evo_spores_title'),
            desc: loc('evo_spores_desc'),
            cost: {
                DNA(){ return 230; }
            },
            effect: loc('evo_nucleus_boost'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['spores'].count++;
                    removeAction(actions.evolution.spores.id);
                    global.evolution['bryophyte'] = { count: 0 };
                    global.evolution['final'] = 80;
                    addAction('evolution','bryophyte');
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        poikilohydric: {
            id: 'evolution-poikilohydric',
            title: loc('evo_poikilohydric_title'),
            desc: loc('evo_poikilohydric_desc'),
            cost: {
                DNA(){ return 230; }
            },
            effect: loc('evo_nucleus_boost'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['poikilohydric'].count++;
                    removeAction(actions.evolution.poikilohydric.id);
                    global.evolution['bryophyte'] = { count: 0 };
                    global.evolution['final'] = 80;
                    addAction('evolution','bryophyte');
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        bilateral_symmetry: {
            id: 'evolution-bilateral_symmetry',
            title: loc('evo_bilateral_symmetry_title'),
            desc: loc('evo_bilateral_symmetry_desc'),
            cost: {
                DNA(){ return 230; }
            },
            effect: loc('evo_nucleus_boost'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['bilateral_symmetry'].count++;
                    removeAction(actions.evolution.bilateral_symmetry.id);
                    global.evolution['final'] = 80;

                    global.evolution['athropods'] = { count: 0 };
                    addAction('evolution','athropods');
                    global.evolution['mammals'] = { count: 0 };
                    addAction('evolution','mammals');
                    global.evolution['eggshell'] = { count: 0 };
                    addAction('evolution','eggshell');

                    if (global.city.biome === 'oceanic' || global.blood['unbound']){
                        global.evolution['aquatic'] = { count: 0 };
                        addAction('evolution','aquatic');
                    }
                    if (global.city.biome === 'forest' || global.blood['unbound']){
                        global.evolution['fey'] = { count: 0 };
                        addAction('evolution','fey');
                    }
                    if (global.city.biome === 'desert' || global.blood['unbound']){
                        global.evolution['sand'] = { count: 0 };
                        addAction('evolution','sand');
                    }
                    if (global.city.biome === 'volcanic' || global.blood['unbound']){
                        global.evolution['heat'] = { count: 0 };
                        addAction('evolution','heat');
                    }
                    if (global.city.biome === 'tundra' || global.blood['unbound']){
                        global.evolution['polar'] = { count: 0 };
                        addAction('evolution','polar');
                    }

                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        bryophyte: {
            id: 'evolution-bryophyte',
            title: loc('evo_bryophyte_title'),
            desc: loc('evo_bryophyte_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_bryophyte_effect'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['bryophyte'].count++;
                    removeAction(actions.evolution.bryophyte.id);
                    global.evolution['final'] = 100;
                    global.evolution['sentience'] = { count: 0 };
                    addAction('evolution','sentience');

                    if (global.evolution['chitin']){
                        addRaces(['sporgar','shroomi','moldling']);
                        if (races.custom.hasOwnProperty('type') && races.custom.type === 'fungi'){
                            global.evolution['custom'] = { count: 0 };
                            addAction('evolution','custom');
                        }
                    }
                    else {
                        addRaces(['entish','cacti','pinguicula']);
                        if (races.custom.hasOwnProperty('type') && races.custom.type === 'plant'){
                            global.evolution['custom'] = { count: 0 };
                            addAction('evolution','custom');
                        }
                    }

                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        athropods: {
            id: 'evolution-athropods',
            title: loc('evo_athropods_title'),
            desc: loc('evo_athropods_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_athropods_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_athropods_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['athropods'].count++;
                    cleanEvolution($(this)[0].id);
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['mantis','scorpid','antid']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'insectoid'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        mammals: {
            id: 'evolution-mammals',
            title: loc('evo_mammals_title'),
            desc: loc('evo_mammals_desc'),
            cost: {
                DNA(){ return 245; }
            },
            effect: loc('evo_mammals_effect'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['mammals'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    delete global.evolution.athropods;
                    delete global.evolution.eggshell;
                    if (global.city.biome === 'oceanic' || global.blood['unbound']){
                        removeAction(actions.evolution.aquatic.id);
                        delete global.evolution.aquatic;
                    }
                    if (global.city.biome === 'forest' || global.blood['unbound']){
                        removeAction(actions.evolution.fey.id);
                        delete global.evolution.fey;
                    }
                    if (global.city.biome === 'desert' || global.blood['unbound']){
                        removeAction(actions.evolution.sand.id);
                        delete global.evolution.sand;
                    }
                    if (global.city.biome === 'volcanic' || global.blood['unbound']){
                        removeAction(actions.evolution.heat.id);
                        delete global.evolution.heat;
                    }
                    if (global.city.biome === 'tundra' || global.blood['unbound']){
                        removeAction(actions.evolution.polar.id);
                        delete global.evolution.polar;
                    }
                    if (global.city.biome === 'hellscape' || global.blood['unbound'] && global.blood.unbound >= 3){
                        global.evolution['demonic'] = { count: 0 };
                        addAction('evolution','demonic');
                    }
                    if (global.city.biome === 'eden' || global.blood['unbound'] && global.blood.unbound >= 3){
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
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        humanoid: {
            id: 'evolution-humanoid',
            title: loc('evo_humanoid_title'),
            desc: loc('evo_humanoid_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_humanoid_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_humanoid_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['humanoid'].count++;
                    cleanEvolution($(this)[0].id);
                    if (global.city.biome === 'hellscape' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.celestial.id);
                        delete global.evolution.celestial;
                    }
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['human','orc','elven']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'humanoid'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        gigantism: {
            id: 'evolution-gigantism',
            title: loc('evo_gigantism_title'),
            desc: loc('evo_gigantism_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_gigantism_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_gigantism_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['gigantism'].count++;
                    cleanEvolution($(this)[0].id);
                    if (global.city.biome === 'hellscape' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.celestial.id);
                        delete global.evolution.celestial;
                    }
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['troll','ogre','cyclops']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'giant'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        dwarfism: {
            id: 'evolution-dwarfism',
            title: loc('evo_dwarfism_title'),
            desc: loc('evo_dwarfism_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_dwarfism_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_dwarfism_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['dwarfism'].count++;
                    cleanEvolution($(this)[0].id);
                    if (global.city.biome === 'hellscape' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.celestial.id);
                        delete global.evolution.celestial;
                    }
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['kobold','goblin','gnome']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'small'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        animalism: {
            id: 'evolution-animalism',
            title: loc('evo_animalism_title'),
            desc: loc('evo_animalism_desc'),
            cost: {
                DNA(){ return 250; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_animalism_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_animalism_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['animalism'].count++;
                    cleanEvolution($(this)[0].id);
                    if (global.city.biome === 'hellscape' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.celestial.id);
                        delete global.evolution.celestial;
                    }
                    global.evolution['final'] = 95;
                    global.evolution['carnivore'] = { count: 0 };
                    global.evolution['herbivore'] = { count: 0 };
                    //global.evolution['omnivore'] = { count: 0 };
                    addAction('evolution','carnivore');
                    addAction('evolution','herbivore');
                    //addAction('evolution','omnivore');
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        carnivore: {
            id: 'evolution-carnivore',
            title: loc('evo_carnivore_title'),
            desc: loc('evo_carnivore_desc'),
            cost: {
                DNA(){ return 255; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_carnivore_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_carnivore_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['carnivore'].count++;
                    delete global.evolution.herbivore;
                    delete global.evolution.omnivore;
                    removeAction(actions.evolution.carnivore.id);
                    removeAction(actions.evolution.herbivore.id);
                    removeAction(actions.evolution.omnivore.id);
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['cath','wolven','vulpine']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'carnivore'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        herbivore: {
            id: 'evolution-herbivore',
            title: loc('evo_herbivore_title'),
            desc: loc('evo_herbivore_desc'),
            cost: {
                DNA(){ return 255; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_herbivore_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_herbivore_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['herbivore'].count++;
                    delete global.evolution.carnivore;
                    delete global.evolution.omnivore;
                    removeAction(actions.evolution.carnivore.id);
                    removeAction(actions.evolution.herbivore.id);
                    removeAction(actions.evolution.omnivore.id);
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['centaur','rhinotaur','capybara']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'herbivore'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        omnivore: {
            id: 'evolution-omnivore',
            title: loc('evo_omnivore_title'),
            desc: loc('evo_omnivore_desc'),
            cost: {
                DNA(){ return 255; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_omnivore_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_herbivore_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['omnivore'].count++;
                    delete global.evolution.carnivore;
                    delete global.evolution.herbivore;
                    removeAction(actions.evolution.carnivore.id);
                    removeAction(actions.evolution.herbivore.id);
                    removeAction(actions.evolution.omnivore.id);
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['bearkin','porkenari','hedgeoken']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'omnivore'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        celestial: {
            id: 'evolution-celestial',
            title: loc('evo_celestial_title'),
            desc: loc('evo_celestial_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return loc('evo_celestial_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['celestial'].count++;
                    cleanEvolution($(this)[0].id);
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['seraph','unicorn']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'angelic'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        demonic: {
            id: 'evolution-demonic',
            title: loc('evo_demonic_title'),
            desc: loc('evo_demonic_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe === 'evil' ? `<div>${loc('evo_demonic_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_demonic_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['demonic'].count++;
                    cleanEvolution($(this)[0].id);
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['balorg','imp']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'demonic'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        aquatic: {
            id: 'evolution-aquatic',
            title: loc('evo_aquatic_title'),
            desc: loc('evo_aquatic_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_aquatic_effect'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['aquatic'].count++;
                    cleanEvolution($(this)[0].id);
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['sharkin','octigoran']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'aquatic'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        fey: {
            id: 'evolution-fey',
            title: loc('evo_fey_title'),
            desc: loc('evo_fey_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_fey_effect'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['fey'].count++;
                    cleanEvolution($(this)[0].id);
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['dryad','satyr']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'fey'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        heat: {
            id: 'evolution-heat',
            title: loc('evo_heat_title'),
            desc: loc('evo_heat_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_heat_effect'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['heat'].count++;
                    cleanEvolution($(this)[0].id);
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['phoenix','salamander']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'heat'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        polar: {
            id: 'evolution-polar',
            title: loc('evo_polar_title'),
            desc: loc('evo_polar_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_polar_effect'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['polar'].count++;
                    cleanEvolution($(this)[0].id);
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['yeti','wendigo']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'polar'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        sand: {
            id: 'evolution-sand',
            title: loc('evo_sand_title'),
            desc: loc('evo_sand_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_sand_effect'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['sand'].count++;
                    cleanEvolution($(this)[0].id);
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['tuskin','kamel']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'sand'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        eggshell: {
            id: 'evolution-eggshell',
            title: loc('evo_eggshell_title'),
            desc: loc('evo_eggshell_desc'),
            cost: {
                DNA(){ return 245; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_eggshell_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_eggshell_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['eggshell'].count++;
                    cleanEvolution($(this)[0].id);
                    global.evolution['endothermic'] = { count: 0 };
                    global.evolution['ectothermic'] = { count: 0 };
                    global.evolution['final'] = 90;
                    addAction('evolution','endothermic');
                    addAction('evolution','ectothermic');
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        endothermic: {
            id: 'evolution-endothermic',
            title: loc('evo_endothermic_title'),
            desc: loc('evo_endothermic_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_endothermic_effect'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['endothermic'].count++;
                    removeAction(actions.evolution.endothermic.id);
                    removeAction(actions.evolution.ectothermic.id);
                    delete global.evolution.ectothermic;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['arraak','pterodacti','dracnid']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'avian'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        ectothermic: {
            id: 'evolution-ectothermic',
            title: loc('evo_ectothermic_title'),
            desc: loc('evo_ectothermic_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_ectothermic_effect'),
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['ectothermic'].count++;
                    removeAction(actions.evolution.endothermic.id);
                    removeAction(actions.evolution.ectothermic.id);
                    delete global.evolution.endothermic;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['tortoisan','gecko','slitheryn']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'reptilian'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        sentience: {
            id: 'evolution-sentience',
            title: loc('evo_sentience_title'),
            desc: loc('evo_sentience_desc'),
            cost: {
                RNA(){ return 300; },
                DNA(){ return 300; }
            },
            effect(){ return global.evolution['exterminate'] ? loc('evo_sentience_ai_effect') : loc('evo_sentience_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);

                    // Trigger Next Phase of game
                    let races = [];
                    if (global.evolution['exterminate']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'synthetic';
                            races.push('junker');
                        }
                        else {
                            races.push('synth');
                            races.push('nano');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'synthetic'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['humanoid']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'humanoid';
                            races.push('junker');
                        }
                        else {
                            races.push('elven');
                            races.push('orc');
                            races.push('human');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'humanoid'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['gigantism']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'giant';
                            races.push('junker');
                        }
                        else {
                            races.push('troll');
                            races.push('ogre');
                            races.push('cyclops');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'giant'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['dwarfism']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'small';
                            races.push('junker');
                        }
                        else {
                            races.push('kobold');
                            races.push('goblin');
                            races.push('gnome');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'small'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['carnivore']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'carnivore';
                            races.push('junker');
                        }
                        else {
                            races.push('cath');
                            races.push('wolven');
                            races.push('vulpine');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'carnivore'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['herbivore']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'herbivore';
                            races.push('junker');
                        }
                        else {
                            races.push('centaur');
                            races.push('rhinotaur');
                            races.push('capybara');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'herbivore'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['omnivore']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'omnivore';
                            races.push('junker');
                        }
                        else {
                            races.push('bearkin');
                            races.push('porkenari');
                            races.push('hedgeoken');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'omnivore'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['ectothermic']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'reptilian';
                            races.push('junker');
                        }
                        else {
                            races.push('tortoisan');
                            races.push('gecko');
                            races.push('slitheryn');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'reptilian'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['endothermic']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'avian';
                            races.push('junker');
                        }
                        else {
                            races.push('arraak');
                            races.push('pterodacti');
                            races.push('dracnid');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'avian'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['chitin']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'fungi';
                            races.push('junker');
                        }
                        else {
                            races.push('sporgar');
                            races.push('shroomi');
                            races.push('moldling');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'fungi'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['athropods']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'insectoid';
                            races.push('junker');
                        }
                        else {
                            races.push('mantis');
                            races.push('scorpid');
                            races.push('antid');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'insectoid'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['chloroplasts']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'plant';
                            races.push('junker');
                        }
                        else {
                            races.push('entish');
                            races.push('cacti');
                            races.push('pinguicula');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'plant'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['aquatic']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'aquatic';
                            races.push('junker');
                        }
                        else {
                            races.push('sharkin');
                            races.push('octigoran');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'aquatic'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['fey']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'fey';
                            races.push('junker');
                        }
                        else {
                            races.push('dryad');
                            races.push('satyr');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'fey'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['heat']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'heat';
                            races.push('junker');
                        }
                        else {
                            races.push('phoenix');
                            races.push('salamander');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'heat'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['polar']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'polar';
                            races.push('junker');
                        }
                        else {
                            races.push('yeti');
                            races.push('wendigo');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'polar'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['sand']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'sand';
                            races.push('junker');
                        }
                        else {
                            races.push('tuskin');
                            races.push('kamel');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'sand'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['demonic']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'demonic';
                            races.push('junker');
                        }
                        else {
                            races.push('balorg');
                            races.push('imp');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'demonic'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['celestial']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'angelic';
                            races.push('junker');
                        }
                        else {
                            races.push('seraph');
                            races.push('unicorn');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'angelic'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['eggshell']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'avian';
                            races.push('junker');
                        }
                        else {
                            races.push('dracnid');
                        }
                    }
                    else {
                        if (global.race['junker']){
                            global.race['jtype'] = 'humanoid';
                            races.push('junker');
                        }
                        else {
                            races.push('human');
                        }
                    }

                    global.race.species = races[Math.floor(Math.seededRandom(0,races.length))];
                    if (global.stats.achieve[`extinct_${global.race.species}`] && global.stats.achieve[`extinct_${global.race.species}`].l >= 1){
                        global.race.species = races[Math.floor(Math.seededRandom(0,races.length))];
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
                else if (global.evolution['carnivore']){
                    return format_emblem('genus_carnivore');
                }
                else if (global.evolution['herbivore']){
                    return format_emblem('genus_herbivore');
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
                else if (global.evolution['fey']){
                    return format_emblem('genus_fey');
                }
                else if (global.evolution['heat']){
                    return format_emblem('genus_heat');
                }
                else if (global.evolution['polar']){
                    return format_emblem('genus_polar');
                }
                else if (global.evolution['sand']){
                    return format_emblem('genus_sand');
                }
                else if (global.evolution['demonic']){
                    return format_emblem('genus_demonic');
                }
                else if (global.evolution['celestial']){
                    return format_emblem('genus_angelic');
                }
                else if (global.evolution['exterminate']){
                    return format_emblem('genus_synthetic');
                }
                else {
                    return '';
                }
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true
        },
        custom: {
            id: 'evolution-custom',
            title(){ return races.custom.name; },
            desc(){ return `${loc("evo_evolve")} ${races.custom.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.custom.name]); },
            action(){
                if (payCosts($(this)[0])){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'custom';
                    sentience();
                    return true;
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true,
            emblem(){ return format_emblem('extinct_custom'); }
        },
        bunker: {
            id: 'evolution-bunker',
            title: loc('evo_bunker'),
            desc(){ return `<div>${loc('evo_bunker')}</div><div class="has-text-special">${loc('evo_challenge')}</div>`; },
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_bunker_effect'),
            action(){
                if (payCosts($(this)[0])){
                    setChallengeScreen();
                }
                return false;
            },
            no_queue(){
                let key = $(this)[0].id.split('-')[1];
                return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
            },
            queue_complete(){ return 1; },
            queueable: true,
            flair: loc('evo_bunker_flair')
        },
        joyless: {
            id: 'evolution-joyless',
            title: loc('evo_challenge_joyless'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div>${loc('evo_challenge_joyless_desc')}</div>` : loc('evo_challenge_joyless_desc'); },
            cost: {
                DNA(){ return 25; }
            },
            effect: loc('evo_challenge_joyless_effect'),
            action(){
                if (payCosts($(this)[0])){
                    if (global.race['joyless']){
                        delete global.race['joyless'];
                        $(`#${$(this)[0].id}`).removeClass('hl');
                    }
                    else {
                        global.race['joyless'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');
                    }
                    challengeIcon();
                }
                return false;
            },
            emblem(){ return format_emblem('joyless'); },
            flair: loc('evo_challenge_joyless_flair'),
            highlight(){ return global.race['joyless'] ? true : false; }
        },
        steelen: {
            id: 'evolution-steelen',
            title: loc('evo_challenge_steelen'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div>${loc('evo_challenge_steelen_desc')}</div>` : loc('evo_challenge_steelen_desc'); },
            cost: {
                DNA(){ return 25; }
            },
            effect: loc('evo_challenge_steelen_effect'),
            action(){
                if (payCosts($(this)[0])){
                    if (global.race['steelen']){
                        delete global.race['steelen'];
                        $(`#${$(this)[0].id}`).removeClass('hl');
                    }
                    else {
                        global.race['steelen'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');
                    }
                    challengeIcon();
                }
                return false;
            },
            emblem(){ return format_emblem('steelen'); },
            flair: loc('evo_challenge_steelen_flair'),
            highlight(){ return global.race['steelen'] ? true : false; }
        },
        decay: {
            id: 'evolution-decay',
            title: loc('evo_challenge_decay'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div>${loc('evo_challenge_decay_desc')}</div>` : loc('evo_challenge_decay_desc'); },
            cost: {
                DNA(){ return 25; }
            },
            effect: loc('evo_challenge_decay_effect'),
            action(){
                if (payCosts($(this)[0])){
                    if (global.race['decay']){
                        delete global.race['decay'];
                        $(`#${$(this)[0].id}`).removeClass('hl');
                    }
                    else {
                        global.race['decay'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');
                    }
                    challengeIcon();
                }
                return false;
            },
            emblem(){ return format_emblem('dissipated'); },
            flair: loc('evo_challenge_decay_flair'),
            highlight(){ return global.race['decay'] ? true : false; }
        },
        emfield: {
            id: 'evolution-emfield',
            title: loc('evo_challenge_emfield'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div>${loc('evo_challenge_emfield_desc')}</div>` : loc('evo_challenge_emfield_desc'); },
            cost: {
                DNA(){ return 25; }
            },
            effect: loc('evo_challenge_emfield_effect'),
            action(){
                if (payCosts($(this)[0])){
                    if (global.race['emfield']){
                        delete global.race['emfield'];
                        $(`#${$(this)[0].id}`).removeClass('hl');
                    }
                    else {
                        global.race['emfield'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');
                    }
                    challengeIcon();
                }
                return false;
            },
            emblem(){ return format_emblem('technophobe'); },
            flair: loc('evo_challenge_emfield_flair'),
            highlight(){ return global.race['emfield'] ? true : false; }
        },
        inflation: {
            id: 'evolution-inflation',
            title: loc('evo_challenge_inflation'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div>${loc('evo_challenge_inflation_desc')}</div>` : loc('evo_challenge_inflation_desc'); },
            cost: {
                DNA(){ return 25; }
            },
            effect: loc('evo_challenge_inflation_effect'),
            action(){
                if (payCosts($(this)[0])){
                    if (global.race['inflation']){
                        delete global.race['inflation'];
                        $(`#${$(this)[0].id}`).removeClass('hl');
                    }
                    else {
                        global.race['inflation'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');
                    }
                    challengeIcon();
                }
                return false;
            },
            emblem(){ return format_emblem('wheelbarrow'); },
            flair: loc('evo_challenge_inflation_flair'),
            highlight(){ return global.race['inflation'] ? true : false; }
        },
        junker: {
            id: 'evolution-junker',
            title: loc('evo_challenge_junker'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div class="has-text-danger">${loc('evo_start')}</div>` : `<div>${loc('evo_challenge_junker_desc')}</div><div class="has-text-danger">${loc('evo_start')}</div>`; },
            cost: {
                DNA(){ return 50; }
            },
            effect(){
                return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_challenge_junker_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_challenge_junker_effect'); },
            action(){
                if (payCosts($(this)[0])){
                    setScenario('junker');
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_junker'); },
            flair: loc('evo_challenge_junker_flair'),
            highlight(){ return global.race['junker'] ? true : false; }
        },
        cataclysm: {
            id: 'evolution-cataclysm',
            title: loc('evo_challenge_cataclysm'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div>` : `<div>${loc('evo_challenge_cataclysm_desc')}</div>`; },
            cost: {
                DNA(){ return 50; }
            },
            effect(){
                if (calc_mastery() >= 50){
                    return `<div>${loc('evo_challenge_cataclysm_effect')}</div><div class="has-text-caution">${loc('evo_challenge_cataclysm_warn')}</div>`;
                }
                else {
                    return `<div>${loc('evo_challenge_cataclysm_effect')}</div><div class="has-text-danger">${loc('evo_challenge_scenario_warn')}</div>`;
                }
            },
            action(){
                if (payCosts($(this)[0])){
                    setScenario('cataclysm');
                }
                return false;
            },
            emblem(){ return format_emblem('iron_will'); },
            flair: loc('evo_challenge_cataclysm_flair'),
            highlight(){ return global.race['cataclysm'] ? true : false; }
        },
        banana: {
            id: 'evolution-banana',
            title: loc('evo_challenge_banana'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div>${loc('evo_challenge_banana_desc')}</div>` : loc('evo_challenge_banana_desc'); },
            cost: {
                DNA(){ return 50; }
            },
            effect: loc('evo_challenge_banana_effect'),
            action(){
                if (payCosts($(this)[0])){
                    setScenario('banana');
                }
                return false;
            },
            emblem(){ return format_emblem('banana'); },
            flair: loc('evo_challenge_banana_flair'),
            highlight(){ return global.race['banana'] ? true : false; }
        },
        truepath: {
            id: 'evolution-truepath',
            title: loc('evo_challenge_truepath'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div>${loc('evo_challenge_truepath_desc')}</div>` : loc('evo_challenge_truepath_desc'); },
            cost: {
                DNA(){ return 50; }
            },
            effect: loc('evo_challenge_truepath_effect'),
            action(){
                if (payCosts($(this)[0])){
                    setScenario('truepath');
                }
                return false;
            },
            emblem(){ return format_emblem('pathfinder'); },
            flair: loc('evo_challenge_truepath_flair'),
            highlight(){ return global.race['truepath'] ? true : false; }
        },
    },
    city: {
        gift: {
            id: 'city-gift',
            title: loc('city_gift'),
            desc: loc('city_gift_desc'),
            wiki: false,
            category: 'outskirts',
            reqs: { primitive: 1 },
            no_queue(){ return true },
            not_tech: ['santa'],
            not_trait: ['cataclysm'],
            class: ['hgift'],
            condition(){
                const date = new Date();
                if (date.getMonth() !== 11 || (date.getMonth() === 11 && (date.getDate() <= 16 || date.getDate() >= 25))){
                    let active_gift = false;
                    if (global['special'] && global.special['gift']){
                        Object.keys(global.special.gift).forEach(function(g){
                            if (global.special.gift[g]){
                                active_gift = true;
                            }
                        });
                    }
                    return active_gift;
                }
                return false;
            },
            count(){
                let gift_count = 0;
                if (global['special'] && global.special['gift']){
                    Object.keys(global.special.gift).forEach(function(g){
                        if (global.special.gift[g]){
                            gift_count++;
                        }
                    });
                }
                return gift_count;
            },
            action(){
                const date = new Date();

                let active_gift = false;
                if (global['special'] && global.special['gift']){
                    Object.keys(global.special.gift).forEach(function(g){
                        if (global.special.gift[g]){
                            active_gift = g;
                        }
                    });
                }
                
                if (date.getMonth() !== 11 || (date.getMonth() === 11 && (date.getDate() <= 16 || date.getDate() >= 25))){
                    if (active_gift === `g2019`){
                        if (global['special'] && global.special['gift']){
                            delete global.special.gift[active_gift];
                            if (global.race.universe === 'antimatter'){
                                global.race.Plasmid.anti += 100;
                                global.stats.antiplasmid += 100;
                                messageQueue(loc('city_gift_msg',[100,loc('arpa_genepool_effect_antiplasmid')]),'info',false,['events']);
                            }
                            else {
                                global.race.Plasmid.count += 100;
                                global.stats.plasmid += 100;
                                messageQueue(loc('city_gift_msg',[100,loc('arpa_genepool_effect_plasmid')]),'info',false,['events']);
                            }
                            drawCity();
                        }
                    }
                    else {
                        if (global['special'] && global.special['gift']){
                            delete global.special.gift[active_gift];
                            
                            let resets = global.stats.hasOwnProperty('reset') ? global.stats.reset : 0;
                            let mad = global.stats.hasOwnProperty('mad') ? global.stats.mad : 0;
                            let bioseed = global.stats.hasOwnProperty('bioseed') ? global.stats.bioseed : 0;
                            let cataclysm = global.stats.hasOwnProperty('cataclysm') ? global.stats.cataclysm : 0;
    
                            let plasmid = 100 + resets + mad;
                            let phage = bioseed + cataclysm;
                            let gift = [];

                            if (global.stats.died + global.stats.tdied > 0){
                                let dead = global.stats.died + global.stats.tdied;
                                global.resource.Coal.amount += dead;
                                gift.push(`${dead.toLocaleString()} ${loc(`resource_Coal_name`)}`);
                            }

                            if (global.race.universe === 'antimatter'){
                                global.race.Plasmid.anti += plasmid;
                                global.stats.antiplasmid += plasmid;
                                gift.push(`${plasmid.toLocaleString()} ${loc(`resource_AntiPlasmid_plural_name`)}`);
                            }
                            else {
                                global.race.Plasmid.count += plasmid;
                                global.stats.plasmid += plasmid;
                                gift.push(`${plasmid.toLocaleString()} ${loc(`resource_Plasmid_plural_name`)}`);
                            }
                            if (phage > 0){
                                global.race.Phage.count += phage;
                                global.stats.phage += phage;
                                gift.push(`${phage.toLocaleString()} ${loc(`resource_Phage_name`)}`);
                            }
    
                            if (global.stats.hasOwnProperty('achieve')){
                                let universe = global.stats.achieve['whitehole'] ? global.stats.achieve['whitehole'].l : 0;
                                universe += global.stats.achieve['heavy'] ? global.stats.achieve['heavy'].l : 0;
                                universe += global.stats.achieve['canceled'] ? global.stats.achieve['canceled'].l : 0;
                                universe += global.stats.achieve['eviltwin'] ? global.stats.achieve['eviltwin'].l : 0;
                                universe += global.stats.achieve['microbang'] ? global.stats.achieve['microbang'].l : 0;
                                universe += global.stats.achieve['pw_apocalypse'] ? global.stats.achieve['pw_apocalypse'].l : 0;
    
                                let ascended = global.stats.achieve['ascended'] ? global.stats.achieve['ascended'].l : 0;
                                let descend = global.stats.achieve['corrupted'] ? global.stats.achieve['corrupted'].l : 0;
                                let ai = global.stats.achieve['obsolete'] ? global.stats.achieve['obsolete'].l : 0;
    
                                if (universe > 30){ universe = 30; }
                                if (ascended > 5){ ascended = 5; }
                                if (descend > 5){ descend = 5; }
                                
                                if (universe > 0){
                                    let dark = +(universe / 7.5).toFixed(2);
                                    global.race.Dark.count += dark;
                                    global.stats.dark += dark;
                                    gift.push(`${dark} ${loc(`resource_Dark_name`)}`);
                                }
                                if (ascended > 0){
                                    global.race.Harmony.count += ascended;
                                    global.stats.harmony += ascended;
                                    gift.push(`${ascended} ${loc(`resource_Harmony_name`)}`);
                                }
                                if (descend > 0){
                                    let blood = descend * 5;
                                    let art = descend;
                                    global.resource.Blood_Stone.amount += blood;
                                    global.stats.blood += blood;
                                    global.resource.Artifact.amount += art;
                                    global.stats.artifact += art;
                                    gift.push(`${blood} ${loc(`resource_Blood_Stone_name`)}`);
                                    gift.push(`${art} ${loc(`resource_Artifact_name`)}`);
                                }
                                if (active_gift !== `g2020` && ai > 0){
                                    global.race.AICore.count += ai;
                                    global.stats.cores += ai;
                                    gift.push(`${ai} ${loc(`resource_AICore_name`)}`);
                                }
                            }

                            messageQueue(loc('city_gift2_msg',[gift.join(", ")]),'info',false,['events']);
                            drawCity();
                        }
                    }

                }
                return false;
            },
            touchlabel: loc(`open`)
        },
        food: {
            id: 'city-food',
            title(){
                let hallowed = getHalloween();
                if (hallowed.active){
                    return global.tech['conjuring'] ? loc('city_trick_conjure') : loc('city_trick');
                }
                else {
                    return global.tech['conjuring'] ? loc('city_food_conjure') : loc('city_food');
                }
            },
            desc(){
                let gain = $(this)[0].val(false);
                let hallowed = getHalloween();
                if (hallowed.active){
                    return global.tech['conjuring'] ? loc('city_trick_conjure_desc',[gain]) : loc('city_trick_desc',[gain]);
                }
                else {
                    return global.tech['conjuring'] ? loc('city_food_conjure_desc',[gain]) : loc('city_food_desc',[gain]);
                }
            },
            category: 'outskirts',
            reqs: { primitive: 1 },
            not_trait: ['soul_eater','cataclysm','artifical'],
            no_queue(){ return true },
            cost: {
                Mana(){ return global.tech['conjuring'] ? 1 : 0; },
            },
            action(){
                if(global['resource']['Food'].amount < global['resource']['Food'].max){
                    modRes('Food',$(this)[0].val(true),true);
                }
                global.stats.cfood++;
                global.stats.tfood++;
                return false;
            },
            val(spend){
                let gain = global.race['strong'] ? traits.strong.vars()[0] : 1;
                if (global.genes['enhance']){
                    gain *= 2;
                }
                if (global.tech['conjuring'] && global.resource.Mana.amount >= 1){
                    gain *= 10;
                    if (global['resource']['Food'].amount < global['resource']['Food'].max && spend){
                        modRes('Mana',-1,true);
                    }
                }
                return gain;
            },
            touchlabel: loc(`harvest`)
        },
        lumber: {
            id: 'city-lumber',
            title(){
                let hallowed = getHalloween();
                if (hallowed.active){
                    return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? loc('city_dig_conjour') : loc('city_dig');
                }
                else {
                    return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? loc('city_lumber_conjure') : loc('city_lumber');
                }
            },
            desc(){
                let gain = $(this)[0].val(false);
                let hallowed = getHalloween();
                if (hallowed.active){
                    return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? loc('city_dig_conjour_desc',[gain]) : loc('city_dig_desc',[gain]);
                }
                else {
                    return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? loc('city_lumber_conjure_desc',[gain]) : loc('city_lumber_desc',[gain]);
                }
            },
            category: 'outskirts',
            reqs: {},
            not_trait: ['evil','cataclysm'],
            no_queue(){ return true },
            cost: {
                Mana(){ return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? 1 : 0; },
            },
            action(){
                if (global['resource']['Lumber'].amount < global['resource']['Lumber'].max){
                    modRes('Lumber',$(this)[0].val(true),true);
                }
                global.stats.clumber++;
                global.stats.tlumber++;
                return false;
            },
            val(spend){
                let gain = global.race['strong'] ? traits.strong.vars()[0] : 1;
                if (global.genes['enhance']){
                    gain *= 2;
                }
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2 && global.resource.Mana.amount >= 1){
                    gain *= 10;
                    if (global['resource']['Lumber'].amount < global['resource']['Lumber'].max && spend){
                        modRes('Mana',-1,true);
                    }
                }
                return gain;
            },
            touchlabel: loc(`harvest`)
        },
        stone: {
            id: 'city-stone',
            title(){
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2){
                    return global.race['sappy'] ? loc('city_amber_conjour') : loc('city_stone_conjour');
                }
                else {
                    return loc(`city_gather`,[global.resource.Stone.name]);
                }                
            },
            desc(){
                let gain = $(this)[0].val(false);
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2){
                    return loc('city_stone_conjour_desc',[gain,global.resource.Stone.name]);
                }
                else {
                    return loc(global.race['sappy'] ? 'city_amber_desc' : 'city_stone_desc',[gain,global.resource.Stone.name]);
                }                
            },
            category: 'outskirts',
            reqs: { primitive: 2 },
            not_trait: ['cataclysm'],
            no_queue(){ return true },
            cost: {
                Mana(){ return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? 1 : 0; },
            },
            action(){
                if (global['resource']['Stone'].amount < global['resource']['Stone'].max){
                    modRes('Stone',$(this)[0].val(true),true);
                }
                global.stats.cstone++;
                global.stats.tstone++;
                return false;
            },
            val(spend){
                let gain = global.race['strong'] ? traits.strong.vars()[0] : 1;
                if (global.genes['enhance']){
                    gain *= 2;
                }
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2 && global.resource.Mana.amount >= 1){
                    gain *= 10;
                    if (global['resource']['Stone'].amount < global['resource']['Stone'].max && spend){
                        modRes('Mana',-1,true);
                    }
                }
                return gain;
            },
            touchlabel: loc(`harvest`)
        },
        chrysotile: {
            id: 'city-chrysotile',
            title(){
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2){
                    return loc('city_chrysotile_conjour');
                }
                else {
                    return loc(`city_gather`,[global.resource.Chrysotile.name]);
                }                
            },
            desc(){
                let gain = $(this)[0].val(false);
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2){
                    return loc('city_stone_conjour_desc',[gain,global.resource.Chrysotile.name]);
                }
                else {
                    return loc('city_stone_desc',[gain,global.resource.Chrysotile.name]);
                }                
            },
            category: 'outskirts',
            reqs: { primitive: 2 },
            trait: ['smoldering'],
            not_trait: ['cataclysm'],
            no_queue(){ return true },
            cost: {
                Mana(){ return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? 1 : 0; },
            },
            action(){
                if (global['resource']['Chrysotile'].amount < global['resource']['Chrysotile'].max){
                    modRes('Chrysotile',$(this)[0].val(true),true);
                }
                return false;
            },
            val(spend){
                let gain = global.race['strong'] ? traits.strong.vars()[0] : 1;
                if (global.genes['enhance']){
                    gain *= 2;
                }
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2 && global.resource.Mana.amount >= 1){
                    gain *= 10;
                    if (global['resource']['Chrysotile'].amount < global['resource']['Chrysotile'].max && spend){
                        modRes('Mana',-1,true);
                    }
                }
                return gain;
            },
            touchlabel: loc(`harvest`)
        },
        slaughter: {
            id: 'city-slaughter',
            title: loc('city_evil'),
            desc(){
                if (global.race['soul_eater']){
                    return global.tech['primitive'] ? (global.resource.hasOwnProperty('furs') && global.resource.Furs.display ? loc('city_evil_desc3') : loc('city_evil_desc2')) : loc('city_evil_desc1');
                }
                else {
                    return global.resource.hasOwnProperty('furs') && global.resource.Furs.display ? loc('city_evil_desc4') : loc('city_evil_desc1');
                }
            },
            category: 'outskirts',
            reqs: {},
            trait: ['evil'],
            not_trait: ['kindling_kindred','smoldering','cataclysm'],
            no_queue(){ return true },
            action(){
                let gain = global.race['strong'] ? traits.strong.vars()[0] : 1;
                if (global.genes['enhance']){
                    gain *= 2;
                }
                if (!global.race['smoldering']){
                    if (global['resource']['Lumber'].amount < global['resource']['Lumber'].max){
                        modRes('Lumber',gain,true);
                    }
                    global.stats.clumber++;
                    global.stats.tlumber++;
                }
                if (global.race['soul_eater']){
                    if (global.tech['primitive'] && global['resource']['Food'].amount < global['resource']['Food'].max){
                        modRes('Food',gain,true);
                    }
                    global.stats.cfood++;
                    global.stats.tfood++;
                }
                if (global.resource.Furs.display && global['resource']['Furs'].amount < global['resource']['Furs'].max){
                    modRes('Furs',gain,true);
                }
                return false;
            },
            touchlabel: loc(`kill`)
        },
        horseshoe: {
            id: 'city-horseshoe',
            title: loc('city_horseshoe'),
            desc(){
                return loc(`city_horseshoe_desc`);
            },
            category: 'outskirts',
            reqs: { primitive: 3 },
            trait: ['hooved'],
            not_trait: ['cataclysm'],
            inflation: false,
            cost: {
                Lumber(offset){
                    let shoes = (global.race['shoecnt'] || 0) + (offset || 0);
                    let active = !global.race['kindling_kindred'] && !global.race['smoldering']
                        && (!global.resource.Copper.display || shoes <= 12) ? true : false;
                    return active ? (shoes > 12 ? 25 : 5) * (shoes <= 5 ? 1 : shoes - 4) : 0;
                },
                Copper(offset){
                    let shoes = (global.race['shoecnt'] || 0) + (offset || 0);
                    let lum = (global.race['kindling_kindred'] || global.race['smoldering']) ? false : true;
                    let active = (!lum || (lum && shoes > 12 && global.resource.Copper.display))
                        && (!global.resource.Iron.display || shoes <= 75) ? true : false;
                    return active ? (shoes > 75 ? 20 : 5) * (shoes <= 12 ? 1 : shoes - 11) : 0;
                },
                Iron(offset){
                    let shoes = (global.race['shoecnt'] || 0) + (offset || 0);
                    return global.resource.Iron.display && shoes > 75 && (!global.resource.Steel.display || shoes <= 150) ? (shoes <= 150 ? 12 : 28) * shoes : 0;
                },
                Steel(offset){
                    let shoes = (global.race['shoecnt'] || 0) + (offset || 0);
                    return global.resource.Steel.display && shoes > 150 && (!global.resource.Adamantite.display || shoes <= 500) ? (shoes <= 500 ? 40 : 100) * shoes : 0;
                },
                Adamantite(offset){
                    let shoes = (global.race['shoecnt'] || 0) + (offset || 0);
                    return global.resource.Adamantite.display && shoes > 500 && (!global.resource.Orichalcum.display || shoes <= 5000) ? (shoes <= 5000 ? 5 : 25) * shoes : 0;
                },
                Orichalcum(offset){
                    let shoes = (global.race['shoecnt'] || 0) + (offset || 0);
                    return global.resource.Orichalcum.display && shoes > 5000 ? 25 * shoes - 120000 : 0;
                }
            },
            action(n){
                let keyMult = n || keyMultiplier();
                let shoed = false;
                for (var i=0; i<keyMult; i++){
                    if (global.resource.Horseshoe.display && payCosts($(this)[0])){
                        global.resource.Horseshoe.amount++;
                        global.race.shoecnt++;
                        shoed = true;
                    }
                }
                return shoed;
            },
        },
        bonfire: buildTemplate(`bonfire`,'city'),
        firework: buildTemplate(`firework`,'city'),
        slave_market: {
            id: 'city-slave_market',
            title: loc('city_slave_market'),
            desc: loc('city_slave_market_desc'),
            category: 'outskirts',
            reqs: { slaves: 2 },
            trait: ['slaver'],
            not_trait: ['cataclysm'],
            cost: {
                Money(){ return 25000; },
            },
            no_queue(){ return true },
            action(){
                if (global.race['slaver'] && global.city['slave_pen']){
                    let max = global.city.slave_pen.count * 4;
                    let keyMult = keyMultiplier();
                    for (var i=0; i<keyMult; i++){
                        if (max > global.city.slave_pen.slaves){
                            if (payCosts($(this)[0])){
                                global.city.slave_pen.slaves++;
                                global.resource.Slave.amount = global.city.slave_pen.slaves;
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
            },
            touchlabel: loc(`purchase`)
        },
        s_alter: {
            id: 'city-s_alter',
            title: loc('city_s_alter'),
            desc(){
                return global.city.hasOwnProperty('s_alter') && global.city['s_alter'].count >= 1 ? `<div>${loc('city_s_alter')}</div><div class="has-text-special">${loc('city_s_alter_desc')}</div>` : loc('city_s_alter');
            },
            category: 'outskirts',
            reqs: { mining: 1 },
            trait: ['cannibalize'],
            not_trait: ['cataclysm'],
            inflation: false,
            cost: {
                Stone(offset){ return ((offset || 0) + (global.city.hasOwnProperty('s_alter') ? global.city['s_alter'].count : 0)) >= 1 ? 0 : 100; }
            },
            effect(){
                let sacrifices = global.civic[global.civic.d_job].workers;
                let desc = `<div class="has-text-caution">${loc('city_s_alter_sacrifice',[sacrifices])}</div>`;
                if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.rage > 0){
                    desc = desc + `<div>${loc('city_s_alter_rage',[traits.cannibalize.vars()[0],timeFormat(global.city.s_alter.rage)])}</div>`;
                }
                if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.regen > 0){
                    desc = desc + `<div>${loc('city_s_alter_regen',[traits.cannibalize.vars()[0],timeFormat(global.city.s_alter.regen)])}</div>`;
                }
                if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.mind > 0){
                    desc = desc + `<div>${loc('city_s_alter_mind',[traits.cannibalize.vars()[0],timeFormat(global.city.s_alter.mind)])}</div>`;
                }
                if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.mine > 0){
                    desc = desc + `<div>${loc('city_s_alter_mine',[traits.cannibalize.vars()[0],timeFormat(global.city.s_alter.mine)])}</div>`;
                }
                if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.harvest > 0){
                    let jobType = global.race['evil'] && !global.race['soul_eater'] ? loc('job_reclaimer') : loc('job_lumberjack');
                    desc = desc + `<div>${loc('city_s_alter_harvest',[traits.cannibalize.vars()[0],timeFormat(global.city.s_alter.harvest),jobType])}</div>`;
                }
                return desc;
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.city['s_alter'].count === 0){
                        global.city['s_alter'].count++;
                    }
                    else {
                        let sacrifices = global.civic[global.civic.d_job].workers;
                        if (sacrifices > 0){
                            global['resource'][global.race.species].amount--;
                            global.civic[global.civic.d_job].workers--;
                            global.stats.sac++;
                            global['resource'].Food.amount += Math.rand(250,1000);
                            let low = 300;
                            let high = 600;
                            if (global.tech['sacrifice']){
                                switch (global.tech['sacrifice']){
                                    case 1:
                                        low = 600;
                                        high = 1500;
                                        break;
                                    case 2:
                                        low = 1800;
                                        high = 3600;
                                        break;
                                    case 3:
                                        low = 5400;
                                        high = 16200;
                                        break;
                                }
                            }
                            switch (global.race['kindling_kindred'] || global.race['smoldering'] ? Math.rand(0,4) : Math.rand(0,5)){
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
            },
            touchlabel: loc(`tech_dist_sacrifice`)
        },
        basic_housing: {
            id: 'city-basic_housing',
            title(){
                return basicHousingLabel();
            },
            desc: loc('city_basic_housing_desc'),
            category: 'residential',
            reqs: { housing: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['basic_housing'] ? global.city['basic_housing'].count : 0) + offset >= 5){
                        return costMultiplier('basic_housing', offset, 20, 1.17);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return global.race['kindling_kindred'] || global.race['smoldering'] ? 0 : costMultiplier('basic_housing', offset, 10, 1.23); },
                Stone(offset){ return global.race['kindling_kindred'] ? costMultiplier('basic_housing', offset, 10, 1.23) : 0; },
                Chrysotile(offset){ return global.race['smoldering'] ? costMultiplier('basic_housing', offset, 10, 1.23) : 0; },
                Horseshoe(){ return global.race['hooved'] ? 1 : 0; }
            },
            effect(){
                return global.race['sappy'] ? `<div>${loc('plus_max_resource',[1,loc('citizen')])}</div><div>${loc('city_grove_effect',[2.5])}</div>` : loc('plus_max_resource',[1,loc('citizen')]);
            },
            action(){
                if (payCosts($(this)[0])){
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('cottage', offset, 900, 1.15); },
                Plywood(offset){ return costMultiplier('cottage', offset, 25, 1.25); },
                Brick(offset){ return costMultiplier('cottage', offset, 20, 1.25); },
                Wrought_Iron(offset){ return costMultiplier('cottage', offset, 15, 1.25); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('cottage', offset, 5, 1.25) : 0; },
                Horseshoe(){ return global.race['hooved'] ? 2 : 0; }
            },
            effect(){
                if (global.tech['home_safe']){
                    let safe = spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 5000 : 2000) : 1000);
                    return `<div>${loc('plus_max_citizens',[2])}</div><div>${loc('plus_max_resource',[`\$${safe.toLocaleString()}`,loc('resource_Money_name')])}</div>`;
                }
                else {
                    return loc('plus_max_citizens',[2]);
                }
            },
            action(){
                if (payCosts($(this)[0])){
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
            desc(){
                return `<div>${loc('city_apartment_desc',[govActive('extravagant',0) ? 6 : 5])}</div><div class="has-text-special">${loc('requires_power')}</div>`
            },
            category: 'residential',
            reqs: { housing: 3 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('apartment', offset, 1750, 1.26) - 500; },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('apartment', offset, 25, 1.22) : 0; },
                Furs(offset){ return costMultiplier('apartment', offset, 725, 1.32) - 500; },
                Copper(offset){ return costMultiplier('apartment', offset, 650, 1.32) - 500; },
                Cement(offset){ return costMultiplier('apartment', offset, 700, 1.32) - 500; },
                Steel(offset){ return costMultiplier('apartment', offset, 800, 1.32) - 500; },
                Horseshoe(){ return global.race['hooved'] ? 5 : 0; }
            },
            effect(){
                let extraVal = govActive('extravagant',2);
                let pop = extraVal ? 5 + extraVal : 5;
                if (global.tech['home_safe']){
                    let safe = spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 10000 : 5000) : 2000);
                    if (extraVal){
                        safe *= 2;
                    }
                    return `<div>${loc('plus_max_citizens',[pop])}. <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div><div>${loc('plus_max_resource',[`\$${safe.toLocaleString()}`,loc('resource_Money_name')])}</div>`;
                }
                else {
                    return `${loc('plus_max_citizens',[pop])}. <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span>`;
                }
            },
            powered(){
                let extraVal = govActive('extravagant',1);
                return powerCostMod(extraVal ? extraVal : 1);
            },
            action(){
                if (payCosts($(this)[0])){
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
            desc(){ return global.race['detritivore'] ? loc('city_lodge_desc_alt') : loc('city_lodge_desc'); },
            category: 'residential',
            reqs: { housing: 1, currency: 1 },
            not_trait: ['cataclysm'],
            condition(){
                return ((global.race['soul_eater'] || global.race['detritivore'] || global.race['artifical']) && global.tech['s_lodge']) || (global.tech['hunting'] && global.tech['hunting'] >= 2) ? true : false;
            },
            cost: {
                Money(offset){ return costMultiplier('lodge', offset, 50, 1.32); },
                Lumber(offset){ return costMultiplier('lodge', offset, 20, 1.36); },
                Stone(offset){ return costMultiplier('lodge', offset, 10, 1.36); },
                Horseshoe(){ return global.race['hooved'] ? 1 : 0; }
            },
            effect(){
                return global.race['carnivore'] && !global.race['artifical'] ? `<div>${loc('plus_max_resource',[1,loc('citizen')])}</div><div>${loc('city_lodge_effect',[5])}</div>` : loc('plus_max_resource',[1,loc('citizen')]);
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['lodge'].count++;
                    global['resource'][global.race.species].display = true;
                    global['resource'][global.race.species].max += 1;
                    global.settings.showCivic = true;
                    return true;
                }
                return false;
            }
        },
        smokehouse: {
            id: 'city-smokehouse',
            title: loc('city_smokehouse'),
            desc: loc('city_smokehouse_desc'),
            category: 'trade',
            reqs: { hunting: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('smokehouse', offset, 85, 1.32); },
                Lumber(offset){ return costMultiplier('smokehouse', offset, 65, 1.36) },
                Stone(offset){ return costMultiplier('smokehouse', offset, 50, 1.36); }
            },
            effect(){
                let food = BHStorageMulti(spatialReasoning(100));
                return `<div>${loc('plus_max_resource',[food, loc('resource_Food_name')])}</div><div>${loc('city_smokehouse_effect',[10])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['smokehouse'].count++;
                    global['resource']['Food'].max += BHStorageMulti(spatialReasoning(100));
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['soul_well'] ? global.city['soul_well'].count : 0) + offset >= 3){
                        return costMultiplier('soul_well', offset, 50, 1.32);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return costMultiplier('soul_well', offset, 20, 1.36); },
                Stone(offset){ return costMultiplier('soul_well', offset, 10, 1.36); }
            },
            effect(){
                let souls = BHStorageMulti(spatialReasoning(500));
                let production = global.race['ghostly'] ? (2 + traits.ghostly.vars()[1]) : 2;
                return `<div>${loc('city_soul_well_effect',[production])}</div><div>${loc('plus_max_resource',[souls, loc('resource_Souls_name')])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['soul_well'].count++;
                    global['resource']['Food'].max += BHStorageMulti(spatialReasoning(500));
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('slave_pen', offset, 250, 1.32); },
                Lumber(offset){ return costMultiplier('slave_pen', offset, 100, 1.36); },
                Stone(offset){ return costMultiplier('slave_pen', offset, 75, 1.36); },
                Copper(offset){ return costMultiplier('slave_pen', offset, 10, 1.36); },
                Nanite(offset){ return global.race['deconstructor'] ? costMultiplier('slave_pen', offset, 4, 1.36) : 0; },
            },
            effect(){
                let max = global.city['slave_pen'] ? global.city.slave_pen.count * 4 : 4;
                let slaves = global.city['slave_pen'] ? global.city.slave_pen.slaves : 0;
                return `<div>${loc('city_slave_pen_effect',[4])}</div><div>${loc('city_slave_pen_effect2',[slaves,max])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['slave_pen'].count++;
                    global.resource.Slave.display = true;
                    global.resource.Slave.amount = global.city.slave_pen.slaves;
                    global.resource.Slave.max = global.city.slave_pen.count * 4;
                    return true;
                }
                return false;
            }
        },
        transmitter: {
            id: 'city-transmitter',
            title: loc('city_transmitter'),
            desc(){ return `<div>${loc('city_transmitter_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            category: 'residential',
            reqs: { high_tech: 4 },
            trait: ['artifical'],
            cost: {
                Money(offset){ if (global.city['transmitter'] && global.city['transmitter'].count >= 3){ return costMultiplier('transmitter', offset, 50, 1.32);} else { return 0; } },
                Copper(offset){ return costMultiplier('transmitter', offset, 20, 1.36); },
                Steel(offset){ return costMultiplier('transmitter', offset, 10, 1.36); },
            },
            effect(){
                let signal = +(production('transmitter')).toFixed(2);
                let sig_cap = spatialReasoning(100);
                return `<div>${loc('gain',[signal, global.resource.Food.name])}</div><div>${loc('city_transmitter_effect',[sig_cap])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(0.5); },
            action(){
                if (payCosts($(this)[0])){
                    global.city.transmitter.count++;
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.city.transmitter.on++;
                    }
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['farm'] ? global.city['farm'].count : 0) + offset >= 3){
                        return costMultiplier('farm', offset, 50, 1.32);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return costMultiplier('farm', offset, 20, 1.36); },
                Stone(offset){ return costMultiplier('farm', offset, 10, 1.36); },
                Horseshoe(offset){ return global.race['hooved'] && ((global.city['farm'] ? global.city['farm'].count : 0) + (offset || 0)) >= 2 ? 1 : 0; }
            },
            effect(){
                return global.tech['farm'] ? `<div>${loc('city_farm_effect')}</div><div>${loc('plus_max_resource',[1,loc('citizen')])}</div>` : loc('city_farm_effect');
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['farm'].count++;
                    global.civic.farmer.display = true;
                    if (global.tech['farm']){
                        global['resource'][global.race.species].display = true;
                        global['resource'][global.race.species].max += 1;
                        global.settings.showCivic = true;
                    }
                    return true;
                }
                return false;
            },
            flair(){ return global.tech.agriculture >= 7 ? loc('city_farm_flair2') : loc('city_farm_flair1'); }
        },
        compost: {
            id: 'city-compost',
            title: loc('city_compost_heap'),
            desc: loc('city_compost_heap_desc'),
            category: 'residential',
            reqs: { compost: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['compost'] ? global.city['compost'].count : 0) + offset >= 3){
                        return costMultiplier('compost', offset, 50, 1.32);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return costMultiplier('compost', offset, 12, 1.36); },
                Stone(offset){ return costMultiplier('compost', offset, 12, 1.36); }
            },
            effect(){
                let generated = 1.2 + ((global.tech['compost'] ? global.tech['compost'] : 0) * 0.8);
                generated *= global.city.biome === 'grassland' ? 1.2 : 1;
                generated *= global.city.biome === 'volcanic' ? 0.9 : 1;
                generated *= global.city.biome === 'hellscape' ? 0.25 : 1;
                generated *= global.city.ptrait === 'trashed' ? 0.75 : 1;
                generated = +(generated).toFixed(2);
                let store = BHStorageMulti(spatialReasoning(200));
                let wood = global.race['kindling_kindred'] ? `` : `<div class="has-text-caution">${loc('city_compost_heap_effect2',[0.5,global.resource.Lumber.name])}</div>`;
                return `<div>${loc('city_compost_heap_effect',[generated])}</div><div>${loc('city_compost_heap_effect3',[store])}</div>${wood}`;
            },
            switchable(){ return true; },
            action(){
                if (payCosts($(this)[0])){
                    global.city['compost'].count++;
                    global.city['compost'].on++;
                    global['resource']['Food'].max += BHStorageMulti(spatialReasoning(200));
                    return true;
                }
                return false;
            }
        },
        mill: {
            id: 'city-mill',
            title(){
                return global.tech['agriculture'] >= 5 ? loc('city_mill_title2') : loc('city_mill_title1');
            },
            desc(){
                let bonus = global.tech['agriculture'] >= 5 ? 5 : 3;
                if (global.tech['agriculture'] >= 6){
                    let power = powerModifier(global.race['environmentalist'] ? 1.5 : 1);
                    return loc('city_mill_desc2',[bonus,power]);
                }
                else {
                    return loc('city_mill_desc1',[bonus]);
                }
            },
            category: 'utility',
            reqs: { agriculture: 4 },
            not_tech: ['wind_plant'],
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('mill', offset, 1000, 1.31); },
                Lumber(offset){ return costMultiplier('mill', offset, 600, 1.33); },
                Iron(offset){ return costMultiplier('mill', offset, 150, 1.33); },
                Cement(offset){ return costMultiplier('mill', offset, 125, 1.33); },
            },
            powered(){ return global.race['environmentalist'] ? -1.5 : -1; },
            power_reqs: { agriculture: 6 },
            effect(){
                if (global.tech['agriculture'] >= 6){
                    return `<span class="has-text-success">${loc('city_on')}</span> ${loc('city_mill_effect1')} <span class="has-text-danger">${loc('city_off')}</span> ${loc('city_mill_effect2')}`;
                }
                else {
                    return false;
                }
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['mill'].count++;
                    return true;
                }
                return false;
            }
        },
        windmill: {
            id: 'city-windmill',
            title(){
                return loc('city_mill_title2');
            },
            desc(){
                let power = powerModifier(global.race['environmentalist'] ? 1.5 : 1);
                return loc('city_windmill_desc',[power]);
            },
            wiki: false,
            category: 'utility',
            reqs: { wind_plant: 1 },
            not_trait: ['cataclysm'],
            powered(){ return global.race['environmentalist'] ? -1.5 : -1; },
            power_reqs: { false: 1 },
            cost: {
                Money(offset){ return costMultiplier('windmill', offset, 1000, 1.31); },
                Lumber(offset){ return costMultiplier('windmill', offset, 600, 1.33); },
                Iron(offset){ return costMultiplier('windmill', offset, 150, 1.33); },
                Cement(offset){ return costMultiplier('windmill', offset, 125, 1.33); },
            },
            action(){
                if (payCosts($(this)[0])){
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('silo', offset, 85, 1.32); },
                Lumber(offset){ return costMultiplier('silo', offset, 65, 1.36) },
                Stone(offset){ return costMultiplier('silo', offset, 50, 1.36); },
                Iron(offset){ return ((global.city.silo ? global.city.silo.count : 0) + (offset || 0)) >= 4 && global.city.ptrait === 'unstable' ? costMultiplier('silo', offset, 10, 1.36) : 0; }
            },
            effect(){
                let food = BHStorageMulti(spatialReasoning(500));
                return loc('plus_max_resource',[food, loc('resource_Food_name')]);
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['silo'].count++;
                    global['resource']['Food'].max += BHStorageMulti(spatialReasoning(500));
                    return true;
                }
                return false;
            }
        },
        assembly: buildTemplate(`assembly`,'city'),
        garrison: {
            id: 'city-garrison',
            title: loc('city_garrison'),
            desc: loc('city_garrison_desc'),
            category: 'military',
            reqs: { military: 1, housing: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('garrison', offset, 240, 1.5); },
                Stone(offset){ return costMultiplier('garrison', offset, 260, 1.46); },
                Iron(offset){ return ((global.city['garrison'] ? global.city.garrison.count : 0) + (offset || 0)) >= 4 && global.city.ptrait === 'unstable' ? costMultiplier('garrison', offset, 50, 1.4) : 0; },
                Horseshoe(){ return global.race['hooved'] ? (global.race['chameleon'] ? 1 : 2) : 0; }
            },
            effect(){
                let bunks = global.tech['military'] >= 5 ? 3 : 2;
                if (global.race['chameleon']){
                    bunks--;
                }
                return loc('plus_max_resource',[bunks,loc('civics_garrison_soldiers')]);
            },
            switchable(){ return true; },
            action(){
                if (payCosts($(this)[0])){
                    global.settings['showMil'] = true;
                    if (!global.settings.msgFilters.combat.unlocked){
                        global.settings.msgFilters.combat.unlocked = true;
                        global.settings.msgFilters.combat.vis = true;
                    }
                    if (!global.civic.garrison.display){
                        global.civic.garrison.display = true;
                        vBind({el: `#garrison`},'update');
                        vBind({el: `#c_garrison`},'update');
                    }
                    let gain = global.tech['military'] >= 5 ? 3 : 2;
                    if (global.race['chameleon']){
                        gain -= global.city.garrison.count;
                    }
                    global.civic['garrison'].max += gain;
                    global.city['garrison'].count++;
                    global.city['garrison'].on++;
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
            category: 'military',
            reqs: { medic: 1 },
            not_trait: ['cataclysm','artifical'],
            cost: {
                Money(offset){ return costMultiplier('hospital', offset, 22000, 1.32); },
                Furs(offset){ return costMultiplier('hospital', offset, 4000, 1.32); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('hospital', offset, 500, 1.32) : 0; },
                Aluminium(offset){ return costMultiplier('hospital', offset, 10000, 1.32); },
            },
            effect(){
                let clinic = global.tech['reproduction'] && global.tech.reproduction >= 2 ? `<div>${loc('city_hospital_effect2')}</div>` : ``;
                let healing = global.tech['medic'] * 5;

                return `<div>${loc('city_hospital_effect',[healing])}</div>${clinic}`;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['hospital'].count++;
                    return true;
                }
                return false;
            }
        },
        boot_camp: {
            id: 'city-boot_camp',
            title(){ return global.race['artifical'] ? loc('city_boot_camp_art') : loc('city_boot_camp'); },
            desc(){ return global.race['artifical'] ? loc('city_boot_camp_art_desc',[races[global.race.species].name]) : loc('city_boot_camp_desc'); },
            category: 'military',
            reqs: { boot_camp: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('boot_camp', offset, 50000, 1.32); },
                Lumber(offset){ return costMultiplier('boot_camp', offset, 21500, 1.32); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('boot_camp', offset, 300, 1.32) : 0; },
                Aluminium(offset){ return costMultiplier('boot_camp', offset, 12000, 1.32); },
                Brick(offset){ return costMultiplier('boot_camp', offset, 1400, 1.32); },
            },
            effect(){
                let rate = global.tech['boot_camp'] >= 2 ? 8 : 5;
                if (global.blood['lust']){
                    rate += global.blood.lust * 0.2;
                }
                let milVal = govActive('militant',0);
                if (milVal){
                    rate *= 1 + (milVal / 100);
                }
                let effect = global.tech['spy'] && global.tech['spy'] >= 3 ? `<div>${loc('city_boot_camp_effect',[rate])}</div><div>${loc('city_boot_camp_effect2',[10])}</div>` : `<div>${loc('city_boot_camp_effect',[rate])}</div>`;
                if (global.race['artifical']){
                    let repair = global.tech['medic'] || 1;
                    effect += `<div>${loc('city_boot_camp_art_effect',[repair * 5])}</div>`;
                }
                return effect;
            },
            action(){
                if (payCosts($(this)[0])){
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
            not_trait: ['cataclysm'],
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
                if (global.resource.Chrysotile.display){
                    let val = sizeApproximation(+(spatialReasoning(300) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Chrysotile.name])}</span>`;
                }
                if (global.resource.Crystal.display){
                    let val = sizeApproximation(+(spatialReasoning(8) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Crystal.name])}</span>`;
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
                if (global.tech['shelving'] && global.tech.shelving >= 3 && global.resource.Graphene.display){
                    let val = sizeApproximation(+(spatialReasoning(15) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Graphene.name])}</span>`;
                }
                if (global.tech['shelving'] && global.tech.shelving >= 3 && global.resource.Stanene.display){
                    let val = sizeApproximation(+(spatialReasoning(25) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Stanene.name])}</span>`;
                }
                storage = storage + '</div>';
                return storage;
            },
            wide: true,
            action(){
                if (payCosts($(this)[0])){
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
                    if (global.resource.Chrysotile.display){
                        global['resource']['Chrysotile'].max += (spatialReasoning(300) * multiplier);
                    }
                    if (global.resource.Crystal.display){
                        global['resource']['Crystal'].max += (spatialReasoning(8) * multiplier);
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('storage_yard', offset, 10, bananaPerk(1.36)); },
                Brick(offset){ return costMultiplier('storage_yard', offset, 3, bananaPerk(1.35)); },
                Wrought_Iron(offset){ return costMultiplier('storage_yard', offset, 5, bananaPerk(1.35)); }
            },
            effect(){
                let cap = global.tech.container >= 3 ? 20 : 10;
                if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 1){
                    cap += 10;
                }
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
                if (payCosts($(this)[0])){
                    if (global.resource.Crates.display === false){
                        messageQueue(loc('city_storage_yard_msg'),'info',false,['progress']);
                    }
                    global.city['storage_yard'].count++;
                    global.settings.showResources = true;
                    global.settings.showStorage = true;
                    if (!global.settings.showMarket) {
                        global.settings.marketTabs = 1;
                    }
                    let cap = global.tech.container >= 3 ? 20 : 10;
                    if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 1){
                        cap += 10;
                    }
                    if (global.tech['world_control']){
                        cap += 10;
                    }
                    if (global.tech['particles'] && global.tech['particles'] >= 2){
                        cap *= 2;
                    }
                    global.resource.Crates.max += cap;
                    if (!global.resource.Crates.display){
                        global.resource.Crates.display = true;
                        clearElement($('#resources'));
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('warehouse', offset, 400, bananaPerk(1.26)); },
                Cement(offset){ return costMultiplier('warehouse', offset, 75, bananaPerk(1.26)); },
                Sheet_Metal(offset){ return costMultiplier('warehouse', offset, 25, bananaPerk(1.25)); }
            },
            effect(){
                let cap = global.tech.steel_container >= 2 ? 20 : 10;
                if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 2){
                    cap += 10;
                }
                if (global.tech['world_control']){
                    cap += 10;
                }
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    cap *= 2;
                }
                return loc('plus_max_resource',[cap,loc('resource_Containers_name')]);
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.resource.Containers.display === false){
                        messageQueue(loc('city_warehouse_msg'),'info',false,['progress']);
                    }
                    global.city['warehouse'].count++;
                    global.settings.showResources = true;
                    global.settings.showStorage = true;
                    let cap = global.tech['steel_container'] >= 2 ? 20 : 10;
                    if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 2){
                        cap += 10;
                    }
                    if (global.tech['world_control']){
                        cap += 10;
                    }
                    if (global.tech['particles'] && global.tech['particles'] >= 2){
                        cap *= 2;
                    }
                    global.resource.Containers.max += cap;
                    if (!global.resource.Containers.display){
                        global.resource.Containers.display = true;
                        clearElement($('#resources'));
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('bank', offset, 250, 1.35); },
                Lumber(offset){ return costMultiplier('bank', offset, 75, 1.32); },
                Stone(offset){ return costMultiplier('bank', offset, 100, 1.35); },
                Iron(offset){ return ((global.city['bank'] ? global.city.bank.count : 0) + (offset || 0)) >= 2 && global.city.ptrait === 'unstable' ? costMultiplier('bank', offset, 30, 1.3) : 0; }
            },
            effect(){
                let vault = bank_vault();
                vault = spatialReasoning(vault);
                vault = (+(vault).toFixed(0)).toLocaleString();

                if (global.tech['banking'] >= 2){
                    return `<div>${loc('plus_max_resource',[`\$${vault}`,loc('resource_Money_name')])}</div><div>${loc('plus_max_resource',[1,loc('banker_name')])}</div>`;
                }
                else {
                    return loc('plus_max_resource',[`\$${vault}`,loc('resource_Money_name')]);
                }
            },
            action(){
                if (payCosts($(this)[0])){
                    global['resource']['Money'].max += spatialReasoning(1800);
                    global.city.bank.count++;
                    global.civic.banker.max = global.city.bank.count;
                    return true;
                }
                return false;
            }
        },
        pylon: {
            id: 'city-pylon',
            title: loc('city_pylon'),
            desc: loc('city_pylon'),
            category: 'industrial',
            reqs: { magic: 2 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['pylon'] ? global.city['pylon'].count : 0) + offset >= 2){
                        return costMultiplier('pylon', offset, 10, 1.48);
                    }
                    else {
                        return 0;
                    }
                },
                Stone(offset){ return costMultiplier('pylon', offset, 12, 1.42); },
                Crystal(offset){ return costMultiplier('pylon', offset, 8, 1.42) - 3; }
            },
            effect(){
                let max = spatialReasoning(5);
                let mana = +(0.01 * darkEffect('magic')).toFixed(3);
                return `<div>${loc('gain',[mana,global.resource.Mana.name])}</div><div>${loc('plus_max_resource',[max,global.resource.Mana.name])}</div>`;
            },
            special(){ return global.tech['magic'] && global.tech.magic >= 3 ? true : false; },
            action(){
                if (payCosts($(this)[0])){
                    global.city['pylon'].count++;
                    global.resource.Mana.max += spatialReasoning(5);
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['graveyard'] ? global.city['graveyard'].count : 0) + offset >= 5){
                        return costMultiplier('graveyard', offset, 5, 1.85);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return costMultiplier('graveyard', offset, 2, 1.95); },
                Stone(offset){ return costMultiplier('graveyard', offset, 6, 1.9); }
            },
            effect(){
                let lum = BHStorageMulti(spatialReasoning(100));
                return `<div>${loc('city_graveyard_effect',[8])}</div><div>${loc('plus_max_resource',[lum,global.resource.Lumber.name])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['graveyard'].count++;
                    global['resource']['Lumber'].max += BHStorageMulti(spatialReasoning(100));
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['lumber_yard'] ? global.city['lumber_yard'].count : 0) + offset >= 5){
                        return costMultiplier('lumber_yard', offset, 5, 1.85);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return costMultiplier('lumber_yard', offset, 6, 1.9); },
                Stone(offset){ return costMultiplier('lumber_yard', offset, 2, 1.95); }
            },
            effect(){
                let lum = BHStorageMulti(spatialReasoning(100));
                return `<div>${loc('city_lumber_yard_effect',[2])}</div><div>${loc('plus_max_resource',[lum,global.resource.Lumber.name])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['lumber_yard'].count++;
                    global.civic.lumberjack.display = true;
                    global['resource']['Lumber'].max += BHStorageMulti(spatialReasoning(100));
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('sawmill', offset, 3000, 1.26); },
                Iron(offset){ return costMultiplier('sawmill', offset, 400, 1.26); },
                Cement(offset){ return costMultiplier('sawmill', offset, 420, 1.26); }
            },
            effect(){
                let impact = global.tech['saw'] >= 2 ? 8 : 5;
                let lum = BHStorageMulti(spatialReasoning(200));
                let desc = `<div>${loc('plus_max_resource',[lum,global.resource.Lumber.name])}</div><div>${loc('city_lumber_yard_effect',[impact])}</div>`;
                if (global.tech['foundry'] && global.tech['foundry'] >= 4){
                    desc = desc + `<div>${loc('city_sawmill_effect2',[2])}</div>`;
                }
                if (global.city.powered){
                    desc = desc + `<div class="has-text-caution">${loc('city_sawmill_effect3',[4,$(this)[0].powered()])}</div>`;
                }
                return desc;
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.city['sawmill'].count++;
                    global['resource']['Lumber'].max += BHStorageMulti(spatialReasoning(200));
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
            not_trait: ['cataclysm','sappy'],
            cost: {
                Money(offset){
                    offset = offset || 0;
                    if ((global.city['rock_quarry'] ? global.city['rock_quarry'].count : 0) + offset >= 2){
                        return costMultiplier('rock_quarry', offset, 20, 1.45);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return costMultiplier('rock_quarry', offset, 50, 1.36); },
                Stone(offset){ return costMultiplier('rock_quarry', offset, 10, 1.36); }
            },
            effect(){
                let stone = BHStorageMulti(spatialReasoning(100));
                let asbestos = global.race['smoldering'] ? `<div>${loc('plus_max_resource',[stone,global.resource.Chrysotile.name])}</div>` : '';
                if (global.tech['mine_conveyor']){
                    return `<div>${loc('city_rock_quarry_effect1',[2])}</div><div>${loc('plus_max_resource',[stone,global.resource.Stone.name])}</div>${asbestos}<div class="has-text-caution">${loc('city_rock_quarry_effect2',[4,$(this)[0].powered()])}</div>`;
                }
                else {
                    return `<div>${loc('city_rock_quarry_effect1',[2])}</div><div>${loc('plus_max_resource',[stone,global.resource.Stone.name])}</div>${asbestos}`;
                }
            },
            special(){ return global.race['smoldering'] ? true : false; },
            powered(){ return powerCostMod(1); },
            power_reqs: { mine_conveyor: 1 },
            action(){
                if (payCosts($(this)[0])){
                    global.city['rock_quarry'].count++;
                    global.civic.quarry_worker.display = true;
                    let stone = BHStorageMulti(spatialReasoning(100));
                    global['resource']['Stone'].max += stone;
                    if (global.race['smoldering'] && global.resource.Chrysotile.display){
                        global.settings.showCivic = true;
                        global.settings.showIndustry = true;
                        global['resource']['Chrysotile'].max += stone;
                    }
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('cement_plant', offset, 3000, 1.5); },
                Lumber(offset){ return costMultiplier('cement_plant', offset, 1800, 1.36); },
                Stone(offset){ return costMultiplier('cement_plant', offset, 2000, 1.32); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('cement_plant', offset, 275, 1.32) : 0; }
            },
            effect(){
                if (global.tech['cement'] >= 5){
                    let screws = global.tech['cement'] >= 6 ? 8 : 5;
                    return `<div>${loc('city_cement_plant_effect1',[2])}</div><div class="has-text-caution">${loc('city_cement_plant_effect2',[$(this)[0].powered(),screws])}</div>`;
                }
                else {
                    return loc('city_cement_plant_effect1',[2]);
                }
            },
            powered(){ return powerCostMod(2); },
            power_reqs: { cement: 5 },
            action(){
                if (payCosts($(this)[0])){
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('foundry', offset, 750, 1.36); },
                Stone(offset){ return costMultiplier('foundry', offset, 100, 1.36); },
                Copper(offset){ return costMultiplier('foundry', offset, 250, 1.36); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('foundry', offset, 40, 1.36) : 0; },
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
                if (payCosts($(this)[0])){
                    if (global.city['foundry'].count === 0){
                        if (global.race['no_craft']) {
                            messageQueue(loc('city_foundry_msg2'),'info',false,['progress']);
                        }
                        else {
                            messageQueue(loc('city_foundry_msg1'),'info',false,['progress']);
                        }
                    }
                    global.city['foundry'].count++;
                    global.civic.craftsman.max++;
                    global.civic.craftsman.display = true;
                    if (!global.race['kindling_kindred'] && !global.race['smoldering']){
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('factory', offset, 25000, dirt_adjust(1.32)); },
                Cement(offset){ return costMultiplier('factory', offset, 1000, dirt_adjust(1.32)); },
                Steel(offset){ return costMultiplier('factory', offset, 7500, dirt_adjust(1.32)); },
                Titanium(offset){ return costMultiplier('factory', offset, 2500, dirt_adjust(1.32)); }
            },
            effect(){
                let desc = `<div>${loc('city_factory_effect')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                if (global.tech['foundry'] >= 7){
                    desc = desc + `<div>${loc('city_crafted_mats',[5])}</div>`;
                }
                return desc;
            },
            powered(){ return powerCostMod(3); },
            special: true,
            action(){
                if (payCosts($(this)[0])){
                    global.city.factory.count++;
                    global.resource.Alloy.display = true;
                    if (global.tech['polymer']){
                        global.resource.Polymer.display = true;
                    }
                    if (global.city.power >= $(this)[0].powered()){
                        global.city.factory.on++;
                        global.city.factory.Alloy++;
                    }
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        nanite_factory: buildTemplate(`nanite_factory`,'city'),
        smelter: {
            id: 'city-smelter',
            title: loc('city_smelter'),
            desc: loc('city_smelter_desc'),
            category: 'industrial',
            reqs: { smelting: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('smelter', offset, 1000, dirt_adjust(1.32)); },
                Iron(offset){ return costMultiplier('smelter', offset, 500, dirt_adjust(1.33)); }
            },
            effect(){
                var iron_yield = global.tech['smelting'] >= 3 ? (global.tech['smelting'] >= 7 ? 15 : 12) : 10;
                if (global.race['pyrophobia']){
                    iron_yield *= 0.9;
                }
                if (global.tech['smelting'] >= 2 && !global.race['steelen']){
                    return loc('city_smelter_effect2',[iron_yield]);
                }
                else {
                    return loc('city_smelter_effect1',[iron_yield]);
                }
            },
            special: true,
            action(){
                if (payCosts($(this)[0])){
                    global.city['smelter'].count++;
                    if (global.race['kindling_kindred'] || global.race['smoldering'] || global.race['artifical']){
                        if (global.race['artifical']){
                            global.city['smelter'].Oil++;
                        }
                        else if (global.race['evil']) {
                            global.city['smelter'].Wood++;
                        }
                        else {
                            global.city['smelter'].Coal++;
                        }
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('metal_refinery', offset, 2500, 1.35); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('metal_refinery', offset, 125, 1.35) : 0; },
                Steel(offset){ return costMultiplier('metal_refinery', offset, 350, 1.35); }
            },
            powered(){ return powerCostMod(2); },
            power_reqs: { alumina: 2 },
            effect(){
                let label = global.race['sappy'] ? 'city_metal_refinery_effect_alt' : 'city_metal_refinery_effect';
                if (global.tech['alumina'] >= 2){
                    return `<span>${loc(label,[6])}</span> <span class="has-text-caution">${loc('city_metal_refinery_effect2',[6,12,$(this)[0].powered()])}</span>`;
                }
                else {
                    return loc(label,[6]);
                }
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['metal_refinery'].count++;
                    global.resource.Aluminium.display = true;
                    if (global.city['foundry'] && global.city.foundry.count > 0){
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('mine', offset, 60, dirt_adjust(1.6)); },
                Lumber(offset){ return costMultiplier('mine', offset, 175, dirt_adjust(1.38)); }
            },
            effect(){
                if (global.tech['mine_conveyor']){
                    return `<div>${loc('city_mine_effect1')}</div><div class="has-text-caution">${loc('city_mine_effect2',[$(this)[0].powered(),5])}</div>`;
                }
                else {
                    return loc('city_mine_effect1');
                }
            },
            powered(){ return powerCostMod(1); },
            power_reqs: { mine_conveyor: 1 },
            action(){
                if (payCosts($(this)[0])){
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('coal_mine', offset, 480, dirt_adjust(1.4)); },
                Lumber(offset){ return costMultiplier('coal_mine', offset, 250, dirt_adjust(1.36)); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('coal_mine', offset, 28, dirt_adjust(1.36)) : 0; },
                Wrought_Iron(offset){ return costMultiplier('coal_mine', offset, 18, dirt_adjust(1.36)); }
            },
            effect(){
                if (global.tech['mine_conveyor']){
                    return `<div>${loc('city_coal_mine_effect1')}</div><div class="has-text-caution">${loc('city_coal_mine_effect2',[$(this)[0].powered(),5])}</div>`;
                }
                else {
                    return loc('city_coal_mine_effect1');
                }
            },
            powered(){ return powerCostMod(1); },
            power_reqs: { mine_conveyor: 1 },
            action(){
                if (payCosts($(this)[0])){
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('oil_well', offset, 5000, dirt_adjust(1.5)); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('oil_well', offset, 450, dirt_adjust(1.5)) : 0; },
                Cement(offset){ return costMultiplier('oil_well', offset, 5250, dirt_adjust(1.5)); },
                Steel(offset){ return costMultiplier('oil_well', offset, 6000, dirt_adjust(1.5)); }
            },
            effect(){
                let oil = +(production('oil_well')).toFixed(2);
                let oc = spatialReasoning(500);
                return loc('city_oil_well_effect',[oil,oc]);
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['oil_well'].count++;
                    global['resource']['Oil'].max += spatialReasoning(500);
                    if (global.city['oil_well'].count === 1) {
                        global.resource.Oil.display = true;
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            flair: loc('city_oil_well_flair')
        },
        oil_depot: {
            id: 'city-oil_depot',
            title: loc('city_oil_depot'),
            desc: loc('city_oil_depot_desc'),
            category: 'trade',
            reqs: { oil: 2 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('oil_depot', offset, 2500, dirt_adjust(1.46)); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('oil_depot', offset, 325, dirt_adjust(1.36)) : 0; },
                Cement(offset){ return costMultiplier('oil_depot', offset, 3750, dirt_adjust(1.46)); },
                Sheet_Metal(offset){ return costMultiplier('oil_depot', offset, 100, dirt_adjust(1.45)); }
            },
            effect() {
                let oil = spatialReasoning(1000);
                oil *= global.tech['world_control'] ? 1.5 : 1;
                let effect = `<div>${loc('plus_max_resource',[oil,global.resource.Oil.name])}.</div>`;
                if (global.resource['Helium_3'].display){
                    let val = spatialReasoning(400);
                    val *= global.tech['world_control'] ? 1.5 : 1;
                    effect = effect + `<div>${loc('plus_max_resource',[val,global.resource.Helium_3.name])}.</div>`;
                }
                if (global.tech['uranium'] >= 2){
                    let val = spatialReasoning(250);
                    val *= global.tech['world_control'] ? 1.5 : 1;
                    effect = effect + `<div>${loc('plus_max_resource',[val,global.resource.Uranium.name])}.</div>`;
                }
                return effect;
            },
            action(){
                if (payCosts($(this)[0])){
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('trade', offset, 500, 1.36); },
                Lumber(offset){ return costMultiplier('trade', offset, 125, 1.36); },
                Stone(offset){ return costMultiplier('trade', offset, 50, 1.36); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('trade', offset, 15, 1.36) : 0; },
                Furs(offset){ return costMultiplier('trade', offset, 65, 1.36); }
            },
            effect(){
                let routes = global.race['xenophobic'] || global.race['nomadic'] ? global.tech.trade : global.tech.trade + 1;
                if (global.tech['trade'] && global.tech['trade'] >= 3){
                    routes--;
                }
                return loc('city_trade_effect',[routes]);
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['trade'].count++;
                    let routes = global.race['xenophobic'] || global.race['nomadic'] ? global.tech.trade : global.tech.trade + 1;
                    if (global.tech['trade'] && global.tech['trade'] >= 3){
                        routes--;
                    }
                    global.city.market.mtrade += routes;
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
            era: 'industrialized',
            reqs: { wharf: 1 },
            not_trait: ['thalassophobia','cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('wharf', offset, 62000, 1.32); },
                Lumber(offset){ return costMultiplier('wharf', offset, 44000, 1.32); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('wharf', offset, 200, 1.32) : 0; },
                Cement(offset){ return costMultiplier('wharf', offset, 3000, 1.32); },
                Oil(offset){ return costMultiplier('wharf', offset, 750, 1.32); }
            },
            effect(){
                let containers = global.tech['world_control'] ? 15 : 10;
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    containers *= 2;
                }
                return `<div>${loc('city_trade_effect',[2])}</div><div>${loc('city_wharf_effect')}</div><div>${loc('plus_max_crates',[containers])}</div><div>${loc('plus_max_containers',[containers])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.resource.Containers.display === false){
                        messageQueue(loc('city_warehouse_msg'),'info',false,['progress']);
                        global.resource.Containers.display = true;
                        clearElement($('#resources'));
                        defineResources();
                    }
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('tourist_center', offset, 100000, 1.36); },
                Stone(offset){ return costMultiplier('tourist_center', offset, 25000, 1.36); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('tourist_center', offset, 1000, 1.36) : 0; },
                Furs(offset){ return costMultiplier('tourist_center', offset, 7500, 1.36); },
                Plywood(offset){ return costMultiplier('tourist_center', offset, 5000, 1.36); },
            },
            effect(){
                let xeno = global.tech['monument'] && global.tech.monument >= 3 && p_on['s_gate'] ? 3 : 1;
                let amp = (global.civic.govern.type === 'corpocracy' ? 2 : 1) * xeno;
                let cas = (global.civic.govern.type === 'corpocracy' ? 10 : 5) * xeno;
                let mon = (global.civic.govern.type === 'corpocracy' ? 4 : 2) * xeno;
                let post = '';
                if (global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 4){
                    post = `<div>${loc(`city_tourist_center_effect5`,[(global.civic.govern.type === 'corpocracy' ? 6 : 3) * xeno])}</div>`;
                }
                let pious = '';
                let piousVal = govActive('pious',1);
                if (piousVal){
                    pious = `<div>${loc(`city_tourist_center_effect6`,[(global.civic.govern.type === 'corpocracy' ? (piousVal * 2) : piousVal) * xeno])}</div>`;
                }
                return `<div class="has-text-caution">${loc('city_tourist_center_effect1',[global.resource.Food.name])}</div><div>${loc('city_tourist_center_effect2',[amp,actions.city.amphitheatre.title()])}</div><div>${loc('city_tourist_center_effect3',[cas])}</div><div>${loc('city_tourist_center_effect4',[mon])}</div>${post}${pious}`;
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0])){
                    global.city['tourist_center'].count++;
                    global.city['tourist_center'].on++;
                    return true;
                }
                return false;
            }
        },
        amphitheatre: {
            id: 'city-amphitheatre',
            title(){
                let athVal = govActive('athleticism',0);
                return athVal ? loc('city_stadium') : loc('city_amphitheatre');
            },
            desc(){
                let athVal = govActive('athleticism',0);
                return athVal ? loc('city_stadium') : loc('city_amphitheatre_desc');
            },
            category: 'commercial',
            reqs: { theatre: 1 },
            not_trait: ['joyless','cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('amphitheatre', offset, 500, 1.55); },
                Lumber(offset){ return costMultiplier('amphitheatre', offset, 50, 1.75); },
                Stone(offset){ return costMultiplier('amphitheatre', offset, 200, 1.75); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('amphitheatre', offset, 18, 1.36) : 0; },
            },
            effect(){
                let athVal1 = govActive('athleticism',0);
                let athVal2 = govActive('athleticism',1);
                return`<div>${loc('city_max_entertainer',[athVal2 ? athVal2 : 1])}</div><div>${loc('city_max_morale',[athVal1 ? athVal1 : 1])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['amphitheatre'].count++;
                    global.civic.entertainer.max++;
                    global.civic.entertainer.display = true;
                    return true;
                }
                return false;
            },
            flair(){
                let athVal = govActive('athleticism',0);
                return athVal ? loc('city_stadium_flair') : loc('city_amphitheatre_flair');
            },
        },
        casino: {
            id: 'city-casino',
            title: loc('city_casino'),
            desc: loc('city_casino'),
            category: 'commercial',
            reqs: { gambling: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('casino', offset, 350000, 1.35); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('casino', offset, 2000, 1.35) : 0; },
                Furs(offset){ return costMultiplier('casino', offset, 60000, 1.35); },
                Plywood(offset){ return costMultiplier('casino', offset, 10000, 1.35); },
                Brick(offset){ return costMultiplier('casino', offset, 6000, 1.35); }
            },
            effect(){
                let desc = casinoEffect();
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 2 ? 2 : 3); },
            action(){
                if (payCosts($(this)[0])){
                    global.city.casino.count++;
                    if (!global.race['joyless']){
                        global.civic.entertainer.max++;
                        global.civic.entertainer.display = true;
                    }
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.city.casino.on++;
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
                let entity = global.race.gods !== 'none' ? races[global.race.gods.toLowerCase()].entity : races[global.race.species].entity;
                return loc('city_temple_desc',[entity]);
            },
            category: 'commercial',
            reqs: { theology: 2 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('temple', offset, 50, 1.36); },
                Lumber(offset){ return costMultiplier('temple', offset, 25, 1.36); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('temple', offset, 6, 1.36) : 0; },
                Furs(offset){ return costMultiplier('temple', offset, 15, 1.36); },
                Cement(offset){ return costMultiplier('temple', offset, 10, 1.36); }
            },
            effect(){
                let desc = templeEffect();
                if (global.genes['ancients'] && global.genes['ancients'] >= 2){
                    desc = desc + `<div>${loc('city_temple_effect6')}</div>`;
                }
                return desc;
            },
            action(){
                if (payCosts($(this)[0])){
                    if (global.genes['ancients'] && global.genes['ancients'] >= 2){
                        global.civic.priest.display = true;
                    }
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('shrine', offset, 75, 1.32); },
                Stone(offset){ return costMultiplier('shrine', offset, 65, 1.32); },
                Furs(offset){ return costMultiplier('shrine', offset, 10, 1.32); },
                Copper(offset){ return costMultiplier('shrine', offset, 15, 1.32); }
            },
            effect(){
                let desc = `<div class="has-text-special">${loc('city_shrine_effect')}</div>`;
                if (global.city['shrine'] && global.city.shrine.morale > 0){
                    let morale = getShrineBonus('morale');
                    desc = desc + `<div>${loc('city_shrine_morale',[+(morale.add).toFixed(1)])}</div>`;
                }
                if (global.city['shrine'] && global.city.shrine.metal > 0){
                    let metal = getShrineBonus('metal');
                    desc = desc + `<div>${loc('city_shrine_metal',[+((metal.mult - 1) * 100).toFixed(1)])}</div>`;
                }
                if (global.city['shrine'] && global.city.shrine.know > 0){
                    let know = getShrineBonus('know');
                    desc = desc + `<div>${loc('city_shrine_know',[(+(know.add).toFixed(1)).toLocaleString()])}</div>`;
                    desc = desc + `<div>${loc('city_shrine_know2',[+((know.mult - 1) * 100).toFixed(1)])}</div>`;
                }
                if (global.city['shrine'] && global.city.shrine.tax > 0){
                    let tax = getShrineBonus('tax');
                    desc = desc + `<div>${loc('city_shrine_tax',[+((tax.mult - 1) * 100).toFixed(1)])}</div>`;
                }
                return desc;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city.shrine.count++;
                    if (global.city.calendar.moon > 0 && global.city.calendar.moon < 7){
                        global.city.shrine.morale++;
                    }
                    else if (global.city.calendar.moon > 7 && global.city.calendar.moon < 14){
                        global.city.shrine.metal++;
                    }
                    else if (global.city.calendar.moon > 14 && global.city.calendar.moon < 21){
                        global.city.shrine.know++;
                    }
                    else if (global.city.calendar.moon > 21){
                        global.city.shrine.tax++;
                    }
                    else {
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
                    }
                    return true;
                }
                return false;
            }
        },
        meditation: {
            id: 'city-meditation',
            title: loc('city_meditation'),
            desc: loc('city_meditation'),
            category: 'commercial',
            reqs: { primitive: 3 },
            trait: ['calm'],
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('meditation', offset, 50, 1.2); },
                Stone(offset){ return costMultiplier('meditation', offset, 25, 1.2); },
                Furs(offset){ return costMultiplier('meditation', offset, 8, 1.2); }
            },
            effect(){
                let zen = global.resource.Zen.amount / (global.resource.Zen.amount + 5000);
                return `<div>${loc(`city_meditation_effect`,[traits.calm.vars()[0]])}</div><div class="has-text-special">${loc(`city_meditation_effect2`,[2])}</div><div class="has-text-special">${loc(`city_meditation_effect3`,[1])}</div><div>${loc(`city_meditation_effect4`,[`${(zen * 100).toFixed(2)}%`])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    global.city['meditation'].count++;
                    global.resource.Zen.max += traits.calm.vars()[0];
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('university', offset, 900, 1.5) - 500; },
                Lumber(offset){ return costMultiplier('university', offset, 500, 1.36) - 200; },
                Stone(offset){ return costMultiplier('university', offset, 750, 1.36) - 350; },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('university', offset, 5, 1.36) : 0; },
                Iron(offset){ return ((global.city['university'] ? global.city.university.count : 0) + (offset || 0)) >= 3 && global.city.ptrait === 'unstable' ? costMultiplier('university', offset, 25, 1.36) : 0; }
            },
            effect(){
                let multiplier = 1;
                let gain = global.tech['science'] && global.tech['science'] >= 8 ? 700 : 500;
                if (global.tech['science'] >= 4){
                    multiplier += (global.city['library'].count * 0.02);
                }
                if (global.space['observatory'] && global.space.observatory.count > 0){
                    multiplier += (support_on['observatory'] * 0.05);
                }
                if (global.portal['sensor_drone'] && global.tech['science'] >= 14){
                    multiplier += (p_on['sensor_drone'] * 0.02);
                }
                if (global.race['hard_of_hearing']){
                    multiplier *= 1 - (traits.hard_of_hearing.vars()[0] / 100);
                }
                if (global.race['curious']){
                    multiplier *= 1 + (traits.curious.vars()[0] / 100 * global.resource[global.race.species].amount);
                }
                if (p_on['s_gate'] && gal_on['scavenger']){
                    let uni = gal_on['scavenger'] * +(piracy('gxy_alien2') / 4).toFixed(1);
                    multiplier *= 1 + uni;
                }
                let teachVal = govActive('teacher',0);
                if (teachVal){
                    multiplier *= 1 + (teachVal / 100);
                }
                let athVal = govActive('athleticism',2);
                if (athVal){
                    multiplier *= 1 - (athVal / 100);
                }
                gain *= multiplier;
                if (global.tech['supercollider']){
                    let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                    gain *= (global.tech['supercollider'] / ratio) + 1;
                }
                if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                    let shrineBonus = getShrineBonus('know');
                    gain *= shrineBonus.mult;
                }
                gain = +(gain).toFixed(0);
                return `<div>${loc('city_university_effect')}</div><div>${loc('city_max_knowledge',[gain.toLocaleString()])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('library', offset, 45, 1.2); },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('library', offset, 2, 1.2) : 0; },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('library', offset, 4, 1.2) : 0; },
                Furs(offset){ return costMultiplier('library', offset, 22, 1.2); },
                Plywood(offset){ return costMultiplier('library', offset, 20, 1.2); },
                Brick(offset){ return costMultiplier('library', offset, 15, 1.2); }
            },
            effect(){
                let gain = 125;
                if (global.race['nearsighted']){
                    gain *= 1 - (traits.nearsighted.vars()[0] / 100);
                }
                if (global.race['studious']){
                    gain *= 1 + (traits.studious.vars()[1] / 100);
                }
                if (global.tech['science'] && global.tech['science'] >= 8){
                    gain *= 1.4;
                }
                if (global.tech['anthropology'] && global.tech['anthropology'] >= 2){
                    gain *= 1 + (global.city.temple.count * 0.05);
                }
                if (global.tech['science'] && global.tech['science'] >= 5){
                    gain *= 1 + (global.civic.scientist.workers * 0.12);
                }
                let teachVal = govActive('teacher',0);
                if (teachVal){
                    gain *= 1 + (teachVal / 100);
                }
                let athVal = govActive('athleticism',2);
                if (athVal){
                    gain *= 1 - (athVal / 100);
                }
                let muckVal1 = govActive('muckraker',1);
                if (muckVal1){
                    gain *= 1 + (muckVal1 / 100);
                }
                gain = +(gain).toFixed(0);
                let muckVal2 = govActive('muckraker',2);
                let know = muckVal2 ? (5 - muckVal2) : 5;
                if (global.race['autoignition']){
                    know -= traits.autoignition.vars()[0];
                    if (know < 0){
                        know = 0;
                    }
                }
                return `<div>${loc('city_max_knowledge',[gain.toLocaleString()])}</div><div>${loc('city_library_effect',[know])}</div>`;
            },
            action(){
                if (payCosts($(this)[0])){
                    let gain = 125;
                    if (global.race['nearsighted']){
                        gain *= 1 - (traits.nearsighted.vars()[0] / 100);
                    }
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
                    global['resource']['Knowledge'].max += gain;
                    global.city.library.count++;
                    if (global.tech['science'] && global.tech['science'] >= 3){
                        global.civic.professor.impact = 0.5 + (global.city.library.count * 0.01)
                    }
                    return true;
                }
                return false;
            },
            flair: loc('city_library_flair')
        },
        wardenclyffe: {
            id: 'city-wardenclyffe',
            title(){ return wardenLabel(); },
            desc: loc('city_wardenclyffe_desc'),
            category: 'science',
            reqs: { high_tech: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('wardenclyffe', offset, 5000, 1.22); },
                Knowledge(offset){ return costMultiplier('wardenclyffe', offset, global.race['logical'] ? (1000 - traits.logical.vars()[0]) : 1000, 1.22); },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('wardenclyffe', offset, 100, 1.22) : 0; },
                Copper(offset){ return costMultiplier('wardenclyffe', offset, 500, 1.22); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('wardenclyffe', offset, 75, 1.22) : 0; },
                Cement(offset){ return costMultiplier('wardenclyffe', offset, 350, 1.22); },
                Sheet_Metal(offset){ return costMultiplier('wardenclyffe', offset, 125, 1.2); },
                Nanite(offset){ return global.race['deconstructor'] ? costMultiplier('wardenclyffe', offset, 50, 1.18) : 0; },
            },
            effect(){
                let gain = 1000;
                if (global.city.ptrait === 'magnetic'){
                    gain += planetTraits.magnetic.vars()[1];
                }
                if (global.tech['supercollider']){
                    let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                    gain *= (global.tech['supercollider'] / ratio) + 1;
                }
                if (global.space['satellite']){
                    gain *= 1 + (global.space.satellite.count * 0.04);
                }
                let athVal = govActive('athleticism',2);
                if (athVal){
                    gain *= 1 - (athVal / 100);
                }
                gain = +(gain).toFixed(0);
                let desc = `<div>${loc('city_wardenclyffe_effect1',[global.civic.scientist.name])}</div><div>${loc('city_max_knowledge',[gain.toLocaleString()])}</div>`;
                if (global.city.powered){
                    let pgain = global.tech['science'] >= 7 ? 2500 : 2000;
                    if (global.city.ptrait === 'magnetic'){
                        pgain += planetTraits.magnetic.vars()[1];
                    }
                    if (global.space['satellite']){
                        pgain *= 1 + (global.space.satellite.count * 0.04);
                    }
                    if (global.tech['supercollider']){
                        let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                        pgain *= (global.tech['supercollider'] / ratio) + 1;
                    }
                    let athVal = govActive('athleticism',2);
                    if (athVal){
                        pgain *= 1 - (athVal / 100);
                    }
                    pgain = +(pgain).toFixed(1);
                    if (global.tech.science >= 15){
                        desc = desc + `<div>${loc('city_wardenclyffe_effect4',[2])}</div>`;
                    }
                    if (global.race.universe === 'magic'){
                        let mana = spatialReasoning(8);
                        desc = desc + `<div>${loc('plus_max_resource',[mana,global.resource.Mana.name])}</div>`;
                    }
                    if (global.tech['broadcast']){
                        let morale = global.tech['broadcast'];
                        desc = desc + `<div class="has-text-caution">${loc('city_wardenclyffe_effect3',[$(this)[0].powered(),pgain.toLocaleString(),morale])}</div>`
                    }
                    else {
                        desc = desc + `<div class="has-text-caution">${loc('city_wardenclyffe_effect2',[$(this)[0].powered(),pgain.toLocaleString()])}</div>`;
                    }
                    if (global.race['artifical']){
                        desc = desc + `<div class="has-text-caution">${loc('city_transmitter_effect',[spatialReasoning(250)])}</div`;
                    }
                }
                return desc;
            },
            powered(){ return powerCostMod(2); },
            action(){
                if (payCosts($(this)[0])){
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
            flair(){ return global.race.universe === 'magic' ? `<div>${loc('city_wizard_tower_flair')}</div>` :  (global.race['evil'] ? `<div>${loc('city_babel_flair')}</div>` : `<div>${loc('city_wardenclyffe_flair1')}</div><div>${loc('city_wardenclyffe_flair2')}</div>`); }
        },
        biolab: {
            id: 'city-biolab',
            title: loc('city_biolab'),
            desc: `<div>${loc('city_biolab_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            category: 'science',
            reqs: { genetics: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('biolab', offset, 25000, 1.3); },
                Knowledge(offset){ return costMultiplier('biolab', offset, 5000, 1.3); },
                Copper(offset){ return costMultiplier('biolab', offset, 1250, 1.3); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('biolab', offset, 160, 1.3) : 0; },
                Alloy(offset){ return costMultiplier('biolab', offset, 350, 1.3); }
            },
            effect(){
                let gain = 3000;
                if (global.portal['sensor_drone'] && global.tech['science'] >= 14){
                    gain *= 1 + (p_on['sensor_drone'] * 0.02);
                }
                if (global.tech['science'] >= 20){
                    gain *= 3;
                }
                if (global.tech['science'] >= 21){
                    gain *= 1.45;
                }
                if (global.tech['biotech'] >= 1){
                    gain *= 2.5;
                }
                gain = +(gain).toFixed(0);
                return `<span>${loc('city_max_knowledge',[gain.toLocaleString()])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span>`;
            },
            powered(){ return powerCostMod(2); },
            action(){
                if (payCosts($(this)[0])){
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
                return global.race['environmentalist'] ? loc('city_hydro_power') : loc(global.race.universe === 'magic' ? 'city_mana_engine' : 'city_coal_power');
            },
            desc(){
                return global.race['environmentalist']
                    ? `<div>${loc('city_hydro_power_desc')}</div>`
                    : `<div>${loc(global.race.universe === 'magic' ? 'city_mana_engine_desc' : 'city_coal_power_desc')}</div><div class="has-text-special">${loc('requires_res',[loc(global.race.universe === 'magic' ? 'resource_Mana_name' : 'resource_Coal_name')])}</div>`;
            },
            category: 'utility',
            reqs: { high_tech: 2 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('coal_power', offset, 10000, dirt_adjust(1.22)); },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('coal_power', offset, 125, dirt_adjust(1.22)) : 0; },
                Copper(offset){ return costMultiplier('coal_power', offset, 1800, dirt_adjust(1.22)) - 1000; },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('coal_power', offset, 175, dirt_adjust(1.22)) : 0; },
                Cement(offset){ return costMultiplier('coal_power', offset, 600, dirt_adjust(1.22)); },
                Steel(offset){ return costMultiplier('coal_power', offset, 2000, dirt_adjust(1.22)) - 1000; }
            },
            effect(){
                let consume = global.race.universe === 'magic' ? 0.05 : 0.35;
                let power = -($(this)[0].powered());
                return global.race['environmentalist'] ? `+${power}MW` : `<span>+${power}MW.</span> <span class="has-text-caution">${loc(global.race.universe === 'magic' ? 'city_mana_engine_effect' : 'city_coal_power_effect',[consume])}</span>`;
            },
            powered(){
                return global.race['environmentalist']
                    ? powerModifier(global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 1 ? -5 : -4)
                    : powerModifier(global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 1 ? -6 : -5);
            },
            action(){
                if (payCosts($(this)[0])){
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('oil_power', offset, 50000, dirt_adjust(1.22)); },
                Copper(offset){ return costMultiplier('oil_power', offset, 6500, dirt_adjust(1.22)) + 1000; },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('oil_power', offset, 180, dirt_adjust(1.22)) : 0; },
                Aluminium(offset){ return costMultiplier('oil_power', offset, 12000, dirt_adjust(1.22)); },
                Cement(offset){ return costMultiplier('oil_power', offset, 5600, dirt_adjust(1.22)) + 1000; }
            },
            effect(){
                let consume = 0.65;
                let power = -($(this)[0].powered());
                return global.race['environmentalist'] ? `+${power}MW` : `<span>+${power}MW.</span> <span class="has-text-caution">${loc('city_oil_power_effect',[consume])}</span>`;
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
                if (payCosts($(this)[0])){
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('fission_power', offset, 250000, 1.36); },
                Copper(offset){ return costMultiplier('fission_power', offset, 13500, 1.36); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('fission_power', offset, 1750, 1.36) : 0; },
                Cement(offset){ return costMultiplier('fission_power', offset, 10800, 1.36); },
                Titanium(offset){ return costMultiplier('fission_power', offset, 7500, 1.36); }
            },
            effect(){
                let consume = 0.1;
                return `<span>+${-($(this)[0].powered())}MW.</span> <span class="has-text-caution">${loc('city_fission_power_effect',[consume])}</span>`;
            },
            powered(){ return powerModifier(global.tech['uranium'] >= 4 ? -18 : -14); },
            action(){
                if (payCosts($(this)[0])){
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
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('mass_driver', offset, 375000, 1.32); },
                Copper(offset){ return costMultiplier('mass_driver', offset, 33000, 1.32); },
                Iron(offset){ return costMultiplier('mass_driver', offset, 42500, 1.32); },
                Iridium(offset){ return costMultiplier('mass_driver', offset, 2200, 1.32); }
            },
            effect(){
                let exo = global.tech.mass >= 2 ? `<div>${loc('city_mass_driver_effect2',[1,global.civic.scientist.name])}</div>` : '';
                return `${exo}<span>${loc('city_mass_driver_effect',[global.race['truepath'] ? 6 : 5,flib('name')])}</span> <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span>`;
            },
            powered(){
                let power = global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 4 ? 4 : 5;
                return powerCostMod(global.tech.mass >= 2 ? power - 1 : power);
            },
            action(){
                if (payCosts($(this)[0])){
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
    tech: techList(),
    arpa: arpa('PhysicsTech'),
    genes: arpa('GeneTech'),
    blood: arpa('BloodTech'),
    space: spaceTech(),
    interstellar: interstellarTech(),
    galaxy: galaxyTech(),
    starDock: {
        probes: {
            id: 'starDock-probes',
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
                if (payCosts($(this)[0])){
                    global.starDock.probes.count++;
                    return true;
                }
                return false;
            },
        },
        seeder: {
            id: 'starDock-seeder',
            title(){ return global.race['cataclysm'] ? loc('star_dock_exodus') : loc('star_dock_seeder'); },
            desc(){
                let label = global.race['cataclysm'] ? loc('star_dock_exodus') : loc('star_dock_seeder');
                if (global.starDock.seeder.count >= 100){
                    return `<div>${label}</div><div class="has-text-special">${loc('star_dock_seeder_desc2')}</div>`;
                }
                else {
                    return `<div>${label}</div><div class="has-text-special">${loc('star_dock_seeder_desc1')}</div>`;
                }
            },
            reqs: { genesis: 5 },
            no_queue(){ return global.starDock.seeder.count < 100 ? false : true },
            queue_size: 10,
            queue_complete(){ return 100 - global.starDock.seeder.count; },
            cost: {
                Money(){ return global.starDock.seeder.count < 100 ? 100000 : 0; },
                Steel(){ return global.starDock.seeder.count < 100 ? 25000 : 0; },
                Neutronium(){ return global.starDock.seeder.count < 100 ? 240 : 0; },
                Elerium(){ return global.starDock.seeder.count < 100 ? 10 : 0; },
                Nano_Tube(){ return global.starDock.seeder.count < 100 ? 12000 : 0; },
            },
            effect(){
                let remain = global.starDock.seeder.count < 100 ? loc('star_dock_seeder_status1',[100 - global.starDock.seeder.count]) : loc('star_dock_seeder_status2');
                return `<div>${global.race['cataclysm'] ? loc('star_dock_exodus_effect') : loc('star_dock_seeder_effect')}</div><div class="has-text-special">${remain}</div>`;
            },
            action(){
                if (global.starDock.seeder.count < 100 && payCosts($(this)[0])){
                    global.starDock.seeder.count++;
                    if (global.starDock.seeder.count >= 100){
                        global.tech.genesis = 6;
                        clearPopper(`starDock-seeder`);
                        clearElement($('#modalBox'));
                        let c_action = actions.space.spc_gas.star_dock;
                        drawModal(c_action,'star_dock');
                    }
                    return true;
                }
                return false;
            },
        },
        prep_ship: {
            id: 'starDock-prep_ship',
            title: loc('star_dock_prep'),
            desc(){
                let label = global.race['cataclysm'] ? loc('star_dock_prep_cata_desc') : loc('star_dock_prep_desc');
                return `<div>${label}</div><div class="has-text-danger">${loc('star_dock_genesis_desc2')}</div>`;
            },
            reqs: { genesis: 6 },
            cost: {},
            no_queue(){ return true },
            effect(){
                let gains = calcPrestige('bioseed');
                let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
                let label = global.race['cataclysm'] ? loc('star_dock_prep_cata_effect') : loc('star_dock_prep_effect');
                return `<div>${label}</div><div class="has-text-special">${loc('star_dock_genesis_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-special">${loc('star_dock_genesis_effect3',[gains.phage])}</div>`;
            },
            action(){
                global.tech['genesis'] = 7;
                clearPopper(`starDock-prep_ship`);
                clearElement($('#modalBox'));
                let c_action = actions.space.spc_gas.star_dock;
                drawModal(c_action,'star_dock');
                return true;
            },
        },
        launch_ship: {
            id: 'starDock-launch_ship',
            title: loc('star_dock_genesis'),
            desc(){
                let label = global.race['cataclysm'] ? loc('star_dock_prep_cata_effect') : loc('star_dock_genesis_desc1');
                return `<div>${label}</div><div class="has-text-danger">${loc('star_dock_genesis_desc2')}</div>`;
            },
            reqs: { genesis: 7 },
            cost: {},
            no_queue(){ return true },
            effect(){
                let gains = calcPrestige('bioseed');
                let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
                let label = global.race['cataclysm'] ? loc('star_dock_genesis_cata_effect1') : loc('star_dock_genesis_effect1');
                return `<div>${label}</div><div class="has-text-special">${loc('star_dock_genesis_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-special">${loc('star_dock_genesis_effect3',[gains.phage])}</div>`;
            },
            action(){
                bioseed();
                return false;
            },
        },
    },
    portal: fortressTech()
};

export function setChallengeScreen(){
    let list = $(`#evolution .evolving`).nextAll();
    Object.values(list).forEach(function(elm){
        clearElement($(elm),true);
    });
    clearElement($(`#evolution .evolving`),true);
    global.evolution['bunker'] = { count: 1 };
    removeAction(actions.evolution.bunker.id);
    evoProgress();
    if (global.race['truepath']){
        global.evolution['nerfed'] = { count: 0 };
        global.evolution['badgenes'] = { count: 0 };
    }
    else {
        if (global.race.universe === 'antimatter'){
            global.evolution['mastery'] = { count: 0 };
        }
        else {
            global.evolution['plasmid'] = { count: 0 };
        }
        global.evolution['crispr'] = { count: 0 };
    }
    global.evolution['trade'] = { count: 0 };
    global.evolution['craft'] = { count: 0 };
    global.evolution['junker'] = { count: 0 };
    global.evolution['joyless'] = { count: 0 };
    global.evolution['steelen'] = { count: 0 };
    if (global.stats.achieve['whitehole']){
        global.evolution['decay'] = { count: 0 };
    }
    if (global.stats.achieve['ascended']){
        global.evolution['emfield'] = { count: 0 };
    }
    if (global.stats.achieve['scrooge']){
        global.evolution['inflation'] = { count: 0 };
    }
    if (global.stats.achieve['shaken']){
        global.evolution['cataclysm'] = { count: 0 };
    }
    if (global.stats.achieve['whitehole'] || global.stats.achieve['ascended']){
        global.evolution['banana'] = { count: 0 };
    }
    if (global.stats.achieve['ascended'] || global.stats.achieve['corrupted']){
        global.evolution['truepath'] = { count: 0 };
    }
    challengeGeneHeader();
    if (global.race['truepath']){
        addAction('evolution','nerfed');
    }
    else {
        if (global.race.universe === 'antimatter'){
            addAction('evolution','mastery');
        }
        else {
            addAction('evolution','plasmid');
        }
    }
    addAction('evolution','trade');
    addAction('evolution','craft');
    if (global.race['truepath']){
        addAction('evolution','badgenes');
    }
    else {
        addAction('evolution','crispr');
    }
    challengeActionHeader();
    addAction('evolution','joyless');
    addAction('evolution','steelen');
    if (global.stats.achieve['whitehole']){
        addAction('evolution','decay');
    }
    if (global.stats.achieve['ascended']){
        addAction('evolution','emfield');
    }
    if (global.stats.achieve['scrooge']){
        addAction('evolution','inflation');
    }
    scenarioActionHeader();
    addAction('evolution','junker');
    if (global.stats.achieve['shaken']){
        addAction('evolution','cataclysm');
    }
    if (global.stats.achieve['whitehole'] || global.stats.achieve['ascended']){
        addAction('evolution','banana');
    }
    if (global.stats.achieve['ascended'] || global.stats.achieve['corrupted']){
        addAction('evolution','truepath');
    }
}

export function buildTemplate(key, region){
    let tKey = region === 'space' ? 'trait' : 'not_trait';
    switch (key){
        case 'bonfire':
        {
            let id = region === 'space' ? 'space-bonfire' : 'city-bonfire';
            return {
                id: id,
                title: loc('city_bonfire'),
                desc: loc('city_bonfire_desc'),
                category: 'outskirts',
                wiki: false,
                reqs: { primitive: 3  },
                condition(){
                    return eventActive(`summer`);
                },
                [tKey]: ['cataclysm'],
                no_queue(){ return true },
                effect(){
                    let morale = (global.resource.Thermite.diff * 2.5) / (global.resource.Thermite.diff * 2.5 + 500) * 500;
                    let thermite = 100000 + global.stats.reset * 9000;
                    if (thermite > 1000000){ thermite = 1000000; }
                    let goal = global.resource.Thermite.amount < thermite ? `<div class="has-text-warning">${loc('city_bonfire_effect3',[(thermite).toLocaleString()])}</div><div class="has-text-caution">${loc('city_bonfire_effect4',[(+(global.resource.Thermite.amount).toFixed(0)).toLocaleString(),(thermite).toLocaleString()])}</div>` : ``;
                    return `<div>${loc(`city_bonfire_effect`,[global.resource.Thermite.diff])}</div><div>${loc(`city_bonfire_effect2`,[+(morale).toFixed(1)])}</div>${goal}`;
                },
                action(){
                    return false;
                },
                flair(){
                    return loc(`city_bonfire_flair`);
                }
            };
        }
        case 'firework':
        {
            let id = region === 'space' ? 'space-firework' : 'city-firework';
            return {
                id: id,
                title: loc('city_firework'),
                desc: loc('city_firework'),
                category: 'outskirts',
                wiki: false,
                reqs: { mining: 3, cement: 1 },
                condition(){
                    return eventActive(`firework`);
                },
                [tKey]: ['cataclysm'],
                cost: {
                    Money(){ return global[region].firework.count === 0 ? 50000 : 0; },
                    Iron(){ return global[region].firework.count === 0 ? 7500 : 0; },
                    Cement(){ return global[region].firework.count === 0 ? 10000 : 0; }
                },
                no_queue(){ return true },
                switchable(){ return true; },
                effect(){
                    return global[region].firework.count === 0 ? loc(`city_firework_build`) : loc(`city_firework_effect`);
                },
                action(){
                    if (global[region].firework.count === 0 && payCosts($(this)[0])){
                        global[region].firework.count = 1;
                        return true;
                    }
                    return false;
                }
            };
        }
        case 'assembly':
        {
            let id = region === 'space' ? 'space-assembly' : 'city-assembly';
            let action = {
                id: id,
                title: loc('city_assembly'),
                desc(){ return loc('city_assembly_desc',[races[global.race.species].name]); },
                category: 'military',
                reqs: {},
                trait: ['artifical'],
                no_queue(){ return global.resource[global.race.species].max > global.resource[global.race.species].amount ? false : true; },
                cost: {
                    Money(offset){ return global['resource'][global.race.species].amount ? costMultiplier('citizen', offset, 125, 1.01) : 0; },
                    Copper(offset){ return global.race['deconstructor'] ? 0 : global['resource'][global.race.species].amount >= 5 ? costMultiplier('citizen', offset, 50, 1.01) : 0; },
                    Aluminium(offset){ return global.race['deconstructor'] ? 0 : global['resource'][global.race.species].amount >= 5 ? costMultiplier('citizen', offset, 50, 1.01) : 0; },
                    Nanite(offset){ return global.race['deconstructor'] ? (global['resource'][global.race.species].amount >= 3 ? costMultiplier('citizen', offset, 500, 1.01) : 0) : 0; },
                },
                effect(){
                    let warn = '';
                    if (global['resource'][global.race.species].max === global['resource'][global.race.species].amount){
                        warn = `<div class="has-text-caution">${loc('city_assembly_effect_warn')}</div>`;
                    }
                    return `<div>${loc('city_assembly_effect',[races[global.race.species].name])}</div>${warn}`;
                },
                action(){
                    if (global['resource'][global.race.species].max > global['resource'][global.race.species].amount && payCosts($(this)[0])){
                        global['resource'][global.race.species].amount++;
                        return true;
                    }
                    return false;
                }
            };

            if (region === 'space'){
                action.trait.push('cataclysm');
            }
            else {
                action['not_trait'] = ['cataclysm'];
            }
            return action;
        }
        case 'nanite_factory':
        {
            let id = region === 'space' ? 'space-nanite_factory' : 'city-nanite_factory';
            let action = {
                id: id,
                title: loc('city_nanite_factory'),
                desc: loc('city_nanite_factory'),
                category: 'industrial',
                reqs: {},
                trait: ['deconstructor'],
                region: 'city',
                cost: {
                    Money(offset){ return costMultiplier('nanite_factory', offset, 25000, dirt_adjust(1.25)); },
                    Copper(offset){ return costMultiplier('nanite_factory', offset, 1200, dirt_adjust(1.25)); },
                    Steel(offset){ return costMultiplier('nanite_factory', offset, 1000, dirt_adjust(1.25)); }
                },
                effect(){
                    let val = spatialReasoning(2500);
                    return `<div>${loc('city_nanite_factory_effect',[global.resource.Nanite.name])}</div><div>${loc('plus_max_resource',[val,global.resource.Nanite.name])}.</div>`;
                },
                special: true,
                action(){
                    if (payCosts($(this)[0])){
                        global.city.nanite_factory.count++;
                        global.settings.showIndustry = true;
                        defineIndustry();
                        return true;
                    }
                    return false;
                },
                flair: loc(`city_nanite_factory_flair`)
            };

            if (region === 'space'){
                action.trait.push('cataclysm');
            }
            else {
                action['not_trait'] = ['cataclysm'];
            }
            return action;
        }
    }
}

export const raceList = ['human','orc','elven','troll','ogre','cyclops','kobold','goblin','gnome','cath','wolven','vulpine','centaur','rhinotaur','capybara','tortoisan','gecko','slitheryn','arraak','pterodacti','dracnid','sporgar','shroomi','moldling','mantis','scorpid','antid','entish','cacti','pinguicula','sharkin','octigoran','dryad','satyr','phoenix','salamander','yeti','wendigo','tuskin','kamel','imp','balorg','seraph','unicorn','synth','nano'];
//export const raceList = ['human','orc','elven','troll','ogre','cyclops','kobold','goblin','gnome','cath','wolven','vulpine','centaur','rhinotaur','capybara','bearkin','porkenari','hedgeoken','tortoisan','gecko','slitheryn','arraak','pterodacti','dracnid','sporgar','shroomi','moldling','mantis','scorpid','antid','entish','cacti','pinguicula','sharkin','octigoran','dryad','satyr','phoenix','salamander','yeti','wendigo','tuskin','kamel','imp','balorg','seraph','unicorn'];
raceList.forEach(race => actions.evolution[race] = {
    id: `evolution-${race}`,
    title(){ return races[race].name; },
    desc(){ return `${loc("evo_evolve")} ${races[race].name}`; },
    cost: {
        RNA(){ return 320; },
        DNA(){ return 320; }
    },
    effect(){ return `${typeof races[race].desc === 'string' ? races[race].desc : races[race].desc()} ${loc(`evo_complete`)}`; },
    action(){
        if (payCosts($(this)[0])){
            global.evolution['sentience'].count++;
            removeAction(actions.evolution.sentience.id);
            global.race.species = race;
            sentience();
            return true;
        }
        return false;
    },
    no_queue(){
        let key = $(this)[0].id.split('-')[1];
        return !global.evolution.hasOwnProperty(key) || global.evolution[key].count >= 1 ? true : false;
    },
    queue_complete(){ return 1; },
    queueable: true,
    emblem(){ return format_emblem(`extinct_${race}`); }
});

const challengeList = {
    'plasmid': 'no_plasmid',
    'mastery': 'weak_mastery',
    'trade': 'no_trade',
    'craft': 'no_craft',
    'crispr': 'no_crispr',
    'nerfed': 'nerfed',
    'badgenes': 'badgenes',
};
Object.keys(challengeList).forEach(challenge => actions.evolution[challenge] = {
    id: `evolution-${challenge}`,
    title: loc(`evo_challenge_${challenge}`),
    desc: loc(`evo_challenge_${challenge}`),
    cost: {
        DNA(){ return 10; }
    },
    effect: challengeEffect(challenge),
    action(){
        if (payCosts($(this)[0])){
            if (global.race[challengeList[challenge]]){
                delete global.race[challengeList[challenge]];
                $(`#${$(this)[0].id}`).removeClass('hl');
                if (global.race['truepath']){
                    delete global.race['nerfed'];
                    delete global.race['badgenes'];
                }
                ['junker','cataclysm','banana','truepath'].forEach(function(s){
                    delete global.race[s];
                    $(`#evolution-${s}`).removeClass('hl');
                });
            }
            else {
                global.race[challengeList[challenge]] = 1;
                $(`#${$(this)[0].id}`).addClass('hl');
            }
            setChallengeScreen();
            challengeIcon();
        }
        return false;
    },
    highlight(){ return global.race[challengeList[challenge]] ? true : false; }
});

function challengeEffect(c){
    switch (c){
        case 'nerfed':
            let nVal = global.race.universe === 'antimatter' ? [`20%`,`50%`,`50%`,`33%`] : [`50%`,`20%`,`50%`,`33%`];
            return loc(`evo_challenge_${c}_effect`,nVal);
        case 'badgenes':
            return loc(`evo_challenge_${c}_effect`,[1,2]);
        default:
            return loc(`evo_challenge_${c}_effect`);
    }
}

function cleanEvolution(id){
    ['humanoid','gigantism','dwarfism','animalism','carnivore','herbivore','omnivore','athropods','mammals','eggshell','fey','aquatic','heat','polar','sand','celestial','demonic'].forEach(function(path){
        removeAction(actions.evolution[path].id);
        if (global.evolution.hasOwnProperty(path) && `evolution-${path}` !== id){
            delete global.evolution[path];
        }
    });
}

export function templeEffect(){
    let desc;
    if (global.race.universe === 'antimatter' || global.race['no_plasmid']){
        let faith = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 1.6 : 1;
        if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
            faith += +(global.civic.professor.workers * (global.race.universe === 'antimatter' ? 0.02 : 0.04)).toFixed(2);
        }
        if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
            let priest_bonus = global.genes['ancients'] >= 5 ? 0.015 : (global.genes['ancients'] >= 3 ? 0.0125 : 0.01);
            faith += priest_bonus * global.civic.priest.workers;
        }
        if (global.race.universe === 'antimatter'){
            faith /= 2;
        }
        if (global.race['spiritual']){
            faith *= 1 + (traits.spiritual.vars()[0] / 100);
        }
        if (global.civic.govern.type === 'theocracy'){
            faith *= 1.12;
        }
        faith = +(faith).toFixed(3);
        desc = `<div>${loc('city_temple_effect1',[faith])}</div>`;
        if (global.race.universe === 'antimatter'){
            let temple = 6;
            if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                let priest = global.genes['ancients'] >= 5 ? 0.12 : (global.genes['ancients'] >= 3 ? 0.1 : 0.08);
                temple += priest * global.civic.priest.workers;
            }
            desc += `<div>${loc('city_temple_effect5',[temple.toFixed(2)])}</div>`;
        }
    }
    else {
        let plasmid = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 8 : 5;
        if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
            plasmid += +(global.civic.professor.workers * 0.2).toFixed(1);
        }
        if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
            let priest_bonus = global.genes['ancients'] >= 5 ? 0.15 : (global.genes['ancients'] >= 3 ? 0.125 : 0.1);
            plasmid += priest_bonus * global.civic.priest.workers;
        }
        if (global.race['spiritual']){
            plasmid *= 1 + (traits.spiritual.vars()[0] / 100);
        }
        if (global.civic.govern.type === 'theocracy'){
            plasmid *= 1.12;
        }
        plasmid = +(plasmid).toFixed(3);
        desc = `<div>${loc('city_temple_effect2',[plasmid])}</div>`;
    }
    if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 3){
        desc = desc + `<div>${loc('city_temple_effect3')}</div>`;
    }
    if (global.tech['anthropology'] && global.tech['anthropology'] >= 4){
        desc = desc + `<div>${global.race['truepath'] ? loc('city_temple_effect_tp',[2,25]) : loc('city_temple_effect4')}</div>`;
    }
    return desc;
}

export function casinoEffect(){
    let money = global.tech['gambling'] >= 3 ? 60000 : 40000;
    if (global.tech['gambling'] >= 5){
        money += global.tech['gambling'] >= 6 ? 240000 : 60000;
    }
    money = spatialReasoning(money);
    if (global.race['gambler']){
        money *= 1 + (global.race['gambler'] * 0.04);
    }
    if (global.tech['world_control']){
        money = money * 1.25;
    }
    if (global.race['truepath']){
        money = money * 1.5;
    }
    if (global.tech['stock_exchange'] && global.tech['gambling'] >= 4){
        money *= 1 + (global.tech['stock_exchange'] * 0.05);
    }
    if (global.race['inflation']){
        money *= 1 + (global.race.inflation / 100);
    }
    money = Math.round(money);
    let joy = global.race['joyless'] ? '' : `<div>${loc('city_max_entertainer',[1])}</div>`;
    let desc = `<div>${loc('plus_max_resource',[`\$${money.toLocaleString()}`,loc('resource_Money_name')])}</div>${joy}<div>${loc('city_max_morale',[1])}</div>`;
    let cash = Math.log2(1 + global.resource[global.race.species].amount) * (global.race['gambler'] ? 2.5 + (global.race['gambler'] / 10) : 2.5);
    if (global.tech['gambling'] && global.tech['gambling'] >= 2){
        cash *= global.tech.gambling >= 5 ? 2 : 1.5;
    }
    if (global.tech['stock_exchange'] && global.tech['gambling'] >= 4){
        cash *= 1 + (global.tech['stock_exchange'] * 0.01);
    }
    if (global.civic.govern.type === 'corpocracy'){
        cash *= 3;
    }
    if (global.civic.govern.type === 'socialist'){
        cash *= 0.8;
    }
    if (global.race['inflation']){
        cash *= 1 + (global.race.inflation / 1250);
    }
    cash = +(cash).toFixed(2);
    desc = desc + `<div>${loc('tech_casino_effect2',[cash])}</div>`;
    return desc;
}

function evolveCosts(molecule,base,mult,offset){
    let count = (global.evolution.hasOwnProperty(molecule) ? global.evolution[molecule].count : 0) + (offset || 0);
    return count * mult + base;
}

function addRaces(races){
    let add_all = false;
    if (global.race.seeded || (global.stats.achieve['mass_extinction'] && global.stats.achieve['mass_extinction'].l >= 1)){
        add_all = true;
    }
    for (let i=0; i<races.length; i++){
        if (add_all || (global.stats.achieve[`extinct_${races[i]}`] && global.stats.achieve[`extinct_${races[i]}`].l >= 1)){
            global.evolution[races[i]] = { count: 0 };
            addAction('evolution',races[i]);
        }
    }
}

function setScenario(scenario){
    Object.keys(races).forEach(function(r){
        if (r !== 'junker'){
            $(`#evolution-${r}`).removeClass('is-hidden');
        }
    });
    if (global.race[scenario]){
        delete global.race[scenario];
        $(`#evolution-${scenario}`).removeClass('hl');
        ['nerfed','badgenes'].forEach(function(gene){
            delete global.race[challengeList[gene]];
        });
    }
    else {
        ['junker','cataclysm','banana','truepath'].forEach(function(s){
            delete global.race[s];
            $(`#evolution-${s}`).removeClass('hl');
        });
        global.race[scenario] = 1;
        $(`#evolution-${scenario}`).addClass('hl');

        if (scenario === 'junker'){
            Object.keys(races).forEach(function(r){
                if (r !== 'junker'){
                    $(`#evolution-${r}`).addClass('is-hidden');
                }
            });
        }

        if (scenario === 'truepath'){
            global.race['nerfed'] = 1;
            ['crispr','plasmid','mastery'].forEach(function(gene){
                delete global.race[challengeList[gene]];
            });
        }
        else {
            ['nerfed','badgenes'].forEach(function(gene){
                delete global.race[challengeList[gene]];
            });

            if (global.race.universe === 'antimatter'){
                global.race['weak_mastery'] = 1;
                if (!$(`#evolution-mastery`).hasClass('hl')){
                    $(`#evolution-mastery`).addClass('hl');
                }
            }
            else {
                global.race['no_plasmid'] = 1;
                if (!$(`#evolution-plasmid`).hasClass('hl')){
                    $(`#evolution-plasmid`).addClass('hl');
                }
            }
        }

        let genes = scenario === 'truepath' ? ['badgenes','trade','craft'] : ['crispr','trade','craft'];
        for (let i=0; i<genes.length; i++){
            global.race[challengeList[genes[i]]] = 1;
            if (!$(`#evolution-${genes[i]}`).hasClass('hl')){
                $(`#evolution-${genes[i]}`).addClass('hl');
            }
        }
    }
    setChallengeScreen();
    challengeIcon();
}

export function BHStorageMulti(val){
    if (global.stats.achieve['blackhole']){
        val *= 1 + global.stats.achieve.blackhole.l * 0.05;
    }
    return Math.round(val);
}

export function storageMultipler(){
    let multiplier = (global.tech['storage'] - 1) * 1.25 + 1;
    if (global.tech['storage'] >= 3){
        multiplier *= global.tech['storage'] >= 4 ? 3 : 1.5;
    }
    if (global.race['pack_rat']){
        multiplier *= 1 + (traits.pack_rat.vars()[1] / 100);
    }
    if (global.tech['storage'] >= 6){
        multiplier *= 1 + (global.tech['supercollider'] / 20);
    }
    if (global.tech['tp_depot']){
        multiplier *= 1 + (global.tech['tp_depot'] / 20);
    }
    if (global.tech['shelving'] && global.tech.shelving >= 3){
        multiplier *= 1.5;
    }
    if (global.stats.achieve['blackhole']){
        multiplier *= 1 + global.stats.achieve.blackhole.l * 0.05;
    }
    multiplier *= global.tech['world_control'] ? 3 : 1;
    if (global.race['ascended']){
        multiplier *= 1.1;
    }
    if (global.blood['hoarder']){
        multiplier *= 1 + (global.blood['hoarder'] / 100);
    }
    if (global.tech['storage'] >= 7 && global.interstellar['cargo_yard']){
        multiplier *= 1 + ((global.interstellar['cargo_yard'].count * quantum_level) / 100);
    }
    return multiplier;
}

export function checkCityRequirements(action){
    if ((global.race['kindling_kindred'] || global.race['smoldering']) && action === 'lumber'){
        return false;
    }
    else if ((global.race['kindling_kindred'] || global.race['smoldering']) && action === 'stone'){
        return true;
    }
    let c_path = global.race['truepath'] ? 'truepath' : 'standard';
    if (actions.city[action].hasOwnProperty('path') && !actions.city[action].path.includes(c_path)){
        return false;
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
    let isMet = true;

    let path = global.race['truepath'] ? 'truepath' : 'standard';
    if ((!techPath[path].includes(actions.tech[tech].era) && !actions.tech[tech].hasOwnProperty('path')) || (actions.tech[tech].hasOwnProperty('path') && !actions.tech[tech].path.includes(path))){
        return false;
    }

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

export function checkTechQualifications(c_action,type){
    if (c_action['condition'] && !c_action.condition()){
        return false;
    }
    if (c_action['not_trait']){
        for (let i=0; i<c_action.not_trait.length; i++){
            if (global.race[c_action.not_trait[i]]){
                return false;
            }
        }
    }
    if (c_action['trait']){
        for (let i=0; i<c_action.trait.length; i++){
            if (!global.race[c_action.trait[i]]){
                return false;
            }
        }
    }
    if (c_action['not_gene']){
        for (let i=0; i<c_action.not_gene.length; i++){
            if (global.genes[c_action.not_gene[i]]){
                return false;
            }
        }
    }
    if (c_action['gene']){
        for (let i=0; i<c_action.gene.length; i++){
            if (!global.genes[c_action.gene[i]]){
                return false;
            }
        }
    }
    if (c_action['not_tech']){
        for (let i=0; i<c_action.not_tech.length; i++){
            if (global.tech[c_action.not_tech[i]]){
                return false;
            }
        }
    }
    if (type === 'ancient_theology' && !global.genes['ancients']){
        return false;
    }
    return true;
}

function checkOldTech(tech){
    let tch = actions.tech[tech].grant[0];
    if (global.tech[tch] && global.tech[tch] >= actions.tech[tech].grant[1]){
        if (tech !== 'fanaticism' && tech !== 'anthropology' && tech !== 'deify' && tech !== 'study'){
            return true;
        }
        else if (tech === 'fanaticism' && global.tech['fanaticism']){
            return true;
        }
        else if (tech === 'anthropology' && global.tech['anthropology']){
            return true;
        }
        else if (tech === 'deify' && global.tech['ancient_deify']){
            return true;
        }
        else if (tech === 'study' && global.tech['ancient_study']){
            return true;
        }
    }
    return false;
}

export function checkPowerRequirements(c_action){
    let isMet = true;
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
    let tech = actions.tech[action].grant[0];
    if (!global.tech[tech]){
        global.tech[tech] = 0;
    }
    addAction('tech',action);
}

export function gainTech(action){
    let tech = actions.tech[action].grant[0];
    global.tech[tech] = actions.tech[action].grant[1];
    drawCity();
    drawTech();
    renderSpace();
    renderFortress();
}

export function drawCity(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 0)){
        return;
    }
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

    city_categories.forEach(function(category){
        clearElement($(`#city-dist-${category}`),true);
        if (global.settings['cLabels']){
            if(!(category in city_buildings))
                return;

            $(`<div id="city-dist-${category}" class="city"></div>`)
                .appendTo('#city')
                .append(`<div><h3 class="name has-text-warning">${loc(`city_dist_${category}`)}</h3></div>`);

            city_buildings[category].forEach(function(city_name) {
                addAction('city', city_name);
            });

            popover(`dist-${category}`, function(){
                return loc(`city_dist_${category}_desc`);
            },
            {
                elm: `#city-dist-${category} h3`,
                classes: `has-background-light has-text-dark`
            });
        }
    });
}

export function drawTech(){
    if (!global.settings.tabLoad && global.settings.civTabs !== 3){
        return;
    }
    let techs = {};
    let old_techs = {};
    let new_techs = {};
    let tech_categories = [];
    let old_categories = [];
    let all_categories = [];

    ['primitive','civilized','discovery','industrialized','globalized','early_space','deep_space','interstellar','intergalactic'].forEach(function (era){
        new_techs[era] = [];
    });

    const tp_era = {
        interstellar: 'solar'
    };

    Object.keys(actions.tech).forEach(function (tech_name){
        removeAction(actions.tech[tech_name].id);

        let isOld = checkOldTech(tech_name);

        let action = actions.tech[tech_name];
        let category = 'category' in action ? action.category : 'research';

        if (!isOld && tech_categories.indexOf(category) === -1) {
            tech_categories.push(category);
        }
        if (isOld && old_categories.indexOf(category) === -1) {
            old_categories.push(category);
        }
        if (all_categories.indexOf(category) === -1) {
            all_categories.push(category);
        }

        if (isOld === true) {
            if (!(category in old_techs)){
                old_techs[category] = [];
            }

            old_techs[category].push(tech_name);
        }
        else {
            if (!checkTechRequirements(tech_name)){
                return;
            }
            let c_action = actions['tech'][tech_name];
            if (!checkTechQualifications(c_action,tech_name)){
                return;
            }

            if (!(category in techs)) {
                techs[category] = [];
            }

            let era = global.race['truepath'] && tp_era[c_action.era] ? tp_era[c_action.era] : c_action.era;

            if (!new_techs.hasOwnProperty(era)){
                new_techs[era] = [];
            }

            new_techs[era].push(tech_name);
        }
    });

    clearElement($(`#tech`));
    Object.keys(new_techs).forEach(function (era){
        if (new_techs[era].length > 0){
            $(`#tech`).append(`<div><h3 class="name has-text-warning">${loc(`tech_era_${era}`)}</h3></div>`);

            new_techs[era].sort(function(a, b){
                if(actions.tech[a].cost.Knowledge == undefined){
                    return -1;
                }
                if(actions.tech[b].cost.Knowledge == undefined){
                    return 1;
                }
                return actions.tech[a].cost.Knowledge() > actions.tech[b].cost.Knowledge() ? 1 : -1;
            });
            new_techs[era].forEach(function(tech_name){
                addAction('tech', tech_name);
            });
        }
    });

    all_categories.forEach(function(category){
        clearElement($(`#tech-dist-${category}`),true);
        clearElement($(`#tech-dist-old-${category}`),true);
    });

    old_categories.forEach(function(category){
        if(!(category in old_techs)){
            return;
        }

        $(`<div id="tech-dist-old-${category}" class="tech"></div>`)
            .appendTo('#oldTech')
            .append(`<div><h3 class="name has-text-warning">${loc(`tech_dist_${category}`)}</h3></div>`);

        let trick = trickOrTreat(4,12,false);
        if (trick.length > 0 && category === 'science'){
            $(`#tech-dist-old-science h3`).append(trick);
        }

        old_techs[category].forEach(function(tech_name) {
            addAction('tech', tech_name, true);
        });
    });
}

export function addAction(action,type,old){
    let c_action = actions[action][type];
    setAction(c_action,action,type,old)
}

export function setAction(c_action,action,type,old){
    if (checkTechQualifications(c_action,type) === false) {
        return;
    }
    let tab = action;
    if (action === 'outerSol'){
        action = 'space';
    }
    if (c_action['region']){
        action = c_action.region;
    }
    if (c_action['powered'] && !global[action][type]['on']){
        global[action][type]['on'] = 0;
    }
    let id = c_action.id;
    removeAction(id);
    let parent = c_action['highlight'] && c_action.highlight() ? $(`<div id="${id}" class="action hl"></div>`) : $(`<div id="${id}" class="action"></div>`);
    if (!checkAffordable(c_action)){
        parent.addClass('cna');
    }
    if (!checkAffordable(c_action,true)){
        parent.addClass('cnam');
    }
    let element;
    if (old){
        element = $('<span class="oldTech is-dark"><span class="aTitle">{{ title }}</span></span>');
    }
    else {
        let cst = '';
        let data = '';
        if (c_action['cost']){
            let costs = action !== 'genes' && action !== 'blood' ? adjustCosts(c_action) : c_action.cost;
            Object.keys(costs).forEach(function (res){
                let cost = costs[res]();
                if (cost > 0){
                    cst = cst + ` res-${res}`;
                    data = data + ` data-${res}="${cost}"`;
                }
            });
        }
        let clss = c_action['class'] ? ` ${c_action['class']}` : ``;
        element = $(`<a class="button is-dark${cst}${clss}"${data} v-on:click="action"><span class="aTitle" v-html="$options.filters.title(title)">}</span></a><a v-on:click="describe" class="is-sr-only">{{ title }} description</a>`);
    }
    parent.append(element);

    if (c_action.hasOwnProperty('special') && ((typeof c_action['special'] === 'function' && c_action.special()) || c_action['special'] === true) ){
        let special = $(`<div class="special" role="button" title="${type} options" @click="trigModal"><svg version="1.1" x="0px" y="0px" width="12px" height="12px" viewBox="340 140 280 279.416" enable-background="new 340 140 280 279.416" xml:space="preserve">
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
    if ((c_action['powered'] && global.tech['high_tech'] && global.tech['high_tech'] >= 2 && checkPowerRequirements(c_action)) || (c_action['switchable'] && c_action.switchable())){
        let powerOn = $(`<span role="button" :aria-label="on_label()" class="on" @click="power_on" title="ON" v-html="$options.filters.p_on(act.on,'${c_action.id}')"></span>`);
        let powerOff = $(`<span role="button" :aria-label="off_label()" class="off" @click="power_off" title="OFF" v-html="$options.filters.p_off(act.on,'${c_action.id}')"></span>`);
        parent.append(powerOn);
        parent.append(powerOff);
    }
    if (c_action['count']){
        let count = c_action.count();
        if (count > 1){
            element.append($(`<span class="count">${count}</span>`));
        }
    }
    else if (action !== 'tech' && global[action] && global[action][type] && global[action][type].count >= 0){
        element.append($('<span class="count">{{ act.count }}</span>'));
    }
    else if (action === 'blood' && global[action] && global[action][c_action.grant[0]] && global[action][c_action.grant[0]] > 0 && c_action.grant[1] === '*'){
        element.append($(`<span class="count"> ${global[action][c_action.grant[0]]} </span>`));
    }
    if (action !== 'tech' && global[action] && global[action][type] && typeof(global[action][type]['repair']) !== 'undefined'){
        element.append($(`<div class="repair"><progress class="progress" :value="repair()" :max="repairMax()"></progress></div>`));
    }
    if (old){
        $('#oldTech').append(parent);
    }
    else {
        $('#'+tab).append(parent);
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

    let modal = {
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
                if ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/ && global.settings.touch) ? true : false){
                    return;
                }
                else {
                    runAction(c_action,action,type);
                }
            },
            describe(){
                srSpeak(srDesc(c_action,old));
            },
            trigModal(){
                if (c_action['sAction'] && typeof c_action['sAction'] === 'function'){
                    c_action.sAction()
                }
                else {
                    this.$buefy.modal.open({
                        parent: this,
                        component: modal
                    });

                    let checkExist = setInterval(function(){
                        if ($('#modalBox').length > 0) {
                            clearInterval(checkExist);
                            drawModal(c_action,type);
                        }
                    }, 50);
                }
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
                    setTimeout(function(){
                        c_action.postPower(true);
                    }, 250);
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
                    setTimeout(function(){
                        c_action.postPower(false);
                    }, 250);
                }
            },
            repair(){
                return global[action][type].repair;
            },
            repairMax(){
                return c_action.repair();
            }
        },
        filters: {
            p_off(p,id){
                let value = global[action][type].count - p;
                if (id === 'city-casino' || id === 'space-spc_casino'){
                    let egg = easterEgg(5,12);
                    if (value === 0 && egg.length > 0){
                        return egg;
                    }
                }
                return value;
            },
            p_on(p,id){
                if (id === 'city-biolab'){
                    let egg = easterEgg(12,12);
                    if (p === 0 && egg.length > 0){
                        return egg;
                    }
                }
                else if (id === 'city-garrison' || id === 'space-space_barracks'){
                    let trick = trickOrTreat(1,14,true);
                    let num = id === 'city-garrison' ? 13 : 0;
                    if (p === num && trick.length > 0){
                        return trick;
                    }
                }
                return p;
            },
            title(t){
                return t;
            }
        }
    });

    popover(id,function(){ return undefined; },{
        in: function(obj){
            actionDesc(obj.popper,c_action,global[action][type],old,action,type);
        },
        out: function(){
            vBind({el: `#popTimer`},'destroy');
        },
        attach: action === 'starDock' ? 'body .modal' : '#main',
        wide: c_action['wide']
    });
}

function runAction(c_action,action,type){
    if (c_action.id === 'spcdock-launch_ship'){
        c_action.action();
    }
    else {
        switch (action){
            case 'tech':
                if (!(global.settings.qKey && keyMap.q) && c_action.action()){
                    gainTech(type);
                    if (c_action['post']){
                        setTimeout(function(){
                            c_action.post();
                        }, 250);
                    }
                }
                else {
                    if (!(c_action['no_queue'] && c_action['no_queue']()) && global.tech['r_queue']){
                        if (global.r_queue.queue.length < global.r_queue.max){
                            let queued = false;
                            for (let tech in global.r_queue.queue){
                                if (global.r_queue.queue[tech].id === c_action.id){
                                    queued = true;
                                    break;
                                }
                            }
                            if (!queued){
                                global.r_queue.queue.push({ id: c_action.id, action: action, type: type, label: typeof c_action.title === 'string' ? c_action.title : c_action.title(), cna: false, time: 0 });
                                resQueue();
                            }
                        }
                    }
                }
                break;
            case 'genes':
            case 'blood':
                if (c_action.action()){
                    if (action === 'genes'){
                        gainGene(type);
                    }
                    else {
                        gainBlood(type);
                    }
                    if (c_action['post']){
                        setTimeout(function(){
                            c_action.post();
                        }, 250);
                    }
                }
                break;
            default:
                {
                    let keyMult = keyMultiplier();
                    if (c_action['grant']){
                        keyMult = 1;
                    }
                    let grant = false;
                    let add_queue = false;
                    let no_queue = (action === 'evolution' && !c_action['queueable']) || (c_action['no_queue'] && c_action['no_queue']()) ? true : false;
                    let loopNum = global.settings.qKey && keyMap.q ? 1 : keyMult;
                    for (let i=0; i<loopNum; i++){
                        let res = false;
                        if ((global.settings.qKey && keyMap.q) || (!(res = c_action.action(1)))){
                            if (res !== 0 && !no_queue && global.tech['queue'] && (keyMult === 1 || (global.settings.qKey && keyMap.q))){
                                let max_queue = global.tech['queue'] >= 2 ? (global.tech['queue'] >= 3 ? 8 : 5) : 3;
                                if (global.stats.feat['journeyman'] && global.stats.feat['journeyman'] >= 2){
                                    max_queue += global.stats.feat['journeyman'] >= 4 ? 2 : 1;
                                }
                                if (global.genes['queue'] && global.genes['queue'] >= 2){
                                    max_queue *= 2;
                                }
                                let pragVal = govActive('pragmatist',0);
                                if (pragVal){
                                    max_queue = Math.round(max_queue * (1 + (pragVal / 100)));
                                }
                                let used = 0;
                                for (let j=0; j<global.queue.queue.length; j++){
                                    used += Math.ceil(global.queue.queue[j].q / global.queue.queue[j].qs);
                                }
                                if (used < global.queue.max){
                                    let repeat = global.settings.qKey ? keyMult : 1;
                                    if (repeat > global.queue.max - used){
                                        repeat = global.queue.max - used;
                                    }
                                    let q_size = c_action['queue_size'] ? c_action['queue_size'] : 1;
                                    if (global.settings.q_merge !== 'merge_never'){
                                        if (global.queue.queue.length > 0 && global.queue.queue[global.queue.queue.length-1].id === c_action.id){
                                            global.queue.queue[global.queue.queue.length-1].q += q_size * repeat;
                                        }
                                        else {
                                            global.queue.queue.push({ id: c_action.id, action: action, type: type, label: typeof c_action.title === 'string' ? c_action.title : c_action.title(), cna: false, time: 0, q: q_size * repeat, qs: q_size, t_max: 0 });
                                        }
                                    }
                                    else {
                                        for (let k=0; k<repeat; k++){
                                            global.queue.queue.push({ id: c_action.id, action: action, type: type, label: typeof c_action.title === 'string' ? c_action.title : c_action.title(), cna: false, time: 0, q: q_size, qs: q_size, t_max: 0 });
                                        }
                                    }
                                    add_queue = true;
                                }
                            }
                            break;
                        }
                        else if (!(global.settings.qKey && keyMap.q)){
                            if (global.race['inflation'] && global.tech['primitive']){
                                if (!c_action.hasOwnProperty('inflation') || c_action.inflation){
                                    global.race.inflation++;
                                }
                            }
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
                        renderSpace();
                        renderFortress();
                    }
                    else if (c_action['refresh']){
                        removeAction(c_action.id);
                        drawCity();
                        drawTech();
                        renderSpace();
                        renderFortress();
                    }
                    if (c_action['post']){
                        setTimeout(function(){
                            c_action.post();
                        }, 250);
                    }
                    updateDesc(c_action,action,type);
                    if (add_queue){
                        buildQueue();
                    }
                    break;
                }
        }
    }
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
    switch (Math.floor(Math.seededRandom(0,16))){
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
        case 7:
            trait = 'elliptical';
            break;
        case 8:
            trait = 'flare';
            break;
        case 9:
            trait = 'dense';
            break;
        case 10:
            trait = 'unstable';
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
    if (biome === 'eden'){
        top += 5;
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
            orbit = Math.floor(Math.seededRandom(200,trait === 'elliptical' ? 800 : 600));
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
        clearElement($('#evolution'));
        clearPopper();
        addAction('evolution','rna');
    });

    popover(id,function(obj){
        obj.popper.append($(`<div>${loc('set_planet',[title,biomes[biome].label,orbit])}</div>`));
        obj.popper.append($(`<div>${biomes[biome].desc}</div>`));
        if (trait !== 'none'){
            obj.popper.append($(`<div>${planetTraits[trait].desc}</div>`));
        }

        let good = $('<div></div>');
        let bad = $('<div></div>');
        let goodCnt = 0;
        let badCnt = 0;
        let numShow = global.stats.achieve['miners_dream'] ? global.stats.achieve['miners_dream'].l >= 4 ? global.stats.achieve['miners_dream'].l * 2 - 3 : global.stats.achieve['miners_dream'].l : 0;
        for (let key in geology){
            if (key !== 0){
                if (geology[key] > 0) {
                    goodCnt++;
                    if (goodCnt === 1) {
                        good.append($(`<div>${loc('set_planet_extra_rich')}</div>`));
                    }
                    let res_val = `<div class="has-text-advanced">${loc(`resource_${key}_name`)}`;
                    if (numShow > 0) {
                        res_val += `: <span class="has-text-success">+${Math.round((geology[key] + 1) * 100 - 100)}%</span>`;
                        numShow--;
                    }
                    res_val += `</div>`;
                    good.append(res_val);
                }
                else if (geology[key] < 0){
                    badCnt++;
                    if (badCnt === 1) {
                        bad.append($(`<div>${loc('set_planet_extra_poor')}</div>`));
                    }
                    let res_val = `<div class="has-text-caution">${loc(`resource_${key}_name`)}`;
                    if (numShow > 0) {
                        res_val += `: <span class="has-text-danger">${Math.round((geology[key] + 1) * 100 - 100)}%</span>`;
                        numShow--;
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
            obj.popper.append(good);
        }
        return undefined;
    },{
        classes: `has-background-light has-text-dark`
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
        let type = c_action.id.split('-')[0];
        var costs = type !== 'genes' && type !== 'blood' ? adjustCosts(c_action) : c_action.cost;
        Object.keys(costs).forEach(function (res){
            if (res === 'Custom'){
                let custom = costs[res]();
                desc = desc + custom.label;
            }
            else if (res === 'Structs'){
                let structs = costs[res]();
                Object.keys(structs).forEach(function (region){
                    Object.keys(structs[region]).forEach(function (struct){
                        let label = '';
                        if (structs[region][struct].hasOwnProperty('s')){
                            let sector = structs[region][struct].s;
                            label = typeof actions[region][sector][struct].title === 'string' ? actions[region][sector][struct].title : actions[region][sector][struct].title();
                        }
                        else {
                            label = typeof actions[region][struct].title === 'string' ? actions[region][struct].title : actions[region][struct].title();
                        }
                        desc = desc + `${label}. `;

                        if (!global[region][struct]){
                            desc = desc + `${loc('insufficient')} ${label}. `;
                        }
                        else if (structs[region][struct].count > global[region][struct].count){
                            desc = desc + `${loc('insufficient')} ${label}. `;
                        }
                        else if (structs[region][struct].hasOwnProperty('on') && structs[region][struct].on > global[region][struct].on){
                            desc = desc + `${loc('insufficient')} ${label} enabled. `;
                        }
                    });
                });
            }
            else if (res === 'Plasmid' || res === 'Phage' || res === 'Dark' || res === 'Harmony'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                        res = 'AntiPlasmid';
                    }
                    let label = loc(`resource_${res}_name`);
                    desc = desc + `${label}: ${res_cost}. `;
                    if ((res === 'AntiPlasmid' ? global.race['Plasmid'].anti : global.race[res].count) < res_cost){
                        desc = desc + `${loc('insufficient')} ${label}. `;
                    }
                }
            }
            else if (res === 'Supply'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    let label = loc(`resource_${res}_name`);
                    desc = desc + `${label}: ${res_cost}. `;
                    if (global.portal.purifier.supply < res_cost){
                        desc = desc + `${loc('insufficient')} ${label}. `;
                    }
                }
            }
            else if (res !== 'Morale' && res !== 'Army' && res !== 'Bool'){
                let res_cost = costs[res]();
                let f_res = res === 'Species' ? global.race.species : res;
                if (res_cost > 0){
                    let label = f_res === 'Money' ? '$' : global.resource[f_res].name+': ';
                    label = label.replace("_", " ");

                    let display_cost = sizeApproximation(res_cost,1);
                    desc = desc + `${label}${display_cost}. `;
                    if (global.resource[f_res].amount < res_cost){
                        desc = desc + `${loc('insufficient')} ${global.resource[f_res].name}. `;
                    }
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

export function actionDesc(parent,c_action,obj,old,action,a_type){
    clearElement(parent);
    var desc = typeof c_action.desc === 'string' ? c_action.desc : c_action.desc();

    let touch = false;
    if (action && a_type && 'ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/) && global.settings.touch ? true : false){
        touch = $(`<a id="touchButton" class="button is-dark touchButton">${c_action.hasOwnProperty('touchlabel') ? c_action.touchlabel : loc('construct')}</a>`);
        parent.append(touch);

        $('#touchButton').on('touchstart', function(){
            runAction(c_action,action,a_type);
        });
    }

    parent.append($(`<div>${desc}</div>`));

    let type = c_action.id.split('-')[0];
    if (c_action['category'] && type === 'tech' && !old){
        parent.append($(`<div class="has-text-flair">${loc('tech_dist_category')}: ${loc(`tech_dist_${c_action.category}`)}</div>`));
    }

    let tc = timeCheck(c_action,false,true);
    if (c_action.cost && !old){
        let empty = true;
        var cost = $('<div class="costList"></div>');

        var costs = type !== 'genes' && type !== 'blood' ? adjustCosts(c_action) : c_action.cost;
        Object.keys(costs).forEach(function (res){
            if (res === 'Custom'){
                let custom = costs[res]();
                cost.append($(`<div>${custom.label}</div>`));
                empty = false;
            }
            else if (res === 'Structs'){
                let structs = costs[res]();
                Object.keys(structs).forEach(function (region){
                    Object.keys(structs[region]).forEach(function (struct){
                        let res_cost = structs[region][struct].hasOwnProperty('on') ? structs[region][struct].on : structs[region][struct].count;
                        let color = 'has-text-dark';
                        if (!global[region][struct]){
                            color = 'has-text-danger';
                        }
                        else if (structs[region][struct].count > global[region][struct].count){
                            color = 'has-text-danger';
                        }
                        else if (structs[region][struct].hasOwnProperty('on') && structs[region][struct].on > global[region][struct].on){
                            color = 'has-text-alert';
                        }

                        let label = '';
                        if (structs[region][struct].hasOwnProperty('s')){
                            let sector = structs[region][struct].s;
                            label = typeof actions[region][sector][struct].title === 'string' ? actions[region][sector][struct].title : actions[region][sector][struct].title();
                        }
                        else {
                            label = typeof actions[region][struct].title === 'string' ? actions[region][struct].title : actions[region][struct].title();
                        }
                        empty = false;
                        cost.append($(`<div class="${color}">${label}: ${res_cost}</div>`));
                    });
                });
            }
            else if (res === 'Plasmid' || res === 'Phage' || res === 'Dark' || res === 'Harmony'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                        res = 'AntiPlasmid';
                    }
                    let label = loc(`resource_${res}_name`);
                    let color = 'has-text-dark';
                    if ((res === 'AntiPlasmid' ? global.race['Plasmid'].anti : global.race[res].count) < res_cost){
                        color = 'has-text-danger';
                    }
                    empty = false;
                    cost.append($(`<div class="${color} res-${res}" data-${res}="${res_cost}">${label}: ${res_cost}</div>`));
                }
            }
            else if (res === 'Supply'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    let label = loc(`resource_${res}_name`);
                    let color = 'has-text-dark';
                    if (global.portal.purifier.supply < res_cost){
                        color = 'has-text-danger';
                    }
                    empty = false;
                    cost.append($(`<div class="${color} res-${res}" data-${res}="${res_cost}">${label}: ${res_cost}</div>`));
                }
            }
            else if (res !== 'Morale' && res !== 'Army' && res !== 'Bool'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    if (res === 'HellArmy'){
                        let label = loc('fortress_troops');
                        let color = 'has-text-dark';
                        if (global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size) < res_cost){
                            color = tc.r === res ? 'has-text-danger' : 'has-text-alert';
                        }
                        empty = false;
                        cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}: ${res_cost}</div>`));
                    }
                    else {
                        let f_res = res === 'Species' ? global.race.species : res;
                        let label = f_res === 'Money' ? '$' : global.resource[f_res].name+': ';
                        label = label.replace("_", " ");
                        let color = 'has-text-dark';
                        if (global.resource[f_res].amount < res_cost){
                            color = tc.r === f_res ? 'has-text-danger' : 'has-text-alert';
                        }
                        let display_cost = sizeApproximation(res_cost,1);
                        empty = false;
                        cost.append($(`<div class="${color} res-${res}" data-${f_res}="${res_cost}">${label}${display_cost}</div>`));
                    }
                }
            }
        });
        if (!empty){
            parent.append(cost);
        }
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
    if (!old && c_action.id.substring(0,5) !== 'blood' && !checkAffordable(c_action) && checkAffordable(c_action,true)){
        if (typeof obj === 'string' && obj === 'notimer'){
            return;
        }
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
    if (c_action.id === 'portal-spire' || (c_action.id === 'portal-waygate' && global.tech.waygate >= 2)){
        if (obj && obj['time']){
            parent.append($(`<div id="popTimer" class="flair has-text-advanced">{{ time | timer }}</div>`));
            vBind({
                el: '#popTimer',
                data: obj,
                filters: {
                    timer(t){
                        let time = !c_action.hasOwnProperty('mscan') || (c_action.hasOwnProperty('mscan') && c_action.mscan() > 0) ? t : '???';
                        return loc('floor_clearing',[time]);
                    }
                }
            });
        }
    }
}

export function removeAction(id){
    clearElement($(`#${id}`),true);
    clearPopper(id);
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
    if ($('#popper').data('id') === id){
        actionDesc($('#popper'),c_action,global[category][action],false,category,action);
    }
}

export function payCosts(c_action, costs){
    costs = costs || adjustCosts(c_action);
    if (checkCosts(costs)){
        Object.keys(costs).forEach(function (res){
            if (res === 'Plasmid' || res === 'Phage' || res === 'Dark' || res === 'Harmony'){
                let cost = costs[res]();
                if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                    global.race.Plasmid.anti -= cost;
                }
                else {
                    global.race[res].count -= cost;
                }
            }
            else if (res === 'Supply'){
                let cost = costs[res]();
                global.portal.purifier.supply -= cost;
            }
            else if (res !== 'Morale' && res !== 'Army' && res !== 'HellArmy' && res !== 'Structs' && res !== 'Bool' && res !== 'Custom'){
                let cost = costs[res]();
                let f_res = res === 'Species' ? global.race.species : res;
                global['resource'][f_res].amount -= cost;
                if (f_res === 'Knowledge'){
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
            return checkMaxCosts(adjustCosts(c_action));
        }
        else {
            return checkCosts(adjustCosts(c_action));
        }
    }
    return true;
}

function checkMaxCosts(costs){
    var test = true;
    Object.keys(costs).forEach(function (res){
        if (res === 'Custom'){
            // Do Nothing
        }
        else if (res === 'Structs'){
            if (!checkStructs(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Plasmid' || res === 'Phage' || res === 'Dark' || res === 'Harmony'){
            if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                if (global.race.Plasmid.anti < Number(costs[res]())){
                    test = false;
                    return;
                }
            }
            else if (global.race[res].count < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Bool'){
            if (!costs[res]()){
                test = false;
                return;
            }
        }
        else if (res === 'Morale'){
            if (global.city.morale.current < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Army'){
            if (armyRating(global.civic.garrison.raid,'army') < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'HellArmy'){
            if (typeof global.portal['fortress'] === 'undefined' || global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size) < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Supply'){
            if (global.portal.purifier.sup_max < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else {
            var testCost = Number(costs[res]()) || 0;
            let f_res = res === 'Species' ? global.race.species : res;
            if ((!global.resource[f_res].display && testCost > 0) || (global.resource[f_res].max >= 0 && testCost > Number(global.resource[f_res].max) && Number(global.resource[f_res].max) !== -1)){
                test = false;
                return;
            }
        }
    });
    return test;
}

export function checkCosts(costs){
    var test = true;
    Object.keys(costs).forEach(function (res){
        if (res === 'Custom'){
            let custom = costs[res]();
            if (!custom.met){
                test = false;
                return;
            }
        }
        else if (res === 'Structs'){
            if (!checkStructs(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Plasmid' || res === 'Phage' || res === 'Dark' || res === 'Harmony'){
            if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                if (global.race.Plasmid.anti < Number(costs[res]())){
                    test = false;
                    return;
                }
            }
            else if (global.race[res].count < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Bool'){
            if (!costs[res]()){
                test = false;
                return;
            }
        }
        else if (res === 'Morale'){
            if (global.city.morale.current < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Army'){
            if (armyRating(global.civic.garrison.raid,'army') < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'HellArmy'){
            if (typeof global.portal['fortress'] === 'undefined' || global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size) < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Supply'){
            if (global.portal.purifier.supply < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else {
            var testCost = Number(costs[res]()) || 0;
            if (testCost === 0){
                return;
            }
            let f_res = res === 'Species' ? global.race.species : res;
            let fail_max = global.resource[f_res].max >= 0 && testCost > global.resource[f_res].max ? true : false;
            if (testCost > Number(global.resource[f_res].amount) + global.resource[f_res].diff || fail_max){
                test = false;
                return;
            }
        }
    });
    return test;
}

function checkStructs(structs){
    let test = true;
    Object.keys(structs).forEach(function (region){
        if (global.hasOwnProperty(region)){
            Object.keys(structs[region]).forEach(function (struct){
                if (global[region].hasOwnProperty(struct)){
                    if (global[region][struct].count < structs[region][struct].count){
                        test = false;
                        return;
                    }
                    if (global[region][struct].hasOwnProperty('on') && global[region][struct].on < structs[region][struct].on){
                        test = false;
                        return;
                    }
                }
                else {
                    test = false;
                    return;
                }
            });
        }
        else {
            test = false;
            return;
        }
    });
    return test;
}

function dirt_adjust(creep){
    let dirtVal = govActive('dirty_jobs',0);
    if (dirtVal){
        creep -= dirtVal;
    }
    return creep;
}

function challengeGeneHeader(){
    let challenge = $(`<div class="challenge"></div>`);
    $('#evolution').append(challenge);
    challenge.append($(`<div class="divider has-text-warning"><h2 class="has-text-danger">${loc('evo_challenge_genes')}</h2></div>`));
    challenge.append($(`<div class="has-text-advanced">${loc('evo_challenge_genes_desc')}</div>`));
    if (global.genes['challenge'] && global.genes['challenge'] >= 2){
        challenge.append($(`<div class="has-text-advanced">${loc('evo_challenge_genes_mastery')}</div>`));
    }
}

function challengeActionHeader(){
    let challenge = $(`<div class="challenge"></div>`);
    $('#evolution').append(challenge);
    challenge.append($(`<div class="divider has-text-warning"><h2 class="has-text-danger">${loc('evo_challenge_run')}</h2></div>`));
    challenge.append($(`<div class="has-text-advanced">${loc('evo_challenge_run_desc')}</div>`));
}

function scenarioActionHeader(){
    let challenge = $(`<div class="challenge"></div>`);
    $('#evolution').append(challenge);
    challenge.append($(`<div class="divider has-text-warning"><h2 class="has-text-danger">${loc('evo_scenario')}</h2></div>`));
    challenge.append($(`<div class="has-text-advanced">${loc('evo_scenario_desc')}</div>`));
}

function drawModal(c_action,type){
    if (type === 'red_factory' || type === 'int_factory'){
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
        case 'hell_smelter':
            smelterModal(body);
            break;
        case 'stellar_forge':
            smelterModal(body);
            break;
        case 'hell_forge':
            smelterModal(body);
            break;
        case 'geothermal':
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
        case 'freighter':
            freighterModal(body);
            break;
        case 'pylon':
            pylonModal(body);
            break;
        case 'rock_quarry':
            quarryModal(body);
            break;
        case 'titan_mine':
            titanModal(body);
            break;
        case 'nanite_factory':
            naniteModal(body);
            break;
    }
}

function freighterModal(modal){
    galacticTrade(modal);
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

function pylonModal(modal){
    loadIndustry('pylon',modal);
}

function quarryModal(modal){
    loadIndustry('rock_quarry',modal);
}

function titanModal(modal){
    loadIndustry('titan_mine',modal);
}

function naniteModal(modal){
    loadIndustry('nanite_factory',modal);
}

export function evoProgress(){
    clearElement($('#evolution .evolving'),true);
    let progress = $(`<div class="evolving"><progress class="progress" value="${global.evolution.final}" max="100">${global.evolution.final}%</progress></div>`);
    $('#evolution').append(progress);
}

export function wardenLabel(){
    if (global.race.universe === 'magic'){
        return loc('city_wizard_tower_title');
    }
    else {
        return global.race['evil'] ? loc('city_babel_title') : loc('city_wardenclyffe');
    }
}

function basicHousingLabel(){
    switch (global.race.species){
        case 'orc':
            return loc('city_basic_housing_orc_title');
        case 'wolven':
            return loc('city_basic_housing_wolven_title');
        case 'cacti':
            return loc('city_basic_housing_entish_title');
        case 'entish':
            return loc('city_basic_housing_entish_title');
        case 'pinguicula':
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

function largeHousingLabel(basic){
    if (!basic && govActive('extravagant',0)){
        return loc(`city_mansion`);
    }
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

export function housingLabel(type,flag){
    switch (type){
        case 'small':
            return basicHousingLabel();
        case 'medium':
            return mediumHousingLabel();
        case 'large':
            return largeHousingLabel(flag);
    }
}

export function updateQueueNames(both, items){
    if (global.tech['queue'] && global.queue.display){
        let deepScan = ['space','interstellar','galaxy','portal'];
        for (let i=0; i<global.queue.queue.length; i++){
            let currItem = global.queue.queue[i];
            if (!items || items.indexOf(currItem.id) > -1){
                if (deepScan.includes(currItem.action)){
                    let scan = true; Object.keys(actions[currItem.action]).forEach(function (region){
                        if (actions[currItem.action][region][currItem.type] && scan){
                            global.queue.queue[i].label = 
                                typeof actions[currItem.action][region][currItem.type].title === 'string' ? 
                                actions[currItem.action][region][currItem.type].title : 
                                actions[currItem.action][region][currItem.type].title();
                            scan = false;
                        }
                    });
                }
                else {
                    global.queue.queue[i].label = 
                        typeof actions[currItem.action][currItem.type].title === 'string' ? 
                        actions[currItem.action][currItem.type].title : 
                        actions[currItem.action][currItem.type].title();
                }
            }
        }
    }
    if (both && global.tech['r_queue'] && global.r_queue.display){
        for (let i=0; i<global.r_queue.queue.length; i++){
            global.r_queue.queue[i].label = 
                typeof actions.tech[global.r_queue.queue[i].type].title === 'string' ? 
                actions.tech[global.r_queue.queue[i].type].title : 
                actions.tech[global.r_queue.queue[i].type].title();
        }
    }
}

function sentience(){
    if (global.resource.hasOwnProperty('RNA')){
        global.resource.RNA.display = false;
    }
    if (global.resource.hasOwnProperty('DNA')){
        global.resource.DNA.display = false;
    }

    if (global.race.species !== 'junker'){
        delete global.race['junker'];
    }
    else {
        setJType();
    }

    var evolve_actions = ['rna','dna','membrane','organelles','nucleus','eukaryotic_cell','mitochondria'];
    for (var i = 0; i < evolve_actions.length; i++) {
        if (global.race[evolve_actions[i]]){
            clearElement($('#'+actions.evolution[evolve_actions[i]].id),true);
            clearPopper(actions.evolution[evolve_actions[i]].id);
        }
    }

    Object.keys(genus_traits[races[global.race.species].type]).forEach(function (trait) {
        global.race[trait] = genus_traits[races[global.race.species].type][trait];
    });
    Object.keys(races[global.race.species].traits).forEach(function (trait) {
        global.race[trait] = races[global.race.species].traits[trait];
    });

    if (global.race['imitation'] && global.race['srace']){
        setImitation(false);
    }

    const date = new Date();
    if (!global.settings.boring && date.getMonth() === 11 && date.getDate() >= 17){
        if (global.race.species === 'elven'){
            setTraitRank('slaver',{ set: 2 });
            setTraitRank('resourceful',{ set: 0.5 });
            setTraitRank('small',{ set: 0.25 });
        }
        else if (global.race.species === 'capybara'){
            setTraitRank('beast_of_burden',{ set: 1 });
            setTraitRank('pack_rat',{ set: 0.5 });
            setTraitRank('musical',{ set: 0.25 });
        }
        else if (global.race.species === 'centaur'){
            setTraitRank('beast_of_burden',{ set: 1 });
            setTraitRank('curious',{ set: 0.5 });
            setTraitRank('blissful',{ set: 0.25 });
        }
        else if (global.race.species === 'wendigo'){
            setTraitRank('immoral',{ set: 3 });
            setTraitRank('cannibalize',{ set: 0.5 });
            setTraitRank('claws',{ set: 0.25 });
        }
        else if (global.race.species === 'yeti'){
            setTraitRank('scavenger',{ set: 3 });
            setTraitRank('regenerative',{ set: 0.5 });
            setTraitRank('musical',{ set: 0.25 });
        }
        else if (global.race.species === 'entish'){
            setTraitRank('photosynth',{ set: 3 });
            setTraitRank('optimistic',{ set: 0.5 });
            setTraitRank('armored',{ set: 0.25 });
        }
    }

    const easter = eventActive('easter');
    if (global.race.species === 'wolven' && easter.active){
        global.race['hyper'] = 1;
        global.race['fast_growth'] = 1;
        global.race['rainbow'] = 1;
        global.race['optimistic'] = 1;
    }

    if (global.race['no_crispr'] || global.race['badgenes']){
        let repeat = global.race['badgenes'] ? 3 : 1;
        for (let j=0; j<repeat; j++){
            for (let i=0; i<10; i++){
                let trait = neg_roll_traits[Math.rand(0,neg_roll_traits.length)];
                if (global.race[trait]){
                    if (global.race[trait] == 0.25){
                        continue;
                    }
                    setTraitRank(trait,{down:true});
                    if (j === 0 && global.race['badgenes']){
                        setTraitRank(trait,{down:true});
                    }
                    break;
                }
                else if ((global.race['smart'] && trait === 'dumb')) {
                    continue;
                }
                if (!global.race[trait]){
                    let rank = 1;
                    if (global.race['badgenes']){
                        rank = j === 0 ? 0.5 : 2;
                    }
                    global.race[trait] = rank;
                    break;
                }
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

    clearElement($('#resources'));
    defineResources();
    if (!global.race['kindling_kindred'] && !global.race['smoldering']){
        global.resource.Lumber.display = true;
    }
    else {
        global.resource.Stone.display = true;
    }
    registerTech('club');

    global.city.calendar.day = 0;

    var city_actions = global.race['kindling_kindred'] || global.race['smoldering'] ? ['food','stone'] : ['food','lumber','stone'];
    if (global.race['smoldering']){
        city_actions.push('chrysotile');
    }
    if (global.race['evil'] && !global.race['kindling_kindred'] && !global.race['smoldering']){
        global.city['slaughter'] = 1;
        city_actions = ['slaughter'];
    }
    for (var i = 0; i < city_actions.length; i++) {
        if (global.city[city_actions[i]]){
            addAction('city',city_actions[i]);
        }
    }

    if (global.race.species === 'custom'){
        global.race['untapped'] = calcGenomeScore({
            name: global.custom.race0.name,
            desc: global.custom.race0.desc,
            entity: global.custom.race0.entity,
            home: global.custom.race0.home,
            red: global.custom.race0.red,
            hell: global.custom.race0.hell,
            gas: global.custom.race0.gas,
            gas_moon: global.custom.race0.gas_moon,
            dwarf: global.custom.race0.dwarf,
            genes: 0,
            genus: global.custom.race0.genus,
            traitlist: global.custom.race0.traits
        });
    }

    global.settings.civTabs = 1;
    global.settings.showEvolve = false;
    global.settings.showCiv = true;
    global.settings.showCity = true;

    global.civic.govern.type = 'anarchy';
    global.civic.govern.rev = 0;
    global.civic.govern.fr = 0;
    
    if (global.genes['queue']){
        global.tech['queue'] = 1;
        global.tech['r_queue'] = 1;
        global.queue.display = true;
        global.r_queue.display = true;
        if (!global.settings.msgFilters.queue.unlocked){
            global.settings.msgFilters.queue.unlocked = true;
            global.settings.msgFilters.queue.vis = true;
        }
        if (!global.settings.msgFilters.building_queue.unlocked){
            global.settings.msgFilters.building_queue.unlocked = true;
            global.settings.msgFilters.building_queue.vis = true;
            global.settings.msgFilters.research_queue.unlocked = true;
            global.settings.msgFilters.research_queue.vis = true;
        }
    }

    Object.keys(global.genes.minor).forEach(function (trait){
        global.race[trait] = trait === 'mastery' ? global.genes.minor[trait] : global.genes.minor[trait] * 2;
    });
    
    let tempMTOrder = [];
    global.settings.mtorder.forEach(function(trait){
       if (global.genes.minor[trait] || trait === 'mastery'){
           tempMTOrder.push(trait);
       }
    });
    global.settings.mtorder = tempMTOrder;

    if (global.genes['evolve'] && global.genes['evolve'] >= 2){
        for (let i=1; i<8; i++){
            if (global.genes['evolve'] >= i+1){
                randomMinorTrait(i);
            }
        }
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

    if (global.race['truepath']){
        global.civic.foreign.gov0.mil = Math.round(global.civic.foreign.gov0.mil * 1.5);
        global.civic.foreign.gov1.mil = Math.round(global.civic.foreign.gov1.mil * 1.4);
        global.civic.foreign.gov2.mil = Math.round(global.civic.foreign.gov2.mil * 1.25);
    
        global.civic.foreign['gov3'] = {
            unrest: 0,
            hstl: Math.floor(Math.seededRandom(20,40)),
            mil: Math.floor(Math.seededRandom(650,750)),
            eco: Math.floor(Math.seededRandom(250,300)),
            spy: 0,
            esp: 0,
            trn: 0,
            sab: 0,
            act: 'none'
        };

        let civAltName = genCivName(true);
        global.civic.foreign.gov3['name'] = {
            s0: civAltName.s0,
            s1: civAltName.s1
        };

        global.civic.foreign['gov4'] = {
            unrest: 0,
            hstl: 100,
            mil: 300,
            eco: 100,
            spy: 0,
            esp: 0,
            trn: 0,
            sab: 0,
            act: 'none'
        };

        let civAltName2 = genCivName(true);
        while (civAltName2.s1 === civAltName.s1){
            civAltName2 = genCivName(true);
        }
        global.civic.foreign.gov4['name'] = {
            s0: 99,
            s1: civAltName2.s1
        };
    }

    if (global.race['cataclysm']){
        messageQueue(loc('cataclysm_sentience',[races[global.race.species].home,flib('name')]),'info',false,['progress']);
    }
    else {
        messageQueue(loc('sentience',[loc('genelab_genus_' + races[global.race.species].type),races[global.race.species].entity,flib('name')]),'info',false,['progress']);
    }

    if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 1){
        global.resource.Steel.display = true;
        global.resource.Steel.amount = 25;
        if (global.stats.achieve.technophobe.l >= 3){
            if (!global.race['truepath']){
                global.resource.Soul_Gem.display = true;
            }
            let gems = 1;
            for (let i=1; i<universe_affixes.length; i++){
                if (global.stats.achieve.technophobe[universe_affixes[i]] && global.stats.achieve.technophobe[universe_affixes[i]] >= 5){
                    gems++;
                }
            }
            global.resource.Soul_Gem.amount = gems;
        }
    }

    if (global.race.species === 'tortoisan'){
        let color = Math.floor(Math.seededRandom(100));
        if (color === 99){
            global.race['shell_color'] = 'rainbow';
        }
        else if (color >= 97 && color <= 98){
            global.race['shell_color'] = 'white';
        }
        else if (color >= 93 && color <= 96){
            global.race['shell_color'] = 'red';
        }
        else if (color >= 89 && color <= 92){
            global.race['shell_color'] = 'orange';
        }
        else if (color >= 85 && color <= 88){
            global.race['shell_color'] = 'yellow';
        }
        else if (color >= 75 && color <= 84){
            global.race['shell_color'] = 'purple';
        }
        else if (color >= 65 && color <= 74){
            global.race['shell_color'] = 'blue';
        }
        else {
            global.race['shell_color'] = 'green';
        }
    }

    if (global.race.species === 'vulpine'){
        let color = Math.floor(Math.seededRandom(100));
        if (color >= 85){
            global.race['fox_color'] = 'white';
        }
        else if (color >= 70 && color <= 84){
            global.race['fox_color'] = 'tan';
        }
        else if (color >= 55 && color <= 69){
            global.race['fox_color'] = 'silver';
        }
        else if (color >= 35 && color <= 54){
            global.race['fox_color'] = 'grey';
        }
        else {
            global.race['fox_color'] = 'red';
        }
    }
    
    calcPillar(true);

    if (global.blood['aware']){
        global.settings.arpa['blood'] = true;
        global.tech['b_stone'] = 2;
    }

    defineJobs(true);
    commisionGarrison();
    defineGovernment(true);

    if (global.race['shapeshifter']){
        shapeShift(false,true);
    }

    if (global.race['carnivore'] || global.race['soul_eater']){
        global.civic.d_job = 'hunter';
        global.civic.hunter.display = true;
    }
    else if (global.race['forager']){
        global.civic.d_job = 'forager';
        global.civic.forager.display = true;
    }
    else {
        global.civic.d_job = 'unemployed';
        global.civic.unemployed.display = true;
    }

    if (global.race['hooved']){
        global.resource.Horseshoe.display = true;
        global.resource.Horseshoe.amount = 5;
        global.race['shoecnt'] = 5;
    }

    if (global.race['deconstructor']){
        global.resource.Nanite.display = true;
        global.city['nanite_factory'] = { count: 1,
            Lumber: 0, Chrysotile: 0, Stone: 0, Crystal: 0, 
            Furs: 0, Copper: 0, Iron: 0, Aluminium: 0,
            Cement: 0, Coal: 0, Oil: 0, Uranium: 0,
            Steel: 0, Titanium: 0, Alloy: 0, Polymer: 0,
            Iridium: 0, Helium_3: 0, Water: 0, Deuterium: 0,
            Neutronium: 0, Adamantite: 0, Bolognium: 0, Orichalcum: 0,
        };
        global.settings.showIndustry = true;
    }

    calc_mastery(true);
    if (global.settings.tabLoad){
        drawCity();
        defineGarrison();
        buildGarrison($('#c_garrison'),false);
        foreignGov();
    }
    else {
        loadTab('mTabCivil');
    }

    if (global.race['truepath']){
        Object.keys(resource_values).forEach(function(res){
            if (global.resource.hasOwnProperty(res)){
                global.resource[res].value = resource_values[res] * 2;
            }
        });
    }

    altRace(global.race.species,true);

    tagEvent('sentience',{
        'species': global.race.species,
        'challenge': alevel() - 1
    });

    if (global.stats.feat['adept'] && global.stats.achieve['whitehole'] && global.stats.achieve.whitehole.l > 0){
        let rank = Math.min(global.stats.achieve.whitehole.l,global.stats.feat['adept']);
        global.resource.Food.amount += rank * 100;
        global.resource.Stone.max += rank * 60;
        global.resource.Stone.amount += rank * 100;
        if (global.race['smoldering']){
            global.resource.Chrysotile.max += rank * 60;
            global.resource.Chrysotile.amount += rank * 100;
        }
        else {
            global.resource.Lumber.max += rank * 60;
            global.resource.Lumber.amount += rank * 100;
        }
    }

    if (global.race['cataclysm']){
        cataclysm();
    }
    else if (global.race['artifical']){
        aiStart();
    }

    if (global.queue.hasOwnProperty('queue')){
        global.queue.queue = [];
    }

    if (global.race['slow'] || global.race['hyper'] || global.race.species === 'junker'){
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        if (webWorker.w){
            webWorker.w.terminate();
        }
        window.location.reload();
    }
}

function aiStart(){
    if (global.race['artifical']){
        global.tech['spy'] = 5;
        global.tech['primitive'] = 3;
        global.tech['currency'] = 6;
        global.tech['govern'] = 3;
        global.tech['boot_camp'] = 1;
        global.tech['medic'] = 1;
        global.tech['military'] = 5;
        global.tech['explosives'] = 3;
        global.tech['trade'] = 3;
        global.tech['banking'] = 6;
        global.tech['home_safe'] = 1;
        global.tech['housing'] = 3;
        global.tech['smelting'] = 3;
        global.tech['copper'] = 1;
        global.tech['storage'] = 5;
        global.tech['container'] = 4;
        global.tech['steel_container'] = 3;
        global.tech['mining'] = 4;
        global.tech['pickaxe'] = 2;
        global.tech['hammer'] = 2;
        global.tech['cement'] = 5;
        global.tech['oil'] = 3;
        global.tech['alumina'] = 1;
        global.tech['titanium'] = 1;
        global.tech['foundry'] = 7;
        global.tech['factory'] = 1;
        global.tech['theatre'] = 3;
        global.tech['broadcast'] = 1;
        global.tech['science'] = 7;
        global.tech['high_tech'] = 4;
        global.tech['theology'] = 2;

        global.settings.showIndustry = true;
        global.settings.showPowerGrid = true;
        global.settings.showResearch = true;
        global.settings.showCivic = true;
        global.settings.showMil = true;
        global.settings.showResources = true;
        global.settings.showMarket = true;
        global.settings.showStorage = true;

        //global.civic.garrison.display = true;
        global.resource[global.race.species].display = true;
        global.resource.Knowledge.display = true;
        global.resource.Money.display = true;
        global.resource.Food.display = true;

        global.resource.Money.amount = 1000;

        global.resource.Stone.display = true;
        global.resource.Furs.display = true;
        global.resource.Copper.display = true;
        global.resource.Iron.display = true;
        global.resource.Aluminium.display = true;
        global.resource.Cement.display = true;
        global.resource.Coal.display = true;
        global.resource.Oil.display = true;
        global.resource.Steel.display = true;
        global.resource.Titanium.display = true;
        global.resource.Brick.display = true;
        global.resource.Wrought_Iron.display = true;
        global.resource.Sheet_Metal.display = true;
        global.resource.Crates.display = true;
        global.resource.Containers.display = true;

        if (!global.race['kindling_kindred'] && !global.race['smoldering']){
            global.tech['axe'] = 3;
            global.tech['saw'] = 2;
            global.resource.Lumber.display = true;
            global.resource.Plywood.display = true;
            global.civic.lumberjack.display = true;
            global.city['lumber_yard'] = { count: 1 };
            global.city['sawmill'] = { count: 0, on: 0 };
        }
        if (global.race['smoldering']){
            global.resource.Chrysotile.display = true;
        }

        global.resource[global.race.species].max = 0;
        global.resource[global.race.species].amount = 0;
        global.resource.Crates.amount = 10;
        global.resource.Containers.amount = 10;

        global.civic.taxes.display = true;

        global.civic.miner.display = true;
        global.civic.coal_miner.display = true;
        global.civic.quarry_worker.display = true;
        global.civic.professor.display = true;
        global.civic.scientist.display = true;
        global.civic.cement_worker.display = true;
        global.civic.banker.display = true;

        global.city.calendar.day++;
        global.city.market.active = true;
        global.city['power'] = 7.5;
        global.city['powered'] = true;

        global.city['factory'] = { count: 0, on: 0, Lux: 0, Furs: 0, Alloy: 0, Polymer: 1, Nano: 0, Stanene: 0 };
        global.city['foundry'] = { count: 0, crafting: 0, Plywood: 0, Brick: 0, Bronze: 0, Wrought_Iron: 0, Sheet_Metal: 0, Mythril: 0, Aerogel: 0, Nanoweave: 0, Scarletite: 0, Quantium: 0  };
        global.city['smelter'] = { count: 1, cap: 0, Wood: 0, Coal: 0, Oil: 1, Star: 0, StarCap: 0, Inferno: 0, Iron: 1, Steel: 0, Iridium: 0 };
        global.city['oil_power'] = { count: 1, on: 1 };
        global.city['coal_power'] = { count: 0, on: 0 };
        global.city['transmitter'] = { count: 1, on: 1 };
        global.city['mine'] = { count: 1, on: 0 };
        global.city['coal_mine'] = { count: 1, on: 0 };
        global.city['oil_well'] = { count: 1 };
        global.city['oil_depot'] = { count: 1 };
        global.city['cement_plant'] = { count: 1, on: 0 };
        global.city['garrison'] = { count: 0, on: 0 };
        global.city['boot_camp'] = { count: 0 };
        global.city['basic_housing'] = { count: 0 };
        global.city['cottage'] = { count: 0 };
        global.city['apartment'] = { count: 0, on: 0 };
        global.city['amphitheatre'] = { count: 0 };
        global.city['rock_quarry'] = { count: 1, on: 0, asbestos: 50 };
        global.city['metal_refinery'] = { count: 1, on: 0 };
        global.city['shed'] = { count: 2 };
        global.city['storage_yard'] = { count: 1 };
        global.city['warehouse'] = { count: 1 };
        global.city['trade'] = { count: 0 };
        global.city['wharf'] = { count: 0 };
        global.city['bank'] = { count: 1 };
        global.city['university'] = { count: 1 };
        global.city['library'] = { count: 1 };
        global.city['wardenclyffe'] = { count: 0, on: 0 };
        global.city['temple'] = { count: 0 };

        if (global.race['calm']){
            global.resource.Zen.display = true;
            global.city['meditation'] = { count: 0 };
        }
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
        if (global.race['magnificent']){
            global.city['shrine'] = {
                count: 0,
                morale: 0,
                metal: 0,
                know: 0,
                tax: 0
            };
        }

        global.civic.govern.type = 'technocracy';
        global.civic['garrison'] = {
            display: true,
            disabled: false,
            progress: 0,
            tactic: 0,
            workers: 0,
            wounded: 0,
            raid: 0,
            max: 0
        };

        drawCity();
        drawTech();
        loadFoundry();
    }
}

function cataclysm(){
    if (global.race['cataclysm']){
        global.tech['unify'] = 2;
        global.tech['spy'] = 5;
        global.tech['primitive'] = 3;
        global.tech['currency'] = 6;
        global.tech['govern'] = 3;
        global.tech['boot_camp'] = 1;
        global.tech['medic'] = 1;
        global.tech['military'] = 5;
        global.tech['marines'] = 1;
        global.tech['explosives'] = 3;
        global.tech['trade'] = 3;
        global.tech['wharf'] = 1;
        global.tech['banking'] = 6;
        global.tech['gambling'] = 1;
        global.tech['home_safe'] = 1;
        global.tech['housing'] = 3;
        global.tech['smelting'] = 3;
        global.tech['copper'] = 1;
        global.tech['storage'] = 5;
        global.tech['container'] = 4;
        global.tech['steel_container'] = 3;
        global.tech['mining'] = 4;
        global.tech['cement'] = 5;
        global.tech['oil'] = 7;
        global.tech['mass'] = 1;
        global.tech['alumina'] = 1;
        global.tech['titanium'] = 2;
        global.tech['polymer'] = 2;
        global.tech['uranium'] = 4;
        global.tech['foundry'] = 7;
        global.tech['factory'] = 1;
        global.tech['theatre'] = 3;
        global.tech['broadcast'] = 2;
        global.tech['mine_conveyor'] = 1;
        global.tech['science'] = 9;
        global.tech['high_tech'] = 7;
        global.tech['genetics'] = 1;
        global.tech['theology'] = 2;
        global.tech['space'] = 6;
        global.tech['solar'] = 3;
        global.tech['luna'] = 2;
        global.tech['hell'] = 1;
        global.tech['mars'] = 5;
        global.tech['gas_giant'] = 1;
        global.tech['gas_moon'] = 2;
        global.tech['asteroid'] = 3;
        global.tech['satellite'] = 1;
        global.tech['space_explore'] = 4;
        global.tech['genesis'] = 2;

        global.settings.showSpace = true;
        global.settings.space.home = true;
        global.settings.space.moon = true;
        global.settings.space.red = true;
        global.settings.space.hell = true;
        global.settings.space.sun = true;
        global.settings.space.gas = true;
        global.settings.space.gas_moon = true;
        global.settings.space.belt = true;
        global.settings.space.dwarf = true;

        global.settings.showCity = false;
        global.settings.showIndustry = true;
        global.settings.showPowerGrid = true;
        global.settings.showResearch = true;
        global.settings.showCivic = true;
        global.settings.showMil = true;
        global.settings.showResources = true;
        global.settings.showMarket = true;
        global.settings.showStorage = true;
        global.settings.civTabs = 1;
        global.settings.spaceTabs = 1;
        global.settings.showGenetics = true;

        //global.civic.garrison.display = true;
        global.resource[global.race.species].display = true;
        global.resource.Knowledge.display = true;
        global.resource.Money.display = true;
        global.resource.Food.display = true;

        global.resource.Stone.display = true;
        global.resource.Furs.display = true;
        global.resource.Copper.display = true;
        global.resource.Iron.display = true;
        global.resource.Aluminium.display = true;
        global.resource.Cement.display = true;
        global.resource.Coal.display = true;
        global.resource.Oil.display = true;
        global.resource.Uranium.display = true;
        global.resource.Steel.display = true;
        global.resource.Titanium.display = true;
        global.resource.Alloy.display = true;
        global.resource.Polymer.display = true;
        global.resource.Iridium.display = true;
        global.resource.Helium_3.display = true;
        global.resource.Brick.display = true;
        global.resource.Wrought_Iron.display = true;
        global.resource.Sheet_Metal.display = true;
        global.resource.Mythril.display = true;
        global.resource.Crates.display = true;
        global.resource.Containers.display = true;

        if (!global.race['kindling_kindred'] && !global.race['smoldering']){
            global.resource.Lumber.display = true;
            global.resource.Plywood.display = true;
            global.resource.Lumber.max = 90000;
            global.resource.Lumber.amount = 90000;
            global.resource.Plywood.amount = 50000;
        }
        if (global.race['smoldering']){
            global.resource.Chrysotile.display = true;
            global.resource.Chrysotile.max = 90000;
            global.resource.Chrysotile.amount = 90000;
        }

        global.resource[global.race.species].max = 8;
        global.resource[global.race.species].amount = 8;
        global.resource.Crates.amount = 20;
        global.resource.Containers.amount = 20;
        global.resource.Money.max = 225000;
        global.resource.Money.amount = 225000;
        global.resource.Food.max = 1000;
        global.resource.Food.amount = 1000;
        global.resource.Oil.max = 1000;
        global.resource.Oil.amount = 1000;
        global.resource.Helium_3.max = 1000;
        global.resource.Helium_3.amount = 1000;
        global.resource.Uranium.max = 1000;
        global.resource.Uranium.amount = 1000;
        global.resource.Stone.max = 90000;
        global.resource.Stone.amount = 90000;
        global.resource.Furs.max = 40000;
        global.resource.Furs.amount = 40000;
        global.resource.Copper.max = 75000;
        global.resource.Copper.amount = 75000;
        global.resource.Iron.max = 75000;
        global.resource.Iron.amount = 75000;
        global.resource.Steel.max = 75000;
        global.resource.Steel.amount = 75000;
        global.resource.Aluminium.max = 75000;
        global.resource.Aluminium.amount = 75000;
        global.resource.Cement.max = 75000;
        global.resource.Cement.amount = 75000;
        global.resource.Titanium.max = 75000;
        global.resource.Titanium.amount = 75000;
        global.resource.Coal.max = 10000;
        global.resource.Coal.amount = 10000;
        global.resource.Alloy.max = 20000;
        global.resource.Alloy.amount = 20000;
        global.resource.Polymer.max = 20000;
        global.resource.Polymer.amount = 20000;
        global.resource.Iridium.max = 1000;
        global.resource.Iridium.amount = 1000;
        global.resource.Brick.amount = 50000;
        global.resource.Wrought_Iron.amount = 50000;
        global.resource.Sheet_Metal.amount = 50000;
        global.resource.Mythril.amount = 8000;

        global.resource.Iridium.crates = 5;
        global.resource.Iridium.containers = 5;

        global.civic.taxes.display = true;

        global.civic.professor.display = true;
        global.civic.scientist.display = true;
        global.civic.cement_worker.display = true;
        global.civic.colonist.display = true;
        global.civic.space_miner.display = true;

        global.civic.colonist.max = 4;
        global.civic.colonist.workers = 4;
        global.civic.space_miner.max = 3;
        global.civic.space_miner.workers = 2;
        global.civic.professor.max = 1;
        global.civic.professor.workers = 1;
        global.civic.cement_worker.max = 1;
        global.civic.cement_worker.workers = 1;

        global.city.calendar.day++;
        global.city.market.active = true;
        global.city['power'] = 0;
        global.city['powered'] = true;

        global.city['factory'] = { count: 0, on: 0, Lux: 0, Furs: 0, Alloy: 0, Polymer: 1, Nano: 0, Stanene: 0 };
        global.city['foundry'] = { count: 0, crafting: 0, Plywood: 0, Brick: 0, Bronze: 0, Wrought_Iron: 0, Sheet_Metal: 0, Mythril: 0, Aerogel: 0, Nanoweave: 0, Scarletite: 0, Quantium: 0 };
        global.city['smelter'] = { count: 0, cap: 2, Wood: 0, Coal: 0, Oil: 2, Star: 0, StarCap: 0, Inferno: 0, Iron: 1, Steel: 1, Iridium: 0 };
        global.city['fission_power'] = { count: 0, on: 0 };
        global.city['oil_power'] = { count: 0, on: 0 };
        global.city['coal_power'] = { count: 0, on: 0 };

        global.city['mass_driver'] = { count: 0, on: 0 };
        global.city['mine'] = { count: 0, on: 0 };
        global.city['coal_mine'] = { count: 0, on: 0 };
        global.city['oil_well'] = { count: 0 };
        global.city['oil_depot'] = { count: 0 };
        global.city['garrison'] = { count: 0, on: 0 };
        global.city['basic_housing'] = { count: 0 };
        global.city['cottage'] = { count: 0 };
        global.city['apartment'] = { count: 0, on: 0 };
        global.city['amphitheatre'] = { count: 0 };
        global.city['casino'] = { count: 0, on: 0 };
        global.city['rock_quarry'] = { count: 0, on: 0, asbestos: 50 };
        global.city['metal_refinery'] = { count: 0, on: 0 };
        global.city['storage_yard'] = { count: 0 };
        global.city['warehouse'] = { count: 0 };
        global.city['trade'] = { count: 0 };
        global.city['wharf'] = { count: 0 };
        global.city['bank'] = { count: 0 };
        global.city['tourist_center'] = { count: 0, on: 0 };
        global.city['university'] = { count: 0 };
        global.city['library'] = { count: 0 };
        global.city['wardenclyffe'] = { count: 0, on: 0 };
        global.city['biolab'] = { count: 0, on: 0 };
        global.city['lumber_yard'] = { count: 0 };
        global.city['sawmill'] = { count: 0, on: 0 };
        global.city['temple'] = { count: 0 };

        global.space['satellite'] = { count: 1 };
        global.space['propellant_depot'] = { count: 1 };
        global.space['gps'] = { count: 4 };
        global.space['nav_beacon'] = { count: 1, on: 1 };
        global.space['moon_base'] = { count: 1, on: 1, support: 3, s_max: 3 };
        global.space['iridium_mine'] = { count: 1, on: 1 };
        global.space['helium_mine'] = { count: 1, on: 1 };
        global.space['observatory'] = { count: 1, on: 1 };
        global.space['spaceport'] = { count: 2, on: 2, support: 8, s_max: 10 };
        global.space['red_tower'] = { count: 1, on: 1 };
        global.space['living_quarters'] = { count: 4, on: 4 };
        global.space['vr_center'] = { count: 0, on: 0 };
        global.space['garage'] = { count: 1 };
        global.space['red_mine'] = { count: 1, on: 1 };
        global.space['fabrication'] = { count: 1, on: 1 };
        global.space['red_factory'] = { count: 1, on: 1 };
        global.space['exotic_lab'] = { count: 1, on: 1 };
        global.space['ziggurat'] = { count: 0 };
        global.space['space_barracks'] = { count: 1, on: 1 };
        global.space['biodome'] = { count: 2, on: 2 };
        global.space['laboratory'] = { count: 0, on: 0 };
        global.space['geothermal'] = { count: 2, on: 2 };
        global.space['spc_casino'] = { count: 0, on: 0 };
        global.space['swarm_plant'] = { count: 0 };
        global.space['swarm_control'] = { count: 5, support: 40, s_max: 50 };
        global.space['swarm_satellite'] = { count: 40 };
        global.space['gas_mining'] = { count: 2, on: 2 };
        global.space['gas_storage'] = { count: 1 };
        global.space['outpost'] = { count: 0, on: 0 };
        global.space['drone'] = { count: 0 };
        global.space['oil_extractor'] = { count: 2, on: 2 };
        global.space['space_station'] = { count: 1, on: 1, support: 0, s_max: 3 };
        global.space['iridium_ship'] = { count: 1, on: 1 };
        global.space['elerium_ship'] = { count: 0, on: 0 };
        global.space['elerium_prospector'] = { count: 0, on: 0 };
        global.space['iron_ship'] = { count: 1, on: 1 };
        global.space['elerium_contain'] = { count: 0, on: 0 };

        global.civic['garrison'] = {
            display: true,
            disabled: false,
            progress: 0,
            tactic: 0,
            workers: 2,
            wounded: 0,
            raid: 0,
            max: 2
        };

        drawCity();
        drawTech();
        renderSpace();
        arpa('Physics');
        loadFoundry();
    }
}

export function fanaticism(god){
    switch (races[god].fanaticism){
        case 'smart':
            if (global.race['dumb']){
                randomMinorTrait(5);
                arpa('Genetics');
            }
            else {
                fanaticTrait('smart');
            }
            break;
        case 'infectious':
            fanaticTrait('infectious');
            if (global.race.species === 'human'){
                unlockAchieve(`infested`);
            }
            break;
        case 'blood_thirst':
            fanaticTrait('blood_thirst');
            if (global.race.species === 'entish'){
                unlockAchieve(`madagascar_tree`);
            }
            break;
        case 'none':
            randomMinorTrait(5);
            arpa('Genetics')
            break;
        default:
            fanaticTrait(races[god].fanaticism);
            break;
    }
}

function fanaticTrait(trait){
    if (global.race[trait]){
        if (!setTraitRank(trait)){
            randomMinorTrait(5);
            arpa('Genetics');
        }
    }
    else {
        global.race[trait] = 1;
        if (trait === 'imitation'){
            setImitation(true);
        }
        cleanAddTrait(trait);
    }
}

export function resQueue(){
    if (!global.settings.tabLoad && global.settings.civTabs !== 3){
        return;
    }
    clearResDrag();
    clearElement($('#resQueue'));
    $('#resQueue').append($(`
        <h2 class="has-text-success">${loc('research_queue')} ({{ queue.length }}/{{ max }})</h2>
        <span id="pauserqueue" class="${global.r_queue.pause ? 'pause' : 'play'}" role="button" @click="pauseRQueue()" :aria-label="pausedesc()"></span>
    `));

    let queue = $(`<ul class="buildList"></ul>`);
    $('#resQueue').append(queue);

    queue.append($(`<li v-for="(item, index) in queue"><a v-bind:id="setID(index)" class="queued" v-bind:class="{ 'qany': item.qa }" @click="remove(index)"><span class="has-text-warning">{{ item.label }}</span> [<span v-bind:class="{ 'has-text-danger': item.cna, 'has-text-success': !item.cna }">{{ item.time | time }}</span>]</a></li>`));

    try {
        vBind({
            el: '#resQueue',
            data: global.r_queue,
            methods: {
                remove(index){
                    clearPopper(`rq${global.r_queue.queue[index].id}`);
                    global.r_queue.queue.splice(index,1);
                    resQueue();
                },
                setID(index){
                    return `rq${global.r_queue.queue[index].id}`;
                },
                pauseRQueue(){
                    $(`#pauserqueue`).removeClass('play');
                    $(`#pauserqueue`).removeClass('pause');
                    if (global.r_queue.pause){
                        global.r_queue.pause = false;
                        $(`#pauserqueue`).addClass('play');
                    }
                    else {
                        global.r_queue.pause = true;
                        $(`#pauserqueue`).addClass('pause');
                    }
                },
                pausedesc(){
                    return global.r_queue.pause ? loc('r_queue_play') : loc('r_queue_pause');
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

export function clearResDrag(){
    let el = $('#resQueue .buildList')[0];
    if (el){
        let sort = Sortable.get(el);
        if (sort){
            sort.destroy();
        }
    }
}

function resDragQueue(){
    let el = $('#resQueue .buildList')[0];
    Sortable.create(el,{
        onEnd(e){
            let order = global.r_queue.queue;
            order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
            global.r_queue.queue = order;
            resQueue();
        }
    });
    attachQueuePopovers();
}

function attachQueuePopovers(){
    for (let i=0; i<global.r_queue.queue.length; i++){
        let id = `rq${global.r_queue.queue[i].id}`;
        clearPopper(id);

        let c_action;
        let segments = global.r_queue.queue[i].id.split("-");
        c_action = actions[segments[0]][segments[1]];

        popover(id,function(){ return undefined; },{
            in: function(obj){
                actionDesc(obj.popper,c_action,global[segments[0]][segments[1]],false);
            },
            out: function(){
                clearPopper(id);
            },
            wide: c_action['wide']
        });
    }
}

function bananaPerk(val){
    if (global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 5){
        return val - 0.01;
    }
    return val;
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
        vault *= 1 - (traits.paranoid.vars()[0] / 100);
    }
    if (global.race['hoarder']){
        vault *= 1 + (traits.hoarder.vars()[0] / 100);
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
    if (global.race['truepath']){
        vault *= 1.25;
    }
    if (global.blood['greed']){
        vault *= 1 + (global.blood.greed / 100);
    }
    if (global.stats.achieve['wheelbarrow']){
        vault *= 1 + (global.stats.achieve.wheelbarrow.l / 50);
    }
    if (global.race['inflation']){
        vault *= 1 + (global.race.inflation / 125);
    }
    let rskVal = govActive('risktaker',0);
    if (rskVal){
        vault *= 1 + (rskVal / 100);
    }
    return vault;
}

export function start_cataclysm(){
    if (global.race['start_cataclysm']){
        delete global.race['start_cataclysm'];
        sentience();
    }
}
