import { global, vues, poppers, messageQueue, keyMultiplier, modRes } from './vars.js';

export function renderFortress(){
    $(`#hellDim`).empty();
    if (global.tech['portal'] && global.tech['portal'] >= 2){
        $(`#hellDim`).append($(`<div>The cake is a lie</div>`));
    }
}