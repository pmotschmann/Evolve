import { global } from './../vars.js';
import { loc } from './../locale.js';
import { infoBoxBuilder } from './functions.js';

export function resetsPage(content){
    let resets = ['mad','bioseed','blackhole','ascension','cataclysm'];
    let reset_labels = resets.map(x => `<span class="has-text-caution">${loc(`wiki_resets_${x}`)}</span>`);

    infoBoxBuilder(content,{ name: 'intro', template: 'resets', paragraphs: 3, h_level: 2,
        para_data: { 1: [resets.length, reset_labels.slice(0, -1).join(', ') + `, & ${reset_labels[reset_labels.length - 1]}`] },
        data_color: { 1: ['warning','plain'] }
    });

    infoBoxBuilder(content,{ name: 'mad', template: 'resets', paragraphs: 8, break: [6], h_level: 2,
        para_data: {
            3: [loc('wiki_p_res_plasmids')],
            4: [loc('tech_rocketry'),loc('tech_mad')],
            5: [loc('tab_civics'),loc('tab_military')],
            6: [loc('wiki_p_res_plasmids')],
            7: [loc('wiki_p_res_plasmids')]
        },
        data_color: {
            3: ['danger'],
            6: ['danger'],
            7: ['danger']
        }
    });

    infoBoxBuilder(content,{ name: 'bioseed', template: 'resets', paragraphs: 11, break: [5,8], h_level: 2,
        para_data: {
            2: [loc('tech_genesis_ship')],
            3: [loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage')],
            4: [loc('wiki_p_res_plasmids')],
            5: [loc('tech_genesis_ship'),loc('tech_star_dock')],
            6: [loc('tech_interstellar'),loc('tech_star_dock')],
            7: [loc('tech_genesis_ship')],
            9: [loc('tech_interstellar'),loc('star_dock_probe_desc')],
            10: [loc('wiki_planet_planet')]
        },
        data_color: {
            3: ['danger','danger'],
            4: ['danger']
        },
        data_link: { 10: ['wiki.html#planets-gameplay'] }
    });

    infoBoxBuilder(content,{ name: 'blackhole', template: 'resets', paragraphs: 3, break: [3], h_level: 2,
        para_data: {
            2: [loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage'),loc('wiki_p_res_dark')],
        },
        data_color: {
            2: ['danger','danger','danger'],
        }
    });

    infoBoxBuilder(content,{ name: 'ascension', template: 'resets', paragraphs: 3, break: [3], h_level: 2,
        para_data: {
            2: [loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage'),loc('wiki_p_res_harmony')],
        },
        data_color: {
            2: ['danger','danger','danger'],
        }
    });

    infoBoxBuilder(content,{ name: 'cataclysm', template: 'resets', paragraphs: 9, break: [4,7], h_level: 2,
        para_data: {
            1: [loc('planet_unstable')],
            2: [loc('tech_world_collider')],
            3: [loc('tech_dial_it_to_11'),loc('tech_limit_collider')],
            6: [loc('wiki_p_res_plasmids'),loc('wiki_p_res_phage')],
        },
        data_color: {
            6: ['danger','danger']
        }
    });
}
