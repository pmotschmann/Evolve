import {} from './../vars.js';
import { loc } from './../locale.js';
import { clearElement } from './../functions.js';
import { actions } from './../actions.js';
import { popover, actionDesc } from './functions.js';

export function renderStructurePage(zone){
    let content = $(`#content`);
    clearElement(content);

    switch (zone){
        case 'prehistoric':
            prehistoricPage(content);
            break;
        case 'plantery':
            planteryPage(content);
            break;
        case 'space':
            spacePage(content);
            break;
        case 'interstellar':
            interstellarPage(content);
            break;
        case 'intergalactic':
            intergalacticPage(content);
            break;
        case 'hell':
            hellPage(content);
            break;
    }
}

function prehistoricPage(content){
    Object.keys(actions.evolution).forEach(function (action){
        if (actions.evolution[action].hasOwnProperty('title') && typeof actions.evolution[action].title !== 'undefined'){
            let info = $(`<div class="infoBox"></div>`);
            content.append(info);
            actionDesc(info, actions.evolution[action]);
        }
    });
}

function planteryPage(content){
    Object.keys(actions.city).forEach(function (action){
        if (action === 'gift'){
            return;
        }
        
        let info = $(`<div class="infoBox"></div>`);
        content.append(info);
        actionDesc(info, actions.city[action]);
    });
}

function spacePage(content){
    Object.keys(actions.space).forEach(function (region){        
        let name = typeof actions.space[region].info.name === 'string' ? actions.space[region].info.name : actions.space[region].info.name();
        //let desc = typeof actions.space[region].info.desc === 'string' ? actions.space[region].info.desc : actions.space[region].info.desc();

        Object.keys(actions.space[region]).forEach(function (struct){
            if (struct !== 'info'){
                let info = $(`<div class="infoBox"></div>`);
                content.append(info);
                actionDesc(info, actions.space[region][struct],name);
            }
        });
    });
}

function interstellarPage(content){
    Object.keys(actions.interstellar).forEach(function (region){        
        let name = typeof actions.interstellar[region].info.name === 'string' ? actions.interstellar[region].info.name : actions.interstellar[region].info.name();
        //let desc = typeof actions.interstellar[region].info.desc === 'string' ? actions.interstellar[region].info.desc : actions.interstellar[region].info.desc();

        Object.keys(actions.interstellar[region]).forEach(function (struct){
            if (struct !== 'info'){
                let info = $(`<div class="infoBox"></div>`);
                content.append(info);
                actionDesc(info, actions.interstellar[region][struct],name);
            }
        });
    });
}

function intergalacticPage(content){
    Object.keys(actions.galaxy).forEach(function (region){        
        let name = typeof actions.galaxy[region].info.name === 'string' ? actions.galaxy[region].info.name : actions.galaxy[region].info.name();
        //let desc = typeof actions.galaxy[region].info.desc === 'string' ? actions.galaxy[region].info.desc : actions.galaxy[region].info.desc();

        Object.keys(actions.galaxy[region]).forEach(function (struct){
            if (struct !== 'info'){
                let info = $(`<div class="infoBox"></div>`);
                content.append(info);
                actionDesc(info, actions.galaxy[region][struct],name);
            }
        });
    });
}

function hellPage(content){
    Object.keys(actions.portal).forEach(function (region){        
        let name = typeof actions.portal[region].info.name === 'string' ? actions.portal[region].info.name : actions.portal[region].info.name();
        //let desc = typeof actions.portal[region].info.desc === 'string' ? actions.portal[region].info.desc : actions.portal[region].info.desc();

        Object.keys(actions.portal[region]).forEach(function (struct){
            if (struct !== 'info'){
                let info = $(`<div class="infoBox"></div>`);
                content.append(info);
                actionDesc(info, actions.portal[region][struct],name);
            }
        });
    });
}
