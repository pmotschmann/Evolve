import { global, vues } from './vars.js';
import { races } from './races.js';

export const resource_values = {
    Food: 5,
    Lumber: 5,
    Stone: 5,
    Copper: 25,
    Iron: 40,
    Cement: 15,
    //Steel: 100,
    //Titanium: 150,
    //Iridium: 200,
    //Deuterium: 500
};

// Sets up resource definitions
export function defineResources() {
    if (global.race.species === 'protoplasm'){
        loadResource('RNA',100,1,false);
        loadResource('DNA',100,1,false);
    }
    else {
        initMarket();
        loadResource('Money',1000,3,false,'success');
        loadResource(races[global.race.species].name,0,1,false,'warning');
        loadResource('Knowledge',100,1,false,'warning');
        loadResource('Food',250,1,true);
        loadResource('Lumber',250,1,true);
        loadResource('Stone',250,1,true);
        loadResource('Copper',100,1,true);
        loadResource('Iron',100,1,true);
        loadResource('Cement',100,1,true);
        //loadResource('Steel',50,1,true);
        //loadResource('Titanium',50,1,true);
        //loadResource('Iridium',50,1,true);
        //loadResource('Deuterium',20,1,true);
    }
}

// Load resource function
// This function defines each resource, loads saved values from localStorage
// And it creates Vue binds for various resource values
function loadResource(name,max,rate,tradable,color) {
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
    
    if (tradable){
        var market_item = $('<div id="market-' + name + '" class="market-item" v-show="display"></div>');
        $('#market').append(market_item);
        
        market_item.append($('<span class="res has-text-' + color + '">{{ name }}</span>'));
        
        market_item.append($('<span class="buy"><span class="has-text-success">BUY</span></span>'));
        market_item.append($('<span class="order" @click="purchase(\''+name+'\')">${{ value | buy }}</span>'));
        
        market_item.append($('<span class="sell"><span class="has-text-danger">SELL</span></span>'));
        market_item.append($('<span class="order" @click="sell(\''+name+'\')">${{ value | sell }}</span>'));
        
        vues['market_'+name] = new Vue({
            data: global['resource'][name],
            methods: {
                purchase(res){
                    var qty = Number(vues['market_qty'].qty);
                    var price = Math.round(global.resource[res].value * qty);
                    if (global.resource.Money.amount >= price){
                        global.resource[res].amount += qty;
                        global.resource.Money.amount -= price;
                        
                        global.resource[res].value += Number((qty / Math.rand(1000,10000)).toFixed(2));
                    }
                },
                sell(res){
                    var qty = Number(vues['market_qty'].qty);
                    if (global.resource[res].amount >= qty){
                        let divide = global.race['merchant'] ? 5 : 4;
                        let price = Math.round(global.resource[res].value * qty / divide);
                        global.resource[res].amount -= qty;
                        global.resource.Money.amount += price;
                        
                        global.resource[res].value -= Number((qty / Math.rand(1000,10000)).toFixed(2));
                        if (global.resource[res].value < Number(resource_values[res] / 2)){
                            global.resource[res].value = Number(resource_values[res] / 2);
                        }
                    }
                }
            },
            filters: {
                buy: function (value){
                    return sizeApproximation(value * vues['market_qty'].qty,0);
                },
                sell: function (value){
                    let divide = global.race['merchant'] ? 5 : 4;
                    return sizeApproximation(value * vues['market_qty'].qty / divide,0);
                },
            }
        });
        vues['market_'+name].$mount('#market-' + name);
    }
}

function initMarket(){
    var market = $('<div id="market-qty" class="market-header"></div>');
    $('#market').append(market);
    
    market.append($('<b-radio v-model="qty" native-value="10">10x</b-radio>'));
    market.append($('<b-radio v-model="qty" native-value="25">25x</b-radio>'));
    market.append($('<b-radio v-model="qty" native-value="100">100x</b-radio>'));
    if (global.tech['currency'] >= 4){
        market.append($('<b-radio v-model="qty" native-value="250">250x</b-radio>'));
        market.append($('<b-radio v-model="qty" native-value="1000">1000x</b-radio>'));
        market.append($('<b-radio v-model="qty" native-value="2500">2500x</b-radio>'));
    }
    if (global.tech['currency'] >= 6){
        market.append($('<b-radio v-model="qty" native-value="10000">10000x</b-radio>'));
        market.append($('<b-radio v-model="qty" native-value="25000">25000x</b-radio>'));
    }
    
    vues['market_qty'] = new Vue({
        data: { qty: '10' }
    });
    vues['market_qty'].$mount('#market-qty');
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
