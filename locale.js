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
};
