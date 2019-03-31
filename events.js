import { global } from './vars.js';
import { races } from './races.js';

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
            tech: 'military'
        },
        effect: function(){
            let army = (global.civic.garrison.workers - (global.civic.garrison.wounded / 2)) * global.tech.military;
            let enemy = global['resource'][races[global.race.species].name].amount / Math.rand(1,4);
            
            let killed = Math.floor(Math.seededRandom(0,global.civic.garrison.wounded));
            let wounded = Math.floor(Math.seededRandom(global.civic.garrison.wounded,global.civic.garrison.workers));
            global.civic.garrison.workers -= killed;
            global.civic.garrison.wounded += wounded;

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
    tax_revolt1: {
        reqs: { 
            tax_rate: 4
        },
        effect: function(){
            return tax_revolt(5);
        }
    },
    tax_revolt2: {
        reqs: { 
            tax_rate: 5
        },
        effect: function(){
            return tax_revolt(3);
        }
    }
};

function tax_revolt(divisor){
    Object.keys(global.resource).forEach(function (res) {
        let loss = Math.rand(1,Math.round(global.resource[res].amount / divisor));
        let remain = global.resource[res].amount - loss;
        if (remain < 0){ remain = 0; }
        global.resource[res].amount = remain;
    });
    return 'Riots have broken out due to the excessively high taxes, widespread damage has resulted in the loss of some resources.';
}
