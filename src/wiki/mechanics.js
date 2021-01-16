import { global } from './../vars.js';
import { loc } from './../locale.js';
import { sideMenu, infoBoxBuilder } from './functions.js';

export function mechanicsPage(content){
    let mainContent = sideMenu('create',content);

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

    infoBoxBuilder(mainContent,{ name: 'job', template: 'mechanics', label: loc('wiki_mechanics_job'), paragraphs: 9, break: [5], h_level: 2,
        para_data: {
            1: [loc('wiki_mechanics_job')],
            2: ['*'],
            3: [loc('wiki_mechanics_job')]
        }
    });
    sideMenu('add',`mechanics-gameplay`,`job`,loc('wiki_mechanics_job'));

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
            20: [loc('wiki_arpa_crispr_transcendence')],

        },
        data_link: {
            10: ['wiki.html#races-species']
        }
    });
    sideMenu('add',`mechanics-gameplay`,`religion`,loc('wiki_mechanics_religion'));
}
