import { global, p_on } from './vars.js';
import { vBind, popover, tagEvent, clearElement } from './functions.js';
import { races } from './races.js';
import { actions, checkCityRequirements, housingLabel, wardenLabel } from './actions.js';
import { govCivics } from './civics.js';
import { crateGovHook } from './resources.js';
import { checkHellRequirements, mechSize, drawMechList } from './portal.js';
import { loc } from './locale.js';

const gmen = {
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

const gov_traits = {
    tactician: {
        name: loc(`gov_trait_tactician`),
        effect(){ return loc(`gov_trait_tactician_effect`,[$(this)[0].vars[0]]); },
        vars: [5]
    },
    militant: {
        name: loc(`gov_trait_militant`),
        effect(){ return loc(`gov_trait_militant_effect`,[$(this)[0].vars[0],$(this)[0].vars[1]]); },
        vars: [25,10]
    },
    noquestions: {
        name: loc(`gov_trait_noquestions`),
        effect(){ return loc(`gov_trait_noquestions_effect`,[$(this)[0].vars[0]]); },
        vars: [0.005]
    },
    racketeer: {
        name: loc(`gov_trait_racketeer`),
        effect(){ return loc(`gov_trait_racketeer_effect`,[$(this)[0].vars[0],$(this)[0].vars[1]]); },
        vars: [20,35]
    },
    dealmaker: {
        name: loc(`gov_trait_dealmaker`),
        effect(){ return loc(`gov_trait_dealmaker_effect`,[$(this)[0].vars[0]]); },
        vars: [40]
    },
    risktaker: {
        name: loc(`gov_trait_risktaker`),
        effect(){ return loc(`gov_trait_risktaker_effect`,[$(this)[0].vars[0]]); },
        vars: [10]
    },
    teacher: {
        name: loc(`gov_trait_teacher`),
        effect(){ return loc(`gov_trait_teacher_effect`,[$(this)[0].vars[0]]); },
        vars: [5]
    },
    theorist: {
        name: loc(`gov_trait_theorist`),
        effect(){ return loc(`gov_trait_theorist_effect`,[$(this)[0].vars[0],$(this)[0].vars[1]]); },
        vars: [50,4]
    },
    inspirational: {
        name: loc(`gov_trait_inspirational`),
        effect(){ return loc(`gov_trait_inspirational_effect`,[$(this)[0].vars[0]]); },
        vars: [10]
    },
    pious: {
        name: loc(`gov_trait_pious`),
        effect(){
            let val = $(this)[0].vars[1];
            let xeno = global.tech['monument'] && global.tech.monument >= 3 && p_on['s_gate'] ? 3 : 1;
            val = (global.civic.govern.type === 'corpocracy' ? (val * 2) : val) * xeno;
            return loc(`gov_trait_pious_effect`,[$(this)[0].vars[0],val]);
        },
        vars: [10,2]
    },
    pragmatist: {
        name: loc(`gov_trait_pragmatist`),
        effect(){ return loc(`gov_trait_pragmatist_effect`,[$(this)[0].vars[0],$(this)[0].vars[1]]); },
        vars: [50,2]
    },
    dirty_jobs: {
        name: loc(`gov_trait_dirty_jobs`),
        effect(){ return loc(`gov_trait_dirty_jobs_effect`,[$(this)[0].vars[0]]); },
        vars: [0.015]
    },
    extravagant: {
        name: loc(`gov_trait_extravagant`),
        effect(){ return loc(`gov_trait_extravagant_effect`,[$(this)[0].vars[0],housingLabel('large',true),$(this)[0].vars[1],$(this)[0].vars[2]+5]); },
        vars: [10,1.25,1]
    },
    aristocrat: {
        name: loc(`gov_trait_aristocrat`),
        effect(){ return loc(`gov_trait_aristocrat_effect`,[$(this)[0].vars[0],$(this)[0].vars[1],$(this)[0].vars[2]]); },
        vars: [50,10,10]
    },
    gaslighter: {
        name: loc(`gov_trait_gaslighter`),
        effect(){
            return loc(`gov_trait_gaslighter_effect`,[$(this)[0].vars[0],wardenLabel(),$(this)[0].vars[1],$(this)[0].vars[2]]);
        },
        vars: [0.5,0.75,0.5]
    },
    muckraker: {
        name: loc(`gov_trait_muckraker`),
        effect(){
            return loc(`gov_trait_muckraker_effect`,[$(this)[0].vars[1],$(this)[0].vars[2]]);
        },
        vars: [8,10,3]
    },
    athleticism: {
        name: loc(`gov_trait_athleticism`),
        effect(){ return loc(`gov_trait_athleticism_effect`,[$(this)[0].vars[0],$(this)[0].vars[1],$(this)[0].vars[2],wardenLabel()]); },
        vars: [1.5,2,4]
    },
    nopain: {
        name: loc(`gov_trait_nopain`),
        effect(){ return loc(`gov_trait_nopain_effect`,[$(this)[0].vars[0],$(this)[0].vars[1]]); },
        vars: [50,10]
    },
    organizer: {
        name: loc(`gov_trait_organizer`),
        effect(){ return loc(`gov_trait_organizer_effect`,[$(this)[0].vars[0]]); },
        vars: [1]
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
    angelic: ['Lightbringer','Illuminous','Sparks','Chrub','Halo','Star','Pompous','Radiant','Fluffy','Fabio']
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
        let name = nameList.splice(nameIdx,1)[0];

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
        if (govActive('organizer',0)){ cnt.push(3); }
        cnt.forEach(function(n){
            if (gov_tasks[global.race.governor.tasks[`t${n}`]] && gov_tasks[global.race.governor.tasks[`t${n}`]].req()){
                gov_tasks[global.race.governor.tasks[`t${n}`]].task()
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

function drawnGovernOffice(){
    let govern = $(`<div id="govOffice"><div class="has-text-caution">${loc(`governor_office`,[global.race.governor.g.n])}</div></div>`);
    $('#r_govern1').append(govern);

    govern.append($(`<div><span class="has-text-warning">${loc(`governor_background`)}:</span> <span class="bg">${gmen[global.race.governor.g.bg].name}</span><div>`));

    let cnt = [0,1,2];
    if (govActive('organizer',0)){ cnt.push(3); }
    cnt.forEach(function(num){
        let options = `<b-dropdown-item v-on:click="setTask('none',${num})">{{ 'none' | label }}</b-dropdown-item>`;
        Object.keys(gov_tasks).forEach(function(task){
            if (gov_tasks[task].req()){
                options += `<b-dropdown-item v-on:click="setTask('${task}',${num})">{{ '${task}' | label }}</b-dropdown-item>`;
            }
        });

        govern.append(`<div class="govTask"><span>${loc(`gov_task`,[num+1])}</span><b-dropdown hoverable>
            <button class="button is-primary" slot="trigger">
                <span>{{ t${num} | label }}</span>
                <i class="fas fa-sort-down"></i>
            </button>
            ${options}
        </b-dropdown></div>`);
    });

    vBind({
        el: '#govOffice',
        data: global.race.governor.tasks,
        methods: {
            setTask(t,n){
                global.race.governor.tasks[`t${n}`] = t;
            }
        },
        filters: {
            label(t){
                return loc(`gov_task_${t}`);
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
                        t0: 'none', t1: 'none', t2: 'none', t3: 'none'
                    };
                    defineGovernor();
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
        return gmen[global.race.governor.g.bg].traits[trait] ? gov_traits[trait].vars[val] : false;
    }
    return false;
}

const gov_tasks = {
    tax: { // Dynamic Taxes
        name: loc(`gov_task_tax`),
        req(){
            return global.tech['currency'] && global.tech.currency >= 3 && global.civic.taxes.display ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                let max = govCivics('tax_cap',false);
                if (global.city.morale.current < 100 && global.civic.taxes.tax_rate > (global.civic.govern.type === 'oligarchy' ? 45 : 25)){
                    while (global.city.morale.current < 100 && global.civic.taxes.tax_rate > (global.civic.govern.type === 'oligarchy' ? 45 : 25)){
                        govCivics('adj_tax','sub');
                    }
                }
                else if (global.city.morale.potential > global.city.morale.cap + 1 && global.civic.taxes.tax_rate < max){
                    govCivics('adj_tax','add');
                }
                else if (global.city.morale.current < global.city.morale.cap + 1 && global.civic.taxes.tax_rate > 20){
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
                    let reserve = global.resource[mat].max === -1 ? 1000 : global.resource[mat].max / 2;
                    if (reserve > 100000){ reserve = 100000; }
                    if (global.resource[mat].amount + cost > reserve){
                        let build = Math.floor((global.resource[mat].amount - reserve) / cost);
                        crateGovHook('crate',build);
                    }
                }
                if (checkCityRequirements('warehouse') && global.resource.Containers.display && global.resource.Containers.amount < global.resource.Containers.max){
                    let cost = 125;
                    let reserve = global.resource.Steel.max / 2;
                    if (reserve > 100000){ reserve = 100000; }
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
                let containers = global.resource.Containers.amount;
                let active = 0;
                
                Object.keys(global.resource).forEach(function(res){
                    if (global.resource[res].display && global.resource[res].stackable){
                        crates += global.resource[res].crates;
                        containers += global.resource[res].containers;
                        active++;
                    }
                });

                let crateSet = Math.floor(crates / active);
                let containerSet = Math.floor(containers / active);

                let dist = {
                    Food: { m: 0.1, cap: 100 },
                    Coal: { m: 0.25 },
                    Stanene: { m: 2, check(){ return global.tech['science'] && global.tech.science >= 19 ? true : false; } },
                };

                Object.keys(dist).forEach(function(r){
                    if (global.resource[r].display){
                        if (!dist[r].hasOwnProperty('check') || dist[r].check()){
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
                    }
                });

                crateSet = Math.floor(crates / active);
                containerSet = Math.floor(containers / active);

                let crtRemain = crates - (crateSet * active);
                let cntRemain = containers - (containerSet * active);

                Object.keys(global.resource).forEach(function(res){
                    if (Object.keys(dist).includes(res)){
                        if (!dist[res].hasOwnProperty('check') || dist[res].check()){
                            return;
                        }
                    }
                    if (global.resource[res].display && global.resource[res].stackable){
                        global.resource[res].crates = crateSet;
                        if (global.resource.Containers.display){
                            global.resource[res].containers = containerSet;
                        }
                        if (crtRemain > 0){
                            global.resource[res].crates++;
                            crtRemain--;
                        }
                        if (cntRemain > 0){
                            global.resource[res].containers++;
                            cntRemain--;
                        }
                    }
                });
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
                while (global.civic.garrison.max > global.civic.garrison.workers + 1 && global.resource.Money.amount + govCivics('m_cost') + global.resource.Money.diff >= global.resource.Money.max){
                    govCivics('m_buy');
                }
            }
        }
    },
    spy: { // Spy Recruiter
        name: loc(`gov_task_spy`),
        req(){
            return global.tech['spy'] && !global.tech['world_control'] ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                for (let i=0; i<3; i++){
                    let cost = govCivics('s_cost',i);
                    if (!global.civic.foreign[`gov${i}`].anx && !global.civic.foreign[`gov${i}`].buy && !global.civic.foreign[`gov${i}`].occ && global.civic.foreign[`gov${i}`].trn === 0 && global.resource.Money.amount + cost + global.resource.Money.diff >= global.resource.Money.max){
                        govCivics('t_spy',i);
                    }
                }
            }
        }
    },
    spyop: { // Spy Operator
        name: loc(`gov_task_spyop`),
        req(){
            return global.tech['spy'] && global.tech.spy >= 2 && !global.tech['world_control'] ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                [0,1,2].forEach(function(gov){
                    if (global.civic.foreign[`gov${gov}`].sab === 0 && global.civic.foreign[`gov${gov}`].spy > 0){
                        if (global.civic.foreign[`gov${gov}`].mil > 50){
                            govCivics('s_sabotage',gov)
                        }
                        else if (global.civic.foreign[`gov${gov}`].unrest < 100 && global.civic.foreign[`gov${gov}`].spy > 2){
                            govCivics('s_incite',gov)
                        }
                        else if (global.civic.foreign[`gov${gov}`].hstl > 0 && global.civic.foreign[`gov${gov}`].spy > 1){
                            govCivics('s_influence',gov)
                        }
                    }
                });
            }
        }
    },
    slave: { // Replace Slaves
        name: loc(`gov_task_slave`),
        req(){
            return checkCityRequirements('slave_market') && global.race['slaver'] && global.city['slave_pen'] ? true : false;
        },
        task(){
            if ( $(this)[0].req() && global.resource.Money.amount + 25000 + global.resource.Money.diff >= global.resource.Money.max ){
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
                actions.city.s_alter.action();
            }
        }
    },
    mech: { // Mech Builder
        name: loc(`gov_task_mech`),
        req(){
            return checkHellRequirements('prtl_spire','mechbay') && global.portal.hasOwnProperty('mechbay') ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                let cost = 375000;
                let size = mechSize('large');
                let soul = 25;
                let ctype = 'large';

                let mechs = {
                    type: {},
                    chassis: {},
                    weapon: {},
                    equip: {}
                };

                ['hover','spider','wheel','tread','biped','quad'].forEach(function(chassis){
                    mechs.chassis[chassis] = 0;
                });
                ['small','medium','large','titan'].forEach(function(type){
                    mechs.type[type] = 0;
                });
                ['plasma','laser','kinetic','shotgun','missile','flame','sonic','tesla'].map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value).forEach(function(weapon){
                    mechs.weapon[weapon] = 0;
                });
                ['shields','flare','seals','grapple','sonar','ablative','radiator','infrared','coolant','stabilizer',].forEach(function(equip){
                    mechs.equip[equip] = 0;
                });

                global.portal.mechbay.mechs.forEach(function(mech){
                    mechs.type[mech.size]++;
                    mechs.chassis[mech.chassis]++;
                    mech.hardpoint.forEach(function(wep){
                        mechs.weapon[wep]++;
                    });
                    mech.equip.forEach(function(equip){
                        mechs.equip[equip]++;
                    });
                });

                if (mechs.type.large >= 12 && mechs.type.medium < 18){
                    cost = 180000;
                    size = mechSize('medium');
                    soul = 5;
                    ctype = 'medium';
                }

                let avail = global.portal.mechbay.max - global.portal.mechbay.bay;
                if (global.portal.purifier.supply >= cost && avail >= size && global.resource.Soul_Gem.amount >= soul){
                    let c_val = 99;
                    let chassis = 'hover';
                    Object.keys(mechs.chassis).forEach(function(val){
                        if (mechs.chassis[val] < c_val){
                            c_val = mechs.chassis[val];
                            chassis = val;
                        }
                    });
                    let weapons = ['???','???'];
                    for (let i=0; i<2; i++){
                        Object.keys(mechs.weapon).forEach(function(val){
                            if (weapons[i] === '???' || mechs.weapon[val] < mechs.weapon[weapons[i]]){
                                if (!weapons.includes(val)){
                                    weapons[i] = val;
                                }
                            }
                        });
                    }
                    let equip = ['???','???','???'];
                    for (let i=0; i<3; i++){
                        Object.keys(mechs.equip).forEach(function(val){
                            if (equip[i] === '???' || mechs.equip[val] < mechs.equip[equip[i]]){
                                if (!equip.includes(val)){
                                    equip[i] = val;
                                }
                            }
                        });
                    }

                    let equipment = global.blood['prepared'] ? equip : [equip[0],equip[1]];
                    if (ctype === 'medium'){
                        weapons = [weapons[0]];
                        equipment = global.blood['prepared'] ? [equip[0],equip[1]] : [equip[0]];
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
                    drawMechList();
                }
            }
        }
    },
};