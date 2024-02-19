import { global, seededRandom, keyMultiplier, p_on, quantum_level, sizeApproximation } from './vars.js';
import { vBind, clearElement, popover, clearPopper, timeFormat, powerCostMod, spaceCostMultiplier, messageQueue, powerModifier, calcPillar, deepClone, popCost, calcPrestige } from './functions.js';
import { unlockAchieve, alevel, universeAffix } from './achieve.js';
import { traits, races, fathomCheck } from './races.js';
import { defineResources, spatialReasoning } from './resources.js';
import { loadFoundry, jobScale, limitCraftsmen } from './jobs.js';
import { armyRating, govCivics, garrisonSize, mercCost } from './civics.js';
import { payCosts, powerOnNewStruct, setAction, drawTech, bank_vault, updateDesc } from './actions.js';
import { checkRequirements} from './space.js';
import { loc } from './locale.js';

const edenicModules = {
    eden_asphodel: {
        info: {
            name: loc('eden_asphodel_name'),
            desc: loc('eden_asphodel_desc'),
        },
    },
    eden_elysium: {
        info: {
            name: loc('eden_elysium_name'),
            desc: loc('eden_elysium_desc'),
        },
    },
    eden_isle: {
        info: {
            name: loc('eden_isle_name'),
            desc: loc('eden_isle_desc'),
        },
    },
    eden_palace: {
        info: {
            name: loc('eden_palace_name'),
            desc: loc('eden_palace_desc'),
        },
    }
};

export function edenicTech(){
    return edenicModules;
}

export function renderEdenic(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 7)){
        return;
    }
    let parent = $('#eden');
    clearElement(parent);
    parent.append($(`<h2 class="is-sr-only">${loc('tab_eden')}</h2>`));
    if (!global.tech['edenic'] || global.tech.edenic < 3){
        return;
    }

    Object.keys(edenicModules).forEach(function (region){
        let show = region.replace("eden_","");
        if (global.settings.eden[`${show}`]){
            let name = typeof edenicModules[region].info.name === 'string' ? edenicModules[region].info.name : edenicModules[region].info.name();
            
            let property = ``;
            if (edenicModules[region].info.hasOwnProperty('prop')){
                property = edenicModules[region].info.prop();
            }

            if (edenicModules[region].info['support']){
                let support = edenicModules[region].info['support'];
                if (edenicModules[region].info['hide_support']){
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3>${property}</div></div>`);
                }
                else {
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3> <span v-show="s_max">{{ support }}/{{ s_max }}</span>${property}</div></div>`);
                }
                vBind({
                    el: `#sr${region}`,
                    data: global.eden[support],
                    filters: {
                        filter(){
                            return edenicModules[region].info.filter(...arguments);
                        }
                    }
                });
            }
            else {
                parent.append(`<div id="${region}" class="space"><div><h3 class="name has-text-warning">${name}</h3>${property}</div></div>`);
            }

            popover(region, function(){
                    return typeof edenicModules[region].info.desc === 'string' ? edenicModules[region].info.desc : edenicModules[region].info.desc();
                },
                {
                    elm: `#${region} h3.name`,
                    classes: `has-background-light has-text-dark`
                }
            );

            Object.keys(edenicModules[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(edenicModules,region,tech)){
                    let c_action = edenicModules[region][tech];
                    setAction(c_action,'eden',tech);
                }
            });
        }
    });
}
