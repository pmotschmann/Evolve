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

function addInformation(parent,key){
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
    let techList = [];
    let otherTechs = [];
    clearElement(content);

    Object.keys(actions.tech).forEach(function (actionName){
        let action = actions.tech[actionName];
        if (action.hasOwnProperty('era') && action.era === era && (!action.hasOwnProperty('wiki') || action.wiki)){
            let info = $(`<div class="infoBox"></div>`);
            actionDesc(info, action);
            addInformation(info, actionName);
            if (action.cost['Knowledge']){
                if (techList.length === 0){
                    techList[0] = [action, info];
                }
                else {
                    let knowledgeCost = action.cost.Knowledge();
                    let insertPos = techList.length - 1;
                    
                    while (insertPos >= 0 && techList[insertPos][0].cost.Knowledge() > knowledgeCost) { 
                        techList[insertPos + 1] = techList[insertPos]; 
                        insertPos--; 
                    } 
                    techList[insertPos + 1] = [action, info]; 
                }
            }
            else {
                otherTechs.push([action, info]);
            }
        }
    });
    if (otherTechs.length > 0) {
        for (let i=0; i<otherTechs.length; i++) {
            if (otherTechs[i][0].id === 'tech-unification2') {
                let insertPos = -1;
                for (let i=0; i<techList.length; i++) {
                    if (techList[i][0].id === 'tech-unification') {
                        insertPos = i + 1;
                        break;
                    }
                }
                let tempArray = techList.slice(0, insertPos);
                tempArray.push(otherTechs[i]);
                techList = tempArray.concat(techList.slice(insertPos));
            }
            else {
                techList.push(otherTechs[i]);
            }
        }
    }
    for (let i=0; i<techList.length; i++) {
        content.append(techList[i][1]);
    }
}