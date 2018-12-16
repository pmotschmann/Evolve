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
            showCivic: false
        }
    },
    stats: {
        start: Date.now()
    }
};
var vues = {};

const job_desc = {
    farmer: function(){
        return 'Farmers create food to feed your population. Each farmer generates '+global.civic.farmer.impact+' food per tick';
    },
    lumberjack: function(){
        return 'Lumberjack harvet lumber from the forests. Each lumberjack generates '+global.civic.lumberjack.impact+' lumber per tick';
    },
    quarry_worker: function(){
        return 'Quarry Workers mine stone from rock quarries. Each quarry worker generates '+global.civic.quarry_worker.impact+' stone per tick';
    },
    banker: function(){
        var interest = global.civic.banker.impact * 100;
        return 'Bankers manage your banks increasing tax revenue. Each banker increases tax income by '+interest+'% per tax cycle';
    },
    professor: function(){
        return 'Professors help educate your citizen and contribute to knowledge gain. Each professor generates '+global.civic.professor.impact+' knowledge per tick';
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
