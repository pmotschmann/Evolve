import {} from './../vars.js';
import { clearElement } from './../functions.js';

const changeList = [
    {
        version: `1.3.4`,
        date: `3/24/2023`,
        changes: [
            `Evolving Synth can now chose imitation race from any species killed by an AI Apocalypse.`,
            `Fixed issue with miscalculating low fuel usage for various power generating structures.`,
            `Extractor Ship Isolation output boosted by 20%.`,
            `Added additional Hooved reskins.`,
            `Fixed various issues with Preload Tab Content.`,
            `Explorer Ship config is now locked down for Engine, Sensor, and Weapon components.`,
            `Skilled Servants assigned to craft inactive resources will now be refunded.`,
        ]
    },
    {
        version: `1.3.3`,
        revision: `a`,
        date: `3/20/2023`,
        changes: [
            `Fixed a bug that could cause the Test Launch to be unavailable.`,
        ]
    },
    {
        version: `1.3.3`,
        date: `3/15/2023`,
        changes: [
            `Rebalanced Soul Gem drop mechanics.`,
            `Added Annihilation Feat.`,
            `Added additional Mass Ejector Optimizer config mode.`,
            `Servants are no longer affected by most racial traits.`,
            `The Lone Survivor can no longer benefit from Hivemind.`,
            `Fixed High Pop issue with Pit Miners.`,
            `Fixed bug with unlocking Replicator without a Governor.`,
        ]
    },
    {
        version: `1.3.2`,
        revision: `c`,
        date: `3/8/2023`,
        changes: [
            `Fixed cataclysm reset while having preload tab content enabled.`,
        ]
    },
    {
        version: `1.3.2`,
        revision: `b`,
        date: `3/5/2023`,
        changes: [
            `Fixed Rock Quarry under industry tab for Smoldering players.`,
        ]
    },
    {
        version: `1.3.2`,
        revision: `a`,
        date: `3/5/2023`,
        changes: [
            `Adjusted hell calculation.`,
        ]
    },
    {
        version: `1.3.2`,
        date: `3/4/2023`,
        changes: [
            `High-Tech Factory changed back to tool modifier, however value is increased from original 25% to 90%.`,
            `Advanced Material Synthesis increased from 50% to 65%.`,
            `Added new interaction between Hell Surveyors and Drone victims.`,
            `Fixed bug that would cause Replicator Governor task to swap resources when focusing a resource without a cap.`,
            `Fixed inability to produce Chrysotile in Isolation.`
        ]
    },
    {
        version: `1.3.1`,
        date: `3/3/2023`,
        changes: [
            `Added Advanced Material Synthesis tech to Isolation path.`,
            `High-Tech Factory crafting bonus changed from a Tool modifier to a direct multiplier.`,
            `Updated Mass Ejector Optimizer logic.`,
            `Fixed a bug that broke Cataclysm reset.`,
            `Fixed fuel calculation bug with Moon Bases and Spaceports.`,
            `Fixed issue with self replicating Synth and Nano.`,
            `Fixed bugs with purchasing CRISPR techs in Antimatter universe.`,
        ]
    },
    {
        version: `1.3.0`,
        revision: `b`,
        date: `3/1/2023`,
        changes: [
            `Fixed issue with Mass Ejector Optimizer gov task breaking the governor subtab.`,
        ]
    },
    {
        version: `1.3.0`,
        revision: `a`,
        date: `3/1/2023`,
        changes: [
            `Fixed Antimatter universe.`,
        ]
    },
    {
        version: `1.3.0`,
        date: `3/1/2023`,
        changes: [
            `The True Path has been extended, explore Tau Ceti and expand your civilization.`,
            `Added Perks: Evolve Master and Evolve Grandmaster.`,
            `Added Distributed Low Power mode setting.`,
            `Added Precognition CRISPR upgrade.`,
            `Strong trait now buffs basic jobs but has a weaker effect on manual resource collection.`,
            `Ships in Truepath can now only be scrapped at the Shipyard.`,
            `Truepath Sensor Range and Costs adjusted. Range now depends partly on base ship class.`,
            `Queue stacks now indicate first block vs last blocking resource with a gradient indicator.`,
            `Added screen reader improvements for blocking resources.`,
            `You can no longer unlock Anarchist by Cataclysm.`,
            `Syndicate will now also steal food from Biodomes.`,
            `Reinforced Shed upgrade now requires unlocking Iron Mining.`,
            `You must now construct a Titan Habitat before a Titan Mine.`,
            `Removed dark background effect from modal popups.`,
            `Increased Entrepreneur Governor trade bonus from 75% to 125% and Bank capacity boost from 10% to 12%.`,
            `Increased Media Governor morale bonuses and Library bonus.`,
            `Increased Soldier Governor combat bonus from 5% to 25%.`,
            `Increased Educator Governor knowledge bonus from 5% to 6%.`,
            `Increased Spiritualist Governor worker bonus from 10% to 20% and tourism bonus from $2 to $5 per Temple.`,
            `Increased Noble Governor tax cap bonus from 10% to 20%.`,
            `Bluecollar Governor now increases output of Coal and Oil power plants and boosts Miners, Smelter, and Oil Derrick.`,
            `Bureaucrat Governor now provides a slight boost to government effects.`,
        ]
    },
    {
        version: `1.2.21`,
        date: `1/10/2023`,
        changes: [
            `New Achievement filtering options in Wiki.`,
            `Updated Chinese lang file.`,
            `Updated Korean lang file.`
        ]
    },
    {
        version: `1.2.20`,
        date: `9/16/2022`,
        changes: [
            `New homelessness system.`,
            `Factory, Mining Droids, and Graphene Plants will remember resource assignment after a low power shutdown.`,
            `Terraforming and Ascension can no longer be queued or multi-clicked.`,
            `AI Cores show correct bonus in tooltip.`,
            `Stealing Rocketry will now unlock rival in Truepath.`,
            `Playful will no longer remove unemployed stress with no hunters.`,
            `Andromeda Citizens will no longer stick around if abandoned by a stargate shutdown.`,
            `Fixed various bugs with mutating in or out some traits.`,
            `Made some improvements for screen readers to determine active state of challenges.`
        ]
    },
    {
        version: `1.2.19`,
        revision: `a`,
        date: `8/21/2022`,
        changes: [
            `Home Planet Orbital structures are now merged with the Moon instead of Red Planet in Cataclysm.`,
        ]
    },
    {
        version: `1.2.19`,
        date: `8/20/2022`,
        changes: [
            `Added rank scaling effects to traits: Carnivore, Hooved, Leathery, Unified, & Magnificent.`,
            `Structures orbiting the home planet are now moved to the Red planet after Orbit Decay or during Cataclysm.`,
            `Fixed a bug with deactivating fuel consuming structures when fuel runs dry.`,
            `Already active Governor tasks will no longer display for assignment in other task slots.`,
            `Constructing a Stellar or Infernal Forge will now assign Iron as a default resource instead of nothing.`,
            `Buffed effects of Star Forge fueled smelting.`,
            `Fixed an incorrect source label for money storage in Orbit Decay.`,
        ]
    },
    {
        version: `1.2.18`,
        revision: `a`,
        date: `8/14/2022`,
        changes: [
            `Fixed ARPA queueing.`,
        ]
    },
    {
        version: `1.2.18`,
        date: `8/14/2022`,
        changes: [
            `More accurate timers when using Governor Trash Management task.`,
            `Optimistic Min Morale effect now scales with trait rank.`,
            `Fixed TP loot table when Assaulting or Sieging rival.`,
        ]
    },
    {
        version: `1.2.17`,
        revision: `a`,
        date: `8/10/2022`,
        changes: [
            `Cheese Event power is now scaled with your cheese level.`,
            `Fixed Soft Reset bug with Rejuvenated.`,
        ]
    },
    {
        version: `1.2.17`,
        date: `8/10/2022`,
        changes: [
            `New Hell stats tracking and analytics.`,
            `Fixed Genetics not unlocking in Cataclysm.`,
            `Fixed many High Pop scaling interactions.`,
            `Fixed some loading bugs with wiki when no save data is present.`,
            `Updated various wiki entries and calculators.`,
            `Updated Pig Latin.`
        ]
    },
    {
        version: `1.2.16`,
        revision: `a`,
        date: `8/8/2022`,
        changes: [
            `Fixed OD bugs with Ziggurat, Garage, and Fabrication.`,
            `Fixed Launch Facility sometimes getting stuck in queue.`
        ]
    },
    {
        version: `1.2.16`,
        date: `8/4/2022`,
        changes: [
            `Added Orbit Decay Challenge.`,
            `Added Retrograde planetary trait.`,
            `New achievement: Better dead than red.`,
            `New CRISPR upgrade: Civil Service.`,
            `Other stuff the dev was too lazy to document.`
        ]
    },
    {
        version: `1.2.15`,
        revision: `a`,
        date: `7/1/2022`,
        changes: [
            `Fixed bug that prevented games without save data from loading.`,
        ]
    },
    {
        version: `1.2.15`,
        date: `7/1/2022`,
        changes: [
            `Firework Festival now starts on July 1st and ends July 4th.`,
            `Added Dracula theme by azzzertyy.`,
            `Fixed bug with Horseshoe governor and multiplier keys.`,
            `Fixed issues with starting Cataclysm as Synth.`,
            `Fixed bugs with wrong path techs being displayed.`,
            `Evil Synth now start with a Graveyard instead of a Lumberyard.`,
            `Deify and study can no longer be queued at same time.`,
            `Restore backup no longer requires double clicking to trigger confirmation box.`,
        ]
    },
    {
        version: `1.2.14`,
        revision: `a`,
        date: `4/19/2022`,
        changes: [
            `Fixed some minor bugs.`,
            `Updated some translations.`
        ]
    },
    {
        version: `1.2.14`,
        date: `4/1/2022`,
        changes: [
            `Added Titan Mine slider to Industry tab.`,
            `Added additional popup confirmation to Restore Backup.`,
            `Nanite Factory interface now has tooltips for each resource`,
            `The Vault Discovery event can no longer occur if there are 0 Archaeologists and/or if Suppression is at 0%`,
            `Fixed bugs related to unlocking the Fool feat.`,
            `Fixed bugs with Mass Ejector optimizor governor task.`,
        ]
    },
    {
        version: `1.2.13`,
        date: `3/31/2022`,
        changes: [
            `Restore Backup must now be clicked twice to trigger.`,
        ]
    },
    {
        version: `1.2.12`,
        revision: `c`,
        date: `3/7/2022`,
        changes: [
            `Fixed Double Density achievement.`,
        ]
    },
    {
        version: `1.2.12`,
        revision: `b`,
        date: `3/2/2022`,
        changes: [
            `Fixed logic fault with mech constructor inferno upgrades.`,
        ]
    },
    {
        version: `1.2.12`,
        revision: `a`,
        date: `3/1/2022`,
        changes: [
            `Fixed some bugs with planet traits.`,
            `Fixed bug with attacking on Swamp planets.`
        ]
    },
    {
        version: `1.2.12`,
        date: `2/28/2022`,
        changes: [
            `Planets can now have upto two traits.`,
            `Advanced Biomes: Savanna, Swamp, Ashland, and Taiga can now appear.`,
            `Added Permafrost planetary trait.`,
            `Forest Biome lumber bonus changed from 15% to 20%.`,
            `Exotic materials are now ranked higher by the Mass Optimizer governor task.`,
            `Repair droid effect on Carport repairs buffed from 5% to 8%.`,
            `You must now discover the Hell Vault through Archaeology.`,
            `Water now has Mass.`,
        ]
    },
    {
        version: `1.2.11`,
        date: `2/16/2022`,
        changes: [
            `Added Doomed achievement to the perks lists.`,
            `Added Governor CRISPR tree to perks list.`,
            `Updated prestige gain/bonus calculators.`,
            `Fixed Ritual Casting not showing up in Industry in Cataclysm.`,
            `Detritivores no longer see the Farming ritual.`,
            `Fixed Entertainer tooltip showing twice the effect of Musical.`,
            `Fixed Gauss Rifles showing the effect for Disruptor Rifles.`,
            `Fixed Water Freighter tooltip showing half the Helium-3 cost.`,
            `Fixed some affordability checks.`
        ]
    },
    {
        version: `1.2.10`,
        date: `2/7/2022`,
        changes: [
            `Bioseed probes now have significantly less cost creep inside True Path scenario.`,
            `You can no longer manually buy or sell resources while the game is paused.`,
            `Fixed bug with High Pop trait and Savings Bonds granting too much money.`,
            `Minor bug fixes`
        ]
    },
    {
        version: `1.2.9`,
        date: `1/29/2022`,
        changes: [
            `Spies may now sell you out when caught or escape when failing a mission.`,
            `Infiltrator can now steal Quantium tech inside True Path.`,
            `Genetics Lab UI updated.`
        ]
    },
    {
        version: `1.2.8`,
        revision: `a`,
        date: `1/19/2022`,
        changes: [
            `Fixed Farmer per Farm scaling with High Pop trait.`,
            `Adjusted low end scaling of High Pop Hivemind trait.`,
            `Wireless Signal cost for Symposium lowered.`,
            `Added Anarchy scaling with High Pop`
        ]
    },
    {
        version: `1.2.8`,
        date: `1/19/2022`,
        changes: [
            `Insectoid genus redesigned with High Population trait.`,
            `Fixed bug that caused incorrect timer calculations when using Slow or Hyper trait at any rank other then 1.`
        ]
    },
    {
        version: `1.2.7`,
        revision: `a`,
        date: `1/11/2022`,
        changes: [
            `Fixed storage bug with standard universe.`,
        ]
    },
    {
        version: `1.2.7`,
        date: `1/11/2022`,
        changes: [
            `Failed Experiment Challenge mode.`,
            `Ziggurat bonus separated from base production of buildings.`,
            `Fixed bug that prevented smoldering races from being able to loot Chrysotile`,
            `Fixed bug that would cause Intergalactic Tech page in wiki not to load if you were playing in Antimatter universe.`,
        ]
    },
    {
        version: `1.2.6`,
        date: `12/24/2021`,
        changes: [
            `Fixed bug that prevented custom Synthetic race from showing if you refreshed the page.`,
            `Fixed bugs with Synthetic evolution and traits: Calm, Cannibalize, and Magnificent.`,
            `Fixed bugs with using the quick tab keys when preload tabs is enabled.`
        ]
    },
    {
        version: `1.2.5`,
        date: `12/21/2021`,
        changes: [
            `Fixed bug that caused a planet to lose its geology traits after an AI reset.`,
            `Fixed bug with scavenger job description.`,
        ]
    },
    {
        version: `1.2.4`,
        date: `12/19/2021`,
        changes: [
            `Solar system now has elliptical orbits.`,
            `Fixed Evolve Adept Food bonus.`,
            `Rank of each aquired trait is now listed in genetics tab.`,
            `Crate/Container sources are now listed in resource popup.`,
            `Manual buying/selling will auto scale down to prevent "waste".`,
        ]
    },
    {
        version: `1.2.3`,
        date: `12/16/2021`,
        changes: [
            `Expanded Festive Season to include additional species.`,
        ]
    },
    {
        version: `1.2.2`,
        date: `12/15/2021`,
        changes: [
            `Graphene Plants now show on industry tab for True Path.`,
            `Added entry for Festive Season into wiki.`,
            `The game wiki will now load without any game data.`,
        ]
    },
    {
        version: `1.2.1`,
        date: `12/14/2021`,
        changes: [
            `Smelter metals can now be reallocated without unassigning.`,
            `Increased accuracy of syndicate intel data`,
            `Fixed bug with removing Weak & Bad genes when toggling True Path.`,
            `Fixed bug with adding or removing Professors not updating indoctrination value.`,
            `Fixed bug with Planet Wiki entry that prevented some data from loading.`,
            `Added trait rankings to wiki.`,
        ]
    },
    {
        version: `1.2.0`,
        revision: `a`,
        date: `12/12/2021`,
        changes: [
            `Fixed bug with Plasmid Storage.`,
            `Fixed bug with Befuddle trait and Espionage.`,
            `Fixed bug with Composting.`,
            `Updated Solar Map.`,
            `Added setting to enable mobile device support.`,
            `Minor buff to TP Frigate power.`
        ]
    },
    {
        version: `1.2.0`,
        date: `12/12/2021`,
        changes: [
            `Unlock the True Path (Requires completion of Ascension or Demonic Infusion).`,
            `Using Fanaticism to gain an unempowered trait you already possess will now empower that trait.`,
            `Added option to Hell Fortress to prevent using ship crew as reinforcements.`,
            `Shrine Metal bonus now applies to Mining Droid Aluminium production.`,
            `Armored trait now prevents 50% of deaths.`,
            `Cannibalize healing now applies a percent based bonus instead of being equivalent to 3 5% Hospitals.`,
            `GruvBox Dark is now the default theme.`,
            `Added Evolve Adept Perk.`,
            `Themed several additional weapon techs in magic universe for immersion.`,
            `Smoldering and Chilled effects now display as Smoldering or Chilled in production breakdowns instead of Hot/Cold.`,
            `Improved touch device support.`
        ]
    },
    {
        version: `1.1.17`,
        date: `11/28/2021`,
        changes: [
            `Job stress from Civilian Ship Crew is now calculated correctly.`,
            `Things will now show as unaffordable if they require a locked resource.`,
            `Added new entries to Mechanics section of Wiki: Job Stress, Cost Creep, and Warmonger.`,
            `Evolve Novice and Evolve Journeyman perk conditions updated.`
        ]
    },
    {
        version: `1.1.16`,
        date: `10/30/2021`,
        changes: [
            `Ghost #3 can now be captured with Smoldering.`,
            `Ghost #7 can now be captured in Cataclysm mode.`,
            `Updated description of Trick or Treat feat.`,
            `Llamas will no longer harass carnivores, detritivores, and soul eaters by grazing their fields.`
        ]
    },
    {
        version: `1.1.15`,
        date: `10/20/2021`,
        changes: [
            `Added buttons to pause queues.`,
            `Cracked Pylons now correctly add to Mana cap.`,
            `Pillar of Bones will no longer be rolled with the Smoldering trait.`,
            `Fixed bugs with removing Terrifying trait.`,
            `Fixed bug with items in queue blocking the next item when it couldn't be completed due to negative production of a resource.`,
            `The Tax-Morale governor task is now slightly smarter.`
        ]
    },
    {
        version: `1.1.14`,
        revision: `a`,
        date: `9/30/2021`,
        changes: [
            `Fixed Pylon bug with upgraded save games in Magic Cataclysm runs.`,
            `Fixed a Message Log filtering problem where some players might not unlock some options.`
        ]
    },
    {
        version: `1.1.14`,
        date: `9/29/2021`,
        changes: [
            `New settings options for message log filters.`,
            `Added Cracked Pylons for Magic Cataclysm mode.`,
            `Conjuring is no longer researchable in Cataclysm mode.`,
            `Challenges section added to Wiki under Gameplay.`,
            `Smoldering Gnawer will now consume Stone instead of nothing.`
        ]
    },
    {
        version: `1.1.13`,
        date: `9/5/2021`,
        changes: [
            `Expanded Mechanics entries in wiki.`,
            `Fixed some errors in wiki prestige calculators.`,
            `Added a Custom Lab calculator to wiki under species.`
        ]
    },
    {
        version: `1.1.12`,
        date: `8/19/2021`,
        changes: [
            `Training Timer for Military tab.`,
            `Draggable config options for Spy Operator.`,
            `Bug fixes for log and queue windows.`
        ]
    },
    {
        version: `1.1.11`,
        date: `8/12/2021`,
        changes: [
            `ARPA projects now contribute to inflation.`,
            `Mercenaries costs are now affected by inflation.`,
            `Trade is now affected by inflation.`,
            `Casino income is now affected by inflation.`,
            `Luxury Goods income is now affected by inflation.`,
            `Rescaled inflation levels.`,
            `Wheelbarrow achievement now requires $250 billion.`,
            `Inflation bug fixes.`,
            `New message log filters.`,
            `Fixed Luxury Goods tooltip money value.`
        ]
    },
    {
        version: `1.1.10`,
        date: `8/8/2021`,
        changes: [
            `Added Inflation Challenge Mode. Requires Scrooge achievement to unlock.`,
            `Import/Export race feature added to Ascension lab.`,
            `Added merge options for queue.`,
            `Available space in queue is now shown.`,
            `Added Blackhole + Mass Ejector mechanic entry to wiki.`,
            `Fixed some display bugs with Alchemy.`,
            `Fixed bug where Protoplasm could be required by some structures late in hell phase.`
        ]
    },
    {
        version: `1.1.9`,
        date: `7/7/2021`,
        changes: [
            `Firework festival bug fix for cataclysm mode.`,
        ]
    },
    {
        version: `1.1.8`,
        date: `7/3/2021`,
        changes: [
            `Added firework festival event (July 4th - July 8th).`,
            `Added Copper and Iron settings to Mass Ejector Optimizer task.`,
            `Current Quantum Level now shown on Citadel Stations.`,
            `Updated wiki prestige calculators.`,
            `Added a Quantum Level section to wiki.`
        ]
    },
    {
        version: `1.1.7`,
        date: `6/29/2021`,
        changes: [
            `Added a Mass Ejector Optimizer governor task.`,
            `Fixed precision error with Tech Scavengers.`,
            `Prestige calculators added to wiki.`,
            `Progress related event section added to wiki.`,
            `Anti-plasmids gained from MAD in antimatter universe are now correctly calculated.`
        ]
    },
    {
        version: `1.1.6`,
        date: `6/19/2021`,
        changes: [
            `Solstice event is now easier for less seasoned players.`,
            `Wharves are no longer affected by the Nomadic trait.`,
            `Decreased cost of Iron Horseshoes.`
        ]
    },
    {
        version: `1.1.5`,
        date: `6/16/2021`,
        changes: [
            `Support for String Packs.`,
            `Separate research queue behavior option.`,
            `Balorg can now use the governor tax task.`
        ]
    },
    {
        version: `1.1.4`,
        date: `6/11/2021`,
        changes: [
            `Fixed a bug that would sometimes cause mechs to be constructed without weapons.`,
            `Fixed a bug that would cause an open tooltip to change descriptions when a queue item completes.`
        ]
    },
    {
        version: `1.1.3`,
        date: `6/7/2021`,
        changes: [
            `Improvements to tooltip reliability.`,
            `The first Horseshoes can now be constructed out of Lumber if available as a resource.`,
            `Horseshoe pacing updated, see Hooved entry in wiki for expanded information.`
        ]
    },
    {
        version: `1.1.2`,
        date: `6/6/2021`,
        changes: [
            `Added Money Reserve % config value to Slave replacement task.`,
            `Various special buildings are now dropped from the queue if you remove their required trait.`,
            `Spy Operator will no longer attempt espionage against controlled cities.`,
            `Fixed many issues with labels not updating`
        ]
    },
    {
        version: `1.1.1`,
        date: `6/5/2021`,
        changes: [
            `Unifying during banana republic now triggers an automatic backup save.`,
            `Holding a key multiplier with the queue key will now queue mulitple of a building.`,
            `Dealmaker import bonus buffed from 40% to 75%.`,
            `Nerfed Beast trait to 8% hunting / 15% windy hunting / 10% soldier training.`,
            `Restored Cautious trait to Carnivore genus.`,
            `Added Money Reserve % config values to Merc and Spy recruiter tasks.`,
            `Horseshoes can now be queued.`,
            `Adamantite Horseshoes are now much cheaper.`,
            `Changed progression system for Horseshoe costs, will not change to next resource unless it's unlocked.`
        ]
    },
    {
        version: `1.1.0`,
        date: `6/4/2021`,
        changes: [
            `Appoint a Governor to help run the everyday tasks, unlock in the CRISPR lab.`,
            `Animal genus split into 2 new beast genus: Carnivore & Herbivore.`,
            `Carnivore Species: Cath, Wolven, Vulpine.`,
            `Herbivore Species: Centaur, Rhinotaur, Capybara.`,
            //`Omnivore Species: Bearkin, Porkenari, Hedgeoken.`,
            `Cath, Wolven, and Centaur redesigned.`,
            `Spire Mech Combat rebalanced.`,
            `Titan mechs now have 4 weapon slots and an extra equipment slot.`,
            `New Equipment: Jump Jet (All but Heavy & Titan), Battery (Heavy Only), and Targeting Computer (Titan Only).`,
            `New Scavenger mech type`,
            `Reweighted Angelic genus trait costs.`,
            `Major event messages are now shown in a different color from minor ones.`,
            `Decreased frequency of minor events.`,
            `Smoldering no longer applies to a variety of special resources.`,
            `Frenzy renamed to Blood Thirst.`,
            `Madagascar Tree achievement now requires inheriting Blood Thirst instead of Carnivore.`,
            `Expanded Hell section of Wiki`
        ]
    },
    {
        version: `1.0.43`,
        date: `5/18/2021`,
        changes: [
            `Banana Smoothie will no longer unlock for free in alternate universes.`,
            `Added a Spire Floor clear timer for previously beaten monsters.`,
            `Gate Turrets now correctly contribute to demon kills.`
        ]
    },
    {
        version: `1.0.42`,
        date: `5/4/2021`,
        changes: [
            `Minor bug fixes with new events.`
        ]
    },
    {
        version: `1.0.41`,
        date: `5/3/2021`,
        changes: [
            `Added launch day event for May 6th.`,
            `New minor event system.`,
            `The same event can no longer trigger twice in a row.`
        ]
    },
    {
        version: `1.0.40`,
        date: `4/11/2021`,
        changes: [
            `Special event race reskins will now persist after event ends until reset.`,
            `Added a warning to Unification tech if playing Banana Republic scenario.`
        ]
    },
    {
        version: `1.0.39`,
        date: `4/9/2021`,
        changes: [
            `Added challenge win conditions to planet description popover.`
        ]
    },
    {
        version: `1.0.38`,
        date: `4/4/2021`,
        changes: [
            `Fixed a bug that prevented some races from acquiring Egg #3.`
        ]
    },
    {
        version: `1.0.37`,
        date: `4/3/2021`,
        changes: [
            `Fixed a bug with unlocking the Egg Hunt feat.`
        ]
    },
    {
        version: `1.0.36`,
        date: `4/1/2021`,
        changes: [
            `Fool Feat will automatically upgrade to current challenge level for eligible players.`
        ]
    },
    {
        version: `1.0.35`,
        date: `3/31/2021`,
        changes: [
            `Changed Blackhole objective of Banana Republic scenerio from stabilize a blackhole to Expand a blackhole to 12 solar mass without exotic matter.`,
            `Fixed Terrifying trade exploit in Banana Republic scenerio.`
        ]
    },
    {
        version: `1.0.34`,
        date: `3/28/2021`,
        changes: [
            `Added the Banana Republic challenge.`,
            `Tax Riots will no longer cause loss of Artifacts, Blood Stones, and other key resources.`,
            `Cancel all routes option for trade screen.`,
            `Protests no longer apply their penalty twice.`,
            `Minor genetic traits can now be reordered by dragging.`,
            `Max trade routes per resource type are now governed by Large Trade and Massive Trade upgrades.`,
            `Misc minor bug fixes.`
        ]
    },
    {
        version: `1.0.33`,
        date: `3/20/2021`,
        changes: [
            `Enhanced threat assessment for Spire.`,
            `Added a Save as File option for exporting game state.`
        ]
    },
    {
        version: `1.0.32`,
        date: `3/19/2021`,
        changes: [
            `Unemployment Rework.`,
            `Fixed reactivity of some tooltips.`,
            `Fixed cut off tooltips on settings tab.`,
            `Xeno Tourism now requires 10 Monuments and Tourism.`
        ]
    },
    {
        version: `1.0.31`,
        date: `3/15/2021`,
        changes: [
            `Alien 1 system is now named after their homeworld.`,
            `Alien 2 system is now named after their red planet.`,
            `Fixed various cut off tooltips.`
        ]
    },
    {
        version: `1.0.30`,
        date: `3/4/2021`,
        changes: [
            `Wharves once again now grant the correct number of trade routes.`,
            `Fixed errors with Casino vault size.`,
            `Sacrificed Citizens stat for Mantis players.`,
            `Factory production can be assigned without first removing it from Alloy production.`
        ]
    },
    {
        version: `1.0.29`,
        date: `2/25/2021`,
        changes: [
            `Evolved species will no longer be stuck in the queue after evolution.`,
            `Fixed potential viewport scrolling issues with Settings and Evolution tabs.`,
            `Added a warning for users running Evolve in multiple tabs.`,
            `The game will now remind players to backup their game data once every 100,000 game days.`
        ]
    },
    {
        version: `1.0.28`,
        date: `2/21/2021`,
        changes: [
            `Queue can now be used during evolution stage if unlocked with CRISPR tech.`,
            `Fixed incorrect Scarletite costs with Wasteful trait.`,
            `Graphene Plants now default to Oil with Smoldering.`,
            `Fixed many string errors.`
        ]
    },
    {
        version: `1.0.27`,
        date: `2/11/2021`,
        changes: [
            `Added Trade Federation achievement.`,
            `Added Mastery section to perks page.`,
            `Fixed aria label of jobs.`,
            `Squished achievement will now unlock from Blackhole or Demonic Infusion.`
        ]
    },
    {
        version: `1.0.26`,
        date: `1/30/2021`,
        changes: [
            `Enhanced crafted material popovers.`,
            `Universe filters for wiki achievements page.`,
            `Cheese Guide.`
        ]
    },
    {
        version: `1.0.25`,
        date: `1/23/2021`,
        changes: [
            `Added Piracy section to Wiki under Gameplay-Mechanics.`,
            `Numerous minor bug fixes.`
        ]
    },
    {
        version: `1.0.24`,
        date: `1/17/2021`,
        changes: [
            `Evil Smoldering races can now research bone tools.`
        ]
    },
    {
        version: `1.0.23`,
        date: `1/16/2021`,
        changes: [
            `Redesigned Heat based Genus mechanics.`,
            `Untapped Potential formula changed: now has diminishing returns for stacking unspent genes.`,
            `Faith now has an effect on auto crafting (Craftsmen Only).`,
            `Added new topics to Mechanics section of Wiki.`,
            `Minor bug fixes.`
        ]
    },
    {
        version: `1.0.22`,
        date: `1/15/2021`,
        changes: [
            `Fixed Cataclysm mode game start.`
        ]
    },
    {
        version: `1.0.21`,
        date: `1/10/2021`,
        changes: [
            `Gain upto 8 hours of accelerated time when game is stopped/closed.`,
            `Optimized tab content loading for performance.`,
            `Pause game feature.`,
        ]
    },
    {
        version: `1.0.20`,
        date: `12/29/2020`,
        changes: [
            `Fixed issue with keyup event not releasing multiplier keys.`
        ]
    },
    {
        version: `1.0.19`,
        date: `12/28/2020`,
        changes: [
            `Studious now improves library knowledge by 10%.`,
            `Merchant now increases the amount of resources gained from trading by 10%.`,
            `Tracker raised from 10% to 20%.`,
            `Resourceful raised from 10% to 12%.`,
            `Claws raised from 20% to 25%.`,
            `Apex Predator combat bonus raised from 25% to 30%.`,
            `Forge Geothermal power boost raised from +1MW to +2MW.`,
            `Beast trait now boosts Hunting by 10% or 20% when windy and improves soldier training time by 20%.`,
            `Beast gene point cost changed from 2 to 3 points.`,
            `Top level tab quick selection key bindings (default 1-7).`
        ]
    },
    {
        version: `1.0.18`,
        date: `12/24/2020`,
        changes: [
            `Fixed issue with species costs on some techs requiring protoplasm without a reload.`
        ]
    },
    {
        version: `1.0.17`,
        date: `12/19/2020`,
        changes: [
            `Larger font size modes.`,
            `Added descriptions for city sectors.`,
            `Last 3 event messages will now be preserved on reload.`,
            `Fixed Evolution bugs with Unbound Infusion active.`,
            `Improved timer accuracy of stacked queue items when No Queue Order is used.`
        ]
    },
    {
        version: `1.0.16`,
        date: `12/16/2020`,
        changes: [
            `Dark Bomb: Kill and Reset the Demon Lord's accumulated strength using the new Dark Bomb.`,
            `Bonus Artifacts can now be earned during Demonic Infusion if Spire floor 50 or 100 are cleared.`,
            `Renamed the tech upgrade Purify to Enhanced Air Filters in order to prevent confusion with the Blood Infusion Purify.`
        ]
    },
    {
        version: `1.0.15`,
        date: `12/12/2020`,
        changes: [
            `Redesigned Inferno Reactor, output is now tied to Infernal Forge.`,
            `Steel can once again be discovered by Ambush attacks.`,
            `Power Grid is now shown in Cataclysm.`,
            `Cataclysm reset no longer incorrectly grants Rapid Mutation or Ancient Ruins.`,
            `Many minor bug fixes.`
        ]
    },
    {
        version: `1.0.14`,
        date: `12/8/2020`,
        changes: [
            `Vacuum Collapse no longer removes all charges of Corrupted bonus.`,
            `Vacuum Collapse now correctly increases Dark Energy earned on the stats page.`,
            `Lumber Ritual is no longer displayed to Evil races.`,
            `Multiplier keys now work when hiring mercenaries.`
        ]
    },
    {
        version: `1.0.13`,
        date: `12/4/2020`,
        changes: [
            `Power Grid now correctly unlocks when gaining Electricity from Infiltrator trait.`,
            `Feats Garbage Pie and Finish Line can now be unlocked by Demonic Infusion.`
        ]
    },
    {
        version: `1.0.12`,
        date: `12/4/2020`,
        changes: [
            `MechBay tab improvements.`,
            `Mechlist can now be reordered by dragging.`,
            `Power Grid can now control On/Off state.`,
            `Support type structures can now be controlled by the power grid.`
        ]
    },
    {
        version: `1.0.11`,
        date: `12/2/2020`,
        changes: [
            `Fixed a memory leak.`,
            `Minor adjustments to GruvBox Dark theme.`,
            `Cheesy Goodness.`
        ]
    },
    {
        version: `1.0.10`,
        date: `12/1/2020`,
        changes: [
            `Ascended buff now persists after Demonic Infusion.`,
            `New Themes: GruvBox Light, GruvBox Dark, and Orange Soda.`
        ]
    },
    {
        version: `1.0.9`,
        date: `11/29/2020`,
        changes: [
            `Perks separated on to a separate tab under Stats.`,
            `Added Perks section to Wiki.`
        ]
    },
    {
        version: `1.0.8`,
        date: `11/28/2020`,
        changes: [
            `Base Neutronium cost of Inferno Reactor lowered to 3,750,000.`,
            `Fixed Valdi genus traits after evolution.`,
            `Prepared rank 2 now correctly applies when building mechs.`,
            `Power Grid is now more strict in checking what is available.`,
            `Fixed bug that sometimes caused crafting to use a wrong Mastery value.`
        ]
    },
    {
        version: `1.0.7`,
        date: `11/25/2020`,
        changes: [
            `Fixed a bug where Technocracy prevented Alien 2 & Chthonian invasions from working.`
        ]
    },
    {
        version: `1.0.6`,
        date: `11/24/2020`,
        changes: [
            `Fixed Mechlab quick switch button.`,
            `Titan class mech power increased by 12.5%.`
        ]
    },
    {
        version: `1.0.5`,
        date: `11/22/2020`,
        changes: [
            `Adjustable Power Grid`,
            `Light Theme bug fixes.`
        ]
    },
    {
        version: `1.0.4`,
        date: `11/21/2020`,
        changes: [
            `Gains from Alchemy are now higher.`,
            `Any mixed fleet can now invade the Alien 2 and Chthonian systems as long as the invasion force is strong enough.`,
            `Alien 2 Invasion requires minimum of 400 fleet rating and at least 650 to take no losses.`,
            `Chthonian Invasion requires a minimum 1250 fleet rating, 2500 for average losses, and 4500 for minimum losses.`
        ]
    },
    {
        version: `1.0.3`,
        date: `11/15/2020`,
        changes: [
            `Fixed compost heap values.`,
            `Added combat section to the wiki under gameplay.`,
            `Added Equilibrium feat for pillaring every species.`,
            `The Misery feat can now be earned from Demonic Infusion.`
        ]
    },
    {
        version: `1.0.2`,
        date: `11/10/2020`,
        changes: [
            `Valdi now take your chosen Genus instead of humanoid.`,
            `Wrath Blood Infusion now properly applies to all Mech fights.`,
            `Artifacts can now be spent properly on the CRISPR tab.`,
            `Crystal trade prices adjusted.`,
            `Megalith base price reduced from 100k to 55k.`,
            `Many minor bug fixes.`
        ]
    },
    {
        version: `1.0.1`,
        date: `11/08/2020`,
        changes: [
            `Fixed display bug with CRISPR costs and Technocracy.`,
            `Fixed issue with some Windmills not producing power.`,
            `The Resort now properly formats its vault size.`
        ]
    },
    {
        version: `1.0.0`,
        date: `11/07/2020`,
        changes: [
            `Expanded Interdimensional content, delve deep into the hell dimension.`,
            `New Magic Universe.`,
            `Fling asteroids into the blackhole with the Asteroid Redirect ARPA project.`,
            `The same monument type will no longer be chosen twice in a row.`,
            `Evil races can now construct a Pillar of Bones monument type.`,
            `Democracy now only affects Entertainers.`,
            `Some government bonuses now scale with tech era.`,
            `Races with Detritivore can now build Windmills.`,
            `Base Aluminium income for plant based species is now roughly 10% higher.`,
            `Beast of Burden now grants an extra loot roll instead of a 10% boost.`,
            `Revamped combat loot formulas.`,
            `Build queue resource highlighting.`,
            `Low Contrast Dark Night Theme.`,
            `Ewnay igpay atinlay anguagelay.`
        ]
    },
    {
        version: `0.9.24`,
        date: `11/1/2020`,
        changes: [
            `Holiday icons from feats earned with no stars can now be accessed.`,
            `Challenge feat icons still require at least 1 star.`,
        ]
    },
    {
        version: `0.9.23`,
        date: `10/30/2020`,
        changes: [
            `New settings option for people who hate fun.`,
            `Added ability for an obscure combination of settings and racial traits to get Ghost #3`
        ]
    },
    {
        version: `0.9.22`,
        date: `10/28/2020`,
        changes: [
            `Halloween cosmetic effects will now run for the duration of the Trick or Treat event instead of just on Halloween.`,
            `Ents, Dryads, and Salamanders can now find all the Ghosts.`,
            `A certain Ghost is now easier to obtain in Cataclysm.`,
            `Accessibility improvements for the event.`
        ]
    },
    {
        version: `0.9.21`,
        date: `10/27/2020`,
        changes: [
            `Trick or Treat Event, runs from 10/28 - 11/4.`,
        ]
    },
    {
        version: `0.9.20`,
        date: `10/16/2020`,
        changes: [
            `Fixed bug with the holy trait that improperly applied its bonus.`
        ]
    },
    {
        version: `0.9.19`,
        date: `9/1/2020`,
        changes: [
            `Swarm Control AI now provides a base increase of +2 before unlocking Quantum Computing.`,
            `Fixed bugs with manual crafting popover.`,
            `Fixed bug that stopped DNA & RNA generation during evolution if the Cataclysm scenario was toggled on.`
        ]
    },
    {
        version: `0.9.18`,
        date: `8/28/2020`,
        changes: [
            `ARPA Queue timer fixes.`,
            `Swarm Control AI upgrade now make Control Stations scale with Quantum level.`
        ]
    },
    {
        version: `0.9.17`,
        date: `8/22/2020`,
        changes: [
            `Fixed bug that prevented Cataclysm Ascension from completing.`,
            `Rank 1 sacrifice is slightly less effective`,
            `Rank 3 sacrifice is significantly more effective`,
            `New Research is now shown by Era.`
        ]
    },
    {
        version: `0.9.16`,
        date: `8/12/2020`,
        changes: [
            `Bug Fixes by Beorseder:`,
            `Fixed issue where Exotic Materials Lab and Fortifications would clear current queue.`,
            `Fixed Scavengers not working during Cataclysm.`,
            `Fixed display bug with Galactic Exchange during Cataclysm.`,
            `Genomic Mutations no longer give the wrong number of Genes without Synthesis upgrades.`,
            `Genomic Mutations now tell how many Plasmids/Antiplasmids are gained from them.`,
            `Techs now display their requirements on the wiki.`
        ]
    },
    {
        version: `0.9.15`,
        date: `8/10/2020`,
        changes: [
            `Tax revolts can no longer destroy Soul Gems.`,
            `If you lose your sample of Elerium before researching Elerium Mining it will now be replaced.`
        ]
    },
    {
        version: `0.9.14`,
        date: `8/9/2020`,
        changes: [
            `Angelic races now have an innate bonus vs demonic creatures.`,
            `Enhanced Muscle Fibers added to perks page.`,
            `Genome sequencing will now be off by default in Cataclysm.`,
            `Reorganized achievements page in Wiki.`
        ]
    },
    {
        version: `0.9.13`,
        date: `8/6/2020`,
        changes: [
            `Special resource descriptions now update.`
        ]
    },
    {
        version: `0.9.12`,
        date: `8/3/2020`,
        changes: [
            `Added Crossed the Finish Line feat for Ascending with Cataclysm.`,
            `Adjusted many post World Collider Cataclysm things that referenced none existent planetary structures.`,
            `Added a fix for Stabilize Blackhole being stuck in an untriggerable state.`,
            `Upgrading achievements will now send a notification.`
        ]
    },
    {
        version: `0.9.11`,
        date: `8/1/2020`,
        changes: [
            `Fixed a bug that caused Factories to charge the wrong amount of Polymer for producing Synthetic Furs.`
        ]
    },
    {
        version: `0.9.10`,
        date: `7/30/2020`,
        changes: [
            `Expanded list of potential enemy city names.`,
            `Added Synthetic Fur option to Factories.`,
            `Restoring a backup after a Cataclysm will now allow you to Cataclysm again.`,
            `Fixed Lumber penalty on Desert worlds.`,
            `Many minor bug fixes.`
        ]
    },
    {
        version: `0.9.9`,
        date: `7/21/2020`,
        changes: [
            `Added Devotion upgrade to ancients CRISPR line between Faith and Acolyte. The total cost is the same, it's just spread out more.`,
            `Players with Ancients 4 are granted Ancients 5 automatically, those with Ancients 3 are refunded 300 Plasmids.`,
            `Added Enhanced Muscle Fiber CRISPR upgrade.`,
            `High tax morale penalty under Oligarchy is now reduced.`,
            `Fixed bugs with Blackhole reset and restoring backups.`,
            `Fixed bug with adjusting taxes as a Noble race that would set it to the max.`
        ]
    },
    {
        version: `0.9.8`,
        date: `7/18/2020`,
        changes: [
            `Czech translation by Mousesama`,
            `The slaves have staged a successful hunger strike to demand better living conditions, as a result slave pens can now only hold 4 slaves each.`,
            `Autocracy and Frenzy no longer block Immoral races from gaining a Warmonger bonus.`,
            `Geology traits now display under planet information.`,
            `Popovers added to building and research queues.`
        ]
    },
    {
        version: `0.9.7`,
        date: `7/13/2020`,
        changes: [
            `Seasons no longer exist in Cataclysm mode.`,
            `It is no longer Sunny in Cataclysm mode.`,
            `Parasites are no longer unable to grow population in Cataclysm mode, but they do take a growth penalty.`,
            `Base Sawmill effect is now separated from lumberjack in production breakdown.`
        ]
    },
    {
        version: `0.9.6`,
        date: `7/10/2020`,
        changes: [
            `Fixed bug with Infiltrator not unlocking Nanoweave.`,
            `Fixed bug with Railways not adding traderoutes correctly in Cataclysm mode.`
        ]
    },
    {
        version: `0.9.5`,
        date: `7/6/2020`,
        changes: [
            `Fixed a bug that occurred when combining the Terrifying trait with the gold star Iron Will perk.`
        ]
    },
    {
        version: `0.9.4`,
        date: `7/3/2020`,
        changes: [
            `Failed History perk raised from +1 Geothermal to +2 Geothermal energy.`,
            `Fixed Oligarchy tax riot immunity between 36%-45%.`,
            `Infiltrator can now steal Graphene Processing, Nanoweave, and Orichalcum Analysis techs.`
        ]
    },
    {
        version: `0.9.3`,
        date: `7/1/2020`,
        changes: [
            `Increased base number of Plasmids earned in Cataclysm mode.`
        ]
    },
    {
        version: `0.9.2`,
        date: `6/30/2020`,
        changes: [
            `Added Restore Backup option, restores game to just before your last prestige reset.`,
            `Extended Recombination CRISPR line.`,
            `When gaining a random minor trait from Fanaticism, you will now gain 5 ranks of it.`
        ]
    },
    {
        version: `0.9.1`,
        date: `6/21/2020`,
        changes: [
            `Fixed Dyson Net.`
        ]
    },
    {
        version: `0.9.0`,
        date: `6/21/2020`,
        changes: [
            `Added Scenarios Section to Evolution Challenges.`,
            `Added Cataclysm Scenario for those who value science over caution.`,
            `Genetic Dead End is now classified as a Scenario.`,
            `Plant genus redesign. Photosynth trait replaced with Sappy.`,
            `Added 3rd race option for Plant genus: Pinguicula.`,
            `Dyson Net now provides partial power as it is constructed.`,
            `Added Orichalcum upgrade for Dyson Sphere.`,
            `Added Xeno Tourism upgrade.`,
            `Added Fertility Clinic upgrade for Hospitals.`,
            `Added OTB, Online Gambling, & Bolognium Vault upgrade for Casinos.`,
            `Added Scrooge achievement.`,
            `Added Soul Link upgrade for Soul Forge/Soul Attractors.`,
            `Reduced Bolognium cost of Freighters & Corvette Ships.`,
            `Increased rating of Corvette Ships to 30.`,
            `Piracy will no longer start until after you construct the Embassy.`,
            `Reduced power requirement of Soul Forge and Soul Attractor.`,
            `Gun Emplacements and Soul Attractors are now more potent.`,
            `Reduced requirement of Demon Slayer feat to 666 Million demon kills.`
        ]
    },
    {
        version: `0.8.17`,
        date: `5/30/2020`,
        changes: [
            `Added 3rd race option for Fungus genus: Moldling.`,
            `Fungi genus Spore trait replaced with Detritivore.`,
            `Casinos now start powered and generated money immediately.`,
            `Extreme Dazzle upgrade now boosts Casino income by 50%.`,
            `Reduced power requirement of Casino by 1.`,
            `Casino Max Morale boost no longer works unless casino is powered.`,
            `Occupation will now unlock Federation research.`,
            `Added Double Density achievement in heavyverse.`,
            `Stoned penalty on mellow planets raised to 10%.`,
            `Unemployed citizens on mellow planets no longer generate any stress (note: hunters are NOT unemployed).`,
            `Life on mellow planets is now overall less stressful.`,
            `Slaver trait rating raised to 12.`,
            `Barracks can now be switched off.`,
            `Space Stations will now automatically staff Space Miners from the default job when constructed.`,
            `Factories now default to producing Alloy instead of Nothing.`
        ]
    },
    {
        version: `0.8.16`,
        date: `5/8/2020`,
        changes: [
            `Oceanic biome now applies a 6% bonus to Titanium from Steel smelting.`,
            `Oceanic biome now applies a 12% bonus to Titanium from Iron smelting.`,
            `Oceanic biome now applies a 5% penalty to Fur generation.`,
            `Tundra biome now applies a 25% bonus to Fur generation.`,
            `Tundra biome now applies a 10% penalty to Oil generation.`,
            `New planetary modifiers: Elliptical, Flare, Dense, and Unstable.`,
            `Oligarchy tax riot immunity raised from 35% to 45%.`,
        ]
    },
    {
        version: `0.8.15`,
        date: `5/2/2020`,
        changes: [
            `Grassland biome Food bonus raised to 20%.`,
            `Forest biome Lumber bonus raised to 15%.`,
            `Desert biome now applies a 25% Lumber penalty.`,
            `Desert biome now gives a 20% stone bonus and a 10% Oil bonus.`,
            `Volcanic biome now applies a 10% Food penalty.`,
            `Volcanic biome now gives an 8% Iron and 12% Copper bonus.`,
            `Added partial Korean translation.`,
            `Achievements in the wiki are now sorted Alphabetically.`,
            `Some achievements now show completion progress in the wiki.`,
        ]
    },
    {
        version: `0.8.14`,
        date: `4/30/2020`,
        changes: [
            `Post unification Federation now gives a 32% bonus (raised from 30%).`,
            `Federation now increases morale by 10%.`,
            `Socialist factory bonus is now 10% (raised from 5%).`,
            `Socialist crafting bonus is now 35% (raised from 25%).`,
            `Corpocracy factory bonus is now 30% (raised from 20%).`,
            `Corpocracy factory bonus now applies to Cement, Graphene, and Vitreloy.`,
            `Republic now increases morale by 20%.`,
            `Oligarchy tax revenue penalty is now 5% (lowered from 10%).`,
            `Oligarchy can now set taxes 20% higher then other governments (raised from 10%).`,
            `Technocracy now adds a 10% Knowledge gain bonus.`,
            `Autocracy governments are now immune to the warmonger penalty.`,
            `Priests now apply a bonus to Ziggurats under Theocracy.`,
            `Fixed display of Theocracy effect on temples. This gives a 12% bonus but was only displaying as a 5% increase.`,
            `Noble Oligarchy can now set their taxes as high as 40%.`,
        ]
    },
    {
        version: `0.8.13`,
        date: `4/29/2020`,
        changes: [
            `New research is now sorted by knowledge cost.`,
            `Added popover descriptions for prestige resources.`,
            `Harmony Crystals now boost standard Dark Energy by 0.1% instead of 0.01%.`,
            `Lots of minor bug fixes.`,
        ]
    },
    {
        version: `0.8.12`,
        date: `4/24/2020`,
        changes: [
            `Farming has been redesigned. Farms no longer directly generate food, Farmers now generate food in combination with Farms.`,
            `Added Energizer Feat for ascending without building any Thermal Collectors.`,
            `Bad traits no longer count for Ascension Species Creator complexity.`,
            `Dreaded Achievement will now unlock if you never researched dreadnoughts.`,
            `Fixed issue with some feats spamming the log due to micro achievements.`,
            `Fixed base training rate of soldiers.`,
            `Fixed bug with diverse trait that made it do the opposite of what it was suppose to do.`,
            `Adjusted color of "purple" text on Night theme.`,
            `Kilowatts are now Megawatts.`,
        ]
    },
    {
        version: `0.8.11`,
        date: `4/16/2020`,
        changes: [
            `Ascension reset no longer offers planet choices, instead your next race is created on the old planet with bonuses added to that planet.`,
            `Ascended planets now gain +2% to all geology deposits, +5% production, +10% storage, and +2 Sundial base Knowledge gain.`,
            `Unspent gene points in the Ascension Lab will be converted into Untapped Potential.`,
            `Ascension lab now has a complexity gene tax for adding more then 4 traits.`,
            `Technophobe perk now applies an additional bonus to custom race complexity.`,
            `Paranoid and Hoarder can now be combined.`,
            `Over capped slaves will now be released.`,
        ]
    },
    {
        version: `0.8.10`,
        date: `4/13/2020`,
        changes: [
            `Added EM (Electromagnetic) Field Challenge.`,
        ]
    },
    {
        version: `0.8.9`,
        date: `4/12/2020`,
        changes: [
            `Added a Feat for finding all the Eggs.`,
            `Current egg count can now be checked in the Wiki.`,
        ]
    },
    {
        version: `0.8.8`,
        date: `4/12/2020`,
        changes: [
            `Easter Event Activated`,
            `Event ends 10 days after the start of Easter.`,
        ]
    },
    {
        version: `0.8.7`,
        date: `4/11/2020`,
        changes: [
            `Fixed Pathetic trait.`,
        ]
    },
    {
        version: `0.8.6`,
        date: `4/11/2020`,
        changes: [
            `Fixed Brute trait.`,
            `Added section for Achievements and Feats to Wiki.`,
        ]
    },
    {
        version: `0.8.5`,
        date: `4/11/2020`,
        changes: [
            `Added New Work in Progress Game Wiki`,
            `Sentience is now more likely to grant a species where the extinction achievement has not yet been earned.`,
            `Sentience can now include custom races.`,
            `Incorporeal Existence research now costs Phage instead of Plasmids.`,
            `Ascension research now Plasmids instead of Phage.`,
            `The change log is now part of the Wiki.`,
        ]
    },
    {
        version: `0.8.4`,
        date: `4/4/2020`,
        changes: [
            `Fixed breaking bug with Rigid trait.`,
        ]
    },
    {
        version: `0.8.3`,
        date: `4/3/2020`,
        changes: [
            `Federation now reduces the soldier requirement of occupied cities by 5.`,
            `Fixed incorrect Industrious string.`,
        ]
    },
    {
        version: `0.8.2`,
        date: `3/30/2020`,
        changes: [
            `Piracy in the Gateway and Stargate regions ramp up more slowly as you explore Andromeda.`,
            `Fixed formatting of multiline Crafting Tooltip cost display.`,
            `Fixed incorrect string used by completed Dyson Sphere.`,
        ]
    },
    {
        version: `0.8.1`,
        date: `3/29/2020`,
        changes: [
            `Piracy now slowly takes effect in the Gateway System and Stargate region over 1000 days after piracy begins.`,
            `Purchasing Negotiator and levels of Persuasive will now update the regular Market as well as the Galactic Market.`,
            `Added new CRISPR upgrade effects from the Challenge, Ancients, and Trader trees to the perks list.`,
            `Queued Monuments will update their name in the queue when a Monument is constructed.`,
            `Fixed bug where ARPA projects at the end of the Queue while No Queue Order was active would cause No Queue Order to not work as intended.`,
            `The name of the trait gained from a Mutation in the message is now localized.`,
            `Adding Apex Predator will remove currently obtained Armor techs.`,
            `Annexed/Purchased powers will now have a respective " - Annexed"/" - Purchased" tag next to their name, like Occupied powers do.`,
            `Blackhole reset gives its proper reward again.`,
            `The amount of Gene/Phage levels of Minor Traits purchased is now affected by Multiplier Keys.`,
            `The amount of Ships moved from one area to another is now affected by Multiplier Keys.`,
            `Manual Crafting button tooltips are more informational.`,
            `Constructing the first Foundry of a game will log a message briefly explaining what Crafted Resources are and the ways to make them.`,
            `Informative messages (mission results, messages that explain newly unlocked mechanics, the Launch Facility message that informs the player of the space tab, etc.) are now displayed in blue, to separate them from less important messages.`,
            `Added the missing Wormhole Mission result string.`,
        ]
    },
    {
        version: `0.8.0`,
        date: `3/27/2020`,
        changes: [
            `Intergalactic Content.`,
            `Universe Mastery Rework.`,
            `-Each Universe now tracks its own mastery level responsible for 40% of the mastery bonus, the remaining 60% comes from the general mastery level.`,
            `-Standard Universe mastery rules remains unchanged.`,
            `Micro icons can now be earned for none Micro achievements. These will not count for standard mastery, only Micro mastery.`,
            `Unification 3.0, the unification system has been reworked.`,
            `Federation Government type.`,
            `New Faith CRISPR line of upgrades, unlocks priest job.`,
            `Universal, Standard and Mastered CRISPR Upgrades, for masters of the universes.`,
            `Added Negotiator CRISPR upgrade.`,
            `Added Persuasive Minor Gene.`,
            `Extended the Deify and Study Ancients tech trees.`,
            `Enhanced Droids upgrade for War Droids.`,
            `Repair Droids for Fortress.`,
            `Smoldering and Chilled now have reduced effectiveness after 100 stacks.`,
            `Removed Heavy Genus Feats, these were redundant with Universe Icons.`,
            `Blackhole reset now also grants species level extinction achievement.`,
            `Power cost of Mass Ejector increased to 3kW.`,
            `Genetics lab custom mutation costs rescaled to static values depending on the genetic trait.`,
            `Colonists will now be automatically assigned when a Living Quarter is completed if the default job has any available citizens.`,
            `Biodome redesigned, produces less food but increases living quarter capacity for Citizens.`,
            `More robust research categories.`,
            `Various racial traits now apply to ARPA projects.`,
            `Human Creative trait rescaled.`,
            `Large cost creep penalty reduced to 0.005 from 0.01.`,
            `Strong gathering bonus increased from 2 to 5.`,
            `Compact lowered from -0.02 to -0.015.`,
        ]
    },
    {
        version: `0.7.28`,
        date: `3/16/2020`,
        changes: [
            `Antimatter Universe now gives a 10% prestige bonus post MAD.`,
            `St. Patrick's Day event.`,
            `Blood War can no longer be earned by none demonic evil races.`,
            `Build Crate/Container buttons now update create/container values when upgraded by research.`,
        ]
    },
    {
        version: `0.7.27`,
        date: `3/10/2020`,
        changes: [
            `Memory leak fixes.`,
        ]
    },
    {
        version: `0.7.26`,
        date: `3/5/2020`,
        changes: [
            `Any race where the associated extinction achievement has been unlocked is now always available during evolution.`,
            `Joyless perk changed to +2% Max Morale per star level.`,
            `The effects of the Mass Extinction and Creator perks have been swapped.`,
            `Creator perk (old mass extinction) changed to 1.5x / 2x / 2.5x / 3x / 3.5x genes gained on mutation.`,
            `Minor traits bought with Phage now count twice when you complete evolution.`,
        ]
    },
    {
        version: `0.7.25`,
        date: `2/26/2020`,
        changes: [
            `Unicorn Shrine bonus is now determined by the moon phase when constructed.`,
            `Shrine Knowledge bonus now applies an additional affect to universities.`,
            `Smelters in Evil universe when using Kindling Kindred default to Flesh instead of Coal.`,
            `Evil Wendigo Smelters correctly display that they use 1 Flesh/s instead of 3 Souls/s. Also fixed the bug where they end up using 3 Flesh/s instead of 1.`,
            `Fixed bug where the Evil Wendigo Reclaimer description would show the Lumberjack description.`,
            `If Containers have not yet been unlocked as a resource, getting a Wharf will unlock it.`,
            `Fixed bug where, if Freight Trains was gotten after ARPA, the Railway project would need a refresh to appear.`,
        ]
    },
    {
        version: `0.7.24`,
        date: `2/12/2020`,
        changes: [
            `Special Prestige icons awarded to players from certain feats can now be set to replace the standard Star icon.`,
        ]
    },
    {
        version: `0.7.23`,
        date: `2/11/2020`,
        changes: [
            `Steelen Challenge now requires Bioseed as its win condition.`,
            `Added Feat for Blackhole reset with Steelen Challenge.`,
            `Added V-Day Event stuff.`,
        ]
    },
    {
        version: `0.7.22`,
        date: `2/9/2020`,
        changes: [
            `Steelen Challenge.`,
            `Graveyards are now removed upon gaining Kindling Kindred.`,
            `If Default job is set to Farmer/Lumberjack for Carnivore/Kindling Kindred, it will be changed to Unemployed upon adding those traits.`,
            `Fixed bug where gaining Carnivore and having no Grain Mills would make Smokehouses unpurchasable until refresh.`,
            `Cargo Yard now requires the construction of a Transfer Station to be unlocked.`,
            `Mitosis/Metaphase effect now appears on perks list.`,
        ]
    },
    {
        version: `0.7.21`,
        date: `1/28/2020`,
        changes: [
            `More bug fixes.`,
        ]
    },
    {
        version: `0.7.20`,
        date: `1/20/2020`,
        changes: [
            `Bug Fixes by Beorseder.`,
            `Fixed bug where purchasing Multicellular would double DNA generation from Nuclei instead of Bilateral Symmetry/Poikilohydric/Spores.`,
            `New population from the Infectious trait now go into the set Default job, instead of always Unemployed.`,
            `Controlled Mutation will no longer offer conflicting traits.`,
        ]
    },
    {
        version: `0.7.19`,
        date: `1/14/2020`,
        changes: [
            `Bug Fixes.`,
        ]
    },
    {
        version: `0.7.18`,
        date: `1/12/2020`,
        changes: [
            `Theocracy temple bonus raised from 5% to 12%.`,
            `Technocracy knowledge discount raised from 5% to 8%.`,
            `Corpocracy Casino Bonus raised from +100% to +200%.`,
            `Corpocracy Luxury Good Bonus raised from +50% to +150%.`,
            `Corpocracy Tourism Bonus raised from +50% to +100%.`,
            `Corpocracy morale penalty lowered from -15% to -10%.`,
            `Corpocracy Manufacturing Bonus raised from +15% to +20%.`,
            `Miner's Dream now scales the information that is revealed depending on the star level of the achievement.`,
            `Slaves now appear as a resource.`,
            `Alternate universes now award icons for complex achievements.`,
        ]
    },
    {
        version: `0.7.17`,
        date: `1/9/2020`,
        changes: [
            `Fixed an issue with displaying foreign powers in civics tab on unlock.`,
        ]
    },
    {
        version: `0.7.16`,
        date: `1/8/2020`,
        changes: [
            `Exploration Missions can be queued again.`,
            `The game will now notify the user if the current version is out of date.`,
            `Changes by Beorseder.`,
            `Geology deposit aesthetic changes on planet selection.`,
            `Miner's Dream Achievement & Perk.`,
        ]
    },
    {
        version: `0.7.15`,
        date: `1/7/2020`,
        changes: [
            `Queueing the World Collider will no longer lag the game.`,
            `Multi-segment projects will now have extra segments cleared from the queue on completion.`,
            `Spy and Government related popovers that would sometimes get stuck open will now clear.`,
            `Queued projects that will not complete due to lack of production will now display a green [Never] instead of -1 second timer.`,
            `Multi-segment projects no longer block queueing ARPA projects unless they consumed the entire queue space.`,
        ]
    },
    {
        version: `0.7.14`,
        date: `12/31/2019`,
        changes: [
            `Research Categorization option by Naryl.`,
        ]
    },
    {
        version: `0.7.13`,
        date: `12/30/2019`,
        changes: [
            `Gene decay will no longer result in a negative plasmid count.`,
            `Gene fortification is slightly more effective.`,
        ]
    },
    {
        version: `0.7.12`,
        date: `12/19/2019`,
        changes: [
            `Gene Fortification.`,
            `Fixed Cultural Supremacy popover.`,
        ]
    },
    {
        version: `0.7.11`,
        date: `12/15/2019`,
        changes: [
            `Decaying resources will now use a warning color if you are losing that resource but at a slower rate then the decay rate.`,
            `The most bottlenecked resource will now display in red while other trouble resources will be marked with an alert color.`,
            `CRISPR upgrades are now darkened when unaffordable.`,
            `Transfer Station now lists its uranium storage.`,
            `Wendigo bug fixes.`,
        ]
    },
    {
        version: `0.7.10`,
        date: `12/12/2019`,
        changes: [
            `Craftsman now continuously output product instead of once/twice a month.`,
            `Cumulative achievements now check for lower tier unlocks.`,
        ]
    },
    {
        version: `0.7.9`,
        date: `12/7/2019`,
        changes: [
            `Many bug fixes.`,
        ]
    },
    {
        version: `0.7.8`,
        date: `12/6/2019`,
        changes: [
            `The default job can now be set to: Unemployed, Farmer, Lumberjack, Quarry Worker, or Scavenger.`,
            `New line of feats for achievement hunting.`,
            `Novice Perk.`,
            `Journeyman Perk.`,
        ]
    },
    {
        version: `0.7.7`,
        date: `12/5/2019`,
        changes: [
            `Super projects now queue in larger batches.`,
            `Super projects now only report completion by the queue if actually complete instead of for each segment constructed.`,
        ]
    },
    {
        version: `0.7.6`,
        date: `12/2/2019`,
        changes: [
            `Adjacent queue items of the same type will now combine.`,
            `Architect now doubles queue sizes instead of adding a flat +2.`,
            `Misc minor bug fixes.`,
        ]
    },
    {
        version: `0.7.5`,
        date: `11/28/2019`,
        changes: [
            `Queueing 2x or more of the same building in a row will now stack them in the queue.`,
            `Queue timer now adjusts for cost creep.`,
            `ARPA Projects can now be queued.`,
            `Fixed a bug that could break the game when Yeti or Wendigo unlocked the genetics lab.`,
        ]
    },
    {
        version: `0.7.4`,
        date: `11/27/2019`,
        changes: [
            `Wendigo can now build hunting lodges.`,
            `Trade route prices are now tracked to 1 decimal.`,
            `Elusive spies will no longer be killed when they fail a mission.`,
            `Disruptor Rifles now require researching Quantum Entanglement.`,
        ]
    },
    {
        version: `0.7.3`,
        date: `11/26/2019`,
        changes: [
            `Night Theme trade volume control made more night theme friendly.`,
            `Contrast improvements for Night and R/G Theme.`,
        ]
    },
    {
        version: `0.7.2`,
        date: `11/24/2019`,
        changes: [
            `New market buy/sell volume control.`,
            `Large Trade upgrade now raises the buy/sell cap to 5,000.`,
            `Massive Trades upgrade now raises the buy/sell cap to 1,000,000.`,
            `Various bug fixes by Beorseder.`,
        ]
    },
    {
        version: `0.7.1`,
        date: `11/23/2019`,
        changes: [
            `Garrison controls reintegrated into government section.`,
            `Mutation plasmids now track correctly in no plasmid challenge runs.`,
            `Fixed many issues with foreign power name generation.`,
            `Feat star icon is no longer tiny.`,
        ]
    },
    {
        version: `0.7.0`,
        date: `11/21/2019`,
        changes: [
            `Establish a Government.`,
            `Battle rival cities.`,
            `Biome races added for Forest, Desert, Tundra, and Volcanic.`,
            `New ARPA Project: Railway.`,
            `New CRISPR upgrades: Mitosis & Metaphase.`,
            `Construct advanced AI stations in deep space.`,
            `Rapid Gene Sequencing upgrade.`,
            `Civics tab split into Government, Industry, and Military sections.`,
            `Inspiration no longer adds an upfront knowledge bonus.`,
            `Vigilante requirement lowered to 12.`,
            `Xenophobic replaced with Wasteful.`,
            `Added Rocky Road Feat.`,
            `Configurable number notations.`,
        ]
    },
    {
        version: `0.6.27`,
        date: `11/12/2019`,
        changes: [
            `Tundra planets are now always cold in winter.`,
            `Volcanic planets are now always hot in summer.`,
            `Stormy planets are now more likely to be windy.`,
            `Fixed issue with last rites not showing up as affordable.`,
            `2-4x Challenge Multipliers changed:.`,
            `2 Challenges: +12% Prestige.`,
            `3 Challenges: +25% Prestige.`,
            `4 Challenges: +45% Prestige.`,
            `Heavy Universe prestige bonus now scales with challenge level:.`,
            `0 Challenges: +5% Prestige.`,
            `1 Challenge: +10% Prestige.`,
            `2 Challenges: +15% Prestige.`,
            `3 Challenges: +20% Prestige.`,
            `4 Challenges: +25% Prestige.`,
        ]
    },
    {
        version: `0.6.26`,
        date: `11/7/2019`,
        changes: [
            `ARPA costs now update without mousing off and back on the buttons.`,
            `Fixed issues with incorrectly powering on newly built structures.`,
            `None-demonic evil smelters now correctly state they burn 1 flesh/s.`,
            `Added whitehole perk to stats page.`,
        ]
    },
    {
        version: `0.6.25`,
        date: `11/2/2019`,
        changes: [
            `Geology bonus is now preserved on MAD reset.`,
            `Key Mappings are now configurable for multiplier and queue keys.`,
        ]
    },
    {
        version: `0.6.24`,
        date: `10/31/2019`,
        changes: [
            `The Halloween feat will now unlock inside a micro universe.`,
        ]
    },
    {
        version: `0.6.23`,
        date: `10/28/2019`,
        changes: [
            `Exotic mass now counts towards Galactic Landfill and Supermassive.`,
            `Fixed issues with queue timers and kindling kindred trait.`,
            `Dark Energy now applies to windmills in antimatter universe.`,
        ]
    },
    {
        version: `0.6.22`,
        date: `10/26/2019`,
        changes: [
            `Game optimizations.`,
            `Bug fixes for queues.`,
            `Fixed bug with war droids.`,
        ]
    },
    {
        version: `0.6.21`,
        date: `10/24/2019`,
        changes: [
            `Freight Train upgrade now adds a trade route to freight yards instead of trade posts.`,
            `Toxic troll achievement.`,
            `Spatial reasoning rounding fix.`,
        ]
    },
    {
        version: `0.6.20`,
        date: `10/21/2019`,
        changes: [
            `Fixed application of plasmids with antiplasmids.`,
            `Updated description of bleeding effect.`,
            `Added achievement for synthesizing an anti-plasmid.`,
            `More readable achievement page.`,
        ]
    },
    {
        version: `0.6.19`,
        date: `10/20/2019`,
        changes: [
            `Fixed power errors with hell dimension turrets.`,
            `Crate/Container rounding is now applied after spatial reasoning.`,
            `Added extra text to the asteroid belt description to call out the necessity of assigning space miners.`,
            `Evil Ents can now burn flesh in the smelter.`,
        ]
    },
    {
        version: `0.6.18`,
        date: `10/16/2019`,
        changes: [
            `Swarm Satellite redesign.`,
            `Swarm Satellites cost and output decreased.`,
            `Control Stations can now control 10/18 swarm satellites.`,
            `Iron mining ship swarm plant discount now applies to all swarm plant costs.`,
            `New upgrades to increase output of swarm satellites.`,
        ]
    },
    {
        version: `0.6.17`,
        date: `10/14/2019`,
        changes: [
            `"Q" key now works with research queue.`,
            `Added settings option to not enforce queue order.`,
            `Decay challenge no longer shows the star level for Joyless.`,
            `All universe types can now be seen on achievements.`,
            `Genus completion is now marked on sentience.`,
            `Challenges can now be toggled during evolution.`,
            `Inspiration event now gives a temporary buff to all science production.`,
            `Added Slave Market for slaver races to buy slaves as an alternative to catching them.`,
            `Added Crate/Container storage amount to the build crate/container tooltip.`,
            `Added a button to cancel all trade routes for each resource.`,
        ]
    },
    {
        version: `0.6.16`,
        date: `10/13/2019`,
        changes: [
            `Employment is now color coded depending on staffing levels.`,
            `GPS satellites now add additional trade routes.`,
            `Added stats tracking on reset mechanics used.`,
            `Added a message when completing the launch facility.`,
            `Added icons to challenges and races in evolution stage to indicate level of challenge completion.`,
        ]
    },
    {
        version: `0.6.15`,
        date: `10/11/2019`,
        changes: [
            `Added a settings option to disable the queue hot key.`,
            `The queue hot key is now disabled by default because it breaks the game for some users.`,
        ]
    },
    {
        version: `0.6.14`,
        date: `10/9/2019`,
        changes: [
            `Fixed several bugs with celestial races.`,
            `Only one demonic invasion event is now required to reach a hellscape planet.`,
            `New city categorization can now be switched off in the settings tab.`,
            `Holding Q while clicking a building will now queue it instead of constructing it.`,
        ]
    },
    {
        version: `0.6.13`,
        date: `10/7/2019`,
        changes: [
            `Fixed bioseed reset bug when seeding from a planet without a special property.`,
        ]
    },
    {
        version: `0.6.12`,
        date: `10/6/2019`,
        changes: [
            `Added a hire merc option to fortress, mercs hired here go directly to the fortress.`,
            `Default patrol size is now 10 instead of 4.`,
            `Adjusted margins in city tab/space tabs to slightly reduce vertical scrolling.`,
            `New Tower of Babel flair.`,
        ]
    },
    {
        version: `0.6.11`,
        date: `10/5/2019`,
        changes: [
            `New planetary modifiers: Toxic, Mellow, Rage, Stormy, Ozone, Magnetic, and Trashed.`,
            `City Categorization by NotOats.`,
            `Chinese Translation.`,
        ]
    },
    {
        version: `0.6.10`,
        date: `10/1/2019`,
        changes: [
            `Fixed issue with gene editing costing the wrong type of Plasmid.`,
            `Fixed Bone label in Graphene plant.`,
            `Fixed issue with Plywood not unlocking when removing Kindling Kindred trait.`,
        ]
    },
    {
        version: `0.6.9`,
        date: `9/30/2019`,
        changes: [
            `Antimatter Universe.`,
            `Bleeding Effect line of CRISPR upgrades, requires Anti-Plasmids to unlock.`,
            `Balorg can now unlock queues.`,
            `Fixed aria labels in mass ejector.`,
        ]
    },
    {
        version: `0.6.8`,
        date: `9/24/2019`,
        changes: [
            `Queue reordering no longer swaps the dragged item with the one in the target spot.`,
            `Added timers to research queue.`,
            `Cost adjustments are now applied to queue timers increasing their accuracy.`,
        ]
    },
    {
        version: `0.6.7`,
        date: `9/24/2019`,
        changes: [
            `Cath windmills now generate power instead of just looking pretty.`,
            `Fixed Spanish strings file, language now loads again.`,
        ]
    },
    {
        version: `0.6.6`,
        date: `9/23/2019`,
        changes: [
            `Added special tech tree to sacrificial altar to boost its effectiveness per sacrifice.`,
            `Restored windmills to cath.`,
            `Challenge Multiplier Dark Energy rounding calculation fixed.`,
            `Added extra information to blackhole description when it reaches destabilization point.`,
            `Added a warning to stabilize option that it will reset your exotic matter.`,
        ]
    },
    {
        version: `0.6.5`,
        date: `9/21/2019`,
        changes: [
            `Fixed display issue with frenzy appearing to never drop below 1%.`,
            `Updated the tooltip values on farms and farmers to include the hellscape penalty.`,
            `Fixed Evil Ents so they start with Gather Stone option.`,
        ]
    },
    {
        version: `0.6.4`,
        date: `9/19/2019`,
        changes: [
            `Fixed double windmill issue with evil universe races.`,
            `Spanish language updates.`,
            `Added warnings to challenge modes in micro universe that you will not receive credit.`,
        ]
    },
    {
        version: `0.6.3`,
        date: `9/17/2019`,
        changes: [
            `Restored broken perks.`,
        ]
    },
    {
        version: `0.6.2`,
        date: `9/17/2019`,
        changes: [
            `Bug Fixes.`,
        ]
    },
    {
        version: `0.6.1`,
        date: `9/17/2019`,
        changes: [
            `Universe Update, explore ~~ 4 ~~ 3 new universe types:.`,
            `Heavy Gravity Universe.`,
            `Micro Universe.`,
            `Evil Universe.`,
            `New Decay Challenge.`,
            `Antimatter universe is still forming, coming soon.`,
            `Dark Energy effects added, unique per universe type.`,
            `New Plasmid scaling formula.`,
            `Blackhole mass added to Stellar Engine.`,
            `Stuff I probably forgot about.`,
        ]
    },
    {
        version: `0.5.18`,
        date: `9/11/2019`,
        changes: [
            `Spanish translation provided by RanaPeluda.`,
            `Fixed Ent fanaticism.`,
            `Modals are no longer unnecessarily wide.`,
            `Smelter modal now shows the fuel production for each type.`,
        ]
    },
    {
        version: `0.5.17`,
        date: `9/5/2019`,
        changes: [
            `Mantis Frail trait replaced with new Cannibalize trait, eat your own citizens for buffs.`,
            `The Fortress will now remember the number of troops assigned to it and attempt to keep it at that level.`,
        ]
    },
    {
        version: `0.5.16`,
        date: `9/3/2019`,
        changes: [
            `Made some adjustments to Soul Gem drop odds.`,
            `Added a message when you discover your first Soul Gem.`,
        ]
    },
    {
        version: `0.5.15`,
        date: `9/1/2019`,
        changes: [
            `Portuguese translations updated by Rodrigodd.`,
        ]
    },
    {
        version: `0.5.14`,
        date: `9/1/2019`,
        changes: [
            `Buildings will no longer be added to the queue if holding down a multiplier key.`,
            `Fixed a problem with smelters that could cause their production to become stuck in a high state.`,
            `Fixed initial display state of containers in storage management tab.`,
        ]
    },
    {
        version: `0.5.13`,
        date: `8/30/2019`,
        changes: [
            `New layout for selecting challenge genes/modes during end of evolution stage.`,
            `Fixed bug with low support elerium miners that caused them to miscalculate miner outputs.`,
            `Added a threat level warning to fortress.`,
        ]
    },
    {
        version: `0.5.12`,
        date: `8/30/2019`,
        changes: [
            `Pacifist Achievement is now unlocked by unifying without ever initiating an attack.`,
        ]
    },
    {
        version: `0.5.11`,
        date: `8/28/2019`,
        changes: [
            `Fixed issue with nucleus DNA bonus not applying from correct cell stage evolutions.`,
            `Building timers now count down without refreshing the popover.`,
            `Long action titles will now wrap instead of overflowing the button.`,
            `Fixed a bug that could cause the research queue to clear items from the building queue.`,
        ]
    },
    {
        version: `0.5.10`,
        date: `8/28/2019`,
        changes: [
            `Fixed bug with some construction projects not refreshing the page after being built with the queue.`,
            `Space exploration missions can no longer be queued more then once at a time.`,
            `One off projects are now removed from the queue if completed manually.`,
            `Queue timers now track crafted resources.`,
            `Demonic attractor soul gem drop rate increase buffed from 5% to 8%.`,
            `Updated some fortress related tooltips.`,
            `Mousing over the star rating in the top left corner now lists which challenges are active.`,
            `Time until ready added to unaffordable actions.`,
        ]
    },
    {
        version: `0.5.9`,
        date: `8/27/2019`,
        changes: [
            `Active build queues wiped due do internal game breaking format change.`,
        ]
    },
    {
        version: `0.5.8`,
        date: `8/27/2019`,
        changes: [
            `Construction timers added to build queue.`,
            `Construction and research completed by queues are now logged to the message list.`,
            `Improved drag and drop support for queues.`,
        ]
    },
    {
        version: `0.5.7`,
        date: `8/25/2019`,
        changes: [
            `Drag support for queue sorting.`,
            `Fixed resource display bug that occurred when buying a mass ejector.`,
            `Minor traits now show the number of ranks from phage or genes spent.`,
        ]
    },
    {
        version: `0.5.6`,
        date: `8/23/2019`,
        changes: [
            `Building queue now works in space.`,
            `Added a separate research queue.`,
            `Fixed rock quarry awarding 4% stone bonus instead of the stated 2%.`,
            `Fixed rendering bugs with the blackhole and mass ejector.`,
        ]
    },
    {
        version: `0.5.5`,
        date: `8/22/2019`,
        changes: [
            `Bug Fixes for queueing system.`,
        ]
    },
    {
        version: `0.5.4`,
        date: `8/22/2019`,
        changes: [
            `Building Queue system v1.0.`,
            `Urban Planning, Zoning Permits, and Urbanization queue related techs.`,
            `New CRISPR upgrades for enhanced queueing.`,
        ]
    },
    {
        version: `0.5.3`,
        date: `8/20/2019`,
        changes: [
            `Stats and Achievements separated into separate sub tabs.`,
            `Disruptor rifle upgrade for soldiers.`,
            `Mass Ejector can no longer be unlocked before completing the Stellar Engine.`,
        ]
    },
    {
        version: `0.5.2`,
        date: `8/20/2019`,
        changes: [
            `Fixed misnamed mantis trait key.`,
            `Fixed Iron smelter paying out 10x intended amount.`,
        ]
    },
    {
        version: `0.5.1`,
        date: `8/20/2019`,
        changes: [
            `Disappearing craftsman fix.`,
        ]
    },
    {
        version: `0.5.0`,
        date: `8/19/2019`,
        changes: [
            `Interstellar space is now unlockable.`,
            `Interdimensional travel is now unlockable.`,
            `New management tab for Crates & Containers.`,
            `Power generation breakdown.`,
            `Improved resource breakdown layout.`,
            `Leathery trait buffed.`,
            `Chameleon trait now adds a combat rating bonus.`,
            `Optimistic now also applies to the minimum morale rating.`,
            `Smarter Smelter fuel switching.`,
            `New CRISPR unlocks.`,
        ]
    },
    {
        version: `0.4.42`,
        date: `8/16/2019`,
        changes: [
            `Fixed some screen reader issues with the crate modal launch button.`,
            `Added a warning to the Genetic Dead End challenge if you are on a hellscape planet.`,
        ]
    },
    {
        version: `0.4.41`,
        date: `8/15/2019`,
        changes: [
            `Joyless Challenge.`,
            `??? - Nothing to see here, move along.`,
        ]
    },
    {
        version: `0.4.40`,
        date: `8/9/2019`,
        changes: [
            `Changed No Crispr gene into the Weak Crispr gene.`,
        ]
    },
    {
        version: `0.4.39`,
        date: `8/6/2019`,
        changes: [
            `Genetic Disaster Challenge.`,
        ]
    },
    {
        version: `0.4.38`,
        date: `8/5/2019`,
        changes: [
            `Special action icon is now properly flagged as a button.`,
        ]
    },
    {
        version: `0.4.37`,
        date: `7/31/2019`,
        changes: [
            `ARIA Improvements for Factory and A.R.P.A.`,
        ]
    },
    {
        version: `0.4.36`,
        date: `7/27/2019`,
        changes: [
            `Slow and Hyper traits can now combine.`,
            `Added new achievements: Creator & Explorer.`,
            `Added perks for Mass Extinction, Creator, and Explorer.`,
        ]
    },
    {
        version: `0.4.35`,
        date: `7/25/2019`,
        changes: [
            `Centaur can now pick Fanaticism.`,
            `Challenge multiplier is now applied to phage gain.`,
        ]
    },
    {
        version: `0.4.34`,
        date: `7/23/2019`,
        changes: [
            `Fixed SR descriptions of buildings that lack affordability.`,
            `Fixed resource highlighting of buildings that have zero costs.`,
        ]
    },
    {
        version: `0.4.33`,
        date: `7/23/2019`,
        changes: [
            `Fixes for Ent Fanaticism not releasing some resources.`,
            `Aria improvements for the smelter modal.`,
            `Improved screen reader resource affordability description of buildings/research.`,
            `Resource highlighting on structures.`,
        ]
    },
    {
        version: `0.4.32`,
        date: `7/21/2019`,
        changes: [
            `Balorg slaver trait added.`,
            `Ziggurat bonus now applies to the oil extractor.`,
            `Geology Oil rich/poor no longer applies to oil extractor.`,
            `Added resource alternate row coloring.`,
            `Added an affordability hint for screen readers.`,
            `Fixed some bugs with awarding a random minor trait from fanaticism.`,
            `Dimensional Compression now charges the correct cost.`,
        ]
    },
    {
        version: `0.4.31`,
        date: `7/20/2019`,
        changes: [
            `Extreme Dazzle casino upgrade.`,
            `Metallurgist minor trait, buffs alloy.`,
            `Gambler minor trait, buffs casinos.`,
            `A.R.P.A. projects now use resource approximations for large numbers.`,
            `Cement Factory renamed to Cement Plant to reduce confusion with the regular Factory.`,
            `Key multipliers now work inside the factory modal.`,
            `Imps and Balorg now have access to advanced crafting tech.`,
            `Imps and Balorg now have access to windmills.`,
            `Balorg can now set their taxes below 10% and above 30%.`,
        ]
    },
    {
        version: `0.4.30`,
        date: `7/19/2019`,
        changes: [
            `Portuguese translation by Rodrigodd.`,
            `DNA Sequencer upgrade.`,
            `Gene Assembly cost increase to 200k.`,
            `Synthesis now applies a bonus to auto crafted genes.`,
            `Ambidextrous buffed.`,
            `Ambidextrous now has a greater effect on auto crafting.`,
        ]
    },
    {
        version: `0.4.29`,
        date: `7/18/2019`,
        changes: [
            `Genetic modification system, customize your race with minor traits.`,
            `Shotgun Sequencing upgrade for genome research.`,
            `Randomly gained minor traits will no longer stack unless they have all been unlocked.`,
            `Genes are now gained from random mutations.`,
            `Synthesis line of CRISPR upgrades.`,
            `Satellite and Observatory cost reductions.`,
            `Fibroblast minor trait.`,
            `Iridium is now unlocked by constructing an iridium mine instead of the moon base.`,
            `Helium-3 is now unlocked by constructing a helium-3 mine instead of the moon base.`,
            `Genome sequencing now defaults to on when first unlocked.`,
        ]
    },
    {
        version: `0.4.28`,
        date: `7/16/2019`,
        changes: [
            `Added missing hellscape achievement.`,
            `Fixed spatial reasoning and phage interaction.`,
            `Fixed warmonger unlocking requirement.`,
        ]
    },
    {
        version: `0.4.27`,
        date: `7/13/2019`,
        changes: [
            `Added special action description buttons for screen readers.`,
        ]
    },
    {
        version: `0.4.26`,
        date: `7/12/2019`,
        changes: [
            `Unlocked CRISPR upgrades are now listed as perks.`,
            `Control/Shift/Alt click now works with power on and off buttons.`,
        ]
    },
    {
        version: `0.4.25`,
        date: `7/11/2019`,
        changes: [
            `Quantum Manufacturing upgrade.`,
            `Quantum Swarm cost lowered from 465k to 450k.`,
        ]
    },
    {
        version: `0.4.24`,
        date: `7/10/2019`,
        changes: [
            `Thermomechanics upgrade for alloy production.`,
            `Ziggurats unlockable via ancients upgrade.`,
            `Cement factory has a more clear label in breakdown lists.`,
        ]
    },
    {
        version: `0.4.23`,
        date: `7/7/2019`,
        changes: [
            `Resources at the millions breakpoint and above are now shown with 2 significant decimal points.`,
            `Reduced the creep cost of Observatory.`,
            `Reduced the base knowledge cost of Observatory.`,
            `Reduced the Brick cost of Boot Camps.`,
            `Evil has been unleashed.`,
        ]
    },
    {
        version: `0.4.22`,
        date: `7/6/2019`,
        changes: [
            `Fixed issue with having exactly 251 Plasmids that would break your resources.`,
            `Fixed issue with planet generation that caused it to always use the same seed.`,
        ]
    },
    {
        version: `0.4.21`,
        date: `7/6/2019`,
        changes: [
            `Fixed unlocking of mass extinction achievement.`,
            `Fixed potential fuel consumption bug with power plants.`,
        ]
    },
    {
        version: `0.4.20`,
        date: `7/4/2019`,
        changes: [
            `Phage can now be earned from space resets, phage extends the plasmid diminishing return breakpoint.`,
            `Dimensional Warping crispr upgrade, applies phages to spatial reasoning.`,
            `Added special windmill tech for carnivore path to equalize power grid.`,
            `Space Stations now give 5 Elerium storage instead of 4.`,
        ]
    },
    {
        version: `0.4.19`,
        date: `7/2/2019`,
        changes: [
            `Fixed bugs with the hell planet and gas planet survey mission.`,
            `Fixed bug that prevented the planet description tooltip from triggering.`,
            `Aluminium now properly requires you to build a metal refinery.`,
        ]
    },
    {
        version: `0.4.18`,
        date: `7/1/2019`,
        changes: [
            `Planets choice now has more depth to it, each planet can be poor or rich in various resource types.`,
            `A mineral poor planet suffers anywhere from 1 to 10% penalty for that resource.`,
            `A mineral rich planet gains anywhere from 1 to 20% bonus for that resource.`,
            `The fire event no longer triggers for aquatic races.`,
            `The first interstellar probe now contributes to the number of potential target worlds.`,
            `All interstellar space probe costs are now cheaper.`,
        ]
    },
    {
        version: `0.4.17`,
        date: `6/29/2019`,
        changes: [
            `Added indication of current challenge level to top bar.`,
            `Added H tags for accessibility.`,
        ]
    },
    {
        version: `0.4.16`,
        date: `6/28/2019`,
        changes: [
            `New Hospital, heals wounded soldiers faster.`,
            `New Boot Camp, train new soldiers quicker.`,
            `Lowered research cost of Mass Driver from 170k to 160k.`,
            `Lowered Iridium cost of Mass Drivers.`,
            `Updated Mass Extinction unlock requirement.`,
        ]
    },
    {
        version: `0.4.15`,
        date: `6/28/2019`,
        changes: [
            `Global bonuses are now multiplicative instead of additive.`,
            `Decreased base Elerium cost of Exotic Lab by 4.`,
            `Creative trait decreases cost creep instead of providing a flat discount.`,
            `ARPA 100% button replaced with remaining percentage value.`,
            `New experimental military advice.`,
        ]
    },
    {
        version: `0.4.14`,
        date: `6/27/2019`,
        changes: [
            `Statues now cost Aluminium instead of Wrought Iron.`,
            `Nav Beacon now costs Aluminium instead of Iron.`,
            `Helium-3 Mine now costs Aluminium instead of Copper.`,
            `Elerium Mining Ship now costs Titanium instead of Iridium.`,
            `Iron Mining Ship now costs Aluminium instead of Titanium.`,
            `Dimension Compression upgrade now works correctly.`,
            `Aluminium can now be looted from battle.`,
        ]
    },
    {
        version: `0.4.13`,
        date: `6/26/2019`,
        changes: [
            `Aluminium resource added to the game, research Bayer Process to unlock Metal Refinery which in turn unlocks Aluminum.`,
            `New Metal Refinery structure for producing Aluminium.`,
            `Alloy is now made out of Aluminium and Copper.`,
            `Sheet Metal is now made out of Aluminium.`,
            `Oil Powerplant and Propellant Depot now cost Aluminium instead of Steel.`,
            `Some minor accessibility improvements.`,
        ]
    },
    {
        version: `0.4.12`,
        date: `6/24/2019`,
        changes: [
            `Blackhole achievement now gives a permanent perk for completing it, the perk strength depends on the achievement level.`,
            `Fixed issue with event timer being frozen after changing planets.`,
            `Fixed the unlocking of upgraded versions of some achievements.`,
            `Cost descriptions now show approximations above 10,000.`,
        ]
    },
    {
        version: `0.4.11`,
        date: `6/24/2019`,
        changes: [
            `Re-evaluated starvation breakpoint.`,
            `Added Infested Terran achievement.`,
            `Titanium price is now reset after unlocking Hunter Process.`,
            `Resources now have a 25% chance of their market price changing per day, up from 10%.`,
        ]
    },
    {
        version: `0.4.10`,
        date: `6/23/2019`,
        changes: [
            `Fixed stats tracking on demonic invasions so it actually tracks new invasions.`,
        ]
    },
    {
        version: `0.4.9`,
        date: `6/23/2019`,
        changes: [
            `Fabrication facilities now increase craftsman cap.`,
            `Added stats tracking on demonic invasions.`,
            `Detail Oriented buffed to 50% from 33%.`,
            `Rigorous buffed to 100% from 66%.`,
            `Crafting bonus now shown for each resource.`,
            `Temple Faith bonus now applies to crafting in no plasmid challenge mode.`,
            `Mastery bonus now applies to crafting.`,
        ]
    },
    {
        version: `0.4.8`,
        date: `6/22/2019`,
        changes: [
            `Fixed a bug that removed MAD when achieving unification.`,
            `Fixed missing options in evolution stage with picking avians after space reset.`,
        ]
    },
    {
        version: `0.4.7`,
        date: `6/21/2019`,
        changes: [
            `Activating challenge genes now provide a bonus to the number of plasmids earned.`,
        ]
    },
    {
        version: `0.4.6`,
        date: `6/21/2019`,
        changes: [
            `Reduced Nano Tube and Neutronium costs of bioseeder ship.`,
            `Reduced Mythril cost of Space Probes.`,
        ]
    },
    {
        version: `0.4.5`,
        date: `6/19/2019`,
        changes: [
            `Mastery Bonus now unlockable in CRISPR.`,
            `Fixed bug with elerium mining that could cause negative mining when you lacked asteroid miners.`,
            `Fixed low power warning not clearing when you have no buildings active.`,
            `Fixed Sporgar label of Cottages in Steel & Mythril Beams research.`,
            `Gene Mutation research will no longer turn off when you run out of knowledge, instead it will pause.`,
            `Human creative trait buffed from 2% to 5%.`,
            `Troll regenerative trait buffed to heal 4 wounded per day instead of 2.`,
            `Ogre tough trait buffed to 25% from 10%.`,
            `Gecko optimistic trait buffed to 10% from 2%.`,
            `Arraak resourceful trait buffed from 5% to 10%.`,
            `Dracnid hoarder trait buffed from 10% to 20%.`,
            `Shroomi toxic trait buffed from 10% to 25%.`,
            `Wolven pack mentality trait now applies to apartments.`,
            `Reduced Nano Tube cost of Mining Drones.`,
        ]
    },
    {
        version: `0.4.4`,
        date: `6/18/2019`,
        changes: [
            `Matter compression now applies to Wharves.`,
            `Xenophobia now applies to Wharves.`,
            `Plasmids earned by mutation now apply to no plasmid challenge run.`,
            `Reduced Nano Tube cost of Mining Drones.`,
        ]
    },
    {
        version: `0.4.3`,
        date: `6/17/2019`,
        changes: [
            `Challenge mode achievement tracking.`,
            `Vocational Training for craftsman.`,
            `Spelling and grammar fixes.`,
            `Fixed incorrect reject unity reward text.`,
        ]
    },
    {
        version: `0.4.2`,
        date: `6/16/2019`,
        changes: [
            `Added some clarification to breakdown of stress.`,
        ]
    },
    {
        version: `0.4.1`,
        date: `6/16/2019`,
        changes: [
            `Fixed a bug with factories converted from some pre 0.4.0 save files.`,
        ]
    },
    {
        version: `0.4.0`,
        date: `6/16/2019`,
        changes: [
            `Space reset option, control the destiny of your next race.`,
            `Challenge Modes.`,
            `New Stuff to discover.`,
            `New Achievements to unlock.`,
            `Added missing Cyclops racial trait.`,
            `World Domination, maybe.`,
            `Added soft reset option.`,
        ]
    },
    {
        version: `0.3.12`,
        date: `6/11/2019`,
        changes: [
            `Fixed bug with riot event that caused it to trigger on high morale instead of low morale.`,
        ]
    },
    {
        version: `0.3.11`,
        date: `6/10/2019`,
        changes: [
            `The Gas Moon and the Dwarf planets are now accessible.`,
            `New technologies based on new discoveries made in deep space.`,
            `Wharves can now be unlocked after discovering oil.`,
            `There is now an alternative method of unlocking steel.`,
            `Night Theme updated, popovers are no longer bright.`,
            `Trade route tooltips now include money being imported or exported.`,
            `New crispr upgrades for crafting.`,
            `Warmonger achievement requirement lowered from 10% to 8%.`,
        ]
    },
    {
        version: `0.3.10`,
        date: `6/9/2019`,
        changes: [
            `Added code to fix peculiar failed space launch game state.`,
        ]
    },
    {
        version: `0.3.9`,
        date: `6/8/2019`,
        changes: [
            `New official Evolve [Discord](https://discordapp.com/invite/dcwdQEr).`,
        ]
    },
    {
        version: `0.3.8`,
        date: `6/7/2019`,
        changes: [
            `Fixed a problem with negative craftsman counts that could result from craftsman dying.`,
        ]
    },
    {
        version: `0.3.7`,
        date: `6/6/2019`,
        changes: [
            `Warmongering is now tracked and high casualties may impact morale.`,
            `Depleting the mercenary pool will temporarily increase their cost.`,
            `Three new achievements related to war.`,
        ]
    },
    {
        version: `0.3.6`,
        date: `6/5/2019`,
        changes: [
            `Fixed issue with production breakdowns not showing when income was only produced by trade.`,
            `Fixed issue that prevented affordability check from refreshing on space missions.`,
        ]
    },
    {
        version: `0.3.5`,
        date: `6/5/2019`,
        changes: [
            `Mythril Craftsman now unlock correctly.`,
            `Fixed a bug that could pause the game if you ran out of Titanium.`,
        ]
    },
    {
        version: `0.3.4`,
        date: `6/4/2019`,
        changes: [
            `The Asteroid Belt is now open for business.`,
            `Robotics Upgrades.`,
            `Automation renamed to Machinery.`,
            `Assembly Line upgrade for factory.`,
        ]
    },
    {
        version: `0.3.3`,
        date: `6/3/2019`,
        changes: [
            `New Orbit Structure: Navigation Beacon.`,
            `New Red Planet Structures: Space Control Tower and Space Factory.`,
            `Reduced number of monuments required to unlock tourism from 4 to 2.`,
            `Cement plant workers now round their contribution to 2 decimal places.`,
            `Red planet mining now correctly attributes to the red planet in breakdowns.`,
        ]
    },
    {
        version: `0.3.2`,
        date: `6/3/2019`,
        changes: [
            `Fixed bug that would let you launch the space missions without the proper resources, this would corrupt your game file and break the game.`,
            `Added code to detect games corrupted by the previous bug and fix them.`,
            `Fixed Fanaticism bug that wouldn't release lumberjacks when you have ent gods.`,
        ]
    },
    {
        version: `0.3.1`,
        date: `6/3/2019`,
        changes: [
            `Added building check redundancy to auto correct game states that shouldn't occur anyway.`,
        ]
    },
    {
        version: `0.3.0`,
        date: `6/2/2019`,
        changes: [
            `Space V1 Update.`,
            `This opens the first steps into space exploration, more to come... this is not the end.`,
            `Rebalanced storage caps to help the game feel more idle friendly.`,
        ]
    },
    {
        version: `0.2.70`,
        date: `6/2/2019`,
        changes: [
            `Fixed bug when picking Fanaticism with cath gods that wouldn't release your farmers.`,
            `Fixed bug when upgrading weapon technology that wouldn't immediately show the increase in army rating.`,
        ]
    },
    {
        version: `0.2.69`,
        date: `5/26/2019`,
        changes: [
            `Fixed bug which could let you get free barn or warehouse upgrade by essentially skipping over the tech.`,
            `Added aria button roles to many button like elements that were not technically buttons.`,
        ]
    },
    {
        version: `0.2.68`,
        date: `5/26/2019`,
        changes: [
            `Fixed bug with Rock Quarry that prevented the 2% bonus from working unless you had electricity unlocked.`,
        ]
    },
    {
        version: `0.2.67`,
        date: `5/24/2019`,
        changes: [
            `Revamp of farmer, lumberjack, and quarry worker jobs. These govern the most basic materials produced and can now assign as many workers as you like to these positions.`,
            `Farms now directly produce food instead of determining farmer cap.`,
            `Lumber Yards now increase lumber production instead of governing lumberjack cap.`,
            `Rock Quarry now increase stone production instead of governing quarry worker cap.`,
            `Sawmill powered on bonus reduced from 5% to 4%.`,
            `Rock Quarry powered on bonus reduced from 5% to 4%.`,
            `Stock Exchanges no longer cost Knowledge.`,
            `Fixed a display bug that could cause farmers to falsely show they produced more food then they actual did.`,
        ]
    },
    {
        version: `0.2.66`,
        date: `5/22/2019`,
        changes: [
            `Added alternate row coloring to the market to help distinguish rows.`,
        ]
    },
    {
        version: `0.2.65`,
        date: `5/21/2019`,
        changes: [
            `Sporgar race redesigned into a parasitic race that spreads through infecting victims.`,
        ]
    },
    {
        version: `0.2.64`,
        date: `5/20/2019`,
        changes: [
            `Currency is now required before unlocking Basic Storage.`,
            `Primitive Axes are no longer gated behind Basic Storage.`,
            `Foundry now requires Metal Working to unlock and no longer requires Cement.`,
            `Research tab now defaults back to new when resetting.`,
            `Fixed issue with not being able to buy something if you had consumption on a resource and the cost was the same as your max capacity.`,
            `Fixed issue with max affordability check not refreshing on evolution stage.`,
            `Experimental Red-Green color blind theme.`,
        ]
    },
    {
        version: `0.2.63`,
        date: `5/20/2019`,
        changes: [
            `Fixed an issue that accidentally set the default tax rate to 2% instead of 20% for new games.`,
        ]
    },
    {
        version: `0.2.62`,
        date: `5/19/2019`,
        changes: [
            `Tax system revamped. Taxes can now be adjusted more granularly and effect morale instead of production.`,
            `Cement is now a requirement for theology since cement is needed for temples.`,
        ]
    },
    {
        version: `0.2.61`,
        date: `5/19/2019`,
        changes: [
            `Every genus type now has its own evolution path.`,
        ]
    },
    {
        version: `0.2.60`,
        date: `5/18/2019`,
        changes: [
            `Rescaled crate/container volumes. There are now substantially less crates/containers but they do a lot more per crate/container.`,
            `Spatial Reasoning now correctly applies to crates & containers.`,
            `Increased base value of several major storage facilities.`,
            `Added storage timers.`,
            `A.R.P.A. costs in popover now update their affordability check.`,
            `Buildings and Research that can not be afforded due to low capacity are now marked in red text.`,
        ]
    },
    {
        version: `0.2.59`,
        date: `5/17/2019`,
        changes: [
            `Added additional validation to ensure save strings belong to evolve before importing.`,
            `Fixed army rating display when rating doesn't calculate to a whole number.`,
            `Fixed listing order of some resources.`,
            `Smelter Iron bonus breakdown fixed.`,
            `Added Selenophobia to breakdown lists.`,
        ]
    },
    {
        version: `0.2.58`,
        date: `5/15/2019`,
        changes: [
            `Settings option to disable multiplier keys.`,
        ]
    },
    {
        version: `0.2.57`,
        date: `5/15/2019`,
        changes: [
            `Added labor validation to coal miners.`,
            `Key Multipliers now work with job and trade route assignment.`,
        ]
    },
    {
        version: `0.2.56`,
        date: `5/15/2019`,
        changes: [
            `Added +- symbols to trade route to distinguish import vs export.`,
        ]
    },
    {
        version: `0.2.55`,
        date: `5/14/2019`,
        changes: [
            `Manually crafting resources now gets all the same bonuses as auto crafting.`,
            `Fixed Recombination crispr upgrade.`,
            `Death limits added to each war campaign level.`,
            `War assessment added for each war campaign level.`,
        ]
    },
    {
        version: `0.2.54`,
        date: `5/13/2019`,
        changes: [
            `Uranium Breakdown Fixes.`,
        ]
    },
    {
        version: `0.2.53`,
        date: `5/13/2019`,
        changes: [
            `Breakdown Accuracy Enhancements.`,
            `Some Kindling Kindred costs reduced.`,
            `Fixed bug related to Fanaticism and Ent gods with foundry workers assigned to make plywood.`,
            `Plasmid bonus now applies to the sundial.`,
            `Fixed some spelling errors.`,
        ]
    },
    {
        version: `0.2.52`,
        date: `5/11/2019`,
        changes: [
            `Completed research can now be viewed on a separate tab under research.`,
            `Removed Plywood requirement from Stock Exchange for players with Kindling Kindred trait.`,
            `Fixed a CSS issue in the A.R.P.A. projects tab.`,
        ]
    },
    {
        version: `0.2.51`,
        date: `5/11/2019`,
        changes: [
            `University starts slightly cheaper.`,
            `Added Spatial Superiority crispr upgrade.`,
            `Added Spatial Supremacy crispr upgrade.`,
            `Exporting a save string now automatically selects the text and copies it to the clipboard.`,
        ]
    },
    {
        version: `0.2.50`,
        date: `5/10/2019`,
        changes: [
            `Added new capacity breakdowns for various resources.`,
        ]
    },
    {
        version: `0.2.49`,
        date: `5/10/2019`,
        changes: [
            `Added changelog link to version listing.`,
            `Added protection against loading a corrupt save string.`,
            `Greedy trait is now less greedy.`,
            `Spelling error fixes.`,
        ]
    },
    {
        version: `0.2.48`,
        date: `5/8/2019`,
        changes: [
            `Resources that are at greater then 99% capacity now change color to indicate they are at cap.`,
            `Attacks from rival cities should no longer cause more wounded soldiers then you have.`,
            `Assigning craftsman when no citizens are free will no longer take the labor from another job.`,
        ]
    },
    {
        version: `0.2.47`,
        date: `5/8/2019`,
        changes: [
            `Gluttony trait lowered to 10% from 25% .`,
            `High Metabolism trait lowered to 5% from 10% .`,
            `Fixed Sheet Metal not being added to craftsman list when unlocked.`,
        ]
    },
    {
        version: `0.2.46`,
        date: `5/8/2019`,
        changes: [
            `The 5% library bonus was only applying to scientists which was not intended. This now applies to the sundial and professors as well.`,
        ]
    },
    {
        version: `0.2.45`,
        date: `5/8/2019`,
        changes: [
            `Fixed an issue that allowed you to get extra benefits from under-powered wardenclyffe towers and biolabs.`,
        ]
    },
    {
        version: `0.2.44`,
        date: `5/8/2019`,
        changes: [
            `Fixed Key Multipliers getting stuck down.`,
        ]
    },
    {
        version: `0.2.43`,
        date: `5/7/2019`,
        changes: [
            `Fixed bug that could cause player to get free extra crafted resources when using the +5 option.`,
            `Reordered buildings in Village tab to group them more logically.`,
        ]
    },
    {
        version: `0.2.42`,
        date: `5/7/2019`,
        changes: [
            `Fixed a bug that was causing soldiers to become immortal.`,
            `Fixed some bugs with morale that caused some weather patterns to apply a different value then was reported.`,
            `Added weather to Food breakdown.`,
        ]
    },
    {
        version: `0.2.41`,
        date: `5/7/2019`,
        changes: [
            `Added a 5% bonus to global knowledge production on libraries.`,
        ]
    },
    {
        version: `0.2.40`,
        date: `5/7/2019`,
        changes: [
            `The Hivemind trait no longer applies to farmers as this was especially punishing.`,
        ]
    },
    {
        version: `0.2.39`,
        date: `5/7/2019`,
        changes: [
            `Evolution 2.0: Redid the evolution stage of the game to make it feel less tedious and like it matters more to the next phase of the game.`,
            `Fixed a bug that has the intended effects of Pessimism and Optimism traits swapped.`,
        ]
    },
    {
        version: `0.2.38`,
        date: `5/6/2019`,
        changes: [
            `First public release.`,
        ]
    }
];

export function changeLog(){
    let content = $(`#content`);
    clearElement(content);

    for (let i=0; i<changeList.length; i++){
        let change = $(`<div class="infoBox"></div>`);
        content.append(change);

        let revision = changeList[i].hasOwnProperty('revision') ? changeList[i].revision : '';
        change.append(`<div class="type"><h2 class="has-text-warning">v${changeList[i].version}${revision}</h2><span class="has-text-caution">${changeList[i].date}</span></div>`);

        for (let j=0; j<changeList[i].changes.length; j++){
            change.append(`<div class="desc">${changeList[i].changes[j]}</div>`);
        }
    }
}

export function getTopChange(elm){
    let index = 0;
    for (index=0; index<changeList.length; index++){
        if (!changeList[index].hasOwnProperty('revision')){
            break;
        }
    }

    for (let idx=index; idx>=0; idx--){
        elm.append(`<div class="type"><h2 class="has-text-warning">v${changeList[idx].version}${changeList[idx].hasOwnProperty('revision') ? changeList[idx].revision : ''}</h2><span class="has-text-caution">${changeList[idx].date}</span></div>`);
        for (let i=0; i<changeList[idx].changes.length; i++){
            elm.append(`<div class="desc">${changeList[idx].changes[i]}</div>`);
        }
    }
    return elm;
}
