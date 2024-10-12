import { global } from './vars.js';
import { loc } from './locale.js';
import { clearElement, easterEgg } from './functions.js';

export function setWeather(){
    // Moon Phase
    switch(global.city.calendar.moon){
        case 0:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-crescent-1')
                : $('#moon').removeClass('wi-moon-waning-crescent-6');
            $('#moon').addClass('wi-moon-new');
            break;
        case 1:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-crescent-2')
                : $('#moon').removeClass('wi-moon-new');
            $('#moon').addClass('wi-moon-waxing-crescent-1');
            break;
        case 2:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-crescent-3')
                : $('#moon').removeClass('wi-moon-waxing-crescent-1');
            $('#moon').addClass('wi-moon-waxing-crescent-2');
            break;
        case 3:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-crescent-4')
                : $('#moon').removeClass('wi-moon-waxing-crescent-2');
            $('#moon').addClass('wi-moon-waxing-crescent-3');
            break;
        case 4:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-crescent-5')
                : $('#moon').removeClass('wi-moon-waxing-crescent-3');
            $('#moon').addClass('wi-moon-waxing-crescent-4');
            break;
        case 5:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-crescent-6')
                : $('#moon').removeClass('wi-moon-waxing-crescent-4');
            $('#moon').addClass('wi-moon-waxing-crescent-5');
            break;
        case 6:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-first-quarter')
                : $('#moon').removeClass('wi-moon-waxing-crescent-5');
            $('#moon').addClass('wi-moon-waxing-crescent-6');
            break;
        case 7:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-gibbous-1')
                : $('#moon').removeClass('wi-moon-waxing-crescent-6');
            $('#moon').addClass('wi-moon-first-quarter');
            break;
        case 8:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-gibbous-2')
                : $('#moon').removeClass('wi-moon-first-quarter');
            $('#moon').addClass('wi-moon-waxing-gibbous-1');
            break;
        case 9:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-gibbous-3')
                : $('#moon').removeClass('wi-moon-waxing-gibbous-1');
            $('#moon').addClass('wi-moon-waxing-gibbous-2');
            break;
        case 10:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-gibbous-4')
                : $('#moon').removeClass('wi-moon-waxing-gibbous-2');
            $('#moon').addClass('wi-moon-waxing-gibbous-3');
            break;
        case 11:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-gibbous-5')
                : $('#moon').removeClass('wi-moon-waxing-gibbous-3');
            $('#moon').addClass('wi-moon-waxing-gibbous-4');
            break;
        case 12:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-gibbous-6')
                : $('#moon').removeClass('wi-moon-waxing-gibbous-4');
            $('#moon').addClass('wi-moon-waxing-gibbous-5');
            break;
        case 13:
            clearElement($('#moon'));
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-full')
                : $('#moon').removeClass('wi-moon-waxing-gibbous-5');
            $('#moon').addClass('wi-moon-waxing-gibbous-6');
            break;
        case 14:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-gibbous-1')
                : $('#moon').removeClass('wi-moon-waxing-gibbous-6');
            let egg = easterEgg(2);
            if (egg.length > 0){
                $('#moon').append(egg);
            }
            else {
                $('#moon').addClass('wi-moon-full');
            }
            break;
        case 15:
            clearElement($('#moon'));
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-gibbous-2')
                : $('#moon').removeClass('wi-moon-full');
            $('#moon').addClass('wi-moon-waning-gibbous-1');
            break;
        case 16:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-gibbous-3')
                : $('#moon').removeClass('wi-moon-waning-gibbous-1');
            $('#moon').addClass('wi-moon-waning-gibbous-2');
            break;
        case 17:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-gibbous-4')
                : $('#moon').removeClass('wi-moon-waning-gibbous-2');
            $('#moon').addClass('wi-moon-waning-gibbous-3');
            break;
        case 18:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-gibbous-5')
                : $('#moon').removeClass('wi-moon-waning-gibbous-3');
            $('#moon').addClass('wi-moon-waning-gibbous-4');
            break;
        case 19:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-gibbous-6')
                : $('#moon').removeClass('wi-moon-waning-gibbous-4');
            $('#moon').addClass('wi-moon-waning-gibbous-5');
            break;
        case 20:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-third-quarter')
                : $('#moon').removeClass('wi-moon-waning-gibbous-5');
            $('#moon').addClass('wi-moon-waning-gibbous-6');
            break;
        case 21:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-crescent-1')
                : $('#moon').removeClass('wi-moon-waning-gibbous-6');
            $('#moon').addClass('wi-moon-third-quarter');
            break;
        case 22:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-crescent-2')
                : $('#moon').removeClass('wi-moon-third-quarter');
            $('#moon').addClass('wi-moon-waning-crescent-1');
            break;
        case 23:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-crescent-3')
                : $('#moon').removeClass('wi-moon-waning-crescent-1');
            $('#moon').addClass('wi-moon-waning-crescent-2');
            break;
        case 24:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-crescent-4')
                : $('#moon').removeClass('wi-moon-waning-crescent-2');
            $('#moon').addClass('wi-moon-waning-crescent-3');
            break;
        case 25:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-crescent-5')
                : $('#moon').removeClass('wi-moon-waning-crescent-3');
            $('#moon').addClass('wi-moon-waning-crescent-4');
            break;
        case 26:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-crescent-6')
                : $('#moon').removeClass('wi-moon-waning-crescent-4');
            $('#moon').addClass('wi-moon-waning-crescent-5');
            break;
        case 27:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-new')
                : $('#moon').removeClass('wi-moon-waning-crescent-5');
            $('#moon').addClass('wi-moon-waning-crescent-6');
            break;
    }

    // Temp
    $('#temp').removeClass('wi-thermometer');
    $('#temp').removeClass('wi-thermometer-exterior');
    if (global.city.calendar.temp === 0){
        $('#temp').addClass('wi-thermometer-exterior');
    }
    else if (global.city.calendar.temp === 2){
        $('#temp').addClass('wi-thermometer');
    }

    // Sky
    $('#weather').removeClass('wi-day-sunny');
    $('#weather').removeClass('wi-day-windy');
    $('#weather').removeClass('wi-cloud');
    $('#weather').removeClass('wi-cloudy-gusts');
    $('#weather').removeClass('wi-rain');
    $('#weather').removeClass('wi-storm-showers');
    $('#weather').removeClass('wi-snow');
    $('#weather').removeClass('wi-snow-wind');

    let weather;
    if (global.city.calendar.weather === 0){
        if (global.city.calendar.temp === 0){
            weather = global.city.calendar.wind === 0 ? 'wi-snow' : 'wi-snow-wind';
        }
        else {
            weather = global.city.calendar.wind === 0 ? 'wi-rain' : 'wi-storm-showers';
        }
    }
    else if (global.city.calendar.weather === 1){
        weather = global.city.calendar.wind === 0 ? 'wi-cloud' : 'wi-cloudy-gusts';
    }
    else if (global.city.calendar.weather === 2){
        weather = global.city.calendar.wind === 0 ? 'wi-day-sunny' : 'wi-day-windy';
    }
    $('#weather').addClass(weather);
}

export function seasonDesc(type){
    switch (type){
        case 'moon':
            return moonDescription();
        case 'weather':
            return weatherDescription();
        case 'temp':
            return tempDescription();
        case 'sign':
            return astrologyDescription();
        case 'astrology':
            return astrologySymbol();
    }
}

function moonDescription(){
    if (global.race['orbit_decayed']){
        return loc('moon0'); // New Moon
    }
    else if (global.city.calendar.moon === 0){
        return loc('moon1'); // New Moon
    }
    else if (global.city.calendar.moon > 0 && global.city.calendar.moon < 7){
        return loc('moon2'); // Waxing Crescent Moon
    }
    else if (global.city.calendar.moon === 7){
        return loc('moon3'); // First Quarter Moon
    }
    else if (global.city.calendar.moon > 7 && global.city.calendar.moon < 14){
        return loc('moon4'); // Waxing Gibbous Moon
    }
    else if (global.city.calendar.moon === 14){
        return loc('moon5'); // Full Moon
    }
    else if (global.city.calendar.moon > 14 && global.city.calendar.moon < 21){
        return loc('moon6'); // Waning Gibbous Moon
    }
    else if (global.city.calendar.moon === 21){
        return loc('moon7'); // Third Quarter Moon
    }
    else if (global.city.calendar.moon > 21){
        return loc('moon8'); // Waning Crescent Moon
    }
}

function weatherDescription(){
    switch(global.city.calendar.weather){
        case 0:
            if (global.city.calendar.temp === 0){
                return global.city.calendar.wind === 1 ? loc('snowstorm') : loc('snow');
            }
            else {
                return global.city.calendar.wind === 1 ? loc('thunderstorm') : loc('rain');
            }
        case 1:
            return global.city.calendar.wind === 1 ? loc('cloudy_windy') : loc('cloudy');
        case 2:
            return global.city.calendar.wind === 1 ? loc('sunny_windy') : loc('sunny');
    }
}

function tempDescription(){
    switch(global.city.calendar.temp){
        case 0:
            return loc('cold');// weather, cold weather may reduce food output.';
        case 1:
            return loc('moderate');
        case 2:
            return loc('hot');// weather, hot weather may reduce worker productivity.';
    }
}

export function astroVal(sign){
    switch (sign){
        case 'aries': // Combat Rating
            return [10];
        case 'taurus': // Unification Bonus
            return [2];
        case 'gemini': // Knowledge
            return [20];
        case 'cancer': // Soldier Healing
            return [5];
        case 'leo': // Power
            return [4];
        case 'virgo': // Food Bonus
            return [15];
        case 'libra': // Pop growth rate
            return [25];
        case 'scorpio': // Cheaper and more effective spies
            return [12,1];
        case 'sagittarius': // Entertainer Morale
            return [5];
        case 'capricorn': // Trade gains
            return [10];
        case 'aquarius': // Boosts tourism revenue
            return [20];
        case 'pisces': // Random Events are more common
            return [49,25];
    }
}

export function astrologySign(){
    const date = new Date();
    if ((date.getMonth() === 0 && date.getDate() >= 20) || (date.getMonth() === 1 && date.getDate() <= 18)){
        return 'aquarius';
    }
    else if ((date.getMonth() === 1 && date.getDate() >= 19) || (date.getMonth() === 2 && date.getDate() <= 20)){
        return 'pisces';
    }
    else if ((date.getMonth() === 2 && date.getDate() >= 21) || (date.getMonth() === 3 && date.getDate() <= 19)){
        return 'aries';
    }
    else if ((date.getMonth() === 3 && date.getDate() >= 20) || (date.getMonth() === 4 && date.getDate() <= 20)){
        return 'taurus';
    }
    else if ((date.getMonth() === 4 && date.getDate() >= 21) || (date.getMonth() === 5 && date.getDate() <= 21)){
        return 'gemini';
    }
    else if ((date.getMonth() === 5 && date.getDate() >= 22) || (date.getMonth() === 6 && date.getDate() <= 22)){
        return 'cancer';
    }
    else if ((date.getMonth() === 6 && date.getDate() >= 23) || (date.getMonth() === 7 && date.getDate() <= 22)){
        return 'leo';
    }
    else if ((date.getMonth() === 7 && date.getDate() >= 23) || (date.getMonth() === 8 && date.getDate() <= 22)){
        return 'virgo';
    }
    else if ((date.getMonth() === 8 && date.getDate() >= 23) || (date.getMonth() === 9 && date.getDate() <= 22)){
        return 'libra';
    }
    else if ((date.getMonth() === 9 && date.getDate() >= 23) || (date.getMonth() === 10 && date.getDate() <= 22)){
        return 'scorpio';
    }
    else if ((date.getMonth() === 10 && date.getDate() >= 23) || (date.getMonth() === 11 && date.getDate() <= 21)){
        return 'sagittarius';
    }
    else if ((date.getMonth() === 11 && date.getDate() >= 22) || (date.getMonth() === 0 && date.getDate() <= 19)){
        return 'capricorn';
    }
    else {
        return 'time itself is broken';
    }
}

function astrologyDescription(){
    let sign = astrologySign();
    let desc = `<div>${loc(`sign_description`,[loc(`sign_${sign}`),loc(`sign_${sign}_desc`)])}</div>`;
    desc += `<div>${astroEffect(sign)}</div>`;
    return desc;
}

function astroEffect(sign){
    if (sign === 'pisces' || sign === 'cancer'){
        return loc(`sign_${sign}_effect`);
    }
    else {
        return loc(`sign_${sign}_effect`,[astroVal(sign)[0]]);
    }
}

function astrologySymbol(){
    let sign = astrologySign();
    return loc(`sign_${sign}_symbol`);
}
