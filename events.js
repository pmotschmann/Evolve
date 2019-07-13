import { global } from './vars.js';
import { loc } from './locale.js';
import { races } from './races.js';
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
            var gain = Math.rand(10,100) * (global.civic.professor.workers + 1);
            var res = global.resource.Knowledge.amount + gain;
            if (res > global.resource.Knowledge.max){ res = global.resource.Knowledge.max; }
            global.resource.Knowledge.amount = res;
            return loc('event_inspiration',[gain]);
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
        effect: function(){
            let army = (global.civic.garrison.workers - (global.civic.garrison.wounded / 2)) * global.tech.military;
            let enemy = global['resource'][races[global.race.species].name].amount / Math.rand(1,4);
            
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
            tech: 'wsc'
        },
        effect: function(){
            unlockAchieve('doomed');
            global.stats.portals++;
            return loc(global.race['evil'] ? 'event_doom_alt' : 'event_doom',[races[global.race.species].solar.dwarf]);
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
            high_tax_rate: 26,
            low_morale: 99
        },
        effect: function(){
            return tax_revolt();
        }
    }
};

function tax_revolt(){
    global.city.morale.current - 100;
    let risk = (global.civic.taxes.tax_rate - 25) * 0.04;
    Object.keys(global.resource).forEach(function (res) {
        let loss = Math.rand(1,Math.round(global.resource[res].amount * risk));
        let remain = global.resource[res].amount - loss;
        if (remain < 0){ remain = 0; }
        global.resource[res].amount = remain;
    });
    return loc('event_tax_revolt');
}
