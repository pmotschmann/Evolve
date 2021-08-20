import { global } from './vars.js';
import { messageQueue, powerCostMod, spaceCostMultiplier } from './functions.js';
import { races, genusVars } from './races.js';
import { payCosts, spaceTech } from './actions.js';
import { fuel_adjust } from './space.js';
import { loc } from './locale.js';

export const outerTruth = {
    spc_titan: {
        info: {
            name(){
                return genusVars[races[global.race.species].type].solar.titan;
            },
            desc(){
                return loc('space_titan_info_desc',[genusVars[races[global.race.species].type].solar.titan, races[global.race.species].home]);
            },
            support: 'titan_spaceport',
            zone: 'outer'
        },
        titan_mission: {
            id: 'space-titan_mission',
            title(){
                return loc('space_mission_title',[genusVars[races[global.race.species].type].solar.titan]);
            },
            desc(){
                return loc('space_mission_desc',[genusVars[races[global.race.species].type].solar.titan]);
            },
            reqs: { outer: 1 },
            grant: ['titan',1],
            path: 'truepath',
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: { 
                Helium_3(){ return +fuel_adjust(250000).toFixed(0); },
                Elerium(){ return 100; }
            },
            effect(){
                return loc('space_titan_mission_effect',[genusVars[races[global.race.species].type].solar.titan]);
            },
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_titan_mission_action',[genusVars[races[global.race.species].type].solar.titan, races[global.race.species].home]),'info');
                    return true;
                }
                return false;
            }
        },
        titan_spaceport: {
            id: 'space-titan_spaceport',
            title: loc('space_red_spaceport_title'),
            desc: `<div>${loc('space_red_spaceport_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { titan: 1 },
            path: 'truepath',
            cost: {
                Money(offset){ return spaceCostMultiplier('titan_spaceport', offset, 2500000, 1.32); },
                Iridium(offset){ return spaceCostMultiplier('titan_spaceport', offset, 3500, 1.32); },
                Mythril(offset){ return spaceCostMultiplier('titan_spaceport', offset, 50, 1.32); },
                Titanium(offset){ return spaceCostMultiplier('titan_spaceport', offset, 45000, 1.32); }
            },
            effect(){
                let helium = +(fuel_adjust(5,true)).toFixed(2);
                return `<div>${loc('space_red_spaceport_effect1',[races[global.race.species].solar.red,$(this)[0].support()])}</div><div class="has-text-caution">${loc('space_red_spaceport_effect2',[helium,$(this)[0].powered()])}</div><div class="has-text-caution">${loc('spend',[global.race['cataclysm'] ? 2 : 25,global.resource.Food.name])}</div>`;
            },
            support(){
                return 2;
            },
            powered(){ return powerCostMod(8); },
            refresh: true,
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('titan_spaceport');
                    if (global.city.power >= $(this)[0].powered()){
                        global.space['titan_spaceport'].on++;
                    }
                    if (global.tech['titan'] <= 1){
                        global.tech['titan'] = 2;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    spc_enceladus: {
        info: {
            name(){
                return genusVars[races[global.race.species].type].solar.enceladus;
            },
            desc(){
                return loc('space_enceladus_info_desc',[genusVars[races[global.race.species].type].solar.enceladus, races[global.race.species].home]);
            },
            zone: 'outer'
        },
        enceladus_mission: {
            id: 'space-enceladus_mission',
            title(){
                return loc('space_mission_title',[genusVars[races[global.race.species].type].solar.enceladus]);
            },
            desc(){
                return loc('space_mission_desc',[genusVars[races[global.race.species].type].solar.enceladus]);
            },
            reqs: { outer: 1 },
            grant: ['enceladus',1],
            path: 'truepath',
            no_queue(){ return global.queue.queue.some(item => item.id === $(this)[0].id) ? true : false; },
            cost: { 
                Helium_3(){ return +fuel_adjust(250000).toFixed(0); },
                Elerium(){ return 100; }
            },
            effect(){
                return loc('space_titan_mission_effect',[genusVars[races[global.race.species].type].solar.enceladus]);
            },
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_enceladus_mission_action',[genusVars[races[global.race.species].type].solar.enceladus]),'info');
                    return true;
                }
                return false;
            }
        },
    },
};

export function drawShipYard(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 5)){
        return;
    }
    clearElement($('#dwarfShipYard'));
    if (global.portal.hasOwnProperty('shipyard') && global.settings.showShipYard){
        let yard = $(`#dwarfShipYard`);
    }
}

export function syndicate(region){
    if (global.tech['syndicate'] && global.race['truepath'] && global.space['syndicate'] && global.space.syndicate.hasOwnProperty(region)){
        let divisor = 5000;

        let rival = 0;
        if (global.civic.foreign.gov3.hstl < 10){
            rival = 2500 - (250 * global.civic.foreign.gov3.hstl);
        }
        else if (global.civic.foreign.gov3.hstl > 60){
            rival = (-65 * (global.civic.foreign.gov3.hstl - 60));
        }

        switch (region){
            case 'spc_home':
            case 'spc_moon':
            case 'spc_red':
            case 'spc_hell':
                divisor = 10000 + rival;
                break;
            case 'spc_gas':
            case 'spc_gas_moon':
            case 'spc_belt':
                divisor = 7600 + rival;
                break;
            case 'spc_titan':
            case 'spc_enceladus':
                divisor = 5000;
                break;
        }

        let piracy = global.space.syndicate[region];
        if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
            global.space.shipyard.ships.forEach(function(ship){
                if (ship.region === region){
                    piracy -= ship.rating;
                }
            });
            if (piracy < 0){
                piracy = 0;
            }
        }

        return 1 - +(piracy / divisor).toFixed(4);
    }
    return 1;
}