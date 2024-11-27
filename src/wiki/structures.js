import { global, sizeApproximation } from './../vars.js';
import { loc } from './../locale.js';
import { clearElement, popover, vBind, adjustCosts } from './../functions.js';
import { actions } from './../actions.js';
import { towerSize } from './../portal.js';
import { races } from './../races.js';
import { actionDesc, sideMenu } from './functions.js';

export function renderStructurePage(zone,path){
    let content = sideMenu('create');

    switch (zone){
        case 'prehistoric':
            prehistoricPage(content,path);
            break;
        case 'planetary':
            planetaryPage(content,path);
            break;
        case 'space':
            spacePage(content,path);
            break;
        case 'interstellar':
            interstellarPage(content);
            break;
        case 'intergalactic':
            intergalacticPage(content);
            break;
        case 'hell':
            hellPage(content);
            break;
        case 'edenic':
            edenPage(content);
            break;
        case 'tauceti':
            taucetiPage(content);
            break;
    }
}

const extraInformation = {
    prehistoric: {},
    planetary: {
        slaughter: [loc(`wiki_structure_planetary_slaughter`)],
    },
    space: {
        terraformer: [loc(`wiki_structure_space_terraformer`)],
        terraform: [loc(`wiki_structure_space_terraformer`)],
    },
    starDock: {
        geck: [
            loc(`wiki_structure_stardock_geck`),
        ]
    },
    interstellar: {},
    intergalactic: {},
    hell: {},
    eden: {},
    tauceti: {},
};

function addInfomration(parent,section,key){
    if (extraInformation[section].hasOwnProperty(key)){
        let extra = $(`<div class="extra"></div>`);
        parent.append(extra);
        for (let i=0; i<extraInformation[section][key].length; i++){
            extra.append(`<div>${extraInformation[section][key][i]}</div>`);
        }
    }
}

const calcInfo = {
    include: { // Things that are not one-offs (only used for prehistoric since most are one-offs).
        prehistoric: ['membrane','organelles','nucleus','eukaryotic_cell','mitochondria']
    },
    exclude: { // Things that are one-offs, disappearing after they're clicked. Automatically excludes creep. Does not add a calculator.
        planetary: ['food','lumber','stone','chrysotile','slaughter','slave_market',''],
        space: ['test_launch','moon_mission','terraform','red_mission','hell_mission','sun_mission','gas_mission','gas_moon_mission','belt_mission','dwarf_mission','titan_mission','enceladus_mission','triton_mission','kuiper_mission','eris_mission','crashed_ship','digsite'],
        starDock: ['prep_ship','launch_ship'],
        interstellar: ['alpha_mission','proxima_mission','nebula_mission','neutron_mission','blackhole_mission','jump_ship','wormhole_mission','sirius_mission','sirius_b','ascend'],
        intergalactic: ['gateway_mission','gorddon_mission','alien2_mission','chthonian_mission'],
        hell: ['pit_mission','assault_forge','ruins_mission','gate_mission','lake_mission','spire_mission','bribe_sphinx','spire_survey','spire','devilish_dish','oven_done'],
        tauceti: [
            'home_mission','dismantle','excavate','alien_outpost','red_mission','matrix','roid_mission','alien_station_survey',
            'contact','introduce','subjugate','gas_contest','gas_contest2','ignite_gas_giant','jeff','goe_facility'
        ],
    },
    excludeCreep: { // Things that aren't one-offs, but also don't have conventional cost creep.
        planetary: ['horseshoe'],
        space: ['horseshoe'],
        hell: ['ancient_pillars','sphinx','waygate'],
        tauceti: ['horseshoe']
    },
    max: { // Structures that can have a max to the number of them that you can get. Things with a max of 1 that are included here as opposed to in the exclude section are things that linger around after being purchased, usually having a changing text after being bought.
        prehistoric: {},
        planetary: {
            s_alter: 1,
            banquet: 5,
            wonder_lighthouse: 1,
            wonder_pyramid: 1
        },
        space: {
            star_dock: 1,
            terraformer: 100,
            world_collider: 1859,
            shipyard: 1,
            mass_relay: 100,
            fob: 1,
            ai_core: 100,
            jump_gate: 100
        },
        starDock: {
            seeder: 100
        },
        interstellar: {
            dyson: 100,
            dyson_sphere: 100,
            orichalcum_sphere: 100,
            stellar_engine: 100,
            stargate: 200,
            space_elevator: 100,
            gravity_dome: 100,
            ascension_machine: 100
        },
        intergalactic: {
            embassy: 1,
            consulate: 1
        },
        hell: {
            soul_forge: 1,
            vault: 2,
            ancient_pillars: Object.keys(races).length - 1,
            west_tower: towerSize(),
            east_tower: towerSize(),
            bridge: 10,
            sphinx: 2,
            waygate: 10,
            oven:100
        },
        tauceti: {
            alien_outpost: 1,
            jump_gate: 100,
            ringworld: 1000,
            alien_station: 100,
            matrioshka_brain: 1000,
            ignition_device: 10
        },
        eden: {
            throne: 1
        }
    },
    count: { // Structures that have "count" values that aren't tracked in the building itself. Here you calculate the count that building would have from the save provided.
        planetary: {
            horseshoe: global.race['shoecnt'] ? global.race['shoecnt'] : 0,
            assembly: global.resource[global.race.species] ? global.resource[global.race.species].amount : 0
        },
        space: {
            horseshoe: global.race['shoecnt'] ? global.race['shoecnt'] : 0,
            assembly: global.resource[global.race.species] ? global.resource[global.race.species].amount : 0
        },
        interstellar: {},
        intergalactic: {},
        hell: {
            ancient_pillars: Object.keys(global.pillars).length,
            sphinx: !global.tech['hell_spire'] || global.tech.hell_spire < 7 ? 0 : global.tech.hell_spire === 7 ? 1 : 2,
            waygate: global.tech['waygate'] && global.tech.waygate >= 2 ? 10 : global.portal['waygate'] ? global.portal.waygate.count : 0
        },
        tauceti: {}
    },
    creepCalc: { // Because the cost creep is reverse engineered, buildings with very low cost creep can calculation discrepencies by using the base offset of 100. Here you set higher amounts for those specific buildings to use with the calculation to get a more accurate result.
        planetary: {
            assembly: 1000
        },
        space: {
            assembly: 1000,
            swarm_satellite: 200
        }
    }
};

//Additional information to pass to an action's effect() function;
const effectInputs ={
    terraformer: ['truepath']
}

function addCalcInputs(parent,key,section,region,path){
    let hasMax = calcInfo.max[section] && calcInfo.max[section][key] ? calcInfo.max[section][key] : false;
    let inputs = {
        owned: 0,
        costVis: false,
        creepVis: false,
        extra: {
            isWiki: true,
            truepath: path === 'truepath'
        }
    };
    let resources = {};
    
    let action = false;
    switch (section){
        case "prehistoric":
            action = actions.evolution[key];
            inputs.real_owned = global.evolution[key] ? global.evolution[key].count : 0;
            break;
        case 'planetary':
            action = actions.city[key];
            inputs.real_owned = global.city[key] ? global.city[key].count : 0;
            break;
        case 'space':
            action = actions.space[region][key];
            inputs.real_owned = global.space[key] ? global.space[key].count : 0;
            break;
        case 'starDock':
            action = actions.starDock[key];
            inputs.real_owned = global.starDock[key] ? global.starDock[key].count : 0;
            break;
        case 'interstellar':
            action = actions.interstellar[region][key];
            inputs.real_owned = global.interstellar[key] ? global.interstellar[key].count : 0;
            break;
        case 'intergalactic':
            action = actions.galaxy[region][key];
            inputs.real_owned = global.galaxy[key] ? global.galaxy[key].count : 0;
            break;
        case 'hell':
            action = actions.portal[region][key];
            inputs.real_owned = global.portal[key] ? global.portal[key].count : 0;
            break;
        case 'eden':
            action = actions.eden[region][key];
            inputs.real_owned = global.eden[key] ? global.eden[key].count : 0;
            break;
        case 'tauceti':
            action = actions.tauceti[region][key];
            inputs.real_owned = global.tauceti[key] ? global.tauceti[key].count : 0;
            break;
    }
    if (calcInfo.count[section] && calcInfo.count[section][key]){
        inputs.real_owned = calcInfo.count[section][key];
    }
    
    //Function to update function-based effects with # of building owned.
    let updateEffect = function(){
        if (action.hasOwnProperty('effect') && typeof action.effect !== 'string'){
            let effect = $(`.effect`, `#${key}`);
            clearElement(effect);
            let insert = { isWiki: true, count: inputs.owned - inputs.real_owned };
            if (effectInputs[key]){
                effectInputs[key].forEach(function(inp){
                    switch (inp){
                        case 'truepath':
                            insert[inp] = path === 'truepath';
                            break;
                    }
                });
            }
            effect.append(action.effect(insert));
        }
    };
    updateEffect();

    let cost = action.cost;

    if (cost){
        Object.keys(adjustCosts(action)).forEach(function (res){
            resources[res] = {};
        });
    }

    //Functions to update costs and cost creeps
    let updateCosts = function(){
        let vis = false;
        if (cost){
            let new_costs = adjustCosts(action,inputs.owned - inputs.real_owned,inputs.extra);
            Object.keys(resources).forEach(function (res){
                if (res === 'Custom'){
                    resources[res].vis = true;
                }
                else {
                    let new_cost = new_costs[res] ? new_costs[res](inputs.owned - inputs.real_owned,inputs.extra) : 0;
                    resources[res].vis = new_cost > 0 ? true : false;
                    resources[res].cost = sizeApproximation(new_cost,1);
                }
                vis = vis || resources[res].vis;
            });
        }
        inputs.costVis = vis;
    };
    updateCosts();
    
    let updateCostCreep = function(){
        let creep = false;
        if (cost && !hasMax && 
            !(calcInfo.excludeCreep[section] && calcInfo.excludeCreep[section].includes(key)) &&
            section !== 'prehistoric'){
            let high = calcInfo.creepCalc[section] && calcInfo.creepCalc[section][key] ? calcInfo.creepCalc[section][key] : 100;
            let low = high - 1;
            let upper = adjustCosts(action,high,inputs.extra);
            let lower = adjustCosts(action,low,inputs.extra);
            Object.keys(resources).forEach(function (res){
                if (upper[res]){
                    resources[res].creep = +(upper[res](high,inputs.extra) / lower[res](low,inputs.extra)).toFixed(5);
                    if (resources[res].creep === 1){
                        resources[res].creep = loc('wiki_calc_none');
                    }
                    else if (resources[res].creep < 1.005){
                        resources[res].creep = 1.005;
                    }
                    creep = creep || resources[res].vis;
                }
            });
        }
        inputs.creepVis = creep;
    };
    
    //Add calculator inputs
    if ((calcInfo.include[section] && calcInfo.include[section].includes(key)) || (calcInfo.exclude[section] && !calcInfo.exclude[section].includes(key))){
        updateCostCreep();
        
        parent.append($(`
            <div class="extra">
                <div>
                    <div class="calcInput"><span>{{ | ownedLabel }}</span> <b-field><span class="button has-text-danger calcInputButton" role="button" @click="less('owned')">-</span><b-numberinput :input="val('owned')" min="0" v-model="i.owned" :controls="false"></b-numberinput><span class="button has-text-success calcInputButton" role="button" @click="more('owned')">+</span></b-field></div>
                </div>
                <div class="calcButton">
                    <button class="button" @click="importInputs()">${loc('wiki_calc_import')}</button>
                </div>
            </div>
        `));
    }
    
    vBind({
        el: `#${key}`,
        data: {
            i: inputs,
            r: resources
        },
        methods: {
            val(type){
                inputs[type] = Math.round(inputs[type]);
                if (inputs[type] && inputs[type] < 0){
                    inputs[type] = 0;
                }
                else if (hasMax && inputs[type] > hasMax){
                    inputs[type] = hasMax;
                }
                updateEffect();
                updateCosts();
            },
            less(type){
                if (inputs[type] > 0){
                    inputs[type]--;
                }
            },
            more(type){
                if (!hasMax || (hasMax && inputs[type] < hasMax)){
                    inputs[type]++;
                }
            },
            importInputs(){
                inputs.owned = inputs.real_owned;
            }
        },
        filters: {
            ownedLabel(){
                switch (key){
                    case "horseshoe":
                        return loc('wiki_calc_horseshoes');
                    case "ancient_pillars":
                        return loc('wiki_calc_pillars');
                    case "sphinx":
                        return loc('wiki_calc_stage');
                    default:
                        return loc('wiki_calc_built');
                }
            }
        }
    });
}

function prehistoricPage(content,path){
    let affix = path === 'truepath' ? 'tp_structures' : 'structures';
    Object.keys(actions.evolution).forEach(function (action){
        if (actions.evolution[action].hasOwnProperty('title') && (action !== 'custom' || global.hasOwnProperty('custom')) && (!actions.evolution[action].hasOwnProperty('wiki') || actions.evolution[action].wiki)){
            let id = actions.evolution[action].id.split('-');
            let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
            content.append(info);
            actionDesc(info, actions.evolution[action], false, true);
            addInfomration(info,'prehistoric',action);
            addCalcInputs(info,action,'prehistoric',false,path);
            sideMenu('add',`prehistoric-${affix}`,id[1],typeof actions.evolution[action].title === 'function' ? actions.evolution[action].title() : actions.evolution[action].title);
        }
    });
}

function planetaryPage(content,path){
    let affix = path === 'truepath' ? 'tp_structures' : 'structures';
    Object.keys(actions.city).forEach(function (action){
        if ((!actions.city[action].hasOwnProperty('wiki') || actions.city[action].wiki) &&
            (!actions.city[action].hasOwnProperty('path') || actions.city[action].path.includes(path)) ){
            let id = actions.city[action].id.split('-');
            let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
            content.append(info);
            actionDesc(info, actions.city[action], false, true);
            addInfomration(info,'planetary',action);
            addCalcInputs(info,action,'planetary',false,path);
            sideMenu('add',`planetary-${affix}`,id[1],typeof actions.city[action].title === 'function' ? actions.city[action].title() : actions.city[action].title);
        }
    });
}

function spacePage(content,path){
    let affix = path === 'truepath' ? 'tp_structures' : 'structures';

    Object.keys(actions.space).forEach(function (region){        
        let name = typeof actions.space[region].info.name === 'string' ? actions.space[region].info.name : actions.space[region].info.name();
        let desc = typeof actions.space[region].info.desc === 'string' ? actions.space[region].info.desc : actions.space[region].info.desc();

        Object.keys(actions.space[region]).forEach(function (struct){
            if (struct !== 'info' && 
                (!actions.space[region][struct].hasOwnProperty('wiki') || actions.space[region][struct].wiki) && 
                (!actions.space[region][struct].hasOwnProperty('path') || actions.space[region][struct].path.includes(path)) ){
                let id = actions.space[region][struct].id.split('-');
                let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
                content.append(info);
                actionDesc(info, actions.space[region][struct],`<span id="pop${actions.space[region][struct].id}">${name}</span>`, true);
                addInfomration(info,'space',struct);
                addCalcInputs(info,struct,'space',region,path);
                sideMenu('add',`space-${affix}`,id[1],typeof actions.space[region][struct].title === 'function' ? actions.space[region][struct].title() : actions.space[region][struct].title);
                popover(`pop${actions.space[region][struct].id}`,$(`<div>${desc}</div>`));
            }
        });
    });

    Object.keys(actions.starDock).forEach(function (struct){
        if (struct !== 'info' && 
            (!actions.starDock[struct].hasOwnProperty('wiki') || actions.starDock[struct].wiki) && 
            (!actions.starDock[struct].hasOwnProperty('path') || actions.starDock[struct].path.includes(path)) ){
            let id = actions.starDock[struct].id.split('-');
            let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
            content.append(info);
            actionDesc(info, actions.starDock[struct],`<span id="pop${actions.starDock[struct].id}">${loc('space_gas_star_dock_title')}</span>`, true);
            addInfomration(info,'starDock',struct);
            addCalcInputs(info,struct,'starDock',false,path);
            sideMenu('add',`space-${affix}`,id[1],typeof actions.starDock[struct].title === 'function' ? actions.starDock[struct].title() : actions.starDock[struct].title);
            popover(`pop${actions.starDock[struct].id}`,$(`<div>${loc(`space_gas_star_dock_wiki`)}</div>`));
        }
    });
}

function interstellarPage(content){
    Object.keys(actions.interstellar).forEach(function (region){        
        let name = typeof actions.interstellar[region].info.name === 'string' ? actions.interstellar[region].info.name : actions.interstellar[region].info.name();
        let desc = typeof actions.interstellar[region].info.desc === 'string' ? actions.interstellar[region].info.desc : actions.interstellar[region].info.desc();

        Object.keys(actions.interstellar[region]).forEach(function (struct){
            if (struct !== 'info' && (!actions.interstellar[region][struct].hasOwnProperty('wiki') || actions.interstellar[region][struct].wiki)){
                let id = actions.interstellar[region][struct].id.split('-');
                let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
                content.append(info);
                actionDesc(info, actions.interstellar[region][struct],`<span id="pop${actions.interstellar[region][struct].id}">${name}</span>`, true);
                addInfomration(info,'interstellar',struct);
                addCalcInputs(info,struct,'interstellar',region);
                sideMenu('add',`interstellar-structures`,id[1],typeof actions.interstellar[region][struct].title === 'function' ? actions.interstellar[region][struct].title() : actions.interstellar[region][struct].title);
                popover(`pop${actions.interstellar[region][struct].id}`,$(`<div>${desc}</div>`));
            }
        });
    });
}

function intergalacticPage(content){
    Object.keys(actions.galaxy).forEach(function (region){        
        let name = typeof actions.galaxy[region].info.name === 'string' ? actions.galaxy[region].info.name : actions.galaxy[region].info.name();
        let desc = typeof actions.galaxy[region].info.desc === 'string' ? actions.galaxy[region].info.desc : actions.galaxy[region].info.desc();

        Object.keys(actions.galaxy[region]).forEach(function (struct){
            if (struct !== 'info' && (!actions.galaxy[region][struct].hasOwnProperty('wiki') || actions.galaxy[region][struct].wiki)){
                let id = actions.galaxy[region][struct].id.split('-');
                let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
                content.append(info);
                actionDesc(info, actions.galaxy[region][struct],`<span id="pop${actions.galaxy[region][struct].id}">${name}</span>`, true);
                addInfomration(info,'intergalactic',struct);
                addCalcInputs(info,struct,'intergalactic',region);
                sideMenu('add',`intergalactic-structures`,id[1],typeof actions.galaxy[region][struct].title === 'function' ? actions.galaxy[region][struct].title() : actions.galaxy[region][struct].title);
                popover(`pop${actions.galaxy[region][struct].id}`,$(`<div>${desc}</div>`));
            }
        });
    });
}

function hellPage(content){
    Object.keys(actions.portal).forEach(function (region){        
        let name = typeof actions.portal[region].info.name === 'string' ? actions.portal[region].info.name : actions.portal[region].info.name();
        let desc = typeof actions.portal[region].info.desc === 'string' ? actions.portal[region].info.desc : actions.portal[region].info.desc();

        Object.keys(actions.portal[region]).forEach(function (struct){
            if (struct !== 'info' && (!actions.portal[region][struct].hasOwnProperty('wiki') || actions.portal[region][struct].wiki)){
                let id = actions.portal[region][struct].id.split('-');
                let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
                content.append(info);
                actionDesc(info, actions.portal[region][struct],`<span id="pop${actions.portal[region][struct].id}">${name}</span>`, true);
                addInfomration(info,'hell',struct);
                addCalcInputs(info,struct,'hell',region);
                sideMenu('add',`hell-structures`,id[1],typeof actions.portal[region][struct].title === 'function' ? actions.portal[region][struct].title() : actions.portal[region][struct].title);
                popover(`pop${actions.portal[region][struct].id}`,$(`<div>${desc}</div>`));
            }
        });
    });
}

function edenPage(content){
    Object.keys(actions.eden).forEach(function (region){        
        let name = typeof actions.eden[region].info.name === 'string' ? actions.eden[region].info.name : actions.eden[region].info.name();
        let desc = typeof actions.eden[region].info.desc === 'string' ? actions.eden[region].info.desc : actions.eden[region].info.desc();

        Object.keys(actions.eden[region]).forEach(function (struct){
            if (struct !== 'info' && (!actions.eden[region][struct].hasOwnProperty('wiki') || actions.eden[region][struct].wiki)){
                let id = actions.eden[region][struct].id.split('-');
                let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
                content.append(info);
                actionDesc(info, actions.eden[region][struct],`<span id="pop${actions.eden[region][struct].id}">${name}</span>`, true);
                addInfomration(info,'eden',struct);
                addCalcInputs(info,struct,'eden',region);
                sideMenu('add',`eden-structures`,id[1],typeof actions.eden[region][struct].title === 'function' ? actions.eden[region][struct].title() : actions.eden[region][struct].title);
                popover(`pop${actions.eden[region][struct].id}`,$(`<div>${desc}</div>`));
            }
        });
    });
}

function taucetiPage(content){
    Object.keys(actions.tauceti).forEach(function (region){        
        let name = typeof actions.tauceti[region].info.name === 'string' ? actions.tauceti[region].info.name : actions.tauceti[region].info.name();
        let desc = typeof actions.tauceti[region].info.desc === 'string' ? actions.tauceti[region].info.desc : actions.tauceti[region].info.desc();

        Object.keys(actions.tauceti[region]).forEach(function (struct){
            if (struct !== 'info' && (!actions.tauceti[region][struct].hasOwnProperty('wiki') || actions.tauceti[region][struct].wiki)){
                let id = actions.tauceti[region][struct].id.split('-');
                let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
                content.append(info);
                actionDesc(info, actions.tauceti[region][struct],`<span id="pop${actions.tauceti[region][struct].id}">${name}</span>`, true);
                addInfomration(info,'tauceti',struct);
                addCalcInputs(info,struct,'tauceti',region);
                sideMenu('add',`tauceti-structures`,id[1],typeof actions.tauceti[region][struct].title === 'function' ? actions.tauceti[region][struct].title() : actions.tauceti[region][struct].title);
                popover(`pop${actions.tauceti[region][struct].id}`,$(`<div>${desc}</div>`));
            }
        });
    });
}
