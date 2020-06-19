import { global, save, webWorker } from './vars.js';
import { loc } from './locale.js';
import { clearElement, removeFromQueue, removeFromRQueue, getEaster } from './functions.js';
import { unlockAchieve } from './achieve.js';

const date = new Date();
const easter = getEaster();

export const genus_traits = {
    humanoid: {
        adaptable: 1,
        wasteful: 1
    },
    animal: {
        beast: 1,
        cautious: 1
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
        hollow_bones: 1,
        rigid: 1
    },
    insectoid: {
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
    }
};

export const traits = {
    adaptable: { // Genetic Mutations occur faster from gene tampering
        name: loc('trait_adaptable_name'),
        desc: loc('trait_adaptable'),
        type: 'genus',
        val: 3,
        vars: [10]
    },
    wasteful: { // Craftings cost more materials
        name: loc('trait_wasteful_name'),
        desc: loc('trait_wasteful'),
        type: 'genus',
        val: -3,
        vars: [10]
    },
    xenophobic: { // Trade posts suffer a -1 penalty per post
        name: loc('trait_xenophobic_name'),
        desc: loc('trait_xenophobic'),
        type: 'genus',
        val: -5,
    },
    beast: { // Hunting improved when it's windy
        name: loc('trait_beast_name'),
        desc: loc('trait_beast'),
        type: 'genus',
        val: 2,
        vars: [15]
    },
    cautious: { // Rain reduces combat rating
        name: loc('trait_cautious_name'),
        desc: loc('trait_cautious'),
        type: 'genus',
        val: -2,
        vars: [10]
    },
    small: { // Reduces cost creep multipliers by 0.01
        name: loc('trait_small_name'),
        desc: loc('trait_small'),
        type: 'genus',
        val: 6,
        vars: [0.01,0.005]
    },
    weak: { // Lumberjacks, miners, and quarry workers are 10% less effective
        name: loc('trait_weak_name'),
        desc: loc('trait_weak'),
        type: 'genus',
        val: -3,
        vars: [10]
    },
    large: { // Increases cost creep multipliers by 0.005
        name: loc('trait_large_name'),
        desc: loc('trait_large'),
        type: 'genus',
        val: -5,
        vars: [0.005]
    },
    strong: { // Increased manual resource gain
        name: loc('trait_strong_name'),
        desc: loc('trait_strong'),
        type: 'genus',
        val: 1,
        vars: [5]
    },
    cold_blooded: { // Weather affects productivity
        name: loc('trait_cold_blooded_name'),
        desc: loc('trait_cold_blooded'),
        type: 'genus',
        val: -2,
        vars: [20,10]
    },
    scales: { // Minor decrease of soldiers killed in combat
        name: loc('trait_scales_name'),
        desc: loc('trait_scales'),
        type: 'genus',
        val: 5,
        vars: [2,1,1]
    },
    hollow_bones: { // Less Crafted Materials Needed
        name: loc('trait_hollow_bones_name'),
        desc: loc('trait_hollow_bones'),
        type: 'genus',
        val: 3,
        vars: [5]
    },
    rigid: { // Crafting production lowered slightly
        name: loc('trait_rigid_name'),
        desc: loc('trait_rigid'),
        type: 'genus',
        val: -1,
        vars: [1]
    },
    fast_growth: { // Greatly increases odds of population growth each cycle
        name: loc('trait_fast_growth_name'),
        desc: loc('trait_fast_growth'),
        type: 'genus',
        val: 3,
    },
    high_metabolism: { // Food requirements increased by 10%
        name: loc('trait_high_metabolism_name'),
        desc: loc('trait_high_metabolism'),
        type: 'genus',
        val: -1,
        vars: [5]
    },
    photosynth: { // Reduces food requirements dependant on sunshine.
        name: loc('trait_photosynth_name'),
        desc: loc('trait_photosynth'),
        type: 'genus',
        val: 3,
        vars: [40,20,10]
    },
    sappy: { // Stone is replaced with Amber.
        name: loc('trait_sappy_name'),
        desc: loc('trait_sappy',[loc('resource_Amber_name')]),
        type: 'genus',
        val: 4,
    },
    asymmetrical: { // Trade selling prices are slightly worse then normal
        name: loc('trait_asymmetrical_name'),
        desc: loc('trait_asymmetrical'),
        type: 'genus',
        val: -3,
        vars: [20]
    },
    detritivore: { // You eat dead matter
        name: loc('trait_detritivore_name'),
        desc: loc('trait_detritivore'),
        type: 'genus',
        val: 2,
    },
    spores: { // Birthrate increased when it's windy
        name: loc('trait_spores_name'),
        desc: loc('trait_spores'),
        type: 'genus',
        val: 2,
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
        vars: [10]
    },
    elusive: { // Spies are never caught
        name: loc('trait_elusive_name'),
        desc: loc('trait_elusive'),
        type: 'genus',
        val: 7,
    },
    iron_allergy: { // Iron mining reduced
        name: loc('trait_iron_allergy_name'),
        desc: loc('trait_iron_allergy'),
        type: 'genus',
        val: -4,
        vars: [25]
    },
    smoldering: { // Hot weather is a bonus
        name: loc('trait_smoldering_name'),
        desc: loc('trait_smoldering'),
        type: 'genus',
        val: 7,
        vars: [5,0.35,0.2]
    },
    cold_intolerance: { // Cold weather is a detriment
        name: loc('trait_cold_intolerance_name'),
        desc: loc('trait_cold_intolerance'),
        type: 'genus',
        val: -4,
        vars: [0.25]
    },
    chilled: { // Cold weather is a bonus
        name: loc('trait_chilled_name'),
        desc: loc('trait_chilled'),
        type: 'genus',
        val: 7,
        vars: [5,0.35,0.2,20,10,15]
    },
    heat_intolerance: { // Hot weather is a detriment
        name: loc('trait_heat_intolerance_name'),
        desc: loc('trait_heat_intolerance'),
        type: 'genus',
        val: -4,
        vars: [0.25]
    },
    scavenger: { // scavenger job is always available
        name: loc('trait_scavenger_name'),
        desc: loc('trait_scavenger'),
        type: 'genus',
        val: 3,
        vars: [25]
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
        val: 4,
    },
    pompous: { // Professors are less effective
        name: loc('trait_pompous_name'),
        desc: loc('trait_pompous'),
        type: 'genus',
        val: -6,
        vars: [75]
    },
    creative: { // A.R.P.A. Projects are cheaper
        name: loc('trait_creative_name'),
        desc: loc('trait_creative'),
        type: 'major',
        val: 8,
        vars: [0.005,20]
    },
    diverse: { // Training soldiers takes longer
        name: loc('trait_diverse_name'),
        desc: loc('trait_diverse'),
        type: 'major',
        val: -4,
        vars: [25]
    },
    studious: { // Professors generate an extra 0.25 Knowledge per second
        name: loc('trait_studious_name'),
        desc: loc('trait_studious'),
        type: 'major',
        val: 2,
        vars: [0.25]
    },
    arrogant: { // Market prices are higher
        name: loc('trait_arrogant_name'),
        desc: loc('trait_arrogant'),
        type: 'major',
        val: -2,
        vars: [10]
    },
    brute: { // Recruitment costs are 1/2 price
        name: loc('trait_brute_name'),
        desc: loc('trait_brute'),
        type: 'major',
        val: 7,
        vars: [50,2.5]
    },
    angry: { // When hungry you get hangry, low food penalty is more severe
        name: loc('trait_angry_name'),
        desc: loc('trait_angry'),
        type: 'major',
        val: -1,
        vars: [25]
    },
    lazy: { // All production is lowered when the temperature is hot
        name: loc('trait_lazy_name'),
        desc: loc('trait_lazy'),
        type: 'major',
        val: -4,
        vars: [10]
    },
    carnivore: { // No agriculture tech tree path, however unemployed citizens now act as hunters.
        name: loc('trait_carnivore_name'),
        desc: loc('trait_carnivore'),
        type: 'major',
        val: 2,
    },
    pack_mentality: { // Cabins cost more, but cottages cost less.
        name: loc('trait_pack_mentality_name'),
        desc: loc('trait_pack_mentality'),
        type: 'major',
        val: 4,
        vars: [0.03,0.02]
    },
    tracker: { // 10% increased gains from hunting
        name: loc('trait_tracker_name'),
        desc: loc('trait_tracker'),
        type: 'major',
        val: 2,
        vars: [10]
    },
    beast_of_burden: { // Gains more loot during raids
        name: loc('trait_beast_of_burden_name'),
        desc: loc('trait_beast_of_burden'),
        type: 'major',
        val: 3,
        vars: [10]
    },
    herbivore: { // No food is gained from hunting
        name: loc('trait_herbivore_name'),
        desc: loc('trait_herbivore'),
        type: 'major',
        val: -7,
    },
    pack_rat: { // Storage space is increased
        name: loc('trait_pack_rat_name'),
        desc: loc('trait_pack_rat'),
        type: 'major',
        val: 3,
        vars: [10,5]
    },
    paranoid: { // Bank capacity reduced by 10%
        name: loc('trait_paranoid_name'),
        desc: loc('trait_paranoid'),
        type: 'major',
        val: -3,
        vars: [10]
    },
    greedy: { // Lowers income from taxes
        name: loc('trait_greedy_name'),
        desc: loc('trait_greedy'),
        type: 'major',
        val: -5,
        vars: [12.5]
    },
    merchant: { // Better commodity selling prices
        name: loc('trait_merchant_name'),
        desc: loc('trait_merchant'),
        type: 'major',
        val: 3,
        vars: [25]
    },
    smart: { // Knowledge costs reduced by 10%
        name: loc('trait_smart_name'),
        desc: loc('trait_smart'),
        type: 'major',
        val: 6,
        vars: [10]
    },
    puny: { // Lowers minium bound for army score roll
        name: loc('trait_puny_name'),
        desc: loc('trait_puny'),
        type: 'major',
        val: -4,
    },
    dumb: { // Knowledge costs increased by 5%
        name: loc('trait_dumb_name'),
        desc: loc('trait_dumb'),
        type: 'major',
        val: -5,
        vars: [5]
    },
    tough: { // Mining output increased by 25%
        name: loc('trait_tough_name'),
        desc: loc('trait_tough'),
        type: 'major',
        val: 4,
        vars: [25]
    },
    nearsighted: { // Libraries are less effective
        name: loc('trait_nearsighted_name'),
        desc: loc('trait_nearsighted'),
        type: 'major',
        val: -4,
        vars: [12]
    },
    intelligent: { // Professors and Scientists add a global production bonus
        name: loc('trait_intelligent_name'),
        desc: loc('trait_intelligent'),
        type: 'major',
        val: 7,
        vars: [0.125,0.25]
    },
    regenerative: { // Wounded soldiers heal 4x as fast
        name: loc('trait_regenerative_name'),
        desc: loc('trait_regenerative'),
        type: 'major',
        val: 8,
        vars: [4]
    },
    gluttony: { // Eats 25% more food per rank
        name: loc('trait_gluttony_name'),
        desc: loc('trait_gluttony'),
        type: 'major',
        val: -2,
        vars: [10]
    },
    slow: { // The game moves at a 10% slower pace
        name: loc('trait_slow_name'),
        desc: loc('trait_slow'),
        type: 'major',
        val: -5,
    },
    armored: { // Less soldiers die in combat
        name: loc('trait_armored_name'),
        desc: loc('trait_armored'),
        type: 'major',
        val: 4,
        vars: [25,2]
    },
    optimistic: { // Minor reduction to stress
        name: loc('trait_optimistic_name'),
        desc: loc('trait_optimistic'),
        type: 'major',
        val: 5,
        vars: [10]
    },
    chameleon: { // Barracks have less soldiers
        name: loc('trait_chameleon_name'),
        desc: loc('trait_chameleon'),
        type: 'major',
        val: 6,
        vars: [20]
    },
    slow_digestion: { // Your race is more resilient to starvation
        name: loc('trait_slow_digestion_name'),
        desc: loc('trait_slow_digestion'),
        type: 'major',
        val: 1,
        vars: [0.75]
    },
    hard_of_hearing: { // University science cap gain reduced by 5%
        name: loc('trait_hard_of_hearing_name'),
        desc: loc('trait_hard_of_hearing'),
        type: 'major',
        val: -3,
        vars: [5]
    },
    resourceful: { // Crafting costs are reduced slightly
        name: loc('trait_resourceful_name'),
        desc: loc('trait_resourceful'),
        type: 'major',
        val: 4,
        vars: [10]
    },
    selenophobia: { // Moon phase directly affects productivity, on average this is slightly negative
        name: loc('trait_selenophobia_name'),
        desc: loc('trait_selenophobia'),
        type: 'major',
        val: -6,
    },
    leathery: { // Morale penalty from some weather conditions are reduced.
        name: loc('trait_leathery_name'),
        desc: loc('trait_leathery'),
        type: 'major',
        val: 2,
    },
    pessimistic: { // Minor increase to stress
        name: loc('trait_pessimistic_name'),
        desc: loc('trait_pessimistic'),
        type: 'major',
        val: -1,
        vars: [2]
    },
    hoarder: { // Banks can store 20% more money
        name: loc('trait_hoarder_name'),
        desc: loc('trait_hoarder'),
        type: 'major',
        val: 4,
        vars: [20]
    },
    solitary: { // Cabins are cheaper however cottages cost more
        name: loc('trait_solitary_name'),
        desc: loc('trait_solitary'),
        type: 'major',
        val: -1,
        vars: [0.02]
    },
    kindling_kindred: { // Lumber is no longer a resource, however other costs are increased for anything that would have used lumber to compensate.
        name: loc('trait_kindling_kindred_name'),
        desc: loc('trait_kindling_kindred'),
        type: 'major',
        val: 8,
        vars: [5]
    },
    pyrophobia: { // Smelter productivity is reduced
        name: loc('trait_pyrophobia_name'),
        desc: loc('trait_pyrophobia'),
        type: 'major',
        val: -4,
        vars: [10]
    },
    hyper: { // The game moves at a 5% faster pace
        name: loc('trait_hyper_name'),
        desc: loc('trait_hyper'),
        type: 'major',
        val: 4,
    },
    skittish: { // Thunderstorms lower all production
        name: loc('trait_skittish_name'),
        desc: loc('trait_skittish'),
        type: 'major',
        val: -4,
        vars: [12]
    },
    fragrant: { // Reduced Hunting effectiveness
        name: loc('trait_fragrant_name'),
        desc: loc('trait_fragrant'),
        type: 'major',
        val: -3,
        vars: [20]
    },
    sticky: { // Food req lowered, Incrsa
        name: loc('trait_sticky_name'),
        desc: loc('trait_sticky'),
        type: 'major',
        val: 3,
        vars: [20,15]
    },
    infectious: { // Attacking has a chance to infect other creatures and grow your population
        name: loc('trait_infectious_name'),
        desc: loc('trait_infectious'),
        type: 'major',
        val: 4,
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
        vars: [20,8,30]
    },
    nyctophilia: { // Productivity is lost when it is sunny
        name: loc('trait_nyctophilia_name'),
        desc: loc('trait_nyctophilia'),
        type: 'major',
        val: -3,
        vars: [5,2]
    },
    infiltrator: { // Cheap spies and sometimes steal tech from rivals
        name: loc('trait_infiltrator_name'),
        desc: loc('trait_infiltrator'),
        type: 'major',
        val: 4,
    },
    hibernator: { // Lower activity during winter
        name: loc('trait_hibernator_name'),
        desc: loc('trait_hibernator'),
        type: 'major',
        val: -3,
        vars: [25,8]
    },
    cannibalize: { // Eat your own for buffs
        name: loc('trait_cannibalize_name'),
        desc: loc('trait_cannibalize'),
        type: 'major',
        val: 5,
    },
    frail: { // More soldiers die in combat
        name: loc('trait_frail_name'),
        desc: loc('trait_frail'),
        type: 'major',
        val: -5,
    },
    malnutrition: { // The rationing penalty is weaker
        name: loc('trait_malnutrition_name'),
        desc: loc('trait_malnutrition'),
        type: 'major',
        val: 1,
        vars: [25]
    },
    claws: { // Raises maximum bound for army score roll
        name: loc('trait_claws_name'),
        desc: loc('trait_claws'),
        type: 'major',
        val: 5,
        vars: [20]
    },
    atrophy: { // More prone to starvation
        name: loc('trait_atrophy_name'),
        desc: loc('trait_atrophy'),
        type: 'major',
        val: -1,
        vars: [0.15]
    },
    hivemind: { // Jobs with low citizen counts assigned to them have reduced output, but those with high numbers have increased output. 
        name: loc('trait_hivemind_name'),
        desc: loc('trait_hivemind'),
        type: 'major',
        val: 9,
    },
    tunneler: { // Mines and Coal Mines are cheaper. 
        name: loc('trait_tunneler_name'),
        desc: loc('trait_tunneler'),
        type: 'major',
        val: 2,
        vars: [0.01]
    },
    frenzy: { // Combat causes a temporary increase in morale
        name: loc('trait_frenzy_name'),
        desc: loc('trait_frenzy'),
        type: 'major',
        val: 5,
    },
    apex_predator: { // Hunting and Combat ratings are significantly higher, but you can't use armor
        name: loc('trait_apex_predator_name'),
        desc: loc('trait_apex_predator'),
        type: 'major',
        val: 6,
        vars: [25,50]
    },
    invertebrate: { // You have no bones
        name: loc('trait_invertebrate_name'),
        desc: loc('trait_invertebrate'),
        type: 'major',
        val: -2,
        vars: [10]
    },
    suction_grip: { // Global productivity boost
        name: loc('trait_suction_grip_name'),
        desc: loc('trait_suction_grip'),
        type: 'major',
        val: 4,
        vars: [8]
    },
    befuddle: { // Spy actions complete in 1/2 time
        name: loc('trait_befuddle_name'),
        desc: loc('trait_befuddle'),
        type: 'major',
        val: 4,
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
        vars: [50]
    },
    musical: { // Entertainers are more effective
        name: loc('trait_musical_name'),
        desc: loc('trait_musical'),
        type: 'major',
        val: 5,
    },
    revive: { // Soldiers sometimes self res
        name: loc('trait_revive_name'),
        desc: loc('trait_revive'),
        type: 'major',
        val: 4,
    },
    slow_regen: { // Your soldiers wounds heal slower.
        name: loc('trait_slow_regen_name'),
        desc: loc('trait_slow_regen'),
        type: 'major',
        val: -4,
        vars: [25]
    },
    forge: { // Smelters do not require fuel
        name: loc('trait_forge_name'),
        desc: loc('trait_forge'),
        type: 'major',
        val: 4,
        vars: [1]
    },
    autoignition: { // Library knowledge bonus reduced
        name: loc('trait_autoignition_name'),
        desc: loc('trait_autoignition'),
        type: 'major',
        val: -4,
        vars: [3]
    },
    blurry: { // Increased success chance of spies
        name: loc('trait_blurry_name'),
        desc: loc('trait_blurry'),
        type: 'major',
        val: 5,
        vars: [25]
    },
    snowy: { // You lose morale if it's not snowing
        name: loc('trait_snowy_name'),
        desc: loc('trait_snowy'),
        type: 'major',
        val: -3,
        vars: [2,5]
    },
    ravenous: { // Drastically increases food consumption
        name: loc('trait_ravenous_name'),
        desc: loc('trait_ravenous'),
        type: 'major',
        val: -5,
    },
    ghostly: { // More souls from hunting and soul wells, increased soul gem drop chance
        name: loc('trait_ghostly_name'),
        desc: loc('trait_ghostly'),
        type: 'major',
        val: 5,
        vars: [50,1.5,15]
    },
    lawless: { // Government lockout timer is reduced by 90%
        name: loc('trait_lawless_name'),
        desc: loc('trait_lawless'),
        type: 'major',
        val: 3,
        vars: [90]
    },
    mistrustful: { // Lose standing with rival cities quicker
        name: loc('trait_mistrustful_name'),
        desc: loc('trait_mistrustful'),
        type: 'major',
        val: -1,
    },
    humpback: { // Starvation resistance and miner/lumberjack boost
        name: loc('trait_humpback_name'),
        desc: loc('trait_humpback'),
        type: 'major',
        val: 4,
        vars: [0.5]
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
        vars: [65,25]
    },
    terrifying: { // No one will trade with you
        name: loc('trait_terrifying_name'),
        desc: loc('trait_terrifying'),
        type: 'major',
        val: 6,
    },
    slaver: { // You capture victims and force them to work for you
        name: loc('trait_slaver_name'),
        desc: loc('trait_slaver'),
        type: 'major',
        val: 12,
    },
    compact: { // You hardly take up any space at all
        name: loc('trait_compact_name'),
        desc: loc('trait_compact'),
        type: 'major',
        val: 10,
        vars: [0.015,0.0075]
    },
    conniving: { // Better trade deals
        name: loc('trait_conniving_name'),
        desc: loc('trait_conniving'),
        type: 'major',
        val: 4,
        vars: [5,15]
    },
    pathetic: { // You suck at combat
        name: loc('trait_pathetic_name'),
        desc: loc('trait_pathetic'),
        type: 'major',
        val: -5,
        vars: [25]
    },
    spiritual: { // Temples are 13% more effective
        name: loc('trait_spiritual_name'),
        desc: loc('trait_spiritual'),
        type: 'major',
        val: 4,
        vars: [13]
    },
    truthful: { // Bankers are less effective
        name: loc('trait_truthful_name'),
        desc: loc('trait_truthful'),
        type: 'major',
        val: -7,
        vars: [50]
    },
    unified: { // Start with unification
        name: loc('trait_unified_name'),
        desc: loc('trait_unified'),
        type: 'major',
        val: 4,
    },
    rainbow: { // Gain a bonus if sunny after raining
        name: loc('trait_rainbow_name'),
        desc: loc('trait_rainbow'),
        type: 'major',
        val: 3,
        vars: [50]
    },
    magnificent: { // construct shrines to receive boons
        name: loc('trait_magnificent_name'),
        desc: loc('trait_magnificent'),
        type: 'major',
        val: 6,
    },
    noble: { // Unable to raise taxes above base value or set very low taxes
        name: loc('trait_noble_name'),
        desc: loc('trait_noble'),
        type: 'major',
        val: -3,
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
    },
    analytical: { // Science Bonus
        name: loc('trait_analytical_name'),
        desc: loc('trait_analytical'),
        type: 'minor',
    },
    promiscuous: { // Population Growth Bonus
        name: loc('trait_promiscuous_name'),
        desc: loc('trait_promiscuous'),
        type: 'minor',
    },
    resilient: { // Coal Mining Bonus
        name: loc('trait_resilient_name'),
        desc: loc('trait_resilient'),
        type: 'minor',
    },
    cunning: { // Hunting Bonus
        name: loc('trait_cunning_name'),
        desc: loc('trait_cunning'),
        type: 'minor',
    },
    hardy: { // Factory Woker Bonus
        name: loc('trait_hardy_name'),
        desc: loc('trait_hardy'),
        type: 'minor',
    },
    ambidextrous: { // Crafting Bonus
        name: loc('trait_ambidextrous_name'),
        desc: loc('trait_ambidextrous'),
        type: 'minor',
    },
    industrious: { // Miner Bonus
        name: loc('trait_industrious_name'),
        desc: loc('trait_industrious'),
        type: 'minor',
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
    },
    metallurgist: { // Alloy bonus
        name: loc('trait_metallurgist_name'),
        desc: loc('trait_metallurgist'),
        type: 'minor',
    },
    gambler: { // Alloy bonus
        name: loc('trait_gambler_name'),
        desc: loc('trait_gambler'),
        type: 'minor',
    },
    persuasive: { // Trade bonus
        name: loc('trait_persuasive_name'),
        desc: loc('trait_persuasive'),
        type: 'minor',
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
        desc: loc(date.getMonth() === 11 && date.getDate() >= 17 ? 'race_xmas_elf_desc' : 'race_elven_desc'),
        type: 'humanoid',
        home: loc(date.getMonth() === 11 && date.getDate() >= 17 ? 'race_xmas_elf_home' : 'race_elven_home'),
        entity: loc('race_elven_entity'),
        traits: { 
            studious: 1,
            arrogant: 1
        },
        solar: {
            red: loc(date.getMonth() === 11 && date.getDate() >= 17 ? 'race_xmas_elf_solar_red' : 'race_elven_solar_red'),
            hell: loc(date.getMonth() === 11 && date.getDate() >= 17 ? 'race_xmas_elf_solar_hell' : 'race_elven_solar_hell'),
            gas: loc(date.getMonth() === 11 && date.getDate() >= 17 ? 'race_xmas_elf_solar_gas' : 'race_elven_solar_gas'),
            gas_moon: loc(date.getMonth() === 11 && date.getDate() >= 17 ? 'race_xmas_elf_solar_gas_moon' : 'race_elven_solar_gas_moon'),
            dwarf: loc(date.getMonth() === 11 && date.getDate() >= 17 ? 'race_xmas_elf_solar_dwarf' : 'race_elven_solar_dwarf'),
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
        type: 'animal',
        home: loc('race_cath_home'),
        entity: loc('race_cath_entity'),
        traits: { 
            lazy: 1,
            carnivore: 1
        },
        solar: {
            red: loc('race_cath_solar_red'),
            hell: loc('race_cath_solar_hell'),
            gas: loc('race_cath_solar_gas'),
            gas_moon: loc('race_cath_solar_gas_moon'),
            dwarf: loc('race_cath_solar_dwarf'),
        },
        fanaticism: 'carnivore'
    },
    wolven: {
        name: easter.active ? loc('race_rabbit') : loc('race_wolven'),
        desc: easter.active ? loc('race_rabbit_desc') : loc('race_wolven_desc'),
        type: 'animal',
        home: easter.active ? loc('race_rabbit_home') : loc('race_wolven_home'),
        entity: easter.active ? loc('race_rabbit_entity') : loc('race_wolven_entity'),
        traits: { 
            pack_mentality: 1,
            tracker: 1
        },
        solar: {
            red: easter.active ? loc('race_rabbit_solar_red') : loc('race_wolven_solar_red'),
            hell: easter.active ? loc('race_rabbit_solar_hell') : loc('race_wolven_solar_hell'),
            gas: easter.active ? loc('race_rabbit_solar_gas') : loc('race_wolven_solar_gas'),
            gas_moon: easter.active ? loc('race_rabbit_solar_gas_moon') : loc('race_wolven_solar_gas_moon'),
            dwarf: easter.active ? loc('race_rabbit_solar_dwarf') : loc('race_wolven_solar_dwarf'),
        },
        fanaticism: 'tracker'
    },
    centaur: {
        name: loc('race_centaur'),
        desc: loc('race_centaur_desc'),
        type: 'animal',
        home: loc('race_centaur_home'),
        entity: loc('race_centaur_entity'),
        traits: {
            beast_of_burden: 1,
            herbivore: 1
        },
        solar: {
            red: loc('race_centaur_solar_red'),
            hell: loc('race_centaur_solar_hell'),
            gas: loc('race_centaur_solar_gas'),
            gas_moon: loc('race_centaur_solar_gas_moon'),
            dwarf: loc('race_centaur_solar_dwarf'),
        },
        fanaticism: 'beast_of_burden'
    },
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
    orge: {
        name: loc('race_ogre'),
        desc: loc('race_ogre_desc'),
        type: 'giant',
        home: loc('race_orge_home'),
        entity: loc('race_ogre_entity'),
        traits: { 
            dumb: 1,
            tough: 1
        },
        solar: {
            red: loc('race_orge_solar_red'),
            hell: loc('race_orge_solar_hell'),
            gas: loc('race_orge_solar_gas'),
            gas_moon: loc('race_orge_solar_gas_moon'),
            dwarf: loc('race_orge_solar_dwarf'),
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
        desc: loc('race_tortoisan_desc'),
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
        name: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey' : 'race_arraak'),
        desc: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey_desc' : 'race_arraak_desc'),
        type: 'avian',
        home: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey_home' : 'race_arraak_home'),
        entity: loc('race_arraak_entity'),
        traits: {
            resourceful: 1,
            selenophobia: 1
        },
        solar: {
            red: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey_solar_red' : 'race_arraak_solar_red'),
            hell: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey_solar_hell' : 'race_arraak_solar_hell'),
            gas: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey_solar_gas' : 'race_arraak_solar_gas'),
            gas_moon: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey_solar_gas_moon' : 'race_arraak_solar_gas_moon'),
            dwarf: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey_solar_dwarf' : 'race_arraak_solar_dwarf'),
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
        name: loc('race_entish'),
        desc: loc('race_entish_desc'),
        type: 'plant',
        home: loc('race_entish_home'),
        entity: loc('race_entish_entity'),
        traits: {
            kindling_kindred: 1,
            pyrophobia: 1
        },
        solar: {
            red: loc('race_entish_solar_red'),
            hell: loc('race_entish_solar_hell'),
            gas: loc('race_entish_solar_gas'),
            gas_moon: loc('race_entish_solar_gas_moon'),
            dwarf: loc('race_entish_solar_dwarf'),
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
            frenzy: 1,
            apex_predator: 1
        },
        solar: {
            red: loc('race_sharkin_solar_red'),
            hell: loc('race_sharkin_solar_hell'),
            gas: loc('race_sharkin_solar_gas'),
            gas_moon: loc('race_sharkin_solar_gas_moon'),
            dwarf: loc('race_sharkin_solar_dwarf'),
        },
        fanaticism: 'frenzy'
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
        name: loc('race_yeti'),
        desc: loc('race_yeti_desc'),
        type: 'polar',
        home: loc('race_yeti_home'),
        entity: loc('race_yeti_entity'),
        traits: {
            blurry: 1,
            snowy: 1
        },
        solar: {
            red: loc('race_yeti_solar_red'),
            hell: loc('race_yeti_solar_hell'),
            gas: loc('race_yeti_solar_gas'),
            gas_moon: loc('race_yeti_solar_gas_moon'),
            dwarf: loc('race_yeti_solar_dwarf'),
        },
        fanaticism: 'blurry'
    },
    wendigo: {
        name: loc('race_wendigo'),
        desc: loc('race_wendigo_desc'),
        type: 'polar',
        home: loc('race_wendigo_home'),
        entity: loc('race_wendigo_entity'),
        traits: {
            ravenous: 1,
            ghostly: 1,
            soul_eater: 1
        },
        solar: {
            red: loc('race_wendigo_solar_red'),
            hell: loc('race_wendigo_solar_hell'),
            gas: loc('race_wendigo_solar_gas'),
            gas_moon: loc('race_wendigo_solar_gas_moon'),
            dwarf: loc('race_wendigo_solar_dwarf'),
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
        name: loc(date.getMonth() === 1 && date.getDate() === 14 ? 'race_cherub' : 'race_seraph'),
        desc: loc(date.getMonth() === 1 && date.getDate() === 14 ? 'race_cherub_desc' : 'race_seraph_desc'),
        type: 'angelic',
        home: loc(date.getMonth() === 1 && date.getDate() === 14 ? 'race_cherub_home' : 'race_seraph_home'),
        entity: loc(date.getMonth() === 1 && date.getDate() === 14 ? 'race_cherub_entity' : 'race_seraph_entity'),
        traits: {
            unified: 1,
            spiritual: 1,
            truthful: 1
        },
        solar: {
            red: loc(date.getMonth() === 1 && date.getDate() === 14 ? 'race_cherub_solar_red' : 'race_seraph_solar_red'),
            hell: loc(date.getMonth() === 1 && date.getDate() === 14 ? 'race_cherub_solar_hell' : 'race_seraph_solar_hell'),
            gas: loc(date.getMonth() === 1 && date.getDate() === 14 ? 'race_cherub_solar_gas' : 'race_seraph_solar_gas'),
            gas_moon: loc(date.getMonth() === 1 && date.getDate() === 14 ? 'race_cherub_solar_gas_moon' : 'race_seraph_solar_gas_moon'),
            dwarf: loc(date.getMonth() === 1 && date.getDate() === 14 ? 'race_cherub_solar_dwarf' : 'race_seraph_solar_dwarf'),
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
    junker: {
        name: loc('race_junker'),
        desc: loc('race_junker_desc'),
        type: 'humanoid',
        home: loc('race_junker_home'),
        entity: loc('race_junker_entity'),
        traits: {
            diverse: 1,
            arrogant: 1,
            angry: 1,
            lazy: 1,
            herbivore: 1,
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
            hibernator: 1
        },
        solar: {
            red: loc('race_junker_solar_red'),
            hell: loc('race_junker_solar_hell'),
            gas: loc('race_junker_solar_gas'),
            gas_moon: loc('race_junker_solar_gas_moon'),
            dwarf: loc('race_junker_solar_dwarf'),
        },
        fanaticism: 'none'
    },
    custom: customRace()
};

function customRace(){
    if (global.hasOwnProperty('custom')){
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
    if (type === 'lumberjack' && global.race['evil'] && !global.race['soul_eater']){
        modifier *= 1 + ((global.tech['reclaimer'] - 1) * 0.4);
    }
    if (global.race['hivemind'] && type !== 'farmer'){
        if (workers <= 10){
            modifier *= (workers * 0.05) + 0.5;
        }
        else {
            let mod = type === 'army' ? 0.99 : 0.98;
            modifier *= 1 + (1 - (mod ** (workers - 10)));
        }
    }
    if(global.race['cold_blooded'] && type !== 'army' && type !== 'factory' && type !== 'science'){
        switch(global.city.calendar.temp){
            case 0:
                modifier *= 1 - (traits.cold_blooded.vars[0] / 100);
                break;
            case 2:
                modifier *= 1 + (traits.cold_blooded.vars[1] / 100);
                break;
            default:
                modifier *= 1;
                break;
        }
        switch(global.city.calendar.weather){
            case 0:
                modifier *= 1 - (traits.cold_blooded.vars[0] / 100);
                break;
            case 2:
                modifier *= 1 + (traits.cold_blooded.vars[1] / 100);
                break;
            default:
                modifier *= 1;
                break;
        }
    }
    if (global.race['cannibalize'] && global.city['s_alter'] && global.city['s_alter'].count > 0){
        if (type === 'miner' && global.city.s_alter.mine > 0){
            modifier *= 1.15; 
        }
        if (type === 'lumberjack' && global.city.s_alter.harvest > 0){
            modifier *= 1.15; 
        }
        if (type === 'army' && global.city.s_alter.rage > 0){
            modifier *= 1.15; 
        }
        if (type === 'science' && global.city.s_alter.mind > 0){
            modifier *= 1.15; 
        }
    }
    if (global.race['humpback'] && (type === 'miner' || type === 'lumberjack')){
        modifier *= 1.2;
    }
    if (global.city.ptrait === 'magnetic' && type === 'miner'){
        modifier *= 0.985;
    }
    if (global.race['weak'] && (type === 'miner' || type === 'lumberjack')){
        modifier *= 1 - (traits.weak.vars[0] / 100);
    }
    if (global.race['hydrophilic'] && global.city.calendar.weather === 0 && global.city.calendar.temp > 0 && type !== 'factory'){
        modifier *= 0.75;
    }
    if (global.race['toxic'] && type === 'factory'){
        modifier *= 1 + (traits.toxic.vars[2] / 100);
    }
    if (global.race['hardy'] && type === 'factory'){
        modifier *= 1 + (global.race['hardy'] / 100);
    }
    if (global.race['analytical'] && type === 'science'){
        modifier *= 1 + (global.race['analytical'] / 100);
    }
    if (global.civic.govern.type === 'democracy'){
        modifier *= 0.95;
    }
    return modifier;
}

export function randomMinorTrait(){
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
        global.race[trait]++;
    }
    else {
        global.race[trait] = 1;
    }
    return trait;
}

export function cleanAddTrait(trait){
    switch (trait){
        case 'kindling_kindred':
            global.resource.Lumber.display = false;
            global.resource.Lumber.crates = 0;
            global.resource.Lumber.containers = 0;
            global.resource.Lumber.trade = 0;
            global.resource.Plywood.display = false;
            global.city['lumber'] = 0;
            removeFromQueue(['city-graveyard', 'city-lumber_yard', 'city-sawmill']);
            removeFromRQueue(['reclaimer', 'axe', 'saw']);
            if (global.city['sawmill']){
                delete global.city['sawmill'];
            }
            if (global.city['graveyard']){
                delete global.city['graveyard'];
            }
            if (global.city['lumber_yard']){
                delete global.city['lumber_yard'];
            }
            delete global.tech['axe'];
            delete global.tech['reclaimer'];
            delete global.tech['saw'];
            global.civic.lumberjack.display = false;
            global.civic.lumberjack.workers = 0;
            if (global.civic.d_job === 'lumberjack') {
                global.civic.d_job = 'unemployed';
            }   
            if (global.tech['foundry']){
                global.civic.craftsman.workers -= global.city.foundry['Plywood'];
                global.city.foundry.crafting -= global.city.foundry['Plywood'];
                global.city.foundry['Plywood'] = 0;
                global['loadFoundry'] = true;
            }
            if (global.city['s_alter']) {
                global.city.s_alter.harvest = 0;
            }
            break;
        case 'carnivore':
            removeFromQueue(['city-farm', 'city-silo', 'city-mill']);
            removeFromRQueue(['farm', 'agriculture']);
            if (global.tech['farm'] >= 1){
                global.tech['hunting'] = 2;
            }
            else if (global.tech['agriculture'] >= 3){
                global.tech['hunting'] = 1;
            }
            if (global.city['farm']){
                global.city['lodge'] = { count: global.city.farm.count };
                delete global.city['farm'];
            }
            if (global.city['silo']){
                global.city['smokehouse'] = { count: global.city.silo.count };
                delete global.city['silo'];
            }
            else{
                global.city['smokehouse'] = { count: 0 };
            }
            if (global.city['mill']){
                delete global.city['mill'];
            }
            delete global.tech['agriculture'];
            delete global.tech['farm'];
            global.civic.farmer.workers = 0;
            global.civic.farmer.max = 0;
            global.civic.farmer.display = false;
            if (global.civic.d_job === 'farmer') {
                global.civic.d_job = 'unemployed';
            }
            break;
        case 'apex_predator':
            removeFromRQueue(['armor']);
            delete global.tech['armor'];
            break;
        case 'terrifying':
            Object.keys(global.resource).forEach(function (res){
                global.resource[res].trade = 0;
            });
            global.settings.showMarket = false;
            if (global.settings.marketTabs === 0) {
                global.settings.marketTabs = 1;
            }
            break;
        case 'slaver':
            global.tech['slaves'] = 2;
            global.city['slave_pen'] = { count: 0, slaves: 0 };
            break;
        case 'cannibalize':
            global.city['s_alter'] = {
                count: 0,
                rage: 0,
                mind: 0,
                regen: 0,
                mine: 0,
                harvest: 0,
            };
            break;
        case 'magnificent':
            global.city['shrine'] = {
                count: 0,
                morale: 0,
                metal: 0,
                know: 0,
                tax: 0
            };
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
                    let occ_amount = global.civic.govern.type === 'federation' ? 15 : 20;
                    global.civic['garrison'].max += occ_amount;
                    global.civic['garrison'].workers += occ_amount;
                    global.civic.foreign[`gov${i}`].occ = false;
                }
                global.civic.foreign[`gov${i}`].buy = false;
                global.civic.foreign[`gov${i}`].anx = false;
                global.civic.foreign[`gov${i}`].sab = 0;
                global.civic.foreign[`gov${i}`].act = 'none';
            }
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
            delete global.city['wharf'];
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
        default:
            break;
    }
}

export function cleanRemoveTrait(trait){
    switch (trait){
        case 'kindling_kindred':
            global.resource.Lumber.display = true;
            if (global.tech['foundry']){
                global.resource.Plywood.display = true;
            }
            break;
        case 'carnivore':
            global.civic.farmer.display = true;
            removeFromQueue(['city-lodge', 'city-smokehouse', 'city-windmill']);
            removeFromRQueue(['hunting', 'wind_plant']);
            global.tech['agriculture'] = 1;
            if (global.tech['hunting'] >= 2){
                global.tech['farm'] = 1;
            }
            delete global.tech['hunting'];
            delete global.tech['wind_plant'];
            if (global.city['lodge']){
                global.city['farm'] = { count: global.city.lodge.count };
                delete global.city['lodge'];
            }
            if (global.city['smokehouse']){
                global.city['silo'] = { count: global.city.smokehouse.count };
                delete global.city['smokehouse'];
            }
            if (global.city['windmill']){
                global.city['mill'] = { count: global.city.windmill.count };
                delete global.city['windmill'];
            }
            break;
        case 'terrifying':
            global.settings.showMarket = true;
            break;
        case 'slaver':
            removeFromQueue(['city-slave_pen']);
            removeFromRQueue(['slaves']);
            delete global.city['slave_pen'];
            delete global.tech['slaves'];
            global.resource.Slave.amount = 0;
            global.resource.Slave.max = 0;
            global.resource.Slave.display = false;
            break;
        case 'cannibalize':
            removeFromQueue(['city-s_alter']);
            removeFromRQueue(['sacrifice']);
            delete global.city['s_alter'];
            break;
        case 'magnificent':
            delete global.city['shrine'];
            break;
        case 'thalassophobia':
            if (global.tech['wharf']){
                global.city['wharf'] = { count: 0 };
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
        default:
            break;
    }
}

export const biomes = {
    grassland: {
        label: loc('biome_grassland_name'),
        desc: loc('biome_grassland')
    },
    oceanic: {
        label: loc('biome_oceanic_name'),
        desc: loc('biome_oceanic')
    },
    forest: {
        label: loc('biome_forest_name'),
        desc: loc('biome_forest')
    },
    desert: {
        label: loc('biome_desert_name'),
        desc: loc('biome_desert')
    },
    volcanic: {
        label: loc('biome_volcanic_name'),
        desc: loc('biome_volcanic')
    },
    tundra: {
        label: loc('biome_tundra_name'),
        desc: loc('biome_tundra')
    },
    hellscape: {
        label: loc('biome_hellscape_name'),
        desc: loc('biome_hellscape')
    },
    eden: {
        label: loc('biome_eden_name'),
        desc: loc('biome_eden')
    }
};

export const planetTraits = {
    toxic: {
        label: loc('planet_toxic'),
        desc: loc('planet_toxic_desc')
    },
    mellow: {
        label: loc('planet_mellow'),
        desc: loc('planet_mellow_desc')
    },
    rage: {
        label: loc('planet_rage'),
        desc: loc('planet_rage_desc')
    },
    stormy: {
        label: loc('planet_stormy'),
        desc: loc('planet_stormy_desc')
    },
    ozone: {
        label: loc('planet_ozone'),
        desc: loc('planet_ozone_desc')
    },
    magnetic: {
        label: loc('planet_magnetic'),
        desc: loc('planet_magnetic_desc')
    },
    trashed: {
        label: loc('planet_trashed'),
        desc: loc('planet_trashed_desc')
    },
    elliptical: {
        label: loc('planet_elliptical'),
        desc: loc('planet_elliptical_desc')
    },
    flare: {
        label: loc('planet_flare'),
        desc: loc('planet_flare_desc')
    },
    dense: {
        label: loc('planet_dense'),
        desc: loc('planet_dense_desc')
    },
    unstable: {
        label: loc('planet_unstable'),
        desc: loc('planet_unstable_desc')
    }
};
