import { global, vues } from './vars.js';
import { races } from './races.js';

export const resource_values = {
    Food: 5,
    Lumber: 5,
    Stone: 5,
    Copper: 25,
    Iron: 40,
    Cement: 15,
    Coal: 20,
    Steel: 100
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
        loadResource('Money',1000,3,false,false,'success');
        loadResource(races[global.race.species].name,0,1,false,false,'warning');
        loadResource('Knowledge',100,1,false,false,'warning');
        loadResource('Crates',0,0,false,false,'warning');
        loadResource('Food',250,1,true,true);
        loadResource('Lumber',250,1,true,true);
        loadResource('Stone',250,1,true,true);
        loadResource('Copper',100,1,true,true);
        loadResource('Iron',100,1,true,true);
        loadResource('Cement',100,1,true,true);
        loadResource('Coal',50,1,true,true);
        loadResource('Steel',50,1,true,true);
        //loadResource('Titanium',50,1,true,true);
        //loadResource('Iridium',50,1,true,true);
        //loadResource('Deuterium',20,1,true,true);
    }
}

// Load resource function
// This function defines each resource, loads saved values from localStorage
// And it creates Vue binds for various resource values
function loadResource(name,max,rate,tradable,stackable,color) {
    color = color || 'info';
    if (!global['resource'][name]){
        global['resource'][name] = {
            name: name === 'Money' ? '$' : name,
            display: false,
            value: resource_values[name],
            amount: 0,
            crates: 0,
            last: 0,
            diff: 0,
            max: max,
            rate: rate
        };
    }
    global['resource'][name]['stackable'] = stackable;
    if (!global['resource'][name]['crates']){
        global['resource'][name]['crates'] = 0;
    }
    
    var res_container = $(`<div id="res-${name}" class="resource" v-show="display"><span class="res has-text-${color}">{{ name }}</span><span class="count">{{ amount | size }} / {{ max | size }}</span></div>`);
    
    if (stackable){
        res_container.append($('<span><span v-if="showTrigger()" class="interact has-text-success" @click="trigModal">+</span></span>'));
    }
    else {
        res_container.append($('<span></span>'));
    }
    
    if (name !== races[global.race.species].name && name !== 'Crates'){
        res_container.append($('<span class="diff">{{ diff | diffSize }} /s</span></div>'));
    }
    
    $('#resources').append(res_container);
    
    var modal = {
            template: '<div id="modalBox" class="modalBox"></div>'
        };
    
    vues['res_'+name] = new Vue({
        data: global['resource'][name], 
        filters: {
            size: function (value){
                return sizeApproximation(value,0);
            },
            diffSize: function (value){
                return sizeApproximation(value,2);
            }
        },
        methods: {
            trigModal: function(){
                this.$modal.open({
                    parent: this,
                    component: modal
                });
                
                var checkExist = setInterval(function() {
                   if ($('#modalBox').length > 0) {
                      clearInterval(checkExist);
                      drawModal(name,color);
                   }
                }, 50);
            },
            showTrigger: function(){
                return global.resource.Crates.display;
            }
        }
    });
    vues['res_'+name].$mount('#res-' + name);
    
    if (tradable){
        var market_item = $(`<div id="market-${name}" class="market-item" v-show="display"></div>`);
        market_item.append($(`<span class="res has-text-${color}">{{ name }}</span>`));
        $('#market').append(market_item);
        marketItem('market_'+name,'#market-'+name,market_item,name,color);
    }
}

function marketItem(vue,mount,market_item,name,color){
    market_item.append($('<span class="buy"><span class="has-text-success">BUY</span></span>'));
    market_item.append($(`<span class="order" @click="purchase('${name}')">\${{ value | buy }}</span>`));
    
    market_item.append($('<span class="sell"><span class="has-text-danger">SELL</span></span>'));
    market_item.append($(`<span class="order" @click="sell('${name}')">\${{ value | sell }}</span>`));
    
    vues[vue] = new Vue({
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
                    let divide = global.race['merchant'] ? 3 : (global.race['asymmetrical'] ? 5 : 4);
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
                let divide = global.race['merchant'] ? 3 : (global.race['asymmetrical'] ? 5 : 4);
                return sizeApproximation(value * vues['market_qty'].qty / divide,0);
            },
        }
    });
    vues[vue].$mount(mount);
}

function drawModal(name,color){
    $('#modalBox').append($('<p id="modalBoxTitle" class="has-text-warning modalTitle">{{ name }} - {{ amount | size }}/{{ max | size }}</p>'));
    
    let body = $('<div class="modalBody"></div>');
    $('#modalBox').append(body);
    
    vues['modalCrates'] = new Vue({
        data: { 
            crates: global['resource']['Crates'],
            res: global['resource'][name],
        },
        methods: {
            buildLabel: function(){
                return 'Construct a crate, cost 250 Lumber';
            },
            removeLabel: function(){
                return 'Remove crate from this resrouce (-25 cap)';
            },
            addLabel: function(){
                return 'Assign crate to this resource (+25 cap)';
            },
            buildCrate: function(res){
                if (global.resource.Lumber.amount >= 250 && global.resource.Crates.amount < global.resource.Crates.max){
                    global.resource.Lumber.amount -= 250;
                    global.resource.Crates.amount++;
                }
            },
            removeCrate: function(res){
                if (global.resource[res].crates > 0){
                    global.resource.Crates.amount++;
                    global.resource.Crates.max++;
                    global.resource[res].crates--;
                    global.resource[res].max -= 25;
                }
            },
            addCrate: function(res){
                if (global.resource.Crates.amount > 0){
                    global.resource.Crates.amount--;
                    global.resource.Crates.max--;
                    global.resource[res].crates++;
                    global.resource[res].max += 25;
                }
            }
        }
    });
    
    let crates = $('<div id="modalCrates" class="crates"></div>');
    body.append(crates);
    
    crates.append($('<div class="crateHead"><span>Crates Owned: {{ crates.amount }}/{{ crates.max }}</span><span>Crates Assigned: {{ res.crates }}</span></div>'));
    
    let buildCrate = $(`<b-tooltip :label="buildLabel()" position="is-top" type="is-dark" animated><button class="button" @click="buildCrate('${name}')">Construct Crate</button></b-tooltip>`);
    let removeCrate = $(`<b-tooltip :label="removeLabel()" position="is-top" type="is-dark" animated><button class="button" @click="removeCrate('${name}')">Unassign Crate</button></b-tooltip>`);
    let addCrate = $(`<b-tooltip :label="addLabel()" position="is-top" type="is-dark" animated><button class="button" @click="addCrate('${name}')">Assign Crate</button></b-tooltip>`);
    
    crates.append(buildCrate);
    crates.append(removeCrate);
    crates.append(addCrate);
    
    vues['modalCrates'].$mount('#modalCrates');
    
    vues['modal_res_'+name] = new Vue({
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
    vues['modal_res_'+name].$mount('#modalBoxTitle');
    
    if (global.tech['currency'] && global.tech['currency'] >= 2){
        var market_item = $(`<div id="pop_market" class="market-item" v-show="display"></div>`);
        body.append(market_item);
        marketItem('pop_market_'+name,'#pop_market',market_item,name,color);
    }
}

function initResControls(){
    var controls = $(`<div id="res-controller" class="resource" v-show="display"><span class="res has-text-${color}">{{ name }}</span><span class="count">{{ amount | size }} / {{ max | size }}</span></div>`);
    $('#resources').append(res_container);
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
