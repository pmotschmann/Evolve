import { loc } from './../locale.js';
import { universe_types } from './../space.js';
import { infoBoxBuilder } from './functions.js';

export function resetsPage(content){
    let resets = ['mad','bioseed','blackhole','ascension','cataclysm'];
    let reset_labels = resets.map(x => `<span class="has-text-caution">${loc(`wiki_resets_${x}`)}</span>`);

    infoBoxBuilder(content,{ name: 'intro', template: 'resets', paragraphs: 3, h_level: 2,
        para_data: { 1: [resets.length, reset_labels.slice(0, -1).join(', ') + `, & ${reset_labels[reset_labels.length - 1]}`] },
        data_color: { 1: ['warning','plain'] }
    });

    infoBoxBuilder(content,{ name: 'mad', template: 'resets', paragraphs: 9, break: [6,9], h_level: 2,
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

    infoBoxBuilder(content,{ name: 'bioseed', template: 'resets', paragraphs: 12, break: [5,8,12], h_level: 2,
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

    let universes = [];
    Object.keys(universe_types).forEach(function (universe){
        universes.push(universe);
    });
    let universe_labels = universes.map(x => `<span class="has-text-caution">${loc(`universe_${x}`)}</span>`);

    infoBoxBuilder(content,{ name: 'blackhole', template: 'resets', paragraphs: 12, break: [3,6,9,12], h_level: 2,
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

    infoBoxBuilder(content,{ name: 'ascension', template: 'resets', paragraphs: 7, break: [3,5,7], h_level: 2,
        para_data: {
            2: [loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage'),loc('wiki_p_res_harmony')],
            3: [loc('interstellar_ascension_machine'),'10,000',loc('interstellar_thermal_collector')],
            4: [100,25],
            7: [loc('wiki_resets_ascension')]
        },
        data_color: {
            2: ['danger','danger','danger'],
        }
    });

    infoBoxBuilder(content,{ name: 'cataclysm', template: 'resets', paragraphs: 10, break: [4,7,10], h_level: 2,
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
}
