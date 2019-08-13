import { global, vues, poppers, messageQueue, keyMultiplier, p_on, modRes } from './vars.js';
import { spatialReasoning } from './resources.js';
import { armyRating } from './civics.js';
import { payCosts, setAction } from './actions.js';
import { costMultiplier, checkRequirements, incrementStruct } from './space.js';
import { loc } from './locale.js';

const fortressModules = {
    prtl_fortress: {
        info: {
            name: loc('portal_fortress_name'),
            desc: loc('portal_fortress_desc'),
        },
        turret: {
            id: 'portal-turret',
            title(){
                let type = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 'portal_turret_title3' : 'portal_turret_title2') : 'portal_turret_title1';
                return loc(type);
            },
            desc(){
                let type = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 'portal_turret_title3' : 'portal_turret_title2') : 'portal_turret_title1';
                return `<div>${loc(type)}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 2 },
            cost: {
                Money(){ return costMultiplier('turret', 350000, 1.28, 'portal'); },
                Copper(){ return costMultiplier('turret', 50000, 1.28, 'portal'); },
                Adamantite(){ return costMultiplier('turret', 8000, 1.28, 'portal'); },
                Elerium(){ return costMultiplier('turret', 15, 1.28, 'portal'); },
                Nano_Tube(){ return costMultiplier('turret', 28000, 1.28, 'portal'); }
            },
            powered: 3,
            powerInc(){
                return global.tech['turret'] ? global.tech['turret'] : 0;
            },
            postPower(){
                if (vues['civ_fortress']){
                    p_on['turret'] = global.portal.turret.on;
                    vues['civ_fortress'].$forceUpdate();
                }
            },
            effect(){
                let rating = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 70 : 50) : 35;
                let power = global.tech['turret'] ? $(this)[0].powered + global.tech['turret'] : $(this)[0].powered;
                return `<div>${loc('portal_turret_effect',[rating])}</div><div>${loc('minus_power',[power])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('turret','portal');
                    let power = global.tech['turret'] ? $(this)[0].powered + global.tech['turret'] : $(this)[0].powered;
                    if (global.city.powered && global.city.power >= power){
                        global.portal.turret.on++;
                        if (vues['civ_fortress']){
                            p_on['turret']++;
                            vues['civ_fortress'].$forceUpdate();
                        }
                    }
                    return true;
                }
                return false;
            }
        },
        carport: {
            id: 'portal-carport',
            title: loc('portal_carport_title'),
            desc(){
                return loc('portal_carport_desc');
            },
            reqs: { portal: 2 },
            cost: {
                Money(){ return costMultiplier('carport', 250000, 1.3, 'portal'); },
                Cement(){ return costMultiplier('carport', 18000, 1.3, 'portal'); },
                Oil(){ return costMultiplier('carport', 6500, 1.3, 'portal'); },
                Plywood(){ return costMultiplier('carport', 8500, 1.3, 'portal'); }
            },
            effect(){
                return `${loc('portal_carport_effect')}`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('carport','portal');
                    global.civic.hell_surveyor.display = true;
                    global.resource.Infernite.display = true;
                    if (!global.tech['infernite']){
                        global.tech['infernite'] = 1;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    prtl_badlands: {
        info: {
            name: loc('portal_badlands_name'),
            desc: loc('portal_badlands_desc'),
        },
        war_drone: {
            id: 'portal-war_drone',
            title: loc('portal_war_drone_title'),
            desc(){
                return `<div>${loc('portal_war_drone_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 3 },
            powered: 5,
            cost: {
                Money(){ return costMultiplier('war_drone', 650000, 1.28, 'portal'); },
                Alloy(){ return costMultiplier('war_drone', 60000, 1.28, 'portal'); },
                Graphene(){ return costMultiplier('war_drone', 100000, 1.28, 'portal'); },
                Elerium(){ return costMultiplier('war_drone', 25, 1.28, 'portal'); },
                Soul_Gem(){ return costMultiplier('war_drone', 1, 1.28, 'portal'); }
            },
            effect(){
                return `<div>${loc('portal_war_drone_effect')}</div><div>${loc('minus_power',[$(this)[0].powered])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('war_drone','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered){
                        global.portal.war_drone.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        sensor_drone: {
            id: 'portal-sensor_drone',
            title: loc('portal_sensor_drone_title'),
            desc(){
                return `<div>${loc('portal_sensor_drone_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { infernite: 2 },
            powered: 3,
            cost: {
                Money(){ return costMultiplier('sensor_drone', 500000, 1.25, 'portal'); },
                Polymer(){ return costMultiplier('sensor_drone', 25000, 1.25, 'portal'); },
                Adamantite(){ return costMultiplier('sensor_drone', 12500, 1.25, 'portal'); },
                Infernite(){ return costMultiplier('sensor_drone', 100, 1.25, 'portal'); }
            },
            effect(){
                let bonus = 10;
                let sci = global.tech['science'] >= 14 ? `<div>${loc('city_max_knowledge',[1000])}</div><div>${loc('space_moon_observatory_effect',[2])}</div><div>${loc('portal_sensor_drone_effect2',[2])}</div>` : '';
                return `<div>${loc('portal_sensor_drone_effect',[bonus])}</div>${sci}<div>${loc('minus_power',[$(this)[0].powered])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('sensor_drone','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered){
                        global.portal.sensor_drone.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        attractor: {
            id: 'portal-attractor',
            title: loc('portal_attractor_title'),
            desc(){
                return `<div>${loc('portal_attractor_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { portal: 4 },
            powered: 3,
            cost: {
                Money(){ return costMultiplier('attractor', 350000, 1.25, 'portal'); },
                Aluminium(){ return costMultiplier('attractor', 175000, 1.25, 'portal'); },
                Stanene(){ return costMultiplier('attractor', 90000, 1.25, 'portal'); },
            },
            effect(){
                return `<div>${loc('portal_attractor_effect1')}</div><div>${loc('portal_attractor_effect2')}</div><div>${loc('minus_power',[$(this)[0].powered])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    incrementStruct('attractor','portal');
                    if (global.city.powered && global.city.power >= $(this)[0].powered){
                        global.portal.attractor.on++;
                    }
                    return true;
                }
                return false;
            }
        },
    }
};

export function fortressTech(){
    return fortressModules;
}

export function renderFortress(){
    let parent = $('#portal');
    parent.empty();
    parent.append($(`<h2 class="is-sr-only">${loc('tab_portal')}</h2>`));
    if (!global.tech['portal'] || global.tech['portal'] < 2){
        return;
    }

    Object.keys(fortressModules).forEach(function (region){
        let show = region.replace("prtl_","");
        if (global.settings.portal[`${show}`]){
            let name = typeof fortressModules[region].info.name === 'string' ? fortressModules[region].info.name : fortressModules[region].info.name();
            let desc = typeof fortressModules[region].info.desc === 'string' ? fortressModules[region].info.desc : fortressModules[region].info.desc();
            
            if (fortressModules[region].info['support']){
                let support = fortressModules[region].info['support'];
                parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3> <span v-show="s_max">{{ support }}/{{ s_max }}</span></div></div>`);
                vues[`sr${region}`] = new Vue({
                    data: global.portal[support]
                });
                vues[`sr${region}`].$mount(`#sr${region}`);
            }
            else {
                parent.append(`<div id="${region}" class="space"><div><h3 class="name has-text-warning">${name}</h3></div></div>`);
            }
            
            $(`#${region} h3.name`).on('mouseover',function(){
                var popper = $(`<div id="pop${region}" class="popper has-background-light has-text-dark"></div>`);
                $('#main').append(popper);
                
                popper.append($(`<div>${desc}</div>`));
                popper.show();
                poppers[region] = new Popper($(`#${region} h3.name`),popper);
            });
            $(`#${region} h3.name`).on('mouseout',function(){
                $(`#pop${region}`).hide();
                if (poppers[region]){
                    poppers[region].destroy();
                }
                $(`#pop${region}`).remove();
            });

            if (region === 'prtl_fortress'){
                buildFortress(parent);
            } 

            Object.keys(fortressModules[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(fortressModules,region,tech)){
                    let c_action = fortressModules[region][tech];
                    setAction(c_action,'portal',tech);
                }
            });
        }
    });
}

function buildFortress(parent){
    let fort = $(`<div id="fort" class="fort"></div>`);
    parent.append(fort);

    let status = $('<div></div>');
    fort.append(status);

    let defense = $(`<span class="defense has-text-success" :aria-label="defense()">${loc('fortress_defense')} {{ f.garrison | defensive }}</span>`);
    status.append(defense);
    let activity = $(`<b-tooltip :label="hostiles()" position="is-bottom" multilined animated><span class="has-text-danger" :aria-label="hostiles()">${loc('fortress_spotted')} {{ f.threat }}</span></b-tooltip>`);
    status.append(activity);

    let wallStatus = $('<div></div>');
    fort.append(wallStatus);

    wallStatus.append($(`<span class="has-text-warning" :aria-label="defense()">${loc('fortress_wall')} <span :class="wall()">{{ f.walls }}%</span></span>`))

    let station = $(`<div></div>`);
    fort.append(station);
    
    station.append($(`<span>${loc('fortress_army')}</span>`));
    station.append($('<span role="button" aria-label="remove soldiers from the fortress" class="sub has-text-danger" @click="aLast"><span>&laquo;</span></span>'));
    station.append($('<b-tooltip :label="armyLabel()" position="is-bottom" multilined animated><span class="current">{{ f.garrison | patrolling }}</span></b-tooltip>'));
    station.append($('<span role="button" aria-label="add soldiers to the fortress" class="add has-text-success" @click="aNext"><span>&raquo;</span></span>'));
    
    station.append($(`<span>${loc('fortress_patrol')}</span>`));
    station.append($('<span role="button" aria-label="reduce number of patrols" class="sub has-text-danger" @click="patDec"><span>&laquo;</span></span>'));
    station.append($('<b-tooltip :label="patLabel()" position="is-bottom" multilined animated><span class="current">{{ f.patrols }}</span></b-tooltip>'));
    station.append($('<span role="button" aria-label="increase number of patrols" class="add has-text-success" @click="patInc"><span>&raquo;</span></span>'));

    station.append($(`<span>${loc('fortress_patrol_size')}</span>`));
    station.append($('<span role="button" aria-label="reduce size of each patrol" class="sub has-text-danger" @click="patSizeDec"><span>&laquo;</span></span>'));
    station.append($('<b-tooltip :label="patSizeLabel()" position="is-bottom" multilined animated><span class="current">{{ f.patrol_size }}</span></b-tooltip>'));
    station.append($('<span role="button" aria-label="increase size of each patrol" class="add has-text-success" @click="patSizeInc"><span>&raquo;</span></span>'));

    let color = global.settings.theme === 'light' ? ` type="is-light"` : ` type="is-dark"`;
    station.append($(`<b-checkbox class="patrol" v-model="f.notify" true-value="Yes" false-value="No"${color}>Patrol Reports</b-checkbox>`));

    fort.append($(`<div class="training"><span>${loc('civics_garrison_training')}</span> <progress class="progress" :value="g.progress" max="100">{{ g.progress }}%</progress></div>`));

    vues['civ_fortress'] = new Vue({
        el: '#fort',
        data: {
            f: global.portal.fortress,
            g: global.civic.garrison
        },
        methods: {
            defense(){
                return loc('fortress_defense');
            },
            hostiles(){
                return loc('fortress_threat',[global.portal.fortress.threat]);
            },
            armyLabel(){
                return loc('fortress_stationed');
            },
            patLabel(){
                return loc('fortress_patrol_desc',[global.portal.fortress.patrols]);
            },
            patSizeLabel(){
                return loc('fortress_patrol_size_desc',[global.portal.fortress.patrol_size]);
            },
            aNext(){
                let inc = keyMultiplier();
                if (global.portal.fortress.garrison < global.civic.garrison.workers){
                    global.portal.fortress.garrison += inc;
                    if (global.portal.fortress.garrison > global.civic.garrison.workers){
                        global.portal.fortress.garrison = global.civic.garrison.workers;
                    }
                    if (vues['civ_garrison']){
                        vues['civ_garrison'].$forceUpdate();
                    }
                }
            },
            aLast(){
                let dec = keyMultiplier();
                if (global.portal.fortress.garrison > 0){
                    global.portal.fortress.garrison -= dec;
                    if (global.portal.fortress.garrison < 0){
                        global.portal.fortress.garrison = 0;
                    }
                    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
                        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
                    }
                    if (vues['civ_garrison']){
                        vues['civ_garrison'].$forceUpdate();
                    }
                }
            },
            patInc(){
                let inc = keyMultiplier();
                if (global.portal.fortress.patrols * global.portal.fortress.patrol_size < global.portal.fortress.garrison){
                    global.portal.fortress.patrols += inc;
                    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
                        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
                    }
                }
            },
            patDec(){
                let dec = keyMultiplier();
                if (global.portal.fortress.patrols > 0){
                    global.portal.fortress.patrols -= dec;
                    if (global.portal.fortress.patrols < 0){
                        global.portal.fortress.patrols = 0;
                    }
                }
            },
            patSizeInc(){
                let inc = keyMultiplier();
                if (global.portal.fortress.patrol_size < global.portal.fortress.garrison){
                    global.portal.fortress.patrol_size += inc;
                    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
                        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
                    }
                }
            },
            patSizeDec(){
                let dec = keyMultiplier();
                if (global.portal.fortress.patrol_size > 1){
                    global.portal.fortress.patrol_size -= dec;
                    if (global.portal.fortress.patrol_size < 1){
                        global.portal.fortress.patrol_size = 1;
                    }
                }
            },
            wall(){
                let val = global.portal.fortress.walls;
                if (val >= 75){
                    return "has-text-success";
                }
                else if (val <= 25){
                    return "has-text-danger";
                }
                else {
                    return "has-text-warning";
                }
            }
        },
        filters: {
            defensive(v){
                return fortressDefenseRating(v);
            },
            patrolling(v){
                return v - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
            }
        }
    });
}

function fortressDefenseRating(v){
    let army = v - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
    let turret = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 70 : 50) : 35;
    return Math.round(armyRating(army,'army')) + (p_on['turret'] ? p_on['turret'] * turret : 0);
}

function casualties(demons,pat_armor,ambush){
    let casualties = Math.round(Math.log2((demons / global.portal.fortress.patrol_size) / (pat_armor || 1))) - Math.rand(0,pat_armor);
    let dead = 0;
    if (casualties > 0){
        if (casualties > global.portal.fortress.patrol_size){
            casualties = global.portal.fortress.patrol_size;
        }
        casualties = Math.rand(ambush ? 1 : 0,casualties + 1);
        dead = Math.rand(0,casualties + 1);
        let wounded = casualties - dead;
        global.civic.garrison.wounded += wounded;
        global.civic.garrison.workers -= dead;
        global.stats.died += dead;
        /*if (dead === global.portal.fortress.patrol_size && global.portal.fortress.notify === 'Yes'){
            messageQueue(loc('fortress_patrol_killed',[dead]));
        }*/
    }

    if (global.civic.garrison.wounded > global.civic.garrison.workers){
        global.civic.garrison.wounded = global.civic.garrison.workers;
    }

    if (global.civic.garrison.workers < global.portal.fortress.garrison){
        global.portal.fortress.garrison = global.civic.garrison.workers;
    }

    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
    }
    return dead;
}

export function bloodwar(){
    let pat_armor = global.tech['armor'] ? global.tech['armor'] : 0;
    if (global.race['armored']){
        pat_armor += 2;
    }
    if (global.race['scales']){
        pat_armor += 1;
    }

    // Drones
    if (global.tech['portal'] >= 3 && p_on['war_drone']){
        for (let i=0; i<p_on['war_drone']; i++){
            if (Math.rand(0,global.portal.fortress.threat) >= Math.rand(0,999)){
                let demons = Math.rand(Math.floor(global.portal.fortress.threat / 50), Math.floor(global.portal.fortress.threat / 10));
                let remain = demons - Math.rand(25,75);
                if (remain > 0){
                    global.portal.fortress.threat -= demons - remain;
                }
                else {
                    global.portal.fortress.threat -= demons;
                }
            }
        }
    }

    let gem_chance = 9999;
    if (global.tech['portal'] >= 4 && p_on['attractor']){
        for (let i=0; i<p_on['attractor']; i++){
            gem_chance = Math.round(gem_chance * 0.95);
        }
    }

    // Patrols
    let dead = 0;
    let pat_rating = Math.round(armyRating(global.portal.fortress.patrol_size,'army'));
    for (let i=0; i<global.portal.fortress.patrols; i++){
        if (Math.rand(0,global.portal.fortress.threat) >= Math.rand(0,999)){
            let demons = Math.rand(Math.floor(global.portal.fortress.threat / 50), Math.floor(global.portal.fortress.threat / 10));

            if (Math.rand(0,global.race['chameleon'] ? 50 : 30) === 0){
                dead += casualties(Math.round(demons * (1 + Math.random() * 3)),0,true);
                let remain = demons - Math.round(pat_rating / 2);
                if (remain > 0){
                    global.portal.fortress.threat -= demons - remain;
                }
                else {
                    global.portal.fortress.threat -= demons;
                }
            }
            else {
                let remain = demons - pat_rating;
                if (remain > 0){
                    global.portal.fortress.threat -= demons - remain;
                    dead += casualties(remain,pat_armor,false);
                }
                else {
                    global.portal.fortress.threat -= demons;
                }
                if (Math.rand(0,gem_chance) === 0){
                    global.resource.Soul_Gem.amount++;
                    global.resource.Soul_Gem.display = true;
                }
            }
        }
    }
    if (dead > 0 && global.portal.fortress.notify === 'Yes'){
        messageQueue(loc('fortress_patrol_casualties',[dead]));
    }

    // Siege Chance
    if (global.portal.fortress.garrison > 0 && global.portal.fortress.siege > 0){
        global.portal.fortress.siege--;
    }
    if (global.portal.fortress.garrison > 0 && 1 > Math.rand(0,global.portal.fortress.siege)){
        let defense = fortressDefenseRating(global.portal.fortress.garrison);
        let siege = Math.round(global.portal.fortress.threat / 2);

        let damage = 0;
        let killed = 0;
        let destroyed = false;
        while (siege > 0 && global.portal.fortress.walls > 0){
            let terminated = Math.round(defense / 16);
            if (terminated > siege){
                terminated = siege;
            }
            siege -= terminated;
            global.portal.fortress.threat -= terminated;
            killed += terminated;
            if (siege > 0){
                damage++;
                global.portal.fortress.walls--;
                if (global.portal.fortress.walls === 0){
                    destroyed = true;
                    break;
                }
            }
        }

        if (destroyed){
            messageQueue(loc('fortress_lost'));
            global.resource[global.race.species].amount -= global.civic.hell_surveyor.workers;
            global.civic.hell_surveyor.workers = 0;

            global.portal.fortress.patrols = 0;
            global.stats.died += global.portal.fortress.garrison;
            global.civic.garrison.workers -= global.portal.fortress.garrison;
            global.portal.fortress.garrison = 0;
        }
        else {
            messageQueue(loc('fortress_sieged',[killed,damage]));
        }

        global.portal.fortress.siege = 999;
    }

    if (global.portal.fortress.threat < 10000){
        let influx = ((10000 - global.portal.fortress.threat) / 2500) + 1;
        if (global.tech['portal'] >= 4 && p_on['attractor']){
            influx *= 1 + (p_on['attractor'] * 0.22);
        }
        global.portal.fortress.threat += Math.rand(Math.round(10 * influx),Math.round(50 * influx));
    }

    // Surveyor threats
    if (global.civic.hell_surveyor.display && global.civic.hell_surveyor.workers > 0){
        let danger = global.portal.fortress.threat / 1000;
        let exposure = global.civic.hell_surveyor.workers > 10 ? 10 : global.civic.hell_surveyor.workers;
        let risk = 10 - (Math.rand(0,exposure + 1));

        if (danger > risk){
            let cap = Math.round(danger);
            let dead = Math.rand(0,cap + 1);
            if (dead > global.civic.hell_surveyor.workers){
                dead = global.civic.hell_surveyor.workers;
            }
            if (dead === 1){
                messageQueue(loc('fortress_killed'));
            }
            else if (dead > 1){
                messageQueue(loc('fortress_eviscerated',[dead]));
            }
            if (dead > 0){
                global.civic.hell_surveyor.workers -= dead;
                global.resource[global.race.species].amount -= dead;
            }
        }
    }
}
