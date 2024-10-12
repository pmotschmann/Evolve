import { global } from './../vars.js';
import { loc } from './../locale.js';
import { vBind } from './../functions.js';
import { bloodPool } from './../arpa.js';
import { sideMenu } from './functions.js';

export function bloodPage(content){
    content.append(`<div class="header has-text-warning">${loc('wiki_arpa_blood')}</div>`);

    let mainContent = $(`<div></div>`);
    let crisprContent = sideMenu('create',mainContent);
    content.append(mainContent);

    Object.keys(bloodPool).forEach(function (trait){
        let id = bloodPool[trait].id.split('-');
        let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
        crisprContent.append(info);
        bloodDesc(info,trait);
        sideMenu('add',`blood-prestige`,id[1],bloodPool[trait].title);
    });
}

var bloodTrees = {};
Object.keys(bloodPool).forEach(function (blood){
    let infusion = bloodPool[blood];
    if (!bloodTrees[infusion.grant[0]]){
        bloodTrees[infusion.grant[0]] = {};
    }
    let text = typeof bloodPool[blood].title === 'string' ? bloodPool[blood].title : bloodPool[blood].title();
    bloodTrees[infusion.grant[0]][infusion.grant[1]] = {
        name: blood
    };
});

function bloodDesc(info,trait){
    let owned = global.blood[bloodPool[trait].grant[0]] && global.blood[bloodPool[trait].grant[0]] >= bloodPool[trait].grant[1] ? true : false;

    info.append(`<div class="type"><h2 class="has-text-warning">${bloodPool[trait].title}</h2>${owned ? `<span class="is-sr-only">${loc('wiki_arpa_purchased')}</span>` : ``}<span class="has-text-${owned ? `success` : `caution`}">${loc(`wiki_arpa_blood_${bloodPool[trait].grant[0]}`)}: ${bloodPool[trait].grant[1]}</span></div>`);

    let stats = $(`<div class="stats"></div>`);
    info.append(stats);

    stats.append(`<div class="effect">${bloodPool[trait].desc}</div>`);

    let costs = $(`<div class="cost right"></div>`);
    stats.append(costs);
    Object.keys(bloodPool[trait].cost).forEach(function(res){
        let label = loc(`resource_${res}_name`);
        if (bloodPool[trait].grant[1] === '*'){
            costs.append(`<div v-show="r.${res}.vis"><span class="has-text-warning">${label}</span>: <span>{{ r.${res}.cost }}</span></div>`);
        }
        else {
            let res_cost = bloodPool[trait].cost[res]();
            if (res_cost > 0){
                costs.append(`<div><span class="has-text-warning">${label}</span>: <span data-${res}="${res_cost}">${res_cost}</span></div>`);
            }
        }
    });

    if (Object.keys(bloodPool[trait].reqs).length > 0 || bloodPool[trait].hasOwnProperty('condition')){        
        let reqs = $(`<div class="reqs"><span class="has-text-caution">${loc('wiki_arpa_crispr_req')}</span></div>`);
        info.append(reqs);

        let comma = false;
        if (Object.keys(bloodPool[trait].reqs).length > 0){
            Object.keys(bloodPool[trait].reqs).forEach(function (req){
                let color = global.blood[req] && global.blood[req] >= bloodPool[trait].reqs[req] ? 'success' : 'danger';
                reqs.append(`${comma ? `, ` : ``}<span><a href="wiki.html#blood-prestige-${bloodTrees[req][bloodPool[trait].reqs[req]].name}" class="has-text-${color}" target="_blank">${loc(`wiki_arpa_blood_${req}`)} ${bloodPool[trait].reqs[req]}</a></span>`);
                comma = true;
            });
        }
        if (bloodPool[trait].hasOwnProperty('condition')){
            let color = global.genes['blood'] && global.genes.blood >= 3 ? 'success' : 'danger';
            reqs.append(`${comma ? `, ` : ``}<span><a href="wiki.html#crispr-prestige-essence_absorber"  class="has-text-${color}" target="_blank">${loc(`wiki_arpa_crispr_blood`)} 3</a></span>`);
        }
    }
    
    if (bloodPool[trait].grant[1] === '*'){
        addCalcInputs(info,trait);
    }
}

function addCalcInputs(parent,key){
    let inputs = {
        owned: 0,
    };
    let resources = {};
    
    let action = bloodPool[key];
    inputs.real_owned = global.blood[key] ? global.blood[key] : 0;
    
    let cost = action.cost;
    Object.keys(cost).forEach(function (res){
        resources[res] = {};
    });
    
    //Functions to update costs and cost creeps
    let updateCosts = function(){
        Object.keys(resources).forEach(function (res){
            let new_cost = cost[res] ? cost[res](inputs.owned - inputs.real_owned) : 0;
            resources[res].vis = new_cost > 0 ? true : false;
            resources[res].cost = new_cost;
        });
    };
    updateCosts();
    
    //Add calculator inputs
    parent.append($(`
        <div class="extra">
            <div>
                <div class="calcInput"><span>${loc('wiki_calc_level')}</span> <b-field><span class="button has-text-danger calcInputButton" role="button" @click="less('owned')">-</span><b-numberinput :input="val('owned')" min="0" v-model="i.owned" :controls="false"></b-numberinput><span class="button has-text-success calcInputButton" role="button" @click="more('owned')">+</span></b-field></div>
            </div>
            <div class="calcButton">
                <button class="button" @click="importInputs()">${loc('wiki_calc_import')}</button>
            </div>
        </div>
    `));
    
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
                updateCosts();
            },
            less(type){
                if (inputs[type] > 0){
                    inputs[type]--;
                }
            },
            more(type){
                inputs[type]++;
            },
            importInputs(){
                inputs.owned = inputs.real_owned;
            }
        }
    });
}