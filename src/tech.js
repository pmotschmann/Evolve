import { global, save, webWorker, p_on } from './vars.js';
import { loc } from './locale.js';
import { vBind, clearElement, calcQueueMax, calcRQueueMax, calcPrestige, messageQueue, clearPopper, popCost } from './functions.js';
import { unlockAchieve, alevel, universeAffix, unlockFeat } from './achieve.js';
import { payCosts, housingLabel, wardenLabel, structName, updateQueueNames, drawTech, fanaticism, checkAffordable, actions, initStruct } from './actions.js';
import { races, checkAltPurgatory, renderPsychicPowers, renderSupernatural, traitCostMod } from './races.js';
import { drawResourceTab, resource_values, atomic_mass } from './resources.js';
import { loadFoundry, jobScale } from './jobs.js';
import { buildGarrison, checkControlling, govTitle } from './civics.js';
import { renderSpace, planetName, int_fuel_adjust } from './space.js';
import { drawHellObservations } from './portal.js';
import { setOrbits, jumpGateShutdown } from './truepath.js';
import { arpa } from './arpa.js';
import { setPowerGrid, defineIndustry, addSmelter } from './industry.js';
import { defineGovernor, removeTask } from './governor.js';
import { big_bang, cataclysm_end, descension, aiApocalypse } from './resets.js';

const techs = {
    club: {
        id: 'tech-club',
        title: loc('tech_club'),
        desc: loc('tech_club_desc'),
        category: 'agriculture',
        era: 'primitive',
        reqs: {},
        grant: ['primitive',1],
        cost: {
            Lumber(){ return global.race['kindling_kindred'] || global.race['smoldering'] ? 0 : 5; },
            Stone(){ return global.race['kindling_kindred'] || global.race['smoldering'] ? 5 : 0; }
        },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Food.display = true;
                return true;
            }
            return false;
        }
    },
    bone_tools: {
        id: 'tech-bone_tools',
        title: loc('tech_bone_tools'),
        desc: loc('tech_bone_tools_desc'),
        category: 'stone_gathering',
        era: 'primitive',
        reqs: { primitive: 1 },
        grant: ['primitive',2],
        condition(){
            return global.race['soul_eater'] && !global.race['evil'] ? false : true;
        },
        cost: {
            Food(){ return global.race['evil'] && !global.race['smoldering'] || global.race['fasting'] ? 0 : 10; },
            Lumber(){ return global.race['evil'] && !global.race['smoldering'] || global.race['fasting'] ? 10 : 0; }
        },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Stone.display = true;
                if (global.race['smoldering']){
                    global.resource.Chrysotile.display = true;
                }
                return true;
            }
            return false;
        }
    },
    wooden_tools: {
        id: 'tech-wooden_tools',
        title() {
            return global.race['kindling_kindred'] ? loc('tech_bone_tools') : loc('tech_wooden_tools');
        },
        desc() {
            return global.race['kindling_kindred'] ? loc('tech_bone_tools_desc') : loc('tech_wooden_tools_desc');
        },
        category: 'stone_gathering',
        era: 'primitive',
        reqs: { primitive: 1 },
        grant: ['primitive',2],
        condition(){
            return global.race['soul_eater'] && !global.race['evil'] ? true : false;
        },
        cost: {
            Lumber(){ return 10; }
        },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Stone.display = true;
                if (global.race['smoldering']){
                    global.resource.Chrysotile.display = true;
                }
                return true;
            }
            return false;
        }
    },
    sundial: {
        id: 'tech-sundial',
        title(){ return global.race['unfathomable'] ? loc('tech_moondial') : loc('tech_sundial'); },
        desc(){ return global.race['unfathomable'] ? loc('tech_moondial_desc') : loc('tech_sundial_desc'); },
        category: 'science',
        era: 'primitive',
        reqs: { primitive: 2 },
        condition(){ return !global.race['gravity_well'] || (global.race['gravity_well'] && global.tech['transport']) ? true : false; },
        grant: ['primitive',3],
        cost: {
            Lumber(){ return 8; },
            Stone(){ return 10; }
        },
        effect(){ return global.race['unfathomable'] ? loc('tech_moondial_effect') : loc('tech_sundial_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_sundial_msg'),'info',false,['progress']);
                global.resource.Knowledge.display = true;
                global.city.calendar.day++;
                if (global.race['infectious']){
                    global.civic.garrison.display = true;
                    global.settings.showCivic = true;
                    initStruct(actions.city.garrison);
                }
                if (global.race['banana'] && !global.race['terrifying']){
                    global.settings.showResources = true;
                    global.settings.showMarket = true;
                    global.resource.Money.display = true;
                    global.city.market.active = true;
                    global.tech['currency'] = 2;
                }
                if (global.race['calm']){
                    global.resource.Zen.display = true;
                    initStruct(actions.city.meditation);
                }
                return true;
            }
            return false;
        }
    },
    wheel: {
        id: 'tech-wheel',
        title(){ return loc('tech_wheel'); },
        desc(){ return loc('tech_wheel_desc'); },
        category: 'transport',
        era: 'primitive',
        reqs: { primitive: 2 },
        grant: ['transport',1],
        trait: ['gravity_well'],
        cost: {
            Lumber(){ return 50; },
            Stone(){ return 25; }
        },
        effect(){ return loc('tech_wheel_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.civic.teamster.display = true;
                return true;
            }
            return false;
        }
    },
    wagon: {
        id: 'tech-wagon',
        title(){ return loc('tech_wagon'); },
        desc(){ return loc('tech_wagon'); },
        category: 'transport',
        era: 'civilized',
        reqs: { transport: 1 },
        condition(){
            return global.tech['farm'] || global.tech['s_lodge'] || (global.tech['hunting'] && global.tech.hunting >= 2) || (global.race['soul_eater'] && global.race.species !== 'wendigo' && global.tech.housing >= 1 && global.tech.currency >= 1) ? true : false;
        },
        grant: ['transport',2],
        trait: ['gravity_well'],
        cost: {
            Knowledge(){ return 195; }
        },
        effect(){ return loc('tech_wagon_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steam_engine: {
        id: 'tech-steam_engine',
        title(){ return loc('tech_steam_engine'); },
        desc(){ return loc('tech_steam_engine'); },
        category: 'transport',
        era: 'discovery',
        reqs: { transport: 2, smelting: 3 },
        grant: ['transport',3],
        trait: ['gravity_well'],
        cost: {
            Knowledge(){ return 14345; }
        },
        effect(){ return loc('tech_steam_engine_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    combustion_engine: {
        id: 'tech-combustion_engine',
        title(){ return loc('tech_combustion_engine'); },
        desc(){ return loc('tech_combustion_engine'); },
        category: 'transport',
        era: 'industrialized',
        reqs: { transport: 3, oil: 3 },
        grant: ['transport',4],
        trait: ['gravity_well'],
        cost: {
            Knowledge(){ return 46777; }
        },
        effect(){ return loc('tech_combustion_engine_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    hover_cart: {
        id: 'tech-hover_cart',
        title(){ return loc('tech_hover_cart'); },
        desc(){ return loc('tech_hover_cart'); },
        category: 'transport',
        era: 'deep_space',
        reqs: { transport: 4, elerium: 1 },
        grant: ['transport',5],
        trait: ['gravity_well'],
        cost: {
            Knowledge(){ return 284000; }
        },
        effect(){ return loc('tech_hover_cart_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    osha: {
        id: 'tech-osha',
        title(){ return loc('tech_osha'); },
        desc(){ return loc('tech_osha'); },
        category: 'transport',
        era: 'industrialized',
        reqs: { transport: 3, high_tech: 3 },
        grant: ['teamster',1],
        trait: ['gravity_well'],
        cost: {
            Knowledge(){ return 28262; }
        },
        effect(){ return loc('tech_osha_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.civic.teamster.stress = 6;
                return true;
            }
            return false;
        }
    },
    blackmarket: {
        id: 'tech-blackmarket',
        title(){ return loc('tech_blackmarket'); },
        desc(){ return loc('tech_blackmarket'); },
        category: 'transport',
        era: 'industrialized',
        reqs: { teamster: 1, currency: 5 },
        grant: ['teamster',2],
        trait: ['gravity_well'],
        cost: {
            Knowledge(){ return 40666; }
        },
        effect(){ return loc('tech_blackmarket_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pipelines: {
        id: 'tech-pipelines',
        title(){ return loc('tech_pipelines'); },
        desc(){ return loc('tech_pipelines'); },
        category: 'transport',
        era: 'globalized',
        reqs: { teamster: 2, high_tech: 6 },
        grant: ['teamster',3],
        trait: ['gravity_well'],
        cost: {
            Knowledge(){ return 95000; }
        },
        effect(){ return loc('tech_pipelines_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    housing: {
        id: 'tech-housing',
        title: loc('tech_housing'),
        desc: loc('tech_housing_desc'),
        category: 'housing',
        era: 'civilized',
        reqs: { primitive: 3 },
        grant: ['housing',1],
        cost: {
            Knowledge(){ return 10; }
        },
        effect: loc('tech_housing_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.basic_housing);
                return true;
            }
            return false;
        }
    },
    cottage: {
        id: 'tech-cottage',
        title(){
            return housingLabel('medium');
        },
        desc: loc('tech_cottage_desc'),
        category: 'housing',
        era: 'civilized',
        reqs: { housing: 1, cement: 1, mining: 3 },
        grant: ['housing',2],
        cost: {
            Knowledge(){ return 3600; }
        },
        effect: loc('tech_cottage_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.cottage);
                return true;
            }
            return false;
        }
    },
    apartment: {
        id: 'tech-apartment',
        title(){
            return housingLabel('large');
        },
        desc(){
            return housingLabel('large');
        },
        category: 'housing',
        era: 'discovery',
        reqs: { housing: 2, high_tech: 2 },
        grant: ['housing',3],
        cost: {
            Knowledge(){ return 15750; }
        },
        effect: loc('tech_apartment_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.apartment);
                return true;
            }
            return false;
        }
    },
    arcology: {
        id: 'tech-arcology',
        title: loc('tech_arcology'),
        desc: loc('tech_arcology'),
        category: 'housing',
        era: 'dimensional',
        reqs: { hell_ruins: 4, housing: 3, high_tech: 17 },
        grant: ['housing',4],
        cost: {
            Knowledge(){ return 25000000; }
        },
        effect(){ return loc('tech_arcology_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_ruins.arcology);
                return true;
            }
            return false;
        }
    },
    steel_beams: {
        id: 'tech-steel_beams',
        title: loc('tech_steel_beams'),
        desc: loc('tech_housing_cost'),
        category: 'housing',
        era: 'discovery',
        reqs: { housing: 2, smelting: 2 },
        not_trait: ['cataclysm','lone_survivor'],
        grant: ['housing_reduction',1],
        cost: {
            Knowledge(){ return 11250; },
            Steel(){ return 2500; }
        },
        effect(){
            let label = housingLabel('small');
            let cLabel = housingLabel('medium');
            return loc('tech_steel_beams_effect',[label,cLabel]);
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mythril_beams: {
        id: 'tech-mythril_beams',
        title: loc('tech_mythril_beams'),
        desc: loc('tech_housing_cost'),
        category: 'housing',
        era: 'early_space',
        reqs: { housing_reduction: 1, space: 3 },
        grant: ['housing_reduction',2],
        cost: {
            Knowledge(){ return 175000; },
            Mythril(){ return 1000; }
        },
        effect(){
            let label = housingLabel('small');
            let cLabel = housingLabel('medium');
            return loc('tech_mythril_beams_effect',[label,cLabel]);
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    neutronium_walls: {
        id: 'tech-neutronium_walls',
        title: loc('tech_neutronium_walls'),
        desc: loc('tech_housing_cost'),
        category: 'housing',
        era: 'deep_space',
        reqs: { housing_reduction: 2, gas_moon: 1 },
        grant: ['housing_reduction',3],
        cost: {
            Knowledge(){ return 300000; },
            Neutronium(){ return 850; }
        },
        effect(){
            let label = housingLabel('small');
            let cLabel = housingLabel('medium');
            return loc('tech_neutronium_walls_effect',[label,cLabel]);
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    bolognium_alloy_beams: {
        id: 'tech-bolognium_alloy_beams',
        title: loc('tech_bolognium_alloy_beams'),
        desc: loc('tech_housing_cost'),
        category: 'housing',
        era: 'intergalactic',
        reqs: { housing_reduction: 3, gateway: 3 },
        grant: ['housing_reduction',4],
        cost: {
            Knowledge(){ return 3750000; },
            Adamantite(){ return 2500000; },
            Bolognium(){ return 100000; }
        },
        effect(){
            let label = housingLabel('small');
            let cLabel = housingLabel('medium');
            return loc('tech_bolognium_alloy_beams_effect',[label,cLabel]);
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    aphrodisiac: {
        id: 'tech-aphrodisiac',
        title: loc('tech_aphrodisiac'),
        desc: loc('tech_aphrodisiac_desc'),
        category: 'housing',
        era: 'civilized',
        reqs: { housing: 2 },
        grant: ['reproduction',1],
        not_trait: ['artifical'],
        cost: {
            Knowledge(){ return 4500; }
        },
        effect: loc('tech_aphrodisiac_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fertility_clinic: {
        id: 'tech-fertility_clinic',
        title: loc('tech_fertility_clinic'),
        desc: loc('tech_fertility_clinic'),
        category: 'housing',
        era: 'intergalactic',
        reqs: { reproduction: 1, xeno: 6 },
        not_trait: ['cataclysm'],
        grant: ['reproduction',2],
        cost: {
            Knowledge(){ return 4500000; }
        },
        effect: loc('tech_fertility_clinic_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    captive_housing: {
        id: 'tech-captive_housing',
        title: loc('tech_captive_housing'),
        desc: loc('tech_captive_housing'),
        category: 'eldritch',
        era: 'civilized',
        reqs: { housing: 1 },
        trait: ['unfathomable'],
        grant: ['unfathomable',1],
        cost: {
            Knowledge(){ return 12; }
        },
        effect: loc('tech_captive_housing_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.captive_housing);
                return true;
            }
            return false;
        }
    },
    torture: {
        id: 'tech-torture',
        title: loc('tech_torture'),
        desc: loc('tech_torture'),
        category: 'eldritch',
        era: 'civilized',
        reqs: { unfathomable: 1 },
        trait: ['unfathomable'],
        grant: ['unfathomable',2],
        cost: {
            Knowledge(){ return 25; }
        },
        effect: loc('tech_torture_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.torturer.display = true;
                return true;
            }
            return false;
        }
    },
    thrall_quarters: {
        id: 'tech-thrall_quarters',
        title: loc('tech_thrall_quarters'),
        desc: loc('tech_thrall_quarters'),
        category: 'eldritch',
        era: 'civilized',
        reqs: { unfathomable: 2, high_tech: 6 },
        trait: ['unfathomable'],
        grant: ['unfathomable',3],
        cost: {
            Knowledge(){ return 95000; },
            Cement(){ return 50000; },
            Wrought_Iron(){ return 12500; }
        },
        effect: loc('tech_thrall_quarters_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.torturer.display = true;
                return true;
            }
            return false;
        }
    },
    minor_wish: {
        id: 'tech-minor_wish',
        title: loc('tech_minor_wish'),
        desc: loc('tech_minor_wish'),
        category: 'paranormal',
        era: 'civilized',
        reqs: { housing: 1 },
        condition(){ return global.settings.showCivic; },
        trait: ['wish'],
        grant: ['wish',1],
        cost: {
            Knowledge(){ return 50; }
        },
        effect: loc('tech_minor_wish_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showWish = true;
                global.race['wishStats'] = { 
                    minor: 0, major: 0, plas: 0, tax: 0, bad: 0, fame: 0, troop: 0, 
                    prof: 0, potato: 0, priest: 0, temple: false, zigg: false, 
                    astro: false, casino: false, ship: false, gov: false, strong: false
                };
                return true;
            }
            return false;
        },
        post(){
            renderSupernatural();
        }
    },
    major_wish: {
        id: 'tech-major_wish',
        title: loc('tech_major_wish'),
        desc: loc('tech_major_wish'),
        category: 'paranormal',
        era: 'civilized',
        reqs: { wish: 1, high_tech: 7 },
        condition(){ return global.settings.showCivic; },
        trait: ['wish'],
        grant: ['wish',2],
        cost: {
            Knowledge(){ return 110000; }
        },
        effect: loc('tech_major_wish_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            renderSupernatural();
        }
    },
    psychic_energy: {
        id: 'tech-psychic_energy',
        title: loc('tech_psychic_energy'),
        desc: loc('tech_psychic_energy'),
        category: 'eldritch',
        era: 'civilized',
        reqs: { housing: 1 },
        condition(){ return global.settings.showCivic; },
        trait: ['psychic'],
        grant: ['psychic',1],
        cost: {
            Knowledge(){ return 15; }
        },
        effect: loc('tech_psychic_energy_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Energy.display = true;
                global.settings.showPsychic = true;
                global.race['psychicPowers'] = { boost: { r: 'Food' }, boostTime: 0 };
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_attack: {
        id: 'tech-psychic_attack',
        title: loc('tech_psychic_attack'),
        desc: loc('tech_psychic_attack'),
        category: 'eldritch',
        era: 'civilized',
        reqs: { psychic: 1, military: 1 },
        condition(){ return global.stats.psykill >= 10; },
        trait: ['psychic'],
        grant: ['psychic',2],
        cost: {
            Knowledge(){ return 100; }
        },
        effect: loc('tech_psychic_attack_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.race.psychicPowers['assaultTime'] = 0;
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_finance: {
        id: 'tech-psychic_finance',
        title: loc('tech_psychic_finance'),
        desc: loc('tech_psychic_finance'),
        category: 'eldritch',
        era: 'civilized',
        reqs: { psychic: 2, high_tech: 4 },
        trait: ['psychic'],
        grant: ['psychic',3],
        cost: {
            Knowledge(){ return 65000; }
        },
        effect: loc('tech_psychic_finance_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.race.psychicPowers['cash'] = 0;
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_channeling: {
        id: 'tech-psychic_channeling',
        title: loc('tech_psychic_channeling'),
        desc: loc('tech_psychic_channeling'),
        category: 'eldritch',
        era: 'deep_space',
        reqs: { psychic: 3, high_tech: 10 },
        trait: ['psychic'],
        grant: ['psychic',4],
        cost: {
            Knowledge(){ return 360000; }
        },
        effect: loc('tech_psychic_channeling_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.race.psychicPowers['channel'] = { cash: 0, assault: 0, boost: 0 };
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_efficiency: {
        id: 'tech-psychic_efficiency',
        title: loc('tech_psychic_efficiency'),
        desc: loc('tech_psychic_efficiency'),
        category: 'eldritch',
        era: 'intergalactic',
        reqs: { psychic: 4, high_tech: 16 },
        trait: ['psychic'],
        grant: ['psychic',5],
        cost: {
            Knowledge(){ return 5250000; }
        },
        effect: loc('tech_psychic_efficiency_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    mind_break: {
        id: 'tech-mind_break',
        title: loc('tech_mind_break'),
        desc: loc('tech_mind_break'),
        category: 'eldritch',
        era: 'civilized',
        reqs: { psychic: 2, high_tech: 1, unfathomable: 2 },
        trait: ['psychic'],
        grant: ['psychicthrall',1],
        cost: {
            Knowledge(){ return 7000; }
        },
        effect: loc('tech_mind_break_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_stun: {
        id: 'tech-psychic_stun',
        title: loc('tech_psychic_stun'),
        desc: loc('tech_psychic_stun'),
        category: 'eldritch',
        era: 'civilized',
        reqs: { psychicthrall: 1, high_tech: 3, unfathomable: 2 },
        trait: ['psychic'],
        grant: ['psychicthrall',2],
        cost: {
            Knowledge(){ return 32000; }
        },
        effect: loc('tech_psychic_stun_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    spear: {
        id: 'tech-spear',
        title: loc('tech_spear'),
        desc: loc('tech_spear_desc'),
        category: 'foraging',
        era: 'civilized',
        reqs: { primitive: 3, storage: 1 },
        trait: ['forager'],
        grant: ['foraging',1],
        cost: {
            Knowledge(){ return 110; },
            Stone(){ return 75; }
        },
        effect: loc('tech_spear_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    bronze_spear: {
        id: 'tech-bronze_spear',
        title: loc('tech_bronze_spear'),
        desc: loc('tech_bronze_spear_desc'),
        category: 'foraging',
        era: 'civilized',
        reqs: { foraging: 1, mining: 2 },
        trait: ['forager'],
        grant: ['foraging',2],
        cost: {
            Knowledge(){ return 525; },
            Copper(){ return 50; }
        },
        effect: loc('tech_bronze_spear_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_spear: {
        id: 'tech-iron_spear',
        title: loc('tech_iron_spear'),
        desc: loc('tech_iron_spear_desc'),
        category: 'foraging',
        era: 'civilized',
        reqs: { foraging: 2, mining: 3 },
        trait: ['forager'],
        grant: ['foraging',3],
        cost: {
            Knowledge(){ return global.city.ptrait.includes('unstable') ? 1650 : 3300; },
            Iron(){ return 375; }
        },
        effect: loc('tech_bronze_spear_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dowsing_rod: {
        id: 'tech-dowsing_rod',
        title: loc('tech_dowsing_rod'),
        desc: loc('tech_dowsing_rod_desc'),
        category: 'foraging',
        era: 'civilized',
        reqs: { foraging: 1, mining: 2 },
        trait: ['forager'],
        grant: ['dowsing',1],
        cost: {
            Knowledge(){ return 450; },
            Lumber(){ return 750; }
        },
        effect: loc('tech_dowsing_rod_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    metal_detector: {
        id: 'tech-metal_detector',
        title: loc('tech_metal_detector'),
        desc: loc('tech_metal_detector_desc'),
        category: 'foraging',
        era: 'civilized',
        reqs: { dowsing: 1, high_tech: 4 },
        trait: ['forager'],
        grant: ['dowsing',2],
        cost: {
            Knowledge(){ return 65000; }
        },
        effect: loc('tech_metal_detector_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    smokehouse: {
        id: 'tech-smokehouse',
        title(){ return global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt']) ? loc('city_smokehouse_easter') : loc('tech_smokehouse'); },
        desc(){ return global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt']) ? loc('tech_smokehouse_easter_desc') : loc('tech_smokehouse_desc'); },
        category: 'storage',
        era: 'civilized',
        reqs: { primitive: 3, storage: 1 },
        trait: ['carnivore'],
        not_trait: ['cataclysm','artifical','soul_eater','herbivore','lone_survivor'],
        grant: ['hunting',1],
        cost: {
            Knowledge(){ return 80; }
        },
        effect(){ return global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt']) ? loc('tech_smokehouse_easter_effect') : loc('tech_smokehouse_effect'); },
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','smokehouse','silo',actions.city.smokehouse.struct().d);
                return true;
            }
            return false;
        },
        post(){
            if (global.tech['s_lodge']){
                global.tech['hunting'] = 2;
            }
        }
    },
    lodge: {
        id: 'tech-lodge',
        title: loc('tech_lodge'),
        desc: loc('tech_lodge'),
        wiki: global.race['carnivore'] ? true : false,
        category: 'agriculture',
        era: 'civilized',
        reqs: { hunting: 1, housing: 1, currency: 1 },
        condition(){ return global.tech['s_lodge'] ? false : true; },
        grant: ['hunting',2],
        cost: {
            Knowledge(){ return 180; }
        },
        effect: loc('tech_lodge_effect'),
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','lodge','farm',actions.city.lodge.struct().d);
                return true;
            }
            return false;
        }
    },
    alt_lodge: {
        id: 'tech-alt_lodge',
        title(){ return this.condition() ? loc('tech_lodge_alt') : loc('tech_lodge'); },
        desc(){ return this.condition() ? loc('tech_lodge_alt') : loc('tech_lodge'); },
        wiki: global.race['carnivore'] ? false : true,
        category: 'housing',
        era: 'civilized',
        reqs: { housing: 1, currency: 1 },
        grant: ['s_lodge',1],
        condition(){
            return (((global.race.species === 'wendigo' || global.race['detritivore']) && !global.race['carnivore'] && !global.race['herbivore'])
              || (global.race['carnivore'] && global.race['soul_eater']) || global.race['artifical'] || global.race['unfathomable'] || global.race['forager']) ? true : false;
        },
        cost: {
            Knowledge(){ return global.race['artifical'] ? 10000 : 180; }
        },
        effect(){ return this.condition() ? loc('tech_lodge_effect_alt') : loc('tech_lodge_effect'); },
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','lodge','farm',actions.city.lodge.struct().d);
                return true;
            }
            return false;
        }
    },
    soul_well: {
        id: 'tech-soul_well',
        title: loc('tech_soul_well'),
        desc: loc('tech_soul_well'),
        category: 'souls',
        era: 'civilized',
        reqs: { primitive: 3 },
        trait: ['soul_eater'],
        not_trait: ['cataclysm','artifical','lone_survivor'],
        grant: ['soul_eater',1],
        cost: {
            Knowledge(){ return 10; }
        },
        effect: loc('tech_soul_well_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.soul_well);
                return true;
            }
            return false;
        }
    },
    compost: {
        id: 'tech-compost',
        title: loc('tech_compost'),
        desc: loc('tech_compost_desc'),
        category: 'compost',
        era: 'civilized',
        reqs: { primitive: 3 },
        trait: ['detritivore'],
        not_trait: ['cataclysm','artifical','lone_survivor'],
        grant: ['compost',1],
        cost: {
            Knowledge(){ return 10; }
        },
        effect: loc('tech_compost_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.compost);
                return true;
            }
            return false;
        }
    },
    hot_compost: {
        id: 'tech-hot_compost',
        title: loc('tech_hot_compost'),
        desc: loc('tech_hot_compost'),
        category: 'compost',
        era: 'civilized',
        reqs: { compost: 1 },
        trait: ['detritivore'],
        grant: ['compost',2],
        cost: {
            Knowledge(){ return 100; }
        },
        effect: loc('tech_hot_compost_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mulching: {
        id: 'tech-mulching',
        title: loc('tech_mulching'),
        desc: loc('tech_mulching'),
        category: 'compost',
        era: 'civilized',
        reqs: { compost: 2, mining: 3 },
        trait: ['detritivore'],
        grant: ['compost',3],
        cost: {
            Knowledge(){ return 3200; }
        },
        effect: loc('tech_mulching_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adv_mulching: {
        id: 'tech-adv_mulching',
        title: loc('tech_adv_mulching'),
        desc: loc('tech_adv_mulching'),
        category: 'compost',
        era: 'discovery',
        reqs: { compost: 3, high_tech: 2 },
        trait: ['detritivore'],
        grant: ['compost',4],
        cost: {
            Knowledge(){ return 16000; }
        },
        effect: loc('tech_adv_mulching_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    agriculture: {
        id: 'tech-agriculture',
        title: loc('tech_agriculture'),
        desc: loc('tech_agriculture_desc'),
        category: 'agriculture',
        era: 'civilized',
        reqs: { primitive: 3 },
        condition(){
            return (global.race['herbivore'] || (!global.race['carnivore'] && !global.race['detritivore'] && !global.race['soul_eater'])) ? true : false;
        },
        not_trait: ['cataclysm','artifical','lone_survivor','unfathomable','forager'],
        grant: ['agriculture',1],
        cost: {
            Knowledge(){ return 10; }
        },
        effect: loc('tech_agriculture_effect'),
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','farm','lodge',actions.city.farm.struct().d);
                return true;
            }
            return false;
        }
    },
    farm_house: {
        id: 'tech-farm_house',
        title: loc('tech_farm_house'),
        desc: loc('tech_farm_house_desc'),
        category: 'housing',
        era: 'civilized',
        reqs: { agriculture: 1, housing: 1, currency: 1 },
        grant: ['farm',1],
        cost: {
            Money(){ return 50; },
            Knowledge(){ return 180; }
        },
        effect: loc('tech_farm_house_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    irrigation: {
        id: 'tech-irrigation',
        title: loc('tech_irrigation'),
        desc: loc('tech_irrigation_desc'),
        category: 'agriculture',
        era: 'civilized',
        reqs: { agriculture: 1 },
        grant: ['agriculture',2],
        cost: {
            Knowledge(){ return 55; }
        },
        effect: loc('tech_irrigation_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    silo: {
        id: 'tech-silo',
        title: loc('tech_silo'),
        desc: loc('tech_silo_desc'),
        category: 'storage',
        era: 'civilized',
        reqs: { agriculture: 2, storage: 1 },
        grant: ['agriculture',3],
        cost: {
            Knowledge(){ return 80; }
        },
        effect: loc('tech_silo_effect'),
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','silo','smokehouse',actions.city.silo.struct().d);
                return true;
            }
            return false;
        }
    },
    mill: {
        id: 'tech-mill',
        title: loc('tech_mill'),
        desc: loc('tech_mill_desc'),
        category: 'agriculture',
        era: 'civilized',
        reqs: { agriculture: 3, mining: 3 },
        grant: ['agriculture',4],
        cost: {
            Knowledge(){ return 5400; }
        },
        effect: loc('tech_mill_effect'),
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','mill','windmill',actions.city.mill.struct().d);
                return true;
            }
            return false;
        }
    },
    windmill: {
        id: 'tech-windmill',
        title: loc('tech_windmill'),
        desc: loc('tech_windmill_desc'),
        category: 'agriculture',
        era: 'discovery',
        reqs: { agriculture: 4, high_tech: 1 },
        grant: ['agriculture',5],
        cost: {
            Knowledge(){ return 16200; }
        },
        effect: loc('tech_windmill_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    windturbine: {
        id: 'tech-windturbine',
        title: loc('tech_windturbine'),
        desc: loc('tech_windturbine'),
        category: 'power_generation',
        era: 'globalized',
        reqs: { agriculture: 5, high_tech: 4 },
        grant: ['agriculture',6],
        cost: {
            Knowledge(){ return 66000; }
        },
        effect: loc('tech_windturbine_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    wind_plant: {
        id: 'tech-wind_plant',
        title(){ return global.race['unfathomable'] ? loc('tech_watermill') : loc('tech_windmill'); },
        desc(){ return global.race['unfathomable'] ? loc('tech_watermill') : loc('tech_windmill'); },
        category: 'power_generation',
        era: 'globalized',
        reqs: { high_tech: 4 },
        condition(){
            return (global.race['carnivore'] || global.race['detritivore'] || global.race['artifical'] || global.race['soul_eater'] || global.race['unfathomable'] || global.race['forager']) ? true : false;
        },
        not_trait: ['herbivore'],
        grant: ['wind_plant',1],
        cost: {
            Knowledge(){ return 66000; }
        },
        effect(){ return global.race['unfathomable'] ? loc('tech_watermill_effect') : loc('tech_wind_plant_effect'); },
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','windmill','mill',actions.city.windmill.struct().d);
                return true;
            }
            return false;
        }
    },
    gmfood: {
        id: 'tech-gmfood',
        title: loc('tech_gmfood'),
        desc: loc('tech_gmfood_desc'),
        category: 'agriculture',
        era: 'globalized',
        reqs: { agriculture: 6, genetics: 1 },
        grant: ['agriculture',7],
        cost: {
            Knowledge(){ return 95000; }
        },
        effect: loc('tech_gmfood_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    foundry: {
        id: 'tech-foundry',
        title: loc('tech_foundry'),
        desc: loc('tech_foundry'),
        category: 'crafting',
        era: 'civilized',
        reqs: { mining: 2 },
        grant: ['foundry',1],
        cost: {
            Knowledge(){ return 650; }
        },
        effect: loc('tech_foundry_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.foundry);
                return true;
            }
            return false;
        }
    },
    artisans: {
        id: 'tech-artisans',
        title: loc('tech_artisans'),
        desc: loc('tech_artisans'),
        category: 'crafting',
        era: 'civilized',
        reqs: { foundry: 1 },
        grant: ['foundry',2],
        cost: {
            Knowledge(){ return 1500; }
        },
        effect: loc('tech_artisans_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    apprentices: {
        id: 'tech-apprentices',
        title: loc('tech_apprentices'),
        desc: loc('tech_apprentices'),
        category: 'crafting',
        era: 'civilized',
        reqs: { foundry: 2 },
        grant: ['foundry',3],
        cost: {
            Knowledge(){ return 3200; }
        },
        effect: loc('tech_apprentices_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    carpentry: {
        id: 'tech-carpentry',
        title: loc('tech_carpentry'),
        desc: loc('tech_carpentry'),
        category: 'crafting',
        era: 'civilized',
        reqs: { foundry: 3, saw: 1 },
        grant: ['foundry',4],
        not_trait: ['evil'],
        cost: {
            Knowledge(){ return 5200; }
        },
        effect: loc('tech_carpentry_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    demonic_craftsman: {
        id: 'tech-demonic_craftsman',
        title: loc('tech_master_craftsman'),
        desc: loc('tech_master_craftsman'),
        category: 'crafting',
        era: 'discovery',
        wiki: global.race['evil'] ? true : false,
        reqs: { foundry: 3 },
        grant: ['foundry',5],
        trait: ['evil'],
        cost: {
            Knowledge(){ return 12000; }
        },
        effect: loc('tech_master_craftsman_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    master_craftsman: {
        id: 'tech-master_craftsman',
        title: loc('tech_master_craftsman'),
        desc: loc('tech_master_craftsman'),
        category: 'crafting',
        era: 'discovery',
        wiki: global.race['evil'] ? false : true,
        reqs: { foundry: 4 },
        grant: ['foundry',5],
        not_trait: ['evil'],
        cost: {
            Knowledge(){ return 12000; }
        },
        effect: loc('tech_master_craftsman_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    brickworks: {
        id: 'tech-brickworks',
        title: loc('tech_brickworks'),
        desc: loc('tech_brickworks'),
        category: 'crafting',
        era: 'discovery',
        reqs: { foundry: 5 },
        grant: ['foundry',6],
        cost: {
            Knowledge(){ return 18500; }
        },
        effect: loc('tech_brickworks_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    machinery: {
        id: 'tech-machinery',
        title: loc('tech_machinery'),
        desc: loc('tech_machinery'),
        category: 'crafting',
        era: 'globalized',
        reqs: { foundry: 6, high_tech: 4 },
        grant: ['foundry',7],
        cost: {
            Knowledge(){ return 66000; }
        },
        effect: loc('tech_machinery_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    cnc_machine: {
        id: 'tech-cnc_machine',
        title: loc('tech_cnc_machine'),
        desc: loc('tech_cnc_machine'),
        category: 'crafting',
        era: 'globalized',
        reqs: { foundry: 7, high_tech: 8 },
        grant: ['foundry',8],
        cost: {
            Knowledge(){ return 132000; }
        },
        effect: loc('tech_cnc_machine_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    vocational_training: {
        id: 'tech-vocational_training',
        title: loc('tech_vocational_training'),
        desc: loc('tech_vocational_training'),
        category: 'crafting',
        era: 'industrialized',
        reqs: { foundry: 1, high_tech: 3 },
        grant: ['v_train',1],
        cost: {
            Knowledge(){ return 30000; }
        },
        effect: loc('tech_vocational_training_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    stellar_forge: {
        id: 'tech-stellar_forge',
        title: loc('tech_stellar_forge'),
        desc: loc('tech_stellar_forge'),
        category: 'crafting',
        era: 'intergalactic',
        reqs: { foundry: 8, high_tech: 15, gateway: 3, neutron: 1 },
        grant: ['star_forge',1],
        cost: {
            Knowledge(){ return 4500000; }
        },
        effect: loc('tech_stellar_forge_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_neutron.stellar_forge);
                return true;
            }
            return false;
        }
    },
    stellar_smelting: {
        id: 'tech-stellar_smelting',
        title: loc('tech_stellar_smelting'),
        desc: loc('tech_stellar_smelting'),
        category: 'crafting',
        era: 'intergalactic',
        reqs: { star_forge: 1, xeno: 4 },
        grant: ['star_forge',2],
        cost: {
            Knowledge(){ return 5000000; },
            Vitreloy(){ return 10000; }
        },
        effect: loc('tech_stellar_smelting_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            let num_forge_on = p_on['stellar_forge'];
            let num_new_smelters = num_forge_on * actions.interstellar.int_neutron.stellar_forge.smelting();
            addSmelter(num_new_smelters, 'Iron', 'Star');
            defineIndustry();
        }
    },
    assembly_line: {
        id: 'tech-assembly_line',
        title: loc('tech_assembly_line'),
        desc: loc('tech_assembly_line'),
        category: 'crafting',
        era: 'globalized',
        reqs: { high_tech: 4 },
        grant: ['factory',1],
        cost: {
            Knowledge(){ return 72000; },
            Copper(){ return 125000; }
        },
        effect: `<span>${loc('tech_assembly_line_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    automation: {
        id: 'tech-automation',
        title: loc('tech_automation'),
        desc: loc('tech_automation'),
        category: 'crafting',
        era: 'early_space',
        reqs: { high_tech: 8, factory: 1},
        grant: ['factory',2],
        cost: {
            Knowledge(){ return 165000; }
        },
        effect: `<span>${loc('tech_automation_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    laser_cutters: {
        id: 'tech-laser_cutters',
        title: loc('tech_laser_cutters'),
        desc: loc('tech_laser_cutters'),
        category: 'crafting',
        era: 'deep_space',
        reqs: { high_tech: 9, factory: 2 },
        grant: ['factory',3],
        cost: {
            Knowledge(){ return 300000; },
            Elerium(){ return 200; }
        },
        effect: `<span>${loc('tech_laser_cutters_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    high_tech_factories: {
        id: 'tech-high_tech_factories',
        title: loc('tech_high_tech_factories'),
        desc: loc('tech_high_tech_factories'),
        category: 'crafting',
        era: 'intergalactic',
        reqs: { high_tech: 17, alpha: 4, factory: 3 },
        grant: ['factory',4],
        cost: {
            Knowledge(){ return 13500000; },
            Vitreloy(){ return 500000; },
            Orichalcum(){ return 300000; }
        },
        effect: `<span>${loc('tech_high_tech_factories_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    banquet:{
        id: 'tech-banquet',
        title: loc('tech_banquet'),
        desc: loc('tech_banquet'),
        category: 'special',
        era: 'discovery',
        reqs: { high_tech: 2 },
        not_trait: ['fasting','cataclysm','lone_survivor'],
        grant: ['banquet',1],
        condition(){ return global.stats.achieve['endless_hunger'] && global.stats.achieve['endless_hunger'].l >= 1 ? true : false; },
        cost: {
            Knowledge(){ return 18500; }
        },
        effect: loc('tech_banquet_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.banquet);
                return true;
            }
            return false;
        }
    },
    theatre: {
        id: 'tech-theatre',
        title(){ return global.race.universe === 'evil' ? loc('tech_theatre_evil') : loc('tech_theatre'); },
        desc(){ return global.race.universe === 'evil' ? loc('tech_theatre_evil') : loc('tech_theatre'); },
        category: 'entertainment',
        era: 'civilized',
        reqs: { housing: 1, currency: 1, cement: 1 },
        grant: ['theatre',1],
        not_trait: ['joyless'],
        cost: {
            Knowledge(){ return 750; }
        },
        effect(){ return global.race.universe === 'evil' ? loc('tech_theatre_evil_effect') : loc('tech_theatre_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.amphitheatre);
                return true;
            }
            return false;
        }
    },
    playwright: {
        id: 'tech-playwright',
        title(){ return global.race.universe === 'evil' ? loc('tech_gladiators') : loc('tech_playwright'); },
        desc: loc('tech_playwright'),
        category: 'entertainment',
        era: 'civilized',
        reqs: { theatre: 1, science: 2 },
        grant: ['theatre',2],
        cost: {
            Knowledge(){ return 1080; }
        },
        effect(){ return global.race.universe === 'evil' ? loc('tech_gladiators_effect') : loc('tech_playwright_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    magic: {
        id: 'tech-magic',
        title(){ 
            switch(global.race.universe){
                case 'magic':
                    return loc('tech_illusionist');
                case 'evil':
                    return loc('tech_mock_battles');
                default:
                    return loc('tech_magic');
            }
        },
        desc(){ return $(this)[0].title(); },
        category: 'entertainment',
        era: 'discovery',
        reqs: { theatre: 2, high_tech: 1 },
        grant: ['theatre',3],
        cost: {
            Knowledge(){ return 7920; }
        },
        effect(){ 
            switch(global.race.universe){
                case 'magic':
                    return loc('tech_illusionist_effect');
                case 'evil':
                    return loc('tech_mock_battles_effect');
                default:
                    return loc('tech_magic_effect');
            }
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    superstars: {
        id: 'tech-superstars',
        title(){ return global.race.universe === 'evil' ? loc('tech_champions') : loc('tech_superstars'); },
        desc(){ return global.race.universe === 'evil' ? loc('tech_champions') : loc('tech_superstars'); },
        category: 'entertainment',
        era: 'interstellar',
        reqs: { theatre: 3, high_tech: 12 },
        grant: ['superstar',1],
        cost: {
            Knowledge(){ return 660000; }
        },
        effect(){ return global.race.universe === 'evil' ? loc('tech_champions_effect') : loc('tech_superstars_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    radio: {
        id: 'tech-radio',
        title: loc('tech_radio'),
        desc: loc('tech_radio'),
        category: 'entertainment',
        era: 'discovery',
        reqs: { theatre: 3, high_tech: 2 },
        grant: ['broadcast',1],
        cost: {
            Knowledge(){ return 16200; }
        },
        effect(){ return loc('tech_radio_effect',[wardenLabel()]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tv: {
        id: 'tech-tv',
        title: loc('tech_tv'),
        desc: loc('tech_tv'),
        category: 'entertainment',
        era: 'globalized',
        reqs: { broadcast: 1, high_tech: 4 },
        grant: ['broadcast',2],
        cost: {
            Knowledge(){ return 67500; }
        },
        effect(){ return loc('tech_tv_effect',[wardenLabel()]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    vr_center: {
        id: 'tech-vr_center',
        title: loc('tech_vr_center'),
        desc: loc('tech_vr_center'),
        category: 'entertainment',
        era: 'interstellar',
        reqs: { broadcast: 2, high_tech: 12, stanene: 1 },
        grant: ['broadcast',3],
        cost: {
            Knowledge(){ return 620000; }
        },
        effect(){ return loc('tech_vr_center_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.vr_center);
                return true;
            }
            return false;
        }
    },
    zoo: {
        id: 'tech-zoo',
        title: loc('tech_zoo'),
        desc: loc('tech_zoo'),
        category: 'entertainment',
        era: 'dimensional',
        reqs: { hell_ruins: 2 },
        grant: ['zoo',1],
        cost: {
            Knowledge(){ return 22500000; }
        },
        effect(){ return loc('tech_zoo_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.zoo);
                return true;
            }
            return false;
        }
    },
    casino: {
        id: 'tech-casino',
        title: structName('casino'),
        desc: structName('casino'),
        category: 'entertainment',
        era: 'globalized',
        reqs: { high_tech: 4, currency: 5 },
        grant: ['gambling',1],
        cost: {
            Knowledge(){ return 95000; }
        },
        effect: loc('tech_casino_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.casino);
                initStruct(actions.space.spc_hell.spc_casino);
                return true;
            }
            return false;
        }
    },
    dazzle: {
        id: 'tech-dazzle',
        title: loc('tech_dazzle'),
        desc: loc('tech_dazzle'),
        category: 'banking',
        era: 'globalized',
        reqs: { gambling: 1 },
        grant: ['gambling',2],
        cost: {
            Knowledge(){ return 125000; }
        },
        effect: loc('tech_dazzle_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    casino_vault: {
        id: 'tech-casino_vault',
        title: loc('tech_casino_vault'),
        desc: loc('tech_casino_vault'),
        category: 'banking',
        era: 'early_space',
        reqs: { gambling: 2, space: 3 },
        grant: ['gambling',3],
        cost: {
            Knowledge(){ return 145000; },
            Iridium(){ return 2500; }
        },
        effect: loc('tech_casino_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    otb: {
        id: 'tech-otb',
        title: loc('tech_otb'),
        desc: loc('tech_otb'),
        category: 'banking',
        era: 'deep_space',
        reqs: { gambling: 3, banking: 10, high_tech: 10 },
        grant: ['gambling',4],
        cost: {
            Knowledge(){ return 390000; }
        },
        effect: loc('tech_otb_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    online_gambling: {
        id: 'tech-online_gambling',
        title: loc('tech_online_gambling'),
        desc: loc('tech_online_gambling'),
        category: 'banking',
        era: 'interstellar',
        reqs: { gambling: 4, banking: 12 },
        grant: ['gambling',5],
        cost: {
            Knowledge(){ return 800000; }
        },
        effect: loc('tech_online_gambling_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    bolognium_vaults: {
        id: 'tech-bolognium_vaults',
        title: loc('tech_bolognium_vaults'),
        desc: loc('tech_bolognium_vaults'),
        category: 'banking',
        era: 'intergalactic',
        reqs: { gambling: 5, gateway: 3 },
        grant: ['gambling',6],
        cost: {
            Knowledge(){ return 3900000; },
            Bolognium(){ return 180000; }
        },
        effect: loc('tech_bolognium_vaults_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mining: {
        id: 'tech-mining',
        title(){ return global.race['sappy'] ? loc('tech_amber') : loc('tech_mining'); },
        desc(){ return global.race['sappy'] ? loc('tech_amber') : loc('tech_mining_desc'); },
        category: 'mining',
        era: 'civilized',
        reqs: { primitive: 3 },
        grant: ['mining',1],
        cost: {
            Knowledge(){ return 45; }
        },
        effect(){ return global.race['sappy'] ? loc('tech_amber_effect') : loc(global.race['flier'] ? 'tech_mining_effect_alt' : 'tech_mining_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.rock_quarry);
                if (global.race['cannibalize']){
                    initStruct(actions.city.s_alter);
                }
                return true;
            }
            return false;
        }
    },
    bayer_process: {
        id: 'tech-bayer_process',
        title: loc('tech_bayer_process'),
        desc: loc('tech_bayer_process_desc'),
        category: 'mining',
        era: 'civilized',
        reqs: { smelting: 2 },
        grant: ['alumina',1],
        cost: {
            Knowledge(){ return 4500; }
        },
        effect(){ return global.race['sappy'] ? loc('tech_bayer_process_effect_alt') : loc('tech_bayer_process_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.metal_refinery);
                loadFoundry();
                return true;
            }
            return false;
        }
    },
    elysis_process: {
        id: 'tech-elysis_process',
        title: loc('tech_elysis_process'),
        desc: loc('tech_elysis_process'),
        category: 'mining',
        era: 'interstellar',
        reqs: { alumina: 1, stanene: 1, graphene: 1 },
        path: ['standard','truepath'],
        not_trait: ['cataclysm','lone_survivor'],
        grant: ['alumina',2],
        cost: {
            Knowledge(){ return 675000; },
            Graphene(){ return 45000; },
            Stanene(){ return 75000; },
        },
        effect: loc('tech_elysis_process_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    smelting: {
        id: 'tech-smelting',
        title: loc('tech_smelting'),
        desc: loc('tech_smelting_desc'),
        category: 'mining',
        era: 'civilized',
        reqs: { mining: 3 },
        grant: ['smelting',1],
        cost: {
            Knowledge(){ return 4050; }
        },
        effect: loc('tech_smelting_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.smelter);
                return true;
            }
            return false;
        },
        post(){
            if (global.race['steelen']){
                global.tech['smelting'] = 2;
                drawTech();
            }
        }
    },
    steel: {
        id: 'tech-steel',
        title: loc('tech_steel'),
        desc: loc('tech_steel_desc'),
        category: 'mining',
        era: 'civilized',
        reqs: { smelting: 1, mining: 4 },
        grant: ['smelting',2],
        condition() {
            return global.race['steelen'] ? false : true;
        },
        cost: {
            Knowledge(){ return 4950; },
            Steel(){ return 25; }
        },
        effect: loc('tech_steel_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Steel.display = true;
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
            renderPsychicPowers();
        }
    },
    blast_furnace: {
        id: 'tech-blast_furnace',
        title: loc('tech_blast_furnace'),
        desc: loc('tech_blast_furnace'),
        category: 'mining',
        era: 'discovery',
        reqs: { smelting: 2 },
        grant: ['smelting',3],
        cost: {
            Knowledge(){ return 13500; },
            Coal(){ return 2000; }
        },
        effect: loc('tech_blast_furnace_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            if (global.race['steelen']){
                global.tech['smelting'] = 6;
                drawTech();
            }
        }
    },
    bessemer_process: {
        id: 'tech-bessemer_process',
        title: loc('tech_bessemer_process'),
        desc: loc('tech_bessemer_process'),
        category: 'mining',
        era: 'discovery',
        reqs: { smelting: 3 },
        grant: ['smelting',4],
        condition() {
            return global.race['steelen'] ? false : true;
        },
        cost: {
            Knowledge(){ return 19800; },
            Coal(){ return 5000; }
        },
        effect: loc('tech_bessemer_process_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    oxygen_converter: {
        id: 'tech-oxygen_converter',
        title: loc('tech_oxygen_converter'),
        desc: loc('tech_oxygen_converter'),
        category: 'mining',
        era: 'industrialized',
        reqs: { smelting: 4, high_tech: 3 },
        grant: ['smelting',5],
        condition() {
            return global.race['steelen'] ? false : true;
        },
        cost: {
            Knowledge(){ return 46800; },
            Coal(){ return 10000; }
        },
        effect: loc('tech_oxygen_converter_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    electric_arc_furnace: {
        id: 'tech-electric_arc_furnace',
        title: loc('tech_electric_arc_furnace'),
        desc: loc('tech_electric_arc_furnace'),
        category: 'mining',
        era: 'globalized',
        reqs: { smelting: 5, high_tech: 4 },
        grant: ['smelting',6],
        condition() {
            return global.race['steelen'] ? false : true;
        },
        cost: {
            Knowledge(){ return 85500; },
            Copper(){ return 25000; }
        },
        effect: loc('tech_electric_arc_furnace_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    hellfire_furnace: {
        id: 'tech-hellfire_furnace',
        title: loc('tech_hellfire_furnace'),
        desc: loc('tech_hellfire_furnace'),
        category: 'mining',
        era: 'interstellar',
        reqs: { smelting: 6, infernite: 1 },
        grant: ['smelting',7],
        cost: {
            Knowledge(){ return 615000; },
            Infernite(){ return 2000; },
            Soul_Gem(){ return 2; }
        },
        effect: loc('tech_hellfire_furnace_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    infernium_fuel: {
        id: 'tech-infernium_fuel',
        title: loc('tech_infernium_fuel'),
        desc: loc('tech_infernium_fuel'),
        category: 'mining',
        era: 'dimensional',
        reqs: { smelting: 7, hell_ruins: 4 },
        grant: ['smelting',8],
        cost: {
            Knowledge(){ return 27500000; },
            Coal(){ return 45000000; },
            Oil(){ return 500000; },
            Infernite(){ return 750000; }
        },
        effect: loc('tech_infernium_fuel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
        }
    },
    iridium_smelting_perk: {
        id: 'tech-iridium_smelting_perk',
        title: loc('tech_iridium_smelting'),
        desc: loc('tech_iridium_smelting'),
        category: 'mining',
        era: 'early_space',
        path: ['standard'],
        reqs: { smelting: 6, space: 3 },
        condition(){ return global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 3 ? true : false; },
        grant: ['irid_smelting',1],
        cost: {
            Knowledge(){ return 350000; },
            Mythril(){ return 2500; }
        },
        effect: loc('tech_iridium_smelting_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    rotary_kiln: {
        id: 'tech-rotary_kiln',
        title: loc('tech_rotary_kiln'),
        desc: loc('tech_rotary_kiln'),
        category: 'mining',
        era: 'industrialized',
        reqs: { smelting: 3, high_tech: 3 },
        grant: ['copper',1],
        cost: {
            Knowledge(){ return 57600; },
            Coal(){ return 8000; }
        },
        effect: loc('tech_rotary_kiln_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    metal_working: {
        id: 'tech-metal_working',
        title: loc('tech_metal_working'),
        desc: loc('tech_metal_working_desc'),
        category: 'mining',
        era: 'civilized',
        reqs: { mining: 1 },
        grant: ['mining',2],
        cost: {
            Knowledge(){ return 350; }
        },
        effect: loc('tech_metal_working_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.mine);
                return true;
            }
            return false;
        }
    },
    iron_mining: {
        id: 'tech-iron_mining',
        title: loc('tech_iron_mining'),
        desc: loc('tech_iron_mining_desc'),
        category: 'mining',
        era: 'civilized',
        reqs: { mining: 2 },
        grant: ['mining',3],
        cost: {
            Knowledge(){ return global.city.ptrait.includes('unstable') ? 500 : 2500; }
        },
        effect: loc('tech_iron_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Iron.display = true;
                if (global.city['foundry'] && global.city['foundry'].count > 0){
                    global.resource.Wrought_Iron.display = true;
                    loadFoundry();
                }
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    coal_mining: {
        id: 'tech-coal_mining',
        title: loc('tech_coal_mining'),
        desc: loc('tech_coal_mining_desc'),
        category: 'power_generation',
        era: 'civilized',
        reqs: { mining: 3 },
        grant: ['mining',4],
        cost: {
            Knowledge(){ return 4320; }
        },
        effect: loc('tech_coal_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.coal_mine);
                global.resource.Coal.display = true;
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    storage: {
        id: 'tech-storage',
        title: loc('tech_storage'),
        desc: loc('tech_storage_desc'),
        category: 'storage',
        era: 'civilized',
        reqs: { primitive: 3, currency: 1 },
        grant: ['storage',1],
        cost: {
            Knowledge(){ return 20; }
        },
        effect: loc('tech_storage_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.shed);
                return true;
            }
            return false;
        }
    },
    reinforced_shed: {
        id: 'tech-reinforced_shed',
        title: loc('tech_reinforced_shed'),
        desc: loc('tech_reinforced_shed_desc'),
        category: 'storage',
        era: 'civilized',
        reqs: { storage: 1, cement: 1, mining: 3 },
        grant: ['storage',2],
        cost: {
            Money(){ return 3750; },
            Knowledge(){ return 2550; },
            Iron(){ return 750; },
            Cement(){ return 500; }
        },
        effect: loc('tech_reinforced_shed_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    barns: {
        id: 'tech-barns',
        title: loc('tech_barns'),
        desc: loc('tech_barns_desc'),
        category: 'storage',
        era: 'discovery',
        reqs: { storage: 2, smelting: 2, alumina: 1 },
        grant: ['storage',3],
        cost: {
            Knowledge(){ return 15750; },
            Aluminium(){ return 3000; },
            Steel(){ return 3000; }
        },
        effect: loc('tech_barns_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            updateQueueNames(false, ['city-shed']);
        }
    },
    warehouse: {
        id: 'tech-warehouse',
        title: loc('tech_warehouse'),
        desc: loc('tech_warehouse_desc'),
        category: 'storage',
        era: 'industrialized',
        reqs: { storage: 3, high_tech: 3, smelting: 2 },
        grant: ['storage',4],
        cost: {
            Knowledge(){ return 40500; },
            Titanium(){ return 3000; }
        },
        effect: loc('tech_warehouse_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            updateQueueNames(false, ['city-shed']);
        }
    },
    cameras: {
        id: 'tech-cameras',
        title: loc('tech_cameras'),
        desc: loc('tech_cameras_desc'),
        category: 'storage',
        era: 'globalized',
        reqs: { storage: 4, high_tech: 4 },
        grant: ['storage',5],
        cost: {
            Money(){ return 90000; },
            Knowledge(){ return 65000; }
        },
        effect: loc('tech_cameras_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pocket_dimensions: {
        id: 'tech-pocket_dimensions',
        title: loc('tech_pocket_dimensions'),
        desc: loc('tech_pocket_dimensions_desc'),
        category: 'storage',
        era: 'early_space',
        path: ['standard'],
        reqs: { particles: 1, storage: 5 },
        grant: ['storage',6],
        cost: {
            Knowledge(){ return 108000; }
        },
        effect: loc('tech_pocket_dimensions_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ai_logistics: {
        id: 'tech-ai_logistics',
        title: loc('tech_ai_logistics'),
        desc: loc('tech_ai_logistics'),
        category: 'storage',
        era: 'interstellar',
        reqs: { storage: 6, proxima: 2, science: 13 },
        grant: ['storage',7],
        cost: {
            Knowledge(){ return 650000; }
        },
        effect: loc('tech_ai_logistics_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    containerization: {
        id: 'tech-containerization',
        title: loc('tech_containerization'),
        desc: loc('tech_containerization_desc'),
        category: 'storage',
        era: 'civilized',
        reqs: { cement: 1, mining: 1, storage: 1, science: 1 },
        grant: ['container',1],
        cost: {
            Knowledge(){ return 2700; }
        },
        effect: loc('tech_containerization_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.storage_yard);
                return true;
            }
            return false;
        }
    },
    reinforced_crates: {
        id: 'tech-reinforced_crates',
        title: loc('tech_reinforced_crates'),
        desc: loc('tech_reinforced_crates'),
        category: 'storage',
        era: 'civilized',
        reqs: { container: 1, smelting: 2 },
        grant: ['container',2],
        cost: {
            Knowledge(){ return 6750; },
            Sheet_Metal(){ return 100; }
        },
        effect() {
            if (global.race['smoldering'] || global.race['kindling_kindred'] || global.race['evil']){
                let res = loc('resource_Bones_name');
                if (global.race['smoldering']){
                    res = loc('resource_Chrysotile_name');
                }
                else if (global.race['kindling_kindred']){
                    res = loc('resource_Stone_name');
                }
                return loc('tech_reinforced_crates_alt_effect',[res]);
            }
            else {
                return loc('tech_reinforced_crates_effect');
            }
        },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    cranes: {
        id: 'tech-cranes',
        title: loc('tech_cranes'),
        desc: loc('tech_cranes_desc'),
        category: 'storage',
        era: 'discovery',
        reqs: { container: 2, high_tech: 2 },
        grant: ['container',3],
        cost: {
            Knowledge(){ return 18000; },
            Copper(){ return 1000; },
            Steel(){ return 2500; }
        },
        effect: loc('tech_cranes_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    titanium_crates: {
        id: 'tech-titanium_crates',
        title(){ return loc('tech_titanium_crates',[global.resource.Titanium.name]); },
        desc(){ return loc('tech_titanium_crates',[global.resource.Titanium.name]); },
        category: 'storage',
        era: 'globalized',
        reqs: { container: 3, titanium: 1 },
        grant: ['container',4],
        cost: {
            Knowledge(){ return 67500; },
            Titanium(){ return 1000; }
        },
        effect(){ return loc('tech_titanium_crates_effect',[global.resource.Titanium.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    mythril_crates: {
        id: 'tech-mythril_crates',
        title(){ return loc('tech_mythril_crates',[global.resource.Mythril.name]); },
        desc(){ return loc('tech_mythril_crates',[global.resource.Mythril.name]); },
        category: 'storage',
        era: 'early_space',
        reqs: { container: 4, space: 3 },
        grant: ['container',5],
        cost: {
            Knowledge(){ return 145000; },
            Mythril(){ return 350; }
        },
        effect(){ return loc('tech_mythril_crates_effect',[global.resource.Mythril.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    infernite_crates: {
        id: 'tech-infernite_crates',
        title(){ return loc('tech_crates',[global.resource.Infernite.name]); },
        desc(){ return loc('tech_infernite_crates_desc',[global.resource.Infernite.name]); },
        category: 'storage',
        era: 'interstellar',
        reqs: { container: 5, infernite: 1 },
        grant: ['container',6],
        cost: {
            Knowledge(){ return 575000; },
            Infernite(){ return 1000; }
        },
        effect(){ return loc('tech_infernite_crates_effect',[global.resource.Infernite.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    graphene_crates: {
        id: 'tech-graphene_crates',
        title(){ return loc('tech_crates',[global.resource.Graphene.name]); },
        desc(){ return loc('tech_crates',[global.resource.Graphene.name]); },
        category: 'storage',
        era: 'interstellar',
        path: ['standard','truepath'],
        reqs: { container: 6, graphene: 1 },
        grant: ['container',7],
        cost: {
            Knowledge(){ return 725000; },
            Graphene(){ return 75000; }
        },
        effect(){ return loc('tech_graphene_crates_effect',[global.resource.Graphene.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    bolognium_crates: {
        id: 'tech-bolognium_crates',
        title(){ return loc('tech_crates',[global.resource.Bolognium.name]); },
        desc(){ return loc('tech_crates',[global.resource.Bolognium.name]); },
        category: 'storage',
        era: 'intergalactic',
        reqs: { container: 7, gateway: 3 },
        grant: ['container',8],
        cost: {
            Knowledge(){ return 3420000; },
            Bolognium(){ return 90000; }
        },
        effect(){ return loc('tech_bolognium_crates_effect',[global.resource.Bolognium.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elysanite_crates: {
        id: 'tech-elysanite_crates',
        title(){ return loc('tech_crates',[global.resource.Elysanite.name]); },
        desc(){ return loc('tech_crates',[global.resource.Elysanite.name]); },
        category: 'storage',
        era: 'existential',
        reqs: { container: 8, elysium: 6 },
        grant: ['container',9],
        cost: {
            Knowledge(){ return 95500000; },
            Omniscience(){ return 20250; },
            Asphodel_Powder(){ return 175000; },
            Elysanite(){ return 75000000; }
        },
        effect(){ return loc('tech_elysanite_crates_effect',[global.resource.Elysanite.name,global.resource.Asphodel_Powder.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_containers: {
        id: 'tech-steel_containers',
        title(){ return loc('tech_containers',[global.resource.Steel.name]); },
        desc(){ return loc('tech_steel_containers_desc',[global.resource.Steel.name]); },
        category: 'storage',
        era: 'discovery',
        reqs: { smelting: 2, container: 1 },
        grant: ['steel_container',1],
        cost: {
            Knowledge(){ return 9000; },
            Steel(){ return 250; }
        },
        effect() {
            if (global.race['smoldering'] || global.race['kindling_kindred'] || global.race['evil']){
                let res = global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? 'Chrysotile' : 'Stone') : 'Plywood';
                return loc('tech_steel_containers_alt_effect',[global.resource[res].name,global.resource.Steel.name]);
            }
            else {
                return loc('tech_steel_containers_effect',[global.resource.Steel.name]);
            }
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.warehouse);
                return true;
            }
            return false;
        }
    },
    gantry_crane: {
        id: 'tech-gantry_crane',
        title: loc('tech_gantry_crane'),
        desc: loc('tech_gantry_crane_desc'),
        category: 'storage',
        era: 'discovery',
        reqs: { steel_container: 1, high_tech: 2 },
        grant: ['steel_container',2],
        cost: {
            Knowledge(){ return 22500; },
            Steel(){ return 5000; }
        },
        effect: loc('tech_gantry_crane_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    alloy_containers: {
        id: 'tech-alloy_containers',
        title(){ return loc('tech_containers',[global.resource.Alloy.name]); },
        desc(){ return loc('tech_alloy_containers_desc',[global.resource.Alloy.name]); },
        category: 'storage',
        era: 'industrialized',
        reqs: { steel_container: 2, storage: 4 },
        grant: ['steel_container',3],
        cost: {
            Knowledge(){ return 49500; },
            Alloy(){ return 2500; }
        },
        effect(){ return loc('tech_alloy_containers_effect',[global.resource.Alloy.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    mythril_containers: {
        id: 'tech-mythril_containers',
        title(){ return loc('tech_containers',[global.resource.Mythril.name]); },
        desc(){ return loc('tech_mythril_containers_desc',[global.resource.Mythril.name]); },
        category: 'storage',
        era: 'early_space',
        reqs: { steel_container: 3, space: 3 },
        grant: ['steel_container',4],
        cost: {
            Knowledge(){ return 165000; },
            Mythril(){ return 500; }
        },
        effect(){ return loc('tech_mythril_containers_effect',[global.resource.Mythril.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    adamantite_containers: {
        id: 'tech-adamantite_containers',
        title(){ return loc('tech_containers',[global.resource.Adamantite.name]); },
        desc(){ return loc('tech_adamantite_containers_desc',[global.resource.Adamantite.name]); },
        category: 'storage',
        era: 'interstellar',
        reqs: { steel_container: 4, alpha: 2 },
        grant: ['steel_container',5],
        cost: {
            Knowledge(){ return 525000; },
            Adamantite(){ return 17500; }
        },
        effect(){ return loc('tech_adamantite_containers_effect',[global.resource.Adamantite.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    aerogel_containers: {
        id: 'tech-aerogel_containers',
        title(){ return loc('tech_containers',[global.resource.Aerogel.name]); },
        desc(){ return loc('tech_containers',[global.resource.Aerogel.name]); },
        category: 'storage',
        era: 'interstellar',
        reqs: { steel_container: 5, aerogel: 1 },
        grant: ['steel_container',6],
        cost: {
            Knowledge(){ return 775000; },
            Aerogel(){ return 500; }
        },
        effect(){ return loc('tech_aerogel_containers_effect',[global.resource.Aerogel.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    bolognium_containers: {
        id: 'tech-bolognium_containers',
        title(){ return loc('tech_containers',[global.resource.Bolognium.name]); },
        desc(){ return loc('tech_containers',[global.resource.Bolognium.name]); },
        category: 'storage',
        era: 'intergalactic',
        reqs: { steel_container: 6, gateway: 3 },
        grant: ['steel_container',7],
        cost: {
            Knowledge(){ return 3500000; },
            Bolognium(){ return 125000; }
        },
        effect(){ return loc('tech_bolognium_containers_effect',[global.resource.Bolognium.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    nanoweave_containers: {
        id: 'tech-nanoweave_containers',
        title(){ return loc('tech_nanoweave_containers',[global.resource.Nanoweave.name]); },
        desc(){ return loc('tech_nanoweave_containers',[global.resource.Nanoweave.name]); },
        category: 'storage',
        era: 'intergalactic',
        reqs: { steel_container: 7, nanoweave: 1 },
        grant: ['steel_container',8],
        cost: {
            Knowledge(){ return 9000000; },
            Nanoweave(){ return 50000; }
        },
        effect(){ return loc('tech_nanoweave_containers_effect',[global.resource.Nanoweave.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elysanite_containers: {
        id: 'tech-elysanite_containers',
        title(){ return loc('tech_containers',[global.resource.Elysanite.name]); },
        desc(){ return loc('tech_containers',[global.resource.Elysanite.name]); },
        category: 'storage',
        era: 'existential',
        reqs: { steel_container: 8, elysium: 6 },
        grant: ['steel_container',9],
        cost: {
            Knowledge(){ return 100000000; },
            Omniscience(){ return 22500; },
            Elysanite(){ return 100000000; }
        },
        effect(){ return loc('tech_elysanite_containers_effect',[global.resource.Elysanite.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    evil_planning: {
        id: 'tech-evil_planning',
        title: loc('tech_urban_planning'),
        desc: loc('tech_urban_planning'),
        category: 'queues',
        era: 'civilized',
        wiki: global.race['terrifying'] ? true : false,
        reqs: { banking: 2 },
        grant: ['queue',1],
        trait: ['terrifying'],
        cost: {
            Knowledge(){ return 2500; }
        },
        effect: loc('tech_urban_planning_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.queue.display = true;
                return true;
            }
            return false;
        },
        post(){
            calcQueueMax();
        }
    },
    urban_planning: {
        id: 'tech-urban_planning',
        title: loc('tech_urban_planning'),
        desc: loc('tech_urban_planning'),
        category: 'queues',
        era: 'civilized',
        wiki: global.race['terrifying'] ? false : true,
        reqs: { banking: 2, currency: 2 },
        grant: ['queue',1],
        not_trait: ['terrifying'],
        cost: {
            Knowledge(){ return 2500; }
        },
        effect: loc('tech_urban_planning_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.queue.display = true;
                if (!global.settings.msgFilters.queue.unlocked){
                    global.settings.msgFilters.queue.unlocked = true;
                    global.settings.msgFilters.queue.vis = true;
                }
                return true;
            }
            return false;
        },
        post(){
            calcQueueMax();
        }
    },
    zoning_permits: {
        id: 'tech-zoning_permits',
        title: loc('tech_zoning_permits'),
        desc: loc('tech_zoning_permits'),
        category: 'queues',
        era: 'industrialized',
        reqs: { queue: 1, high_tech: 3 },
        grant: ['queue',2],
        cost: {
            Knowledge(){ return 28000; }
        },
        effect(){
            return loc('tech_zoning_permits_effect',[$(this)[0].bQueue()]);
        },
        bQueue(){
            return global.genes?.queue >= 2 ? 4 : 2;
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            calcQueueMax();
        }
    },
    urbanization: {
        id: 'tech-urbanization',
        title: loc('tech_urbanization'),
        desc: loc('tech_urbanization'),
        category: 'queues',
        era: 'globalized',
        reqs: { queue: 2, high_tech: 6 },
        grant: ['queue',3],
        cost: {
            Knowledge(){ return 95000; }
        },
        effect(){
            return loc('tech_urbanization_effect',[$(this)[0].bQueue()]);
        },
        bQueue(){
            return global.genes?.queue >= 2 ? 6 : 3;
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            calcQueueMax();
        }
    },
    assistant: {
        id: 'tech-assistant',
        title: loc('tech_assistant'),
        desc: loc('tech_assistant'),
        category: 'queues',
        era: 'civilized',
        reqs: { queue: 1, science: 4 },
        grant: ['r_queue',1],
        cost: {
            Knowledge(){ return 5000; }
        },
        effect: loc('tech_assistant_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.r_queue.display = true;
                if (!global.settings.msgFilters.building_queue.unlocked){
                    global.settings.msgFilters.building_queue.unlocked = true;
                    global.settings.msgFilters.building_queue.vis = true;
                    global.settings.msgFilters.research_queue.unlocked = true;
                    global.settings.msgFilters.research_queue.vis = true;
                }
                return true;
            }
            return false;
        },
        post(){
            calcRQueueMax();
            // Research queue is always visible on the research tab, so sub-tab check is intentionally excluded
            if (global.settings.tabLoad || global.settings.civTabs === 3){
                $(`#resQueue`).removeAttr('style');
            }
        }
    },
    government: {
        id: 'tech-government',
        title: loc('tech_government'),
        desc: loc('tech_government_desc'),
        category: 'government',
        era: 'civilized',
        reqs: { currency: 1 },
        grant: ['govern',1],
        cost: {
            Knowledge(){ return 750; }
        },
        effect: loc('tech_government_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: '#govType'},'update');
            vBind({el: '#foreign'},'update');
            vBind({el: '#government .govTabs2'},'update');
            if (global.settings.tabLoad){
                $(`#government .govTabs2`).removeAttr('style');
            }
        }
    },
    theocracy: {
        id: 'tech-theocracy',
        title: loc('govern_theocracy'),
        desc: loc('govern_theocracy'),
        category: 'government',
        era: 'civilized',
        reqs: { govern: 1, theology: 2 },
        grant: ['gov_theo',1],
        cost: {
            Knowledge(){ return 1200; }
        },
        effect: loc('tech_theocracy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    republic: {
        id: 'tech-republic',
        title: loc('govern_republic'),
        desc: loc('govern_republic'),
        category: 'government',
        era: 'discovery',
        reqs: { govern: 1 },
        condition(){
            return (global.tech['trade'] && global.tech['trade'] >= 2) || global.race['terrifying'] ? true : false;
        },
        grant: ['govern',2],
        cost: {
            Knowledge(){ return 17000; }
        },
        effect: loc('tech_republic_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    socialist: {
        id: 'tech-socialist',
        title: loc('govern_socialist'),
        desc: loc('govern_socialist'),
        category: 'government',
        era: 'discovery',
        reqs: { govern: 1 },
        condition(){
            return (global.tech['trade'] && global.tech['trade'] >= 2) || global.race['terrifying'] ? true : false;
        },
        grant: ['gov_soc',1],
        cost: {
            Knowledge(){ return 17000; }
        },
        effect: loc('tech_socialist_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    corpocracy: {
        id: 'tech-corpocracy',
        title: loc('govern_corpocracy'),
        desc: loc('govern_corpocracy'),
        category: 'government',
        era: 'industrialized',
        reqs: { govern: 2, high_tech: 3 },
        grant: ['gov_corp',1],
        cost: {
            Knowledge(){ return 26000; }
        },
        effect: loc('tech_corpocracy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    technocracy: {
        id: 'tech-technocracy',
        title: loc('govern_technocracy'),
        desc: loc('govern_technocracy'),
        category: 'government',
        era: 'industrialized',
        reqs: { govern: 2, high_tech: 3 },
        grant: ['govern',3],
        cost: {
            Knowledge(){ return 26000; }
        },
        effect: loc('tech_technocracy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    federation: {
        id: 'tech-federation',
        title: loc('govern_federation'),
        desc: loc('govern_federation'),
        category: 'government',
        era: 'early_space',
        reqs: { govern: 2 },
        condition(){
            return (global.tech['unify'] && global.tech['unify'] >= 2) || checkControlling();
        },
        grant: ['gov_fed',1],
        cost: {
            Knowledge(){ return 30000; }
        },
        effect: loc('tech_federation_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    magocracy: {
        id: 'tech-magocracy',
        title: loc('govern_magocracy'),
        desc: loc('govern_magocracy'),
        category: 'government',
        era: 'industrialized',
        reqs: { govern: 2, high_tech: 3 },
        condition(){
            return global.race.universe === 'magic' ? true : false;
        },
        grant: ['gov_mage',1],
        cost: {
            Knowledge(){ return 26000; }
        },
        effect: loc('tech_magocracy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    governor: {
        id: 'tech-governor',
        title: loc('tech_governor'),
        desc: loc('tech_governor'),
        category: 'government',
        era: 'civilized',
        reqs: { govern: 1 },
        condition(){
            return global.genes['governor'] && global.civic.govern.type !== 'anarchy' ? true : false;
        },
        grant: ['governor',1],
        cost: {
            Knowledge(){ return 1000; }
        },
        effect: loc('tech_governor_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showGovernor = true;
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        }
    },
    spy: {
        id: 'tech-spy',
        title: loc('tech_spy'),
        desc: loc('tech_spy'),
        category: 'spies',
        era: 'civilized',
        reqs: { govern: 1 },
        grant: ['spy',1],
        cost: {
            Knowledge(){ return 1250; }
        },
        effect: loc('tech_spy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: '#foreign'},'update');
            defineGovernor();
        }
    },
    espionage: {
        id: 'tech-espionage',
        title: loc('tech_espionage'),
        desc: loc('tech_espionage'),
        category: 'spies',
        era: 'discovery',
        reqs: { spy: 1, high_tech: 1 },
        grant: ['spy',2],
        cost: {
            Knowledge(){ return 7500; }
        },
        effect: loc('tech_espionage_effect'),
        action(){
            if (payCosts($(this)[0])){
                if (!global.settings.msgFilters.spy.unlocked){
                    global.settings.msgFilters.spy.unlocked = true;
                    global.settings.msgFilters.spy.vis = true;
                }
                return true;
            }
            return false;
        },
        post(){
            vBind({el: '#foreign'},'update');
            defineGovernor();
        }
    },
    spy_training: {
        id: 'tech-spy_training',
        title: loc('tech_spy_training'),
        desc: loc('tech_spy_training'),
        category: 'spies',
        era: 'discovery',
        reqs: { spy: 2, boot_camp: 1 },
        grant: ['spy',3],
        cost: {
            Knowledge(){ return 10000; }
        },
        effect: loc('tech_spy_training_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    spy_gadgets: {
        id: 'tech-spy_gadgets',
        title: loc('tech_spy_gadgets'),
        desc: loc('tech_spy_gadgets'),
        category: 'spies',
        era: 'discovery',
        reqs: { spy: 3, high_tech: 2 },
        grant: ['spy',4],
        cost: {
            Knowledge(){ return 15000; }
        },
        effect: loc('tech_spy_gadgets_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    code_breakers: {
        id: 'tech-code_breakers',
        title: loc('tech_code_breakers'),
        desc: loc('tech_code_breakers'),
        category: 'spies',
        era: 'industrialized',
        reqs: { spy: 4, high_tech: 4 },
        grant: ['spy',5],
        cost: {
            Knowledge(){ return 55000; }
        },
        effect: loc('tech_code_breakers_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    currency: {
        id: 'tech-currency',
        title: loc('tech_currency'),
        desc: loc('tech_currency_desc'),
        category: 'banking',
        era: 'civilized',
        reqs: { housing: 1 },
        grant: ['currency',1],
        cost: {
            Knowledge(){ return 22; },
            Lumber(){ return 10; }
        },
        effect: loc('tech_currency_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Money.display = true;
                return true;
            }
            return false;
        }
    },
    market: {
        id: 'tech-market',
        title: loc('tech_market'),
        desc: loc('tech_market_desc'),
        category: 'banking',
        era: 'civilized',
        reqs: { banking: 1, govern: 1 },
        not_trait: ['terrifying'],
        grant: ['currency',2],
        cost: {
            Knowledge(){ return global.race['banana'] ? 300 : 1800; }
        },
        effect: loc('tech_market_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showResources = true;
                global.settings.showMarket = true;
                return true;
            }
            return false;
        }
    },
    tax_rates: {
        id: 'tech-tax_rates',
        title: loc('tech_tax_rates'),
        desc: loc('tech_tax_rates_desc'),
        category: 'banking',
        era: 'civilized',
        reqs: { banking: 2, currency: 2, queue: 1 },
        not_trait: ['terrifying'],
        grant: ['currency',3],
        cost: {
            Knowledge(){ return 3375; }
        },
        effect: loc('tech_tax_rates_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.taxes.display = true;
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        }
    },
    large_trades: {
        id: 'tech-large_trades',
        title: loc('tech_large_trades'),
        desc: loc('tech_large_trades_desc'),
        category: 'market',
        era: 'civilized',
        reqs: { currency: 3 },
        not_trait: ['terrifying'],
        grant: ['currency',4],
        cost: {
            Knowledge(){ return 6750; }
        },
        effect: loc('tech_large_trades_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            if (global.race['noble']){
                global.tech['currency'] = 5;
                drawTech();
            }
        }
    },
    corruption: {
        id: 'tech-corruption',
        title: loc('tech_corruption'),
        desc: loc('tech_corruption_desc'),
        category: 'banking',
        era: 'industrialized',
        reqs: { currency: 4, high_tech: 3 },
        not_trait: ['terrifying','noble'],
        grant: ['currency',5],
        cost: {
            Knowledge(){ return 36000; }
        },
        effect: loc('tech_corruption_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    massive_trades: {
        id: 'tech-massive_trades',
        title: loc('tech_massive_trades'),
        desc: loc('tech_massive_trades_desc'),
        category: 'market',
        era: 'globalized',
        reqs: { currency: 5, high_tech: 4 },
        not_trait: ['terrifying'],
        grant: ['currency',6],
        cost: {
            Knowledge(){ return 108000; }
        },
        effect: loc('tech_massive_trades_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    trade: {
        id: 'tech-trade',
        title: loc('tech_trade'),
        desc: loc('tech_trade_desc'),
        category: 'market',
        era: 'civilized',
        reqs: { currency: 2, military: 1 },
        not_trait: ['terrifying'],
        grant: ['trade',1],
        cost: {
            Knowledge(){ return global.race['banana'] ? 1200 : 4500; }
        },
        effect: loc('tech_trade_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.trade);
                global.city.market.active = true;
                return true;
            }
            return false;
        }
    },
    diplomacy: {
        id: 'tech-diplomacy',
        title: loc('tech_diplomacy'),
        desc: loc('tech_diplomacy_desc'),
        category: 'market',
        era: 'discovery',
        reqs: { trade: 1, high_tech: 1 },
        not_trait: ['terrifying'],
        grant: ['trade',2],
        cost: {
            Knowledge(){ return 16200; }
        },
        effect: loc('tech_diplomacy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    freight: {
        id: 'tech-freight',
        title: loc('tech_freight'),
        desc: loc('tech_freight_desc'),
        category: 'market',
        era: 'industrialized',
        reqs: { trade: 2, high_tech: 3 },
        not_trait: ['terrifying'],
        grant: ['trade',3],
        cost: {
            Knowledge(){ return 37800; }
        },
        effect: loc('tech_freight_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            if (global.tech['high_tech'] >= 6) {
                arpa('Physics');
            }
        }
    },
    wharf: {
        id: 'tech-wharf',
        title: loc('tech_wharf'),
        desc: loc('tech_wharf_desc'),
        category: 'market',
        era: 'industrialized',
        reqs: { trade: 1, high_tech: 3, oil: 1 },
        not_trait: ['thalassophobia'],
        grant: ['wharf',1],
        cost: {
            Knowledge(){ return 44000; }
        },
        effect: loc('tech_wharf_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.wharf);
                return true;
            }
            return false;
        }
    },
    banking: {
        id: 'tech-banking',
        title: loc('tech_banking'),
        desc: loc('tech_banking_desc'),
        category: 'banking',
        era: 'civilized',
        reqs: { currency: 1 },
        grant: ['banking',1],
        cost: {
            Knowledge(){ return 90; }
        },
        effect: loc('tech_banking_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.bank);
                return true;
            }
            return false;
        }
    },
    investing: {
        id: 'tech-investing',
        title: loc('tech_investing'),
        desc: loc('tech_investing_desc'),
        category: 'banking',
        era: 'civilized',
        reqs: { banking: 1 },
        grant: ['banking',2],
        cost: {
            Money(){ return 2500; },
            Knowledge(){ return 900; }
        },
        effect: loc('tech_investing_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.banker.display = true;
                return true;
            }
            return false;
        }
    },
    vault: {
        id: 'tech-vault',
        title: loc('tech_vault'),
        desc: loc('tech_vault_desc'),
        category: 'banking',
        era: 'civilized',
        reqs: { banking: 2, cement: 1 },
        grant: ['banking',3],
        cost: {
            Money(){ return 2000; },
            Knowledge(){ return 3600; },
            Iron(){ return 500; },
            Cement(){ return 750; }
        },
        effect: loc('tech_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    bonds: {
        id: 'tech-bonds',
        title: loc('tech_bonds'),
        desc: loc('tech_bonds'),
        category: 'banking',
        era: 'civilized',
        reqs: { banking: 3 },
        grant: ['banking',4],
        cost: {
            Money(){ return 20000; },
            Knowledge(){ return 5000; }
        },
        effect: loc('tech_bonds_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_vault: {
        id: 'tech-steel_vault',
        title: loc('tech_steel_vault'),
        desc: loc('tech_steel_vault'),
        category: 'banking',
        era: 'civilized',
        reqs: { banking: 4, smelting: 2 },
        grant: ['banking',5],
        cost: {
            Money(){ return 30000; },
            Knowledge(){ return 6750; },
            Steel(){ return 3000; }
        },
        effect: loc('tech_steel_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    eebonds: {
        id: 'tech-eebonds',
        title: loc('tech_eebonds'),
        desc: loc('tech_eebonds'),
        category: 'banking',
        era: 'discovery',
        reqs: { banking: 5, high_tech: 1 },
        grant: ['banking',6],
        cost: {
            Money(){ return 75000; },
            Knowledge(){ return 18000; }
        },
        effect: loc('tech_eebonds_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    swiss_banking: {
        id: 'tech-swiss_banking',
        title: swissKnife(),
        desc: swissKnife(),
        category: 'banking',
        era: 'industrialized',
        reqs: { banking: 6 },
        grant: ['banking',7],
        cost: {
            Money(){ return 125000; },
            Knowledge(){ return 45000; }
        },
        effect: loc('tech_swiss_banking_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    safety_deposit: {
        id: 'tech-safety_deposit',
        title: loc('tech_safety_deposit'),
        desc: loc('tech_safety_deposit'),
        category: 'banking',
        era: 'globalized',
        reqs: { banking: 7, high_tech: 4 },
        grant: ['banking',8],
        cost: {
            Money(){ return 250000; },
            Knowledge(){ return 67500; }
        },
        effect: loc('tech_safety_deposit_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    stock_market: {
        id: 'tech-stock_market',
        title: loc('tech_stock_market'),
        desc: loc('tech_stock_market'),
        category: 'arpa',
        era: 'globalized',
        reqs: { banking: 8, high_tech: 6 },
        grant: ['banking',9],
        cost: {
            Money(){ return 325000; },
            Knowledge(){ return 108000; }
        },
        effect: loc('tech_stock_market_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    hedge_funds: {
        id: 'tech-hedge_funds',
        title: loc('tech_hedge_funds'),
        desc: loc('tech_hedge_funds'),
        category: 'banking',
        era: 'early_space',
        reqs: { banking: 9, stock_exchange: 1 },
        grant: ['banking',10],
        cost: {
            Money(){ return 375000; },
            Knowledge(){ return 126000; }
        },
        effect: loc('tech_hedge_funds_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    four_oh_one: {
        id: 'tech-four_oh_one',
        title: loc('tech_four_oh_one'),
        desc: loc('tech_four_oh_one'),
        category: 'banking',
        era: 'early_space',
        reqs: { banking: 10 },
        grant: ['banking',11],
        cost: {
            Money(){ return 425000; },
            Knowledge(){ return 144000; }
        },
        effect: loc('tech_four_oh_one_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_four_oh_one_flair');
        }
    },
    exchange: {
        id: 'tech-exchange',
        title: loc('tech_exchange'),
        desc: loc('tech_exchange'),
        category: 'banking',
        era: 'interstellar',
        reqs: { banking: 11, alpha: 2, graphene: 1 },
        grant: ['banking',12],
        cost: {
            Money(){ return 1000000; },
            Knowledge(){ return 675000; }
        },
        effect: loc('tech_exchange_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.exchange);
                return true;
            }
            return false;
        }
    },
    foreign_investment: {
        id: 'tech-foreign_investment',
        title: loc('tech_foreign_investment'),
        desc: loc('tech_foreign_investment'),
        category: 'banking',
        era: 'intergalactic',
        reqs: { banking: 12, xeno: 10 },
        grant: ['banking',13],
        cost: {
            Money(){ return 100000000; },
            Knowledge(){ return 8000000; }
        },
        effect: loc('tech_foreign_investment_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    crypto_currency: {
        id: 'tech-crypto_currency',
        title: loc('tech_crypto_currency'),
        desc: loc('tech_crypto_currency'),
        category: 'banking',
        era: 'existential',
        reqs: { banking: 13, high_tech: 19 },
        grant: ['banking',14],
        cost: {
            Money(){ return 10000000000; },
            Knowledge(){ return 127500000; },
            Omniscience(){ return 38500; },
        },
        effect: loc('tech_crypto_currency_effect',[loc('tech_bonds')]),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mythril_vault: {
        id: 'tech-mythril_vault',
        title: loc('tech_mythril_vault'),
        desc: loc('tech_mythril_vault'),
        category: 'banking',
        era: 'early_space',
        reqs: { banking: 5, space: 3 },
        grant: ['vault',1],
        cost: {
            Money(){ return 500000; },
            Knowledge(){ return 150000; },
            Mythril(){ return 750; }
        },
        effect: loc('tech_mythril_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    neutronium_vault: {
        id: 'tech-neutronium_vault',
        title: loc('tech_neutronium_vault'),
        desc: loc('tech_neutronium_vault'),
        category: 'banking',
        era: 'deep_space',
        reqs: { vault: 1, gas_moon: 1 },
        grant: ['vault',2],
        cost: {
            Money(){ return 750000; },
            Knowledge(){ return 280000; },
            Neutronium(){ return 650; }
        },
        effect: loc('tech_neutronium_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_vault: {
        id: 'tech-adamantite_vault',
        title: loc('tech_adamantite_vault'),
        desc: loc('tech_adamantite_vault'),
        category: 'banking',
        era: 'interstellar',
        reqs: { vault: 2, alpha: 2 },
        grant: ['vault',3],
        cost: {
            Money(){ return 2000000; },
            Knowledge(){ return 560000; },
            Adamantite(){ return 20000; }
        },
        effect: loc('tech_adamantite_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    graphene_vault: {
        id: 'tech-graphene_vault',
        title: loc('tech_graphene_vault'),
        desc: loc('tech_graphene_vault'),
        category: 'banking',
        era: 'interstellar',
        path: ['standard','truepath'],
        reqs: { vault: 3, graphene: 1 },
        grant: ['vault',4],
        cost: {
            Money(){ return 3000000; },
            Knowledge(){ return 750000; },
            Graphene(){ return 400000; }
        },
        effect: loc('tech_graphene_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    home_safe: {
        id: 'tech-home_safe',
        title: loc('tech_home_safe'),
        desc: loc('tech_home_safe'),
        category: 'banking',
        era: 'discovery',
        reqs: { banking: 5 },
        grant: ['home_safe',1],
        cost: {
            Money(){ return 42000; },
            Knowledge(){ return 8000; },
            Steel(){ return 4500; }
        },
        effect: loc('tech_home_safe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fire_proof_safe: {
        id: 'tech-fire_proof_safe',
        title: loc('tech_fire_proof_safe'),
        desc: loc('tech_fire_proof_safe'),
        category: 'banking',
        era: 'early_space',
        reqs: { home_safe: 1, space: 3 },
        grant: ['home_safe',2],
        cost: {
            Money(){ return 250000; },
            Knowledge(){ return 120000; },
            Iridium(){ return 1000; }
        },
        effect: loc('tech_fire_proof_safe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tamper_proof_safe: {
        id: 'tech-tamper_proof_safe',
        title: loc('tech_tamper_proof_safe'),
        desc: loc('tech_tamper_proof_safe'),
        category: 'banking',
        era: 'interstellar',
        reqs: { home_safe: 2, infernite: 1 },
        grant: ['home_safe',3],
        cost: {
            Money(){ return 2500000; },
            Knowledge(){ return 600000; },
            Infernite(){ return 800; }
        },
        effect: loc('tech_tamper_proof_safe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    monument: {
        id: 'tech-monument',
        title: loc('tech_monument'),
        desc: loc('tech_monument'),
        category: 'arpa',
        era: 'globalized',
        reqs: { high_tech: 6 },
        grant: ['monument',1],
        cost: {
            Knowledge(){ return 120000; }
        },
        effect: loc('tech_monument_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.arpa['m_type'] = arpa('Monument');
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    tourism: {
        id: 'tech-tourism',
        title: loc('tech_tourism'),
        desc: loc('tech_tourism'),
        category: 'banking',
        era: 'early_space',
        reqs: { monuments: 2, monument: 1 },
        not_trait: ['cataclysm','lone_survivor'],
        grant: ['monument',2],
        cost: {
            Knowledge(){ return 150000; }
        },
        effect: loc('tech_tourism_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.tourist_center);
                return true;
            }
            return false;
        }
    },
    xeno_tourism: {
        id: 'tech-xeno_tourism',
        title: loc('tech_xeno_tourism'),
        desc: loc('tech_xeno_tourism'),
        category: 'banking',
        era: 'intergalactic',
        reqs: { monument: 2, xeno: 10, monuments: 10 },
        not_trait: ['cataclysm'],
        grant: ['monument',3],
        cost: {
            Knowledge(){ return 8000000; }
        },
        effect: loc('tech_xeno_tourism_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    science: {
        id: 'tech-science',
        title: loc('tech_science'),
        desc: loc('tech_science_desc'),
        category: 'science',
        era: 'civilized',
        reqs: { housing: 1 },
        grant: ['science',1],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',65); }
        },
        effect: loc('tech_science_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.university);
                return true;
            }
            return false;
        }
    },
    library: {
        id: 'tech-library',
        title: loc('tech_library'),
        desc: loc('tech_library_desc'),
        category: 'science',
        era: 'civilized',
        reqs: { science: 1, cement: 1 },
        grant: ['science',2],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',720); }
        },
        effect: loc('tech_library_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.library);
                return true;
            }
            return false;
        }
    },
    thesis: {
        id: 'tech-thesis',
        title: loc('tech_thesis'),
        desc: loc('tech_thesis_desc'),
        category: 'science',
        era: 'civilized',
        reqs: { science: 2 },
        grant: ['science',3],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',1125); }
        },
        effect: loc('tech_thesis_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    research_grant: {
        id: 'tech-research_grant',
        title: loc('tech_research_grant'),
        desc: loc('tech_research_grant_desc'),
        category: 'science',
        era: 'civilized',
        reqs: { science: 3 },
        grant: ['science',4],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',3240); }
        },
        effect: loc('tech_research_grant_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    scientific_journal: {
        id: 'tech-scientific_journal',
        title(){ return global.race.universe === 'magic' ? loc('tech_magic_tomes') : loc('tech_scientific_journal'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_magic_tomes_desc') : loc('tech_scientific_journal_desc'); },
        category: 'science',
        era: 'industrialized',
        reqs: { science: 4, high_tech: 3 },
        grant: ['science',5],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',27000); }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_magic_tomes_effect') : loc('tech_scientific_journal_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adjunct_professor: {
        id: 'tech-adjunct_professor',
        title: loc('tech_adjunct_professor'),
        desc: loc('tech_adjunct_professor'),
        category: 'science',
        era: 'industrialized',
        reqs: { science: 5 },
        grant: ['science',6],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',36000); }
        },
        effect(){ return loc('tech_adjunct_professor_effect',[wardenLabel(),global.civic.scientist ? global.civic.scientist.name : loc('job_scientist')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tesla_coil: {
        id: 'tech-tesla_coil',
        title: loc('tech_tesla_coil'),
        desc: loc('tech_tesla_coil_desc'),
        category: 'science',
        era: 'industrialized',
        reqs: { science: 6, high_tech: 3 },
        grant: ['science',7],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',51750); }
        },
        effect(){ return loc('tech_tesla_coil_effect',[wardenLabel()]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    internet: {
        id: 'tech-internet',
        title: loc('tech_internet'),
        desc: loc('tech_internet'),
        category: 'science',
        era: 'globalized',
        reqs: { science: 7, high_tech: 4 },
        grant: ['science',8],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',61200); }
        },
        effect: loc('tech_internet_effect'),
        action(){
            if (payCosts($(this)[0])){
                if (global.race['toxic'] && global.race.species === 'troll'){
                    unlockAchieve('godwin');
                }
                return true;
            }
            return false;
        }
    },
    observatory: {
        id: 'tech-observatory',
        title: loc('tech_observatory'),
        desc: loc('tech_observatory'),
        category: 'science',
        era: 'early_space',
        reqs: { science: 8, space: 3, luna: 1 },
        grant: ['science',9],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',148000); }
        },
        effect: loc('tech_observatory_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_moon.observatory);
                return true;
            }
            return false;
        }
    },
    world_collider: {
        id: 'tech-world_collider',
        title: loc('tech_world_collider'),
        desc: loc('tech_world_collider'),
        category: 'science',
        era: 'deep_space',
        path: ['standard'],
        reqs: { science: 9, elerium: 2 },
        grant: ['science',10],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',350000); }
        },
        effect(){ return loc('tech_world_collider_effect',[planetName().dwarf]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_dwarf.world_collider);
                initStruct(actions.space.spc_dwarf.world_controller);
                return true;
            }
            return false;
        },
        flair: `<div>${loc('tech_world_collider_flair1')}</div><div>${loc('tech_world_collider_flair2')}</div>`
    },
    laboratory: {
        id: 'tech-laboratory',
        title(){ return global.race.universe === 'magic' ? loc('tech_sanctum') : loc('tech_laboratory'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_sanctum') : loc('tech_laboratory_desc'); },
        category: 'science',
        era: 'interstellar',
        reqs: { science: 11, alpha: 2 },
        grant: ['science',12],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',500000); }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_sanctum_effect') : loc('tech_laboratory_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.laboratory);
                return true;
            }
            return false;
        },
        flair(){ return global.race.universe === 'magic' ? loc('tech_sanctum_flair') : loc('tech_laboratory_flair'); }
    },
    virtual_assistant: {
        id: 'tech-virtual_assistant',
        title: loc('tech_virtual_assistant'),
        desc: loc('tech_virtual_assistant'),
        category: 'science',
        era: 'interstellar',
        reqs: { science: 12, high_tech: 12 },
        grant: ['science',13],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',635000); }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_virtual_assistant_magic_effect') : loc('tech_virtual_assistant_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dimensional_readings: {
        id: 'tech-dimensional_readings',
        title: loc('tech_dimensional_readings'),
        desc: loc('tech_dimensional_readings'),
        category: 'science',
        era: 'interstellar',
        reqs: { science: 13, infernite: 2 },
        grant: ['science',14],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',750000); }
        },
        effect(){ return loc('tech_dimensional_readings_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    quantum_entanglement: {
        id: 'tech-quantum_entanglement',
        title: loc('tech_quantum_entanglement'),
        desc: loc('tech_quantum_entanglement'),
        category: 'science',
        era: 'interstellar',
        reqs: { science: 14, neutron: 1 },
        grant: ['science',15],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',850000); },
            Neutronium(){ return 7500; },
            Soul_Gem(){ return 2; }
        },
        effect(){ return loc('tech_quantum_entanglement_effect',[2, global.race.universe === 'magic' ? loc('tech_sanctum') : loc('interstellar_laboratory_title'), wardenLabel()]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    expedition: {
        id: 'tech-expedition',
        title(){ return global.race.universe === 'magic' ? loc('tech_expedition_wiz') : loc('tech_expedition'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_expedition_wiz') : loc('tech_expedition'); },
        category: 'science',
        era: 'intergalactic',
        reqs: { science: 15, xeno: 4 },
        grant: ['science',16],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',5350000); }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_expedition_wiz_effect') : loc('tech_expedition_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    subspace_sensors: {
        id: 'tech-subspace_sensors',
        title: loc('tech_subspace_sensors'),
        desc: loc('tech_subspace_sensors'),
        category: 'science',
        era: 'intergalactic',
        reqs: { science: 16, high_tech: 16 },
        grant: ['science',17],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',6000000); }
        },
        effect(){ return loc('tech_subspace_sensors_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    alien_database: {
        id: 'tech-alien_database',
        title: loc('tech_alien_database'),
        desc: loc('tech_alien_database'),
        category: 'progress',
        era: 'intergalactic',
        reqs: { science: 17, conflict: 5 },
        grant: ['science',18],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',8250000); }
        },
        effect(){ return loc('tech_alien_database_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    orichalcum_capacitor: {
        id: 'tech-orichalcum_capacitor',
        title: loc('tech_orichalcum_capacitor'),
        desc: loc('tech_orichalcum_capacitor'),
        category: 'science',
        era: 'intergalactic',
        reqs: { science: 18, high_tech: 17 },
        grant: ['science',19],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',12500000); },
            Orichalcum(){ return 250000; }
        },
        effect(){ return loc('tech_orichalcum_capacitor_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    advanced_biotech: {
        id: 'tech-advanced_biotech',
        title: loc('tech_advanced_biotech'),
        desc: loc('tech_advanced_biotech'),
        category: 'science',
        era: 'dimensional',
        reqs: { science: 19, high_tech: 18 },
        grant: ['science',20],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',25500000); }
        },
        effect(){ return loc('tech_advanced_biotech_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    codex_infinium: {
        id: 'tech-codex_infinium',
        title: loc('tech_codex_infinium'),
        desc: loc('tech_codex_infinium'),
        category: 'science',
        era: 'dimensional',
        reqs: { science: 20, sphinx_bribe: 1 },
        grant: ['science',21],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',40100000); },
            Codex(){ return 1; }
        },
        effect(){ return loc('tech_codex_infinium_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Codex.display = false;
                return true;
            }
            return false;
        }
    },
    spirit_box: {
        id: 'tech-spirit_box',
        title: loc('tech_spirit_box'),
        desc: loc('tech_spirit_box'),
        category: 'science',
        era: 'existential',
        reqs: { science: 21, asphodel: 3 },
        grant: ['science',22],
        cost: {
            Knowledge(){ return 62750000; },
            Asphodel_Powder(){ return 10000; },
        },
        effect(){ return loc('tech_spirit_box_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Omniscience.display = true;
                return true;
            }
            return false;
        }
    },
    spirit_researcher: {
        id: 'tech-spirit_researcher',
        title: loc('tech_spirit_researcher'),
        desc: loc('tech_spirit_researcher'),
        category: 'science',
        era: 'existential',
        reqs: { science: 22, asphodel: 8 },
        grant: ['science',23],
        cost: {
            Knowledge(){ return 80000000; },
            Omniscience(){ return 12500; },
        },
        effect(){ return loc('tech_spirit_researcher_effect',[global.civic.scientist ? global.civic.scientist.name : loc('job_scientist')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dimensional_tap: {
        id: 'tech-dimensional_tap',
        title: loc('tech_dimensional_tap'),
        desc: loc('tech_dimensional_tap'),
        category: 'science',
        era: 'existential',
        reqs: { science: 23, ascension: 7 },
        grant: ['science',24],
        cost: {
            Knowledge(){ return 87500000; },
            Omniscience(){ return 13333; },
        },
        effect(){ return loc('tech_dimensional_tap_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.eden.encampment.asc = true;
                return true;
            }
            return false;
        },
        flair(){ return loc(`tech_dimensional_tap_flair`); }
    },
    devilish_dish: {
        id: 'tech-devilish_dish',
        title: loc('tech_devilish_dish'),
        desc: loc('tech_devilish_dish'),
        category: 'fasting',
        era: 'dimensional',
        reqs: { hell_ruins: 4},
        trait: ['fasting'],
        grant: ['dish',1],
        cost: {
            Knowledge(){ return 29000000; }
        },
        effect(){return loc('tech_devilish_dish_effect');},
        action(){
            if (payCosts($(this)[0])){
                if(global.tech['hell_lake'] >= 3){
                    messageQueue(loc('tech_lake_analysis_fasting'),'info',false,['progress','hell']);
                }
                return true;
            }
            return false;
        }
    },
    hell_oven: {
        id: 'tech-hell_oven',
        title: loc('tech_hell_oven'),
        desc: loc('tech_hell_oven'),
        category: 'fasting',
        era: 'dimensional',
        reqs: { hell_lake: 3, dish:1},
        trait: ['fasting'],
        grant: ['dish',2],
        cost: {
            Knowledge(){ return 32000000; }
        },
        effect(){return loc('tech_hell_oven_effect');},
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.oven);
                return true;
            }
            return false;
        }
    },
    preparation_methods:{
        id: 'tech-preparation_methods',
        title: loc('tech_preparation_methods'),
        desc: loc('tech_preparation_methods'),
        category: 'fasting',
        era: 'dimensional',
        reqs: { science: 21, dish:4},
        trait: ['fasting'],
        grant: ['dish',5],
        cost: {
            Knowledge(){ return 62000000; }
        },
        effect(){return loc('tech_preparation_methods_effect');},
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.dish_soul_steeper);
                initStruct(actions.portal.prtl_lake.dish_life_infuser);
                return true;
            }
            return false;
        }
    },
    final_ingredient: {
        id: 'tech-final_ingredient',
        title: loc('tech_final_ingredient'),
        desc: loc('tech_final_ingredient'),
        category: 'fasting',
        era: 'dimensional',
        reqs: { dish_reset: 1},
        grant: ['dish_reset',2],
        cost: {
            Bolognium(){ return 50000000; },
            Demonic_Essence(){ return 1; }
        },
        effect(){
            return `${loc('tech_final_ingredient_effect')}
            ${global.race['witch_hunter'] ? `<div class="has-text-warning">${loc('dish_witch_hunter_interaction', [loc('tech_outerplane_summon'), loc('portal_devilish_dish_title')])}</div>` : ""}
            <div class="has-text-special">${loc('tech_demonic_infusion_effect2',[calcPrestige('descend').artifact])}</div>`;
        },
        action(){
            // Check affordability without paying the Demonic Essence to avoid breaking the backup save
            if (checkAffordable($(this)[0])){
                descension();
            }
            return false;
        }
    },
    bioscience: {
        id: 'tech-bioscience',
        title: loc('tech_bioscience'),
        desc: loc('tech_bioscience_desc'),
        category: 'science',
        era: 'globalized',
        reqs: { science: 8 },
        grant: ['genetics',1],
        cost: {
            Knowledge(){ return 67500; }
        },
        effect: loc('tech_bioscience_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.biolab);
                return true;
            }
            return false;
        }
    },
    genetics: {
        id: 'tech-genetics',
        title: loc('tech_genetics'),
        desc: loc('tech_genetics'),
        category: 'arpa',
        era: 'globalized',
        reqs: { genetics: 1, high_tech: 6 },
        grant: ['genetics',2],
        cost: {
            Knowledge(){ return 108000; }
        },
        effect: loc('tech_genetics_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.arpa.genetics = true;
                if (!global.arpa['sequence']){
                    global.arpa['sequence'] = {
                        max: 50000,
                        progress: 0,
                        time: 50000,
                        on: global.race['cataclysm'] || global.race['orbit_decayed'] ? false : true,
                        boost: false,
                        auto: false,
                        labs: 0,
                    };
                }
                return true;
            }
            return false;
        },
        post(){
            arpa('Genetics');
        }
    },
    crispr: {
        id: 'tech-crispr',
        title: loc('tech_crispr'),
        desc: loc('tech_crispr'),
        category: 'genes',
        era: 'globalized',
        reqs: { genetics: 3 },
        grant: ['genetics',4],
        cost: {
            Knowledge(){ return 125000; }
        },
        effect(){ return global.race['artifical'] ? loc('tech_crispr_effect_artifical') : loc('tech_crispr_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.settings.arpa.crispr = true;
                global.settings.arpa.arpaTabs = 2;
                return true;
            }
            return false;
        },
        post(){
            arpa('Genetics');
            arpa('Crispr');
        }
    },
    shotgun_sequencing: {
        id: 'tech-shotgun_sequencing',
        title: loc('tech_shotgun_sequencing'),
        desc(){ return global.race['artifical'] ? loc('tech_shotgun_sequencing_desc_artifical') : loc('tech_shotgun_sequencing_desc'); },
        category: 'genes',
        era: 'early_space',
        reqs: { genetics: 4 },
        grant: ['genetics',5],
        cost: {
            Knowledge(){ return 165000; }
        },
        effect(){ return global.race['artifical'] ? loc('tech_shotgun_sequencing_effect_artifical') : loc('tech_shotgun_sequencing_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.arpa.sequence.boost = true;
                return true;
            }
            return false;
        },
        post(){
            arpa('Genetics');
        }
    },
    de_novo_sequencing: {
        id: 'tech-de_novo_sequencing',
        title: loc('tech_de_novo_sequencing'),
        desc: loc('tech_de_novo_sequencing'),
        category: 'genes',
        era: 'early_space',
        reqs: { genetics: 5 },
        grant: ['genetics',6],
        cost: {
            Knowledge(){ return 220000; }
        },
        effect(){ return global.race['artifical'] ? loc('tech_de_novo_sequencing_effect_artifical') : loc('tech_de_novo_sequencing_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Genes.display = true;
                return true;
            }
            return false;
        },
        post(){
            arpa('Genetics');
        }
    },
    dna_sequencer: {
        id: 'tech-dna_sequencer',
        title(){ return global.race['artifical'] ? loc('tech_code_sequencer') : loc('tech_dna_sequencer'); },
        desc(){ return global.race['artifical'] ? loc('tech_code_sequencer') : loc('tech_dna_sequencer'); },
        category: 'genes',
        era: 'deep_space',
        reqs: { genetics: 6 },
        grant: ['genetics',7],
        cost: {
            Knowledge(){ return 300000; }
        },
        effect(){ return global.race['artifical'] ? loc('tech_code_sequencer_effect') : loc('tech_dna_sequencer_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.arpa.sequence.auto = true;
                return true;
            }
            return false;
        },
        post(){
            arpa('Genetics');
        }
    },
    rapid_sequencing: {
        id: 'tech-rapid_sequencing',
        title(){ return global.race['artifical'] ? loc('tech_agile_development') : loc('tech_rapid_sequencing'); },
        desc(){ return global.race['artifical'] ? loc('tech_agile_development') : loc('tech_rapid_sequencing'); },
        category: 'genes',
        era: 'interstellar',
        path: ['standard','truepath'],
        reqs: { genetics: 7, high_tech: 12 },
        grant: ['genetics',8],
        cost: {
            Knowledge(){ return 800000; }
        },
        effect(){ return global.race['artifical'] ? loc('tech_agile_development_effect') : loc('tech_rapid_sequencing_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mad_science: {
        id: 'tech-mad_science',
        title(){ return global.race.universe === 'magic' ? loc('tech_sages') : loc('tech_mad_science'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_sages') : loc('tech_mad_science'); },
        category: 'science',
        era: 'discovery',
        reqs: { science: 2, smelting: 2 },
        grant: ['high_tech',1],
        cost: {
            Money(){ return 10000; },
            Mana(){ return global.race.universe === 'magic' ? 50 : 0; },
            Knowledge(){ return traitCostMod('stubborn',6750); },
            Crystal(){ return global.race.universe === 'magic' ? 1000 : 0; },
            Aluminium(){ return 750; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_sages_effect') : loc('tech_mad_science_effect'); },
        action(){
            if (payCosts($(this)[0])){
                if (global.race['terrifying']){
                    global.civic['taxes'].display = true;
                }
                initStruct(actions.city.wardenclyffe);
                return true;
            }
            return false;
        },
        post(){
            if (global.race['terrifying']){
                defineGovernor();
            }
        }
    },
    electricity: {
        id: 'tech-electricity',
        title: loc('tech_electricity'),
        desc: loc('tech_electricity'),
        category: 'power_generation',
        era: 'discovery',
        reqs: { high_tech: 1 },
        grant: ['high_tech',2],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',13500); },
            Copper(){ return 1000; }
        },
        effect: loc('tech_electricity_effect'),
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_electricity_msg'),'info',false,['progress']);
                global.city['power'] = 0;
                global.city['powered'] = true;
                initStruct(actions.city.coal_power);
                global.settings.showPowerGrid = true;
                setPowerGrid();
                return true;
            }
            return false;
        }
    },
    matter_replicator: {
        id: 'tech-matter_replicator',
        title(){ return global.race.universe === 'antimatter' && !global.race['amexplode'] ? loc('tech_antireplicator') : loc('tech_replicator'); },
        desc(){ return global.race.universe === 'antimatter' && !global.race['amexplode'] ? loc('tech_antireplicator') : loc('tech_replicator'); },
        category: 'special',
        era: 'discovery',
        reqs: { high_tech: 2},
        condition(){ return global.stats.achieve['adam_eve'] && global.stats.achieve.adam_eve.l >= 5 ? true : false; },
        not_trait: ['lone_survivor'],
        grant: ['replicator',1],
        cost: {
            Knowledge(){ return 25000; },
        },
        effect(){ return global.race.universe === 'antimatter' && !global.race['amexplode'] ? loc('tech_antireplicator_effect_alt') : loc('tech_replicator_effect_alt'); },
        action(){
            if (payCosts($(this)[0])){
                if (global.race.universe === 'antimatter' && global.race['amexplode']){
                    unlockFeat('annihilation');
                    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                    $('body').addClass('nuke');
                    let nuke = $('<div class="nuke"></div>');
                    $('body').append(nuke);
                    setTimeout(function(){
                        nuke.addClass('burn');
                    }, 500);
                    setTimeout(function(){
                        nuke.addClass('b');
                    }, 600);
                    setTimeout(function(){
                        window.soft_reset();
                    }, 4000);
                }
                else {
                    global.race['replicator'] = { res: 'Stone', pow: 1 };
                }
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        }
    },
    industrialization: {
        id: 'tech-industrialization',
        title: loc('tech_industrialization'),
        desc: loc('tech_industrialization'),
        category: 'progress',
        era: 'industrialized',
        reqs: { high_tech: 2, cement: 2, steel_container: 1 },
        grant: ['high_tech',3],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',25200); }
        },
        effect: loc('tech_industrialization_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Titanium.display = true;
                initStruct(actions.city.factory);
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    electronics: {
        id: 'tech-electronics',
        title: loc('tech_electronics'),
        desc: loc('tech_electronics'),
        category: 'progress',
        era: 'industrialized',
        reqs: { high_tech: 3, titanium: 1 },
        grant: ['high_tech',4],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',50000); }
        },
        effect: loc('tech_electronics_effect'),
        action(){
            if (payCosts($(this)[0])){
                if (global.race['terrifying']){
                    global.tech['gambling'] = 1;
                    initStruct(actions.city.casino);
                    initStruct(actions.space.spc_hell.spc_casino);
                }
                return true;
            }
            return false;
        }
    },
    fission: {
        id: 'tech-fission',
        title: loc('tech_fission'),
        desc: loc('tech_fission'),
        category: 'progress',
        era: 'globalized',
        reqs: { high_tech: 4, uranium: 1 },
        grant: ['high_tech',5],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',77400); },
            Uranium(){ return 10; }
        },
        effect: loc('tech_fission_effect'),
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_fission_msg'),'info',false,['progress']);
                initStruct(actions.city.fission_power);
                return true;
            }
            return false;
        }
    },
    arpa: {
        id: 'tech-arpa',
        title: loc('tech_arpa'),
        desc: loc('tech_arpa_desc'),
        category: 'arpa',
        era: 'globalized',
        reqs: { high_tech: 5 },
        grant: ['high_tech',6],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',90000); }
        },
        effect: loc('tech_arpa_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showGenetics = true;
                global.settings.arpa.physics = true;
                if (global.race['truepath'] && !global.tech['unify']){
                    global.tech['unify'] = 1;
                }
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    rocketry: {
        id: 'tech-rocketry',
        title: loc('tech_rocketry'),
        desc: loc('tech_rocketry'),
        category: 'arpa',
        era: 'globalized',
        reqs: { high_tech: 6 },
        grant: ['high_tech',7],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',112500); },
            Oil(){ return global.city.ptrait.includes('dense') ? 8000 : 6800; }
        },
        effect: loc('tech_rocketry_effect'),
        action(){
            if (payCosts($(this)[0])){
                if (global.race['truepath'] && !global.tech['rival']){
                    global.tech['rival'] = 1;
                    messageQueue(loc(`civics_rival_unlocked`,[govTitle(3)]),'info',false,['progress','combat']);
                }
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    robotics: {
        id: 'tech-robotics',
        title: loc('tech_robotics'),
        desc: loc('tech_robotics'),
        category: 'progress',
        era: 'globalized',
        reqs: { high_tech: 7 },
        grant: ['high_tech',8],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',125000); }
        },
        effect: loc('tech_robotics_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    lasers: {
        id: 'tech-lasers',
        title: loc('tech_lasers'),
        desc: loc('tech_lasers_desc'),
        category: 'progress',
        era: 'deep_space',
        reqs: { high_tech: 8, space: 3, supercollider: 1, elerium: 1 },
        grant: ['high_tech',9],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',280000); },
            Elerium(){ return 100; }
        },
        effect: loc('tech_lasers_effect'),
        action(){
            if (payCosts($(this)[0])){
                if (global.race['cataclysm']){
                    unlockAchieve('iron_will',false,3);
                }
                return true;
            }
            return false;
        }
    },
    artifical_intelligence: {
        id: 'tech-artifical_intelligence',
        title: loc('tech_artificial_intelligence'),
        desc: loc('tech_artificial_intelligence'),
        category: 'progress',
        era: 'deep_space',
        reqs: { high_tech: 9 },
        grant: ['high_tech',10],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',325000); }
        },
        effect: loc('tech_artificial_intelligence_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_artificial_intelligence_flair');
        }
    },
    quantum_computing: {
        id: 'tech-quantum_computing',
        title: loc('tech_quantum_computing'),
        desc: loc('tech_quantum_computing'),
        category: 'progress',
        era: 'deep_space',
        reqs: { high_tech: 10, nano: 1 },
        grant: ['high_tech',11],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',435000); },
            Elerium(){ return 250 },
            Nano_Tube(){ return 100000 }
        },
        effect: loc('tech_quantum_computing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_quantum_computing_flair');
        }
    },
    virtual_reality: {
        id: 'tech-virtual_reality',
        title: loc('tech_virtual_reality'),
        desc: loc('tech_virtual_reality'),
        category: 'progress',
        era: 'interstellar',
        reqs: { high_tech: 11, alpha: 2, infernite: 1, stanene: 1 },
        grant: ['high_tech',12],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',600000); },
            Stanene(){ return 1250 },
            Soul_Gem(){ return 1 }
        },
        effect: loc('tech_virtual_reality_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_virtual_reality_flair');
        }
    },
    plasma: {
        id: 'tech-plasma',
        title: loc('tech_plasma'),
        desc: loc('tech_plasma'),
        category: 'progress',
        era: 'interstellar',
        path: ['standard','truepath'],
        reqs: { high_tech: 12 },
        grant: ['high_tech',13],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',755000); },
            Infernite(){ return global.race['truepath'] ? 0 : 1000; },
            Stanene(){ return global.race['truepath'] ? 1000000 : 250000; }
        },
        effect: loc('tech_plasma_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    shields: {
        id: 'tech-shields',
        title: loc('tech_shields'),
        desc: loc('tech_shields'),
        category: 'stellar_engine',
        era: 'interstellar',
        reqs: { high_tech: 13 },
        grant: ['high_tech',14],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',850000); },
        },
        effect: loc('tech_shields_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.neutron = true;
                global.settings.space.blackhole = true;
                return true;
            }
            return false;
        }
    },
    ai_core: {
        id: 'tech-ai_core',
        title: loc('tech_ai_core'),
        desc: loc('tech_ai_core'),
        category: 'ai_core',
        era: 'interstellar',
        reqs: { high_tech: 14, science: 15, blackhole: 3 },
        grant: ['high_tech',15],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',1500000); },
        },
        effect: loc('tech_ai_core_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_neutron.citadel);
                return true;
            }
            return false;
        }
    },
    metaphysics: {
        id: 'tech-metaphysics',
        title: loc('tech_metaphysics'),
        desc: loc('tech_metaphysics'),
        category: 'progress',
        era: 'intergalactic',
        reqs: { high_tech: 15, xeno: 5 },
        grant: ['high_tech',16],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',5000000); },
            Vitreloy(){ return 10000; },
            Soul_Gem(){ return 10; }
        },
        effect(){ return loc('tech_metaphysics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    orichalcum_analysis: {
        id: 'tech-orichalcum_analysis',
        title: loc('tech_orichalcum_analysis'),
        desc: loc('tech_orichalcum_analysis'),
        category: 'progress',
        era: 'intergalactic',
        reqs: { high_tech: 16, chthonian: 3 },
        grant: ['high_tech',17],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',12200000); },
            Orichalcum(){ return 100000; }
        },
        effect(){ return loc('tech_orichalcum_analysis_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_orichalcum_analysis_result'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    cybernetics: {
        id: 'tech-cybernetics',
        title: loc('tech_cybernetics'),
        desc: loc('tech_cybernetics'),
        category: 'progress',
        era: 'dimensional',
        reqs: { high_tech: 17, hell_ruins: 4 },
        grant: ['high_tech',18],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',25000000); },
            Adamantite(){ return 12500000; },
            Stanene(){ return 50000000; },
            Vitreloy(){ return 10000000; },
        },
        effect(){ return loc('tech_cybernetics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    divinity: {
        id: 'tech-divinity',
        title: loc('tech_divinity'),
        desc: loc('tech_divinity'),
        category: 'progress',
        era: 'existential',
        reqs: { high_tech: 18, elysium: 15, isle: 2 },
        grant: ['high_tech',19],
        cost: {
            Knowledge(){ return traitCostMod('stubborn',120000000); },
            Omniscience(){ return 34000; },
        },
        effect(){ return loc('tech_divinity_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    blood_pact: {
        id: 'tech-blood_pact',
        title: loc('tech_blood_pact'),
        desc: loc('tech_blood_pact'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { high_tech: 18, b_stone: 1 },
        grant: ['b_stone',2],
        cost: {
            Knowledge(){ return 52000000; },
            Blood_Stone(){ return 1; }
        },
        effect(){ return loc('tech_blood_pact_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.settings.arpa.blood = true;
                arpa('Crispr');
                return true;
            }
            return false;
        },
        post(){
            arpa('Blood');
        }
    },
    purify: {
        id: 'tech-purify',
        title: loc('tech_purify'),
        desc: loc('tech_purify'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { hell_spire: 3, b_stone: 2 },
        grant: ['b_stone',3],
        cost: {
            Knowledge(){ return 52500000; },
            Blood_Stone(){ return 1; }
        },
        effect(){ return loc('tech_purify_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    waygate: {
        id: 'tech-waygate',
        title: loc('tech_waygate'),
        desc: loc('tech_waygate'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { hell_spire: 10, b_stone: 2 },
        grant: ['waygate',1],
        cost: {
            Knowledge(){ return 55000000; }
        },
        effect(){ return loc('tech_waygate_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_spire.waygate);
                return true;
            }
            return false;
        }
    },
    demonic_infusion: {
        id: 'tech-demonic_infusion',
        title: loc('tech_demonic_infusion'),
        desc: loc('tech_demonic_infusion'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { hell_spire: 10, b_stone: 2, waygate: 3 },
        condition(){
            return global.resource.Demonic_Essence.amount >= 1 ? true : false;
        },
        grant: ['waygate',4],
        not_trait: ['witch_hunter','fasting'],
        cost: {
            Species(){ return popCost(1000); },
            Knowledge(){ return 55000000; },
            Demonic_Essence(){ return 1; }
        },
        effect(){
            return `<div>${loc('tech_demonic_infusion_effect')}</div><div class="has-text-special">${loc('tech_demonic_infusion_effect2',[calcPrestige('descend').artifact])}</div>`;
        },
        action(){
            // Check affordability without paying the 1000 pop and Demonic Essence to avoid breaking the backup save
            if (checkAffordable($(this)[0])){
                descension();
            }
            return false;
        }
    },
    purify_essence: {
        id: 'tech-purify_essence',
        title: loc('tech_purify_essence'),
        desc: loc('tech_purify_essence'),
        category: 'hell_dimension',
        era: 'existential',
        reqs: { b_stone: 2, waygate: 3, edenic: 1 },
        condition(){
            return global.resource.Demonic_Essence.amount >= 1 ? true : false;
        },
        grant: ['edenic',2],
        not_trait: ['witch_hunter', 'fasting'],
        cost: {
            Knowledge(){ return 60000000; },
            Artifact(){ return 1; },
            Demonic_Essence(){ return 1; }
        },
        effect(){
            return `<div>${loc('tech_purify_essence_effect')}</div><div class="has-text-special">${loc('tech_purify_essence_warn')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Demonic_Essence.display = false;
                global.resource.Demonic_Essence.amount = 0;
                global.resource.Blessed_Essence.display = true;
                global.resource.Blessed_Essence.amount = 1;
                return true;
            }
            return false;
        }
    },
    gate_key: {
        id: 'tech-gate_key',
        title: loc('tech_gate_key'),
        desc: loc('tech_gate_key'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { hell_gate: 1 },
        grant: ['hell_gate',2],
        cost: {
            Knowledge(){ return 30000000; },
        },
        effect(){ return loc('tech_gate_key_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_gate.west_tower);
                initStruct(actions.portal.prtl_gate.east_tower);
                return true;
            }
            return false;
        }
    },
    gate_turret: {
        id: 'tech-gate_turret',
        title: loc('tech_gate_turret'),
        desc: loc('tech_gate_turret'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { hell_gate: 2 },
        grant: ['hell_gate',3],
        cost: {
            Knowledge(){ return 32000000; },
        },
        effect(){ return loc('tech_gate_turret_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_gate.gate_turret);
                return true;
            }
            return false;
        }
    },
    infernite_mine: {
        id: 'tech-infernite_mine',
        title: loc('tech_infernite_mine'),
        desc: loc('tech_infernite_mine'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { hell_gate: 3 },
        grant: ['hell_gate',4],
        cost: {
            Knowledge(){ return 32500000; },
        },
        effect(){ return loc('tech_infernite_mine_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_gate.infernite_mine);
                return true;
            }
            return false;
        }
    },
    study_corrupt_gem: {
        id: 'tech-study_corrupt_gem',
        title: loc('tech_study_corrupt_gem'),
        desc: loc('tech_study_corrupt_gem'),
        category: 'hell_dimension',
        era: 'intergalactic',
        reqs: { high_tech: 16, corrupt: 1 },
        grant: ['corrupt',2],
        trait: ['witch_hunter'],
        cost: {
            Mana(){ return global.race['no_plasmid'] ? 10000 : 30000; },
            Knowledge(){ return 18500000; },
            Corrupt_Gem(){ return 1; }
        },
        effect(){ return loc('tech_study_corrupt_gem_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_study_corrupt_gem_result'),'info',false,['progress','hell']);
                global.resource.Corrupt_Gem.display = false;
                return true;
            }
            return false;
        }
    },
    soul_binding: {
        id: 'tech-soul_binding',
        title: loc('tech_soul_binding'),
        desc: loc('tech_soul_binding'),
        category: 'hell_dimension',
        era: 'intergalactic',
        reqs: { corrupt: 2, science: 19 },
        grant: ['forbidden',1],
        trait: ['witch_hunter'],
        cost: {
            Knowledge(){ return 19000000; }
        },
        effect(){ return loc('tech_soul_binding_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    soul_capacitor: {
        id: 'tech-soul_capacitor',
        title: loc('tech_soul_capacitor'),
        desc: loc('tech_soul_capacitor'),
        category: 'hell_dimension',
        era: 'intergalactic',
        reqs: { forbidden: 1 },
        grant: ['forbidden',2],
        trait: ['witch_hunter'],
        cost: {
            Knowledge(){ return 19500000; }
        },
        effect(){ return loc('tech_soul_capacitor_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_pit.soul_capacitor);
                return true;
            }
            return false;
        }
    },
    absorption_chamber: {
        id: 'tech-absorption_chamber',
        title: loc('tech_absorption_chamber'),
        desc: loc('tech_absorption_chamber'),
        category: 'hell_dimension',
        era: 'intergalactic',
        reqs: { forbidden: 2 },
        grant: ['forbidden',3],
        trait: ['witch_hunter'],
        cost: {
            Knowledge(){ return 20000000; }
        },
        effect(){ return loc('tech_absorption_chamber_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_pit.absorption_chamber);
                return true;
            }
            return false;
        }
    },
    corrupt_gem_analysis: {
        id: 'tech-corrupt_gem_analysis',
        title: loc('tech_corrupt_gem_analysis'),
        desc: loc('tech_corrupt_gem_analysis'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { high_tech: 16, corrupt: 1 },
        grant: ['corrupt',2],
        not_trait: ['witch_hunter'],
        cost: {
            Species(){ return 1; }, // Not scaled intentionally
            Knowledge(){ return 22000000; },
            Corrupt_Gem(){ return 1; }
        },
        effect(){ return loc('tech_corrupt_gem_analysis_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_corrupt_gem_analysis_result'),'info',false,['progress','hell']);
                global.resource.Corrupt_Gem.display = false;
                return true;
            }
            return false;
        }
    },
    hell_search: {
        id: 'tech-hell_search',
        title: loc('tech_hell_search'),
        desc: loc('tech_hell_search'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { corrupt: 2 },
        grant: ['hell_ruins',1],
        cost: {
            Knowledge(){ return 22100000; },
            Structs(){
                return {
                    portal: {
                        sensor_drone: { s: 'prtl_badlands', count: 25, on: 25 },
                    }
                };
            },
        },
        effect(){ return loc('tech_hell_search_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_hell_search_result'),'info',false,['progress','hell']);
                global.settings.portal.ruins = true;
                global.settings.portal.gate = true;
                initStruct(actions.portal.prtl_ruins.guard_post);
                return true;
            }
            return false;
        }
    },
    codex_infernium: {
        id: 'tech-codex_infernium',
        title: loc('tech_codex_infernium'),
        desc: loc('tech_codex_infernium'),
        category: 'progress',
        era: 'dimensional',
        reqs: { hell_ruins: 3 },
        grant: ['hell_ruins',4],
        cost: {
            Knowledge(){ return 23500000; },
            Codex(){ return 1; }
        },
        effect(){ return loc('tech_codex_infernium_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Codex.display = false;
                return true;
            }
            return false;
        }
    },
    lake_analysis: {
        id: 'tech-lake_analysis',
        title: loc('tech_lake_analysis'),
        desc: loc('tech_lake_analysis'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { hell_lake: 2 },
        grant: ['hell_lake',3],
        cost: {
            Knowledge(){ return 34000000; },
        },
        effect(){ return loc('tech_lake_analysis_effect'); },
        action(){
            if (payCosts($(this)[0])){
                if(global.race['fasting'] && global.tech['dish'] >= 1){
                    messageQueue(loc('tech_lake_analysis_fasting'),'info',false,['progress','hell']);
                }
                return true;
            }
            return false;
        }
    },
    lake_threat: {
        id: 'tech-lake_threat',
        title: loc('tech_lake_threat'),
        desc: loc('tech_lake_threat'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { hell_lake: 3 },
        grant: ['hell_lake',4],
        cost: {
            Knowledge(){ return 34500000; },
        },
        effect(){ return loc('tech_lake_threat_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.bireme);
                messageQueue(loc('tech_lake_threat_result'),'info',false,['progress','hell']);
                return true;
            }
            return false;
        }
    },
    lake_transport: {
        id: 'tech-lake_transport',
        title: loc('tech_lake_transport'),
        desc: loc('tech_lake_transport'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { hell_lake: 4 },
        grant: ['hell_lake',5],
        cost: {
            Knowledge(){ return 35000000; },
        },
        effect(){ return loc('tech_lake_transport_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.transport);
                return true;
            }
            return false;
        }
    },
    cooling_tower: {
        id: 'tech-cooling_tower',
        title: loc('tech_cooling_tower'),
        desc: loc('tech_cooling_tower'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { hell_lake: 5 },
        grant: ['hell_lake',6],
        cost: {
            Knowledge(){ return 37500000; },
        },
        effect(){ return loc('tech_cooling_tower_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.cooling_tower);
                return true;
            }
            return false;
        }
    },
    miasma: {
        id: 'tech-miasma',
        title: loc('tech_miasma'),
        desc: loc('tech_miasma'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { hell_spire: 2 },
        grant: ['hell_spire',3],
        cost: {
            Knowledge(){ return 38250000; },
        },
        effect(){ return loc('tech_miasma_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_spire.port);
                return true;
            }
            return false;
        }
    },
    incorporeal: {
        id: 'tech-incorporeal',
        title: loc('tech_incorporeal'),
        desc: loc('tech_incorporeal'),
        category: 'special',
        era: 'intergalactic',
        reqs: { science: 19 },
        grant: ['ascension',1],
        not_trait: ['orbit_decay','witch_hunter'],
        cost: {
            Knowledge(){ return 17500000; },
            Phage(){ return 25; }
        },
        effect(){ return loc('tech_incorporeal_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tech_ascension: {
        id: 'tech-tech_ascension',
        title: loc('tech_ascension'),
        desc: loc('tech_ascension'),
        category: 'special',
        era: 'intergalactic',
        reqs: { ascension: 1 },
        grant: ['ascension',2],
        not_trait: ['orbit_decay','witch_hunter'],
        cost: {
            Knowledge(){ return 18500000; },
            Plasmid(){ return 100; }
        },
        effect(){ return loc('tech_ascension_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.sirius = true;
                return true;
            }
            return false;
        }
    },
    terraforming: {
        id: 'tech-terraforming',
        title: loc('tech_terraforming'),
        desc: loc('tech_terraforming'),
        category: 'special',
        era: 'intergalactic',
        reqs: { science: 19 },
        path: ['standard'],
        grant: ['terraforming',1],
        trait: ['orbit_decay'],
        cost: {
            Knowledge(){ return 18000000; },
        },
        effect(){ return loc('tech_terraforming_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.terraformer);
                return true;
            }
            return false;
        }
    },
    cement_processing: {
        id: 'tech-cement_processing',
        title: loc('tech_cement_processing'),
        desc: loc('tech_cement_processing'),
        category: 'ai_core',
        era: 'interstellar',
        reqs: { high_tech: 15 },
        not_trait: ['flier'],
        grant: ['ai_core',1],
        cost: {
            Knowledge(){ return 1750000; },
        },
        effect: loc('tech_cement_processing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_processing_flier: {
        id: 'tech-adamantite_processing_flier',
        title: loc('tech_adamantite_processing'),
        desc: loc('tech_adamantite_processing'),
        category: 'ai_core',
        era: 'interstellar',
        reqs: { high_tech: 15 },
        trait: ['flier'],
        grant: ['ai_core',2],
        cost: {
            Knowledge(){ return 2000000; },
        },
        effect: loc('tech_adamantite_processing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_processing: {
        id: 'tech-adamantite_processing',
        title: loc('tech_adamantite_processing'),
        desc: loc('tech_adamantite_processing'),
        category: 'ai_core',
        era: 'interstellar',
        reqs: { ai_core: 1 },
        not_trait: ['flier'],
        grant: ['ai_core',2],
        cost: {
            Knowledge(){ return 2000000; },
        },
        effect: loc('tech_adamantite_processing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    graphene_processing: {
        id: 'tech-graphene_processing',
        title: loc('tech_graphene_processing'),
        desc: loc('tech_graphene_processing'),
        category: 'ai_core',
        era: 'intergalactic',
        reqs: { ai_core: 2 },
        grant: ['ai_core',3],
        cost: {
            Knowledge(){ return 2500000; },
        },
        effect: loc('tech_graphene_processing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    crypto_mining: {
        id: 'tech-crypto_mining',
        title: loc('tech_crypto_mining'),
        desc: loc('tech_crypto_mining'),
        category: 'ai_core',
        era: 'existential',
        reqs: { ai_core: 3, banking: 14 },
        grant: ['ai_core',4],
        cost: {
            Money(){ return 30000000000; },
            Knowledge(){ return 135000000; },
            Omniscience(){ return 45000; },
        },
        effect: loc('tech_crypto_mining_effect',[loc('interstellar_citadel_title')]),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fusion_power: {
        id: 'tech-fusion_power',
        title: loc('tech_fusion_power'),
        desc: loc('tech_fusion_power'),
        category: 'power_generation',
        era: 'interstellar',
        reqs: { ram_scoop: 1 },
        grant: ['fusion',1],
        cost: {
            Knowledge(){ return 640000; }
        },
        effect: loc('tech_fusion_power_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.fusion);
                return true;
            }
            return false;
        }
    },
    infernium_power: {
        id: 'tech-infernium_power',
        title: loc('tech_infernium_power'),
        desc: loc('tech_infernium_power'),
        category: 'power_generation',
        era: 'dimensional',
        reqs: { smelting: 8, hell_ruins: 4 },
        grant: ['inferno_power',1],
        cost: {
            Knowledge(){ return 30000000; }
        },
        effect: loc('tech_infernium_power_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_ruins.inferno_power);
                return true;
            }
            return false;
        }
    },
    thermomechanics: {
        id: 'tech-thermomechanics',
        title: loc('tech_thermomechanics'),
        desc: loc('tech_thermomechanics_desc'),
        category: 'crafting',
        era: 'industrialized',
        reqs: { high_tech: 4 },
        grant: ['alloy',1],
        cost: {
            Knowledge(){ return 60000; },
        },
        effect(){ return loc('tech_thermomechanics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    quantum_manufacturing: {
        id: 'tech-quantum_manufacturing',
        title: loc('tech_quantum_manufacturing'),
        desc: loc('tech_quantum_manufacturing'),
        category: 'crafting',
        era: 'deep_space',
        reqs: { high_tech: 11 },
        grant: ['q_factory',1],
        cost: {
            Knowledge(){ return 465000; }
        },
        effect: loc('tech_quantum_manufacturing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    worker_drone: {
        id: 'tech-worker_drone',
        title: loc('tech_worker_drone'),
        desc: loc('tech_worker_drone'),
        category: 'mining',
        era: 'deep_space',
        reqs: { nano: 1 },
        grant: ['drone',1],
        cost: {
            Knowledge(){ return 400000; },
        },
        effect(){ return loc('tech_worker_drone_effect',[planetName().gas_moon]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_gas_moon.drone);
                return true;
            }
            return false;
        }
    },
    uranium: {
        id: 'tech-uranium',
        title: loc('tech_uranium'),
        desc: loc('tech_uranium'),
        category: 'power_generation',
        era: 'globalized',
        reqs: { high_tech: 4 },
        grant: ['uranium',1],
        cost: {
            Knowledge(){ return 72000; }
        },
        effect: loc('tech_uranium_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Uranium.display = true;
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    uranium_storage: {
        id: 'tech-uranium_storage',
        title: loc('tech_uranium_storage'),
        desc: loc('tech_uranium_storage'),
        category: 'storage',
        era: 'globalized',
        reqs: { uranium: 1 },
        grant: ['uranium',2],
        cost: {
            Knowledge(){ return 75600; },
            Alloy(){ return 2500; }
        },
        effect: loc('tech_uranium_storage_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    uranium_ash: {
        id: 'tech-uranium_ash',
        title: loc('tech_uranium_ash'),
        desc: loc('tech_uranium_ash'),
        category: 'power_generation',
        era: 'globalized',
        reqs: { uranium: 2 },
        grant: ['uranium',3],
        cost: {
            Knowledge(){ return 122000; }
        },
        effect: loc('tech_uranium_ash_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    breeder_reactor: {
        id: 'tech-breeder_reactor',
        title: loc('tech_breeder_reactor'),
        desc: loc('tech_breeder_reactor'),
        category: 'power_generation',
        era: 'early_space',
        reqs: { high_tech: 5, uranium: 3, space: 3 },
        grant: ['uranium',4],
        cost: {
            Knowledge(){ return 160000; },
            Uranium(){ return 250; },
            Iridium(){ return 1000; }
        },
        effect: loc('tech_breeder_reactor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mine_conveyor: {
        id: 'tech-mine_conveyor',
        title: loc('tech_mine_conveyor'),
        desc: loc('tech_mine_conveyor'),
        category: 'mining',
        era: 'discovery',
        reqs: { high_tech: 2 },
        grant: ['mine_conveyor',1],
        cost: {
            Knowledge(){ return 16200; },
            Copper(){ return 2250; },
            Steel(){ return 1750; }
        },
        effect: loc('tech_mine_conveyor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    oil_well: {
        id: 'tech-oil_well',
        title(){ return global.race['blubber'] ? loc('tech_oil_refinery') : loc('tech_oil_well'); },
        desc(){ return global.race['blubber'] ? loc('tech_oil_refinery') : loc('tech_oil_well'); },
        category: 'power_generation',
        era: 'industrialized',
        reqs: { high_tech: 3 },
        grant: ['oil',1],
        cost: {
            Knowledge(){ return 27000; }
        },
        effect(){ return global.race['blubber'] ? loc('tech_oil_refinery_effect') : loc('tech_oil_well_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.oil_well);
                return true;
            }
            return false;
        }
    },
    oil_depot: {
        id: 'tech-oil_depot',
        title: loc('tech_oil_depot'),
        desc: loc('tech_oil_depot'),
        category: 'storage',
        era: 'industrialized',
        reqs: { oil: 1 },
        grant: ['oil',2],
        cost: {
            Knowledge(){ return 32000; }
        },
        effect: loc('tech_oil_depot_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.oil_depot);
                return true;
            }
            return false;
        }
    },
    oil_power: {
        id: 'tech-oil_power',
        title(){
            return global.race['environmentalist'] ? loc('city_wind_power') : loc('tech_oil_power');
        },
        desc(){
            return global.race['environmentalist'] ? loc('city_wind_power') : loc('tech_oil_power');
        },
        category: 'power_generation',
        era: 'industrialized',
        reqs: { oil: 2 },
        grant: ['oil',3],
        cost: {
            Knowledge(){ return 44000; }
        },
        effect(){
            return global.race['environmentalist'] ? loc('tech_wind_power_effect') : loc('tech_oil_power_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.oil_power);
                return true;
            }
            return false;
        }
    },
    titanium_drills: {
        id: 'tech-titanium_drills',
        title: loc('tech_titanium_drills'),
        desc: loc('tech_titanium_drills'),
        category: 'power_generation',
        era: 'industrialized',
        reqs: { oil: 3 },
        grant: ['oil',4],
        cost: {
            Knowledge(){ return 54000; },
            Titanium(){ return 3500; }
        },
        effect: loc('tech_titanium_drills_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    alloy_drills: {
        id: 'tech-alloy_drills',
        title: loc('tech_alloy_drills'),
        desc: loc('tech_alloy_drills'),
        category: 'power_generation',
        era: 'globalized',
        reqs: { oil: 4 },
        grant: ['oil',5],
        cost: {
            Knowledge(){ return 77000; },
            Alloy(){ return 1000; }
        },
        effect: loc('tech_alloy_drills_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fracking: {
        id: 'tech-fracking',
        title: loc('tech_fracking'),
        desc: loc('tech_fracking'),
        category: 'power_generation',
        era: 'globalized',
        reqs: { oil: 5, high_tech: 6 },
        grant: ['oil',6],
        cost: {
            Knowledge(){ return 132000; }
        },
        effect: loc('tech_fracking_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mythril_drills: {
        id: 'tech-mythril_drills',
        title: loc('tech_mythril_drills'),
        desc: loc('tech_mythril_drills'),
        category: 'power_generation',
        era: 'early_space',
        reqs: { oil: 6, space: 3 },
        grant: ['oil',7],
        cost: {
            Knowledge(){ return 165000; },
            Mythril(){ return 100; }
        },
        effect: loc('tech_mythril_drills_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mass_driver: {
        id: 'tech-mass_driver',
        title: loc('tech_mass_driver'),
        desc: loc('tech_mass_driver'),
        category: 'power_generation',
        era: 'early_space',
        reqs: { oil: 6, space: 3 },
        grant: ['mass',1],
        cost: {
            Knowledge(){ return 160000; }
        },
        effect: loc('tech_mass_driver_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.mass_driver);
                return true;
            }
            return false;
        }
    },
    orichalcum_driver: {
        id: 'tech-orichalcum_driver',
        title: loc('tech_orichalcum_driver'),
        desc: loc('tech_orichalcum_driver'),
        category: 'science',
        era: 'intergalactic',
        reqs: { mass: 1, science: 19 },
        grant: ['mass',2],
        not_trait: ['orbit_decayed'],
        cost: {
            Knowledge(){ return 14000000; },
            Orichalcum(){ return 400000; }
        },
        effect(){ return loc('tech_orichalcum_driver_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.terraformer);
                return true;
            }
            return false;
        }
    },
    polymer: {
        id: 'tech-polymer',
        title: loc('tech_polymer'),
        desc: loc('tech_polymer'),
        category: 'crafting',
        era: 'globalized',
        reqs: { genetics: 1 },
        grant: ['polymer',1],
        cost: {
            Knowledge(){ return 80000; },
            Oil(){ return 5000; },
            Alloy(){ return 450; }
        },
        effect: loc('tech_polymer_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Polymer.display = true;
                messageQueue(loc('tech_polymer_avail'),'info',false,['progress']);
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
            renderPsychicPowers();
        }
    },
    fluidized_bed_reactor: {
        id: 'tech-fluidized_bed_reactor',
        title: loc('tech_fluidized_bed_reactor'),
        desc: loc('tech_fluidized_bed_reactor'),
        category: 'crafting',
        era: 'globalized',
        reqs: { polymer: 1, high_tech: 6 },
        grant: ['polymer',2],
        cost: {
            Knowledge(){ return 99000; }
        },
        effect: loc('tech_fluidized_bed_reactor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    synthetic_fur: {
        id: 'tech-synthetic_fur',
        title(){ return global.race['evil'] ? loc('tech_faux_leather') : loc('tech_synthetic_fur'); },
        desc(){ return global.race['evil'] ? loc('tech_faux_leather') : loc('tech_synthetic_fur'); },
        category: 'crafting',
        era: 'globalized',
        reqs: { polymer: 1 },
        condition(){ return global.resource.Furs.display; },
        grant: ['synthetic_fur',1],
        cost: {
            Knowledge(){ return 100000; },
            Polymer(){ return 2500; }
        },
        effect(){ return global.race['evil'] ? loc('tech_faux_leather_effect') : loc('tech_synthetic_fur_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
        }
    },
    nanoweave: {
        id: 'tech-nanoweave',
        title: loc('tech_nanoweave'),
        desc: loc('tech_nanoweave'),
        category: 'crafting',
        era: 'intergalactic',
        reqs: { science: 18 },
        grant: ['nanoweave',1],
        cost: {
            Knowledge(){ return 8500000; },
            Nano_Tube(){ return 5000000; },
            Vitreloy(){ return 250000; },
        },
        effect: loc('tech_nanoweave_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Nanoweave.display = true;
                messageQueue(loc('tech_nanoweave_avail'),'info',false,['progress']);
                loadFoundry();
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    stanene: {
        id: 'tech-stanene',
        title: loc('tech_stanene'),
        desc: loc('tech_stanene'),
        category: 'crafting',
        era: 'interstellar',
        reqs: { infernite: 1 },
        grant: ['stanene',1],
        cost: {
            Knowledge(){ return 590000; },
            Aluminium(){ return 500000; },
            Infernite(){ return 1000; }
        },
        effect: loc('tech_stanene_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Stanene.display = true;
                messageQueue(loc('tech_stanene_avail'),'info',false,['progress']);
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
            renderPsychicPowers();
        }
    },
    nano_tubes: {
        id: 'tech-nano_tubes',
        title: loc('tech_nano_tubes'),
        desc: loc('tech_nano_tubes'),
        category: 'crafting',
        era: 'deep_space',
        reqs: { high_tech: 10 },
        grant: ['nano',1],
        cost: {
            Knowledge(){ return 375000; },
            Coal(){ return 100000; },
            Neutronium(){ return 1000; }
        },
        effect: loc('tech_nano_tubes_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Nano_Tube.display = true;
                messageQueue(loc('tech_nano_tubes_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
            renderPsychicPowers();
        }
    },
    scarletite: {
        id: 'tech-scarletite',
        title: loc('tech_scarletite'),
        desc: loc('tech_scarletite'),
        category: 'crafting',
        era: 'dimensional',
        reqs: { hell_ruins: 4 },
        grant: ['scarletite',1],
        cost: {
            Knowledge(){ return 26750000; },
            Iron(){ return 100000000; },
            Adamantite(){ return 15000000; },
            Orichalcum(){ return 8000000; }
        },
        effect: loc('tech_scarletite_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Scarletite.display = true;
                initStruct(actions.portal.prtl_ruins.hell_forge);
                messageQueue(loc('tech_scarletite_avail'),'info',false,['progress']);
                loadFoundry();
                if (global.race.universe !== 'micro' && !global.pillars[global.race.species]){
                    global.tech['fusable'] = 1;
                }
                else {
                    if (global.race.universe !== 'micro'){
                        let rank = alevel();
                        if (rank > global.pillars[global.race.species]){
                            global.pillars[global.race.species] = rank;
                        }
                    }
                    global.tech['pillars'] = 2;
                }
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    pillars: {
        id: 'tech-pillars',
        title: loc('tech_pillars'),
        desc: loc('tech_pillars'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { scarletite: 1, fusable: 1 },
        grant: ['pillars',1],
        cost: {
            Knowledge(){ return 30000000; }
        },
        effect: loc('tech_pillars_effect'),
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_pillars_msg',[races[global.race.species].entity]),'info',false,['progress','hell']);
                return true;
            }
            return false;
        }
    },
    reclaimer: {
        id: 'tech-reclaimer',
        title: loc('tech_reclaimer'),
        desc: loc('tech_reclaimer_desc'),
        category: 'reclaimer',
        era: 'civilized',
        reqs: { primitive: 3 },
        grant: ['reclaimer',1],
        trait: ['evil'],
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 45; },
            Lumber(){ return 20; },
            Stone(){ return 20; }
        },
        effect: loc('tech_reclaimer_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.lumberjack.name = loc('job_reclaimer');
                if (!global.race['forager']){
                    global.civic.lumberjack.display = true;
                }
                initStruct(actions.city.graveyard);
                return true;
            }
            return false;
        }
    },
    shovel: {
        id: 'tech-shovel',
        title: loc('tech_shovel'),
        desc: loc('tech_shovel'),
        category: 'reclaimer',
        era: 'civilized',
        reqs: { reclaimer: 1, mining: 2 },
        grant: ['reclaimer',2],
        trait: ['evil'],
        not_trait: ['living_tool','forager'],
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 540; },
            Copper(){ return 25; }
        },
        effect: loc('tech_shovel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_shovel: {
        id: 'tech-iron_shovel',
        title: loc('tech_iron_shovel'),
        desc: loc('tech_iron_shovel'),
        category: 'reclaimer',
        era: 'civilized',
        reqs: { reclaimer: 2, mining: 3 },
        grant: ['reclaimer',3],
        trait: ['evil'],
        not_trait: ['living_tool','forager'],
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 2700; },
            Iron(){ return 250; }
        },
        effect: loc('tech_iron_shovel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_shovel: {
        id: 'tech-steel_shovel',
        title: loc('tech_steel_shovel'),
        desc: loc('tech_steel_shovel'),
        category: 'reclaimer',
        era: 'discovery',
        reqs: { reclaimer: 3, smelting: 2 },
        grant: ['reclaimer',4],
        trait: ['evil'],
        not_trait: ['living_tool','forager'],
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 9000; },
            Steel(){ return 250; }
        },
        effect: loc('tech_steel_shovel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    titanium_shovel: {
        id: 'tech-titanium_shovel',
        title: loc('tech_titanium_shovel'),
        desc: loc('tech_titanium_shovel'),
        category: 'reclaimer',
        era: 'industrialized',
        reqs: { reclaimer: 4, high_tech: 3 },
        grant: ['reclaimer',5],
        trait: ['evil'],
        not_trait: ['living_tool','forager'],
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 38000; },
            Titanium(){ return 350; }
        },
        effect: loc('tech_titanium_shovel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    alloy_shovel: {
        id: 'tech-alloy_shovel',
        title: loc('tech_alloy_shovel'),
        desc: loc('tech_alloy_shovel'),
        category: 'reclaimer',
        era: 'globalized',
        reqs: { reclaimer: 5, high_tech: 4 },
        grant: ['reclaimer',6],
        trait: ['evil'],
        not_trait: ['living_tool','forager'],
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 67500; },
            Alloy(){ return 750; }
        },
        effect: loc('tech_alloy_shovel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mythril_shovel: {
        id: 'tech-mythril_shovel',
        title: loc('tech_mythril_shovel'),
        desc: loc('tech_mythril_shovel'),
        category: 'reclaimer',
        era: 'early_space',
        reqs: { reclaimer: 6, space: 3 },
        grant: ['reclaimer',7],
        trait: ['evil'],
        not_trait: ['living_tool','forager'],
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 160000; },
            Mythril(){ return 880; }
        },
        effect: loc('tech_mythril_shovel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_shovel: {
        id: 'tech-adamantite_shovel',
        title: loc('tech_adamantite_shovel'),
        desc: loc('tech_adamantite_shovel'),
        category: 'reclaimer',
        era: 'interstellar',
        reqs: { reclaimer: 7, alpha: 2 },
        grant: ['reclaimer',8],
        trait: ['evil'],
        not_trait: ['living_tool','forager'],
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 525000; },
            Adamantite(){ return 10000; }
        },
        effect: loc('tech_adamantite_shovel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    stone_axe: {
        id: 'tech-stone_axe',
        title(){ return loc('tech_stone_axe'); },
        desc(){ return loc('tech_stone_axe_desc'); },
        category: 'lumber_gathering',
        reqs: { primitive: 3 },
        era: 'civilized',
        grant: ['axe',1],
        not_trait: ['kindling_kindred','smoldering','evil','cataclysm'],
        cost: {
            Knowledge(){ return 45; },
            Lumber(){ return 20; },
            Stone(){ return 20; }
        },
        effect(){
            if (global.race['living_tool']){ return loc(`tech_basic_livingtools`); }
            return global.race['sappy'] ? loc('tech_amber_axe_effect') : loc('tech_stone_axe_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                if (!global.race['forager']){
                    global.civic.lumberjack.display = true;
                }
                initStruct(actions.city.lumber_yard);
                return true;
            }
            return false;
        }
    },
    copper_axes: {
        id: 'tech-copper_axes',
        title: loc('tech_copper_axes'),
        desc: loc('tech_copper_axes_desc'),
        category: 'lumber_gathering',
        era: 'civilized',
        reqs: { axe: 1, mining: 2 },
        not_trait: ['living_tool','forager'],
        grant: ['axe',2],
        cost: {
            Knowledge(){ return 540; },
            Copper(){ return 25; }
        },
        effect: loc('tech_copper_axes_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_saw: {
        id: 'tech-iron_saw',
        title: loc('tech_iron_saw'),
        desc: loc('tech_iron_saw_desc'),
        category: 'lumber_gathering',
        era: 'civilized',
        reqs: { axe: 1, mining: 3 },
        grant: ['saw',1],
        not_trait: ['lone_survivor'],
        cost: {
            Knowledge(){ return 3375; },
            Iron(){ return 400; }
        },
        effect: loc('tech_iron_saw_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.sawmill);
                return true;
            }
            return false;
        }
    },
    steel_saw: {
        id: 'tech-steel_saw',
        title: loc('tech_steel_saw'),
        desc: loc('tech_steel_saw_desc'),
        category: 'lumber_gathering',
        era: 'discovery',
        reqs: { smelting: 2, saw: 1 },
        grant: ['saw',2],
        cost: {
            Knowledge(){ return 10800; },
            Steel(){ return 400; }
        },
        effect: loc('tech_steel_saw_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_axes: {
        id: 'tech-iron_axes',
        title: loc('tech_iron_axes'),
        desc: loc('tech_iron_axes_desc'),
        category: 'lumber_gathering',
        era: 'civilized',
        reqs: { axe: 2, mining: 3 },
        not_trait: ['living_tool','forager'],
        grant: ['axe',3],
        cost: {
            Knowledge(){ return global.city.ptrait.includes('unstable') ? 1350 : 2700; },
            Iron(){ return 250; }
        },
        effect: loc('tech_iron_axes_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_axes: {
        id: 'tech-steel_axes',
        title: loc('tech_steel_axes'),
        desc: loc('tech_steel_axes_desc'),
        category: 'lumber_gathering',
        era: 'discovery',
        reqs: { axe: 3, smelting: 2 },
        not_trait: ['living_tool','forager'],
        grant: ['axe',4],
        cost: {
            Knowledge(){ return 9000; },
            Steel(){ return 250; }
        },
        effect: loc('tech_steel_axes_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    titanium_axes: {
        id: 'tech-titanium_axes',
        title: loc('tech_titanium_axes'),
        desc: loc('tech_titanium_axes_desc'),
        category: 'lumber_gathering',
        era: 'industrialized',
        reqs: { axe: 4, high_tech: 3 },
        not_trait: ['living_tool','forager'],
        grant: ['axe',5],
        cost: {
            Knowledge(){ return 38000; },
            Titanium(){ return 350; }
        },
        effect: loc('tech_titanium_axes_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    chainsaws: {
        id: 'tech-chainsaws',
        title: loc('tech_chainsaws'),
        desc: loc('tech_chainsaws_desc'),
        category: 'lumber_gathering',
        era: 'interstellar',
        reqs: { axe: 5, alpha: 2 },
        not_trait: ['living_tool','forager'],
        grant: ['axe',6],
        cost: {
            Knowledge(){ return 560000; },
            Oil(){ return 10000; },
            Adamantite(){ return 2000; },
        },
        effect: loc('tech_chainsaws_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){ return `<div>${loc('tech_chainsaws_flair1')}</div><div>${loc('tech_chainsaws_flair2')}</div>`; }
    },
    copper_sledgehammer: {
        id: 'tech-copper_sledgehammer',
        title: loc('tech_copper_sledgehammer'),
        desc: loc('tech_copper_sledgehammer_desc'),
        category: 'stone_gathering',
        era: 'civilized',
        reqs: { mining: 2 },
        not_trait: ['cataclysm','sappy','living_tool','forager'],
        grant: ['hammer',1],
        cost: {
            Knowledge(){ return 540; },
            Copper(){ return 25; }
        },
        effect: loc('tech_copper_sledgehammer_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_sledgehammer: {
        id: 'tech-iron_sledgehammer',
        title: loc('tech_iron_sledgehammer'),
        desc: loc('tech_iron_sledgehammer_desc'),
        category: 'stone_gathering',
        era: 'civilized',
        reqs: { hammer: 1, mining: 3 },
        not_trait: ['cataclysm','sappy','living_tool','forager'],
        grant: ['hammer',2],
        cost: {
            Knowledge(){ return global.city.ptrait.includes('unstable') ? 1350 : 2700; },
            Iron(){ return 250; }
        },
        effect: loc('tech_iron_sledgehammer_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_sledgehammer: {
        id: 'tech-steel_sledgehammer',
        title: loc('tech_steel_sledgehammer'),
        desc: loc('tech_steel_sledgehammer_desc'),
        category: 'stone_gathering',
        era: 'discovery',
        reqs: { hammer: 2, smelting: 2 },
        not_trait: ['cataclysm','sappy','living_tool','forager'],
        grant: ['hammer',3],
        cost: {
            Knowledge(){ return 7200; },
            Steel(){ return 250; }
        },
        effect: loc('tech_steel_sledgehammer_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    titanium_sledgehammer: {
        id: 'tech-titanium_sledgehammer',
        title: loc('tech_titanium_sledgehammer'),
        desc: loc('tech_titanium_sledgehammer_desc'),
        category: 'stone_gathering',
        era: 'industrialized',
        reqs: { hammer: 3, high_tech: 3 },
        not_trait: ['cataclysm','sappy','living_tool','forager'],
        grant: ['hammer',4],
        cost: {
            Knowledge(){ return 40000; },
            Titanium(){ return 400; }
        },
        effect: loc('tech_titanium_sledgehammer_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    copper_pickaxe: {
        id: 'tech-copper_pickaxe',
        title: loc('tech_copper_pickaxe'),
        desc: loc('tech_copper_pickaxe_desc'),
        category: 'mining',
        era: 'civilized',
        reqs: { mining: 2 },
        not_trait: ['cataclysm','living_tool','tusk'],
        grant: ['pickaxe',1],
        cost: {
            Knowledge(){ return 675; },
            Copper(){ return 25; }
        },
        effect: loc('tech_copper_pickaxe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_pickaxe: {
        id: 'tech-iron_pickaxe',
        title: loc('tech_iron_pickaxe'),
        desc: loc('tech_iron_pickaxe_desc'),
        category: 'mining',
        era: 'civilized',
        reqs: { pickaxe: 1, mining: 3 },
        not_trait: ['cataclysm','living_tool','tusk'],
        grant: ['pickaxe',2],
        cost: {
            Knowledge(){ return global.city.ptrait.includes('unstable') ? 1600 : 3200; },
            Iron(){ return 250; }
        },
        effect: loc('tech_iron_pickaxe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_pickaxe: {
        id: 'tech-steel_pickaxe',
        title: loc('tech_steel_pickaxe'),
        desc: loc('tech_steel_pickaxe_desc'),
        category: 'mining',
        era: 'discovery',
        reqs: { pickaxe: 2, smelting: 2 },
        not_trait: ['living_tool','tusk'],
        grant: ['pickaxe',3],
        cost: {
            Knowledge(){ return 9000; },
            Steel(){ return 250; }
        },
        effect: loc('tech_steel_pickaxe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    jackhammer: {
        id: 'tech-jackhammer',
        title: loc('tech_jackhammer'),
        desc: loc('tech_jackhammer_desc'),
        category: 'mining',
        era: 'discovery',
        reqs: { pickaxe: 3, high_tech: 2 },
        not_trait: ['living_tool','tusk'],
        grant: ['pickaxe',4],
        cost: {
            Knowledge(){ return 22500; },
            Copper(){ return 5000; }
        },
        effect: loc('tech_jackhammer_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    jackhammer_mk2: {
        id: 'tech-jackhammer_mk2',
        title: loc('tech_jackhammer_mk2'),
        desc: loc('tech_jackhammer_mk2'),
        category: 'mining',
        era: 'globalized',
        reqs: { pickaxe: 4, high_tech: 4 },
        not_trait: ['living_tool','tusk'],
        grant: ['pickaxe',5],
        cost: {
            Knowledge(){ return 67500; },
            Titanium(){ return 2000; },
            Alloy(){ return 500; }
        },
        effect: loc('tech_jackhammer_mk2_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_hammer: {
        id: 'tech-adamantite_hammer',
        title(){ return loc('tech_improved_jackhammer',[global.resource.Adamantite.name]); },
        desc(){ return loc('tech_improved_jackhammer',[global.resource.Adamantite.name]); },
        category: 'mining',
        era: 'interstellar',
        reqs: { pickaxe: 5, alpha: 2 },
        not_trait: ['living_tool','tusk'],
        grant: ['pickaxe',6],
        cost: {
            Knowledge(){ return 535000; },
            Adamantite(){ return 12500; }
        },
        effect(){ return loc('tech_improved_jackhammer_effect',[global.resource.Adamantite.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elysanite_hammer: {
        id: 'tech-elysanite_hammer',
        title(){ return loc('tech_improved_jackhammer',[global.resource.Elysanite.name]); },
        desc(){ return loc('tech_improved_jackhammer',[global.resource.Elysanite.name]); },
        category: 'mining',
        era: 'existential',
        reqs: { pickaxe: 6, elysium: 7 },
        not_trait: ['living_tool','tusk'],
        grant: ['pickaxe',7],
        cost: {
            Knowledge(){ return 97500000; },
            Omniscience(){ return 21500; },
            Elysanite(){ return 35000000; }
        },
        effect(){ return loc('tech_improved_jackhammer_effect',[global.resource.Elysanite.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    copper_hoe: {
        id: 'tech-copper_hoe',
        title: loc('tech_copper_hoe'),
        desc: loc('tech_copper_hoe_desc'),
        category: 'agriculture',
        era: 'civilized',
        reqs: { mining: 2, agriculture: 1 },
        not_trait: ['cataclysm','living_tool'],
        grant: ['hoe',1],
        cost: {
            Knowledge(){ return 720; },
            Copper(){ return 50; }
        },
        effect: loc('tech_copper_hoe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_hoe: {
        id: 'tech-iron_hoe',
        title: loc('tech_iron_hoe'),
        desc: loc('tech_iron_hoe_desc'),
        category: 'agriculture',
        era: 'civilized',
        reqs: { hoe: 1, mining: 3, agriculture: 1 },
        not_trait: ['living_tool'],
        grant: ['hoe',2],
        cost: {
            Knowledge(){ return global.city.ptrait.includes('unstable') ? 1800 : 3600; },
            Iron(){ return 500; }
        },
        effect: loc('tech_iron_hoe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_hoe: {
        id: 'tech-steel_hoe',
        title: loc('tech_steel_hoe'),
        desc: loc('tech_steel_hoe_desc'),
        category: 'agriculture',
        era: 'discovery',
        reqs: { hoe: 2, smelting: 2, agriculture: 1 },
        not_trait: ['living_tool'],
        grant: ['hoe',3],
        cost: {
            Knowledge(){ return 12600; },
            Steel(){ return 500; }
        },
        effect: loc('tech_steel_hoe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    titanium_hoe: {
        id: 'tech-titanium_hoe',
        title: loc('tech_titanium_hoe'),
        desc: loc('tech_titanium_hoe_desc'),
        category: 'agriculture',
        era: 'industrialized',
        reqs: { hoe: 3, high_tech: 3, agriculture: 1 },
        not_trait: ['living_tool'],
        grant: ['hoe',4],
        cost: {
            Knowledge(){ return 44000; },
            Titanium(){ return 500; }
        },
        effect: loc('tech_titanium_hoe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_hoe: {
        id: 'tech-adamantite_hoe',
        title: loc('tech_adamantite_hoe'),
        desc: loc('tech_adamantite_hoe_desc'),
        category: 'agriculture',
        era: 'interstellar',
        reqs: { hoe: 4, alpha: 2 },
        not_trait: ['living_tool'],
        grant: ['hoe',5],
        cost: {
            Knowledge(){ return 530000; },
            Adamantite(){ return 1000; }
        },
        effect: loc('tech_adamantite_hoe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    cyber_limbs: {
        id: 'tech-cyber_limbs',
        title: loc('tech_cyber_limbs'),
        desc: loc('tech_cyber_limbs'),
        category: 'mining',
        era: 'dimensional',
        reqs: { high_tech: 18 },
        grant: ['cyber_worker',1],
        cost: {
            Knowledge(){ return 27000000; },
        },
        effect: loc('tech_cyber_limbs_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    slave_pens: {
        id: 'tech-slave_pens',
        title(){ return loc('city_slave_housing',[global.resource.Slave.name]); },
        desc(){ return loc('city_slave_housing',[global.resource.Slave.name]); },
        category: 'slaves',
        era: 'civilized',
        reqs: { military: 1, mining: 1 },
        not_trait: ['cataclysm','lone_survivor'],
        grant: ['slaves',1],
        trait: ['slaver'],
        cost: {
            Knowledge(){ return 150; }
        },
        effect(){
            return loc('tech_slave_pens_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.slave_pen);
                global.resource.Slave.amount = 0;
                return true;
            }
            return false;
        }
    },
    slave_market: {
        id: 'tech-slave_market',
        title(){ return loc('city_slaver_market',[global.resource.Slave.name]); },
        desc(){ return loc('city_slaver_market',[global.resource.Slave.name]); },
        category: 'slaves',
        era: 'discovery',
        reqs: { slaves: 1, high_tech: 1 },
        grant: ['slaves',2],
        trait: ['slaver'],
        cost: {
            Knowledge(){ return 8000; }
        },
        effect(){
            return loc('tech_slave_market_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        }
    },
    ceremonial_dagger: {
        id: 'tech-ceremonial_dagger',
        title: loc('tech_ceremonial_dagger'),
        desc: loc('tech_ceremonial_dagger'),
        category: 'sacrifice',
        era: 'civilized',
        reqs: { mining: 1 },
        grant: ['sacrifice',1],
        trait: ['cannibalize'],
        not_trait: ['cataclysm','lone_survivor'],
        cost: {
            Knowledge(){ return 60; }
        },
        effect: loc('tech_ceremonial_dagger_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    last_rites: {
        id: 'tech-last_rites',
        title: loc('tech_last_rites'),
        desc: loc('tech_last_rites'),
        category: 'sacrifice',
        era: 'civilized',
        reqs: { sacrifice: 1, theology: 2 },
        grant: ['sacrifice',2],
        trait: ['cannibalize'],
        cost: {
            Knowledge(){ return 1000; }
        },
        effect: loc('tech_last_rites_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ancient_infusion: {
        id: 'tech-ancient_infusion',
        title: loc('tech_ancient_infusion'),
        desc: loc('tech_ancient_infusion'),
        category: 'sacrifice',
        era: 'early_space',
        reqs: { sacrifice: 2, theology: 4 },
        grant: ['sacrifice',3],
        trait: ['cannibalize'],
        cost: {
            Knowledge(){ return 182000; }
        },
        effect: loc('tech_ancient_infusion_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    garrison: {
        id: 'tech-garrison',
        title: loc('tech_garrison'),
        desc: loc('tech_garrison_desc'),
        category: 'military',
        era: 'civilized',
        reqs: { science: 1, housing: 1 },
        grant: ['military',1],
        cost: {
            Knowledge(){ return 70; }
        },
        effect: loc('tech_garrison_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.garrison);
                return true;
            }
            return false;
        }
    },
    mercs: {
        id: 'tech-mercs',
        title: loc('tech_mercs'),
        desc: loc('tech_mercs_desc'),
        category: 'military',
        era: 'civilized',
        reqs: { military: 1 },
        grant: ['mercs',1],
        not_trait: ['lone_survivor'],
        cost: {
            Money(){ return 10000 },
            Knowledge(){ return 4500; }
        },
        effect: loc('tech_mercs_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.garrison['mercs'] = true;
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        }
    },
    signing_bonus: {
        id: 'tech-signing_bonus',
        title: loc('tech_signing_bonus'),
        desc: loc('tech_signing_bonus_desc'),
        category: 'military',
        era: 'industrialized',
        reqs: { mercs: 1, high_tech: 3 },
        grant: ['mercs',2],
        cost: {
            Money(){ return 50000 },
            Knowledge(){ return 32000; }
        },
        effect: loc('tech_signing_bonus_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    hospital: {
        id: 'tech-hospital',
        title: loc('tech_hospital'),
        desc: loc('tech_hospital'),
        category: 'military',
        era: 'civilized',
        reqs: { military: 1, alumina: 1 },
        grant: ['medic',1],
        not_trait: ['artifical'],
        cost: {
            Knowledge(){ return 5000; }
        },
        effect: loc('tech_hospital_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.hospital);
                return true;
            }
            return false;
        }
    },
    bac_tanks: {
        id: 'tech-bac_tanks',
        title(){ return global.race['artifical'] ? loc('tech_repair_subroutines') : loc('tech_bac_tanks'); },
        desc(){ return global.race['artifical'] ? loc('tech_repair_subroutines') : loc('tech_bac_tanks_desc'); },
        category: 'military',
        era: 'interstellar',
        reqs: { medic: 1, infernite: 1 },
        grant: ['medic',2],
        cost: {
            Knowledge(){ return 600000; },
            Infernite(){ return 250; }
        },
        effect(){ return global.race['artifical'] ? loc('tech_repair_subroutines_effect') : loc('tech_bac_tanks_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    boot_camp: {
        id: 'tech-boot_camp',
        title: loc('tech_boot_camp'),
        desc: loc('tech_boot_camp_desc'),
        category: 'military',
        era: 'discovery',
        reqs: { high_tech: 1 },
        grant: ['boot_camp',1],
        cost: {
            Knowledge(){ return 8000; }
        },
        effect: loc('tech_boot_camp_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.boot_camp);
                return true;
            }
            return false;
        }
    },
    vr_training: {
        id: 'tech-vr_training',
        title: loc('tech_vr_training'),
        desc: loc('tech_vr_training'),
        category: 'military',
        era: 'interstellar',
        path: ['standard','truepath'],
        reqs: { boot_camp: 1, high_tech: 12 },
        not_trait: ['cataclysm','lone_survivor'],
        grant: ['boot_camp',2],
        cost: {
            Knowledge(){ return 625000; }
        },
        effect(){ return loc('tech_vr_training_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    bows: {
        id: 'tech-bows',
        title(){ return global.race['blubber'] ? loc('tech_harpoon') : loc('tech_bows'); },
        desc: loc('tech_bows_desc'),
        category: 'military',
        era: 'civilized',
        reqs: { military: 1 },
        grant: ['military',2],
        cost: {
            Knowledge(){ return 225; },
            Lumber(){ return 250; }
        },
        effect(){ return global.race['blubber'] ? loc('tech_harpoon_effect') : loc('tech_bows_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    flintlock_rifle: {
        id: 'tech-flintlock_rifle',
        title(){ return global.race.universe === 'magic' ? loc('tech_magic_arrow') : loc('tech_flintlock_rifle'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_magic_arrow') : loc('tech_flintlock_rifle'); },
        category: 'military',
        era: 'civilized',
        reqs: { military: 2, explosives: 1 },
        grant: ['military',3],
        cost: {
            Knowledge(){ return 5400; },
            Coal(){ return global.race.universe === 'magic' ? 0 : 750; },
            Mana(){ return global.race.universe === 'magic' ? 100 : 0; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_magic_arrow_effect') : loc('tech_flintlock_rifle_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    machine_gun: {
        id: 'tech-machine_gun',
        title(){ return global.race.universe === 'magic' ? loc('tech_fire_mage') : loc('tech_machine_gun'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_fire_mage') : loc('tech_machine_gun'); },
        category: 'military',
        era: 'industrialized',
        reqs: { military: 3, oil: 1 },
        grant: ['military',4],
        cost: {
            Mana(){ return global.race.universe === 'magic' ? 300 : 0; },
            Knowledge(){ return 33750; },
            Oil(){ return 1500; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_fire_mage_effect') : loc('tech_machine_gun_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    bunk_beds: {
        id: 'tech-bunk_beds',
        title: loc('tech_bunk_beds'),
        desc: loc('tech_bunk_beds'),
        category: 'military',
        era: 'globalized',
        reqs: { military: 4, high_tech: 4 },
        grant: ['military',5],
        cost: {
            Knowledge(){ return 76500; },
            Furs(){ return 25000; },
            Alloy(){ return 3000; }
        },
        effect: loc('tech_bunk_beds_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    rail_guns: {
        id: 'tech-rail_guns',
        title(){ return global.race.universe === 'magic' ? loc('tech_lightning_caster') : loc('tech_rail_guns'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_lightning_caster') : loc('tech_rail_guns'); },
        category: 'military',
        era: 'early_space',
        reqs: { military: 5, mass: 1 },
        grant: ['military',6],
        cost: {
            Mana(){ return global.race.universe === 'magic' ? 450 : 0; },
            Knowledge(){ return 200000; },
            Iridium(){ return 2500; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_lightning_caster_effect') : loc('tech_rail_guns_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    laser_rifles: {
        id: 'tech-laser_rifles',
        title(){ return global.race.universe === 'magic' ? loc('tech_mana_rifles') : loc('tech_laser_rifles'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_mana_rifles') : loc('tech_laser_rifles'); },
        category: 'military',
        era: 'deep_space',
        reqs: { military: 6, high_tech: 9, elerium: 1 },
        grant: ['military',7],
        cost: {
            Knowledge(){ return 325000; },
            Elerium(){ return 250; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_mana_rifles_effect') : loc('tech_laser_rifles_effect'); },
        action(){
            if (payCosts($(this)[0])){
                if (global.race.species === 'sharkin'){
                    unlockAchieve('laser_shark');
                }
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    plasma_rifles: {
        id: 'tech-plasma_rifles',
        title(){ return global.race.universe === 'magic' ? loc('tech_focused_rifles') : loc('tech_plasma_rifles'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_focused_rifles') : loc('tech_plasma_rifles'); },
        category: 'military',
        era: 'interstellar',
        reqs: { military: 7, high_tech: 13 },
        grant: ['military',8],
        path: ['standard','truepath'],
        cost: {
            Knowledge(){ return 780000; },
            Elerium(){ return global.race['truepath'] ? 1000 : 500; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_focused_rifles_effect') : loc('tech_plasma_rifles_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    disruptor_rifles: {
        id: 'tech-disruptor_rifles',
        title(){ return global.race.universe === 'magic' ? loc('tech_magic_missile') : loc('tech_disruptor_rifles'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_magic_missile') : loc('tech_disruptor_rifles'); },
        category: 'military',
        era: 'interstellar',
        reqs: { military: 8, high_tech: 14, science: 15, infernite: 1 },
        grant: ['military',9],
        cost: {
            Knowledge(){ return 1000000; },
            Infernite(){ return 1000; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_magic_missile_effect') : loc('tech_disruptor_rifles_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    gauss_rifles: {
        id: 'tech-gauss_rifles',
        title(){ return global.race.universe === 'magic' ? loc('tech_magicword_kill') : loc('tech_gauss_rifles'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_magicword_kill') : loc('tech_gauss_rifles'); },
        category: 'military',
        era: 'intergalactic',
        reqs: { military: 9, science: 18 },
        grant: ['military',10],
        cost: {
            Knowledge(){ return 9500000; },
            Bolognium(){ return 100000; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_magicword_kill_effect') : loc('tech_gauss_rifles_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    cyborg_soldiers: {
        id: 'tech-cyborg_soldiers',
        title: loc('tech_cyborg_soldiers'),
        desc: loc('tech_cyborg_soldiers'),
        category: 'military',
        era: 'dimensional',
        reqs: { military: 10, high_tech: 18 },
        grant: ['military',11],
        cost: {
            Knowledge(){ return 26000000; },
            Adamantite(){ return 8000000; },
            Bolognium(){ return 4000000; },
            Orichalcum(){ return 6000000; }
        },
        effect: loc('tech_cyborg_soldiers_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    ethereal_weapons: {
        id: 'tech-ethereal_weapons',
        title: loc('tech_ethereal_weapons'),
        desc: loc('tech_ethereal_weapons'),
        category: 'military',
        era: 'existential',
        reqs: { military: 11, asphodel: 5 },
        grant: ['military',12],
        cost: {
            Knowledge(){ return 72500000; },
            Asphodel_Powder(){ return 10777; },
            Soul_Gem(){ return 100; },
        },
        effect: loc('tech_ethereal_weapons_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    space_marines: {
        id: 'tech-space_marines',
        title: loc('tech_space_marines'),
        desc: loc('tech_space_marines_desc'),
        category: 'military',
        era: 'early_space',
        reqs: { space: 3, mars: 2 },
        grant: ['marines',1],
        cost: {
            Knowledge(){ return 210000; }
        },
        effect(){ return `<div>${loc('tech_space_marines_effect',[planetName().red])}</div>` },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.space_barracks);
                return true;
            }
            return false;
        },
        flair: loc('tech_space_marines_flair')
    },
    hammocks: {
        id: 'tech-hammocks',
        title: loc('tech_hammocks'),
        desc: loc('tech_hammocks'),
        category: 'military',
        era: 'intergalactic',
        reqs: { marines: 1, nanoweave: 1 },
        grant: ['marines',2],
        cost: {
            Knowledge(){ return 8900000; },
            Nanoweave(){ return 30000; },
        },
        effect(){ return loc('tech_hammocks_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    cruiser: {
        id: 'tech-cruiser',
        title: loc('tech_cruiser'),
        desc: loc('tech_cruiser'),
        category: 'military',
        era: 'interstellar',
        reqs: { high_tech: 14, proxima: 2, aerogel: 1 },
        grant: ['cruiser',1],
        cost: {
            Knowledge(){ return 860000; },
        },
        effect: loc('tech_cruiser_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_proxima.cruiser);
                return true;
            }
            return false;
        }
    },
    armor: {
        id: 'tech-armor',
        title: loc('tech_armor'),
        desc: loc('tech_armor_desc'),
        category: 'military',
        era: 'civilized',
        reqs: { military: 1 },
        not_trait: ['apex_predator'],
        grant: ['armor',1],
        cost: {
            Money(){ return 250; },
            Knowledge(){ return 225; },
            Furs(){ return 250; }
        },
        effect: loc('tech_armor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    plate_armor: {
        id: 'tech-plate_armor',
        title: loc('tech_plate_armor'),
        desc: loc('tech_plate_armor_desc'),
        category: 'military',
        era: 'civilized',
        reqs: { armor: 1, mining: 3 },
        grant: ['armor',2],
        cost: {
            Knowledge(){ return 3400; },
            Iron(){ return 600; },
        },
        effect: loc('tech_plate_armor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    kevlar: {
        id: 'tech-kevlar',
        title: loc('tech_kevlar'),
        desc: loc('tech_kevlar_desc'),
        category: 'military',
        era: 'globalized',
        reqs: { armor: 2, polymer: 1 },
        grant: ['armor',3],
        cost: {
            Knowledge(){ return 86000; },
            Polymer(){ return 750; },
        },
        effect: loc('tech_kevlar_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    nanoweave_vest: {
        id: 'tech-nanoweave_vest',
        title: loc('tech_nanoweave_vest'),
        desc: loc('tech_nanoweave_vest'),
        category: 'military',
        era: 'intergalactic',
        reqs: { armor: 3, nanoweave: 1 },
        grant: ['armor',4],
        cost: {
            Knowledge(){ return 9250000; },
            Nanoweave(){ return 75000; },
        },
        effect: loc('tech_nanoweave_vest_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    laser_turret: {
        id: 'tech-laser_turret',
        title: loc('tech_laser_turret'),
        desc: loc('tech_laser_turret'),
        category: 'hell_dimension',
        era: 'interstellar',
        reqs: { high_tech: 9, portal: 2 },
        grant: ['turret',1],
        cost: {
            Knowledge(){ return 600000; },
            Elerium(){ return 100; }
        },
        effect(){ return `<div>${loc('tech_laser_turret_effect1')}</div><div class="has-text-special">${loc('tech_laser_turret_effect2')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#fort`},'update');
            updateQueueNames(false, ['portal-turret']);
        }
    },
    plasma_turret: {
        id: 'tech-plasma_turret',
        title: loc('tech_plasma_turret'),
        desc: loc('tech_plasma_turret'),
        category: 'hell_dimension',
        era: 'interstellar',
        reqs: { high_tech: 13, turret: 1 },
        grant: ['turret',2],
        cost: {
            Knowledge(){ return 760000; },
            Elerium(){ return 350; }
        },
        effect(){ return `<div>${loc('tech_plasma_turret_effect')}</div><div class="has-text-special">${loc('tech_laser_turret_effect2')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#fort`},'update');
            updateQueueNames(false, ['portal-turret']);
        }
    },
    black_powder: {
        id: 'tech-black_powder',
        title(){ return global.race.universe === 'magic' ? loc('tech_magic_powder') : loc('tech_black_powder'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_magic_powder_desc') : loc('tech_black_powder_desc'); },
        category: 'progress',
        era: 'civilized',
        reqs: { mining: 4 },
        grant: ['explosives',1],
        cost: {
            Knowledge(){ return 4500; },
            Mana(){ return global.race.universe === 'magic' ? 100 : 0; },
            Crystal(){ return global.race.universe === 'magic' ? 250 : 0; },
            Coal(){ return global.race.universe === 'magic' ? 300 : 500; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_magic_powder_effect') : loc('tech_black_powder_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dynamite: {
        id: 'tech-dynamite',
        title: loc('tech_dynamite'),
        desc: loc('tech_dynamite'),
        category: 'mining',
        era: 'civilized',
        reqs: { explosives: 1 },
        grant: ['explosives',2],
        cost: {
            Knowledge(){ return 4800; },
            Coal(){ return 750; }
        },
        effect: loc('tech_dynamite_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    anfo: {
        id: 'tech-anfo',
        title: loc('tech_anfo'),
        desc: loc('tech_anfo'),
        category: 'mining',
        era: 'industrialized',
        reqs: { explosives: 2, oil: 1 },
        grant: ['explosives',3],
        cost: {
            Knowledge(){ return 42000; },
            Oil(){ return 2500; }
        },
        effect: loc('tech_anfo_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    super_tnt: {
        id: 'tech-super_tnt',
        title: loc('tech_super_tnt'),
        desc: loc('tech_super_tnt'),
        category: 'mining',
        era: 'existential',
        reqs: { explosives: 3, science: 23 },
        grant: ['explosives',4],
        cost: {
            Knowledge(){ return 85000000; },
            Omniscience(){ return 14500; },
            Asphodel_Powder(){ return 66777; }
        },
        effect(){ return loc('tech_super_tnt_effect',[global.resource.Asphodel_Powder.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mad: {
        id: 'tech-mad',
        title: loc('tech_mad'),
        desc: loc('tech_mad_desc'),
        category: 'special',
        era: 'globalized',
        reqs: { uranium: 1, explosives: 3, high_tech: 7 },
        not_trait: ['cataclysm','lone_survivor'],
        grant: ['mad',1],
        condition(){
            if (global.race['sludge'] || global.race['ultra_sludge']){ return false; }
            return global.race['truepath'] ? (global.tech['world_control'] ? true : false ) : true;
        },
        cost: {
            Knowledge(){ return 120000; },
            Oil(){ return global.city.ptrait.includes('dense') ? 10000 : 8500; },
            Uranium(){ return 1250; }
        },
        effect(){ return global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt']) ? loc('tech_mad_effect_easter') : loc('tech_mad_effect'); },
        action(){
            if (payCosts($(this)[0])){
                if (global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt'])){
                    messageQueue(loc('tech_mad_info_easter'),'info',false,['progress']);
                }
                else {
                    messageQueue(loc('tech_mad_info'),'info',false,['progress']);
                }
                global.civic.mad.display = true;
                return true;
            }
            return false;
        }
    },
    cement: {
        id: 'tech-cement',
        title: loc('tech_cement'),
        desc: loc('tech_cement_desc'),
        category: 'cement',
        era: 'civilized',
        reqs: { mining: 1, storage: 1, science: 1 },
        not_trait: ['flier'],
        grant: ['cement',1],
        cost: {
            Knowledge(){ return 500; }
        },
        effect: loc('tech_cement_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.cement_plant);
                return true;
            }
            return false;
        }
    },
    rebar: {
        id: 'tech-rebar',
        title: loc('tech_rebar'),
        desc: loc('tech_rebar'),
        category: 'cement',
        era: 'civilized',
        reqs: { mining: 3, cement: 1 },
        not_trait: ['flier'],
        grant: ['cement',2],
        cost: {
            Knowledge(){ return 3200; },
            Iron(){ return 750; }
        },
        effect: loc('tech_rebar_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_rebar: {
        id: 'tech-steel_rebar',
        title: loc('tech_steel_rebar'),
        desc: loc('tech_steel_rebar'),
        category: 'cement',
        era: 'civilized',
        reqs: { smelting: 2, cement: 2 },
        not_trait: ['flier'],
        grant: ['cement',3],
        cost: {
            Knowledge(){ return 6750; },
            Steel(){ return 750; }
        },
        effect: loc('tech_steel_rebar_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    portland_cement: {
        id: 'tech-portland_cement',
        title: loc('tech_portland_cement'),
        desc: loc('tech_portland_cement'),
        category: 'cement',
        era: 'industrialized',
        reqs: { cement: 3, high_tech: 3 },
        not_trait: ['flier'],
        grant: ['cement',4],
        cost: {
            Knowledge(){ return 32000; }
        },
        effect: loc('tech_portland_cement_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    screw_conveyor: {
        id: 'tech-screw_conveyor',
        title: loc('tech_screw_conveyor'),
        desc: loc('tech_screw_conveyor'),
        category: 'cement',
        era: 'globalized',
        reqs: { cement: 4, high_tech: 4 },
        not_trait: ['flier'],
        grant: ['cement',5],
        cost: {
            Knowledge(){ return 72000; }
        },
        effect: loc('tech_screw_conveyor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_screws: {
        id: 'tech-adamantite_screws',
        title: loc('tech_adamantite_screws'),
        desc: loc('tech_adamantite_screws'),
        category: 'cement',
        era: 'interstellar',
        reqs: { cement: 5, alpha: 2 },
        not_trait: ['cataclysm','flier'],
        grant: ['cement',6],
        cost: {
            Knowledge(){ return 500000; },
            Adamantite(){ return 10000; }
        },
        effect: loc('tech_adamantite_screws_effect',[3]),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    otherworldly_binder: {
        id: 'tech-otherworldly_binder',
        title: loc('tech_otherworldly_binder'),
        desc: loc('tech_otherworldly_binder'),
        category: 'cement',
        era: 'existential',
        reqs: { cement: 6, science: 22 },
        not_trait: ['cataclysm','flier'],
        grant: ['cement',7],
        cost: {
            Knowledge(){ return 85000000; },
            Omniscience(){ return 20000; },
            Asphodel_Powder(){ return 50000; }
        },
        effect(){ return loc('tech_otherworldly_binder_effect',[global.resource.Asphodel_Powder.name, global.resource.Cement.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    hunter_process: {
        id: 'tech-hunter_process',
        title: loc('tech_hunter_process'),
        desc: loc('tech_hunter_process'),
        category: 'mining',
        era: 'industrialized',
        reqs: { high_tech: 3, smelting: 2 },
        grant: ['titanium',1],
        cost: {
            Knowledge(){ return 45000; },
            Titanium(){ return 1000; }
        },
        effect: loc('tech_hunter_process_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Titanium.value = resource_values['Titanium'];
                return true;
            }
            return false;
        }
    },
    kroll_process: {
        id: 'tech-kroll_process',
        title: loc('tech_kroll_process'),
        desc: loc('tech_kroll_process'),
        category: 'mining',
        era: 'globalized',
        reqs: { titanium: 1, high_tech: 4 },
        grant: ['titanium',2],
        cost: {
            Knowledge(){ return 78000; },
            Titanium(){ return 10000; }
        },
        effect: loc('tech_kroll_process_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    cambridge_process: {
        id: 'tech-cambridge_process',
        title: loc('tech_cambridge_process'),
        desc: loc('tech_cambridge_process'),
        category: 'mining',
        era: 'early_space',
        reqs: { titanium: 2, supercollider: 1 },
        grant: ['titanium',3],
        cost: {
            Knowledge(){ return 135000; },
            Titanium(){ return 17500; }
        },
        effect: loc('tech_cambridge_process_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pynn_partical: {
        id: 'tech-pynn_partical',
        title: loc('tech_pynn_partical'),
        desc: loc('tech_pynn_partical'),
        category: 'progress',
        era: 'early_space',
        path: ['standard'],
        reqs: { supercollider: 1 },
        grant: ['particles',1],
        cost: {
            Knowledge(){ return 100000; }
        },
        effect: loc('tech_pynn_partical_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    matter_compression: {
        id: 'tech-matter_compression',
        title: loc('tech_matter_compression'),
        desc: loc('tech_matter_compression'),
        category: 'storage',
        era: 'early_space',
        path: ['standard'],
        reqs: { particles: 1 },
        grant: ['particles',2],
        cost: {
            Knowledge(){ return 112500; }
        },
        effect: loc('tech_matter_compression_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    higgs_boson: {
        id: 'tech-higgs_boson',
        title: loc('tech_higgs_boson'),
        desc: loc('tech_higgs_boson'),
        category: 'science',
        era: 'early_space',
        path: ['standard'],
        reqs: { particles: 2, supercollider: 2 },
        grant: ['particles',3],
        cost: {
            Knowledge(){ return 125000; }
        },
        effect: loc('tech_higgs_boson_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dimensional_compression: {
        id: 'tech-dimensional_compression',
        title: loc('tech_dimensional_compression'),
        desc: loc('tech_dimensional_compression'),
        category: 'storage',
        era: 'interstellar',
        reqs: { particles: 3, science: 11, supercollider: 3 },
        grant: ['particles',4],
        cost: {
            Knowledge(){ return 425000; }
        },
        effect: loc('tech_dimensional_compression_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    theology: {
        id: 'tech-theology',
        title: loc('tech_theology'),
        desc: loc('tech_theology'),
        category: 'religion',
        era: 'civilized',
        reqs: { theology: 1, housing: 1, cement: 1 },
        grant: ['theology',2],
        cost: {
            Knowledge(){ return 900; }
        },
        effect: loc('tech_theology_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.temple);
                if (global.race['magnificent']){
                    initStruct(actions.city.shrine);
                }
                if (global.genes['ancients'] && global.genes['ancients'] >= 2){
                    global.civic.priest.display = true;
                }
                return true;
            }
            return false;
        }
    },
    fanaticism: {
        id: 'tech-fanaticism',
        title: loc('tech_fanaticism'),
        desc: loc('tech_fanaticism'),
        category: 'religion',
        era: 'civilized',
        wiki: global.genes['transcendence'] ? false : true,
        reqs: { theology: 2 },
        grant: ['theology',3],
        not_gene: ['transcendence'],
        no_queue(){ return global.r_queue.queue.some(item => item.id === 'tech-anthropology') ? true : false; },
        cost: {
            Knowledge(){ return 2500; }
        },
        effect: `<div>${loc('tech_fanaticism_effect')}</div><div class="has-text-special">${loc('tech_fanaticism_warning')}</div>`,
        action(){
            if (payCosts($(this)[0])){
                global.tech['fanaticism'] = 1;
                if (global.race.gods === global.race.species){
                    unlockAchieve(`second_evolution`);
                }
                fanaticism(global.race.gods);
                return true;
            }
            return false;
        }
    },
    alt_fanaticism: {
        id: 'tech-alt_fanaticism',
        title: loc('tech_fanaticism'),
        desc: loc('tech_fanaticism'),
        category: 'religion',
        era: 'civilized',
        wiki: global.genes['transcendence'] ? true : false,
        reqs: { theology: 2 },
        grant: ['fanaticism',1],
        gene: ['transcendence'],
        cost: {
            Knowledge(){ return 2500; }
        },
        effect: `<div>${loc('tech_fanaticism_effect')}</div>`,
        action(){
            if (payCosts($(this)[0])){
                if (global.tech['theology'] === 2){
                    global.tech['theology'] = 3;
                }
                if (global.race.gods === global.race.species){
                    unlockAchieve(`second_evolution`);
                }
                fanaticism(global.race.gods);
                return true;
            }
            return false;
        }
    },
    ancient_theology: {
        id: 'tech-ancient_theology',
        title: loc('tech_ancient_theology'),
        desc: loc('tech_ancient_theology'),
        category: 'religion',
        era: 'early_space',
        reqs: { theology: 3, mars: 2 },
        grant: ['theology',4],
        condition(){
            return global.genes['ancients'] ? true : false;
        },
        cost: {
            Knowledge(){ return 180000; }
        },
        effect(){
            let entityA = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
            let entityB = global.race.gods !== 'none' ? races[global.race.gods.toLowerCase()].entity : races[global.race.species].entity;
            return loc('tech_ancient_theology_effect',[entityA,entityB]);
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.ziggurat);
                return true;
            }
            return false;
        }
    },
    study: {
        id: 'tech-study',
        title: loc('tech_study'),
        desc: loc('tech_study_desc'),
        category: 'religion',
        era: 'early_space',
        reqs: { theology: 4 },
        grant: ['theology',5],
        wiki: global.genes['transcendence'] && global.genes.transcendence >= 2 ? false : true,
        condition(){ return !global.genes['transcendence'] || global.genes.transcendence < 2 ? true : false; },
        no_queue(){ return global.r_queue.queue.some(item => item.id === 'tech-deify') ? true : false; },
        cost: {
            Knowledge(){ return 195000; }
        },
        effect(){
            let entity = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
            return `<div>${loc('tech_study_effect',[entity])}</div><div class="has-text-special">${loc('tech_study_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['ancient_study'] = 1;
                return true;
            }
            return false;
        }
    },
    study_alt: {
        id: 'tech-study_alt',
        title: loc('tech_study'),
        desc: loc('tech_study_desc'),
        category: 'religion',
        era: 'early_space',
        reqs: { theology: 4 },
        grant: ['ancient_study',1],
        wiki: global.genes['transcendence'] && global.genes.transcendence >= 2 ? true : false,
        condition(){ return global.genes['transcendence'] && global.genes.transcendence >= 2 ? true : false; },
        cost: {
            Knowledge(){ return 195000; }
        },
        effect(){
            let entity = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
            return `<div>${loc('tech_study_effect',[entity])}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    encoding: {
        id: 'tech-encoding',
        title: loc('tech_encoding'),
        desc: loc('tech_encoding_desc'),
        category: 'religion',
        era: 'deep_space',
        reqs: { ancient_study: 1, mars: 5 },
        grant: ['ancient_study',2],
        cost: {
            Knowledge(){ return 268000; }
        },
        effect(){ return `<div>${loc('tech_encoding_effect')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    deify: {
        id: 'tech-deify',
        title: loc('tech_deify'),
        desc: loc('tech_deify_desc'),
        category: 'religion',
        era: 'early_space',
        reqs: { theology: 4 },
        grant: ['theology',5],
        wiki: global.genes['transcendence'] && global.genes.transcendence >= 2 ? false : true,
        condition(){ return !global.genes['transcendence'] || global.genes.transcendence < 2 ? true : false; },
        no_queue(){ return global.r_queue.queue.some(item => item.id === 'tech-study') ? true : false; },
        cost: {
            Knowledge(){ return 195000; }
        },
        effect(){
            let entity = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
            return `<div>${loc('tech_deify_effect',[entity])}</div><div class="has-text-special">${loc('tech_deify_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['ancient_deify'] = 1;
                fanaticism(global.race.old_gods);
                arpa('Genetics');
                return true;
            }
            return false;
        }
    },
    deify_alt: {
        id: 'tech-deify_alt',
        title: loc('tech_deify'),
        desc: loc('tech_deify_desc'),
        category: 'religion',
        era: 'early_space',
        reqs: { theology: 4 },
        grant: ['ancient_deify',1],
        wiki: global.genes['transcendence'] && global.genes.transcendence >= 2 ? true : false,
        condition(){ return global.genes['transcendence'] && global.genes.transcendence >= 2 ? true : false; },
        cost: {
            Knowledge(){ return 195000; }
        },
        effect(){
            let entity = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
            return `<div>${loc('tech_deify_effect',[entity])}</div><div class="has-text-special">${loc('tech_deify_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                fanaticism(global.race.old_gods);
                arpa('Genetics');
                return true;
            }
            return false;
        }
    },
    infusion: {
        id: 'tech-infusion',
        title: loc('tech_infusion'),
        desc: loc('tech_infusion_desc'),
        category: 'religion',
        era: 'deep_space',
        reqs: { ancient_deify: 1, mars: 5 },
        grant: ['ancient_deify',2],
        cost: {
            Knowledge(){ return 268000; }
        },
        effect(){ return `<div>${loc('tech_infusion_effect')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    indoctrination: {
        id: 'tech-indoctrination',
        title: loc('tech_indoctrination'),
        desc: loc('tech_indoctrination'),
        category: 'religion',
        era: 'civilized',
        reqs: { fanaticism: 1 },
        grant: ['fanaticism',2],
        cost: {
            Knowledge(){ return 5000; }
        },
        effect: loc('tech_indoctrination_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            if (global.race['terrifying']){
                global.tech['fanaticism'] = 3;
                drawTech();
            }
        }
    },
    missionary: {
        id: 'tech-missionary',
        title: loc('tech_missionary'),
        desc: loc('tech_missionary'),
        category: 'religion',
        era: 'discovery',
        reqs: { fanaticism: 2 },
        not_trait: ['terrifying'],
        grant: ['fanaticism',3],
        cost: {
            Knowledge(){ return 10000; }
        },
        effect: loc('tech_missionary_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    zealotry: {
        id: 'tech-zealotry',
        title: loc('tech_zealotry'),
        desc: loc('tech_zealotry'),
        category: 'religion',
        era: 'discovery',
        reqs: { fanaticism: 3 },
        grant: ['fanaticism',4],
        cost: {
            Knowledge(){ return 25000; }
        },
        effect: loc('tech_zealotry_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    anthropology: {
        id: 'tech-anthropology',
        title: loc('tech_anthropology'),
        desc: loc('tech_anthropology'),
        category: 'religion',
        era: 'civilized',
        wiki: global.genes['transcendence'] ? false : true,
        reqs: { theology: 2 },
        grant: ['theology',3],
        not_gene: ['transcendence'],
        no_queue(){ return global.r_queue.queue.some(item => item.id === 'tech-fanaticism') ? true : false; },
        cost: {
            Knowledge(){ return 2500; }
        },
        effect: `<div>${loc('tech_anthropology_effect')}</div><div class="has-text-special">${loc('tech_anthropology_warning')}</div>`,
        action(){
            if (payCosts($(this)[0])){
                global.tech['anthropology'] = 1;
                return true;
            }
            return false;
        }
    },
    alt_anthropology: {
        id: 'tech-alt_anthropology',
        title: loc('tech_anthropology'),
        desc: loc('tech_anthropology'),
        category: 'religion',
        era: 'civilized',
        wiki: global.genes['transcendence'] ? true : false,
        reqs: { theology: 2 },
        grant: ['anthropology',1],
        gene: ['transcendence'],
        cost: {
            Knowledge(){ return 2500; }
        },
        effect: `<div>${loc('tech_anthropology_effect')}</div>`,
        action(){
            if (payCosts($(this)[0])){
                if (global.tech['theology'] === 2){
                    global.tech['theology'] = 3;
                }
                return true;
            }
            return false;
        }
    },
    mythology: {
        id: 'tech-mythology',
        title: loc('tech_mythology'),
        desc: loc('tech_mythology'),
        category: 'religion',
        era: 'civilized',
        reqs: { anthropology: 1 },
        grant: ['anthropology',2],
        cost: {
            Knowledge(){ return 5000; }
        },
        effect: loc('tech_mythology_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    archaeology: {
        id: 'tech-archaeology',
        title: loc('tech_archaeology'),
        desc: loc('tech_archaeology'),
        category: 'science',
        era: 'discovery',
        reqs: { anthropology: 2 },
        grant: ['anthropology',3],
        cost: {
            Knowledge(){ return 10000; }
        },
        effect: loc('tech_archaeology_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    merchandising: {
        id: 'tech-merchandising',
        title: loc('tech_merchandising'),
        desc: loc('tech_merchandising'),
        category: 'banking',
        era: 'discovery',
        reqs: { anthropology: 3 },
        grant: ['anthropology',4],
        cost: {
            Knowledge(){ return 25000; }
        },
        effect(){ return global.race['truepath'] ? loc('tech_merchandising_effect_tp') : loc('tech_merchandising_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    astrophysics: {
        id: 'tech-astrophysics',
        title: loc('tech_astrophysics'),
        desc: loc('tech_astrophysics_desc'),
        category: 'space_exploration',
        era: 'early_space',
        reqs: { space: 2 },
        grant: ['space_explore',1],
        cost: {
            Knowledge(){ return 125000; }
        },
        effect: loc('tech_astrophysics_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_home.propellant_depot);
                return true;
            }
            return false;
        }
    },
    rover: {
        id: 'tech-rover',
        title: loc('tech_rover'),
        desc: loc('tech_rover'),
        category: 'space_exploration',
        era: 'early_space',
        reqs: { space_explore: 1 },
        grant: ['space_explore',2],
        cost: {
            Knowledge(){ return 135000; },
            Alloy(){ return 22000 },
            Polymer(){ return 18000 },
            Uranium(){ return 750 }
        },
        effect: loc('tech_rover_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.moon = true;
                initStruct(actions.space.spc_moon.moon_base);
                return true;
            }
            return false;
        }
    },
    probes: {
        id: 'tech-probes',
        title: loc('tech_probes'),
        desc: loc('tech_probes'),
        category: 'space_exploration',
        era: 'early_space',
        reqs: { space_explore: 2 },
        grant: ['space_explore',3],
        cost: {
            Knowledge(){ return 168000; },
            Steel(){ return 100000 },
            Iridium(){ return 5000 },
            Uranium(){ return 2250 },
            Helium_3(){ return 3500 }
        },
        effect: loc('tech_probes_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.red = true;
                global.settings.space.hell = true;
                initStruct(actions.space.spc_red.spaceport);
                return true;
            }
            return false;
        }
    },
    starcharts: {
        id: 'tech-starcharts',
        title: loc('tech_starcharts'),
        desc: loc('tech_starcharts'),
        category: 'space_exploration',
        era: 'early_space',
        reqs: { space_explore: 3, science: 9 },
        grant: ['space_explore',4],
        cost: {
            Knowledge(){ return 185000; }
        },
        effect: loc('tech_starcharts_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.gas = true;
                global.settings.space.sun = true;
                if (global.race['truepath']){
                    global.settings.showOuter = true;
                }
                initStruct(actions.space.spc_sun.swarm_control);
                return true;
            }
            return false;
        }
    },
    colonization: {
        id: 'tech-colonization',
        title: loc('tech_colonization'),
        desc(){ return loc('tech_colonization_desc',[planetName().red]); },
        category: 'agriculture',
        era: 'early_space',
        reqs: { space: 4, mars: 1 },
        grant: ['mars',2],
        cost: {
            Knowledge(){ return 172000; }
        },
        effect(){ return loc(global.race['artifical'] ? 'tech_colonization_artifical_effect' : 'tech_colonization_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.biodome);
                return true;
            }
            return false;
        }
    },
    red_tower: {
        id: 'tech-red_tower',
        title(){ return loc('tech_red_tower',[planetName().red]); },
        desc(){ return loc('tech_red_tower',[planetName().red]); },
        category: 'space_exploration',
        era: 'early_space',
        reqs: { mars: 2 },
        grant: ['mars',3],
        cost: {
            Knowledge(){ return 195000; }
        },
        effect(){ return loc('tech_red_tower_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.red_tower);
                return true;
            }
            return false;
        }
    },
    space_manufacturing: {
        id: 'tech-space_manufacturing',
        title: loc('tech_space_manufacturing'),
        desc: loc('tech_space_manufacturing_desc'),
        category: 'crafting',
        era: 'early_space',
        reqs: { mars: 3 },
        grant: ['mars',4],
        cost: {
            Knowledge(){ return 220000; }
        },
        effect(){ return loc('tech_space_manufacturing_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.red_factory);
                return true;
            }
            return false;
        }
    },
    exotic_lab: {
        id: 'tech-exotic_lab',
        title: loc('tech_exotic_lab'),
        desc: loc('tech_exotic_lab_desc'),
        category: 'science',
        era: 'deep_space',
        reqs: { mars: 4, asteroid: 5 },
        grant: ['mars',5],
        cost: {
            Knowledge(){ return 250000; }
        },
        effect: loc('tech_exotic_lab_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.exotic_lab);
                return true;
            }
            return false;
        }
    },
    hydroponics: {
        id: 'tech-hydroponics',
        title: loc('tech_hydroponics'),
        desc(){ return loc('tech_hydroponics'); },
        category: 'agriculture',
        era: 'intergalactic',
        reqs: { mars: 5, gateway: 3 },
        grant: ['mars',6],
        cost: {
            Knowledge(){ return 3000000; },
            Bolognium(){ return 500000; }
        },
        effect(){ return loc('tech_hydroponics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dyson_sphere: {
        id: 'tech-dyson_sphere',
        title: loc('tech_dyson_sphere'),
        desc: loc('tech_dyson_sphere'),
        category: 'power_generation',
        era: 'early_space',
        reqs: { solar: 1 },
        grant: ['solar',2],
        cost: {
            Knowledge(){ return 195000; }
        },
        effect: loc('tech_dyson_sphere_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dyson_swarm: {
        id: 'tech-dyson_swarm',
        title: loc('tech_dyson_swarm'),
        desc: loc('tech_dyson_swarm'),
        category: 'power_generation',
        era: 'early_space',
        reqs: { solar: 2 },
        grant: ['solar',3],
        cost: {
            Knowledge(){ return 210000; }
        },
        effect: loc('tech_dyson_swarm_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_sun.swarm_satellite);
                return true;
            }
            return false;
        }
    },
    swarm_plant: {
        id: 'tech-swarm_plant',
        title: loc('tech_swarm_plant'),
        desc: loc('tech_swarm_plant'),
        category: 'power_generation',
        era: 'deep_space',
        reqs: { solar: 3, hell: 1, gas_moon: 1 },
        grant: ['solar',4],
        cost: {
            Knowledge(){ return 250000; }
        },
        effect(){ return loc('tech_swarm_plant_effect',[races[global.race.species].home,planetName().hell]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_hell.swarm_plant);
                return true;
            }
            return false;
        }
    },
    space_sourced: {
        id: 'tech-space_sourced',
        title: loc('tech_space_sourced'),
        desc: loc('tech_space_sourced_desc'),
        category: 'power_generation',
        era: 'deep_space',
        reqs: { solar: 4, asteroid: 3 },
        grant: ['solar',5],
        cost: {
            Knowledge(){ return 300000; }
        },
        effect: loc('tech_space_sourced_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    swarm_plant_ai: {
        id: 'tech-swarm_plant_ai',
        title: loc('tech_swarm_plant_ai'),
        desc: loc('tech_swarm_plant_ai'),
        category: 'power_generation',
        era: 'deep_space',
        reqs: { solar: 4, high_tech: 10 },
        grant: ['swarm',1],
        cost: {
            Knowledge(){ return 335000; }
        },
        effect: loc('tech_swarm_plant_ai_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    swarm_control_ai: {
        id: 'tech-swarm_control_ai',
        title: loc('tech_swarm_control_ai'),
        desc: loc('tech_swarm_control_ai'),
        category: 'power_generation',
        era: 'deep_space',
        reqs: { swarm: 1 },
        grant: ['swarm',2],
        cost: {
            Knowledge(){ return 360000; }
        },
        effect: loc('tech_swarm_control_ai_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    quantum_swarm: {
        id: 'tech-quantum_swarm',
        title: loc('tech_quantum_swarm'),
        desc: loc('tech_quantum_swarm'),
        category: 'power_generation',
        era: 'deep_space',
        reqs: { swarm: 2, high_tech: 11 },
        grant: ['swarm',3],
        cost: {
            Knowledge(){ return 450000; }
        },
        effect: loc('tech_quantum_swarm_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    perovskite_cell: {
        id: 'tech-perovskite_cell',
        title: loc('tech_perovskite_cell'),
        desc: loc('tech_perovskite_cell'),
        category: 'power_generation',
        era: 'interstellar',
        reqs: { swarm: 3 },
        grant: ['swarm',4],
        path: ['standard','truepath'],
        cost: {
            Knowledge(){ return 525000; },
            Titanium(){ return 100000; }
        },
        effect: loc('tech_perovskite_cell_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    swarm_convection: {
        id: 'tech-swarm_convection',
        title: loc('tech_swarm_convection'),
        desc: loc('tech_swarm_convection'),
        category: 'power_generation',
        era: 'interstellar',
        reqs: { swarm: 4, stanene: 1 },
        grant: ['swarm',5],
        path: ['standard','truepath'],
        cost: {
            Knowledge(){ return 725000; },
            Stanene(){ return 100000; }
        },
        effect: loc('tech_swarm_convection_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    orichalcum_panels: {
        id: 'tech-orichalcum_panels',
        title: loc('tech_orichalcum_panels'),
        desc: loc('tech_orichalcum_panels'),
        category: 'power_generation',
        era: 'intergalactic',
        reqs: { high_tech: 17, swarm: 5 },
        grant: ['swarm',6],
        cost: {
            Knowledge(){ return 14000000; },
            Orichalcum(){ return 125000; }
        },
        effect(){ return loc('tech_orichalcum_panels_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dyson_net: {
        id: 'tech-dyson_net',
        title: loc('tech_dyson_net'),
        desc: loc('tech_dyson_net'),
        category: 'power_generation',
        era: 'interstellar',
        reqs: { solar: 3, proxima: 2, stanene: 1 },
        grant: ['proxima',3],
        cost: {
            Knowledge(){ return 800000; }
        },
        effect: loc('tech_dyson_net_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_proxima.dyson);
                return true;
            }
            return false;
        }
    },
    dyson_sphere2: {
        id: 'tech-dyson_sphere2',
        title: loc('tech_dyson_sphere'),
        desc: loc('tech_dyson_sphere'),
        category: 'power_generation',
        era: 'intergalactic',
        reqs: { proxima: 3, piracy: 1 },
        grant: ['dyson',1],
        cost: {
            Knowledge(){ return 5000000; }
        },
        effect: loc('tech_dyson_sphere2_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_proxima.dyson_sphere);
                return true;
            }
            return false;
        }
    },
    orichalcum_sphere: {
        id: 'tech-orichalcum_sphere',
        title: loc('tech_orichalcum_sphere'),
        desc: loc('tech_orichalcum_sphere'),
        category: 'power_generation',
        era: 'intergalactic',
        reqs: { dyson: 1, science: 19 },
        condition(){
            return global.interstellar['dyson_sphere'] && global.interstellar.dyson_sphere.count >= 100 ? true : false;
        },
        grant: ['dyson',2],
        cost: {
            Knowledge(){ return 17500000; },
            Orichalcum(){ return 250000; }
        },
        effect: loc('tech_orichalcum_sphere_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_proxima.orichalcum_sphere);
                return true;
            }
            return false;
        }
    },
    elysanite_sphere: {
        id: 'tech-elysanite_sphere',
        title: loc('tech_elysanite_sphere'),
        desc: loc('tech_elysanite_sphere'),
        category: 'power_generation',
        era: 'existential',
        reqs: { high_tech: 19, dyson: 2 },
        grant: ['dyson',3],
        cost: {
            Knowledge(){ return 122500000; },
            Omniscience(){ return 36500; },
        },
        effect(){ return loc('tech_elysanite_sphere_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_proxima.elysanite_sphere);
                return true;
            }
            return false;
        }
    },
    gps: {
        id: 'tech-gps',
        title: loc('tech_gps'),
        desc: loc('tech_gps'),
        category: 'market',
        era: 'early_space',
        reqs: { space_explore: 1 },
        not_trait: ['terrifying'],
        grant: ['satellite',1],
        cost: {
            Knowledge(){ return 150000; }
        },
        effect: loc('tech_gps_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_home.gps);
                return true;
            }
            return false;
        }
    },
    nav_beacon: {
        id: 'tech-nav_beacon',
        title: loc('tech_nav_beacon'),
        desc: loc('tech_nav_beacon'),
        category: 'space_exploration',
        era: 'early_space',
        reqs: { luna: 1 },
        grant: ['luna',2],
        cost: {
            Knowledge(){ return 180000; }
        },
        effect: loc('tech_nav_beacon_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_home.nav_beacon);
                return true;
            }
            return false;
        }
    },
    subspace_signal: {
        id: 'tech-subspace_signal',
        title: loc('tech_subspace_signal'),
        desc: loc('tech_subspace_signal'),
        category: 'space_exploration',
        era: 'interstellar',
        reqs: { science: 13, luna: 2, stanene: 1 },
        grant: ['luna',3],
        cost: {
            Knowledge(){ return 700000; },
            Stanene(){ return 125000; }
        },
        effect(){ return loc('tech_subspace_signal_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    atmospheric_mining: {
        id: 'tech-atmospheric_mining',
        title: loc('tech_atmospheric_mining'),
        desc: loc('tech_atmospheric_mining'),
        category: 'power_generation',
        era: 'early_space',
        reqs: { space: 5 },
        grant: ['gas_giant',1],
        cost: {
            Knowledge(){ return 190000; }
        },
        effect: loc('tech_atmospheric_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_gas.gas_mining);
                initStruct(actions.space.spc_gas.gas_storage);
                return true;
            }
            return false;
        }
    },
    helium_attractor: {
        id: 'tech-helium_attractor',
        title: loc('tech_helium_attractor'),
        desc: loc('tech_helium_attractor'),
        category: 'power_generation',
        era: 'deep_space',
        reqs: { gas_giant: 1, elerium: 1 },
        grant: ['helium',1],
        cost: {
            Knowledge(){ return 290000; },
            Elerium(){ return 250; }
        },
        effect(){ return loc('tech_helium_attractor_effect',[planetName().gas]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ram_scoops: {
        id: 'tech-ram_scoops',
        title: loc('tech_ram_scoops'),
        desc: loc('tech_ram_scoops'),
        category: 'power_generation',
        era: 'interstellar',
        reqs: { nebula: 2 },
        grant: ['ram_scoop',1],
        cost: {
            Knowledge(){ return 580000; }
        },
        effect(){ return loc('tech_ram_scoops_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elerium_prospecting: {
        id: 'tech-elerium_prospecting',
        title: loc('tech_elerium_prospecting'),
        desc: loc('tech_elerium_prospecting'),
        category: 'space_mining',
        era: 'interstellar',
        reqs: { nebula: 2 },
        grant: ['nebula',3],
        cost: {
            Knowledge(){ return 610000; }
        },
        effect(){ return loc('tech_elerium_prospecting_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_nebula.elerium_prospector);
                return true;
            }
            return false;
        }
    },
    zero_g_mining: {
        id: 'tech-zero_g_mining',
        title: loc('tech_zero_g_mining'),
        desc: loc('tech_zero_g_mining'),
        category: 'space_mining',
        era: 'early_space',
        reqs: { asteroid: 1, high_tech: 8 },
        grant: ['asteroid',2],
        cost: {
            Knowledge(){ return 210000; }
        },
        effect: loc('tech_zero_g_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_belt.space_station);
                initStruct(actions.space.spc_belt.iridium_ship);
                initStruct(actions.space.spc_belt.iron_ship);
                return true;
            }
            return false;
        }
    },
    elerium_mining: {
        id: 'tech-elerium_mining',
        title: loc('tech_elerium_mining'),
        desc: loc('tech_elerium_mining'),
        category: 'space_mining',
        era: 'deep_space',
        reqs: { asteroid: 4 },
        grant: ['asteroid',5],
        cost: {
            Knowledge(){ return 235000; },
            Elerium(){ return global.race['truepath'] ? 0.5 : 1; }
        },
        effect: loc('tech_elerium_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_belt.elerium_ship);
                if (global.race['cataclysm']){
                    unlockAchieve('iron_will',false,2);
                }
                return true;
            }
            return false;
        }
    },
    laser_mining: {
        id: 'tech-laser_mining',
        title: loc('tech_laser_mining'),
        desc: loc('tech_laser_mining'),
        category: 'space_mining',
        era: 'deep_space',
        reqs: { asteroid: 5, elerium: 1, high_tech: 9 },
        grant: ['asteroid',6],
        cost: {
            Knowledge(){ return 350000; },
        },
        effect: loc('tech_laser_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    plasma_mining: {
        id: 'tech-plasma_mining',
        title: loc('tech_plasma_mining'),
        desc: loc('tech_plasma_mining'),
        category: 'space_mining',
        era: 'interstellar',
        reqs: { asteroid: 6, high_tech: 13 },
        grant: ['asteroid',7],
        path: ['standard','truepath'],
        cost: {
            Knowledge(){ return 825000; },
        },
        effect: loc('tech_plasma_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elerium_tech: {
        id: 'tech-elerium_tech',
        title: loc('tech_elerium_tech'),
        desc: loc('tech_elerium_tech'),
        category: 'space_mining',
        era: 'deep_space',
        reqs: { asteroid: 5 },
        grant: ['elerium',1],
        cost: {
            Knowledge(){ return 275000; },
            Elerium(){ return 20; }
        },
        effect: loc('tech_elerium_tech_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elerium_reactor: {
        id: 'tech-elerium_reactor',
        title: loc('tech_elerium_reactor'),
        desc: loc('tech_elerium_reactor'),
        category: 'power_generation',
        era: 'deep_space',
        reqs: { dwarf: 1, elerium: 1 },
        grant: ['elerium',2],
        cost: {
            Knowledge(){ return 325000; },
            Elerium(){ return 180; }
        },
        effect: loc('tech_elerium_reactor_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_dwarf.e_reactor);
                return true;
            }
            return false;
        }
    },
    neutronium_housing: {
        id: 'tech-neutronium_housing',
        title: loc('tech_neutronium_housing'),
        desc: loc('tech_neutronium_housing'),
        category: 'housing',
        era: 'deep_space',
        reqs: { gas_moon: 1 },
        grant: ['space_housing',1],
        cost: {
            Knowledge(){ return 275000; },
            Neutronium(){ return 350; }
        },
        effect(){ return loc('tech_neutronium_housing_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    unification: {
        id: 'tech-unification',
        title: loc('tech_unification'),
        desc(){ return loc('tech_unification_desc',[races[global.race.species].home]); },
        category: 'special',
        era: 'early_space',
        path: ['standard'],
        reqs: { mars: 2 },
        grant: ['unify',1],
        cost: {
            Knowledge(){ return 200000; }
        },
        effect: loc('tech_unification_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    unification2: {
        id: 'tech-unification2',
        title: loc('tech_unification'),
        desc(){ return loc('tech_unification_desc',[races[global.race.species].home]); },
        category: 'special',
        era: 'early_space',
        path: ['standard'],
        reqs: { unify: 1 },
        grant: ['unify',2],
        cost: {
            Bool(){
                let owned = 0;
                for (let i=0; i<3; i++){
                    if (global.civic.foreign[`gov${i}`].occ || global.civic.foreign[`gov${i}`].buy || global.civic.foreign[`gov${i}`].anx){
                        owned++;
                    }
                }
                return owned === 3 ? true : false;
            }
        },
        effect(){
            let banana_warn = global.race['banana'] ? `<div class="has-text-danger">${loc('tech_unification_banana')}</div>` : '';
            return `<div>${loc('tech_unification_effect2')}</div><div class="has-text-special">${loc('tech_unification_warning')}</div>${banana_warn}`;
        },
        action(){
            if (payCosts($(this)[0])){
                if (global.race['banana']){
                    if (!global['sim']){
                        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
                    }
                    delete global.race['banana'];
                }
                if (global.civic.foreign.gov0.occ && global.civic.foreign.gov1.occ && global.civic.foreign.gov2.occ){
                    unlockAchieve(`world_domination`);
                }
                if (global.civic.foreign.gov0.anx && global.civic.foreign.gov1.anx && global.civic.foreign.gov2.anx){
                    unlockAchieve(`illuminati`);
                }
                if (global.civic.foreign.gov0.buy && global.civic.foreign.gov1.buy && global.civic.foreign.gov2.buy){
                    unlockAchieve(`syndicate`);
                }
                if (global.stats.attacks === 0){
                    unlockAchieve(`pacifist`);
                }
                uniteEffect();
                return true;
            }
            return false;
        }
    },
    unite: {
        id: 'tech-unite',
        title: loc('tech_unite'),
        desc(){ return loc('tech_unite_desc'); },
        category: 'special',
        era: 'globalized',
        path: ['truepath'],
        reqs: { unify: 1 },
        grant: ['unify',2],
        cost: {
            Bool(){
                let owned = 0;
                for (let i=0; i<3; i++){
                    if (global.civic.foreign[`gov${i}`].occ || global.civic.foreign[`gov${i}`].buy || global.civic.foreign[`gov${i}`].anx){
                        owned++;
                    }
                }
                return owned === 3 ? true : false;
            }
        },
        effect(){ return `<div>${loc('tech_unite_effect')}</div><div class="has-text-warning">${loc('tech_unification_effect2')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                if (global.race['banana']){
                    if (!global['sim']){
                        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
                    }
                    delete global.race['banana'];
                }
                if (global.civic.foreign.gov0.occ && global.civic.foreign.gov1.occ && global.civic.foreign.gov2.occ){
                    unlockAchieve(`world_domination`);
                }
                if (global.civic.foreign.gov0.anx && global.civic.foreign.gov1.anx && global.civic.foreign.gov2.anx){
                    unlockAchieve(`illuminati`);
                }
                if (global.civic.foreign.gov0.buy && global.civic.foreign.gov1.buy && global.civic.foreign.gov2.buy){
                    unlockAchieve(`syndicate`);
                }
                if (global.stats.attacks === 0){
                    unlockAchieve(`pacifist`);
                }
                uniteEffect();
                if (global.race['truepath'] && !global.tech['rival']){
                    global.tech['rival'] = 1;
                    messageQueue(loc(`civics_rival_unlocked`,[govTitle(3)]),'info',false,['progress','combat']);
                }
                return true;
            }
            return false;
        }
    },
    genesis: {
        id: 'tech-genesis',
        title: loc('tech_genesis'),
        desc: loc('tech_genesis'),
        category: 'special',
        era: 'deep_space',
        reqs: { high_tech: 10, genesis: 1 },
        grant: ['genesis',2],
        cost: {
            Knowledge(){ return 350000; }
        },
        effect: loc('tech_genesis_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    star_dock: {
        id: 'tech-star_dock',
        title: loc('tech_star_dock'),
        desc: loc('tech_star_dock'),
        category: 'special',
        era: 'deep_space',
        reqs: { genesis: 2, space: 5, high_tech: 10 },
        grant: ['genesis',3],
        not_trait: ['lone_survivor'],
        cost: {
            Knowledge(){ return 380000; },
        },
        effect: loc('tech_star_dock_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_gas.star_dock);
                return true;
            }
            return false;
        }
    },
    interstellar: {
        id: 'tech-interstellar',
        title: loc('tech_interstellar'),
        desc: loc('tech_interstellar'),
        category: 'space_exploration',
        era: 'deep_space',
        reqs: { genesis: 3 },
        grant: ['genesis',4],
        cost: {
            Knowledge(){ return 400000; },
        },
        effect: loc('tech_interstellar_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.starDock.probes);
                return true;
            }
            return false;
        }
    },
    genesis_ship: {
        id: 'tech-genesis_ship',
        title(){ return global.race['cataclysm'] ? loc('tech_generational_ship') : loc('tech_genesis_ship'); },
        desc(){ return global.race['cataclysm'] ? loc('tech_generational_ship') : loc('tech_genesis_ship'); },
        category: 'special',
        era: 'deep_space',
        reqs: { genesis: 4 },
        grant: ['genesis',5],
        cost: {
            Knowledge(){ return 425000; },
        },
        effect(){ return global.race['cataclysm'] ? loc('tech_generational_effect') : loc('tech_genesis_ship_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.starDock.seeder);
                if (global.race['cataclysm']){
                    unlockAchieve('iron_will',false,4);
                }
                return true;
            }
            return false;
        }
    },
    geck: {
        id: 'tech-geck',
        title(){ return loc('tech_geck'); },
        desc(){ return loc('tech_geck_desc'); },
        category: 'special',
        era: 'deep_space',
        reqs: { genesis: 5 },
        grant: ['geck',1],
        condition(){
            return global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 5 ? true : false;
        },
        cost: {
            Knowledge(){ return 500000; },
        },
        effect(){ return loc('tech_geck_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.starDock.geck);
                return true;
            }
            return false;
        }
    },
    genetic_decay: {
        id: 'tech-genetic_decay',
        title: loc('tech_genetic_decay'),
        desc: loc('tech_genetic_decay'),
        category: 'genes',
        era: 'early_space',
        reqs: { decay: 1 },
        grant: ['decay',2],
        cost: {
            Knowledge(){ return 200000; }
        },
        effect: loc('tech_genetic_decay_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    stabilize_decay: {
        id: 'tech-stabilize_decay',
        title: loc('tech_stabilize_decay'),
        desc: loc('tech_stabilize_decay'),
        category: 'genes',
        era: 'dimensional',
        reqs: { decay: 2, high_tech: 18 },
        grant: ['decay',3],
        cost: {
            Knowledge(){ return 50000000; },
            Blood_Stone(){ return 1; }
        },
        effect: loc('tech_stabilize_decay_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tachyon: {
        id: 'tech-tachyon',
        title: loc('tech_tachyon'),
        desc: loc('tech_tachyon'),
        category: 'progress',
        era: 'interstellar',
        reqs: { wsc: 1 },
        grant: ['ftl',1],
        cost: {
            Knowledge(){ return 435000; }
        },
        effect: loc('tech_tachyon_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    warp_drive: {
        id: 'tech-warp_drive',
        title: loc('tech_warp_drive'),
        desc: loc('tech_warp_drive'),
        category: 'space_exploration',
        era: 'interstellar',
        reqs: { ftl: 1 },
        grant: ['ftl',2],
        cost: {
            Knowledge(){ return 450000; }
        },
        effect: loc('tech_warp_drive_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showDeep = true;
                global.settings.space.alpha = true;
                initStruct(actions.interstellar.int_alpha.starport);
                return true;
            }
            return false;
        }
    },
    habitat: {
        id: 'tech-habitat',
        title: loc('tech_habitat'),
        desc: loc('tech_habitat_desc'),
        category: 'housing',
        era: 'interstellar',
        reqs: { alpha: 2, droids: 1 },
        grant: ['alpha',3],
        cost: {
            Knowledge(){ return 480000; }
        },
        effect: loc('tech_habitat_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.habitat);
                return true;
            }
            return false;
        }
    },
    graphene: {
        id: 'tech-graphene',
        title: loc('tech_graphene'),
        desc: loc('tech_graphene'),
        category: 'crafting',
        era: 'interstellar',
        reqs: { alpha: 3, infernite: 1 },
        grant: ['graphene',1],
        cost: {
            Knowledge(){ return 540000; },
            Adamantite(){ return 10000; }
        },
        effect: loc('tech_graphene_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.g_factory);
                return true;
            }
            return false;
        }
    },
    aerogel: {
        id: 'tech-aerogel',
        title: loc('tech_aerogel'),
        desc: loc('tech_aerogel'),
        category: 'crafting',
        era: 'interstellar',
        reqs: { graphene: 1, science: 13 },
        grant: ['aerogel',1],
        cost: {
            Knowledge(){ return 750000; },
            Graphene(){ return 50000; },
            Infernite(){ return 500; }
        },
        effect: loc('tech_aerogel_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Aerogel.display = true;
                loadFoundry();
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    mega_manufacturing: {
        id: 'tech-mega_manufacturing',
        title: loc('tech_mega_manufacturing'),
        desc: loc('tech_mega_manufacturing'),
        category: 'crafting',
        era: 'intergalactic',
        reqs: { high_tech: 16, alpha: 3 },
        grant: ['alpha',4],
        cost: {
            Knowledge(){ return 5650000; }
        },
        effect(){ return loc('tech_mega_manufacturing_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.int_factory);
                return true;
            }
            return false;
        }
    },
    luxury_condo: {
        id: 'tech-luxury_condo',
        title: loc('tech_luxury_condo'),
        desc: loc('tech_luxury_condo'),
        category: 'housing',
        era: 'intergalactic',
        reqs: { high_tech: 17, alpha: 4 },
        grant: ['alpha',5],
        cost: {
            Knowledge(){ return 15000000; }
        },
        effect(){ return loc('tech_luxury_condo_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.luxury_condo);
                return true;
            }
            return false;
        }
    },
    stellar_engine: {
        id: 'tech-stellar_engine',
        title: loc('tech_stellar_engine'),
        desc: loc('tech_stellar_engine'),
        category: 'stellar_engine',
        era: 'interstellar',
        reqs: { blackhole: 2 },
        grant: ['blackhole',3],
        cost: {
            Knowledge(){ return 1000000; }
        },
        effect: loc('tech_stellar_engine_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_blackhole.stellar_engine);
                return true;
            }
            return false;
        }
    },
    mass_ejector: {
        id: 'tech-mass_ejector',
        title: loc('tech_mass_ejector'),
        desc: loc('tech_mass_ejector'),
        category: 'stellar_engine',
        era: 'interstellar',
        reqs: { blackhole: 4 },
        grant: ['blackhole',5],
        cost: {
            Knowledge(){ return 1100000; }
        },
        effect: loc('tech_mass_ejector_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_blackhole.mass_ejector);
                return true;
            }
            return false;
        }
    },
    asteroid_redirect: {
        id: 'tech-asteroid_redirect',
        title: loc('tech_asteroid_redirect'),
        desc: loc('tech_asteroid_redirect'),
        category: 'stellar_engine',
        era: 'intergalactic',
        reqs: { blackhole: 5, gateway: 3 },
        grant: ['blackhole',6],
        cost: {
            Knowledge(){ return 3500000; }
        },
        effect: loc('tech_asteroid_redirect_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    exotic_infusion: {
        id: 'tech-exotic_infusion',
        title: loc('tech_exotic_infusion'),
        desc: loc('tech_exotic_infusion'),
        category: 'stellar_engine',
        era: 'interstellar',
        reqs: { whitehole: 1 },
        grant: ['whitehole',2],
        cost: {
            Knowledge(){ return 1500000; },
            Soul_Gem(){ return 10; }
        },
        effect(){ return `<div>${loc('tech_exotic_infusion_effect',[global.resource.Soul_Gem.name])}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>`; },
        action(){
            if (checkAffordable($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_exotic_infusion_flair'); }
    },
    infusion_check: {
        id: 'tech-infusion_check',
        title: loc('tech_infusion_check'),
        desc: loc('tech_infusion_check'),
        category: 'stellar_engine',
        era: 'interstellar',
        reqs: { whitehole: 2 },
        grant: ['whitehole',3],
        cost: {
            Knowledge(){ return 1500000; },
            Soul_Gem(){ return 10; }
        },
        effect(){ return `<div>${loc('tech_infusion_check_effect')}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>`; },
        action(){
            if (checkAffordable($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_infusion_check_flair'); }
    },
    infusion_confirm: {
        id: 'tech-infusion_confirm',
        title: loc('tech_infusion_confirm'),
        desc: loc('tech_infusion_confirm'),
        category: 'stellar_engine',
        era: 'interstellar',
        reqs: { whitehole: 3 },
        grant: ['whitehole',4],
        cost: {
            Knowledge(){ return 1500000; },
            Soul_Gem(){ return 10; }
        },
        effect(){
            let gains = calcPrestige('bigbang');
            let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
            let prestige = `<div class="has-text-caution">${loc('wiki_tech_infusion_confirm_gains',[gains.plasmid,gains.phage,gains.dark,plasmidType])}</div>`;
            return `<div>${loc('tech_infusion_confirm_effect')}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>${prestige}`;
        },
        action(){
            if (payCosts($(this)[0])){
                if (global.tech['whitehole'] >= 4){
                    return;
                }
                global.tech['whitehole'] = 4;
                let bang = $('<div class="bigbang"></div>');
                $('body').append(bang);
                setTimeout(function(){
                    bang.addClass('burn');
                }, 125);
                setTimeout(function(){
                    bang.addClass('b');
                }, 150);
                setTimeout(function(){
                    bang.addClass('c');
                }, 2000);
                setTimeout(function(){
                    big_bang();
                }, 4000);
                return false;
            }
            return false;
        },
        flair(){ return loc('tech_infusion_confirm_flair'); }
    },
    stabilize_blackhole: {
        id: 'tech-stabilize_blackhole',
        title: loc('tech_stabilize_blackhole'),
        desc(){ return `<div>${loc('tech_stabilize_blackhole')}</div><div class="has-text-danger">${loc('tech_stabilize_blackhole2')}</div>`; },
        category: 'stellar_engine',
        era: 'interstellar',
        reqs: { whitehole: 1 },
        grant: ['stablized',1],
        cost: {
            Knowledge(){ return 1500000; },
            Neutronium(){ return 20000; }
        },
        effect: loc('tech_stabilize_blackhole_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.interstellar.stellar_engine.mass += (atomic_mass.Neutronium * 20000 / 10000000000);
                global.interstellar.stellar_engine.mass += global.interstellar.stellar_engine.exotic * 40;
                global.interstellar.stellar_engine.exotic = 0;
                delete global.tech['whitehole'];
                if (global.race['banana'] && global.interstellar.stellar_engine.mass >= 12){
                    let affix = universeAffix();
                    global.stats.banana.b3[affix] = true;
                    if (affix !== 'm' && affix !== 'l'){
                        global.stats.banana.b3.l = true;
                    }
                }
                return true;
            }
            return false;
        }
    },
    veil: {
        id: 'tech-veil',
        title: loc('tech_veil'),
        desc: loc('tech_veil'),
        category: 'magic',
        era: 'interstellar',
        reqs: { blackhole: 2 },
        condition(){
            return global.race.universe === 'magic' ? true : false;
        },
        grant: ['veil',1],
        cost: {
            Knowledge(){ return 1250000; }
        },
        effect: loc('tech_veil_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mana_syphon: {
        id: 'tech-mana_syphon',
        title: loc('tech_mana_syphon'),
        desc: loc('tech_mana_syphon'),
        category: 'magic',
        era: 'interstellar',
        reqs: { veil: 1 },
        condition(){
            return global.race.universe === 'magic' ? true : false;
        },
        grant: ['veil',2],
        cost: {
            Knowledge(){ return 1500000; }
        },
        effect: loc('tech_mana_syphon_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    gravitational_waves: {
        id: 'tech-gravitational_waves',
        title: loc('tech_gravitational_waves'),
        desc: loc('tech_gravitational_waves'),
        category: 'power_generation',
        era: 'interstellar',
        reqs: { blackhole: 4 },
        grant: ['gravity',1],
        cost: {
            Knowledge(){ return 1250000; }
        },
        effect: loc('tech_gravitational_waves_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    gravity_convection: {
        id: 'tech-gravity_convection',
        title: loc('tech_gravity_convection'),
        desc: loc('tech_gravity_convection'),
        category: 'power_generation',
        era: 'interstellar',
        reqs: { gravity: 1 },
        grant: ['gravity',2],
        cost: {
            Knowledge(){ return 1350000; }
        },
        effect: loc('tech_gravity_convection_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    wormholes: {
        id: 'tech-wormholes',
        title: loc('tech_wormholes'),
        desc: loc('tech_wormholes'),
        category: 'space_exploration',
        era: 'intergalactic',
        reqs: { gravity: 1, science: 15 },
        grant: ['stargate',1],
        cost: {
            Knowledge(){ return 2250000; }
        },
        effect: loc('tech_wormholes_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    portal: {
        id: 'tech-portal',
        title: loc('tech_portal'),
        desc: loc('tech_portal_desc'),
        category: 'hell_dimension',
        era: 'interstellar',
        reqs: { wsc: 1 },
        grant: ['portal',1],
        cost: {
            Knowledge(){ return 500000; }
        },
        effect: loc('tech_portal_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fortifications: {
        id: 'tech-fortifications',
        title: loc('tech_fort'),
        desc: loc('tech_fort_desc'),
        category: 'hell_dimension',
        era: 'interstellar',
        reqs: { portal: 1 },
        grant: ['portal',2],
        cost: {
            Knowledge(){ return 550000; },
            Stone(){ return 1000000; }
        },
        effect: loc('tech_fort_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showPortal = true;
                global.settings.portal.fortress = true;
                if (!global.settings.msgFilters.hell.unlocked){
                    global.settings.msgFilters.hell.unlocked = true;
                    global.settings.msgFilters.hell.vis = true;
                }
                global.portal['fortress'] = {
                    threat: 10000,
                    garrison: 0,
                    walls: 100,
                    repair: 0,
                    patrols: 0,
                    patrol_size: 10,
                    siege: 999,
                    notify: 'Yes',
                    s_ntfy: 'Yes',
                    nocrew: false,
                };
                initStruct(actions.portal.prtl_fortress.turret);
                initStruct(actions.portal.prtl_fortress.carport);
                if (races[global.race.species].type === 'demonic'){
                    unlockAchieve('blood_war');
                }
                else {
                    unlockAchieve('pandemonium');
                }
                global.portal.observe = {
                    settings: {
                        expanded: false,
                        average: false,
                        hyperSlow: false,
                        display: 'game_days',
                        dropKills: true,
                        dropGems: true
                    },
                    stats: {
                        total: {
                            start: { year: global.city.calendar.year, day: global.city.calendar.day },
                            days: 0,
                            wounded: 0, died: 0, revived: 0, surveyors: 0, sieges: 0,
                            kills: {
                                drones: 0,
                                patrols: 0,
                                sieges: 0,
                                guns: 0,
                                soul_forge: 0,
                                turrets: 0
                            },
                            gems: {
                                patrols: 0,
                                guns: 0,
                                soul_forge: 0,
                                crafted: 0,
                                turrets: 0,
                                surveyors: 0
                            },
                        },
                        period: {
                            start: { year: global.city.calendar.year, day: global.city.calendar.day },
                            days: 0,
                            wounded: 0, died: 0, revived: 0, surveyors: 0, sieges: 0,
                            kills: {
                                drones: 0,
                                patrols: 0,
                                sieges: 0,
                                guns: 0,
                                soul_forge: 0,
                                turrets: 0
                            },
                            gems: {
                                patrols: 0,
                                guns: 0,
                                soul_forge: 0,
                                crafted: 0,
                                turrets: 0,
                                surveyors: 0
                            },
                        }
                    },
                    graphID: 0,
                    graphs: {}
                };
                return true;
            }
            return false;
        },
        post(){
            drawHellObservations();
        }
    },
    war_drones: {
        id: 'tech-war_drones',
        title: loc('tech_war_drones'),
        desc: loc('tech_war_drones'),
        category: 'hell_dimension',
        era: 'interstellar',
        reqs: { portal: 2, graphene: 1 },
        grant: ['portal',3],
        cost: {
            Knowledge(){ return 700000; },
        },
        effect: loc('tech_war_drones_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.portal.badlands = true;
                initStruct(actions.portal.prtl_badlands.war_drone);
                return true;
            }
            return false;
        }
    },
    demon_attractor: {
        id: 'tech-demon_attractor',
        title: loc('tech_demon_attractor'),
        desc: loc('tech_demon_attractor'),
        category: 'hell_dimension',
        era: 'interstellar',
        reqs: { portal: 3, stanene: 1 },
        grant: ['portal',4],
        cost: {
            Knowledge(){ return 745000; },
        },
        effect: loc('tech_demon_attractor_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_badlands.attractor);
                return true;
            }
            return false;
        }
    },
    combat_droids: {
        id: 'tech-combat_droids',
        title: loc('tech_combat_droids'),
        desc: loc('tech_combat_droids'),
        category: 'hell_dimension',
        era: 'interstellar',
        reqs: { portal: 4 },
        grant: ['portal',5],
        cost: {
            Knowledge(){ return 762000; },
            Soul_Gem(){ return 1; }
        },
        effect: loc('tech_combat_droids_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_fortress.war_droid);
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_combat_droids_flair');
        }
    },
    repair_droids: {
        id: 'tech-repair_droids',
        title: loc('tech_repair_droids'),
        desc: loc('tech_repair_droids'),
        category: 'hell_dimension',
        era: 'interstellar',
        reqs: { portal: 5 },
        grant: ['portal',6],
        cost: {
            Knowledge(){ return 794000; },
            Soul_Gem(){ return 1; }
        },
        effect: loc('tech_repair_droids_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_fortress.repair_droid);
                return true;
            }
            return false;
        }
    },
    advanced_predators: {
        id: 'tech-advanced_predators',
        title: loc('tech_advanced_predators'),
        desc: loc('tech_advanced_predators'),
        category: 'hell_dimension',
        era: 'intergalactic',
        reqs: { portal: 6, xeno: 4 },
        grant: ['portal',7],
        cost: {
            Knowledge(){ return 5000000; },
            Bolognium(){ return 500000; },
            Vitreloy(){ return 250000; }
        },
        effect: loc('tech_advanced_predators_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    enhanced_droids: {
        id: 'tech-enhanced_droids',
        title: loc('tech_enhanced_droids'),
        desc: loc('tech_enhanced_droids'),
        category: 'hell_dimension',
        era: 'interstellar',
        reqs: { portal: 5, military: 9 },
        grant: ['hdroid',1],
        cost: {
            Knowledge(){ return 1050000; },
        },
        effect: loc('tech_enhanced_droids_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    sensor_drone: {
        id: 'tech-sensor_drone',
        title: loc('tech_sensor_drone'),
        desc: loc('tech_sensor_drone'),
        category: 'hell_dimension',
        era: 'interstellar',
        reqs: { portal: 3, infernite: 1, stanene: 1, graphene: 1 },
        grant: ['infernite',2],
        cost: {
            Knowledge(){ return 725000; },
        },
        effect: loc('tech_sensor_drone_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_badlands.sensor_drone);
                return true;
            }
            return false;
        }
    },
    map_terrain: {
        id: 'tech-map_terrain',
        title: loc('tech_map_terrain'),
        desc: loc('tech_map_terrain'),
        category: 'hell_dimension',
        era: 'interstellar',
        reqs: { infernite: 2 },
        grant: ['infernite',3],
        cost: {
            Knowledge(){ return 948000; },
        },
        effect(){ return loc('tech_map_terrain_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    calibrated_sensors: {
        id: 'tech-calibrated_sensors',
        title: loc('tech_calibrated_sensors'),
        desc: loc('tech_calibrated_sensors'),
        category: 'hell_dimension',
        era: 'interstellar',
        reqs: { infernite: 3 },
        grant: ['infernite',4],
        cost: {
            Knowledge(){ return 1125000; },
            Infernite(){ return 3500; }
        },
        effect(){ return loc('tech_calibrated_sensors_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    shield_generator: {
        id: 'tech-shield_generator',
        title: loc('tech_shield_generator'),
        desc: loc('tech_shield_generator'),
        category: 'hell_dimension',
        era: 'intergalactic',
        reqs: { high_tech: 14, gateway: 3, infernite: 4 },
        grant: ['infernite',5],
        cost: {
            Knowledge(){ return 2680000; },
            Bolognium(){ return 75000; }
        },
        effect(){ return loc('tech_shield_generator_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    enhanced_sensors: {
        id: 'tech-enhanced_sensors',
        title: loc('tech_enhanced_sensors'),
        desc: loc('tech_enhanced_sensors'),
        category: 'hell_dimension',
        era: 'intergalactic',
        reqs: { infernite: 5, xeno: 4 },
        grant: ['infernite',6],
        cost: {
            Knowledge(){ return 4750000; },
            Vitreloy(){ return 25000; }
        },
        effect(){ return loc('tech_enhanced_sensors_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    xeno_linguistics: {
        id: 'tech-xeno_linguistics',
        title: loc('tech_xeno_linguistics'),
        desc: loc('tech_xeno_linguistics'),
        category: 'andromeda',
        era: 'intergalactic',
        reqs: { xeno: 1 },
        grant: ['xeno',2],
        cost: {
            Knowledge(){ return 3000000; }
        },
        effect(){ return loc('tech_xeno_linguistics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.settings.space['gorddon'] = true;
                return true;
            }
            return false;
        }
    },
    xeno_culture: {
        id: 'tech-xeno_culture',
        title: loc('tech_xeno_culture'),
        desc: loc('tech_xeno_culture'),
        category: 'progress',
        era: 'intergalactic',
        reqs: { xeno: 3 },
        grant: ['xeno',4],
        cost: {
            Knowledge(){ return 3400000; }
        },
        effect(){
            let s1name = races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name;
            let s1desc = races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].entity;
            return loc('tech_xeno_culture_effect',[s1name,s1desc]);
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gorddon.embassy);
                return true;
            }
            return false;
        }
    },
    cultural_exchange: {
        id: 'tech-cultural_exchange',
        title: loc('tech_cultural_exchange'),
        desc: loc('tech_cultural_exchange'),
        category: 'andromeda',
        era: 'intergalactic',
        reqs: { xeno: 5 },
        grant: ['xeno',6],
        cost: {
            Knowledge(){ return 3550000; }
        },
        effect(){
            let s1name = races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name;
            return loc('tech_cultural_exchange_effect',[s1name]);
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gorddon.dormitory);
                initStruct(actions.galaxy.gxy_gorddon.symposium);
                return true;
            }
            return false;
        }
    },
    shore_leave: {
        id: 'tech-shore_leave',
        title: loc('tech_shore_leave'),
        desc: loc('tech_shore_leave'),
        category: 'science',
        era: 'intergalactic',
        reqs: { andromeda: 3, xeno: 6 },
        grant: ['xeno',7],
        cost: {
            Knowledge(){ return 4600000; }
        },
        effect(){ return loc('tech_shore_leave_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    xeno_gift: {
        id: 'tech-xeno_gift',
        title: loc('tech_xeno_gift'),
        desc: loc('tech_xeno_gift'),
        category: 'andromeda',
        era: 'intergalactic',
        reqs: { high_tech: 16, xeno: 7 },
        grant: ['xeno',8],
        cost: {
            Knowledge(){ return 6500000; },
            Infernite(){ return 125000; }
        },
        effect(){ return loc('tech_xeno_gift_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_alien1.consulate);
                global.settings.space.alien1 = true;
                messageQueue(loc('tech_xeno_gift_msg',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name]),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    industrial_partnership: {
        id: 'tech-industrial_partnership',
        title: loc('tech_industrial_partnership'),
        desc(){ return loc('tech_industrial_partnership'); },
        category: 'andromeda',
        era: 'intergalactic',
        reqs: { xeno: 9 },
        grant: ['xeno',10],
        cost: {
            Knowledge(){ return 7250000; }
        },
        effect(){ return loc('tech_industrial_partnership_effect',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_alien1.vitreloy_plant);
                return true;
            }
            return false;
        }
    },
    embassy_housing: {
        id: 'tech-embassy_housing',
        title: loc('tech_embassy_housing'),
        desc(){ return loc('tech_embassy_housing'); },
        category: 'andromeda',
        era: 'intergalactic',
        reqs: { xeno: 10, science: 18 },
        grant: ['xeno',11],
        cost: {
            Knowledge(){ return 10750000; }
        },
        effect(){ return loc('tech_embassy_housing_effect',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    advanced_telemetry: {
        id: 'tech-advanced_telemetry',
        title: loc('tech_advanced_telemetry'),
        desc: loc('tech_advanced_telemetry'),
        category: 'science',
        era: 'intergalactic',
        reqs: { xeno: 5 },
        grant: ['telemetry',1],
        cost: {
            Knowledge(){ return 4200000; },
            Vitreloy(){ return 10000; }
        },
        effect(){
            return loc('tech_advanced_telemetry_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    defense_platform: {
        id: 'tech-defense_platform',
        title: loc('galaxy_defense_platform'),
        desc: loc('galaxy_defense_platform'),
        category: 'andromeda',
        era: 'intergalactic',
        reqs: { stargate: 5, piracy: 1 },
        grant: ['stargate',6],
        cost: {
            Knowledge(){ return 4850000; }
        },
        effect: loc('tech_defense_platform_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_stargate.defense_platform);
                return true;
            }
            return false;
        }
    },
    scout_ship: {
        id: 'tech-scout_ship',
        title: loc('galaxy_scout_ship'),
        desc: loc('galaxy_scout_ship'),
        category: 'andromeda_ships',
        era: 'intergalactic',
        reqs: { gateway: 3 },
        grant: ['andromeda',1],
        cost: {
            Knowledge(){ return 2600000; }
        },
        effect(){ return loc('tech_scout_ship_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gateway.scout_ship);
                return true;
            }
            return false;
        }
    },
    corvette_ship: {
        id: 'tech-corvette_ship',
        title: loc('galaxy_corvette_ship'),
        desc: loc('galaxy_corvette_ship'),
        category: 'andromeda_ships',
        era: 'intergalactic',
        reqs: { andromeda: 1, xeno: 1 },
        grant: ['andromeda',2],
        cost: {
            Knowledge(){ return 3200000; }
        },
        effect(){ return loc('tech_corvette_ship_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gateway.corvette_ship);
                return true;
            }
            return false;
        }
    },
    frigate_ship: {
        id: 'tech-frigate_ship',
        title: loc('galaxy_frigate_ship'),
        desc: loc('galaxy_frigate_ship'),
        category: 'andromeda_ships',
        era: 'intergalactic',
        reqs: { andromeda: 2, xeno: 6 },
        grant: ['andromeda',3],
        cost: {
            Knowledge(){ return 4000000; }
        },
        effect(){ return loc('tech_frigate_ship_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gateway.frigate_ship);
                renderSpace();
                return true;
            }
            return false;
        }
    },
    cruiser_ship: {
        id: 'tech-cruiser_ship',
        title: loc('galaxy_cruiser_ship'),
        desc: loc('galaxy_cruiser_ship'),
        category: 'andromeda_ships',
        era: 'intergalactic',
        reqs: { andromeda: 3, xeno: 10 },
        grant: ['andromeda',4],
        cost: {
            Knowledge(){ return 7500000; }
        },
        effect(){ return loc('tech_cruiser_ship_effect',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gateway.cruiser_ship);
                initStruct(actions.galaxy.gxy_alien2.foothold);
                global.settings.space.alien2 = true;
                renderSpace();
                return true;
            }
            return false;
        }
    },
    dreadnought: {
        id: 'tech-dreadnought',
        title: loc('galaxy_dreadnought'),
        desc: loc('galaxy_dreadnought'),
        category: 'andromeda_ships',
        era: 'intergalactic',
        reqs: { andromeda: 4, science: 18 },
        grant: ['andromeda',5],
        cost: {
            Knowledge(){ return 10000000; }
        },
        effect(){ return loc('tech_dreadnought_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gateway.dreadnought);
                renderSpace();
                return true;
            }
            return false;
        }
    },
    ship_dock: {
        id: 'tech-ship_dock',
        title: loc('galaxy_ship_dock'),
        desc: loc('galaxy_ship_dock'),
        category: 'andromeda_ships',
        era: 'intergalactic',
        reqs: { gateway: 3, xeno: 6 },
        grant: ['gateway',4],
        cost: {
            Knowledge(){ return 3900000; }
        },
        effect(){ return loc('tech_ship_dock_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gateway.ship_dock);
                return true;
            }
            return false;
        }
    },
    ore_processor: {
        id: 'tech-ore_processor',
        title: loc('galaxy_ore_processor'),
        desc: loc('galaxy_ore_processor'),
        category: 'space_mining',
        era: 'intergalactic',
        reqs: { conflict: 2 },
        grant: ['conflict',3],
        cost: {
            Knowledge(){ return 7500000; }
        },
        effect(){ return loc('tech_ore_processor_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_alien2.ore_processor);
                return true;
            }
            return false;
        }
    },
    scavenger: {
        id: 'tech-scavenger',
        title: loc('galaxy_scavenger'),
        desc: loc('galaxy_scavenger'),
        category: 'science',
        era: 'intergalactic',
        reqs: { conflict: 3 },
        grant: ['conflict',4],
        cost: {
            Knowledge(){ return 8000000; }
        },
        effect(){ return loc('tech_scavenger_effect',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_alien2.scavenger);
                return true;
            }
            return false;
        }
    },
    coordinates: {
        id: 'tech-coordinates',
        title: loc('tech_coordinates'),
        desc: loc('tech_coordinates'),
        category: 'andromeda',
        era: 'intergalactic',
        reqs: { science: 18, conflict: 5 },
        grant: ['chthonian',1],
        cost: {
            Knowledge(){ return 10000000; }
        },
        effect(){ return loc('tech_coordinates_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_chthonian.minelayer);
                global.settings.space.chthonian = true;
                return true;
            }
            return false;
        }
    },
    chthonian_survey : {
        id: 'tech-chthonian_survey',
        title: loc('tech_chthonian_survey'),
        desc: loc('tech_chthonian_survey'),
        category: 'space_mining',
        era: 'intergalactic',
        reqs: { chthonian: 2 },
        grant: ['chthonian',3],
        cost: {
            Knowledge(){ return 11800000; }
        },
        effect(){ return loc('tech_chthonian_survey_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Orichalcum.display = true;
                initStruct(actions.galaxy.gxy_chthonian.excavator);
                initStruct(actions.galaxy.gxy_chthonian.raider);
                messageQueue(loc('tech_chthonian_survey_result'),'info',false,['progress']);
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    gateway_depot: {
        id: 'tech-gateway_depot',
        title: loc('galaxy_gateway_depot'),
        desc: loc('galaxy_gateway_depot'),
        category: 'storage',
        era: 'intergalactic',
        reqs: { gateway: 4 },
        grant: ['gateway',5],
        cost: {
            Knowledge(){ return 4350000; }
        },
        effect(){ return loc('tech_gateway_depot_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_stargate.gateway_depot);
                return true;
            }
            return false;
        }
    },
    soul_forge: {
        id: 'tech-soul_forge',
        title: loc('portal_soul_forge_title'),
        desc: loc('portal_soul_forge_title'),
        category: 'hell_dimension',
        era: 'intergalactic',
        reqs: { hell_pit: 3 },
        grant: ['hell_pit',4],
        cost: {
            Knowledge(){ return 2750000; }
        },
        effect(){ return loc('tech_soul_forge_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_pit.soul_forge);
                return true;
            }
            return false;
        }
    },
    soul_attractor: {
        id: 'tech-soul_attractor',
        title: loc('portal_soul_attractor_title'),
        desc: loc('portal_soul_attractor_title'),
        category: 'hell_dimension',
        era: 'intergalactic',
        reqs: { hell_pit: 4, high_tech: 16 },
        grant: ['hell_pit',5],
        cost: {
            Knowledge(){ return 5500000; }
        },
        effect(){ return loc('tech_soul_attractor_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_pit.soul_attractor);
                return true;
            }
            return false;
        }
    },
    soul_absorption: {
        id: 'tech-soul_absorption',
        title: loc('tech_soul_absorption'),
        desc: loc('tech_soul_absorption'),
        category: 'hell_dimension',
        era: 'intergalactic',
        reqs: { hell_pit: 5 },
        grant: ['hell_pit',6],
        cost: {
            Knowledge(){ return 6000000; },
            Infernite(){ return 250000; }
        },
        effect(){ return loc('tech_soul_absorption_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    soul_link: {
        id: 'tech-soul_link',
        title: loc('tech_soul_link'),
        desc: loc('tech_soul_link'),
        category: 'hell_dimension',
        era: 'intergalactic',
        reqs: { hell_pit: 6 },
        grant: ['hell_pit',7],
        cost: {
            Knowledge(){ return 7500000; },
            Vitreloy(){ return 250000; }
        },
        effect(){ return loc('tech_soul_link_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    soul_bait: {
        id: 'tech-soul_bait',
        title: loc('tech_soul_bait'),
        desc: loc('tech_soul_bait'),
        category: 'hell_dimension',
        era: 'existential',
        reqs: { hell_pit: 7, asphodel: 3 },
        grant: ['hell_pit',8],
        cost: {
            Knowledge(){ return 65000000; },
            Asphodel_Powder(){ return 10000; }
        },
        effect(){ return loc('tech_soul_bait_effect',[global.resource.Asphodel_Powder.name, loc('arpa_blood_attract_title')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    gun_emplacement: {
        id: 'tech-gun_emplacement',
        title: loc('portal_gun_emplacement_title'),
        desc: loc('portal_gun_emplacement_title'),
        category: 'hell_dimension',
        era: 'intergalactic',
        reqs: { hell_pit: 4 },
        grant: ['hell_gun',1],
        cost: {
            Knowledge(){ return 3000000; }
        },
        effect(){ return loc('tech_gun_emplacement_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_pit.gun_emplacement);
                return true;
            }
            return false;
        }
    },
    advanced_emplacement: {
        id: 'tech-advanced_emplacement',
        title: loc('tech_advanced_emplacement'),
        desc: loc('tech_advanced_emplacement'),
        category: 'hell_dimension',
        era: 'intergalactic',
        reqs: { hell_gun: 1, high_tech: 17 },
        grant: ['hell_gun',2],
        cost: {
            Knowledge(){ return 12500000; },
            Orichalcum(){ return 180000; }
        },
        effect(){ return loc('tech_advanced_emplacement_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dial_it_to_11: {
        id: 'tech-dial_it_to_11',
        title: loc('tech_dial_it_to_11'),
        desc: loc('tech_dial_it_to_11'),
        category: 'science',
        wiki: false,
        era: 'deep_space',
        reqs: { quaked: 1 },
        grant: ['quaked',2],
        cost: {
            Knowledge(){ return 500000; }
        },
        condition(){
            return (global.race['sludge'] || global.race['ultra_sludge']) && !global.race['cataclysm'] ? false : true;
        },
        effect(){
            let gains = calcPrestige('cataclysm');
            let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
            return `<div>${loc('tech_dial_it_to_11_effect',[planetName().dwarf,global.race['cataclysm'] ? planetName().red : races[global.race.species].home])}</div><div class="has-text-danger">${loc('tech_dial_it_to_11_effect2')}</div><div class="has-text-special">${loc('star_dock_genesis_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-special">${loc('star_dock_genesis_effect3',[gains.phage])}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                $('#main').addClass('earthquake');
                setTimeout(function(){
                    $('#main').removeClass('earthquake');
                    cataclysm_end();
                }, 4000);
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_dial_it_to_11_flair'); }
    },
    limit_collider: {
        id: 'tech-limit_collider',
        title: loc('tech_limit_collider'),
        desc: loc('tech_limit_collider'),
        category: 'science',
        wiki: false,
        era: 'deep_space',
        reqs: { quaked: 1 },
        grant: ['quaked',2],
        cost: {
            Knowledge(){ return 500000; }
        },
        effect(){ return loc('tech_limit_collider_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mana: {
        id: 'tech-mana',
        title: loc('tech_mana'),
        desc: loc('tech_mana'),
        category: 'magic',
        era: 'civilized',
        reqs: { primitive: 3 },
        grant: ['magic',1],
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Knowledge(){ return 25; }
        },
        effect(){ return loc('tech_mana_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Mana.display = true;
                global.resource.Crystal.display = true;
                global.civic.crystal_miner.display = true;
                if (global.race['witch_hunter']){
                    global.resource.Sus.display = true;
                }
                return true;
            }
            return false;
        },
        flair: loc('tech_mana_flair'),
        post(){
            renderPsychicPowers();
        }
    },
    ley_lines: {
        id: 'tech-ley_lines',
        title: loc('tech_ley_lines'),
        desc: loc('tech_ley_lines'),
        category: 'magic',
        era: 'civilized',
        reqs: { magic: 1 },
        grant: ['magic',2],
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Knowledge(){ return 40; }
        },
        effect(){ return loc('tech_ley_lines_effect'); },
        action(){
            if (payCosts($(this)[0])){
                if (global.tech['isolation']){
                    initStruct(actions.tauceti.tau_home.pylon);
                }
                else if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    initStruct(actions.space.spc_red.pylon);
                }
                else {
                    initStruct(actions.city.pylon);
                }
                return true;
            }
            return false;
        }
    },
    rituals: {
        id: 'tech-rituals',
        title: loc('tech_rituals'),
        desc: loc('tech_rituals'),
        category: 'magic',
        era: 'civilized',
        reqs: { magic: 2 },
        grant: ['magic',3],
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 25; },
            Knowledge(){ return 750; },
            Crystal(){ return 50; }
        },
        effect(){ return loc('tech_rituals_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.race['casting'] = {
                    farmer: 0,
                    miner: 0,
                    lumberjack: 0,
                    science: 0,
                    factory: 0,
                    army: 0,
                    hunting: 0,
                    crafting: 0,
                    total: 0
                };
                global.settings.showIndustry = true;
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
        }
    },
    crafting_ritual: {
        id: 'tech-crafting_ritual',
        title: loc('tech_crafting_ritual'),
        desc: loc('tech_crafting_ritual'),
        category: 'magic',
        era: 'discovery',
        reqs: { magic: 3, foundry: 5 },
        grant: ['magic',4],
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 100; },
            Knowledge(){ return 15000; },
            Crystal(){ return 2500; }
        },
        effect(){ return loc('tech_crafting_ritual_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.race.casting['crafting'] = 0;
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
        }
    },
    mana_nexus: {
        id: 'tech-mana_nexus',
        title: loc('tech_mana_nexus'),
        desc: loc('tech_mana_nexus'),
        category: 'magic',
        era: 'early_space',
        reqs: { magic: 4, space: 3, luna: 1 },
        grant: ['magic',5],
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 500; },
            Knowledge(){ return 160000; },
            Crystal(){ return 2500; }
        },
        effect(){ return loc('tech_mana_nexus_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    clerics: {
        id: 'tech-clerics',
        title: loc('tech_clerics'),
        desc: loc('tech_clerics'),
        category: 'magic',
        era: 'civilized',
        reqs: { magic: 3 },
        grant: ['cleric',1],
        condition(){
            return global.race['universe'] === 'magic' && global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display ? true : false;
        },
        cost: {
            Mana(){ return 100; },
            Knowledge(){ return 2000; },
            Crystal(){ return 100; }
        },
        effect(){ return loc('tech_clerics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    conjuring: {
        id: 'tech-conjuring',
        title: loc('tech_conjuring'),
        desc: loc('tech_conjuring_desc'),
        category: 'magic',
        era: 'civilized',
        reqs: { magic: 1 },
        grant: ['conjuring',1],
        not_trait: ['cataclysm'],
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 2; },
            Crystal(){ return 5; }
        },
        effect(){ return loc('tech_conjuring_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    res_conjuring: {
        id: 'tech-res_conjuring',
        title: loc('tech_res_conjuring'),
        desc: loc('tech_res_conjuring'),
        category: 'magic',
        era: 'civilized',
        reqs: { conjuring: 1 },
        grant: ['conjuring',2],
        not_trait: ['cataclysm'],
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 5; },
            Crystal(){ return 10; }
        },
        effect(){ return loc('tech_res_conjuring_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    alchemy: {
        id: 'tech-alchemy',
        title: loc('tech_alchemy'),
        desc: loc('tech_alchemy'),
        category: 'magic',
        era: 'discovery',
        reqs: { magic: 3, high_tech: 1 },
        grant: ['alchemy',1],
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 100; },
            Knowledge(){ return 10000; },
            Crystal(){ return 250; }
        },
        effect(){ return loc('tech_alchemy_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.race['alchemy'] = {
                    Food: 0, Lumber: 0,
                    Stone: 0, Furs: 0,
                    Copper: 0, Iron: 0,
                    Aluminium: 0, Cement: 0,
                    Coal: 0, Oil: 0,
                    Uranium: 0, Steel: 0,
                    Titanium: 0, Alloy: 0,
                    Polymer: 0, Iridium: 0,
                    Helium_3: 0, Deuterium: 0,
                    Neutronium: 0, Adamantite: 0,
                    Infernite: 0, Elerium: 0,
                    Nano_Tube: 0, Graphene: 0,
                    Stanene: 0, Bolognium: 0,
                    Vitreloy: 0, Orichalcum: 0
                };
                global.settings.showAlchemy = true;
                return true;
            }
            return false;
        },
        post(){
            drawResourceTab('alchemy');
        }
    },
    transmutation: {
        id: 'tech-transmutation',
        title: loc('tech_transmutation'),
        desc: loc('tech_transmutation'),
        category: 'magic',
        era: 'intergalactic',
        reqs: { alchemy: 1, high_tech: 16 },
        grant: ['alchemy',2],
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 1250; },
            Knowledge(){ return 5500000; },
            Crystal(){ return 1000000; }
        },
        effect(){ return loc('tech_transmutation_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    secret_society: {
        id: 'tech-secret_society',
        title: loc('tech_secret_society'),
        desc: loc('tech_secret_society'),
        category: 'magic',
        era: 'civilized',
        reqs: { magic: 1 },
        grant: ['roguemagic',1],
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 10; },
            Knowledge(){ return 45; },
        },
        effect(){ return loc('tech_secret_society_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    cultists: {
        id: 'tech-cultists',
        title: loc('tech_cultists'),
        desc: loc('tech_cultists'),
        category: 'magic',
        era: 'civilized',
        reqs: { roguemagic: 1, cleric: 1 },
        grant: ['roguemagic',2],
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 250; },
            Knowledge(){ return 2125; }
        },
        effect(){ return loc('tech_cultists_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    conceal_ward: {
        id: 'tech-conceal_ward',
        title: loc('tech_conceal_ward'),
        desc: loc('tech_conceal_ward'),
        category: 'magic',
        era: 'discovery',
        reqs: { roguemagic: 2, theatre: 3 },
        grant: ['roguemagic',3],
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 500; },
            Knowledge(){ return 8200; },
            Crystal(){ return 1000; }
        },
        effect(){ return loc('tech_conceal_ward_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.conceal_ward);
                global.space['conceal_ward'] = { count: 0 }; // ???
                return true;
            }
            return false;
        }
    },
    subtle_rituals: {
        id: 'tech-subtle_rituals',
        title: loc('tech_subtle_rituals'),
        desc: loc('tech_subtle_rituals'),
        category: 'magic',
        era: 'discovery',
        reqs: { roguemagic: 3, magic: 4 },
        grant: ['roguemagic',4],
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 100; },
            Knowledge(){ return 15000; },
            Crystal(){ return 2500; }
        },
        effect(){ return loc('tech_subtle_rituals_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pylon_camouflage: {
        id: 'tech-pylon_camouflage',
        title: loc('tech_pylon_camouflage'),
        desc: loc('tech_pylon_camouflage'),
        category: 'magic',
        era: 'industrialized',
        reqs: { roguemagic: 4, high_tech: 3 },
        grant: ['roguemagic',5],
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 1000; },
            Knowledge(){ return 30000; },
            Crystal(){ return 3750; }
        },
        effect(){ return loc('tech_pylon_camouflage_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fake_tech: {
        id: 'tech-fake_tech',
        title: loc('tech_fake_tech'),
        desc: loc('tech_fake_tech'),
        category: 'magic',
        era: 'industrialized',
        reqs: { roguemagic: 5, high_tech: 4 },
        grant: ['roguemagic',6],
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 2250; },
            Knowledge(){ return 60000; }
        },
        effect(){ return loc('tech_fake_tech_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    concealment: {
        id: 'tech-concealment',
        title: loc('tech_concealment'),
        desc: loc('tech_concealment'),
        category: 'magic',
        era: 'early_space',
        reqs: { roguemagic: 6, magic: 5 },
        grant: ['roguemagic',7],
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 3000; },
            Knowledge(){ return 185000; }
        },
        effect(){ return loc('tech_concealment_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    improved_concealment: {
        id: 'tech-improved_concealment',
        title: loc('tech_improved_concealment'),
        desc: loc('tech_improved_concealment'),
        category: 'magic',
        era: 'intergalactic',
        reqs: { roguemagic: 7, forbidden: 1 },
        grant: ['roguemagic',8],
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return global.race['no_plasmid'] ? 6000 : 15000; },
            Knowledge(){ return 20000000; }
        },
        effect(){ return loc('tech_improved_concealment_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    outerplane_summon: {
        id: 'tech-outerplane_summon',
        title: loc('tech_outerplane_summon'),
        desc: loc('tech_outerplane_summon'),
        category: 'magic',
        era: 'dimensional',
        reqs: { roguemagic: 8, forbidden: 4, hell_spire: 10, b_stone: 2, waygate: 3 },
        grant: ['forbidden',5],
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return global.race['no_plasmid'] ? 12000 : 40000; },
            Knowledge(){ return 60000000; },
            Demonic_Essence(){ return 1; }
        },
        effect(){ return loc('tech_outerplane_summon_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dark_bomb: {
        id: 'tech-dark_bomb',
        title: loc('tech_dark_bomb'),
        desc: loc('tech_dark_bomb'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { hell_spire: 10, b_stone: 2, waygate: 2, sphinx_bribe: 1 },
        condition(){
            let affix = universeAffix();
            if (global.portal.hasOwnProperty('waygate') && global.portal.waygate.progress < 100 && global.stats.spire.hasOwnProperty(affix) && global.stats.spire[affix].hasOwnProperty('dlstr') && global.stats.spire[affix].dlstr > 0){
                return true;
            }
            return false;
        },
        grant: ['dl_reset',1],
        cost: {
            Knowledge(){ return 65000000; },
            Soul_Gem(){ return 5000; },
            Blood_Stone(){ return 25; },
            Dark(){ return 1; },
            Supply(){ return 1000000; }
        },
        effect(){
            return loc('tech_dark_bomb_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                global.portal.waygate.progress = 100;
                global.portal.waygate.on = 0;
                global.tech['waygate'] = 3;
                global.resource.Demonic_Essence.display = true;
                global.resource.Demonic_Essence.amount = 1;
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_dark_bomb_flair'); }
    },
    bribe_sphinx: {
        id: 'tech-bribe_sphinx',
        title: loc('portal_sphinx_bribe'),
        desc: loc('portal_sphinx_bribe'),
        category: 'hell_dimension',
        era: 'dimensional',
        reqs: { hell_spire: 8 },
        grant: ['sphinx_bribe',1],
        cost: {
            Soul_Gem(){ return 250; },
            Supply(){ return 500000; }
        },
        effect(){
            return loc('tech_bribe_sphinx_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Codex.display = true;
                global.resource.Codex.amount = 1;
                messageQueue(loc('tech_bribe_sphinx_msg'),'info',false,['progress','hell']);
                return true;
            }
            return false;
        }
    },
    alien_biotech: {
        id: 'tech-alien_biotech',
        title: loc('tech_alien_biotech'),
        desc: loc('tech_alien_biotech'),
        category: 'science',
        era: 'solar',
        reqs: { genetics: 8, kuiper: 1 },
        grant: ['biotech',1],
        path: ['truepath'],
        cost: {
            Knowledge(){ return 2400000; },
            Orichalcum(){ return 125000; },
            Cipher(){ return 15000; }
        },
        effect(){ return loc(global.race['orbit_decayed'] ? 'tech_alien_biotech_effect_alt' : 'tech_alien_biotech_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    zero_g_lab: {
        id: 'tech-zero_g_lab',
        title: loc('tech_zero_g_lab'),
        desc: loc('tech_zero_g_lab'),
        category: 'science',
        era: 'solar',
        path: ['truepath'],
        reqs: { high_tech: 13, graphene: 1, enceladus: 2 },
        grant: ['enceladus',3],
        cost: {
            Knowledge(){ return 900000; }
        },
        effect: loc('tech_zero_g_lab_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_enceladus.zero_g_lab);
                return true;
            }
            return false;
        }
    },
    operating_base: {
        id: 'tech-operating_base',
        title: loc('tech_operating_base'),
        desc: loc('tech_operating_base'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { enceladus: 3, triton: 1 },
        grant: ['enceladus',4],
        cost: {
            Knowledge(){ return 1400000; }
        },
        effect(){ return loc('tech_operating_base_effect',[planetName().enceladus]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_enceladus.operating_base);
                return true;
            }
            return false;
        }
    },
    munitions_depot: {
        id: 'tech-munitions_depot',
        title: loc('tech_munitions_depot'),
        desc: loc('tech_munitions_depot'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { enceladus: 4 },
        grant: ['enceladus',5],
        cost: {
            Knowledge(){ return 1500000; }
        },
        effect(){ return loc('tech_munitions_depot_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_enceladus.munitions_depot);
                return true;
            }
            return false;
        }
    },
    fob: {
        id: 'tech-fob',
        title: loc('tech_fob'),
        desc: loc('tech_fob'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { triton: 1 },
        grant: ['triton',2],
        cost: {
            Knowledge(){ return 1450000; }
        },
        effect(){ return loc('tech_fob_effect',[planetName().triton]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_triton.fob);
                initStruct(actions.space.spc_triton.lander);
                initStruct(actions.space.spc_triton.crashed_ship);
                return true;
            }
            return false;
        }
    },
    bac_tanks_tp: {
        id: 'tech-bac_tanks_tp',
        title: loc('tech_bac_tanks'),
        desc: loc('tech_bac_tanks_desc'),
        category: 'military',
        era: 'solar',
        path: ['truepath'],
        reqs: { medic: 1, triton: 2 },
        grant: ['medic',2],
        cost: {
            Knowledge(){ return 1750000; }
        },
        effect: loc('tech_bac_tanks_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    medkit: {
        id: 'tech-medkit',
        title: loc('tech_medkit'),
        desc: loc('tech_medkit'),
        category: 'military',
        era: 'solar',
        path: ['truepath'],
        reqs: { medic: 2, outer: 4 },
        grant: ['medic',3],
        cost: {
            Knowledge(){ return 2250000; },
            Quantium(){ return 250000; },
            Cipher(){ return 8000; }
        },
        effect: loc('tech_medkit_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    sam_site: {
        id: 'tech-sam_site',
        title: loc('tech_sam_site'),
        desc: loc('tech_sam_site'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { titan: 6, triton: 1 },
        grant: ['titan',7],
        cost: {
            Knowledge(){ return 1475000; }
        },
        effect(){ return loc('tech_sam_site_effect',[planetName().titan]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.sam);
                return true;
            }
            return false;
        }
    },
    data_cracker: {
        id: 'tech-data_cracker',
        title: loc('tech_data_cracker'),
        desc: loc('tech_data_cracker'),
        category: 'science',
        era: 'solar',
        path: ['truepath'],
        reqs: { titan: 7, kuiper: 1 },
        grant: ['titan',8],
        cost: {
            Knowledge(){ return 2750000; },
            Cipher(){ return 25000; }
        },
        effect(){ return loc('tech_data_cracker_effect',[global.resource.Cipher.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.decoder);
                return true;
            }
            return false;
        }
    },
    ai_core_tp: {
        id: 'tech-ai_core_tp',
        title: loc('tech_ai_core'),
        desc: loc('tech_ai_core'),
        category: 'ai_core',
        era: 'solar',
        path: ['truepath'],
        reqs: { titan: 8 },
        grant: ['titan',9],
        cost: {
            Knowledge(){ return 3000000; },
            Cipher(){ return 100000; },
        },
        effect: loc('tech_ai_core_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.ai_core);
                return true;
            }
            return false;
        }
    },
    ai_optimizations: {
        id: 'tech-ai_optimizations',
        title: loc('tech_ai_optimizations'),
        desc: loc('tech_ai_optimizations'),
        category: 'ai_core',
        era: 'solar',
        path: ['truepath'],
        reqs: { eris: 3, titan: 9, titan_ai_core: 1, dig_control: 1 },
        grant: ['titan_ai_core',2],
        cost: {
            Knowledge(){ return 3750000; },
            Cipher(){ return 75000; }
        },
        effect: loc('tech_ai_optimizations_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        class: 'synth'
    },
    synthetic_life: {
        id: 'tech-synthetic_life',
        title: loc('tech_synthetic_life'),
        desc: loc('tech_synthetic_life'),
        category: 'ai_core',
        era: 'solar',
        path: ['truepath'],
        reqs: { titan_ai_core: 2 },
        grant: ['titan_ai_core',3],
        cost: {
            Knowledge(){ return 4000000; },
            Cipher(){ return 75000; }
        },
        effect: loc('tech_synthetic_life_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.ai_colonist);
                return true;
            }
            return false;
        },
        class: 'synth'
    },
    protocol66: {
        id: 'tech-protocol66',
        title: loc('tech_protocol66'),
        desc: loc('tech_protocol66'),
        category: 'ai_core',
        era: 'solar',
        path: ['truepath'],
        reqs: { titan_ai_core: 3, corrupted_ai: 1 },
        grant: ['corrupted_ai',2],
        cost: {
            Knowledge(){ return 5000000; }
        },
        effect: loc('tech_protocol66_effect'),
        action(){
            if (checkAffordable($(this)[0])){
                return true;
            }
            return false;
        },
        flair: loc('tech_protocol66_flair'),
        class: 'synth'
    },
    protocol66a: {
        id: 'tech-protocol66a',
        title: loc('tech_protocol66'),
        desc: loc('tech_protocol66'),
        category: 'ai_core',
        era: 'solar',
        path: ['truepath'],
        reqs: { titan_ai_core: 3, corrupted_ai: 2 },
        wiki: false,
        grant: ['corrupted_ai',3],
        cost: {
            Knowledge(){ return 5000000; }
        },
        effect(){
            let gains = calcPrestige('ai');
            let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
            let prestige = `<div class="has-text-caution">${loc('tech_protocol66a_effect_gains',[gains.plasmid, plasmidType, gains.phage, gains.cores])}</div>`;
            return `<div>${loc('tech_protocol66a_effect')}</div>${prestige}`;
        },
        action(){
            if (payCosts($(this)[0])){
                if (webWorker.w){
                    webWorker.w.terminate();
                }
                clearPopper();
                $(`body`).append(`<div id="aiAppoc"><div></div></div>`);
                $(`#aiAppoc`).addClass('noise-wrapper');
                $(`#aiAppoc > div`).addClass('noise');

                setTimeout(function(){
                    $(`body`).append(`<div id="deadAirTop" class="signal-lost-top"></div>`);
                    $(`body`).append(`<div id="deadAirBottom" class="signal-lost-bottom"></div>`);

                    $('#deadAirTop').animate({
                        height: "50%",
                        opacity: 1
                    }, 400);

                    $('#deadAirBottom').animate({
                        height: "50%",
                        opacity: 1
                    }, 400);
                }, 3000);
                setTimeout(function(){
                    aiApocalypse();
                }, 4000);
                return true;
            }
            return false;
        },
        flair: loc('tech_protocol66a_flair'),
        class: 'synth'
    },
    terraforming_tp: {
        id: 'tech-terraforming_tp',
        title: loc('tech_terraforming'),
        desc: loc('tech_terraforming'),
        category: 'special',
        era: 'solar',
        reqs: { dig_control: 1, eris: 2, titan_ai_core: 2 },
        path: ['truepath'],
        grant: ['terraforming',1],
        trait: ['orbit_decay'],
        cost: {
            Knowledge(){ return 5000000; },
        },
        effect(){ return loc('tech_terraforming_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.terraformer);
                return true;
            }
            return false;
        }
    },
    quantium: {
        id: 'tech-quantium',
        title: loc('tech_quantium'),
        desc: loc('tech_quantium'),
        category: 'crafting',
        era: 'solar',
        path: ['truepath'],
        reqs: { supercollider: 10, enceladus: 3 },
        grant: ['quantium',1],
        cost: {
            Knowledge(){ return 1000000; },
            Elerium(){ return 1000; },
            Nano_Tube(){ return 1000000; },
            Graphene(){ return 1000000; }
        },
        effect: loc('tech_quantium_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Quantium.display = true;
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    anitgrav_bunk: {
        id: 'tech-anitgrav_bunk',
        title: loc('tech_anitgrav_bunk'),
        desc: loc('tech_anitgrav_bunk'),
        category: 'military',
        era: 'solar',
        path: ['truepath'],
        reqs: { marines: 1, quantium: 1 },
        grant: ['marines',2],
        cost: {
            Knowledge(){ return 1250000; },
            Quantium(){ return 500000; },
        },
        effect(){ return loc('tech_anitgrav_bunk_effect',[loc('space_red_space_barracks_title')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    higgs_boson_tp: {
        id: 'tech-higgs_boson_tp',
        title: loc('tech_higgs_boson'),
        desc: loc('tech_higgs_boson'),
        category: 'science',
        era: 'early_space',
        path: ['truepath'],
        reqs: { supercollider: 2 },
        grant: ['tp_particles',1],
        cost: {
            Knowledge(){ return 125000; }
        },
        effect: loc('tech_higgs_boson_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    long_range_probes: {
        id: 'tech-long_range_probes',
        title: loc('tech_long_range_probes'),
        desc: loc('tech_long_range_probes'),
        category: 'space_exploration',
        era: 'solar',
        path: ['truepath'],
        reqs: { high_tech: 10, elerium: 1 },
        grant: ['outer',1],
        cost: {
            Knowledge(){ return 400000; },
            Uranium(){ return 20000; },
            Iridium(){ return 250000; },
            Neutronium(){ return 3000; },
            Elerium(){ return 350; }
        },
        effect: loc('tech_long_range_probes_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.titan = true;
                global.settings.space.enceladus = true;
                initStruct(actions.space.spc_titan.titan_spaceport);
                initStruct(actions.space.spc_titan.electrolysis);
                return true;
            }
            return false;
        },
    },
    strange_signal: {
        id: 'tech-strange_signal',
        title: loc('tech_strange_signal'),
        desc: loc('tech_strange_signal'),
        category: 'space_exploration',
        era: 'solar',
        path: ['truepath'],
        reqs: { outer: 1, syard_sensor: 4 },
        grant: ['outer',2],
        cost: {
            Knowledge(){ return 1350000; }
        },
        effect: loc('tech_strange_signal_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.triton = true;
                return true;
            }
            return false;
        },
    },
    data_analysis: {
        id: 'tech-data_analysis',
        title: loc('tech_data_analysis'),
        desc: loc('tech_data_analysis'),
        category: 'space_exploration',
        era: 'solar',
        path: ['truepath'],
        reqs: { outer: 3 },
        grant: ['outer',4],
        cost: {
            Knowledge(){ return 1800000; },
            Cipher(){ return 12500; }
        },
        effect: loc('tech_data_analysis_effect'),
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_data_analysis_result'),'info',false,['progress']);
                global.space.syndicate['spc_titan'] += 500;
                global.space.syndicate['spc_enceladus'] += 250;
                global.space.syndicate['spc_triton'] += 1000;
                return true;
            }
            return false;
        },
    },
    mass_relay: {
        id: 'tech-mass_relay',
        title: loc('tech_mass_relay'),
        desc: loc('tech_mass_relay'),
        category: 'space_exploration',
        era: 'solar',
        path: ['truepath'],
        reqs: { outer: 4 },
        grant: ['outer',5],
        cost: {
            Knowledge(){ return 2200000; },
            Cipher(){ return 40000; }
        },
        effect: loc('tech_mass_relay_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_dwarf.mass_relay);
                return true;
            }
            return false;
        },
    },
    nav_data: {
        id: 'tech-nav_data',
        title: loc('tech_nav_data'),
        desc: loc('tech_nav_data'),
        category: 'space_exploration',
        era: 'solar',
        path: ['truepath'],
        reqs: { outer: 6 },
        grant: ['outer',7],
        cost: {
            Knowledge(){ return 2250000; },
            Cipher(){ return 60000; }
        },
        effect: loc('tech_nav_data_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.eris = true;
                global.settings.space.kuiper = true;
                global.tech['eris_scan'] = 0;
                initStruct(actions.space.spc_eris.drone_control);
                messageQueue(loc('tech_nav_data_result',[planetName().eris]),'info',false,['progress']);
                return true;
            }
            return false;
        },
    },
    sensor_logs: {
        id: 'tech-sensor_logs',
        title: loc('tech_sensor_logs'),
        desc: loc('tech_sensor_logs'),
        category: 'space_exploration',
        era: 'solar',
        path: ['truepath'],
        reqs: { outer: 7 },
        grant: ['outer',8],
        cost: {
            Knowledge(){ return 3500000; },
            Cipher(){ return 65000; }
        },
        effect: loc('tech_sensor_logs_effect'),
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_sensor_logs_result'),'info',false,['progress']);
                return true;
            }
            return false;
        },
    },
    dronewar: {
        id: 'tech-dronewar',
        title: loc('tech_dronewar'),
        desc: loc('tech_dronewar'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { eris: 2, titan_ai_core: 1 },
        grant: ['eris',3],
        cost: {
            Knowledge(){ return 3200000; },
            Cipher(){ return 25000; }
        },
        effect(){ return loc('tech_dronewar_effect',[planetName().eris]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_eris.shock_trooper);
                initStruct(actions.space.spc_eris.digsite);
                return true;
            }
            return false;
        },
    },
    drone_tank: {
        id: 'tech-drone_tank',
        title: loc('tech_drone_tank'),
        desc: loc('tech_drone_tank'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { eris: 3 },
        grant: ['eris',4],
        cost: {
            Knowledge(){ return 3400000; },
            Cipher(){ return 50000; }
        },
        effect: loc('tech_drone_tank_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_eris.tank);
                return true;
            }
            return false;
        },
    },
    stanene_tp: {
        id: 'tech-stanene_tp',
        title: loc('tech_stanene'),
        desc: loc('tech_stanene'),
        category: 'crafting',
        era: 'solar',
        path: ['truepath'],
        reqs: { titan: 1, enceladus: 1 },
        grant: ['stanene',1],
        cost: {
            Knowledge(){ return 525000; },
            Aluminium(){ return 500000; },
            Nano_Tube(){ return 100000; }
        },
        effect: loc('tech_stanene_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Stanene.display = true;
                messageQueue(loc('tech_stanene_avail'),'info',false,['progress']);
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
            renderPsychicPowers();
        }
    },
    graphene_tp: {
        id: 'tech-graphene_tp',
        title: loc('tech_graphene'),
        desc: loc('tech_graphene'),
        category: 'crafting',
        era: 'solar',
        path: ['truepath'],
        reqs: { titan: 5 },
        grant: ['graphene',1],
        cost: {
            Knowledge(){ return 640000; },
            Adamantite(){ return 25000; }
        },
        effect: loc('tech_graphene_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.g_factory);
                return true;
            }
            return false;
        }
    },
    virtual_reality_tp: {
        id: 'tech-virtual_reality_tp',
        title: loc('tech_virtual_reality'),
        desc: loc('tech_virtual_reality'),
        category: 'progress',
        era: 'solar',
        path: ['truepath'],
        reqs: { high_tech: 11, titan: 4, stanene: 1 },
        grant: ['high_tech',12],
        cost: {
            Knowledge(){ return 616000; },
            Nano_Tube(){ return 1000000; },
            Stanene(){ return 125000 }
        },
        effect: loc('tech_virtual_reality_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_virtual_reality_flair');
        }
    },
    electrolysis: {
        id: 'tech-electrolysis',
        title: loc('tech_electrolysis'),
        desc: loc('tech_electrolysis'),
        category: 'power_generation',
        era: 'solar',
        path: ['truepath'],
        reqs: { titan: 2, enceladus: 1 },
        grant: ['titan',3],
        cost: {
            Knowledge(){ return 465000; },
        },
        effect(){ return loc('tech_electrolysis_effect',[planetName().titan, global.resource.Water.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.titan_quarters);
                initStruct(actions.space.spc_titan.titan_mine);
                return true;
            }
            return false;
        },
    },
    storehouse: {
        id: 'tech-storehouse',
        title(){ return loc('tech_storehouse',[planetName().titan]); },
        desc(){ return loc('tech_storehouse',[planetName().titan]); },
        category: 'storage',
        era: 'solar',
        path: ['truepath'],
        reqs: { titan: 4 },
        grant: ['titan',5],
        cost: {
            Knowledge(){ return 500000; },
        },
        effect(){ return loc('tech_storehouse_effect',[planetName().titan]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.storehouse);
                return true;
            }
            return false;
        },
    },
    adamantite_vault_tp: {
        id: 'tech-adamantite_vault_tp',
        title: loc('tech_adamantite_vault'),
        desc: loc('tech_adamantite_vault'),
        category: 'banking',
        era: 'solar',
        path: ['truepath'],
        reqs: { vault: 2, titan: 4 },
        grant: ['vault',3],
        cost: {
            Money(){ return 2000000; },
            Knowledge(){ return 560000; },
            Adamantite(){ return 20000; }
        },
        effect: loc('tech_adamantite_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    titan_bank: {
        id: 'tech-titan_bank',
        title(){ return loc('tech_titan_bank',[planetName().titan]); },
        desc(){ return loc('tech_titan_bank',[planetName().titan]); },
        category: 'storage',
        era: 'solar',
        path: ['truepath'],
        reqs: { titan: 5 },
        grant: ['titan',6],
        cost: {
            Knowledge(){ return 600000; },
        },
        effect(){ return loc('tech_titan_bank_effect',[planetName().titan]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.titan_bank);
                return true;
            }
            return false;
        },
    },
    hydrogen_plant: {
        id: 'tech-hydrogen_plant',
        title: loc('tech_hydrogen_plant'),
        desc: loc('tech_hydrogen_plant'),
        category: 'power_generation',
        era: 'solar',
        path: ['truepath'],
        reqs: { titan: 4, stanene: 1 },
        grant: ['titan_power',1],
        cost: {
            Knowledge(){ return 550000; },
        },
        effect(){ return loc('tech_hydrogen_plant_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.hydrogen_plant);
                return true;
            }
            return false;
        },
    },
    water_mining: {
        id: 'tech-water_mining',
        title: loc('tech_water_mining'),
        desc: loc('tech_water_mining'),
        category: 'power_generation',
        era: 'solar',
        path: ['truepath'],
        reqs: { titan: 2, enceladus: 1 },
        grant: ['enceladus',2],
        cost: {
            Knowledge(){ return 450000; },
        },
        effect(){ return loc('tech_water_mining_effect',[
            planetName().enceladus, 
            races[global.race.species].home,
            global.resource.Water.name
        ]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_enceladus.water_freighter);
                return true;
            }
            return false;
        },
    },
    mercury_smelting: {
        id: 'tech-mercury_smelting',
        title: loc('tech_mercury_smelting'),
        desc: loc('tech_mercury_smelting'),
        category: 'mining',
        era: 'solar',
        path: ['truepath'],
        reqs: { hell: 1, titan: 4, smelting: 6 },
        grant: ['m_smelting',1],
        cost: {
            Knowledge(){ return 625000; },
            Adamantite(){ return 50000; }
        },
        effect(){ return loc('tech_mercury_smelting_effect',[planetName().hell]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_hell.hell_smelter);
                return true;
            }
            return false;
        }
    },
    iridium_smelting: {
        id: 'tech-iridium_smelting',
        title: loc('tech_iridium_smelting'),
        desc: loc('tech_iridium_smelting'),
        category: 'mining',
        era: 'solar',
        path: ['truepath'],
        reqs: { m_smelting: 1, graphene: 1 },
        grant: ['m_smelting',2],
        cost: {
            Knowledge(){ return 825000; },
            Graphene(){ return 125000; }
        },
        effect: loc('tech_iridium_smelting_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_crates: {
        id: 'tech-adamantite_crates',
        title: loc('tech_adamantite_crates'),
        desc: loc('tech_adamantite_crates_desc'),
        category: 'storage',
        era: 'solar',
        path: ['truepath'],
        reqs: { container: 5, titan: 4 },
        grant: ['container',6],
        cost: {
            Knowledge(){ return 525000; },
            Adamantite(){ return 12500; }
        },
        effect: loc('tech_adamantite_crates_effect'),
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    bolognium_crates_tp: {
        id: 'tech-bolognium_crates_tp',
        title(){ return loc('tech_crates',[global.resource.Bolognium.name]); },
        desc(){ return loc('tech_crates',[global.resource.Bolognium.name]); },
        category: 'storage',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { container: 7, tauceti: 4 },
        grant: ['container',8],
        cost: {
            Knowledge(){ return 6160000; },
            Bolognium(){ return 750000; }
        },
        effect(){ return loc('tech_bolognium_crates_effect',[global.resource.Bolognium.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_containers_tp: {
        id: 'tech-adamantite_containers_tp',
        title(){ return loc('tech_containers',[global.resource.Adamantite.name]); },
        desc(){ return loc('tech_adamantite_containers_desc',[global.resource.Adamantite.name]); },
        category: 'storage',
        era: 'solar',
        path: ['truepath'],
        reqs: { steel_container: 4, titan: 4 },
        grant: ['steel_container',5],
        cost: {
            Knowledge(){ return 575000; },
            Adamantite(){ return 17500; }
        },
        effect(){ return loc('tech_adamantite_containers_effect',[global.resource.Adamantite.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    quantium_containers: {
        id: 'tech-quantium_containers',
        title(){ return loc('tech_containers',[global.resource.Quantium.name]); },
        desc(){ return loc('tech_containers',[global.resource.Quantium.name]); },
        category: 'storage',
        era: 'solar',
        path: ['truepath'],
        reqs: { steel_container: 5, quantium: 1 },
        grant: ['steel_container',6],
        cost: {
            Knowledge(){ return 1150000; },
            Quantium(){ return 100000; }
        },
        effect(){ return loc('tech_quantium_containers_effect',[global.resource.Quantium.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    unobtainium_containers: {
        id: 'tech-unobtainium_containers',
        title(){ return loc('tech_containers',[global.resource.Unobtainium.name]); },
        desc(){ return loc('tech_containers',[global.resource.Unobtainium.name]); },
        category: 'storage',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { steel_container: 6, tau_red: 7 },
        grant: ['steel_container',7],
        cost: {
            Knowledge(){ return 7250000; },
            Unobtainium(){ return 7500; }
        },
        effect(){ return loc('tech_bolognium_containers_effect',[global.resource.Unobtainium.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    reinforced_shelving: {
        id: 'tech-reinforced_shelving',
        title: loc('tech_reinforced_shelving'),
        desc: loc('tech_reinforced_shelving'),
        category: 'storage',
        era: 'solar',
        path: ['truepath'],
        reqs: { graphene: 1, titan: 5 },
        grant: ['shelving',1],
        cost: {
            Knowledge(){ return 850000; },
            Adamantite(){ return 350000; },
            Graphene(){ return 250000; }
        },
        effect: loc('tech_reinforced_shelving_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    garage_shelving: {
        id: 'tech-garage_shelving',
        title: loc('tech_garage_shelving'),
        desc: loc('tech_garage_shelving'),
        category: 'storage',
        era: 'solar',
        path: ['truepath'],
        reqs: { shelving: 1, quantium: 1 },
        grant: ['shelving',2],
        cost: {
            Knowledge(){ return 1250000; },
            Quantium(){ return 75000; }
        },
        effect: loc('tech_garage_shelving_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    warehouse_shelving: {
        id: 'tech-warehouse_shelving',
        title: loc('tech_warehouse_shelving'),
        desc: loc('tech_warehouse_shelving'),
        category: 'storage',
        era: 'solar',
        path: ['truepath'],
        reqs: { shelving: 2, quantium: 1, outer: 4 },
        grant: ['shelving',3],
        cost: {
            Knowledge(){ return 2250000; },
            Quantium(){ return 1000000; },
            Cipher(){ return 25000; }
        },
        effect: loc('tech_warehouse_shelving_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elerium_extraction: {
        id: 'tech-elerium_extraction',
        title: loc('tech_elerium_extraction'),
        desc: loc('tech_elerium_extraction'),
        category: 'mining',
        era: 'solar',
        path: ['truepath'],
        reqs: { kuiper: 1 },
        grant: ['kuiper',2],
        cost: {
            Knowledge(){ return 2500000; },
            Orichalcum(){ return 100000; },
            Cipher(){ return 12000; }
        },
        effect(){ return loc('tech_elerium_extraction_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_kuiper.elerium_mine);
                return true;
            }
            return false;
        }
    },
    orichalcum_panels_tp: {
        id: 'tech-orichalcum_panels_tp',
        title: loc('tech_orichalcum_panels'),
        desc: loc('tech_orichalcum_panels'),
        category: 'power_generation',
        era: 'solar',
        path: ['truepath'],
        reqs: { kuiper: 1, swarm: 5 },
        grant: ['swarm',6],
        cost: {
            Knowledge(){ return 2400000; },
            Orichalcum(){ return 125000; }
        },
        effect(){ return loc('tech_orichalcum_panels_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    shipyard: {
        id: 'tech-shipyard',
        title(){ return loc('tech_shipyard',[planetName().dwarf]); },
        desc(){ return loc('tech_shipyard',[planetName().dwarf]); },
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { outer: 1, syndicate: 1 },
        grant: ['shipyard',1],
        cost: {
            Knowledge(){ return 420000; }
        },
        effect(){ return loc('tech_shipyard_effect',[planetName().dwarf]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_dwarf.shipyard);
                setOrbits();
                return true;
            }
            return false;
        },
    },
    ship_lasers: {
        id: 'tech-ship_lasers',
        title: loc('tech_ship_lasers'),
        desc: loc('tech_ship_lasers'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { military: 7, syard_weapon: 1 },
        grant: ['syard_weapon',2],
        cost: {
            Knowledge(){ return 425000; },
            Elerium(){ return 500; }
        },
        effect: loc('tech_ship_lasers_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pulse_lasers: {
        id: 'tech-pulse_lasers',
        title: loc('tech_pulse_lasers'),
        desc: loc('tech_pulse_lasers'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { syard_weapon: 2 },
        grant: ['syard_weapon',3],
        cost: {
            Knowledge(){ return 500000; },
            Elerium(){ return 750; }
        },
        effect: loc('tech_pulse_lasers_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_plasma: {
        id: 'tech-ship_plasma',
        title: loc('tech_ship_plasma'),
        desc: loc('tech_ship_plasma'),
        category: 'space_militarization',
        era: 'solar',
        reqs: { high_tech: 13, syard_weapon: 3 },
        grant: ['syard_weapon',4],
        path: ['truepath'],
        cost: {
            Knowledge(){ return 880000; },
            Elerium(){ return 2500; }
        },
        effect: loc('tech_ship_plasma_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_phaser: {
        id: 'tech-ship_phaser',
        title: loc('tech_ship_phaser'),
        desc: loc('tech_ship_phaser'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { syard_weapon: 4, quantium: 1 },
        grant: ['syard_weapon',5],
        cost: {
            Knowledge(){ return 1225000; },
            Quantium(){ return 75000; }
        },
        effect: loc('tech_ship_phaser_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_disruptor: {
        id: 'tech-ship_disruptor',
        title: loc('tech_ship_disruptor'),
        desc: loc('tech_ship_disruptor'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { syard_weapon: 5, outer: 4 },
        grant: ['syard_weapon',6],
        cost: {
            Knowledge(){ return 2000000; },
            Cipher(){ return 25000; }
        },
        effect: loc('tech_ship_disruptor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    destroyer_ship: {
        id: 'tech-destroyer_ship',
        title: loc('tech_destroyer_ship'),
        desc: loc('tech_destroyer_ship'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { syard_class: 2 },
        grant: ['syard_class',3],
        cost: {
            Knowledge(){ return 465000; }
        },
        effect: loc('tech_destroyer_ship_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    cruiser_ship_tp: {
        id: 'tech-cruiser_ship_tp',
        title: loc('tech_cruiser_ship'),
        desc: loc('tech_cruiser_ship'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { syard_class: 3, titan: 4 },
        grant: ['syard_class',4],
        cost: {
            Knowledge(){ return 750000; },
            Adamantite(){ return 50000; }
        },
        effect: loc('tech_cruiser_ship_tp'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    h_cruiser_ship: {
        id: 'tech-h_cruiser_ship',
        title: loc('tech_h_cruiser_ship'),
        desc: loc('tech_h_cruiser_ship'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { syard_class: 4, triton: 1 },
        grant: ['syard_class',5],
        cost: {
            Knowledge(){ return 1500000; }
        },
        effect: loc('tech_h_cruiser_ship_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dreadnought_ship: {
        id: 'tech-dreadnought_ship',
        title: loc('tech_dreadnought_ship'),
        desc: loc('tech_dreadnought_ship'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { syard_class: 5, kuiper: 1 },
        grant: ['syard_class',6],
        cost: {
            Knowledge(){ return 2500000; },
            Cipher(){ return 10000; }
        },
        effect: loc('tech_dreadnought_ship_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pulse_engine: {
        id: 'tech-pulse_engine',
        title: loc('outer_shipyard_engine_pulse'),
        desc: loc('outer_shipyard_engine_pulse'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { syard_engine: 2, stanene: 1 },
        grant: ['syard_engine',3],
        cost: {
            Knowledge(){ return 555000; },
            Stanene(){ return 250000; }
        },
        effect: loc('tech_pulse_engine_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    photon_engine: {
        id: 'tech-photon_engine',
        title: loc('outer_shipyard_engine_photon'),
        desc: loc('outer_shipyard_engine_photon'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { syard_engine: 3, quantium: 1 },
        grant: ['syard_engine',4],
        cost: {
            Knowledge(){ return 1150000; },
            Quantium(){ return 50000; }
        },
        effect: loc('tech_photon_engine_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    vacuum_drive: {
        id: 'tech-vacuum_drive',
        title: loc('outer_shipyard_engine_vacuum'),
        desc: loc('outer_shipyard_engine_vacuum'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { syard_engine: 4, outer: 4 },
        grant: ['syard_engine',5],
        cost: {
            Knowledge(){ return 1850000; },
            Cipher(){ return 10000; }
        },
        effect: loc('outer_shipyard_engine_vacuum_desc'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_fusion: {
        id: 'tech-ship_fusion',
        title: loc('tech_fusion_generator'),
        desc: loc('tech_fusion_generator'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { syard_power: 3, quantium: 1 },
        grant: ['syard_power',4],
        cost: {
            Knowledge(){ return 1100000; },
            Quantium(){ return 65000; }
        },
        effect: loc('tech_fusion_generator_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_elerium: {
        id: 'tech-ship_elerium',
        title: loc('tech_elerium_generator'),
        desc: loc('tech_elerium_generator'),
        category: 'space_militarization',
        era: 'solar',
        path: ['truepath'],
        reqs: { syard_power: 4, outer: 4 },
        grant: ['syard_power',5],
        cost: {
            Knowledge(){ return 1900000; },
            Cipher(){ return 18000; }
        },
        effect: loc('tech_elerium_generator_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    quantum_signatures: {
        id: 'tech-quantum_signatures',
        title: loc('tech_quantum_signatures'),
        desc: loc('tech_quantum_signatures'),
        category: 'progress',
        era: 'solar',
        path: ['truepath'],
        reqs: { quantium: 1, syard_sensor: 3 },
        grant: ['syard_sensor',4],
        cost: {
            Knowledge(){ return 1050000; },
            Quantium(){ return 10000; }
        },
        effect: loc('tech_quantum_signatures_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    interstellar_drive: {
        id: 'tech-interstellar_drive',
        title: loc('tech_interstellar_drive'),
        desc: loc('tech_interstellar_drive'),
        category: 'progress',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { outer: 8, titan_ai_core: 2, syard_sensor: 4 },
        grant: ['tauceti',1],
        cost: {
            Knowledge(){ return 4500000; },
            Quantium(){ return 250000; },
            Cipher(){ return 75000; }
        },
        effect: loc('tech_interstellar_drive_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    alien_outpost: {
        id: 'tech-alien_outpost',
        title: loc('tech_alien_outpost'),
        desc: loc('tech_alien_outpost'),
        category: 'science',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tauceti: 2, tau_home: 3 },
        grant: ['tau_home',4],
        cost: {
            Knowledge(){ return 5000000; },
            Cipher(){ return 100000; }
        },
        effect: loc('tech_alien_outpost_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.alien_outpost);
                initStruct(actions.tauceti.tau_home.jump_gate);
                initStruct(actions.space.spc_sun.jump_gate);
                messageQueue(loc('tech_alien_outpost_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    jumpgates: {
        id: 'tech-jumpgates',
        title: loc('tech_jumpgates'),
        desc: loc('tech_jumpgates'),
        category: 'progress',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tauceti: 2, tau_home: 4 },
        grant: ['tauceti',3],
        cost: {
            Knowledge(){ return 6000000; }
        },
        effect: loc('tech_jumpgates_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    system_survey: {
        id: 'tech-system_survey',
        title: loc('tech_system_survey'),
        desc: loc('tech_system_survey'),
        category: 'progress',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tauceti: 4, womling_tech: 1 },
        grant: ['tauceti',5],
        cost: {
            Knowledge(){ return 7000000; }
        },
        effect: loc('tech_system_survey_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.tau.roid = true;
                global.settings.tau.gas = true;
                initStruct(actions.tauceti.tau_roid.patrol_ship);
                return true;
            }
            return false;
        }
    },
    repository: {
        id: 'tech-repository',
        title: loc('tech_repository'),
        desc: loc('tech_repository'),
        category: 'storage',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tauceti: 4, tau_home: 4 },
        grant: ['tau_home',5],
        cost: {
            Knowledge(){ return 6500000; }
        },
        effect: loc('tech_repository_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.repository);
                return true;
            }
            return false;
        }
    },
    fusion_generator: {
        id: 'tech-fusion_generator',
        title: loc('tech_fusion_power'),
        desc: loc('tech_fusion_power'),
        category: 'power_generation',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_home: 5 },
        grant: ['tau_home',6],
        cost: {
            Knowledge(){ return 6750000; }
        },
        effect: loc('tech_tau_fusion_power_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.fusion_generator);
                return true;
            }
            return false;
        }
    },
    tau_cultivation: {
        id: 'tech-tau_cultivation',
        title: loc('tech_tau_cultivation'),
        desc: loc('tech_tau_cultivation'),
        category: 'agriculture',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_home: 6 },
        grant: ['tau_home',7],
        cost: {
            Knowledge(){ return 6900000; }
        },
        effect(){ return loc('tech_tau_cultivation_effect',[races[global.race.species].home]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.tau_farm);
                return true;
            }
            return false;
        }
    },
    tau_manufacturing: {
        id: 'tech-tau_manufacturing',
        title: loc('tech_tau_manufacturing'),
        desc: loc('tech_tau_manufacturing'),
        category: 'crafting',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_home: 7 },
        grant: ['tau_home',8],
        cost: {
            Knowledge(){ return 7250000; }
        },
        effect(){ return loc('tech_tau_manufacturing_effect',[races[global.race.species].home]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.tau_factory);
                return true;
            }
            return false;
        }
    },
    weasels: {
        id: 'tech-weasels',
        title: loc('tech_weasels'),
        desc: loc('tech_weasels'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_red: 2 },
        grant: ['tau_red',3],
        cost: {
            Knowledge(){ return 6250000; }
        },
        effect(){ return loc('tech_weasels_effect',[loc('tau_planet',[planetName().red])]); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_weasels_msg',[loc('tau_planet',[planetName().red])]),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    jeff: {
        id: 'tech-jeff',
        title: loc('tech_jeff'),
        desc: loc('tech_jeff'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_red: 3 },
        grant: ['tau_red',4],
        cost: {
            Knowledge(){ return 6380000; }
        },
        effect(){ return loc('tech_jeff_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_jeff_effect_msg',[]),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    womling_fun: {
        id: 'tech-womling_fun',
        title: loc('tech_womling_fun'),
        desc: loc('tech_womling_fun'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_red: 5 },
        grant: ['tau_red',6],
        cost: {
            Knowledge(){ return 6650000; }
        },
        effect(){ return loc('tech_womling_fun_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    womling_lab: {
        id: 'tech-womling_lab',
        title: loc('tech_womling_lab'),
        desc: loc('tech_womling_lab'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_red: 6 },
        grant: ['tau_red',7],
        cost: {
            Knowledge(){ return 6900000; }
        },
        effect(){ return loc('tech_womling_lab_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_red.womling_lab);
                global.tech['womling_tech'] = 0;
                return true;
            }
            return false;
        }
    },
    womling_mining: {
        id: 'tech-womling_mining',
        title: loc('tech_womling_mining'),
        desc: loc('tech_womling_mining'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { womling_tech: 1 },
        grant: ['womling_mining',1],
        cost: {
            Knowledge(){ return 7100000; }
        },
        effect(){ return loc('tech_womling_mining_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    womling_firstaid: {
        id: 'tech-womling_firstaid',
        title: loc('tech_womling_firstaid'),
        desc: loc('tech_womling_firstaid'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { womling_tech: 2 },
        grant: ['womling_firstaid',1],
        cost: {
            Knowledge(){ return 7350000; }
        },
        effect(){ return loc('tech_womling_firstaid_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    womling_logistics: {
        id: 'tech-womling_logistics',
        title: loc('tech_womling_logistics'),
        desc: loc('tech_womling_logistics'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { womling_tech: 3 },
        grant: ['womling_logistics',1],
        cost: {
            Knowledge(){ return 7650000; }
        },
        effect(){ return loc('tech_womling_logistics_effect',[loc('tau_red_orbital_platform')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    womling_repulser: {
        id: 'tech-womling_repulser',
        title: loc('tech_womling_repulser'),
        desc: loc('tech_womling_repulser'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { womling_tech: 4, womling_logistics: 1 },
        grant: ['womling_logistics',2],
        cost: {
            Knowledge(){ return 7900000; }
        },
        effect(){ return loc('tech_womling_repulser_effect',[global.resource.Oil.name,loc('tau_red_orbital_platform')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    womling_farming: {
        id: 'tech-womling_farming',
        title: loc('tech_womling_farming'),
        desc: loc('tech_womling_farming'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { womling_tech: 5 },
        grant: ['womling_pop',1],
        cost: {
            Knowledge(){ return 8200000; }
        },
        effect(){ return loc('tech_womling_farming_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    womling_housing: {
        id: 'tech-womling_housing',
        title: loc('tech_womling_housing'),
        desc: loc('tech_womling_housing'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { womling_tech: 6, womling_pop: 1 },
        grant: ['womling_pop',2],
        cost: {
            Knowledge(){ return 8500000; }
        },
        effect(){ return loc('tech_womling_housing_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    womling_support: {
        id: 'tech-womling_support',
        title: loc('tech_womling_support'),
        desc: loc('tech_womling_support'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { womling_tech: 7, tau_gas: 4 },
        grant: ['womling_technicians',1],
        cost: {
            Knowledge(){ return 8850000; }
        },
        effect(){ return `<div>${loc('tech_womling_support_effect')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_gas.womling_station);
                return true;
            }
            return false;
        }
    },
    womling_recycling: {
        id: 'tech-womling_recycling',
        title: loc('tech_womling_recycling'),
        desc: loc('tech_womling_recycling'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { womling_tech: 8 },
        grant: ['womling_recycling',1],
        cost: {
            Knowledge(){ return 9550000; }
        },
        effect(){ return `<div>${loc('tech_womling_recycling_effect')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    asteroid_analysis: {
        id: 'tech-asteroid_analysis',
        title: loc('tech_asteroid_analysis'),
        desc: loc('tech_asteroid_analysis'),
        category: 'progress',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_roid: 1 },
        grant: ['tau_roid',2],
        cost: {
            Knowledge(){ return 7350000; }
        },
        effect(){ return loc('tech_asteroid_analysis_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_asteroid_analysis_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    shark_repellent: {
        id: 'tech-shark_repellent',
        title: loc('tech_shark_repellent'),
        desc: loc('tech_shark_repellent'),
        category: 'progress',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_roid: 2 },
        grant: ['tau_roid',3],
        cost: {
            Knowledge(){ return 7400000; }
        },
        effect(){ return loc('tech_shark_repellent_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_shark_repellent_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    belt_mining: {
        id: 'tech-belt_mining',
        title: loc('tech_belt_mining'),
        desc: loc('tech_belt_mining'),
        category: 'space_mining',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_gas: 3, tau_roid: 3 },
        grant: ['tau_gas',4],
        cost: {
            Knowledge(){ return 7650000; }
        },
        effect(){ return loc('tech_belt_mining_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_gas.ore_refinery);
                initStruct(actions.tauceti.tau_roid.mining_ship);
                return true;
            }
            return false;
        }
    },
    adv_belt_mining: {
        id: 'tech-adv_belt_mining',
        title: loc('tech_adv_belt_mining'),
        desc: loc('tech_adv_belt_mining'),
        category: 'space_mining',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_roid: 4 },
        grant: ['tau_roid',5],
        cost: {
            Knowledge(){ return 7900000; }
        },
        effect(){ return loc('tech_adv_belt_mining_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    space_whaling: {
        id: 'tech-space_whaling',
        title: loc('tech_space_whaling'),
        desc: loc('tech_space_whaling'),
        category: 'whaling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_gas: 3, tau_roid: 3 },
        grant: ['tau_whale',1],
        cost: {
            Knowledge(){ return 7500000; }
        },
        effect(){ return loc('tech_space_whaling_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_gas.whaling_station);
                initStruct(actions.tauceti.tau_roid.whaling_ship);
                return true;
            }
            return false;
        }
    },
    infectious_disease_lab: {
        id: 'tech-infectious_disease_lab',
        title(){ return loc(global.race['artifical'] ? 'tech_infectious_disease_lab_s' : 'tech_infectious_disease_lab'); },
        desc(){ return loc(global.race['artifical'] ? 'tech_infectious_disease_lab_s' : 'tech_infectious_disease_lab'); },
        category: 'science',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { plague: 2 },
        grant: ['disease',1],
        cost: {
            Knowledge(){ return 8250000; }
        },
        effect(){ return loc(global.race['artifical'] ? 'tech_infectious_disease_lab_effect_s' : 'tech_infectious_disease_lab_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.infectious_disease_lab);
                return true;
            }
            return false;
        }
    },
    isolation_protocol: {
        id: 'tech-isolation_protocol',
        title: loc('tech_isolation_protocol'),
        desc: loc('tech_isolation_protocol'),
        category: 'plague',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { disease: 2 },
        grant: ['disease',3],
        not_trait: ['lone_survivor'],
        cost: {
            Knowledge(){ return 8500000; }
        },
        effect(){ return `<div>${loc('tech_isolation_protocol_effect',[loc('tab_tauceti')])}</div><div class="has-text-special">${loc('tech_isolation_protocol_warning')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                if (!global['sim']){
                    save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
                }
                global.tech['isolation'] = 1;
                jumpGateShutdown();
                return true;
            }
            return false;
        }
    },
    focus_cure: {
        id: 'tech-focus_cure',
        title: loc('tech_focus_cure'),
        desc: loc('tech_focus_cure'),
        category: 'plague',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { disease: 2 },
        grant: ['disease',3],
        not_trait: ['lone_survivor'],
        cost: {
            Knowledge(){ return 8500000; }
        },
        effect(){ return `<div>${loc('tech_focus_cure_effect',[loc('tab_tauceti')])}</div><div class="has-text-special">${loc('tech_focus_cure_warning')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                global.tech['focus_cure'] = 1;
                return true;
            }
            return false;
        }
    },
    decode_virus: {
        id: 'tech-decode_virus',
        title: loc('tech_decode_virus'),
        desc: loc('tech_decode_virus'),
        category: 'plague',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { focus_cure: 1 },
        grant: ['focus_cure',2],
        cost: {
            Knowledge(){ return 9000000; }
        },
        effect(){ return `<div>${loc(global.race['artifical'] ? 'tech_decode_virus_effect_s' : 'tech_decode_virus_effect')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                if (global.race['artifical']){
                    messageQueue(loc('tech_decode_virus_msg1s',[actions.tauceti.tau_home.infectious_disease_lab.title()]),'info',false,['progress']);
                }
                else {
                    messageQueue(loc('tech_decode_virus_msg1',[actions.tauceti.tau_home.infectious_disease_lab.title()]),'info',false,['progress']);
                }
                return true;
            }
            return false;
        }
    },
    vaccine_campaign: {
        id: 'tech-vaccine_campaign',
        title: loc('tech_vaccine_campaign'),
        desc: loc('tech_vaccine_campaign'),
        category: 'plague',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { focus_cure: 3 },
        grant: ['focus_cure',4],
        cost: {
            Knowledge(){ return 9250000; }
        },
        effect(){
            let struct = global.race['artifical'] ? actions.city.boot_camp.title() : actions.city.hospital.title;
            return `<div>${loc('tech_vaccine_campaign_effect',[struct])}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.race['vax'] = 0;
                return true;
            }
            return false;
        }
    },
    vax_strat1: {
        id: 'tech-vax_strat1',
        title: loc('tech_vax_strat1'),
        desc: loc('tech_vax_strat1'),
        category: 'plague',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { focus_cure: 5 },
        grant: ['focus_cure',6],
        cost: {
            Knowledge(){ return 9500000; }
        },
        effect(){
            return `<div>${loc('tech_vax_strat1_effect')}</div><div class="has-text-special">${loc('tech_vax_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['vax_p'] = 1;
                messageQueue(loc('tech_vax_strat1_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    vax_strat2: {
        id: 'tech-vax_strat2',
        title: loc('tech_vax_strat2'),
        desc: loc('tech_vax_strat2'),
        category: 'plague',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { focus_cure: 5 },
        grant: ['focus_cure',6],
        cost: {
            Knowledge(){ return 9500000; }
        },
        effect(){
            return `<div>${loc('tech_vax_strat2_effect')}</div><div class="has-text-special">${loc('tech_vax_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['vax_f'] = 1;
                messageQueue(loc('tech_vax_strat2_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    vax_strat3: {
        id: 'tech-vax_strat3',
        title: loc('tech_vax_strat3'),
        desc: loc('tech_vax_strat3'),
        category: 'plague',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { focus_cure: 5 },
        grant: ['focus_cure',6],
        cost: {
            Knowledge(){ return 9500000; }
        },
        effect(){
            return `<div>${loc('tech_vax_strat3_effect')}</div><div class="has-text-special">${loc('tech_vax_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['vax_s'] = 1;
                messageQueue(loc('tech_vax_strat3_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    vax_strat4: {
        id: 'tech-vax_strat4',
        title: loc('tech_vax_strat4'),
        desc: loc('tech_vax_strat4'),
        category: 'plague',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { focus_cure: 5 },
        grant: ['focus_cure',6],
        cost: {
            Knowledge(){ return 9500000; }
        },
        effect(){
            return `<div>${loc('tech_vax_strat4_effect')}</div><div class="has-text-special">${loc('tech_vax_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['vax_c'] = 1;
                messageQueue(loc('tech_vax_strat4_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    cloning: {
        id: 'tech-cloning',
        title: loc('tech_cloning'),
        desc: loc('tech_cloning'),
        category: 'housing',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { focus_cure: 7 },
        grant: ['cloning',1],
        cost: {
            Knowledge(){ return 9750000; }
        },
        effect(){
            return `<div>${loc(global.race['artifical'] ? 'tech_cloning_effect_s' : 'tech_cloning_effect')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.cloning_facility);
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        }
    },
    clone_degradation: {
        id: 'tech-clone_degradation',
        title: loc('tech_clone_degradation'),
        desc: loc('tech_clone_degradation'),
        category: 'progress',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { cloning: 1 },
        grant: ['cloning',2],
        cost: {
            Knowledge(){ return 10000000; }
        },
        effect(){
            return `<div>${loc('tech_clone_degradation_effect')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_clone_degradation_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    digital_paradise: {
        id: 'tech-digital_paradise',
        title: loc('tech_digital_paradise'),
        desc: loc('tech_digital_paradise'),
        category: 'progress',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { cloning: 2 },
        grant: ['matrix',1],
        cost: {
            Knowledge(){ return 10500000; },
            Cipher(){ return 200000; }
        },
        effect(){
            return `<div>${loc('tech_digital_paradise_effect')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ringworld: {
        id: 'tech-ringworld',
        title: loc('tech_ringworld'),
        desc: loc('tech_ringworld'),
        category: 'progress',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { matrix: 1 },
        grant: ['matrix',2],
        cost: {
            Money(){ return 3000000000; },
            Knowledge(){ return 11000000; }
        },
        effect(){
            return `<div>${loc('tech_ringworld_effect')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.settings.tau.star = true;
                initStruct(actions.tauceti.tau_star.ringworld);
                return true;
            }
            return false;
        }
    },
    iso_gambling: {
        id: 'tech-iso_gambling',
        title: loc('tech_iso_gambling'),
        desc: loc('tech_iso_gambling'),
        category: 'banking',
        era: 'tauceti',
        reqs: { gambling: 4, isolation: 1 },
        grant: ['iso_gambling',1],
        cost: {
            Knowledge(){ return 8650000; }
        },
        effect: loc('tech_iso_gambling_effect',[5]),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    outpost_boost: {
        id: 'tech-outpost_boost',
        title(){ return loc('tech_outpost_boost'); },
        desc(){ return loc('tech_outpost_boost'); },
        category: 'special',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_home: 4, isolation: 1 },
        grant: ['outpost_boost',1],
        cost: {
            Knowledge(){ return 8900000; },
        },
        effect(){ return loc('tech_outpost_boost_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_outpost_boost_flair'); }
    },
    cultural_center: {
        id: 'tech-cultural_center',
        title: loc('tech_cultural_center'),
        desc: loc('tech_cultural_center'),
        category: 'banking',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { iso_gambling: 1, isolation: 1 },
        grant: ['tau_culture',1],
        cost: {
            Knowledge(){ return 8850000; }
        },
        effect: loc('tech_cultural_center_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.tau_cultural_center);
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_cultural_center_flair'); }
    },
    outer_tau_survey: {
        id: 'tech-outer_tau_survey',
        title: loc('tech_outer_tau_survey'),
        desc: loc('tech_outer_tau_survey'),
        category: 'progress',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { outpost_boost: 1, plague: 5 },
        grant: ['tau_gas2',1],
        cost: {
            Knowledge(){ return 9100000; },
            Helium_3(){ return +int_fuel_adjust(5000000).toFixed(0); },
        },
        effect: loc('tech_outer_tau_survey_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.tau.gas2 = true;
                return true;
            }
            return false;
        }
    },
    alien_research: {
        id: 'tech-alien_research',
        title: loc('tech_alien_research'),
        desc: loc('tech_alien_research'),
        category: 'progress',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_gas2: 5 },
        grant: ['tau_gas2',6],
        cost: {
            Knowledge(){ return 9350000; }
        },
        effect: loc('tech_alien_research_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.tauceti.alien_space_station['decrypted'] = 0;
                global.tauceti.alien_space_station['focus'] = 95;
                messageQueue(loc('tech_alien_research_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    womling_gene_therapy: {
        id: 'tech-womling_gene_therapy',
        title: loc('tech_womling_gene_therapy'),
        desc: loc('tech_womling_gene_therapy'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { alien_data: 1 },
        grant: ['womling_gene',1],
        cost: {
            Knowledge(){ return 9520000; }
        },
        effect: loc('tech_womling_gene_therapy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    food_culture: {
        id: 'tech-food_culture',
        title(){ return loc('tech_food_culture',[loc(`tau_gas2_alien_station_data2_r${global.race.tau_food_item || 0}`)]); },
        desc(){ return loc('tech_food_culture',[loc(`tau_gas2_alien_station_data2_r${global.race.tau_food_item || 0}`)]); },
        category: 'banking',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { alien_data: 2, tau_culture: 1 },
        grant: ['tau_culture',2],
        cost: {
            Knowledge(){ return 9410000; }
        },
        effect(){ return loc('tech_food_culture_effect',[loc(`tau_gas2_alien_station_data2_r${global.race.tau_food_item || 0}`),loc('tech_cultural_center')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    advanced_refinery: {
        id: 'tech-advanced_refinery',
        title: loc('tech_advanced_refinery'),
        desc: loc('tech_advanced_refinery'),
        category: 'space_mining',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { alien_data: 3 },
        grant: ['tau_ore_mining',1],
        cost: {
            Knowledge(){ return 9680000; }
        },
        effect(){ return loc('tech_advanced_refinery_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    advanced_pit_mining: {
        id: 'tech-advanced_pit_mining',
        title: loc('tech_advanced_pit_mining'),
        desc: loc('tech_advanced_pit_mining'),
        category: 'space_mining',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { alien_data: 3 },
        grant: ['tau_pit_mining',1],
        cost: {
            Knowledge(){ return 9720000; }
        },
        effect(){ return loc('tech_advanced_pit_mining_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    useless_junk: {
        id: 'tech-useless_junk',
        title: loc('tech_useless_junk'),
        desc: loc('tech_useless_junk'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { alien_data: 4 },
        grant: ['tau_junksale',1],
        cost: {
            Knowledge(){ return 9550000; }
        },
        effect(){ return loc('tech_useless_junk_effect',[loc(`tau_gas2_alien_station_data4_r${global.race.tau_junk_item || 0}`),loc(`tau_red_womlings`)]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    advanced_asteroid_mining: {
        id: 'tech-advanced_asteroid_mining',
        title: loc('tech_advanced_asteroid_mining'),
        desc: loc('tech_advanced_asteroid_mining'),
        category: 'space_mining',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { alien_data: 5, tau_ore_mining: 1 },
        grant: ['tau_ore_mining',2],
        cost: {
            Knowledge(){ return 9750000; }
        },
        effect(){ return loc('tech_advanced_asteroid_mining_effect',[loc(`tau_roid_mining_ship`)]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    advanced_material_synthesis: {
        id: 'tech-advanced_material_synthesis',
        title: loc('tech_advanced_material_synthesis'),
        desc: loc('tech_advanced_material_synthesis'),
        category: 'crafting',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { alien_data: 5, disease: 1 },
        grant: ['alien_crafting',1],
        cost: {
            Knowledge(){ return 9880000; }
        },
        effect(){ return loc('tech_advanced_material_synthesis_effect',[global.resource.Quantium.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    matrioshka_brain: {
        id: 'tech-matrioshka_brain',
        title: loc('tech_matrioshka_brain'),
        desc: loc('tech_matrioshka_brain'),
        category: 'progress',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { alien_data: 6, tau_gas2: 6 },
        grant: ['tau_gas2',7],
        not_trait: ['lone_survivor'],
        cost: {
            Knowledge(){ return 10000000; }
        },
        effect(){ return loc('tech_matrioshka_brain_effect',[actions.tauceti.tau_gas2.info.name()]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_gas2.matrioshka_brain);
                return true;
            }
            return false;
        }
    },
    ignition_device: {
        id: 'tech-ignition_device',
        title: loc('tech_ignition_device'),
        desc: loc('tech_ignition_device'),
        category: 'progress',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { alien_data: 6, tau_gas2: 7 },
        grant: ['tau_gas2',8],
        cost: {
            Knowledge(){ return 10500000; }
        },
        effect(){ return loc('tech_ignition_device_effect',[actions.tauceti.tau_gas2.info.name()]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_gas2.ignition_device);
                if (!global.tauceti.hasOwnProperty('matrioshka_brain')){
                    initStruct(actions.tauceti.tau_gas2.matrioshka_brain);
                }
                return true;
            }
            return false;
        }
    },
    replicator: {
        id: 'tech-replicator',
        title(){ return global.race.universe === 'antimatter' ? loc('tech_antireplicator') : loc('tech_replicator'); },
        desc(){ return global.race.universe === 'antimatter' ? loc('tech_antireplicator') : loc('tech_replicator'); },
        category: 'special',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { tau_home: 4, isolation: 1},
        trait: ['lone_survivor'],
        grant: ['replicator',1],
        cost: {
            Knowledge(){ return 6250000; },
        },
        effect(){ return global.race.universe === 'antimatter' ? loc('tech_antireplicator_effect') : loc('tech_replicator_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.race['replicator'] = { res: 'Unobtainium', pow: 1 };
                return true;
            }
            return false;
        }
    },
    womling_unlock: {
        id: 'tech-womling_unlock',
        title: loc('tech_womling_unlock'),
        desc: loc('tech_womling_unlock'),
        category: 'womling',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { replicator: 1 },
        trait: ['lone_survivor'],
        grant: ['tau_red',4],
        cost: {
            Knowledge(){ return 6500000; }
        },
        effect(){ return loc('tech_womling_unlock_effect',[loc('tau_planet',[planetName().red])]); },
        action(){
            if (payCosts($(this)[0])){
                global.settings.tau.red = true;
                global.tauceti.orbital_platform.count = 1;
                global.tauceti.orbital_platform.on = 1;
                return true;
            }
            return false;
        }
    },
    garden_of_eden: {
        id: 'tech-garden_of_eden',
        title: loc('tech_garden_of_eden'),
        desc: loc('tech_garden_of_eden'),
        category: 'special',
        era: 'tauceti',
        path: ['truepath'],
        reqs: { eden: 1 },
        grant: ['eden',2],
        cost: {
            Knowledge(){ return 10000000; }
        },
        effect(){ return loc('tech_garden_of_eden_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_star.goe_facility);
                return true;
            }
            return false;
        }
    },
    asphodel_flowers: {
        id: 'tech-asphodel_flowers',
        title: loc('tech_asphodel_flowers'),
        desc: loc('tech_asphodel_flowers'),
        category: 'edenic',
        era: 'existential',
        reqs: { edenic: 4 },
        grant: ['asphodel',1],
        cost: {
            Knowledge(){ return 61000000; }
        },
        effect(){ return loc('tech_asphodel_flowers_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_asphodel_flowers_msg'),'info',false,['progress']);
                initStruct(actions.eden.eden_asphodel.asphodel_harvester);
                global.resource.Asphodel_Powder.display = true;
                return true;
            }
            return false;
        }
    },
    ghost_traps: {
        id: 'tech-ghost_traps',
        title: loc('tech_ghost_traps'),
        desc: loc('tech_ghost_traps'),
        category: 'edenic',
        era: 'existential',
        reqs: { asphodel: 1 },
        grant: ['asphodel',2],
        cost: {
            Knowledge(){ return 61250000; },
            Asphodel_Powder(){ return 2500; },
        },
        effect(){ return loc('tech_ghost_traps_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.ectoplasm_processor);
                return true;
            }
            return false;
        }
    },
    research_station: {
        id: 'tech-research_station',
        title: loc('tech_research_station'),
        desc: loc('tech_research_station'),
        category: 'science',
        era: 'existential',
        reqs: { asphodel: 2 },
        grant: ['asphodel',3],
        cost: {
            Knowledge(){ return 61650000; },
            Asphodel_Powder(){ return 5000; },
        },
        effect(){ return loc('tech_research_station_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.research_station);
                return true;
            }
            return false;
        }
    },
    soul_engine: {
        id: 'tech-soul_engine',
        title: loc('tech_soul_engine'),
        desc: loc('tech_soul_engine'),
        category: 'power_generation',
        era: 'existential',
        reqs: { asphodel: 3 },
        grant: ['asphodel',4],
        cost: {
            Knowledge(){ return 70000000; },
            Omniscience(){ return 1000; },
            Asphodel_Powder(){ return 12500; },
        },
        effect(){ return loc('tech_soul_engine_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.soul_engine);
                return true;
            }
            return false;
        }
    },
    railway_to_hell: {
        id: 'tech-railway_to_hell',
        title: loc('tech_railway_to_hell'),
        desc: loc('tech_railway_to_hell'),
        category: 'hell_dimension',
        era: 'existential',
        reqs: { asphodel: 4, hell_lake: 6 },
        grant: ['hell_lake',7],
        cost: {
            Knowledge(){ return 71250000; },
            Omniscience(){ return 5000; },
            Asphodel_Powder(){ return 15000; },
        },
        effect(){ return loc('tech_railway_to_hell_effect',[global.resource.Asphodel_Powder.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    purification: {
        id: 'tech-purification',
        title: loc('tech_purification'),
        desc: loc('tech_purification'),
        category: 'hell_dimension',
        era: 'existential',
        reqs: { asphodel: 4, hell_spire: 10 },
        grant: ['hell_spire',11],
        cost: {
            Knowledge(){ return 71250000; },
            Omniscience(){ return 5000; },
            Asphodel_Powder(){ return 17500; },
        },
        effect(){ return loc('tech_purification_effect',[global.resource.Asphodel_Powder.name,loc('portal_purifier_title'),2,loc('eden_asphodel_harvester_title')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    asphodel_mech: {
        id: 'tech-asphodel_mech',
        title: loc('tech_asphodel_mech'),
        desc: loc('tech_asphodel_mech'),
        category: 'military',
        era: 'existential',
        reqs: { asphodel: 5, military: 12 },
        grant: ['asphodel',6],
        cost: {
            Knowledge(){ return 72300000; },
            Omniscience(){ return 6000; },
        },
        effect(){ return loc('tech_asphodel_mech_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.mech_station);
                return true;
            }
            return false;
        }
    },
    asphodel_storage: {
        id: 'tech-asphodel_storage',
        title: loc('tech_asphodel_storage'),
        desc: loc('tech_asphodel_storage'),
        category: 'storage',
        era: 'existential',
        reqs: { asphodel: 6, },
        grant: ['asphodel',7],
        cost: {
            Knowledge(){ return 73000000; },
            Omniscience(){ return 6500; },
        },
        effect(){ return loc('tech_asphodel_storage_effect',[global.resource.Asphodel_Powder.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.warehouse);
                return true;
            }
            return false;
        }
    },
    asphodel_stabilizer: {
        id: 'tech-asphodel_stabilizer',
        title: loc('tech_asphodel_stabilizer'),
        desc: loc('tech_asphodel_stabilizer'),
        category: 'storage',
        era: 'existential',
        reqs: { asphodel: 7, },
        grant: ['asphodel',8],
        cost: {
            Knowledge(){ return 74000000; },
            Omniscience(){ return 10000; },
        },
        effect(){ return loc('tech_asphodel_stabilizer_effect',[global.resource.Asphodel_Powder.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.stabilizer);
                return true;
            }
            return false;
        }
    },
    edenic_bunker: {
        id: 'tech-edenic_bunker',
        title: loc('tech_edenic_bunker'),
        desc: loc('tech_edenic_bunker'),
        category: 'military',
        era: 'existential',
        reqs: { asphodel: 8, },
        grant: ['asphodel',9],
        cost: {
            Knowledge(){ return 77500000; },
            Omniscience(){ return 12000; },
        },
        effect(){ return loc('tech_edenic_bunker_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.bunker);
                return true;
            }
            return false;
        }
    },
    bliss_den: {
        id: 'tech-bliss_den',
        title: loc('tech_bliss_den'),
        desc: loc('tech_bliss_den'),
        category: 'entertainment',
        era: 'existential',
        reqs: { asphodel: 9, },
        grant: ['asphodel',10],
        cost: {
            Knowledge(){ return 90000000; },
            Omniscience(){ return 16666; },
        },
        effect(){ return loc('tech_bliss_den_effect',[global.resource.Asphodel_Powder.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.bliss_den);
                return true;
            }
            return false;
        }
    },
    hallowed_housing: {
        id: 'tech-hallowed_housing',
        title: loc('tech_hallowed_housing'),
        desc: loc('tech_hallowed_housing'),
        category: 'housing',
        era: 'existential',
        reqs: { asphodel: 10, theology: 2 },
        grant: ['asphodel',11],
        cost: {
            Knowledge(){ return 95000000; },
            Omniscience(){ return 19500; },
        },
        effect(){ return loc('tech_hallowed_housing_effect',[global.civic?.priest?.name || loc(`job_priest`),loc('eden_asphodel_name')]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.rectory);
                return true;
            }
            return false;
        }
    },
    outer_plane_study: {
        id: 'tech-outer_plane_study',
        title: loc('tech_outer_plane_study'),
        desc: loc('tech_outer_plane_study'),
        category: 'edenic',
        era: 'existential',
        reqs: { asphodel: 3, science: 22 },
        grant: ['elysium',1],
        cost: {
            Knowledge(){ return 75000000; },
            Omniscience(){ return 11655; },
        },
        effect(){ return loc('tech_outer_plane_study_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.rune_gate);
                initStruct(actions.eden.eden_asphodel.rune_gate_open);
                return true;
            }
            return false;
        }
    },
    camouflage: {
        id: 'tech-camouflage',
        title: loc('tech_camouflage'),
        desc: loc('tech_camouflage'),
        category: 'edenic',
        era: 'existential',
        reqs: { elysium: 3, },
        grant: ['celestial_warfare',1],
        cost: {
            Knowledge(){ return 83000000; },
            Omniscience(){ return 15000; },
            Asphodel_Powder(){ return 100000; }
        },
        effect(){ return loc('tech_camouflage_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    celestial_tactics: {
        id: 'tech-celestial_tactics',
        title: loc('tech_celestial_tactics'),
        desc: loc('tech_celestial_tactics'),
        category: 'military',
        era: 'existential',
        reqs: { celestial_warfare: 1, },
        condition(){
            return global.eden.hasOwnProperty('fortress') && global.eden.fortress.patrols <= 18 ? true : false;
        },
        grant: ['celestial_warfare',2],
        cost: {
            Knowledge(){ return 86000000; },
            Omniscience(){ return 17500; }
        },
        effect(){ return loc('tech_celestial_tactics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    active_camouflage: {
        id: 'tech-active_camouflage',
        title: loc('tech_active_camouflage'),
        desc: loc('tech_active_camouflage'),
        category: 'military',
        era: 'existential',
        reqs: { celestial_warfare: 2, },
        condition(){
            return global.eden.hasOwnProperty('fortress') && global.eden.fortress.armory < 100 ? true : false;
        },
        grant: ['celestial_warfare',3],
        cost: {
            Knowledge(){ return 89000000; },
            Omniscience(){ return 18750; }
        },
        effect(){ return loc('tech_active_camouflage_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    special_ops_training: {
        id: 'tech-special_ops_training',
        title: loc('tech_special_ops_training'),
        desc: loc('tech_special_ops_training'),
        category: 'military',
        era: 'existential',
        reqs: { celestial_warfare: 3, },
        condition(){
            return global.eden.hasOwnProperty('fortress') && global.eden.fortress.armory <= 80 && global.eden.fortress.patrols <= 15 ? true : false;
        },
        grant: ['celestial_warfare',4],
        cost: {
            Knowledge(){ return 92000000; },
            Omniscience(){ return 20000; }
        },
        effect(){ return loc('tech_special_ops_training_effect',[loc('eden_bunker_title')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    spectral_training: {
        id: 'tech-spectral_training',
        title: loc('tech_spectral_training'),
        desc: loc('tech_spectral_training'),
        category: 'military',
        era: 'existential',
        reqs: { celestial_warfare: 4, },
        grant: ['celestial_warfare',5],
        cost: {
            Knowledge(){ return 94500000; },
            Omniscience(){ return 21000; }
        },
        effect(){ return loc('tech_spectral_training_effect',[loc('eden_bunker_title')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elysanite_mining: {
        id: 'tech-elysanite_mining',
        title: loc('tech_elysanite_mining'),
        desc: loc('tech_elysanite_mining'),
        category: 'mining',
        era: 'existential',
        reqs: { elysium: 5 },
        grant: ['elysium',6],
        cost: {
            Knowledge(){ return 93000000; },
            Omniscience(){ return 18500; },
        },
        effect(){ return loc('tech_elysanite_mining_effect',[global.resource.Elysanite.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.elysanite_mine);
                global.resource.Elysanite.display = true;
                return true;
            }
            return false;
        }
    },
    sacred_smelter: {
        id: 'tech-sacred_smelter',
        title: loc('eden_sacred_smelter_title'),
        desc: loc('eden_sacred_smelter_title'),
        category: 'mining',
        era: 'existential',
        reqs: { elysium: 6 },
        grant: ['elysium',7],
        cost: {
            Knowledge(){ return 96000000; },
            Omniscience(){ return 19425; },
        },
        effect(){ return loc('tech_sacred_smelter_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.sacred_smelter);
                return true;
            }
            return false;
        }
    },
    fire_support_base: {
        id: 'tech-fire_support_base',
        title: loc('eden_fire_support_base_title'),
        desc: loc('eden_fire_support_base_title'),
        category: 'military',
        era: 'existential',
        reqs: { elysium: 7 },
        grant: ['elysium',8],
        cost: {
            Knowledge(){ return 100000000; },
            Omniscience(){ return 22500; },
        },
        effect(){ return loc('tech_fire_support_base_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.fire_support_base);
                return true;
            }
            return false;
        }
    },
    pillbox: {
        id: 'tech-pillbox',
        title: loc('eden_pillbox_title'),
        desc: loc('eden_pillbox_title'),
        category: 'military',
        era: 'existential',
        reqs: { elysium: 8 },
        grant: ['elysium',9],
        cost: {
            Knowledge(){ return 102500000; },
            Omniscience(){ return 23500; },
        },
        effect(){ return loc('tech_pillbox_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.pillbox);
                return true;
            }
            return false;
        }
    },
    elerium_cannon: {
        id: 'tech-elerium_cannon',
        title: loc('tech_elerium_cannon'),
        desc: loc('tech_elerium_cannon'),
        category: 'military',
        era: 'existential',
        reqs: { elysium: 9, isle: 1 },
        grant: ['elysium',10],
        cost: {
            Knowledge(){ return 105000000; },
            Omniscience(){ return 25000; },
            Steel(){ return 1000000000; },
            Nano_Tube(){ return 500000000; },
            Asphodel_Powder(){ return 250000; },
            Elysanite(){ return 100000000; },
            Soul_Gem(){ return 5000; },
        },
        effect(){ return loc('tech_elerium_cannon_effect',[loc('eden_fire_support_base_title')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elerium_containment: {
        id: 'tech-elerium_containment',
        title(){ return loc('eden_elerium_containment',[global.resource.Elerium.name]); },
        desc(){ return loc('eden_elerium_containment',[global.resource.Elerium.name]); },
        category: 'storage',
        era: 'existential',
        reqs: { elysium: 10 },
        grant: ['elysium',11],
        cost: {
            Knowledge(){ return 106500000; },
            Omniscience(){ return 26500; },
        },
        effect(){ return loc('tech_elerium_containment_effect',[global.resource.Elerium.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.elerium_containment);
                return true;
            }
            return false;
        }
    },
    ambrosia: {
        id: 'tech-ambrosia',
        title(){ return loc('tech_ambrosia'); },
        desc(){ return loc('tech_ambrosia'); },
        category: 'entertainment',
        era: 'existential',
        reqs: { elysium: 11 },
        grant: ['elysium',12],
        cost: {
            Knowledge(){ return 112000000; },
            Omniscience(){ return 28000; },
        },
        effect(){ return loc('tech_ambrosia_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.restaurant);
                return true;
            }
            return false;
        }
    },
    eternal_bank: {
        id: 'tech-eternal_bank',
        title(){ return loc('tech_eternal_bank'); },
        desc(){ return loc('tech_eternal_bank'); },
        category: 'banking',
        era: 'existential',
        reqs: { elysium: 12 },
        grant: ['elysium',13],
        cost: {
            Knowledge(){ return 115000000; },
            Omniscience(){ return 30000; },
        },
        effect(){ return loc('tech_eternal_bank_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.eternal_bank);
                return true;
            }
            return false;
        }
    },
    wisdom: {
        id: 'tech-wisdom',
        title(){ return loc('tech_wisdom'); },
        desc(){ return loc('tech_wisdom'); },
        category: 'science',
        era: 'existential',
        reqs: { elysium: 13 },
        grant: ['elysium',14],
        cost: {
            Knowledge(){ return 118000000; },
            Omniscience(){ return 32000; },
        },
        effect(){ return loc('tech_wisdom_effect',[loc('eden_elysium_name')]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.archive);
                return true;
            }
            return false;
        }
    },
    rushmore: {
        id: 'tech-rushmore',
        title(){ return loc('eden_rushmore',[races[global.race.species].name]); },
        desc(){ return loc('eden_rushmore',[races[global.race.species].name]); },
        category: 'entertainment',
        era: 'existential',
        reqs: { high_tech: 19, elysium: 15 },
        grant: ['elysium',16],
        cost: {
            Knowledge(){ return 125000000; },
            Omniscience(){ return 37250; },
        },
        effect(){ return loc('tech_rushmore_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.rushmore);
                return true;
            }
            return false;
        }
    },
    reincarnation: {
        id: 'tech-reincarnation',
        title(){ return loc('eden_reincarnation_title'); },
        desc(){ return loc('eden_reincarnation_title'); },
        category: 'housing',
        era: 'existential',
        reqs: { elysium: 16 },
        grant: ['elysium',17],
        cost: {
            Knowledge(){ return 130000000; },
            Omniscience(){ return 40000; },
        },
        effect(){ return loc('tech_reincarnation_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.reincarnation);
                return true;
            }
            return false;
        }
    },
    otherworldly_cement: {
        id: 'tech-otherworldly_cement',
        title(){ return loc('tech_otherworldly_cement',[global.resource.Cement.name]); },
        desc(){ return loc('tech_otherworldly_cement',[global.resource.Cement.name]); },
        category: 'housing',
        era: 'existential',
        reqs: { elysium: 17, cement: 7 },
        grant: ['cement', 8],
        not_trait: ['flier'],
        cost: {
            Knowledge(){ return 135000000; },
            Omniscience(){ return 42500; },
        },
        effect(){ return loc('tech_otherworldly_cement_effect',[global.resource.Cement.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.eden_cement);
                return true;
            }
            return false;
        }
    },
    ancient_crafters: {
        id: 'tech-ancient_crafters',
        title(){ return loc('tech_ancient_crafters'); },
        desc(){ return loc('tech_ancient_crafters'); },
        category: 'housing',
        era: 'existential',
        reqs: { elysium: 17 },
        grant: ['elysium',18],
        cost: {
            Knowledge(){ return 140000000; },
            Omniscience(){ return 44000; },
        },
        effect(){ return loc('tech_ancient_crafters_effect',[actions.eden.eden_elysium.sacred_smelter.title()]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    spirit_syphon: {
        id: 'tech-spirit_syphon',
        title: loc('tech_spirit_syphon'),
        desc: loc('tech_spirit_syphon'),
        category: 'edenic',
        era: 'existential',
        reqs: { high_tech: 19, isle: 3 },
        grant: ['isle',4],
        cost: {
            Knowledge(){ return 125000000; },
            Omniscience(){ return 35000; },
        },
        effect(){ return loc('tech_spirit_syphon_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_isle.spirit_vacuum);
                global.eden['palace'] = { energy: 1000000000000, rate: 0 };
                return true;
            }
            return false;
        }
    },
    spirit_capacitor: {
        id: 'tech-spirit_capacitor',
        title: loc('tech_spirit_capacitor'),
        desc: loc('tech_spirit_capacitor'),
        category: 'edenic',
        era: 'existential',
        reqs: { isle: 4 },
        grant: ['isle',5],
        cost: {
            Knowledge(){ return 128000000; },
            Omniscience(){ return 37500; },
        },
        effect(){ return loc('tech_spirit_capacitor_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_isle.spirit_battery);
                return true;
            }
            return false;
        }
    },
    suction_force: {
        id: 'tech-suction_force',
        title: loc('tech_suction_force'),
        desc: loc('tech_suction_force'),
        category: 'edenic',
        era: 'existential',
        reqs: { isle: 5 },
        grant: ['isle',6],
        cost: {
            Knowledge(){ return 130000000; },
            Omniscience(){ return 40000; },
        },
        effect(){ return loc('tech_suction_force_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    soul_compactor: {
        id: 'tech-soul_compactor',
        title(){ return loc('eden_soul_compactor_title'); },
        desc(){ return loc('eden_soul_compactor_title'); },
        category: 'edenic',
        era: 'existential',
        reqs: { isle: 6 },
        grant: ['isle',7],
        cost: {
            Knowledge(){ return 135000000; },
            Omniscience(){ return 42500; },
        },
        effect(){ return loc('tech_soul_compactor_effect',[global.resource.Soul_Gem.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_isle.soul_compactor);
                return true;
            }
            return false;
        }
    },
    tomb: {
        id: 'tech-tomb',
        title(){ return loc('eden_tomb_title'); },
        desc(){ return loc('eden_tomb_title'); },
        category: 'edenic',
        era: 'existential',
        reqs: { palace: 2 },
        grant: ['palace',3],
        cost: {
            Knowledge(){ return 140000000; },
            Omniscience(){ return 45000; },
        },
        effect(){ return loc('tech_tomb_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_palace.tomb);
                return true;
            }
            return false;
        }
    },
    energy_drain: {
        id: 'tech-energy_drain',
        title(){ return loc('tech_energy_drain'); },
        desc(){ return loc('tech_energy_drain'); },
        category: 'edenic',
        era: 'existential',
        reqs: { palace: 4 },
        grant: ['palace',5],
        cost: {
            Knowledge(){ return 145000000; },
            Omniscience(){ return 47500; },
        },
        effect(){ return loc('tech_energy_drain_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_palace.conduit);
                return true;
            }
            return false;
        }
    },
    divine_infuser: {
        id: 'tech-divine_infuser',
        title(){ return loc('tech_divine_infuser'); },
        desc(){ return loc('tech_divine_infuser'); },
        category: 'edenic',
        era: 'existential',
        reqs: { palace: 5 },
        grant: ['palace',6],
        cost: {
            Knowledge(){ return 150000000; },
            Omniscience(){ return 50000; },
        },
        effect(){ return loc('tech_divine_infuser_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_palace.infuser);
                return true;
            }
            return false;
        }
    },
    might: {
        id: 'tech-might',
        title: loc('tech_might'),
        desc: loc('tech_might'),
        category: 'evil',
        era: 'civilized',
        reqs: { military: 1 },
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        grant: ['evil',1],
        cost: {
            Knowledge(){ return 100; }
        },
        effect: loc('tech_might_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_might_flair');
        }
    },
    executions: {
        id: 'tech-executions',
        title: loc('tech_executions'),
        desc: loc('tech_executions'),
        category: 'evil',
        era: 'industrialized',
        reqs: { evil: 1, high_tech: 3 },
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        grant: ['evil',2],
        cost: {
            Knowledge(){ return 35000; }
        },
        effect: loc('tech_executions_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    secret_police: {
        id: 'tech-secret_police',
        title: loc('tech_secret_police'),
        desc: loc('tech_secret_police'),
        category: 'evil',
        era: 'globalized',
        reqs: { evil: 2, high_tech: 6 },
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        grant: ['evil',3],
        cost: {
            Knowledge(){ return 112000; }
        },
        effect: loc('tech_secret_police_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ai_tracking: {
        id: 'tech-ai_tracking',
        title: loc('tech_ai_tracking'),
        desc: loc('tech_ai_tracking'),
        category: 'evil',
        era: 'deep_space',
        reqs: { evil: 3, high_tech: 10 },
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        grant: ['evil',4],
        cost: {
            Knowledge(){ return 345000; }
        },
        effect: loc('tech_ai_tracking_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    predictive_arrests: {
        id: 'tech-predictive_arrests',
        title: loc('tech_predictive_arrests'),
        desc: loc('tech_predictive_arrests'),
        category: 'evil',
        era: 'intergalactic',
        reqs: { evil: 4, high_tech: 16 },
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        grant: ['evil',5],
        cost: {
            Knowledge(){ return 5123450; }
        },
        effect: loc('tech_predictive_arrests_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    }
};

function uniteEffect(){
    global.tech['world_control'] = 1;
    clearElement($('#garrison'));
    clearElement($('#c_garrison'));
    buildGarrison($('#garrison'),true);
    buildGarrison($('#c_garrison'),false);
    for (let i=0; i<3; i++){
        if (global.civic.foreign[`gov${i}`].occ){
            let occ_amount = jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
            global.civic['garrison'].max += occ_amount;
            global.civic['garrison'].workers += occ_amount;
            global.civic.foreign[`gov${i}`].occ = false;
        }
        global.civic.foreign[`gov${i}`].buy = false;
        global.civic.foreign[`gov${i}`].anx = false;
        global.civic.foreign[`gov${i}`].sab = 0;
        global.civic.foreign[`gov${i}`].act = 'none';
    }
    removeTask('spy');
    removeTask('spyop');
}

export function swissKnife(cheeseOnly,cheeseList){
    let cheeses = [
        'swiss','gouda','cheddar','brie','feta','ricotta','goat','mascarpone','bleu','colby_jack','camembert','gorgonzola',
        'mozzarella','roquefort','provolone','monterey_jack','muenster','cambozola','jarlsberg','bocconcini','cantal',
        'emmental','havarti','burrata','cottage','asiago','wensleydale','pepper_jack','queso_blanco','pecorino','raclette',
        'fontina','reblochon','port_salut','brillat_savarin','cream','stilton','taleggio','manchego','edam','gruyeye',
        'parmigiano_reggiano','epoisses','comte','caciocavallo','teleme','grana_padano','chaumes','morbier','halloumi',
        'lancashire','bleu_de_gex','fourme_d_ambert','fromage_blanc','red_leicester','bleu_d_auvergne','pont_l_eveque',
        'jl_grubb','castello_blue','wagasi','ayibe','caravane','limburger','herve','kashkaval','sirene','paski_sir','akkawi',
        'olomoucke_syrecky','anari','danbo','hermelín','trappista','stinking_bishop','banbury','sulguni','hofoingi',
        'urda','golka','rokpol','telemea','bryndza','parenica','kackavalj','liptauer','greve','korbaciky','herrgardsost',
        'vasterbottensost','mish','anejo','quesillo','nacho','reggianito','catupiry','queso_paipa','canastra','port_wine',
        'cados','brie_de_meaux'
    ];
    if (cheeseList){
        return cheeses;
    }
    let type = (global.stats.hasOwnProperty('reset') ? global.stats.reset : 0) % cheeses.length;
    return cheeseOnly ? loc(`cheese_${cheeses[type]}`) : loc(`tech_swiss_bank`,[loc(`cheese_${cheeses[type]}`)]);
}

export const techPath = {
    standard: ['primitive', 'discovery', 'civilized', 'industrialized', 'globalized', 'early_space', 'deep_space', 'interstellar', 'intergalactic', 'dimensional','existential'],
    truepath: ['primitive', 'discovery', 'civilized', 'industrialized', 'globalized', 'early_space', 'deep_space', 'solar', 'tauceti'],
};

export function techList(path){
    if (path){
        let techList = {};
        Object.keys(techs).forEach(function(t){
            if (techPath[path].includes(techs[t].era) || techs[t].hasOwnProperty('path')){
                if (!techs[t].hasOwnProperty('path') || (techs[t].hasOwnProperty('path') && techs[t].path.includes(path))){
                    techList[t] = techs[t];
                }
            }
        });
        return techList;
    }
    return techs;
}

export function stabilize_blackhole(){
    if (global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.exotic >= 0.025 && global.tech['whitehole']){
        if (techs.stabilize_blackhole.action()){
            global.tech['stablized'] = 1;
        }
    }
}
