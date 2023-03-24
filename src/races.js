import { global, save, webWorker, power_generated } from './vars.js';
import { loc } from './locale.js';
import { defineIndustry } from './industry.js';
import { setJobName, jobScale, loadFoundry } from './jobs.js';
import { vBind, clearElement, removeFromQueue, removeFromRQueue, calc_mastery, getEaster, getHalloween } from './functions.js';
import { setResourceName } from './resources.js';
import { highPopAdjust } from './prod.js';
import { buildGarrison, govEffect } from './civics.js';
import { govActive, removeTask } from './governor.js';
import { unlockAchieve } from './achieve.js';
import { actions, checkTechQualifications } from './actions.js';

const date = new Date();
const easter = getEaster();
const hallowed = getHalloween();

export const neg_roll_traits = ['diverse','arrogant','angry','lazy','paranoid','greedy','puny','dumb','nearsighted','gluttony','slow','hard_of_hearing','pessimistic','solitary','pyrophobia','skittish','nyctophilia','frail','atrophy','invertebrate','pathetic','invertebrate','unorganized','slow_regen','snowy','mistrustful','fragrant','freespirit','hooved','heavy','gnawer'];

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
    /*omnivore: {
        forager: 1
    },*/
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
        hollow_bones: 1,
        rigid: 1
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
        holy: 1,
    },
    synthetic: {
        artifical: 1,
        powered: 1
    }
};

export const traits = {
    adaptable: { // Genetic Mutations occur faster from gene tampering
        name: loc('trait_adaptable_name'),
        desc: loc('trait_adaptable'),
        type: 'genus',
        val: 3,
        vars(r){ 
            switch (r || global.race.adaptable || 1){
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
            }
        },
    },
    wasteful: { // Craftings cost more materials
        name: loc('trait_wasteful_name'),
        desc: loc('trait_wasteful'),
        type: 'genus',
        val: -3,
        vars(r){ 
            switch (r || global.race.wasteful || 1){
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
            switch (r || global.race.carnivore || 1){
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
            switch (r || global.race.beast || 1){
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
            }
        },
    },
    cautious: { // Rain reduces combat rating
        name: loc('trait_cautious_name'),
        desc: loc('trait_cautious'),
        type: 'genus',
        val: -2,
        vars(r){ 
            switch (r || global.race.cautious || 1){
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
            switch (r || global.race.instinct || 1){
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
            }
        },
    },
    /*forager: { // Will eat just about anything
        name: loc('trait_forager_name'),
        desc: loc('trait_forager'),
        type: 'genus',
        val: 2,
    },*/
    small: { // Reduces cost creep multipliers by 0.01
        name: loc('trait_small_name'),
        desc: loc('trait_small'),
        type: 'genus',
        val: 6,
        vars(r){
            // [Planet Creep, Space Creep]
            switch (r || global.race.small || 1){
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
            }
        },
    },
    weak: { // Lumberjacks, miners, and quarry workers are 10% less effective
        name: loc('trait_weak_name'),
        desc: loc('trait_weak'),
        type: 'genus',
        val: -3,
        vars(r){
            switch (r || global.race.weak || 1){
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
            }
        },
    },
    large: { // Increases plantery cost creep multipliers by 0.005
        name: loc('trait_large_name'),
        desc: loc('trait_large'),
        type: 'genus',
        val: -5,
        vars(r){
            switch (r || global.race.large || 1){
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
            }
        },
    },
    strong: { // Increased manual resource gain
        name: loc('trait_strong_name'),
        desc: loc('trait_strong'),
        type: 'genus',
        val: 5,
        vars(r){
            switch (r || global.race.strong || 1){
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
            switch (r || global.race.cold_blooded || 1){
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
            switch (r || global.race.scales || 1){
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
            }
        },
    },
    hollow_bones: { // Less Crafted Materials Needed
        name: loc('trait_hollow_bones_name'),
        desc: loc('trait_hollow_bones'),
        type: 'genus',
        val: 3,
        vars(r){
            switch (r || global.race.hollow_bones || 1){
                case 0.25:
                    return [1];
                case 0.5:
                    return [2];
                case 1:
                    return [5];
                case 2:
                    return [8];
                case 3:
                    return [10];
            }
        },
    },
    rigid: { // Crafting production lowered slightly
        name: loc('trait_rigid_name'),
        desc: loc('trait_rigid'),
        type: 'genus',
        val: -1,
        vars(r){
            switch (r || global.race.rigid || 1){
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
            switch (r || global.race.high_pop || 1){
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
            switch (r || global.race.fast_growth || 1){
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
            }
        },
    },
    high_metabolism: { // Food requirements increased by 5%
        name: loc('trait_high_metabolism_name'),
        desc: loc('trait_high_metabolism'),
        type: 'genus',
        val: -1,
        vars(r){
            switch (r || global.race.high_metabolism || 1){
                case 0.25:
                    return [10];
                case 0.5:
                    return [8];
                case 1:
                    return [5];
                case 2:
                    return [2];
                case 3:
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
            switch (r || global.race.photosynth || 1){
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
            }
        },
    },
    sappy: { // Stone is replaced with Amber.
        name: loc('trait_sappy_name'),
        desc: loc('trait_sappy',[loc('resource_Amber_name')]),
        type: 'genus',
        val: 4,
        vars(r){
            switch (r || global.race.sappy || 1){
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
            }
        },
    },
    asymmetrical: { // Trade selling prices are slightly worse then normal
        name: loc('trait_asymmetrical_name'),
        desc: loc('trait_asymmetrical'),
        type: 'genus',
        val: -3,
        vars(r){
            switch (r || global.race.asymmetrical || 1){
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
            }
        },
    },
    detritivore: { // You eat dead matter
        name: loc('trait_detritivore_name'),
        desc: loc('trait_detritivore'),
        type: 'genus',
        val: 2,
        vars(r){
            switch (r || global.race.detritivore || 1){
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
            switch (r || global.race.spores || 1){
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
            switch (r || global.race.low_light || 1){
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
            }
        },
    },
    elusive: { // Spies are never caught
        name: loc('trait_elusive_name'),
        desc: loc('trait_elusive'),
        type: 'genus',
        val: 7,
        vars(r){
            switch (r || global.race.elusive || 1){
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
            }
        },
    },
    iron_allergy: { // Iron mining reduced
        name: loc('trait_iron_allergy_name'),
        desc: loc('trait_iron_allergy'),
        type: 'genus',
        val: -4,
        vars(r){
            switch (r || global.race.iron_allergy || 1){
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
            switch (r || global.race.smoldering || 1){
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
            }
        },
    },
    cold_intolerance: { // Cold weather is a detriment
        name: loc('trait_cold_intolerance_name'),
        desc: loc('trait_cold_intolerance'),
        type: 'genus',
        val: -4,
        vars(r){
            switch (r || global.race.cold_intolerance || 1){
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
            switch (r || global.race.chilled || 1){
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
            }
        },
    },
    heat_intolerance: { // Hot weather is a detriment
        name: loc('trait_heat_intolerance_name'),
        desc: loc('trait_heat_intolerance'),
        type: 'genus',
        val: -4,
        vars(r){
            switch (r || global.race.heat_intolerance || 1){
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
            switch (r || global.race.scavenger || 1){
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
            switch (r || global.race.immoral || 1){
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
            switch (r || global.race.blissful || 1){
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
            }
        },
    },
    pompous: { // Professors are less effective
        name: loc('trait_pompous_name'),
        desc: loc('trait_pompous'),
        type: 'genus',
        val: -6,
        vars(r){
            switch (r || global.race.pompous || 1){
                case 0.25:
                    return [85];
                case 0.5:
                    return [80];
                case 1:
                    return [75];
                case 2:
                    return [65];
                case 3:
                    return [60];
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
            switch (r || global.race.holy || 1){
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
            switch (r || global.race.artifical || 1){
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
            switch (r || global.race.powered || 1){
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
            }
        },
    },
    creative: { // A.R.P.A. Projects are cheaper
        name: loc('trait_creative_name'),
        desc: loc('trait_creative'),
        type: 'major',
        val: 8,
        vars(r){
            switch (r || global.race.creative || 1){
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
            }
        },
    },
    diverse: { // Training soldiers takes longer
        name: loc('trait_diverse_name'),
        desc: loc('trait_diverse'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || global.race.diverse || 1){
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
            switch (r || global.race.studious || 1){
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
            }
        },
    },
    arrogant: { // Market prices are higher
        name: loc('trait_arrogant_name'),
        desc: loc('trait_arrogant'),
        type: 'major',
        val: -2,
        vars(r){
            switch (r || global.race.arrogant || 1){
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
            switch (r || global.race.brute || 1){
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
            }
        },
    },
    angry: { // When hungry you get hangry, low food penalty is more severe
        name: loc('trait_angry_name'),
        desc: loc('trait_angry'),
        type: 'major',
        val: -1,
        vars(r){
            switch (r || global.race.angry || 1){
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
            }
        },
    },
    lazy: { // All production is lowered when the temperature is hot
        name: loc('trait_lazy_name'),
        desc: loc('trait_lazy'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || global.race.lazy || 1){
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
            }
        },
    },
    curious: { // University cap boosted by citizen count, curious random events
        name: loc('trait_curious_name'),
        desc: loc('trait_curious'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || global.race.curious || 1){
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
            switch (r || global.race.pack_mentality || 1){
                case 0.25:
                    return [0.04,0.016];
                case 0.5:
                    return [0.035,0.018];
                case 1:
                    return [0.03,0.02];
                case 2:
                    return [0.026,0.022];
                case 3:
                    return [0.024,0.023];
            }
        },
    },
    tracker: { // 20% increased gains from hunting
        name: loc('trait_tracker_name'),
        desc: loc('trait_tracker'),
        type: 'major',
        val: 2,
        vars(r){
            switch (r || global.race.tracker || 1){
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
            }
        },
    },
    playful: { // Hunters are Happy
        name: loc('trait_playful_name'),
        desc: loc('trait_playful'),
        type: 'major',
        val: 5,
        vars(r){
            switch (r || global.race.playful || 1){
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
            }
        },
    },
    freespirit: { // Job Stress is higher for those who must work mundane jobs
        name: loc('trait_freespirit_name'),
        desc: loc('trait_freespirit'),
        type: 'major',
        val: -3,
        vars(r){
            switch (r || global.race.freespirit || 1){
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
            switch (r || global.race.sniper || 1){
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
            switch (r || global.race.hooved || 1){
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
            }
        },
    },
    rage: { // Wounded soldiers rage with extra power
        name: loc('trait_rage_name'),
        desc: loc('trait_rage'),
        type: 'major',
        val: 4,
        vars(r){
            // [Armor Bonus, Wounded Bonus]
            switch (r || global.race.rage || 1){
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
            switch (r || global.race.heavy || 1){
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
            }
        },
    },
    gnawer: { // Population destroys lumber by chewing on it
        name: loc('trait_gnawer_name'),
        desc: loc('trait_gnawer'),
        type: 'major',
        val: -1,
        vars(r){
            switch (r || global.race.gnawer || 1){
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
            }
        },
    },
    calm: { // Your are very calm, almost zen like
        name: loc('trait_calm_name'),
        desc: loc('trait_calm'),
        type: 'major',
        val: 6,
        vars(r){
            switch (r || global.race.calm || 1){
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
            switch (r || global.race.pack_rat || 1){
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
            }
        },
    },
    paranoid: { // Bank capacity reduced by 10%
        name: loc('trait_paranoid_name'),
        desc: loc('trait_paranoid'),
        type: 'major',
        val: -3,
        vars(r){
            switch (r || global.race.paranoid || 1){
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
            }
        },
    },
    greedy: { // Lowers income from taxes
        name: loc('trait_greedy_name'),
        desc: loc('trait_greedy'),
        type: 'major',
        val: -5,
        vars(r){
            switch (r || global.race.greedy || 1){
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
            switch (r || global.race.merchant || 1){
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
            }
        },
    },
    smart: { // Knowledge costs reduced by 10%
        name: loc('trait_smart_name'),
        desc: loc('trait_smart'),
        type: 'major',
        val: 6,
        vars(r){
            switch (r || global.race.smart || 1){
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
            }
        },
    },
    puny: { // Lowers minium bound for army score roll
        name: loc('trait_puny_name'),
        desc: loc('trait_puny'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || global.race.puny || 1){
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
            }
        },
    },
    dumb: { // Knowledge costs increased by 5%
        name: loc('trait_dumb_name'),
        desc: loc('trait_dumb'),
        type: 'major',
        val: -5,
        vars(r){
            switch (r || global.race.dumb || 1){
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
            }
        },
    },
    tough: { // Mining output increased by 25%
        name: loc('trait_tough_name'),
        desc: loc('trait_tough'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || global.race.tough || 1){
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
            }
        },
    },
    nearsighted: { // Libraries are less effective
        name: loc('trait_nearsighted_name'),
        desc: loc('trait_nearsighted'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || global.race.nearsighted || 1){
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
            switch (r || global.race.intelligent || 1){
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
            }
        },
    },
    regenerative: { // Wounded soldiers heal 4x as fast
        name: loc('trait_regenerative_name'),
        desc: loc('trait_regenerative'),
        type: 'major',
        val: 8,
        vars(r){ return [4]; },
        vars(r){
            switch (r || global.race.regenerative || 1){
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
            }
        },
    },
    gluttony: { // Eats 10% more food per rank
        name: loc('trait_gluttony_name'),
        desc: loc('trait_gluttony'),
        type: 'major',
        val: -2,
        vars(r){
            switch (r || global.race.gluttony || 1){
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
            }
        },
    },
    slow: { // The game moves at a 10% slower pace
        name: loc('trait_slow_name'),
        desc: loc('trait_slow'),
        type: 'major',
        val: -5,
        vars(r){
            switch (r || global.race.slow || 1){
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
            switch (r || global.race.armored || 1){
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
            }
        },
    },
    optimistic: { // Minor reduction to stress
        name: loc('trait_optimistic_name'),
        desc: loc('trait_optimistic'),
        type: 'major',
        val: 5,
        vars(r){
            switch (r || global.race.optimistic || 1){
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
            switch (r || global.race.chameleon || 1){
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
            }
        },
    },
    slow_digestion: { // Your race is more resilient to starvation
        name: loc('trait_slow_digestion_name'),
        desc: loc('trait_slow_digestion'),
        type: 'major',
        val: 1,
        vars(r){
            switch (r || global.race.slow_digestion || 1){
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
            }
        },
    },
    hard_of_hearing: { // University science cap gain reduced by 5%
        name: loc('trait_hard_of_hearing_name'),
        desc: loc('trait_hard_of_hearing'),
        type: 'major',
        val: -3,
        vars(r){
            switch (r || global.race.hard_of_hearing || 1){
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
            }
        },
    },
    resourceful: { // Crafting costs are reduced slightly
        name: loc('trait_resourceful_name'),
        desc: loc('trait_resourceful'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || global.race.resourceful || 1){
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
            switch (r || global.race.selenophobia || 1){
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
            switch (r || global.race.leathery || 1){
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
            }
        },
    },
    pessimistic: { // Minor increase to stress
        name: loc('trait_pessimistic_name'),
        desc: loc('trait_pessimistic'),
        type: 'major',
        val: -1,
        vars(r){
            switch (r || global.race.pessimistic || 1){
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
            }
        },
    },
    hoarder: { // Banks can store 20% more money
        name: loc('trait_hoarder_name'),
        desc: loc('trait_hoarder'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || global.race.hoarder || 1){
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
            switch (r || global.race.solitary || 1){
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
            }
        },
    },
    kindling_kindred: { // Lumber is no longer a resource, however other costs are increased for anything that would have used lumber to compensate.
        name: loc('trait_kindling_kindred_name'),
        desc: loc('trait_kindling_kindred'),
        type: 'major',
        val: 8,
        vars(r){
            switch (r || global.race.kindling_kindred || 1){
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
            }
        },
    },
    pyrophobia: { // Smelter productivity is reduced
        name: loc('trait_pyrophobia_name'),
        desc: loc('trait_pyrophobia'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || global.race.pyrophobia || 1){
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
            }
        }
    },
    hyper: { // The game moves at a 5% faster pace
        name: loc('trait_hyper_name'),
        desc: loc('trait_hyper'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || global.race.hyper || 1){
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
            }
        }
    },
    skittish: { // Thunderstorms lower all production
        name: loc('trait_skittish_name'),
        desc: loc('trait_skittish'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || global.race.skittish || 1){
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
            }
        }
    },
    fragrant: { // Reduced Hunting effectiveness
        name: loc('trait_fragrant_name'),
        desc: loc('trait_fragrant'),
        type: 'major',
        val: -3,
        vars(r){
            switch (r || global.race.fragrant || 1){
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
            switch (r || global.race.sticky || 1){
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
            switch (r || global.race.infectious || 1){
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
            switch (r || global.race.toxic || 1){
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
            switch (r || global.race.nyctophilia || 1){
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
            }
        }
    },
    infiltrator: { // Cheap spies and sometimes steal tech from rivals
        name: loc('trait_infiltrator_name'),
        desc: loc('trait_infiltrator'),
        type: 'major',
        val: 4,
        vars(r){ // [Steal Cap]
            switch (r || global.race.infiltrator || 1){
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
            switch (r || global.race.hibernator || 1){
                case 0.25:
                    return [15,8];
                case 0.5:
                    return [20,8];
                case 1:
                    return [25,8];
                case 2:
                    return [30,6];
                case 3:
                    return [35,5];
            }
        }
    },
    cannibalize: { // Eat your own for buffs
        name: loc('trait_cannibalize_name'),
        desc: loc('trait_cannibalize'),
        type: 'major',
        val: 5,
        vars(r){
            switch (r || global.race.cannibalize || 1){
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
            switch (r || global.race.frail || 1){
                case 0.25:
                    return [2,2];
                case 0.5:
                    return [1,2];
                case 1:
                    return [1,1];
                case 2:
                    return [1,0];
                case 3:
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
            switch (r || global.race.malnutrition || 1){
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
            }
        }
    },
    claws: { // Raises maximum bound for army score roll
        name: loc('trait_claws_name'),
        desc: loc('trait_claws'),
        type: 'major',
        val: 5,
        vars(r){
            switch (r || global.race.claws || 1){
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
            }
        }
    },
    atrophy: { // More prone to starvation
        name: loc('trait_atrophy_name'),
        desc: loc('trait_atrophy'),
        type: 'major',
        val: -1,
        vars(r){
            switch (r || global.race.atrophy || 1){
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
            }
        }
    },
    hivemind: { // Jobs with low citizen counts assigned to them have reduced output, but those with high numbers have increased output.
        name: loc('trait_hivemind_name'),
        desc: loc('trait_hivemind'),
        type: 'major',
        val: 9,
        vars(r){
            switch (r || global.race.hivemind || 1){
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
            }
        }
    },
    tunneler: { // Mines and Coal Mines are cheaper.
        name: loc('trait_tunneler_name'),
        desc: loc('trait_tunneler'),
        type: 'major',
        val: 2,
        vars(r){
            switch (r || global.race.tunneler || 1){
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
            switch (r || global.race.blood_thirst || 1){
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
            switch (r || global.race.apex_predator || 1){
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
            }
        }
    },
    invertebrate: { // You have no bones
        name: loc('trait_invertebrate_name'),
        desc: loc('trait_invertebrate'),
        type: 'major',
        val: -2,
        vars(r){
            switch (r || global.race.invertebrate || 1){
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
            }
        }
    },
    suction_grip: { // Global productivity boost
        name: loc('trait_suction_grip_name'),
        desc: loc('trait_suction_grip'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || global.race.suction_grip || 1){
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
            }
        }
    },
    befuddle: { // Spy actions complete in 1/2 time
        name: loc('trait_befuddle_name'),
        desc: loc('trait_befuddle'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || global.race.befuddle || 1){
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
            switch (r || global.race.unorganized || 1){
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
            }
        }
    },
    musical: { // Entertainers are more effective
        name: loc('trait_musical_name'),
        desc: loc('trait_musical'),
        type: 'major',
        val: 5,
        vars(r){
            switch (r || global.race.musical || 1){
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
            switch (r || global.race.revive || 1){
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
            }
        }
    },
    slow_regen: { // Your soldiers wounds heal slower.
        name: loc('trait_slow_regen_name'),
        desc: loc('trait_slow_regen'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || global.race.slow_regen || 1){
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
            }
        }
    },
    forge: { // Smelters do not require fuel, boosts geothermal power
        name: loc('trait_forge_name'),
        desc: loc('trait_forge'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || global.race.forge || 1){
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
            }
        }
    },
    autoignition: { // Library knowledge bonus reduced
        name: loc('trait_autoignition_name'),
        desc: loc('trait_autoignition'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || global.race.autoignition || 1){
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
            }
        }
    },
    blurry: { // Increased success chance of spies
        name: loc('trait_blurry_name'),
        desc: loc('trait_blurry'),
        type: 'major',
        val: 5,
        vars(r){
            switch (r || global.race.blurry || 1){
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
            switch (r || global.race.snowy || 1){
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
            switch (r || global.race.ravenous || 1){
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
            switch (r || global.race.ghostly || 1){
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
            }
        }
    },
    lawless: { // Government lockout timer is reduced by 90%
        name: loc('trait_lawless_name'),
        desc: loc('trait_lawless'),
        type: 'major',
        val: 3,
        vars(r){
            switch (r || global.race.lawless || 1){
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
            }
        }
    },
    mistrustful: { // Lose standing with rival cities quicker
        name: loc('trait_mistrustful_name'),
        desc: loc('trait_mistrustful'),
        type: 'major',
        val: -1,
        vars(r){
            switch (r || global.race.mistrustful || 1){
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
            switch (r || global.race.humpback || 1){
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
            switch (r || global.race.fiery || 1){
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
            switch (r || global.race.terrifying || 1){
                case 0.25:
                    return [8,20];
                case 0.5:
                    return [10,25];
                case 1:
                    return [12,32];
                case 2:
                    return [12,34];
                case 3:
                    return [12,36];
            }
        }
    },
    slaver: { // You capture victims and force them to work for you
        name: loc('trait_slaver_name'),
        desc: loc('trait_slaver'),
        type: 'major',
        val: 12,
        vars(r){
            switch (r || global.race.slaver || 1){
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
            switch (r || global.race.compact || 1){
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
            switch (r || global.race.conniving || 1){
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
            }
        }
    },
    pathetic: { // You suck at combat
        name: loc('trait_pathetic_name'),
        desc: loc('trait_pathetic'),
        type: 'major',
        val: -5,
        vars(r){
            switch (r || global.race.pathetic || 1){
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
            }
        }
    },
    spiritual: { // Temples are 13% more effective
        name: loc('trait_spiritual_name'),
        desc: loc('trait_spiritual'),
        type: 'major',
        val: 4,
        vars(r){
            switch (r || global.race.spiritual || 1){
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
            }
        }
    },
    truthful: { // Bankers are less effective
        name: loc('trait_truthful_name'),
        desc: loc('trait_truthful'),
        type: 'major',
        val: -7,
        vars(r){
            switch (r || global.race.truthful || 1){
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
            switch (r || global.race.unified || 1){
                case 0.25:
                    return [0];
                case 0.5:
                    return [1];
                case 1:
                    return [3];
                case 2:
                    return [5];
                case 3:
                    return [7];
            }
        }
    },
    rainbow: { // Gain a bonus if sunny after raining
        name: loc('trait_rainbow_name'),
        desc: loc('trait_rainbow'),
        type: 'major',
        val: 3,
        vars(r){
            switch (r || global.race.rainbow || 1){
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
            }
        }
    },
    magnificent: { // construct shrines to receive boons
        name: loc('trait_magnificent_name'),
        desc: loc('trait_magnificent'),
        type: 'major',
        val: 6,
        vars(r){
            // [Knowledge Base, Knowledge Scale, Tax Bonus]
            switch (r || global.race.magnificent || 1){
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
            switch (r || global.race.noble || 1){
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
            switch (r || global.race.imitation || 1){
                case 0.25:
                    return [0.25,0.5];
                case 0.5:
                    return [0.25,1];
                case 1:
                    return [0.5,1];
                case 2:
                    return [0.5,2];
                case 3:
                    return [1,2];
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
            switch (r || global.race.emotionless || 1){
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
            switch (r || global.race.logical || 1){
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
            switch (r || global.race.shapeshifter || 1){
                case 0.25:
                    return [0.25,0.5];
                case 0.5:
                    return [0.25,1];
                case 1:
                    return [0.5,1];
                case 2:
                    return [0.5,2];
                case 3:
                    return [1,2];
            }
        }
    },
    deconstructor: {
        name: loc('trait_deconstructor_name'),
        desc: loc('trait_deconstructor'),
        type: 'major',
        val: -4,
        vars(r){
            switch (r || global.race.deconstructor || 1){
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
            switch (r || global.race.linked || 1){
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
            switch (r || global.race.ooze || 1){
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
        entity: 'ooze',
        traits: {},
        solar: {
            red: loc('race_human_solar_red'),
            hell: loc('race_human_solar_hell'),
            gas: loc('race_human_solar_gas'),
            gas_moon: loc('race_human_solar_gas_moon'),
            dwarf: loc('race_human_solar_dwarf'),
        },
        fanaticism: 'none'
    },
    human: {
        name: loc('race_human'),
        desc: loc('race_human_desc'),
        type: 'humanoid',
        home: loc('race_human_home'),
        entity: loc('race_human_entity'),
        traits: {
            creative: 1,
            diverse: 1
        },
        solar: {
            red: loc('race_human_solar_red'),
            hell: loc('race_human_solar_hell'),
            gas: loc('race_human_solar_gas'),
            gas_moon: loc('race_human_solar_gas_moon'),
            dwarf: loc('race_human_solar_dwarf'),
        },
        fanaticism: 'creative'
    },
    elven: {
        name: loc('race_elven'),
        desc: loc(altRace('elven') ? 'race_xmas_elf_desc' : 'race_elven_desc'),
        type: 'humanoid',
        home: loc(altRace('elven') ? 'race_xmas_elf_home' : 'race_elven_home'),
        entity: loc('race_elven_entity'),
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
        fanaticism: 'studious'
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
        fanaticism: 'brute'
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
        fanaticism: 'curious'
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
        fanaticism: 'tracker'
    },
    vulpine: {
        name: loc(global.race.universe === 'magic' ? 'race_kitsune' : 'race_vulpine'),
        desc(){ return loc('race_vulpine_desc',[loc(global.race.universe === 'magic' ? 'race_kitsune' : 'race_vulpine'), foxColor()]); },
        type: 'carnivore',
        home: loc('race_vulpine_home'),
        entity: loc('race_vulpine_entity'),
        traits: {
            playful: 1,
            freespirit: 1
        },
        solar: {
            red: loc('race_vulpine_solar_red'),
            hell: loc('race_vulpine_solar_hell'),
            gas: loc('race_vulpine_solar_gas'),
            gas_moon: loc('race_vulpine_solar_gas_moon'),
            dwarf: loc('race_vulpine_solar_dwarf'),
        },
        fanaticism: 'playful'
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
        fanaticism: 'sniper'
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
        fanaticism: 'rage'
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
        fanaticism: 'calm'
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
        fanaticism: ''
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
        fanaticism: ''
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
        fanaticism: ''
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
        fanaticism: 'pack_rat'
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
        fanaticism: 'merchant'
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
        fanaticism: 'smart'
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
        fanaticism: 'tough'
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
        fanaticism: 'intelligent'
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
        fanaticism: 'regenerative'
    },
    tortoisan: {
        name: loc('race_tortoisan'),
        desc(){ return loc('race_tortoisan_desc',[shellColor()]); },
        type: 'reptilian',
        home: loc('race_tortoisan_home'),
        entity: loc('race_tortoisan_entity'),
        traits: {
            slow: 1,
            armored: 1
        },
        solar: {
            red: loc('race_tortoisan_solar_red'),
            hell: loc('race_tortoisan_solar_hell'),
            gas: loc('race_tortoisan_solar_gas'),
            gas_moon: loc('race_tortoisan_solar_gas_moon'),
            dwarf: loc('race_tortoisan_solar_dwarf'),
        },
        fanaticism: 'armored'
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
        fanaticism: 'optimistic'
    },
    slitheryn: {
        name: loc('race_slitheryn'),
        desc: loc('race_slitheryn_desc'),
        type: 'reptilian',
        home: loc('race_slitheryn_home'),
        entity: loc('race_slitheryn_entity'),
        traits: {
            slow_digestion: 1,
            hard_of_hearing: 1
        },
        solar: {
            red: loc('race_slitheryn_solar_red'),
            hell: loc('race_slitheryn_solar_hell'),
            gas: loc('race_slitheryn_solar_gas'),
            gas_moon: loc('race_slitheryn_solar_gas_moon'),
            dwarf: loc('race_slitheryn_solar_dwarf'),
        },
        fanaticism: 'slow_digestion'
    },
    arraak: {
        name: loc(altRace('arraak') ? 'race_turkey' : 'race_arraak'),
        desc: loc(altRace('arraak') ? 'race_turkey_desc' : 'race_arraak_desc'),
        type: 'avian',
        home: loc(altRace('arraak') ? 'race_turkey_home' : 'race_arraak_home'),
        entity: loc('race_arraak_entity'),
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
        fanaticism: 'resourceful'
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
        fanaticism: 'leathery'
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
        fanaticism: 'hoarder'
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
        fanaticism: 'kindling_kindred'
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
        fanaticism: 'hyper'
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
        fanaticism: 'sticky'
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
        fanaticism: 'infectious'
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
        fanaticism: 'toxic'
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
        fanaticism: 'infiltrator'
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
        fanaticism: 'cannibalize'
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
        fanaticism: 'claws'
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
        fanaticism: 'hivemind'
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
        fanaticism: 'blood_thirst'
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
        fanaticism: 'suction_grip'
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
        fanaticism: 'befuddle'
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
        fanaticism: 'musical'
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
        fanaticism: 'revive'
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
        fanaticism: 'forge'
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
        fanaticism: 'blurry'
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
        fanaticism: 'ghostly'
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
        fanaticism: 'lawless'
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
        fanaticism: 'humpback'
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
        fanaticism: 'fiery'
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
        fanaticism: 'conniving'
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
        fanaticism: 'spiritual'
    },
    unicorn: {
        name: loc('race_unicorn'),
        desc: loc('race_unicorn_desc'),
        type: 'angelic',
        home: loc('race_unicorn_home'),
        entity: loc('race_unicorn_entity'),
        traits: {
            rainbow: 1,
            magnificent: 1,
            noble: 1,
        },
        solar: {
            red: loc('race_unicorn_solar_red'),
            hell: loc('race_unicorn_solar_hell'),
            gas: loc('race_unicorn_solar_gas'),
            gas_moon: loc('race_unicorn_solar_gas_moon'),
            dwarf: loc('race_unicorn_solar_dwarf'),
        },
        fanaticism: 'magnificent'
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
        fanaticism: 'logical'
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
        fanaticism: 'shapeshifter'
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
        fanaticism: 'none'
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
        fanaticism: 'ooze'
    },
    custom: customRace()
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
    synthetic: {}
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
    races.sludge.type = global.race.hasOwnProperty('jtype') ? global.race.jtype : 'humanoid';;
}

function customRace(){
    if (global.hasOwnProperty('custom') && global.custom.hasOwnProperty('race0')){
        let trait = {};
        for (let i=0; i<global.custom.race0.traits.length; i++){
            trait[global.custom.race0.traits[i]] = 1;
        }

        let fanatic = 'pathetic';
        for (let i=0; i<global.custom.race0.traits.length; i++){
            if (traits[global.custom.race0.traits[i]].val > traits[fanatic].val){
                fanatic = global.custom.race0.traits[i];
            }
        }

        return {
            name: global.custom.race0.name,
            desc: global.custom.race0.desc,
            type: global.custom.race0.genus,
            home: global.custom.race0.home,
            entity: global.custom.race0.entity,
            traits: trait,
            solar: {
                red: global.custom.race0.red,
                hell: global.custom.race0.hell,
                gas: global.custom.race0.gas,
                gas_moon: global.custom.race0.gas_moon,
                dwarf: global.custom.race0.dwarf,
            },
            fanaticism: fanatic
        };
    }
    else {
        return {};
    }
}

/*
types: farmer, miner, lumberjack, science, factory, army, hunting
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
        modifier *= 1 + ((global.tech['reclaimer'] - 1) * 0.4);
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
    if (global.race['humpback'] && (type === 'miner' || type === 'lumberjack')){
        modifier *= 1.2;
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
        if (global.race.hasOwnProperty('casting') && global.race.casting[type === 'hellArmy' ? 'army' : type]){
            let boost = global.race.casting[type === 'hellArmy' ? 'army' : type];
            modifier *= 1 + (boost / (boost + 75));
        }
    }
    if (global.tech['cyber_worker'] && (type === 'lumberjack' || type === 'miner')){
        modifier *= 1.25;
    }
    if (global.race['high_pop']){
        modifier = highPopAdjust(modifier);
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
    let trait = trait_list[Math.floor(Math.seededRandom(0,trait_list.length))];
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
    if ((global.race['carnivore'] && !global.race['herbivore']) || global.race['soul_eater']) {
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
        case 'soul_eater':
            setJobName('lumberjack');
        case 'detritivore':
        case 'carnivore':
        case 'herbivore':
            adjustFood();
            break;
        case 'sappy':
            if (global.civic.d_job === 'quarry_worker'){
                global.civic.d_job = 'unemployed';
            }
            global.civic.quarry_worker.display = false;
            global.civic.quarry_worker.workers = 0;
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
                checkPurgatory('city','slave_pen',{ count: 0, slaves: 0 });
                if (global.city['slave_pen'].count > 0 && !global.race['orbit_decayed']) {
                    global.resource.Slave.display = true;
                }
            }
            break;
        case 'cannibalize':
            checkPurgatory('tech','sacrifice');
            if (global.tech['mining']) {
                global.city['s_alter'] = {
                    count: 0,
                    rage: 0,
                    mind: 0,
                    regen: 0,
                    mine: 0,
                    harvest: 0,
                };
            }
            break;
        case 'magnificent':
            if (global.tech['theology'] >= 2) {
                checkPurgatory('city','shrine',{
                    count: 0,
                    morale: 0,
                    metal: 0,
                    know: 0,
                    tax: 0
                });
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
            break;
        case 'slow':
            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
            if (webWorker.w){
                webWorker.w.terminate();
            }
            window.location.reload();
        case 'hyper':
            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
            if (webWorker.w){
                webWorker.w.terminate();
            }
            window.location.reload();
        case 'calm':
            if (global.tech['primitive'] >= 3) {
                checkPurgatory('city','meditation',{ count: 0 });
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
            break;
        case 'evil':
            setResourceName('Lumber');
            setResourceName('Furs');
            setResourceName('Plywood');
            break;
        case 'ooze':
            if (!global.tech['high_tech'] && global.race.species !== 'custom' && global.race.species !== 'sludge'){
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
        case 'soul_eater':
            setJobName('lumberjack');
        case 'detritivore':
        case 'carnivore':
        case 'herbivore':
            adjustFood();
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
            break;
        case 'cannibalize':
            removeFromQueue(['city-s_alter']);
            removeFromRQueue(['sacrifice']);
            setPurgatory('tech','sacrifice');
            delete global.city['s_alter'];
            removeTask('sacrifice');
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
            break;
        case 'slow':
            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
            if (webWorker.w){
                webWorker.w.terminate();
            }
            window.location.reload();
        case 'hyper':
            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
            if (webWorker.w){
                webWorker.w.terminate();
            }
            window.location.reload();
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
                        if (global.race.iTraits[t] === 0){
                            let rank = global.race[t];
                            delete global.race[t];
                            cleanRemoveTrait(t,rank);
                        }
                        else {
                            global.race[t] = global.race.iTraits[t];
                        }
                    }
                });
                delete global.race['iTraits'];
            }
            break;
        case 'evil':
            setResourceName('Lumber');
            setResourceName('Furs');
            setResourceName('Plywood');
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
            shapeShift(global.race['ss_genus'] === races[global.race['srace']].type ? 'none' : false, true);
        }

        let i_traits = [];
        Object.keys(genus_traits[races[global.race['srace']].type]).forEach(function (trait) {
            if (!global.race[trait]){
                i_traits.push(trait);
            }
        });
        if (global.race['srace'] === 'custom'){
            let list = ['evil','evil'];
            Object.keys(races[global.race['srace']].traits).forEach(function (trait) {
                if (traits[trait].val > traits[list[0]].val){
                    list[0] = trait;
                }
                else if (traits[trait].val < traits[list[1]].val){
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
    }
}

export function shapeShift(genus,setup){
    let shifted = global.race.hasOwnProperty('ss_traits') ? global.race.ss_traits : [];
    if (!setup){
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
        Object.keys(genus_traits).forEach(function (gen) {
            if (gen !== 'synthetic' && gen !== races[global.race.species].type && (!global.race['imitation'] || gen !== races[global.race['srace']].type) && global.stats.achieve[`genus_${gen}`] && global.stats.achieve[`genus_${gen}`].l > 0){
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
}

export function setTraitRank(trait,opts){
    opts = opts || {};
    if (global.race[trait] && !opts['force']){
        switch (global.race[trait]){
            case 0.25:
                global.race[trait] = opts['down'] ? 0.25 : 0.5;
                return opts['down'] ? false : true;
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
                global.race[trait] = opts['down'] ? 2 : 3;
                return opts['down'] ? true : false;
        }
    }
    else if (opts['set']){
        global.race[trait] = opts['set'];
        return true;
    }
    return false;
}

export function traitSkin(type,trait){
    switch (type){
        case 'name':
        {
            let name = {
                hooved: hoovedReskin(false),
                promiscuous: global.race['artifical'] ? loc('trait_promiscuous_synth_name') : traits['promiscuous'].name,
            };
            return trait ? (name[trait] ? name[trait] : traits[trait].name) : name;
        } 
        case 'desc':
        {
            let desc = {
                hooved: hoovedReskin(true),
                promiscuous: global.race['artifical'] ? loc('trait_promiscuous_synth') : traits['promiscuous'].desc,
            };
            return trait ? (desc[trait] ? desc[trait] : traits[trait].desc) : desc;
        }
    }
}

export function hoovedReskin(desc){
    if (global.race['sludge']){
        return desc ? loc('trait_hooved_slime') : loc('trait_hooved_slime_name');
    }
    else if (global.race.species === 'cath'){
        return desc ? loc('trait_hooved_cath') : loc('trait_hooved_cath_name');
    }
    else if (global.race.species === 'wolven'){
        return desc ? loc('trait_hooved_wolven') : loc('trait_hooved_wolven_name');
    }
    else if (global.race.species === 'seraph'){
        return desc ? loc('trait_hooved_seraph') : loc('trait_hooved_seraph_name');
    }
    else if (global.race.species === 'cyclops'){
        return desc ? loc('trait_hooved_cyclops') : loc('trait_hooved_cyclops_name');
    }
    else if (global.race.species === 'kobold'){
        return desc ? loc('trait_hooved_kobold') : loc('trait_hooved_kobold_name');
    }
    else if (global.race.species === 'tuskin'){
        return desc ? loc('trait_hooved_tuskin') : loc('trait_hooved_tuskin_name');
    }
    else if (races[global.race.species].type === 'humanoid'){
        return desc ? loc('trait_hooved_humanoid') : loc('trait_hooved_humanoid_name');
    }
    else if (races[global.race.species].type === 'plant'){
        return desc ? loc('trait_hooved_plant') : loc('trait_hooved_plant_name');
    }
    else if (races[global.race.species].type === 'fungi'){
        return desc ? loc('trait_hooved_fungi') : loc('trait_hooved_fungi_name');
    }
    else if (races[global.race.species].type === 'reptilian'){
        return desc ? loc('trait_hooved_reptilian') : loc('trait_hooved_reptilian_name');
    }
    else if (races[global.race.species].type === 'synthetic'){
        return desc ? loc('trait_hooved_synthetic') : loc('trait_hooved_synthetic_name');
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
        wiki: ['%']
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
};

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
