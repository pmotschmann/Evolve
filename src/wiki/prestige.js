import { clearElement } from './../functions.js';
import { crisprPage } from './crispr.js';
import { bloodPage } from './blood.js';
import { pResPage } from './p_res.js';
import { resetsPage } from './resets.js';
import { perksPage } from './perks.js';

export function prestigePage(zone){
    let content = $(`#content`);
    clearElement(content);

    switch (zone){
        case 'resets':
            resetsPage(content);
            break;
        case 'resources':
            pResPage(content);
            break;
        case 'crispr':
            crisprPage(content);
            break;
        case 'blood':
            bloodPage(content);
            break;
        case 'perks':
            perksPage(content);
            break;
    }
}