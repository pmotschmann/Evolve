import { global, save, poppers, webWorker, achieve_level, universe_level, resizeGame, clearStates } from './vars.js';
import { loc } from './locale.js';
import { races, traits, genus_traits } from './races.js';
import { actions, actionDesc } from './actions.js';
import { universe_affixes } from './space.js';
import { arpaAdjustCosts, arpaProjectCosts } from './arpa.js';
import { gridDefs } from './industry.js';
import { unlockAchieve, unlockFeat, checkAchievements } from './achieve.js';

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
            restoreGame(){
                let restore_data = save.getItem('evolveBak') || false;
                if (restore_data){
                    importGame(restore_data,true);
                }
            },
            lChange(locale){
                global.settings.locale = locale;
                save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                if (webWorker.w){
                    webWorker.w.terminate();
                }
                window.location.reload();
            },
            setTheme(theme){
                global.settings.theme = theme;
                $('html').removeClass();
                $('html').addClass(theme);
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
            boring(){
                return loc('settings10');
            },
            restoreData(){
                return loc('settings9');
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

export function popover(id,content,opts){
    if (!opts){ opts = {}; }
    if (!opts.hasOwnProperty('elm')){ opts['elm'] = '#'+id; }
    if (!opts.hasOwnProperty('bind')){ opts['bind'] = true; }
    if (!opts.hasOwnProperty('unbind')){ opts['unbind'] = true; }
    if (opts['bind']){
        $(opts.elm).on('mouseover',function(){
            $('.popper').hide();
            let wide = opts['wide'] ? ' wide' : '';
            let classes = opts['classes'] ? opts['classes'] : `has-background-light has-text-dark pop-desc`;
            var popper = $(`<div id="pop${id}" class="popper${wide} ${classes}"></div>`);
            if (opts['attach']){
                $(opts['attach']).append(popper);
            }
            else {
                $(`#main`).append(popper);
            }
            if (content){
                popper.append(typeof content === 'function' ? content({ this: this, popper: popper }) : content);
            }
            poppers[id] = new Popper(
                opts['self'] ? this : $(opts.elm),
                popper,
                opts.hasOwnProperty('prop') ? opts['prop'] : {}
            );
            popper.show();
            if (opts.hasOwnProperty('in') && typeof opts['in'] === 'function'){
                opts['in']({ this: this, popper: popper });
            }
        });
    }
    if (opts['unbind']){
        $(opts.elm).on('mouseout',function(){
            $(`#pop${id}`).hide();
            if (poppers[id]){
                poppers[id].destroy();
                delete poppers[id];
            }
            clearElement($(`#pop${id}`),true);
            if (opts.hasOwnProperty('out') && typeof opts['out'] === 'function'){
                opts['out']({ this: this, popper: $(`#pop${id}`)});
            }
        });
    }
}

window.exportGame = function exportGame(){
    if (global.race['noexport']){
        return 'Export is not available during Race Creation';
    }
    return LZString.compressToBase64(JSON.stringify(global));
}

window.importGame = function importGame(data,utf16){
    let saveState = JSON.parse(utf16 ? LZString.decompressFromUTF16(data) : LZString.decompressFromBase64(data));
    if (saveState && 'evolution' in saveState && 'settings' in saveState && 'stats' in saveState && 'plasmid' in saveState.stats){
        if (webWorker.w){
            webWorker.w.terminate();
        }
        if (saveState.hasOwnProperty('tech') && utf16){
            if (saveState.tech.hasOwnProperty('whitehole') && saveState.tech.whitehole >= 4){
                saveState.tech.whitehole = 3;
                saveState.resource.Soul_Gem.amount += 10;
                saveState.resource.Knowledge.amount += 1500000;
                saveState.stats.know -= 1500000;
            }
            if (saveState.tech.hasOwnProperty('quaked') && saveState.tech.quaked === 2){
                saveState.tech.quaked = 1;
                saveState.resource.Knowledge.amount += 500000;
                saveState.stats.know -= 500000;
            }
        }
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(saveState)));
        window.location.reload();
    }
}

export function powerGrid(type,reset){
    let grids = gridDefs();

    let power_structs = [];
    switch (type){
        case 'power':
            power_structs = [
                'prtl_ruins:arcology','city:apartment','int_alpha:habitat','int_alpha:luxury_condo','spc_red:spaceport','int_alpha:starport','int_blackhole:s_gate','gxy_gateway:starbase',
                'gxy_gateway:ship_dock','prtl_ruins:hell_forge','int_neutron:stellar_forge','int_neutron:citadel','city:coal_mine','spc_moon:moon_base','spc_red:red_tower','spc_home:nav_beacon',
                'int_proxima:xfer_station','gxy_stargate:telemetry_beacon','int_nebula:nexus','gxy_stargate:gateway_depot','spc_dwarf:elerium_contain','spc_gas:gas_mining','spc_belt:space_station',
                'spc_gas_moon:outpost','gxy_gorddon:embassy','gxy_gorddon:dormitory','gxy_alien1:resort','spc_gas_moon:oil_extractor','int_alpha:int_factory','city:factory','spc_red:red_factory',
                'spc_dwarf:world_controller','prtl_fortress:turret','prtl_badlands:war_drone','city:wardenclyffe','city:biolab','city:mine','city:rock_quarry','city:cement_plant','city:sawmill',
                'city:mass_driver','int_neutron:neutron_miner','prtl_fortress:war_droid','prtl_pit:soul_forge','gxy_chthonian:excavator','int_blackhole:far_reach','prtl_badlands:sensor_drone',
                'prtl_badlands:attractor','city:metal_refinery','gxy_stargate:gateway_station','gxy_alien1:vitreloy_plant','gxy_alien2:foothold','gxy_gorddon:symposium',
                'int_blackhole:mass_ejector','city:casino','spc_hell:spc_casino','prtl_fortress:repair_droid','gxy_stargate:defense_platform','prtl_ruins:guard_post',
                'prtl_lake:cooling_tower','prtl_lake:harbour','prtl_spire:purifier','prtl_ruins:archaeology','prtl_pit:gun_emplacement','prtl_gate:gate_turret','prtl_pit:soul_attractor',
                'prtl_gate:infernite_mine','int_sirius:ascension_trigger'
            ];
            break;
        case 'moon':
            power_structs = ['spc_moon:helium_mine','spc_moon:iridium_mine','spc_moon:observatory'];
            break;
        case 'red':
            power_structs = ['spc_red:living_quarters','spc_red:exotic_lab','spc_red:red_mine','spc_red:fabrication','spc_red:biodome','spc_red:vr_center'];
            break;
        case 'belt':
            power_structs = ['spc_belt:elerium_ship','spc_belt:iridium_ship','spc_belt:iron_ship'];
            break;
        case 'alpha':
            power_structs = ['int_alpha:fusion','int_alpha:mining_droid','int_alpha:processing','int_alpha:laboratory','int_alpha:g_factory','int_alpha:exchange','int_alpha:zoo'];
            break;
        case 'nebula':
            power_structs = ['int_nebula:harvester','int_nebula:elerium_prospector'];
            break;
        case 'gateway':
            power_structs = ['gxy_gateway:bolognium_ship','gxy_gateway:dreadnought','gxy_gateway:cruiser_ship','gxy_gateway:frigate_ship','gxy_gateway:corvette_ship','gxy_gateway:scout_ship'];
            break;
        case 'alien2':
            power_structs = ['gxy_alien2:armed_miner','gxy_alien2:ore_processor','gxy_alien2:scavenger'];
            break;
        case 'lake':
            power_structs = ['prtl_lake:bireme','prtl_lake:transport'];
            break;
        case 'spire':
            power_structs = ['prtl_spire:port','prtl_spire:base_camp','prtl_spire:mechbay'];
            break;
    }

    if (reset){
        grids[type].l.length = 0;
    }

    power_structs.forEach(function(struct){
        if (!grids[type].l.includes(struct)){
            grids[type].l.push(struct);
        }
    });
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

export function buildQueue(){
    clearDragQueue();
    clearElement($('#buildQueue'));
    $('#buildQueue').append($(`<h2 class="has-text-success is-sr-only">${loc('building_queue')}</h2>`));

    let queue = $(`<ul class="buildList"></ul>`);
    $('#buildQueue').append(queue);

    queue.append($(`<li v-for="(item, index) in queue"><a v-bind:id="setID(index)" class="has-text-warning queued" v-bind:class="{ 'qany': item.qa }" @click="remove(index)"><span v-bind:class="setData(index,'res')" v-bind="setData(index,'data')">{{ item.label }}{{ item.q | count }}</span> [<span v-bind:class="{ 'has-text-danger': item.cna, 'has-text-success': !item.cna }">{{ item.time | time }}{{ item.t_max | max_t(item.time) }}</span>]</a></li>`));

    try {
        vBind({
            el: '#buildQueue',
            data: global.queue,
            methods: {
                remove(index){
                    if (global.queue.queue[index].q > 1){
                        global.queue.queue[index].q -= global.queue.queue[index].qs;
                        if (global.queue.queue[index].q <= 0){
                            global.queue.queue.splice(index,1);
                        }
                    }
                    else {
                        global.queue.queue.splice(index,1);
                    }
                },
                setID(index){
                    return `q${global.queue.queue[index].id}${index}`;
                },
                setData(index,prefix){
                    let c_action;
                    let segments = global.queue.queue[index].id.split("-");
                    if (segments[0].substring(0,4) === 'arpa'){
                        c_action = segments[0].substring(4);
                    }
                    else if (segments[0] === 'city' || segments[0] === 'starDock'){
                        c_action = actions[segments[0]][segments[1]];
                    }
                    else {
                        Object.keys(actions[segments[0]]).forEach(function (region){
                            if (actions[segments[0]][region].hasOwnProperty(segments[1])){
                                c_action = actions[segments[0]][region][segments[1]];
                            }
                        });
                    }

                    let final_costs = {};
                    if (c_action['cost']){
                        let costs = adjustCosts(c_action.cost);
                        Object.keys(costs).forEach(function (res){
                            let cost = costs[res]();
                            if (cost > 0){
                                final_costs[`${prefix}-${res}`] = cost;
                            }
                        });
                    }

                    return final_costs;
                }
            },
            filters: {
                time(time){
                    return timeFormat(time);
                },
                count(q){
                    return q > 1 ? ` (${q})`: '';
                },
                max_t(max,time){
                    return time === max || time < 0 ? '' : ` / ${timeFormat(max)}`;
                }
            }
        });
        dragQueue();
    }
    catch {
        global.queue.queue = [];
    }
}

function clearDragQueue(){
    let el = $('#buildQueue .buildList')[0];
    if (el){
        let sort = Sortable.get(el);
        if (sort){
            sort.destroy();
        }
    }
}

function dragQueue(){
    let el = $('#buildQueue .buildList')[0];
    Sortable.create(el,{
        onEnd(e){
            let order = global.queue.queue;
            order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
            global.queue.queue = order;
            buildQueue();
            resizeGame();
        }
    });
    resizeGame();
    attachQueuePopovers();
}

var pop_lock = false;
function attachQueuePopovers(){
    for (let i=0; i<global.queue.queue.length; i++){
        let pop_target = '#main';
        let id = `q${global.queue.queue[i].id}${i}`;

        let c_action;
        let segments = global.queue.queue[i].id.split("-");
        if (segments[0].substring(0,4) === 'arpa'){
            c_action = segments[0].substring(4);
        }
        else if (segments[0] === 'city' || segments[0] === 'starDock'){
            c_action = actions[segments[0]][segments[1]];
        }
        else {
            Object.keys(actions[segments[0]]).forEach(function (region){
                if (actions[segments[0]][region].hasOwnProperty(segments[1])){
                    c_action = actions[segments[0]][region][segments[1]];
                }
            });
        }

        $('#'+id).on('mouseover',function(){
            if (pop_lock !== id){
                cleanBuildPopOver(pop_lock);
                let wide = segments[0].substring(0,4) !== 'arpa' && c_action['wide'] ? ' wide' : '';

                var popper = $(`<div id="pop${id}" class="popper${wide} has-background-light has-text-dark pop-desc"></div>`);
                $(pop_target).append(popper);
                if (segments[0].substring(0,4) === 'arpa'){
                    popper.append(arpaProjectCosts(100,c_action));
                }
                else {
                    actionDesc(popper,c_action,global[segments[0]][segments[1]],false);
                }
                popper.show();
                poppers[id] = new Popper($('#buildQueue'),popper);
                pop_lock = id;
            }
        });
    }
    $('#buildQueue').on('mouseout',function(){
        cleanBuildPopOver(pop_lock);
        pop_lock = false;
    });
}

export function cleanBuildPopOver(id){
    $(`#pop${id}`).hide();
    vBind({el: `#popTimer`},'destroy');
    if (poppers[id]){
        poppers[id].destroy();
    }
    clearElement($(`#pop${id}`),true);
}

export function modRes(res,val,notrack,buffer){
    let count = global.resource[res].amount + val;
    let success = true;
    if (count > global.resource[res].max && global.resource[res].max != -1){
        count = global.resource[res].max;
    }
    else if (count < 0){
        if (!buffer || (buffer && (count * -1) > buffer)){
            success = false;
        }
        count = 0;
    }
    if (!Number.isNaN(count)){
        global.resource[res].amount = count;
        if (!notrack){
            global.resource[res].delta += val;
            if (res === 'Mana' && val > 0){
                global.resource[res].gen_d += val;
            }
        }
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
        loc(`civics_gov_name6`),
        loc(`civics_gov_name7`),
        loc(`civics_gov_name8`),
        loc(`civics_gov_name9`),
        loc(`civics_gov_name10`),
        loc(`civics_gov_name11`),
    ];

    return {
        s0: Math.rand(0,14),
        s1: filler[Math.rand(0,16)]
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
    if (offset && typeof offset === 'number'){
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
            case 'magic':
                if (global.stats.achieve.ascended.hasOwnProperty('mg')){
                    boost = global.stats.achieve.ascended.mg * global.race.Harmony.count;
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
            if (!['Morale','HellArmy','Structs','Bool','Plasmid','AntiPlasmid','Phage','Dark','Harmony'].includes(res)){
                var testCost = track && track.id[c_action.id] ? Number(costs[res](track.id[c_action.id])) : Number(costs[res]());
                if (testCost > 0){
                    let res_have = res === 'Supply' ? global.portal.purifier.supply : Number(global.resource[res].amount);
                    let res_max = res === 'Supply' ? global.portal.purifier.sup_max : global.resource[res].max;
                    let res_diff = res === 'Supply' ? global.portal.purifier.diff : global.resource[res].diff;

                    if (track){
                        res_have += res_diff * track.t;
                        if (track.r[res]){
                            res_have -= Number(track.r[res]);
                            track.r[res] += testCost;
                        }
                        else {
                            track.r[res] = testCost;
                        }
                        if (res_max >= 0 && res_have > res_max){
                            res_have = res_max;
                        }
                    }
                    if (testCost > res_have){
                        if (res_diff > 0){
                            let r_time = (testCost - res_have) / res_diff;
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

// This function returns the time to complete all remaining Arpa segments.
// Note: remain is a fraction between 0 and 1 representing the fraction of
// remaining arpa segments to be completed
export function arpaTimeCheck(project, remain, track){
    let costs = arpaAdjustCosts(project.cost);
    let allRemainingSegmentsTime = 0;
    Object.keys(costs).forEach(function (res){
        let allRemainingSegmentsCost = Number(costs[res]()) * remain;
        if (allRemainingSegmentsCost > 0){
            let res_have = Number(global.resource[res].amount);

            if (track){
                res_have += global.resource[res].diff * track.t;
                if (track.r[res]){
                    res_have -= Number(track.r[res]);
                    track.r[res] += allRemainingSegmentsCost;
                }
                else {
                    track.r[res] = allRemainingSegmentsCost;
                }
                if (global.resource[res].max >= 0 && res_have > global.resource[res].max){
                    res_have = global.resource[res].max;
                }
            }

            if (allRemainingSegmentsCost > res_have){
                if (global.resource[res].diff > 0){
                    let r_time = (allRemainingSegmentsCost - res_have) / global.resource[res].diff;
                    if (r_time > allRemainingSegmentsTime){
                        allRemainingSegmentsTime = r_time;
                    }
                }
                else {
                    allRemainingSegmentsTime = -9999999;
                }
            }
        }
    });
    if (track){
        if (typeof track.id[project.id] === "undefined"){
            track.id[project.id] = 1;
        }
        else {
            track.id[project.id]++;
        }
        track.t += allRemainingSegmentsTime;
    }
    return allRemainingSegmentsTime
}

export function clearElement(elm,remove){
    elm.find('.vb').each(function(){
        try {
            $(this)[0].__vue__.$destroy();
        }
        catch(e){}
    });
    if (remove){
        try {
            elm[0].__vue__.$destroy();
        }
        catch(e){}
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

export function darkEffect(universe, flag, info){
    switch (universe){
        case 'standard':
            if (global.race.universe === 'standard' || info){
                let de = global.race.Dark.count;
                if (global.race.Harmony.count > 0){
                    de *= 1 + (global.race.Harmony.count * 0.001);
                }
                return 1 + (de / 200);
            }
            return 0;

        case 'evil':
            if (global.race.universe === 'evil' || info){
                let de = global.race.Dark.count;
                if (global.race.Harmony.count > 0){
                    de *= 1 + (global.race.Harmony.count * 0.01);
                }
                return (1 + ((Math.log2(10 + de) - 3.321928094887362) / 5));
            }
            return 1;

        case 'micro':
            if (global.race.universe === 'micro' || info){
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
            if (global.race.universe === 'heavy' || info){
                let de = global.race.Dark.count;
                if (global.race.Harmony.count > 0){
                    de *= 1 + (global.race.Harmony.count * 0.01);
                }
                return 0.995 ** de;
            }
            return 1;

        case 'antimatter':
            if (global.race.universe === 'antimatter' || info){
                let de = global.race.Dark.count;
                if (global.race.Harmony.count > 0){
                    de *= 1 + (global.race.Harmony.count * 0.01);
                }
                return 1 + (Math.log(50 + de) - 3.912023005428146) / 5;
            }
            return 0;

        case 'magic':
            if (global.race.universe === 'magic' || info){
                let de = global.race.Dark.count;
                if (global.race.Harmony.count > 0){
                    de *= 1 + (global.race.Harmony.count * 0.01);
                }
                return 1 + (Math.log(50 + de) - 3.912023005428146) / 3;
            }
            return 0;
    }

    return 0;
}

export const calc_mastery = (function(){
    var mastery;
    return function(recalc){
        if (mastery && !recalc){
            return mastery;
        }
        else if (global.genes['challenge'] && global.genes['challenge'] >= 2){
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
            mastery = achieve_level * m_rate;
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
})();

export const calcPillar = (function(){
    var bonus;
    return function(recalc){
        if (!bonus || recalc){
            let active = 0;
            Object.keys(global.pillars).forEach(function(race){
                if (races[race] && global.race.species === race){
                    active += 4;
                }
                else if (races[race]){
                    active++;
                }
            });
            bonus = [
                1 + (active / 100), // Production
                1 + (active * 2 / 100) // Storage
            ];
        }
        return bonus;
    }
})();

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
        case 'vacuum':
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

    if (global.race['cataclysm']){
        new_plasmid += 300;
    }

    gains.plasmid = challenge_multiplier(new_plasmid,type);
    gains.phage = gains.plasmid > 0 ? challenge_multiplier(Math.floor(Math.log2(gains.plasmid) * Math.E * phage_mult),type) : 0;

    if (type === 'bigbang'){
        let new_dark = +(Math.log(1 + (global.interstellar.stellar_engine.exotic * 40))).toFixed(3);
        new_dark += +(Math.log2(global.interstellar.stellar_engine.mass - 7)/2.5).toFixed(3);
        new_dark = challenge_multiplier(new_dark,'bigbang',3);
        gains.dark = new_dark;
    }
    else if (type === 'vacuum'){
        let new_dark = +(Math.log2(global.resource.Mana.gen)/5).toFixed(3);
        new_dark = challenge_multiplier(new_dark,'vacuum',3);
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

export function adjustCosts(costs, wiki){
    if ((costs['RNA'] || costs['DNA']) && global.genes['evolve']){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'RNA' || res === 'DNA'){
                newCosts[res] = function(){ return Math.round(costs[res]() * 0.8); }
            }
        });
        return newCosts;
    }
    costs = technoAdjust(costs, wiki);
    costs = kindlingAdjust(costs, wiki);
    costs = scienceAdjust(costs);
    costs = rebarAdjust(costs, wiki);
    return craftAdjust(costs, wiki);
}

function technoAdjust(costs, wiki){
    if (global.civic.govern.type === 'technocracy'){
        let adjust = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 1 : 1.01 ) : 1.02;
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Knowledge'){
                newCosts[res] = function(){ return Math.round(costs[res](wiki) * 0.92); }
            }
            else if (res === 'Money' || res === 'Structs' || res === 'Custom'){
                newCosts[res] = function(){ return costs[res](wiki); }
            }
            else {
                newCosts[res] = function(){ return Math.round(costs[res](wiki) * adjust); }
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

function kindlingAdjust(costs, wiki){
    if (global.race['kindling_kindred'] && (costs['Lumber'] || costs['Plywood'])){
        var newCosts = {};
        let adjustRate = 1 + (traits.kindling_kindred.vars[0] / 100);
        Object.keys(costs).forEach(function (res){
            if (res !== 'Lumber' && res !== 'Plywood' && res !== 'Structs'){
                newCosts[res] = function(){ return Math.round(costs[res](wiki) * adjustRate) || 0; }
            }
            else if (res === 'Structs'){
                newCosts[res] = function(){ return costs[res](wiki); }
            }
        });
        return newCosts;
    }
    return costs;
}

function craftAdjust(costs, wiki){
    if (global.race['hollow_bones'] && (costs['Plywood'] || costs['Brick'] || costs['Wrought_Iron'] || costs['Sheet_Metal'] || costs['Mythril'] || costs['Aerogel'] || costs['Nanoweave'] || costs['Scarletite'])){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Plywood' || res === 'Brick' || res === 'Wrought_Iron' || res === 'Sheet_Metal' || res === 'Mythril' || res === 'Aerogel' || res === 'Nanoweave' || res === 'Scarletite'){
                newCosts[res] = function(){ return Math.round(costs[res](wiki) * (1 - (traits.hollow_bones.vars[0] / 100))); }
            }
            else {
                newCosts[res] = function(){ return Math.round(costs[res](wiki)); }
            }
        });
        return newCosts;
    }
    return costs;
}

function rebarAdjust(costs, wiki){
    if (costs['Cement'] && global.tech['cement'] && global.tech['cement'] >= 2){
        let discount = global.tech['cement'] >= 3 ? 0.8 : 0.9;
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Cement'){
                newCosts[res] = function(){ return Math.round(costs[res](wiki) * discount) || 0; }
            }
            else {
                newCosts[res] = function(){ return Math.round(costs[res](wiki)); }
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
        case 'magic':
            return `<path class="magic" d="m 2077.0957,2355.0556 c -24.8548,-6.6306 -43.8442,-12.4931 -65.1438,-20.1115 -171.2303,-61.2458 -332.546,-186.5828 -484.656,-376.562 -106.9479,-133.5736 -211.9033,-304.0752 -307.5304,-499.5874 -70.9505,-145.0603 -137.2376,-301.6744 -201.0755,-475.07329 -4.0445,-10.9859 -7.4891,-20.1129 -7.6546,-20.2824 -0.1656,-0.1694 -2.0374,1.7618 -4.1597,4.2917 -41.97221,50.03289 -102.85691,112.12769 -165.25321,168.53769 -153.4012,138.6841 -322.8342,254.6704 -451.2868,308.9308 -4.8375,2.0435 -9.6944,4.102 -10.793,4.5744 l -1.9977,0.8591 14.4133,7.0194 c 72.3515,35.2357 143.3639,78.5554 206.1228,125.7414 218.7562,164.4739 368.1707,393.9487 437.81411,672.4065 3.7109,14.8375 9.1943,38.7303 9.0117,39.2665 -0.069,0.2024 -1.3235,-3.0502 -2.788,-7.228 -74.09121,-211.3582 -207.71511,-385.1177 -394.71211,-513.2685 -102.107,-69.9749 -219.4845,-126.1019 -348.488,-166.6383 -76.1077,-23.9151 -155.9429,-42.2005 -232.883496,-53.3396 -6.991,-1.0121 -12.8528,-1.8883 -13.0261,-1.947 -0.1733,-0.059 2.0738,-1.6288 4.9936,-3.4891 2.9198,-1.8603 15.625,-10.0516 28.2339,-18.2031 204.092496,-131.9427 358.291896,-247.07 478.472596,-357.2338 37.0992,-34.0071 77.0506,-73.8638 107.6314,-107.3762 86.2451,-94.51319 148.9362,-188.57859 189.3356,-284.08999 30.7863,-72.7845 49.1302,-147.8337 55.0585,-225.2576 0.8677,-11.3324 1.6179,-24.3907 1.6179,-28.1635 l 0,-2.8677 -2.3833,-0.2589 c -5.6397,-0.6126 -53.3922,-2.328 -84.3238,-3.0291 -26.1322,-0.5923 -105.9829,-0.2965 -125.748,0.4658 -35.3648,1.3639 -61.1426,2.7941 -86.7072,4.8105 -195.6367,15.431 -343.0035,61.1297 -446.9275,138.593 -2.4968,1.8611 -4.029,2.8664 -3.4048,2.2341 0.9758,-0.9885 397.2225,-336.9788 399.0477,-338.3654 0.4983,-0.3785 8.2687,0.05 30.6293,1.691 273.5285,20.0676 411.83311,27.9616 556.33281,31.7538 29.6737,0.7788 110.952,1.0595 138.2321,0.4775 83.5286,-1.7821 143.7695,-6.6707 194.0695,-15.7487 47.0041,-8.4831 83.1621,-21.2812 103.3974,-36.5973 1.6154,-1.2226 2.9812,-2.1619 3.0353,-2.0872 0.054,0.075 -0.079,2.1785 -0.2952,4.6753 -0.578,6.6693 -0.5481,29.498 0.048,36.3171 3.3368,38.2002 14.0507,70.8483 33.8884,103.2667 18.8519,30.8073 47.6861,61.0826 82.1419,86.2473 37.3245,27.2597 81.564,49.9843 131.8765,67.7412 4.8688,1.7184 8.2555,3.0024 7.5259,2.8535 -0.7295,-0.1489 -6.3473,-1.3924 -12.484,-2.7634 -39.6642,-8.861 -104.6887,-20.5993 -168.0021,-30.328 -137.3768,-21.1093 -273.1583,-35.4146 -362.8049,-38.2235 l -9.8479,-0.3086 -0.224,1.0898 c -0.1233,0.5995 -0.335,2.5199 -0.4706,4.2677 -1.3397,17.2691 -1.7023,22.4205 -2.2846,32.4584 -2.3935,41.2643 -2.3955,89.1364 -0.01,134.8273 11.3803,217.5701 77.3475,473.27869 189.8401,735.87559 89.2575,208.3584 210.5193,422.3508 332.3606,586.5215 22.7139,30.605 33.0709,42.8702 44.5166,52.7187 25.6187,22.0437 46.811,23.8716 65.2335,5.6265 19.5207,-19.3327 34.7161,-60.9422 45.5423,-124.7077 19.3386,-113.9042 23.2932,-297.6572 10.9059,-506.7671 -4.6678,-78.7985 -10.1013,-140.5522 -20.8699,-237.1961 -5.9357,-53.2693 -7.4546,-65.7004 -8.6502,-70.7914 -4.7369,-20.171 -27.3114,-47.5028 -65.7926,-79.6576 -11.906,-9.9486 -20.1748,-16.4224 -39.1544,-30.6551 -8.4267,-6.3191 -15.3189,-11.6171 -15.3159,-11.7734 0,-0.1563 1.2797,-0.9816 2.8373,-1.8339 14.6036,-7.9917 42.9197,-26.1494 64.2088,-41.17369 35.0761,-24.7546 77.4208,-59.2093 108.4143,-88.2139 58.9609,-55.1774 106.4613,-109.4316 139.8321,-159.7139 2.693,-4.0578 4.9524,-7.3218 5.0209,-7.2532 0.069,0.068 -0.9793,4.6953 -2.3284,10.2819 -52.0714,215.624 -73.4586,458.30359 -63.0753,715.71049 8.1008,200.8217 36.667,415.9599 82.2909,619.7502 l 2.6625,11.8924 -4.124,2.8336 c -25.7438,17.6888 -44.4201,32.0283 -57.3292,44.017 -19.4405,18.0544 -30.6873,35.3946 -36.0405,55.5665 -3.2336,12.1849 -4.2393,21.7435 -4.2035,39.9489 0.043,21.9591 1.571,38.7035 9.4024,103.0498 1.3371,10.9859 2.4091,19.9949 2.3823,20.0199 -0.027,0.025 -1.8874,-0.445 -4.1345,-1.0444 z m 326.7144,-985.6489 c -17.4427,-32.7693 -52.6734,-76.4714 -96.8446,-120.1314 -30.3662,-30.0148 -57.7931,-52.8046 -81.5396,-67.7535 -6.8082,-4.2859 -19.6404,-11.0063 -22.8544,-11.9693 -0.9739,-0.2918 -1.7706,-0.6524 -1.7706,-0.8014 0,-0.149 1.2767,-0.754 2.8373,-1.3444 8.1023,-3.0654 22.7254,-11.5869 35.2957,-20.5684 21.4993,-15.3612 43.2465,-34.1516 68.6986,-59.358 42.609,-42.1976 76.3979,-83.8447 94.6619,-116.67699 2.2626,-4.0672 4.2245,-7.6252 4.36,-7.9065 0.1826,-0.3795 0.3097,-0.3795 0.4923,0 0.1354,0.2813 2.0845,3.8162 4.3314,7.8552 18.2956,32.88899 52.1844,74.66389 94.6871,116.72119 25.6446,25.3759 47.2008,44.0026 68.702,59.3651 12.5703,8.9815 27.1934,17.503 35.2957,20.5684 1.5605,0.5904 2.8373,1.1777 2.8373,1.3051 0,0.1274 -1.2768,0.7145 -2.8373,1.305 -1.5605,0.5904 -5.6973,2.5407 -9.1928,4.334 -24.7032,12.6736 -57.8306,39.0407 -94.1346,74.9245 -44.1711,43.66 -79.4018,87.3621 -96.8445,120.1314 -1.5749,2.9588 -2.9656,5.3796 -3.0904,5.3796 -0.1249,0 -1.5156,-2.4208 -3.0905,-5.3796 z M 166.36129,670.71331 c 0.452,-0.4994 0.9239,-0.9079 1.0487,-0.9079 0.1248,0 -0.1428,0.4085 -0.5947,0.9079 -0.4519,0.4993 -0.9238,0.9079 -1.0487,0.9079 -0.1248,0 0.1428,-0.4086 0.5947,-0.9079 z"/>`;
        case 'heart':
            return `<g transform="translate(-607.63544,-698.58531)"><path class="star" stroke-linejoin="bevel" d="m617.13,701.11c-1.4819-1.5161-3.8406-2.4136-5.9091-1.5906-3.1802,1.2712-3.8517,4.1218-2.2123,6.797,1.8712,2.8746,4.5334,5.1378,7.2328,7.2307,0.50882,0.48806,1.0416,0.83797,1.5551,0.16685,2.744-2.1002,5.4398-4.3792,7.3689-7.2612,1.8138-3.0332,1.0747-5.4453-1.935-6.8574-2.1226-0.94739-4.5563-0.0556-6.1004,1.5147z" stroke="#333" stroke-linecap="square" stroke-miterlimit="4" stroke-dasharray="none" stroke-width="1"/></g>`;
        case 'clover':
            return `<g transform="translate(-126.4 -67.282)"><path style="stroke:#000000;stroke-width:.25pt" d="m452.02 434.8c-34.94 243.11-14.78 319.53 160.84 411.18 15.36 3.36 40.79 0.96 33.11-20.15-199.14-114.69-188.7-141.27-175.23-393.91-43.63 768.78 702.86-132.4 10.47-30.23 711.79-66.28-46.43-703.13-22.24-23.18 11.94-684.77-733.52 34.13-25.81 24.02-675.4-13.74-31.72 748.27 18.86 32.27z"/><path style="fill-rule:evenodd;fill:url(#radialGradient2313)" d="m445.85 337.53c-16.28-66.5-8.14-216.47-116.04-242.26-151.33-4.074-200.87 130.29-185.26 195.44 38 96.36 177.79 86.86 278.91 93.65"/><path style="fill-rule:evenodd;fill:url(#radialGradient2317)" d="m464.84 325.36c18.32-95 22.39-222.58 130.29-248.37 151.34-4.072 204.95 126.22 179.16 191.37-54.29 96.36-173.73 111.29-274.84 118.08"/><path style="fill-rule:evenodd;fill:url(#radialGradient2319)" d="m443.15 455.24c-15.85 66.04-26.25 249.56-131.26 275.17-124.88 30.51-195.49-129.38-180.3-194.07 36.99-95.68 199.51-120.86 297.91-127.6"/><path style="fill-rule:evenodd;fill:url(#radialGradient2321)" d="m477.05 465.75c16.29 66.5-12.21 244.98 95.69 270.77 151.33 4.07 211.05-181.19 195.44-246.34-38-96.37-163.55-84.83-262.62-81.44"/></g>`;
        case 'candy':
            return `<g transform="translate(-278 -354.36)"><circle cx="378" cy="453" r="95" stroke="#fff" stroke-width="10" fill-opacity="0" stroke-opacity="1"/><path d="m378 453.77s-13.75 8.52-12.33 23.79c1.42 15.25 26.72 39.51 35.33 50.73 5.08 6.62 7.41 13.49 8.51 18.06 12.92-4.43 24.6-11.54 34.42-20.62-4.16-3.98-11.17-10.44-16.67-14.06-8.18-5.39-33.61-11.74-47.78-25.13-13.78-13.02-1.48-32.77-1.48-32.77z" fill-rule="evenodd"/><path id="strip" d="m378 453.46s-13.75 8.83-12.33 24.1c1.42 15.25 26.72 39.51 35.33 50.73 5.08 6.62 7.41 13.49 8.51 18.06 12.92-4.43 24.6-11.54 34.42-20.62-4.16-3.98-11.17-10.44-16.67-14.06-8.18-5.39-33.61-11.74-47.78-25.13-13.78-13.02-1.48-33.08-1.48-33.08z" fill-rule="evenodd"/><path opacity="0" d="m93.178 199.59c-1.111-0.11-4.52-0.56-7.576-0.99-39.596-5.64-72.571-35.43-82.276-74.35-4.0224-16.12-3.8672-34.85 0.4165-50.241 4.7836-17.188 13.568-32.263 25.888-44.426 6.008-5.93 9.008-8.397 15.42-12.677 26.251-17.523 59.78-21.405 89.54-10.367 23.87 8.851 43.44 26.544 54.93 49.658 11.78 23.69 13.35 52.673 4.21 77.653-5.15 14.06-12.74 25.97-23.29 36.52-15.08 15.08-33.67 24.6-54.79 28.06-5.62 0.92-18.348 1.58-22.472 1.16zm20.692-6.07c4.73-0.69 11.02-2.09 14.83-3.3 2.06-0.66 1.99-1.17-1.13-7.75-2.57-5.43-4.84-8.5-15.09-20.33-9.65-11.14-13.822-16.34-17.533-21.85-6.003-8.92-7.809-13.91-7.485-20.69 0.275-5.75 2.422-10.47 6.968-15.33 1.736-1.86 3.012-3.37 2.835-3.37-1.034 0-7.474 3.36-9.806 5.13-3.841 2.9-5.401 4.72-7.29 8.5-1.565 3.14-1.638 3.55-1.628 9.09 0.017 9.16 2.405 17.81 9.991 36.17 5.884 14.25 6.508 16.71 7.219 28.48 0.197 3.26 0.596 5.99 0.909 6.21 0.738 0.53 10.88-0.03 17.21-0.96zm-54.161-13.01c2.969-7.02 3.307-9.2 5.199-33.65 1.222-15.78 2.313-22.89 4.616-30.05 1.861-5.8 2.946-7.68 6.425-11.14 4.668-4.64 10.067-6.755 17.461-6.836l3.809-0.042-2.627-1.243c-6.412-3.033-15.238-3.469-20.595-1.016-5.703 2.61-12.182 10.537-17.818 21.787-1.391 2.78-4.578 9.94-7.083 15.92-2.504 5.98-5.073 11.77-5.709 12.88-1.56 2.71-6.967 9.67-10.377 13.36l-2.779 3 1.072 1.45c1.339 1.81 7.283 7.18 11.617 10.49 4.387 3.35 13.659 8.88 14.58 8.7 0.406-0.07 1.4-1.7 2.209-3.61zm109.08-15.6c2.16-2.29 5.44-6.24 7.29-8.77 3.77-5.16 8.87-13.78 8.61-14.57-0.26-0.77-7.8-3.68-11.76-4.54-1.92-0.42-10.76-1.33-19.65-2.03-19.82-1.56-26.79-2.49-34.6-4.65-12.36-3.41-19.093-11.95-19.231-24.38l-0.042-3.81-1.242 2.62c-3.037 6.42-3.49 15.2-1.057 20.51 3.712 8.11 15.982 16.2 38.472 25.36 12.42 5.05 16.94 7.84 25.28 15.57 1.66 1.55 3.25 2.83 3.52 2.84s2.26-1.85 4.41-4.15zm-152.35-37.73c5.873-2.72 8.004-4.29 21.029-15.47 17.167-14.747 24.567-20.096 32.298-23.352 2.824-1.189 3.878-1.352 8.766-1.352 5.341 0 5.703 0.071 9.378 1.826 2.443 1.167 5.041 2.965 7.198 4.983 1.856 1.736 3.374 3.002 3.374 2.813s-0.763-1.977-1.696-3.973c-3.17-6.78-7.614-11.448-12.951-13.603-2.317-0.936-3.7-1.115-8.334-1.08-9.035 0.068-16.363 2.083-35.102 9.657-6.529 2.638-12.893 5.094-14.143 5.457-3.258 0.948-8.49 1.666-15.026 2.062l-5.6818 0.344v6.308c0 8.1 1.6093 18.39 4.1094 26.26 0.6204 1.96 0.6824 1.95 6.7814-0.88zm119.42-7.77c6.68-1.61 13.27-3.91 24.63-8.6 13.92-5.75 16.43-6.37 28.78-7.18l5.18-0.34-0.01-5.868c-0.02-7.727-2.24-21.047-4.53-27.067l-0.49-1.274-2.54 1c-7.5 2.959-10.66 5.159-24.12 16.815-11.14 9.647-16.35 13.824-21.86 17.534-8.91 6-13.9 7.81-20.68 7.48-5.78-0.27-10.47-2.41-15.41-7.03-3.8-3.55-3.94-3.26-1.15 2.33 3.47 6.93 8.97 11.87 14.89 13.37 3.12 0.79 11.5 0.23 17.31-1.17zm-9.96-17.13c8.05-3.707 15.33-14.551 24.43-36.392 6.26-15.032 7.56-17.237 15.54-26.307l3.51-3.989-4.02-3.867c-6.88-6.625-21.24-16.497-23.39-16.073-0.92 0.183-3.38 6.421-4.35 11.025-0.42 2.008-1 6.403-1.28 9.767s-0.95 11.457-1.49 17.985c-1.84 22.463-4.4 32.049-10.15 38.137-4.61 4.869-8.86 6.7-16.87 7.257l-5.06 0.347 2.02 0.91c7.05 3.17 15.76 3.66 21.11 1.2zm-18.07-6.566c5.82-2.912 9.87-6.851 12.31-11.991 1.19-2.501 1.32-3.355 1.31-8.586-0.01-9.158-2.4-17.805-9.99-36.168-5.83-14.107-6.46-16.585-7.22-28.355l-0.33-5.1773h-5.224c-6.618 0-15.005 1.1448-22.376 3.0544-3.166 0.8202-5.837 1.4912-5.935 1.4912-1.03 0 2.546 8.1867 5.477 12.539 0.973 1.444 6.292 7.893 11.82 14.331 14.738 17.167 20.088 24.566 23.348 32.298 1.19 2.823 1.35 3.878 1.35 8.765 0 5.341-0.07 5.704-1.82 9.379-1.18 2.468-2.97 5.044-5.06 7.271-3.55 3.799-3.26 3.943 2.34 1.149zm-5-4.162c1.18-3.415 1.4-4.901 1.43-9.596 0.03-5.022-0.1-5.837-1.34-8.476-3.812-8.139-15.541-15.915-37.521-24.878-13.412-5.469-15.445-6.66-23.946-14.03l-5.257-4.558-4.102 4.253c-2.256 2.339-5.564 6.178-7.352 8.532-3.552 4.677-9.093 13.5-9.093 14.478 0 0.724 6.725 3.406 11.235 4.482 1.738 0.414 10.433 1.321 19.322 2.015 17.822 1.392 25.111 2.27 31.567 3.804 9.351 2.222 14.232 4.987 18.304 10.367 2.671 3.529 3.963 7.598 4.293 13.513 0.15 2.726 0.45 4.771 0.67 4.546 0.22-0.226 1.03-2.23 1.79-4.452z" stroke-width="4" transform="translate(278 354.36)"/><path opacity="0" d="m93.178 199.59c-1.111-0.11-4.52-0.56-7.576-0.99-39.596-5.64-72.571-35.43-82.276-74.35-4.0224-16.12-3.8672-34.85 0.4165-50.241 4.7836-17.188 13.568-32.263 25.888-44.426 6.008-5.93 9.008-8.397 15.42-12.677 26.251-17.523 59.78-21.405 89.54-10.367 23.87 8.851 43.44 26.544 54.93 49.658 11.78 23.69 13.35 52.673 4.21 77.653-5.15 14.06-12.74 25.97-23.29 36.52-15.08 15.08-33.67 24.6-54.79 28.06-5.62 0.92-18.348 1.58-22.472 1.16zm20.692-6.07c4.73-0.69 11.02-2.09 14.83-3.3 2.06-0.66 1.99-1.17-1.13-7.75-2.57-5.43-4.84-8.5-15.09-20.33-9.65-11.14-13.822-16.34-17.533-21.85-6.003-8.92-7.809-13.91-7.485-20.69 0.275-5.75 2.422-10.47 6.968-15.33 1.736-1.86 3.012-3.37 2.835-3.37-1.034 0-7.474 3.36-9.806 5.13-3.841 2.9-5.401 4.72-7.29 8.5-1.565 3.14-1.638 3.55-1.628 9.09 0.017 9.16 2.405 17.81 9.991 36.17 5.884 14.25 6.508 16.71 7.219 28.48 0.197 3.26 0.596 5.99 0.909 6.21 0.738 0.53 10.88-0.03 17.21-0.96zm-54.161-13.01c2.969-7.02 3.307-9.2 5.199-33.65 1.222-15.78 2.313-22.89 4.616-30.05 1.861-5.8 2.946-7.68 6.425-11.14 4.668-4.64 10.067-6.755 17.461-6.836l3.809-0.042-2.627-1.243c-6.412-3.033-15.238-3.469-20.595-1.016-5.703 2.61-12.182 10.537-17.818 21.787-1.391 2.78-4.578 9.94-7.083 15.92-2.504 5.98-5.073 11.77-5.709 12.88-1.56 2.71-6.967 9.67-10.377 13.36l-2.779 3 1.072 1.45c1.339 1.81 7.283 7.18 11.617 10.49 4.387 3.35 13.659 8.88 14.58 8.7 0.406-0.07 1.4-1.7 2.209-3.61zm109.08-15.6c2.16-2.29 5.44-6.24 7.29-8.77 3.77-5.16 8.87-13.78 8.61-14.57-0.26-0.77-7.8-3.68-11.76-4.54-1.92-0.42-10.76-1.33-19.65-2.03-19.82-1.56-26.79-2.49-34.6-4.65-12.36-3.41-19.093-11.95-19.231-24.38l-0.042-3.81-1.242 2.62c-3.037 6.42-3.49 15.2-1.057 20.51 3.712 8.11 15.982 16.2 38.472 25.36 12.42 5.05 16.94 7.84 25.28 15.57 1.66 1.55 3.25 2.83 3.52 2.84s2.26-1.85 4.41-4.15zm-152.35-37.73c5.873-2.72 8.004-4.29 21.029-15.47 17.167-14.747 24.567-20.096 32.298-23.352 2.824-1.189 3.878-1.352 8.766-1.352 5.341 0 5.703 0.071 9.378 1.826 2.443 1.167 5.041 2.965 7.198 4.983 1.856 1.736 3.374 3.002 3.374 2.813s-0.763-1.977-1.696-3.973c-3.17-6.78-7.614-11.448-12.951-13.603-2.317-0.936-3.7-1.115-8.334-1.08-9.035 0.068-16.363 2.083-35.102 9.657-6.529 2.638-12.893 5.094-14.143 5.457-3.258 0.948-8.49 1.666-15.026 2.062l-5.6818 0.344v6.308c0 8.1 1.6093 18.39 4.1094 26.26 0.6204 1.96 0.6824 1.95 6.7814-0.88zm119.42-7.77c6.68-1.61 13.27-3.91 24.63-8.6 13.92-5.75 16.43-6.37 28.78-7.18l5.18-0.34-0.01-5.868c-0.02-7.727-2.24-21.047-4.53-27.067l-0.49-1.274-2.54 1c-7.5 2.959-10.66 5.159-24.12 16.815-11.14 9.647-16.35 13.824-21.86 17.534-8.91 6-13.9 7.81-20.68 7.48-5.78-0.27-10.47-2.41-15.41-7.03-3.8-3.55-3.94-3.26-1.15 2.33 3.47 6.93 8.97 11.87 14.89 13.37 3.12 0.79 11.5 0.23 17.31-1.17zm-9.96-17.13c8.05-3.707 15.33-14.551 24.43-36.392 6.26-15.032 7.56-17.237 15.54-26.307l3.51-3.989-4.02-3.867c-6.88-6.625-21.24-16.497-23.39-16.073-0.92 0.183-3.38 6.421-4.35 11.025-0.42 2.008-1 6.403-1.28 9.767s-0.95 11.457-1.49 17.985c-1.84 22.463-4.4 32.049-10.15 38.137-4.61 4.869-8.86 6.7-16.87 7.257l-5.06 0.347 2.02 0.91c7.05 3.17 15.76 3.66 21.11 1.2zm-18.07-6.566c5.82-2.912 9.87-6.851 12.31-11.991 1.19-2.501 1.32-3.355 1.31-8.586-0.01-9.158-2.4-17.805-9.99-36.168-5.83-14.107-6.46-16.585-7.22-28.355l-0.33-5.1773h-5.224c-6.618 0-15.005 1.1448-22.376 3.0544-3.166 0.8202-5.837 1.4912-5.935 1.4912-1.03 0 2.546 8.1867 5.477 12.539 0.973 1.444 6.292 7.893 11.82 14.331 14.738 17.167 20.088 24.566 23.348 32.298 1.19 2.823 1.35 3.878 1.35 8.765 0 5.341-0.07 5.704-1.82 9.379-1.18 2.468-2.97 5.044-5.06 7.271-3.55 3.799-3.26 3.943 2.34 1.149zm-5-4.162c1.18-3.415 1.4-4.901 1.43-9.596 0.03-5.022-0.1-5.837-1.34-8.476-3.812-8.139-15.541-15.915-37.521-24.878-13.412-5.469-15.445-6.66-23.946-14.03l-5.257-4.558-4.102 4.253c-2.256 2.339-5.564 6.178-7.352 8.532-3.552 4.677-9.093 13.5-9.093 14.478 0 0.724 6.725 3.406 11.235 4.482 1.738 0.414 10.433 1.321 19.322 2.015 17.822 1.392 25.111 2.27 31.567 3.804 9.351 2.222 14.232 4.987 18.304 10.367 2.671 3.529 3.963 7.598 4.293 13.513 0.15 2.726 0.45 4.771 0.67 4.546 0.22-0.226 1.03-2.23 1.79-4.452z" stroke-width="4" transform="translate(278 354.36)"/><path opacity="0" d="m93.178 199.59c-1.111-0.11-4.52-0.56-7.576-0.99-39.596-5.64-72.571-35.43-82.276-74.35-4.0224-16.12-3.8672-34.85 0.4165-50.241 4.7836-17.188 13.568-32.263 25.888-44.426 6.008-5.93 9.008-8.397 15.42-12.677 26.251-17.523 59.78-21.405 89.54-10.367 23.87 8.851 43.44 26.544 54.93 49.658 11.78 23.69 13.35 52.673 4.21 77.653-5.15 14.06-12.74 25.97-23.29 36.52-15.08 15.08-33.67 24.6-54.79 28.06-5.62 0.92-18.348 1.58-22.472 1.16zm20.692-6.07c4.73-0.69 11.02-2.09 14.83-3.3 2.06-0.66 1.99-1.17-1.13-7.75-2.57-5.43-4.84-8.5-15.09-20.33-9.65-11.14-13.822-16.34-17.533-21.85-6.003-8.92-7.809-13.91-7.485-20.69 0.275-5.75 2.422-10.47 6.968-15.33 1.736-1.86 3.012-3.37 2.835-3.37-1.034 0-7.474 3.36-9.806 5.13-3.841 2.9-5.401 4.72-7.29 8.5-1.565 3.14-1.638 3.55-1.628 9.09 0.017 9.16 2.405 17.81 9.991 36.17 5.884 14.25 6.508 16.71 7.219 28.48 0.197 3.26 0.596 5.99 0.909 6.21 0.738 0.53 10.88-0.03 17.21-0.96zm-54.161-13.01c2.969-7.02 3.307-9.2 5.199-33.65 1.222-15.78 2.313-22.89 4.616-30.05 1.861-5.8 2.946-7.68 6.425-11.14 4.668-4.64 10.067-6.755 17.461-6.836l3.809-0.042-2.627-1.243c-6.412-3.033-15.238-3.469-20.595-1.016-5.703 2.61-12.182 10.537-17.818 21.787-1.391 2.78-4.578 9.94-7.083 15.92-2.504 5.98-5.073 11.77-5.709 12.88-1.56 2.71-6.967 9.67-10.377 13.36l-2.779 3 1.072 1.45c1.339 1.81 7.283 7.18 11.617 10.49 4.387 3.35 13.659 8.88 14.58 8.7 0.406-0.07 1.4-1.7 2.209-3.61zm109.08-15.6c2.16-2.29 5.44-6.24 7.29-8.77 3.77-5.16 8.87-13.78 8.61-14.57-0.26-0.77-7.8-3.68-11.76-4.54-1.92-0.42-10.76-1.33-19.65-2.03-19.82-1.56-26.79-2.49-34.6-4.65-12.36-3.41-19.093-11.95-19.231-24.38l-0.042-3.81-1.242 2.62c-3.037 6.42-3.49 15.2-1.057 20.51 3.712 8.11 15.982 16.2 38.472 25.36 12.42 5.05 16.94 7.84 25.28 15.57 1.66 1.55 3.25 2.83 3.52 2.84s2.26-1.85 4.41-4.15zm-152.35-37.73c5.873-2.72 8.004-4.29 21.029-15.47 17.167-14.747 24.567-20.096 32.298-23.352 2.824-1.189 3.878-1.352 8.766-1.352 5.341 0 5.703 0.071 9.378 1.826 2.443 1.167 5.041 2.965 7.198 4.983 1.856 1.736 3.374 3.002 3.374 2.813s-0.763-1.977-1.696-3.973c-3.17-6.78-7.614-11.448-12.951-13.603-2.317-0.936-3.7-1.115-8.334-1.08-9.035 0.068-16.363 2.083-35.102 9.657-6.529 2.638-12.893 5.094-14.143 5.457-3.258 0.948-8.49 1.666-15.026 2.062l-5.6818 0.344v6.308c0 8.1 1.6093 18.39 4.1094 26.26 0.6204 1.96 0.6824 1.95 6.7814-0.88zm119.42-7.77c6.68-1.61 13.27-3.91 24.63-8.6 13.92-5.75 16.43-6.37 28.78-7.18l5.18-0.34-0.01-5.868c-0.02-7.727-2.24-21.047-4.53-27.067l-0.49-1.274-2.54 1c-7.5 2.959-10.66 5.159-24.12 16.815-11.14 9.647-16.35 13.824-21.86 17.534-8.91 6-13.9 7.81-20.68 7.48-5.78-0.27-10.47-2.41-15.41-7.03-3.8-3.55-3.94-3.26-1.15 2.33 3.47 6.93 8.97 11.87 14.89 13.37 3.12 0.79 11.5 0.23 17.31-1.17zm-9.96-17.13c8.05-3.707 15.33-14.551 24.43-36.392 6.26-15.032 7.56-17.237 15.54-26.307l3.51-3.989-4.02-3.867c-6.88-6.625-21.24-16.497-23.39-16.073-0.92 0.183-3.38 6.421-4.35 11.025-0.42 2.008-1 6.403-1.28 9.767s-0.95 11.457-1.49 17.985c-1.84 22.463-4.4 32.049-10.15 38.137-4.61 4.869-8.86 6.7-16.87 7.257l-5.06 0.347 2.02 0.91c7.05 3.17 15.76 3.66 21.11 1.2zm-18.07-6.566c5.82-2.912 9.87-6.851 12.31-11.991 1.19-2.501 1.32-3.355 1.31-8.586-0.01-9.158-2.4-17.805-9.99-36.168-5.83-14.107-6.46-16.585-7.22-28.355l-0.33-5.1773h-5.224c-6.618 0-15.005 1.1448-22.376 3.0544-3.166 0.8202-5.837 1.4912-5.935 1.4912-1.03 0 2.546 8.1867 5.477 12.539 0.973 1.444 6.292 7.893 11.82 14.331 14.738 17.167 20.088 24.566 23.348 32.298 1.19 2.823 1.35 3.878 1.35 8.765 0 5.341-0.07 5.704-1.82 9.379-1.18 2.468-2.97 5.044-5.06 7.271-3.55 3.799-3.26 3.943 2.34 1.149zm-5-4.162c1.18-3.415 1.4-4.901 1.43-9.596 0.03-5.022-0.1-5.837-1.34-8.476-3.812-8.139-15.541-15.915-37.521-24.878-13.412-5.469-15.445-6.66-23.946-14.03l-5.257-4.558-4.102 4.253c-2.256 2.339-5.564 6.178-7.352 8.532-3.552 4.677-9.093 13.5-9.093 14.478 0 0.724 6.725 3.406 11.235 4.482 1.738 0.414 10.433 1.321 19.322 2.015 17.822 1.392 25.111 2.27 31.567 3.804 9.351 2.222 14.232 4.987 18.304 10.367 2.671 3.529 3.963 7.598 4.293 13.513 0.15 2.726 0.45 4.771 0.67 4.546 0.22-0.226 1.03-2.23 1.79-4.452z" stroke-width="4" transform="translate(278 354.36)"/><path opacity="0" d="m93.178 199.59c-1.111-0.11-4.52-0.56-7.576-0.99-39.596-5.64-72.571-35.43-82.276-74.35-4.0224-16.12-3.8672-34.85 0.4165-50.241 4.7836-17.188 13.568-32.263 25.888-44.426 6.008-5.93 9.008-8.397 15.42-12.677 26.251-17.523 59.78-21.405 89.54-10.367 23.87 8.851 43.44 26.544 54.93 49.658 11.78 23.69 13.35 52.673 4.21 77.653-5.15 14.06-12.74 25.97-23.29 36.52-15.08 15.08-33.67 24.6-54.79 28.06-5.62 0.92-18.348 1.58-22.472 1.16zm20.692-6.07c4.73-0.69 11.02-2.09 14.83-3.3 2.06-0.66 1.99-1.17-1.13-7.75-2.57-5.43-4.84-8.5-15.09-20.33-9.65-11.14-13.822-16.34-17.533-21.85-6.003-8.92-7.809-13.91-7.485-20.69 0.275-5.75 2.422-10.47 6.968-15.33 1.736-1.86 3.012-3.37 2.835-3.37-1.034 0-7.474 3.36-9.806 5.13-3.841 2.9-5.401 4.72-7.29 8.5-1.565 3.14-1.638 3.55-1.628 9.09 0.017 9.16 2.405 17.81 9.991 36.17 5.884 14.25 6.508 16.71 7.219 28.48 0.197 3.26 0.596 5.99 0.909 6.21 0.738 0.53 10.88-0.03 17.21-0.96zm-54.161-13.01c2.969-7.02 3.307-9.2 5.199-33.65 1.222-15.78 2.313-22.89 4.616-30.05 1.861-5.8 2.946-7.68 6.425-11.14 4.668-4.64 10.067-6.755 17.461-6.836l3.809-0.042-2.627-1.243c-6.412-3.033-15.238-3.469-20.595-1.016-5.703 2.61-12.182 10.537-17.818 21.787-1.391 2.78-4.578 9.94-7.083 15.92-2.504 5.98-5.073 11.77-5.709 12.88-1.56 2.71-6.967 9.67-10.377 13.36l-2.779 3 1.072 1.45c1.339 1.81 7.283 7.18 11.617 10.49 4.387 3.35 13.659 8.88 14.58 8.7 0.406-0.07 1.4-1.7 2.209-3.61zm109.08-15.6c2.16-2.29 5.44-6.24 7.29-8.77 3.77-5.16 8.87-13.78 8.61-14.57-0.26-0.77-7.8-3.68-11.76-4.54-1.92-0.42-10.76-1.33-19.65-2.03-19.82-1.56-26.79-2.49-34.6-4.65-12.36-3.41-19.093-11.95-19.231-24.38l-0.042-3.81-1.242 2.62c-3.037 6.42-3.49 15.2-1.057 20.51 3.712 8.11 15.982 16.2 38.472 25.36 12.42 5.05 16.94 7.84 25.28 15.57 1.66 1.55 3.25 2.83 3.52 2.84s2.26-1.85 4.41-4.15zm-152.35-37.73c5.873-2.72 8.004-4.29 21.029-15.47 17.167-14.747 24.567-20.096 32.298-23.352 2.824-1.189 3.878-1.352 8.766-1.352 5.341 0 5.703 0.071 9.378 1.826 2.443 1.167 5.041 2.965 7.198 4.983 1.856 1.736 3.374 3.002 3.374 2.813s-0.763-1.977-1.696-3.973c-3.17-6.78-7.614-11.448-12.951-13.603-2.317-0.936-3.7-1.115-8.334-1.08-9.035 0.068-16.363 2.083-35.102 9.657-6.529 2.638-12.893 5.094-14.143 5.457-3.258 0.948-8.49 1.666-15.026 2.062l-5.6818 0.344v6.308c0 8.1 1.6093 18.39 4.1094 26.26 0.6204 1.96 0.6824 1.95 6.7814-0.88zm119.42-7.77c6.68-1.61 13.27-3.91 24.63-8.6 13.92-5.75 16.43-6.37 28.78-7.18l5.18-0.34-0.01-5.868c-0.02-7.727-2.24-21.047-4.53-27.067l-0.49-1.274-2.54 1c-7.5 2.959-10.66 5.159-24.12 16.815-11.14 9.647-16.35 13.824-21.86 17.534-8.91 6-13.9 7.81-20.68 7.48-5.78-0.27-10.47-2.41-15.41-7.03-3.8-3.55-3.94-3.26-1.15 2.33 3.47 6.93 8.97 11.87 14.89 13.37 3.12 0.79 11.5 0.23 17.31-1.17zm-9.96-17.13c8.05-3.707 15.33-14.551 24.43-36.392 6.26-15.032 7.56-17.237 15.54-26.307l3.51-3.989-4.02-3.867c-6.88-6.625-21.24-16.497-23.39-16.073-0.92 0.183-3.38 6.421-4.35 11.025-0.42 2.008-1 6.403-1.28 9.767s-0.95 11.457-1.49 17.985c-1.84 22.463-4.4 32.049-10.15 38.137-4.61 4.869-8.86 6.7-16.87 7.257l-5.06 0.347 2.02 0.91c7.05 3.17 15.76 3.66 21.11 1.2zm-18.07-6.566c5.82-2.912 9.87-6.851 12.31-11.991 1.19-2.501 1.32-3.355 1.31-8.586-0.01-9.158-2.4-17.805-9.99-36.168-5.83-14.107-6.46-16.585-7.22-28.355l-0.33-5.1773h-5.224c-6.618 0-15.005 1.1448-22.376 3.0544-3.166 0.8202-5.837 1.4912-5.935 1.4912-1.03 0 2.546 8.1867 5.477 12.539 0.973 1.444 6.292 7.893 11.82 14.331 14.738 17.167 20.088 24.566 23.348 32.298 1.19 2.823 1.35 3.878 1.35 8.765 0 5.341-0.07 5.704-1.82 9.379-1.18 2.468-2.97 5.044-5.06 7.271-3.55 3.799-3.26 3.943 2.34 1.149zm-5-4.162c1.18-3.415 1.4-4.901 1.43-9.596 0.03-5.022-0.1-5.837-1.34-8.476-3.812-8.139-15.541-15.915-37.521-24.878-13.412-5.469-15.445-6.66-23.946-14.03l-5.257-4.558-4.102 4.253c-2.256 2.339-5.564 6.178-7.352 8.532-3.552 4.677-9.093 13.5-9.093 14.478 0 0.724 6.725 3.406 11.235 4.482 1.738 0.414 10.433 1.321 19.322 2.015 17.822 1.392 25.111 2.27 31.567 3.804 9.351 2.222 14.232 4.987 18.304 10.367 2.671 3.529 3.963 7.598 4.293 13.513 0.15 2.726 0.45 4.771 0.67 4.546 0.22-0.226 1.03-2.23 1.79-4.452z" stroke-width="4" transform="translate(278 354.36)"/><use xlink:href="#strip" transform="matrix(.70711 .70711 -.70711 .70711 431.36 -134.47)" height="200" width="200" y="0" x="0"/><use xlink:href="#strip" transform="matrix(0 1 -1 0 831.46 75.459)" height="200" width="200" y="0" x="0"/><use xlink:href="#strip" transform="matrix(-.70711 .70711 -.70711 -.70711 965.93 506.82)" height="200" width="200" y="0" x="0"/><use xlink:href="#strip" transform="matrix(-1 0 0 -1 756 906.92)" height="200" width="200" y="0" x="0"/><use xlink:href="#strip" transform="matrix(-.70711 -.70711 .70711 -.70711 324.64 1041.4)" height="200" width="200" y="0" x="0"/><use xlink:href="#strip" transform="matrix(0 -1 1 0 -75.459 831.46)" height="200" width="200" y="0" x="0"/><use xlink:href="#strip" transform="matrix(.70711 -.70711 .70711 .70711 -209.93 400.1)" height="200" width="200" y="0" x="0"/></g>`;
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
        case 'taijitu':
            return `<path d="M 139.55,2.35 C 139.29,2.33 127.25,0.67 127.00,0.66 122.14,0.40 118.79,0.41 118.23,0.42 53.21,1.34 0.88,54.51 0.40,120.01 0.40,185.52 53.37,238.73 118.68,239.56 116.51,236.96 114.91,237.91 111.76,235.89 98.53,235.29 83.95,231.73 76.72,228.56 59.85,221.96 52.97,215.57 38.92,204.01 23.47,189.14 3.91,158.83 4.11,120.68 4.05,106.23 7.80,76.73 28.95,47.92 41.59,33.20 60.81,14.93 92.86,6.89 106.17,3.56 121.17,2.64 141.20,4.21 141.20,4.21 139.55,2.35 139.55,2.35 Z M 120.00,40.27 C 131.00,40.27 139.93,49.20 139.93,60.20 139.93,71.21 131.00,80.14 120.00,80.14 109.00,80.14 100.07,71.21 100.07,60.20 100.07,49.20 109.00,40.27 120.00,40.27 Z M 120.00,239.60 C 120.59,239.60 121.18,239.59 121.77,239.57 186.97,238.62 239.60,185.42 239.60,119.98 239.60,54.48 186.85,1.23 121.54,0.40 153.84,1.22 179.80,27.68 179.80,60.18 179.80,93.19 153.01,119.98 120.00,119.98 86.99,119.98 60.20,146.78 60.20,179.79 60.20,212.80 86.99,239.60 120.00,239.60 120.00,239.60 120.00,239.60 120.00,239.60 Z M 120.00,199.73 C 109.00,199.73 100.07,190.80 100.07,179.79 100.07,168.79 109.00,159.86 120.00,159.86 131.00,159.86 139.93,168.79 139.93,179.79 139.93,190.80 131.00,199.73 120.00,199.73 Z"/>`;
        //case 'pizza':
        //    return `<path d="m129.15 0.019c-2.412 0.612-4.428 1.836-5.904 3.816-1.475 1.98-2.555 4.536-3.096 7.956-9.973 8.028-18.216 15.48-25.272 22.5-7.128 6.948-9.612 12.816-16.632 19.404-7.164 6.516-12.168 6.912-25.272 20.052-13.248 13.212-30.528 32.4-52.956 58.536l7.956 12.096c10.188-0.359 25.02-1.332 45.324-2.771 20.34-1.512 49.068-3.78 75.492-6.229 26.387-2.592 52.992-5.544 81.359-9 1.08-1.008 2.232-2.34 3.457-4.14 1.188-1.908 2.412-3.924 3.814-6.588-1.08-6.588-2.627-12.708-4.5-19.044-2.051-6.372-4.355-12.96-6.912-18.36-2.592-5.436-5.363-8.604-8.314-13.824-3.096-5.328-4.176-10.62-10.045-17.676-6.084-7.236-15.875-17.064-25.631-24.912-9.91-7.883-20.63-15.011-32.88-21.815z" i:knockout="Off" fill="#000000" /> <path d="m3.119 132.61c6.768 0.72 16.344 0.611 29.412-0.324 13.104-1.116 34.38-4.68 48.132-5.544 13.536-0.864 19.368 0.936 32.904 0.684 13.572-0.396 33.084-1.296 47.412-2.411 14.148-1.08 26.064-2.521 36.721-4.177 1.404-4.176 3.492-6.66 6.551-7.596 2.988-0.972 6.805-0.288 11.449 2.052l-6.229 10.044c-5.473 0.685-15.443 1.836-30.492 3.456-15.156 1.512-38.447 4.032-59.184 5.904-20.772 1.764-45.756 3.384-64.404 4.86-18.684 1.331-33.984 2.483-46.728 3.456-1.841-3.45-3.677-6.91-5.549-10.4z" i:knockout="Off" /> <path d="m2.794 130.88c5.112-4.859 10.764-10.8 17.64-18.359 6.84-7.668 15.012-18.54 22.86-26.641 7.668-8.172 16.884-16.56 23.184-21.816 6.12-5.292 9.972-5.832 14.184-9.684 4.068-3.996 7.812-9.468 11.088-13.5 3.348-4.068 3.888-5.724 9-10.404 5.148-4.716 11.916-10.548 21.132-17.64 2.375 2.556 5.904 5.688 10.729 9.684 4.859 3.888 12.527 8.784 18 13.86 5.363 5.148 9.719 11.592 14.184 16.272 4.355 4.428 9.467 6.012 12.131 10.728 2.592 4.788 1.152 12.708 3.457 17.64 2.305 4.823 7.92 7.271 10.043 11.088 2.018 3.744 0.9 6.516 2.053 11.088 1.008 4.536 2.447 9.504 4.176 15.588-12.023 1.8-24.875 3.348-39.131 4.5-14.438 1.152-33.156 2.088-46.045 2.412-12.888 0.107-19.152-1.584-30.456-1.044-11.52 0.576-24.264 3.42-37.404 4.5-13.141 1.04-26.605 1.61-40.826 1.72z" i:knockout="Off" /> <path d="m130.88 2.431c-2.484-0.288-4.5 0.504-5.904 2.088-1.439 1.656-2.412 4.104-2.771 7.632 3.059 2.196 6.588 4.896 10.727 7.956 4.068 3.06 9.758 6.84 13.861 10.368 3.924 3.456 7.199 6.876 10.404 10.404 3.131 3.42 5.436 6.876 9 10.368 3.6 3.312 9.791 5.544 12.455 10.044 2.52 4.5 1.729 12.78 2.771 16.632 0.9 3.673 1.189 3.204 3.098 5.544 1.943 2.305 6.658 5.112 8.314 8.28 1.512 2.988-0.252 5.868 0.686 10.044 0.898 4.141 2.268 9.108 4.5 14.904 0.143-3.78 1.691-5.977 4.5-6.588 2.844-0.612 6.91 0.216 12.49 2.771-1.188-9.288-3.275-17.496-6.264-24.912-3.096-7.451-8.135-13.176-11.771-19.404-3.564-6.3-5.832-11.844-10.008-18-4.355-6.264-7.957-11.916-15.947-19.044-8.209-7.38-25.813-18.9-32.545-23.868-6.77-4.887-9.25-6.579-7.6-5.211z" i:knockout="Off" /> <path d="m92.435 90.02c-1.8-2.628-2.376-5.364-1.728-8.641 0.648-3.384 2.268-8.207 5.544-10.728 3.24-2.592 8.712-4.536 13.5-4.176 4.679 0.396 11.521 2.808 14.544 6.264 2.916 3.384 3.959 7.848 3.131 13.824-3.924-1.296-7.164-1.872-9.719-1.729-2.629 0.108-4.861 0.973-5.869 2.448-1.043 1.404-1.404 3.313-0.684 5.868-4.068-2.196-7.056-3.168-9.36-2.772s-3.636 1.872-4.14 4.86c-1.724-1.726-3.451-3.455-5.215-5.218z" i:knockout="Off" fill="#000000" /> <path d="m93.119 87.967c-1.116-2.447-1.44-4.896-0.684-7.632 0.684-2.808 1.8-6.66 4.86-8.64 2.952-2.052 8.424-3.96 12.817-3.492 4.355 0.396 10.26 3.06 13.139 5.904 2.736 2.808 3.889 6.336 3.457 10.728-1.836-1.296-4.068-2.124-6.553-2.088-2.699-0.144-6.84 0.396-8.676 1.765-1.908 1.403-2.412 3.491-2.052 6.552-2.736-2.124-5.22-3.097-7.308-2.772-2.232 0.252-3.924 1.8-5.508 4.5-1.154-1.585-2.305-3.205-3.493-4.825z" i:knockout="Off" /> <path d="m137.11 88.291c0.215 2.844 1.223 7.344 4.139 10.729 2.809 3.312 7.273 7.56 12.816 9 5.58 1.332 16.344 1.691 20.088-1.008 3.457-2.952 3.527-10.837 1.045-15.589-2.629-4.823-10.369-10.872-16.273-12.456-5.939-1.584-15.479 1.44-19.043 3.097-3.72 1.513-3.07 3.313-2.78 6.229z" i:knockout="Off" fill="#000000" /> <path d="m138.3 88.363c0.18 2.808 1.152 6.768 3.889 10.08 2.699 3.06 6.768 7.128 12.059 8.46 5.184 1.224 15.408 1.548 18.865-0.972 3.348-2.809 3.311-10.152 1.008-14.652-2.557-4.572-9.756-10.152-15.336-11.736-5.652-1.476-14.438 1.404-17.893 2.952-3.39 1.333-2.96 3.241-2.6 5.869z" i:knockout="Off" /> <path d="m37.066 90.379c3.6 2.305 7.884 3.276 13.14 2.772 5.22-0.612 14.508-2.196 18-5.868 3.276-3.708 2.628-11.988 2.088-15.948-0.612-4.068-2.196-6.624-5.184-7.956-8.316 7.92-14.688 14.148-19.404 18.684-4.68 4.464-7.56 7.236-8.64 8.316z" i:knockout="Off" fill="#000000" /> <path d="m40.522 90.379c2.124-2.844 5.184-6.264 9.324-10.403 4.104-4.212 9.144-9 15.264-14.508 1.944 0.684 3.204 2.34 3.78 5.508 0.576 3.06 1.116 9.504-0.324 12.816-1.656 3.132-5.148 4.788-8.676 6.229-3.564 1.332-8.892 1.979-12.096 2.088-3.239 0.035-5.615-0.542-7.272-1.73z" i:knockout="Off" /> <path d="m115.98 55.423c-2.305 0.036 0.936 6.768 4.176 10.044 3.205 3.312 8.1 8.316 14.545 9.324 6.227 0.828 19.619-2.772 22.824-4.14 2.986-1.476-0.145-3.24-4.141-4.176-4.104-1.044-13.068 0-19.404-1.728-6.3-1.872-15.73-9.468-18-9.324z" i:knockout="Off" fill="#000000" /> <path d="m157.2 68.923c-2.592 1.296-5.76 2.376-9.361 3.096-3.779 0.72-8.387 2.161-12.455 1.404-4.068-0.899-8.785-3.528-11.771-6.228-3.098-2.664-5.293-5.904-6.588-9.72 2.41 2.952 5.039 5.544 8.314 7.632 3.133 2.124 5.365 4.068 10.729 4.86 5.37 0.648 12.28 0.252 21.14-1.044z" i:knockout="Off" /> <path d="m119.11 57.835c2.986 2.484 6.047 4.392 9.322 5.868 3.168 1.404 5.869 2.052 10.045 2.772 4.141 0.648 9.107 1.116 14.904 1.404-4.033 0.648-7.775 1.044-11.088 1.044-3.348-0.036-5.652 0.216-9-1.044-3.564-1.476-9.432-5.22-11.771-6.912-2.34-1.728-3.24-2.772-2.41-3.132z" i:knockout="Off" /> <path d="m89.663 98.695c-2.304 2.771-4.428 4.428-6.228 4.824-1.908 0.359-4.032-0.396-4.824-2.412-0.936-2.124-1.584-5.725 0-9.685 1.656-4.031 4.752-8.712 9.684-14.184l-0.684-5.22c-7.632 3.672-12.528 7.812-15.264 12.816-2.664 4.933-1.872 12.564-0.684 16.632 1.044 3.925 4.572 5.797 7.272 7.272 2.664 1.476 6.804 2.952 8.676 1.368 1.835-1.66 2.375-5.51 2.052-11.415z" i:knockout="Off" fill="#000000" /> <path d="m87.935 103.52c0.36 2.628 0.18 4.607-0.684 5.544-0.936 0.792-2.628 1.044-4.5 0.359-2.052-0.756-4.752-2.304-6.588-3.815-1.764-1.548-2.988-2.664-3.816-4.86s-1.116-5.004-1.008-8.28c0.216 3.744 1.116 6.805 3.096 9.324 1.836 2.412 6.048 5.185 8.316 5.544 2.231 0.34 3.959-1.03 5.184-3.8z" i:knockout="Off" /> <path d="m87.935 101.43l-0.108 1.619c-0.756 1.44-1.548 2.521-2.52 3.097-1.044 0.611-1.8 0.899-3.384 0.324-1.728-0.828-4.824-2.7-6.372-4.5-1.512-1.944-2.556-4.032-2.988-6.265-0.648-2.268-1.296-4.607-0.54-7.02 0.612-2.592 2.016-5.544 4.5-8.028 2.484-2.52 5.76-4.86 10.224-7.02l0.648 3.708c-2.448 2.376-4.536 4.896-6.264 7.703-1.944 2.7-3.744 5.904-4.284 8.784-0.54 2.809 0.432 6.696 1.548 8.46 1.08 1.656 3.276 2.124 4.932 1.98 1.619-0.1 3.06-1.15 4.608-2.84z" i:knockout="Off" /> <path d="m31.522 104.92c6.876 3.276 12.564 6.624 17.64 10.044 5.04 3.385 8.892 6.841 12.132 10.368l6.552-8.315c-5.436-6.156-10.8-10.656-16.236-13.5-5.508-2.916-10.8-4.177-16.308-3.78-1.26 1.73-2.519 3.46-3.78 5.18z" i:knockout="Off" fill="#000000" /> <path d="m32.999 104.82c2.988 1.584 5.796 2.987 8.568 4.607 2.7 1.513 4.284 2.089 7.668 4.645 3.24 2.448 7.308 5.832 12.06 10.151l1.008-1.367c-3.708-3.816-7.452-6.984-11.376-9.792-4.032-2.845-9.252-5.364-12.168-6.876-2.916-1.62-4.68-2.448-5.292-2.484-0.144 0.35-0.288 0.71-0.468 1.11z" i:knockout="Off" /> <path d="m34.115 102.44l1.908-2.017c5.148 0.504 9.612 1.513 13.536 3.168 3.888 1.656 7.02 4.284 9.936 6.624 2.844 2.269 5.076 4.465 6.984 6.876l-3.96 5.185c-3.312-3.96-6.876-7.164-10.692-10.008-4.032-2.916-9.36-5.221-12.384-6.769-2.988-1.548-4.716-2.304-5.328-2.268v-0.79z" i:knockout="Off" /> <path d="m132.93 121.59c1.189 1.044 2.988-3.743 3.313-6.983 0.145-3.313 0.432-8.424-2.051-12.132-2.629-3.816-10.945-9.108-13.141-10.044-2.305-1.009-1.584 1.584-0.18 4.176 1.26 2.52 6.371 6.804 8.387 11.052 2.02 4.14 2.41 12.67 3.67 13.93z" i:knockout="Off" fill="#000000" /> <path d="m120.33 93.439c1.98 0.684 3.889 1.872 6.121 3.42 2.16 1.512 5.039 3.384 6.695 5.904 1.477 2.483 2.305 6.191 2.34 9.18 0.037 2.844-0.611 5.544-1.943 8.1 0.359-2.735 0.504-5.363 0.035-8.027-0.504-2.772-0.395-4.824-2.592-7.956-2.27-3.12-5.72-6.614-10.66-10.611z" i:knockout="Off" /> <path d="m132.72 118.78c-0.217-2.771-0.541-5.4-1.369-7.74-0.826-2.447-1.764-4.14-3.348-6.588-1.656-2.592-3.744-5.292-6.408-8.496 2.305 1.8 4.213 3.528 5.869 5.328 1.512 1.764 2.809 2.664 3.744 5.22 0.863 2.448 1.764 7.381 2.016 9.505 0.26 2.1 0.04 2.93-0.5 2.78z" i:knockout="Off" /> <path d="m138.3 88.363c0.18 2.808 1.152 6.768 3.889 10.08 2.699 3.06 6.768 7.128 12.059 8.46 5.184 1.224 15.408 1.548 18.865-0.972 3.348-2.809 3.311-10.152 1.008-14.652-2.557-4.572-9.756-10.152-15.336-11.736-5.652-1.476-14.438 1.404-17.893 2.952-3.39 1.333-2.96 3.241-2.6 5.869z" i:knockout="Off" /> <path d="m106.15 33.499c0.18 2.376 1.044 6.3 3.564 9.144 2.485 2.844 6.12 6.372 10.909 7.668 4.824 1.152 13.859 1.368 17.1-0.9 2.916-2.484 3.023-9.216 0.9-13.248-2.197-4.032-8.893-9.324-13.861-10.62-5.039-1.368-13.176 1.26-16.235 2.628-3.12 1.224-2.62 2.952-2.37 5.328z" i:knockout="Off" fill="#000000" /> <path d="m107.16 33.535c0.108 2.304 1.08 5.868 3.347 8.604 2.305 2.664 5.725 6.084 10.26 7.2 4.32 1.008 13.248 1.332 16.094-0.828 2.807-2.304 2.807-8.784 0.828-12.492-2.197-3.816-8.209-8.712-13.033-9.972-4.824-1.188-12.313 1.08-15.264 2.484-3 1.224-2.49 2.664-2.24 5.004z" i:knockout="Off" /> <path d="m125.16 31.735c-6.156 2.52-11.557 4.176-16.632 5.508-5.112 1.224-9.612 1.764-13.644 1.764l1.512 9c7.02-0.036 13.032-0.72 18.035-2.592 5.004-1.836 8.857-4.536 11.846-8.244-0.37-1.8-0.72-3.6-1.12-5.436z" i:knockout="Off" fill="#000000" /> <path d="m124.37 32.743c-2.773 0.972-5.365 2.052-7.92 2.844-2.629 0.792-3.924 1.584-7.381 2.232-3.528 0.648-7.92 1.26-13.464 1.836l0.252 1.44c4.536-0.18 8.784-0.72 12.888-1.62 3.996-1.08 8.675-2.772 11.412-3.816 2.664-1.008 4.213-1.656 4.645-1.944-0.15-0.324-0.29-0.648-0.43-0.972z" i:knockout="Off" /> <path d="m125.23 34.867l0.18 2.376c-3.348 3.024-6.48 5.256-9.828 6.84-3.42 1.548-6.948 1.908-10.007 2.484-3.096 0.54-5.904 0.576-8.424 0.504l-1.044-5.508c4.392 0.18 8.496-0.216 12.6-1.044 4.032-0.936 8.749-3.024 11.52-4.032 2.629-0.972 4.176-1.8 4.5-2.088 0.15 0.144 0.33 0.288 0.51 0.468z" i:knockout="Off" /> <path d="m89.734 62.371c-1.764 0.972-3.312 1.152-5.04 0.54-1.728-0.72-5.184-1.944-5.076-4.248-0.072-2.34 1.476-8.496 5.328-9.576 3.852-1.224 14.508 0.72 17.82 2.916 3.168 2.16 2.772 8.496 1.584 10.116-1.224 1.548-4.14 1.224-8.748-0.828-0.828 1.08-0.972 2.196-0.288 3.744 0.612 1.512 1.944 3.06 3.996 5.04-1.008 1.764-2.34 2.916-4.536 3.456-2.16 0.504-4.86 0.288-8.244-0.504 0.18-2.196 0.54-4.104 1.08-5.868 0.469-1.836 1.224-3.384 2.124-4.788z" i:knockout="Off" fill="#000000" /> <path d="m98.411 70.183c-1.548 0.9-2.988 1.332-4.86 1.44-1.8 0.036-3.852-0.252-6.012-1.008l-0.36 2.088c1.404 0.359 2.628 0.54 3.96 0.685 1.26 0.035 2.484 0.071 3.672-0.181 1.008-0.36 2.304-1.044 2.916-1.512 0.54-0.54 0.863-1.044 0.684-1.512z" i:knockout="Off" /> <path d="m80.482 57.115c-0.36 0.864-0.288 1.692-0.18 2.34 0.072 0.612 0.576 0.9 1.116 1.44 0.576 0.396 1.296 0.864 2.304 1.26 0.9 0.324 1.944 0.648 3.132 0.684 0.972-0.108 2.016-0.468 2.988-1.08l0.18-0.792c-1.368 0.432-2.664 0.684-3.744 0.756-1.152 0.072-2.088-0.252-2.952-0.576-0.9-0.504-1.656-1.152-2.268-2.088-0.18-0.648-0.359-1.296-0.576-1.944z" i:knockout="Off" /> <path d="m95.818 60.895c1.188 0.54 2.232 1.08 3.276 1.332 0.936 0.216 2.088 0.432 2.916 0.36 0.828-0.18 1.368-0.504 1.908-1.116-1.692 0.216-3.096 0.036-4.356-0.144-1.332-0.216-2.232-0.828-3.096-1.44-0.218 0.324-0.433 0.648-0.65 1.008z" i:knockout="Off" /> <path d="m98.086 69.931c-1.08-1.116-1.98-2.16-2.556-3.276-0.72-1.152-1.332-2.34-1.152-3.564 0.072-1.26 0.9-2.556 2.088-3.888 0.396 0.54 1.188 1.044 2.52 1.368s3.024 0.468 5.364 0.576c0.36-0.9 0.576-1.692 0.504-2.916-0.18-1.296 0.18-2.772-1.008-4.032-1.26-1.332-3.168-2.52-6.12-3.276-3.06-0.756-8.568-1.872-11.376-1.26-2.844 0.54-4.068 2.844-4.932 4.392-0.9 1.404-0.396 2.916 0 4.104 0.324 1.116 1.044 1.872 2.16 2.412 1.044 0.432 2.664 0.432 4.032 0.432 1.296-0.144 2.448-0.432 3.6-1.008-0.216 0.288-0.684 1.116-1.26 2.916-0.576 1.692-1.404 4.068-2.34 7.272 1.908 0.648 3.744 1.08 5.508 1.008 1.735-0.108 3.39-0.432 4.974-1.26z" i:knockout="Off" /> <path d="m103.52 116.48c0.18 2.34-0.54 4.032-2.016 5.616-1.656 1.403-4.68 4.355-7.128 3.168-2.52-1.332-8.172-5.868-7.38-10.549 0.864-4.752 8.136-15.084 12.24-17.388 3.888-2.304 10.476 1.368 11.556 3.528 1.043 2.124-0.793 4.896-5.364 8.855 0.648 1.44 1.908 2.053 3.78 2.232 1.909 0.072 4.284-0.468 7.417-1.62 1.404 1.908 1.943 3.96 1.332 6.552-0.648 2.521-2.197 5.292-4.789 8.46-2.23-1.332-4.067-2.664-5.651-4.14-1.62-1.55-2.95-2.99-4-4.72z" i:knockout="Off" fill="#000000" /> <path d="m116.27 111.3c0.182 2.017-0.143 3.853-0.971 5.904-0.9 1.908-2.232 3.852-4.141 5.832l2.016 1.476c1.08-1.26 2.053-2.592 2.773-3.852 0.646-1.476 1.439-2.628 1.691-3.996 0.252-1.404 0.072-2.916-0.107-3.852-0.22-0.9-0.69-1.41-1.26-1.51z" i:knockout="Off" /> <path d="m93.19 123.57c0.828 0.756 1.62 1.224 2.376 1.404 0.684 0.107 1.296-0.181 2.124-0.469 0.72-0.432 1.656-0.972 2.52-1.764 0.828-0.864 1.8-1.908 2.34-2.988 0.504-1.151 0.504-2.376 0.396-3.672l-0.756-0.647c-0.216 1.691-0.54 3.096-1.116 4.355-0.576 1.188-1.296 2.088-2.16 2.844-0.936 0.685-2.052 1.08-3.348 1.332-0.788-0.09-1.58-0.23-2.372-0.38z" i:knockout="Off" /> <path d="m105.11 109.28c1.296-0.972 2.196-1.908 3.096-2.808 0.864-0.973 1.44-1.98 1.872-2.881 0.217-0.936 0.145-1.8-0.215-2.592-0.72 1.8-1.512 3.313-2.376 4.536-0.972 1.188-2.016 1.98-3.132 2.521 0.25 0.39 0.5 0.79 0.76 1.22z" i:knockout="Off" /> <path d="m115.83 111.51c-1.691 0.647-3.348 0.899-4.824 1.044-1.619 0.035-3.059 0.107-4.319-0.612-1.188-0.828-2.34-2.196-3.06-4.248 0.792-0.072 1.764-0.72 2.772-1.944 0.972-1.224 2.088-3.023 3.348-5.399-0.648-0.9-1.584-1.477-2.808-2.017-1.296-0.576-2.952-1.655-4.824-1.008-2.016 0.54-4.32 2.088-6.624 4.788-2.412 2.7-6.336 8.172-7.2 11.412-0.864 3.168 0.972 5.796 2.16 7.488 1.152 1.548 2.88 1.871 4.356 2.088 1.296 0.144 2.556-0.145 3.636-1.008 0.936-0.937 2.016-2.664 2.556-4.068 0.576-1.404 0.792-2.844 0.792-4.32 0.144 0.324 0.9 1.26 2.412 2.809 1.512 1.476 3.636 3.6 6.516 6.228 1.691-1.728 2.988-3.456 3.889-5.328 0.87-1.94 1.22-3.77 1.22-5.9z" i:knockout="Off" /> <path d="m177.25 99.596c2.305 0.792 3.961 2.016 4.824 4.212 0.828 2.088 2.592 6.228 0.432 8.243-2.303 1.944-8.928 5.832-13.355 3.349-4.428-2.628-11.771-14.04-12.6-18.828-0.756-4.932 5.291-9.937 7.883-10.152 2.412-0.18 4.682 2.557 6.805 8.748 1.584-0.18 2.844-1.116 3.637-2.952 0.828-1.943 1.188-4.428 1.223-7.991 2.449-0.757 4.752-0.36 7.057 1.188 2.34 1.512 4.355 4.176 6.588 7.992-2.16 1.728-4.211 2.952-6.299 4.068-2.11 1.078-4.13 1.654-6.18 2.123z" i:knockout="Off" fill="#000000" /> <path d="m176.96 84.943c2.088 0.504 3.779 1.584 5.471 3.24 1.621 1.548 2.988 3.672 4.248 6.372l2.232-1.44c-0.863-1.656-1.799-3.024-2.807-4.248-1.01-1.26-2.16-2.52-3.313-3.204-1.26-0.792-2.916-1.296-3.852-1.368-1.01-0.144-1.62 0.072-1.98 0.648z" i:knockout="Off" /> <path d="m180.35 112.63c1.01-0.576 1.908-1.188 2.305-1.836 0.359-0.72 0.432-1.439 0.359-2.304-0.107-0.972-0.322-2.124-0.791-3.168-0.432-1.188-1.26-2.628-2.088-3.492-0.936-0.9-2.16-1.548-3.527-1.8l-0.9 0.54c1.584 0.792 2.879 1.764 3.887 2.771 0.938 1.009 1.656 1.944 2.018 3.204 0.252 1.152 0.395 2.448 0.035 3.889-0.45 0.72-0.88 1.44-1.31 2.2z" i:knockout="Off" /> <path d="m170.66 95.312c-0.467-1.584-1.008-3.024-1.619-4.177-0.613-1.296-1.369-2.34-2.125-2.987-0.791-0.648-1.727-0.9-2.664-0.756 1.512 1.332 2.809 2.699 3.602 4.104 0.756 1.332 1.295 2.7 1.332 4.104 0.46-0.073 0.97-0.181 1.47-0.288z" i:knockout="Off" /> <path d="m177 85.483c-0.072 1.979-0.287 3.528-0.791 5.184-0.576 1.513-1.008 3.061-2.268 4.068-1.297 0.828-3.098 1.439-5.4 1.439 0.215-0.899-0.072-2.016-0.865-3.491-0.863-1.513-2.23-3.313-4.104-5.4-1.152 0.216-2.088 0.936-3.096 2.016-1.115 1.009-2.664 2.196-2.844 4.393-0.18 2.231 0.432 4.896 2.232 8.424 1.871 3.348 5.615 9.324 8.604 11.52 2.844 2.017 6.156 1.152 8.279 0.721 1.945-0.54 3.025-2.269 3.781-3.528 0.684-1.368 0.756-2.664 0.359-4.032-0.504-1.439-1.943-2.987-3.061-4.067-1.152-1.152-2.592-1.872-4.031-2.448 0.359-0.036 1.656-0.432 3.744-1.332 2.051-1.008 4.895-2.232 8.676-4.104-1.008-2.411-2.268-4.319-3.781-5.867-1.55-1.622-3.32-2.738-5.44-3.494z" i:knockout="Off"/>`;
        case 'trash':
            return `<path d="M12.41,5.58l-1.34,8c-0.0433,0.2368-0.2493,0.4091-0.49,0.41H4.42c-0.2407-0.0009-0.4467-0.1732-0.49-0.41l-1.34-8 C2.5458,5.3074,2.731,5.0506,3.0035,5.0064C3.0288,5.0023,3.0544,5.0002,3.08,5h8.83c0.2761-0.0036,0.5028,0.2174,0.5064,0.4935 C12.4168,5.5225,12.4146,5.5514,12.41,5.58z M13,3.5C13,3.7761,12.7761,4,12.5,4h-10C2.2239,4,2,3.7761,2,3.5S2.2239,3,2.5,3H5V1.5 C5,1.2239,5.2239,1,5.5,1h4C9.7761,1,10,1.2239,10,1.5V3h2.5C12.7761,3,13,3.2239,13,3.5z M9,3V2H6v1H9z"/>`;
        //case 'party':
        //    return `<path style="stroke:#3e3e3e;stroke-width:11.759;fill:#ffffff" d="m348.09 109.89c-85.21-11.765-133.86-61.49-150.45-144.52l52.461-31.674c8.8349 68.313 24.711 132.98 108.88 162.33z"/><path d="m353.56 91.864c-61.98-62.164-70.82-132.61-33.05-210.32l62.186 6.6459c-35 60.969-62.02 123.32-11.73 199.13z" style="stroke:#3e3e3e;stroke-width:12"/><path d="m392.11 86.165c52.8-63.262 117.89-77.562 193.76-48.91l-0.88537 58.696c-59.98-27.485-120.58-47.403-187.14 6.089z" style="stroke:#3e3e3e;stroke-width:11.264"/><path d="m400.56 103.66c70.409-8.8186 119.79 20.415 150.74 83.029l-35.039 36.44c-21.63-52.55-48.08-100.69-121.42-106.11z" style="stroke:#3e3e3e;stroke-width:9.7;fill:#ffffff"/><path style="stroke:#3e3e3e;stroke-width:10.038" d="m359.07 126.89c-60.038 42.278-119.37 39.574-178.07-2.5897l14.3-50.321c45.296 37.496 92.867 68.618 162.5 37.92z"/><path style="stroke:#3e3e3e;stroke-width:12;fill:#ffffff" d="m125.26 755.38 248.5-719.23 266.68 711.15c-107.4 137.09-420.62 139.89-515.18 8.08z"/><path style="stroke-linejoin:round;stroke:#3e3e3e;stroke-width:8.9074" d="m420.09 159.69c-47.61 62.416-98.161 122.79-151.62 181.16l-49.688 143.88c81.848-80.243 157.06-166.67 226.12-258.78l-24.812-66.25zm58.29 155.4c-90.42 120.29-193.6 232.5-315.94 332.63l-34.91 101.03c153.16-104.45 278.75-224.33 379.06-358.37l-28.21-75.29zm58.188 155.19c-100.47 122.36-214.26 236.88-348.91 339.13 20.15 11.4 42.82 20.53 67.09 27.37 122.94-86.67 221.84-187.56 308.31-295.78l-26.5-70.719zm49.75 132.66c-75.124 86.484-154.65 170.39-244.41 248.34 32.775 2.0765 66.335 0.70943 98.969-4.0938 0.006-0.005 0.0255 0.005 0.0312 0 61.02-55.53 117.11-115.25 170.56-177.19l-25.16-67.06z"/><path style="fill:#00b02d;fill-opacity:.11947" d="m484.59 333.63c9.5858 273.53-172.12 419.02-355.12 427.33 99.306 126.12 405.11 121.44 510.97-13.688z"/><path d="m125.26 755.38 248.5-719.23 266.68 711.15c-107.4 137.09-420.62 139.89-515.18 8.08z" style="stroke:#3e3e3e;stroke-width:12;fill:none"/><path style="stroke:#3e3e3e;stroke-width:12;fill:#ffffff" d="m363.57 78.567c-5.57-87.607 42.03-144.26 121.69-177.74l42.351 46.018c-66.518 22.736-127.96 51.772-140.18 141.92z"/>`;
        case 'martini':
            return `<path d="M7.5,1c-2,0-7,0.25-6.5,0.75L7,8v4 c0,1-3,0.5-3,2h7c0-1.5-3-1-3-2V8l6-6.25C14.5,1.25,9.5,1,7.5,1z M7.5,2c2.5,0,4.75,0.25,4.75,0.25L11.5,3h-8L2.75,2.25 C2.75,2.25,5,2,7.5,2z"/>`;
        case 'lightbulb':
            return `<path d="m0 48c0-27 23-48 50-48s50 21 50 48c0 19-22 37-22 54 0 5-1 9-6 14v4c0 2-4 2-4 4s4 2 4 4-4 2-4 4 4 2 4 4-4 2-4 4 3 2 3 4-7 6-10 12h-22c-3-6-10-10-10-12s3-2 3-4-4-2-4-4 4-2 4-4-4-2-4-4 4-2 4-4-4-2-4-4v-4c-5-5-6-9-6-14 0-17-22-35-22-54zm5 0c0 17 21 36 21 54 0 4 1 8 4 10h40c3-2 4-6 4-10 0-18 21-37 21-54 0-23-20-41-45-41s-45 18-45 41zm17-4 2.4-1.2 17.6 33.2 1.4 32h-4.4l-1-30zm5 0 2-8h2l3 8.4 3-8.4h2l3 8.4 3-8.4h2l3 8.4 3-8.4h2l3 8.4 3-8.4h2l3 8.4 3-8.4h2l2 8-3-4.4-3 8.4h-2l-3-8.4-3 8.4h-2l-3-8.4-3 8.4h-2l-3-8.4-3 8.4h-2l-3-8.4-3 8.4h-2l-3-8.4zm29.6 64 1.4-32 17.6-33.2 2.4 1.2-16 34-1 30h-4.4z"/>`;
        case 'bunny':
            return `<path style="stroke-linejoin:round;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-width:6" d="m64.188 5.3125c-5.397 0.0813-10.898 1.0389-16.594 3.5313-9.817 4.2952-13.554 9.5252-16.282 14.968-6.538-0.307-13.468 2.455-18.218 7.938-7.3948 8.534-6.7113 20.389 1.531 26.438 2.24 1.644 4.798 2.641 7.5 3.124-1.063 4.28-0.91 8.757 0.187 13.219-0.158 0.044-0.31 0.076-0.468 0.125-6.958 2.178-10.97 9.256-8.938 15.75 0.747 2.386 2.204 4.346 4.094 5.782 1.73 1.79 4.454 2.466 7.125 1.5 3.388-1.226 5.531-4.662 5.25-8.063 4.838 7.044 11.348 13.245 17.969 17.565-3.132 2.04-5.007 4.69-4.938 7.56 0.045 1.87 0.5 4.28 2.406 5.16 5.356 2.46 12.173 2.75 18.907 2.68 6.644-0.07 13.36-0.49 18.562-3.03 1.833-0.89 2.139-3.3 2.094-5.15-0.013-0.55-0.101-1.1-0.25-1.63 3.256-0.79 6.06-1.98 8.344-3.53 4.213 3.86 10.941 4.27 16.151 0.66 6-4.15 7.72-12.064 3.85-17.66-3.11-4.492-8.87-6.111-14.126-4.438-1.317-4.594-3.729-9.761-7.406-15.5-8.605-13.428-28.229-23.563-43.969-25.531 0.719-2.053 1.093-4.161 1.093-6.219 10.581 1.08 21.879 1.693 38.594-0.906 5.763-0.896 7.759-2.691 2-7.031-7.125-5.37-15.153-9.126-25.437-8.906 5.516-2.421 10.784-5.283 15.25-8.375 5.825-4.034 7.757-7.3146-1.844-8.9378-4.128-0.6978-8.24-1.157-12.437-1.0937z"/><path d="m64.188 5.3125c-5.397 0.0813-10.898 1.0389-16.594 3.5313-9.817 4.2952-13.554 9.5252-16.282 14.968-6.538-0.307-13.468 2.455-18.218 7.938-7.3948 8.534-6.7113 20.389 1.531 26.438 2.24 1.644 4.798 2.641 7.5 3.124-1.063 4.28-0.91 8.757 0.187 13.219-0.158 0.044-0.31 0.076-0.468 0.125-6.958 2.178-10.97 9.256-8.938 15.75 0.747 2.386 2.204 4.346 4.094 5.782 1.73 1.79 4.454 2.466 7.125 1.5 3.388-1.226 5.531-4.662 5.25-8.063 4.838 7.044 11.348 13.245 17.969 17.565-3.132 2.04-5.007 4.69-4.938 7.56 0.045 1.87 0.5 4.28 2.406 5.16 5.356 2.46 12.173 2.75 18.907 2.68 6.644-0.07 13.36-0.49 18.562-3.03 1.833-0.89 2.139-3.3 2.094-5.15-0.013-0.55-0.101-1.1-0.25-1.63 3.256-0.79 6.06-1.98 8.344-3.53 4.213 3.86 10.941 4.27 16.151 0.66 6-4.15 7.72-12.064 3.85-17.66-3.11-4.492-8.87-6.111-14.126-4.438-1.317-4.594-3.729-9.761-7.406-15.5-8.605-13.428-28.229-23.563-43.969-25.531 0.719-2.053 1.093-4.161 1.093-6.219 10.581 1.08 21.879 1.693 38.594-0.906 5.763-0.896 7.759-2.691 2-7.031-7.125-5.37-15.153-9.126-25.437-8.906 5.516-2.421 10.784-5.283 15.25-8.375 5.825-4.034 7.757-7.3146-1.844-8.9378-4.128-0.6978-8.24-1.157-12.437-1.0937z"/><path style="fill-rule:evenodd;fill:#000000" d="m27.875 37.154a1.6792 1.5113 0 1 1 -3.358 0 1.6792 1.5113 0 1 1 3.358 0z" transform="matrix(2 0 0 2 -28.211 -37.658)"/><path style="stroke-linejoin:round;stroke:#000000;stroke-linecap:round;stroke-width:3;fill:none" d="m41.309 112.22c2.741-8.74 11.136-8.26 19.479-7.06-2.847-3.98-4.653-7.182-4.366-14.439 0.397-10.047 12.123-15.813 19.478-11.418"/>`;
        case 'egg':
            return `<g transform="translate(-23.4 -39.669)"><g fill-rule="evenodd"><path d="m209.88 233.69c-59.35 13.38-111.11 50.07-104.08 76.11 7.24 26.79 68.03 33.82 140.43 11.87 72.59-22.02 136.8-67.49 117.21-88.66-19.96-21.57-94.36-12.67-153.56 0.68z" fill="#555753" fill-opacity=".25098"/><path stroke-linejoin="round" d="m237.39 219.85c0.63 59.72-38.42 111.12-103.87 111.12-65.458 0-109.14-33.88-108.71-115.95 0.425-82.26 54.548-172.74 103.87-173.93 52.62-1.302 107.77 87.89 108.71 178.76z" stroke="#000" stroke-linecap="round" stroke-width="2.8183"/><path d="m200.27 107.27c-4.58 4.32 2.48 11.42 2.87 16.88 11.18 34.97 15.59 72.86 7.97 109.05-8.88 35.66-36.04 67.41-71.85 77.78-14 4.35-28.78 5.33-43.361 5.3-4.701 6.19 8.951 5.84 12.621 7.35 31.12 6.05 66.19 0.87 90.45-20.77 22.64-20.08 33.83-50.84 33.2-80.74 0.18-35.03-8.95-69.68-23.29-101.47-2.63-4.42-4.34-10.71-8.61-13.38z" fill="#c6c6ba" fill-opacity=".25098"/><path stroke-linejoin="round" d="m110.75 105.79c-3.2 12.98-4.72 17.62-14.901 19.36-7.019 1.2-14.096-5.45-11.68-18.55 1.937-10.513 9.93-21.123 18.931-22.584 9.92-1.61 10.24 11.283 7.65 21.774z" stroke-opacity=".2809" fill-opacity=".9382" stroke="#000" stroke-linecap="round" stroke-width="1.1273" fill="#fff"/></g></g>`;
        //case 'ant':
        //    return `<path d="m17.177 23.931c-1.026 0.841 7.226 11.285 7.735 11.893 7.05 8.436 14.029 8.726 14.892 9.985 0.87 1.251 5.028 5.437 12.424 6.668 0.028 1.923 0.134 3.74 0.332 5.466-4.546-1.252-9.666-2.327-12.53-2.32-3.019-0.007-13.244 2.85-15.075 3.706-0.644 0.304-12.325 0.007-12.325 1.279 0 1.287 11.632 1.761 12.113 1.111 4.221 0.671 16.178-1.514 17.451-1.287 1.273 0.24 11.066 3.09 11.137 3.104 0.735 3.38 1.803 5.225 3.069 7.481-4.865-0.141-13.598 4.674-18.47 9.546-4.044 4.045-10.783 10.585-11.801 12.028-3.805 5.374-2.101 22.179 0.007 22.179 1.654 0-2.306-15.044 1.499-20.418 1.096-1.549 13.35-9.914 14.778-11.555 1.429-1.64 9.023-3.988 12.205-6.364-3.203 2.072-5.395 5.311-5.395 9.766 0 16.541 8.633 23.211 15.118 23.291 0 0 0.007 0.02 0.021 0.02h0.127c6.477-0.08 15.069-6.77 15.069-23.283 0.007-4.151-1.91-7.269-4.752-9.348 3.458 2.213 10.239 4.384 11.582 5.926 1.436 1.633 13.632 9.998 14.732 11.554 3.82 5.367-0.14 20.431 1.53 20.431 2.09 0 3.81-16.811 0-22.185-1.02-1.435-7.755-7.969-11.8-12.014-4.879-4.879-13.598-9.694-18.47-9.546 1.266-2.255 2.327-4.15 3.069-7.537 0.064-0.008 9.857-2.815 11.137-3.048s13.23 1.959 17.454 1.28c0.48 0.657 12.12 0.177 12.11-1.103 0.01-1.28-11.71-1.004-12.35-1.308-1.83-0.863-12.002-3.713-15.029-3.713-2.864 0.007-8.025 1.082-12.572 2.32 0.198-1.712 0.346-3.529 0.375-5.452 7.396-1.245 11.561-5.424 12.416-6.675 0.87-1.252 7.849-1.542 14.9-9.992 0.5-0.601 8.76-11.052 7.73-11.886-1.21-0.983-8.78 8.761-9.08 9.616-2.05 1.019-11.796 7.51-12.97 7.977-1.181 0.459-7.12 2.581-13.435 6.364-0.969-3.699-3.408-6.209-6.392-7.538 4.122-0.007 7.121-0.813 7.121-5.353 0-4.964-0.955-9.539-2.56-13.209 4.391-2.284 7.573-4.73 8.527-5.077 0.955-0.36 1.323-1.676-0.487-4.999-2.984-5.4589-6.216-10.189-6.916-9.9278-0.7 0.2758 2.567 10.911 5.367 13.202-3.316 0.587-5.494 1.662-8.259 3.578-2.178-3.295-4.978-5.275-8.068-5.325-0.007-0.007-0.014-0.028-0.021-0.021-0.029 0-0.064-0.007-0.092-0.007-3.097 0.042-5.954 2.051-8.125 5.353-2.772-1.909-4.935-3.012-8.245-3.606 2.8-2.277 6.088-12.905 5.388-13.167-0.7-0.2614-3.952 4.4338-6.936 9.893-1.818 3.33-1.422 4.674-0.467 5.02 0.962 0.354 4.144 2.8 8.535 5.084-1.612 3.663-2.567 8.252-2.567 13.216 0 4.526 2.998 5.346 7.113 5.346-2.976 1.336-5.416 3.846-6.385 7.531-6.314-3.784-12.282-5.877-13.456-6.343-1.181-0.46-10.918-7.001-12.968-8.019-0.297-0.848-7.849-10.578-9.065-9.588z"/>`;
        case 'turtle':
            return `<path style="stroke:#000000;stroke-width:0.09375" d="m 116.14,18.675268 c 5.28,-0.32 10.73,-1.18 16,-0.09 1.71,0.51 3.5,0.69 5.3,0.64 0.66,0.08 1.99,0.24 2.65,0.32 0.98,0.67 2.07,0.89 3.26,0.67 l 0.84,0.14 c 0.53,0.21 1.6,0.63 2.13,0.84 l 0.82,-0.07 0.82,0.24 c 0.57,0.2 1.7,0.6 2.27,0.8 l 0.82,0.3 c 0.57,0.22 1.69,0.67 2.26,0.89 0.55,0.24 1.64,0.73 2.19,0.98 l 0.74,0.33 c 0.34,0.16 1.02,0.49 1.36,0.65 l 0.68,0.34 c 0.31,0.17 0.95,0.51 1.26,0.68 l 0.64,0.35 c 0.29,0.18 0.87,0.53 1.17,0.71 0.26,0.19 0.78,0.58 1.04,0.78 l 0.63,0.28 c 0.28,0.2 0.85,0.6 1.13,0.8 0.29,0.21 0.88,0.63 1.17,0.84 l 0.62,0.45 c 0.29,0.22 0.87,0.66 1.16,0.88 0.27,0.21 0.83,0.65 1.11,0.87 0.27,0.22 0.82,0.65 1.09,0.87 0.25,0.23 0.74,0.7 0.99,0.93 l 0.62,0.36 c 0.26,0.24 0.79,0.71 1.06,0.95 0.26,0.24 0.77,0.74 1.03,0.99 0.24,0.25 0.74,0.77 0.99,1.02 0.24,0.27 0.72,0.8 0.96,1.07 l 0.38,0.61 c 0.24,0.25 0.72,0.74 0.96,0.99 0.23,0.26 0.69,0.8 0.92,1.06 0.23,0.27 0.71,0.8 0.94,1.06 0.24,0.26 0.72,0.79 0.96,1.05 0.24,0.27 0.72,0.8 0.96,1.06 0.24,0.27 0.71,0.8 0.95,1.07 0.24,0.27 0.7,0.81 0.94,1.08 l 0.37,0.62 c 0.23,0.24 0.71,0.73 0.94,0.98 0.23,0.26 0.68,0.79 0.91,1.05 0.23,0.26 0.69,0.78 0.92,1.04 0.23,0.26 0.7,0.78 0.94,1.04 0.23,0.26 0.7,0.79 0.93,1.05 0.24,0.27 0.71,0.8 0.95,1.07 0.23,0.28 0.71,0.84 0.95,1.13 l 0.49,0.6 c 0.23,0.28 0.71,0.84 0.94,1.13 0.24,0.26 0.72,0.8 0.96,1.07 0.24,0.25 0.72,0.77 0.97,1.02 0.24,0.25 0.74,0.75 0.98,1 0.26,0.24 0.77,0.72 1.02,0.96 0.26,0.23 0.78,0.69 1.04,0.92 0.27,0.22 0.8,0.66 1.07,0.88 0.25,0.21 0.77,0.64 1.02,0.86 l 0.63,0.32 c 0.28,0.19 0.86,0.56 1.14,0.75 0.28,0.19 0.83,0.56 1.1,0.75 l 0.65,0.25 c 0.29,0.18 0.88,0.54 1.17,0.72 l 0.72,0.21 0.72,0.32 c 0.36,0.15 1.07,0.47 1.43,0.62 l 0.79,0.32 c 0.57,0.23 1.72,0.69 2.29,0.92 l 0.82,0.3 c 0.53,0.28 1.58,0.86 2.1,1.15 l 0.62,0.55 c 0,0.39 0.01,1.16 0.01,1.54 l -0.01,0.7 c -0.14,0.27 -0.42,0.81 -0.56,1.09 -0.13,0.24 -0.38,0.72 -0.5,0.96 l -0.19,0.5 c -0.1,0.23 -0.28,0.69 -0.38,0.92 -0.08,0.22 -0.24,0.66 -0.32,0.89 l -0.14,0.47 -0.16,0.48 c 0.2,-0.11 0.61,-0.34 0.81,-0.45 l 0.55,-0.03 c 0.3,-0.03 0.92,-0.1 1.22,-0.14 l 0.72,-0.12 c 0.52,-0.22 1.56,-0.66 2.09,-0.88 l 0.73,-0.2 c 0.31,-0.18 0.91,-0.55 1.21,-0.73 l 0.69,-0.21 c 0.3,-0.18 0.9,-0.54 1.2,-0.72 l 0.69,-0.22 c 0.3,-0.18 0.9,-0.55 1.2,-0.73 l 0.71,-0.22 c 0.3,-0.19 0.9,-0.55 1.21,-0.73 l 0.7,-0.23 c 0.3,-0.18 0.9,-0.54 1.2,-0.72 l 0.69,-0.23 c 0.3,-0.17 0.89,-0.53 1.19,-0.71 l 0.68,-0.2 c 0.29,-0.18 0.87,-0.53 1.16,-0.7 l 0.7,-0.18 c 0.29,-0.19 0.88,-0.55 1.18,-0.74 0.54,-0.23 1.61,-0.71 2.14,-0.94 l 0.76,-0.34 c 0.35,-0.15 1.07,-0.47 1.42,-0.62 l 0.77,-0.32 c 0.56,-0.2 1.69,-0.62 2.25,-0.83 l 0.82,-0.27 c 0.58,-0.18 1.74,-0.55 2.32,-0.74 0.44,-0.1 1.31,-0.3 1.75,-0.4 0.61,-0.15 1.84,-0.45 2.45,-0.61 0.73,-0.09 2.18,-0.27 2.91,-0.36 1.62,0.07 3.26,0.15 4.9,0.19 l 0.93,0.11 0.89,0.32 c 0.63,0.18 1.88,0.55 2.5,0.74 0.2,0.22 0.61,0.66 0.81,0.87 l 0.61,0.29 c 0.29,0.18 0.85,0.55 1.14,0.73 0.28,0.2 0.85,0.6 1.13,0.8 l 0.59,0.44 c 0.27,0.22 0.8,0.67 1.07,0.89 0.24,0.24 0.74,0.7 0.98,0.94 0.23,0.25 0.68,0.75 0.9,1 0.21,0.27 0.62,0.82 0.83,1.09 l 0.2,0.68 c 0.19,0.3 0.58,0.9 0.77,1.2 l 0.13,0.81 c 0.04,1.24 0.12,2.49 0.22,3.75 l -0.09,0.96 -0.27,0.95 c -0.2,0.66 -0.6,1.99 -0.8,2.65 -0.22,0.21 -0.66,0.62 -0.88,0.83 l -0.3,0.59 c -0.19,0.26 -0.57,0.78 -0.77,1.04 -0.21,0.24 -0.62,0.73 -0.83,0.97 -0.22,0.22 -0.67,0.67 -0.89,0.9 -0.24,0.21 -0.72,0.64 -0.95,0.85 -0.27,0.2 -0.8,0.61 -1.06,0.82 l -0.59,0.4 c -0.31,0.2 -0.92,0.59 -1.23,0.78 -0.53,0.24 -1.61,0.73 -2.15,0.97 -0.42,0.14 -1.26,0.41 -1.68,0.55 -0.59,0.18 -1.76,0.54 -2.34,0.73 l -0.83,0.25 c -0.57,0.19 -1.7,0.57 -2.27,0.76 l -0.81,0.25 c -0.57,0.17 -1.7,0.53 -2.27,0.7 -0.42,0.1 -1.26,0.29 -1.68,0.39 -0.56,0.17 -1.69,0.51 -2.26,0.69 l -0.82,0.23 c -0.57,0.17 -1.71,0.53 -2.27,0.7 -0.43,0.1 -1.27,0.29 -1.7,0.39 -0.57,0.18 -1.71,0.53 -2.29,0.71 l -0.82,0.24 c -0.56,0.19 -1.69,0.57 -2.25,0.76 l -0.81,0.23 -0.83,-0.05 c -0.53,0.21 -1.59,0.65 -2.12,0.87 l -0.83,0.19 c -0.57,0.18 -1.72,0.54 -2.29,0.73 l -0.82,0.250002 c -0.57,0.19 -1.7,0.58 -2.27,0.77 l -0.81,0.23 -0.83,-0.05 c -0.53,0.21 -1.58,0.65 -2.11,0.87 l -0.83,0.18 c -0.57,0.18 -1.69,0.54 -2.26,0.72 l -0.81,0.24 c -0.56,0.19 -1.67,0.57 -2.22,0.76 l -0.81,0.25 c -0.52,0.23 -1.58,0.67 -2.1,0.9 -0.53,0.2 -1.59,0.59 -2.12,0.79 l -0.77,0.25 c -0.54,0.13 -1.6,0.4 -2.14,0.53 l -0.62,0.4 0.17,0.54 c 0.23,0.76 0.46,1.52 0.7,2.29 l 0.19,0.61 c 0.42,-0.01 1.26,-0.03 1.68,-0.04 l 0.85,0 c 0.55,0.17 1.65,0.52 2.21,0.7 l 0.8,0.25 c 0.55,0.19 1.65,0.56 2.21,0.75 l 0.8,0.25 c 0.57,0.18 1.7,0.54 2.26,0.71 l 0.83,0.2 c 0.53,0.21 1.61,0.63 2.14,0.84 l 0.83,-0.07 0.83,0.2 c 0.96,0.75 2.04,1.01 3.25,0.79 l 0.88,-0.04 c 0.68,0.11 2.03,0.32 2.71,0.43 0.6,0.15 1.81,0.45 2.42,0.59 0.42,0.1 1.27,0.3 1.69,0.4 0.54,0.2 1.61,0.59 2.15,0.79 l 0.68,0.32 c 0.33,0.09 0.99,0.25 1.31,0.34 l 0.71,-0.02 c -0.2,0.55 -0.58,1.64 -0.78,2.19 -0.45,1.29 -1.09,2.52 -1.69,3.76 -1.54,0 -2.88,0.8 -4.06,1.7 -0.25,0.2 -0.75,0.61 -1,0.82 l -0.48,0.43 c -0.25,0.21 -0.75,0.61 -1,0.81 -1.23,0.36 -2.39,0.94 -3.3,1.85 -0.36,0.4 -1.1,1.21 -1.47,1.62 l -0.5,0.5 c -0.28,0.18 -0.83,0.52 -1.1,0.69 l -0.63,0.02 -0.63,-0.04 c -0.27,-0.14 -0.81,-0.41 -1.08,-0.55 -0.26,-0.16 -0.78,-0.49 -1.04,-0.66 -0.28,-0.18 -0.83,-0.54 -1.1,-0.72 l -0.59,-0.4 c -0.29,-0.2 -0.87,-0.6 -1.16,-0.79 -0.3,-0.2 -0.89,-0.59 -1.19,-0.79 l -0.63,-0.4 c -0.3,-0.19 -0.9,-0.57 -1.2,-0.76 -0.28,-0.21 -0.82,-0.61 -1.09,-0.82 l -0.67,-0.27 c -0.31,-0.19 -0.93,-0.58 -1.24,-0.77 l -0.65,-0.41 c -0.31,-0.2 -0.93,-0.6 -1.23,-0.8 -0.31,-0.21 -0.93,-0.61 -1.24,-0.81 l -0.64,-0.42 c -0.31,-0.21 -0.91,-0.62 -1.22,-0.83 -0.3,-0.21 -0.9,-0.62 -1.2,-0.82 l -0.63,-0.43 c -0.29,-0.2 -0.87,-0.62 -1.16,-0.82 -0.28,-0.2 -0.83,-0.6 -1.11,-0.8 -0.26,-0.21 -0.77,-0.63 -1.03,-0.84 l -0.62,-0.31 c -0.29,-0.2 -0.86,-0.6 -1.14,-0.81 -0.3,-0.2 -0.89,-0.6 -1.18,-0.81 l -0.63,-0.41 c -0.3,-0.2 -0.9,-0.6 -1.2,-0.8 -0.31,-0.19 -0.92,-0.56 -1.22,-0.75 l -0.64,-0.36 c -0.31,-0.17 -0.92,-0.51 -1.23,-0.68 -0.29,-0.15 -0.88,-0.46 -1.18,-0.62 l -0.72,-0.14 -0.74,-0.2 c -0.58,-1.39 -1.32,-1.5 -2.22,-0.32 -0.66,0.02 -1.99,0.07 -2.66,0.09 -1.79,-0.26 -3.55,0.52 -4.44,2.13 l -0.54,0.65 c -0.15,0.57 -0.44,1.71 -0.58,2.27 l -0.2,0.84 c -0.18,0.57 -0.55,1.72 -0.73,2.3 l -0.24,0.85 c -0.15,0.63 -0.46,1.89 -0.61,2.52 0.08,0.49 0.22,1.49 0.3,1.98 l -0.52,-0.35 c 0.08,0.3 0.24,0.91 0.32,1.21 0.15,0.32 0.45,0.96 0.6,1.28 0.17,0.29 0.5,0.86 0.67,1.15 0.21,0.25 0.63,0.75 0.84,1 0.24,0.22 0.72,0.67 0.97,0.89 l 0.52,0.44 c 0.24,0.21 0.73,0.64 0.98,0.85 0.22,0.22 0.65,0.67 0.86,0.89 l 0.53,0.38 c 0.2,0.26 0.59,0.8 0.78,1.07 0.09,0.34 0.25,1.02 0.34,1.36 0,0.31 0.01,0.94 0.02,1.25 l 0.39,-0.45 c -0.2,0.56 -0.61,1.66 -0.81,2.22 -0.07,0.32 -0.2,0.96 -0.27,1.28 l 0.49,-0.42 -0.67,0.52 c -0.32,0.48 -0.97,1.43 -1.3,1.91 l -0.17,0.79 c -0.03,0.4 -0.09,1.2 -0.11,1.61 -0.46,0.06 -1.37,0.18 -1.83,0.25 -1.52,0.03 -3,0.37 -4.37,0.98 -0.7,0.1 -2.11,0.28 -2.81,0.38 l -0.94,0.04 c -1.75,-0.01 -5.24,-0.03 -6.98,-0.04 -0.73,-0.11 -2.19,-0.33 -2.91,-0.44 -1,-0.7 -2.09,-0.99 -3.29,-0.87 l -0.73,-0.27 c -0.31,-0.14 -0.95,-0.43 -1.27,-0.58 l -0.61,-0.31 c -0.28,-0.18 -0.83,-0.53 -1.11,-0.71 l -0.53,-0.41 c -0.23,-0.25 -0.69,-0.74 -0.92,-0.99 l -0.39,-0.6 c -0.16,-0.34 -0.49,-1.01 -0.65,-1.35 l -0.24,-0.81 c -0.06,-0.69 -0.18,-2.07 -0.25,-2.75 0.07,-0.71 0.19,-2.13 0.25,-2.83 0.17,-0.36 0.5,-1.08 0.67,-1.43 -0.01,-0.43 -0.01,-1.28 -0.02,-1.71 l 0.18,-0.82 c 0.18,-0.34 0.54,-1 0.73,-1.34 0.02,-0.42 0.07,-1.27 0.09,-1.7 l 0.23,-0.85 c 0.17,-0.58 0.53,-1.75 0.7,-2.33 l 0.19,-0.8 c 0.2,-0.31 0.61,-0.91 0.82,-1.21 0.05,-0.41 0.15,-1.23 0.2,-1.65 l 0.36,-0.77 c 0.14,-0.4 0.42,-1.21 0.56,-1.61 l -0.78,-0.26 c -2.71,-0.95 -5.39,-1.57 -8.1,-2.36 -0.38,0.05 -1.15,0.14 -1.53,0.19 -3.58,-0.27 -7.09,-0.38 -10.65,-0.39 -6.39,-0.14 -12.77,0.3 -19.13,-0.1 -0.54,0.18 -1.61,0.52 -2.15,0.69 -0.36,0.09 -1.08,0.27 -1.44,0.36 -0.3,0.1 -0.89,0.3 -1.19,0.4 l 0.71,0.26 c -1.46,-0.04 -1.69,0.56 -0.71,1.8 l 0.07,0.82 c 0,0.4 0,1.21 0,1.61 0.16,0.33 0.47,0.98 0.63,1.31 l 0.14,0.79 c 0.06,0.61 0.17,1.82 0.22,2.43 0.17,0.32 0.5,0.97 0.67,1.29 l 0.24,0.77 c 0.27,0.51 0.8,1.53 1.07,2.04 0.49,0.31 1.48,0.93 1.98,1.23 0.42,0.11 1.25,0.32 1.67,0.42 1.31,0.63 2.73,1 4.19,1.09 0.45,0.07 1.34,0.21 1.79,0.29 0.02,0.43 0.05,1.29 0.07,1.71 l 0.11,0.87 c 0.05,0.43 0.14,1.31 0.19,1.75 l -0.19,0.89 c -0.04,0.44 -0.12,1.33 -0.16,1.77 -1.16,-0.14 -2.02,0.34 -2.57,1.45 -0.43,0.36 -1.3,1.07 -1.73,1.42 -0.12,0.39 -0.35,1.16 -0.47,1.55 l -0.87,-0.12 c -1.23,-0.3 -2.33,-0.04 -3.3,0.79 -1.69,-0.03 -5.06,-0.09 -6.74,-0.13 -1.78,-0.4 -3.59,-0.63 -5.4,-0.61 l -0.87,-0.04 c -0.42,-0.08 -1.28,-0.25 -1.71,-0.34 -0.56,-0.17 -1.67,-0.51 -2.23,-0.68 l -0.7,-0.26 c -0.26,-0.18 -0.79,-0.55 -1.05,-0.73 l -0.63,-0.19 c -0.25,-0.23 -0.74,-0.68 -0.99,-0.9 -0.31,-0.44 -0.94,-1.33 -1.25,-1.77 -0.22,-0.55 -0.65,-1.63 -0.87,-2.17 -0.11,-0.42 -0.34,-1.26 -0.46,-1.67 -0.15,-0.59 -0.47,-1.76 -0.62,-2.35 -0.08,-0.43 -0.24,-1.29 -0.32,-1.72 0.24,-1.21 0,-2.31 -0.7,-3.29 -0.07,-0.43 -0.23,-1.3 -0.3,-1.73 0.24,-1.21 0.01,-2.32 -0.68,-3.31 -0.09,-0.67 -0.27,-1.99 -0.36,-2.65 0.28,-1.2 0.08,-2.3 -0.6,-3.29 -0.12,-0.42 -0.36,-1.25 -0.47,-1.66 -0.4,-0.41 -1.19,-1.21 -1.58,-1.62 -1.12,-0.22 -2.23,-0.48 -3.31,-0.79 -1.11,-0.93 -2.62,-0.28 -2.98,1.03 -0.23,0.22 -0.69,0.65 -0.92,0.86 l -0.33,0.58 c -0.19,0.29 -0.57,0.85 -0.76,1.13 l -0.39,0.59 c -0.19,0.29 -0.57,0.86 -0.75,1.15 -0.2,0.26 -0.6,0.79 -0.8,1.06 l -0.28,0.63 c -0.19,0.28 -0.58,0.86 -0.77,1.14 -0.21,0.27 -0.63,0.8 -0.84,1.06 l -0.32,0.65 c -0.21,0.3 -0.63,0.88 -0.85,1.17 -0.22,0.3 -0.66,0.9 -0.88,1.2 l -0.47,0.62 c -0.23,0.29 -0.7,0.87 -0.93,1.16 -0.24,0.27 -0.71,0.81 -0.95,1.08 -0.24,0.25 -0.72,0.77 -0.96,1.02 -0.25,0.25 -0.75,0.75 -1,0.99 -0.25,0.24 -0.76,0.71 -1.02,0.95 -0.26,0.23 -0.79,0.68 -1.06,0.91 -0.28,0.21 -0.84,0.64 -1.11,0.85 l -0.65,0.28 c -0.28,0.2 -0.82,0.59 -1.1,0.79 l -0.67,0.19 c -0.3,0.16 -0.89,0.49 -1.19,0.65 l -0.67,0.25 c -0.34,0.09 -1.01,0.29 -1.34,0.38 l -0.7,0.06 c -0.32,-0.08 -0.97,-0.23 -1.29,-0.31 l -0.73,0.01 c -0.36,-0.13 -1.07,-0.37 -1.43,-0.5 -0.32,-0.17 -0.95,-0.53 -1.26,-0.71 l -0.6,-0.43 c -0.24,-0.26 -0.73,-0.77 -0.97,-1.03 -0.36,-0.12 -1.1,-0.36 -1.47,-0.49 -0.04,-1.19 -0.55,-2.15 -1.52,-2.86 -0.17,-0.37 -0.49,-1.11 -0.65,-1.47 l -0.35,-0.82 c -0.02,-3.04 -0.02,-5.92 0.08,-8.89 l 0.13,-0.88 0.25,-0.81 c 0.17,-0.3 0.51,-0.91 0.68,-1.21 l 0.13,-0.68 c 0.19,-0.25 0.57,-0.76 0.76,-1.01 l 0.26,-0.59 c 0.22,-0.24 0.65,-0.72 0.86,-0.96 0.26,-0.21 0.78,-0.65 1.03,-0.86 l 0.61,-0.41 c 0.32,-0.19 0.97,-0.57 1.29,-0.75 l 0.74,-0.36 c 0.57,-0.25 1.71,-0.73 2.28,-0.98 l 0.81,-0.34 c 0.52,-0.29 1.57,-0.86 2.09,-1.14 l 0.6,-0.46 c 0.23,-0.21 0.69,-0.65 0.92,-0.86 l 0.29,-0.54 c 0.12,-0.25 0.37,-0.76 0.49,-1.01 l 0.15,-0.55 c 0.09,-0.25 0.25,-0.74 0.33,-0.99 -0.16,-0.21 -0.49,-0.62 -0.66,-0.83 -0.4,-0.33 -1.2,-1.000002 -1.6,-1.330002 l -0.66,-0.34 c -0.28,-0.17 -0.85,-0.51 -1.14,-0.68 l -0.7,-0.15 -0.67,-0.29 c -0.33,-0.14 -0.98,-0.43 -1.31,-0.57 l -0.67,-0.3 c -0.34,-0.15 -1,-0.44 -1.34,-0.59 l -0.71,-0.3 c -0.36,-0.14 -1.09,-0.42 -1.45,-0.56 -0.42,-0.14 -1.25,-0.41 -1.67,-0.54 -1.07,-0.7 -2.23,-0.98 -3.48,-0.83 -0.44,-0.08 -1.33,-0.23 -1.77,-0.31 -0.36,-0.16 -1.07,-0.48 -1.43,-0.64 -0.65,-0.04 -1.94,-0.11 -2.59,-0.15 l -0.84,-0.16 c -0.34,-0.17 -1.03,-0.51 -1.38,-0.68 -0.42,-0.02 -1.27,-0.05 -1.7,-0.06 l -0.83,-0.19 c -0.34,-0.18 -1.03,-0.55 -1.37,-0.74 -0.44,-0.03 -1.33,-0.09 -1.77,-0.11 l -0.88,-0.26 c -0.6,-0.19 -1.82,-0.58 -2.43,-0.78 l -0.8,-0.26 c -0.32,-0.17 -0.97,-0.51 -1.29,-0.68 l -0.76,-0.1 -0.7,-0.3 c -0.33,-0.16 -0.99,-0.47 -1.31,-0.63 l -0.65,-0.32 c -0.29,-0.16 -0.88,-0.49 -1.18,-0.66 l -0.57,-0.32 c -0.24,-0.18 -0.73,-0.52 -0.98,-0.69 -0.21,-0.18 -0.64,-0.54 -0.85,-0.72 -0.2,-0.21 -0.6,-0.63 -0.8,-0.83 l -0.01,-0.64 0.39,-0.57 0.69,0.24 c 0.55,0.12 1.65,0.37 2.19,0.5 l 0.82,0.18 c 0.54,0.2 1.62,0.61 2.16,0.82 l 0.83,-0.06 0.83,0.18 c 0.55,0.22 1.65,0.65 2.2,0.87 l 0.85,-0.05 0.85,0.23 c 1.03,0.7 2.18,0.97 3.43,0.8 0.69,0.12 2.06,0.35 2.75,0.47 1.27,0.5 2.68,1.04 4.06,0.59 l 0.74,-0.14 c 0.91,-0.41 2.71,-0.11 2.88,-1.4 -0.06,-0.25 -0.19,-0.76 -0.26,-1.01 -0.22,-0.18 -0.68,-0.55 -0.91,-0.73 l -0.49,-0.32 c -0.23,-0.16 -0.69,-0.49 -0.92,-0.65 -0.21,-0.16 -0.63,-0.5 -0.84,-0.67 l -0.45,-0.32 c -0.17,-0.21 -0.53,-0.62 -0.7,-0.82 -0.12,-0.25 -0.35,-0.74 -0.46,-0.99 l 0.01,-0.56 0.33,-0.46 c 0.16,-0.23 0.46,-0.7 0.61,-0.93 l 0.45,-0.38 c 0.2,-0.23 0.58,-0.7 0.78,-0.93 0.21,-0.27 0.64,-0.82 0.85,-1.09 l 0.47,-0.63 c 0.31,-0.49 0.94,-1.47 1.25,-1.96 0.22,-0.27 0.67,-0.82 0.89,-1.09 l 0.28,-0.66 c 0.21,-0.28 0.63,-0.82 0.84,-1.1 0.22,-0.26 0.64,-0.79 0.86,-1.05 0.22,-0.26 0.65,-0.78 0.87,-1.04 0.22,-0.27 0.66,-0.81 0.88,-1.08 0.22,-0.29 0.65,-0.86 0.87,-1.15 l 0.45,-0.63 c 0.22,-0.3 0.65,-0.9 0.86,-1.21 0.21,-0.31 0.63,-0.93 0.84,-1.24 l 0.42,-0.65 c 0.2,-0.31 0.6,-0.92 0.8,-1.23 0.22,-0.27 0.64,-0.82 0.85,-1.09 l 0.29,-0.67 c 0.19,-0.29 0.59,-0.89 0.78,-1.18 0.21,-0.27 0.64,-0.82 0.85,-1.09 l 0.3,-0.66 c 0.2,-0.3 0.6,-0.9 0.8,-1.2 0.22,-0.27 0.65,-0.82 0.87,-1.1 l 0.31,-0.67 c 0.2,-0.3 0.61,-0.9 0.81,-1.2 0.22,-0.28 0.66,-0.83 0.87,-1.1 l 0.32,-0.67 c 0.2,-0.3 0.62,-0.9 0.82,-1.19 0.23,-0.27 0.67,-0.81 0.9,-1.08 l 0.32,-0.66 c 0.22,-0.29 0.65,-0.87 0.87,-1.16 0.21,-0.29 0.64,-0.86 0.86,-1.14 0.22,-0.26 0.68,-0.77 0.91,-1.03 l 0.35,-0.63 c 0.22,-0.28 0.67,-0.84 0.89,-1.11 0.23,-0.28 0.69,-0.83 0.91,-1.1 0.23,-0.28 0.69,-0.83 0.92,-1.11 0.23,-0.29 0.7,-0.86 0.93,-1.14 l 0.48,-0.61 c 0.24,-0.27 0.71,-0.83 0.94,-1.11 0.24,-0.26 0.71,-0.79 0.94,-1.05 0.24,-0.25 0.71,-0.75 0.95,-1 0.24,-0.25 0.73,-0.73 0.97,-0.97 0.25,-0.24 0.75,-0.71 1,-0.94 0.25,-0.24 0.77,-0.7 1.03,-0.93 0.28,-0.23 0.82,-0.69 1.1,-0.92 l 0.58,-0.47 c 0.28,-0.22 0.84,-0.67 1.12,-0.89 0.27,-0.22 0.81,-0.65 1.08,-0.87 0.27,-0.22 0.82,-0.65 1.09,-0.87 0.28,-0.21 0.85,-0.64 1.13,-0.85 l 0.61,-0.43 c 0.29,-0.2 0.88,-0.61 1.18,-0.82 0.3,-0.19 0.9,-0.58 1.2,-0.77 l 0.63,-0.38 c 0.3,-0.17 0.91,-0.51 1.22,-0.68 l 0.63,-0.26 c 0.21,-0.22 0.63,-0.66 0.84,-0.87 0.61,-0.19 1.82,-0.56 2.42,-0.75 l 0.84,-0.37 c 0.57,-0.24 1.73,-0.71 2.31,-0.94 0.41,-0.04 1.24,-0.11 1.66,-0.15 0.31,-0.2 0.93,-0.6 1.24,-0.8 l 0.81,-0.2 c 0.6,-0.16 1.8,-0.48 2.4,-0.64 0.45,-0.08 1.36,-0.25 1.81,-0.34 1.19,0 2.39,-0.04 3.59,-0.11 l 0.82,0.17 0.38,-0.76 c 1.2,-0.18 2.41,-0.29 3.64,-0.33 2.49,-0.05 4.98,-0.21 7.47,-0.48 z"/>`;
        case 'candycorn':
            return `<g stroke-linejoin="round" fill-rule="evenodd" stroke-linecap="round" transform="translate(212.29 -.79375)"><g stroke-width="1.977" transform="translate(-212.29 .79083)"><path d="m8.7744 299.92h305.67c-11.7-40.924-32.198-82.979-45.323-120.19-6.8504-19.422-12.687-43.17-19.199-66.934h-169.63c-6.616 20.75-12.729 41.19-19.492 58.14-15.931 39.94-40.082 85.16-52.024 128.98z" stroke="#f37100" fill="#f37100"/><path d="m8.7744 299.92c-9.7509 35.777-11.392 70.622 6.4747 100.85 25.785 43.628 94.283 44.105 144.96 46.178 50.196 2.0538 118.85 7.808 146.86-33.853 21.965-32.667 19.047-72.359 7.3767-113.18h-305.67z" stroke="#f3f320" fill="#f3f320"/><path d="m80.286 112.83h169.63c-15.09-55.073-34.36-110.14-82.11-111.25-48.56-1.125-69.945 56.085-87.524 111.25z" stroke="#e3e3e3" fill="#e3e3e3"/></g><path opacity=".5" d="m-44.468 2.3473c68.363 1.5855 78.576 113.78 101.3 178.21 26.217 74.328 81.944 167.94 37.957 233.36-28.012 41.661-96.66 35.903-146.86 33.849-50.674-2.0733-119.18-2.5401-144.96-46.168-39.748-67.252 16.617-157.28 45.556-229.84 24.742-62.03 40.181-170.96 107-169.41z" stroke="#aaa" stroke-width="3.0908"/></g>`;
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
        case 'magic':
            return `0 0 2666 2666`;
        case 'heart':
            return `0 0 20 16`;
        case 'clover':
            return `0 0 660.51 780.1`;
        case 'candy':
            return `0 0 200 200`;
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
        case 'taijitu':
            return `0 -10 256 256 `;
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
        case 'ant':
            return `0 0 128 128`;
        case 'turtle':
            return `20 40 270 50`;
        case 'candycorn':
            return `0 0 325 449.98`;
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
            case 'equilibrium':
                return 'taijitu';
            case 'utopia':
                return 'martini';
            case 'energetic':
                return 'lightbulb';
            case 'finish_line':
                return 'turtle';
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
            case 'trickortreat':
                return 'candy';
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

export function drawIcon(icon,size,shade,id,inject){
    let select = '';
    if (id){
        select = `id="${id}" `;
    }
    return `<span ${inject}${select}class="flair drawnIcon"><svg class="star${shade}" version="1.1" x="0px" y="0px" width="${size}px" height="${size}px" viewBox="${svgViewBox(icon)}" xml:space="preserve">${svgIcons(icon)}</svg></span>`;
}

export function easterEgg(num,size){
    let easter = getEaster();
    if (easter.active && !global.special.egg[`egg${num}`]){
        return drawIcon('egg', size ? size : 16, 2, `egg${num}`, `role="button" aria-label="Egg" `);
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

export function trickOrTreat(num,size){
    let halloween = getHalloween();
    if (halloween.active && !global.special.trick[`trick${num}`]){
        let label = num > 6 ? `Ghost`: `Candy Corn`;
        return drawIcon(num <= 6 ? 'candycorn' : 'ghost', size ? size : 16, 2, `trick${num}`, `role="button" aria-label="${label}" `);
    }
    return '';
}

export function trickOrTreatBind(id){
    $(`#trick${id}`).click(function(){
        if (!global.special.trick[`trick${id}`]){
            global.special.trick[`trick${id}`] = true;
            if (id <= 6){
                if (global.race.universe === 'antimatter'){
                    global.race.Plasmid.anti += 15;
                    global.stats.antiplasmid += 15;
                    messageQueue(loc('city_trick_msg',[15,loc('resource_AntiPlasmid_plural_name')]),'success');
                }
                else {
                    global.race.Plasmid.count += 15;
                    global.stats.plasmid += 15;
                    messageQueue(loc('city_trick_msg',[15,loc('resource_Plasmid_plural_name')]),'success');
                }
            }
            else {
                global.race.Phage.count += 2;
                global.stats.phage += 2;
                messageQueue(loc('city_ghost_msg',[2,loc('resource_Phage_name')]),'success');
            }
            $(`#trick${id}`).remove();
            setTimeout(function(){
                if (id === 7){
                    if (poppers[`popcity-garrison}`]){
                        poppers[`popcity-garrison`].destroy();
                    }
                    $('.popper').hide();
                }
            }, 250);
        }
    });
}

function single_emblem(achieve,size,icon,iconName,fool,universeAffix){
    return global.stats.achieve[achieve] && (fool ? global.stats.achieve[achieve][universeAffix] - 1 : global.stats.achieve[achieve][universeAffix]) > 1 ? `<p class="flair" title="${sLevel(global.stats.achieve[achieve][universeAffix])} ${iconName}"><svg class="star${fool ? global.stats.achieve[achieve][universeAffix] - 1 : global.stats.achieve[achieve][universeAffix]}" version="1.1" x="0px" y="0px" width="${size}px" height="${size}px" viewBox="${svgViewBox(icon)}" xml:space="preserve">${svgIcons(icon)}</svg></p>` : '';
}

export function format_emblem(achieve,size,baseIcon,fool,universe){
    if (!size){
        size = 10;
    }
    if (!baseIcon){
        baseIcon = getBaseIcon(achieve,'achievement');
    }
    let emblem = ``
    if (!universe){
        emblem = emblem + single_emblem(achieve,size,baseIcon,loc(global.settings.icon),fool,'l');
        emblem = emblem + single_emblem(achieve,size,'atom',loc('universe_antimatter'),fool,'a');
        emblem = emblem + single_emblem(achieve,size,'evil',loc('universe_evil'),fool,'e');
        emblem = emblem + single_emblem(achieve,size,'heavy',loc('universe_heavy'),fool,'h');
        emblem = emblem + single_emblem(achieve,size,'micro',loc('universe_micro'),fool,'m');
        emblem = emblem + single_emblem(achieve,size,'magic',loc('universe_magic'),fool,'mg');
    }
    else {
        switch (universe){
            case 'standard':
                emblem = emblem + single_emblem(achieve,size,baseIcon,loc(global.settings.icon),fool,'l');
                break;
            case 'antimatter':
                emblem = emblem + single_emblem(achieve,size,'atom',loc('universe_antimatter'),fool,'a');
                break;
            case 'evil':
                emblem = emblem + single_emblem(achieve,size,'evil',loc('universe_evil'),fool,'e');
                break;
            case 'heavy':
                emblem = emblem + single_emblem(achieve,size,'heavy',loc('universe_heavy'),fool,'h');
                break;
            case 'micro':
                emblem = emblem + single_emblem(achieve,size,'micro',loc('universe_micro'),fool,'m');
                break;
            case 'magic':
                emblem = emblem + single_emblem(achieve,size,'magic',loc('universe_magic'),fool,'mg');
                break;
        }
    }

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
        for (let i=0; i<universe_affixes.length; i++){
            if (global.stats.achieve.ascended.hasOwnProperty(universe_affixes[i])){
                genes += global.stats.achieve.ascended[universe_affixes[i]];
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

export function vacuumCollapse(){
    if (global.tech.syphon >= 80 && global.race.universe === 'magic'){
        global.tech.syphon = 79;
        global.arpa.syphon.rank = 79;
        global.arpa.syphon.complete = 99;
        global.queue.queue = [];

        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
        global.lastMsg = false;

        unlockAchieve(`extinct_${global.race.species}`);
        unlockAchieve(`pw_apocalypse`);

        if (!global.race['modified'] && global.race.species === 'balorg'){
            unlockAchieve('pass');
        }
        if (global.race.species === 'junker'){
            unlockFeat('the_misery');
        }
        if (global.race['decay']){
            unlockAchieve(`dissipated`);
        }
        if (global.race['steelen']){
            unlockFeat('steelem');
        }

        let god = global.race.species;
        let old_god = global.race.gods;
        let orbit = global.city.calendar.orbit;
        let biome = global.city.biome;
        let atmo = global.city.ptrait;
        let plasmid = global.race.Plasmid.count;
        let antiplasmid = global.race.Plasmid.anti;
        let phage = global.race.Phage.count;
        let dark = global.race.Dark.count;

        let gains = calcPrestige('vacuum');
        let new_plasmid = gains.plasmid;
        let new_phage = gains.phage;
        let new_dark = gains.dark;

        checkAchievements();

        phage += new_phage;
        global.stats.reset++;
        global.stats.blackhole++;
        global.stats.tdays += global.stats.days;
        global.stats.days = 0;
        global.stats.tknow += global.stats.know;
        global.stats.know = 0;
        global.stats.tstarved += global.stats.starved;
        global.stats.starved = 0;
        global.stats.tdied += global.stats.died;
        global.stats.died = 0;
        if (global.race.universe === 'antimatter'){
            antiplasmid += new_plasmid;
            global.stats.antiplasmid += new_plasmid;
        }
        else {
            plasmid += new_plasmid;
            global.stats.plasmid += new_plasmid;
        }
        global.stats.phage += new_phage;
        global.stats.universes++;
        global['race'] = {
            species : 'protoplasm',
            gods: god,
            old_gods: old_god,
            Plasmid: { count: plasmid, anti: antiplasmid },
            Phage: { count: phage },
            Dark: { count: +(dark + new_dark).toFixed(3) },
            Harmony: { count: global.race.Harmony.count },
            universe: 'bigbang',
            seeded: true,
            bigbang: true,
            probes: 4,
            seed: Math.floor(Math.seededRandom(10000)),
            ascended: false,
        };
        global.city = {
            calendar: {
                day: 0,
                year: 0,
                weather: 2,
                temp: 1,
                moon: 0,
                wind: 0,
                orbit: orbit
            },
            biome: biome,
            ptrait: atmo
        };
        global.tech = { theology: 1 };
        clearStates();
        global.new = true;
        Math.seed = Math.rand(0,10000);
        global.seed = Math.seed;

        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        window.location.reload();
    }
}

export function deepClone(obj){
    //in case of premitives
    if(obj===null || typeof obj !== "object"){
        return obj;
    }

    //date objects should be
    if(obj instanceof Date){
        return new Date(obj.getTime());
    }

    //handle Array
    if(Array.isArray(obj)){
        var clonedArr = [];
        obj.forEach(function(element){
            clonedArr.push(deepClone(element))
        });
        return clonedArr;
    }

    //lastly, handle objects
    let clonedObj = new obj.constructor();
    for(var prop in obj){
        if(obj.hasOwnProperty(prop)){
            clonedObj[prop] = deepClone(obj[prop]);
        }
    }
    return clonedObj;
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

    if (global.settings.boring){
        return easter;
    }

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

export function getHalloween(){
    let halloween = {
        date: [9,28],
        active: false,
        endDate: [10,4]
    };

    if (global.settings.boring){
        return halloween;
    }

    const date = new Date();

    if ((date.getMonth() === halloween.date[0] && date.getDate() >= halloween.date[1]) || (date.getMonth() === halloween.endDate[0] && date.getDate() <= halloween.endDate[1])){
        halloween.active = true;
    }

    return halloween;
}

export function shrineBonusActive() {
	return (global.race['magnificent'] && global.city.hasOwnProperty('shrine') && global.city.shrine.count > 0);
}

export function getShrineBonus(type) {
	let shrine_bonus = {
		mult: 1,
		add: 0
	};

	if (shrineBonusActive()){
		switch(type){
			case 'metal':
				shrine_bonus.mult += +(global.city.shrine.metal / 100);
				break;
			case 'tax':
				shrine_bonus.mult += +(global.city.shrine.tax / 100);
				break;
			case 'know':
                shrine_bonus.add += +(global.city.shrine.know * 400);
                shrine_bonus.mult += +(global.city.shrine.know * 3 / 100);
				break;
			case 'morale':
				shrine_bonus.add += global.city.shrine.morale;
				break;
			default:
				break;
		}
	}

	return shrine_bonus;
}
