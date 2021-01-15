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
    civic: { free: 0 },
    race: {},
    genes: {},
    blood: {},
    stats: {
        start: Date.now(),
        days: 0,
        tdays: 0
    },
    event: 200
};
export var tmp_vars = {};
export var vues = {};
export var poppers = {};
export var breakdown = {
    c: {},
    p: {}
};
export var p_on = {};
export var red_on = {};
export var moon_on = {};
export var belt_on = {};
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

global['version'] = '1.0.22';
delete global['beta'];

if (!global.hasOwnProperty('power')){
    global['power'] = [];       
}

if (!global.hasOwnProperty('support')){
    global['support'] = {
        moon: [],
        red: [],
        belt: [],
        alpha: [],
        nebula: [],
        gateway: [],
        alien2: [],
        lake: [],
        spire: [],
    };
}

if (global.civic['cement_worker'] && global.civic.cement_worker.impact === 0.25){
    global.civic.cement_worker.impact = 0.4;
}

if (!global['settings']){
    global['settings'] = {
        civTabs: 0,
        showEvolve: true,
        showCiv: false,
        showCity: false,
        showIndustry: false,
        showPowerGrid: false,
        showResearch: false,
        showCivic: false,
        showMil: false,
        showResources: false,
        showMarket: false,
        showStorage: false,
        showAlchemy: false,
        showGenetics: false,
        showSpace: false,
        showAchieve: false,
        animated: true,
        disableReset: false,
        font: 'standard',
        cLabels: true,
        theme: 'night',
        locale: 'en-US',
        icon: 'star'
    };
}

if (!global.settings.hasOwnProperty('showMechLab')){
    global.settings['showMechLab'] = false;
}

if (!global.settings.hasOwnProperty('showCiv')){
    global.settings['showCiv'] = global.settings['showCity'];
}

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

if (!global.settings['showAlchemy']){
    global.settings['showAlchemy'] = false;
}

if (!global.settings['space']){
    global.settings['space'] = {
        home: true,
        moon: false,
        red: false,
        hell: false,
        sun: false,
        gas: false,
        gas_moon: false,
        belt: false,
        dwarf: false,
        blackhole: false,
        sirius: false,
        stargate: false,
        gateway: false,
        gorddon: false,
        alien1: false,
        alien2: false,
        chthonian: false
    }
}

if (!global.settings.space['alpha']){
    global.settings.space['alpha'] = false;
    global.settings.space['proxima'] = false;
    global.settings.space['nebula'] = false;
    global.settings.space['neutron'] = false;
    global.settings.space['blackhole'] = false;
}

if (typeof global.settings.space['stargate'] === 'undefined'){
    global.settings.space['stargate'] = false;
    global.settings.space['gateway'] = false;
}

if (typeof global.settings.space['gorddon'] === 'undefined'){
    global.settings.space['gorddon'] = false;
}
if (typeof global.settings.space['alien1'] === 'undefined'){
    global.settings.space['alien1'] = false;
    global.settings.space['alien2'] = false;
}
if (typeof global.settings.space['alien1'] === 'undefined'){
    global.settings.space['alien1'] = false;
    global.settings.space['alien2'] = false;
}
if (typeof global.settings.space['chthonian'] === 'undefined'){
    global.settings.space['chthonian'] = false;
}
if (typeof global.settings.space['sirius'] === 'undefined'){
    global.settings.space['sirius'] = false;
}

if (!global.settings['showDeep']){
    global.settings['showDeep'] = false;
}

if (!global.settings['showGalactic']){
    global.settings['showGalactic'] = false;
}

if (!global.settings['showPortal']){
    global.settings['showPortal'] = false;
}

if (!global.settings['portal']){
    global.settings['portal'] = {
        fortress : false,
        badlands : false,
        pit : false,
    };
}

if (!global.settings.portal.hasOwnProperty('ruins')){
    global.settings.portal['ruins'] = false;
    global.settings.portal['gate'] = false;
    global.settings.portal['lake'] = false;
    global.settings.portal['spire'] = false;
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
if (!global.settings['showEjector']){
    global.settings['showEjector'] = false;
}
if (!global.settings['showCargo']){
    global.settings['showCargo'] = false;
}
if (!global.settings['resTabs']){
    global.settings['resTabs'] = 0;
}
if (!global.settings['govTabs']){
    global.settings['govTabs'] = 0;
}
if (!global.settings['marketTabs']){
    global.settings['marketTabs'] = 0;
}
if (!global.settings['spaceTabs']){
    global.settings['spaceTabs'] = 0;
}
if (!global.settings['statsTabs']){
    global.settings['statsTabs'] = 0;
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
if (typeof global.settings.expose === 'undefined'){
    global.settings['expose'] = false;
}
if (typeof global.settings.tabLoad === 'undefined'){
    global.settings['tabLoad'] = false;
}
if (typeof global.settings.boring === 'undefined'){
    global.settings['boring'] = false;
}
if (!global.stats['reset']){
    global.stats['reset'] = 0;
}
if (!global.stats['plasmid']){
    global.stats['plasmid'] = 0;
}
if (!global.stats['antiplasmid']){
    global.stats['antiplasmid'] = 0;
}
if (!global.stats['universes']){
    global.stats['universes'] = 0;
}
if (!global.stats['phage']){
    global.stats['phage'] = 0;
}
if (!global.stats['starved']){
    global.stats['starved'] = 0;
}
if (!global.stats['tstarved']){
    global.stats['tstarved'] = 0;
}
if (!global.stats['died']){
    global.stats['died'] = 0;
}
if (!global.stats['tdied']){
    global.stats['tdied'] = 0;
}
if (!global.stats['know']){
    global.stats['know'] = 0;
}
if (!global.stats['tknow']){
    global.stats['tknow'] = 0;
}
if (!global.stats['portals']){
    global.stats['portals'] = global.stats['achieve'] && global.stats.achieve['doomed'] ? 1 : 0;
}
if (!global.stats['dkills']){
    global.stats['dkills'] = 0;
}
if (!global.stats['attacks']){
    global.stats['attacks'] = 0;
}
if (!global.stats['mad']){
    global.stats['mad'] = 0;
}
if (!global.stats['bioseed']){
    global.stats['bioseed'] = 0;
}
if (!global.stats['cataclysm']){
    global.stats['cataclysm'] = 0;
}
if (!global.stats['blackhole']){
    global.stats['blackhole'] = 0;
}
if (!global.stats['ascend']){
    global.stats['ascend'] = 0;
}
if (!global.stats['descend']){
    global.stats['descend'] = 0;
}
if (!global.stats['dark']){
    global.stats['dark'] = 0;
}
if (!global.stats['harmony']){
    global.stats['harmony'] = 0;
}
if (!global.stats['blood']){
    global.stats['blood'] = 0;
}
if (!global.stats['artifact']){
    global.stats['artifact'] = 0;
}

if (!global.stats['spire']){
    global.stats['spire'] = {};
}

if (!global['lastMsg']){
    global['lastMsg'] = [];
}
if (!global.race['seeded']){
    global.race['seeded'] = false;
}
if (!global.race['Plasmid']){
    global.race['Plasmid'] = { count: 0, anti: 0 };
}
if (!global.race.Plasmid['anti']){
    global.race.Plasmid['anti'] = 0;
}
if (!global.race['Phage']){
    global.race['Phage'] = { count: 0 };
}
if (!global.race['Dark']){
    global.race['Dark'] = { count: 0 };
}
if (!global.race['Harmony']){
    global.race['Harmony'] = { count: 0 };
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
    global.special['egg'] = {
        egg1: false,
        egg2: false,
        egg3: false,
        egg4: false,
        egg5: false,
        egg6: false,
        egg7: false,
        egg8: false,
        egg9: false,
        egg10: false,
        egg11: false,
        egg12: false
    };
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

if (global.city.hasOwnProperty('smelter') && !global.city.smelter.hasOwnProperty('cap')){
    global.city.smelter['cap'] = 0;
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

if (!global.race['evil'] && global.race['immoral']){
    delete global.race['immoral'];
}

{
    const date = new Date();
    if (global.race.species === 'elven' && date.getMonth() === 11 && date.getDate() >= 17){
        global.race['slaver'] = 1;
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
if (!global.city.morale['broadcast']){
    global.city.morale['broadcast'] = 0;
}
if (!global.city.morale['vr']){
    global.city.morale['vr'] = 0;
}
if (!global.city.morale['zoo']){
    global.city.morale['zoo'] = 0;
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

if (!global.civic['d_job']){
    if (global.race['carnivore'] || global.race['soul_eater']){
        global.civic['d_job'] = 'unemployed';
    }
    else if (global.tech['agriculture'] && global.tech['agriculture'] >= 1){
        global.civic['d_job'] = 'farmer';
    }
    else{
        global.civic['d_job'] = 'unemployed';
    }
}

global.settings.animated = true;
global.settings.disableReset = false;

if (global['arpa'] && global.arpa['launch_facility'] && global.arpa.launch_facility.rank > 0 && !global.tech['space']){
    global.tech['space'] = 1;
}

if (!(save.getItem('evolveBak'))){
    save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
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
        build.find('h2').removeClass('is-sr-only');

        let queue = $('#msgQueue').detach();
        queue.addClass('right');
        queue.removeClass('has-text-info');
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
        build.find('h2').addClass('is-sr-only');

        let queue = $('#msgQueue').detach();
        queue.removeClass('right');
        queue.addClass('has-text-info');
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
    return (result >= 100 ? +result.toFixed(1) : result) + affix;
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
window.soft_reset = function reset(){
    let replace = {
        species : 'protoplasm',
        Plasmid: { count: global.race.Plasmid.count },
        Plasmid: { count: global.race.Plasmid.count, anti: global.race.Plasmid.anti },
        Phage: { count: global.race.Phage.count },
        Dark: { count: global.race.Dark.count },
        Harmony: { count: global.race.Harmony.count },
        universe: global.race.universe,
        seeded: global.race.seeded,
        probes: global.race.probes,
        seed: global.race.seed,
        ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
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

    global.stats.days = 0;
    global.stats.know = 0;
    global.stats.starved = 0;
    global.stats.died = 0;

    if (global.tech['theology'] && global.tech['theology'] >= 1){
        global.tech = { theology: 1 };
    }
    else {
        global.tech = {};
    }

    clearStates();
    global.lastMsg = [];
    global.new = true;
    Math.seed = Math.rand(0,10000);

    global.stats['current'] = Date.now();
    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

export var webWorker = { w: false, s: false, mt: 250 };
export var intervals = {};

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
    global.civic = { free: 0, new: 0 };
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

    let artifacts = global.resource.Artifact;
    if (global.genes['blood']){
        let stones = global.resource.Blood_Stone;
        global.resource = {};
        global.resource['Blood_Stone'] = stones;
    }
    else {
        global.resource = {};
    }
    if (artifacts.amount > 0){
        global.resource['Artifact'] = artifacts;
    }
    global.evolution = {};
    global.event = 100;
    global.stats.days = 0;
    global.stats.know = 0;
    global.stats.starved = 0;
    global.stats.died = 0;
    global.stats.attacks = 0;
    global.stats.dkills = 0;
    global.settings.at = 0;

    global.settings.showEvolve = true;
    global.settings.showCiv = false;
    global.settings.showCity = false;
    global.settings.showIndustry = false;
    global.settings.showPowerGrid = false;
    global.settings.showMechLab = false;
    global.settings.showResearch = false;
    global.settings.showCivic = false;
    global.settings.showMil = false;
    global.settings.showResources = false;
    global.settings.showMarket = false;
    global.settings.showStorage = false;
    global.settings.showGenetics = false;
    global.settings.showSpace = false;
    global.settings.showDeep = false;
    global.settings.showGalactic = false;
    global.settings.showPortal = false;
    global.settings.showEjector = false;
    global.settings.showCargo = false;
    global.settings.showAlchemy  = false;
    global.settings.space.home = true;
    global.settings.space.moon = false;
    global.settings.space.red = false;
    global.settings.space.hell = false;
    global.settings.space.sun = false;
    global.settings.space.gas = false;
    global.settings.space.gas_moon = false;
    global.settings.space.belt = false;
    global.settings.space.dwarf = false;
    global.settings.space.alpha = false;
    global.settings.space.proxima = false;
    global.settings.space.nebula = false;
    global.settings.space.neutron = false;
    global.settings.space.blackhole = false;
    global.settings.space.sirius = false;
    global.settings.space.stargate = false;
    global.settings.space.gateway = false;
    global.settings.space.gorddon = false;
    global.settings.space.alien1 = false;
    global.settings.space.alien2 = false;
    global.settings.space.chthonian = false;
    global.settings.portal.fortress = false;
    global.settings.portal.badlands = false;
    global.settings.portal.pit = false;
    global.settings.portal.ruins = false;
    global.settings.portal.gate = false;
    global.settings.portal.lake = false;
    global.settings.portal.spire = false;
    global.settings.arpa = false;
    global.settings.civTabs = 0;
    global.settings.govTabs = 0;
    global.settings.resTabs = 0;
    global.settings.spaceTabs = 0;
    global.settings.marketTabs = 0
    global.settings.statsTabs = 0
    global.settings.disableReset = false;
    global.settings.pause = false;
    global.arpa = {};
}

// executes a hard reset
window.reset = function reset(){
    localStorage.removeItem('evolved');
    global = null;
    if (webWorker.w){
        webWorker.w.terminate();
    }
    window.location.reload();
}
