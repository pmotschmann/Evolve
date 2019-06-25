import { global, vues, messageQueue, set_alevel, achieve_level } from './vars.js';
import { loc } from './locale.js'

if (!global.stats['achieve']){
    global.stats['achieve'] = {};
}

var achievements = {
    apocalypse: {
        name: loc("achieve_apocalypse_name"),
        desc: loc("achieve_apocalypse_desc"),
        flair: loc("achieve_apocalypse_flair")
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
        flair: loc("achieve_colonist_flair",[global.race.species]) //it was because of this that I had to load all the strings twice!
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
    seeder: {
        name: loc("achieve_seeder_name"),
        desc: loc("achieve_seeder_desc"),
        flair: loc("achieve_seeder_flair")
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
    mass_extinction: {
        name: loc("achieve_mass_extinction_name"),
        desc: loc("achieve_mass_extinction_desc"),
        flair: loc("achieve_mass_extinction_flair")
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
    }
};

export function unlockAchieve(achievement){
    let a_level = 1;
    if (global.race['no_plasmid']){ a_level++; }
    if (global.race['no_trade']){ a_level++; }
    if (global.race['no_craft']){ a_level++; }
    if (global.race['no_crispr']){ a_level++; }
    if (!global.stats.achieve[achievement] || (global.stats.achieve[achievement] && global.stats.achieve[achievement] < a_level)){
        global.settings.showAchieve = true;
        global.stats.achieve[achievement] = a_level;
        messageQueue(loc('achieve_unlock_achieve', [achievements[achievement].name] ),'special');
        drawPerks();
        drawAchieve();
        return true;
    }
    return false;
}

export function setupStats(){
    $('#achieve').empty();
    let stats = $('<div id="statsPanel"></div>');
    $('#achieve').append(stats);
    let perks = $('<div id="perksPanel"></div>');
    $('#achieve').append(perks);
    let achieve = $('<div id="achievePanel"></div>');
    $('#achieve').append(achieve);
    drawStats();
    drawPerks();
    drawAchieve();
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
            level += global.stats.achieve[achievement];
            let star = global.stats.achieve[achievement] > 1 ? `<span class="flair"><svg class="star${global.stats.achieve[achievement]}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 640 640" xml:space="preserve"><path class="star" d="M320.012 15.662l88.076 215.246L640 248.153 462.525 398.438l55.265 225.9-197.778-122.363-197.778 122.363 55.264-225.9L0 248.153l231.936-17.245z"/></svg></span>` : '';
            achieve.append($(`<b-tooltip :label="flair('${achievement}')" position="is-bottom" size="is-small" animated><div class="achievement"><span class="has-text-warning">${achievements[achievement].name}</span><span>${achievements[achievement].desc}</span>${star}</div></b-tooltip>`));
        }
    });
    set_alevel(level);
    achieve.prepend(`<div class="has-text-warning">${loc("achieve_draw_achieve_earned",[earned,total])}</div>`);

    let avue = {
        methods: {
            flair(flair){
                return achievements[flair].flair;
            }
        }
    }
    
    vues['vue_achieve'] = new Vue(avue);
    vues['vue_achieve'].$mount('#achievePanel');
}

export function checkAchievements(){
    if (!global.stats.achieve['mass_extinction'] || global.stats.achieve['mass_extinction'] < achieve_level){
        let check = true;
        const keys = Object.keys(achievements)
        for (const key of keys) {
            if (key.includes('extinct_')){
                if (!global.stats.achieve[key] || global.stats.achieve[key] < achieve_level){
                    check = false;
                    break;
                }
            }
        }
        if (check){
            unlockAchieve('mass_extinction');
        }
    }
    if (global.tech['supercollider'] && global.tech['supercollider'] >= 99){
        unlockAchieve('blackhole');
    }
    if (global.stats.starved >= 100){
        unlockAchieve('mass_starvation');
    }
    if (Math.round(Math.log2(global.civic.garrison.protest + global.civic.garrison.fatigue) >= 8)){
        unlockAchieve('warmonger');
    }
    if (global.stats.died >= 250){
        unlockAchieve('red_tactics');
    }
}

export function drawPerks(){
    $('#perksPanel').empty();
    let perks = $('#perksPanel');
    
    let unlocked = 0;
    if (global.stats.achieve['blackhole']){
        unlocked++;
        let bonus = global.stats.achieve.blackhole * 5;
        perks.append(`<div><span class="has-text-warning">${loc("achieve_perks_blackhole",[bonus])}</span></div>`);
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
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_knowledge_spent")}</span> {{ know | t_know }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_starved_to_death")}</span> {{ starved | t_starved }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_died_in_combat")}</span> {{ died | t_died }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_game_days_played")}</span> {{ days | played }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_total_resets")}</span> {{ reset }}</div>`);
    if (global.stats.portals > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_portals")}</span> {{ portals }}</div>`);
    }
    stats.append(`<div class="cstat"><span class="has-text-success">${loc("achieve_stats_current_game")}</span></div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_knowledge_spent")}</span> {{ know }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_starved_to_death")}</span> {{ starved }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_died_in_combat")}</span> {{ died }}</div>`);
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
