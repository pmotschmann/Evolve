import { global } from './../vars.js';
import { clearElement } from './../functions.js';
import { crisprPage } from './crispr.js';
import { pResPage } from './p_res.js';

export function prestigePage(zone){
    let content = $(`#content`);
    clearElement(content);

    switch (zone){
        case 'resources':
            pResPage(content);
            break;
        case 'crispr':
            crisprPage(content);
            break;
    }
}