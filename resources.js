import { global, vues, keyMultiplier, modRes, poppers } from './vars.js';
import { races } from './races.js';

export const resource_values = {
    Food: 5,
    Lumber: 5,
    Stone: 5,
    Furs: 8,
    Copper: 25,
    Iron: 40,
    Cement: 15,
    Coal: 20,
    Oil: 75,
    Uranium: 550,
    Steel: 100,
    Titanium: 150,
    Alloy: 275,
    Polymer: 225,
    //Iridium: 200,
    //Deuterium: 450,
    //'Helium-3': 600,
    //Neutronium: 1000
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
        loadResource('Containers',0,0,false,false,'warning');
        loadResource('Food',250,1,true,true);
        loadResource('Lumber',200,1,true,true);
        loadResource('Stone',200,1,true,true);
        loadResource('Furs',100,1,true,true);
        loadResource('Copper',100,1,true,true);
        loadResource('Iron',100,1,true,true);
        loadResource('Cement',100,1,true,true);
        loadResource('Coal',50,1,true,true);
        loadResource('Oil',0,1,true,false);
        loadResource('Uranium',10,1,true,false);
        loadResource('Steel',50,1,true,true);
        loadResource('Titanium',50,1,true,true);
        loadResource('Alloy',50,1,true,true);
        loadResource('Polymer',50,1,true,true);
        //loadResource('Iridium',50,1,true,true);
        //loadResource('Deuterium',0,1,true,false);
        //loadResource('Helium-3',0,1,true,false);
        //loadResource('Neutronium',0,1,true,true);
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
            diff: 0,
            delta: 0,
            max: max,
            rate: rate
        };
    }
    global['resource'][name]['stackable'] = stackable;
    if (!global['resource'][name]['crates']){
        global['resource'][name]['crates'] = 0;
    }
    if (!global['resource'][name]['containers']){
        global['resource'][name]['containers'] = 0;
    }
    if (!global['resource'][name]['delta']){
        global['resource'][name]['delta'] = 0;
    }
    if (!global['resource'][name]['trade'] && tradable){
        global['resource'][name]['trade'] = 0;
    }
    
    var res_container = $(`<div id="res-${name}" class="resource" v-show="display"><span class="res has-text-${color}">{{ name }}</span><span class="count">{{ amount | size }} / {{ max | size }}</span></div>`);
    if (stackable){
        res_container.append($(`<span><span id="con${name}" v-if="showTrigger()" class="interact has-text-success" @click="trigModal">+</span></span>`));
    }
    else {
        res_container.append($('<span></span>'));
    }
    
    if (name !== races[global.race.species].name && name !== 'Crates' && name !== 'Containers'){
        res_container.append($('<span class="diff">{{ diff | diffSize }} /s</span></div>'));
    }
    
    $('#resources').append(res_container);

    var modal = {
            template: '<div id="modalBox" class="modalBox"></div>'
        };
    
    vues[`res_${name}`] = new Vue({
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
    vues[`res_${name}`].$mount(`#res-${name}`);
    
    if (stackable){
        $(`#con${name}`).on('mouseover',function(){
            var popper = $(`<div id="popContainer${name}" class="popper has-background-light has-text-dark"></div>`);
            $('#main').append(popper);
            popper.append($(`<div>Crates ${global.resource[name].crates}</div>`));
            if (global.tech['steel_container']){
                popper.append($(`<div>Containers ${global.resource[name].containers}</div>`));
            }
            popper.show();
            poppers[name] = new Popper($(`#con${name}`),popper);
        });
        $(`#con${name}`).on('mouseout',function(){
            $(`#popContainer${name}`).hide();
            poppers[name].destroy();
            $(`#popContainer${name}`).remove();
        });
    }

    if (tradable){
        var market_item = $(`<div id="market-${name}" class="market-item" v-show="r.display"></div>`);
        $('#market').append(market_item);
        marketItem(`market_${name}`,`#market-${name}`,market_item,name,color,true);
    }
}

function marketItem(vue,mount,market_item,name,color,full){
    if (full){
        market_item.append($(`<span class="res has-text-${color}">{{ r.name }}</span>`));
    }

    market_item.append($('<span class="buy"><span class="has-text-success">BUY</span></span>'));
    market_item.append($(`<span class="order" @click="purchase('${name}')">\${{ r.value | buy }}</span>`));
    
    market_item.append($('<span class="sell"><span class="has-text-danger">SELL</span></span>'));
    market_item.append($(`<span class="order" @click="sell('${name}')">\${{ r.value | sell }}</span>`));

    if (full){
        let trade = $('<span class="trade" v-show="m.active"><span class="has-text-warning">Routes</span></span>');
        market_item.append(trade);
        trade.append($(`<b-tooltip :label="aSell()" position="is-bottom" size="is-small" multilined animated><span class="sub" @click="autoSell('${name}')">&laquo;</span></b-tooltip>`));
        trade.append($(`<span class="current">{{ r.trade | trade }}</span>`));
        trade.append($(`<b-tooltip :label="aBuy()" position="is-bottom" size="is-small" multilined animated><span class="add" @click="autoBuy('${name}')">&raquo;</span></b-tooltip>`));
        tradeRouteColor(name);
    }
    
    vues[vue] = new Vue({
        data: { 
            r: global.resource[name],
            m: global.city.market
        },
        methods: {
            aSell(){
                return 'Auto-sell 1 unit per second at market value';
            },
            aBuy(){
                return 'Auto-buy 1 unit per second at market value';
            },
            purchase(res){
                let qty = Number(vues['market_qty'].qty);
                let value = global.race['arrogant'] ? Math.round(global.resource[res].value * 1.1) : global.resource[res].value;
                var price = Math.round(value * qty);
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
            },
            autoBuy(res){
                if (global.resource[res].trade >= 0){
                    if (global.city.market.trade < global.city.market.mtrade){
                        global.city.market.trade++;
                        global.resource[res].trade++;
                    }
                }
                else {
                    global.city.market.trade--;
                    global.resource[res].trade++;
                }
                tradeRouteColor(res);
            },
            autoSell(res){
                if (global.resource[res].trade <= 0){
                    if (global.city.market.trade < global.city.market.mtrade){
                        global.city.market.trade++;
                        global.resource[res].trade--;
                    }
                }
                else {
                    global.city.market.trade--;
                    global.resource[res].trade--;
                }
                tradeRouteColor(res);
            }
        },
        filters: {
            buy(value){
                if (global.race['arrogant']){
                    value = Math.round(value * 1.1);
                }
                return sizeApproximation(value * vues['market_qty'].qty,0);
            },
            sell(value){
                let divide = global.race['merchant'] ? 3 : (global.race['asymmetrical'] ? 5 : 4);
                return sizeApproximation(value * vues['market_qty'].qty / divide,0);
            },
            trade(val){
                if (val < 0){
                    val = 0 - val;
                }
                return val;
            }
        }
    });
    vues[vue].$mount(mount);
}

function tradeRouteColor(res){
    $(`#market-${res} .trade .current`).removeClass('has-text-warning');
    $(`#market-${res} .trade .current`).removeClass('has-text-danger');
    $(`#market-${res} .trade .current`).removeClass('has-text-success');
    if (global.resource[res].trade > 0){
        $(`#market-${res} .trade .current`).addClass('has-text-success');
    }
    else if (global.resource[res].trade < 0){
        $(`#market-${res} .trade .current`).addClass('has-text-danger');
    }
    else {
        $(`#market-${res} .trade .current`).addClass('has-text-warning');
    }
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
            buildCrateLabel: function(){
                if (global.race['kindling_kindred']){
                    return 'Construct a crate, cost 250 Stone';
                }
                else {
                    return 'Construct a crate, cost 250 Lumber';
                }
            },
            removeCrateLabel: function(){
                let cap = global.tech.container >= 2 ? 30 : 25;
                if (global.race['pack_rat']){
                    cap += global.tech.container >= 2 ? 2 : 1;
                }
                if (global.tech.container >= 4){
                    cap += 10;
                }
                return `Remove crate from this resrouce (-${cap} cap)`;
            },
            addCrateLabel: function(){
                let cap = global.tech.container >= 2 ? 30 : 25;
                if (global.race['pack_rat']){
                    cap += global.tech.container >= 2 ? 2 : 1;
                }
                if (global.tech.container >= 4){
                    cap += 10;
                }
                return `Assign crate to this resource (+${cap} cap)`;
            },
            buildCrate: function(res){
                let keyMutipler = keyMultiplier();
                let material = global.race['kindling_kindred'] ? 'Stone' : 'Lumber';
                if (global.resource[material].amount >= (250 * keyMutipler) && global.resource.Crates.amount < global.resource.Crates.max){
                    modRes(material,-(250 * keyMutipler));
                    global.resource.Crates.amount += keyMutipler;
                }
            },
            removeCrate: function(res){
                let keyMutipler = keyMultiplier();
                let cap = global.tech.container >= 2 ? 30 : 25;
                if (global.tech.container >= 4){
                    cap += 10;
                }
                if (global.race['pack_rat']){
                    cap += global.tech.container >= 2 ? 2 : 1;
                }
                if (global.resource[res].crates >= keyMutipler){
                    global.resource.Crates.amount += keyMutipler;
                    global.resource.Crates.max += keyMutipler;
                    global.resource[res].crates -= keyMutipler;
                    global.resource[res].max -= (cap * keyMutipler);
                }
            },
            addCrate: function(res){
                let keyMutipler = keyMultiplier();
                let cap = global.tech.container >= 2 ? 30 : 25;
                if (global.tech.container >= 4){
                    cap += 10;
                }
                if (global.race['pack_rat']){
                    cap += global.tech.container >= 2 ? 2 : 1;
                }
                if (global.resource.Crates.amount >= keyMutipler){
                    global.resource.Crates.amount -= keyMutipler;
                    global.resource.Crates.max -= keyMutipler;
                    global.resource[res].crates += keyMutipler;
                    global.resource[res].max += (cap * keyMutipler);
                }
            }
        }
    });
    
    let crates = $('<div id="modalCrates" class="crates"></div>');
    body.append(crates);
    
    crates.append($('<div class="crateHead"><span>Crates Owned: {{ crates.amount }}/{{ crates.max }}</span><span>Crates Assigned: {{ res.crates }}</span></div>'));
    
    let buildCrate = $(`<b-tooltip :label="buildCrateLabel()" position="is-bottom" animated><button class="button" @click="buildCrate('${name}')">Construct Crate</button></b-tooltip>`);
    let removeCrate = $(`<b-tooltip :label="removeCrateLabel()" position="is-bottom" animated><button class="button" @click="removeCrate('${name}')">Unassign Crate</button></b-tooltip>`);
    let addCrate = $(`<b-tooltip :label="addCrateLabel()" position="is-bottom" animated><button class="button" @click="addCrate('${name}')">Assign Crate</button></b-tooltip>`);
    
    crates.append(buildCrate);
    crates.append(removeCrate);
    crates.append(addCrate);
    
    vues['modalCrates'].$mount('#modalCrates');
    
    if (global.city['warehouse'] && global.city['warehouse'].count > 0){
        vues['modalContainer'] = new Vue({
            data: { 
                containers: global['resource']['Containers'],
                res: global['resource'][name],
            },
            methods: {
                buildContainerLabel: function(){
                    return 'Construct a container, cost 100 Steel';
                },
                removeContainerLabel: function(){
                    let cap = global.tech.steel_container >= 3 ? 75 : 50;
                    if (global.race['pack_rat']){
                        cap += global.tech.steel_container >= 3 ? 3 : 2;
                    }
                    return `Remove container from this resrouce (-${cap} cap)`;
                },
                addContainerLabel: function(){
                    let cap = global.tech.steel_container >= 3 ? 75 : 50;
                    if (global.race['pack_rat']){
                        cap += global.tech.steel_container >= 3 ? 3 : 2;
                    }
                    return `Assign container to this resource (+${cap} cap)`;
                },
                buildContainer: function(res){
                    let keyMutipler = keyMultiplier();
                    if (global.resource['Steel'].amount >= (100 * keyMutipler) && global.resource.Containers.amount < global.resource.Containers.max){
                        modRes('Steel',-(100 * keyMutipler));
                        global.resource.Containers.amount += keyMutipler;
                    }
                },
                removeContainer: function(res){
                    let keyMutipler = keyMultiplier();
                    let cap = global.tech.steel_container >= 3 ? 75 : 50;
                    if (global.race['pack_rat']){
                        cap += global.tech.steel_container >= 3 ? 3 : 2;
                    }
                    if (global.resource[res].containers >= keyMutipler){
                        global.resource.Containers.amount += keyMutipler;
                        global.resource.Containers.max += keyMutipler;
                        global.resource[res].containers -= keyMutipler;
                        global.resource[res].max -= (cap * keyMutipler);
                    }
                },
                addContainer: function(res){
                    let keyMutipler = keyMultiplier();
                    let cap = global.tech.steel_container >= 3 ? 75 : 50;
                    if (global.race['pack_rat']){
                        cap += global.tech.steel_container >= 3 ? 3 : 2;
                    }
                    if (global.resource.Containers.amount >= keyMutipler){
                        global.resource.Containers.amount -= keyMutipler;
                        global.resource.Containers.max -= keyMutipler;
                        global.resource[res].containers += keyMutipler;
                        global.resource[res].max += (cap * keyMutipler);
                    }
                }
            }
        });
        
        let containers = $('<div id="modalContainers" class="crates divide"></div>');
        body.append(containers);
        
        containers.append($('<div class="crateHead"><span>Containers Owned: {{ containers.amount }}/{{ containers.max }}</span><span>Containers Assigned: {{ res.containers }}</span></div>'));
        
        let buildContainer = $(`<b-tooltip :label="buildContainerLabel()" position="is-bottom" animated><button class="button" @click="buildContainer('${name}')">Construct Container</button></b-tooltip>`);
        let removeContainer = $(`<b-tooltip :label="removeContainerLabel()" position="is-bottom" animated><button class="button" @click="removeContainer('${name}')">Unassign Container</button></b-tooltip>`);
        let addContainer = $(`<b-tooltip :label="addContainerLabel()" position="is-bottom" animated><button class="button" @click="addContainer('${name}')">Assign Container</button></b-tooltip>`);
        
        containers.append(buildContainer);
        containers.append(removeContainer);
        containers.append(addContainer);
        
        vues['modalContainer'].$mount('#modalContainers');
    }

    vues[`modal_res_${name}`] = new Vue({
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
    vues[`modal_res_${name}`].$mount('#modalBoxTitle');
    
    if (global.tech['currency'] && global.tech['currency'] >= 2){
        var market_item = $(`<div id="pop_market" class="market-item" v-show="r.display"></div>`);
        body.append(market_item);
        marketItem(`pop_market_${name}`,'#pop_market',market_item,name,color,false);
    }
}

export function initMarket(){
    let market = $('<div id="market-qty" class="market-header"></div>');
    $('#market').append(market);
    loadMarket();
}

export function loadMarket(){
    let market = $('#market-qty');
    market.empty();

    if (vues['market_qty']){
        vues['market_qty'].$destroy();
    }

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

    market.append($('<span class="trade" v-show="active"><span class="has-text-warning">Trade Routes</span> {{ trade }} / {{ mtrade }}</span>'));

    vues['market_qty'] = new Vue({
        data: global.city.market
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
