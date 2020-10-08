import { global, sizeApproximation } from './../vars.js';
import { loc } from './../locale.js';
import { clearElement, adjustCosts } from './../functions.js';
import { actions } from './../actions.js';

export function headerBoxBuilder(parent,args){
    if (!args.hasOwnProperty('h_level')){
        args['h_level'] = 2;
    }
    args['header'] = true;
    return infoBoxBuilder(parent,args);
}

export function infoBoxBuilder(parent,args){
    if (!args.hasOwnProperty('name')){ return; }
    if (!args.hasOwnProperty('template')){ return; }
    if (!args.hasOwnProperty('paragraphs')){ args['paragraphs'] = 0; }
    if (!args.hasOwnProperty('text')){ args['text'] = {}; }
    if (!args.hasOwnProperty('para_data')){ args['para_data'] = {}; }
    if (!args.hasOwnProperty('data_color')){ args['data_color'] = {}; }
    if (!args.hasOwnProperty('data_link')){ args['data_link'] = {}; }
    if (!args.hasOwnProperty('h_level')){ args['h_level'] = 3; }
    if (!args.hasOwnProperty('header')){ args['header'] = false; }
    if (!args.hasOwnProperty('full')){ args['full'] = false; }
    if (!args.hasOwnProperty('break')){ args['break'] = false; }
    if (!args.hasOwnProperty('default_color')){ args['default_color'] = 'warning'; }

    let info = $(`<div class="infoBox${args.full ? ` wide` : ``}"></div>`);
    info.append(`<h${args.h_level} id="${args.name}" class="header has-text-${args.header ? 'caution' : 'warning'}">${args['label'] ? args['label'] : loc(`wiki_${args.template}_${args.name}`)}</h${args.h_level}>`);
    let ranges = [{s: 1, e: args.break ? args.break[0] - 1 : args.paragraphs}];
    
    if (args.break){
        for (let i=0; i<args.break.length; i++){
            let end = i+1 === args.break.length ? args.paragraphs : (args.break[i+1] - 1);
            ranges.push({ s: args.break[i], e: end });
        }
    }
    
    ranges.forEach(function(range){
        let para = $(`<div class="para"></div>`);
        for (let i=range.s; i<=range.e; i++){
            if ((args.text[i] || args.para_data[i]) && Array.isArray(args.para_data[i])){
                let inputs = args.para_data[i];
                if (args.data_link[i] && Array.isArray(args.data_link[i])){
                    for (let j=0; j<args.data_link[i].length; j++){
                        if (args.data_link[i][j] !== 'plain'){
                            inputs[j] = `<a href="${args.data_link[i][j]}" target="_blank">${inputs[j]}</a>`;
                        }
                    }
                }
                let color_list = args.data_color[i] && Array.isArray(args.data_color[i]) ? args.data_color[i] : args.para_data[i].map(x => args.default_color);
                for (let j=0; j<color_list.length; j++){
                    if (color_list[j] !== 'plain'){
                        inputs[j] = `<span class="has-text-${color_list[j]}">${inputs[j]}</span>`;
                    }
                }
                para.append(`<span>${loc(args.text[i] ? args.text[i] : `wiki_${args.template}_${args.name}_para${i}`,inputs)}</span>`);
            }
            else {
                para.append(`<span>${loc(args.text[i] ? args.text[i] : `wiki_${args.template}_${args.name}_para${i}`)}</span>`);
            }        
        }
        info.append(para);
    });
    
    parent.append(info);    
    return info;
}

export function actionDesc(info, c_action, extended){
    let title = typeof c_action.title === 'string' ? c_action.title : c_action.title();
    if (extended){
        info.append(`<div class="type"><h2 class="has-text-warning">${title}</h2><span class="has-text-caution">${extended}</span></div>`);
    }
    else {
        info.append(`<div class="type"><h2 class="has-text-warning">${title}</h2></div>`);
    }

    let desc = typeof c_action.desc === 'string' ? c_action.desc : c_action.desc(true);
    if (desc !== title){
        info.append(`<div class="desc">${desc}</div>`);
    }

    let stats = $(`<div class="stats"></div>`);
    
    let hasEffect = false;
    if (c_action.hasOwnProperty('effect')){
        let effect = typeof c_action.effect === 'string' ? c_action.effect : c_action.effect(true);
        if (effect !== false){
            stats.append(`<div class="effect">${effect}</div>`);
            hasEffect = true;
        }
        info.append(stats);
    }

    if (c_action.hasOwnProperty('cost')){
        let costs = adjustCosts(c_action.cost, true);
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
            else if (res === 'Plasmid' || res === 'Phage' || res === 'Dark' || res === 'Harmony'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                        res = 'AntiPlasmid';
                    }
                    let label = loc(`resource_${res}_name`);
                    cost.append($(`<div data-${res}="${res_cost}">${label}: ${res_cost}</div>`));
                    render = true;
                }
            }
            else if (res === 'Supply'){
                let res_cost = costs[res](true);
                if (res_cost > 0){
                    let label = loc(`resource_${res}_name`);
                    cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}: ${res_cost}</div>`));
                    render = true;
                }
            }
            else if (res !== 'Morale' && res !== 'Army' && res !== 'Bool'){
                let res_cost = costs[res](true);
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

export function bindScroll(elm, target){
    elm.click(function(){
        window.location.hash = `#${target}`;
        document.getElementById(target).scrollIntoView({
            block: 'start',
            behavior: 'smooth'
        });
    });
}

export function sideMenu(action,arg1,arg2,arg3){
    if (action === 'create'){
        let content = arg1 ? (typeof arg1 === 'string' ? $(`#${arg1}`) : arg1) : $(`#content`);
        clearElement(content);
        content.addClass('flex');
        let mainContent = $(`<div id="mainContent"></div>`);
        let sideContent = $(`<div id="sideContent" class="sticky"></div>`);
        let sideMenu = $(`<ul></ul>`);
        content.append(mainContent);
        content.append(sideContent);
        sideContent.append(sideMenu);
        return mainContent;
    }
    else {
        let anchor = $(`<a href="#${arg1}-${arg2}">${arg3}</a>`);
        let li = $(`<li></li>`);
        li.append(anchor);
        $(`#sideContent ul`).append(li);
        bindScroll(anchor, arg2);
    }
    
}