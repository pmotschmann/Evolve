import { global, sizeApproximation } from './../vars.js';
import { loc } from './../locale.js';
import { vBind } from './../functions.js';
import { arpaProjects, arpaAdjustCosts } from './../arpa.js';
import { sideMenu } from './functions.js';

const extraInformation = {
    launch_facility: [loc('wiki_arpa_project_launch_facility')],
    monument: [monumentExtra(),loc('wiki_arpa_project_monument_random'),loc('wiki_arpa_project_monument_exceptions')],
    railway: [loc('wiki_arpa_project_railway_homeless',[3,7,11,17,25,38,59,100,225])],
    roid_eject: [loc('wiki_arpa_project_roid_eject')],
    tp_depot: [loc('wiki_arpa_project_depot')],
    nexus: [loc('wiki_arpa_project_magic')],
    syphon: [loc('wiki_arpa_project_magic')]
};

export function projectsPage(content){
    content.append(`<div class="header has-text-warning">${loc('wiki_arpa_projects')}</div>`);

    let mainContent = $(`<div></div>`);
    let projectContent = sideMenu('create',mainContent);
    content.append(mainContent);

    Object.keys(arpaProjects).forEach(function (project){
        let info = $(`<div id="${project}" class="infoBox"></div>`);
        projectContent.append(info);
        projectDesc(info,project);
        sideMenu('add',`projects-arpa`,project,typeof arpaProjects[project].title === 'string' ? arpaProjects[project].title : arpaProjects[project].title(true));
    });
}

function projectDesc(info,project){
    let title = typeof arpaProjects[project].title === 'string' ? arpaProjects[project].title : arpaProjects[project].title(true);
    info.append(`<div class="type"><h2 class="has-text-warning">${title}</h2></div>`);

    let stats = $(`<div class="stats"></div>`);
    info.append(stats);

    stats.append(`<div class="effect">${typeof arpaProjects[project].desc === 'string' ? arpaProjects[project].desc : arpaProjects[project].desc()}</div>`);
    stats.append(`<div class="effect">${typeof arpaProjects[project].effect === 'string' ? arpaProjects[project].effect : arpaProjects[project].effect()}</div>`);

    if (extraInformation[project]){
        let extra = $(`<div></div>`);
        info.append(extra);
        addInformation(extra,project);
    }
    addCosts(info,project);
}

function addInformation(parent,key){
    let extra = $(`<div class="extra"></div>`);
    parent.append(extra);
    if (extraInformation.hasOwnProperty(key)){
        for (let i=0; i<extraInformation[key].length; i++){
            extra.append(`<div>${extraInformation[key][i]}</div>`);
        }
    }
}

function addCosts(parent,key){
    let inputs = {
        owned: 0,
        creepVis: true,
        extra: {
            creative: false
        }
    };
    let resources = {};
    
    switch (key){
        case 'monument':
            inputs.extra.m_type = 'Obelisk';
            break;
        case 'launch_facility':
            inputs.creepVis = false;
            break;
    }
    
    let action = arpaProjects[key];
    inputs.real_owned = global.arpa[key] ? global.arpa[key].rank : 0;
    
    let costContain = $(`<div class="stats"></div>`);
    parent.append(costContain);
    let costs = $(`<div class="cost"><h2 class="has-text-warning" aria-level="3">${loc('wiki_calc_cost')}</h2></div>`);
    let costCreep = $(`<div class="cost right" v-show="i.creepVis"><h2 class="has-text-warning" aria-level="3">${loc('wiki_calc_cost_creep')}</h2></div>`);
    costContain.append(costs);
    costContain.append(costCreep);
    
    let cost = action.cost;
    Object.keys(arpaAdjustCosts(cost)).forEach(function (res){
        resources[res] = {};
        let label = res === 'Money' ? '$' : global.resource[res].name + ': ';
        costs.append($(`<div class="has-text-success" v-show="r.${res}.vis">${label}{{ r.${res}.cost }}</div>`));
        costCreep.append($(`<div class="has-text-success" v-show="r.${res}.vis">{{ r.${res}.creep }}</div>`));
    });
    
    //Functions to update costs and cost creeps
    let updateCosts = function(){
        let new_costs = arpaAdjustCosts(cost,inputs.owned - inputs.real_owned,inputs.extra);
        Object.keys(resources).forEach(function (res){
            let new_cost = new_costs[res] ? new_costs[res](inputs.owned - inputs.real_owned,inputs.extra) : 0;
            resources[res].vis = new_cost > 0 ? true : false;
            resources[res].cost = sizeApproximation(new_cost,1);
        });
    };
    updateCosts();
    
    let updateCostCreep = function(){
        if (key !== 'launch_facility'){
            let upper = arpaAdjustCosts(cost,100,inputs.extra);
            let lower = arpaAdjustCosts(cost,99,inputs.extra);
            Object.keys(resources).forEach(function (res){
                if (upper[res]){
                    resources[res].creep = +(upper[res](100,inputs.extra) / lower[res](99,inputs.extra)).toFixed(4);
                }
            });
        }
    };
    updateCostCreep();
    
    //Add calculator inputs
    let calcInputs = `
        <div class="extra">
            <div>`;
    if (key !== 'launch_facility'){
        calcInputs += `
                <div class="calcInput"><span>${loc('wiki_calc_level')}</span> <b-field><span class="button has-text-danger calcInputButton" role="button" @click="less('owned')">-</span><b-numberinput :input="val('owned')" min="0" v-model="i.owned" :controls="false"></b-numberinput><span class="button has-text-success calcInputButton" role="button" @click="more('owned')">+</span></b-field></div>`;
    }
    if (key === 'monument'){
        calcInputs += `
                <div class="calcInput"><span>${loc('wiki_calc_m_type')}</span> <b-dropdown hoverable>
                    <button class="button is-primary" slot="trigger">
                        <span>{{ i.extra.m_type | monumentLabel }}</span>
                        <i class="fas fa-sort-down"></i>
                    </button>
                    <b-dropdown-item v-on:click="pickMonument('Obelisk')">{{ 'Obelisk' | monumentLabel }}</b-dropdown-item>
                    <b-dropdown-item v-on:click="pickMonument('Statue')">{{ 'Statue' | monumentLabel }}</b-dropdown-item>
                    <b-dropdown-item v-on:click="pickMonument('Sculpture')">{{ 'Sculpture' | monumentLabel }}</b-dropdown-item>
                    <b-dropdown-item v-on:click="pickMonument('Monolith')">{{ 'Monolith' | monumentLabel }}</b-dropdown-item>
                    <b-dropdown-item v-on:click="pickMonument('Pillar')">{{ 'Pillar' | monumentLabel }}</b-dropdown-item>
                    <b-dropdown-item v-on:click="pickMonument('Megalith')">{{ 'Megalith' | monumentLabel }}</b-dropdown-item>
                </b-dropdown></div>
        `;
    }
    calcInputs += `
                <div class="calcInput"><b-checkbox class="patrol" :input="update()" v-model="i.extra.creative">${loc('trait_creative_name')}</b-checkbox></div>
            </div>
            <div class="calcButton">
                <button class="button" @click="importInputs()">${loc('wiki_calc_import')}</button>
            </div>
        </div>
    `;
    parent.append($(calcInputs));
    
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
            pickMonument(type){
                inputs.extra.m_type = type;
                updateCosts();
                updateCostCreep();
            },
            update(){
                updateCosts();
                updateCostCreep();
            },
            importInputs(){
                if (key !== 'launch_facility'){
                    inputs.owned = inputs.real_owned;
                }
                inputs.extra.creative = global.race['creative'] ? true : false;
                if (key === 'monument' && global.arpa['m_type']){
                    inputs.extra.m_type = global.arpa.m_type;
                }
            }
        },
        filters: {
            monumentLabel(type){
                switch(type){
                    case 'Obelisk':
                        return loc('arpa_project_monument_obelisk');
                    case 'Statue':
                        return loc('arpa_project_monument_statue');
                    case 'Sculpture':
                        return loc('arpa_project_monument_sculpture');
                    case 'Monolith':
                        return loc('arpa_project_monument_monolith');
                    case 'Pillar':
                        return loc('arpa_project_monument_pillar');
                    case 'Megalith':
                        return loc('arpa_project_monument_megalith');
                }
            }
        }
    });
}

function monumentExtra(){
    let monuments = [
        loc('arpa_project_monument_obelisk'),
        loc('arpa_project_monument_statue'),
        loc('arpa_project_monument_sculpture'),
        loc('arpa_project_monument_monolith'),
        loc('arpa_project_monument_pillar'),
        loc('arpa_project_monument_megalith')
    ];
    let materials = [
        loc('resource_Stone_name'),
        loc('resource_Aluminium_name'),
        loc('resource_Steel_name'),
        loc('resource_Cement_name'),
        loc('resource_Bones_name'),
        loc('resource_Crystal_name'),
    ];
    let desc = `<div>${loc('wiki_arpa_project_monument',[monuments.length, monuments.join(", ")])}</div>`;
    for (let i=0; i<monuments.length; i++){
        desc = desc + `<div>${loc('wiki_arpa_project_monument_type',[
            `<span class="has-text-warning">${monuments[i]}</span>`,
            `<span class="has-text-warning">${materials[i]}</span>`
        ])}</div>`;
    }
    return desc;
}