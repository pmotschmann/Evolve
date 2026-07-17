import { global } from './vars.js';
import { cleanAddTrait } from './races.js';

/**
 * Repair saves where Terrifying is active while local Trade state remains live.
 *
 * Older Synth/Imitation saves can contain researched Trade technology and Trade
 * Posts even though Terrifying disables local trading. cleanAddTrait() owns the
 * canonical transition into purgatory, including route and market cleanup.
 */
export function repairTerrifyingTrade(){
    if (global.race?.terrifying && (global.tech?.trade || global.city?.trade)){
        cleanAddTrait('terrifying');
    }
}

repairTerrifyingTrade();
