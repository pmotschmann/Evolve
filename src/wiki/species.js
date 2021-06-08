import { global } from './../vars.js';
import { loc } from './../locale.js';
import { popover, getEaster } from './../functions.js';
import { races, traits, genus_traits } from './../races.js';
import { sideMenu } from './functions.js';

export function racesPage(){
    let content = sideMenu('create');

    let list = [];
    Object.keys(races).forEach(function (race){
        if ((race === 'custom' && !global.hasOwnProperty('custom')) || race === 'protoplasm'){
            return;
        }

        let info = $(`<div id="${race}" class="infoBox"></div>`);
        content.append(info);

        info.append(`<div class="type"><h2 class="has-text-warning">${races[race].name}</h2><span class="has-text-caution">${loc(`genelab_genus_${races[race].type}`)}</span></div>`);
        info.append(`<div class="desc">${typeof races[race].desc === 'string' ? races[race].desc : races[race].desc()}</div>`);

        let traitList = [];
        let extraTraits = extraTraitList(race);

        let genes = $(`<div class="itemlist"></div>`);
        Object.keys(genus_traits[races[race].type]).sort().forEach(function (trait){
            let id = `raceTrait${race}${trait}`;
            let color = races[race].fanaticism === trait ? 'danger' : 'caution';
            genes.append(`<span class="has-text-${color}" id="${id}">${traits[trait].name}<span>`);
            traitList.push(trait);
        });
        Object.keys(races[race].traits).sort().forEach(function (trait){
            let id = `raceTrait${race}${trait}`;
            let color = races[race].fanaticism === trait ? 'danger' : 'info';
            genes.append(`<span class="has-text-${color}" id="${id}">${traits[trait].name}<span>`);
            traitList.push(trait);
        });
        for (let i=0; i<extraTraits.length; i++){
            let id = `raceTrait${race}${extraTraits[i]}`;
            let color = races[race].fanaticism === extraTraits[i] ? 'danger' : 'info';
            genes.append(`<span class="has-text-${color}" id="${id}">${traits[extraTraits[i]].name}<span>`);
            traitList.push(extraTraits[i]);
        }
        info.append(genes);
        list.push(race);
        
        for (let i=0; i<traitList.length; i++){
            let id = `raceTrait${race}${traitList[i]}`;
            let desc = $(`<div></div>`);
            traitDesc(desc,traitList[i],traitList[i] === races[race].fanaticism ? races[race].name : false);
            popover(id,desc,{ wide: true, classes: 'w25' });
        }
    });

    list.sort((a,b) => races[a].name < races[b].name ? -1 : 1).forEach(function(race){
        sideMenu('add',`races-species`,race,races[race].name);
    });
}

function extraTraitList(race){
    const date = new Date();
    switch (race){
        case 'wolven':
            let easter = getEaster();
            return easter.active ? ['hyper','fast_growth','rainbow','optimistic'] : [];
        case 'elven':
            return date.getMonth() === 11 && date.getDate() >= 17 ? ['slaver'] : [];
        default:
            return [];
    }
}

export function traitsPage(){
    let content = sideMenu('create');

    let types = ['genus','major','minor','special'];
    for (let i=0; i<types.length; i++){
        Object.keys(traits).sort().forEach(function (trait){
            if (traits[trait].type === types[i]){
                let info = $(`<div id="${trait}" class="infoBox"></div>`);
                content.append(info);
                traitDesc(info,trait,false,true);
                sideMenu('add',`traits-species`,trait,traits[trait].name);
            }
        });
    }
}

function rName(r){
    let res = global.hasOwnProperty('resource') && global.resource.hasOwnProperty(r) ? global.resource[r].name : loc(`resource_${r}_name`);
    return `<span class="has-text-warning">${res}</span>`;
}

const traitExtra = {
    infiltrator: [
        loc(`wiki_trait_effect_infiltrator_ex1`),
        loc(`wiki_trait_effect_infiltrator_ex2`,[
            [
                `<span class="has-text-warning">${loc('tech_steel')}</span>`, `<span class="has-text-warning">${loc('tech_electricity')}</span>`, `<span class="has-text-warning">${loc('tech_electronics')}</span>`, `<span class="has-text-warning">${loc('tech_fission')}</span>`, 
                `<span class="has-text-warning">${loc('tech_rocketry')}</span>`, `<span class="has-text-warning">${loc('tech_artificial_intelligence')}</span>`, `<span class="has-text-warning">${loc('tech_quantum_computing')}</span>`,
                `<span class="has-text-warning">${loc('tech_virtual_reality')}</span>`, `<span class="has-text-warning">${loc('tech_shields')}</span>`, `<span class="has-text-warning">${loc('tech_ai_core')}</span>`, `<span class="has-text-warning">${loc('tech_graphene_processing')}</span>`,
                `<span class="has-text-warning">${loc('tech_nanoweave')}</span>`, `<span class="has-text-warning">${loc('tech_orichalcum_analysis')}</span>`, `<span class="has-text-warning">${loc('tech_infernium_fuel')}</span>`
            ].join(', ')
        ])
    ],
    heavy: [
        loc(`wiki_trait_effect_heavy_ex1`,[rName('Stone'),rName('Cement'),rName('Wrought_Iron')])
    ],
    sniper: [
        loc(`wiki_trait_effect_sniper_ex1`),
    ],
    hooved: [
        loc(`wiki_trait_effect_hooved_ex1`),
        loc(`wiki_trait_effect_hooved_ex2`,[
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Lumber') ? global.resource.Lumber.name : loc('resource_Lumber_name')}</span>`,
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Copper') ? global.resource.Copper.name : loc('resource_Copper_name')}</span>`,
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Iron') ? global.resource.Iron.name : loc('resource_Iron_name')}</span>`,
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Steel') ? global.resource.Steel.name : loc('resource_Steel_name')}</span>`,
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Adamantite') ? global.resource.Adamantite.name : loc('resource_Adamantite_name')}</span>`,
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Orichalcum') ? global.resource.Orichalcum.name : loc('resource_Orichalcum_name')}</span>`,
            12,75,150,500,5000
        ]),
        loc(`wiki_trait_effect_hooved_ex3`),
        loc(`wiki_trait_effect_hooved_ex4`,[`<span class="has-text-warning">${5}</span>`]),
        loc(`wiki_trait_effect_hooved_ex5`,[
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Lumber') ? global.resource.Lumber.name : loc('resource_Lumber_name')}</span>`,
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Copper') ? global.resource.Copper.name : loc('resource_Copper_name')}</span>`
        ]),
    ]
};

export function traitDesc(info,trait,fanatic,tpage){
    info.append(`<h2 class="has-text-warning">${traits[trait].name}</h2>`);
    if (tpage && traits[trait].hasOwnProperty('val')){
        info.append(`<div class="type has-text-caution">${loc(`wiki_trait_${traits[trait].type}`)}<span>${loc(`wiki_trait_value`,[traits[trait].val])}</span></div>`);
    }
    else {
        info.append(`<div class="type has-text-caution">${loc(`wiki_trait_${traits[trait].type}`)}</div>`);
    }
    
    if (fanatic){
        info.append(`<div class="has-text-danger">${loc(`wiki_trait_fanaticism`,[fanatic])}</div>`);
    }
    info.append(`<div class="desc">${traits[trait].desc}</div>`);

    let vals = traits[trait].hasOwnProperty('vars') ? traits[trait].vars : [];
    let color = 'warning';
    if (traits[trait].hasOwnProperty('val')){
        color = traits[trait].val >= 0 ? 'success' : 'danger';
    }
    info.append(`<div class="has-text-${color} effect">${loc(`wiki_trait_effect_${trait}`,vals)}</div>`);
    if (traitExtra[trait]){
        traitExtra[trait].forEach(function(te){
            info.append(`<div class="effect">${te}</div>`);
        });
    }
}