// Sets up resource definitions
function defineResources() {
    if (global.race.species === 'protoplasm'){
        loadResource('RNA',100,1);
        loadResource('DNA',100,1);
    }
    else {
        loadResource('Money',1000,3,'success');
        loadResource(races[global.race.species].name,0,1,'warning');
        loadResource('Knowledge',100,1,'warning');
        loadResource('Food',250,1);
        loadResource('Lumber',250,1);
        loadResource('Stone',250,1);
        loadResource('Copper',100,1);
        loadResource('Iron',100,1);
        loadResource('Concrete',100,1);
        //loadResource('Steel',50,1);
        //loadResource('Titanium',50,1);
        //loadResource('Iridium',50,1);
        //loadResource('Deuterium',20,1);
    }
}
// Sets up jobs in civics tab
function defineJobs(){
    loadUnemployed();
    loadJob('farmer','Farmer',3);
    loadJob('lumberjack','Lumberjack',1);
    loadJob('quarry_worker','Quarry Worker',1);
    loadJob('miner','Miner',1);
    loadJob('professor','Professor',0.5);
    loadJob('banker','Banker',0.1);
}

// Load resource function
// This function defines each resource, loads saved values from localStorage
// And it creates Vue binds for various resource values
function loadResource(name,max,rate,color) {
    color = color || 'info';
    if (!global['resource'][name]){
        global['resource'][name] = {
            name: name === 'Money' ? '$' : name,
            display: false,
            value: resource_values[name],
            amount: 0,
            last: 0,
            diff: 0,
            max: max,
            rate: rate
        };
    }
    
    if (global['resource'][name]['max'] > 0){
        var res_container = $('<div id="res-' + name + '" class="resource" v-show="display"><span class="res has-text-' + color + '">{{ name }}</span><span class="count">{{ amount | size }} / {{ max | size }}</span><span class="diff">({{ diff | diffSize }} /s)</span></div>');
        $('#resources').append(res_container);
    }
    else {
        var res_container = $('<div id="res-' + name + '" class="resource" v-show="display"><span class="res has-text-' + color + '">{{ name }}</span><span class="count">{{ amount | size }}</span><span class="diff">({{ diff | diffSize }} /s)</span></div>');
        $('#resources').append(res_container);
    }
    
    vues['res_'+name] = new Vue({
        data: global['resource'][name],
        filters: {
            size: function (value){
                return sizeApproximation(value,0);
            },
            diffSize: function (value){
                return sizeApproximation(value,2);
            }
        }
    });
    vues['res_'+name].$mount('#res-' + name);
}

function loadUnemployed(){
    var color = 'warning';
    
    var id = 'civ-free';
    var civ_container = $('<div id="' + id + '" class="job"></div>');
    var job_label = $('<div class="job_label"><span class="has-text-' + color + '">Unemployed</span><span class="count">{{ free }}</span></div>');
    civ_container.append(job_label);
    $('#civic').append(civ_container);
    
    vues['civ_free'] = new Vue({
        data: global.civic,
    });
    vues['civ_free'].$mount('#'+id);
    
    var popper = $('<div id="pop'+id+'" class="popper has-background-light has-text-dark">The number of unemployed citizens. Unemployed citizens do not pay taxes.</div>');
    popper.hide();
    $('#main').append(popper);
    $('#'+id+' .job_label').on('mouseover',function(){
            popper.show();
            new Popper($('#'+id+' .job_label'),popper);
        });
    $('#'+id+' .job_label').on('mouseout',function(){
            popper.hide();
        });
}

function loadJob(job, name, impact, color){
    color = color || 'info';
    if (!global['civic'][job]){
        global['civic'][job] = {
            job: job,
            name: name,
            display: false,
            workers: 0,
            max: 0,
            impact: impact
        };
    }
    
    var id = 'civ-' + job;
    
    var civ_container = $('<div id="' + id + '" v-show="display" class="job"></div>');
    var controls = $('<div class="controls"></div>');
    var job_label = $('<div class="job_label"><span class="has-text-' + color + '">{{ name }}</span><span class="count">{{ workers }} / {{ max }}</span></div>');
    civ_container.append(job_label);
    civ_container.append(controls);
    $('#civic').append(civ_container);
    
    var sub = $('<span class="sub" @click="sub">&laquo;</span>');
    var add = $('<span class="add" @click="add">&raquo;</span>');
    
    controls.append(sub);
    controls.append(add);
    
    vues['civ_'+job] = new Vue({
        data: global.civic[job],
        methods: {
            add(){
                if (global.civic[job].workers < global['civic'][job].max && global.civic.free > 0){
                    global.civic[job].workers++;
                    global.civic.free--;
                }
            },
            sub(){
                if (global.civic[job].workers > 0){
                    global.civic[job].workers--;
                    global.civic.free++;
                }
            }
        }
    });
    vues['civ_'+job].$mount('#'+id);
    
    var popper = $('<div id="pop'+id+'" class="popper has-background-light has-text-dark">'+ job_desc[job]() +'</div>');
    popper.hide();
    $('#main').append(popper);
    $('#'+id+' .job_label').on('mouseover',function(){
            popper.show();
            new Popper($('#'+id+' .job_label'),popper);
        });
    $('#'+id+' .job_label').on('mouseout',function(){
            popper.hide();
        });
}

function sizeApproximation(value,precision){
    if (value <= 9999){
        return +value.toFixed(precision);
    }
    else if (value <= 1000000){
        return +(value / 1000).toFixed(1) + 'K';
    }
    else if (value <= 1000000000){
        return +(value / 1000000).toFixed(1) + 'M';
    }
    else if (value <= 1000000000000){
        return +(value / 1000000000).toFixed(1) + 'G';
    }
    else if (value <= 1000000000000000){
        return +(value / 1000000000000).toFixed(1) + 'T';
    }
    else if (value <= 1000000000000000000){
        return +(value / 1000000000000000).toFixed(1) + 'P';
    }
    else if (value <= 1000000000000000000000){
        return +(value / 1000000000000000000).toFixed(1) + 'E';
    }
    else if (value <= 1000000000000000000000000){
        return +(value / 1000000000000000000000).toFixed(1) + 'Z';
    }
    else {
        return +(value / 1000000000000000000000000).toFixed(1) + 'Y';
    }
}
