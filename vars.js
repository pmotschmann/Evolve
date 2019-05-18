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
export var breakdown = {
    c: {},
    p: {}
};

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
    let saveState = JSON.parse(LZString.decompressFromUTF16(global_data));
    if (saveState){
        global = saveState;
        Math.seed = global.seed;
    }
    else {
        newGameData();
    }
}
else {
    newGameData();
}

global['version'] = '0.2.60';

if (global.civic['cement_worker'] && global.civic.cement_worker.impact === 0.25){
    global.civic.cement_worker.impact = 0.4;
}

$('#topBar .version > a').html('v'+global.version);

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
        showAchieve: false,
        animated: true,
        disableReset: false,
        theme: 'dark'
    }
}

if (!global.settings['showAchieve']){
    global.settings['showAchieve'] = false;
}
if (!global.settings['resTabs']){
    global.settings['resTabs'] = 0;
}
if (typeof global.settings.mKeys === 'undefined'){
    global.settings['mKeys'] = true;
}

if (!global.stats['reset']){
    global.stats['reset'] = 0;
}
if (!global.stats['plasmid']){
    global.stats['plasmid'] = 0;
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

if (!global['lastMsg']){
    global['lastMsg'] = false;
}

if (!global.race['Plasmid']){
    global.race['Plasmid'] = { count: 0 };
}

$('html').addClass(global.settings.theme);

if (!global.city['morale']){
    global.city['morale'] = {
        current: 0,
        stress: 0,
        entertain: 0,
        season: 0,
        weather: 0
    };
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
        arpaTabs: 0,
        physics: true,
        genetics: false
    };
}

if (!global.settings.arpa['crispr']){
    global.settings.arpa['crispr'] = false;
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

if (global.lastMsg){
    messageQueue(global.lastMsg.m, global.lastMsg.c);
}

if (global['new']){
    messageQueue('You are protoplasm in the primordial ooze', 'warning');
    global['new'] = false;
}

function newGameData(){
    global['race'] = { species : 'protoplasm', gods: 'none' };
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;
    global['new'] = true;
}

export function messageQueue(msg,color){
    color = color || 'warning';
    var new_message = $('<p class="has-text-'+color+'">'+msg+'</p>');
    $('#msgQueue').prepend(new_message);
    global.lastMsg = { m: msg, c: color };
    if ($('#msgQueue').children().length > 30){
        $('#msgQueue').children().last().remove();
    }
}

export function modRes(res,val){
    let count = global.resource[res].amount + val;
    let success = true;
    if (count > global.resource[res].max && global.resource[res].max != -1){
        count = global.resource[res].max;
    }
    else if (count < 0){
        count = 0;
        success = false;
    }
    global.resource[res].amount = count;
    global.resource[res].delta += val;
    return success;
}

export var shiftIsPressed = false;
export var cntrlIsPressed = false;
export var altIsPressed = false;
$(document).keydown(function(e){
    cntrlIsPressed = e.ctrlKey ? true : false;
    shiftIsPressed = e.shiftKey ? true : false;
    altIsPressed = e.altKey ? true : false;
});
$(document).keyup(function(e){
    cntrlIsPressed = e.ctrlKey ? true : false;
    shiftIsPressed = e.shiftKey ? true : false;
    altIsPressed = e.altKey ? true : false;
});

window.onmousemove = function(e){
    cntrlIsPressed = e.ctrlKey ? true : false;
    shiftIsPressed = e.shiftKey ? true : false;
    altIsPressed = e.altKey ? true : false;
}

export var keyMultiplierNumber = 1;
export function keyMultiplier(){
    let number = 1;
    if (global.settings['mKeys']){
        if (cntrlIsPressed){
            number *= 10;
        }
        if (shiftIsPressed){
            number *= 25;
        }
        if (altIsPressed){
            number *= 100;
        }
    }
    keyMultiplierNumber = number;
    $('.craft').each(function(e){
        if (typeof $(this).data('val') === 'number'){
            $(this).html(sizeApproximation($(this).data('val') * number,1));
        }
    });
    return number;
}

function resizeGame(){
    if ($(window).width() >= 1400 && $('#msgQueue:not(.right)')){
        let queue = $('#msgQueue').detach();
        queue.addClass('right');
        queue.removeClass('has-text-info');
        $('#queueColumn').addClass('is-one-quarter');
        $('#queueColumn').append(queue);
        $('#mainColumn').removeClass('is-three-quarters');
        $('#mainColumn').addClass('is-half');
    }
    else if ($(window).width() < 1400 && $('#msgQueue').hasClass('right')){
        let queue = $('#msgQueue').detach();
        queue.removeClass('right');
        queue.addClass('has-text-info');
        $('#queueColumn').removeClass('is-one-quarter');
        $('#sideQueue').append(queue);
        $('#mainColumn').removeClass('is-half');
        $('#mainColumn').addClass('is-three-quarters');
    }
}

export function sizeApproximation(value,precision,fixed){
    if (value <= 9999){
        return +value.toFixed(precision);
    }
    else if (value <= 1000000){
        return fixed ? +(value / 1000).toFixed(1) + 'K' : (Math.floor(value / 100) / 10) + 'K';
    }
    else if (value <= 1000000000){
        return fixed ? +(value / 1000000).toFixed(1) + 'M' : (Math.floor(value / 100000) / 10) + 'M';
    }
    else if (value <= 1000000000000){
        return fixed ? +(value / 1000000000).toFixed(1) + 'G' : (Math.floor(value / 100000000) / 10) + 'G';
    }
    else if (value <= 1000000000000000){
        return fixed ? +(value / 1000000000000).toFixed(1) + 'T' : (Math.floor(value / 100000000000) / 10) + 'T';
    }
    else if (value <= 1000000000000000000){
        return fixed ? +(value / 1000000000000000).toFixed(1) + 'P' : (Math.floor(value / 100000000000000) / 10) + 'P';
    }
    else if (value <= 1000000000000000000000){
        return fixed ? +(value / 1000000000000000000).toFixed(1) + 'E' : (Math.floor(value / 100000000000000000) / 10) + 'E';
    }
    else if (value <= 1000000000000000000000000){
        return fixed ? +(value / 1000000000000000000000).toFixed(1) + 'Z' : (Math.floor(value / 100000000000000000000) / 10) + 'Z';
    }
    else {
        return fixed ? +(value / 1000000000000000000000000).toFixed(1) + 'Y' : (Math.floor(value / 100000000000000000000000) / 10) + 'Y';
    }
}

$(window).resize(function(){
    resizeGame();
});

resizeGame();

window.exportGame = function exportGame(){
    $('#importExport').val(LZString.compressToBase64(JSON.stringify(global)));
    $('#importExport').select();
    document.execCommand('copy');
}

window.importGame = function importGame(){
    if ($('#importExport').val().length > 0){
        let saveState = JSON.parse(LZString.decompressFromBase64($('#importExport').val()));
        if (saveState && 'evolution' in saveState && 'settings' in saveState && 'stats' in saveState && 'plasmid' in saveState.stats){
            global = saveState;
            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
            window.location.reload();
        }
    }
}

// executes a hard reset
window.reset = function reset(){
    localStorage.removeItem('evolved');
    global = null;
    window.location.reload();
}
