import { global } from './vars.js';
import { loc } from './locale.js';
import { races } from './races.js';
import { govTitle } from './civics.js';
import { housingLabel } from './actions.js';
import { unlockAchieve } from './achieve.js';

export const events = {
    dna_replication: {
        reqs: { 
            race: 'protoplasm',
            resource: 'DNA'
        },
        effect: function(){
            var gain = Math.rand(1,Math.round(global.resource.DNA.max / 3));
            var res = global.resource.DNA.amount + gain;
            if (res > global.resource.DNA.max){ res = global.resource.DNA.max; }
            global.resource.DNA.amount = res;
            return loc('event_dna',[gain]);
        }
    },
    rna_meteor: {
        reqs: { 
            race: 'protoplasm',
            resource: 'RNA'
        },
        effect: function(){
            var gain = Math.rand(1,Math.round(global.resource.RNA.max / 2));
            var res = global.resource.RNA.amount + gain;
            if (res > global.resource.RNA.max){ res = global.resource.RNA.max; }
            global.resource.RNA.amount = res;
            return loc('event_rna',[gain]);
        }
    },
    inspiration: {
        reqs: { 
            resource: 'Knowledge'
        },
        effect: function(){
            global.race['inspired'] = Math.rand(300,600);
            return loc('event_inspiration');
        }
    },
    fire: {
        reqs: { 
            resource: 'Lumber',
            nogenus: 'aquatic',
            notrait: 'evil'
        },
        effect: function(){
            var loss = Math.rand(1,Math.round(global.resource.Lumber.amount / 4));
            var res = global.resource.Lumber.amount - loss;
            if (res < 0){ res = 0; }
            global.resource.Lumber.amount = res;
            return loc('event_fire',[loss]);
        }
    },
    raid: {
        reqs: { 
            tech: 'military',
            notech: 'world_control'
        },
        condition(){
            return global.civic.foreign.gov0.hstl > 60 || global.civic.foreign.gov1.hstl > 60 || global.civic.foreign.gov2.hstl > 60 ? true : false;
        },
        effect: function(){
            let army = (global.civic.garrison.workers - (global.civic.garrison.wounded / 2)) * global.tech.military;
            let enemy = global['resource'][global.race.species].amount / Math.rand(1,4);
            
            let killed = Math.floor(Math.seededRandom(0,global.civic.garrison.wounded));
            let wounded = Math.floor(Math.seededRandom(global.civic.garrison.wounded,global.civic.garrison.workers));
            global.civic.garrison.workers -= killed;
            global.civic.garrison.wounded += wounded;
            global.stats.died += killed;
            if (global.civic.garrison.wounded > global.civic.garrison.workers){
                global.civic.garrison.wounded = global.civic.garrison.workers;
            }

            if (global.race['frenzy']){
                global.race['frenzy'] += Math.ceil(enemy / 5);
                if (global.race['frenzy'] > 1000000){
                    global.race['frenzy'] = 1000000;
                }
            }

            if (army > enemy){
                return loc('event_raid1',[killed,wounded]);
            }
            else {
                var loss = Math.rand(1,Math.round(global.resource.Money.amount / 4));
                var res = global.resource.Money.amount - loss;
                if (res < 0){ res = 0; }
                global.resource.Money.amount = res;
                return loc('event_raid2',[loss,killed,wounded]);
            }
        }
    },
    siege: {
        reqs: { 
            tech: 'military',
            notech: 'world_control'
        },
        condition(){
            if (global.civic.foreign.gov0.occ || global.civic.foreign.gov1.occ || global.civic.foreign.gov2.occ){
                return false;
            }
            return global.civic.foreign.gov0.hstl > 80 && global.civic.foreign.gov1.hstl > 80 && global.civic.foreign.gov2.hstl > 80 ? true : false;
        },
        effect: function(){
            let army = (global.civic.garrison.workers - (global.civic.garrison.wounded / 2)) * global.tech.military;
            let enemy = global.civic.foreign.gov0.mil + global.civic.foreign.gov1.mil + global.civic.foreign.gov2.mil;
            
            let killed = Math.floor(Math.seededRandom(0,global.civic.garrison.wounded));
            let wounded = Math.floor(Math.seededRandom(global.civic.garrison.wounded,global.civic.garrison.workers));
            global.civic.garrison.workers -= killed;
            global.civic.garrison.wounded += wounded;
            global.stats.died += killed;
            if (global.civic.garrison.wounded > global.civic.garrison.workers){
                global.civic.garrison.wounded = global.civic.garrison.workers;
            }

            if (global.race['frenzy']){
                global.race['frenzy'] += Math.ceil(enemy / 5);
                if (global.race['frenzy'] > 1000000){
                    global.race['frenzy'] = 1000000;
                }
            }

            if (army > enemy){
                return loc('event_siege1',[killed,wounded]);
            }
            else {
                var loss = Math.rand(1,Math.round(global.resource.Money.amount / 2));
                var res = global.resource.Money.amount - loss;
                if (res < 0){ res = 0; }
                global.resource.Money.amount = res;
                return loc('event_siege2',[loss,killed,wounded]);
            }
        }
    },
    terrorist: {
        reqs: {
            tech: 'world_control'
        },
        effect: function(){            
            let killed = Math.floor(Math.seededRandom(0,global.civic.garrison.wounded));
            let wounded = Math.floor(Math.seededRandom(global.civic.garrison.wounded,global.civic.garrison.workers));
            global.civic.garrison.workers -= killed;
            global.civic.garrison.wounded += wounded;
            global.stats.died += killed;
            if (global.civic.garrison.wounded > global.civic.garrison.workers){
                global.civic.garrison.wounded = global.civic.garrison.workers;
            }

            if (global.race['frenzy']){
                global.race['frenzy'] += 1000;
                if (global.race['frenzy'] > 1000000){
                    global.race['frenzy'] = 1000000;
                }
            }

            if (killed === 0){
                return loc('event_terrorist1',[wounded]);
            }
            else {
                return loc('event_terrorist2',[wounded,killed]);
            }
        }
    },
    doom: {
        reqs: {
            tech: 'wsc',
            notech: 'portal_guard'
        },
        condition(){
            return global.space['space_barracks'] && global.space.space_barracks.on > 0 ? true : false;
        },
        effect: function(){
            unlockAchieve('doomed');
            global.stats.portals++;
            return loc(global.race['evil'] ? 'event_doom_alt' : 'event_doom',[races[global.race.species].solar.dwarf]);
        }
    },
    demon_influx: {
        reqs: {
            tech: 'portal_guard'
        },
        effect: function(){
            let surge = Math.rand(2500,5000);
            global.portal.fortress.threat += surge;
            return loc('event_demon_influx',[surge]);
        }
    },
    ruins: {
        reqs: { 
            trait: 'ancient_ruins',
            resource: 'Knowledge'
        },
        effect: function(){
            let resources = ['Iron','Copper','Steel','Cement'];
            for (var i = 0; i < resources.length; i++){
                let res = resources[i];
                if (global.resource[res].display){
                    let gain = Math.rand(1,Math.round(global.resource[res].max / 4));
                    if (global.resource[res].amount + gain > global.resource[res].max){
                        global.resource[res].amount = global.resource[res].max;
                    }
                    else {
                        global.resource[res].amount += gain;
                    }
                }
            }
            return loc('event_ruins');
        }
    },
    tax_revolt: {
        reqs: {
            low_morale: 99,
            notrait: 'blissful'
        },
        condition(){
            return global.civic.govern.type === 'oligarchy' ? global.civic.taxes.tax_rate > 35 : global.civic.taxes.tax_rate > 25;
        },
        effect: function(){
            return tax_revolt();
        }
    },
    slave_death1: {
        reqs: { 
            trait: 'slaver',
            tech: 'slaves'
        },
        effect: function(){
            if (global.city['slave_pen'] && global.city.slave_pen.slaves > 0){
                global.city.slave_pen.slaves--;
                global.resource.Slave.amount = global.city.slave_pen.slaves;
                return loc('event_slave_death1');
            }
            else {
                return loc('event_slave_none');
            }
        }
    },
    slave_death2: {
        reqs: { 
            trait: 'slaver',
            tech: 'slaves'
        },
        effect: function(){
            if (global.city['slave_pen'] && global.city.slave_pen.slaves > 0){
                global.city.slave_pen.slaves--;
                global.resource.Slave.amount = global.city.slave_pen.slaves;
                return loc('event_slave_death2');
            }
            else {
                return loc('event_slave_none');
            }
        }
    },
    slave_death3: {
        reqs: { 
            trait: 'slaver',
            tech: 'slaves'
        },
        effect: function(){
            if (global.city['slave_pen'] && global.city.slave_pen.slaves > 0){
                global.city.slave_pen.slaves--;
                global.resource.Slave.amount = global.city.slave_pen.slaves;
                return loc('event_slave_death3');
            }
            else {
                return loc('event_slave_none');
            }
        }
    },
    protest: {
        condition(){
            return global.civic.govern.type === 'republic' ? true : false;
        },
        effect: function(){
            global.civic.govern['protest'] = Math.rand(30,60);
            switch(Math.rand(0,10)){
                case 0:
                    return loc('event_protest0',[housingLabel('small')]);
                case 1:
                    return loc('event_protest1');
                case 2:
                    return loc('event_protest2');
                case 3:
                    global.civic.govern['protest'] = Math.rand(45,75);
                    return loc('event_protest3');
                case 4:
                    return loc('event_protest4');
                case 5:
                    global.civic.govern['protest'] = Math.rand(45,75);
                    return loc('event_protest5');
                case 6:
                    return loc('event_protest6');
                case 7:
                    return loc('event_protest7');
                case 8:
                    return loc('event_protest8');
                case 9:
                    global.civic.govern['protest'] = Math.rand(60,90);
                    return loc('event_protest9');
            }
        }
    },
    spy: {
        reqs: { 
            notech: 'world_control'
        },
        condition(){
            if (global.race['elusive']){
                return false;
            }
            return (global.civic.foreign.gov0.spy > 0 && !global.civic.foreign.gov0.occ) || (global.civic.foreign.gov1.spy > 0  && !global.civic.foreign.gov1.occ) || (global.civic.foreign.gov2.spy > 0 && !global.civic.foreign.gov2.occ) ? true : false;
        },
        effect: function(){
            let govs = [];
            for (let i=0; i<3; i++){
                if (global.civic.foreign[`gov${i}`].spy > 0 && !global.civic.foreign[`gov${i}`].occ){
                    govs.push(i);
                }
            }
            let gov = govs[Math.rand(0,govs.length)];
            global.civic.foreign[`gov${gov}`].spy--;
            
            return loc('event_spy',[govTitle(gov)]);
        }
    }
};

function tax_revolt(){
    global.city.morale.current - 100;
    let ramp = global.civic.govern.type === 'oligarchy' ? 35 : 25;
    let risk = (global.civic.taxes.tax_rate - ramp) * 0.04;
    Object.keys(global.resource).forEach(function (res) {
        let loss = Math.rand(1,Math.round(global.resource[res].amount * risk));
        let remain = global.resource[res].amount - loss;
        if (remain < 0){ remain = 0; }
        global.resource[res].amount = remain;
    });
    return loc('event_tax_revolt');
}
