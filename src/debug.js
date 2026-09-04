import { global, breakdown } from './vars.js';
import { deepClone, adjustCosts, messageQueue } from './functions.js';
import { races, traits } from './races.js';
import { craftCost, tradeRatio, atomic_mass, tradeBuyPrice, tradeSellPrice } from './resources.js';
import { actions, checkAffordable } from './actions.js';
import { fuel_adjust, int_fuel_adjust } from './space.js';
import { shipCosts } from './truepath.js';
import { starData, starInfo } from './stars.js';
import { f_rate } from './industry.js';
import { armyRating } from './civics.js';
import { alevel } from './achieve.js';
import { loc } from './locale.js';
import { supplyMode, supplyRegions, activeSupplyRegions, supplyRegionName, regionOf, supplyContainer,
         supplyPools, supplyPool, poolRegions, linkSupply, unlinkSupply, supplyLinked, storageShare,
         regAmount, regMax, splitSupply } from './supply.js';

export function enableDebug(){
    if (global.settings.expose){
        window.evolve = {
            actions: deepClone(actions),
            races: deepClone(races),
            traits: deepClone(traits),
            tradeRatio: deepClone(tradeRatio),
            craftCost: deepClone(craftCost(true)),
            atomic_mass: deepClone(atomic_mass),
            f_rate: deepClone(f_rate),
            checkAffordable: deepClone(checkAffordable),
            adjustCosts: deepClone(adjustCosts),
            armyRating: deepClone(armyRating),
            tradeBuyPrice: deepClone(tradeBuyPrice),
            tradeSellPrice: deepClone(tradeSellPrice),
            fuel_adjust: deepClone(fuel_adjust),
            int_fuel_adjust: deepClone(int_fuel_adjust),
            alevel: deepClone(alevel),
            messageQueue: deepClone(messageQueue),
            loc: deepClone(loc),
            shipCosts: deepClone(shipCosts),
            updateDebugData: deepClone(updateDebugData),
            global: {},
            breakdown: {},
            // Expose the live supply registry for debugging and scripts.
            supply: {
                mode: supplyMode,
                regions: supplyRegions,
                active: activeSupplyRegions,
                name: supplyRegionName,
                regionOf: regionOf,
                container: supplyContainer,
                pools: supplyPools,
                poolOf: supplyPool,
                members: poolRegions,
                link: linkSupply,
                unlink: unlinkSupply,
                linked: supplyLinked,
                share: storageShare,
                held: regAmount,
                room: regMax,
                split: splitSupply,
            },
        };
        if (global['beta']){
            window.evolve['starData'] = deepClone(starData);
            window.evolve['starInfo'] = starInfo;
        }
    }
}

export function updateDebugData(){
    if (global.settings.expose){
        window.evolve.global = deepClone(global);
        window.evolve.craftCost = deepClone(craftCost(true)),
        window.evolve.breakdown = deepClone(breakdown);
    }
}
