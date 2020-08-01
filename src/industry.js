import { global, keyMultiplier, sizeApproximation, p_on } from './vars.js';
import { loc } from './locale.js';
import { vBind, easterEgg } from './functions.js';

export function loadIndustry(industry,parent,bind){
    switch (industry){
        case 'smelter':
            loadSmelter(parent,bind);
            break;
        case 'factory':
            loadFactory(parent,bind);
            break;
        case 'droid':
            loadDroid(parent,bind);
            break;
        case 'graphene':
            loadGraphene(parent,bind);
            break;
    }
}

export const f_rate = {
    Lux: {
        demand: [0.14,0.21,0.28,0.35,0.42],
        fur: [2,3,4,5,6]
    },
    Furs: {
        money: [10,15,20,25,30],
        polymer: [1.5,2.25,3,3.75,4.5],
        output: [1,1.5,2,2.5,3]
    },
    Alloy: {
        copper: [0.75,1.12,1.49,1.86,2.23],
        aluminium: [1,1.5,2,2.5,3],
        output: [0.075,0.112,0.149,0.186,0.223]
    },
    Polymer: {
        oil_kk: [0.22,0.33,0.44,0.55,0.66],
        oil: [0.18,0.27,0.36,0.45,0.54],
        lumber: [15,22,29,36,43],
        output: [0.125,0.187,0.249,0.311,0.373],
    },
    Nano_Tube: {
        coal: [8,12,16,20,24],
        neutronium: [0.05,0.075,0.1,0.125,0.15],
        output: [0.2,0.3,0.4,0.5,0.6],
    },
    Stanene: {
        aluminium: [30,45,60,75,90],
        nano: [0.02,0.03,0.04,0.05,0.06],
        output: [0.6,0.9,1.2,1.5,1.8],
    }
};

function loadSmelter(parent,bind){    
    let fuel = $(`<div><span class="has-text-warning">${loc('modal_smelter_fuel')}:</span> <span :class="level()">{{s.count | on}}/{{ s.cap }}</span></div>`);
    parent.append(fuel);

    if (parent.hasClass('modalBody')){
        let egg = easterEgg(10);
        if (egg.length > 0){
            fuel.prepend(egg);
        }
    }

    if (!global.race['forge']){
        let fuelTypes = $('<div class="fuels"></div>');
        parent.append(fuelTypes);

        if (!global.race['kindling_kindred'] || global.race['evil']){
            let f_label = global.race['evil'] ? (global.race['soul_eater'] && global.race.species !== 'wendigo' ? global.resource.Food.name : global.resource.Furs.name) : global.resource.Lumber.name;
            let wood = $(`<b-tooltip :label="buildLabel('wood')" position="is-bottom" animated><span :aria-label="buildLabel('wood') + ariaCount('Wood')" class="current">${f_label} {{ s.Wood }}</span></b-tooltip>`);
            let subWood = $(`<span role="button" class="sub" @click="subWood" aria-label="Remove lumber fuel"><span>&laquo;</span></span>`);
            let addWood = $(`<span role="button" class="add" @click="addWood" aria-label="Add lumber fuel"><span>&raquo;</span></span>`);
            fuelTypes.append(subWood);
            fuelTypes.append(wood);
            fuelTypes.append(addWood);
        }

        if (global.resource.Coal.display){
            let coal = $(`<b-tooltip :label="buildLabel('coal')" position="is-bottom" animated><span :aria-label="buildLabel('coal') + ariaCount('Coal')" class="current">${global.resource.Coal.name} {{ s.Coal }}</span></b-tooltip>`);
            let subCoal = $(`<span role="button" class="sub" @click="subCoal" aria-label="Remove coal fuel"><span>&laquo;</span></span>`);
            let addCoal = $(`<span role="button" class="add" @click="addCoal" aria-label="Add coal fuel"><span>&raquo;</span></span>`);
            fuelTypes.append(subCoal);
            fuelTypes.append(coal);
            fuelTypes.append(addCoal);
        }

        if (global.resource.Oil.display){
            let oil = $(`<b-tooltip :label="buildLabel('oil')" position="is-bottom" animated multilined><span :aria-label="buildLabel('oil') + ariaCount('Oil')" class="current">${global.resource.Oil.name} {{ s.Oil }}</span></b-tooltip>`);
            let subOil = $(`<span role="button" class="sub" @click="subOil" aria-label="Remove oil fuel"><span>&laquo;</span></span>`);
            let addOil = $(`<span role="button" class="add" @click="addOil" aria-label="Add oil fuel"><span>&raquo;</span></span>`);
            fuelTypes.append(subOil);
            fuelTypes.append(oil);
            fuelTypes.append(addOil);
        }

        let available = $('<div class="avail"></div>');
        parent.append(available);

        if (!global.race['kindling_kindred'] || global.race['evil']){
            if (global.race['evil']){
                if (global.race['soul_eater'] && global.race.species !== 'wendigo'){
                    available.append(`<span :class="net('Lumber')">{{ food.diff | diffSize }}</span>`);
                }
                else {
                    available.append(`<span :class="net('Lumber')">{{ fur.diff | diffSize }}</span>`);
                }
            }
            else {
                available.append(`<span :class="net('Lumber')">{{ lum.diff | diffSize }}</span>`);
            }
        }

        if (global.resource.Coal.display){
            available.append(`<span :class="net('Coal')">{{ coal.diff | diffSize }}</span>`);
        }

        if (global.resource.Oil.display){
            available.append(`<span :class="net('Oil')">{{ oil.diff | diffSize }}</span>`);
        }
    }

    if (global.resource.Steel.display && global.tech.smelting >= 2 && !global.race['steelen']){
        let smelt = $('<div class="smelting"></div>');
        let ironSmelt = $(`<b-tooltip :label="ironLabel()" position="is-left" size="is-small" animated multilined><button class="button" :aria-label="ironLabel() + ariaProd('Iron')" @click="ironSmelting()">${loc('resource_Iron_name')} ${loc('modal_smelting')}: {{ s.Iron }}</button></b-tooltip>`);
        let steelSmelt = $(`<b-tooltip :label="steelLabel()" position="is-right" size="is-small" animated multilined><button class="button" :aria-label="steelLabel() + ariaProd('Steel')" @click="steelSmelting()">${loc('resource_Steel_name')} ${loc('modal_smelting')}: {{ s.Steel }}</button></b-tooltip>`);
        parent.append(smelt);
        smelt.append(ironSmelt);
        smelt.append(steelSmelt);
    }

    vBind({
        el: bind ? bind : '#specialModal',
        data: {
            s: global.city['smelter'],
            lum: global.resource.Lumber,
            coal: global.resource.Coal,
            oil: global.resource.Oil,
            food: global.resource.Food,
            fur: global.resource.Furs,
        },
        methods: {
            subWood(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.city.smelter.Wood > 0){
                        global.city.smelter.Wood--;
                        if (global.city.smelter.Iron + global.city.smelter.Steel > global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil){
                            if (global.city.smelter.Steel > 0){
                                global.city.smelter.Steel--;
                            }
                            else {
                                global.city.smelter.Iron--;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
            },
            addWood(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil < global.city.smelter.cap){
                        global.city.smelter.Wood++;
                        global.city.smelter.Iron++;
                    }
                    else if (global.city.smelter.Coal + global.city.smelter.Oil > 0){
                        if (global.city.smelter.Oil > global.city.smelter.Coal){
                            global.city.smelter.Coal > 0 ? global.city.smelter.Coal-- : global.city.smelter.Oil--;
                        }
                        else {
                            global.city.smelter.Oil > 0 ? global.city.smelter.Oil-- : global.city.smelter.Coal--;
                        }
                        global.city.smelter.Wood++;
                    }
                    else {
                        break;
                    }
                }
            },
            subCoal(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.city.smelter.Coal > 0){
                        global.city.smelter.Coal--;
                        if (global.city.smelter.Iron + global.city.smelter.Steel > global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil){
                            if (global.city.smelter.Steel > 0){
                                global.city.smelter.Steel--;
                            }
                            else {
                                global.city.smelter.Iron--;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
            },
            addCoal(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil < global.city.smelter.cap){
                        global.city.smelter.Coal++;
                        global.city.smelter.Iron++;
                    }
                    else if (global.city.smelter.Wood + global.city.smelter.Oil > 0){
                        if (global.city.smelter.Wood > 0){
                            global.city.smelter.Wood--;
                        }
                        else {
                            global.city.smelter.Oil--;
                        }
                        global.city.smelter.Coal++;
                    }
                    else {
                        break;
                    }
                }
            },
            subOil(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.city.smelter.Oil > 0){
                        global.city.smelter.Oil--;
                        if (global.city.smelter.Iron + global.city.smelter.Steel > global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil){
                            if (global.city.smelter.Steel > 0){
                                global.city.smelter.Steel--;
                            }
                            else {
                                global.city.smelter.Iron--;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
            },
            addOil(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil < global.city.smelter.cap){
                        global.city.smelter.Oil++;
                        global.city.smelter.Iron++;
                    }
                    else if (global.city.smelter.Wood + global.city.smelter.Coal > 0){
                        if (global.city.smelter.Wood > 0){
                            global.city.smelter.Wood--;
                        }
                        else {
                            global.city.smelter.Coal--;
                        }
                        global.city.smelter.Oil++;
                    }
                    else {
                        break;
                    }
                }
            },
            ironLabel(){
                let boost = global.tech['smelting'] >= 3 ? (global.tech['smelting'] >= 7 ? 15 : 12) : 10;
                if (global.race['pyrophobia']){
                    boost *= 0.9;
                }
                return loc('modal_smelter_iron',[boost,loc('resource_Iron_name')]);
            },
            steelLabel(){
                let boost = global.tech['smelting'] >= 4 ? 1.2 : 1;
                if (global.tech['smelting'] >= 5){
                    boost *= 1.2;
                }
                if (global.tech['smelting'] >= 6){
                    boost *= 1.2;
                }
                if (global.tech['smelting'] >= 7){
                    boost *= 1.25;
                }
                if (global.race['pyrophobia']){
                    boost *= 0.9;
                }
                return loc('modal_smelter_steel',[boost,loc('resource_Steel_name'),loc('resource_Coal_name'),loc('resource_Iron_name')]);
            },
            ironSmelting(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    let count = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil;
                    if (global.city.smelter.Iron + global.city.smelter.Steel < count){
                        global.city.smelter.Iron++;
                    }
                    else if (global.city.smelter.Iron < count && global.city.smelter.Steel > 0){
                        global.city.smelter.Iron++;
                        global.city.smelter.Steel--;
                    }
                    else {
                        break;
                    }
                }
            },
            steelSmelting(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    let count = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil;
                    if (global.city.smelter.Iron + global.city.smelter.Steel < count){
                        global.city.smelter.Steel++;
                    }
                    else if (global.city.smelter.Steel < count && global.city.smelter.Iron > 0){
                        global.city.smelter.Steel++;
                        global.city.smelter.Iron--;
                    }
                    else {
                        break;
                    }
                }
            },
            buildLabel(type){
                switch(type){
                    case 'wood':
                        return loc('modal_build_wood',[global.race['evil'] ? (global.race['soul_eater'] && global.race.species !== 'wendigo' ? global.resource.Food.name : global.resource.Furs.name) : global.resource.Lumber.name, global.race['evil'] && !global.race['soul_eater'] || global.race.species === 'wendigo' ? 1 : 3]);
                    case 'coal':
                        let coal_fuel = global.race['kindling_kindred'] ? 0.15 : 0.25;
                        if (global.tech['uranium'] && global.tech['uranium'] >= 3){
                            return loc('modal_build_coal2',[coal_fuel,loc('resource_Coal_name'),loc('resource_Uranium_name')]);
                        }
                        else {
                            return loc('modal_build_coal1',[coal_fuel,loc('resource_Coal_name')]);
                        }
                    case 'oil':
                        return loc('modal_build_oil',['0.35',loc('resource_Oil_name')]);
                }
            },
            ariaCount(fuel){
                return ` ${global.city.smelter[fuel]} ${fuel} fueled.`;
            },
            ariaProd(res){
                return `. ${global.city.smelter[res]} producing ${res}.`;
            },
            net(res){
                return global.resource[res].diff >= 0 ? 'has-text-success' : 'has-text-danger';
            },
            level(){
                let workers = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil;
                return colorRange(workers,global.city.smelter.count);
            }
        },
        filters: {
            on(c){
                return global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil;
            },
            diffSize(value){
                return value > 0 ? `+${sizeApproximation(value,2)}` : sizeApproximation(value,2);
            }
        }
    });
}

function loadFactory(parent,bind){
    let fuel = $(`<div><span class="has-text-warning">${loc('modal_factory_operate')}:</span> <span :class="level()">{{count | on}}/{{ on | max }}</span></div>`);
    parent.append(fuel);

    let lux = $(`<div class="factory"><b-tooltip :label="buildLabel('Lux')" :aria-label="buildLabel('Lux') + ariaProd('Lux')" position="is-left" size="is-small" multilined animated><span>${loc('modal_factory_lux')}</span></b-tooltip></div>`);
    parent.append(lux);

    let luxCount = $(`<span class="current">{{ Lux }}</span>`);
    let subLux = $(`<span class="sub" @click="subItem('Lux')" role="button" aria-label="Decrease Lux production">&laquo;</span>`);
    let addLux = $(`<span class="add" @click="addItem('Lux')" role="button" aria-label="Increase Lux production">&raquo;</span>`);
    lux.append(subLux);
    lux.append(luxCount);
    lux.append(addLux);

    if (global.tech['synthetic_fur']){
        let fur = $(`<div class="factory"><b-tooltip :label="buildLabel('Furs')" :aria-label="buildLabel('Furs') + ariaProd('Furs')" position="is-left" size="is-small" multilined animated><span>${global.race['evil'] ? loc('resource_Flesh_name') : loc('resource_Furs_name')}</span></b-tooltip></div>`);
        parent.append(fur);

        let furCount = $(`<span class="current">{{ Furs }}</span>`);
        let subFurs= $(`<span class="sub" @click="subItem('Furs')" role="button" aria-label="Decrease Furs production">&laquo;</span>`);
        let addFurs = $(`<span class="add" @click="addItem('Furs')" role="button" aria-label="Increase Furs production">&raquo;</span>`);
        fur.append(subFurs);
        fur.append(furCount);
        fur.append(addFurs);
    }

    let alloy = $(`<div class="factory"><b-tooltip :label="buildLabel('Alloy')" :aria-label="buildLabel('Alloy') + ariaProd('Alloy')" position="is-left" size="is-small" multilined animated><span>${loc('resource_Alloy_name')}</span></b-tooltip></div>`);
    parent.append(alloy);

    let alloyCount = $(`<span class="current">{{ Alloy }}</span>`);
    let subAlloy = $(`<span class="sub" @click="subItem('Alloy')" role="button" aria-label="Decrease Alloy production">&laquo;</span>`);
    let addAlloy = $(`<span class="add" @click="addItem('Alloy')" role="button" aria-label="Increase Alloy production">&raquo;</span>`);
    alloy.append(subAlloy);
    alloy.append(alloyCount);
    alloy.append(addAlloy);

    if (global.tech['polymer']){
        let polymer = $(`<div class="factory"><b-tooltip :label="buildLabel('Polymer')" :aria-label="buildLabel('Polymer') + ariaProd('Polymer')" position="is-left" size="is-small" multilined animated><span>${loc('resource_Polymer_name')}</span></b-tooltip></div>`);
        parent.append(polymer);

        let polymerCount = $(`<span class="current">{{ Polymer }}</span>`);
        let subPolymer= $(`<span class="sub" @click="subItem('Polymer')" role="button" aria-label="Decrease Polymer production">&laquo;</span>`);
        let addPolymer = $(`<span class="add" @click="addItem('Polymer')" role="button" aria-label="Increase Polymer production">&raquo;</span>`);
        polymer.append(subPolymer);
        polymer.append(polymerCount);
        polymer.append(addPolymer);
    }

    if (global.tech['nano']){
        let nano = $(`<div class="factory"><b-tooltip :label="buildLabel('Nano')" :aria-label="buildLabel('Nano') + ariaProd('Nano')" position="is-left" size="is-small" multilined animated><span>${loc('resource_Nano_Tube_name')}</span></b-tooltip></div>`);
        parent.append(nano);

        let nanoCount = $(`<span class="current">{{ Nano }}</span>`);
        let subNano= $(`<span class="sub" @click="subItem('Nano')" role="button" aria-label="Decrease Nanotube production">&laquo;</span>`);
        let addNano = $(`<span class="add" @click="addItem('Nano')" role="button" aria-label="Increase Nanotube production">&raquo;</span>`);
        nano.append(subNano);
        nano.append(nanoCount);
        nano.append(addNano);
    }

    if (global.tech['stanene']){
        let stanene = $(`<div class="factory"><b-tooltip :label="buildLabel('Stanene')" :aria-label="buildLabel('Stanene') + ariaProd('Stanene')" position="is-left" size="is-small" multilined animated><span>${loc('resource_Stanene_name')}</span></b-tooltip></div>`);
        parent.append(stanene);

        let staneneCount = $(`<span class="current">{{ Stanene }}</span>`);
        let subStanene= $(`<span class="sub" @click="subItem('Stanene')" role="button" aria-label="Decrease Stanene production">&laquo;</span>`);
        let addStanene = $(`<span class="add" @click="addItem('Stanene')" role="button" aria-label="Increase Stanene production">&raquo;</span>`);
        stanene.append(subStanene);
        stanene.append(staneneCount);
        stanene.append(addStanene);
    }

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.city['factory'],
        methods: {
            subItem: function(item){
                let keyMult = keyMultiplier();
                for (var i=0; i<keyMult; i++){
                    if (global.city.factory[item] > 0){
                        global.city.factory[item]--;
                    }
                    else {
                        break;
                    }
                }
            },
            addItem: function(item){
                let max = global.space['red_factory'] ? global.space.red_factory.on + global.city.factory.on : global.city.factory.on;
                if (global.interstellar['int_factory'] && p_on['int_factory']){
                    max += p_on['int_factory'] * 2;
                }
                let keyMult = keyMultiplier();
                for (var i=0; i<keyMult; i++){
                    if (global.city.factory.Lux + global.city.factory.Furs + global.city.factory.Alloy + global.city.factory.Polymer + global.city.factory.Nano + global.city.factory.Stanene < max){
                        global.city.factory[item]++;
                    }
                    else {
                        break;
                    }
                }
            },
            buildLabel: function(type){
                let assembly = global.tech['factory'] ? true : false;
                switch(type){
                    case 'Lux':{
                        let demand = +(global.resource[global.race.species].amount * (assembly ? f_rate.Lux.demand[global.tech['factory']] : f_rate.Lux.demand[0]))
                        if (global.race['toxic']){
                            demand *= 1.20;
                        }
                        if (global.civic.govern.type === 'corpocracy'){
                            demand *= 1.5;
                        }
                        if (global.civic.govern.type === 'socialist'){
                            demand *= 0.8;
                        }
                        demand = demand.toFixed(2);
                        let fur = assembly ? f_rate.Lux.fur[global.tech['factory']] : f_rate.Lux.fur[0];
                        return loc('modal_factory_lux_label',[fur,global.resource.Furs.name,demand]);
                    }
                    case 'Furs':{
                        let money = assembly ? f_rate.Furs.money[global.tech['factory']] : f_rate.Furs.money[0];
                        let polymer = assembly ? f_rate.Furs.polymer[global.tech['factory']] : f_rate.Furs.polymer[0];
                        return loc('modal_factory_alloy_label',[money,loc('resource_Money_name'),polymer,loc('resource_Polymer_name'),global.race['evil'] ? loc('resource_Flesh_name') : loc('resource_Furs_name')]);
                    }
                    case 'Alloy':{
                        let copper = assembly ? f_rate.Alloy.copper[global.tech['factory']] : f_rate.Alloy.copper[0];
                        let aluminium = assembly ? f_rate.Alloy.aluminium[global.tech['factory']] : f_rate.Alloy.aluminium[0];
                        return loc('modal_factory_alloy_label',[copper,loc('resource_Copper_name'),aluminium,loc('resource_Aluminium_name'),loc('resource_Alloy_name')]);
                    }
                    case 'Polymer':{
                        if (global.race['kindling_kindred']){
                            let oil = assembly ? f_rate.Polymer.oil_kk[global.tech['factory']] : f_rate.Polymer.oil_kk[0];
                            return loc('modal_factory_polymer_label2',[oil,loc('resource_Oil_name'),loc('resource_Polymer_name')]);
                        }
                        else {
                            let oil = assembly ? f_rate.Polymer.oil[global.tech['factory']] : f_rate.Polymer.oil[0];
                            let lumber = assembly ? f_rate.Polymer.lumber[global.tech['factory']] : f_rate.Polymer.lumber[0];
                            return loc('modal_factory_polymer_label1',[oil,loc('resource_Oil_name'),lumber,global.resource.Lumber.name,loc('resource_Polymer_name')]);
                        }
                    }
                    case 'Nano':{
                        let coal = assembly ? f_rate.Nano_Tube.coal[global.tech['factory']] : f_rate.Nano_Tube.coal[0];
                        let neutronium = assembly ? f_rate.Nano_Tube.neutronium[global.tech['factory']] : f_rate.Nano_Tube.neutronium[0];
                        return loc('modal_factory_nano_label',[coal,loc('resource_Coal_name'),neutronium,loc('resource_Neutronium_name'),loc('resource_Nano_Tube_name')]);
                    }
                    case 'Stanene':{
                        let aluminium = assembly ? f_rate.Stanene.aluminium[global.tech['factory']] : f_rate.Stanene.aluminium[0];
                        let nano = assembly ? f_rate.Stanene.nano[global.tech['factory']] : f_rate.Stanene.nano[0];
                        return loc('modal_factory_stanene_label',[aluminium,loc('resource_Aluminium_name'),nano,loc('resource_Nano_Tube_name'),loc('resource_Stanene_name')]);
                    }
                }
            },
            ariaProd(prod){
                return `. ${global.city.factory[prod]} factories producing ${prod}.`;
            },
            level(){
                let on = global.city.factory.Lux + global.city.factory.Furs + global.city.factory.Alloy + global.city.factory.Polymer + global.city.factory.Nano + global.city.factory.Stanene;
                let max = global.space['red_factory'] ? global.space.red_factory.on + global.city.factory.on : global.city.factory.on;
                if (global.interstellar['int_factory'] && p_on['int_factory']){
                    max += p_on['int_factory'] * 2;
                }
                return colorRange(on,max);
            }
        },
        filters: {
            on(){
                return global.city.factory.Lux + global.city.factory.Furs + global.city.factory.Alloy + global.city.factory.Polymer + global.city.factory.Nano + global.city.factory.Stanene;
            },
            max(){
                let max = global.space['red_factory'] ? global.space.red_factory.on + global.city.factory.on : global.city.factory.on;
                if (global.interstellar['int_factory'] && p_on['int_factory']){
                    max += p_on['int_factory'] * 2;
                }
                return max;
            }
        }
    });
}

function loadDroid(parent,bind){
    let fuel = $(`<div><span class="has-text-warning">${loc('modal_factory_operate')}:</span> <span :class="level()">{{count | on}}/{{ on | max }}</span></div>`);
    parent.append(fuel);

    let adam = $(`<div class="factory"><b-tooltip :label="buildLabel('adam')" :aria-label="buildLabel('adam') + ariaProd('adam')" position="is-left" size="is-small" multilined animated><span>${loc('resource_Adamantite_name')}</span></b-tooltip></div>`);
    parent.append(adam);
    let adamCount = $(`<span class="current">{{ adam }}</span>`);
    let adamSub = $(`<span class="sub" @click="subItem('adam')" role="button" aria-label="Decrease Adamantite production">&laquo;</span>`);
    let adamAdd = $(`<span class="add" @click="addItem('adam')" role="button" aria-label="Increase Adamantite production">&raquo;</span>`);
    adam.append(adamSub);
    adam.append(adamCount);
    adam.append(adamAdd);

    let uran = $(`<div class="factory"><b-tooltip :label="buildLabel('uran')" :aria-label="buildLabel('uran') + ariaProd('uran')" position="is-left" size="is-small" multilined animated><span>${loc('resource_Uranium_name')}</span></b-tooltip></div>`);
    parent.append(uran);
    let uranCount = $(`<span class="current">{{ uran }}</span>`);
    let uranSub = $(`<span class="sub" @click="subItem('uran')" role="button" aria-label="Decrease Uranium production">&laquo;</span>`);
    let uranAdd = $(`<span class="add" @click="addItem('uran')" role="button" aria-label="Increase Uranium production">&raquo;</span>`);
    uran.append(uranSub);
    uran.append(uranCount);
    uran.append(uranAdd);

    let coal = $(`<div class="factory"><b-tooltip :label="buildLabel('coal')" :aria-label="buildLabel('coal') + ariaProd('coal')" position="is-left" size="is-small" multilined animated><span>${loc('resource_Coal_name')}</span></b-tooltip></div>`);
    parent.append(coal);
    let coalCount = $(`<span class="current">{{ coal }}</span>`);
    let coalSub = $(`<span class="sub" @click="subItem('coal')" role="button" aria-label="Decrease Coal production">&laquo;</span>`);
    let coalAdd = $(`<span class="add" @click="addItem('coal')" role="button" aria-label="Increase Coal production">&raquo;</span>`);
    coal.append(coalSub);
    coal.append(coalCount);
    coal.append(coalAdd);

    let alum = $(`<div class="factory"><b-tooltip :label="buildLabel('alum')" :aria-label="buildLabel('alum') + ariaProd('alum')" position="is-left" size="is-small" multilined animated><span>${loc('resource_Aluminium_name')}</span></b-tooltip></div>`);
    parent.append(alum);
    let alumCount = $(`<span class="current">{{ alum }}</span>`);
    let alumSub = $(`<span class="sub" @click="subItem('alum')" role="button" aria-label="Decrease Aluminium production">&laquo;</span>`);
    let alumAdd = $(`<span class="add" @click="addItem('alum')" role="button" aria-label="Increase Aluminium production">&raquo;</span>`);
    alum.append(alumSub);
    alum.append(alumCount);
    alum.append(alumAdd);

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.interstellar['mining_droid'],
        methods: {
            subItem: function(item){
                let keyMult = keyMultiplier();
                for (var i=0; i<keyMult; i++){
                    if (global.interstellar.mining_droid[item] > 0){
                        global.interstellar.mining_droid[item]--;
                    }
                    else {
                        break;
                    }
                }
            },
            addItem: function(item){
                let keyMult = keyMultiplier();
                for (var i=0; i<keyMult; i++){
                    if (global.interstellar.mining_droid.adam + global.interstellar.mining_droid.uran + global.interstellar.mining_droid.coal + global.interstellar.mining_droid.alum < global.interstellar.mining_droid.on){
                        global.interstellar.mining_droid[item]++;
                    }
                    else {
                        break;
                    }
                }
            },
            buildLabel: function(type){
                switch(type){
                    case 'adam':
                        return loc('modal_droid_res_label',[loc('resource_Adamantite_name')]);
                    case 'uran':
                        return loc('modal_droid_res_label',[loc('resource_Uranium_name')]);
                    case 'coal':
                        return loc('modal_droid_res_label',[loc('resource_Coal_name')]);
                    case 'alum':
                        return loc('modal_droid_res_label',[loc('resource_Aluminium_name')]);
                }
            },
            ariaProd(prod){
                return `. ${global.interstellar.mining_droid[prod]} driod mining ${prod}.`;
            },
            level(){
                let on = global.interstellar.mining_droid.adam + global.interstellar.mining_droid.uran + global.interstellar.mining_droid.coal + global.interstellar.mining_droid.alum;
                let max = global.interstellar.mining_droid.on;
                return colorRange(on,max);
            }
        },
        filters: {
            on(){
                return global.interstellar.mining_droid.adam + global.interstellar.mining_droid.uran + global.interstellar.mining_droid.coal + global.interstellar.mining_droid.alum;
            },
            max(){
                return global.interstellar.mining_droid.on;
            }
        }
    });
}

function loadGraphene(parent,bind){
    let fuel = $(`<div><span class="has-text-warning">${loc('modal_smelter_fuel')}:</span> <span :class="level()">{{count | on}}/{{ count }}</span></div>`);
    parent.append(fuel);

    let fuelTypes = $('<div></div>');
    parent.append(fuelTypes);

    if (!global.race['kindling_kindred']){
        let f_label = global.resource.Lumber.name;
        let wood = $(`<b-tooltip :label="buildLabel('wood')" position="is-bottom" animated><span :aria-label="buildLabel('wood') + ariaCount('Wood')" class="current">${f_label} {{ Lumber }}</span></b-tooltip>`);
        let subWood = $(`<span role="button" class="sub" @click="subWood" aria-label="Remove lumber fuel"><span>&laquo;</span></span>`);
        let addWood = $(`<span role="button" class="add" @click="addWood" aria-label="Add lumber fuel"><span>&raquo;</span></span>`);
        fuelTypes.append(subWood);
        fuelTypes.append(wood);
        fuelTypes.append(addWood);
    }

    if (global.resource.Coal.display){
        let coal = $(`<b-tooltip :label="buildLabel('coal')" position="is-bottom" animated><span :aria-label="buildLabel('coal') + ariaCount('Coal')" class="current">${global.resource.Coal.name} {{ Coal }}</span></b-tooltip>`);
        let subCoal = $(`<span role="button" class="sub" @click="subCoal" aria-label="Remove coal fuel"><span>&laquo;</span></span>`);
        let addCoal = $(`<span role="button" class="add" @click="addCoal" aria-label="Add coal fuel"><span>&raquo;</span></span>`);
        fuelTypes.append(subCoal);
        fuelTypes.append(coal);
        fuelTypes.append(addCoal);
    }

    if (global.resource.Oil.display){
        let oil = $(`<b-tooltip :label="buildLabel('oil')" position="is-bottom" animated multilined><span :aria-label="buildLabel('oil') + ariaCount('Oil')" class="current">${global.resource.Oil.name} {{ Oil }}</span></b-tooltip>`);
        let subOil = $(`<span role="button" class="sub" @click="subOil" aria-label="Remove oil fuel"><span>&laquo;</span></span>`);
        let addOil = $(`<span role="button" class="add" @click="addOil" aria-label="Add oil fuel"><span>&raquo;</span></span>`);
        fuelTypes.append(subOil);
        fuelTypes.append(oil);
        fuelTypes.append(addOil);
    }

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.interstellar['g_factory'],
        methods: {
            subWood(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.interstellar.g_factory.Lumber > 0){
                        global.interstellar.g_factory.Lumber--;
                        if (global.interstellar.g_factory.Iron + global.interstellar.g_factory.Steel > global.interstellar.g_factory.Lumber + global.interstellar.g_factory.Coal + global.interstellar.g_factory.Oil){
                            if (global.interstellar.g_factory.Steel > 0){
                                global.interstellar.g_factory.Steel--;
                            }
                            else {
                                global.interstellar.g_factory.Iron--;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
            },
            addWood(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.interstellar.g_factory.Lumber + global.interstellar.g_factory.Coal + global.interstellar.g_factory.Oil < global.interstellar.g_factory.count){
                        global.interstellar.g_factory.Lumber++;
                        global.interstellar.g_factory.Iron++;
                    }
                    else if (global.interstellar.g_factory.Coal + global.interstellar.g_factory.Oil > 0){
                        if (global.interstellar.g_factory.Oil > global.interstellar.g_factory.Coal){
                            global.interstellar.g_factory.Coal > 0 ? global.interstellar.g_factory.Coal-- : global.interstellar.g_factory.Oil--;
                        }
                        else {
                            global.interstellar.g_factory.Oil > 0 ? global.interstellar.g_factory.Oil-- : global.interstellar.g_factory.Coal--;
                        }
                        global.interstellar.g_factory.Lumber++;
                    }
                    else {
                        break;
                    }
                }
            },
            subCoal(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.interstellar.g_factory.Coal > 0){
                        global.interstellar.g_factory.Coal--;
                        if (global.interstellar.g_factory.Iron + global.interstellar.g_factory.Steel > global.interstellar.g_factory.Wood + global.interstellar.g_factory.Coal + global.interstellar.g_factory.Oil){
                            if (global.interstellar.g_factory.Steel > 0){
                                global.interstellar.g_factory.Steel--;
                            }
                            else {
                                global.interstellar.g_factory.Iron--;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
            },
            addCoal(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.interstellar.g_factory.Lumber + global.interstellar.g_factory.Coal + global.interstellar.g_factory.Oil < global.interstellar.g_factory.count){
                        global.interstellar.g_factory.Coal++;
                        global.interstellar.g_factory.Iron++;
                    }
                    else if (global.interstellar.g_factory.Lumber + global.interstellar.g_factory.Oil > 0){
                        if (global.interstellar.g_factory.Lumber > 0){
                            global.interstellar.g_factory.Lumber--;
                        }
                        else {
                            global.interstellar.g_factory.Oil--;
                        }
                        global.interstellar.g_factory.Coal++;
                    }
                    else {
                        break;
                    }
                }
            },
            subOil(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.interstellar.g_factory.Oil > 0){
                        global.interstellar.g_factory.Oil--;
                        if (global.interstellar.g_factory.Iron + global.interstellar.g_factory.Steel > global.interstellar.g_factory.Wood + global.interstellar.g_factory.Coal + global.interstellar.g_factory.Oil){
                            if (global.interstellar.g_factory.Steel > 0){
                                global.interstellar.g_factory.Steel--;
                            }
                            else {
                                global.interstellar.g_factory.Iron--;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
            },
            addOil(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.interstellar.g_factory.Lumber + global.interstellar.g_factory.Coal + global.interstellar.g_factory.Oil < global.interstellar.g_factory.count){
                        global.interstellar.g_factory.Oil++;
                        global.interstellar.g_factory.Iron++;
                    }
                    else if (global.interstellar.g_factory.Lumber + global.interstellar.g_factory.Coal > 0){
                        if (global.interstellar.g_factory.Lumber > 0){
                            global.interstellar.g_factory.Lumber--;
                        }
                        else {
                            global.interstellar.g_factory.Coal--;
                        }
                        global.interstellar.g_factory.Oil++;
                    }
                    else {
                        break;
                    }
                }
            },
            buildLabel(type){
                switch(type){
                    case 'wood':
                        return loc('modal_graphene_produce',[350,global.race['evil'] ? loc('resource_Bones_name') : loc('resource_Lumber_name'),loc('resource_Graphene_name')]);
                    case 'coal':
                        return loc('modal_graphene_produce',[25,loc('resource_Coal_name'),loc('resource_Graphene_name')]);
                    case 'oil':
                        return loc('modal_graphene_produce',[15,loc('resource_Oil_name'),loc('resource_Graphene_name')]);
                }
            },
            ariaCount(fuel){
                return ` ${global.interstellar.g_factory[fuel]} ${fuel} fueled.`;
            },
            ariaProd(res){
                return `. ${global.interstellar.g_factory[res]} producing ${res}.`;
            },
            level(){
                let on = global.interstellar.g_factory.Lumber + global.interstellar.g_factory.Coal + global.interstellar.g_factory.Oil;
                let max = global.interstellar.g_factory.count;
                return colorRange(on,max);
            }
        },
        filters: {
            on: function(c){
                return global.interstellar.g_factory.Lumber + global.interstellar.g_factory.Coal + global.interstellar.g_factory.Oil;
            }
        }
    });
}

function colorRange(num,max){
    if (num === 0){
        return 'has-text-danger';
    }
    else if (num === max){
        return 'has-text-success';
    }
    else if (num <= max / 3){
        return 'has-text-caution';
    }
    else if (num <= max * 0.66){
        return 'has-text-warning';
    }
    else if (num < max){
        return 'has-text-info';
    }
    else {
        return '';
    }
}
