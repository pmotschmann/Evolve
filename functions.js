import { global, vues, save } from './vars.js';
import { loc } from './locale.js';
import { races } from './races.js';

export function mainVue(){
    let settings = {
        el: '#mainColumn div:first-child',
        data: { 
            s: global.settings,
            rq: global.r_queue
        },
        methods: {
            lChange(){
                global.settings.locale = $('#localization select').children("option:selected").val();
                save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                window.location.reload();
            },
            dark(){
                global.settings.theme = 'dark';
                $('html').removeClass();
                $('html').addClass('dark');
            },
            light(){
                global.settings.theme = 'light';
                $('html').removeClass();
                $('html').addClass('light');
            },
            night(){
                global.settings.theme = 'night';
                $('html').removeClass();
                $('html').addClass('night');
            },
            redgreen(){
                global.settings.theme = 'redgreen';
                $('html').removeClass();
                $('html').addClass('redgreen');
            },
            keys(){
                return loc('settings1');
            },
            animation(){
                return loc('settings2');
            },
            hard(){
                return loc('settings3');
            },
            soft(){
                return loc('settings4');
            },
            remove(index){
                global.r_queue.queue.splice(index,1);
            }
        },
        filters: {
            namecase(name){
                return name.replace(/(?:^|\s)\w/g, function(match) {
                    return match.toUpperCase();
                });
            },
            label(lbl){
                switch (lbl){
                    case 'city':
                        if (global.resource[global.race.species]){
                            if (global.resource[global.race.species].amount <= 5){
                                return loc('tab_city1');
                            }
                            else if (global.resource[global.race.species].amount <= 20){
                                return loc('tab_city2');
                            }
                            else if (global.resource[global.race.species].amount <= 75){
                                return loc('tab_city3');
                            }
                            else if (global.resource[global.race.species].amount <= 250){
                                return loc('tab_city4');
                            }
                            else if (global.resource[global.race.species].amount <= 600){
                                return loc('tab_city5');
                            }
                            else if (global.resource[global.race.species].amount <= 1200){
                                return loc('tab_city6');
                            }
                            else if (global.resource[global.race.species].amount <= 2500){
                                return loc('tab_city7');
                            }
                            else {
                                return loc('tab_city8');
                            }
                        }
                        else {
                            return loc('tab_city1');
                        }
                    case 'local_space':
                        return loc('sol_system',[races[global.race.species].name]);
                    case 'old':
                        return loc('tab_old_res');
                    case 'new':
                        return loc('tab_new_res');
                    case 'old_sr':
                        return loc('tab_old_sr_res');
                    case 'new_sr':
                        return loc('tab_new_sr_res');
                    default:
                        return loc(lbl);
                }
            }
        }
    }
    vues['vue_tabs'] = new Vue(settings);
}
