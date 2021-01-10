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

    
}
