import { global } from './../vars.js';
import { loc } from './../locale.js';
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

function bloodDesc(info,trait){
    let owned = global.genes[bloodPool[trait].grant[0]] && global.genes[bloodPool[trait].grant[0]] >= bloodPool[trait].grant[1] ? true : false;

    info.append(`<div class="type"><h2 class="has-text-warning">${bloodPool[trait].title}</h2>${owned ? `<span class="is-sr-only">${loc('wiki_arpa_purchased')}</span>` : ``}<span class="has-text-${owned ? `success` : `caution`}">${loc(`wiki_arpa_blood_${bloodPool[trait].grant[0]}`)}: ${bloodPool[trait].grant[1]}</span></div>`);

    let stats = $(`<div class="stats"></div>`);
    info.append(stats);

    stats.append(`<div class="effect">${bloodPool[trait].desc}</div>`);

    let costs = $(`<div class="cost right"></div>`);
    stats.append(costs);
    Object.keys(bloodPool[trait].cost).forEach(function(res){
        let res_cost = bloodPool[trait].cost[res]();
        if (res_cost > 0){
            let label = loc(`resource_${res}_name`);
            costs.append(`<div><span class="has-text-warning">${label}</span>: <span data-${res}="${res_cost}">${res_cost}</span></div>`);
        }
    });

    if (Object.keys(bloodPool[trait].reqs).length > 0 || bloodPool[trait].hasOwnProperty('condition')){        
        let reqs = $(`<div class="reqs"><span class="has-text-caution">${loc('wiki_arpa_crispr_req')}</span></div>`);
        info.append(reqs);

        let comma = false;
        if (Object.keys(bloodPool[trait].reqs).length > 0){
            Object.keys(bloodPool[trait].reqs).forEach(function (req){
                let color = global.blood[req] && global.blood[req] >= bloodPool[trait].reqs[req] ? 'success' : 'danger';
                reqs.append(`${comma ? `, ` : ``}<span class="has-text-${color}">${loc(`wiki_arpa_blood_${req}`)} ${bloodPool[trait].reqs[req]}</span>`);
                comma = true;
            });
        }
        if (bloodPool[trait].hasOwnProperty('condition')){
            let color = global.genes['blood'] && global.genes.blood >= 3 ? 'success' : 'danger';
            reqs.append(`${comma ? `, ` : ``}<span class="has-text-${color}">${loc(`wiki_arpa_crispr_blood`)} 3</span>`);
        }
    }
}