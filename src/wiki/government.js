import { loc } from './../locale.js';
import { sideMenu, infoBoxBuilder } from './functions.js';

export function govPage(content){
    let mainContent = sideMenu('create',content);

    infoBoxBuilder(mainContent,{ name: 'info', template: 'government', label: loc('tab_gov'), paragraphs: 8, break: [3,6], h_level: 2,
        para_data: {
            2: [loc('govern_anarchy')],
            3: [loc('civics_revolution')],
            4: [loc('civics_revolution')],
            5: [1000]
        },
        data_color: { 2: ['caution'] }
    });
    sideMenu('add',`government-gameplay`,`info`,loc('tab_gov'));

    let govs = {
        anarchy: {
            paragraphs: 5,
            break: [2,5],
            para_data: {
                2: [10],
                3: ['10th','0.25%','1/2']
            }
        },
        autocracy: {
            paragraphs: 4,
            break: [2,4],
            para_data: {
                2: ['35%','25%'],
                3: ['18%',loc('tech_electricity'),'10%',loc('tech_virtual_reality')]
            },
            para_color: {}
        },
        democracy: {
            paragraphs: 6,
            break: [2,5],
            para_data: {
                2: [loc('job_entertainer'),'20%'],
                3: [loc('job_entertainer')],
                4: ['25%',loc('tech_electricity'),'30%',loc('tech_virtual_reality')],
                5: ['5%'],
                6: [
                    loc('job_farmer'),loc('job_lumberjack'),loc('job_quarry_worker'),loc('job_miner'),loc('job_crystal_miner'),
                    loc('job_coal_miner'),loc('job_cement_worker'),loc('job_professor'),loc('job_scientist'),loc('soldiers')
                ]
            }
        },
        oligarchy: {
            paragraphs: 5,
            break: [2,4,5],
            text: {
                1: `govern_oligarchy_desc`,
                2: `govern_oligarchy_effect`
            },
            para_data: {
                2: [5,20],
                3: ['2%',loc('tech_electricity'),loc('tech_virtual_reality')],
                4: ['45%'],
                5: ['0.5%','20%']
            }
        },
        theocracy: {
            paragraphs: 7,
            break: [2,6,7],
            para_data: {
                2: ['12%'],
                3: ['25%'],
                4: ['50%'],
                6: ['40%',loc('tech_virtual_reality'),'25%',loc('tech_metaphysics')]
            }
        },
        republic: {
            paragraphs: 7,
            break: [2,5,6],
            para_data: {
                2: ['25%'],
                3: ['20%'],
                5: ['30%',loc('tech_virtual_reality'),'40%',loc('tech_metaphysics')],
                6: ['30%'],
                7: [30,90],
            },
            para_color: {}
        },
        socialist: {
            paragraphs: 6,
            break: [2,6],
            para_data: {
                2: ['35%'],
                3: ['10%'],
                4: ['10%'],
                5: ['20%'],
                6: ['42%',loc('tech_virtual_reality'),'50%',loc('tech_metaphysics')]
            },
        },
        corpocracy: {
            paragraphs: 9,
            break: [2,8,9],
            para_data: {
                2: ['50%'],
                3: ['200%'],
                4: ['150%'],
                5: ['100%'],
                6: ['10%'],
                7: ['30%'],
                8: ['5%',loc('tech_virtual_reality')],
                9: ['40%',loc('tech_metaphysics')]
            }
        },
        technocracy: {
            paragraphs: 5,
            break: [2,4],
            para_data: {
                2: ['8%'],
                3: ['10%'],
                4: ['2%'],
                5: ['1%',loc('tech_virtual_reality'),loc('tech_metaphysics')]
            }
        },
        federation: {
            paragraphs: 7,
            break: [2,5,6],
            para_data: {
                2: ['3%'],
                4: [5],
                5: ['10%'],
                6: ['25%','32%'],
                7: ['36%',loc('tech_virtual_reality'),'40%',loc('tech_metaphysics')]
            }
        },
        magocracy: {
            paragraphs: 5,
            break: [2,3,5],
            para_data: {
                2: ['25%'],
                3: ['25%'],
                4: ['40%',loc('tech_virtual_reality'),'50%',loc('tech_metaphysics')]
            }
        }
    };

    Object.keys(govs).forEach(function (gov){
        infoBoxBuilder(mainContent,{ name: gov, template: 'government', label: loc(`govern_${gov}`), paragraphs: govs[gov].paragraphs, break: govs[gov].break, h_level: 2,
            text: govs[gov].hasOwnProperty('text') ? govs[gov].text : {
                1: `govern_${gov}_desc`
            },
            para_data: govs[gov].hasOwnProperty('para_data') ? govs[gov].para_data : {},
            para_color: govs[gov].hasOwnProperty('para_color') ? govs[gov].para_color : {},
        });
        sideMenu('add',`government-gameplay`,gov,loc(`govern_${gov}`));
    });
}
