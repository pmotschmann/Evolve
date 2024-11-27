import { global, sizeApproximation } from './../vars.js';
import { loc } from './../locale.js';
import { clearElement, vBind, adjustCosts } from './../functions.js';
import { actions } from './../actions.js';
import { planetName } from './../space.js';

export function headerBoxBuilder(parent,args,box){
    if (!args.hasOwnProperty('h_level')){
        args['h_level'] = 2;
    }
    args['header'] = true;
    return infoBoxBuilder(parent,args,box);
}

export function infoBoxBuilder(parent,args,box){
    if (!args.hasOwnProperty('name')){ return; }
    if (!args.hasOwnProperty('template')){ return; }
    if (!args.hasOwnProperty('paragraphs')){ args['paragraphs'] = 0; }
    if (!args.hasOwnProperty('text')){ args['text'] = {}; }
    if (!args.hasOwnProperty('rawtext')){ args['rawtext'] = {}; }
    if (!args.hasOwnProperty('para_data')){ args['para_data'] = {}; }
    if (!args.hasOwnProperty('data_color')){ args['data_color'] = {}; }
    if (!args.hasOwnProperty('data_link')){ args['data_link'] = {}; }
    if (!args.hasOwnProperty('h_level')){ args['h_level'] = 3; }
    if (!args.hasOwnProperty('h_extra')){ args['h_extra'] = false; }
    if (!args.hasOwnProperty('header')){ args['header'] = false; }
    if (!args.hasOwnProperty('full')){ args['full'] = false; }
    if (!args.hasOwnProperty('break')){ args['break'] = false; }
    if (!args.hasOwnProperty('default_color')){ args['default_color'] = 'warning'; }
    if (!args.hasOwnProperty('examples')){ args['examples'] = false; }
    if (!args.hasOwnProperty('vue')){ args['vue'] = false; }

    let info = false;
    if (box){
        info = box;
    }
    else {
        info = $(`<div${args['vue'] ? ` id="${args.name}InfoBox"` : ``} class="infoBox${args.full ? ` wide` : ``}${args['pclass'] ? ` ${args['pclass']}`: ''}"></div>`);
        if (args['h_level'] && args.h_extra){
            info.append(`<div class="flexInfo"><h${args.h_level} id="${args.name}" class="header has-text-${args.header ? 'caution' : 'warning'}">${args['label'] ? args['label'] : loc(`wiki_${args.template}_${args.name}`)}</h${args.h_level}>${args.h_extra}</div>`);
        }
        else if (args['h_level']){
            info.append(`<h${args.h_level} id="${args.name}" class="header has-text-${args.header ? 'caution' : 'warning'}">${args['label'] ? args['label'] : loc(`wiki_${args.template}_${args.name}`)}</h${args.h_level}>`);
        }
    }

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
            if ((args.text[i] || args.rawtext[i] || args.para_data[i]) && Array.isArray(args.para_data[i])){
                let inputs = args.para_data[i];
                if (args.data_link[i] && Array.isArray(args.data_link[i])){
                    for (let j=0; j<args.data_link[i].length; j++){
                        if (args.data_link[i][j] && args.data_link[i][j] !== 'plain'){
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
                let string = args.rawtext[i] ? args.rawtext[i] : (loc(args.text[i] ? args.text[i] : `wiki_${args.template}_${args.name}_para${i}`,inputs));
                para.append(`<span>${string}</span>`);
            }
            else {
                let string = args.rawtext[i] ? args.rawtext[i] : (loc(args.text[i] ? args.text[i] : `wiki_${args.template}_${args.name}_para${i}`));
                para.append(`<span>${string}</span>`);
            }        
        }
        info.append(para);
    });
    
    if (args.examples){
        info.append($(`<div class="para"><span>${loc(`wiki_examples`)}</span></div>`));
        
        args.examples.forEach(function(example){
            info.append($(`<div class="para"><span> - ${example}</span></div>`));
        });
    }
    
    if (!box){
        parent.append(info);
    }   

    if (args['vue']){
        args.vue['el'] = `#${args.name}InfoBox`;
        vBind(args.vue);
    }

    return info;
}

export function actionDesc(info, c_action, extended, isStruct){
    let title = typeof c_action.title === 'string' ? c_action.title : c_action.title();
    if (extended){
        info.append(`<div class="type"><h2 class="has-text-warning">${title}</h2><span class="has-text-caution">${extended}</span></div>`);
    }
    else if (!isStruct){
        let owned = global.tech[c_action.grant[0]] && global.tech[c_action.grant[0]] >= c_action.grant[1];
        info.append(`<div class="type"><h2 class="has-text-warning">${title}</h2>${owned ? `<span class="is-sr-only">${loc('wiki_arpa_purchased')}</span>` : ``}<span class="has-text-${owned ? `success` : `caution`}">${loc(`wiki_tech_tree_${c_action.grant[0]}`)}: ${c_action.grant[1]}</span></div>`);
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
        if (isStruct){
            let effect = typeof c_action.effect === 'string' ? c_action.effect : false;
            if (effect !== false){
                stats.append(`<div class="effect">${effect}</div>`);
            }
            else {
                stats.append(`<div class="effect"></div>`);
            }
            hasEffect = true;
        }
        else {
            let effect = typeof c_action.effect === 'string' ? c_action.effect : c_action.effect(true);
            if (effect !== false){
                stats.append(`<div class="effect">${effect}</div>`);
                hasEffect = true;
            }
        }
        info.append(stats);
    }

    if (c_action.hasOwnProperty('cost')){
        let costs = adjustCosts(c_action, true);
        let cost = hasEffect ? $(`<div class="cost right"${isStruct ? ' v-show="i.costVis"' : ''}></div>`) : $(`<div class="cost"${isStruct ? ' v-show="i.costVis"' : ''}></div>`);
        let costCreep = ``;
        if (isStruct){
            cost.append($(`<h2 class="has-text-warning">${loc('wiki_calc_cost')}</h2>`));
            costCreep = $(`<div class="cost right" v-show="i.creepVis"><h2 class="has-text-warning">${loc('wiki_calc_cost_creep')}</h2></div>`);
        }
        let render = false;

        let addCost = function(res,res_cost,label,color,structBypass){
            if (isStruct){
                cost.append($(`<div class="${color}" v-show="r.${res}.vis">${label}{{ r.${res}.cost }}</div>`));
                costCreep.append($(`<div class="${color}" v-show="r.${res}.vis">{{ r.${res}.creep }}</div>`));
                render = true;
            }
            else if (res_cost > 0){
                cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}${sizeApproximation(res_cost,1)}</div>`));
                render = true;
            }
        };
        
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
                        if (isStruct){
                            costCreep.append($(`<div class="${color}">${loc('wiki_calc_none')}</div>`));
                        }
                        render = true;
                    });
                });
            }
            else if (['Plasmid','Phage','Dark','Harmony','AICore','Artifact','Blood_Stone','AntiPlasmid'].includes(res)){
                let resName = res;
                if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                    resName = 'AntiPlasmid';
                }
                addCost(res,costs[res](),loc(`resource_${resName}_name`) + ': ',color);
            }
            else if (res === 'Supply'){
                addCost(res,costs[res](),loc(`resource_${res}_name`) + ': ',color);
            }
            else if (res === 'Custom'){
                cost.append($(`<div class="${color}">${costs[res]().label}</div>`));
                render = true;
            }
            else if (res !== 'Morale' && res !== 'Army' && res !== 'Bool' && res !== 'Troops'){
                let f_res = res === 'Species' ? global.race.species : res;
                let label = f_res === 'Money' ? '$' : (res === 'HellArmy' ? loc('fortress_troops') : global.resource[f_res].name) + ': ';
                label = label.replace("_", " ");
                addCost(res,costs[res](),label,color);
            }
        });

        if (render){
            if (!c_action.hasOwnProperty('effect')){
                info.append(stats);
            }
            stats.append(cost);
            if (isStruct){
                stats.append(costCreep);
            }
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
    else if (action === 'gap'){
        let li = $(`<li class="gap"></li>`);
        $(`#sideContent ul`).append(li);
    }
    else {
        let anchor = $(`<a href="#${arg1}-${arg2}">${arg3}</a>`);
        let li = $(`<li></li>`);
        li.append(anchor);
        $(`#sideContent ul`).append(li);
        bindScroll(anchor, arg2);
    }
    
}

export function subSideMenu(action,arg1,arg2,arg3){
    sideMenu(action,arg1,arg2,`ᄂ` + arg3);
}

export function getSolarName(planet) {
    if (['moon','belt'].includes(planet)){
        return loc('space_'+planet+'_info_name');
    }
    else if (['kuiper'].includes(planet)){
        return loc('space_'+planet+'_title');
    }
    
    return planetName()[planet];
}

export function createRevealSection(info,id,type,insert){
    let reveal = $(`<div></div>`);
    info.append(reveal);
    reveal.append(`<span role="button" id="${id}${type}Button" class="has-text-info reveal" @click="show()">{{ vis | label }}</span>`);
    let section = $(`<div id="${id}${type}Section" style="display: none;"></div>`);
    reveal.append(section);
    
    let modSection = document.getElementById(id + type + 'Section');
    let modDisplay = { vis: false };
    
    vBind({
        el: `#${id}${type}Button`,
        data: modDisplay,
        methods: {
            show(){
                if (modSection.style.display === 'block'){
                    modSection.style.display = 'none';
                    modDisplay.vis = false;
                }
                else {
                    modSection.style.display = 'block';
                    modDisplay.vis = true;
                }
            }
        },
        filters: {
            label(vis){
                return vis ? loc(`wiki_reveal_hide`,[insert]) : loc(`wiki_reveal_show`,[insert]);
            }
        }
    });
    
    return section;
}

export function createCalcSection(info,id,type,insert){
    insert = insert || loc(`wiki_calc_insert_` + type);
    let calc = $(`<div></div>`);
    info.append(calc);
    calc.append(`<span role="button" id="${id}${type}Button" class="has-text-info reveal" @click="show()">{{ vis | label }}</span>`);
    let section = $(`<div id="${id}${type}Section" style="display: none;"></div>`);
    calc.append(section);
    
    let modSection = document.getElementById(id + type + 'Section');
    let modDisplay = { vis: false };
    
    vBind({
        el: `#${id}${type}Button`,
        data: modDisplay,
        methods: {
            show(){
                if (modSection.style.display === 'block'){
                    modSection.style.display = 'none';
                    modDisplay.vis = false;
                }
                else {
                    modSection.style.display = 'block';
                    modDisplay.vis = true;
                }
            }
        },
        filters: {
            label(vis){
                return vis ? loc(`wiki_calc_hide`,[insert]) : loc(`wiki_calc_show`,[insert]);
            }
        }
    });
    
    return section;
}

export function resourceName(res){
    return global?.resource?.[res]?.name || loc(`resource_${res}_name`);
}