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
            let itemMod = $(`<div></div>`);
            if (planetFeature['bonuses'] && planetFeature['bonuses'][bonus]) {
                formatBonus(planetFeature['bonuses'], bonus, 'percent', itemMod);
            }

            if (planetFeature['bonuses_base'] && planetFeature['bonuses_base'][bonus]) {
                formatBonus(planetFeature['bonuses_base'], bonus, 'decimal', itemMod);
            }
            modifiers.append(itemMod);
        });

        info.append(modifiers);
    });
    return content;
}


function formatBonus(source, subject, style, targetElm) {
    let resourceProduction = source[subject];
    if (subject == 'default') {
        let infoDefault = $(`<span>${formatBonusNumber(resourceProduction, style)}</span>`);
        return infoDefault;
    }
    else if (typeof (resourceProduction) == 'number') {
        let subLocStr = subjectToLocStr(subject);
        let resourceName = $(`<span>${subLocStr}</span>`);
        let resourceValue = $(`<span>${formatBonusNumber(resourceProduction, style)}</span>`);
        targetElm.append(resourceName);
        targetElm.append(resourceValue);
    }
    else {
        let subjectLocStr = subjectToLocStr(subject);
        let summaryTopContainer = $(`<span>${subjectLocStr}</span>`);
        let infoSummary = $(`<ul class='infoSummary'/>`);
        infoSummary.append(summaryTopContainer);
        targetElm.append(infoSummary);
        Object.keys(resourceProduction).forEach(function (subject) {
            let destElm = $('<li/>');
            let defaultValue = formatBonus(resourceProduction, subject, style, destElm);
            if (defaultValue !== undefined) {
                summaryTopContainer.append(defaultValue);
            }
            else {
                infoSummary.append(destElm);
            }
        });
    }
    //Object.keys(bonusSources).forEach(function (bonusSource) {
    //    if (typeof (bonusSources[bonusSource]) != 'number') {
    //        let infoHeader = $('<div/>');
    //        let subjectLocStr = subjectToLocStr(bonusSource);
    //        let infoSummary = $(`<ul class='infoSummary'>${subjectLocStr}</ul>`);
    //        infoHeader.append(infoSummary);
    //        Object.keys(bonusSources[bonusSource]).forEach(function (subject) {
    //            let infoDetails;
    //            let resourceProduction = bonusSources[bonusSource][subject];
    //            if (subject == 'default') {
    //                let infoDefault = $(`<span>${formatBonusNumber(resourceProduction, style)}</span>`);
    //                infoHeader.append(infoDefault);
    //            }
    //            else if (typeof (resourceProduction) == 'number') {
    //                let subjectLocStr = subjectToLocStr(subject);
    //                infoDetails = $(`<li/>`);
    //                let resourceName = $(`<span>${subjectLocStr}</span>`);
    //                infoDetails.append(resourceName);
    //                let resourceValue = $(`${formatBonusNumber(resourceProduction, style)}`);
    //                infoDetails.append(resourceValue);
    //            }
    //            else {
    //                let subjectLocStr = subjectToLocStr(subject);
    //                infoDetails = $('<li/>');
    //                let infoDetailsSubItems = $(`<ul class='infoSummary'>${subjectLocStr}</ul>`);
    //                infoDetails.append(infoDetailsSubItems);
    //                infoHeader.append(infoDetails);
    //                Object.keys(resourceProduction).forEach(function (restrictedTo) {
    //                    let innerSubjectLocStr = subjectToLocStr(restrictedTo);
    //                    let row = $(`<li/>`);
    //                    let resourceName = $(`<span>${innerSubjectLocStr}</span>`);
    //                    let resourceValue = $(`<span>${formatBonusNumber(resourceProduction[restrictedTo], style)}</span>`);
    //                    row.append(resourceName);
    //                    row.append(resourceValue);
    //                    infoDetailsSubItems.append(row);
    //                });
    //            }
    //            infoHeader.append(infoDetails);
    //        });
    //        features.push(infoHeader);
    //    }
    //    else {
    //        let descTable = $(`<div class='atable' />`);
    //        let subjectLocStr = subjectToLocStr(bonusSource);
    //        let desc = $(`<span>${subjectLocStr}</span>${formatBonusNumber(bonusSources[bonusSource], style)}`);
    //        descTable.append(desc);
    //        features.push(descTable);
    //    }
    //});
    //return content;
}

function subjectToLocStr(subject) {
    let subjectLocStr;
    switch (subject) {
        case 'soldiers':
            subjectLocStr = loc('soldiers');
            break;
        case 'production':
            subjectLocStr = loc('wiki_global_production');
            break;
        case 'stress_level':
            subjectLocStr = loc('wiki_stress_level');
            break;
        case 'birth_rate':
            subjectLocStr = loc('wiki_birth_rate');
            break;
        case 'sundial':
            subjectLocStr = loc('tech_sundial');
            break;
        case 'genome_sequence':
            subjectLocStr = loc('arpa_sequence_genome');
            break;
        default:
            if (subject == 'hunter' || job_desc[subject] !== undefined) {
                subjectLocStr = loc(`job_${subject}`);
            }
            else if (resource_values[subject] !== undefined) {
                subjectLocStr = loc(`resource_${subject}_name`);
            }
            else if (actions.city[subject] !== undefined) {
                let title = actions.city[subject].title;
                if (typeof(title) == 'function') {
                    title = title();
                }
                subjectLocStr = title;
            }
            else {
                console.log("Wiki planets missing localization mapping for: " + subject);
                subjectLocStr = subject;
            }
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