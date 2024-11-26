import { global } from './../vars.js';
import { loc } from './../locale.js';
import { govActive } from './../governor.js';
import { sideMenu, infoBoxBuilder, resourceName } from './functions.js';

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
                2: [`{{ b | line2(g) }}%`,'25%'],
                3: ['18%',loc('tech_electricity'),'10%',loc('tech_virtual_reality')]
            },
            vue: {
                filters: {
                    line2(b,g){ return b ? (g ? 50 : 40) : (g ? 40 : 35); },
                }
            }
        },
        democracy: {
            paragraphs: 6,
            break: [2,5],
            para_data: {
                2: [loc('job_entertainer'),`{{ b | line2(g) }}%`],
                3: [loc('job_entertainer')],
                4: [`{{ b | line4a(g) }}%`,loc('tech_electricity'),`{{ b | line4b(g) }}%`,loc('tech_virtual_reality')],
                5: [`{{ g | line5 }}%`],
                6: [
                    loc('job_farmer'),loc('job_lumberjack'),loc('job_quarry_worker'),loc('job_miner'),loc('job_crystal_miner'),
                    loc('job_coal_miner'),loc('job_cement_worker'),loc('job_professor'),loc('job_scientist'),loc('soldiers')
                ]
            },
            vue: {
                filters: {
                    line2(b,g){ return b ? (g ? 30 : 25) : 20; },
                    line4a(b,g){ return b ? (g ? 35 : 30) : 25; },
                    line4b(b,g){ return b ? (g ? 40 : 35) : 30; },
                    line5(g){ return g ? 1 : 5; },
                }
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
                2: [5,`{{ b | line2(g) }}%`],
                3: ['2%',loc('tech_electricity'),loc('tech_virtual_reality')],
                4: ['45%'],
                5: ['0.5%','20%']
            },
            vue: {
                filters: {
                    line2(b,g){ return b ? (g ? 35 : 25) : (g ? 25 : 20); },
                }
            }
        },
        theocracy: {
            paragraphs: 7,
            break: [2,6,7],
            para_data: {
                2: [`{{ b | line2(g) }}%`],
                3: [`{{ g | line3 }}%`],
                4: ['50%'],
                6: ['40%',loc('tech_virtual_reality'),'25%',loc('tech_metaphysics')]
            },
            vue: {
                filters: {
                    line2(b,g){ return b ? (g ? 14 : 13) : 12; },
                    line3(g){ return g ? 10 : 25; },
                }
            }
        },
        republic: {
            paragraphs: 7,
            break: [2,5,6],
            para_data: {
                2: [`{{ b | line2(g) }}%`],
                3: [`{{ b | line3(g) }}%`],
                5: [`{{ b | line5a(g) }}%`,loc('tech_virtual_reality'),`{{ b | line5b(g) }}%`,loc('tech_metaphysics')],
                6: ['30%'],
                7: [30,90],
            },
            vue: {
                filters: {
                    line2(b,g){ return b ? (g ? 40 : 30) : (g ? 30 : 25); },
                    line3(b,g){ return b ? (g ? 30 : 25) : 20; },
                    line5a(b,g){ return b ? (g ? 40 : 35) : 30; },
                    line5b(b,g){ return b ? (g ? 50 : 45) : 40; },
                }
            }
        },
        socialist: {
            paragraphs: 6,
            break: [2,6],
            para_data: {
                2: [`{{ b | line2(g) }}%`],
                3: [`{{ b | line3(g) }}%`],
                4: ['10%'],
                5: [`{{ b | line5(g) }}%`],
                6: [`{{ b | line6a(g) }}%`,loc('tech_virtual_reality'),`{{ b | line6b(g) }}%`,loc('tech_metaphysics')]
            },
            vue: {
                filters: {
                    line2(b,g){ return b ? (g ? 45 : 40) : 35; },
                    line3(b,g){ return b ? (g ? 15 : 12) : (g ? 12 : 10); },
                    line5(b,g){ return b ? (g ? 5 : 15) : (g ? 10 : 20); },
                    line6a(b,g){ return b ? (g ? 52 : 47) : 42; },
                    line6b(b,g){ return b ? (g ? 60 : 55) : 50; },
                }
            }
        },
        corpocracy: {
            paragraphs: 9,
            break: [2,8,9],
            para_data: {
                2: ['50%'],
                3: [`{{ b | line3(g) }}%`],
                4: [`{{ b | line4(g) }}%`],
                5: [`{{ b | line5(g) }}%`],
                6: ['10%'],
                7: [`{{ b | line7(g) }}%`],
                8: ['5%',loc('tech_virtual_reality')],
                9: [`{{ b | line9(g) }}%`,loc('tech_metaphysics')]
            },
            vue: {
                filters: {
                    line3(b,g){ return b ? (g ? 250 : 220) : (g ? 220 : 200); },
                    line4(b,g){ return b ? (g ? 190 : 160) : (g ? 175 : 150); },
                    line5(b,g){ return b ? (g ? 125 : 110) : (g ? 110 : 100); },
                    line7(b,g){ return b ? (g ? 40 : 35) : 30; },
                    line9(b,g){ return b ? (g ? 50 : 45) : 40; },
                }
            }
        },
        technocracy: {
            paragraphs: 5,
            break: [2,4],
            para_data: {
                2: ['8%'],
                3: [`{{ b | line3(g) }}%`],
                4: ['2%'],
                5: ['1%',loc('tech_virtual_reality'),loc('tech_metaphysics')]
            },
            vue: {
                filters: {
                    line3(b,g){ return b ? (g ? 25 : 15) : (g ? 18 : 10); },
                }
            }
        },
        federation: {
            paragraphs: 7,
            break: [2,5,6],
            para_data: {
                2: ['3%'],
                4: ['25%'],
                5: [`{{ b | line5(g) }}%`],
                6: ['25%',`{{ b | line6(g) }}%`],
                7: [`{{ b | line7a(g) }}%`,loc('tech_virtual_reality'),`{{ b | line7b(g) }}%`,loc('tech_metaphysics')]
            },
            vue: {
                filters: {
                    line5(b,g){ return b ? (g ? 18 : 12) : (g ? 12 : 10); },
                    line6(b,g){ return b ? (g ? 36 : 34) : 32; },
                    line7a(b,g){ return b ? (g ? 40 : 38) : 36; },
                    line7b(b,g){ return b ? (g ? 44 : 42) : 40; },
                }
            }
        },
        magocracy: {
            paragraphs: 5,
            break: [2,3,5],
            para_data: {
                2: [`{{ b | line2(g) }}%`],
                3: [`{{ b | line3(g) }}%`],
                4: [`{{ b | line4a(g) }}%`,loc('tech_virtual_reality'),`{{ b | line4b(g) }}%`,loc('tech_metaphysics')]
            },
            vue: {
                filters: {
                    line2(b,g){ return b ? (g ? 40 : 30) : (g ? 30 : 25); },
                    line3(b,g){ return b ? (g ? 35 : 30) : 25; },
                    line4a(b,g){ return b ? (g ? 50 : 45) : 40 },
                    line4b(b,g){ return b ? (g ? 60 : 55) : 50; },
                }
            }
        },
        dictator: {
            paragraphs: 6,
            break: [2,5,6],
            para_data: {
                2: [`{{ b | line2(g) }}%`],
                3: [`{{ b | line3(g) }}%`],
                4: [`{{ b | line4(g) }}%`, resourceName('Lumber'),resourceName('Stone'),resourceName('Furs'),resourceName('Copper'),resourceName('Iron'),resourceName('Aluminium'),resourceName('Cement'),resourceName('Coal')],
                5: [`{{ b | line5a(g) }}%`, loc('tech_virtual_reality'), `{{ b | line5b(g) }}%`, loc('tech_metaphysics')]
            },
            vue: {
                filters: {
                    line2(b,g){ return b ? (g ? 15 : 25) : (g ? 25 : 30); },
                    line3(b,g){ return b ? (g ? 13 : 12) : 10; },
                    line4(b,g){ return b ? (g ? 8 : 6) : 4; },
                    line5a(b,g){ return b ? (g ? 15 : 14) : 12; },
                    line5b(b,g){ return b ? (g ? 10 : 8) : 6; },
                }
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
            vue: {
                data: { g: govActive('organizer',0), b: govBoost() },
                filters: govs[gov]?.vue?.filters || {}
            },
            h_extra: govs[gov]?.vue ? `<div><b-checkbox v-model="g">${loc(`governor_bureaucrat`)}</b-checkbox><b-checkbox v-model="b">${loc(`arpa_genepool_bureaucratic_efficiency_title`)}</b-checkbox></div>` : false,
        });
        sideMenu('add',`government-gameplay`,gov,loc(`govern_${gov}`));
    });
}

function organActive(){
    return govActive('organizer',0);
}

function govBoost(){
    return global?.genes?.hasOwnProperty('governor') && global?.genes?.governor >= 3 ? true : false;
}
