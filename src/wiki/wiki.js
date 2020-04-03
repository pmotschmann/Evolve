import {} from './../vars.js';
import { loc } from './../locale.js';
import {} from './../achieve.js';
import {} from './../functions.js';
import { races } from './../races.js';

$('body').empty();

initPage();

function initPage(){
    var wiki = $(`<div></div>`);
    $('body').append(wiki);

    Object.keys(races).forEach(function (race){
        if (race === 'custom'){
            return;
        }
        wiki.append(`<div>${races[race].name}</div>`);
    });
}

