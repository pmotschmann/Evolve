import { global } from './vars.js';
import { cleanAddTrait } from './races.js';

/**
 * Repair an invalid Trade state left by an imitated Terrifying trait.
 *
 * Affected saves can retain researched Trade technology and Trade Posts while
 * Terrifying is active. cleanAddTrait() owns the canonical transition into
 * purgatory, including route, queue, and market cleanup.
 */
export function repairTerrifyingTrade(){
    const imitatedTerrifying = global.race?.imitation && global.race?.terrifying && (
        global.race?.iTraits?.terrifying === 0 || global.race?.srace === 'balorg'
    );
    const activeLocalTrade = global.tech?.trade || global.city?.trade;

    if (imitatedTerrifying && activeLocalTrade){
        cleanAddTrait('terrifying');
    }
}

repairTerrifyingTrade();