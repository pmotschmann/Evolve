import { global } from './vars.js';
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
            return `Some DNA molecules have replicated, you gain ${gain} DNA.`;
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
            return `A meteor has impacted the planet bringing new genetic material with it, gained ${gain} RNA.`;
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
            return `Your scientists have become inspired, gain ${gain} Knowledge.`;
        }
    },
    fire: {
        reqs: { 
            resource: 'Lumber'
        },
        effect: function(){
            var loss = Math.rand(1,Math.round(global.resource.Lumber.amount / 4));
            var res = global.resource.Lumber.amount - loss;
            if (res < 0){ res = 0; }
            global.resource.Lumber.amount = res;
            return `A fire has broken out destroying ${loss} lumber.`;
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

            if (army > enemy){
                return `An attack by a rival city has been repelled, ${killed} soldiers were killed and ${wounded} soldiers were wounded.`;
            }
            else {
                var loss = Math.rand(1,Math.round(global.resource.Money.amount / 4));
                var res = global.resource.Money.amount - loss;
                if (res < 0){ res = 0; }
                global.resource.Money.amount = res;
                return `Your city was raided, \$${loss} was stolen, ${killed} soldiers were killed and ${wounded} soldiers were wounded.`;
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

            if (killed === 0){
                return `${wounded} soldiers were wounded by a terrorist attack against your security forces.`;
            }
            else {
                return `${wounded} soldiers were wounded and ${killed} soldiers were killed by a terrorist attack against your security forces.`;
            }
        }
    },
    doom: {
        reqs: {
            tech: 'wsc'
        },
        effect: function(){
            unlockAchieve('doomed');
            return `A portal to hell was accidently opened on ${races[global.race.species].solar.dwarf}, a lone space marine wearing green armor somehow managed to stop the demonic invasion.`;
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
            return `An ancient cache of resources has been discovered.`;
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
    return 'Riots have broken out due to the excessively high taxes, widespread damage has resulted in the loss of some resources.';
}
