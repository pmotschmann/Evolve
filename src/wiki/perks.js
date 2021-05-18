import { perkList } from './../achieve.js';
import { sideMenu } from './functions.js';

export function perksPage(content){
    let mainContent = $(`<div></div>`);
    let perkContent = sideMenu('create',mainContent);
    content.append(mainContent);

    Object.keys(perkList).forEach(function (perk){
        perkDesc(perkContent, perk);
        sideMenu('add',`perks-prestige`,`${perk}`,perkList[perk].name);
    });
}

function perkDesc(content, perk){
    let perkbox = $(`<div id="${perk}" class="infoBox"></div>`);
    if (perkList[perk].hasOwnProperty('group')){
        let gperk = $(`<div><div class="has-text-warning">${perkList[perk].name}</div></div>`);
        perkList[perk].group.forEach(function(subperk){
            gperk.append($(`<div class="perk has-text-${subperk.active() ? `success`: `danger`}">${subperk.desc(true)}</div>`));
        });
        perkbox.append(gperk);
    }
    else {
        perkbox.append($(`<div class="has-text-warning">${perkList[perk].name}</div><div class="has-text-${perkList[perk].active() ? `success`: `danger`}">${perkList[perk].desc(true)}</div>`));
    }
    if (perkList[perk].notes.length > 0){
        let notes = $(`<div class="extra"></div>`);
        perkList[perk].notes.forEach(function(note){
            notes.append(`<div>${note}</div>`);
        });
        perkbox.append(notes);
    }
    content.append(perkbox);
}