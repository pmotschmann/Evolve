import { loc } from './../locale.js';
import { sideMenu, infoBoxBuilder } from './functions.js';

export function mechanicsPage(content){
    let mainContent = sideMenu('create',content);

    infoBoxBuilder(mainContent,{ name: 'atime', template: 'mechanics', label: loc('wiki_mechanics_atime'), paragraphs: 5, break: [4,5], h_level: 2,
        para_data: {
            1: [loc('wiki_mechanics_atime')],
            2: [2,loc('wiki_mechanics_atime')],
            3: ['2x',loc('wiki_mechanics_atime')],
            4: [loc('wiki_mechanics_atime'),8],
            5: [loc('wiki_mechanics_atime')]
        }
    });
    sideMenu('add',`mechanics-gameplay`,`atime`,loc('wiki_mechanics_atime'));

    
}
