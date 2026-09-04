import { global, seededRandom, p_on, breakdown } from './vars.js';
import { vBind, popover, tagEvent, calcQueueMax, calcRQueueMax, clearElement, adjustCosts, decodeStructId, timeCheck, arpaTimeCheck, hoovedRename, buildQueue } from './functions.js';
import { races } from './races.js';
import { actions, checkCityRequirements, housingLabel, wardenLabel, updateQueueNames, checkAffordable, checkCosts, drawTech, drawCity } from './actions.js';
import { govCivics, govTitle, govEffect, garrisonSize } from './civics.js';
import { crateGovHook, atomic_mass } from './resources.js';
import { gridDefs, dualReplicator } from './industry.js';
import { checkHellRequirements, mechSize, mechCost, validWeapons, validEquipment, mechGeneralSlots, wlEquipSlots } from './portal.js';
import { loc } from './locale.js';
import { jobScale } from './jobs.js';
import { isStargateOn, checkSpaceRequirements } from './space.js';
import { stabilize_blackhole } from './tech.js';
import { shipCosts, checkPathRequirements, titanReclaimed } from './truepath.js';
import { checkEdenRequirements } from './edenic.js';

export const gmen = {
    soldier: {
        name: loc('governor_soldier'),
        desc: loc('governor_soldier_desc'),
        title: [loc('governor_soldier_t1'),loc('governor_soldier_t2'),loc('governor_soldier_t3')],
        traits: {
            tactician: 1,
            militant: 1,
            nopain: 1
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
            runner: 1
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
        effect(b){ return loc(`gov_trait_tactician_effect`,[$(this)[0].vars(b)[0]]); },
        vars(b){
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [30] : [25]; 
        },
    },
    militant: {
        name: loc(`gov_trait_militant`),
        effect(b){ return loc(`gov_trait_militant_effect`,[$(this)[0].vars(b)[0],$(this)[0].vars(b)[1]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [30,10] : [25,10]; 
        },
    },
    noquestions: {
        name: loc(`gov_trait_noquestions`),
        effect(b){ return loc(`gov_trait_noquestions_effect`,[$(this)[0].vars(b)[0]]); },
        vars(b){ return [0.005]; },
    },
    racketeer: {
        name: loc(`gov_trait_racketeer`),
        effect(b){ return loc(`gov_trait_racketeer_effect`,[$(this)[0].vars(b)[0],$(this)[0].vars(b)[1]]); },
        vars(b){
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            } 
            return b ? [18,45] : [20,35]; 
        },
    },
    dealmaker: {
        name: loc(`gov_trait_dealmaker`),
        effect(b){ return loc(`gov_trait_dealmaker_effect`,[$(this)[0].vars(b)[0]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [150] : [125]; 
        },
    },
    risktaker: {
        name: loc(`gov_trait_risktaker`),
        effect(b){ return loc(`gov_trait_risktaker_effect`,[$(this)[0].vars(b)[0]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [14] : [12]; 
        },
    },
    teacher: {
        name: loc(`gov_trait_teacher`),
        effect(b){ return loc(`gov_trait_teacher_effect`,[$(this)[0].vars(b)[0], $(this)[0].vars(b)[1]]); },
        vars(b){ return [6,30]; },
    },
    theorist: {
        name: loc(`gov_trait_theorist`),
        effect(b){ return loc(`gov_trait_theorist_effect`,[$(this)[0].vars(b)[0],$(this)[0].vars(b)[1]]); },
        vars(b){
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            } 
            return b ? [100,2] : [50,4]; 
        },
    },
    inspirational: {
        name: loc(`gov_trait_inspirational`),
        effect(b){ return loc(`gov_trait_inspirational_effect`,[$(this)[0].vars(b)[0]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [30] : [20]; 
        },
    },
    pious: {
        name: loc(`gov_trait_pious`),
        effect(b,wiki){
            let val = $(this)[0].vars(b)[1];
            let xeno = global.tech['monument'] && global.tech.monument >= 3 && isStargateOn(wiki) ? 3 : 1;
            val *= xeno;
            if (global.civic.govern.type === 'corpocracy'){
                val *= 1 + (govEffect.corpocracy()[2] / 100);
            }
            return loc(`gov_trait_pious_effect`,[$(this)[0].vars(b)[0],val]);
        },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [8,8] : [10,5]; 
        },
    },
    pragmatist: {
        name: loc(`gov_trait_pragmatist`),
        effect(b){ return loc(`gov_trait_pragmatist_effect`,[$(this)[0].vars(b)[0],$(this)[0].vars(b)[1]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [100,2] : [50,2]; 
        },
    },
    dirty_jobs: {
        name: loc(`gov_trait_dirty_jobs`),
        effect(b){ return loc(`gov_trait_dirty_jobs_effect`,[$(this)[0].vars(b)[0],$(this)[0].vars(b)[1],$(this)[0].vars(b)[2]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [0.015,2,18] : [0.015,1,14]; 
        },
    },
    extravagant: {
        name: loc(`gov_trait_extravagant`),
        effect(b){ return loc(`gov_trait_extravagant_effect`,[$(this)[0].vars(b)[0],housingLabel('large',true),$(this)[0].vars(b)[1],jobScale($(this)[0].vars(b)[2]+5)]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [8,1,2] : [10,1.25,1]; 
        },
    },
    aristocrat: {
        name: loc(`gov_trait_aristocrat`),
        effect(b){ return loc(`gov_trait_aristocrat_effect`,[$(this)[0].vars(b)[0],$(this)[0].vars(b)[1],$(this)[0].vars(b)[2]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [60,20,5] : [50,20,10]; 
        },
    },
    gaslighter: {
        name: loc(`gov_trait_gaslighter`),
        effect(b){
            return loc(`gov_trait_gaslighter_effect`,[$(this)[0].vars(b)[0],wardenLabel(),$(this)[0].vars(b)[1],$(this)[0].vars(b)[2],$(this)[0].vars(b)[3]]);
        },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [2,2,0.5,35] : [1,1,0.5,30]; 
        },
    },
    muckraker: {
        name: loc(`gov_trait_muckraker`),
        effect(b){
            return loc(`gov_trait_muckraker_effect`,[$(this)[0].vars(b)[1],$(this)[0].vars(b)[2]]);
        },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [6,12,2] : [8,12,3]; 
        },
    },
    athleticism: {
        name: loc(`gov_trait_athleticism`),
        effect(b){ return loc(`gov_trait_athleticism_effect`,[$(this)[0].vars(b)[0],jobScale($(this)[0].vars(b)[1]),$(this)[0].vars(b)[2],wardenLabel()]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [1.5,2,3] : [1.5,2,4]; 
        },
    },
    nopain: {
        name: loc(`gov_trait_nopain`),
        effect(b){ return loc(`gov_trait_nopain_effect`,[$(this)[0].vars(b)[0]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [50] : [40]; 
        },
    },
    runner: {
        name: loc(`gov_trait_runner`),
        effect(b){ return loc(`gov_trait_runner_effect`,[$(this)[0].vars(b)[0],$(this)[0].vars(b)[1]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [20,12] : [10,8]; 
        },
    },
    organizer: {
        name: loc(`gov_trait_organizer`),
        effect(b){ return loc(`gov_trait_organizer_effect`,[$(this)[0].vars(b)[0]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 2 ? true : false;
            }
            return [b ? 2 : 1]; 
        },
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
    eldritch: ['Tentacle','Faceless','Horror','Darkness','Void','Dreamer','Mindflayer','Whisper','Paranoia','Empty'],
};

function genGovernor(setSize){
    let governors = [];
    let genus = global.race.maintype || races[global.race.species].type;
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

        let bgIdx = Math.floor(seededRandom(0,backgrounds.length));
        let nameIdx = Math.floor(seededRandom(0,nameList.length));

        let bg = backgrounds.splice(bgIdx,1)[0];
        let name = loc("gov_name_" + nameList.splice(nameIdx,1)[0]);

        let title = gmen[bg].title[Math.floor(seededRandom(0,gmen[bg].title.length))];
        if (typeof title === 'object'){
            title = Math.floor(seededRandom(0,2)) === 0 ? title.m : title.f;
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
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 0)){
        return;
    }
    if (global.genes['governor'] && global.tech['governor']){
        clearElement($('#r_govern1'));
        if (global.race.hasOwnProperty('governor') && (!global.race.governor.hasOwnProperty('candidates') || global.race.governor.candidates.length === 0)){
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
    governorTitle.append($(`<div class="has-text-caution" role="heading" aria-level="2">${loc(`governor_office`,[global.race.governor.g.n])}</div>`));
    governorTitle.append($(`<div><span class="has-text-warning">${loc(`governor_background`)}:</span> <span class="bg">${gmen[global.race.governor.g.bg].name}</span></div>`));

    govHeader.append(governorTitle);
    govHeader.append($(`<div class="fire"><b-button @click="fire" v-html="fireText()"></b-button></div>`));

    let cnt = [0,1,2];
    if (global.genes['governor'] && global.genes.governor >= 2){
        cnt.push(cnt.length);
        if (govActive('organizer',0)){ cnt.push(cnt.length); }
    }
    if (govActive('organizer',0)){ cnt.push(cnt.length); }
    cnt.forEach(function(num){
        let options = `<b-dropdown-item @click="setTask('none',${num})" aria-role="listitem">{{ label('none') }}</b-dropdown-item>`;
        Object.keys(gov_tasks).forEach(function(task){
            if (gov_tasks[task].req()){
                options += `<b-dropdown-item v-show="activeTask('${task}')" @click="setTask('${task}',${num})" aria-role="listitem">{{ label('${task}') }}</b-dropdown-item>`;
            }
        });

        govern.append(`<div class="govTask"><span>${loc(`gov_task`,[num+1])}</span><b-dropdown hoverable aria-role="list">
            <template #trigger="{ active }">
                <b-button type="is-primary" icon-right="fas fa-sort-down">
                    {{ label(t.t${num}) }}
                </b-button>
            </template>
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

        let storeContain = $(`<div class="tConfig" v-show="showTask('storage')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_storage`)}</div></div>`);
        options.append(storeContain);
        let storage = $(`<div class="storage"></div>`);
        storeContain.append(storage);

        let crt_mat = global.race['kindling_kindred'] || global.race['smoldering'] || global.race['iceage'] ? (global.race['smoldering'] ? 'Chrysotile' : 'Stone') : 'Plywood';
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

        let storeContain = $(`<div class="tConfig" v-show="showTask('bal_storage')"><div class="hRow"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_bal_storage`)}</div><div class="chk"><b-checkbox v-model="c.bal_storage.adv">${loc(`advanced`)}</b-checkbox></div></div></div>`);
        options.append(storeContain);
        let storage = $(`<div class="bal_storage"></div>`);
        storeContain.append(storage);

        Object.keys(global.resource).forEach(function(res){
            if (global.resource[res].stackable){
                if (!global.race.governor.config.bal_storage.hasOwnProperty(res)){
                    global.race.governor.config.bal_storage[res] = "2";
                }

                storage.append($(`<div class="ccmOption" :class="bStrEx()" v-show="showStrRes('${res}')"><span role="heading" aria-level="4">${global.resource[res].name}</span>
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

        let contain = $(`<div class="tConfig" v-show="showTask('merc')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_merc`)}</div></div>`);
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

        let contain = $(`<div class="tConfig" v-show="showTask('spy')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_spy`)}</div></div>`);
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
        
        let contain = $(`<div class="tConfig" v-show="showTask('spyop')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_spyop`)}</div></div>`);
        options.append(contain);
        Object.keys(global.civic.foreign).forEach(function (gov){
            if ((gov.substr(3,1) < 3 && !global.tech['world_control']) || (gov === 'gov3' && global.tech['rival'])){
                let spyop = $(`<div></div>`);
                contain.append(spyop);
                spyop.append(`
                    <h2 class="has-text-caution" aria-level="4">${loc('gov_task_spyop_priority',[govTitle(gov.substring(3))])}</h2>
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

        let contain = $(`<div class="tConfig" v-show="showTask('tax')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_tax`)}</div></div>`);
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

        let contain = $(`<div class="tConfig" v-show="showTask('slave')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_slave`,[global.resource.Slave.name])}</div></div>`);
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
        if (!global.race.governor.config.trash.hasOwnProperty('stab')){
            global.race.governor.config.trash['stab'] = false;
        }

        let advanced = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? `<div class="chk"><b-checkbox v-model="c.trash.stab">${loc(`gov_task_auto_stabilize`)}</b-checkbox></div>` : ``;

        let contain = $(`<div class="tConfig" v-show="showTask('trash')"><div class="hRow"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_trash`)}</div>${advanced}</div></div>`);
        options.append(contain);
        let trash = $(`<div class="storage"></div>`);
        contain.append(trash);

        ['Infernite','Elerium','Copper','Iron'].forEach(function(res){
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

        let contain = $(`<div class="tConfig" v-show="showTask('replicate')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_replicate`)}</div></div>`);
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

    { // Rebuild Ruins
        if (!global.race.governor.config.hasOwnProperty('repair')){
            global.race.governor.config['repair'] = {};
        }
        if (!global.race.governor.config.repair.hasOwnProperty('threat')){
            global.race.governor.config.repair['threat'] = repairThreatDefault;
        }

        let contain = $(`<div class="tConfig" v-show="showTask('repair')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_repair`)}</div></div>`);
        options.append(contain);
        let repair = $(`<div class="storage"></div>`);
        contain.append(repair);

        repair.append($(`<b-field>${loc(`gov_task_repair_threat`)}<b-numberinput min="0" :max="Number.MAX_SAFE_INTEGER" v-model="c.repair.threat" :controls="false"></b-numberinput></b-field>`));
    }

    { // Aberrant Hunter
        if (!global.race.governor.config.hasOwnProperty('hunter')){
            global.race.governor.config['hunter'] = {};
        }
        if (!global.race.governor.config.hunter.hasOwnProperty('herbivores')){
            global.race.governor.config.hunter['herbivores'] = { on: false, soldiers: 100, injuries: 5 };
        }
        if (!global.race.governor.config.hunter.hasOwnProperty('carnivores')){
            global.race.governor.config.hunter['carnivores'] = { on: false, soldiers: 100, injuries: 5 };
        }
        if (!global.race.governor.config.hunter.hasOwnProperty('scavengers')){
            global.race.governor.config.hunter['scavengers'] = { on: false, soldiers: 100, injuries: 5 };
        }

        let contain = $(`<div class="tConfig" v-show="showTask('hunt')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_hunt`)}</div></div>`);
        options.append(contain);

        let identifier = $(`<div class="storage"></div>`);
        contain.append(identifier);
        identifier.append($(`<div class="has-text-success">${loc(`gov_task_hunt_herbivores`)}</div>`));
        identifier.append($(`<div class="has-text-success">${loc(`gov_task_hunt_carnivores`)}</div>`));
        identifier.append($(`<div class="has-text-success">${loc(`gov_task_hunt_scavengers`)}</div>`));

        let enabler = $(`<div class="storage"></div>`);
        contain.append(enabler);
        enabler.append($(`<div class="chk"><b-checkbox v-model="c.hunter.herbivores.on">${loc(`gov_task_hunt_activate`)}</b-checkbox></div>`));
        enabler.append($(`<div class="chk"><b-checkbox v-model="c.hunter.carnivores.on">${loc(`gov_task_hunt_activate`)}</b-checkbox></div>`));
        enabler.append($(`<div class="chk"><b-checkbox v-model="c.hunter.scavengers.on">${loc(`gov_task_hunt_activate`)}</b-checkbox></div>`));

        let soldiers = $(`<div class="storage"></div>`);
        contain.append(soldiers);
        soldiers.append($(`<b-field>${loc(`gov_task_hunt_soldiers`)}<b-numberinput min="0" v-model="c.hunter.herbivores.soldiers" :controls="false"></b-numberinput></b-field>`));
        soldiers.append($(`<b-field>${loc(`gov_task_hunt_soldiers`)}<b-numberinput min="0" v-model="c.hunter.carnivores.soldiers" :controls="false"></b-numberinput></b-field>`));
        soldiers.append($(`<b-field>${loc(`gov_task_hunt_soldiers`)}<b-numberinput min="0" v-model="c.hunter.scavengers.soldiers" :controls="false"></b-numberinput></b-field>`));

        let injured = $(`<div class="storage"></div>`);
        contain.append(injured);
        injured.append($(`<b-field>${loc(`gov_task_hunt_injured`)}<b-numberinput min="0" v-model="c.hunter.herbivores.injuries" :controls="false"></b-numberinput></b-field>`));
        injured.append($(`<b-field>${loc(`gov_task_hunt_injured`)}<b-numberinput min="0" v-model="c.hunter.carnivores.injuries" :controls="false"></b-numberinput></b-field>`));
        injured.append($(`<b-field>${loc(`gov_task_hunt_injured`)}<b-numberinput min="0" v-model="c.hunter.scavengers.injuries" :controls="false"></b-numberinput></b-field>`));
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
                if (t === 'combo_storage'){
                    Object.keys(global.race.governor.tasks).forEach(function(ts){
                        if (global.race.governor.tasks[ts] === 'storage' || global.race.governor.tasks[ts] === 'bal_storage'){
                            global.race.governor.tasks[ts] = 'none';
                        }
                    });
                }
                else if (t === 'storage' || t === 'bal_storage'){
                    Object.keys(global.race.governor.tasks).forEach(function(ts){
                        if (global.race.governor.tasks[ts] === 'combo_storage'){
                            global.race.governor.tasks[ts] = 'none';
                        }
                    });
                }
                if (t === 'combo_spy'){
                    Object.keys(global.race.governor.tasks).forEach(function(ts){
                        if (global.race.governor.tasks[ts] === 'spy' || global.race.governor.tasks[ts] === 'spyop'){
                            global.race.governor.tasks[ts] = 'none';
                        }
                    });
                }
                else if (t === 'spy' || t === 'spyop'){
                    Object.keys(global.race.governor.tasks).forEach(function(ts){
                        if (global.race.governor.tasks[ts] === 'combo_spy'){
                            global.race.governor.tasks[ts] = 'none';
                        }
                    });
                }
                tagEvent('govtask',{
                    'task': t
                });
                vBind({el: `#race`},'update');
            },
            showTask(t){
                return Object.values(global.race.governor.tasks).includes(t) 
                || (Object.values(global.race.governor.tasks).includes('combo_storage') && ['storage','bal_storage'].includes(t))
                || (Object.values(global.race.governor.tasks).includes('combo_spy') && ['spy','spyop'].includes(t));
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
                    updateQueueNames(true, ['city-amphitheatre', 'city-apartment']);
                    drawCity();
                    drawTech();
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
            },
            label(t){
                return gov_tasks[t] ? (typeof gov_tasks[t].name === 'string' ? gov_tasks[t].name : gov_tasks[t].name()) : loc(`gov_task_${t}`);
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

    if (!global.race.hasOwnProperty('governor') || !global.race.governor.hasOwnProperty('candidates') || global.race.governor.candidates.length === 0){
        global.race['governor'] = {
            candidates: genGovernor(10)
        };
    }

    govern.append($(`<div class="appoint header"><span class="has-text-caution">${loc(`governor_candidate`)}</span><span class="has-text-caution">${loc(`governor_background`)}</span><span></span><div>`));
    for (let i=0; i<global.race.governor.candidates.length; i++){
        let gov = global.race.governor.candidates[i];
        if ((global.race['warlord'] && gov.bg === 'soldier') || !global.race['warlord']){
            govern.append($(`<div class="appoint ${gov.bg}"><span class="has-text-warning" role="heading" aria-level="3">${gov.t} ${gov.n}</span><span class="bg">${gmen[gov.bg].name}</span><span><b-button @click="appoint(${i})">${loc(`governor_appoint`)}</b-button></span><div>`));
        }
    }

    vBind({
        el: '#candidates',
        data: [],
        methods: {
            appoint(gi){
                if (global.genes['governor'] && global.tech['governor']){
                    let gov = global.race.governor.candidates[gi];
                    global.race.governor['g'] = gov;
                    global.race.governor.candidates = [];
                    global.race.governor['tasks'] = {
                        t0: 'none', t1: 'none', t2: 'none', t3: 'none', t4: 'none', t5: 'none'
                    };
                    updateQueueNames(true, ['city-amphitheatre', 'city-apartment']);
                    drawCity();
                    drawTech();
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
        for (let i=0; i<Object.keys(global.race.governor.tasks).length; i++){
            if (global.race.governor.tasks[`t${i}`] === task){
                global.race.governor.tasks[`t${i}`] = 'none';
            }
        }
    }
}

// --- Rebuild Ruins ----------------------------------------------------------------------------
// How each category decides whether one of its structures can be built right now: the settings flag
// that reveals its region, and the requirement check that region's renderer uses. Anything razed in a
// region the player has not (re)discovered stays off the list — the jump gate hides all of Sol again.
const repairRegions = {
    city:         { show(){ return true; }, req(region,key){ return checkCityRequirements(key); } },
    space:        { show(region){ return global.settings.space[region.substring(4)]; }, req(region,key){ return checkSpaceRequirements('space',region,key); } },
    interstellar: { show(region){ return global.settings.space[region.substring(4)]; }, req(region,key){ return checkSpaceRequirements('interstellar',region,key); } },
    galaxy:       { show(region){ return global.settings.space[region.substring(4)]; }, req(region,key){ return checkSpaceRequirements('galaxy',region,key); } },
    tauceti:      { show(region){ return global.settings.tau[region.substring(4)]; }, req(region,key){ return checkPathRequirements('tauceti',region,key); } },
    portal:       { show(region){ return global.settings.portal[region.substring(5)]; }, req(region,key){ return checkHellRequirements(region,key); } },
    eden:         { show(region){ return global.settings.eden[region.substring(5)]; }, req(region,key){ return checkEdenRequirements(region,key); } }
};

// Every structure type carried by the `type` key on struct-bearing actions. Ordering here is the
// tie-break a governor with no opinion falls back on, so it runs roughly essentials-first.
const structTypes = [
    'housing','farming','mining','industry','power','storage','science','military',
    'outpost','finance','entertainment','religion','gambling','ship','megaproject','utility'
];

// What each background reaches for first. Types a governor has no opinion on fall in behind these, in
// the order declared above; anything with no type at all comes last.
const govStructBias = {
    soldier: ['military','industry'],
    criminal: ['gambling','finance'],
    entrepreneur: ['finance','industry'],
    educator: ['science','entertainment'],
    spiritual: ['religion','farming'],
    bluecollar: ['industry','mining','housing'],
    noble: ['finance','entertainment'],
    media: ['entertainment','housing'],
    sports: ['entertainment','gambling'],
    bureaucrat: ['housing','storage','finance']
};

// Every action that owns a struct record, indexed by the "category:key" its count/razed live under —
// which is how a razed tally is turned back into something queueable. The action registry is static,
// so this is built once. Keyed by category as well as name because the same struct name exists in more
// than one place (Titan's g_factory and Alpha Centauri's are different buildings).
let repairIndex = false;
function repairTargets(){
    if (repairIndex){ return repairIndex; }
    repairIndex = {};
    Object.keys(repairRegions).forEach(function(cat){
        if (!actions[cat]){ return; }
        Object.keys(actions[cat]).forEach(function(region){
            // city is a flat map of actions; every other category nests them under regions.
            let group = cat === 'city' ? { [region]: actions[cat][region] } : actions[cat][region];
            if (!group || typeof group !== 'object'){ return; }
            Object.keys(group).forEach(function(key){
                let c_action = group[key];
                if (!c_action || typeof c_action.struct !== 'function' || !c_action['id']){ return; }
                let p = c_action.struct().p;
                repairIndex[`${p[1]}:${p[0]}`] = {
                    id: c_action.id,
                    // The queue resolves an entry through actions[action][qtype], and ids are authored
                    // as "category-key", so the id's own prefix is the action the queue needs.
                    action: c_action.id.split('-')[0],
                    qtype: key,
                    // What kind of building this is, declared on the action itself.
                    kind: c_action['type'] || false,
                    region: region,
                    cat: p[1],
                    key: p[0],
                    c_action: c_action
                };
            });
        });
    });
    return repairIndex;
}

// "category:key" of each region's support structure -> the grid it backs. gridDefs is read fresh
// because it reflects live settings, and this only runs once a game day.
function supportProviders(){
    let grids = gridDefs();
    let map = {};
    Object.keys(grids).forEach(function(g){
        if (grids[g].r && grids[g].rs){ map[`${grids[g].r}:${grids[g].rs}`] = g; }
    });
    return map;
}

// Support each region currently has spare — what its provider offers less what its consumers take.
function supportHeadroom(){
    let grids = gridDefs();
    let room = {};
    Object.keys(grids).forEach(function(g){
        if (!grids[g].r || !grids[g].rs){ return; }
        let provider = global[grids[g].r] ? global[grids[g].r][grids[g].rs] : false;
        if (!provider || typeof provider['s_max'] === 'undefined'){ return; }
        room[g] = provider.s_max - provider.support;
    });
    return room;
}

// Regions where a ruin could be rebuilt but would then sit dark for want of support. powerOnNewStruct
// turns a new structure on only when `support - support() <= s_max`, so anything needing more headroom
// than the region has left is exactly what the same test would refuse.
function starvedGrids(targets,room){
    let starved = {};
    targets.forEach(function(t){
        let c = t.c_action;
        if (!c['s_type'] || typeof c.support !== 'function'){ return; }
        let need = -c.support();
        if (need <= 0 || !room.hasOwnProperty(c.s_type)){ return; }
        if (room[c.s_type] < need){ starved[c.s_type] = true; }
    });
    return starved;
}

// Regions held back until Titan is properly reoccupied. Their ruins are visible on the map long before
// they are anyone's problem, so the governor leaves them alone rather than spending the queue on a
// moon nobody has set foot on yet.
const repairHeldRegions = ['spc_titan','spc_enceladus'];

// Standing ruins the governor could act on: razed structures whose region is discovered, whose
// requirements are still met, and whose world is quiet enough to be worth rebuilding on.
function repairQueueTargets(){
    let index = repairTargets();
    let cap = repairThreatCap();
    let list = [];
    Object.keys(repairRegions).forEach(function(cat){
        if (!global[cat]){ return; }
        Object.keys(global[cat]).forEach(function(key){
            let struct = global[cat][key];
            if (!struct || typeof struct !== 'object' || !struct['razed'] || struct.razed <= 0){ return; }
            let target = index[`${cat}:${key}`];
            if (!target){ return; }
            if (repairHeldRegions.includes(target.region) && !titanReclaimed()){ return; }
            if (repairThreat(target) > cap){ return; }
            try {
                if (!repairRegions[cat].show(target.region) || !repairRegions[cat].req(target.region,target.qtype)){ return; }
            }
            catch (e){ return; }
            list.push(Object.assign({ razed: struct.razed }, target));
        });
    });
    return list;
}

// The build queue works strictly front to back: it stops at the first entry it cannot pay for, so a ruin
// that needs days of income parked at the head stalls everything behind it — a casino holding up swarm
// satellites that are affordable this instant. Split ruins into "can be paid for right now" and
// "cannot" so a slow favourite can never block a repair that would go through immediately. The test is
// checkAffordable, the same one the queue uses when it picks what to build, rather than a zero from
// timeCheck — timeCheck ignores Morale, Army, Troops, Structs and prestige costs, so a ruin gated on
// one of those reads as free. "Build Anything In Queue" makes the queue skip ahead to whatever it can
// afford, so nothing blocks and the governor's preferences rule outright.
function affordBand(target){
    return global.settings.qAny || target.afford ? 0 : 1;
}

// Cost entries checkCosts treats as a threshold to clear rather than a stockpile to spend down. They
// are re-tested unchanged for each copy in a run instead of accumulating.
const thresholdCosts = ['Custom','Structs','Bool','Morale','Army','HellArmy','Troops','Supply'];

// Price one more copy of a ruin and charge it to the pass budget, reporting whether the treasury could
// actually cover it on top of everything charged so far. Each copy costs more than the last, and the
// game expresses that through an offset handed to the cost functions (cost: { Money(offset){ … } }),
// offset being how many are already committed but not yet built — so every copy has to be re-priced
// rather than the first price simply multiplied. The budget is shared across the whole pass, so what
// one ruin claims is money (and ore, and fuel) the next can no longer count on. `force` charges even
// when it does not fit, for copies that get queued regardless of whether they can start this instant.
function chargeCopy(c_action,offset,budget,force){
    let costs = adjustCosts(c_action,{ offset: offset });
    let stock = Object.keys(costs).filter(function(res){
        return !thresholdCosts.includes(res) && !global.prestige.hasOwnProperty(res);
    });

    let cumulative = {};
    Object.keys(costs).forEach(function(res){
        let price = costs[res];
        if (!stock.includes(res)){ cumulative[res] = price; return; }
        let taken = budget[res] || 0;
        cumulative[res] = function(){ return (Number(price()) || 0) + taken; };
    });

    let fits = checkCosts(cumulative);
    if (fits || force){
        stock.forEach(function(res){
            budget[res] = (budget[res] || 0) + (Number(costs[res]()) || 0);
        });
    }
    return fits;
}

// A repair the treasury cannot reach for a quarter of an hour is not worth committing a queue slot to
// yet; the task looks again every game day and picks it up once it is closer. A governor is given more
// patience for the kinds of building they actually care about.
export const repairWaitCap = 900;           // 15 minutes
export const repairWaitCapFavoured = 3600;  // 60 minutes for a type the governor is biased toward
export const repairThreatDefault = 50000; // Default setting for rebuilding structures in danger

function repairThreat(target){
    return global.race['zhorde'] && global.race.zhorde[target.region] ? global.race.zhorde[target.region] : 0;
}

function repairThreatCap(){
    let cfg = global.race.governor['config'] && global.race.governor.config['repair']
        ? global.race.governor.config.repair : false;
    return cfg && typeof cfg.threat === 'number' && !isNaN(cfg.threat) ? cfg.threat : repairThreatDefault;
}

// Is this the sort of building the sitting governor goes out of their way for?
function govFavours(target){
    let bias = govStructBias[global.race.governor.g.bg] || [];
    return target.kind ? bias.includes(target.kind) : false;
}

// Ranks outside the ordinary type ordering, which runs from 0 up to about bias.length + structTypes.length.
const rankSupportUrgent = -1;    // nothing in the region can switch on until this is back
const rankSupportSpare = 900;    // the region already has spare support to cover what this would add
const rankUntyped = 1000;        // no type declared on the action

// Rank a ruin for the sitting governor: their preferred types first, then the remaining types in
// structTypes order, then anything with no type declared. Support structures are pulled out of that
// ordering in both directions — to the very front when the region cannot switch things on without
// them, and to the back when the region is already carrying at least as much spare support as
// rebuilding one would add, which makes it redundant for now.
function repairRank(target,starved,providers,room){
    let grid = providers[`${target.cat}:${target.key}`];
    if (grid){
        if (starved[grid]){ return rankSupportUrgent; }
        let adds = typeof target.c_action.support === 'function' ? target.c_action.support() : 0;
        if (adds > 0 && room.hasOwnProperty(grid) && room[grid] >= adds){ return rankSupportSpare; }
    }
    let bias = govStructBias[global.race.governor.g.bg] || [];
    if (!target.kind){ return rankUntyped; }
    let pref = bias.indexOf(target.kind);
    if (pref >= 0){ return pref; }
    return bias.length + structTypes.indexOf(target.kind);
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
                    if (global.resource[mat].amount > reserve + cost){
                        let build = Math.floor((global.resource[mat].amount - reserve) / cost);
                        crateGovHook('crate',build);
                    }
                }
                if (checkCityRequirements('warehouse') && global.resource.Containers.display && global.resource.Containers.amount < global.resource.Containers.max){
                    let cost = 125;
                    let reserve = global.race.governor.config.storage.cnt;
                    if (global.resource.Steel.amount > reserve + cost){
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
    combo_storage: {
        name: loc(`gov_task_combo_storage`),
        req(){
            return checkCityRequirements('storage_yard') && global.tech['container'] && global.resource.Crates.display && global.genes.governor >= 3 ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                gov_tasks.storage.task();
                gov_tasks.bal_storage.task();
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
    combo_spy: {
        name: loc(`gov_task_combo_spy`),
        req(){
            return (global.genes.governor >= 3) && gov_tasks.spyop.req();
        },
        task(){
            if ( $(this)[0].req() ){
                gov_tasks.spy.task();
                gov_tasks.spyop.task();
            }
        }
    },
    slave: { // Replace Slaves
        name(){ return loc(`gov_task_slave`,[global.resource.Slave.name]); },
        req(){
            return !global.tech['isolation'] && !global.race['orbit_decayed'] && checkCityRequirements('slave_market') && global.race['slaver'] && global.city['slave_pen'] ? true : false;
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
                if (max > global.resource.Slave.amount){
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
        name(){ return loc(`city_${hoovedRename(true)}`,[hoovedRename(false)]); },
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

            if (global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 && global.race.governor.config.trash.stab){
                stabilize_blackhole();
            }
        }
    },
    repair: { // Rebuild Ruins
        name: loc(`gov_task_repair`),
        req(){
            return global.tech['gov_repair'] && global.tech['queue'] ? true : false;
        },
        task(){
            if ( !$(this)[0].req() ){ return; }

            let targets = repairQueueTargets();
            if (targets.length === 0){ return; }

            // Price each ruin in time-to-afford. timeCheck already sees the half-price rebuild discount
            // razed structures get, and returns a negative number when a resource it needs has nothing
            // banked and no income at all. Anything that far out — unreachable, or simply further away
            // than the governor is willing to wait — is left out this pass rather than parked in the
            // queue where it would block everything behind it. The task looks again tomorrow.
            targets.forEach(function(t){
                t.wait = timeCheck(t.c_action,false,false);
                t.afford = checkAffordable(t.c_action);
            });
            targets = targets.filter(function(t){
                if (t.wait < 0){ return false; }
                return t.wait <= (govFavours(t) ? repairWaitCapFavoured : repairWaitCap);
            });
            if (targets.length === 0){ return; }

            let providers = supportProviders();
            let room = supportHeadroom();
            let starved = starvedGrids(targets,room);
            targets.sort(function(a,b){
                // Ruins that can be paid for right now go ahead of ruins that cannot, and the governor's
                // preferences order things inside each group rather than across them. Sort is stable,
                // so equal pairs keep discovery order.
                let band = affordBand(a) - affordBand(b);
                if (band !== 0){ return band; }
                let rank = repairRank(a,starved,providers,room) - repairRank(b,starved,providers,room);
                return rank !== 0 ? rank : a.wait - b.wait;
            });

            // Count slots exactly the way the build buttons do, and note what is already queued so the
            // governor never asks for more copies of something than were actually razed.
            let used = 0;
            let queued = {};
            for (let i=0; i<global.queue.queue.length; i++){
                used += Math.ceil(global.queue.queue[i].q / global.queue.queue[i].qs);
                queued[global.queue.queue[i].id] = (queued[global.queue.queue[i].id] || 0) + global.queue.queue[i].q;
            }

            // Slots are handed out first and written afterwards, so a ruin that picks up copies in more
            // than one round still lands as a single queue entry instead of being split across several.
            let want = {};
            let budget = {};
            let free = global.queue.max - used;
            let roomFor = function(target){
                let cap = target.c_action['queue_complete'] ? target.c_action.queue_complete() : Number.MAX_SAFE_INTEGER;
                return Math.min(target.razed,cap) - (queued[target.id] || 0) - (want[target.id] || 0);
            };
            let claim = function(target){
                want[target.id] = (want[target.id] || 0) + 1;
                free--;
            };
            let offsetOf = function(target){ return (queued[target.id] || 0) + (want[target.id] || 0); };

            // Breadth before depth, and anything that can be built now before anything that cannot.
            // One copy each of the repairs that can start immediately, so no single ruin swallows the
            // queue and locks the player out of it...
            for (let target of targets){
                if (free <= 0){ break; }
                if (affordBand(target) !== 0 || roomFor(target) <= 0){ continue; }
                chargeCopy(target.c_action,offsetOf(target),budget,true);
                claim(target);
            }
            // ...then top those up with the further copies the budget can genuinely cover. A second
            // dredger that will go up this instant is a better use of a slot than a first casino that
            // cannot start for days.
            for (let target of targets){
                if (free <= 0){ break; }
                if (affordBand(target) !== 0){ continue; }
                while (free > 0 && roomFor(target) > 0 && chargeCopy(target.c_action,offsetOf(target),budget,false)){
                    claim(target);
                }
            }
            // Only then line up one each of the repairs that cannot start yet, behind the quick work.
            for (let target of targets){
                if (free <= 0){ break; }
                if (affordBand(target) === 0 || roomFor(target) <= 0){ continue; }
                claim(target);
            }

            let added = false;
            for (let target of targets){
                let qty = want[target.id] || 0;
                if (qty <= 0){ continue; }
                let q_size = target.c_action['queue_size'] ? target.c_action['queue_size'] : 1;
                let label = typeof target.c_action.title === 'string' ? target.c_action.title : target.c_action.title();
                let last = global.queue.queue[global.queue.queue.length-1];
                if (global.settings.q_merge !== 'merge_never' && last && last.id === target.id){
                    last.q += q_size * qty;
                }
                else {
                    global.queue.queue.push({ id: target.id, action: target.action, type: target.qtype, label: label, cna: false, time: 0, q: q_size * qty, qs: q_size, t_max: 0, bres: false });
                }
                added = true;
            }

            if (added){ buildQueue(); }
        }
    },
    mech: { // Mech Builder
        name: loc(`gov_task_mech`),
        // Terrain applies to the entire bay at once, so a bay that all shares one chassis gets punished
        // all at once. Strict rotation keeps that from happening.
        chassisWheel: ['hover','spider','wheel','tread','biped','quad'],
        // Hardpoint damage sums rather than multiplies, so mixing weapons is free on average.
        // Some bosses are immune to a given weapon, and an unlucky single-weapon mech does nothing to them.
        // Arranged to reduce risk of bad weapon match ups.
        weaponWheel: [
            ['laser','kinetic','shotgun','missile'],
            ['kinetic','shotgun','missile','flame'],
            ['shotgun','missile','flame','plasma'],
            ['missile','flame','plasma','sonic'],
            ['flame','plasma','sonic','tesla'],
            ['plasma','sonic','tesla','laser'],
            ['sonic','tesla','laser','kinetic'],
            ['tesla','laser','kinetic','shotgun']
        ],
        // Hazards multiply together, so a mech needs a coherent set of counters rather than one of each:
        // a mech missing two counters is at a disadvantage no matter how well the rest of the bay is
        // equipped. Ordered strongest first, because smaller frames take only the leading entries.
        equipKits: [
            ['grapple','shields','coolant','seals','radiator'],
            ['infrared','ablative','stabilizer','sonar','pontoon'],
            ['sonar','coolant','shields','ablative','seals'],
            ['ablative','seals','radiator','grapple','stabilizer'],
            ['coolant','stabilizer','pontoon','infrared','shields'],
            ['stabilizer','radiator','pontoon','shields','grapple']
        ],
        // Warlord runs on a different roster, so it gets its own list. Chassis rotate strictly for the
        // same reason as the mech ones — terrain hits the whole lair at once.
        wlChassisWheel: {
            minion:     ['imp','flying_imp','hound','harpy','barghest'],
            fiend:      ['cambion','minotaur','nightmare','rakshasa','golem'],
            cyberdemon: ['hover','spider','wheel','tread','biped','quad'],
            archfiend:  ['dragon','snake','gorgon','hydra'],
        },
        // Demon attributes
        wlEquipPriority: ['athletic','darkvision','echo','stoneskin','manashield','heat','cold','lucky','thermal'],
        // Warlord requipment kits
        wlEquipKits: [
            ['athletic','manashield','heat','cold','darkvision'],
            ['echo','stoneskin','thermal','athletic','cold'],
            ['darkvision','athletic','stoneskin','heat','lucky'],
            ['heat','echo','manashield','cold','thermal'],
            ['stoneskin','thermal','manashield','athletic','echo'],
            ['cold','darkvision','echo','lucky','heat'],
        ],
        // A cyberdemon equips from the standard list, so it reuses the mech kits — minus pontoons, which
        // validEquipment does not offer under warlord.
        wlCyberKits: [
            ['sonar','infrared','grapple','stabilizer','shields'],
            ['radiator','coolant','shields','ablative','grapple'],
            ['grapple','infrared','shields','seals','stabilizer'],
            ['sonar','radiator','stabilizer','ablative','coolant'],
            ['coolant','grapple','shields','seals','infrared'],
            ['infrared','sonar','coolant','radiator','ablative'],
        ],
        // Hardpoints a demon frame actually fields.
        wlHardpoints(size,chassis){
            if (size === 'archfiend'){ return chassis === 'hydra' ? 4 : 2; }
            if (size === 'cyberdemon'){ return 2; }
            return 1;
        },
        // Total equipment slots on a demon
        wlSlots(size){
            return wlEquipSlots(size);
        },
        // Ranked equipment list
        equipPriority: ['grapple','infrared','sonar','shields','ablative','coolant','seals','stabilizer','radiator','pontoon'],
        // General equipment slots
        equipSlots(size){
            return mechGeneralSlots(size);
        },
        req(){
            return global.stats.achieve.hasOwnProperty('corrupted') && global.stats.achieve.corrupted.l > 0 && checkHellRequirements('prtl_spire','mechbay') && global.portal.hasOwnProperty('mechbay') ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                let ctype = global.race['warlord'] ? 'cyberdemon' : 'large';
                let mCosts = mechCost(ctype,false);
                let cost = mCosts.c;
                let soul = mCosts.s;
                let size = mechSize(ctype);

                let mechs = {
                    type: {}
                };

                let sizeTypes = global.race['warlord'] ? ['minion','fiend','cyberdemon','archfiend'] : ['small','medium','large','titan','collector'];
                let chassisTypes = global.race['warlord'] ? ['imp','flying_imp','hound','harpy','barghest','cambion','minotaur','nightmare','rakshasa','golem','hover','spider','wheel','tread','biped','quad','dragon','snake','gorgon','hydra'] : ['hover','spider','wheel','tread','biped','quad'];
                let weaponTypes = global.race['warlord'] ? ['laser','kinetic','shotgun','missile','flame','plasma','sonic','tesla','claws','venom','cold','shock','fire','acid','stone','iron','flesh','ice','magma','axe','hammer'] : ['plasma','laser','kinetic','shotgun','missile','flame','sonic','tesla'];
                let equipTypes = global.race['warlord'] ? ['shields','flare','seals','grapple','sonar','ablative','radiator','infrared','coolant','stabilizer','scavenger','scouter','darkvision','echo','thermal','manashield','cold','heat','athletic','lucky','stoneskin'] : ['shields','flare','seals','grapple','sonar','ablative','radiator','infrared','coolant','stabilizer'];
                sizeTypes.forEach(function(type){
                    mechs.type[type] = 0;
                    mechs[type] = {
                        chassis: {},
                        weapon: {},
                        equip: {}
                    };
                    chassisTypes.forEach(function(chassis){
                        mechs[type].chassis[chassis] = 0;
                    });
                    weaponTypes.map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value).forEach(function(weapon){
                        mechs[type].weapon[weapon] = 0;
                    });
                    equipTypes.forEach(function(equip){
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

                if (global.race['warlord']){
                    let bayMax = global.portal.mechbay.max;
                    let share = s => (mechs.type[s] || 0) * mechSize(s) / bayMax;
                    if (share('minion') < 0.07){
                        ctype = 'minion';
                    }
                    else if (mechSize('archfiend') <= bayMax && share('archfiend') < 0.80){
                        ctype = 'archfiend';
                    }
                    else if (share('cyberdemon') < 0.09){
                        ctype = 'cyberdemon';
                    }
                    else if (share('fiend') < 0.04){
                        ctype = 'fiend';
                    }
                    else {
                        ctype = mechSize('archfiend') <= bayMax ? 'archfiend' : 'cyberdemon';
                    }

                    // Never strand lair space on the last few slots.
                    let free = bayMax - global.portal.mechbay.bay;
                    if (mechSize(ctype) > free){
                        for (let alt of ['archfiend','cyberdemon','fiend','minion']){
                            if (mechSize(alt) <= free){
                                ctype = alt;
                                break;
                            }
                        }
                    }

                    mCosts = mechCost(ctype,false);
                    cost = mCosts.c;
                    soul = mCosts.s;
                    size = mechSize(ctype);
                }
                else {
                    let bayMax = global.portal.mechbay.max;
                    let free = bayMax - global.portal.mechbay.bay;
                    let titanCost = mechCost('titan',false);
                    let titanReady = mechSize('titan') <= bayMax && titanCost.c <= global.portal.purifier.sup_max;

                    if (titanReady){
                        let share = s => (mechs.type[s] || 0) * mechSize(s) / bayMax;
                        if (mechs.type.titan >= 2 && share('small') < 0.07){
                            ctype = 'small';
                        }
                        else if (share('titan') < 0.70){
                            ctype = 'titan';
                        }
                        else if (share('large') < 0.15){
                            ctype = 'large';
                        }
                        else if (share('medium') < 0.08){
                            ctype = 'medium';
                        }
                        else {
                            ctype = 'titan';
                        }
                    }
                    else if (mechSize('large') <= bayMax){
                        ctype = 'large';
                    }
                    else {
                        ctype = 'medium';
                    }

                    if (mechSize(ctype) > free){
                        for (let alt of ['titan','large','medium','small']){
                            if (mechSize(alt) <= free){
                                ctype = alt;
                                break;
                            }
                        }
                    }

                    mCosts = mechCost(ctype,false);
                    cost = mCosts.c;
                    soul = mCosts.s;
                    size = mechSize(ctype);
                }

                let avail = global.portal.mechbay.max - global.portal.mechbay.bay;
                if (avail < size && global.blood['prepared'] && global.blood.prepared >= 3){
                    if (global.queue.queue.some(q => ['portal-purifier','portal-port','portal-base_camp','portal-mechbay','portal-waygate','portal-bazaar'].includes(q.id))){
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

                                // Top an upgraded mech up to whatever its frame can carry. 
                                if (pattern.equip.length < 1 + mechGeneralSlots(pattern.size)){
                                    // The free slot goes to the most valuable counter this mech is still missing
                                    let equip = '???';
                                    $(this)[0].equipPriority.forEach(function(val){
                                        if (equip === '???' && !pattern.equip.includes(val)){
                                            equip = val;
                                        }
                                    });
                                    if (equip === '???'){
                                        Object.keys(mechs[ctype].equip).forEach(function(val){
                                            if (!pattern.equip.includes(val) && (equip === '???' || mechs[ctype].equip[val] < mechs[ctype].equip[equip])){
                                                equip = val;
                                            }
                                        });
                                    }
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
                    let chassis = 'hover';
                    let weapons = ctype === 'titan' ? ['???','???','???','???'] : ['???','???'];
                    let equipment = [];

                    if (global.race['warlord']){
                        let built = global.portal.mechbay.mechs.length;
                        let cList = $(this)[0].wlChassisWheel[ctype] || ['imp'];
                        chassis = cList[built % cList.length];
                    
                        let points = $(this)[0].wlHardpoints(ctype,chassis);
                        weapons = [];
                        for (let p=0; p<points; p++){
                            // Every archfiend hardpoint past the first draws from the elemental pool, and a hydra's
                            // four are locked one per slot, so the pool has to be asked for per point, not once.
                            let pool = validWeapons(ctype,chassis,ctype === 'archfiend' ? p : 0);
                            let pick = pool[(built + p) % pool.length];
                            if (weapons.includes(pick) && pool.length > 1){
                                pick = pool.find(w => !weapons.includes(w)) || pick;
                            }
                            weapons.push(pick);
                        }
                    
                        let slots = $(this)[0].wlSlots(ctype);
                        if (ctype === 'minion'){
                            // Slot zero is the minion's job and takes nothing else. A minion already counts as a
                            // scout just by existing, so this only chooses between doubling that and earning
                            // supply — scavengers fund the lair early, scouting is worth more once it is funded.
                            // Any slot past the first is a real attribute, which the job slot will not accept.
                            equipment = [(mechs.minion.equip.scavenger || 0) < 16 ? 'scavenger' : 'scouter'];
                            if (slots > 1){
                                let kits = $(this)[0].wlEquipKits;
                                equipment = equipment.concat(kits[(built + Math.floor(built / kits.length)) % kits.length].slice(0,slots - 1));
                            }
                        }
                        else if (ctype === 'cyberdemon'){
                            // The battery occupies one of the slots rather than sitting outside the count.
                            let kits = $(this)[0].wlCyberKits;
                            equipment = ['special'].concat(kits[(built + Math.floor(built / kits.length)) % kits.length].slice(0,slots - 1));
                        }
                        else {
                            let kits = $(this)[0].wlEquipKits;
                            equipment = kits[(built + Math.floor(built / kits.length)) % kits.length].slice(0,slots);
                        }
                    }
                    else {
                        // Everything below comes off a rotation rather than being picked one item at a
                        // time by whatever is currently rarest. 
                        let built = global.portal.mechbay.mechs.length;
                        let wheels = $(this)[0].chassisWheel;
                        let kits = $(this)[0].equipKits;

                        chassis = wheels[built % wheels.length];

                        let weaponSet = $(this)[0].weaponWheel[built % $(this)[0].weaponWheel.length];
                        let wCap = ctype === 'titan' ? 4 : (ctype === 'large' || ctype === 'medium' ? 2 : 1);
                        weapons = weaponSet.slice(0,wCap);

                        // Offset the kit against the chassis so the two wheels do not lock together and
                        // leave one chassis forever carrying the same kit.
                        let kit = kits[(built + Math.floor(built / kits.length)) % kits.length];
                        // Every frame now carries the special mount for free, including a small with no
                        // general slots at all.
                        let eCap = $(this)[0].equipSlots(ctype);
                        equipment = ['special'].concat(kit.slice(0,eCap));
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
            let blacklist = ['Asphodel_Powder', 'Elysanite'];
            if (global.race['fasting']){
                blacklist.push('Food');
            }
            if (global.race['iceage']){
                blacklist.push('Lumber');
            }

            // How many lines the scheduler is responsible for. The second one only counts once the dual
            // upgrade is in and the player has actually given it a share of the power — leaving the split
            // at 100/0 is a deliberate "off", and reassigning an idle line would just churn the display.
            let lines = dualReplicator() && global.race.replicator.ratio < 100 ? 2 : 1;
            let picks = [];

            for (let idx = 0; global.race.governor.config.replicate.res.que && idx < global.queue.queue.length; idx++){
                let struct = decodeStructId(global.queue.queue[idx].id);
                let tc = false;
                if (global.queue.queue[idx].action === 'arpa'){
                    let remain = (100 - global.arpa[struct.a].complete) / 100;
                    let c_action = actions.arpa[struct.a];
                    tc = arpaTimeCheck(c_action,remain,false,true);
                }
                else if (global.queue.queue[idx].action === 'tp-ship'){
                    let raw = shipCosts(global.queue.queue[idx].type);
                    let costs = {};
                    Object.keys(raw).forEach(function(res){
                        costs[res] = function(){ return raw[res]; }
                    });
                    let c_action = { cost: costs };
                    tc = timeCheck(c_action,false,true);
                }
                else if (global.queue.queue[idx].action === 'hell-mech'){
                    let costs = mechCost(global.queue.queue[idx].type.size,global.queue.queue[idx].type.infernal,true);
                    let c_action = { cost: costs };
                    tc = timeCheck(c_action,false,true);
                }
                else {
                    tc = timeCheck(struct.a,false,true);
                }
                // A single queued build usually wants several materials, so one entry can fill both lines.
                // Never the same resource twice — two lines on one material is just a slower single line.
                let resSorted = Object.keys(tc.s).sort(function(a,b){return tc.s[b]-tc.s[a]});
                for (let i=0; i<resSorted.length && picks.length < lines; i++){
                    if (global.resource[resSorted[i]] && global.resource[resSorted[i]].display && atomic_mass[resSorted[i]] && !blacklist.includes(resSorted[i]) && !picks.includes(resSorted[i])){
                        picks.push(resSorted[i]);
                        rBal = true;
                    }
                }
                if (picks.length >= lines || !global.settings.qAny){
                    break;
                }
            }

            // Anything the queue did not account for falls back to the balancing rules, which are applied
            // per line against what is already spoken for.
            if (picks.length < lines){
                let resSorted = Object.keys(atomic_mass).sort(function(a,b){return global.resource[a].diff-global.resource[b].diff});
                resSorted = resSorted.filter(item => global.resource[item] && global.resource[item].display && !blacklist.includes(item));

                let fields = ['res','res2'];
                for (let l = picks.length; l < lines; l++){
                    let cur = global.race.replicator[fields[l]];
                    let free = resSorted.filter(item => !picks.includes(item));
                    let pick = null;

                    if (global.race.governor.config.replicate.res.neg && free[0] && global.resource[free[0]].diff < 0 && ((global.resource[free[0]].amount <= global.resource[free[0]].max * 0.95) || global.resource[free[0]].max === -1)){
                        pick = free[0];
                    }
                    else if (global.resource[cur] && global.resource[cur].max !== -1 && global.race.governor.config.replicate.res.cap && global.resource[cur].amount >= global.resource[cur].max){
                        let cappable = free.filter(item => global.resource[item].max > 0);
                        for (let i=0; i<cappable.length; i++){
                            if (global.resource[cappable[i]].amount < global.resource[cappable[i]].max){
                                pick = cappable[i];
                                break;
                            }
                        }
                        if (!pick){
                            let uncappable = free.filter(item => global.resource[item].max === -1);
                            if (uncappable.length > 0){
                                pick = uncappable[0];
                            }
                        }
                    }

                    // Nothing to change for this line: keep what it already has, but reserve it so the
                    // other line does not pick the same thing.
                    picks.push(pick ? pick : cur);
                }
            }

            ['res','res2'].slice(0,lines).forEach(function(field,i){
                if (picks[i]){
                    global.race.replicator[field] = picks[i];
                }
            });
        }
    },
    hunt: { // Aberrant Hunter
        name: loc(`gov_task_hunt`),
        req(){
            return true;
            return (global.stats.achieve.hasOwnProperty('living_extinction') && global.stats.achieve.living_extinction.l > 0 ||
                global.stats.achieve.hasOwnProperty('back_on_track') && global.stats.achieve.back_on_track.l > 0) &&
                (global.tech['ecosystem_genetics'] >= 4 || global.underground['cave_arena_perk']?.count);
        },
        task(){
            if($(this)[0].req()){
                let available = ['herbivores', 'carnivores', 'scavengers'].filter(s => {
                    return global.aberrants?.[s].count && global.race.governor.config.hunter[s].on &&
                        garrisonSize() >= global.race.governor.config.hunter[s].soldiers &&
                        global.civic.garrison.wounded <= global.race.governor.config.hunter[s].injuries
                });
                let target = available[Math.rand(0, available.length)];
                if(target){
                    actions.surface.ecosystem[`aberrant_${target}`].action();
                }
            }
        }
    }
};
