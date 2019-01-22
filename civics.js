import { global, vues, messageQueue, modRes } from './vars.js';
import { races, racialTrait } from './races.js';

// Sets up govenment in civics tab
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
    
    var popper = $('<div id="popTaxRate" class="popper has-background-light has-text-dark">High tax rates yield more money per tax cycle but reduce worker productivity, low taxes have the inverse effect.</div>');
    popper.hide();
    $('#main').append(popper);
    $('#taxRateLabel').on('mouseover',function(){
            popper.show();
            new Popper($('#taxRateLabel'),popper);
        });
    $('#taxRateLabel').on('mouseout',function(){
            popper.hide();
        });
}

function buildGarrison(garrison){
    garrison.append($('<div class="header has-text-warning">Garrison</div>'));

    garrison.append($('<div class="barracks"><span>Soliders</span> <span>{{ workers }} / {{ max }}</span> - <span>Rating {{ workers | rating }}</span></div>'));

    garrison.append($('<b-tooltip :label="trainLabel()" position="is-bottom" type="is-dark" multilined animated><button class="button first" @click="train">Train Solider</button></b-tooltip>'));
    garrison.append($('<b-tooltip :label="retireLabel()" position="is-bottom" type="is-dark" multilined animated><button class="button" @click="retire">Retire Solider</button></b-tooltip>'));

    var tactics = $('<div id="tactics" v-show="display" class="tactics"><span>Campaign</span></div>');
    garrison.append(tactics);
        
    var strategy = $('<b-tooltip :label="strategyLabel()" position="is-bottom" type="is-dark" multilined animated><span class="current">{{ tactic | tactics }}</span></b-tooltip>');
    var last = $('<span class="sub" @click="last">&laquo;</span>');
    var next = $('<span class="add" @click="next">&raquo;</span>');
    tactics.append(last);
    tactics.append(strategy);
    tactics.append(next);

    garrison.append($('<button class="button campaign" @click="campaign">Launch Campaign</button>'));

    if (!global.civic['garrison']){
        global.civic['garrison'] = {
            display: false,
            disabled: false,
            progress: 0,
            tactic: 0,
            workers: 0,
            raid: 0,
            max: 0
        };
    }

    vues['civ_garrison'] = new Vue({
        data: global.civic['garrison'],
        methods: {
            train(){
                let cost = Math.round((1.25 ** global.civic.garrison.workers) * 75) - 50;
                if (global.civic['garrison'].workers < global.civic['garrison'].max && global.resource.Money.amount >= cost && global.civic.free > 0){
                    global.resource.Money.amount -= cost;
                    global.civic['garrison'].workers++;
                    global.civic.free--;
                    global['resource'][races[global.race.species].name].amount--;
                }
            },
            retire(){
                if (global.civic['garrison'].workers > 0){
                    global.civic['garrison'].workers--;
                    global.civic.free++;
                    global['resource'][races[global.race.species].name].amount++;
                }
            },
            campaign(){
                if (global.civic.garrison.workers === 0){
                    messageQueue('Can not start a campaign without and soliders.','warning');
                    return;
                }

                let highLuck = global.race['claws'] ? 20 : 16;
                let lowLuck = global.race['puny'] ? 3 : 5;

                let luck = Math.floor(Math.seededRandom(lowLuck,highLuck)) / 10;
                let army = global.civic.garrison.workers * global.tech.military * luck * racialTrait(global.civic.garrison.workers,true);;
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

                if (army > enemy){
                    let deathCap = Math.floor(global.civic.garrison.workers / (5 - global.civic.garrison.tactic));
                    if (deathCap < 0){
                        deathCap = 0;
                    }
                    let death = Math.floor(Math.seededRandom(0,deathCap));
                    if (global.race['armored']){
                        death -= 2;
                    }
                    else if (global.race['fraile']){
                        death++;
                    }
                    if (global.tech['armor']){
                        death -= global.tech['armor'];
                    }
                    if (death < 0){
                        death = 0;
                    }
                    if (death > global.civic.garrison.workers){
                        death = global.civic.garrison.workers;
                    }
                    global.civic.garrison.workers -= death;

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
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                food = Math.floor(Math.seededRandom(50,250));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                lumber = Math.floor(Math.seededRandom(50,250));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                stone = Math.floor(Math.seededRandom(50,250));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 2)){
                                copper = Math.floor(Math.seededRandom(25,100));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 2)){
                                iron = Math.floor(Math.seededRandom(25,100));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 1)){
                                cement = Math.floor(Math.seededRandom(25,100));
                            }
                            if (Math.floor(Math.seededRandom(0,20) === 0)){
                                steel = Math.floor(Math.seededRandom(10,25));
                            }
                            break;
                        case 1:
                            money = Math.floor(Math.seededRandom(500,1000));
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                food = Math.floor(Math.seededRandom(500,1000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                lumber = Math.floor(Math.seededRandom(500,2500));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                stone = Math.floor(Math.seededRandom(500,2500));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                copper = Math.floor(Math.seededRandom(250,1000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                iron = Math.floor(Math.seededRandom(250,1000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 3)){
                                cement = Math.floor(Math.seededRandom(250,1000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 1)){
                                steel = Math.floor(Math.seededRandom(100,250));
                            }
                            break;
                        case 2:
                            money = Math.floor(Math.seededRandom(5000,10000));
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                food = Math.floor(Math.seededRandom(2500,10000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                lumber = Math.floor(Math.seededRandom(5000,25000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                stone = Math.floor(Math.seededRandom(5000,25000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                copper = Math.floor(Math.seededRandom(2500,10000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                iron = Math.floor(Math.seededRandom(2500,10000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 4)){
                                cement = Math.floor(Math.seededRandom(2500,10000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 2)){
                                steel = Math.floor(Math.seededRandom(1000,2500));
                            }
                            break;
                        case 3:
                            money = Math.floor(Math.seededRandom(25000,100000));
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                food = Math.floor(Math.seededRandom(5000,20000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                lumber = Math.floor(Math.seededRandom(10000,50000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                stone = Math.floor(Math.seededRandom(10000,50000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                copper = Math.floor(Math.seededRandom(5000,20000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                iron = Math.floor(Math.seededRandom(5000,20000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 4)){
                                cement = Math.floor(Math.seededRandom(5000,20000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 2)){
                                steel = Math.floor(Math.seededRandom(2000,5000));
                            }
                            break;
                        case 4:
                            money = Math.floor(Math.seededRandom(50000,250000));
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                food = Math.floor(Math.seededRandom(10000,40000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                lumber = Math.floor(Math.seededRandom(20000,100000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                stone = Math.floor(Math.seededRandom(20000,100000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                copper = Math.floor(Math.seededRandom(10000,50000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 5)){
                                iron = Math.floor(Math.seededRandom(10000,50000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 4)){
                                cement = Math.floor(Math.seededRandom(10000,50000));
                            }
                            if (Math.floor(Math.seededRandom(0,10) <= 2)){
                                steel = Math.floor(Math.seededRandom(5000,25000));
                            }
                            break;
                    }

                    let loot = 'Gained ';
                    if (global.resource.Money.display && money > 0){
                        if (global.race['beast_of_burdon']){
                            money = Math.floor(money * 1.1);
                        }
                        loot = loot + `\$${money}, `;
                        modRes('Money',money);
                    }
                    if (global.resource.Food.display && food > 0){
                        if (global.race['beast_of_burdon']){
                            food = Math.floor(food * 1.1);
                        }
                        loot = loot + `${food} Food, `;
                        modRes('Food',food);
                    }
                    if (global.resource.Lumber.display && lumber > 0){
                        if (global.race['beast_of_burdon']){
                            lumber = Math.floor(lumber * 1.1);
                        }
                        loot = loot + `${lumber} Lumber, `;
                        modRes('Lumber',lumber);
                    }
                    if (global.resource.Stone.display && stone > 0){
                        if (global.race['beast_of_burdon']){
                            stone = Math.floor(stone * 1.1);
                        }
                        loot = loot + `${stone} Stone, `;
                        modRes('Stone',stone);
                    }
                    if (global.resource.Copper.display && copper > 0){
                        if (global.race['beast_of_burdon']){
                            copper = Math.floor(copper * 1.1);
                        }
                        loot = loot + `${copper} Copper, `;
                        modRes('Copper',copper);
                    }
                    if (global.resource.Iron.display && iron > 0){
                        if (global.race['beast_of_burdon']){
                            iron = Math.floor(iron * 1.1);
                        }
                        loot = loot + `${iron} Iron, `;
                        modRes('Iron',iron);
                    }
                    if (global.resource.Cement.display && cement > 0){
                        if (global.race['beast_of_burdon']){
                            cement = Math.floor(cement * 1.1);
                        }
                        loot = loot + `${cement} Cement, `;
                        modRes('Cement',cement);
                    }
                    if (steel > 0){
                        if (global.race['beast_of_burdon']){
                            steel = Math.floor(steel * 1.1);
                        }
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
                    let deathCap = global.civic.garrison.workers;
                    if (global.civic.garrison.tactic === 0){
                        deathCap = Math.floor(deathCap / 2);
                    }
                    if (deathCap < 1){
                        deathCap = 1;
                    }
                    let death = Math.floor(Math.seededRandom(1,deathCap));
                    if (global.race['armored']){
                        death--;
                    }
                    else if (global.race['fraile']){
                        death += global.civic.garrison.tactic + 1;
                    }
                    if (global.tech['armor']){
                        death -= global.tech['armor'];
                    }
                    if (death < 0){
                        death = 0;
                    }
                    if (death > global.civic.garrison.workers){
                        death = global.civic.garrison.workers;
                    }
                    
                    global.civic.garrison.workers -= death;
                    messageQueue(`Your army was defeated. ${death} soldiers died in the conflict.`,'danger');
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
            trainLabel(){
                let cost = Math.round((1.25 ** global.civic.garrison.workers) * 75) - 50;
                return `Train a Soldier, costs \$${cost} and requires a recruit (unemployed citizen)`;
            },
            retireLabel(){
                return `Return a solider to civilian life, note if there is not any open housing they will leave your settlement.`;
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
                let army = val * global.tech.military;
                if (global.race['puny']){
                    army = Math.floor(army * 0.9);
                }
                else if (global.race['claws']){
                    army = Math.floor(army * 1.2);
                }
                return army * racialTrait(val,true);
            }
        }
    });
    vues['civ_garrison'].$mount('#garrison');
}
