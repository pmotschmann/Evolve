import { global } from './../vars.js';
import { loc } from './../locale.js';
import { planetTraits, biomes } from './../races.js';
import { job_desc } from './../jobs.js';
import { resource_values } from '../resources.js';
import { actions } from './../actions.js'

export function planetsPage(content) {
    let info = $('<div class="planetList"/>');
    let planetInfo = infoForFeature(biomes, $('<div class="featureList">Planet Biome</div>'));
    let planetTraitsInfo = infoForFeature(planetTraits, $('<div class="featureList">Planet Feature</div>'));
    info.append(planetInfo);
    info.append(planetTraitsInfo);
    content.append(info);
}

function infoForFeature(planetFeatures, content) {
    Object.keys(planetFeatures).forEach(function (planetFeatureName) {
        let planetFeature = planetFeatures[planetFeatureName];
        let info = $(`<div id="${planetFeatureName}" class="infoBox"></div>`);
        content.append(info);

        info.append(`<div class="type"><h2 class="has-text-warning">${planetFeature.label}</h2></div>`);
        info.append(`<div class="desc">${planetFeature.desc}</div>`);

        let bonuses = [];
        if (planetFeature['bonuses']) {
            bonuses.push(...Object.keys(planetFeature['bonuses']));
        }
        if (planetFeature['bonuses_base']) {
            bonuses.push(...Object.keys(planetFeature['bonuses_base']));
        }
        let modifiers = $(`<div class="itemlist"></div>`);

        bonuses.sort().forEach(function (bonus) {
            let features = []
            let isTerminal = bonus == 'soldiers' || bonus == 'stress_level';
            if (planetFeature['bonuses'] && planetFeature['bonuses'][bonus]) {
                formatBonus(planetFeature['bonuses'], isTerminal, bonus, 'percent', features);
            }

            if (planetFeature['bonuses_base'] && planetFeature['bonuses_base'][bonus]) {
                formatBonus(planetFeature['bonuses_base'], isTerminal, bonus,  'decimal', features);
            }
            let itemMod = $(`<div></div>`)
            features.forEach(function (feature) {
                itemMod.append(feature);
            });
            modifiers.append(itemMod);
        });

        info.append(modifiers);
    });
    return content;
}


function formatBonus(source, isTerminal, bonus, style, features) {
    let bonusSources;
    if (isTerminal) {
        bonusSources = [];
        bonusSources[bonus] = source[bonus];
    }
    else {
        bonusSources = source[bonus];
    }
    Object.keys(bonusSources).forEach(function (bonusSource) {
        if (typeof (bonusSources[bonusSource]) != 'number') {
            let infoHeader = $('<div/>');
            let subjectLocStr = subjectToLocStr(bonusSource);
            let infoSummary = $(`<ul class='infoSummary'>${subjectLocStr}</ul>`);
            infoHeader.append(infoSummary);
            Object.keys(bonusSources[bonusSource]).forEach(function (subject) {
                let infoDetails;
                let resourceProduction = bonusSources[bonusSource][subject];
                if (subject == 'default') {
                    let infoDefault = $(`<span>${formatBonusNumber(resourceProduction, style)}</span>`);
                    infoHeader.append(infoDefault);
                }
                else if (typeof (resourceProduction) == 'number') {
                    let subjectLocStr = subjectToLocStr(subject);
                    infoDetails = $(`<li/>`);
                    let resourceName = $(`<span>${subjectLocStr}</span>`);
                    infoDetails.append(resourceName);
                    let resourceValue = $(`${formatBonusNumber(resourceProduction, style)}`);
                    infoDetails.append(resourceValue);
                }
                else {
                    let subjectLocStr = subjectToLocStr(subject);
                    infoDetails = $('<li/>');
                    let infoDetailsSubItems = $(`<ul class='infoSummary'>${subjectLocStr}</ul>`);
                    infoDetails.append(infoDetailsSubItems);
                    infoHeader.append(infoDetails);
                    Object.keys(resourceProduction).forEach(function (restrictedTo) {
                        let innerSubjectLocStr = subjectToLocStr(restrictedTo);
                        let row = $(`<li/>`);
                        let resourceName = $(`<span>${innerSubjectLocStr}</span>`);
                        let resourceValue = $(`<span>${formatBonusNumber(resourceProduction[restrictedTo], style)}</span>`);
                        row.append(resourceName);
                        row.append(resourceValue);
                        infoDetailsSubItems.append(row);
                    });
                }
                infoHeader.append(infoDetails);
            });
            features.push(infoHeader);
        }
        else {
            let descTable = $(`<div class='atable' />`);
            let desc = $(`<span>${loc(bonus + (isTerminal ? '' : '_' + bonusSource))}</span>${formatBonusNumber(bonusSources[bonusSource], style)}`);
            descTable.append(desc);
            features.push(descTable);
        }
    });
    return content;
}

function subjectToLocStr(subject) {
    let subjectLocStr;
    if (subject == 'hunter' || job_desc[subject] !== undefined) {
        subjectLocStr = loc(`job_${subject}`);
    }
    else if (resource_values[subject] !== undefined) {
        subjectLocStr = loc(`resource_${subject}_name`);
    }
    else if (subject == 'soldiers') {
        subjectLocStr = loc(subject);
    }
    else if (subject == 'stress_level') {
        subjectLocStr = loc('wiki_stress_level');
    }
    else if (actions.city[subject] !== undefined) {
        subjectLocStr = loc(`city_${subject}`);
    }
    else {
        console.log(subject);
    }
    return subjectLocStr;
}

export function formatBonusNumber(num, style) {
    let modRes = num - 1 * (style == 'percent' ? 1 : 0);
    let modResText = (modRes >= 0 ? '+' : '') + modRes.toLocaleString(global.settings.locale, { style: style, maximumFractionDigits: 2 });
    let textColor = modRes >= 0 ? 'success' : 'danger';
    let modResTextColored = `<span class="has-text-${textColor}">${modResText}<span>`;
    return modResTextColored;
}