import { global, vues, messageQueue, set_alevel, poppers } from './vars.js';
import { loc } from './locale.js'

if (!global.stats['achieve']){
    global.stats['achieve'] = {};
}

if (!global.stats['feat']){
    global.stats['feat'] = {};
}

var achievements = {
    apocalypse: {
        name: loc("achieve_apocalypse_name"),
        desc: loc("achieve_apocalypse_desc"),
        flair: loc("achieve_apocalypse_flair")
    },
    squished: {
        name: loc("achieve_squished_name"),
        desc: loc("achieve_squished_desc"),
        flair: loc("achieve_squished_flair")
    },
    second_evolution: {
        name: loc("achieve_second_evolution_name"),
        desc: loc("achieve_second_evolution_desc"),
        flair: loc("achieve_second_evolution_flair")
    },
    blackhole: {
        name: loc("achieve_blackhole_name"),
        desc: loc("achieve_blackhole_desc"),
        flair: loc("achieve_blackhole_flair")
    },
    warmonger: {
        name: loc("achieve_warmonger_name"),
        desc: loc("achieve_warmonger_desc"),
        flair: loc("achieve_warmonger_flair")
    },
    red_tactics: {
        name: loc("achieve_red_tactics_name"),
        desc: loc("achieve_red_tactics_desc"),
        flair: loc("achieve_red_tactics_flair")
    },
    pacifist: {
        name: loc("achieve_pacifist_name"),
        desc: loc("achieve_pacifist_desc"),
        flair: loc("achieve_pacifist_flair")
    },
    madagascar_tree: {
        name: loc("achieve_madagascar_tree_name"),
        desc: loc("achieve_madagascar_tree_desc"),
        flair: loc("achieve_madagascar_tree_flair")
    },
    laser_shark: {
        name: loc("achieve_laser_shark_name"),
        desc: loc("achieve_laser_shark_desc"),
        flair: loc("achieve_laser_shark_flair")
    },
    infested: {
        name: loc("achieve_infested_name"),
        desc: loc("achieve_infested_desc"),
        flair: loc("achieve_infested_flair")
    },
    mass_starvation: {
        name: loc("achieve_mass_starvation_name"),
        desc: loc("achieve_mass_starvation_desc"),
        flair: loc("achieve_mass_starvation_flair")
    },
    colonist: {
        name: loc("achieve_colonist_name"),
        desc: loc("achieve_colonist_desc"),
        flair: loc("achieve_colonist_flair",[global.race.species])
    },
    world_domination: {
        name: loc("achieve_world_domination_name"),
        desc: loc("achieve_world_domination_desc"),
        flair: loc("achieve_world_domination_flair")
    },
    illuminati: {
        name: loc("achieve_illuminati_name"),
        desc: loc("achieve_illuminati_desc"),
        flair: loc("achieve_illuminati_flair")
    },
    syndicate: {
        name: loc("achieve_syndicate_name"),
        desc: loc("achieve_syndicate_desc"),
        flair: loc("achieve_syndicate_flair")
    },
    cult_of_personality: {
        name: loc("achieve_cult_of_personality_name"),
        desc: loc("achieve_cult_of_personality_desc"),
        flair: loc("achieve_cult_of_personality_flair")
    },
    doomed: {
        name: loc("achieve_doomed_name"),
        desc: loc("achieve_doomed_desc"),
        flair: loc("achieve_doomed_flair")
    },
    pandemonium: {
        name: loc("achieve_pandemonium_name"),
        desc: loc("achieve_pandemonium_desc"),
        flair: loc("achieve_pandemonium_flair")
    },
    blood_war: {
        name: loc("achieve_blood_war_name"),
        desc: loc("achieve_blood_war_desc"),
        flair: loc("achieve_blood_war_flair")
    },
    landfill: {
        name: loc("achieve_landfill_name"),
        desc: loc("achieve_landfill_desc"),
        flair: loc("achieve_landfill_flair")
    },
    seeder: {
        name: loc("achieve_seeder_name"),
        desc: loc("achieve_seeder_desc"),
        flair: loc("achieve_seeder_flair")
    },
    macro: {
        name: loc("achieve_macro_name"),
        desc: loc("achieve_macro_desc"),
        flair: loc("achieve_macro_flair")
    },
    marble: {
        name: loc("achieve_marble_name"),
        desc: loc("achieve_marble_desc"),
        flair: loc("achieve_marble_flair")
    },
    explorer: {
        name: loc("achieve_biome_explorer_name"),
        desc: loc("achieve_biome_explorer_desc"),
        flair: loc("achieve_biome_explorer_flair")
    },
    joyless: {
        name: loc("achieve_joyless_name"),
        desc: loc("achieve_joyless_desc"),
        flair: loc("achieve_joyless_flair")
    },
    biome_grassland: {
        name: loc("achieve_biome_grassland_name"),
        desc: loc("achieve_biome_grassland_desc"),
        flair: loc("achieve_biome_grassland_flair")
    },
    biome_oceanic: {
        name: loc("achieve_biome_oceanic_name"),
        desc: loc("achieve_biome_oceanic_desc"),
        flair: loc("achieve_biome_oceanic_flair")
    },
    biome_forest: {
        name: loc("achieve_biome_forest_name"),
        desc: loc("achieve_biome_forest_desc"),
        flair: loc("achieve_biome_forest_flair")
    },
    biome_desert: {
        name: loc("achieve_biome_desert_name"),
        desc: loc("achieve_biome_desert_desc"),
        flair: loc("achieve_biome_desert_flair")
    },
    biome_volcanic: {
        name: loc("achieve_biome_volcanic_name"),
        desc: loc("achieve_biome_volcanic_desc"),
        flair: loc("achieve_biome_volcanic_flair")
    },
    biome_tundra: {
        name: loc("achieve_biome_tundra_name"),
        desc: loc("achieve_biome_tundra_desc"),
        flair: loc("achieve_biome_tundra_flair")
    },
    biome_hellscape: {
        name: loc("achieve_biome_hellscape_name"),
        desc: loc("achieve_biome_hellscape_desc"),
        flair: loc("achieve_biome_hellscape_flair")
    },
    biome_eden: {
        name: loc("achieve_biome_eden_name"),
        desc: loc("achieve_biome_eden_desc"),
        flair: loc("achieve_biome_eden_flair")
    },
    creator: {
        name: loc("achieve_creator_name"),
        desc: loc("achieve_creator_desc"),
        flair: loc("achieve_creator_flair")
    },
    heavyweight: {
        name: loc("achieve_heavyweight_name"),
        desc: loc("achieve_heavyweight_desc"),
        flair: loc("achieve_heavyweight_flair")
    },
    whitehole: {
        name: loc("achieve_whitehole_name"),
        desc: loc("achieve_whitehole_desc"),
        flair: loc("achieve_whitehole_flair")
    },
    heavy: {
        name: loc("achieve_heavy_name"),
        desc: loc("achieve_heavy_desc"),
        flair: loc("achieve_heavy_flair")
    },
    canceled: {
        name: loc("achieve_canceled_name"),
        desc: loc("achieve_canceled_desc"),
        flair: loc("achieve_canceled_flair")
    },
    eviltwin: {
        name: loc("achieve_eviltwin_name"),
        desc: loc("achieve_eviltwin_desc"),
        flair: loc("achieve_eviltwin_flair")
    },
    microbang: {
        name: loc("achieve_microbang_name"),
        desc: loc("achieve_microbang_desc"),
        flair: loc("achieve_microbang_flair")
    },
    dissipated: {
        name: loc("achieve_dissipated_name"),
        desc: loc("achieve_dissipated_desc"),
        flair: loc("achieve_dissipated_flair")
    },
    genus_humanoid: {
        name: loc("achieve_genus_humanoid_name"),
        desc: loc("achieve_genus_humanoid_desc"),
        flair: loc("achieve_genus_humanoid_flair")
    },
    genus_animal: {
        name: loc("achieve_genus_animal_name"),
        desc: loc("achieve_genus_animal_desc"),
        flair: loc("achieve_genus_animal_flair")
    },
    genus_small: {
        name: loc("achieve_genus_small_name"),
        desc: loc("achieve_genus_small_desc"),
        flair: loc("achieve_genus_small_flair")
    },
    genus_giant: {
        name: loc("achieve_genus_giant_name"),
        desc: loc("achieve_genus_giant_desc"),
        flair: loc("achieve_genus_giant_flair")
    },
    genus_reptilian: {
        name: loc("achieve_genus_reptilian_name"),
        desc: loc("achieve_genus_reptilian_desc"),
        flair: loc("achieve_genus_reptilian_flair")
    },
    genus_avian: {
        name: loc("achieve_genus_avian_name"),
        desc: loc("achieve_genus_avian_desc"),
        flair: loc("achieve_genus_avian_flair")
    },
    genus_insectoid: {
        name: loc("achieve_genus_insectoid_name"),
        desc: loc("achieve_genus_insectoid_desc"),
        flair: loc("achieve_genus_insectoid_flair")
    },
    genus_plant: {
        name: loc("achieve_genus_plant_name"),
        desc: loc("achieve_genus_plant_desc"),
        flair: loc("achieve_genus_plant_flair")
    },
    genus_fungi: {
        name: loc("achieve_genus_fungi_name"),
        desc: loc("achieve_genus_fungi_desc"),
        flair: loc("achieve_genus_fungi_flair")
    },
    genus_aquatic: {
        name: loc("achieve_genus_aquatic_name"),
        desc: loc("achieve_genus_aquatic_desc"),
        flair: loc("achieve_genus_aquatic_flair")
    },
    genus_demonic: {
        name: loc("achieve_genus_demonic_name"),
        desc: loc("achieve_genus_demonic_desc"),
        flair: loc("achieve_genus_demonic_flair")
    },
    genus_angelic: {
        name: loc("achieve_genus_angelic_name"),
        desc: loc("achieve_genus_angelic_desc"),
        flair: loc("achieve_genus_angelic_flair")
    },
    atmo_toxic: {
        name: loc("achieve_atmo_toxic_name"),
        desc: loc("achieve_atmo_toxic_desc"),
        flair: loc("achieve_atmo_toxic_flair")
    },
    atmo_mellow: {
        name: loc("achieve_atmo_mellow_name"),
        desc: loc("achieve_atmo_mellow_desc"),
        flair: loc("achieve_atmo_mellow_flair")
    },
    atmo_rage: {
        name: loc("achieve_atmo_rage_name"),
        desc: loc("achieve_atmo_rage_desc"),
        flair: loc("achieve_atmo_rage_flair")
    },
    atmo_stormy: {
        name: loc("achieve_atmo_stormy_name"),
        desc: loc("achieve_atmo_stormy_desc"),
        flair: loc("achieve_atmo_stormy_flair")
    },
    atmo_ozone: {
        name: loc("achieve_atmo_ozone_name"),
        desc: loc("achieve_atmo_ozone_desc"),
        flair: loc("achieve_atmo_ozone_flair")
    },
    atmo_magnetic: {
        name: loc("achieve_atmo_magnetic_name"),
        desc: loc("achieve_atmo_magnetic_desc"),
        flair: loc("achieve_atmo_magnetic_flair")
    },
    atmo_trashed: {
        name: loc("achieve_atmo_trashed_name"),
        desc: loc("achieve_atmo_trashed_desc"),
        flair: loc("achieve_atmo_trashed_flair")
    },
    mass_extinction: {
        name: loc("achieve_mass_extinction_name"),
        desc: loc("achieve_mass_extinction_desc"),
        flair: loc("achieve_mass_extinction_flair")
    },
    vigilante: {
        name: loc("achieve_vigilante_name"),
        desc: loc("achieve_vigilante_desc"),
        flair: loc("achieve_vigilante_flair")
    },
    extinct_human: {
        name: loc("achieve_extinct_human_name"),
        desc: loc("achieve_extinct_human_desc"),
        flair: loc("achieve_extinct_human_flair")
    },
    extinct_elven: {
        name: loc("achieve_extinct_elven_name"),
        desc: loc("achieve_extinct_elven_desc"),
        flair: loc("achieve_extinct_elven_flair")
    },
    extinct_orc: {
        name: loc("achieve_extinct_orc_name"),
        desc: loc("achieve_extinct_orc_desc"),
        flair: loc("achieve_extinct_orc_flair")
    },
    extinct_cath: {
        name: loc("achieve_extinct_cath_name"),
        desc: loc("achieve_extinct_cath_desc"),
        flair: loc("achieve_extinct_cath_flair")
    },
    extinct_wolven: {
        name: loc("achieve_extinct_wolven_name"),
        desc: loc("achieve_extinct_wolven_desc"),
        flair: loc("achieve_extinct_wolven_flair")
    },
    extinct_centaur: {
        name: loc("achieve_extinct_centaur_name"),
        desc: loc("achieve_extinct_centaur_desc"),
        flair: loc("achieve_extinct_centaur_flair")
    },
    extinct_kobold: {
        name: loc("achieve_extinct_kobold_name"),
        desc: loc("achieve_extinct_kobold_desc"),
        flair: loc("achieve_extinct_kobold_flair")
    },
    extinct_goblin: {
        name: loc("achieve_extinct_goblin_name"),
        desc: loc("achieve_extinct_goblin_desc"),
        flair: loc("achieve_extinct_goblin_flair")
    },
    extinct_gnome: {
        name: loc("achieve_extinct_gnome_name"),
        desc: loc("achieve_extinct_gnome_desc"),
        flair: loc("achieve_extinct_gnome_flair")
    },
    extinct_orge: {
        name: loc("achieve_extinct_orge_name"),
        desc: loc("achieve_extinct_orge_desc"),
        flair: loc("achieve_extinct_orge_flair")
    },
    extinct_cyclops: {
        name: loc("achieve_extinct_cyclops_name"),
        desc: loc("achieve_extinct_cyclops_desc"),
        flair: loc("achieve_extinct_cyclops_flair")
    },
    extinct_troll: {
        name: loc("achieve_extinct_troll_name"),
        desc: loc("achieve_extinct_troll_desc"),
        flair: loc("achieve_extinct_troll_flair")
    },
    extinct_tortoisan: {
        name: loc("achieve_extinct_tortoisan_name"),
        desc: loc("achieve_extinct_tortoisan_desc"),
        flair: loc("achieve_extinct_tortoisan_flair")
    },
    extinct_gecko: {
        name: loc("achieve_extinct_gecko_name"),
        desc: loc("achieve_extinct_gecko_desc"),
        flair: loc("achieve_extinct_gecko_flair")
    },
    extinct_slitheryn: {
        name: loc("achieve_extinct_slitheryn_name"),
        desc: loc("achieve_extinct_slitheryn_desc"),
        flair: loc("achieve_extinct_slitheryn_flair")
    },
    extinct_arraak: {
        name: loc("achieve_extinct_arraak_name"),
        desc: loc("achieve_extinct_arraak_desc"),
        flair: loc("achieve_extinct_arraak_flair")
    },
    extinct_pterodacti: {
        name: loc("achieve_extinct_pterodacti_name"),
        desc: loc("achieve_extinct_pterodacti_desc"),
        flair: loc("achieve_extinct_pterodacti_flair")
    },
    extinct_dracnid: {
        name: loc("achieve_extinct_dracnid_name"),
        desc: loc("achieve_extinct_dracnid_desc"),
        flair: loc("achieve_extinct_dracnid_flair")
    },
    extinct_entish: {
        name: loc("achieve_extinct_entish_name"),
        desc: loc("achieve_extinct_entish_desc"),
        flair: loc("achieve_extinct_entish_flair")
    },
    extinct_cacti: {
        name: loc("achieve_extinct_cacti_name"),
        desc: loc("achieve_extinct_cacti_desc"),
        flair: loc("achieve_extinct_cacti_flair")
    },
    extinct_sporgar: {
        name: loc("achieve_extinct_sporgar_name"),
        desc: loc("achieve_extinct_sporgar_desc"),
        flair: loc("achieve_extinct_sporgar_flair")
    },
    extinct_shroomi: {
        name: loc("achieve_extinct_shroomi_name"),
        desc: loc("achieve_extinct_shroomi_desc"),
        flair: loc("achieve_extinct_shroomi_flair")
    },
    extinct_mantis: {
        name: loc("achieve_extinct_mantis_name"),
        desc: loc("achieve_extinct_mantis_desc"),
        flair: loc("achieve_extinct_mantis_flair")
    },
    extinct_scorpid: {
        name: loc("achieve_extinct_scorpid_name"),
        desc: loc("achieve_extinct_scorpid_desc"),
        flair: loc("achieve_extinct_scorpid_flair")
    },
    extinct_antid: {
        name: loc("achieve_extinct_antid_name"),
        desc: loc("achieve_extinct_antid_desc"),
        flair: loc("achieve_extinct_antid_flair")
    },
    extinct_sharkin: {
        name: loc("achieve_extinct_sharkin_name"),
        desc: loc("achieve_extinct_sharkin_desc"),
        flair: loc("achieve_extinct_sharkin_flair")
    },
    extinct_octigoran: {
        name: loc("achieve_extinct_octigoran_name"),
        desc: loc("achieve_extinct_octigoran_desc"),
        flair: loc("achieve_extinct_octigoran_flair")
    },
    extinct_balorg: {
        name: loc("achieve_extinct_balorg_name"),
        desc: loc("achieve_extinct_balorg_desc"),
        flair: loc("achieve_extinct_balorg_flair")
    },
    extinct_imp: {
        name: loc("achieve_extinct_imp_name"),
        desc: loc("achieve_extinct_imp_desc"),
        flair: loc("achieve_extinct_imp_flair")
    },
    extinct_seraph: {
        name: loc("achieve_extinct_seraph_name"),
        desc: loc("achieve_extinct_seraph_desc"),
        flair: loc("achieve_extinct_seraph_flair")
    },
    extinct_unicorn: {
        name: loc("achieve_extinct_unicorn_name"),
        desc: loc("achieve_extinct_unicorn_desc"),
        flair: loc("achieve_extinct_unicorn_flair")
    },
    extinct_junker: {
        name: loc("achieve_extinct_junker_name"),
        desc: loc("achieve_extinct_junker_desc"),
        flair: loc("achieve_extinct_junker_flair")
    }
};

const feats = {
    take_no_advice: {
        name: loc("feat_take_no_advice_name"),
        desc: loc("feat_take_no_advice_desc"),
        flair: loc("feat_take_no_advice_flair")
    },
    ill_advised: {
        name: loc("feat_ill_advised_name"),
        desc: loc("feat_ill_advised_desc"),
        flair: loc("feat_ill_advised_flair")
    },
    organ_harvester: {
        name: loc("feat_organ_harvester_name"),
        desc: loc("feat_organ_harvester_desc"),
        flair: loc("feat_organ_harvester_flair")
    },
    the_misery: {
        name: loc("feat_the_misery_name"),
        desc: loc("feat_the_misery_desc"),
        flair: loc("feat_the_misery_flair")
    },
    blank_slate: {
        name: loc("feat_blank_slate_name"),
        desc: loc("feat_blank_slate_desc"),
        flair: loc("feat_blank_slate_flair")
    },
    supermassive: {
        name: loc("feat_supermassive_name"),
        desc: loc("feat_supermassive_desc"),
        flair: loc("feat_supermassive_flair")
    },
    heavy_genus_humanoid: {
        name: loc("feat_heavy_genus_humanoid_name"),
        desc: loc("feat_heavy_genus_humanoid_desc"),
        flair: loc("feat_heavy_genus_humanoid_flair")
    },
    heavy_genus_animal: {
        name: loc("feat_heavy_genus_animal_name"),
        desc: loc("feat_heavy_genus_animal_desc"),
        flair: loc("feat_heavy_genus_animal_flair")
    },
    heavy_genus_small: {
        name: loc("feat_heavy_genus_small_name"),
        desc: loc("feat_heavy_genus_small_desc"),
        flair: loc("feat_heavy_genus_small_flair")
    },
    heavy_genus_giant: {
        name: loc("feat_heavy_genus_giant_name"),
        desc: loc("feat_heavy_genus_giant_desc"),
        flair: loc("feat_heavy_genus_giant_flair")
    },
    heavy_genus_reptilian: {
        name: loc("feat_heavy_genus_reptilian_name"),
        desc: loc("feat_heavy_genus_reptilian_desc"),
        flair: loc("feat_heavy_genus_reptilian_flair")
    },
    heavy_genus_avian: {
        name: loc("feat_heavy_genus_avian_name"),
        desc: loc("feat_heavy_genus_avian_desc"),
        flair: loc("feat_heavy_genus_avian_flair")
    },
    heavy_genus_insectoid: {
        name: loc("feat_heavy_genus_insectoid_name"),
        desc: loc("feat_heavy_genus_insectoid_desc"),
        flair: loc("feat_heavy_genus_insectoid_flair")
    },
    heavy_genus_plant: {
        name: loc("feat_heavy_genus_plant_name"),
        desc: loc("feat_heavy_genus_plant_desc"),
        flair: loc("feat_heavy_genus_plant_flair")
    },
    heavy_genus_fungi: {
        name: loc("feat_heavy_genus_fungi_name"),
        desc: loc("feat_heavy_genus_fungi_desc"),
        flair: loc("feat_heavy_genus_fungi_flair")
    },
    heavy_genus_aquatic: {
        name: loc("feat_heavy_genus_aquatic_name"),
        desc: loc("feat_heavy_genus_aquatic_desc"),
        flair: loc("feat_heavy_genus_aquatic_flair")
    },
    heavy_genus_demonic: {
        name: loc("feat_heavy_genus_demonic_name"),
        desc: loc("feat_heavy_genus_demonic_desc"),
        flair: loc("feat_heavy_genus_demonic_flair")
    }
}

export function unlockAchieve(achievement,small){
    if ((global.race.universe === 'micro' && small !== true) || (global.race.universe !== 'micro' && small === true)){
        return false;
    }
    let a_level = 1;
    let unlock = false;
    if (global.race['no_plasmid']){ a_level++; }
    if (global.race['no_trade']){ a_level++; }
    if (global.race['no_craft']){ a_level++; }
    if (global.race['no_crispr']){ a_level++; }
    if (global.race['weak_mastery']){ a_level++; }
    if (!global.stats.achieve[achievement] || (global.stats.achieve[achievement] && global.stats.achieve[achievement].l < a_level)){
        global.settings.showAchieve = true;
        if (global.stats.achieve[achievement]){
            global.stats.achieve[achievement].l = a_level;
        }
        else {
            global.stats.achieve[achievement] = { l: a_level };
        }
        messageQueue(loc('achieve_unlock_achieve', [achievements[achievement].name] ),'special');
        drawPerks();
        drawAchieve();
        unlock = true;
    }
    if (global.stats.achieve[achievement]){
        switch (global.race.universe){
            case 'antimatter':
                if (!global.stats.achieve[achievement]['a'] || (global.stats.achieve[achievement]['a'] && global.stats.achieve[achievement].a < a_level)){
                    global.stats.achieve[achievement]['a'] = a_level;
                }
                break;
            case 'heavy':
                if (!global.stats.achieve[achievement]['h'] || (global.stats.achieve[achievement]['h'] && global.stats.achieve[achievement].h < a_level)){
                    global.stats.achieve[achievement]['h'] = a_level;
                }
                break;
            case 'evil':
                if (!global.stats.achieve[achievement]['e'] || (global.stats.achieve[achievement]['e'] && global.stats.achieve[achievement].e < a_level)){
                    global.stats.achieve[achievement]['e'] = a_level;
                }
                break;
            case 'micro':
                if (!global.stats.achieve[achievement]['m'] || (global.stats.achieve[achievement]['m'] && global.stats.achieve[achievement].m < a_level)){
                    global.stats.achieve[achievement]['m'] = a_level;
                }
                break;
        }
    }
    return unlock;
}

export function unlockFeat(feat,small){
    if ((global.race.universe === 'micro' && small !== true) || (global.race.universe !== 'micro' && small === true)){
        return false;
    }
    let a_level = 1;
    if (global.race['no_plasmid']){ a_level++; }
    if (global.race['no_trade']){ a_level++; }
    if (global.race['no_craft']){ a_level++; }
    if (global.race['no_crispr']){ a_level++; }
    if (global.race['weak_mastery']){ a_level++; }
    if (!global.stats.feat[feat] || (global.stats.feat[feat] && global.stats.feat[feat] < a_level)){
        global.settings.showAchieve = true;
        global.stats.feat[feat] = a_level;
        messageQueue(loc('feat_unlocked', [feats[feat].name] ),'special');
        drawPerks();
        drawAchieve();
        return true;
    }
    return false;
}

export function setupStats(){
    $('#achieve').empty();
    $('#stats').empty();
    let stats = $('<div id="statsPanel"></div>');
    $('#stats').append(stats);
    let perks = $('<div id="perksPanel"></div>');
    $('#stats').append(perks);
    let achieve = $('<div id="achievePanel"></div>');
    $('#achieve').append(achieve);
    drawStats();
    drawPerks();
    drawAchieve();
}

function svgIcons(icon){
    switch (icon){
        case 'star':
            return `<path class="star" d="M320.012 15.662l88.076 215.246L640 248.153 462.525 398.438l55.265 225.9-197.778-122.363-197.778 122.363 55.264-225.9L0 248.153l231.936-17.245z"/>`;
        case 'atom':
            return `<path class="atom" d="m100 44.189c0-6.796-10.63-11.822-24.783-14.529 1.155-3.322 2.105-6.538 2.764-9.541 2.193-10.025 1.133-16.856-2.981-19.231-1.019-0.588-2.193-0.888-3.49-0.888-5.62 0-13.46 5.665-21.509 15-8.046-9.335-15.886-15-21.511-15-1.294 0-2.47 0.3-3.491 0.888-5.891 3.4-4.918 15.141-0.175 28.767-14.173 2.701-24.824 7.731-24.824 14.534 0 6.799 10.634 11.822 24.79 14.531-1.161 3.323-2.11 6.536-2.767 9.539-2.194 10.027-1.136 16.857 2.976 19.231 1.021 0.589 2.197 0.886 3.491 0.886 5.625 0 13.464-5.667 21.511-14.998 8.047 9.331 15.886 15 21.509 15 1.297 0 2.472-0.299 3.49-0.888 4.114-2.374 5.174-9.204 2.98-19.231-0.658-3.003-1.608-6.216-2.766-9.539 14.156-2.708 24.786-7.732 24.786-14.531zm-28.49-41.605c0.838 0 1.579 0.187 2.199 0.543 3.016 1.741 3.651 7.733 1.747 16.44-0.661 3.022-1.628 6.264-2.814 9.63-4.166-0.695-8.585-1.194-13.096-1.49-2.572-3.887-5.206-7.464-7.834-10.67 7.581-8.861 14.934-14.453 19.798-14.453zm-9.198 48.71c-1.375 2.379-2.794 4.684-4.242 6.9-2.597 0.132-5.287 0.206-8.069 0.206s-5.474-0.074-8.067-0.206c-1.452-2.217-2.87-4.521-4.242-6.9-1.388-2.406-2.669-4.771-3.849-7.081 1.204-2.369 2.477-4.753 3.851-7.13 1.37-2.377 2.79-4.68 4.24-6.901 2.593-0.131 5.285-0.205 8.067-0.205s5.473 0.074 8.069 0.205c1.448 2.222 2.866 4.524 4.239 6.901 1.37 2.37 2.64 4.747 3.842 7.106-1.202 2.362-2.471 4.739-3.839 7.105zm5.259-4.225c1.587 3.303 3 6.558 4.2 9.72-3.25 0.521-6.758 0.926-10.488 1.203 1.104-1.75 2.194-3.554 3.265-5.404 1.062-1.837 2.059-3.681 3.023-5.519zm-11.277 13.78c-2.068 3.019-4.182 5.854-6.293 8.444-2.109-2.591-4.22-5.426-6.294-8.444 2.095 0.088 4.196 0.138 6.294 0.138 2.099-0.001 4.201-0.05 6.293-0.138zm-17.573-2.857c-3.733-0.277-7.241-0.683-10.49-1.203 1.202-3.157 2.611-6.414 4.197-9.72 0.97 1.858 1.979 3.701 3.026 5.519 1.071 1.85 2.161 3.654 3.267 5.404zm-6.304-16.654c-1.636-3.389-3.046-6.653-4.226-9.741 3.26-0.52 6.781-0.931 10.53-1.212-1.107 1.751-2.197 3.553-3.268 5.407-1.067 1.847-2.065 3.701-3.036 5.546zm11.294-13.805c2.07-3.019 4.181-5.855 6.29-8.449 2.111 2.594 4.225 5.43 6.293 8.449-2.093-0.091-4.194-0.14-6.293-0.14-2.098 0.001-4.199 0.049-6.29 0.14zm20.837 8.259c-1.07-1.859-2.16-3.656-3.265-5.407 3.73 0.281 7.238 0.687 10.488 1.205-1.2 3.157-2.613 6.419-4.2 9.722-0.964-1.838-1.961-3.683-3.023-5.52zm-38.254-32.665c0.619-0.359 1.36-0.543 2.196-0.543 4.864 0 12.217 5.592 19.8 14.453-2.626 3.206-5.262 6.783-7.834 10.67-4.526 0.296-8.962 0.802-13.144 1.5-4.886-13.794-5.036-23.762-1.018-26.08zm-23.709 41.062c0-4.637 8.707-9.493 23.096-12.159 1.487 3.974 3.268 8.069 5.277 12.14-2.061 4.14-3.843 8.229-5.323 12.167-14.364-2.664-23.05-7.516-23.05-12.148zm25.905 41.605c-0.848 0-1.564-0.178-2.196-0.538-3.015-1.742-3.652-7.734-1.746-16.442 0.662-3.023 1.626-6.269 2.814-9.633 4.166 0.696 8.586 1.195 13.092 1.491 2.574 3.885 5.207 7.462 7.834 10.671-7.58 8.86-14.934 14.451-19.798 14.451zm46.962-16.981c1.907 8.708 1.272 14.7-1.743 16.442-0.623 0.355-1.361 0.539-2.199 0.539-4.864 0-12.217-5.592-19.798-14.452 2.628-3.209 5.262-6.786 7.837-10.671 4.508-0.296 8.927-0.795 13.093-1.491 1.186 3.365 2.153 6.61 2.81 9.633zm-1.086-12.475c-1.476-3.933-3.254-8.014-5.31-12.148 2.056-4.135 3.834-8.217 5.312-12.148 14.361 2.665 23.049 7.519 23.049 12.148 0 4.631-8.688 9.483-23.051 12.148z"/><circle cy="44.189" cx="50.001" r="5.492"/>`;
        case 'heavy':
            return `<path class="heavy" d="M0 0h24v24H0z" fill="none"/><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>`;
        case 'evil':
            return `<path class="penta" d="m105.63 236.87c-17.275-2.22-34.678-8.73-49.291-18.44-54.583-36.26-69.355-108.23-33.382-162.64 11.964-18.101 31.389-34.423 51.05-42.899 36.303-15.652 78.013-12.004 110.65 9.678 54.58 36.259 69.36 108.23 33.38 162.65-24.44 36.97-68.62 57.27-112.41 51.65zm9.37-7.17c0-1.12-15.871-50.86-20.804-65.2l-1.719-5-36.926-0.26c-20.309-0.15-37.284 0.09-37.721 0.53-1.104 1.1 4.147 11.87 10.535 21.59 16.439 25.04 41.149 41.59 71.135 47.65 11.07 2.24 15.5 2.44 15.5 0.69zm25.71-0.61c30.52-5.95 55.28-22.38 71.92-47.73 6.39-9.72 11.64-20.49 10.54-21.59-0.44-0.44-17.41-0.68-37.72-0.53l-36.93 0.26-1.72 5c-4.93 14.34-20.8 64.08-20.8 65.2 0 1.77 3.2 1.64 14.71-0.61zm-9.32-38.99c5.25-16.18 9.3-29.79 9.01-30.25-0.28-0.47-9.24-0.85-19.9-0.85s-19.62 0.38-19.9 0.85c-0.46 0.74 17.66 58.14 19.08 60.43 0.3 0.49 0.91 0.52 1.36 0.06s5.11-14.07 10.35-30.24zm-42.19-38.63c0.629-0.63-10.723-36.39-11.936-37.61-0.817-0.81-51.452 35.32-52.097 37.18-0.349 1 63.032 1.43 64.033 0.43zm61.27-20.06c3.65-11.32 6.51-21.41 6.34-22.42-0.32-1.86-34.12-26.99-36.31-26.99s-35.993 25.13-36.308 26.99c-0.169 1.01 2.683 11.1 6.339 22.42l6.647 20.59h46.642l6.65-20.59zm65.36 19.63c-0.64-1.86-51.28-37.99-52.09-37.18-1.22 1.22-12.57 36.98-11.94 37.61 1 1 64.38 0.57 64.03-0.43zm-169.97-24.02c16.09-11.7 29.071-21.78 28.847-22.4-0.397-1.09-12.185-37.499-18.958-58.555-1.846-5.739-3.951-10.632-4.678-10.875-0.727-0.242-4.903 3.259-9.28 7.78-22 22.72-32.81 50.641-31.513 81.39 0.678 16.09 2.371 24.97 4.646 24.37 0.925-0.24 14.846-10.01 30.936-21.71zm183.14 15.73c0.66-3.44 1.44-11.71 1.72-18.39 1.3-30.749-9.51-58.67-31.51-81.39-4.38-4.521-8.55-8.022-9.28-7.78-0.73 0.243-2.83 5.136-4.68 10.875-1.84 5.739-6.93 21.448-11.29 34.908-6.26 19.297-7.68 24.717-6.7 25.627 3.41 3.18 58.29 42.4 59.32 42.4 0.68 0 1.73-2.72 2.42-6.25zm-129.27-54.808c7.573-5.522 13.773-10.467 13.773-10.987 0-1.007-50.318-37.955-51.689-37.955-0.446 0-0.811 0.317-0.811 0.704 0 0.388 3.825 12.484 8.5 26.882s8.5 26.401 8.5 26.674 0.697 2.163 1.548 4.201c1.832 4.389-0.216 5.349 20.179-9.519zm66.613-5.442c3.03-9.35 7.35-22.629 9.59-29.508 4.36-13.403 4.5-13.992 3.26-13.992-1.39 0-51.69 36.953-51.69 37.971 0 1.477 31.75 24.189 32.58 23.309 0.4-0.431 3.22-8.43 6.26-17.78zm-14.4-32.538l29.32-21.329-2.37-1.927c-10.93-8.844-38.4-16.706-58.39-16.706s-47.464 7.862-58.388 16.708l-2.382 1.929 29.885 21.728c16.845 12.25 30.565 21.552 31.435 21.326 0.86-0.22 14.75-9.999 30.89-21.729z"/>`;
        case 'micro':
            return `<path class="micro" d="m150.18 114.71c-11.276-6.0279-15.771-19.766-9.9989-30.563 6.0279-11.276 19.766-15.771 30.563-9.9989 11.276 6.0279 15.771 19.766 9.9989 30.563-6.0279 11.276-19.766 15.771-30.563 9.9989z"/><path d="m47.263 265.24c-0.41891-0.4189-0.76165-5.194-0.76165-10.611 0-11.606 2.7184-18.417 9.0231-22.606 3.8412-2.5527 4.2946-2.5798 43.128-2.5798h39.246v-13.71-13.71h10.905c10.055 0 11.124-0.2186 13.71-2.8043 2.5824-2.5824 2.8043-3.66 2.8043-13.619v-10.815l3.3639-0.73883c1.8501-0.40636 5.1713-2.7395 7.3804-5.1847 8.0637-8.9255 9.8103-25.642 3.9223-37.54l-2.9588-5.9787 5.9675-5.9676c9.887-9.887 12.537-24.129 6.6886-35.949-1.3037-2.635-2.1165-4.7908-1.8062-4.7908 0.31024 0 3.5239 1.798 7.1414 3.9955 14.491 8.8026 26.675 25.759 31.636 44.025 2.7168 10.004 2.7314 30.947 0.0286 41.093-4.445 16.685-15.856 33.364-29.027 42.425l-4.9176 3.3834v7.9424 7.9424h10.966c12.713 0 17.226 1.5998 21.944 7.7794 2.828 3.7038 3.1086 5.033 3.464 16.405l0.4 12.38h-90.737c-49.906 0-91.08-0.34274-91.499-0.76165zm17.518-81.497v-9.1398h45.699 45.699v9.1398 9.1398h-45.699-45.699v-9.1398zm32.227-32.318-4.8078-4.8988v-13.72-13.72l-4.5699-4.4624-4.5699-4.4624v-27.527-27.527l4.5699-4.4624c4.5593-4.452 4.5699-4.4831 4.5699-13.37 0-8.6703-0.07402-8.9079-2.7746-8.9079-4.4514 0-6.3652-2.8757-6.3652-9.5641 0-3.2854 0.61694-6.5904 1.371-7.3445 1.9422-1.9422 50.155-1.9422 52.097 0 0.75403 0.75403 1.371 4.3347 1.371 7.9571 0 6.9911-1.4848 8.9515-6.7797 8.9515-2.1833 0-2.3601 0.66715-2.3601 8.9079 0 8.8872 0.0103 8.9183 4.5699 13.37l4.5699 4.4624v9.5554c0 8.412-0.33908 10-2.8338 13.271-6.443 8.4472-7.9966 20.22-4.0419 30.628 2.2572 5.9405 2.2572 5.9661 0 8.3688-1.997 2.1258-2.2642 4.0244-2.2642 16.094v13.684l-4.8988 4.8078c-4.877 4.7864-4.9369 4.8078-13.472 4.8078h-8.5731l-4.8078-4.8988z"/>`;
    }
}

function svgViewBox(icon){
    switch (icon){
        case 'star':
            return `0 0 640 640`;
        case 'atom':
            return `0 0 100 88.379`;
        case 'heavy':
            return `0 0 24 24`;
        case 'evil':
            return `0 0 240 240`;
        case 'micro':
            return `0 0 276 276`;
    }
}

export function drawAchieve(){
    if (vues['vue_achieve']){
        vues['vue_achieve'].$destroy();
    }

    $('#achievePanel').empty();
    let achieve = $('#achievePanel');
    let earned = 0;
    let total = 0;
    let level = 0;
    Object.keys(achievements).forEach(function (achievement){
        total++;
        if (global.stats.achieve[achievement]){
            earned++;
            level += global.stats.achieve[achievement].l;
            if (achievement === 'joyless'){
                level += global.stats.achieve[achievement].l;
            }
            let star = global.stats.achieve[achievement].l > 1 ? `<span class="flair"><svg class="star${global.stats.achieve[achievement].l}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox('star')}" xml:space="preserve">${svgIcons('star')}</svg></span>` : '';
            let extra = '';
            if (global.race.universe === 'antimatter'){
                extra = global.stats.achieve[achievement].a > 1 ? `<span class="flair alt"><svg class="star${global.stats.achieve[achievement].a}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox('atom')}" xml:space="preserve">${svgIcons('atom')}</svg></span>` : '';
            }
            if (global.race.universe === 'evil'){
                extra = global.stats.achieve[achievement].e > 1 ? `<span class="flair alt"><svg class="star${global.stats.achieve[achievement].e}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox('evil')}" xml:space="preserve">${svgIcons('evil')}</svg></span>` : '';
            }
            if (global.race.universe === 'heavy'){
                extra = global.stats.achieve[achievement].h > 1 ? `<span class="flair alt"><svg class="star${global.stats.achieve[achievement].h}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox('heavy')}" xml:space="preserve">${svgIcons('heavy')}</svg></span>` : '';
            }
            if (global.race.universe === 'micro'){
                extra = global.stats.achieve[achievement].m > 1 ? `<span class="flair alt"><svg class="star${global.stats.achieve[achievement].m}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox('micro')}" xml:space="preserve">${svgIcons('micro')}</svg></span>` : '';
            }
            
            achieve.append($(`<b-tooltip :label="flair('${achievement}')" position="is-bottom" size="is-small" animated><div class="achievement"><span class="has-text-warning">${achievements[achievement].name}</span><span>${achievements[achievement].desc}</span>${extra}${star}</div></b-tooltip>`));
        }
    });
    set_alevel(level);

    Object.keys(feats).forEach(function (feat){
        if (global.stats.feat[feat]){
            let star = global.stats.feat[feat] > 1 ? `<span class="flair"><svg class="star${global.stats.feat[feat]}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox('star')}" xml:space="preserve">${svgIcons('star')}</svg></span>` : '';
            achieve.append($(`<b-tooltip :label="feat('${feat}')" position="is-bottom" size="is-small" animated><div class="achievement"><span class="has-text-danger">${feats[feat].name}</span><span>${feats[feat].desc}</span>${star}</div></b-tooltip>`));
        }
    });

    achieve.prepend(`<div class="has-text-warning">${loc("achieve_draw_achieve_earned",[earned,total])}</div>`);

    let avue = {
        methods: {
            flair(flair){
                return achievements[flair].flair;
            },
            feat(flair){
                return feats[flair].flair;
            }
        }
    }
    
    vues['vue_achieve'] = new Vue(avue);
    vues['vue_achieve'].$mount('#achievePanel');

    let a_level = 1;
    if (global.race['no_plasmid']){ a_level++; }
    if (global.race['no_trade']){ a_level++; }
    if (global.race['no_craft']){ a_level++; }
    if (global.race['no_crispr']){ a_level++; }
    if (global.race['weak_mastery']){ a_level++; }

    if (a_level > 1 && $('#topBar .planet .flair').length === 0){
        if ($('#topBar span.flair')){
            $('#topBar span.flair').remove();
        }
        $('#topBar .planet').after(`<span class="flair"><svg class="star${a_level}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 640 640" xml:space="preserve"><path class="star" d="M320.012 15.662l88.076 215.246L640 248.153 462.525 398.438l55.265 225.9-197.778-122.363-197.778 122.363 55.264-225.9L0 248.153l231.936-17.245z"/></svg></span>`);
    
        $('#topBar .planetWrap .flair').on('mouseover',function(){
            var popper = $(`<div id="topbarPlanet" class="popper has-background-light has-text-dark"></div>`);
            $('#main').append(popper);

            if (global.race['no_plasmid']){ popper.append($(`<div>${loc('evo_challenge_plasmid')}</div>`)); }
            if (global.race['weak_mastery']){ popper.append($(`<div>${loc('evo_challenge_mastery')}</div>`)); }
            if (global.race['no_trade']){ popper.append($(`<div>${loc('evo_challenge_trade')}</div>`)); }
            if (global.race['no_craft']){ popper.append($(`<div>${loc('evo_challenge_craft')}</div>`)); }
            if (global.race['no_crispr']){ popper.append($(`<div>${loc('evo_challenge_crispr')}</div>`)); }

            popper.show();
            poppers['topbarPlanet'] = new Popper($('#topBar .planetWrap .flair'),popper);
        
        });

        $('#topBar .planetWrap .flair').on('mouseout',function(){
            $(`#topbarPlanet`).hide();
            poppers['topbarPlanet'].destroy();
            $(`#topbarPlanet`).remove();
        });
    }
}

export function checkAchievements(){
    let a_level = 1;
    if (global.race['no_plasmid']){ a_level++; }
    if (global.race['no_trade']){ a_level++; }
    if (global.race['no_craft']){ a_level++; }
    if (global.race['no_crispr']){ a_level++; }
    if (global.race['weak_mastery']){ a_level++; }
    if (!global.stats.achieve['mass_extinction'] || global.stats.achieve['mass_extinction'].l < a_level){
        let total = 0;
        const keys = Object.keys(achievements)
        for (const key of keys) {
            if (key.includes('extinct_')){
                if (global.stats.achieve[key] && global.stats.achieve[key].l >= a_level){
                    total++
                }
            }
        }
        if (total >= 25){
            unlockAchieve('mass_extinction');
        }
    }
    if (!global.stats.achieve['vigilante'] || global.stats.achieve['vigilante'].l < a_level){
        let total = 0;
        const keys = Object.keys(achievements)
        for (const key of keys) {
            if (key.includes('extinct_')){
                if (global.stats.achieve[key] && global.stats.achieve[key]['e'] && global.stats.achieve[key].e >= a_level){
                    total++
                }
            }
        }
        if (total >= 25){
            unlockAchieve('vigilante');
        }
    }
    if (!global.stats.achieve['creator'] || global.stats.achieve['creator'].l < a_level){
        let total = 0;
        const keys = Object.keys(achievements);
        for (const key of keys){
            if (key.includes('genus_')){
                if (global.stats.achieve[key] && global.stats.achieve[key].l >= a_level){
                    total++
                }
            }
        }
        if (total >= 9){
            unlockAchieve('creator');
        }
    }
    if (!global.stats.achieve['explorer'] || global.stats.achieve['explorer'].l < a_level){
        let total = 0;
        const keys = Object.keys(achievements);
        for (const key of keys){
            if (key.includes('biome_')){
                if (global.stats.achieve[key] && global.stats.achieve[key].l >= a_level){
                    total++
                }
            }
        }
        if (total >= 6){
            unlockAchieve('explorer');
        }
    }
    if (!global.stats.achieve['heavyweight'] || global.stats.achieve['heavyweight'].l < a_level){
        let total = 0;
        const keys = Object.keys(feats)
        for (const key of keys) {
            if (key.includes('heavy_genus_')){
                if (global.stats.feat[key] && global.stats.feat[key] >= a_level){
                    total++
                }
            }
        }
        if (total >= 8){
            unlockAchieve('heavyweight');
        }
    }
    if (global.tech['supercollider'] && global.tech['supercollider'] >= 99){
        unlockAchieve('blackhole');
    }
    if (global.stats.starved >= 100){
        unlockAchieve('mass_starvation');
    }
    if (Math.round(Math.log2(global.civic.garrison.protest + global.civic.garrison.fatigue)) >= 8){
        unlockAchieve('warmonger');
    }
    if (global.stats.died >= 250){
        unlockAchieve('red_tactics');
    }
    if (global.interstellar['stellar_engine'] && global.interstellar['stellar_engine'].mass >= 12){
        unlockAchieve('landfill');
    }
    if (global.interstellar['stellar_engine'] && global.interstellar['stellar_engine'].mass >= 100){
        unlockFeat('supermassive');
    }
}

export function drawPerks(){
    $('#perksPanel').empty();
    let perks = $('#perksPanel');
    
    let unlocked = 0;
    if (global.stats.achieve['blackhole']){
        unlocked++;
        let bonus = global.stats.achieve.blackhole.l * 5;
        perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_blackhole",[bonus])}</span></div>`);
    }

    if (global.stats.achieve['mass_extinction']){
        unlocked++;
        let bonus = global.stats.achieve['mass_extinction'].l + 1
        perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_mass_extinction",[bonus])}</span></div>`);
    }

    if (global.stats.achieve['creator']){
        unlocked++;
        perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_creator")}</span></div>`);
        if (global.stats.achieve['creator'].l > 1){
            let bonus = (global.stats.achieve['creator'].l - 1) * 50;
            perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_creator2",[bonus])}</span></div>`);
        }
    }

    if (global.stats.achieve['explorer']){
        unlocked++;
        let bonus = global.stats.achieve['explorer'].l + 1
        perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_explorer",[bonus])}</span></div>`);
    }

    if (global.stats.achieve['extinct_junker']){
        unlocked++;
        perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_enlightened")}</span></div>`);
    }

    if (global.stats.achieve['heavyweight']){
        unlocked++;
        let bonus = global.stats.achieve['heavyweight'].l * 4;
        perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_heavyweight",[bonus])}</span></div>`);
    }

    if (global.stats.achieve['dissipated']){
        unlocked++;
        perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_dissipated1",[1])}</span></div>`);
        if (global.stats.achieve['dissipated'].l >= 3){
            let bonus = global.stats.achieve['dissipated'].l >= 5 ? 2 : 1;
            perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_dissipated2",[bonus])}</span></div>`);
        }
        if (global.stats.achieve['dissipated'].l >= 2){
            perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_dissipated3",[1])}</span></div>`);
        }
        if (global.stats.achieve['dissipated'].l >= 4){
            perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_dissipated4",[1])}</span></div>`);
        }
    }

    if (global.genes['creep']){
        unlocked++;
        perks.append(`<div><span class="has-text-warning">${loc("arpa_perks_creep",[global.genes.creep])}</span></div>`);
    }

    if (global.genes['store']){
        unlocked++;
        let psb = global.genes.store === 1 ? 0.04 : (global.genes.store === 2 ? 0.06 : 0.08);
        perks.append(`<div><span class="has-text-warning">${loc(global.genes.store >= 4 ? "arpa_perks_store2" : "arpa_perks_store1",[psb])}</span></div>`);
    }

    if (global.genes['evolve']){
        unlocked++;
        perks.append(`<div><span class="has-text-warning">${loc("arpa_perks_evolve")}</span></div>`);
        if (global.genes.evolve >= 2){
            perks.append(`<div><span class="has-text-warning">${loc("arpa_genepool_recombination_desc")}</span></div>`);
        }
    }

    if (global.genes['birth']){
        unlocked++;
        perks.append(`<div><span class="has-text-warning">${loc("arpa_perks_birth")}</span></div>`);
    }

    if (global.genes['crafty']){
        unlocked++;
        perks.append(`<div><span class="has-text-warning">${loc("arpa_genepool_artificer_desc")}</span></div>`);

        if (global.genes.crafty >= 2){
            let bonus = global.genes.crafty === 2 ? 50 : 100;
            perks.append(`<div><span class="has-text-warning">${loc("arpa_genepool_crafting_desc",[bonus])}</span></div>`);
        }
    }

    if (global.genes['synthesis']){
        unlocked++;
        let base = global.genes['synthesis'] >= 2 ? (global.genes['synthesis'] >= 3 ? 4 : 3) : 2;
        let auto = global.genes['synthesis'] >= 2 ? (global.genes['synthesis'] >= 3 ? 50 : 25) : 10;
        perks.append(`<div><span class="has-text-warning">${loc("arpa_genepool_synthesis_desc",[base,auto])}</span></div>`);
    }

    if (global.genes['challenge']){
        unlocked++;
        perks.append(`<div><span class="has-text-warning">${loc("arpa_perks_challenge")}</span></div>`);
        if (global.genes['challenge'] >= 2){
            unlocked++;
            perks.append(`<div><span class="has-text-warning">${loc("arpa_genepool_unlocked_desc")}</span></div>`);
        }
    }

    if (global.genes['ancients']){
        unlocked++;
        perks.append(`<div><span class="has-text-warning">${loc("arpa_perks_ancients")}</span></div>`);
    }
    
    if (global.genes['transcendence']){ 
        unlocked++; 
        perks.append(`<div><span class="has-text-warning">${loc("arpa_genepool_transcendence_desc")}</span></div>`); 
    } 

    if (global.genes['queue']){ 
        unlocked++; 
        perks.append(`<div><span class="has-text-warning">${loc("arpa_genepool_geographer_desc")}</span></div>`); 
        if (global.genes['queue'] >= 2) { 
            unlocked++; 
            perks.append(`<div><span class="has-text-warning">${loc("arpa_genepool_architect_desc")}</span></div>`); 
        } 
    } 

    if (global.genes['mutation']){ 
        unlocked++;
        perks.append(`<div><span class="has-text-warning">${global.genes['mutation'] === 1 ? loc("arpa_perks_mutation1") : loc("arpa_perks_mutation2")}</span></div>`); 
        if (global.genes['mutation'] >= 3){
            perks.append(`<div><span class="has-text-warning">${loc("arpa_perks_mutation3")}</span></div>`); 
        } 
    } 

    if (global.genes['bleed']){ 
        unlocked++; 
        perks.append(`<div><span class="has-text-warning">${loc("arpa_genepool_bleeding_effect_desc",[25])}</span></div>`); 
        if (global.genes['bleed'] >= 2){
            perks.append(`<div><span class="has-text-warning">${loc("arpa_genepool_synchronicity_desc",[2.5])}</span></div>`); 
            if (global.genes['bleed'] >= 3){
                perks.append(`<div><span class="has-text-warning">${loc("arpa_genepool_astral_awareness_desc")}</span></div>`); 
            } 
        } 
    }

    if (unlocked > 0){
        perks.prepend(`<div class="cstat"><span class="has-text-success">${loc("achieve_perks")}</span></div>`);
    }
}

export function drawStats(){
    if (vues['vue_stats']){
        vues['vue_stats'].$destroy();
    }

    $('#statsPanel').empty();
    let stats = $('#statsPanel');
    
    stats.append(`<div><span class="has-text-success">${loc("achieve_stats_overall")}</span></div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_plasmid_earned")}</span> {{ plasmid }}</div>`);
    if (global.stats.phage > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_phage_earned")}</span> {{ phage }}</div>`);
    }
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_knowledge_spent")}</span> {{ know | t_know }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_starved_to_death")}</span> {{ starved | t_starved }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_died_in_combat")}</span> {{ died | t_died }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_game_days_played")}</span> {{ days | played }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_total_resets")}</span> {{ reset }}</div>`);
    if (global.stats.mad > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_mad_resets")}</span> {{ mad }}</div>`);
    }
    if (global.stats.bioseed > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_bioseed_resets")}</span> {{ bioseed }}</div>`);
    }
    if (global.stats.mad > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_blackhole_resets")}</span> {{ blackhole }}</div>`);
    }
    if (global.stats.portals > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_portals")}</span> {{ portals }}</div>`);
    }
    stats.append(`<div class="cstat"><span class="has-text-success">${loc("achieve_stats_current_game")}</span></div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_knowledge_spent")}</span> {{ know }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_starved_to_death")}</span> {{ starved }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_died_in_combat")}</span> {{ died }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_attacks_made")}</span> {{ attacks }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_game_days_played")}</span> {{ days }}</div>`);

    let svue = {
        data: global.stats,
        filters: {
            played(d){
                return d + global.stats.tdays;
            },
            t_know(k){
                return k + global.stats.tknow;
            },
            t_starved(s){
                return s + global.stats.tstarved;
            },
            t_died(d){
                return d + global.stats.tdied;
            }
        }
    }
    
    vues['vue_stats'] = new Vue(svue);
    vues['vue_stats'].$mount('#statsPanel');
}
