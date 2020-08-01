import { clearElement } from './../functions.js';
import { hellPage } from './hell.js';
import { planetsPage } from './planets.js';
import { resetsPage } from './resets.js';

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
        case 'hell':
            hellPage(content);
            break;        
    }
}

function basicsPage(content){
    content.append(`<div>An excellent <a href="https://wooledge.org/~greg/evolve/guide.html" target="_blank">Beginner's Guide</a> by GreyCat is available</div>`);
}

function mechanicsPage(content){
    content.append(`<div>coming soon</div>`);
}
