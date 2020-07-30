import { clearElement } from './../functions.js';
import { hellPage } from './hell.js';
import { planetsPage } from './planets.js';

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
        case 'planets':
            planetsPage(content);
            break;
        case 'hell':
            hellPage(content);
            break;        
    }
}

function basicsPage(content){
    content.append(`<div>coming soon</div>`);
}

function mechanicsPage(content){
    content.append(`<div>coming soon</div>`);
}
