import { global } from './../vars.js';
import { universeAffix } from './../achieve.js';
import { loc } from './../locale.js';
import { timeFormat, vBind, svgIcons, svgViewBox, calcGenomeScore } from './../functions.js';
import { job_desc } from './../jobs.js';
import { races, traits, planetTraits } from './../races.js';
import { atomic_mass } from './../resources.js';
import { universe_types } from './../space.js';
import { swissKnife } from './../tech.js';
import { sideMenu, infoBoxBuilder, createCalcSection, getSolarName } from './functions.js';

export function mechanicsPage(content){
    let mainContent = sideMenu('create',content);

    { // Saving
        infoBoxBuilder(mainContent,{ name: 'save', template: 'mechanics', label: loc('wiki_mechanics_save'), paragraphs: 8, break: [3,5], h_level: 2,
            para_data: {
                1: [`~5`],
                3: [loc(`wiki_mechanics_save_export`)],
                4: [loc(`export`)],
                5: [loc(`restore`)],
                8: [loc(`restore`)]
            }
        });
        sideMenu('add',`mechanics-gameplay`,`save`,loc('wiki_mechanics_save'));
    }

    { // Accelerated Time
        infoBoxBuilder(mainContent,{ name: 'atime', template: 'mechanics', label: loc('wiki_mechanics_atime'), paragraphs: 6, break: [4,6], h_level: 2,
            para_data: {
                1: [loc('wiki_mechanics_atime')],
                2: [2,loc('wiki_mechanics_atime')],
                3: ['2x',loc('wiki_mechanics_atime')],
                4: [loc('wiki_mechanics_atime'),8],
                5: [12,8,loc('wiki_mechanics_atime')],
                6: [loc('wiki_mechanics_atime')]
            }
        });
        sideMenu('add',`mechanics-gameplay`,`atime`,loc('wiki_mechanics_atime'));
    }

    { // String Packs
        infoBoxBuilder(mainContent,{ name: 'spack', template: 'mechanics', label: loc('wiki_mechanics_spack'), paragraphs: 10, break: [4,6,7,8,9,10], h_level: 2,
            para_data: {
                1: ['UTF-8','JSON','.txt'],
                4: [`<a href="https://github.com/pmotschmann/Evolve/blob/master/README.md" target="_blank">${loc(`wiki_mechanics_spack_para4_note`)}</a>`],
                6: [loc(`resource_Food_name`),loc(`wiki_mechanics_spack_para6_note1`),loc(`city_biolab`),loc(`wiki_mechanics_spack_para6_note2`)]
            }
        });
        sideMenu('add',`mechanics-gameplay`,`spack`,loc('wiki_mechanics_spack'));
    }
    
    { // Default Job
        infoBoxBuilder(mainContent,{ name: 'job', template: 'mechanics', label: loc('wiki_mechanics_job'), paragraphs: 9, break: [5], h_level: 2,
            para_data: {
                1: [loc('wiki_mechanics_job')],
                2: ['*'],
                3: [loc('wiki_mechanics_job')]
            }
        });
        sideMenu('add',`mechanics-gameplay`,`job`,loc('wiki_mechanics_job'));
    }

    { // Job Stress
        let stress = infoBoxBuilder(mainContent,{ name: 'job_stress', template: 'mechanics', label: loc('wiki_mechanics_job_stress'), paragraphs: 7, break: [3,5,6,7], h_level: 2,
            para_data: {
                2: [loc('job_unemployed'),loc('trait_content_name')],
                3: [loc('wiki_calc_job_stress_divisor'),1],
                4: [loc('trait_freespirit_name'),loc('trait_content_name'),loc('planet_mellow')],
                6: [loc('trait_optimistic_name'),loc('trait_pessimistic_name'),loc('morale_stress'),loc('morale')],
                7: [loc('civics_garrison_annex')]
            },
            data_link: {
                2: [false,'wiki.html#traits-species-minor_content'],
                4: ['wiki.html#traits-species-major_freespirit','wiki.html#traits-species-minor_content','wiki.html#planets-gameplay-mellow'],
                6: ['wiki.html#traits-species-major_optimistic','wiki.html#traits-species-major_pessimistic']
            }
        });
        let subSection = createCalcSection(stress,'mechanics','job_stress',loc('wiki_mechanics_job_stress'));
        jobStressCalc(subSection);
        sideMenu('add',`mechanics-gameplay`,`job_stress`,loc('wiki_mechanics_job_stress'));
    }

    { // Multiplier Keys
        infoBoxBuilder(mainContent,{ name: 'multiplier', template: 'mechanics', label: loc('wiki_mechanics_multiplier'), paragraphs: 5, break: [4], h_level: 2,
            para_data: {
                1: [loc('wiki_mechanics_multiplier')],
                2: ['10x',global.settings.keyMap.x10,'25x',global.settings.keyMap.x25,'100x',global.settings.keyMap.x100],
                4: [loc('wiki_mechanics_multiplier')],
                5: [loc('wiki_mechanics_multiplier')]
            },
            data_color: {
                2: ['warning','caution','warning','caution','warning','caution']
            }
        });
        sideMenu('add',`mechanics-gameplay`,`multiplier`,loc('wiki_mechanics_multiplier'));
    }

    { // Cost Creep
        infoBoxBuilder(mainContent,{ name: 'cost_creep', template: 'mechanics', label: loc('wiki_mechanics_cost_creep'), paragraphs: 7, break: [4,7], h_level: 2,
            para_data: {
                2: [loc('resource_Lumber_name'),200,1.3,'200*1.3=260','200*1.3^2=338'],
                3: [loc('wiki_menu_arpa')],
                5: [loc('tech_steel_beams'),loc('trait_large_name'),loc('tab_arpa_crispr'),loc('wiki_arpa_crispr_creep')],
                6: [loc('trait_creative_name'),loc('wiki_menu_arpa')],
                7: [1.005]
            },
            data_link: {
                3: ['wiki.html#projects-arpa'],
                5: ['wiki.html#discovery-tech-steel_beams','wiki.html#traits-species-genus_large',false,'wiki.html#crispr-prestige-genetic_memory'],
                6: ['wiki.html#traits-species-major_creative']
            }
        });
        sideMenu('add',`mechanics-gameplay`,`cost_creep`,loc('wiki_mechanics_cost_creep'));
    }

    { // Queue
        infoBoxBuilder(mainContent,{ name: 'queue', template: 'mechanics', label: loc('wiki_mechanics_queue'), paragraphs: 13, break: [4,6,9,10,11,13], h_level: 2,
            para_data: {
                1: [loc('wiki_mechanics_queue'),loc('tech_urban_planning')],
                2: [loc('building_queue')],
                4: [loc('wiki_mechanics_queue_research'),loc('tech_assistant')],
                7: [loc('q_key'),global.settings.keyMap.q],
                8: [loc('q_key')],
                10: [loc('q_any')],
                12: [loc('q_merge')]
            },
            data_color: {
                7: ['warning','caution']
            }
        });
        sideMenu('add',`mechanics-gameplay`,`queue`,loc('wiki_mechanics_queue'));
    }

    { // Bank Vault
        infoBoxBuilder(mainContent,{ name: 'bank_vault', template: 'mechanics', label: loc('wiki_mechanics_bank_vault'), paragraphs: 2, h_level: 2,
            para_data: {
                1: [loc('city_bank'),loc('interstellar_exchange_title'),loc('portal_arcology_title'),loc('resource_Money_name'),loc('wiki_mechanics_bank_vault'),loc('space_red_spaceport_title'),loc('wiki_challenges_scenarios_cataclysm')],
                2: [loc('resource_Money_name'),loc('city_bank'),loc('tech_adamantite_vault'),loc('governor_entrepreneur'),loc('trait_paranoid_name'),loc('tech_stock_market'),loc('tech_unification'),loc('wiki_challenges_modes_inflation')]
            },
            data_link: {
                1: ['wiki.html#planetary-structures-bank','wiki.html#interstellar-structures-exchange','wiki.html#hell-structures-arcology',false,false,'wiki.html#space-structures-spaceport','wiki.html#challenges-gameplay-scenarios_cataclysm'],
                2: [false,false,'wiki.html#interstellar-tech-adamantite_vault','wiki.html#governor-gameplay-entrepreneur','wiki.html#traits-species-major_paranoid','wiki.html#projects-arpa-stock_exchange','wiki.html#early_space-tech-unification2','wiki.html#challenges-gameplay-modes_inflation']
            }
        });
        sideMenu('add',`mechanics-gameplay`,`bank_vault`,loc('wiki_mechanics_bank_vault'));
    }

    { // Homeless
        infoBoxBuilder(mainContent,{ name: 'homeless', template: 'mechanics', label: loc('wiki_mechanics_homeless'), paragraphs: 4, break: [3], h_level: 2,
            para_data: {
                3: [loc('arpa_projects_railway_title')]
            },
            data_link: {
                3: ['wiki.html#projects-arpa-railway']
            }
        });
        sideMenu('add',`mechanics-gameplay`,`homeless`,loc('wiki_mechanics_homeless'));
    }

    { // Warmonger
        let warmonger = infoBoxBuilder(mainContent,{ name: 'warmonger', template: 'mechanics', label: loc('wiki_mechanics_warmonger'), paragraphs: 8, break: [4], h_level: 2,
            para_data: {
                2: [loc('trait_immoral_name')],
                3: [loc('govern_autocracy'),loc('trait_blood_thirst_name')],
                4: [loc('wiki_calc_warmonger_fatigue'),loc('wiki_calc_warmonger_protest')],
                5: [loc('achieve_warmonger_name')],
                6: [loc('wiki_calc_warmonger_fatigue'),1,loc('wiki_calc_warmonger_protest')],
                7: [loc('wiki_calc_warmonger_fatigue'),loc('wiki_calc_warmonger_protest'),1,0],
                8: [`log2(${loc('wiki_calc_warmonger_fatigue')} + ${loc('wiki_calc_warmonger_protest')})`]
            },
            data_link: {
                2: ['wiki.html#traits-species-genus_immoral'],
                3: ['wiki.html#government-gameplay-autocracy','wiki.html#traits-species-major_blood_thirst']
            }
        });
        let subSection = createCalcSection(warmonger,'mechanics','warmonger',loc('wiki_mechanics_warmonger'));
        warmongerCalc(subSection);
        sideMenu('add',`mechanics-gameplay`,`warmonger`,loc('wiki_mechanics_warmonger'));
    }

    { // Spies
        let spy = infoBoxBuilder(mainContent,{ name: 'spy', template: 'mechanics', label: loc('wiki_mechanics_spy'), paragraphs: 8, break: [3,4,5,6,7], h_level: 2,
            para_data: {
                1: [loc('tech_spy')],
                4: [1,loc('civics_gov_relations'),loc('civics_gov_mil_rate')],
                5: [2,loc('civics_gov_mil_rate'),loc('civics_gov_eco_rate')],
                6: [3,loc('civics_gov_eco_rate'),loc('civics_gov_unrest')],
                7: [4,loc('civics_gov_unrest')],
                8: [4],
                9: [loc('tech_espionage')]
            },
            data_link: {
                1: ['wiki.html#civilized-tech-spy'],
                9: ['wiki.html#civilized-tech-espionage']
            }
        });
        let subSection = createCalcSection(spy,'mechanics','spy_cost');
        spyCostCalc(subSection);
        sideMenu('add',`mechanics-gameplay`,`spy`,loc('wiki_mechanics_spy'));
    }

    { // Occupying Foreign Powers
        let occupation = infoBoxBuilder(mainContent,{ name: 'occupying', template: 'mechanics', label: loc('wiki_mechanics_occupying'), paragraphs: 20, break: [3,8,12,16,18,19,20], h_level: 2,
            para_data: {
                1: [loc('civics_foreign'),loc('civics_garrison_tactic_siege'),loc('civics_spy_annex'),loc('civics_spy_purchase')],
                2: ['+5%','+8%',loc('govern_federation')],
                3: [loc('civics_garrison_tactic_siege'),20],
                5: [loc('civics_garrison'),loc('civics_garrison_tactic_siege')],
                6: [loc('civics_garrison_unoccupy'),loc('tech_unification')],
                7: [loc('govern_federation'),15],
                8: ['50%',loc('civics_gov_relations'),'50%',loc('civics_gov_unrest'),`(300 - ${loc('civics_gov_relations')} - ${loc('civics_gov_unrest')})`,loc('morale')],
                9: ['50%',loc('civics_gov_relations'),'50%',loc('civics_gov_unrest'),loc('civics_spy_annex')],
                10: [loc('morale'),loc('civics_spy_annex')],
                11: [loc('morale_stress'),'1.1x',loc('govern_federation')],
                12: [loc('resource_Money_name')],
                13: [3,loc('tech_spy'),loc('civics_spy_purchase')],
                14: [loc('wiki_mechanics_occupying_para14_note1',[loc('civics_gov_eco_rate'),loc('civics_gov_relations'),loc('civics_gov_unrest')]),loc('resource_Money_name'),loc('civics_spy_purchase')],
                15: [loc('civics_garrison_purchase'),loc('resource_Money_name'),loc('morale_tax'),'20%',loc('govern_federation')],
                16: [loc('tech_unification')],
                17: [loc('civics_garrison_occupy')],
                18: [loc('achieve_world_domination_name')],
                19: [loc('achieve_illuminati_name')],
                20: [loc('achieve_syndicate_name')]
            },
            data_link: {
                2: [false,false,'wiki.html#government-gameplay-federation'],
                6: [false,'wiki.html#early_space-tech-unification2'],
                7: ['wiki.html#government-gameplay-federation'],
                11: [false,false,'wiki.html#government-gameplay-federation'],
                15: [false,false,false,false,'wiki.html#government-gameplay-federation'],
                16: ['wiki.html#early_space-tech-unification2']
            }
        });
        let subSection = createCalcSection(occupation,'mechanics','occupation');
        occupationCalc(subSection);
        sideMenu('add',`mechanics-gameplay`,`occupying`,loc('wiki_mechanics_occupying'));
    }

    { // Religion
        infoBoxBuilder(mainContent,{ name: 'religion', template: 'mechanics', label: loc('wiki_mechanics_religion'), paragraphs: 20, break: [3,6,8,15,20], h_level: 2,
            para_data: {
                1: [loc('wiki_mechanics_religion')],
                3: [loc('city_temple')],
                4: [loc('city_temple'),loc('resource_Plasmid_plural_name')],
                5: [loc('evo_challenge_plasmid'),loc('faith')],
                6: [loc('tech_fanaticism'),loc('tech_anthropology')],
                8: [loc('tech_fanaticism'),loc('tech_indoctrination'),loc('tech_missionary'),loc('tech_zealotry')],
                9: [loc('tech_fanaticism')],
                10: [loc('wiki_menu_species')],
                11: [5],
                12: [loc('tech_indoctrination')],
                13: [loc('tech_missionary')],
                14: [loc('tech_zealotry')],
                15: [loc('tech_anthropology'),loc('tech_mythology'),loc('tech_archaeology'),loc('tech_merchandising')],
                16: [loc('tech_anthropology')],
                17: [loc('tech_mythology')],
                18: [loc('tech_archaeology')],
                19: [loc('tech_merchandising')],
                20: [loc('tab_arpa_crispr'),loc('wiki_arpa_crispr_transcendence')]
            },
            data_link: {
                10: ['wiki.html#races-species'],
                20: ['wiki.html#crispr-prestige','wiki.html#crispr-prestige-transcendence']
            }
        });
        sideMenu('add',`mechanics-gameplay`,`religion`,loc('wiki_mechanics_religion'));
    }

    { // Challenge Genes
        let p_star = `<span class="flair" aria-label="star"><svg class="star2" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox('star')}" xml:space="preserve">${svgIcons('star')}</svg></span>`;
        let b_star = `<span class="flair" aria-label="star"><svg class="star3" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox('star')}" xml:space="preserve">${svgIcons('star')}</svg></span>`;
        let s_star = `<span class="flair" aria-label="star"><svg class="star4" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox('star')}" xml:space="preserve">${svgIcons('star')}</svg></span>`;
        let g_star = `<span class="flair" aria-label="star"><svg class="star5" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox('star')}" xml:space="preserve">${svgIcons('star')}</svg></span>`;

        infoBoxBuilder(mainContent,{ name: 'challenge', template: 'mechanics', label: loc('wiki_mechanics_challenge'), paragraphs: 15, break: [4,8,14], h_level: 2,
            para_data: {
                1: [loc('wiki_mechanics_challenge'),loc('wiki_menu_prehistoric'),loc('tab_arpa_crispr'),loc('arpa_genepool_hardened_genes_title')],
                2: [4,loc('evo_challenge_plasmid'),loc('evo_challenge_trade'),loc('evo_challenge_craft'),loc('evo_challenge_crispr')],
                4: [loc('evo_challenge_plasmid'),loc('resource_Plasmid_plural_name')],
                5: [loc('evo_challenge_trade')],
                6: [loc('evo_challenge_craft')],
                7: [loc('evo_challenge_crispr'),loc('wiki_arpa_crispr_creep'),'20%'],
                8: [loc('wiki_mechanics_challenge')],
                9: [1,p_star,loc('plain'),'5%'],
                10: [2,b_star,loc('bronze'),'12%'],
                11: [3,s_star,loc('silver'),'25%'],
                12: [4,g_star,loc('gold'),'45%'],
                14: [loc('wiki_mechanics_challenge'),p_star]
            },
            data_color: {
                2: ['caution','warning','warning','warning','warning'],
                7: ['warning','warning','caution'],
                9: ['caution',false,'warning','warning'],
                10: ['caution',false,'warning','warning'],
                11: ['caution',false,'warning','warning'],
                12: ['caution',false,'warning','warning']
            },
            data_link: {
                1: [false,false,'wiki.html#crispr-prestige','wiki.html#crispr-prestige-hardened_genes'],
                7: [false,'wiki.html#crispr-prestige-genetic_memory',false]
            }
        });
        sideMenu('add',`mechanics-gameplay`,`challenge`,loc('wiki_mechanics_challenge'));
    }

    { // Mastery
        infoBoxBuilder(mainContent,{ name: 'mastery', template: 'mechanics', label: loc('mastery'), paragraphs: 15, break: [3,8,10,13], h_level: 2,
            para_data: {
                1: [loc('mastery'),loc('tab_arpa_crispr'),loc('arpa_genepool_unlocked_title')],
                2: [loc('mastery'),loc('tab_achieve')],
                4: ['0.15%','0.10%'],
                5: [1],
                6: [1,5],
                7: ['1.25%'],
                9: [loc('standard'),'0.25%'],
                10: [loc('arpa_genepool_universal_title'),loc('arpa_genepool_standard_title')],
                11: [loc('arpa_genepool_universal_title'),'0.05%','0.10%','0.15%'],
                12: ['0.30%','1.50%'],
                13: [loc('arpa_genepool_standard_title'),'0.05%'],
                15: [loc('arpa_genepool_standard_title'),'0.20%','0.10%']
            },
            data_color: {
                4: ['caution','caution'],
                5: ['caution'],
                6: ['caution','caution'],
                7: ['caution'],
                9: [false,'caution'],
                11: ['warning','caution','caution','caution'],
                12: ['caution','caution'],
                13: ['warning','caution'],
                15: ['warning','caution','caution']
            },
            data_link: {
                1: [false,'wiki.html#crispr-prestige','wiki.html#crispr-prestige-unlocked'],
                9: ['wiki.html#universes-gameplay'],
                10: ['wiki.html#crispr-prestige-universal','wiki.html#crispr-prestige-standard']
            }
        });
        sideMenu('add',`mechanics-gameplay`,`mastery`,loc('mastery'));
    }

    { // Genome Decay
        let genome_decay = infoBoxBuilder(mainContent,{ name: 'genome_decay', template: 'mechanics', label: loc('wiki_mechanics_genome_decay'), paragraphs: 4, break: [3], h_level: 2,
            para_data: {
                1: [loc('wiki_mechanics_genome_decay_para1_note1',[loc('wiki_calc_g_decay_mutations')]),loc('wiki_mechanics_genome_decay')],
                2: ['2-3'],
                3: [loc('wiki_mechanics_genome_decay'),loc('resource_Plasmid_name'),'+0%'],
                4: [loc('tech_genetic_decay'),loc('trait_fortify_name'),loc('wiki_mechanics_genome_decay'),loc('resource_Plasmid_name'),'+0%']
            },
            data_link: {
                4: ['wiki.html#early_space-tech-genetic_decay','wiki.html#traits-species-special_fortify']
            }
        });
        let subSection = createCalcSection(genome_decay,'mechanics','g_decay',loc('wiki_mechanics_genome_decay'));
        genomeDecayCalc(subSection);
        sideMenu('add',`mechanics-gameplay`,`genome_decay`,loc('wiki_mechanics_genome_decay'));
    }

    { // CRISPR Mutation
        let crispr_mutation = infoBoxBuilder(mainContent,{ name: 'crispr_mutation', template: 'mechanics', label: loc('wiki_mechanics_crispr_mutation'), paragraphs: 5, break: [3], h_level: 2,
            para_data: {
                1: [loc('tab_arpa_crispr'),loc('arpa_genepool_mutation_title'),loc('resource_Plasmid_plural_name')],
                3: [loc('tech_arpa'),loc('tab_arpa_genetics'),],
                4: ['5x',loc('wiki_mechanics_crispr_mutation_para4_note1')],
                5: [loc('wiki_mechanics_custom'),loc('race_sludge'),'10x']
            },
            data_link: {
                1: [false,'wiki.html#crispr-prestige-mutation','wiki.html#resources-prestige-plasmids'],
                4: [false,'wiki.html#traits-species'],
                5: ['wiki.html#custom-species','wiki.html#races-species-sludge']
            }
        });
        sideMenu('add',`mechanics-gameplay`,`crispr_mutation`,loc('wiki_mechanics_crispr_mutation'));
    }

    { // Planets 
        let planets = infoBoxBuilder(mainContent,{ name: 'planet', template: 'planet', label: loc('wiki_menu_planets'), paragraphs: 4, h_level: 2,
            para_data: {
                2: [365,'25%'],
                3: [4],
                4: ['200-600']
            }
        });
        infoBoxBuilder(mainContent,{ name: 'geology', template: 'planet', label: loc('wiki_menu_planets'), paragraphs: 4, h_level: 2,
            para_data: {
                2: [2],
                3: ['-10%','+19%'],
                4: [7,'+44%']
            }
        },planets);
        infoBoxBuilder(mainContent,{ name: 'seeother', template: 'planet', label: loc('wiki_menu_planets'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc('wiki_menu_planets')]
            },
            data_link: {
                1: ['wiki.html#planets-gameplay']
            }
        },planets);
        sideMenu('add',`mechanics-gameplay`,`planet`,loc('wiki_menu_planets'));
    }
    
    { // Soul Gem
        infoBoxBuilder(mainContent,{ name: 'soul_gem', template: 'hell', label: loc('wiki_hell_soul_gem'), paragraphs: 4, h_level: 2,
            para_data: {
                1: [loc('wiki_hell_soul_gem'),loc('tab_portal')],
                3: [loc('tech_demon_attractor')]
            }
        });
        sideMenu('add',`mechanics-gameplay`,`soul_gem`,loc('wiki_hell_soul_gem'));
    }

    { // Quantum Level
        let quantum = infoBoxBuilder(mainContent,{ name: 'quantum', template: 'mechanics', label: loc('wiki_mechanics_quantum'), paragraphs: 4, h_level: 2,
            para_data: {
                1: [loc('wiki_mechanics_quantum')],
                2: [loc('tech_quantum_computing')],
                4: [loc('interstellar_citadel_title')]
            },
            data_link: {
                2: ['wiki.html#deep_space-tech-quantum_computing'],
                4: ['wiki.html#interstellar-structures-citadel']
            }
        });
        let subSection = createCalcSection(quantum,'mechanics','quantum_level',loc('wiki_mechanics_quantum'));
        quantumLevelCalc(subSection);
        sideMenu('add',`mechanics-gameplay`,`quantum`,loc('wiki_mechanics_quantum'));

        infoBoxBuilder(quantum,{ name: 'quantum_swarm_ai', template: 'mechanics', label: loc('tech_swarm_control_ai'), paragraphs: 2, h_level: 2,
            para_data: {
                1: [loc('tech_quantum_computing'),loc('space_sun_swarm_satellite_title'),loc('space_sun_swarm_control_title')],
                2: [loc('space_sun_swarm_control_title'),11,loc('wiki_mechanics_quantum')]
            },
            data_link: {
                1: ['wiki.html#deep_space-tech-swarm_control_ai','wiki.html#space-structures-swarm_satellite','wiki.html#space-structures-swarm_control']
            }
        });

        infoBoxBuilder(quantum,{ name: 'quantum_swarm', template: 'mechanics', label: loc('tech_quantum_swarm'), paragraphs: 3, h_level: 2,
            para_data: {
                1: [loc('tech_quantum_swarm'),loc('space_hell_swarm_plant_title')],
                2: ['1%'],
                3: ['95%']
            },
            data_link: {
                1: ['wiki.html#deep_space-tech-quantum_swarm','wiki.html#space-structures-swarm_plant']
            }
        });

        infoBoxBuilder(quantum,{ name: 'quantum_manufacture', template: 'mechanics', label: loc('tech_quantum_manufacturing'), paragraphs: 4, break: [2,3,4], h_level: 2,
            para_data: {
                1: [loc('tech_quantum_manufacturing'),loc('city_factory'),loc('wiki_mechanics_quantum')],
                2: [loc(`modal_factory_lux`)],
                3: [loc(`resource_Furs_name`),'(Q Level - 1) * 12.5'],
                4: ['(Q Level - 1) * 50'],
            },
            data_link: {
                1: ['wiki.html#deep_space-tech-quantum_manufacturing','wiki.html#planetary-structures-factory',false]
            }
        });

        infoBoxBuilder(quantum,{ name: 'quantum_cement_processing', template: 'mechanics', label: loc('tech_cement_processing'), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                1: [loc('tech_cement_processing'),loc('interstellar_citadel_title')],
                2: ['(Q Level / 1.75) %'],
            },
            data_link: {
                1: ['wiki.html#interstellar-tech-cement_processing','wiki.html#interstellar-structures-citadel']
            }
        });

        infoBoxBuilder(quantum,{ name: 'quantum_graph_processing', template: 'mechanics', label: loc('tech_graphene_processing'), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                1: [loc('tech_graphene_processing'),loc('interstellar_citadel_title')],
                2: ['(Q Level / 5) %'],
            },
            data_link: {
                1: ['wiki.html#intergalactic-tech-graphene_processing','wiki.html#interstellar-structures-citadel']
            }
        });

        infoBoxBuilder(quantum,{ name: 'quantum_ai_logistics', template: 'mechanics', label: loc('tech_ai_logistics'), paragraphs: 3, break: [3], h_level: 2,
            para_data: {
                1: [loc('tech_ai_logistics'),loc('interstellar_cargo_yard_title'),loc('city_shed_title3')],
                2: [loc('city_shed_title3')],
                3: [loc('wiki_mechanics_quantum')]
            },
            data_link: {
                1: ['wiki.html#interstellar-tech-ai_logistics','wiki.html#interstellar-structures-cargo_yard','wiki.html#interstellar-structures-warehouse']
            }
        });

        infoBoxBuilder(quantum,{ name: 'quantum_arcology', template: 'mechanics', label: loc('portal_arcology_title'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc('portal_arcology_title'),10]
            },
            data_link: {
                1: ['wiki.html#hell-structures-arcology',false]
            }
        });
    }

    { // Mass & Ejecting
        let mass = infoBoxBuilder(mainContent,{ name: 'mass', template: 'mechanics', label: loc('wiki_mechanics_mass'), paragraphs: 11, break: [5,9], h_level: 2,
            para_data: {
                1: [loc('tab_interstellar')],
                2: [loc('tech_mass_ejector'),loc('interstellar_mass_ejector'),loc('tab_ejector')],
                4: [(10000000000).toLocaleString()],
                5: [loc('universe_magic'),loc('resource_Infernite_name'),loc('resource_Elerium_name')],
                6: [0.025,loc('tech_stabilize_blackhole'),loc('tech_exotic_infusion')],
                7: [loc('tech_stabilize_blackhole'),0,40,loc('tech_exotic_infusion'),loc('wiki_resets_blackhole')],
                8: [loc('tech_stabilize_blackhole'),0.025],
                9: [loc('interstellar_stellar_engine'),20,8],
                10: [1,7.5,loc('interstellar_stellar_engine'),13.5,loc('tech_gravity_convection')],
                11: [10]
            },
            data_link: {
                2: ['wiki.html#interstellar-tech-mass_ejector','wiki.html#interstellar-structures-mass_ejector'],
                6: [false,'wiki.html#interstellar-tech-stabilize_blackhole','wiki.html#interstellar-tech-infusion_confirm'],
                7: ['wiki.html#interstellar-tech-stabilize_blackhole',false,false,'wiki.html#interstellar-tech-infusion_confirm','wiki.html#resets-prestige-blackhole'],
                8: ['wiki.html#interstellar-tech-stabilize_blackhole'],
                9: ['wiki.html#interstellar-structures-stellar_engine'],
                10: [false,false,'wiki.html#interstellar-structures-stellar_engine',false,'wiki.html#interstellar-tech-gravity_convection']
            }
        });
        let subSection = createCalcSection(mass,'eject','mass');
        massCalc(subSection);
        sideMenu('add',`mechanics-gameplay`,`mass`,loc('wiki_mechanics_mass'));
    }

    { // Piracy
        let pirates = infoBoxBuilder(mainContent,{ name: 'piracy', template: 'mechanics', label: loc('galaxy_piracy'), paragraphs: 6, break: [4], h_level: 2,
            para_data: {
                1: [loc('galaxy_piracy'),loc('wiki_menu_intergalactic')],
                2: [loc('galaxy_embassy')],
                4: [loc('tab_galactic'),loc('galaxy_piracy'),loc('galaxy_stargate')],
                5: [loc('interstellar_stargate')]
            }
        });
        infoBoxBuilder(mainContent,{ name: 'pirate_ramp', template: 'mechanics', label: loc('galaxy_piracy'), paragraphs: 3, h_level: 2,
            para_data: {
                1: [loc('galaxy_stargate'),loc('galaxy_gateway')],
                2: [loc('tab_galactic')],
                3: [loc('galaxy_embassy'),loc('tech_xeno_gift'),loc('galaxy_alien2_mission',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red])],
            }
        },pirates);
        infoBoxBuilder(mainContent,{ name: 'pirate_threat', template: 'mechanics', label: loc('galaxy_piracy'), paragraphs: 7, break: [2,3,4,5,6,7],  h_level: 2,
            para_data: {
                1: [loc('galaxy_armada')],
                2: [loc('galaxy_gateway'),100,250,500],
                3: [loc('galaxy_stargate'),100,250,500],
                4: [loc('galaxy_gorddon'),800],
                5: [loc('galaxy_alien',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].home]),1000],
                6: [loc('galaxy_alien',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].solar.red]),2500],
                7: [loc('galaxy_chthonian'),7500]
            },
            data_color: {
                2: ['caution','warning','warning','warning'],
                3: ['caution','warning','warning','warning'],
                4: ['caution','warning'],
                5: ['caution','warning'],
                6: ['caution','warning'],
                7: ['caution','warning']
            }
        },pirates);
        sideMenu('add',`mechanics-gameplay`,`piracy`,loc('galaxy_piracy'));
    }

    { // Customs & Untapped Potential
        let custom = infoBoxBuilder(mainContent,{ name: 'custom', template: 'mechanics', label: loc('wiki_mechanics_custom'), paragraphs: 12, break: [3,5,9,11], h_level: 2,
            para_data: {
                1: [loc('wiki_resets_ascension')],
                2: [loc('wiki_resets_ascension')],
                5: [loc('resource_Genes_name')],
                6: [loc('resource_Genes_name')],
                7: [2],
                8: [loc('achieve_technophobe_name'),5,7],
                9: [loc('tech_fanaticism'),loc('tech_deify')],
                11: [0,loc('resource_Genes_name')],
                12: [loc('resource_Genes_name'),loc('trait_untapped_name')]
            },
            data_link: {
                1: ['wiki.html#resets-prestige-ascension'],
                2: ['wiki.html#resets-prestige-ascension'],
                8: ['wiki.html#perks-prestige-technophobe'],
                9: [(global.genes['transcendence'] ? 'wiki.html#civilized-tech-alt_fanaticism' : 'wiki.html#civilized-tech-fanaticism'),'wiki.html#early_space-tech-deify']
            }
        });
        let subSection = createCalcSection(custom,'mechanics','untapped',loc('trait_untapped_name'));
        untappedCalc(subSection);
        sideMenu('add',`mechanics-gameplay`,`custom`,loc('wiki_mechanics_custom'));
    }

    { // Pillars
        let custom = infoBoxBuilder(mainContent,{ name: 'pillar', template: 'hell', label: loc('wiki_mechanics_pillar'), paragraphs: 5, h_level: 2,
            para_data: {
                1: [loc(`portal_ruins_name`)],
                2: ['1%',loc(`harmonic`)],
                3: ['3%'],
                4: [loc(`harmonic`),'2%','6%'],
                5: [loc(`wiki_hell_pillar_para5d1`),12]
            },
            data_link: {
                5: ['wiki.html#hell-structures-west_tower']
            }
        });
        infoBoxBuilder(mainContent,{ name: 'pillar', template: 'mechanics', label: loc('wiki_mechanics_pillar'), paragraphs: 10, break: [4,6,8], h_level: 2,
            para_data: {
                1: [loc('tech_pillars'),loc('resource_Harmony_name'),loc('resource_Scarletite_name')],
                2: [loc('resource_Scarletite_name'),(1000000).toLocaleString(),(125000).toLocaleString()],
                3: [loc('universe_micro')],
                4: [loc('evo_challenge_genes'),loc('harmonic')],
                5: [loc('tech_scarletite'),loc('evo_challenge_genes')],
                6: [loc('achieve_resonance_name')],
                7: [loc('achieve_resonance_name'),loc('tech_scarletite')],
                8: [loc('race_junker'),loc('wiki_mechanics_custom'),loc('achieve_enlightenment_name'),loc('race_sludge')],
                9: [loc('wiki_mechanics_custom')],
                10: [loc('race_junker'),loc('genelab_genus_humanoid'),loc('race_sludge')]
            },
            data_link: {
                1: ['wiki.html#dimensional-tech-pillars'],
                3: ['wiki.html#universes-gameplay-micro'],
                5: ['wiki.html#dimensional-tech-scarletite'],
                7: [false,'wiki.html#dimensional-tech-scarletite'],
                8: ['wiki.html#races-species-junker','wiki.html#mechanics-gameplay-custom',false,'wiki.html#races-species-sludge'],
                9: ['wiki.html#mechanics-gameplay-custom'],
                10: ['wiki.html#races-species-junker',false,'wiki.html#races-species-sludge']
            }
        },custom);
        sideMenu('add',`mechanics-gameplay`,`pillar`,loc('wiki_mechanics_pillar'));
    }

    { // Demon Lord Strength
        let dlord = infoBoxBuilder(mainContent,{ name: 'dlord', template: 'mechanics', label: loc('wiki_mechanics_dlord'), paragraphs: 5, h_level: 2,
            para_data: {
                1: [loc('portal_waygate_title')],
                2: [loc('resource_Demonic_Essence_name'),loc('wiki_resets_infusion')],
                3: [loc('wiki_resets_infusion'),'+1'],
                4: ['+25%',loc('wiki_resets_infusion')],
                5: [loc('tech_dark_bomb'),loc('wiki_resets_infusion')]
            },
            data_link: {
                1: ['wiki.html#hell-structures-waygate'],
                2: [false,'wiki.html#resets-prestige-infusion'],
                3: ['wiki.html#resets-prestige-infusion'],
                4: [false,'wiki.html#resets-prestige-infusion'],
                5: ['wiki.html#dimensional-tech-dark_bomb','wiki.html#resets-prestige-infusion']
            }
        });
        dlord.append(`
            <h2 class="has-text-warning">${loc('wiki_mechanics_dlord_str')}</h2>
        `);
        Object.keys(universe_types).forEach(function (uni){
            let empowered = global.stats.spire[universeAffix(uni)] && global.stats.spire[universeAffix(uni)]['dlstr'] ? loc('wiki_mechanics_dlord_str_empowered',[global.stats.spire[universeAffix(uni)]['dlstr']]) : loc('wiki_mechanics_dlord_str_not_empowered');
            dlord.append(`
                <div class="para">
                    <span>${loc('universe_' + uni)}: ${empowered}</span>
                </div>
            `);
        });
        sideMenu('add',`mechanics-gameplay`,`dlord`,loc('wiki_mechanics_dlord'));
    }

    { // Seeded Randomness
        let seed = infoBoxBuilder(mainContent,{ name: 'seed', template: 'mechanics', label: loc('wiki_mechanics_seed'), paragraphs: 14, break: [3,5,6,7,8,9,10,11,12,13,14], h_level: 2,
            para_data: {
                4: [loc('wiki_faq_q_soft_reset')],
                7: [loc('evo_sentience_title')],
                8: [loc('wiki_menu_combat'),loc('trait_revive_name'),loc('trait_infectious_name')],
                9: [loc('civics_spy_influence'),loc('civics_spy_sabotage'),loc('civics_spy_incite')],
                10: [loc('wiki_menu_major'),loc('wiki_menu_minor')],
                11: [loc('arpa_gene_mutation'),loc('tech_fanaticism'),loc('tech_deify'),loc('tab_arpa_crispr'),loc('wiki_arpa_crispr_evolve')],
                12: [loc('governor')],
                13: [loc('wiki_menu_planets'),loc('wiki_resets_bioseed'),loc('wiki_resets_blackhole'),loc('wiki_resets_vacuum')],
                14: [loc('portal_spire_name')]
            },
            data_link: {
                7: ['wiki.html#prehistoric-structures-sentience'],
                8: ['wiki.html#combat-gameplay','wiki.html#traits-species-major_revive','wiki.html#traits-species-major_infectious'],
                10: ['wiki.html#major-events','wiki.html#minor-events'],
                11: [false,(global.genes['transcendence'] ? 'wiki.html#civilized-tech-alt_fanaticism' : 'wiki.html#civilized-tech-fanaticism'),'wiki.html#early_space-tech-deify',false,'wiki.html#crispr-prestige-recombination'],
                12: ['wiki.html#governor-gameplay'],
                13: ['wiki.html#planets-gameplay','wiki.html#resets-prestige-bioseed','wiki.html#resets-prestige-blackhole','wiki.html#resets-prestige-vacuum'],
                14: ['wiki.html#hell-gameplay-spire']
            }
        });
        sideMenu('add',`mechanics-gameplay`,`seed`,loc('wiki_mechanics_seed'));
    }

    { // Cheese Level
        let cheeselevel = swissKnife(true);
        let cheeseList = swissKnife(false,true);
        let resets = global.stats.hasOwnProperty('reset') ? global.stats.reset : 0;
        let looped = Math.floor(resets / cheeseList.length);
        if (looped > 0){
            switch (looped){
                case 1:
                    cheeselevel = `${cheeselevel} ${loc('wiki_mechanics_cheese_squared')}`;
                    break;
                case 2:
                    cheeselevel = `${cheeselevel} ${loc('wiki_mechanics_cheese_cubed')}`;
                    break;
                case 3:
                    cheeselevel = `${cheeselevel} ${loc('wiki_mechanics_cheese_tesseracted')}`;
                    break;
                case 4:
                    cheeselevel = `${cheeselevel} ${loc('wiki_mechanics_cheese_penteracted')}`;
                    break;
                case 5:
                    cheeselevel = `${cheeselevel} ${loc('wiki_mechanics_cheese_hexeracted')}`;
                    break;
                case 6:
                    cheeselevel = `${cheeselevel} ${loc('wiki_mechanics_cheese_hepteracted')}`;
                    break;
                case 7:
                    cheeselevel = `${cheeselevel} ${loc('wiki_mechanics_cheese_octeracted')}`;
                    break;
                case 8:
                    cheeselevel = `${cheeselevel} ${loc('wiki_mechanics_cheese_enneracted')}`;
                    break;
                case 9:
                    cheeselevel = `${cheeselevel} ${loc('wiki_mechanics_cheese_dekeracted')}`;
                    break;
                default:
                    cheeselevel = `${cheeselevel}^${looped+1}`;
                    break;
            }
        }
        let cheeses = [];
        for (let i=0; i<cheeseList.length; i++){
            cheeses.push(`<span class="has-text-warning">${loc(`cheese_${cheeseList[i]}`)}</span> (<span class="has-text-caution">${i+1}</span>)`);
        }
        infoBoxBuilder(mainContent,{ name: 'cheese', template: 'mechanics', label: loc('wiki_mechanics_cheese'), paragraphs: 5, break: [4,5], h_level: 2,
            para_data: {
                1: [loc('tech_swiss_bank',[loc('cheese_swiss')])],
                2: [cheeseList.length,loc('cheese_swiss')],
                3: [loc('wiki_mechanics_cheese')],
                4: [loc('wiki_mechanics_cheese'), cheeselevel, resets+1],
                5: [cheeses.join(', ')]
            },
            data_color: {
                4: ['warning','danger','caution'],
                5: [false],
            }
        });
        sideMenu('add',`mechanics-gameplay`,`cheese`,loc('wiki_mechanics_cheese'));
    }
}

function jobStressCalc(info){
    let calc = $(`<div class="calc" id="jobStressCalc"></div>`);
    info.append(calc);
    
    let jobSelect = $(`<div></div>`);
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(jobSelect);
    calc.append(formula);
    calc.append(variables);
    
    let inputs = {
        job: { val: undefined },
        content: { vis: false, val: undefined },
        freespirit: { vis: false, val: undefined },
        mellow: { val: false },
        dense: { vis: false, val: false, formVis: false },
        workers: { val: undefined },
        playful: { vis: false, val: false },
        high_pop: { val: undefined },
        emotionless: { val: undefined },
        government: { val: undefined },
        annexed: { vis: false, val: undefined },
        electricity: { vis: false, val: false },
        virtual_reality: { val: false }
    }
    
    let show = {
        result: { vis: false, val: undefined },
        total: { vis: false, val: 0 }
    }
    
    let jobs = ['soldier'];
    Object.keys(job_desc).forEach(function (job){
        if (job !== 'unemployed' && job !== 'forager'){
            jobs.push(job);
        }
    });
    let jobsDropdown = `
        <div class="calcInput"><span>${loc('wiki_calc_job_stress_job')}</span> <b-dropdown hoverable scrollable>
            <button class="button is-primary" slot="trigger">
                <span>{{ i.job.val | jobLabel }}</span>
                <i class="fas fa-sort-down"></i>
            </button>`;
    jobs.forEach(function (job){
        jobsDropdown += `
            <b-dropdown-item v-on:click="pickJob('${job}')">{{ '${job}' | jobLabel }}</b-dropdown-item>`;
    });
    jobsDropdown += `
        </b-dropdown></div>
    `;
    jobSelect.append(jobsDropdown);
    
    formula.append(`
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_job_stress_divisor')}</h2>
        </div>
        <div>
            <span v-show="i.freespirit.vis && i.freespirit.val">(</span><span>{{ i.job.val | stressDiv }}</span><span v-show="i.content.vis"> + ({{ i.content.val, 'content' | generic }} * {{ i.job.val | contentVal }})</span><span v-show="i.mellow.val"> {{ i.job.val | mellowOp }}</span><span v-show="i.dense.vis && i.dense.val"> - 1</span><span v-show="i.freespirit.vis && i.freespirit.val">) / {{ i.freespirit.val, 'freespirit', 0 | traitVal }}</span><span v-show="s.result.vis"> = {{ | calc }}</span>
        </div>
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_job_stress_generated')}</h2>
        </div>
        <div>
            <span v-show="i.playful.vis && i.playful.val">0 * </span><span>{{ i.workers.val, 'workers' | generic }}<span v-show="i.high_pop.val"> / {{ i.high_pop.val, 'high_pop', 0 | traitVal }}</span> / {{ s.result.val, 'divisor' | generic }}<span v-show="i.emotionless.val"> * {{ i.emotionless.val, 'emotionless', 1 | traitVal }}</span><span> * {{ i.government.val, i.electricity.val, i.virtual_reality.val | govVal }}</span><span v-show="i.annexed.vis"> * {{ i.annexed.val | anxVal }}</span><span v-show="s.total.vis"> = -{{ | calcTotal }}%</span>
        </div>
    `);
    
    variables.append(`
        <div>
            <div class="calcInput" v-show="i.content.vis"><span>${loc('wiki_calc_job_stress_content')}</span> <b-numberinput :input="val('content')" min="0" v-model="i.content.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><b-checkbox class="patrol" v-model="i.mellow.val">${loc('planet_mellow')}</b-checkbox></div>
            <div class="calcInput" v-show="i.dense.vis"><b-checkbox class="patrol" v-model="i.dense.val">${loc('planet_dense')}</b-checkbox></div>
            <div class="calcInput" v-show="i.freespirit.vis"><span>${loc('trait_freespirit_name')}</span> <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ i.freespirit.val | traitLabel }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="pickTrait(0, 'freespirit')">{{ 0 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(0.25, 'freespirit')">{{ 0.25 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(0.5, 'freespirit')">{{ 0.5 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(1, 'freespirit')">{{ 1 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(2, 'freespirit')">{{ 2 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(3, 'freespirit')">{{ 3 | traitLabel }}</b-dropdown-item>
            </b-dropdown></div>
        </div>
        <div>
            <div class="calcInput"><span>{{ i.job.val | workersLabel }}</span> <b-numberinput :input="val('workers')" min="0" v-model="i.workers.val" :controls="false"></b-numberinput></div>
            <div class="calcInput" v-show="i.annexed.vis"><span>${loc('wiki_calc_job_stress_annexed')}</span> <b-numberinput :input="val('annexed')" min="0" v-model="i.annexed.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc('civics_government')}</span> <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ i.government.val | govLabel }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="pickGov('anarchy')">{{ 'anarchy' | govLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickGov('autocracy')">{{ 'autocracy' | govLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickGov('federation')">{{ 'federation' | govLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickGov('socialist')">{{ 'socialist' | govLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickGov('other')">{{ 'other' | govLabel }}</b-dropdown-item>
            </b-dropdown></div>
            <div class="calcInput" v-show="i.electricity.vis"><b-checkbox class="patrol" v-model="i.electricity.val">${loc('tech_electricity')}</b-checkbox></div>
            <div class="calcInput" v-show="i.electricity.vis && i.electricity.val"><b-checkbox class="patrol" v-model="i.virtual_reality.val">${loc('tech_virtual_reality')}</b-checkbox></div>
            <div class="calcInput" v-show="i.playful.vis"><b-checkbox class="patrol" v-model="i.playful.val">${loc('trait_playful_name')}</b-checkbox></div>
            <div class="calcInput"><span>${loc('trait_high_pop_name')}</span> <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ i.high_pop.val | traitLabel }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="pickTrait(0, 'high_pop')">{{ 0 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(0.25, 'high_pop')">{{ 0.25 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(0.5, 'high_pop')">{{ 0.5 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(1, 'high_pop')">{{ 1 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(2, 'high_pop')">{{ 2 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(3, 'high_pop')">{{ 3 | traitLabel }}</b-dropdown-item>
            </b-dropdown></div>
            <div class="calcInput"><span>${loc('trait_emotionless_name')}</span> <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ i.emotionless.val | traitLabel }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="pickTrait(0, 'emotionless')">{{ 0 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(0.25, 'emotionless')">{{ 0.25 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(0.5, 'emotionless')">{{ 0.5 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(1, 'emotionless')">{{ 1 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(2, 'emotionless')">{{ 2 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(3, 'emotionless')">{{ 3 | traitLabel }}</b-dropdown-item>
            </b-dropdown></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button>
            <button class="button" @click="importInputs()">${loc('wiki_calc_import')}</button>
        </div>
    `);
    
    vBind({
        el: `#jobStressCalc`,
        data: {
            i: inputs,
            s: show
        },
        methods: {
            val(type){
                if (inputs[type].val && inputs[type].val < 0){
                    inputs[type].val = 0;
                }
                if (type === 'annexed' && inputs[type].val > 3){
                    inputs[type].val = 3;
                }
            },
            pickJob(job){
                inputs.job.val = job;
                inputs.content.vis = job !== 'hunter' && job !== 'soldier';
                inputs.freespirit.vis = !['hunter','soldier','farmer','lumberjack','quarry_worker','crystal_miner','scavenger'].includes(job);
                inputs.dense.vis = job === 'miner';
                inputs.playful.vis = job === 'hunter';
            },
            pickGov(gov){
                inputs.government.val = gov;
                inputs.annexed.vis = gov !== 'federation';
                inputs.electricity.vis = gov === 'autocracy';
            },
            pickTrait(rank, trait){
                inputs[trait].val = rank;
            },
            resetInputs(){
                inputs.job.val = undefined;
                inputs.content.val = undefined;
                inputs.content.vis = false;
                inputs.freespirit.val = undefined;
                inputs.freespirit.vis = false;
                inputs.mellow.val = false;
                inputs.dense.val = false;
                inputs.dense.vis = false;
                inputs.workers.val = undefined;
                inputs.playful.val = false;
                inputs.playful.vis = false;
                inputs.government.val = undefined;
                inputs.annexed.val = undefined;
                inputs.annexed.vis = false;
                inputs.electricity.val = false;
                inputs.electricity.vis = false;
                inputs.virtual_reality.val = false;
                inputs.high_pop.val = undefined;
                inputs.emotionless.val = undefined;
                show.result.val = undefined;
            },
            importInputs(){
                inputs.content.val = global.race['content'] ? global.race.content : 0;
                inputs.freespirit.val = global.race['freespirit'] ? global.race['freespirit'] : 0;
                inputs.mellow.val = global.city['ptrait'] && global.city.ptrait.includes('mellow') ? true : false;
                inputs.dense.val = global.city['ptrait'] && global.city.ptrait.includes('dense') ? true : false;
                inputs.workers.val = inputs.job.val === 'soldier' ? (global.civic['garrison'] && global.civic.garrison['max'] ? global.civic.garrison.max : 0) : global.civic[inputs.job.val] ? global.civic[inputs.job.val].workers : 0;
                inputs.playful.val = global.race['playful'] ? true : false;
                inputs.high_pop.val = global.race['high_pop'] ? global.race['high_pop'] : 0;
                inputs.emotionless.val = global.race['emotionless'] ? global.race['emotionless'] : 0;
                if (global.civic['govern']){
                    let gov = global.civic.govern.type;
                    switch (gov){ 
                        case 'autocracy':
                        case 'anarchy':
                        case 'socialist':
                        case 'federation':
                            inputs.government.val = gov;
                            break;
                        default:
                            inputs.government.val = 'other';
                            break;
                    }
                    inputs.annexed.vis = gov !== 'federation';
                    inputs.electricity.vis = gov === 'autocracy';
                }
                inputs.annexed.val = 0;
                if (global.civic['foreign']){
                    for (let i=0; i<3; i++){
                        if (global.civic.foreign['gov'+i].anx){
                            inputs.annexed.val++;
                        }
                    }
                }
                inputs.electricity.val = global.tech['high_tech'] ? global.tech['high_tech'] >= 2 : false;
                inputs.virtual_reality.val = global.tech['high_tech'] ? global.tech['high_tech'] >= 12 : false;
            }
        },
        filters: {
            generic(num, type){
                if (type === 'workers' && inputs.job.val === 'soldier'){
                    type = 'soldiers';
                }
                return num !== undefined ? num : loc('wiki_calc_job_stress_' + type);
            },
            jobLabel(job){
                if (!job){
                    return loc('wiki_calc_job_stress_job');
                }
                if (job === 'soldier'){
                    return loc('governor_soldier');
                }
                else if (job === 'titan_colonist'){
                    return loc('job_colonist_tp',[getSolarName('titan')]);
                }
                return loc('job_'+job);
            },
            workersLabel(job){
                if (job === 'soldier'){
                    return loc('wiki_calc_job_stress_soldiers');
                }
                else {
                    return loc('wiki_calc_job_stress_workers');
                }
            },
            govLabel(gov){
                if (!gov){
                    return loc('civics_government');
                }
                if (gov === 'other'){
                    return loc('wiki_calc_job_stress_government_other');
                }
                return loc('govern_'+gov);
            },
            traitLabel(rank){
                return rank === undefined ? loc('wiki_calc_trait_undefined') : rank === 0 ? loc('wiki_calc_trait_unowned') : rank;
            },
            stressDiv(job){
                if (!job){
                    return loc('base');
                }
                switch(job){
                    case 'hunter':
                        return 5;
                    case 'soldier':
                        return 2;
                    default:
                        return global.civic[job].stress;
                }
            },
            contentVal(job){
                if (!job){
                    return loc('wiki_calc_job_stress_content_multi');
                }
                if (job === 'hell_surveyor'){
                    return 0.2;
                }
                return 0.4;
            },
            mellowOp(job){
                switch (job){
                    case 'hunter':
                    case 'soldier':
                        return `* ${planetTraits.mellow.vars()[0]}`;
                    default:
                        return `+ ${planetTraits.mellow.vars()[1]}`;
                }
            },
            govVal(gov, elec, vr){
                if (!gov){
                    return loc('wiki_calc_job_stress_government');
                }
                switch (gov){
                    case 'anarchy':
                        return 0.5;
                    case 'autocracy':
                        return elec ? vr ? 1.1 : 1.18 : 1.25;
                    case 'socialist':
                        return 1.1;
                    default:
                        return 1;
                }
            },
            anxVal(num){
                return num !== undefined ? +(1.1 ** num).toFixed(5) : loc('civics_spy_purchase_bd');
            },
            traitVal(rank, trait, varNum){
                switch (trait){
                    case 'freespirit':
                        return 1 + (traits.freespirit.vars(rank)[varNum] / 100);
                    case 'high_pop':
                        return traits.high_pop.vars(rank)[varNum];
                    case 'emotionless':
                        return 1 - (traits.emotionless.vars(rank)[varNum] / 100);
                }
            },
            calc(){
                let vis = inputs.job.val !== undefined && inputs.freespirit.val !== undefined;
                if (inputs.job.val !== 'hunter' && inputs.job.val !== 'soldier'){
                    vis = vis && inputs.content.val !== undefined;
                }
                show.result.vis = vis;
                
                if (show.result.vis){
                    let div = inputs.job.val === 'hunter' ? 5 : inputs.job.val === 'soldier' ? 2 : global.civic[inputs.job.val].stress;
                    if (inputs.job.val === 'hunter' || inputs.job.val === 'soldier'){
                        if (inputs.mellow.val){
                            div *= planetTraits.mellow.vars()[0];
                        }
                    }
                    else {
                        if (inputs.mellow.val){
                            div += planetTraits.mellow.vars()[1];
                        }
                        div += (inputs.job.val === 'hell_surveyor' ? 0.2 : 0.4) * inputs.content.val;
                        if (inputs.dense.val && inputs.job.val === 'miner'){
                            div -= planetTraits.dense.vars()[1];
                        }
                        if (inputs.freespirit.val && !['farmer','lumberjack','quarry_worker','crystal_miner','scavenger'].includes(inputs.job.val)){
                            div /= 1 + (traits.freespirit.vars(inputs.freespirit.val)[0] / 100);
                        }
                    }
                    show.result.val = +(div).toFixed(4);
                    return show.result.val;
                }
                else {
                    show.result.val = undefined;
                }
            },
            calcTotal(){
                let vis = inputs.playful.val && inputs.job.val === 'hunter';
                if (vis){
                    show.total.vis = vis;
                    show.total.val = 0;
                }
                else {
                    vis = show.result.vis && inputs.government.val && inputs.workers.val !== undefined && inputs.high_pop.val !== undefined && inputs.emotionless.val !== undefined;
                    if (inputs.government.val !== 'federation'){
                        vis = vis && inputs.annexed.val !== undefined;
                    }
                    show.total.vis = vis;
                    if (show.total.vis){
                        let total = inputs.workers.val / show.result.val;
                        if (inputs.government.val !== 'federation'){
                            total *= 1.1**inputs.annexed.val;
                            switch (inputs.government.val){
                                case 'anarchy':
                                    total /= 2;
                                    break;
                                case 'autocracy':
                                    total *= inputs.electricity.val ? inputs.virtual_reality.val ? 1.1 : 1.18 : 1.25;
                                    break;
                                case 'socialist':
                                    total *= 1.1;
                                    break;
                            }
                        }
                        if (inputs.high_pop.val){
                            total /= traits.high_pop.vars(inputs.high_pop.val)[0];
                        }
                        if (inputs.emotionless.val){
                            total *= 1 - (traits.emotionless.vars(inputs.emotionless.val)[1] / 100);
                        }
                        show.total.val = +(total).toFixed(3);
                    }
                }
                return show.total.val;
            }
        }
    });
}

function warmongerCalc(info){
    let calc = $(`<div class="calc" id="warmongerCalc"></div>`);
    info.append(calc);
    
    calc.append(`<h2 class="has-text-caution">${loc('wiki_mechanics_warmonger')}</h2>`);
    
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(formula);
    calc.append(variables);
    
    let inputs = {
        fatigue: { val: undefined },
        protest: { val: undefined }
    }
    
    let show = {
        result: { vis: false, val: 0 }
    }
    
    formula.append(`
        <div>
            <span>log2({{ i.fatigue.val, 'fatigue' | generic }} + {{ i.protest.val, 'protest' | generic }})</span><span v-show="s.result.vis"> = {{ false | calc }} = {{ true | calc }}% ${loc('wiki_mechanics_warmonger')}</span>
        </div>
    `);
    
    variables.append(`
        <div>
            <div class="calcInput"><span>${loc('wiki_calc_warmonger_fatigue')}</span> <b-numberinput :input="val('fatigue')" min="0" v-model="i.fatigue.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc('wiki_calc_warmonger_protest')}</span> <b-numberinput :input="val('protest')" min="0" v-model="i.protest.val" :controls="false"></b-numberinput></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button>
            <button class="button" @click="importInputs()">${loc('wiki_calc_import')}</button>
        </div>
    `);
    
    vBind({
        el: `#warmongerCalc`,
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
                inputs.fatigue.val = undefined;
                inputs.protest.val = undefined;
            },
            importInputs(){
                inputs.fatigue.val = global.civic['garrison'] && global.civic.garrison['fatigue'] ? global.civic.garrison.fatigue : 0;
                inputs.protest.val = global.civic['garrison'] && global.civic.garrison['protest'] ? global.civic.garrison.protest : 0;
            }
        },
        filters: {
            generic(num, type){
                return num !== undefined ? num : loc('wiki_calc_warmonger_' + type);
            },
            calc(round){
                if (round){
                    return Math.round(show.result.val);
                }
                show.result.vis = inputs.fatigue.val !== undefined && inputs.protest.val !== undefined && inputs.fatigue.val + inputs.protest.val >= 1;
                
                if (show.result.vis){
                    show.result.val = Math.log2(inputs.fatigue.val + inputs.protest.val);
                    
                    return show.result.val;
                }
            }
        }
    });
}

function spyCostCalc(info){
    let calc = $(`<div class="calc" id="spyCostCalc"></div>`);
    info.append(calc);
    
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(formula);
    calc.append(variables);
    
    let inputs = {
        military: { val: undefined },
        relations: { val: undefined },
        unrest: { val: undefined },
        spies: { val: undefined },
        infiltrator: { val: false }
    }
    
    let show = {
        base: { vis: false, val: undefined },
        total: { vis: false, val: undefined }
    }
    
    formula.append(`
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_spy_cost_base_title')}</h2>
        </div>
        <div>
            <span>({{ i.military.val, 'mil_rate' | generic }} / 2) + ((100 - {{ i.relations.val, 'relations' | generic }}) / 2) - {{ i.unrest.val, 'unrest' | generic }} + 10</span><span v-show="s.base.vis"> = {{ | calcBase }}</span>
        </div>
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_spy_cost_total')}</h2>
        </div>
        <div>
            <span v-show="i.infiltrator.val">(</span><span>{{ s.base.val, 'unrest' | generic }}</span><span v-show="i.infiltrator.val"> / 3)</span>^({{ i.spies.val, 'spies' | generic }} + 1) + 500<span v-show="s.total.vis"> = {{ | calcTotal }}</span>
        </div>
    `);
    
    variables.append(`
        <div>
            <div class="calcInput"><span>${loc('civics_gov_mil_rate')}</span> <b-numberinput :input="val('military')" min="50" v-model="i.military.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc('civics_gov_relations')}</span> <b-numberinput :input="val('relations')" min="0" max ="100" v-model="i.relations.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc('civics_gov_unrest')}</span> <b-numberinput :input="val('unrest')" min="0" max ="100" v-model="i.unrest.val" :controls="false"></b-numberinput></div>
        </div>
        <div>
            <div class="calcInput"><span>${loc('wiki_calc_spy_cost_spies')}</span> <b-numberinput :input="val('spies')" min="0" v-model="i.spies.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><b-checkbox class="patrol" v-model="i.infiltrator.val">${loc('trait_infiltrator_name')}</b-checkbox></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button>
        </div>
    `);
    
    vBind({
        el: `#spyCostCalc`,
        data: {
            i: inputs,
            s: show
        },
        methods: {
            val(type){
                if (inputs[type].val && inputs[type].val < 0){
                    inputs[type].val = 0;
                }
                if (type !== 'military' && type !== 'spies' && inputs[type].val > 100){
                    inputs[type].val = 100;
                }
                else if (type === 'military' && inputs[type].val < 50){
                    inputs[type].val = 50;
                }
            },
            resetInputs(){
                inputs.military.val = undefined;
                inputs.relations.val = undefined;
                inputs.unrest.val = undefined;
                inputs.spies.val = undefined;
                inputs.infiltrator.val = false;
                show.base.val = undefined;
            }
        },
        filters: {
            generic(num, type){
                if (num !== undefined){
                    return num;
                }
                switch (type){
                    case 'spies':
                    case 'base':
                        return loc('wiki_calc_spy_cost_' + type);
                    default:
                        return loc('civics_gov_' + type);
                }
            },
            calcBase(){
                show.base.vis = inputs.military.val !== undefined && inputs.relations.val !== undefined && inputs.unrest.val !== undefined;
                
                if (show.base.vis){
                    let base = (((inputs.military.val / 2) + ((100 - inputs.relations.val) / 2) - inputs.unrest.val) + 10);
                    if (base < 50){
                        base = 50;
                    }
                    show.base.val = +(base).toFixed(4);
                    
                    return show.base.val;
                }
            },
            calcTotal(){
                show.total.vis = show.base.val !== undefined && inputs.spies.val !== undefined;
                
                if (show.total.vis){
                    let base = show.base.val;
                    if (inputs.infiltrator.val){
                        base /= 3;
                    }
                    show.total.val = +((base ** (inputs.spies.val + 1)) + 500).toFixed(2);
                    
                    return show.total.val;
                }
            }
        }
    });
}

function occupationCalc(info){
    let calc = $(`<div class="calc" id="occupationCalc"></div>`);
    info.append(calc);
    
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(formula);
    calc.append(variables);
    
    let inputs = {
        relations: { val: undefined },
        economic: { val: undefined },
        unrest: { val: undefined }
    }
    
    let show = {
        annex: { vis: false, val: undefined },
        purchase: { vis: false, val: undefined }
    }
    
    formula.append(`
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_occupation_annex')}</h2>
        </div>
        <div>
            <span>300 - {{ i.relations.val, 'relations' | generic }} - {{ i.unrest.val, 'unrest' | generic }}</span><span v-show="s.annex.vis"> = {{ | calcAnnex }}%</span>
        </div>
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_occupation_purchase')}</h2>
        </div>
        <div>
            <span>({{ i.economic.val, 'eco_rate' | generic }} * 15384) * (1 + (0.016 * (100 - {{ i.relations.val, 'relations' | generic }}))) * (1 - (0.0025 * {{ i.unrest.val, 'unrest' | generic }}))</span><span v-show="s.purchase.vis"> = {{ | calcPurchase }}</span>
        </div>
    `);
    
    variables.append(`
        <div>
            <div class="calcInput"><span>${loc('civics_gov_relations')}</span> <b-numberinput :input="val('relations')" min="0" max ="100" v-model="i.relations.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc('civics_gov_eco_rate')}</span> <b-numberinput :input="val('economic')" min="0" v-model="i.economic.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc('civics_gov_unrest')}</span> <b-numberinput :input="val('unrest')" min="0" max ="100" v-model="i.unrest.val" :controls="false"></b-numberinput></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button>
        </div>
    `);
    
    vBind({
        el: `#occupationCalc`,
        data: {
            i: inputs,
            s: show
        },
        methods: {
            val(type){
                if (inputs[type].val && inputs[type].val < 0){
                    inputs[type].val = 0;
                }
                if (type !== 'economic' && inputs[type].val > 100){
                    inputs[type].val = 100;
                }
            },
            resetInputs(){
                inputs.relations.val = undefined;
                inputs.economic.val = undefined;
                inputs.unrest.val = undefined;
            }
        },
        filters: {
            generic(num, type){
                return num !== undefined ? num : loc('civics_gov_' + type);
            },
            calcAnnex(){
                show.annex.vis = inputs.relations.val !== undefined && inputs.unrest.val !== undefined;
                
                if (show.annex.vis){
                    show.annex.val = 300 - inputs.relations.val - inputs.unrest.val;
                    
                    return show.annex.val;
                }
            },
            calcPurchase(){
                show.purchase.vis = inputs.relations.val !== undefined && inputs.economic.val !== undefined && inputs.unrest.val !== undefined;
                
                if (show.purchase.vis){
                    show.purchase.val = +((inputs.economic.val * 15384) * (1 + (0.016 * (100 - inputs.relations.val))) * (1 - (0.0025 * inputs.unrest.val))).toFixed(0);
                    
                    return show.purchase.val;
                }
            }
        }
    });
}

function genomeDecayCalc(info){
    let calc = $(`<div class="calc" id="genomeDecayCalc"></div>`);
    info.append(calc);
    
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(formula);
    calc.append(variables);
    
    let inputs = {
        mutations: { val: undefined },
        days: { val: undefined }
    }
    
    let show = {
        game: { vis: false, val: undefined },
        real: { vis: false, val: undefined }
    }
    
    formula.append(`
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_g_decay_game')}</h2>
        </div>
        <div>
            <span>(50000000 / (1 + {{ i.mutations.val, 'mutations' | generic }})) - {{ i.days.val, 'days' | generic }}</span><span v-show="s.game.vis"> = {{ false | calc }}</span>
        </div>
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_g_decay_real')}</h2>
        </div>
        <div>
            <span>{{ s.game.val, 'game' | generic }} / 17280</span><span v-show="s.real.vis"> = {{ true | calc }}</span>
        </div>
    `);
    
    variables.append(`
        <div>
            <div class="calcInput"><span>${loc('wiki_calc_g_decay_mutations')}</span> <b-numberinput :input="val('mutations')" min="0" v-model="i.mutations.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc('wiki_calc_g_decay_days')}</span> <b-numberinput :input="val('days')" min="0" v-model="i.days.val" :controls="false"></b-numberinput></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button>
            <button class="button" @click="importInputs()">${loc('wiki_calc_import')}</button>
        </div>
    `);
    
    vBind({
        el: `#genomeDecayCalc`,
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
                inputs.mutations.val = undefined;
                inputs.days.val = undefined;
            },
            importInputs(){
                inputs.mutations.val = global.race.mutation;
                inputs.days.val = global.stats.days;
            }
        },
        filters: {
            generic(num, type){
                return num !== undefined ? num : loc('wiki_calc_g_decay_' + type);
            },
            calc(real){
                if (real){
                    return show.real.val;
                }
                show.game.vis = inputs.mutations.val !== undefined && inputs.days.val !== undefined;
                show.real.vis = show.game.vis;
                
                if (show.game.vis){
                    show.game.val = +((50000000 / (1 + inputs.mutations.val)) - inputs.days.val).toFixed(0);
                    show.real.val = +(show.game.val / 17280).toFixed(6);
                    
                    return show.game.val;
                }
                else {
                    show.game.val = undefined;
                    show.real.val = undefined;
                }
            }
        }
    });
}

function quantumLevelCalc(info){
    let calc = $(`<div class="calc" id="quantumLevelCalc"></div>`);
    info.append(calc);
    
    calc.append(`<h2 class="has-text-caution">${loc('wiki_mechanics_quantum')}</h2>`);
    
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(formula);
    calc.append(variables);
    
    let inputs = {
        knowledge: { val: undefined },
        citadels: { val: undefined },
        cores: { val: undefined },
        supercore: { val: false },
        linked: { val: undefined },
        citizens: { val: undefined },
        
    }
    
    let show = {
        linked: { val: undefined },
        result: { vis: false, val: 0 }
    }
    
    formula.append(`
        <div>
            <span>(ln(1 + ((1.1 - 1) * {{ i.knowledge.val, 'knowledge' | generic }} / 250000)) / ln(1.1)) * (1 + (0.05 * {{ i.citadels.val, 'citadels' | generic }})) * (2 - (0.99^{{ i.cores.val, 'cores' | generic }}))</span><span v-show="i.supercore.val"> * 1.25</span><span v-show="i.linked.val"> * {{ s.linked.val, 'linked' | generic }}</span><span v-show="s.result.vis"> = {{ | calc }}</span>
        </div>
    `);
    
    variables.append(`
        <div>
            <div class="calcInput"><span>${loc('wiki_calc_q_level_knowledge')}</span> <b-numberinput :input="val('knowledge')" min="0" v-model="i.knowledge.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc('wiki_calc_q_level_citadels')}</span> <b-numberinput :input="val('citadels')" min="0" v-model="i.citadels.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc('wiki_calc_cores')}</span> <b-numberinput :input="val('cores')" min="0" v-model="i.cores.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><b-checkbox class="patrol" v-model="i.supercore.val">${loc('wiki_calc_q_level_supercore')}</b-checkbox></div>
            <div class="calcInput"><span>${loc('trait_linked_name')}</span> <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ i.linked.val | traitLabel }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="pickTrait(0, 'linked')">{{ 0 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(0.25, 'linked')">{{ 0.25 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(0.5, 'linked')">{{ 0.5 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(1, 'linked')">{{ 1 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(2, 'linked')">{{ 2 | traitLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickTrait(3, 'linked')">{{ 3 | traitLabel }}</b-dropdown-item>
            </b-dropdown></div>
            <div class="calcInput" v-show="i.linked.val"><span>${loc('wiki_calc_citizens')}</span> <b-numberinput :input="val('citizens')" min="0" v-model="i.citizens.val" :controls="false"></b-numberinput></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button>
            <button class="button" @click="importInputs()">${loc('wiki_calc_import')}</button>
        </div>
    `);
    
    vBind({
        el: `#quantumLevelCalc`,
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
            pickTrait(rank, trait){
                inputs[trait].val = rank;
            },
            resetInputs(){
                inputs.knowledge.val = undefined;
                inputs.citadels.val = undefined;
                inputs.cores.val = undefined;
                inputs.supercore.val = false;
                inputs.linked.val = undefined;
                inputs.citizens.val = undefined;
            },
            importInputs(){
                inputs.knowledge.val = global.resource.Knowledge.max;
                inputs.citadels.val = global.interstellar['citadel'] ? global.interstellar.citadel.on : 0;
                inputs.cores.val = global.race.AICore.count;
                inputs.supercore.val = global.space['ai_core2'] && global.space.ai_core2.on ? true : false;
                inputs.linked.val = global.race['linked'] ? global.race['linked'] : 0;
                inputs.citizens.val = global.resource[global.race.species].amount;
            }
        },
        filters: {
            generic(num, type){
                if (num !== undefined){
                    return num;
                }
                switch (type){
                    case 'cores':
                        return loc('wiki_calc_' + type);
                    default:
                        return loc('wiki_calc_q_level_' + type);
                }
            },
            traitLabel(rank){
                return rank === undefined ? loc('wiki_calc_trait_undefined') : rank === 0 ? loc('wiki_calc_trait_unowned') : rank;
            },
            calc(){
                let linkedComp = true;
                if (inputs.linked.val > 0){
                    if (inputs.citizens.val !== undefined){
                        let factor = traits.linked.vars(inputs.linked.val)[0] / 100 * inputs.citizens.val;
                        if (factor > traits.linked.vars(inputs.linked.val)[1] / 100){
                            factor -= traits.linked.vars(inputs.linked.val)[1] / 100;
                            factor = factor / (factor + 200 - traits.linked.vars(inputs.linked.val)[1]);
                            factor += traits.linked.vars(inputs.linked.val)[1] / 100;
                        }
                        show.linked.val = +(1 + factor).toFixed(4);
                    }
                    else {
                        show.linked.val = undefined;
                        linkedComp = false;
                    }
                }
                show.result.vis = linkedComp && inputs.knowledge.val !== undefined && inputs.citadels.val !== undefined && inputs.cores.val !== undefined;
                
                if (show.result.vis){
                    let qlevel = (Math.log(1 + ((1.1 - 1) * inputs.knowledge.val / 250000)) / Math.log(1.1)) * (1 + (0.05 * inputs.citadels.val)) * (2 - (0.99 ** inputs.cores.val));
                    if (inputs.supercore.val){
                        qlevel *= 1.25;
                    }
                    if (show.linked.val){
                        qlevel *= show.linked.val;
                    }
                    
                    show.result.val = +(qlevel).toFixed(4);
                    return show.result.val;
                }
            }
        }
    });
}

function massCalc(info){
    let calc = $(`<div class="calc" id="massCalc"></div>`);
    info.append(calc);
    
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(formula);
    calc.append(variables);
    
    let resources = ['Food','Lumber','Chrysotile','Stone','Crystal','Furs','Copper','Iron','Aluminium','Cement','Coal','Oil','Uranium','Steel','Titanium','Alloy','Polymer','Iridium','Helium_3','Deuterium','Neutronium','Adamantite','Infernite','Elerium','Nano_Tube','Graphene','Stanene','Bolognium','Vitreloy','Orichalcum','Plywood','Brick','Wrought_Iron','Sheet_Metal','Mythril','Aerogel','Nanoweave','Scarletite'];
    
    let show = {
        result: {
            vis: false, kt: undefined, solar: undefined, MW: undefined,
            exoVis: false, exotic: undefined,
            MWVis: false, MWTot: undefined,
            timeVis: false, timeTot: undefined
        }
    }
    
    let inputs = {
        solar_tot: { val: undefined },
        exotic_tot: { val: undefined },
        grav: { val: true }
    }
    let resVariables = $(`<div></div>`);
    let ktFormula = $(`<div></div>`);
    
    let isFirst = true;
    variables.append(resVariables);
    resources.forEach(function(res){
        if (!isFirst){
            ktFormula.append(`<span> + </span>`);
        }
        isFirst = false;
        
        inputs[res] = { val: undefined };
        resVariables.append(`
            <div class="calcInput"><span>${loc('resource_' + res + '_name')}</span> <b-numberinput :input="val('${res}')" min="0" v-model="i.${res}.val" :controls="false"></b-numberinput></div>
        `);
        ktFormula.append(`<span>({{ i.${res}.val, '${res}' | generic }} * ${atomic_mass[res]})`);
    });
    ktFormula.append(`<span v-show="s.result.vis"> = {{ true, 'kt' | calc }}</span>`);
    
    formula.append(`
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_mass_kt')}</h2>
        </div>
    `);
    formula.append(ktFormula);
    formula.append(`
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_mass_solar')}</h2>
        </div>
        <div>
            <span>{{ s.result.kt, 'kt' | generic }} / 10000000000</span><span v-show="s.result.vis"> = {{ false, 'solar' | calc }}</span>
        </div>
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_mass_exotic')}</h2>
        </div>
        <div>
            <span>(({{ i.Infernite.val, 'Infernite' | generic }} * 222.666) + ({{ i.Elerium.val, 'Elerium' | generic }} * 297.115)) / 10000000000</span><span v-show="s.result.exoVis"> = {{ | calcExotic }}</span>
        </div>
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_mass_MW')}</h2>
        </div>
        <div>
            <span>({{ s.result.solar, 'solar' | generic }} * {{ false | amountMW }}) + ({{ s.result.exotic, 'exotic' | generic }} * {{ true | amountMW }})</span><span v-show="s.result.vis"> = {{ false, 'MW' | calc }}</span>
        </div>
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_mass_MW_tot')}</h2>
        </div>
        <div>
            <span>20 + (({{ i.solar_tot.val, 'solar_tot' | generic }} - 8) * {{ false | amountMW }}) + ({{ i.exotic_tot.val, 'exotic_tot' | generic }} * {{ true | amountMW }})</span><span v-show="s.result.MWVis"> = {{ | calcMW }}</span>
        </div>
        <div>
            <h2 class="has-text-caution">${loc('wiki_calc_mass_time_to_explode')}</h2>
        </div>
        <div>
            <span>(0.025 - {{ i.exotic_tot.val, 'exotic_tot' | generic }}) / {{ s.result.exotic, 'exotic' | generic }}</span><span v-show="s.result.timeVis"> = {{ | calcTime }}</span>
        </div>
    `);
    
    variables.append(`
        <div>
            <div class="calcInput"><span>${loc('wiki_calc_mass_solar_tot')}</span> <b-numberinput :input="val('solar_tot')" min="8" v-model="i.solar_tot.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc('wiki_calc_mass_exotic_tot')}</span> <b-numberinput :input="val('exotic_tot')" min="0" v-model="i.exotic_tot.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><b-checkbox class="patrol" v-model="i.grav.val">${loc('tech_gravity_convection')}</b-checkbox></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button>
            <button class="button" @click="importInputs()">${loc('wiki_calc_import')}</button>
        </div>
    `);
    
    vBind({
        el: `#massCalc`,
        data: {
            i: inputs,
            s: show
        },
        methods: {
            val(type){
                if (type === 'solar_tot'){
                    if (inputs[type].val && inputs[type].val < 8){
                        inputs[type].val = 8;
                    }
                }
                else {
                    if (inputs[type].val && inputs[type].val < 0){
                        inputs[type].val = 0;
                    }
                }
            },
            resetInputs(){
                resources.forEach(function(res){
                    inputs[res].val = undefined;
                });
                inputs.solar_tot.val = undefined;
                inputs.exotic_tot.val = undefined;
                inputs.grav.val = true;
            },
            importInputs(){
                if (global.interstellar['mass_ejector']){
                    resources.forEach(function(res){
                        inputs[res].val = global.interstellar.mass_ejector[res];
                    });
                }
                else {
                    resources.forEach(function(res){
                        inputs[res].val = 0;
                    });
                }
                inputs.solar_tot.val = global.interstellar['stellar_engine'] ? global.interstellar.stellar_engine.mass : 8;
                if (global.tech['roid_eject']){
                    inputs.solar_tot.val += 0.225 * global.tech['roid_eject'] * (1 + (global.tech['roid_eject'] / 12));
                }
                inputs.exotic_tot.val = global.interstellar['stellar_engine'] ? global.interstellar.stellar_engine.exotic : 0;
                inputs.grav.val = global.tech['gravity'] && global.tech.gravity >= 2;
            }
        },
        filters: {
            generic(num, type){
                if (num !== undefined){
                    return num;
                }
                switch (type){
                    case 'kt':
                    case 'solar':
                    case 'solar_tot':
                    case 'exotic':
                    case 'exotic_tot':
                    case 'MW':
                        return loc('wiki_calc_mass_' + type);
                    default:
                        return loc('resource_' + type + '_name') + '/s';
                }
            },
            amountMW(exotic){
                return (inputs.grav.val ? 13.5 : 7.5) * (exotic ? 10 : 1);
            },
            calc(recalc, type){
                if (recalc){
                    let vis = true;
                    resources.forEach(function(res){
                        if (vis && inputs[res].val === undefined){
                            vis = false;
                        }
                    });
                    show.result.vis = vis;
                
                    if (show.result.vis){
                        let total = 0;
                        let exotic = 0;
                        resources.forEach(function(res){
                            total += inputs[res].val * atomic_mass[res];
                        });
                        show.result.kt = +(total).toFixed(4);
                        show.result.solar = +(total / 10000000000).toFixed(10);
                        show.result.MW = +(show.result.solar * (inputs.grav.val ? 13.5 : 7.5) + show.result.exotic * (inputs.grav.val ? 135 : 75)).toFixed(10);
                    }
                    else {
                        show.result.kt = undefined;
                        show.result.solar = undefined;
                        show.result.mw = undefined;
                    }
                }
                return show.result[type];
            },
            calcExotic(){
                if (inputs.Infernite.val !== undefined && inputs.Elerium.val !== undefined){
                    show.result.exoVis = true;
                    
                    show.result.exotic = +((inputs.Infernite.val * atomic_mass.Infernite + inputs.Elerium.val * atomic_mass.Elerium) / 10000000000).toFixed(10);
                    
                    return show.result.exotic;
                }
                else {
                    show.result.exoVis = false;
                    show.result.exotic = undefined;
                }
            },
            calcMW(){
                if (inputs.solar_tot.val !== undefined && inputs.exotic_tot.val !== undefined){
                    show.result.MWVis = true;
                    
                    show.result.MWTot = +(20 + ((inputs.solar_tot.val - 8) * (inputs.grav.val ? 13.5 : 7.5) + inputs.exotic_tot.val * (inputs.grav.val ? 135 : 75))).toFixed(10);
                    
                    return show.result.MWTot;
                }
                else {
                    show.result.MWVis = false;
                    show.result.MWTot = undefined;
                }
            },
            calcTime(){
                if (inputs.exotic_tot.val !== undefined && show.result.exoVis){
                    show.result.timeVis = true;
                    if (inputs.exotic_tot.val >= 0.025){
                        show.result.timeTot = loc('wiki_calc_mass_time_reached');
                    }
                    else if (show.result.exotic === 0){
                        show.result.timeTot = loc('time_never');
                    }
                    else {
                        show.result.timeTot = timeFormat(Math.round((0.025 - inputs.exotic_tot.val) / show.result.exotic));
                    }
                    
                    return show.result.timeTot;
                }
                else {
                    show.result.timeVis = false;
                    show.result.timeTot = undefined;
                }
            }
        }
    });
}

function untappedCalc(info){
    let calc = $(`<div class="calc" id="untappedPotentialCalc"></div>`);
    info.append(calc);
    
    calc.append(`<h2 class="has-text-caution">${loc('wiki_calc_bonuses',[loc('trait_untapped_name')])}</h2>`);
    
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(formula);
    calc.append(variables);
    
    let inputs = {
        genes: { val: undefined }
    }
    
    let show = {
        result: { vis: false, val: 0 }
    }
    
    formula.append(`
        <div>
            <span>({{ i.genes.val | generic }} / ({{ i.genes.val | generic }} + 20) / 10) + 0.00024</span><span v-show="s.result.vis"> = {{ false | calc }} = +{{ true | calc }}%</span>
        </div>
    `);
    
    variables.append(`
        <div>
            <div class="calcInput"><span>${loc('resource_Genes_name')}</span> <b-numberinput :input="val('genes')" min="0" v-model="i.genes.val" :controls="false"></b-numberinput></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button>
            <button class="button" @click="importInputs()">${loc('wiki_calc_import')}</button>
        </div>
    `);
    
    vBind({
        el: `#untappedPotentialCalc`,
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
                inputs.genes.val = undefined;
            },
            importInputs(){
                inputs.genes.val = global['custom'] ? calcGenomeScore({ genus: global.custom.race0.genus, traitlist: global.custom.race0.traits }) : 0;
            }
        },
        filters: {
            generic(num){
                return num !== undefined ? num : loc('resource_Genes_name');
            },
            calc(percent){
                if (percent){
                    return (show.result.val * 100).toFixed(3);
                }
                show.result.vis = inputs.genes.val;
                
                if (show.result.vis){
                    show.result.val = +(inputs.genes.val / (inputs.genes.val + 20) / 10 + 0.00024).toFixed(5);
                    
                    return show.result.val;
                }
            }
        }
    });
}
