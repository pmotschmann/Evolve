import {} from './../vars.js';
import { loc } from './../locale.js';
import { clearElement } from './../functions.js';
import { actions } from './../actions.js';
import { popover } from './functions.js';

export function prehistoricPage(){
    let content = $(`#content`);
    clearElement(content);

    Object.keys(actions.evolution).forEach(function (action){
        let info = $(`<div class="infoBox"></div>`);
        content.append(info);

        let title = typeof actions.evolution[action].title === 'string' ? actions.evolution[action].title : actions.evolution[action].title();
        info.append(`<div class="type"><h2 class="has-text-warning">${title}</h2></div>`);
    });
}

export function planteryPage(){
    let content = $(`#content`);
    clearElement(content);

    Object.keys(actions.city).forEach(function (action){
        if (action === 'gift'){
            return;
        }
        
        let info = $(`<div class="infoBox"></div>`);
        content.append(info);

        let title = typeof actions.city[action].title === 'string' ? actions.city[action].title : actions.city[action].title();
        info.append(`<div class="type"><h2 class="has-text-warning">${title}</h2></div>`);
    });
}

export function spacePage(){
    let content = $(`#content`);
    clearElement(content);

}

export function interstellarPage(){
    let content = $(`#content`);
    clearElement(content);

}

export function intergalacticPage(){
    let content = $(`#content`);
    clearElement(content);

}

export function hellPage(){
    let content = $(`#content`);
    clearElement(content);

}