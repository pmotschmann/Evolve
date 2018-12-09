// Sets up resource definitions
function defineResources() {
    if (global.race.species === 'protoplasm'){
        loadResource('RNA',100,0);
        loadResource('DNA',100,0);
    }
    else {
        loadResource(races[global.race.species].name,0,0);
        loadResource('Food',1000,1);
        loadResource('Lumber',1000,1);
        loadResource('Stone',1000,1);
    }
}

// Load resource function
// This function defines each resource, loads saved values from localStorage
// And it creates Vue binds for various resource values
function loadResource(name,max,value) {
    if (!global['resource'][name]){
        global['resource'][name] = {
            name: name,
            display: false,
            value: value,
            amount: 0,
            last: 0,
            diff: 0,
            max: max
        };
    }
    
    if (global['resource'][name]['max'] > 0){
        var res_container = $('<div id="res-' + name + '" class="resource" v-show="display"><span class="res has-text-info">{{ name }}</span><span class="count">{{ amount }} / {{ max }}</span><span class="diff">({{ diff }} /s)</span></div>');
        $('#resources').append(res_container);
    }
    else {
        var res_container = $('<div id="res-' + name + '" class="resource" v-show="display"><span class="res has-text-info">{{ name }}</span><span class="count">{{ amount }}</span></div>');
        $('#resources').append(res_container);
    }
    
    vues['res_'+name] = new Vue({
        data: global['resource'][name]
    });
    vues['res_'+name].$mount('#res-' + name);
}
