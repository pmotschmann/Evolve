import { global } from './../vars.js';
import { loc } from './../locale.js';
import { popover } from './../functions.js';
import { actions } from './../actions.js';
import { actionDesc, sideMenu } from './functions.js';

export function renderStructurePage(zone){
    let content = sideMenu('create');

    switch (zone){
        case 'prehistoric':
            prehistoricPage(content);
            break;
        case 'planetary':
            planetaryPage(content);
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

const extraInformation = {
    prehistoric: {},
    planetary: {
        slaughter: [loc(`wiki_structure_planetary_slaughter`)],
    },
    space: {},
    interstellar: {},
    intergalactic: {},
    hell: {},
};

function addInfomration(parent,section,key){
    if (extraInformation[section].hasOwnProperty(key)){
        let extra = $(`<div class="extra"></div>`);
        parent.append(extra);
        for (let i=0; i<extraInformation[section][key].length; i++){
            extra.append(`<div>${extraInformation[section][key][i]}</div>`);
        }
    }
}

function prehistoricPage(content){
    Object.keys(actions.evolution).forEach(function (action){
        if (actions.evolution[action].hasOwnProperty('title') && (action !== 'custom' || global.hasOwnProperty('custom')) && (!actions.evolution[action].hasOwnProperty('wiki') || actions.evolution[action].wiki)){
            let id = actions.evolution[action].id.split('-');
            let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
            content.append(info);
            actionDesc(info, actions.evolution[action]);
            addInfomration(info,'prehistoric',action);
            sideMenu('add',`prehistoric-structures`,id[1],typeof actions.evolution[action].title === 'function' ? actions.evolution[action].title() : actions.evolution[action].title);
        }
    });
}

function planetaryPage(content){
    Object.keys(actions.city).forEach(function (action){
        if (!actions.city[action].hasOwnProperty('wiki') || actions.city[action].wiki){
            let id = actions.city[action].id.split('-');
            let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
            content.append(info);
            actionDesc(info, actions.city[action]);
            addInfomration(info,'planetary',action);
            sideMenu('add',`planetary-structures`,id[1],typeof actions.city[action].title === 'function' ? actions.city[action].title() : actions.city[action].title);
        }
    });
}

function spacePage(content){
    Object.keys(actions.space).forEach(function (region){        
        let name = typeof actions.space[region].info.name === 'string' ? actions.space[region].info.name : actions.space[region].info.name();
        let desc = typeof actions.space[region].info.desc === 'string' ? actions.space[region].info.desc : actions.space[region].info.desc();

        Object.keys(actions.space[region]).forEach(function (struct){
            if (struct !== 'info' && (!actions.space[region][struct].hasOwnProperty('wiki') || actions.space[region][struct].wiki)){
                let id = actions.space[region][struct].id.split('-');
                let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
                content.append(info);
                actionDesc(info, actions.space[region][struct],`<span id="pop${actions.space[region][struct].id}">${name}</span>`);
                addInfomration(info,'space',struct);
                sideMenu('add',`space-structures`,id[1],typeof actions.space[region][struct].title === 'function' ? actions.space[region][struct].title() : actions.space[region][struct].title);
                popover(`pop${actions.space[region][struct].id}`,$(`<div>${desc}</div>`));
            }
        });
    });
}

function interstellarPage(content){
    Object.keys(actions.interstellar).forEach(function (region){        
        let name = typeof actions.interstellar[region].info.name === 'string' ? actions.interstellar[region].info.name : actions.interstellar[region].info.name();
        let desc = typeof actions.interstellar[region].info.desc === 'string' ? actions.interstellar[region].info.desc : actions.interstellar[region].info.desc();

        Object.keys(actions.interstellar[region]).forEach(function (struct){
            if (struct !== 'info' && (!actions.interstellar[region][struct].hasOwnProperty('wiki') || actions.interstellar[region][struct].wiki)){
                let id = actions.interstellar[region][struct].id.split('-');
                let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
                content.append(info);
                actionDesc(info, actions.interstellar[region][struct],`<span id="pop${actions.interstellar[region][struct].id}">${name}</span>`);
                addInfomration(info,'interstellar',struct);
                sideMenu('add',`interstellar-structures`,id[1],typeof actions.interstellar[region][struct].title === 'function' ? actions.interstellar[region][struct].title() : actions.interstellar[region][struct].title);
                popover(`pop${actions.interstellar[region][struct].id}`,$(`<div>${desc}</div>`));
            }
        });
    });
}

function intergalacticPage(content){
    Object.keys(actions.galaxy).forEach(function (region){        
        let name = typeof actions.galaxy[region].info.name === 'string' ? actions.galaxy[region].info.name : actions.galaxy[region].info.name();
        let desc = typeof actions.galaxy[region].info.desc === 'string' ? actions.galaxy[region].info.desc : actions.galaxy[region].info.desc();

        Object.keys(actions.galaxy[region]).forEach(function (struct){
            if (struct !== 'info' && (!actions.galaxy[region][struct].hasOwnProperty('wiki') || actions.galaxy[region][struct].wiki)){
                let id = actions.galaxy[region][struct].id.split('-');
                let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
                content.append(info);
                actionDesc(info, actions.galaxy[region][struct],`<span id="pop${actions.galaxy[region][struct].id}">${name}</span>`);
                addInfomration(info,'intergalactic',struct);
                sideMenu('add',`intergalactic-structures`,id[1],typeof actions.galaxy[region][struct].title === 'function' ? actions.galaxy[region][struct].title() : actions.galaxy[region][struct].title);
                popover(`pop${actions.galaxy[region][struct].id}`,$(`<div>${desc}</div>`));
            }
        });
    });
}

function hellPage(content){
    Object.keys(actions.portal).forEach(function (region){        
        let name = typeof actions.portal[region].info.name === 'string' ? actions.portal[region].info.name : actions.portal[region].info.name();
        let desc = typeof actions.portal[region].info.desc === 'string' ? actions.portal[region].info.desc : actions.portal[region].info.desc();

        Object.keys(actions.portal[region]).forEach(function (struct){
            if (struct !== 'info' && (!actions.portal[region][struct].hasOwnProperty('wiki') || actions.portal[region][struct].wiki)){
                let id = actions.portal[region][struct].id.split('-');
                let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
                content.append(info);
                actionDesc(info, actions.portal[region][struct],`<span id="pop${actions.portal[region][struct].id}">${name}</span>`);
                addInfomration(info,'hell',struct);
                sideMenu('add',`hell-structures`,id[1],typeof actions.portal[region][struct].title === 'function' ? actions.portal[region][struct].title() : actions.portal[region][struct].title);
                popover(`pop${actions.portal[region][struct].id}`,$(`<div>${desc}</div>`));
            }
        });
    });
}
