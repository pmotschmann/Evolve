import { loc } from './../locale.js';
import { infoBoxBuilder, sideMenu } from './functions.js';

export function pResPage(content){
    let mainContent = sideMenu('create',content);

    infoBoxBuilder(mainContent,{ name: 'plasmids', template: 'p_res', paragraphs: 2, h_level: 2,
        para_data: { 1: [250] },
        data_color: { 1: ['warning'] }
    });
    sideMenu('add',`resources-prestige`,'plasmids',loc('wiki_p_res_plasmids'));

    infoBoxBuilder(mainContent,{ name: 'antiplasmids', template: 'p_res', paragraphs: 5, h_level: 2,
        para_data: { 4: [loc('arpa_genepool_bleeding_effect_title')] },
        data_link: { 4: ['wiki.html#crispr-prestige-bleeding_effect'] }
    });
    sideMenu('add',`resources-prestige`,'antiplasmids',loc('wiki_p_res_antiplasmids'));

    infoBoxBuilder(mainContent,{ name: 'phage', template: 'p_res', paragraphs: 4, h_level: 2 });
    sideMenu('add',`resources-prestige`,'phage',loc('wiki_p_res_phage'));

    let dark = infoBoxBuilder(mainContent,{ name: 'dark', template: 'p_res', paragraphs: 1, h_level: 2 });
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
    sideMenu('add',`crispr-prestige`,'dark',loc('wiki_p_res_dark'));

    infoBoxBuilder(mainContent,{ name: 'harmony', template: 'p_res', paragraphs: 3, h_level: 2 });
    sideMenu('add',`resources-prestige`,'harmony',loc('wiki_p_res_harmony'));

    infoBoxBuilder(mainContent,{ name: 'blood', template: 'p_res', paragraphs: 5, h_level: 2,
        para_data: {
            2: [loc('tab_arpa_blood')],
            3: [1,'1-5'],
            4: [loc('arpa_genepool_blood_sacrifice_title')],
            5: [loc('arpa_genepool_blood_remembrance_title')]
        },
        data_link: {
            2: ['wiki.html#blood-prestige'],
            4: ['wiki.htmll#crispr-prestige-blood_sacrifice'],
            5: ['wiki.htmll#crispr-prestige-blood_remembrance']
        }
    });
    sideMenu('add',`resources-prestige`,'blood',loc('wiki_p_res_blood'));

    infoBoxBuilder(mainContent,{ name: 'artifact', template: 'p_res', paragraphs: 3, h_level: 2,
        para_data: {
            1: [loc('wiki_resets_infusion')],
            2: [loc('tab_arpa_blood')],
            3: [1,'5th'],
        },
        data_link: {
            1: ['wiki.html#resets-prestige-infusion'],
            2: ['wiki.html#blood-prestige']
        }
    });
    sideMenu('add',`resources-prestige`,'artifact',loc('wiki_p_res_artifact'));
}