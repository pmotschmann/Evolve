import { global } from './../vars.js';
import { loc } from './../locale.js';
import { vBind, svgIcons, svgViewBox} from './../functions.js';
import { races } from './../races.js';
import { atomic_mass } from './../resources.js';
import { swissKnife } from './../tech.js';
import { sideMenu, infoBoxBuilder } from './functions.js';
import { createCalcSection } from './p_res.js';

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

    { // Queue
        infoBoxBuilder(mainContent,{ name: 'queue', template: 'mechanics', label: loc('wiki_mechanics_queue'), paragraphs: 10, break: [4,6,9,10], h_level: 2,
            para_data: {
                1: [loc('wiki_mechanics_queue'),loc('tech_urban_planning')],
                2: [loc('building_queue')],
                4: [loc('wiki_mechanics_queue_research'),loc('tech_assistant')],
                7: [loc('q_key'),global.settings.keyMap.q],
                8: [loc('q_key')],
                10: [loc('q_any')]
            },
            data_color: {
                7: ['warning','caution']
            }
        });
        sideMenu('add',`mechanics-gameplay`,`queue`,loc('wiki_mechanics_queue'));
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
        sideMenu('add',`mechanics-gameplay`,`quantum`,loc('wiki_mechanics_quantum'));

        infoBoxBuilder(quantum,{ name: 'quantum_swarm_ai', template: 'mechanics', label: loc('tech_swarm_control_ai'), paragraphs: 2, h_level: 2,
            para_data: {
                1: [loc('tech_swarm_control_ai'),loc('space_sun_swarm_satellite_title'),loc('space_sun_swarm_control_title')],
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
                3: [loc('galaxy_embassy'),loc('tech_xeno_gift'),loc('galaxy_alien2_mission',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name])],
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
            MWVis: false, MWTot: undefined
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
            }
        }
    });
}
