import { global } from './vars.js';

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
            return 'Some DNA molecules have replicated, you gain '+gain+' DNA.';
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
            return 'A meteor has impacted the planet bringing new genetic material with it, gained '+gain+' RNA.';
        }
    },
    inspiration: {
        reqs: { 
            resource: 'Knowledge'
        },
        effect: function(){
            var gain = Math.rand(10,100);
            var res = global.resource.Knowledge.amount + gain;
            if (res > global.resource.Knowledge.max){ res = global.resource.Knowledge.max; }
            global.resource.Knowledge.amount = res;
            return 'Your scientists have become inspired, gain '+gain+' Knowledge.';
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
            return 'A fire has broken out destroying '+loss+' lumber.';
        }
    }
};
