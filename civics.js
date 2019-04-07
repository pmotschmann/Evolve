import { global, vues, poppers, messageQueue, modRes, save } from './vars.js';
import { unlockAchieve } from './achieve.js';
import { races, racialTrait } from './races.js';

// Sets up government in civics tab
export function defineGovernment(){
    var govern = $('<div id="government" class="government tile is-child"></div>');
    govern.append($('<div class="header has-text-warning" v-show="display">Government</div>'));
    $('#r_civics').append(govern);
    
    if (!global.civic['taxes']){
        global.civic['taxes'] = {
            tax_rate: '2',
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

function taxRates(govern){
    var tax_rates = $('<div id="tax_rates" v-show="display" class="taxRate"></div>');
    govern.append(tax_rates);
    
    var label = $('<span id="taxRateLabel">Tax Rate</span>');
    tax_rates.append(label);
    
    var tax_level = $('<span class="current">{{ tax_rate | tax_level }}</span>');
    var sub = $('<span class="sub" @click="sub">&laquo;</span>');
    var add = $('<span class="add" @click="add">&raquo;</span>');
    tax_rates.append(sub);
    tax_rates.append(tax_level);
    tax_rates.append(add);
    
    vues['civ_taxes'] = new Vue({
        data: global.civic['taxes'],
        filters: {
            tax_level: function(rate){
                var label;
                switch(Number(rate)){
                    case 0:
                        label = 'None';
                        break;
                    case 1:
                        label = 'Low';
                        break;
                    case 2:
                        label = 'Medium';
                        break;
                    case 3:
                        label = 'High';
                        break;
                    case 4:
                        label = 'Oppressive';
                        break;
                    case 5:
                        label = 'Intolerable';
                        break;
                    default:
                        label = 'Severe Audit'
                        break;
                }
                return label;
            }
        },
        methods: {
            add(){
                if (global.tech['currency'] && global.tech['currency'] >= 5 && global.civic.taxes.tax_rate < 5){
                    global.civic.taxes.tax_rate++;
                }
                else if (global.civic.taxes.tax_rate < 3){
                    global.civic.taxes.tax_rate++;
                }
            },
            sub(){
                if (global.tech['currency'] && global.tech['currency'] >= 5 && global.civic.taxes.tax_rate > 0){
                    global.civic.taxes.tax_rate--;
                }
                else if (global.civic.taxes.tax_rate > 1){
                    global.civic.taxes.tax_rate--;
                }
            }
        }
    });
    vues['civ_taxes'].$mount('#tax_rates');
    
    $('#taxRateLabel').on('mouseover',function(){
            var popper = $('<div id="popTaxRate" class="popper has-background-light has-text-dark">High tax rates yield more money per tax cycle but reduce worker productivity, low taxes have the inverse effect.</div>');
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

function buildGarrison(garrison){
    garrison.append($('<div class="header"><span class="has-text-warning">Garrison</span> - <span class="has-text-success">Rating <b-tooltip :label="defense()" position="is-bottom" animated>{{ workers | rating }}</b-tooltip> / <b-tooltip :label="offense()" position="is-bottom" animated>{{ raid | rating }}</b-tooltip></span></div>'));

    var barracks = $('<div class="columns is-mobile bunk"></div>');
    garrison.append(barracks);

    var bunks = $('<div class="column"></div>');
    barracks.append(bunks);
    bunks.append($('<div class="barracks"><b-tooltip :label="soldierDesc()" position="is-bottom" multilined animated><span>Soldiers</span></b-tooltip> <span>{{ workers }} / {{ max }}</span></div>'));
    bunks.append($('<div class="barracks"><b-tooltip :label="woundedDesc()" position="is-bottom" multilined animated><span>Wounded</span></b-tooltip> <span>{{ wounded }}</span></div>'));

    barracks.append($('<div class="column hire"><b-tooltip :label="hireLabel()" size="is-small" position="is-bottom" animated><button v-show="mercs" class="button first" @click="hire">Hire Mercenary</button></b-tooltip><div>'));
    
    garrison.append($(`<div class="training"><span>Training</span> <progress class="progress" :value="progress" max="100">{{ progress }}%</progress></div>`));

    var campaign = $('<div class="columns is-mobile"></div>');
    garrison.append(campaign);

    var wrap = $('<div class="column war"></div>');
    campaign.append(wrap);


    var tactics = $('<div id="tactics" v-show="display" class="tactics"><span>Campaign</span></div>');
    wrap.append(tactics);
        
    var strategy = $('<b-tooltip :label="strategyLabel()" position="is-bottom" multilined animated><span class="current">{{ tactic | tactics }}</span></b-tooltip>');
    var last = $('<span class="sub" @click="last">&laquo;</span>');
    var next = $('<span class="add" @click="next">&raquo;</span>');
    tactics.append(last);
    tactics.append(strategy);
    tactics.append(next);

    var battalion = $('<div id="battalion" v-show="display" class="tactics"><span>Battalion</span></div>');
    wrap.append(battalion);
        
    var armysize = $('<b-tooltip :label="armyLabel()" position="is-bottom" multilined animated><span class="current">{{ raid }}</span></b-tooltip>');
    var alast = $('<span class="sub" @click="aLast">&laquo;</span>');
    var anext = $('<span class="add" @click="aNext">&raquo;</span>');
    battalion.append(alast);
    battalion.append(armysize);
    battalion.append(anext);

    campaign.append($('<div class="column launch"><button class="button campaign" @click="campaign">Launch Campaign</button></div>'));

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

    vues['civ_garrison'] = new Vue({
        data: global.civic['garrison'],
        methods: {
            hire(){
                let cost = Math.round((1.24 ** global.civic.garrison.workers) * 75) - 50;
                if (cost > 25000){
                    cost = 25000;
                }
                if (global.race['brute']){
                    cost = Math.round(cost / 2);
                }
                if (global.civic['garrison'].workers < global.civic['garrison'].max && global.resource.Money.amount >= cost){
                    global.resource.Money.amount -= cost;
                    global.civic['garrison'].workers++;
                }
            },
            campaign(){
                if (global.civic.garrison.raid === 0){
                    messageQueue('Can not start a campaign without any soldiers.','warning');
                    return;
                }
                if (global.civic.garrison.raid > global.civic.garrison.workers){
                    global.civic.garrison.raid = global.civic.garrison.workers;
                }

                let highLuck = global.race['claws'] ? 20 : 16;
                let lowLuck = global.race['puny'] ? 3 : 5;

                let luck = Math.floor(Math.seededRandom(lowLuck,highLuck)) / 10;
                let army = armyRating(global.civic.garrison.raid,'army') * luck;
                if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 4){
                    army *= 1 + (global.city.temple.count * 0.01);
                }
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

                let wounded = 0;
                if (global.civic.garrison.raid > global.civic.garrison.workers - global.civic.garrison.wounded){
                    wounded = global.civic.garrison.raid - (global.civic.garrison.workers - global.civic.garrison.wounded);
                }

                if (army > enemy){
                    let deathCap = Math.floor(global.civic.garrison.raid / (5 - global.civic.garrison.tactic));
                    deathCap += wounded;
                    if (deathCap < 0){
                        deathCap = 0;
                    }
                    let death = Math.floor(Math.seededRandom(0,deathCap));
                    if (global.race['armored']){
                        death = Math.floor(death * 0.75);
                    }
                    if (global.race['scales']){
                        death -= 2;
                    }
                    if (global.race['frail']){
                        death++;
                    }
                    if (global.tech['armor']){
                        death -= global.tech['armor'];
                    }
                    if (death < 0){
                        death = 0;
                    }
                    if (death > global.civic.garrison.raid){
                        death = global.civic.garrison.raid;
                    }
                    global.civic.garrison.workers -= death;
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
                    let cement = 0;
                    let steel = 0;
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
                            if (Math.floor(Math.seededRandom(0,10)) <= 3){
                                cement = Math.floor(Math.seededRandom(250,1000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 1){
                                steel = Math.floor(Math.seededRandom(100,250));
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
                            if (Math.floor(Math.seededRandom(0,10)) <= 4){
                                cement = Math.floor(Math.seededRandom(2500,10000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 2){
                                steel = Math.floor(Math.seededRandom(1000,2500));
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
                            if (Math.floor(Math.seededRandom(0,10)) <= 4){
                                cement = Math.floor(Math.seededRandom(5000,20000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 2){
                                steel = Math.floor(Math.seededRandom(2000,5000));
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
                            if (Math.floor(Math.seededRandom(0,10)) <= 4){
                                cement = Math.floor(Math.seededRandom(10000,50000));
                            }
                            if (Math.floor(Math.seededRandom(0,10)) <= 2){
                                steel = Math.floor(Math.seededRandom(5000,25000));
                            }
                            break;
                    }

                    let loot = 'Gained ';
                    if (global.resource.Money.display && money > 0){
                        money = lootModify(money);
                        loot = loot + `\$${money}, `;
                        modRes('Money',money);
                    }
                    if (global.resource.Food.display && food > 0){
                        food = lootModify(food);
                        loot = loot + `${food} Food, `;
                        modRes('Food',food);
                    }
                    if (global.resource.Lumber.display && lumber > 0){
                        lumber = lootModify(lumber);
                        loot = loot + `${lumber} Lumber, `;
                        modRes('Lumber',lumber);
                    }
                    if (global.resource.Stone.display && stone > 0){
                        stone = lootModify(stone);
                        loot = loot + `${stone} Stone, `;
                        modRes('Stone',stone);
                    }
                    if (global.resource.Copper.display && copper > 0){
                        copper = lootModify(copper);
                        loot = loot + `${copper} Copper, `;
                        modRes('Copper',copper);
                    }
                    if (global.resource.Iron.display && iron > 0){
                        iron = lootModify(iron);
                        loot = loot + `${iron} Iron, `;
                        modRes('Iron',iron);
                    }
                    if (global.resource.Cement.display && cement > 0){
                        cement = lootModify(cement);
                        loot = loot + `${cement} Cement, `;
                        modRes('Cement',cement);
                    }
                    if (steel > 0){
                        steel = lootModify(steel);
                        global.resource.Steel.display = true;
                        loot = loot + `${steel} Steel, `;
                        modRes('Steel',steel);
                    }

                    loot = loot.slice(0,-2);
                    loot = loot + '.';
                    messageQueue(loot,'warning');
                    messageQueue(`Your army was victorious! ${death} soldiers died in the conflict.`,'success');
                }
                else {
                    let deathCap = global.civic.garrison.raid;
                    deathCap += wounded;
                    if (global.civic.garrison.tactic === 0){
                        deathCap = Math.floor(deathCap / 2);
                    }
                    if (deathCap < 1){
                        deathCap = 1;
                    }
                    let death = Math.floor(Math.seededRandom(1,deathCap));
                    if (global.race['armored']){
                        death = Math.floor(death * 0.75);
                    }
                    if (global.race['scales']){
                        death--;
                    }
                    if (global.race['frail']){
                        death += global.civic.garrison.tactic + 1;
                    }
                    if (global.tech['armor']){
                        death -= global.tech['armor'];
                    }
                    if (death < 0){
                        death = 0;
                    }
                    if (death > global.civic.garrison.raid){
                        death = global.civic.garrison.raid;
                    }
                    global.civic.garrison.workers -= death;
                    if (death > wounded){
                        global.civic.garrison.wounded -= wounded;
                        wounded = 0;
                    }
                    else {
                        global.civic.garrison.wounded -= death;
                        wounded -= death;
                    }

                    global.civic.garrison.wounded += Math.floor(Math.seededRandom(wounded,global.civic.garrison.raid - death));
                    messageQueue(`Your army was defeated. ${death} soldiers died in the conflict.`,'danger');
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
                        return 'Attempt to ambush a rival caravan and steal their goods. Low risk opperation, but low reward.';
                    case 1:
                        return 'Attempt to raid a rival camp. Medium risk opperation with average payoff potential.';
                    case 2:
                        return 'Attempt to pillage a rival settlement. High risk opperation with superior payoff potential.';
                    case 3:
                        return 'Attempt to assault a rival town. Very High risk opperation with huge payoff potential.';
                    case 4:
                        return 'Attempt to seige a rival city. This opperation is suicide for all but the strongest armies, but if sucessful will be glorious.';
                }
            },
            hireLabel(){
                let cost = Math.round((1.24 ** global.civic.garrison.workers) * 75) - 50;
                if (cost > 25000){
                    cost = 25000;
                }
                if (global.race['brute']){
                    cost = Math.round(cost / 2);
                }
                return `Hire a mercenary: \$${cost}`;
            },
            armyLabel(){
                return `Number of soldiers to commit to millitary campaigns.`;
            },
            soldierDesc(){
                let rating = armyRating(global.civic.garrison.workers,'hunting');
                let food = +(rating / 3).toFixed(2);
                let fur = +(rating / 10).toFixed(2);
                return global.race['herbivore']
                    ? `Idle soldiers spend their time hunting, they are currently bringing in ${fur} furs per trip.`
                    : `Idle soldiers spend their time hunting, they are currently bringing in ${food} food worth of meat per trip and ${fur} furs.`;
            },
            woundedDesc(){
                return `Wounded soldiers are both less effective in combat and more likely to die. Wounded soldiers will heal over time.`;
            },
            defense(){
                return `Defensive Rating`;
            },
            offense(){
                return `Offensive Rating`;
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
                if (global.civic.garrison.raid < global.civic.garrison.workers){
                    global.civic.garrison.raid++; 
                }
            },
            aLast(){
                if (global.civic.garrison.raid > 0){
                    global.civic.garrison.raid-- 
                }
            }
        },
        filters: {
            tactics(val){
                switch(val){
                    case 0:
                        return 'Ambush';
                    case 1:
                        return 'Raid';
                    case 2:
                        return 'Pillage';
                    case 3:
                        return 'Assault';
                    case 4:
                        return 'Siege';
                }
            },
            rating(val){
                return armyRating(val,'army');
            }
        }
    });
    vues['civ_garrison'].$mount('#garrison');
}

function lootModify(val){
    let cap = 0;
    let looters = global.civic.garrison.raid;
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
    if (looters > cap){
        looters = cap;
    }
    let loot = val * Math.log(looters + 1);
    if (global.race['beast_of_burden']){
        loot = loot * 1.1;
    }
    return Math.floor(loot);
}

export function armyRating(val,type){
    let wounded = 0;
    if (val > global.civic.garrison.workers - global.civic.garrison.wounded){
        wounded = val - (global.civic.garrison.workers - global.civic.garrison.wounded);
    }

    let army = (val - (wounded / 2)) * global.tech.military;
    if (type === 'army'){
        if (global.race['puny']){
            army = Math.floor(army * 0.9);
        }
        if (global.race['claws']){
            army = Math.floor(army * 1.2);
        }
        if (global.race['cautious'] && global.city.calendar.weather === 0){
            army = Math.floor(army * 0.9);
        }
    }
    else if (type === 'hunting'){
        if (global.race['tracker']){
            army = Math.floor(army * 1.1);
        }
        if (global.race['beast'] && global.city.calendar.wind === 1){
            army = Math.floor(army * 1.15);
        }
    }
    return army * racialTrait(val,type);
}

function defineMad(){
    if (!global.civic['mad']){
        global.civic['mad'] = {
            display: false,
            armed: true
        };
    }

    var mad_command = $('<div id="mad" v-show="display" class="tile is-child"></div>');
    $('#r_civics').append(mad_command);
    var mad = $('<div class="mad"></div>');
    mad_command.append(mad);

    mad.append($('<div class="warn">This will reset the game, you will gain some plasmids and you may gain some other minor bonuses as a result. Export a save state before proceeding.</div>'));

    mad.append($('<div class="defcon"><b-tooltip :label="defcon()" position="is-bottom" multilined animated><button class="button" @click="arm">Arm Missiles</button></b-tooltip></div>'));
    mad.append($('<div class="defcon"><b-tooltip :label="warning()" position="is-bottom" multilined animated><button class="button" @click="launch" :disabled="armed">Launch Missiles</button></b-tooltip></div>'));

    if (!global.civic.mad.armed){
        $('#mad').addClass('armed');
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
                    global.civic.mad.armed = false;
                    $('#mad').addClass('armed');
                }
                else {
                    global.civic.mad.armed = true;
                    $('#mad').removeClass('armed');
                }
            },
            defcon(){
                return `Enable or Disable the launch button. Launching a nuclear strike will trigger a retalitory strike which will result in the end of all life as we know it.`;
            },
            warning(){
                let plasma = Math.round((global['resource'][races[global.race.species].name].amount + global.civic.garrison.workers) / 3);
                return `This will result in the destruction of all life on your planet. You will have to re-evolve from the beginning. You will gain ${plasma} Plasmids.`;
            }
        }
    });
    vues['mad'].$mount('#mad');
}

function warhead(){
    Object.keys(vues).forEach(function (v){
        vues[v].$destroy();
    });

    let god = global.race.species;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let plasmid = global.race.Plasmid.count;
    let pop = global['resource'][races[global.race.species].name].amount + global.civic.garrison.workers;
    let new_plasmid = Math.round(pop / 3);
    plasmid += new_plasmid;
    global.stats.reset++;
    global.stats.tdays += global.stats.days;
    global.stats.days = 0;
    global.stats.plasmid += new_plasmid;
    console.log(`extinct_${god}`);
    unlockAchieve(`apocalypse`);
    let new_achieve = unlockAchieve(`extinct_${god}`);
    global['race'] = { 
        species : 'protoplasm', 
        gods: god, 
        rapid_mutation: 1,
        ancient_ruins: 1,
        Plasmid: { count: plasmid }
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
        biome: biome
    };
    global.civic = { free: 0 };
    global.resource = {};
    global.evolution = {};
    global.tech = { theology: 1 };
    global.event = 100;
    global.settings.civTabs = 0;
    global.settings.showEvolve = true;
    global.settings.showCity = false;
    global.settings.showIndustry = false;
    global.settings.showResearch = false;
    global.settings.showCivic = false;
    global.settings.showMarket = false;
    global.settings.showGenetics = false;
    global.settings.showSpace = false;
    global.settings.arpa = false;
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
