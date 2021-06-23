import { global } from './vars.js';
import { biomes } from './races.js';
import { govRelationFactor } from './civics.js';
import { zigguratBonus } from './space.js';

export function production(id,val){
    switch (id){
        case 'oil_well':
        {
            let oil = global.tech['oil'] >= 4 ? 0.48 : 0.4;
            if (global.tech['oil'] >= 7){
                oil *= 2;
            }
            else if (global.tech['oil'] >= 5){
                oil *= global.tech['oil'] >= 6 ? 1.75 : 1.25;
            }
            if (global.city.geology['Oil']){
                oil *= global.city.geology['Oil'] + 1;
            }
            if (global.city.biome === 'desert'){
                oil *= biomes.desert.vars[1];
            }
            else if (global.city.biome === 'tundra'){
                oil *= biomes.tundra.vars[1];
            }
            return oil;
        }
        case 'iridium_mine':
        {
            switch (val){
                case 'iridium':
                {
                    let iridium = 0.035;
                    if (global.city.geology['Iridium']){
                        iridium *= global.city.geology['Iridium'] + 1;
                    }
                    return iridium * govRelationFactor(3) * zigguratBonus();
                }
                case 'coal':
                    return 0.55 * zigguratBonus();
            }
        }
        case 'helium_mine':
        {
            return 0.18 * govRelationFactor(3) * zigguratBonus();
        }
        case 'oil_extractor':
        {
            let oil = global.tech['oil'] >= 4 ? 0.48 : 0.4;
            if (global.tech['oil'] >= 7){
                oil *= 2;
            }
            else if (global.tech['oil'] >= 5){
                oil *= global.tech['oil'] >= 6 ? 1.75 : 1.25;
            }
            return oil * zigguratBonus();
        }
    }
}