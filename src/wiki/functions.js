import { global, poppers, sizeApproximation } from './../vars.js';
import { loc } from './../locale.js';
import { clearElement, adjustCosts } from './../functions.js';
import { actions } from './../actions.js';

export function infoBoxBuilder(parent,name,template,paragraphs,h_level){
    if (!h_level){
        h_level = 3;
    }
    let info = $(`<div class="infoBox"></div>`);
    info.append(`<h${h_level} id="${name}" class="header has-text-warning">${loc(`wiki_${template}_${name}`)}</h${h_level}>`);
    let para = $(`<div class="para"></div>`);
    for (let i=1; i<=paragraphs; i++){
        para.append(`<span>${loc(`wiki_${template}_${name}_para${i}`)}</span>`);
    }
    parent.append(info);
    info.append(para);
    return info;
}

export function popover(id,content,is_wide){
    $('#'+id).on('mouseover',function(){
        let wide = is_wide ? ' wide' : '';
        var popper = $(`<div id="pop${id}" class="popper${wide} has-background-light has-text-dark pop-desc"></div>`);
        $(`#main`).append(popper);
        popper.append(content);
        popper.show();
        poppers[id] = new Popper($('#'+id),popper);
    });
    $('#'+id).on('mouseout',function(){
        $(`#pop${id}`).hide();
        if (poppers[id]){
            poppers[id].destroy();
        }
        clearElement($(`#pop${id}`),true);
    });
}

export function actionDesc(info, c_action, extended){
    let title = typeof c_action.title === 'string' ? c_action.title : c_action.title();
    if (extended){
        info.append(`<div class="type"><h2 class="has-text-warning">${title}</h2><span class="has-text-caution">${extended}</span></div>`);
    }
    else {
        info.append(`<div class="type"><h2 class="has-text-warning">${title}</h2></div>`);
    }

    let desc = typeof c_action.desc === 'string' ? c_action.desc : c_action.desc();
    if (desc !== title){
        info.append(`<div class="desc">${desc}</div>`);
    }

    let stats = $(`<div class="stats"></div>`);
    
    let hasEffect = false;
    if (c_action.hasOwnProperty('effect')){
        let effect = typeof c_action.effect === 'string' ? c_action.effect : c_action.effect();
        stats.append(`<div class="effect">${effect}</div>`);
        hasEffect = true;
        info.append(stats);
    }

    if (c_action.hasOwnProperty('cost')){
        let costs = adjustCosts(c_action.cost);
        let cost = hasEffect ? $(`<div class="cost right"></div>`) : $(`<div class="cost"></div>`);
        let render = false;

        let color = 'has-text-success';
        Object.keys(costs).forEach(function (res){
            if (res === 'Structs'){
                let structs = costs[res]();
                Object.keys(structs).forEach(function (region){
                    Object.keys(structs[region]).forEach(function (struct){
                        let res_cost = structs[region][struct].hasOwnProperty('on') ? structs[region][struct].on : structs[region][struct].count;

                        let label = '';
                        if (structs[region][struct].hasOwnProperty('s')){
                            let sector = structs[region][struct].s;
                            label = typeof actions[region][sector][struct].title === 'string' ? actions[region][sector][struct].title : actions[region][sector][struct].title();
                        }
                        else {
                            label = typeof actions[region][struct].title === 'string' ? actions[region][struct].title : actions[region][struct].title();
                        }
                        cost.append($(`<div class="${color}">${label}: ${res_cost}</div>`));
                        render = true;
                    });
                });
            }
            else if (res === 'Plasmid' || res === 'Phage'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    let label = loc(`resource_${res}_name`);
                    cost.append($(`<div data-${res}="${res_cost}">${label}: ${res_cost}</div>`));
                    render = true;
                }
            }
            else if (res !== 'Morale' && res !== 'Army' && res !== 'Bool'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    if (res === 'HellArmy'){
                        cost.append($(`<div class="${color}" data-${res}="${res_cost}">Fortress Troops: ${res_cost}</div>`));
                    }
                    else {
                        let label = res === 'Money' ? '$' : global.resource[res].name+': ';
                        label = label.replace("_", " ");
                        let display_cost = sizeApproximation(res_cost,1);
                        cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}${display_cost}</div>`));
                    }
                    render = true;
                }
            }

        });

        if (render){
            stats.append(cost);
        }
    }
}
