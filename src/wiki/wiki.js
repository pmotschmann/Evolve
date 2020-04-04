import {} from './../vars.js';
import { loc } from './../locale.js';
import {} from './../achieve.js';
import { vBind, clearElement } from './../functions.js';
import { racesPage, traitsPage } from './species.js';
import { prehistoricPage, planteryPage, spacePage, interstellarPage, intergalacticPage, hellPage } from './structures.js';

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
            key: 'main'
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
        }
    ];

    let wikiMenu = `<template><b-menu><b-menu-list label="${loc('wiki_menu_evolve')}">`;
    wikiMenu = wikiMenu + buiildMenu(menuItems,true);
    wikiMenu = wikiMenu + `</b-menu-list></b-menu></template>`;
    menu.append(wikiMenu);

    var menuData = {};
    vBind({
        el: `#menu`,
        data: menuData,
        methods: {
            loadPage(page){
                switch (page){
                    case 'main':
                        mainPage();
                        break;
                    case 'races':
                        racesPage();
                        break;
                    case 'traits':
                        traitsPage();
                        break;
                    case 'prehistoric':
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
            }
        }
    });

    let content = $(`<div id="content" class="mainContent"></div>`);
    wiki.append(content);

    mainPage();
}

function buiildMenu(items,set){
    let menu = ``;
    for (let i=0; i<items.length; i++){
        let active = set && i === 0 ? `:active="true" ` : '';

        if (items[i].hasOwnProperty('submenu')){
            menu = menu + `<b-menu-item><template slot="label" slot-scope="props">${loc(`wiki_menu_${items[i].key}`)}</template>`;
            menu = menu + buiildMenu(items[i].submenu, false);
            menu = menu + `</b-menu-item>`;
        }
        else {
            menu = menu + `<b-menu-item ${active}label="${loc(`wiki_menu_${items[i].key}`)}" @click="loadPage('${items[i].key}')"></b-menu-item>`
        }
    }
    return menu;
}

function mainPage(){
    let content = $(`#content`);
    clearElement(content);

    content.append(`<div class="title has-text-warning">${loc(`wiki_main_title`)}</div>`);
    content.append(`<div class="paragraph has-text-advanced">${loc(`wiki_main_author`)}</div>`);
    content.append(`<div class="paragraph has-text-danger">${loc(`wiki_main_spoiler`)}</div>`);
    content.append(`<div class="paragraph">${loc(`wiki_main_blurb`)}</div>`);
    content.append(`<div class="paragraph has-text-caution">${loc(`wiki_main_construction`)}</div>`);
}
