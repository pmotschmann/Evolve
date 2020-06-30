import { global } from './../vars.js';
import { loc } from './../locale.js';
import { clearElement } from './../functions.js';
import { popover } from './functions.js';
import { prestigePage } from './prestige.js';
import { crisprPage } from './crispr.js';

export function gamePlayPage(zone){
    let content = $(`#content`);
    clearElement(content);

    switch (zone){
        case 'basics':
            basicsPage(content);
            break;
        case 'mechanics':
            mechanicsPage(content);
            break;
        case 'prestige':
            prestigePage(content);
            break;
        case 'crispr':
            crisprPage(content);
            break;
    }
}

function basicsPage(content){
    content.append(`<div>coming soon</div>`);
}

function mechanicsPage(content){
    content.append(`<div>coming soon</div>`);
}
