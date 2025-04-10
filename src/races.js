import { global, seededRandom, save, webWorker, power_generated, keyMultiplier, sizeApproximation } from './vars.js';
import { loc } from './locale.js';
import { defineIndustry } from './industry.js';
import { setJobName, jobScale, loadFoundry } from './jobs.js';
import { vBind, clearElement, popover, removeFromQueue, removeFromRQueue, calc_mastery, gameLoop, getEaster, getHalloween, randomKey, modRes, messageQueue } from './functions.js';
import { setResourceName, atomic_mass } from './resources.js';
import { buildGarrison, govEffect, govTitle, armyRating, govCivics } from './civics.js';
import { govActive, removeTask, defineGovernor } from './governor.js';
import { unlockAchieve, unlockFeat, alevel } from './achieve.js';
import { highPopAdjust, teamster } from './prod.js';
import { actions, checkTechQualifications, drawCity, drawTech, structName, initStruct } from './actions.js';
import { arpa } from './arpa.js';
import { renderEdenic } from './edenic.js';
import { events, eventList } from './events.js';
import { swissKnife } from './tech.js';
import { warhead, big_bang } from './resets.js';

const date = new Date();
const easter = getEaster();
const hallowed = getHalloween();

export const neg_roll_traits = ['angry','arrogant','atrophy','diverse','dumb','fragrant','frail','freespirit','gluttony','gnawer','greedy','hard_of_hearing','heavy','hooved','invertebrate','lazy','mistrustful','nearsighted','nyctophilia','paranoid','pathetic','pessimistic','puny','pyrophobia','skittish','slow','slow_regen','snowy','solitary','unorganized'];

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

export const genus_traits = {
    humanoid: {
        adaptable: 1,
        wasteful: 1
    },
    carnivore: {
        carnivore: 1,
        beast: 1,
        cautious: 1
    },
    herbivore: {
        herbivore: 1,
        instinct: 1
    },
    omnivore: {
        forager: 1,
        beast: 1,
        cautious: 1,
        instinct: 1
    },
    small: {
        small: 1,
        weak: 1
    },
    giant: {
        large: 1,
        strong: 1
    },
    reptilian: {
        cold_blooded: 1,
        scales: 1
    },
    avian: {
        flier: 1,
        hollow_bones: 1,
        sky_lover: 1,
    },
    insectoid: {
        high_pop: 1,
        fast_growth: 1,
        high_metabolism: 1
    },
    plant: {
        sappy: 1,
        asymmetrical: 1
    },
    fungi: {
        detritivore: 1,
        spongy: 1
    },
    aquatic: {
        submerged: 1,
        low_light: 1
    },
    fey: {
        elusive: 1,
        iron_allergy: 1
    },
    heat: {
        smoldering: 1,
        cold_intolerance: 1
    },
    polar: {
        chilled: 1,
        heat_intolerance: 1
    },
    sand: {
        scavenger: 1,
        nomadic: 1
    },
    demonic: {
        immoral: 1,
        evil: 1,
        soul_eater: 1
    },
    angelic: {
        blissful: 1,
        pompous: 1,
        holy: 1
    },
    synthetic: {
        artifical: 1,
        powered: 1
    },
    eldritch: {
        psychic: 1,
        tormented: 1,
        darkness: 1,
        unfathomable: 1
    },
    hybrid: {}
};

export const traits = {
    adaptable: { // Genetic Mutations occur faster from gene tampering
        name: loc('trait_adaptable_name'),
        desc: loc('trait_adaptable'),
        type: 'genus',
        val: 3,
        vars(r){ 
            switch (r || traitRank('adaptable') || 1){
                case 0.1:
                    return [2];
                case 0.25:
                    return [3];
                case 0.5:
                    return [5];
                case 1:
                    return [10];
                case 2:
                    return [15];
                case 3:
                    return [20];
                case 4:
                    return [25];
            }
        },
    },
    wasteful: { // Craftings cost more materials
        name: loc('trait_wasteful_name'),
        desc: loc('trait_wasteful'),
        type: 'genus',
        val: -3,
        vars(r){ 
            switch (r || traitRank('wasteful') || 1){
                case 0.1:
                    return [16];
                case 0.25:
                    return [14];
                case 0.5:
                    return [12];
                case 1:
                    return [10];
                case 2:
                    return [6];
                case 3:
                    return [4];
                case 4:
                    return [2];
            }
        },
    },
    xenophobic: { // Trade posts suffer a -1 penalty per post
        name: loc('trait_xenophobic_name'),
        desc: loc('trait_xenophobic'),
        type: 'genus',
        val: -5,
    },
    carnivore: { // No agriculture tech tree path, however unemployed citizens now act as hunters.
        name: loc('trait_carnivore_name'),
        desc: loc('trait_carnivore'),
        type: 'genus',
        val: 3,
        vars(r){ 
            // [Rot Percent]
            switch (r || traitRank('carnivore') || 1){
                case 0.1:
                    return [70];
                case 0.25:
                    return [65];
                case 0.5:
                    return [60];
                case 1:
                    return [50];
                case 2:
                    return [40];
                case 3:
                    return [35];
                case 4:
                    return [30];
            }
        },
    },
    beast: { // Improved hunting and soldier training
        name: loc('trait_beast_name'),
        desc: loc('trait_beast'),
        type: 'genus',
        val: 2,
        vars(r){
            // [Hunting, Windy Hunting, Training Speed]
            switch (r || traitRank('beast') || 1){
                case 0.1:
                    return [3,6,3];
                case 0.25:
                    return [4,8,4];
                case 0.5:
                    return [5,10,5];
                case 1:
                    return [8,15,10];
                case 2:
                    return [10,20,15];
                case 3:
                    return [12,24,20];
                case 4:
                    return [14,28,25];
            }
        },
    },
    cautious: { // Rain reduces combat rating
        name: loc('trait_cautious_name'),
        desc: loc('trait_cautious'),
        type: 'genus',
        val: -2,
        vars(r){ 
            switch (r || traitRank('cautious') || 1){
                case 0.1:
                    return [16];
                case 0.25:
                    return [14];
                case 0.5:
                    return [12];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [4];
            }
        },
    },
    herbivore: { // No food is gained from hunting
        name: loc('trait_herbivore_name'),
        desc: loc('trait_herbivore'),
        type: 'genus',
        val: -7,
    },
    instinct: { // Avoids Danger
        name: loc('trait_instinct_name'),
        desc: loc('trait_instinct'),
        type: 'genus',
        val: 5,
        vars(r){
            // [Surveyor Survival Boost, Reduce Combat Deaths %]
            switch (r || traitRank('instinct') || 1){
                case 0.1:
                    return [2,10];
                case 0.25:
                    return [3,15];
                case 0.5:
                    return [5,25];
                case 1:
                    return [10,50];
                case 2:
                    return [15,60];
                case 3:
                    return [20,65];
                case 4:
                    return [25,70];
            }
        },
    },
    forager: { // Will eat just about anything
        name: loc('trait_forager_name'),
        desc: loc('trait_forager'),
        type: 'genus',
        val: 4,
        vars(r){
            // [Foraging Strength]
            switch (r || traitRank('forager') || 1){
                case 0.1:
                    return [70];
                case 0.25:
                    return [80];
                case 0.5:
                    return [90];
                case 1:
                    return [100];
                case 2:
                    return [110];
                case 3:
                    return [120];
                case 4:
                    return [130];
            }
        },
    },
    small: { // Reduces cost creep multipliers by 0.01
        name: loc('trait_small_name'),
        desc: loc('trait_small'),
        type: 'genus',
        val: 6,
        vars(r){
            // [Planet Creep, Space Creep]
            switch (r || traitRank('small') || 1){
                case 0.1:
                    return [0.0015,0.001];
                case 0.25:
                    return [0.0025,0.0015];
                case 0.5:
                    return [0.005,0.0025];
                case 1:
                    return [0.01,0.005];
                case 2:
                    return [0.0125,0.006];
                case 3:
                    return [0.015,0.0075];
                case 4:
                    return [0.016,0.008];
            }
        },
    },
    weak: { // Lumberjacks, miners, and quarry workers are 10% less effective
        name: loc('trait_weak_name'),
        desc: loc('trait_weak'),
        type: 'genus',
        val: -3,
        vars(r){
            switch (r || traitRank('weak') || 1){
                case 0.1:
                    return [16];
                case 0.25:
                    return [14];
                case 0.5:
                    return [12];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [4];
            }
        },
    },
    large: { // Increases plantery cost creep multipliers by 0.005
        name: loc('trait_large_name'),
        desc: loc('trait_large'),
        type: 'genus',
        val: -5,
        vars(r){
            switch (r || traitRank('large') || 1){
                case 0.1:
                    return [0.008];
                case 0.25:
                    return [0.007];
                case 0.5:
                    return [0.006];
                case 1:
                    return [0.005];
                case 2:
                    return [0.004];
                case 3:
                    return [0.003];
                case 4:
                    return [0.002];
            }
        },
    },
    strong: { // Increased manual resource gain
        name: loc('trait_strong_name'),
        desc: loc('trait_strong'),
        type: 'genus',
        val: 5,
        vars(r){
            // [Manual Gathering, Basic Jobs]
            switch (r || traitRank('strong') || 1){
                case 0.1:
                    return [2,1.1];
                case 0.25:
                    return [2,1.25];
                case 0.5:
                    return [3,1.5];
                case 1:
                    return [4,2];
                case 2:
                    return [5,2.25];
                case 3:
                    return [6,2.5];
                case 4:
                    return [7,2.75];
            }
        },
    },
    cold_blooded: { // Weather affects productivity
        name: loc('trait_cold_blooded_name'),
        desc: loc('trait_cold_blooded'),
        type: 'genus',
        val: -2,
        vars(r){
            // [Weather Penalty, Weather Bonus]
            switch (r || traitRank('cold_blooded') || 1){
                case 0.25:
                    return [30,6];
                case 0.5:
                    return [25,8];
                case 1:
                    return [20,10];
                case 2:
                    return [15,15];
                case 3:
                    return [12,18];
                case 4:
                    return [10,20];
            }
        },
    },
    scales: { // Minor decrease of soldiers killed in combat
        name: loc('trait_scales_name'),
        desc: loc('trait_scales'),
        type: 'genus',
        val: 5,
        vars(r){
            // [Win, Loss, Hell]
            switch (r || traitRank('scales') || 1){
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
        name: loc('trait_flier_name'),
        desc: loc('trait_flier'),
        type: 'genus',
        val: 3,
        vars(r){
            // [Reduce Stone Costs, Extra Trade Post Route]
            switch (r || traitRank('flier') || 1){
                case 0.1:
                    return [5,0];
                case 0.25:
                    return [10,0];
                case 0.5:
                    return [15,0];
                case 1:
                    return [25,1];
                case 2:
                    return [40,1];
                case 3:
                    return [50,2];
                case 4:
                    return [60,2];
            }
        },
    },
    hollow_bones: { // Less Crafted Materials Needed
        name: loc('trait_hollow_bones_name'),
        desc: loc('trait_hollow_bones'),
        type: 'genus',
        val: 2,
        vars(r){
            switch (r || traitRank('hollow_bones') || 1){
                case 0.1:
                    return [1];
                case 0.25:
                    return [2];
                case 0.5:
                    return [3];
                case 1:
                    return [5];
                case 2:
                    return [8];
                case 3:
                    return [10];
                case 4:
                    return [12]
            }
        },
    },
    sky_lover: { // Mining type jobs more stressful
        name: loc('trait_sky_lover_name'),
        desc: loc('trait_sky_lover'),
        type: 'genus',
        val: -2,
        vars(r){
            switch (r || traitRank('sky_lover') || 1){
                case 0.1:
                    return [50];
                case 0.25:
                    return [40];
                case 0.5:
                    return [30];
                case 1:
                    return [20];
                case 2:
                    return [15];
                case 3:
                    return [10];
                case 4:
                    return [8];
            }
        },
    },
    rigid: { // Crafting production lowered slightly
        name: loc('trait_rigid_name'),
        desc: loc('trait_rigid'),
        type: 'genus',
        val: -2,
        vars(r){
            switch (r || traitRank('rigid') || 1){
                case 0.1:
                    return [4];
                case 0.25:
                    return [3];
                case 0.5:
                    return [2];
                case 1:
                    return [1];
                case 2:
                    return [0.5];
                case 3:
                    return [0.4];
                case 4:
                    return [0.3];
            }
        },
    },
    high_pop: { // Population is higher, but less productive
        name: loc('trait_high_pop_name'),
        desc: loc('trait_high_pop'),
        type: 'genus',
        val: 3,
        vars(r){
            // [Citizen Cap, Worker Effectiveness, Growth Multiplier]
            switch (r || traitRank('high_pop') || 1){
                case 0.1:
                    return [2, 50, 1.2];
                case 0.25:
                    return [2, 50, 1.5];
                case 0.5:
                    return [3, 34, 2.5];
                case 1:
                    return [4, 26, 3.5];
                case 2:
                    return [5, 21.2, 4.5];
                case 3:
                    return [6, 18, 5.5];
                case 4:
                    return [7, 15.8, 6.5];
            }
        },
    },
    fast_growth: { // Greatly increases odds of population growth each cycle
        name: loc('trait_fast_growth_name'),
        desc: loc('trait_fast_growth'),
        type: 'genus',
        val: 2,
        vars(r){
            // [bound multi, bound add]
            switch (r || traitRank('fast_growth') || 1){
                case 0.1:
                    return [1.2,1];
                case 0.25:
                    return [1.5,1];
                case 0.5:
                    return [2,1];
                case 1:
                    return [2,2];
                case 2:
                    return [2.5,3];
                case 3:
                    return [3,3];
                case 4:
                    return [3.5,3];
            }
        },
    },
    high_metabolism: { // Food requirements increased by 5%
        name: loc('trait_high_metabolism_name'),
        desc: loc('trait_high_metabolism'),
        type: 'genus',
        val: -1,
        vars(r){
            switch (r || traitRank('high_metabolism') || 1){
                case 0.1:
                    return [12];
                case 0.25:
                    return [10];
                case 0.5:
                    return [8];
                case 1:
                    return [5];
                case 2:
                    return [3];
                case 3:
                    return [2];
                case 4:
                    return [1];
            }
        },
    },
    photosynth: { // Reduces food requirements dependant on sunshine.
        name: loc('trait_photosynth_name'),
        desc: loc('trait_photosynth'),
        type: 'genus',
        val: 3,
        vars(r){
            // [Sunny, Cloudy, Rainy]
            switch (r || traitRank('photosynth') || 1){
                case 0.1:
                    return [5,4,3];
                case 0.25:
                    return [10,5,4];
                case 0.5:
                    return [20,10,5];
                case 1:
                    return [40,20,10];
                case 2:
                    return [50,30,15];
                case 3:
                    return [60,35,20];
                case 4:
                    return [70,40,25];
            }
        },
    },
    sappy: { // Stone is replaced with Amber.
        name: loc('trait_sappy_name'),
        desc: loc('trait_sappy',[loc('resource_Amber_name')]),
        type: 'genus',
        val: 4,
        vars(r){
            switch (r || traitRank('sappy') || 1){
                case 0.1:
                    return [0.3];
                case 0.25:
                    return [0.4];
                case 0.5:
                    return [0.5];
                case 1:
                    return [0.6];
                case 2:
                    return [0.65];
                case 3:
                    return [0.7];
                case 4:
                    return [0.75];
            }
        },
    },
    asymmetrical: { // Trade selling prices are slightly worse then normal
        name: loc('trait_asymmetrical_name'),
        desc: loc('trait_asymmetrical'),
        type: 'genus',
        val: -3,
        vars(r){
            switch (r || traitRank('asymmetrical') || 1){
                case 0.1:
                    return [35];
                case 0.25:
                    return [30];
                case 0.5:
                    return [25];
                case 1:
                    return [20];
                case 2:
                    return [15];
                case 3:
                    return [10];
                case 4:
                    return [5];
            }
        },
    },
    detritivore: { // You eat dead matter
        name: loc('trait_detritivore_name'),
        desc: loc('trait_detritivore'),
        type: 'genus',
        val: 2,
        vars(r){
            switch (r || traitRank('detritivore') || 1){
                case 0.1:
                    return [60];
                case 0.25:
                    return [65];
                case 0.5:
                    return [72];
                case 1:
                    return [80];
                case 2:
                    return [85];
                case 3:
                    return [90];
                case 4:
                    return [95];
            }
        },
    },
    spores: { // Birthrate increased when it's windy
        name: loc('trait_spores_name'),
        desc: loc('trait_spores'),
        type: 'genus',
        val: 2,
        vars(r){
            // [Bound Add, Bound Multi, Bound Add Parasite]
            switch (r || traitRank('spores') || 1){
                case 0.1:
                    return [1,1.2,1];
                case 0.25:
                    return [1,1.5,1];
                case 0.5:
                    return [2,1.5,1];
                case 1:
                    return [2,2,1];
                case 2:
                    return [2,2.5,2];
                case 3:
                    return [2,3,2];
                case 4:
                    return [3,3.5,2];
            }
        },
    },
    spongy: { // Birthrate decreased when it's raining
        name: loc('trait_spongy_name'),
        desc: loc('trait_spongy'),
        type: 'genus',
        val: -2,
    },
    submerged: { // Immune to weather effects
        name: loc('trait_submerged_name'),
        desc: loc('trait_submerged'),
        type: 'genus',
        val: 3,
    },
    low_light: { // Farming effectiveness decreased
        name: loc('trait_low_light_name'),
        desc: loc('trait_low_light'),
        type: 'genus',
        val: -2,
        vars(r){
            switch (r || traitRank('low_light') || 1){
                case 0.1:
                    return [16];
                case 0.25:
                    return [14];
                case 0.5:
                    return [12];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [4];
            }
        },
    },
    elusive: { // Spies are never caught
        name: loc('trait_elusive_name'),
        desc: loc('trait_elusive'),
        type: 'genus',
        val: 7,
        vars(r){
            switch (r || traitRank('elusive') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [10];
                case 0.5:
                    return [15];
                case 1:
                    return [20];
                case 2:
                    return [25];
                case 3:
                    return [30];
                case 4:
                    return [35];
            }
        },
    },
    iron_allergy: { // Iron mining reduced
        name: loc('trait_iron_allergy_name'),
        desc: loc('trait_iron_allergy'),
        type: 'genus',
        val: -4,
        vars(r){
            switch (r || traitRank('iron_allergy') || 1){
                case 0.1:
                    return [45];
                case 0.25:
                    return [40];
                case 0.5:
                    return [35];
                case 1:
                    return [25];
                case 2:
                    return [18];
                case 3:
                    return [15];
                case 4:
                    return [12];
            }
        },
    },
    smoldering: { // Hot weather is a bonus
        name: loc('trait_smoldering_name'),
        desc: loc('trait_smoldering'),
        type: 'genus',
        val: 7,
        vars(r){
            // [Seasonal Morale, Hot Bonus, High Hot Bonus]
            switch (r || traitRank('smoldering') || 1){
                case 0.1:
                    return [2,0.1,0.06];
                case 0.25:
                    return [3,0.14,0.08];
                case 0.5:
                    return [4,0.18,0.1];
                case 1:
                    return [5,0.35,0.2];
                case 2:
                    return [10,0.38,0.22];
                case 3:
                    return [12,0.4,0.24];
                case 4:
                    return [14,0.42,0.25];
            }
        },
    },
    cold_intolerance: { // Cold weather is a detriment
        name: loc('trait_cold_intolerance_name'),
        desc: loc('trait_cold_intolerance'),
        type: 'genus',
        val: -4,
        vars(r){
            switch (r || traitRank('cold_intolerance') || 1){
                case 0.1:
                    return [0.4];
                case 0.25:
                    return [0.35];
                case 0.5:
                    return [0.3];
                case 1:
                    return [0.25];
                case 2:
                    return [0.2];
                case 3:
                    return [0.18];
                case 4:
                    return [0.16];
            }
        },
    },
    chilled: { // Cold weather is a bonus
        name: loc('trait_chilled_name'),
        desc: loc('trait_chilled'),
        type: 'genus',
        val: 7,
        vars(r){
            // [Seasonal Morale, Cold Bonus, High Cold Bonus, Snow Food Bonus, Cold Food Bonus, Sun Food Penalty]
            switch (r || traitRank('chilled') || 1){
                case 0.1:
                    return [1,0.12,0.06,3,2,22];
                case 0.25:
                    return [1,0.14,0.08,5,2,20];
                case 0.5:
                    return [2,0.18,0.1,10,5,18];
                case 1:
                    return [5,0.35,0.2,20,10,15];
                case 2:
                    return [10,0.38,0.22,25,12,10];
                case 3:
                    return [12,0.4,0.24,30,14,8];
                case 4:
                    return [14,0.42,0.25,35,15,6];
            }
        },
    },
    heat_intolerance: { // Hot weather is a detriment
        name: loc('trait_heat_intolerance_name'),
        desc: loc('trait_heat_intolerance'),
        type: 'genus',
        val: -4,
        vars(r){
            switch (r || traitRank('heat_intolerance') || 1){
                case 0.1:
                    return [0.4];
                case 0.25:
                    return [0.35];
                case 0.5:
                    return [0.3];
                case 1:
                    return [0.25];
                case 2:
                    return [0.2];
                case 3:
                    return [0.18];
                case 4:
                    return [0.16];
            }
        },
    },
    scavenger: { // scavenger job is always available
        name: loc('trait_scavenger_name'),
        desc: loc('trait_scavenger'),
        type: 'genus',
        val: 3,
        vars(r){
            // [impact, duel bonus]
            switch (r || traitRank('scavenger') || 1){
                case 0.1:
                    return [0.05,18];
                case 0.25:
                    return [0.08,20];
                case 0.5:
                    return [0.1,22];
                case 1:
                    return [0.12,25];
                case 2:
                    return [0.14,30];
                case 3:
                    return [0.16,32];
                case 4:
                    return [0.18,34];
            }
        },
    },
    nomadic: { // -1 Trade route from trade post
        name: loc('trait_nomadic_name'),
        desc: loc('trait_nomadic'),
        type: 'genus',
        val: -5,
    },
    immoral: { // Warmonger is a bonus instead of a penalty
        name: loc('trait_immoral_name'),
        desc: loc('trait_immoral'),
        type: 'genus',
        val: 4,
        vars(r){
            switch (r || traitRank('immoral') || 1){
                case 0.1:
                    return [-40];
                case 0.25:
                    return [-30];
                case 0.5:
                    return [-20];
                case 1:
                    return [0];
                case 2:
                    return [20];
                case 3:
                    return [30];
                case 4:
                    return [40];
            }
        },
    },
    evil: { // You are pure evil
        name: loc('trait_evil_name'),
        desc: loc('trait_evil'),
        type: 'genus',
        val: 0,
    },
    blissful: { // Low morale penalty is halved and citizens never riot.
        name: loc('trait_blissful_name'),
        desc: loc('trait_blissful'),
        type: 'genus',
        val: 3,
        vars(r){
            switch (r || traitRank('blissful') || 1){
                case 0.1:
                    return [75];
                case 0.25:
                    return [70];
                case 0.5:
                    return [60];
                case 1:
                    return [50];
                case 2:
                    return [40];
                case 3:
                    return [30];
                case 4:
                    return [25];
            }
        },
    },
    pompous: { // Professors are less effective
        name: loc('trait_pompous_name'),
        desc: loc('trait_pompous'),
        type: 'genus',
        val: -6,
        vars(r){
            switch (r || traitRank('pompous') || 1){
                case 0.1:
                    return [90];
                case 0.25:
                    return [85];
                case 0.5:
                    return [80];
                case 1:
                    return [75];
                case 2:
                    return [65];
                case 3:
                    return [58];
                case 4:
                    return [50];
            }
        },
    },
    holy: { // Combat Bonus in Hell
        name: loc('trait_holy_name'),
        desc: loc('trait_holy'),
        type: 'genus',
        val: 4,
        vars(r){
            // [Hell Army Bonus, Hell Suppression Bonus]
            switch (r || traitRank('holy') || 1){
                case 0.1:
                    return [20,5];
                case 0.25:
                    return [25,10];
                case 0.5:
                    return [30,15];
                case 1:
                    return [50,25];
                case 2:
                    return [60,35];
                case 3:
                    return [65,40];
                case 4:
                    return [70,45];
            }
        },
    },
    artifical: {
        name: loc('trait_artifical_name'),
        desc: loc('trait_artifical'),
        type: 'genus',
        val: 5,
        vars(r){
            // [Science Bonus]
            switch (r || traitRank('artifical') || 1){
                case 0.1:
                    return [3];
                case 0.25:
                    return [5];
                case 0.5:
                    return [10];
                case 1:
                    return [20];
                case 2:
                    return [25];
                case 3:
                    return [30];
                case 4:
                    return [35];
            }
        },
    },
    powered: {
        name: loc('trait_powered_name'),
        desc: loc('trait_powered'),
        type: 'genus',
        val: -6,
        vars(r){
            // [Power Req, Labor Boost]
            switch (r || traitRank('powered') || 1){
                case 0.1:
                    return [0.4,4];
                case 0.25:
                    return [0.35,5];
                case 0.5:
                    return [0.3,8];
                case 1:
                    return [0.2,16];
                case 2:
                    return [0.1,20];
                case 3:
                    return [0.05,24];
                case 4:
                    return [0.05,28];
            }
        },
    },
    psychic: {
        name: loc('trait_psychic_name'),
        desc: loc('trait_psychic'),
        type: 'genus',
        val: 10,
        vars(r){
            // [Mind Break Modifer, Thrall Modifer, Recharge Rate, Effect Strength]
            switch (r || traitRank('psychic') || 1){
                case 0.1:
                    return [0.2,4,0.01,15];
                case 0.25:
                    return [0.35,5,0.01,20];
                case 0.5:
                    return [0.65,10,0.025,30];
                case 1:
                    return [1,15,0.05,40];
                case 2:
                    return [1.25,20,0.075,50];
                case 3:
                    return [1.5,25,0.1,60];
                case 4:
                    return [1.65,30,0.12,65];
            }
        },
    },
    tormented: {
        name: loc('trait_tormented_name'),
        desc: loc('trait_tormented'),
        type: 'genus',
        val: -25,
        vars(r){
            // [Morale above 100% is greatly reduced]
            switch (r || traitRank('tormented') || 1){
                case 0.1:
                    return [99];
                case 0.25:
                    return [98];
                case 0.5:
                    return [95];
                case 1:
                    return [90];
                case 2:
                    return [80];
                case 3:
                    return [75];
                case 4:
                    return [70];
            }
        },
    },
    darkness: {
        name: loc('trait_darkness_name'),
        desc: loc('trait_darkness'),
        type: 'genus',
        val: 1,
        vars(r){
            // [Sunny Days less frequent]
            switch (r || traitRank('darkness') || 1){
                case 0.1:
                    return [0];
                case 0.25:
                    return [1];
                case 0.5:
                    return [2];
                case 1:
                    return [3];
                case 2:
                    return [4];
                case 3:
                    return [5];
                case 4:
                    return [6];
            }
        },
    },
    unfathomable: {
        name: loc('trait_unfathomable_name'),
        desc: loc('trait_unfathomable'),
        type: 'genus',
        val: 15,
        vars(r){
            // [Thrall Races, Catch Modifer, Thrall Effectiveness]
            switch (r || traitRank('unfathomable') || 1){
                case 0.1:
                    return [1,0.4,0.03];
                case 0.25:
                    return [1,0.5,0.05];
                case 0.5:
                    return [1,0.65,0.08];
                case 1:
                    return [2,0.8,0.1];
                case 2:
                    return [2,0.9,0.12];
                case 3:
                    return [3,1,0.13];
                case 4:
                    return [3,1.1,0.14];
            }
        },
    },
    creative: { // A.R.P.A. Projects are cheaper
        name: loc('trait_creative_name'),
        desc: loc('trait_creative'),
        type: 'major',
        val: 8,
        vars(r){
            switch (r || traitRank('creative') || 1){
                case 0.1:
                    return [0.001,3];
                case 0.25:
                    return [0.0015,5];
                case 0.5:
                    return [0.0025,10];
                case 1:
                    return [0.005,20];
                case 2:
                    return [0.006,22];
                case 3:
                    return [0.0065,24];
                case 4:
                    return [0.0068,26];
            }
        },
    },
    diverse: { // Training soldiers takes longer
        name: loc('trait_diverse_name'),
        desc: loc('trait_diverse'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || traitRank('diverse') || 1){
                case 0.1:
                    return [40];
                case 0.25:
                    return [35];
                case 0.5:
                    return [30];
                case 1:
                    return [25];
                case 2:
                    return [20];
                case 3:
                    return [15];
                case 4:
                    return [12];
            }
        },
    },
    studious: { // Professors generate an extra 0.25 Knowledge per second, Libraries provide 10% more knowledge cap
        name: loc('trait_studious_name'),
        desc: loc('trait_studious'),
        type: 'major',
        val: 2,
        vars(r){
            // [Prof Bonus, Library Bonus]
            switch (r || traitRank('studious') || 1){
                case 0.1:
                    return [0.08,4];
                case 0.25:
                    return [0.1,6];
                case 0.5:
                    return [0.15,8];
                case 1:
                    return [0.25,10];
                case 2:
                    return [0.35,12];
                case 3:
                    return [0.4,14];
                case 4:
                    return [0.45,16];
            }
        },
    },
    arrogant: { // Market prices are higher
        name: loc('trait_arrogant_name'),
        desc: loc('trait_arrogant'),
        type: 'major',
        val: -2,
        vars(r){
            switch (r || traitRank('arrogant') || 1){
                case 0.1:
                    return [16]
                case 0.25:
                    return [14];
                case 0.5:
                    return [12];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [5];
            }
        },
    },
    brute: { // Recruitment costs are 1/2 price
        name: loc('trait_brute_name'),
        desc: loc('trait_brute'),
        type: 'major',
        val: 7,
        vars(r){
            // [Merc Discount, Training Bonus]
            switch (r || traitRank('brute') || 1){
                case 0.1:
                    return [15,40];
                case 0.25:
                    return [20,50];
                case 0.5:
                    return [25,60];
                case 1:
                    return [50,100];
                case 2:
                    return [60,120];
                case 3:
                    return [65,140];
                case 4:
                    return [70,150];
            }
        },
    },
    angry: { // When hungry you get hangry, low food penalty is more severe
        name: loc('trait_angry_name'),
        desc: loc('trait_angry'),
        type: 'major',
        val: -1,
        vars(r){
            switch (r || traitRank('angry') || 1){
                case 0.1:
                    return [40];
                case 0.25:
                    return [35];
                case 0.5:
                    return [30];
                case 1:
                    return [25];
                case 2:
                    return [20];
                case 3:
                    return [15];
                case 4:
                    return [12];
            }
        },
    },
    lazy: { // All production is lowered when the temperature is hot
        name: loc('trait_lazy_name'),
        desc: loc('trait_lazy'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || traitRank('lazy') || 1){
                case 0.1:
                    return [16];
                case 0.25:
                    return [14];
                case 0.5:
                    return [12];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [5];
            }
        },
    },
    curious: { // University cap boosted by citizen count, curious random events
        name: loc('trait_curious_name'),
        desc: loc('trait_curious'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || traitRank('curious') || 1){
                case 0.1:
                    return [0.02];
                case 0.25:
                    return [0.03];
                case 0.5:
                    return [0.05];
                case 1:
                    return [0.1];
                case 2:
                    return [0.12];
                case 3:
                    return [0.13];
                case 4:
                    return [0.14];
            }
        },
    },
    pack_mentality: { // Cabins cost more, but cottages cost less.
        name: loc('trait_pack_mentality_name'),
        desc: loc('trait_pack_mentality'),
        type: 'major',
        val: 4,
        vars(r){
            // [Cabin Creep penatly, Cottage Creep bonus]
            switch (r || traitRank('pack_mentality') || 1){
                case 0.1:
                    return [0.03,0.014];
                case 0.25:
                    return [0.03,0.016];
                case 0.5:
                    return [0.03,0.018];
                case 1:
                    return [0.03,0.02];
                case 2:
                    return [0.026,0.022];
                case 3:
                    return [0.024,0.023];
                case 4:
                    return [0.022,0.024];
            }
        },
    },
    tracker: { // 20% increased gains from hunting
        name: loc('trait_tracker_name'),
        desc: loc('trait_tracker'),
        type: 'major',
        val: 2,
        vars(r){
            switch (r || traitRank('tracker') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [10];
                case 0.5:
                    return [15];
                case 1:
                    return [20];
                case 2:
                    return [25];
                case 3:
                    return [30];
                case 4:
                    return [35];
            }
        },
    },
    playful: { // Hunters are Happy
        name: loc('trait_playful_name'),
        desc: loc('trait_playful'),
        type: 'major',
        val: 5,
        vars(r){
            switch (r || traitRank('playful') || 1){
                case 0.1:
                    return [0.2];
                case 0.25:
                    return [0.3];
                case 0.5:
                    return [0.4];
                case 1:
                    return [0.5];
                case 2:
                    return [0.6];
                case 3:
                    return [0.7];
                case 4:
                    return [0.8];
            }
        },
    },
    freespirit: { // Job Stress is higher for those who must work mundane jobs
        name: loc('trait_freespirit_name'),
        desc: loc('trait_freespirit'),
        type: 'major',
        val: -3,
        vars(r){
            switch (r || traitRank('freespirit') || 1){
                case 0.1:
                    return [70];
                case 0.25:
                    return [65];
                case 0.5:
                    return [60];
                case 1:
                    return [50];
                case 2:
                    return [35];
                case 3:
                    return [25];
                case 4:
                    return [20];
            }
        },
    },
    beast_of_burden: { // Gains more loot during raids
        name: loc('trait_beast_of_burden_name'),
        desc: loc('trait_beast_of_burden'),
        type: 'major',
        val: 3
    },
    sniper: { // Weapon upgrades are more impactful
        name: loc('trait_sniper_name'),
        desc: loc('trait_sniper'),
        type: 'major',
        val: 6,
        vars(r){
            switch (r || traitRank('sniper') || 1){
                case 0.1:
                    return [3];
                case 0.25:
                    return [4];
                case 0.5:
                    return [6];
                case 1:
                    return [8];
                case 2:
                    return [9];
                case 3:
                    return [10];
                case 4:
                    return [11];
            }
        },
    },
    hooved: { // You require special footwear
        name: loc('trait_hooved_name'),
        desc: loc('trait_hooved'),
        type: 'major',
        val: -4,
        vars(r){
            // [Cost Adjustment]
            switch (r || traitRank('hooved') || 1){
                case 0.1:
                    return [140];
                case 0.25:
                    return [130];
                case 0.5:
                    return [120];
                case 1:
                    return [100];
                case 2:
                    return [80];
                case 3:
                    return [70];
                case 4:
                    return [60];
            }
        },
    },
    rage: { // Wounded soldiers rage with extra power
        name: loc('trait_rage_name'),
        desc: loc('trait_rage'),
        type: 'major',
        val: 4,
        vars(r){
            // [Rage Bonus, Wounded Bonus]
            switch (r || traitRank('rage') || 1){
                case 0.1:
                    return [0.2,10];
                case 0.25:
                    return [0.3,20];
                case 0.5:
                    return [0.5,30];
                case 1:
                    return [1,50];
                case 2:
                    return [1.25,60];
                case 3:
                    return [1.4,65];
                case 4:
                    return [1.5,70];
            }
        },
    },
    heavy: { // Some costs increased
        name: loc('trait_heavy_name'),
        desc: loc('trait_heavy'),
        type: 'major',
        val: -4,
        vars(r){
            // [Fuel Costs, Stone Cement and Wrought Iron Costs]
            switch (r || traitRank('heavy') || 1){
                case 0.1:
                    return [20,12];
                case 0.25:
                    return [18,10];
                case 0.5:
                    return [15,8];
                case 1:
                    return [10,5];
                case 2:
                    return [8,4];
                case 3:
                    return [6,3];
                case 4:
                    return [5,2];
            }
        },
    },
    gnawer: { // Population destroys lumber by chewing on it
        name: loc('trait_gnawer_name'),
        desc: loc('trait_gnawer'),
        type: 'major',
        val: -1,
        vars(r){
            switch (r || traitRank('gnawer') || 1){
                case 0.1:
                    return [0.6];
                case 0.25:
                    return [0.5];
                case 0.5:
                    return [0.4];
                case 1:
                    return [0.25];
                case 2:
                    return [0.2];
                case 3:
                    return [0.15];
                case 4:
                    return [0.12];
            }
        },
    },
    calm: { // Your are very calm, almost zen like
        name: loc('trait_calm_name'),
        desc: loc('trait_calm'),
        type: 'major',
        val: 6,
        vars(r){
            switch (r || traitRank('calm') || 1){
                case 0.1:
                    return [6];
                case 0.25:
                    return [7];
                case 0.5:
                    return [8];
                case 1:
                    return [10];
                case 2:
                    return [12];
                case 3:
                    return [13];
                case 4:
                    return [14];
            }
        },
    },
    pack_rat: { // Storage space is increased
        name: loc('trait_pack_rat_name'),
        desc: loc('trait_pack_rat'),
        type: 'major',
        val: 3,
        vars(r){
            // [Crate Bonus, Storage Bonus]
            switch (r || traitRank('pack_rat') || 1){
                case 0.1:
                    return [4,1];
                case 0.25:
                    return [5,2];
                case 0.5:
                    return [6,3];
                case 1:
                    return [10,5];
                case 2:
                    return [15,8];
                case 3:
                    return [20,10];
                case 4:
                    return [25,12];
            }
        },
    },
    paranoid: { // Bank capacity reduced by 10%
        name: loc('trait_paranoid_name'),
        desc: loc('trait_paranoid'),
        type: 'major',
        val: -3,
        vars(r){
            switch (r || traitRank('paranoid') || 1){
                case 0.1:
                    return [16];
                case 0.25:
                    return [14];
                case 0.5:
                    return [12];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [5];
            }
        },
    },
    greedy: { // Lowers income from taxes
        name: loc('trait_greedy_name'),
        desc: loc('trait_greedy'),
        type: 'major',
        val: -5,
        vars(r){
            switch (r || traitRank('greedy') || 1){
                case 0.1:
                    return [20];
                case 0.25:
                    return [17.5];
                case 0.5:
                    return [15];
                case 1:
                    return [12.5];
                case 2:
                    return [10];
                case 3:
                    return [8];
                case 4:
                    return [6];
            }
        },
    },
    merchant: { // Better commodity selling prices
        name: loc('trait_merchant_name'),
        desc: loc('trait_merchant'),
        type: 'major',
        val: 3,
        vars(r){
            // [Sell Price, Galactic Buy Volume]
            switch (r || traitRank('merchant') || 1){
                case 0.1:
                    return [5,2];
                case 0.25:
                    return [10,3];
                case 0.5:
                    return [15,5];
                case 1:
                    return [25,10];
                case 2:
                    return [35,12];
                case 3:
                    return [40,13];
                case 4:
                    return [45,14];
            }
        },
    },
    smart: { // Knowledge costs reduced by 10%
        name: loc('trait_smart_name'),
        desc: loc('trait_smart'),
        type: 'major',
        val: 6,
        vars(r){
            switch (r || traitRank('smart') || 1){
                case 0.1:
                    return [2];
                case 0.25:
                    return [3];
                case 0.5:
                    return [5];
                case 1:
                    return [10];
                case 2:
                    return [12];
                case 3:
                    return [13];
                case 4:
                    return [14];
            }
        },
    },
    puny: { // Lowers minium bound for army score roll
        name: loc('trait_puny_name'),
        desc: loc('trait_puny'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || traitRank('puny') || 1){
                case 0.1:
                    return [20];
                case 0.25:
                    return [18];
                case 0.5:
                    return [15];
                case 1:
                    return [10];
                case 2:
                    return [6];
                case 3:
                    return [4];
                case 4:
                    return [3];
            }
        },
    },
    dumb: { // Knowledge costs increased by 5%
        name: loc('trait_dumb_name'),
        desc: loc('trait_dumb'),
        type: 'major',
        val: -5,
        vars(r){
            switch (r || traitRank('dumb') || 1){
                case 0.1:
                    return [8];
                case 0.25:
                    return [7];
                case 0.5:
                    return [6];
                case 1:
                    return [5];
                case 2:
                    return [4];
                case 3:
                    return [3];
                case 4:
                    return [2];
            }
        },
    },
    tough: { // Mining output increased by 25%
        name: loc('trait_tough_name'),
        desc: loc('trait_tough'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || traitRank('tough') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [10];
                case 0.5:
                    return [15];
                case 1:
                    return [25];
                case 2:
                    return [35];
                case 3:
                    return [40];
                case 4:
                    return [45];
            }
        },
    },
    nearsighted: { // Libraries are less effective
        name: loc('trait_nearsighted_name'),
        desc: loc('trait_nearsighted'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || traitRank('nearsighted') || 1){
                case 0.1:
                    return [20];
                case 0.25:
                    return [18];
                case 0.5:
                    return [15];
                case 1:
                    return [12];
                case 2:
                    return [10];
                case 3:
                    return [8];
                case 4:
                    return [6];
            }
        },
    },
    intelligent: { // Professors and Scientists add a global production bonus
        name: loc('trait_intelligent_name'),
        desc: loc('trait_intelligent'),
        type: 'major',
        val: 7,
        vars(r){
            // [Prof Bonus, Scientist Bonus]
            switch (r || traitRank('intelligent') || 1){
                case 0.1:
                    return [0.05,0.1];
                case 0.25:
                    return [0.08,0.15];
                case 0.5:
                    return [0.1,0.2];
                case 1:
                    return [0.125,0.25];
                case 2:
                    return [0.14,0.3];
                case 3:
                    return [0.15,0.32];
                case 4:
                    return [0.16,0.34];
            }
        },
    },
    regenerative: { // Wounded soldiers heal 4x as fast
        name: loc('trait_regenerative_name'),
        desc: loc('trait_regenerative'),
        type: 'major',
        val: 8,
        vars(r){
            switch (r || traitRank('regenerative') || 1){
                case 0.1:
                    return [1];
                case 0.25:
                    return [2];
                case 0.5:
                    return [3];
                case 1:
                    return [4];
                case 2:
                    return [5];
                case 3:
                    return [6];
                case 4:
                    return [7];
            }
        },
    },
    gluttony: { // Eats 10% more food per rank
        name: loc('trait_gluttony_name'),
        desc: loc('trait_gluttony'),
        type: 'major',
        val: -2,
        vars(r){
            switch (r || traitRank('gluttony') || 1){
                case 0.1:
                    return [25];
                case 0.25:
                    return [20];
                case 0.5:
                    return [15];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [5];
            }
        },
    },
    slow: { // The game moves at a 10% slower pace
        name: loc('trait_slow_name'),
        desc: loc('trait_slow'),
        type: 'major',
        val: -6,
        vars(r){
            switch (r || traitRank('slow') || 1){
                case 0.1:
                    return [14];
                case 0.25:
                    return [13];
                case 0.5:
                    return [12];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [5];
            }
        },
    },
    armored: { // Less soldiers die in combat
        name: loc('trait_armored_name'),
        desc: loc('trait_armored'),
        type: 'major',
        val: 4,
        vars(r){
            // [Solder % death prevention, Hell Armor Bonus]
            switch (r || traitRank('armored') || 1){
                case 0.1:
                    return [10,0];
                case 0.25:
                    return [15,1];
                case 0.5:
                    return [25,1];
                case 1:
                    return [50,2];
                case 2:
                    return [70,2];
                case 3:
                    return [80,2];
                case 4:
                    return [85,2];
            }
        },
    },
    optimistic: { // Minor reduction to stress
        name: loc('trait_optimistic_name'),
        desc: loc('trait_optimistic'),
        type: 'major',
        val: 5,
        vars(r){
            switch (r || traitRank('optimistic') || 1){
                case 0.1:
                    return [3,4];
                case 0.25:
                    return [4,6];
                case 0.5:
                    return [5,8];
                case 1:
                    return [10,10];
                case 2:
                    return [15,13];
                case 3:
                    return [18,15];
                case 4:
                    return [20,16];
            }
        },
    },
    chameleon: { // Barracks have less soldiers
        name: loc('trait_chameleon_name'),
        desc: loc('trait_chameleon'),
        type: 'major',
        val: 6,
        vars(r){
            // [Combat Rating Bonus, Ambush Avoid]
            switch (r || traitRank('chameleon') || 1){
                case 0.1:
                    return [3,5];
                case 0.25:
                    return [5,10];
                case 0.5:
                    return [10,15];
                case 1:
                    return [20,20];
                case 2:
                    return [25,25];
                case 3:
                    return [30,30];
                case 4:
                    return [35,35];
            }
        },
    },
    slow_digestion: { // Your race is more resilient to starvation
        name: loc('trait_slow_digestion_name'),
        desc: loc('trait_slow_digestion'),
        type: 'major',
        val: 1,
        vars(r){
            switch (r || traitRank('slow_digestion') || 1){
                case 0.1:
                    return [0.2];
                case 0.25:
                    return [0.3];
                case 0.5:
                    return [0.5];
                case 1:
                    return [0.75];
                case 2:
                    return [1];
                case 3:
                    return [1.25];
                case 4:
                    return [1.4];
            }
        },
    },
    astrologer: { // Improved astrological effects
        name: loc('trait_astrologer_name'),
        desc: loc('trait_astrologer'),
        type: 'major',
        val: 3,
        vars(r){
            switch (r || traitRank('astrologer') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [10];
                case 0.5:
                    return [15];
                case 1:
                    return [20];
                case 2:
                    return [25];
                case 3:
                    return [30];
                case 4:
                    return [35];
            }
        },
    },
    hard_of_hearing: { // University science cap gain reduced by 5%
        name: loc('trait_hard_of_hearing_name'),
        desc: loc('trait_hard_of_hearing'),
        type: 'major',
        val: -3,
        vars(r){
            switch (r || traitRank('hard_of_hearing') || 1){
                case 0.1:
                    return [8];
                case 0.25:
                    return [7];
                case 0.5:
                    return [6];
                case 1:
                    return [5];
                case 2:
                    return [4];
                case 3:
                    return [3];
                case 4:
                    return [2];
            }
        },
    },
    resourceful: { // Crafting costs are reduced slightly
        name: loc('trait_resourceful_name'),
        desc: loc('trait_resourceful'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || traitRank('resourceful') || 1){
                case 0.1:
                    return [4];
                case 0.25:
                    return [6];
                case 0.5:
                    return [8];
                case 1:
                    return [12];
                case 2:
                    return [16];
                case 3:
                    return [18];
                case 4:
                    return [20];
            }
        },
    },
    selenophobia: { // Moon phase directly affects productivity, on average this is slightly negative
        name: loc('trait_selenophobia_name'),
        desc: loc('trait_selenophobia'),
        type: 'major',
        val: -6,
        vars(r){
            // [Max bonus]
            switch (r || traitRank('selenophobia') || 1){
                case 0.1:
                    return [1];
                case 0.25:
                    return [2];
                case 0.5:
                    return [3];
                case 1:
                    return [4];
                case 2:
                    return [5];
                case 3:
                    return [6];
                case 4:
                    return [7];
            }
        },
    },
    leathery: { // Morale penalty from some weather conditions are reduced.
        name: loc('trait_leathery_name'),
        desc: loc('trait_leathery'),
        type: 'major',
        val: 2,
        vars(r){
            // Morale loss (Base value is 5)
            switch (r || traitRank('leathery') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [4];
                case 0.5:
                    return [3];
                case 1:
                    return [2];
                case 2:
                    return [1];
                case 3:
                    return [0];
                case 4:
                    return [-1];
            }
        },
    },
    pessimistic: { // Minor increase to stress
        name: loc('trait_pessimistic_name'),
        desc: loc('trait_pessimistic'),
        type: 'major',
        val: -1,
        vars(r){
            switch (r || traitRank('pessimistic') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [4];
                case 0.5:
                    return [3];
                case 1:
                    return [2];
                case 2:
                    return [1];
                case 3:
                    return [1];
                case 4:
                    return [0];
            }
        },
    },
    hoarder: { // Banks can store 20% more money
        name: loc('trait_hoarder_name'),
        desc: loc('trait_hoarder'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || traitRank('hoarder') || 1){
                case 0.1:
                    return [3];
                case 0.25:
                    return [5];
                case 0.5:
                    return [10];
                case 1:
                    return [20];
                case 2:
                    return [25];
                case 3:
                    return [30];
                case 4:
                    return [35];
            }
        },
    },
    solitary: { // Cabins are cheaper however cottages cost more
        name: loc('trait_solitary_name'),
        desc: loc('trait_solitary'),
        type: 'major',
        val: -1,
        vars(r){
            // [Cabin Creep bonus, Cottage Creep malus]
            switch (r || traitRank('solitary') || 1){
                case 0.1:
                    return [0.01,0.03];
                case 0.25:
                    return [0.01,0.025];
                case 0.5:
                    return [0.01,0.02];
                case 1:
                    return [0.02,0.02];
                case 2:
                    return [0.025,0.02];
                case 3:
                    return [0.025,0.015];
                case 4:
                    return [0.028,0.012];
            }
        },
    },
    kindling_kindred: { // Lumber is no longer a resource, however other costs are increased for anything that would have used lumber to compensate.
        name: loc('trait_kindling_kindred_name'),
        desc: loc('trait_kindling_kindred'),
        type: 'major',
        val: 8,
        vars(r){
            switch (r || traitRank('kindling_kindred') || 1){
                case 0.1:
                    return [12];
                case 0.25:
                    return [10];
                case 0.5:
                    return [8];
                case 1:
                    return [5];
                case 2:
                    return [4];
                case 3:
                    return [3];
                case 4:
                    return [2];
            }
        },
    },
    iron_wood: { // Removes Plywood as a resource, adds attack bonus
        name: loc('trait_iron_wood_name'),
        desc: loc('trait_iron_wood'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || traitRank('iron_wood') || 1){
                case 0.1:
                    return [3];
                case 0.25:
                    return [6];
                case 0.5:
                    return [9];
                case 1:
                    return [12];
                case 2:
                    return [15];
                case 3:
                    return [18];
                case 4:
                    return [21];
            }
        },
    },
    pyrophobia: { // Smelter productivity is reduced
        name: loc('trait_pyrophobia_name'),
        desc: loc('trait_pyrophobia'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || traitRank('pyrophobia') || 1){
                case 0.1:
                    return [16];
                case 0.25:
                    return [14];
                case 0.5:
                    return [12];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [5];
            }
        }
    },
    hyper: { // The game moves at a 5% faster pace
        name: loc('trait_hyper_name'),
        desc: loc('trait_hyper'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || traitRank('hyper') || 1){
                case 0.1:
                    return [1];
                case 0.25:
                    return [2];
                case 0.5:
                    return [3];
                case 1:
                    return [5];
                case 2:
                    return [6];
                case 3:
                    return [7];
                case 4:
                    return [8];
            }
        }
    },
    skittish: { // Thunderstorms lower all production
        name: loc('trait_skittish_name'),
        desc: loc('trait_skittish'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || traitRank('skittish') || 1){
                case 0.1:
                    return [20];
                case 0.25:
                    return [18];
                case 0.5:
                    return [15];
                case 1:
                    return [12];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [4];
            }
        }
    },
    fragrant: { // Reduced Hunting effectiveness
        name: loc('trait_fragrant_name'),
        desc: loc('trait_fragrant'),
        type: 'major',
        val: -3,
        vars(r){
            switch (r || traitRank('fragrant') || 1){
                case 0.1:
                    return [40];
                case 0.25:
                    return [35];
                case 0.5:
                    return [30];
                case 1:
                    return [20];
                case 2:
                    return [15];
                case 3:
                    return [12];
                case 4:
                    return [10];
            }
        }
    },
    sticky: { // Food req lowered, Increase Combat Rating
        name: loc('trait_sticky_name'),
        desc: loc('trait_sticky'),
        type: 'major',
        val: 3,
        vars(r){
            // [Food Consumption, Army Bonus]
            switch (r || traitRank('sticky') || 1){
                case 0.1:
                    return [3,3];
                case 0.25:
                    return [5,5];
                case 0.5:
                    return [10,8];
                case 1:
                    return [20,15];
                case 2:
                    return [25,18];
                case 3:
                    return [30,20];
                case 4:
                    return [35,22];
            }
        }
    },
    infectious: { // Attacking has a chance to infect other creatures and grow your population
        name: loc('trait_infectious_name'),
        desc: loc('trait_infectious'),
        type: 'major',
        val: 4,
        vars(r){
            // [Ambush, Raid, Pillage, Assault, Siege]
            switch (r || traitRank('infectious') || 1){
                case 0.1:
                    return [1,2,3,6,15];
                case 0.25:
                    return [1,2,3,7,18];
                case 0.5:
                    return [1,2,4,8,20];
                case 1:
                    return [2,3,5,10,25];
                case 2:
                    return [2,4,6,12,30];
                case 3:
                    return [3,4,7,13,32];
                case 4:
                    return [3,5,8,14,34];
            }
        }
    },
    parasite: { // You can only reproduce by infecting victims, spores sometimes find a victim when it's windy
        name: loc('trait_parasite_name'),
        desc: loc('trait_parasite'),
        type: 'major',
        val: -4,
    },
    toxic: { // Factory type jobs are more productive
        name: loc('trait_toxic_name'),
        desc: loc('trait_toxic'),
        type: 'major',
        val: 5,
        vars(r){
            // [Lux Fur Alloy Polymer, Nano Stanene, Cement]
            switch (r || traitRank('toxic') || 1){
                case 0.1:
                    return [3,2,8];
                case 0.25:
                    return [5,3,10];
                case 0.5:
                    return [10,5,15];
                case 1:
                    return [20,8,30];
                case 2:
                    return [25,10,40];
                case 3:
                    return [30,12,45];
                case 4:
                    return [35,14,50];
            }
        }
    },
    nyctophilia: { // Productivity is lost when it is sunny
        name: loc('trait_nyctophilia_name'),
        desc: loc('trait_nyctophilia'),
        type: 'major',
        val: -3,
        vars(r){
            // [Sunny, Cloudy]
            switch (r || traitRank('nyctophilia') || 1){
                case 0.1:
                    return [12,6];
                case 0.25:
                    return [10,6];
                case 0.5:
                    return [8,5];
                case 1:
                    return [5,2];
                case 2:
                    return [3,1];
                case 3:
                    return [2,1];
                case 4:
                    return [1,1];
            }
        }
    },
    infiltrator: { // Cheap spies and sometimes steal tech from rivals
        name: loc('trait_infiltrator_name'),
        desc: loc('trait_infiltrator'),
        type: 'major',
        val: 4,
        vars(r){ // [Steal Cap]
            switch (r || traitRank('infiltrator') || 1){
                case 0.1:
                    return [120];
                case 0.25:
                    return [110];
                case 0.5:
                    return [100];
                case 1:
                    return [90];
                case 2:
                    return [85];
                case 3:
                    return [80];
                case 4:
                    return [75];
            }
        }
    },
    hibernator: { // Lower activity during winter
        name: loc('trait_hibernator_name'),
        desc: loc('trait_hibernator'),
        type: 'major',
        val: -3,
        vars(r){
            // [Food Consumption, Production]
            switch (r || traitRank('hibernator') || 1){
                case 0.1:
                    return [10,10];
                case 0.25:
                    return [15,9];
                case 0.5:
                    return [20,8];
                case 1:
                    return [25,8];
                case 2:
                    return [30,6];
                case 3:
                    return [35,5];
                case 4:
                    return [40,4];
            }
        }
    },
    cannibalize: { // Eat your own for buffs
        name: loc('trait_cannibalize_name'),
        desc: loc('trait_cannibalize'),
        type: 'major',
        val: 5,
        vars(r){
            switch (r || traitRank('cannibalize') || 1){
                case 0.1:
                    return [6];
                case 0.25:
                    return [8];
                case 0.5:
                    return [10];
                case 1:
                    return [15];
                case 2:
                    return [20];
                case 3:
                    return [22];
                case 4:
                    return [24];
            }
        }
    },
    frail: { // More soldiers die in combat
        name: loc('trait_frail_name'),
        desc: loc('trait_frail'),
        type: 'major',
        val: -5,
        vars(r){
            // [Win Deaths, Loss Deaths]
            switch (r || traitRank('frail') || 1){
                case 0.1:
                    return [2,3];
                case 0.25:
                    return [2,2];
                case 0.5:
                    return [1,2];
                case 1:
                    return [1,1];
                case 2:
                    return [1,1];
                case 3:
                    return [1,0];
                case 4:
                    return [1,0];
            }
        }
    },
    malnutrition: { // The rationing penalty is weaker
        name: loc('trait_malnutrition_name'),
        desc: loc('trait_malnutrition'),
        type: 'major',
        val: 1,
        vars(r){
            switch (r || traitRank('malnutrition') || 1){
                case 0.1:
                    return [8];
                case 0.25:
                    return [10];
                case 0.5:
                    return [12];
                case 1:
                    return [25];
                case 2:
                    return [40];
                case 3:
                    return [50];
                case 4:
                    return [60];
            }
        }
    },
    claws: { // Raises maximum bound for army score roll
        name: loc('trait_claws_name'),
        desc: loc('trait_claws'),
        type: 'major',
        val: 5,
        vars(r){
            switch (r || traitRank('claws') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [8];
                case 0.5:
                    return [12];
                case 1:
                    return [25];
                case 2:
                    return [32];
                case 3:
                    return [35];
                case 4:
                    return [38];
            }
        }
    },
    atrophy: { // More prone to starvation
        name: loc('trait_atrophy_name'),
        desc: loc('trait_atrophy'),
        type: 'major',
        val: -1,
        vars(r){
            switch (r || traitRank('atrophy') || 1){
                case 0.1:
                    return [0.4];
                case 0.25:
                    return [0.35];
                case 0.5:
                    return [0.25];
                case 1:
                    return [0.15];
                case 2:
                    return [0.1];
                case 3:
                    return [0.08];
                case 4:
                    return [0.06];
            }
        }
    },
    hivemind: { // Jobs with low citizen counts assigned to them have reduced output, but those with high numbers have increased output.
        name: loc('trait_hivemind_name'),
        desc: loc('trait_hivemind'),
        type: 'major',
        val: 9,
        vars(r){
            switch (r || traitRank('hivemind') || 1){
                case 0.1:
                    return [13];
                case 0.25:
                    return [12];
                case 0.5:
                    return [11];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [7];
                case 4:
                    return [6];
            }
        }
    },
    tunneler: { // Mines and Coal Mines are cheaper.
        name: loc('trait_tunneler_name'),
        desc: loc('trait_tunneler'),
        type: 'major',
        val: 2,
        vars(r){
            switch (r || traitRank('tunneler') || 1){
                case 0.1:
                    return [0.001];
                case 0.25:
                    return [0.002];
                case 0.5:
                    return [0.005];
                case 1:
                    return [0.01];
                case 2:
                    return [0.015];
                case 3:
                    return [0.018];
                case 4:
                    return [0.02];
            }
        }
    },
    blood_thirst: { // Combat causes a temporary increase in morale
        name: loc('trait_blood_thirst_name'),
        desc: loc('trait_blood_thirst'),
        type: 'major',
        val: 5,
        vars(r){
            // [Cap]
            switch (r || traitRank('blood_thirst') || 1){
                case 0.1:
                    return [150000];
                case 0.25:
                    return [250000];
                case 0.5:
                    return [500000];
                case 1:
                    return [1000000];
                case 2:
                    return [2000000];
                case 3:
                    return [4000000];
                case 4:
                    return [5000000];
            }
        }
    },
    apex_predator: { // Hunting and Combat ratings are significantly higher, but you can't use armor
        name: loc('trait_apex_predator_name'),
        desc: loc('trait_apex_predator'),
        type: 'major',
        val: 6,
        vars(r){
            // [Combat, Hunting]
            switch (r || traitRank('apex_predator') || 1){
                case 0.1:
                    return [10,15];
                case 0.25:
                    return [15,20];
                case 0.5:
                    return [20,30];
                case 1:
                    return [30,50];
                case 2:
                    return [40,60];
                case 3:
                    return [45,65];
                case 4:
                    return [50,70];
            }
        }
    },
    invertebrate: { // You have no bones
        name: loc('trait_invertebrate_name'),
        desc: loc('trait_invertebrate'),
        type: 'major',
        val: -2,
        vars(r){
            switch (r || traitRank('invertebrate') || 1){
                case 0.1:
                    return [30];
                case 0.25:
                    return [25];
                case 0.5:
                    return [20];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [5];
                case 4:
                    return [4];
            }
        }
    },
    suction_grip: { // Global productivity boost
        name: loc('trait_suction_grip_name'),
        desc: loc('trait_suction_grip'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || traitRank('suction_grip') || 1){
                case 0.1:
                    return [3];
                case 0.25:
                    return [5];
                case 0.5:
                    return [6];
                case 1:
                    return [8];
                case 2:
                    return [12];
                case 3:
                    return [14];
                case 4:
                    return [15];
            }
        }
    },
    befuddle: { // Spy actions complete in 1/2 time
        name: loc('trait_befuddle_name'),
        desc: loc('trait_befuddle'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || traitRank('befuddle') || 1){
                case 0.1:
                    return [10];
                case 0.25:
                    return [20];
                case 0.5:
                    return [30];
                case 1:
                    return [50];
                case 2:
                    return [75];
                case 3:
                    return [85];
                case 4:
                    return [90];
            }
        }
    },
    environmentalist: { // Use renewable energy instead of dirtly coal & oil power.
        name: loc('trait_environmentalist_name'),
        desc: loc('trait_environmentalist'),
        type: 'major',
        val: -5,
    },
    unorganized: { // Increased time between revolutions
        name: loc('trait_unorganized_name'),
        desc: loc('trait_unorganized'),
        type: 'major',
        val: -2,
        vars(r){
            switch (r || traitRank('unorganized') || 1){
                case 0.1:
                    return [100];
                case 0.25:
                    return [90];
                case 0.5:
                    return [80];
                case 1:
                    return [50];
                case 2:
                    return [40];
                case 3:
                    return [30];
                case 4:
                    return [25];
            }
        }
    },
    musical: { // Entertainers are more effective
        name: loc('trait_musical_name'),
        desc: loc('trait_musical'),
        type: 'major',
        val: 5,
        vars(r){
            switch (r || traitRank('musical') || 1){
                case 0.1:
                    return [0.15];
                case 0.25:
                    return [0.25];
                case 0.5:
                    return [0.5];
                case 1:
                    return [1];
                case 2:
                    return [1.1];
                case 3:
                    return [1.2];
                case 4:
                    return [1.25];
            }
        }
    },
    revive: { // Soldiers sometimes self res
        name: loc('trait_revive_name'),
        desc: loc('trait_revive'),
        type: 'major',
        val: 4,
        vars(r){
            // [cold win, normal win, hot win, cold loss, normal loss, hot loss, hell]
            switch (r || traitRank('revive') || 1){
                case 0.1:
                    return [8,6,2,9,7,3.5,4];
                case 0.25:
                    return [7,5,2,8,6,3,4];
                case 0.5:
                    return [6,4,2,7,5,2.5,4];
                case 1:
                    return [5,3,1.5,6,4,2,3];
                case 2:
                    return [4,2,1,5,3,1.5,2];
                case 3:
                    return [3,1.5,1,4,2.5,1,2];
                case 4:
                    return [2.5,1.2,1,3.5,2,1,2];
            }
        }
    },
    slow_regen: { // Your soldiers wounds heal slower.
        name: loc('trait_slow_regen_name'),
        desc: loc('trait_slow_regen'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || traitRank('slow_regen') || 1){
                case 0.1:
                    return [45];
                case 0.25:
                    return [40];
                case 0.5:
                    return [35];
                case 1:
                    return [25];
                case 2:
                    return [20];
                case 3:
                    return [15];
                case 4:
                    return [12];
            }
        }
    },
    forge: { // Smelters do not require fuel, boosts geothermal power
        name: loc('trait_forge_name'),
        desc: loc('trait_forge'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || traitRank('forge') || 1){
                case 0.1:
                    return [0.25];
                case 0.25:
                    return [0.5];
                case 0.5:
                    return [1];
                case 1:
                    return [2];
                case 2:
                    return [2.5];
                case 3:
                    return [3];
                case 4:
                    return [3.5];
            }
        }
    },
    autoignition: { // Library knowledge bonus reduced
        name: loc('trait_autoignition_name'),
        desc: loc('trait_autoignition'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || traitRank('autoignition') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [4];
                case 0.5:
                    return [3];
                case 1:
                    return [2];
                case 2:
                    return [1.5];
                case 3:
                    return [1];
                case 4:
                    return [0.5];
            }
        }
    },
    blurry: { // Increased success chance of spies // Warlord improves Reapers
        name: loc('trait_blurry_name'),
        desc: loc('trait_blurry'),
        type: 'major',
        val: 5,
        vars(r){
            switch (r || traitRank('blurry') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [10];
                case 0.5:
                    return [15];
                case 1:
                    return [25];
                case 2:
                    return [35];
                case 3:
                    return [40];
                case 4:
                    return [45];
            }
        }
    },
    snowy: { // You lose morale if it's not snowing
        name: loc('trait_snowy_name'),
        desc: loc('trait_snowy'),
        type: 'major',
        val: -3,
        vars(r){
            // [Not Hot, Hot]
            switch (r || traitRank('snowy') || 1){
                case 0.1:
                    return [5,12];
                case 0.25:
                    return [4,10];
                case 0.5:
                    return [3,8];
                case 1:
                    return [2,5];
                case 2:
                    return [2,4];
                case 3:
                    return [1,3];
                case 4:
                    return [1,2];
            }
        }
    },
    ravenous: { // Drastically increases food consumption
        name: loc('trait_ravenous_name'),
        desc: loc('trait_ravenous'),
        type: 'major',
        val: -5,
        vars(r){
            // [Extra Food Consumed, Stockpile Divisor]
            switch (r || traitRank('ravenous') || 1){
                case 0.1:
                    return [35,2];
                case 0.25:
                    return [30,2];
                case 0.5:
                    return [25,2];
                case 1:
                    return [20,3];
                case 2:
                    return [15,4];
                case 3:
                    return [10,4];
                case 4:
                    return [8,4];
            }
        }
    },
    ghostly: { // More souls from hunting and soul wells, increased soul gem drop chance
        name: loc('trait_ghostly_name'),
        desc: loc('trait_ghostly'),
        type: 'major',
        val: 5,
        vars(r){
            // [Hunting Food, Soul Well Food, Soul Gem Adjust]
            switch (r || traitRank('ghostly') || 1){
                case 0.1:
                    return [15,1.1,2];
                case 0.25:
                    return [20,1.2,5];
                case 0.5:
                    return [25,1.25,10];
                case 1:
                    return [50,1.5,15];
                case 2:
                    return [60,1.6,20];
                case 3:
                    return [65,1.7,22];
                case 4:
                    return [70,1.8,23];
            }
        }
    },
    lawless: { // Government lockout timer is reduced by 90%
        name: loc('trait_lawless_name'),
        desc: loc('trait_lawless'),
        type: 'major',
        val: 3,
        vars(r){
            switch (r || traitRank('lawless') || 1){
                case 0.1:
                    return [20];
                case 0.25:
                    return [30];
                case 0.5:
                    return [50];
                case 1:
                    return [90];
                case 2:
                    return [95];
                case 3:
                    return [98];
                case 4:
                    return [99];
            }
        }
    },
    mistrustful: { // Lose standing with rival cities quicker
        name: loc('trait_mistrustful_name'),
        desc: loc('trait_mistrustful'),
        type: 'major',
        val: -1,
        vars(r){
            switch (r || traitRank('mistrustful') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [4];
                case 0.5:
                    return [3];
                case 1:
                    return [2];
                case 2:
                    return [2];
                case 3:
                    return [1];
                case 4:
                    return [1];
            }
        }
    },
    humpback: { // Starvation resistance and miner/lumberjack boost
        name: loc('trait_humpback_name'),
        desc: loc('trait_humpback'),
        type: 'major',
        val: 4,
        vars(r){
            // [Starve Resist, Miner/Lumber boost]
            switch (r || traitRank('humpback') || 1){
                case 0.1:
                    return [0.15, 5];
                case 0.25:
                    return [0.2, 8];
                case 0.5:
                    return [0.25, 10];
                case 1:
                    return [0.5, 20];
                case 2:
                    return [0.75, 25];
                case 3:
                    return [0.8, 30];
                case 4:
                    return [0.85, 35];
            }
        }
    },
    thalassophobia: { // Wharves are unavailable
        name: loc('trait_thalassophobia_name'),
        desc: loc('trait_thalassophobia'),
        type: 'major',
        val: -4,
    },
    fiery: { // Major war bonus
        name: loc('trait_fiery_name'),
        desc: loc('trait_fiery'),
        type: 'major',
        val: 10,
        vars(r){
            // [Combat Bonus, Hunting Bonus]
            switch (r || traitRank('fiery') || 1){
                case 0.1:
                    return [20,12];
                case 0.25:
                    return [30,15];
                case 0.5:
                    return [40,18];
                case 1:
                    return [65,25];
                case 2:
                    return [70,35];
                case 3:
                    return [72,38];
                case 4:
                    return [74,40];
            }
        }
    },
    terrifying: { // No one will trade with you
        name: loc('trait_terrifying_name'),
        desc: loc('trait_terrifying'),
        type: 'major',
        val: 6,
        vars(r){
            // [Titanium Low Roll, Titanium High Roll]
            switch (r || traitRank('terrifying') || 1){
                case 0.1:
                    return [6,15];
                case 0.25:
                    return [8,20];
                case 0.5:
                    return [10,25];
                case 1:
                    return [12,32];
                case 2:
                    return [13,34];
                case 3:
                    return [14,36];
                case 4:
                    return [15,38];
            }
        }
    },
    slaver: { // You capture victims and force them to work for you
        name: loc('trait_slaver_name'),
        desc: loc('trait_slaver'),
        type: 'major',
        val: 12,
        vars(r){
            switch (r || traitRank('slaver') || 1){
                case 0.1:
                    return [0.05];
                case 0.25:
                    return [0.1];
                case 0.5:
                    return [0.14];
                case 1:
                    return [0.28];
                case 2:
                    return [0.3];
                case 3:
                    return [0.32];
                case 4:
                    return [0.33];
            }
        }
    },
    compact: { // You hardly take up any space at all
        name: loc('trait_compact_name'),
        desc: loc('trait_compact'),
        type: 'major',
        val: 10,
        vars(r){
            // [Planet Creep, Space Creep]
            switch (r || traitRank('compact') || 1){
                case 0.1:
                    return [0.003,0.002];
                case 0.25:
                    return [0.005,0.003];
                case 0.5:
                    return [0.01,0.005];
                case 1:
                    return [0.015,0.0075];
                case 2:
                    return [0.018,0.0085];
                case 3:
                    return [0.02,0.009];
                case 4:
                    return [0.021,0.0092];
            }
        }
    },
    conniving: { // Better trade deals
        name: loc('trait_conniving_name'),
        desc: loc('trait_conniving'),
        type: 'major',
        val: 4,
        vars(r){
            // [Buy Price, Sell Price]
            switch (r || traitRank('conniving') || 1){
                case 0.1:
                    return [1,6];
                case 0.25:
                    return [2,8];
                case 0.5:
                    return [3,10];
                case 1:
                    return [5,15];
                case 2:
                    return [8,20];
                case 3:
                    return [10,24];
                case 4:
                    return [12,28];
            }
        }
    },
    pathetic: { // You suck at combat
        name: loc('trait_pathetic_name'),
        desc: loc('trait_pathetic'),
        type: 'major',
        val: -5,
        vars(r){
            switch (r || traitRank('pathetic') || 1){
                case 0.1:
                    return [40];
                case 0.25:
                    return [35];
                case 0.5:
                    return [30];
                case 1:
                    return [25];
                case 2:
                    return [20];
                case 3:
                    return [15];
                case 4:
                    return [12];
            }
        }
    },
    spiritual: { // Temples are 13% more effective
        name: loc('trait_spiritual_name'),
        desc: loc('trait_spiritual'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || traitRank('spiritual') || 1){
                case 0.1:
                    return [6];
                case 0.25:
                    return [8];
                case 0.5:
                    return [10];
                case 1:
                    return [13];
                case 2:
                    return [15];
                case 3:
                    return [18];
                case 4:
                    return [20];
            }
        }
    },
    truthful: { // Bankers are less effective
        name: loc('trait_truthful_name'),
        desc: loc('trait_truthful'),
        type: 'major',
        val: -7,
        vars(r){
            switch (r || traitRank('truthful') || 1){
                case 0.1:
                    return [85];
                case 0.25:
                    return [75];
                case 0.5:
                    return [65];
                case 1:
                    return [50];
                case 2:
                    return [30];
                case 3:
                    return [20];
                case 4:
                    return [15];
            }
        }
    },
    unified: { // Start with unification
        name: loc('trait_unified_name'),
        desc: loc('trait_unified'),
        type: 'major',
        val: 4,
        vars(r){
            // [Bonus to unification]
            switch (r || traitRank('unified') || 1){
                case 0.1:
                    return [0];
                case 0.25:
                    return [1];
                case 0.5:
                    return [2];
                case 1:
                    return [3];
                case 2:
                    return [5];
                case 3:
                    return [7];
                case 4:
                    return [8];
            }
        }
    },
    rainbow: { // Gain a bonus if sunny after raining
        name: loc('trait_rainbow_name'),
        desc: loc('trait_rainbow'),
        type: 'major',
        val: 3,
        vars(r){
            switch (r || traitRank('rainbow') || 1){
                case 0.1:
                    return [10];
                case 0.25:
                    return [20];
                case 0.5:
                    return [30];
                case 1:
                    return [50];
                case 2:
                    return [80];
                case 3:
                    return [100];
                case 4:
                    return [120];
            }
        }
    },
    gloomy: { // Gain a bonus if cloudy
        name: loc('trait_gloomy_name'),
        desc: loc('trait_gloomy'),
        type: 'major',
        val: 3,
        vars(r){
            switch (r || traitRank('gloomy') || 1){
                case 0.1:
                    return [3];
                case 0.25:
                    return [5];
                case 0.5:
                    return [8];
                case 1:
                    return [10];
                case 2:
                    return [12];
                case 3:
                    return [13];
                case 4:
                    return [14];
            }
        }
    },
    magnificent: { // construct shrines to receive boons
        name: loc('trait_magnificent_name'),
        desc: loc('trait_magnificent'),
        type: 'major',
        val: 6,
        vars(r){
            // [Knowledge Base, Knowledge Scale, Tax Bonus, Metal Bonus, Morale Bonus]
            switch (r || traitRank('magnificent') || 1){
                case 0.1:
                    return [250, 1, 0.35, 0.65, 0.5];
                case 0.25:
                    return [300, 1, 0.5, 0.75, 1];
                case 0.5:
                    return [350, 2, 0.75, 0.8, 1];
                case 1:
                    return [400, 3, 1, 1, 1];
                case 2:
                    return [450, 3, 1.5, 1.5, 1.5];
                case 3:
                    return [500, 3, 2, 2, 2];
                case 4:
                    return [520, 3, 2.5, 2,5, 2.5];
            }
        }
    },
    noble: { // Unable to raise taxes above base value or set very low taxes
        name: loc('trait_noble_name'),
        desc: loc('trait_noble'),
        type: 'major',
        val: -3,
        vars(r){
            // [min tax, max tax]
            switch (r || traitRank('noble') || 1){
                case 0.1:
                    return [18,20];
                case 0.25:
                    return [15,20];
                case 0.5:
                    return [12,20];
                case 1:
                    return [10,20];
                case 2:
                    return [10,24];
                case 3:
                    return [10,28];
                case 4:
                    return [10,30];
            }
        }
    },
    imitation: { // You are an imitation of another species
        name: loc('trait_imitation_name'),
        desc: loc('trait_imitation'),
        type: 'major',
        val: 6,
        vars(r){
            // [Postitive Trait Rank, Negative Trait Rank]
            switch (r || traitRank('imitation') || 1){
                case 0.1:
                    return [0.5,0.1]
                case 0.25:
                    return [0.5,0.25];
                case 0.5:
                    return [0.5,0.5];
                case 1:
                    return [0.5,1];
                case 2:
                    return [0.5,2];
                case 3:
                    return [0.5,3];
                case 4:
                    return [0.5,4];
            }
        }
    },
    emotionless: { // You have no emotions, cold logic dictates your decisions
        name: loc('trait_emotionless_name'),
        desc: loc('trait_emotionless'),
        type: 'major',
        val: -4,
        vars(r){
            // [Entertainer Reduction, Stress Reduction]
            switch (r || traitRank('emotionless') || 1){
                case 0.1:
                    return [55,8];
                case 0.25:
                    return [50,10];
                case 0.5:
                    return [45,10];
                case 1:
                    return [35,13];
                case 2:
                    return [25,15];
                case 3:
                    return [20,15];
                case 4:
                    return [18,16];
            }
        }
    },
    logical: { // Citizens add Knowledge
        name: loc('trait_logical_name'),
        desc: loc('trait_logical'),
        type: 'major',
        val: 6,
        vars(r){
            // [Reduce Wardenclyffe Knowledge Cost, Knowledge per Citizen]
            switch (r || traitRank('logical') || 1){
                case 0.1:
                    return [10,5];
                case 0.25:
                    return [25,10];
                case 0.5:
                    return [50,15];
                case 1:
                    return [100,25];
                case 2:
                    return [125,30];
                case 3:
                    return [150,32];
                case 4:
                    return [160,33];
            }
        }
    },
    shapeshifter: {
        name: loc('trait_shapeshifter_name'),
        desc: loc('trait_shapeshifter'),
        type: 'major',
        val: 10,
        vars(r){
            // [Postitive Trait Rank, Negative Trait Rank]
            switch (r || traitRank('shapeshifter') || 1){
                case 0.1:
                    return [0.5,0.1];
                case 0.25:
                    return [0.5,0.25];
                case 0.5:
                    return [0.5,0.5];
                case 1:
                    return [0.5,1];
                case 2:
                    return [0.5,2];
                case 3:
                    return [0.5,3];
                case 4:
                    return [0.5,4];
            }
        }
    },
    deconstructor: {
        name: loc('trait_deconstructor_name'),
        desc: loc('trait_deconstructor'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || traitRank('deconstructor') || 1){
                case 0.1:
                    return [25]
                case 0.25:
                    return [40];
                case 0.5:
                    return [60];
                case 1:
                    return [100];
                case 2:
                    return [125];
                case 3:
                    return [140];
                case 4:
                    return [150];
            }
        }
    },
    linked: {
        name: loc('trait_linked_name'),
        desc: loc('trait_linked'),
        type: 'major',
        val: 4,
        vars(r){
            // [Quantum Bonus per Citizen, Softcap]
            switch (r || traitRank('linked') || 1){
                case 0.1:
                    return [0.02,40];
                case 0.25:
                    return [0.03,40];
                case 0.5:
                    return [0.05,40];
                case 1:
                    return [0.1,80];
                case 2:
                    return [0.12,100];
                case 3:
                    return [0.14,100];
                case 4:
                    return [0.15,100];
            }
        }
    },
    dark_dweller: {
        name: loc('trait_dark_dweller_name'),
        desc: loc('trait_dark_dweller'),
        type: 'major',
        val: -3,
        vars(r){
            switch (r || traitRank('dark_dweller') || 1){
                case 0.1:
                    return [99];
                case 0.25:
                    return [90];
                case 0.5:
                    return [75];
                case 1:
                    return [60];
                case 2:
                    return [45];
                case 3:
                    return [30];
                case 4:
                    return [25];
            }
        }
    },
    swift: {
        name: loc('trait_swift_name'),
        desc: loc('trait_swift'),
        type: 'major',
        val: 10,
        vars(r){
            // [Combat Bonus, Thrall Catch Bonus]
            switch (r || traitRank('swift') || 1){
                case 0.1:
                    return [20,8];
                case 0.25:
                    return [35,15];
                case 0.5:
                    return [55,30];
                case 1:
                    return [75,45];
                case 2:
                    return [85,55];
                case 3:
                    return [90,65];
                case 4:
                    return [92,70];
            }
        }
    },
    anthropophagite: {
        name: loc('trait_anthropophagite_name'),
        desc: loc('trait_anthropophagite'),
        type: 'major',
        val: -2,
        vars(r){
            switch (r || traitRank('anthropophagite') || 1){
                case 0.1:
                    return [0.25];
                case 0.25:
                    return [0.4];
                case 0.5:
                    return [0.65];
                case 1:
                    return [1];
                case 2:
                    return [1.5];
                case 3:
                    return [2];
                case 4:
                    return [2.5];
            }
        }
    },
    living_tool: {
        name: loc('trait_living_tool_name'),
        desc: loc('trait_living_tool'),
        type: 'major',
        val: 12,
        vars(r){
            // [Tool Factor, Crafting Factor]
            switch (r || traitRank('living_tool') || 1){
                case 0.1:
                    return [0.5,2];
                case 0.25:
                    return [0.65,5];
                case 0.5:
                    return [0.8,12];
                case 1:
                    return [1,25];
                case 2:
                    return [1.1,35];
                case 3:
                    return [1.2,42];
                case 4:
                    return [1.25,45];
            }
        }
    },
    bloated: {
        name: loc('trait_bloated_name'),
        desc: loc('trait_bloated'),
        type: 'major',
        val: -10,
        vars(r){
            // [Costs are higher]
            switch (r || traitRank('bloated') || 1){
                case 0.1:
                    return [30];
                case 0.25:
                    return [25];
                case 0.5:
                    return [20];
                case 1:
                    return [15];
                case 2:
                    return [10];
                case 3:
                    return [6];
                case 4:
                    return [4];
            }
        }
    },
    artisan: {
        name: loc('trait_artisan_name'),
        desc: loc('trait_artisan'),
        type: 'major',
        val: 9,
        vars(r){
            // [Auto Crafting Boost, Manufacturing Boost, Improved Morale]
            switch (r || traitRank('artisan') || 1){
                case 0.1:
                    return [15,8,0.15];
                case 0.25:
                    return [20,10,0.2];
                case 0.5:
                    return [35,15,0.35];
                case 1:
                    return [50,20,0.5];
                case 2:
                    return [60,25,0.55];
                case 3:
                    return [70,30,0.6];
                case 4:
                    return [80,35,0.65];
            }
        }
    },
    stubborn: {
        name: loc('trait_stubborn_name'),
        desc: loc('trait_stubborn'),
        type: 'major',
        val: -5,
        vars(r){
            // Raises Knowledge cost of scientific advancements
            switch (r || traitRank('stubborn') || 1){
                case 0.1:
                    return [20];
                case 0.25:
                    return [18];
                case 0.5:
                    return [14];
                case 1:
                    return [10];
                case 2:
                    return [6];
                case 3:
                    return [4];
                case 4:
                    return [3];
            }
        }
    },
    rogue: {
        name: loc('trait_rogue_name'),
        desc: loc('trait_rogue'),
        type: 'major',
        val: 6,
        vars(r){
            // [Randomly Steal Things]
            switch (r || traitRank('rogue') || 1){
                case 0.1:
                    return [4];
                case 0.25:
                    return [6];
                case 0.5:
                    return [8];
                case 1:
                    return [10];
                case 2:
                    return [12];
                case 3:
                    return [14];
                case 4:
                    return [16];
            }
        }
    },
    untrustworthy: {
        name: loc('trait_untrustworthy_name'),
        desc: loc('trait_untrustworthy'),
        type: 'major',
        val: -4,
        vars(r){
            // [Financial Institutions Cost Extra]
            switch (r || traitRank('untrustworthy') || 1){
                case 0.1:
                    return [8];
                case 0.25:
                    return [7];
                case 0.5:
                    return [6];
                case 1:
                    return [5];
                case 2:
                    return [4];
                case 3:
                    return [3];
                case 4:
                    return [2];
            }
        }
    },
    living_materials: {
        name: loc('trait_living_materials_name'),
        desc: loc('trait_living_materials'),
        type: 'major',
        val: 6,
        vars(r){
            // [Some building materials self replicate reducing cost of the next building]
            // [Lumber/Bone, Plywood/Boneweave, Furs/Flesh, Amber (not Stone/Clay)]
            switch (r || traitRank('living_materials') || 1){
                case 0.1:
                    return [0.995];
                case 0.25:
                    return [0.99];
                case 0.5:
                    return [0.98];
                case 1:
                    return [0.97];
                case 2:
                    return [0.96];
                case 3:
                    return [0.95];
                case 4:
                    return [0.94];
            }
        }
    },
    unstable: {
        name: loc('trait_unstable_name'),
        desc: loc('trait_unstable'),
        type: 'major',
        val: -5,
        vars(r){
            // [Randomly Die]
            switch (r || traitRank('unstable') || 1){
                case 0.1:
                    return [7,10];
                case 0.25:
                    return [6,10];
                case 0.5:
                    return [5,10];
                case 1:
                    return [4,10];
                case 2:
                    return [3,10];
                case 3:
                    return [2,10];
                case 4:
                    return [1,10];
            }
        }
    },
    elemental: {
        name: loc('trait_elemental_name'),
        desc: loc('trait_elemental'),
        type: 'major',
        val: 5,
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

            // [Element, Electric, Acid, Fire, Frost, Combat]
            // [Type, Power, Industry, Smelting, Bioscience, Combat]
            switch (r || traitRank('elemental') || 1){
                case 0.1:
                    return [element, 0.08, 0.01, 0.02, 0.005, 1];
                case 0.25:
                    return [element, 0.12, 0.02, 0.03, 0.01, 2];
                case 0.5:
                    return [element, 0.16, 0.04, 0.06, 0.02, 4];
                case 1:
                    return [element, 0.2, 0.06, 0.09, 0.03, 6];
                case 2:
                    return [element, 0.23, 0.08, 0.12, 0.04, 8];
                case 3:
                    return [element, 0.26, 0.10, 0.15, 0.05, 10];
                case 4:
                    return [element, 0.28, 0.12, 0.18, 0.06, 12];
            }
        }
    },
    chicken: {
        name: loc('trait_chicken_name'),
        desc: loc('trait_chicken'),
        type: 'major',
        val: -8,
        vars(r){
            // [Hell Worse, Piracy Worse, Events Worse]
            switch (r || traitRank('chicken') || 1){
                case 0.1:
                    return [110,20];
                case 0.25:
                    return [100,18];
                case 0.5:
                    return [75,15];
                case 1:
                    return [50,12];
                case 2:
                    return [40,9];
                case 3:
                    return [30,6];
                case 4:
                    return [20,3];
            }
        }
    },
    tusk: {
        name: loc('trait_tusk_name'),
        desc: loc('trait_tusk'),
        type: 'major',
        val: 6,
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

            if (global.city.calendar.weather === 0 && global.city.calendar.temp > 0){
                moisture += 10;
            }

            // [Mining based on Attack, Attack Bonus]
            switch (r || traitRank('tusk') || 1){
                case 0.1:
                    return [80,Math.round(moisture * 0.4)];
                case 0.25:
                    return [100,Math.round(moisture * 0.5)];
                case 0.5:
                    return [130,Math.round(moisture * 0.75)];
                case 1:
                    return [160,Math.round(moisture * 1)];
                case 2:
                    return [190,Math.round(moisture * 1.2)];
                case 3:
                    return [220,Math.round(moisture * 1.4)];
                case 4:
                    return [250,Math.round(moisture * 1.6)];
            }
        }
    },
    blubber: {
        name: loc('trait_blubber_name'),
        desc: loc('trait_blubber'),
        type: 'major',
        val: -3,
        vars(r){
            // [Refine your dead to make Oil]
            switch (r || traitRank('blubber') || 1){
                case 0.1:
                    return [2.5];
                case 0.25:
                    return [2];
                case 0.5:
                    return [1.5];
                case 1:
                    return [1];
                case 2:
                    return [0.75];
                case 3:
                    return [0.5];
                case 4:
                    return [0.25];
            }
        }
    },
    ocular_power: {
        name: loc('trait_ocular_power_name'),
        desc: loc('trait_ocular_power'),
        type: 'major',
        val: 9,
        vars(r){
            // [Powers Active, Power Scaling]
            switch (r || traitRank('ocular_power') || 1){
                case 0.1:
                    return [1, 10];
                case 0.25:
                    return [1, 25];
                case 0.5:
                    return [1, 50];
                case 1:
                    return [2, 75];
                case 2:
                    return [2, 100];
                case 3:
                    return [3, 125];
                case 4:
                    return [3, 150];
            }
        }
    },
    floating: {
        name: loc('trait_floating_name'),
        desc: loc('trait_floating'),
        type: 'major',
        val: -3,
        vars(r){
            // [Wind lowers production]
            switch (r || traitRank('floating') || 1){
                case 0.1:
                    return [16];
                case 0.25:
                    return [14];
                case 0.5:
                    return [12];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [4];
            }
        }
    },
    wish: {
        name: loc('trait_wish_name'),
        desc: loc('trait_wish'),
        type: 'major',
        val: 13,
        vars(r){
            // [Wish Cooldown Period]
            switch (r || traitRank('wish') || 1){
                case 0.1:
                    return [2520];
                case 0.25:
                    return [2160];
                case 0.5:
                    return [1800];
                case 1:
                    return [1440];
                case 2:
                    return [1080];
                case 3:
                    return [720];
                case 4:
                    return [540];
            }
        }
    },
    devious: {
        name: loc('trait_devious_name'),
        desc: loc('trait_devious'),
        type: 'major',
        val: -4,
        vars(r){
            // [Trade Less Productive]
            switch (r || traitRank('devious') || 1){
                case 0.1:
                    return [35];
                case 0.25:
                    return [30];
                case 0.5:
                    return [25];
                case 1:
                    return [20];
                case 2:
                    return [15];
                case 3:
                    return [10];
                case 4:
                    return [8];
            }
        }
    },
    grenadier: {
        name: loc('trait_grenadier_name'),
        desc: loc('trait_grenadier'),
        type: 'major',
        val: 6,
        vars(r){
            // [More Powerful Soldiers but less of them]
            switch (r || traitRank('grenadier') || 1){
                case 0.1:
                    return [100];
                case 0.25:
                    return [110];
                case 0.5:
                    return [125];
                case 1:
                    return [150];
                case 2:
                    return [175];
                case 3:
                    return [200];
                case 4:
                    return [225];
            }
        }
    },
    aggressive: {
        name: loc('trait_aggressive_name'),
        desc: loc('trait_aggressive'),
        type: 'major',
        val: -2,
        vars(r){
            // [Major Death, Minor Death]
            switch (r || traitRank('aggressive') || 1){
                case 0.1:
                    return [35,14]
                case 0.25:
                    return [30,12];
                case 0.5:
                    return [25,10];
                case 1:
                    return [20,8];
                case 2:
                    return [15,6];
                case 3:
                    return [10,4];
                case 4:
                    return [5,2];
            }
        }
    },
    empowered: {
        name: loc('trait_empowered_name'),
        desc: loc('trait_empowered'),
        type: 'major',
        val: 8,
        vars(r){
            // [Boosts Other Traits]
            switch (r || traitRank('empowered') || 1){
                case 0.1:
                    return [-1,2];
                case 0.25:
                    return [-2,3];
                case 0.5:
                    return [-3,4];
                case 1:
                    return [-4,6];
                case 2:
                    return [-6,9];
                case 3:
                    return [-8,12];
                case 4:
                    return [-99,99];
            }
        }
    },
    blasphemous: {
        name: loc('trait_blasphemous_name'),
        desc: loc('trait_blasphemous'),
        type: 'major',
        val: -5,
        vars(r){
            // [Temples less effective]
            switch (r || traitRank('blasphemous') || 1){
                case 0.1:
                    return [25];
                case 0.25:
                    return [20];
                case 0.5:
                    return [15];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [4];
            }
        }
    },
    ooze: { // you are some kind of ooze, everything is bad
        name: loc('trait_ooze_name'),
        desc: loc('trait_ooze'),
        type: 'major',
        val: -50,
        vars(r){
            // [All jobs worse, Theology weaker, Mastery weaker]
            switch (r || traitRank('ooze') || 1){
                case 0.1:
                    return [25,30,50];
                case 0.25:
                    return [20,25,40];
                case 0.5:
                    return [15,20,35];
                case 1:
                    return [12,15,30];
                case 2:
                    return [10,12,25];
                case 3:
                    return [8,10,20];
                case 4:
                    return [6,8,18];
            }
        }
    },
    soul_eater: { // You eat souls for breakfast, lunch, and dinner
        name: loc('trait_soul_eater_name'),
        desc: loc('trait_soul_eater'),
        type: 'special',
        val: 0,
    },
    untapped: { // Untapped Potential
        name: loc('trait_untapped_name'),
        desc: loc('trait_untapped'),
        type: 'special',
        val: 0,
    },
    emfield: { // Your body produces a natural electromagnetic field that disrupts electriciy
        name: loc('trait_emfield_name'),
        desc: loc('trait_emfield'),
        type: 'special',
        val: -20,
    },
    tactical: { // War Bonus
        name: loc('trait_tactical_name'),
        desc: loc('trait_tactical'),
        type: 'minor',
        vars(r){ return [5]; },
    },
    analytical: { // Science Bonus
        name: loc('trait_analytical_name'),
        desc: loc('trait_analytical'),
        type: 'minor',
        vars(r){ return [1]; },
    },
    promiscuous: { // Organics Growth Bonus, Synths Population Discount
        name: loc('trait_promiscuous_name'),
        desc: loc('trait_promiscuous'),
        type: 'minor',
        vars(r){ return [1,0.02]; },
    },
    resilient: { // Coal Mining Bonus
        name: loc('trait_resilient_name'),
        desc: loc('trait_resilient'),
        type: 'minor',
        vars(r){ return [2]; },
    },
    cunning: { // Hunting Bonus
        name: loc('trait_cunning_name'),
        desc: loc('trait_cunning'),
        type: 'minor',
        vars(r){ return [5]; },
    },
    hardy: { // Factory Woker Bonus
        name: loc('trait_hardy_name'),
        desc: loc('trait_hardy'),
        type: 'minor',
        vars(r){ return [1]; },
    },
    ambidextrous: { // Crafting Bonus
        name: loc('trait_ambidextrous_name'),
        desc: loc('trait_ambidextrous'),
        type: 'minor',
        vars(r){ return [3,2]; },
    },
    industrious: { // Miner Bonus
        name: loc('trait_industrious_name'),
        desc: loc('trait_industrious'),
        type: 'minor',
        vars(r){ return [2]; },
    },
    content: { // Morale Bonus
        name: loc('trait_content_name'),
        desc: loc('trait_content'),
        type: 'minor',
    },
    fibroblast: { // Healing Bonus
        name: loc('trait_fibroblast_name'),
        desc: loc('trait_fibroblast'),
        type: 'minor',
        vars(r){ return [2]; },
    },
    metallurgist: { // Alloy bonus
        name: loc('trait_metallurgist_name'),
        desc: loc('trait_metallurgist'),
        type: 'minor',
        vars(r){ return [4]; },
    },
    gambler: { // Casino bonus
        name: loc('trait_gambler_name'),
        desc: loc('trait_gambler'),
        type: 'minor',
        vars(r){ return [4]; },
    },
    persuasive: { // Trade bonus
        name: loc('trait_persuasive_name'),
        desc: loc('trait_persuasive'),
        type: 'minor',
        vars(r){ return [1]; },
    },
    fortify: { // gene fortification
        name: loc('trait_fortify_name'),
        desc: loc('trait_fortify'),
        type: 'special',
    },
    mastery: { // mastery booster
        name: loc('trait_mastery_name'),
        desc: loc('trait_mastery'),
        type: 'special',
        vars(r){ return [1]; },
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
            hard_of_hearing: 1
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
            pyrophobia: 1
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
            sticky: 1
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
            thalassophobia: 1
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
            empowered: 1,
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
    hellspawn: {
        name: loc('race_hellspawn'),
        desc: loc('race_hellspawn_desc'),
        type: 'demonic',
        home: loc('race_hellspawn_home'),
        entity: loc('race_hellspawn_entity'),
        traits: {},
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
    eldritch: {}
};

Object.keys(genusVars).forEach(function(k){
    let g = k === 'organism' ? 'humanoid' : k;
    genusVars[k]['solar'] = {
        titan: loc(`genus_${g}_solar_titan`),
        enceladus: loc(`genus_${g}_solar_enceladus`),
        triton: loc(`genus_${g}_solar_triton`),
        eris: loc(`genus_${g}_solar_eris`),
    }
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
        for (let i=0; i<global.custom[slot].traits.length; i++){
            trait[global.custom[slot].traits[i]] = 1;
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

        return {
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
    if (type === 'lumberjack' && global.race['evil'] && !global.race['soul_eater']){
        if (global.race['living_tool']){
            modifier *= 1 + traits.living_tool.vars()[0] * (global.tech['science'] && global.tech.science > 0 ? global.tech.science * 0.3 : 0);
        }
        else {
            modifier *= 1 + ((global.tech['reclaimer'] - 1) * 0.4);
        }
    }
    if (global.race['powered'] && (type === 'factory' || type === 'miner' || type === 'lumberjack') ){
        modifier *= 1 + (traits.powered.vars()[1] / 100);
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
    if (global.race['hardy'] && type === 'factory'){
        modifier *= 1 + (traits.hardy.vars()[0] * global.race['hardy'] / 100);
    }
    if (global.race['analytical'] && type === 'science'){
        modifier *= 1 + (traits.analytical.vars()[0] * global.race['analytical'] / 100);
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
        if (global.race['cunning']){
            modifier *= 1 + (traits.cunning.vars()[0] * global.race['cunning'] / 100);
        }
        if (global.city.biome === 'savanna'){
            modifier *= biomes.savanna.vars()[1];
        }
        if (global.race['dark_dweller'] && global.city.calendar.weather === 2){
            modifier *= 1 - traits.dark_dweller.vars()[0] / 100;
        }
        if(global.city.banquet && global.city.banquet.on && global.city.banquet.count >= 3){
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
        if (global.race.hasOwnProperty('casting') && global.race.casting[type === 'hellArmy' ? 'army' : type]){
            let boost = global.race.casting[type === 'hellArmy' ? 'army' : type];
            if (global.race['witch_hunter']){
                modifier *= 1 + (boost / (boost + 75) * 2.5);
            }
            else {
                modifier *= 1 + (boost / (boost + 75));
            }
        }
    }
    if ((global.race['living_tool'] || global.race['tusk']) && type === 'miner'){
        let tusk = global.race['tusk'] ? 1 + ((traits.tusk.vars()[0] / 100) * (armyRating(jobScale(1),'army',0) / 100)) : 1;
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

export function randomMinorTrait(ranks){
    let trait_list = [];
    Object.keys(traits).forEach(function (t){
        if (traits[t].type === 'minor' && !global.race[t]){
            trait_list.push(t);
        }
    });
    if (trait_list.length === 0){
        Object.keys(traits).forEach(function (t){
            if (traits[t].type === 'minor'){
                trait_list.push(t);
            }
        });
    }
    let trait = trait_list[Math.floor(seededRandom(0,trait_list.length))];
    if (global.race[trait]){
        global.race[trait] += ranks;
    }
    else {
        global.race[trait] = ranks;
    }
    return trait;
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
}

function getPurgatory(s,t){
    if (global.race.purgatory[s].hasOwnProperty(t)){
        return global.race.purgatory[s][t];
    }
}

function purgeLumber(){
    releaseResource('Lumber');
    releaseResource('Plywood');
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
        }
        case 'untrustworthy':
        {
            val *= 1 + (traits.untrustworthy.vars()[0] / 100);
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
            break;
        case 'smoldering':
            global.resource.Chrysotile.display = true;
            if (global.race['kindling_kindred']){
                break;
            }
            purgeLumber();
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
            setJobName('lumberjack');
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
            global.settings.showMarket = false;
            if (global.settings.marketTabs === 0) {
                global.settings.marketTabs = 1;
            }
            removeFromQueue(['city-trade']);
            removeFromRQueue(['trade']);
            setPurgatory('tech','trade');
            setPurgatory('city','trade');
            break;
        case 'slaver':
            checkPurgatory('tech','slaves');
            if (global.tech['slaves'] >= 1) {
                checkPurgatory('city','slave_pen',{ count: 0 });
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
            }
            break;
        case 'unified':
            global.tech['world_control'] = 1;
            global.tech['unify'] = 2;
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
            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
            if (webWorker.w){
                gameLoop('stop');
                gameLoop('start');
            }
            else {
                window.location.reload();
            }
            break;
        case 'hyper':
            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
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
            break;
        case 'smoldering':
            releaseResource('Chrysotile')
            if (global.race['kindling_kindred']){
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
            break;
        case 'iron_wood':
            if (global.tech['foundry']){
                global.resource.Plywood.display = true;
            }
            break;
        case 'forge':
            defineIndustry();
            break;
        case 'soul_eater':
            setJobName('lumberjack');
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
            break;
        case 'terrifying':
            global.settings.showMarket = true;
            checkPurgatory('tech','trade');
            checkPurgatory('city','trade');
            break;
        case 'slaver':
            removeFromQueue(['city-slave_pen']);
            removeFromRQueue(['slaves']);
            setPurgatory('city','slave_pen');
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
            setPurgatory('city','shrine');
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
            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
            if (webWorker.w){
                gameLoop('stop');
                gameLoop('start');
            }
            else {
                window.location.reload();
            }
            break;
        case 'hyper':
            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
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
            global.resource.Zen.display = false;
            setPurgatory('city','meditation');
            break;
        case 'blood_thirst':
            delete global.race['blood_thirst_count'];
            break;
        case 'deconstructor':
            removeFromQueue(['city-nanite_factory']);
            global.resource.Nanite.display = false;
            setPurgatory('city','nanite_factory');
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
            if (!global.race['ocular_power']){
                global.settings.showWish = false;
            }
            if (global.race['wishStats'] && global.race.wishStats.strong){
                delete global.race['strong'];
                cleanRemoveTrait('strong')
            }
            break;
        case 'ocular_power':
            if (!global.tech['wish']){
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
                Object.keys(genus_traits[genus]).forEach(function (trait) {
                    if (!global.race[trait]){
                        i_traits.push(trait);
                    }
                });
            })
        }
        else {
            Object.keys(genus_traits[races[global.race['srace']].type]).forEach(function (trait) {
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
            Object.keys(genus_traits[genus]).forEach(function (trait) {
                if (!global.race[trait] && trait !== 'high_pop'){
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
        Object.keys(genus_traits).forEach(function (gen) {
            if(!['synthetic', 'eldritch', ...base, ...imitation].includes(gen) && global.stats.achieve[`genus_${gen}`] && global.stats.achieve[`genus_${gen}`].l > 0){
                drop += `<b-dropdown-item v-on:click="setShape('${gen}')">{{ '${gen}' | genus }}</b-dropdown-item>`;
            }
        });

        $('#sshifter').append(
            `<span>${loc(`trait_shapeshifter_name`)}</span>: <b-dropdown hoverable scrollable>
            <button class="button is-primary" slot="trigger">
                <span>{{ ss_genus | genus }}</span>
            </button>
            <b-dropdown-item v-on:click="setShape('none')">{{ 'none' | genus }}</b-dropdown-item>${drop}
        </b-dropdown>`);

        vBind({
            el: `#sshifter`,
            data: global.race,
            methods: {
                setShape(s){
                    shapeShift(s);
                }
            },
            filters: {
                genus(g){
                    return loc(`genelab_genus_${g}`);
                }
            }
        });
    }

    global.race['ss_traits'] = shifted;
    combineTraits();
    if(genus || !setup || forceClean){
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
        let rank = Math.min(global.race['herbivore'], global.race['carnivore']); //forager has rank equal to lower of carnivore/herbivore

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

export function traitRank(trait){
    if (global.race['empowered'] && trait !== 'empowered'){
        let val = traits[trait].val;
        if (val >= traits.empowered.vars()[0] && val <= traits.empowered.vars()[1]){
            switch (global.race[trait]){
                case 0.1:
                    return 0.25;
                case 0.25:
                    return 0.5;
                case 0.5:
                    return 1;
                case 1:
                    return 2;
                case 2:
                    return 3;
                case 3:
                    return 4;
                case 4:
                    return 4;
            }
        }
    }
    return global.race[trait];
}

export function setTraitRank(trait,opts){
    opts = opts || {};
    if (global.race[trait] && !opts['force']){
        switch (global.race[trait]){
            case 0.1:
                global.race[trait] = opts['down'] ? 0.1 : 0.25;
                return opts['down'] ? false : true;
            case 0.25:
                global.race[trait] = opts['down'] ? 0.1 : 0.5;
                return true;
            case 0.5:
                global.race[trait] = opts['down'] ? 0.25 : 1;
                return true;
            case 1:
                global.race[trait] = opts['down'] ? 0.5 : 2;
                return true;
            case 2:
                global.race[trait] = opts['down'] ? 1 : 3;
                return true;
            case 3:
                global.race[trait] = opts['down'] ? 2 : 4;
                return true;
            case 4:
                global.race[trait] = opts['down'] ? 3 : 4;
                return opts['down'] ? true : false;
        }
    }
    else if (opts['set']){
        global.race[trait] = opts['set'];
        return true;
    }
    return false;
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

export function traitSkin(type, trait, species){
    let artificial = species ? genus_traits[races[species].type].artifical : global.race['artifical'];
    switch (type){
        case 'name':
        {
            let name = {
                hooved: hoovedReskin(false, species),
                promiscuous: artificial ? loc('trait_promiscuous_synth_name') : traits.promiscuous.name,
                weak: species === 'dwarf' ? loc('trait_drunk_name') : traits.weak.name,
                spiritual: global.race.universe === 'evil' && global.civic.govern.type != 'theocracy' ? loc('trait_manipulator_name') : traits.spiritual.name,
            };
            return trait ? (name[trait] ? name[trait] : traits[trait].name) : name;
        } 
        case 'desc':
        {
            let desc = {
                hooved: hoovedReskin(true, species),
                promiscuous: artificial ? loc('trait_promiscuous_synth') : traits['promiscuous'].desc,
                weak: species === 'dwarf' ? loc('trait_drunk') : traits.weak.desc,
                spiritual: global.race.universe === 'evil' && global.civic.govern.type != 'theocracy' ? loc('trait_manipulator') : traits.spiritual.desc,
                blurry: global.race['warlord'] ? loc('trait_blurry_warlord') : traits.blurry.desc,
            };
            return trait ? (desc[trait] ? desc[trait] : traits[trait].desc) : desc;
        }
    }
}

export function hoovedReskin(desc, species=global.race.species){
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
        return desc ? traits['hooved'].desc : traits['hooved'].name;
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
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 7)){
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
}

function minorWish(parent){
    let container = $(`<div id="minorWish" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header"><span class="has-text-warning">${loc('tech_minor_wish')}</span> - <span v-html="$options.filters.wish(minor)"></span></div>`));
    let spells = $(`<div class="flexWrap"></div>`);
    container.append(spells);

    spells.append(`<div><b-button id="wishMoney" v-html="$options.filters.money()" @click="money()"></b-button></div>`);
    spells.append(`<div><b-button id="wishRes" v-html="$options.filters.label('resources')" @click="res()"></b-button></div>`);
    spells.append(`<div><b-button id="wishKnow" v-html="$options.filters.know()" @click="know()"></b-button></div>`);
    spells.append(`<div><b-button id="wishFame" v-html="$options.filters.label('fame')" @click="famous()"></b-button></div>`);
    spells.append(`<div><b-button id="wishStrength" v-html="$options.filters.label('strength')" @click="strength()"></b-button></div>`);
    spells.append(`<div><b-button id="wishInfluence" v-html="$options.filters.label('influence')" @click="influence()"></b-button></div>`);
    spells.append(`<div><b-button id="wishExcite" v-html="$options.filters.label('event')" @click="excite()"></b-button></div>`);
    spells.append(`<div><b-button id="wishLove" v-html="$options.filters.label('love')" @click="love()"></b-button></div>`);

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
                        if (global.resource[res].display && global.resource[res].amount * 1.05 < global.resource[res].max){
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
                    if (global.race['truepath'] && !global.tech['isolation'] && global.tech['rival']){
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
                    }
                }
            },
            excite(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 4;

                    let event_pool = eventList('minor');
                    if (event_pool.length > 0){
                        let event = event_pool[Math.floor(seededRandom(0,event_pool.length))];
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
            }
        },
        filters: {
            wish(v){
                return v === 0 ? `<span class="has-text-success">${loc(`power_available`)}</span>` : `<span class="has-text-danger">${v}</span>`;
            },
            label(v){
                return loc(`wish_${v}`);
            },
            know(){
                return global.resource.Knowledge.name;
            },
            money(){
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

    container.append($(`<div class="header"><span class="has-text-warning">${loc('tech_major_wish')}</span> - <span v-html="$options.filters.wish(major)"></span></div>`));
    let spells = $(`<div class="flexWrap"></div>`);
    container.append(spells);

    spells.append(`<div><b-button id="wishBigMoney" v-html="$options.filters.money()" @click="money()"></b-button></div>`);
    spells.append(`<div><b-button id="wishBigRes" v-html="$options.filters.label('resources')" @click="res()"></b-button></div>`)
    spells.append(`<div><b-button id="wishPlasmid" v-html="$options.filters.label('plasmid')" @click="plasmid()"></b-button></div>`);
    spells.append(`<div><b-button id="wishPower" v-html="$options.filters.label('power')" @click="power()"></b-button></div>`);
    spells.append(`<div><b-button id="wishAdoration" v-html="$options.filters.label('adoration')" @click="adoration()"></b-button></div>`);
    spells.append(`<div><b-button id="wishThrill" v-html="$options.filters.label('thrill')" @click="thrill()"></b-button></div>`);
    spells.append(`<div><b-button id="wishPeace" v-html="$options.filters.label('peace')" @click="peace()"></b-button></div>`);
    spells.append(`<div><b-button id="wishGreatness" v-html="$options.filters.label('greatness')" @click="greatness()"></b-button></div>`);

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
                        if (global.resource[res].display && global.resource[res].amount * 1.05 < global.resource[res].max){
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
                    if (!global.race.wishStats.zigg && !global.race['lone_survivor'] && !global.race['warlord']){
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
                        let event = event_pool[Math.floor(seededRandom(0,event_pool.length))];
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

                    if (global.race['truepath'] && !global.tech['isolation'] && global.tech['rival'] && global.civic.foreign.gov3.hstl > 0){
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
                                messageQueue(loc('wish_peace_flower',[govTitle(spell.substring(3))]),'warning',false,['events']);
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
                                let hasCity = global.race['cataclysm'] || global.race['orbit_decay'] ? false : true;
                                let hasMars = global.tech['mars'] ? true : false;
                                if (!global.city.hasOwnProperty('wonder_lighthouse') && hasCity){
                                    wonders.push('lighthouse');
                                }
                                if (!global.city.hasOwnProperty('wonder_pyramid') && hasCity){
                                    wonders.push('pyramid');
                                }
                                if (!global.space.hasOwnProperty('wonder_statue') && hasMars){
                                    wonders.push('statue');
                                }
                                if (!global.race['truepath'] && !global.interstellar.hasOwnProperty('wonder_gardens') && global.tech['alpha'] && global.tech.alpha >= 2){
                                    wonders.push('gardens');
                                }
                                if (global.race['truepath'] && !global.space.hasOwnProperty('wonder_gardens') && global.tech['titan'] && global.tech.titan >= 2){
                                    wonders.push('gardens');
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
                                        global[global.race['truepath'] ? 'space' : 'interstellar']['wonder_gardens'] = { count: 1 };
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
        },
        filters: {
            wish(v){
                return v === 0 ? `<span class="has-text-success">${loc(`power_available`)}</span>` : `<span class="has-text-danger">${v}</span>`;
            },
            label(v){
                return loc(`wish_${v}`);
            },
            money(){
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

    container.append($(`<div class="header"><span class="has-text-warning">${loc('trait_ocular_power_name')}</span> - <span v-html="$options.filters.max()"></span></div>`));
    let powers = $(`<div class="flexWrap"></div>`);
    container.append(powers);

    powers.append(`<div id="oculardisintegration" class="chk"><b-checkbox v-model="d" @input="pow('d')">${loc(`ocular_disintegration`)}</b-checkbox></div>`);
    powers.append(`<div id="ocularpetrification" class="chk"><b-checkbox v-model="p" @input="pow('p')">${loc(`ocular_petrification`)}</b-checkbox></div>`);
    powers.append(`<div id="ocularwound" class="chk"><b-checkbox v-model="w" @input="pow('w')">${loc(`ocular_wound`)}</b-checkbox></div>`);
    powers.append(`<div id="oculartelekinesis" class="chk"><b-checkbox v-model="t" @input="pow('t')">${loc(`ocular_telekinesis`)}</b-checkbox></div>`);
    powers.append(`<div id="ocularfear" class="chk"><b-checkbox v-model="f" @input="pow('f')">${loc(`ocular_fear`)}</b-checkbox></div>`);
    powers.append(`<div id="ocularcharm" class="chk"><b-checkbox v-model="c" @input="pow('c')">${loc(`ocular_charm`)}</b-checkbox></div>`);

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
            }
        },
        filters: {
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
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 6)){
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

    container.append($(`<div class="header">${loc('psychic_boost_title')} <span v-html="$options.filters.boostTime()"></span></div>`));

    let content = $(`<div></div>`);
    container.append(content);

    let scrollMenu = ``;
    Object.keys(atomic_mass).forEach(function(res){
        if (global.resource[res].display){
            scrollMenu += `<b-radio-button v-model="b.r" native-value="${res}">${global.resource[res].name}</b-radio-button>`;
        }
    });
    content.append(`<div id="psyhscrolltarget" class="left hscroll"><b-field class="buttonList">${scrollMenu}</b-field></div>`); 

    container.append(`<div><b-button v-html="$options.filters.boost(b.r)" @click="boostVal()"></b-button></div>`);

    if (global.tech.psychic >= 4){
        let channel = $(`<div class="gap">${loc('psychic_channel')}</div>`);
        let psy = $(`<span class="current">{{ c.boost }}</span>`);
        let sub = $(`<span role="button" class="sub" @click="sub" aria-label="Decresae Energy reserved for ${loc(`psychic_attack`)}"><span>&laquo;</span></span>`);
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
            }
        },
        filters: {
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
    container.append(`<div><b-button v-html="$options.filters.kill()" @click="murder()"></b-button></div>`);

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
                    blubberFill(1);
                    if (global.race['anthropophagite']){
                        modRes('Food', 10000 * traits.anthropophagite.vars()[0]);
                    }
                    if (global.stats.psykill === 10){
                        renderPsychicPowers();
                    }
                }
            }
        },
        filters: {
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

    container.append($(`<div class="header">${loc('psychic_assault_title')} <span v-html="$options.filters.boostTime()"></span></div>`));
    container.append(`<div><b-button v-html="$options.filters.boost()" @click="boostVal()"></b-button></div>`);

    if (global.tech.psychic >= 4){
        let channel = $(`<div class="gap">${loc('psychic_channel')}</div>`);
        let psy = $(`<span class="current">{{ assault }}</span>`);
        let sub = $(`<span role="button" class="sub" @click="sub" aria-label="Decresae Energy reserved for ${loc(`psychic_attack`)}"><span>&laquo;</span></span>`);
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
            }
        },
        filters: {
            boost(){
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

    container.append($(`<div class="header">${loc('psychic_profit_title')} <span v-html="$options.filters.boostTime()"></span></div>`));
    container.append(`<div><b-button v-html="$options.filters.boost()" @click="boostVal()"></b-button></div>`);

    if (global.tech.psychic >= 4){
        let channel = $(`<div class="gap">${loc('psychic_channel')}</div>`);
        let psy = $(`<span class="current">{{ cash }}</span>`);
        let sub = $(`<span role="button" class="sub" @click="sub" aria-label="Decresae Energy reserved for ${loc(`psychic_profit`)}"><span>&laquo;</span></span>`);
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
            }
        },
        filters: {
            boost(){
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
    container.append(`<div><b-button v-html="$options.filters.break()" @click="breakMind()"></b-button></div>`);

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
            }
        },
        filters: {
            break(){
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
    container.append(`<div><b-button v-html="$options.filters.break()" @click="stun()"></b-button></div>`);

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
            }
        },
        filters: {
            break(){
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

export function blubberFill(v){
    if (global.race['blubber'] && global.city.hasOwnProperty('oil_well')){
        let cap = (global.city.oil_well.count + (global.space['oil_extractor'] ? global.space.oil_extractor.count : 0)) * 50;
        global.city.oil_well.dead += v;
        if (global.city.oil_well.dead > cap){
            global.city.oil_well.dead = cap;
        }
    }
}
