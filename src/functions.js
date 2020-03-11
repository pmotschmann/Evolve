import { global, save } from './vars.js';
import { loc } from './locale.js';
import { races } from './races.js';

export function mainVue(){
    vBind({
        el: '#mainColumn div:first-child',
        data: { 
            s: global.settings,
            rq: global.r_queue
        },
        methods: {
            saveImport(){
                if ($('#importExport').val().length > 0){
                    importGame($('#importExport').val());
                }
            },
            saveExport(){
                $('#importExport').val(exportGame());
                $('#importExport').select();
                document.execCommand('copy');
            },
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
            si(){
                global.settings.affix = 'si';
            },
            sci(){
                global.settings.affix = 'sci';
            },
            sln(){
                global.settings.affix = 'sln';
            },
            icon(icon){
                global.settings.icon = icon;
                save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                window.location.reload();
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
            city(){
                return loc('settings5');
            },
            tech(){
                return loc('settings9');
            },
            qKey(){
                return loc('settings6');
            },
            qAny(){
                return loc('settings7');
            },
            expose(){
                return loc('settings8');
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
    });
}

window.exportGame = function exportGame(){
    return LZString.compressToBase64(JSON.stringify(global));
}

window.importGame = function importGame(data){
    let saveState = JSON.parse(LZString.decompressFromBase64(data));
    if (saveState && 'evolution' in saveState && 'settings' in saveState && 'stats' in saveState && 'plasmid' in saveState.stats){
        global = saveState;
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        window.location.reload();
    }
}

export function messageQueue(msg,color){
    color = color || 'warning';
    var new_message = $('<p class="has-text-'+color+'">'+msg+'</p>');
    $('#msgQueue').prepend(new_message);
    global.lastMsg = { m: msg, c: color };
    if ($('#msgQueue').children().length > 30){
        $('#msgQueue').children().last().remove();
    }
}

export function modRes(res,val){
    let count = global.resource[res].amount + val;
    let success = true;
    if (count > global.resource[res].max && global.resource[res].max != -1){
        count = global.resource[res].max;
    }
    else if (count < 0){
        count = 0;
        success = false;
    }
    if (!Number.isNaN(count)){
        global.resource[res].amount = count;
        global.resource[res].delta += val;
    }
    return success;
}

export function genCivName(){
    let genus = races[global.race.species].type;
    switch (genus){
        case 'animal':
            genus = 'animalism';
            break;
        case 'small':
            genus = 'dwarfism';
            break;
        case 'giant':
            genus = 'gigantism';
            break;
        case 'avian':
        case 'reptilian':
            genus = 'eggshell';
            break;
        case 'fungi':
            genus = 'chitin';
            break;
        case 'insectoid':
            genus = 'athropods';
            break;
        case 'angelic':
            genus = 'celestial';
            break;
        case 'organism':
            genus = 'sentience';
            break;
    }

    const filler = [
        races[global.race.species].name,
        races[global.race.species].home,
        loc(`biome_${global.city.biome}_name`),
        loc(`evo_${genus}_title`),
        loc(`civics_gov_name0`),
        loc(`civics_gov_name1`),
        loc(`civics_gov_name2`),
        loc(`civics_gov_name3`),
        loc(`civics_gov_name4`),
        loc(`civics_gov_name5`),
    ];

    return {
        s0: Math.rand(0,6),
        s1: filler[Math.rand(0,10)]
    };
}

export function costMultiplier(structure,offset,base,mutiplier,cat){
    if (!cat){
        cat = 'city';
    }
    if (global.race.universe === 'micro'){
        let dark = 0.02 + (Math.log(100 + global.race.Dark.count) - 4.605170185988092) / 20;
        if (dark > 0.06){
            dark = 0.06;
        }
        mutiplier -= +(dark).toFixed(5);
    }
    if (global.race['small']){ mutiplier -= 0.01; }
    else if (global.race['large']){ mutiplier += 0.01; }
    if (global.race['compact']){ mutiplier -= 0.02; }
    if (global.race['tunneler'] && (structure === 'mine' || structure === 'coal_mine')){ mutiplier -= 0.01; }
    if (global.tech['housing_reduction'] && (structure === 'basic_housing' || structure === 'cottage')){
        mutiplier -= global.tech['housing_reduction'] * 0.02;
    }
    if (structure === 'basic_housing'){
        if (global.race['solitary']){
            mutiplier -= 0.02;
        }
        if (global.race['pack_mentality']){
            mutiplier += 0.03;
        }
    }
    if (structure === 'cottage'){
        if (global.race['solitary']){
            mutiplier += 0.02;
        }
        if (global.race['pack_mentality']){
            mutiplier -= 0.02;
        }
    }
    if (structure === 'apartment'){
        if (global.race['pack_mentality']){
            mutiplier -= 0.02;
        }
    }
    if (global.genes['creep'] && !global.race['no_crispr']){
        mutiplier -= global.genes['creep'] * 0.01;
    }
    else if (global.genes['creep'] && global.race['no_crispr']){
        mutiplier -= global.genes['creep'] * 0.002;
    }
    if (mutiplier < 0.01){
        mutiplier = 0.01;
    }
    var count = global[cat][structure] ? global[cat][structure].count : 0;
    if (offset){
        count += offset;
    }
    return Math.round((mutiplier ** count) * base);
}

export function spaceCostMultiplier(action,offset,base,mutiplier,sector){
    if (!sector){
        sector = 'space';
    }
    if (global.race.universe === 'micro'){
        let dark = 0.01 + (Math.log(100 + global.race.Dark.count) - 4.605170185988092) / 35;
        if (dark > 0.04){
            dark = 0.04;
        }
        mutiplier -= +(dark).toFixed(5);
    }
    if (global.genes['creep'] && !global.race['no_crispr']){
        mutiplier -= global.genes['creep'] * 0.01;
    }
    else if (global.genes['creep'] && global.race['no_crispr']){
        mutiplier -= global.genes['creep'] * 0.002;
    }
    if (global.race['small']){ mutiplier -= 0.005; }
    if (global.race['compact']){ mutiplier -= 0.01; }
    if (mutiplier < 0.01){
        mutiplier = 0.01;
    }
    var count = global[sector][action] ? global[sector][action].count : 0;
    if (offset){
        count += offset;
    }
    return Math.round((mutiplier ** count) * base);
}

export function timeCheck(c_action,track,detailed){
    if (c_action.cost){
        let time = 0;
        let bottleneck = false;
        let costs = adjustCosts(c_action.cost);
        Object.keys(costs).forEach(function (res){
            if (res !== 'Morale'){
                var testCost = track && track.id[c_action.id] ? Number(costs[res](track.id[c_action.id])) : Number(costs[res]());
                if (testCost > 0){
                    let res_have = Number(global.resource[res].amount);
                    if (track){
                        res_have += global.resource[res].diff * track.t;
                        if (track.r[res]){
                            res_have -= Number(track.r[res]);
                            track.r[res] += testCost;
                        }
                        else {
                            track.r[res] = testCost;
                        }
                        if (global.resource[res].max >= 0 && res_have > global.resource[res].max){
                            res_have = global.resource[res].max;
                        }
                    }
                    if (testCost > res_have){
                        if (global.resource[res].diff > 0){
                            let r_time = (testCost - res_have) / global.resource[res].diff;
                            if (r_time > time){
                                bottleneck = res;
                                time = r_time;
                            }
                        }
                        else {
                            time = -9999999;
                        }
                    }
                }
            }
        });
        if (track){
            if (typeof track.id[c_action.id] === "undefined"){
                track.id[c_action.id] = 1;
            }
            else {
                track.id[c_action.id]++;
            }
            track.t += time;
        }
        return detailed ? { t: time, r: bottleneck } : time;
    }
    else {
        return 0;
    }
}

export function clearElement(elm,remove){
    elm.find('.vb').each(function(){
        try {
            $(this)[0].__vue__.$destroy();
        }
        catch(e){}
    });
    if (remove){
        elm.remove();
    }
    else {
        elm.empty();
    }
}

export function vBind(bind,action){
    action = action || 'create';
    if ($(bind.el).length > 0 && typeof $(bind.el)[0].__vue__ !== "undefined"){
        try {
            if (action === 'update'){
                $(bind.el)[0].__vue__.$forceUpdate();
            }
            else {
                $(bind.el)[0].__vue__.$destroy();
            }
        }
        catch(e){}
    }
    if (action === 'create'){
        new Vue(bind);
        $(bind.el).addClass('vb');
    }
}

export function timeFormat(time){
    let formatted;
    if (time < 0){
        formatted = loc('time_never');
    }
    else {
        time = +(time.toFixed(0));
        if (time > 60){
            let secs = time % 60;
            let mins = (time - secs) / 60;
            if (mins >= 60){
                let r = mins % 60;
                let hours = (mins - r) / 60;
                if (hours > 24){
                    r = hours % 24;
                    let days = (hours - r) / 24;
                    formatted = `${days}d ${r}h`;
                }
                else {
                    formatted = `${hours}h ${r}m`;
                }
            }
            else {
                formatted = `${mins}m ${secs}s`;
            }
        }
        else {
            formatted = `${time}s`;
        }
    }
    return formatted;
}

export function powerModifier(energy){
    if (global.race.universe === 'antimatter'){
        energy *= 1 + (Math.log(50 + global.race.Dark.count) - 3.912023005428146) / 5;
        energy = +energy.toFixed(2);
    }
    return energy;
}

export function challenge_multiplier(value,type,decimals){
    decimals = decimals || 0;
    let challenge_level = 0;
    if (global.race['no_plasmid']){ challenge_level++; }
    if (global.race['no_trade']){ challenge_level++; }
    if (global.race['no_craft']){ challenge_level++; }
    if (global.race['no_crispr']){ challenge_level++; }
    if (global.race['weak_mastery']){ challenge_level++; }
    if (global.race.universe === 'micro'){ value = value * 0.25; }
    if (global.race.universe === 'heavy' && type !== 'mad'){
        switch (challenge_level){
            case 1:
                value = value * 1.1;
                break;
            case 2:
                value = value * 1.15;
                break;
            case 3:
                value = value * 1.2;
                break;
            case 4:
                value = value * 1.25;
                break;
            default:
                value = value * 1.05;
                break;
        }
    }
    switch (challenge_level){
        case 1:
            return +(value * 1.05).toFixed(decimals);
        case 2:
            return +(value * 1.12).toFixed(decimals);
        case 3:
            return +(value * 1.25).toFixed(decimals);
        case 4:
            return +(value * 1.45).toFixed(decimals);
        default:
            return +(value).toFixed(decimals);
    }
}

export function adjustCosts(costs){
    if ((costs['RNA'] || costs['DNA']) && global.genes['evolve']){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'RNA' || res === 'DNA'){
                newCosts[res] = function(){ return Math.round(costs[res]() * 0.8); }
            }
        });
        return newCosts;
    }
    costs = technoAdjust(costs);
    costs = kindlingAdjust(costs);
    costs = scienceAdjust(costs);
    costs = rebarAdjust(costs);
    return craftAdjust(costs);
}

function technoAdjust(costs){
    if (global.civic.govern.type === 'technocracy'){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Knowledge'){
                newCosts[res] = function(){ return Math.round(costs[res]() * 0.92); }
            }
            else if (res === 'Money'){
                newCosts[res] = function(){ return costs[res](); }
            }
            else {
                newCosts[res] = function(){ return Math.round(costs[res]() * 1.02); }
            }
        });
        return newCosts;
    }
    return costs;
}

function scienceAdjust(costs){
    if ((global.race['smart'] || global.race['dumb']) && costs['Knowledge']){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Knowledge'){
                newCosts[res] = function(){ return Math.round(costs[res]() * (global.race['smart'] ? 0.9 : 1.05)); }
            }
            else {
                newCosts[res] = function(){ return costs[res](); }
            }
        });
        return newCosts;
    }
    return costs;
}

function kindlingAdjust(costs){
    if (global.race['kindling_kindred'] && (costs['Lumber'] || costs['Plywood'])){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res !== 'Lumber' && res !== 'Plywood'){
                newCosts[res] = function(){ return Math.round(costs[res]() * 1.05) || 0; }
            }
        });
        return newCosts;
    }
    return costs;
}

function craftAdjust(costs){
    if (global.race['hollow_bones'] && (costs['Plywood'] || costs['Brick'] || costs['Wrought_Iron'] || costs['Sheet_Metal'] || costs['Mythril'])){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Plywood' || res === 'Brick' || res === 'Wrought_Iron' || res === 'Sheet_Metal' || res === 'Mythril'){
                newCosts[res] = function(){ return Math.round(costs[res]() * 0.95); }
            }
            else {
                newCosts[res] = function(){ return Math.round(costs[res]()); }
            }
        });
        return newCosts;
    }
    return costs;
}

function rebarAdjust(costs){
    if (costs['Cement'] && global.tech['cement'] && global.tech['cement'] >= 2){
        let discount = global.tech['cement'] >= 3 ? 0.8 : 0.9;
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Cement'){
                newCosts[res] = function(){ return Math.round(costs[res]() * discount) || 0; }
            }
            else {
                newCosts[res] = function(){ return Math.round(costs[res]()); }
            }
        });
        return newCosts;
    }
    return costs;
}

export function svgIcons(icon){
    switch (icon){
        case 'star':
            return `<path class="star" d="M320.012 15.662l88.076 215.246L640 248.153 462.525 398.438l55.265 225.9-197.778-122.363-197.778 122.363 55.264-225.9L0 248.153l231.936-17.245z"/>`;
        case 'atom':
            return `<path class="atom" d="m100 44.189c0-6.796-10.63-11.822-24.783-14.529 1.155-3.322 2.105-6.538 2.764-9.541 2.193-10.025 1.133-16.856-2.981-19.231-1.019-0.588-2.193-0.888-3.49-0.888-5.62 0-13.46 5.665-21.509 15-8.046-9.335-15.886-15-21.511-15-1.294 0-2.47 0.3-3.491 0.888-5.891 3.4-4.918 15.141-0.175 28.767-14.173 2.701-24.824 7.731-24.824 14.534 0 6.799 10.634 11.822 24.79 14.531-1.161 3.323-2.11 6.536-2.767 9.539-2.194 10.027-1.136 16.857 2.976 19.231 1.021 0.589 2.197 0.886 3.491 0.886 5.625 0 13.464-5.667 21.511-14.998 8.047 9.331 15.886 15 21.509 15 1.297 0 2.472-0.299 3.49-0.888 4.114-2.374 5.174-9.204 2.98-19.231-0.658-3.003-1.608-6.216-2.766-9.539 14.156-2.708 24.786-7.732 24.786-14.531zm-28.49-41.605c0.838 0 1.579 0.187 2.199 0.543 3.016 1.741 3.651 7.733 1.747 16.44-0.661 3.022-1.628 6.264-2.814 9.63-4.166-0.695-8.585-1.194-13.096-1.49-2.572-3.887-5.206-7.464-7.834-10.67 7.581-8.861 14.934-14.453 19.798-14.453zm-9.198 48.71c-1.375 2.379-2.794 4.684-4.242 6.9-2.597 0.132-5.287 0.206-8.069 0.206s-5.474-0.074-8.067-0.206c-1.452-2.217-2.87-4.521-4.242-6.9-1.388-2.406-2.669-4.771-3.849-7.081 1.204-2.369 2.477-4.753 3.851-7.13 1.37-2.377 2.79-4.68 4.24-6.901 2.593-0.131 5.285-0.205 8.067-0.205s5.473 0.074 8.069 0.205c1.448 2.222 2.866 4.524 4.239 6.901 1.37 2.37 2.64 4.747 3.842 7.106-1.202 2.362-2.471 4.739-3.839 7.105zm5.259-4.225c1.587 3.303 3 6.558 4.2 9.72-3.25 0.521-6.758 0.926-10.488 1.203 1.104-1.75 2.194-3.554 3.265-5.404 1.062-1.837 2.059-3.681 3.023-5.519zm-11.277 13.78c-2.068 3.019-4.182 5.854-6.293 8.444-2.109-2.591-4.22-5.426-6.294-8.444 2.095 0.088 4.196 0.138 6.294 0.138 2.099-0.001 4.201-0.05 6.293-0.138zm-17.573-2.857c-3.733-0.277-7.241-0.683-10.49-1.203 1.202-3.157 2.611-6.414 4.197-9.72 0.97 1.858 1.979 3.701 3.026 5.519 1.071 1.85 2.161 3.654 3.267 5.404zm-6.304-16.654c-1.636-3.389-3.046-6.653-4.226-9.741 3.26-0.52 6.781-0.931 10.53-1.212-1.107 1.751-2.197 3.553-3.268 5.407-1.067 1.847-2.065 3.701-3.036 5.546zm11.294-13.805c2.07-3.019 4.181-5.855 6.29-8.449 2.111 2.594 4.225 5.43 6.293 8.449-2.093-0.091-4.194-0.14-6.293-0.14-2.098 0.001-4.199 0.049-6.29 0.14zm20.837 8.259c-1.07-1.859-2.16-3.656-3.265-5.407 3.73 0.281 7.238 0.687 10.488 1.205-1.2 3.157-2.613 6.419-4.2 9.722-0.964-1.838-1.961-3.683-3.023-5.52zm-38.254-32.665c0.619-0.359 1.36-0.543 2.196-0.543 4.864 0 12.217 5.592 19.8 14.453-2.626 3.206-5.262 6.783-7.834 10.67-4.526 0.296-8.962 0.802-13.144 1.5-4.886-13.794-5.036-23.762-1.018-26.08zm-23.709 41.062c0-4.637 8.707-9.493 23.096-12.159 1.487 3.974 3.268 8.069 5.277 12.14-2.061 4.14-3.843 8.229-5.323 12.167-14.364-2.664-23.05-7.516-23.05-12.148zm25.905 41.605c-0.848 0-1.564-0.178-2.196-0.538-3.015-1.742-3.652-7.734-1.746-16.442 0.662-3.023 1.626-6.269 2.814-9.633 4.166 0.696 8.586 1.195 13.092 1.491 2.574 3.885 5.207 7.462 7.834 10.671-7.58 8.86-14.934 14.451-19.798 14.451zm46.962-16.981c1.907 8.708 1.272 14.7-1.743 16.442-0.623 0.355-1.361 0.539-2.199 0.539-4.864 0-12.217-5.592-19.798-14.452 2.628-3.209 5.262-6.786 7.837-10.671 4.508-0.296 8.927-0.795 13.093-1.491 1.186 3.365 2.153 6.61 2.81 9.633zm-1.086-12.475c-1.476-3.933-3.254-8.014-5.31-12.148 2.056-4.135 3.834-8.217 5.312-12.148 14.361 2.665 23.049 7.519 23.049 12.148 0 4.631-8.688 9.483-23.051 12.148z"/><circle cy="44.189" cx="50.001" r="5.492"/>`;
        case 'heavy':
            return `<path class="heavy" d="M0 0h24v24H0z" fill="none"/><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>`;
        case 'evil':
            return `<path class="penta" d="m105.63 236.87c-17.275-2.22-34.678-8.73-49.291-18.44-54.583-36.26-69.355-108.23-33.382-162.64 11.964-18.101 31.389-34.423 51.05-42.899 36.303-15.652 78.013-12.004 110.65 9.678 54.58 36.259 69.36 108.23 33.38 162.65-24.44 36.97-68.62 57.27-112.41 51.65zm9.37-7.17c0-1.12-15.871-50.86-20.804-65.2l-1.719-5-36.926-0.26c-20.309-0.15-37.284 0.09-37.721 0.53-1.104 1.1 4.147 11.87 10.535 21.59 16.439 25.04 41.149 41.59 71.135 47.65 11.07 2.24 15.5 2.44 15.5 0.69zm25.71-0.61c30.52-5.95 55.28-22.38 71.92-47.73 6.39-9.72 11.64-20.49 10.54-21.59-0.44-0.44-17.41-0.68-37.72-0.53l-36.93 0.26-1.72 5c-4.93 14.34-20.8 64.08-20.8 65.2 0 1.77 3.2 1.64 14.71-0.61zm-9.32-38.99c5.25-16.18 9.3-29.79 9.01-30.25-0.28-0.47-9.24-0.85-19.9-0.85s-19.62 0.38-19.9 0.85c-0.46 0.74 17.66 58.14 19.08 60.43 0.3 0.49 0.91 0.52 1.36 0.06s5.11-14.07 10.35-30.24zm-42.19-38.63c0.629-0.63-10.723-36.39-11.936-37.61-0.817-0.81-51.452 35.32-52.097 37.18-0.349 1 63.032 1.43 64.033 0.43zm61.27-20.06c3.65-11.32 6.51-21.41 6.34-22.42-0.32-1.86-34.12-26.99-36.31-26.99s-35.993 25.13-36.308 26.99c-0.169 1.01 2.683 11.1 6.339 22.42l6.647 20.59h46.642l6.65-20.59zm65.36 19.63c-0.64-1.86-51.28-37.99-52.09-37.18-1.22 1.22-12.57 36.98-11.94 37.61 1 1 64.38 0.57 64.03-0.43zm-169.97-24.02c16.09-11.7 29.071-21.78 28.847-22.4-0.397-1.09-12.185-37.499-18.958-58.555-1.846-5.739-3.951-10.632-4.678-10.875-0.727-0.242-4.903 3.259-9.28 7.78-22 22.72-32.81 50.641-31.513 81.39 0.678 16.09 2.371 24.97 4.646 24.37 0.925-0.24 14.846-10.01 30.936-21.71zm183.14 15.73c0.66-3.44 1.44-11.71 1.72-18.39 1.3-30.749-9.51-58.67-31.51-81.39-4.38-4.521-8.55-8.022-9.28-7.78-0.73 0.243-2.83 5.136-4.68 10.875-1.84 5.739-6.93 21.448-11.29 34.908-6.26 19.297-7.68 24.717-6.7 25.627 3.41 3.18 58.29 42.4 59.32 42.4 0.68 0 1.73-2.72 2.42-6.25zm-129.27-54.808c7.573-5.522 13.773-10.467 13.773-10.987 0-1.007-50.318-37.955-51.689-37.955-0.446 0-0.811 0.317-0.811 0.704 0 0.388 3.825 12.484 8.5 26.882s8.5 26.401 8.5 26.674 0.697 2.163 1.548 4.201c1.832 4.389-0.216 5.349 20.179-9.519zm66.613-5.442c3.03-9.35 7.35-22.629 9.59-29.508 4.36-13.403 4.5-13.992 3.26-13.992-1.39 0-51.69 36.953-51.69 37.971 0 1.477 31.75 24.189 32.58 23.309 0.4-0.431 3.22-8.43 6.26-17.78zm-14.4-32.538l29.32-21.329-2.37-1.927c-10.93-8.844-38.4-16.706-58.39-16.706s-47.464 7.862-58.388 16.708l-2.382 1.929 29.885 21.728c16.845 12.25 30.565 21.552 31.435 21.326 0.86-0.22 14.75-9.999 30.89-21.729z"/>`;
        case 'micro':
            return `<path class="micro" d="m150.18 114.71c-11.276-6.0279-15.771-19.766-9.9989-30.563 6.0279-11.276 19.766-15.771 30.563-9.9989 11.276 6.0279 15.771 19.766 9.9989 30.563-6.0279 11.276-19.766 15.771-30.563 9.9989z"/><path d="m47.263 265.24c-0.41891-0.4189-0.76165-5.194-0.76165-10.611 0-11.606 2.7184-18.417 9.0231-22.606 3.8412-2.5527 4.2946-2.5798 43.128-2.5798h39.246v-13.71-13.71h10.905c10.055 0 11.124-0.2186 13.71-2.8043 2.5824-2.5824 2.8043-3.66 2.8043-13.619v-10.815l3.3639-0.73883c1.8501-0.40636 5.1713-2.7395 7.3804-5.1847 8.0637-8.9255 9.8103-25.642 3.9223-37.54l-2.9588-5.9787 5.9675-5.9676c9.887-9.887 12.537-24.129 6.6886-35.949-1.3037-2.635-2.1165-4.7908-1.8062-4.7908 0.31024 0 3.5239 1.798 7.1414 3.9955 14.491 8.8026 26.675 25.759 31.636 44.025 2.7168 10.004 2.7314 30.947 0.0286 41.093-4.445 16.685-15.856 33.364-29.027 42.425l-4.9176 3.3834v7.9424 7.9424h10.966c12.713 0 17.226 1.5998 21.944 7.7794 2.828 3.7038 3.1086 5.033 3.464 16.405l0.4 12.38h-90.737c-49.906 0-91.08-0.34274-91.499-0.76165zm17.518-81.497v-9.1398h45.699 45.699v9.1398 9.1398h-45.699-45.699v-9.1398zm32.227-32.318-4.8078-4.8988v-13.72-13.72l-4.5699-4.4624-4.5699-4.4624v-27.527-27.527l4.5699-4.4624c4.5593-4.452 4.5699-4.4831 4.5699-13.37 0-8.6703-0.07402-8.9079-2.7746-8.9079-4.4514 0-6.3652-2.8757-6.3652-9.5641 0-3.2854 0.61694-6.5904 1.371-7.3445 1.9422-1.9422 50.155-1.9422 52.097 0 0.75403 0.75403 1.371 4.3347 1.371 7.9571 0 6.9911-1.4848 8.9515-6.7797 8.9515-2.1833 0-2.3601 0.66715-2.3601 8.9079 0 8.8872 0.0103 8.9183 4.5699 13.37l4.5699 4.4624v9.5554c0 8.412-0.33908 10-2.8338 13.271-6.443 8.4472-7.9966 20.22-4.0419 30.628 2.2572 5.9405 2.2572 5.9661 0 8.3688-1.997 2.1258-2.2642 4.0244-2.2642 16.094v13.684l-4.8988 4.8078c-4.877 4.7864-4.9369 4.8078-13.472 4.8078h-8.5731l-4.8078-4.8988z"/>`;
        case 'heart':
            return `<g transform="translate(-607.63544,-698.58531)"><path class="star" stroke-linejoin="bevel" d="m617.13,701.11c-1.4819-1.5161-3.8406-2.4136-5.9091-1.5906-3.1802,1.2712-3.8517,4.1218-2.2123,6.797,1.8712,2.8746,4.5334,5.1378,7.2328,7.2307,0.50882,0.48806,1.0416,0.83797,1.5551,0.16685,2.744-2.1002,5.4398-4.3792,7.3689-7.2612,1.8138-3.0332,1.0747-5.4453-1.935-6.8574-2.1226-0.94739-4.5563-0.0556-6.1004,1.5147z" stroke="#333" stroke-linecap="square" stroke-miterlimit="4" stroke-dasharray="none" stroke-width="1"/></g>`;
        case 'candy':
            return `<g transform="translate(-66.38 -391.32)"><path style="stroke-linejoin:round;fill-rule:evenodd;stroke:#000000;stroke-width:5.1638" d="m157.3 429.82c10.05 10.99 5.39 31.63-10.4 46.06s-36.76 17.22-46.8 6.23c-10.051-10.99-5.391-31.63 10.4-46.06 15.72-14.37 36.57-17.21 46.68-6.36l0.12 0.13z"/><path style="fill-rule:evenodd;fill:#ff0000" d="m100.63 448.65c15.97 5.86 28.88 16.17 34.76 36.69l20.79-21.5c-4.54-18.43-16.11-30.05-34.65-34.88l-20.9 19.69z"/><path style="stroke-linejoin:round;stroke:#000000;stroke-width:6;fill:none" d="m157.52 429.78c10.05 10.99 5.39 31.63-10.4 46.06s-36.76 17.22-46.8 6.23c-10.049-11-5.389-31.63 10.4-46.06 15.72-14.37 36.57-17.21 46.68-6.36l0.12 0.13z"/><path style="stroke-linejoin:round;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-width:6;fill:#ff0000" d="m158.25 427.32c10 4.4 25.15 2.18 30.2-3.53-2.58-0.54-5.01-3.15-6.51-6.17-1.58-3.17-0.15-7.29-2.82-9.74-3.06-2.79-7.3-1.26-10.54-2.94-2.85-1.47-3.77-4.59-6.72-8.06-7.07 9.56-6.45 21.01-3.61 30.44z"/><path style="stroke-linejoin:round;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-width:6;fill:#ff0000" d="m102.03 483.87c-9.981-4.45-25.143-2.32-30.23 3.35 2.578 0.56 4.997 3.19 6.478 6.21 1.555 3.18 0.1 7.29 2.76 9.76 3.036 2.81 7.294 1.3 10.521 3 2.84 1.49 3.74 4.62 6.669 8.1 7.132-9.51 6.582-20.97 3.802-30.42z"/></g>`;
        case 'ghost':
            return `<g transform="translate(-155.47 -349.08)"><path style="fill-rule:evenodd;fill-opacity:.23529" d="m173.41 714.4c14.34 14.61 41.61 3.99 64.07 11.77 18.22 6.31 26.89 47.49 48.08 40.02 21.2-7.48 57.12-26.89 80.97-20.3 23.84 6.59 53.55 51.28 72.75 29.46 16.3-18.54 24.1-64.75 64.89-60.09 40.9 4.67 49.73 1.54 44.24-48.91-3.18-29.27 22.2-53.58-12.14-76.31-53.56-35.44-138.73-13.39-190.34 21.28-59.09 39.69-194.07 81.13-172.52 103.08z"/><path style="fill-opacity:.62745" d="m497.32 591.87c0 75.86 35.79 95.42 35.79 130.6 0 19.52-35.4-24.07-55.26-14.2-18.42 9.15-41.11 17.79-64.14 4.16-13.72-8.12 5.41-21.33-21.11-21.33-21.15 0-53.39 13.1-73.56 15.92-18.34 2.56-37.91-14.19-70.27-4.64-20.11 5.94-91.3 48.27-91.3 28.76 0-24.85 33.28-51.93 33.28-139.27 0-84.62 68.67-153.29 153.28-153.29 84.62 0 153.29 68.67 153.29 153.29z" transform="matrix(1 0 0 1.1622 0 -158.65)"/><path style="stroke-linejoin:round;fill-opacity:.62745;stroke:#000000;stroke-linecap:round;stroke-width:3.7104" d="m497.32 591.87c0 75.86 35.79 95.42 35.79 130.6 0 19.52-48.88 5.28-68.74 15.15-18.42 9.15-10.87 22.93-37.4 31.77-19.05 6.36-44.46-22.61-70.98-22.61-21.15 0-60.19 24.42-78.53 16.66s-16.6-33.62-44.95-36.12c-21.16-1.86-75.04 23.33-75.04 3.82 0-24.85 33.28-51.93 33.28-139.27 0-84.62 68.67-153.29 153.28-153.29 84.62 0 153.29 68.67 153.29 153.29z" transform="matrix(1 0 0 1.1622 0 -158.65)"/><path style="stroke-linejoin:round;stroke:#000000;stroke-linecap:round;stroke-width:4;fill:#ffffff" d="m293.5 439.04c-20.56 0-37.25 19.18-37.25 42.8 0 23.63 16.69 42.81 37.25 42.81 15.89 0 29.46-11.47 34.81-27.57 5.35 16.1 18.93 27.57 34.81 27.57 20.57 0 37.26-19.18 37.25-42.81 0-23.62-16.68-42.8-37.25-42.8-15.88 0-29.45 11.43-34.81 27.53-5.35-16.1-18.92-27.53-34.81-27.53z"/><path style="fill:#000000" d="m497.32 591.87a153.29 153.29 0 1 1 -306.57 0 153.29 153.29 0 1 1 306.57 0z" transform="matrix(.10522 0 0 .10565 318.09 426.67)"/><path style="fill:#000000" d="m497.32 591.87a153.29 153.29 0 1 1 -306.57 0 153.29 153.29 0 1 1 306.57 0z" transform="matrix(.10522 0 0 .10565 266.9 426.67)"/><path style="fill-rule:evenodd;fill:#000000;fill-opacity:.11765" d="m444.06 411.72c5.91-2.08 35.6 37.21 41.02 78.49 3.68 28.08 2.12 71.42 6.36 96.17s40.91 88.99 26.16 88.39c-34.65-1.42-56.75-57.15-48.84-136.87 8.92-89.9-38.62-121.27-24.7-126.18z"/><path style="fill-rule:evenodd;fill:#000000;fill-opacity:.11765" d="m458.21 691.03c-8.02 7.86-22.63 45.26-30.41 28.28-7.78-16.97-1.29-47.19-7.07-91.92-4.4-34.02-20.59-74.62-8.68-68.44 11.87 6.17 20.49 24.75 31.31 57.13 9.45 28.3 24.45 65.54 14.85 74.95z"/><path style="fill-rule:evenodd;fill:#000000;fill-opacity:.11765" d="m342.94 700.42c-7.67 8.19-26.44 17.95-35.94 16.1-12.51-2.43-14.44-44.39-9.41-71.66 4.95-26.87 14.48-66.04 22.45-71.92 9.69-7.14 0.7 26.78 9.79 73.41 6.96 35.68 20.6 46.07 13.11 54.07z"/><path style="fill-rule:evenodd;fill:#000000;fill-opacity:.11765" d="m240.42 677.6c-11.11-1.62-21.62 1.14-30.41 3.53-12.3 3.35-0.78-15.15 15.56-47.38 12.35-24.36 15.25-49.48 22.42-56.31 8.53-8.14-2.39 23.7-4.42 54.62-1.88 28.69 5.04 46.73-3.15 45.54z"/><path style="fill-rule:evenodd;fill:#ffffff;fill-opacity:.62745" d="m217.08 459.1c27.34-73.67 79.96-89.14 93.34-88.39 20.33 1.14 14.72 30.62-24.75 41.01-40.23 10.59-82.97 86.14-68.59 47.38z"/></g>`;
        case 'turkey':
            return `<g transform="matrix(.85837 0 0 .89859 166.58 25.737)"><path style="fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-width:2.9179;fill:#ff7400" d="m-115.23 203.63c-6.07 0.61-5.19 8.12-4.92 12.56-0.08 11.77 0.03 23.55 0.17 35.32-9.58-1.26-19.14-3.86-28.69-4.66-5.35 0.65-6.45 9.22-0.66 10.16 3.72 1.31 16.89 1.53 14.3 3.45-8.19 3.73-17.28 6.05-25.11 10.27-4.21 4.12 1.64 11.5 6.72 8.26 10.03-3.82 19.97-7.88 29.97-11.8-0.95 5.45-5.76 10.54-4.75 16.13 2.18 5.65 11.6 4.44 11.78-2.09 2.52-6.53 4.8-13.15 7.25-19.69 8.97-3.99 18.702-6.75 27.406-11.06 4.357-3.37 0.731-10.9-4.687-9.07-7.419 2.66-14.729 5.77-22.029 8.63-0.21-13.77-0.2-27.58-0.16-41.28-0.43-3.17-3.45-5.4-6.59-5.13z"/><g transform="matrix(.85527 .51818 -.51818 .85527 -158.14 -127.38)"><path style="stroke-linejoin:round;stroke:#000000;stroke-linecap:round;stroke-width:4.1369" d="m280.85 64.552c-2.42-10.609-7.01-14.965-9.67-15.061-6.36-0.916-11.61 2.495-17.19 4.549-2.93 1.933-6.85 3.234-6.06 14.207 1.37 10.236 5.1 21.739 8.52 31.843 7.11 20.52 17.16 36.95 23.6 36.1 8.37-0.54 9.47-24.17 5.16-50.362-1.11-6.905-2.58-14.089-4.36-21.276z"/><path style="stroke-linejoin:round;stroke:#000000;stroke-linecap:round;stroke-width:4.1369" d="m304.51 66.941c0.44-10.872-2.85-16.275-5.4-17.061-5.9-2.544-11.86-0.624-17.78-0.097-3.34 1.101-7.45 1.335-9.56 12.133-1.35 10.239-0.75 22.317-0.08 32.961 1.51 21.673 6.92 40.153 13.36 41.013 8.22 1.66 15.45-20.86 18.12-47.273 0.73-6.956 1.19-14.274 1.34-21.676z"/><path style="stroke-linejoin:round;stroke:#000000;stroke-linecap:round;stroke-width:4.1369" d="m326.79 71.713c2.69-10.543 0.6-16.513-1.73-17.813-5.24-3.717-11.47-3.082-17.37-3.8-3.49 0.382-7.57-0.248-11.88 9.875-3.45 9.733-5.38 21.67-6.95 32.22-3.03 21.505-1.59 40.715 4.53 42.895 7.69 3.34 19.45-17.19 27.57-42.458 2.16-6.651 4.13-13.713 5.83-20.919z"/></g><path style="fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-width:2.9179;fill:#ff7400" d="m-25.67 202.94c-6.844 0.91-5.714 9.17-5.187 14.13-0.449 10.71-0.051 21.53-0.344 32.28-8.15-2.59-15.95-7.69-24.469-8.72-6.459 0.78-4.689 10.7 1.219 10.72 7.897 3.67 17.359 5.81 24.287 10.44 3.419 7.63 4.815 16.52 9.463 23.44 4.258 3.57 12.111-1.79 8.781-6.91-1.199-4.86-8.106-15.57 1.211-9.63 9.2192 3.21 18.062 8.01 27.508 10.29 6.172 0.06 6.808-10.02 0.562-10.47-7.958-3.16-15.916-6.32-23.875-9.47 6.1011-1.92 13.779-0.49 19.032-4.41 3.664-4.12-2.189-10.5-6.8442-8.12-8.4583 1.43-16.917 2.87-25.375 4.31-0.081-14.9 0.804-30.01-0.281-44.78-0.99-2.09-3.411-3.33-5.688-3.1z"/><path style="stroke-linejoin:round;stroke:#000000;stroke-linecap:round;stroke-width:4" d="m39.3 136.42c0.018 60.5-49.028 109.57-109.54 109.57-60.5 0-109.55-49.07-109.53-109.57-0.02-60.513 49.03-109.57 109.53-109.57 60.512-0.004 109.56 49.057 109.54 109.57z"/><path style="fill:#000000;fill-opacity:.31373" d="m32.678 98.835c0.077 1.685 0.125 3.395 0.125 5.095 0 60.46-49.067 109.53-109.53 109.53-47.263 0-87.593-30-102.94-71.97 2.66 58.11 50.68 104.47 109.44 104.47 60.466 0 109.53-49.07 109.53-109.53 0.003-13.2-2.335-25.87-6.622-37.595z"/><path style="stroke-linejoin:round;stroke:#000000;stroke-linecap:round;stroke-width:2.7157" d="m2.1311 68.361c0.0122 41.079-33.287 74.389-74.367 74.389-41.084 0-74.384-33.31-74.364-74.389-0.02-41.081 33.28-74.39 74.364-74.39 41.08 0.0001 74.379 33.309 74.367 74.39z"/><g transform="matrix(1.387 0 0 1.387 -219.24 -22.138)"><path style="stroke-linejoin:round;stroke:#000000;stroke-linecap:round;stroke-width:2.7096;fill:#ffffff" d="m142.82 56.167c0 8.48-6.87 15.356-15.35 15.356s-15.36-6.876-15.35-15.356c-0.01-8.481 6.87-15.357 15.35-15.357s15.35 6.876 15.35 15.357z"/><path style="fill:#000000" d="m129.17 58.876c0 2.827-2.29 5.119-5.11 5.119-2.83 0-5.12-2.292-5.12-5.119 0-2.826 2.29-5.118 5.12-5.118 2.82 0 5.11 2.292 5.11 5.118z"/></g><g transform="matrix(1.387 0 0 1.387 -227.88 -22.138)"><path style="stroke-linejoin:round;stroke:#000000;stroke-linecap:round;stroke-width:2.7096;fill:#ffffff" d="m107.1 56.167c0 8.48-6.87 15.356-15.353 15.356-8.481 0-15.354-6.876-15.352-15.356-0.002-8.481 6.871-15.357 15.352-15.357 8.483 0 15.353 6.876 15.353 15.357z"/><path style="fill:#000000" d="m100.7 58.876c0 2.827-2.289 5.119-5.115 5.119-2.827 0-5.118-2.292-5.118-5.119 0-2.826 2.291-5.118 5.118-5.118 2.826 0 5.115 2.292 5.115 5.118z"/></g><path sodipodi:nodetypes="ccsscssc" style="fill:#000000;fill-opacity:.31373" d="m0.50242 43.147l-1.7453 2.656c0.2317 3.075 0.31998 6.203 0.31998 9.375 0 45.172-45.049 82.662-76.183 77.752-25.924-4.09-56.874-19.66-70.804-52.502 7.09 40.242 53.222 70.072 75.284 69.842 48.913-0.51 76.183-35.14 76.183-80.311-0.0003-9.391-1.0013-18.41-3.0546-26.812z"/><path sodipodi:nodetypes="cccc" style="stroke-linejoin:round;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-width:2.7;fill:#ff0000" d="m-93.201 104.64l18.432 43.42 20.265-38.98c-7.019-17.715-28.292-19.955-38.697-4.44z"/><path sodipodi:nodetypes="cccc" style="stroke-linejoin:round;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-width:3.099;fill:#ffce00" d="m-97.88 91.921l12.711 50.429 32.59-36.35c-4.587-20.458-29.533-27.986-45.301-14.079z"/><path sodipodi:nodetypes="ccss" style="stroke-linejoin:round;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-width:2.5523;fill:#ff0000" d="m-40.768 135.49c-0.683-18.63-11.906-30.13-18.566-44.713 3.331 17.753 5.632 30.963-1.018 44.733-17.46 36.14 21.121 41.97 19.584-0.02z"/></g>`;
        case 'present':
            return `<g transform="matrix(1.7177 0 0 1.5227 -1580.9 -1049.2)"><g><g transform="translate(-1.0533 .010322)"><g transform="translate(-18.177)"><path d="m954.95 811.38v168.01h227.13v-168.01h-227.15z"/></g><path style="filter:url(#filter6051);fill:#000000" d="m960.99 800.74c-22.932 0-28.833-0.52068-28.833 2.0315v12.32h237.59v-12.32c0-3.0663-6.2043-2.0315-28.833-2.0315h-179.92z" transform="matrix(.96746 0 0 1 33.31 0)"/><path d="m960.38 754.36c-22.932 0-28.833-2.0792-28.833 8.1124v49.197h237.59v-49.197c0-12.245-6.2043-8.1124-28.833-8.1124h-179.92z"/></g><g transform="matrix(1.2153,0,0,1,-504.94,-4.2133)"><path style="fill:#eeeeee" d="m1261.8 758.58v57.353h34.251v-57.353zm3.4393 60.452v164.58h27.42v-164.76z"/></g></g><path d="m990.84 693.88c-0.28961 0.00015-0.56153 0.0106-0.84859 0.0291-1.3779 0.0873-2.7096 0.39681-3.9601 0.98768-4.5128 2.1323-8.4746 6.6852-10.34 11.823-3.8774 10.679-3.8866 23.981 0 34.656 1.8664 5.1257 4.6015 11.765 10.34 11.765h37.558c5.7388 0 10.372-5.2365 10.372-11.765 0 0 1.6597-16.387-1.9485-22.833-7.3103-13.059-22.011-19.557-35.138-23.646-1.9045-0.59321-4.0071-1.0178-6.0344-1.0167zm116.35 0.0291c-1.856 0.0613-3.7589 0.44531-5.5001 0.98768-13.127 4.0886-27.828 10.587-35.138 23.646-3.6081 6.4459-1.9485 22.833-1.9485 22.833 0 6.5284 4.6328 11.765 10.372 11.765h37.558c5.7386 0 8.4739-6.6392 10.34-11.765 3.8866-10.674 3.8774-23.977 0-34.656-1.8656-5.1379-5.8275-9.6907-10.34-11.823-1.6674-0.78781-3.4871-1.049-5.343-0.98768zm-106.33 16.616c1.3918-0.00072 2.8097 0.27875 4.1172 0.66814 9.0121 2.6838 19.119 6.9401 24.138 15.512 2.4772 4.2311 1.32 14.989 1.32 14.989 0 4.2853-3.163 7.7271-7.103 7.7271h-25.772c-3.9399 0-5.8216-4.3626-7.103-7.7271-2.6684-7.0066-2.6621-15.736 0-22.746 1.2808-3.3725 4.0048-6.3565 7.103-7.7561 0.85851-0.38784 1.757-0.58183 2.703-0.63909 0.197-0.0122 0.3982-0.029 0.5971-0.0291zm96.834 0c0.1989 0.00011 0.4001 0.0168 0.5972 0.0291 0.946 0.0572 1.8444 0.25125 2.7029 0.63909 3.0982 1.3997 5.8222 4.3836 7.103 7.7561 2.6621 7.0095 2.6684 15.739 0 22.746-1.2813 3.3646-3.163 7.7271-7.103 7.7271h-25.772c-3.94 0-7.103-3.4418-7.103-7.7271 0 0-1.1572-10.758 1.32-14.989 5.0189-8.5722 15.094-12.829 24.106-15.512 1.3077-0.38938 2.7569-0.66885 4.1487-0.66814zm-61.601 10.487c3.6081 5.9898 1.98 21.206 1.98 21.206 0 3.2228-1.2836 6.1081-3.3629 8.1047 1.3129 1.7278 3.2939 2.8178 5.5629 2.8178h17.978c2.2783 0 4.3133-1.0778 5.6258-2.8178-2.0792-1.9967-3.3943-4.8819-3.3943-8.1047 0 0-1.6596-15.216 1.9486-21.206-4.9184-8.6546-20.95-8.9634-26.338 0z"/></g>`;
        case 'nuclear':
            return `<g transform="translate(-143.68 -113.18)"><path d="m-288-768c0 132.55-107.45 240-240 240s-240-107.45-240-240 107.45-240 240-240 240 107.45 240 240z" transform="matrix(.20937 0 0 .20937 304.83 324.58)"/><path style="block-progression:tb;text-indent:0;color:#000000;text-transform:none;fill:#000000" d="m72 15.344c-1.714 0.764-2.105 3.307-3.344 4.656-3.561 6.051-7.251 12.36-10.5 18.281 0.007 0.139 0.038 0.277 0.063 0.407 0.002 0.009-0.002 0.021 0 0.031 3.647 2.336 6.165 6.276 6.5 10.843 8.395 0.758 16.865 0.084 25.25 0.344 1.69-0.177 2.404-1.7 1.781-3.25-1.056-12.593-8.403-24.831-19.25-31.218-0.155-0.065-0.341-0.121-0.5-0.094zm-43.031 0.031c-4.427 2.218-8.066 6.016-11.157 9.906-4.957 6.546-8.1344 14.688-8.4058 22.907 0.2273 2.214 2.5768 1.849 4.1878 1.687 7.615-0.103 15.36 0.321 22.906-0.25 0.317-4.598 2.829-8.592 6.5-10.937 0.06-0.996-0.576-2.065-1.281-2.876-3.889-6.71-7.632-13.661-11.75-20.156-0.28-0.194-0.658-0.324-1-0.281zm28.312 47.687c-1.989 1.068-4.24 1.688-6.656 1.688-2.375 0-4.628-0.59-6.594-1.625-1.851 2.121-3.05 4.972-4.593 7.344-2.593 4.824-5.532 9.414-8.094 14.219-0.457 1.013-0.458 2.233 0.906 2.468 10.345 5.569 23.536 5.813 34.25 1.219 1.17-0.792 3.29-1.152 3.844-2.469-3.28-7.268-8.056-13.839-11.688-20.937-0.413-0.514-0.839-1.343-1.375-1.907z" transform="translate(143.68 113.18)"/><path style="color:#000000;fill:#000000" d="m55.18 37.958a17.551 17.551 0 1 1 -35.103 0 17.551 17.551 0 1 1 35.103 0z" transform="matrix(.53237 0 0 .53237 174.25 143.58)"/></g>`;
        case 'zombie':
            return `<g transform="translate(0 -748.36)"><g transform="matrix(-.31182 .16752 .16752 .31182 280.12 -25.35)"/><path inkscape:connector-curvature="0" d="m22.438 748.89c-2.3783 0.004-4.7738 0.2243-7.0938 0.625-3.0414 0.52531-6.2955 1.2682-8.6875 3.2188-2.4578 2.0042-3.8751 5.0974-5 8.0625-1.1438 3.01-1.562 6.31-1.657 9.53-0.0039925 1.79 1.5955 2.93 2.375 4.4 1.0516 1.5482 2.1069 3.1065 3.1562 4.6562 1.8952 0.19936 2.6991 3.1092 4.9375 1.9375 0.43807-0.22931 1.1434 0.53008 1.5938 0.84375 1.8722 1.3039 2.8028 3.8144 3.7188 6.625l-1.2188 7.875h-0.0937s-5.0247 2.9375-6.3437 5.375c-3.1225 5.7702-3.248 13.021-2.4375 19.531 0.8854 7.112 7.8125 20.031 7.8125 20.031l12.219 20.031c0 3.6446 1.1456 7.8849-1.4688 10.75l-12.219 33.719 14.719 4 0.0937 5.5938-1.4688 7.5938c0.5384 1.2127 1.0985 2.4166 1.6562 3.625l0.28125 14.875c-0.67541 1.1028-1.3714 2.2107-1.9375 3.3438v3.5l2.0312-0.875 0.0313 1.3438-1.625 2.6875c0.53438 2.532 1.1526 5.0528 1.7812 7.5625l0.0937 4.9062v3.4062 3.4375l2.9062 0.46875-6.3438 0.5 5.875 1.9375-6.8438 53.75 2.375-0.2813-1.1562 10.125c-0.45026 1.769-0.94883 3.5958-1.5 5.5313 0.39072 0.7122 0.34432 1.3681 0.625 2.125l-0.3437 2.9062s1.3255 0.046 3.5 0.125c0.50942 0.3054 1.065 0.6215 1.75 0.9688 1.1737-0.324 2.3435-0.567 3.5312-0.75 5.3213 0.2312 12.082 0.5737 19.156 1.125 3.2652 0.6275 6.5457 1.3567 9.8125 2 0 0 3.9511 1.4688 5.75 0.2187 0.12424-0.086 0.23511-0.1786 0.34375-0.2812 1.4512 0.083 1.6202-0.5318 0.8125-2.5625-0.0403-0.1736-0.1089-0.3256-0.1875-0.5-0.0525-0.1227-0.111-0.2754-0.1875-0.4063-0.0194-0.031-0.0418-0.063-0.0625-0.094-2.0116-3.2477-10.862-8.7942-17.156-12.469l-6.5938-5.8125-0.125-4.4063 4.0938-0.5 6.8125 1.9688-8.2812-6.3438 7.25-16.844 1.9688-5.875v-2.4688l1.5312-4.1562 1.4062-2.2188 1.625-2.5938v-3.5l0.71875-1.9375 2.5625-1.7812v-4.25l-0.15625-0.59375 1.1562-3.125-0.6875-8.375-1.5-2.3125 1.875-3.5 3.0938-11.656 19.688 17.531 3.0938 9.1875 0.21875 3.5938 4.9688 14.594 1.4062 1.25 3.625 10.687-0.0937 1.125 1.125 8.3125 2.375 0.6563 1.5938 4.6562-0.8125 2.125 1.5625 0.094 2.9375 8.6875 4.8438-2 3.9688 6.7813 0.90625 2.25s1.7959 2.6535 3.4688 5.2812l2.5 4.25 0.125 0.1875c0.0448 0.082 0.0724 0.1747 0.125 0.25l1.7188 2.9375s1.1195-0.817 2.125-1.5625c1.3638-0.1458 2.7538-0.7693 3.625-1.8125 0.38776-0.4643 1.4373-1.6265 2.5-2.7812 6.1256-4.6108 14.384-10.902 21.188-16.469 5.367-4.3911 5.4676-5.1506 3.0938-6.0937h-0.0313c-0.43435-1.6187-2.0748-2.1884-3.75-1.3125-3.4142-0.8451-9.2201 0.932-12.969 2.3437l-4.0625 0.8438-3.0625-3.8438 5.9375-2.4375-24.156-55.406c-1.1354-1.4368-2.1484-3.0929-3.125-4.8438l-0.40625-1.625-1.0312-1.0312c-1.1655-2.2508-2.2977-4.5402-3.5-6.6562v-2.2812l-4.0625-2.25-2.4375-4.8438-5.2813-7.2188v-3.3125l-2.7188-4.0938-8.5312-8.125-0.53125-0.59375 5.4375-5.6875-5.8438-6.8438c-19.737-27.85-15.325-29.484-15.325-59.056l33.388 6.7747 4.9062-5.875 1.4688 10.281 6.3438-6.8438v3.9062l-8.8125 9.2812 14.656-6.8438-9.75 12.219 12.219-12.219 4.75-11.906h9.75s1.0387 0.20462 1.4688 0.5c0.599 0.4114 0.76027 1.3547 1.4062 1.6875 1.2644 0.65144 4.25 0.28125 4.25 0.28125l1.5-0.59375 2.0625 2 1.7812 1.4688s-0.0725 1.9435 0.59375 2.4688c0.33686 0.26558 0.96617 0.29109 1.2812 0 0.75369-0.69631 0.25-3.0625 0.25-3.0625l-1.5312-2.375-2.1875-2.0938c1.0124-0.84362 1.3669-1.0725 1.1875-2.4688l1.1875 0.90625 3.2812 3.1562 1.9375 3.8438c0.34629 0.69046 0.99009-0.34336 1.125-0.78125 0.38211-1.2401-1.375-3.6562-1.375-3.6562l-3.0625-2.9688-2.0938-1.5938v-0.875l2.7812 1.7812 2.9688 3.1562s1.1529 3.9376 2.2812 3.2812l0.65625-0.40625c1.2374-0.71971-1.5625-3.8438-1.5625-3.8438l-2.875-3.4688-3.1562-2 0.0937-0.46875 4.4688 2.75 2.4688 3.4688s1.1984 3.5019 2.125 2.7188l0.75-0.625c0.83773-0.70804-1.1875-3.0938-1.1875-3.0938l-2.0938-2.8438-5.625-3.875-4.5625-1.7812h-3.2812l-7.125 0.59375-10.812 0.46875-49.313-9.0625-4.8125-2.6875 1.875 0.71875 13.688-2.4375 18.063 1.2997 8.3125 2.1378 4.8438-2 13.056 4.9453-7.4623-7.0078 17.906 5.5-10.406-7.0312 13.812 8.0312-3.5032-12.694 3.0657-6.5876 0.5-0.125 4.8438 1.4375c2.4808-0.15739 4.9274-0.73245 7.375-1.1875l3.75 2.0625c1.5082 0.5036 1.7066 2.0194 2.875 3.2812s1.8982 0.36488 1.7812-0.5c-0.11696-0.86489-1.0215-1.8779-1.5312-2.8125-1.47-0.73498-2.03-2.2025-3.5-2.9375-1.3294-0.65477-0.20295-1.0557-0.15625-2.1562 2.1595 0.94461 3.1315 1.371 5.2188 2.4688 1.8657 0.53384 2.6786 3.0545 3.5312 3.9062 0.8527 0.85175 1.0594-0.75484 1.0312-1.5312-0.0282-0.77641-0.76679-1.7057-1.1562-2.5625-2.6783-2.1108-5.7609-3.7471-8.7812-5.3438l1.5312-1 4.25 1.25c0.41544 0.53897 0.63053 1.3091 0.96875 1.9375 0.25018 1.4532 1.919 2.7247 2.9375 2.4062 1.0185-0.31842 0-1.7128 0-2.5625-1.172-1.5069-2.4842-2.7431-3.6562-4.25-0.51541-0.15805-1.0232-0.2671-1.5938-0.3125-0.94107 0.2233-1.5898-0.3646-1.9375-1.2188 0.86347-0.30645 3.1926 0.8365 4.5625 1.1562 3.1891 0.76746 1.7252 3.6547 2.875 4.9062 1.1498 1.2516 1.6571-1.5971 1.5312-2.0625-0.14318-2.7076-1.8774-3.5601-2.8125-5.3438l-7.5625-2.2812c-0.8088 0.0749-1.6259 0.35332-2.4375 0.5-3.8176 0.68508-7.4139 2.2147-11.031 3.5625-1.8186 0.77989-3.6858 1.3283-5.5938 1.8125l-0.3125-1.0625c-18.279 2.4044-38.6 0.77829-55.688 4.375l-7.3438 0.5-46.502-8.8125 9.3142 3.0625-1.4062-1.5938-1.5938 0.1875-3.1562-4.4688c2.7959-2.5746 7.3129-1.0481 8.6562-4.75 0.4184-1.153-0.34665-3.9986-2.5312-4.8125 0.011-0.0429 0.0245-0.0626 0.0313-0.125-0.0591 0.0134-0.12668 0.047-0.1875 0.0625-0.0333-0.0105-0.06-0.0216-0.0937-0.0313-0.12218-0.19424-0.21251-0.28696-0.25-0.3125 0.002 0.0653 0.0615 0.26277 0.15625 0.40625-1.6462 0.45675-3.7379 1.4511-3.75 0.78125-1.601-0.39753-0.37503-4.9533 3.3125-5.2812-1.2882-1.8078-0.7991-2.9788-0.9375-3.5 4.6649-2.9875 0.434-5.3923-2.1562-7.6875-0.33641-3.6503-1.7997-6.9651-4.375-9.5 1.129 0.10301 2.4049-0.0297 1-0.96875-2.2276-1.6228-4.6284-3.3395-7.4688-3.5625-2.2916-0.55638-4.6529-0.78498-7.0312-0.78125z"/></g>`;
        case 'fire':
            return `<g transform="translate(-61.49 -74.609)"><path style="fill-rule:evenodd;stroke:#000000;stroke-width:.51174px" d="m350.88 74.865c-87.8 90.915 15.13 225.76-28.77 236.36 0 0.01-54.49-86.36-116.56-77.27 96.74 129.11 40.63 210.03 40.88 209.12-60.55-75.76-138.48-77.39-121.1-65.16 72.64 51.08 49.95 187.9 49.95 187.9s-77.204-66.68-113.53-31.82c98.68 50.12 56.02 107.57 54.5 177.28-3.33 138.42 83.3 200.53 98.97 210.62h-41.46v31.82h392.07v-31.82h-48.49c31.18-13.44 149.79-74.12 158.99-222.74 0 0 2.98-86.51-25.73-121.23-7.57 31.82-27.26 34.85-27.26 34.85-12.11 1.51 16.66-71.42 16.66-103.02 0-72.75-51.47-100.02-51.47-100.02s12.12 80.3-33.29 106.06c-9.12-18.87 26.27-225.59-102.94-266.68 33.3 68.18 25.73 93.95 25.73 93.95s-3.25 34.5-4.54 25.76c-9.89-67.04-69.64-131.83-69.64-131.83s-33.18-28.78-52.97-162.12zm89.3 501.56c18.17 25.76 0 154.54 0 154.54 30.28-9.09 66.23-68.5 74.18-77.28 9.97-11 4.54 74.26-31.79 110.63 39.2-8.93 59.03-40.92 59.03-40.92s-14.37 141.96-181.64 186.37c-30.28 18.18-189.95-81.17-102.94-234.86 28.76 134.86 78.72 134.86 78.72 134.86s-37.84-121.22-4.54-157.58c0 0 17.82 64.56 52.98 69.69 21.19-103.03 56-145.45 56-145.45z"/></g>`;
        case 'mask':
            return `<path d="M20.84374,12h-2V10h2A3.27787,3.27787,0,0,1,20.84374,12Z"/><path d="M5.15629,12h-2a3.27809,3.27809,0,0,1,0-2h2Z"/><path d="M12,2C7.58173,2,4,5.47711,4,11s2,11,8,11,8-5.47717,8-11S16.41827,2,12,2Zm2.75,1.5a.75.75,0,1,1-.75.75A.75.75,0,0,1,14.75,3.5Zm0,2.75A.75.75,0,1,1,14,7,.75.75,0,0,1,14.75,6.25ZM12,8c1.10455,0,2,.22382,2,.5s-.89545.5-2,.5-2-.22388-2-.5S10.89545,8,12,8ZM9.25,3.5a.75.75,0,1,1-.75.75A.75.75,0,0,1,9.25,3.5Zm0,2.75A.75.75,0,1,1,8.5,7,.75.75,0,0,1,9.25,6.25ZM5.5,7.75a.75.75,0,1,1,.75.75A.75.75,0,0,1,5.5,7.75Zm.62769,9.20612c-.19525-.19525.2796-.98669,1.06067-1.76776s1.57251-1.25592,1.76776-1.06067-.2796.98669-1.06067,1.76776S6.32294,17.15137,6.12769,16.95612ZM9,18.75A.75.75,0,1,1,9.75,18,.75.75,0,0,1,9,18.75ZM10.95465,11c-1,2.91949-3.45026,1.66388-3.67859,1.1795-.55939-.66034-.47235-3.69159,2.21887-2.56122C10.71344,10.13007,11.0484,10.625,10.95465,11ZM12,17.75a.75.75,0,1,1,.75-.75A.75.75,0,0,1,12,17.75Zm0-3a.75.75,0,1,1,.75-.75A.75.75,0,0,1,12,14.75ZM13.01483,11c-.09375-.375.24121-.86993,1.45972-1.38171,2.69122-1.13037,2.77826,1.90088,2.21887,2.56122C16.46509,12.66388,14.01483,13.91949,13.01483,11ZM15,18.75a.75.75,0,1,1,.75-.75A.75.75,0,0,1,15,18.75Zm2.87231-1.79388c-.19525.19525-.98676-.2796-1.76776-1.06067s-1.25592-1.57251-1.06067-1.76776.98669.2796,1.76776,1.06067S18.06757,16.76086,17.87231,16.95612ZM17.75,8.5a.75.75,0,1,1,.75-.75A.75.75,0,0,1,17.75,8.5Z"/>`;
    }
}

export function svgViewBox(icon){
    switch (icon){
        case 'star':
            return `0 0 640 640`;
        case 'atom':
            return `0 0 100 88.379`;
        case 'heavy':
            return `0 0 24 24`;
        case 'evil':
            return `0 0 240 240`;
        case 'micro':
            return `0 0 276 276`;
        case 'heart':
            return `0 0 20 16`;
        case 'candy':
            return `0 0 128 128`;
        case 'ghost':
            return `0 0 399 432.23`;
        case 'turkey':
            return '0 0 250 300';
        case 'present':
            return `0 0 410.98 434.75`;
        case 'nuclear':
            return `0 0 101.22 101.22`;
        case 'zombie':
            return `0 0 175 304`;
        case 'fire':
            return `0 0 615.18 879.36`;
        case 'mask':
            return `0 0 24 24`;
    }
}

export function getBaseIcon(name,type){
    if (type === 'feat'){
        switch (name){
            case 'steelem':
                return 'nuclear';
            case 'the_misery':
                return 'zombie';
            case 'ill_advised':
                return 'fire';
            case 'friday':
                return 'mask';
            case 'valentine':
                return 'heart';
            case 'halloween':
                return 'ghost';
            case 'thanksgiving':
                return 'turkey';
            case 'xmas':
                return 'present';
        }
    }
    return global.settings.icon;
}

export function format_emblem(achieve,size,baseIcon){
    if (!size){
        size = 10;
    }
    if (!baseIcon){
        baseIcon = getBaseIcon(achieve,'achievement');
    }
    let emblem = global.stats.achieve[achieve] && global.stats.achieve[achieve].l > 1 ? `<p class="flair" title="${sLevel(global.stats.achieve[achieve].l)} ${loc(global.settings.icon)}"><svg class="star${global.stats.achieve[achieve].l}" version="1.1" x="0px" y="0px" width="${size}px" height="${size}px" viewBox="${svgViewBox(baseIcon)}" xml:space="preserve">${svgIcons(baseIcon)}</svg></p>` : '';
    emblem = emblem + (global.stats.achieve[achieve] && global.stats.achieve[achieve].a > 1 ? `<p class="flair" title="${sLevel(global.stats.achieve[achieve].a)} ${loc('universe_antimatter')}"><svg class="star${global.stats.achieve[achieve].a}" version="1.1" x="0px" y="0px" width="${size}px" height="${size}px" viewBox="${svgViewBox('atom')}" xml:space="preserve">${svgIcons('atom')}</svg></p>` : '');
    emblem = emblem + (global.stats.achieve[achieve] && global.stats.achieve[achieve].e > 1 ? `<p class="flair" title="${sLevel(global.stats.achieve[achieve].e)} ${loc('universe_evil')}"><svg class="star${global.stats.achieve[achieve].e}" version="1.1" x="0px" y="0px" width="${size}px" height="${size}px" viewBox="${svgViewBox('evil')}" xml:space="preserve">${svgIcons('evil')}</svg></p>` : '');
    emblem = emblem + (global.stats.achieve[achieve] && global.stats.achieve[achieve].h > 1 ? `<p class="flair" title="${sLevel(global.stats.achieve[achieve].h)} ${loc('universe_heavy')}"><svg class="star${global.stats.achieve[achieve].h}" version="1.1" x="0px" y="0px" width="${size}px" height="${size}px" viewBox="${svgViewBox('heavy')}" xml:space="preserve">${svgIcons('heavy')}</svg></p>` : '');
    emblem = emblem + (global.stats.achieve[achieve] && global.stats.achieve[achieve].m > 1 ? `<p class="flair" title="${sLevel(global.stats.achieve[achieve].m)} ${loc('universe_micro')}"><svg class="star${global.stats.achieve[achieve].m}" version="1.1" x="0px" y="0px" width="${size}px" height="${size}px" viewBox="${svgViewBox('micro')}" xml:space="preserve">${svgIcons('micro')}</svg></p>` : '');
    return emblem;
}

export function sLevel(level){
    switch (level){
        case 2:
            return loc('plain');
        case 3:
            return loc('bronze');
        case 4:
            return loc('silver');
        case 5:
            return loc('gold');
        default:
            return '';
    }
}
