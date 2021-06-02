import { loc } from './../locale.js';
import { infoBoxBuilder, sideMenu } from './functions.js';
import { mechSize, mechWeaponPower, mechCost } from './../portal.js';

export function hellPage(content){
    let mainContent = sideMenu('create',content);
    mainContent.append(`<h2 class="header has-text-caution">${loc('wiki_hell')}</h2>`);

    infoBoxBuilder(mainContent,{ name: 'threat', template: 'hell', paragraphs: 3,
        para_data: { 1: ['10,000'], 2: ['1000-1250'] },
        data_color: { 1: ['caution'], 2: ['warning'] }
    });
    sideMenu('add',`hell-gameplay`,'threat',loc('wiki_hell_threat'));

    infoBoxBuilder(mainContent,{ name: 'siege', template: 'hell', paragraphs: 5,
        para_data: { 3: ['5k+'] },
        data_color: { 3: ['caution'] } });
    sideMenu('add',`hell-gameplay`,'intro',loc('wiki_hell_siege'));

    infoBoxBuilder(mainContent,{ name: 'strategy', template: 'hell', paragraphs: 3 });
    sideMenu('add',`hell-gameplay`,'intro',loc('wiki_hell_strategy'));

    let soul = infoBoxBuilder(mainContent,{ name: 'soul_gem', template: 'hell', paragraphs: 4,
        para_data: {
            1: [loc('wiki_hell_soul_gem'),loc('tab_portal')],
            3: [loc('tech_demon_attractor')]
        }
    });
    let soul_extra = $(`<div></div>`);
    soul.append(soul_extra);
    soul_extra.append(`<div>${loc('wiki_hell_sim',[`<a href="https://zarakon.github.io/EvolveHellSim/" target="_blank">${loc(`wiki_hell_sim2`)}</a>`,'Zarakon'])}</div>`);
    sideMenu('add',`hell-gameplay`,'intro',loc('wiki_hell_soul_gem'));

    infoBoxBuilder(mainContent,{ name: 'infernite', template: 'hell', paragraphs: 4 });
    sideMenu('add',`hell-gameplay`,'intro',loc('wiki_hell_infernite'));

    mainContent.append(`<h2 class="header has-text-caution">${loc('wiki_hell_deep')}</h2>`);

    infoBoxBuilder(mainContent,{ name: 'pit', template: 'hell', paragraphs: 3,
        para_data: {
            1: ['1,000,000'],
            2: [loc('portal_soul_forge_title')]
        },
        data_link: {
            2: ['wiki.html#hell-structures-soul_forge']
        }
    });
    sideMenu('add',`hell-gameplay`,'pit',loc('wiki_hell_pit'));

    infoBoxBuilder(mainContent,{ name: 'corrupted', template: 'hell', paragraphs: 3,
        para_data: {
            1: [loc(`tech_metaphysics`),loc(`portal_soul_forge_title`),loc(`resource_Corrupt_Gem_name`)],
            2: [loc(`portal_ruins_name`)],
            3: [loc(`tech_era_intergalactic`)]
        },
        data_link: {
            1: ['wiki.html#intergalactic-tech-metaphysics']
        }
    });
    sideMenu('add',`hell-gameplay`,'corrupted',loc('wiki_hell_corrupted'));

    infoBoxBuilder(mainContent,{ name: 'pillar', template: 'hell', paragraphs: 5, break: [4,5],
        para_data: {
            1: [loc(`portal_ruins_name`)],
            2: ['1%',loc(`harmonic`)],
            3: ['4%'],
            4: [loc(`harmonic`),'0.5%','2%'],
            5: [loc(`wiki_hell_pillar_para5d1`),12]
        },
        data_link: {
            5: ['wiki.html#hell-structures-west_tower']
        }
    });
    sideMenu('add',`hell-gameplay`,'pillar',loc('wiki_hell_pillar'));

    mainContent.append(`<h2 class="header has-text-caution">${loc('portal_spire_name')}</h2>`);

    infoBoxBuilder(mainContent,{ name: 'spire', template: 'hell', paragraphs: 5, break: [4],
        para_data: {
            4: [loc(`resource_Blood_Stone_name`)],
            5: [loc(`wiki_resets_infusion`)]
        },
        data_link: {
            5: ['wiki.html#resets-prestige-infusion']
        }
    });
    sideMenu('add',`hell-gameplay`,'spire',loc('portal_spire_name'));

    {
        let mechs = infoBoxBuilder(mainContent,{ name: 'mech', template: 'hell', paragraphs: 2,
            para_data: {
                2: [5,loc('portal_mech_size_small'),loc('portal_mech_size_medium'),loc('portal_mech_size_large'),loc('portal_mech_size_titan'),loc('portal_mech_size_collector')]
            }
        });

        let s_cost = mechCost('small');
        infoBoxBuilder(mechs,{ name: 'scout', template: 'hell', paragraphs: 5, break: [3,4,5],
            para_data: {
                1: [loc('portal_mech_size_small')],
                2: [1,1,loc(`arpa_blood_prepared_title`)],
                3: [(mechWeaponPower('small') * 100).toFixed(2)],
                4: [mechSize('small'),s_cost.c,s_cost.s],
                5: [loc(`portal_mech_equip_jumpjet`)]
            },
            data_link: {
                2: [false,false,'wiki.html#blood-prestige-prepared']
            }
        });

        let m_cost = mechCost('medium');
        infoBoxBuilder(mechs,{ name: 'standard', template: 'hell', paragraphs: 5, break: [3,4,5],
            para_data: {
                1: [loc('portal_mech_size_medium')],
                2: [1,1,2,loc(`arpa_blood_prepared_title`)],
                3: [(mechWeaponPower('medium') * 100).toFixed(2)],
                4: [mechSize('medium'),m_cost.c,m_cost.s],
                5: [loc(`portal_mech_equip_jumpjet`)]
            },
            data_link: {
                2: [false,false,false,'wiki.html#blood-prestige-prepared']
            }
        });

        let l_cost = mechCost('large');
        infoBoxBuilder(mechs,{ name: 'heavy', template: 'hell', paragraphs: 6, break: [3,4,5,6],
            para_data: {
                1: [loc('portal_mech_size_large')],
                2: [2,2,3,loc(`arpa_blood_prepared_title`)],
                3: [(mechWeaponPower('large') * 100).toFixed(2)],
                4: [mechSize('large'),l_cost.c,l_cost.s],
                5: [loc(`portal_mech_equip_battery`)]
            },
            data_link: {
                2: [false,false,false,'wiki.html#blood-prestige-prepared']
            }
        });

        let t_cost = mechCost('titan');
        infoBoxBuilder(mechs,{ name: 'titan', template: 'hell', paragraphs: 6, break: [3,4,5,6],
            para_data: {
                1: [loc('portal_mech_size_titan')],
                2: [4,4,5,loc(`arpa_blood_prepared_title`)],
                3: [(mechWeaponPower('titan') * 100).toFixed(2)],
                4: [mechSize('titan'),t_cost.c,t_cost.s],
                5: [loc(`portal_mech_equip_target`)]
            },
            data_link: {
                2: [false,false,false,'wiki.html#blood-prestige-prepared']
            }
        });

        let c_cost = mechCost('collector');
        infoBoxBuilder(mechs,{ name: 'collector', template: 'hell', paragraphs: 5, break: [3,4,5],
            para_data: {
                1: [loc('portal_mech_size_collector')],
                2: [2,3,loc(`arpa_blood_prepared_title`)],
                3: [mechSize('collector'),c_cost.c,c_cost.s],
                4: [loc(`portal_mech_equip_jumpjet`)]
            },
            data_link: {
                2: [false,false,'wiki.html#blood-prestige-prepared']
            }
        });

        sideMenu('add',`hell-gameplay`,'mech',loc('wiki_hell_mech'));
    }
}

