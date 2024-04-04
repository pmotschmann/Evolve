import { loc } from './../locale.js';
import { clearElement } from './../functions.js';
import { faqPage } from './faq.js';
import { basicsPage } from './basics.js';
import { mechanicsPage } from './mechanics.js';
import { govPage } from './government.js';
import { governPage } from './governor.js';
import { combatPage } from './combat.js';
import { challengesPage } from './challenges.js';
import { resetsPage } from './resets.js';
import { planetsPage } from './planets.js';
import { universePage } from './universes.js';
import { hellPage } from './hell.js';
import { pResPage } from './p_res.js';
import { perksPage } from './perks.js';
import { mainEventsPage, minorEventsPage, progressEventsPage, specialEventsPage} from './events.js';
import { racesPage, traitsPage } from './species.js';
import { structuresIndex } from './structuresIndex.js';
import { renderTechPage } from './tech.js';
import { projectsPage } from './projects.js';
import { crisprPage } from './crispr.js';
import { bloodPage } from './blood.js';
import { achievePage, featPage } from './achieve.js';
import { changeList } from './change.js';

let content;
let fakecontent;
let earlyExit = false;
const pages = [
    [faqPage, false, "faq", undefined],
    [basicsPage, false, "gameplay", "basics"],
    [mechanicsPage, true, "gameplay", "mechanics"],
    [govPage, true, "gameplay", "government"],
    [governPage, true, "gameplay", "governor"],
    [combatPage, true, "gameplay", "combat"],
    [challengesPage, false, "gameplay", "challenges"],
    [resetsPage, true, "gameplay", "resets"],
    [planetsPage, false, "gameplay", "planets"],
    [universePage, true, "gameplay", "universes"],
    [hellPage, true, "gameplay", "hell"],
    [pResPage, true, "prestige", "resources"],
    [perksPage, true, "prestige", "perks"],
    [mainEventsPage, true, "events", "major"],
    [minorEventsPage, true, "events", "minor"],
    [progressEventsPage, true, "events", "progress"],
    [specialEventsPage, true, "events", "special"],
    [racesPage, true, "species", "races"],
    [traitsPage, true, "species", "traits"],
    [structuresIndex, false, "structures", "prehistoric"],
    [structuresIndex, false, "structures", "planetary"],
    [structuresIndex, false, "structures", "space"],
    [structuresIndex, false, "structures", "interstellar"],
    [structuresIndex, false, "structures", "intergalactic"],
    [structuresIndex, false, "structures", "hell"],
    [renderTechPage, false, "tech", "prehistoric"],
    [renderTechPage, false, "tech", "civilized"],
    [renderTechPage, false, "tech", "discovery"],
    [renderTechPage, false, "tech", "industrialized"],
    [renderTechPage, false, "tech", "globalized"],
    [renderTechPage, false, "tech", "early_space"],
    [renderTechPage, false, "tech", "deep_space"],
    [renderTechPage, false, "tech", "interstellar"],
    [renderTechPage, false, "tech", "tech_intergalactic"],
    [renderTechPage, false, "tech", "dimensional"],
    [structuresIndex, false, "tp_structures", "tp_prehistoric"],
    [structuresIndex, false, "tp_structures", "tp_planetary"],
    [structuresIndex, false, "tp_structures", "tp_space"],
    [structuresIndex, false, "tp_structures", "tp_tauceti"],
    [renderTechPage, false, "tp_tech", "tp_prehistoric"],
    [renderTechPage, false, "tp_tech", "tp_civilized"],
    [renderTechPage, false, "tp_tech", "tp_discovery"],
    [renderTechPage, false, "tp_tech", "tp_industrialized"],
    [renderTechPage, false, "tp_tech", "tp_globalized"],
    [renderTechPage, false, "tp_tech", "tp_early_space"],
    [renderTechPage, false, "tp_tech", "tp_deep_space"],
    [renderTechPage, false, "tp_tech", "solar"],
    [renderTechPage, false, "tp_tech", "tp_tauceti"],
    [crisprPage, true, "arpa", "crispr"],
    [projectsPage, true, "arpa", "projects"],
    [bloodPage, true, "arpa", "blood"],
    [achievePage, false, "achievements", "achievements"],
    [featPage, false, "achievements", "feats"],
    [changeList, false, "changelog", "changelog"]
];
let sections = {
    faq: [], gameplay: [], prestige: [], events: [], species: [], structures: [],
    tech: [], tp_structures: [], tp_tech: [], arpa: [], achievements: [], changelog: []
};
let index = {
    faq: [], gameplay: [], prestige: [], events: [], species: [], structures: [],
    tech: [], tp_structures: [], tp_tech: [], arpa: [], achievements: [], changelog: []
};
function indexPage(page){
    if(pages[page][1]){
        pages[page][0](fakecontent);
        let v = $("#sideContent a");
        for(let i = 0; i < v.length; i++) index[pages[page][2]].push([v[i].innerText, v[i].getAttribute("href"), pages[page][3]]);
        fakecontent.empty();
    } else {
        if(pages[page][0] === faqPage){
            faqPage();
            let v = $(".question h2");
            for(let i = 0; i < v.length; i++) index["faq"].push([v[i].innerText, `wiki.html#question-faq-${v[i].id}`]);
        } else if(pages[page][0] === basicsPage){
            basicsPage(fakecontent);
            let v = $(".header.has-text-warning");
            for(let i = 0; i < v.length; i++) index["gameplay"].push([v[i].innerText, `wiki.html#basics-gameplay-${v[i].innerText.toLowerCase().replaceAll(' ', '_')}`, "basics"]);
        } else if(pages[page][0] === challengesPage){
            challengesPage(fakecontent);
            let v = $("#sideContent a");
            for(let i = 0; i < v.length; i++) index["gameplay"].push([v[i].innerText.replaceAll('ᄂ', ''), v[i].getAttribute("href"), "challenges"]);
        } else if(pages[page][0] === planetsPage){
            planetsPage(fakecontent);
            let v = $("h4");
            for(let i = 0; i < v.length; i++) index["gameplay"].push([v[i].innerText, "wiki.html#planets-gameplay", "planets"]);
        } else if(pages[page][0] === structuresIndex){
            if(pages[page][2] === "tp_structures"){
                let v = structuresIndex[pages[page][3].substring(3)];
                for(let i = 0; i < v.length; i++) index["tp_structures"].push([v[i][0], "wiki.html#" + v[i][1], pages[page][3]]);
            } else {
                let v = structuresIndex[pages[page][3]];
                for(let i = 0; i < v.length; i++) index["structures"].push([v[i][0], "wiki.html#" + v[i][1], pages[page][3]]);
            }
        } else if(pages[page][0] === renderTechPage){
            if(pages[page][2] === "tp_tech"){
                renderTechPage(pages[page][3], "truepath");
                let v = $("#sideContent a");
                for(let i = 0; i < v.length; i++) index[pages[page][2]].push([v[i].innerText, v[i].getAttribute("href"), pages[page][3]]);
            } else {
                renderTechPage(pages[page][3], "standard");
                let v = $("#sideContent a");
                for(let i = 0; i < v.length; i++) index[pages[page][2]].push([v[i].innerText, v[i].getAttribute("href"), pages[page][3]]);
            }
        } else if(pages[page][0] === achievePage){
            achievePage();
            let v = $(".achievement .achieve");
            for(let i = 0; i < v.length; i++) index[pages[page][2]].push([v[i].innerText, "wiki.html#list-achievements", pages[page][3]]);
        } else if(pages[page][0] === featPage){
            featPage();
            let v = $(".achievement .achieve");
            for(let i = 0; i < v.length; i++) index[pages[page][2]].push([v[i].innerText, "wiki.html#feats-achievements", pages[page][3]]);
        } else if(pages[page][0] === changeList){
            for(let i = 0; i < changeList.length; i++){
                index["changelog"].push([changeList[i].version, `wiki.html#version-changelog-${changeList[i].version.replaceAll('.', '_')}`, changeList[i].version]);
                index["changelog"].push([changeList[i].date, `wiki.html#version-changelog-${changeList[i].version.replaceAll('.', '_')}`, changeList[i].version]);
                for(let k = 0; k < changeList[i].changes.length; k++){
                    index["changelog"].push([changeList[i].changes[k], `wiki.html#version-changelog-${changeList[i].version.replaceAll('.', '_')}`, changeList[i].version]);
                }
            }
        }
        fakecontent.empty();
    }
}
export function cancelSearchIndexing(){
    earlyExit = true;
}
function indexWiki(){
    for(const k of Object.keys(index)) index[k] = [];
    content.attr("id", "");
    content.append(`<span id="content" class="temp-indexer" style="display: none"></span>`);
    fakecontent = $("#content");
    earlyExit = false;
    async function nonLockingLoop(indexingIndex = 0){
        if(earlyExit){
            fakecontent.remove();
            content.attr("id", "content");
            return;
        }
        if(indexingIndex < pages.length){
            setTimeout(() => {
                indexPage(indexingIndex);
                nonLockingLoop(++indexingIndex);
            }, 0);
        } else {
            fakecontent.remove();
            content.attr("id", "content");
        }
    }
    nonLockingLoop();
}

function processSearch(input){
    for(const k of Object.keys(sections)) sections[k] = [];
    if(input.val().length){
        let expression = new RegExp(input.val(), "gi");
        
        for(const k of Object.keys(index)){
            for(let i = 0; i < index[k].length; i++){
                if(index[k][i][0].match(expression) !== null){
                    sections[k].push(index[k][i]);
                }
            }
        }
    }
    updateResults();
}
function updateResults(){
    for(const k of Object.keys(sections)){
        let element = $("#searchResult-" + k);
        clearElement(element);
        if(sections[k].length === 0){
            element.append(`<h1>${loc('wiki_search_placeholder')}</h1>`);
        } else {
            let headers = [];
            for(const v of sections[k]){
                if(v[2] !== undefined){
                    if(!headers.includes(v[2])){
                        headers.push(v[2]);
                        if((v[2].match(/\./gi) || []).length > 1){
                            element.append(`<div class="infoBox" id="changelog-entry-${v[2].replaceAll('.', '_')}"><h1>v${v[2]}</h1></div>`);
                        } else {
                            element.append(`<div class="infoBox" id="${v[2]}"><h1>${loc("wiki_menu_" + (v[2].includes("tp_") ? v[2].substring(3) : v[2].includes("tech_") ? v[2].substring(5) : v[2]))}</h1></div>`);
                        }
                    }
                    if((v[2].match(/\./gi) || []).length > 1){
                        $(`#changelog-entry-${v[2].replaceAll('.', '_')}`).append(`<p><a href="${v[1]}" class="has-text-red" target="_blank">${v[0]}</a></p>`);
                    } else {
                        $(`#${v[2]}`).append(`<p><a href="${v[1]}" class="has-text-red" target="_blank">${v[0]}</a></p>`);
                    }
                } else {
                    element.append(`<p><a href="${v[1]}" class="has-text-red" target="_blank">${v[0]}</a></p>`);
                }
            }
        }
    }
}
export function search(){
    content = $("#content");
    clearElement(content);
    content.append(
        `
        <div class="infoBox">
            ${loc('wiki_menu_search')}
            <div class="control is-clearfix">
                <input id="searchInput" class="input" placeholder="${loc('wiki_search_regex_support')}"type="text"/>
            </div>
        </div>
        `
    );
    let input = $("#searchInput");
    input.parent().on('input', ':text', _ => processSearch(input));
    indexWiki();
    for(const k of Object.keys(sections)){
        content.append(`<div class="infoBox"><h1 style="padding-bottom: 5px">${loc('wiki_menu_' + k)}</h1><div id="${"searchResult-" + k}"></div></div>`);
    }
    updateResults(content);
}
