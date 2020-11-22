import { loc } from './../locale.js';
import { sideMenu, infoBoxBuilder } from './functions.js';

export function combatPage(content){
    let mainContent = sideMenu('create',content);

    infoBoxBuilder(mainContent,{ name: 'basics', template: 'combat', label: loc('wiki_combat_basics'), paragraphs: 4, h_level: 2});
    sideMenu('add',`combat-gameplay`,`basics`,loc('wiki_combat_basics'));

    infoBoxBuilder(mainContent,{ name: 'campaign', template: 'combat', label: loc('wiki_combat_campaign'), paragraphs: 14, break: [5,11], h_level: 2,
        para_data: {
            1: [5, loc('civics_garrison_tactic_ambush'), loc('civics_garrison_tactic_raid'), loc('civics_garrison_tactic_pillage'), loc('civics_garrison_tactic_assault'), loc('civics_garrison_tactic_siege')],
            3: [loc('civics_garrison_tactic_ambush')],
            4: [loc('civics_garrison_tactic_siege'), 20],
            11: ['0%', '50%'],
            12: [50],
            13: ['50%', '100%'],
            14: ['50%'],
        }
    });
    sideMenu('add',`combat-gameplay`,`campaign`,loc('wiki_combat_campaign'));

    infoBoxBuilder(mainContent,{ name: 'loot', template: 'combat', label: loc('wiki_combat_loot'), paragraphs: 30, break: [3,5,10,13,16,19,22,26,27,28,29,30], h_level: 2,
        para_data: {
            2: [3, loc('civics_garrison_campaign'), loc('civics_gov_eco_rate'), loc('civics_garrison_battalion')],
            3: [loc('civics_garrison_campaign')],
            4: [4, loc('wiki_combat_loot_money'), loc('wiki_combat_loot_basic'), loc('wiki_combat_loot_common'), loc('wiki_combat_loot_rare')],
            5: [loc('wiki_combat_loot_basic'), loc('resource_Food_name'), loc('resource_Lumber_name'), loc('resource_Stone_name')],
            6: [loc('wiki_combat_loot_common'), loc('resource_Copper_name'), loc('resource_Iron_name'), loc('resource_Aluminium_name'), loc('resource_Coal_name')],
            7: [loc('wiki_combat_loot_rare'), loc('resource_Cement_name'), loc('resource_Steel_name')],
            8: [loc('wiki_universe_magic'), loc('wiki_combat_loot_rare'), loc('resource_Crystal_name'), loc('trait_terrifying_name') , loc('resource_Titanium_name')],
            9: [loc('wiki_combat_loot_money')],
            10: [loc('civics_garrison_tactic_ambush'),3,loc('wiki_combat_loot_money'),loc('wiki_combat_loot_basic'),loc('wiki_combat_loot_common')],
            11: [loc('trait_beast_of_burden_name'),loc('wiki_combat_loot_money'),loc('wiki_combat_loot_basic'),loc('wiki_combat_loot_common')],
            12: [5],
            13: [loc('civics_garrison_tactic_raid'),4,loc('wiki_combat_loot_money'),loc('wiki_combat_loot_basic'),loc('wiki_combat_loot_common'),loc('wiki_combat_loot_rare')],
            14: [loc('trait_beast_of_burden_name'),loc('wiki_combat_loot_money'),loc('wiki_combat_loot_basic'),loc('wiki_combat_loot_common'),loc('wiki_combat_loot_rare')],
            15: [10],
            16: [loc('civics_garrison_tactic_pillage'),5,loc('wiki_combat_loot_money'),loc('wiki_combat_loot_basic'),loc('wiki_combat_loot_common'),loc('wiki_combat_loot_rare')],
            17: [loc('trait_beast_of_burden_name'),loc('wiki_combat_loot_money'),loc('wiki_combat_loot_basic'),loc('wiki_combat_loot_common'),loc('wiki_combat_loot_rare')],
            18: [25],
            19: [loc('civics_garrison_tactic_assault'),5,loc('wiki_combat_loot_money'),loc('wiki_combat_loot_basic'),loc('wiki_combat_loot_common'),loc('wiki_combat_loot_rare')],
            20: [loc('trait_beast_of_burden_name'),loc('wiki_combat_loot_money'),loc('wiki_combat_loot_basic'),loc('wiki_combat_loot_common'),loc('wiki_combat_loot_rare')],
            21: [50],
            22: [loc('civics_garrison_tactic_siege'),5,loc('wiki_combat_loot_money'),loc('wiki_combat_loot_basic'),loc('wiki_combat_loot_common'),loc('wiki_combat_loot_rare')],
            23: [loc('trait_beast_of_burden_name'),loc('wiki_combat_loot_money'),loc('wiki_combat_loot_basic'),loc('wiki_combat_loot_common'),loc('wiki_combat_loot_rare')],
            24: [loc('civics_garrison_tactic_siege')],
            25: [999],
            28: [`base loot * log(looters + 1)`],
            29: [loc('civics_gov_eco_rate')],
            30: [`floor(loot * economic rating / 100)`]
        },
        data_color: {
            5: ['warning','caution','caution','caution'],
            6: ['warning','caution','caution','caution','caution'],
            7: ['warning','caution','caution'],
            8: ['warning','warning','caution','warning','caution'],
            10: ['warning','warning','caution','caution','caution'],
            11: ['warning','caution','caution','caution'],
            13: ['warning','warning','caution','caution','caution','caution'],
            14: ['warning','caution','caution','caution','caution'],
            16: ['warning','warning','caution','caution','caution','caution'],
            17: ['warning','caution','caution','caution','caution'],
            19: ['warning','warning','caution','caution','caution','caution'],
            20: ['warning','caution','caution','caution','caution'],
            22: ['warning','warning','caution','caution','caution','caution'],
            23: ['warning','caution','caution','caution','caution'],
            28: ['advanced'],
            30: ['advanced'],
        }
    });
    sideMenu('add',`combat-gameplay`,`loot`,loc('wiki_combat_loot'));


    
}
