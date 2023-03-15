import { global, p_on, breakdown } from './vars.js';
import { vBind, popover, tagEvent, calcQueueMax, calcRQueueMax, clearElement, adjustCosts, decodeStructId, timeCheck, arpaTimeCheck } from './functions.js';
import { races } from './races.js';
import { actions, checkCityRequirements, housingLabel, wardenLabel, updateQueueNames, checkAffordable } from './actions.js';
import { govCivics, govTitle } from './civics.js';
import { crateGovHook, atomic_mass } from './resources.js';
import { checkHellRequirements, mechSize, mechCost } from './portal.js';
import { loc } from './locale.js';

export const gmen = {
    soldier: {
        name: loc('governor_soldier'),
        desc: loc('governor_soldier_desc'),
        title: [loc('governor_soldier_t1'),loc('governor_soldier_t2'),loc('governor_soldier_t3')],
        traits: {
            tactician: 1,
            militant: 1
        }
    },
    criminal: {
        name: loc('governor_criminal'),
        desc: loc('governor_criminal_desc'),
        title: [loc('governor_criminal_t1'),loc('governor_criminal_t2'),{ m: loc('governor_criminal_t3m'), f: loc('governor_criminal_t3f') }],
        traits: {
            noquestions: 1,
            racketeer: 1
        }
    },
    entrepreneur: {
        name: loc('governor_entrepreneur'),
        desc: loc('governor_entrepreneur_desc'),
        title: [loc('governor_entrepreneur_t1'),loc('governor_entrepreneur_t2'),{ m: loc('governor_entrepreneur_t3m'), f: loc('governor_entrepreneur_t3f') }],
        traits: {
            dealmaker: 1,
            risktaker: 1
        }
    },
    educator: {
        name: loc('governor_educator'),
        desc: loc('governor_educator_desc'),
        title: [loc('governor_educator_t1'),loc('governor_educator_t2'),loc('governor_educator_t3')],
        traits: {
            teacher: 1,
            theorist: 1
        }
    },
    spiritual: {
        name: loc('governor_spiritual'),
        desc: loc('governor_spiritual_desc'),
        title: [loc('governor_spiritual_t1'),loc('governor_spiritual_t2'),loc('governor_spiritual_t3')],
        traits: {
            inspirational: 1,
            pious: 1
        }
    },
    bluecollar: {
        name: loc('governor_bluecollar'),
        desc: loc('governor_bluecollar_desc'),
        title: [{ m: loc('governor_bluecollar_t1m'), f: loc('governor_bluecollar_t1f') },loc('governor_bluecollar_t2'),{ m: loc('governor_bluecollar_t3m'), f: loc('governor_bluecollar_t3f') }],
        traits: {
            pragmatist: 1,
            dirty_jobs: 1
        }
    },
    noble: {
        name: loc('governor_noble'),
        desc: loc('governor_noble_desc'),
        title: [{ m: loc('governor_noble_t1m'), f: loc('governor_noble_t1f') },{ m: loc('governor_noble_t2m'), f: loc('governor_noble_t2f') },{ m: loc('governor_noble_t3m'), f: loc('governor_noble_t3f') },{ m: loc('governor_noble_t4m'), f: loc('governor_noble_t4f') }],
        traits: {
            extravagant: 1,
            aristocrat: 1
        }
    },
    media: {
        name: loc('governor_media'),
        desc: loc('governor_media_desc'),
        title: [loc('governor_media_t1'),{ m: loc('governor_media_t2m'), f: loc('governor_media_t2f') },loc('governor_media_t3')],
        traits: {
            gaslighter: 1,
            muckraker: 1
        }
    },
    sports: {
        name: loc('governor_sports'),
        desc: loc('governor_sports_desc'),
        title: [loc('governor_sports_t1'),loc('governor_sports_t2'),loc('governor_sports_t3')],
        traits: {
            athleticism: 1,
            nopain: 1
        }
    },
    bureaucrat: {
        name: loc('governor_bureaucrat'),
        desc: loc('governor_bureaucrat_desc'),
        title: [loc('governor_bureaucrat_t1'),{ m: loc('governor_bureaucrat_t2m'), f: loc('governor_bureaucrat_t2f') },loc('governor_bureaucrat_t3')],
        traits: {
            organizer: 1
        }
    }
};

export const gov_traits = {
    tactician: {
        name: loc(`gov_trait_tactician`),
        effect(){ return loc(`gov_trait_tactician_effect`,[$(this)[0].vars()[0]]); },
        vars(){ return [25]; },
    },
    militant: {
        name: loc(`gov_trait_militant`),
        effect(){ return loc(`gov_trait_militant_effect`,[$(this)[0].vars()[0],$(this)[0].vars()[1]]); },
        vars(){ return [25,10]; },
    },
    noquestions: {
        name: loc(`gov_trait_noquestions`),
        effect(){ return loc(`gov_trait_noquestions_effect`,[$(this)[0].vars()[0]]); },
        vars(){ return [0.005]; },
    },
    racketeer: {
        name: loc(`gov_trait_racketeer`),
        effect(){ return loc(`gov_trait_racketeer_effect`,[$(this)[0].vars()[0],$(this)[0].vars()[1]]); },
        vars(){ return [20,35]; },
    },
    dealmaker: {
        name: loc(`gov_trait_dealmaker`),
        effect(){ return loc(`gov_trait_dealmaker_effect`,[$(this)[0].vars()[0]]); },
        vars(){ return [125]; },
    },
    risktaker: {
        name: loc(`gov_trait_risktaker`),
        effect(){ return loc(`gov_trait_risktaker_effect`,[$(this)[0].vars()[0]]); },
        vars(){ return [12]; },
    },
    teacher: {
        name: loc(`gov_trait_teacher`),
        effect(){ return loc(`gov_trait_teacher_effect`,[$(this)[0].vars()[0]]); },
        vars(){ return [6]; },
    },
    theorist: {
        name: loc(`gov_trait_theorist`),
        effect(){ return loc(`gov_trait_theorist_effect`,[$(this)[0].vars()[0],$(this)[0].vars()[1]]); },
        vars(){ return [50,4]; },
    },
    inspirational: {
        name: loc(`gov_trait_inspirational`),
        effect(){ return loc(`gov_trait_inspirational_effect`,[$(this)[0].vars()[0]]); },
        vars(){ return [20]; },
    },
    pious: {
        name: loc(`gov_trait_pious`),
        effect(){
            let val = $(this)[0].vars()[1];
            let xeno = global.tech['monument'] && global.tech.monument >= 3 && p_on['s_gate'] ? 3 : 1;
            val = (global.civic.govern.type === 'corpocracy' ? (val * 2) : val) * xeno;
            return loc(`gov_trait_pious_effect`,[$(this)[0].vars()[0],val]);
        },
        vars(){ return [10,5]; },
    },
    pragmatist: {
        name: loc(`gov_trait_pragmatist`),
        effect(){ return loc(`gov_trait_pragmatist_effect`,[$(this)[0].vars()[0],$(this)[0].vars()[1]]); },
        vars(){ return [50,2]; },
    },
    dirty_jobs: {
        name: loc(`gov_trait_dirty_jobs`),
        effect(){ return loc(`gov_trait_dirty_jobs_effect`,[$(this)[0].vars()[0],$(this)[0].vars()[1],$(this)[0].vars()[2]]); },
        vars(){ return [0.015,1,10]; },
    },
    extravagant: {
        name: loc(`gov_trait_extravagant`),
        effect(){ return loc(`gov_trait_extravagant_effect`,[$(this)[0].vars()[0],housingLabel('large',true),$(this)[0].vars()[1],$(this)[0].vars()[2]+5]); },
        vars(){ return [10,1.25,1]; },
    },
    aristocrat: {
        name: loc(`gov_trait_aristocrat`),
        effect(){ return loc(`gov_trait_aristocrat_effect`,[$(this)[0].vars()[0],$(this)[0].vars()[1],$(this)[0].vars()[2]]); },
        vars(){ return [50,20,10]; },
    },
    gaslighter: {
        name: loc(`gov_trait_gaslighter`),
        effect(){
            return loc(`gov_trait_gaslighter_effect`,[$(this)[0].vars()[0],wardenLabel(),$(this)[0].vars()[1],$(this)[0].vars()[2]]);
        },
        vars(){ return [1,1,0.5]; },
    },
    muckraker: {
        name: loc(`gov_trait_muckraker`),
        effect(){
            return loc(`gov_trait_muckraker_effect`,[$(this)[0].vars()[1],$(this)[0].vars()[2]]);
        },
        vars(){ return [8,12,3]; },
    },
    athleticism: {
        name: loc(`gov_trait_athleticism`),
        effect(){ return loc(`gov_trait_athleticism_effect`,[$(this)[0].vars()[0],$(this)[0].vars()[1],$(this)[0].vars()[2],wardenLabel()]); },
        vars(){ return [1.5,2,4]; },
    },
    nopain: {
        name: loc(`gov_trait_nopain`),
        effect(){ return loc(`gov_trait_nopain_effect`,[$(this)[0].vars()[0],$(this)[0].vars()[1]]); },
        vars(){ return [50,10]; },
    },
    organizer: {
        name: loc(`gov_trait_organizer`),
        effect(){ return loc(`gov_trait_organizer_effect`,[$(this)[0].vars()[0]]); },
        vars(){ return [global.genes['governor'] && global.genes.governor >= 2 ? 2 : 1]; },
    }
};

const names = {
    humanoid: ['Sanders','Smith','Geddon','Burgundy','Cristo','Crunch','Berg','Morros','Bower','Maximus'],
    carnivore: ['Instinct','Prowl','Paws','Fluffy','Snarl','Claws','Fang','Stalker','Pounce','Sniff'],
    herbivore: ['Sense','Grazer','Paws','Fluffy','Fern','Claws','Fang','Grass','Stampy','Sniff'],
    omnivore: ['Pelt','Munchy','Paws','Fluffy','Snarl','Claws','Fang','Skavers','Pounce','Sniff'],
    small: ['Bahgins','Banks','Shorty','Parte','Underfoot','Shrimp','Finkle','Littlefoot','Cub','Runt'],
    giant: ['Slender','Titan','Colossus','Bean','Tower','Cloud','Bigfoot','Mountain','Crusher','Megaton'],
    reptilian: ['Scale','Chimera','Ecto','Bask','Forks','Croc','Slither','Sunny','Coldfoot','Webtoe'],
    avian: ['Sparrow','Soar','Shiney','Raven','Squaks','Eddy','Breeze','Flap','Kettle','Flock'],
    insectoid: ['Compound','Centi','Hiver','Buzz','Carpace','Swarm','Devour','Carpi','Chitter','Burrow'],
    plant: ['Grover','Blossom','Leaf','Sapper','Stem','Seed','Sprout','Greensly','Root','Fruit'],
    fungi: ['Detritus','Psychedelic','Cap','Rotface','Patch','Spore','Infecto','Filament','Symbiote','Shade'],
    aquatic: ['Seawolf','Finsley','Inko','Sucker','McBoatFace','Wave','Riptide','Shell','Coral','Pearl'],
    fey: ['Whisper','Prank','Mischief','Flutter','Nature','Dirt','Story','Booker','Tales','Spirit'],
    heat: ['Ash','Magnus','Pumice','Vulcano','Sweat','Flame','Lava','Ember','Smoke','Tinder','Spark'],
    polar: ['Frosty','Snowball','Flake','Chiller','Frost','Cooler','Icecube','Arctic','Tundra','Avalanche'],
    sand: ['Dune','Oasis','Sarlac','Spice','Quick','Grain','Spike','Storm','Glass','Castle'],
    demonic: ['Yekun','Kesabel','Gadreel','Penemue','Abaddon','Azazyel','Leviathan','Samyaza','Kasyade','Typhon'],
    angelic: ['Lightbringer','Illuminous','Sparks','Chrub','Halo','Star','Pompous','Radiant','Fluffy','Fabio'],
    synthetic: ['HK47','D2R2','Bishop','Wally','Number5','Sunny','Data','Beta','Dot','Motoko'],
};

function genGovernor(setSize){
    let governors = [];
    let genus = races[global.race.species].type;
    let backgrounds = Object.keys(gmen);
    let nameList = JSON.parse(JSON.stringify(names[genus]));

    setSize = setSize || backgrounds.length;
    for (let i=0; i<setSize; i++){
        if (nameList.length === 0){
            nameList = JSON.parse(JSON.stringify(names[genus]));
        }
        if (backgrounds.length === 0){
            backgrounds = Object.keys(gmen);
        }

        let bgIdx = Math.floor(Math.seededRandom(0,backgrounds.length));
        let nameIdx = Math.floor(Math.seededRandom(0,nameList.length));

        let bg = backgrounds.splice(bgIdx,1)[0];
        let name = loc("gov_name_" + nameList.splice(nameIdx,1)[0]);

        let title = gmen[bg].title[Math.floor(Math.seededRandom(0,gmen[bg].title.length))];
        if (typeof title === 'object'){
            title = Math.floor(Math.seededRandom(0,2)) === 0 ? title.m : title.f;
        }
        governors.push({ bg: bg, t: title, n: name });
    }
    
    return governors;
}

export function govern(){
    if (global.genes['governor'] && global.tech['governor'] && global.race['governor'] && global.race.governor['g'] && global.race.governor['tasks']){
        let cnt = [0,1,2];
        if (global.genes.governor >= 2){
            cnt.push(cnt.length);
            if (govActive('organizer',0)){ cnt.push(cnt.length); }
        }
        if (govActive('organizer',0)){ cnt.push(cnt.length); }
        cnt.forEach(function(n){
            if (gov_tasks[global.race.governor.tasks[`t${n}`]] && gov_tasks[global.race.governor.tasks[`t${n}`]].req()){
                gov_tasks[global.race.governor.tasks[`t${n}`]].task();
            }
        });
    }
}

export function defineGovernor(){
    if (global.genes['governor'] && global.tech['governor']){
        clearElement($('#r_govern1'));
        if (global.race.hasOwnProperty('governor') && !global.race.governor.hasOwnProperty('candidates')){
            drawnGovernOffice();
        }
        else {
            appointGovernor();
        }
    }
}

export function clearSpyopDrag(){
    Object.keys(global.civic.foreign).forEach(function (gov){
        let el = $(`#spyopConfig${gov}`)[0];
        if (el){
            let sort = Sortable.get(el);
            if (sort){
                sort.destroy();
            }
        }
    });
}

function dragSpyopList(gov){
    let el = $(`#spyopConfig${gov}`)[0];
    if (el){
        Sortable.create(el,{
            onEnd(e){
                let order = global.race.governor.config.spyop[gov];
                order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
                global.race.governor.config.spyop[gov] = order;
                defineGovernor();
            }
        });
    }
}

export function drawnGovernOffice(){
    clearSpyopDrag();
    let govern = $(`<div id="govOffice" class="govOffice"></div>`);
    $('#r_govern1').append(govern);

    let govHeader = $(`<div class="head"></div>`);
    govern.append(govHeader);

    let governorTitle = $(`<div></div>`);
    governorTitle.append($(`<div class="has-text-caution">${loc(`governor_office`,[global.race.governor.g.n])}</div>`));
    governorTitle.append($(`<div><span class="has-text-warning">${loc(`governor_background`)}:</span> <span class="bg">${gmen[global.race.governor.g.bg].name}</span></div>`));

    govHeader.append(governorTitle);
    govHeader.append($(`<div class="fire"><b-button v-on:click="fire" v-html="fireText()">${loc(`governor_fire`)}</b-button></div>`));

    let cnt = [0,1,2];
    if (global.genes['governor'] && global.genes.governor >= 2){
        cnt.push(cnt.length);
        if (govActive('organizer',0)){ cnt.push(cnt.length); }
    }
    if (govActive('organizer',0)){ cnt.push(cnt.length); }
    cnt.forEach(function(num){
        let options = `<b-dropdown-item v-on:click="setTask('none',${num})">{{ 'none' | label }}</b-dropdown-item>`;
        Object.keys(gov_tasks).forEach(function(task){
            if (gov_tasks[task].req()){
                options += `<b-dropdown-item v-show="activeTask('${task}')" v-on:click="setTask('${task}',${num})">{{ '${task}' | label }}</b-dropdown-item>`;
            }
        });

        govern.append(`<div class="govTask"><span>${loc(`gov_task`,[num+1])}</span><b-dropdown hoverable>
            <button class="button is-primary" slot="trigger">
                <span>{{ t.t${num} | label }}</span>
                <i class="fas fa-sort-down"></i>
            </button>
            ${options}
        </b-dropdown></div>`);
    });

    if (!global.race.governor.hasOwnProperty('config')){
        global.race.governor['config'] = {};
    }

    let options = $(`<div class="options"><div>`);
    govern.append(options);

    //Configs
    { // Crate/Container Construction
        if (!global.race.governor.config.hasOwnProperty('storage')){
            global.race.governor.config['storage'] = {
                crt: 1000,
                cnt: 1000
            };
        }

        let storeContain = $(`<div class="tConfig" v-show="showTask('storage')"><div class="has-text-warning">${loc(`gov_task_storage`)}</div></div>`);
        options.append(storeContain);
        let storage = $(`<div class="storage"></div>`);
        storeContain.append(storage);

        let crt_mat = global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? 'Chrysotile' : 'Stone') : 'Plywood';
        let cnt_mat = 'Steel';

        storage.append($(`<b-field>${loc(`gov_task_storage_reserve`,[global.resource[crt_mat].name])}<b-numberinput min="0" :max="Number.MAX_SAFE_INTEGER" v-model="c.storage.crt" :controls="false"></b-numberinput></b-field>`));
        storage.append($(`<b-field>${loc(`gov_task_storage_reserve`,[global.resource[cnt_mat].name])}<b-numberinput min="0" :max="Number.MAX_SAFE_INTEGER" v-model="c.storage.cnt" :controls="false"></b-numberinput></b-field>`));
    }

    { // Crate/Container Management
        if (!global.race.governor.config.hasOwnProperty('bal_storage')){
            global.race.governor.config['bal_storage'] = {};
        }
        if (!global.race.governor.config.bal_storage.hasOwnProperty('adv')){
            global.race.governor.config.bal_storage['adv'] = false;
        }

        let storeContain = $(`<div class="tConfig" v-show="showTask('bal_storage')"><div class="hRow"><div class="has-text-warning">${loc(`gov_task_bal_storage`)}</div><div class="chk"><b-checkbox v-model="c.bal_storage.adv">${loc(`advanced`)}</b-checkbox></div></div></div>`);
        options.append(storeContain);
        let storage = $(`<div class="bal_storage"></div>`);
        storeContain.append(storage);

        Object.keys(global.resource).forEach(function(res){
            if (global.resource[res].stackable){
                if (!global.race.governor.config.bal_storage.hasOwnProperty(res)){
                    global.race.governor.config.bal_storage[res] = "2";
                }

                storage.append($(`<div class="ccmOption" :class="bStrEx()" v-show="showStrRes('${res}')"><span>${global.resource[res].name}</span>
                <b-field>
                    <b-radio-button class="b1" v-show="c.bal_storage.adv" v-model="c.bal_storage.${res}" native-value="0" type="is-danger is-light">0x</b-radio-button>
                    <b-radio-button class="b2" v-show="c.bal_storage.adv" v-model="c.bal_storage.${res}" native-value="1" type="is-danger is-light">1/2</b-radio-button>
                    <b-radio-button class="b3" v-model="c.bal_storage.${res}" native-value="2" type="is-danger is-light">1x</b-radio-button>
                    <b-radio-button class="b4" v-model="c.bal_storage.${res}" native-value="4" type="is-danger is-light">2x</b-radio-button>
                    <b-radio-button class="b5" v-model="c.bal_storage.${res}" native-value="6" type="is-danger is-light">3x</b-radio-button>
                    <b-radio-button class="b6" v-show="c.bal_storage.adv" v-model="c.bal_storage.${res}" native-value="8" type="is-danger is-light">4x</b-radio-button>
                </b-field>
                </div>`));
            }
            else if (global.race.governor.config.bal_storage.hasOwnProperty(res)){
                delete global.race.governor.config.bal_storage[res];
            }
        });
    }

    { // Mercenary Recruitment
        if (!global.race.governor.config.hasOwnProperty('merc')){
            global.race.governor.config['merc'] = {
                buffer: 1,
                reserve: 100
            };
        }

        let contain = $(`<div class="tConfig" v-show="showTask('merc')"><div class="has-text-warning">${loc(`gov_task_merc`)}</div></div>`);
        options.append(contain);
        let merc = $(`<div class="storage"></div>`);
        contain.append(merc);

        merc.append($(`<b-field>${loc(`gov_task_merc_buffer`)}<b-numberinput min="0" :max="Number.MAX_SAFE_INTEGER" v-model="c.merc.buffer" :controls="false"></b-numberinput></b-field>`));
        merc.append($(`<b-field>${loc(`gov_task_merc_reserve`)}<b-numberinput min="0" :max="100" v-model="c.merc.reserve" :controls="false"></b-numberinput></b-field>`));
    }

    { // Spy Recruitment
        if (!global.race.governor.config.hasOwnProperty('spy')){
            global.race.governor.config['spy'] = {
                reserve: 100
            };
        }

        let contain = $(`<div class="tConfig" v-show="showTask('spy')"><div class="has-text-warning">${loc(`gov_task_spy`)}</div></div>`);
        options.append(contain);
        let spy = $(`<div class="storage"></div>`);
        contain.append(spy);

        spy.append($(`<b-field>${loc(`gov_task_merc_reserve`)}<b-numberinput min="0" :max="100" v-model="c.spy.reserve" :controls="false"></b-numberinput></b-field>`));
    }

    { // Spy Operator
        if (!global.race.governor.config.hasOwnProperty('spyop')){
            global.race.governor.config['spyop'] = {};
            Object.keys(global.civic.foreign).forEach(function (gov){
                global.race.governor.config.spyop[gov] = gov === 'gov3' ? ['influence','sabotage'] : ['sabotage','incite','influence'];
            });
        }
        
        let contain = $(`<div class="tConfig" v-show="showTask('spyop')"><div class="has-text-warning">${loc(`gov_task_spyop`)}</div></div>`);
        options.append(contain);
        Object.keys(global.civic.foreign).forEach(function (gov){
            if ((gov.substr(3,1) < 3 && !global.tech['world_control']) || (gov === 'gov3' && global.tech['rival'])){
                let spyop = $(`<div></div>`);
                contain.append(spyop);
                spyop.append(`
                    <h2 class="has-text-caution">${loc('gov_task_spyop_priority',[govTitle(gov.substring(3))])}</h2>
                    <ul id="spyopConfig${gov}" class="spyopConfig"></ul>
                `);
                let missions = $(`#spyopConfig${gov}`);
                global.race.governor.config.spyop[gov].forEach(function (mission){
                    missions.append(`
                        <li>${loc('civics_spy_' + mission)}</li>
                    `);
                });
            }
        });
    }

    { // Tax-Morale Balance
        if (!global.race.governor.config.hasOwnProperty('tax')){
            global.race.governor.config['tax'] = {
                min: 20
            };
        }

        let contain = $(`<div class="tConfig" v-show="showTask('tax')"><div class="has-text-warning">${loc(`gov_task_tax`)}</div></div>`);
        options.append(contain);
        let tax = $(`<div class="storage"></div>`);
        contain.append(tax);

        tax.append($(`<b-field>${loc(`gov_task_tax_min`)}<b-numberinput min="0" :max="20" v-model="c.tax.min" :controls="false"></b-numberinput></b-field>`));
    }

    { // Slave Replenishment
        if (!global.race.governor.config.hasOwnProperty('slave')){
            global.race.governor.config['slave'] = {
                reserve: 100
            };
        }

        let contain = $(`<div class="tConfig" v-show="showTask('slave')"><div class="has-text-warning">${loc(`gov_task_slave`)}</div></div>`);
        options.append(contain);
        let slave = $(`<div class="storage"></div>`);
        contain.append(slave);

        slave.append($(`<b-field>${loc(`gov_task_merc_reserve`)}<b-numberinput min="0" :max="100" v-model="c.slave.reserve" :controls="false"></b-numberinput></b-field>`));
    }

    { // Mass Ejector Optimizer
        if (!global.race.governor.config.hasOwnProperty('trash')){
            global.race.governor.config['trash'] = {};
        }
        ['Infernite','Elerium','Copper','Iron'].forEach(function(res){
            if (!global.race.governor.config.trash.hasOwnProperty(res) || typeof global.race.governor.config.trash[res] !== 'object' || global.race.governor.config.trash[res] === null){
                global.race.governor.config.trash[res] = { v: 0, s: true };
            }
        });

        let contain = $(`<div class="tConfig" v-show="showTask('trash')"><div class="has-text-warning">${loc(`gov_task_trash`)}</div></div>`);
        options.append(contain);
        let trash = $(`<div class="storage"></div>`);
        contain.append(trash);

        Object.keys(global.race.governor.config.trash).forEach(function(res){
            trash.append($(`<b-field class="trash"><div class="trashButton" role="button" @click="trashStrat('${res}')" v-html="$options.methods.trashLabel('${res}')"></div><b-numberinput min="0" :max="1000000" v-model="c.trash.${res}.v" :controls="false"></b-numberinput></b-field>`));
        });
    }

    { // Replicator
        if (!global.race.governor.config.hasOwnProperty('replicate')){
            global.race.governor.config['replicate'] = {};
        }
        if (!global.race.governor.config.replicate.hasOwnProperty('pow')){
            global.race.governor.config.replicate['pow'] = { on: false, cap: 10000, buffer: 0 };
        }
        if (!global.race.governor.config.replicate.hasOwnProperty('res')){
            global.race.governor.config.replicate['res'] = { que: true, neg: true, cap: true };
        }

        let contain = $(`<div class="tConfig" v-show="showTask('replicate')"><div class="has-text-warning">${loc(`gov_task_replicate`)}</div></div>`);
        options.append(contain);
        let replicate = $(`<div class="storage"></div>`);
        contain.append(replicate);

        replicate.append($(`<div class="chk"><b-checkbox v-model="c.replicate.pow.on">${loc(`gov_task_replicate_auto`)}</b-checkbox></div>`));
        replicate.append($(`<b-field>${loc(`gov_task_replicate_pmax`)}<b-numberinput min="0" v-model="c.replicate.pow.cap" :controls="false"></b-numberinput></b-field>`));
        replicate.append($(`<b-field>${loc(`gov_task_replicate_buff`)}<b-numberinput min="0" v-model="c.replicate.pow.buffer" :controls="false"></b-numberinput></b-field>`));

        let res_bal = $(`<div class="storage"></div>`);
        contain.append(res_bal);

        res_bal.append($(`<div class="chk"><b-checkbox v-model="c.replicate.res.que">${loc(`gov_task_replicate_que`)}</b-checkbox></div>`));
        res_bal.append($(`<div class="chk"><b-checkbox v-model="c.replicate.res.neg">${loc(`gov_task_replicate_neg`)}</b-checkbox></div>`));
        res_bal.append($(`<div class="chk"><b-checkbox v-model="c.replicate.res.cap">${loc(`gov_task_replicate_cap`)}</b-checkbox></div>`));
    }

    vBind({
        el: '#govOffice',
        data: { 
            t: global.race.governor.tasks,
            c: global.race.governor.config,
            r: global.resource
        },
        methods: {
            setTask(t,n){
                global.race.governor.tasks[`t${n}`] = t;
                tagEvent('govtask',{
                    'task': t
                });
                vBind({el: `#race`},'update');
            },
            showTask(t){
                return Object.values(global.race.governor.tasks).includes(t);
            },
            activeTask(t){
                let activeTasks = [];
                if (global.race.hasOwnProperty('governor')){
                    Object.keys(global.race.governor.tasks).forEach(function(ts){
                        if (global.race.governor.tasks[ts] !== 'none'){
                            activeTasks.push(global.race.governor.tasks[ts]);
                        }
                    });
                }
                return !activeTasks.includes(t);
            },
            showStrRes(r){
                return global.resource[r].display;
            },
            bStrEx(){
                return global.race.governor.config.bal_storage.adv ? 'm' : '';
            },
            fire(){
                let inc = global.race.governor.hasOwnProperty('f') ? global.race.governor.f : 0;
                let cost = ((10 + inc) ** 2) - 50;
                let res = global.race.universe === 'antimatter' ? 'AntiPlasmid' : 'Plasmid';
                if (global.prestige[res].count >= cost){
                    global.prestige[res].count -= cost;
                    global.race.governor['candidates'] = genGovernor(10);
                    if (global.race.governor.hasOwnProperty('f')){
                        global.race.governor.f++;
                    }
                    else {
                        global.race.governor['f'] = 1;
                    }
                    delete global.race.governor.g;
                    delete global.race.governor.tasks;
                    updateQueueNames(false, ['city-amphitheatre', 'city-apartment']);
                    calcQueueMax();
                    calcRQueueMax();
                    defineGovernor();
                }
            },
            fireText(){
                let inc = global.race.governor.hasOwnProperty('f') ? global.race.governor.f : 0;
                let cost = ((10 + inc) ** 2) - 50;
                return `<div>${loc(`governor_fire`)}</div><div>${cost} ${loc(global.race.universe === 'antimatter' ? `resource_AntiPlasmid_plural_name` : `resource_Plasmid_plural_name`)}</div>`
            },
            trashStrat(r){
                global.race.governor.config.trash[r].s = global.race.governor.config.trash[r].s ? false : true;
            },
            trashLabel(r){
                return loc(global.race.governor.config.trash[r].s ? `gov_task_trash_max` : `gov_task_trash_min`,[global.resource[r].name]);
            }
        },
        filters: {
            label(t){
                return gov_tasks[t] ? gov_tasks[t].name : loc(`gov_task_${t}`);
            }
        }
    });

    popover(`govOffice`, function(){
        let desc = '';
        Object.keys(gmen[global.race.governor.g.bg].traits).forEach(function (t){
            desc += (gov_traits[t].hasOwnProperty('effect') ? gov_traits[t].effect() : '') + ' ';
        });
        return desc;
    },
    {
        elm: `#govOffice .bg`,
    });
    
    Object.keys(global.civic.foreign).forEach(function (gov){
        dragSpyopList(gov);
    });
}

function appointGovernor(){
    let govern = $(`<div id="candidates" class="governor candidates"></div>`);
    $('#r_govern1').append(govern);

    if (!global.race.hasOwnProperty('governor') || !global.race.governor.hasOwnProperty('candidates')){
        global.race['governor'] = {
            candidates: genGovernor(10)
        };
    }

    govern.append($(`<div class="appoint header"><span class="has-text-caution">${loc(`governor_candidate`)}</span><span class="has-text-caution">${loc(`governor_background`)}</span><span></span><div>`));
    for (let i=0; i<global.race.governor.candidates.length; i++){
        let gov = global.race.governor.candidates[i];
        govern.append($(`<div class="appoint ${gov.bg}"><span class="has-text-warning">${gov.t} ${gov.n}</span><span class="bg">${gmen[gov.bg].name}</span><span><button class="button" v-on:click="appoint(${i})">${loc(`governor_appoint`)}</button></span><div>`));
    }

    vBind({
        el: '#candidates',
        data: global.race.governor,
        methods: {
            appoint(gi){
                if (global.genes['governor'] && global.tech['governor']){
                    let gov = global.race.governor.candidates[gi];
                    global.race.governor['g'] = gov;
                    delete global.race.governor.candidates;
                    global.race.governor['tasks'] = {
                        t0: 'none', t1: 'none', t2: 'none', t3: 'none', t4: 'none', t5: 'none'
                    };
                    updateQueueNames(false, ['city-amphitheatre', 'city-apartment']);
                    calcQueueMax();
                    calcRQueueMax();
                    defineGovernor();
                    tagEvent('governor',{
                        'appoint': global.race.governor.g.bg
                    });
                }
            }
        }
    });

    global.race.governor.candidates.forEach(function(gov){
        popover(`candidates-${gov.bg}`, function(){
            let desc = '';
            Object.keys(gmen[gov.bg].traits).forEach(function (t){
                desc += (gov_traits[t].hasOwnProperty('effect') ? gov_traits[t].effect() : '') + ' ';
            });
            return desc;
        },
        {
            elm: `#candidates .${gov.bg} .bg`,
        });
    });
}

export function govActive(trait,val){
    if (global.race.hasOwnProperty('governor') && global.race.governor.hasOwnProperty('g')){
        return gmen[global.race.governor.g.bg].traits[trait] ? gov_traits[trait].vars()[val] : false;
    }
    return false;
}

export function removeTask(task){
    if (global.genes['governor'] && global.tech['governor'] && global.race['governor'] && global.race.governor['g'] && global.race.governor['tasks']){
        for (let i=0; i<global.race.governor.tasks.length; i++){
            if (global.race.governor.tasks[`t${i}`] === task){
                global.race.governor.tasks[`t${i}`] = 'none';
            }
        }
    }
}

export const gov_tasks = {
    tax: { // Dynamic Taxes
        name: loc(`gov_task_tax`),
        req(){
            return global.civic.taxes.display;
        },
        task(){
            if ( $(this)[0].req() ){
                let add_morale = 1;
                if (global.civic.taxes.tax_rate >= 40){
                    add_morale += 0.5;
                }
                if (global.civic.govern.type === 'oligarchy'){
                    if (global.civic.taxes.tax_rate >= 20){
                        add_morale -= 0.5;
                    }
                }
                let max = govCivics('tax_cap',false);
                if (global.city.morale.current < 100 && global.civic.taxes.tax_rate > (global.civic.govern.type === 'oligarchy' ? 45 : 25)){
                    while (global.city.morale.current < 100 && global.civic.taxes.tax_rate > (global.civic.govern.type === 'oligarchy' ? 45 : 25)){
                        govCivics('adj_tax','sub');
                    }
                }
                else if (global.city.morale.potential >= global.city.morale.cap + add_morale && global.civic.taxes.tax_rate < max){
                    govCivics('adj_tax','add');
                }
                else if (global.city.morale.current < global.city.morale.cap && global.civic.taxes.tax_rate > global.race.governor.config.tax.min){
                    govCivics('adj_tax','sub');
                }
            }
        }
    },
    storage: { // Crate/Container Construction
        name: loc(`gov_task_storage`),
        req(){
            return checkCityRequirements('storage_yard') && global.tech['container'] && global.resource.Crates.display ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                if (global.resource.Crates.amount < global.resource.Crates.max){
                    let mat = global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? 'Chrysotile' : 'Stone') : 'Plywood';
                    let cost = global.race['kindling_kindred'] || global.race['smoldering'] ? 200 : 10;
                    let reserve = global.race.governor.config.storage.crt;
                    if (global.resource[mat].amount + cost > reserve){
                        let build = Math.floor((global.resource[mat].amount - reserve) / cost);
                        crateGovHook('crate',build);
                    }
                }
                if (checkCityRequirements('warehouse') && global.resource.Containers.display && global.resource.Containers.amount < global.resource.Containers.max){
                    let cost = 125;
                    let reserve = global.race.governor.config.storage.cnt;
                    if (global.resource.Steel.amount + cost > reserve){
                        let build = Math.floor((global.resource.Steel.amount - reserve) / cost);
                        crateGovHook('container',build);
                    }
                }
            }
        }
    },
    bal_storage: { // Balanced Storage
        name: loc(`gov_task_bal_storage`),
        req(){
            return checkCityRequirements('storage_yard') && global.tech['container'] && global.resource.Crates.display ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                let crates = global.resource.Crates.amount;
                let sCrate = crates;
                let containers = global.resource.Containers.amount;
                let sCon = containers;
                let active = 0;

                let res_list = Object.keys(global.resource).slice().reverse();

                res_list.forEach(function(res){
                    if (global.resource[res].display && global.resource[res].stackable){
                        crates += global.resource[res].crates;
                        containers += global.resource[res].containers;
                        active++;
                    }
                    else {
                        global.resource[res].crates = 0;
                        global.resource[res].containers = 0;
                    }
                });

                let crateSet = Math.floor(crates / active);
                let containerSet = Math.floor(containers / active);

                let dist = {
                    Food: { m: 0.1, cap: 100 },
                    Coal: { m: 0.25 },
                };

                if (global.race['artifical']){
                    delete dist.Food;
                }

                Object.keys(global.race.governor.config.bal_storage).forEach(function(res){
                    let val = Number(global.race.governor.config.bal_storage[res]);
                    if (res === 'Coal'){
                        dist[res] = { m: 0.125 * val };
                    }
                    else if (res === 'Food'){
                        dist[res] = { m: 0.05 * val, cap: 50 * val };
                    }
                    else if (global.resource[res]){
                        dist[res] = { m: val };
                    }
                });

                Object.keys(dist).forEach(function(r){
                    if (global.resource[r].display){
                        if (dist[r].hasOwnProperty('cap')){
                            active--;
                            {
                                let set = Math.floor(crateSet * dist[r].m);
                                if (dist[r].hasOwnProperty('cap') && set > dist[r].cap){ set = dist[r].cap; }
                                global.resource[r].crates = set;
                                crates -= set;
                            }
                            if (global.resource.Containers.display){
                                let set = Math.floor(containerSet * dist[r].m);
                                if (dist[r].hasOwnProperty('cap') && set > dist[r].cap){ set = dist[r].cap; }
                                global.resource[r].containers = set;
                                containers -= set;
                            }
                        }
                        else {
                            active += dist[r].m - 1;
                        }
                    }
                });
                
                crateSet = active !== 0 ? Math.floor(crates / active) : 0;
                containerSet = active !== 0 ? Math.floor(containers / active): 0;
                crates -= Math.floor(crateSet * active);
                containers -= Math.floor(containerSet * active);

                res_list.forEach(function(res){
                    if (dist[res] && dist[res].hasOwnProperty('cap')){
                        return;
                    }
                    if (global.race['artifical'] && res === 'Food'){
                        return;
                    }
                    if (global.resource[res].display && global.resource[res].stackable){
                        let multiplier = dist[res] ? dist[res].m : 1;
                        let crtAssign = Math.floor(crateSet > 0 ? crateSet * multiplier : 0);
                        global.resource[res].crates = crtAssign;
                        if (global.resource.Containers.display){
                            let cntAssign = Math.floor(containerSet > 0 ? containerSet * multiplier : 0);
                            global.resource[res].containers = cntAssign;
                        }
                        if (crates > 0 && multiplier >= 1){
                            let adjust = Math.ceil(multiplier / 2);
                            if (crates < adjust){ adjust = crates; }
                            global.resource[res].crates += adjust;
                            crates -= adjust;
                        }
                        if (containers > 0 && multiplier >= 1){
                            let adjust = Math.ceil(multiplier / 2);
                            if (containers < adjust){ adjust = containers; }
                            global.resource[res].containers += adjust;
                            containers -= adjust;
                        }
                    }
                });

                let max = 3;
                while (max > 0 && (crates > 0 || containers > 0)){
                    max--;
                    res_list.forEach(function(res){
                        if (dist[res] && dist[res].hasOwnProperty('cap')){
                            return;
                        }
                        if (global.race['artifical'] && res === 'Food'){
                            return;
                        }
                        if (global.resource[res].display && global.resource[res].stackable){
                            if (crates > 0){
                                global.resource[res].crates++;
                                crates--;
                            }
                            if (containers > 0){
                                global.resource[res].containers++;
                                containers--;
                            }
                        }
                    });
                }

                global.resource.Crates.amount = crates;
                global.resource.Containers.amount = containers;
                if (active){
                    global.resource.Crates.max -= sCrate;
                    global.resource.Containers.max -= sCon;
                }
            }
        }
    },
    assemble: { // Assemble Citizens
        name: loc(`gov_task_assemble`),
        req(){
            return global.race['artifical'] && (!global.tech['focus_cure'] || global.tech.focus_cure < 7) ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                if (global['resource'][global.race.species].max > global['resource'][global.race.species].amount){
                    actions.city.assembly.action();
                }
            }
        }
    },
    clone: { // Clone Citizens
        name: loc(`gov_task_clone`),
        req(){
            return global.tech['cloning'] ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                if (global['resource'][global.race.species].max > global['resource'][global.race.species].amount){
                    actions.tauceti.tau_home.cloning_facility.action();
                }
            }
        }
    },
    merc: { // Hire Mercs
        name: loc(`gov_task_merc`),
        req(){
            return checkCityRequirements('garrison') && global.tech['mercs'] ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                let cashCap = global.resource.Money.max * (global.race.governor.config.merc.reserve / 100);
                while (global.civic.garrison.max > global.civic.garrison.workers + global.race.governor.config.merc.buffer && global.resource.Money.amount >= govCivics('m_cost') && (global.resource.Money.amount + global.resource.Money.diff >= cashCap || global.resource.Money.diff >= govCivics('m_cost')) ){
                    govCivics('m_buy');
                }
            }
        }
    },
    spy: { // Spy Recruiter
        name: loc(`gov_task_spy`),
        req(){
            if (global.tech['isolation']){
                return false;
            }
            if (global.race['truepath'] && global.tech['spy']){
                return true;
            }
            return global.tech['spy'] && !global.tech['world_control'] && !global.race['cataclysm'] ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                let cashCap = global.resource.Money.max * (global.race.governor.config.spy.reserve / 100);
                let max = global.race['truepath'] && global.tech['rival'] ? 4 : 3;
                let min = global.tech['world_control'] ? 3 : 0;
                for (let i=min; i<max; i++){
                    let cost = govCivics('s_cost',i);
                    if (!global.civic.foreign[`gov${i}`].anx && !global.civic.foreign[`gov${i}`].buy && !global.civic.foreign[`gov${i}`].occ && global.civic.foreign[`gov${i}`].trn === 0 && global.resource.Money.amount >= cost && (global.resource.Money.diff >= cost || global.resource.Money.amount + global.resource.Money.diff >= cashCap)){
                        govCivics('t_spy',i);
                    }
                }
            }
        }
    },
    spyop: { // Spy Operator
        name: loc(`gov_task_spyop`),
        req(){
            if (global.tech['isolation']){
                return false;
            }
            if (global.race['truepath'] && global.tech['spy'] && global.tech.spy >= 2){
                return true;
            }
            return global.tech['spy'] && global.tech.spy >= 2 && !global.tech['world_control'] && !global.race['cataclysm'] ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                let range = global.race['truepath'] && global.tech['rival'] ? [0,1,2,3] : [0,1,2];
                if (global.tech['world_control']){ range = [3]; }
                range.forEach(function(gov){
                    if (global.civic.foreign[`gov${gov}`].sab === 0 && global.civic.foreign[`gov${gov}`].spy > 0 && !global.civic.foreign[`gov${gov}`].anx && !global.civic.foreign[`gov${gov}`].buy && !global.civic.foreign[`gov${gov}`].occ){
                        global.race.governor.config.spyop[`gov${gov}`].every(function (mission){
                            switch (mission){
                                case 'influence':
                                    if (global.civic.foreign[`gov${gov}`].hstl > 0 && global.civic.foreign[`gov${gov}`].spy > 1){
                                        govCivics('s_influence',gov);
                                        return false;
                                    }
                                    break;
                                case 'sabotage':
                                    if (global.civic.foreign[`gov${gov}`].mil > 50){
                                        govCivics('s_sabotage',gov);
                                        return false;
                                    }
                                    break;
                                case 'incite':
                                    if (global.civic.foreign[`gov${gov}`].unrest < 100 && global.civic.foreign[`gov${gov}`].spy > 2 && gov < 3){
                                        govCivics('s_incite',gov);
                                        return false;
                                    }
                                    break;
                            }
                            return true;
                        });
                    }
                });
            }
        }
    },
    slave: { // Replace Slaves
        name: loc(`gov_task_slave`),
        req(){
            return !global.race['orbit_decayed'] && checkCityRequirements('slave_market') && global.race['slaver'] && global.city['slave_pen'] ? true : false;
        },
        task(){
            let cashCap = global.resource.Money.max * (global.race.governor.config.slave.reserve / 100);
            let slaveCost = 25000;
            if (global.race['inflation']){
                slaveCost *= 1 + (global.race.inflation / 100);
            }
            let extraVal = govActive('extravagant',0);
            if (extraVal){
                slaveCost *= 1 + (extraVal / 100);
            }
            if ( $(this)[0].req() && global.resource.Money.amount >= slaveCost && (global.resource.Money.diff >= slaveCost || global.resource.Money.amount + global.resource.Money.diff >= cashCap) ){
                let max = global.city.slave_pen.count * 4;
                if (max > global.city.slave_pen.slaves){
                    actions.city.slave_market.action();
                }
            }
        }
    },
    sacrifice: { // Sacrifice Population
        name: loc(`gov_task_sacrifice`),
        req(){
            return checkCityRequirements('s_alter') && global.city.hasOwnProperty('s_alter') && global.city['s_alter'].count >= 1 ? true : false;
        },
        task(){
            if ( $(this)[0].req() && global.resource[global.race.species].amount === global.resource[global.race.species].max ){
                if ((!global.race['kindling_kindred'] && !global.race['smoldering'] && global.city.s_alter.harvest <= 10000) || global.city.s_alter.mind <= 10000 || global.city.s_alter.mine <= 10000 || global.city.s_alter.rage <= 10000 || global.city.s_alter.regen <= 10000){
                    actions.city.s_alter.action();
                }
            }
        }
    },
    horseshoe: { // Forge horseshoes
        name: loc(global.race['sludge'] ? `gov_task_beaker` : `gov_task_horseshoe`),
        req(){
            return global.race['hooved'] ? true : false;
        },
        task(){
            let cost = actions.city.horseshoe.cost;
            if ( $(this)[0].req() && checkAffordable(cost)){
                cost = adjustCosts(actions.city.horseshoe);
                let res = 'Copper';
                let amount = 10;
                Object.keys(cost).forEach(function(r){
                    if (cost[r]() > 0){
                        res = r;
                        amount = cost[r]();
                    }
                });
                if (global.resource[res].amount > amount && (global.resource[res].diff >= amount || global.resource[res].amount + global.resource[res].diff >= global.resource[res].max) ){
                    actions.city.horseshoe.action();
                }
            }
        }
    },
    trash: {
        name: loc(`gov_task_trash`),
        req(){
            return global.interstellar['mass_ejector'] && global.interstellar.mass_ejector.count >= 1 ? true : false;
        },
        task(){
            let mass = function(m){
                return global.race.universe === 'magic' ? atomic_mass[m] : (['Elerium','Infernite'].includes(m) ? atomic_mass[m] * 10 : atomic_mass[m]);
            };
            let remain = p_on['mass_ejector'] * 1000;
            Object.keys(atomic_mass).sort((a,b) => (mass(a) < mass(b)) ? 1 : -1).forEach(function(res){
                let trade = breakdown.p.consume[res].hasOwnProperty(loc('trade')) ? breakdown.p.consume[res][loc('trade')]: 0;
                let craft = breakdown.p.consume[res].hasOwnProperty(loc('job_craftsman')) ? breakdown.p.consume[res][loc('job_craftsman')]: 0;
                if (trade < 0){ trade = 0; }
                if (craft > 0){ craft = 0; }

                if (global.race.governor.config.trash[res] || global.interstellar.mass_ejector.hasOwnProperty(res) && global.resource[res].display && global.resource[res].max > 0 && global.interstellar.mass_ejector[res] + global.resource[res].diff > 0 && global.resource[res].amount + trade - craft >= global.resource[res].max * 0.999 - 1){
                    let set = (global.resource[res].amount + trade - craft >= global.resource[res].max * 0.999 - 1) || (global.race.governor.config.trash[res] && !global.race.governor.config.trash[res].s)
                        ? Math.floor(global.interstellar.mass_ejector[res] + global.resource[res].diff)
                        : 0;
                    
                    if (global.race.governor.config.trash[res] && set < global.race.governor.config.trash[res].v && global.race.governor.config.trash[res].s){
                        set = Math.abs(global.race.governor.config.trash[res].v);
                    }
                    else if (global.race.governor.config.trash[res] && !global.race.governor.config.trash[res].s){
                        set = (global.resource[res].amount + trade - craft >= global.resource[res].max * 0.999 - 1) ? set : set - Math.abs(global.race.governor.config.trash[res].v);
                    }
                    if (set > remain){ set = remain; }
                    if (set < 0){ set = 0; }
                    if (global.race['artifical'] && res === 'Food'){ set = 0; }
                    global.interstellar.mass_ejector[res] = set;
                    remain -= set;
                }
                else {
                    global.interstellar.mass_ejector[res] = 0;
                }
            });
            global.interstellar.mass_ejector.total = p_on['mass_ejector'] * 1000 - remain;
        }
    },
    mech: { // Mech Builder
        name: loc(`gov_task_mech`),
        req(){
            return global.stats.achieve.hasOwnProperty('corrupted') && global.stats.achieve.corrupted.l > 0 && checkHellRequirements('prtl_spire','mechbay') && global.portal.hasOwnProperty('mechbay') ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                let ctype = 'large';
                let mCosts = mechCost(ctype,false);
                let cost = mCosts.c;
                let soul = mCosts.s;
                let size = mechSize(ctype);

                let mechs = {
                    type: {}
                };

                ['small','medium','large','titan','collector'].forEach(function(type){
                    mechs.type[type] = 0;
                    mechs[type] = {
                        chassis: {},
                        weapon: {},
                        equip: {}
                    };
                    ['hover','spider','wheel','tread','biped','quad'].forEach(function(chassis){
                        mechs[type].chassis[chassis] = 0;
                    });
                    ['plasma','laser','kinetic','shotgun','missile','flame','sonic','tesla'].map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value).forEach(function(weapon){
                        mechs[type].weapon[weapon] = 0;
                    });
                    ['shields','flare','seals','grapple','sonar','ablative','radiator','infrared','coolant','stabilizer'].forEach(function(equip){
                        mechs[type].equip[equip] = 0;
                    });
                });

                global.portal.mechbay.mechs.forEach(function(mech){
                    mechs.type[mech.size]++;
                    mechs[mech.size].chassis[mech.chassis]++;
                    mech.hardpoint.forEach(function(wep){
                        mechs[mech.size].weapon[wep]++;
                    });
                    mech.equip.forEach(function(equip){
                        mechs[mech.size].equip[equip]++;
                    });
                });

                if ((mechs.type.large >= 6 && mechs.type.small < 12) || (mechs.type.large >= 12 && mechs.type.titan >= 2 && mechs.type.small < 24)){
                    ctype = 'small';
                    mCosts = mechCost(ctype,false);
                    cost = mCosts.c;
                    soul = mCosts.s;
                    size = mechSize(ctype);
                }
                else if (mechs.type.large >= 6 && mechs.type.medium < 12){
                    ctype = 'medium';
                    mCosts = mechCost(ctype,false);
                    cost = mCosts.c;
                    soul = mCosts.s;
                    size = mechSize(ctype);
                }
                else if (mechs.type.large >= 12 && mechs.type.titan < 2){
                    mCosts = mechCost('titan',false);
                    if (mCosts.c <= global.portal.purifier.sup_max){
                        ctype = 'titan';
                        cost = mCosts.c;
                        soul = mCosts.s;
                        size = mechSize(ctype);
                    }
                }

                let avail = global.portal.mechbay.max - global.portal.mechbay.bay;
                if (avail < size && global.blood['prepared'] && global.blood.prepared >= 3){
                    if (global.queue.queue.some(q => ['portal-purifier','portal-port','portal-base_camp','portal-mechbay','portal-waygate'].includes(q.id))){
                        return;
                    }

                    for (let i=0; i<global.portal.mechbay.mechs.length; i++){
                        if (!global.portal.mechbay.mechs[i]['infernal']){
                            let pattern = global.portal.mechbay.mechs[i];
                            ctype = pattern.size;
                            mCosts = mechCost(ctype,true);
                            cost = mCosts.c;
                            soul = mCosts.s;

                            let gems = Math.floor(soul / 2);
                            let supply = global.portal.purifier.supply + Math.floor(cost / 3);
                            if (supply > global.portal.purifier.sup_max){
                                supply = global.portal.purifier.sup_max;
                            }

                            if (supply >= cost && global.resource.Soul_Gem.amount + gems >= soul){
                                global.resource.Soul_Gem.amount += gems;
                                global.resource.Soul_Gem.amount -= soul;
                                global.portal.purifier.supply = supply;
                                global.portal.purifier.supply -= cost;
                                global.portal.mechbay.mechs[i]['infernal'] = true;

                                if (pattern.size === 'small' && pattern.equip.length === 0){
                                    global.portal.mechbay.mechs[i].equip.push('special');
                                }
                                else if ((pattern.size === 'medium' && pattern.equip.length === 1) || (pattern.size === 'large' && pattern.equip.length === 2) || (pattern.size === 'titan' && pattern.equip.length < 5)){
                                    let equip = '???';
                                    Object.keys(mechs[ctype].equip).forEach(function(val){
                                        if (equip === '???' || mechs[ctype].equip[val] < mechs[ctype].equip[equip]){
                                            if (equip !== val){
                                                equip = val;
                                            }
                                        }
                                    });
                                    if (!pattern.equip.includes('special')){
                                        global.portal.mechbay.mechs[i].equip.push('special');
                                    }
                                    else {
                                        global.portal.mechbay.mechs[i].equip.push(equip);
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
                else if (global.portal.purifier.supply >= cost && avail >= size && global.resource.Soul_Gem.amount >= soul){
                    let c_val = 99;
                    let chassis = 'hover';
                    Object.keys(mechs[ctype].chassis).forEach(function(val){
                        if (mechs[ctype].chassis[val] < c_val){
                            c_val = mechs[ctype].chassis[val];
                            chassis = val;
                        }
                    });
                    let weapons = ctype === 'titan' ? ['???','???','???','???'] : ['???','???'];
                    let wCap = ctype === 'titan' ? 4 : 2;
                    for (let i=0; i<wCap; i++){
                        Object.keys(mechs[ctype].weapon).forEach(function(val){
                            if (weapons[i] === '???' || mechs[ctype].weapon[val] < mechs[ctype].weapon[weapons[i]]){
                                if (!weapons.includes(val)){
                                    weapons[i] = val;
                                }
                            }
                        });
                    }
                    let equip = ['???','???','???','???'];
                    for (let i=0; i<4; i++){
                        Object.keys(mechs[ctype].equip).forEach(function(val){
                            if (equip[i] === '???' || mechs[ctype].equip[val] < mechs[ctype].equip[equip[i]]){
                                if (!equip.includes(val)){
                                    equip[i] = val;
                                }
                            }
                        });
                    }

                    let equipment = global.blood['prepared'] ? equip : [equip[0],equip[1]];
                    if (ctype === 'small'){
                        weapons = [weapons[0]];
                        equipment = global.blood['prepared'] ? ['special'] : [];
                    }
                    else if (ctype === 'medium'){
                        weapons = [weapons[0]];
                        equipment = global.blood['prepared'] ? ['special',equip[0]] : ['special'];
                    }
                    else if (ctype === 'large'){
                        equipment = global.blood['prepared'] ? ['special',equip[0],equip[1]] : ['special',equip[0]];
                    }
                    else if (ctype === 'titan'){
                        equipment = global.blood['prepared'] ? ['special',equip[0],equip[1],equip[2],equip[3]] : ['special',equip[0],equip[1],equip[2]];
                    }

                    global.portal.purifier.supply -= cost;
                    global.resource.Soul_Gem.amount -= soul;
                    global.portal.mechbay.mechs.push({
                        chassis: chassis,
                        size: ctype,
                        equip: equipment,
                        hardpoint: weapons,
                        infernal: false
                    });
                    global.portal.mechbay.bay += size;
                    global.portal.mechbay.active++;
                }
            }
        }
    },
    replicate: { // Replicator Scheduler
        name: loc(`gov_task_replicate`),
        req(){
            return global.tech['replicator'] && global.race['replicator'] ? true : false;
        },
        task(){
            if (global.race.governor.config.replicate.pow.on){
                let cap = global.race.governor.config.replicate.pow.cap;
                let buffer = global.race.governor.config.replicate.pow.buffer;
                if (global.city.power < buffer && global.race.replicator.pow > 0){
                    let drain = global.city.power < 0 ? Math.abs(global.city.power) + buffer : buffer - global.city.power;
                    global.race.replicator.pow -= drain;
                    if (global.race.replicator.pow < 0){
                        global.race.replicator.pow = 0;
                    }
                }
                else if (global.city.power > buffer && global.race.replicator.pow < cap){
                    global.race.replicator.pow += (global.city.power - buffer);
                    if (global.race.replicator.pow > cap){
                        global.race.replicator.pow = cap;
                    }
                }
                else if (global.race.replicator.pow > cap){
                    global.race.replicator.pow = cap;
                }
                global.race.replicator.pow = Math.floor(global.race.replicator.pow);
            }

            let rBal = false;
            for (let idx = 0; global.race.governor.config.replicate.res.que && idx < global.queue.queue.length; idx++){
                let struct = decodeStructId(global.queue.queue[idx].id);
                let tc = false;
                if (global.queue.queue[idx].action === 'arpa'){
                    let remain = (100 - global.arpa[struct.a].complete) / 100;
                    let c_action = actions.arpa[struct.a];
                    tc = arpaTimeCheck(c_action,remain,false,true);
                }
                else {
                    tc = timeCheck(struct.a,false,true);
                }
                let resSorted = Object.keys(tc.s).sort(function(a,b){return tc.s[b]-tc.s[a]});
                for (let i=0; i<resSorted.length; i++){
                    if (global.resource[resSorted[i]].display && atomic_mass[resSorted[i]]){
                        global.race.replicator.res = resSorted[i];
                        rBal = true;
                        break;
                    }
                }
                if (!global.settings.qAny || rBal){
                    break;
                }
            }

            if (!rBal){
                let resSorted = Object.keys(atomic_mass).sort(function(a,b){return global.resource[a].diff-global.resource[b].diff});
                resSorted = resSorted.filter(item => global.resource[item].display);

                if (global.race.governor.config.replicate.res.neg && global.resource[resSorted[0]].diff < 0 && ((global.resource[resSorted[0]].amount <= global.resource[resSorted[0]].max * 0.95) || global.resource[resSorted[0]].max === -1)){
                    global.race.replicator.res = resSorted[0];
                }
                else if (global.resource[global.race.replicator.res].max !== -1 && global.race.governor.config.replicate.res.cap && global.resource[global.race.replicator.res].amount >= global.resource[global.race.replicator.res].max){
                    let cappable = resSorted.filter(item => global.resource[item].max > 0);
                    for (let i=0; i<cappable.length; i++){
                        if (global.resource[cappable[i]].amount < global.resource[cappable[i]].max){
                            global.race.replicator.res = cappable[i];
                            rBal = true;
                            break;
                        }
                    }
                    if (!rBal){
                        let uncappable = resSorted.filter(item => global.resource[item].max === -1);
                        if (uncappable.length > 0){
                            global.race.replicator.res = uncappable[0];
                        }
                    }
                }
            }
        }
    },
};