import { global } from './../vars.js';
import { loc } from './../locale.js';
import { actions, housingLabel } from './../actions.js';
import { getHalloween } from './../functions.js';
import { actionDesc, sideMenu } from './functions.js';

const isHalloween = getHalloween();

const extraInformation = {
    club: global.race['soul_eater'] ? [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Souls_name`)])]
        : [
        loc(`wiki_tech_club`),
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Food_name`)])
    ],
    bone_tools: [
        loc(`wiki_tech_bone_tools`)
    ],
    wooden_tools: [
        loc(`wiki_tech_bone_tools`)
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
    soul_lodge: [
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
        loc(`wiki_tech_building_unlock`,[loc(`interstellar_stellar_forge_title`)]),
        loc(`wiki_tech_fuel_unlock`,[loc(`star`)])
    ],
    stellar_smelting: [
        loc(`wiki_tech_stellar_smelting`)
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
        loc(`wiki_tech_dazzle`,[33.33])
    ],
    bolognium_vaults: [
        loc(`wiki_tech_casino_vault`,[60000,240000])
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
        loc(`wiki_tech_crate_upgrade`,[500,300])
    ],
    cranes: [
        loc(`wiki_tech_cranes`,[loc(`city_storage_yard`),loc(`resource_Crates_name`)])
    ],
    titanium_crates: [
        loc(`wiki_tech_crate_upgrade`,[750,500])
    ],
    mythril_crates: [
        loc(`wiki_tech_crate_upgrade`,[1000,750])
    ],
    infernite_crates: [
        loc(`wiki_tech_crate_upgrade`,[1500,1000])
    ],
    graphene_crates: [
        loc(`wiki_tech_crate_upgrade`,[2200,1500])
    ],
    bolognium_crates: [
        loc(`wiki_tech_crate_upgrade`,[6200,2200])
    ],
    steel_containers: [
        loc(`wiki_tech_building_unlock`,[loc(`city_warehouse`)])
    ],
    gantry_crane: [
        loc(`wiki_tech_cranes`,[loc(`city_warehouse`),loc(`resource_Containers_name`)])
    ],
    alloy_containers: [
        loc(`wiki_tech_crate_upgrade`,[1200,800])
    ],
    mythril_containers: [
        loc(`wiki_tech_crate_upgrade`,[1600,1200])
    ],
    adamantite_containers: [
        loc(`wiki_tech_crate_upgrade`,[2200,1600])
    ],
    aerogel_containers: [
        loc(`wiki_tech_crate_upgrade`,[3200,2200])
    ],
    bolognium_containers: [
        loc(`wiki_tech_crate_upgrade`,[9700,3200])
    ],
    nanoweave_containers: [
        loc(`wiki_tech_crate_upgrade`,[17700,9700])
    ],
    evil_planning: [
        loc(`wiki_tech_urban_planning`)
    ],
    urban_planning: [
        loc(`wiki_tech_urban_planning`)
    ],
    zoning_permits: [
        loc(`wiki_tech_zoning_permits`,[2])
    ],
    urbanization: [
        loc(`wiki_tech_zoning_permits`,[3])
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
        loc(`wiki_tech_large_trades`,[5000])
    ],
    corruption: [
        loc(`wiki_tech_corruption`)
    ],
    massive_trades: [
        loc(`wiki_tech_large_trades`,[1000000])
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
        loc(`wiki_tech_building_unlock`,[loc(`city_slave_pen`)])
    ],
    slave_market: [
        loc(`wiki_tech_slave_market`)
    ],
    wiki_tech_ceremonial_dagger: [
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
        loc(`wiki_tech_bac_tanks`)
    ],
    boot_camp: [
        loc(`wiki_tech_building_unlock`,[loc(`city_boot_camp`)])
    ],
    vr_training: [
        loc(`wiki_tech_vr_training`)
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
    hunter_process: [
        loc(`wiki_tech_hunter_process`,[loc(`resource_Steel_name`),25])
    ],
    kroll_process: [
        loc(`wiki_tech_hunter_process`,[loc(`resource_Iron_name`),25])
    ],
    cambridge_process: [
        loc(`wiki_tech_hunter_process`,[loc(`resource_Steel_name`),10]),
        loc(`wiki_tech_hunter_process`,[loc(`resource_Iron_name`),10])
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
        loc(`wiki_tech_unification2h`)
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
    gravitational_waves: [
        loc(`wiki_tech_gravitational_waves`)
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
        loc(`wiki_tech_xeno_gift`,[global.galaxy['alien1'] ? loc(`race_${global.galaxy.alien1.id}`) : loc(`galaxy_alien1_proxy`)]),
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
        loc(`wiki_tech_destination_unlock`,[loc(`galaxy_alien2_mission`,[global.galaxy['alien2'] ? loc(`race_${global.galaxy.alien2.id}`) : loc(`galaxy_alien2_proxy`)]),loc(`galaxy_alien`,[global.galaxy['alien2'] ? loc(`race_${global.galaxy.alien2.id}`) : loc(`galaxy_alien2_proxy`)])])
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
    gun_emplacement: [
        loc(`wiki_tech_building_unlock`,[loc(`portal_gun_emplacement_title`)])
    ],
    advanced_emplacement: [
        loc(`wiki_tech_advanced_emplacement1`),
        loc(`wiki_tech_advanced_emplacement2`)
    ],
    mana: [
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Mana_name`)]),
        loc(`wiki_tech_resource_unlock`,[loc(`resource_Crystal_name`)]),
        loc(`wiki_tech_job_unlock`,[loc(`job_crystal_miner`)])
    ],
    ley_lines: [
        loc(`wiki_tech_building_unlock`,[loc(`city_pylon`)])
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
    ]
};

const extraRequirements = {
    theology1 : loc('wiki_tech_req_theology1'),
    genetics3 : loc('wiki_tech_req_genetics3'),
    supercollider1 : loc('wiki_tech_req_arpa',[loc('arpa_projects_lhc_title'),1]),
    supercollider2 : loc('wiki_tech_req_arpa',[loc('arpa_projects_lhc_title'),2]),
    supercollider3 : loc('wiki_tech_req_arpa',[loc('arpa_projects_lhc_title'),3]),
    stock_exchange1 : loc('wiki_tech_req_arpa',[loc('arpa_projects_stock_exchange_title'),1]),
    monuments2 : loc('wiki_tech_req_arpa',[loc('arpa_project_monument_title'),2]),
    space2 : loc('wiki_tech_req_mission',[loc('space_home_test_launch_title')]),
    space3 : loc('wiki_tech_req_mission',[loc('space_moon_mission_title')]),
    space4 : loc('wiki_tech_req_mission',[loc('space_mission_title',[getSolarName('red')])]),
    space5 : loc('wiki_tech_req_mission',[loc('space_mission_title',[getSolarName('gas')])]),
    luna1 : loc('wiki_tech_req_building',[loc('space_moon_base_title')]),
    mars1 : loc('wiki_tech_req_building',[loc('space_red_spaceport_title')]),
    hell1 : loc('wiki_tech_req_mission',[loc('space_mission_title',[getSolarName('hell')])]),
    solar1 : loc('wiki_tech_req_mission',[loc('space_sun_mission_title')]),
    gas_moon1 : loc('wiki_tech_req_mission',[loc('space_mission_title',[getSolarName('gas_moon')])]),
    asteroid1 : loc('wiki_tech_req_mission',[loc('space_belt_mission_title')]),
    asteroid3 : loc('wiki_tech_req_building',[loc('space_belt_station_title')]),
    asteroid4 : loc('wiki_tech_req_asteroid4'),
    dwarf1 : loc('wiki_tech_req_mission',[loc('space_mission_title',[getSolarName('dwarf')])]),
    genesis1 : loc('wiki_tech_req_genesis1'),
    science11 : loc('wiki_tech_req_megabuilding',[loc('space_dwarf_collider_title')]),
    wsc1 : loc('wiki_tech_req_wsc1'),
    alpha2 : loc('wiki_tech_req_building',[loc('interstellar_alpha_starport_title')]),
    droids1 : loc('wiki_tech_req_building',[loc('interstellar_mining_droid_title')]),
    proxima2 : loc('wiki_tech_req_building',[loc('interstellar_xfer_station_title')]),
    nebula2 : loc('wiki_tech_req_building',[loc('interstellar_nexus_title')]),
    neutron1 : loc('wiki_tech_req_mission',[loc('space_mission_title',[loc('interstellar_neutron_name')])]),
    blackhole2 : loc('wiki_tech_req_building',[loc('interstellar_far_reach')]),
    blackhole4 : loc('wiki_tech_req_megabuilding',[loc('interstellar_stellar_engine')]),
    whitehole1 : loc('wiki_tech_req_whitehole1'),
    gateway3 : loc('wiki_tech_req_building',[loc('galaxy_starbase')]),
    stargate5 : loc('wiki_tech_req_building',[loc('galaxy_gateway_station')]),
    xeno1 : loc('wiki_tech_req_xeno1'),
    xeno3 : loc('wiki_tech_req_mission',[loc('galaxy_gorddon_mission')]),
    xeno5 : loc('wiki_tech_req_building',[loc('galaxy_embassy')]),
    xeno9 : loc('wiki_tech_req_building',[loc('galaxy_consulate')]),
    piracy1 : loc('wiki_tech_req_piracy1'),
    conflict2 : loc('wiki_tech_req_building',[loc('galaxy_foothold')]),
    conflict5 : loc('wiki_tech_req_conflict5'),
    chthonian2 : loc('wiki_tech_req_mission',[loc('space_mission_title',[loc('galaxy_chthonian')])]),
    infernite1 : loc('wiki_tech_req_building',[loc('portal_carport_title')]),
    hell_pit3 : loc('wiki_tech_req_mission',[loc('portal_assault_forge_title')]),
    corrupt1 : loc('wiki_tech_req_corrupt1'),
    hell_ruins2 : loc('wiki_tech_req_mission',[loc('portal_ruins_mission_title')]),
    hell_ruins3 : loc('wiki_tech_req_hell_ruins3'),
    hell_gate1 : loc('wiki_tech_req_mission',[loc('portal_gate_mission_title')]),
    hell_lake2 : loc('wiki_tech_req_mission',[loc('portal_lake_mission_title')]),
    hell_spire2 : loc('wiki_tech_req_mission',[loc('portal_spire_mission_title')]),
    hell_spire8 : loc('wiki_tech_req_hell_spire8'),
    hell_spire10 : loc('wiki_tech_req_hell_spire10'),
    b_stone1 : loc('wiki_tech_req_b_stone1'),
    waygate3 : loc('wiki_tech_req_waygate3'),
    decay1 : loc('wiki_tech_req_decay1')
};

const extraTechPositions = {
    unification2: 'unification',
    conjuring: 'ley_lines',
    res_conjuring: 'conjuring',
    bribe_sphinx: 'miasma'
};

var techTrees = {};
Object.keys(actions.tech).forEach(function (actionName){
    let action = actions.tech[actionName];
    if (!techTrees[action.grant[0]]){
        techTrees[action.grant[0]] = {};
    }
    techTrees[action.grant[0]][action.grant[1]] = typeof actions.tech[actionName].title === 'string' ? actions.tech[actionName].title : actions.tech[actionName].title();
});
//Anomalies
techTrees['primitive'][2] = loc('wiki_tech_req_or',[loc('tech_bone_tools'),loc('tech_wooden_tools')]);
techTrees['theology'][3] = loc('wiki_tech_req_or',[loc('tech_fanaticism'),loc('tech_anthropology')]);
techTrees['theology'][5] = loc('wiki_tech_req_or',[loc('tech_deify'),loc('tech_study')]);
techTrees['ancient_study'][1] = loc('tech_study');
techTrees['ancient_deify'][1] = loc('tech_deify');

function getSolarName(planet) {
    if (global.race.species === 'protoplasm'){
        return loc(`race_human_solar_${planet}`);
    }
    else if (global.race.species === 'custom') {
        return global.custom.race0[planet];
    }
    else {
        return loc(`race_${global.race.species}_solar_${planet}`);
    }
}

function addInformation(parent,key){
    let extra = $(`<div class="extra"></div>`);
    parent.append(extra);
    if (extraInformation.hasOwnProperty(key)){
        for (let i=0; i<extraInformation[key].length; i++){
            extra.append(`<div>${extraInformation[key][i]}</div>`);
        }
    }
    else {
        extra.append(`<div>${loc(`wiki_tech_empty`)}</div>`);
    }
}

function addRequirements(parent,key){
    if (Object.keys(key.reqs).length > 0){
        let techReqs = {};
        let otherReqs = {};
        Object.keys(key.reqs).forEach(function (req){
            let color = global.tech[req] && global.tech[req] >= key.reqs[req] ? 'success' : 'danger';
            let reqName = '';
            if (techTrees[req] && techTrees[req][key.reqs[req]]) {
                reqName = techTrees[req][key.reqs[req]];
                techReqs[reqName] = color;
            }
            else if (extraRequirements[req + key.reqs[req]]){
                reqName = extraRequirements[req + key.reqs[req]];
                otherReqs[reqName] = color;
            }
        });
        if (Object.keys(techReqs).length > 0){
            let comma = false;
            let techReq = $(`<div class="reqs"><span class="has-text-caution">${loc('wiki_tech_req_tech')}</span></div>`);
            parent.append(techReq);
            Object.keys(techReqs).forEach(function (req){
                techReq.append(`${comma ? `, ` : ``}<span class="has-text-${techReqs[req]}">${req}</span>`);
                comma = true;
            });
        }
        if (Object.keys(otherReqs).length > 0){
            let comma = false;
            let otherReq = $(`<div class="reqs"><span class="has-text-caution">${loc('wiki_tech_req_other')}</span></div>`);
            parent.append(otherReq);
            Object.keys(otherReqs).forEach(function (req){
                otherReq.append(`${comma ? `, ` : ``}<span class="has-text-${otherReqs[req]}">${req}</span>`);
                comma = true;
            });
        }
    }
}

export function renderTechPage(era){
    let content = sideMenu('create');;
    let techList = [];
    let otherTechs = [];

    Object.keys(actions.tech).forEach(function (actionName){
        let action = actions.tech[actionName];
        if (action.hasOwnProperty('era') && action.era === era && (!action.hasOwnProperty('wiki') || action.wiki)){
            let id = actions.tech[actionName].id.split('-');
            let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
            actionDesc(info, action);
            addInformation(info, actionName);
            addRequirements(info, action);
            if (action.cost['Knowledge']){
                if (techList.length === 0){
                    techList[0] = [action, info];
                }
                else {
                    let knowledgeCost = action.cost.Knowledge();
                    let insertPos = techList.length - 1;
                    
                    while (insertPos >= 0 && techList[insertPos][0].cost.Knowledge() > knowledgeCost) { 
                        techList[insertPos + 1] = techList[insertPos]; 
                        insertPos--; 
                    } 
                    techList[insertPos + 1] = [action, info]; 
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
                if (!sorted && otherTechs[i][0].id === 'tech-' + extraTech) {
                    let insertPos = -1;
                    for (let i=0; i<techList.length; i++) {
                        if (techList[i][0].id === 'tech-' + extraTechPositions[extraTech]) {
                            insertPos = i + 1;
                            break;
                        }
                    }
                    let tempArray = techList.slice(0, insertPos);
                    tempArray.push(otherTechs[i]);
                    techList = tempArray.concat(techList.slice(insertPos));
                    sorted = true;
                }
            });
            if (!sorted){
                techList.push(otherTechs[i]);
            }
        }
    }
    for (let i=0; i<techList.length; i++) {
        content.append(techList[i][1]);
        let id = techList[i][0].id.split('-');
        sideMenu('add',`${techList[i][0].era}-tech`,id[1],typeof techList[i][0].title === 'function' ? techList[i][0].title() : techList[i][0].title);
    }
}