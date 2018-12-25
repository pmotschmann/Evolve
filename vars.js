var save = window.localStorage;
var intervals = {};
var global = {
    seed: 1,
    resource: {},
    tech: {},
    civic: { free: 0 },
    main_tabs: {
        data: {
            civTabs: 0,
            showEvolve: true,
            showCity: false,
            showResearch: false,
            showCivic: false,
            showMarket: false,
            showGenetics: false,
            showSpace: false,
            animated: true,
            disableReset: false
        }
    },
    stats: {
        start: Date.now()
    },
    event: 200
};
var vues = {};

const resource_values = {
    Food: 1,
    Lumber: 1,
    Stone: 1,
    Copper: 5,
    Iron: 8,
    Cement: 3,
    Steel: 20,
    Titanium: 30,
    Iridium: 40,
    Deuterium: 100
};

const job_desc = {
    farmer: function(){
        var multiplier = (global.tech['hoe'] && global.tech['hoe'] > 0 ? global.tech['hoe'] * (1/3) : 0) + 1;
        var gain = +(global.civic.farmer.impact * multiplier).toFixed(1);
        return 'Farmers create food to feed your population. Each farmer generates '+gain+' food per tick.';
    },
    lumberjack: function(){
        var multiplier = (global.tech['axe'] && global.tech['axe'] > 0 ? (global.tech['axe'] - 1) * 0.25 : 0) + 1;
        var gain = +(global.civic.lumberjack.impact * multiplier).toFixed(1);
        return 'Lumberjacks harvet lumber from the forests. Each lumberjack generates '+gain+' lumber per tick.';
    },
    quarry_worker: function(){
        var multiplier = (global.tech['pickaxe'] && global.tech['pickaxe'] > 0 ? global.tech['pickaxe'] * 0.25 : 0) + 1;
        var gain = +(global.civic.quarry_worker.impact * multiplier).toFixed(1);
        return 'Quarry Workers mine stone from rock quarries. Each quarry worker generates '+gain+' stone per tick.';
    },
    miner: function(){
        return 'Miners dig up useful minerals from shafts dug deep in the ground. Each miner can generate a variable amount of minerals of various types.';
    },
    cement_worker: function(){
        var cement_multiplier = 1;
        gain = global.civic.cement_worker.impact * cement_multiplier;
        return 'Cement plant workers turn stone into cement, each worker produces '+gain+' cement and consumes 3 stone per tick.';
    },
    banker: function(){
        var interest = global.civic.banker.impact * 100;
        return 'Bankers manage your banks increasing tax revenue. Each banker increases tax income by '+interest+'% per tax cycle.';
    },
    professor: function(){
        return 'Professors help educate your citizens and contribute to knowledge gain. Each professor generates '+global.civic.professor.impact+' knowledge per tick.';
    }
}

Math.rand = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

Math.seed = 2;
Math.seededRandom = function(min, max) {
    max = max || 1;
    min = min || 0;
 
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280;
    global.seed = Math.seed;
    return min + rnd * (max - min);
}
