import { loc } from './../locale.js';
import { infoBoxBuilder, sideMenu } from './functions.js';
import { calcPillar } from './../functions.js';
import { mechSize, mechWeaponPower, mechCost, terrainEffect, monsters } from './../portal.js';
import { global } from './../vars.js';

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
    sideMenu('add',`hell-gameplay`,'siege',loc('wiki_hell_siege'));

    infoBoxBuilder(mainContent,{ name: 'strategy', template: 'hell', paragraphs: 3 });
    sideMenu('add',`hell-gameplay`,'strategy',loc('wiki_hell_strategy'));

    let soul = infoBoxBuilder(mainContent,{ name: 'soul_gem', template: 'hell', paragraphs: 4,
        para_data: {
            1: [loc('wiki_hell_soul_gem'),loc('tab_portal')],
            3: [loc('tech_demon_attractor')]
        }
    });
    let soul_extra = $(`<div></div>`);
    soul.append(soul_extra);
    //soul_extra.append(`<div>${loc('wiki_hell_sim',[`<a href="https://zarakon.github.io/EvolveHellSim/" target="_blank">${loc(`wiki_hell_sim2`)}</a>`,'Zarakon'])}</div>`);
    sideMenu('add',`hell-gameplay`,'soul_gem',loc('wiki_hell_soul_gem'));

    infoBoxBuilder(mainContent,{ name: 'infernite', template: 'hell', paragraphs: 4 });
    sideMenu('add',`hell-gameplay`,'infernite',loc('wiki_hell_infernite'));

    mainContent.append(`<h2 class="header has-text-caution">${loc('wiki_hell_deep')}</h2>`);

    infoBoxBuilder(mainContent,{ name: 'pit', template: 'hell', paragraphs: 3,
        para_data: {
            1: ['1,000,000',loc(`galaxy_telemetry_beacon`)],
            2: [loc('portal_soul_forge_title')]
        },
        data_link: {
            1: [false,'wiki.html#intergalactic-structures-telemetry_beacon'],
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

    let harmonic = calcPillar();
    infoBoxBuilder(mainContent,{ name: 'pillar', template: 'hell', paragraphs: 6, break: [4,5,6],
        para_data: {
            1: [loc(`portal_ruins_name`)],
            2: ['1%',loc(`harmonic`)],
            3: ['3%'],
            4: [loc(`harmonic`),'2%','6%'],
            5: [loc(`wiki_hell_pillar_para5d1`),12],
            6: [loc(`harmonic`),`${((harmonic[0] - 1) * 100).toFixed(0)}%`,`${((harmonic[1] - 1) * 100).toFixed(0)}%`],
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

    { // Spire Mech
        if (global.race['warlord']){
            let demons = infoBoxBuilder(mainContent,{ name: 'demons', template: 'hell', paragraphs: 2,
                para_data: {
                    2: [4,loc('portal_mech_size_minion'),loc('portal_mech_size_fiend'),loc('portal_mech_size_cyberdemon'),loc('portal_mech_size_archfiend')]
                }
            });

            let s_cost = mechCost('minion');
            infoBoxBuilder(demons,{ name: 'minion', template: 'hell', paragraphs: 10, break: [3,4,5,6,10], h_level: 4, header: true,
                para_data: {
                    1: [loc('portal_mech_size_minion')],
                    2: [1,1,loc(`arpa_blood_prepared_title`)],
                    3: [(mechWeaponPower('minion') * 100).toFixed(2)],
                    4: [mechSize('minion'),s_cost.c,s_cost.s],
                    5: [loc(`portal_mech_equip_scavenger`),loc(`portal_mech_equip_scouter`)],
                    7: [`1%`],
                    8: [loc(`portal_spire_status_fog`),loc(`portal_spire_status_dark`)],
                    9: [`100%`],
                    10: [`8%`],
                },
                data_link: {
                    2: [false,false,'wiki.html#blood-prestige-prepared']
                }
            });
        }
        else {
            let mechs = infoBoxBuilder(mainContent,{ name: 'mech', template: 'hell', paragraphs: 2,
                para_data: {
                    2: [5,loc('portal_mech_size_small'),loc('portal_mech_size_medium'),loc('portal_mech_size_large'),loc('portal_mech_size_titan'),loc('portal_mech_size_collector')]
                }
            });

            let s_cost = mechCost('small');
            infoBoxBuilder(mechs,{ name: 'scout', template: 'hell', paragraphs: 10, break: [3,4,5,6,10], h_level: 4, header: true,
                para_data: {
                    1: [loc('portal_mech_size_small')],
                    2: [1,1,loc(`arpa_blood_prepared_title`)],
                    3: [(mechWeaponPower('small') * 100).toFixed(2)],
                    4: [mechSize('small'),s_cost.c,s_cost.s],
                    5: [loc(`portal_mech_equip_jumpjet`)],
                    7: [`1%`],
                    8: [loc(`portal_spire_status_fog`),loc(`portal_spire_status_dark`)],
                    9: [`100%`],
                    10: [`8%`],
                },
                data_link: {
                    2: [false,false,'wiki.html#blood-prestige-prepared']
                }
            });

            let m_cost = mechCost('medium');
            infoBoxBuilder(mechs,{ name: 'standard', template: 'hell', paragraphs: 6, break: [3,4,5,6], h_level: 4, header: true,
                para_data: {
                    1: [loc('portal_mech_size_medium')],
                    2: [1,1,2,loc(`arpa_blood_prepared_title`)],
                    3: [(mechWeaponPower('medium') * 100).toFixed(2)],
                    4: [mechSize('medium'),m_cost.c,m_cost.s],
                    5: [loc(`portal_mech_equip_jumpjet`)],
                    6: [`5%`],
                },
                data_link: {
                    2: [false,false,false,'wiki.html#blood-prestige-prepared']
                }
            });

            let l_cost = mechCost('large');
            infoBoxBuilder(mechs,{ name: 'heavy', template: 'hell', paragraphs: 6, break: [3,4,5,6], h_level: 4, header: true,
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
            infoBoxBuilder(mechs,{ name: 'titan', template: 'hell', paragraphs: 7, break: [3,4,5,6,7], h_level: 4, header: true,
                para_data: {
                    1: [loc('portal_mech_size_titan')],
                    2: [4,4,5,loc(`arpa_blood_prepared_title`)],
                    3: [(mechWeaponPower('titan') * 100).toFixed(2)],
                    4: [mechSize('titan'),t_cost.c,t_cost.s],
                    5: [loc(`portal_mech_equip_target`)],
                    7: [`25%`]
                },
                data_link: {
                    2: [false,false,false,'wiki.html#blood-prestige-prepared']
                }
            });

            let c_cost = mechCost('collector');
            infoBoxBuilder(mechs,{ name: 'collector', template: 'hell', paragraphs: 5, break: [3,4,5], h_level: 4, header: true,
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
        }

        sideMenu('add',`hell-gameplay`,global.race['warlord'] ? 'demons' : 'mech',global.race['warlord'] ? loc('wiki_hell_demons') : loc('wiki_hell_mech'));
    }

    { // Mech Chassis
        let types = ['wheel','tread','biped','quad','spider','hover'];
        let terrains = ['sand','swamp','forest','jungle','rocky','gravel','muddy','grass','brush','concrete'];

        let typeList = [];
        typeList.push(types.length);
        types.forEach(function(t){ typeList.push( loc(`portal_mech_chassis_${t}`) ); });

        let mechs = infoBoxBuilder(mainContent,{ name: 'chassis', template: 'hell', paragraphs: 4,
            para_data: {
                1: typeList,
                2: [terrains.length]
            }
        });

        terrains.forEach(function(t){
            let ratings = {};
            for (let i=1; i<=types.length; i++){
                let raws = +(terrainEffect({ chassis: types[i-1], size: 'small' },t) * 100).toFixed(1);
                let rawl = +(terrainEffect({ chassis: types[i-1], size: 'large' },t) * 100).toFixed(1);
                ratings[i+1] = `${loc('wiki_hell_effectiveness',[
                    `<span class="has-text-warning">${loc(`portal_mech_chassis_${types[i-1]}`)}</span>`,
                    `<span class="has-text-${raws >= 100 ? 'success' : 'danger'}">${raws}%</span>`,
                    `<span class="has-text-${rawl >= 100 ? 'success' : 'danger'}">${rawl}%</span>`,
                    `<span class="has-text-info">S</span>`,
                    `<span class="has-text-info">L</span>`
                ])}`;
            }

            infoBoxBuilder(mechs,{ name: `t_${t}`, template: 'hell', label: loc(`portal_spire_type_${t}`), paragraphs: 7, break: [2,3,4,5,6,7], h_level: 4, header: true,
                text: { 1: `portal_spire_type_${t}_desc` },
                rawtext: ratings,
                pclass: 'col2 sk1'
            });
        });

        sideMenu('add',`hell-gameplay`,'chassis',loc('wiki_hell_chassis'));
    }

    { // Monsters
        let weapons = global.race['warlord'] ? ['laser','kinetic','shotgun','missile','flame','plasma','sonic','tesla','claws','venom','cold','shock','fire','acid','stone','iron','flesh','ice','magma','axe','hammer'] : ['plasma','laser','kinetic','shotgun','missile','flame','sonic','tesla'];

        let mobs = infoBoxBuilder(mainContent,{ name: 'monsters', template: 'hell', paragraphs: 4,
            para_data: {
                2: [weapons.length]
            }
        });

        Object.keys(monsters).forEach(function(mob){
            let ratings = {};
            for (let i=1; i<=weapons.length; i++){
                let wep = +((monsters[mob].weapon.hasOwnProperty(weapons[i-1]) ? monsters[mob].weapon[weapons[i-1]] : 1) * 100).toFixed(0);
                ratings[i] = `${loc('wiki_hell_weapon_effect',[
                    `<span class="has-text-warning">${loc(`portal_mech_weapon_${weapons[i-1]}`)}</span>`,
                    `<span class="has-text-${wep >= 90 ? 'success' : 'danger'}">${wep}%</span>`
                ])}`;
            }

            infoBoxBuilder(mobs,{ name: `boss_${mob}`, template: 'hell', label: loc(`portal_mech_boss_${mob}`), paragraphs: weapons.length, break: Array.from({length: weapons.length}, (x, i) => i+2), h_level: 4, header: true,
                rawtext: ratings,
                pclass: 'col2'
            });
        });

        sideMenu('add',`hell-gameplay`,'monsters',loc('wiki_hell_monsters'));
    }

    { // Hazards
        let hazard = infoBoxBuilder(mainContent,{ name: 'hazard', template: 'hell', paragraphs: 8, break: [3,4,5,6,7],
            para_data: {
                3: [`+1`,`10+`],
                4: [`6/(105-${loc('wiki_hell_hazard_para3_note')})`,`+1`,`25-100`],
                5: [`11/(260-${loc('wiki_hell_hazard_para3_note')})`,`+1`,`101-250`],
                6: [`26/(1025-${loc('wiki_hell_hazard_para3_note')})`,`+1`,`251-1000`],
                7: [`-1`],
                8: [loc('portal_spire_status_freeze'),loc('portal_spire_status_hot'),loc('portal_spire_status_rain'),loc('portal_spire_status_hail')],
            }
        });

        let counter_text = {
            1: 'wiki_hell_hazard_effect',
            2: 'wiki_hell_hazard_counter'
        };

        infoBoxBuilder(hazard,{ name: 'h_freeze', template: 'hell', label: loc(`portal_spire_status_freeze`), paragraphs: 2, break: [2], h_level: 4, header: true,
            text: counter_text,    
            para_data: {
                1: [`75%`],
                2: [loc(`portal_mech_equip_radiator`)]
            }
        });
        
        infoBoxBuilder(hazard,{ name: 'h_hot', template: 'hell', label: loc(`portal_spire_status_hot`), paragraphs: 2, break: [2], h_level: 4, header: true,
            text: counter_text,    
            para_data: {
                1: [`75%`],
                2: [loc(`portal_mech_equip_coolant`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_corrosive', template: 'hell', label: loc(`portal_spire_status_corrosive`), paragraphs: 3, break: [2,3], h_level: 4, header: true,
            text: {
                1: 'wiki_hell_hazard_effect',
                2: 'wiki_hell_hazard_counter',
                3: 'wiki_hell_hazard_partial'
            },    
            para_data: {
                1: [`75%`],
                2: [loc(`portal_mech_equip_ablative`)],
                3: [loc(`portal_mech_equip_shields`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_humid', template: 'hell', label: loc(`portal_spire_status_humid`), paragraphs: 2, break: [2], h_level: 4, header: true,
            text: counter_text,    
            para_data: {
                1: [`25%`],
                2: [loc(`portal_mech_equip_seals`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_windy', template: 'hell', label: loc(`portal_spire_status_windy`), paragraphs: 1, h_level: 4, header: true,
            text: {
                1: 'wiki_hell_hazard_chassis'
            },    
            para_data: {
                1: [`50%`,loc(`portal_mech_chassis_hover`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_hilly', template: 'hell', label: loc(`portal_spire_status_hilly`), paragraphs: 1, h_level: 4, header: true,
            text: {
                1: 'wiki_hell_hazard_not_chassis'
            },    
            para_data: {
                1: [`25%`,loc(`portal_mech_chassis_spider`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_mountain', template: 'hell', label: loc(`portal_spire_status_mountain`), paragraphs: 2, break: [2], h_level: 4, header: true,
            text: {
                1: 'wiki_hell_hazard_either',
                2: 'wiki_hell_hazard_partial'
            },    
            para_data: {
                1: [`50%`,loc(`portal_mech_chassis_spider`),loc(`portal_mech_equip_grapple`)],
                2: [loc(`portal_mech_equip_flare`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_radioactive', template: 'hell', label: loc(`portal_spire_status_radioactive`), paragraphs: 2, break: [2], h_level: 4, header: true,
            text: counter_text,    
            para_data: {
                1: [`50%`],
                2: [loc(`portal_mech_equip_shields`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_quake', template: 'hell', label: loc(`portal_spire_status_quake`), paragraphs: 2, break: [2], h_level: 4, header: true,
            text: counter_text,    
            para_data: {
                1: [`75%`],
                2: [loc(`portal_mech_equip_stabilizer`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_dust', template: 'hell', label: loc(`portal_spire_status_dust`), paragraphs: 2, break: [2], h_level: 4, header: true,
            text: counter_text,    
            para_data: {
                1: [`50%`],
                2: [loc(`portal_mech_equip_seals`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_river', template: 'hell', label: loc(`portal_spire_status_river`), paragraphs: 1, h_level: 4, header: true,
            text: {
                1: 'wiki_hell_hazard_not_chassis'
            },    
            para_data: {
                1: [`35%`,loc(`portal_mech_chassis_hover`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_tar', template: 'hell', label: loc(`portal_spire_status_tar`), paragraphs: 2, break: [2], h_level: 4, header: true,
            text: {
                1: 'wiki_hell_hazard_not_chassis',
                2: 'wiki_hell_hazard_worse'
            },    
            para_data: {
                1: [`25%`,loc(`portal_mech_chassis_quad`)],
                2: [`50%`,loc(`portal_mech_chassis_tread`),loc(`portal_mech_chassis_wheel`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_steam', template: 'hell', label: loc(`portal_spire_status_steam`), paragraphs: 2, break: [2], h_level: 4, header: true,
            text: counter_text,    
            para_data: {
                1: [`25%`],
                2: [loc(`portal_mech_equip_shields`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_flooded', template: 'hell', label: loc(`portal_spire_status_flooded`), paragraphs: 1, h_level: 4, header: true,
            text: {
                1: 'wiki_hell_hazard_not_chassis'
            },    
            para_data: {
                1: [`65%`,loc(`portal_mech_chassis_hover`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_fog', template: 'hell', label: loc(`portal_spire_status_fog`), paragraphs: 2, break: [2], h_level: 4, header: true,
            text: counter_text,    
            para_data: {
                1: [`80%`],
                2: [loc(`portal_mech_equip_sonar`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_rain', template: 'hell', label: loc(`portal_spire_status_rain`), paragraphs: 2, break: [2], h_level: 4, header: true,
            text: counter_text,    
            para_data: {
                1: [`25%`],
                2: [loc(`portal_mech_equip_seals`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_hail', template: 'hell', label: loc(`portal_spire_status_hail`), paragraphs: 1, h_level: 4, header: true,
            text: {
                1: 'wiki_hell_hazard_either2'
            },    
            para_data: {
                1: [`25%`,loc(`portal_mech_equip_ablative`),loc(`portal_mech_equip_shields`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_chasm', template: 'hell', label: loc(`portal_spire_status_chasm`), paragraphs: 2, break: [2], h_level: 4, header: true,
            text: counter_text,    
            para_data: {
                1: [`90%`],
                2: [loc(`portal_mech_equip_grapple`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_dark', template: 'hell', label: loc(`portal_spire_status_dark`), paragraphs: 3, break: [2,3], h_level: 4, header: true,
            text: {
                1: 'wiki_hell_hazard_effect',
                2: 'wiki_hell_hazard_counter',
                3: 'wiki_hell_hazard_partial'
            },    
            para_data: {
                1: [`90%`],
                2: [loc(`portal_mech_equip_infrared`)],
                3: [loc(`portal_mech_equip_flare`)]
            }
        });

        infoBoxBuilder(hazard,{ name: 'h_gravity', template: 'hell', label: loc(`portal_spire_status_gravity`), paragraphs: 3, break: [2,3], h_level: 4, header: true,
            text: {
                1: 'wiki_hell_hazard_gravity',
                2: 'wiki_hell_hazard_gravity',
                3: 'wiki_hell_hazard_gravity'
            },    
            para_data: {
                1: [loc(`portal_mech_size_medium`),`20%`],
                2: [loc(`portal_mech_size_large`),`55%`],
                3: [loc(`portal_mech_size_titan`),`75%`]
            }
        });

        sideMenu('add',`hell-gameplay`,'hazard',loc('wiki_hell_hazard'));
    }

    { // Special Equipment
        let special = infoBoxBuilder(mainContent,{ name: 'equipment', template: 'hell', paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`portal_mech_equip_jumpjet`),loc(`portal_mech_equip_battery`),loc(`portal_mech_equip_target`)]
            }
        });
        sideMenu('add',`hell-gameplay`,'equipment',loc('wiki_hell_equipment'));

        infoBoxBuilder(special,{ name: `eq_jump`, template: 'hell', label: loc(`portal_mech_equip_jumpjet`), paragraphs: 4, break: [4], h_level: 3, header: true,
            para_data: {
                1: [loc(`portal_mech_equip_jumpjet`),loc(`wiki_hell_scout`),loc(`wiki_hell_standard`),loc(`wiki_hell_collector`)],
                2: [`20%`],
                3: [`10%`,loc(`portal_spire_status_gravity`)]
            }
        });

        infoBoxBuilder(special,{ name: `eq_battery`, template: 'hell', label: loc(`portal_mech_equip_battery`), paragraphs: 2, h_level: 3, header: true,
            para_data: {
                1: [loc(`portal_mech_equip_battery`),loc(`wiki_hell_heavy`)],
                2: [`2%`]
            }
        });

        infoBoxBuilder(special,{ name: `eq_target`, template: 'hell', label: loc(`portal_mech_equip_target`), paragraphs: 3, h_level: 3, header: true,
            para_data: {
                1: [loc(`portal_mech_equip_target`),loc(`wiki_hell_titan`)],
                2: [`25%`]
            }
        });
    }
}
