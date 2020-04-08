import { poppers } from './../vars.js';
import { clearElement } from './../functions.js';

export function popover(id,content,is_wide){
    $('#'+id).on('mouseover',function(){
        let wide = is_wide ? ' wide' : '';
        var popper = $(`<div id="pop${id}" class="popper${wide} has-background-light has-text-dark pop-desc"></div>`);
        $(`#main`).append(popper);
        popper.append(content);
        popper.show();
        poppers[id] = new Popper($('#'+id),popper);
    });
    $('#'+id).on('mouseout',function(){
        $(`#pop${id}`).hide();
        if (poppers[id]){
            poppers[id].destroy();
        }
        clearElement($(`#pop${id}`),true);
    });
}

export function actionDesc(info, c_action, extended){
    let title = typeof c_action.title === 'string' ? c_action.title : c_action.title();
    if (extended){
        info.append(`<div class="type"><h2 class="has-text-warning">${title}</h2><span class="has-text-caution">${extended}</span></div>`);
    }
    else {
        info.append(`<div class="type"><h2 class="has-text-warning">${title}</h2></div>`);
    }

    let desc = typeof c_action.desc === 'string' ? c_action.desc : c_action.desc();
    if (desc !== title){
        info.append(`<div class="desc">${desc}</div>`);
    }

    if (c_action.hasOwnProperty('effect')){
        let effect = typeof c_action.effect === 'string' ? c_action.effect : c_action.effect();
        info.append(`<div class="desc">${effect}</div>`);
    }
}
