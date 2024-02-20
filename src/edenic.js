import { global, seededRandom, keyMultiplier, p_on, quantum_level, sizeApproximation } from './vars.js';
import { vBind, clearElement, popover, clearPopper, timeFormat, powerCostMod, spaceCostMultiplier, messageQueue, powerModifier } from './functions.js';
import { spatialReasoning } from './resources.js';
import { payCosts, powerOnNewStruct, setAction, drawTech, bank_vault, updateDesc } from './actions.js';
import { checkRequirements, incrementStruct} from './space.js';
import { jobScale } from './jobs.js';
import { production } from './prod.js';
import { loc } from './locale.js';

const edenicModules = {
    eden_asphodel: {
        info: {
            name: loc('eden_asphodel_name'),
            desc(){ return `${loc('eden_asphodel_desc')} ${loc('eden_asohodel_desc_peaceful')}`; },
            support: 'encampment'
        },
        survery_meadows: {
            id: 'eden-survery_meadows',
            title(){
                return loc('eden_survery_meadows_title');
            },
            desc(){
                return $(this)[0].title();
            },
            reqs: { edenic: 3 },
            grant: ['edenic',4],
            queue_complete(){ return global.tech.edenic >= 4 ? 0 : 1; },
            cost: {
                Oil(offset,wiki){ return 10000000; }
            },
            effect(){
                return loc('eden_survery_meadows_effect');
            },
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('eden_survery_meadows_action'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        encampment: {
            id: 'eden-encampment',
            title: loc('eden_encampment_title'),
            desc(){ return `<div>${loc('eden_encampment_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            reqs: { edenic: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('encampment', offset, 1590000000, 1.235, 'eden'); },
                Lumber(offset){ return spaceCostMultiplier('encampment', offset, 860000000, 1.235, 'eden'); },
            },
            effect(){
                let desc = `<div>${loc('eden_encampment_effect',[$(this)[0].support()])}</div>`;
                
                if (global.tech.hasOwnProperty('asphodel') && global.tech.asphodel >= 1){
                    let powder = spatialReasoning(250);
                    desc += `<div>${loc('plus_max_resource',[powder,loc('resource_Asphodel_Powder_name')])}</div>`;
                }

                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;

                return desc;
            },
            support(){ return 10; },
            powered(){ return powerCostMod(616); },
            powerBalancer(){
                return [{ s: global.eden.encampment.s_max - global.eden.encampment.support }];
            },
            refresh: true,
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('encampment','eden');
                    global['resource']['Asphodel_Powder'].max += spatialReasoning(250);
                    return true;
                }
                return false;
            }
        },
        asphodel_harvester: {
            id: 'eden-asphodel_harvester',
            title: loc('eden_asphodel_harvester_title'),
            desc: `<div>${loc('eden_asphodel_harvester_title')}</div><div class="has-text-special">${loc('space_support',[loc('eden_asphodel_name')])}</div>`,
            reqs: { asphodel: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('asphodel_harvester', offset, 34280000, 1.24, 'eden'); },
            },
            effect(){
                let powder = +(production('asphodel_harvester','powder')).toFixed(3);
                return `<div class="has-text-caution">${loc('space_used_support',[loc('eden_asphodel_name')])}</div><div>${loc('produce',[powder, global.resource.Asphodel_Powder.name])}</div>`;
            },
            s_type: 'asphodel',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('asphodel_harvester','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            }
        },
        ectoplasm_processor: {
            id: 'eden-ectoplasm_processor',
            title: loc('eden_ectoplasm_processor_title'),
            desc: `<div>${loc('eden_ectoplasm_processor_title')}</div><div class="has-text-special">${loc('space_support',[loc('eden_asphodel_name')])}</div>`,
            reqs: { asphodel: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('ectoplasm_processor', offset, 22650000, 1.24, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('ectoplasm_processor', offset, 1000, 1.24, 'eden'); },
            },
            effect(){
                return `<div class="has-text-caution">${loc('space_used_support',[loc('eden_asphodel_name')])}</div><div>${loc('eden_ectoplasm_processor_effect',[jobScale(5)])}</div>`;
            },
            s_type: 'asphodel',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('ectoplasm_processor','eden');
                    powerOnNewStruct($(this)[0]);
                    global.civic.ghost_trapper.display = true;
                    return true;
                }
                return false;
            }
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
