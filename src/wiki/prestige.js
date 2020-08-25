import { clearElement } from './../functions.js';
import { crisprPage } from './crispr.js';
import { pResPage } from './p_res.js';
import { resetsPage } from './resets.js';

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
    }
}