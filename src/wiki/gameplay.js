import { clearElement } from './../functions.js';
import { basicsPage } from './basics.js';
import { resetsPage } from './resets.js';
import { planetsPage } from './planets.js';
import { universePage } from './universes.js';
import { hellPage } from './hell.js';

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
        case 'resets':
            resetsPage(content);
            break;
        case 'planets':
            planetsPage(content);
            break;
        case 'universes':
            universePage(content);
            break;
        case 'hell':
            hellPage(content);
            break;        
    }
}

function mechanicsPage(content){
    content.append(`<div>coming soon</div>`);
}
