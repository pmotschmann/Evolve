import { global, save, webWorker, clearSavedMessages, clearStates } from './vars.js';
import { tagEvent, calcPrestige, updateResetStats } from './functions.js';
import { races, planetTraits } from './races.js';
import { unlockAchieve, unlockFeat, checkAchievements, universeAffix, alevel } from './achieve.js';

// Mutual Assured Destruction
export function warhead(){
    if (!global.civic.mad.armed && !global.race['cataclysm']){
        if (!global['sim']){
            save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
        }
        clearSavedMessages();

        tagEvent('reset',{
            'end': 'mad'
        });

        let god = global.race.species;
        let old_god = global.race.gods;
        let orbit = global.city.calendar.orbit;
        let biome = global.city.biome;
        let atmo = global.city.ptrait;
        let geo = global.city.geology;

        let gains = calcPrestige('mad');

        global.stats.mad++;
        updateResetStats();
        if (global.race.universe === 'antimatter'){
            global.prestige.AntiPlasmid.count += gains.plasmid;
            global.stats.antiplasmid += gains.plasmid;
        }
        else {
            global.prestige.Plasmid.count += gains.plasmid;
            global.stats.plasmid += gains.plasmid;
        }
        unlockAchieve(`apocalypse`);
        unlockAchieve(`squished`,true);
        unlockAchieve(`extinct_${god}`);
        if (global.civic.govern.type === 'anarchy'){
            unlockAchieve(`anarchist`);
        }
        if (global.city.biome === 'hellscape' && races[global.race.species].type !== 'demonic'){
            unlockFeat('take_no_advice');
        }
        if (global.race['truepath']){
            unlockAchieve('ashanddust');
        }
        checkAchievements();

        let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
        let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
        global['race'] = { 
            species : 'protoplasm', 
            gods: god,
            old_gods: old_god,
            rapid_mutation: 1,
            ancient_ruins: 1,
            universe: global.race.universe,
            seeded: false,
            ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
        };
        if (corruption > 0){
            global.race['corruption'] = corruption;
        }
        if (srace){
            global.race['srace'] = srace;
        }
        
        resetCommon({
            orbit: orbit, 
            biome: biome, 
            ptrait: atmo, 
            geology: geo
        });
        
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        window.location.reload();
    }
}

//Bioseed
export function bioseed(){
    if (!global['sim']){
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    }
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'bioseed'
    });

    let god = global.race.species;
    let old_god = global.race.gods;
    let genus = races[god].type;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;

    let gains = calcPrestige('bioseed');

    global.stats.bioseed++;
    updateResetStats();
    global.prestige.Phage.count += gains.phage;
    global.stats.phage += gains.phage;
    if (global.race.universe === 'antimatter'){
        global.prestige.AntiPlasmid.count += gains.plasmid;
        global.stats.antiplasmid += gains.plasmid;
    }
    else {
        global.prestige.Plasmid.count += gains.plasmid;
        global.stats.plasmid += gains.plasmid;
    }
    unlockAchieve(`seeder`);
    unlockAchieve(`biome_${biome}`);
    atmo.forEach(function(a){
        if (planetTraits.hasOwnProperty(a)){
            unlockAchieve(`atmo_${a}`);
        }
    });
    unlockAchieve(`genus_${genus}`);
    
    if (global.race['truepath']){
        unlockAchieve(`exodus`);
    }
    if (atmo.includes('dense') && global.race.universe === 'heavy'){
        unlockAchieve(`double_density`);
    }
    if (global.race['junker'] && global.race.species === 'junker'){
        unlockFeat('organ_harvester');
    }
    if (global.city.biome === 'hellscape' && races[global.race.species].type !== 'demonic'){
        unlockFeat('ill_advised');
    }
    if (typeof global.tech['world_control'] === 'undefined'){
        unlockAchieve(`cult_of_personality`);
    }

    if (global.race['cataclysm']){
        unlockAchieve('iron_will',false,5);
    }
    if (global.race['gross_enabled'] && global.race['ooze'] && global.race.species !== 'custom' && global.race.species !== 'sludge'){
        unlockAchieve(`gross`);
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
        unlockAchieve('miners_dream');
    }
    if (bad_rocks >= 3){
        unlockFeat('rocky_road');
    }
    if (global.race['steelen'] && global.race['steelen'] >= 1){
        unlockAchieve(`steelen`);
    }

    switch (global.race.universe){
        case 'micro':
            if (global.race['small'] || global.race['compact']){
                unlockAchieve(`macro`,true);
            }
            else {
                unlockAchieve(`marble`,true);
            }
            break;
        default:
            break;
    }

    checkAchievements();

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    let probes = global.starDock.probes.count + 1;
    let gecks = global.starDock.hasOwnProperty('geck') ? global.starDock.geck.count : 0;
    if (global.stats.achieve['explorer']){
        probes += global.stats.achieve['explorer'].l;
    }
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: global.race.universe,
        seeded: true,
        probes: probes,
        geck: gecks,
        seed: Math.floor(Math.seededRandom(10000)),
        ascended: false,
    };
    if (corruption > 0){
        global.race['corruption'] = corruption;
    }
    if (srace){
        global.race['srace'] = srace;
    }

    resetCommon({
        orbit: orbit, 
        biome: biome, 
        ptrait: atmo, 
        geology: false
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

// Cataclysm
export function cataclysm_end(){
    if (global.city.ptrait.includes('unstable') && global.tech['quaked']){
        if (webWorker.w){
            webWorker.w.terminate();
        }
        if (!global['sim']){
            save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
        }

        tagEvent('reset',{
            'end': 'cataclysm'
        });

        clearSavedMessages();

        let gains = calcPrestige('cataclysm');

        global.stats.cataclysm++;
        updateResetStats();

        global.prestige.Phage.count += gains.phage;
        global.stats.phage += gains.phage;
        if (global.race.universe === 'antimatter'){
            global.prestige.AntiPlasmid.count += gains.plasmid;
            global.stats.antiplasmid += gains.plasmid;
        }
        else {
            global.prestige.Plasmid.count += gains.plasmid;
            global.stats.plasmid += gains.plasmid;
        }

        unlockAchieve(`squished`,true);
        unlockAchieve(`extinct_${global.race.species}`);
        if (global.city.biome === 'hellscape' && races[global.race.species].type !== 'demonic'){
            unlockFeat('take_no_advice');
        }
        checkAchievements();
        unlockAchieve('shaken');
        if (global.race['cataclysm']){
            unlockAchieve('failed_history');
        }

        let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
        let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
        global['race'] = {
            species : global.race.species,
            gods: global.race.gods,
            old_gods: global.race.old_gods,
            universe: global.race.universe,
            seeded: false,
            ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
        };
        if (corruption > 0){
            global.race['corruption'] = corruption;
        }
        if (srace){
            global.race['srace'] = srace;
        }

        resetCommon({
            orbit: global.city.calendar.orbit, 
            biome: global.city.biome, 
            ptrait: global.city.ptrait, 
            geology: global.city.geology
        });

        if (global.race.universe === 'antimatter') {
            global.race['weak_mastery'] = 1;
        }
        else {
            global.race['no_plasmid'] = 1;
        }

        let genes = ['crispr','trade','craft'];
        for (let i=0; i<genes.length; i++){
            global.race[`no_${genes[i]}`] = 1;
        }

        global.race['start_cataclysm'] = 1;
        global.race['cataclysm'] = 1;
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        window.location.reload();
    }
}

// Blackhole
export function big_bang(){
    if (!global['sim']){
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    }
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'blackhole'
    });

    unlockAchieve(`extinct_${global.race.species}`);
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
        case 'standard':
            unlockAchieve(`whitehole`);
            break;
        default:
            break;
    }

    if (global.space.hasOwnProperty('spaceport') && global.space.spaceport.count === 0){
        unlockAchieve(`red_dead`);
    }

    unlockAchieve(`squished`,true);
    if (global.race.universe === 'evil' && races[global.race.species].type === 'angelic'){
        unlockFeat('nephilim');
    }
    if (global.race['junker'] && global.race.species === 'junker'){
        unlockFeat('the_misery');
    }
    if (global.race['decay']){
        unlockAchieve(`dissipated`);
    }
    if (global.race['steelen']){
        unlockFeat('steelem');
    }

    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;

    let gains = calcPrestige('bigbang');

    checkAchievements();

    global.stats.blackhole++;
    updateResetStats();
    global.prestige.Phage.count += gains.phage;
    global.stats.phage += gains.phage;
    if (global.race.universe === 'antimatter'){
        global.prestige.AntiPlasmid.count += gains.plasmid;
        global.stats.antiplasmid += gains.plasmid;
    }
    else {
        global.prestige.Plasmid.count += gains.plasmid;
        global.stats.plasmid += gains.plasmid;
    }
    global.prestige.Dark.count = +(global.prestige.Dark.count + gains.dark).toFixed(3);
    global.stats.dark = +(global.stats.dark + gains.dark).toFixed(3);
    global.stats.universes++;

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    //let gecks = global.starDock.hasOwnProperty('geck') ? global.starDock.geck.count : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: 'bigbang',
        seeded: true,
        bigbang: true,
        probes: 4,
        //geck: gecks,
        seed: Math.floor(Math.seededRandom(10000)),
        ascended: false
    };
    if (corruption > 0){
        global.race['corruption'] = corruption;
    }
    if (srace){
        global.race['srace'] = srace;
    }

    resetCommon({
        orbit: orbit, 
        biome: biome, 
        ptrait: atmo, 
        geology: false
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

export function vacuumCollapse(){
    if (global.tech.syphon >= 80 && global.race.universe === 'magic'){
        global.tech.syphon = 79;
        global.arpa.syphon.rank = 79;
        global.arpa.syphon.complete = 99;
        global.queue.queue = [];

        global.stats['current'] = Date.now();
        if (!global['sim']){
            save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
        }
        clearSavedMessages();

        tagEvent('reset',{
            'end': 'vacuum'
        });

        unlockAchieve(`extinct_${global.race.species}`);
        unlockAchieve(`pw_apocalypse`);

        if (global.space.hasOwnProperty('spaceport') && global.space.spaceport.count === 0){
            unlockAchieve(`red_dead`);
        }
        if (!global.race['modified'] && global.race.species === 'balorg'){
            unlockAchieve('pass');
        }
        if (global.race['junker'] && global.race.species === 'junker'){
            unlockFeat('the_misery');
        }
        if (global.race['decay']){
            unlockAchieve(`dissipated`);
        }
        if (global.race['steelen']){
            unlockFeat('steelem');
        }

        let god = global.race.species;
        let old_god = global.race.gods;
        let orbit = global.city.calendar.orbit;
        let biome = global.city.biome;
        let atmo = global.city.ptrait;

        let gains = calcPrestige('vacuum');

        checkAchievements();

        global.stats.blackhole++;
        updateResetStats();

        global.prestige.Phage.count += gains.phage;
        global.stats.phage += gains.phage;
        if (global.race.universe === 'antimatter'){
            global.prestige.AntiPlasmid.count += gains.plasmid;
            global.stats.antiplasmid += gains.plasmid;
        }
        else {
            global.prestige.Plasmid.count += gains.plasmid;
            global.stats.plasmid += gains.plasmid;
        }
        global.prestige.Dark.count = +(global.prestige.Dark.count + gains.dark).toFixed(3);
        global.stats.dark = +(global.stats.dark + gains.dark).toFixed(3);
        global.stats.universes++;

        let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
        let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
        //let gecks = global.starDock.hasOwnProperty('geck') ? global.starDock.geck.count : 0;
        global['race'] = {
            species : 'protoplasm',
            gods: god,
            old_gods: old_god,
            universe: 'bigbang',
            seeded: true,
            bigbang: true,
            probes: 4,
            //geck: gecks,
            seed: Math.floor(Math.seededRandom(10000)),
            ascended: false,
        };
        if (corruption > 0){
            global.race['corruption'] = corruption;
        }
        if (srace){
            global.race['srace'] = srace;
        }

        resetCommon({
            orbit: orbit, 
            biome: biome, 
            ptrait: atmo, 
            geology: false
        });

        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        window.location.reload();
    }
}

// Ascension
export function ascend(){
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'ascend'
    });

    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;

    let gains = calcPrestige('ascend');

    global.stats.ascend++;
    updateResetStats();

    global.prestige.Phage.count += gains.phage;
    global.stats.phage += gains.phage;
    if (global.race.universe === 'antimatter'){
        global.prestige.AntiPlasmid.count += gains.plasmid;
        global.stats.antiplasmid += gains.plasmid;
    }
    else {
        global.prestige.Plasmid.count += gains.plasmid;
        global.stats.plasmid += gains.plasmid;
    }

    global.prestige.Harmony.count = parseFloat((global.prestige.Harmony.count + gains.harmony).toFixed(2));
    global.stats.harmony = parseFloat((global.stats.Harmony + gains.harmony).toFixed(2));

    atmo.forEach(function(a){
        if (planetTraits.hasOwnProperty(a)){
            unlockAchieve(`atmo_${a}`);
        }
    });

    if (typeof global.tech['world_control'] === 'undefined'){
        unlockAchieve(`cult_of_personality`);
    }

    let good_rocks = 0;
    Object.keys(global.city.geology).forEach(function (g){
        if (global.city.geology[g] > 0){
            good_rocks++;
        }
    });
    if (good_rocks >= 4) {
        unlockAchieve('miners_dream');
    }

    if (!global.galaxy.hasOwnProperty('dreadnought') || global.galaxy.dreadnought.count === 0){
        unlockAchieve(`dreaded`);
    }

    if (!global.race['modified'] && (global.race.species === 'synth' || global.race.species === 'nano') && global.race['emfield']){
        unlockFeat('digital_ascension');
    }

    if (global.race['gross_enabled'] && global.race['ooze'] && global.race.species !== 'custom' && global.race.species !== 'sludge'){
        unlockAchieve(`gross`);
    }

    checkAchievements();

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(Math.seededRandom(10000)),
        ascended: true,
    };
    if (corruption > 0){
        global.race['corruption'] = corruption;
    }
    if (srace){
        global.race['srace'] = srace;
    }

    Object.keys(geo).forEach(function (g){
        geo[g] += 0.02;
    });

    resetCommon({
        orbit: orbit, 
        biome: biome, 
        ptrait: atmo, 
        geology: geo
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

// Demonic Infusion
export function descension(){
    if (webWorker.w){
        webWorker.w.terminate();
    }
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'descension'
    });

    unlockAchieve(`squished`,true);
    unlockAchieve(`extinct_${global.race.species}`);
    unlockAchieve(`corrupted`);
    if (races[global.race.species].type === 'angelic'){
        unlockFeat('twisted');
    }
    if (global.race['junker'] && global.race.species === 'junker'){
        unlockFeat('the_misery');
    }
    if (!global.race['modified'] && global.race['junker'] && global.race.species === 'junker'){
        unlockFeat(`garbage_pie`);
    }
    if (global.race['cataclysm']){
        unlockFeat(`finish_line`);
    }
    if (global.race['ooze'] && global.race.species === 'sludge'){
        unlockFeat('slime_lord');
    }

    let gains = calcPrestige('descend');
    global.prestige.Artifact.count += gains.artifact;
    global.stats.artifact += gains.artifact;

    let affix = universeAffix();
    if (global.stats.spire.hasOwnProperty(affix)){
        if (global.stats.spire[affix].hasOwnProperty('lord')){
            global.stats.spire[affix].lord++;
        }
        else {
            global.stats.spire[affix]['lord'] = 1;
        }

        if (global.tech['dl_reset']){
            global.stats.spire[affix]['dlstr'] = 0;
        }
        else { 
            if (global.stats.spire[affix].hasOwnProperty('dlstr')){
                global.stats.spire[affix].dlstr++;
            }
            else {
                global.stats.spire[affix]['dlstr'] = 1;
            }
        }
    }

    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;

    global.stats.descend++;
    updateResetStats();
    checkAchievements();

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(Math.seededRandom(10000)),
        corruption: 5,
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
    };
    if (srace){
        global.race['srace'] = srace;
    }

    resetCommon({
        orbit: orbit, 
        biome: biome, 
        ptrait: atmo, 
        geology: geo
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

// Terraform
export function terraform(planet){
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'terraform'
    });

    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = planet.biome;
    let atmo = planet.traitlist;
    let geo = planet.geology;

    let gains = calcPrestige('terraform');

    global.stats.terraform++;
    updateResetStats();

    global.prestige.Phage.count += gains.phage;
    global.stats.phage += gains.phage;
    if (global.race.universe === 'antimatter'){
        global.prestige.AntiPlasmid.count += gains.plasmid;
        global.stats.antiplasmid += gains.plasmid;
    }
    else {
        global.prestige.Plasmid.count += gains.plasmid;
        global.stats.plasmid += gains.plasmid;
    }

    global.prestige.Harmony.count = parseFloat((global.prestige.Harmony.count + gains.harmony).toFixed(2));
    global.stats.harmony = parseFloat((global.stats.Harmony + gains.harmony).toFixed(2));

    atmo.forEach(function(a){
        if (planetTraits.hasOwnProperty(a)){
            unlockAchieve(`atmo_${a}`);
        }
    });

    if (typeof global.tech['world_control'] === 'undefined'){
        unlockAchieve(`cult_of_personality`);
    }

    let good_rocks = 0;
    Object.keys(global.city.geology).forEach(function (g){
        if (global.city.geology[g] > 0){
            good_rocks++;
        }
    });
    if (good_rocks >= 4) {
        unlockAchieve('miners_dream');
    }

    if (global.race['gross_enabled'] && global.race['ooze'] && global.race.species !== 'custom' && global.race.species !== 'sludge'){
        unlockAchieve(`gross`);
    }

    checkAchievements();

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(Math.seededRandom(10000)),
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
        rejuvenated: true,
    };
    if (corruption > 0){
        global.race['corruption'] = corruption;
    }
    if (srace){
        global.race['srace'] = srace;
    }

    resetCommon({
        orbit: orbit, 
        biome: biome, 
        ptrait: atmo, 
        geology: geo
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

// AI Appocalypse
export function aiApocalypse(){
    if (!global['sim']){
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    }
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'ai apocalypse'
    });

    unlockAchieve(`extinct_${global.race.species}`);
    unlockAchieve(`obsolete`);

    unlockAchieve(`squished`,true);
    if (global.race['junker'] && global.race.species === 'junker'){
        unlockFeat('the_misery');
    }

    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;

    let gains = calcPrestige('ai');
    checkAchievements();

    global.stats.aiappoc++;
    updateResetStats();
    global.prestige.Phage.count += gains.phage;
    global.stats.phage += gains.phage;
    if (global.race.universe === 'antimatter'){
        global.prestige.AntiPlasmid.count += gains.plasmid;
        global.stats.antiplasmid += gains.plasmid;
    }
    else {
        global.prestige.Plasmid.count += gains.plasmid;
        global.stats.plasmid += gains.plasmid;
    }

    global.prestige.AICore.count += gains.cores;
    global.stats.cores += gains.cores;

    let srace = races[god].type !== 'synthetic' ? god : (global.race.hasOwnProperty('srace') ? global.race.srace : god);
    global.stats.synth[srace] = true;

    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        srace: srace,
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(Math.seededRandom(10000)),
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
    };
    if (corruption > 0){
        global.race['corruption'] = corruption;
    }

    resetCommon({
        orbit: orbit, 
        biome: biome, 
        ptrait: atmo, 
        geology: geo
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

// Matrix
export function matrix(){
    if (webWorker.w){
        webWorker.w.terminate();
    }
    if (!global['sim']){
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    }
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'matrix'
    });

    let god = global.race.species;
    let old_god = global.race.gods;
    let genus = races[god].type;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;

    let gains = calcPrestige('matrix');

    unlockAchieve(`biome_${biome}`);
    atmo.forEach(function(a){
        if (planetTraits.hasOwnProperty(a)){
            unlockAchieve(`atmo_${a}`);
        }
    });
    unlockAchieve(`genus_${genus}`);
    if (global.race['gross_enabled'] && global.race['ooze'] && global.race.species !== 'custom' && global.race.species !== 'sludge'){
        unlockAchieve(`gross`);
    }
    unlockAchieve(`bluepill`);

    trackWomling();
    checkAchievements();

    global.stats.matrix++;
    updateResetStats();
    if (global.race.universe === 'antimatter'){
        global.prestige.AntiPlasmid.count += gains.plasmid;
        global.stats.antiplasmid += gains.plasmid;
    }
    else {
        global.prestige.Plasmid.count += gains.plasmid;
        global.stats.plasmid += gains.plasmid;
    }
    global.prestige.Phage.count += gains.phage;
    global.stats.phage += gains.phage;

    global.prestige.AICore.count += gains.cores;
    global.stats.cores += gains.cores;

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(Math.seededRandom(10000)),
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
    };
    if (corruption > 0){
        global.race['corruption'] = corruption;
    }
    if (srace){
        global.race['srace'] = srace;
    }

    resetCommon({
        orbit: orbit, 
        biome: biome, 
        ptrait: atmo, 
        geology: geo
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

// Retirement
export function retirement(){
    if (webWorker.w){
        webWorker.w.terminate();
    }
    if (!global['sim']){
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    }
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'retire'
    });

    let god = global.race.species;
    let old_god = global.race.gods;
    let genus = races[god].type;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;

    let gains = calcPrestige('retire');

    unlockAchieve(`biome_${biome}`);
    atmo.forEach(function(a){
        if (planetTraits.hasOwnProperty(a)){
            unlockAchieve(`atmo_${a}`);
        }
    });
    unlockAchieve(`genus_${genus}`);
    if (global.race['gross_enabled'] && global.race['ooze'] && global.race.species !== 'custom' && global.race.species !== 'sludge'){
        unlockAchieve(`gross`);
    }
    unlockAchieve(`retired`);

    trackWomling();
    checkAchievements();

    global.stats.retire++;
    updateResetStats();
    if (global.race.universe === 'antimatter'){
        global.prestige.AntiPlasmid.count += gains.plasmid;
        global.stats.antiplasmid += gains.plasmid;
    }
    else {
        global.prestige.Plasmid.count += gains.plasmid;
        global.stats.plasmid += gains.plasmid;
    }
    global.prestige.Phage.count += gains.phage;
    global.stats.phage += gains.phage;

    global.prestige.AICore.count += gains.cores;
    global.stats.cores += gains.cores;

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(Math.seededRandom(10000)),
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
    };
    if (corruption > 0){
        global.race['corruption'] = corruption;
    }
    if (srace){
        global.race['srace'] = srace;
    }

    resetCommon({
        orbit: orbit, 
        biome: biome, 
        ptrait: atmo, 
        geology: geo
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

// Garden of Eden
export function gardenOfEden(){
    if (webWorker.w){
        webWorker.w.terminate();
    }
    if (!global['sim']){
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    }
    clearSavedMessages();

    tagEvent('reset',{
        'end': 'eden'
    });

    let god = global.race.species;
    let old_god = global.race.gods;
    let genus = races[god].type;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;

    let gains = calcPrestige('eden');

    unlockAchieve(`biome_${biome}`);
    atmo.forEach(function(a){
        if (planetTraits.hasOwnProperty(a)){
            unlockAchieve(`atmo_${a}`);
        }
    });
    unlockAchieve(`genus_${genus}`);
    if (global.race['gross_enabled'] && global.race['ooze'] && global.race.species !== 'custom' && global.race.species !== 'sludge'){
        unlockAchieve(`gross`);
    }
    unlockAchieve(`adam_eve`);

    trackWomling();
    checkAchievements();

    global.stats.eden++;
    updateResetStats();
    if (global.race.universe === 'antimatter'){
        global.prestige.AntiPlasmid.count += gains.plasmid;
        global.stats.antiplasmid += gains.plasmid;
    }
    else {
        global.prestige.Plasmid.count += gains.plasmid;
        global.stats.plasmid += gains.plasmid;
    }
    global.prestige.Phage.count += gains.phage;
    global.stats.phage += gains.phage;

    global.prestige.AICore.count += gains.cores;
    global.stats.cores += gains.cores;

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(Math.seededRandom(10000)),
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
    };
    if (corruption > 0){
        global.race['corruption'] = corruption;
    }
    if (srace){
        global.race['srace'] = srace;
    }

    resetCommon({
        orbit: orbit, 
        biome: biome, 
        ptrait: atmo, 
        geology: geo
    });

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

function resetCommon(args){
    global.city = {
        calendar: {
            day: 0,
            year: 0,
            weather: 2,
            temp: 1,
            moon: 0,
            wind: 0,
            orbit: args.orbit
        },
        biome: args.biome,
        ptrait: args.ptrait
    };

    if (args.geology){
        global.city['geology'] = args.geology;
    }

    global.tech = { theology: 1 };
    clearStates();
    global.new = true;
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;
}

function trackWomling(){
    let uni = universeAffix();
    if (global.race['womling_friend']){
        if (uni !== 'm'){
            global.stats.womling.friend.l++;
        }
        if (uni !== 'l'){
            if (!global.stats.womling.friend.hasOwnProperty(uni)){
                global.stats.womling.friend[uni] = 0;
            }
            global.stats.womling.friend[uni]++;
        }
    }
    else if (global.race['womling_lord']){
        if (uni !== 'm'){
            global.stats.womling.lord.l++;
        }
        if (uni !== 'l'){
            if (!global.stats.womling.lord.hasOwnProperty(uni)){
                global.stats.womling.lord[uni] = 0;
            }
            global.stats.womling.lord[uni]++;
        }
    }
    else if (global.race['womling_god']){
        if (uni !== 'm'){
            global.stats.womling.god.l++;
        }
        if (uni !== 'l'){
            if (!global.stats.womling.god.hasOwnProperty(uni)){
                global.stats.womling.god[uni] = 0;
            }
            global.stats.womling.god[uni]++;
        }
    }

    if (global.stats.womling.friend.l > 0 && global.stats.womling.lord.l > 0 && global.stats.womling.god.l > 0){
        unlockAchieve('overlord',uni === 'm' ? true : false,alevel(),'l');
    }
    if (global.stats.womling.friend[uni] > 0 && global.stats.womling.lord[uni] > 0 && global.stats.womling.god[uni] > 0){
        unlockAchieve('overlord',uni === 'm' ? true : false,alevel(),uni);
    }
}

