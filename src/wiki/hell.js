import { global } from './../vars.js';
import { loc } from './../locale.js';

export function hellPage(content){
    content.append(`<h2 class="header has-text-caution">${loc('wiki_hell')}</h2></h2>`);

    infoBoxBuilder(content,'threat',3);
    infoBoxBuilder(content,'siege',5);
    infoBoxBuilder(content,'strategy',3);

    let soul = infoBoxBuilder(content,'soul_gem',4);
    let soul_extra = $(`<div></div>`);
    soul.append(soul_extra);
    soul_extra.append(`<div>${loc('wiki_hell_sim',[`<a href="https://zarakon.github.io/EvolveHellSim/" target="_blank">${loc(`wiki_hell_sim2`)}</a>`,'Zarakon'])}</div>`);

    infoBoxBuilder(content,'infernite',4);
}

function infoBoxBuilder(parent,name,paragraphs){
    let info = $(`<div class="infoBox"></div>`);
    info.append(`<h3 id="${name}" class="header has-text-warning">${loc(`wiki_hell_${name}`)}</h3>`);
    let para = $(`<div class="para"></div>`);
    for (let i=1; i<=paragraphs; i++){
        para.append(`<span>${loc(`wiki_hell_${name}_para${i}`)}</span>`);
    }
    parent.append(info);
    info.append(para);
    return info;
}