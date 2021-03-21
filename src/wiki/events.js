import { clearElement } from './../functions.js';
import { loc } from './../locale.js';
import { events } from './../events.js';
import { sideMenu, infoBoxBuilder } from './functions.js';

export function eventsPage(zone){
    let content = $(`#content`);
    clearElement(content);

    switch (zone){
        case 'major':
            mainEventsPage(content);
            break;
        case 'special':
            specialEventsPage(content);
            break;     
    }
}

function mainEventsPage(content){
    let mainContent = sideMenu('create',content);
    
    {   // DNA Replication
        let section = infoBoxBuilder(mainContent,{ name: 'replication', template: 'events', label: loc('wiki_events_replication'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [1,loc('wiki_events_replication_para1_note',[3])],
            }
        });
        infoBoxBuilder(mainContent, { name: 'evolution', template: 'events', label: loc('wiki_events_replication'), paragraphs: 1, h_level: 2 }, section);
        sideMenu('add',`major-events`,`replication`,loc('wiki_events_replication'));
    }

    {   // RNA Meteor
        let section = infoBoxBuilder(mainContent,{ name: 'rna_meteor', template: 'events', label: loc('wiki_events_rna_meteor'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [1,loc('wiki_events_rna_meteor_para1_note',[2])],
            }
        });
        infoBoxBuilder(mainContent, { name: 'evolution', template: 'events', label: loc('wiki_events_rna_meteor'), paragraphs: 1, h_level: 2 }, section);
        sideMenu('add',`major-events`,`rna_meteor`,loc('wiki_events_rna_meteor'));
    }

    {   // Inspiration
        infoBoxBuilder(mainContent,{ name: 'inspiration', template: 'events', label: loc('wiki_events_inspiration'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [300,600],
            }
        });
        sideMenu('add',`major-events`,`inspiration`,loc('wiki_events_inspiration'));
    }

    {   // Fire
        let section = infoBoxBuilder(mainContent,{ name: 'fire', template: 'events', label: loc('wiki_events_fire'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [1,`25%`],
            }
        });
        infoBoxBuilder(mainContent, { name: 'fire_condition', template: 'events', label: loc('wiki_events_fire'), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`major-events`,`fire`,loc('wiki_events_fire'));
    }

    {   // Flare
        let section = infoBoxBuilder(mainContent,{ name: 'flare', template: 'events', label: loc('wiki_events_flare'), paragraphs: 3, h_level: 2,
            para_data: {
                2: [`10%`],
                3: [`20%`,20,200],
            }
        });
        infoBoxBuilder(mainContent, { name: 'flare_condition', template: 'events', label: loc('wiki_events_flare'), paragraphs: 4, break: [2], h_level: 2 }, section);
        sideMenu('add',`major-events`,`flare`,loc('wiki_events_flare'));
    }

    {   // Raid
        let section = infoBoxBuilder(mainContent,{ name: 'raid', template: 'events', label: loc('wiki_events_raid'), paragraphs: 3, h_level: 2,
            para_data: {
                2: [`25%`],
            }
        });
        infoBoxBuilder(mainContent, { name: 'raid_condition', template: 'events', label: loc('wiki_events_raid'), paragraphs: 1, h_level: 2 }, section);
        sideMenu('add',`major-events`,`raid`,loc('wiki_events_raid'));
    }

    {   // Siege
        let section = infoBoxBuilder(mainContent,{ name: 'siege', template: 'events', label: loc('wiki_events_siege'), paragraphs: 3, h_level: 2,
            para_data: {
                2: [`50%`],
            }
        });
        infoBoxBuilder(mainContent, { name: 'siege_condition', template: 'events', label: loc('wiki_events_siege'), paragraphs: 2, h_level: 2 }, section);
        sideMenu('add',`major-events`,`siege`,loc('wiki_events_siege'));
    }

    {   // Terrorist
        let section = infoBoxBuilder(mainContent,{ name: 'terrorist', template: 'events', label: loc('wiki_events_terrorist'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'terrorist_condition', template: 'events', label: loc('wiki_events_terrorist'), paragraphs: 1, h_level: 2 }, section);
        sideMenu('add',`major-events`,`terrorist`,loc('wiki_events_terrorist'));
    }

    {   // Quake
        let section = infoBoxBuilder(mainContent,{ name: 'quake', template: 'events', label: loc('wiki_events_quake'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'quake_condition', template: 'events', label: loc('wiki_events_quake'), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`major-events`,`quake`,loc('wiki_events_quake'));
    }

    {   // Doom
        let section = infoBoxBuilder(mainContent,{ name: 'doom', template: 'events', label: loc('wiki_events_doom'), paragraphs: 2, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'doom_condition', template: 'events', label: loc('wiki_events_doom'), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`major-events`,`doom`,loc('wiki_events_doom'));
    }
}

function specialEventsPage(content){
    
}