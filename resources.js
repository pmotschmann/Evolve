import { global, vues, keyMultiplier, modRes, poppers, breakdown, sizeApproximation } from './vars.js';
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

export const tradeRatio = {
    Food: 1,
    Lumber: 1,
    Stone: 1,
    Furs: 1,
    Copper: 1,
    Iron: 1,
    Cement: 1,
    Coal: 1,
    Oil: 0.5,
    Uranium: 0.25,
    Steel: 1,
    Titanium: 0.25,
    Alloy: 0.25,
    Polymer: 0.25,
}

export const craftCost = {
    Plywood: { r: 'Lumber', a: 100 },
    Brick: { r: 'Cement', a: 40 },
    Bronze: { r: 'Copper', a: 80 },
    Wrought_Iron: { r: 'Iron', a: 80 },
    Sheet_Metal: { r: 'Steel', a: 60 },
};

// Sets up resource definitions
export function defineResources() {
    if (global.race.species === 'protoplasm'){
        loadResource('RNA',100,1,false);
        loadResource('DNA',100,1,false);
    }
    else {
        initMarket();
        loadResource('Money',1000,1,false,false,'success');
        loadResource(races[global.race.species].name,0,0,false,false,'warning');
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
        loadResource('Plywood',-1,0,false,false,'danger');
        loadResource('Brick',-1,0,false,false,'danger');
        loadResource('Bronze',-1,0,false,false,'danger');
        loadResource('Wrought_Iron',-1,0,false,false,'danger');
        loadResource('Sheet_Metal',-1,0,false,false,'danger');
        loadRouteCounter();
    }
    loadSpecialResource('Plasmid');
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

    if (vues[`res_${name}`]){
        vues[`res_${name}`].$destroy();
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
    
    var res_container;
    if (global.resource[name].max === -1){
        res_container = $(`<div id="res-${name}" class="resource crafted" v-show="display"><span class="res has-text-${color}">{{ name | namespace }}</span><span class="count">{{ amount | diffSize }}</span></div>`);
    }
    else {
        res_container = $(`<div id="res-${name}" class="resource" v-show="display"><span class="res has-text-${color}">{{ name | namespace }}</span><span class="count">{{ amount | size }} / {{ max | size }}</span></div>`);
    }

    if (stackable){
        res_container.append($(`<span><span id="con${name}" v-if="showTrigger()" class="interact has-text-success" @click="trigModal">+</span></span>`));
    }
    else if (max !== -1){
        res_container.append($('<span></span>'));
    }
    
    if (rate !== 0){
        res_container.append($(`<span id="inc${name}" class="diff">{{ diff | diffSize }} /s</span>`));
    }
    else if (max === -1){
        let craft = $('<span class="craftable"></span>');
        res_container.append(craft);

        let inc = [1,5];
        for (let i=0; i<inc.length; i++){
            craft.append($(`<span id="inc${name}${inc[i]}" @mouseover="hover('${name}',${inc[i]})" @mouseout="unhover('${name}',${inc[i]})"><a @click="craft('${name}',${inc[i]})">+<span class="craft" data-val="${inc[i]}">${inc[i]}</span></a></span>`));
        }
        craft.append($(`<span id="inc${name}A"><a @click="craft('${name}','A')">+A</a></span>`));
    }
    else {
        res_container.append($(`<span></span>`));
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
            },
            namespace(val){
                return val.replace("_", " ");
            }
        },
        methods: {
            trigModal: function(){
                this.$modal.open({
                    parent: this,
                    component: modal
                });
                
                var checkExist = setInterval(function(){
                   if ($('#modalBox').length > 0) {
                      clearInterval(checkExist);
                      drawModal(name,color);
                   }
                }, 50);
            },
            showTrigger: function(){
                return global.resource.Crates.display;
            },
            craft: function(res,vol){
                let craft_bonus = global.tech['foundry'] >= 2 ? 1 + (global.city.foundry.count * 0.03) : 1;
                if (vol === 'A'){
                    let volume = Math.floor(global.resource[craftCost[res].r].amount / craftCost[res].a);
                    let num = volume * craftCost[res].a;
                    global.resource[craftCost[res].r].amount -= num;
                    global.resource[res].amount += volume * craft_bonus;
                }
                else {
                    var keyMult = keyMultiplier();
                    for (var i=0; i<keyMult; i++){
                        let num = vol * craftCost[res].a;
                        let br = false;
                        while (num > 0){
                            if (global.resource[craftCost[res].r].amount >= num){
                                global.resource[craftCost[res].r].amount -= num;
                                global.resource[res].amount += vol * craft_bonus;
                                num = 0;
                            }
                            else {
                                num -= craftCost[res].a;
                                br = true;
                            }
                        }
                        if (br){
                            break;
                        }
                    }
                }
            },
            craftCost: function(res,vol){
                let num = vol * craftCost[res].a * keyMultiplier();
                return `${craftCost[res].r} ${num}`;
            },
            hover(res,vol){
                var popper = $(`<div id="popRes${res}${vol}" class="popper has-background-light has-text-dark"></div>`);
                $('#main').append(popper);
                let num = typeof vol === 'number' ? vol * craftCost[res].a : vol;
                popper.append($(`<div>${craftCost[res].r} <span class="craft" data-val="${num}">${num}</span></div>`));

                popper.show();
                poppers[`r${res}${vol}`] = new Popper($(`#inc${res}${vol}`),popper);
            },
            unhover(res,vol){
                $(`#popRes${res}${vol}`).hide();
                poppers[`r${res}${vol}`].destroy();
                $(`#popRes${res}${vol}`).remove();
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

    if (name !== races[global.race.species].name && name !== 'Crates' && name !== 'Containers'){
        $(`#inc${name}`).on('mouseover',function(){
            if (breakdown[name]){
                var popper = $(`<div id="resBreak${name}" class="popper has-background-light has-text-dark"></div>`);
                $('#main').append(popper);
                let bd = $(`<div class="resBreakdown"><div class="has-text-info">${name}</div></div>`);

                let types = [name,'Global'];
                for (var i = 0; i < types.length; i++){
                    let t = types[i];
                    Object.keys(breakdown[t]).forEach(function (mod){
                        let raw = breakdown[t][mod];
                        let val = parseFloat(raw.slice(0,-1));
                        if (val != 0 && !isNaN(val)){
                            let type = val > 0 ? 'success' : 'danger';
                            bd.append(`<div class="resBD"><span>${mod}</span><span class="has-text-${type}">{{ ${t}.${mod} | translate }} </span></div>`);
                        }
                    });
                }

                if (breakdown.consume[name]){
                    Object.keys(breakdown.consume[name]).forEach(function (mod){
                        let val = breakdown.consume[name][mod];
                        if (val != 0 && !isNaN(val)){
                            let type = val > 0 ? 'success' : 'danger';
                            bd.append(`<div class="resBD"><span>${mod}</span><span class="has-text-${type}">{{ consume.${name}.${mod} | fix | translate }} </span></div>`);
                        }
                    });
                }

                popper.append(bd);
                popper.show();
                poppers[name] = new Popper($(`#inc${name}`),popper);
            }

            vues[`res_${name}_temp`] = new Vue({
                data: {
                    'Global': breakdown['Global'],
                    [name]: breakdown[name],
                    'consume': breakdown['consume']
                }, 
                filters: {
                    translate(raw){
                        let type = raw[raw.length -1];
                        let val = parseFloat(raw.slice(0,-1));
                        val = +(val).toFixed(2);
                        let suffix = type === '%' ? '%' : '';
                        if (val > 0){
                            return '+' + val + suffix;
                        }
                        else if (val < 0){
                            return val + suffix;
                        }
                    },
                    fix(val){
                        return val + 'v';
                    }
                }
            });
            vues[`res_${name}_temp`].$mount(`#resBreak${name} > div`);
        });
        $(`#inc${name}`).on('mouseout',function(){
                if (breakdown[name]){
                $(`#resBreak${name}`).hide();
                poppers[name].destroy();
                $(`#resBreak${name}`).remove();
            }
            vues[`res_${name}_temp`].$destroy();
        });
    }

    if (tradable){
        var market_item = $(`<div id="market-${name}" class="market-item" v-show="r.display"></div>`);
        $('#market').append(market_item);
        marketItem(`market_${name}`,`#market-${name}`,market_item,name,color,true);
    }
}

function loadSpecialResource(name,color) {
    if ($(`#res-${name}`).length){
        let bind = $(`#res-${name}`);
        bind.detach;
        $('#resources').append(bind);
        return;
    }

    color = color || 'special';
    
    var res_container = $(`<div id="res-${name}" class="resource" v-show="count"><span class="res has-text-${color}">${name}</span><span class="count">{{ count }}</span></div>`);
   
    $('#resources').append(res_container);
    
    vues[`res_${name}`] = new Vue({
        data: global.race[name]
    });
    vues[`res_${name}`].$mount(`#res-${name}`);
}

function marketItem(vue,mount,market_item,name,color,full){
    if (full){
        market_item.append($(`<span class="res has-text-${color}">{{ r.name | namespace }}</span>`));
    }

    market_item.append($('<span class="buy"><span class="has-text-success">BUY</span></span>'));
    market_item.append($(`<span class="order" @click="purchase('${name}')">\${{ r.value | buy }}</span>`));
    
    market_item.append($('<span class="sell"><span class="has-text-danger">SELL</span></span>'));
    market_item.append($(`<span class="order" @click="sell('${name}')">\${{ r.value | sell }}</span>`));

    if (full){
        let trade = $('<span class="trade" v-show="m.active"><span class="has-text-warning">Routes</span></span>');
        market_item.append(trade);
        trade.append($(`<b-tooltip :label="aBuy('${name}')" position="is-bottom" size="is-small" multilined animated><span class="sub has-text-success" @click="autoBuy('${name}')"><span class="route">+</span></span></b-tooltip>`));
        trade.append($(`<span class="current">{{ r.trade | trade }}</span>`));
        trade.append($(`<b-tooltip :label="aSell('${name}')" position="is-bottom" size="is-small" multilined animated><span class="add has-text-danger" @click="autoSell('${name}')"><span class="route">-</span></span></b-tooltip>`));
        tradeRouteColor(name);
    }
    
    vues[vue] = new Vue({
        data: { 
            r: global.resource[name],
            m: global.city.market
        },
        methods: {
            aSell(res){
                let unit = tradeRatio[res] === 1 ? 'unit' : 'units';
                return `Auto-sell ${tradeRatio[res]} ${unit} per second at market value`;
            },
            aBuy(res){
                let unit = tradeRatio[res] === 1 ? 'unit' : 'units';
                return `Auto-buy ${tradeRatio[res]} ${unit} per second at market value`;
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
            },
            namespace(val){
                return val.replace("_", " ");
            }
        }
    });
    vues[vue].$mount(mount);
}

function loadRouteCounter(){
    var market_item = $(`<div id="tradeTotal" v-show="active" class="market-item"><span class="tradeTotal"><span class="has-text-warning">Trade Routes</span> {{ trade }} / {{ mtrade }}</span></div>`);
    $('#market').append(market_item);

    vues['market_totals'] = new Vue({
        data: global.city.market
    });
    vues['market_totals'].$mount('#tradeTotal');
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
                    return 'Construct a crate, cost 5 Plywood';
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
                cap = spatialReasoning(cap);
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
                cap = spatialReasoning(cap);
                return `Assign crate to this resource (+${cap} cap)`;
            },
            buildCrate: function(){
                let keyMutipler = keyMultiplier();
                let material = global.race['kindling_kindred'] ? 'Stone' : 'Plywood';
                let cost = global.race['kindling_kindred'] ? 250 : 5;
                if (keyMutipler + global.resource.Crates.amount > global.resource.Crates.max){
                    keyMutipler = global.resource.Crates.max - global.resource.Crates.amount;
                }
                if (global.resource[material].amount < cost * keyMutipler){
                    keyMutipler = Math.floor(global.resource[material].amount / cost);
                }
                if (global.resource[material].amount >= (cost * keyMutipler) && global.resource.Crates.amount < global.resource.Crates.max){
                    modRes(material,-(cost * keyMutipler));
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
                cap = spatialReasoning(cap);
                if (keyMutipler > global.resource[res].crates){
                    keyMutipler = global.resource[res].crates;
                }
                if (keyMutipler > 0){
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
                if (keyMutipler > global.resource.Crates.amount){
                    keyMutipler = global.resource.Crates.amount;
                }
                if (keyMutipler > 0){
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
    
    let buildCrate = $(`<b-tooltip :label="buildCrateLabel()" position="is-bottom" animated><button class="button" @click="buildCrate()">Construct Crate</button></b-tooltip>`);
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
                    cap = spatialReasoning(cap);
                    return `Remove container from this resrouce (-${cap} cap)`;
                },
                addContainerLabel: function(){
                    let cap = global.tech.steel_container >= 3 ? 75 : 50;
                    if (global.race['pack_rat']){
                        cap += global.tech.steel_container >= 3 ? 3 : 2;
                    }
                    cap = spatialReasoning(cap);
                    return `Assign container to this resource (+${cap} cap)`;
                },
                buildContainer: function(){
                    let keyMutipler = keyMultiplier();
                    if (keyMutipler + global.resource.Containers.amount > global.resource.Containers.max){
                        keyMutipler = global.resource.Containers.max - global.resource.Containers.amount;
                    }
                    if (global.resource['Steel'].amount < 100 * keyMutipler){
                        keyMutipler = Math.floor(global.resource['Steel'].amount / 100);
                    }
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
                    cap = spatialReasoning(cap);
                    if (keyMutipler > global.resource[res].containers){
                        keyMutipler = global.resource[res].containers;
                    }
                    if (keyMutipler > 0){
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
                    cap = spatialReasoning(cap);
                    if (keyMutipler > global.resource.Containers.amount){
                        keyMutipler = global.resource.Containers.amount;
                    }
                    if (keyMutipler > 0){
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
        
        let buildContainer = $(`<b-tooltip :label="buildContainerLabel()" position="is-bottom" animated><button class="button" @click="buildContainer()">Construct Container</button></b-tooltip>`);
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
    $('#market').empty();
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

    vues['market_qty'] = new Vue({
        data: global.city.market
    });
    vues['market_qty'].$mount('#market-qty');
}

export function spatialReasoning(value){
    if (global.genes['store']){
        value *= 1 + (global.race.Plasmid.count / 2500);
        value = Math.round(value);
    }
    return value;
}

export function plasmidBonus(){
    let plasmids = global.race.Plasmid.count;
    let plasmid_bonus = 0;
    if (plasmids > 250){
        let divisor = 500 - plasmids;
        if (divisor < 250){
            divisor = 250;
        }
        plasmid_bonus = 0.625 + (Math.log(plasmids - 249) / Math.LN2 / divisor);
    }
    else {
        plasmid_bonus = plasmids / 400;
    }
    if (global.city['temple'] && global.city['temple'].count){
        let temple_bonus = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 0.08 : 0.05;
        if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
            temple_bonus += global.civic.professor.workers * 0.002;
        }
        plasmid_bonus *= 1 + (global.city.temple.count * temple_bonus);
    }
    return plasmid_bonus;
}
