export var save = window.localStorage;
export var global = {
    seed: 1,
    resource: {},
    evolution: {},
    tech: {},
    city: {},
    civic: { free: 0 },
    race: {},
    genes: {},
    stats: {
        start: Date.now(),
        days: 0,
        tdays: 0
    },
    event: 200
};
export var vues = {};
export var poppers = {};
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
    // Load pre-existing game data
    global = JSON.parse(LZString.decompressFromUTF16(global_data));
    Math.seed = global.seed;
}
else {
    runNew = true;
}

if (!global['settings']){
    global['settings'] = {
        civTabs: 0,
        showEvolve: true,
        showCity: false,
        showIndustry: false,
        showResearch: false,
        showCivic: false,
        showMarket: false,
        showGenetics: false,
        showSpace: false,
        animated: true,
        disableReset: false,
        theme: 'dark'
    }
}

if (!global.stats['reset']){
    global.stats['reset'] = 0;
}
if (!global.stats['plasmid']){
    global.stats['plasmid'] = 0;
}

if (!global['lastMsg']){
    global['lastMsg'] = false;
}

if (!global.race['Plasmid']){
    global.race['Plasmid'] = { count: 0 };
}

$('html').addClass(global.settings.theme);

if (!global.city['calendar']){
    global.city['calendar'] = {
        day: 0,
        year: 0,
        weather: 2,
        temp: 1,
        moon: 0,
        wind: 0,
        orbit: 365
    };
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

if (!global.city['market']){
    global.city['market'] = {
        qty: 10,
        mtrade: 0,
        trade: 0,
        active: false
    };
}

if (!global.settings['arpa']){
    global.settings['arpa'] = {
        arpaTabs: 1,
        physics: true,
        genetics: false
    };
}

if (!global['arpa']){
    global['arpa'] = {};
}

if (global.lastMsg){
    messageQueue(global.lastMsg.m, global.lastMsg.c);
}

export function messageQueue(msg,color){
    color = color || 'warning';
    var new_message = $('<p class="has-text-'+color+'">'+msg+'</p>');
    $('#msgQueue').prepend(new_message);
    global.lastMsg = { m: msg, c: color };
}

export function modRes(res,val){
    let count = global.resource[res].amount + val;
    let depleted = false;
    if (count > global.resource[res].max){
        count = global.resource[res].max;
    }
    else if (count < 0){
        count = 0;
        depleted = true;
    }
    global.resource[res].amount = count;
    global.resource[res].delta += val;
    return depleted;
}

// Detect if shift is pressed down
export var shiftIsPressed = false;
$(document).keydown(function(event){
    if(event.which=="16"){
        shiftIsPressed = true;
    }
});
$(document).keyup(function(event){
    if(event.which=="16"){
        shiftIsPressed = false;
    }
});

// Detect if control is pressed down
export var cntrlIsPressed = false;
$(document).keydown(function(event){
    if(event.which=="17"){
        cntrlIsPressed = true;
    }
});
$(document).keyup(function(event){
    if(event.which=="17"){
        cntrlIsPressed = false;
    }
});

// Detect if alt is pressed down
export var altIsPressed = false;
$(document).keydown(function(event){
    if(event.which=="18"){
        altIsPressed = true;
    }
});
$(document).keyup(function(event){
    if(event.which=="18"){
        altIsPressed = false;
    }
});

export function keyMultiplier(){
    let number = 1;
    if (cntrlIsPressed){
        number *= 10;
    }
    if (shiftIsPressed){
        number *= 25;
    }
    if (altIsPressed){
        number *= 100;
    }
    return number;
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
