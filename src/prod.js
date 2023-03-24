import { global, p_on } from './vars.js';
import { biomes, traits } from './races.js';
import { govRelationFactor } from './civics.js';
import { jobScale } from './jobs.js';
import { hellSupression } from './portal.js';
import { flib } from './functions.js';
import { govActive } from './governor.js';

export function highPopAdjust(v){
    if (global.race['high_pop']){
        v *= traits.high_pop.vars()[1] / 100;
    }
    return v;
}

export function production(id,val){
    switch (id){
        case 'transmitter':
        {
            return 2.5;
        }
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
                oil *= biomes.desert.vars()[1];
            }
            else if (global.city.biome === 'tundra'){
                oil *= biomes.tundra.vars()[1];
            }
            else if (global.city.biome === 'taiga'){
                oil *= biomes.taiga.vars()[2];
            }
            let dirtVal = govActive('dirty_jobs',2);
            if (dirtVal){
                oil *= 1 + (dirtVal / 100);
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
                    let base = iridium;
                    let gov = govRelationFactor(3);
                    return {
                        b: base,
                        g: gov - 1,
                        f: base * gov
                    };
                }
                case 'coal':
                    return 0.55;
            }
        }
        case 'helium_mine':
        {
            let base = 0.18;
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
                    let base = highPopAdjust(0.25);
                    let gov = govRelationFactor(3);
                    return {
                        b: base,
                        g: gov - 1,
                        f: base * gov
                    };
                }
                case 'titanium':
                {
                    let base = highPopAdjust(0.02);
                    let gov = govRelationFactor(3);
                    return {
                        b: base,
                        g: gov - 1,
                        f: base * gov
                    };
                }
                case 'stone':
                    return highPopAdjust(0.75);
                case 'asbestos':
                    return highPopAdjust(1.25);
                case 'aluminium':
                    return highPopAdjust(0.066);
            }
        }
        case 'biodome':
        {
            switch (val){
                case 'food':
                    return highPopAdjust(0.25);
                case 'cat_food':
                    return 2;
                case 'lumber':
                    return highPopAdjust(1.5);
            }
        }
        case 'gas_mining':
        {
            return (global.tech['helium'] ? 0.65 : 0.5);
        }
        case 'outpost':
        {
            let vals = {
                b: 0.025,
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
            return oil;
        }
        case 'elerium_ship':
        {
            return (global.tech.asteroid >= 6 ? (global.tech.asteroid >= 7 ? 0.009 : 0.0075) : 0.005);
        }
        case 'iridium_ship':
        {
            return (global.tech.asteroid >= 6 ? (global.tech.asteroid >= 7 ? 0.1 : 0.08) : 0.055);
        }
        case 'iron_ship':
        {
            return (global.tech.asteroid >= 6 ? (global.tech.asteroid >= 7 ? 4 : 3) : 2);
        }
        case 'g_factory':
        {
            if (global.race['truepath']){
                if (global.tech['isolation']){
                    return 1.8;
                }
                else {
                    let titan_colonists = p_on['ai_colonist'] ? global.civic.titan_colonist.workers + jobScale(p_on['ai_colonist']) : global.civic.titan_colonist.workers;
                    let gain = 0.05 * titan_colonists;
                    if (global.race['high_pop']){
                        gain = highPopAdjust(gain);
                    }
                    return gain;
                }
            }
            else {
                return 0.6;
            }
        }
        case 'harvester':
        {
            switch (val){
                case 'helium':
                    return 0.85;
                case 'deuterium':
                    return 0.15;
            }
        }
        case 'elerium_prospector':
        {
            return 0.014;
        }
        case 'neutron_miner':
        {
            return 0.055;
        }
        case 'bolognium_ship':
        {
            return 0.008;
        }
        case 'excavator':
        {
            return 0.2;
        }
        case 'vitreloy_plant':
        {
            let vitreloy = 0.18;
            if (global.civic.govern.type === 'corpocracy'){
                vitreloy *= global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? 1.4 : 1.3;
            }
            if (global.civic.govern.type === 'socialist'){
                vitreloy *= 1.1;
            }
            return vitreloy;
        }
        case 'infernite_mine':
        {
            let sup = hellSupression('gate');
            return 0.5 * sup.supress;
        }
        case 'water_freighter':
        {
            return 1.25;
        }
        case 'titan_mine':
        {
            switch (val){
                case 'adamantite':
                {
                    let base = highPopAdjust(0.02);
                    return base * (global.space['titan_mine'] ? global.space.titan_mine.ratio : 50) / 100;
                }
                case 'aluminium':
                {
                    let base = highPopAdjust(0.12);
                    return base * (100 - (global.space['titan_mine'] ? global.space.titan_mine.ratio : 50)) / 100;
                }
            }
        }
        case 'lander':
        {
            if (global.space.crashed_ship.count === 100){
                return 0.005;
            }
            return 0;
        }
        case 'orichalcum_mine':
        {
            return 0.08;
        }
        case 'uranium_mine':
        {
            return 0.025;
        }
        case 'neutronium_mine':
        {
            return 0.04;
        }
        case 'elerium_mine':
        {
            return 0.009;
        }
        case 'shock_trooper':
        {
            if (global.space.digsite.count === 100){
                return 0.0018;
            }
            return 0;
        }
        case 'tank':
        {
            if (global.space.digsite.count === 100){
                return 0.0018;
            }
            return 0;
        }
        case 'mining_pit':
        {
            let mats = 0;
            switch (val){
                case 'materials':
                {
                    mats = global.tech['isolation'] ? 0.12 : 0.09;
                    break;
                }
                case 'bolognium':
                {
                    mats = global.tech['isolation'] ? 0.0288 : 0.0216;
                    break;
                }
                case 'stone':
                {
                    mats = global.tech['isolation'] ? 0.8 : 0.6;
                    break;
                }
                case 'adamantite':
                {
                    mats = global.tech['isolation'] ? 0.448 : 0.336;
                    break;
                }
                case 'copper':
                {
                    mats = 0.58;
                    break;
                }
                case 'coal':
                {
                    mats = 0.13;
                    break;
                }
                case 'iron':
                {
                    mats = 0.74;
                    break;
                }
                case 'aluminium':
                {
                    mats = 0.88;
                    break;
                }
                case 'chrysotile':
                {
                    mats = 1.44;
                    break;
                }
            }
            if (global.race['tough']){
                mats *= 1 + (traits.tough.vars()[0] / 100);
            }
            if (global.tech['tau_pit_mining']){
                mats *= 1.18;
            }
            return mats;
        }
        case 'tau_farm':
        {
            switch (val){
                case 'food':
                {
                    return global.tech['isolation'] ? 15 : 9;
                }
                case 'lumber':
                {
                    return global.tech['isolation'] ? 12 : 5.5;
                }
                case 'water':
                {
                    return 0.35;
                }
            }
        }
        case 'womling_mine':
        {
            let boost = 1;
            if (global.tech['womling_mining']){
                boost += global.tech.womling_mining * 0.15;
            }
            if (global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5){
                boost *= 1.1;
            }
            if (global.tech['womling_gene']){
                boost *= 1.25;
            }

            switch (val){
                case 'unobtainium':
                {
                    return 0.0305 * boost;
                }
                case 'uranium':
                {
                    return 0.047 * boost;
                }
                case 'titanium':
                {
                    return 0.616 * boost;
                }
                case 'copper':
                {
                    return 1.191 * boost;
                }
                case 'iron':
                {
                    return 1.377 * boost;
                }
                case 'aluminium':
                {
                    return 1.544 * boost;
                }
                case 'neutronium':
                {
                    return 0.382 * boost;
                }
                case 'iridium':
                {
                    return 0.535 * boost;
                }
            }
        }
        case 'refueling_station':
        {
            return global.tech['isolation'] ? 18.5 : 9.35;
        }
        case 'ore_refinery':
        {
            return global.tech['tau_ore_mining'] ? 40 : 25;
        }
        case 'whaling_station':
        {
            return 12;
        }
        case 'mining_ship':
        {
            if (global.tauceti['patrol_ship']){
                let patrol = 1;
                if (global.tauceti.patrol_ship.support > global.tauceti.patrol_ship.s_max){
                    patrol = flib('curve',global.tauceti.patrol_ship.s_max / global.tauceti.patrol_ship.support,1.4);
                }
                return (global.tech['tau_ore_mining'] && global.tech.tau_ore_mining >= 2 ? 12 : 10) * patrol;
            }
            return 0;
        }
        case 'mining_ship_ore':
        {
            switch (val){
                case 'iron':
                {
                    return global.tech['isolation'] ? 2.22 : 1.85;
                }
                case 'aluminium':
                {
                    return global.tech['isolation'] ? 2.22 : 1.85;
                }
                case 'iridium':
                {
                    return global.tech['isolation'] ? 0.42 : 0.35;
                }
                case 'neutronium':
                {
                    return global.tech['isolation'] ? 0.42 : 0.35;
                }
                case 'orichalcum':
                {
                    return global.tech['isolation'] ? 0.3 : 0.25;
                }
                case 'elerium':
                {
                    return global.tech['isolation'] ? 0.024 : 0.02;
                }
            }
        }
        case 'whaling_ship':
        {
            if (global.tauceti['patrol_ship']){
                let patrol = 1;
                if (global.tauceti.patrol_ship.support > global.tauceti.patrol_ship.s_max){
                    patrol = flib('curve',global.tauceti.patrol_ship.s_max / global.tauceti.patrol_ship.support,1.4);
                }
                return 8 * patrol;
            }
            return 0;
        }
        case 'whaling_ship_oil':
        {
            return global.tech['isolation'] ? 0.78 : 0.42;
        }
        case 'alien_outpost':
        {
            return 0.01;
        }
    }
}
