import { global } from './vars.js';
import { loc } from './locale.js';
import { unlockAchieve } from './achieve.js';

const date = new Date();

export const races = {
    protoplasm: {
        name: loc('race_protoplasm'),
        desc: loc('race_protoplasm_desc'),
        type: 'organism',
        home: loc('race_prehistoric')
    },
    human: {
        name: loc('race_human'),
        desc: loc('race_human_desc'),
        type: 'humanoid',
        home: loc('race_human_home'),
        entity: loc('race_human_entity'),
        traits: {
            creative: 1,
            diverse: 1
        },
        solar: {
            red: loc('race_human_solar_red'),
            hell: loc('race_human_solar_hell'),
            gas: loc('race_human_solar_gas'),
            gas_moon: loc('race_human_solar_gas_moon'),
            dwarf: loc('race_human_solar_dwarf'),
        }
    },
    elven: {
        name: loc('race_elven'),
        desc: loc(date.getMonth() === 11 && date.getDate() >= 17 ? 'race_xmas_elf_desc' : 'race_elven_desc'),
        type: 'humanoid',
        home: loc(date.getMonth() === 11 && date.getDate() >= 17 ? 'race_xmas_elf_home' : 'race_elven_home'),
        entity: loc('race_elven_entity'),
        traits: { 
            studious: 1,
            arrogant: 1
        },
        solar: {
            red: loc(date.getMonth() === 11 && date.getDate() >= 17 ? 'race_xmas_elf_solar_red' : 'race_elven_solar_red'),
            hell: loc(date.getMonth() === 11 && date.getDate() >= 17 ? 'race_xmas_elf_solar_hell' : 'race_elven_solar_hell'),
            gas: loc(date.getMonth() === 11 && date.getDate() >= 17 ? 'race_xmas_elf_solar_gas' : 'race_elven_solar_gas'),
            gas_moon: loc(date.getMonth() === 11 && date.getDate() >= 17 ? 'race_xmas_elf_solar_gas_moon' : 'race_elven_solar_gas_moon'),
            dwarf: loc(date.getMonth() === 11 && date.getDate() >= 17 ? 'race_xmas_elf_solar_dwarf' : 'race_elven_solar_dwarf'),
        }
    },
    orc: {
        name: loc('race_orc'),
        desc: loc('race_orc_desc'),
        type: 'humanoid',
        home: loc('race_orc_home'),
        entity: loc('race_orc_entity'),
        traits: { 
            brute: 1,
            angry: 1
        },
        solar: {
            red: loc('race_orc_solar_red'),
            hell: loc('race_orc_solar_hell'),
            gas: loc('race_orc_solar_gas'),
            gas_moon: loc('race_orc_solar_gas_moon'),
            dwarf: loc('race_orc_solar_dwarf'),
        }
    },
    cath: {
        name: loc('race_cath'),
        desc: loc('race_cath_desc'),
        type: 'animal',
        home: loc('race_cath_home'),
        entity: loc('race_cath_entity'),
        traits: { 
            lazy: 1,
            carnivore: 1
        },
        solar: {
            red: loc('race_cath_solar_red'),
            hell: loc('race_cath_solar_hell'),
            gas: loc('race_cath_solar_gas'),
            gas_moon: loc('race_cath_solar_gas_moon'),
            dwarf: loc('race_cath_solar_dwarf'),
        }
    },
    wolven: {
        name: loc('race_wolven'),
        desc: loc('race_wolven_desc'),
        type: 'animal',
        home: loc('race_wolven_home'),
        entity: loc('race_wolven_entity'),
        traits: { 
            pack_mentality: 1,
            tracker: 1
        },
        solar: {
            red: loc('race_wolven_solar_red'),
            hell: loc('race_wolven_solar_hell'),
            gas: loc('race_wolven_solar_gas'),
            gas_moon: loc('race_wolven_solar_gas_moon'),
            dwarf: loc('race_wolven_solar_dwarf'),
        }
    },
    centaur: {
        name: loc('race_centaur'),
        desc: loc('race_centaur_desc'),
        type: 'animal',
        home: loc('race_centaur_home'),
        entity: loc('race_centaur_entity'),
        traits: {
            beast_of_burden: 1,
            herbivore: 1
        },
        solar: {
            red: loc('race_centaur_solar_red'),
            hell: loc('race_centaur_solar_hell'),
            gas: loc('race_centaur_solar_gas'),
            gas_moon: loc('race_centaur_solar_gas_moon'),
            dwarf: loc('race_centaur_solar_dwarf'),
        }
    },
    kobold: {
        name: loc('race_kobold'),
        desc: loc('race_kobold_desc'),
        type: 'small',
        home: loc('race_kobold_home'),
        entity: loc('race_kobold_entity'),
        traits: {
            pack_rat: 1,
            paranoid: 1
        },
        solar: {
            red: loc('race_kobold_solar_red'),
            hell: loc('race_kobold_solar_hell'),
            gas: loc('race_kobold_solar_gas'),
            gas_moon: loc('race_kobold_solar_gas_moon'),
            dwarf: loc('race_kobold_solar_dwarf'),
        }
    },
    goblin: {
        name: loc('race_goblin'),
        desc: loc('race_goblin_desc'),
        type: 'small',
        home: loc('race_goblin_home'),
        entity: loc('race_goblin_entity'),
        traits: { 
            greedy: 1,
            merchant: 1
        },
        solar: {
            red: loc('race_goblin_solar_red'),
            hell: loc('race_goblin_solar_hell'),
            gas: loc('race_goblin_solar_gas'),
            gas_moon: loc('race_goblin_solar_gas_moon'),
            dwarf: loc('race_goblin_solar_dwarf'),
        }
    },
    gnome: {
        name: loc('race_gnome'),
        desc: loc('race_gnome_desc'),
        type: 'small',
        home: loc('race_gnome_home'),
        entity: loc('race_gnome_entity'),
        traits: { 
            smart: 1,
            puny: 1
        },
        solar: {
            red: loc('race_gnome_solar_red'),
            hell: loc('race_gnome_solar_hell'),
            gas: loc('race_gnome_solar_gas'),
            gas_moon: loc('race_gnome_solar_gas_moon'),
            dwarf: loc('race_gnome_solar_dwarf'),
        }
    },
    orge: {
        name: loc('race_ogre'),
        desc: loc('race_ogre_desc'),
        type: 'giant',
        home: loc('race_orge_home'),
        entity: loc('race_ogre_entity'),
        traits: { 
            dumb: 1,
            tough: 1
        },
        solar: {
            red: loc('race_orge_solar_red'),
            hell: loc('race_orge_solar_hell'),
            gas: loc('race_orge_solar_gas'),
            gas_moon: loc('race_orge_solar_gas_moon'),
            dwarf: loc('race_orge_solar_dwarf'),
        }
    },
    cyclops: {
        name: loc('race_cyclops'),
        desc: loc('race_cyclops_desc'),
        type: 'giant',
        home: loc('race_cyclops_home'),
        entity: loc('race_cyclops_entity'),
        traits: {
            nearsighted: 1,
            intelligent: 1
        },
        solar: {
            red: loc('race_cyclops_solar_red'),
            hell: loc('race_cyclops_solar_hell'),
            gas: loc('race_cyclops_solar_gas'),
            gas_moon: loc('race_cyclops_solar_gas_moon'),
            dwarf: loc('race_cyclops_solar_dwarf'),
        }
    },
    troll: {
        name: loc('race_troll'),
        desc: loc('race_troll_desc'),
        type: 'giant',
        home: loc('race_troll_home'),
        entity: loc('race_troll_entity'),
        traits: {
            regenerative: 1,
            gluttony: 1
        },
        solar: {
            red: loc('race_troll_solar_red'),
            hell: loc('race_troll_solar_hell'),
            gas: loc('race_troll_solar_gas'),
            gas_moon: loc('race_troll_solar_gas_moon'),
            dwarf: loc('race_troll_solar_dwarf'),
        }
    },
    tortoisan: {
        name: loc('race_tortoisan'),
        desc: loc('race_tortoisan_desc'),
        type: 'reptilian',
        home: loc('race_tortoisan_home'),
        entity: loc('race_tortoisan_entity'),
        traits: { 
            slow: 1,
            armored: 1
        },
        solar: {
            red: loc('race_tortoisan_solar_red'),
            hell: loc('race_tortoisan_solar_hell'),
            gas: loc('race_tortoisan_solar_gas'),
            gas_moon: loc('race_tortoisan_solar_gas_moon'),
            dwarf: loc('race_tortoisan_solar_dwarf'),
        }
    },
    gecko: {
        name: loc('race_gecko'),
        desc: loc('race_gecko_desc'),
        type: 'reptilian',
        home: loc('race_gecko_home'),
        entity: loc('race_gecko_entity'),
        traits: {
            optimistic: 1,
            chameleon: 1
        },
        solar: {
            red: loc('race_gecko_solar_red'),
            hell: loc('race_gecko_solar_hell'),
            gas: loc('race_gecko_solar_gas'),
            gas_moon: loc('race_gecko_solar_gas_moon'),
            dwarf: loc('race_gecko_solar_dwarf'),
        }
    },
    slitheryn: {
        name: loc('race_slitheryn'),
        desc: loc('race_slitheryn_desc'),
        type: 'reptilian',
        home: loc('race_slitheryn_home'),
        entity: loc('race_slitheryn_entity'),
        traits: {
            slow_digestion: 1,
            hard_of_hearing: 1
        },
        solar: {
            red: loc('race_slitheryn_solar_red'),
            hell: loc('race_slitheryn_solar_hell'),
            gas: loc('race_slitheryn_solar_gas'),
            gas_moon: loc('race_slitheryn_solar_gas_moon'),
            dwarf: loc('race_slitheryn_solar_dwarf'),
        }
    },
    arraak: {
        name: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey' : 'race_arraak'),
        desc: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey_desc' : 'race_arraak_desc'),
        type: 'avian',
        home: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey_home' : 'race_arraak_home'),
        entity: loc('race_arraak_entity'),
        traits: {
            resourceful: 1,
            selenophobia: 1
        },
        solar: {
            red: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey_solar_red' : 'race_arraak_solar_red'),
            hell: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey_solar_hell' : 'race_arraak_solar_hell'),
            gas: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey_solar_gas' : 'race_arraak_solar_gas'),
            gas_moon: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey_solar_gas_moon' : 'race_arraak_solar_gas_moon'),
            dwarf: loc(date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28 ? 'race_turkey_solar_dwarf' : 'race_arraak_solar_dwarf'),
        }
    },
    pterodacti: {
        name: loc('race_pterodacti'),
        desc: loc('race_pterodacti_desc'),
        type: 'avian',
        home: loc('race_pterodacti_home'),
        entity: loc('race_pterodacti_entity'),
        traits: {
            leathery: 1,
            pessimistic: 1
        },
        solar: {
            red: loc('race_pterodacti_solar_red'),
            hell: loc('race_pterodacti_solar_hell'),
            gas: loc('race_pterodacti_solar_gas'),
            gas_moon: loc('race_pterodacti_solar_gas_moon'),
            dwarf: loc('race_pterodacti_solar_dwarf'),
        }
    },
    dracnid: {
        name: loc('race_dracnid'),
        desc: loc('race_dracnid_desc'),
        type: 'avian',
        home: loc('race_dracnid_home'),
        entity: loc('race_dracnid_entity'),
        traits: {
            hoarder: 1,
            solitary: 1
        },
        solar: {
            red: loc('race_dracnid_solar_red'),
            hell: loc('race_dracnid_solar_hell'),
            gas: loc('race_dracnid_solar_gas'),
            gas_moon: loc('race_dracnid_solar_gas_moon'),
            dwarf: loc('race_dracnid_solar_dwarf'),
        }
    },
    entish: {
        name: loc('race_entish'),
        desc: loc('race_entish_desc'),
        type: 'plant',
        home: loc('race_entish_home'),
        entity: loc('race_entish_entity'),
        traits: {
            kindling_kindred: 1,
            pyrophobia: 1
        },
        solar: {
            red: loc('race_entish_solar_red'),
            hell: loc('race_entish_solar_hell'),
            gas: loc('race_entish_solar_gas'),
            gas_moon: loc('race_entish_solar_gas_moon'),
            dwarf: loc('race_entish_solar_dwarf'),
        }
    },
    cacti: {
        name: loc('race_cacti'),
        desc: loc('race_cacti_desc'),
        type: 'plant',
        home: loc('race_cacti_home'),
        entity: loc('race_cacti_entity'),
        traits: {
            hyper: 1,
            skittish: 1
        },
        solar: {
            red: loc('race_cacti_solar_red'),
            hell: loc('race_cacti_solar_hell'),
            gas: loc('race_cacti_solar_gas'),
            gas_moon: loc('race_cacti_solar_gas_moon'),
            dwarf: loc('race_cacti_solar_dwarf'),
        }
    },
    sporgar: {
        name: loc('race_sporgar'),
        desc: loc('race_sporgar_desc'),
        type: 'fungi',
        home: loc('race_sporgar_home'),
        entity: loc('race_sporgar_entity'),
        traits: {
            infectious: 1,
            parasite: 1
        },
        solar: {
            red: loc('race_sporgar_solar_red'),
            hell: loc('race_sporgar_solar_hell'),
            gas: loc('race_sporgar_solar_gas'),
            gas_moon: loc('race_sporgar_solar_gas_moon'),
            dwarf: loc('race_sporgar_solar_dwarf'),
        }
    },
    shroomi: {
        name: loc('race_shroomi'),
        desc: loc('race_shroomi_desc'),
        type: 'fungi',
        home: loc('race_shroomi_home'),
        entity: loc('race_shroomi_entity'),
        traits: {
            toxic: 1,
            nyctophilia: 1
        },
        solar: {
            red: loc('race_shroomi_solar_red'),
            hell: loc('race_shroomi_solar_hell'),
            gas: loc('race_shroomi_solar_gas'),
            gas_moon: loc('race_shroomi_solar_gas_moon'),
            dwarf: loc('race_shroomi_solar_dwarf'),
        }
    },
    mantis: {
        name: loc('race_mantis'),
        desc: loc('race_mantis_desc'),
        type: 'insectoid',
        home: loc('race_mantis_home'),
        entity: loc('race_mantis_entity'),
        traits: {
            cannibalize: 1,
            malnutrition: 1
        },
        solar: {
            red: loc('race_mantis_solar_red'),
            hell: loc('race_mantis_solar_hell'),
            gas: loc('race_mantis_solar_gas'),
            gas_moon: loc('race_mantis_solar_gas_moon'),
            dwarf: loc('race_mantis_solar_dwarf'),
        }
    },
    scorpid: {
        name: loc('race_scorpid'),
        desc: loc('race_scorpid_desc'),
        type: 'insectoid',
        home: loc('race_scorpid_home'),
        entity: loc('race_scorpid_entity'),
        traits: {
            claws: 1,
            atrophy: 1
        },
        solar: {
            red: loc('race_scorpid_solar_red'),
            hell: loc('race_scorpid_solar_hell'),
            gas: loc('race_scorpid_solar_gas'),
            gas_moon: loc('race_scorpid_solar_gas_moon'),
            dwarf: loc('race_scorpid_solar_dwarf'),
        }
    },
    antid: {
        name: loc('race_antid'),
        desc: loc('race_antid_desc'),
        type: 'insectoid',
        home: loc('race_antid_home'),
        entity: loc('race_antid_entity'),
        traits: {
            hivemind: 1,
            tunneler: 1
        },
        solar: {
            red: loc('race_antid_solar_red'),
            hell: loc('race_antid_solar_hell'),
            gas: loc('race_antid_solar_gas'),
            gas_moon: loc('race_antid_solar_gas_moon'),
            dwarf: loc('race_antid_solar_dwarf'),
        }
    },
    sharkin: {
        name: loc('race_sharkin'),
        desc: loc('race_sharkin_desc'),
        type: 'aquatic',
        home: loc('race_sharkin_home'),
        entity: loc('race_sharkin_entity'),
        traits: {
            frenzy: 1,
            apex_predator: 1
        },
        solar: {
            red: loc('race_sharkin_solar_red'),
            hell: loc('race_sharkin_solar_hell'),
            gas: loc('race_sharkin_solar_gas'),
            gas_moon: loc('race_sharkin_solar_gas_moon'),
            dwarf: loc('race_sharkin_solar_dwarf'),
        }
    },
    octigoran: {
        name: loc('race_octigoran'),
        desc: loc('race_octigoran_desc'),
        type: 'aquatic',
        home: loc('race_octigoran_home'),
        entity: loc('race_octigoran_entity'),
        traits: {
            invertebrate: 1,
            suction_grip: 1
        },
        solar: {
            red: loc('race_octigoran_solar_red'),
            hell: loc('race_octigoran_solar_hell'),
            gas: loc('race_octigoran_solar_gas'),
            gas_moon: loc('race_octigoran_solar_gas_moon'),
            dwarf: loc('race_octigoran_solar_dwarf'),
        }
    },
    dryad: {
        name: loc('race_dryad'),
        desc: loc('race_dryad_desc'),
        type: 'fey',
        home: loc('race_dryad_home'),
        entity: loc('race_dryad_entity'),
        traits: {
            befuddle: 1,
            environmentalist: 1,
            kindling_kindred: 1
        },
        solar: {
            red: loc('race_dryad_solar_red'),
            hell: loc('race_dryad_solar_hell'),
            gas: loc('race_dryad_solar_gas'),
            gas_moon: loc('race_dryad_solar_gas_moon'),
            dwarf: loc('race_dryad_solar_dwarf'),
        }
    },
    satyr: {
        name: loc('race_satyr'),
        desc: loc('race_satyr_desc'),
        type: 'fey',
        home: loc('race_satyr_home'),
        entity: loc('race_satyr_entity'),
        traits: {
            unorganized: 1,
            musical: 1
        },
        solar: {
            red: loc('race_satyr_solar_red'),
            hell: loc('race_satyr_solar_hell'),
            gas: loc('race_satyr_solar_gas'),
            gas_moon: loc('race_satyr_solar_gas_moon'),
            dwarf: loc('race_satyr_solar_dwarf'),
        }
    },
    phoenix: {
        name: loc('race_phoenix'),
        desc: loc('race_phoenix_desc'),
        type: 'heat',
        home: loc('race_phoenix_home'),
        entity: loc('race_phoenix_entity'),
        traits: {
            revive: 1,
            slow_regen: 1
        },
        solar: {
            red: loc('race_phoenix_solar_red'),
            hell: loc('race_phoenix_solar_hell'),
            gas: loc('race_phoenix_solar_gas'),
            gas_moon: loc('race_phoenix_solar_gas_moon'),
            dwarf: loc('race_phoenix_solar_dwarf'),
        }
    },
    salamander: {
        name: loc('race_salamander'),
        desc: loc('race_salamander_desc'),
        type: 'heat',
        home: loc('race_salamander_home'),
        entity: loc('race_salamander_entity'),
        traits: {
            forge: 1,
            autoignition: 1
        },
        solar: {
            red: loc('race_salamander_solar_red'),
            hell: loc('race_salamander_solar_hell'),
            gas: loc('race_salamander_solar_gas'),
            gas_moon: loc('race_salamander_solar_gas_moon'),
            dwarf: loc('race_salamander_solar_dwarf'),
        }
    },
    yeti: {
        name: loc('race_yeti'),
        desc: loc('race_yeti_desc'),
        type: 'polar',
        home: loc('race_yeti_home'),
        entity: loc('race_yeti_entity'),
        traits: {
            blurry: 1,
            snowy: 1
        },
        solar: {
            red: loc('race_yeti_solar_red'),
            hell: loc('race_yeti_solar_hell'),
            gas: loc('race_yeti_solar_gas'),
            gas_moon: loc('race_yeti_solar_gas_moon'),
            dwarf: loc('race_yeti_solar_dwarf'),
        }
    },
    wendigo: {
        name: loc('race_wendigo'),
        desc: loc('race_wendigo_desc'),
        type: 'polar',
        home: loc('race_wendigo_home'),
        entity: loc('race_wendigo_entity'),
        traits: {
            ravenous: 1,
            ghostly: 1,
            soul_eater: 1
        },
        solar: {
            red: loc('race_wendigo_solar_red'),
            hell: loc('race_wendigo_solar_hell'),
            gas: loc('race_wendigo_solar_gas'),
            gas_moon: loc('race_wendigo_solar_gas_moon'),
            dwarf: loc('race_wendigo_solar_dwarf'),
        }
    },
    tuskin: {
        name: loc('race_tuskin'),
        desc: loc('race_tuskin_desc'),
        type: 'sand',
        home: loc('race_tuskin_home'),
        entity: loc('race_tuskin_entity'),
        traits: {
            lawless: 1,
            mistrustful: 1
        },
        solar: {
            red: loc('race_tuskin_solar_red'),
            hell: loc('race_tuskin_solar_hell'),
            gas: loc('race_tuskin_solar_gas'),
            gas_moon: loc('race_tuskin_solar_gas_moon'),
            dwarf: loc('race_tuskin_solar_dwarf'),
        }
    },
    kamel: {
        name: loc('race_kamel'),
        desc: loc('race_kamel_desc'),
        type: 'sand',
        home: loc('race_kamel_home'),
        entity: loc('race_kamel_entity'),
        traits: {
            humpback: 1,
            thalassophobia: 1
        },
        solar: {
            red: loc('race_kamel_solar_red'),
            hell: loc('race_kamel_solar_hell'),
            gas: loc('race_kamel_solar_gas'),
            gas_moon: loc('race_kamel_solar_gas_moon'),
            dwarf: loc('race_kamel_solar_dwarf')
        }
    },
    balorg: {
        name: loc('race_balorg'),
        desc: loc('race_balorg_desc'),
        type: 'demonic',
        home: loc('race_balorg_home'),
        entity: loc('race_balorg_entity'),
        traits: {
            fiery: 1,
            terrifying: 1,
            slaver: 1
        },
        solar: {
            red: loc('race_balorg_solar_red'),
            hell: loc('race_balorg_solar_hell'),
            gas: loc('race_balorg_solar_gas'),
            gas_moon: loc('race_balorg_solar_gas_moon'),
            dwarf: loc('race_balorg_solar_dwarf'),
        }
    },
    imp: {
        name: loc('race_imp'),
        desc: loc('race_imp_desc'),
        type: 'demonic',
        home: loc('race_imp_home'),
        entity: loc('race_imp_entity'),
        traits: {
            compact: 1,
            conniving: 1,
            pathetic: 1,
        },
        solar: {
            red: loc('race_imp_solar_red'),
            hell: loc('race_imp_solar_hell'),
            gas: loc('race_imp_solar_gas'),
            gas_moon: loc('race_imp_solar_gas_moon'),
            dwarf: loc('race_imp_solar_dwarf'),
        }
    },
    seraph: {
        name: loc('race_seraph'),
        desc: loc('race_seraph_desc'),
        type: 'angelic',
        home: loc('race_seraph_home'),
        entity: loc('race_seraph_entity'),
        traits: {
            unified: 1,
            spiritual: 1,
            truthful: 1
        },
        solar: {
            red: loc('race_seraph_solar_red'),
            hell: loc('race_seraph_solar_hell'),
            gas: loc('race_seraph_solar_gas'),
            gas_moon: loc('race_seraph_solar_gas_moon'),
            dwarf: loc('race_seraph_solar_dwarf'),
        }
    },
    unicorn: {
        name: loc('race_unicorn'),
        desc: loc('race_unicorn_desc'),
        type: 'angelic',
        home: loc('race_unicorn_home'),
        entity: loc('race_unicorn_entity'),
        traits: {
            rainbow: 1,
            magnificent: 1,
            noble: 1,
        },
        solar: {
            red: loc('race_unicorn_solar_red'),
            hell: loc('race_unicorn_solar_hell'),
            gas: loc('race_unicorn_solar_gas'),
            gas_moon: loc('race_unicorn_solar_gas_moon'),
            dwarf: loc('race_unicorn_solar_dwarf'),
        }
    },
    junker: {
        name: loc('race_junker'),
        desc: loc('race_junker_desc'),
        type: 'humanoid',
        home: loc('race_junker_home'),
        entity: loc('race_junker_entity'),
        traits: {
            diverse: 1,
            arrogant: 1,
            angry: 1,
            lazy: 1,
            herbivore: 1,
            paranoid: 1,
            greedy: 1,
            puny: 1,
            dumb: 1,
            nearsighted: 1,
            gluttony: 1,
            slow: 1,
            hard_of_hearing: 1,
            pessimistic: 1,
            solitary: 1,
            pyrophobia: 1,
            skittish: 1,
            nyctophilia: 1,
            frail: 1,
            atrophy: 1,
            invertebrate: 1,
            pathetic: 1,
        },
        solar: {
            red: loc('race_junker_solar_red'),
            hell: loc('race_junker_solar_hell'),
            gas: loc('race_junker_solar_gas'),
            gas_moon: loc('race_junker_solar_gas_moon'),
            dwarf: loc('race_junker_solar_dwarf'),
        }
    }
};

export const genus_traits = {
    humanoid: {
        adaptable: 1,
        wasteful: 1
    },
    animal: {
        beast: 1,
        cautious: 1
    },
    small: {
        small: 1,
        weak: 1
    },
    giant: {
        large: 1,
        strong: 1
    },
    reptilian: {
        cold_blooded: 1,
        scales: 1
    },
    avian: {
        hollow_bones: 1,
        rigid: 1
    },
    insectoid: {
        fast_growth: 1,
        high_metabolism: 1
    },
    plant: {
        photosynth: 1,
        asymmetrical: 1
    },
    fungi: {
        spores: 1,
        spongy: 1
    },
    aquatic: {
        submerged: 1,
        low_light: 1
    },
    fey: {
        elusive: 1,
        iron_allergy: 1
    },
    heat: {
        smoldering: 1,
        cold_intolerance: 1
    },
    polar: {
        chilled: 1,
        heat_intolerance: 1
    },
    sand: {
        scavenger: 1,
        nomadic: 1
    },
    demonic: {
        immoral: 1,
        evil: 1,
        soul_eater: 1
    },
    angelic: {
        blissful: 1,
        pompous: 1,
    }
};

export const traits = {
    adaptable: { // Genetic Mutations occur faster from gene tampering
        desc: loc('trait_adaptable'),
        type: 'genus',
    },
    wasteful: { // Craftings cost more materials
        desc: loc('trait_wasteful'),
        type: 'genus',
    },
    xenophobic: { // Trade posts suffer a -1 penalty per post
        desc: loc('trait_xenophobic'),
        type: 'genus',
    },
    beast: { // Hunting improved when it's windy
        desc: loc('trait_beast'),
        type: 'genus',
    },
    cautious: { // Rain reduces combat rating
        desc: loc('trait_cautious'),
        type: 'genus',
    },
    small: { // Reduces cost creep multipliers by 0.01
        desc: loc('trait_small'),
        type: 'genus',
    },
    weak: { // Lumberjacks, miners, and quarry workers are 10% less effective
        desc: loc('trait_weak'),
        type: 'genus',
    },
    large: { // Increases cost creep multipliers by 0.01
        desc: loc('trait_large'),
        type: 'genus',
    },
    strong: { // Increased manual resource gain
        desc: loc('trait_strong'),
        type: 'genus',
    },
    cold_blooded: { // Weather affects productivity
        desc: loc('trait_cold_blooded'),
        type: 'genus',
    },
    scales: { // Minor decrease of soldiers killed in combat
        desc: loc('trait_scales'),
        type: 'genus',
    },
    hollow_bones: { // Less Crafted Materials Needed
        desc: loc('trait_hollow_bones'),
        type: 'genus',
    },
    rigid: { // Crafting production lowered slightly
        desc: loc('trait_rigid'),
        type: 'genus',
    },
    fast_growth: { // Greatly increases odds of population growth each cycle
        desc: loc('trait_fast_growth'),
        type: 'genus',
    },
    high_metabolism: { // Food requirements increased by 10%
        desc: loc('trait_high_metabolism'),
        type: 'genus',
    },
    photosynth: { // Reduces food requirements dependant on sunshine.
        desc: loc('trait_photosynth'),
        type: 'genus',
    },
    asymmetrical: { // Trade selling prices are slightly worse then normal
        desc: loc('trait_asymmetrical'),
        type: 'genus',
    },
    spores: { // Birthrate increased when it's windy
        desc: loc('trait_spores'),
        type: 'genus',
    },
    spongy: { // Birthrate decreased when it's raining
        desc: loc('trait_spongy'),
        type: 'genus',
    },
    submerged: { // Immune to weather effects
        desc: loc('trait_submerged'),
        type: 'genus',
    },
    low_light: { // Farming effectiveness decreased
        desc: loc('trait_low_light'),
        type: 'genus',
    },
    elusive: { // Spies are never caught
        desc: loc('trait_elusive'),
        type: 'genus',
    },
    iron_allergy: { // Iron mining reduced
        desc: loc('trait_iron_allergy'),
        type: 'genus',
    },
    smoldering: { // Hot weather is a bonus
        desc: loc('trait_smoldering'),
        type: 'genus',
    },
    cold_intolerance: { // Cold weather is a detriment
        desc: loc('trait_cold_intolerance'),
        type: 'genus',
    },
    chilled: { // Cold weather is a bonus
        desc: loc('trait_chilled'),
        type: 'genus',
    },
    heat_intolerance: { // Hot weather is a detriment
        desc: loc('trait_heat_intolerance'),
        type: 'genus',
    },
    scavenger: { // scavenger job is always available
        desc: loc('trait_scavenger'),
        type: 'genus',
    },
    nomadic: { // -1 Trade route from trade post
        desc: loc('trait_nomadic'),
        type: 'genus',
    },
    immoral: { // Warmonger is a bonus instead of a penalty
        desc: loc('trait_immoral'),
        type: 'genus',
    },
    evil: { // You are pure evil
        desc: loc('trait_evil'),
        type: 'genus',
    },
    blissful: { // Low morale penalty is halved and citizens never riot.
        desc: loc('trait_blissful'),
        type: 'genus',
    },
    pompous: { // Professors are less effective
        desc: loc('trait_pompous'),
        type: 'genus',
    },
    creative: { // A.R.P.A. Projects are cheaper
        desc: loc('trait_creative'),
        type: 'major',
    },
    diverse: { // Training soldiers takes longer
        desc: loc('trait_diverse'),
        type: 'major',
    },
    studious: { // Professors generate an extra 0.25 Knowledge per second
        desc: loc('trait_studious'),
        type: 'major',
    },
    arrogant: { // Market prices are higher
        desc: loc('trait_arrogant'),
        type: 'major',
    },
    brute: { // Recruitment costs are 1/2 price
        desc: loc('trait_brute'),
        type: 'major',
    },
    angry: { // When hungry you get hangry, low food penalty is more severe
        desc: loc('trait_angry'),
        type: 'major',
    },
    lazy: { // All production is lowered when the temperature is hot
        desc: loc('trait_lazy'),
        type: 'major',
    },
    carnivore: { // No agriculture tech tree path, however unemployed citizens now act as hunters.
        desc: loc('trait_carnivore'),
        type: 'major',
    },
    pack_mentality: { // Cabins cost more, but cottages cost less.
        desc: loc('trait_pack_mentality'),
        type: 'major',
    },
    tracker: { // 10% increased gains from hunting
        desc: loc('trait_tracker'),
        type: 'major',
    },
    beast_of_burden: { // Gains more loot during raids
        desc: loc('trait_beast_of_burden'),
        type: 'major',
    },
    herbivore: { // No food is gained from hunting
        desc: loc('trait_herbivore'),
        type: 'major',
    },
    pack_rat: { // Storage space is increased
        desc: loc('trait_pack_rat'),
        type: 'major',
    },
    paranoid: { // Bank capacity reduced by 10%
        desc: loc('trait_paranoid'),
        type: 'major',
    },
    greedy: { // Lowers income from taxes
        desc: loc('trait_greedy'),
        type: 'major',
    },
    merchant: { // Better commodity selling prices
        desc: loc('trait_merchant'),
        type: 'major',
    },
    smart: { // Knowledge costs reduced by 10%
        desc: loc('trait_smart'),
        type: 'major',
    },
    puny: { // Lowers minium bound for army score roll
        desc: loc('trait_puny'),
        type: 'major',
    },
    dumb: { // Knowledge costs increased by 5%
        desc: loc('trait_dumb'),
        type: 'major',
    },
    tough: { // Mining output increased by 25%
        desc: loc('trait_tough'),
        type: 'major',
    },
    nearsighted: { // Libraries are less effective
        desc: loc('trait_nearsighted'),
        type: 'major',
    },
    intelligent: { // Professors and Scientists add a global production bonus
        desc: loc('trait_intelligent'),
        type: 'major',
    },
    regenerative: { // Wounded soldiers heal 4x as fast
        desc: loc('trait_regenerative'),
        type: 'major',
    },
    gluttony: { // Eats 25% more food per rank
        desc: loc('trait_gluttony'),
        type: 'major',
    },
    slow: { // The game moves at a 10% slower pace
        desc: loc('trait_slow'),
        type: 'major',
    },
    armored: { // Less soldiers die in combat
        desc: loc('trait_armored'),
        type: 'major',
    },
    optimistic: { // Minor reduction to stress
        desc: loc('trait_optimistic'),
        type: 'major',
    },
    chameleon: { // Barracks have less soldiers
        desc: loc('trait_chameleon'),
        type: 'major',
    },
    slow_digestion: { // Your race is more resilient to starvation
        desc: loc('trait_slow_digestion'),
        type: 'major',
    },
    hard_of_hearing: { // University science cap gain reduced by 5%
        desc: loc('trait_hard_of_hearing'),
        type: 'major',
    },
    resourceful: { // Crafting costs are reduced slightly
        desc: loc('trait_resourceful'),
        type: 'major',
    },
    selenophobia: { // Moon phase directly affects productivity, on average this is slightly negative
        desc: loc('trait_selenophobia'),
        type: 'major',
    },
    leathery: { // Morale penalty from some weather conditions are reduced.
        desc: loc('trait_leathery'),
        type: 'major',
    },
    pessimistic: { // Minor increase to stress
        desc: loc('trait_pessimistic'),
        type: 'major',
    },
    hoarder: { // Banks can store 20% more money
        desc: loc('trait_hoarder'),
        type: 'major',
    },
    solitary: { // Cabins are cheaper however cottages cost more
        desc: loc('trait_solitary'),
        type: 'major',
    },
    kindling_kindred: { // Lumber is no longer a resource, however other costs are increased for anything that would have used lumber to compensate.
        desc: loc('trait_kindling_kindred'),
        type: 'major',
    },
    pyrophobia: { // Smelter productivity is reduced
        desc: loc('trait_pyrophobia'),
        type: 'major',
    },
    hyper: { // The game moves at a 5% faster pace
        desc: loc('trait_hyper'),
        type: 'major',
    },
    skittish: { // Thunderstorms lower all production
        desc: loc('trait_skittish'),
        type: 'major',
    },
    infectious: { // Attacking has a chance to infect other creatures and grow your population
        desc: loc('trait_infectious'),
        type: 'major',
    },
    parasite: { // You can only reproduce by infecting victims, spores sometimes find a victim when it's windy
        desc: loc('trait_parasite'),
        type: 'major',
    },
    toxic: { // Factory type jobs are more productive
        desc: loc('trait_toxic'),
        type: 'major',
    },
    nyctophilia: { // Productivity is lost when it is sunny
        desc: loc('trait_nyctophilia'),
        type: 'major',
    },
    cannibalize: { // Eat your own for buffs
        desc: loc('trait_cannibalize'),
        type: 'major',
    },
    frail: { // More soldiers die in combat
        desc: loc('trait_frail'),
        type: 'major',
    },
    malnutrition: { // The rationing penalty is weaker
        desc: loc('trait_malnutrition'),
        type: 'major',
    },
    claws: { // Raises maximum bound for army score roll
        desc: loc('trait_claws'),
        type: 'major',
    },
    atrophy: { // More prone to starvation
        desc: loc('trait_atrophy'),
        type: 'major',
    },
    hivemind: { // Jobs with low citizen counts assigned to them have reduced output, but those with high numbers have increased output. 
        desc: loc('trait_hivemind'),
        type: 'major',
    },
    tunneler: { // Mines and Coal Mines are cheaper. 
        desc: loc('trait_tunneler'),
        type: 'major',
    },
    frenzy: { // Combat causes a temporary increase in morale
        desc: loc('trait_frenzy'),
        type: 'major',
    },
    apex_predator: { // Hunting and Combat ratings are significantly higher, but you can't use armor
        desc: loc('trait_apex_predator'),
        type: 'major',
    },
    invertebrate: { // You have no bones
        desc: loc('trait_invertebrate'),
        type: 'major',
    },
    suction_grip: { // Global productivity boost
        desc: loc('trait_suction_grip'),
        type: 'major',
    },
    befuddle: { // Spy actions complete in 1/2 time
        desc: loc('trait_befuddle'),
        type: 'major',
    },
    environmentalist: { // Use renewable energy instead of dirtly coal & oil power.
        desc: loc('trait_environmentalist'),
        type: 'major',
    },
    unorganized: { // Increased time between revolutions
        desc: loc('trait_unorganized'),
        type: 'major',
    },
    musical: { // Entertainers are more effective
        desc: loc('trait_musical'),
        type: 'major',
    },
    revive: { // Soldiers sometimes self res
        desc: loc('trait_revive'),
        type: 'major',
    },
    slow_regen: { // Your soldiers wounds heal slower.
        desc: loc('trait_slow_regen'),
        type: 'major',
    },
    forge: { // Smelters do not require fuel
        desc: loc('trait_forge'),
        type: 'major',
    },
    autoignition: { // Library knowledge bonus reduced
        desc: loc('trait_autoignition'),
        type: 'major',
    },
    blurry: { // Increased success chance of spies
        desc: loc('trait_blurry'),
        type: 'major',
    },
    snowy: { // You lose morale if it's not snowing
        desc: loc('trait_snowy'),
        type: 'major',
    },
    ravenous: { // Drastically increases food consumption
        desc: loc('trait_ravenous'),
        type: 'major',
    },
    ghostly: { // More souls from hunting and soul wells, increased soul gem drop chance
        desc: loc('trait_ghostly'),
        type: 'major',
    },
    lawless: { // Government lockout timer is reduced by 90%
        desc: loc('trait_lawless'),
        type: 'major',
    },
    mistrustful: { // Lose standing with rival cities quicker
        desc: loc('trait_mistrustful'),
        type: 'major',
    },
    humpback: { // Starvation resistance and miner/lumberjack boost
        desc: loc('trait_humpback'),
        type: 'major',
    },
    thalassophobia: { // Wharves are unavailable
        desc: loc('trait_thalassophobia'),
        type: 'major',
    },
    fiery: { // Major war bonus
        desc: loc('trait_fiery'),
        type: 'major',
    },
    terrifying: { // No one will trade with you
        desc: loc('trait_terrifying'),
        type: 'major',
    },
    slaver: { // You capture victims and force them to work for you
        desc: loc('trait_slaver'),
        type: 'major',
    },
    compact: { // You hardly take up any space at all
        desc: loc('trait_compact'),
        type: 'major',
    },
    conniving: { // Better trade deals
        desc: loc('trait_conniving'),
        type: 'major',
    },
    pathetic: { // You suck at combat
        desc: loc('trait_pathetic'),
        type: 'major',
    },
    spiritual: { // Temples are 13% more effective
        desc: loc('trait_spiritual'),
        type: 'major',
    },
    truthful: { // Bankers are less effective
        desc: loc('trait_truthful'),
        type: 'major',
    },
    unified: { // Start with unification
        desc: loc('trait_unified'),
        type: 'major',
    },
    rainbow: { // Gain a bonus if sunny after raining
        desc: loc('trait_rainbow'),
        type: 'major',
    },
    magnificent: { // construct shrines to receive boons
        desc: loc('trait_magnificent'),
        type: 'major',
    },
    noble: { // Unable to raise taxes above base value or set very low taxes
        desc: loc('trait_noble'),
        type: 'major',
    },
    tactical: { // War Bonus
        desc: loc('trait_tactical'),
        type: 'minor',
    },
    analytical: { // Science Bonus
        desc: loc('trait_analytical'),
        type: 'minor',
    },
    promiscuous: { // Population Growth Bonus
        desc: loc('trait_promiscuous'),
        type: 'minor',
    },
    resilient: { // Coal Mining Bonus
        desc: loc('trait_resilient'),
        type: 'minor',
    },
    cunning: { // Hunting Bonus
        desc: loc('trait_cunning'),
        type: 'minor',
    },
    hardy: { // Factory Woker Bonus
        desc: loc('trait_hardy'),
        type: 'minor',
    },
    ambidextrous: { // Crafting Bonus
        desc: loc('trait_ambidextrous'),
        type: 'minor',
    },
    industrious: { // Miner Bonus
        desc: loc('trait_industrious'),
        type: 'minor',
    },
    content: { // Morale Bonus
        desc: loc('trait_content'),
        type: 'minor',
    },
    fibroblast: { // Healing Bonus
        desc: loc('trait_fibroblast'),
        type: 'minor',
    },
    metallurgist: { // Alloy bonus
        desc: loc('trait_metallurgist'),
        type: 'minor',
    },
    gambler: { // Alloy bonus
        desc: loc('trait_gambler'),
        type: 'minor',
    },
    fortify: { // gene fortification
        desc: loc('trait_fortify'),
        type: 'special',
    }
};

/*
types: farmer, miner, lumberjack, science, factory, army, hunting
*/
export function racialTrait(workers,type){
    let modifier = 1; 
    if (type === 'lumberjack' && global.race['evil'] && !global.race['soul_eater']){
        modifier *= 1 + ((global.tech['reclaimer'] - 1) * 0.4);
    }
    if (global.race['hivemind'] && type !== 'farmer'){
        if (workers <= 10){
            modifier *= (workers * 0.05) + 0.5;
        }
        else {
            let mod = type === 'army' ? 0.99 : 0.98;
            modifier *= 1 + (1 - (mod ** (workers - 10)));
        }
    }
    if(global.race['cold_blooded'] && type !== 'army' && type !== 'factory' && type !== 'science'){
        switch(global.city.calendar.temp){
            case 0:
                modifier *= 0.8;
                break;
            case 2:
                modifier *= 1.1;
                break;
            default:
                modifier *= 1;
                break;
        }
        switch(global.city.calendar.weather){
            case 0:
                modifier *= 0.8;
                break;
            case 2:
                modifier *= 1.1;
                break;
            default:
                modifier *= 1;
                break;
        }
    }
    if (global.race['cannibalize'] && global.city['s_alter'] && global.city['s_alter'].count > 0){
        if (type === 'miner' && global.city.s_alter.mine > 0){
            modifier *= 1.15; 
        }
        if (type === 'lumberjack' && global.city.s_alter.harvest > 0){
            modifier *= 1.15; 
        }
        if (type === 'army' && global.city.s_alter.rage > 0){
            modifier *= 1.15; 
        }
        if (type === 'science' && global.city.s_alter.mind > 0){
            modifier *= 1.15; 
        }
    }
    if (global.race['humpback'] && (type === 'miner' || type === 'lumberjack')){
        modifier *= 1.2;
    }
    if (global.city.ptrait === 'magnetic' && type === 'miner'){
        modifier *= 0.985;
    }
    if (global.race['weak'] && (type === 'miner' || type === 'lumberjack')){
        modifier *= 0.9;
    }
    if (global.race['hydrophilic'] && global.city.calendar.weather === 0 && global.city.calendar.temp > 0 && type !== 'factory'){
        modifier *= 0.75;
    }
    if (global.race['toxic'] && type === 'factory'){
        modifier *= 1.3;
    }
    if (global.race['hardy'] && type === 'factory'){
        modifier *= 1 + (global.race['hardy'] / 100);
    }
    if (global.race['analytical'] && type === 'science'){
        modifier *= 1 + (global.race['analytical'] / 100);
    }
    if (global.civic.govern.type === 'democracy'){
        modifier *= 0.95;
    }
    return modifier;
}

export function randomMinorTrait(){
    let trait_list = [];
    Object.keys(traits).forEach(function (t){
        if (traits[t].type === 'minor' && !global.race[t]){
            trait_list.push(t);
        }
    });
    if (trait_list.length === 0){
        Object.keys(traits).forEach(function (t){
            if (traits[t].type === 'minor'){
                trait_list.push(t);
            }
        });
    }
    let trait = trait_list[Math.floor(Math.seededRandom(0,trait_list.length))];
    if (global.race[trait]){
        global.race[trait]++;
    }
    else {
        global.race[trait] = 1;
    }
    return trait;
}

export function cleanAddTrait(trait){
    switch (trait){
        case 'kindling_kindred':
            global.resource.Lumber.display = false;
            global.resource.Lumber.crates = 0;
            global.resource.Lumber.containers = 0;
            global.resource.Lumber.trade = 0;
            global.resource.Plywood.display = false;
            global.city['lumber'] = 0;
            if (global.city['sawmill']){
                delete global.city['sawmill'];
            }
            if (global.city['lumber_yard']){
                delete global.city['lumber_yard'];
            }
            delete global.tech['axe'];
            delete global.tech['saw'];
            global.civic.lumberjack.display = false;
            global.civic.lumberjack.workers = 0;
            if (global.tech['foundry']){
                global.civic.craftsman.workers -= global.city.foundry['Plywood'];
                global.city.foundry.crafting -= global.city.foundry['Plywood'];
                global.city.foundry['Plywood'] = 0;
                global['loadFoundry'] = true;
            }
            break;
        case 'carnivore':
            if (global.tech['farm'] >= 1){
                global.tech['hunting'] = 2;
            }
            else if (global.tech['agriculture'] >= 3){
                global.tech['hunting'] = 1;
            }
            if (global.city['farm']){
                global.city['lodge'] = { count: global.city.farm.count };
                delete global.city['farm'];
            }
            if (global.city['silo']){
                global.city['smokehouse'] = { count: global.city.silo.count };
                delete global.city['silo'];
            }
            if (global.city['mill']){
                delete global.city['mill'];
            }
            delete global.tech['agriculture'];
            delete global.tech['farm'];
            global.civic.farmer.workers = 0;
            global.civic.farmer.max = 0;
            global.civic.farmer.display = false;
            break;
        case 'terrifying':
            Object.keys(global.resource).forEach(function (res){
                global.resource[res].trade = 0;
            });
            global.settings.showMarket = false;
            break;
        case 'slaver':
            global.tech['slaves'] = 2;
            global.city['slave_pen'] = { count: 0, slaves: 0 };
            break;
        case 'cannibalize':
            global.city['s_alter'] = {
                count: 0,
                rage: 0,
                mind: 0,
                regen: 0,
                mine: 0,
                harvest: 0,
            };
            break;
        case 'magnificent':
            global.city['shrine'] = {
                count: 0,
                morale: 0,
                metal: 0,
                know: 0,
                tax: 0
            };
            break;
        case 'unified':
            global.tech['world_control'] = 1;
            global.tech['unify'] = 2;
            $('#garrison').empty();
            $('#c_garrison').empty();
            buildGarrison($('#garrison'),true);
            buildGarrison($('#c_garrison'),false);
            for (let i=0; i<3; i++){
                if (global.civic.foreign[`gov${i}`].occ){
                    global.civic['garrison'].max += 20;
                    global.civic['garrison'].workers += 20;
                    global.civic.foreign[`gov${i}`].occ = false;
                }
                global.civic.foreign[`gov${i}`].sab = 0;
                global.civic.foreign[`gov${i}`].act = 'none';
            }
            break;
        case 'noble':
            if (global.civic.taxes.tax_rate < 10) {
                global.civic.taxes.tax_rate = 10;
            }
            else if (global.civic.taxes.tax_rate > 20) {
                global.civic.taxes.tax_rate = 20;
            }
            break;
        case 'toxic':
            if (global.race.species === 'troll' && global.tech['science'] && global.tech['science'] >= 8){
                unlockAchieve('godwin');
            }
            break;
        case 'thalassophobia':
            delete global.city['wharf'];
            break;
        default:
            break;
    }
}

export function cleanRemoveTrait(trait){
    switch (trait){
        case 'kindling_kindred':
            global.resource.Lumber.display = true;
            if (global.tech['foundry']){
                global.resource.Plywood.display = true;
            }
            break;
        case 'carnivore':
            global.civic.farmer.display = true;
            global.tech['agriculture'] = 1;
            if (global.tech['hunting'] >= 2){
                global.tech['farm'] = 1;
            }
            delete global.tech['hunting'];
            delete global.tech['wind_plant'];
            if (global.city['lodge']){
                global.city['farm'] = { count: global.city.lodge.count };
                delete global.city['lodge'];
            }
            if (global.city['smokehouse']){
                global.city['silo'] = { count: global.city.smokehouse.count };
                delete global.city['smokehouse'];
            }
            if (global.city['windmill']){
                global.city['mill'] = { count: global.city.windmill.count };
                delete global.city['windmill'];
            }
            break;
        case 'terrifying':
            global.settings.showMarket = true;
            break;
        case 'slaver':
            delete global.city['slave_pen'];
            delete global.tech['slaves'];
            global.resource.Slave.amount = 0;
            global.resource.Slave.max = 0;
            global.resource.Slave.display = false;
            break;
        case 'cannibalize':
            delete global.city['s_alter'];
            break;
        case 'magnificent':
            delete global.city['shrine'];
            break;
        case 'thalassophobia':
            if (global.tech['wharf']){
                global.city['wharf'] = { count: 0 };
            }
            break;
        default:
            break;
    }
}

export const biomes = {
    grassland: {
        label: loc('biome_grassland_name'),
        desc: loc('biome_grassland')
    },
    oceanic: {
        label: loc('biome_oceanic_name'),
        desc: loc('biome_oceanic')
    },
    forest: {
        label: loc('biome_forest_name'),
        desc: loc('biome_forest')
    },
    desert: {
        label: loc('biome_desert_name'),
        desc: loc('biome_desert')
    },
    volcanic: {
        label: loc('biome_volcanic_name'),
        desc: loc('biome_volcanic')
    },
    tundra: {
        label: loc('biome_tundra_name'),
        desc: loc('biome_tundra')
    },
    hellscape: {
        label: loc('biome_hellscape_name'),
        desc: loc('biome_hellscape')
    },
    eden: {
        label: loc('biome_eden_name'),
        desc: loc('biome_eden')
    }
};

export const planetTraits = {
    toxic: {
        label: loc('planet_toxic'),
        desc: loc('planet_toxic_desc')
    },
    mellow: {
        label: loc('planet_mellow'),
        desc: loc('planet_mellow_desc')
    },
    rage: {
        label: loc('planet_rage'),
        desc: loc('planet_rage_desc')
    },
    stormy: {
        label: loc('planet_stormy'),
        desc: loc('planet_stormy_desc')
    },
    ozone: {
        label: loc('planet_ozone'),
        desc: loc('planet_ozone_desc')
    },
    magnetic: {
        label: loc('planet_magnetic'),
        desc: loc('planet_magnetic_desc')
    },
    trashed: {
        label: loc('planet_trashed'),
        desc: loc('planet_trashed_desc')
    }
};
