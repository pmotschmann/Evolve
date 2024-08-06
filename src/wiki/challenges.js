import { global } from './../vars.js';
import { loc } from './../locale.js';
import { actions, wardenLabel } from './../actions.js';
import { vBind } from './../functions.js';
import { neg_roll_traits } from './../races.js';
import { tradeRatio } from './../resources.js';
import { sideMenu, subSideMenu, infoBoxBuilder, getSolarName, createCalcSection } from './functions.js';

export function challengesPage(content){
    let mainContent = sideMenu('create',content);
    
    {   // Intro
        infoBoxBuilder(mainContent,{ name: 'intro', template: 'challenges', paragraphs: 3, h_level: 2,
            para_data: {
                2: [loc(`arpa_genepool_hardened_genes_title`),loc(`evo_bunker`)],
                3: [loc(`evo_challenge_genes`),loc(`evo_challenge_run`),loc(`evo_scenario`)]
            },
            data_link: {
                2: ['wiki.html#crispr-prestige-hardened_genes']
            }
        });
        sideMenu('add',`challenges-gameplay`,'intro',loc('wiki_menu_intro'));
    }
    
    // Challenge Genes
    {   // Intro
        let genes = infoBoxBuilder(mainContent,{ name: 'genes_intro', template: 'challenges', paragraphs: 5, break: [4], h_level: 2,
            para_data: {
                1: [loc(`evo_challenge_genes`)],
                2: [loc(`mastery`)],
                3: [loc(`mastery`)],
                5: [loc(`evo_challenge_genes`)]
            },
            data_link: {
                1: ['wiki.html#mechanics-gameplay-challenge'],
                2: ['wiki.html#mechanics-gameplay-mastery'],
                3: ['wiki.html#mechanics-gameplay-mastery']
            }
        });
        sideMenu('add',`challenges-gameplay`,'genes_intro',loc('wiki_challenges_genes_intro'));
        
        {   // No Starting Plasmids
            infoBoxBuilder(genes,{ name: 'genes_plasmid', template: 'challenges', paragraphs: 4, break: [4], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_plasmid`),loc(`wiki_challenges_gene`),loc(`resource_Plasmid_plural_name`)],
                    2: [loc(`city_temple`),loc(`resource_Plasmid_plural_name`),loc(`faith`)],
                    3: [loc(`resource_Plasmid_plural_name`)],
                    4: [loc(`wiki_challenges_gene`),loc(`universe_antimatter`)]
                },
                data_link: {
                    1: [false,false,`wiki.html#resources-prestige-plasmids`],
                    2: ['wiki.html#planetary-structures-temple'],
                    4: [false,'wiki.html#universes-gameplay-antimatter']
                }
            });
            subSideMenu('add',`challenges-gameplay`,'genes_plasmid',loc('wiki_challenges_genes_plasmid'));
        }
        
        {   // Weak Mastery
            infoBoxBuilder(genes,{ name: 'genes_mastery', template: 'challenges', paragraphs: 2, break: [2], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_mastery`),loc(`wiki_challenges_gene`),loc(`mastery`),`1/5`,`1/10`],
                    2: [loc(`wiki_challenges_gene`),loc(`universe_antimatter`)]
                },
                data_link: {
                    1: [false,false,'wiki.html#mechanics-gameplay-mastery'],
                    2: [false,'wiki.html#universes-gameplay-antimatter']
                }
            });
            subSideMenu('add',`challenges-gameplay`,'genes_mastery',loc('wiki_challenges_genes_mastery'));
        }
        
        {   // No Free Trade
            infoBoxBuilder(genes,{ name: 'genes_trade', template: 'challenges', paragraphs: 2, h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_trade`),loc(`wiki_challenges_gene`),loc(`resource_market_buy`),loc(`resource_market_sell`)],
                    2: [loc(`resource_market_trade_routes`)]
                }
            });
            subSideMenu('add',`challenges-gameplay`,'genes_trade',loc('wiki_challenges_genes_trade'));
        }
        
        {   // No Manual Crafting
            infoBoxBuilder(genes,{ name: 'genes_craft', template: 'challenges', paragraphs: 2, h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_craft`),loc(`wiki_challenges_gene`)],
                    2: [loc(`job_craftsman`)]
                }
            });
            subSideMenu('add',`challenges-gameplay`,'genes_craft',loc('wiki_challenges_genes_craft'));
        }
        
        {   // Junk Gene
            let crispr = infoBoxBuilder(genes,{ name: 'genes_crispr', template: 'challenges', paragraphs: 2, h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_crispr`),loc(`wiki_challenges_gene`),loc('tab_arpa_crispr'),loc('wiki_arpa_crispr_creep'),`1/5`]
                },
                data_link: {
                    1: [false,false,false,'wiki.html#crispr-prestige-genetic_memory']
                }
            });
            crispr.find(`div.para`).append(`<span>${loc('wiki_challenges_genes_bad_para2')}</span>`);
            let traits = $(`
                <div class="para">
                    <span>${loc('wiki_challenges_genes_crispr_para3')}</span>
                </div>
            `);
            crispr.append(traits);
            let comma = false;
            neg_roll_traits.forEach(function (trait){
                traits.append(`${comma ? ', ' : ''}<a href="wiki.html#traits-species-major_${trait}" target="_blank" class="has-text-warning">${loc('trait_'+ trait + '_name')}</a>`);
                comma = true;
            });
            subSideMenu('add',`challenges-gameplay`,'genes_crispr',loc('wiki_challenges_genes_crispr'));
        }

        {   // Bad Genes
            infoBoxBuilder(genes,{ name: 'genes_bad', template: 'challenges', paragraphs: 4, break: [3,4], h_level: 2,
                para_data: {
                    1: [1,2],
                    4: [loc(`wiki_challenges_gene`),loc(`evo_challenge_truepath`)]
                },
                data_link: {
                    4: [false,'wiki.html#challenges-gameplay-scenarios_truepath']
                }
            });
            subSideMenu('add',`challenges-gameplay`,'genes_bad',loc('wiki_challenges_genes_bad'));
        }

        {   // Weak Genes
            let weak_vals = global.race.universe === 'antimatter' ? [`20%`,`50%`,`50%`,`33%`] : [`50%`,`20%`,`50%`,`33%`];
            infoBoxBuilder(genes,{ name: 'genes_weak', template: 'challenges', paragraphs: 5, break: [2,3,4,5], h_level: 2,
                para_data: {
                    1: [weak_vals[0]],
                    2: [weak_vals[1]],
                    3: [weak_vals[2]],
                    4: [weak_vals[3]],
                    5: [loc(`wiki_challenges_gene`),loc(`evo_challenge_truepath`)]
                },
                data_link: {
                    5: [false,'wiki.html#challenges-gameplay-scenarios_truepath']
                }
            });
            subSideMenu('add',`challenges-gameplay`,'genes_weak',loc('wiki_challenges_genes_weak'));
        }
    }
    
    // Challenge Modes
    {   // Intro
        let modes = infoBoxBuilder(mainContent,{ name: 'modes_intro', template: 'challenges', paragraphs: 2, h_level: 2,
            para_data: {
                1: [loc(`evo_challenge_run`),loc(`evo_challenge_genes`)],
                2: [loc(`wiki_challenges_mode`)]
            }
        });
        sideMenu('add',`challenges-gameplay`,'modes_intro',loc('wiki_challenges_modes_intro'));
        
        {   // Joyless
            let joyless = infoBoxBuilder(modes,{ name: 'modes_joyless', template: 'challenges', paragraphs: 4, break: [3,4], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_joyless`),loc(`wiki_challenges_mode`),loc(`tech_theatre`)],
                    2: [loc(`job_entertainer`),loc(`morale_broadcast`),wardenLabel(),loc(`morale`)],
                    3: [loc(`wiki_challenges_mode`),actions.space.spc_red.biodome.title(),loc(`tech_theatre`)],
                    4: [loc(`wiki_challenges_scenarios_cataclysm`),loc(`wiki_challenges_scenario`)]
                },
                data_link: {
                    1: [false,false,'wiki.html#civilized-tech-theatre'],
                    2: [false,false,'wiki.html#planetary-structures-wardenclyffe'],
                    3: [false,'wiki.html#space-structures-biodome','wiki.html#civilized-tech-theatre'],
                    4: ['wiki.html#challenges-gameplay-scenarios_cataclysm']
                }
            });
            addAchievements(joyless,false,['joyless']);
            subSideMenu('add',`challenges-gameplay`,'modes_joyless',loc('wiki_challenges_modes_joyless'));
        }
        
        {   // Steelen
            let steelen = infoBoxBuilder(modes,{ name: 'modes_steelen', template: 'challenges', paragraphs: 4, break: [4], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_steelen`),loc(`wiki_challenges_mode`),loc('resource_Steel_name') + ' ' + loc('modal_smelting'),loc('resource_Steel_name')],
                    2: [loc('resource_Steel_name')],
                    3: [loc(`tech_steel`),loc(`tech_bessemer_process`),loc(`tech_oxygen_converter`),loc(`tech_electric_arc_furnace`)],
                    4: [loc(`wiki_challenges_mode`),loc(`wiki_resets_bioseed`)]
                },
                data_link: {
                    3: ['wiki.html#civilized-tech-steel','wiki.html#discovery-tech-bessemer_process','wiki.html#industrialized-tech-oxygen_converter','wiki.html#globalized-tech-electric_arc_furnace'],
                    4: [false,'wiki.html#resets-prestige-bioseed']
                }
            });
            addAchievements(steelen,false,['steelen']);
            addAchievements(steelen,true,['steelem']);
            subSideMenu('add',`challenges-gameplay`,'modes_steelen',loc('wiki_challenges_modes_steelen'));
        }
        
        {   // Decay
            let decay = infoBoxBuilder(modes,{ name: 'modes_decay', template: 'challenges', paragraphs: 6, break: [4,6], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_decay`),loc(`wiki_challenges_mode`)],
                    2: [loc(`resource_Money_name`),loc(`wiki_calc_citizens`),loc(`resource_Knowledge_name`),loc(`resource_Zen_name`),loc(`resource_Crates_plural`),loc(`resource_Containers_plural`)],
                    3: [50],
                    4: [`0/s`],
                    6: [loc(`wiki_challenges_mode`),loc(`wiki_resets_blackhole`),loc(`wiki_resets_vacuum`)]
                },
                data_link: {
                    6: [false,'wiki.html#resets-prestige-blackhole','wiki.html#resets-prestige-vacuum']
                }
            });
            addAchievements(decay,false,['dissipated']);
            addRequirements(decay,[
                {
                    text: `wiki_challenges_reqs_reset`,
                    subreqs: [
                        {
                            text: loc(`wiki_resets_blackhole`),
                            color: global.stats.achieve['whitehole'] ? true : false,
                            link: 'wiki.html#resets-prestige-blackhole'
                        }
                    ]
                }
            ]);
            let subSection = createCalcSection(decay,'challenges','decay',loc('evo_challenge_decay'));
            decayCalc(subSection);
            subSideMenu('add',`challenges-gameplay`,'modes_decay',loc('wiki_challenges_modes_decay'));
        }
        
        {   // EM Field
            let emfield = infoBoxBuilder(modes,{ name: 'modes_emfield', template: 'challenges', paragraphs: 5, break: [5], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_emfield`),loc(`wiki_challenges_mode`),`50%`,loc(`evo_challenge_discharge`),`50%`],
                    2: [loc(`evo_challenge_discharge`),`-50%`],
                    3: [loc(`city_cement_plant`),loc(`evo_challenge_discharge`),`50%`],
                    4: [loc(`space_belt_elerium_ship_title`),loc(`evo_challenge_discharge`),`-25%`],
                    5: [loc(`wiki_challenges_mode`),loc(`wiki_resets_ascension`)]
                },
                data_link: {
                    3: ['wiki.html#planetary-structures-cement_plant'],
                    4: ['wiki.html#space-structures-elerium_ship'],
                    5: [false,'wiki.html#resets-prestige-ascension']
                }
            });
            addAchievements(emfield,false,['technophobe']);
            addRequirements(emfield,[
                {
                    text: `wiki_challenges_reqs_reset`,
                    subreqs: [
                        {
                            text: loc(`wiki_resets_ascension`),
                            color: global.stats.achieve['ascended'] ? true : false,
                            link: 'wiki.html#resets-prestige-ascension'
                        }
                    ]
                    
                }
            ]);
            subSideMenu('add',`challenges-gameplay`,'modes_emfield',loc('wiki_challenges_modes_emfield'));
        }
        
        {   // Inflation
            let inflation = infoBoxBuilder(modes,{ name: 'modes_inflation', template: 'challenges', paragraphs: 11, break: [4,9,10], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_inflation`),loc(`wiki_challenges_mode`),loc(`resource_Money_name`)],
                    2: [1,10],
                    3: [loc(`space_dwarf_collider_title`),loc(`interstellar_stellar_engine`),1],
                    5: [loc(`resource_Money_name`),`+1.33%`],
                    6: [loc(`modal_factory_lux`),`+0.08%`,loc(`resource_Money_name`)],
                    7: [loc(`city_casino`),`+0.08%`,`+1%`,loc(`resource_Money_name`)],
                    8: [loc(`wiki_mechanics_bank_vault`),`+0.8%`,loc(`resource_Money_name`)],
                    9: [loc(`interstellar_exchange_title`),`2x`,loc(`resource_Money_name`),loc(`evo_challenge_inflation`)],
                    10: [loc(`wiki_challenges_mode`),loc(`wiki_challenges_modes_inflation_para10_note1`)],
                    11: [loc(`evo_challenge_inflation`)]
                },
                data_link: {
                    3: ['wiki.html#space-structures-world_collider','wiki.html#interstellar-structures-stellar_engine'],
                    7: ['wiki.html#planetary-structures-casino'],
                    8: ['wiki.html#mechanics-gameplay-bank_vault'],
                    9: ['wiki.html#interstellar-structures-exchange'],
                    
                }
            });
            addAchievements(inflation,false,['wheelbarrow']);
            addRequirements(inflation,[
                {
                    text: `wiki_challenges_reqs_achieve`,
                    subreqs: [
                        {
                            text: loc(`achieve_scrooge_name`),
                            color: global.stats.achieve['scrooge'] ? true : false
                        }
                    ]
                    
                }
            ]);
            let subSection = createCalcSection(inflation,'challenges','inflation',loc('evo_challenge_inflation'));
            inflationCalc(subSection);
            subSideMenu('add',`challenges-gameplay`,'modes_inflation',loc('wiki_challenges_modes_inflation'));
        }

        {   // Failed Experiment
            let failed = infoBoxBuilder(modes,{ name: 'modes_sludge', template: 'challenges', paragraphs: 7, break: [3,4,5,6,7], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_sludge`),loc(`wiki_challenges_challenge`),loc(`race_sludge`)],
                    3: [loc(`race_sludge`),'10x',loc('trait_ooze_name')],
                    4: [loc(`evo_challenge_sludge`)],
                    5: [loc(`race_sludge`),loc(`wiki_resets_mad`)],
                    6: [loc(`race_sludge`),loc(`wiki_resets_cataclysm`)],
                    7: [loc(`wiki_challenges_scenarios_junker`)]
                },
                data_link: {
                    1: [false,false,'wiki.html#races-species-sludge'],
                    3: [false,false,'wiki.html#traits-species-major_ooze'],
                    5: [false,'wiki.html#resets-prestige-mad']
                }
            });
            addAchievements(failed,false,['extinct_sludge','gross'],{gross: true});
            addAchievements(failed,true,['slime_lord']);
            addRequirements(failed,[
                {
                    text: `wiki_challenges_reqs_achieve`,
                    subreqs: [
                        {
                            text: loc(`achieve_extinct_junker_name`),
                            color: global.stats.achieve['extinct_junker'] ? true : false
                        }
                    ]
                    
                },
                {
                    text: `wiki_challenges_reqs_reset`,
                    subreqs: [
                        {
                            text: loc(`wiki_resets_ascension`),
                            color: global.stats.achieve['ascended'] ? true : false,
                            link: 'wiki.html#resets-prestige-ascension'
                        },
                        {
                            text: loc(`wiki_resets_infusion`),
                            color: global.stats.achieve['corrupted'] ? true : false,
                            link: 'wiki.html#resets-prestige-infusion'
                        }
                    ]
                }
            ]);
            subSideMenu('add',`challenges-gameplay`,'modes_sludge',loc('wiki_challenges_modes_sludge'));
        }

        {   // Orbital Decay
            let orbit = infoBoxBuilder(modes,{ name: 'modes_orbitdecay', template: 'challenges', paragraphs: 14, break: [5,8,9,10,11,12,13,14], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_orbit_decay`)],
                    2: [5000],
                    5: [loc(`evo_challenge_orbit_decay`)],
                    6: [loc(`tech_era_intergalactic`)],
                    11: [loc(`space_moon_base_title`), 2500],
                    12: [loc(`space_red_spaceport_title`), loc(`space_belt_station_title`), 1000],
                    13: [loc(`interstellar_alpha_starport_title`), 100],
                    14: [loc(`wiki_challenges_scenarios_cataclysm`)]
                }
            });
            addAchievements(orbit,false,['lamentis']);
            addRequirements(orbit,[
                {
                    text: `wiki_challenges_reqs_reset`,
                    subreqs: [
                        {
                            text: loc(`wiki_resets_blackhole`),
                            color: global.stats.achieve['whitehole'] ? true : false,
                            link: 'wiki.html#resets-prestige-blackhole'
                        },
                        {
                            text: loc(`wiki_resets_ascension`),
                            color: global.stats.achieve['ascended'] ? true : false,
                            link: 'wiki.html#resets-prestige-ascension'
                        }
                    ]
                }
            ]);
            subSideMenu('add',`challenges-gameplay`,'modes_orbitdecay',loc('wiki_challenges_modes_orbitdecay'));
        }

        {   // Witch Hunter
            let witch = infoBoxBuilder(modes,{ name: 'modes_witchhunter', template: 'challenges', paragraphs: 7, break: [4], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_witch_hunter`)],
                    4: [`300%`,`150%`,`75%`],
                    7: [100]
                }
            });
            addAchievements(witch,false,['soul_sponge','nightmare']);
            addRequirements(witch,[
                {
                    text: `wiki_challenges_reqs_reset`,
                    subreqs: [
                        {
                            text: `${loc(`wiki_universe_magic`)} ${loc(`wiki_resets_ascension`)}`,
                            color: global.stats.achieve['ascended'] && global.stats.achieve.ascended['mg'] ? true : false,
                            link: 'wiki.html#resets-prestige-ascension'
                        }
                    ]
                }
            ]);
            subSideMenu('add',`challenges-gameplay`,'modes_witchhunter',loc('wiki_challenges_modes_witchhunter'));
        }

        {   // Gravity Well
            let gravity = infoBoxBuilder(modes,{ name: 'modes_gravity_well', template: 'challenges', paragraphs: 6, break: [4], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_gravity_well`)],
                }
            });
            addAchievements(gravity,false,['escape_velocity']);
            addRequirements(gravity,[
                {
                    text: `wiki_challenges_reqs_reset`,
                    subreqs: [
                        {
                            text: `${loc(`wiki_universe_heavy`)} ${loc(`wiki_resets_bioseed`)}`,
                            color: global.stats.achieve['seeder'] && global.stats.achieve.seeder['h'] ? true : false,
                            link: 'wiki.html#resets-prestige-bioseed'
                        }
                    ]
                }
            ]);
            subSideMenu('add',`challenges-gameplay`,'modes_gravity_well',loc('wiki_challenges_modes_gravity_well'));
        }
    }
    
    // Scenarios
    {   // Intro
        let scenarios = infoBoxBuilder(mainContent,{ name: 'scenarios_intro', template: 'challenges', paragraphs: 3, h_level: 2,
            para_data: {
                1: [loc(`evo_scenario`)],
                2: [loc(`evo_challenge_genes`),loc(`evo_challenge_run`)],
                3: [loc(`evo_challenge_genes`),loc(`evo_challenge_run`),loc(`wiki_challenges_scenario`)]
            }
        });
        sideMenu('add',`challenges-gameplay`,'scenarios_intro',loc('wiki_challenges_scenarios_intro'));
        
        {   // Genetic Dead End
            let junker = infoBoxBuilder(scenarios,{ name: 'scenarios_junker', template: 'challenges', paragraphs: 4, break: [3,4], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_junker`),loc(`wiki_challenges_scenario`),loc(`race_junker`)],
                    3: [loc(`wiki_challenges_scenario`),loc(`wiki_resets_mad`)],
                    4: [loc(`wiki_challenges_modes_sludge`)]
                },
                data_link: {
                    1: [false,false,'wiki.html#races-species-junker'],
                    3: [false,'wiki.html#resets-prestige-mad']
                }
            });
            addAchievements(junker,false,['extinct_junker']);
            addAchievements(junker,true,['organ_harvester','the_misery','garbage_pie']);
            subSideMenu('add',`challenges-gameplay`,'scenarios_junker',loc('wiki_challenges_scenarios_junker'));
        }
        
        {   // Cataclysm
            let cataclysm = infoBoxBuilder(scenarios,{ name: 'scenarios_cataclysm', template: 'challenges', paragraphs: 9, break: [4,5,6,8,9], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_cataclysm`),loc(`wiki_challenges_scenario`),loc(`wiki_resets_cataclysm`)],
                    2: [loc(`evo_challenge_cataclysm`),loc(`city_casino`),getSolarName('hell')],
                    4: [loc(`evo_challenge_cataclysm`)],
                    5: [loc(`civics_foreign`),loc(`tech_unification`)],
                    7: [loc(`trait_parasite_name`),`20x`],
                    8: [loc(`resource_Plasmid_plural_name`),loc(`resource_AntiPlasmid_plural_name`),300,loc(`wiki_challenges_scenario`),loc(`resource_Phage_name`)],
                    9: [loc(`wiki_challenges_scenario`),loc(`wiki_resets_bioseed`)]
                },
                data_link: {
                    1: [false,false,'wiki.html#resets-prestige-cataclysm'],
                    2: [false,'wiki.html#space-structures-spc_casino'],
                    5: [false,'wiki.html#early_space-tech-unification2'],
                    7: ['wiki.html#traits-species-major_parasite'],
                    8: ['wiki.html#resources-prestige-plasmids','wiki.html#resources-prestige-antiplasmids',false,false,'wiki.html#resources-prestige-phage'],
                    9: [false,'wiki.html#resets-prestige-bioseed']
                }
            });
            addAchievements(cataclysm,false,['iron_will','failed_history']);
            addAchievements(cataclysm,true,['finish_line']);
            addRequirements(cataclysm,[
                {
                    text: `wiki_challenges_reqs_reset`,
                    subreqs: [
                        {
                            text: loc(`wiki_resets_cataclysm`),
                            color: global.stats.achieve['shaken'] ? true : false,
                            link: 'wiki.html#resets-prestige-cataclysm'
                        }
                    ]
                    
                }
            ]);
            subSideMenu('add',`challenges-gameplay`,'scenarios_cataclysm',loc('wiki_challenges_scenarios_cataclysm'));
        }
        
        {   // Banana Republic
            let banana = infoBoxBuilder(scenarios,{ name: 'scenarios_banana', template: 'challenges', paragraphs: 18, break: [2,4,5,8,9,10,18], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_banana`),loc(`wiki_challenges_scenario`),loc(`resource_Money_name`),loc(`morale_tax`)],
                    2: [loc(`tech_unification`),loc(`evo_challenge_banana`)],
                    3: [loc(`tech_unification`),loc(`restore`)],
                    4: [loc(`morale_tax`),`95%`,loc(`civics_tax_rates`),loc(`wiki_challenges_scenarios_banana_para4_note1`)],
                    5: [loc(`tab_market`),loc(`tech_sundial`),loc(`evo_challenge_banana`),1,loc(`resource_Food_name`),loc(`tech_trade`)],
                    6: [loc(`resource_market_trade_routes`)],
                    7: [loc(`resource_market_trade_routes`),10,25,loc(`tech_large_trades`),1000000,loc(`tech_massive_trades`)],
                    8: [loc(`civics_foreign`),`2x`,`50%`],
                    9: [loc(`civics_garrison_soldiers`),`20%`,loc(`tab_portal`)],
                    10: [loc(`galaxy_scout_ship`),7,10],
                    11: [loc(`galaxy_corvette_ship`),21,30],
                    12: [loc(`galaxy_frigate_ship`),56,80],
                    13: [loc(`galaxy_cruiser_ship`),175,250],
                    14: [loc(`galaxy_dreadnought`),1260,1800],
                    15: [loc(`galaxy_armed_miner`),4,5],
                    16: [loc(`galaxy_minelayer`),35,50],
                    17: [loc(`galaxy_raider`),9,12],
                    18: [loc(`wiki_challenges_scenario`),loc(`achieve_banana_name`)]
                },
                data_link: {
                    2: ['wiki.html#early_space-tech-unification2'],
                    3: ['wiki.html#early_space-tech-unification2'],
                    5: [false,'wiki.html#primitive-tech-sundial',false,false,false,'wiki.html#civilized-tech-trade'],
                    7: [false,false,false,'wiki.html#civilized-tech-large_trades',false,'wiki.html#globalized-tech-massive_trades'],
                    10: ['wiki.html#intergalactic-structures-scout_ship'],
                    11: ['wiki.html#intergalactic-structures-corvette_ship'],
                    12: ['wiki.html#intergalactic-structures-frigate_ship'],
                    13: ['wiki.html#intergalactic-structures-cruiser_ship'],
                    14: ['wiki.html#intergalactic-structures-dreadnought'],
                    15: ['wiki.html#intergalactic-structures-armed_miner'],
                    16: ['wiki.html#intergalactic-structures-minelayer'],
                    17: ['wiki.html#intergalactic-structures-raider'],
                    18: [false,'wiki.html#perks-prestige-banana']
                }
            });
            addAchievements(banana,false,['banana']);
            addAchievements(banana,true,['banana']);
            addRequirements(banana,[
                {
                    text: `wiki_challenges_reqs_reset`,
                    subreqs: [
                        {
                            text: loc(`wiki_resets_blackhole`),
                            color: global.stats.achieve['whitehole'] ? true : false,
                            link: 'wiki.html#resets-prestige-blackhole'
                        },
                        {
                            text: loc(`wiki_resets_ascension`),
                            color: global.stats.achieve['ascended'] ? true : false,
                            link: 'wiki.html#resets-prestige-ascension'
                        }
                    ]
                    
                }
            ]);
            subSideMenu('add',`challenges-gameplay`,'scenarios_banana',loc('wiki_challenges_scenarios_banana'));
        }

        {   // Fasting
            let fasting = infoBoxBuilder(scenarios,{ name: 'scenarios_fasting', template: 'challenges', paragraphs: 5, break: [1,2,3,4,5], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_fasting`),loc(`wiki_challenges_scenario`)],
                    2: [loc(`resource_Food_name`),0],
                    3: [loc(`job_meditator`)],
                    4: [loc(`city_tourist_center`)],
                    5: [loc(`wiki_challenges_scenario`),loc(`achieve_endless_hunger_name`)]
                },
                data_link: {
                    5: [false, 'wiki.html#perks-prestige-endless_hunger']
                }
            });
            addAchievements(fasting,false,['endless_hunger']);
            addRequirements(fasting,[
                {
                    text: `wiki_challenges_reqs_reset`,
                    subreqs: [
                        {
                            text: loc(`wiki_resets_infusion`),
                            color: global.stats.achieve['corrupted'] ? true : false,
                            link: 'wiki.html#resets-prestige-infusion'
                        }
                    ]
                    
                }
            ]);
            subSideMenu('add',`challenges-gameplay`,'scenarios_fasting',loc('wiki_challenges_scenarios_fasting'));
        }

        {   // True Path
            let truth = infoBoxBuilder(scenarios,{ name: 'scenarios_truepath', template: 'challenges', paragraphs: 5, break: [5], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_truepath`),loc(`wiki_challenges_scenario`)],
                    2: [loc(`tech_era_deep_space`)],
                    3: [loc(`tech_era_interstellar`),loc(`tech_era_solar`)]
                },
                data_link: {
                    2: ['wiki.html#deep_space-tech'],
                    3: ['wiki.html#interstellar-tech','wiki.html#solar-tp_tech']
                }
            });

            infoBoxBuilder(truth,{ name: 'scenarios_truepath_genes', template: 'challenges', paragraphs: 1, h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_plasmid`),loc(`evo_challenge_crispr`),loc(`evo_challenge_badgenes`),loc(`evo_challenge_nerfed`)],
                },
                data_link: {
                    1: ['wiki.html#challenges-gameplay-genes_plasmid','wiki.html#challenges-gameplay-genes_crispr','wiki.html#challenges-gameplay-genes_bad','wiki.html#challenges-gameplay-genes_weak'],
                }
            });

            infoBoxBuilder(truth,{ name: 'scenarios_truepath_rival', template: 'challenges', paragraphs: 5, break: [2,3,5], h_level: 2 });

            infoBoxBuilder(truth,{ name: 'scenarios_truepath_syndicate', template: 'challenges', paragraphs: 2, h_level: 2 });

            infoBoxBuilder(truth,{ name: 'scenarios_truepath_costs', template: 'challenges', paragraphs: 4, break: [2,3,4], h_level: 2,
                para_data: {
                    2: ['3x'],
                    3: ['2x'],
                }
            });

            infoBoxBuilder(truth,{ name: 'scenarios_truepath_market', template: 'challenges', paragraphs: 1, h_level: 2,
                para_data: {
                    1: ['2x'],
                } 
            });

            infoBoxBuilder(truth,{ name: 'scenarios_truepath_tax', template: 'challenges', paragraphs: 3, break: [2,4], h_level: 2,
                para_data: {
                    1: ['50%'],
                    2: [loc('tech_merchandising'),loc('city_temple')],
                } 
            });

            infoBoxBuilder(truth,{ name: 'scenarios_truepath_money', template: 'challenges', paragraphs: 2, break: [2], h_level: 2,
                para_data: {
                    1: [loc('city_bank'),'25%'],
                    2: [loc('city_casino'),'50%']
                } 
            });

            infoBoxBuilder(truth,{ name: 'scenarios_truepath_morale', template: 'challenges', paragraphs: 1, h_level: 2,
                para_data: {
                    1: ['25%'],
                } 
            });

            infoBoxBuilder(truth,{ name: 'scenarios_truepath_foreign', template: 'challenges', paragraphs: 1, h_level: 2 });

            infoBoxBuilder(truth,{ name: 'scenarios_truepath_fuel', template: 'challenges', paragraphs: 1, h_level: 2,
                para_data: {
                    1: ['25%','150%'],
                } 
            });

            addAchievements(truth,false,
                ['pathfinder','overlord','ashanddust','exodus','obsolete','bluepill','retired'],
                { ashanddust: true, exodus: true, obsolete: true, bluepill: true, retired: true });
            //addAchievements(truth,true,[]);
            addRequirements(truth,[
                {
                    text: `wiki_challenges_reqs_reset`,
                    subreqs: [
                        {
                            text: loc(`wiki_resets_ascension`),
                            color: global.stats.achieve['ascended'] ? true : false,
                            link: 'wiki.html#resets-prestige-ascension'
                        },
                        {
                            text: loc(`wiki_resets_infusion`),
                            color: global.stats.achieve['corrupted'] ? true : false,
                            link: 'wiki.html#resets-prestige-infusion'
                        }
                    ]
                }
            ]);
            subSideMenu('add',`challenges-gameplay`,'scenarios_truepath',loc('wiki_challenges_scenarios_truepath'));
        }

        {   // Lone Survivor
            let lone = infoBoxBuilder(scenarios,{ name: 'scenarios_lone_survivor', template: 'challenges', paragraphs: 4, break: [4], h_level: 2,
                para_data: {
                    1: [loc(`evo_challenge_lone_survivor`),loc(`wiki_challenges_scenario`),loc(`tab_tauceti`)],
                    3: [loc(`evo_challenge_truepath`)],
                    4: [loc(`wiki_challenges_scenario`),loc(`wiki_resets_eden`)],
                },
                data_link: {
                    4: [false,'wiki.html#resets-prestige-eden']
                }
            });
            addAchievements(lone,false,['adam_eve']);
            addRequirements(lone,[
                {
                    text: `wiki_challenges_reqs_reset`,
                    subreqs: [
                        {
                            text: loc(`wiki_resets_retired`),
                            color: global.stats.achieve['retired'] ? true : false,
                            link: 'wiki.html#resets-prestige-retired'
                        }
                    ]
                }
            ]);
            subSideMenu('add',`challenges-gameplay`,'scenarios_lone_survivor',loc('wiki_challenges_scenarios_lone_survivor'));
        }
    }
}

function addAchievements(content,feat,achievements,nolink){
    nolink = nolink || {};
    let achieves = $(`
        <div class="reqs">
            <span class="has-text-caution">${loc('wiki_challenges_' + (feat ? 'feats' : 'achievements'))}</span>
        </div>
    `);
    content.append(achieves);
    let comma = false;
    achievements.forEach(function (achieve){
        let text = feat ? loc(`feat_${achieve}_name`) : (nolink[achieve] ? loc(`achieve_${achieve}_name`) : `<a href="wiki.html#perks-prestige-${achieve}" target="_blank" class="has-text-warning">${loc(`achieve_${achieve}_name`)}</a>`);
        achieves.append(`${comma ? ', ' : ''}<span class="has-text-warning">${text}</span>`);
        comma = true; 
    });
}

function addRequirements(content,requirements){
    let reqs = $(`
        <div class="reqs">
            <span class="has-text-caution">${loc('wiki_challenges_requirements')}</span>
        </div>
    `);
    content.append(reqs);
    let comma = false;
    requirements.forEach(function (req){
        let multi = false;
        let totalColor = false;
        let reqText = '';
        req.subreqs.forEach(function (subReq){
            let subText = subReq.text;
            let link = subReq.link || false;
            let color = subReq.color;
            totalColor = totalColor || color;
            color = color ? 'success' : 'danger';
            if (link){
                subText = `<a href="${link}" class="has-text-${color}" target="_blank">${subText}</a>`
            }
            else {
                subText = `<span class="subreqs has-text-${color}">${subText}</span>`;
            }
            if (multi){
                reqText = loc('wiki_tech_req_or',[reqText,subText]);
            }
            else {
                multi = true;
                reqText = subText;
            }
        });
        totalColor = totalColor ? 'success' : 'danger';
        reqText = loc(req.text,[reqText]);
        reqs.append(`${comma ? `, ` : ``}<span class="has-text-${totalColor}">${reqText}</span>`);
        comma = true;
    });
}

function decayCalc(info){
    let calc = $(`<div class="calc" id="decayCalc"></div>`);
    info.append(calc);
    
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(formula);
    calc.append(variables);
    
    let inputs = {
        resource: { val: undefined },
        amount: { val: undefined }
    };
    
    let show = {
        result: { vis: false, val: undefined }
    };
    
    formula.append(`
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_decay_rate')}</h2>
        </div>
        <div>
            <span>{{ i.resource.val | base }} * 0.001 * ({{ i.amount.val, 'amount' | generic }} - 50)</span><span v-show="s.result.vis"> = {{ | calc }}</span>
        </div>
    `);
    
    let var_input = $(`<div></div>`);
    variables.append(var_input);
    
    let dropdown = `
        <div class="calcInput"><span>${loc('wiki_calc_decay_resource')}</span> <b-dropdown hoverable scrollable>
            <button class="button is-primary" slot="trigger">
                <span>{{ i.resource.val | resLabel }}</span>
                <i class="fas fa-sort-down"></i>
            </button>
    `;
    Object.keys(tradeRatio).forEach(function (res){
        dropdown += `
            <b-dropdown-item v-on:click="pickRes('${res}')">{{ '${res}' | resLabel }}</b-dropdown-item>
        `;
    });
    dropdown += `</b-dropdown></div>`;
    var_input.append(dropdown);
    var_input.append(`
        <div class="calcInput"><span>${loc('wiki_calc_decay_amount')}</span> <b-numberinput :input="val('amount')" min="0" v-model="i.amount.val" :controls="false"></b-numberinput></div>
    `);
    
    variables.append(`
        <div class="calcButton">
            <button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button>
        </div>
    `);
    
    vBind({
        el: `#decayCalc`,
        data: {
            i: inputs,
            s: show
        },
        methods: {
            val(type){
                if (inputs[type].val && inputs[type].val < 0){
                    inputs[type].val = 0;
                }
            },
            pickRes(res){
                inputs.resource.val = res;
            },
            resetInputs(){
                inputs.resource.val = undefined;
                inputs.amount.val = undefined;
            }
        },
        filters: {
            generic(num, type){
                return num !== undefined ? num : loc('wiki_calc_decay_' + type);
            },
            base(res){
                return res ? tradeRatio[res] : loc('wiki_calc_decay_base');
            },
            resLabel(res){
                return res ? loc(`resource_${res}_name`) : loc('wiki_calc_decay_resource');
            },
            calc(){
                show.result.vis = inputs.resource.val !== undefined && inputs.amount.val !== undefined && inputs.amount.val >= 50;
                
                if (show.result.vis){
                    show.result.val = tradeRatio[inputs.resource.val] * 0.001 * (inputs.amount.val - 50)
                    
                    return show.result.val;
                }
            }
        }
    });
}

function inflationCalc(info){
    let calc = $(`<div class="calc" id="inflationCalc"></div>`);
    info.append(calc);
    
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(formula);
    calc.append(variables);
    
    let inputs = {
        inflation: { val: undefined }
    };
    
    let show = {
        result: { vis: false,
                  cost: undefined, luxury: undefined, casino_prod: undefined, casino_store: undefined, bank_vault: undefined }
    };
    
    formula.append(`
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_inflation_cost')}</h2>
        </div>
        <div>
            <span>{{ i.inflation.val, 'inflation' | generic }} / 75</span><span v-show="s.result.vis"> = {{ 'cost' | calc }} = +{{ 'cost', true | calc }}%</span>
        </div>
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_inflation_luxury')}</h2>
        </div>
        <div>
            <span>{{ i.inflation.val, 'inflation' | generic }} / 1250</span><span v-show="s.result.vis"> = {{ 'luxury' | calc }} = +{{ 'luxury', true | calc }}%</span>
        </div>
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_inflation_casino_prod')}</h2>
        </div>
        <div>
            <span>{{ i.inflation.val, 'inflation' | generic }} / 1250</span><span v-show="s.result.vis"> = {{ 'casino_prod' | calc }} = +{{ 'casino_prod', true | calc }}%</span>
        </div>
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_inflation_casino_store')}</h2>
        </div>
        <div>
            <span>{{ i.inflation.val, 'inflation' | generic }} / 100</span><span v-show="s.result.vis"> = {{ 'casino_store' | calc }} = +{{ 'casino_store', true | calc }}%</span>
        </div>
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_inflation_bank_vault')}</h2>
        </div>
        <div>
            <span>{{ i.inflation.val, 'inflation' | generic }} / 125</span><span v-show="s.result.vis"> = {{ 'bank_vault' | calc }} = +{{ 'bank_vault', true | calc }}%</span>
        </div>
    `);
    
    variables.append(`
        <div>
            <div class="calcInput"><span>${loc('wiki_calc_inflation')}</span> <b-numberinput :input="val('inflation')" min="0" v-model="i.inflation.val" :controls="false"></b-numberinput></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button>
            <button class="button" @click="importInputs()">${loc('wiki_calc_import')}</button>
        </div>
    `);
    
    vBind({
        el: `#inflationCalc`,
        data: {
            i: inputs,
            s: show
        },
        methods: {
            val(type){
                if (inputs[type].val && inputs[type].val < 0){
                    inputs[type].val = 0;
                }
            },
            resetInputs(){
                inputs.inflation.val = undefined;
            },
            importInputs(){
                inputs.inflation.val = global.race.inflation || 0;
            }
        },
        filters: {
            generic(num, type){
                return num !== undefined ? num : loc('wiki_calc_' + type);
            },
            calc(type, percent){
                if (percent){
                    return (show.result[type] * 100).toFixed(3);
                }
                if (type === 'cost'){
                    show.result.vis = inputs.inflation.val !== undefined;

                    if (show.result.vis){
                        show.result.cost = (inputs.inflation.val / 75).toFixed(5);
                        show.result.luxury = (inputs.inflation.val / 1250).toFixed(5);
                        show.result.casino_prod = (inputs.inflation.val / 1250).toFixed(5);
                        show.result.casino_store = (inputs.inflation.val / 100).toFixed(5);
                        show.result.bank_vault = (inputs.inflation.val / 125).toFixed(5);
                    }
                }
                return show.result[type];
            }
        }
    });
}
