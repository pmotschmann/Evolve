import { global, setGlobal, save } from './../vars.js';
import { loc } from './../locale.js';
import {} from './init.js';
import {} from './../achieve.js';
import { vBind, clearElement, tagEvent } from './../functions.js';
import { faqPage } from './faq.js';
import { speciesPage } from './species.js';
import { planetsPage } from './planets.js';
import { renderStructurePage } from './structures.js';
import { renderTechPage } from './tech.js';
import { renderAchievePage } from './achieve.js';
import { gamePlayPage } from './gameplay.js';
import { prestigePage } from './prestige.js';
import { eventsPage } from './events.js';
import { arpaPage } from './arpa.js';
import { changeLog } from './change.js';
import { search } from './search.js';

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
                { key: 'basics' },
                { key: 'mechanics' },
                { key: 'government' },
                { key: 'governor' },
                { key: 'combat' },
                { key: 'challenges' },
                { key: 'resets' },
                { key: 'planets' },
                { key: 'universes' },
                { key: 'hell' }                
            ]
        },
        {
            key: 'prestige',
            submenu: [
                { key: 'resets' },
                { key: 'resources' },
                { key: 'crispr' },
                { key: 'blood' },
                { key: 'perks' }
            ]
        },
        {
            key: 'events',
            submenu: [
                { key: 'major' },
                { key: 'minor' },
                { key: 'progress' },
                { key: 'special' }              
            ]
        },
        {
            key: 'species',
            submenu: [
                { key: 'races' },
                { key: 'traits' },
                { key: 'custom' }
            ]
        },
        {
            key: 'structures',
            submenu: [
                { key: 'prehistoric' },
                { key: 'planetary' },
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
                { key: 'intergalactic' },
                { key: 'dimensional' }
            ]
        },
        {
            key: 'tp_structures',
            submenu: [
                { key: 'prehistoric' },
                { key: 'planetary' },
                { key: 'space' },
                { key: 'tauceti' }
            ]
        },
        {
            key: 'tp_tech',
            submenu: [
                { key: 'primitive' },
                { key: 'civilized' },
                { key: 'discovery' },
                { key: 'industrialized' },
                { key: 'globalized' },
                { key: 'early_space' },
                { key: 'deep_space' },
                { key: 'solar' },
                { key: 'tauceti' }
            ]
        },
        {
            key: 'arpa',
            submenu: [
                { key: 'projects' },
                //{ key: 'genetics' },
                { key: 'crispr' },
                { key: 'blood' }
            ]
        },
        {
            key: 'achievements',
            submenu: [
                { key: 'list' },
                { key: 'feats' }
            ]
        },
        {
            key: 'changelog',
        },
        {
            key: 'search',
        }
    ];

    let wikiMenu = `<template><b-menu class="sticky has-text-caution"><b-menu-list label="${loc('wiki_menu_evolve')}">`;
    wikiMenu = wikiMenu + buiildMenu(menuItems,true,false);
    wikiMenu = wikiMenu + `</b-menu-list></b-menu></template>`;
    menu.append(wikiMenu);

    var menuData = {};
    vBind({
        el: `#menu`,
        data: menuData,
        methods: {
            loadPage(main,sub){
                menuDispatch(main,sub);
            }
        }
    });

    let content = $(`<div id="content" class="mainContent"></div>`);
    wiki.append(content);

    if (window.location.hash){
        let hash = window.location.hash.substring(1).split('-');
        if (hash.length > 1){
            hash.length > 2 ? menuDispatch(hash[1],hash[0],hash[2]) : menuDispatch(hash[1],hash[0]);
        }
        else {
            menuDispatch(hash[0]);
        }
    }
    else {
        mainPage();
    }
}

function menuDispatch(main,sub,frag){
    $(`#content`).removeClass('flex');

    var global_data = save.getItem('evolved') || false;
    if (global_data){
        setGlobal(JSON.parse(LZString.decompressFromUTF16(global_data)));
    }

    tagEvent('page_view',{ page_title: `Evolve Wiki - ${main}` });

    switch (main){
        case 'intro':
            mainPage();
            window.location.hash = `#${main}`;
            break;

        case 'faq':
            faqPage();
            window.location.hash = `#${main}`;
            break;

        case 'gameplay':
            gamePlayPage(sub);
            setWindowHash(main,sub,frag);
            break;

        case 'prestige':
            prestigePage(sub);
            setWindowHash(main,sub,frag);
            break;

        case 'events':
            eventsPage(sub);
            setWindowHash(main,sub,frag);
            break;

        case 'species':
            switch (sub){
                case 'planets':
                    planetsPage();
                    break;
                default:
                    speciesPage(sub);
                    break;
            }
            setWindowHash(main,sub,frag);
            break;

        case 'structures':
            renderStructurePage(sub,'standard');
            setWindowHash(main,sub,frag);
            break;

        case 'tech':
            renderTechPage(sub,'standard');
            setWindowHash(main,sub,frag);
            break;

        case 'tp_structures':
            renderStructurePage(sub,'truepath');
            setWindowHash(main,sub,frag);
            break;

        case 'tp_tech':
            renderTechPage(sub,'truepath');
            setWindowHash(main,sub,frag);
            break;

        case 'arpa':
            arpaPage(sub);
            setWindowHash(main,sub,frag);
            break;

        case 'achievements':
            switch (sub){
                case 'tracker':
                    //loadTracker();
                    break;
                default:
                    renderAchievePage(sub);
                    break;
                }
                setWindowHash(main,sub,frag);
            break;

        case 'changelog':
            changeLog();
            window.location.hash = `#${main}`;
            break;
        
        case 'search':
            search();
            window.location.hash = `#${main}`;
            break;
    }
}

function setWindowHash(main,sub,frag){
    if (typeof frag === 'undefined'){
        window.location.hash = `#${sub}-${main}`;
    }
    else {
        window.location.hash = `#${sub}-${main}-${frag}`;
        setTimeout(function(){
            document.getElementById(frag).scrollIntoView({
                block: 'start',
                behavior: 'smooth'
            });
        }, 125);
        
    }
}

function buiildMenu(items,set,parent){
    let hash = window.location.hash ? window.location.hash.substring(1).split('-') : false;

    let menu = ``;
    for (let i=0; i<items.length; i++){

        if (items[i].hasOwnProperty('submenu')){
            let active = (!hash && set && i === 0) || (hash && hash.length > 1 && hash[1] === items[i].key) ? ` :active="true" expanded` : '';
            menu = menu + `<b-menu-item${active}><template slot="label" slot-scope="props">${loc(`wiki_menu_${items[i].key}`)}</template>`;
            menu = menu + buiildMenu(items[i].submenu,false,items[i].key);
            menu = menu + `</b-menu-item>`;
        }
        else {
            let active = (!hash && set && i === 0) || (hash && hash[0] === items[i].key) ? ` :active="true"` : '';
            let args = parent ? `'${parent}','${items[i].key}'` : `'${items[i].key}',false`;
            menu = menu + `<b-menu-item${active} label="${loc(`wiki_menu_${items[i].key}`)}" @click="loadPage(${args})"></b-menu-item>`
        }
    }
    return menu;
}

function mainPage(){
    let content = $(`#content`);
    clearElement(content);

    let contribute = `<span class="has-text-caution">${['Beorseder','Rodrigodd','Volch'].join('</span>, <span class="has-text-caution">').replace(/, ([^,]*)$/, `, & $1`)}</span>`;

    let version = global['beta'] ? `beta v${global.version}.${global.beta}` : 'v'+global.version;
    content.append(`<div class="title has-text-warning">${loc(`wiki_main_title`)} - ${version}</div>`);
    content.append(`<div class="paragraph has-text-advanced">${loc(`wiki_main_author`,['Demagorddon'])}</div>`);
    content.append(`<div class="paragraph has-text-danger">${loc(`wiki_main_spoiler`)}</div>`);
    content.append(`<div class="paragraph">${loc(`wiki_main_blurb`)}</div>`);
    content.append(`<div class="paragraph has-text-warning">${loc(`wiki_main_contribution`,[contribute])}</div>`);
    content.append(`<div class="paragraph">${loc(`wiki_resources`)}</div>`);
    
    let list = $(`<ul class="paragraph"></ul>`);
    content.append(list);

    list.append(`<li><a href="https://wooledge.org/~greg/evolve/guide.html" target="_blank">${loc(`wiki_resources_begin_guide`)}</a> ${loc(`wiki_resources_by`,['GreyCat'])}</li>`);
    list.append(`<li><a href="https://karsen777.github.io/" target="_blank">${loc(`wiki_resources_tracker`)}</a> ${loc(`wiki_resources_by`,['Karsen777'])}</li>`);
    //list.append(`<li><a href="https://zarakon.github.io/EvolveHellSim/" target="_blank">${loc(`wiki_resources_hell_sim`)}</a> ${loc(`wiki_resources_by`,['Jotun'])}</li>`);
}
