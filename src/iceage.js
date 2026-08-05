import { global, seededRandom } from './vars.js';
import { loc } from './locale.js';
import { buildTemplate, actions, setAction, removeAction } from './actions.js';
import { clearElement, popover } from './functions.js';
import { checkRequirements } from './space.js';


const iceAgeModules = {
    underground:{
        cave: {
            stone: buildTemplate(`stone`,'underground'),
            basic_housing: {
                id: 'underground-basic_housing',
                title(){ return loc('underground_basic_housing'); },
                desc(){ return loc('underground_basic_housing_desc'); },
                type: 'housing',
                reqs: { housing: 1 },
                cost: {
                    Money(offset){
                        offset = offset || 0;
                        if ((global.underground['basic_housing'] || 0) + offset >= 5){
                            return undergroundCostMultiplier('basic_housing', offset, 20, 1.25);
                        }
                        else {
                            return 0;
                        }
                    },
                    Lumber(offset){ return global.race['kindling_kindred'] || global.race['smoldering'] ? 0 : undergroundCostMultiplier('basic_housing', offset, 10, 1.23); },
                    Stone(offset){ return global.race['kindling_kindred'] ? undergroundCostMultiplier('basic_housing', offset, 10, 1.23) : 0; },
                    Chrysotile(offset){ return global.race['smoldering'] ? undergroundCostMultiplier('basic_housing', offset, 10, 1.23) : 0; },
                    Horseshoe(){ return global.race['hooved'] ? 2 : 0; }
                },
                effect(){
                    let pop = $(this)[0].citizens();
                    return global.race['sappy'] ? `<div>${loc('plus_max_resource',[pop,loc('citizen')])}</div><div>${loc('city_grove_effect',[2.5])}</div>` : loc('plus_max_resource',[pop,loc('citizen')]);
                },
                action(args){
                    if (payCosts($(this)[0])){
                        incrementStruct($(this)[0]);
                        global['resource'][global.race.species].display = true;
                        global.settings.showCivic = true;
                        return true;
                    }
                    return false;
                },
                struct(){
                    return {
                        d: { count: 0 },
                        p: ['basic_housing','underground']
                    };
                },
                citizens(){
                    let pop = 2;
                    if (global.race['high_pop']){
                        pop *= traits.high_pop.vars()[0];
                    }
                    return pop;
                }
            }
        }
    },
    surface: {

    }
}
export function undergroundTech(){
    return iceAgeModules.underground;
}
export function surfaceTech(){
    return iceAgeModules.surface;
}

export function renderUnderground(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 8)){
        return;
    }
    if (!global.settings.showUnderground){
        return;
    }
    Object.keys(actions.underground).forEach(function (category) {
        clearElement($(`#underground-dist-${category}`),true);
        $(`<div id="underground-dist-${category}" class="city"></div>`)
            .appendTo('#underground')
            .append(`<div><h3 class="name has-text-warning">${loc(`underground_${category}`)}</h3></div>`);


        popover(`dist-${category}`, function(){
            return loc(`underground_${category}_desc`);
        },
        {
            elm: `#underground-dist-${category} h3`,
            classes: `has-background-light has-text-dark`
        });
        Object.keys(actions.underground[category]).forEach(function (name) {
            //removeAction(actions.underground[category][name].id);
            if(checkRequirements(actions.underground, category, name)){
                setAction(actions.underground[category][name], 'underground', category);
            }
        });
    })

}

export function renderSurface(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 9)){
        return;
    }
    if (!global.settings.showUnderground){
        return;
    }
}

function undergroundCostMultiplier(structure,offset,base,multiplier,cat){
    if (global.race.universe === 'micro'){
        multiplier -= darkEffect('micro',false);
    }

    if (global.race['small']){ multiplier -= traits.small.vars()[0]; }
    if (global.race['large']){ multiplier += traits.large.vars()[0]; }
    if (global.race['compact']){ multiplier -= traits.compact.vars()[0]; }
    //if (global.race['tunneler'] && (structure === 'mine' || structure === 'coal_mine')){ multiplier -= traits.tunneler.vars()[0]; }
    if (global.tech['housing_reduction'] && (structure === 'basic_housing' || structure === 'cottage')){
        multiplier -= global.tech['housing_reduction'] * 0.02;
    }
    if (global.tech['housing_reduction'] && structure === 'captive_housing'){
        multiplier -= global.tech['housing_reduction'] * 0.01;
    }
    if (structure === 'basic_housing'){
        if (global.race['solitary']){
            multiplier -= traits.solitary.vars()[0];
        }
        if (global.race['pack_mentality']){
            multiplier += traits.pack_mentality.vars()[0];
        }
    }
    if (structure === 'cottage'){
        if (global.race['solitary']){
            multiplier += traits.solitary.vars()[1];
        }
        if (global.race['pack_mentality']){
            multiplier -= traits.pack_mentality.vars()[1];
        }
    }
    if (structure === 'apartment'){
        if (global.race['pack_mentality']){
            multiplier -= traits.pack_mentality.vars()[1];
        }
    }
    if(global[cat]['support_beams']){
        //todo
    }
    if (global.genes['creep'] && !global.race['no_crispr']){
        multiplier -= global.genes['creep'] * 0.01;
    }
    else if (global.genes['creep'] && global.race['no_crispr']){
        multiplier -= global.genes['creep'] * 0.002;
    }
    let nqVal = govActive('noquestions',0);
    if (nqVal){
        multiplier -= nqVal;
    }
    if (multiplier < 1.005){
        multiplier = 1.005;
    }
    var count = structure === 'citizen' ? highPopAdjust(global['resource'][global.race.species].amount) : (global[cat][structure] ? global[cat][structure].count : 0);
    if (offset){
        count += offset;
    }
    return Math.round((multiplier ** count) * base);
}