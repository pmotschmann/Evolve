import { loc } from './../locale.js';
import { infoBoxBuilder } from './functions.js';

export function pResPage(content){
    infoBoxBuilder(content,{ name: 'plasmids', template: 'p_res', paragraphs: 2, h_level: 2,
        para_data: { 1: [250] },
        data_color: { 1: ['warning'] }
    });
    infoBoxBuilder(content,{ name: 'antiplasmids', template: 'p_res', paragraphs: 5, h_level: 2,
        para_data: { 4: [loc('arpa_genepool_bleeding_effect_title')] },
        data_link: { 4: ['wiki.html#crispr-prestige-bleeding_effect'] }
    });
    infoBoxBuilder(content,{ name: 'phage', template: 'p_res', paragraphs: 4, h_level: 2 });

    let dark = infoBoxBuilder(content,{ name: 'dark', template: 'p_res', paragraphs: 1, h_level: 2 });
    let dark_extra = $(`<div></div>`);
    let dark_list = $(`<ul class="disc"></ul>`);
    dark.append(dark_extra);
    dark_extra.append(dark_list);
    dark_list.append(`<li>${loc('wiki_p_res_dark_standard')}</li>`);
    dark_list.append(`<li>${loc('wiki_p_res_dark_evil')}</li>`);
    dark_list.append(`<li>${loc('wiki_p_res_dark_heavy')}</li>`);
    dark_list.append(`<li>${loc('wiki_p_res_dark_antimatter')}</li>`);
    dark_list.append(`<li>${loc('wiki_p_res_dark_micro')}</li>`);
    dark_list.append(`<li>${loc('wiki_p_res_dark_magic')}</li>`);

    infoBoxBuilder(content,{ name: 'harmony', template: 'p_res', paragraphs: 3, h_level: 2 });
}

