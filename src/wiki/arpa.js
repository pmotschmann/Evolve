import { clearElement } from './../functions.js';
import { projectsPage } from './projects.js';
import { crisprPage } from './crispr.js';
import { bloodPage } from './blood.js';

export function arpaPage(zone){
    let content = $(`#content`);
    clearElement(content);

    switch (zone){
        case 'projects':
            projectsPage(content);
            break;
        case 'genetics':
            //geneticsPage(content);
            break;
        case 'crispr':
            crisprPage(content);
            break;
        case 'blood':
            bloodPage(content);
            break;
    }
}
