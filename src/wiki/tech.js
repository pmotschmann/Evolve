import {} from './../vars.js';
import { loc } from './../locale.js';
import { clearElement } from './../functions.js';
import { actions } from './../actions.js';
import { actionDesc } from './functions.js';

export function renderTechPage(era){
    let content = $(`#content`);
    clearElement(content);

    Object.keys(actions.tech).forEach(function (action){
        if (actions.tech[action].hasOwnProperty('era') && actions.tech[action].era === era && (!actions.tech[action].hasOwnProperty('wiki') || actions.tech[action].wiki)){
            let info = $(`<div class="infoBox"></div>`);
            content.append(info);

            actionDesc(info, actions.tech[action]);
        }
    });
}
