import { global, keyMultiplier, sizeApproximation, p_on, support_on, quantum_level } from './vars.js';
import { loc } from './locale.js';
import { vBind, popover, clearElement, powerGrid, easterEgg, trickOrTreat } from './functions.js';
import { actions, checkCityRequirements, checkPowerRequirements } from './actions.js';
import { races, traits, genusVars } from './races.js';
import { atomic_mass } from './resources.js';
import { checkRequirements, checkSpaceRequirements, convertSpaceSector } from './space.js';
import { fortressTech } from './portal.js';
import { checkPathRequirements } from './truepath.js';

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
        case 'pylon':
            loadPylon(parent,bind);
            break;
        case 'rock_quarry':
            loadQuarry(parent,bind);
            break;
        case 'titan_mine':
            loadTMine(parent,bind);
            break;
        case 'nanite_factory':
            loadNFactory(parent,bind);
            break;
        case 'mining_ship':
            loadMiningShip(parent,bind);
            break;
        case 'alien_space_station':
            loadAlienSpaceStation(parent,bind);
            break;
        case 'replicator':
            loadReplicator(parent,bind);
            break;
    }
}

export function defineIndustry(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 1)){
        return;
    }
    clearElement($('#industry'));

    if (global.city['smelter'] && (global.city.smelter.count > 0 || global.race['cataclysm'] || global.race['orbit_decayed'] || global.tech['isolation'])){
        var smelter = $(`<div id="iSmelter" class="industry"><h2 class="header has-text-advanced">${loc('city_smelter')}</h2></div>`);
        $(`#industry`).append(smelter);
        loadIndustry('smelter',smelter,'#iSmelter');
    }
    if ((global.city['factory'] && global.city.factory.count > 0) || (global.space['red_factory'] && global.space.red_factory.count > 0) || (global.tauceti['tau_factory'] && global.tauceti.tau_factory.count > 0)){
        var factory = $(`<div id="iFactory" class="industry"><h2 class="header has-text-advanced">${loc('city_factory')}</h2></div>`);
        $(`#industry`).append(factory);
        loadIndustry('factory',factory,'#iFactory');
    }
    if (global.interstellar['mining_droid'] && global.interstellar.mining_droid.count > 0){
        var droid = $(`<div id="iDroid" class="industry"><h2 class="header has-text-advanced">${loc('interstellar_mining_droid_title')}</h2></div>`);
        $(`#industry`).append(droid);
        loadIndustry('droid',droid,'#iDroid');
    }
    if ((global.interstellar['g_factory'] && global.interstellar.g_factory.count > 0) || (global.space['g_factory'] && (global.space.g_factory.count > 0 || (global.tauceti['refueling_station'] && global.tauceti.refueling_station.count > 0)))){
        var graphene = $(`<div id="iGraphene" class="industry"><h2 class="header has-text-advanced">${loc('interstellar_g_factory_title')}</h2></div>`);
        $(`#industry`).append(graphene);
        loadIndustry('graphene',graphene,'#iGraphene');
    }
    if (global.race['casting'] && (global.city['pylon'] || global.space['pylon'] || global.tauceti['pylon'])){
        var casting = $(`<div id="iPylon" class="industry"><h2 class="header has-text-advanced">${loc('city_pylon')}</h2></div>`);
        $(`#industry`).append(casting);
        loadIndustry('pylon',casting,'#iPylon');
    }
    if (global.race['smoldering'] && global.city['rock_quarry'] && !global.race['cataclysm'] && !global.race['orbit_decayed'] && !global.tech['isolation']){
        var ratio = $(`<div id="iQuarry" class="industry"><h2 class="header has-text-advanced">${loc('city_rock_quarry')}</h2></div>`);
        $(`#industry`).append(ratio);
        loadIndustry('rock_quarry',ratio,'#iQuarry');
    }
    if (global.space['titan_mine'] && global.space['titan_mine'].count > 0){
        var ratio = $(`<div id="iTMine" class="industry"><h2 class="header has-text-advanced">${loc('city_mine')}</h2></div>`);
        $(`#industry`).append(ratio);
        loadIndustry('titan_mine',ratio,'#iTMine');
    }
    if (global.tech['tau_roid'] && global.tech.tau_roid >= 4 && global.tauceti['mining_ship']){
        var mining_ship = $(`<div id="iMiningShip" class="industry"><h2 class="header has-text-advanced">${loc('tau_roid_mining_ship')}</h2></div>`);
        $(`#industry`).append(mining_ship);
        loadIndustry('mining_ship',mining_ship,'#iMiningShip');
    }
    if (global.tech['tau_gas2'] && global.tech.tau_gas2 === 6 && global.tauceti['alien_space_station'] && (!global.tech['alien_data'] || global.tech.alien_data < 6)){
        var alien_space_station = $(`<div id="iAlienSpaceStation" class="industry"><h2 class="header has-text-advanced">${loc('tau_gas2_alien_station')}</h2></div>`);
        $(`#industry`).append(alien_space_station);
        loadIndustry('alien_space_station',alien_space_station,'#iAlienSpaceStation');
    }
    if (global.race['deconstructor'] && global.city['nanite_factory']){
        var nanite = $(`<div id="iNFactory" class="industry"><h2 class="header has-text-advanced">${loc('city_nanite_factory')}</h2></div>`);
        $(`#industry`).append(nanite);
        loadIndustry('nanite_factory',nanite,'#iNFactory');
    }
    if (global.race['replicator'] && global.tech['replicator']){
        var replicator = $(`<div id="iReplicator" class="industry"><h2 class="header has-text-advanced">${global.race.universe === 'antimatter' ? loc('tech_antireplicator') : loc('tech_replicator')}</h2></div>`);
        $(`#industry`).append(replicator);
        loadIndustry('replicator',replicator,'#iReplicator');
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

    if (bind && global.race['forge'] && global.race['steelen']){
        let trick = trickOrTreat(3,12,true);
        if (trick.length > 0){
            fuel.prepend(trick);
        }
    }

    if (!global.race['forge']){
        let fId = parent.hasClass('modalBody') ? `mSmelterFuels` : `smelterFuels`;
        let fuelTypes = $(`<div id="${fId}" class="fuels"></div>`);
        parent.append(fuelTypes);

        if ((!global.race['kindling_kindred'] && !global.race['smoldering']) || global.race['evil']){
            let f_label = global.race['evil'] ? (global.race['soul_eater'] && global.race.species !== 'wendigo' && !global.race['artifical'] ? global.resource.Food.name : global.resource.Furs.name) : global.resource.Lumber.name;
            let wood = $(`<span :aria-label="buildLabel('wood') + ariaCount('Wood')" class="current wood">${f_label} {{ s.Wood }}</span>`);
            let subWood = $(`<span role="button" class="sub" @click="subFuel('Wood')" aria-label="Remove lumber fuel"><span>&laquo;</span></span>`);
            let addWood = $(`<span role="button" class="add" @click="addFuel('Wood')" aria-label="Add lumber fuel"><span>&raquo;</span></span>`);
            fuelTypes.append(subWood);
            fuelTypes.append(wood);
            fuelTypes.append(addWood);
        }

        if (global.resource.Coal.display){
            let coal = $(`<span :aria-label="buildLabel('coal') + ariaCount('Coal')" class="current coal">${global.resource.Coal.name} <span v-html="$options.filters.spook(s.Coal)"></span></span>`);
            let subCoal = $(`<span role="button" class="sub" @click="subFuel('Coal')" aria-label="Remove coal fuel"><span>&laquo;</span></span>`);
            let addCoal = $(`<span role="button" class="add" @click="addFuel('Coal')" aria-label="Add coal fuel"><span>&raquo;</span></span>`);
            fuelTypes.append(subCoal);
            fuelTypes.append(coal);
            fuelTypes.append(addCoal);
        }

        if (global.resource.Oil.display){
            let oil = $(`<span :aria-label="buildLabel('oil') + ariaCount('Oil')" class="current oil">${global.resource.Oil.name} {{ s.Oil }}</span>`);
            let subOil = $(`<span role="button" class="sub" @click="subFuel('Oil')" aria-label="Remove oil fuel"><span>&laquo;</span></span>`);
            let addOil = $(`<span role="button" class="add" @click="addFuel('Oil')" aria-label="Add oil fuel"><span>&raquo;</span></span>`);
            fuelTypes.append(subOil);
            fuelTypes.append(oil);
            fuelTypes.append(addOil);
        }

        if (global.tech['star_forge'] && global.tech.star_forge >= 2){
            let star = $(`<span :aria-label="buildLabel('star') + ariaCount('Star')" class="current star">${loc('star')} {{ s.Star }} / {{ s.StarCap }}</span>`);
            let subStar = $(`<span role="button" class="sub" @click="subFuel('Star')" aria-label="Remove star fuel"><span>&laquo;</span></span>`);
            let addStar = $(`<span role="button" class="add" @click="addFuel('Star')" aria-label="Add star fuel"><span>&raquo;</span></span>`);
            fuelTypes.append(subStar);
            fuelTypes.append(star);
            fuelTypes.append(addStar);
        }

        if (global.tech['smelting'] && global.tech.smelting >= 8){
            let inferno = $(`<span :aria-label="buildLabel('inferno') + ariaCount('Inferno')" class="current inferno">${loc('modal_smelter_inferno')} {{ s.Inferno }}</span>`);
            let subInferno = $(`<span role="button" class="sub" @click="subFuel('Inferno')" aria-label="Remove inferno fuel"><span>&laquo;</span></span>`);
            let addInferno = $(`<span role="button" class="add" @click="addFuel('Inferno')" aria-label="Add inferno fuel"><span>&raquo;</span></span>`);
            fuelTypes.append(subInferno);
            fuelTypes.append(inferno);
            fuelTypes.append(addInferno);
        }

        let available = $('<div class="avail"></div>');
        parent.append(available);

        if (!bind && 1 === 2){
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
    }

    let irid_smelt = global.tech['irid_smelting'] || (global.tech['m_smelting'] && global.tech.m_smelting >= 2) ? true : false;
    if ((global.resource.Iridium.display && irid_smelt) || (global.resource.Steel.display && global.tech.smelting >= 2 && !global.race['steelen'])){
        let smelt = $(`<div id="${parent.hasClass('modalBody') ? `mSmelterMats` : `smelterMats`}" class="smelting"></div>`);
        parent.append(smelt);

        smelt.append(`<div><span class="has-text-warning">${loc('modal_smelter_type')}:</span> <span :class="level()">{{s.count | son}}/{{ s.cap | on }}</span></div>`);

        let smeltTypes = $(`<div class="fuels"></div>`);
        smelt.append(smeltTypes);

        let iron = $(`<span :aria-label="mLabel('iron') + ariaProd('Iron')" class="current iron">${global.resource.Iron.name} {{ s.Iron }}</span>`);
        let ironSub = $(`<span role="button" class="sub" @click="subMetal('Iron')" aria-label="Smelt less iron"><span>&laquo;</span></span>`);
        let ironAdd = $(`<span role="button" class="add" @click="addMetal('Iron')" aria-label="Smelt more iron"><span>&raquo;</span></span>`);
        smeltTypes.append(ironSub);
        smeltTypes.append(iron);
        smeltTypes.append(ironAdd);

        if (global.resource.Steel.display && global.tech.smelting >= 2 && !global.race['steelen']){
            let steel = $(`<span :aria-label="mLabel('steel') + ariaProd('Steel')" class="current steel">${global.resource.Steel.name} {{ s.Steel }}</span>`);
            let steelSub = $(`<span role="button" class="sub" @click="subMetal('Steel')" aria-label="Smelt less steel"><span>&laquo;</span></span>`);
            let steelAdd = $(`<span role="button" class="add" @click="addMetal('Steel')" aria-label="Smelt more steel"><span>&raquo;</span></span>`);
            smeltTypes.append(steelSub);
            smeltTypes.append(steel);
            smeltTypes.append(steelAdd);
        }

        if (global.resource.Iridium.display && irid_smelt){
            let iridium = $(`<span :aria-label="mLabel('iridium') + ariaProd('Iridium')" class="current iridium">${global.resource.Iridium.name} {{ s.Iridium }}</span>`);
            let iridiumSub = $(`<span role="button" class="sub" @click="subMetal('Iridium')" aria-label="Smelt less iridium"><span>&laquo;</span></span>`);
            let iridiumAdd = $(`<span role="button" class="add" @click="addMetal('Iridium')" aria-label="Smelt more iridium"><span>&raquo;</span></span>`);
            smeltTypes.append(iridiumSub);
            smeltTypes.append(iridium);
            smeltTypes.append(iridiumAdd);
        }
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
            addFuel(type){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    let total = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno;
                    if (type === 'Star' && global.city.smelter.Star >= global.city.smelter.StarCap){
                        break;
                    }
                    else if (total < global.city.smelter.cap){
                        global.city.smelter[type]++;
                        global.city.smelter.Iron++;
                    }
                    else if (total - global.city.smelter[type] > 0){
                        if (type !== 'Wood' && global.city.smelter.Wood > 0){
                            global.city.smelter.Wood--;
                            global.city.smelter[type]++;
                        }
                        else if (type !== 'Coal' && global.city.smelter.Coal > 0){
                            global.city.smelter.Coal--;
                            global.city.smelter[type]++;
                        }
                        else if (type !== 'Oil' && global.city.smelter.Oil > 0){
                            global.city.smelter.Oil--;
                            global.city.smelter[type]++;
                        }
                        else if (type !== 'Star' && global.city.smelter.Star > 0){
                            global.city.smelter.Star--;
                            global.city.smelter[type]++;
                        }
                        else if (type !== 'Inferno' && global.city.smelter.Inferno > 0){
                            global.city.smelter.Inferno--;
                            global.city.smelter[type]++;
                        }
                    }
                    else {
                        break;
                    }
                }
            },
            subFuel(type){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.city.smelter[type] > 0){
                        global.city.smelter[type]--;
                        let total = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno;
                        let used = global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium;
                        if (used > total){
                            if (global.city.smelter.Iron > 0){
                                global.city.smelter.Iron--;
                            }
                            else if (global.city.smelter.Steel > 0) {
                                global.city.smelter.Steel--;
                            }
                            else if (global.city.smelter.Iridium > 0) {
                                global.city.smelter.Iridium--;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
            },
            mLabel(m){
                return matText(m);
            },
            addMetal(m){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    let count = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno;
                    if (global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium < count){
                        global.city.smelter[m]++;
                    }
                    else if (global.city.smelter.Iron > 0 && m !== 'Iron'){
                        global.city.smelter.Iron--;
                        global.city.smelter[m]++;
                    }
                    else if (global.city.smelter.Steel > 0 && m !== 'Steel'){
                        global.city.smelter.Steel--;
                        global.city.smelter[m]++;
                    }
                    else if (global.city.smelter.Iridium > 0 && m !== 'Iridium'){
                        global.city.smelter.Iridium--;
                        global.city.smelter[m]++;
                    }
                    else {
                        break;
                    }
                }
            },
            subMetal(m){
                let keyMult = keyMultiplier();
                global.city.smelter[m] -= keyMult;
                if (global.city.smelter[m] < 0){
                    global.city.smelter[m] = 0;
                }
            },
            buildLabel(type){
                return tooltip(type);
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
                let workers = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno;
                return colorRange(workers,global.city.smelter.count);
            }
        },
        filters: {
            on(c){
                return global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno;
            },
            son(c){
                return global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium;
            },
            diffSize(value){
                return value > 0 ? `+${sizeApproximation(value,2)}` : sizeApproximation(value,2);
            },
            spook(v){
                if (bind && (((global.race['kindling_kindred'] || global.race['smoldering']) && (global.city.smelter.Steel === 6 || global.city.smelter.Iron === 6)) || global.city.smelter.Wood === 6) && global.city.smelter.Coal === 6 && global.city.smelter.Oil === 6){
                    let trick = trickOrTreat(3,12,true);
                    if (trick.length > 0){
                        return trick;
                    }
                }
                return v;
            },
            altspook(v){
                if (bind && global.race['forge'] && global.city.smelter.Steel === 6){
                    let trick = trickOrTreat(3,12,true);
                    if (trick.length > 0){
                        return trick;
                    }
                }
                return v;
            }
        }
    });

    function tooltip(type){
        switch(type){
            case 'wood':
                return loc('modal_build_wood',[global.race['evil'] ? (global.race['soul_eater'] && global.race.species !== 'wendigo' && !global.race['artifical'] ? global.resource.Food.name : global.resource.Furs.name) : global.resource.Lumber.name, global.race['evil'] && !global.race['soul_eater'] || global.race.species === 'wendigo' ? 1 : 3]);
            case 'coal':
                {
                    let coal_fuel = global.race['kindling_kindred'] ? 0.15 : 0.25;
                    if (global.tech['uranium'] && global.tech['uranium'] >= 3){
                        return loc('modal_build_coal2',[coal_fuel,loc('resource_Coal_name'),loc('resource_Uranium_name')]);
                    }
                    else {
                        return loc('modal_build_coal1',[coal_fuel,loc('resource_Coal_name')]);
                    }
                }
            case 'oil':
                return loc('modal_build_oil',['0.35',loc('resource_Oil_name')]);
            case 'star':
                return global.tech['irid_smelting'] ? loc('modal_build_star2',[loc('resource_Titanium_name'),loc('resource_Iridium_name')]) : loc('modal_build_star',[loc('resource_Titanium_name')]);
            case 'inferno':
                {
                    let coal = 50;
                    let oil = 35;
                    let infernite = 0.5;
                    return loc('modal_build_inferno',[coal,loc('resource_Coal_name'),oil,loc('resource_Oil_name'),infernite,loc('resource_Infernite_name')]);
                }
        }
    }

    function matText(type){
        if (type === 'steel'){
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
            return loc('modal_smelter_steel',[+(boost).toFixed(3),loc('resource_Steel_name'),loc('resource_Coal_name'),loc('resource_Iron_name')]);
        }
        else if (type === 'iridium'){
            let boost = global.tech['smelting'] >= 7 ? 6.25 : 5;
            if (global.race['pyrophobia']){
                boost *= 0.9;
            }
            return loc('modal_smelter_iron',[+(boost).toFixed(3),loc('resource_Iridium_name')]);
        }
        else {
            let boost = global.tech['smelting'] >= 3 ? (global.tech['smelting'] >= 7 ? 15 : 12) : 10;
            if (global.race['pyrophobia']){
                boost *= 0.9;
            }
            return loc('modal_smelter_iron',[+(boost).toFixed(3),loc('resource_Iron_name')]);
        }
    }

    if (!global.race['forge']){
        let id = parent.hasClass('modalBody') ? `mSmelterFuels` : `smelterFuels`;
        ['wood','coal','oil','star','inferno'].forEach(function(fuel){
            popover(`${id}${fuel}`,function(){
                return tooltip(fuel);
            }, {
                elm: $(`#${id} > .${fuel}`),
                attach: '#main',
            });
        });
    }

    if ((global.resource.Steel.display && global.tech.smelting >= 2 && !global.race['steelen']) || (global.resource.Iridium.display && irid_smelt)){
        let id = parent.hasClass('modalBody') ? `mSmelterMats` : `smelterMats`;
        ['iron','steel','iridium'].forEach(function(mat){
            if (mat === 'steel' && (!global.resource.Steel.display || global.race['steelen'])){
                return;
            }
            else if (mat === 'iridium' && !(global.resource.Iridium.display && irid_smelt)){
                return;
            }
            popover(`${id}${mat}`,function(){
                return matText(mat);
            }, {
                elm: $(`#${id} span.${mat}`),
                attach: '#main',
            });
        });
    }
}

function loadFactory(parent,bind){
    let fuel = $(`<div><span class="has-text-warning">${loc('modal_factory_operate')}:</span> <span :class="level()">{{count | on}}/{{ on | max }}</span></div>`);
    parent.append(fuel);

    let lux = $(`<div class="factory"><span class="Lux" :aria-label="buildLabel('Lux') + ariaProd('Lux')">${loc('modal_factory_lux')}</span></div>`);
    parent.append(lux);

    let luxCount = $(`<span class="current" v-html="$options.filters.spook(Lux)"></span>`);
    let subLux = $(`<span class="sub" @click="subItem('Lux')" role="button" aria-label="Decrease Lux production">&laquo;</span>`);
    let addLux = $(`<span class="add" @click="addItem('Lux')" role="button" aria-label="Increase Lux production">&raquo;</span>`);
    lux.append(subLux);
    lux.append(luxCount);
    lux.append(addLux);

    if (global.tech['synthetic_fur']){
        let fur = $(`<div class="factory"><span class="Furs" :aria-label="buildLabel('Furs') + ariaProd('Furs')">${global.race['evil'] ? loc('resource_Flesh_name') : loc('resource_Furs_name')}</span></div>`);
        parent.append(fur);

        let furCount = $(`<span class="current">{{ Furs }}</span>`);
        let subFurs= $(`<span class="sub" @click="subItem('Furs')" role="button" aria-label="Decrease Furs production">&laquo;</span>`);
        let addFurs = $(`<span class="add" @click="addItem('Furs')" role="button" aria-label="Increase Furs production">&raquo;</span>`);
        fur.append(subFurs);
        fur.append(furCount);
        fur.append(addFurs);
    }

    let alloy = $(`<div class="factory"><span class="Alloy" :aria-label="buildLabel('Alloy') + ariaProd('Alloy')">${loc('resource_Alloy_name')}</span></div>`);
    parent.append(alloy);

    let alloyCount = $(`<span class="current">{{ Alloy }}</span>`);
    let subAlloy = $(`<span class="sub" @click="subItem('Alloy')" role="button" aria-label="Decrease Alloy production">&laquo;</span>`);
    let addAlloy = $(`<span class="add" @click="addItem('Alloy')" role="button" aria-label="Increase Alloy production">&raquo;</span>`);
    alloy.append(subAlloy);
    alloy.append(alloyCount);
    alloy.append(addAlloy);

    if (global.tech['polymer']){
        let polymer = $(`<div class="factory"><span class="Polymer" :aria-label="buildLabel('Polymer') + ariaProd('Polymer')">${loc('resource_Polymer_name')}</span></div>`);
        parent.append(polymer);

        let polymerCount = $(`<span class="current">{{ Polymer }}</span>`);
        let subPolymer= $(`<span class="sub" @click="subItem('Polymer')" role="button" aria-label="Decrease Polymer production">&laquo;</span>`);
        let addPolymer = $(`<span class="add" @click="addItem('Polymer')" role="button" aria-label="Increase Polymer production">&raquo;</span>`);
        polymer.append(subPolymer);
        polymer.append(polymerCount);
        polymer.append(addPolymer);
    }

    if (global.tech['nano']){
        let nano = $(`<div class="factory"><span class="Nano" :aria-label="buildLabel('Nano') + ariaProd('Nano')">${loc('resource_Nano_Tube_name')}</span></div>`);
        parent.append(nano);

        let nanoCount = $(`<span class="current">{{ Nano }}</span>`);
        let subNano= $(`<span class="sub" @click="subItem('Nano')" role="button" aria-label="Decrease Nanotube production">&laquo;</span>`);
        let addNano = $(`<span class="add" @click="addItem('Nano')" role="button" aria-label="Increase Nanotube production">&raquo;</span>`);
        nano.append(subNano);
        nano.append(nanoCount);
        nano.append(addNano);
    }

    if (global.tech['stanene']){
        let stanene = $(`<div class="factory"><span class="Stanene" :aria-label="buildLabel('Stanene') + ariaProd('Stanene')">${loc('resource_Stanene_name')}</span></div>`);
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
                if (global.tauceti['tau_factory'] && support_on['tau_factory']){
                    max += support_on['tau_factory'] * (global.tech['isolation'] ? 5 : 3);
                }
                let keyMult = keyMultiplier();
                for (var i=0; i<keyMult; i++){
                    let used = global.city.factory.Lux + global.city.factory.Furs + global.city.factory.Alloy + global.city.factory.Polymer + global.city.factory.Nano + global.city.factory.Stanene;
                    if (used < max){
                        global.city.factory[item]++;
                    }
                    else if (used === max && item !== 'Alloy' && global.city.factory['Alloy'] > 0){
                        global.city.factory['Alloy']--;
                        global.city.factory[item]++;
                    }
                    else {
                        break;
                    }
                }
            },
            buildLabel: function(type){
                return tooltip(type);
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
                if (global.tauceti['tau_factory'] && support_on['tau_factory']){
                    max += support_on['tau_factory'] * (global.tech['isolation'] ? 5 : 3);
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
                if (global.tauceti['tau_factory'] && support_on['tau_factory']){
                    max += support_on['tau_factory'] * (global.tech['isolation'] ? 5 : 3);
                }
                return max;
            },
            spook(v){
                if (global.city.factory.Lux === 3 && bind){
                    let trick = trickOrTreat(6,12,true);
                    if (trick.length > 0){
                        return trick;
                    }
                }
                return v;
            }
        }
    });

    function tooltip(type){
        let assembly = global.tech['factory'] ? true : false;
        switch(type){
            case 'Lux':{
                let demand = +(global.resource[global.race.species].amount * (assembly ? f_rate.Lux.demand[global.tech['factory']] : f_rate.Lux.demand[0]));
                if (global.race['toxic']){
                    demand *= 1 + (traits.toxic.vars()[0] / 100);
                }
                if (global.civic.govern.type === 'corpocracy'){
                    demand *= 2.5;
                }
                if (global.civic.govern.type === 'socialist'){
                    demand *= 0.8;
                }
                if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 2){
                    demand *= 1.1;
                }
                if (global.race['inflation']){
                    demand *= 1 + (global.race.inflation / 1250);
                }
                if (global.tech['isolation']){
                    demand *= 1 + ((support_on['colony'] || 0) * 0.5);
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
                if (global.race['kindling_kindred'] || global.race['smoldering']){
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
    }

    ['Lux','Furs','Alloy','Polymer','Nano','Stanene'].forEach(function(type){
        let id = parent.hasClass('modalBody') ? `specialModal` : `iFactory`;
        popover(`${id}${type}`,function(){
            return tooltip(type);
        }, {
            elm: $(`#${id} .factory > .${type}`),
            attach: '#main',
        });
    });
}

export const nf_resources = [
    'Lumber', 'Chrysotile', 'Stone', 'Crystal', 'Furs', 'Copper', 'Iron', 'Aluminium',
    'Cement', 'Coal', 'Oil', 'Uranium', 'Steel', 'Titanium', 'Alloy', 'Polymer',
    'Iridium', 'Helium_3', 'Water', 'Deuterium', 'Neutronium', 'Adamantite', 'Bolognium', 'Orichalcum',
];

function loadNFactory(parent,bind){
    let fuel = $(`<div><span class="has-text-warning">${loc('modal_factory_operate')}:</span> <span :class="level()">{{count | on}}/{{ count | max }}</span></div>`);
    parent.append(fuel);

    let rId = parent.hasClass('modalBody') ? `mNFactoryRes` : `NFactoryRes`;
    let resTypes = $(`<div id="${rId}" class="fuels"></div>`);
    parent.append(resTypes);

    nf_resources.forEach(function(r){
        if (global.resource[r].display){
            let res = $(`<span :aria-label="eatLabel('${r}')" class="current ${r}">${global.resource[r].name} {{ ${r} }}</span>`);
            let subRes = $(`<span role="button" class="sub" @click="subItem('${r}')" aria-label="Decrease ${r} destruction"><span>&laquo;</span></span>`);
            let addRes = $(`<span role="button" class="add" @click="addItem('${r}')" aria-label="Increase ${r} destruction"><span>&raquo;</span></span>`);
            resTypes.append(subRes);
            resTypes.append(res);
            resTypes.append(addRes);
        }
    });

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.city.nanite_factory,
        methods: {
            subItem: function(r){
                let keyMult = keyMultiplier();
                global.city.nanite_factory[r] -= keyMult;
                if (global.city.nanite_factory[r] < 0){
                    global.city.nanite_factory[r] = 0;
                }
            },
            addItem: function(r){
                let keyMult = keyMultiplier();
                let on = 0;
                nf_resources.forEach(function(r){
                    on += global.city.nanite_factory[r];
                });
                let avail = global.city.nanite_factory.count * 50 - on;
                if (keyMult > avail){
                    keyMult = avail;
                }
                if (keyMult > 0){
                    global.city.nanite_factory[r] += keyMult;
                }
            },
            eatLabel(r){
                return `Consume ${r} to produce ${global.resource.Nanite.name}`;
            },
            level(){
                let on = 0;
                nf_resources.forEach(function(r){
                    on += global.city.nanite_factory[r];
                });
                let max = global.city.nanite_factory.count;
                return colorRange(on,max);
            }
        },
        filters: {
            on(){
                let on = 0;
                nf_resources.forEach(function(r){
                    on += global.city.nanite_factory[r];
                });
                return on;
            },
            max(){
                return global.city.nanite_factory.count * 50;
            }
        }
    });

    function tooltip(res){
        let base_conversion = +(atomic_mass[res] / 100 * (traits.deconstructor.vars()[0] / 100)).toFixed(4);
        let curr_conversion = +(global.city.nanite_factory[res] * base_conversion).toFixed(4);
        return loc('modal_nfactory_resource_label',[1,global.resource[res].name,base_conversion,global.resource.Nanite.name,global.city.nanite_factory[res],curr_conversion]);
    }

    nf_resources.forEach(function(type){
        let id = parent.hasClass('modalBody') ? `specialModal` : `iNFactory`;
        popover(`${id}${type}`,function(){
            return tooltip(type);
        }, {
            elm: $(`#${id} > .fuels > .${type}`),
            attach: '#main',
        });
    });
}

function loadDroid(parent,bind){
    let fuel = $(`<div><span class="has-text-warning">${loc('modal_factory_operate')}:</span> <span :class="level()">{{count | on}}/{{ on | max }}</span></div>`);
    parent.append(fuel);

    let adam = $(`<div class="factory"><span class="adam" :aria-label="buildLabel('adam') + ariaProd('adam')">${loc('resource_Adamantite_name')}</span></div>`);
    parent.append(adam);
    let adamCount = $(`<span class="current">{{ adam }}</span>`);
    let adamSub = $(`<span class="sub" @click="subItem('adam')" role="button" aria-label="Decrease Adamantite production">&laquo;</span>`);
    let adamAdd = $(`<span class="add" @click="addItem('adam')" role="button" aria-label="Increase Adamantite production">&raquo;</span>`);
    adam.append(adamSub);
    adam.append(adamCount);
    adam.append(adamAdd);

    let uran = $(`<div class="factory"><span class="uran" :aria-label="buildLabel('uran') + ariaProd('uran')">${loc('resource_Uranium_name')}</span></div>`);
    parent.append(uran);
    let uranCount = $(`<span class="current">{{ uran }}</span>`);
    let uranSub = $(`<span class="sub" @click="subItem('uran')" role="button" aria-label="Decrease Uranium production">&laquo;</span>`);
    let uranAdd = $(`<span class="add" @click="addItem('uran')" role="button" aria-label="Increase Uranium production">&raquo;</span>`);
    uran.append(uranSub);
    uran.append(uranCount);
    uran.append(uranAdd);

    let coal = $(`<div class="factory"><span class="coal" :aria-label="buildLabel('coal') + ariaProd('coal')">${loc('resource_Coal_name')}</span></div>`);
    parent.append(coal);
    let coalCount = $(`<span class="current">{{ coal }}</span>`);
    let coalSub = $(`<span class="sub" @click="subItem('coal')" role="button" aria-label="Decrease Coal production">&laquo;</span>`);
    let coalAdd = $(`<span class="add" @click="addItem('coal')" role="button" aria-label="Increase Coal production">&raquo;</span>`);
    coal.append(coalSub);
    coal.append(coalCount);
    coal.append(coalAdd);

    let alum = $(`<div class="factory"><span class="alum" :aria-label="buildLabel('alum') + ariaProd('alum')">${loc('resource_Aluminium_name')}</span></div>`);
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
                return tooltip(type);
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

    function tooltip(type){
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
    }

    ['adam','uran','coal','alum'].forEach(function(type){
        let id = parent.hasClass('modalBody') ? `specialModal` : `iDroid`;
        popover(`${id}${type}`,function(){
            return tooltip(type);
        }, {
            elm: $(`#${id} .factory > .${type}`),
            attach: '#main',
        });
    });
}

function loadGraphene(parent,bind){
    let graph_source = global.race['truepath'] ? 'space' : 'interstellar';

    let fuel = $(`<div><span class="has-text-warning">${loc('modal_smelter_fuel')}:</span> <span :class="level()">{{count | on}}/{{ on | max }}</span></div>`);
    parent.append(fuel);

    let fuelTypes = $('<div></div>');
    parent.append(fuelTypes);

    if (!global.race['kindling_kindred'] && !global.race['smoldering']){
        let f_label = global.resource.Lumber.name;
        let wood = $(`<span :aria-label="buildLabel('wood') + ariaCount('Wood')" class="current wood">${f_label} {{ Lumber }}</span>`);
        let subWood = $(`<span role="button" class="sub" @click="subWood" aria-label="Remove lumber fuel"><span>&laquo;</span></span>`);
        let addWood = $(`<span role="button" class="add" @click="addWood" aria-label="Add lumber fuel"><span>&raquo;</span></span>`);
        fuelTypes.append(subWood);
        fuelTypes.append(wood);
        fuelTypes.append(addWood);
    }

    if (global.resource.Coal.display){
        let coal = $(`<span :aria-label="buildLabel('coal') + ariaCount('Coal')" class="current coal">${global.resource.Coal.name} {{ Coal }}</span>`);
        let subCoal = $(`<span role="button" class="sub" @click="subCoal" aria-label="Remove coal fuel"><span>&laquo;</span></span>`);
        let addCoal = $(`<span role="button" class="add" @click="addCoal" aria-label="Add coal fuel"><span>&raquo;</span></span>`);
        fuelTypes.append(subCoal);
        fuelTypes.append(coal);
        fuelTypes.append(addCoal);
    }

    if (global.resource.Oil.display){
        let oil = $(`<span :aria-label="buildLabel('oil') + ariaCount('Oil')" class="current oil">${global.resource.Oil.name} {{ Oil }}</span>`);
        let subOil = $(`<span role="button" class="sub" @click="subOil" aria-label="Remove oil fuel"><span>&laquo;</span></span>`);
        let addOil = $(`<span role="button" class="add" @click="addOil" aria-label="Add oil fuel"><span>&raquo;</span></span>`);
        fuelTypes.append(subOil);
        fuelTypes.append(oil);
        fuelTypes.append(addOil);
    }

    vBind({
        el: bind ? bind : '#specialModal',
        data: global[graph_source]['g_factory'],
        methods: {
            subWood(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[graph_source].g_factory.Lumber > 0){
                        global[graph_source].g_factory.Lumber--;
                    }
                    else {
                        break;
                    }
                }
            },
            addWood(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[graph_source].g_factory.Lumber + global[graph_source].g_factory.Coal + global[graph_source].g_factory.Oil < global[graph_source].g_factory.on){
                        global[graph_source].g_factory.Lumber++;
                    }
                    else if (global[graph_source].g_factory.Coal + global[graph_source].g_factory.Oil > 0){
                        if (global[graph_source].g_factory.Oil > global[graph_source].g_factory.Coal){
                            global[graph_source].g_factory.Coal > 0 ? global[graph_source].g_factory.Coal-- : global[graph_source].g_factory.Oil--;
                        }
                        else {
                            global[graph_source].g_factory.Oil > 0 ? global[graph_source].g_factory.Oil-- : global[graph_source].g_factory.Coal--;
                        }
                        global[graph_source].g_factory.Lumber++;
                    }
                    else {
                        break;
                    }
                }
            },
            subCoal(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[graph_source].g_factory.Coal > 0){
                        global[graph_source].g_factory.Coal--;
                    }
                    else {
                        break;
                    }
                }
            },
            addCoal(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[graph_source].g_factory.Lumber + global[graph_source].g_factory.Coal + global[graph_source].g_factory.Oil < global[graph_source].g_factory.on){
                        global[graph_source].g_factory.Coal++;
                    }
                    else if (global[graph_source].g_factory.Lumber + global[graph_source].g_factory.Oil > 0){
                        if (global[graph_source].g_factory.Lumber > 0){
                            global[graph_source].g_factory.Lumber--;
                        }
                        else {
                            global[graph_source].g_factory.Oil--;
                        }
                        global[graph_source].g_factory.Coal++;
                    }
                    else {
                        break;
                    }
                }
            },
            subOil(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[graph_source].g_factory.Oil > 0){
                        global[graph_source].g_factory.Oil--;
                    }
                    else {
                        break;
                    }
                }
            },
            addOil(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[graph_source].g_factory.Lumber + global[graph_source].g_factory.Coal + global[graph_source].g_factory.Oil < global[graph_source].g_factory.on){
                        global[graph_source].g_factory.Oil++;
                    }
                    else if (global[graph_source].g_factory.Lumber + global[graph_source].g_factory.Coal > 0){
                        if (global[graph_source].g_factory.Lumber > 0){
                            global[graph_source].g_factory.Lumber--;
                        }
                        else {
                            global[graph_source].g_factory.Coal--;
                        }
                        global[graph_source].g_factory.Oil++;
                    }
                    else {
                        break;
                    }
                }
            },
            buildLabel(type){
                return tooltip(type);
            },
            ariaCount(fuel){
                return ` ${global[graph_source].g_factory[fuel]} ${fuel} fueled.`;
            },
            ariaProd(res){
                return `. ${global[graph_source].g_factory[res]} producing ${res}.`;
            },
            level(){
                let on = global[graph_source].g_factory.Lumber + global[graph_source].g_factory.Coal + global[graph_source].g_factory.Oil;
                let max = global[graph_source].g_factory.on;
                return colorRange(on,max);
            }
        },
        filters: {
            on: function(c){
                return global[graph_source].g_factory.Lumber + global[graph_source].g_factory.Coal + global[graph_source].g_factory.Oil;
            }
        }
    });

    function tooltip(type){
        switch(type){
            case 'wood':
                return loc('modal_graphene_produce',[350,global.race['evil'] ? loc('resource_Bones_name') : loc('resource_Lumber_name'),loc('resource_Graphene_name')]);
            case 'coal':
                return loc('modal_graphene_produce',[25,loc('resource_Coal_name'),loc('resource_Graphene_name')]);
            case 'oil':
                return loc('modal_graphene_produce',[15,loc('resource_Oil_name'),loc('resource_Graphene_name')]);
        }
    }

    ['wood','coal','oil'].forEach(function(type){
        let id = parent.hasClass('modalBody') ? `specialModal` : `iGraphene`;
        popover(`${id}${type}`,function(){
            return tooltip(type);
        }, {
            elm: $(`#${id} > div > .${type}`),
            attach: '#main',
        });
    });
}

function loadPylon(parent,bind){
    let casting = $(`<div><span class="has-text-warning">${loc('modal_pylon_casting')}:</span> <span :class="level()">{{total | drain}}</span></div>`);
    parent.append(casting);

    let spellTypes = $('<div class="pylon wrap"></div>');
    parent.append(spellTypes);

    let ritualList = [];
    if (global.race['orbit_decayed']){
        ritualList = ['miner','science','factory','army','hunting','crafting'];
    }
    else if (global.race['cataclysm']){
        ritualList = ['science','factory','army','hunting','crafting'];
    }
    else {
        ritualList = ['farmer','miner','lumberjack','science','factory','army','hunting','crafting'];
    }

    if (global.tech['magic'] && global.tech.magic >= 3){
        ritualList.forEach(function (spell){
            if (
                (spell !== 'crafting' && spell !== 'lumberjack' && spell !== 'farmer') ||
                (spell === 'farmer' && !global.race['detritivore'] && !global.race['carnivore'] && !global.race['soul_eater'] && !global.race['artifical']) ||
                (spell === 'lumberjack' && !global.race['kindling_kindred'] && !global.race['smoldering'] && !global.race['evil']) ||
                (spell === 'crafting' && global.tech.magic >= 4)
                ){
                let cast = $(`<span :aria-label="buildLabel('${spell}') + ariaCount('${spell}')" class="current ${spell}">${loc(`modal_pylon_spell_${spell}`)} {{ ${spell} }}</span>`);
                let sub = $(`<span role="button" class="sub" @click="subSpell('${spell}')" aria-label="Stop casting '${spell}' ritual"><span>&laquo;</span></span>`);
                let add = $(`<span role="button" class="add" @click="addSpell('${spell}')" aria-label="Cast '${spell}' ritual"><span>&raquo;</span></span>`);
                spellTypes.append(sub);
                spellTypes.append(cast);
                spellTypes.append(add);
            }
        });
    }

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.race['casting'],
        methods: {
            buildLabel(spell){
                return tooltip(spell);
            },
            addSpell(spell){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    let diff = manaCost(global.race.casting[spell] + 1) - manaCost(global.race.casting[spell]);
                    if (global.resource.Mana.diff >= diff){
                        global.race.casting[spell]++;
                        global.race.casting.total++;
                        global.resource.Mana.diff -= diff;
                    }
                    else {
                        break;
                    }
                }
            },
            subSpell(spell){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.race.casting[spell] > 0){
                        global.race.casting[spell]--;
                        global.race.casting.total--;
                    }
                    else {
                        break;
                    }
                }
            },
            ariaCount(spell){
                return ` ${spell} casting.`;
            },
            level(){
                return colorRange(global.race.casting.total,global.resource.Mana.gen,true);
            }
        },
        filters: {
            drain: function(c){
                let total = 0;
                ritualList.forEach(function (spell){
                    if (global.race.casting[spell] && global.race.casting[spell] > 0){
                        total += manaCost(global.race.casting[spell]);
                    }
                });
                return loc('modal_pylon_casting_cost',[+(total).toFixed(3)]);
            }
        }
    });

    function tooltip(spell){
        let draw = +(manaCost(global.race.casting[spell])).toFixed(4);
        let diff = +(manaCost(global.race.casting[spell] + 1) - manaCost(global.race.casting[spell])).toFixed(4);
        let boost = +(100 * (global.race.casting[spell] / (global.race.casting[spell] + 75))).toFixed(2);
        if (spell === 'crafting'){
            let auto = +(100 * (2 * global.race.casting[spell] / (2 * global.race.casting[spell] + 75))).toFixed(2);
            return loc('modal_pylon_casting_label_crafting',[draw,boost,auto,diff]);
        }
        return loc('modal_pylon_casting_label',[loc(`modal_pylon_spell_${spell}`),draw,diff,boost]);
    }

    ritualList.forEach(function(type){
        let id = parent.hasClass('modalBody') ? `specialModal` : `iPylon`;
        popover(`${id}${type}`,function(){
            return tooltip(type);
        }, {
            elm: $(`#${id} > .pylon > .${type}`),
            attach: '#main',
        });
    });
}

function loadQuarry(parent,bind){
    parent.append($(`<div>${loc('modal_quarry_ratio',[global.resource.Chrysotile.name])}</div>`));

    let slider = $(`<div class="sliderbar"><span class="sub" role="button" @click="sub" aria-label="Increase Stone Production">&laquo;</span><b-slider v-model="asbestos" format="percent"></b-slider><span class="add" role="button" @click="add" aria-label="Increase Chrysotile Production">&raquo;</span></div>`);
    parent.append(slider);

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.city.rock_quarry,
        methods: {
            sub(){
                let keyMult = keyMultiplier();
                if (global.city.rock_quarry.asbestos > 0){
                    global.city.rock_quarry.asbestos -= keyMult;
                    if (global.city.rock_quarry.asbestos < 0){
                        global.city.rock_quarry.asbestos = 0;
                    }
                }
            },
            add(){
                let keyMult = keyMultiplier();
                if (global.city.rock_quarry.asbestos < 100){
                    global.city.rock_quarry.asbestos += keyMult;
                    if (global.city.rock_quarry.asbestos > 100){
                        global.city.rock_quarry.asbestos = 100;
                    }
                }
            }
        }
    });
}

function loadTMine(parent,bind){
    parent.append($(`<div>${loc('modal_quarry_ratio',[global.resource.Adamantite.name])}</div>`));

    let slider = $(`<div class="sliderbar"><span class="sub" role="button" @click="sub" aria-label="Increase Aluminium Production">&laquo;</span><b-slider v-model="ratio" format="percent"></b-slider><span class="add" role="button" @click="add" aria-label="Increase Adamantite Production">&raquo;</span></div>`);
    parent.append(slider);

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.space.titan_mine,
        methods: {
            sub(){
                let keyMult = keyMultiplier();
                if (global.space.titan_mine.ratio > 0){
                    global.space.titan_mine.ratio -= keyMult;
                    if (global.space.titan_mine.ratio < 0){
                        global.space.titan_mine.ratio = 0;
                    }
                }
            },
            add(){
                let keyMult = keyMultiplier();
                if (global.space.titan_mine.ratio < 100){
                    global.space.titan_mine.ratio += keyMult;
                    if (global.space.titan_mine.ratio > 100){
                        global.space.titan_mine.ratio = 100;
                    }
                }
            }
        }
    });
}

function loadMiningShip(parent,bind){
    parent.append($(`<div>${loc('tau_roid_mining_ship_ratio',[global.resource.Iron.name,global.resource.Aluminium.name])}</div>`));
    let common = $(`<div class="sliderbar thin"><span class="sub" role="button" @click="sub('common')" aria-label="Increase Iron Production">&laquo;</span><b-slider v-model="common" format="percent"></b-slider><span class="add" role="button" @click="add('common')" aria-label="Increase Aluminium Production">&raquo;</span></div>`);
    parent.append(common);

    parent.append($(`<div>${loc('tau_roid_mining_ship_ratio',[global.resource.Iridium.name,global.resource.Neutronium.name])}</div>`));
    let uncommon = $(`<div class="sliderbar thin"><span class="sub" role="button" @click="sub('uncommon')" aria-label="Increase Iridium Production">&laquo;</span><b-slider v-model="uncommon" format="percent"></b-slider><span class="add" role="button" @click="add('uncommon')" aria-label="Increase Neutronium Production">&raquo;</span></div>`);
    parent.append(uncommon);

    if (global.tech.tau_roid >= 5){
        parent.append($(`<div>${loc('tau_roid_mining_ship_ratio',[global.resource.Orichalcum.name,global.resource.Elerium.name])}</div>`));
        let rare = $(`<div class="sliderbar thin"><span class="sub" role="button" @click="sub('rare')" aria-label="Increase Orichalcum Production">&laquo;</span><b-slider v-model="rare" format="percent"></b-slider><span class="add" role="button" @click="add('rare')" aria-label="Increase Elerium Production">&raquo;</span></div>`);
        parent.append(rare);
    }

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.tauceti.mining_ship,
        methods: {
            sub(r){
                let keyMult = keyMultiplier();
                if (global.tauceti.mining_ship[r] > 0){
                    global.tauceti.mining_ship[r] -= keyMult;
                    if (global.tauceti.mining_ship[r] < 0){
                        global.tauceti.mining_ship[r] = 0;
                    }
                }
            },
            add(r){
                let keyMult = keyMultiplier();
                if (global.tauceti.mining_ship[r] < 100){
                    global.tauceti.mining_ship[r] += keyMult;
                    if (global.tauceti.mining_ship[r] > 100){
                        global.tauceti.mining_ship[r] = 100;
                    }
                }
            }
        }
    });
}

function loadAlienSpaceStation(parent,bind){
    parent.append($(`<div>${loc('tau_gas2_alien_station_focus',[global.resource.Knowledge.name])}</div>`));
    let common = $(`<div class="sliderbar thin"><span class="sub" role="button" @click="sub('focus')" aria-label="Decrease Knowledge Focus">&laquo;</span><b-slider v-model="focus" format="percent"></b-slider><span class="add" role="button" @click="add('focus')" aria-label="Increase Knowledge Focus">&raquo;</span></div>`);
    parent.append(common);

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.tauceti.alien_space_station,
        methods: {
            sub(r){
                let keyMult = keyMultiplier();
                if (global.tauceti.alien_space_station[r] > 0){
                    global.tauceti.alien_space_station[r] -= keyMult;
                    if (global.tauceti.alien_space_station[r] < 0){
                        global.tauceti.alien_space_station[r] = 0;
                    }
                }
            },
            add(r){
                let keyMult = keyMultiplier();
                if (global.tauceti.alien_space_station[r] < 100){
                    global.tauceti.alien_space_station[r] += keyMult;
                    if (global.tauceti.alien_space_station[r] > 100){
                        global.tauceti.alien_space_station[r] = 100;
                    }
                }
            }
        }
    });
}

function loadReplicator(parent,bind){
    if (global.race['replicator']){
        parent.append($(`<div>${global.race.universe === 'antimatter' ? loc('tech_antireplicator') : loc('tech_replicator')}</div>`));

        let content = $(`<div class="doublePane"></div>`);
        parent.append(content);
        
        if (bind){
        let values = ``;
            Object.keys(atomic_mass).forEach(function(res){
                values += `<b-dropdown-item aria-role="listitem" v-on:click="setVal('${res}')" data-val="${res}" v-show="avail('${res}')">${global.resource[res].name}</b-dropdown-item>`;
            });

            content.append(`<div><b-dropdown :triggers="['hover']" aria-role="list" :scrollable="true" :max-height="200" class="dropList">
                <button class="button is-info" slot="trigger">
                    <span>{{ res | resName }}</span>
                </button>${values}
            </b-dropdown></div>`);
        }
        else {
            let scrollMenu = ``;
            Object.keys(atomic_mass).forEach(function(res){
                if (global.resource[res].display){
                    scrollMenu += `<b-radio-button v-model="res" native-value="${res}">${global.resource[res].name}</b-radio-button>`;
                }
            });
            content.append(`<div id="hscrolltarget" class="left hscroll"><b-field class="buttonList">${scrollMenu}</b-field></div>`);
        }

        let power = bind ? $(`<div></div>`) : $(`<div class="right"></div>`);
        content.append(power);

        let current = $(`<span :aria-label="aria" class="current"><span>{{ pow }}MW</span></span>`);
        let less = $(`<span role="button" class="sub" @click="less" aria-label="Reduce power by 1"><span>&laquo;</span></span>`);
        let more = $(`<span role="button" class="add" @click="more" aria-label="Increase power by 1"><span>&raquo;</span></span>`);
        power.append(less);
        power.append(current);
        power.append(more);

        parent.append(`<div class="topPad">{{ res | result }}</div>`); 

        vBind({
            el: bind ? bind : '#specialModal',
            data: global.race.replicator,
            methods: {
                less(){
                    let keyMult = keyMultiplier();
                    if (global.race.replicator.pow > 0){
                        global.race.replicator.pow -= keyMult;
                        if (global.race.replicator.pow < 0){
                            global.race.replicator.pow = 0;
                        }
                    }
                },
                more(){
                    let keyMult = keyMultiplier();
                    global.race.replicator.pow += keyMult;
                },
                setVal(r){
                    if (global.resource[r].display){
                        global.race.replicator.res = r;
                    }
                },
                avail(r){
                    return global.resource[r].display;
                },
                aria(){
                    return global.race.replicator.pow + 'MW';
                }
            },
            filters: {
                resName(r){
                    return global.resource[r].name;
                },
                result(r){
                    return loc(`tau_replicator`,[replicator(r,global.race.replicator.pow).toFixed(3),global.resource[r].name]);
                }
            }
        });

        if (!bind){
            const scrollContainer = document.getElementById('hscrolltarget');

            scrollContainer.addEventListener("wheel", (evt) => {
                evt.preventDefault();
                scrollContainer.scrollLeft += evt.deltaY;
            });
        }
    }
}

export function replicator(res,pow){
    if (global.race['lone_survivor']){
        return 17.5 * quantum_level / atomic_mass[res] * pow;
    }
    else {
        let qLevel = quantum_level || 1;
        return 12.5 * qLevel / atomic_mass[res] * (pow ** 0.75);
    }
}

export function manaCost(spell,rate){
    rate = typeof rate === 'undefined' ? 0.0025 : rate;
    return spell * ((1 + rate) ** spell - 1);
}

function colorRange(num,max,invert){
    if (num <= 0){
        return invert ? 'has-text-success' : 'has-text-danger';
    }
    else if (num >= max){
        return invert ? 'has-text-danger' : 'has-text-success';
    }
    else if (num <= max / 3){
        return invert ? 'has-text-info' : 'has-text-caution';
    }
    else if (num <= max * 0.66){
        return 'has-text-warning';
    }
    else if (num < max){
        return invert ? 'has-text-caution' : 'has-text-info';
    }
    else {
        return '';
    }
}

export function gridEnabled(c_action,region,p0,p1){
    let isOk = false;
    switch (region){
        case 'city':
            if (p1 === 'replicator' && global.race['replicator']){
                isOk = true;
            }
            else {
                isOk = global.race['cataclysm'] || global.race['orbit_decayed'] || global.tech['isolation'] ? false : checkCityRequirements(p1);
            }
            break;
        case 'space':
            isOk = global.tech['isolation'] ? false : checkSpaceRequirements(region,p0,p1);
            break;
        case 'portal':
            isOk = checkRequirements(fortressTech(),p0,p1);
            break;
        case 'tauceti':
            isOk = checkPathRequirements(region,p0,p1);
            break;
        default:
            isOk = p0 === 'spc_moon' && global.race['orbit_decayed'] ? false : checkSpaceRequirements(region,p0,p1);
            break;
    }
    return global[region][p1] && isOk && checkPowerRequirements(c_action) ? true : false;
}

export function setPowerGrid(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 2)){
        return;
    }
    let grids = gridDefs();
    clearGrids(grids);

    clearElement($('#powerGrid'));
    $('#powerGrid').append(`<div class="powerGridHead"><div class="powerGridHeader has-text-info">${loc(`power_grid_header`)}</div><div id="powerModeSwitch"><b-switch class="setting" v-model="lowPowerBalance">Distribute Low Power</b-switch></div></div>`);
    vBind({
        el: `#powerModeSwitch`,
        data: global.settings
    });

    Object.keys(grids).forEach(function(grid_type){
        if (!grids[grid_type].s){
            return;
        }

        let candy = '';
        if (grid_type === 'power'){
            candy = trickOrTreat(7,12,false);
        }

        if (grids[grid_type].r && grids[grid_type].rs && global[grids[grid_type].r][grids[grid_type].rs]){
            $('#powerGrid').append(`<div id="pg${grid_type}sup" class="gridHeader"><span class="has-text-caution">${grids[grid_type].n}</span> {{ support }}/{{ s_max }}</div>`);
            vBind({
                el: `#pg${grid_type}sup`,
                data: global[grids[grid_type].r][grids[grid_type].rs]
            });
        }
        else {
            $('#powerGrid').append(`<div class="gridHeader has-text-caution">${grids[grid_type].n}${candy}</div>`);
        }

        let grid = $(`<div id="grid${grid_type}" class="powerGrid"></div>`);
        $('#powerGrid').append(grid);

        let idx = 0;
        for (let i=0; i< grids[grid_type].l.length; i++){
            let struct = grids[grid_type].l[i];

            let parts = struct.split(":");
            let space = convertSpaceSector(parts[0]);
            let region = parts[0] === 'city' ? parts[0] : space;
            let c_action = parts[0] === 'city' ? actions.city[parts[1]] : actions[space][parts[0]][parts[1]];

            let title = typeof c_action.title === 'function' ? c_action.title() : c_action.title;
            let extra = ``;
            switch (parts[1]){
                case 'factory':
                    extra = ` (${loc(`tab_city5`)})`;
                    break;
                case 'red_factory':
                    extra = ` (${loc(`tab_space`)})`;
                    break;
                case 'casino':
                    extra = ` (${loc(`tab_city5`)})`;
                    break;
                case 'spc_casino':
                    extra = ` (${loc(`tab_space`)})`;
                    break;
            }

            if (gridEnabled(c_action,region,parts[0],parts[1])){
                idx++;
                let circuit = $(`<div id="pg${c_action.id}${grid_type}" class="circuit" data-idx="${i}"></div>`);
                circuit.append(`<span>${idx}</span> <span class="struct has-text-warning">${title}${extra}</span>`);
                circuit.append(`<span role="button" class="sub off" @click="power_off" aria-label="Powered Off"><span>{{ on | off }}</span></span> <span role="button" class="add on" @click="power_on" aria-label="Powered On"><span>{{ on }}</span></span>`);
                circuit.append(`<span role="button" class="sub is-sr-only" @click="higher" aria-label="Raise Power Priority"><span>&laquo;</span></span> <span role="button" class="add is-sr-only" @click="lower" aria-label="Lower Power Priority"><span>&raquo;</span></span>`);
                grid.append(circuit);

                vBind({
                    el: `#pg${c_action.id}${grid_type}`,
                    data: global[region][parts[1]],
                    methods: {
                        power_on(){
                            let keyMult = keyMultiplier();
                            for (let i=0; i<keyMult; i++){
                                if (global[region][parts[1]].on < global[region][parts[1]].count){
                                    global[region][parts[1]].on++;
                                }
                                else {
                                    break;
                                }
                            }
                            if (c_action['postPower']){
                                setTimeout(function(){
                                    c_action.postPower(true);
                                }, 250);
                            }
                        },
                        power_off(){
                            let keyMult = keyMultiplier();
                            for (let i=0; i<keyMult; i++){
                                if (global[region][parts[1]].on > 0){
                                    global[region][parts[1]].on--;
                                }
                                else {
                                    break;
                                }
                            }
                            if (c_action['postPower']){
                                setTimeout(function(){
                                    c_action.postPower(false);
                                }, 250);
                            }
                        },
                        higher(){
                            let oIdx = $(`#pg${c_action.id}${grid_type}`).attr(`data-idx`);
                            let nIdx = $(`#pg${c_action.id}${grid_type}`).prevAll(`.circuit:not(".inactive")`).attr(`data-idx`);
                            if (nIdx >= 0){
                                let order = grids[grid_type].l;
                                order.splice(nIdx, 0, order.splice(oIdx, 1)[0]);
                                grids[grid_type].l = order;
                                setPowerGrid();
                            }
                        },
                        lower(){
                            let oIdx = $(`#pg${c_action.id}${grid_type}`).attr(`data-idx`);
                            let nIdx = $(`#pg${c_action.id}${grid_type}`).nextAll(`.circuit:not(".inactive")`).attr(`data-idx`);
                            if (nIdx < grids[grid_type].l.length){
                                let order = grids[grid_type].l;
                                order.splice(nIdx, 0, order.splice(oIdx, 1)[0]);
                                grids[grid_type].l = order;
                                setPowerGrid(grid_type);
                            }
                        }
                    },
                    filters: {
                        off(c){
                            return global[region][parts[1]].count - c;
                        }
                    }
                });
            }
            else {
                let circuit = $(`<div id="pg${c_action.id}${grid_type}" class="circuit inactive" data-idx="${i}"></div>`);
                circuit.append(`<span class="has-text-warning">${title}${extra}</span>`);
                grid.append(circuit);
            }
        };

        dragPowerGrid(grid_type);

        let reset = $(`<div id="${grid_type}GridReset" class="resetPowerGrid"><button class="button" @click="resetGrid('${grid_type}')">${loc('power_grid_reset',[grids[grid_type].n])}</button></div>`);
        $('#powerGrid').append(reset);

        vBind({
            el: `#${grid_type}GridReset`,
            data: {},
            methods: {
                resetGrid(type){
                    powerGrid(type,true);
                    setPowerGrid();
                }
            }
        });
    });
}

export function gridDefs(){
    let type = races[global.race.species].type === 'organism' ? 'humanoid' : races[global.race.species].type;
    return {
        power: { l: global.power, n: loc(`power`), s: true, r: false, rs: false },
        moon: { l: global.support.moon, n: loc(`space_moon_info_name`), s: global.settings.space.moon, r: 'space', rs: 'moon_base' },
        red: { l: global.support.red, n: races[global.race.species].solar.red, s: global.settings.space.red, r: 'space', rs: 'spaceport'  },
        belt: { l: global.support.belt, n: loc(`space_belt_info_name`), s: global.settings.space.belt, r: 'space', rs: 'space_station'  },
        alpha: { l: global.support.alpha, n: loc(`interstellar_alpha_name`), s: global.settings.space.alpha, r: 'interstellar', rs: 'starport'  },
        nebula: { l: global.support.nebula, n: loc(`interstellar_nebula_name`), s: global.settings.space.nebula, r: 'interstellar', rs: 'nexus'  },
        gateway: { l: global.support.gateway, n: loc(`galaxy_gateway`), s: global.settings.space.gateway, r: 'galaxy', rs: 'starbase'  },
        alien2: { l: global.support.alien2, n: loc('galaxy_alien',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]), s: global.settings.space.alien2, r: 'galaxy', rs: 'foothold'  },
        lake: { l: global.support.lake, n: loc(`portal_lake_name`), s: global.settings.portal.lake, r: 'portal', rs: 'harbour'  },
        spire: { l: global.support.spire, n: loc(`portal_spire_name`), s: global.settings.portal.spire, r: 'portal', rs: 'purifier'  },
        titan: { l: global.support.titan, n: genusVars[type].solar.titan, s: global.settings.space.titan, r: 'space', rs: 'electrolysis'  },
        enceladus: { l: global.support.enceladus, n: genusVars[type].solar.enceladus, s: global.settings.space.enceladus, r: 'space', rs: 'titan_spaceport'  },
        eris: { l: global.support.eris, n: genusVars[type].solar.eris, s: global.settings.space.eris, r: 'space', rs: 'drone_control'  },
        tau_home: { l: global.support.tau_home, n: loc(`tau_planet`,[races[global.race.species].home]), s: global.settings.tau.home, r: 'tauceti', rs: 'orbital_station'  },
        tau_red: { l: global.support.tau_red, n: loc(`tau_planet`,[races[global.race.species].solar.red]), s: global.settings.tau.red, r: 'tauceti', rs: 'orbital_platform'  },
        tau_roid: { l: global.support.tau_roid, n: loc(`tau_roid_title`), s: global.settings.tau.roid, r: 'tauceti', rs: 'patrol_ship'  },
    };
}

export function clearGrids(grids){
    grids = grids || gridDefs();
    Object.keys(grids).forEach(function(grid_type){
        let el = $(`#grid${grid_type}`)[0];
        if (el){
            let sort = Sortable.get(el);
            if (sort){
                sort.destroy();
            }
        }
    });
}

function dragPowerGrid(grid_type){
    let el = $(`#grid${grid_type}`)[0];
    let grids = gridDefs();
    Sortable.create(el,{
        onEnd(e){
            let order = grids[grid_type].l;
            order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
            grids[grid_type].l = order;
            setPowerGrid();
        }
    });
}
