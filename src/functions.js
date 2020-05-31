import { global, save, poppers, webWorker, achieve_level, universe_level } from './vars.js';
import { loc } from './locale.js';
import { races, traits, genus_traits } from './races.js';
import { actions } from './actions.js';
import { arpaAdjustCosts } from './arpa.js';

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
                if (webWorker.w){
                    webWorker.w.terminate();
                }
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
                if (webWorker.w){
                    webWorker.w.terminate();
                }
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

window.exportGame = function exportGame(){
    if (global.race['noexport']){
        return 'Export is not available during Race Creation';
    }
    return LZString.compressToBase64(JSON.stringify(global));
}

window.importGame = function importGame(data){
    let saveState = JSON.parse(LZString.decompressFromBase64(data));
    if (saveState && 'evolution' in saveState && 'settings' in saveState && 'stats' in saveState && 'plasmid' in saveState.stats){
        global = saveState;
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        if (webWorker.w){
            webWorker.w.terminate();
        }
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

export function removeFromQueue(build_ids){
    for (let i=global.queue.queue.length-1; i>=0; i--){
        if (build_ids.includes(global.queue.queue[i].id)){
            global.queue.queue.splice(i, 1);
        }
    }
}

export function removeFromRQueue(tech_trees){
    for (let i=global.r_queue.queue.length-1; i>=0; i--){
        if (tech_trees.includes(actions.tech[global.r_queue.queue[i].type].grant[0])){
            global.r_queue.queue.splice(i, 1);
        }
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
        mutiplier -= darkEffect('micro',false);
    }

    if (global.race['small']){ mutiplier -= traits.small.vars[0]; }
    else if (global.race['large']){ mutiplier += traits.large.vars[0]; }
    if (global.race['compact']){ mutiplier -= traits.compact.vars[0]; }
    if (global.race['tunneler'] && (structure === 'mine' || structure === 'coal_mine')){ mutiplier -= traits.tunneler.vars[0]; }
    if (global.tech['housing_reduction'] && (structure === 'basic_housing' || structure === 'cottage')){
        mutiplier -= global.tech['housing_reduction'] * 0.02;
    }
    if (structure === 'basic_housing'){
        if (global.race['solitary']){
            mutiplier -= traits.solitary.vars[0];
        }
        if (global.race['pack_mentality']){
            mutiplier += traits.pack_mentality.vars[0];
        }
    }
    if (structure === 'cottage'){
        if (global.race['solitary']){
            mutiplier += traits.solitary.vars[0];
        }
        if (global.race['pack_mentality']){
            mutiplier -= traits.pack_mentality.vars[1];
        }
    }
    if (structure === 'apartment'){
        if (global.race['pack_mentality']){
            mutiplier -= traits.pack_mentality.vars[1];
        }
    }
    if (global.genes['creep'] && !global.race['no_crispr']){
        mutiplier -= global.genes['creep'] * 0.01;
    }
    else if (global.genes['creep'] && global.race['no_crispr']){
        mutiplier -= global.genes['creep'] * 0.002;
    }
    if (mutiplier < 1.005){
        mutiplier = 1.005;
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
        mutiplier -= darkEffect('micro',true);
    }
    if (global.genes['creep'] && !global.race['no_crispr']){
        mutiplier -= global.genes['creep'] * 0.01;
    }
    else if (global.genes['creep'] && global.race['no_crispr']){
        mutiplier -= global.genes['creep'] * 0.002;
    }
    if (global.race['small']){ mutiplier -= traits.small.vars[1]; }
    if (global.race['compact']){ mutiplier -= traits.compact.vars[1]; }
    if (global.race.Harmony.count > 0 && global.stats.achieve[`ascended`]){
        mutiplier -= harmonyEffect();
    }
    if (mutiplier < 1.005){
        mutiplier = 1.005;
    }
    var count = global[sector][action] ? global[sector][action].count : 0;
    if (offset){
        count += offset;
    }
    return Math.round((mutiplier ** count) * base);
}

export function harmonyEffect(){
    if (global.race.Harmony.count > 0 && global.stats.achieve[`ascended`]){
        let boost = 0;
        switch (global.race.universe){
            case 'heavy':
                if (global.stats.achieve.ascended.hasOwnProperty('h')){
                    boost = global.stats.achieve.ascended.h * global.race.Harmony.count;
                }
                break;
            case 'antimatter':
                if (global.stats.achieve.ascended.hasOwnProperty('a')){
                    boost = global.stats.achieve.ascended.a * global.race.Harmony.count;
                }
                break;
            case 'evil':
                if (global.stats.achieve.ascended.hasOwnProperty('e')){
                    boost = global.stats.achieve.ascended.e * global.race.Harmony.count;
                }
                break;
            case 'micro':
                if (global.stats.achieve.ascended.hasOwnProperty('m')){
                    boost = global.stats.achieve.ascended.m * global.race.Harmony.count;
                }
                break;
            default:
                if (global.stats.achieve.ascended.hasOwnProperty('l')){
                    boost = global.stats.achieve.ascended.l * global.race.Harmony.count;
                }
                break;
        }
        if (boost > 0){
            boost = (Math.log(50 + boost) - 3.912023005428146) * 0.01;
            return +(boost).toFixed(5);
        }
    }
    return 0;
}

export function timeCheck(c_action,track,detailed){
    if (c_action.cost){
        let time = 0;
        let bottleneck = false;
        let costs = adjustCosts(c_action.cost);
        Object.keys(costs).forEach(function (res){
            if (res !== 'Morale' && res !== 'HellArmy' && res !== 'Structs' && res !== 'Bool' && res !== 'Plasmid' && res !== 'Phage'){
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

export function arpaSegmentTimeCheck(project){
    let costs = arpaAdjustCosts(project.cost);
    let time = 0;
    Object.keys(costs).forEach(function (res){
        let testCost = Number(costs[res]()) / 100;
        let res_have = Number(global.resource[res].amount);
        if (testCost > res_have){
            if (global.resource[res].diff > 0){
                let r_time = (testCost - res_have) / global.resource[res].diff;
                if (r_time > time){
                    time = r_time;
                }
            }
            else {
                time = -9999999;
            }
        }
    });
    return time;
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
        energy *= darkEffect('antimatter');
        energy = +energy.toFixed(2);
    }
    return energy;
}

export function powerCostMod(energy){
    if (global.race['emfield']){
        return +(energy * 1.5).toFixed(2);
    }
    return energy;
}

export function darkEffect(universe, flag){
    switch (universe){
        case 'standard':
            if (global.race.universe === 'standard'){
                let de = global.race.Dark.count;
                if (global.race.Harmony.count > 0){
                    de *= 1 + (global.race.Harmony.count * 0.001);
                }
                return 1 + (de / 200);
            }
            return 0;

        case 'evil':
            if (global.race.universe === 'evil'){
                let de = global.race.Dark.count;
                if (global.race.Harmony.count > 0){
                    de *= 1 + (global.race.Harmony.count * 0.01);
                }
                return (1 + ((Math.log2(10 + de) - 3.321928094887362) / 5));
            }
            return 1;

        case 'micro':
            if (global.race.universe === 'micro'){
                if (flag){
                    let de = global.race.Dark.count;
                    if (global.race.Harmony.count > 0){
                        de *= 1 + (global.race.Harmony.count * 0.01);
                    }
                    let dark = 0.01 + (Math.log(100 + de) - 4.605170185988092) / 35;
                    if (dark > 0.04){
                        dark = 0.04;
                    }
                    return +(dark).toFixed(5);
                }
                else {
                    let de = global.race.Dark.count;
                    if (global.race.Harmony.count > 0){
                        de *= 1 + (global.race.Harmony.count * 0.01);
                    }
                    let dark = 0.02 + (Math.log(100 + de) - 4.605170185988092) / 20;
                    if (dark > 0.06){
                        dark = 0.06;
                    }
                    return +(dark).toFixed(5);
                }
            }
            return 0;

        case 'heavy':
            if (global.race.universe === 'heavy'){
                let de = global.race.Dark.count;
                if (global.race.Harmony.count > 0){
                    de *= 1 + (global.race.Harmony.count * 0.01);
                }
                return 0.995 ** de;
            }
            return 1;

        case 'antimatter':
            if (global.race.universe === 'antimatter'){
                let de = global.race.Dark.count;
                if (global.race.Harmony.count > 0){
                    de *= 1 + (global.race.Harmony.count * 0.01);
                }
                return 1 + (Math.log(50 + de) - 3.912023005428146) / 5;
            }
            return 0;
    }

    return 0;
}

export function calc_mastery(){
    if (global.genes['challenge'] && global.genes['challenge'] >= 2){
        let m_rate = global.race.universe === 'standard' ? 0.25 : 0.15;
        let u_rate = global.genes['challenge'] >= 3 ? 0.15 : 0.1;
        if (global.genes['challenge'] >= 4 && global.race.universe !== 'standard'){
            m_rate += 0.05;
            u_rate -= 0.05;
        }
        if (global.race['weak_mastery']){
            m_rate /= 10;
            u_rate /= 10;
        }
        let mastery = achieve_level * m_rate;
        if (global.race.universe !== 'standard'){
            mastery += universe_level * u_rate;
        }
        if (global.genes['challenge'] && global.genes['challenge'] >= 5 && global.race.hasOwnProperty('mastery')){
            mastery *= 1 + (0.01 * global.race.mastery);
        }
        return mastery;
    }
    return 0;
}

function challenge_multiplier(value,type,decimals){
    decimals = decimals || 0;
    let challenge_level = 0;
    if (global.race['no_plasmid']){ challenge_level++; }
    if (global.race['no_trade']){ challenge_level++; }
    if (global.race['no_craft']){ challenge_level++; }
    if (global.race['no_crispr']){ challenge_level++; }
    if (global.race['weak_mastery']){ challenge_level++; }
    if (challenge_level > 4){
        challenge_level = 4;
    }
    if (global.race.universe === 'micro'){ value = value * 0.25; }
    if (global.race.universe === 'antimatter' && type !== 'mad'){ value = value * 1.1; }
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

export function calcPrestige(type){
    let gains = {
        plasmid: 0,
        phage: 0,
        dark: 0,
        harmony: 0
    };

    let garrisoned = global.civic.hasOwnProperty('garrison') ? global.civic.garrison.workers : 0;
    for (let i=0; i<3; i++){
        if (global.civic.foreign[`gov${i}`].occ){
            garrisoned += global.civic.govern.type === 'federation' ? 15 : 20;
        }
    }

    let pop_divisor = 999;
    let k_inc = 1000000;
    let k_mult = 100;
    let phage_mult = 0;

    switch (type){
        case 'mad':
            pop_divisor = 3;
            k_inc = 100000;
            k_mult = 1.1;
            break;
        case 'bioseed':
            pop_divisor = 3;
            k_inc = 50000;
            k_mult = 1.015;
            phage_mult = 1;
            break;
        case 'bigbang':
            pop_divisor = 2.2;
            k_inc = 40000;
            k_mult = 1.012;
            phage_mult = 2.5;
            break;
        case 'ascend':
            pop_divisor = 1.15;
            k_inc = 30000;
            k_mult = 1.008;
            phage_mult = 4;
            break;
    }

    let pop = global.resource[global.race.species].amount + garrisoned;
    let new_plasmid = Math.round(pop / pop_divisor);
    let k_base = global.stats.know;
    while (k_base > k_inc){
        new_plasmid++;
        k_base -= k_inc;
        k_inc *= k_mult;
    }

    gains.plasmid = challenge_multiplier(new_plasmid,type);
    gains.phage = gains.plasmid > 0 ? challenge_multiplier(Math.floor(Math.log2(gains.plasmid) * Math.E * phage_mult),type) : 0;

    if (type === 'bigbang'){
        let new_dark = +(Math.log(1 + (global.interstellar.stellar_engine.exotic * 40))).toFixed(3);
        new_dark += +(Math.log2(global.interstellar.stellar_engine.mass - 7)/2.5).toFixed(3);
        new_dark = challenge_multiplier(new_dark,'bigbang',3);
        gains.dark = new_dark;
    }

    if (type === 'ascend'){
        let harmony = 1;
        if (global.race['no_plasmid']){ harmony++; }
        if (global.race['no_trade']){ harmony++; }
        if (global.race['no_craft']){ harmony++; }
        if (global.race['no_crispr']){ harmony++; }
        if (global.race['weak_mastery']){ harmony++; }
        if (harmony > 5){
            harmony = 5;
        }
        switch (global.race.universe){
            case 'micro':
                harmony *= 0.25;
                break;
            case 'heavy':
                harmony *= 1.2;
                break;
            case 'antimatter':
                harmony *= 1.1;
                break;
            default:
                break;
        }
        gains.harmony = parseFloat(harmony.toFixed(2));
    }

    return gains;
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
            else if (res === 'Money' || res === 'Structs'){
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
                newCosts[res] = function(){
                    let cost = costs[res]();
                    if (global.race['smart']){
                        cost *= 1 - (traits.smart.vars[0] / 100);
                    }
                    if (global.race['dumb']){
                        cost *= 1 + (traits.dumb.vars[0] / 100);
                    }
                    return Math.round(cost);
                }
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
        let adjustRate = 1 + (traits.kindling_kindred.vars[0] / 100);
        Object.keys(costs).forEach(function (res){
            if (res !== 'Lumber' && res !== 'Plywood' && res !== 'Structs'){
                newCosts[res] = function(){ return Math.round(costs[res]() * adjustRate) || 0; }
            }
            else if (res === 'Structs'){
                newCosts[res] = function(){ return costs[res](); }
            }
        });
        return newCosts;
    }
    return costs;
}

function craftAdjust(costs){
    if (global.race['hollow_bones'] && (costs['Plywood'] || costs['Brick'] || costs['Wrought_Iron'] || costs['Sheet_Metal'] || costs['Mythril'] || costs['Aerogel'])){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Plywood' || res === 'Brick' || res === 'Wrought_Iron' || res === 'Sheet_Metal' || res === 'Mythril' || res === 'Aerogel'){
                newCosts[res] = function(){ return Math.round(costs[res]() * (1 - (traits.hollow_bones.vars[0] / 100))); }
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
        case 'clover':
            return `<g transform="translate(-126.4 -67.282)"><path style="stroke:#000000;stroke-width:.25pt" d="m452.02 434.8c-34.94 243.11-14.78 319.53 160.84 411.18 15.36 3.36 40.79 0.96 33.11-20.15-199.14-114.69-188.7-141.27-175.23-393.91-43.63 768.78 702.86-132.4 10.47-30.23 711.79-66.28-46.43-703.13-22.24-23.18 11.94-684.77-733.52 34.13-25.81 24.02-675.4-13.74-31.72 748.27 18.86 32.27z"/><path style="fill-rule:evenodd;fill:url(#radialGradient2313)" d="m445.85 337.53c-16.28-66.5-8.14-216.47-116.04-242.26-151.33-4.074-200.87 130.29-185.26 195.44 38 96.36 177.79 86.86 278.91 93.65"/><path style="fill-rule:evenodd;fill:url(#radialGradient2317)" d="m464.84 325.36c18.32-95 22.39-222.58 130.29-248.37 151.34-4.072 204.95 126.22 179.16 191.37-54.29 96.36-173.73 111.29-274.84 118.08"/><path style="fill-rule:evenodd;fill:url(#radialGradient2319)" d="m443.15 455.24c-15.85 66.04-26.25 249.56-131.26 275.17-124.88 30.51-195.49-129.38-180.3-194.07 36.99-95.68 199.51-120.86 297.91-127.6"/><path style="fill-rule:evenodd;fill:url(#radialGradient2321)" d="m477.05 465.75c16.29 66.5-12.21 244.98 95.69 270.77 151.33 4.07 211.05-181.19 195.44-246.34-38-96.37-163.55-84.83-262.62-81.44"/></g>`;
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
        case 'skull':
            return `<path d="m30.362 300.67c-9.562-4 4.674-22.67-11.704-18.5-13.434 0.19-21.11-18.33-10.678-27.2 10.248-10.25 24.784-0.19 34.855 5.2 4.056 3.09 8.181 5.29 12.757 1.75 46.946-18.76 93.976-37.39 140.09-58.12 16.22-4.86 12.14-22.05 16.05-34.42 7.66-11.48 28.09-5.95 33.45 5.38 6.89 10.91-19.13 21.04-6.91 27.85 7.08-21.34 27.15 5.55 13.16 15.37-8.8 9.66-25.09 6.32-31.32-4.52-7.96-10.26-21.18 6.19-31.51 7.72-36.39 15.87-75.15 25.84-110.58 44.01-13.621 3.29-25.112 12.5-23.962 27.21-5.639 6.48-15.352 9.21-23.694 8.27zm155.06-2.8c-14.94-4.23-1.67-29.35-16.05-33.68-9.9-3.31-29.06-10.8-31.81-17.13 6.06-0.53 12.56-8.18 18.19-2.98 11.6 6.04 24.96 15.21 38.18 8.24 11.68-7.97 28.7-2.35 32.87 11.2 1.55 15.59-22.09-5.85-23.58 3.39 18.4-0.32 22.89 28.04 3.69 30.84-6.97 1.5-14.57 2.12-21.49 0.12zm-92.45-63.84c-19.632-4.67-36.938-16.19-56.756-20.1-11.642 9.38-33.324 9.81-35.177-9.01-5.281-15.5 10.709-19.7 22.441-16.41 8.181-0.93-6.805-15.5 6.788-14.86 14.56-8.06 32.046 6.73 19.835 21.2-5.874 14.39 17.304 16.98 26.449 21.52 11.243 5.47 30.78 7.44 36.9 14.94-5.62 6.03-13.34 4.91-20.48 2.72zm52.31-27.09c-6.06-7.92-15.78-6.19-17.32 3.9-6.12-6.1-13.69-16.12-18.15-3.18-11.87 14.92-20.769-28.31-26.358-6.79 1.848 7.62-14.392 6.84-12.795-0.92 2.01-12.73-13.028-31.47 0.495-39.96 6.023 1.5 17.422 4.2 9.805-5.61-9.276-16-31.097 7.69-39.754-12.72-10.715-11.21-7.579-28.52 4.509-37.18 3.021-3.76 8.65-6.51 6.941-12.103 0.196-5.278-0.964-10.999 0.075-16.001 4.209-6.198 14.011-14.079 6.665-21.445-7.404-6.959 2.858 11.572-7.041 13.802-9.992 5.343-1.944 29.337-12.044 27.747-6.102-12.634-8.115-27.436-1.494-40.387 10.133-28.248 36.182-49.248 65.776-53.734 25.61-3.8486 52.95-3.7081 77.35 5.81 21.9 9.634 35.63 31.871 42.04 54.093 1.12 7.296 0.96 14.706 1.35 22.062-10.21 7.197-6.61 19.666-2.77 29.556 5.01 14.06-3.59 28.79-13.14 38.62-11.13 4.38-29.15-0.71-33.49 14.48 8.43 1.59 21.94 1.77 14.11 15.35-5.85 11.16-15.02 28.24-30.23 23.06-3.84 7.87-6.74 7.98-14.53 1.55zm-21.74-60.41c4-7.36 5.71-19.56 4.3-27.04-9.97 2.06-18.69 35.14-4.3 27.04zm29.29 0.95c2.02-9.15-5.67-30.54-15.78-26.02 4.37 7.62 0.98 33.83 15.78 26.02zm-30.72-33.63c8.97-8.29 2.46-27.466-5.81-35.067-13.06-10.201-35.244-14.651-46.574 0.532-9.412 8.725-6.792 23.545 2.988 30.825 11.709 8.83 27.606 5.45 41.296 5.67 2.78-0.19 5.63-0.56 8.1-1.96zm70.91-1.1c11-5.02 21.48-19.639 12.33-30.956-8.5-13.779-26.85-16.801-40.69-9.682-15.1 4.068-21.28 19.249-21.73 33.568 4.42 14.74 25.96 7.89 37.82 9.2 4.14-0.24 8.44-0.34 12.27-2.13z"/>`;
        case 'pizza':
            return `<path d="m129.15 0.019c-2.412 0.612-4.428 1.836-5.904 3.816-1.475 1.98-2.555 4.536-3.096 7.956-9.973 8.028-18.216 15.48-25.272 22.5-7.128 6.948-9.612 12.816-16.632 19.404-7.164 6.516-12.168 6.912-25.272 20.052-13.248 13.212-30.528 32.4-52.956 58.536l7.956 12.096c10.188-0.359 25.02-1.332 45.324-2.771 20.34-1.512 49.068-3.78 75.492-6.229 26.387-2.592 52.992-5.544 81.359-9 1.08-1.008 2.232-2.34 3.457-4.14 1.188-1.908 2.412-3.924 3.814-6.588-1.08-6.588-2.627-12.708-4.5-19.044-2.051-6.372-4.355-12.96-6.912-18.36-2.592-5.436-5.363-8.604-8.314-13.824-3.096-5.328-4.176-10.62-10.045-17.676-6.084-7.236-15.875-17.064-25.631-24.912-9.91-7.883-20.63-15.011-32.88-21.815z" i:knockout="Off" fill="#000000" /> <path d="m3.119 132.61c6.768 0.72 16.344 0.611 29.412-0.324 13.104-1.116 34.38-4.68 48.132-5.544 13.536-0.864 19.368 0.936 32.904 0.684 13.572-0.396 33.084-1.296 47.412-2.411 14.148-1.08 26.064-2.521 36.721-4.177 1.404-4.176 3.492-6.66 6.551-7.596 2.988-0.972 6.805-0.288 11.449 2.052l-6.229 10.044c-5.473 0.685-15.443 1.836-30.492 3.456-15.156 1.512-38.447 4.032-59.184 5.904-20.772 1.764-45.756 3.384-64.404 4.86-18.684 1.331-33.984 2.483-46.728 3.456-1.841-3.45-3.677-6.91-5.549-10.4z" i:knockout="Off" /> <path d="m2.794 130.88c5.112-4.859 10.764-10.8 17.64-18.359 6.84-7.668 15.012-18.54 22.86-26.641 7.668-8.172 16.884-16.56 23.184-21.816 6.12-5.292 9.972-5.832 14.184-9.684 4.068-3.996 7.812-9.468 11.088-13.5 3.348-4.068 3.888-5.724 9-10.404 5.148-4.716 11.916-10.548 21.132-17.64 2.375 2.556 5.904 5.688 10.729 9.684 4.859 3.888 12.527 8.784 18 13.86 5.363 5.148 9.719 11.592 14.184 16.272 4.355 4.428 9.467 6.012 12.131 10.728 2.592 4.788 1.152 12.708 3.457 17.64 2.305 4.823 7.92 7.271 10.043 11.088 2.018 3.744 0.9 6.516 2.053 11.088 1.008 4.536 2.447 9.504 4.176 15.588-12.023 1.8-24.875 3.348-39.131 4.5-14.438 1.152-33.156 2.088-46.045 2.412-12.888 0.107-19.152-1.584-30.456-1.044-11.52 0.576-24.264 3.42-37.404 4.5-13.141 1.04-26.605 1.61-40.826 1.72z" i:knockout="Off" /> <path d="m130.88 2.431c-2.484-0.288-4.5 0.504-5.904 2.088-1.439 1.656-2.412 4.104-2.771 7.632 3.059 2.196 6.588 4.896 10.727 7.956 4.068 3.06 9.758 6.84 13.861 10.368 3.924 3.456 7.199 6.876 10.404 10.404 3.131 3.42 5.436 6.876 9 10.368 3.6 3.312 9.791 5.544 12.455 10.044 2.52 4.5 1.729 12.78 2.771 16.632 0.9 3.673 1.189 3.204 3.098 5.544 1.943 2.305 6.658 5.112 8.314 8.28 1.512 2.988-0.252 5.868 0.686 10.044 0.898 4.141 2.268 9.108 4.5 14.904 0.143-3.78 1.691-5.977 4.5-6.588 2.844-0.612 6.91 0.216 12.49 2.771-1.188-9.288-3.275-17.496-6.264-24.912-3.096-7.451-8.135-13.176-11.771-19.404-3.564-6.3-5.832-11.844-10.008-18-4.355-6.264-7.957-11.916-15.947-19.044-8.209-7.38-25.813-18.9-32.545-23.868-6.77-4.887-9.25-6.579-7.6-5.211z" i:knockout="Off" /> <path d="m92.435 90.02c-1.8-2.628-2.376-5.364-1.728-8.641 0.648-3.384 2.268-8.207 5.544-10.728 3.24-2.592 8.712-4.536 13.5-4.176 4.679 0.396 11.521 2.808 14.544 6.264 2.916 3.384 3.959 7.848 3.131 13.824-3.924-1.296-7.164-1.872-9.719-1.729-2.629 0.108-4.861 0.973-5.869 2.448-1.043 1.404-1.404 3.313-0.684 5.868-4.068-2.196-7.056-3.168-9.36-2.772s-3.636 1.872-4.14 4.86c-1.724-1.726-3.451-3.455-5.215-5.218z" i:knockout="Off" fill="#000000" /> <path d="m93.119 87.967c-1.116-2.447-1.44-4.896-0.684-7.632 0.684-2.808 1.8-6.66 4.86-8.64 2.952-2.052 8.424-3.96 12.817-3.492 4.355 0.396 10.26 3.06 13.139 5.904 2.736 2.808 3.889 6.336 3.457 10.728-1.836-1.296-4.068-2.124-6.553-2.088-2.699-0.144-6.84 0.396-8.676 1.765-1.908 1.403-2.412 3.491-2.052 6.552-2.736-2.124-5.22-3.097-7.308-2.772-2.232 0.252-3.924 1.8-5.508 4.5-1.154-1.585-2.305-3.205-3.493-4.825z" i:knockout="Off" /> <path d="m137.11 88.291c0.215 2.844 1.223 7.344 4.139 10.729 2.809 3.312 7.273 7.56 12.816 9 5.58 1.332 16.344 1.691 20.088-1.008 3.457-2.952 3.527-10.837 1.045-15.589-2.629-4.823-10.369-10.872-16.273-12.456-5.939-1.584-15.479 1.44-19.043 3.097-3.72 1.513-3.07 3.313-2.78 6.229z" i:knockout="Off" fill="#000000" /> <path d="m138.3 88.363c0.18 2.808 1.152 6.768 3.889 10.08 2.699 3.06 6.768 7.128 12.059 8.46 5.184 1.224 15.408 1.548 18.865-0.972 3.348-2.809 3.311-10.152 1.008-14.652-2.557-4.572-9.756-10.152-15.336-11.736-5.652-1.476-14.438 1.404-17.893 2.952-3.39 1.333-2.96 3.241-2.6 5.869z" i:knockout="Off" /> <path d="m37.066 90.379c3.6 2.305 7.884 3.276 13.14 2.772 5.22-0.612 14.508-2.196 18-5.868 3.276-3.708 2.628-11.988 2.088-15.948-0.612-4.068-2.196-6.624-5.184-7.956-8.316 7.92-14.688 14.148-19.404 18.684-4.68 4.464-7.56 7.236-8.64 8.316z" i:knockout="Off" fill="#000000" /> <path d="m40.522 90.379c2.124-2.844 5.184-6.264 9.324-10.403 4.104-4.212 9.144-9 15.264-14.508 1.944 0.684 3.204 2.34 3.78 5.508 0.576 3.06 1.116 9.504-0.324 12.816-1.656 3.132-5.148 4.788-8.676 6.229-3.564 1.332-8.892 1.979-12.096 2.088-3.239 0.035-5.615-0.542-7.272-1.73z" i:knockout="Off" /> <path d="m115.98 55.423c-2.305 0.036 0.936 6.768 4.176 10.044 3.205 3.312 8.1 8.316 14.545 9.324 6.227 0.828 19.619-2.772 22.824-4.14 2.986-1.476-0.145-3.24-4.141-4.176-4.104-1.044-13.068 0-19.404-1.728-6.3-1.872-15.73-9.468-18-9.324z" i:knockout="Off" fill="#000000" /> <path d="m157.2 68.923c-2.592 1.296-5.76 2.376-9.361 3.096-3.779 0.72-8.387 2.161-12.455 1.404-4.068-0.899-8.785-3.528-11.771-6.228-3.098-2.664-5.293-5.904-6.588-9.72 2.41 2.952 5.039 5.544 8.314 7.632 3.133 2.124 5.365 4.068 10.729 4.86 5.37 0.648 12.28 0.252 21.14-1.044z" i:knockout="Off" /> <path d="m119.11 57.835c2.986 2.484 6.047 4.392 9.322 5.868 3.168 1.404 5.869 2.052 10.045 2.772 4.141 0.648 9.107 1.116 14.904 1.404-4.033 0.648-7.775 1.044-11.088 1.044-3.348-0.036-5.652 0.216-9-1.044-3.564-1.476-9.432-5.22-11.771-6.912-2.34-1.728-3.24-2.772-2.41-3.132z" i:knockout="Off" /> <path d="m89.663 98.695c-2.304 2.771-4.428 4.428-6.228 4.824-1.908 0.359-4.032-0.396-4.824-2.412-0.936-2.124-1.584-5.725 0-9.685 1.656-4.031 4.752-8.712 9.684-14.184l-0.684-5.22c-7.632 3.672-12.528 7.812-15.264 12.816-2.664 4.933-1.872 12.564-0.684 16.632 1.044 3.925 4.572 5.797 7.272 7.272 2.664 1.476 6.804 2.952 8.676 1.368 1.835-1.66 2.375-5.51 2.052-11.415z" i:knockout="Off" fill="#000000" /> <path d="m87.935 103.52c0.36 2.628 0.18 4.607-0.684 5.544-0.936 0.792-2.628 1.044-4.5 0.359-2.052-0.756-4.752-2.304-6.588-3.815-1.764-1.548-2.988-2.664-3.816-4.86s-1.116-5.004-1.008-8.28c0.216 3.744 1.116 6.805 3.096 9.324 1.836 2.412 6.048 5.185 8.316 5.544 2.231 0.34 3.959-1.03 5.184-3.8z" i:knockout="Off" /> <path d="m87.935 101.43l-0.108 1.619c-0.756 1.44-1.548 2.521-2.52 3.097-1.044 0.611-1.8 0.899-3.384 0.324-1.728-0.828-4.824-2.7-6.372-4.5-1.512-1.944-2.556-4.032-2.988-6.265-0.648-2.268-1.296-4.607-0.54-7.02 0.612-2.592 2.016-5.544 4.5-8.028 2.484-2.52 5.76-4.86 10.224-7.02l0.648 3.708c-2.448 2.376-4.536 4.896-6.264 7.703-1.944 2.7-3.744 5.904-4.284 8.784-0.54 2.809 0.432 6.696 1.548 8.46 1.08 1.656 3.276 2.124 4.932 1.98 1.619-0.1 3.06-1.15 4.608-2.84z" i:knockout="Off" /> <path d="m31.522 104.92c6.876 3.276 12.564 6.624 17.64 10.044 5.04 3.385 8.892 6.841 12.132 10.368l6.552-8.315c-5.436-6.156-10.8-10.656-16.236-13.5-5.508-2.916-10.8-4.177-16.308-3.78-1.26 1.73-2.519 3.46-3.78 5.18z" i:knockout="Off" fill="#000000" /> <path d="m32.999 104.82c2.988 1.584 5.796 2.987 8.568 4.607 2.7 1.513 4.284 2.089 7.668 4.645 3.24 2.448 7.308 5.832 12.06 10.151l1.008-1.367c-3.708-3.816-7.452-6.984-11.376-9.792-4.032-2.845-9.252-5.364-12.168-6.876-2.916-1.62-4.68-2.448-5.292-2.484-0.144 0.35-0.288 0.71-0.468 1.11z" i:knockout="Off" /> <path d="m34.115 102.44l1.908-2.017c5.148 0.504 9.612 1.513 13.536 3.168 3.888 1.656 7.02 4.284 9.936 6.624 2.844 2.269 5.076 4.465 6.984 6.876l-3.96 5.185c-3.312-3.96-6.876-7.164-10.692-10.008-4.032-2.916-9.36-5.221-12.384-6.769-2.988-1.548-4.716-2.304-5.328-2.268v-0.79z" i:knockout="Off" /> <path d="m132.93 121.59c1.189 1.044 2.988-3.743 3.313-6.983 0.145-3.313 0.432-8.424-2.051-12.132-2.629-3.816-10.945-9.108-13.141-10.044-2.305-1.009-1.584 1.584-0.18 4.176 1.26 2.52 6.371 6.804 8.387 11.052 2.02 4.14 2.41 12.67 3.67 13.93z" i:knockout="Off" fill="#000000" /> <path d="m120.33 93.439c1.98 0.684 3.889 1.872 6.121 3.42 2.16 1.512 5.039 3.384 6.695 5.904 1.477 2.483 2.305 6.191 2.34 9.18 0.037 2.844-0.611 5.544-1.943 8.1 0.359-2.735 0.504-5.363 0.035-8.027-0.504-2.772-0.395-4.824-2.592-7.956-2.27-3.12-5.72-6.614-10.66-10.611z" i:knockout="Off" /> <path d="m132.72 118.78c-0.217-2.771-0.541-5.4-1.369-7.74-0.826-2.447-1.764-4.14-3.348-6.588-1.656-2.592-3.744-5.292-6.408-8.496 2.305 1.8 4.213 3.528 5.869 5.328 1.512 1.764 2.809 2.664 3.744 5.22 0.863 2.448 1.764 7.381 2.016 9.505 0.26 2.1 0.04 2.93-0.5 2.78z" i:knockout="Off" /> <path d="m138.3 88.363c0.18 2.808 1.152 6.768 3.889 10.08 2.699 3.06 6.768 7.128 12.059 8.46 5.184 1.224 15.408 1.548 18.865-0.972 3.348-2.809 3.311-10.152 1.008-14.652-2.557-4.572-9.756-10.152-15.336-11.736-5.652-1.476-14.438 1.404-17.893 2.952-3.39 1.333-2.96 3.241-2.6 5.869z" i:knockout="Off" /> <path d="m106.15 33.499c0.18 2.376 1.044 6.3 3.564 9.144 2.485 2.844 6.12 6.372 10.909 7.668 4.824 1.152 13.859 1.368 17.1-0.9 2.916-2.484 3.023-9.216 0.9-13.248-2.197-4.032-8.893-9.324-13.861-10.62-5.039-1.368-13.176 1.26-16.235 2.628-3.12 1.224-2.62 2.952-2.37 5.328z" i:knockout="Off" fill="#000000" /> <path d="m107.16 33.535c0.108 2.304 1.08 5.868 3.347 8.604 2.305 2.664 5.725 6.084 10.26 7.2 4.32 1.008 13.248 1.332 16.094-0.828 2.807-2.304 2.807-8.784 0.828-12.492-2.197-3.816-8.209-8.712-13.033-9.972-4.824-1.188-12.313 1.08-15.264 2.484-3 1.224-2.49 2.664-2.24 5.004z" i:knockout="Off" /> <path d="m125.16 31.735c-6.156 2.52-11.557 4.176-16.632 5.508-5.112 1.224-9.612 1.764-13.644 1.764l1.512 9c7.02-0.036 13.032-0.72 18.035-2.592 5.004-1.836 8.857-4.536 11.846-8.244-0.37-1.8-0.72-3.6-1.12-5.436z" i:knockout="Off" fill="#000000" /> <path d="m124.37 32.743c-2.773 0.972-5.365 2.052-7.92 2.844-2.629 0.792-3.924 1.584-7.381 2.232-3.528 0.648-7.92 1.26-13.464 1.836l0.252 1.44c4.536-0.18 8.784-0.72 12.888-1.62 3.996-1.08 8.675-2.772 11.412-3.816 2.664-1.008 4.213-1.656 4.645-1.944-0.15-0.324-0.29-0.648-0.43-0.972z" i:knockout="Off" /> <path d="m125.23 34.867l0.18 2.376c-3.348 3.024-6.48 5.256-9.828 6.84-3.42 1.548-6.948 1.908-10.007 2.484-3.096 0.54-5.904 0.576-8.424 0.504l-1.044-5.508c4.392 0.18 8.496-0.216 12.6-1.044 4.032-0.936 8.749-3.024 11.52-4.032 2.629-0.972 4.176-1.8 4.5-2.088 0.15 0.144 0.33 0.288 0.51 0.468z" i:knockout="Off" /> <path d="m89.734 62.371c-1.764 0.972-3.312 1.152-5.04 0.54-1.728-0.72-5.184-1.944-5.076-4.248-0.072-2.34 1.476-8.496 5.328-9.576 3.852-1.224 14.508 0.72 17.82 2.916 3.168 2.16 2.772 8.496 1.584 10.116-1.224 1.548-4.14 1.224-8.748-0.828-0.828 1.08-0.972 2.196-0.288 3.744 0.612 1.512 1.944 3.06 3.996 5.04-1.008 1.764-2.34 2.916-4.536 3.456-2.16 0.504-4.86 0.288-8.244-0.504 0.18-2.196 0.54-4.104 1.08-5.868 0.469-1.836 1.224-3.384 2.124-4.788z" i:knockout="Off" fill="#000000" /> <path d="m98.411 70.183c-1.548 0.9-2.988 1.332-4.86 1.44-1.8 0.036-3.852-0.252-6.012-1.008l-0.36 2.088c1.404 0.359 2.628 0.54 3.96 0.685 1.26 0.035 2.484 0.071 3.672-0.181 1.008-0.36 2.304-1.044 2.916-1.512 0.54-0.54 0.863-1.044 0.684-1.512z" i:knockout="Off" /> <path d="m80.482 57.115c-0.36 0.864-0.288 1.692-0.18 2.34 0.072 0.612 0.576 0.9 1.116 1.44 0.576 0.396 1.296 0.864 2.304 1.26 0.9 0.324 1.944 0.648 3.132 0.684 0.972-0.108 2.016-0.468 2.988-1.08l0.18-0.792c-1.368 0.432-2.664 0.684-3.744 0.756-1.152 0.072-2.088-0.252-2.952-0.576-0.9-0.504-1.656-1.152-2.268-2.088-0.18-0.648-0.359-1.296-0.576-1.944z" i:knockout="Off" /> <path d="m95.818 60.895c1.188 0.54 2.232 1.08 3.276 1.332 0.936 0.216 2.088 0.432 2.916 0.36 0.828-0.18 1.368-0.504 1.908-1.116-1.692 0.216-3.096 0.036-4.356-0.144-1.332-0.216-2.232-0.828-3.096-1.44-0.218 0.324-0.433 0.648-0.65 1.008z" i:knockout="Off" /> <path d="m98.086 69.931c-1.08-1.116-1.98-2.16-2.556-3.276-0.72-1.152-1.332-2.34-1.152-3.564 0.072-1.26 0.9-2.556 2.088-3.888 0.396 0.54 1.188 1.044 2.52 1.368s3.024 0.468 5.364 0.576c0.36-0.9 0.576-1.692 0.504-2.916-0.18-1.296 0.18-2.772-1.008-4.032-1.26-1.332-3.168-2.52-6.12-3.276-3.06-0.756-8.568-1.872-11.376-1.26-2.844 0.54-4.068 2.844-4.932 4.392-0.9 1.404-0.396 2.916 0 4.104 0.324 1.116 1.044 1.872 2.16 2.412 1.044 0.432 2.664 0.432 4.032 0.432 1.296-0.144 2.448-0.432 3.6-1.008-0.216 0.288-0.684 1.116-1.26 2.916-0.576 1.692-1.404 4.068-2.34 7.272 1.908 0.648 3.744 1.08 5.508 1.008 1.735-0.108 3.39-0.432 4.974-1.26z" i:knockout="Off" /> <path d="m103.52 116.48c0.18 2.34-0.54 4.032-2.016 5.616-1.656 1.403-4.68 4.355-7.128 3.168-2.52-1.332-8.172-5.868-7.38-10.549 0.864-4.752 8.136-15.084 12.24-17.388 3.888-2.304 10.476 1.368 11.556 3.528 1.043 2.124-0.793 4.896-5.364 8.855 0.648 1.44 1.908 2.053 3.78 2.232 1.909 0.072 4.284-0.468 7.417-1.62 1.404 1.908 1.943 3.96 1.332 6.552-0.648 2.521-2.197 5.292-4.789 8.46-2.23-1.332-4.067-2.664-5.651-4.14-1.62-1.55-2.95-2.99-4-4.72z" i:knockout="Off" fill="#000000" /> <path d="m116.27 111.3c0.182 2.017-0.143 3.853-0.971 5.904-0.9 1.908-2.232 3.852-4.141 5.832l2.016 1.476c1.08-1.26 2.053-2.592 2.773-3.852 0.646-1.476 1.439-2.628 1.691-3.996 0.252-1.404 0.072-2.916-0.107-3.852-0.22-0.9-0.69-1.41-1.26-1.51z" i:knockout="Off" /> <path d="m93.19 123.57c0.828 0.756 1.62 1.224 2.376 1.404 0.684 0.107 1.296-0.181 2.124-0.469 0.72-0.432 1.656-0.972 2.52-1.764 0.828-0.864 1.8-1.908 2.34-2.988 0.504-1.151 0.504-2.376 0.396-3.672l-0.756-0.647c-0.216 1.691-0.54 3.096-1.116 4.355-0.576 1.188-1.296 2.088-2.16 2.844-0.936 0.685-2.052 1.08-3.348 1.332-0.788-0.09-1.58-0.23-2.372-0.38z" i:knockout="Off" /> <path d="m105.11 109.28c1.296-0.972 2.196-1.908 3.096-2.808 0.864-0.973 1.44-1.98 1.872-2.881 0.217-0.936 0.145-1.8-0.215-2.592-0.72 1.8-1.512 3.313-2.376 4.536-0.972 1.188-2.016 1.98-3.132 2.521 0.25 0.39 0.5 0.79 0.76 1.22z" i:knockout="Off" /> <path d="m115.83 111.51c-1.691 0.647-3.348 0.899-4.824 1.044-1.619 0.035-3.059 0.107-4.319-0.612-1.188-0.828-2.34-2.196-3.06-4.248 0.792-0.072 1.764-0.72 2.772-1.944 0.972-1.224 2.088-3.023 3.348-5.399-0.648-0.9-1.584-1.477-2.808-2.017-1.296-0.576-2.952-1.655-4.824-1.008-2.016 0.54-4.32 2.088-6.624 4.788-2.412 2.7-6.336 8.172-7.2 11.412-0.864 3.168 0.972 5.796 2.16 7.488 1.152 1.548 2.88 1.871 4.356 2.088 1.296 0.144 2.556-0.145 3.636-1.008 0.936-0.937 2.016-2.664 2.556-4.068 0.576-1.404 0.792-2.844 0.792-4.32 0.144 0.324 0.9 1.26 2.412 2.809 1.512 1.476 3.636 3.6 6.516 6.228 1.691-1.728 2.988-3.456 3.889-5.328 0.87-1.94 1.22-3.77 1.22-5.9z" i:knockout="Off" /> <path d="m177.25 99.596c2.305 0.792 3.961 2.016 4.824 4.212 0.828 2.088 2.592 6.228 0.432 8.243-2.303 1.944-8.928 5.832-13.355 3.349-4.428-2.628-11.771-14.04-12.6-18.828-0.756-4.932 5.291-9.937 7.883-10.152 2.412-0.18 4.682 2.557 6.805 8.748 1.584-0.18 2.844-1.116 3.637-2.952 0.828-1.943 1.188-4.428 1.223-7.991 2.449-0.757 4.752-0.36 7.057 1.188 2.34 1.512 4.355 4.176 6.588 7.992-2.16 1.728-4.211 2.952-6.299 4.068-2.11 1.078-4.13 1.654-6.18 2.123z" i:knockout="Off" fill="#000000" /> <path d="m176.96 84.943c2.088 0.504 3.779 1.584 5.471 3.24 1.621 1.548 2.988 3.672 4.248 6.372l2.232-1.44c-0.863-1.656-1.799-3.024-2.807-4.248-1.01-1.26-2.16-2.52-3.313-3.204-1.26-0.792-2.916-1.296-3.852-1.368-1.01-0.144-1.62 0.072-1.98 0.648z" i:knockout="Off" /> <path d="m180.35 112.63c1.01-0.576 1.908-1.188 2.305-1.836 0.359-0.72 0.432-1.439 0.359-2.304-0.107-0.972-0.322-2.124-0.791-3.168-0.432-1.188-1.26-2.628-2.088-3.492-0.936-0.9-2.16-1.548-3.527-1.8l-0.9 0.54c1.584 0.792 2.879 1.764 3.887 2.771 0.938 1.009 1.656 1.944 2.018 3.204 0.252 1.152 0.395 2.448 0.035 3.889-0.45 0.72-0.88 1.44-1.31 2.2z" i:knockout="Off" /> <path d="m170.66 95.312c-0.467-1.584-1.008-3.024-1.619-4.177-0.613-1.296-1.369-2.34-2.125-2.987-0.791-0.648-1.727-0.9-2.664-0.756 1.512 1.332 2.809 2.699 3.602 4.104 0.756 1.332 1.295 2.7 1.332 4.104 0.46-0.073 0.97-0.181 1.47-0.288z" i:knockout="Off" /> <path d="m177 85.483c-0.072 1.979-0.287 3.528-0.791 5.184-0.576 1.513-1.008 3.061-2.268 4.068-1.297 0.828-3.098 1.439-5.4 1.439 0.215-0.899-0.072-2.016-0.865-3.491-0.863-1.513-2.23-3.313-4.104-5.4-1.152 0.216-2.088 0.936-3.096 2.016-1.115 1.009-2.664 2.196-2.844 4.393-0.18 2.231 0.432 4.896 2.232 8.424 1.871 3.348 5.615 9.324 8.604 11.52 2.844 2.017 6.156 1.152 8.279 0.721 1.945-0.54 3.025-2.269 3.781-3.528 0.684-1.368 0.756-2.664 0.359-4.032-0.504-1.439-1.943-2.987-3.061-4.067-1.152-1.152-2.592-1.872-4.031-2.448 0.359-0.036 1.656-0.432 3.744-1.332 2.051-1.008 4.895-2.232 8.676-4.104-1.008-2.411-2.268-4.319-3.781-5.867-1.55-1.622-3.32-2.738-5.44-3.494z" i:knockout="Off"/>`;
        case 'trash':
            return `<path d="M12.41,5.58l-1.34,8c-0.0433,0.2368-0.2493,0.4091-0.49,0.41H4.42c-0.2407-0.0009-0.4467-0.1732-0.49-0.41l-1.34-8 C2.5458,5.3074,2.731,5.0506,3.0035,5.0064C3.0288,5.0023,3.0544,5.0002,3.08,5h8.83c0.2761-0.0036,0.5028,0.2174,0.5064,0.4935 C12.4168,5.5225,12.4146,5.5514,12.41,5.58z M13,3.5C13,3.7761,12.7761,4,12.5,4h-10C2.2239,4,2,3.7761,2,3.5S2.2239,3,2.5,3H5V1.5 C5,1.2239,5.2239,1,5.5,1h4C9.7761,1,10,1.2239,10,1.5V3h2.5C12.7761,3,13,3.2239,13,3.5z M9,3V2H6v1H9z"/>`;
        case 'party':
            return `<path style="stroke:#3e3e3e;stroke-width:11.759;fill:#ffffff" d="m348.09 109.89c-85.21-11.765-133.86-61.49-150.45-144.52l52.461-31.674c8.8349 68.313 24.711 132.98 108.88 162.33z"/><path d="m353.56 91.864c-61.98-62.164-70.82-132.61-33.05-210.32l62.186 6.6459c-35 60.969-62.02 123.32-11.73 199.13z" style="stroke:#3e3e3e;stroke-width:12"/><path d="m392.11 86.165c52.8-63.262 117.89-77.562 193.76-48.91l-0.88537 58.696c-59.98-27.485-120.58-47.403-187.14 6.089z" style="stroke:#3e3e3e;stroke-width:11.264"/><path d="m400.56 103.66c70.409-8.8186 119.79 20.415 150.74 83.029l-35.039 36.44c-21.63-52.55-48.08-100.69-121.42-106.11z" style="stroke:#3e3e3e;stroke-width:9.7;fill:#ffffff"/><path style="stroke:#3e3e3e;stroke-width:10.038" d="m359.07 126.89c-60.038 42.278-119.37 39.574-178.07-2.5897l14.3-50.321c45.296 37.496 92.867 68.618 162.5 37.92z"/><path style="stroke:#3e3e3e;stroke-width:12;fill:#ffffff" d="m125.26 755.38 248.5-719.23 266.68 711.15c-107.4 137.09-420.62 139.89-515.18 8.08z"/><path style="stroke-linejoin:round;stroke:#3e3e3e;stroke-width:8.9074" d="m420.09 159.69c-47.61 62.416-98.161 122.79-151.62 181.16l-49.688 143.88c81.848-80.243 157.06-166.67 226.12-258.78l-24.812-66.25zm58.29 155.4c-90.42 120.29-193.6 232.5-315.94 332.63l-34.91 101.03c153.16-104.45 278.75-224.33 379.06-358.37l-28.21-75.29zm58.188 155.19c-100.47 122.36-214.26 236.88-348.91 339.13 20.15 11.4 42.82 20.53 67.09 27.37 122.94-86.67 221.84-187.56 308.31-295.78l-26.5-70.719zm49.75 132.66c-75.124 86.484-154.65 170.39-244.41 248.34 32.775 2.0765 66.335 0.70943 98.969-4.0938 0.006-0.005 0.0255 0.005 0.0312 0 61.02-55.53 117.11-115.25 170.56-177.19l-25.16-67.06z"/><path style="fill:#00b02d;fill-opacity:.11947" d="m484.59 333.63c9.5858 273.53-172.12 419.02-355.12 427.33 99.306 126.12 405.11 121.44 510.97-13.688z"/><path d="m125.26 755.38 248.5-719.23 266.68 711.15c-107.4 137.09-420.62 139.89-515.18 8.08z" style="stroke:#3e3e3e;stroke-width:12;fill:none"/><path style="stroke:#3e3e3e;stroke-width:12;fill:#ffffff" d="m363.57 78.567c-5.57-87.607 42.03-144.26 121.69-177.74l42.351 46.018c-66.518 22.736-127.96 51.772-140.18 141.92z"/>`;
        case 'martini':
            return `<path d="M7.5,1c-2,0-7,0.25-6.5,0.75L7,8v4 c0,1-3,0.5-3,2h7c0-1.5-3-1-3-2V8l6-6.25C14.5,1.25,9.5,1,7.5,1z M7.5,2c2.5,0,4.75,0.25,4.75,0.25L11.5,3h-8L2.75,2.25 C2.75,2.25,5,2,7.5,2z"/>`;
        case 'lightbulb':
            return `<path d="m0 48c0-27 23-48 50-48s50 21 50 48c0 19-22 37-22 54 0 5-1 9-6 14v4c0 2-4 2-4 4s4 2 4 4-4 2-4 4 4 2 4 4-4 2-4 4 3 2 3 4-7 6-10 12h-22c-3-6-10-10-10-12s3-2 3-4-4-2-4-4 4-2 4-4-4-2-4-4 4-2 4-4-4-2-4-4v-4c-5-5-6-9-6-14 0-17-22-35-22-54zm5 0c0 17 21 36 21 54 0 4 1 8 4 10h40c3-2 4-6 4-10 0-18 21-37 21-54 0-23-20-41-45-41s-45 18-45 41zm17-4 2.4-1.2 17.6 33.2 1.4 32h-4.4l-1-30zm5 0 2-8h2l3 8.4 3-8.4h2l3 8.4 3-8.4h2l3 8.4 3-8.4h2l3 8.4 3-8.4h2l3 8.4 3-8.4h2l2 8-3-4.4-3 8.4h-2l-3-8.4-3 8.4h-2l-3-8.4-3 8.4h-2l-3-8.4-3 8.4h-2l-3-8.4-3 8.4h-2l-3-8.4zm29.6 64 1.4-32 17.6-33.2 2.4 1.2-16 34-1 30h-4.4z"/>`;
        case 'bunny':
            return `<path style="stroke-linejoin:round;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-width:6" d="m64.188 5.3125c-5.397 0.0813-10.898 1.0389-16.594 3.5313-9.817 4.2952-13.554 9.5252-16.282 14.968-6.538-0.307-13.468 2.455-18.218 7.938-7.3948 8.534-6.7113 20.389 1.531 26.438 2.24 1.644 4.798 2.641 7.5 3.124-1.063 4.28-0.91 8.757 0.187 13.219-0.158 0.044-0.31 0.076-0.468 0.125-6.958 2.178-10.97 9.256-8.938 15.75 0.747 2.386 2.204 4.346 4.094 5.782 1.73 1.79 4.454 2.466 7.125 1.5 3.388-1.226 5.531-4.662 5.25-8.063 4.838 7.044 11.348 13.245 17.969 17.565-3.132 2.04-5.007 4.69-4.938 7.56 0.045 1.87 0.5 4.28 2.406 5.16 5.356 2.46 12.173 2.75 18.907 2.68 6.644-0.07 13.36-0.49 18.562-3.03 1.833-0.89 2.139-3.3 2.094-5.15-0.013-0.55-0.101-1.1-0.25-1.63 3.256-0.79 6.06-1.98 8.344-3.53 4.213 3.86 10.941 4.27 16.151 0.66 6-4.15 7.72-12.064 3.85-17.66-3.11-4.492-8.87-6.111-14.126-4.438-1.317-4.594-3.729-9.761-7.406-15.5-8.605-13.428-28.229-23.563-43.969-25.531 0.719-2.053 1.093-4.161 1.093-6.219 10.581 1.08 21.879 1.693 38.594-0.906 5.763-0.896 7.759-2.691 2-7.031-7.125-5.37-15.153-9.126-25.437-8.906 5.516-2.421 10.784-5.283 15.25-8.375 5.825-4.034 7.757-7.3146-1.844-8.9378-4.128-0.6978-8.24-1.157-12.437-1.0937z"/><path d="m64.188 5.3125c-5.397 0.0813-10.898 1.0389-16.594 3.5313-9.817 4.2952-13.554 9.5252-16.282 14.968-6.538-0.307-13.468 2.455-18.218 7.938-7.3948 8.534-6.7113 20.389 1.531 26.438 2.24 1.644 4.798 2.641 7.5 3.124-1.063 4.28-0.91 8.757 0.187 13.219-0.158 0.044-0.31 0.076-0.468 0.125-6.958 2.178-10.97 9.256-8.938 15.75 0.747 2.386 2.204 4.346 4.094 5.782 1.73 1.79 4.454 2.466 7.125 1.5 3.388-1.226 5.531-4.662 5.25-8.063 4.838 7.044 11.348 13.245 17.969 17.565-3.132 2.04-5.007 4.69-4.938 7.56 0.045 1.87 0.5 4.28 2.406 5.16 5.356 2.46 12.173 2.75 18.907 2.68 6.644-0.07 13.36-0.49 18.562-3.03 1.833-0.89 2.139-3.3 2.094-5.15-0.013-0.55-0.101-1.1-0.25-1.63 3.256-0.79 6.06-1.98 8.344-3.53 4.213 3.86 10.941 4.27 16.151 0.66 6-4.15 7.72-12.064 3.85-17.66-3.11-4.492-8.87-6.111-14.126-4.438-1.317-4.594-3.729-9.761-7.406-15.5-8.605-13.428-28.229-23.563-43.969-25.531 0.719-2.053 1.093-4.161 1.093-6.219 10.581 1.08 21.879 1.693 38.594-0.906 5.763-0.896 7.759-2.691 2-7.031-7.125-5.37-15.153-9.126-25.437-8.906 5.516-2.421 10.784-5.283 15.25-8.375 5.825-4.034 7.757-7.3146-1.844-8.9378-4.128-0.6978-8.24-1.157-12.437-1.0937z"/><path style="fill-rule:evenodd;fill:#000000" d="m27.875 37.154a1.6792 1.5113 0 1 1 -3.358 0 1.6792 1.5113 0 1 1 3.358 0z" transform="matrix(2 0 0 2 -28.211 -37.658)"/><path style="stroke-linejoin:round;stroke:#000000;stroke-linecap:round;stroke-width:3;fill:none" d="m41.309 112.22c2.741-8.74 11.136-8.26 19.479-7.06-2.847-3.98-4.653-7.182-4.366-14.439 0.397-10.047 12.123-15.813 19.478-11.418"/>`;
        case 'egg':
            return `<g transform="translate(-23.4 -39.669)"><g fill-rule="evenodd"><path d="m209.88 233.69c-59.35 13.38-111.11 50.07-104.08 76.11 7.24 26.79 68.03 33.82 140.43 11.87 72.59-22.02 136.8-67.49 117.21-88.66-19.96-21.57-94.36-12.67-153.56 0.68z" fill="#555753" fill-opacity=".25098"/><path stroke-linejoin="round" d="m237.39 219.85c0.63 59.72-38.42 111.12-103.87 111.12-65.458 0-109.14-33.88-108.71-115.95 0.425-82.26 54.548-172.74 103.87-173.93 52.62-1.302 107.77 87.89 108.71 178.76z" stroke="#000" stroke-linecap="round" stroke-width="2.8183"/><path d="m200.27 107.27c-4.58 4.32 2.48 11.42 2.87 16.88 11.18 34.97 15.59 72.86 7.97 109.05-8.88 35.66-36.04 67.41-71.85 77.78-14 4.35-28.78 5.33-43.361 5.3-4.701 6.19 8.951 5.84 12.621 7.35 31.12 6.05 66.19 0.87 90.45-20.77 22.64-20.08 33.83-50.84 33.2-80.74 0.18-35.03-8.95-69.68-23.29-101.47-2.63-4.42-4.34-10.71-8.61-13.38z" fill="#c6c6ba" fill-opacity=".25098"/><path stroke-linejoin="round" d="m110.75 105.79c-3.2 12.98-4.72 17.62-14.901 19.36-7.019 1.2-14.096-5.45-11.68-18.55 1.937-10.513 9.93-21.123 18.931-22.584 9.92-1.61 10.24 11.283 7.65 21.774z" stroke-opacity=".2809" fill-opacity=".9382" stroke="#000" stroke-linecap="round" stroke-width="1.1273" fill="#fff"/></g></g>`;
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
        case 'clover':
            return `0 0 660.51 780.1`;
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
        case 'skull':
            return `0 0 256.27 300.86`;
        case 'pizza':
            return `0 0 217.444 144.397`;
        case 'trash':
            return `0 0 15 15`;
        case 'party':
            return `0 0 528.69 983.1`;
        case 'martini':
            return `0 0 15 15`;
        case 'lightbulb':
            return `0 0 100 156`;
        case 'bunny':
            return `0 0 128 128`;
        case 'egg':
            return `0 0 273.61 295.02`;
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
            case 'garbage_pie':
                return 'trash';
            case 'demon_slayer':
                return 'skull';
            case 'utopia':
                return 'martini';
            case 'energetic':
                return 'lightbulb';
            case 'friday':
                return 'mask';
            case 'valentine':
                return 'heart';
            case 'leprechaun':
                return 'clover';
            case 'easter':
                return 'bunny';
            case 'egghunt':
                return 'egg';
            case 'halloween':
                return 'ghost';
            case 'thanksgiving':
                return 'turkey';
            case 'xmas':
                return 'present';
            default:
                return 'star';
        }
    }
    return global.settings.icon;
}

export function drawIcon(icon,size,shade,id){
    let select = '';
    if (id){
        select = `id="${id}" `;
    }
    return `<span ${select}class="flair drawnIcon"><svg class="star${shade}" version="1.1" x="0px" y="0px" width="${size}px" height="${size}px" viewBox="${svgViewBox(icon)}" xml:space="preserve">${svgIcons(icon)}</svg></span>`;
}

export function easterEgg(num,size){
    let easter = getEaster();
    if (easter.active && !global.special.egg[`egg${num}`]){
        return drawIcon('egg', size ? size : 16, 2, `egg${num}`);
    }
    return '';
}

export function easterEggBind(id){
    $(`#egg${id}`).click(function(){
        if (!global.special.egg[`egg${id}`]){
            global.special.egg[`egg${id}`] = true;
            if (id <= 10){
                if (global.race.universe === 'antimatter'){
                    global.race.Plasmid.anti += 10;
                    global.stats.antiplasmid += 10;
                    messageQueue(loc('city_egg_msg',[10,loc('resource_AntiPlasmid_plural_name')]),'success');
                }
                else {
                    global.race.Plasmid.count += 10;
                    global.stats.plasmid += 10;
                    messageQueue(loc('city_egg_msg',[10,loc('resource_Plasmid_plural_name')]),'success');
                }
            }
            else {
                global.race.Phage.count += 5;
                global.stats.phage += 5;
                messageQueue(loc('city_egg_msg',[5,loc('resource_Phage_name')]),'success');
            }
            $(`#egg${id}`).remove();
            $('.popper').hide();
        }
    });
}

export function format_emblem(achieve,size,baseIcon,fool){
    if (!size){
        size = 10;
    }
    if (!baseIcon){
        baseIcon = getBaseIcon(achieve,'achievement');
    }
    let emblem = global.stats.achieve[achieve] && (fool ? global.stats.achieve[achieve].l - 1 : global.stats.achieve[achieve].l) > 1 ? `<p class="flair" title="${sLevel(global.stats.achieve[achieve].l)} ${loc(global.settings.icon)}"><svg class="star${fool ? global.stats.achieve[achieve].l - 1 : global.stats.achieve[achieve].l}" version="1.1" x="0px" y="0px" width="${size}px" height="${size}px" viewBox="${svgViewBox(baseIcon)}" xml:space="preserve">${svgIcons(baseIcon)}</svg></p>` : '';
    emblem = emblem + (global.stats.achieve[achieve] && (fool ? global.stats.achieve[achieve].a - 1 : global.stats.achieve[achieve].a) > 1 ? `<p class="flair" title="${sLevel(global.stats.achieve[achieve].a)} ${loc('universe_antimatter')}"><svg class="star${fool ? global.stats.achieve[achieve].a - 1 : global.stats.achieve[achieve].a}" version="1.1" x="0px" y="0px" width="${size}px" height="${size}px" viewBox="${svgViewBox('atom')}" xml:space="preserve">${svgIcons('atom')}</svg></p>` : '');
    emblem = emblem + (global.stats.achieve[achieve] && (fool ? global.stats.achieve[achieve].e - 1 : global.stats.achieve[achieve].e) > 1 ? `<p class="flair" title="${sLevel(global.stats.achieve[achieve].e)} ${loc('universe_evil')}"><svg class="star${fool ? global.stats.achieve[achieve].e - 1 : global.stats.achieve[achieve].e}" version="1.1" x="0px" y="0px" width="${size}px" height="${size}px" viewBox="${svgViewBox('evil')}" xml:space="preserve">${svgIcons('evil')}</svg></p>` : '');
    emblem = emblem + (global.stats.achieve[achieve] && (fool ? global.stats.achieve[achieve].h - 1 : global.stats.achieve[achieve].h) > 1 ? `<p class="flair" title="${sLevel(global.stats.achieve[achieve].h)} ${loc('universe_heavy')}"><svg class="star${fool ? global.stats.achieve[achieve].h - 1 : global.stats.achieve[achieve].h}" version="1.1" x="0px" y="0px" width="${size}px" height="${size}px" viewBox="${svgViewBox('heavy')}" xml:space="preserve">${svgIcons('heavy')}</svg></p>` : '');
    emblem = emblem + (global.stats.achieve[achieve] && (fool ? global.stats.achieve[achieve].m - 1 : global.stats.achieve[achieve].m) > 1 ? `<p class="flair" title="${sLevel(global.stats.achieve[achieve].m)} ${loc('universe_micro')}"><svg class="star${fool ? global.stats.achieve[achieve].m - 1 : global.stats.achieve[achieve].m}" version="1.1" x="0px" y="0px" width="${size}px" height="${size}px" viewBox="${svgViewBox('micro')}" xml:space="preserve">${svgIcons('micro')}</svg></p>` : '');
    return emblem;
}

export function randomKey(obj){
    var keys = Object.keys(obj);
    return keys[ keys.length * Math.random() << 0];
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

export function calcGenomeScore(genome){
    let genes = 0;

    if (global.stats.achieve[`ascended`]){
        let types = ['l','a','h','e','m'];
        for (let i=0; i<types.length; i++){
            if (global.stats.achieve.ascended.hasOwnProperty(types[i])){
                genes += global.stats.achieve.ascended[types[i]];
            }
        }
    }

    Object.keys(genus_traits[genome.genus]).forEach(function (t){
        genes -= traits[t].val;
    });

    let max_complexity = 2;    
    if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 1){
        max_complexity += global.stats.achieve.technophobe.l;
    }

    let complexity = 0;
    for (let i=0; i<genome.traitlist.length; i++){
        let gene_cost = traits[genome.traitlist[i]].val;
        if (traits[genome.traitlist[i]].val >= 0){
            if (complexity > max_complexity){
                gene_cost -= max_complexity - complexity;
            }
            complexity++;
        }
        genes -= gene_cost;
    }
    return genes;
}

export function getEaster(){
    const date = new Date();
    let year = date.getFullYear();

	let f = Math.floor,
		// Golden Number - 1
		G = year % 19,
		C = f(year / 100),
		// related to Epact
		H = (C - f(C / 4) - f((8 * C + 13)/25) + 19 * G + 15) % 30,
		// number of days from 21 March to the Paschal full moon
		I = H - f(H/28) * (1 - f(29/(H + 1)) * f((21-G)/11)),
		// weekday for the Paschal full moon
		J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
		// number of days from 21 March to the Sunday on or before the Paschal full moon
		L = I - J,
		month = 3 + f((L + 40)/44),
        day = L + 28 - 31 * f(month / 4);
    
    let easter = {
        date: [month-1,day],
        active: false,
        endDate: [month-1,day]
    };

    easter.endDate[1] += 10;
    if ((easter.endDate[0] === 2 && easter.endDate[1] > 31) || (easter.endDate[0] === 3 && easter.endDate[1] > 30)){
        easter.endDate[1] -= easter.endDate[0] === 2 ? 31 : 30;
        easter.endDate[0]++;
    }
    if (date.getMonth() >= easter.date[0] && date.getDate() >= easter.date[1] && date.getMonth() <= easter.endDate[0] && date.getDate() <= easter.endDate[1]){
        easter.active = true;
    }

    return easter;
    
}
