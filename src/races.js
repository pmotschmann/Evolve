import { $ } from './dom.js';
import { global, seededRandom, save, webWorker, power_generated, keyMultiplier, sizeApproximation, active_rituals, writeSave } from './vars.js';
import { loc } from './locale.js';
import { defineIndustry } from './industry.js';
import { jobScale, jobStack, loadFoundry } from './jobs.js';
import { vBind, clearElement, popover, removeFromQueue, removeFromRQueue, calc_mastery, calcDeepPower, gameLoop, getEaster, getHalloween, randomKey, modRes, messageQueue } from './functions.js';
import { setResourceName, drawResourceTab, atomic_mass } from './resources.js';
import { buildGarrison, govEffect, govTitle, armyRating, govCivics, rivalActive } from './civics.js';
import { govActive, removeTask, defineGovernor } from './governor.js';
import { unlockAchieve, unlockFeat, alevel } from './achieve.js';
import { highPopAdjust, teamster } from './prod.js';
import { actions, checkTechQualifications, drawCity, drawTech, structName, initStruct } from './actions.js';
import { arpa } from './arpa.js';
import { renderEdenic } from './edenic.js';
import { events, eventList, rollEvent } from './events.js';
import { swissKnife } from './tech.js';
import { warhead, big_bang } from './resets.js';
import { spaceSectors } from './space.js';

const date = new Date();
const easter = getEaster();
const hallowed = getHalloween();

export const neg_roll_traits = ['angry','arrogant','atrophy','diverse','dumb','fragrant','frail','freespirit','gluttony','gnawer','greedy','hard_of_hearing','heavy','hooved','invertebrate','lazy','mistrustful','nearsighted','nyctophilia','paranoid','pathetic','pessimistic','puny','pyrophobia','skittish','slow','slow_regen','snowy','solitary','unorganized','unfavored'];

export function altRace(race,set){
    if (global.settings.boring){
        if (global.race['hrt']){
            delete global.race['hrt'];
        }
        return false;
    }
    switch (race){
        case 'elven':
        case 'capybara':
        case 'centaur':
        case 'wendigo':
        case 'entish':
        case 'yeti':
            {
                if ((date.getMonth() === 11 && date.getDate() >= 17) || (global.race['hrt'] && global.race.hrt === race)){
                    if (set){global.race['hrt'] = race;}
                    return true;
                }
                return false;
            }
        case 'wolven':
        case 'vulpine':
            {
                if (easter.active || (global.race['hrt'] && global.race.hrt === race)){
                    if (set){global.race['hrt'] = race;}
                    return true;
                }
                return false;
            }
        case 'arraak':
            {
                if ((date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28) || (global.race['hrt'] && global.race.hrt === race)){
                    if (set){global.race['hrt'] = race;}
                    return true;
                }
                return false;
            }
        case 'seraph':
            {
                if ((date.getMonth() === 1 && date.getDate() === 14) || (global.race['hrt'] && global.race.hrt === race)){
                    if (set){global.race['hrt'] = race;}
                    return true;
                }
                return false;
            }
        case 'human':
        case 'tortoisan':
        case 'unicorn':
        case 'junker':
            {
                if (hallowed.active || (global.race['hrt'] && global.race.hrt === race)){
                    if (set){global.race['hrt'] = race;}
                    return true;
                }
                return false;
            }
    }
    return false;
}

export const genus_def = {
    humanoid: {
        traits: {
            adaptable: 1,
            wasteful: 1,
            versatility: 1
        },
        emergent: ['versatility'],
        oppose: ['fungi']
    },
    carnivore: {
        traits: {
            carnivore: 1,
            beast: 1,
            cautious: 1
        },
        emergent: ['carnivore'],
        oppose: ['herbivore']
    },
    herbivore: {
        traits: {
            herbivore: 1,
            instinct: 1,
            grazer: 1
        },
        emergent: ['grazer'],
        oppose: ['carnivore']
    },
    omnivore: {
        traits: {
            forager: 1,
            beast: 1,
            cautious: 1,
            instinct: 1
        }
    },
    small: {
        traits: {
            small: 1,
            weak: 1,
            unassuming: 1
        },
        emergent: ['unassuming'],
        oppose: ['giant']
    },
    giant: {
        traits: {
            large: 1,
            strong: 1
        },
        oppose: ['small']
    },
    reptilian: {
        traits: {
            cold_blooded: 1,
            scales: 1
        },
        oppose: ['avian']
    },
    avian: {
        traits: {
            flier: 1,
            hollow_bones: 1,
            sky_lover: 1
        },
        emergent: ['flier'],
        oppose: ['reptilian']
    },
    insectoid: {
        traits: {
            high_pop: 1,
            fast_growth: 1,
            high_metabolism: 1
        },
        emergent: ['fast_growth'],
        oppose: ['plant']
    },
    plant: {
        traits: {
            photosynth: 1,
            sappy: 1,
            asymmetrical: 1
        },
        emergent: ['photosynth'],
        oppose: ['insectoid']
    },
    fungi: {
        traits: {
            detritivore: 1,
            spores: 1,
            spongy: 1
        },
        emergent: ['spores'],
        oppose: ['humanoid']
    },
    aquatic: {
        traits: {
            submerged: 1,
            low_light: 1
        },
        oppose: ['sand']
    },
    fey: {
        traits: {
            elusive: 1,
            iron_allergy: 1
        },
        oppose: ['eldritch']
    },
    heat: {
        traits: {
            smoldering: 1,
            cold_intolerance: 1
        },
        oppose: ['polar']
    },
    polar: {
        traits: {
            chilled: 1,
            heat_intolerance: 1,
            pykrete: 1
        },
        emergent: ['pykrete'],
        oppose: ['heat']
    },
    sand: {
        traits: {
            scavenger: 1,
            nomadic: 1,
            grey_market: 1
        },
        emergent: ['grey_market'],
        oppose: ['aquatic']
    },
    demonic: {
        traits: {
            immoral: 1,
            soul_eater: 1,
            ruthless: 1,
            evil: 1
        },
        emergent: ['evil'],
        oppose: ['angelic']
    },
    angelic: {
        traits: {
            blissful: 1,
            pompous: 1,
            holy: 1
        },
        emergent: ['holy'],
        oppose: ['demonic']
    },
    synthetic: {
        traits: {
            artifical: 1,
            powered: 1,
            tireless: 1
        },
        emergent: ['artifical'],
        oppose: ['primordial']
    },
    eldritch: {
        traits: {
            psychic: 1,
            tormented: 1,
            darkness: 1,
            unfathomable: 1
        },
        emergent: ['darkness','unfathomable'],
        oppose: ['fey']
    },
    primordial: {
        traits: {
            deep_power: 1,
            ancient: 1
        },
        oppose: ['synthetic']
    },
    hybrid: {
        traits: {},
        oppose: []
    }
};

export const traits = {
    adaptable: { // Genetic Mutations occur faster from gene tampering
        name(){ return loc('trait_adaptable_name'); },
        desc(v){ return loc('trait_adaptable',v); },
        type: 'genus',
        origin: 'humanoid',
        taxonomy: 'utility',
        val: 50,
        vars(r){ 
            return traitScale(r || traitRank('adaptable') || 1, [2], [10], [25]);
        },
    },
    wasteful: { // Craftings cost more materials
        name(){ return loc('trait_wasteful_name'); },
        desc(v){ return loc('trait_wasteful',v); },
        type: 'genus',
        origin: 'humanoid',
        taxonomy: 'resource',
        val: -80,
        vars(r){ 
            return traitScale(r || traitRank('wasteful') || 1, [16], [10], [2]);
        },
    },
    versatility: { // Extra minor gene slot base pair, and makes genes cheaper to slot and rank
        name(){ return loc('trait_versatility_name'); },
        desc(v = traits.versatility.vars()){ return loc('trait_versatility',[...v,genes.versatility_pair_rank]); },
        type: 'genus',
        origin: 'humanoid',
        taxonomy: 'utility',
        val: 120,
        vars(r){
            // [Minor Gene Discount]
            return traitScale(r || traitRank('versatility') || 1, [1], [5], [10]);
        },
    },
    xenophobic: { // Trade posts suffer a -1 penalty per post
        name(){ return loc('trait_xenophobic_name'); },
        desc(v){ return loc('trait_xenophobic',v); },
        type: 'genus',
        genus: 'humanoid',
        taxonomy: 'resource',
        val: -100,
    },
    carnivore: { // No agriculture tech tree path, however unemployed citizens now act as hunters.
        name(){ return loc('trait_carnivore_name'); },
        desc(v){ return loc('trait_carnivore',v); },
        type: 'genus',
        origin: 'carnivore',
        taxonomy: 'resource',
        val: 60,
        vars(r){ 
            // [Rot Percent]
            return traitScale(r || traitRank('carnivore') || 1, [70], [50], [30]);
        },
    },
    beast: { // Improved hunting and soldier training
        name(){ return loc('trait_beast_name'); },
        desc(v){ return loc('trait_beast',v); },
        type: 'genus',
        origin: 'carnivore',
        taxonomy: 'resource',
        val: 40,
        vars(r){
            // [Hunting, Windy Hunting, Training Speed]
            return traitScale(r || traitRank('beast') || 1, [3,6,3], [8,15,10], [14,28,25]);
        },
    },
    cautious: { // Rain reduces combat rating
        name(){ return loc('trait_cautious_name'); },
        desc(v){ return loc('trait_cautious',v); },
        type: 'genus',
        origin: 'carnivore',
        taxonomy: 'combat',
        val: -40,
        vars(r){ 
            return traitScale(r || traitRank('cautious') || 1, [16], [10], [4]);
        },
    },
    herbivore: { // No food is gained from hunting
        name(){ return loc('trait_herbivore_name'); },
        desc(v){ return loc('trait_herbivore',v); },
        type: 'genus',
        origin: 'herbivore',
        taxonomy: 'resource',
        val: -140,
    },
    instinct: { // Avoids Danger
        name(){ return loc('trait_instinct_name'); },
        desc(v){ return loc('trait_instinct',v); },
        type: 'genus',
        genus: 'herbivore',
        taxonomy: 'utility',
        val: 100,
        vars(r){
            // [Surveyor Survival Boost, Reduce Combat Deaths %]
            return traitScale(r || traitRank('instinct') || 1, [2,10], [10,50], [25,70]);
        },
    },
    grazer: { // Idle citizens feed themselves off the land, and bring some back
        name(){ return loc('trait_grazer_name'); },
        desc(v){ return loc('trait_grazer',v); },
        type: 'genus',
        origin: 'herbivore',
        taxonomy: 'resource',
        val: 20,
        vars(r){
            // [Share of a farmer each idle citizen produces]
            return traitScale(r || traitRank('grazer') || 1, [1], [20], [40]);
        },
    },
    forager: { // Will eat just about anything
        name(){ return loc('trait_forager_name'); },
        desc(v){ return loc('trait_forager',v); },
        type: 'genus',
        origin: 'hybrid',
        taxonomy: 'resource',
        val: 80,
        vars(r){
            // [Foraging Strength]
            return traitScale(r || traitRank('forager') || 1, [70], [100], [130]);
        },
    },
    small: { // Reduces cost creep multipliers by 0.01
        name(){ return loc('trait_small_name'); },
        desc(v){ return loc('trait_small',v); },
        type: 'genus',
        origin: 'small',
        taxonomy: 'utility',
        val: 120,
        vars(r){
            // [Planet Creep, Space Creep]
            return traitScale(r || traitRank('small') || 1, [0.0015,0.001], [0.01,0.005], [0.016,0.008]);
        },
    },
    weak: { // Lumberjacks, miners, and quarry workers are 10% less effective
        name(){ return loc('trait_weak_name'); },
        desc(v){ return loc('trait_weak',v); },
        type: 'genus',
        origin: 'small',
        taxonomy: 'resource',
        val: -60,
        vars(r){
            return traitScale(r || traitRank('weak') || 1, [16], [10], [4]);
        },
    },
    unassuming: { // Chance that a negative event is thrown back and drawn again
        name(){ return loc('trait_unassuming_name'); },
        desc(v){ return loc('trait_unassuming',v); },
        type: 'genus',
        origin: 'small',
        taxonomy: 'utility',
        val: 20,
        vars(r){
            // [Reroll Chance]
            return traitScale(r || traitRank('unassuming') || 1, [1], [10], [20]);
        },
    },
    large: { // Increases plantery cost creep multipliers by 0.005
        name(){ return loc('trait_large_name'); },
        desc(v){ return loc('trait_large',v); },
        type: 'genus',
        origin: 'giant',
        taxonomy: 'utility',
        val: -100,
        vars(r){
            return traitScale(r || traitRank('large') || 1, [0.008], [0.005], [0.002]);
        },
    },
    strong: { // Increased manual resource gain
        name(){ return loc('trait_strong_name'); },
        desc(v){ return loc('trait_strong',v); },
        type: 'genus',
        origin: 'giant',
        taxonomy: 'resource',
        val: 100,
        vars(r){
            // [Manual Gathering, Basic Jobs]
            return traitScale(r || traitRank('strong') || 1, [2,1.1], [4,2], [7,2.75]);
        },
    },
    cold_blooded: { // Weather affects productivity
        name(){ return loc('trait_cold_blooded_name'); },
        desc(v){ return loc('trait_cold_blooded',v); },
        type: 'genus',
        origin: 'reptilian',
        taxonomy: 'production',
        val: -40,
        vars(r){
            // [Weather Penalty, Weather Bonus]
            return traitScale(r || traitRank('cold_blooded') || 1, [35,4], [20,10], [10,20]);
        },
    },
    scales: { // Minor decrease of soldiers killed in combat
        name(){ return loc('trait_scales_name'); },
        desc(v){ return loc('trait_scales',v); },
        type: 'genus',
        origin: 'reptilian',
        taxonomy: 'combat',
        val: 100,
        vars(r){
            // [Win, Loss, Hell]
            switch (rankTier(r || traitRank('scales') || 1)){
                case 0.1:
                    return [1,0,0];
                case 0.25:
                    return [1,0,1];
                case 0.5:
                    return [1,1,1];
                case 1:
                    return [2,1,1];
                case 2:
                    return [2,2,1];
                case 3:
                    return [2,2,2];
                case 4:
                    return [3,2,2];
            }
        },
    },
    flier: { // Use Clay instead of Stone or Cement
        name(){ return loc('trait_flier_name'); },
        desc(v){ return loc('trait_flier',v); },
        type: 'genus',
        origin: 'avian',
        taxonomy: 'resource',
        val: 60,
        vars(r){
            // [Reduce Stone Costs, Extra Trade Post Route]
            let rank = r || traitRank('flier') || 1;
            return [traitScale(rank, [5], [25], [60])[0], rankStep(rank, [[0,0],[1,1],[1.67,2]])];
        },
    },
    hollow_bones: { // Less Crafted Materials Needed
        name(){ return loc('trait_hollow_bones_name'); },
        desc(v){ return loc('trait_hollow_bones',v); },
        type: 'genus',
        origin: 'avian',
        taxonomy: 'resource',
        val: 40,
        vars(r){
            return traitScale(r || traitRank('hollow_bones') || 1, [1], [5], [12]);
        },
    },
    sky_lover: { // Mining type jobs more stressful
        name(){ return loc('trait_sky_lover_name'); },
        desc(v){ return loc('trait_sky_lover',v); },
        type: 'genus',
        origin: 'avian',
        taxonomy: 'utility',
        val: -40,
        vars(r){
            return traitScale(r || traitRank('sky_lover') || 1, [50], [20], [8]);
        },
    },
    rigid: { // Crafting production lowered slightly
        name(){ return loc('trait_rigid_name'); },
        desc(v){ return loc('trait_rigid',v); },
        type: 'genus',
        origin: 'avian',
        taxonomy: 'resource',
        val: -40,
        vars(r){
            return traitScale(r || traitRank('rigid') || 1, [4], [1], [0.3]);
        },
    },
    high_pop: { // Population is higher, but less productive
        name(){ return loc('trait_high_pop_name'); },
        desc(v){ return loc('trait_high_pop',v); },
        type: 'genus',
        origin: 'insectoid',
        taxonomy: 'utility',
        val: 60,
        vars(r){
            // [Citizen Cap, Worker Effectiveness, Growth Multiplier]
            return traitScale(r || traitRank('high_pop') || 1, [2, 50, 1.2], [4, 26, 3.5], [7, 15.8, 6.5]);
        },
    },
    fast_growth: { // Greatly increases odds of population growth each cycle
        name(){ return loc('trait_fast_growth_name'); },
        desc(v){ return loc('trait_fast_growth',v); },
        type: 'genus',
        origin: 'insectoid',
        taxonomy: 'utility',
        val: 40,
        vars(r){
            // [bound multi, bound add]
            return traitScale(r || traitRank('fast_growth') || 1, [1.2,1], [2,2], [3.5,3]);
        },
    },
    high_metabolism: { // Food requirements increased by 5%
        name(){ return loc('trait_high_metabolism_name'); },
        desc(v){ return loc('trait_high_metabolism',v); },
        type: 'genus',
        origin: 'insectoid',
        taxonomy: 'utility',
        val: -20,
        vars(r){
            return traitScale(r || traitRank('high_metabolism') || 1, [12], [5], [1]);
        },
    },
    photosynth: { // Reduces food requirements dependant on sunshine.
        name(){ return loc('trait_photosynth_name'); },
        desc(v){ return loc('trait_photosynth',v); },
        type: 'genus',
        origin: 'plant',
        taxonomy: 'utility',
        val: 20,
        vars(r){
            // [Sunny, Cloudy, Rainy]
            return traitScale(r || traitRank('photosynth') || 1, [5,4,3], [40,20,10], [70,40,25]);
        },
    },
    sappy: { // Stone is replaced with Amber.
        name(){ return loc('trait_sappy_name'); },
        desc(){ return loc('trait_sappy',[loc('resource_Amber_name')]); },
        type: 'genus',
        origin: 'plant',
        taxonomy: 'resource',
        val: 80,
        vars(r){
            return traitScale(r || traitRank('sappy') || 1, [0.3], [0.6], [0.75]);
        },
    },
    asymmetrical: { // Trade selling prices are slightly worse then normal
        name(){ return loc('trait_asymmetrical_name'); },
        desc(v){ return loc('trait_asymmetrical',v); },
        type: 'genus',
        origin: 'plant',
        taxonomy: 'utility',
        val: -60,
        vars(r){
            return traitScale(r || traitRank('asymmetrical') || 1, [35], [20], [5]);
        },
    },
    detritivore: { // You eat dead matter
        name(){ return loc('trait_detritivore_name'); },
        desc(v){ return loc('trait_detritivore',v); },
        type: 'genus',
        origin: 'fungi',
        taxonomy: 'utility',
        val: 40,
        vars(r){
            return traitScale(r || traitRank('detritivore') || 1, [60], [80], [95]);
        },
    },
    spores: { // Birthrate increased when it's windy
        name(){ return loc('trait_spores_name'); },
        desc(v){ return loc('trait_spores',v); },
        type: 'genus',
        origin: 'fungi',
        taxonomy: 'utility',
        val: 20,
        vars(r){
            // [Bound Add, Bound Multi, Bound Add Parasite]
            return traitScale(r || traitRank('spores') || 1, [1,1.2,1], [2,2,1], [3,3.5,2]);
        },
    },
    spongy: { // Birthrate decreased when it's raining
        name(){ return loc('trait_spongy_name'); },
        desc(v){ return loc('trait_spongy',v); },
        type: 'genus',
        origin: 'fungi',
        taxonomy: 'utility',
        val: -40,
    },
    submerged: { // Immune to weather effects
        name(){ return loc('trait_submerged_name'); },
        desc(v){ return loc('trait_submerged',v); },
        type: 'genus',
        origin: 'aquatic',
        taxonomy: 'utility',
        val: 60,
    },
    low_light: { // Farming effectiveness decreased
        name(){ return loc('trait_low_light_name'); },
        desc(v){ return loc('trait_low_light',v); },
        type: 'genus',
        origin: 'aquatic',
        taxonomy: 'resource',
        val: -40,
        vars(r){
            return traitScale(r || traitRank('low_light') || 1, [16], [10], [4]);
        },
    },
    elusive: { // Spies are never caught
        name(){ return loc('trait_elusive_name'); },
        desc(v){ return loc('trait_elusive',v); },
        type: 'genus',
        origin: 'fey',
        taxonomy: 'utility',
        val: 140,
        vars(r){
            return traitScale(r || traitRank('elusive') || 1, [5], [20], [35]);
        },
    },
    iron_allergy: { // Iron mining reduced
        name(){ return loc('trait_iron_allergy_name'); },
        desc(v){ return loc('trait_iron_allergy',v); },
        type: 'genus',
        origin: 'fey',
        taxonomy: 'resource',
        val: -80,
        vars(r){
            return traitScale(r || traitRank('iron_allergy') || 1, [45], [25], [12]);
        },
    },
    smoldering: { // Hot weather is a bonus
        name(){ return loc('trait_smoldering_name'); },
        desc(v){ return loc('trait_smoldering',v); },
        type: 'genus',
        origin: 'heat',
        taxonomy: 'production',
        val: 140,
        vars(r){
            // [Seasonal Morale, Hot Bonus, High Hot Bonus]
            return traitScale(r || traitRank('smoldering') || 1, [2,0.1,0.06], [5,0.35,0.2], [14,0.42,0.25]);
        },
    },
    cold_intolerance: { // Cold weather is a detriment
        name(){ return loc('trait_cold_intolerance_name'); },
        desc(v){ return loc('trait_cold_intolerance',v); },
        type: 'genus',
        origin: 'heat',
        taxonomy: 'production',
        val: -80,
        vars(r){
            return traitScale(r || traitRank('cold_intolerance') || 1, [0.4], [0.25], [0.16]);
        },
    },
    chilled: { // Cold weather is a bonus
        name(){ return loc('trait_chilled_name'); },
        desc(v){ return loc('trait_chilled',v); },
        type: 'genus',
        origin: 'polar',
        taxonomy: 'production',
        val: 140,
        vars(r){
            // [Seasonal Morale, Cold Bonus, High Cold Bonus, Snow Food Bonus, Cold Food Bonus, Sun Food Penalty]
            return traitScale(r || traitRank('chilled') || 1, [1,0.12,0.06,3,2,22], [5,0.35,0.2,20,10,15], [14,0.42,0.25,35,15,6]);
        },
    },
    heat_intolerance: { // Hot weather is a detriment
        name(){ return loc('trait_heat_intolerance_name'); },
        desc(v){ return loc('trait_heat_intolerance',v); },
        type: 'genus',
        origin: 'polar',
        taxonomy: 'production',
        val: -120,
        vars(r){
            return traitScale(r || traitRank('heat_intolerance') || 1, [0.4], [0.25], [0.16]);
        },
    },
    pykrete: { // Polar construction material responds to temperature
        name(){ return loc('trait_pykrete_name'); },
        desc(v){ return loc('trait_pykrete',v); },
        type: 'genus',
        origin: 'polar',
        taxonomy: 'resource',
        val: 60,
        vars(r){
            // [Hot production penalty, Cold production bonus, Material cost discount]
            return traitScale(r || traitRank('pykrete') || 1, [40,10,5], [25,25,15], [10,40,25]);
        },
    },
    scavenger: { // scavenger job is always available
        name(){ return loc('trait_scavenger_name'); },
        desc(v){ return loc('trait_scavenger',v); },
        type: 'genus',
        origin: 'sand',
        taxonomy: 'production',
        val: 60,
        vars(r){
            // [impact, duel bonus]
            return traitScale(r || traitRank('scavenger') || 1, [0.05,18], [0.12,25], [0.18,34]);
        },
    },
    grey_market: { // Every trade route leaks a trickle of everything the open market sells
        name(){ return loc('trait_grey_market_name'); },
        desc(v){ return loc('trait_grey_market',v); },
        type: 'genus',
        origin: 'sand',
        taxonomy: 'resource',
        val: 60,
        vars(r){
            // [Share of one route's import, gained per route per resource]
            return traitScale(r || traitRank('grey_market') || 1, [0.2], [3], [6]);
        },
    },
    nomadic: { // -1 Trade route from trade post
        name(){ return loc('trait_nomadic_name'); },
        desc(v){ return loc('trait_nomadic',v); },
        type: 'genus',
        origin: 'sand',
        taxonomy: 'utility',
        val: -100,
    },
    immoral: { // Warmonger is a bonus instead of a penalty
        name(){ return loc('trait_immoral_name'); },
        desc(v){ return loc('trait_immoral',v); },
        type: 'genus',
        origin: 'demonic',
        taxonomy: 'utility',
        val: 80,
        vars(r){
            return traitScale(r || traitRank('immoral') || 1, [-40], [0], [40]);
        },
    },
    ruthless: { // Combat rating bonus; applies to armies, not hunting
        name(){ return loc('trait_ruthless_name'); },
        desc(v){ return loc('trait_ruthless',v); },
        type: 'genus',
        origin: 'demonic',
        taxonomy: 'combat',
        val: 40,
        vars(r){
            return traitScale(r || traitRank('ruthless') || 1, [1], [10], [20]);
        },
    },
    evil: { // You are pure evil
        name(){ return loc('trait_evil_name'); },
        desc(v){ return loc('trait_evil',v); },
        type: 'genus',
        origin: 'demonic',
        taxonomy: 'utility',
        val: 0,
    },
    blissful: { // Low morale penalty is halved and citizens never riot.
        name(){ return loc('trait_blissful_name'); },
        desc(v){ return loc('trait_blissful',v); },
        type: 'genus',
        origin: 'angelic',
        taxonomy: 'utility',
        val: 60,
        vars(r){
            return traitScale(r || traitRank('blissful') || 1, [75], [50], [25]);
        },
    },
    pompous: { // Professors are less effective
        name(){ return loc('trait_pompous_name'); },
        desc(v){ return loc('trait_pompous',v); },
        type: 'genus',
        origin: 'angelic',
        taxonomy: 'utility',
        val: -120,
        vars(r){
            return traitScale(r || traitRank('pompous') || 1, [90], [75], [50]);
        },
    },
    holy: { // Combat Bonus in Hell
        name(){ return loc('trait_holy_name'); },
        desc(v){ return loc('trait_holy',v); },
        type: 'genus',
        origin: 'angelic',
        taxonomy: 'combat',
        val: 80,
        vars(r){
            // [Hell Army Bonus, Hell Suppression Bonus]
            return traitScale(r || traitRank('holy') || 1, [20,5], [50,25], [70,45]);
        },
    },
    artifical: {
        name(){ return loc('trait_artifical_name'); },
        desc(v){ return loc('trait_artifical',v); },
        type: 'genus',
        origin: 'synthetic',
        taxonomy: 'utility',
        val: 100,
        vars(r){
            // [Science Bonus]
            return traitScale(r || traitRank('artifical') || 1, [3], [20], [35]);
        },
    },
    powered: {
        name(){ return loc('trait_powered_name'); },
        desc(v){ return loc('trait_powered',v); },
        type: 'genus',
        origin: 'synthetic',
        taxonomy: 'utility',
        val: -180,
        vars(r){
            // [Power Req]
            return traitScale(r || traitRank('powered') || 1, [0.4], [0.2], [0.05]);
        },
    },
    tireless: { // The labor half of what Powered used to be
        name(){ return loc('trait_tireless_name'); },
        desc(v){ return loc('trait_tireless',v); },
        type: 'genus',
        origin: 'synthetic',
        taxonomy: 'production',
        val: 60,
        vars(r){
            // [Labor Boost]
            return traitScale(r || traitRank('tireless') || 1, [4], [16], [28]);
        },
    },
    psychic: {
        name(){ return loc('trait_psychic_name'); },
        desc(v){ return loc('trait_psychic',v); },
        type: 'genus',
        origin: 'eldritch',
        taxonomy: 'utility',
        val: 200,
        vars(r){
            // [Mind Break Modifer, Thrall Modifer, Recharge Rate, Effect Strength]
            return traitScale(r || traitRank('psychic') || 1, [0.2,4,0.01,15], [1,15,0.05,40], [1.65,30,0.12,65]);
        },
    },
    tormented: {
        name(){ return loc('trait_tormented_name'); },
        desc(v){ return loc('trait_tormented',v); },
        type: 'genus',
        origin: 'eldritch',
        taxonomy: 'utility',
        val: -500,
        vars(r){
            // [Morale above 100% is greatly reduced]
            return traitScale(r || traitRank('tormented') || 1, [99], [90], [70]);
        },
    },
    darkness: {
        name(){ return loc('trait_darkness_name'); },
        desc(v){ return loc('trait_darkness',v); },
        type: 'genus',
        origin: 'eldritch',
        taxonomy: 'utility',
        val: 20,
        vars(r){
            // [Sunny Days less frequent]
            return traitScale(r || traitRank('darkness') || 1, [0], [3], [6]);
        },
    },
    unfathomable: {
        name(){ return loc('trait_unfathomable_name'); },
        desc(v){ return loc('trait_unfathomable',v); },
        type: 'genus',
        origin: 'eldritch',
        taxonomy: 'utility',
        val: 300,
        vars(r){
            // [Thrall Races, Catch Modifer, Thrall Effectiveness]
            let rank = r || traitRank('unfathomable') || 1;
            let scaled = traitScale(rank, [1,0.4,0.03], [2,0.8,0.1], [3,1.1,0.14]);
            return [rankStep(rank, [[0,1],[1,2],[1.67,3]]), scaled[1], scaled[2]];
        },
    },
    creative: { // A.R.P.A. Projects are cheaper
        name(){ return loc('trait_creative_name'); },
        desc(v){ return loc('trait_creative',v); },
        type: 'major',
        origin: 'human',
        taxonomy: 'resource',
        val: 160,
        vars(r){
            return traitScale(r || traitRank('creative') || 1, [0.001,3], [0.005,20], [0.0068,26]);
        },
    },
    diverse: { // Training soldiers takes longer
        name(){ return loc('trait_diverse_name'); },
        desc(v){ return loc('trait_diverse',v); },
        type: 'major',
        origin: 'human',
        taxonomy: 'combat',
        val: -80,
        vars(r){
            return traitScale(r || traitRank('diverse') || 1, [40], [25], [12]);
        },
    },
    studious: { // Professors generate an extra 0.25 Knowledge per second, Libraries provide 10% more knowledge cap
        name(){ return loc('trait_studious_name'); },
        desc(v){ return loc('trait_studious',v); },
        type: 'major',
        origin: 'elven',
        taxonomy: 'utility',
        val: 40,
        vars(r){
            // [Prof Bonus, Library Bonus]
            return traitScale(r || traitRank('studious') || 1, [0.08,4], [0.25,10], [0.45,16]);
        },
    },
    arrogant: { // Market prices are higher
        name(){ return loc('trait_arrogant_name'); },
        desc(v){ return loc('trait_arrogant',v); },
        type: 'major',
        origin: 'elven',
        taxonomy: 'resource',
        val: -40,
        vars(r){
            return traitScale(r || traitRank('arrogant') || 1, [16], [10], [5]);
        },
    },
    brute: { // Recruitment costs are 1/2 price
        name(){ return loc('trait_brute_name'); },
        desc(v){ return loc('trait_brute',v); },
        type: 'major',
        origin: 'orc',
        taxonomy: 'combat',
        val: 140,
        vars(r){
            // [Merc Discount, Training Bonus]
            return traitScale(r || traitRank('brute') || 1, [15,40], [50,100], [70,150]);
        },
    },
    angry: { // When hungry you get hangry, low food penalty is more severe
        name(){ return loc('trait_angry_name'); },
        desc(v){ return loc('trait_angry',v); },
        type: 'major',
        origin: 'orc',
        taxonomy: 'production',
        val: -20,
        vars(r){
            return traitScale(r || traitRank('angry') || 1, [40], [25], [12]);
        },
    },
    lazy: { // All production is lowered when the temperature is hot
        name(){ return loc('trait_lazy_name'); },
        desc(v){ return loc('trait_lazy',v); },
        type: 'major',
        origin: 'cath',
        taxonomy: 'production',
        val: -80,
        vars(r){
            return traitScale(r || traitRank('lazy') || 1, [16], [10], [5]);
        },
    },
    curious: { // University cap boosted by citizen count, curious random events
        name(){ return loc('trait_curious_name'); },
        desc(v){ return loc('trait_curious',v); },
        type: 'major',
        origin: 'cath',
        taxonomy: 'utility',
        val: 80,
        vars(r){
            return traitScale(r || traitRank('curious') || 1, [0.02], [0.1], [0.14]);
        },
    },
    pack_mentality: { // Cabins cost more, but cottages cost less.
        name(){ return loc('trait_pack_mentality_name'); },
        desc(v){ return loc('trait_pack_mentality',v); },
        type: 'major',
        origin: 'wolven',
        taxonomy: 'utility',
        val: 80,
        vars(r){
            // [Cabin Creep penatly, Cottage Creep bonus]
            return traitScale(r || traitRank('pack_mentality') || 1, [0.03,0.014], [0.03,0.02], [0.022,0.024]);
        },
    },
    tracker: { // 20% increased gains from hunting
        name(){ return loc('trait_tracker_name'); },
        desc(v){ return loc('trait_tracker',v); },
        type: 'major',
        origin: 'wolven',
        taxonomy: 'resource',
        val: 40,
        vars(r){
            return traitScale(r || traitRank('tracker') || 1, [5], [20], [35]);
        },
    },
    playful: { // Hunters are Happy
        name(){ return loc('trait_playful_name'); },
        desc(v){ return loc('trait_playful',v); },
        type: 'major',
        origin: 'vulpine',
        taxonomy: 'production',
        val: 100,
        vars(r){
            return traitScale(r || traitRank('playful') || 1, [0.2], [0.5], [0.8]);
        },
    },
    freespirit: { // Job Stress is higher for those who must work mundane jobs
        name(){ return loc('trait_freespirit_name'); },
        desc(v){ return loc('trait_freespirit',v); },
        type: 'major',
        origin: 'vulpine',
        taxonomy: 'production',
        val: -60,
        vars(r){
            return traitScale(r || traitRank('freespirit') || 1, [70], [50], [20]);
        },
    },
    beast_of_burden: { // Gains more loot during raids
        name(){ return loc('trait_beast_of_burden_name'); },
        desc(v){ return loc('trait_beast_of_burden',v); },
        type: 'major',
        origin: 'centaur',
        taxonomy: 'combat',
        val: 60
    },
    sniper: { // Weapon upgrades are more impactful
        name(){ return loc('trait_sniper_name'); },
        desc(v){ return loc('trait_sniper',v); },
        type: 'major',
        origin: 'centaur',
        taxonomy: 'combat',
        val: 120,
        vars(r){
            return traitScale(r || traitRank('sniper') || 1, [3], [8], [11]);
        },
    },
    hooved: { // You require special footwear
        name(){ return loc('trait_hooved_name'); },
        desc(v){ return loc('trait_hooved',v); },
        type: 'major',
        origin: 'centaur',
        taxonomy: 'utility',
        val: -80,
        vars(r){
            // [Cost Adjustment]
            return traitScale(r || traitRank('hooved') || 1, [140], [100], [60]);
        },
    },
    rage: { // Wounded soldiers rage with extra power
        name(){ return loc('trait_rage_name'); },
        desc(v){ return loc('trait_rage',v); },
        type: 'major',
        origin: 'rhinotaur',
        taxonomy: 'combat',
        val: 80,
        vars(r){
            // [Rage Bonus, Wounded Bonus]
            return traitScale(r || traitRank('rage') || 1, [0.2,10], [1,50], [1.5,70]);
        },
    },
    heavy: { // Some costs increased
        name(){ return loc('trait_heavy_name'); },
        desc(v){ return loc('trait_heavy',v); },
        type: 'major',
        origin: 'rhinotaur',
        taxonomy: 'utility',
        val: -80,
        vars(r){
            // [Fuel Costs, Stone Cement and Wrought Iron Costs]
            return traitScale(r || traitRank('heavy') || 1, [20,12], [10,5], [5,2]);
        },
    },
    gnawer: { // Population destroys lumber by chewing on it
        name(){ return loc('trait_gnawer_name'); },
        desc(v){ return loc('trait_gnawer',v); },
        type: 'major',
        origin: 'capybara',
        taxonomy: 'resource',
        val: -20,
        vars(r){
            return traitScale(r || traitRank('gnawer') || 1, [0.6], [0.25], [0.12]);
        },
    },
    calm: { // Your are very calm, almost zen like
        name(){ return loc('trait_calm_name'); },
        desc(v){ return loc('trait_calm',v); },
        type: 'major',
        origin: 'capybara',
        taxonomy: 'production',
        val: 120,
        vars(r){
            return traitScale(r || traitRank('calm') || 1, [6], [10], [14]);
        },
    },
    pack_rat: { // Storage space is increased
        name(){ return loc('trait_pack_rat_name'); },
        desc(v){ return loc('trait_pack_rat',v); },
        type: 'major',
        origin: 'kobold',
        taxonomy: 'resource',
        val: 60,
        vars(r){
            // [Crate Bonus, Storage Bonus]
            return traitScale(r || traitRank('pack_rat') || 1, [4,1], [10,5], [25,12]);
        },
    },
    paranoid: { // Bank capacity reduced by 10%
        name(){ return loc('trait_paranoid_name'); },
        desc(v){ return loc('trait_paranoid',v); },
        type: 'major',
        origin: 'kobold',
        taxonomy: 'resource',
        val: -60,
        vars(r){
            return traitScale(r || traitRank('paranoid') || 1, [16], [10], [5]);
        },
    },
    greedy: { // Lowers income from taxes
        name(){ return loc('trait_greedy_name'); },
        desc(v){ return loc('trait_greedy',v); },
        type: 'major',
        origin: 'goblin',
        taxonomy: 'resource',
        val: -100,
        vars(r){
            return traitScale(r || traitRank('greedy') || 1, [20], [12.5], [6]);
        },
    },
    merchant: { // Better commodity selling prices
        name(){ return loc('trait_merchant_name'); },
        desc(v){ return loc('trait_merchant',v); },
        type: 'major',
        origin: 'goblin',
        taxonomy: 'resource',
        val: 60,
        vars(r){
            // [Sell Price, Galactic Buy Volume]
            return traitScale(r || traitRank('merchant') || 1, [5,2], [25,10], [45,14]);
        },
    },
    smart: { // Knowledge costs reduced by 10%
        name(){ return loc('trait_smart_name'); },
        desc(v){ return loc('trait_smart',v); },
        type: 'major',
        origin: 'gnome',
        taxonomy: 'utility',
        val: 120,
        vars(r){
            return traitScale(r || traitRank('smart') || 1, [2], [10], [14]);
        },
    },
    puny: { // Lowers minium bound for army score roll
        name(){ return loc('trait_puny_name'); },
        desc(v){ return loc('trait_puny',v); },
        type: 'major',
        origin: 'gnome',
        taxonomy: 'combat',
        val: -80,
        vars(r){
            return traitScale(r || traitRank('puny') || 1, [20], [10], [3]);
        },
    },
    dumb: { // Knowledge costs increased by 5%
        name(){ return loc('trait_dumb_name'); },
        desc(v){ return loc('trait_dumb',v); },
        type: 'major',
        origin: 'ogre',
        taxonomy: 'utility',
        val: -100,
        vars(r){
            return traitScale(r || traitRank('dumb') || 1, [8], [5], [2]);
        },
    },
    tough: { // Mining output increased by 25%
        name(){ return loc('trait_tough_name'); },
        desc(v){ return loc('trait_tough',v); },
        type: 'major',
        origin: 'ogre',
        taxonomy: 'resource',
        val: 80,
        vars(r){
            return traitScale(r || traitRank('tough') || 1, [5], [25], [45]);
        },
    },
    nearsighted: { // Libraries are less effective
        name(){ return loc('trait_nearsighted_name'); },
        desc(v){ return loc('trait_nearsighted',v); },
        type: 'major',
        origin: 'cyclops',
        taxonomy: 'utility',
        val: -80,
        vars(r){
            return traitScale(r || traitRank('nearsighted') || 1, [20], [12], [6]);
        },
    },
    intelligent: { // Professors and Scientists add a global production bonus
        name(){ return loc('trait_intelligent_name'); },
        desc(v){ return loc('trait_intelligent',v); },
        type: 'major',
        origin: 'cyclops',
        taxonomy: 'production',
        val: 140,
        vars(r){
            // [Prof Bonus, Scientist Bonus]
            return traitScale(r || traitRank('intelligent') || 1, [0.05,0.1], [0.125,0.25], [0.16,0.34]);
        },
    },
    regenerative: { // Wounded soldiers heal 4x as fast
        name(){ return loc('trait_regenerative_name'); },
        desc(v){ return loc('trait_regenerative',v); },
        type: 'major',
        origin: 'troll',
        taxonomy: 'combat',
        val: 160,
        vars(r){
            return traitScale(r || traitRank('regenerative') || 1, [1], [4], [7]);
        },
    },
    gluttony: { // Eats 10% more food per rank
        name(){ return loc('trait_gluttony_name'); },
        desc(v){ return loc('trait_gluttony',v); },
        type: 'major',
        origin: 'troll',
        taxonomy: 'resource',
        val: -40,
        vars(r){
            return traitScale(r || traitRank('gluttony') || 1, [25], [10], [5]);
        },
    },
    slow: { // The game moves at a 10% slower pace
        name(){ return loc('trait_slow_name'); },
        desc(v){ return loc('trait_slow',v); },
        type: 'major',
        origin: 'tortoisan',
        taxonomy: 'utility',
        val: -120,
        vars(r){
            return traitScale(r || traitRank('slow') || 1, [14], [10], [5]);
        },
    },
    armored: { // Less soldiers die in combat
        name(){ return loc('trait_armored_name'); },
        desc(v){ return loc('trait_armored',v); },
        type: 'major',
        origin: 'tortoisan',
        taxonomy: 'combat',
        val: 80,
        vars(r){
            // [Solder % death prevention, Hell Armor Bonus]
            let rank = r || traitRank('armored') || 1;
            return [traitScale(rank, [10], [50], [85])[0], rankStep(rank, [[0,0],[0.25,1],[1,2]])];
        },
    },
    optimistic: { // Minor reduction to stress
        name(){ return loc('trait_optimistic_name'); },
        desc(v){ return loc('trait_optimistic',v); },
        type: 'major',
        origin: 'gecko',
        taxonomy: 'production',
        val: 60,
        vars(r){
            return traitScale(r || traitRank('optimistic') || 1, [3,4], [10,10], [20,16]);
        },
    },
    chameleon: { // Barracks have less soldiers
        name(){ return loc('trait_chameleon_name'); },
        desc(v){ return loc('trait_chameleon',v); },
        type: 'major',
        origin: 'gecko',
        taxonomy: 'combat',
        val: 120,
        vars(r){
            // [Combat Rating Bonus, Ambush Avoid, Zombie Avoid]
            return traitScale(r || traitRank('chameleon') || 1, [3,5,2], [20,20,8], [35,35,14]);
        },
    },
    slow_digestion: { // Your race is more resilient to starvation
        name(){ return loc('trait_slow_digestion_name'); },
        desc(v){ return loc('trait_slow_digestion',v); },
        type: 'major',
        origin: 'slitheryn',
        taxonomy: 'production',
        val: 20,
        vars(r){
            return traitScale(r || traitRank('slow_digestion') || 1, [0.2], [0.75], [1.4]);
        },
    },
    astrologer: { // Improved astrological effects
        name(){ return loc('trait_astrologer_name'); },
        desc(v){ return loc('trait_astrologer',v); },
        type: 'major',
        origin: 'slitheryn',
        taxonomy: 'utility',
        val: 60,
        vars(r){
            return traitScale(r || traitRank('astrologer') || 1, [10], [40], [70]);
        },
    },
    hard_of_hearing: { // University science cap gain reduced by 5%
        name(){ return loc('trait_hard_of_hearing_name'); },
        desc(v){ return loc('trait_hard_of_hearing',v); },
        type: 'major',
        origin: 'slitheryn',
        taxonomy: 'utility',
        val: -60,
        vars(r){
            return traitScale(r || traitRank('hard_of_hearing') || 1, [8], [5], [2]);
        },
    },
    resourceful: { // Crafting costs are reduced slightly
        name(){ return loc('trait_resourceful_name'); },
        desc(v){ return loc('trait_resourceful',v); },
        type: 'major',
        origin: 'arraak',
        taxonomy: 'resource',
        val: 80,
        vars(r){
            return traitScale(r || traitRank('resourceful') || 1, [4], [12], [20]);
        },
    },
    selenophobia: { // Moon phase directly affects productivity, on average this is slightly negative
        name(){ return loc('trait_selenophobia_name'); },
        desc(v){ return loc('trait_selenophobia',v); },
        type: 'major',
        origin: 'arraak',
        taxonomy: 'production',
        val: -120,
        vars(r){
            // [Max bonus]
            return traitScale(r || traitRank('selenophobia') || 1, [1], [4], [7]);
        },
    },
    leathery: { // Morale penalty from some weather conditions are reduced.
        name(){ return loc('trait_leathery_name'); },
        desc(v){ return loc('trait_leathery',v); },
        type: 'major',
        origin: 'pterodacti',
        taxonomy: 'production',
        val: 40,
        vars(r){
            // Morale loss (Base value is 5)
            return traitScale(r || traitRank('leathery') || 1, [5], [2], [-1]);
        },
    },
    pessimistic: { // Minor increase to stress
        name(){ return loc('trait_pessimistic_name'); },
        desc(v){ return loc('trait_pessimistic',v); },
        type: 'major',
        origin: 'pterodacti',
        taxonomy: 'production',
        val: -20,
        vars(r){
            return traitScale(r || traitRank('pessimistic') || 1, [5], [2], [0]);
        },
    },
    hoarder: { // Banks can store 20% more money
        name(){ return loc('trait_hoarder_name'); },
        desc(v){ return loc('trait_hoarder',v); },
        type: 'major',
        origin: 'dracnid',
        taxonomy: 'resource',
        val: 80,
        vars(r){
            return traitScale(r || traitRank('hoarder') || 1, [3], [20], [35]);
        },
    },
    solitary: { // Cabins are cheaper however cottages cost more
        name(){ return loc('trait_solitary_name'); },
        desc(v){ return loc('trait_solitary',v); },
        type: 'major',
        origin: 'dracnid',
        taxonomy: 'utility',
        val: -20,
        vars(r){
            // [Cabin Creep bonus, Cottage Creep malus]
            return traitScale(r || traitRank('solitary') || 1, [0.01,0.03], [0.02,0.02], [0.028,0.012]);
        },
    },
    kindling_kindred: { // Lumber is no longer a resource, however other costs are increased for anything that would have used lumber to compensate.
        name(){ return loc('trait_kindling_kindred_name'); },
        desc(v){ return loc('trait_kindling_kindred',v); },
        type: 'major',
        origin: 'entish',
        taxonomy: 'resource',
        val: 160,
        vars(r){
            return traitScale(r || traitRank('kindling_kindred') || 1, [12], [5], [2]);
        },
    },
    iron_wood: { // Removes Plywood as a resource, adds attack bonus
        name(){ return loc('trait_iron_wood_name'); },
        desc(v){ return global.race['iceage'] && !hallowed.active ? loc('trait_iron_wood_alt',v) : loc('trait_iron_wood',v); },
        type: 'major',
        origin: 'entish',
        taxonomy: 'resource',
        val: 80,
        vars(r){
            return traitScale(r || traitRank('iron_wood') || 1, [3], [12], [21]);
        },
    },
    pyrophobia: { // Smelter productivity is reduced
        name(){ return loc('trait_pyrophobia_name'); },
        desc(v){ return loc('trait_pyrophobia',v); },
        type: 'major',
        origin: 'entish',
        taxonomy: 'resource',
        val: -80,
        vars(r){
            return traitScale(r || traitRank('pyrophobia') || 1, [16], [10], [5]);
        }
    },
    catnip: { // Attract Cats
        name(){ return loc('trait_catnip_name'); },
        desc(v){ return loc('trait_catnip',v); },
        type: 'major',
        origin: 'entish',
        taxonomy: 'production',
        val: 20,
        vars(r){
            switch (rankTier(r || traitRank('catnip') || 1)){
                case 0.1:
                    return [1,2];
                case 0.25:
                    return [1,2];
                case 0.5:
                    return [1,2];
                case 1:
                    return [1,2];
                case 2:
                    return [1,2];
                case 3:
                    return [2,2];
                case 4:
                    return [2,4];
            }
        }
    },
    hyper: { // The game moves at a 5% faster pace
        name(){ return loc('trait_hyper_name'); },
        desc(v){ return loc('trait_hyper',v); },
        type: 'major',
        origin: 'cacti',
        taxonomy: 'utility',
        val: 80,
        vars(r){
            return traitScale(r || traitRank('hyper') || 1, [1], [5], [8]);
        }
    },
    skittish: { // Thunderstorms lower all production
        name(){ return loc('trait_skittish_name'); },
        desc(v){ return loc('trait_skittish',v); },
        type: 'major',
        origin: 'cacti',
        taxonomy: 'production',
        val: -80,
        vars(r){
            return traitScale(r || traitRank('skittish') || 1, [20], [12], [4]);
        }
    },
    fragrant: { // Reduced Hunting effectiveness
        name(){ return loc('trait_fragrant_name'); },
        desc(v){ return loc('trait_fragrant',v); },
        type: 'major',
        origin: 'pinguicula',
        taxonomy: 'resource',
        val: -60,
        vars(r){
            return traitScale(r || traitRank('fragrant') || 1, [40], [20], [10]);
        }
    },
    sticky: { // Food req lowered, Increase Combat Rating
        name(){ return loc('trait_sticky_name'); },
        desc(v){ return loc('trait_sticky',v); },
        type: 'major',
        origin: 'pinguicula',
        taxonomy: 'combat',
        val: 60,
        vars(r){
            // [Food Consumption, Army Bonus]
            return traitScale(r || traitRank('sticky') || 1, [3,3], [20,15], [35,22]);
        }
    },
    anise: { // Attract Dogs
        name(){ return loc('trait_anise_name'); },
        desc(v){ return loc('trait_anise',v); },
        type: 'major',
        origin: 'pinguicula',
        taxonomy: 'production',
        val: 20,
        vars(r){
            switch (rankTier(r || traitRank('anise') || 1)){
                case 0.1:
                    return [1,1];
                case 0.25:
                    return [1,1];
                case 0.5:
                    return [1,1];
                case 1:
                    return [1,1];
                case 2:
                    return [1,1];
                case 3:
                    return [2,1];
                case 4:
                    return [2,3];
            }
        }
    },
    infectious: { // Attacking has a chance to infect other creatures and grow your population
        name(){ return loc('trait_infectious_name'); },
        desc(v){ return loc('trait_infectious',v); },
        type: 'major',
        origin: 'sporgar',
        taxonomy: 'combat',
        val: 80,
        vars(r){
            // [Ambush, Raid, Pillage, Assault, Siege]
            return traitScale(r || traitRank('infectious') || 1, [1,2,3,6,15], [2,3,5,10,25], [3,5,8,14,34]);
        }
    },
    parasite: { // You can only reproduce by infecting victims, spores sometimes find a victim when it's windy
        name(){ return loc('trait_parasite_name'); },
        desc(v){ return loc('trait_parasite',v); },
        type: 'major',
        origin: 'sporgar',
        taxonomy: 'combat',
        val: -80,
        vars(r){
            // [Starting Soldiers, Loot Penalty, Assembly Cooldown Days]
            return traitScale(r || traitRank('parasite') || 1, [0,12,6], [2,6,3], [3,0,0]);
        }
    },
    toxic: { // Factory type jobs are more productive
        name(){ return loc('trait_toxic_name'); },
        desc(v){ return loc('trait_toxic',v); },
        type: 'major',
        origin: 'shroomi',
        taxonomy: 'resource',
        val: 100,
        vars(r){
            // [Lux Fur Alloy Polymer, Nano Stanene, Cement]
            return traitScale(r || traitRank('toxic') || 1, [3,2,8], [20,8,30], [35,14,50]);
        }
    },
    nyctophilia: { // Productivity is lost when it is sunny
        name(){ return loc('trait_nyctophilia_name'); },
        desc(v){ return loc('trait_nyctophilia',v); },
        type: 'major',
        origin: 'shroomi',
        taxonomy: 'production',
        val: -60,
        vars(r){
            // [Sunny, Cloudy]
            return traitScale(r || traitRank('nyctophilia') || 1, [12,6], [5,2], [1,1]);
        }
    },
    infiltrator: { // Cheap spies and sometimes steal tech from rivals
        name(){ return loc('trait_infiltrator_name'); },
        desc(v){ return loc('trait_infiltrator',v); },
        type: 'major',
        origin: 'moldling',
        taxonomy: 'utility',
        val: 80,
        vars(r){ // [Steal Cap]
            return traitScale(r || traitRank('infiltrator') || 1, [120], [90], [75]);
        }
    },
    hibernator: { // Lower activity during winter
        name(){ return loc('trait_hibernator_name'); },
        desc(v){ return loc('trait_hibernator',v); },
        type: 'major',
        origin: 'moldling',
        taxonomy: 'production',
        val: -60,
        vars(r){
            // [Food Consumption, Production]
            return traitScale(r || traitRank('hibernator') || 1, [10,10], [25,8], [40,4]);
        }
    },
    cannibalize: { // Eat your own for buffs
        name(){ return loc('trait_cannibalize_name'); },
        desc(v){ return loc('trait_cannibalize',v); },
        type: 'major',
        origin: 'mantis',
        taxonomy: 'utility',
        val: 100,
        vars(r){
            return traitScale(r || traitRank('cannibalize') || 1, [6], [15], [24]);
        }
    },
    frail: { // More soldiers die in combat
        name(){ return loc('trait_frail_name'); },
        desc(v){ return loc('trait_frail',v); },
        type: 'major',
        origin: 'mantis',
        taxonomy: 'combat',
        val: -40,
        vars(r){
            // [Win Deaths, Loss Deaths]
            switch (rankTier(r || traitRank('frail') || 1)){
                case 0.1:
                    return [3,4];
                case 0.25:
                    return [3,3];
                case 0.5:
                    return [2,3];
                case 1:
                    return [2,2];
                case 2:
                    return [1,2];
                case 3:
                    return [1,1];
                case 4:
                    return [0,1];
            }
        }
    },
    malnutrition: { // The rationing penalty is weaker
        name(){ return loc('trait_malnutrition_name'); },
        desc(v){ return loc('trait_malnutrition',v); },
        type: 'major',
        origin: 'mantis',
        taxonomy: 'production',
        val: 20,
        vars(r){
            return traitScale(r || traitRank('malnutrition') || 1, [8], [25], [60]);
        }
    },
    claws: { // Raises maximum bound for army score roll
        name(){ return loc('trait_claws_name'); },
        desc(v){ return loc('trait_claws',v); },
        type: 'major',
        origin: 'scorpid',
        taxonomy: 'combat',
        val: 100,
        vars(r){
            return traitScale(r || traitRank('claws') || 1, [5], [25], [38]);
        }
    },
    atrophy: { // More prone to starvation
        name(){ return loc('trait_atrophy_name'); },
        desc(v){ return loc('trait_atrophy',v); },
        type: 'major',
        origin: 'scorpid',
        taxonomy: 'production',
        val: -20,
        vars(r){
            return traitScale(r || traitRank('atrophy') || 1, [0.4], [0.15], [0.06]);
        }
    },
    hivemind: { // Jobs with low citizen counts assigned to them have reduced output, but those with high numbers have increased output.
        name(){ return loc('trait_hivemind_name'); },
        desc(v){ return loc('trait_hivemind',v); },
        type: 'major',
        origin: 'antid',
        taxonomy: 'production',
        val: 180,
        vars(r){
            return traitScale(r || traitRank('hivemind') || 1, [13], [10], [6]);
        }
    },
    tunneler: { // Mines and Coal Mines are cheaper.
        name(){ return loc('trait_tunneler_name'); },
        desc(v){ return loc('trait_tunneler',v); },
        type: 'major',
        origin: 'antid',
        taxonomy: 'utility',
        val: 40,
        vars(r){
            return traitScale(r || traitRank('tunneler') || 1, [0.001], [0.01], [0.02]);
        }
    },
    blood_thirst: { // Combat causes a temporary increase in morale
        name(){ return loc('trait_blood_thirst_name'); },
        desc(v){ return loc('trait_blood_thirst',v); },
        type: 'major',
        origin: 'sharkin',
        taxonomy: 'combat',
        val: 100,
        vars(r){
            // [Cap]
            return traitScale(r || traitRank('blood_thirst') || 1, [150000], [1000000], [5000000]);
        }
    },
    apex_predator: { // Hunting and Combat ratings are significantly higher, but you can't use armor
        name(){ return loc('trait_apex_predator_name'); },
        desc(v){ return loc('trait_apex_predator',v); },
        type: 'major',
        origin: 'sharkin',
        taxonomy: 'combat',
        val: 120,
        vars(r){
            // [Combat, Hunting]
            return traitScale(r || traitRank('apex_predator') || 1, [10,15], [30,50], [50,70]);
        }
    },
    invertebrate: { // You have no bones
        name(){ return loc('trait_invertebrate_name'); },
        desc(v){ return loc('trait_invertebrate',v); },
        type: 'major',
        origin: 'octigoran',
        taxonomy: 'combat',
        val: -40,
        vars(r){
            return traitScale(r || traitRank('invertebrate') || 1, [30], [10], [4]);
        }
    },
    suction_grip: { // Global productivity boost
        name(){ return loc('trait_suction_grip_name'); },
        desc(v){ return loc('trait_suction_grip',v); },
        type: 'major',
        origin: 'octigoran',
        taxonomy: 'production',
        val: 80,
        vars(r){
            return traitScale(r || traitRank('suction_grip') || 1, [3], [8], [15]);
        }
    },
    befuddle: { // Spy actions complete in 1/2 time
        name(){ return loc('trait_befuddle_name'); },
        desc(v){ return loc('trait_befuddle',v); },
        type: 'major',
        origin: 'dryad',
        taxonomy: 'utility',
        val: 80,
        vars(r){
            return traitScale(r || traitRank('befuddle') || 1, [10], [50], [90]);
        }
    },
    environmentalist: { // Use renewable energy instead of dirtly coal & oil power.
        name(){ return loc('trait_environmentalist_name'); },
        desc(v){ return loc('trait_environmentalist',v); },
        type: 'major',
        origin: 'dryad',
        taxonomy: 'utility',
        val: -100,
        vars(r){
            // [power adjustment, windmill power]
            return traitScale(r || traitRank('environmentalist') || 1, [-2.5,1], [-1,1.35], [0,1.5]);
        }
    },
    unorganized: { // Increased time between revolutions
        name(){ return loc('trait_unorganized_name'); },
        desc(v){ return loc('trait_unorganized',v); },
        type: 'major',
        origin: 'satyr',
        taxonomy: 'utility',
        val: -40,
        vars(r){
            return traitScale(r || traitRank('unorganized') || 1, [100], [50], [25]);
        }
    },
    musical: { // Entertainers are more effective
        name(){ return loc('trait_musical_name'); },
        desc(v){ return loc('trait_musical',v); },
        type: 'major',
        origin: 'satyr',
        taxonomy: 'production',
        val: 100,
        vars(r){
            return traitScale(r || traitRank('musical') || 1, [0.15], [1], [1.25]);
        }
    },
    revive: { // Soldiers sometimes self res
        name(){ return loc('trait_revive_name'); },
        desc(v){ return loc('trait_revive',v); },
        type: 'major',
        origin: 'phoenix',
        taxonomy: 'combat',
        val: 80,
        vars(r){
            // [cold win, normal win, hot win, cold loss, normal loss, hot loss, hell]
            return traitScale(r || traitRank('revive') || 1, [8,6,2,9,7,3.5,4], [5,3,1.5,6,4,2,3], [2.5,1.2,1,3.5,2,1,2]);
        }
    },
    slow_regen: { // Your soldiers wounds heal slower.
        name(){ return loc('trait_slow_regen_name'); },
        desc(v){ return loc('trait_slow_regen',v); },
        type: 'major',
        origin: 'phoenix',
        taxonomy: 'combat',
        val: -80,
        vars(r){
            return traitScale(r || traitRank('slow_regen') || 1, [45], [25], [12]);
        }
    },
    forge: { // Smelters do not require fuel, boosts geothermal power
        name(){ return loc('trait_forge_name'); },
        desc(v){ return loc('trait_forge',v); },
        type: 'major',
        origin: 'salamander',
        taxonomy: 'utility',
        val: 80,
        vars(r){
            return traitScale(r || traitRank('forge') || 1, [0.25], [2], [3.5]);
        }
    },
    autoignition: { // Library knowledge bonus reduced
        name(){ return loc('trait_autoignition_name'); },
        desc(v){ return loc('trait_autoignition',v); },
        type: 'major',
        origin: 'salamander',
        taxonomy: 'utility',
        val: -80,
        vars(r){
            return traitScale(r || traitRank('autoignition') || 1, [5], [2], [0.5]);
        }
    },
    blurry: { // Increased success chance of spies // Warlord improves Reapers
        name(){ return loc('trait_blurry_name'); },
        desc(v){ return loc('trait_blurry',v); },
        type: 'major',
        origin: 'yeti',
        taxonomy: 'utility',
        val: 100,
        vars(r){
            return traitScale(r || traitRank('blurry') || 1, [5], [25], [45]);
        }
    },
    snowy: { // You lose morale if it's not snowing
        name(){ return loc('trait_snowy_name'); },
        desc(v){ return loc('trait_snowy',v); },
        type: 'major',
        origin: 'yeti',
        taxonomy: 'production',
        val: -60,
        vars(r){
            // [Not Hot, Hot]
            return traitScale(r || traitRank('snowy') || 1, [5,12], [2,5], [1,2]);
        }
    },
    ravenous: { // Drastically increases food consumption
        name(){ return loc('trait_ravenous_name'); },
        desc(v){ return loc('trait_ravenous',v); },
        type: 'major',
        origin: 'wendigo',
        taxonomy: 'resource',
        val: -100,
        vars(r){
            // [Extra Food Consumed, Stockpile Divisor]
            return traitScale(r || traitRank('ravenous') || 1, [35,2], [20,3], [8,4]);
        }
    },
    ghostly: { // More souls from hunting and soul wells, increased soul gem drop chance
        name(){ return loc('trait_ghostly_name'); },
        desc(v){ return loc('trait_ghostly',v); },
        type: 'major',
        origin: 'wendigo',
        taxonomy: 'utility',
        val: 100,
        vars(r){
            // [Hunting Food, Soul Well Food, Soul Gem Adjust]
            return traitScale(r || traitRank('ghostly') || 1, [15,1.1,2], [50,1.5,15], [70,1.8,23]);
        }
    },
    lawless: { // Government lockout timer is reduced by 90%
        name(){ return loc('trait_lawless_name'); },
        desc(v){ return loc('trait_lawless',v); },
        type: 'major',
        origin: 'tuskin',
        taxonomy: 'utility',
        val: 60,
        vars(r){
            return traitScale(r || traitRank('lawless') || 1, [20], [90], [99]);
        }
    },
    mistrustful: { // Lose standing with rival cities quicker
        name(){ return loc('trait_mistrustful_name'); },
        desc(v){ return loc('trait_mistrustful',v); },
        type: 'major',
        origin: 'tuskin',
        taxonomy: 'utility',
        val: -20,
        vars(r){
            return traitScale(r || traitRank('mistrustful') || 1, [5], [2], [1]);
        }
    },
    humpback: { // Starvation resistance and miner/lumberjack boost
        name(){ return loc('trait_humpback_name'); },
        desc(v){ return loc('trait_humpback',v); },
        type: 'major',
        origin: 'kamel',
        taxonomy: 'resource',
        val: 80,
        vars(r){
            // [Starve Resist, Miner/Lumber boost]
            return traitScale(r || traitRank('humpback') || 1, [0.15, 5], [0.5, 20], [0.85, 35]);
        }
    },
    thalassophobia: { // Wharves are unavailable
        name(){ return loc('trait_thalassophobia_name'); },
        desc(v){ return loc('trait_thalassophobia',v); },
        type: 'major',
        origin: 'kamel',
        taxonomy: 'utility',
        val: -80
    },
    unfavored: { // Zodiac Signs give negative Effects
        name(){ return loc('trait_unfavored_name'); },
        desc(v){ return loc('trait_unfavored',v); },
        type: 'major',
        origin: 'kamel',
        taxonomy: 'utility',
        val: -80,
        vars(r){
            // [Negative Sign Intensity]
            return traitScale(r || traitRank('unfavored') || 1, [175], [100], [25]);
        }
    },
    fiery: { // Major war bonus
        name(){ return loc('trait_fiery_name'); },
        desc(v){ return loc('trait_fiery',v); },
        type: 'major',
        origin: 'balorg',
        taxonomy: 'combat',
        val: 200,
        vars(r){
            // [Combat Bonus, Hunting Bonus]
            return traitScale(r || traitRank('fiery') || 1, [20,12], [65,25], [74,40]);
        }
    },
    terrifying: { // No one will trade with you
        name(){ return loc('trait_terrifying_name'); },
        desc(v){ return loc('trait_terrifying',v); },
        type: 'major',
        origin: 'balorg',
        taxonomy: 'resource',
        val: 120,
        vars(r){
            // [Titanium Low Roll, Titanium High Roll]
            return traitScale(r || traitRank('terrifying') || 1, [6,15], [12,32], [15,38]);
        }
    },
    slaver: { // You capture victims and force them to work for you
        name(){ return loc('trait_slaver_name'); },
        desc(v){ return loc('trait_slaver',v); },
        type: 'major',
        origin: 'balorg',
        taxonomy: 'production',
        val: 240,
        vars(r){
            return traitScale(r || traitRank('slaver') || 1, [0.05], [0.28], [0.33]);
        }
    },
    compact: { // You hardly take up any space at all
        name(){ return loc('trait_compact_name'); },
        desc(v){ return loc('trait_compact',v); },
        type: 'major',
        origin: 'imp',
        taxonomy: 'utility',
        val: 200,
        vars(r){
            // [Planet Creep, Space Creep]
            return traitScale(r || traitRank('compact') || 1, [0.003,0.002], [0.015,0.0075], [0.021,0.0092]);
        }
    },
    conniving: { // Better trade deals
        name(){ return loc('trait_conniving_name'); },
        desc(v){ return loc('trait_conniving',v); },
        type: 'major',
        origin: 'imp',
        taxonomy: 'resource',
        val: 80,
        vars(r){
            // [Buy Price, Sell Price]
            return traitScale(r || traitRank('conniving') || 1, [1,6], [5,15], [12,28]);
        }
    },
    pathetic: { // You suck at combat
        name(){ return loc('trait_pathetic_name'); },
        desc(v){ return loc('trait_pathetic',v); },
        type: 'major',
        origin: 'imp',
        taxonomy: 'combat',
        val: -100,
        vars(r){
            return traitScale(r || traitRank('pathetic') || 1, [40], [25], [12]);
        }
    },
    spiritual: { // Temples are 13% more effective
        name(){ return loc('trait_spiritual_name'); },
        desc(v){ return loc('trait_spiritual',v); },
        type: 'major',
        origin: 'seraph',
        taxonomy: 'production',
        val: 80,
        vars(r){
            return traitScale(r || traitRank('spiritual') || 1, [6], [13], [20]);
        }
    },
    truthful: { // Bankers are less effective
        name(){ return loc('trait_truthful_name'); },
        desc(v){ return loc('trait_truthful',v); },
        type: 'major',
        origin: 'seraph',
        taxonomy: 'resource',
        val: -140,
        vars(r){
            return traitScale(r || traitRank('truthful') || 1, [85], [50], [15]);
        }
    },
    unified: { // Start with unification
        name(){ return loc('trait_unified_name'); },
        desc(v){ return loc('trait_unified',v); },
        type: 'major',
        origin: 'seraph',
        taxonomy: 'production',
        val: 80,
        vars(r){
            // [Bonus to unification]
            return traitScale(r || traitRank('unified') || 1, [0], [3], [8]);
        }
    },
    rainbow: { // Gain a bonus if sunny after raining
        name(){ return loc('trait_rainbow_name'); },
        desc(v){ return loc('trait_rainbow',v); },
        type: 'major',
        origin: 'unicorn',
        taxonomy: 'production',
        val: 60,
        vars(r){
            return traitScale(r || traitRank('rainbow') || 1, [10], [50], [120]);
        }
    },
    gloomy: { // Gain a bonus if cloudy
        name(){ return loc('trait_gloomy_name'); },
        desc(v){ return loc('trait_gloomy',v); },
        type: 'major',
        origin: 'unicorn',
        taxonomy: 'production',
        val: 60,
        vars(r){
            return traitScale(r || traitRank('gloomy') || 1, [3], [10], [14]);
        }
    },
    magnificent: { // construct shrines to receive boons
        name(){ return loc('trait_magnificent_name'); },
        desc(v){ return loc('trait_magnificent',v); },
        type: 'major',
        origin: 'unicorn',
        taxonomy: 'utility',
        val: 120,
        vars(r){
            // [Knowledge Base, Knowledge Scale, Tax Bonus, Metal Bonus, Morale Bonus]
            return traitScale(r || traitRank('magnificent') || 1, [250, 1, 0.35, 0.65, 0.5], [400, 3, 1, 1, 1], [520, 3, 2.5, 2.5, 2.5]);
        }
    },
    noble: { // Unable to raise taxes above base value or set very low taxes
        name(){ return loc('trait_noble_name'); },
        desc(v){ return loc('trait_noble',v); },
        type: 'major',
        origin: 'unicorn',
        taxonomy: 'resource',
        val: -60,
        vars(r){
            // [min tax, max tax]
            return traitScale(r || traitRank('noble') || 1, [18,20], [10,20], [10,30]);
        }
    },
    imitation: { // You are an imitation of another species
        name(){ return loc('trait_imitation_name'); },
        desc(v){ return loc('trait_imitation',v); },
        type: 'major',
        origin: 'synth',
        taxonomy: 'utility',
        val: 180,
        vars(r){
            // [Postitive Trait Rank, Negative Trait Rank]
            return traitScale(r || traitRank('imitation') || 1, [0.25,0.1], [0.5,0.5], [0.75,1]);
        }
    },
    emotionless: { // You have no emotions, cold logic dictates your decisions
        name(){ return loc('trait_emotionless_name'); },
        desc(v){ return loc('trait_emotionless',v); },
        type: 'major',
        origin: 'synth',
        taxonomy: 'production',
        val: -80,
        vars(r){
            // [Entertainer Reduction, Stress Reduction]
            return traitScale(r || traitRank('emotionless') || 1, [55,8], [35,13], [18,16]);
        }
    },
    logical: { // Citizens add Knowledge
        name(){ return loc('trait_logical_name'); },
        desc(v){ return loc('trait_logical',v); },
        type: 'major',
        origin: 'synth',
        taxonomy: 'utility',
        val: 160,
        vars(r){
            // [Reduce Wardenclyffe Knowledge Cost, Knowledge per Citizen]
            return traitScale(r || traitRank('logical') || 1, [10,5], [100,25], [160,33]);
        }
    },
    shapeshifter: {
        name(){ return loc('trait_shapeshifter_name'); },
        desc(v){ return loc('trait_shapeshifter',v); },
        type: 'major',
        origin: 'nano',
        taxonomy: 'utility',
        val: 200,
        vars(r){
            // [Postitive Trait Rank, Negative Trait Rank]
            return traitScale(r || traitRank('shapeshifter') || 1, [0.25,0.25], [0.5,1], [0.75,1.5]);
        }
    },
    deconstructor: {
        name(){ return loc('trait_deconstructor_name'); },
        desc(v){ return loc('trait_deconstructor',v); },
        type: 'major',
        origin: 'nano',
        taxonomy: 'utility',
        val: -80,
        vars(r){
            return traitScale(r || traitRank('deconstructor') || 1, [25], [100], [150]);
        }
    },
    linked: {
        name(){ return loc('trait_linked_name'); },
        desc(v){ return loc('trait_linked',v); },
        type: 'major',
        origin: 'nano',
        taxonomy: 'utility',
        val: 80,
        vars(r){
            // [Quantum Bonus per Citizen, Softcap]
            return traitScale(r || traitRank('linked') || 1, [0.02,40], [0.1,80], [0.15,100]);
        }
    },
    dark_dweller: {
        name(){ return loc('trait_dark_dweller_name'); },
        desc(v){ return loc('trait_dark_dweller',v); },
        type: 'major',
        origin: 'ghast',
        taxonomy: 'resource',
        val: -60,
        vars(r){
            return traitScale(r || traitRank('dark_dweller') || 1, [99], [60], [25]);
        }
    },
    swift: {
        name(){ return loc('trait_swift_name'); },
        desc(v){ return loc('trait_swift',v); },
        type: 'major',
        origin: 'ghast',
        taxonomy: 'combat',
        val: 200,
        vars(r){
            // [Combat Bonus, Thrall Catch Bonus]
            return traitScale(r || traitRank('swift') || 1, [20,8], [75,45], [92,70]);
        }
    },
    anthropophagite: {
        name(){ return loc('trait_anthropophagite_name'); },
        desc(v){ return loc('trait_anthropophagite',v); },
        type: 'major',
        origin: 'ghast',
        taxonomy: 'utility',
        val: -40,
        vars(r){
            return traitScale(r || traitRank('anthropophagite') || 1, [0.25], [1], [2.5]);
        }
    },
    living_tool: {
        name(){ return loc('trait_living_tool_name'); },
        desc(v){ return loc('trait_living_tool',v); },
        type: 'major',
        origin: 'shoggoth',
        taxonomy: 'resource',
        val: 240,
        vars(r){
            // [Tool Factor, Crafting Factor]
            return traitScale(r || traitRank('living_tool') || 1, [0.5,2], [1,25], [1.25,45]);
        }
    },
    bloated: {
        name(){ return loc('trait_bloated_name'); },
        desc(v){ return loc('trait_bloated',v); },
        type: 'major',
        origin: 'shoggoth',
        taxonomy: 'utility',
        val: -200,
        vars(r){
            // [Costs are higher]
            return traitScale(r || traitRank('bloated') || 1, [30], [15], [4]);
        }
    },
    artisan: {
        name(){ return loc('trait_artisan_name'); },
        desc(v){ return loc('trait_artisan',v); },
        type: 'major',
        origin: 'dwarf',
        taxonomy: 'resource',
        val: 180,
        vars(r){
            // [Auto Crafting Boost, Manufacturing Boost, Improved Morale]
            return traitScale(r || traitRank('artisan') || 1, [15,8,0.15], [50,20,0.5], [80,35,0.65]);
        }
    },
    stubborn: {
        name(){ return loc('trait_stubborn_name'); },
        desc(v){ return loc('trait_stubborn',v); },
        type: 'major',
        origin: 'dwarf',
        taxonomy: 'utility',
        val: -100,
        vars(r){
            // Raises Knowledge cost of scientific advancements
            return traitScale(r || traitRank('stubborn') || 1, [20], [10], [3]);
        }
    },
    rogue: {
        name(){ return loc('trait_rogue_name'); },
        desc(v){ return loc('trait_rogue',v); },
        type: 'major',
        origin: 'raccoon',
        taxonomy: 'resource',
        val: 120,
        vars(r){
            // [Randomly Steal Things]
            return traitScale(r || traitRank('rogue') || 1, [4], [10], [16]);
        }
    },
    untrustworthy: {
        name(){ return loc('trait_untrustworthy_name'); },
        desc(v){ return loc('trait_untrustworthy',v); },
        type: 'major',
        origin: 'raccoon',
        taxonomy: 'utility',
        val: -80,
        vars(r){
            // [Financial Institutions Cost Extra]
            return traitScale(r || traitRank('untrustworthy') || 1, [8], [5], [2]);
        }
    },
    living_materials: {
        name(){ return loc('trait_living_materials_name'); },
        desc(v){ return loc('trait_living_materials',v); },
        type: 'major',
        origin: 'lichen',
        taxonomy: 'resource',
        val: 120,
        vars(r){
            // [Some building materials self replicate reducing cost of the next building]
            // [Lumber/Bone, Plywood/Boneweave, Furs/Flesh, Amber (not Stone/Clay)]
            return traitScale(r || traitRank('living_materials') || 1, [0.995], [0.97], [0.94]);
        }
    },
    unstable: {
        name(){ return loc('trait_unstable_name'); },
        desc(v){ return loc('trait_unstable',v); },
        type: 'major',
        origin: 'lichen',
        taxonomy: 'utility',
        val: -100,
        vars(r){
            // [Randomly Die]
            return traitScale(r || traitRank('unstable') || 1, [7,10], [4,10], [1,10]);
        }
    },
    elemental: {
        name(){ return loc('trait_elemental_name'); },
        desc(v){ return loc('trait_elemental',v); },
        type: 'major',
        origin: 'wyvern',
        taxonomy: 'utility',
        val: 100,
        vars(r){
            let element = 'fire';
            switch (global.city.biome || 'grassland'){
                case 'savanna':
                case 'forest':
                case 'swamp':
                    element = 'acid';
                    break;
                case 'grassland':
                case 'desert':
                case 'eden':
                    element = 'electric';
                    break;
                case 'oceanic':
                case 'tundra':
                case 'taiga':
                    element = 'frost';
                    break;
                case 'volcanic':
                case 'ashland':
                case 'hellscape':
                    element = 'fire';
                    break;
            }
            if(global.race['iceage']){
                element = 'frost'; // it be cold
            }
            // [Element, Electric, Acid, Fire, Frost, Combat]
            // [Type, Power, Industry, Smelting, Bioscience, Combat]
            return traitScale(r || traitRank('elemental') || 1, [element, 0.08, 0.01, 0.02, 0.005, 1], [element, 0.2, 0.06, 0.09, 0.03, 6], [element, 0.28, 0.12, 0.18, 0.06, 12]);
        }
    },
    chicken: {
        name(){ return loc('trait_chicken_name'); },
        desc(v){ return loc('trait_chicken',v); },
        type: 'major',
        origin: 'wyvern',
        taxonomy: 'combat',
        val: -160,
        vars(r){
            // [Hell Worse, Piracy Worse, Zombies Worse, Events Worse]
            return traitScale(r || traitRank('chicken') || 1, [110,20,20], [50,12,10], [20,3,4]);
        }
    },
    tusk: {
        name(){ return loc('trait_tusk_name'); },
        desc(v){ return loc('trait_tusk',v); },
        type: 'major',
        origin: 'narwhal',
        taxonomy: 'resource',
        val: 120,
        vars(r){
            let moisture = 0;
            switch (global.city.biome || 'grassland'){
                case 'oceanic':
                case 'swamp':
                    moisture = 30;
                    break;
                case 'eden':
                case 'forest':
                case 'grassland':
                case 'savanna':
                    moisture = 20;
                    break;
                case 'tundra':
                case 'taiga':
                    moisture = 10;
                    break;
                case 'desert':
                case 'volcanic':
                case 'ashland':
                case 'hellscape':
                    moisture = 0;
                    break;
            }
            if (global.race['iceage']){
                moisture = 10;
            }
            if (global.city.calendar.weather === 0 && global.city.calendar.temp > 0){
                moisture += 10;
            }

            // [Mining based on Attack, Attack Bonus]
            let tusk = traitScale(r || traitRank('tusk') || 1, [80,0.4], [160,1], [250,1.6]);
            return [tusk[0], Math.round(moisture * tusk[1])];
        }
    },
    blubber: {
        name(){ return loc('trait_blubber_name'); },
        desc(v){ return loc('trait_blubber',v); },
        type: 'major',
        origin: 'narwhal',
        taxonomy: 'resource',
        val: -60,
        vars(r){
            // [Refine your dead to make Oil]
            return traitScale(r || traitRank('blubber') || 1, [2.5], [1], [0.25]);
        }
    },
    ocular_power: {
        name(){ return loc('trait_ocular_power_name'); },
        desc(v){ return loc('trait_ocular_power',v); },
        type: 'major',
        origin: 'beholder',
        taxonomy: 'utility',
        val: 180,
        vars(r){
            // [Powers Active, Power Scaling]
            let rank = r || traitRank('ocular_power') || 1;
            return [rankStep(rank, [[0,1],[1,2],[1.67,3]]), traitScale(rank, [10], [75], [150])[0]];
        }
    },
    floating: {
        name(){ return loc('trait_floating_name'); },
        desc(v){ return loc('trait_floating',v); },
        type: 'major',
        origin: 'beholder',
        taxonomy: 'production',
        val: -60,
        vars(r){
            // [Wind lowers production]
            return traitScale(r || traitRank('floating') || 1, [16], [10], [4]);
        }
    },
    wish: {
        name(){ return loc('trait_wish_name'); },
        desc(v){ return loc('trait_wish',v); },
        type: 'major',
        origin: 'djinn',
        taxonomy: 'utility',
        val: 260,
        vars(r){
            // [Wish Cooldown Period]
            return traitScale(r || traitRank('wish') || 1, [2520], [1440], [540]);
        }
    },
    devious: {
        name(){ return loc('trait_devious_name'); },
        desc(v){ return loc('trait_devious',v); },
        type: 'major',
        origin: 'djinn',
        taxonomy: 'resource',
        val: -80,
        vars(r){
            // [Trade Less Productive]
            return traitScale(r || traitRank('devious') || 1, [35], [20], [8]);
        }
    },
    grenadier: {
        name(){ return loc('trait_grenadier_name'); },
        desc(v){ return loc('trait_grenadier',v); },
        type: 'major',
        origin: 'bombardier',
        taxonomy: 'combat',
        val: 120,
        vars(r){
            // [More Powerful Soldiers but less of them]
            return traitScale(r || traitRank('grenadier') || 1, [100], [150], [225]);
        }
    },
    aggressive: {
        name(){ return loc('trait_aggressive_name'); },
        desc(v){ return loc('trait_aggressive',v); },
        type: 'major',
        origin: 'bombardier',
        taxonomy: 'combat',
        val: -40,
        vars(r){
            // [Major Death, Minor Death]
            return traitScale(r || traitRank('aggressive') || 1, [35,14], [20,8], [5,2]);
        }
    },
    empowered: {
        name(){ return loc('trait_empowered_name'); },
        desc(v){ return loc('trait_empowered',v); },
        type: 'major',
        origin: 'nephilim',
        taxonomy: 'utility',
        val: 160,
        vars(r){
// Major and genus rank bonuses; Empowered ranks cap at 2.
            return traitScale(Math.min(2, r || traitRank('empowered') || 1), [0.01,0.005], [0.2,0.1], [0.4,0.2]);
        }
    },
    blasphemous: {
        name(){ return loc('trait_blasphemous_name'); },
        desc(v){ return loc('trait_blasphemous',v); },
        type: 'major',
        origin: 'nephilim',
        taxonomy: 'production',
        val: -100,
        vars(r){
            // [Temples less effective]
            return traitScale(r || traitRank('blasphemous') || 1, [25], [10], [4]);
        }
    },
    deep_power: { //increased mastery, mastery effects can be distributed along the different stats they provide
        name(){ return loc('trait_deep_power_name'); },
        desc(v){ return loc('trait_deep_power',v); },
        type: 'genus',
        origin: 'primordial',
        taxonomy: 'combat',
        val: 180,
        vars(r){
            // [mastery increase multiplier]
            return traitScale(r || traitRank('deep_power') || 1, [0], [12], [22]);
        }
    },
    ancient: { //reduced quantum level
        name(){ return loc('trait_ancient_name'); },
        desc(v){ return loc('trait_ancient',v); },
        type: 'genus',
        origin: 'primordial',
        taxonomy: 'resource',
        val: -160,
        vars(r){
            // [reduction to quantum in percentage]
            return traitScale(r || traitRank('ancient') || 1, [35], [20], [12]);
        }
    },
    scrounger: { //scavengers are available, scavengers produce raider resources
        name(){ return loc('trait_scrounger_name'); },
        desc(v){ return loc('trait_scrounger',v); },
        type: 'major',
        origin: 'raptors',
        taxonomy: 'production',
        val: 100,
        vars(r){
            // [Percentage of raider production]
            return traitScale(r || traitRank('scrounger') || 1, [10], [50], [110]);
        }
    },
    nostalgic: { //morale reduction for science/high tech techs.
        name(){ return loc('trait_nostalgic_name'); },
        desc(v){
            return loc('trait_nostalgic',v);
        },
        type: 'major',
        origin: 'raptors',
        taxonomy: 'production',
        val: -120,
        vars(r){
            // [morale reduction per tech]
            return traitScale(r || traitRank('nostalgic') || 1, [2], [1], [0.55]);
        }
    },
    humongous: { //general production, storage and citizen workers increased in strength. Building cost and cost creep increased (UNIMPLEMENTED)
        name(){ return loc('trait_humongous_name'); },
        desc(v){ return loc('trait_humongous',v); },
        type: 'major',
        origin: 'rexicus',
        taxonomy: 'utility',
        val: 240,
        vars(r){
            // [production/storage/job mult, building cost/creep mult]
            return traitScale(r || traitRank('humongous') || 1, [1.5, 1.6], [3.2, 3], [4, 3.6]);
        }
    },
    limited: { //reduced crafting
        name(){ return loc('trait_limited_name'); },
        desc(v){ return loc('trait_limited',v); },
        type: 'major',
        origin: 'rexicus',
        taxonomy: 'resource',
        val: -120,
        vars(r){
            // [reduction in percentage]
            return traitScale(r || traitRank('limited') || 1, [35], [15], [7]);
        }
    },
    wooly: { //citizens raise resource caps and trade routes
        name(){ return loc('trait_wooly_name'); },
        desc(v){ return loc('trait_wooly',v); },
        type: 'major',
        origin: 'mammuth',
        taxonomy: 'combat',
        val: 100,
        vars(r){
            // [percentage of warehouse storage per citizen, citizens needed per trade route]
            return traitScale(r || traitRank('wooly') || 1, [0.55, 16], [1, 12], [1.4, 10]);
        }
    },
    mourning: { //global production reduced when citizens die. (works similar to warmonger) (UNIMPLEMENTED)
        name(){ return loc('trait_mourning_name'); },
        desc(v){ return loc('trait_mourning',v); },
        type: 'major',
        origin: 'mammuth',
        taxonomy: 'production',
        val: -100,
        vars(r){
            // [citizen contribution]
            return traitScale(r || traitRank('mourning') || 1, [2.5], [1], [0.5]);
        }
    },
    ooze: { // you are some kind of ooze, everything is bad
        name(){ return loc('trait_ooze_name'); },
        desc(v){ return loc('trait_ooze',v); },
        type: 'major',
        origin: 'sludge',
        taxonomy: 'production',
        val: -1000,
        vars(r){
            // [All jobs worse, Theology weaker, Mastery weaker]
            return traitScale(r || traitRank('ooze') || 1, [25,30,50], [12,15,30], [6,8,18]);
        }
    },
    soul_eater: { // You eat souls for breakfast, lunch, and dinner
        name(){ return loc('trait_soul_eater_name'); },
        desc(v){ return loc('trait_soul_eater',v); },
        type: 'special',
        val: 0,
    },
    untapped: { // Untapped Potential
        name(){ return loc('trait_untapped_name'); },
        desc(v){ return loc('trait_untapped',v); },
        type: 'special',
        val: 0,
    },
    emfield: { // Your body produces a natural electromagnetic field that disrupts electriciy
        name(){ return loc('trait_emfield_name'); },
        desc(v){ return loc('trait_emfield',v); },
        type: 'special',
        val: -20,
    },
    // --- Minor traits -----
    // Genus restricts trait to that genus only.
    tactical: { // Army rating
        name(){ return loc('trait_tactical_name'); },
        desc(v){ return loc('trait_tactical',v); },
        type: 'minor',
        base: 'A',
        vars(r=1){ return [4*r]; },
    },
    analytical: { // Science output
        name(){ return loc('trait_analytical_name'); },
        desc(v){ return loc('trait_analytical',v); },
        type: 'minor',
        base: 'T',
        vars(r=1){ return [2*r]; },
    },
    promiscuous: { // Population growth; synths get cheaper citizens instead
        name(){ return loc('trait_promiscuous_name'); },
        desc(v){ return loc('trait_promiscuous',v); },
        type: 'special',
        base: 'C',
        vars(r=1){ return [2*r,4*r]; },
    },
    resilient: { // Coal, Oil and Helium-3 production
        name(){ return loc('trait_resilient_name'); },
        // Warlord has no coal miner; mining runs through the Tunneler, and Resilient lifts the rare
        // metals it brings up alongside the coal.
        desc(v){ return loc(global.race['warlord'] ? 'trait_resilient_warlord' : 'trait_resilient',v); },
        type: 'minor',
        base: 'G',
        vars(r=1){ return [6*r]; },
    },
    cunning: { // Market buy price
        name(){ return loc('trait_cunning_name'); },
        desc(v){ return loc('trait_cunning',v); },
        type: 'minor',
        base: 'A',
        vars(r=1){ return [3*r]; },
    },
    hardy: { // Factory output
        name(){ return loc('trait_hardy_name'); },
        desc(v){ return loc('trait_hardy',v); },
        type: 'minor',
        base: 'A',
        vars(r=1){ return [2*r]; },
    },
    ambidextrous: { // Crafting speed, and automated crafting
        name(){ return loc('trait_ambidextrous_name'); },
        desc(v){ return loc('trait_ambidextrous',v); },
        type: 'minor',
        base: 'C',
        vars(r=1){ return [6*r,4*r]; },
    },
    industrious: { // Mining output
        name(){ return loc('trait_industrious_name'); },
        desc(v){ return loc('trait_industrious',v); },
        type: 'minor',
        base: 'G',
        vars(r=1){ return [4*r]; },
    },
    content: { // Job stress: workers a job carries per stress point
        name(){ return loc('trait_content_name'); },
        desc(v){ return loc('trait_content',v); },
        type: 'special',
        base: 'A',
        vars(r=1){ return [0.4*r]; },
    },
    fibroblast: { // Soldier healing
        name(){ return loc('trait_fibroblast_name'); },
        desc(v){ return loc('trait_fibroblast',v); },
        type: 'minor',
        base: 'T',
        vars(r=1){ return [4*r]; },
    },
    metallurgist: { // Alloy production
        name(){ return loc('trait_metallurgist_name'); },
        desc(v){ return loc('trait_metallurgist',v); },
        type: 'minor',
        base: 'C',
        vars(r=1){ return [6*r]; },
    },
    gambler: { // Casino income
        name(){ return loc('trait_gambler_name'); },
        desc(v){ return loc('trait_gambler',v); },
        type: 'minor',
        base: 'G',
        vars(r=1){ return [8*r]; },
    },
    persuasive: { // Trade route value
        name(){ return loc('trait_persuasive_name'); },
        desc(v){ return loc('trait_persuasive',v); },
        type: 'minor',
        base: 'A',
        vars(r=1){ return [2*r]; },
    },
    refiner: { // Smelter output
        name(){ return loc('trait_refiner_name'); },
        desc(v){ return loc('trait_refiner',v); },
        type: 'minor',
        base: 'T',
        vars(r=1){ return [3*r]; },
    },
    plunderer: { // Loot taken from campaigns against rival governments
        name(){ return loc('trait_plunderer_name'); },
        desc(v){ return loc('trait_plunderer',v); },
        type: 'minor',
        base: 'C',
        vars(r=1){ return [6*r]; },
    },
    stockpiler: { // Crate and Container capacity
        name(){ return loc('trait_stockpiler_name'); },
        desc(v = traits.stockpiler.vars()){
            return loc('trait_stockpiler',[...v,
                loc('resource_Crates_plural'),
                loc('resource_Containers_plural')]);
        },
        type: 'minor',
        base: 'G',
        vars(r=1){ return [2*r]; },
    },
    assayer: { // Iridium and Titanium production
        name(){ return loc('trait_assayer_name'); },
        desc(v = traits.assayer.vars()){
            return loc('trait_assayer',[...v,
                global.resource.Iridium.name,
                global.resource.Titanium.name]);
        },
        type: 'minor',
        base: 'A',
        vars(r=1){ return [5*r]; },
    },
    nanoweaver: { // Nano Tube, Graphene, and Stanene production
        name(){ return loc('trait_nanoweaver_name'); },
        desc(v = traits.nanoweaver.vars()){
            return loc('trait_nanoweaver',[...v,
                global.resource.Nano_Tube.name,
                global.resource.Graphene.name,
                global.resource.Stanene.name]);
        },
        type: 'minor',
        base: 'T',
        vars(r=1){ return [5*r]; },
    },
    sapper: { // Cement production; unsuited to fliers
        name(){ return loc('trait_sapper_name'); },
        desc(v = traits.sapper.vars()){ return loc('trait_sapper',[...v,global.resource.Cement.name]); },
        type: 'minor',
        base: 'C',
        vars(r=1){ return [5*r]; },
    },
    arborist: { // Lumber production; unsuited to kindling and smoldering
        name(){ return loc('trait_arborist_name'); },
        desc(v = traits.arborist.vars()){ return loc('trait_arborist',[...v,global.resource.Lumber.name]); },
        type: 'minor',
        base: 'G',
        vars(r=1){ return [6*r]; },
    },
    stonecutter: { // Stone production; unsuited to sappy
        name(){ return loc('trait_stonecutter_name'); },
        desc(v = traits.stonecutter.vars()){ return loc('trait_stonecutter',[...v,global.resource.Stone.name]); },
        type: 'minor',
        base: 'T',
        vars(r=1){ return [6*r]; },
    },
    archivist: { // Maximum Knowledge
        name(){ return loc('trait_archivist_name'); },
        desc(v = traits.archivist.vars()){ return loc('trait_archivist',[...v,global.resource.Knowledge.name]); },
        type: 'minor',
        base: 'T',
        vars(r=1){ return [0.5*r]; },
    },
    bureaucrat: { // Tax revenue
        name(){ return loc('trait_bureaucrat_name'); },
        desc(v){ return loc('trait_bureaucrat',v); },
        type: 'minor',
        base: 'C',
        vars(r=1){ return [4*r]; },
    },
    zealot: { // Temple output
        name(){ return loc('trait_zealot_name'); },
        desc(v){ return loc('trait_zealot',v); },
        type: 'minor',
        base: 'G',
        vars(r=1){ return [0.5*r]; },
    },
    stargazer: { // Observatory knowledge
        name(){ return loc('trait_stargazer_name'); },
        desc(v = traits.stargazer.vars()){ return loc('trait_stargazer',[...v,global.resource.Knowledge.name]); },
        type: 'minor',
        base: 'A',
        vars(r=1){ return [5*r]; },
    },
    engineer: { // A.R.P.A. project progress
        name(){ return loc('trait_engineer_name'); },
        desc(v){ return loc('trait_engineer',v); },
        type: 'minor',
        base: 'T',
        vars(r=1){ return [2*r]; },
    },
    logistician: { // Trade route capacity
        name(){ return loc('trait_logistician_name'); },
        desc(v){ return loc('trait_logistician',v); },
        type: 'minor',
        base: 'C',
        vars(r=1){ return [10*r]; },
    },
    quartermaster: { // Soldier capacity
        name(){ return loc('trait_quartermaster_name'); },
        desc(v){ return loc('trait_quartermaster',v); },
        type: 'minor',
        base: 'G',
        vars(r=1){ return [4*r]; },
    },
    steward: { // Maximum storage, regular resources only
        name(){ return loc('trait_steward_name'); },
        desc(v){ return loc('trait_steward',v); },
        type: 'minor',
        base: 'A',
        vars(r=1){ return [2*r]; },
    },
    taskmaster: { // Output of every job
        name(){ return loc('trait_taskmaster_name'); },
        desc(v){ return loc('trait_taskmaster',v); },
        type: 'minor',
        base: 'T',
        vars(r=1){ return [1*r]; },
    },
    queuemaster: { // Building queue size, flat
        name(){ return loc('trait_queuemaster_name'); },
        desc(v){ return loc('trait_queuemaster',v); },
        type: 'minor',
        base: 'C',
        vars(r=1){ return [1*r]; },
    },
    guildmaster: { // Extra craftsman slots, flat
        name(){ return loc('trait_guildmaster_name'); },
        desc(v){ return loc('trait_guildmaster',v); },
        type: 'minor',
        base: 'G',
        vars(r=1){ return [2*r]; },
    },
    thaumaturge: { // Mana production; magic universe only
        name(){ return loc('trait_thaumaturge_name'); },
        desc(v = traits.thaumaturge.vars()){ return loc('trait_thaumaturge',[...v,global.resource.Mana.name]); },
        type: 'minor',
        base: 'C',
        vars(r=1){ return [4*r]; },
    },
    despot: { // Authority standing; evil universe only
        name(){ return loc('trait_despot_name'); },
        desc(v = traits.despot.vars()){ return loc('trait_despot',[...v,global.resource.Authority.name]); },
        type: 'minor',
        base: 'A',
        vars(r=1){ return [2*r]; },
    },
    versatile: { // Crafted goods output
        name(){ return loc('trait_versatile_name'); },
        desc(v){ return loc('trait_versatile',v); },
        type: 'minor',
        base: 'A',
        genus: 'humanoid',
        vars(r=1){ return [5*r]; },
    },
    ambusher: { // Soldier training speed
        name(){ return loc('trait_ambusher_name'); },
        desc(v){ return loc('trait_ambusher',v); },
        type: 'minor',
        base: 'T',
        genus: 'carnivore',
        vars(r=1){ return [5*r]; },
    },
    ruminant: { // Maximum population
        name(){ return loc('trait_ruminant_name'); },
        desc(v){ return loc('trait_ruminant',v); },
        type: 'minor',
        base: 'C',
        genus: 'herbivore',
        vars(r=1){ return [5*r]; },
    },
    opportunist: { // Mining output and crafting speed
        name(){ return loc('trait_opportunist_name'); },
        desc(v){ return loc('trait_opportunist',v); },
        type: 'minor',
        base: 'G',
        genus: 'omnivore',
        vars(r=1){ return [3*r]; },
    },
    frugal: { // Housing cost discount
        name(){ return loc('trait_frugal_name'); },
        desc(v){ return loc('trait_frugal',v); },
        type: 'minor',
        base: 'A',
        genus: 'small',
        vars(r=1){ return [1*r]; },
    },
    titanic: { // Manual labour output
        name(){ return loc('trait_titanic_name'); },
        desc(v){ return loc('trait_titanic',v); },
        type: 'minor',
        base: 'T',
        genus: 'giant',
        vars(r=1){ return [8*r]; },
    },
    moltskin: { // Passive Furs from population
        name(){ return loc('trait_moltskin_name'); },
        desc(v = traits.moltskin.vars()){ return loc('trait_moltskin',[...v,global.resource.Furs.name]); },
        type: 'minor',
        base: 'C',
        genus: 'reptilian',
        vars(r=1){ return [1*r]; },
    },
    featherlight: { // Ship speed; requires True Path
        name(){ return loc('trait_featherlight_name'); },
        desc(v){ return loc('trait_featherlight',v); },
        type: 'minor',
        base: 'G',
        genus: 'avian',
        vars(r=1){ return [5*r]; },
    },
    swarm: { // Population growth
        name(){ return loc('trait_swarm_name'); },
        desc(v){ return loc('trait_swarm',v); },
        type: 'minor',
        base: 'A',
        genus: 'insectoid',
        vars(r=1){ return [6*r]; },
    },
    chlorophyll: { // Amber production; requires sappy
        name(){ return loc('trait_chlorophyll_name'); },
        desc(v = traits.chlorophyll.vars()){ return loc('trait_chlorophyll',[...v,global.resource.Stone.name]); },
        type: 'minor',
        base: 'T',
        genus: 'plant',
        vars(r=1){ return [6*r]; },
    },
    mycelial: { // Soldier healing
        name(){ return loc('trait_mycelial_name'); },
        desc(v){ return loc('trait_mycelial',v); },
        type: 'minor',
        base: 'C',
        genus: 'fungi',
        vars(r=1){ return [6*r]; },
    },
    abyssal: { // Uranium, Oil and Helium-3 production
        name(){ return loc('trait_abyssal_name'); },
        desc(v = traits.abyssal.vars()){
            return loc('trait_abyssal',[...v,
                global.resource.Uranium.name,
                global.resource.Oil.name,
                global.resource.Helium_3.name]);
        },
        type: 'minor',
        base: 'G',
        genus: 'aquatic',
        vars(r=1){ return [8*r]; },
    },
    glamour: { // Morale
        name(){ return loc('trait_glamour_name'); },
        desc(v){ return loc('trait_glamour',v); },
        type: 'minor',
        base: 'A',
        genus: 'fey',
        vars(r=1){ return [5*r]; },
    },
    fireweave: { // Chrysotile production; requires smoldering
        name(){ return loc('trait_fireweave_name'); },
        desc(v = traits.fireweave.vars()){ return loc('trait_fireweave',[...v,global.resource.Chrysotile.name]); },
        type: 'minor',
        base: 'T',
        genus: 'heat',
        vars(r=1){ return [8*r]; },
    },
    frostbound: { // Building power discount
        name(){ return loc('trait_frostbound_name'); },
        desc(v){ return loc('trait_frostbound',v); },
        type: 'minor',
        base: 'C',
        genus: 'polar',
        vars(r=1){ return [1*r]; },
    },
    duneborn: { // Cement production
        name(){ return loc('trait_duneborn_name'); },
        desc(v = traits.duneborn.vars()){ return loc('trait_duneborn',[...v,global.resource.Cement.name]); },
        type: 'minor',
        base: 'G',
        genus: 'sand',
        vars(r=1){ return [8*r]; },
    },
    infernal: { // Combat effectiveness in Hell and mech damage; unsuited to True Path
        name(){ return loc('trait_infernal_name'); },
        desc(v){ return loc('trait_infernal',v); },
        type: 'minor',
        base: 'A',
        genus: 'demonic',
        vars(r=1){ return [6*r]; },
    },
    radiant: { // Temple output
        name(){ return loc('trait_radiant_name'); },
        desc(v){ return loc('trait_radiant',v); },
        type: 'minor',
        base: 'T',
        genus: 'angelic',
        vars(r=1){ return [1*r]; },
    },
    overclocked: { // Factory output
        name(){ return loc('trait_overclocked_name'); },
        desc(v){ return loc('trait_overclocked',v); },
        type: 'minor',
        base: 'C',
        genus: 'synthetic',
        vars(r=1){ return [5*r]; },
    },
    cerebral: { // Knowledge gain
        name(){ return loc('trait_cerebral_name'); },
        desc(v = traits.cerebral.vars()){ return loc('trait_cerebral',[...v,global.resource.Knowledge.name]); },
        type: 'minor',
        base: 'G',
        genus: 'eldritch',
        vars(r=1){ return [8*r]; },
    },
    fortify: { // gene fortification
        name(){ return loc('trait_fortify_name'); },
        desc(v){ return loc('trait_fortify',v); },
        type: 'special',
    },
    mastery: { // mastery booster
        name(){ return loc('trait_mastery_name'); },
        desc(v){ return loc('trait_mastery',v); },
        type: 'special',
        vars(r=1){ return [1*r]; },
    }
};

export const races = {
    protoplasm: {
        name: loc('race_protoplasm'),
        desc: loc('race_protoplasm_desc'),
        type: 'organism',
        home: loc('race_prehistoric'),
        entity: loc('race_protoplasm_entity'),
        traits: {},
        solar: {
            red: loc('race_human_solar_red'),
            hell: loc('race_human_solar_hell'),
            gas: loc('race_human_solar_gas'),
            gas_moon: loc('race_human_solar_gas_moon'),
            dwarf: loc('race_human_solar_dwarf'),
        },
        fanaticism: 'none',
        basic(){ return false; }
    },
    human: {
        name: loc(altRace('human') ? 'race_zombie' : 'race_human'),
        desc: loc(altRace('human') ? 'race_zombie_desc' : 'race_human_desc'),
        type: 'humanoid',
        home: loc('race_human_home'),
        entity: loc('race_human_entity'),
        traits: {
            creative: 1,
            diverse: 1
        },
        solar: {
            red: loc(altRace('human') ? 'race_zombie_solar_red' : 'race_human_solar_red'),
            hell: loc(altRace('human') ? 'race_zombie_solar_hell' : 'race_human_solar_hell'),
            gas: loc(altRace('human') ? 'race_zombie_solar_gas' : 'race_human_solar_gas'),
            gas_moon: loc(altRace('human') ? 'race_zombie_solar_gas_moon' : 'race_human_solar_gas_moon'),
            dwarf: loc(altRace('human') ? 'race_zombie_solar_dwarf' : 'race_human_solar_dwarf'),
        },
        fanaticism: 'creative',
        basic(){ return true; }
    },
    elven: {
        name: loc('race_elven'),
        desc: loc(altRace('elven') ? 'race_xmas_elf_desc' : 'race_elven_desc'),
        type: 'humanoid',
        home: loc(altRace('elven') ? 'race_xmas_elf_home' : 'race_elven_home'),
        entity: altRace('elven') ? loc('race_xmas_elf_entity') : loc('race_elven_entity'),
        traits: {
            studious: 1,
            arrogant: 1
        },
        solar: {
            red: loc(altRace('elven') ? 'race_xmas_elf_solar_red' : 'race_elven_solar_red'),
            hell: loc(altRace('elven') ? 'race_xmas_elf_solar_hell' : 'race_elven_solar_hell'),
            gas: loc(altRace('elven') ? 'race_xmas_elf_solar_gas' : 'race_elven_solar_gas'),
            gas_moon: loc(altRace('elven') ? 'race_xmas_elf_solar_gas_moon' : 'race_elven_solar_gas_moon'),
            dwarf: loc(altRace('elven') ? 'race_xmas_elf_solar_dwarf' : 'race_elven_solar_dwarf'),
        },
        fanaticism: 'studious',
        basic(){ return true; }
    },
    orc: {
        name: loc('race_orc'),
        desc: loc('race_orc_desc'),
        type: 'humanoid',
        home: loc('race_orc_home'),
        entity: loc('race_orc_entity'),
        traits: {
            brute: 1,
            angry: 1
        },
        solar: {
            red: loc('race_orc_solar_red'),
            hell: loc('race_orc_solar_hell'),
            gas: loc('race_orc_solar_gas'),
            gas_moon: loc('race_orc_solar_gas_moon'),
            dwarf: loc('race_orc_solar_dwarf'),
        },
        fanaticism: 'brute',
        basic(){ return true; }
    },
    cath: {
        name: loc('race_cath'),
        desc: loc('race_cath_desc'),
        type: 'carnivore',
        home: loc('race_cath_home'),
        entity: loc('race_cath_entity'),
        traits: {
            lazy: 1,
            curious: 1
        },
        solar: {
            red: loc('race_cath_solar_red'),
            hell: loc('race_cath_solar_hell'),
            gas: loc('race_cath_solar_gas'),
            gas_moon: loc('race_cath_solar_gas_moon'),
            dwarf: loc('race_cath_solar_dwarf'),
        },
        fanaticism: 'curious',
        basic(){ return true; }
    },
    wolven: {
        name: altRace('wolven') ? loc('race_rabbit') : loc('race_wolven'),
        desc: altRace('wolven') ? loc('race_rabbit_desc') : loc('race_wolven_desc'),
        type: 'carnivore',
        home: altRace('wolven') ? loc('race_rabbit_home') : loc('race_wolven_home'),
        entity: altRace('wolven') ? loc('race_rabbit_entity') : loc('race_wolven_entity'),
        traits: {
            pack_mentality: 1,
            tracker: 1
        },
        solar: {
            red: altRace('wolven') ? loc('race_rabbit_solar_red') : loc('race_wolven_solar_red'),
            hell: altRace('wolven') ? loc('race_rabbit_solar_hell') : loc('race_wolven_solar_hell'),
            gas: altRace('wolven') ? loc('race_rabbit_solar_gas') : loc('race_wolven_solar_gas'),
            gas_moon: altRace('wolven') ? loc('race_rabbit_solar_gas_moon') : loc('race_wolven_solar_gas_moon'),
            dwarf: altRace('wolven') ? loc('race_rabbit_solar_dwarf') : loc('race_wolven_solar_dwarf'),
        },
        fanaticism: 'tracker',
        basic(){ return true; }
    },
    vulpine: {
        name: altRace('vulpine') ? loc('race_chocolate_rabbit') : (loc(global.race.universe === 'magic' ? 'race_kitsune' : 'race_vulpine')),
        desc(){ return altRace('vulpine') ? loc('race_chocolate_rabbit_desc') : (loc('race_vulpine_desc',[loc(global.race.universe === 'magic' ? 'race_kitsune' : 'race_vulpine'), foxColor()])); },
        type: 'carnivore',
        home: altRace('vulpine') ? loc('race_chocolate_rabbit_home') : loc('race_vulpine_home'),
        entity: altRace('vulpine') ? loc('race_chocolate_rabbit_entity') : loc('race_vulpine_entity'),
        traits: {
            playful: 1,
            freespirit: 1
        },
        solar: {
            red: altRace('vulpine') ? loc('race_chocolate_rabbit_solar_red') : loc('race_vulpine_solar_red'),
            hell: altRace('vulpine') ? loc('race_chocolate_rabbit_solar_hell') : loc('race_vulpine_solar_hell'),
            gas: altRace('vulpine') ? loc('race_chocolate_rabbit_solar_gas') : loc('race_vulpine_solar_gas'),
            gas_moon: altRace('vulpine') ? loc('race_chocolate_rabbit_solar_gas_moon') : loc('race_vulpine_solar_gas_moon'),
            dwarf: altRace('vulpine') ? loc('race_chocolate_rabbit_solar_dwarf') : loc('race_vulpine_solar_dwarf'),
        },
        fanaticism: 'playful',
        basic(){ return true; }
    },
    centaur: {
        name: loc(altRace('centaur') ? 'race_reindeer' : 'race_centaur'),
        desc: loc(altRace('centaur') ? 'race_reindeer_desc' : 'race_centaur_desc'),
        type: 'herbivore',
        home: loc(altRace('centaur') ? 'race_reindeer_home' : 'race_centaur_home'),
        entity: loc(altRace('centaur') ? 'race_reindeer_entity' : 'race_centaur_entity'),
        traits: {
            sniper: 1,
            hooved: 1
        },
        solar: {
            red: loc(altRace('centaur') ? 'race_reindeer_solar_red' : 'race_centaur_solar_red'),
            hell: loc(altRace('centaur') ? 'race_reindeer_solar_hell' : 'race_centaur_solar_hell'),
            gas: loc(altRace('centaur') ? 'race_reindeer_solar_gas' : 'race_centaur_solar_gas'),
            gas_moon: loc(altRace('centaur') ? 'race_reindeer_solar_gas_moon' : 'race_centaur_solar_gas_moon'),
            dwarf: loc(altRace('centaur') ? 'race_reindeer_solar_dwarf' : 'race_centaur_solar_dwarf'),
        },
        fanaticism: 'sniper',
        basic(){ return true; }
    },
    rhinotaur: {
        name: loc('race_rhinotaur'),
        desc: loc('race_rhinotaur_desc'),
        type: 'herbivore',
        home: loc('race_rhinotaur_home'),
        entity: loc('race_rhinotaur_entity'),
        traits: {
            rage: 1,
            heavy: 1
        },
        solar: {
            red: loc('race_rhinotaur_solar_red'),
            hell: loc('race_rhinotaur_solar_hell'),
            gas: loc('race_rhinotaur_solar_gas'),
            gas_moon: loc('race_rhinotaur_solar_gas_moon'),
            dwarf: loc('race_rhinotaur_solar_dwarf'),
        },
        fanaticism: 'rage',
        basic(){ return true; }
    },
    capybara: {
        name: loc(altRace('capybara') ? 'race_donkey' : 'race_capybara'),
        desc: loc(altRace('capybara') ? 'race_donkey_desc' : 'race_capybara_desc'),
        type: 'herbivore',
        home: loc(altRace('capybara') ? 'race_donkey_home' : 'race_capybara_home'),
        entity: loc(altRace('capybara') ? 'race_donkey_entity' : 'race_capybara_entity'),
        traits: {
            gnawer: 1,
            calm: 1
        },
        solar: {
            red: loc(altRace('capybara') ? 'race_donkey_solar_red' : 'race_capybara_solar_red'),
            hell: loc(altRace('capybara') ? 'race_donkey_solar_hell' : 'race_capybara_solar_hell'),
            gas: loc(altRace('capybara') ? 'race_donkey_solar_gas' : 'race_capybara_solar_gas'),
            gas_moon: loc(altRace('capybara') ? 'race_donkey_solar_gas_moon' : 'race_capybara_solar_gas_moon'),
            dwarf: loc(altRace('capybara') ? 'race_donkey_solar_dwarf' : 'race_capybara_solar_dwarf'),
        },
        fanaticism: 'calm',
        basic(){ return true; }
    },
    /*bearkin: {
        name: loc('race_bearkin'),
        desc: loc('race_bearkin_desc'),
        type: 'omnivore',
        home: loc('race_bearkin_home'),
        entity: loc('race_bearkin_entity'),
        traits: {
            
        },
        solar: {
            red: loc('race_bearkin_solar_red'),
            hell: loc('race_bearkin_solar_hell'),
            gas: loc('race_bearkin_solar_gas'),
            gas_moon: loc('race_bearkin_solar_gas_moon'),
            dwarf: loc('race_bearkin_solar_dwarf'),
        },
        fanaticism: '',
        basic(){ return true; }
    },
    porkenari: {
        name: loc('race_porkenari'),
        desc: loc('race_porkenari_desc'),
        type: 'omnivore',
        home: loc('race_porkenari_home'),
        entity: loc('race_porkenari_entity'),
        traits: {
            
        },
        solar: {
            red: loc('race_porkenari_solar_red'),
            hell: loc('race_porkenari_solar_hell'),
            gas: loc('race_porkenari_solar_gas'),
            gas_moon: loc('race_porkenari_solar_gas_moon'),
            dwarf: loc('race_porkenari_solar_dwarf'),
        },
        fanaticism: '',
        basic(){ return true; }
    },
    hedgeoken: {
        name: loc('race_hedgeoken'),
        desc: loc('race_hedgeoken_desc'),
        type: 'omnivore',
        home: loc('race_hedgeoken_home'),
        entity: loc('race_hedgeoken_entity'),
        traits: {
            
        },
        solar: {
            red: loc('race_hedgeoken_solar_red'),
            hell: loc('race_hedgeoken_solar_hell'),
            gas: loc('race_hedgeoken_solar_gas'),
            gas_moon: loc('race_hedgeoken_solar_gas_moon'),
            dwarf: loc('race_hedgeoken_solar_dwarf'),
        },
        fanaticism: '',
        basic(){ return true; }
    },*/
    kobold: {
        name: loc('race_kobold'),
        desc: loc('race_kobold_desc'),
        type: 'small',
        home: loc('race_kobold_home'),
        entity: loc('race_kobold_entity'),
        traits: {
            pack_rat: 1,
            paranoid: 1
        },
        solar: {
            red: loc('race_kobold_solar_red'),
            hell: loc('race_kobold_solar_hell'),
            gas: loc('race_kobold_solar_gas'),
            gas_moon: loc('race_kobold_solar_gas_moon'),
            dwarf: loc('race_kobold_solar_dwarf'),
        },
        fanaticism: 'pack_rat',
        basic(){ return true; }
    },
    goblin: {
        name: loc('race_goblin'),
        desc: loc('race_goblin_desc'),
        type: 'small',
        home: loc('race_goblin_home'),
        entity: loc('race_goblin_entity'),
        traits: {
            greedy: 1,
            merchant: 1
        },
        solar: {
            red: loc('race_goblin_solar_red'),
            hell: loc('race_goblin_solar_hell'),
            gas: loc('race_goblin_solar_gas'),
            gas_moon: loc('race_goblin_solar_gas_moon'),
            dwarf: loc('race_goblin_solar_dwarf'),
        },
        fanaticism: 'merchant',
        basic(){ return true; }
    },
    gnome: {
        name: loc('race_gnome'),
        desc: loc('race_gnome_desc'),
        type: 'small',
        home: loc('race_gnome_home'),
        entity: loc('race_gnome_entity'),
        traits: {
            smart: 1,
            puny: 1
        },
        solar: {
            red: loc('race_gnome_solar_red'),
            hell: loc('race_gnome_solar_hell'),
            gas: loc('race_gnome_solar_gas'),
            gas_moon: loc('race_gnome_solar_gas_moon'),
            dwarf: loc('race_gnome_solar_dwarf'),
        },
        fanaticism: 'smart',
        basic(){ return true; }
    },
    ogre: {
        name: loc('race_ogre'),
        desc: loc('race_ogre_desc'),
        type: 'giant',
        home: loc('race_ogre_home'),
        entity: loc('race_ogre_entity'),
        traits: {
            dumb: 1,
            tough: 1
        },
        solar: {
            red: loc('race_ogre_solar_red'),
            hell: loc('race_ogre_solar_hell'),
            gas: loc('race_ogre_solar_gas'),
            gas_moon: loc('race_ogre_solar_gas_moon'),
            dwarf: loc('race_ogre_solar_dwarf'),
        },
        fanaticism: 'tough',
        basic(){ return true; }
    },
    cyclops: {
        name: loc('race_cyclops'),
        desc: loc('race_cyclops_desc'),
        type: 'giant',
        home: loc('race_cyclops_home'),
        entity: loc('race_cyclops_entity'),
        traits: {
            nearsighted: 1,
            intelligent: 1
        },
        solar: {
            red: loc('race_cyclops_solar_red'),
            hell: loc('race_cyclops_solar_hell'),
            gas: loc('race_cyclops_solar_gas'),
            gas_moon: loc('race_cyclops_solar_gas_moon'),
            dwarf: loc('race_cyclops_solar_dwarf'),
        },
        fanaticism: 'intelligent',
        basic(){ return true; }
    },
    troll: {
        name: loc('race_troll'),
        desc: loc('race_troll_desc'),
        type: 'giant',
        home: loc('race_troll_home'),
        entity: loc('race_troll_entity'),
        traits: {
            regenerative: 1,
            gluttony: 1
        },
        solar: {
            red: loc('race_troll_solar_red'),
            hell: loc('race_troll_solar_hell'),
            gas: loc('race_troll_solar_gas'),
            gas_moon: loc('race_troll_solar_gas_moon'),
            dwarf: loc('race_troll_solar_dwarf'),
        },
        fanaticism: 'regenerative',
        basic(){ return true; }
    },
    tortoisan: {
        name: loc(altRace('tortoisan') ? 'race_ninja_turtle' : 'race_tortoisan'),
        desc(){ return altRace('tortoisan') ? loc('race_ninja_turtle_desc',[shellColor()]) : loc('race_tortoisan_desc',[shellColor()]); },
        type: 'reptilian',
        home: loc(altRace('tortoisan') ? 'race_ninja_turtle_home' : 'race_tortoisan_home'),
        entity: loc(altRace('tortoisan') ? 'race_ninja_turtle_entity' : 'race_tortoisan_entity'),
        traits: {
            slow: 1,
            armored: 1
        },
        solar: {
            red: loc(altRace('tortoisan') ? 'race_ninja_turtle_solar_red' : 'race_tortoisan_solar_red'),
            hell: loc(altRace('tortoisan') ? 'race_ninja_turtle_solar_hell' : 'race_tortoisan_solar_hell'),
            gas: loc(altRace('tortoisan') ? 'race_ninja_turtle_solar_gas' : 'race_tortoisan_solar_gas'),
            gas_moon: loc(altRace('tortoisan') ? 'race_ninja_turtle_solar_gas_moon' : 'race_tortoisan_solar_gas_moon'),
            dwarf: loc(altRace('tortoisan') ? 'race_ninja_turtle_solar_dwarf' : 'race_tortoisan_solar_dwarf'),
        },
        fanaticism: 'armored',
        basic(){ return true; }
    },
    gecko: {
        name: loc('race_gecko'),
        desc: loc('race_gecko_desc'),
        type: 'reptilian',
        home: loc('race_gecko_home'),
        entity: loc('race_gecko_entity'),
        traits: {
            optimistic: 1,
            chameleon: 1
        },
        solar: {
            red: loc('race_gecko_solar_red'),
            hell: loc('race_gecko_solar_hell'),
            gas: loc('race_gecko_solar_gas'),
            gas_moon: loc('race_gecko_solar_gas_moon'),
            dwarf: loc('race_gecko_solar_dwarf'),
        },
        fanaticism: 'optimistic',
        basic(){ return true; }
    },
    slitheryn: {
        name: loc('race_slitheryn'),
        desc: loc('race_slitheryn_desc'),
        type: 'reptilian',
        home: loc('race_slitheryn_home'),
        entity: loc('race_slitheryn_entity'),
        traits: {
            astrologer: 1,
            hard_of_hearing: 1,
            slow_digestion: 1
        },
        solar: {
            red: loc('race_slitheryn_solar_red'),
            hell: loc('race_slitheryn_solar_hell'),
            gas: loc('race_slitheryn_solar_gas'),
            gas_moon: loc('race_slitheryn_solar_gas_moon'),
            dwarf: loc('race_slitheryn_solar_dwarf'),
        },
        fanaticism: 'astrologer',
        basic(){ return true; }
    },
    arraak: {
        name: loc(altRace('arraak') ? 'race_turkey' : 'race_arraak'),
        desc: loc(altRace('arraak') ? 'race_turkey_desc' : 'race_arraak_desc'),
        type: 'avian',
        home: loc(altRace('arraak') ? 'race_turkey_home' : 'race_arraak_home'),
        entity: altRace('arraak') ? loc('race_turkey_entity') : loc('race_arraak_entity'),
        traits: {
            resourceful: 1,
            selenophobia: 1
        },
        solar: {
            red: loc(altRace('arraak') ? 'race_turkey_solar_red' : 'race_arraak_solar_red'),
            hell: loc(altRace('arraak') ? 'race_turkey_solar_hell' : 'race_arraak_solar_hell'),
            gas: loc(altRace('arraak') ? 'race_turkey_solar_gas' : 'race_arraak_solar_gas'),
            gas_moon: loc(altRace('arraak') ? 'race_turkey_solar_gas_moon' : 'race_arraak_solar_gas_moon'),
            dwarf: loc(altRace('arraak') ? 'race_turkey_solar_dwarf' : 'race_arraak_solar_dwarf'),
        },
        fanaticism: 'resourceful',
        basic(){ return true; }
    },
    pterodacti: {
        name: loc('race_pterodacti'),
        desc: loc('race_pterodacti_desc'),
        type: 'avian',
        home: loc('race_pterodacti_home'),
        entity: loc('race_pterodacti_entity'),
        traits: {
            leathery: 1,
            pessimistic: 1
        },
        solar: {
            red: loc('race_pterodacti_solar_red'),
            hell: loc('race_pterodacti_solar_hell'),
            gas: loc('race_pterodacti_solar_gas'),
            gas_moon: loc('race_pterodacti_solar_gas_moon'),
            dwarf: loc('race_pterodacti_solar_dwarf'),
        },
        fanaticism: 'leathery',
        basic(){ return true; }
    },
    dracnid: {
        name: loc('race_dracnid'),
        desc: loc('race_dracnid_desc'),
        type: 'avian',
        home: loc('race_dracnid_home'),
        entity: loc('race_dracnid_entity'),
        traits: {
            hoarder: 1,
            solitary: 1
        },
        solar: {
            red: loc('race_dracnid_solar_red'),
            hell: loc('race_dracnid_solar_hell'),
            gas: loc('race_dracnid_solar_gas'),
            gas_moon: loc('race_dracnid_solar_gas_moon'),
            dwarf: loc('race_dracnid_solar_dwarf'),
        },
        fanaticism: 'hoarder',
        basic(){ return true; }
    },
    entish: {
        name: loc(altRace('entish') ? 'race_spruce' : 'race_entish'),
        desc: loc(altRace('entish') ? 'race_spruce_desc' : 'race_entish_desc'),
        type: 'plant',
        home: loc(altRace('entish') ? 'race_spruce_home' : 'race_entish_home'),
        entity: loc(altRace('entish') ? 'race_spruce_entity' : 'race_entish_entity'),
        traits: {
            kindling_kindred: 1,
            pyrophobia: 1,
            catnip: 1
        },
        solar: {
            red: loc(altRace('entish') ? 'race_spruce_solar_red' : 'race_entish_solar_red'),
            hell: loc(altRace('entish') ? 'race_spruce_solar_hell' : 'race_entish_solar_hell'),
            gas: loc(altRace('entish') ? 'race_spruce_solar_gas' : 'race_entish_solar_gas'),
            gas_moon: loc(altRace('entish') ? 'race_spruce_solar_gas_moon' : 'race_entish_solar_gas_moon'),
            dwarf: loc(altRace('entish') ? 'race_spruce_solar_dwarf' : 'race_entish_solar_dwarf'),
        },
        fanaticism: 'kindling_kindred',
        basic(){ return true; }
    },
    cacti: {
        name: loc('race_cacti'),
        desc: loc('race_cacti_desc'),
        type: 'plant',
        home: loc('race_cacti_home'),
        entity: loc('race_cacti_entity'),
        traits: {
            hyper: 1,
            skittish: 1
        },
        solar: {
            red: loc('race_cacti_solar_red'),
            hell: loc('race_cacti_solar_hell'),
            gas: loc('race_cacti_solar_gas'),
            gas_moon: loc('race_cacti_solar_gas_moon'),
            dwarf: loc('race_cacti_solar_dwarf'),
        },
        fanaticism: 'hyper',
        basic(){ return true; }
    },
    pinguicula: {
        name: loc('race_pinguicula'),
        desc: loc('race_pinguicula_desc'),
        type: 'plant',
        home: loc('race_pinguicula_home'),
        entity: loc('race_pinguicula_entity'),
        traits: {
            fragrant: 1,
            sticky: 1,
            anise: 1
        },
        solar: {
            red: loc('race_pinguicula_solar_red'),
            hell: loc('race_pinguicula_solar_hell'),
            gas: loc('race_pinguicula_solar_gas'),
            gas_moon: loc('race_pinguicula_solar_gas_moon'),
            dwarf: loc('race_pinguicula_solar_dwarf'),
        },
        fanaticism: 'sticky',
        basic(){ return true; }
    },
    sporgar: {
        name: loc('race_sporgar'),
        desc: loc('race_sporgar_desc'),
        type: 'fungi',
        home: loc('race_sporgar_home'),
        entity: loc('race_sporgar_entity'),
        traits: {
            infectious: 1,
            parasite: 1
        },
        solar: {
            red: loc('race_sporgar_solar_red'),
            hell: loc('race_sporgar_solar_hell'),
            gas: loc('race_sporgar_solar_gas'),
            gas_moon: loc('race_sporgar_solar_gas_moon'),
            dwarf: loc('race_sporgar_solar_dwarf'),
        },
        fanaticism: 'infectious',
        basic(){ return false; }
    },
    shroomi: {
        name: loc('race_shroomi'),
        desc: loc('race_shroomi_desc'),
        type: 'fungi',
        home: loc('race_shroomi_home'),
        entity: loc('race_shroomi_entity'),
        traits: {
            toxic: 1,
            nyctophilia: 1
        },
        solar: {
            red: loc('race_shroomi_solar_red'),
            hell: loc('race_shroomi_solar_hell'),
            gas: loc('race_shroomi_solar_gas'),
            gas_moon: loc('race_shroomi_solar_gas_moon'),
            dwarf: loc('race_shroomi_solar_dwarf'),
        },
        fanaticism: 'toxic',
        basic(){ return true; }
    },
    moldling: {
        name: loc('race_moldling'),
        desc: loc('race_moldling_desc'),
        type: 'fungi',
        home: loc('race_moldling_home'),
        entity: loc('race_moldling_entity'),
        traits: {
            infiltrator: 1,
            hibernator: 1
        },
        solar: {
            red: loc('race_moldling_solar_red'),
            hell: loc('race_moldling_solar_hell'),
            gas: loc('race_moldling_solar_gas'),
            gas_moon: loc('race_moldling_solar_gas_moon'),
            dwarf: loc('race_moldling_solar_dwarf'),
        },
        fanaticism: 'infiltrator',
        basic(){ return true; }
    },
    mantis: {
        name: loc('race_mantis'),
        desc: loc('race_mantis_desc'),
        type: 'insectoid',
        home: loc('race_mantis_home'),
        entity: loc('race_mantis_entity'),
        traits: {
            cannibalize: 1,
            malnutrition: 1
        },
        solar: {
            red: loc('race_mantis_solar_red'),
            hell: loc('race_mantis_solar_hell'),
            gas: loc('race_mantis_solar_gas'),
            gas_moon: loc('race_mantis_solar_gas_moon'),
            dwarf: loc('race_mantis_solar_dwarf'),
        },
        fanaticism: 'cannibalize',
        basic(){ return true; }
    },
    scorpid: {
        name: loc('race_scorpid'),
        desc: loc('race_scorpid_desc'),
        type: 'insectoid',
        home: loc('race_scorpid_home'),
        entity: loc('race_scorpid_entity'),
        traits: {
            claws: 1,
            atrophy: 1
        },
        solar: {
            red: loc('race_scorpid_solar_red'),
            hell: loc('race_scorpid_solar_hell'),
            gas: loc('race_scorpid_solar_gas'),
            gas_moon: loc('race_scorpid_solar_gas_moon'),
            dwarf: loc('race_scorpid_solar_dwarf'),
        },
        fanaticism: 'claws',
        basic(){ return true; }
    },
    antid: {
        name: loc('race_antid'),
        desc: loc('race_antid_desc'),
        type: 'insectoid',
        home: loc('race_antid_home'),
        entity: loc('race_antid_entity'),
        traits: {
            hivemind: 1,
            tunneler: 1
        },
        solar: {
            red: loc('race_antid_solar_red'),
            hell: loc('race_antid_solar_hell'),
            gas: loc('race_antid_solar_gas'),
            gas_moon: loc('race_antid_solar_gas_moon'),
            dwarf: loc('race_antid_solar_dwarf'),
        },
        fanaticism: 'hivemind',
        basic(){ return true; }
    },
    sharkin: {
        name: loc('race_sharkin'),
        desc: loc('race_sharkin_desc'),
        type: 'aquatic',
        home: loc('race_sharkin_home'),
        entity: loc('race_sharkin_entity'),
        traits: {
            blood_thirst: 1,
            apex_predator: 1
        },
        solar: {
            red: loc('race_sharkin_solar_red'),
            hell: loc('race_sharkin_solar_hell'),
            gas: loc('race_sharkin_solar_gas'),
            gas_moon: loc('race_sharkin_solar_gas_moon'),
            dwarf: loc('race_sharkin_solar_dwarf'),
        },
        fanaticism: 'blood_thirst',
        basic(){ return ['oceanic','swamp'].includes(global.city.biome) ? true : false; }
    },
    octigoran: {
        name: loc('race_octigoran'),
        desc: loc('race_octigoran_desc'),
        type: 'aquatic',
        home: loc('race_octigoran_home'),
        entity: loc('race_octigoran_entity'),
        traits: {
            invertebrate: 1,
            suction_grip: 1
        },
        solar: {
            red: loc('race_octigoran_solar_red'),
            hell: loc('race_octigoran_solar_hell'),
            gas: loc('race_octigoran_solar_gas'),
            gas_moon: loc('race_octigoran_solar_gas_moon'),
            dwarf: loc('race_octigoran_solar_dwarf'),
        },
        fanaticism: 'suction_grip',
        basic(){ return ['oceanic','swamp'].includes(global.city.biome) ? true : false; }
    },
    dryad: {
        name: loc('race_dryad'),
        desc: loc('race_dryad_desc'),
        type: 'fey',
        home: loc('race_dryad_home'),
        entity: loc('race_dryad_entity'),
        traits: {
            befuddle: 1,
            environmentalist: 1,
            kindling_kindred: 1
        },
        solar: {
            red: loc('race_dryad_solar_red'),
            hell: loc('race_dryad_solar_hell'),
            gas: loc('race_dryad_solar_gas'),
            gas_moon: loc('race_dryad_solar_gas_moon'),
            dwarf: loc('race_dryad_solar_dwarf'),
        },
        fanaticism: 'befuddle',
        basic(){ return ['forest','swamp','taiga'].includes(global.city.biome) ? true : false; }
    },
    satyr: {
        name: loc('race_satyr'),
        desc: loc('race_satyr_desc'),
        type: 'fey',
        home: loc('race_satyr_home'),
        entity: loc('race_satyr_entity'),
        traits: {
            unorganized: 1,
            musical: 1
        },
        solar: {
            red: loc('race_satyr_solar_red'),
            hell: loc('race_satyr_solar_hell'),
            gas: loc('race_satyr_solar_gas'),
            gas_moon: loc('race_satyr_solar_gas_moon'),
            dwarf: loc('race_satyr_solar_dwarf'),
        },
        fanaticism: 'musical',
        basic(){ return ['forest','swamp','taiga'].includes(global.city.biome) ? true : false; }
    },
    phoenix: {
        name: loc('race_phoenix'),
        desc: loc('race_phoenix_desc'),
        type: 'heat',
        home: loc('race_phoenix_home'),
        entity: loc('race_phoenix_entity'),
        traits: {
            revive: 1,
            slow_regen: 1
        },
        solar: {
            red: loc('race_phoenix_solar_red'),
            hell: loc('race_phoenix_solar_hell'),
            gas: loc('race_phoenix_solar_gas'),
            gas_moon: loc('race_phoenix_solar_gas_moon'),
            dwarf: loc('race_phoenix_solar_dwarf'),
        },
        fanaticism: 'revive',
        basic(){ return ['volcanic','ashland'].includes(global.city.biome) ? true : false; }
    },
    salamander: {
        name: loc('race_salamander'),
        desc: loc('race_salamander_desc'),
        type: 'heat',
        home: loc('race_salamander_home'),
        entity: loc('race_salamander_entity'),
        traits: {
            forge: 1,
            autoignition: 1
        },
        solar: {
            red: loc('race_salamander_solar_red'),
            hell: loc('race_salamander_solar_hell'),
            gas: loc('race_salamander_solar_gas'),
            gas_moon: loc('race_salamander_solar_gas_moon'),
            dwarf: loc('race_salamander_solar_dwarf'),
        },
        fanaticism: 'forge',
        basic(){ return ['volcanic','ashland'].includes(global.city.biome) ? true : false; }
    },
    yeti: {
        name: loc(altRace('yeti') ? 'race_snowman' : 'race_yeti'),
        desc: loc(altRace('yeti') ? 'race_snowman_desc' : 'race_yeti_desc'),
        type: 'polar',
        home: loc(altRace('yeti') ? 'race_snowman_home' : 'race_yeti_home'),
        entity: loc(altRace('yeti') ? 'race_snowman_entity' : 'race_yeti_entity'),
        traits: {
            blurry: 1,
            snowy: 1
        },
        solar: {
            red: loc(altRace('yeti') ? 'race_snowman_solar_red' : 'race_yeti_solar_red'),
            hell: loc(altRace('yeti') ? 'race_snowman_solar_hell' : 'race_yeti_solar_hell'),
            gas: loc(altRace('yeti') ? 'race_snowman_solar_gas' : 'race_yeti_solar_gas'),
            gas_moon: loc(altRace('yeti') ? 'race_snowman_solar_gas_moon' : 'race_yeti_solar_gas_moon'),
            dwarf: loc(altRace('yeti') ? 'race_snowman_solar_dwarf' : 'race_yeti_solar_dwarf'),
        },
        fanaticism: 'blurry',
        basic(){ return ['tundra','taiga'].includes(global.city.biome) ? true : false; }
    },
    wendigo: {
        name: loc(altRace('wendigo') ? 'race_krampus' : 'race_wendigo'),
        desc: loc(altRace('wendigo') ? 'race_krampus_desc' : 'race_wendigo_desc'),
        type: 'polar',
        home: loc(altRace('wendigo') ? 'race_krampus_home' : 'race_wendigo_home'),
        entity: loc(altRace('wendigo') ? 'race_krampus_entity' : 'race_wendigo_entity'),
        traits: {
            ravenous: 1,
            ghostly: 1,
            soul_eater: 1
        },
        solar: {
            red: loc(altRace('wendigo') ? 'race_krampus_solar_red' : 'race_wendigo_solar_red'),
            hell: loc(altRace('wendigo') ? 'race_krampus_solar_hell' : 'race_wendigo_solar_hell'),
            gas: loc(altRace('wendigo') ? 'race_krampus_solar_gas' : 'race_wendigo_solar_gas'),
            gas_moon: loc(altRace('wendigo') ? 'race_krampus_solar_gas_moon' : 'race_wendigo_solar_gas_moon'),
            dwarf: loc(altRace('wendigo') ? 'race_krampus_solar_dwarf' : 'race_wendigo_solar_dwarf'),
        },
        fanaticism: 'ghostly',
        basic(){ return ['tundra','taiga'].includes(global.city.biome) ? true : false; }
    },
    tuskin: {
        name: loc('race_tuskin'),
        desc: loc('race_tuskin_desc'),
        type: 'sand',
        home: loc('race_tuskin_home'),
        entity: loc('race_tuskin_entity'),
        traits: {
            lawless: 1,
            mistrustful: 1
        },
        solar: {
            red: loc('race_tuskin_solar_red'),
            hell: loc('race_tuskin_solar_hell'),
            gas: loc('race_tuskin_solar_gas'),
            gas_moon: loc('race_tuskin_solar_gas_moon'),
            dwarf: loc('race_tuskin_solar_dwarf'),
        },
        fanaticism: 'lawless',
        basic(){ return ['desert','ashland'].includes(global.city.biome) ? true : false; }
    },
    kamel: {
        name: loc('race_kamel'),
        desc: loc('race_kamel_desc'),
        type: 'sand',
        home: loc('race_kamel_home'),
        entity: loc('race_kamel_entity'),
        traits: {
            humpback: 1,
            unfavored: 1
        },
        solar: {
            red: loc('race_kamel_solar_red'),
            hell: loc('race_kamel_solar_hell'),
            gas: loc('race_kamel_solar_gas'),
            gas_moon: loc('race_kamel_solar_gas_moon'),
            dwarf: loc('race_kamel_solar_dwarf')
        },
        fanaticism: 'humpback',
        basic(){ return ['desert','ashland'].includes(global.city.biome) ? true : false; }
    },
    balorg: {
        name: loc('race_balorg'),
        desc: loc('race_balorg_desc'),
        type: 'demonic',
        home: loc('race_balorg_home'),
        entity: loc('race_balorg_entity'),
        traits: {
            fiery: 1,
            terrifying: 1,
            slaver: 1
        },
        solar: {
            red: loc('race_balorg_solar_red'),
            hell: loc('race_balorg_solar_hell'),
            gas: loc('race_balorg_solar_gas'),
            gas_moon: loc('race_balorg_solar_gas_moon'),
            dwarf: loc('race_balorg_solar_dwarf'),
        },
        fanaticism: 'fiery',
        basic(){ return global.city.biome === 'hellscape' ? true : false; }
    },
    imp: {
        name: loc('race_imp'),
        desc: loc('race_imp_desc'),
        type: 'demonic',
        home: loc('race_imp_home'),
        entity: loc('race_imp_entity'),
        traits: {
            compact: 1,
            conniving: 1,
            pathetic: 1,
        },
        solar: {
            red: loc('race_imp_solar_red'),
            hell: loc('race_imp_solar_hell'),
            gas: loc('race_imp_solar_gas'),
            gas_moon: loc('race_imp_solar_gas_moon'),
            dwarf: loc('race_imp_solar_dwarf'),
        },
        fanaticism: 'conniving',
        basic(){ return global.city.biome === 'hellscape' ? true : false; }
    },
    seraph: {
        name: loc(altRace('seraph') ? 'race_cherub' : 'race_seraph'),
        desc: loc(altRace('seraph') ? 'race_cherub_desc' : 'race_seraph_desc'),
        type: 'angelic',
        home: loc(altRace('seraph') ? 'race_cherub_home' : 'race_seraph_home'),
        entity: loc(altRace('seraph') ? 'race_cherub_entity' : 'race_seraph_entity'),
        traits: {
            unified: 1,
            spiritual: 1,
            truthful: 1
        },
        solar: {
            red: loc(altRace('seraph') ? 'race_cherub_solar_red' : 'race_seraph_solar_red'),
            hell: loc(altRace('seraph') ? 'race_cherub_solar_hell' : 'race_seraph_solar_hell'),
            gas: loc(altRace('seraph') ? 'race_cherub_solar_gas' : 'race_seraph_solar_gas'),
            gas_moon: loc(altRace('seraph') ? 'race_cherub_solar_gas_moon' : 'race_seraph_solar_gas_moon'),
            dwarf: loc(altRace('seraph') ? 'race_cherub_solar_dwarf' : 'race_seraph_solar_dwarf'),
        },
        fanaticism: 'spiritual',
        basic(){ return global.city.biome === 'eden' ? true : false; }
    },
    unicorn: {
        name: loc(altRace('unicorn') ? 'race_emocorn' : 'race_unicorn'),
        desc: loc(altRace('unicorn') ? 'race_emocorn_desc' : 'race_unicorn_desc'),
        type: 'angelic',
        home: loc(altRace('unicorn') ? 'race_emocorn_home' : 'race_unicorn_home'),
        entity: loc(altRace('unicorn') ? 'race_emocorn_entity' : 'race_unicorn_entity'),
        traits: {
            rainbow: 1,
            magnificent: 1,
            noble: 1,
        },
        solar: {
            red: loc(altRace('unicorn') ? 'race_emocorn_solar_red' : 'race_unicorn_solar_red'),
            hell: loc(altRace('unicorn') ? 'race_emocorn_solar_hell' : 'race_unicorn_solar_hell'),
            gas: loc(altRace('unicorn') ? 'race_emocorn_solar_gas' : 'race_unicorn_solar_gas'),
            gas_moon: loc(altRace('unicorn') ? 'race_emocorn_solar_gas_moon' : 'race_unicorn_solar_gas_moon'),
            dwarf: loc(altRace('unicorn') ? 'race_emocorn_solar_dwarf' : 'race_unicorn_solar_dwarf'),
        },
        fanaticism: 'magnificent',
        basic(){ return global.city.biome === 'eden' ? true : false; }
    },
    synth: {
        name: loc('race_synth'),
        desc(){
            let race = global.race.hasOwnProperty('srace') ? global.race.srace : 'human';
            return loc('race_synth_desc',[races[race].name]);
        },
        type: 'synthetic',
        home: loc('race_synth_home'),
        entity: loc('race_synth_entity'),
        traits: {
            imitation: 1,
            emotionless: 1,
            logical: 1
        },
        solar: {
            red: loc('race_synth_solar_red'),
            hell: loc('race_synth_solar_hell'),
            gas: loc('race_synth_solar_gas'),
            gas_moon: loc('race_synth_solar_gas_moon'),
            dwarf: loc('race_synth_solar_dwarf'),
        },
        fanaticism: 'logical',
        basic(){ return false; }
    },
    nano: {
        name: loc('race_nano'),
        desc: loc('race_nano_desc'),
        type: 'synthetic',
        home: loc('race_nano_home'),
        entity: loc('race_nano_entity'),
        traits: {
            deconstructor: 1,
            linked: 1,
            shapeshifter: 1
        },
        solar: {
            red: loc('race_nano_solar_red'),
            hell: loc('race_nano_solar_hell'),
            gas: loc('race_nano_solar_gas'),
            gas_moon: loc('race_nano_solar_gas_moon'),
            dwarf: loc('race_nano_solar_dwarf'),
        },
        fanaticism: 'shapeshifter',
        basic(){ return false; }
    },
    ghast: {
        name: loc('race_ghast'),
        desc: loc('race_ghast_desc'),
        type: 'eldritch',
        home: loc('race_ghast_home'),
        entity: loc('race_ghast_entity'),
        traits: {
            dark_dweller: 1,
            swift: 1,
            anthropophagite: 1
        },
        solar: {
            red: loc('race_ghast_solar_red'),
            hell: loc('race_ghast_solar_hell'),
            gas: loc('race_ghast_solar_gas'),
            gas_moon: loc('race_ghast_solar_gas_moon'),
            dwarf: loc('race_ghast_solar_dwarf'),
        },
        fanaticism: 'swift',
        basic(){ return false; }
    },
    shoggoth: {
        name: loc('race_shoggoth'),
        desc: loc('race_shoggoth_desc'),
        type: 'eldritch',
        home: loc('race_shoggoth_home'),
        entity: loc('race_shoggoth_entity'),
        traits: {
            living_tool: 1,
            bloated: 1
        },
        solar: {
            red: loc('race_shoggoth_solar_red'),
            hell: loc('race_shoggoth_solar_hell'),
            gas: loc('race_shoggoth_solar_gas'),
            gas_moon: loc('race_shoggoth_solar_gas_moon'),
            dwarf: loc('race_shoggoth_solar_dwarf'),
        },
        fanaticism: 'living_tool',
        basic(){ return false; }
    },
    raptors: {
        name: loc('race_raptors'),
        desc(){ return global.race['raptor_plumage'] ? loc('race_raptors_desc_feathered') : loc('race_raptors_desc'); },
        type: 'primordial',
        home: loc('race_raptors_home'),
        entity: loc('race_raptors_entity'),
        traits: {
            scrounger: 1,
            nostalgic: 1
        },
        solar: {
            red: loc('race_raptors_solar_red'),
            hell: loc('race_raptors_solar_hell'),
            gas: loc('race_raptors_solar_gas'),
            gas_moon: loc('race_raptors_solar_gas_moon'),
            dwarf: loc('race_raptors_solar_dwarf'),
        },
        fanaticism: 'scrounger',
        basic(){ return false; }
    },
    rexicus: {
        name: loc('race_rexicus'),
        desc: loc('race_rexicus_desc'),
        type: 'primordial',
        home: loc('race_rexicus_home'),
        entity: loc('race_rexicus_entity'),
        traits: {
            humongous: 1,
            limited: 1
        },
        solar: {
            red: loc('race_rexicus_solar_red'),
            hell: loc('race_rexicus_solar_hell'),
            gas: loc('race_rexicus_solar_gas'),
            gas_moon: loc('race_rexicus_solar_gas_moon'),
            dwarf: loc('race_rexicus_solar_dwarf'),
        },
        fanaticism: 'humongous',
        basic(){ return false; }
    },
    dwarf: {
        name: loc('race_dwarf'),
        desc: loc('race_dwarf_desc'),
        type: 'hybrid',
        hybrid: ['humanoid','small'],
        home: loc('race_dwarf_home'),
        entity: loc('race_dwarf_entity'),
        traits: {
            artisan: 1,
            stubborn: 1
        },
        solar: {
            red: loc('race_dwarf_solar_red'),
            hell: loc('race_dwarf_solar_hell'),
            gas: loc('race_dwarf_solar_gas'),
            gas_moon: loc('race_dwarf_solar_gas_moon'),
            dwarf: loc('race_dwarf_solar_dwarf'),
        },
        fanaticism: 'artisan',
        basic(){ return false; }
    },
    raccoon: {
        name: loc('race_raccoon'),
        desc: loc('race_raccoon_desc'),
        type: 'hybrid',
        hybrid: ['carnivore','herbivore'], // ['omnivore'],
        home: loc('race_raccoon_home'),
        entity: loc('race_raccoon_entity'),
        traits: {
            rogue: 1,
            untrustworthy: 1
        },
        solar: {
            red: loc('race_raccoon_solar_red'),
            hell: loc('race_raccoon_solar_hell'),
            gas: loc('race_raccoon_solar_gas'),
            gas_moon: loc('race_raccoon_solar_gas_moon'),
            dwarf: loc('race_raccoon_solar_dwarf'),
        },
        fanaticism: 'rogue',
        basic(){ return false; }
    },
    lichen: {
        name: loc('race_lichen'),
        desc: loc('race_lichen_desc'),
        type: 'hybrid',
        hybrid: ['plant','fungi'],
        home: loc('race_lichen_home'),
        entity: loc('race_lichen_entity'),
        traits: {
            living_materials: 1,
            unstable: 1
        },
        solar: {
            red: loc('race_lichen_solar_red'),
            hell: loc('race_lichen_solar_hell'),
            gas: loc('race_lichen_solar_gas'),
            gas_moon: loc('race_lichen_solar_gas_moon'),
            dwarf: loc('race_lichen_solar_dwarf'),
        },
        fanaticism: 'living_materials',
        basic(){ return false; }
    },
    wyvern: {
        name: loc('race_wyvern'),
        desc: loc('race_wyvern_desc'),
        type: 'hybrid',
        hybrid: ['avian','reptilian'],
        home: loc('race_wyvern_home'),
        entity: loc('race_wyvern_entity'),
        traits: {
            elemental: 1,
            chicken: 1
        },
        solar: {
            red: loc('race_wyvern_solar_red'),
            hell: loc('race_wyvern_solar_hell'),
            gas: loc('race_wyvern_solar_gas'),
            gas_moon: loc('race_wyvern_solar_gas_moon'),
            dwarf: loc('race_wyvern_solar_dwarf'),
        },
        fanaticism: 'elemental',
        basic(){ return false; }
    },
    beholder: {
        name: loc('race_beholder'),
        desc: loc('race_beholder_desc'),
        type: 'hybrid',
        hybrid: ['eldritch','giant'],
        home: loc('race_beholder_home'),
        entity: loc('race_beholder_entity'),
        traits: {
            ocular_power: 1,
            floating: 1
        },
        solar: {
            red: loc('race_beholder_solar_red'),
            hell: loc('race_beholder_solar_hell'),
            gas: loc('race_beholder_solar_gas'),
            gas_moon: loc('race_beholder_solar_gas_moon'),
            dwarf: loc('race_beholder_solar_dwarf'),
        },
        fanaticism: 'ocular_power',
        basic(){ return false; }
    },
    djinn: {
        name: loc('race_djinn'),
        desc: loc('race_djinn_desc'),
        type: 'hybrid',
        hybrid: ['sand','fey'],
        home: loc('race_djinn_home'),
        entity: loc('race_djinn_entity'),
        traits: {
            wish: 1,
            devious: 1
        },
        solar: {
            red: loc('race_djinn_solar_red'),
            hell: loc('race_djinn_solar_hell'),
            gas: loc('race_djinn_solar_gas'),
            gas_moon: loc('race_djinn_solar_gas_moon'),
            dwarf: loc('race_djinn_solar_dwarf'),
        },
        fanaticism: 'wish',
        basic(){ return false; }
    },
    narwhal: {
        name: loc('race_narwhal'),
        desc: loc('race_narwhal_desc'),
        type: 'hybrid',
        hybrid: ['aquatic','polar'],
        home: loc('race_narwhal_home'),
        entity: loc('race_narwhal_entity'),
        traits: {
            tusk: 1,
            blubber: 1
        },
        solar: {
            red: loc('race_narwhal_solar_red'),
            hell: loc('race_narwhal_solar_hell'),
            gas: loc('race_narwhal_solar_gas'),
            gas_moon: loc('race_narwhal_solar_gas_moon'),
            dwarf: loc('race_narwhal_solar_dwarf'),
        },
        fanaticism: 'tusk',
        basic(){ return false; }
    },
    bombardier: {
        name: loc('race_bombardier'),
        desc: loc('race_bombardier_desc'),
        type: 'hybrid',
        hybrid: ['insectoid','heat'],
        home: loc('race_bombardier_home'),
        entity: loc('race_bombardier_entity'),
        traits: {
            grenadier: 1,
            aggressive: 1
        },
        solar: {
            red: loc('race_bombardier_solar_red'),
            hell: loc('race_bombardier_solar_hell'),
            gas: loc('race_bombardier_solar_gas'),
            gas_moon: loc('race_bombardier_solar_gas_moon'),
            dwarf: loc('race_bombardier_solar_dwarf'),
        },
        fanaticism: 'grenadier',
        basic(){ return false; }
    },
    nephilim: {
        name: loc('race_nephilim'),
        desc: loc('race_nephilim_desc'),
        type: 'hybrid',
        hybrid: ['demonic','angelic'],
        home: loc('race_nephilim_home'),
        entity: loc('race_nephilim_entity'),
        traits: {
            empowered: 1.33,
            blasphemous: 1
        },
        solar: {
            red: loc('race_nephilim_solar_red'),
            hell: loc('race_nephilim_solar_hell'),
            gas: loc('race_nephilim_solar_gas'),
            gas_moon: loc('race_nephilim_solar_gas_moon'),
            dwarf: loc('race_nephilim_solar_dwarf'),
        },
        fanaticism: 'empowered',
        basic(){ return false; }
    },
    mammuth: {
        name: loc('race_mammuth'),
        desc: loc('race_mammuth_desc'),
        type: 'hybrid',
        hybrid: ['primordial','herbivore'],
        home: loc('race_mammuth_home'),
        entity: loc('race_mammuth_entity'),
        traits: {
            wooly: 1,
            mourning: 1
        },
        solar: {
            red: loc('race_mammuth_solar_red'),
            hell: loc('race_mammuth_solar_hell'),
            gas: loc('race_mammuth_solar_gas'),
            gas_moon: loc('race_mammuth_solar_gas_moon'),
            dwarf: loc('race_mammuth_solar_dwarf'),
        },
        fanaticism: 'wooly',
        basic(){ return false; }
    },
    hellspawn: {
        name: loc('race_hellspawn'),
        desc: loc('race_hellspawn_desc'),
        type: 'demonic',
        home: loc('race_hellspawn_home'),
        entity: loc('race_hellspawn_entity'),
        traits: { immoral: 2 },
        solar: {
            red: loc('race_hellspawn_solar_red'),
            hell: loc('race_hellspawn_solar_hell'),
            gas: loc('race_hellspawn_solar_gas'),
            gas_moon: loc('race_hellspawn_solar_gas_moon'),
            dwarf: loc('race_hellspawn_solar_dwarf'),
        },
        fanaticism: 'immoral',
        basic(){ return false; }
    },
    junker: {
        name: altRace('junker') ? loc('race_ghoul') : loc('race_junker'),
        desc: altRace('junker') ? loc('race_ghoul_desc') : loc('race_junker_desc'),
        type: (function(){ return global.race.hasOwnProperty('jtype') ? global.race.jtype : 'humanoid'; })(),
        home: altRace('junker') ? loc('race_ghoul_home') : loc('race_junker_home'),
        entity: altRace('junker') ? loc('race_ghoul_entity') : loc('race_junker_entity'),
        traits: {
            diverse: 1,
            arrogant: 1,
            angry: 1,
            lazy: 1,
            paranoid: 1,
            greedy: 1,
            puny: 1,
            dumb: 1,
            nearsighted: 1,
            gluttony: 1,
            slow: 1,
            hard_of_hearing: 1,
            pessimistic: 1,
            solitary: 1,
            pyrophobia: 1,
            skittish: 1,
            nyctophilia: 1,
            frail: 1,
            atrophy: 1,
            invertebrate: 1,
            pathetic: 1,
            hibernator: 1,
            freespirit: 1,
            heavy: 1,
            gnawer: 1,
            hooved: 1
        },
        solar: {
            red: altRace('junker') ? loc('race_ghoul_solar_red') : loc('race_junker_solar_red'),
            hell: altRace('junker') ? loc('race_ghoul_solar_hell') : loc('race_junker_solar_hell'),
            gas: altRace('junker') ? loc('race_ghoul_solar_gas') : loc('race_junker_solar_gas'),
            gas_moon: altRace('junker') ? loc('race_ghoul_solar_gas_moon') : loc('race_junker_solar_gas_moon'),
            dwarf: altRace('junker') ? loc('race_ghoul_solar_dwarf') : loc('race_junker_solar_dwarf'),
        },
        fanaticism: 'none',
        basic(){ return false; }
    },
    sludge: {
        name: loc('race_sludge'),
        desc: loc('race_sludge_desc'),
        type: (function(){ return global.race.hasOwnProperty('jtype') ? global.race.jtype : 'humanoid'; })(),
        home: loc('race_sludge_home'),
        entity: loc('race_sludge_entity'),
        traits: {
            ooze: 0.25,
            diverse: 0.25,
            arrogant: 0.25,
            angry: 0.25,
            lazy: 0.25,
            hooved: 0.25,
            freespirit: 0.25,
            heavy: 0.25,
            gnawer: 0.25,
            paranoid: 0.25,
            greedy: 0.25,
            puny: 0.25,
            dumb: 0.25,
            nearsighted: 0.25,
            gluttony: 0.25,
            slow: 0.25,
            hard_of_hearing: 0.25,
            selenophobia: 0.25,
            pessimistic: 0.25,
            solitary: 0.25,
            pyrophobia: 0.25,
            skittish: 0.25,
            fragrant: 0.25,
            nyctophilia: 0.25,
            hibernator: 0.25,
            frail: 0.25,
            atrophy: 0.25,
            invertebrate: 0.25,
            unorganized: 0.25,
            slow_regen: 0.25,
            autoignition: 0.25,
            snowy: 0.25,
            mistrustful: 0.25,
            thalassophobia: 0.25,
            pathetic: 0.25,
            truthful: 0.25,
        },
        solar: {
            red: loc('race_sludge_solar_red'),
            hell: loc('race_sludge_solar_hell'),
            gas: loc('race_sludge_solar_gas'),
            gas_moon: loc('race_sludge_solar_gas_moon'),
            dwarf: loc('race_sludge_solar_dwarf'),
        },
        fanaticism: 'ooze',
        basic(){ return false; }
    },
    ultra_sludge: {
        name: loc('race_ultra_sludge'),
        desc: loc('race_ultra_sludge_desc'),
        type: (function(){ return global.race.hasOwnProperty('jtype') ? global.race.jtype : 'humanoid'; })(),
        home: loc('race_sludge_home'),
        entity: loc('race_sludge_entity'),
        traits: {
            ooze: 0.1,
            diverse: 0.1,
            arrogant: 0.1,
            angry: 0.1,
            lazy: 0.1,
            hooved: 0.1,
            freespirit: 0.1,
            heavy: 0.1,
            gnawer: 0.1,
            paranoid: 0.1,
            greedy: 0.1,
            puny: 0.1,
            dumb: 0.1,
            nearsighted: 0.1,
            gluttony: 0.1,
            slow: 0.1,
            hard_of_hearing: 0.1,
            selenophobia: 0.1,
            pessimistic: 0.1,
            solitary: 0.1,
            pyrophobia: 0.1,
            skittish: 0.1,
            fragrant: 0.1,
            nyctophilia: 0.1,
            hibernator: 0.1,
            frail: 0.1,
            atrophy: 0.1,
            invertebrate: 0.1,
            unorganized: 0.1,
            slow_regen: 0.1,
            autoignition: 0.1,
            snowy: 0.1,
            mistrustful: 0.1,
            thalassophobia: 0.1,
            pathetic: 0.1,
            truthful: 0.1,
            blubber: 0.25,
            aggressive: 0.25,
            devious: 0.25,
            floating: 0.25,
            blasphemous: 0.25,
            chicken: 0.25,
            unstable: 0.25,
            stubborn: 0.25,
            untrustworthy: 0.25,
            bloated: 0.25,
            dark_dweller: 0.25,
        },
        solar: {
            red: loc('race_sludge_solar_red'),
            hell: loc('race_sludge_solar_hell'),
            gas: loc('race_sludge_solar_gas'),
            gas_moon: loc('race_sludge_solar_gas_moon'),
            dwarf: loc('race_sludge_solar_dwarf'),
        },
        fanaticism: 'ooze',
        basic(){ return false; }
    },
    custom: customRace(),
    hybrid: customRace(true)
};

export const genusVars = {
    organism: {},
    humanoid: {},
    carnivore: {},
    herbivore: {},
    omnivore: {},
    small: {},
    giant: {},
    reptilian: {},
    avian: {},
    insectoid: {},
    plant: {},
    fungi: {},
    aquatic: {},
    fey: {},
    heat: {},
    polar: {},
    sand: {},
    demonic: {},
    angelic: {},
    synthetic: {},
    eldritch: {},
    primordial: {}
};

// Solar planets/moons encountered in Truepath, unique on genus rather than race.
const genusSolarBodies = [
    'titan','enceladus','triton','eris',
    'venus','saturn','uranus','neptune',
    'io','europa','callisto','titania','oberon',
    'pluto','haumea','makemake'
];
Object.keys(genusVars).forEach(function(k){
    let g = k === 'organism' ? 'humanoid' : k;
    genusVars[k]['solar'] = {};
    genusSolarBodies.forEach(function(body){
        genusVars[k].solar[body] = loc(`genus_${g}_solar_${body}`);
    });
});

export function setJType(){
    races.junker.type = global.race.hasOwnProperty('jtype') ? global.race.jtype : 'humanoid';
    races.sludge.type = global.race.hasOwnProperty('jtype') ? global.race.jtype : 'humanoid';
    races.ultra_sludge.type = global.race.hasOwnProperty('jtype') ? global.race.jtype : 'humanoid';
}

function customRace(hybrid){
    let slot = hybrid ? 'race1' : 'race0';
    if (global.hasOwnProperty('custom') && global.custom.hasOwnProperty(slot)){
        let trait = {};
        let ranks = global.custom[slot]?.ranks || {};
        for (let i=0; i<global.custom[slot].traits.length; i++){
            trait[global.custom[slot].traits[i]] = ranks[global.custom[slot].traits[i]] || 1;
        }

        let fanatic = global.custom[slot].hasOwnProperty('fanaticism') && global.custom[slot].fanaticism ? global.custom[slot].fanaticism : false;
        if (fanatic && !global.custom[slot].traits.includes(fanatic)){ fanatic = false; }
        if (!fanatic){
            fanatic = 'pathetic';
            for (let i=0; i<global.custom[slot].traits.length; i++){
                if (traits[global.custom[slot].traits[i]].val > traits[fanatic].val){
                    fanatic = global.custom[slot].traits[i];
                }
            }
        }

        let def = {
            name: global.custom[slot].name,
            desc: global.custom[slot].desc,
            type: global.custom[slot].genus,
            home: global.custom[slot].home,
            entity: global.custom[slot].entity,
            traits: trait,
            solar: {
                red: global.custom[slot].red,
                hell: global.custom[slot].hell,
                gas: global.custom[slot].gas,
                gas_moon: global.custom[slot].gas_moon,
                dwarf: global.custom[slot].dwarf,
            },
            fanaticism: fanatic,
            basic(){ return false; }
        };

        if (hybrid){
            def['hybrid'] = global.custom[slot].hybrid;
        }

        return def;
    }
    else {
        return {};
    }
}

/*
types: farmer, miner, lumberjack, science, factory, army, hunting, scavenger, forager
*/
export function racialTrait(workers,type){
    let modifier = 1;
    let theoryVal = govActive('theorist',1);
    if (theoryVal && (type === 'factory' || type === 'miner' || type === 'lumberjack')){
        modifier *= 1 - (theoryVal / 100);
    }
    let inspireVal = govActive('inspirational',0);
    if (inspireVal && (type === 'farmer' || type === 'factory' || type === 'miner' || type === 'lumberjack')){
        modifier *= 1 + (inspireVal / 100);
    }
    let dirtVal = govActive('dirty_jobs',2);
    if (dirtVal && type === 'miner'){
        modifier *= 1 + (dirtVal / 100);
    }
    if (global.race['rejuvenated'] && ['lumberjack','miner','factory'].includes(type)){
        modifier *= 1.1;
    }
    if (type === 'lumberjack' && global.race['evil'] && (global.race.universe === 'evil' || !global.race['soul_eater'])){
        if (global.race['living_tool']){
            modifier *= 1 + traits.living_tool.vars()[0] * (global.tech['science'] && global.tech.science > 0 ? global.tech.science * 0.3 : 0);
        }
        else {
            modifier *= 1 + ((global.tech['reclaimer'] - 1) * 0.4);
        }
    }
    if (global.race['tireless'] && (type === 'factory' || type === 'miner' || type === 'lumberjack') ){
        modifier *= 1 + (traits.tireless.vars()[0] / 100);
    }
    if (global.race['artifical'] && type === 'science'){
        modifier *= 1 + (traits.artifical.vars()[0] / 100);
    }
    if (global.race['hivemind'] && type !== 'farmer' && !global.race['lone_survivor']){
        let breakpoint = traits.hivemind.vars()[0];
        let scale = 0.05;
        if (global.race['high_pop'] && type !== 'army' && type !== 'hellArmy'){
            breakpoint *= traits.high_pop.vars()[0];
            scale = 0.5 / (traits.hivemind.vars()[0] * traits.high_pop.vars()[0]);
        }
        if (workers <= breakpoint){
            let start = 1 - (breakpoint * scale);
            modifier *= (workers * scale) + start;
        }
        else {
            let mod = type === 'army' || type === 'hellArmy' ? 0.99 : (global.race['high_pop'] ? 0.985 : 0.98);
            modifier *= 1 + (1 - (mod ** (workers - breakpoint)));
        }
    }
    let antidFathom = fathomCheck('antid');
    if (antidFathom > 0){
        let mod = type === 'army' || type === 'hellArmy' ? 0.99 : (global.race['high_pop'] ? 0.985 : 0.98);
        modifier *= 1 + (1 - (mod ** (workers * antidFathom / 4))) / 2;
    }
    if (global.race['cold_blooded'] && type !== 'army' && type !== 'hellArmy' && type !== 'factory' && type !== 'science'){
        switch(global.city.calendar.temp){
            case 0:
                modifier *= 1 - (traits.cold_blooded.vars()[0] / 100);
                break;
            case 2:
                modifier *= 1 + (traits.cold_blooded.vars()[1] / 100);
                break;
            default:
                modifier *= 1;
                break;
        }
        switch(global.city.calendar.weather){
            case 0:
                modifier *= 1 - (traits.cold_blooded.vars()[0] / 100);
                break;
            case 2:
                modifier *= 1 + (traits.cold_blooded.vars()[1] / 100);
                break;
            default:
                modifier *= 1;
                break;
        }
    }
    if (global.race['cannibalize'] && global.city['s_alter'] && global.city['s_alter'].count > 0){
        if (type === 'miner' && global.city.s_alter.mine > 0){
            modifier *= 1 + (traits.cannibalize.vars()[0] / 100);
        }
        if (type === 'lumberjack' && global.city.s_alter.harvest > 0){
            modifier *= 1 + (traits.cannibalize.vars()[0] / 100);
        }
        if ((type === 'army' || type === 'hellArmy') && global.city.s_alter.rage > 0){
            modifier *= 1 + (traits.cannibalize.vars()[0] / 100);
        }
        if (type === 'science' && global.city.s_alter.mind > 0){
            modifier *= 1 + (traits.cannibalize.vars()[0] / 100);
        }
    }
    let mantisFathom = fathomCheck('mantis');
    if (mantisFathom > 0){
        if (type === 'miner'){
            modifier *= 1 + (traits.cannibalize.vars(1)[0] / 100 * mantisFathom);
        }
        if (type === 'lumberjack'){
            modifier *= 1 + (traits.cannibalize.vars(1)[0] / 100 * mantisFathom);
        }
        if ((type === 'army' || type === 'hellArmy')){
            modifier *= 1 + (traits.cannibalize.vars(1)[0] / 100 * mantisFathom);
        }
        if (type === 'science'){
            modifier *= 1 + (traits.cannibalize.vars(1)[0] / 100 * mantisFathom);
        }
    }
    if (global.race['humpback'] && (type === 'miner' || type === 'lumberjack')){
        modifier *= 1 + (traits.humpback.vars()[1] / 100);
    }
    let kamelFathom = fathomCheck('kamel');
    if (kamelFathom > 0 && (type === 'miner' || type === 'lumberjack')){
        modifier *= 1 + (traits.humpback.vars(1)[1] / 100 * kamelFathom);
    }
    if (global.city.ptrait.includes('magnetic') && type === 'miner'){
        modifier *= planetTraits.magnetic.vars()[2];
    }
    if (global.race['weak'] && (type === 'miner' || type === 'lumberjack')){
        modifier *= 1 - (traits.weak.vars()[0] / 100);
    }
    if (global.race['hydrophilic'] && global.city.calendar.weather === 0 && global.city.calendar.temp > 0 && type !== 'factory'){
        modifier *= 0.75;
    }
    if (global.race['toxic'] && type === 'factory'){
        modifier *= 1 + (traits.toxic.vars()[2] / 100);
    }
    let shroomiFathom = fathomCheck('shroomi');
    if (shroomiFathom > 0 && type === 'factory'){
        modifier *= 1 + (traits.toxic.vars(1)[2] / 100 * shroomiFathom);
    }
    if (type === 'science'){ modifier *= geneBonus('cerebral'); }
    if (type === 'lumberjack'){ modifier *= geneBonus('arborist'); }
    modifier *= geneBonus('taskmaster');
    if (['lumberjack','miner','forager','hunting'].includes(type)){
        modifier *= geneBonus('titanic');
    }
    if (type === 'miner'){
        modifier *= geneBonus('opportunist');
    }
    if (global.race['ooze']){
        modifier *= 1 - (traits.ooze.vars()[0] / 100);
    }
    if (global.civic.govern.type === 'democracy'){
        modifier *= 1 - (govEffect.democracy()[1] / 100);
    }
    if (global.tech['cyber_worker'] && (type === 'lumberjack' || type === 'miner' || type === 'forager')){
        modifier *= 1.25;
    }
    if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.t 
        && ['farmer','miner','lumberjack','scavenger','factory'].includes(type)){
        let labor = 20 * (traits.ocular_power.vars()[1] / 100);
        modifier *= 1 + (labor / 100);
    }
    if (type === 'hunting'){
        if (global.race['tracker']){
            modifier *= 1 + (traits.tracker.vars()[0] / 100);
        }
        let wolvenFathom = fathomCheck('wolven');
        if (wolvenFathom > 0){
            modifier *= 1 + (traits.tracker.vars(1)[0] / 100 * wolvenFathom);
        }
        if (global.race['beast']){
            let rate = global.city.calendar.wind === 1 ? traits.beast.vars()[1] : traits.beast.vars()[0];
            modifier *= 1 + (rate / 100);
        }
        if (global.race['apex_predator']){
            modifier *= 1 + (traits.apex_predator.vars()[1] / 100);
        }
        let sharkinFathom = fathomCheck('sharkin');
        if (sharkinFathom > 0){
            modifier *= 1 + (traits.apex_predator.vars(1)[1] / 100 * sharkinFathom);
        }
        if (global.race['fiery']){
            modifier *= 1 + (traits.fiery.vars()[1] / 100);
        }
        let balorgFathom = fathomCheck('balorg');
        if (balorgFathom > 0){
            modifier *= 1 + (traits.fiery.vars(1)[1] / 100 * balorgFathom);
        }
        if (global.race['fragrant']){
            modifier *= 1 - (traits.fragrant.vars()[0] / 100);
        }
        if (global.city.ptrait.includes('rage')){
            modifier *= planetTraits.rage.vars()[1];
        }
        /*if (global.race['cunning']){
            modifier *= 1 + (geneVars('cunning')[0] * global.race['cunning'] / 100);
        }*/
        if (global.city.biome === 'savanna'){
            modifier *= biomes.savanna.vars()[1];
        }
        if (global.race['dark_dweller'] && global.city.calendar.weather === 2){
            modifier *= 1 - traits.dark_dweller.vars()[0] / 100;
        }
        if(global.city.banquet && global.city.banquet.on && global.city.banquet.level >= 3){
            modifier *= 1 + (global.city.banquet.strength ** 0.65) / 100;
        }
    }
    if (global.race.universe === 'magic'){
        if (type === 'science'){
            modifier *= 0.6;
        }
        else if (type === 'army' || type === 'hellArmy'){
            modifier *= 0.75;
        }
        else {
            modifier *= 0.8;
        }
        if (global.race['witch_hunter']){
            modifier *= 0.75;
        }
        if (global.race.hasOwnProperty('casting') && active_rituals[type === 'hellArmy' ? 'army' : type]){
            let boost = active_rituals[type === 'hellArmy' ? 'army' : type];
            if (global.race['witch_hunter']){
                modifier *= 1 + (boost / (boost + 75) * 2.5);
            }
            else {
                modifier *= 1 + (boost / (boost + 75));
            }
        }
    }
    if ((global.race['living_tool'] || global.race['tusk']) && type === 'miner'){
        const balance = global.race['hivemind'] ? traits.hivemind.vars()[0] : 1;
        let tusk = global.race['tusk'] ? 1 + ((traits.tusk.vars()[0] / 100) * (armyRating(jobScale(balance),'army',0) / balance / 100)) : 1;
        let lt = global.race['living_tool'] ? 1 + traits.living_tool.vars()[0] * (global.tech['science'] && global.tech.science > 0 ? global.tech.science * 0.12 : 0) : 1;
        modifier *= lt > tusk ? lt : tusk;
    }
    if (global.race['warlord']){
        if (type === 'miner'){
            modifier *= 1.82;
        }
        else if (type === 'lumberjack'){
            modifier *= 1.3;
        }
        else if (type === 'science'){
            modifier *= 1.5;
        }
    }
    if (global.race['forager'] && type === 'forager'){
        modifier *= traits.forager.vars()[0] / 100;
    }
    if (global.race['high_pop']){
        modifier = highPopAdjust(modifier);
    }
    if (global.race['gravity_well'] && ['farmer', 'miner', 'lumberjack', 'factory', 'hunting', 'forager'].includes(type)){
        modifier = teamster(modifier);
    }
    return modifier;
}

/*
types: farmer, miner, lumberjack, science, factory, army, hunting, scavenger, forager
*/
export function servantTrait(workers,type){
    let modifier = 1;
    if (global.race['gravity_well'] && ['farmer', 'miner', 'lumberjack', 'factory', 'hunting', 'scavenger', 'forager'].includes(type)){
        modifier = teamster(modifier);
    }
    return modifier;
}

// --- Minor genes ----------------------------------------------------------------------------
// Ten slots, each holding one gene at one rank. A gene must be unlocked with phage before it can
// be slotted, except the two specials, which carry their own unlock conditions instead.

// Every tunable of the gene economy in one place, so a retune is a single edit here rather than a
// hunt through the module.
export const genes = {
    // Pairs each strand starts with, before Adaptable, CRISPR or any bonus.
    strand_major_pairs: 5,
    strand_minor_pairs: 4,
    // The CRISPR Evolve ranks that lengthen a strand, and which one each adds a pair to.
    strand_evolve_major: [5],
    strand_evolve_minor: [3,8],
    // Evolve ranks that gate a whole behaviour rather than a count.
    evolve_limit_break: 2,      // minor genes may be limit broken at all
    evolve_genus_slots: 6,      // minor genes may sit in a genus rung's spare half
    evolve_crossing: 10,        // majors and minors may swap strands, at the usual penalties
    // Evolve ranks that hand over a matched pair of minor genes at evolution.
    strand_evolve_grants: [4,7,9],
    strand_grant_rank: 5,       // the rank each of those genes arrives at
    // Extra rank ceiling and limit-break value for genes in genus rungs.
    genus_rank_start: 20,
    genus_break_ranks: 10,
    // Base cost and increment for sealed recessive pairs.
    strand_recessive_base: 20,
    strand_recessive_step: 10,
    strand_slots: 2,            // slots on a pair: [X] - [Y]
    strand_cap: 12,             // most pairs either strand can ever hold; fixes the index ranges
    // Minimum Versatile rank that unlocks the extra minor pair.
    versatility_pair_rank: 0.5,
    strand_version: 9,          // bumped to re-lay every strand on load after a layout change
    // Layout version that migrates Powered's labor bonus to Tireless.
    strand_split_powered: 8,
    gene_unlock_phage: 25,
    gene_slot_cost: 10,         // genes, to fill any empty slot
    gene_rank_base: 5,          // ranks a mispaired slot holds before any limit break (legacy saves)
    gene_rank_paired: 10,       // ...and what a minor gene in a minor slot holds instead
    gene_rank_major: 20,        // ...and what a minor gene given a major slot holds
    gene_break_ranks: 5,        // ranks each limit break adds
    // Strength multiplier for major/genus traits in minor slots.
    minor_slot_penalty: 0.5,
    // Minimum rank retained by an emergent genus trait with no feeders.
    genus_emergent_floor: 0.1,
    // Base assigned to each major/genus trait taxonomy.
    gene_strand: ['A','T','C','G'],
    gene_taxonomy: { combat: 'A', production: 'T', resource: 'C', utility: 'G' },
    // Which base answers which. A gene pairs with the slot bearing its own base; the rung it sits on
    // is what makes that slot's partner the complement.
    gene_pairs: { A: 'T', T: 'A', C: 'G', G: 'C' },
    // Every rank costs this much more than the one before it, all the way up. The ladder is grown
    // from gene_slot_cost rather than written out, so the two can never drift apart.
    gene_rank_growth: 1.85,
    // Plasmids per limit break.
    gene_break_cost: [5,10,25,50],
    // Past the table the price climbs by a flat step rather than a multiplier.
    gene_break_step: 25,
    // Genes priced above the standard rate.
    gene_cost_mult: { mastery: 2 },
    // Genes a mutation pays, as gene_mutation_scale x mutation cubed. Cubic rather than doubling:
    // it keeps climbing so a late mutation is still worth having, but it cannot outrun every sink
    // in the game the way 2^n did -- that reached a trillion genes a mutation by the fortieth.
    gene_mutation_scale: 4,
    // The specials sit outside the unlock economy: they are earned, not bought.
    gene_specials: ['fortify','mastery']
};

// Every minor gene in the game, genus-locked ones included and regardless of what this run can
// use. geneRoster() is the per-run view; this is the whole library a player can come to own.
export function geneCatalog(){
    return Object.keys(traits).filter(function(t){ return traits[t].type === 'minor'; });
}

// Every gene this run could ever slot: the standard list, plus the genes of the current genus,
// plus whichever specials have been earned.
// The two specials are earned rather than bought, each on its own condition. Whenever that condition
// holds they count as permanently unlocked, and nothing is written to geneUnlock -- the condition is
// the record, so it re-evaluates itself every run without any bookkeeping to keep in step.
export function geneSpecialUnlocked(gene){
    switch (gene){
        case 'mastery':
            return global.genes['challenge'] && global.genes.challenge >= 5 ? true : false;
        case 'fortify':
            return global.tech['decay'] && global.tech.decay >= 2 ? true : false;
    }
    return false;
}

// The genus a gene is matched against. A hybrid carries two on its species record and is neither
// of them by default; the one it counts as is whichever was specialised during evolution, which
// race.maintype records -- the same lookup resets.js and the gene lab use.
export function geneGenus(){
    if (!global.race.species || !races[global.race.species]){ return false; }
    return races[global.race.species].type === 'hybrid'
        ? (global.race['maintype'] || false)
        : races[global.race.species].type;
}

export function geneRoster(){
    let genus = geneGenus();
    return Object.keys(traits).filter(function(t){
        if (genes.gene_specials.includes(t)){ return geneSpecialUnlocked(t); }
        if (traits[t].type !== 'minor'){ return false; }
        return traits[t].genus ? traits[t].genus === genus : true;
    });
}

// Unlocks come in two tiers.
// global.genes.geneUnlock  bought with phage, permanent, survives every reset
// global.race.geneUnlock   found by mutating, lasts this run only
export function geneTempUnlocks(){
    if (!global.race['geneUnlock'] || typeof global.race['geneUnlock'] !== 'object'){
        global.race['geneUnlock'] = {};
    }
    return global.race.geneUnlock;
}

export function genePermanent(gene){
    // A special that has met its condition reads as permanent without ever being recorded.
    if (geneSpecialUnlocked(gene)){ return true; }
    return global.genes['geneUnlock'] && global.genes.geneUnlock[gene] ? true : false;
}

export function geneTemp(gene){
    return geneTempUnlocks()[gene] ? true : false;
}

export function geneUnlocked(gene){
    return genePermanent(gene) || geneTemp(gene) ? true : false;
}

// Some minor traits should not be mutated by some species
// Negative logic, don't hurt your brain
const geneUnsuited = {
    arborist(){ return global.race['kindling_kindred'] || global.race['smoldering'] ? true : false; },
    chlorophyll(){ return global.race['sappy'] ? false : true; },
    fireweave(){ return global.race['smoldering'] ? false : true; },
    stonecutter(){ return global.race['sappy'] ? true : false; },
    sapper(){ return global.race['flier'] ? true : false; },
    duneborn(){ return global.race['flier'] ? true : false; },
    featherlight(){ return global.race['truepath'] ? false : true; },
    despot(){ return global.race.universe === 'evil' ? false : true; },
    thaumaturge(){ return global.race.universe === 'magic' ? false : true; },
    infernal(){ return global.race['truepath'] ? true : false; }
};

export function geneSuited(gene){
    return geneUnsuited[gene] ? !geneUnsuited[gene]() : true;
}


// --- Gene strands ------------------------------------------------------------------------------
// Major/genus traits and minor genes use separate paired slot ranges.
// Empty pairs are oriented by their first trait; cross-strand placement applies the configured penalty.

// How far one strand's range reaches, whether or not that many pairs are unlocked.
function strandSpan(){
    return genes.strand_cap * genes.strand_slots;
}

// Where a strand's indices begin.
export function strandBase(kind){
    return kind === 'major' ? 0 : strandSpan();
}

// Every index the two strands occupy; granted extras start here.
export function geneSlotCount(){
    return strandSpan() * 2;
}

// Return cached genus and mimic rungs at the head of the major strand.
export function strandGenusPairs(){
    if (geneGenusPairs !== null){ return geneGenusPairs; }
    let pairs = 0;
    strandGenera().forEach(function(g){
        pairs += Math.ceil(genusFeeders(g).length / genes.strand_slots);
    });
    // Add rungs for slottable traits from the active mimic.
    pairs += Math.ceil(strandMimicTraits().length / genes.strand_slots);
    geneGenusPairs = pairs;
    return pairs;
}

// Whether Versatile is currently paying for its pair.
export function versatileActive(){
    return (global.race['versatility'] || 0) >= genes.versatility_pair_rank;
}

// Pairs unlocked on a strand.
export function strandPairCount(kind){
    let major = kind === 'major';
    let pairs = major ? genes.strand_major_pairs : genes.strand_minor_pairs;
    // The CRISPR Evolve line lengthens both strands as it goes.
    let evolve = global.genes['evolve'] || 0;
    (major ? genes.strand_evolve_major : genes.strand_evolve_minor).forEach(function(rank){
        if (evolve >= rank){ pairs++; }
    });
    if (!major && versatileActive()){ pairs++; }
    pairs += global.race['geneSlotBonus'] || 0;
    if (major){ pairs += strandGenusPairs() + strandRecessivePairs(); }
    return Math.min(genes.strand_cap, pairs);
}

// Base pairs a custom design bought outright in the gene lab.
export function strandRecessivePairs(){
    let key = customSlotKey();
    if (!key || !global['custom'] || !global.custom[key]){ return 0; }
    return global.custom[key]['recessive'] || 0;
}

// What the next recessive pair costs, given how many the design already holds.
export function recessivePairCost(owned){
    return genes.strand_recessive_base + ((owned || 0) * genes.strand_recessive_step);
}

// What a whole run of them costs together.
export function recessiveTotalCost(count){
    let total = 0;
    for (let n=0; n<(count || 0); n++){ total += recessivePairCost(n); }
    return total;
}

// Whether a trait is sitting in one of the recessive pairs.
export function traitRecessive(trait){
    let held = strandRecessivePairs();
    if (held <= 0){ return false; }
    let slots = geneSlots();
    let total = strandPairCount('major');
    let from = strandBase('major') + (total - held) * genes.strand_slots;
    let to = strandBase('major') + total * genes.strand_slots;
    for (let i=from; i<to; i++){
        if (slots[i] && slots[i].g === trait){ return true; }
    }
    return false;
}

// Whether a slot is one of those sealed pairs. Nothing comes out of one.
export function slotRecessive(slot){
    if (geneSlotExtra(slot) || slotKind(slot) !== 'major'){ return false; }
    let bonus = strandRecessivePairs();
    if (bonus <= 0){ return false; }
    return slotPair(slot) >= strandPairCount('major') - bonus;
}

export function majorPairCount(){ return strandPairCount('major'); }
export function minorPairCount(){ return strandPairCount('minor'); }

export function geneSlots(){
    if (!global.race['geneSlots'] || !Array.isArray(global.race['geneSlots'])){
        global.race['geneSlots'] = [];
    }
    let slots = global.race.geneSlots;
    // Both ranges always exist in full; what is unlocked is a question for slotActive, not for the shape of the array.
    while (slots.length < geneSlotCount()){ slots.push(false); }
    return slots;
}

export function geneSlotExtra(slot){
    return slot >= geneSlotCount();
}

// Which strand a slot belongs to.
export function slotKind(slot){
    return !geneSlotExtra(slot) && slot < strandSpan() ? 'major' : 'minor';
}

export function slotIsMajor(slot){
    return slotKind(slot) === 'major';
}

export function slotPair(slot){
    return geneSlotExtra(slot) ? false : Math.floor((slot - strandBase(slotKind(slot))) / genes.strand_slots);
}

// 0 for the left half of a rung, 1 for the right.
export function slotSide(slot){
    return geneSlotExtra(slot) ? false : (slot - strandBase(slotKind(slot))) % genes.strand_slots;
}

// Whether a slot is one the player has.
export function slotActive(slot){
    let slots = geneSlots();
    if (slot < 0 || slot >= slots.length){ return false; }
    if (slots[slot] && slots[slot].g){ return true; }
    if (geneSlotExtra(slot)){ return slots[slot] ? true : false; }
    return slotPair(slot) < strandPairCount(slotKind(slot));
}

export function geneSlotLabel(slot){
    if (geneSlotExtra(slot)){
        let slots = geneSlots();
        let n = 0;
        for (let i=geneSlotCount(); i<=slot && i<slots.length; i++){
            if (slots[i]){ n++; }
        }
        return `S${n}`;
    }
    // The pair number and which half of it, which is all a slot needs: the tab says which strand.
    let pair = slotPair(slot);
    let half = slotSide(slot) === 0 ? 'A' : 'B';
    if (slotKind(slot) === 'major'){
        let held = strandGenusPairs();
        if (pair < held){ return `G${pair + 1}${half}`; }
        let bonus = strandRecessivePairs();
        let first = strandPairCount('major') - bonus;
        if (bonus > 0 && pair >= first){ return `R${pair - first + 1}${half}`; }
        return `${pair - held + 1}${half}`;
    }
    return `${pair + 1}${half}`;
}

// Return whether a trait uses gene slotting and ranking rules.
export function geneLike(trait){
    return traits[trait] && (traits[trait].type === 'minor' || genes.gene_specials.includes(trait)) ? true : false;
}

// The base a gene reads as.
export function geneBaseOf(gene){
    if (!traits[gene] || genes.gene_specials.includes(gene)){ return false; }
    if (traits[gene].base){ return traits[gene].base; }
    return traits[gene].taxonomy ? (genes.gene_taxonomy[traits[gene].taxonomy] || false) : false;
}

// Return a pair's orientation, or false while it is empty.
export function pairBase(slot){
    if (slot === false || slot < 0){ return false; }
    let slots = geneSlots();
    let first = slot - (slot % genes.strand_slots);
    for (let n=0; n<genes.strand_slots; n++){
        let s = slots[first + n];
        if (!s || !s.g || genes.gene_specials.includes(s.g)){ continue; }
        let b = s.b || geneBaseOf(s.g);
        if (b){ return n === 0 ? b : genes.gene_pairs[b]; }
    }
    return false;
}

// The base a slot calls for, or false while its pair has no orientation yet.
export function geneSlotBase(slot){
    let s = geneSlots()[slot];
    // Granted slots carry their own bases outside the two strands.
    if (s && s.x){ return s.b || false; }
    if (geneSlotExtra(slot)){ return false; }
    let base = pairBase(slot);
    if (!base){ return false; }
    return slotSide(slot) === 0 ? base : genes.gene_pairs[base];
}

// The slot across the rung from this one, or false when it is on no rung at all.
export function genePairSlot(slot){
    return slot % genes.strand_slots === 0 ? slot + 1 : slot - 1;
}

// The genus's rungs at the head of the major strand belong to it.
export function slotGenusHeld(slot){
    if (geneSlotExtra(slot) || slotKind(slot) !== 'major'){ return false; }
    return slotPair(slot) < strandGenusPairs();
}

// Whether a trait is one of this run's genera's own.
export function genusFeeder(trait){
    if (strandMimicTraits().includes(trait)){ return true; }
    return strandGenera().some(function(g){ return genusFeeders(g).includes(trait); });
}

// Return slottable traits granted by the active mimic.
export function strandMimicTraits(){
    if (!global.race['shapeshifter'] || !Array.isArray(global.race['ss_traits'])){ return []; }
    let mimic = strandMimic();
    let held = mimic && Array.isArray(genus_def[mimic].emergent) ? genus_def[mimic].emergent : [];
    // Exclude the mimicked genus's emergent and permanent traits from its rungs.
    return global.race.ss_traits.filter(function(t){
        return traits[t] && !held.includes(t) && !traitPermanent(t);
    });
}

// The genus currently being mimicked, or false.
export function strandMimic(){
    let at = global.race['ss_genus'];
    return global.race['shapeshifter'] && at && at !== 'none' && genus_def[at] ? at : false;
}

// Return eligible genera for Shapeshifter to mimic.
export function shapeOptions(){
    if (!global.race['species'] || !races[global.race.species]){ return []; }
    const sp = races[global.race.species];
    const base = sp.type === 'hybrid' && Array.isArray(sp.hybrid) ? sp.hybrid : [sp.type];
    const imitation = global.race['imitation'] && global.race['srace'] && races[global.race.srace]
        ? (races[global.race.srace].type === 'hybrid' ? races[global.race.srace].hybrid : [races[global.race.srace].type])
        : [];
    return Object.keys(genus_def).filter(function(gen){
        if (['synthetic','eldritch','hybrid'].includes(gen)){ return false; }
        if (base.includes(gen) || imitation.includes(gen)){ return false; }
        return global.stats.achieve[`genus_${gen}`] && global.stats.achieve[`genus_${gen}`].l > 0;
    });
}

// Whether the two strands are open to each other.
export function geneCrossingUnlocked(){
    return (global.genes['evolve'] || 0) >= genes.evolve_crossing;
}

// Chimeric DNA lets a minor gene take the half of a genus rung the genus is not using.
export function geneGenusSlotUnlocked(){
    return (global.genes['evolve'] || 0) >= genes.evolve_genus_slots;
}

// Whether a gene may go in a slot at all.
export function geneSlotFits(slot,gene){
    if (geneSlotExtra(slot) || !slotActive(slot)){ return false; }
    if (slotGenusHeld(slot)){
        // The genus's own traits always; a gene only once Chimeric DNA has opened the spare half.
        if (!genusFeeder(gene) && !(geneLike(gene) && geneGenusSlotUnlocked())){ return false; }
    }
    // Each kind keeps to its own strand until Unlocked DNA says otherwise.
    else if (!geneCrossingUnlocked() && geneLike(gene) === slotIsMajor(slot)){ return false; }
    let want = geneSlotBase(slot);
    if (!want){ return true; }
    let mine = geneBaseOf(gene);
    return !mine || mine === want ? true : false;
}

// Whether the gene sitting in a slot answers that slot's own base.
export function geneSlotAnswers(slot){
    let s = geneSlots()[slot];
    if (!s || !s.g || !traits[s.g]){ return false; }
    if (genes.gene_specials.includes(s.g)){ return true; }
    let base = geneSlotBase(slot);
    return base && geneEffectiveBase(slot) === base ? true : false;
}

// Correctly paired minor-gene rungs produce these slotless traits.
export const geneEmergent = { A: 'content', T: 'content', C: 'promiscuous', G: 'promiscuous' };

// Static lookup of emergent gene names.
const geneEmergentBy = {};
Object.keys(geneEmergent).forEach(function(b){ geneEmergentBy[geneEmergent[b]] = true; });
const geneEmergentNames = Object.freeze(Object.keys(geneEmergentBy));

export function geneEmergentList(){
    return geneEmergentNames;
}

// Cache emergent gene ranks; recompute them when the strand changes.
let geneRankCache = null;
// Cache gene-to-slot lookups.
let geneSlotMap = null;
// Cache each gene's bonded state for geneVars().
let geneWeakMap = null;
// How many rungs the genus is holding. Read through strandPairCount on nearly every strand lookup.
let geneGenusPairs = null;

export function bumpGeneCache(){
    geneRankCache = null;
    geneSlotMap = null;
    geneWeakMap = null;
    geneGenusPairs = null;
}

// The rank a paired minor rung lends to Content or Promiscuous. A major moved onto the
// minor strand behaves as a standard rank-10 minor here, without changing its own effect.
function minorEmergentSlotRank(slot){
    let held = geneSlots()[slot];
    if (!held || !held.g || !traits[held.g]){ return 0; }
    if (geneLike(held.g)){ return held.r || 0; }
    if (!geneSlotExtra(slot) && slotKind(slot) === 'minor' && traits[held.g].type === 'major'){
        return genes.gene_rank_paired;
    }
    return 0;
}

function buildGeneRanks(){
    let out = {};
    geneEmergentNames.forEach(function(g){ out[g] = 0; });
    let slots = geneSlots();
    let step = genes.strand_slots;
    let majorFrom = strandBase('major');
    let majorTo = majorFrom + (strandGenusPairs() * step);
    for (let i=0; i+1<slots.length; i+=step){
        // Genus rungs do not contribute to gene emergents.
        if (i >= majorFrom && i < majorTo){ continue; }
        let a = slots[i], b = slots[i + 1];
        if (!a || !a.g || !b || !b.g){ continue; }
        let aRank = minorEmergentSlotRank(i);
        let bRank = minorEmergentSlotRank(i + 1);
        if (aRank <= 0 || bRank <= 0){ continue; }
        if (!geneSlotAnswers(i) || !geneSlotAnswers(i + 1)){ continue; }
        if (!geneSlotMatched(i)){ continue; }
        let grows = geneEmergent[geneSlotBase(i)];
        if (grows === undefined || out[grows] === undefined){ continue; }
        out[grows] += Math.min(aRank,bRank);
    }
    return out;
}

export function geneEmergentRank(gene){
    if (geneRankCache === null){ geneRankCache = buildGeneRanks(); }
    return geneRankCache[gene] || 0;
}


// --- Emergent genus properties -----------------------------------------------------------------
// Held-back genus traits use the average rank of their slotted feeders and never occupy a slot.

// The genera this run was evolved from, primary first.
export function strandGenera(){
    if (Array.isArray(global.race['strandGenus']) && global.race.strandGenus.length > 0){
        return global.race.strandGenus;
    }
    let sp = global.race['species'] ? races[global.race.species] : false;
    if (!sp){ return []; }
    return sp.type === 'hybrid' && Array.isArray(sp.hybrid) ? sp.hybrid.slice() : [sp.type];
}

// Which custom design this run was built from, if any.
export function customSlotKey(){
    if (global.race['species'] === 'hybrid'){ return 'race1'; }
    if (global.race['species'] === 'custom'){ return 'race0'; }
    return false;
}

// The arrangement a custom design saved, as { trait: slot }.
export function customArrangement(){
    let key = customSlotKey();
    if (!key || !global['custom'] || !global.custom[key]){ return false; }
    let design = global.custom[key];
    if (!design['slots'] || typeof design.slots !== 'object'){ return false; }
    return (design['v'] || 1) >= 2 ? design.slots : false;
}

// Traits nothing can ever take off.
const permanentTraits = ['evil','soul_eater','artifical'];

// Traits a fanatic revelation or a deified ancestor handed over during this run.
export function fanaticGranted(){
    if (!global.race['fanaticTraits'] || typeof global.race['fanaticTraits'] !== 'object'){
        global.race['fanaticTraits'] = {};
    }
    return global.race.fanaticTraits;
}

export function markFanaticTrait(trait){
    if (!traits[trait]){ return false; }
    fanaticGranted()[trait] = 1;
    // Permanent traits can change genus-rung count, so invalidate cached strand data.
    bumpGeneCache();
    return true;
}

export function traitPermanent(trait){
    if (permanentTraits.includes(trait)){ return true; }
    // A sludge cannot stop being made of sludge.
    if (trait === 'ooze' && ['sludge','ultra_sludge'].includes(global.race['species'])){ return true; }
    // Nothing can take back a revelation either, and there is no slot to take it out of.
    if (global.race['fanaticTraits'] && global.race.fanaticTraits[trait]){ return true; }
    return false;
}

// Return permanent traits that run as slotless emergent properties.
export function permanentEmergent(){
    let out = [];
    let held = genusEmergent();
    Object.keys(global.race).forEach(function(t){
        if (!traits[t] || held[t] || !traitPermanent(t)){ return; }
        if (traits[t].type !== 'major' && traits[t].type !== 'genus' && traits[t].type !== 'special'){ return; }
        out.push(t);
    });
    return out;
}

// The traits a genus keeps back as emergent properties, mapped to the genus they came from.
export function genusEmergent(){
    let out = {};
    let list = strandGenera().slice();
    // Include emergent traits from the currently mimicked genus.
    let mimic = strandMimic();
    if (mimic && !list.includes(mimic)){ list.push(mimic); }
    list.forEach(function(g){
        if (!genus_def[g] || !Array.isArray(genus_def[g].emergent)){ return; }
        genus_def[g].emergent.forEach(function(t){ out[t] = g; });
    });
    return out;
}

export function genusEmergentList(){
    return Object.keys(genusEmergent());
}

// The traits of a genus that actually go on the strand: everything it defines, less what it keeps back as emergent.
export function genusStrandTraits(genus){
    if (!genus_def[genus]){ return []; }
    let held = Array.isArray(genus_def[genus].emergent) ? genus_def[genus].emergent : [];
    return Object.keys(genus_def[genus].traits).filter(function(t){
        return !held.includes(t) && !permanentTraits.includes(t);
    });
}

export function genusFeeders(genus){
    // A trait that can never be slotted would feed nothing but a zero, so it is not counted as a feeder at all.
    return genusStrandTraits(genus).filter(function(t){ return !traitPermanent(t); });
}

export function genusEmergentRank(trait){
    let genus = genusEmergent()[trait];
    if (!genus){ return 0; }
    let feeders = genusFeeders(genus);
    if (feeders.length === 0){ return genes.genus_emergent_floor; }
    let total = 0;
    feeders.forEach(function(t){
        // Only a feeder that is actually on the strand counts.
        if (geneSlotOf(t) === false){ return; }
        total += global.race[t] || 0;
    });
    let rank = +(total / feeders.length).toFixed(6);
    return rank > 0 ? rank : genes.genus_emergent_floor;
}

// Return a gene's slot-stamped base, or its intrinsic base.
export function geneEffectiveBase(slot){
    let s = geneSlots()[slot];
    if (!s || !s.g || !traits[s.g]){ return false; }
    if (genes.gene_specials.includes(s.g)){ return s.b || geneSlotBase(slot); }
    return s.b || geneBaseOf(s.g);
}

// Return whether the two genes on a rung use complementary bases.
export function geneSlotMatched(slot){
    let partner = genePairSlot(slot);
    if (partner === false){ return false; }
    let a = geneEffectiveBase(slot), b = geneEffectiveBase(partner);
    return a && b && genes.gene_pairs[a] === b ? true : false;
}

// An unbonded gene runs at half strength.
export function geneWeak(gene){
    if (geneWeakMap === null){ geneWeakMap = {}; }
    let held = geneWeakMap[gene];
    if (held === undefined){
        let slot = geneSlotOf(gene);
        held = slot === false || !geneSlotMatched(slot);
        geneWeakMap[gene] = held;
    }
    return held;
}

// Return a gene's active values, including the unbonded penalty.
export function geneVars(gene){
    if (!traits[gene] || !traits[gene].vars){ return [0]; }
    return traits[gene].vars(geneWeak(gene) ? 0.5 : 1);
}

// Return a gene slot index, preserving slot zero as a valid result.
export function geneSlotOf(gene){
    if (geneSlotMap === null){
        geneSlotMap = {};
        let slots = geneSlots();
        for (let i=0; i<slots.length; i++){
            if (slots[i] && slots[i].g && geneSlotMap[slots[i].g] === undefined){
                geneSlotMap[slots[i].g] = i;
            }
        }
    }
    let at = geneSlotMap[gene];
    return at === undefined ? false : at;
}

// Limit-break purchases require the Unlocked DNA upgrade; awarded breaks remain valid.
export function geneBreakUnlocked(){
    return (global.genes['evolve'] || 0) >= genes.evolve_limit_break;
}

// Limit breaks bought per slot this run.
export function geneBreaks(){
    if (!global.race['geneBreak'] || typeof global.race['geneBreak'] !== 'object'){
        global.race['geneBreak'] = {};
    }
    return global.race.geneBreak;
}

// Return a slot's rank ceiling before limit breaks.
export function geneRankStart(slot){
    // A gene sitting in a genus rung, which only Chimeric DNA allows, climbs further than one anywhere else.
    if (slotGenusHeld(slot)){ return genes.genus_rank_start; }
    return slotIsMajor(slot) ? genes.gene_rank_major : genes.gene_rank_paired;
}

// What one limit break is worth here.
export function geneBreakRanks(slot){
    return slotGenusHeld(slot) ? genes.genus_break_ranks : genes.gene_break_ranks;
}

// Rank cap for a slot: where it starts, plus what each limit break paid for this run is worth.
export function geneRankCap(slot){
    let breaks = geneBreaks()[slot] || 0;
    return geneRankStart(slot) + (breaks * geneBreakRanks(slot));
}

// How many limit breaks a slot needs before it could hold this rank at all.
function geneBreaksFor(rank,slot){
    let start = slot === undefined ? genes.gene_rank_paired : geneRankStart(slot);
    let step = slot === undefined ? genes.gene_break_ranks : geneBreakRanks(slot);
    return rank > start ? Math.ceil((rank - start) / step) : 0;
}

// What Versatile takes off the price of putting a gene in a slot or pushing it up a rank.
export function geneCostDiscount(gene){
    if (gene && !geneLike(gene)){ return 1; }
    let rank = traitRank('versatility') || 0;
    if (rank <= 0){ return 1; }
    return 1 - (traits.versatility.vars(rank)[0] / 100);
}

// Self explanatory: the cost to slot or upgrade a gene
export function geneSlotCost(slot,gene){
    let g = gene !== undefined ? gene : geneInSlot(slot);
    return Math.max(1,Math.floor(genes.gene_slot_cost * geneCostMod(g) * geneCostDiscount(g)));
}

function geneCostMod(gene){
    return gene && genes.gene_cost_mult[gene] ? genes.gene_cost_mult[gene] : 1;
}

// The gene sitting in a slot, or false.
function geneInSlot(slot){
    let s = geneSlots()[slot];
    return s && s.g ? s.g : false;
}

// Rank 1 is the slot price; each rank after it is the previous one grown by gene_rank_growth and
// rounded, so the whole ladder follows from what a slot costs.
export function geneRankCost(rank,gene,slot){
    let cost = genes.gene_slot_cost;
    for (let r=2; r<=rank; r++){ cost = Math.round(cost * genes.gene_rank_growth); }
    return Math.max(1,Math.floor(cost * geneCostMod(gene) * geneCostDiscount(gene)));
}

export function geneBreakCost(slot){
    let breaks = geneBreaks()[slot] || 0;
    if (breaks < genes.gene_break_cost.length){
        return genes.gene_break_cost[breaks];
    }
    return genes.gene_break_cost[genes.gene_break_cost.length - 1]
         + ((breaks - genes.gene_break_cost.length + 1) * genes.gene_break_step);
}

// The live rank of a gene, which is what every effect reads. Zero unless it is sitting in a slot.
export function geneRank(gene){
    // An emergent trait sits in no slot; its rank is read off the pairs instead.
    if (geneEmergentBy[gene]){ return geneEmergentRank(gene); }
    let slot = geneSlotOf(gene);
    if (slot === false){ return 0; }
    // Only minor genes are ranked on the slot.
    return geneSlots()[slot].r || 0;
}

// The multiplier a gene contributes, as 1 + vars[idx] * rank / 100. The one call every hook makes.
export function geneBonus(gene,idx,reduce){
    reduce = reduce || false;
    let rank = geneRank(gene);
    if (rank <= 0 || !traits[gene]){ return 1; }
    let vars = geneVars(gene);
    return reduce ? 1 - (vars[idx || 0] * rank / 100) : 1 + (vars[idx || 0] * rank / 100);
}

// The combined multiplier for temple-derived effects; priest capacity and trade routes do not use it.
export function templeOutputBonus(){
    return geneBonus('zealot') * geneBonus('radiant');
}

// The same figure as a plain total rather than a multiplier, for the handful of effects that add
// a flat amount instead of scaling something.
export function geneFlat(gene,idx){
    let rank = geneRank(gene);
    if (rank <= 0 || !traits[gene]){ return 0; }
    let vars = geneVars(gene);
    return vars[idx || 0] * rank;
}

// Synchronize slotted ranks onto global.race.
export function syncGenes(){
    // Invalidate caches before syncing every changed slot and rank.
    bumpGeneCache();
    // The genus properties first, and only then the genes.
    syncGenusEmergent();
    geneRoster().forEach(function(t){
        if (!genes.gene_specials.includes(t)){ delete global.race[t]; }
    });
    geneSlots().forEach(function(slot){
        // Major and genus slot entries keep their gameplay rank on global.race.
        if (slot && slot.g && slot.r && geneLike(slot.g)){
            global.race[slot.g] = slot.r;
        }
    });
    // Store slotless emergent ranks where gameplay hooks read them.
    geneEmergentList().forEach(function(t){
        let rank = geneEmergentRank(t);
        if (rank > 0){ global.race[t] = rank; }
        else { delete global.race[t]; }
    });
}

// Synchronize emergent genus ranks onto global.race.
export function syncGenusEmergent(){
    let held = global.race['inactiveTraits'] || {};
    genusEmergentList().forEach(function(t){
        // Angelic primary races do not regain Evil from a demonic hybrid.
        if (t === 'evil' && global.race['maintype'] === 'angelic'){
            delete global.race['evil'];
            return;
        }
        let rank = genusEmergentRank(t);
        if (held.hasOwnProperty(t)){ held[t] = rank; }
        else { global.race[t] = rank; }
    });
    syncMimicRanks();
    // Versatile has just been written, so this is the one place that knows the minor strand may have shortened.
    pruneStrand();
}

// Synchronize mimicked trait ranks from Shapeshifter.
export function syncMimicRanks(){
    let worn = strandMimicTraits();
    if (worn.length === 0){ return; }
    let held = global.race['inactiveTraits'] || {};
    let cut = traits.shapeshifter.vars();
    worn.forEach(function(t){
        if (!traits[t]){ return; }
        let rank = traits[t].val >= 0 ? cut[0] : cut[1];
        if (held.hasOwnProperty(t)){ held[t] = rank; }
        else { global.race[t] = rank; }
    });
}

// --- Laying traits out on the strand -----------------------------------------------------------

// Traits the strand does not hold.
export function strandGranted(){
    let out = {};
    let mark = function(t){ if (traits[t]){ out[t] = true; } };
    if (global.race['iTraits']){ Object.keys(global.race.iTraits).forEach(mark); }
    // Mimicked traits are placed as strand rungs, not granted traits.
    if (Array.isArray(global.race['absorbed'])){
        global.race.absorbed.forEach(function(r){
            if (races[r] && races[r].fanaticism){ mark(races[r].fanaticism); }
        });
    }
    if (global.race['wishStats']){
        Object.keys(global.race.wishStats).forEach(function(t){
            if (global.race.wishStats[t]){ mark(t); }
        });
    }
    return out;
}

// Where a trait would rather sit.
function slotPreference(trait){
    return geneLike(trait) ? ['minor','major'] : ['major','minor'];
}

// Write a gene into a slot.
function setGeneSlot(slot,gene,opts){
    opts = opts || {};
    let slots = geneSlots();
    let entry = { g: gene };
    let stamp = opts['base'] || (genes.gene_specials.includes(gene) ? geneSlotBase(slot) : false);
    if (stamp){ entry.b = stamp; }
    if (geneLike(gene)){ entry.r = Math.max(1,opts['rank'] || 1); }
    slots[slot] = entry;
    delete geneBreaks()[slot];
    bumpGeneCache();
    return slot;
}

// Find a slot for a trait and put it there.
export function placeTrait(trait,opts){
    opts = opts || {};
    if (!traits[trait]){ return false; }
    // A trait that can never be taken off never goes in either strand; it runs as an emergent property instead.
    if (traitPermanent(trait)){ return false; }
    let held = geneSlotOf(trait);
    if (held !== false){ return held; }
    let slots = geneSlots();
    // A slot the player picked out is taken as given, so long as the pairing rules allow it.
    if (opts['slot'] !== undefined && opts.slot !== false){
        let at = opts.slot;
        if (geneSlotExtra(at) || at < 0 || at >= slots.length){ return false; }
        // Swapping one minor gene for another is a refill; anything else needs the slot empty.
        let held = slots[at];
        if (held && held.g && !(geneLike(held.g) && geneLike(trait))){
            return false;
        }
        if (!geneSlotFits(at,trait)){ return false; }
        return finishPlacement(at,trait,opts);
    }
    let kinds = opts['kind'] ? [opts.kind] : slotPreference(trait);
    if (opts['overflow'] === false){ kinds = kinds.slice(0,1); }
    for (let k=0; k<kinds.length; k++){
        let open = [], fresh = [];
        for (let i=0; i<slots.length; i++){
            if (slots[i] || geneSlotExtra(i) || !slotActive(i)){ continue; }
            if (slotKind(i) !== kinds[k]){ continue; }
            if (!geneSlotFits(i,trait)){ continue; }
            (pairBase(i) ? open : fresh).push(i);
        }
        let pick = open.length > 0 ? open[0] : (fresh.length > 0 ? fresh[0] : false);
        if (pick === false){ continue; }
        return finishPlacement(pick,trait,opts);
    }
    return false;
}

function finishPlacement(slot,trait,opts){
    setGeneSlot(slot,trait,opts);
    // Major and genus traits use half strength in minor slots.
    if (!geneLike(trait) && !slotIsMajor(slot)){
        global.race[trait] = +((global.race[trait] || 1) * genes.minor_slot_penalty).toFixed(6);
        geneSlots()[slot].p = true;
    }
    return slot;
}

// Whether either strand has anywhere at all to put a trait.
export function strandRoom(trait){
    let slots = geneSlots();
    for (let i=0; i<slots.length; i++){
        if (slots[i] || geneSlotExtra(i) || !slotActive(i)){ continue; }
        if (geneSlotFits(i,trait)){ return true; }
    }
    return false;
}

// Take a trait off its strand. The pair it was on loses its orientation once nothing is left in it.
export function unplaceTrait(trait){
    let slot = geneSlotOf(trait);
    if (slot === false || geneSlotExtra(slot)){ return false; }
    // A pair the design bought is sealed; what went in stays in.
    if (slotRecessive(slot)){ return false; }
    geneSlots()[slot] = false;
    delete geneBreaks()[slot];
    bumpGeneCache();
    return slot;
}

// Take back any minor pair the strand is no longer paying for.
export function pruneStrand(){
    bumpGeneCache();
    let slots = geneSlots();
    let base = strandBase('minor');
    let from = base + (strandPairCount('minor') * genes.strand_slots);
    let to = base + strandSpan();
    let dropped = [];
    for (let i=from; i<to && i<slots.length; i++){
        if (!slots[i]){ continue; }
        if (slots[i].g){ dropped.push(slots[i].g); }
        slots[i] = false;
        delete geneBreaks()[i];
    }
    dropped.forEach(function(g){
        delete global.race[g];
        messageQueue(loc('arpa_gene_unslotted',[traitSkin('name',g)]),'danger',false,['progress']);
    });
    return dropped;
}

// Place each genus's feeder traits as matched major pairs.
function placeGenusPair(pair){
    // Nothing goes down twice.
    pair = pair.filter(function(t){ return traits[t] && geneSlotOf(t) === false; });
    if (pair.length === 0){ return false; }
    let slots = geneSlots();
    let base0 = strandBase('major');
    for (let p=0; p<majorPairCount(); p++){
        let l = base0 + p * genes.strand_slots, r = l + 1;
        if (pairBase(l) || slots[l] || slots[r]){ continue; }
        let base = geneBaseOf(pair[0]) || genes.gene_strand[0];
        setGeneSlot(l,pair[0],{ base: base });
        if (pair[1]){ setGeneSlot(r,pair[1],{ base: genes.gene_pairs[base] }); }
        return true;
    }
    // Nothing clean left, so the pair goes down wherever it fits rather than being dropped.
    pair.forEach(function(t){ placeTrait(t); });
    return false;
}

// Lay this run's traits out on a fresh strand.
export function layoutStrand(){
    bumpGeneCache();
    let slots = geneSlots();
    let breaks = geneBreaks();

    // Preserve existing slot contents while re-laying the strand.
    let carried = [];
    for (let i=0; i<slots.length; i++){
        if (geneSlotExtra(i)){ continue; }
        let s = slots[i];
        if (s && s.g && traits[s.g]){
            if (geneLike(s.g)){
                carried.push({ g: s.g, r: s.r || 1, b: breaks[i] || 0 });
            }
            else if (s.p){
                // Undo the cramped-slot penalty before re-laying, so it is never charged twice.
                global.race[s.g] = +((global.race[s.g] || 0) / genes.minor_slot_penalty).toFixed(6);
            }
        }
        slots[i] = false;
        delete breaks[i];
    }

    // The genera this run evolved from, primary first.
    let sp = global.race['species'] ? races[global.race.species] : false;
    let genera = [];
    if (sp){
        let list = sp.type === 'hybrid' && Array.isArray(sp.hybrid) ? sp.hybrid : [sp.type];
        let main = global.race['maintype'] && list.includes(global.race.maintype) ? global.race.maintype : false;
        genera = (main ? [main].concat(list.filter(function(g){ return g !== main; })) : list.slice())
            .filter(function(g){
                return genus_def[g] && genusFeeders(g).some(function(t){ return global.race.hasOwnProperty(t); });
            });
    }
    global.race['strandGenus'] = genera;

    let granted = strandGranted();
    let placed = {};

    genera.forEach(function(genus){
        let feeders = genusFeeders(genus).filter(function(t){
            return global.race.hasOwnProperty(t) && !granted[t];
        });
        // Two at a time: a pair holds two, and a genus with an odd count leaves its last one to open a pair of its own.
        for (let n=0; n<feeders.length; n+=genes.strand_slots){
            placeGenusPair(feeders.slice(n,n + genes.strand_slots));
        }
        feeders.forEach(function(t){ placed[t] = true; });
    });

    // Place mimicked traits in their own paired genus rungs.
    let mimicked = strandMimicTraits().filter(function(t){
        return global.race.hasOwnProperty(t) && !granted[t] && !placed[t];
    });
    for (let n=0; n<mimicked.length; n+=genes.strand_slots){
        placeGenusPair(mimicked.slice(n,n + genes.strand_slots));
    }
    mimicked.forEach(function(t){ placed[t] = true; });

    // The genus is down, so its properties can be worked out.
    syncGenusEmergent();

    // Then everything else the strand is meant to hold.
    let emergent = genusEmergent();
    let majors = Object.keys(global.race).filter(function(t){
        if (placed[t] || granted[t] || emergent[t] || traitPermanent(t)){ return false; }
        return traits[t] && (traits[t].type === 'major' || traits[t].type === 'genus');
    });

    // Honor a saved custom layout when its slots remain valid.
    let arranged = customArrangement();
    if (arranged){
        // In slot order, so a design's own pairing survives even where part of it cannot be honoured.
        majors.filter(function(t){ return arranged[t] !== undefined; })
            .sort(function(a,b){ return arranged[a] - arranged[b]; })
            .forEach(function(t){
                if (placeTrait(t,{ slot: arranged[t] }) !== false){ placed[t] = true; }
            });
        majors = majors.filter(function(t){ return !placed[t]; });
    }

    // Ordered so complements fall next to each other.
    let byBase = { A: [], T: [], C: [], G: [] }, loose = [];
    majors.forEach(function(t){
        let b = geneBaseOf(t);
        if (byBase[b]){ byBase[b].push(t); } else { loose.push(t); }
    });
    let order = [];
    [['A','T'],['C','G']].forEach(function(rung){
        let a = byBase[rung[0]], b = byBase[rung[1]];
        while (a.length > 0 || b.length > 0){
            if (a.length > 0){ order.push(a.shift()); }
            if (b.length > 0){ order.push(b.shift()); }
        }
    });
    order.concat(loose).forEach(function(t){ placeTrait(t); });

    // Minor genes last, into whatever the majors left behind.
    carried.forEach(function(c){
        let slot = placeTrait(c.g,{ rank: c.r });
        if (slot === false){ return; }
        let owed = Math.max(c.b,geneBreaksFor(c.r,slot));
        if (owed > 0){ geneBreaks()[slot] = owed; }
    });

    global.race['strandBuilt'] = genes.strand_version;
    syncGenes();
    return true;
}

// Migrate legacy gene layouts after races.js loads.
export function migrateStrand(){
    if (global.race['strandBuilt'] === genes.strand_version){ return false; }
    // Nothing to lay out until a species has been evolved into.
    if (!global.race['species'] || !races[global.race.species]){ return false; }
    // Powered was split, and Tireless carries what used to be its labor boost.
    if ((global.race['strandBuilt'] || 0) < genes.strand_split_powered
        && global.race['powered'] && !global.race['tireless']){
        global.race['tireless'] = global.race['powered'];
    }
    layoutStrand();
    return true;
}

// The genes this run could still be handed: not a special, not already slotted, and of use here.
function grantPool(){
    return geneRoster().filter(function(t){
        return !genes.gene_specials.includes(t) && geneSlotOf(t) === false && geneSuited(t);
    });
}

// A granted pair: two extra slots forming a rung of their own, bases complementary and both genes
// at the same rank. Returns the two genes, or false when the roster cannot fill both sides.
export function grantMinorTraitPair(rank){
    let pool = grantPool();
    let byBase = {};
    pool.forEach(function(t){
        let b = traits[t].base;
        if (!b){ return; }
        if (!byBase[b]){ byBase[b] = []; }
        byBase[b].push(t);
    });

    // Each rung is one base and its complement, counted once. Only those with something to put on
    // both sides are worth drawing from.
    let rungs = Object.keys(genes.gene_pairs).filter(function(b){
        let c = genes.gene_pairs[b];
        return b < c && byBase[b] && byBase[b].length > 0 && byBase[c] && byBase[c].length > 0;
    });
    if (rungs.length === 0){ return false; }

    let left = rungs[Math.floor(seededRandom(0,rungs.length))];
    let right = genes.gene_pairs[left];
    let pick = function(base){ return byBase[base][Math.floor(seededRandom(0,byBase[base].length))]; };
    let pair = [{ b: left, g: pick(left) },{ b: right, g: pick(right) }];

    let slots = geneSlots();
    let at = Math.max(1,rank || 1);
    pair.forEach(function(half){
        geneTempUnlocks()[half.g] = 1;
        slots.push({ g: half.g, r: at, x: true, b: half.b });
        bumpGeneCache();
        let free = slots.length - 1;
        let owed = geneBreaksFor(at,free);
        if (owed > 0){
            geneBreaks()[free] = Math.max(geneBreaks()[free] || 0, owed);
        }
    });
    syncGenes();
    return pair.map(function(half){ return half.g; });
}

export function grantRandomMinorTrait(rank,extra){
    // A granted slot arrives as a matched pair rather than a lone gene.
    if (extra){ return grantMinorTraitPair(rank); }

    let pool = grantPool();
    if (pool.length === 0){ return false; }

    let gene = pool[Math.floor(seededRandom(0,pool.length))];
    let at = Math.max(1,rank || 1);
    let free = placeTrait(gene,{ rank: at });
    if (free === false){ return false; }
    geneTempUnlocks()[gene] = 1;
    // Skip unnecessary limit breaks for genes already in major slots.
    let owed = geneBreaksFor(at,free);
    if (owed > 0){
        geneBreaks()[free] = Math.max(geneBreaks()[free] || 0, owed);
    }
    syncGenes();
    return gene;
}

// Return the first empty minor base pair.
function freeMinorRung(){
    let slots = geneSlots();
    let base = strandBase('minor');
    for (let p=0; p<minorPairCount(); p++){
        let l = base + p * genes.strand_slots, r = l + 1;
        if (!slots[l] && !slots[r] && slotActive(l) && slotActive(r)){ return l; }
    }
    return false;
}

// Grant a matched minor-gene pair on an empty rung.
function grantEvolvePair(rank){
    let at = freeMinorRung();
    if (at === false){ return false; }

    let byBase = {};
    grantPool().forEach(function(t){
        let b = geneBaseOf(t);
        if (!b){ return; }
        if (!byBase[b]){ byBase[b] = []; }
        byBase[b].push(t);
    });
    // Only an orientation with something to put on both halves is worth drawing.
    let bases = Object.keys(genes.gene_pairs).filter(function(b){
        let c = genes.gene_pairs[b];
        return byBase[b] && byBase[b].length > 0 && byBase[c] && byBase[c].length > 0;
    });
    if (bases.length === 0){ return false; }

    let left = bases[Math.floor(seededRandom(0,bases.length))];
    let pair = [left,genes.gene_pairs[left]].map(function(b){
        return byBase[b][Math.floor(seededRandom(0,byBase[b].length))];
    });

    pair.forEach(function(gene,n){
        let slot = at + n;
        geneTempUnlocks()[gene] = 1;
        setGeneSlot(slot,gene,{ rank: rank });
        let owed = geneBreaksFor(rank,slot);
        if (owed > 0){ geneBreaks()[slot] = Math.max(geneBreaks()[slot] || 0, owed); }
    });
    return pair;
}

// Grant the Evolve line's starting minor-gene pairs.
export function grantEvolveGenes(){
    let have = global.genes['evolve'] || 0;
    let granted = 0;
    genes.strand_evolve_grants.forEach(function(rank){
        if (have < rank){ return; }
        if (grantEvolvePair(genes.strand_grant_rank)){ granted++; }
    });
    if (granted > 0){ syncGenes(); }
    return granted;
}

// What one mutation is worth, before the Synthesis and Creator multipliers are applied on top.
export function mutationGenes(mutation){
    let m = mutation > 0 ? mutation : 1;
    return Math.round(genes.gene_mutation_scale * (m ** 3));
}

export function randomMinorTrait(){
    let pool = geneRoster().filter(function(t){
        return !genes.gene_specials.includes(t) && !geneUnlocked(t) && geneSuited(t);
    });
    if (pool.length === 0){ return false; }
    let gene = pool[Math.floor(seededRandom(0,pool.length))];
    geneTempUnlocks()[gene] = 1;
    return gene;
}

function checkPurgatory(s,t,dv){
    if (global.race.purgatory[s].hasOwnProperty(t)){
        global[s][t] = global.race.purgatory[s][t];
        delete global.race.purgatory[s][t];
    }
    else if (dv){
        global[s][t] = dv;
    }
}

export function checkAltPurgatory(s,t,a,dv){
    if (global.race.purgatory[s].hasOwnProperty(t)){
        global[s][t] = global.race.purgatory[s][t];
        delete global.race.purgatory[s][t];
    }
    else if (global.race.purgatory[s].hasOwnProperty(a)) {
        global[s][t] = global.race.purgatory[s][a];
        delete global.race.purgatory[s][a];
    }
    else if (dv){
        global[s][t] = dv;
    }
}

function setPurgatory(s,t){
    if (global[s].hasOwnProperty(t)){
        global.race.purgatory[s][t] = global[s][t];
        delete global[s][t];
    }
    // Remove tech from research queue
    if (s === 'tech'){
        if (global.tech['r_queue'] && global.r_queue.display){
            for (let i=0; i<global.r_queue.queue.length; i++){
                const struct = global.r_queue.queue[i];
                const t_action = actions[struct.action][struct.type];
                if (t_action['grant'] && t_action.grant[0] === t){
                    global.r_queue.queue.splice(i,1);
                    clearPopper(`rq${t_action.id}`);
                }
            }
        }
    }
    // Remove structures from building queue
    else {
        if (global.tech['queue'] && global.queue.display){
            for (let i=0; i<global.queue.queue.length; i++){
                const struct = global.queue.queue[i];
                if (struct.action === s && struct.type === t){
                    global.queue.queue.splice(idx,1);
                    // Remove info dialog (different code for city and space)
                    if (spaceSectors.includes(struct.action)){
                        for (const region in actions[struct.action]) {
                            if (actions[struct.action][region][struct.type]){
                                const c_action = actions[struct.action][region][struct.type];
                                clearPopper(`q${c_action.id}${idx}`);
                                break;
                            }
                        }
                    }
                    else {
                        const c_action = actions[struct.action][struct.type];
                        clearPopper(`q${c_action.id}${idx}`);
                    }
                }
            }
        }
    }
}

function getPurgatory(s,t){
    if (global.race.purgatory[s].hasOwnProperty(t)){
        return global.race.purgatory[s][t];
    }
}

function purgeLumber(){
    releaseResource('Plywood');
    if (global.race['iceage']){
        return;
    }
    releaseResource('Lumber');
    removeFromQueue(['city-graveyard', 'city-lumber_yard', 'city-sawmill']);
    removeFromRQueue(['reclaimer', 'axe', 'saw']);
    setPurgatory('city','sawmill');
    setPurgatory('city','graveyard');
    setPurgatory('city','lumber_yard');
    setPurgatory('tech','axe');
    setPurgatory('tech','reclaimer');
    setPurgatory('tech','saw');
    global.civic.lumberjack.display = false;
    global.civic.lumberjack.workers = 0;
    global.civic.lumberjack.assigned = 0;
    if (global.civic.d_job === 'lumberjack') {
        global.civic.d_job = global.race['carnivore'] || global.race['soul_eater'] ? 'hunter' : 'unemployed';
    }
    if (global.race['casting']){
        global.race.casting.total -= global.race.casting.lumberjack;
        global.race.casting.lumberjack = 0;
        active_rituals.lumberjack = 0;
        defineIndustry();
    }
    if (global.city['s_alter']) {
        global.city.s_alter.harvest = 0;
    }
}

function releaseResource(res) {
    global.resource[res].display = false;
    if (global.race['alchemy'] && global.race.alchemy.hasOwnProperty(res)){
        global.resource.Mana.diff += global.race.alchemy[res];
        global.race.alchemy[res] = 0;
    }
    if (global.interstellar['mass_ejector'] && global.interstellar.mass_ejector.hasOwnProperty(res)){
        global.interstellar.mass_ejector.total -= global.interstellar.mass_ejector[res];
        global.interstellar.mass_ejector[res] = 0;
    }
    if (global.city['nanite_factory'] && global.city.nanite_factory.hasOwnProperty(res)){
        global.city.nanite_factory[res] = 0;
    }
    if (global.portal['transport'] && global.portal.transport.cargo.hasOwnProperty(res)){
        global.portal.transport.cargo.used -= global.portal.transport.cargo[res];
        global.portal.transport.cargo[res] = 0;
    }
    if (global.tech['foundry'] && global.city.foundry.hasOwnProperty(res)){
        global.civic.craftsman.workers -= global.city.foundry[res];
        global.city.foundry.crafting -= global.city.foundry[res];
        global.city.foundry[res] = 0;
        // This material is being taken away entirely, so anyone banked against it is not coming back.
        if (global.city.foundry.hasOwnProperty('hold')){
            delete global.city.foundry.hold[res];
        }
        loadFoundry();
    }
    if (global.resource[res].hasOwnProperty('trade')) {
        global.city.market.trade -= Math.abs(global.resource[res].trade);
        global.resource[res].trade = 0;
    }
    global.resource.Crates.amount += global.resource[res].crates;
    global.resource[res].crates = 0;
    global.resource.Containers.amount += global.resource[res].containers;
    global.resource[res].containers = 0;
}

function adjustFood() {
    let farmersEnabled = checkTechQualifications(actions.tech.agriculture);
    let huntingEnabled = checkTechQualifications(actions.tech.smokehouse);
    let lumberEnabled = checkTechQualifications(actions.tech.reclaimer) || checkTechQualifications(actions.tech.stone_axe);
    let altLodge = checkTechQualifications(actions.tech.alt_lodge);
    let altMill = checkTechQualifications(actions.tech.wind_plant);
    let disabledCity = [], disabledTech = [];

    if (!global.race['artifical']) {
        ['agriculture','farm','hunting','s_lodge','wind_plant','compost','soul_eater'].forEach(function (tech){
            setPurgatory('tech',tech);
        });
        ['silo','farm','mill','windmill','smokehouse','lodge','compost','soul_well'].forEach(function (city){
            setPurgatory('city',city);
        });

        if (altLodge) {
            checkPurgatory('tech','s_lodge');
            let minAltLodge = (getPurgatory('tech','farm') >= 1 || getPurgatory('tech','hunting') >= 2) ? 1 : 0;
            if (minAltLodge > 0 && (!global.tech['s_lodge'] || global.tech['s_lodge'] < minAltLodge)) {
                global.tech['s_lodge'] = minAltLodge;
            }
            if (global.tech['s_lodge'] >= 1) {
                checkAltPurgatory('city','lodge','farm',{ count: 0 });
            }
        }

        if (huntingEnabled) {
            checkPurgatory('tech','hunting');
            let minHunting = (getPurgatory('tech','farm') >= 1 || getPurgatory('tech','s_lodge') >= 1) ? 2
                            : getPurgatory('tech','agriculture') >= 3 ? 1 : 0;
            if (minHunting > 0 && (!global.tech['hunting'] || global.tech['hunting'] < minHunting)) {
                global.tech['hunting'] = minHunting;
            }
            if (global.tech['hunting'] >= 1) {
                checkAltPurgatory('city','smokehouse','silo',{ count: 0 });
            }
            if (global.tech['hunting'] >= 2 && !altLodge) {
                checkAltPurgatory('city','lodge','farm',{ count: 0 });
            }
        }
        else {
            disabledTech.push('hunting');
            disabledCity.push('city-smokehouse');
            if (!altLodge) {
                disabledTech.push('city-lodge');
            }
        }

        if (farmersEnabled) {
            checkPurgatory('tech','farm');
            let minFarm = (getPurgatory('tech','hunting') >= 2 || getPurgatory('tech','s_lodge') >= 1) ? 1 : 0;
            if (minFarm > 0 && (!global.tech['farm'] || global.tech['farm'] < minFarm)) {
                global.tech['farm'] = minFarm;
            }
            checkPurgatory('tech','agriculture');
            let minAgriculture = getPurgatory('tech','hunting') >= 1 ? 3 :
                                 getPurgatory('tech','s_lodge') >= 1 ? 1 : 0;
            if (minAgriculture > 0 && (!global.tech['agriculture'] || global.tech['agriculture'] < minAgriculture)) {
                global.tech['agriculture'] = minAgriculture;
            }
            if (global.tech['agriculture'] >= 1) {
                checkAltPurgatory('city','farm','lodge',{ count: 0 });
            }
            if (global.tech['agriculture'] >= 3) {
                checkAltPurgatory('city','silo','smokehouse',{ count: 0 });
            }
            if (global.tech['agriculture'] >= 4 && !altMill) {
                checkAltPurgatory('city','mill','windmill',{ count: 0, on: 0 });
            }
        }
        else {
            disabledTech.push('agriculture', 'farm');
            disabledCity.push('city-farm', 'city-silo', 'city-mill');
        }

        if (global.race['soul_eater']) {
            checkPurgatory('tech','soul_eater');
            checkPurgatory('city','soul_well');
        }
        else {
            disabledCity.push('city-soul_well');
            disabledTech.push('soul_eater');
        }

        if (global.race['detritivore']) {
            checkPurgatory('tech','compost');
            checkPurgatory('city','compost');
        }
        else {
            disabledTech.push('compost');
            disabledCity.push('city-compost');
        }

        if (altMill) {
            checkPurgatory('tech','wind_plant');
            if (global.tech['wind_plant'] >= 1) {
                checkAltPurgatory('city','windmill','mill',{ count: 0, on: 0 });
            }
        }
        else {
            disabledTech.push('wind_plant');
            disabledCity.push('city-windmill');
            delete power_generated[loc('city_mill_title2')];
        }
    }

    let jobEnabled = [], jobDisabled = [];
    if (!global.race['orbit_decayed'] && farmersEnabled && global.tech['agriculture'] >= 1 && global.city['farm'].count > 0) {
        jobEnabled.push('farmer');
    }
    else {
        jobDisabled.push('farmer');
    }
    if ((global.race['carnivore'] && !global.race['herbivore']) || global.race['soul_eater'] || global.race['unfathomable']) {
        jobEnabled.push('hunter');
        jobDisabled.push('unemployed');
    }
    else {
        jobDisabled.push('hunter');
        jobEnabled.push('unemployed');
    }
    if (!global.race['orbit_decayed'] && lumberEnabled) {
        jobEnabled.push('lumberjack');
    }
    else {
        jobDisabled.push('lumberjack');
    }

    jobEnabled.forEach(function(job) {
        if (!global.civic[job].display) {
            global.civic[job].workers = 0;
            global.civic[job].display = true;
        }
    });
    jobDisabled.forEach(function(job) {
        if (global.civic[job].display) {
            if (global.civic.d_job === job) {
                global.civic.d_job = jobEnabled[0];
            }
            global.civic[jobEnabled[0]].workers += global.civic[job].workers;
            global.civic[job].workers = 0;
            global.civic[job].assigned = 0;
            global.civic[job].display = false;
        }
    });

    if (global.race['casting']){
        if (!farmersEnabled) {
            global.race.casting.total -= global.race.casting.farmer;
            global.race.casting.farmer = 0;
            active_rituals.farmer = 0;
        }
        defineIndustry();
    }

    removeFromQueue(disabledCity);
    removeFromRQueue(disabledTech);
    setResourceName('Food');
}

export function traitCostMod(t,val){
    if (!global.race[t]){
        return val;
    }
    switch (t){
        case 'stubborn':
        {
            val *= 1 + (traits.stubborn.vars()[0] / 100);
            break;
        }
        case 'untrustworthy':
        {
            val *= 1 + (traits.untrustworthy.vars()[0] / 100);
            break;
        }
    }
    return Math.round(val);
}

export function cleanAddTrait(trait){
    switch (trait){
        case 'high_pop':
            global.resource[global.race.species].amount = Math.round(global.resource[global.race.species].amount * traits.high_pop.vars()[0]);
            if (global.civic.hasOwnProperty('garrison')) {
                global.civic.garrison.workers = Math.round(global.civic.garrison.workers * traits.high_pop.vars()[0]);
            }
            break;
        case 'kindling_kindred':
            if (global.race['smoldering']){
                break;
            }
            purgeLumber();
            setResourceName('Useless');
            break;
        case 'smoldering':
            global.resource.Chrysotile.display = true;
            if (global.race['kindling_kindred']){
                break;
            }
            purgeLumber();
            setResourceName('Useless');
            break;
        case 'iron_wood':
            if (global.race['smoldering']){
                break;
            }
            releaseResource('Plywood');
            break;
        case 'forge':
            defineIndustry();
            break;
        case 'soul_eater':
        case 'detritivore':
        case 'carnivore':
        case 'herbivore':
            adjustFood();
            break;
        case 'unfathomable':
            adjustFood();
            if (!global.city.hasOwnProperty('surfaceDwellers')){
                global.city['surfaceDwellers'] = [];
            }
            while (global.city.surfaceDwellers.length < traits.unfathomable.vars()[0]){
                global.city.surfaceDwellers.push(basicRace(global.city.surfaceDwellers));
            }
            if (global.city.surfaceDwellers.length > traits.unfathomable.vars()[0]){
                global.city.surfaceDwellers.length = traits.unfathomable.vars()[0];
            }
            if (global.race['psychic']){
                renderPsychicPowers();
            }
            break;
        case 'flier':
            setResourceName('Stone');
            setResourceName('Brick');
            defineGovernor(); // Rename resource in storage balance config
            global.resource.Cement.display = false;
            global.civic.cement_worker.display = false;
            global.civic.cement_worker.workers = 0;
            global.civic.cement_worker.assigned = 0;
            setPurgatory('tech','cement');
            setPurgatory('city','cement_plant');
            setPurgatory('eden','eden_cement');
            break;
        case 'sappy':
            if (global.civic.d_job === 'quarry_worker'){
                global.civic.d_job = global.race['carnivore'] || global.race['soul_eater'] ? 'hunter' : 'unemployed';
            }
            global.civic.quarry_worker.display = false;
            global.civic.quarry_worker.workers = 0;
            global.civic.quarry_worker.assigned = 0;
            setResourceName('Stone');
            defineGovernor(); // Rename resource in storage balance config
            setPurgatory('tech','hammer');
            setPurgatory('city','rock_quarry');
            break;
        case 'apex_predator':
            removeFromRQueue(['armor']);
            setPurgatory('tech','armor');
            break;
        case 'environmentalist':
            delete power_generated[loc('city_coal_power')];
            delete power_generated[loc('city_mana_engine')];
            delete power_generated[loc('city_oil_power')];
            break;
        case 'terrifying':
            Object.keys(global.resource).forEach(function (res){
                if (global.resource[res].hasOwnProperty('trade')){
                    global.resource[res].trade = 0;
                }
            });
            global.city.market.active = false;
            if (!global.galaxy?.freighter?.count){
                global.settings.showMarket = false;
                if (global.settings.marketTabs === 0) {
                    global.settings.marketTabs = 1;
                }
            }
            removeFromQueue(['city-trade']);
            setPurgatory(['undeground-trade']);
            removeFromRQueue(['trade']);
            setPurgatory('tech','trade');
            setPurgatory('city','trade');
            setPurgatory('underground','trade');
            break;
        case 'slaver':
            checkPurgatory('tech','slaves');
            if (global.tech['slaves'] >= 1) {
                checkPurgatory('city','slave_pen',{ count: 0 });
                checkPurgatory('underground','slave_pen',{ count: 0 });
                if (global.city['slave_pen'].count > 0 && !global.race['orbit_decayed']) {
                    global.resource.Slave.display = true;
                }
                if (global.tech['slaves'] >= 2) {
                    defineGovernor();
                }
            }
            break;
        case 'cannibalize':
            checkPurgatory('tech','sacrifice');
            if (global.tech['mining']) {
                initStruct(actions.city.s_alter);
                defineGovernor();
            }
            break;
        case 'magnificent':
            if (global.tech['theology'] >= 2) {
                checkPurgatory('city','shrine',actions.city.shrine.struct().d);
                checkPurgatory('underground','shrine', { count: 0 });
            }
            break;
        case 'unified':
            global.tech['world_control'] = 1;
            global.tech['unify'] = 2;
            buildGarrison($('#garrison'),true);
            buildGarrison($('#c_garrison'),false);
            for (let i=0; i<3; i++){
                if (global.civic.foreign[`gov${i}`].occ){
                    let occ_amount = jobStack(global.civic.govern.type === 'federation' ? 15 : 20);
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
            removeTask('combo_spy');
            defineGovernor();
            break;
        case 'noble':
            if (global.civic.taxes.tax_rate < 10) {
                global.civic.taxes.tax_rate = 10;
            }
            else if (global.civic.taxes.tax_rate > 20) {
                global.civic.taxes.tax_rate = 20;
            }
            break;
        case 'toxic':
            if (global.race.species === 'troll' && global.tech['science'] && global.tech['science'] >= 8){
                unlockAchieve('godwin');
            }
            break;
        case 'thalassophobia':
            removeFromQueue(['city-wharf']);
            removeFromRQueue(['wharf']);
            setPurgatory('city','wharf');
            break;
        case 'hooved':
            global.resource.Horseshoe.display = true;
            if (!global.race.hasOwnProperty('shoecnt')){
                global.race['shoecnt'] = 0;
            }
            defineGovernor();
            break;
        case 'slow':
            writeSave();
            if (webWorker.w){
                gameLoop('stop');
                gameLoop('start');
            }
            else {
                window.location.reload();
            }
            break;
        case 'hyper':
            writeSave();
            if (webWorker.w){
                gameLoop('stop');
                gameLoop('start');
            }
            else {
                window.location.reload();
            }
            break;
        case 'calm':
            if (global.tech['primitive'] >= 3) {
                checkPurgatory('city','meditation',actions.city.meditation.struct().d);
                checkPurgatory('underground','meditation',{ count: 0 });
                if (!global.race['orbit_decayed']){
                    global.resource.Zen.display = true;
                }
            }
            break;
        case 'blood_thirst':
            global.race['blood_thirst_count'] = 1;
            break;
        case 'deconstructor':
            global.resource.Nanite.display = true;
            checkPurgatory('city','nanite_factory',{ count: 1,
                Lumber: 0, Chrysotile: 0, Stone: 0, Crystal: 0, 
                Furs: 0, Copper: 0, Iron: 0, Aluminium: 0,
                Cement: 0, Coal: 0, Oil: 0, Uranium: 0,
                Steel: 0, Titanium: 0, Alloy: 0, Polymer: 0,
                Iridium: 0, Helium_3: 0, Water: 0, Deuterium: 0,
                Neutronium: 0, Adamantite: 0, Bolognium: 0, Orichalcum: 0,
            });
            checkPurgatory('underground','nanite_factory',{ count: 1});
            break;
        case 'shapeshifter':
            shapeShift(false,true);
            break;
        case 'imitation':
            setImitation(true);
            if(global.race['shapeshifter']){
                shapeShift(false, true, false); //update mimic options
            }
            break;
        case 'evil':
            setResourceName('Lumber');
            setResourceName('Furs');
            setResourceName('Plywood');
            break;
        case 'psychic':
            if (global.tech['psychic']){
                global.resource.Energy.display = true;
                global.settings.showPsychic = true;
            }
            break;
        case 'wish':
            if (global.tech['wish']){
                global.settings.showWish = true;
                if (global.race['wishStats'] && global.race.wishStats.strong && !global.race['strong']){
                    global.race['strong'] = 0.25;
                    cleanAddTrait('strong')
                }
            }
            break;
        case 'ocular_power':
            global.settings.showWish = true;
            global.race['ocularPowerConfig'] = {
                d: false, p: false, w: false, t: false, f: false, c: false, ds: 0
            };
            renderSupernatural();
            break;
        case 'deep_power':
            global.settings.showWish = true;
            global.race['deepPowerConfig'] = {
                global: 50,
                crafting: 50,
                trade: 20,
                combat: 0
            }
            renderSupernatural();
            break;
        case 'ooze':
            if (!global.tech['high_tech'] && global.race.species !== 'custom' && (global.race.species !== 'sludge' || global.race.species !== 'ultra_sludge')){
                global.race['gross_enabled'] = 1;
            }
            calc_mastery(true);
            break;
        default:
            break;
    }
}

export function cleanRemoveTrait(trait,rank){
    switch (trait){
        case 'high_pop':
            global.resource[global.race.species].amount = Math.round(global.resource[global.race.species].amount / traits.high_pop.vars(rank)[0]);
            if (global.civic.hasOwnProperty('garrison')) {
                global.civic.garrison.workers = Math.round(global.civic.garrison.workers / traits.high_pop.vars(rank)[0]);
            }
            break;
        case 'kindling_kindred':
            if (global.race['smoldering']){
                break;
            }
            global.resource.Lumber.display = true;
            if (global.tech['foundry']){
                global.resource.Plywood.display = true;
            }
            if (global.race['casting']){
                defineIndustry();
            }
            checkPurgatory('city','sawmill');
            checkPurgatory('city','graveyard');
            checkPurgatory('city','lumber_yard');
            checkPurgatory('tech','axe');
            checkPurgatory('tech','reclaimer');
            checkPurgatory('tech','saw');
            if ((global.tech['axe'] || global.tech['reclaimer']) && !global.race['orbit_decayed']){
                global.civic.lumberjack.display = true;
            }
            setResourceName('Useless');
            break;
        case 'smoldering':
            releaseResource('Chrysotile');
            if (global.race['kindling_kindred']){
                break;
            }
            if (global.tech['foundry']){
                global.resource.Plywood.display = true;
            }
            if (global.race['iceage'] && !global.surface['wooductter']){
                break;
            }
            global.resource.Lumber.display = true;
            if (global.race['casting']){
                defineIndustry();
            }
            checkPurgatory('city','sawmill');
            checkPurgatory('city','graveyard');
            checkPurgatory('city','lumber_yard');
            checkPurgatory('tech','axe');
            checkPurgatory('tech','reclaimer');
            checkPurgatory('tech','saw');
            if ((global.tech['axe'] || global.tech['reclaimer'] || global.surface['wooductter']) && !global.race['orbit_decayed']){
                global.civic.lumberjack.display = true;
            }
            setResourceName('Useless');
            break;
        case 'iron_wood':
            if (global.tech['foundry'] && !global.race['smoldering'] && (!global.race['iceage'] || global.surface.woodcutter)){
                global.resource.Plywood.display = true;
            }
            break;
        case 'forge':
            defineIndustry();
            break;
        case 'soul_eater':
        case 'detritivore':
        case 'carnivore':
        case 'herbivore':
        case 'unfathomable':
            adjustFood();
            if (global.race['psychic']){
                renderPsychicPowers();
            }
            break;
        case 'flier':
            setResourceName('Stone');
            setResourceName('Brick');
            defineGovernor(); // Rename resource in storage balance config
            checkPurgatory('tech','cement');
            if (global.tech['cement']){
                checkPurgatory('city','cement_plant');
                checkPurgatory('eden','eden_cement');
                global.resource.Cement.display = true;
                global.civic.cement_worker.display = true;
            }
            break;
        case 'sappy':
            setResourceName('Stone');
            defineGovernor(); // Rename resource in storage balance config
            checkPurgatory('tech','hammer');
            if (global.tech['mining'] >= 1) {
                checkPurgatory('city','rock_quarry',{ count: 0, asbestos: 0 });
                if ((global.city['rock_quarry'] && global.city.rock_quarry.count > 0) || global.race['lone_survivor']) {
                    global.civic.quarry_worker.display = true;
                }
            }
            break;
        case 'apex_predator':
            checkPurgatory('tech','armor');
            break;
        case 'environmentalist':
            delete power_generated[loc('city_hydro_power')];
            delete power_generated[loc('city_wind_power')];
            delete power_generated[loc('underground_thermal_power')];
            break;
        case 'terrifying':
            checkPurgatory('tech','trade');
            checkPurgatory('city','trade');
            if (global.tech['trade']){
                global.settings.showMarket = true;
                global.city.market.active = true;
                drawResourceTab('market');
            }
            break;
        case 'slaver':
            removeFromQueue(['city-slave_pen']);
            removeFromQueue(['underground-slave_pen']);
            removeFromRQueue(['slaves']);
            setPurgatory('city','slave_pen');
            setPurgatory('underground', 'slave_pen');
            setPurgatory('tech','slaves');
            global.resource.Slave.amount = 0;
            global.resource.Slave.max = 0;
            global.resource.Slave.display = false;
            removeTask('slave');
            defineGovernor();
            break;
        case 'cannibalize':
            removeFromQueue(['city-s_alter']);
            removeFromRQueue(['sacrifice']);
            setPurgatory('tech','sacrifice');
            delete global.city['s_alter'];
            removeTask('sacrifice');
            defineGovernor();
            break;
        case 'magnificent':
            removeFromQueue(['city-shrine']);
            removeFromQueue(['surface-shrine']);
            setPurgatory('city','shrine');
            setPurgatory('surface','shrine');
            break;
        case 'thalassophobia':
            if (global.tech['wharf']){
                checkPurgatory('city','wharf',{ count: 0 });
            }
            break;
        case 'hooved':
            removeFromQueue(['city-horseshoe', 'space-horseshoe']);
            global.resource.Horseshoe.display = false;
            removeTask('horseshoe');
            defineGovernor();
            break;
        case 'slow':
            writeSave();
            if (webWorker.w){
                gameLoop('stop');
                gameLoop('start');
            }
            else {
                window.location.reload();
            }
            break;
        case 'hyper':
            writeSave();
            if (webWorker.w){
                gameLoop('stop');
                gameLoop('start');
            }
            else {
                window.location.reload();
            }
            break;
        case 'calm':
            removeFromQueue(['city-meditation']);
            removeFromQueue(['underground-meditation']);
            global.resource.Zen.display = false;
            setPurgatory('city','meditation');
            setPurgatory('underground','meditation');
            break;
        case 'blood_thirst':
            delete global.race['blood_thirst_count'];
            break;
        case 'deconstructor':
            removeFromQueue(['city-nanite_factory']);
            removeFromQueue(['underground-nanite_factory']);
            global.resource.Nanite.display = false;
            setPurgatory('city','nanite_factory');
            setPurgatory('underground','nanite_factory');
            break;
        case 'shapeshifter':
            clearElement($('#sshifter'));
            shapeShift();
            break;
        case 'imitation':
            if (global.race['iTraits']){
                Object.keys(global.race.iTraits).forEach(function (t){
                    if (t !== 'imitation'){
                        let base = global.race.inactiveTraits[t] ? global.race.inactiveTraits : global.race;
                        if (global.race.iTraits[t] === 0){
                            let rank = base[t];
                            delete base[t];
                            cleanRemoveTrait(t,rank);
                        }
                        else {
                            base[t] = global.race.iTraits[t];
                        }
                    }
                });
                delete global.race['iTraits'];
                if (global.race['shapeshifter']){
                    shapeShift(false, true, false); //update mimic options
                }
                combineTraits();
            }
            break;
        case 'evil':
            setResourceName('Lumber');
            setResourceName('Furs');
            setResourceName('Plywood');
            break;
        case 'psychic':
            global.resource.Energy.display = false;
            global.settings.showPsychic = false;
            break;
        case 'wish':
            if (!global.race['ocular_power'] && !global.race['deep_power']){
                global.settings.showWish = false;
            }
            if (global.race['wishStats'] && global.race.wishStats.strong){
                delete global.race['strong'];
                cleanRemoveTrait('strong')
            }
            break;
        case 'ocular_power':
            if (!global.tech['wish'] && !global.race['deep_power']){
                global.settings.showWish = false;
            }
            break;
        case 'deep_power':
            if (!global.tech['wish'] && !global.race['ocular_power']){
                global.settings.showWish = false;
            }
            break;
        case 'ooze':
            delete global.race['gross_enabled'];
            calc_mastery(true);
            break;
        default:
            break;
    }
}

export function setImitation(mod){
    if (global.race['imitation'] && global.race['srace']){
        if (!global.race['iTraits']){
            global.race['iTraits'] = {};
        }
        if (global.race['shapeshifter']){
            if((races[global.race['srace']].type === 'hybrid' && races[global.race['srace']].hybrid.includes(global.race['ss_genus'])) ||
                global.race['ss_genus'] === races[global.race['srace']].type){
                shapeShift('none', true, true);
            }
        }

        Object.keys(global.race.inactiveTraits).forEach(function (trait){
            global.race[trait] = global.race.inactiveTraits[trait];
        })
        global.race.inactiveTraits = {};

        let i_traits = [];
        if(races[global.race['srace']].type === 'hybrid'){
            races[global.race['srace']].hybrid.forEach(function(genus) {
                Object.keys(genus_def[genus].traits).forEach(function (trait) {
                    if (!global.race[trait]){
                        i_traits.push(trait);
                    }
                });
            })
        }
        else {
            Object.keys(genus_def[races[global.race['srace']].type].traits).forEach(function (trait) {
                if (!global.race[trait]){
                    i_traits.push(trait);
                }
            });
        }
        if (['custom','hybrid'].includes(global.race['srace'])){
            let list = [races[global.race['srace']].fanaticism,'evil'];
            Object.keys(races[global.race['srace']].traits).forEach(function (trait) {
                if (traits[trait].val < traits[list[1]].val){
                    list[1] = trait;
                }
            });
            i_traits.push(...list);
        }
        else {
            i_traits.push(...Object.keys(races[global.race['srace']].traits));
        }

        for (let trait of i_traits) {
            if (!['evil','imitation'].includes(trait)){
                let set = global.race[trait] ? false : true;
                if (!global.race.iTraits.hasOwnProperty(trait)) {
                    global.race.iTraits[trait] = global.race[trait] || 0;
                }
                let forced = global.race.iTraits[trait] ? false : true;
                let rank = traits[trait].val < 0 ? traits.imitation.vars()[1] : traits.imitation.vars()[0];
                setTraitRank(trait,{ set: rank, force: forced });
                if (mod && set){ cleanAddTrait(trait); }
            }
        }
        combineTraits();
    }
}

export function shapeShift(genus,setup,forceClean){
    let shifted = global.race.hasOwnProperty('ss_traits') ? global.race.ss_traits : [];

    Object.keys(global.race.inactiveTraits).forEach(function (trait){
        global.race[trait] = global.race.inactiveTraits[trait];
    })
    global.race.inactiveTraits = {};

    if (!setup || forceClean){
        shifted.forEach(function(trait){
            let rank = global.race[trait];
            delete global.race[trait];
            cleanRemoveTrait(trait,rank);
        });
        shifted = [];
    }

    if (genus){
        if (genus !== 'none'){
            Object.keys(genus_def[genus].traits).forEach(function (trait) {
                if (!global.race[trait] && trait !== 'high_pop' && (!global.race['iceage'] || trait !== 'sappy')){
                    if (traits[trait].val >= 0){
                        global.race[trait] = traits.shapeshifter.vars()[0];
                    }
                    else {
                        global.race[trait] = traits.shapeshifter.vars()[1];
                    }
                    cleanAddTrait(trait);
                    shifted.push(trait);
                }
            });
        }
        global.race['ss_genus'] = genus;
    }

    if (setup){
        clearElement($('#sshifter'));
        global.race['ss_genus'] = global.race.hasOwnProperty('ss_genus') ? global.race.ss_genus : 'none';

        let drop = ``;
        const imitation =  global.race['imitation'] ? (races[global.race['srace']].type === 'hybrid' ? races[global.race['srace']].hybrid : [races[global.race['srace']].type]) : [];
        const base = races[global.race.species].type === 'hybrid' ? races[global.race.species].hybrid : [races[global.race.species].type];
        Object.keys(genus_def).forEach(function (gen) {
            if(!['synthetic', 'eldritch', 'hybrid', ...base, ...imitation].includes(gen) && global.stats.achieve[`genus_${gen}`] && global.stats.achieve[`genus_${gen}`].l > 0){
                drop += `<b-dropdown-item v-on:click="setShape('${gen}')">{{ genus('${gen}') }}</b-dropdown-item>`;
            }
        });

        $('#sshifter').append(
            `<span>${loc(`trait_shapeshifter_name`)}</span>: <b-dropdown hoverable scrollable>
            <template #trigger>
            <button class="button is-primary">
                <span>{{ genus(ss_genus) }}</span>
            </button>
            </template>
            <b-dropdown-item v-on:click="setShape('none')">{{ genus('none') }}</b-dropdown-item>${drop}
        </b-dropdown>`);

        vBind({
            el: `#sshifter`,
            data: global.race,
            methods: {
                setShape(s){
                    shapeShift(s);
                },
                genus(g){
                    return loc(`genelab_genus_${g}`);
                }
            }
        });
    }

    global.race['ss_traits'] = shifted;
    combineTraits();
    if(genus || !setup || forceClean){
        // Rebuild the strand after changing mimicked traits.
        bumpGeneCache();
        if (global.race['strandBuilt']){ layoutStrand(); }
        //redraws for mimic heat or avian removing buildings or techs
        arpa('Genetics');
        drawCity();
        renderEdenic();
        drawTech();
    }
}

export function combineTraits(){

    Object.keys(global.race.inactiveTraits).forEach(function (trait){
        global.race[trait] = global.race.inactiveTraits[trait];
    })
    global.race.inactiveTraits = {};

    if(global.race['herbivore'] && global.race['carnivore']){ //herbivore and carnivore found. Add forager
        let rank = 1

        global.race.inactiveTraits['herbivore'] = global.race['herbivore'];
        global.race.inactiveTraits['carnivore'] = global.race['carnivore'];
        delete global.race['herbivore'];
        delete global.race['carnivore'];
        if(global.race['forager'] !== rank){
            setTraitRank('forager',{ set: rank, force:true});
            cleanRemoveTrait('carnivore');
            cleanRemoveTrait('herbivore');
            cleanAddTrait('forager');
        }
    }
    else if(global.race['forager']){
        delete global.race['forager'];
        cleanRemoveTrait('forager');
    }
}

// Interpolate major and genus trait values from ranks 0.1 to 2.
function traitScale(r, low, mid, high){
    r = Math.max(0.1, r);
    let from = r < 1 ? low : mid;
    let to = r < 1 ? mid : high;
    let f = r < 1 ? (r - 0.1) / 0.9 : (r <= 2 ? r - 1 : 1 + (r - 2) / 2);
    return mid.map(function(v,i){
        return typeof from[i] === 'number' && typeof to[i] === 'number' ? +(from[i] + (to[i] - from[i]) * f).toFixed(6) : v;
    });
}

// Return the value assigned to the highest reached rank step.
function rankStep(r, steps){
    let value = steps[0][1];
    steps.forEach(function(s){
        if (r >= s[0]){ value = s[1]; }
    });
    return value;
}

// Move a trait rank to the previous or next permitted step.
export function stepTraitRank(rank, down){
    const steps = [0.1, 0.25, 0.5, 1, 1.33, 1.67, 2];
    if (down){
        let lower = steps.filter(s => s < rank);
        return lower.length > 0 ? lower[lower.length - 1] : rank;
    }
    let higher = steps.find(s => s > rank);
    return higher === undefined ? rank : higher;
}

// Return the highest legacy rank tier at or below a rank.
export function rankTier(rank){
    const steps = [0.1, 0.25, 0.5, 1, 1.33, 1.67, 2];
    const old = [0.1, 0.25, 0.5, 1, 2, 3, 4];
    let i = steps.length - 1;
    while (i > 0 && steps[i] > rank){ i--; }
    return old[i];
}

// Convert a legacy fixed trait rank to the current scale.
export function legacyTraitRank(rank){
    return { 2: 1.33, 3: 1.67, 4: 2 }[rank] || rank;
}

// Return a trait rank after Empowered bonuses.
export function traitRank(trait){
    let rank = global.race[trait];
    if (rank && global.race['empowered'] && !['empowered','catnip','anise'].includes(trait)){
        // A recessive pair is fixed as it was designed.
        if (traitRecessive(trait)){ return rank; }
        return +(rank + traits.empowered.vars()[traits[trait].type === 'genus' ? 1 : 0]).toFixed(6);
    }
    return rank;
}

// Change a trait rank using an explicit rank, step direction, or increment.
export function setTraitRank(trait,opts){
    opts = opts || {};
    if (global.race[trait] && !opts['force']){
        let rank = opts['by']
            ? +Math.min(2, Math.max(0.1, global.race[trait] + (opts['down'] ? -opts.by : opts.by))).toFixed(2)
            : stepTraitRank(global.race[trait], opts['down']);
        if (rank === global.race[trait]){
            return false;
        }
        global.race[trait] = rank;
        afterRankChange(trait);
        return true;
    }
    else if (opts['set']){
        global.race[trait] = opts['set'];
        afterRankChange(trait);
        return true;
    }
    return false;
}

// A genus property is the average of the traits feeding it, so moving one of those traits moves the property.
function afterRankChange(trait){
    // Recalculate traits granted by Imitation when its rank changes.
    if (trait === 'imitation'){ setImitation(); }
    // Shapeshifter also requires emergent traits to be resynchronized.
    if (!genusFeeder(trait) && trait !== 'shapeshifter'){ return; }
    syncGenusEmergent();
}

export function fathomCheck(race){
    if (global.race['unfathomable'] && global.city['surfaceDwellers'] && global.city.surfaceDwellers.includes(race) && global.city['captive_housing']){
        let idx = global.city.surfaceDwellers.indexOf(race);
        let active = global.city.captive_housing[`race${idx}`];
        if (active > 100){ active = 100; }
        if (active > global.civic.torturer.workers){
            let unsupervised = active - global.civic.torturer.workers;
            active -= Math.ceil(unsupervised / 3);
        }
        let rank = (global.stats.achieve['nightmare'] && global.stats.achieve.nightmare['mg'] ? global.stats.achieve.nightmare.mg : 0) / 5;
        return active / 100 * rank;
    }
    return 0;
}

// Build lazy descriptions for traits with carrier-specific text.
export function traitSkin(type, trait, species, vars){
    let artificial = species ? genus_def[races[species].type].traits.artifical : global.race['artifical'];
    let skin;
    switch (type){
        case 'name':
            skin = {
                hooved(){ return hoovedReskin(false, species); },
                promiscuous(){ return artificial ? loc('trait_promiscuous_synth_name') : traits.promiscuous.name(); },
                weak(){ return species === 'dwarf' ? loc('trait_drunk_name') : traits.weak.name(); },
                spiritual(){ return global.race.universe === 'evil' && global.civic.govern.type != 'theocracy' ? loc('trait_manipulator_name') : traits.spiritual.name(); },
            };
            if (trait){ return skin[trait] ? skin[trait]() : traits[trait].name(); }
            break;
        case 'desc':
            skin = {
                hooved(){ return hoovedReskin(true, species); },
                promiscuous(){ return artificial ? loc('trait_promiscuous_synth') : traits['promiscuous'].desc(vars); },
                weak(){ return species === 'dwarf' ? loc('trait_drunk') : traits.weak.desc(vars); },
                spiritual(){ return global.race.universe === 'evil' && global.civic.govern.type != 'theocracy' ? loc('trait_manipulator') : traits.spiritual.desc(vars); },
                blurry(){ return global.race['warlord'] ? loc('trait_blurry_warlord') : traits.blurry.desc(vars); },
                playful(){ return global.race['warlord'] ? loc('trait_playful_warlord') : traits.playful.desc(vars); },
                befuddle(){ return global.race['warlord'] ? loc('trait_befuddle_warlord') : traits.befuddle.desc(vars); },
            };
            if (trait){ return skin[trait] ? skin[trait]() : traits[trait].desc(vars); }
            break;
        default:
            return;
    }
    // No trait named: hand back the whole map as plain strings, the shape this has always returned.
    let all = {};
    Object.keys(skin).forEach(function(k){ all[k] = skin[k](); });
    return all;
}

export function hoovedReskin(desc, species=global.race.species){
    // Normalize false species arguments to the current species.
    if (!species || !races[species]){ species = global.race.species; }
    let type = species === global.race.species ? global.race.maintype || races[species].type : races[species].type;
    if (species === 'sludge' || species === 'ultra_sludge'){
        return desc ? loc('trait_hooved_slime') : loc('trait_hooved_slime_name');
    }
    else if ([
        'cath','wolven','dracnid','seraph','cyclops','kobold','tuskin','sharkin','beholder','djinn'
        ].includes(species)){
        return desc ? loc(`trait_hooved_${species}`) : loc(`trait_hooved_${species}_name`);
    }
    else if ([
        'humanoid','avian','plant','fungi','reptilian','fey','synthetic'
        ].includes(type)){
        return desc ? loc(`trait_hooved_${type}`) : loc(`trait_hooved_${type}_name`);
    }
    else {
        return desc ? traits['hooved'].desc() : traits['hooved'].name();
    }
}

export const biomes = {
    grassland: {
        label: loc('biome_grassland_name'),
        desc: loc('biome_grassland'),
        vars(){
            return global.race['rejuvenated'] ? [1.25] : [1.2];
        }, // [Agriculture]
        wiki: ['%']
    },
    oceanic: {
        label: loc('biome_oceanic_name'),
        desc: loc('biome_oceanic'),
        vars(){
            return global.race['rejuvenated'] ? [1.25,1.12,0.92] : [1.12,1.06,0.95];
        }, // [Iron Titanium, cSteel Titanium, Hunting Fur]
        wiki: ['%','%','%']
    },
    forest: {
        label: loc('biome_forest_name'),
        desc: loc('biome_forest'),
        vars(){
            return global.race['rejuvenated'] ? [1.35] : [1.2];
        }, // [Lumberjack Lumber]
        wiki: ['%']
    },
    desert: {
        label: loc('biome_desert_name'),
        desc: loc('biome_desert'),
        vars(){
            return global.race['rejuvenated'] ? [1.35,1.18,0.6] : [1.2,1.1,0.75];
        }, // [Quarry Worker, Oil Well, Lumberjack]
        wiki: ['%','%','%']
    },
    volcanic: {
        label: loc('biome_volcanic_name'),
        desc: loc('biome_volcanic'),
        vars(){
            return global.race['rejuvenated'] ? [0.8,1.25,1.15] : [0.9,1.12,1.08];
        }, // [Agriculture, Copper, Iron]
        wiki: ['%','%','%']
    },
    tundra: {
        label: loc('biome_tundra_name'),
        desc: loc('biome_tundra'),
        vars(){
            return global.race['rejuvenated'] ? [1.5,0.8] : [1.25,0.9];
        }, // [Hunting Fur, Oil Well]
        wiki: ['%','%']
    },
    savanna: {
        label: loc('biome_savanna_name'),
        desc: loc('biome_savanna'),
        vars(){
            return global.race['rejuvenated'] ? [1.18, 1.25, 0.75] : [1.1, 1.18, 0.8];
        }, // [Agriculture, Hunting, Lumberjack]
        wiki: ['%','%','%']
    },
    swamp: {
        label: loc('biome_swamp_name'),
        desc: loc('biome_swamp'),
        vars(){
            return global.race['rejuvenated'] ? [1.6,1.35,1.15,0.78] : [1.4,1.25,1.1,0.88];
        }, // [City Defense, War Loot, Lumber, Stone]
        wiki: ['%','%','%','%']
    },
    ashland: {
        label: loc('biome_ashland_name'),
        desc: loc('biome_ashland'),
        vars(){
            return global.race['rejuvenated'] ? [0.55,1.35,1.2] : [0.62,1.25,1.1];
        }, // [Agriculture, Ashcrete, Iron & Copper]
        wiki: ['%','%','%']
    },
    taiga: {
        label: loc('biome_taiga_name'),
        desc: loc('biome_taiga'),
        vars(){
            return global.race['rejuvenated'] ? [1.2,1.65,0.88] : [1.1,1.5,0.92];
        }, // [Lumber, Pop Growth Speed, Oil Well]
        wiki: ['%','%','%']
    },
    hellscape: {
        label: loc('biome_hellscape_name'),
        desc: loc('biome_hellscape'),
        vars(){
            return global.race['rejuvenated'] ? [0.2] : [0.25];
        }, // [Agriculture]
        wiki: ['%']
    },
    eden: {
        label: loc('biome_eden_name'),
        desc: loc('biome_eden')
    }
};

export const planetTraits = {
    toxic: {
        label: loc('planet_toxic'),
        desc: loc('planet_toxic_desc'),
        vars(){
            return global.race['rejuvenated'] ? [2,1.5] : [1,1.25];
        }, // [Mutation Bonus, Birth Rate]
        wiki: ['A','-%']
    },
    mellow: {
        label: loc('planet_mellow'),
        desc: loc('planet_mellow_desc'),
        vars(){
            return global.race['rejuvenated'] ? [2,3,0.88] : [1.5,2,0.9];
        }, // [Unemployed and Soldier Stress Divisor, Job Stress Reduction, Production]
        wiki: ['%','A','%']
    },
    rage: {
        label: loc('planet_rage'),
        desc: loc('planet_rage_desc'),
        vars(){
            return global.race['rejuvenated'] ? [1.1,1.05,1] : [1.05,1.02,1];
        }, // [Combat, Hunting, Death]
        wiki: ['%','%','A']
    },
    stormy: {
        label: loc('planet_stormy'),
        desc: loc('planet_stormy_desc')
    },
    ozone: {
        label: loc('planet_ozone'),
        desc: loc('planet_ozone_desc'),
        vars(){
            return global.race['rejuvenated'] ? [0.18] : [0.25];
        }, // [Ozone Penalty]
        wiki: ['-A']
    },
    magnetic: {
        label: loc('planet_magnetic'),
        desc: loc('planet_magnetic_desc'),
        vars(){
            return global.race['rejuvenated'] ? [2,150,0.98] : [1,100,0.985];
        }, // [Sundial, Wardenclyffe, Miner]
        wiki: ['A','A','%']
    },
    trashed: {
        label: loc('planet_trashed'),
        desc: loc('planet_trashed_desc'),
        vars(){
            return global.race['rejuvenated'] ? [0.8,1.2] : [0.75,1];
        }, // [Agriculture, Scavenger Bonus]
        wiki: ['%','%']
    },
    elliptical: {
        label: loc('planet_elliptical'),
        desc: loc('planet_elliptical_desc'),
    },
    flare: {
        label: loc('planet_flare'),
        desc: loc('planet_flare_desc')
    },
    dense: {
        label: loc('planet_dense'),
        desc: loc('planet_dense_desc'),
        vars(){
            return global.race['rejuvenated'] ? [1.5,1.2,1.35] : [1.2,1,1.2];
        }, // [Mining Production, Miner Stress, Solar Fuel Cost]
        wiki: ['%','A','%']
    },
    unstable: {
        label: loc('planet_unstable'),
        desc: loc('planet_unstable_desc')
    },
    permafrost: {
        label: loc('planet_permafrost'),
        desc: loc('planet_permafrost_desc'),
        vars(){
            return global.race['rejuvenated'] ? [0.7,125] : [0.75,100];
        }, // [Mining Production, University Base]
        wiki: ['%','A']
    },
    retrograde: {
        label: loc('planet_retrograde'),
        desc: loc('planet_retrograde_desc')
    },
    kamikaze: {
        label: loc('planet_kamikaze'),
        desc: loc('planet_kamikaze_desc'),
        vars(){
            return [100,-1];
        }, // [Orbit, Orbit Loss]
        wiki: ['A','A']
    },
};

export function orbitLength(){
    let orbit = global.city.calendar.orbit;
    if (global.city.ptrait.includes('kamikaze')){
        orbit -= global.city.calendar.year;
        if ((!global.race['truepath'] || global.race['lone_survivor'] || global.tech['titan_ai_core'] || global.race['tidal_decay']) && orbit < 100){
            orbit = 100;
        }
    }
    return orbit;
}

function shellColor(){
    if (global.race.hasOwnProperty('shell_color')){
        return loc(`color_${global.race.shell_color}`);
    }
    return loc(`color_green`);
}

function foxColor(){
    if (global.race.hasOwnProperty('fox_color')){
        return loc(`color_${global.race.fox_color}`);
    }
    return loc(`color_red`);
}

export function basicRace(skip){
    skip = skip || [];
    let basicList = Object.keys(races).filter(function(r){ return !['custom','hybrid'].includes(r) && !skip.includes(r) && races[r].basic(); });
    let key = randomKey(basicList);
    return basicList[key];
}

export function renderSupernatural(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 8)){
        return;
    }
    let parent = $(`#supernatural`);
    clearElement(parent);

    if (global.race['wish'] && global.tech['wish'] && global.race['wishStats']){
        minorWish(parent);
        if (global.tech.wish >= 2){
            majorWish(parent);
        }
    }

    if (global.race['ocular_power']){
        ocularPower(parent);
    }

    if (global.race['deep_power']){
        deepPower(parent);
    }
}

function minorWish(parent){
    let container = $(`<div id="minorWish" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header"><span class="has-text-warning">${loc('tech_minor_wish')}</span> - <span v-html="wish(minor)"></span></div>`));
    let spells = $(`<div class="flexWrap"></div>`);
    container.append(spells);

    spells.append(`<div><b-button id="wishMoney" v-html="money_f()" @click="money()"></b-button></div>`);
    spells.append(`<div><b-button id="wishRes" v-html="label('resources')" @click="res()"></b-button></div>`);
    spells.append(`<div><b-button id="wishKnow" v-html="know_f()" @click="know()"></b-button></div>`);
    spells.append(`<div><b-button id="wishFame" v-html="label('fame')" @click="famous()"></b-button></div>`);
    spells.append(`<div><b-button id="wishStrength" v-html="label('strength')" @click="strength()"></b-button></div>`);
    spells.append(`<div><b-button id="wishInfluence" v-html="label('influence')" @click="influence()"></b-button></div>`);
    spells.append(`<div><b-button id="wishExcite" v-html="label('event')" @click="excite()"></b-button></div>`);
    spells.append(`<div><b-button id="wishLove" v-html="label('love')" @click="love()"></b-button></div>`);

    vBind({
        el: `#minorWish`,
        data: global.race.wishStats,
        methods: {
            know(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 3;

                    let options = ['inspire'];
                    if (!global.race['lone_survivor'] && !global.race['cataclysm'] && !global.race['orbit_decay']){
                        options.push('know');
                    }
                    if (global.tech['science']){
                        if (global.tech.science >= 1 && global.tech.science <= 3){
                            options.push('science');
                        }
                        else if (global.tech['high_tech'] && global.tech.high_tech >= 3 && global.tech.science >= 4 && global.tech.science <= 6){
                            options.push('science');
                        }
                        else if (global.tech['high_tech'] && global.tech.high_tech >= 4 && global.tech.science === 7){
                            options.push('science');
                        }
                        else if (global.tech['space'] && global.tech.space >= 3 && global.tech.science === 8 && global.tech['luna']){
                            options.push('science');
                        }
                        else if (global.tech['alpha'] && global.tech.alpha >= 2 && global.tech.science === 11){
                            options.push('science');
                        }
                        else if (global.tech['high_tech'] && global.tech.high_tech >= 12 && global.tech.science === 12){
                            options.push('science');
                        }
                        else if (global.tech['infernite'] && global.tech.infernite >= 2 && global.tech.science === 13){
                            options.push('science');
                        }
                        else if (global.tech['neutron'] && global.tech.science === 14){
                            options.push('science');
                        }
                        else if (global.tech['xeno'] && global.tech.xeno >= 4 && global.tech.science === 15){
                            options.push('science');
                        }
                        else if (global.tech['high_tech'] && global.tech.high_tech >= 16 && global.tech.science === 16){
                            options.push('science');
                        }
                        else if (global.tech['conflict'] && global.tech.conflict >= 5 && global.tech.science === 17){
                            options.push('science');
                        }
                        else if (global.tech['high_tech'] && global.tech.high_tech >= 17 && global.tech.science === 18){
                            options.push('science');
                        }
                        else if (global.tech['high_tech'] && global.tech.high_tech >= 18 && global.tech.science === 19){
                            options.push('science');
                        }
                        else if (global.tech['asphodel'] && global.tech.asphodel >= 3 && global.tech.science === 21){
                            options.push('science');
                        }
                        else if (global.tech['asphodel'] && global.tech.asphodel >= 8 && global.tech.science === 22){
                            options.push('science');
                        }
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'inspire':
                        {
                            global.race['inspired'] = Math.floor(seededRandom(300,600));
                            let msg = loc('event_inspiration');
                            messageQueue(msg,false,false,['events','major_events']);
                            break;
                        }
                        case 'know':
                        {
                            let gain = Math.floor(seededRandom(global.resource.Knowledge.max / 5,global.resource.Knowledge.max / 2));
                            global.resource.Knowledge.amount += gain;
                            if (global.resource.Knowledge.amount > global.resource.Knowledge.max){
                                global.resource.Knowledge.amount = global.resource.Knowledge.max;
                            }
                            messageQueue(loc('wish_know',[global.resource.Knowledge.name,sizeApproximation(gain)]),'warning',false,['events']);
                            break;
                        }
                        case 'science':
                        {
                            global.tech.science++;
                            switch(global.tech.science){
                                case 2:
                                    global.city['library'] = { count: 0 };
                                    break;
                                case 8:
                                    if (global.race['toxic'] && global.race.species === 'troll'){
                                        unlockAchieve('godwin');
                                    }
                                    break;
                                case 9:
                                    global.space['observatory'] = { count: 0, on: 0 };
                                    break;
                                case 12:
                                    global.interstellar['laboratory'] = { count: 0, on: 0 };
                                    break;
                            }
                            drawCity();
                            drawTech();

                            let techs = {
                                2: 'library', 3: 'thesis', 4: 'research_grant', 5: 'scientific_journal', 6: 'adjunct_professor', 7: 'tesla_coil', 8: 'internet',
                                9: 'observatory', 12: 'laboratory', 13: 'virtual_assistant', 14: 'dimensional_readings', 15: 'quantum_entanglement',
                                16: 'expedition', 17: 'subspace_sensors', 18: 'alien_database', 19: 'orichalcum_capacitor', 20: 'advanced_biotech'
                            };

                            let tech = typeof actions.tech[techs[global.tech.science]].title === 'function' ? actions.tech[techs[global.tech.science]].title() : actions.tech[techs[global.tech.science]].title;
                            messageQueue(loc('wish_tech',[tech]), 'warning',false,['progress']);
                            break;
                        }
                    }
                }
            },
            money(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 3;

                    let options = ['money','robbery'];
                    if (global.race.wishStats.tax === 0){
                        options.push('taxes');
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'money':
                        {
                            let cash = Math.floor(seededRandom(1,Math.round(global.resource.Money.max / 8)));
                            global.resource.Money.amount += cash;
                            if (global.resource.Money.amount > global.resource.Money.max){
                                global.resource.Money.amount = global.resource.Money.max;
                            }
                            messageQueue(loc('wish_cash',[sizeApproximation(cash)]),'warning',false,['events']);
                            break;
                        }
                        case 'taxes':
                        {
                            global.race.wishStats.tax = 5;
                            global.civic.taxes.rax_rate = govCivics('tax_cap');
                            messageQueue(loc('wish_taxes'),'warning',false,['events']);
                            break;
                        }
                        case 'robbery':
                        {
                            let cash = Math.floor(seededRandom(1,Math.round(global.resource.Money.max / 8)));
                            global.resource.Money.amount += cash;
                            if (global.resource.Money.amount > global.resource.Money.max){
                                global.resource.Money.amount = global.resource.Money.max;
                            }
                            let victim = Math.floor(seededRandom(0,10));
                            global.race.wishStats.bad += Math.floor(seededRandom(50,100));
                            messageQueue(loc('wish_robbery',[loc(`wish_robbery${victim}`),sizeApproximation(cash)]),'warning',false,['events']);
                            break;
                        }
                    }
                }
            },
            res(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 3;

                    let options = ['useless','common','rare','stolen','2xcommon','2xrare'];
                    let spell = options[Math.floor(seededRandom(0,options.length))];

                    let resList = [];
                    [
                        'Lumber','Stone','Furs','Copper','Iron','Aluminium','Cement','Coal','Oil','Uranium',
                        'Steel','Titanium','Alloy','Polymer','Iridium','Helium_3','Crystal','Chrysotile'
                    ].forEach(function(res){
                        if (global.resource[res].display && global.resource[res].amount * 1.05 < global.resource[res].max && (!global.race['iceage'] && !['Lumber', 'Uranium'].includes(res))){
                            resList.push(res);
                        }
                    });

                    if (spell === 'rare' || spell === 'stolen' || spell === '2xrare'){
                        [
                            'Deuterium','Neutronium','Adamantite','Nano_Tube','Graphene','Stanene','Bolognium',
                            'Vitreloy','Orichalcum','Infernite','Elerium','Soul_Gem'
                        ].forEach(function(res){
                            if (global.resource[res].display && (res === 'Soul_Gem' || global.resource[res].amount * 1.05 < global.resource[res].max)){
                                resList.push(res);
                            }
                        });
                    }

                    if (spell === 'useless' || resList.length === 0){
                        global.resource.Useless.display = true;
                        let gain = Math.floor(seededRandom(1,global.stats.know));
                        global.resource.Useless.amount += gain;
                        messageQueue(loc('wish_gain_res',[sizeApproximation(gain),global.resource.Useless.name]),'warning',false,['events']);
                    }
                    else {
                        let picked = [resList[Math.floor(seededRandom(0,resList.length))]];
                        if (spell === '2xcommon' || spell === '2xrare'){
                            picked.push(resList[Math.floor(seededRandom(0,resList.length))]);
                        }
                        
                        let gains = [];
                        picked.forEach(function(res){
                            let gain = 0;
                            if (res === 'Soul_Gem'){
                                gain = Math.floor(seededRandom(1,global.tech['science'] || 2));
                                global.resource[res].amount += gain;
                            }
                            else {
                                gain = Math.floor(seededRandom(1,Math.floor(global.resource[res].max * 0.25)));
                                global.resource[res].amount += gain;
                                if (global.resource[res].amount > global.resource[res].max){
                                    global.resource[res].amount = global.resource[res].max;
                                }
                            }
                            gains.push(gain);
                        });

                        if (['2xcommon','2xrare'].includes(spell)){
                            messageQueue(loc('wish_gain_double',[sizeApproximation(gains[0]),global.resource[picked[0]].name,sizeApproximation(gains[1]),global.resource[picked[1]].name]),'warning',false,['events']);
                        }
                        else if (['common','rare'].includes(spell)){
                            messageQueue(loc('wish_gain_res',[sizeApproximation(gains[0]),global.resource[picked[0]].name]),'warning',false,['events']);
                        }
                        else if (spell === 'stolen'){
                            global.race.wishStats.bad += Math.floor(seededRandom(50,100));
                            messageQueue(loc('wish_steal_res',[sizeApproximation(gains[0]),global.resource[picked[0]].name]),'warning',false,['events']);
                        }
                    }
                }
            },
            love(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 3;

                    let options = ['pet'];
                    let rivals = ['gov0','gov1','gov2'];
                    if (global.race['truepath'] && !global.tech['isolation'] && rivalActive()){
                        rivals.push('gov3');
                    }

                    rivals.forEach(function(gov){
                        if (global.civic.foreign[gov].hstl > 0 && !global.civic.foreign[gov].anx && !global.civic.foreign[gov].buy && !global.civic.foreign[gov].occ){
                            options.push(gov);
                        }
                    });

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    if (spell === 'pet'){
                        let msg = events.pet.effect();
                        messageQueue(msg,false,false,['events','minor_events']);
                    }
                    else {
                        global.civic.foreign[spell].hstl = 0;
                        messageQueue(loc('wish_love_gov',[govTitle(spell.substring(3))]),false,false,['minor_events']);
                    }
                }
            },
            excite(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 4;

                    let event_pool = eventList('minor');
                    if (event_pool.length > 0){
                        let event = rollEvent(event_pool);
                        let msg = events[event].effect();
                        messageQueue(msg,false,false,['events','minor_events']);
                        global.m_event.l = event;
                    }
                }
            },
            famous(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 3;

                    let options = ['notorious','reputable'];
                    let event = Math.floor(seededRandom(0,10));
                    let cheeseList = swissKnife(false,true);
                    let cheese = cheeseList[Math.floor(seededRandom(0,cheeseList.length))];

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'notorious':
                        {
                            global.race.wishStats.fame = -10;
                            let args = event === 8 ? [cheese] : [];
                            messageQueue(loc('wish_famous',[loc(`wish_notorious${event}`,args)]),'warning',false,['events']);
                            break;
                        }
                        case 'reputable':
                        {
                            global.race.wishStats.fame = 10;
                            let args = event === 4 ? [cheese] : [];
                            messageQueue(loc('wish_famous',[loc(`wish_reputable${event}`,args)]),'warning',false,['events']);
                            break;
                        }
                    }
                }
            },
            strength(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 3;

                    let options = ['troops'];
                    if (!global.race['strong']){
                        options.push('trait');
                    }

                    if (global.tech['military']){
                        if (global.tech.military === 1){
                            options.push('military');
                        }
                        else if (global.tech.military === 2 && global.tech['explosives']){
                            options.push('military');
                        }
                        else if (global.tech.military === 3 && global.tech['oil']){
                            options.push('military');
                        }
                        else if (global.tech.military === 4 && global.tech['high_tech'] && global.tech.high_tech >= 4){
                            options.push('military');
                        }
                        else if (global.tech.military === 5 && global.tech['mass']){
                            options.push('military');
                        }
                        else if (global.tech.military === 6 && global.tech['high_tech'] && global.tech.high_tech >= 9 && global.tech['elerium']){
                            options.push('military');
                        }
                        else if (global.tech.military === 7 && global.tech['high_tech'] && global.tech.high_tech >= 13){
                            options.push('military');
                        }
                        else if (global.tech.military === 8 && global.tech['high_tech'] && global.tech.high_tech >= 14 && global.tech['science'] && global.tech.science >= 15 && global.tech['infernite']){
                            options.push('military');
                        }
                        else if (global.tech.military === 9 && global.tech['science'] && global.tech.science >= 18){
                            options.push('military');
                        }
                        else if (global.tech.military === 10 && global.tech['high_tech'] && global.tech.high_tech >= 18){
                            options.push('military');
                        }
                        else if (global.tech.military === 11 && global.tech['asphodel'] && global.tech.asphodel >= 5){
                            options.push('military');
                        }
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'troops':
                        {
                            if (global.race.wishStats.troop < 25){
                                global.race.wishStats.troop++;
                                messageQueue(loc('wish_troop'),'warning',false,['events']);
                            }
                            break;
                        }
                        case 'trait':
                        {
                            global.race.wishStats.strong = true;
                            setTraitRank('strong',{ set: 0.25, force: true });
                            messageQueue(loc('wish_muscle'),'warning',false,['events']);
                            break;
                        }
                        case 'military':
                        {
                            global.tech.military++;
                            switch(global.tech.military){
                                case 7:
                                    if (global.race.species === 'sharkin'){
                                        unlockAchieve('laser_shark');
                                    }
                                    break;
                            }
                            drawCity();
                            drawTech();

                            let techs = {
                                2: 'bows', 3: 'flintlock_rifle', 4: 'machine_gun', 5: 'bunk_beds', 6: 'rail_guns', 7: 'laser_rifles',
                                8: 'plasma_rifles', 9: 'disruptor_rifles', 10: 'gauss_rifles', 11: 'cyborg_soldiers', 12: 'ethereal_weapons',
                            };

                            let tech = typeof actions.tech[techs[global.tech.military]].title === 'function' ? actions.tech[techs[global.tech.military]].title() : actions.tech[techs[global.tech.military]].title;
                            messageQueue(loc('wish_tech',[tech]), 'warning',false,['progress']);
                            break;
                        }
                    }
                }
            },
            influence(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 3;

                    let options = ['magazine'];
                    if (!global.race.wishStats.astro){
                        options.push('astro');
                    }
                    if (global.race.wishStats.prof < 25 && global.civic.professor.display){
                        options.push('professor');
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'magazine':
                        {
                            messageQueue(loc('wish_magazine',[races[global.race.species].name]),'warning',false,['events']);
                            break;
                        }
                        case 'astro':
                        {
                            global.race.wishStats.astro = true;
                            messageQueue(loc('wish_astro'),'warning',false,['events']);
                            break;
                        }
                        case 'professor':
                        {
                            global.race.wishStats.prof++;
                            messageQueue(loc('wish_prof'),'warning',false,['events']);
                            break;
                        }
                    }
                }
            },
            wish(v){
                return v === 0 ? `<span class="has-text-success">${loc(`power_available`)}</span>` : `<span class="has-text-danger">${v}</span>`;
            },
            label(v){
                return loc(`wish_${v}`);
            },
            know_f(){
                return global.resource.Knowledge.name;
            },
            money_f(){
                return loc('resource_Money_name');
            },
        }
    });

    ['Know','Money','Res','Love','Excite','Fame','Strength','Influence'].forEach(function(wish){
        popover(`wish${wish}`,
            function(){
                switch(wish){
                    case 'Know':
                        return loc(`wish_for`,[global.resource.Knowledge.name]);
                    case 'Money':
                        return loc(`wish_for`,[loc('resource_Money_name')]);
                    case 'Res':
                        return loc(`wish_for`,[loc('wish_resources')]);
                    case 'Love':
                        return loc(`wish_for`,[loc('wish_love')]);
                    case 'Excite':
                        return loc(`wish_for`,[loc('wish_event')]);
                    case 'Fame':
                        return loc(`wish_for`,[loc('wish_fame')]);
                    case 'Strength':
                        return loc(`wish_for`,[loc('wish_strength')]);
                    case 'Influence':
                        return loc(`wish_for`,[loc('wish_influence')]);
                }
            },{
                elm: `#wish${wish}`
            }
        );
    });
}

function majorWish(parent){
    let container = $(`<div id="majorWish" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header"><span class="has-text-warning">${loc('tech_major_wish')}</span> - <span v-html="wish(major)"></span></div>`));
    let spells = $(`<div class="flexWrap"></div>`);
    container.append(spells);

    spells.append(`<div><b-button id="wishBigMoney" v-html="money_f()" @click="money()"></b-button></div>`);
    spells.append(`<div><b-button id="wishBigRes" v-html="label('resources')" @click="res()"></b-button></div>`)
    spells.append(`<div><b-button id="wishPlasmid" v-html="label('plasmid')" @click="plasmid()"></b-button></div>`);
    spells.append(`<div><b-button id="wishPower" v-html="label('power')" @click="power()"></b-button></div>`);
    spells.append(`<div><b-button id="wishAdoration" v-html="label('adoration')" @click="adoration()"></b-button></div>`);
    spells.append(`<div><b-button id="wishThrill" v-html="label('thrill')" @click="thrill()"></b-button></div>`);
    spells.append(`<div><b-button id="wishPeace" v-html="label('peace')" @click="peace()"></b-button></div>`);
    spells.append(`<div><b-button id="wishGreatness" v-html="label('greatness')" @click="greatness()"></b-button></div>`);

    vBind({
        el: `#majorWish`,
        data: global.race.wishStats,
        methods: {
            money(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let options = ['money','robbery'];
                    if (!global.race.wishStats.casino){
                        options.push('casino');
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'money':
                        {
                            let cash = Math.floor(seededRandom(Math.round(global.resource.Money.max / 12),Math.round(global.resource.Money.max / 4)));
                            global.resource.Money.amount += cash;
                            if (global.resource.Money.amount > global.resource.Money.max){
                                global.resource.Money.amount = global.resource.Money.max;
                            }
                            messageQueue(loc('wish_cash',[sizeApproximation(cash)]),'warning',false,['events']);
                            break;
                        }
                        case 'robbery':
                        {
                            let cash = Math.floor(seededRandom(Math.round(global.resource.Money.max / 12),Math.round(global.resource.Money.max / 4)));
                            global.resource.Money.amount += cash;
                            if (global.resource.Money.amount > global.resource.Money.max){
                                global.resource.Money.amount = global.resource.Money.max;
                            }
                            let victim = Math.floor(seededRandom(0,10));
                            global.race.wishStats.bad += Math.floor(seededRandom(100,200));
                            messageQueue(loc('wish_robbery',[loc(`wish_robbery${victim}`),sizeApproximation(cash)]),'warning',false,['events']);
                            break;
                        }
                        case 'casino':
                        {
                            global.race.wishStats.casino = true;
                            let game = Math.floor(seededRandom(0,10));
                            messageQueue(loc('wish_casino',[loc(`wish_casino${game}`),structName('casino')]),'warning',false,['events']);
                        }
                    }
                }
            },
            res(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let options = ['useless','common','rare','stolen','2xcommon','2xrare'];
                    let spell = options[Math.floor(seededRandom(0,options.length))];

                    let resList = [];
                    [
                        'Lumber','Stone','Furs','Copper','Iron','Aluminium','Cement','Coal','Oil','Uranium',
                        'Steel','Titanium','Alloy','Polymer','Iridium','Helium_3','Crystal','Chrysotile'
                    ].forEach(function(res){
                        if (global.resource[res].display && global.resource[res].amount * 1.05 < global.resource[res].max && (!global.race['iceage'] && !['Lumber', 'Uranium'].includes(res))){
                            resList.push(res);
                        }
                    });

                    if (spell === 'rare' || spell === 'stolen' || spell === '2xrare'){
                        [
                            'Deuterium','Neutronium','Adamantite','Nano_Tube','Graphene','Stanene','Bolognium',
                            'Vitreloy','Orichalcum','Infernite','Elerium','Soul_Gem'
                        ].forEach(function(res){
                            if (global.resource[res].display && (res === 'Soul_Gem' || global.resource[res].amount * 1.05 < global.resource[res].max)){
                                resList.push(res);
                            }
                        });
                    }

                    if (spell === 'useless' || resList.length === 0){
                        global.resource.Useless.display = true;
                        let gain = Math.floor(seededRandom(100,global.stats.know * 4));
                        global.resource.Useless.amount += gain;
                        messageQueue(loc('wish_gain_res',[sizeApproximation(gain),global.resource.Useless.name]),'warning',false,['events']);
                    }
                    else {
                        let picked = [resList[Math.floor(seededRandom(0,resList.length))]];
                        if (spell === '2xcommon' || spell === '2xrare'){
                            picked.push(resList[Math.floor(seededRandom(0,resList.length))]);
                        }
                        
                        let gains = [];
                        picked.forEach(function(res){
                            let gain = 0;
                            if (res === 'Soul_Gem'){
                                gain = Math.floor(seededRandom(1,(global.tech['science'] + global.tech['high_tech']) || 2));
                                global.resource[res].amount += gain;
                            }
                            else {
                                gain = Math.floor(seededRandom(10000,Math.floor(global.resource[res].max * 0.5)));
                                global.resource[res].amount += gain;
                                if (global.resource[res].amount > global.resource[res].max){
                                    global.resource[res].amount = global.resource[res].max;
                                }
                            }
                            gains.push(gain);
                        });

                        if (['2xcommon','2xrare'].includes(spell)){
                            messageQueue(loc('wish_gain_double',[sizeApproximation(gains[0]),global.resource[picked[0]].name,sizeApproximation(gains[1]),global.resource[picked[1]].name]),'warning',false,['events']);
                        }
                        else if (['common','rare'].includes(spell)){
                            messageQueue(loc('wish_gain_res',[sizeApproximation(gains[0]),global.resource[picked[0]].name]),'warning',false,['events']);
                        }
                        else if (spell === 'stolen'){
                            global.race.wishStats.bad += Math.floor(seededRandom(100,200));
                            messageQueue(loc('wish_steal_res',[sizeApproximation(gains[0]),global.resource[picked[0]].name]),'warning',false,['events']);
                        }
                    }
                }
            },
            plasmid(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let options = ['fake','future'];
                    if (!global.race['warlord']){
                        if (global.tech['blackhole'] && global.tech.blackhole >= 5 && global.interstellar['mass_ejector'] && global.interstellar.mass_ejector.count >= 1){
                            options.push('blackhole');
                        }
                        else if (!global.race['cataclysm'] && !global.race['lone_survivor'] && global.race.species !== 'sludge'){
                            options.push('mad');
                        }
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'fake':
                        {
                            let gain = Math.floor(seededRandom(100,50000));
                            global.resource.Knockoff.amount = gain;
                            global.resource.Knockoff.display = true;
                            messageQueue(loc('wish_plasmid_gain',[gain,loc(`resource_Knockoff_plural_name`)]),'warning',false,['events']);
                            break;
                        }
                        case 'future':
                        {
                            let gain = Math.floor(seededRandom(2,global.tech.science + 2));
                            global.stats.pdebt += gain;
                            global.race.wishStats.plas += gain;
                            if (global.race.universe === 'antimatter'){
                                global.prestige.AntiPlasmid.count += gain;
                                global.stats.antiplasmid += gain;
                            }
                            else {
                                global.prestige.Plasmid.count += gain;
                                global.stats.plasmid += gain;
                            }
                            messageQueue(loc('wish_plasmid_gain',[gain,loc(global.race.universe === 'antimatter' ? `resource_AntiPlasmid_plural_name` : `resource_Plasmid_plural_name`)]),'warning',false,['events']);
                            break;
                        }
                        case 'mad':
                        {
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
                                global.civic.mad.armed = false;
                                warhead();
                            }, 4000);
                            break;
                        }
                        case 'blackhole':
                        {
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
                        }
                    }
                }
            },
            power(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let options = ['potato'];
                    if (!global.race['warlord'] && !global.race.wishStats.ship && (global.tech['shipyard'] || (global.tech['science'] && global.tech.science >= 16))){
                        options.push('ship');
                    }
                    if (!global.race.wishStats.gov){
                        options.push('government');
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'potato':
                        {
                            global.race.wishStats.potato++;
                            messageQueue(loc('wish_energized'),'warning',false,['events']);
                            break;
                        }
                        case 'ship':
                        {
                            global.race.wishStats.ship = true;
                            messageQueue(loc('wish_ship'),'warning',false,['events']);
                            break;
                        }
                        case 'government':
                        {
                            global.race.wishStats.gov = true;
                            global.civic.govern.type = 'dictator';
                            messageQueue(loc('wish_gov'),'warning',false,['events']);
                        }
                    }
                }
            },
            adoration(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let options = ['priest'];
                    if (!global.race.wishStats.temple && !global.race['cataclysm'] && !global.race['lone_survivor'] && !global.race['warlord']){
                        options.push('temple');
                    }
                    if (!global.race.wishStats.zigg && !global.race['lone_survivor'] && !global.race['warlord'] && !global.race['iceage']){
                        options.push('zigg');
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'priest':
                        {
                            if (global.civic.priest.display && global.race.wishStats.priest < 25){
                                global.race.wishStats.priest++;
                                messageQueue(loc('wish_priest'),'warning',false,['events']);
                            }
                            else {
                                messageQueue(loc('wish_priest_fail'),'warning',false,['events']);
                            }
                            break;
                        }
                        case 'temple':
                        {
                            global.race.wishStats.temple = true;
                            messageQueue(loc('wish_temple',[structName('temple')]),'warning',false,['events']);
                            break;
                        }
                        case 'zigg':
                        {
                            global.race.wishStats.zigg = true;
                            messageQueue(loc('wish_temple',[loc('space_red_ziggurat_title')]),'warning',false,['events']);
                        }
                    }
                }
            },
            thrill(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let event_pool = eventList('major');
                    if (event_pool.length > 0){
                        let event = rollEvent(event_pool);
                        let msg = events[event].effect();
                        messageQueue(msg,'caution',false,['events','major_events']);
                        global.m_event.l = event;
                    }
                }
            },
            peace(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let options = ['flower'];
                    let rivals = ['gov0','gov1','gov2'];
                    rivals.forEach(function(gov){
                        if (!global.civic.foreign[gov].anx && !global.civic.foreign[gov].buy && !global.civic.foreign[gov].occ && !global.tech['world_control']){
                            options.push(gov);
                        }
                    });

                    if (global.race['truepath'] && !global.tech['isolation'] && rivalActive() && global.civic.foreign.gov3.hstl > 0){
                        options.push('gov3');
                    }

                    if (!global.race['truepath'] && global.tech.piracy > 1){
                        options.push('piracy');
                    }

                    if (global.race['truepath'] && global.space['syndicate']){
                        options.push('syndicate');
                    }
                    
                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    if (['gov0','gov1','gov2'].includes(spell)){
                        global.civic.foreign[spell].hstl = 0;
                        global.civic.foreign[spell].anx = true;
                        messageQueue(loc('wish_peace_join',[govTitle(spell.substring(3))]),'warning',false,['events']);
                    }
                    else {
                        switch(spell){
                            case 'flower':
                                messageQueue(loc('wish_peace_flower'),'warning',false,['events']);
                                break;
                            case 'gov3':
                                global.civic.foreign[spell].hstl = 0;
                                break;
                            case 'piracy':
                                global.tech.piracy = Math.floor(seededRandom(1,global.tech.piracy));
                                messageQueue(loc('wish_piracy'),'warning',false,['events']);
                                break;
                            case 'syndicate':
                                Object.keys(global.space.syndicate).forEach(function(synd){
                                    if (global.space.syndicate[synd] > 10){
                                        global.space.syndicate[synd] = Math.floor(seededRandom(10,global.space.syndicate[synd]));
                                    }
                                });
                                messageQueue(loc('wish_piracy'),'warning',false,['events']);
                                break;
                        }
                    }
                }
            },
            greatness(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let options = ['wonder'];

                    let a_level = alevel();
                    if (!global.race['lone_survivor'] && !global.race['warlord'] && !global.stats.feat['wish'] || (global.stats.feat['wish'] && global.stats.feat['wish'] < a_level)){
                        options.push('feat');
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'wonder':
                        {
                            let wonders = [];
                            if (!global.race['lone_survivor']){
                                let hasCity = global.race['cataclysm'] || global.race['orbit_decay'] || global.race['warlord'] || global.tech['isolation'] || global.race['iceage'] ? false : true;
                                let hasMars = global.tech['mars'] && !global.race['warlord'] ? true : false;
                                if (!global.city.hasOwnProperty('wonder_lighthouse') && hasCity){
                                    wonders.push('lighthouse');
                                }
                                if (!global.city.hasOwnProperty('wonder_pyramid') && hasCity){
                                    wonders.push('pyramid');
                                }
                                if (!global.space.hasOwnProperty('wonder_statue') && hasMars){
                                    wonders.push('statue');
                                }
                                if(!global.underground.hasOwnProperty('wonder_fountain') && global.race['iceage']){
                                    wonders.push('fountain');
                                }
                                if (global.race['warlord']){
                                    if (!global.portal.hasOwnProperty('wonder_gardens')){
                                        wonders.push('gardens');
                                    }
                                }
                                else if (global.race['truepath']){
                                    if (!global.space.hasOwnProperty('wonder_gardens') && global.tech['titan'] && global.tech.titan >= 2){
                                        wonders.push('gardens');
                                    }
                                }
                                else {
                                    if (!global.interstellar.hasOwnProperty('wonder_gardens') && global.tech['alpha'] && global.tech.alpha >= 2){
                                        wonders.push('gardens');
                                    }
                                }
                            }

                            if (wonders.length > 0){
                                let monument = wonders[Math.floor(seededRandom(0,wonders.length))];
                                switch (monument){
                                    case 'lighthouse':
                                        global.city['wonder_lighthouse'] = { count: 1 };
                                        break;
                                    case 'pyramid':
                                        global.city['wonder_pyramid'] = { count: 1 };
                                        break
                                    case 'statue':
                                        global.space['wonder_statue'] = { count: 1 };
                                        break;
                                    case 'gardens':
                                        global[global.race['warlord'] ? 'portal' : (global.race['truepath'] ? 'space' : 'interstellar')]['wonder_gardens'] = { count: 1 };
                                        break;
                                    case 'fountain':
                                        global.underground['wonder_fountain'] = { count: 1 };
                                        break;
                                }
                                messageQueue(loc('wish_wonder'),'warning',false,['events']);
                            }
                            else {
                                messageQueue(loc('wish_no_wonder'),'warning',false,['events']);
                            }
                            break;
                        }
                        case 'feat':
                        {
                            unlockFeat('wish',global.race.universe === 'micro' ? true : false);
                            break;
                        }
                    }
                }
            },
            wish(v){
                return v === 0 ? `<span class="has-text-success">${loc(`power_available`)}</span>` : `<span class="has-text-danger">${v}</span>`;
            },
            label(v){
                return loc(`wish_${v}`);
            },
            money_f(){
                return loc('resource_Money_name');
            },
        }
    });

    ['BigMoney','BigRes','Plasmid','Power','Adoration','Thrill','Peace','Greatness'].forEach(function(wish){
        popover(`wish${wish}`,
            function(){
                switch(wish){
                    case 'BigMoney':
                        return loc(`wish_for`,[loc('wish_big_money')]);
                    case 'BigRes':
                        return loc(`wish_for`,[loc('wish_big_resources')]);
                    case 'Plasmid':
                        return loc(`wish_for`,[loc('wish_plasmid')]);
                    case 'Power':
                        return loc(`wish_for`,[loc('wish_power')]);
                    case 'Adoration':
                        return loc(`wish_for`,[loc('wish_adoration')]);
                    case 'Thrill':
                        return loc(`wish_for`,[loc('wish_thrill')]);
                    case 'Peace':
                        return loc(`wish_for`,[loc('wish_peace')]);
                    case 'Greatness':
                        return loc(`wish_for`,[loc('wish_greatness')]);
                }
            },{
                elm: `#wish${wish}`
            }
        );
    });
}

function ocularPower(parent){
    let container = $(`<div id="ocularPower" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header"><span class="has-text-warning">${loc('trait_ocular_power_name')}</span> - <span v-html="max()"></span></div>`));
    let powers = $(`<div class="flexWrap"></div>`);
    container.append(powers);

    powers.append(`<div id="oculardisintegration" class="chk"><b-checkbox v-model="d" @update:model-value="pow('d')">${loc(`ocular_disintegration`)}</b-checkbox></div>`);
    powers.append(`<div id="ocularpetrification" class="chk"><b-checkbox v-model="p" @update:model-value="pow('p')">${loc(`ocular_petrification`)}</b-checkbox></div>`);
    powers.append(`<div id="ocularwound" class="chk"><b-checkbox v-model="w" @update:model-value="pow('w')">${loc(`ocular_wound`)}</b-checkbox></div>`);
    powers.append(`<div id="oculartelekinesis" class="chk"><b-checkbox v-model="t" @update:model-value="pow('t')">${loc(`ocular_telekinesis`)}</b-checkbox></div>`);
    powers.append(`<div id="ocularfear" class="chk"><b-checkbox v-model="f" @update:model-value="pow('f')">${loc(`ocular_fear`)}</b-checkbox></div>`);
    powers.append(`<div id="ocularcharm" class="chk"><b-checkbox v-model="c" @update:model-value="pow('c')">${loc(`ocular_charm`)}</b-checkbox></div>`);

    vBind({
        el: `#ocularPower`,
        data: global.race.ocularPowerConfig,
        methods: {
            pow(v){
                let active = 0;
                ['d','p','w','t','f','c'].forEach(function(p){
                    if (global.race.ocularPowerConfig[p]){ active++ }
                    if (active > traits.ocular_power.vars()[0] && p !== v){
                        global.race.ocularPowerConfig[p] = false;
                    }
                });
                if (active > traits.ocular_power.vars()[0]){
                    active = 0;
                    ['d','p','w','t','f','c'].reverse().forEach(function(p){
                        if (global.race.ocularPowerConfig[p]){ active++ }
                        if (active > traits.ocular_power.vars()[0] && p !== v){
                            global.race.ocularPowerConfig[p] = false;
                        }
                    });
                    renderSupernatural();
                }
            },
            max(){
                let active = 0;
                ['d','p','w','t','f','c'].forEach(function(p){
                    if (global.race.ocularPowerConfig[p]){ active++ }
                });
                return loc('ocular_max',[active,traits.ocular_power.vars()[0]]);
            },
        }
    });

    ['disintegration','petrification','wound','telekinesis','fear','charm'].forEach(function(power){
        popover(`ocular${power}`,
            function(){
                switch(power){
                    case 'disintegration':
                        let attack = 50 * (traits.ocular_power.vars()[1] / 100);
                        return loc(`ocular_${power}_desc`,[attack]);
                    case 'petrification':
                        return loc(`ocular_${power}_desc`,[global.resource.Stone.name]);
                    case 'wound':
                        let hunt = 60 * (traits.ocular_power.vars()[1] / 100);
                        return loc(`ocular_${power}_desc`,[hunt]);
                    case 'telekinesis':
                        let labor = 20 * (traits.ocular_power.vars()[1] / 100);
                        return loc(`ocular_${power}_desc`,[labor]);
                    case 'fear':
                        return loc(`ocular_${power}_desc`);
                    case 'charm':
                        let trade = 70 * (traits.ocular_power.vars()[1] / 100);
                        return loc(`ocular_${power}_desc`,[trade]);
                }
            },{
                elm: `#ocular${power}`
            }
        );
    });
}

export function renderPsychicPowers(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 7)){
        return;
    }
    let parent = $(`#psychicPowers`);
    clearElement(parent);

    if (global.race['psychic'] && global.tech['psychic']){
        psychicBoost(parent);
        psychicKill(parent);
        if (global.tech.psychic >= 2){
            psychicAssault(parent);
        }
        if (global.tech.psychic >= 3){
            if (!global.race.psychicPowers['cash']){ global.race.psychicPowers['cash'] = 0 };
            psychicFinance(parent);
        }
        if (global.tech['psychicthrall'] && global.tech['unfathomable'] && global.race['unfathomable']){
            if (global.tech.psychicthrall >= 2){
                psychicCapture(parent);
            }
            psychicMindBreak(parent);
        }
    }
}

function psychicBoost(parent){
    let container = $(`<div id="psychicBoost" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header">${loc('psychic_boost_title')} <span v-html="boostTime()"></span></div>`));

    let content = $(`<div></div>`);
    container.append(content);

    let scrollMenu = ``;
    Object.keys(atomic_mass).forEach(function(res){
        if (global.resource[res].display){
            scrollMenu += `<b-radio-button v-model="b.r" native-value="${res}">${global.resource[res].name}</b-radio-button>`;
        }
    });
    content.append(`<div id="psyhscrolltarget" class="left hscroll"><b-field class="buttonList">${scrollMenu}</b-field></div>`); 

    container.append(`<div><b-button v-html="boost(b.r)" @click="boostVal()"></b-button></div>`);

    if (global.tech.psychic >= 4){
        let channel = $(`<div class="gap">${loc('psychic_channel')}</div>`);
        let psy = $(`<span class="current">{{ c.boost }}</span>`);
        let sub = $(`<span role="button" class="sub" @click="sub" aria-label="Decrease Energy reserved for ${loc(`psychic_attack`)}"><span>&laquo;</span></span>`);
        let add = $(`<span role="button" class="add" @click="add" aria-label="Increase Energy reserved for ${loc(`psychic_attack`)}"><span>&raquo;</span></span>`);
        channel.append(sub);
        channel.append(psy);
        channel.append(add);
        container.append(channel);
    }
    
    let cost = global.tech.psychic >= 5 ? 60 : 75;
    let rank = global.stats.achieve['nightmare'] && global.stats.achieve.nightmare['mg'] ? global.stats.achieve.nightmare.mg : 0;
    vBind({
        el: `#psychicBoost`,
        data: {
            b: global.race.psychicPowers.boost,
            c: global.tech.psychic >= 4 ? global.race.psychicPowers.channel : {},
        },
        methods: {
            boostVal(){
                if (global.resource.Energy.amount >= cost){
                    global.resource.Energy.amount -= cost;
                    global.race.psychicPowers.boostTime = 72 * rank;
                }
            },
            add(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.race.psychicPowers.channel.boost + global.race.psychicPowers.channel.assault + global.race.psychicPowers.channel.cash < 100){
                        global.race.psychicPowers.channel.boost++;
                    }
                    else {
                        break;
                    }
                }
            },
            sub(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.race.psychicPowers.channel.boost > 0){
                        global.race.psychicPowers.channel.boost--;
                    }
                    else {
                        break;
                    }
                }
            },
            boost(r){
                return loc(`psychic_boost_button`,[global.resource[r] ? global.resource[r].name : 'N/A',cost]);
            },
            boostTime(){
                return global.race.psychicPowers.boostTime > 0 ? loc(`psychic_boost_time`,[global.race.psychicPowers.boostTime]) : '';
            }
        }
    });

    const scrollContainer = document.getElementById('psyhscrolltarget');
    scrollContainer.addEventListener("wheel", (evt) => {
        evt.preventDefault();
        scrollContainer.scrollLeft += evt.deltaY;
    });

    popover('psychicBoost',
        function(){
            return loc(`psychic_boost_desc`,[traits.psychic.vars()[3]]);
        },{
            elm: '#psychicBoost > div > button'
        }
    );
}

function psychicKill(parent){
    let container = $(`<div id="psychicKill" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header">${loc('psychic_murder_title')}</div>`));
    container.append(`<div><b-button v-html="kill()" @click="murder()"></b-button></div>`);

    let cost = global.tech.psychic >= 5 ? 8 : 10;
    vBind({
        el: `#psychicKill`,
        data: {},
        methods: {
            murder(){
                if (global.resource.Energy.amount >= cost && global.resource[global.race.species].amount >= 1){
                    global.resource.Energy.amount -= cost;
                    global.resource[global.race.species].amount--;
                    global.stats.psykill++;
                    citizenDeath(1);
                    if (global.race['anthropophagite']){
                        modRes('Food', 10000 * traits.anthropophagite.vars()[0], true);
                    }
                    if (global.stats.psykill === 10){
                        renderPsychicPowers();
                    }
                }
            },
            kill(){
                return loc(`psychic_murder_button`,[cost]);
            }
        }
    });

    popover('psychicKill',
        function(){
            return loc(`psychic_murder_desc`);
        },{
            elm: '#psychicKill > div > button'
        }
    );
}

function psychicAssault(parent){
    let container = $(`<div id="psychicAssault" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header">${loc('psychic_assault_title')} <span v-html="boostTime()"></span></div>`));
    container.append(`<div><b-button v-html="btnLabel()" @click="boostVal()"></b-button></div>`);

    if (global.tech.psychic >= 4){
        let channel = $(`<div class="gap">${loc('psychic_channel')}</div>`);
        let psy = $(`<span class="current">{{ assault }}</span>`);
        let sub = $(`<span role="button" class="sub" @click="sub" aria-label="Decrease Energy reserved for ${loc(`psychic_attack`)}"><span>&laquo;</span></span>`);
        let add = $(`<span role="button" class="add" @click="add" aria-label="Increase Energy reserved for ${loc(`psychic_attack`)}"><span>&raquo;</span></span>`);
        channel.append(sub);
        channel.append(psy);
        channel.append(add);
        container.append(channel);
    }

    let cost = global.tech.psychic >= 5 ? 36 : 45;
    let rank = global.stats.achieve['nightmare'] && global.stats.achieve.nightmare['mg'] ? global.stats.achieve.nightmare.mg : 0;
    vBind({
        el: `#psychicAssault`,
        data: global.tech.psychic >= 4 ? global.race.psychicPowers.channel : {},
        methods: {
            boostVal(){
                if (global.resource.Energy.amount >= cost){
                    global.resource.Energy.amount -= cost;
                    global.race.psychicPowers.assaultTime = 72 * rank;
                }
            },
            add(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.race.psychicPowers.channel.boost + global.race.psychicPowers.channel.assault + global.race.psychicPowers.channel.cash < 100){
                        global.race.psychicPowers.channel.assault++;
                    }
                    else {
                        break;
                    }
                }
            },
            sub(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.race.psychicPowers.channel.assault > 0){
                        global.race.psychicPowers.channel.assault--;
                    }
                    else {
                        break;
                    }
                }
            },
            btnLabel(){
                return loc(`psychic_boost_button`,[loc(`psychic_attack`),cost]);
            },
            boostTime(){
                return global.race.psychicPowers.assaultTime > 0 ? loc(`psychic_boost_time`,[global.race.psychicPowers.assaultTime]) : '';
            }
        }
    });

    popover('psychicAssault',
        function(){
            return loc(`psychic_assault_desc`,[traits.psychic.vars()[3]]);
        },{
            elm: '#psychicAssault > div > button'
        }
    );
}

function psychicFinance(parent){
    let container = $(`<div id="psychicFinance" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header">${loc('psychic_profit_title')} <span v-html="boostTime()"></span></div>`));
    container.append(`<div><b-button v-html="btnLabel()" @click="boostVal()"></b-button></div>`);

    if (global.tech.psychic >= 4){
        let channel = $(`<div class="gap">${loc('psychic_channel')}</div>`);
        let psy = $(`<span class="current">{{ cash }}</span>`);
        let sub = $(`<span role="button" class="sub" @click="sub" aria-label="Decrease Energy reserved for ${loc(`psychic_profit`)}"><span>&laquo;</span></span>`);
        let add = $(`<span role="button" class="add" @click="add" aria-label="Increase Energy reserved for ${loc(`psychic_profit`)}"><span>&raquo;</span></span>`);
        channel.append(sub);
        channel.append(psy);
        channel.append(add);
        container.append(channel);
    }

    let cost = global.tech.psychic >= 5 ? 52 : 65;
    let rank = global.stats.achieve['nightmare'] && global.stats.achieve.nightmare['mg'] ? global.stats.achieve.nightmare.mg : 0;
    vBind({
        el: `#psychicFinance`,
        data: global.tech.psychic >= 4 ? global.race.psychicPowers.channel : {},
        methods: {
            boostVal(){
                if (global.resource.Energy.amount >= cost){
                    global.resource.Energy.amount -= cost;
                    global.race.psychicPowers.cash = 72 * rank;
                }
            },
            add(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.race.psychicPowers.channel.boost + global.race.psychicPowers.channel.assault + global.race.psychicPowers.channel.cash < 100){
                        global.race.psychicPowers.channel.cash++;
                    }
                    else {
                        break;
                    }
                }
            },
            sub(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.race.psychicPowers.channel.cash > 0){
                        global.race.psychicPowers.channel.cash--;
                    }
                    else {
                        break;
                    }
                }
            },
            btnLabel(){
                return loc(`psychic_boost_button`,[loc(`psychic_profit`),cost]);
            },
            boostTime(){
                return global.race.psychicPowers.cash > 0 ? loc(`psychic_boost_time`,[global.race.psychicPowers.cash]) : '';
            }
        }
    });

    popover('psychicFinance',
        function(){
            return loc(`psychic_profit_desc`,[traits.psychic.vars()[3]]);
        },{
            elm: '#psychicFinance > div > button'
        }
    );
}

function psychicMindBreak(parent){
    let container = $(`<div id="psychicMindBreak" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header">${loc('psychic_mind_break_title')}</div>`));
    container.append(`<div><b-button v-html="btnLabel()" @click="breakMind()"></b-button></div>`);

    let cost = global.tech.psychic >= 5 ? 64 : 80;
    vBind({
        el: `#psychicMindBreak`,
        data: {},
        methods: {
            breakMind(){
                if (global.resource.Energy.amount >= cost && global.tech['unfathomable']){
                    let imprisoned = [];
                    if (global.city.hasOwnProperty('surfaceDwellers')){
                        for (let i = 0; i < global.city.surfaceDwellers.length; i++){
                            let jailed = global.city.captive_housing[`jailrace${i}`];
                            if (jailed > 0){
                                imprisoned.push(i);
                            }
                        }
                    }

                    if (imprisoned.length > 0){
                        let k = imprisoned[Math.rand(0,imprisoned.length)];
                        global.city.captive_housing[`jailrace${k}`]--;
                        global.city.captive_housing[`race${k}`]++;
                        global.resource.Energy.amount -= cost;
                    }
                }
            },
            btnLabel(){
                return loc(`psychic_mind_break_button`,[cost]);
            }
        }
    });

    popover('psychicMindBreak',
        function(){
            return loc(`psychic_mind_break_desc`);
        },{
            elm: '#psychicMindBreak > div > button'
        }
    );
}

function psychicCapture(parent){
    let container = $(`<div id="psychicCapture" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header">${loc('psychic_stun_title')}</div>`));
    container.append(`<div><b-button v-html="btnLabel()" @click="stun()"></b-button></div>`);

    let cost = global.tech.psychic >= 5 ? 80 : 100;
    vBind({
        el: `#psychicCapture`,
        data: {},
        methods: {
            stun(){
                if (global.resource.Energy.amount >= cost && global.tech['unfathomable']){
                    let usedCap = 0;
                    if (global.city.hasOwnProperty('surfaceDwellers')){
                        for (let i = 0; i < global.city.surfaceDwellers.length; i++){
                            let mindbreak = global.city.captive_housing[`race${i}`];
                            let jailed = global.city.captive_housing[`jailrace${i}`];
                            usedCap += mindbreak + jailed;
                        }
                    }

                    if (usedCap < global.city.captive_housing.raceCap){
                        let k = Math.rand(0,global.city.surfaceDwellers.length);
                        global.city.captive_housing[`jailrace${k}`]++;
                        global.resource.Energy.amount -= cost;
                    }
                }
            },
            btnLabel(){
                return loc(`psychic_stun_button`,[cost]);
            }
        }
    });

    popover('psychicCapture',
        function(){
            return loc(`psychic_stun_desc`);
        },{
            elm: '#psychicCapture > div > button'
        }
    );
}


function deepPower(parent){
    let container = $(`<div id="deepPower" class="industry"></div>`);
    parent.append(container);
    container.append($(`<div class="header has-text-advanced" :thingy="update()">${loc('deep_power_modal')}</div>`));

    container.append($(`<div>${loc('deep_power_production')} {{ effect('global') }}% <span v-bind:class="{ 'has-text-warning': global > 50 }">({{ global }}%)</span></div>`));
    let globalMult = $(`<div class="sliderbar thin"><span class="sub" role="button" @click="sub('global')" aria-label="Increase Global Production">&laquo;</span>
        <b-slider v-model="global" @change="lastUsed('global')" @dragging="lastUsed('global')" format="percent"></b-slider>
        <span class="add" role="button" @click="add('global')" aria-label="Decrease Global Production">&raquo;</span></div>`);
    container.append(globalMult);

    container.append($(`<div>${loc('deep_power_crafting')} {{ effect('crafting') }}% <span v-bind:class="{ 'has-text-warning': crafting > 50 }">({{ crafting }}%)</span></div>`));
    let crafting = $(`<div class="sliderbar thin"><span class="sub" role="button" @click="sub('crafting')" aria-label="Increase Crafting">&laquo;</span>
        <b-slider v-model="crafting" @change="lastUsed('crafting')" @dragging="lastUsed('crafting')" format="percent"></b-slider>
        <span class="add" role="button" @click="add('crafting')" aria-label="Decrease Crafting">&raquo;</span></div>`);
    container.append(crafting);

    if (global.genes['trader']){
        container.append($(`<div>${loc('deep_power_trade')} {{ effect('trade') }}% <span v-bind:class="{ 'has-text-warning': trade > 50 }">({{ trade }}%)</span></div>`));
        let trade = $(`<div class="sliderbar thin"><span class="sub" role="button" @click="sub('trade')" aria-label="Increase Trade">&laquo;</span>
            <b-slider v-model="trade" @change="lastUsed('trade')" @dragging="lastUsed('trade')" format="percent"></b-slider>
            <span class="add" role="button" @click="add('trade')" aria-label="Decrease Trade">&raquo;</span></div>`);
        container.append(trade);
    }

    container.append($(`<div>${loc('deep_power_combat')} {{ effect('combat') }}% <span v-bind:class="{ 'has-text-warning': combat > 50 }">({{ combat }}%)</span></div>`));
    let combat = $(`<div class="sliderbar thin"><span class="sub" role="button" @click="sub('combat')" aria-label="Increase Combat">&laquo;</span>
        <b-slider v-model="combat" @change="lastUsed('combat')" @dragging="lastUsed('combat')" format="percent"></b-slider>
        <span class="add" role="button" @click="add('combat')" aria-label="Decrease Combat">&raquo;</span></div>`);
    container.append(combat);

    let order = ['global', 'crafting', 'trade', 'combat']; //set order in case deep power values are somehow re-sorted
    const cap = () => 100 + (global.genes['trader'] ? 20 : 0); //potential issue: this is the only place where this cap is enforced
    let lastUsed = '';
    vBind({
        el: '#deepPower',
        data: global.race['deepPowerConfig'],
        methods: {
            sub(r){
                let keyMult = keyMultiplier();
                if (global.race['deepPowerConfig'][r] > 0){
                    global.race['deepPowerConfig'][r] -= keyMult;
                    if (global.race['deepPowerConfig'][r] < 0){
                        global.race['deepPowerConfig'][r] = 0;
                    }
                    this.lastUsed(r);
                    this.update();
                }
            },
            add(r){
                let keyMult = keyMultiplier();
                if (global.race['deepPowerConfig'][r] < 100){
                    global.race['deepPowerConfig'][r] += keyMult;
                    if (global.race['deepPowerConfig'][r] > 100){
                        global.race['deepPowerConfig'][r] = 100;
                    }
                    this.lastUsed(r);
                    this.update();
                }
            },
            lastUsed(r){
                lastUsed = r;
            },
            update(){
                //console.log(lastUsed);
                let totalPoints = 0;
                order.forEach(function (tab){
                    totalPoints += global.race['deepPowerConfig'][tab];
                });
                let difference = Math.abs(cap() - totalPoints);
                if (totalPoints > cap()){ //slider went higher
                    //always take from highest option first then move down.
                    for (let i=0;i<order.length; i++){
                        if(lastUsed === order[i]){ //skip updated option
                            continue;
                        }
                        let reduce = Math.min(difference, global.race['deepPowerConfig'][order[i]]);
                        //console.log('decreasing', order[i], reduce, r);
                        global.race['deepPowerConfig'][order[i]] -= reduce;
                        difference -= reduce;
                        if(difference <= 0){
                            break;
                        }
                    }
                }
                else if(totalPoints < cap()){ //slider went lower (or same?)
                    for (let i=0;i<order.length; i++){
                        if(lastUsed === order[i]){
                            continue;
                        }
                        let increase = Math.min(difference, 100 - global.race['deepPowerConfig'][order[i]]);
                        //console.log('increasing', order[i], increase, r);
                        global.race['deepPowerConfig'][order[i]] += increase;
                        difference -= increase;
                        if(difference <= 0){
                            break;
                        }
                    }
                }
            },
            effect(r){
                let mastery = calc_mastery();
                mastery *= calcDeepPower(r);
                return +mastery.toFixed(1);
            }
        }
    });
}

export function citizenDeath(v){
    blubberFill(v);
    if (global.race['mourning']){
        global.race['mourning_total'] = (global.race['mourning_total'] || 0) + v * traits.mourning.vars()[0];
    }
}

export function blubberFill(v){
    if (global.race['blubber'] && global.city.hasOwnProperty('oil_well')){
        let cap = (global.city.oil_well.count + (global.space['oil_extractor'] ? global.space.oil_extractor.count : 0)) * 50;
        global.city.oil_well.dead += v;
        if (global.city.oil_well.dead > cap){
            global.city.oil_well.dead = cap;
        }
    }
}
