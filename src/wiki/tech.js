import { global } from './../vars.js';
import { loc } from './../locale.js';
import { universeAffix } from './../achieve.js';
import { actions, housingLabel } from './../actions.js';
import { techList } from './../tech.js';
import { checkControlling } from './../civics.js';
import { races, traits } from './../races.js';
import { getHalloween, svgIcons, svgViewBox } from './../functions.js';
import { actionDesc, sideMenu, getSolarName } from './functions.js';

const isHalloween = getHalloween();
const standard_tech = techList('standard');
const truepath_tech = techList('truepath');

const extraInformation = {
    club: global.race['soul_eater'] ? [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Souls_name`)])]
        : [
        loc(`wiki_tech_club`),
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Food_name`)])
    ],
    bone_tools: global.race['smoldering'] ? [
        loc(`wiki_tech_bone_tools_alt`),
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Chrysotile_name`)])]
        : [
        loc(`wiki_tech_bone_tools`),
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Stone_name`)])
    ],
    wooden_tools: [
        loc(`wiki_tech_bone_tools`),
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Stone_name`)])
    ],
    sundial: [
        loc(`wiki_tech_sundial1`),
        loc(`wiki_tech_sundial2`),
        loc(`wiki_tech_sundial3`),
        loc(`wiki_tech_sundial4`),
        loc(`wiki_tech_sundial5`)
    ],
    housing: [
        loc(`wiki_tech_building_unlock`,[housingLabel('small')])
    ],
    cottage: [
        loc(`wiki_tech_building_unlock`,[housingLabel('medium')])
    ],
    captive_housing: [
        loc(`wiki_tech_building_unlock`,[loc('city_captive_housing')])
    ],
    torture : [ // displayed as "torment"
        loc(`wiki_tech_job_unlock`,[loc(`job_torturer`)])
    ],
    thrall_quarters : [
        loc("wiki_tech_thrall_quarters")
    ],
    psychic_stun : [
        loc("wiki_tech_psychic_stun")
    ],
    psychic_attack : [
        loc("wiki_tech_psychic_attack")
    ],
    psychic_finance : [
        loc("wiki_tech_psychic_finance")
    ],
    psychic_channeling : [
        loc("wiki_tech_psychic_channeling")
    ],
    psychic_efficiency : [
        loc("wiki_tech_psychic_efficiency")
    ],
    mind_break : [
        loc("wiki_tech_mind_break")
    ],
    psychic_energy : [
        loc("wiki_tech_psychic_energy",
            [traits.psychic.vars()[3],
            72 * (global.stats.achieve['nightmare'] && global.stats.achieve.nightmare['mg'] ? global.stats.achieve.nightmare.mg : 0)])
    ],
    apartment: [
        loc(`wiki_tech_building_unlock`,[housingLabel('large')])
    ],
    arcology: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_arcology_title`)])
    ],
    steel_beams: [
        loc(`wiki_tech_steel_beams`,[housingLabel('small'),housingLabel('medium')])
    ],
    mythril_beams: [
        loc(`wiki_tech_steel_beams`,[housingLabel('small'),housingLabel('medium')])
    ],
    neutronium_walls: [
        loc(`wiki_tech_steel_beams`,[housingLabel('small'),housingLabel('medium')])
    ],
    bolognium_alloy_beams: [
        loc(`wiki_tech_steel_beams`,[housingLabel('small'),housingLabel('medium')])
    ],
    aphrodisiac: [
        loc(`wiki_tech_aphrodisiac`)
    ],
    fertility_clinic: [
        loc(`wiki_tech_fertility_clinic`)
    ],
    smokehouse: [
        loc(`wiki_tech_building_unlock`,[loc(`city_smokehouse`)])
    ],
    lodge: [
        loc(`wiki_tech_building_unlock`,[loc(`city_lodge`)])
    ],
    alt_lodge: [
        loc(`wiki_tech_building_unlock`,[loc(`city_lodge`)])
    ],
    soul_well: [
        loc(`wiki_tech_building_unlock`,[loc(`city_soul_well`)])
    ],
    compost: [
        loc(`wiki_tech_building_unlock`,[loc(`city_compost_heap`)])
    ],
    hot_compost: [
        loc(`wiki_tech_hot_compost`,[100])
    ],
    mulching: [
        loc(`wiki_tech_hot_compost`,[50])
    ],
    adv_mulching: [
        loc(`wiki_tech_hot_compost`,[33.33])
    ],
    agriculture: [
        loc(`wiki_tech_building_unlock`,[loc(`city_farm`)])
    ],
    farm_house: [
        loc(`wiki_tech_farm_house`)
    ],
    irrigation: [
        loc(`wiki_tech_irrigation`)
    ],
    silo: [
        loc(`wiki_tech_building_unlock`,[loc(`city_silo`)])
    ],
    mill: [
        loc(`wiki_tech_building_unlock`,[loc(`city_mill_title1`)])
    ],
    windmill: [
        loc(`wiki_tech_windmill1`),
        loc(`wiki_tech_windmill2`)
    ],
    windturbine: [
        loc(`wiki_tech_windturbine`)
    ],
    wind_plant: [
        loc(`wiki_tech_building_unlock`,[loc(`city_mill_title2`)])
    ],
    evil_wind_plant: [
        loc(`wiki_tech_building_unlock`,[loc(`city_mill_title2`)])
    ],
    gmfood: [
        loc(`wiki_tech_gmfood`)
    ],
    foundry: [
        loc(`wiki_tech_building_unlock`,[loc(`city_foundry`)])
    ],
    artisans: [
        loc(`wiki_tech_artisans`)
    ],
    apprentices: [
        loc(`wiki_tech_apprentices`)
    ],
    carpentry: [
        loc(`wiki_tech_carpentry`)
    ],
    demonic_craftsman: [
        loc(`wiki_tech_master_craftsman`)
    ],
    master_craftsman: [
        loc(`wiki_tech_master_craftsman`)
    ],
    brickworks: [
        loc(`wiki_tech_brickworks`)
    ],
    machinery: [
        loc(`wiki_tech_machinery`)
    ],
    cnc_machine: [
        loc(`wiki_tech_cnc_machine`)
    ],
    vocational_training: [
        loc(`wiki_tech_vocational_training`)
    ],
    stellar_forge: [
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_stellar_forge_title`)])
    ],
    stellar_smelting: [
        loc(`wiki_tech_stellar_smelting`),
        loc(`wiki_tech_fuel_unlock`,[loc(`star`)])
    ],
    assembly_line: [
        loc(`wiki_tech_factory_upgrade1`,[50]),
        loc(`wiki_tech_factory_upgrade2`,[50])
    ],
    automation: [
        loc(`wiki_tech_factory_upgrade1`,[33]),
        loc(`wiki_tech_factory_upgrade2`,[33])
    ],
    laser_cutters: [
        loc(`wiki_tech_factory_upgrade1`,[25]),
        loc(`wiki_tech_factory_upgrade2`,[25])
    ],
    high_tech_factories: [
        loc(`wiki_tech_factory_upgrade1`,[20]),
        loc(`wiki_tech_factory_upgrade2`,[20])
    ],
    theatre: [
        loc(`wiki_tech_building_unlock`,[loc(`city_amphitheatre`)])
    ],
    playwright: [
        loc(`wiki_tech_entertain1`,[2])
    ],
    magic: [
        loc(`wiki_tech_entertain1`,[3])
    ],
    superstars: [
        loc(`wiki_tech_entertain2`,[1])
    ],
    radio: [
        loc(`wiki_tech_entertain3`,[1])
    ],
    tv: [
        loc(`wiki_tech_entertain3`,[2])
    ],
    vr_center: [
        loc(`wiki_tech_building_unlock`,[loc(`space_red_vr_center_title`)]),
        loc(`wiki_tech_entertain3`,[3])
    ],
    zoo: [
        loc(`wiki_tech_building_unlock`,[loc(`tech_zoo`)])
    ],
    casino: [
        loc(`wiki_tech_building_unlock`,[loc(`city_casino`)])
    ],
    dazzle: [
        loc(`wiki_tech_dazzle`,[50])
    ],
    casino_vault: [
        loc(`wiki_tech_casino_vault`,[40000,60000])
    ],
    otb: [
        loc(`wiki_tech_otb`)
    ],
    online_gambling: [
        loc(`wiki_tech_dazzle`,[33.33]),
        loc(`wiki_tech_casino_vault`,[60000,120000])
    ],
    bolognium_vaults: [
        loc(`wiki_tech_casino_vault`,[120000,240000])
    ],
    mining: [
        loc(`wiki_tech_building_unlock`,[loc(`city_rock_quarry`)])
    ],
    bayer_process: [
        loc(`wiki_tech_building_unlock`,[loc(`city_metal_refinery`)])
    ],
    elysis_process: [
        loc(`wiki_tech_elysis_process`)
    ],
    smelting: [
        loc(`wiki_tech_building_unlock`,[loc(`city_smelter`)])
    ],
    steel: [
        loc(`wiki_tech_steel`)
    ],
    blast_furnace: [
        loc(`wiki_tech_smelt_boost1`,[loc(`resource_Iron_name`)])
    ],
    bessemer_process: [
        loc(`wiki_tech_smelt_boost1`,[loc(`resource_Steel_name`)])
    ],
    oxygen_converter: [
        loc(`wiki_tech_smelt_boost1`,[loc(`resource_Steel_name`)])
    ],
    electric_arc_furnace: [
        loc(`wiki_tech_smelt_boost1`,[loc(`resource_Steel_name`)])
    ],
    hellfire_furnace: [
        loc(`wiki_tech_smelt_boost2`)
    ],
    infernium_fuel: [
        loc(`wiki_tech_fuel_unlock`,[loc(`modal_smelter_inferno`)])
    ],
    iridium_smelting_perk: [
        loc(`wiki_tech_iridium_smelting`)
    ],
    rotary_kiln: [
        loc(`wiki_tech_rotary_kiln`)
    ],
    metal_working: [
        loc(`wiki_tech_building_unlock`,[loc(`city_mine`)])
    ],
    iron_mining: [
        loc(`wiki_tech_iron_mining`),
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Iron_name`)])
    ],
    coal_mining: [
        loc(`wiki_tech_building_unlock`,[loc(`city_coal_mine`)]),
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Coal_name`)])
    ],
    storage: [
        loc(`wiki_tech_building_unlock`,[loc(`city_shed_title1`)])
    ],
    reinforced_shed: [
        loc(`wiki_tech_store_upgrade`,[loc(`city_shed_title1`),125])
    ],
    barns: [
        loc(`wiki_tech_name_change`,[loc(`city_shed_title1`),loc(`city_shed_title2`)]),
        loc(`wiki_tech_store_upgrade`,[loc(`city_shed_title2`),133])
    ],
    warehouse: [
        loc(`wiki_tech_name_change`,[loc(`city_shed_title2`),loc(`city_shed_title3`)]),
        loc(`wiki_tech_store_upgrade`,[loc(`city_shed_title3`),171])
    ],
    cameras: [
        loc(`wiki_tech_store_upgrade`,[loc(`city_shed_title3`),26])
    ],
    pocket_dimensions: [
        loc(`wiki_tech_store_upgrade`,[loc(`city_shed_title3`),21]),
        loc(`wiki_tech_pocket_dimensions`)
    ],
    ai_logistics: [
        loc(`wiki_tech_ai_logistics`)
    ],
    containerization: [
        loc(`wiki_tech_building_unlock`,[loc(`city_storage_yard`)])
    ],
    reinforced_crates: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Crates_name`),500,350])
    ],
    cranes: [
        loc(`wiki_tech_cranes`,[loc(`city_storage_yard`),loc(`resource_Crates_name`)])
    ],
    titanium_crates: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Crates_name`),750,500])
    ],
    mythril_crates: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Crates_name`),1000,750])
    ],
    infernite_crates: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Crates_name`),1500,1000])
    ],
    graphene_crates: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Crates_name`),2200,1500])
    ],
    bolognium_crates: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Crates_name`),6200,2200])
    ],
    elysanite_crates: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Crates_name`),10000,6200])
    ],
    steel_containers: [
        loc(`wiki_tech_building_unlock`,[loc(`city_warehouse`)])
    ],
    gantry_crane: [
        loc(`wiki_tech_cranes`,[loc(`city_warehouse`),loc(`resource_Containers_name`)])
    ],
    alloy_containers: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Containers_name`),1200,800])
    ],
    mythril_containers: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Containers_name`),1600,1200])
    ],
    adamantite_containers: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Containers_name`),2200,1600])
    ],
    aerogel_containers: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Containers_name`),3200,2200])
    ],
    bolognium_containers: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Containers_name`),9700,3200])
    ],
    nanoweave_containers: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Containers_name`),17700,9700])
    ],
    elysanite_containers: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Containers_name`),25000,17700])
    ],
    evil_planning: [
        loc(`wiki_tech_urban_planning`)
    ],
    urban_planning: [
        loc(`wiki_tech_urban_planning`)
    ],
    zoning_permits: [
        loc(`wiki_tech_zoning_permits`,[actions.tech.zoning_permits.bQueue()])
    ],
    urbanization: [
        loc(`wiki_tech_zoning_permits`,[actions.tech.urbanization.bQueue()])
    ],
    assistant: [
        loc(`wiki_tech_assistant`)
    ],
    government: [
        loc(`wiki_tech_government`)
    ],
    theocracy: [
        loc(`wiki_tech_gov_unlock`,[loc(`govern_theocracy`)])
    ],
    republic: [
        loc(`wiki_tech_gov_unlock`,[loc(`govern_republic`)])
    ],
    socialist: [
        loc(`wiki_tech_gov_unlock`,[loc(`govern_socialist`)])
    ],
    corpocracy: [
        loc(`wiki_tech_gov_unlock`,[loc(`govern_corpocracy`)])
    ],
    technocracy: [
        loc(`wiki_tech_gov_unlock`,[loc(`govern_technocracy`)])
    ],
    federation: [
        loc(`wiki_tech_gov_unlock`,[loc(`govern_federation`)])
    ],
    magocracy: [
        loc(`wiki_tech_gov_unlock`,[loc(`govern_magocracy`)])
    ],
    governor: [
        loc(`wiki_tech_governor`)
    ],
    spy: [
        loc(`wiki_tech_spy`)
    ],
    espionage: [
        loc(`wiki_tech_espionage`)
    ],
    spy_training: [
        loc(`wiki_tech_spy_training`)
    ],
    spy_gadgets: [
        loc(`wiki_tech_spy_gadgets`)
    ],
    code_breakers: [
        loc(`wiki_tech_code_breakers`)
    ],
    currency: [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Money_name`)])
    ],
    market: [
        loc(`wiki_tech_subtab_unlock`,[loc(`tab_market`),loc(`tab_resources`)])
    ],
    tax_rates: [
        loc(`wiki_tech_tax_rates`)
    ],
    large_trades: [
        loc(`wiki_tech_large_trades`,[5000,100])
    ],
    corruption: [
        loc(`wiki_tech_corruption`)
    ],
    massive_trades: [
        loc(`wiki_tech_large_trades`,[1000000,1000000])
    ],
    trade: [
        loc(`wiki_tech_building_unlock`,[loc(`city_trade`)])
    ],
    diplomacy: [
        loc(`wiki_tech_diplomacy`)
    ],
    freight: [
        loc(`wiki_tech_freight`)
    ],
    wharf: [
        loc(`wiki_tech_building_unlock`,[loc(`city_wharf`)])
    ],
    banking: [
        loc(`wiki_tech_building_unlock`,[loc(`city_bank`)])
    ],
    investing: [
        loc(`wiki_tech_job_unlock`,[loc(`job_banker`)])
    ],
    vault: [
        loc(`wiki_tech_vault`,[1800,4000])
    ],
    bonds: [
        loc(`wiki_tech_bonds`,[250])
    ],
    steel_vault: [
        loc(`wiki_tech_vault`,[4000,9000])
    ],
    eebonds: [
        loc(`wiki_tech_bonds`,[600])
    ],
    swiss_banking: [
        loc(`wiki_tech_swiss_banking`)
    ],
    safety_deposit: [
        loc(`wiki_tech_safety_deposit`)
    ],
    stock_market: [
        loc(`wiki_tech_project_unlock`,[loc(`arpa_projects_stock_exchange_title`)])
    ],
    hedge_funds: [
        loc(`wiki_tech_hedge_funds`)
    ],
    four_oh_one: [
        loc(`wiki_tech_bonds`,[1000])
    ],
    exchange: [
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_exchange_title`)])
    ],
    foreign_investment: [
        loc(`wiki_tech_foreign_investment`,[loc(`galaxy_freighter`),3]),
        loc(`wiki_tech_foreign_investment`,[loc(`galaxy_super_freighter`),8])
    ],
    crypto_currency: [
        loc(`wiki_tech_crypto_currency`)
    ],
    mythril_vault: [
        loc(`wiki_tech_vault`,[9000,15000])
    ],
    neutronium_vault: [
        loc(`wiki_tech_vault`,[15000,22500])
    ],
    adamantite_vault: [
        loc(`wiki_tech_vault`,[22500,30000])
    ],
    graphene_vault: [
        loc(`wiki_tech_vault`,[30000,37500])
    ],
    home_safe: [
        loc(`wiki_tech_home_safe`,[housingLabel('medium'),1000]),
        loc(`wiki_tech_home_safe`,[housingLabel('large'),2000])
    ],
    fire_proof_safe: [
        loc(`wiki_tech_home_safe`,[housingLabel('medium'),2000]),
        loc(`wiki_tech_home_safe`,[housingLabel('large'),5000])
    ],
    tamper_proof_safe: [
        loc(`wiki_tech_home_safe`,[housingLabel('medium'),5000]),
        loc(`wiki_tech_home_safe`,[housingLabel('large'),10000])
    ],
    monument: [
        loc(`wiki_tech_project_unlock`,[loc(`arpa_project_monument_title`)])
    ],
    tourism: [
        loc(`wiki_tech_building_unlock`,[loc(`city_tourist_center`)])
    ],
    xeno_tourism: [
        loc(`wiki_tech_xeno_tourism`)
    ],
    science: [
        loc(`wiki_tech_building_unlock`,[loc(`city_university`)])
    ],
    library: [
        loc(`wiki_tech_building_unlock`,[loc(`city_library`)])
    ],
    thesis: [
        loc(`wiki_tech_thesis`)
    ],
    research_grant: [
        loc(`wiki_tech_research_grant`)
    ],
    scientific_journal: [
        loc(`wiki_tech_scientific_journal`)
    ],
    adjunct_professor: [
        loc(`wiki_tech_adjunct_professor`)
    ],
    tesla_coil: [
        loc(`wiki_tech_tesla_coil`)
    ],
    internet: [
        loc(`wiki_tech_internet`,[loc(`city_university`)]),
        loc(`wiki_tech_internet`,[loc(`city_library`)])
    ],
    observatory: [
        loc(`wiki_tech_building_unlock`,[loc(`space_moon_observatory_title`)])
    ],
    world_collider: [
        loc(`wiki_tech_building_unlock`,[loc(`space_dwarf_collider_title`)])
    ],
    laboratory: [
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_laboratory_title`)])
    ],
    virtual_assistant: [
        loc(`wiki_tech_virtual_assistant`)
    ],
    dimensional_readings: [
        loc(`wiki_tech_dimensional_readings1`),
        loc(`wiki_tech_dimensional_readings2`,[loc(`city_university`)]),
        loc(`wiki_tech_dimensional_readings2`,[loc(`city_biolab`)])
    ],
    quantum_entanglement: [
        loc(`wiki_tech_quantum_entanglement`)
    ],
    expedition: [
        loc(`wiki_tech_expedition`)
    ],
    subspace_sensors: [
        loc(`wiki_tech_subspace_sensors`)
    ],
    orichalcum_capacitor: [
        loc(`wiki_tech_orichalcum_capacitor`)
    ],
    advanced_biotech: [
        loc(`wiki_tech_advanced_biotech`)
    ],
    codex_infinium: [
        loc(`wiki_tech_codex_infinium`)
    ],
    hell_oven:[
        loc('wiki_tech_building_unlock', [loc('portal_oven_title')])
    ],
    preparation_methods:[
        loc('wiki_tech_building_unlock', [loc('portal_dish_soul_steeper_title')]),
        loc('wiki_tech_building_unlock', [loc('portal_dish_life_infuser_title')])
    ],
    final_ingredient:[
        loc('wiki_tech_final_ingredient')
    ],
    bioscience: [
        loc(`wiki_tech_building_unlock`,[loc(`city_biolab`)])
    ],
    genetics: [
        loc(`wiki_tech_subtab_unlock`,[loc(`tab_arpa_genetics`),loc(`tech_arpa`)])
    ],
    crispr: [
        loc(`wiki_tech_subtab_unlock`,[loc(`tab_arpa_crispr`),loc(`tech_arpa`)])
    ],
    shotgun_sequencing: [
        loc(`wiki_tech_shotgun_sequencing`)
    ],
    de_novo_sequencing: [
        loc(`wiki_tech_de_novo_sequencing`)
    ],
    dna_sequencer: [
        loc(`wiki_tech_dna_sequencer`)
    ],
    rapid_sequencing: [
        loc(`wiki_tech_rapid_sequencing`)
    ],
    mad_science: [
        loc(`wiki_tech_building_unlock`,[loc(`city_wardenclyffe`)]),
        loc(`wiki_tech_gov_time`)
    ],
    electricity: [
        loc(`wiki_tech_building_unlock`,[loc(`city_coal_power`)]),
        loc(`wiki_tech_subtab_unlock`,[loc(`tab_power_grid`),loc(`tab_civics`)]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_autocracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_democracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_oligarchy')])
    ],
    industrialization: [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Titanium_name`)]),
        loc(`wiki_tech_building_unlock`,[loc(`city_factory`)]),
        loc(`wiki_tech_gov_time`)
    ],
    fission: [
        loc(`wiki_tech_building_unlock`,[loc(`city_fission_power`)])
    ],
    arpa: [
        loc(`wiki_tech_tab_unlock`,[loc(`tech_arpa`)]),
        loc(`wiki_tech_subtab_unlock`,[loc(`tab_arpa_projects`),loc(`tech_arpa`)]),
        loc(`wiki_tech_project_unlock`,[loc(`arpa_projects_lhc_title`)]),
        loc(`wiki_tech_gov_time`)
    ],
    rocketry: [
        loc(`wiki_tech_project_unlock`,[loc(`arpa_projects_launch_facility_title`)])
    ],
    quantum_computing: [
        loc(`wiki_tech_quantum_computing`)
    ],
    virtual_reality: [
        loc(`wiki_tech_gov_upgrade`,[loc('govern_autocracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_democracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_oligarchy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_theocracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_republic')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_socialist')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_corpocracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_technocracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_federation')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_magocracy')])
    ],
    shields: [
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[loc(`interstellar_neutron_name`)]),loc(`interstellar_neutron_name`)]),
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[loc(`interstellar_blackhole_name`)]),loc(`interstellar_blackhole_name`)]),
    ],
    ai_core: [
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_citadel_title`)])
    ],
    metaphysics: [
        loc(`wiki_tech_gov_upgrade`,[loc('govern_theocracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_republic')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_socialist')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_corpocracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_technocracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_federation')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_magocracy')])
    ],
    cybernetics: [
        loc(`wiki_tech_cybernetics`)
    ],
    blood_pact: [
        loc(`wiki_tech_subtab_unlock`,[loc('tab_arpa_blood'),loc(`tech_arpa`)])
    ],
    purify: [
        loc(`wiki_tech_purify`)
    ],
    waygate: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_waygate_title`)])
    ],
    demonic_infusion: [
        loc(`wiki_tech_demonic_infusion`)
    ],
    dark_bomb: [
        loc(`wiki_tech_dark_bomb`),
        loc(`wiki_tech_dark_bomb2`),
        loc(`wiki_tech_dark_bomb3`)
    ],
    gate_key: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_west_tower`)]),
        loc(`wiki_tech_building_unlock`,[loc(`portal_east_tower`)])
    ],
    gate_turret: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_gate_turret_title`)])
    ],
    infernite_mine: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_infernite_mine_title`)])
    ],
    hell_search: [
        loc(`wiki_tech_destination_unlock`,[loc(`portal_ruins_mission_title`),loc(`portal_ruins_name`)]),
        loc(`wiki_tech_hell_search`),
        loc(`wiki_tech_building_unlock`,[loc(`portal_guard_post_title`)])
    ],
    lake_threat: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_bireme_title`)])
    ],
    lake_transport: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_transport_title`)])
    ],
    cooling_tower: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_cooling_tower_title`)])
    ],
    miasma: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_port_title`)])
    ],
    tech_ascension: [
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[loc(`interstellar_sirius_name`)]),loc(`interstellar_sirius_b_name`)]),
    ],
    cement_processing: [
        loc(`wiki_tech_cement_processing`)
    ],
    adamantite_processing: [
        loc(`wiki_tech_adamantite_processing`)
    ],
    graphene_processing: [
        loc(`wiki_tech_graphene_processing`)
    ],
    crypto_mining: [
        loc(`wiki_tech_crypto_mining`)
    ],
    fusion_power: [
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_fusion_title`)])
    ],
    infernium_power: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_inferno_power_title`)])
    ],
    thermomechanics: [
        loc(`wiki_tech_thermomechanics`)
    ],
    quantum_manufacturing: [
        loc(`wiki_tech_quantum_manufacturing`)
    ],
    worker_drone: [
        loc(`wiki_tech_building_unlock`,[loc(`space_gas_moon_drone_title`)])
    ],
    uranium: [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Uranium_name`)])
    ],
    uranium_storage: [
        loc(`wiki_tech_uranium_storage`)
    ],
    uranium_ash: [
        loc(`wiki_tech_uranium_ash`)
    ],
    breeder_reactor: [
        loc(`wiki_tech_breeder_reactor`)
    ],
    mine_conveyor: [
        loc(`wiki_tech_power_upgrade`,[loc(`city_rock_quarry`),1]),
        loc(`wiki_tech_power_upgrade`,[loc(`city_mine`),1]),
        loc(`wiki_tech_power_upgrade`,[loc(`city_coal_mine`),1])
    ],
    oil_well: [
        loc(`wiki_tech_building_unlock`,[loc(`city_oil_well`)])
    ],
    oil_depot: [
        loc(`wiki_tech_building_unlock`,[loc(`city_oil_depot`)])
    ],
    oil_power: [
        loc(`wiki_tech_building_unlock`,[loc(`city_oil_power`)])
    ],
    titanium_drills: [
        loc(`wiki_tech_titanium_drills`)
    ],
    alloy_drills: [
        loc(`wiki_tech_alloy_drills`)
    ],
    fracking: [
        loc(`wiki_tech_fracking`)
    ],
    mythril_drills: [
        loc(`wiki_tech_mythril_drills`)
    ],
    mass_driver: [
        loc(`wiki_tech_building_unlock`,[loc(`city_mass_driver`)])
    ],
    orichalcum_driver: [
        loc(`wiki_tech_orichalcum_driver1`),
        loc(`wiki_tech_orichalcum_driver2`)
    ],
    polymer: [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Polymer_name`)]),
        loc(`wiki_tech_factory_unlock`,[loc(`resource_Polymer_name`)])
    ],
    fluidized_bed_reactor: [
        loc(`wiki_tech_fluidized_bed_reactor`)
    ],
    synthetic_fur: [
        loc(`wiki_tech_factory_unlock`,[loc(`resource_Furs_name`)])
    ],
    nanoweave: [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Nanoweave_name`)])
    ],
    stanene: [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Stanene_name`)]),
        loc(`wiki_tech_factory_unlock`,[loc(`resource_Stanene_name`)])
    ],
    nano_tubes: [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Nano_Tube_name`)]),
        loc(`wiki_tech_factory_unlock`,[loc(`resource_Nano_Tube_name`)])
    ],
    scarletite: [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Scarletite_name`)]),
        loc(`wiki_tech_building_unlock`,[loc(`portal_hell_forge_title`)])
    ],
    pillars: [
        loc(`wiki_tech_pillars`)
    ],
    reclaimer: [
        loc(`wiki_tech_job_unlock`,[loc(`job_reclaimer`)]),
        loc(`wiki_tech_building_unlock`,[loc(`city_graveyard`)])
    ],
    shovel: [
        loc(`wiki_tech_shovel`,[40])
    ],
    iron_shovel: [
        loc(`wiki_tech_shovel`,[80])
    ],
    steel_shovel: [
        loc(`wiki_tech_shovel`,[120])
    ],
    titanium_shovel: [
        loc(`wiki_tech_shovel`,[160])
    ],
    alloy_shovel: [
        loc(`wiki_tech_shovel`,[200])
    ],
    mythril_shovel: [
        loc(`wiki_tech_shovel`,[240])
    ],
    adamantite_shovel: [
        loc(`wiki_tech_shovel`,[280])
    ],
    stone_axe: [
        loc(`wiki_tech_building_unlock`,[loc(`city_lumber_yard`)])
    ],
    copper_axes: [
        loc(`wiki_tech_copper_axes`,[35])
    ],
    iron_saw: [
        loc(`wiki_tech_building_unlock`,[loc(`city_sawmill`)])
    ],
    steel_saw: [
        loc(`wiki_tech_steel_saw`)
    ],
    iron_axes: [
        loc(`wiki_tech_copper_axes`,[70])
    ],
    steel_axes: [
        loc(`wiki_tech_copper_axes`,[105])
    ],
    titanium_axes: [
        loc(`wiki_tech_copper_axes`,[140])
    ],
    chainsaws: [
        loc(`wiki_tech_copper_axes`,[175])
    ],
    copper_sledgehammer: [
        loc(`wiki_tech_copper_sledgehammer`,[40])
    ],
    iron_sledgehammer: [
        loc(`wiki_tech_copper_sledgehammer`,[80]) 
    ],
    steel_sledgehammer: [
        loc(`wiki_tech_copper_sledgehammer`,[120])
    ],
    titanium_sledgehammer: [
        loc(`wiki_tech_copper_sledgehammer`,[160])
    ],
    copper_pickaxe: [
        loc(`wiki_tech_copper_pickaxe1`,[15]),
        loc(`wiki_tech_copper_pickaxe2`,[12])
    ],
    iron_pickaxe: [
        loc(`wiki_tech_copper_pickaxe1`,[30]),
        loc(`wiki_tech_copper_pickaxe2`,[24])
    ],
    steel_pickaxe: [
        loc(`wiki_tech_copper_pickaxe1`,[45]),
        loc(`wiki_tech_copper_pickaxe2`,[36])
    ],
    jackhammer: [
        loc(`wiki_tech_copper_pickaxe1`,[60]),
        loc(`wiki_tech_copper_pickaxe2`,[48])
    ],
    jackhammer_mk2: [
        loc(`wiki_tech_copper_pickaxe1`,[75]),
        loc(`wiki_tech_copper_pickaxe2`,[60])
    ],
    adamantite_hammer: [
        loc(`wiki_tech_copper_pickaxe1`,[90]),
        loc(`wiki_tech_copper_pickaxe2`,[72])
    ],
    elysanite_hammer: [
        loc(`wiki_tech_copper_pickaxe1`,[105]),
        loc(`wiki_tech_copper_pickaxe2`,[84])
    ],
    copper_hoe: [
        loc(`wiki_tech_copper_hoe`,[33.33])
    ],
    iron_hoe: [
        loc(`wiki_tech_copper_hoe`,[66.67])
    ],
    steel_hoe: [
        loc(`wiki_tech_copper_hoe`,[100])
    ],
    titanium_hoe: [
        loc(`wiki_tech_copper_hoe`,[133.33])
    ],
    adamantite_hoe: [
        loc(`wiki_tech_copper_hoe`,[166.67])
    ],
    cyber_limbs: [
        loc(`wiki_tech_cyber_limbs`)
    ],
    slave_pens: [
        loc(`wiki_tech_building_unlock`,[loc(`city_slave_housing`,[global.resource.Slave.name])])
    ],
    slave_market: [
        loc(`wiki_tech_slave_market`)
    ],
    ceremonial_dagger: [
        loc(`wiki_tech_ceremonial_dagger`,[600,1500])
    ],
    last_rites: [
        loc(`wiki_tech_ceremonial_dagger`,[1800,3600])
    ],
    ancient_infusion: [
        loc(`wiki_tech_ceremonial_dagger`,[5400,16200])
    ],
    garrison: [
        loc(`wiki_tech_building_unlock`,[loc(`city_garrison`)])
    ],
    mercs: [
        loc(`wiki_tech_mercs`)
    ],
    signing_bonus: [
        loc(`wiki_tech_signing_bonus`)
    ],
    hospital: [
        loc(`wiki_tech_building_unlock`,[loc(`city_hospital`)])
    ],
    bac_tanks: [
        loc(`wiki_tech_bac_tanks`,[(races[global.race.species].type === 'synthetic' ? loc(`city_boot_camp_art`) : loc(`tech_hospital`)),10])
    ],
    boot_camp: [
        loc(`wiki_tech_building_unlock`,[loc(`city_boot_camp`)])
    ],
    vr_training: [
        loc(`wiki_tech_vr_training`,[races[global.race.species].type === 'synthetic' ? loc(`city_boot_camp_art`) : loc(`city_boot_camp`)])
    ],
    bows: [
        loc(`wiki_tech_bows`,[100])
    ],
    flintlock_rifle: [
        loc(`wiki_tech_bows`,[200])
    ],
    machine_gun: [
        loc(`wiki_tech_bows`,[300])
    ],
    bunk_beds: [
        loc(`wiki_tech_bunk_beds`)
    ],
    rail_guns: [
        loc(`wiki_tech_bows`,[400])
    ],
    laser_rifles: [
        loc(`wiki_tech_bows`,[500])
    ],
    plasma_rifles: [
        loc(`wiki_tech_bows`,[600])
    ],
    disruptor_rifles: [
        loc(`wiki_tech_bows`,[700])
    ],
    gauss_rifles: [
        loc(`wiki_tech_bows`,[800])
    ],
    cyborg_soldiers: [
        loc(`wiki_tech_bows`,[900])
    ],
    ethereal_weapons: [
        loc(`wiki_tech_bows`,[1000])
    ],
    space_marines: [
        loc(`wiki_tech_building_unlock`,[loc(`space_red_space_barracks_title`)])
    ],
    hammocks: [
        loc(`wiki_tech_hammocks`,[2,loc(`space_red_space_barracks_title`)]),
        loc(`wiki_tech_hammocks`,[3,loc(`galaxy_starbase`)])
    ],
    cruiser: [
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_cruiser_title`)])
    ],
    armor: [
        loc(`wiki_tech_armor`,[1])
    ],
    plate_armor: [
        loc(`wiki_tech_armor`,[2])
    ],
    kevlar: [
        loc(`wiki_tech_armor`,[3])
    ],
    nanoweave_vest: [
        loc(`wiki_tech_armor`,[4])
    ],
    laser_turret: [
        loc(`wiki_tech_name_change`,[loc(`portal_turret_title1`),loc(`portal_turret_title2`)]),
        loc(`wiki_tech_laser_turret`,[50])
    ],
    plasma_turret: [
        loc(`wiki_tech_name_change`,[loc(`portal_turret_title2`),loc(`portal_turret_title3`)]),
        loc(`wiki_tech_laser_turret`,[70])
    ],
    dynamite: [
        loc(`wiki_tech_dynamite1`,[50]),
        loc(`wiki_tech_dynamite2`,[25]),
        loc(`wiki_tech_dynamite3`,[25])
    ],
    anfo: [
        loc(`wiki_tech_dynamite1`,[75]),
        loc(`wiki_tech_dynamite2`,[40]),
        loc(`wiki_tech_dynamite3`,[40])
    ],
    super_tnt: [
        loc(`wiki_tech_dynamite1`,[100]),
        loc(`wiki_tech_dynamite2`,[55]),
        loc(`wiki_tech_dynamite3`,[55])
    ],
    mad: [
        loc(`wiki_tech_mad`)
    ],
    cement: [
        loc(`wiki_tech_building_unlock`,[loc(`city_cement_plant`)])
    ],
    rebar: [
        loc(`wiki_tech_rebar`,[10])
    ],
    steel_rebar: [
        loc(`wiki_tech_rebar`,[20])
    ],
    portland_cement: [
        loc(`wiki_tech_portland_cement`)
    ],
    screw_conveyor: [
        loc(`wiki_tech_power_upgrade`,[loc(`city_cement_plant`),2]),
        loc(`wiki_tech_screw_conveyor`,[5])
    ],
    adamantite_screws: [
        loc(`wiki_tech_screw_conveyor`,[8])
    ],
    otherworldly_binder: [
        loc(`wiki_tech_otherworldly_binder`)
    ],
    hunter_process: [
        loc(`wiki_tech_hunter_process`,[loc(`resource_Steel_name`),25])
    ],
    kroll_process: [
        loc(`wiki_tech_kroll_process`,[loc(`resource_Iron_name`),25])
    ],
    cambridge_process: [
        loc(`wiki_tech_hunter_process`,[loc(`resource_Steel_name`),10]),
        loc(`wiki_tech_kroll_process`,[loc(`resource_Iron_name`),10])
    ],
    matter_compression: [
        loc(`wiki_tech_matter_compression`,[loc(`resource_Crates_name`),loc(`city_storage_yard`)]),
        loc(`wiki_tech_matter_compression`,[loc(`resource_Containers_name`),loc(`city_warehouse`)])
    ],
    higgs_boson: [
        loc(`wiki_tech_higgs_boson`)
    ],
    dimensional_compression: [
        loc(`wiki_tech_dimensional_compression`)
    ],
    theology: [
        loc(`wiki_tech_building_unlock`,[loc(`city_temple`)])
    ],
    fanaticism: [
        loc(`wiki_tech_fanaticism`)
    ],
    alt_fanaticism: [
        loc(`wiki_tech_fanaticism`)
    ],
    ancient_theology: [
        loc(`wiki_tech_building_unlock`,[loc(`space_red_ziggurat_title`)])
    ],
    study: [
        loc(`wiki_tech_study`)
    ],
    encoding: [
        loc(`wiki_tech_encoding`)
    ],
    deify: [
        loc(`wiki_tech_deify`)
    ],
    infusion: [
        loc(`wiki_tech_infusion`)
    ],
    indoctrination: [
        global.race['no_plasmid'] ? loc(`wiki_tech_indoctrination2`) : loc(`wiki_tech_indoctrination1`)
    ],
    missionary: [
        loc(`wiki_tech_missionary`)
    ],
    zealotry: [
        loc(`wiki_tech_zealotry`)
    ],
    anthropology: [
        global.race['no_plasmid'] ? loc(`wiki_tech_anthropology2`) : loc(`wiki_tech_anthropology1`)
    ],
    alt_anthropology: [
        global.race['no_plasmid'] ? loc(`wiki_tech_anthropology2`) : loc(`wiki_tech_anthropology1`)
    ],
    mythology: [
        loc(`wiki_tech_mythology`)
    ],
    archaeology: [
        loc(`wiki_tech_archaeology`)
    ],
    merchandising: [
        loc(`wiki_tech_merchandising`)
    ],
    astrophysics: [
        loc(`wiki_tech_building_unlock`,[loc(`space_home_propellant_depot_title`)])
    ],
    rover: [
        loc(`wiki_tech_destination_unlock`,[loc(`space_moon_mission_title`),loc(`space_moon_info_name`)])
    ],
    probes: [
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[getSolarName('red')]),getSolarName('red')]),
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[getSolarName('hell')]),getSolarName('hell')]),
        loc(`wiki_tech_gov_time`)
    ],
    starcharts: [
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[loc(`space_sun_info_name`)]),loc(`space_sun_info_name`)]),
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[getSolarName('gas')]),getSolarName('gas')])
    ],
    colonization: [
        loc(`wiki_tech_building_unlock`,[global.race['soul_eater'] ?loc(`space_red_asphodel_title`) : loc(`space_red_biodome_title`)])
    ],
    red_tower: [
        loc(`wiki_tech_building_unlock`,[loc(`space_red_tower_title`)])
    ],
    space_manufacturing: [
        loc(`wiki_tech_space_manufacturing`,[getSolarName('red')])
    ],
    exotic_lab: [
        loc(`wiki_tech_building_unlock`,[loc(`space_red_exotic_lab_title`)])
    ],
    hydroponics: [
        loc(`wiki_tech_hydroponics`)
    ],
    dyson_swarm: [
        loc(`wiki_tech_building_unlock`,[loc(`space_sun_swarm_control_title`)]),
        loc(`wiki_tech_building_unlock`,[loc(`space_sun_swarm_satellite_title`)])
    ],
    swarm_plant: [
        loc(`wiki_tech_building_unlock`,[loc(`space_hell_swarm_plant_title`)])
    ],
    space_sourced: [
        loc(`wiki_tech_space_sourced`)
    ],
    swarm_plant_ai: [
        loc(`wiki_tech_swarm_plant_ai`)
    ],
    swarm_control_ai: [
        loc(`wiki_tech_swarm_control_ai`)
    ],
    quantum_swarm: [
        loc(`wiki_tech_quantum_swarm`)
    ],
    perovskite_cell: [
        loc(`wiki_tech_perovskite_cell`,[0.5])
    ],
    swarm_convection: [
        loc(`wiki_tech_perovskite_cell`,[0.65])
    ],
    orichalcum_panels: [
        loc(`wiki_tech_perovskite_cell`,[0.8])
    ],
    dyson_net: [
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_dyson_title`)])
    ],
    dyson_sphere2: [
        loc(`wiki_tech_name_change`,[loc(`interstellar_dyson_title`),loc(`interstellar_dyson_sphere_title`)]),
        loc(`wiki_tech_dyson_sphere2`)
    ],
    orichalcum_sphere: [
        loc(`wiki_tech_dyson_sphere2`)
    ],
    elysanite_sphere: [
        loc(`wiki_tech_elysanite_sphere`)
    ],
    gps: [
        loc(`wiki_tech_building_unlock`,[loc(`space_home_gps_title`)])
    ],
    nav_beacon: [
        loc(`wiki_tech_building_unlock`,[loc(`space_home_nav_beacon_title`)])
    ],
    subspace_signal: [
        loc(`wiki_tech_subspace_signal`,[getSolarName('red')])
    ],
    atmospheric_mining: [
        loc(`wiki_tech_building_unlock`,[loc(`space_gas_mining_title`)]),
        loc(`wiki_tech_building_unlock`,[loc(`space_gas_storage_title`,[getSolarName('gas')])])
    ],
    helium_attractor: [
        loc(`wiki_tech_helium_attractor`)
    ],
    ram_scoops: [
        loc(`wiki_tech_ram_scoops`)
    ],
    elerium_prospecting: [
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_elerium_prospector_title`)])
    ],
    zero_g_mining: [
        loc(`wiki_tech_building_unlock`,[loc(`space_belt_station_title`)]),
        loc(`wiki_tech_building_unlock`,[loc(`space_belt_iridium_ship_title`)]),
        loc(`wiki_tech_building_unlock`,[loc(`space_belt_iron_ship_title`)])
    ],
    elerium_mining: [
        loc(`wiki_tech_building_unlock`,[loc(`space_belt_elerium_ship_title`)]),
        loc(`wiki_tech_elerium_mining`)
    ],
    laser_mining: [
        loc(`wiki_tech_laser_mining`,[loc(`space_belt_elerium_ship_title`),0.0075,0.005]),
        loc(`wiki_tech_laser_mining`,[loc(`space_belt_iridium_ship_title`),0.08,0.055]),
        loc(`wiki_tech_laser_mining`,[loc(`space_belt_iron_ship_title`),3,2])
    ],
    plasma_mining: [
        loc(`wiki_tech_laser_mining`,[loc(`space_belt_elerium_ship_title`),0.009,0.0075]),
        loc(`wiki_tech_laser_mining`,[loc(`space_belt_iridium_ship_title`),0.1,0.08]),
        loc(`wiki_tech_laser_mining`,[loc(`space_belt_iron_ship_title`),4,3])
    ],
    elerium_tech: [
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[getSolarName('dwarf')]),getSolarName('dwarf')])
    ],
    elerium_reactor: [
        loc(`wiki_tech_building_unlock`,[loc(`space_dwarf_reactor_title`)])
    ],
    neutronium_housing: [
        loc(`wiki_tech_neutronium_housing`)
    ],
    unification2: [
        loc(`wiki_tech_unification2a`),
        loc(`wiki_tech_unification2b`),
        loc(`wiki_tech_unification2c`),
        loc(`wiki_tech_unification2d`),
        loc(`wiki_tech_unification2e`),
        loc(`wiki_tech_unification2f`,[getSolarName('gas')]),
        loc(`wiki_tech_unification2g`),
        loc(`wiki_tech_unification2h`),
        loc(`wiki_tech_unification2i`)
    ],
    unite: [
        loc(`wiki_tech_rival_unlock`),
        loc(`wiki_tech_unite_a`),
        loc(`wiki_tech_unification2b`),
        loc(`wiki_tech_unite_b`),
        loc(`wiki_tech_unification2d`),
        loc(`wiki_tech_unification2e`),
        loc(`wiki_tech_unite_c`),
        loc(`wiki_tech_unite_d`),
        loc(`wiki_tech_unite_e`)
    ],
    star_dock: [
        loc(`wiki_tech_building_unlock`,[loc(`space_gas_star_dock_title`)])
    ],
    interstellar: [
        loc(`wiki_tech_interstellar`)
    ],
    genesis_ship: [
        loc(`wiki_tech_genesis_ship`)
    ],
    genetic_decay: [
        loc(`wiki_tech_genetic_decay`)
    ],
    stabilize_decay: [
        loc(`wiki_tech_stabilize_decay`)
    ],
    warp_drive: [
        loc(`wiki_tech_subtab_unlock`,[loc(`tab_interstellar`),loc(`tab_civil`)]),
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[loc(`interstellar_alpha_name`)]),loc(`interstellar_alpha_name`)])
        
    ],
    habitat: [
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_habitat_title`)])
    ],
    graphene: [
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_g_factory_title`)])
    ],
    aerogel: [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Aerogel_name`)])
    ],
    mega_manufacturing: [
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_int_factory_title`)])
    ],
    luxury_condo: [
        loc(`wiki_tech_building_unlock`,[loc(`tech_luxury_condo`)])
    ],
    stellar_engine: [
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_stellar_engine`)])
    ],
    mass_ejector: [
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_mass_ejector`)])
    ],
    asteroid_redirect: [
        loc(`wiki_tech_project_unlock`,[loc(`arpa_projects_roid_eject_title`,[loc(`arpa_projects_roid_eject_asteroid`)])])
    ],
    exotic_infusion: [
        loc(`wiki_tech_confirmation`)
    ],
    infusion_check: [
        loc(`wiki_tech_confirmation`)
    ],
    infusion_confirm: [
        loc(`wiki_tech_infusion_confirm`)
    ],
    stabilize_blackhole: [
        loc(`wiki_tech_stabilize_blackhole1`),
        loc(`wiki_tech_stabilize_blackhole2`),
        loc(`wiki_tech_stabilize_blackhole3`)
    ],
    mana_syphon: [
        loc(`wiki_tech_project_unlock`,[loc(`arpa_syphon_title`)])
    ],
    gravity_convection: [
        loc(`wiki_tech_gravitational_convection`)
    ],
    wormholes: [
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_jump_ship`)])
    ],
    fortifications: [
        loc(`wiki_tech_subtab_unlock`,[loc(`tab_portal`),loc(`tab_civil`)]),
        loc(`wiki_tech_fortifications`),
        loc(`wiki_tech_building_unlock`,[loc(`portal_turret_title1`)]),
        loc(`wiki_tech_building_unlock`,[loc(`portal_carport_title`)])
    ],
    war_drones: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_war_drone_title`)])
    ],
    demon_attractor: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_attractor_title`)])
    ],
    combat_droids: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_war_droid_title`)])
    ],
    repair_droids: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_repair_droid_title`)])
    ],
    advanced_predators: [
        loc(`wiki_tech_advanced_predators`)
    ],
    enhanced_droids: [
        loc(`wiki_tech_enhanced_droids`)
    ],
    sensor_drone: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_sensor_drone_title`)])
    ],
    map_terrain: [
        loc(`wiki_tech_map_terrain`)
    ],
    calibrated_sensors: [
        loc(`wiki_tech_calibrated_sensors`,[20])
    ],
    shield_generator: [
        loc(`wiki_tech_shield_generator`)
    ],
    enhanced_sensors: [
        loc(`wiki_tech_enhanced_sensors1`),
        loc(`wiki_tech_calibrated_sensors`,[50])
    ],
    xeno_linguistics: [
        loc(`wiki_tech_destination_unlock`,[loc(`galaxy_gorddon_mission`),loc(`galaxy_gorddon`)])
    ],
    xeno_culture: [
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_embassy`)])
    ],
    cultural_exchange: [
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_dormitory`)]),
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_symposium`)])
    ],
    shore_leave: [
        loc(`wiki_tech_shore_leave`)
    ],
    xeno_gift: [
        loc(`wiki_tech_xeno_gift`,[global.galaxy['alien1'] ? races[global.galaxy.alien1.id].name : loc(`galaxy_alien1_proxy`)]),
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_consulate`)])
    ],
    industrial_partnership: [
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_vitreloy_plant`)])
    ],
    embassy_housing: [
        loc(`wiki_tech_embassy_housing`)
    ],
    advanced_telemetry: [
        loc(`wiki_tech_advanced_telemetry`)
    ],
    defense_platform: [
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_defense_platform`)])
    ],
    scout_ship: [
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_scout_ship`)])
    ],
    corvette_ship: [
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_corvette_ship`)])
    ],
    frigate_ship: [
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_frigate_ship`)])
    ],
    cruiser_ship: [
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_cruiser_ship`)]),
        loc(`wiki_tech_destination_unlock`,[loc(`galaxy_alien2_mission`,[global.galaxy['alien2'] ? races[global.galaxy.alien2.id].name : loc(`galaxy_alien2_proxy`)]),loc(`galaxy_alien`,[global.galaxy['alien2'] ? races[global.galaxy.alien2.id].name : loc(`galaxy_alien2_proxy`)])])
    ],
    dreadnought: [
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_dreadnought`)])
    ],
    ship_dock: [
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_ship_dock`)])
    ],
    ore_processor: [
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_ore_processor`)])
    ],
    scavenger: [
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_scavenger`)])
    ],
    coordinates: [
        loc(`wiki_tech_destination_unlock`,[loc('galaxy_alien2_mission',[loc('galaxy_chthonian')]),loc(`galaxy_chthonian`)])
    ],
    chthonian_survey: [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Orichalcum_name`)]),
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_excavator`)]),
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_raider`)])
    ],
    gateway_depot: [
        loc(`wiki_tech_building_unlock`,[loc(`galaxy_gateway_depot`)])
    ],
    soul_forge: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_soul_forge_title`)])
    ],
    soul_attractor: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_soul_attractor_title`)])
    ],
    soul_absorption: [
        loc(`wiki_tech_soul_absorption`)
    ],
    soul_link: [
        loc(`wiki_tech_soul_link1`),
        loc(`wiki_tech_soul_link2`)
    ],
    soul_bait: [
        loc(`wiki_tech_soul_bait`)
    ],
    gun_emplacement: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_gun_emplacement_title`)])
    ],
    advanced_emplacement: [
        loc(`wiki_tech_advanced_emplacement1`),
        loc(`wiki_tech_advanced_emplacement2`),
        loc(`wiki_tech_advanced_emplacement3`)
    ],
    mana: [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Mana_name`)]),
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Crystal_name`)]),
        loc(`wiki_tech_job_unlock`,[loc(`job_crystal_miner`)])
    ],
    ley_lines: [
        loc(`wiki_tech_building_unlock`,[global.race['cataclysm'] || global.race['orbit_decayed'] ? loc(`space_red_pylon`) : loc(`city_pylon`)])
    ],
    rituals: [
        loc(`wiki_tech_rituals`)
    ],
    crafting_ritual: [
        loc(`wiki_tech_crafting_ritual`)
    ],
    mana_nexus: [
        loc(`wiki_tech_project_unlock`,[loc(`tech_mana_nexus`)])
    ],
    clerics: [
        loc(`wiki_tech_clerics`)
    ],
    conjuring: [
        loc(`wiki_tech_conjuring`,isHalloween.active ? [loc(`city_trick`),loc(`city_trick_conjure`)] : [loc(`city_food`),loc(`city_food_conjure`)])
    ],
    res_conjuring: [
        loc(`wiki_tech_conjuring`,isHalloween.active ? [loc(`city_dig`),loc(`city_dig_conjour`)] : [loc(`city_lumber`),loc(`city_lumber_conjure`)]),
        loc(`wiki_tech_conjuring`, global.race['sappy'] ? [loc(`city_amber`),loc(`city_amber_conjour`)] : [loc(`city_stone`),loc(`city_stone_conjour`)])
    ],
    alchemy: [
        loc(`wiki_tech_subtab_unlock`,[loc(`tab_alchemy`),loc(`tab_resources`)])
    ],
    transmutation: [
        loc(`wiki_tech_transmutation1`),
        loc(`wiki_tech_transmutation2`)
    ],
    bribe_sphinx: [
        loc(`wiki_tech_bribe_sphinx`)
    ],
    alien_biotech: [
        loc(`wiki_tech_alien_biotech`)
    ],
    zero_g_lab: [
        loc(`wiki_tech_building_unlock`,[loc('tech_zero_g_lab')])
    ],
    operating_base: [
        loc(`wiki_tech_building_unlock`,[loc('tech_operating_base')])
    ],
    munitions_depot: [
        loc(`wiki_tech_building_unlock`,[loc('tech_munitions_depot')])
    ],
    fob: [
        loc(`wiki_tech_building_unlock`,[loc('space_fob_title')])
    ],
    bac_tanks_tp: [
        loc(`wiki_tech_bac_tanks`,[(races[global.race.species].type === 'synthetic' ? loc(`city_boot_camp_art`) : loc(`tech_hospital`)),10])
    ],
    medkit: [
        loc(`wiki_tech_bac_tanks`,[(races[global.race.species].type === 'synthetic' ? loc(`city_boot_camp_art`) : loc(`tech_hospital`)),15])
    ],
    sam_site: [
        loc(`wiki_tech_building_unlock`,[loc('space_sam_title')])
    ],
    data_cracker: [
        loc(`wiki_tech_building_unlock`,[loc('space_decoder_title')])
    ],
    ai_core_tp: [
        loc(`wiki_tech_building_unlock`,[loc('space_ai_core')])
    ],
    ai_optimizations: [
        loc(`wiki_tech_ai_optimizations`)
    ],
    synthetic_life: [
        loc(`wiki_tech_building_unlock`,[loc('space_ai_colonist_title')])
    ],
    protocol66a: [
        loc(`wiki_tech_protocol66a`)
    ],
    quantium: [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Quantium_name`)]),
        loc(`wiki_tech_quantium`)
    ],
    anitgrav_bunk: [
        loc(`wiki_tech_hammocks`,[2,loc(`space_red_space_barracks_title`)])
    ],
    higgs_boson_tp: [
        loc(`wiki_tech_higgs_boson`)
    ],
    strange_signal: [
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[getSolarName('triton')]),getSolarName('triton')]),
    ],
    data_analysis: [
        loc(`wiki_tech_data_analysis`,[getSolarName('triton')]),
        loc(`wiki_tech_syndicate_increase`,[getSolarName('titan'),1000,500]),
        loc(`wiki_tech_syndicate_increase`,[getSolarName('enceladus'),500,250]),
        loc(`wiki_tech_syndicate_increase`,[getSolarName('triton'),2000,1000])
    ],
    mass_relay: [
        loc(`wiki_tech_building_unlock`,[loc('space_dwarf_mass_relay_title')])
    ],
    nav_data: [
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[getSolarName('eris')]),getSolarName('eris')]),
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[loc(`space_kuiper_title`)]),loc(`space_kuiper_title`)]),
    ],
    dronewar: [
        loc(`wiki_tech_building_unlock`,[loc('space_drone_control',[getSolarName('eris')])]),
        loc(`wiki_tech_building_unlock`,[loc('space_shock_trooper_title')]),
        loc(`wiki_tech_control_unlock`,[loc('space_digsite_title')])
    ],
    drone_tank: [
        loc(`wiki_tech_building_unlock`,[loc('space_tank_title')])
    ],
    stanene_tp: [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Stanene_name`)]),
        loc(`wiki_tech_factory_unlock`,[loc(`resource_Stanene_name`)])
    ],
    graphene_tp: [
        loc(`wiki_tech_building_unlock`,[loc('interstellar_g_factory_title')])
    ],
    virtual_reality_tp: [
        loc(`wiki_tech_gov_upgrade`,[loc('govern_autocracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_democracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_oligarchy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_theocracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_republic')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_socialist')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_corpocracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_technocracy')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_federation')]),
        loc(`wiki_tech_gov_upgrade`,[loc('govern_magocracy')])
    ],
    electrolysis: [
        loc(`wiki_tech_building_unlock`,[loc('space_electrolysis_title')])
    ],
    storehouse: [
        loc(`wiki_tech_building_unlock`,[loc('space_storehouse_title')])
    ],
    adamantite_vault_tp: [
        loc(`wiki_tech_vault`,[22500,30000])
    ],
    titan_bank: [
        loc(`wiki_tech_building_unlock`,[loc('city_bank')])
    ],
    hydrogen_plant: [
        loc(`wiki_tech_building_unlock`,[loc('space_hydrogen_plant_title')])
    ],
    water_mining: [
        loc(`wiki_tech_building_unlock`,[loc('space_water_freighter_title')])
    ],
    mercury_smelting: [
        loc(`wiki_tech_building_unlock`,[loc('space_hell_smelter_title',[getSolarName('hell')])])
    ],
    iridium_smelting: [
        loc(`wiki_tech_iridium_smelting`)
    ],
    adamantite_crates: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Crates_name`),1500,1000])
    ],
    bolognium_crates_tp: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Crates_name`),6200,2200])
    ],
    adamantite_containers_tp: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Containers_name`),2200,1600])
    ],
    quantium_containers: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Containers_name`),3200,2200])
    ],
    unobtainium_containers: [
        loc(`wiki_tech_containerized_upgrade`,[loc(`resource_Containers_name`),9700,3200])
    ],
    reinforced_shelving: [
        loc(`wiki_tech_reinforced_shelving`)
    ],
    garage_shelving: [
        loc(`wiki_tech_garage_shelving`)
    ],
    warehouse_shelving: [
        loc(`wiki_tech_warehouse_shelving1`),
        loc(`wiki_tech_warehouse_shelving2`)
    ],
    elerium_extraction: [
        loc(`wiki_tech_building_unlock`,[loc('space_kuiper_mine',[global.resource.Elerium.name])])
    ],
    orichalcum_panels_tp: [
        loc(`wiki_tech_perovskite_cell`,[0.8])
    ],
    shipyard: [
        loc(`wiki_tech_building_unlock`,[loc('outer_shipyard_title')])
    ],
    ship_lasers: [
        loc(`wiki_tech_ship_weapon_unlock`,[loc('outer_shipyard_weapon_laser')])
    ],
    pulse_lasers: [
        loc(`wiki_tech_ship_weapon_unlock`,[loc('outer_shipyard_weapon_p_laser')])
    ],
    ship_plasma: [
        loc(`wiki_tech_ship_weapon_unlock`,[loc('outer_shipyard_weapon_plasma')])
    ],
    ship_phaser: [
        loc(`wiki_tech_ship_weapon_unlock`,[loc('outer_shipyard_weapon_phaser')])
    ],
    ship_disruptor: [
        loc(`wiki_tech_ship_weapon_unlock`,[loc('outer_shipyard_weapon_disruptor')])
    ],
    destroyer_ship: [
        loc(`wiki_tech_building_unlock`,[loc('outer_shipyard_class_destroyer')])
    ],
    cruiser_ship_tp: [
        loc(`wiki_tech_ship_class_unlock`,[loc('outer_shipyard_class_cruiser')])
    ],
    h_cruiser_ship: [
        loc(`wiki_tech_ship_class_unlock`,[loc('outer_shipyard_class_battlecruiser')])
    ],
    dreadnought_ship: [
        loc(`wiki_tech_ship_class_unlock`,[loc('outer_shipyard_class_dreadnought')])
    ],
    pulse_engine: [
        loc(`wiki_tech_ship_engine_unlock`,[loc('outer_shipyard_engine_pulse')])
    ],
    photon_engine: [
        loc(`wiki_tech_ship_engine_unlock`,[loc('outer_shipyard_engine_photon')])
    ],
    vacuum_drive: [
        loc(`wiki_tech_ship_engine_unlock`,[loc('outer_shipyard_engine_vacuum')])
    ],
    ship_fusion: [
        loc(`wiki_tech_ship_power_unlock`,[loc('outer_shipyard_power_fusion')])
    ],
    ship_elerium: [
        loc(`wiki_tech_ship_power_unlock`,[loc('outer_shipyard_power_elerium')])
    ],
    quantum_signatures: [
        loc(`wiki_tech_ship_sensor_unlock`,[loc('outer_shipyard_sensor_quantum')])
    ],
    interstellar_drive: [
        loc(`wiki_tech_ship_class_unlock`,[loc('outer_shipyard_class_explorer')]),
        loc(`wiki_tech_ship_engine_unlock`,[loc('outer_shipyard_engine_emdrive')])
    ],
    alien_outpost: [
        loc(`wiki_tech_building_unlock`,[loc('tech_alien_outpost')])
    ],
    jumpgates: [
        loc(`wiki_tech_building_unlock`,[loc('tau_jump_gate')]),
        loc(`wiki_tech_building_unlock`,[loc('tau_jump_gate')])
    ],
    system_survey: [
        loc(`wiki_tech_destination_unlock`,[loc('tau_gas_contest_title'),loc(`tau_gas_title`)]),
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[loc('tau_roid_title')]),loc('tau_roid_title')])
    ],
    repository: [
        loc(`wiki_tech_building_unlock`,[loc('tech_repository')])
    ],
    fusion_generator: [
        loc(`wiki_tech_building_unlock`,[loc('tech_fusion_generator')])
    ],
    tau_cultivation: [
        loc(`wiki_tech_building_unlock`,[loc('tau_home_tau_farm')])
    ],
    tau_manufacturing: [
        loc(`wiki_tech_building_unlock`,[loc('tau_home_tau_factory')])
    ],
    jeff: [
        loc(`wiki_tech_jeff`)
    ],
    womling_fun: [
        loc(`wiki_tech_building_unlock`,[loc('wiki_tech_multi_unlock',[loc('wiki_tech_multi_unlock',[loc('tau_red_womling_fun1'),loc('tau_red_womling_fun2')]),loc('tau_red_womling_fun3')])])
    ],
    womling_lab: [
        loc(`wiki_tech_building_unlock`,[loc('interstellar_laboratory_title')]),
        loc(`wiki_tech_womling_lab`)
    ],
    womling_mining: [
        loc(`wiki_tech_womling_mining`,[15,loc('wiki_tech_tree_womling_mining')])
    ],
    womling_firstaid: [
        loc(`wiki_tech_womling_firstaid`)
    ],
    womling_logistics: [
        loc(`wiki_tech_womling_logistics`)
    ],
    womling_repulser: [
        loc(`wiki_tech_womling_repulser`)
    ],
    womling_farming: [
        loc(`wiki_tech_womling_farming1`),
        loc(`wiki_tech_womling_farming2`)
    ],
    womling_housing: [
        loc(`wiki_tech_womling_housing`)
    ],
    womling_support: [
        loc(`wiki_tech_building_unlock`,[loc('tau_gas_womling_station_title')])
    ],
    womling_recycling: [
        loc(`wiki_tech_womling_recycling`)
    ],
    belt_mining: [
        loc(`wiki_tech_building_unlock`,[loc('tau_gas_ore_refinery_title')])
    ],
    adv_belt_mining: [
        loc(`wiki_tech_adv_belt_mining`)
    ],
    space_whaling: [
        loc(`wiki_tech_building_unlock`,[loc('tau_gas_whaling_station_title')])
    ],
    infectious_disease_lab: [
        loc(`wiki_tech_building_unlock`,[global.tech['isolation'] ? loc('tech_infectious_disease_lab_alt') : loc(global.race['artifical'] ? 'tech_infectious_disease_lab_s' : 'tech_infectious_disease_lab')])
    ],
    isolation_protocol: [
        loc(`wiki_tech_isolation_protocol1`),
        loc(`wiki_tech_isolation_protocol2`)
    ],
    decode_virus: [
        loc(`wiki_tech_decode_virus`,[global.tech['isolation'] ? loc('tech_infectious_disease_lab_alt') : loc(global.race['artifical'] ? 'tech_infectious_disease_lab_s' : 'tech_infectious_disease_lab')])
    ],
    vaccine_campaign: [
        loc(`wiki_tech_vaccine_campaign1`,[(races[global.race.species].type === 'synthetic' ? loc(`city_boot_camp_art`) : loc(`tech_hospital`))]),
        loc(`wiki_tech_vaccine_campaign2`,[(races[global.race.species].type === 'synthetic' ? loc(`city_boot_camp_art`) : loc(`tech_hospital`))])
    ],
    vax_strat1: [ //Propaganda
        loc(`wiki_tech_vax_strat`,[`250`,(races[global.race.species].type === 'synthetic' ? loc(`city_boot_camp_art`) : loc(`tech_hospital`))])
    ],
    vax_strat2: [ //Force
        loc(`wiki_tech_vax_strat`,[`25`,(races[global.race.species].type === 'synthetic' ? loc(`city_boot_camp_art`) : loc(`tech_hospital`))]),
        loc(`wiki_tech_vax_morale`,[`-50%`])
    ],
    vax_strat3: [ //Science/Transparency
        loc(`wiki_tech_vax_strat`,[`390`,(races[global.race.species].type === 'synthetic' ? loc(`city_boot_camp_art`) : loc(`tech_hospital`))]),
        loc(`wiki_tech_vax_morale`,[`+20%`])
    ],
    vax_strat4: [ //Secret
        loc(`wiki_tech_vax_strat`,[`125`,(races[global.race.species].type === 'synthetic' ? loc(`city_boot_camp_art`) : loc(`tech_hospital`))]),
        loc(`wiki_tech_vax_morale`,[`-10%`])
    ],
    cloning: [
        loc(`wiki_tech_building_unlock`,[loc('tau_home_cloning')])
    ],
    ringworld: [
        loc(`wiki_tech_destination_unlock2`,[loc('tab_tauceti')]),
        loc(`wiki_tech_building_unlock`,[loc('tau_star_ringworld')])
    ],
    iso_gambling: [
        loc(`wiki_tech_iso_gambling`)
    ],
    outpost_boost: [
        loc(`wiki_tech_outpost_boost`)
    ],
    cultural_center: [
        loc(`wiki_tech_building_unlock`,[loc('tech_cultural_center')])
    ],
    outer_tau_survey: [
        loc(`wiki_tech_destination_unlock`,[loc('tau_gas2_contest_title'),loc(`tau_gas2_title`)]),
    ],
    alien_research: [
        loc(`wiki_tech_alien_research`)
    ],
    womling_gene_therapy: [
        loc(`wiki_tech_womling_gene_therapy1`),
        loc(`wiki_tech_womling_gene_therapy2`),
        loc(`wiki_tech_womling_gene_therapy3`),
        loc(`wiki_tech_womling_gene_therapy4`,[loc(`tau_gas_title`)])
    ],
    food_culture: [
        loc(`wiki_tech_food_culture`)
    ],
    advanced_refinery: [
        loc(`wiki_tech_advanced_refinery`)
    ],
    advanced_pit_mining: [
        loc(`wiki_tech_advanced_pit_mining`)
    ],
    useless_junk: [
        loc(`wiki_tech_useless_junk`)
    ],
    advanced_asteroid_mining: [
        loc(`wiki_tech_advanced_asteroid_mining`)
    ],
    matrioshka_brain: [
        loc(`wiki_tech_building_unlock`,[loc('tech_matrioshka_brain')])
    ],
    ignition_device: [
        loc(`wiki_tech_building_unlock`,[loc('tech_ignition_device')])
    ],
    replicator: [
        loc(`wiki_tech_replicator`)
    ],
    womling_unlock: [
        loc(`wiki_tech_destination_unlock2`,[loc('tau_planet',[getSolarName('red')])]),
        loc(`wiki_tech_building_unlock`,[loc('tau_red_orbital_platform')]),
        loc(`wiki_tech_womling_unlock`)
    ],
    garden_of_eden: [
        loc(`wiki_tech_building_unlock`,[loc('tau_star_goe_facility')]),
    ],
    geck: [
        loc(`wiki_tech_geck`)
    ],
    asphodel_flowers: [
        loc(`wiki_tech_asphodel_flowers`)
    ],
    ghost_traps: [
        loc(`wiki_tech_ghost_traps`)
    ],
    research_station: [
        loc(`wiki_tech_research_station`)
    ],
    spirit_box: [
        loc(`wiki_tech_spirit_box`)
    ],
    spirit_researcher: [
        loc(`wiki_tech_spirit_researcher`)
    ],
    dimensional_tap: [
        loc(`wiki_tech_dimensional_tap`)
    ],
    soul_engine: [
        loc(`wiki_tech_soul_engine`)
    ],
    railway_to_hell: [
        loc(`wiki_tech_railway_to_hell`)
    ],
    purification: [
        loc(`wiki_tech_purification`)
    ],
    asphodel_mech: [
        loc(`wiki_tech_asphodel_mech`)
    ],
    asphodel_storage: [
        loc(`wiki_tech_asphodel_storage`)
    ],
    asphodel_stabilizer: [
        loc(`wiki_tech_asphodel_stabilizer`)
    ],
    edenic_bunker: [
        loc(`wiki_tech_edenic_bunker`)
    ],
    bliss_den: [
        loc(`wiki_tech_bliss_den`)
    ],
    hallowed_housing: [
        loc(`wiki_tech_hallowed_housing`)
    ],
    outer_plane_study: [
        loc(`wiki_tech_outer_plane_study`)
    ],
    camouflage: [
        loc(`wiki_tech_celestial_tactics`)
    ],
    celestial_tactics: [
        loc(`wiki_tech_celestial_tactics`)
    ],
    active_camouflage: [
        loc(`wiki_tech_celestial_tactics`)
    ],
    special_ops_training: [
        loc(`wiki_tech_celestial_tactics`)
    ],
    spectral_training: [
        loc(`wiki_tech_spectral_training`)
    ],
    elysanite_mining: [
        loc(`wiki_tech_elysanite_mining`)
    ],
    sacred_smelter: [
        loc(`wiki_tech_sacred_smelter`)
    ],
    fire_support_base: [
        loc(`wiki_tech_fire_support_base`)
    ],
    pillbox: [
        loc(`wiki_tech_pillbox`)
    ],
    elerium_cannon: [
        loc(`wiki_tech_elerium_cannon`)
    ],
    elerium_containment: [
        loc(`wiki_tech_elerium_containment`)
    ],
    ambrosia: [
        loc(`wiki_tech_ambrosia`)
    ],
    eternal_bank: [
        loc(`wiki_tech_eternal_bank`)
    ],
    wisdom: [
        loc(`wiki_tech_wisdom`)
    ],
    spirit_syphon: [
        loc(`wiki_tech_spirit_syphon`)
    ],
    spirit_capacitor: [
        loc(`wiki_tech_spirit_capacitor`)
    ],
    suction_force: [
        loc(`wiki_tech_suction_force`)
    ],
    rushmore: [
        loc(`wiki_tech_rushmore`)
    ],
    reincarnation: [
        loc(`wiki_tech_reincarnation`)
    ],
    otherworldly_cement: [
        loc(`wiki_tech_otherworldly_cement`)
    ],
    tomb: [
        loc(`wiki_tech_tomb`)
    ],
    energy_drain: [
        loc(`wiki_tech_energy_drain`)
    ],
    divine_infuser: [
        loc(`wiki_tech_divine_infuser`)
    ],
    wheel: [
        loc(`wiki_tech_job_unlock`,[loc(`job_teamster`)])
    ],
    wagon: [
        loc(`wiki_tech_transport`, [100])
    ],
    steam_engine: [
        loc(`wiki_tech_transport`, [200])
    ],
    combustion_engine: [
        loc(`wiki_tech_transport`, [300])
    ],
    hover_cart: [
        loc(`wiki_tech_transport`, [400])
    ],
    osha: [
        loc(`wiki_tech_osha`)
    ],
    blackmarket: [
        loc(`wiki_tech_blackmarket`)
    ],
    pipelines: [
        loc(`wiki_tech_pipelines`)
    ],
    minor_wish: [
        loc(`wiki_tech_minor_wish`)
    ],
    major_wish: [
        loc(`wiki_tech_major_wish`)
    ],
    might: [
        loc(`wiki_tech_evil`)
    ],
    executions: [
        loc(`wiki_tech_evil`)
    ],
    secret_police: [
        loc(`wiki_tech_evil`)
    ],
    ai_tracking: [
        loc(`wiki_tech_evil`)
    ],
    predictive_arrests: [
        loc(`wiki_tech_evil`)
    ],
    hellspawn_tunnelers: [
        loc(`wiki_tech_hellspawn_tunnelers`)
    ],
    hell_minions: [
        loc(`wiki_tech_hell_minions`)
    ],
    reapers: [
        loc(`wiki_tech_reapers`)
    ],
    hellfire: [
        loc(`wiki_tech_hellfire`)
    ],
    corpse_retrieval: [
        loc(`wiki_tech_corpse_retrieval`)
    ],
    spire_bazaar: [
        loc(`wiki_tech_spire_bazaar`)
    ],
    ghost_miners: [
        loc(`wiki_tech_ghost_miners`)
    ],
    tavern: [
        loc(`wiki_tech_tavern`)
    ],
    energized_dead: [
        loc(`wiki_tech_energized_dead`)
    ],
};

const extraInformationTP = {
    rocketry: [
        loc(`wiki_tech_project_unlock`,[loc(`arpa_projects_launch_facility_title`)]),
        loc(`wiki_tech_rival_unlock`)
    ],
    merchandising: [
        loc('tech_merchandising_effect_tp')
    ],
    starcharts: [
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[loc(`space_sun_info_name`)]),loc(`space_sun_info_name`)]),
        loc(`wiki_tech_destination_unlock`,[loc(`space_mission_title`,[getSolarName('gas')]),getSolarName('gas')]),
        loc(`wiki_tech_subtab_unlock`,[loc(`outer_sol_system`,[getSolarName('home')]),loc(`tab_civil`)]),
    ]
};

const extraRequirements = {
    theology1 : {
        title: loc('wiki_tech_req_theology1'),
        link: 'wiki.html#resets-prestige-intro'
    },
    genetics3 : {
        title: loc('wiki_tech_req_genetics3')
    },
    supercollider1 : {
        title: loc('wiki_tech_req_arpa',[loc('arpa_projects_lhc_title'),1]),
        link: 'wiki.html#projects-arpa-lhc'
    },
    supercollider2 : {
        title: loc('wiki_tech_req_arpa',[loc('arpa_projects_lhc_title'),2]),
        link: 'wiki.html#projects-arpa-lhc'
    },
    supercollider3 : {
        title: loc('wiki_tech_req_arpa',[loc('arpa_projects_lhc_title'),3]),
        link: 'wiki.html#projects-arpa-lhc'
    },
    supercollider10 : {
        title: loc('wiki_tech_req_arpa',[loc('arpa_projects_lhc_title'),10]),
        link: 'wiki.html#projects-arpa-lhc'
    },
    stock_exchange1 : {
        title: loc('wiki_tech_req_arpa',[loc('arpa_projects_stock_exchange_title'),1]),
        link: 'wiki.html#projects-arpa-stock_exchange'
    },
    monuments2 : {
        title: loc('wiki_tech_req_arpa',[loc('arpa_project_monument_title'),2]),
        link: 'wiki.html#projects-arpa-monument'
    },
    monuments10 : {
        title: loc('wiki_tech_req_arpa',[loc('arpa_project_monument_title'),10]),
        link: 'wiki.html#projects-arpa-monument'
    },
    space2 : {
        title: loc('wiki_tech_req_mission',[loc('space_home_test_launch_title')]),
        link: 'wiki.html#space-structures-test_launch'
    },
    space3 : {
        title: loc('wiki_tech_req_mission',[loc('space_moon_mission_title')]),
        link: 'wiki.html#space-structures-moon_mission'
    },
    space4 : {
        title: loc('wiki_tech_req_mission',[loc('space_mission_title',[getSolarName('red')])]),
        link: 'wiki.html#space-structures-red_mission'
    },
    space5 : {
        title: loc('wiki_tech_req_mission',[loc('space_mission_title',[getSolarName('gas')])]),
        link: 'wiki.html#space-structures-gas_mission'
    },
    luna1 : {
        title: loc('wiki_tech_req_building',[loc('space_moon_base_title')]),
        link: 'wiki.html#space-structures-moon_base'
    },
    mars1 : {
        title: loc('wiki_tech_req_building',[loc('space_red_spaceport_title')]),
        link: 'wiki.html#space-structures-spaceport'
    },
    hell1 : {
        title: loc('wiki_tech_req_mission',[loc('space_mission_title',[getSolarName('hell')])]),
        link: 'wiki.html#space-structures-hell_mission'
    },
    solar1 : {
        title: loc('wiki_tech_req_mission',[loc('space_sun_mission_title')]),
        link: 'wiki.html#space-structures-sun_mission'
    },
    gas_moon1 : {
        title: loc('wiki_tech_req_mission',[loc('space_mission_title',[getSolarName('gas_moon')])]),
        link: 'wiki.html#space-structures-gas_moon_mission'
    },
    asteroid1 : {
        title: loc('wiki_tech_req_mission',[loc('space_belt_mission_title')]),
        link: 'wiki.html#space-structures-belt_mission'
    },
    asteroid3 : {
        title: loc('wiki_tech_req_building',[loc('space_belt_station_title')]),
        link: 'wiki.html#space-structures-space_station'
    },
    asteroid4 : {
        title: loc('wiki_tech_req_asteroid4'),
        link: 'wiki.html#progress-events-elerium'
    },
    dwarf1 : {
        title: loc('wiki_tech_req_mission',[loc('space_mission_title',[getSolarName('dwarf')])]),
        link: 'wiki.html#space-structures-dwarf_mission'
    },
    science11 : {
        title: loc('wiki_tech_req_megabuilding',[loc('space_dwarf_collider_title')]),
        link: 'wiki.html#space-structures-world_collider'
    },
    wsc1 : {
        title: loc('wiki_tech_req_wsc1'),
        link: 'wiki.html#space-structures-world_collider'
    },
    alpha2 : {
        title: loc('wiki_tech_req_building',[loc('interstellar_alpha_starport_title')]),
        link: 'wiki.html#interstellar-structures-starport'
    },
    droids1 : {
        title: loc('wiki_tech_req_building',[loc('interstellar_mining_droid_title')]),
        link: 'wiki.html#interstellar-structures-mining_droid'
    },
    proxima2 : {
        title: loc('wiki_tech_req_building',[loc('interstellar_xfer_station_title')]),
        link: 'wiki.html#interstellar-structures-xfer_station'
    },
    nebula2 : {
        title: loc('wiki_tech_req_building',[loc('interstellar_nexus_title')]),
        link: 'wiki.html#interstellar-structures-nexus'
    },
    neutron1 : {
        title: loc('wiki_tech_req_mission',[loc('space_mission_title',[loc('interstellar_neutron_name')])]),
        link: 'wiki.html#interstellar-structures-neutron_mission'
    },
    blackhole2 : {
        title: loc('wiki_tech_req_building',[loc('interstellar_far_reach')]),
        link: 'wiki.html#interstellar-structures-far_reach'
    },
    blackhole4 : {
        title: loc('wiki_tech_req_megabuilding',[loc('interstellar_stellar_engine')]),
        link: 'wiki.html#interstellar-structures-stellar_engine'
    },
    whitehole1 : {
        title: loc('wiki_tech_req_whitehole1')
    },
    gateway3 : {
        title: loc('wiki_tech_req_building',[loc('galaxy_starbase')]),
        link: 'wiki.html#intergalactic-structures-starbase'
    },
    stargate5 : {
        title: loc('wiki_tech_req_building',[loc('galaxy_gateway_station')]),
        link: 'wiki.html#intergalactic-structures-gateway_station'
    },
    xeno1 : {
        title: loc('wiki_tech_req_xeno1'),
        link: 'wiki.html#progress-events-alien_encounter'
    },
    xeno3 : {
        title: loc('wiki_tech_req_mission',[loc('galaxy_gorddon_mission')]),
        link: 'wiki.html#intergalactic-structures-gorddon_mission'
    },
    xeno5 : {
        title: loc('wiki_tech_req_building',[loc('galaxy_embassy')]),
        link: 'wiki.html#intergalactic-structures-embassy'
    },
    xeno9 : {
        title: loc('wiki_tech_req_building',[loc('galaxy_consulate')]),
        link: 'wiki.html#intergalactic-structures-consulate'
    },
    piracy1 : {
        title: loc('wiki_tech_req_piracy1'),
        link: 'wiki.html#progress-events-piracy'
    },
    conflict2 : {
        title: loc('wiki_tech_req_building',[loc('galaxy_foothold')]),
        link: 'wiki.html#intergalactic-structures-foothold'
    },
    conflict5 : {
        title: loc('wiki_tech_req_conflict5'),
        link: 'wiki.html#progress-events-alien_database'
    },
    chthonian2 : {
        title: loc('wiki_tech_req_mission',[loc('space_mission_title',[loc('galaxy_chthonian')])]),
        link: 'wiki.html#intergalactic-structures-chthonian_mission'
    },
    infernite1 : {
        title: loc('wiki_tech_req_building',[loc('portal_carport_title')]),
        link: 'wiki.html#hell-structures-carport'
    },
    hell_pit3 : {
        title: loc('wiki_tech_req_mission',[loc('portal_assault_forge_title')]),
        link: 'wiki.html#hell-structures-assault_forge'
    },
    corrupt1 : {
        title: loc('wiki_tech_req_corrupt1'),
        link: 'wiki.html#progress-events-corrupt_gem'
    },
    hell_ruins2 : {
        title: loc('wiki_tech_req_mission',[loc('portal_ruins_mission_title')]),
        link: 'wiki.html#hell-structures-ruins_mission'
    },
    hell_ruins3 : {
        title: loc('wiki_tech_req_hell_ruins3')
    },
    hell_gate1 : {
        title: loc('wiki_tech_req_mission',[loc('portal_gate_mission_title')]),
        link: 'wiki.html#hell-structures-gate_mission'
    },
    hell_lake2 : {
        title: loc('wiki_tech_req_mission',[loc('portal_lake_mission_title')]),
        link: 'wiki.html#hell-structures-lake_mission'
    },
    hell_spire2 : {
        title: loc('wiki_tech_req_mission',[loc('portal_spire_mission_title')]),
        link: 'wiki.html#hell-structures-spire_mission'
    },
    hell_spire8 : {
        title: loc('wiki_tech_req_hell_spire8'),
        link: 'wiki.html#hell-structures-sphinx'
    },
    hell_spire10 : {
        title: loc('wiki_tech_req_hell_spire10')
    },
    b_stone1 : {
        title: loc('wiki_tech_req_b_stone1')
    },
    waygate2 : {
        title: loc('wiki_tech_req_megabuilding',[loc('portal_waygate_title')]),
        link: 'wiki.html#hell-structures-waygate'
    },
    waygate3 : {
        title: loc('wiki_tech_req_waygate3'),
        link: 'wiki.html#mechanics-gameplay-dlord'
    },
    titan_ai_core1 : {
        title: loc('wiki_tech_req_megabuilding',[loc('space_ai_core')]),
        link: 'wiki.html#space-tp_structures-ai_core'
    },
    syard_class2 : {
        title: loc('wiki_tech_req_building',[loc('outer_shipyard_title')]),
        link: 'wiki.html#space-tp_structures-shipyard'
    },
    syard_armor3 : {
        title: loc('wiki_tech_req_building',[loc('outer_shipyard_title')]),
        link: 'wiki.html#space-tp_structures-shipyard'
    },
    syard_weapon1 : {
        title: loc('wiki_tech_req_building',[loc('outer_shipyard_title')]),
        link: 'wiki.html#space-tp_structures-shipyard'
    },
    syard_engine2 : {
        title: loc('wiki_tech_req_building',[loc('outer_shipyard_title')]),
        link: 'wiki.html#space-tp_structures-shipyard'
    },
    syard_power3 : {
        title: loc('wiki_tech_req_building',[loc('outer_shipyard_title')]),
        link: 'wiki.html#space-tp_structures-shipyard'
    },
    syard_sensor3 : {
        title: loc('wiki_tech_req_building',[loc('outer_shipyard_title')]),
        link: 'wiki.html#space-tp_structures-shipyard'
    },
    syndicate1 : {
        title: loc('wiki_tech_req_syndicate1')
    },
    outer3 : {
        title: loc('wiki_tech_req_outer3'),
        link: 'wiki.html#space-tp_structures-crashed_ship'
    },
    outer6 : {
        title: loc('wiki_tech_req_megabuilding',[loc('space_dwarf_mass_relay_title')]),
        link: 'wiki.html#space-tp_structures-mass_relay'
    },
    titan1 : {
        title: loc('wiki_tech_req_mission',[loc('space_mission_title',[getSolarName('titan')])]),
        link: 'wiki.html#space-tp_structures-titan_mission'
    },
    titan2 : {
        title: loc('wiki_tech_req_building',[loc('space_red_spaceport_title')]),
        link: 'wiki.html#space-tp_structures-titan_spaceport'
    },
    titan4 : {
        title: loc('wiki_tech_req_building',[loc('space_electrolysis_title')]),
        link: 'wiki.html#space-tp_structures-electrolysis'
    },
    enceladus1 : {
        title: loc('wiki_tech_req_mission',[loc('space_mission_title',[getSolarName('enceladus')])]),
        link: 'wiki.html#space-tp_structures-enceladus_mission'
    },
    triton1 : {
        title: loc('wiki_tech_req_mission',[loc('space_mission_title',[getSolarName('triton')])]),
        link: 'wiki.html#space-tp_structures-triton_mission'
    },
    kuiper1 : {
        title: loc('wiki_tech_req_mission',[loc('space_mission_title',[loc(`space_kuiper_title`)])]),
        link: 'wiki.html#space-tp_structures-kuiper_mission'
    },
    eris2 : {
        title: loc('wiki_tech_req_eris2',[getSolarName('eris')])
    },
    dig_control1 : {
        title: loc('wiki_tech_req_dig_control1'),
        link: 'wiki.html#space-tp_structures-digsite'
    },
    corrupted_ai1 : {
        title: loc('wiki_tech_req_corrupted_ai1')
    },
    tauceti2 : {
        title: loc('wiki_tech_req_tauceti2')
    },
    tauceti4 : {
        title: loc('wiki_tech_req_tauceti4'),
        link: 'wiki.html#space-tp_structures-jump_gate'
    },
    tau_home3 : {
        title: loc('wiki_tech_req_task',[loc('tau_home_excavate')]),
        link: 'wiki.html#tauceti-structures-excavate'
    },
    tau_red2 : {
        title: loc('wiki_tech_req_building',[loc('tau_red_orbital_platform')]),
        link: 'wiki.html#tauceti-structures-orbital_platform'
    },
    tau_gas3 : {
        title: loc('wiki_tech_req_building',[loc('tau_gas_refueling_station_title')]),
        link: 'wiki.html#tauceti-structures-refueling_station'
    },
    tau_gas25 : {
        title: loc('wiki_tech_req_megabuilding',[loc('tau_gas2_alien_station')]),
        link: 'wiki.html#tauceti-structures-alien_station'
    },
    tau_roid1 : {
        title: loc('wiki_tech_req_mission',[loc('space_mission_title',[loc('tau_roid_title')])]),
        link: 'wiki.html#tauceti-structures-roid_mission'
    },
    tau_roid4 : {
        title: loc('wiki_tech_req_building',[loc('tau_gas_ore_refinery_title')]),
        link: 'wiki.html#tauceti-structures-ore_refinery'
    },
    womling_tech1 : {
        title: loc('wiki_tech_req_womling_tech',[1]),
        link: 'wiki.html#tauceti-structures-jeff'
    },
    womling_tech2 : {
        title: loc('wiki_tech_req_womling_tech',[2]),
        link: 'wiki.html#tauceti-structures-jeff'
    },
    womling_tech3 : {
        title: loc('wiki_tech_req_womling_tech',[3]),
        link: 'wiki.html#tauceti-structures-jeff'
    },
    womling_tech4 : {
        title: loc('wiki_tech_req_womling_tech',[4]),
        link: 'wiki.html#tauceti-structures-jeff'
    },
    womling_tech5 : {
        title: loc('wiki_tech_req_womling_tech',[5]),
        link: 'wiki.html#tauceti-structures-jeff'
    },
    womling_tech6 : {
        title: loc('wiki_tech_req_womling_tech',[6]),
        link: 'wiki.html#tauceti-structures-jeff'
    },
    womling_tech7 : {
        title: loc('wiki_tech_req_womling_tech',[7]),
        link: 'wiki.html#tauceti-structures-jeff'
    },
    womling_tech8 : {
        title: loc('wiki_tech_req_womling_tech',[8]),
        link: 'wiki.html#tauceti-structures-jeff'
    },
    plague2 : {
        title: loc('wiki_tech_req_plague',[2]),
        link: 'wiki.html#progress-events-plague'
    },
    plague5 : {
        title: loc('wiki_tech_req_plague5'),
        link: 'wiki.html#tauceti-tp_tech-isolation_protocol'
    },
    disease2 : {
        title: loc('wiki_tech_req_building',[global.tech['isolation'] ? loc('tech_infectious_disease_lab_alt') : loc(global.race['artifical'] ? 'tech_infectious_disease_lab_s' : 'tech_infectious_disease_lab')]),
        link: 'wiki.html#tauceti-structures-infectious_disease_lab'
    },
    focus_cure3 : {
        title: loc('wiki_tech_req_focus_cure3')
    },
    focus_cure5 : {
        title: loc('wiki_tech_req_focus_cure',[25])
    },
    focus_cure7 : {
        title: loc('wiki_tech_req_focus_cure',[100])
    },
    alien_data1 : {
        title: loc('wiki_tech_req_alien_data',[10]),
        link: 'wiki.html#tauceti-structures-alien_station'
    },
    alien_data2 : {
        title: loc('wiki_tech_req_alien_data',[20]),
        link: 'wiki.html#tauceti-structures-alien_station'
    },
    alien_data3 : {
        title: loc('wiki_tech_req_alien_data',[30]),
        link: 'wiki.html#tauceti-structures-alien_station'
    },
    alien_data4 : {
        title: loc('wiki_tech_req_alien_data',[48]),
        link: 'wiki.html#tauceti-structures-alien_station'
    },
    alien_data5 : {
        title: loc('wiki_tech_req_alien_data',[60]),
        link: 'wiki.html#tauceti-structures-alien_station'
    },
    alien_data6 : {
        title: loc('wiki_tech_req_alien_data',[100]),
        link: 'wiki.html#tauceti-structures-alien_station'
    },
    eden1 : {
        title: loc('wiki_tech_req_megabuilding',[loc('tau_star_ringworld')]),
        link: 'wiki.html#tauceti-structures-ringworld'
    },
    decay1 : {
        title: loc('wiki_tech_req_decay1'),
        link: 'wiki.html#mechanics-gameplay-genome_decay'
    },
    locked1 : {
        title: loc('unavailable_content')
    }
};

const specialRequirements = {
    bone_tools: [
        {
            category: 'unique',
            subreqs: [
                {
                    title: loc(`wiki_tech_special_trait`,[loc(`trait_evil_name`)]),
                    color: global.race['evil'] ? true : false,
                    link: 'wiki.html#traits-species-genus_evil'
                },
                {
                    title: loc(`wiki_tech_special_trait_not`,[loc(`trait_soul_eater_name`)]),
                    color: !global.race['soul_eater'],
                    link: 'wiki.html#traits-species-special_soul_eater'
                }
            ]
        }
    ],
    wooden_tools: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'evil'
                }
            ]
        },
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'soul_eater'
                }
            ]
        }
    ],
    smokehouse: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'carnivore'
                }
            ]
        }
    ],
    lodge: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'carnivore'
                }
            ]
        }
    ],
    alt_lodge: [
        {
            category: 'unique',
            subreqs: [
                {
                    title: loc(`wiki_tech_special_species`,[loc(`race_wendigo`)]),
                    color: global.race.species === 'wendigo',
                    link: 'wiki.html#races-species-wendigo'
                },
                {
                    title: loc(`wiki_tech_special_trait`,[loc(`trait_detritivore_name`)]),
                    color: global.race['detritivore'] ? true : false,
                    link: 'wiki.html#traits-species-genus_detritivore'
                }
            ]
        }
    ],
    soul_well: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'soul_eater'
                }
            ]
        }
    ],
    compost: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    hot_compost: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    mulching: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    adv_mulching: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    agriculture: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'carnivore'
                },
                {
                    name: 'soul_eater'
                },
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    farm_house: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'carnivore'
                },
                {
                    name: 'soul_eater'
                },
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    irrigation: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'carnivore'
                },
                {
                    name: 'soul_eater'
                },
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    silo: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'carnivore'
                },
                {
                    name: 'soul_eater'
                },
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    mill: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'carnivore'
                },
                {
                    name: 'soul_eater'
                },
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    windmill: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'carnivore'
                },
                {
                    name: 'soul_eater'
                },
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    windturbine: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'carnivore'
                },
                {
                    name: 'soul_eater'
                },
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    wind_plant: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'carnivore'
                },
                {
                    name: 'soul_eater'
                },
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    gmfood: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'carnivore'
                },
                {
                    name: 'soul_eater'
                },
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    iridium_smelting_perk: [
        {
            category: 'achieve',
            subreqs: [
                {
                    name: 'pathfinder',
                    val: 3
                }
            ]
        }
    ],
    republic: [
        {
            category: 'unique',
            subreqs: [
                {
                    title: loc(`wiki_tech_special_tech`,[loc(`tech_diplomacy`)]),
                    color: global.tech['trade'] && global.tech['trade'] >= 2,
                    link: 'wiki.html#discovery-tech-diplomacy'
                },
                {
                    title: loc(`wiki_tech_special_trait`,[loc(`trait_terrifying_name`)]),
                    color: global.race['terrifying'] ? true : false,
                    link: 'wiki.html#traits-species-major_terrifying'
                }
            ]
        }
    ],
    socialist: [
        {
            category: 'unique',
            subreqs: [
                {
                    title: loc(`wiki_tech_special_tech`,[loc(`tech_diplomacy`)]),
                    color: global.tech['trade'] && global.tech['trade'] >= 2,
                    link: 'wiki.html#discovery-tech-diplomacy'
                },
                {
                    title: loc(`wiki_tech_special_trait`,[loc(`trait_terrifying_name`)]),
                    color: global.race['terrifying'] ? true : false,
                    link: 'wiki.html#traits-species-major_terrifying'
                }
            ]
        }
    ],
    federation: [
        {
            category: 'unique',
            subreqs: [
                {
                    title: loc(`wiki_tech_special_occupy`),
                    color: checkControlling(),
                    link: 'wiki.html#mechanics-gameplay-occupying'
                }
            ]
        }
    ],
    magocracy: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'magic'
                }
            ]
        }
    ],
    governor: [
        {
            category: 'crispr',
            subreqs: [
                {
                    name: 'governance',
                    tree: 'governor',
                    val: 1
                }
            ]
        },
        {
            category: 'government',
            not: true,
            subreqs: [
                {
                    name: 'anarchy'
                }
            ]
        }
    ],
    market: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'terrifying'
                }
            ]
        }
    ],
    tax_rates: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'terrifying'
                }
            ]
        }
    ],
    large_trades: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'terrifying'
                }
            ]
        }
    ],
    corruption: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'terrifying'
                },
                {
                    name: 'noble'
                }
            ]
        }
    ],
    massive_trades: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'terrifying'
                }
            ]
        }
    ],
    trade: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'terrifying'
                }
            ]
        }
    ],
    diplomacy: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'terrifying'
                }
            ]
        }
    ],
    freight: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'terrifying'
                }
            ]
        }
    ],
    wharf: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'terrifying'
                },
                {
                    name: 'thalassophobia'
                }
            ]
        }
    ],
    might: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'evil'
                }
            ]
        }
    ],
    executions: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'evil'
                }
            ]
        }
    ],
    secret_police: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'evil'
                }
            ]
        }
    ],
    ai_tracking: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'evil'
                }
            ]
        }
    ],
    predictive_arrests: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'evil'
                }
            ]
        }
    ],
    reclaimer: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'evil'
                }
            ]
        },
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                }
            ]
        },
        {
            category: 'genus',
            not: true,
            subreqs: [
                {
                    name: 'angelic'
                },
                {
                    name: 'demonic'
                }
            ]
        }
    ],
    shovel: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'evil'
                }
            ]
        },
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                }
            ]
        },
        {
            category: 'genus',
            not: true,
            subreqs: [
                {
                    name: 'angelic'
                },
                {
                    name: 'demonic'
                }
            ]
        }
    ],
    iron_shovel: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'evil'
                }
            ]
        },
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                }
            ]
        },
        {
            category: 'genus',
            not: true,
            subreqs: [
                {
                    name: 'angelic'
                },
                {
                    name: 'demonic'
                }
            ]
        }
    ],
    steel_shovel: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'evil'
                }
            ]
        },
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                }
            ]
        },
        {
            category: 'genus',
            not: true,
            subreqs: [
                {
                    name: 'angelic'
                },
                {
                    name: 'demonic'
                }
            ]
        }
    ],
    titanium_shovel: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'evil'
                }
            ]
        },
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                }
            ]
        },
        {
            category: 'genus',
            not: true,
            subreqs: [
                {
                    name: 'angelic'
                },
                {
                    name: 'demonic'
                }
            ]
        }
    ],
    alloy_shovel: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'evil'
                }
            ]
        },
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                }
            ]
        },
        {
            category: 'genus',
            not: true,
            subreqs: [
                {
                    name: 'angelic'
                },
                {
                    name: 'demonic'
                }
            ]
        }
    ],
    mythril_shovel: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'evil'
                }
            ]
        },
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                }
            ]
        },
        {
            category: 'genus',
            not: true,
            subreqs: [
                {
                    name: 'angelic'
                },
                {
                    name: 'demonic'
                }
            ]
        }
    ],
    adamantite_shovel: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'evil'
                }
            ]
        },
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                }
            ]
        },
        {
            category: 'genus',
            not: true,
            subreqs: [
                {
                    name: 'angelic'
                },
                {
                    name: 'demonic'
                }
            ]
        }
    ],
    stone_axe: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                },
                {
                    name: 'evil'
                }
            ]
        }
    ],
    copper_axes: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                },
                {
                    name: 'evil'
                }
            ]
        }
    ],
    iron_saw: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                },
                {
                    name: 'evil'
                }
            ]
        }
    ],
    steel_saw: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                },
                {
                    name: 'evil'
                }
            ]
        }
    ],
    iron_axes: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                },
                {
                    name: 'evil'
                }
            ]
        }
    ],
    steel_axes: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                },
                {
                    name: 'evil'
                }
            ]
        }
    ],
    titanium_axes: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                },
                {
                    name: 'evil'
                }
            ]
        }
    ],
    chainsaws: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'kindling_kindred'
                },
                {
                    name: 'smoldering'
                },
                {
                    name: 'evil'
                }
            ]
        }
    ],
    copper_sledgehammer: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'sappy'
                }
            ]
        }
    ],
    iron_sledgehammer: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'sappy'
                }
            ]
        }
    ],
    steel_sledgehammer: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'sappy'
                }
            ]
        }
    ],
    titanium_sledgehammer: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'sappy'
                }
            ]
        }
    ],
    copper_hoe: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'carnivore'
                },
                {
                    name: 'soul_eater'
                },
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    iron_hoe: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'carnivore'
                },
                {
                    name: 'soul_eater'
                },
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    steel_hoe: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'carnivore'
                },
                {
                    name: 'soul_eater'
                },
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    titanium_hoe: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'carnivore'
                },
                {
                    name: 'soul_eater'
                },
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    adamantite_hoe: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'carnivore'
                },
                {
                    name: 'soul_eater'
                },
                {
                    name: 'detritivore'
                }
            ]
        }
    ],
    slave_pens: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'slaver'
                }
            ]
        }
    ],
    slave_market: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'slaver'
                }
            ]
        }
    ],
    ceremonial_dagger: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'cannibalize'
                }
            ]
        }
    ],
    last_rites: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'cannibalize'
                }
            ]
        }
    ],
    ancient_infusion: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'cannibalize'
                }
            ]
        }
    ],
    armor: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'apex_predator'
                }
            ]
        }
    ],
    plate_armor: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'apex_predator'
                }
            ]
        }
    ],
    kevlar: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'apex_predator'
                }
            ]
        }
    ],
    nanoweave_vest: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'apex_predator'
                }
            ]
        }
    ],
    minor_wish: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'wish'
                }
            ]
        }
    ],
    major_wish: [
        {
            category: 'trait',
            subreqs: [
                {
                    name: 'wish'
                }
            ]
        }
    ],
    mad: [
        {
            truepath: true,
            category: 'unique',
            subreqs: [
                {
                    title: loc(`wiki_tech_special_unify`),
                    color: global.tech['world_control'] ? true : false,
                    link: 'wiki.html#globalized-tp_tech-unite'
                }
            ]
        }
    ],
    ancient_theology: [
        {
            category: 'crispr',
            subreqs: [
                {
                    name: 'ancients',
                    tree: 'ancients',
                    val: 1
                }
            ]
        }
    ],
    study: [
        {
            category: 'crispr',
            subreqs: [
                {
                    name: 'ancients',
                    tree: 'ancients',
                    val: 1
                }
            ]
        }
    ],
    encoding: [
        {
            category: 'crispr',
            subreqs: [
                {
                    name: 'ancients',
                    tree: 'ancients',
                    val: 1
                }
            ]
        }
    ],
    deify: [
        {
            category: 'crispr',
            subreqs: [
                {
                    name: 'ancients',
                    tree: 'ancients',
                    val: 1
                }
            ]
        }
    ],
    infusion: [
        {
            category: 'crispr',
            subreqs: [
                {
                    name: 'ancients',
                    tree: 'ancients',
                    val: 1
                }
            ]
        }
    ],
    gps: [
        {
            category: 'trait',
            not: true,
            subreqs: [
                {
                    name: 'terrifying'
                }
            ]
        }
    ],
    genesis: [
        {
            category: 'unique',
            subreqs: [
                {
                    title: loc(`wiki_tech_special_genesis`),
                    color: global.race.deterioration >= 1 ? true : false
                }
            ]
        }
    ],
    veil: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'magic'
                }
            ]
        }
    ],
    mana_syphon: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'magic'
                }
            ]
        }
    ],
    mana: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'magic'
                }
            ]
        }
    ],
    ley_lines: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'magic'
                }
            ]
        }
    ],
    rituals: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'magic'
                }
            ]
        }
    ],
    crafting_ritual: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'magic'
                }
            ]
        }
    ],
    mana_nexus: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'magic'
                }
            ]
        }
    ],
    clerics: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'magic'
                }
            ]
        },
        {
            category: 'crispr',
            subreqs: [
                {
                    name: 'faith',
                    tree: 'ancients',
                    val: 2
                }
            ]
        }
    ],
    conjuring: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'magic'
                }
            ]
        },
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'cataclysm'
                }
            ]
        }
    ],
    res_conjuring: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'magic'
                }
            ]
        },
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'cataclysm'
                }
            ]
        }
    ],
    alchemy: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'magic'
                }
            ]
        }
    ],
    transmutation: [
        {
            category: 'universe',
            subreqs: [
                {
                    name: 'magic'
                }
            ]
        }
    ],
    dark_bomb: [
        {
            category: 'unique',
            subreqs: [
                {
                    title: loc(`wiki_tech_special_demon_lord`),
                    color: global.stats.hasOwnProperty('spire') && 
                           global.stats.spire.hasOwnProperty(universeAffix()) && 
                           global.stats.spire[universeAffix()].hasOwnProperty('dlstr') && 
                           global.stats.spire[universeAffix()].dlstr > 0,
                    link: 'wiki.html#mechanics-gameplay-dlord'
                }
            ]
        }
    ],
    terraforming: [
        {
            category: 'challenge',
            subreqs: [
                {
                    name: 'orbitdecay'
                }
            ]
        }
    ],
    geck: [
        {
            category: 'achieve',
            subreqs: [
                {
                    name: 'lamentis',
                    val: 5
                }
            ]
        }
    ],
    womling_fun: [
        {
            category: 'unique',
            subreqs: [
                {
                    title: loc(`tau_red_contact`),
                    color: global.race['womling_friend'] ? true : false,
                    link: 'wiki.html#tauceti-structures-contact'
                },
                {
                    title: loc(`tau_red_introduce`),
                    color: global.race['womling_god'] ? true : false,
                    link: 'wiki.html#tauceti-structures-introduce'
                },
                {
                    title: loc(`tau_red_subjugate`),
                    color: global.race['womling_lord'] ? true : false,
                    link: 'wiki.html#tauceti-structures-subjugate'
                }
            ]
        }
    ],
    isolation_protocol: [
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    focus_cure: [
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    decode_virus: [
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    vaccine_campaign: [
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    vax_strat1: [
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    vax_strat2: [
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    vax_strat3: [
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    vax_strat4: [
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    cloning: [
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    clone_degredation: [
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    digital_paradise: [
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    ringworld: [
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    matrioshka_brain: [
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    ignition_device: [
        {
            category: 'scenario',
            not: true,
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    replicator: [
        {
            category: 'scenario',
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    womling_unlock: [
        {
            category: 'scenario',
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    garden_of_eden: [
        {
            category: 'scenario',
            subreqs: [
                {
                    name: 'lone_survivor'
                }
            ]
        }
    ],
    wheel: [
        {
            category: 'challenge',
            subreqs: [
                {
                    name: 'gravity_well'
                }
            ]
        }
    ],
    wagon: [
        {
            category: 'challenge',
            subreqs: [
                {
                    name: 'gravity_well'
                }
            ]
        }
    ],
    steam_engine: [
        {
            category: 'challenge',
            subreqs: [
                {
                    name: 'gravity_well'
                }
            ]
        }
    ],
    combustion_engine: [
        {
            category: 'challenge',
            subreqs: [
                {
                    name: 'gravity_well'
                }
            ]
        }
    ],
    hover_cart: [
        {
            category: 'challenge',
            subreqs: [
                {
                    name: 'gravity_well'
                }
            ]
        }
    ],
    osha: [
        {
            category: 'challenge',
            subreqs: [
                {
                    name: 'gravity_well'
                }
            ]
        }
    ],
    blackmarket: [
        {
            category: 'challenge',
            subreqs: [
                {
                    name: 'gravity_well'
                }
            ]
        }
    ],
    pipelines: [
        {
            category: 'challenge',
            subreqs: [
                {
                    name: 'gravity_well'
                }
            ]
        }
    ]
};

const extraTechPositions = {
    unification2: 'unification',
    conjuring: 'ley_lines',
    res_conjuring: 'conjuring',
    bribe_sphinx: 'miasma'
};

function getTechTrees(path){
    let techTrees = {};
    let techs = path === 'truepath' ? truepath_tech : standard_tech;
    Object.keys(techs).forEach(function (actionName){
        let action = actions.tech[actionName];
        if (!techTrees[action.grant[0]]){
            techTrees[action.grant[0]] = {};
        }
        let text = typeof actions.tech[actionName].title === 'string' ? actions.tech[actionName].title : actions.tech[actionName].title();
        techTrees[action.grant[0]][action.grant[1]] = [
            {
                name: actionName,
                title: text,
                era: actions.tech[actionName].era
            }
        ];
    });
    //Anomalies
    techTrees['primitive'][2] = [
        {
            name: 'bone_tools',
            title: loc('tech_bone_tools'),
            era: 'primitive'
        },
        {
            name: 'wooden_tools',
            title: loc('tech_wooden_tools'),
            era: 'primitive'
        }
    ];
    techTrees['theology'][3] = [
        {
            name: actions.tech['fanaticism'].wiki ? 'fanaticism' : 'alt_fanaticism',
            title: loc('tech_fanaticism'),
            era: 'civilized'
        },
        {
            name: actions.tech['anthropology'].wiki ? 'anthropology' : 'alt_anthropology',
            title: loc('tech_anthropology'),
            era: 'civilized'
        }
    ];
    techTrees['theology'][5] = [
        {
            name: 'deify',
            title: loc('tech_deify'),
            era: 'early_space'
        },
        {
            name: 'study',
            title: loc('tech_study'),
            era: 'early_space'
        }
    ];
    techTrees['ancient_study'][1] = [
        {
            name: 'study',
            title: loc('tech_study'),
            era: 'early_space'
        }
    ];
    techTrees['ancient_deify'][1] = [
        {
            name: 'deify',
            title: loc('tech_deify'),
            era: 'early_space'
        }
    ];
    if (path === 'truepath'){
        techTrees['unify'][1] = [
            {
                name: 'arpa',
                title: loc('tech_arpa'),
                era: 'globalized'
            }
        ];
        techTrees['isolation'] = {};
        techTrees['isolation'][1] = [
            {
                name: 'isolation_protocol',
                title: loc('tech_isolation_protocol'),
                era: 'tauceti'
            }
        ];
        techTrees['focus_cure'] = {};
        techTrees['focus_cure'][1] = [
            {
                name: 'focus_cure',
                title: loc('tech_focus_cure'),
                era: 'tauceti'
            }
        ];
    }
    return techTrees;
}

function addInformation(parent,key,path){
    let extra = $(`<div class="extra"></div>`);
    parent.append(extra);
    if (extraInformationTP.hasOwnProperty(key) && path === 'truepath'){
        for (let i=0; i<extraInformationTP[key].length; i++){
            extra.append(`<div>${extraInformationTP[key][i]}</div>`);
        }
    }
    else if (extraInformation.hasOwnProperty(key)){
        for (let i=0; i<extraInformation[key].length; i++){
            extra.append(`<div>${extraInformation[key][i]}</div>`);
        }
    }
    else {
        extra.append(`<div>${loc(`wiki_tech_empty`)}</div>`);
    }
}

function addRequirements(parent,key,keyName,path){
    let techTrees = getTechTrees(path);
    if (Object.keys(key.reqs).length > 0){
        let techReqs = {};
        let otherReqs = {};
        Object.keys(key.reqs).forEach(function (req){
            let color = global.tech[req] && global.tech[req] >= key.reqs[req] ? 'success' : 'danger';
            let reqID = req + key.reqs[req];
            //Determine Tech Requirements and Non-Tech Requirements
            if (techTrees[req] && techTrees[req][key.reqs[req]]) {
                techReqs[reqID] = [];
                let currTechReq = techTrees[req][key.reqs[req]];
                //For anomalies where multiple techs can fill one pre-req.
                currTechReq.forEach(function (subReq){
                    techReqs[reqID].push({
                        name: subReq.name,
                        title: subReq.title,
                        era: subReq.era,
                        color: color
                    });
                });
            }
            else if (extraRequirements[reqID]){
                otherReqs[reqID] = {
                    title: extraRequirements[reqID].title,
                    link: extraRequirements[reqID].link,
                    color: color
                };
            }
        });
        //Add Tech Requirements
        if (Object.keys(techReqs).length > 0){
            let comma = false;
            let techReq = $(`<div class="reqs"><span class="has-text-caution">${loc('wiki_tech_req_tech')}</span></div>`);
            parent.append(techReq);
            Object.keys(techReqs).forEach(function (req){
                let reqText = '';
                let isOr = false;
                let color = false;
                techReqs[req].forEach(function (subReq){
                    let subText = `<a href="wiki.html#${subReq.era}-${path === 'truepath' ? 'tp_tech' : 'tech'}-${subReq.name}" class="has-text-${subReq.color}" target="_blank">${subReq.title}</a>`;
                    color = subReq.color;
                    if (isOr){
                        reqText = loc('wiki_tech_req_or',[reqText,subText]);
                    }
                    else {
                        isOr = true;
                        reqText = subText;
                    }
                });
                techReq.append(`${comma ? `, ` : ``}<span class="has-text-${color}">${reqText}</span>`);
                comma = true;
            });
        }
        //Add Non-Tech Requirements
        if (Object.keys(otherReqs).length > 0){
            let comma = false;
            let otherReq = $(`<div class="reqs"><span class="has-text-caution">${loc('wiki_tech_req_other')}</span></div>`);
            parent.append(otherReq);
            Object.keys(otherReqs).forEach(function (req){
                let link = otherReqs[req].link;
                if (link && path === 'truepath'){
                    link = link.replace('-structures-','-tp_structures-');
                }
                let reqText = link ? `<a href="${link}" class="has-text-${otherReqs[req].color}" target="_blank">${otherReqs[req].title}</a>` : otherReqs[req].title;
                otherReq.append(`${comma ? `, ` : ``}<span class="has-text-${otherReqs[req].color}">${reqText}</span>`);
                comma = true;
            });
        }
    }
    //Add Special Requirements
    if (specialRequirements.hasOwnProperty(keyName)){
        let comma = false;
        let specialReq = $(`<div class="reqs"><span class="has-text-caution">${loc('wiki_tech_req_special')}</span></div>`);
        let hasReq = false;
        specialRequirements[keyName].forEach(function (req){
            if (req.truepath && path !== 'truepath'){
                return;
            }
            hasReq = true;
            let multi = false;
            let totalColor = false;
            let reqText = '';
            req.subreqs.forEach(function (subreq){
                let subText = '';
                let link = false;
                let color = false;
                switch (req.category){
                    case 'species':
                        subText = loc(`race_${subreq.name}`);
                        link = `wiki.html#races-species-${subreq.name}`;
                        color = global.race.species === subreq.name;
                        break;
                    case 'genus':
                        subText = loc(`genelab_genus_${subreq.name}`);
                        //Add link to the genus when a Genus page is made.
                        color = races[global.race.species].type === subreq.name;
                        break;
                    case 'trait':
                        subText = loc(`trait_${subreq.name}_name`);
                        link = `wiki.html#traits-species-${traits[subreq.name].type}_${subreq.name}`;
                        color = global.race[subreq.name];
                        break;
                    case 'tech':
                        subText = typeof actions.tech[subreq.name].title === 'string' ? actions.tech[subreq.name].title : actions.tech[subreq.name].title();
                        link = `wiki.html#${actions.tech[subreq.name].era}-tech-${subreq.name}`;
                        color = global.tech[subreq.tree] && global.genes[subreq.tree] >= subreq.val;
                        break;
                    case 'universe':
                        subText = loc(`universe_${subreq.name}`);
                        link = `wiki.html#universes-gameplay-${subreq.name}`;
                        color = global.race.universe === subreq.name;
                        break;
                    case 'crispr':
                        subText = loc(`arpa_genepool_${subreq.name}_title`);
                        link = `wiki.html#crispr-prestige-${subreq.name}`;
                        color = global.genes[subreq.tree] && global.genes[subreq.tree] >= subreq.val;
                        break;
                    case 'achieve':
                        subText = subreq.val + ` <span class="flair" aria-label="star"><svg class="star${subreq.val}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox('star')}" xml:space="preserve">${svgIcons('star')}</svg></span> ` + loc(`achieve_${subreq.name}_name`);
                        link = `wiki.html#perks-prestige-${subreq.name}`;
                        color = global.stats.achieve[subreq.name] && global.stats.achieve[subreq.name].l >= subreq.val;
                        break;
                    case 'government':
                        subText = loc(`govern_${subreq.name}`);
                        link = `wiki.html#government-gameplay-${subreq.name}`;
                        color = global.civic['govern'] && global.civic.govern['type'] && global.civic.govern.type === subreq.name;
                        break;
                    case 'scenario':
                        subText = loc(`wiki_challenges_scenarios_${subreq.name}`);
                        link = `wiki.html#challenges-gameplay-scenarios_${subreq.name}`;
                        color = global.race[subreq.name];
                        break;
                    case 'challenge':
                        subText = loc(`wiki_challenges_modes_${subreq.name}`);
                        link = `wiki.html#challenges-gameplay-modes_${subreq.name}`;
                        color = global.race[subreq.name];
                        break;
                    case 'unique':
                        subText = subreq.title;
                        link = subreq.link;
                        color = subreq.color;
                        break;
                }
                if (link && path === 'truepath'){
                    link = link.replace('-tech-','-tp_tech-');
                }
                totalColor = totalColor || color;
                if (req.not){
                    color = !color;
                }
                color = color ? 'success' : 'danger';
                if (link){
                    subText = `<a href="${link}" class="has-text-${color}" target="_blank">${subText}</a>`
                }
                else {
                    subText = `<span class="subreqs has-text-${color}">${subText}</span>`;
                }
                if (multi){
                    reqText = loc('wiki_tech_req_or',[reqText,subText]);
                }
                else {
                    multi = true;
                    reqText = subText;
                }
            });
            if (req.not){
                totalColor = !totalColor;
            }
            totalColor = totalColor ? 'success' : 'danger';
            if (req.category !== 'unique'){
                reqText = loc(`wiki_tech_special_${req.category}${req.not ? '_not' : ''}`,[reqText]);
            }
            specialReq.append(`${comma ? `, ` : ``}<span class="has-text-${totalColor}">${reqText}</span>`);
            comma = true;
        });
        if (hasReq){
            parent.append(specialReq);
        }
    }
}

const alt_era = {
    solar: 'interstellar'
};
const alt_era_r = {
    interstellar: 'solar'
};

export function renderTechPage(era,path){
    let content = sideMenu('create');;
    let techListing = [];
    let otherTechs = [];
    let techs = path === 'truepath' ? truepath_tech : standard_tech;
    let prefix = path === 'truepath' ? 'tp_tech' : 'tech';

    Object.keys(techs).forEach(function (actionName){
        let action = techs[actionName];
        if (action.hasOwnProperty('era') && (action.era === era || action.era === alt_era[era]) && (!action.hasOwnProperty('wiki') || action.wiki)){
            let id = techs[actionName].id.split('-');
            let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
            actionDesc(info, action);
            addInformation(info, actionName, path);
            addRequirements(info, action, actionName, path);
            if (action.cost['Knowledge']){
                if (techListing.length === 0){
                    techListing[0] = [action, info];
                }
                else {
                    let knowledgeCost = action.cost.Knowledge();
                    let insertPos = techListing.length - 1;
                    
                    while (insertPos >= 0 && techListing[insertPos][0].cost.Knowledge() > knowledgeCost) { 
                        techListing[insertPos + 1] = techListing[insertPos]; 
                        insertPos--; 
                    } 
                    techListing[insertPos + 1] = [action, info]; 
                }
            }
            else {
                otherTechs.push([action, info]);
            }
        }
    });
    if (otherTechs.length > 0) {
        for (let i=0; i<otherTechs.length; i++) {
            let sorted = false;
            Object.keys(extraTechPositions).forEach(function (extraTech){
                if (!sorted && otherTechs[i][0].id === `${prefix}-` + extraTech) {
                    let insertPos = -1;
                    for (let i=0; i<techListing.length; i++) {
                        if (techListing[i][0].id === `${prefix}-` + extraTechPositions[extraTech]) {
                            insertPos = i + 1;
                            break;
                        }
                    }
                    let tempArray = techListing.slice(0, insertPos);
                    tempArray.push(otherTechs[i]);
                    techListing = tempArray.concat(techListing.slice(insertPos));
                    sorted = true;
                }
            });
            if (!sorted){
                techListing.push(otherTechs[i]);
            }
        }
    }
    for (let i=0; i<techListing.length; i++) {
        let era = path === 'truepath' && alt_era_r[techListing[i][0].era] ? alt_era_r[techListing[i][0].era] : techListing[i][0].era;
        content.append(techListing[i][1]);
        let id = techListing[i][0].id.split('-');
        sideMenu('add',`${era}-${prefix}`,id[1],typeof techListing[i][0].title === 'function' ? techListing[i][0].title() : techListing[i][0].title);
    }
}
