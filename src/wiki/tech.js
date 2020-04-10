import {} from './../vars.js';
import { loc } from './../locale.js';
import { clearElement } from './../functions.js';
import { actions } from './../actions.js';
import { actionDesc } from './functions.js';

const extraInformation = {
    sundial: [
        loc(`wiki_tech_sundial1`),
        loc(`wiki_tech_sundial2`),
        loc(`wiki_tech_sundial3`),
        loc(`wiki_tech_sundial4`)
    ],
};

function addInfomration(parent,key){
    if (extraInformation.hasOwnProperty(key)){
        let extra = $(`<div class="extra"></div>`);
        parent.append(extra);
        for (let i=0; i<extraInformation[key].length; i++){
            extra.append(`<div>${extraInformation[key][i]}</div>`);
        }
    }
}

export function renderTechPage(era){
    let content = $(`#content`);
    clearElement(content);

    Object.keys(actions.tech).forEach(function (action){
        if (actions.tech[action].hasOwnProperty('era') && actions.tech[action].era === era && (!actions.tech[action].hasOwnProperty('wiki') || actions.tech[action].wiki)){
            let info = $(`<div class="infoBox"></div>`);
            content.append(info);
            actionDesc(info, actions.tech[action]);
            addInfomration(info,action);
        }
    });
}
