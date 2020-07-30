import { global } from './../vars.js';
import { loc } from './../locale.js';
import { planetTraits, biomes } from './../races.js';
import { headerBoxBuilder } from './functions.js';

export function planetsPage(content) {
    let info = $('<div class="duelList"/>');

    headerBoxBuilder(content,'planet','planet',4,2,true);

    let planetInfo = infoForFeature(biomes, $(`<div class="listSide"><h3 class="header has-text-caution">${loc('wiki_planet_biome')}</h3></div>`));
    let planetTraitsInfo = infoForFeature(planetTraits, $(`<div class="listSide"><h3 class="header has-text-caution">${loc('wiki_planet_trait')}</h3></div>`));
    info.append(planetInfo);
    info.append(planetTraitsInfo);
    content.append(info);
}

const extraInfo = {
    oceanic: ['genus'],
    forest: ['genus'],
    desert: ['genus'],
    volcanic: ['weather','genus'],
    tundra: ['weather','genus'],
    hellscape: ['genus'],
    eden: ['genus']
};

function infoForFeature(planetFeatures, content) {
    Object.keys(planetFeatures).forEach(function (planetFeatureName) {
        let planetFeature = planetFeatures[planetFeatureName];
        let info = $(`<div id="${planetFeatureName}" class="infoBox"></div>`);
        content.append(info);

        info.append(`<div class="type"><h4 class="has-text-warning">${planetFeature.label}</h4></div>`);
        info.append(`<div class="desc">${planetFeature.desc}</div>`);

        let itemMod = $(`<div></div>`);
        if (planetFeature['vars'] && planetFeature['wiki']) {
            for (let i=0; i<planetFeature['vars'].length; i++){
                itemMod.append($(`<span>${loc(`wiki_planet_${planetFeatureName}${i}`,[formatBonusNumber(planetFeature.vars[i], planetFeature.wiki[i] === '%' ? 'percent' : 'decimal')])}</span>`));
            }
        }

        let modifiers = $(`<div class="itemlist"></div>`);
        modifiers.append(itemMod);
        info.append(modifiers);

        if (extraInfo[planetFeatureName]){
            extraInfo[planetFeatureName].forEach(function (label){
                info.append($(`<div>${loc(`wiki_planet_${planetFeatureName}_${label}`)}</div>`));
            });
        }
    });
    return content;
}

export function formatBonusNumber(num, style) {
    let modRes = num - 1 * (style == 'percent' ? 1 : 0);
    let modResText = (modRes >= 0 ? '+' : '') + modRes.toLocaleString(global.settings.locale, { style: style, maximumFractionDigits: 2 });
    let textColor = modRes >= 0 ? 'success' : 'danger';
    let modResTextColored = `<span class="has-text-${textColor}">${modResText}<span>`;
    return modResTextColored;
}