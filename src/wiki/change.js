import {} from './../vars.js';
import { clearElement } from './../functions.js';

const changeList = [
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
            `New plantery modifiers: Elliptical, Flare, Dense, and Unstable.`,
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
            `Added EM (Electromagentic) Field Challenge.`,
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
            `More robust research catagories.`,
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
            `St. Patricks Day event.`,
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
            `Fixed bug where, if Frieght Trains was gotten after ARPA, the Railway project would need a refresh to appear.`,
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
            `Multi-segement projects will now have extra segments cleared from the queue on completion.`,
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
            `The default job can now be set to: Unemployed, Farmer, Lumberjack, Quarry Worker, or Scavanger.`,
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
            `Rapid Gene Squencing upgrade.`,
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
            `Adjuted margins in city tab/space tabs to slightly reduce vertical scrolling.`,
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
            `Added special tech tree to sacrifical altar to boost its effectiveness per sacrifice.`,
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
            `Mantis Fraile trait replaced with new Cannibalize trait, eat your own citizens for buffs.`,
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
            `Fixed bug with low support elerium miners that caused them to miscalulate miner outputs.`,
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
            `Building timers now count down without refreashing the popover.`,
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
            `Construction and research completed by queues are now logged to the messege list.`,
            `Improved drag and drop support for queues.`,
        ]
    },
    {
        version: `0.5.7`,
        date: `8/25/2019`,
        changes: [
            `Drag support for queue sorting.`,
            `Fixed resource display bug that occured when buying a mass ejector.`,
            `Minor traits now show the number of ranks from phage or genes spent.`,
        ]
    },
    {
        version: `0.5.6`,
        date: `8/23/2019`,
        changes: [
            `Building queue now works in space.`,
            `Added a seperate research queue.`,
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
            `New CRISPR upgrades for enchanced queueing.`,
        ]
    },
    {
        version: `0.5.3`,
        date: `8/20/2019`,
        changes: [
            `Stats and Achievements separated into separate sub tabs.`,
            `Disrupter rifle upgrade for soldiers.`,
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
            `New mangement tab for Crates & Containers.`,
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
            `Changed No Cripser gene into the Weak Crisper gene.`,
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
            `Fixed some bugs with awarding a random minor trait from fanatiscm.`,
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
            `Iridium is now unlocked by constructing an irdium mine instead of the moon base.`,
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
            `Dimensional Warping cripsr upgrade, applies phages to spatial reasoning.`,
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
            `Blackhole achievement now gives a permanent perk for completing it, the perk strength depends on the achievemnt level.`,
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
            `Mastery Bonus now unlockable in crispr.`,
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
            `Matter compression now applies to Wharfs.`,
            `Xenophobia now applies to Wharfs.`,
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
            `Spelling and grammer fixes.`,
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
            `Wharfs can now be unlocked after discovering oil.`,
            `There is now an alternative method of unlocking steel.`,
            `Night Theme updated, popovers are no longer bright.`,
            `Trade route tooltips now include money being imported or exported.`,
            `New crisper upgrades for crafting.`,
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
            `New offical Evolve [Discord](https://discordapp.com/invite/dcwdQEr).`,
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
            `Deplating the mercenary pool will temporarily increase their cost.`,
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
            `Mythril Craftman now unlock correctly.`,
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
            `Fixed an issue that accidently set the default tax rate to 2% instead of 20% for new games.`,
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
            `Fixed army rating display when rating doens't calculate to a whole number.`,
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
            `Breakdown Accuracy Enchancements.`,
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
            `Completed research can now be viewed on a seperate tab under research.`,
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

        change.append(`<div class="type"><h2 class="has-text-warning">v${changeList[i].version}</h2><span class="has-text-caution">${changeList[i].date}</span></div>`);

        for (let j=0; j<changeList[i].changes.length; j++){
            change.append(`<div class="desc">${changeList[i].changes[j]}</div>`);
        }
    }
}

export function getTopChange(elm){
    elm.append(`<div class="type"><h2 class="has-text-warning">v${changeList[0].version}</h2><span class="has-text-caution">${changeList[0].date}</span></div>`);
    for (let i=0; i<changeList[0].changes.length; i++){
        elm.append(`<div class="desc">${changeList[0].changes[i]}</div>`);
    }
    return elm;
}
