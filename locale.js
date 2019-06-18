import { global } from './vars.js';

export function loc(key,variables){
    let string = strings[key][global.settings.locale];
    if (!string){
        string = strings[key]['en-us'];
    }
    if (variables && variables instanceof Array){
        for (let i=0; i<variables.length; i++){
            string = string.replace(`%${i}`,variables[i]);
        }
    }
    return string;
}

export const locales = {
    'en-us': 'English (US)',
    //'es-us': 'Spanish (US/Latin-America)',
    //'pr-br': 'Brazilian Portuguese',
};

const strings = {
    locale: {
        'en-us': `Locale`,
    },
    settings1: {
        'en-us': `Enable Control (10x) / Shift (25x) / Alt (100x) Multiplier keys`,
    },
    settings2: {
        'en-us': `Enable tab transition animations`,
    },
    settings3: {
        'en-us': `A hard reset will erase all your game progress`,
    },
    settings4: {
        'en-us': `A soft reset will reset your current run back to the evolution stage, you will not gain any bonuses.`,
    },
    new: {
        'en-us': `You are protoplasm in the primordial ooze`,
    },
    snow: {
        'en-us': `Snow`,
    },
    snowstorm: {
        'en-us': `Snowstorm`,
    },
    rain: {
        'en-us': `Rain`,
    },
    thunderstorm: {
        'en-us': `Thunderstorm`,
    },
    cloudy: {
        'en-us': `Cloudy`,
    },
    cloudy_windy: {
        'en-us': `Cloudy & Windy`,
    },
    sunny: {
        'en-us': `Sunny`,
    },
    sunny_windy: {
        'en-us': `Sunny & Windy`,
    },
    cold: {
        'en-us': `Cold`,
    },
    hot: {
        'en-us': `Hot`,
    },
    moderate: {
        'en-us': `Moderate temperature`,
    },
    moon1: {
        'en-us': `New Moon`,
    },
    moon2: {
        'en-us': `Waxing Crescent Moon`,
    },
    moon3: {
        'en-us': `First Quarter Moon`,
    },
    moon4: {
        'en-us': `Waxing Gibbous Moon`,
    },
    moon5: {
        'en-us': `Full Moon`,
    },
    moon6: {
        'en-us': `Waning Gibbous Moon`,
    },
    moon7: {
        'en-us': `Third Quarter Moon`,
    },
    moon8: {
        'en-us': `Waning Crescent Moon`,
    },
    infant: {
        'en-us': `Life on this planet is in it's infancy and still evolving`,
    },
    home: {
        'en-us': `%0 is the home planet of the %1 people. It is a %2 planet with an orbital period of %3 days.`,
    },
    abandon1: {
        'en-us': `%0 citizen has abandoned your settlement due to homelessness.`,
    },
    abandon2: {
        'en-us': `%0 citizens have abandoned your settlement due to homelessness.`,
    },
    genome: {
        'en-us': `The %0 genome project has been completed.`,
    },
    gene_therapy: {
        'en-us': `Gene therapy has resulted in an improvement to your species.`,
    },
    discover_elerium: {
        'en-us': `Your asteroid miners have discovered an unknown rare element in the belt, a sample has been retreived for analysis.`,
    },
    discover_oil: {
        'en-us': `Oil has unexpectedly been discovered on %0.`,
    },
    deterioration1: {
        'en-us': `Scientists have discovered that the %0 genome is deteriorating, they think the species has about %1 years remaining before genetic decay becomes a problem.`,
    },
    deterioration2: {
        'en-us': `Some alarmists now claim that the %0 genome decay is accelerating and there is as little as %1 years remaining.`,
    },
    deterioration3: {
        'en-us': `There is now a concensus about the alarming %0 genome decay. If it doesn't accelerate any further there might be %1 years remaining.`,
    },
    deterioration4: {
        'en-us': `If a solution can not be found genetic damage will begain to weaken the %0 race in at most %1 years.`,
    },
    deterioration5: {
        'en-us': `Genetic decay has started to weaken the %0 race.`,
    },
    genesis: {
        'en-us': `A group of scientists have proposed a new initiative they call the "Genesis Project".`,
    },
    steel_sample: {
        'en-us': `Your traders have brought back a sample of a metal they call "Steel"`,
    },
    job_farmer: {
        'en-us': `Farmers create food to feed your population. Each farmer generates %0 food per second.`,
    },
    job_lumberjack: {
        'en-us': `Lumberjacks harvet lumber from the forests. Each lumberjack generates %0 lumber per second.`,
    },
    job_quarry_worker: {
        'en-us': `Quarry Workers mine stone from rock quarries. Each quarry worker generates %0 stone per second.`,
    },
    job_miner1: {
        'en-us': `Miners dig up useful minerals from shafts dug deep in the ground. Each miner will extract copper from the ground.`,
    },
    job_miner2: {
        'en-us': `Miners dig up useful minerals from shafts dug deep in the ground. Each miner will extract copper and iron from the ground.`,
    },
    job_coal_miner1: {
        'en-us': `Coal miners are a special breed of miner, willing to work the dirtiest of mines to extract coal from deep in the ground.`,
    },
    job_coal_miner2: {
        'en-us': `Coal miners are a special breed of miner, willing to work the dirtiest of mines to extract coal and uranium from deep in the ground.`,
    },
    job_craftsman: {
        'en-us': `Craftsman can be assigned to craft various construction materials out of raw materials.`,
    },
    job_cement_worker: {
        'en-us': `Cement plant workers turn stone into cement, each worker produces %0 cement and consumes 3 stone per second.`,
    },
    job_banker: {
        'en-us': `Bankers manage your banks increasing tax revenue. Each banker increases tax income by %0%.`,
    },
    job_entertainer: {
        'en-us': `Entertainers help combat the dreariness of everyday life. Each entertainer raise the morale of your citizens by %0%.`,
    },
    job_professor: {
        'en-us': `Professors help educate your citizens and contribute to knowledge gain. Each professor generates %0 knowledge per second.`,
    },
    job_scientist: {
        'en-us': `Scientists study the universe to expose it's secrets. Each scientist generates %0 knowledge per second.`,
    },
    job_colonist: {
        'en-us': `Colonists work hard to keep your %0 colony running smoothly and enhance various aspects of the colony.`,
    },
    job_space_miner: {
        'en-us': `Space miners work in zero G mining asteroids. Each Space Miner increases the maximum number of mining ships that can be opperated by one.`,
    },
    job_unemployed1: {
        'en-us': `Unemployed`,
    },
    job_unemployed2: {
        'en-us': `The number of unemployed citizens. Unemployed citizens lower morale and do not pay taxes however they also consume half rations.`,
    },
    job_hunter1: {
        'en-us': `Hunter`,
    },
    job_hunter2: {
        'en-us': `Citizens not assigned to any other task will hunt for food. Military technology will boost effectiveness.`,
    },
    craftsman_assigned: {
        'en-us': `Craftman Assigned`,
    },
    job_craftsman1: {
        'en-us': `Craftman will work to produce the assigned resources, all produced materials will be delivered on the new moon each month.`,
    },
    job_craftsman2: {
        'en-us': `Craftman will work to produce the assigned resources, all produced materials will be delivered on the new moon and full moon each month.`,
    },
    event_dna: {
        'en-us': `Some DNA molecules have replicated, you gain %0 DNA.`,
    },
    event_rna: {
        'en-us': `A meteor has impacted the planet bringing new genetic material with it, gained %0 RNA.`,
    },
    event_inspiration: {
        'en-us': `Your scientists have become inspired, gain %0 Knowledge.`,
    },
    event_fire: {
        'en-us': `A fire has broken out destroying %0 lumber.`,
    },
    event_raid1: {
        'en-us': `An attack by a rival city has been repelled, %0 soldiers were killed and %1 soldiers were wounded.`,
    },
    event_raid2: {
        'en-us': `Your city was raided, \$%0 was stolen, %1 soldiers were killed and %2 soldiers were wounded.`,
    },
    event_terrorist1: {
        'en-us': `%0 soldiers were wounded by a terrorist attack against your security forces.`,
    },
    event_terrorist2: {
        'en-us': `%0 soldiers were wounded and %1 soldiers were killed by a terrorist attack against your security forces.`,
    },
    event_doom: {
        'en-us': `A portal to hell was accidently opened on %0, a lone space marine wearing green armor somehow managed to stop the demonic invasion.`,
    },
    event_ruins: {
        'en-us': `An ancient cache of resources has been discovered.`,
    },
    event_tax_revolt: {
        'en-us': `Riots have broken out due to the excessively high taxes, widespread damage has resulted in the loss of some resources.`,
    },
    evo_rna: {
        'en-us': `Creates %0 RNA`,
    },
    evo_dna_title: {
        'en-us': `Form DNA`,
    },
    evo_dna_desc: {
        'en-us': `Creates a new strand of DNA`,
    },
    evo_dna_effect: {
        'en-us': `Turn 2 RNA into 1 DNA`,
    },
    evo_membrane_title: {
        'en-us': `Membrane`,
    },
    evo_membrane_desc: {
        'en-us': `Evolve Membranes`,
    },
    evo_membrane_effect: {
        'en-us': `Increases RNA capacity by %0`,
    },
    evo_organelles_title: {
        'en-us': `Organelles`,
    },
    evo_organelles_desc: {
        'en-us': `Evolve Organelles`,
    },
    evo_organelles_effect: {
        'en-us': `Automatically generate %0 RNA`,
    },
};
