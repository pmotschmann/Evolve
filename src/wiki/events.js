import { global } from './../vars.js';
import { races } from './../races.js';
import { govTitle } from './../civics.js';
import { housingLabel } from './../actions.js';
import { clearElement, eventActive } from './../functions.js';
import { loc } from './../locale.js';
import { swissKnife } from './../tech.js';
import { sideMenu, infoBoxBuilder, getSolarName } from './functions.js';

export function eventsPage(zone){
    let content = $(`#content`);
    clearElement(content);

    switch (zone){
        case 'major':
            mainEventsPage(content);
            break;
        case 'minor':
            minorEventsPage(content);
            break;
        case 'progress':
            progressEventsPage(content);
            break;
        case 'special':
            specialEventsPage(content);
            break;     
    }
}

export function mainEventsPage(content){
    let mainContent = sideMenu('create',content);
    
    {   // Intro
        infoBoxBuilder(mainContent,{ name: 'major_intro', template: 'events', paragraphs: 3, h_level: 2,
            para_data: {
                1: [loc(`wiki_menu_major`),999,83],
                2: [loc(`wiki_menu_major`)],
                3: [loc(`wiki_menu_major`)]
            }
        });
        sideMenu('add',`major-events`,'major_intro',loc('wiki_menu_intro'));
    }
    
    {   // DNA Replication
        let section = infoBoxBuilder(mainContent,{ name: 'replication', template: 'events', label: loc('wiki_events_replication'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [1,loc('wiki_events_replication_para1_note',[3])],
            }
        });
        infoBoxBuilder(mainContent, { name: 'evolution', template: 'events', label: loc('wiki_events_replication'), paragraphs: 1, h_level: 2 }, section);
        infoBoxBuilder(mainContent, { name: 'replication_examples', template: 'events', label: loc('wiki_events_replication'), h_level: 2, 
            examples: [
                loc(`event_dna`,[10])
            ]
        }, section);
        sideMenu('add',`major-events`,`replication`,loc('wiki_events_replication'));
    }

    {   // RNA Meteor
        let section = infoBoxBuilder(mainContent,{ name: 'rna_meteor', template: 'events', label: loc('wiki_events_rna_meteor'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [1,loc('wiki_events_rna_meteor_para1_note',[2])],
            }
        });
        infoBoxBuilder(mainContent, { name: 'evolution', template: 'events', label: loc('wiki_events_rna_meteor'), paragraphs: 1, h_level: 2 }, section);
        infoBoxBuilder(mainContent, { name: 'rna_meteor_examples', template: 'events', label: loc('wiki_events_rna_meteor'), h_level: 2, 
            examples: [
                loc(`event_rna`,[22])
            ]
        }, section);
        sideMenu('add',`major-events`,`rna_meteor`,loc('wiki_events_rna_meteor'));
    }

    {   // Inspiration
        infoBoxBuilder(mainContent,{ name: 'inspiration', template: 'events', label: loc('wiki_events_inspiration'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [300,600],
            }, 
            examples: [
                loc(`event_inspiration`)
            ]
        });
        sideMenu('add',`major-events`,`inspiration`,loc('wiki_events_inspiration'));
    }

    {   // Motivation
        infoBoxBuilder(mainContent,{ name: 'motivation', template: 'events', label: loc('wiki_events_motivation'), paragraphs: 3, h_level: 2,
            para_data: {
                1: [300,600],
                2: ['10%','13%'],
            }, 
            examples: [
                loc(`event_motivation`)
            ]
        });
        sideMenu('add',`major-events`,`motivation`,loc('wiki_events_motivation'));
    }

    {   // Fire
        let section = infoBoxBuilder(mainContent,{ name: 'fire', template: 'events', label: loc('wiki_events_fire'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [1,`25%`],
            }
        });
        infoBoxBuilder(mainContent, { name: 'fire_condition', template: 'events', label: loc('wiki_events_fire'), paragraphs: 2, break: [2], h_level: 2 }, section);
        infoBoxBuilder(mainContent, { name: 'fire_examples', template: 'events', label: loc('wiki_events_fire'), h_level: 2, 
            examples: [
                loc(`event_fire`,[(1337).toLocaleString()])
            ]
        }, section);
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
        infoBoxBuilder(mainContent, { name: 'flare_examples', template: 'events', label: loc('wiki_events_flare'), h_level: 2, 
            examples: [
                loc(`event_flare`,[races[global.race.species].home,69]),
                loc(`event_flare2`,[races[global.race.species].home,42])
            ]
        }, section);
        sideMenu('add',`major-events`,`flare`,loc('wiki_events_flare'));
    }

    {   // Raid
        let section = infoBoxBuilder(mainContent,{ name: 'raid', template: 'events', label: loc('wiki_events_raid'), paragraphs: 3, h_level: 2,
            para_data: {
                2: [`25%`],
            }
        });
        infoBoxBuilder(mainContent, { name: 'raid_condition', template: 'events', label: loc('wiki_events_raid'), paragraphs: 2, h_level: 2,
            para_data: {
                2: [loc(`wiki_challenges_scenarios_truepath`)],
            },
            data_link: {
                2: ['wiki.html#challenges-gameplay-scenarios_truepath']
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'raid_examples', template: 'events', label: loc('wiki_events_raid'), h_level: 2, 
            examples: [
                loc(`event_raid1`,[10,31]),
                loc(`event_raid2`,[244,0,50])
            ]
        }, section);
        sideMenu('add',`major-events`,`raid`,loc('wiki_events_raid'));
    }

    {   // Siege
        let section = infoBoxBuilder(mainContent,{ name: 'siege', template: 'events', label: loc('wiki_events_siege'), paragraphs: 3, h_level: 2,
            para_data: {
                2: [`50%`],
            }
        });
        infoBoxBuilder(mainContent, { name: 'siege_condition', template: 'events', label: loc('wiki_events_siege'), paragraphs: 3, h_level: 2,
            para_data: {
                3: [loc(`wiki_challenges_scenarios_truepath`)],
            },
            data_link: {
                3: ['wiki.html#challenges-gameplay-scenarios_truepath']
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'siege_examples', template: 'events', label: loc('wiki_events_siege'), h_level: 2, 
            examples: [
                loc(`event_siege1`,[30,49]),
                loc(`event_siege2`,[(500024).toLocaleString(),0,25])
            ]
        }, section);
        sideMenu('add',`major-events`,`siege`,loc('wiki_events_siege'));
    }

    {   // Terrorist
        let section = infoBoxBuilder(mainContent,{ name: 'terrorist', template: 'events', label: loc('wiki_events_terrorist'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'terrorist_condition', template: 'events', label: loc('wiki_events_terrorist'), paragraphs: 2, h_level: 2,
            para_data: {
                2: [loc(`wiki_challenges_scenarios_truepath`)],
            },
            data_link: {
                2: ['wiki.html#challenges-gameplay-scenarios_truepath']
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'terrorist_examples', template: 'events', label: loc('wiki_events_terrorist'), h_level: 2, 
            examples: [
                loc(`event_terrorist1`,[14]),
                loc(`event_terrorist2`,[54,18])
            ]
        }, section);
        sideMenu('add',`major-events`,`terrorist`,loc('wiki_events_terrorist'));
    }

    {   // Pillage
        let section = infoBoxBuilder(mainContent,{ name: 'pillage', template: 'events', label: loc('wiki_events_pillage'), paragraphs: 6, break: [5], h_level: 2,
            para_data: {
                2: [`25%`],
                3: [`50%`],
                5: [loc(`civics_gov_relations`),`40%`]
            }
        });
        infoBoxBuilder(mainContent, { name: 'pillage_condition', template: 'events', label: loc('wiki_events_pillage'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`wiki_challenges_scenarios_truepath`)],
            },
            data_link: {
                1: ['wiki.html#challenges-gameplay-scenarios_truepath']
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'pillage_examples', template: 'events', label: loc('wiki_events_pillage'), h_level: 2, 
            examples: [
                loc(`event_pillaged1`,[loc(`civics_gov2`,[loc(`civics_gov_name4`)]),10,55]),
                loc(`event_pillaged2`,[loc(`civics_gov6`,[loc(`civics_gov_name9`)]),40,25,[
                    `5704490 ${loc('resource_Lumber_name')}`,
                    `2177130 ${loc('resource_Stone_name')}`,
                    `4259421 ${loc('resource_Furs_name')}`,
                    `6033892 ${loc('resource_Copper_name')}`,
                    `602938 ${loc('resource_Iron_name')}`,
                    `3389580 ${loc('resource_Aluminium_name')}`,
                    `3292455 ${loc('resource_Cement_name')}`,
                    `5394173 ${loc('resource_Coal_name')}`,
                    `47231 ${loc('resource_Oil_name')}`,
                    `9390 ${loc('resource_Uranium_name')}`,
                    `7016884 ${loc('resource_Steel_name')}`,
                    `52801 ${loc('resource_Titanium_name')}`,
                    `1163086 ${loc('resource_Alloy_name')}`,
                    `2053980 ${loc('resource_Polymer_name')}`,
                    `3179901 ${loc('resource_Iridium_name')}`,
                    `792693 ${loc('resource_Helium_3_name')}`,
                    `1219 ${loc('resource_Elerium_name')}`,
                    `65078 ${loc('resource_Water_name')}`,
                    `290451 ${loc('resource_Neutronium_name')}`,
                    `3059577 ${loc('resource_Adamantite_name')}`,
                    `5736560 ${loc('resource_Nano_Tube_name')}`,
                    `2494390 ${loc('resource_Graphene_name')}`,
                    `6836006 ${loc('resource_Stanene_name')}`,
                    `2264649 ${loc('resource_Orichalcum_name')}`,
                    `$19235850`].join(', ')])
            ]
        }, section);
        sideMenu('add',`major-events`,`pillage`,loc('wiki_events_pillage'));
    }

    {   // Quake
        let section = infoBoxBuilder(mainContent,{ name: 'quake', template: 'events', label: loc('wiki_events_quake'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'quake_condition', template: 'events', label: loc('wiki_events_quake'), paragraphs: 2, break: [2], h_level: 2 }, section);
        infoBoxBuilder(mainContent, { name: 'quake_examples', template: 'events', label: loc('wiki_events_quake'), h_level: 2, 
            examples: [
                loc('event_quake',[global.race['cataclysm'] || global.race['orbit_decayed'] ? races[global.race.species].solar.red : races[global.race.species].home])
            ]
        }, section);
        sideMenu('add',`major-events`,`quake`,loc('wiki_events_quake'));
    }

    {   // Doom
        let section = infoBoxBuilder(mainContent,{ name: 'doom', template: 'events', label: loc('wiki_events_doom'), paragraphs: 2, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'doom_condition', template: 'events', label: loc('wiki_events_doom'), paragraphs: 2, break: [2], h_level: 2 }, section);
        infoBoxBuilder(mainContent, { name: 'doom_examples', template: 'events', label: loc('wiki_events_doom'), h_level: 2, 
            examples: [
                loc(`event_doom`,[races[global.race.species].solar.dwarf]),
                loc(`event_doom_alt`,[races[global.race.species].solar.dwarf])
            ]
        }, section);
        sideMenu('add',`major-events`,`doom`,loc('wiki_events_doom'));
    }

    {   // Demon Horde
        let section = infoBoxBuilder(mainContent,{ name: 'dhorde', template: 'events', label: loc('wiki_events_dhorde'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [2500,5000],
            }
        });
        infoBoxBuilder(mainContent, { name: 'dhorde_condition', template: 'events', label: loc('wiki_events_dhorde'), paragraphs: 1, h_level: 2 }, section);
        infoBoxBuilder(mainContent, { name: 'dhorde_examples', template: 'events', label: loc('wiki_events_dhorde'), h_level: 2, 
            examples: [
                loc('event_demon_influx',[(3456).toLocaleString()])
            ]
        }, section);
        sideMenu('add',`major-events`,`dhorde`,loc('wiki_events_dhorde'));
    }

    {   // Ancient Ruins
        let section = infoBoxBuilder(mainContent,{ name: 'ruins', template: 'events', label: loc('wiki_events_ruins'), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                2: [loc(`resource_Iron_name`),loc(`resource_Copper_name`),loc(`resource_Steel_name`),loc(`resource_Cement_name`),'25%'],
            }
        });
        infoBoxBuilder(mainContent, { name: 'ruins_condition', template: 'events', label: loc('wiki_events_ruins'), paragraphs: 1, h_level: 2 }, section);
        infoBoxBuilder(mainContent, { name: 'ruins_examples', template: 'events', label: loc('wiki_events_ruins'), h_level: 2, 
            examples: [
                loc('event_ruins')
            ]
        }, section);
        sideMenu('add',`major-events`,`ruins`,loc('wiki_events_ruins'));
    }

    {   // Tax Revolt
        let section = infoBoxBuilder(mainContent,{ name: 'taxrevolt', template: 'events', label: loc('wiki_events_taxrevolt'), paragraphs: 2, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'taxrevolt_condition', template: 'events', label: loc('wiki_events_taxrevolt'), paragraphs: 3, break: [2], h_level: 2,
            para_data: {
                1: [`> 25%`,`< 100%`],
                2: [loc('govern_oligarchy'),`20%`],
                3: [loc('governor_noble'),`10%`]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'taxrevolt_examples', template: 'events', label: loc('wiki_events_taxrevolt'), h_level: 2, 
            examples: [
                loc('event_tax_revolt')
            ]
        }, section);
        sideMenu('add',`major-events`,`taxrevolt`,loc('wiki_events_taxrevolt'));
    }

    {   // Slave Death
        let section = infoBoxBuilder(mainContent,{ name: 'slave', template: 'events', label: loc('wiki_events_slave'), paragraphs: 2, break: [2], h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'slave_condition', template: 'events', label: loc('wiki_events_slave'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`trait_slaver_name`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'slave_examples', template: 'events', label: loc('wiki_events_slave'), h_level: 2, 
            examples: [
                loc(`event_slave_death1`),
                loc(`event_slave_death2`),
                loc(`event_slave_death3`),
                loc(`event_slave_none`)
            ]
        }, section);
        sideMenu('add',`major-events`,`slave`,loc('wiki_events_slave'));
    }

    {   // Protests
        let section = infoBoxBuilder(mainContent,{ name: 'protest', template: 'events', label: loc('wiki_events_protest'), paragraphs: 3, h_level: 2,
            para_data: {
                1: [loc('govern_republic')],
                2: ['30%'],
                3: [30,90],
            }
        });
        infoBoxBuilder(mainContent, { name: 'protest_condition', template: 'events', label: loc('wiki_events_protest'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`govern_republic`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'protest_examples', template: 'events', label: loc('wiki_events_protest'), h_level: 2, 
            examples: [
                loc(`event_protest0`,[housingLabel('small')]),
                loc(`event_protest1`),
                loc(`event_protest2`),
                loc(`event_protest3`),
                loc(`event_protest4`),
                loc(`event_protest5`),
                loc(`event_protest6`),
                loc(`event_protest7`),
                loc(`event_protest8`),
                loc(`event_protest9`)
            ]
        }, section);
        sideMenu('add',`major-events`,`protest`,loc('wiki_events_protest'));
    }

    {   // Scandals
        let section = infoBoxBuilder(mainContent,{ name: 'scandal', template: 'events', label: loc('wiki_events_scandal'), paragraphs: 2, h_level: 2,
            para_data: {
                1: [loc('governor_media')],
                2: ['8%',15,90]
            }
        });
        infoBoxBuilder(mainContent, { name: 'scandal_condition', template: 'events', label: loc('wiki_events_scandal'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc('governor_media')]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'scandal_examples', template: 'events', label: loc('wiki_events_scandal'), h_level: 2, 
            examples: [
                loc(`event_scandal0`),
                loc(`event_scandal1`),
                loc(`event_scandal2`),
                loc(`event_scandal3`),
                loc(`event_scandal4`),
                loc(`event_scandal5`),
                loc(`event_scandal6`),
                loc(`event_scandal7`),
                loc(`event_scandal8`),
                loc(`event_scandal9`)
            ]
        }, section);
        sideMenu('add',`major-events`,`scandal`,loc('wiki_events_scandal'));
    }

    {   // Spy Caught
        let section = infoBoxBuilder(mainContent,{ name: 'spy', template: 'events', label: loc('wiki_events_spy'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'spy_condition', template: 'events', label: loc('wiki_events_spy'), paragraphs: 1, h_level: 2 }, section);
        infoBoxBuilder(mainContent, { name: 'spy_examples', template: 'events', label: loc('wiki_events_spy'), h_level: 2, 
            examples: [
                loc(`event_spy`,[govTitle(1)])
            ]
        }, section);
        sideMenu('add',`major-events`,`spy`,loc('wiki_events_spy'));
    }

    {   // Mine Collapse
        let section = infoBoxBuilder(mainContent,{ name: 'mine_collapse', template: 'events', label: loc('wiki_events_mine_collapse'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'mine_collapse_condition', template: 'events', label: loc('wiki_events_mine_collapse'), paragraphs: 1, h_level: 2 }, section);
        infoBoxBuilder(mainContent, { name: 'mine_collapse_examples', template: 'events', label: loc('wiki_events_mine_collapse'), h_level: 2, 
            examples: [
                loc(`event_mine_collapse`)
            ]
        }, section);
        sideMenu('add',`major-events`,`mine_collapse`,loc('wiki_events_mine_collapse'));
    }

    {   // M Curious
        let section = infoBoxBuilder(mainContent,{ name: 'm_curious', template: 'events', label: loc('wiki_events_m_curious'), paragraphs: 6, break: [2,3,4,5,6], h_level: 2,
            para_data: {
                2: [
                    loc('wiki_events_m_curious_para2_note1',[(50000).toLocaleString(),(5000000).toLocaleString(),loc('resource_Money_name')]),
                    loc('wiki_events_m_curious_para2_note1',[100,(100000).toLocaleString(),loc('resource_Steel_name')]),
                    loc('wiki_events_m_curious_para2_note1',[250,(1000000).toLocaleString(),loc('resource_Alloy_name')]),
                    loc('wiki_events_m_curious_para2_note1',[100,(250000).toLocaleString(),loc('resource_Adamantite_name')]),
                    loc('wiki_events_m_curious_para2_note1',[500,(50000).toLocaleString(),loc('resource_Bolognium_name')]),
                    loc('wiki_events_m_curious_para2_note2',[1,loc('resource_Soul_Gem_name')])
                ],
                3: [10],
                4: [600,1200],
                5: ['5%',200,600],
                6: [loc('race_cath'),'10%',500,1000],
            }
        });
        infoBoxBuilder(mainContent, { name: 'm_curious_condition', template: 'events', label: loc('wiki_events_m_curious'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`trait_curious_name`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'm_curious_examples', template: 'events', label: loc('wiki_events_m_curious'), h_level: 2, 
            examples: [
                loc(`event_m_curious0`,[races[global.race.species].name,(444015).toLocaleString(),loc('resource_Alloy_name')]),
                loc(`event_m_curious1`,[races[global.race.species].name]),
                loc(`event_m_curious2`,[races[global.race.species].name]),
                loc(`event_m_curious3`,[races[global.race.species].name]),
                loc(`event_m_curious4a`,[loc('race_cath')]),
                loc(`event_m_curious4b`,[loc('race_octigoran')])
            ]
        }, section);
        sideMenu('add',`major-events`,`m_curious`,loc('wiki_events_m_curious'));
    }
}

export function minorEventsPage(content){
    let mainContent = sideMenu('create',content);
    
    {   // Intro
        let section = infoBoxBuilder(mainContent,{ name: 'minor_intro', template: 'events', paragraphs: 1, h_level: 2});
        infoBoxBuilder(mainContent,{ name: 'major_intro', template: 'events', paragraphs: 3, h_level: 2,
            para_data: {
                1: [loc(`wiki_menu_minor`),850,71],
                2: [loc(`wiki_menu_minor`)],
                3: [loc(`wiki_menu_minor`)]
            }
        }, section);
        sideMenu('add',`minor-events`,'minor_intro',loc('wiki_menu_intro'));
    }
    
    {   // Curious
        let section = infoBoxBuilder(mainContent,{ name: 'curious', template: 'events', label: loc('wiki_events_curious'), paragraphs: 2, break: [2], h_level: 2});
        infoBoxBuilder(mainContent, { name: 'curious_condition', template: 'events', label: loc('wiki_events_curious'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`trait_curious_name`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'curious_examples', template: 'events', label: loc('wiki_events_curious'), h_level: 2, 
            examples: [
                loc(`event_curious0`,[races[global.race.species].name]),
                loc(`event_curious1`,[races[global.race.species].name]),
                loc(`event_curious2`,[races[global.race.species].name]),
                loc(`event_curious3`,[races[global.race.species].name]),
                loc(`event_curious4`,[races[global.race.species].name]),
                loc(`event_curious5`,[races[global.race.species].name]),
                loc(`event_curious6`,[races[global.race.species].name]),
                loc(`event_curious7`,[races[global.race.species].name]),
                loc(`event_curious8`,[races[global.race.species].name]),
                loc(`event_curious9`,[races[global.race.species].name])
            ]
        }, section);
        sideMenu('add',`minor-events`,`curious`,loc('wiki_events_curious'));
    }
    
    {   // Slave Escape
        let section = infoBoxBuilder(mainContent,{ name: 'slave_escape', template: 'events', label: loc('wiki_events_slave_escape'), paragraphs: 2, break: [2], h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'slave_escape_condition', template: 'events', label: loc('wiki_events_slave_escape'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`trait_slaver_name`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'slave_escape_examples', template: 'events', label: loc('wiki_events_slave_escape'), h_level: 2, 
            examples: [
                loc(`event_slave_escape1`),
                loc(`event_slave_escape2`),
                loc(`event_slave_death4`),
                loc(`event_slave_none`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`slave_escape`,loc('wiki_events_slave_escape'));
    }
    
    {   // Shooting Star
        let section = infoBoxBuilder(mainContent,{ name: 'shooting_star', template: 'events', label: loc('wiki_events_shooting_star'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_shooting_star'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'shooting_star_examples', template: 'events', label: loc('wiki_events_shooting_star'), h_level: 2, 
            examples: [
                loc(`event_shooting_star`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`shooting_star`,loc('wiki_events_shooting_star'));
    }
    
    {   // Tumbleweed
        let section = infoBoxBuilder(mainContent,{ name: 'tumbleweed', template: 'events', label: loc('wiki_events_tumbleweed'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_tumbleweed'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'tumbleweed_examples', template: 'events', label: loc('wiki_events_tumbleweed'), h_level: 2, 
            examples: [
                loc(`event_tumbleweed`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`tumbleweed`,loc('wiki_events_tumbleweed'));
    }
    
    {   // Flashmob
        let section = infoBoxBuilder(mainContent,{ name: 'flashmob', template: 'events', label: loc('wiki_events_flashmob'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_flashmob'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_mad_science`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'flashmob_examples', template: 'events', label: loc('wiki_events_flashmob'), h_level: 2, 
            examples: [
                loc(`event_flashmob`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`flashmob`,loc('wiki_events_flashmob'));
    }
    
    {   // Heatwave
        let section = infoBoxBuilder(mainContent,{ name: 'heatwave', template: 'events', label: loc('wiki_events_heatwave'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`hot`)]
            }
        });
        infoBoxBuilder(mainContent, { name: 'heatwave_condition', template: 'events', label: loc('wiki_events_heatwave'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`),loc(`evo_challenge_cataclysm`),loc(`hot`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'heatwave_examples', template: 'events', label: loc('wiki_events_heatwave'), h_level: 2, 
            examples: [
                loc(`event_heatwave`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`heatwave`,loc('wiki_events_heatwave'));
    }
    
    {   // Coldsnap
        let section = infoBoxBuilder(mainContent,{ name: 'coldsnap', template: 'events', label: loc('wiki_events_coldsnap'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`cold`)]
            }
        });
        infoBoxBuilder(mainContent, { name: 'coldsnap_condition', template: 'events', label: loc('wiki_events_coldsnap'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`),loc(`evo_challenge_cataclysm`),loc(`cold`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'coldsnap_examples', template: 'events', label: loc('wiki_events_coldsnap'), h_level: 2, 
            examples: [
                loc(`event_coldsnap`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`coldsnap`,loc('wiki_events_coldsnap'));
    }
    
    {   // Cucumber
        let section = infoBoxBuilder(mainContent,{ name: 'cucumber', template: 'events', label: loc('wiki_events_cucumber'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_cucumber'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'cucumber_examples', template: 'events', label: loc('wiki_events_cucumber'), h_level: 2, 
            examples: [
                loc(`event_cucumber`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`cucumber`,loc('wiki_events_cucumber'));
    }
    
    {   // Planking
        let section = infoBoxBuilder(mainContent,{ name: 'planking', template: 'events', label: loc('wiki_events_planking'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_planking'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_mad_science`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'planking_examples', template: 'events', label: loc('wiki_events_planking'), h_level: 2, 
            examples: [
                loc(`event_planking`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`planking`,loc('wiki_events_planking'));
    }
    
    {   // Furryfish
        let section = infoBoxBuilder(mainContent,{ name: 'furryfish', template: 'events', label: loc('wiki_events_furryfish'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_furryfish'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'furryfish_examples', template: 'events', label: loc('wiki_events_furryfish'), h_level: 2, 
            examples: [
                loc(`event_furryfish`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`furryfish`,loc('wiki_events_furryfish'));
    }
    
    {   // Meteor Shower
        let section = infoBoxBuilder(mainContent,{ name: 'meteor_shower', template: 'events', label: loc('wiki_events_meteor_shower'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_meteor_shower'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'meteor_shower_examples', template: 'events', label: loc('wiki_events_meteor_shower'), h_level: 2, 
            examples: [
                loc(`event_meteor_shower`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`meteor_shower`,loc('wiki_events_meteor_shower'));
    }
    
    {   // Hum
        let section = infoBoxBuilder(mainContent,{ name: 'hum', template: 'events', label: loc('wiki_events_hum'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_hum'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_mad_science`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'hum_examples', template: 'events', label: loc('wiki_events_hum'), h_level: 2, 
            examples: [
                loc(`event_hum`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`hum`,loc('wiki_events_hum'));
    }
    
    {   // Bloodrain
        let section = infoBoxBuilder(mainContent,{ name: 'bloodrain', template: 'events', label: loc('wiki_events_bloodrain'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_bloodrain'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'bloodrain_examples', template: 'events', label: loc('wiki_events_bloodrain'), h_level: 2, 
            examples: [
                loc(`event_bloodrain`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`bloodrain`,loc('wiki_events_bloodrain'));
    }
    
    {   // Haunting
        let section = infoBoxBuilder(mainContent,{ name: 'haunting', template: 'events', label: loc('wiki_events_haunting'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_haunting'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_science`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'haunting_examples', template: 'events', label: loc('wiki_events_haunting'), h_level: 2, 
            examples: [
                loc(`event_haunting`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`haunting`,loc('wiki_events_haunting'));
    }
    
    {   // Mothman
        let section = infoBoxBuilder(mainContent,{ name: 'mothman', template: 'events', label: loc('wiki_events_mothman'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_mothman'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_science`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'mothman_examples', template: 'events', label: loc('wiki_events_mothman'), h_level: 2, 
            examples: [
                loc(`event_mothman`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`mothman`,loc('wiki_events_mothman'));
    }
    
    {   // Deja Vu
        let section = infoBoxBuilder(mainContent,{ name: 'dejavu', template: 'events', label: loc('wiki_events_dejavu'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'dejavu_condition', template: 'events', label: loc('wiki_events_dejavu'), paragraphs: 1, h_level: 2 }, section);
        infoBoxBuilder(mainContent, { name: 'dejavu_examples', template: 'events', label: loc('wiki_events_dejavu'), h_level: 2, 
            examples: [
                loc(`event_dejavu`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`dejavu`,loc('wiki_events_dejavu'));
    }
    
    {   // Dollar
        let section = infoBoxBuilder(mainContent,{ name: 'dollar', template: 'events', label: loc('wiki_events_dollar'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_dollar'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_currency`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'dollar_examples', template: 'events', label: loc('wiki_events_dollar'), h_level: 2, 
            examples: [
                loc(`event_dollar`,[6])
            ]
        }, section);
        sideMenu('add',`minor-events`,`dollar`,loc('wiki_events_dollar'));
    }
    
    {   // Pickpocket
        let section = infoBoxBuilder(mainContent,{ name: 'pickpocket', template: 'events', label: loc('wiki_events_pickpocket'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_pickpocket'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_currency`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'pickpocket_examples', template: 'events', label: loc('wiki_events_pickpocket'), h_level: 2, 
            examples: [
                loc(`event_pickpocket`,[9])
            ]
        }, section);
        sideMenu('add',`minor-events`,`pickpocket`,loc('wiki_events_pickpocket'));
    }
    
    {   // Bird
        let section = infoBoxBuilder(mainContent,{ name: 'bird', template: 'events', label: loc('wiki_events_bird'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_bird'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'bird_examples', template: 'events', label: loc('wiki_events_bird'), h_level: 2, 
            examples: [
                loc(`event_bird`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`bird`,loc('wiki_events_bird'));
    }
    
    {   // Contest
        let section = infoBoxBuilder(mainContent,{ name: 'contest', template: 'events', label: loc('wiki_events_contest'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_contest'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_science`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'contest_examples', template: 'events', label: loc('wiki_events_contest'), h_level: 2, 
            examples: [
                loc(`event_contest`,[loc('event_contest_place0'),loc('event_contest_type0')]),
                loc(`event_contest`,[loc('event_contest_place1'),loc('event_contest_type1')]),
                loc(`event_contest`,[loc('event_contest_place2'),loc('event_contest_type2')]),
                loc(`event_contest`,[loc('event_contest_place0'),loc('event_contest_type3')]),
                loc(`event_contest`,[loc('event_contest_place1'),loc('event_contest_type4')]),
                loc(`event_contest`,[loc('event_contest_place2'),loc('event_contest_type5')]),
                loc(`event_contest`,[loc('event_contest_place0'),loc('event_contest_type6')]),
                loc(`event_contest`,[loc('event_contest_place1'),loc('event_contest_type7')]),
                loc(`event_contest`,[loc('event_contest_place2'),loc('event_contest_type8')]),
                loc(`event_contest`,[loc('event_contest_place0'),loc('event_contest_type9')]),
            ]
        }, section);
        sideMenu('add',`minor-events`,`contest`,loc('wiki_events_contest'));
    }
    
    {   // Cloud
        let section = infoBoxBuilder(mainContent,{ name: 'cloud', template: 'events', label: loc('wiki_events_cloud'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_cloud'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'cloud_examples', template: 'events', label: loc('wiki_events_cloud'), h_level: 2, 
            examples: [
                loc(`event_cloud`,[loc('event_cloud_type0')]),
                loc(`event_cloud`,[loc('event_cloud_type1')]),
                loc(`event_cloud`,[loc('event_cloud_type2')]),
                loc(`event_cloud`,[loc('event_cloud_type3')]),
                loc(`event_cloud`,[loc('event_cloud_type4')]),
                loc(`event_cloud`,[loc('event_cloud_type5')]),
                loc(`event_cloud`,[loc('event_cloud_type6')]),
                loc(`event_cloud`,[loc('event_cloud_type7')]),
                loc(`event_cloud`,[loc('event_cloud_type8')]),
                loc(`event_cloud`,[loc('event_cloud_type9')]),
                loc(`event_cloud`,[loc('event_cloud_type10')])
            ]
        }, section);
        sideMenu('add',`minor-events`,`cloud`,loc('wiki_events_cloud'));
    }
    
    {   // Dark Cloud
        let section = infoBoxBuilder(mainContent,{ name: 'dark_cloud', template: 'events', label: loc('wiki_events_dark_cloud'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`rain`),loc(`snow`)]
            }
        });
        infoBoxBuilder(mainContent, { name: 'dark_cloud_condition', template: 'events', label: loc('wiki_events_dark_cloud'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`),loc(`evo_challenge_cataclysm`),loc(`rain`),loc(`snow`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'dark_cloud_examples', template: 'events', label: loc('wiki_events_dark_cloud'), h_level: 2, 
            examples: [
                loc(`event_dark_cloud`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`dark_cloud`,loc('wiki_events_dark_cloud'));
    }
    
    {   // Gloom
        let section = infoBoxBuilder(mainContent,{ name: 'gloom', template: 'events', label: loc('wiki_events_gloom'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`cloudy`)]
            }
        });
        infoBoxBuilder(mainContent, { name: 'gloom_condition', template: 'events', label: loc('wiki_events_gloom'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`),loc(`evo_challenge_cataclysm`),loc(`cloudy`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'gloom_examples', template: 'events', label: loc('wiki_events_gloom'), h_level: 2, 
            examples: [
                loc(`event_gloom`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`gloom`,loc('wiki_events_gloom'));
    }
    
    {   // Tracks
        let section = infoBoxBuilder(mainContent,{ name: 'tracks', template: 'events', label: loc('wiki_events_tracks'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_tracks'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'tracks_examples', template: 'events', label: loc('wiki_events_tracks'), h_level: 2, 
            examples: [
                loc(`event_tracks`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`tracks`,loc('wiki_events_tracks'));
    }
    
    {   // Hoax
        let section = infoBoxBuilder(mainContent,{ name: 'hoax', template: 'events', label: loc('wiki_events_hoax'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_hoax'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'hoax_examples', template: 'events', label: loc('wiki_events_hoax'), h_level: 2, 
            examples: [
                loc(`event_hoax`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`hoax`,loc('wiki_events_hoax'));
    }
    
    {   // Burial
        let section = infoBoxBuilder(mainContent,{ name: 'burial', template: 'events', label: loc('wiki_events_burial'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_burial'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'burial_examples', template: 'events', label: loc('wiki_events_burial'), h_level: 2, 
            examples: [
                loc(`event_burial`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`burial`,loc('wiki_events_burial'));
    }
    
    {   // Artifacts
        let section = infoBoxBuilder(mainContent,{ name: 'artifacts', template: 'events', label: loc('wiki_events_artifacts'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_artifacts'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_mad_science`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'artifacts_examples', template: 'events', label: loc('wiki_events_artifacts'), h_level: 2, 
            examples: [
                loc(`event_artifacts`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`artifacts`,loc('wiki_events_artifacts'));
    }
    
    {   // Parade
        let section = infoBoxBuilder(mainContent,{ name: 'parade', template: 'events', label: loc('wiki_events_parade'), paragraphs: 1, h_level: 2 
        });
        infoBoxBuilder(mainContent, { name: 'parade_condition', template: 'events', label: loc('wiki_events_parade'), paragraphs: 1, h_level: 2 
        }, section);
        infoBoxBuilder(mainContent, { name: 'parade_examples', template: 'events', label: loc('wiki_events_parade'), h_level: 2, 
            examples: [
                loc(`event_parade`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`parade`,loc('wiki_events_parade'));
    }
    
    {   // Crop Circle
        let section = infoBoxBuilder(mainContent,{ name: 'crop_circle', template: 'events', label: loc('wiki_events_crop_circle'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_crop_circle'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_agriculture`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'crop_circle_examples', template: 'events', label: loc('wiki_events_crop_circle'), h_level: 2, 
            examples: [
                loc(`event_crop_circle`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`crop_circle`,loc('wiki_events_crop_circle'));
    }
    
    {   // Llama
        let section = infoBoxBuilder(mainContent,{ name: 'llama', template: 'events', label: loc('wiki_events_llama'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [25,100]
            }
        });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_llama'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'llama_condition', template: 'events', label: loc('wiki_events_llama'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`trait_carnivore_name`),loc(`trait_soul_eater_name`),loc(`trait_detritivore_name`),loc(`trait_artifical_name`)]
            },
            data_link: {
                1: ['wiki.html#traits-species-genus_carnivore','wiki.html#traits-species-special_soul_eater','wiki.html#traits-species-genus_detritivore','wiki.html#traits-species-genus_artifical']
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'llama_examples', template: 'events', label: loc('wiki_events_llama'), h_level: 2, 
            examples: [
                loc(`event_llama`,[51])
            ]
        }, section);
        sideMenu('add',`minor-events`,`llama`,loc('wiki_events_llama'));
    }
    
    {   // Cat
        let section = infoBoxBuilder(mainContent,{ name: 'cat', template: 'events', label: loc('wiki_events_cat'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_cat'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'cat_examples', template: 'events', label: loc('wiki_events_cat'), h_level: 2, 
            examples: [
                loc(`event_cat`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`cat`,loc('wiki_events_cat'));
    }
    
    {   // Omen
        let section = infoBoxBuilder(mainContent,{ name: 'omen', template: 'events', label: loc('wiki_events_omen'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_omen'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'omen_examples', template: 'events', label: loc('wiki_events_omen'), h_level: 2, 
            examples: [
                loc(`event_omen`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`omen`,loc('wiki_events_omen'));
    }
    
    {   // Theft
        let section = infoBoxBuilder(mainContent,{ name: 'theft', template: 'events', label: loc('wiki_events_theft'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_theft'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'theft_examples', template: 'events', label: loc('wiki_events_theft'), h_level: 2, 
            examples: [
                loc(`event_theft`,[loc('event_theft_type0')]),
                loc(`event_theft`,[loc('event_theft_type1')]),
                loc(`event_theft`,[loc('event_theft_type2')]),
                loc(`event_theft`,[loc('event_theft_type3')]),
                loc(`event_theft`,[loc('event_theft_type4')]),
                loc(`event_theft`,[loc('event_theft_type5')]),
                loc(`event_theft`,[loc('event_theft_type6')]),
                loc(`event_theft`,[loc('event_theft_type7')]),
                loc(`event_theft`,[loc('event_theft_type8')]),
                loc(`event_theft`,[loc('event_theft_type9')])
            ]
        }, section);
        sideMenu('add',`minor-events`,`theft`,loc('wiki_events_theft'));
    }
    
    {   // Compass
        let section = infoBoxBuilder(mainContent,{ name: 'compass', template: 'events', label: loc('wiki_events_compass'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_compass'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_mining`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'compass_examples', template: 'events', label: loc('wiki_events_compass'), h_level: 2, 
            examples: [
                loc(`event_compass`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`compass`,loc('wiki_events_compass'));
    }
    
    {   // Bone
        let section = infoBoxBuilder(mainContent,{ name: 'bone', template: 'events', label: loc('wiki_events_bone'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_bone'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'bone_examples', template: 'events', label: loc('wiki_events_bone'), h_level: 2, 
            examples: [
                loc(`event_bone`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`bone`,loc('wiki_events_bone'));
    }
    
    {   // Delicacy
        let section = infoBoxBuilder(mainContent,{ name: 'delicacy', template: 'events', label: loc('wiki_events_delicacy'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_delicacy'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_mad_science`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'delicacy_examples', template: 'events', label: loc('wiki_events_delicacy'), h_level: 2, 
            examples: [
                loc(`event_delicacy`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`delicacy`,loc('wiki_events_delicacy'));
    }
    
    {   // Prank
        let section = infoBoxBuilder(mainContent,{ name: 'prank', template: 'events', label: loc('wiki_events_prank'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_prank'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'prank_examples', template: 'events', label: loc('wiki_events_prank'), h_level: 2, 
            examples: [
                loc(`event_prank`,[loc('event_prank_type0')]),
                loc(`event_prank`,[loc('event_prank_type1')]),
                loc(`event_prank`,[loc('event_prank_type2')]),
                loc(`event_prank`,[loc('event_prank_type3')]),
                loc(`event_prank`,[loc('event_prank_type4')]),
                loc(`event_prank`,[loc('event_prank_type5')]),
                loc(`event_prank`,[loc('event_prank_type6')]),
                loc(`event_prank`,[loc('event_prank_type7')]),
                loc(`event_prank`,[loc('event_prank_type8')]),
                loc(`event_prank`,[loc('event_prank_type9')])
            ]
        }, section);
        sideMenu('add',`minor-events`,`prank`,loc('wiki_events_prank'));
    }
    
    {   // Graffiti
        let section = infoBoxBuilder(mainContent,{ name: 'graffiti', template: 'events', label: loc('wiki_events_graffiti'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_graffiti'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_science`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'graffiti_examples', template: 'events', label: loc('wiki_events_graffiti'), h_level: 2, 
            examples: [
                loc(`event_graffiti`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`graffiti`,loc('wiki_events_graffiti'));
    }
    
    {   // Soul
        let section = infoBoxBuilder(mainContent,{ name: 'soul', template: 'events', label: loc('wiki_events_soul'), paragraphs: 1, h_level: 2 
        });
        infoBoxBuilder(mainContent, { name: 'soul_condition', template: 'events', label: loc('wiki_events_soul'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`trait_soul_eater_name`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'soul_examples', template: 'events', label: loc('wiki_events_soul'), h_level: 2, 
            examples: [
                loc(`event_soul`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`soul`,loc('wiki_events_soul'));
    }
    
    {   // Cheese
        let resets = global.stats.hasOwnProperty('reset') ? global.stats.reset + 1 : 1;
        let cheese = +(resets / (resets + 10) * 11).toFixed(2);
        let section = infoBoxBuilder(mainContent,{ name: 'cheese', template: 'events', label: loc('wiki_events_cheese'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [`${cheese}%`,10,9+resets]
            }});
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_cheese'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [swissKnife()]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'cheese_examples', template: 'events', label: loc('wiki_events_cheese'), h_level: 2, 
            examples: [
                loc(`event_cheese`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`cheese`,loc('wiki_events_cheese'));
    }
    
    {   // Tremor
        let section = infoBoxBuilder(mainContent,{ name: 'tremor', template: 'events', label: loc('wiki_events_tremor'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_tremor'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'tremor_examples', template: 'events', label: loc('wiki_events_tremor'), h_level: 2, 
            examples: [
                loc(`event_tremor`)
            ]
        }, section);
        sideMenu('add',`minor-events`,`tremor`,loc('wiki_events_tremor'));
    }
    
    {   // Rumor
        let section = infoBoxBuilder(mainContent,{ name: 'rumor', template: 'events', label: loc('wiki_events_rumor'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_rumor'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'rumor_examples', template: 'events', label: loc('wiki_events_rumor'), h_level: 2, 
            examples: [
                loc(`event_rumor`,[loc('event_rumor_type0')]),
                loc(`event_rumor`,[loc('event_rumor_type1')]),
                loc(`event_rumor`,[loc('event_rumor_type2')]),
                loc(`event_rumor`,[loc('event_rumor_type3')]),
                loc(`event_rumor`,[loc('event_rumor_type4')]),
                loc(`event_rumor`,[loc('event_rumor_type5')]),
                loc(`event_rumor`,[loc('event_rumor_type6')]),
                loc(`event_rumor`,[loc('event_rumor_type7')]),
                loc(`event_rumor`,[loc('event_rumor_type8')]),
                loc(`event_rumor`,[loc('event_rumor_type9')])
            ]
        }, section);
        sideMenu('add',`minor-events`,`rumor`,loc('wiki_events_rumor'));
    }

    {   // Pet
        let section = infoBoxBuilder(mainContent,{ name: 'pet', template: 'events', label: loc('wiki_events_pet'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'tech', template: 'events', label: loc('wiki_events_pet'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_club`)]
            }
        }, section);
        infoBoxBuilder(mainContent, { name: 'cat_examples', template: 'events', label: loc('wiki_events_pet'), h_level: 2, 
            examples: [
                loc(`event_pet_cat`,[loc(`event_cat_name3`)]),
                loc(`event_pet_dog`,[loc(`event_dog_name0`)])
            ]
        }, section);
        sideMenu('add',`minor-events`,`pet`,loc('wiki_events_pet'));
    }
}

export function progressEventsPage(content){
    let mainContent = sideMenu('create',content);
    
    {   // Intro
        infoBoxBuilder(mainContent,{ name: 'progress_intro', template: 'events', paragraphs: 3, h_level: 2});
        sideMenu('add',`progress-events`,'progress_intro',loc('wiki_menu_intro'));
    }
    
    {   // Steel Discovery Trade
        let section = infoBoxBuilder(mainContent,{ name: 'steel', template: 'events', label: loc('wiki_events_steel'), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                1: [loc(`resource_Steel_name`)],
                2: [`0.08%`]
            }
        });
        infoBoxBuilder(mainContent, { name: 'steel_condition', template: 'events', label: loc('wiki_events_steel'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`resource_Steel_name`)]
            }, 
            examples: [
                loc(`steel_sample`)
            ]
        }, section);
        sideMenu('add',`progress-events`,`steel`,loc('wiki_events_steel'));
    }
    
    {   // Elerium Discovery
        let section = infoBoxBuilder(mainContent,{ name: 'elerium', template: 'events', label: loc('wiki_events_elerium'), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                1: [loc(`resource_Elerium_name`),loc(`tech_elerium_mining`)],
                2: [loc(`space_belt_iron_ship_title`),loc(`space_belt_iridium_ship_title`),`0.4%`]
            },
            data_link: {
                1: [false,'wiki.html#deep_space-tech-elerium_mining'],
                2: ['wiki.html#space-structures-iron_ship','wiki.html#space-structures-iridium_ship']
            },
            examples: [
                loc(`discover_elerium`)
            ]
        });
        sideMenu('add',`progress-events`,`elerium`,loc('wiki_events_elerium'));
    }
    
    {   // Gas Moon Oil
        let section = infoBoxBuilder(mainContent,{ name: 'oil', template: 'events', label: loc('wiki_events_oil'), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                1: [loc(`resource_Oil_name`),getSolarName('gas_moon'),loc(`space_gas_moon_oil_extractor_title`)],
                2: [loc(`space_gas_moon_outpost_title`),`1%`]
            },
            data_link: {
                1: [false,false,'wiki.html#space-structures-oil_extractor'],
                2: ['wiki.html#space-structures-outpost']
            },
            examples: [
                loc(`discover_oil`,[getSolarName('gas_moon')])
            ]
        });
        sideMenu('add',`progress-events`,`oil`,loc('wiki_events_oil'));
    }
    
    {   // Pit Discovery
        let section = infoBoxBuilder(mainContent,{ name: 'pit', template: 'events', label: loc('wiki_events_pit'), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                1: [loc(`portal_pit_name`),loc(`tab_portal`),loc(`portal_pit_mission_title`)]
            },
            data_link: {
                1: [false,false,'wiki.html#hell-structures-pit_mission']
            },
        });
        infoBoxBuilder(mainContent, { name: 'pit_condition', template: 'events', label: loc('wiki_events_pit'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [(1000000).toLocaleString(),loc(`galaxy_telemetry_beacon`)]
            },
            data_link: {
                1: [false,'wiki.html#intergalactic-structures-telemetry_beacon']
            },
            examples: [
                loc(`portal_hell_pit_found`)
            ]
        }, section);
        sideMenu('add',`progress-events`,`pit`,loc('wiki_events_pit'));
    }
    
    {   // Alien Encounter
        let section = infoBoxBuilder(mainContent,{ name: 'alien_encounter', template: 'events', label: loc('wiki_events_alien_encounter'), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                1: [loc(`galaxy_scout_ship`),loc(`tech_xeno_linguistics`),loc(`galaxy_corvette_ship`)],
                2: [`10%`]
            },
            data_link: {
                1: ['wiki.html#intergalactic-structures-scout_ship','wiki.html#intergalactic-tech-xeno_linguistics','wiki.html#intergalactic-tech-corvette_ship']
            },
        });
        infoBoxBuilder(mainContent, { name: 'alien_encounter_condition', template: 'events', label: loc('wiki_events_alien_encounter'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`galaxy_scout_ship`)]
            },
            examples: [
                loc(`galaxy_encounter`)
            ]
        }, section);
        sideMenu('add',`progress-events`,`alien_encounter`,loc('wiki_events_alien_encounter'));
    }
    
    {   // Piracy Unlock
        let section = infoBoxBuilder(mainContent,{ name: 'piracy', template: 'events', label: loc('wiki_events_piracy'), paragraphs: 3, break: [3], h_level: 2,
            para_data: {
                2: [loc(`galaxy_piracy`)],
                3: [`20%`]
            },
            data_link: {
                2: ['wiki.html#mechanics-gameplay-piracy']
            }
        });
        infoBoxBuilder(mainContent, { name: 'piracy_condition', template: 'events', label: loc('wiki_events_piracy'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`galaxy_embassy`)]
            },
            data_link: {
                1: ['wiki.html#intergalactic-structures-embassy']
            },
            examples: [
                loc(`galaxy_piracy_msg`,[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name])
            ]
        }, section);
        sideMenu('add',`progress-events`,`piracy`,loc('wiki_events_piracy'));
    }
    
    {   // Alien Database
        let section = infoBoxBuilder(mainContent,{ name: 'alien_database', template: 'events', label: loc('wiki_events_alien_database'), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                1: [loc(`galaxy_scavenger`),loc(`tech_alien_database`)],
                2: [loc(`galaxy_scavenger`),`2%`]
            },
            data_link: {
                1: ['wiki.html#intergalactic-structures-scavenger']
            },
            examples: [
                loc(`galaxy_scavenger_find`)
            ]
        });
        sideMenu('add',`progress-events`,`alien_database`,loc('wiki_events_alien_database'));
    }
    
    {   // Corrupt Soul Gem
        let section = infoBoxBuilder(mainContent,{ name: 'corrupt_gem', template: 'events', label: loc('wiki_events_corrupt_gem'), paragraphs: 4, break: [2], h_level: 2,
            para_data: {
                1: [loc(`resource_Corrupt_Gem_name`),loc(`portal_soul_forge_title`)],
                2: [loc(`resource_Soul_Gem_name`),loc(`portal_soul_forge_title`),loc(`portal_soul_attractor_title`)],
                3: [`1/(11-X)`,`X`,loc(`portal_soul_attractor_title`)],
                4: [9,loc(`portal_soul_attractor_title`),`9.09%`,0,`50%`]
            },
            data_link: {
                1: [false,'wiki.html#hell-structures-soul_forge'],
                2: [false,false,'wiki.html#hell-structures-soul_attractor']
            }
        });
        infoBoxBuilder(mainContent, { name: 'corrupt_gem_condition', template: 'events', label: loc('wiki_events_corrupt_gem'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_metaphysics`)]
            },
            data_link: {
                1: ['wiki.html#intergalactic-tech-metaphysics']
            },
            examples: [
                loc(`portal_corrupt_gem`)
            ]
        }, section);
        sideMenu('add',`progress-events`,`corrupt_gem`,loc('wiki_events_corrupt_gem'));
    }
    
    {   // Vault Discovery
        let section = infoBoxBuilder(mainContent,{ name: 'vault_find', template: 'events', label: loc('wiki_events_vault_find'), paragraphs: 3, break: [2], h_level: 2,
            para_data: {
                1: [loc(`job_archaeologist`),loc(`portal_vault_title`),loc(`portal_ruins_name`)],
                2: [loc(`job_archaeologist`),`2.5%`],
                3: [loc(`job_archaeologist`),loc(`portal_ruins_supressed`),loc(`portal_ruins_name`),`0%`,`2.5%`,`100%`]
            },
            data_link: {
                1: [false,'wiki.html#hell-structures-vault']
            },
            examples: [
                loc(`portal_ruins_vault`)
            ]
        });
        sideMenu('add',`progress-events`,`vault_find`,loc('wiki_events_vault_find'));
    }
    
    {   // Syndicate Unlock
        let section = infoBoxBuilder(mainContent,{ name: 'syndicate', template: 'events', label: loc('wiki_events_syndicate'), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                1: [loc('tech_shipyard',[getSolarName('dwarf')])],
                2: [`5%`]
            },
            data_link: {
                1: ['wiki.html#solar-tp_tech-shipyard']
            },
        });
        infoBoxBuilder(mainContent, { name: 'syndicate_condition', template: 'events', label: loc('wiki_events_syndicate'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`tech_long_range_probes`)]
            },
            data_link: {
                1: ['wiki.html#solar-tp_tech-long_range_probes']
            },
            examples: [
                loc(`outer_syndicate`,[loc(`civics_gov5`,[loc(`civics_gov_name1`)])])
            ]
        }, section);
        sideMenu('add',`progress-events`,`syndicate`,loc('wiki_events_syndicate'));
    }
}

export function specialEventsPage(content){
    let mainContent = sideMenu('create',content);
    
    {   // Intro
        infoBoxBuilder(mainContent,{ name: 'special_intro', template: 'events', paragraphs: 3, h_level: 2,
            para_data: {
                3: [loc('boring')],
            }
        });
        sideMenu('add',`special-events`,'special_intro',loc('wiki_menu_intro'));
    }
    
    {   // Friday the 13th
        let event = 'crystal';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                2: [loc('feat_friday_name')],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // Valentine's Day
        let event = 'valentine';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 3, break: [2,3], h_level: 2,
            para_data: {
                2: [loc('feat_love_name')],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // Unlucky
        let event = 'unlucky';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                2: [loc('feat_leprechaun_name')],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // April Fools Day
        let event = 'fool';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                2: [loc('feat_fool_name')],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {
        let easter = eventActive('easter');
        {   // Hopper
            let event = 'hopper';
            let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
                para_data: {
                    2: [loc('feat_easter_name')],
                }
            });
            infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
                para_data: {
                    1: [`${loc(`month${easter.date[0]}`)} ${easter.date[1]}`],
                }
            }, section);
            sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
        }

        {   // Egg Hunt
            let event = 'egghunt';
            let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 7, break: [2,3,4,6], h_level: 2,
                para_data: {
                    2: [loc('feat_egghunt_name'),12,18],
                    5: [loc('trait_hyper_name'),loc('trait_fast_growth_name'),loc('trait_rainbow_name'),loc('trait_optimistic_name')],
                    7: [loc('trait_cannibalize_name'),loc('trait_rage_name'),loc('trait_blood_thirst_name'),loc('trait_sticky_name')],
                }
            });

            let hints = [
                `U2FsdGVkX1/PcdpekGFnkjSSCBa9yVo3z5xq3a2662iSlAA8yuaPEsK4Qyn5OSED`,
                `U2FsdGVkX180d8+Fl8mi96tY7KHkOWLkO0syi+BeZW47ga9AdJiBdbsksLaMTGvT`,
                `U2FsdGVkX19hHAatSiZiYe33Hx4u+bixNx4U7O4smhKVb/a+umB6MlIbgM3eE3UG`,
                `U2FsdGVkX188sIGEBwWHyzf0SkKQ027dzHZmkJp93FeXrXu70hD0KqYfoTxnbGqU`,
                `U2FsdGVkX18dLIKZyFStCpVKJrFAc36LF4uNcpuJd8CGU0yC1rPllsNfBHAhrfwT`,
                `U2FsdGVkX1/ZRiMKl3kG4PUQOx8bdgz7va6bLW3Gf5COBHAs7CMDITt7SDeIygvd`,
                `U2FsdGVkX19FZ4kZmquyj6NUTqo+AYS7U31mSik1W2Awdp5M6L1WlsG4Px8uUYUN`,
                `U2FsdGVkX1+9Eh/34O02cW0SuZg0rQYZnomSBjBQU4Q3VSU0y62ypmoJNjOb5Uix`,
                `U2FsdGVkX1+3qtRH9MVd1B8T+JP5DgnlER6u8P60vX/NVjLGuceG7DX+b2yPW3J5`,
                `U2FsdGVkX18JYj4R4QuZBpDdcsEjkYPAf3uNNIzu6Vs=`,
                `U2FsdGVkX1+Eq43UVbtPlveU6HqIU8PSHL8QH+FlUxWkhyB1S+QAVVM2z0OryeJd`,
                `U2FsdGVkX18brcDy1P4HEGkmTw5t19CgWEshDFRSByELjSG9MtvSdSBbj13JhYuG`,
                `U2FsdGVkX1/vr39YAfqKcFM7c8ed6Oi7lRrDYKDtfUJRKF3pcrIRAWc4FF/Tt5BjwaXOi0slDE9JmeIDifD2gw==`,
                `U2FsdGVkX19KtuHoWRLTz0wLH8D/fLoOriDsmk6agzT85xsAAXv26ILjSV2C8mpi`,
                `U2FsdGVkX18/Tyjq6czHYJKjJQPXcRCgqmZqu2AFmx2FddfQPzM+YkXXECLMVA+e`,
                `U2FsdGVkX19kn6Hj9vQq5JxU9dsKsu0U+qADHauwh7TPf1enfhF1VQamBs7VFuX5`,
                `U2FsdGVkX19ICmvq9eubXYyGpmRML9aqTzBZMRvvOWFMwp2IiJBUUpl4LgLJOwLqnEISPAepbrdrfJn8miQIgA==`,
                `U2FsdGVkX19P0vr33mSfkSTDVz7N3a59YF5Cc+/NMC0f1tT3fXJDLqZMi98gGOrv`
            ];

            let solutions = [
                `U2FsdGVkX1+duY7hvIoeOGqas8WhBy8hojTLQ0OxadHBEDzOPwpc4K1Y6N+WyDah`,
                `U2FsdGVkX1+AQhvu619WY9xow4HmruRn5yJefuIkv3u7U6baVdV/mHLJfUaNmTE6`,
                `U2FsdGVkX1/whjtke2hryY9zWuV0MTzN2JKXaFyzwJXwtEx9+iLMbHkdVFwi6h63`,
                `U2FsdGVkX18FBXNUeu4NIIiy4Mmk++iyUIJKxFS/mZvAj98+eJR+SZj8xpXHTkia`,
                `U2FsdGVkX1/Imw6q6mixFM1BlgToue0NUqbCTHKuNZFHC1Vp7I934fUpj/xCFg33`,
                `U2FsdGVkX18h03LNWLTF59y343iStuLaS/0cgvLtKSMzm8UpzMVWBxwkGGSxDDPO`,
                `U2FsdGVkX18+W3R7IyisKi9TgzbkQ/636SJ7ubGsCx6Rz5GMxlTkbTVbOG6YFAC4Cle0TjI1riEzpGQtuCr6C+1mX3FdCLVz3oaGWqIajvI=`,
                `U2FsdGVkX18CjBzSHSIPZ07ZgvI6JgGiVIJE4ugYa2xWFeM1a/OnXrMT1sBpwmXwiHayBp1tdw83/4I55pGwpA==`,
                `U2FsdGVkX1+QWybO+rnrqxI23qXSKzevq0C/NPkX8/kd5h0xo20ozmxo4Pknui3G`,
                `U2FsdGVkX1//2GoF+3kVNPim1ThpVMgMCHEzSH0UZCrc4EIjktoxBC87gXddwhZR`,
                `U2FsdGVkX1/HQFE7BGTMIHN8G4pljsZlwtFaXHZh2U/VN4DD8lOL4OUYxnJUGr+g`,
                `U2FsdGVkX1/f1jFsIVKmxsXq85PuOj+fq+9WtYf1AZbPsuChio/XV6mpCxlTJz8X`,
                `U2FsdGVkX1+NRsztgBjDQeevIAYiHJ+X9dUERkDoYpLcvYAvWWzVvbjk4uq4dSMPEuykMqsZGGwvBtl1V0T+pO254xK8+5xWjZYnE9x6A+I=`,
                `U2FsdGVkX1//Crqk3ZOt8MHG/C4V91VEORQ3rQe4CEBHQhqfMD84PrEBZkwN7VpKvBgcg+2FsDknW+LDnNPIZA==`,
                `U2FsdGVkX1/bUrGTAmEkt6ukJKG8tIAIUVr4fnMFPsdamUtLJBGIG2dwQyaYywTD`,
                `U2FsdGVkX1/zl2y8RCXettY8EAPFE+cc/qImK4n5BocvEV2YvFKSyrOGxfLd3qBD`,
                `U2FsdGVkX19GszY2Yf01gUZnzs9F51vUgYu/FlRIPiFt9zasXhFP9tzX1en5/483mZeqi/uNRhV+zfoHd6qcYA==`,
                `U2FsdGVkX1+4syPwX9UT2KAsJj8uv43olf/GOTOudd/RbwnHsybitwYU4kk2ZVWx`
            ];

            const date = new Date();
            const year = date.getFullYear();
            const passphrase = 'egghunt';
            let eggs = `<div class="has-text-warning">${loc('wiki_feat_egghunt_found')}</div>`;
            eggs = eggs + `<div class="tbl">`;
            for (let i=1; i<=18; i++){
                let egg = global.special.egg.hasOwnProperty(year) && global.special.egg[year][`egg${i}`] ? 'has-text-success' : 'has-text-danger';
                let found = global.special.egg.hasOwnProperty(year) && global.special.egg[year][`egg${i}`] ? 'found' : 'missing';
                
                let hint = `<span class="tcell">${loc('wiki_events_hint_avail')} ${loc(`month${easter.hintDate[0]}`)} ${easter.hintDate[1]}</span>`;
                if (easter.hint){
                    const bytes = CryptoJS.AES.decrypt(hints[i-1], passphrase);
                    hint = `<span class="tcell">` + bytes.toString(CryptoJS.enc.Utf8) + `</span>`;
                }

                let sol = `<span class="tcell">${loc('wiki_events_sol_avail')} ${loc(`month${easter.solveDate[0]}`)} ${easter.solveDate[1]}</span>`;
                if (easter.solve){
                    sol = `<span class="tcell eggsol" data-sol="${solutions[i-1]}">${loc('wiki_events_reveal_sol')}</span>`;
                }

                eggs = eggs + `<div class="trow"><span role="img" class="tcell ${egg}" aria-label="${loc('wiki_feat_egghunt_num',[i])} ${found}">${loc('wiki_feat_egghunt_num',[i])}</span>${hint}${sol}</div>`
            }
            eggs = eggs + `</div>`;
            section.append(eggs);

            $(`.eggsol`).on('click', function(){
                const solution = $(this).attr('data-sol');
                const bytes = CryptoJS.AES.decrypt(solution, passphrase);
                $(this).html(bytes.toString(CryptoJS.enc.Utf8));
            });

            infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
                para_data: {
                    1: [`${loc(`month${easter.date[0]}`)} ${easter.date[1]}`, `${loc(`month${easter.endDate[0]}`)} ${easter.endDate[1]}`],
                }
            }, section);
            sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
        }
    }

    {   // Launch Day
        let event = 'launch_day';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 3, break: [2,3], h_level: 2,
            para_data: {
                2: [loc('feat_launch_day_name')],
                3: [`5%`],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // Solstice
        let thermite = global.hasOwnProperty('stats') ? 100000 + global.stats.reset * 9000 : 100000;
        if (thermite > 1000000){ thermite = 1000000; }

        let event = 'solstice';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 4, break: [2,3,4], h_level: 2,
            para_data: {
                1: [(thermite).toLocaleString(),loc(`wiki_events_${event}`)],
                2: [loc('feat_solstice_name')]
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // Firework
        let thermite = global.hasOwnProperty('stats') ? 100000 + global.stats.reset * 9000 : 100000;
        if (thermite > 1000000){ thermite = 1000000; }

        let event = 'firework';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                2: [loc('feat_firework_name')]
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // Halloween
        let event = 'halloween';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                2: [loc('feat_boo_name')],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // Trick or Treat
        let halloween = eventActive('halloween');

        let event = 'trickortreat';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 3, break: [2,3], h_level: 2,
            para_data: {
                2: [loc('feat_trickortreat_name'),12],
            }
        });

        let candy_hints = [
            `U2FsdGVkX1/PDiFXguD51NL4kEt4e9qRJwl5IKNCQE9vI3XAoH5gDW28r2V4O5GY`,
            `U2FsdGVkX18xhhpvSSA7YALgn1lm1e+GylSzgVdoTnLXMzPLL1knLlINAS8l5ECGfvjo6CDFYnuvqaw/8BugAw==`,
            `U2FsdGVkX18g9cYmSZKe/VjFeCjuODnwnD+i+2ShpdeMI4uIIzbllcQFIWJaQw+EvsDu5DFBNCEuFOsWRFVMyA==`,
            `U2FsdGVkX1+nD+SyHpi39fhqppxDiF+UhJh3w0dhZ4IxuC1s3h0gTrgBI7IxVLrQ`,
            `U2FsdGVkX1+OfTMTHGhIpqmihvW7fMCt0q+bLWqhd7Z0Cj31jNUqmvBcxb6HzbGc4mL/msBX6PO5zpb4pBUzwA==`,
            `U2FsdGVkX1+hC03MwAyWdqH6ODAGNbgm7CRgC+0Wfreja2JZX7oPwYhPmfQXzn1RfeIncnkRTmdXGMqQ/mq2GQ==`,
            `U2FsdGVkX18cU5HWOtwNhFSnlxBHxpu5XEJBFj3EhtzU/PLXxynq5Rq9YGl23QNr`,
        ];

        let candy_solutions = [
            `U2FsdGVkX1/bQrTdTtuTtXbxmJvxhHdsacfjyPKgyzXzthWNTsjaxqcCKjwjqCyG`,
            `U2FsdGVkX19tP6ZlSqvfdg6qaoOceA6978unLN8j9VIm5LUJSHUZm77zK1i1rWq3`,
            `U2FsdGVkX18Ex9HXV1+h+DIdFBxpNPI4Gl0E0EwOFbpyncN5gEfS8fWURvPT11S66x4swlZjnntbhMvDG+4SWg==`,
            `U2FsdGVkX1+xyixviw9PD/sRskoRG9owodNkZlwcAMSzQXe2PdAJPLwEBV9knjgGg11ws2eEBHXj7Y5j5SS7br+Uehaaj0MViyfxYdsZOEQ=`,
            `U2FsdGVkX18+2YEr0TG80mQY483i7yOr+Qnh66mOKEviX0ElRHI9VCha9TG+no1r`,
            `U2FsdGVkX1/Vuthb9MYQT02lO0ngkSI4f1tbvrrCwtVQiUTSIaVgDHVYYcIgfSl3WfiRhwGJWeP/6w+i7FEqaA==`,
            `U2FsdGVkX1/3Zbp0Tlqh/n5TKvOJEIuaf9/DcDFlDz1s2Tb+qbUS1GmPTzpP3xLu`
        ];

        let ghost_hints = [
            `U2FsdGVkX18m9z0oToDhhhmI0ugH5ykCrV1z64upZad/LXRYaFAyDT+O15+BXmJUKv7yY4YiBS6SYc65LJQjwEkMY5orIcyusiXtY9xnpRY=`,
            `U2FsdGVkX18eejrZNi9yF98CBO4KWjBLzo8HTBagKST0kjPmH48UuPWKG7Y3qyfeUyAFuDBnNRgdbgXXcWVPTE+3tbqcRiqAUZF8iLhXbmY=`,
            `U2FsdGVkX1/RKcVkvhY8bsGcXAQX3xJH4Ns/tUctQzK58oI9LJBxzIDyOHlPatn49avqw8r5lEmWyJOL2wyUjUPlYR/C9CjtO8t8oBW4ymWZRi66Ia0z1tMRHZyamonp`,
            `U2FsdGVkX18fvaoGr3U+o/m+xJLnbmVKJ1/GjNERP1ZDotBG7lD7vCtB1XyrCV0CvZXI9WK3r+FLD4rc7ZsLav77MTvQY+3pmwTYB841IxkUGCRE2mQYcr01xtxOPxMBMppChSZ8KJFgzfLhxL2rog==`,
            `U2FsdGVkX18MRMhu9I4km+hryh9dnvVBSkHdUPBgyHnKLsRB8PxpcJSFNq9b0plJ`,
            `U2FsdGVkX18IDZ0hUGT3xuDSi9EVacctj7h0BThWEgzIovJAieOvqXg/0wrZWHXQvyyVMsQtOdBls2nDjryxiw==`,
            `U2FsdGVkX1891SskU89HRmZPzhBcScrDGfGpJsp8F1qgVnsuON0h6WL69wEF9/uEpRi393mOXOrubNYVFzRgjwqERT3G/f6u/4bWXGSLpS8=`,
        ];

        let ghost_solutions = [
            `U2FsdGVkX19wIpvvED4RfWp5UAJfJvmnyhdkqsfr3BlVH5YEdjGNy4mcTvuvuY/92b6F3aQJHx0vunDJ64hcezPUAM5P+E/iROMQoMDCTJwwni6SRCpJggAHSOBTovW0piVAnyt6WHsjiAmVQVo8Og==`,
            `U2FsdGVkX1+bLPNq0l72utbOUTZ+JAXIUcGrrXVneoHD/GTbFy4jqDcU++SxaFih2aKODyZx3/SPbm0pd4JIQlu3xgl/demBDPj7TRbatEOM7aTBJhke5jwSYuIPTwWm8eyO0FINhZqO94pV4BFmcYv7b1lkzFgiLEOX/5kV/qE=`,
            `U2FsdGVkX1/QQZqQ4S2CvR3IQFL5D1pWbqrntie8JAuZrYUIQoke13j6xzI3A2KVG3lE+IZZo6Ktn2zKJ8diaroUUB/CIP0DvewzzbNj7XT3d9G456ELSMjjgb8pKc586Mq661bEjCqm+Tz2DoMLtnzMaVIXPhqBBFutt2U7JwERvNiwBkX2YhyOD3QO/tcPmwKzLJ+cYjIDSEHeCVl/yeistKb5pQbrmPH4wHAKbVQNaiaOvIjee0wqttzpmcnNgx4axIi2FAqPpT2s1hHAmhUmeV0HKDxYQWgfntqRhe/k4ar1vrZ2QdhLozqDe35S`,
            `U2FsdGVkX1+Z3/SLqEmoDq377QCt49UMTneD9zo6FqTfFOab0SWGG8ioBZ1z+/v422HygjnuwD341scmcTuA/4Pz9APy3FQcCqA5Fw4hDed+LvjrecqEZogyCw1WVaCItGXZW9+TXM0/y6p7VXvuyw==`,
            `U2FsdGVkX19CLOS3ivLPeqIYtjSBdW1WT4UFvJjNDto6jy9751Q73OZF2JQlhgKyayhswWuEk+JGbYwLbDbWhJgZUR/R9hYJnw8/Wcay4eM=`,
            `U2FsdGVkX19Pm5I9mqzijXCNM3dk4ut0IDPpownMePohkcfE6jsuLA0dgzv9vp5tjEVPaUD/bqMgEzsD9svhOEJd+zlslkqIsBee6EJTO/4=`,
            `U2FsdGVkX19TcqGI2bk6XYN40buKCGWH58AjMFDNE/jawAK+II3s6TvoVCcXbZsKzLF2++aeUgq6Ag+TysbSf5/T3IHeqQQnjFGIkkzlmMJH9wROKLirkPSzsw8O6J1J`,
        ];

        const date = new Date();
        const year = date.getFullYear();
        const passphrase = 'trickortreat';

        let treats = `<div class="has-text-warning">${loc('wiki_feat_trick_found')}</div>`;
        treats = treats + `<div class="tbl">`;
        for (let i=1; i<=candy_hints.length; i++){
            let treat = global.special.trick.hasOwnProperty(year) && global.special.trick[year][`treat${i}`] ? 'has-text-success' : 'has-text-danger';
            let found = global.special.trick.hasOwnProperty(year) && global.special.trick[year][`treat${i}`] ? 'found' : 'missing';
            
            let hint = `<span class="tcell">${loc('wiki_events_hint_avail')} ${loc(`month${halloween.hintDate[0]}`)} ${halloween.hintDate[1]}</span>`;
            if (halloween.hint){
                const bytes = CryptoJS.AES.decrypt(candy_hints[i-1], passphrase);
                hint = `<span class="tcell">` + bytes.toString(CryptoJS.enc.Utf8) + `</span>`;
            }

            treats = treats + `<div class="trow"><span role="img" class="tcell ${treat}" aria-label="${loc('wiki_feat_treat_num',[i])} ${found}">${loc('wiki_feat_treat_num',[i])}</span>${hint}</div>`

            let sol = `<span class="tcell">${loc('wiki_events_sol_avail')} ${loc(`month${halloween.solveDate[0]}`)} ${halloween.solveDate[1]}</span>`;
            if (halloween.solve){
                sol = `<span class="tcell totsol" data-sol="${candy_solutions[i-1]}">${loc('wiki_events_reveal_sol')}</span>`;
            }

            treats = treats + `<div class="trow"><span class="tcell"></span>${sol}</div>`
        }
        treats = treats + `</div>`;
        section.append(treats);

        let tricks = `<div class="has-text-warning">${loc('wiki_feat_treat_found')}</div>`;
        tricks = tricks + `<div class="tbl">`;
        for (let i=1; i<=ghost_hints.length; i++){
            let trick = global.special.trick.hasOwnProperty(year) && global.special.trick[year][`trick${i}`] ? 'has-text-success' : 'has-text-danger';
            let found = global.special.trick.hasOwnProperty(year) && global.special.trick[year][`trick${i}`] ? 'found' : 'missing';
            
            let hint = `<span class="tcell">${loc('wiki_events_hint_avail')} ${loc(`month${halloween.hintDate[0]}`)} ${halloween.hintDate[1]}</span>`;
            if (halloween.hint){
                const bytes = CryptoJS.AES.decrypt(ghost_hints[i-1], passphrase);
                hint = `<span class="tcell">` + bytes.toString(CryptoJS.enc.Utf8) + `</span>`;
            }

            tricks = tricks + `<div class="trow"><span role="img" class="tcell ${trick}" aria-label="${loc('wiki_feat_trick_num',[i])} ${found}">${loc('wiki_feat_trick_num',[i])}</span>${hint}</div>`

            let sol = `<span class="tcell">${loc('wiki_events_sol_avail')} ${loc(`month${halloween.solveDate[0]}`)} ${halloween.solveDate[1]}</span>`;
            if (halloween.solve){
                sol = `<span class="tcell totsol" data-sol="${ghost_solutions[i-1]}">${loc('wiki_events_reveal_sol')}</span>`;
            }

            tricks = tricks + `<div class="trow"><span class="tcell"></span>${sol}</div>`
        }
        tricks = tricks + `</div>`;
        section.append(tricks);

        $(`.totsol`).on('click', function(){
            const solution = $(this).attr('data-sol');
            const bytes = CryptoJS.AES.decrypt(solution, passphrase);
            $(this).html(bytes.toString(CryptoJS.enc.Utf8));
        });

        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                1: [`${loc(`month${halloween.date[0]}`)} ${halloween.date[1]}`, `${loc(`month${halloween.endDate[0]}`)} ${halloween.endDate[1]}`],
            }
        }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // Thanksgiving
        let event = 'turkey';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 3, break: [2,3], h_level: 2,
            para_data: {
                2: [loc('feat_gobble_gobble_name')],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // Holiday Elf Season
        let event = 'festive';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 1, h_level: 2 });

        ['elven','centaur','capybara','wendigo','yeti','entish'].forEach(function(species){
            infoBoxBuilder(section,{ name: species, template: `events_${event}`, label: loc(`wiki_events_${event}`), paragraphs: 2, h_level: 0,
                para_data: {
                    1: [loc(`race_${species}`)],
                }
            });
        });

        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // XMas
        let event = 'xmas';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 6, break: [2,3,4,5,6], h_level: 2,
            para_data: {
                2: [loc('feat_xmas_name')],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 1, h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }
}
