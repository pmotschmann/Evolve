import { global } from './../vars.js';
import { loc } from './../locale.js';
import { infoBoxBuilder } from './functions.js';

export function hellPage(content){
    content.append(`<h2 class="header has-text-caution">${loc('wiki_hell')}</h2></h2>`);

    infoBoxBuilder(content,'threat','hell',3);
    infoBoxBuilder(content,'siege','hell',5);
    infoBoxBuilder(content,'strategy','hell',3);

    let soul = infoBoxBuilder(content,'soul_gem','hell',4);
    let soul_extra = $(`<div></div>`);
    soul.append(soul_extra);
    soul_extra.append(`<div>${loc('wiki_hell_sim',[`<a href="https://zarakon.github.io/EvolveHellSim/" target="_blank">${loc(`wiki_hell_sim2`)}</a>`,'Zarakon'])}</div>`);

    infoBoxBuilder(content,'infernite','hell',4);
}

