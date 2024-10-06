import { global, p_on, sizeApproximation, seededRandom } from './vars.js';
import { vBind, clearElement, popover, powerCostMod, spaceCostMultiplier, messageQueue, powerModifier } from './functions.js';
import { spatialReasoning } from './resources.js';
import { payCosts, powerOnNewStruct, setAction, storageMultipler, drawTech } from './actions.js';
import { checkRequirements, incrementStruct, piracy} from './space.js';
import { mechRating } from './portal.js';
import { actions } from './actions.js';
import { jobScale } from './jobs.js';
import { production, highPopAdjust } from './prod.js';
import { loc } from './locale.js';
import { armyRating, armorCalc, garrisonSize, mercCost } from './civics.js';
import { govActive } from './governor.js';

const edenicModules = {
    eden_asphodel: {
        info: {
            name: loc('eden_asphodel_name'),
            desc(){ 
                if (global.tech['asphodel'] && global.tech.asphodel >= 5){
                    return `${loc('eden_asphodel_desc')} ${loc('eden_asphodel_desc_hostile')}`;
                }
                else {
                    return `${loc('eden_asphodel_desc')} ${loc('eden_asphodel_desc_peaceful')}`;
                }
            },
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
                Iron(offset){ return spaceCostMultiplier('encampment', offset, 190000000, 1.235, 'eden'); },
                Coal(offset){ return spaceCostMultiplier('encampment', offset, 23500000, 1.235, 'eden'); },
            },
            effect(){
                let desc = `<div>${loc('eden_encampment_effect',[$(this)[0].support()])}</div>`;
                
                if (global.tech.hasOwnProperty('asphodel') && global.tech.asphodel >= 1){
                    let powder = spatialReasoning(250);
                    desc += `<div>${loc('plus_max_resource',[powder,loc('resource_Asphodel_Powder_name')])}</div>`;
                }

                if (p_on['ascension_trigger'] && global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
                    let heatSink = actions.interstellar.int_sirius.ascension_trigger.heatSink();
                    heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;
                    let omniscience = 150 + (heatSink / 10);

                    desc += `<div>${loc('plus_max_resource',[+omniscience.toFixed(0),global.resource.Omniscience.name])}</div>`;
                }

                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;

                return desc;
            },
            support(){ return 8; },
            powered(){ return powerCostMod(616); },
            /*powerBalancer(){
                return [{ s: global.eden.encampment.s_max - global.eden.encampment.support }];
            },*/
            refresh: true,
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('encampment','eden');
                    powerOnNewStruct($(this)[0]);
                    global['resource']['Asphodel_Powder'].max += spatialReasoning(250);
                    return true;
                }
                return false;
            }
        },
        soul_engine: {
            id: 'eden-soul_engine',
            title: loc('eden_soul_engine_title'),
            desc: `<div>${loc('eden_soul_engine_title')}</div><div class="has-text-special">${loc('space_support',[loc('eden_asphodel_name')])}</div>`,
            reqs: { asphodel: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('soul_engine', offset, 98312500, 1.235, 'eden'); },
                Neutronium(offset){ return spaceCostMultiplier('soul_engine', offset, 4500000, 1.235, 'eden'); },
                Orichalcum(offset){ return spaceCostMultiplier('soul_engine', offset, 37500000, 1.235, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('soul_engine', offset, 3450, 1.235, 'eden'); }
            },
            effect(){
                return `<div class="has-text-caution">${loc('space_used_support',[loc('eden_asphodel_name')])}</div><div>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered())])}</div>`;
            },
            s_type: 'asphodel',
            support(){ return -1; },
            powered(){ return powerModifier(-375); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('soul_engine','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
        },
        mech_station: {
            id: 'eden-mech_station',
            title: loc('eden_mech_station_title'),
            desc(wiki){
                if (!global.eden.hasOwnProperty('mech_station') || global.eden.mech_station.count < 10 || wiki){
                    return `<div>${loc('eden_mech_station_title')}</div><div class="has-text-special">${loc('requires_segments',[10])}</div>`;
                }
                else {
                    return `<div>${loc('eden_mech_station_title')}</div>`;
                }
            },
            reqs: { asphodel: 6 },
            queue_size: 1,
            queue_complete(){ return 10 - global.eden.mech_station.count; },
            cost: {
                Money(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('mech_station') ? global.eden.mech_station.count : 0) < 10 ? 6750000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('mech_station') || (global.eden.mech_station.count < 10) ? 6750000000 : 0;
                },
                Graphene(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('mech_station') ? global.eden.mech_station.count : 0) < 10 ? 82500000 : 0;
                    }
                    return !global.eden.hasOwnProperty('mech_station') || (global.eden.mech_station.count < 10) ? 82500000 : 0;
                },
                Infernite(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('mech_station') ? global.eden.mech_station.count : 0) < 10 ? 7500000 : 0;
                    }
                    return !global.eden.hasOwnProperty('mech_station') || (global.eden.mech_station.count < 10) ? 7500000 : 0;
                },
                Vitreloy(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('mech_station') ? global.eden.mech_station.count : 0) < 10 ? 66600000 : 0;
                    }
                    return !global.eden.hasOwnProperty('mech_station') || (global.eden.mech_station.count < 10) ? 66600000 : 0;
                },
                Asphodel_Powder(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('mech_station') ? global.eden.mech_station.count : 0) < 10 ? 7500 : 0;
                    }
                    return !global.eden.hasOwnProperty('mech_station') || (global.eden.mech_station.count < 10) ? 7500 : 0;
                },
            },
            effect(wiki){
                let count = (wiki || 0) + (global.eden.hasOwnProperty('mech_station') ? global.eden.mech_station.count : 0);
                if (count >= 10){
                    let desc = `<div>${loc('eden_mech_station_effect')}</div>`;
                    desc += `<div>${loc('eden_mech_station_mechs',[global.eden.mech_station.mechs])}</div>`;
                    desc += `<div>${loc('eden_mech_station_effective',[global.eden.mech_station.effect])}</div>`;
                    return desc;
                }
                else {
                    let size = 10;
                    let remain = size - count;
                    return `<div>${loc('eden_mech_station_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            special(){ return global.eden.hasOwnProperty('mech_station') && global.eden.mech_station.count === 10 ? true : false; },
            action(){
                if (global.eden.mech_station.count < 10 && payCosts($(this)[0])){
                    incrementStruct('mech_station','eden');
                    if (global.eden.mech_station.count === 10){
                        renderEdenic();
                    }
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
                Aluminium(offset){ return spaceCostMultiplier('asphodel_harvester', offset, 22288800, 1.24, 'eden'); },
                Infernite(offset){ return spaceCostMultiplier('asphodel_harvester', offset, 666999, 1.24, 'eden'); },
                Soul_Gem(offset){ return spaceCostMultiplier('asphodel_harvester', offset, 2, 1.18, 'eden'); },
            },
            effect(){
                let powder = +(production('asphodel_harvester','powder')).toFixed(3);
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('eden_asphodel_name')])}</div><div>${loc('produce',[powder, global.resource.Asphodel_Powder.name])}</div>`;

                if (global.tech['hell_spire'] && global.tech.hell_spire >= 11){
                    desc += `<div>${loc('eden_asphodel_harvester_upgrade',[2])}</div>`;
                }

                return desc;
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
                Titanium(offset){ return spaceCostMultiplier('ectoplasm_processor', offset, 15000000, 1.24, 'eden'); },
                Stanene(offset){ return spaceCostMultiplier('ectoplasm_processor', offset, 18000000, 1.24, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('ectoplasm_processor', offset, 1000, 1.24, 'eden'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('eden_asphodel_name')])}</div>`;
                desc += `<div>${loc('plus_max_resource',[jobScale(5),loc(`job_ghost_trapper`)])}</div>`;
                return desc;
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
            },
            flair(){ return loc('eden_ectoplasm_processor_flair'); }
        },
        research_station: {
            id: 'eden-research_station',
            title: loc('eden_research_station_title'),
            desc: `<div>${loc('eden_research_station_title')}</div><div class="has-text-special">${loc('space_support',[loc('eden_asphodel_name')])}</div>`,
            reqs: { asphodel: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('research_station', offset, 39185000, 1.24, 'eden'); },
                Cement(offset){ return spaceCostMultiplier('research_station', offset, 100000000, 1.24, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('research_station', offset, 1250, 1.24, 'eden'); },
                Soul_Gem(offset){ return spaceCostMultiplier('research_station', offset, 10, 1.12, 'eden'); },
            },
            effect(){
                let attact = global.blood['attract'] ? global.blood.attract * 5 : 0;
                let souls = 200 + attact;
                if (global.tech['science'] && global.tech.science >= 22 && p_on['embassy'] && p_on['symposium']){
                    souls *= 1 + (p_on['symposium'] * piracy('gxy_gorddon'));
                }
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('eden_asphodel_name')])}</div>`;
                desc += `<div>${loc('eden_research_station_effect',[highPopAdjust(souls).toFixed(0), loc('job_ghost_trapper')])}</div>`;
                if (global.tech['science'] && global.tech.science >= 22){
                    desc += `<div>${loc('plus_max_resource',[777,global.resource.Omniscience.name])}</div>`;
                }
                return desc;
            },
            s_type: 'asphodel',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('research_station','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
        },
        warehouse: {
            id: 'eden-warehouse',
            title(){
                return global.tech['storage'] <= 2 ? loc('city_shed_title1') : (global.tech['storage'] >= 4 ? loc('city_shed_title3') : loc('city_shed_title2'));
            },
            desc(){
                let storage = global.tech['storage'] >= 3 ? (global.tech['storage'] >= 4 ? loc('city_shed_desc_size3') : loc('city_shed_desc_size2')) : loc('city_shed_desc_size1');
                return loc('city_shed_desc',[storage]);
            },
            reqs: { asphodel: 7 },
            cost: {
                Money(offset){ return spaceCostMultiplier('warehouse', offset, 300000000, 1.28, 'eden'); },
                Steel(offset){ return spaceCostMultiplier('warehouse', offset, 15000000, 1.28, 'eden'); },
                Alloy(offset){ return spaceCostMultiplier('warehouse', offset, 18000000, 1.28, 'eden'); },
                Cement(offset){ return spaceCostMultiplier('warehouse', offset, 27500000, 1.28, 'eden'); }
            },
            res(){
                let r_list = [
                    'Lumber','Stone','Chrysotile','Furs','Copper','Iron','Aluminium','Cement','Coal',
                    'Nano_Tube','Neutronium','Adamantite','Infernite','Alloy','Polymer','Iridium',
                    'Graphene','Stanene','Bolognium','Orichalcum','Asphodel_Powder'
                ];
                if (global.tech['storage'] >= 3 && global.resource.Steel.display){
                    r_list.push('Steel');
                }
                if (global.tech['storage'] >= 4 && global.resource.Titanium.display){
                    r_list.push('Titanium');
                }
                return r_list;
            },
            val(res){
                switch (res){
                    case 'Lumber':
                        return 3750
                    case 'Stone':
                        return 3750;
                    case 'Chrysotile':
                        return 3750;
                    case 'Furs':
                        return 2125;
                    case 'Copper':
                        return 1900;
                    case 'Iron':
                        return 1750;
                    case 'Aluminium':
                        return 1600;
                    case 'Cement':
                        return 1400;
                    case 'Coal':
                        return 600;
                    case 'Steel':
                        return 300;
                    case 'Titanium':
                        return 200;
                    case 'Nano_Tube':
                        return 150;
                    case 'Neutronium':
                        return 40;
                    case 'Adamantite':
                        return 90;
                    case 'Infernite':
                        return 18;
                    case 'Alloy':
                        return 250;
                    case 'Polymer':
                        return 250;
                    case 'Iridium':
                        return 225;
                    case 'Graphene':
                        return 175;
                    case 'Stanene':
                        return 175;
                    case 'Bolognium':
                        return 45;
                    case 'Orichalcum':
                        return 22;
                    case 'Asphodel_Powder':
                        return global.eden['stabilizer'] ? 0.1 + (global.eden.stabilizer.count * 0.015) : 0.1;
                    default:
                        return 0;
                }
            },
            wide: true,
            effect(){
                let storage = '<div class="aTable">';
                let multiplier = storageMultipler(0.2);
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let val = sizeApproximation(+(spatialReasoning(+($(this)[0].val(res) * multiplier)).toFixed(0)));
                        storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                storage = storage + '</div>';
                return storage;
            },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('warehouse','eden');
                    let multiplier = storageMultipler(0.2);
                    for (const res of $(this)[0].res()){
                        if (global.resource[res].display){
                            global.resource[res].max += (spatialReasoning($(this)[0].val(res) * multiplier));
                        }
                    };
                    return true;
                }
                return false;
            }
        },
        stabilizer: {
            id: 'eden-stabilizer',
            title: loc('eden_stabilizer_title'),
            desc: `<div>${loc('eden_stabilizer_title')}</div>`,
            reqs: { asphodel: 8 },
            cost: {
                Money(offset){ return spaceCostMultiplier('stabilizer', offset, 800000000, 1.25, 'eden'); },
                Neutronium(offset){ return spaceCostMultiplier('stabilizer', offset, 7500000, 1.25, 'eden'); },
                Vitreloy(offset){ return spaceCostMultiplier('stabilizer', offset, 29000000, 1.25, 'eden'); },
                Elerium(offset){ return spaceCostMultiplier('stabilizer', offset, 7500, 1.25, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('stabilizer', offset, 4250, 1.25, 'eden'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('eden_stabilizer_requirement',[loc('city_shed_title3')])}</div>`;

                let stabilize = 8;
                if (p_on['ascension_trigger'] && global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
                    let heatSink = actions.interstellar.int_sirius.ascension_trigger.heatSink();
                    heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;
                    if (heatSink > 0){
                        stabilize *= 1 + (heatSink / 17500);
                    }
                }

                desc += `<div>${loc('eden_stabilizer_effect1',[global.resource.Asphodel_Powder.name, +stabilize.toFixed(1)])}</div>`;
                desc += `<div>${loc('eden_stabilizer_effect2',[global.resource.Asphodel_Powder.name, loc('city_shed_title3'), 15])}</div>`;
                desc += `<div class="has-text-special">${loc('eden_stabilizer_limit',[global.eden.warehouse.count])}</div>`;
                return desc;
            },
            action(){
                if (global.eden.stabilizer.count < global.eden.warehouse.count && payCosts($(this)[0])){
                    incrementStruct('stabilizer','eden');
                    return true;
                }
                return false;
            },
        },
        rune_gate: {
            id: 'eden-rune_gate',
            title: loc('eden_rune_gate_title'),
            desc(wiki){
                if (!global.eden.hasOwnProperty('rune_gate') || global.eden.rune_gate.count < 100 || wiki){
                    return `<div>${loc('eden_rune_gate_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('eden_rune_gate_title')}</div>`;
                }
            },
            wiki: false,
            reqs: { elysium: 1 },
            condition(){
                return global.eden.rune_gate.count < 100 ? true : false;
            },
            queue_size: 10,
            queue_complete(){ return 100 - global.eden.rune_gate.count; },
            cost: {
                Money(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('rune_gate') ? global.eden.rune_gate.count : 0) < 100 ? 1000000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('rune_gate') || (global.eden.rune_gate.count < 100) ? 1000000000 : 0;
                },
                Omniscience(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('rune_gate') ? global.eden.rune_gate.count : 0) < 100 ? 10000 : 0;
                    }
                    return !global.eden.hasOwnProperty('rune_gate') || (global.eden.rune_gate.count < 100) ? 10000 : 0;
                },
                Copper(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('rune_gate') ? global.eden.rune_gate.count : 0) < 100 ? 420000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('rune_gate') || (global.eden.rune_gate.count < 100) ? 420000000 : 0;
                },
                Nano_Tube(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('rune_gate') ? global.eden.rune_gate.count : 0) < 100 ? 35000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('rune_gate') || (global.eden.rune_gate.count < 100) ? 35000000 : 0;
                },
                Bolognium(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('rune_gate') ? global.eden.rune_gate.count : 0) < 100 ? 7500000 : 0;
                    }
                    return !global.eden.hasOwnProperty('rune_gate') || (global.eden.rune_gate.count < 100) ? 7500000 : 0;
                },
                Asphodel_Powder(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('rune_gate') ? global.eden.rune_gate.count : 0) < 100 ? 25000 : 0;
                    }
                    return !global.eden.hasOwnProperty('rune_gate') || (global.eden.rune_gate.count < 100) ? 25000 : 0;
                },
            },
            effect(wiki){
                let count = (wiki || 0) + (global.eden.hasOwnProperty('rune_gate') ? global.eden.rune_gate.count : 0);
                if (count >= 100){
                    let desc = `<div>${loc('eden_rune_gate_effect')}</div>`;
                    return desc;
                }
                else {
                    let size = 100;
                    let remain = size - count;
                    return `<div>${loc('eden_rune_gate_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(){
                if (global.eden.rune_gate.count < 100 && payCosts($(this)[0])){
                    incrementStruct('rune_gate','eden');
                    if (global.eden.rune_gate.count === 100){
                        global.eden['rune_gate_open'] = { count: 1, on: 0 };
                        global.settings.eden.elysium = true;
                        global.tech.elysium = 2;
                        renderEdenic();
                    }
                    return true;
                }
                return false;
            }
        },
        rune_gate_open: {
            id: 'space-rune_gate_complete',
            title: loc('eden_rune_gate_title'),
            desc(){
                return `<div>${loc('eden_rune_gate_title')}</div>`;
            },
            reqs: { elysium: 1 },
            condition(){
                return global.eden.rune_gate.count === 100 ? true : false;
            },
            queue_complete(){ return 0; },
            cost: {},
            effect(){
                return `<div>${loc('eden_rune_gate_open',[loc('eden_elysium_name')])}</div>`;
            },
            action(){
                return false;
            }
        },
        bunker: {
            id: 'eden-bunker',
            title: loc('eden_bunker_title'),
            desc: `<div>${loc('eden_bunker_title')}</div><div class="has-text-special">${loc('space_support',[loc('eden_asphodel_name')])}</div>`,
            reqs: { asphodel: 9 },
            cost: {
                Money(offset){ return spaceCostMultiplier('bunker', offset, 777000000, 1.2, 'eden'); },
                Stone(offset){ return spaceCostMultiplier('bunker', offset, 358000000, 1.2, 'eden'); },
                Furs(offset){ return spaceCostMultiplier('bunker', offset, 66600000, 1.2, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('bunker', offset, 9999, 1.2, 'eden'); },
            },
            effect(){
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('eden_asphodel_name')])}</div>`;
                desc += `<div>${loc('plus_max_soldiers',[5])}</div>`;
                if (global.tech['celestial_warfare'] && global.tech.celestial_warfare >= 4){
                    desc += `<div>${loc('eden_bunker_effect',[3])}</div>`;
                }
                if (global.tech['celestial_warfare'] && global.tech.celestial_warfare >= 5){
                    let rate = 10;
                    if (global.blood['lust']){
                        rate += global.blood.lust * 0.2;
                    }
                    let milVal = govActive('militant',0);
                    if (milVal){
                        rate *= 1 + (milVal / 100);
                    }
                    desc += `<div>${loc('city_boot_camp_effect',[rate])}</div>`;
                }
                return desc;
            },
            s_type: 'asphodel',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('bunker','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            }
        },
        bliss_den: {
            id: 'eden-bliss_den',
            title: loc('eden_bliss_den_title'),
            desc: `<div>${loc('eden_bliss_den_title')}</div><div class="has-text-special">${loc('space_support',[loc('eden_asphodel_name')])}</div>`,
            reqs: { asphodel: 10 },
            cost: {
                Money(offset){ return spaceCostMultiplier('bliss_den', offset, 450000000, 1.22, 'eden'); },
                Furs(offset){ return spaceCostMultiplier('bliss_den', offset, 29000000, 1.22, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('bliss_den', offset, 35000, 1.22, 'eden'); },
                Plywood(offset){ return spaceCostMultiplier('bliss_den', offset, 10000000, 1.22, 'eden'); },
                Soul_Gem(offset){ return spaceCostMultiplier('bliss_den', offset, 10, 1.22, 'eden'); },
            },
            effect(){
                let morale = 10;
                let max = 2;

                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('eden_asphodel_name')])}</div>`;
                desc += `<div>${loc('space_red_vr_center_effect1',[morale])}</div>`;
                desc += `<div>${loc('space_red_vr_center_effect2',[max])}</div>`;

                return desc;
            },
            s_type: 'asphodel',
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('bliss_den','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            flair(){
                return loc(`eden_bliss_den_flair`);
            }
        },
        rectory: {
            id: 'eden-rectory',
            title: loc('eden_rectory_title'),
            desc: `<div>${loc('eden_rectory_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { asphodel: 11 },
            cost: {
                Money(offset){ return spaceCostMultiplier('rectory', offset, 275000000, 1.24, 'eden'); },
                Copper(offset){ return spaceCostMultiplier('rectory', offset, 18200000, 1.24, 'eden'); },
                Brick(offset){ return spaceCostMultiplier('rectory', offset, 7500000, 1.24, 'eden'); },
                Soul_Gem(offset){ return spaceCostMultiplier('rectory', offset, 18, 1.24, 'eden'); },
            },
            effect(){
                let desc = `<div>${loc('eden_encampment_effect',[$(this)[0].support()])}</div>`;
                desc += `<div>${loc('plus_max_citizens',[$(this)[0].citizens()])}</div>`;
                if (global.genes['ancients'] && global.genes['ancients'] >= 4){
                    desc += `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_priest`)])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            support(){ return 1; },
            powered(){ return powerCostMod(50); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('rectory','eden');
                    if (powerOnNewStruct($(this)[0])){
                        global['resource'][global.race.species].max += $(this)[0].citizens();
                    }
                    return true;
                }
                return false;
            },
            citizens(){
                let pop = 4;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            },
            flair(){
                return loc(`eden_rectory_flair`);
            }
        },
    },
    eden_elysium: {
        info: {
            name: loc('eden_elysium_name'),
            desc: loc('eden_elysium_desc'),
            prop(){
                let soldier_title = global.tech['world_control'] && !global.race['truepath'] ? loc('civics_garrison_peacekeepers') : loc('civics_garrison_soldiers');
                let desc = `<span class="pad"><span class="soldier">${soldier_title}</span> <span v-html="$options.filters.filter(workers,'stationed')"></span> / <span>{{ max | filter('s_max') }}</span></span>`;
                desc += `<span class="pad"><span class="wounded">${loc('civics_garrison_wounded')}</span> <span>{{ wounded }}</span></span>`;
                desc += `<span class="pad"><span v-html="$options.filters.filter(m_use,'m_use')"></span></span>`;
                return desc;
            },
            bind(){
                return global.civic.garrison;
            },
            filter(v,type){
                switch (type){
                    case 'stationed':
                        let size = garrisonSize();
                        let trickNum = global.race['cataclysm'] ? 13 : 31;
                        let trick = size === trickNum && !full ? trickOrTreat(2,14,true) : false;
                        return size === trickNum && trick.length > 0 ? trick : size;
                    case 's_max':
                        return garrisonSize(true);
                    case 'm_use':
                        return loc(`civics_garrison_mercenary_cost`,[Math.round(mercCost()).toLocaleString()]);
                }
            }
        },
        survey_fields: {
            id: 'eden-survey_fields',
            title: loc('eden_survey_fields'),
            desc: loc('eden_survey_fields'),
            reqs: { elysium: 2 },
            grant: ['elysium',3],
            cost: {
                Money(){ return 1000000000; },
                Oil(){ return 10000000; },
                Helium_3(){ return 5000000; },
            },
            effect:loc('eden_survey_fields_effect'),
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('eden_survey_fields_msg'),'info',false,['progress']);
                    global.eden['fortress'] = { fortress: 1000, patrols: 20, armory: 100, detector: 100 };
                    return true;
                }
                return false;
            },
            post(){
                if (global.tech['elysium'] && global.tech.elysium === 3){
                    renderEdenic();
                    clearPopper('eden-survey_fields');
                }
            }
        },
        fortress: { 
            id: 'eden-fortress',
            title: loc('eden_fortress'),
            desc: loc('eden_fortress'),
            queue_complete(){ return 0; },
            reqs: { elysium: 3 },
            condition(){
                return global.tech.elysium === 3;
            },
            effect(){ 
                let desc = `<div>${loc('eden_fortress_rating',[global.eden['fortress'] ? global.eden.fortress.fortress / 10 : 0])}</div>`;
                desc += `<div>${loc('eden_fortress_patrols',[global.eden['fortress'] ? global.eden.fortress.patrols : 0])}</div>`;
                desc += `<div>${loc('eden_fortress_detect',[global.eden['fortress'] ? global.eden.fortress.detector : 0])}</div>`;
                desc += `<div>${loc('eden_fortress_armory',[global.eden['fortress'] ? global.eden.fortress.armory : 0])}</div>`;
                return desc;
            },
            action(){
                return false;
            }
        },
        siege_fortress: { 
            id: 'eden-siege_fortress',
            title: loc('eden_siege_fortress'),
            desc: loc('eden_siege_fortress'),
            queue_complete(){ return 0; },
            reqs: { elysium: 3 },
            condition(){
                return global.tech.elysium === 3 && global.eden.fortress.fortress > 0;
            },
            cost: {
                Troops(){
                    return jobScale(100);
                },
            },
            effect(){ 
                let desc = `<div class="has-text-warning">${loc(`eden_siege_fortress_effect`)}</div>`;
                if (global.eden.fortress.hasOwnProperty('siege')){
                    desc += `<div>${loc(`eden_siege_fortress_result`)}</div>`;
                    desc += `<div>${loc(`eden_siege_fortress_lost`,[global.eden.fortress.siege.loss])}</div>`;
                    desc += `<div>${loc(`eden_siege_fortress_damage`,[global.eden.fortress.siege.damage])}</div>`;
                    desc += `<div class="has-text-caution">${loc('eden_fortress_rating',[global.eden['fortress'] ? global.eden.fortress.fortress / 10 : 0])}</div>`;
                }
                return desc;
            },
            action(){
                let armySize = jobScale(100);
                let armory = (global.eden.fortress.armory + 20) / 20; 
                let enemy_pats = global.eden.fortress.patrols * armory;
                let remain = jobScale(100 - enemy_pats < 0 ? 0 : 100 - enemy_pats);

                if (remain <= 0){
                    global.eden.fortress['siege'] = { loss: armySize, damage: 0 };
                    global.civic.garrison.workers -= armySize;
                    global.civic.garrison.protest += armySize;
                    global.stats.died += armySize;
                    messageQueue(loc('eden_siege_fortress_fail'),'warning',false,['combat']);
                }
                else {
                    let dead = armySize - remain + Math.floor(seededRandom(0,jobScale(global.eden.fortress.detector),true));
                    dead = deadCalc(dead, armySize);
                    remain = armySize - dead;

                    let troops = Math.ceil(armyRating(remain,'Troops'));
                    let damage = Math.floor(seededRandom(0,troops,true) / 50);

                    let more_dead = Math.floor(seededRandom(0,remain,true));
                    more_dead = deadCalc(more_dead, remain);
                    remain = remain - more_dead;
                    dead += more_dead;

                    global.civic.garrison.workers -= dead;
                    global.civic.garrison.protest += dead;
                    global.stats.died += dead;

                    global.civic.garrison.wounded += Math.floor(seededRandom(0,remain,true));
                    if (global.civic.garrison.wounded > global.civic.garrison.workers){
                        global.civic.garrison.wounded = global.civic.garrison.workers;
                    }

                    global.eden.fortress.fortress -= damage;
                    if (global.eden.fortress.fortress < 0){ global.eden.fortress.fortress = 0; }
                    global.eden.fortress['siege'] = { loss: dead, damage: damage / 10 };

                    if (global.eden.fortress.fortress <= 0){
                        messageQueue(loc('eden_siege_fortress_fall'),'success',false,['combat']);
                        global.tech.elysium = 4;
                    }
                    else {
                        messageQueue(loc('eden_siege_fortress_success',[damage / 10]),'success',false,['combat']);
                    }
                }

                renderEdenic();
                return false;
            }
        },
        raid_supplies: { 
            id: 'eden-raid_supplies',
            title: loc('eden_raid_supplies'),
            desc: loc('eden_raid_supplies'),
            queue_complete(){ return 0; },
            reqs: { elysium: 3 },
            condition(){
                return global.tech.elysium === 3 && global.eden.fortress.armory > 0;
            },
            cost: {
                Troops(){
                    return jobScale(50);
                },
            },
            effect(){ 
                let desc = `<div class="has-text-warning">${loc(`eden_raid_supplies_effect`)}</div>`;
                if (global.eden.fortress.hasOwnProperty('raid')){
                    desc += `<div>${loc(`eden_raid_fortress_result`)}</div>`;
                    desc += `<div>${loc(`eden_siege_fortress_lost`,[global.eden.fortress.raid.loss])}</div>`;
                    desc += `<div>${loc(`eden_siege_fortress_damage`,[global.eden.fortress.raid.damage])}</div>`;
                    desc += `<div class="has-text-caution">${loc('eden_fortress_armory',[global.eden['fortress'] ? global.eden.fortress.armory : 0])}</div>`;
                }
                return desc;
            },
            action(){
                let armySize = jobScale(50);
                let enemy_pats = global.eden.fortress.patrols * 2.5;
                let remain = Math.ceil(jobScale(50 - enemy_pats < 0 ? 0 : 50 - enemy_pats));

                if (remain <= 0){
                    global.eden.fortress['raid'] = { loss: armySize, damage: 0 };
                    global.civic.garrison.workers -= armySize;
                    global.civic.garrison.protest += armySize;
                    global.stats.died += armySize;
                    messageQueue(loc('eden_raid_fortress_fail'),'warning',false,['combat']);
                }
                else {
                    let dead = armySize - remain + Math.floor(seededRandom(0,jobScale(global.eden.fortress.detector / 2),true));
                    dead = deadCalc(dead, armySize);
                    remain = armySize - dead;

                    let troops = Math.ceil(armyRating(remain,'Troops'));
                    let damage = Math.floor(seededRandom(0,troops,true) / 50);

                    global.civic.garrison.workers -= dead;
                    global.civic.garrison.protest += dead;
                    global.stats.died += dead;

                    global.civic.garrison.wounded += Math.floor(seededRandom(0,remain,true));
                    if (global.civic.garrison.wounded > global.civic.garrison.workers){
                        global.civic.garrison.wounded = global.civic.garrison.workers;
                    }

                    global.eden.fortress.armory -= damage;
                    if (global.eden.fortress.armory < 0){ global.eden.fortress.armory = 0; }
                    global.eden.fortress['raid'] = { loss: dead, damage: damage };
                    messageQueue(loc('eden_raid_fortress_success',[damage]),'success',false,['combat']);
                    drawTech();
                }

                renderEdenic();
                return false;
            }
        },
        ambush_patrol: { 
            id: 'eden-ambush_patrol',
            title: loc('eden_ambush_patrol'),
            desc: loc('eden_ambush_patrol'),
            queue_complete(){ return 0; },
            reqs: { elysium: 3 },
            condition(){
                return global.tech.elysium === 3 && global.eden.fortress.patrols > 0
            },
            cost: {
                Troops(){
                    return jobScale(25);
                },
            },
            effect(){ 
                let desc = `<div class="has-text-warning">${loc(`eden_ambush_patrol_effect`)}</div>`;
                if (global.eden.fortress.hasOwnProperty('ambush')){
                    desc += `<div>${loc(`eden_ambush_patrol_result`)}</div>`;
                    desc += `<div>${loc(`eden_siege_fortress_lost`,[global.eden.fortress.ambush.loss])}</div>`;
                    desc += `<div>${loc(`eden_ambush_patrol_damage`,[global.eden.fortress.ambush.damage ? loc('true') : loc('false')])}</div>`;
                    desc += `<div class="has-text-caution">${loc('eden_fortress_patrols',[global.eden['fortress'] ? global.eden.fortress.patrols : 0])}</div>`;
                }
                return desc;
            },
            action(){
                let armySize = jobScale(25);
                if (armyRating(jobScale(1),'Troops') > Math.floor(seededRandom(0,global.eden.fortress.detector * 2,true))){
                    let dead = Math.floor(seededRandom(0,armySize,true));
                    dead = deadCalc(dead, armySize);
                    let remain = armySize - dead;

                    global.civic.garrison.workers -= dead;
                    global.civic.garrison.protest += dead;
                    global.stats.died += dead;

                    global.civic.garrison.wounded += Math.floor(seededRandom(0,remain,true));
                    if (global.civic.garrison.wounded > global.civic.garrison.workers){
                        global.civic.garrison.wounded = global.civic.garrison.workers;
                    }

                    global.eden.fortress.patrols--;
                    global.eden.fortress['ambush'] = { loss: dead, damage: true };
                    messageQueue(loc('eden_ambush_patrol_success'),'success',false,['combat']);
                    drawTech();
                }
                else {
                    global.eden.fortress['ambush'] = { loss: armySize, damage: false };
                    global.civic.garrison.workers -= armySize;
                    global.civic.garrison.protest += armySize;
                    global.stats.died += armySize;
                    messageQueue(loc('eden_ambush_patrol_fail'),'warning',false,['combat']);
                }

                renderEdenic();
                return false;
            }
        },
        ruined_fortress: { 
            id: 'eden-ruined_fortress',
            title: loc('eden_ruined_fortress'),
            desc: loc('eden_ruined_fortress'),
            queue_complete(){ return 0; },
            reqs: { elysium: 4 },
            condition(){
                return global.tech.elysium < 8;
            },
            wiki: false,
            effect(){ 
                return loc('eden_ruined_fortress_effect');
            },
            action(){
                return false;
            }
        },
        scout_elysium: {
            id: 'eden-scout_elysium',
            title: loc('eden_scout_elysium_title'),
            desc: loc('eden_scout_elysium_title'),
            reqs: { elysium: 4 },
            grant: ['elysium',5],
            queue_complete(){ return global.tech.elysium >= 5 ? 0 : 1; },
            cost: {
                Money(){ return 10000000000; },
                Oil(){ return 9000000; },
                Helium_3(){ return 6000000; },
                Troops(){ return jobScale(100); },
            },
            effect: loc('eden_scout_elysium_effect'),
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('eden_scout_elysium_result'),'info',false,['progress']);
                    global.settings.eden.isle = true;
                    global.civic.garrison.workers -= jobScale(50);
                    global.civic.garrison.protest += jobScale(50);
                    global.stats.died += jobScale(50);
                    return true;
                }
                return false;
            }
        },
        fire_support_base: {
            id: 'eden-fire_support_base',
            title: loc('eden_fire_support_base_title'),
            desc(wiki){
                if (!global.eden.hasOwnProperty('fire_support_base') || global.eden.fire_support_base.count < 100 || wiki){
                    return `<div>${loc('eden_fire_support_base_title')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>`;
                }
                else {
                    return `<div>${loc('eden_fire_support_base_title')}</div>`;
                }
            },
            reqs: { elysium: 8 },
            queue_size: 10,
            queue_complete(){ return 100 - global.eden.fire_support_base.count; },
            cost: {
                Money(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('fire_support_base') ? global.eden.fire_support_base.count : 0) < 100 ? 2500000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('fire_support_base') || (global.eden.fire_support_base.count < 100) ? 2500000000 : 0;
                },
                Stone(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('fire_support_base') ? global.eden.fire_support_base.count : 0) < 100 ? 215000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('fire_support_base') || (global.eden.fire_support_base.count < 100) ? 215000000 : 0;
                },
                Neutronium(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('fire_support_base') ? global.eden.fire_support_base.count : 0) < 100 ? 3300000 : 0;
                    }
                    return !global.eden.hasOwnProperty('fire_support_base') || (global.eden.fire_support_base.count < 100) ? 3300000 : 0;
                },
                Polymer(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('fire_support_base') ? global.eden.fire_support_base.count : 0) < 100 ? 65000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('fire_support_base') || (global.eden.fire_support_base.count < 100) ? 65000000 : 0;
                },
                Elysanite(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('fire_support_base') ? global.eden.fire_support_base.count : 0) < 100 ? 100000 : 0;
                    }
                    return !global.eden.hasOwnProperty('fire_support_base') || (global.eden.fire_support_base.count < 100) ? 100000 : 0;
                },
            },
            effect(wiki){
                let count = (wiki || 0) + (global.eden.hasOwnProperty('fire_support_base') ? global.eden.fire_support_base.count : 0);
                if (count >= 100){
                    let desc = `<div>${loc('plus_max_soldiers',[25])}</div>`;
                    if (global.tech['elysium'] && global.tech.elysium >= 10){
                        desc += `<div>${loc('eden_fire_support_base_effect')}</div>`;
                        desc += `<div>${loc('eden_fire_support_base_effect2',[sizeApproximation(250000),global.resource.Elerium.name])}</div>`;
                    }
                    return desc;
                }
                else {
                    let size = 100;
                    let remain = size - count;
                    return `<div>${loc('eden_fire_support_base_build')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(){
                if (global.eden.fire_support_base.count < 100 && payCosts($(this)[0])){
                    incrementStruct('fire_support_base','eden');
                    if (global.eden.fire_support_base.count === 100 && !global.tech['isle']){
                        global.tech['isle'] = 1;
                        renderEdenic();
                        drawTech();
                    }
                    return true;
                }
                return false;
            }
        },
        elysanite_mine: {
            id: 'eden-elysanite_mine',
            title: loc('eden_elysanite_mine_title'),
            desc: `<div>${loc('eden_elysanite_mine_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { elysium: 6 },
            cost: {
                Money(offset){ return spaceCostMultiplier('elysanite_mine', offset, 566000000, 1.24, 'eden'); },
                Adamantite(offset){ return spaceCostMultiplier('elysanite_mine', offset, 18000000, 1.24, 'eden'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('elysanite_mine', offset, 10000000, 1.24, 'eden'); },
            },
            effect(){
                let desc = `<div>${loc('plus_max_resource',[jobScale(2),loc(`job_elysium_miner`)])}</div>`;
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(25); },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('elysanite_mine','eden');
                    powerOnNewStruct($(this)[0]);
                    global.civic.elysium_miner.display = true;
                    return true;
                }
                return false;
            }
        },
        sacred_smelter: {
            id: 'eden-sacred_smelter',
            title: loc('eden_sacred_smelter_title'),
            desc: `<div>${loc('eden_sacred_smelter_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { elysium: 7 },
            cost: {
                Money(offset){ return spaceCostMultiplier('sacred_smelter', offset, 625000000, 1.25, 'eden'); },
                Iridium(offset){ return spaceCostMultiplier('sacred_smelter', offset, 25000000, 1.25, 'eden'); },
                Elysanite(offset){ return spaceCostMultiplier('sacred_smelter', offset, 4500000, 1.25, 'eden'); },
                Scarletite(offset){ return spaceCostMultiplier('sacred_smelter', offset, 1250000, 1.25, 'eden'); },
            },
            effect(){
                let desc = `<div>${loc('interstellar_stellar_forge_effect3',[5])}</div>`;
                return `${desc}<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(33); },
            special: true,
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('sacred_smelter','eden');
                    if (powerOnNewStruct($(this)[0])){
                        global.city.smelter.cap += 5;
                        global.city.smelter.Steel += 5;
                        global.city.smelter.Oil += 5;
                    }
                    return true;
                }
                return false;
            }
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

function deadCalc(dead, armySize){
    let armor = armorCalc(dead);
    dead -= Math.floor(seededRandom(0,armor,true));
    if (dead > armySize){ dead = armySize }
    else if (dead < 0){ dead = 0; }
    return Math.floor(dead);
}

export function edenicTech(){
    return edenicModules;
}

export function checkEdenRequirements(region,tech){
    return checkRequirements(edenicModules,region,tech);
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

            let bind = false;
            if (edenicModules[region].info.hasOwnProperty('bind')){
                bind = edenicModules[region].info.bind();
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
                    data: bind ? bind : global.eden[support],
                    filters: {
                        filter(){
                            return edenicModules[region].info.filter(...arguments);
                        }
                    }
                });
            }
            else if (bind){
                parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3>${property}</div></div>`);
                vBind({
                    el: `#sr${region}`,
                    data: bind,
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

export function asphodelResist(){
    if (global.tech['asphodel'] && global.tech.asphodel >= 5){
        let resist = 0.34;
        if (global.eden['mech_station'] && global.eden.mech_station.count >= 10){
            resist = 0.34 + (global.eden.mech_station.effect * 0.0066);
        }
        return resist;
    }
    return 1;
}

export function mechStationEffect(){
    if (global.eden.mech_station.mode === 0){
        global.eden.mech_station.effect = 0;
        global.eden.mech_station.mechs = 0;
        return;
    }

    let hostility = 0;
    hostility += global.eden.asphodel_harvester.on * 4;
    hostility += global.civic.ghost_trapper.workers;
    let rawHostility = hostility;
    let targetHostility = 0;

    if (global.eden.mech_station.mode === 1){
        targetHostility = Math.ceil(hostility * 0.66);
    }
    else if (global.eden.mech_station.mode === 2){
        targetHostility = Math.ceil(hostility * 0.33);
    }
    else if (global.eden.mech_station.mode === 4){
        hostility *= 1.25;
        rawHostility *= 1.25;
    }
    else if (global.eden.mech_station.mode === 5){
        hostility *= 1.5;
        rawHostility *= 1.5;
    }

    let mechs = 0;
    for (let i = 0; i < global.portal.mechbay.active; i++) {
        let mech = global.portal.mechbay.mechs[i];
        if (mech.size !== 'collector' && hostility > targetHostility){
            hostility -= mechRating(mech,true) * 12500;
            mechs++;
        }
    }

    if (hostility < 0){ hostility = 0 }
    global.eden.mech_station.mechs = mechs;
    global.eden.mech_station.effect = 100 - Math.floor(hostility / rawHostility * 100);
    
    if (global.eden.mech_station.effect === 100 && global.eden.mech_station.mode === 4){
        global.eden.mech_station.effect = 110;
    }
    else if (global.eden.mech_station.effect === 100 && global.eden.mech_station.mode === 5){
        global.eden.mech_station.effect = 120;
    }
}
