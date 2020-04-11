import { global } from './../vars.js';
import { loc } from './../locale.js';
import { clearElement, svgIcons, svgViewBox, format_emblem, getBaseIcon, sLevel } from './../functions.js';
import { achievements, feats } from './../achieve.js';
import { popover } from './functions.js';

export function renderAchievePage(zone){
    let content = $(`#content`);
    clearElement(content);

    switch (zone){
        case 'list':
            achievePage(content);
            break;
        case 'feats':
            featPage(content);
            break;
    }
}

function achievePage(){
    let content = $(`#content`);
    clearElement(content);

    Object.keys(achievements).forEach(function (achievement){
        let achieve = $(`<div class="achievement"></div>`);
        content.append(achieve);

        let color = global.stats.achieve[achievement] && global.stats.achieve[achievement].l > 0 ? 'warning' : 'fade';
        achieve.append(`<span id="a-${achievement}" class="achieve has-text-${color}">${achievements[achievement].name}</span>`);

        let emblems = format_emblem(achievement,16,'star');
        achieve.append(`<span class="icons">${emblems}</span>`);
        
        popover(`a-${achievement}`,$(`<div>${achievements[achievement].desc}</div>`));
    });
}

function featPage(){
    let content = $(`#content`);
    clearElement(content);

    Object.keys(feats).forEach(function (feat){
        let achieve = $(`<div class="achievement"></div>`);
        content.append(achieve);

        let color = global.stats.feat[feat] && global.stats.feat[feat] > 0 ? 'warning' : 'fade';
        let baseIcon = getBaseIcon(feat,'feat');
        let star = global.stats.feat[feat] > 1 ? `<p class="flair" title="${sLevel(global.stats.feat[feat])} ${loc(baseIcon)}"><svg class="star${global.stats.feat[feat]}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox(baseIcon)}" xml:space="preserve">${svgIcons(baseIcon)}</svg></p>` : '';
        achieve.append(`<span id="f-${feat}" class="achieve has-text-${color}">${feats[feat].name}</span>${star}`);
        
        popover(`f-${feat}`,$(`<div>${feats[feat].desc}</div>`));
    });
}