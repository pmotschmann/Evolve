import { global, messageQueue, set_alevel, poppers } from './vars.js';
import { svgIcons, svgViewBox, format_emblem, vBind } from './functions.js'; 
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
    anarchist: {
        name: loc("achieve_anarchist_name"),
        desc: loc("achieve_anarchist_desc"),
        flair: loc("achieve_anarchist_flair")
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
    godwin: {
        name: loc("achieve_godwin_name"),
        desc: loc("achieve_godwin_desc"),
        flair: loc("achieve_godwin_flair")
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
    cross: {
        name: loc("achieve_cross_name"),
        desc: loc("achieve_cross_desc"),
        flair: loc("achieve_cross_flair")
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
    genus_fey: {
        name: loc("achieve_genus_fey_name"),
        desc: loc("achieve_genus_fey_desc"),
        flair: loc("achieve_genus_fey_flair")
    },
    genus_heat: {
        name: loc("achieve_genus_heat_name"),
        desc: loc("achieve_genus_heat_desc"),
        flair: loc("achieve_genus_heat_flair")
    },
    genus_polar: {
        name: loc("achieve_genus_polar_name"),
        desc: loc("achieve_genus_polar_desc"),
        flair: loc("achieve_genus_polar_flair")
    },
    genus_sand: {
        name: loc("achieve_genus_sand_name"),
        desc: loc("achieve_genus_sand_desc"),
        flair: loc("achieve_genus_sand_flair")
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
    extinct_dryad: {
        name: loc("achieve_extinct_dryad_name"),
        desc: loc("achieve_extinct_dryad_desc"),
        flair: loc("achieve_extinct_dryad_flair")
    },
    extinct_satyr: {
        name: loc("achieve_extinct_satyr_name"),
        desc: loc("achieve_extinct_satyr_desc"),
        flair: loc("achieve_extinct_satyr_flair")
    },
    extinct_phoenix: {
        name: loc("achieve_extinct_phoenix_name"),
        desc: loc("achieve_extinct_phoenix_desc"),
        flair: loc("achieve_extinct_phoenix_flair")
    },
    extinct_salamander: {
        name: loc("achieve_extinct_salamander_name"),
        desc: loc("achieve_extinct_salamander_desc"),
        flair: loc("achieve_extinct_salamander_flair")
    },
    extinct_yeti: {
        name: loc("achieve_extinct_yeti_name"),
        desc: loc("achieve_extinct_yeti_desc"),
        flair: loc("achieve_extinct_yeti_flair")
    },
    extinct_wendigo: {
        name: loc("achieve_extinct_wendigo_name"),
        desc: loc("achieve_extinct_wendigo_desc"),
        flair: loc("achieve_extinct_wendigo_flair")
    },
    extinct_tuskin: {
        name: loc("achieve_extinct_tuskin_name"),
        desc: loc("achieve_extinct_tuskin_desc"),
        flair: loc("achieve_extinct_tuskin_flair")
    },
    extinct_kamel: {
        name: loc("achieve_extinct_kamel_name"),
        desc: loc("achieve_extinct_kamel_desc"),
        flair: loc("achieve_extinct_kamel_flair")
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
    rocky_road: {
        name: loc("feat_rocky_road_name"),
        desc: loc("feat_rocky_road_desc"),
        flair: loc("feat_rocky_road_flair")
    },
    nephilim: {
        name: loc("feat_nephilim_name"),
        desc: loc("feat_nephilim_desc"),
        flair: loc("feat_nephilim_flair")
    },
    halloween: {
        name: loc("feat_boo_name"),
        desc: loc("feat_boo_desc"),
        flair: loc("feat_boo_flair")
    },
    thanksgiving: {
        name: loc("feat_gobble_gobble_name"),
        desc: loc("feat_gobble_gobble_desc"),
        flair: loc("feat_gobble_gobble_flair")
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
    heavy_genus_fey: {
        name: loc("feat_heavy_genus_fey_name"),
        desc: loc("feat_heavy_genus_fey_desc"),
        flair: loc("feat_heavy_genus_fey_flair")
    },
    heavy_genus_heat: {
        name: loc("feat_heavy_genus_heat_name"),
        desc: loc("feat_heavy_genus_heat_desc"),
        flair: loc("feat_heavy_genus_heat_flair")
    },
    heavy_genus_polar: {
        name: loc("feat_heavy_genus_polar_name"),
        desc: loc("feat_heavy_genus_polar_desc"),
        flair: loc("feat_heavy_genus_polar_flair")
    },
    heavy_genus_sand: {
        name: loc("feat_heavy_genus_sand_name"),
        desc: loc("feat_heavy_genus_sand_desc"),
        flair: loc("feat_heavy_genus_sand_flair")
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

export function drawAchieve(){
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
            let emblem = format_emblem(achievement,16);            
            achieve.append($(`<b-tooltip :label="flair('${achievement}')" position="is-bottom" size="is-small" animated><div class="achievement"><span class="has-text-warning">${achievements[achievement].name}</span><span>${achievements[achievement].desc}</span>${emblem}</div></b-tooltip>`));
        }
    });
    set_alevel(level);

    Object.keys(feats).forEach(function (feat){
        if (global.stats.feat[feat]){
            let star = global.stats.feat[feat] > 1 ? `<p class="flair"><svg class="star${global.stats.feat[feat]}" version="1.1" x="0px" y="0px" width="10px" height="10px" viewBox="${svgViewBox('star')}" xml:space="preserve">${svgIcons('star')}</svg></p>` : '';
            achieve.append($(`<b-tooltip :label="feat('${feat}')" position="is-bottom" size="is-small" animated><div class="achievement"><span class="has-text-danger">${feats[feat].name}</span><span>${feats[feat].desc}</span>${star}</div></b-tooltip>`));
        }
    });

    achieve.prepend(`<div class="has-text-warning">${loc("achieve_draw_achieve_earned",[earned,total])}</div>`);
    
    vBind({
        el: '#achievePanel',
        methods: {
            flair(flair){
                return achievements[flair].flair;
            },
            feat(flair){
                return feats[flair].flair;
            }
        }
    });

    let a_level = 1;
    if (global.race['no_plasmid']){ a_level++; }
    if (global.race['no_trade']){ a_level++; }
    if (global.race['no_craft']){ a_level++; }
    if (global.race['no_crispr']){ a_level++; }
    if (global.race['weak_mastery']){ a_level++; }

    if ($('#topBar span.flair')){
        $('#topBar span.flair').remove();
    }
    if (a_level > 1 && $('#topBar .planet .flair').length === 0){
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
        if (total >= 12){
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
    if (global.interstellar['stellar_engine'] && (global.interstellar['stellar_engine'].mass + global.interstellar['stellar_engine'].exotic) >= 12){
        unlockAchieve('landfill');
    }
    if (global.interstellar['stellar_engine'] && (global.interstellar['stellar_engine'].mass + global.interstellar['stellar_engine'].exotic) >= 100){
        unlockFeat('supermassive');
    }
    const date = new Date();
    if (date.getMonth() === 9 && date.getDate() === 31){
        if (global.race.universe === 'micro'){
            unlockFeat('halloween',true);
        }
        else {
            unlockFeat('halloween');
        }
    }
    else if (date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28){
        if (global.race.universe === 'micro'){
            unlockFeat('thanksgiving',true);
        }
        else {
            unlockFeat('thanksgiving');
        }
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

    if (global.stats.achieve['whitehole']){
        unlocked++;
        let bonus = global.stats.achieve['whitehole'].l * 5;
        perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_whitehole")}</span></div>`);
        perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_whitehole2",[bonus])}</span></div>`);
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

    if (global.stats.achieve['anarchist']){
        unlocked++;
        let bonus = global.stats.achieve['anarchist'].l * 10;
        perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_anarchist",[bonus])}</span></div>`);
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
    $('#statsPanel').empty();
    let stats = $('#statsPanel');
    
    stats.append(`<div><span class="has-text-success">${loc("achieve_stats_overall")}</span></div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_plasmid_earned")}</span> {{ plasmid }}</div>`);
    if (global.stats.antiplasmid > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_antiplasmid_earned")}</span> {{ antiplasmid }}</div>`);
    }
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
    if (global.stats.blackhole > 0){
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
    
    vBind({
        el: '#statsPanel',
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
    });
}
