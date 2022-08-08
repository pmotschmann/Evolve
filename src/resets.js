import { global, save, webWorker, clearSavedMessages, clearStates } from './vars.js';
import { tagEvent, calcPrestige, updateResetStats } from './functions.js';
import { races, planetTraits } from './races.js';
import { unlockAchieve, unlockFeat, checkAchievements, universeAffix } from './achieve.js';

// Mutual Assured Destruction
export function warhead(){
    if (!global.civic.mad.armed && !global.race['cataclysm']){
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
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
        let plasmid = global.race.Plasmid.count;
        let antiplasmid = global.race.Plasmid.anti;

        let gains = calcPrestige('mad');
        let new_plasmid = gains.plasmid;

        global.stats.reset++;
        global.stats.mad++;
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
            Plasmid: { count: plasmid, anti: antiplasmid },
            Phage: { count: global.race.Phage.count },
            Dark: { count: global.race.Dark.count },
            Harmony: { count: global.race.Harmony.count },
            AICore: { count: global.race.AICore.count },
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
            ptrait: atmo,
            geology: geo
        };
        global.tech = { theology: 1 };
        clearStates();
        global.new = true;
        Math.seed = Math.rand(0,10000);
        global.seed = Math.seed;
        
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        window.location.reload();
    }
}

//Bioseed
export function bioseed(){
    save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
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
    let plasmid = global.race.Plasmid.count;
    let antiplasmid = global.race.Plasmid.anti;
    let phage = global.race.Phage.count;

    let gains = calcPrestige('bioseed');
    let new_plasmid = gains.plasmid;
    let new_phage = gains.phage;

    phage += new_phage;
    global.stats.bioseed++;
    updateResetStats();
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
        Plasmid: { count: plasmid, anti: antiplasmid },
        Phage: { count: phage },
        Dark: { count: global.race.Dark.count },
        Harmony: { count: global.race.Harmony.count },
        AICore: { count: global.race.AICore.count },
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

// Cataclysm
export function cataclysm_end(){
    if (global.city.ptrait.includes('unstable') && global.tech['quaked']){
        if (webWorker.w){
            webWorker.w.terminate();
        }
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));

        tagEvent('reset',{
            'end': 'cataclysm'
        });

        clearSavedMessages();

        let plasmid = global.race.Plasmid.count;
        let antiplasmid = global.race.Plasmid.anti;
        let phage = global.race.Phage.count;

        let gains = calcPrestige('cataclysm');
        let new_plasmid = gains.plasmid;
        let new_phage = gains.phage;

        global.stats.cataclysm++;
        updateResetStats();

        phage += new_phage;
        if (global.race.universe === 'antimatter'){
            antiplasmid += new_plasmid;
            global.stats.antiplasmid += new_plasmid;
        }
        else {
            plasmid += new_plasmid;
            global.stats.plasmid += new_plasmid;
        }
        global.stats.phage += new_phage;

        unlockAchieve(`squished`,true);
        unlockAchieve(`extinct_${global.race.species}`);
        if (global.civic.govern.type === 'anarchy'){
            unlockAchieve(`anarchist`);
        }
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
            Plasmid: { count: plasmid, anti: antiplasmid },
            Phage: { count: phage },
            Dark: { count: global.race.Dark.count },
            Harmony: { count: global.race.Harmony.count },
            AICore: { count: global.race.AICore.count },
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

        global.city = {
            calendar: {
                day: 0,
                year: 0,
                weather: 2,
                temp: 1,
                moon: 0,
                wind: 0,
                orbit: global.city.calendar.orbit
            },
            biome: global.city.biome,
            ptrait: global.city.ptrait,
            geology: global.city.geology
        };
        global.tech = { theology: 1 };
        clearStates();
        global.new = true;
        Math.seed = Math.rand(0,10000);
        global.seed = Math.seed;

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
    save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
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
    let plasmid = global.race.Plasmid.count;
    let antiplasmid = global.race.Plasmid.anti;
    let phage = global.race.Phage.count;
    let dark = global.race.Dark.count;

    let gains = calcPrestige('bigbang');
    let new_plasmid = gains.plasmid;
    let new_phage = gains.phage;
    let new_dark = gains.dark;

    checkAchievements();

    phage += new_phage;
    global.stats.blackhole++;
    updateResetStats();
    if (global.race.universe === 'antimatter'){
        antiplasmid += new_plasmid;
        global.stats.antiplasmid += new_plasmid;
    }
    else {
        plasmid += new_plasmid;
        global.stats.plasmid += new_plasmid;
    }
    global.stats.phage += new_phage;
    global.stats.dark = +(global.stats.dark + new_dark).toFixed(3);
    global.stats.universes++;

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    //let gecks = global.starDock.hasOwnProperty('geck') ? global.starDock.geck.count : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        Plasmid: { count: plasmid, anti: antiplasmid },
        Phage: { count: phage },
        Dark: { count: +(dark + new_dark).toFixed(3) },
        Harmony: { count: global.race.Harmony.count },
        AICore: { count: global.race.AICore.count },
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

export function vacuumCollapse(){
    if (global.tech.syphon >= 80 && global.race.universe === 'magic'){
        global.tech.syphon = 79;
        global.arpa.syphon.rank = 79;
        global.arpa.syphon.complete = 99;
        global.queue.queue = [];

        global.stats['current'] = Date.now();
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
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
        let plasmid = global.race.Plasmid.count;
        let antiplasmid = global.race.Plasmid.anti;
        let phage = global.race.Phage.count;
        let dark = global.race.Dark.count;

        let gains = calcPrestige('vacuum');
        let new_plasmid = gains.plasmid;
        let new_phage = gains.phage;
        let new_dark = gains.dark;

        checkAchievements();

        phage += new_phage;
        global.stats.blackhole++;
        updateResetStats();
        
        if (global.race.universe === 'antimatter'){
            antiplasmid += new_plasmid;
            global.stats.antiplasmid += new_plasmid;
        }
        else {
            plasmid += new_plasmid;
            global.stats.plasmid += new_plasmid;
        }
        global.stats.phage += new_phage;
        global.stats.dark = +(global.stats.dark + new_dark).toFixed(3);
        global.stats.universes++;

        let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
        let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
        //let gecks = global.starDock.hasOwnProperty('geck') ? global.starDock.geck.count : 0;
        global['race'] = {
            species : 'protoplasm',
            gods: god,
            old_gods: old_god,
            Plasmid: { count: plasmid, anti: antiplasmid },
            Phage: { count: phage },
            Dark: { count: +(dark + new_dark).toFixed(3) },
            Harmony: { count: global.race.Harmony.count },
            AICore: { count: global.race.AICore.count },
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
    let plasmid = global.race.Plasmid.count;
    let antiplasmid = global.race.Plasmid.anti;
    let phage = global.race.Phage.count;
    let harmony = global.race.Harmony.count;

    let gains = calcPrestige('ascend');
    let new_plasmid = gains.plasmid;
    let new_phage = gains.phage;
    let new_harmony = gains.harmony;

    phage += new_phage;
    harmony += new_harmony;
    harmony = parseFloat(harmony.toFixed(2));

    global.stats.ascend++;
    updateResetStats();

    if (global.race.universe === 'antimatter'){
        antiplasmid += new_plasmid;
        global.stats.antiplasmid += new_plasmid;
    }
    else {
        plasmid += new_plasmid;
        global.stats.plasmid += new_plasmid;
    }
    global.stats.phage += new_phage;
    global.stats.harmony += new_harmony;
    global.stats.harmony = parseFloat(global.stats.harmony.toFixed(2));

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
        Plasmid: { count: plasmid, anti: antiplasmid },
        Phage: { count: phage },
        Dark: { count: global.race.Dark.count },
        Harmony: { count: harmony },
        AICore: { count: global.race.AICore.count },
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
        ptrait: atmo,
        geology: geo
    };
    global.tech = { theology: 1 };
    clearStates();
    global.new = true;
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;

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

    let artifacts = calcPrestige('descend').artifact;
    global.resource.Artifact.amount += artifacts;
    global.resource.Artifact.display = true;

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
    let plasmid = global.race.Plasmid.count;
    let antiplasmid = global.race.Plasmid.anti;
    let phage = global.race.Phage.count;
    let harmony = global.race.Harmony.count;

    global.stats.artifact += artifacts;
    global.stats.descend++;
    updateResetStats();
    checkAchievements();

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        Plasmid: { count: plasmid, anti: antiplasmid },
        Phage: { count: phage },
        Dark: { count: global.race.Dark.count },
        Harmony: { count: harmony },
        AICore: { count: global.race.AICore.count },
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(Math.seededRandom(10000)),
        corruption: 5,
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
    };
    if (srace){
        global.race['srace'] = srace;
    }

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
        ptrait: atmo,
        geology: geo
    };
    global.tech = { theology: 1 };
    clearStates();
    global.new = true;
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;

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
    let plasmid = global.race.Plasmid.count;
    let antiplasmid = global.race.Plasmid.anti;
    let phage = global.race.Phage.count;
    let harmony = global.race.Harmony.count;

    let gains = calcPrestige('terraform');
    let new_plasmid = gains.plasmid;
    let new_phage = gains.phage;
    let new_harmony = gains.harmony;

    phage += new_phage;
    harmony += new_harmony;
    harmony = parseFloat(harmony.toFixed(2));

    global.stats.terraform++;
    updateResetStats();

    if (global.race.universe === 'antimatter'){
        antiplasmid += new_plasmid;
        global.stats.antiplasmid += new_plasmid;
    }
    else {
        plasmid += new_plasmid;
        global.stats.plasmid += new_plasmid;
    }
    global.stats.phage += new_phage;
    global.stats.harmony += new_harmony;
    global.stats.harmony = parseFloat(global.stats.harmony.toFixed(2));

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
        Plasmid: { count: plasmid, anti: antiplasmid },
        Phage: { count: phage },
        Dark: { count: global.race.Dark.count },
        Harmony: { count: harmony },
        AICore: { count: global.race.AICore.count },
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
        ptrait: atmo,
        geology: geo
    };
    global.tech = { theology: 1 };
    clearStates();
    global.new = true;
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

// AI Appocalypse
export function aiApocalypse(){
    save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
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
    let plasmid = global.race.Plasmid.count;
    let antiplasmid = global.race.Plasmid.anti;
    let phage = global.race.Phage.count;
    let dark = global.race.Dark.count;
    let cores = global.race.AICore.count;

    let gains = calcPrestige('ai');
    let new_plasmid = gains.plasmid;
    let new_phage = gains.phage;
    let new_cores = gains.cores;

    checkAchievements();

    phage += new_phage;
    global.stats.aiappoc++;
    updateResetStats();
    if (global.race.universe === 'antimatter'){
        antiplasmid += new_plasmid;
        global.stats.antiplasmid += new_plasmid;
    }
    else {
        plasmid += new_plasmid;
        global.stats.plasmid += new_plasmid;
    }
    global.stats.phage += new_phage;

    cores += new_cores;
    global.stats.cores += new_cores;

    let srace = races[god].type !== 'synthetic' ? god : (global.race.hasOwnProperty('srace') ? global.race.srace : god);
    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        srace: srace,
        Plasmid: { count: plasmid, anti: antiplasmid },
        Phage: { count: phage },
        Dark: { count: dark },
        Harmony: { count: global.race.Harmony.count },
        AICore: { count: cores },
        universe: global.race.universe,
        seeded: false,
        seed: Math.floor(Math.seededRandom(10000)),
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
    };
    if (corruption > 0){
        global.race['corruption'] = corruption;
    }

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
        ptrait: atmo,
        geology: geo
    };

    global.tech = { theology: 1 };
    clearStates();
    global.new = true;
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}
