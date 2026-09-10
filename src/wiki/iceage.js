import { $ } from '../dom.js';
import { loc } from '../locale.js';
import { infoBoxBuilder, sideMenu } from './functions.js';
import { calcPillar, vBind } from '../functions.js';
import { mechSize, mechWeaponPower, mechCost, terrainEffect, monsters } from '../portal.js';
import { global } from '../vars.js';
import { ecosystemInfo } from '../iceage.js';

export function iceagePage(content){
    let mainContent = sideMenu('create',content);

    infoBoxBuilder(mainContent,{ name: 'general', template: 'iceage', paragraphs: 5, break: [2,3,4,5],
        para_data: {
            1: [loc('evo_challenge_iceage')],
            2: [loc('planet_kamikaze'), loc('tech_corrupt_gem_analysis'), loc('tech_giant_thrusters'), loc('city_giant_thrusters'), loc('city_thruster_fuel'), loc('evo_challenge_iceage')],
            4: [loc('wiki_p_res_servants')],
            5: [loc('city_shrine'), loc('trait_magnificent_name'), loc('wiki_p_res_servants')],
            6: [loc('underground_challenge_nerf'), loc('wiki_iceage_mineshaft_rooted')]
        },
        data_color: {
            6:['danger','danger']
        },
        data_link: {
            2: [false, '#dimensional-tech-corrupt_gem_analysis', '#dimensional-tech-giant_thrusters', '#planetary-structures-giant_thrusters', '#planetary-structures-thruster_fuel']
        }
    });
    sideMenu('add',`iceage-gameplay`,'general',loc('wiki_iceage_general'));

    infoBoxBuilder(mainContent,{ name: 'mineshaft', template: 'iceage', paragraphs: 8, break: [3,5,6,7,8],
        para_data: {
            1: [loc('underground_mineshaft'), loc('evo_challenge_iceage'), `${loc('job_miner')}s`],
            2: [loc('wiki_iceage_mineshaft_rooted')],
            4: [loc('tech_coal_lanterns'), loc('underground_mineshaft_elevator')],
            5: [100],
            6: [2000, loc('tech_coal_lanterns')],
            7: [200000, loc('underground_mineshaft_elevator')],
            8: [loc('tech_core_digging'), loc('underground_core_tap'), `${loc('job_core_miner')}s`, loc('underground_core_forge'), loc('underground_core_refinery'), loc('underground_core_blacksmith')]
        },
        data_color: {
            2:['danger']
        },
        data_link: {
            1: ['#underground-structures-mineshaft'],
            4: ['#civilized-tech-coal_lanterns', '#underground-structures-mineshaft_elevator'],
            8: ['#globalized-tech-core_digging', '#underground-structures-core_tap', false, '#underground-structures-core_forge', '#underground-structures-core_refinery', '#underground-structures-core_blacksmith']
        }
    });
    sideMenu('add',`iceage-gameplay`,'mineshaft',loc('wiki_iceage_mineshaft'));

    infoBoxBuilder(mainContent,{ name: 'cave_creatures', template: 'iceage', paragraphs: 4, break: [2,3,4],
        para_data: {
            1: [loc('underground_cave_creatures'), loc('underground_challenge_nerf')],
            4: [loc('wiki_tech_tree_armor'), loc('trait_instinct_name'), loc('trait_revive_name')],
        },
        data_color: {
            1:[false, 'danger']
        },
        data_link: {
            1: ['#underground-structures-cave_creatures'],
            4: ['#civilized-tech-soldier_armor', '#traits-species-genus_instinct', '#traits-species-major_revive'],
        }
    });
    sideMenu('add',`iceage-gameplay`,'cave_creatures',loc('wiki_iceage_cave_creatures'));

    infoBoxBuilder(mainContent,{ name: 'ecosystem', template: 'iceage', paragraphs: 6, break: [2,3,4,5,6],
        para_data: {
            1: [loc('resource_Lumber_name'), loc('evo_challenge_iceage'), `${loc('surface_area_heater')}s`, `${loc('surface_water_pipe')}s`],
            2: [loc('surface_trees'), loc('resource_Lumber_name'), loc('surface_herbivores'), loc('surface_carnivores'), loc('surface_scavengers')],
            3: [`${loc('surface_area_heater')}s`, loc('surface_trees'), loc('surface_herbivores'), loc('surface_carnivores'), loc('surface_scavengers')],
            6: [loc('surface_trees'), loc('surface_herbivores'), loc('surface_carnivores')]
        },
        data_link: {
            1: [false, false, '#surface-structures-area_heater', '#surface-structures-water_pipe']
        }
    });
    sideMenu('add',`iceage-gameplay`,'ecosystem',loc('wiki_iceage_ecosystem'));

    infoBoxBuilder(mainContent,{ name: 'ecosystem_traits', template: 'iceage', paragraphs: 10, break: [2,3,4,5,6,7,8,9,10],
        para_data: {
            1: [loc('tech_sequence_ecosystem')],
            2: [loc('tech_dist_arpa')],
            3: [loc('trait_promiscuous_name'), loc('trait_photosynth_name')],
            4: [loc('trait_hardy_name')],
            5: [loc('trait_compact_name')],
            6: [loc('trait_forager_name'), loc('surface_trees'), loc('surface_carnivores')],
            7: [loc('trait_large_name'), loc('resource_Lumber_name')],
            8: [loc('trait_playful_name'), loc('trait_fragrant_name'), loc('surface_zoo')],
            9: [loc('trait_curious_name'), loc('trait_iron_wood_name'),  loc('surface_genetics_lab')],
            10: [loc('trait_empowered_name')]
        },
        data_link: {
            1: ['#glacial-tech-sequence_ecosystem'],
            8: [false, false,'#surface-structures-surface_zoo'],
            9: [false, false,'#surface-structures-surface_genetics_lab']
        }
    });
    sideMenu('add',`iceage-gameplay`,'ecosystem_traits',loc('wiki_iceage_ecosystem_traits'));

    infoBoxBuilder(mainContent,{ name: 'ecosystem_empowered', template: 'iceage', paragraphs: 7, break: [2,3,4,6,7],
        para_data: {
            1: [loc('tech_plant_odd_seed'), loc('surface_trees'), loc('trait_empowered_name')],
            6: [loc('surface_trees'), loc('surface_herbivores'), loc('surface_carnivores'), loc('surface_scavengers')]
        },
        data_link: {
            1: ['#glacial-tech-plant_odd_seed']
        }
    });
    sideMenu('add',`iceage-gameplay`,'ecosystem_empowered',loc('wiki_iceage_ecosystem_empowered'));

    infoBoxBuilder(mainContent,{ name: 'aberrant_combat', template: 'iceage', paragraphs: 8, break: [2,3,4,6,7,8],
        para_data: {
            1: [loc('tech_plant_odd_seed'), loc('surface_herbivores'), loc('surface_carnivores'), loc('surface_scavengers')],
            3: [loc('underground_cave_creatures')],
            7: [loc('resource_Power_Bones_name')],
            8: [loc('resource_Power_Bones_name')]
        },
        data_link: {
            1: ['#glacial-tech-plant_odd_seed']
        }
    });
    sideMenu('add',`iceage-gameplay`,'aberrant_combat',loc('wiki_iceage_aberrant_combat'));

    infoBoxBuilder(mainContent,{ name: 'aberrant_traits', template: 'iceage', paragraphs: 6, break: [2,3,4,6],
        para_data: {
            1: [loc('tech_aberrant_study'), loc('surface_trees')],
            2: [loc('trait_empowered_name')],
            3: [loc('trait_empowered_name')],
            5: [loc('surface_trees_single')],
            6: [loc('wiki_iceage_living_extinction_danger')]
        },
        data_color: {
            6:['danger']
        },
    });
    sideMenu('add',`iceage-gameplay`,'aberrant_traits',loc('wiki_iceage_aberrant_traits'));

    infoBoxBuilder(mainContent,{ name: 'aggressive', template: 'iceage', paragraphs: 6, break: [2,3,4,5,6],
        para_data: {
            6: [loc('resource_Fossil_name')]
        }
    });
    sideMenu('add',`iceage-gameplay`,'aggressive',loc('wiki_iceage_aggressive'));

    infoBoxBuilder(mainContent,{ name: 'living_extinction', template: 'iceage', paragraphs: 3, break: [2,3],
        para_data: {
            1: [loc('wiki_iceage_living_extinction_danger')],
            2: [loc('trait_hivemind_name'), loc('surface_trees'), loc('wiki_iceage_living_extinction_danger'), loc('trait_shapeshifter_name'), loc('trait_intelligent_name'), loc('trait_infiltrator_name')],
            3: [loc('wiki_iceage_living_extinction_danger'), loc('trait_hivemind_name')]
        },
        data_color: {
            1:['danger'],
            2:['warning','warning','danger','warning','warning','warning'],
            3:['danger','warning']
        },
    });
    sideMenu('add',`iceage-gameplay`,'living_extinction',loc('wiki_iceage_living_extinction'));

    infoBoxBuilder(mainContent,{ name: 'arena', template: 'iceage', paragraphs: 8, break: [2,3,4,5,6,7,8],
        para_data: {
            1: [loc('underground_arena')],
            3: [loc('cave_arena_trophy_plural'), loc('resource_Power_Bones_name')],
            4: [loc('cave_arena_trophy_plural')],
            5: [loc('surface_herbivores_single')],
            6: [loc('surface_carnivores_single')],
            7: [loc('surface_scavengers_single'), loc('resource_Fossil_name')]
        }
    });
    sideMenu('add',`iceage-gameplay`,'arena',loc('wiki_iceage_arena'));

    { // Aberrant major traits
        let majorTraits = infoBoxBuilder(mainContent,{ name: 'aberrant_traits_list', template: 'iceage', paragraphs: 1});
        
        let resources = Vue.reactive({});
        let trait_avail = ecosystemInfo.majorTraitList;
        for (let [index, entry] of Object.entries(ecosystemInfo.majorTraits)){
            let trait = index;
            let info = {1: `
                <div v-html="showUpList()"></div>
                <div v-html="ecoDesc()"></div>
                <div class="calcInput">
                    <span>${loc('wiki_trait_rank')}</span>
                    <div class="calcInput"><b-field><span class="button has-text-danger calcInputButton" role="button" @click="less('owned')">-</span><b-numberinput :input="val('owned')" min="0" v-model="r.${trait}" :controls="false"></b-numberinput><span class="button has-text-success calcInputButton" role="button" @click="more('owned')">+</span></b-field></div>
                </div>`};
            if(trait === 'empowered' || ecosystemInfo.majorTraits[trait].danger){
                resources[trait] = 1;
            }
            else{
                resources[trait] = 0;
            }
            infoBoxBuilder(majorTraits,{ name: `aberrant_${trait}`, template: 'iceage', label: loc(`trait_${trait}_name`), paragraphs: 1, h_level: 4, header: true,
                text: {  },
                rawtext: info,
                pclass: '',
                vue: {
                    el: `#aberrant_${trait}`,
                    data: {
                        r: resources,
                        eco: ecosystemInfo
                    },
                    methods: {
                        val(){
                            return resources[trait];
                        },
                        less(type){
                            if(trait !== 'empowered' && !ecosystemInfo.majorTraits[trait].danger && resources[trait] > 0){
                                resources[trait]--;
                            }
                        },
                        more(type){
                            if(trait !== 'empowered' && !ecosystemInfo.majorTraits[trait].danger){
                                resources[trait]++;
                            }
                        },
                        ecoType(type){
                            return loc(`surface_${type}`);
                        },
                        showUpList(){
                            let showUp = '';
                            if(ecosystemInfo.majorTraits[trait].showUp){
                                for (let i=0;i<ecosystemInfo.majorTraits[trait].showUp.length;i++){
                                    showUp += `${(showUp ? ', ' : '')}<span class="has-text-warning">${loc(`surface_${ecosystemInfo.majorTraits[trait].showUp[i]}`)}</span>`;
                                }
                            }
                            else{
                                for( let [index, entry] of Object.entries(ecosystemInfo.majorTraitList)){
                                    if(entry.includes(trait)){
                                        showUp += `${(showUp ? ', ' : '')}<span class="has-text-warning">${loc(`surface_${index}`)}</span>`;
                                    }
                                }
                            }
                            if(!showUp){
                                return '';
                            }
                            return `<span>${loc('wiki_iceage_aberrant_traits_available')}: ${showUp}</span>`;
                        },
                        ecoDesc(){
                            return ecosystemInfo.majorTraits[trait].effect(false, resources[trait] > 0 ? resources[trait] : 0, true);
                        }
                    }
                }
            });
        }
        sideMenu('add',`iceage-gameplay`,'aberrant_traits_list',loc('wiki_iceage_aberrant_traits_list'));
    }
}
