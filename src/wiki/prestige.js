import { global } from './../vars.js';
import { clearElement } from './../functions.js';
import { crisprPage } from './crispr.js';

export function prestigePage(zone){
    let content = $(`#content`);
    clearElement(content);

    switch (zone){
        case 'crispr':
            crisprPage(content);
            break;
    }
}