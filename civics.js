import { global, vues } from './vars.js';

// Sets up govenment in civics tab
export function defineGovernment(){
    var govern = $('<div id="government" class="government tile is-child"></div>');
    govern.append($('<div class="header has-text-warning" v-show="display">Government</div>'));
    $('#r_civics').append(govern);
    
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
    
    //tax_rates.append();
    if (!global.civic['taxes']){
        global.civic['taxes'] = {
            tax_rate: '2',
            display: false
        };
    }
    
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

    garrison.append($('<button class="button" @click="train">Train Solider</button>'));

    if (!global.civic['garrison']){
        global.civic['garrison'] = {
            display: false,
            soliders: 0
        };
    }

    vues['civ_garrison'] = new Vue({
        data: global.civic['garrison'],
        methods: {
            train: function(){
                console.log('training');
            }
        }
    });
    vues['civ_garrison'].$mount('#garrison');

    garrison
}
