// Main game init
$(function() {
    //localStorage.clear();
    var global_data = save.getItem('evolved') || false;
    if (global_data) {
        // Load preexiting game data
        global = JSON.parse(global_data);
        Math.seed = global.seed;
    }
    else {
        newGame();
    }
    
    vues['vue_tabs'] = new Vue(global.main_tabs);
    vues['vue_tabs'].$mount('#tabs');
    
    // Load Resources
    defineResources();
    defineJobs();
    
    vues['race'] = new Vue({
        data: global.race,
        methods: {
            name: function(){
                return races[global.race.species].name;
            },
            desc: function(){
                return races[global.race.species].desc;
            }
        }
    });
    vues['race'].$mount('#race');
    
    if (global.race.species === 'protoplasm'){
        global.resource.RNA.display = true;
        addAction('evolution','rna');
        var evolve_actions = ['dna','membrane','organelles','nucleus','eukaryotic_cell','mitochondria'];
        for (var i = 0; i < evolve_actions.length; i++) {
            if (global.race[evolve_actions[i]]){
                addAction('evolution',evolve_actions[i]);
            }
        }
        if (global.race['sexual_reproduction'] && !global.race['phagocytosis'] && !global.race['chloroplasts'] && !global.race['chitin']){
            addAction('evolution','sexual_reproduction');
        }
        else if (global.race['phagocytosis'] && global.race['phagocytosis'].count == 0){
            addAction('evolution','phagocytosis');
        }
        else if (global.race['chloroplasts'] && global.race['chloroplasts'].count == 0){
            addAction('evolution','chloroplasts');
        }
        else if (global.race['chitin'] && global.race['chitin'].count == 0){
            addAction('evolution','chitin');
        }
        else if ((global.race['phagocytosis'] || global.race['chloroplasts'] || global.race['chitin']) && !global.race['multicellular']){
            if (global.race['phagocytosis']){
                addAction('evolution','phagocytosis');
            }
            else if (global.race['chloroplasts']){
                addAction('evolution','chloroplasts');
            }
            else if (global.race['chitin']){
                addAction('evolution','chitin');
            }
        }
        else {
            var late_actions = ['multicellular','spores','poikilohydric','bilateral_symmetry','bryophyte','protostomes','deuterostome','vascular','homoiohydric','athropods','mammals','eggshell','sentience'];
            for (var i = 0; i < late_actions.length; i++) {
                if (global.race[late_actions[i]] && global.race[late_actions[i]].count == 0){
                    addAction('evolution',late_actions[i]);
                }
            }
        }
    }
    else {
        var city_actions = ['food','lumber','stone','farm','mill','basic_housing','rock_quarry'];
        for (var i = 0; i < city_actions.length; i++) {
            if (global.race['tree_hugger'] && city_actions[i] === 'lumber'){
                continue;
            }
            if (global.city[city_actions[i]]){
                addAction('city',city_actions[i]);
            }
        }
        Object.keys(actions.tech).forEach(function (tech) {
            if (global.tech[tech] && global.tech[tech] === 0){
                addAction('tech',tech);
            }
        });
    }
    
    // Start game loop
    mainLoop();
});

// Main game loop
function mainLoop() {
    var timer = global.race['slow'] ? 1100 : (global.race['hyper'] ? 950 : 1000);
    intervals['main'] = setInterval(function() {
        
        if (global.race.species === 'protoplasm'){
            // Early Evolution Game
            
            // Gain RNA & DNA
            if (global.race['nucleus'] && global['resource']['DNA'].amount < global['resource']['DNA'].max){
                var increment = global.race['nucleus'].count;
                while (global['resource']['RNA'].amount < increment * 2){
                    increment--;
                    if (increment <= 0){ break; }
                }
                var count = global['resource']['DNA'].amount + increment;
                if (count > global['resource']['DNA'].max){ count = global['resource']['DNA'].max; }
                global['resource']['DNA'].amount = count;
                global['resource']['RNA'].amount -= increment * 2;
            }
            if (global.race['organelles'] && global['resource']['RNA'].amount < global['resource']['RNA'].max){
                var count = global['resource']['RNA'].amount + global.race['organelles'].count;
                if (count > global['resource']['RNA'].max){ count = global['resource']['RNA'].max; }
                global['resource']['RNA'].amount = count;
            }
            // Detect new unlocks
            if (global['resource']['RNA'].amount >= 2 && !global.race['dna']){
                global.race['dna'] = 1;
                addAction('evolution','dna');
                global.resource.DNA.display = true;
            }
            else if (global['resource']['RNA'].amount >= 10 && !global.race['membrane']){
                global.race['membrane'] = { count: 0 };
                addAction('evolution','membrane');
            }
            else if (global['resource']['DNA'].amount >= 4 && !global.race['organelles']){
                global.race['organelles'] = { count: 0 };
                addAction('evolution','organelles');
            }
            else if (global.race['organelles'] && global.race['organelles'].count >= 2 && !global.race['nucleus']){
                global.race['nucleus'] = { count: 0 };
                addAction('evolution','nucleus');
            }
            else if (global.race['nucleus'] && global.race['nucleus'].count >= 1 && !global.race['eukaryotic_cell']){
                global.race['eukaryotic_cell'] = { count: 0 };
                addAction('evolution','eukaryotic_cell');
            }
            else if (global.race['eukaryotic_cell'] && global.race['eukaryotic_cell'].count >= 1 && !global.race['mitochondria']){
                global.race['mitochondria'] = { count: 0 };
                addAction('evolution','mitochondria');
            }
            else if (global.race['mitochondria'] && global.race['mitochondria'].count >= 1 && !global.race['sexual_reproduction']){
                global.race['sexual_reproduction'] = { count: 0 };
                addAction('evolution','sexual_reproduction');
            }
        }
        else {
            // Rest of game
            
            // Consumption
            var fed = true;
            if (global.resource[races[global.race.species].name].amount >= 1 || global.city['farm']){
                var farms = 0;
                if (global.city['farm']){
                    farms = global.city['farm'].count;
                }
                var count = global.resource.Food.amount + farms - (global.resource[races[global.race.species].name].amount * (global.race['gluttony'] ? ((global.race['gluttony'] * 0.25) + 1) : 1));
                if (count > global.resource.Food.max){ 
                    count = global.resource.Food.max;
                }
                else if (count < 0){
                    fed = false;
                    count = 0;
                }
                global.resource.Food.amount = count;
            }
            
            // Citizen Growth
            if (fed && global['resource']['Food'].amount > 10 && global['resource'][races[global.race.species].name].max > global['resource'][races[global.race.species].name].amount){
                if(Math.rand(0,2 * global['resource'][races[global.race.species].name].amount) == 0){
                    global['resource'][races[global.race.species].name].amount++;
                }
            }
            
            // Income
            if (fed && global.tech['currency'] >= 1){
                var income = global.resource[races[global.race.species].name].amount * ( global.race['greedy'] ? 0.5 : 1 );
                var count = global.resource.Money.amount + income;
                if (count > global.resource.Money.max){ count = global.resource.Money.max; }
                global.resource.Money.amount = count;
            }
            
            // Knowledge
            if (fed){
                var count = global.resource.Knowledge.amount + 1;
                if (count > global.resource.Knowledge.max){ count = global.resource.Knowledge.max; }
                global.resource.Knowledge.amount = count;
            }
            
            // Detect new unlocks
            if (global.tech['agriculture'] >= 1 && !global.city['farm'] && checkCosts(actions.city.farm.cost)){
                global.city['farm'] = { count: 0 };
                addAction('city','farm');
            }
            else if (global.tech['housing'] >= 1 && !global.city['basic_housing'] && checkCosts(actions.city.basic_housing.cost)){
                global.city['basic_housing'] = { count: 0 };
                addAction('city','basic_housing');
            }
            else if (!global.main_tabs.data.showResearch && global['resource'][races[global.race.species].name].amount > 0){
                global.main_tabs.data.showResearch = true;
                global.main_tabs.data.showCivic = true;
                registerTech('science');
                registerTech('currency');
            }
        }
        
        Object.keys(global.resource).forEach(function (res) {
            global['resource'][res].diff = Math.round(global['resource'][res].amount - global['resource'][res].last);
            global['resource'][res].last = global['resource'][res].amount;
        });
        
        // Save game state
        save.setItem('evolved',JSON.stringify(global));
    }, timer);
}

function registerTech(tech){
    global.tech[tech] = 0;
    addAction('tech',tech);
}

function newGame(){
    global['race'] = { species : 'protoplasm', gods: 'none' };
    Math.seed = Math.rand(0,1000);
    global.seed = Math.seed;
}

function cheat(){
    global.resource.DNA.max = 10000;
    global.resource.RNA.max = 10000;
    global.resource.DNA.amount = 10000;
    global.resource.RNA.amount = 10000;
}

// executes a hard reset
function reset(){
    localStorage.removeItem('evolved');
    global = null;
    window.location.reload();
}
