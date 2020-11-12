import { loc } from './../locale.js';
import { universe_types } from './../space.js';
import { darkEffect } from './../functions.js';
import { infoBoxBuilder } from './functions.js';

export function universePage(content){
    let universes = [];
    Object.keys(universe_types).forEach(function (universe){
        universes.push(universe);
    });
    let universe_labels = universes.map(x => `<span class="has-text-caution">${loc(`universe_${x}`)}</span>`);

    infoBoxBuilder(content,{ name: 'intro', template: 'universe', paragraphs: 3, break: [2], h_level: 2,
        para_data: {
            1: [universes.length, universe_labels.slice(0, -1).join(', ') + `, ${loc('or')} ${universe_labels[universe_labels.length - 1]}`],
            2: [loc(`universe_standard`)],
            3: [loc(`wiki_resets_blackhole`)]
        },
        data_color: {
            1: ['warning','plain'],
            2: ['caution']
        },
        data_link: {
            3: ['wiki.html#resets-gameplay-blackhole']
        }
    });

    infoBoxBuilder(content,{ name: 'standard', template: 'universe', paragraphs: 3, break: [2], h_level: 2,
        para_data: {
            1: [loc(`universe_standard`)],
            2: [loc('wiki_p_res_dark')],
            3: [loc('wiki_p_res_dark'),+((darkEffect('standard',false,true) - 1) * 100).toFixed(3) + '%']
        },
        data_color: {
            1: ['caution']
        }
    });

    let heavy_space = +((1.25 + (0.5 * darkEffect('heavy',false,true)) - 1) * 100).toFixed(3) + '%';
    let heavy_int = +((1.2 + (0.3 * darkEffect('heavy',false,true)) - 1) * 100).toFixed(3) + '%';
    infoBoxBuilder(content,{ name: 'heavy', template: 'universe', paragraphs: 9, break: [5,8], h_level: 2,
        para_data: {
            1: [universe_types.heavy.desc],
            2: [loc('resource_Oil_name'),loc('resource_Helium_3_name'),loc('resource_Deuterium_name')],
            3: [loc('tab_space'),'75%'],
            4: [loc('tab_interstellar'),loc('tab_galactic'),'50%'],
            5: [loc('wiki_universe_heavy')],
            6: ['5%',loc('resource_Plasmid_plural_name'),loc('resource_Phage_name'),loc('resource_Dark_name')],
            7: [loc('resource_Harmony_name'),'20%'],
            8: [loc('wiki_p_res_dark')],
            9: [loc('wiki_p_res_dark'),heavy_space,heavy_int]            
        },
        data_color: {
            1: ['plain']
        },
        data_link: {
            6: ['plain','wiki.html#resources-prestige-plasmids','wiki.html#resources-prestige-phage','wiki.html#resources-prestige-dark'],
            7: ['wiki.html#resources-prestige-harmony','plain']
        }
    });

    infoBoxBuilder(content,{ name: 'antimatter', template: 'universe', paragraphs: 9, break: [3,6,8], h_level: 2,
        para_data: {
            1: [loc(`universe_antimatter`)],
            2: [loc('resource_AntiPlasmid_plural_name'),loc('resource_Plasmid_plural_name')],
            3: [loc('evo_challenge_plasmid'),loc('evo_challenge_mastery')],
            4: ['50%'],
            5: ['50%','6%'],
            7: ['10%'],
            8: [loc('wiki_p_res_dark')],
            9: [loc('wiki_p_res_dark'),+((darkEffect('antimatter',false,true) - 1) * 100).toFixed(3) + '%']
        },
        data_color: {
            1: ['caution']
        },
        data_link: {
            2: ['wiki.html#resources-prestige-antiplasmids','wiki.html#resources-prestige-plasmids']
        }
    });

    infoBoxBuilder(content,{ name: 'evil', template: 'universe', paragraphs: 7, break: [2,5], h_level: 2,
        para_data: {
            2: [loc('trait_evil_name')],
            3: [loc('trait_evil_name')],
            4: [loc('biome_hellscape_name'),loc('biome_eden_name')],
            5: [loc('wiki_p_res_dark')],
            7: [loc('wiki_p_res_dark'),+((darkEffect('evil',false,true) - 1) * 100).toFixed(3) + '%']
        }
    });

    infoBoxBuilder(content,{ name: 'micro', template: 'universe', paragraphs: 6, break: [2,4], h_level: 2,
        para_data: {
            1: ['75%'],
            4: [loc('wiki_p_res_dark')],
            5: [loc('wiki_p_res_dark'),darkEffect('micro',false,true),darkEffect('micro',true,true)],
            6: ['1.005']
        }
    });

    infoBoxBuilder(content,{ name: 'magic', template: 'universe', paragraphs: 8, break: [4,7], h_level: 2,
        para_data: {
            6: [80],
            7: [loc('wiki_p_res_dark')],
            8: [loc('wiki_p_res_dark'),+((darkEffect('magic',false,true) - 1) * 100).toFixed(3) + '%'],
        }
    });
}
