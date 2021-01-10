import { clearElement } from './../functions.js';
import { basicsPage } from './basics.js';
import { mechanicsPage } from './mechanics.js';
import { govPage } from './government.js';
import { combatPage } from './combat.js';
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
        case 'government':
            govPage(content);
            break;
        case 'combat':
            combatPage(content);
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
