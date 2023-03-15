export var save = window.localStorage;
export var global = {
    seed: 1,
    warseed: 1,
    resource: {},
    evolution: {},
    tech: {},
    city: {},
    space: {},
    interstellar: {},
    portal: {},
    tauceti: {},
    civic: {},
    race: {},
    genes: {},
    blood: {},
    stats: {
        start: Date.now(),
        days: 0,
        tdays: 0
    },
    event: {
        t: 200,
        l: false
    },
    m_event: {
        t: 499,
        l: false
    }
};
export var tmp_vars = {};
export var breakdown = {
    c: {},
    p: {}
};
export var power_generated = {};
export var p_on = {};
export var support_on = {};
export var int_on = {};
export var gal_on = {};
export var spire_on = {};
export var quantum_level = 0;
export var achieve_level = 0;
export var universe_level = 0;
export function set_qlevel(q_level){
    quantum_level = q_level;
}
export function set_alevel(a_level){
    achieve_level = a_level;
}
export function set_ulevel(u_level){
    universe_level = u_level;
}
export var hell_reports = {};
export var hell_graphs = {};
export var message_logs = {
    view: 'all'
};
export const message_filters = ['all','progress','queue','building_queue','research_queue','combat','spy','events','major_events','minor_events','achievements','hell'];

Math.rand = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

Math.seed = 2;
Math.war = 2;
Math.seededRandom = function(min, max, alt) {
    max = max || 1;
    min = min || 0;

    Math[alt ? 'war' : 'seed'] = (Math[alt ? 'war' : 'seed'] * 9301 + 49297) % 233280;
    let rnd = Math[alt ? 'war' : 'seed']/ 233280;
    global[alt ? 'warseed' : 'seed'] = Math[alt ? 'war' : 'seed'];
    return min + rnd * (max - min);
}

{
    let global_data = save.getItem('evolved') || false;
    if (global_data) {
        // Load pre-existing game data
        let saveState = JSON.parse(LZString.decompressFromUTF16(global_data));

        if (saveState){
            global = saveState;
            Math.seed = global.seed;
            Math.war = global.hasOwnProperty('warseed') ? global.warseed : (global.seed + 1);
        }
        else {
            newGameData();
        }
    }
    else {
        newGameData();
    }
}

export function setGlobal(gameState) {
    global = gameState;
}

if (!global['version']){
    global['version'] = '0.2.0';
}

if (convertVersion(global['version']) < 2060){
    Object.keys(global.resource).forEach(function (res){
        if (global.resource[res].crates){
            global.resource[res].crates = Math.ceil(global.resource[res].crates / 5);
        }
        if (global.resource[res].containers){
            global.resource[res].containers = Math.ceil(global.resource[res].containers / 5);
        }
    });
}

if (convertVersion(global['version']) < 2062 && global.civic.taxes !== undefined){
    switch(Number(global.civic.taxes.tax_rate)){
        case 0:
            global.civic.taxes.tax_rate = 0;
            break;
        case 1:
            global.civic.taxes.tax_rate = 10;
            break;
        case 2:
            global.civic.taxes.tax_rate = 20;
            break;
        case 3:
            global.civic.taxes.tax_rate = 30;
            break;
        case 4:
            global.civic.taxes.tax_rate = 40;
            break;
        case 5:
            global.civic.taxes.tax_rate = 50;
            break;
    }
}

if (convertVersion(global['version']) === 2062 && global.civic.taxes !== undefined){
    if (global.civic.taxes.tax_rate == 2){
        global.civic.taxes.tax_rate = 20;
    }
}

if (convertVersion(global['version']) < 2065 && global.race !== undefined && global.race.species === 'sporgar'){
    delete global.race['crafty'];
    delete global.race['hydrophilic'];
    global.race['infectious'] = 1;
    global.race['parasite'] = 1;
    if (!global.tech['military'] && global.tech['primitive'] && global.tech['primitive'] >= 3){
        global.civic['garrison'].display = true;
        global.settings.showCivic = true;
        global.city['garrison'] = { count: 0 };
    }
}

if (convertVersion(global['version']) < 3002 && global['space']){
    if (global.tech['space'] && global.tech['space'] >= 4){
        if (!global.space['living_quarters']){
            global.space['living_quarters'] = { count: 0, on: 0 };
        }
        if (!global.space['garage']){
            global.space['garage'] = { count: 0 };
        }
        if (!global.space['red_mine']){
            global.space['red_mine'] = { count: 0, on: 0 };
        }
        if (!global.space['fabrication']){
            global.space['fabrication'] = { count: 0, on: 0 };
        }
        if (!global.space['laboratory']){
            global.space['laboratory'] = { count: 0, on: 0 };
        }
    }

    if (global.tech['space'] && global.tech['space'] >= 3){
        if (!global.space['iridium_mine']){
            global.space['iridium_mine'] = { count: 0, on: 0 };
        }
        if (!global.space['helium_mine']){
            global.space['helium_mine'] = { count: 0, on: 0 };
        }
    }

    if (global.tech['hell']){
        if (!global.space['geothermal']){
            global.space['geothermal'] = { count: 0, on: 0 };
        }
    }
}

if (convertVersion(global['version']) < 3004 && global['settings'] && global.settings['space'] && global.settings.space.belt){
    global.space['space_station'] = { count: 0, on: 0, support: 0, s_max: 0 };
}

if (convertVersion(global['version']) < 4001 && global['city'] && global.city['factory'] && !global.city.factory['Nano']){
    global.city.factory['Nano'] = 0;
}

if (convertVersion(global['version']) < 4003 && global.stats['achieve']){
    Object.keys(global.stats.achieve).forEach(function (key){
        global.stats.achieve[key] = 1;
    });
}

if (convertVersion(global['version']) < 4028 && global.stats['achieve'] && global.stats.achieve['genus_demonic']){
    global.stats.achieve['biome_hellscape'] = global.stats.achieve['genus_demonic'];
}

if (convertVersion(global['version']) < 4029 && global.race['mutation'] && global.race['mutation'] > 0){
    global['resource']['Genes'] = {
        name: 'Genes',
        display: true,
        value: 0,
        amount: 0,
        crates: 0,
        diff: 0,
        delta: 0,
        max: -2,
        rate: 0
    };

    for (let i=0; i<global.race.mutation; i++){
        global.resource.Genes.amount += i + 1;
    }
}

if (convertVersion(global['version']) < 4031){
    if (global.tech && global.tech['gambling'] && global.tech['gambling'] === 2){
        global.tech['gambling'] = 3;
        global.city.casino['on'] = 0;
    }
    if (global.tech['hunting'] && global.tech['hunting'] >= 3){
        global.tech['wind_plant'] = 1;
        global.tech['hunting'] = 2;
    }
    let races = [ "Human", "Humano", "Elf", "Elfo", "Orc", "Cath", "Wolven", "Centaur", "Centauro", "Kobold", "Goblin", "Gnome", "Ogre", "Ogro", "Cyclops", "Ciclope", "Troll", "Tortoisan", "Gecko", "Slitheryn", "Arraak", "Pterodacti", "Dracnid", "Ent", "Cacti", "Sporgar", "Shroomi", "Mantis", "Scorpid", "Antid", "Sharkin", "Octigoran", "Balorg", "Imp" ]
    for (let i=0; i<races.length; i++){
        if (global.resource[races[i]]){
            global.resource[global.race.species] = global.resource[races[i]];
            delete global.resource[races[i]];
            break;
        }
    }
}

if (convertVersion(global['version']) < 4032){
    if (global.race.species === 'balorg'){
        global.race['slaver'] = 1;
    }
}

if (convertVersion(global['version']) < 5000){
    global['portal'] = {};
    if (global['city'] && global.city['factory'] && !global.city.factory['Stanene']){
        global.city.factory['Stanene'] = 0;
    }
}

if (convertVersion(global['version']) === 5000){
    if (global.civic['craftsman']){
        global.civic.craftsman['assigned'] = 0;
        if (global.city['foundry']){
            let workers = global.city.foundry.Plywood + global.city.foundry.Brick + global.city.foundry.Wrought_Iron + global.city.foundry.Sheet_Metal + global.city.foundry.Mythril + global.city.foundry.Aerogel;
            global.civic.craftsman.workers = workers;
        }
    }
}

if (convertVersion(global['version']) <= 5008 && global['queue'] && global['queue']['queue']){
    global.queue.queue = [];
}

if (convertVersion(global['version']) <= 5011 && global.stats['died']){
    global.stats['attacks'] = global.stats['died'];
}

if (convertVersion(global['version']) <= 5016 && global.race.species === 'mantis'){
    delete global.race['frail'];
    global.race['cannibalize'] = 1;
    global.city['s_alter'] = {
        count: 0,
        rage: 0,
        mind: 0,
        regen: 0,
        mine: 0,
        harvest: 0,
    };
}

if (convertVersion(global['version']) < 6000){
    if (global.race.species === 'imp' || global.race.species === 'balorg'){
        global.race['soul_eater'] = 1;
    }
}

if (convertVersion(global['version']) < 6001){
    if (global.stats['achieve']){
        Object.keys(global.stats.achieve).forEach(function (key){
            if (!global.stats.achieve[key]['l']){
                global.stats.achieve[key] = { l: global.stats.achieve[key] };
            }
        });
    }
}

if (convertVersion(global['version']) < 6004 && global.city['windmill'] && !global.race['soul_eater'] && !global.race['carnivore']){
    delete global.city['windmill'];
}

if (convertVersion(global['version']) < 6006 && !global.city['windmill'] && global.tech['wind_plant'] && (global.race['soul_eater'] || global.race['carnivore'])){
    global.city['windmill'] = { count: 0 };
}

if (convertVersion(global['version']) < 6006 && global.tech['wind_plant'] && !global.race['soul_eater'] && !global.race['carnivore']){
    delete global.tech['wind_plant'];
}

if (convertVersion(global['version']) <= 6008 && global['r_queue'] && global['r_queue']['queue']){
    for (let i=0; i<global.r_queue.queue.length; i++){
        global.r_queue.queue[i]['time'] = 0;
    }
}

if (convertVersion(global['version']) < 6010 && global.race['Plasmid']){
    if (global.race.Plasmid.anti < 0){
        global.race.Plasmid.anti = 0;
    }
    if (global.race.Plasmid.count < 0){
        global.race.Plasmid.count = 0;
    }

    if (global.tech['foundry'] && !global.race['kindling_kindred']){
        global.resource.Plywood.display = true;
    }
}

if (convertVersion(global['version']) < 6011 && !global.city['ptrait']){
    global.city['ptrait'] = 'none';
}

if (convertVersion(global['version']) < 6012 && global.portal['fortress']){
    global.portal.fortress['s_ntfy'] = 'Yes';
}

if (convertVersion(global['version']) < 6014){
    if (global.race['noble'] && global.tech['currency'] && global.tech['currency'] === 4){
        global.tech['currency'] = 5;
    }
    if (global['settings']){
        global.settings['cLabels'] = true;
    }
}

if (convertVersion(global['version']) < 6016 && global.stats && global.stats['reset'] && global.stats['achieve']){
    global.stats['mad'] = global.stats['reset'];
    global.stats['bioseed'] = 0;
    global.stats['blackhole'] = 0;
    let blkhle = ['whitehole','heavy','canceled','eviltwin','microbang'];
    for (let i=0; i<blkhle.length; i++){
        if (global.stats.achieve[blkhle[i]]){
            global.stats['blackhole']++;
            global.stats['mad']--;
        }
    }
    let genus = ['genus_humanoid','genus_animal','genus_small','genus_giant','genus_reptilian','genus_avian','genus_insectoid','genus_plant','genus_fungi','genus_aquatic','genus_demonic','genus_angelic'];
    for (let i=0; i<genus.length; i++){
        if (global.stats.achieve[genus[i]]){
            global.stats['bioseed']++;
            global.stats['mad']--;
        }
    }
}

if (convertVersion(global['version']) < 6018){
    if (global['space'] && global.space['swarm_satellite']){
        global.space['swarm_satellite'].count *= 2;
    }
}

if (convertVersion(global['version']) < 6020 && global.race['mutation'] && global.race['universe'] && global.race['universe'] === 'antimatter' && global.race['mutation'] > 0){
    let a_level = 1;
    if (global.race['no_trade']){ a_level++; }
    if (global.race['no_craft']){ a_level++; }
    if (global.race['no_crispr']){ a_level++; }
    if (global.race['weak_mastery']){ a_level++; }
    global.stats.achieve['cross'] = { l: a_level, a: a_level };
}

if (convertVersion(global['version']) < 7000){
    if (!global.civic['govern']){
        global.civic['govern'] = {
            type: 'oligarchy',
            rev: 0,
            fr: 0,
        };
    }
}

if (convertVersion(global['version']) < 7004 && global['queue'] && global['queue']['queue']){
    for (let i=0; i<global.queue.queue.length; i++){
        global.queue.queue[i]['q'] = 1;
        global.queue.queue[i]['t_max'] = global.queue.queue[i]['time'];
    }
}

if (convertVersion(global['version']) < 7007 && global['queue'] && global['queue']['queue']){
    for (let i=0; i<global.queue.queue.length; i++){
        global.queue.queue[i]['qs'] = 1;
    }
}

if (convertVersion(global['version']) < 7019 && global.race['fraile']){
    delete global.race['fraile'];
    global.race['frail'] = 1;
}

if (convertVersion(global['version']) < 7028){
    if (global.stats['achieve'] && global.stats.achieve['blood_war'] && global.stats.achieve['blood_war']['e']){
        global.stats.achieve['blood_war'].e = undefined;
    }
}

if (convertVersion(global['version']) < 8000 && global.civic['foreign']){
    if (typeof global.civic.foreign.gov0['anx'] === 'undefined'){
        global.civic.foreign.gov0['anx'] = false;
    }
    if (typeof global.civic.foreign.gov1['anx'] === 'undefined'){
        global.civic.foreign.gov1['anx'] = false;
    }
    if (typeof global.civic.foreign.gov2['anx'] === 'undefined'){
        global.civic.foreign.gov2['anx'] = false;
    }
    if (typeof global.civic.foreign.gov0['buy'] === 'undefined'){
        global.civic.foreign.gov0['buy'] = false;
    }
    if (typeof global.civic.foreign.gov1['buy'] === 'undefined'){
        global.civic.foreign.gov1['buy'] = false;
    }
    if (typeof global.civic.foreign.gov2['buy'] === 'undefined'){
        global.civic.foreign.gov2['buy'] = false;
    }
}

if (convertVersion(global['version']) < 8000){
    if (global['settings'] && global.settings.hasOwnProperty('tLabels')){
        delete global.settings['tLabels'];
    }
}

if (convertVersion(global['version']) < 8003){
    if (global.stats['harmony'] && global.stats['harmony'] > 0){
        global.stats['harmony'] = parseFloat(global.stats['harmony'].toFixed(2));
        global.race['Harmony'].count = parseFloat(global.race['Harmony'].count.toFixed(2));
    }
}

if (convertVersion(global['version']) < 8017){
    if (global.city['garrison']){
        global.city.garrison['on'] = global.city['garrison'].count;
    }
}

if (convertVersion(global['version']) < 9005){
    if (global.race.hasOwnProperty('terrifying') && global.tech.hasOwnProperty('gambling') && !global.space.hasOwnProperty('spc_casino')){
        global.space['spc_casino'] = { count: 0, on: 0 };
    }
}

if (convertVersion(global['version']) < 9009){
    if (global.genes.hasOwnProperty('ancients') && global.genes['ancients'] >= 3){
        if (global.genes['ancients'] === 4){
            global.genes['ancients'] = 5;
        }
        else {
            global.race.Plasmid.count += 300;
        }
    }
}

if (convertVersion(global['version']) < 9010){
    ['species', 'gods', 'old_gods'].forEach(field => {
        if (global.race[field] === 'orge') { global.race[field] = 'ogre'; } // prior to 0.9.10 this was misspelled in the codebase
    })
    if (global.stats.hasOwnProperty('achieve') && global.stats.achieve.hasOwnProperty('extinct_orge')){
        global.stats.achieve['extinct_ogre'] = global.stats.achieve['extinct_orge'];
        delete global.stats.achieve['extinct_orge'];
    }
    if (global.resource.hasOwnProperty('orge')){
        global.resource['ogre'] = global.resource['orge'];
        delete global.resource['orge'];
    }
    if (global['city'] && global.city['factory'] && !global.city.factory['Furs']){
        global.city.factory['Furs'] = 0;
    }
}

if (convertVersion(global['version']) < 9014){
    ['seraph', 'unicorn', 'custom'].forEach(field => {
        if (global.race.species === field) {
            if ((field === 'custom' && global.hasOwnProperty('custom') && global.custom.race0.genus === 'angelic') || field !== 'custom'){
                global.race['holy'] = 1;
            }
        }
    });
    if (global.hasOwnProperty('arpa') && global.arpa.hasOwnProperty('sequence')){
        global.arpa.sequence['labs'] = 0;
    }
}

if (convertVersion(global['version']) < 100000){
    delete global.city['lumber'];
    delete global.city['stone'];
    
    global.stats['dark'] = 0;
    if (global.race['Dark']){
        global.stats['dark'] = global.race['Dark'].count;
    }

    if (global.city.hasOwnProperty('smelter')){
        if (!global.city.smelter.hasOwnProperty('Star')){
            global.city.smelter['Star'] = 0;
        }
        if (!global.city.smelter.hasOwnProperty('StarCap')){
            global.city.smelter['StarCap'] = 0;
        }
        if (!global.city.smelter.hasOwnProperty('Inferno')){
            global.city.smelter['Inferno'] = 0;
        }
    }

    if (!global.hasOwnProperty('warseed')){
        global['warseed'] = global.seed + 1;
        Math.war = global.hasOwnProperty('warseed') ? global.warseed : global.seed;
    }

    if (global.portal.hasOwnProperty('bireme')){
        global.portal.bireme['crew'] = 0;
        global.portal.bireme['mil'] = 0;
    }

    if (global.portal.hasOwnProperty('transport')){
        global.portal.transport['crew'] = 0;
        global.portal.transport['mil'] = 0;
        if (!global.portal.transport['cargo']){
            global.portal.transport['cargo'] = {
                used: 0, max: 0,
                Crystal: 0, Lumber: 0,
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
                Stanene: 0, Bolognium: 0,
                Vitreloy: 0, Orichalcum: 0,
                Plywood: 0, Brick: 0,
                Wrought_Iron: 0, Sheet_Metal: 0,
                Mythril: 0, Aerogel: 0,
                Nanoweave: 0, Scarletite: 0
            };
        }
    }

    if (global.hasOwnProperty('settings') && global.settings.portal && global.settings.portal.spire && !global.portal.hasOwnProperty('purifier')){
        global.settings.portal.spire = false;
    }

    if (global.portal.hasOwnProperty('mechbay') && !Array.isArray(global.portal.mechbay.mechs)){
        global.portal.mechbay.mechs = [];
    }

    if (global.portal['transport'] && global.portal.transport.count >= 1 && !global.tech['hell_spire']){
        global.tech['hell_spire'] = 1;
        global.settings.portal.spire = true;
        global.settings.showCargo = true;
        global.portal['purifier'] = { count: 0, on: 0, support: 0, s_max: 0, supply: 0, sup_max: 100, diff: 0 };
        global.portal['port'] = { count: 0, on: 0 };
    }

    if (global.tech.hasOwnProperty('waygate') && !global.portal.hasOwnProperty('waygate')){
        delete global.tech['waygate'];
    }

    if (!global.hasOwnProperty('blood')){
        global['blood'] = {};
    }
}

if (convertVersion(global['version']) < 100013){
    if (global.hasOwnProperty('settings') && global.settings.hasOwnProperty('showPowerGrid') && global.hasOwnProperty('race') && global.race['infiltrator'] && global.hasOwnProperty('tech') && global.tech.hasOwnProperty('high_tech') && global.tech.high_tech >= 2){
        global.settings.showPowerGrid = true;
    }
}

if (convertVersion(global['version']) < 100014){
    if (global.race['Dark']){
        global.stats['dark'] = global.race['Dark'].count;
    }
    if (global.race['casting'] && global.race['evil']){
        global.race.casting.total -= global.race.casting.lumberjack;
        global.race.casting.lumberjack = 0;
    }
    if (global['queue'] && global['queue']['queue']){
        for (let i=0; i<global.queue.queue.length; i++){
            if (global.queue.queue[i].type === 'arpa'){
                global.queue.queue[i].type = global.queue.queue[i].action;
                global.queue.queue[i].action = 'arpa';
            }
        }
    }
}

if (convertVersion(global['version']) < 100015){
    if (global.race['cataclysm']){
        global.settings.showPowerGrid = true;
    }
}

if (convertVersion(global['version']) < 100016){
    ['l','a','e','h','m','mg'].forEach(function(affix){
        if (global.stats.hasOwnProperty('spire') && global.stats.spire.hasOwnProperty(affix) && global.stats.spire[affix].hasOwnProperty('lord')){
            global.stats.spire[affix]['dlstr'] = global.stats.spire[affix].lord;
        }
    });

    if (global.hasOwnProperty('special') && global.special.hasOwnProperty('gift') && global.special.gift){
        global.special.gift = { g2019: true };
    }
}

if (convertVersion(global['version']) < 100017){
    if (global.hasOwnProperty('settings') && !global.settings.hasOwnProperty('font')){
        global.settings['font'] = 'standard';
    }

    if (global.hasOwnProperty('lastMsg') && global.lastMsg){
        global.lastMsg = [global.lastMsg];
    }
}

if (convertVersion(global['version']) < 100023){
    if (global.city.hasOwnProperty('rock_quarry')){
        global.city.rock_quarry['asbestos'] = 50;
    }

    if (global.race['smoldering']){
        global.resource['Chrysotile'] = {
            name: 'Chrysotile', display: true, value: 5, amount: 0,
            crates: 0, diff: 0, delta: 0, max: 200, rate: 1
        };
        if (!global.race['kindling_kindred']){
            global.resource.Lumber.display = false;
            global.resource.Crates.amount += global.resource.Lumber.crates;
            global.resource.Lumber.crates = 0;
            global.resource.Containers.amount += global.resource.Lumber.containers;
            global.resource.Lumber.containers = 0;
            global.resource.Lumber.trade = 0;
            global.resource.Plywood.display = false;
            if (global.city['sawmill']){ delete global.city['sawmill']; }
            if (global.city['graveyard']){ delete global.city['graveyard']; }
            if (global.city['lumber_yard']){ delete global.city['lumber_yard']; }
            delete global.tech['axe']; delete global.tech['reclaimer']; delete global.tech['saw'];
            global.civic.lumberjack.display = false;
            global.civic.lumberjack.workers = 0;
            if (global.civic.d_job === 'lumberjack') { global.civic.d_job = 'unemployed'; }
            if (global.race['casting']){
                global.race.casting.total -= global.race.casting.lumberjack;
                global.race.casting.lumberjack = 0;
            }
            if (global.tech['foundry']){
                global.civic.craftsman.workers -= global.city.foundry['Plywood'];
                global.city.foundry.crafting -= global.city.foundry['Plywood'];
                global.city.foundry['Plywood'] = 0;
            }
            if (global.city['s_alter']) { global.city.s_alter.harvest = 0; }
            if (global.interstellar['mass_ejector']){
                global.interstellar.mass_ejector.total -= global.interstellar.mass_ejector.Lumber;
                global.interstellar.mass_ejector.Lumber = 0;
            }
        }
    }
}

if (convertVersion(global['version']) < 100025){
    if (global.race['casting'] && global.race['smoldering']){
        global.race.casting.total -= global.race.casting.lumberjack;
        global.race.casting.lumberjack = 0;
    }
}

if (convertVersion(global['version']) < 100032){
    if (global.civic.hasOwnProperty('free')){
        global.civic['hunter'] = {
            job: 'hunter',
            display: global.race['carnivore'] || global.race['soul_eater'],
            workers: global.race['carnivore'] || global.race['soul_eater'] ? global.civic.free : 0,
            max: -1
        };
        global.civic['unemployed'] = {
            job: 'unemployed',
            display: !(global.race['carnivore'] || global.race['soul_eater']),
            workers: global.race['carnivore'] || global.race['soul_eater'] ? 0 : global.civic.free,
            max: -1
        };
        if (global.civic.d_job === 'unemployed' && (global.race['carnivore'] || global.race['soul_eater'])){
            global.civic.d_job = 'hunter';
        }
        delete global.civic.free;
    }
}

if (convertVersion(global['version']) < 100033){
    if (global.hasOwnProperty('special') && global.special.hasOwnProperty('egg')){
        global.special.egg['2020'] = JSON.parse(JSON.stringify(global.special['egg']));
        delete global.special.egg.egg1;
        delete global.special.egg.egg2;
        delete global.special.egg.egg3;
        delete global.special.egg.egg4;
        delete global.special.egg.egg5;
        delete global.special.egg.egg6;
        delete global.special.egg.egg7;
        delete global.special.egg.egg8;
        delete global.special.egg.egg9;
        delete global.special.egg.egg10;
        delete global.special.egg.egg11;
        delete global.special.egg.egg12;
    }
}

if (convertVersion(global['version']) < 100035){
    if (global.race['terrifying']){
        delete global.tech['trade'];
        delete global.city['trade'];
    }
}

if (convertVersion(global['version']) < 100040){
    const dt = new Date();
    if (dt.getFullYear() === 2021 && dt.getMonth() === 3 && dt.getDate() <= 14 && global.race.hasOwnProperty('species') && global.race.species === 'wolven'){
        global.race['hrt'] = 'wolven';
    }
}

if (convertVersion(global['version']) < 100041){
    global['event'] = {
        t: 499,
        l: false
    };
    global['m_event'] = {
        t: 99,
        l: false
    };
}

if (convertVersion(global['version']) < 101000){
    if (global.race['jtype'] && global.race['jtype'] === 'animal'){
        global.race['jtype'] = 'omnivore';
    }
    if (global.hasOwnProperty('custom') && global.custom.hasOwnProperty('race0') && global.custom.race0.hasOwnProperty('genus') && global.custom.race0.genus === 'animal'){
        global.custom.race0.genus = 'omnivore';
    }
    if (global.portal.hasOwnProperty('mechbay')){
        for (let i=0; i<global.portal.mechbay.mechs.length; i++){
            if (!global.portal.mechbay.mechs[i].hasOwnProperty('infernal')){
                global.portal.mechbay.mechs[i]['infernal'] = false;
            }
        }
    }
    if (global.hasOwnProperty('stats') && global.stats.hasOwnProperty('achieve') && global.stats.achieve.hasOwnProperty('genus_animal')){
        global.stats.achieve['genus_carnivore'] = global.stats.achieve.genus_animal;
        delete global.stats.achieve.genus_animal;
    }
}

if (convertVersion(global['version']) < 101001){
    if (global.hasOwnProperty('race') && global.race.hasOwnProperty('governor') && global.race.governor.hasOwnProperty('config') && global.race.governor.config.hasOwnProperty('merc')){
        global.race.governor.config.merc['reserve'] = 100;
    }
}

if (convertVersion(global['version']) < 101002){
    if (global.race.hasOwnProperty('frenzy')){
        global.race['blood_thirst'] = global.race['frenzy'];
        delete global.race['frenzy'];
        if (global.city.hasOwnProperty('morale') && global.city.morale.hasOwnProperty('frenzy')){
            global.city.morale['blood_thirst'] = global.city.morale['frenzy'];
            delete global.city.morale['frenzy'];
        }
    }

    if (global.hasOwnProperty('custom') && global.custom.hasOwnProperty('race0') && global.custom.race0.hasOwnProperty('traits')){
        for (let i=0; i<global.custom.race0.traits.length; i++){
            if (global.custom.race0.traits[i] === 'frenzy'){
                global.custom.race0.traits[i] = 'blood_thirst';
            }
        }
    }
    
    if (global.race['jtype'] && global.race['jtype'] === 'omnivore'){
        global.race['jtype'] = 'carnivore';
    }
    if (global.hasOwnProperty('custom') && global.custom.hasOwnProperty('race0') && global.custom.race0.hasOwnProperty('genus') && global.custom.race0.genus === 'omnivore'){
        global.custom.race0.genus = 'carnivore';
    }
}

if (convertVersion(global['version']) < 101010){
    if (global.hasOwnProperty('settings') && !global.settings.hasOwnProperty('q_merge')){
        global.settings['q_merge'] = 'merge_nearby';
    }
}

if (convertVersion(global['version']) < 101011){
    if (global.hasOwnProperty('settings') && !global.settings.hasOwnProperty('msgFilters')){
        global.settings['msgFilters'] = {
            all: true,
            progress: true,
            queue: global['queue'] && global.queue.display,
            building_queue: global['r_queue'] && global.r_queue.display,
            research_queue: global['r_queue'] && global.r_queue.display,
            combat: global.civic['garrison'] && global.civic.garrison.display,
            spy: global.tech['spy'] && global.tech.spy >= 2,
            events: true,
            major_events: true,
            minor_events: true,
            achievements: (global.stats['achieve'] && Object.keys(global.stats.achieve).length > 0) || (global.stats['feat'] && Object.keys(global.stats.feat).length > 0),
            hell: global.settings.showPortal || global.stats.blackhole || global.stats.ascend || global.stats.descend
        }
    }
    if (global.race.hasOwnProperty('inflation')){
        ['supercollider','stock_exchange','launch_facility','monuments','railway','roid_eject','nexus','syphon'].forEach(function(arpa){
            if (global.tech.hasOwnProperty(arpa)){
                global.race.inflation += global.tech[arpa] * 10;
            }
        });
    }
}

if (convertVersion(global['version']) < 101012){
    if (global.civic['garrison']){
        global.civic.garrison['rate'] = 0;
    }
} 

if (convertVersion(global['version']) < 101014){
    if (global.hasOwnProperty('settings') && global.settings.hasOwnProperty('msgFilters')){
        Object.keys(global.settings.msgFilters).forEach(function (filter){
            global.settings.msgFilters[filter] = {
                unlocked: global.settings.msgFilters[filter] ? true : false,
                vis: global.settings.msgFilters[filter] ? true : false,
                max: 60,
                save: 3
            };
        });
    }
    if (global.hasOwnProperty('lastMsg') && global.lastMsg){
        let lastMsg = {};
        message_filters.forEach(function (filter){
            lastMsg[filter] = [];
        });
        global.lastMsg.forEach(function (msg){
            if (msg.t){
                msg.t.forEach(function (tag){
                    lastMsg[tag].push({ m: msg.m, c: msg.c });
                });
            }
            else {
                lastMsg.all.push({ m: msg.m, c: msg.c })
            }
        });
        global.lastMsg = lastMsg;
    }
}

if (convertVersion(global['version']) <= 101014 && !global['revision']){
    if (global.race['cataclysm'] && global.race['universe'] && global.race['universe'] === 'magic' && global.tech['magic'] && global.tech['magic'] >= 2){
        global.space['pylon'] = { count: 0 };
    }
}

if (convertVersion(global['version']) < 101015){
    if (global.hasOwnProperty('special') && global.special.hasOwnProperty('trick')){
        global.special.trick['2020'] = JSON.parse(JSON.stringify(global.special['trick']));
        delete global.special.trick.trick1;
        delete global.special.trick.trick2;
        delete global.special.trick.trick3;
        delete global.special.trick.trick4;
        delete global.special.trick.trick5;
        delete global.special.trick.trick6;
        delete global.special.trick.trick7;
        delete global.special.trick.trick8;
        delete global.special.trick.trick9;
        delete global.special.trick.trick10;
        delete global.special.trick.trick11;
        delete global.special.trick.trick12;
    }
}

if (convertVersion(global['version']) < 102000){
    if (global.hasOwnProperty('portal') && global.portal.hasOwnProperty('fortress') && !global.portal.fortress.hasOwnProperty('nocrew')){
        global.portal.fortress['nocrew'] = false;
    }
    if (global.city.hasOwnProperty('smelter') && !global.city.smelter.hasOwnProperty('Iridium')){
        global.city.smelter['Iridium'] = 0;
    }
    if (global.hasOwnProperty('portal') && global.portal.hasOwnProperty('mechbay') && !global.portal.mechbay.hasOwnProperty('active')){
        global.portal.mechbay['active'] = 0;
        global.portal.mechbay['scouts'] = 0;
    }
}

if (convertVersion(global['version']) < 102001){
    if (global.race['blood_thirst'] && global.race.blood_thirst > 3){
        global.race.blood_thirst = 1;
    }
    if (global.race['rainbow'] && global.race.rainbow > 3){
        global.race.rainbow = 1;
    }
}

if (convertVersion(global['version']) < 102005){
    if (!global.stats['cores'] && global.race.hasOwnProperty('AICore')){
        global.stats['cores'] = global.race.AICore.count;
    }
}

if (convertVersion(global['version']) < 102006){
    if (global.race['artifical']){
        if (global.race['calm']){
            if (global.resource.hasOwnProperty('Zen')){
                global.resource.Zen.display = true;
            }
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
    }
}

if (convertVersion(global['version']) < 102007){
    if (global.stats.hasOwnProperty('achieve')){
        delete global.stats.achieve['extinct_sludge'];
    }
}

if (convertVersion(global['version']) < 102012){
    if (global.city.hasOwnProperty('ptrait')){
        global.city.ptrait = global.city.ptrait === 'none' ? [] : [global.city.ptrait];
    }
    if (global.tech['hell_ruins'] && global.tech.hell_ruins >= 3){
        global.tech['hell_vault'] = 1;
    }
}

if (convertVersion(global['version']) < 102015){
    if (global.race.hasOwnProperty('governor') && global.race.governor.hasOwnProperty('tasks')){
        for (let task in global.race.governor.tasks) {
            if (global.race.governor.tasks[task] === 'asssemble'){
                global.race.governor.tasks[task] = 'assemble';
            }
        }
    }
    if (global['settings'] && global.settings.hasOwnProperty('restoreCheck')){
        delete global.settings['restoreCheck'];
    }
}

if (convertVersion(global['version']) < 102017){
    if (global.portal.hasOwnProperty('fortress')){
        global.portal.observe = {
            settings: {
                expanded: false,
                average: false,
                hyperSlow: false,
                display: 'game_days',
                dropKills: true,
                dropGems: true
            },
            stats: {
                total: {
                    start: { year: global.city.calendar.year, day: global.city.calendar.day },
                    days: 0,
                    wounded: 0, died: 0, revived: 0, surveyors: 0, sieges: 0,
                    kills: {
                        drones: 0,
                        patrols: 0,
                        sieges: 0,
                        guns: 0,
                        soul_forge: 0,
                        turrets: 0
                    },
                    gems: {
                        patrols: 0,
                        guns: 0,
                        soul_forge: 0,
                        crafted: 0,
                        turrets: 0
                    },
                },
                period: {
                    start: { year: global.city.calendar.year, day: global.city.calendar.day },
                    days: 0,
                    wounded: 0, died: 0, revived: 0, surveyors: 0, sieges: 0,
                    kills: {
                        drones: 0,
                        patrols: 0,
                        sieges: 0,
                        guns: 0,
                        soul_forge: 0,
                        turrets: 0
                    },
                    gems: {
                        patrols: 0,
                        guns: 0,
                        soul_forge: 0,
                        crafted: 0,
                        turrets: 0
                    },
                }
            },
            graphID: 0,
            graphs: {}
        };
    }
    if (global.tech.hasOwnProperty('genetics') && global.tech.genetics > 1 && global.hasOwnProperty('arpa')){
        if (!global.arpa.hasOwnProperty('sequence')){
            global.arpa['sequence'] = {
                max: 50000,
                progress: 0,
                time: 50000,
                on: false
            };
        }
        if (!global.arpa.sequence['boost']){
            global.arpa.sequence['boost'] = false;
        }
        if (!global.arpa.sequence['auto']){
            global.arpa.sequence['auto'] = false;
        }
        if (!global.arpa.sequence['labs']){
            global.arpa.sequence['labs'] = 0;
        }
    }
}

if (convertVersion(global['version']) < 102021){
    if (global.hasOwnProperty('custom') && !global.custom.hasOwnProperty('race0')){
        let race = global.race.hasOwnProperty('species') ? global.race.species : 'protoplasm';
        if (global.galaxy.hasOwnProperty('alien1') && global.galaxy.alien1.id === 'custom'){
            global.galaxy.alien1.id = race === 'human' ? 'elven' : 'human';
        }
        if (global.galaxy.hasOwnProperty('alien2') && global.galaxy.alien2.id === 'custom'){
            global.galaxy.alien2.id = race === 'orc' || global.galaxy.alien1.id === 'orc' ? 'cath' : 'orc';
        }
    }
}

if (convertVersion(global['version']) < 103000){
    if (!global.hasOwnProperty('tauceti')){
        global['tauceti'] = {};
    }

    if (global.race.species === 'protoplasm'){
        if (global.evolution.hasOwnProperty('sexual_reproduction')){
            global.tech['evo'] = global.evolution.sexual_reproduction.count > 0 ? 2 : 1;
            delete global.evolution['sexual_reproduction'];
        }
        [
            ['phagocytosis', {evo: 3, evo_animal: 1}],
            ['chloroplasts', {evo: 3, evo_plant: 1}],
            ['chitin', {evo: 3, evo_fungi: 1}],
            ['exterminate', {evo: 7, evo_synthetic: 2}],
            ['multicellular', {evo: 4}],
            ['spores', {evo: 5}],
            ['poikilohydric', {evo: 5}],
            ['bilateral_symmetry', {evo: 5, evo_insectoid: 1, evo_mammals: 1, evo_eggshell: 1, evo_aquatic: 1, evo_fey: 1, evo_sand: 1, evo_heat: 1, evo_polar: 1}],
            ['bryophyte', {evo: 7}],
            ['athropods', {evo: 7, evo_insectoid: 2}],
            ['mammals', {evo: 6, evo_humanoid: 1, evo_giant: 1, evo_small: 1, evo_animalism: 1, evo_demonic: 1, evo_angelic: 1}],
            ['humanoid', {evo: 7, evo_humanoid: 2}],
            ['gigantism', {evo: 7, evo_giant: 2}],
            ['dwarfism', {evo: 7, evo_small: 2}],
            ['animalism', {evo: 7, evo_animalism: 2}],
            ['carnivore', {evo_animalism: 3, evo_carnivore: 2}],
            ['herbivore', {evo_animalism: 3, evo_herbivore: 2}],
            ['omnivore', {evo_animalism: 3, evo_omnivore: 2}],
            ['celestial', {evo: 7, evo_angelic: 2}],
            ['demonic', {evo: 7, evo_demonic: 2}],
            ['aquatic', {evo: 7, evo_aquatic: 2}],
            ['fey', {evo: 7, evo_fey: 2}],
            ['heat', {evo: 7, evo_heat: 2}],
            ['polar', {evo: 7, evo_polar: 2}],
            ['sand', {evo: 7, evo_sand: 2}],
            ['eggshell', {evo: 6, evo_eggshell: 2}],
            ['endothermic', {evo: 7, evo_avian: 2}],
            ['ectothermic', {evo: 7, evo_reptilian: 2}],
            ['bunker', {evo_challenge: 1}]
        ].forEach(function(step){
            if (global.evolution.hasOwnProperty(step[0]) && global.evolution[step[0]].count > 0){
                for (let [key, value] of Object.entries(step[1])){
                    global.tech[key] = value;
                }
            }
            delete global.evolution[step[0]];
        });
        global.evolution['mloaded'] = 1;
        global.evolution['gmloaded'] = 1;
    }
}

if (convertVersion(global['version']) < 103001){
    if (!global.hasOwnProperty('prestige')){
        global.prestige = {};
    }
    if (global.race.Plasmid && global.race.Plasmid.hasOwnProperty('anti')){
        global.prestige['AntiPlasmid'] = { count: global.race.Plasmid.anti };
    }
    ['Plasmid','Phage','AICore','Dark','Harmony'].forEach(function (res){
        if (global.race.hasOwnProperty(res)) {
            global.prestige[res] = { count: global.race[res].count };
            delete global.race[res];
        }
    });
    ['Artifact','Blood_Stone'].forEach(function (res){
        if (global.resource.hasOwnProperty(res)) {
            global.prestige[res] = { count: global.resource[res].amount };
            delete global.resource[res];
        }
    });
    if (!global.stats.hasOwnProperty('synth') && global.race.hasOwnProperty('srace')){
        global.stats['synth'] = {};
        global.stats.synth[global.race.srace] = true;
    }
    if (global.race.hasOwnProperty('governor') && global.race.governor.hasOwnProperty('config') && global.race.governor.config.hasOwnProperty('trash')){
        ['Infernite','Elerium','Copper','Iron'].forEach(function(res){
            if (global.race.governor.config.trash.hasOwnProperty(res) && typeof global.race.governor.config.trash[res] === 'number'){
                global.race.governor.config.trash[res] = { v: global.race.governor.config.trash[res], s: true } ;
            }
        });
    }
}

if (convertVersion(global['version']) < 103002){
    if (global.portal.hasOwnProperty('observe') && global.portal.observe.hasOwnProperty('stats')){
        global.portal.observe.stats.period.gems['surveyors'] = 0;
        global.portal.observe.stats.total.gems['surveyors'] = 0;
    }
}

global['version'] = '1.3.3';
delete global['revision'];
delete global['beta'];

if (!global.hasOwnProperty('prestige')){
    global.prestige = {};
}
['Plasmid','AntiPlasmid','Phage','Dark','Harmony','AICore','Artifact','Blood_Stone'].forEach(function (res){
    if (!global.prestige.hasOwnProperty(res)){
        global.prestige[res] = { count: 0 };
    }
});

if (!global.hasOwnProperty('power')){
    global['power'] = [];       
}

if (!global.hasOwnProperty('support')){
    global['support'] = {};
}

[
    'moon','red','belt','alpha','nebula','gateway','alien2','lake','spire',
    'titan','enceladus','eris','tau_home','tau_red','tau_roid'
].forEach(function(s){
    if (!global.support.hasOwnProperty(s)){
        global.support[s] = [];
    }
});

if (global.civic['cement_worker'] && global.civic.cement_worker.impact === 0.25){
    global.civic.cement_worker.impact = 0.4;
}

if (!global['settings']){
    global['settings'] = {
        showEvolve: true,
        showAchieve: false,
        animated: true,
        disableReset: false,
        font: 'standard',
        q_merge: 'merge_nearby',
        cLabels: true,
        theme: 'gruvboxDark',
        locale: 'en-US',
        icon: 'star'
    };
}

setRegionStates(false);

if (!global.settings['icon']){
    global.settings['icon'] = 'star';
}

if (!global.settings['showResources']){
    global.settings['showResources'] = global.settings['showMarket'];
}

if (!global.settings['showStorage']){
    if (global.city['warehouse'] || global.city['storage_yard']){
        global.settings['showStorage'] = true;
    }
    else {
        global.settings['showStorage'] = false;
    }
}

if (!global.settings['space']){
    global.settings['space'] = {
        home: true,
    }
}

if (!global.settings.hasOwnProperty('touch')){
    global.settings['touch'] = false;
}

if (!global.settings.hasOwnProperty('lowPowerBalance')){
    global.settings['lowPowerBalance'] = false;
}

if (!global['queue']){
    global['queue'] = {
        display: false,
        queue: [],
    };
}

if (!global['r_queue']){
    global['r_queue'] = {
        display: false,
        queue: [],
    };
}

if (!global['queue']['rename']){
    global.queue['rename'] = false;
}

if (!global['queue']['max']){
    global.queue['max'] = 0;
}

if (!global['r_queue']['max']){
    global.r_queue['max'] = 0;
}

if (!global['queue']['pause']){
    global.queue['pause'] = false;
}

if (!global['r_queue']['pause']){
    global.r_queue['pause'] = false;
}

if (!global['lastMsg']){
    global['lastMsg'] = {};
}

if (!global.settings['msgFilters']){
    global.settings['msgFilters'] = {};
}

//Message Filters unlocked by default
['all','progress','events','major_events','minor_events'].forEach(function (filter){
    if (!global.settings.msgFilters[filter]){
        global.settings.msgFilters[filter] = {
            unlocked: true,
            vis: true,
            max: 60,
            save: 3
        };
    }
});

message_filters.forEach(function (filter){
    if (!global.lastMsg[filter]){
        global.lastMsg[filter] = [];
    }
    //Message Filters not unlocked by default.
    if (!global.settings.msgFilters[filter]){
        global.settings.msgFilters[filter] = {
            unlocked: false,
            vis: false,
            max: 60,
            save: 3
        };
    }
});

if (!global.settings['msgQueueHeight']){
    global.settings['msgQueueHeight'] = $(`#msgQueue`).outerHeight();
    global.settings['buildQueueHeight'] = $(`#buildQueue`).outerHeight();
}

if (!global['space']){
    global['space'] = {};
}

if (!global['starDock']){
    global['starDock'] = {};
}

if (!global['interstellar']){
    global['interstellar'] = {};
}

if (!global['galaxy']){
    global['galaxy'] = {};
}

if (global.interstellar['mass_ejector'] && !global.interstellar.mass_ejector['Bolognium']){
    global.interstellar.mass_ejector['Bolognium'] = 0;
}
if (global.interstellar['mass_ejector'] && !global.interstellar.mass_ejector['Vitreloy']){
    global.interstellar.mass_ejector['Vitreloy'] = 0;
}
if (global.interstellar['mass_ejector'] && !global.interstellar.mass_ejector['Orichalcum']){
    global.interstellar.mass_ejector['Orichalcum'] = 0;
}
if (global.interstellar['mass_ejector'] && !global.interstellar.mass_ejector['Nanoweave']){
    global.interstellar.mass_ejector['Nanoweave'] = 0;
}
if (global.interstellar['mass_ejector'] && !global.interstellar.mass_ejector['Scarletite']){
    global.interstellar.mass_ejector['Scarletite'] = 0;
}

if (!global.hasOwnProperty('pillars')){
    global['pillars'] = {};
}

if (!global.settings.space['alpha']){
    global.settings.space['alpha'] = false;
    global.settings.space['proxima'] = false;
    global.settings.space['nebula'] = false;
    global.settings.space['neutron'] = false;
    global.settings.space['blackhole'] = false;
}

if (!global.settings['showAchieve']){
    global.settings['showAchieve'] = false;
}
if (!global.settings['locale']){
    global.settings['locale'] = 'en-us';
}
if (typeof global.settings.pause === 'undefined'){
    global.settings['pause'] = false;
}
if (typeof global.settings.mKeys === 'undefined'){
    global.settings['mKeys'] = true;
}
if (typeof global.settings.keyMap === 'undefined'){
    global.settings['keyMap'] = {
        x10: 'Control', //17
        x25: 'Shift', //16
        x100: 'Alt', //18
        q: 'q', //81
    };
}
if (typeof global.settings.keyMap.showCiv === 'undefined'){
    global.settings.keyMap['showCiv'] = '1'; // 49
    global.settings.keyMap['showCivic'] = '2'; // 50
    global.settings.keyMap['showResearch'] = '3'; // 51
    global.settings.keyMap['showResources'] = '4'; // 52
    global.settings.keyMap['showGenetics'] = '5'; // 53
    global.settings.keyMap['showAchieve'] = '6'; // 54
    global.settings.keyMap['settings'] = '7'; // 55
}
delete global.settings.keyMap['d'];
if (typeof global.settings.qAny === 'undefined'){
    global.settings['qAny'] = false;
}
if (typeof global.settings.sPackOn === 'undefined'){
    global.settings['sPackOn'] = true;
}
if (typeof global.settings.qAny_res === 'undefined'){
    global.settings['qAny_res'] = false;
}
if (typeof global.settings.sPackMsg === 'undefined'){
    global.settings['sPackMsg'] = false;
}
if (typeof global.settings.expose === 'undefined'){
    global.settings['expose'] = false;
}
if (typeof global.settings.tabLoad === 'undefined'){
    global.settings['tabLoad'] = false;
}
if (typeof global.settings.boring === 'undefined'){
    global.settings['boring'] = false;
}
if (!global.settings.hasOwnProperty('mtorder')){
    global.settings['mtorder'] = [];
}

// Stat Counters
[
    'reset','plasmid','antiplasmid','universes','phage','starved','tstarved','died','tdied',
    'sac','tsac','know','tknow','portals','dkills','attacks','cfood','tfood','cstone','tstone',
    'clumber','tlumber','mad','bioseed','cataclysm','blackhole','ascend','descend','terraform',
    'aiappoc','matrix','retire','eden','geck','dark','harmony','blood','cores','artifact',
].forEach(function(k){
    if (!global.stats.hasOwnProperty(k)){
        global.stats[k] = 0;
    }
});

if (!global.stats.hasOwnProperty('womling')){
    global.stats['womling'] = {
        god: {l:0},
        lord: {l:0},
        friend: {l:0}
    };
}

if (!global.stats['spire']){
    global.stats['spire'] = {};
}
if (!global.stats['synth']){
    global.stats['synth'] = {};
}
if (!global.stats.hasOwnProperty('banana')){
    global.stats['banana'] = {
        b1: { l: false, h: false, a: false, e: false, m: false, mg: false }, 
        b2: { l: false, h: false, a: false, e: false, m: false, mg: false }, 
        b3: { l: false, h: false, a: false, e: false, m: false, mg: false }, 
        b4: { l: false, h: false, a: false, e: false, m: false, mg: false }, 
        b5: { l: false, h: false, a: false, e: false, m: false, mg: false }
    };
}

if (!global.race['seeded']){
    global.race['seeded'] = false;
}
if (!global.race['deterioration']){
    global.race['deterioration'] = 0;
}
if (!global.race['gene_fortify']){
    global.race['gene_fortify'] = 0;
}

if (!global.race['old_gods']){
    global.race['old_gods'] = 'none';
}
if (!global.race['universe']){
    global.race['universe'] = 'standard';
}

if (!global.genes['minor']){
    global.genes['minor'] = {};
}
if (!global.race['minor']){
    global.race['minor'] = {};
}

if (!global.hasOwnProperty('govern')){
    global['govern'] = {
        governor: {},
        candidate: [],
        policy: {}
    };
}

if (!global.settings.hasOwnProperty('showMil')){
    global.settings['showMil'] = true;
}
if (!global.settings.hasOwnProperty('showPowerGrid')){
    global.settings['showPowerGrid'] = global.hasOwnProperty('tech') && global.tech.hasOwnProperty('high_tech') && global.tech.high_tech >= 2 ? true : false;
}

if (!global.settings['affix']){
    global.settings['affix'] = 'si';
}

if (!global['special']){
    global['special'] = {};
}
if (!global.special['gift']){
    global.special['gift'] = {};
}
if (!global.special.hasOwnProperty('egg')){
    global.special['egg'] = {};
}

if (!global.special.hasOwnProperty('trick')){
    global.special['trick'] = {
        trick1: false,
        trick2: false,
        trick3: false,
        trick4: false,
        trick5: false,
        trick6: false,
        trick7: false,
        trick8: false,
        trick9: false,
        trick10: false,
        trick11: false,
        trick12: false
    };
}

if (!global.civic['govern']){
    global.civic['govern'] = {
        type: 'oligarchy',
        rev: 2000,
        fr: 0,
    };
}
global.civic.govern.fr = 0;

if (!global.hasOwnProperty('custom')){
    global['custom'] = {};
}
if (global.custom.hasOwnProperty('planet') && global.custom.planet.hasOwnProperty('biome')){
    delete global.custom.planet;
}

if (global.city.hasOwnProperty('smelter') && !global.city.smelter.hasOwnProperty('cap')){
    global.city.smelter['cap'] = 0;
}

if (!global.civic['homeless']){
    global.civic.homeless = 0;
}

if (!global.civic['foreign']){
    global.civic['foreign'] = {
        gov0: {
            unrest: 0,
            hstl: 100,
            mil: 100,
            eco: 75,
            spy: 0,
            esp: 0,
            trn: 0,
            sab: 0,
            act: 'none',
            occ: false,
            anx: false,
            buy: false
        },
        gov1: {
            unrest: 0,
            hstl: 0,
            mil: 150,
            eco: 100,
            spy: 0,
            esp: 0,
            trn: 0,
            sab: 0,
            act: 'none',
            occ: false,
            anx: false,
            buy: false
        },
        gov2: {
            unrest: 0,
            hstl: 50,
            mil: 250,
            eco: 150,
            spy: 0,
            esp: 0,
            trn: 0,
            sab: 0,
            act: 'none',
            occ: false,
            anx: false,
            buy: false
        }
    };
}

if (typeof global.civic.foreign.gov0['trn'] === "undefined"){
    global.civic.foreign.gov0['trn'] = 0;
    global.civic.foreign.gov1['trn'] = 0;
    global.civic.foreign.gov2['trn'] = 0;
    global.civic.foreign.gov0['sab'] = 0;
    global.civic.foreign.gov1['sab'] = 0;
    global.civic.foreign.gov2['sab'] = 0;
    global.civic.foreign.gov0['act'] = 'none';
    global.civic.foreign.gov1['act'] = 'none';
    global.civic.foreign.gov2['act'] = 'none';
}

if (typeof global.civic.foreign.gov0['name'] !== "undefined" && global.civic.foreign.gov0.name.s1 === 'evo_organism_title'){
    global.civic.foreign.gov0.name.s1 = 'Northern';
}
if (typeof global.civic.foreign.gov1['name'] !== "undefined" && global.civic.foreign.gov1.name.s1 === 'evo_organism_title'){
    global.civic.foreign.gov1.name.s1 = 'Southern';
}
if (typeof global.civic.foreign.gov2['name'] !== "undefined" && global.civic.foreign.gov2.name.s1 === 'evo_organism_title'){
    global.civic.foreign.gov2.name.s1 = 'Divine';
}

if (!global.race['evil'] && global.race['immoral'] && global.race !== undefined && global.race.species !== 'wendigo'){
    delete global.race['immoral'];
}
else if (global.race !== undefined && global.race.species === 'wendigo'){
    const date = new Date();
    if (global.settings.hasOwnProperty('boring') && !global.settings.boring && date.getMonth() === 11 && date.getDate() >= 17){
        global.race['immoral'] = 3;
    }
}

{
    if (global.hasOwnProperty('special') && global.special.hasOwnProperty('gift')){
        const sdate = new Date(global.stats.start);
        const cdate = new Date();
        Object.keys(global.special.gift).forEach(function(gy){
            let year = Number(gy.substring(1,5));
            if ((year < sdate.getFullYear()) || (cdate.getFullYear() < year) || (cdate.getFullYear() === year && cdate.getMonth() !== 11)){
                delete global.special.gift[gy];
            }
        });
    }
}

$('html').addClass(global.settings.theme);

if (!global.settings['at']){
    global.settings['at'] = 0;
}

if (!global.city['morale']){
    global.city['morale'] = {
        current: 0,
        cap: 0,
        potential: 0,
        unemployed: 0,
        stress: 0,
        entertain: 0,
        leadership: 0,
        season: 0,
        weather: 0,
        warmonger: 0,
        rev: 0
    };
}

if (!global.city['sun']){
    global.city['sun'] = 0;
}
if (!global.city['cold']){
    global.city['cold'] = 0;
}
if (!global.city['hot']){
    global.city['hot'] = 0;
}

if (!global.city.morale['unemployed']){
    global.city.morale['unemployed'] = 0;
}
if (!global.city.morale['leadership']){
    global.city.morale['leadership'] = 0;
}
if (!global.city.morale['warmonger']){
    global.city.morale['warmonger'] = 0;
}
if (!global.city.morale['rev']){
    global.city.morale['rev'] = 0;
}
if (!global.city.morale['tax']){
    global.city.morale['tax'] = 0;
}
if (!global.city.morale['shrine']){
    global.city.morale['shrine'] = 0;
}
if (!global.city.morale['blood_thirst']){
    global.city.morale['blood_thirst'] = 0;
}
if (!global.city.morale['broadcast']){
    global.city.morale['broadcast'] = 0;
}
if (!global.city.morale['vr']){
    global.city.morale['vr'] = 0;
}
if (!global.city.morale['zoo']){
    global.city.morale['zoo'] = 0;
}
if (!global.city.morale['cap']){
    global.city.morale['cap'] = 0;
}
if (!global.city.morale['potential']){
    global.city.morale['potential'] = 0;
}

if (!global.city['calendar']){
    global.city['calendar'] = {
        day: 0,
        year: 0,
        season: 0,
        weather: 2,
        temp: 1,
        moon: 0,
        wind: 0,
        orbit: 365
    };
}

if (!global.city.calendar['season']){
    global.city.calendar['season'] = 0;
}

if (!global.city.calendar['moon']){
    global.city.calendar['moon'] = 0;
}

if (!global.city.calendar['wind']){
    global.city.calendar['wind'] = 0;
}

if (!global.city['powered']){
    global.city['powered'] = false;
    global.city['power'] = 0;
}

if (!global.city['biome']){
    global.city['biome'] = 'grassland';
}

if (!global.city['geology']){
    global.city['geology'] = {};
}

if (!global.city['market']){
    global.city['market'] = {
        qty: 10,
        mtrade: 0,
        trade: 0,
        active: false
    };
}

if (global.city['foundry'] && !global.city.foundry['Mythril']){
    global.city.foundry['Mythril'] = 0;
}
if (global.city['foundry'] && !global.city.foundry['Aerogel']){
    global.city.foundry['Aerogel'] = 0;
}
if (global.city['foundry'] && !global.city.foundry['Nanoweave']){
    global.city.foundry['Nanoweave'] = 0;
}
if (global.city['foundry'] && !global.city.foundry['Scarletite']){
    global.city.foundry['Scarletite'] = 0;
}
if (global.city['foundry'] && !global.city.foundry['Quantium']){
    global.city.foundry['Quantium'] = 0;
}

if (!global.settings['arpa']){
    global.settings['arpa'] = {
        arpaTabs: 0,
        physics: true,
        genetics: false
    };
}
if (!global.settings.arpa['crispr']){
    global.settings.arpa['crispr'] = false;
}
if (!global.settings.arpa['blood']){
    global.settings.arpa['blood'] = false;
}

if (!global['arpa']){
    global['arpa'] = {};
}

if (global.city['factory']){
    if (!global.city.factory['Lux']){
        global.city.factory['Lux'] = 0;
    }
    if (!global.city.factory['Alloy']){
        global.city.factory['Alloy'] = 0;
    }
    if (!global.city.factory['Polymer']){
        global.city.factory['Polymer'] = 0;
    }
}

if (!global.race['mutation']){
    global.race['mutation'] = 0;
}
if (!global.race['p_mutation']){
    global.race['p_mutation'] = 0;
}

if (global.race['old_gods'] && global.race['old_gods'] != 'none'){
    global.genes['old_gods'] = 1;
}
else {
    delete global.genes['old_gods'];
}

if (global.tech['fanaticism'] && global.tech['theology'] && global.tech['theology'] === 2){
    global.tech['theology'] = 3;
}

if (global.tech['fanaticism'] && global.tech['anthropology'] && !global.genes['transcendence']){
    delete global.tech['anthropology'];
}

if (global.tech['unify']){
    if (global.tech['unify'] === 1){
        delete global.tech['m_boost'];
        delete global.tech['world_control'];
    }
}

if (global.city.hasOwnProperty('spc_casino')){
    global.space['spc_casino'] = { count: 0, on: 0 };
    delete global.city['spc_casino'];
}

if (global.tech.hasOwnProperty('nanoweave')){
    global.resource.Nanoweave.display = true;
}

if (!global.civic['new']){
    global.civic['new'] = 0;
}

if (!global.race['purgatory']){
    global.race['purgatory'] = {
        city: {},
        space: {},
        portal: {},
        tech: {},
    };
}

if (!global.civic['d_job']){
    if (global.race['carnivore'] || global.race['soul_eater']){
        global.civic['d_job'] = 'hunter';
    }
    else if (global.tech['agriculture'] && global.tech['agriculture'] >= 1){
        global.civic['d_job'] = 'farmer';
    }
    else {
        global.civic['d_job'] = 'unemployed';
    }
}

global.settings.animated = true;
global.settings.disableReset = false;

if (global['arpa'] && global.arpa['launch_facility'] && global.arpa.launch_facility.rank > 0 && !global.tech['space']){
    global.tech['space'] = 1;
}

function newGameData(){
    global['race'] = { species : 'protoplasm', gods: 'none', old_gods: 'none', seeded: false };
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;
    global['new'] = true;
}

export var keyMap = {
    x10: false,
    x25: false,
    x100: false,
    q: false
};

export function keyMultiplier(){
    let number = 1;
    if (global.settings['mKeys']){
        if (keyMap.x10){
            number *= 10;
        }
        if (keyMap.x25){
            number *= 25;
        }
        if (keyMap.x100){
            number *= 100;
        }
    }
    return number;
}

function convertVersion(version){
    let vNum = version.split('.',3);
    vNum[0] *= 100000;
    vNum[1] *= 1000;
    return Number(vNum[0]) + Number(vNum[1]) + Number(vNum[2]);
}

export function resizeGame(){
    if ($(window).width() >= 1400 && $('#msgQueue:not(.right)')){
        let build = $('#buildQueue').detach();
        build.addClass('right');
        build.removeClass('has-text-info');

        let queue = $('#msgQueue').detach();
        queue.addClass('right');
        queue.removeClass('has-text-info');
        queue.css('resize', 'none');
        $('#queueColumn').addClass('is-one-quarter');
        $('#queueColumn').append(build);
        $('#queueColumn').append(queue);
        $('#mainColumn').removeClass('is-three-quarters');
        $('#mainColumn').addClass('is-half');

    }
    else if ($(window).width() < 1400 && $('#msgQueue').hasClass('right')){
        let build = $('#buildQueue').detach();
        build.removeClass('right');
        build.addClass('has-text-info');

        let queue = $('#msgQueue').detach();
        queue.removeClass('right');
        queue.addClass('has-text-info');
        queue.css('resize', 'vertical');
        $('#queueColumn').removeClass('is-one-quarter');
        $('#sideQueue').append(build);
        $('#sideQueue').append(queue);
        $('#mainColumn').removeClass('is-half');
        $('#mainColumn').addClass('is-three-quarters');
    }
}

var affix_list = {
    si: ['K','M','G','T','P','E','Z','Y'],
    sci: ['e3','e6','e9','e12','e15','e18','e21','e24'],
    sln: ['K','M','B','t','q','Q','s','S']
};

export function sizeApproximation(value,precision,fixed){
    let result = 0;
    let affix = '';
    let neg = value < 0 ? true : false;
    if (neg){
        value *= -1;
    }
    if (value <= 9999){
        result = +value.toFixed(precision);
    }
    else if (value < 1000000){
        affix = affix_list[global.settings.affix][0];
        result = fixed ? +(value / 1000).toFixed(1) : (Math.floor(value / 100) / 10);
    }
    else if (value < 1000000000){
        affix = affix_list[global.settings.affix][1];
        result = fixed ? +(value / 1000000).toFixed(1) : (Math.floor(value / 10000) / 100);
    }
    else if (value < 1000000000000){
        affix = affix_list[global.settings.affix][2];
        result = fixed ? +(value / 1000000000).toFixed(1) : (Math.floor(value / 10000000) / 100);
    }
    else if (value < 1000000000000000){
        affix = affix_list[global.settings.affix][3];
        result = fixed ? +(value / 1000000000000).toFixed(1) : (Math.floor(value / 10000000000) / 100);
    }
    else if (value < 1000000000000000000){
        affix = affix_list[global.settings.affix][4];
        result = fixed ? +(value / 1000000000000000).toFixed(1) : (Math.floor(value / 10000000000000) / 100);
    }
    else if (value < 1000000000000000000000){
        affix = affix_list[global.settings.affix][5];
        result = fixed ? +(value / 1000000000000000000).toFixed(1) : (Math.floor(value / 10000000000000000) / 100);
    }
    else if (value < 1000000000000000000000000){
        affix = affix_list[global.settings.affix][6];
        result = fixed ? +(value / 1000000000000000000000).toFixed(1) : (Math.floor(value / 10000000000000000000) / 100);
    }
    else {
        affix = affix_list[global.settings.affix][7];
        result = fixed ? +(value / 1000000000000000000000000).toFixed(1) : (Math.floor(value / 10000000000000000000000) / 100);
    }
    if (result >= 100){
        result = +result.toFixed(1);
    }
    if (neg){
        result *= -1;
    }
    return result + affix;
}

$(window).resize(function(){
    resizeGame();
});

export function srSpeak(text, priority) {
    var el = document.createElement("div");
    var id = "speak-" + Date.now();
    el.setAttribute("id", id);
    el.setAttribute("aria-live", priority || "polite");
    el.classList.add("sr-only");
    document.body.appendChild(el);

    window.setTimeout(function () {
      document.getElementById(id).innerHTML = text;
    }, 100);

    window.setTimeout(function () {
        document.body.removeChild(document.getElementById(id));
    }, 1000);
}

// executes a soft reset
window.soft_reset = function reset(source){
    try {
        source = source && source === 'replicator' ? 'replicator' : 'soft';
        gtag('event', 'reset', { 'end': source});
    } catch (err){}
    
    if (!source){
        clearSavedMessages();
    }

    let srace = global.race.hasOwnProperty('srace') ? global.race.srace : false;
    let gecks = global.race.hasOwnProperty('geck') ? global.race.geck : 0;
    if (global.race.hasOwnProperty('gecked')){
        gecks += global.race.gecked;
        global.stats.geck -= global.race.gecked;
    }
    let replace = {
        species : 'protoplasm',
        universe: global.race.universe,
        seeded: global.race.seeded,
        probes: global.race.probes,
        seed: global.race.seed,
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
        rejuvenated: global.race.hasOwnProperty('rejuvenated') ? global.race.rejuvenated : false,
    }
    if (gecks > 0){
        replace['geck'] = gecks;
    }
    if (srace){
        replace['srace'] = srace;
    }
    if (global.race['bigbang']){
        replace['bigbang'] = true;
    }
    if (global.race['gods']){
        replace['gods'] = global.race.gods;
    }
    if (global.race['old_gods']){
        replace['old_gods'] = global.race.old_gods;
    }
    if (global.race['rapid_mutation'] && global.race['rapid_mutation'] > 0){
        replace['rapid_mutation'] = global.race['rapid_mutation'];
    }
    if (global.race['ancient_ruins'] && global.race['ancient_ruins'] > 0){
        replace['ancient_ruins'] = global.race['ancient_ruins'];
    }
    if (global.race['bigbang']){
        replace.universe = 'bigbang';
    }
    if (global.race.hasOwnProperty('corruption')){
        replace['corruption'] = global.race.corruption;
    }
    global['race'] = replace;

    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;
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

    if (global.tech['theology'] && global.tech['theology'] >= 1){
        global.tech = { theology: 1 };
    }
    else {
        global.tech = {};
    }

    clearStates();
    global.new = true;
    Math.seed = Math.rand(0,10000);

    global.stats['current'] = Date.now();
    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

export var webWorker = { w: false, s: false, mt: 250 };
export var intervals = {};

export function clearSavedMessages(){
    message_filters.forEach(function (filter){
        //Preserve achievements log.
        if (filter !== 'achievements'){
            global.lastMsg[filter] = [];
        }
    });
}

function setRegionStates(reset){
    // Display Keys
    let regions = {
        base: [
            'showCiv','showCity','showIndustry','showPowerGrid','showMechLab','showShipYard',
            'showResearch','showCivic','showMil','showResources','showMarket','showStorage',
            'showGenetics','showSpace','showDeep','showGalactic','showPortal','showOuter',
            'showTau','showEjector','showCargo','showAlchemy','showGovernor','arpa'
        ],
        space: [
            'moon','red','hell','sun','gas','gas_moon','belt','dwarf','alpha','proxima',
            'nebula','neutron','blackhole','sirius','stargate','gateway','gorddon',
            'alien1','alien2','chthonian','titan','enceladus','triton','eris','kuiper'
        ],
        portal: ['fortress','badlands','pit','ruins','gate','lake','spire'],
        tau: ['home','red','roid','gas','gas2','star']
    };
    
    Object.keys(regions).forEach(function(r){
        if (r === 'base'){
            regions[r].forEach(function(v){
                if (!global.settings.hasOwnProperty(v) || reset){
                    global.settings[v] = false;
                }
            });
        }
        else {
            if (!global.settings.hasOwnProperty(r)){
                global.settings[r] = {};
            }
            regions[r].forEach(function(v){
                if (!global.settings[r].hasOwnProperty(v) || reset){
                    global.settings[r][v] = false;
                }
            });
        }
    });


    // Tab Indexes
    [
        'civTabs','govTabs','govTabs2','hellTabs','resTabs','spaceTabs','marketTabs','statsTabs'
    ].forEach(function(k){
        if (!global.settings.hasOwnProperty(k) || reset){
            global.settings[k] = 0;
        }
    });
}

export function clearStates(){
    if (webWorker.w){
        webWorker.w.terminate();
    }
    global['queue'] = { display: false, queue: [] };
    global['r_queue'] = { display: false, queue: [] };
    global.space = {};
    global.interstellar = {};
    global.galaxy = {};
    global.portal = {};
    global.starDock = {};
    global.tauceti = {};
    global.civic = { new: 0 };
    global.civic['foreign'] = {
        gov0: {
            unrest: 0,
            hstl: Math.floor(Math.seededRandom(80,100)),
            mil: Math.floor(Math.seededRandom(75,125)),
            eco: Math.floor(Math.seededRandom(60,90)),
            spy: 0,
            esp: 0,
            trn: 0,
            sab: 0,
            act: 'none',
            occ: false,
            anx: false,
            buy: false
        },
        gov1: {
            unrest: 0,
            hstl: Math.floor(Math.seededRandom(0,20)),
            mil: Math.floor(Math.seededRandom(125,175)),
            eco: Math.floor(Math.seededRandom(80,120)),
            spy: 0,
            esp: 0,
            trn: 0,
            sab: 0,
            act: 'none',
            occ: false,
            anx: false,
            buy: false
        },
        gov2: {
            unrest: 0,
            hstl: Math.floor(Math.seededRandom(40,60)),
            mil: Math.floor(Math.seededRandom(200,300)),
            eco: Math.floor(Math.seededRandom(130,170)),
            spy: 0,
            esp: 0,
            trn: 0,
            sab: 0,
            act: 'none',
            occ: false,
            anx: false,
            buy: false
        }
    };
    if (!global.genes['blood']){
        global.prestige.Blood_Stone.count = 0;
    }

    global.resource = {};
    global.evolution = {};
    global.event = { t: 100, l: false };
    global.m_event = { t: 499, l: false };
    global.stats.days = 0;
    global.stats.know = 0;
    global.stats.starved = 0;
    global.stats.died = 0;
    global.stats.attacks = 0;
    global.stats.dkills = 0;
    global.stats.cfood = 0;
    global.stats.cstone = 0;
    global.stats.clumber = 0;
    global.stats.sac = 0;
    global.settings.at = 0;

    global.settings.showEvolve = true;
    global.settings.space.home = true;
    setRegionStates(true);
    global.settings.disableReset = false;
    global.settings.pause = false;
    global.arpa = {};

    delete global.race['hrt'];

    if (global.genes['queue']){
        global.tech['queue'] = 1;
        global.queue.display = true;
    }
}

// executes a hard reset
window.reset = function reset(){
    try {
        gtag('event', 'reset', { 'end': 'hard'});
    } catch (err){}
    localStorage.removeItem('evolved');
    global = null;
    if (webWorker.w){
        webWorker.w.terminate();
    }
    window.location.reload();
}
