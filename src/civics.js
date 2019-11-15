import { global, vues, poppers, messageQueue, clearStates, modRes, save, keyMultiplier, resizeGame } from './vars.js';
import { challenge_multiplier, timeFormat } from './functions.js';
import { unlockAchieve, unlockFeat, checkAchievements } from './achieve.js';
import { races, racialTrait } from './races.js';
import { loc } from './locale.js';

// Sets up government in civics tab
export function defineGovernment(){
    var govern = $('<div id="government" class="government tile is-child"></div>');
    govern.append($(`<div class="header" v-show="display"><h2 class="has-text-warning">${loc('civics_government')}</h2></div>`));
    $('#r_civics').append(govern);
    
    if (!global.civic['taxes']){
        global.civic['taxes'] = {
            tax_rate: 20,
            display: false
        };
    }

    vues['gov_header'] = new Vue({
        data: global.civic['taxes']
    });
    vues['gov_header'].$mount('#government .header');
    
    taxRates(govern);
}

// Sets up garrison in civics tab
export function defineGarrison(){
    var garrison = $('<div id="garrison" v-show="display" class="garrison tile is-child"></div>');
    $('#r_civics').append(garrison);
    
    buildGarrison(garrison);
    defineMad();
}

export function buildQueue(){
    $('#buildQueue').empty();
    $('#buildQueue').append($('<h2 class="has-text-success is-sr-only">Building Queue</h2>'));

    let queue = $(`<ul class="buildList"></ul>`);
    $('#buildQueue').append(queue);

    queue.append($(`<li v-for="(item, index) in queue"><a class="queued" v-bind:class="{ 'has-text-danger': item.cna, 'qany': item.qa }" @click="remove(index)">{{ item.label }} [{{ item.time | time }}]</a></li>`));

    try {
        vues['builld_queue'] = new Vue({
            el: '#buildQueue',
            data: global.queue,
            methods: {
                remove(index){
                    global.queue.queue.splice(index,1);
                }
            },
            filters: {
                time(time){
                    return timeFormat(time);
                }
            }
        });
        dragQueue();
    }
    catch {
        global.queue.queue = [];
    }
}

function taxRates(govern){
    var tax_rates = $('<div id="tax_rates" v-show="display" class="taxRate"></div>');
    govern.append(tax_rates);
    
    var label = $(`<h3 id="taxRateLabel">${loc('civics_tax_rates')}</h3>`);
    tax_rates.append(label);
    
    var tax_level = $('<span class="current">{{ tax_rate | tax_level }}</span>');
    var sub = $(`<span role="button" aria-label="decrease taxes" class="sub has-text-success" @click="sub">&laquo;</span>`);
    var add = $(`<span role="button" aria-label="increase taxes" class="add has-text-danger" @click="add">&raquo;</span>`);
    tax_rates.append(sub);
    tax_rates.append(tax_level);
    tax_rates.append(add);
    
    vues['civ_taxes'] = new Vue({
        data: global.civic['taxes'],
        filters: {
            tax_level(rate){
                return `${rate}%`;
            }
        },
        methods: {
            add(){
                let inc = keyMultiplier();
                let extreme = global.tech['currency'] && global.tech['currency'] >= 5 ? true : false;
                if (global.race['noble']){
                    global.civic.taxes.tax_rate += inc;
                    if (global.civic.taxes.tax_rate > 20){
                        global.civic.taxes.tax_rate = 20;
                    }
                }
                else if ((extreme || global.race['terrifying']) && global.civic.taxes.tax_rate < 50){
                    global.civic.taxes.tax_rate += inc;
                    if (global.civic.taxes.tax_rate > 50){
                        global.civic.taxes.tax_rate = 50;
                    }
                }
                else if (global.civic.taxes.tax_rate < 30){
                    global.civic.taxes.tax_rate += inc;
                    if (global.civic.taxes.tax_rate > 30){
                        global.civic.taxes.tax_rate = 30;
                    }
                }
            },
            sub(){
                let dec = keyMultiplier();
                let extreme = global.tech['currency'] && global.tech['currency'] >= 5 ? true : false;
                if (global.race['noble']){
                    global.civic.taxes.tax_rate -= dec;
                    if (global.civic.taxes.tax_rate < 10){
                        global.civic.taxes.tax_rate = 10;
                    }
                }
                else if ((extreme || global.race['terrifying']) && global.civic.taxes.tax_rate > 0){
                    global.civic.taxes.tax_rate -= dec;
                    if (global.civic.taxes.tax_rate < 0){
                        global.civic.taxes.tax_rate = 0;
                    }
                }
                else if (global.civic.taxes.tax_rate > 10){
                    global.civic.taxes.tax_rate -= dec;
                    if (global.civic.taxes.tax_rate < 10){
                        global.civic.taxes.tax_rate = 10;
                    }
                }
            }
        }
    });
    vues['civ_taxes'].$mount('#tax_rates');
    
    $('#taxRateLabel').on('mouseover',function(){
            var popper = $(`<div id="popTaxRate" class="popper has-background-light has-text-dark">${loc('civics_tax_rates_desc')}</div>`);
            $('#main').append(popper);
            popper.show();
            poppers['popTaxRate'] = new Popper($('#taxRateLabel'),popper);
        });
    $('#taxRateLabel').on('mouseout',function(){
            $('#popTaxRate').hide();
            poppers['popTaxRate'].destroy();
            $('#popTaxRate').remove();
        });
}

export function buildGarrison(garrison){
    if (global.tech['world_control']){
        garrison.append($(`<div class="header"><h2 class="has-text-warning">${loc('civics_garrison')}</h2> - <span class="has-text-success">Rating <b-tooltip :label="defense()" position="is-bottom" animated>{{ workers | hell | rating }}</b-tooltip></div>`));
    }
    else {
        garrison.append($(`<div class="header"><h2 class="has-text-warning">${loc('civics_garrison')}</h2> - <span class="has-text-success">Rating <b-tooltip :label="defense()" position="is-bottom" animated>{{ workers | hell | rating }}</b-tooltip> / <b-tooltip :label="offense()" position="is-bottom" animated>{{ raid | rating }}</b-tooltip></span></div>`));
    }

    var barracks = $('<div class="columns is-mobile bunk"></div>');
    garrison.append(barracks);

    var bunks = $('<div class="column"></div>');
    barracks.append(bunks);
    let soldier_title = global.tech['world_control'] ? loc('civics_garrison_peacekeepers') : loc('civics_garrison_soldiers');
    
    bunks.append($(`<div class="barracks"><b-tooltip :label="soldierDesc()" position="is-bottom" multilined animated><span>${soldier_title}</span></b-tooltip> <span>{{ workers | stationed }} / {{ max | s_max }}</span></div>`));
    bunks.append($(`<div class="barracks"><b-tooltip :label="woundedDesc()" position="is-bottom" multilined animated><span>${loc('civics_garrison_wounded')}</span></b-tooltip> <span>{{ wounded }}</span></div>`));

    barracks.append($(`<div class="column hire"><b-tooltip :label="hireLabel()" size="is-small" position="is-bottom" animated><button v-show="mercs" class="button first" @click="hire">${loc('civics_garrison_hire_mercenary')}</button></b-tooltip><div>`));
    
    garrison.append($(`<div class="training"><span>${loc('civics_garrison_training')}</span> <progress class="progress" :value="progress" max="100">{{ progress }}%</progress></div>`));

    var campaign = $('<div class="columns is-mobile"></div>');
    garrison.append(campaign);

    var wrap = $('<div class="column war"></div>');
    campaign.append(wrap);

    if (!global.tech['world_control']){
        var tactics = $(`<div id="tactics" v-show="display" class="tactics"><span>${loc('civics_garrison_campaign')}</span></div>`);
        wrap.append(tactics);
            
        var strategy = $('<b-tooltip :label="strategyLabel()" position="is-bottom" multilined animated><span class="current">{{ tactic | tactics }}</span></b-tooltip>');
        var last = $('<span role="button" aria-label="easier campaign" class="sub" @click="last">&laquo;</span>');
        var next = $('<span role="button" aria-label="harder campaign" class="add" @click="next">&raquo;</span>');
        tactics.append(last);
        tactics.append(strategy);
        tactics.append(next);

        var battalion = $(`<div id="battalion" v-show="display" class="tactics"><span>${loc('civics_garrison_battalion')}</span></div>`);
        wrap.append(battalion);
            
        var armysize = $('<b-tooltip :label="armyLabel()" position="is-bottom" multilined animated><span class="current">{{ raid }}</span></b-tooltip>');
        var alast = $('<span role="button" aria-label="remove soldiers from campaign" class="sub" @click="aLast">&laquo;</span>');
        var anext = $('<span role="button" aria-label="add soldiers to campaign" class="add" @click="aNext">&raquo;</span>');
        battalion.append(alast);
        battalion.append(armysize);
        battalion.append(anext);

        campaign.append($(`<div class="column launch"><b-tooltip :label="battleAssessment()" position="is-bottom" multilined animated><button class="button campaign" @click="campaign">${loc('civics_garrison_launch_campaign')}</button></b-tooltip></div>`));
    }

    if (!global.civic['garrison']){
        global.civic['garrison'] = {
            display: false,
            disabled: false,
            progress: 0,
            tactic: 0,
            workers: 0,
            wounded: 0,
            raid: 0,
            max: 0
        };
    }

    if (!global.civic.garrison['mercs']){
        global.civic.garrison['mercs'] = false;
    }
    if (!global.civic.garrison['fatigue']){
        global.civic.garrison['fatigue'] = 0;
    }
    if (!global.civic.garrison['protest']){
        global.civic.garrison['protest'] = 0;
    }
    if (!global.civic.garrison['m_use']){
        global.civic.garrison['m_use'] = 0;
    }

    vues['civ_garrison'] = new Vue({
        data: global.civic['garrison'],
        methods: {
            hire(){
                let cost = Math.round((1.24 ** global.civic.garrison.workers) * 75) - 50;
                if (cost > 25000){
                    cost = 25000;
                }
                if (global.civic.garrison.m_use > 0){
                    cost *= 1.1 ** global.civic.garrison.m_use;
                }
                if (global.race['brute']){
                    cost = cost / 2;
                }
                cost = Math.round(cost);
                if (global.civic['garrison'].workers < global.civic['garrison'].max && global.resource.Money.amount >= cost){
                    global.resource.Money.amount -= cost;
                    global.civic['garrison'].workers++;
                    global.civic.garrison.m_use++;
                }
            },
            campaign(){
                if (global.civic.garrison.raid === 0){
                    messageQueue(loc('civics_garrison_campaign_no_soldier'),'warning');
                    return;
                }
                global.stats.attacks++;

                if (global.civic.garrison.raid > garrisonSize()){
                    global.civic.garrison.raid = garrisonSize();
                }

                let highLuck = global.race['claws'] ? 20 : 16;
                let lowLuck = global.race['puny'] ? 3 : 5;

                let luck = Math.floor(Math.seededRandom(lowLuck,highLuck)) / 10;
                let army = armyRating(global.civic.garrison.raid,'army') * luck;
                let enemy = 0;                

                switch(global.civic.garrison.tactic){
                    case 0:
                        enemy = Math.floor(Math.seededRandom(0,10));
                        break;
                    case 1:
                        enemy = Math.floor(Math.seededRandom(5,50));
                        break;
                    case 2:
                        enemy = Math.floor(Math.seededRandom(25,100));
                        break;
                    case 3:
                        enemy = Math.floor(Math.seededRandom(50,200));
                        break;
                    case 4:
                        enemy = Math.floor(Math.seededRandom(100,500));
                        break;
                }

                if (global.race['frenzy']){
                    global.race['frenzy'] += Math.ceil(enemy / 5);
                    if (global.race['frenzy'] > 1000000){
                        global.race['frenzy'] = 1000000;
                    }
                }

                let wounded = 0;
                if (global.civic.garrison.raid > global.civic.garrison.workers - global.civic.garrison.wounded){
                    wounded = global.civic.garrison.raid - (global.civic.garrison.workers - global.civic.garrison.wounded);
                }

                global.civic.garrison.fatigue++;

                if (army > enemy){
                    let deathCap = Math.floor(global.civic.garrison.raid / (5 - global.civic.garrison.tactic));
                    deathCap += wounded;
                    if (global.city.ptrait === 'rage'){
                        deathCap++;
                    }
                    if (deathCap < 1){
                        deathCap = 1;
                    }
                    if (deathCap > looters()){
                        deathCap = looters();
                    }
                    let death = Math.floor(Math.seededRandom(0,deathCap));
                    if (global.race['frail']){
                        death++;
                    }
                    let armor = 0;
                    if (global.race['armored']){
                        armor += Math.floor(death * 0.75);
                    }
                    if (global.race['scales']){
                        armor += 2;
                    }
                    if (global.tech['armor']){
                        armor += global.tech['armor'];
                    }
                    if (global.civic.garrison.raid > wounded){
                        death -= armor;
                    }

                    if (death < 0){
                        death = 0;
                    }
                    if (death > global.civic.garrison.raid){
                        death = global.civic.garrison.raid;
                    }
                    global.civic.garrison.workers -= death;
                    global.stats.died += death;
                    global.civic.garrison.protest += death;
                    if (death > wounded){
                        global.civic.garrison.wounded -= wounded;
                        wounded = 0;
                    }
                    else {
                        global.civic.garrison.wounded -= death;
                        wounded -= death;
                    }

                    global.civic.garrison.wounded += Math.floor(Math.seededRandom(wounded,global.civic.garrison.raid - death));

                    let money = 0;
                    let food = 0;
                    let lumber = 0;
                    let stone = 0;
                    let copper = 0;
                    let iron = 0;
                    let aluminium = 0;
                    let cement = 0;
                    let steel = 0;
                    let titanium = 0;
                    switch(global.civic.garrison.tactic){
                        case 0:
                            money = Math.floor(Math.seededRandom(50,250));
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                food = Math.floor(Math.seededRandom(50,250));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                lumber = Math.floor(Math.seededRandom(50,250));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                stone = Math.floor(Math.seededRandom(50,250));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 2){
                                copper = Math.floor(Math.seededRandom(25,100));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 2){
                                iron = Math.floor(Math.seededRandom(25,100));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 2){
                                aluminium = Math.floor(Math.seededRandom(25,100));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 1){
                                cement = Math.floor(Math.seededRandom(25,100));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) === 0){
                                steel = Math.floor(Math.seededRandom(10,25));
                            }
                            break;
                        case 1:
                            money = Math.floor(Math.seededRandom(500,1000));
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                food = Math.floor(Math.seededRandom(500,1000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                lumber = Math.floor(Math.seededRandom(500,2500));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                stone = Math.floor(Math.seededRandom(500,2500));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                copper = Math.floor(Math.seededRandom(250,1000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                iron = Math.floor(Math.seededRandom(250,1000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                aluminium = Math.floor(Math.seededRandom(250,1000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 3){
                                cement = Math.floor(Math.seededRandom(250,1000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 1){
                                steel = Math.floor(Math.seededRandom(100,250));
                            }
                            if (global.race['terrifying'] && Math.floor(Math.seededRandom(0,10)) <= 1){
                                titanium = Math.floor(Math.seededRandom(50,158));
                            }
                            break;
                        case 2:
                            money = Math.floor(Math.seededRandom(5000,10000));
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                food = Math.floor(Math.seededRandom(2500,10000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                lumber = Math.floor(Math.seededRandom(5000,25000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                stone = Math.floor(Math.seededRandom(5000,25000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                copper = Math.floor(Math.seededRandom(2500,10000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                iron = Math.floor(Math.seededRandom(2500,10000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                aluminium = Math.floor(Math.seededRandom(2500,10000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 4){
                                cement = Math.floor(Math.seededRandom(2500,10000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 2){
                                steel = Math.floor(Math.seededRandom(1000,2500));
                            }
                            if (global.race['terrifying'] && Math.floor(Math.seededRandom(0,10)) <= 1){
                                titanium = Math.floor(Math.seededRandom(500,1000));
                            }
                            break;
                        case 3:
                            money = Math.floor(Math.seededRandom(25000,100000));
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                food = Math.floor(Math.seededRandom(5000,20000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                lumber = Math.floor(Math.seededRandom(10000,50000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                stone = Math.floor(Math.seededRandom(10000,50000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                copper = Math.floor(Math.seededRandom(5000,20000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                iron = Math.floor(Math.seededRandom(5000,20000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                aluminium = Math.floor(Math.seededRandom(5000,20000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 4){
                                cement = Math.floor(Math.seededRandom(5000,20000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 2){
                                steel = Math.floor(Math.seededRandom(2000,5000));
                            }
                            if (global.race['terrifying'] && Math.floor(Math.seededRandom(0,10)) <= 1){
                                titanium = Math.floor(Math.seededRandom(1000,2500));
                            }
                            break;
                        case 4:
                            money = Math.floor(Math.seededRandom(50000,250000));
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                food = Math.floor(Math.seededRandom(10000,40000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                lumber = Math.floor(Math.seededRandom(20000,100000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                stone = Math.floor(Math.seededRandom(20000,100000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                copper = Math.floor(Math.seededRandom(10000,50000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                iron = Math.floor(Math.seededRandom(10000,50000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 5){
                                aluminium = Math.floor(Math.seededRandom(10000,50000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 4){
                                cement = Math.floor(Math.seededRandom(10000,50000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 2){
                                steel = Math.floor(Math.seededRandom(5000,25000));
                            }
                            if (global.race['terrifying'] && Math.floor(Math.seededRandom(0,10)) <= 1){
                                titanium = Math.floor(Math.seededRandom(4000,7500));
                            }
                            break;
                    }

                    let loot = loc('civics_garrison_gained');
                    if (global.resource.Money.display && money > 0){
                        money = lootModify(money);
                        loot = loot + loc('civics_garrison_quant_money',[money]);
                        modRes('Money',money);
                    }
                    if (global.resource.Food.display && food > 0){
                        food = lootModify(food);
                        loot = loot + loc('civics_garrison_quant_res',[food,global.resource.Food.name]);
                        modRes('Food',food);
                    }
                    if (global.resource.Lumber.display && lumber > 0){
                        lumber = lootModify(lumber);
                        loot = loot + loc('civics_garrison_quant_res',[lumber,global.resource.Lumber.name]);
                        modRes('Lumber',lumber);
                    }
                    if (global.resource.Stone.display && stone > 0){
                        stone = lootModify(stone);
                        loot = loot + loc('civics_garrison_quant_res',[stone,global.resource.Stone.name]);
                        modRes('Stone',stone);
                    }
                    if (global.resource.Copper.display && copper > 0){
                        copper = lootModify(copper);
                        loot = loot + loc('civics_garrison_quant_res',[copper,global.resource.Copper.name]);
                        modRes('Copper',copper);
                    }
                    if (global.resource.Iron.display && iron > 0){
                        iron = lootModify(iron);
                        loot = loot + loc('civics_garrison_quant_res',[iron,global.resource.Iron.name]);
                        modRes('Iron',iron);
                    }
                    if (global.resource.Aluminium.display && aluminium > 0){
                        aluminium = lootModify(aluminium);
                        loot = loot + loc('civics_garrison_quant_res',[aluminium,global.resource.Aluminium.name]);
                        modRes('Aluminium',aluminium);
                    }
                    if (global.resource.Cement.display && cement > 0){
                        cement = lootModify(cement);
                        loot = loot + loc('civics_garrison_quant_res',[cement,global.resource.Cement.name]);
                        modRes('Cement',cement);
                    }
                    if (steel > 0){
                        steel = lootModify(steel);
                        global.resource.Steel.display = true;
                        loot = loot + loc('civics_garrison_quant_res',[steel,global.resource.Steel.name]);
                        modRes('Steel',steel);
                    }
                    if (titanium > 0){
                        titanium = lootModify(titanium);
                        global.resource.Titanium.display = true;
                        loot = loot + loc('civics_garrison_quant_res',[titanium,global.resource.Titanium.name]);
                        modRes('Titanium',titanium);
                    }

                    loot = loot.slice(0,-2);
                    loot = loot + '.';
                    messageQueue(loot,'warning');
                    messageQueue(loc('civics_garrison_victorious',[death]),'success');
                    if (global.race['slaver'] && global.city['slave_pen']){
                        let max = global.city.slave_pen.count * 5;
                        if (max > global.city.slave_pen.slaves){
                            let slaves = Math.floor(Math.seededRandom(0,global.civic.garrison.tactic + 2));
                            if (slaves + global.city.slave_pen.slaves > max){
                                slaves = max - global.city.slave_pen.slaves;
                            }
                            if (slaves > 0){
                                global.city.slave_pen.slaves += slaves;
                                messageQueue(loc('civics_garrison_capture',[slaves]),'success');
                            }
                        }
                    }
                    if (global.race['infectious']){
                        let infected = 0;
                        switch(global.civic.garrison.tactic){
                            case 0:
                                infected = Math.floor(Math.seededRandom(0,2));
                                break;
                            case 1:
                                infected = Math.floor(Math.seededRandom(0,3));
                                break;
                            case 2:
                                infected = Math.floor(Math.seededRandom(0,5));
                                break;
                            case 3:
                                infected = Math.floor(Math.seededRandom(0,10));
                                break;
                            case 4:
                                infected = Math.floor(Math.seededRandom(0,25));
                                break;
                        }
                        let zombies = global.resource[global.race.species].amount + infected;
                        if (zombies > global.resource[global.race.species].max){
                            zombies = global.resource[global.race.species].max;
                        }
                        global.resource[global.race.species].amount = zombies;
                        if (infected === 1){
                            messageQueue(loc('civics_garrison_soldier_infected'),'special');
                        }
                        else {
                            messageQueue(loc('civics_garrison_soldiers_infected',[infected]),'special');
                        }
                    }
                }
                else {
                    let deathCap = global.civic.garrison.raid;
                    deathCap += wounded;
                    if (global.civic.garrison.tactic === 0){
                        deathCap = Math.floor(deathCap / 2);
                    }
                    if (global.city.ptrait === 'rage'){
                        deathCap++;
                    }
                    if (deathCap < 1){
                        deathCap = 1;
                    }
                    if (deathCap > looters()){
                        deathCap = looters();
                    }
                    let death = Math.floor(Math.seededRandom(1,deathCap));
                    if (global.race['frail']){
                        death += global.civic.garrison.tactic + 1;
                    }
                    let armor = 0;
                    if (global.race['armored']){
                        armor += Math.floor(death * 0.75);
                    }
                    if (global.race['scales']){
                        armor++;
                    }
                    if (global.tech['armor']){
                        armor += global.tech['armor'];
                    }
                    if (global.civic.garrison.raid > wounded){
                        death -= armor;
                    }

                    if (death < 1){
                        death = 1;
                    }
                    if (death > global.civic.garrison.raid){
                        death = global.civic.garrison.raid;
                    }
                    global.civic.garrison.workers -= death;
                    global.stats.died += death;
                    global.civic.garrison.protest += death;
                    if (death > wounded){
                        global.civic.garrison.wounded -= wounded;
                        wounded = 0;
                    }
                    else {
                        global.civic.garrison.wounded -= death;
                        wounded -= death;
                    }

                    global.civic.garrison.wounded += 1 + Math.floor(Math.seededRandom(wounded,global.civic.garrison.raid - death));
                    messageQueue(loc('civics_garrison_defeat',[death]),'danger');
                }
                if (global.civic.garrison.wounded > global.civic.garrison.workers){
                    global.civic.garrison.wounded = global.civic.garrison.workers;
                }
                else if (global.civic.garrison.wounded < 0){
                    global.civic.garrison.wounded = 0;
                }
            },
            strategyLabel(){
                switch (global.civic.garrison.tactic){
                    case 0:
                        return loc('civics_garrison_tactic_ambush_desc');
                    case 1:
                        return loc('civics_garrison_tactic_raid_desc');
                    case 2:
                        return loc('civics_garrison_tactic_pillage_desc');
                    case 3:
                        return loc('civics_garrison_tactic_assault_desc');
                    case 4:
                        return loc('civics_garrison_tactic_siege_desc');
                }
            },
            hireLabel(){
                let cost = Math.round((1.24 ** global.civic.garrison.workers) * 75) - 50;
                if (cost > 25000){
                    cost = 25000;
                }
                if (global.civic.garrison.m_use > 0){
                    cost *= 1.1 ** global.civic.garrison.m_use;
                }
                if (global.race['brute']){
                    cost = cost / 2;
                }
                cost = Math.round(cost);
                return loc('civics_garrison_hire_mercenary_cost',[cost]);
            },
            battleAssessment(){
                let army = armyRating(global.civic.garrison.raid,'army');
                let enemy = 0;
                switch(global.civic.garrison.tactic){
                    case 0:
                        enemy = 5;
                        break;
                    case 1:
                        enemy = 27.5;
                        break;
                    case 2:
                        enemy = 62.5;
                        break;
                    case 3:
                        enemy = 125;
                        break;
                    case 4:
                        enemy = 300;
                        break;
                }

                if (army < enemy){
                    return loc('civics_garrison_disadvantage',[+((1 - (army / enemy)) * 100).toFixed(1)]);
                }
                else {
                    return loc('civics_garrison_advantage',[+((1 - (enemy / army)) * 100).toFixed(1)]);
                }
            },
            armyLabel(){
                return loc('civics_garrison_army_label');
            },
            soldierDesc(){
                let rating = armyRating(garrisonSize(),'hunting');
                let food = +(rating / 3).toFixed(2);
                let fur = +(rating / 10).toFixed(2);
                if (global.race['evil']){
                    if (global.race['soul_eater']){
                        let bones = +(armyRating(garrisonSize(),'hunting') / 3).toFixed(2);
                        return loc('civics_garrison_evil_soldier_desc',[food,fur,bones,global.resource.Food.name,global.resource.Furs.name,global.resource.Lumber.name]);
                    }
                    else {
                        let bones = +(armyRating(garrisonSize(),'hunting') / 5).toFixed(2);
                        return global.race['herbivore']
                            ? loc('civics_garrison_evil_alt_soldier_desc_herb',[fur,bones,global.resource.Furs.name,global.resource.Lumber.name])
                            : loc('civics_garrison_evil_alt_soldier_desc',[food,fur,bones,global.resource.Food.name,global.resource.Furs.name,global.resource.Lumber.name]);
                    }
                }
                else {
                    return global.race['herbivore']
                        ? loc('civics_garrison_soldier_desc_herb',[fur,global.resource.Furs.name])
                        : loc('civics_garrison_soldier_desc',[food,fur,global.resource.Food.name,global.resource.Furs.name]);
                }
            },
            woundedDesc(){
                return loc('civics_garrison_wounded_desc');
            },
            defense(){
                return loc('civics_garrison_defensive_rate');
            },
            offense(){
                return loc('civics_garrison_offensive_rate');
            },
            next(){
                if (global.civic.garrison.tactic < 4){
                    global.civic.garrison.tactic++; 
                }
            },
            last(){
                if (global.civic.garrison.tactic > 0){
                    global.civic.garrison.tactic-- 
                }
            },
            aNext(){
                let inc = keyMultiplier();
                if (global.civic.garrison.raid < garrisonSize()){
                    global.civic.garrison.raid += inc;
                    if (global.civic.garrison.raid > garrisonSize()){
                        global.civic.garrison.raid = garrisonSize();
                    }
                }
            },
            aLast(){
                let dec = keyMultiplier();
                if (global.civic.garrison.raid > 0){
                    global.civic.garrison.raid -= dec;
                    if (global.civic.garrison.raid < 0){
                        global.civic.garrison.raid = 0;
                    }
                }
            }
        },
        filters: {
            tactics(val){
                switch(val){
                    case 0:
                        return loc('civics_garrison_tactic_ambush');
                    case 1:
                        return loc('civics_garrison_tactic_raid');
                    case 2:
                        return loc('civics_garrison_tactic_pillage');
                    case 3:
                        return loc('civics_garrison_tactic_assault');
                    case 4:
                        return loc('civics_garrison_tactic_siege');
                }
            },
            rating(v){
                return +armyRating(v,'army').toFixed(1);
            },
            hell(v){
                return garrisonSize();
            },
            stationed(v){
                return garrisonSize();
            },
            s_max(v){
                return garrisonSize(true);
            }
        }
    });
    vues['civ_garrison'].$mount('#garrison');
}

function looters(){
    let cap = 0;
    let looting = global.civic.garrison.raid;
    switch(global.civic.garrison.tactic){
        case 0:
            cap = 5;
            break;
        case 1:
            cap = 10;
            break;
        case 2:
            cap = 25;
            break;
        case 3:
            cap = 50;
            break;
        case 4:
            cap = 999;
            break;
    }
    if (looting > cap){
        looting = cap;
    }
    return looting;
}

function lootModify(val){
    let looting = looters();
    let loot = val * Math.log(looting + 1);
    if (global.race['beast_of_burden']){
        loot = loot * 1.1;
    }
    if (global.race['invertebrate']){
        loot = loot * 0.9;
    }
    if (global.race.universe === 'evil'){
        loot = loot * (1 + ((Math.log2(10 + global.race.Dark.count) - 3.321928094887362) / 5));
    }
    return Math.floor(loot);
}

export function armyRating(val,type){
    let wounded = 0;
    if (val > global.civic.garrison.workers - global.civic.garrison.wounded){
        wounded = val - (global.civic.garrison.workers - global.civic.garrison.wounded);
    }

    let weapon_tech = global.tech['military'] && global.tech.military >= 5 ? global.tech.military - 1 : global.tech.military;
    let army = global.tech['military'] ? (val - (wounded / 2)) * weapon_tech : (val - (wounded / 2));
    if (type === 'army'){
        if (global.race['puny']){
            army *= 0.9;
        }
        if (global.race['claws'] || global.race['chameleon']){
            army *= 1.2;
        }
        if (global.race['cautious'] && global.city.calendar.weather === 0){
            army *= 0.9;
        }
        if (global.race['apex_predator']){
            army *= 1.25;
        }
        if (global.race['fiery']){
            army *= 1.65;
        }
        if (global.race['pathetic']){
            army *= 0.75;
        }
        if (global.race['tactical']){
            army *= 1 + (global.race['tactical'] / 20);
        }
        if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 4){
            army *= 1 + (global.city.temple.count * 0.01);
        }
        if (global.city.ptrait === 'rage'){
            army *= 1.05;
        }
        if (global.race['parasite']){
            if (val === 1){
                army += 2;
            }
            else if (val > 1){
                army += 4;
            }
        }
        army = Math.floor(army);
    }
    else if (type === 'hunting'){
        if (global.race['tracker']){
            army *= 1.1;
        }
        if (global.race['beast'] && global.city.calendar.wind === 1){
            army *= 1.15;
        }
        if (global.race['apex_predator']){
            army *= 1.5;
        }
        if (global.race['fiery']){
            army *= 1.25;
        }
        if (global.city.ptrait === 'rage'){
            army *= 1.02;
        }
        if (global.race['cunning']){
            army *= 1 + (global.race['cunning'] / 20);
        }
        army = Math.floor(army);
    }
    return army * racialTrait(val,type);
}

export function garrisonSize(max){
    let type = max ? 'max' : 'workers';
    if (global.portal['fortress']){
        return global.civic.garrison[type] - global.portal.fortress.garrison;
    }
    return global.civic.garrison[type];
}

function defineMad(){
    if (!global.civic['mad']){
        global.civic['mad'] = {
            display: false,
            armed: true
        };
    }
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    var mad_command = $('<div id="mad" v-show="display" class="tile is-child"></div>');
    $('#r_civics').append(mad_command);
    var mad = $('<div class="mad"></div>');
    mad_command.append(mad);

    mad.append($(`<div class="warn">${loc('civics_mad_reset_desc',[plasmidType])}</div>`));

    mad.append($(`<div class="defcon"><b-tooltip :label="defcon()" position="is-bottom" multilined animated><button class="button arm" @click="arm">${loc('civics_mad_arm_missiles')}</button></b-tooltip></div>`));
    mad.append($(`<div class="defcon"><b-tooltip :label="warning()" position="is-bottom" multilined animated><button class="button" @click="launch" :disabled="armed">${loc('civics_mad_launch_missiles')}</button></b-tooltip></div>`));

    if (!global.civic.mad.armed){
        $('#mad').addClass('armed');
        $('#mad .arm').html(loc('civics_mad_disarm_missiles'));
    }

    vues['mad'] = new Vue({
        data: global.civic['mad'],
        methods: {
            launch(){
                $('body').addClass('nuke');
                let nuke = $('<div class="nuke"></div>');
                $('body').append(nuke);
                setTimeout(function(){
                    nuke.addClass('burn');
                }, 500);
                setTimeout(function(){
                    nuke.addClass('b');
                }, 600);
                setTimeout(function(){
                    warhead();
                }, 4000);
            },
            arm(){
                if (global.civic.mad.armed){
                    $('#mad .arm').html(loc('civics_mad_disarm_missiles'));
                    global.civic.mad.armed = false;
                    $('#mad').addClass('armed');
                }
                else {
                    $('#mad .arm').html(loc('civics_mad_arm_missiles'));
                    global.civic.mad.armed = true;
                    $('#mad').removeClass('armed');
                }
            },
            defcon(){
                return global.tech['world_control']
                    ? loc('civics_mad_missiles_world_control_desc')
                    : loc('civics_mad_missiles_desc');
            },
            warning(){
                let plasma = Math.round((global['resource'][global.race.species].amount + global.civic.garrison.workers) / 3);
                let k_base = global.stats.know;
                let k_inc = 100000;
                while (k_base > k_inc){
                    plasma++;
                    k_base -= k_inc;
                    k_inc *= 1.1;
                }
                plasma = challenge_multiplier(plasma,'mad');
                return loc('civics_mad_missiles_warning',[plasma,plasmidType]);
            }
        }
    });
    vues['mad'].$mount('#mad');
}

export function dragQueue(){
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
}

function warhead(){
    Object.keys(vues).forEach(function (v){
        vues[v].$destroy();
    });
    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let geo = global.city.geology;
    let plasmid = global.race.Plasmid.count;
    let antiplasmid = global.race.Plasmid.anti;
    let pop = global['resource'][global.race.species].amount + global.civic.garrison.workers;
    let new_plasmid = Math.round(pop / 3);
    let k_base = global.stats.know;
    let k_inc = 100000;
    while (k_base > k_inc){
        new_plasmid++;
        k_base -= k_inc;
        k_inc *= 1.1;
    }
    new_plasmid = challenge_multiplier(new_plasmid,'mad');
    global.stats.reset++;
    global.stats.mad++;
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
    let new_achieve = unlockAchieve(`apocalypse`);
    if (unlockAchieve(`squished`,true)){ new_achieve = true; }
    if (unlockAchieve(`extinct_${god}`)){ new_achieve = true; }
    if (global.city.biome === 'hellscape' && races[global.race.species].type !== 'demonic'){
        unlockFeat('take_no_advice');
    }
    checkAchievements();
    global['race'] = { 
        species : 'protoplasm', 
        gods: god,
        old_gods: old_god,
        rapid_mutation: 1,
        ancient_ruins: 1,
        Plasmid: { count: plasmid, anti: antiplasmid },
        Phage: { count: global.race.Phage.count },
        Dark: { count: global.race.Dark.count },
        universe: global.race.universe,
        seeded: false,
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
        ptrait: atmo,
        geology: geo
    };
    global.tech = { theology: 1 };
    clearStates();
    global.arpa = {};
    if (!new_achieve){
        global.lastMsg = false;
    }
    global.new = true;
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;
    
    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}
