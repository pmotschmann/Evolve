import { global } from './../vars.js';
import { loc } from './../locale.js';
import { infoBoxBuilder } from './functions.js';

export function pResPage(content){
    infoBoxBuilder(content,'plasmids','p_res',2,2);
    infoBoxBuilder(content,'antiplasmids','p_res',5,2);
    infoBoxBuilder(content,'phage','p_res',4,2);

    let dark = infoBoxBuilder(content,'dark','p_res',1,2);
    let dark_extra = $(`<div></div>`);
    let dark_list = $(`<ul class="disc"></ul>`);
    dark.append(dark_extra);
    dark_extra.append(dark_list);
    dark_list.append(`<li>${loc('wiki_p_res_dark_standard')}</li>`);
    dark_list.append(`<li>${loc('wiki_p_res_dark_evil')}</li>`);
    dark_list.append(`<li>${loc('wiki_p_res_dark_heavy')}</li>`);
    dark_list.append(`<li>${loc('wiki_p_res_dark_antimatter')}</li>`);
    dark_list.append(`<li>${loc('wiki_p_res_dark_micro')}</li>`);

    infoBoxBuilder(content,'harmony','p_res',3,2);    
}

