import { global } from './../vars.js';
import { loc } from './../locale.js';
import {} from './../achieve.js';
import { vBind, clearElement } from './../functions.js';
import { faqPage } from './faq.js';
import { racesPage, traitsPage } from './species.js';
import { prehistoricPage, planteryPage, spacePage, interstellarPage, intergalacticPage, hellPage } from './structures.js';
import { primitiveTechPage, civilizedTechPage, discoveryTechPage, industrializedTechPage, globalizedTechPage, earlySpaceTechPage, deepSpaceTechPage, interstellarTechPage, intergalacticTechPage } from './tech.js';

$('body').empty();
initPage();

function initPage(){
    $('body').append($(`<h1 class="is-sr-only">${loc('wiki_menu_evolve')}</h1>`));

    let wiki = $(`<div id="main" class="main wiki"></div>`)
    $('body').append(wiki);

    let menu = $(`<div id="menu" class="mainMenu"></div>`);
    wiki.append(menu);

    let menuItems = [
        {
            key: 'intro',
        },
        {
            key: 'faq',
        },
        {
            key: 'gameplay',
            submenu: [
                { key: 'mechanics' },
                { key: 'prestige' },
            ]
        },
        {
            key: 'species',
            submenu: [
                { key: 'races' },
                { key: 'traits' }
            ]
        },
        {
            key: 'structures',
            submenu: [
                { key: 'prehistoric' },
                { key: 'plantery' },
                { key: 'space' },
                { key: 'interstellar' },
                { key: 'intergalactic' },
                { key: 'hell' }
            ]
        },
        {
            key: 'tech',
            submenu: [
                { key: 'primitive' },
                { key: 'civilized' },
                { key: 'discovery' },
                { key: 'industrialized' },
                { key: 'globalized' },
                { key: 'early_space' },
                { key: 'deep_space' },
                { key: 'interstellar' },
                { key: 'intergalactic' }
            ]
        }
    ];

    let wikiMenu = `<template><b-menu><b-menu-list label="${loc('wiki_menu_evolve')}">`;
    wikiMenu = wikiMenu + buiildMenu(menuItems,true,false);
    wikiMenu = wikiMenu + `</b-menu-list></b-menu></template>`;
    menu.append(wikiMenu);

    var menuData = {};
    vBind({
        el: `#menu`,
        data: menuData,
        methods: {
            loadPage(main,sub){
                switch (main){
                    case 'intro':
                        mainPage();
                        break;

                    case 'faq':
                        faqPage();
                        break;

                    case 'species':
                        switch (sub){
                            case 'races':
                                racesPage();
                                break;
                            case 'traits':
                                traitsPage();
                                break;
                            }
                        break;

                    case 'structures':
                        switch (sub){
                            case 'evolution':
                                prehistoricPage();
                                break;
                            case 'plantery':
                                planteryPage();
                                break;
                            case 'space':
                                spacePage();
                                break;
                            case 'interstellar':
                                interstellarPage();
                                break;
                            case 'intergalactic':
                                intergalacticPage();
                                break;
                            case 'hell':
                                hellPage();
                                break;
                        }
                        break;

                    case 'tech':
                        switch (sub){
                            case 'primitive':
                                primitiveTechPage();
                                break;
                            case 'civilized':
                                civilizedTechPage();
                                break;
                            case 'discovery':
                                discoveryTechPage();
                                break;
                            case 'industrialized':
                                industrializedTechPage();
                                break;
                            case 'globalized':
                                globalizedTechPage();
                                break;
                            case 'early_space':
                                earlySpaceTechPage();
                                break;
                            case 'deep_space':
                                deepSpaceTechPage();
                                break;
                            case 'interstellar':
                                interstellarTechPage();
                                break;
                            case 'intergalactic':
                                intergalacticTechPage();
                                break;
                        }
                        break;
                }
            }
        }
    });

    let content = $(`<div id="content" class="mainContent"></div>`);
    wiki.append(content);

    mainPage();
}

function buiildMenu(items,set,parent){
    let menu = ``;
    for (let i=0; i<items.length; i++){
        let active = set && i === 0 ? `:active="true" ` : '';

        if (items[i].hasOwnProperty('submenu')){
            menu = menu + `<b-menu-item><template slot="label" slot-scope="props">${loc(`wiki_menu_${items[i].key}`)}</template>`;
            menu = menu + buiildMenu(items[i].submenu,false,items[i].key);
            menu = menu + `</b-menu-item>`;
        }
        else {
            let args = parent ? `'${parent}','${items[i].key}'` : `'${items[i].key}',false`;
            menu = menu + `<b-menu-item ${active}label="${loc(`wiki_menu_${items[i].key}`)}" @click="loadPage(${args})"></b-menu-item>`
        }
    }
    return menu;
}

function mainPage(){
    let content = $(`#content`);
    clearElement(content);

    let version = global['beta'] ? `beta v${global.version}.${global.beta}` : 'v'+global.version;
    content.append(`<div class="title has-text-warning">${loc(`wiki_main_title`)} - ${version}</div>`);
    content.append(`<div class="paragraph has-text-advanced">${loc(`wiki_main_author`)}</div>`);
    content.append(`<div class="paragraph has-text-danger">${loc(`wiki_main_spoiler`)}</div>`);
    content.append(`<div class="paragraph">${loc(`wiki_main_blurb`)}</div>`);
    content.append(`<div class="paragraph has-text-caution">${loc(`wiki_main_construction`)}</div>`);
}
