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
