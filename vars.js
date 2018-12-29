export var save = window.localStorage;
export var global = {
    seed: 1,
    resource: {},
    evolution: {},
    tech: {},
    city: {},
    civic: { free: 0 },
    race: {},
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
export var vues = {};
export var runNew = false;

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

var global_data = save.getItem('evolved') || false;
if (global_data) {
    // Load preexiting game data
    global = JSON.parse(LZString.decompressFromUTF16(global_data));
    Math.seed = global.seed;
}
else {
    runNew = true;
}

window.exportGame = function exportGame(){
    $('#importExport').val(LZString.compressToBase64(JSON.stringify(global)));
}

window.importGame = function importGame(){
    if ($('#importExport').val().length > 0){
        global = JSON.parse(LZString.decompressFromBase64($('#importExport').val()));
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        window.location.reload();
    }
}

// executes a hard reset
window.reset = function reset(){
    localStorage.removeItem('evolved');
    global = null;
    window.location.reload();
}
