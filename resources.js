import { global, vues } from './vars.js';
import { races } from './races.js';

export const resource_values = {
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

// Sets up resource definitions
export function defineResources() {
    if (global.race.species === 'protoplasm'){
        loadResource('RNA',100,1);
        loadResource('DNA',100,1);
    }
    else {
        loadResource('Money',1000,3,'success');
        loadResource(races[global.race.species].name,0,1,'warning');
        loadResource('Knowledge',100,1,'warning');
        loadResource('Food',250,1);
        loadResource('Lumber',250,1);
        loadResource('Stone',250,1);
        loadResource('Copper',100,1);
        loadResource('Iron',100,1);
        loadResource('Cement',100,1);
        //loadResource('Steel',50,1);
        //loadResource('Titanium',50,1);
        //loadResource('Iridium',50,1);
        //loadResource('Deuterium',20,1);
    }
}

// Load resource function
// This function defines each resource, loads saved values from localStorage
// And it creates Vue binds for various resource values
function loadResource(name,max,rate,color) {
    color = color || 'info';
    if (!global['resource'][name]){
        global['resource'][name] = {
            name: name === 'Money' ? '$' : name,
            display: false,
            value: resource_values[name],
            amount: 0,
            last: 0,
            diff: 0,
            max: max,
            rate: rate
        };
    }
    
    if (global['resource'][name]['max'] > 0){
        var res_container = $('<div id="res-' + name + '" class="resource" v-show="display"><span class="res has-text-' + color + '">{{ name }}</span><span class="count">{{ amount | size }} / {{ max | size }}</span><span class="diff">{{ diff | diffSize }} /s</span></div>');
        $('#resources').append(res_container);
    }
    else {
        var res_container = $('<div id="res-' + name + '" class="resource" v-show="display"><span class="res has-text-' + color + '">{{ name }}</span><span class="count">{{ amount | size }}</span><span class="diff">{{ diff | diffSize }} /s</span></div>');
        $('#resources').append(res_container);
    }
    
    vues['res_'+name] = new Vue({
        data: global['resource'][name],
        filters: {
            size: function (value){
                return sizeApproximation(value,0);
            },
            diffSize: function (value){
                return sizeApproximation(value,2);
            }
        }
    });
    vues['res_'+name].$mount('#res-' + name);
}

function sizeApproximation(value,precision){
    if (value <= 9999){
        return +value.toFixed(precision);
    }
    else if (value <= 1000000){
        return +(value / 1000).toFixed(1) + 'K';
    }
    else if (value <= 1000000000){
        return +(value / 1000000).toFixed(1) + 'M';
    }
    else if (value <= 1000000000000){
        return +(value / 1000000000).toFixed(1) + 'G';
    }
    else if (value <= 1000000000000000){
        return +(value / 1000000000000).toFixed(1) + 'T';
    }
    else if (value <= 1000000000000000000){
        return +(value / 1000000000000000).toFixed(1) + 'P';
    }
    else if (value <= 1000000000000000000000){
        return +(value / 1000000000000000000).toFixed(1) + 'E';
    }
    else if (value <= 1000000000000000000000000){
        return +(value / 1000000000000000000000).toFixed(1) + 'Z';
    }
    else {
        return +(value / 1000000000000000000000000).toFixed(1) + 'Y';
    }
}
