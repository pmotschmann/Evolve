import { global } from './vars.js';

let strings;
getString(global.settings.locale);

export function loc(key, variables) {
    let string = strings[key];
    if (!string) {
        console.error(`string ${key} not found`);
        console.log(strings);
    }
    if (variables) {
        if(variables instanceof Array) {
            for (let i = 0; i < variables.length; i++) {
                string = string.replace(`%${i}`, variables[i]);
            }
        }
        else{
            throw TypeError('"variables" need be a instance of "Array"');
        }
    }
    return string;
}

function getString(locale) {
    $.ajaxSetup({ async: false });

    let defaultString;
    let localeString;
    $.getJSON("strings/strings.json", (data) => { defaultString = data; });
    const defSize = defaultString.length;
    try {
        $.getJSON(`strings/strings.${locale}.json`, (data) => { localeString = data; })
    }
    catch (e) {
        if (locale != 'en-US') {
            console.error(e,e.stack);
        }
    }

    $.ajaxSetup({ async: true });

    if (localeString) {
        Object.assign(defaultString, localeString);
    }

    if(defaultString.length != defSize){
        console.error(`string.${locale}.json has extra keys.`);
    }

    strings = defaultString;
}

export const locales = {
    'en-US': 'English (US)',
    //'es-US': 'Spanish (US/Latin-America)',
    //'pt-BR': 'Português Brasileiro',
};
