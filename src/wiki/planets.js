import { global } from './../vars.js';
import { loc } from './../locale.js';
import { planetTraits, biomes } from './../races.js';
import { headerBoxBuilder, infoBoxBuilder } from './functions.js';

export function planetsPage(content) {
    let info = $('<div class="duelList"/>');

    let intro = headerBoxBuilder(content,{ name: 'planet', template: 'planet', paragraphs: 4, full: true,
        para_data: {
            2: [365,'25%'],
            3: [4],
            4: ['200-600']
        }
    });
    infoBoxBuilder(content,{ name: 'geology', template: 'planet', label: loc('wiki_menu_planets'), paragraphs: 4, h_level: 2,
        para_data: {
            2: [2],
            3: ['-10%','+19%'],
            4: [7,'+44%']
        }
    },intro);

    let planetInfo = infoForFeature(biomes, $(`<div class="listSide"><h3 class="header has-text-caution">${loc('wiki_planet_biome')}</h3></div>`));
    let planetTraitsInfo = infoForFeature(planetTraits, $(`<div class="listSide"><h3 class="header has-text-caution">${loc('wiki_planet_trait')}</h3></div>`));
    info.append(planetInfo);
    info.append(planetTraitsInfo);
    content.append(info);
}

const extraInfo = {
    oceanic: ['trait','genus'],
    forest: ['genus'],
    desert: ['trait','genus'],
    volcanic: ['weather','genus'],
    tundra: ['weather','genus'],
    hellscape: ['weather','genus','universe'],
    eden: ['geology', 'genus','universe'],
    stormy: ['trait'],
    ozone: ['trait'],
    trashed: ['trait'],
    elliptical: ['trait'],
    unstable: ['trait']
};

function infoForFeature(planetFeatures, content) {
    Object.keys(planetFeatures).forEach(function (planetFeatureName) {
        let planetFeature = planetFeatures[planetFeatureName];
        let info = $(`<div id="${planetFeatureName}" class="infoBox"></div>`);
        content.append(info);

        info.append(`<div class="type"><h4 class="has-text-caution">${planetFeature.label}</h4></div>`);
        info.append(`<div class="desc">${planetFeature.desc}</div>`);

        let modifiers = $(`<div class="propList"></div>`);
        if (planetFeature['vars'] && planetFeature['wiki']) {
            for (let i=0; i<planetFeature['vars'].length; i++){
                let type = planetFeature.wiki[i] === '%' ? 'percent' : (planetFeature.wiki[i] === '-%' ? 'inverted' : 'decimal');
                modifiers.append($(`<div class="has-text-label">${loc(`wiki_planet_${planetFeatureName}${i}`,[formatBonusNumber(planetFeature.vars[i], type)])}</div>`));
            }
        }
        info.append(modifiers);

        if (extraInfo[planetFeatureName]){
            extraInfo[planetFeatureName].forEach(function (label){
                info.append($(`<div class="has-text-warning">${loc(`wiki_planet_${planetFeatureName}_${label}`)}</div>`));
            });
        }
    });
    return content;
}

export function formatBonusNumber(num, style) {
    let modRes = num - 1 * (style === 'percent' || style === 'inverted' ? 1 : 0);
    if (style === 'inverted'){
        modRes *= -1;
        style = 'percent';
    }
    let modResText = (modRes >= 0 ? '+' : '') + modRes.toLocaleString(global.settings.locale, { style: style, maximumFractionDigits: 2 });
    let textColor = modRes >= 0 ? 'success' : 'danger';
    let modResTextColored = `<span class="has-text-${textColor}">${modResText}</span>`;
    return modResTextColored;
}