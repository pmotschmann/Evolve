import { loc } from './../locale.js';
import { infoBoxBuilder } from './functions.js';

export function hellPage(content){
    content.append(`<h2 class="header has-text-caution">${loc('wiki_hell')}</h2></h2>`);

    infoBoxBuilder(content,{ name: 'threat', template: 'hell', paragraphs: 3,
        para_data: { 1: ['10,000'], 2: ['1000-1250'] },
        data_color: { 1: ['caution'], 2: ['warning'] }
    });
    infoBoxBuilder(content,{ name: 'siege', template: 'hell', paragraphs: 5,
        para_data: { 3: ['5k+'] },
        data_color: { 3: ['caution'] } });
    infoBoxBuilder(content,{ name: 'strategy', template: 'hell', paragraphs: 3 });

    let soul = infoBoxBuilder(content,{ name: 'soul_gem', template: 'hell', paragraphs: 4 });
    let soul_extra = $(`<div></div>`);
    soul.append(soul_extra);
    soul_extra.append(`<div>${loc('wiki_hell_sim',[`<a href="https://zarakon.github.io/EvolveHellSim/" target="_blank">${loc(`wiki_hell_sim2`)}</a>`,'Zarakon'])}</div>`);

    infoBoxBuilder(content,{ name: 'infernite', template: 'hell', paragraphs: 4 });
}

