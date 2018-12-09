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
        var city_actions = ['food','lumber','stone'];
        for (var i = 0; i < city_actions.length; i++) {
            if (global.city[city_actions[i]]){
                addAction('city',city_actions[i]);
            }
        }
    }
    
    // Start game loop
    mainLoop();
});

// Main game loop
function mainLoop() {
    intervals['main'] = setInterval(function() {
        
        if (global.race.species === 'protoplasm'){
            // Early Evolution Game
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
            if (global['resource']['RNA'].amount >= 2 && !global.race['dna']){
                global.race['dna'] = 1;
                addAction('evolution','dna');
                global.resource.DNA.display = true;
            }
            if (global['resource']['RNA'].amount >= 10 && !global.race['membrane']){
                global.race['membrane'] = { count: 0 };
                addAction('evolution','membrane');
            }
            if (global['resource']['DNA'].amount >= 4 && !global.race['organelles']){
                global.race['organelles'] = { count: 0 };
                addAction('evolution','organelles');
            }
            if (global.race['organelles'] && global.race['organelles'].count >= 2 && !global.race['nucleus']){
                global.race['nucleus'] = { count: 0 };
                addAction('evolution','nucleus');
            }
            if (global.race['nucleus'] && global.race['nucleus'].count >= 1 && !global.race['eukaryotic_cell']){
                global.race['eukaryotic_cell'] = { count: 0 };
                addAction('evolution','eukaryotic_cell');
            }
            if (global.race['eukaryotic_cell'] && global.race['eukaryotic_cell'].count >= 1 && !global.race['mitochondria']){
                global.race['mitochondria'] = { count: 0 };
                addAction('evolution','mitochondria');
            }
            if (global.race['mitochondria'] && global.race['mitochondria'].count >= 1 && !global.race['sexual_reproduction']){
                global.race['sexual_reproduction'] = { count: 0 };
                addAction('evolution','sexual_reproduction');
            }
        }
        else {
            // Rest of game
        }
        
        Object.keys(global.resource).forEach(function (res) {
            global['resource'][res].diff = Math.round(global['resource'][res].amount - global['resource'][res].last);
            global['resource'][res].last = global['resource'][res].amount;
        });
        
        // Save game state
        save.setItem('evolved',JSON.stringify(global));
    }, 1000);
}

function addAction(action,type){
    
    var id = actions[action][type].id;
    var element = $('<a id="'+id+'" class="button is-dark" v-on:click="action">{{ title }}</a>');
    $('#'+action).append(element);
    vues[id] = new Vue({
        data: {
            title: typeof actions[action][type].title === 'string' ? actions[action][type].title : actions[action][type].title()
        },
        methods: {
            action: function(){ actions[action][type].action() }
        },
    });
    vues[id].$mount('#'+id);
    var popper = $('<div id="pop'+id+'" class="popper has-background-light has-text-dark"></div>');
    popper.hide();
    actionDesc(popper,action,type);
    $('#main').append(popper);
    $('#'+id).on('mouseover',function(){
            popper.show();
            new Popper($('#'+id),popper);
        });
    $('#'+id).on('mouseout',function(){
            popper.hide();
        });
}

function actionDesc(parent,action,type){
    var desc = typeof actions[action][type].desc === 'string' ? actions[action][type].desc : actions[action][type].desc();
    parent.append($('<div>'+desc+'</div>'));
    if (actions[action][type].cost){ 
        var cost = $('<div></div>');
        Object.keys(actions[action][type].cost).forEach(function (res) {
            cost.append($('<div>'+res+': '+actions[action][type].cost[res]()+'</div>'));
        });
        parent.append(cost);
    }
    if (actions[action][type].effect){ 
        var effect = typeof actions[action][type].effect === 'string' ? actions[action][type].effect : actions[action][type].effect();
        parent.append($('<div>'+effect+'</div>')); 
    }
}

function newGame(){
    global['race'] = { species : 'protoplasm' };
    Math.seed = Math.rand(0,1000);
    global.seed = Math.seed;
}
