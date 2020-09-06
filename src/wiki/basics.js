import { loc } from './../locale.js';
import { infoBoxBuilder } from './functions.js';

export function basicsPage(content){
    infoBoxBuilder(content,{ name: 'start', template: 'basics', paragraphs: 2, h_level: 2 });

    infoBoxBuilder(content,{ name: 'prehistoric', template: 'basics', paragraphs: 14, break: [2,6,13], h_level: 2,
        para_data: {
            3: [loc(`resource_RNA_name`),loc(`resource_DNA_name`)],
            4: [loc(`evo_organelles_title`),loc(`resource_RNA_name`),loc(`evo_nucleus_title`),loc(`resource_DNA_name`)],
            5: [loc(`evo_membrane_title`),loc(`evo_eukaryotic_title`),loc(`evo_mitochondria_title`)],
            7: [loc('genelab_genus')],
            8: [3],
            13: [loc('evo_sentience_title')],
        },
        data_link: {
            7: ['wiki.html#races-species']
        }
    });

    infoBoxBuilder(content,{ name: 'civilization', template: 'basics', paragraphs: 14, break: [2,8,13], h_level: 2,
        para_data: {
            3: [loc(`tab_civics`)],
            4: [loc(`resource_Food_name`),loc(`job_farmer`),loc(`job_hunter`)],
            5: ['*'],
            8: [loc(`resource_Food_name`)],
            9: [loc(`resource_Food_name`),loc(`hunger`)],
            10: [loc(`resource_Food_name`)],
            11: [loc(`resource_Food_name`)],
            12: [loc(`resource_Food_name`)],
            13: [loc(`resource_Knowledge_name`)],
            14: [loc(`resource_Knowledge_name`),loc(`city_university`)]
        }
    });

    infoBoxBuilder(content,{ name: 'government', template: 'basics', paragraphs: 8, break: [4], h_level: 2,
        para_data: {
            1: [loc(`tech_government`),loc(`tab_civics`),loc(`govern_anarchy`)],
            2: [loc(`tech_government`),loc(`govern_anarchy`)],
            3: [loc(`tech_government`)],
            4: [loc('morale')],
            5: [loc('morale')],
            6: [loc('morale'),loc('job_entertainer'),loc('morale_stress')],
            7: [loc('morale_tax'),loc('morale')],
            8: [25,100]
        }
    });

    infoBoxBuilder(content,{ name: 'mad', template: 'basics', paragraphs: 4, h_level: 2,
        para_data: {
            1: [loc(`wiki_resets_mad`)],
            2: [loc(`wiki_basics_mad_reset`),loc(`tab_civics`),loc(`tab_military`)],
            3: [loc(`tab_space`)],
        },
        data_link: {
            2: ['wiki.html#resets-prestige']
        }
    });
}
