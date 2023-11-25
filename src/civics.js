import { global, seededRandom, keyMultiplier, sizeApproximation } from './vars.js';
import { loc } from './locale.js';
import { calcPrestige, clearElement, popover, clearPopper, vBind, timeFormat, modRes, messageQueue, genCivName, darkEffect, eventActive, easterEgg, trickOrTreat } from './functions.js';
import { universeAffix } from './achieve.js';
import { races, racialTrait, traits, planetTraits, biomes, fathomCheck } from './races.js';
import { defineGovernor, govActive } from './governor.js';
import { drawTech } from  './actions.js';
import { jobScale } from './jobs.js';
import { astrologySign, astroVal } from './seasons.js';
import { warhead } from './resets.js';

// Sets up government in civics tab
export function defineGovernment(define){
    if (!global.civic['taxes']){
        global.civic['taxes'] = {
            tax_rate: 20,
            display: false
        };
    }

    if (define){
        return;
    }

    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 0)){
        return;
    }

    var govern = $('<div id="government" class="government is-child"></div>');

    var tabs = $(`<b-tabs class="resTabs govTabs2" v-show="vis()" v-model="s.govTabs2" :animated="s.animated">
        <b-tab-item id="r_govern0">
            <template slot="header">
                <h2 class="is-sr-only">${loc('civics_government')}}</h2>
                <span aria-hidden="true">${loc('civics_government')}</span>
            </template>
        </b-tab-item>
        <b-tab-item id="r_govern1" :visible="s.showGovernor">
            <template slot="header">
                <h2 class="is-sr-only">${loc('governor')}}</h2>
                <span aria-hidden="true">${loc('governor')}</span>
            </template>
        </b-tab-item>
    </b-tabs>`);

    govern.append(tabs);
    $('#r_civics').append(govern);

    vBind({
        el: '#government .govTabs2',
        data: {
            t: global.civic['taxes'],
            s: global.settings
        },
        methods: {
            vis(){
                return global.tech['govern'] ? true : false;
            }
        }
    });
    
    government($(`#r_govern0`));
    taxRates($(`#r_govern0`));

    var civ_garrison = $('<div id="c_garrison" v-show="g.display" class="garrison tile is-child"></div>');
    $('#r_govern0').append(civ_garrison);

    defineGovernor();
}

// Sets up garrison in civics tab
export function defineGarrison(){
    commisionGarrison();

    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 3)){
        return;
    }

    var garrison = $('<div id="garrison" v-show="vis()" class="garrison tile is-child"></div>');
    $('#military').append(garrison);
    $('#military').append($(`<div id="fortress"></div>`));
    
    buildGarrison(garrison,true);
    defineMad();
}

export function commisionGarrison(){
    if (!global.civic['garrison']){
        global.civic['garrison'] = {
            display: false,
            disabled: false,
            rate: 0,
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
    if (!global.civic.garrison['crew']){
        global.civic.garrison['crew'] = 0;
    }

    if (!global.civic['mad']){
        global.civic['mad'] = {
            display: false,
            armed: true
        };
    }
}

export function govRelationFactor(id){
    if (global.race['truepath']){
        if (global.civic.foreign[`gov${id}`].hstl < 10){
            return 1 + (10 - global.civic.foreign[`gov${id}`].hstl) / 40;
        }
        else if (global.civic.foreign[`gov${id}`].hstl > 60){
            return 1 - (-60 + global.civic.foreign[`gov${id}`].hstl) / 160;
        }
    }
    return 1;
}

export function govTitle(id){
    if (typeof global.civic.foreign[`gov${id}`]['name'] == "undefined"){
        let nameFrags = genCivName();
        global.civic.foreign[`gov${id}`]['name'] = {
            s0: nameFrags.s0,
            s1: nameFrags.s1
        };
    }

    return loc(`civics_gov${global.civic.foreign[`gov${id}`].name.s0}`,[global.civic.foreign[`gov${id}`].name.s1]);
}

const government_desc = (function(){
    return {
        anarchy: loc('govern_anarchy_effect'),
        autocracy: loc('govern_autocracy_effect',govEffect.autocracy()),
        democracy: loc('govern_democracy_effect',govEffect.democracy()),
        oligarchy: global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? loc('govern_oligarchy_effect_alt',[govEffect.oligarchy()[1]]) : loc('govern_oligarchy_effect',[govEffect.oligarchy()[0], govEffect.oligarchy()[1]]),
        theocracy: loc('govern_theocracy_effect',govEffect.theocracy()),
        theocracy_alt: loc('govern_theocracy_effect_alt',govEffect.theocracy()),
        republic: loc('govern_republic_effect',govEffect.republic()),
        socialist: loc('govern_socialist_effect',govEffect.socialist()),
        corpocracy: loc('govern_corpocracy_effect',govEffect.corpocracy()),
        technocracy: global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? loc('govern_technocracy_effect_alt',[govEffect.technocracy()[0],govEffect.technocracy()[2]]) : loc('govern_technocracy_effect',govEffect.technocracy()),
        federation: loc('govern_federation_effect',[govEffect.federation()[0],govEffect.federation()[1]]),
        federation_alt: loc('govern_federation_effect_alt',[25, govEffect.federation()[2], govEffect.federation()[1]]),
        magocracy: loc('govern_magocracy_effect',govEffect.magocracy()),
    };
});

export const govEffect = {
    autocracy(){
        let stress = global.tech['high_tech'] && global.tech['high_tech'] >= 2 ? ( global.tech['high_tech'] >= 12 ? 10 : 18 ) : 25;
        let attack = govActive('organizer',0) ? 40 : 35;
        return [stress, attack];
    },
    democracy(){
        let entertainer = global.tech['high_tech'] && global.tech['high_tech'] >= 2 ? ( global.tech['high_tech'] >= 12 ? 30 : 25 ) : 20;
        let work_malus = govActive('organizer',0) ? 1 : 5;
        return [entertainer, work_malus];
    },
    oligarchy(){
        let tax_penalty = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? 0 : ( global.tech['high_tech'] && global.tech['high_tech'] >= 2 ? 2 : 5 );
        let tax_cap = govActive('organizer',0) ? 25 : 20;
        return [tax_penalty, tax_cap];
    },
    theocracy(){
        let temple = 12;
        let prof_malus = govActive('organizer',0) ? 10 : 25;
        let sci_malus = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 25 : 40 ) : 50;
        return [temple, prof_malus, sci_malus];
    },
    republic(){
        let bankers = govActive('organizer',0) ? 30 : 25;
        let morale = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 40 : 30 ) : 20;
        return [bankers, morale];
    },
    socialist(){
        let crafting = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 50 : 42 ) : 35;
        let manufacture = govActive('organizer',0) ? 12 : 10;
        let stress = 10;
        let money_malus = govActive('organizer',0) ? 10 : 20;
        return [crafting, manufacture, stress, money_malus];
    },
    corpocracy(){
        let casino = govActive('organizer',0) ? 220 : 200;
        let lux = govActive('organizer',0) ? 175 : 150;
        let tourism = govActive('organizer',0) ? 110 : 100;
        let morale = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? 5 : 10;
        let factory = global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? 40 : 30;
        return [casino, lux, tourism, morale, factory];
    },
    technocracy(){
        let knowCost = 8;
        let mat = global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? 0 : ( global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? 1 : 2 );
        let knowGen = govActive('organizer',0) ? 18 : 10;
        return [knowCost, mat, knowGen];
    },
    federation(){
        let city = 3;
        let morale = govActive('organizer',0) ? 12 : 10;
        let unified = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 40 : 36 ) : 32;
        return [city,morale,unified];
    },
    magocracy(){
        let wiz = govActive('organizer',0) ? 30 : 25;
        let crystal = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 50 : 40 ) : 25;
        return [wiz, crystal];
    }
}

function government(govern){
    var gov = $('<div id="govType" class="govType" v-show="vis()"></div>');
    govern.append(gov);
    
    var type = $(`<div>${loc('civics_government_type')} <span id="govLabel" class="has-text-warning">{{ type | govern }}</span></div>`);
    gov.append(type);
    
    var setgov = $(`<div></div>`);
    gov.append(setgov);

    var change = $(`<span class="change inline"><button class="button" @click="trigModal" :disabled="rev > 0">{{ type | set }}</button></span>`);
    setgov.append(change);

    var modal = {
        template: '<div id="modalBox" class="modalBox"></div>'
    };

    vBind({
        el: '#govType',
        data: global.civic['govern'],
        filters: {
            govern(type){
                return loc(`govern_${type}`);
            },
            set(g){
                return g === 'anarchy' ? loc('civics_set_gov') : loc('civics_revolution');
            }
        },
        methods: {
            trigModal(){
                this.$buefy.modal.open({
                    parent: this,
                    component: modal
                });

                var checkExist = setInterval(function() {
                   if ($('#modalBox').length > 0) {
                      clearInterval(checkExist);
                      drawGovModal();
                   }
                }, 50);
            },
            startrev(){
                global.civic.govern.fr = global.civic.govern.rev;
                global.civic.govern.rev = 0;
            },
            force(){                
                return global.civic.govern.rev > 0 ? loc('civics_force_rev_desc') : loc('civics_force_rev_desc2');
            },
            vis(){
                return global.tech['govern'] ? true : false;
            }
        }
    });

    popover('govLabel', function(){
            let effect_type = global.tech['unify'] && global.tech['unify'] >= 2 && global.civic.govern.type === 'federation' ? 'federation_alt' : global.civic.govern.type;
            if (effect_type === 'theocracy' && global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                effect_type = 'theocracy_alt';
            }
            return $(`<div>${govDescription(global.civic.govern.type)}</div><div class="has-text-advanced">${government_desc()[effect_type]}</div>`);
        }
    );

    popover(`govTypeChange`, function(){
            return global.civic.govern.rev > 0 ? loc('civics_change_desc',[global.civic.govern.rev]) : loc('civics_change_desc2');
        },
        {
            elm: `#govType .change`
        }
    );
}

function govDescription(type){
    if (global.race['witch_hunter'] && type === 'magocracy'){
        return loc(`witch_hunter_magocracy`);
    }
    return loc(`govern_${type}_desc`);
}

function drawGovModal(){
    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('civics_government_type')}</p>`));
    let egg = easterEgg(6,10);
    if (egg.length > 0){
        $('#modalBoxTitle').append(egg);
    }
    let trick = trickOrTreat(6,14,false);
    if (trick.length > 0){
        $('#modalBoxTitle').append(trick);
    }
    
    var body = $('<div id="govModal" class="modalBody max40"></div>');
    $('#modalBox').append(body);

    if (global.tech['govern']){
        if (global.civic.govern.type !== 'autocracy'){
            body.append($(`<button class="button gap" data-gov="autocracy" @click="setGov('autocracy')">${loc(`govern_autocracy`)}</button>`));
        }
        if (global.civic.govern.type !== 'democracy'){
            body.append($(`<button class="button gap" data-gov="democracy" @click="setGov('democracy')">${loc(`govern_democracy`)}</button>`));
        }
        if (global.civic.govern.type !== 'oligarchy'){
            body.append($(`<button class="button gap" data-gov="oligarchy" @click="setGov('oligarchy')">${loc(`govern_oligarchy`)}</button>`));
        }
        if (global.tech['gov_theo'] && global.civic.govern.type !== 'theocracy'){
            body.append($(`<button class="button gap" data-gov="theocracy" @click="setGov('theocracy')">${loc(`govern_theocracy`)}</button>`));
        }
        if (global.tech['govern'] >= 2 && global.civic.govern.type !== 'republic'){
            body.append($(`<button class="button gap" data-gov="republic" @click="setGov('republic')">${loc(`govern_republic`)}</button>`));
        }
        if (global.tech['gov_soc'] && global.civic.govern.type !== 'socialist'){
            body.append($(`<button class="button gap" data-gov="socialist" @click="setGov('socialist')">${loc(`govern_socialist`)}</button>`));
        }
        if (global.tech['gov_corp'] && global.civic.govern.type !== 'corpocracy'){
            body.append($(`<button class="button gap" data-gov="corpocracy" @click="setGov('corpocracy')">${loc(`govern_corpocracy`)}</button>`));
        }
        if (global.tech['govern'] >= 3 && global.civic.govern.type !== 'technocracy'){
            body.append($(`<button class="button gap" data-gov="technocracy" @click="setGov('technocracy')">${loc(`govern_technocracy`)}</button>`));
        }
        if (global.tech['gov_fed'] && global.civic.govern.type !== 'federation'){
            body.append($(`<button class="button gap" data-gov="federation" @click="setGov('federation')">${loc(`govern_federation`)}</button>`));
        }
        if (global.tech['gov_mage'] && global.civic.govern.type !== 'magocracy'){
            body.append($(`<button class="button gap" data-gov="magocracy" @click="setGov('magocracy')">${loc(`govern_magocracy`)}</button>`));
        }
    }

    vBind({
        el: '#govModal',
        data: global.civic['govern'],
        methods: {
            setGov(g){
                if (global.civic.govern.rev === 0){
                    let drawTechs = global.genes['governor'] && global.civic.govern.type === 'anarchy';
                    global.civic.govern.type = g;
                    let time = 1000;
                    if (global.tech['high_tech']){
                        time += 250;
                        if (global.tech['high_tech'] >= 3){
                            time += 250;
                        }
                        if (global.tech['high_tech'] >= 6){
                            time += 250;
                        }
                    }
                    if (global.tech['space_explore'] && global.tech['space_explore'] >= 3){
                        time += 250;
                    }
                    if (global.race['unorganized']){
                        time = Math.round(time * (1 + traits.unorganized.vars()[0] / 100));
                    }
                    if (global.stats.achieve['anarchist']){
                        time = Math.round(time * (1 - (global.stats.achieve['anarchist'].l / 10)));
                    }
                    if (global.race['lawless']){
                        time = Math.round(time / (100 - traits.lawless.vars()[0]));
                    }
                    let fathom = fathomCheck('tuskin');
                    if (fathom > 0){
                        time = Math.round(time / (100 - traits.lawless.vars(1)[0] * fathom));
                    }
                    let aristoVal = govActive('aristocrat',0);
                    if (aristoVal){
                        time = Math.round(time * (1 - (aristoVal / 100)));
                    }
                    global.civic.govern.rev = time + global.civic.govern.fr;
                    if (drawTechs){
                        drawTech();
                    }
                    vBind({el: '#govModal'},'destroy');
                    $('.modal-background').click();
                    clearPopper();
                }
            }
        }
    });

    popover('GovPop', function(obj){
            let govType = $(obj.this).data('gov');
            let effectType = global.tech['unify'] && global.tech['unify'] >= 2 && govType === 'federation' ? 'federation_alt' : govType;
            if (effectType === 'theocracy' && global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                effectType = 'theocracy_alt';
            }
            return $(`<div>${govDescription(govType)}</div><div class="has-text-advanced">${government_desc()[effectType]}</div>`);
        },
        {
            elm: `#govModal button`,
            self: true,
            classes: `has-background-light has-text-dark`
        }
    );
}

export function foreignGov(){
    if ($('#foreign').length === 0 && !global.race['cataclysm'] && (!global.tech['world_control'] || global.race['truepath']) && !global.tech['isolation']){
        let foreign = $('<div id="foreign" v-show="vis()" class="government is-child"></div>');
        foreign.append($(`<div class="header"><h2 class="has-text-warning">${loc('civics_foreign')}</h2></div>`));
        $('#r_govern0').append(foreign);

        var modal = {
            template: '<div id="modalBox" class="modalBox"></div>'
        };

        let govEnd = global.race['truepath'] ? 5 : 3;
        for (let i=0;i<govEnd;i++){
            let gov = $(`<div id="gov${i}" class="foreign" v-show="gvis(${i})"><span class="has-text-caution">{{ '${i}' | gov }}</span><span v-if="f${i}.occ" class="has-text-advanced"> - ${loc('civics_garrison_occupy')}</span><span v-else-if="f${i}.anx" class="has-text-advanced"> - ${loc('civics_garrison_annex')}</span></span><span v-else-if="f${i}.buy" class="has-text-advanced"> - ${loc('civics_garrison_purchase')}</span></div>`);
            foreign.append(gov);

            let actions = $(`<div></div>`);
            actions.append($(`<button :label="battleAssessment(${i})" class="button gaction attack" @click="campaign(${i})"><span v-show="!f${i}.occ && !f${i}.anx && !f${i}.buy">${loc('civics_garrison_attack')}</span><span v-show="f${i}.occ || f${i}.anx || f${i}.buy">${loc('civics_garrison_unoccupy')}</span></button>`));
            actions.append($(`<span class="tspy inline"><button :label="spyDesc(${i})" v-show="t.spy >= 1 && !f${i}.occ && !f${i}.anx && !f${i}.buy" :disabled="spy_disabled(${i})" class="button gaction" @click="spy(${i})"><span v-show="f${i}.trn === 0">${loc('tech_spy')}: {{ f${i}.spy }}</span><span v-show="f${i}.trn > 0">${loc('civics_train')}: {{ f${i}.trn }}</span></button></span>`));
            actions.append($(`<span class="sspy inline"><button :label="espDesc()" v-show="t.spy >= 2 && !f${i}.occ && !f${i}.anx && !f${i}.buy && f${i}.spy >= 1" :disabled="f${i}.sab > 0" class="button gaction" @click="trigModal(${i})"><span v-show="f${i}.sab === 0">${loc('tech_espionage')}</span><span v-show="f${i}.sab > 0">{{ f${i}.act | sab }}: {{ f${i}.sab }}</span></button></span>`));
            gov.append(actions);

            gov.append($(`<div v-show="!f${i}.occ && !f${i}.anx && !f${i}.buy"><span class="has-text-advanced glabel">${loc('civics_gov_mil_rate')}:</span> <span class="glevel">{{ f${i}.mil | military(${i}) }}<span class="has-text-warning" v-show="f${i}.spy >= 2"> ({{ f${i}.mil }})</span></span></div>`));
            gov.append($(`<div v-show="!f${i}.occ && !f${i}.anx && !f${i}.buy"><span class="has-text-advanced glabel">${loc('civics_gov_relations')}:</span> <span class="glevel">{{ f${i}.hstl | relation }}<span class="has-text-warning" v-show="f${i}.spy >= 1"> ({{ f${i}.hstl | hate }})</span></span></div>`));
            gov.append($(`<div v-show="!f${i}.occ && !f${i}.anx && !f${i}.buy"><span class="has-text-advanced glabel">${loc('civics_gov_eco_rate')}:</span> <span class="glevel">{{ f${i}.eco | eco(${i}) }}<span class="has-text-warning" v-show="f${i}.spy >= 3"> ({{ f${i}.eco }})</span></span></div>`));
            gov.append($(`<div v-show="f${i}.spy >= 2 && !f${i}.occ && !f${i}.anx && !f${i}.buy"><span class="has-text-advanced glabel">${loc('civics_gov_unrest')}:</span> <span class="glevel">{{ f${i}.unrest | discontent(${i}) }}<span class="has-text-warning" v-show="f${i}.spy >= 4"> ({{ f${i}.unrest | turmoil }})</span></span></div>`));
        }

        let bindData = {
            f0: global.civic.foreign[`gov0`],
            f1: global.civic.foreign[`gov1`],
            f2: global.civic.foreign[`gov2`],
            t: global.tech
        };
        if (global.race['truepath']){
            bindData['f3'] = global.civic.foreign[`gov3`];
            bindData['f4'] = global.civic.foreign[`gov4`];
        }

        vBind({
            el: `#foreign`,
            data: bindData,
            filters: {
                military(m,i){
                    if (global.civic.foreign[`gov${i}`].spy >= 1){
                        if (m < 50){
                            return loc('civics_gov_v_weak');
                        }
                        else if (m < 75){
                            return loc('civics_gov_weak');
                        }
                        else if (m > 300){
                            return loc('civics_gov_superpower');
                        }
                        else if (m > 200){
                            return loc('civics_gov_v_strong');
                        }
                        else if (m > 160){
                            return loc('civics_gov_strong');
                        }
                        else if (m > 125){
                            return loc('civics_gov_above_average');
                        }
                        else {
                            return loc('civics_gov_average');
                        }
                    }
                    else {
                        return '???';
                    }
                },
                relation(r){
                    if (r > 80){
                        return loc('civics_gov_hated');
                    }
                    else if (r > 60){
                        return loc('civics_gov_hostile');
                    }
                    else if (r > 40){
                        return loc('civics_gov_poor');
                    }
                    else if (r > 25){
                        return loc('civics_gov_neutral');
                    }
                    else if (r > 10){
                        return loc('civics_gov_liked');
                    }
                    else {
                        return loc('civics_gov_good');
                    }
                },
                eco(e,i){
                    if (global.civic.foreign[`gov${i}`].spy >= 2){
                        if (e < 60){
                            return loc('civics_gov_weak');
                        }
                        else if (e < 80){
                            return loc('civics_gov_recession');
                        }
                        else if (e > 120){
                            return loc('civics_gov_strong');
                        }
                        else {
                            return loc('civics_gov_average');
                        }
                    }
                    else {
                        return '???';
                    }
                },
                discontent(r,i){
                    if (global.civic.foreign[`gov${i}`].spy >= 3){
                        if (r <= 0){
                            return loc('civics_gov_none');
                        }
                        else if (r < 30){
                            return loc('civics_gov_low');
                        }
                        else if (r < 60){
                            return loc('civics_gov_medium');
                        }
                        else if (r < 90){
                            return loc('civics_gov_high');
                        }
                        else {
                            return loc('civics_gov_extreme');
                        }
                    }
                    else {
                        return '???';
                    }
                },
                gov(id){
                    return govTitle(id);
                },
                sab(s){
                    return s === 'none' ? '' : loc(`civics_spy_${s}`);
                },
                hate(h){
                    return `${100 - h}%`;
                },
                turmoil(u){
                    return `${u}%`;
                },
            },
            methods: {
                campaign(gov){
                    war_campaign(gov);
                },
                battleAssessment(gov){
                    return battleAssessment(gov);
                },
                trigModal(i){
                    this.$buefy.modal.open({
                        parent: this,
                        component: modal
                    });

                    var checkExist = setInterval(function() {
                    if ($('#modalBox').length > 0) {
                        clearInterval(checkExist);
                        drawEspModal(i);
                    }
                    }, 50);
                },
                spy_disabled(i){
                    return global.civic.foreign[`gov${i}`].trn > 0 || spyCost(i) > global.resource.Money.amount ? true : false;
                },
                spy(i){
                    trainSpy(i);
                },
                spyDesc(i){
                    return spyDesc(i);
                },
                espDesc(){
                    return espDesc();
                },
                vis(){
                    return global.civic.garrison.display && (!global.tech['world_control'] || global.race['truepath']) && !global.race['cataclysm'] && !global.tech['isolation'] ? true : false;
                },
                gvis(g){
                    if (global.tech['isolation']){ return false; }
                    if (g <= 2){
                        return global.tech['world_control'] ? false : true;
                    }
                    else if (g === 3){
                        return global.tech['rival'] ? true : false;
                    }
                    return false;
                }
            }
        });

        for (let i=0; i<govEnd; i++){
            popover(`gov${i}a`,
                function(){ return '<span>{{ label() }}</span>'; },
                {
                    elm: `#gov${i} .attack`,
                    in: function(obj){
                        vBind({
                            el: `#${obj.id} > span`,
                            data: { test: 'val' },
                            methods: {
                                label(){
                                    return battleAssessment(i);
                                }
                            }
                        });
                    },
                    out: function(obj){
                        vBind({el: obj.id},'destroy');
                    },
                }
            );
            popover(`gov${i}ts`,
                function(){ return '<span>{{ label() }}</span>'; },
                {
                    elm: `#gov${i} .tspy`,
                    in: function(obj){
                        vBind({
                            el: `#${obj.id} > span`,
                            data: { test: 'val' },
                            methods: {
                                label(){
                                    return spyDesc(i);
                                }
                            }
                        });
                    },
                    out: function(obj){
                        vBind({el: obj.id},'destroy');
                    },
                }
            );
            popover(`gov${i}s`,
                function(){
                    return espDesc();
                },
                {
                    elm: `#gov${i} .sspy`
                }
            );
        }

        if (global.race['truepath']){
            popover(`garRivaldesc1`,
                function(){ return loc(`civics_gov_tp_rival`,[govTitle(3),races[global.race.species].home]); },
                {
                    elm: `#gov3 > span`,
                }
            );
        }
    }
}

function spyDesc(i){
    if (global.civic.foreign[`gov${i}`].trn > 0){
        return loc('civics_progress');
    }
    let cost = sizeApproximation(spyCost(i));
    return loc('civics_gov_spy_desc',[cost]);
}

function espDesc(){
    return loc('civics_gov_esp_desc');
}

function spyCost(i){
    let base = Math.round((global.civic.foreign[`gov${i}`].mil / 2) + (global.civic.foreign[`gov${i}`].hstl / 2) - global.civic.foreign[`gov${i}`].unrest) + 10;
    if (base < 50){
        base = 50;
    }
    if (global.race['infiltrator']){
        base /= 3;
    }
    if (astrologySign() === 'scorpio'){
        base *= 1 - (astroVal('scorpio')[0] / 100);
    }
    return Math.round(base ** (global.civic.foreign[`gov${i}`].spy + 1)) + 500;
}

function trainSpy(i){
    if (global.tech['spy'] && global.civic.foreign[`gov${i}`].trn === 0){
        let cost = spyCost(i)
        if (global.resource.Money.amount >= cost){
            global.resource.Money.amount -= cost;
            let time = 300;
            if (global.tech['spy'] >= 3 && global.city['boot_camp']){
                time -= (global.race['orbit_decayed'] && global.space['space_barracks'] ? global.space.space_barracks.on : global.city['boot_camp'].count) * 10;
                if (time < 10){
                    time = 10;
                }
            }
            if (global.race['infiltrator']){
                time = Math.round(time / 2);
            }
            global.civic.foreign[`gov${i}`].trn = time;
        }
    }
}

function govPrice(gov){
    let price = global.civic.foreign[`gov${gov}`].eco * 15384;
    price *= 1 + global.civic.foreign[`gov${gov}`].hstl * 1.6 / 100;
    price *= 1 - global.civic.foreign[`gov${gov}`].unrest * 0.25 / 100;
    return +price.toFixed(0);
}
    
export function checkControlling(gov){
    if (gov){
        return global.tech['world_control'] || global.civic.foreign[gov].occ || global.civic.foreign[gov].anx || global.civic.foreign[gov].buy;
    }
    return global.civic.foreign.gov0.occ || global.civic.foreign.gov1.occ || global.civic.foreign.gov2.occ || global.civic.foreign.gov0.anx || global.civic.foreign.gov1.anx || global.civic.foreign.gov2.anx || global.civic.foreign.gov0.buy || global.civic.foreign.gov1.buy || global.civic.foreign.gov2.buy;
}

function spyAction(sa,g){
    switch (sa){
        case 'influence':
            {
                if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${g}`].spy >= 1 && global.civic.foreign[`gov${g}`].sab === 0){
                    let timer = global.tech['spy'] >= 4 ? 200 : 300;
                    if (global.race['befuddle']){
                        timer = Math.round(timer * (1 - traits.befuddle.vars()[0] / 100));
                    }
                    let fathom = fathomCheck('dryad');
                    if (fathom > 0){
                        timer = Math.round(timer * (1 - traits.befuddle.vars(1)[0] / 100 * fathom));
                    }
                    global.civic.foreign[`gov${g}`].sab = timer;
                    global.civic.foreign[`gov${g}`].act = 'influence';
                }
            }
            break;
        case 'sabotage':
            {
                if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${g}`].spy >= 1 && global.civic.foreign[`gov${g}`].sab === 0){
                    let timer = global.tech['spy'] >= 4 ? 400 : 600;
                    if (global.race['befuddle']){
                        timer = Math.round(timer * (1 - traits.befuddle.vars()[0] / 100));
                    }
                    let fathom = fathomCheck('dryad');
                    if (fathom > 0){
                        timer = Math.round(timer * (1 - traits.befuddle.vars(1)[0] / 100 * fathom));
                    }
                    global.civic.foreign[`gov${g}`].sab = timer;
                    global.civic.foreign[`gov${g}`].act = 'sabotage';
                }
            }
            break;
        case 'incite':
            {
                if (g >= 3){ break; }
                else if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${g}`].spy >= 1 && global.civic.foreign[`gov${g}`].sab === 0){
                    let timer = global.tech['spy'] >= 4 ? 600 : 900;
                    if (global.race['befuddle']){
                        timer = Math.round(timer * (1 - traits.befuddle.vars()[0] / 100));
                    }
                    let fathom = fathomCheck('dryad');
                    if (fathom > 0){
                        timer = Math.round(timer * (1 - traits.befuddle.vars(1)[0] / 100 * fathom));
                    }
                    global.civic.foreign[`gov${g}`].sab = timer;
                    global.civic.foreign[`gov${g}`].act = 'incite';
                }
            }
            break;
    }
}

function drawEspModal(gov){
    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('civics_espionage_actions')}</p>`));
    
    var body = $('<div id="espModal" class="modalBody max40"></div>');
    $('#modalBox').append(body);

    if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${gov}`].spy >= 1){
        body.append($(`<button class="button gap" data-esp="influence" @click="influence('${gov}')">${loc(`civics_spy_influence`)}</button>`));
        body.append($(`<button class="button gap" data-esp="sabotage" @click="sabotage('${gov}')">${loc(`civics_spy_sabotage`)}</button>`));
        if (gov < 3){
            body.append($(`<button class="button gap" data-esp="incite" @click="incite('${gov}')">${loc(`civics_spy_incite`)}</button>`));
        }
        if (gov < 3 && global.civic.foreign[`gov${gov}`].hstl <= 50 && global.civic.foreign[`gov${gov}`].unrest >= 50){
            body.append($(`<button class="button gap" data-esp="annex" @click="annex('${gov}')">${loc(`civics_spy_annex`)}</button>`));
        }
        if (gov < 3 && global.civic.foreign[`gov${gov}`].spy >= 3){
            body.append($(`<button class="button gap" data-esp="purchase" @click="purchase('${gov}')">${loc(`civics_spy_purchase`)}</button>`));
        }
    }

    vBind({
        el: '#espModal',
        data: global.civic.foreign[`gov${gov}`],
        methods: {
            influence(g){
                if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${g}`].spy >= 1){
                    spyAction('influence',g);
                    vBind({el: '#espModal'},'destroy');
                    $('.modal-background').click();
                    clearPopper();
                }
            },
            sabotage(g){
                if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${g}`].spy >= 1){
                    spyAction('sabotage',g);
                    vBind({el: '#espModal'},'destroy');
                    $('.modal-background').click();
                    $('#popGov').hide();
                    clearPopper();
                }
            },
            incite(g){
                if (g >= 3){ return; }
                if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${g}`].spy >= 1){
                    spyAction('incite',g);
                    vBind({el: '#espModal'},'destroy');
                    $('.modal-background').click();
                    clearPopper();
                }
            },
            annex(g){
                if (g >= 3){ return; }
                if (global.civic.foreign[`gov${gov}`].hstl <= 50 && global.civic.foreign[`gov${gov}`].unrest >= 50 && global.city.morale.current >= (200 + global.civic.foreign[`gov${gov}`].hstl - global.civic.foreign[`gov${gov}`].unrest)){
                    if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${g}`].spy >= 1 && global.civic.foreign[`gov${g}`].sab === 0){
                        let timer = global.tech['spy'] >= 4 ? 150 : 300;
                        if (global.race['befuddle']){
                            timer = Math.round(timer * (1 - traits.befuddle.vars()[0] / 100));
                        }
                        let fathom = fathomCheck('dryad');
                        if (fathom > 0){
                            timer = Math.round(timer * (1 - traits.befuddle.vars(1)[0] / 100 * fathom));
                        }
                        global.civic.foreign[`gov${g}`].sab = timer;
                        global.civic.foreign[`gov${g}`].act = 'annex';
                        vBind({el: '#espModal'},'destroy');
                        $('.modal-background').click();
                        clearPopper();
                    }
                }
            },
            purchase(g){
                if (g >= 3){ return; }
                let price = govPrice(g);
                if (price <= global.resource.Money.amount){
                    if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${g}`].spy >= 3 && global.civic.foreign[`gov${g}`].sab === 0){
                        global.resource.Money.amount -= price;
                        let timer = global.tech['spy'] >= 4 ? 150 : 300;
                        if (global.race['befuddle']){
                            timer = Math.round(timer * (1 - traits.befuddle.vars()[0] / 100));
                        }
                        let fathom = fathomCheck('dryad');
                        if (fathom > 0){
                            timer = Math.round(timer * (1 - traits.befuddle.vars(1)[0] / 100 * fathom));
                        }
                        global.civic.foreign[`gov${g}`].sab = timer;
                        global.civic.foreign[`gov${g}`].act = 'purchase';
                        vBind({el: '#espModal'},'destroy');
                        $('.modal-background').click();
                        clearPopper();
                    }
                }
            }
        }
    });

    popover('GovLabel', function(obj){
            let esp = $(obj.this).data('esp');
            let desc = '';
            if (esp === 'purchase'){
                let price = govPrice(gov).toLocaleString();
                desc = loc(`civics_spy_${esp}_desc`,[govTitle(gov),price])
            }
            else if (esp === 'annex'){
                if (global.city.morale.current >= (200 + global.civic.foreign[`gov${gov}`].hstl - global.civic.foreign[`gov${gov}`].unrest)){
                    desc = loc(`civics_spy_${esp}_desc`,[govTitle(gov)]);
                }
                else {
                    let morale = 200 + global.civic.foreign[`gov${gov}`].hstl - global.civic.foreign[`gov${gov}`].unrest
                    desc = loc(`civics_spy_${esp}_goal`,[govTitle(gov),morale]);
                }
            }
            else {
                desc = loc(`civics_spy_${esp}_desc`,[govTitle(gov)]);
            }
            
            let warn = '';
            if (
                (esp === 'influence' && global.civic.foreign[`gov${gov}`].hstl === 0) || 
                (esp === 'sabotage' && global.civic.foreign[`gov${gov}`].spy >= 2 && global.civic.foreign[`gov${gov}`].mil === 50) || 
                (esp === 'incite' && global.civic.foreign[`gov${gov}`].spy >= 4 && global.civic.foreign[`gov${gov}`].unrest === 100)
            ){
                warn = `<div class="has-text-danger">${loc(`civics_spy_warning`)}</div>`;
            }
            return $(`${warn}<div>${desc}</div>`);
        },
        {
            elm: `#espModal button`,
            self: true,
            classes: `has-background-light has-text-dark`
        }
    );
}

function taxCap(min){
    let extreme = global.tech['currency'] && global.tech.currency >= 5 ? true : false;
    if (min){
        return (extreme || global.race['terrifying']) && !global.race['noble'] ? 0 : (global.race['noble'] ? traits.noble.vars()[0] : 10);
    }
    else {
        let cap = 30;
        if (global.race['noble']){
            cap = traits.noble.vars()[1];
        }
        else if (extreme || global.race['terrifying']){
            cap += 20;
        }
        if (global.civic.govern.type === 'oligarchy'){
            cap += govEffect.oligarchy()[1];
        }
        let aristoVal = govActive('aristocrat',1);
        if (aristoVal){
            cap += aristoVal;
        }
        return cap;
    }
}

function adjustTax(a,n){
    switch (a){
        case 'add':
            {
                let inc = n || keyMultiplier();
                let cap = taxCap(false);
                if (global.race['noble']){
                    global.civic.taxes.tax_rate += inc;
                    if (global.civic.taxes.tax_rate > (global.civic.govern.type === 'oligarchy' ? traits.noble.vars()[1] + 20 : traits.noble.vars()[1])){
                        global.civic.taxes.tax_rate = global.civic.govern.type === 'oligarchy' ? traits.noble.vars()[1] + 20 : traits.noble.vars()[1];
                    }
                }
                else if (global.civic.taxes.tax_rate < cap){
                    global.civic.taxes.tax_rate += inc;
                    if (global.civic.taxes.tax_rate > cap){
                        global.civic.taxes.tax_rate = cap;
                    }
                }
            }
            break;
        case 'sub':
            {
                let dec = n || keyMultiplier();
                let min = taxCap(true);
                if (global.civic.taxes.tax_rate > min){
                    global.civic.taxes.tax_rate -= dec;
                    if (global.civic.taxes.tax_rate < min){
                        global.civic.taxes.tax_rate = min;
                    }
                }
            }
            break;
    }
}

function taxRates(govern){
    var tax_rates = $('<div id="tax_rates" v-show="display" class="taxRate"></div>');
    govern.append(tax_rates);
    
    var label = $(`<h3 id="taxRateLabel">${loc('civics_tax_rates')}</h3>`);
    tax_rates.append(label);
    
    var tax_level = $('<span class="current" v-html="$options.filters.tax_level(tax_rate)"></span>');
    var sub = $(`<span role="button" aria-label="decrease taxes" class="sub has-text-success" @click="sub">&laquo;</span>`);
    var add = $(`<span role="button" aria-label="increase taxes" class="add has-text-danger" @click="add">&raquo;</span>`);
    tax_rates.append(sub);
    tax_rates.append(tax_level);
    tax_rates.append(add);
    
    vBind({
        el: '#tax_rates',
        data: global.civic['taxes'],
        filters: {
            tax_level(rate){
                let egg = easterEgg(11,14);
                let trick = trickOrTreat(2,14,false);
                if (egg.length > 0 && ((rate === 0 && !global.race['noble']) || (rate === 10 && global.race['noble']))){
                    return egg;
                }
                else if (rate === 13 && trick.length > 0){
                    return trick;
                }
                else {
                    return `${rate}%`;
                }
            }
        },
        methods: {
            add(){
                adjustTax('add');
            },
            sub(){
                adjustTax('sub');
            }
        }
    });
    
    popover('taxRateLabel', function(){
            return loc('civics_tax_rates_desc');
        },
        {
            classes: `has-background-light has-text-dark`
        }
    );
}

export function govCivics(f,v){
    switch (f){
        case 'm_cost':
            return mercCost();
        case 'm_buy':
            return hireMerc(1);
        case 's_cost':
            return spyCost(v);
        case 't_spy':
            return trainSpy(v);
        case 'adj_tax':
            return adjustTax(v,1);
        case 'tax_cap':
            return taxCap(v);
        case 's_influence':
            return spyAction('influence',v);
        case 's_sabotage':
            return spyAction('sabotage',v);
        case 's_incite':
            return spyAction('incite',v);
    }
}

function mercCost(){
    let cost = Math.round((1.24 ** global.civic.garrison.workers) * 75) - 50;
    if (cost > 25000){
        cost = 25000;
    }
    if (global.civic.garrison.m_use > 0){
        cost *= 1.1 ** global.civic.garrison.m_use;
    }
    if (global.race['brute']){
        cost *= 1 - (traits.brute.vars()[0] / 100);
    }
    let fathom = fathomCheck('orc');
    if (fathom > 0){
        cost *= 1 - (traits.brute.vars(1)[0] / 100 * fathom);
    }
    if (global.race['inflation']){
        cost *= 1 + (global.race.inflation / 500);
    }
    if (global.race['high_pop']){
        cost *= traits.high_pop.vars()[1] / 100;
    }
    return Math.round(cost);
}

function hireMerc(num){
    if (global.tech['mercs']){
        let repeats = num || keyMultiplier();
        let canBuy = true;
        while (canBuy && repeats > 0){
            let cost = mercCost();
            if (global.civic['garrison'].workers < global.civic['garrison'].max && global.resource.Money.amount >= cost){
                global.resource.Money.amount -= cost;
                global.civic['garrison'].workers++;
                global.civic.garrison.m_use++;
            }
            else {
                canBuy = false;
            }
            repeats--;
        }
    }
}

export function buildGarrison(garrison,full){
    clearElement(garrison);
    if (global.tech['world_control'] && !global.race['truepath']){
        garrison.append($(`<div class="header"><h2 class="has-text-warning">${loc('civics_garrison')}</h2> - <span class="has-text-success">${loc('rating')} <span class="defenseRating">{{ g.workers | hell | rating }}</span></div>`));
    }
    else {
        garrison.append($(`<div class="header"><h2 class="has-text-warning">${loc('civics_garrison')}</h2> - <span class="has-text-success">${loc('rating')} <span class="defenseRating">{{ g.workers | hell | rating }}</span> / <span class="offenseRating">{{ g.raid | rating }}</span></span></div>`));
    }

    var barracks = $('<div class="columns is-mobile bunk"></div>');
    garrison.append(barracks);

    var bunks = $('<div class="bunks"></div>');
    barracks.append(bunks);
    let soldier_title = global.tech['world_control'] && !global.race['truepath'] ? loc('civics_garrison_peacekeepers') : loc('civics_garrison_soldiers');
    if (!global.tech['isolation']){
        bunks.append($(`<div class="barracks"><span class="soldier">${soldier_title}</span> <span v-html="$options.filters.stationed(g.workers)"></span> / <span>{{ g.max | s_max }}<span></div>`));
        bunks.append($(`<div class="barracks" v-show="g.crew > 0"><span class="crew">${loc('civics_garrison_crew')}</span> <span>{{ g.crew }}</span></div>`));
        bunks.append($(`<div class="barracks"><span class="wounded">${loc('civics_garrison_wounded')}</span> <span v-html="$options.filters.wounded(g.wounded)"></span></div>`));

        barracks.append($(`<div class="hire"><button v-show="g.mercs" class="button first hmerc" @click="hire">${loc('civics_garrison_hire_mercenary')}</button><div>`));
    }
    
    if (full){
        let egg8 = '';
        if (global.tech['isolation']){
            egg8 = easterEgg(8,12);
        }

        garrison.append($(`<div class="training"><span>${loc('civics_garrison_training')} - ${loc('arpa_to_complete')} {{ g.rate, g.progress | trainTime }}${egg8}</span> <progress class="progress" :value="g.progress" max="100">{{ g.progress }}%</progress></div>`));
    }

    var campaign = $('<div class="columns is-mobile battle"></div>');
    garrison.append(campaign);

    var wrap = $('<div class="war"></div>');
    campaign.append(wrap);

    if ((!global.tech['world_control'] || global.race['truepath']) && !global.race['cataclysm'] && !global.tech['isolation']){
        var tactics = $(`<div id="${full ? 'tactics' : 'c_tactics'}" v-show="g.display" class="tactics"><span>${loc('civics_garrison_campaign')}</span></div>`);
        wrap.append(tactics);
            
        var strategy = $('<span class="current tactic">{{ g.tactic | tactics }}</span>');
        var last = $('<span role="button" aria-label="easier campaign" class="sub" @click="last">&laquo;</span>');
        var next = $('<span role="button" aria-label="harder campaign" class="add" @click="next">&raquo;</span>');
        tactics.append(last);
        tactics.append(strategy);
        tactics.append(next);

        var battalion = $(`<div id="${full ? 'battalion' : 'c_battalion'}" v-show="g.display" class="tactics"><span>${loc('civics_garrison_battalion')}</span></div>`);
        wrap.append(battalion);
            
        var armysize = $('<span class="current bat">{{ g.raid }}</span>');
        var alast = $('<span role="button" aria-label="remove soldiers from campaign" class="sub" @click="aLast">&laquo;</span>');
        var anext = $('<span role="button" aria-label="add soldiers to campaign" class="add" @click="aNext">&raquo;</span>');
        battalion.append(alast);
        battalion.append(armysize);
        battalion.append(anext);

        if (full){
            if (global.race['truepath'] && global.tech['rival']){
                campaign.append($(`<div class="launch gov3" v-show="rvis()"><div class="has-text-caution">${govTitle(3)}</div><button class="button campaign" @click="campaign(3)"><span>${loc('civics_garrison_launch_campaign')}</span></button></div>`));
            }
            if (!global.tech['world_control']){
                campaign.append($(`<div class="launch gov0"><div class="has-text-caution">${govTitle(0)}</div><button class="button campaign" @click="campaign(0)"><span v-show="!g0.occ && !g0.anx && !g0.buy">${loc('civics_garrison_launch_campaign')}</span><span v-show="g0.occ || g0.anx || g0.buy">${loc('civics_garrison_deoccupy')}</span></button></div>`));
                campaign.append($(`<div class="launch gov1"><div class="has-text-caution">${govTitle(1)}</div><button class="button campaign" @click="campaign(1)"><span v-show="!g1.occ && !g1.anx && !g1.buy">${loc('civics_garrison_launch_campaign')}</span><span v-show="g1.occ || g1.anx || g1.buy">${loc('civics_garrison_deoccupy')}</span></button></div>`));
                campaign.append($(`<div class="launch gov2"><div class="has-text-caution">${govTitle(2)}</div><button class="button campaign" @click="campaign(2)"><span v-show="!g2.occ && !g2.anx && !g2.buy">${loc('civics_garrison_launch_campaign')}</span><span v-show="g2.occ || g2.anx || g2.buy">${loc('civics_garrison_deoccupy')}</span></button></div>`));
            }
        }
    }

    let bindData = { 
        g: global.civic.garrison,
        g0: global.civic.foreign.gov0,
        g1: global.civic.foreign.gov1,
        g2: global.civic.foreign.gov2,
    };
    if (global.race['truepath']){
        bindData['g3'] = global.civic.foreign.gov3;
        bindData['g4'] = global.civic.foreign.gov4;
    }

    vBind({
        el: full ? '#garrison' : '#c_garrison',
        data: bindData,
        methods: {
            hire(){
                hireMerc();
            },
            campaign(gov){
                war_campaign(gov);
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
            },
            vis(){
                return global.civic.garrison.display;
            },
            rvis(){
                return global.tech['rival'] && !global.tech['isolation'] ? true : false;
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
                let size = garrisonSize();
                let trickNum = global.race['cataclysm'] ? 13 : 31;
                let trick = size === trickNum && !full ? trickOrTreat(2,14,true) : false;
                return size === trickNum && trick.length > 0 ? trick : size;
            },
            s_max(v){
                return garrisonSize(true);
            },
            wounded(w){
                let egg = easterEgg(8,12);
                if (full && w === 0 && egg.length > 0){
                    return egg;
                }
                return eventActive('fool',2021) ? garrisonSize() - w : w;
            },
            trainTime(r,p){
                return r === 0 ? timeFormat(-1) : timeFormat((100 - p) / (r * 4));
            }
        }
    });

    ['tactic','bat','soldier','crew','wounded','hmerc','defenseRating','offenseRating'].forEach(function(k){
        popover(full ? `garrison${k}` : `cGarrison${k}`,
            function(){ return '<span>{{ label() }}</span>'; },
            {
                elm: `${full ? '#garrison' : '#c_garrison'} .${k}`,
                in: function(obj){
                    vBind({
                        el: `#${obj.id} > span`,
                        data: { test: 'val' },
                        methods: {
                            label(){
                                switch(k){
                                    case 'tactic':
                                        {
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
                                                    return loc('civics_garrison_tactic_siege_desc',[jobScale(global.civic.govern.type === 'federation' ? 15 : 20)]);
                                            }
                                        }
                                    case 'bat':
                                        return loc('civics_garrison_army_label');
                                    case 'soldier':
                                        return describeSoldier();
                                    case 'crew':
                                        return loc('civics_garrison_crew_desc');
                                    case 'wounded':
                                        return loc('civics_garrison_wounded_desc');
                                    case 'hmerc':
                                        {
                                            let cost = Math.round(mercCost()).toLocaleString();
                                            return loc('civics_garrison_hire_mercenary_cost',[cost]);
                                        }
                                    case 'defenseRating':
                                        return loc('civics_garrison_defensive_rate');
                                    case 'offenseRating':
                                        return loc('civics_garrison_offensive_rate');
                                }
                            }
                        }
                    });
                },
                out: function(obj){
                    vBind({el: obj.id},'destroy');
                },
            }
        );
    });

    if (full){
        let end = global.race['truepath'] ? 4 : 3;
        for (let i=0; i<end; i++){
            popover(`garrison${i}`,
                function(){ return '<span>{{ label() }}</span>'; },
                {
                    elm: `#garrison .gov${i} button`,
                    in: function(obj){
                        vBind({
                            el: `#${obj.id} > span`,
                            data: { test: 'val' },
                            methods: {
                                label(){
                                    return battleAssessment(i);
                                }
                            }
                        });
                    },
                    out: function(obj){
                        vBind({el: obj.id},'destroy');
                    },
                }
            );
        }
        if (global.race['truepath'] && !global.tech['isolation']){
            popover(`garRivaldesc2`,
                function(){ return loc(`civics_gov_tp_rival`,[govTitle(3),races[global.race.species].home]); },
                {
                    elm: `#garrison .gov3 > div`,
                }
            );
        }
    }
}

export function describeSoldier(){
    let rating = armyRating(garrisonSize(),'hunting');

    let loot_args = [];
    if ((!global.race['herbivore'] || global.race['carnivore']) && !global.race['artifical']) {
        let food = +(rating / 3).toFixed(2);
        loot_args.push(food, global.resource.Food.name);
    }
    let fur = +(rating / 10).toFixed(2);
    loot_args.push(fur, global.resource.Furs.name);
    if (global.race['evil'] && !global.race['kindling_kindred'] && !global.race['smoldering']) {
        let bones = +(rating / (global.race['soul_eater'] ? 3 : 5)).toFixed(2);
        loot_args.push(bones, global.resource.Lumber.name);
    }
    let loot_string = 'civics_garrison_soldier_loot' + (loot_args.length / 2);

    let soldiers_desc = global.race['evil'] && global.race['soul_eater']
      ? 'civics_garrison_soldier_evil_desc'
      : 'civics_garrison_soldier_desc';

    return loc(soldiers_desc) + loc(loot_string, loot_args);
}

function battleAssessment(gov){
    if (global.civic.foreign[`gov${gov}`].occ){
        return loc('civics_garrison_deoccupy_desc');
    }
    else if (global.civic.foreign[`gov${gov}`].buy || global.civic.foreign[`gov${gov}`].anx){
        return loc('civics_garrison_secede_desc');
    }
    else if (
        (global.civic.garrison.tactic <= 1 && global.civic.foreign[`gov${gov}`].spy < 1) || 
        (global.civic.garrison.tactic >= 2 && global.civic.garrison.tactic <= 3 && global.civic.foreign[`gov${gov}`].spy < 2) || 
        (global.civic.garrison.tactic === 4 && global.civic.foreign[`gov${gov}`].spy < 3)
        ){
        return loc('civics_garrison_no_spy');
    }
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
    enemy *= global.civic.foreign[`gov${gov}`].mil / 100;
    if (global.race['banana']){
        enemy *= 2;
    }
    if (global.city.biome === 'swamp'){
        enemy *= biomes.swamp.vars()[0];
    }

    if (eventActive('fool',2021)){
        enemy /= 1.25;
    }

    if (army < enemy){
        return loc('civics_garrison_disadvantage',[+((1 - (army / enemy)) * 100).toFixed(1)]);
    }
    else {
        return loc('civics_garrison_advantage',[+((1 - (enemy / army)) * 100).toFixed(1)]);
    }
}

function war_campaign(gov){
    if (global.civic.foreign[`gov${gov}`].occ){
        global.civic.foreign[`gov${gov}`].occ = false;
        global.civic.garrison.max += jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
        global.civic.garrison.workers += jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
        return;
    }
    if (global.civic.foreign[`gov${gov}`].buy || global.civic.foreign[`gov${gov}`].anx){
        global.civic.foreign[`gov${gov}`].buy = false;
        global.civic.foreign[`gov${gov}`].anx = false;
        return;
    }

    if (global.civic.garrison.raid > garrisonSize()){
        global.civic.garrison.raid = garrisonSize();
    }
    else if (global.civic.garrison.raid < 0){
        global.civic.garrison.raid = 0;
    }
    
    if (global.civic.garrison.raid === 0){
        messageQueue(loc('civics_garrison_campaign_no_soldier'),'warning',false,['combat']);
        return;
    }
    global.stats.attacks++;

    let highLuck = global.race['claws'] ? 20 : 16;
    let lowLuck = global.race['puny'] ? 3 : 5;

    let luck = Math.floor(seededRandom(lowLuck,highLuck,true)) / 10;
    let army = armyRating(global.civic.garrison.raid,'army') * luck;
    let enemy = 0;

    switch(global.civic.garrison.tactic){
        case 0:
            enemy = seededRandom(0,10,true);
            global.civic.foreign[`gov${gov}`].hstl += Math.floor(seededRandom(0,2,true));
            break;
        case 1:
            enemy = seededRandom(5,50,true);
            global.civic.foreign[`gov${gov}`].hstl += Math.floor(seededRandom(0,3,true));
            break;
        case 2:
            enemy = seededRandom(25,100,true);
            global.civic.foreign[`gov${gov}`].hstl += Math.floor(seededRandom(1,5,true));
            break;
        case 3:
            enemy = seededRandom(50,200,true);
            global.civic.foreign[`gov${gov}`].hstl += Math.floor(seededRandom(4,12,true));
            break;
        case 4:
            enemy = seededRandom(100,500,true);
            global.civic.foreign[`gov${gov}`].hstl += Math.floor(seededRandom(10,25,true));
            break;
    }
    enemy = Math.floor(enemy * global.civic.foreign[`gov${gov}`].mil / 100);
    if (global.race['banana']){
        enemy *= 2;
    }
    if (global.city.biome === 'swamp'){
        enemy *= biomes.swamp.vars()[0];
    }
    if (global.race['mistrustful']){
        global.civic.foreign[`gov${gov}`].hstl += traits.mistrustful.vars()[0];
    }
    if (global.civic.foreign[`gov${gov}`].hstl > 100){
        global.civic.foreign[`gov${gov}`].hstl = 100;
    }

    if (global.race['blood_thirst']){
        global.race['blood_thirst_count'] += Math.ceil(enemy / 5);
        if (global.race['blood_thirst_count'] > traits.blood_thirst.vars()[0]){
            global.race['blood_thirst_count'] = traits.blood_thirst.vars()[0];
        }
    }

    let wounded = 0;
    if (global.civic.garrison.raid > global.civic.garrison.workers - global.civic.garrison.crew - global.civic.garrison.wounded){
        wounded = global.civic.garrison.raid - (global.civic.garrison.workers - global.civic.garrison.crew - global.civic.garrison.wounded);
    }

    global.civic.garrison.fatigue++;

    if (army > enemy){
        let deathCap = Math.floor(global.civic.garrison.raid / (5 - global.civic.garrison.tactic));
        deathCap += wounded;
        if (global.city.ptrait.includes('rage')){
            deathCap += planetTraits.rage.vars()[2];
        }
        if (deathCap < 1){
            deathCap = 1;
        }
        if (deathCap > looters()){
            deathCap = looters();
        }
        let death = Math.floor(seededRandom(0,deathCap,true));
        if (global.race['frail']){
            death += traits.frail.vars()[0];
        }
        let armor = 0;
        if (global.race['scales']){
            armor += traits.scales.vars()[0];
        }
        if (global.tech['armor']){
            armor += global.tech['armor'];
        }
        if (global.race['high_pop']){
            armor += Math.floor(seededRandom(0, armor * traits.high_pop.vars()[0],true));
        }
        if (global.race['armored']){
            let armored = 1 - (traits.armored.vars()[0] / 100);
            armor += Math.floor(death * armored);
        }
        let fathom = fathomCheck('tortoisan');
        if (fathom > 0){
            let armored = 1 - (traits.armored.vars(1)[0] / 100 * fathom);
            armor += Math.floor(death * armored);
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
        if (global.race['instinct']){
            let reduction = Math.floor(death * (traits.instinct.vars()[1] / 100));
            death -= reduction;
            wounded += reduction;
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

        global.civic.garrison.wounded += Math.floor(seededRandom(wounded,global.civic.garrison.raid - death,true));

        let gains = {
            Money: 0,
            Food: 0,
            Lumber: 0,
            Stone: 0,
            Copper: 0,
            Iron: 0,
            Aluminium: 0,
            Coal: 0,
            Cement: 0,
            Steel: 0,
            Titanium: 0,
            Crystal: 0,
            Chrysotile: 0,
            Furs: 0,
            Iridium: 0,
            Alloy: 0,
            Polymer: 0,
            Oil: 0,
        };

        let basic = gov === 3 && global.race['truepath'] ? ['Food','Lumber','Stone','Copper','Iron'] : ['Food','Lumber','Stone'];
        let common = gov === 3 && global.race['truepath'] ? ['Aluminium','Coal','Cement','Steel','Furs'] : ['Copper','Iron','Aluminium','Coal'];
        let rare = gov === 3 && global.race['truepath'] ? ['Titanium','Oil','Iridium','Alloy','Polymer'] : ['Cement','Steel'];
        if (global.race['artifical']){
            basic.shift();
        }
        if (global.race['smoldering']){
            basic.push('Chrysotile');
        }
        if (global.race['terrifying'] && gov !== 3){
            rare.push('Titanium');
        }
        if (global.tech['magic']){
            rare.push('Crystal');
        }

        let looted = ['Money'];
        switch(global.civic.garrison.tactic){
            case 0:
                {
                    let extra = ['Money'].concat(basic,common);
                    looted.push(basic[Math.floor(seededRandom(0,basic.length,true))]);
                    looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    if (global.race['beast_of_burden']){
                        looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    }
                    if (global.resource.Steel.amount < 25 && global.tech['smelting'] && global.tech.smelting === 1 && Math.floor(seededRandom(0,20,true)) === 0){
                        looted.push('Steel');
                    }
                }
                break;
            case 1:
                {
                    let extra = ['Money'].concat(basic,common,rare);
                    looted.push(basic[Math.floor(seededRandom(0,basic.length,true))]);
                    looted.push(common[Math.floor(seededRandom(0,common.length,true))]);
                    looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    if (global.race['beast_of_burden']){
                        looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    }
                }
                break;
            case 2:
                {
                    let extra = ['Money'].concat(basic,common,rare);
                    let extraB = common.concat(rare);
                    looted.push(basic[Math.floor(seededRandom(0,basic.length,true))]);
                    looted.push(common[Math.floor(seededRandom(0,common.length,true))]);
                    looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    looted.push(extraB[Math.floor(seededRandom(0,extraB.length,true))]);
                    if (global.race['beast_of_burden']){
                        looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    }
                }
                break;
            case 3:
                {
                    let extra = ['Money'].concat(basic,common,rare);
                    looted.push(basic[Math.floor(seededRandom(0,basic.length,true))]);
                    looted.push(common[Math.floor(seededRandom(0,common.length,true))]);
                    looted.push(rare[Math.floor(seededRandom(0,rare.length,true))]);
                    looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    if (global.race['beast_of_burden']){
                        looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    }
                }
                break;
            case 4:
                {
                    let extra = ['Money'].concat(basic,common,rare);
                    looted.push(basic[Math.floor(seededRandom(0,basic.length,true))]);
                    looted.push(common[Math.floor(seededRandom(0,common.length,true))]);
                    looted.push(rare[Math.floor(seededRandom(0,rare.length,true))]);
                    looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    if (global.race['beast_of_burden']){
                        looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    }
                }
                break;
        }

        let titanium_low = global.race['terrifying'] && gov !== 3 ? traits.terrifying.vars()[0] : 12;
        let titanium_high = global.race['terrifying'] && gov !== 3 ? traits.terrifying.vars()[1] : 32;

        looted.forEach(function(goods){
            switch (goods){
                case 'Money':
                    gains[goods] += Math.floor(seededRandom(100,375,true));
                    break;
                case 'Food':
                    gains[goods] += Math.floor(seededRandom(40,175,true));
                    break;
                case 'Lumber':
                case 'Stone':
                    gains[goods] += Math.floor(seededRandom(50,250,true));
                    break;
                case 'Copper':
                case 'Iron':
                case 'Aluminium':
                    gains[goods] += Math.floor(seededRandom(35,125,true));
                    break;
                case 'Coal':
                case 'Cement':
                    gains[goods] += Math.floor(seededRandom(25,100,true));
                    break;
                case 'Steel':
                case 'Chrysotile':
                    gains[goods] += Math.floor(seededRandom(20,65,true));
                    break;
                case 'Titanium':
                    gains[goods] += Math.floor(seededRandom(titanium_low,titanium_high,true));
                    break;
                case 'Crystal':
                    gains[goods] += Math.floor(seededRandom(1,5,true));
                    break;
                case 'Oil':
                    gains[goods] += Math.floor(seededRandom(20,50,true));
                    break;
                case 'Iridium':
                    gains[goods] += Math.floor(seededRandom(2,30,true));
                    break;
                case 'Alloy':
                case 'Polymer':
                    gains[goods] += Math.floor(seededRandom(5,38,true));
                    break;
            }
        });

        let loot = loc('civics_garrison_gained');
        if (global.resource.Money.display && gains.Money > 0){
            gains.Money = lootModify(gains.Money,gov);
            loot = loot + loc('civics_garrison_quant_money',[gains.Money]);
            modRes('Money',gains.Money);
        }

        let payout = basic.concat(common,rare);
        payout.forEach(function(res){
            if (gains[res] > 0 && (global.resource[res].display || res === 'Steel' || res === 'Titanium')){
                gains[res] = lootModify(gains[res],gov);
                loot = loot + loc('civics_garrison_quant_res',[gains[res],global.resource[res].name]);
                modRes(res,gains[res]);
                if (res === 'Steel' || res === 'Titanium'){
                    global.resource[res].display = true;
                }
            }
        });

        loot = loot.slice(0,-2);
        loot = loot + '.';
        messageQueue(loot,'warning',false,['combat']);
        
        let revive = 0;
        if (global.race['revive']){
            switch (global.city.calendar.temp){
                case 0:
                    revive = Math.floor(seededRandom(0,Math.floor(death / traits.revive.vars()[0]),true));
                    break;
                case 1:
                    revive = Math.floor(seededRandom(0,Math.floor(death / traits.revive.vars()[1]),true));
                    break;
                case 2:
                    revive = Math.floor(seededRandom(0,Math.floor(death / traits.revive.vars()[2]),true));
                    break;
            }
            global.civic.garrison.workers += revive;
        }
        if (revive > 0){
            messageQueue(loc('civics_garrison_victorious_revive',[death,revive]),'success',false,['combat']);
        }
        else {
            messageQueue(loc('civics_garrison_victorious',[death]),'success',false,['combat']);
        }

        if (global.race['slaver'] && global.city['slave_pen']){
            let max = global.city.slave_pen.count * 4;
            if (max > global.resource.Slave.amount){
                let slaves = Math.floor(seededRandom(0,global.civic.garrison.tactic + 2,true));
                if (slaves + global.resource.Slave.amount > max){
                    slaves = max - global.resource.Slave.amount;
                }
                if (slaves > 0){
                    global.resource.Slave.amount += slaves;
                    messageQueue(loc('civics_garrison_capture',[slaves]),'success',false,['combat']);
                }
            }
        }
        if (global.race['infectious']){
            let infected = 0;
            switch(global.civic.garrison.tactic){
                case 0:
                    infected = Math.floor(seededRandom(0,traits.infectious.vars()[0],true));
                    break;
                case 1:
                    infected = Math.floor(seededRandom(0,traits.infectious.vars()[1],true));
                    break;
                case 2:
                    infected = Math.floor(seededRandom(0,traits.infectious.vars()[2],true));
                    break;
                case 3:
                    infected = Math.floor(seededRandom(0,traits.infectious.vars()[3],true));
                    break;
                case 4:
                    infected = Math.floor(seededRandom(0,traits.infectious.vars()[4],true));
                    break;
            }
            let zombies = global.resource[global.race.species].amount + infected;
            if (zombies > global.resource[global.race.species].max){
                infected = global.resource[global.race.species].max - global.resource[global.race.species].amount;
            }
            if (infected > 0){
                global.resource[global.race.species].amount += infected;
                if (global.civic.d_job !== 'unemployed'){
                    global.civic[global.civic.d_job].workers += infected;
                }
                if (infected === 1){
                    messageQueue(loc('civics_garrison_soldier_infected'),'special',false,['combat']);
                }
                else {
                    messageQueue(loc('civics_garrison_soldiers_infected',[infected]),'special',false,['combat']);
                }
            }
        }

        let occCost = jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
        if (gov <= 2 && global.civic.garrison.tactic === 4 && global.civic.garrison.workers >= occCost){
            let drawTechs = !global.tech['gov_fed'] && !checkControlling();
            global.civic.garrison.workers -= occCost;
            global.civic.foreign[`gov${gov}`].occ = true;
            global.civic.foreign[`gov${gov}`].sab = 0;
            global.civic.foreign[`gov${gov}`].act = 'none';
            if (drawTechs){
                drawTech();
            }
            if (global.race['banana']){
                let affix = universeAffix();
                global.stats.banana.b1[affix] = true;
                if (affix !== 'm' && affix !== 'l'){
                    global.stats.banana.b1.l = true;
                }
            }
        }
    }
    else {
        let deathCap = global.civic.garrison.raid;
        deathCap += wounded;
        if (global.civic.garrison.tactic === 0){
            deathCap = Math.floor(deathCap / 2);
        }
        if (global.city.ptrait.includes('rage')){
            deathCap += planetTraits.rage.vars()[2];
        }
        if (deathCap < 1){
            deathCap = 1;
        }
        if (deathCap > looters()){
            deathCap = looters();
        }
        let death = Math.floor(seededRandom(1,deathCap,true));
        if (global.race['frail']){
            death += global.civic.garrison.tactic + traits.frail.vars()[1];;
        }
        let armor = 0;
        if (global.race['scales']){
            armor += traits.scales.vars()[1];
        }
        if (global.tech['armor']){
            armor += global.tech['armor'];
        }
        if (global.race['high_pop']){
            armor += Math.floor(seededRandom(0, Math.floor(armor * traits.high_pop.vars()[0] / 2),true));
        }
        if (global.race['armored']){
            let armored = traits.armored.vars()[0] / 100;
            armor += Math.floor(death * armored);
        }
        let fathom = fathomCheck('tortoisan');
        if (fathom > 0){
            let armored = traits.armored.vars(1)[0] / 100 * fathom;
            armor += Math.floor(death * armored);
        }
        if (global.civic.garrison.raid > wounded){
            death -= armor;
        }
        if (global.race['instinct']){
            let reduction = Math.floor(death * (traits.instinct.vars()[1] / 100));
            death -= reduction;
            wounded += reduction;
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
        global.civic.garrison.wounded += 1 + Math.floor(seededRandom(wounded,global.civic.garrison.raid - death,true));

        let revive = 0;
        if (global.race['revive']){
            switch (global.city.calendar.temp){
                case 0:
                    revive = Math.floor(seededRandom(0,Math.floor(death / traits.revive.vars()[3]),true));
                    break;
                case 1:
                    revive = Math.floor(seededRandom(0,Math.floor(death / traits.revive.vars()[4]),true));
                    break;
                case 2:
                    revive = Math.floor(seededRandom(0,Math.floor(death / traits.revive.vars()[5]),true));
                    break;
            }
            global.civic.garrison.workers += revive;
        }
        if (revive > 0){
            messageQueue(loc('civics_garrison_defeat_revive',[death,revive]),'danger',false,['combat']);
        }
        else {
            messageQueue(loc('civics_garrison_defeat',[death]),'danger',false,['combat']);
        }
    }
    if (global.civic.garrison.wounded > global.civic.garrison.workers - global.civic.garrison.crew){
        global.civic.garrison.wounded = global.civic.garrison.workers - global.civic.garrison.crew;
    }
    else if (global.civic.garrison.wounded < 0){
        global.civic.garrison.wounded = 0;
    }
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
    if (global.race['high_pop']){
        cap = jobScale(cap);
    }
    if (looting > cap){
        looting = cap;
    }
    return looting;
}

function lootModify(val,gov){
    let looting = looters();
    if (global.race['high_pop']){
        looting = looting / jobScale(1);
    }
    let loot = val * Math.log(looting + 1);
    if (global.race['invertebrate']){
        loot *= 1 - (traits.invertebrate.vars()[0] / 100);
    }
    if (global.race.universe === 'evil'){
        loot *= darkEffect('evil');
    }
    if (global.race['gravity_well']){
        loot *= 0.25 + (0.75 * darkEffect('heavy'));
    }

    switch(global.civic.garrison.tactic){
        case 1:
            loot *= 4;
            break;
        case 2:
            loot *= 30;
            break;
        case 3:
            loot *= 100;
            break;
        case 4:
            loot *= 400;
            break;
    }

    if (global.race['banana']){
        loot *= 0.5;
    }
    if (global.city.biome === 'swamp'){
        loot *= biomes.swamp.vars()[1];
    }

    return Math.floor(loot * global.civic.foreign[`gov${gov}`].eco / 100);
}

export function weaponTechModifer(){
    let weapon_tech = global.tech['military'] ? (global.tech.military >= 5 ? global.tech.military - 1 : global.tech.military) : 1;
    if (global.tech['military'] && global.tech.military > 1){
        weapon_tech -= global.tech.military >= 11 ? 2 : 1;
        if (global.race['sniper']){
            weapon_tech *= 1 + (traits.sniper.vars()[0] / 100 * weapon_tech);
        }
        let fathom = fathomCheck('centaur');
        if (fathom > 0){
            weapon_tech *= 1 + (traits.sniper.vars(1)[0] / 100 * weapon_tech * fathom);
        }
        weapon_tech += global.tech.military >= 11 ? 2 : 1;
    }
    return weapon_tech;
}

export function armyRating(val,type,wound){
    if (!global.civic.hasOwnProperty('garrison')){
        return 1;
    }

    let wounded = 0;
    if (typeof wound === "number"){
        wounded = wound;
    }
    else if (val > global.civic.garrison.workers - global.civic.garrison.wounded){
        wounded = val - (global.civic.garrison.workers - global.civic.garrison.wounded);
    }

    let weapon_tech = weaponTechModifer();
    let rhinoFathom = fathomCheck('rhinotaur');
    let adjusted_val = val - (wounded / 2);
    if (global.race['rage'] || rhinoFathom > 0){
        let rageVal = global.race['rage'] ? (wounded * traits.rage.vars()[1] / 100) : 0;
        let fathomVal = rhinoFathom > 0 ? (wounded * traits.rage.vars(1)[1] / 100 * rhinoFathom) : 0;
        adjusted_val = val + rageVal + fathomVal;
    }
    let army = global.tech['military'] ? adjusted_val * weapon_tech : adjusted_val;
    if (type === 'army' || type === 'hellArmy'){
        if (global.race['rage']){
            army *= 1 + (traits.rage.vars()[0] / 100 * (global.civic.garrison.wounded || 0));
        }
        if (rhinoFathom > 0){
            army *= 1 + (traits.rage.vars(1)[0] / 100 * rhinoFathom * (global.civic.garrison.wounded || 0));
        }
        if (global.race['puny']){
            army *= 1 - (traits.puny.vars()[0] / 100);
        }
        if (global.race['claws']){
            army *= 1 + (traits.claws.vars()[0] / 100);
        }
        let scorpidFathom = fathomCheck('scorpid');
        if (scorpidFathom > 0){
            army *= 1 + (traits.claws.vars(1)[0] / 100 * scorpidFathom);
        }
        if (global.race['chameleon']){
            army *= 1 + (traits.chameleon.vars()[0] / 100);
        }
        if (global.race['cautious'] && global.city.calendar.weather === 0){
            army *= 1 - (traits.cautious.vars()[0] / 100);
        }
        if (global.race['apex_predator']){
            army *= 1 + (traits.apex_predator.vars()[0] / 100);
        }
        let sharkinFathom = fathomCheck('sharkin');
        if (sharkinFathom > 0){
            army *= 1 + (traits.apex_predator.vars(1)[0] / 100 * sharkinFathom);
        }
        if (global.race['swift']){
            army *= 1 + (traits.swift.vars()[0] / 100);
        }
        if (global.race['fiery']){
            army *= 1 + (traits.fiery.vars()[0] / 100);
        }
        let balorgFathom = fathomCheck('balorg');
        if (balorgFathom > 0){
            army *= 1 + (traits.fiery.vars(1)[0] / 100 * balorgFathom);
        }
        if (global.race['sticky']){
            army *= 1 + (traits.sticky.vars()[1] / 100);
        }
        let pingFathom = fathomCheck('pinguicula');
        if (pingFathom > 0){
            army *= 1 + (traits.sticky.vars(1)[1] / 100 * pingFathom);
        }
        if (global.race['pathetic']){
            army *= 1 - (traits.pathetic.vars()[0] / 100);
        }
        if (global.race['tactical']){
            army *= 1 + (traits.tactical.vars()[0] * global.race['tactical'] / 100);
        }
        if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 4){
            army *= 1 + (global.city.temple.count * 0.01);
        }
        if (global.race['holy'] && type === 'hellArmy'){
            army *= 1 + (traits.holy.vars()[0] / 100);
        }
        let unicornFathom = fathomCheck('unicorn');
        if (unicornFathom > 0 && type === 'hellArmy'){
            army *= 1 + (traits.holy.vars(1)[0] / 100 * unicornFathom);
        }
        if (global.race['banana'] && type === 'hellArmy'){
            army *= 0.8;
        }
        if (astrologySign() === 'aries'){
            army *= 1 + (astroVal('aries')[0] / 100);
        }
        let tacVal = govActive('tactician',0);
        if (tacVal){
            army *= 1 + (tacVal / 100);
        }
        if (global.city.ptrait.includes('rage')){
            army *= planetTraits.rage.vars()[0];
        }
        if (global.race['parasite']){
            if (val === 1){
                army += 2;
            }
            else if (val > 1){
                army += 4;
            }
        }
        if (global.tech['psychic'] && global.race['psychicPowers'] && global.race.psychicPowers.hasOwnProperty('assaultTime')){
            let boost = 0;
            if (global.race.psychicPowers.assaultTime > 0){
                boost += traits.psychic.vars()[3] / 100;
            }
            if (global.tech.psychic >= 4 && global.race.psychicPowers['channel']){
                let rank = global.stats.achieve['nightmare'] && global.stats.achieve.nightmare['mg'] ? global.stats.achieve.nightmare.mg : 0;
                boost += +(traits.psychic.vars()[3] / 50000 * rank * global.race.psychicPowers.channel.assault).toFixed(3);
            }
            army *= 1 + boost;
        }
    }
    if (type === 'hunting'){
        if (global.race['unfathomable']){
            army *= 0.66;
        }
    }
    if (global.race['rejuvenated']){
        army *= 1.05;
    }
    if (global.civic.govern.type === 'autocracy'){
        army *= 1 + (govEffect.autocracy()[1] / 100);
    }
    army = Math.floor(army);
    return army * racialTrait(val,type);
}

export function garrisonSize(max,nofob){
    if (!global.civic.garrison){
        return 0;
    }
    let type = max ? 'max' : 'workers';
    let fortress = global.portal['fortress'] ? global.portal.fortress.garrison : 0;
    let fob = global.space['fob'] && !nofob ? global.space.fob.troops : 0;
    return global.civic.garrison[type] - global.civic.garrison.crew - fortress - fob;
}

function defineMad(){
    if (global.race['sludge']){ return false; }
    if ($(`#mad`).length === 0){
        let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
        var mad_command = $('<div id="mad" v-show="display" class="tile is-child"></div>');
        $('#military').append(mad_command);
        var mad = $('<div class="mad"></div>');
        mad_command.append(mad);

        mad.append($(`<div class="warn">${loc('civics_mad_reset_desc',[plasmidType])}</div>`));

        let altText = global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt']) ? true : false;

        mad.append($(`<div class="defcon mdarm"><button class="button arm" @click="arm">${loc(altText ? 'civics_mad_arm_grenades' : 'civics_mad_arm_missiles')}</button></div>`));
        mad.append($(`<div class="defcon mdlaunch"><button class="button" @click="launch" :disabled="armed">${loc(altText ? 'civics_mad_launch_grenades' : 'civics_mad_launch_missiles')}</button></div>`));

        if (!global.civic.mad.armed){
            $('#mad').addClass('armed');
            $('#mad .arm').html(loc(altText ? 'civics_mad_disarm_grenades' : 'civics_mad_disarm_missiles'));
        }

        vBind({
            el: '#mad',
            data: global.civic['mad'],
            methods: {
                launch(){
                    if (!global.civic.mad.armed && !global.race['cataclysm']){
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
                    }
                },
                arm(){
                    if (global.civic.mad.armed){
                        $('#mad .arm').html(loc(altText ? 'civics_mad_disarm_grenades' : 'civics_mad_disarm_missiles'));
                        global.civic.mad.armed = false;
                        $('#mad').addClass('armed');
                    }
                    else {
                        $('#mad .arm').html(loc(altText ? 'civics_mad_arm_grenades' : 'civics_mad_arm_missiles'));
                        global.civic.mad.armed = true;
                        $('#mad').removeClass('armed');
                    }
                }
            }
        });

        ['mdarm','mdlaunch'].forEach(function(k){
            popover(`mad${k}`,
                function(){ return '<span>{{ label() }}</span>'; },
                {
                    elm: `#mad .${k}`,
                    in: function(obj){
                        vBind({
                            el: `#${obj.id} > span`,
                            data: { test: 'val' },
                            methods: {
                                label(){
                                    switch(k){
                                        case 'mdarm':
                                            return global.tech['world_control'] && !global.race['truepath']
                                                ? loc('civics_mad_missiles_world_control_desc')
                                                : loc(altText ? 'civics_mad_missiles_desc_easter' : 'civics_mad_missiles_desc');
                                        case 'mdlaunch':
                                            {
                                                let gains = calcPrestige('mad');
                                                let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
                                                return loc('civics_mad_missiles_warning',[gains.plasmid,plasmidType]);
                                            }
                                    }
                                }
                            }
                        });
                    },
                    out: function(obj){
                        vBind({el: `#${obj.id} > span`},'destroy');
                    },
                }
            );
        });
    }
}
