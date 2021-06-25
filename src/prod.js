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
                    let base = iridium * zigguratBonus();
                    let gov = govRelationFactor(3);
                    return {
                        b: base,
                        g: gov - 1,
                        f: base * gov
                    };
                }
                case 'coal':
                    return 0.55 * zigguratBonus();
            }
        }
        case 'helium_mine':
        {
            let base = 0.18 * zigguratBonus();
            let gov = govRelationFactor(3);
            return {
                b: base,
                g: gov - 1,
                f: base * gov
            };
        }
        case 'red_mine':
        {
            switch (val){
                case 'copper':
                {
                    let base = 0.25 * zigguratBonus();
                    let gov = govRelationFactor(3);
                    return {
                        b: base,
                        g: gov - 1,
                        f: base * gov
                    };
                }
                case 'titanium':
                {
                    let base = 0.02 * zigguratBonus();
                    let gov = govRelationFactor(3);
                    return {
                        b: base,
                        g: gov - 1,
                        f: base * gov
                    };
                }
                case 'stone':
                    return 0.75 * zigguratBonus();
                case 'asbestos':
                    return 1.25 * zigguratBonus();
                case 'aluminium':
                    return 0.066 * zigguratBonus();
            }
        }
        case 'biodome':
        {
            switch (val){
                case 'food':
                    return 0.25 * zigguratBonus();
                case 'cat_food':
                    return 2 * zigguratBonus();
                case 'lumber':
                    return 1.5 * zigguratBonus();
            }
        }
        case 'gas_mining':
        {
            return (global.tech['helium'] ? 0.65 : 0.5) * zigguratBonus();
        }
        case 'outpost':
        {
            let vals = {
                b: 0.025 * zigguratBonus(),
                d: 0,
                n: 0
            };
            if (global.tech['drone']){
                let rate = global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 3 ? 0.12 : 0.06;
                vals.d = global.space.drone.count * rate;
                vals.n = vals.b * (1 + (vals.d));
            }
            else {
                vals.n = vals.b;
            }

            return val ? vals : vals.n;
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
        case 'elerium_ship':
        {
            return (global.tech.asteroid >= 6 ? (global.tech.asteroid >= 7 ? 0.009 : 0.0075) : 0.005) * zigguratBonus();
        }
        case 'iridium_ship':
        {
            return (global.tech.asteroid >= 6 ? (global.tech.asteroid >= 7 ? 0.1 : 0.08) : 0.055) * zigguratBonus()
        }
        case 'iron_ship':
        {
            return (global.tech.asteroid >= 6 ? (global.tech.asteroid >= 7 ? 4 : 3) : 2) * zigguratBonus();
        }
        case 'harvester':
        {
            switch (val){
                case 'helium':
                    return 0.85 * zigguratBonus();
                case 'deuterium':
                    return 0.15 * zigguratBonus();
            }
        }
        case 'elerium_prospector':
        {
            return 0.014 * zigguratBonus();
        }
        case 'neutron_miner':
        {
            return 0.055 * zigguratBonus();
        }
        case 'bolognium_ship':
        {
            return 0.008 * zigguratBonus();
        }
        case 'vitreloy_plant':
        {
            let vitreloy = 0.18 * zigguratBonus();
            if (global.civic.govern.type === 'corpocracy'){
                vitreloy *= global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? 1.4 : 1.3;
            }
            if (global.civic.govern.type === 'socialist'){
                vitreloy *= 1.1;
            }
            return vitreloy;
        }
    }
}