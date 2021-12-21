import { global } from './../vars.js';
import { loc } from './../locale.js';
import { clearElement, vBind, popover, getEaster } from './../functions.js';
import { races, traits, genus_traits } from './../races.js';
import { ascendLab } from './../space.js';
import { sideMenu, infoBoxBuilder } from './functions.js';

export function speciesPage(zone){
    let content = $(`#content`);
    clearElement(content);

    switch (zone){
        case 'races':
            racesPage(content);
            break;
        case 'traits':
            traitsPage(content);
            break;
        case 'custom':
            customPage(content);
            break;
    }
}

export function customPage(content) {
    infoBoxBuilder(content,{ name: 'custom', template: 'mechanics', label: loc('wiki_mechanics_custom'), paragraphs: 12, break: [3,5,9,11], full: true, h_level: 2,
        para_data: {
            1: [loc('wiki_resets_ascension')],
            2: [loc('wiki_resets_ascension')],
            5: [loc('resource_Genes_name')],
            6: [loc('resource_Genes_name')],
            7: [2],
            8: [loc('achieve_technophobe_name'),5,7],
            9: [loc('tech_fanaticism'),loc('tech_deify')],
            11: [0,loc('resource_Genes_name')],
            12: [loc('resource_Genes_name'),loc('trait_untapped_name')]
        },
        data_link: {
            1: ['wiki.html#resets-prestige-ascension'],
            2: ['wiki.html#resets-prestige-ascension'],
            8: ['wiki.html#perks-prestige-technophobe'],
            9: [(global.genes['transcendence'] ? 'wiki.html#civilized-tech-alt_fanaticism' : 'wiki.html#civilized-tech-fanaticism'),'wiki.html#early_space-tech-deify']
        }
    });
    let lab = $(`<div class="infoBox wide"></div>`);
    content.append(lab);
    ascendLab(lab);
}

export function racesPage(content){
    content = sideMenu('create',content);

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
            traitList.push({ t: trait, r: 1});
        });
        Object.keys(races[race].traits).sort().forEach(function (trait){
            let id = `raceTrait${race}${trait}`;
            let color = races[race].fanaticism === trait ? 'danger' : 'info';
            genes.append(`<span class="has-text-${color}" id="${id}">${traits[trait].name}<span>`);
            traitList.push({ t: trait, r: 1});
        });
        for (let i=0; i<extraTraits.length; i++){
            let id = `raceTrait${race}${extraTraits[i].t}`;
            let color = races[race].fanaticism === extraTraits[i] ? 'danger' : 'info';
            genes.append(`<span class="has-text-${color}" id="${id}">${traits[extraTraits[i].t].name}<span>`);
            traitList.push(extraTraits[i]);
        }
        info.append(genes);
        list.push(race);
        
        for (let i=0; i<traitList.length; i++){
            let id = `raceTrait${race}${traitList[i].t}`;
            let desc = $(`<div></div>`);
            traitDesc(desc, traitList[i].t, traitList[i].t === races[race].fanaticism ? races[race].name : false, false, traitList[i].r);
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
            return date.getMonth() === 11 && date.getDate() >= 17 ? [{t: 'slaver', r: 2},{t: 'resourceful', r: 0.5},{t: 'small', r: 0.25}] : [];
        case 'capybara':
            return date.getMonth() === 11 && date.getDate() >= 17 ? [{t: 'beast_of_burden', r: 1},{t: 'pack_rat', r: 0.5},{t: 'musical', r: 0.25}] : [];
        case 'centaur':
            return date.getMonth() === 11 && date.getDate() >= 17 ? [{t: 'beast_of_burden', r: 1},{t: 'curious', r: 0.5},{t: 'blissful', r: 0.25}] : [];
        case 'wendigo':
            return date.getMonth() === 11 && date.getDate() >= 17 ? [{t: 'immoral', r: 3},{t: 'cannibalize', r: 0.5},{t: 'claws', r: 0.25}] : [];
        case 'yeti':
            return date.getMonth() === 11 && date.getDate() >= 17 ? [{t: 'scavenger', r: 3},{t: 'regenerative', r: 0.5},{t: 'musical', r: 0.25}] : [];
        case 'entish':
            return date.getMonth() === 11 && date.getDate() >= 17 ? [{t: 'photosynth', r: 3},{t: 'optimistic', r: 0.5},{t: 'armored', r: 0.25}] : [];
        default:
            return [];
    }
}

export function traitsPage(content){
    content = sideMenu('create',content);

    let types = [['genus','major'],['minor'],['special']];
    for (let i=0; i<types.length; i++){
        Object.keys(traits).sort( (a,b) => traits[a].name.localeCompare(traits[b].name) ).forEach(function (trait){
            if (types[i].includes(traits[trait].type)){
                let info = $(`<div id="${traits[trait].type}_${trait}" class="infoBox"></div>`);
                content.append(info);
                traitDesc(info,trait,false,true);
                sideMenu('add',`traits-species`,`${traits[trait].type}_${trait}`,traits[trait].name);
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
    ],
    instinct: [
        loc(`wiki_trait_effect_instinct_ex1`,[6.67,loc('galaxy_chthonian'),10])
    ],
    logical: [
        loc(`wiki_trait_effect_logical_ex1`,[
            global.tech.hasOwnProperty('science') ? global.tech.science : 0,
            global.tech.hasOwnProperty('high_tech') ? global.tech.high_tech : 0
        ]),
    ]
};

const valAdjust = {
    fibroblast: [5],
    imitation: [races[global.race['srace'] || 'protoplasm'].name],
    detritivore: false,
    elusive: false,
    promiscuous: false,
    revive: false,
    fast_growth: false,
    blood_thirst: false,
    frail: false,
    sappy: false,
    spores: false,
    terrifying: false,
    shapeshifter: false,
    freespirit: false,
    selenophobia: false,
    infectious: false,
    infiltrator: false,
};

function getTraitVals(trait,rank){
    let vals = traits[trait].hasOwnProperty('vars') ? traits[trait].vars(rank) : [];
    if (valAdjust.hasOwnProperty(trait)){
        if (trait === 'fibroblast'){
            for (let i=0; i<vals.length; i++){
                vals[i] = vals[i] * valAdjust[trait][i];
            }
        }
        else if (valAdjust[trait]){
            vals = valAdjust[trait];
        }
        else {
            vals = [];
        }
    }
    return vals;
}

export function traitDesc(info,trait,fanatic,tpage,trank){
    let rank = '';
    if (tpage && ['genus','major'].includes(traits[trait].type)){
        rank = `<span><span role="button" @click="down()">&laquo;</span><span class="has-text-warning">${loc(`wiki_trait_rank`)} {{ rank }}</span><span role="button" @click="up()">&raquo;</span></span>`;
    }
    info.append(`<div class="type"><h2 class="has-text-warning">${traits[trait].name}</h2>${rank}</div>`);
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

    let color = 'warning';
    if (traits[trait].hasOwnProperty('val')){
        color = traits[trait].val >= 0 ? 'success' : 'danger';
    }
    if (tpage && ['genus','major'].includes(traits[trait].type)){
        info.append(`<div class="has-text-${color} effect" v-html="traitDesc(rank)"></div>`);
    }
    else {
        info.append(`<div class="has-text-${color} effect">${loc(`wiki_trait_effect_${trait}`,getTraitVals(trait,trank))}</div>`);
    }
    if (traitExtra[trait]){
        traitExtra[trait].forEach(function(te){
            info.append(`<div class="effect">${te}</div>`);
        });
    }

    if (tpage && ['genus','major'].includes(traits[trait].type)){
        let data = { rank: global.race[trait] || 1 };
        vBind({
            el: `#${traits[trait].type}_${trait}`,
            data: data,
            methods: {
                traitDesc(rk){
                    return loc(`wiki_trait_effect_${trait}`,getTraitVals(trait,rk));
                },
                up(){
                    switch (data.rank){
                        case 0.25:
                            data.rank = 0.5;
                            break;
                        case 0.5:
                            data.rank =  1;
                            break;
                        case 1:
                            data.rank =  2;
                            break;
                        case 2:
                            data.rank =  3;
                            break;
                        case 3:
                            data.rank =  3;
                            break;
                    }
                },
                down(){
                    switch (data.rank){
                        case 0.25:
                            data.rank = 0.25;
                            break;
                        case 0.5:
                            data.rank =  0.25;
                            break;
                        case 1:
                            data.rank =  0.5;
                            break;
                        case 2:
                            data.rank =  1;
                            break;
                        case 3:
                            data.rank =  2;
                            break;
                    }
                },
            },
        });
    }
}