import { loc } from './../locale.js';
import { universe_types } from './../space.js';
import { infoBoxBuilder, sideMenu, createCalcSection } from './functions.js';
import { prestigeCalc } from './p_res.js';
import { massCalc } from './mechanics.js';

export function resetsPage(content){
    let mainContent = sideMenu('create',content);

    let resets = ['mad','bioseed','blackhole','ascension','cataclysm','vacuum','infusion','ai','terraform'];
    let reset_labels = resets.map(x => `<span class="has-text-caution">${loc(`wiki_resets_${x}`)}</span>`);

    infoBoxBuilder(mainContent,{ name: 'intro', template: 'resets', paragraphs: 3, h_level: 2,
        para_data: { 1: [resets.length, reset_labels.slice(0, -1).join(', ') + `, & ${reset_labels[reset_labels.length - 1]}`] },
        data_color: { 1: ['warning','plain'] }
    });
    sideMenu('add',`resets-prestige`,'intro',loc('wiki_menu_intro'));

    // MAD
    let section = infoBoxBuilder(mainContent,{ name: 'mad', template: 'resets', paragraphs: 9, break: [6,9], h_level: 2,
        para_data: {
            3: [loc('wiki_p_res_plasmids')],
            4: [loc('tech_rocketry'),loc('tech_mad')],
            5: [loc('tab_civics'),loc('tab_military')],
            6: [loc('wiki_p_res_plasmids')],
            7: [loc('wiki_p_res_plasmids')],
            9: [loc('wiki_resets_mad')]
        },
        data_color: {
            3: ['danger'],
            6: ['danger'],
            7: ['danger']
        }
    });
    section = createCalcSection(section,'mad','gain');
    prestigeCalc(section,'plasmid',false,'mad');
    sideMenu('add',`resets-prestige`,'mad',loc('wiki_resets_mad'));

    // Bioseed
    section = infoBoxBuilder(mainContent,{ name: 'bioseed', template: 'resets', paragraphs: 12, break: [5,8,12], h_level: 2,
        para_data: {
            2: [loc('tech_genesis_ship')],
            3: [loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage')],
            4: [loc('wiki_p_res_plasmids')],
            5: [loc('tech_genesis_ship'),loc('tech_star_dock')],
            6: [loc('tech_interstellar'),loc('tech_star_dock')],
            7: [loc('tech_genesis_ship')],
            9: [loc('tech_interstellar'),loc('star_dock_probe_desc')],
            10: [loc('wiki_planet_planet')],
            12: [loc('wiki_resets_bioseed')]
        },
        data_color: {
            3: ['danger','danger'],
            4: ['danger']
        },
        data_link: { 10: ['wiki.html#planets-gameplay'] }
    });
    section = createCalcSection(section,'bioseed','gain');
    prestigeCalc(section,'plasmid',false,'bioseed');
    prestigeCalc(section,'phage',false,'bioseed');
    sideMenu('add',`resets-prestige`,'bioseed',loc('wiki_resets_bioseed'));

    // Blackhole
    let universes = [];
    Object.keys(universe_types).forEach(function (universe){
        universes.push(universe);
    });
    let universe_labels = universes.map(x => `<span class="has-text-caution">${loc(`universe_${x}`)}</span>`);

    section = infoBoxBuilder(mainContent,{ name: 'blackhole', template: 'resets', paragraphs: 12, break: [3,6,9,12], h_level: 2,
        para_data: {
            2: [loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage'),loc('wiki_p_res_dark')],
            3: [loc('tech_dist_stellar_engine')],
            4: [loc('tech_mass_ejector'),loc('wiki_resets_blackhole_exotic'),0.025,loc('resource_Elerium_name'),loc('resource_Infernite_name')],
            5: [loc('wiki_p_res_dark')],
            6: [loc('wiki_resets_blackhole_exotic'),loc('tech_exotic_infusion')],
            7: [10,loc('wiki_hell_soul_gem')],
            8: [loc('tech_stabilize_blackhole'),loc('wiki_resets_blackhole_exotic')],
            10: [universes.length, universe_labels.slice(0, -1).join(', ') + `, ${loc('or')} ${universe_labels[universe_labels.length - 1]}`],
            12: [loc('wiki_resets_blackhole')]
        },
        data_color: {
            2: ['danger','danger','danger'],
            4: ['warning','warning','warning','caution','caution'],
            5: ['danger'],
            7: ['warning','caution'],
            10: ['warning','plain']
        }
    });
    let subSection = createCalcSection(section,'bigbang','gain');
    prestigeCalc(subSection,'plasmid',false,'bigbang');
    prestigeCalc(subSection,'phage',false,'bigbang');
    prestigeCalc(subSection,'dark',false,'bigbang');
    subSection = createCalcSection(section,'eject','mass');
    massCalc(subSection);
    sideMenu('add',`resets-prestige`,'blackhole',loc('wiki_resets_blackhole'));

    // Vacuum Collapse
    section = infoBoxBuilder(mainContent,{ name: 'vacuum', template: 'resets', paragraphs: 10, break: [4,8,10], h_level: 2,
        para_data: {
            4: [80],
            6: [loc('arpa_syphon_damage')],
            7: [80],
            8: [loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage'),loc('wiki_p_res_dark')],
            9: [loc('wiki_p_res_dark')],
            10: [loc('wiki_resets_vacuum')],
        },
        data_color: {
            6: ['danger'],
            8: ['danger','danger','danger'],
            9: ['danger'],
        }
    });
    section = createCalcSection(section,'vacuum','gain');
    prestigeCalc(section,'plasmid',false,'vacuum');
    prestigeCalc(section,'phage',false,'vacuum');
    prestigeCalc(section,'dark','vacuum','vacuum');
    sideMenu('add',`resets-prestige`,'vacuum',loc('wiki_resets_vacuum'));

    // Ascension
    section = infoBoxBuilder(mainContent,{ name: 'ascension', template: 'resets', paragraphs: 10, break: [3,5,7,10], h_level: 2,
        para_data: {
            2: [loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage'),loc('wiki_p_res_harmony')],
            3: [loc('interstellar_ascension_machine'),'10,000',loc('interstellar_thermal_collector')],
            4: [100,25],
            7: [`+2%`],
            8: [`+2`,`+5%`,`+10%`],
            10: [loc('wiki_resets_ascension')]
        },
        data_color: {
            2: ['danger','danger','danger'],
        }
    });
    section = createCalcSection(section,'ascend','gain');
    prestigeCalc(section,'plasmid',false,'ascend');
    prestigeCalc(section,'phage',false,'ascend');
    prestigeCalc(section,'harmony',false,'ascend');
    sideMenu('add',`resets-prestige`,'ascension',loc('wiki_resets_ascension'));

    // Cataclysm
    section = infoBoxBuilder(mainContent,{ name: 'cataclysm', template: 'resets', paragraphs: 10, break: [4,7,10], h_level: 2,
        para_data: {
            1: [loc('planet_unstable')],
            2: [loc('tech_world_collider')],
            3: [loc('tech_dial_it_to_11'),loc('tech_limit_collider')],
            6: [loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage')],
            10: [loc('wiki_resets_cataclysm')]
        },
        data_color: {
            6: ['danger','danger']
        }
    });
    section = createCalcSection(section,'cataclysm','gain');
    prestigeCalc(section,'plasmid',false,'cataclysm');
    prestigeCalc(section,'phage',false,'cataclysm');
    sideMenu('add',`resets-prestige`,'cataclysm',loc('wiki_resets_cataclysm'));

    // Terraform
    section = infoBoxBuilder(mainContent,{ name: 'terraform', template: 'resets', paragraphs: 19, break: [3,6,7,10,12,19], h_level: 2,
        para_data: {
            1: [loc('wiki_resets_terraform'),loc(`evo_challenge_orbit_decay`)],
            2: [loc('wiki_resets_ascension')],
            3: [loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage'),loc('wiki_p_res_harmony')],
            7: [loc('achieve_lamentis_name')],
            8: [1],
            10: [loc('rejuvenated')],
            13: ['10%'],
            14: ['5%'],
            16: ['2%','50%'],
            17: ['50%'],
            19: [loc('wiki_resets_terraform')],
        }
    });
    section = createCalcSection(section,'terraform','gain');
    prestigeCalc(section,'plasmid',false,'terraform');
    prestigeCalc(section,'phage',false,'terraform');
    prestigeCalc(section,'harmony',false,'terraform');
    sideMenu('add',`resets-prestige`,'terraform',loc('wiki_resets_terraform'));

    // Demonic Infusion
    section = infoBoxBuilder(mainContent,{ name: 'infusion', template: 'resets', paragraphs: 8, break: [4,8], h_level: 2,
        para_data: {
            2: [loc('resource_Artifact_name')],
            5: [loc('resource_Demonic_Essence_name')],
            6: [loc('resource_Demonic_Essence_name')],
            7: [loc('achieve_corrupted_name')],
            8: [loc('wiki_resets_infusion')],
        },
        data_color: {
            2: ['danger'],
            7: ['caution']
        }
    });
    section = createCalcSection(section,'descend','gain');
    prestigeCalc(section,'artifact',false,'descend');
    sideMenu('add',`resets-prestige`,'infusion',loc('wiki_resets_infusion'));

    // Apotheosis
    section = infoBoxBuilder(mainContent,{ name: 'apotheosis', template: 'resets', paragraphs: 7, break: [4,6,7], h_level: 2,
        para_data: {
            2: [loc('resource_Supercoiled_name')],
            3: [1,loc('resource_Plasmid_name')],
            4: [50,loc('resource_Demonic_Essence_name'),loc(`tab_eden`)],
            5: [loc('wiki_resets_infusion')],
            6: [9],
            7: [loc('wiki_resets_apotheosis')],
        },
        data_color: {
            2: ['danger'],
            3: ['warning','danger'],
        }
    });
    section = createCalcSection(section,'apotheosis','gain');
    prestigeCalc(section,'supercoiled',false,'apotheosis');
    sideMenu('add',`resets-prestige`,'apotheosis',loc('wiki_resets_apotheosis'));

    // AI Appoc
    section = infoBoxBuilder(mainContent,{ name: 'ai', template: 'resets', paragraphs: 8, break: [3,6,7,8], h_level: 2,
        para_data: {
            2: [loc('evo_challenge_truepath')],
            3: [loc('space_ai_core'),loc('wiki_resets_ai_drift'),'100%'],
            4: [loc('tech_protocol66')],
            5: [loc('space_ai_colonist_title'),loc('space_decoder_title'),loc('space_shock_trooper_title'),loc('space_tank_title')],
            6: [loc('wiki_resets_ai'),loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage'),loc('wiki_p_res_ai_core')],
            7: [loc('genelab_genus_synthetic')],
            8: [loc('wiki_resets_ai')],
        },
        data_color: {
            6: ['warning','danger','danger','danger'],
        },
        data_link: {
            2: ['wiki.html#challenges-gameplay-scenarios_truepath'],
            3: ['wiki.html#space-tp_structures-ai_core'],
            4: ['wiki.html#solar-tp_tech-protocol66'],
            5: ['#space-tp_structures-ai_colonist','#space-tp_structures-decoder','#space-tp_structures-shock_trooper','#space-tp_structures-tank'],
        }
    });
    section = createCalcSection(section,'ai','gain');
    prestigeCalc(section,'plasmid',false,'ai');
    prestigeCalc(section,'phage',false,'ai');
    prestigeCalc(section,'cores',false,'ai');
    sideMenu('add',`resets-prestige`,'ai',loc('wiki_resets_ai'));

    // Matrix
    section = infoBoxBuilder(mainContent,{ name: 'matrix', template: 'resets', paragraphs: 6, break: [3,5,6], h_level: 2,
        para_data: {
            2: [loc('evo_challenge_truepath')],
            3: [loc('tau_star_ringworld')],
            5: [loc('wiki_resets_matrix'),loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage'),loc('civics_servants')],
            6: [loc('wiki_resets_matrix')],
        },
        data_color: {
            5: ['warning','danger','danger','danger'],
        },
        data_link: {
            2: ['wiki.html#challenges-gameplay-scenarios_truepath'],
            3: ['wiki.html#tauceti-structures-ringworld'],
        }
    });
    section = createCalcSection(section,'matrix','gain');
    prestigeCalc(section,'plasmid',false,'matrix');
    prestigeCalc(section,'phage',false,'matrix');
    sideMenu('add',`resets-prestige`,'matrix',loc('wiki_resets_matrix'));

    // Retirement
    section = infoBoxBuilder(mainContent,{ name: 'retired', template: 'resets', paragraphs: 6, break: [3,5,6], h_level: 2,
        para_data: {
            2: [loc('evo_challenge_truepath')],
            3: [loc('tech_matrioshka_brain'),loc('tech_ignition_device')],
            5: [loc('wiki_resets_retired'),loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage'),loc('civics_servants')],
            6: [loc('wiki_resets_retired')],
        },
        data_color: {
            5: ['warning','danger','danger','danger'],
        },
        data_link: {
            2: ['wiki.html#challenges-gameplay-scenarios_truepath'],
            3: ['wiki.html#tauceti-structures-matrioshka_brain','wiki.html#tauceti-structures-ignition_device'],
        }
    });
    section = createCalcSection(section,'retired','gain');
    prestigeCalc(section,'plasmid',false,'retired');
    prestigeCalc(section,'phage',false,'retired');
    sideMenu('add',`resets-prestige`,'retired',loc('wiki_resets_retired'));

    // Garden of Eden
    section = infoBoxBuilder(mainContent,{ name: 'eden', template: 'resets', paragraphs: 6, break: [3,5,6], h_level: 2,
        para_data: {
            2: [loc('evo_challenge_lone_survivor')],
            3: [loc('tau_star_ringworld')],
            4: [loc('tau_star_goe_facility')],
            5: [loc('wiki_resets_eden'),loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage'),loc('civics_servants')],
            6: [loc('wiki_resets_eden')],
        },
        data_color: {
            5: ['warning','danger','danger','danger'],
        },
        data_link: {
            2: ['wiki.html#challenges-gameplay-scenarios_truepath'],
            3: ['wiki.html#tauceti-structures-ringworld'],
            4: ['wiki.html#tauceti-structures-goe_facility'],
        }
    });
    section = createCalcSection(section,'eden','gain');
    prestigeCalc(section,'plasmid',false,'eden');
    prestigeCalc(section,'phage',false,'eden');
    sideMenu('add',`resets-prestige`,'eden',loc('wiki_resets_eden'));
}
