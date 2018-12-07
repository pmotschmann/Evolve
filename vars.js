var save = window.localStorage;
var intervals = {};
var global = {
    seed: 1,
    resource: {}
};

const main_tabs = {
    data() {
        return {
            civTabs: 0
        }
    }
}
var vues = {};

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
