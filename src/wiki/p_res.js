import { loc } from './../locale.js';
import { vBind, challenge_multiplier, calcPrestige } from './../functions.js';
import { infoBoxBuilder, sideMenu } from './functions.js';

export function pResPage(content){
    let mainContent = sideMenu('create',content);

    let section = infoBoxBuilder(mainContent,{ name: 'plasmids', template: 'p_res', paragraphs: 2, h_level: 2,
        para_data: { 1: [250] },
        data_color: { 1: ['warning'] }
    });
    prestigeCalc(section,'plasmid');
    sideMenu('add',`resources-prestige`,'plasmids',loc('wiki_p_res_plasmids'));

    section = infoBoxBuilder(mainContent,{ name: 'antiplasmids', template: 'p_res', paragraphs: 5, h_level: 2,
        para_data: { 4: [loc('arpa_genepool_bleeding_effect_title')] },
        data_link: { 4: ['wiki.html#crispr-prestige-bleeding_effect'] }
    });
    prestigeCalc(section,'plasmid','anti');
    sideMenu('add',`resources-prestige`,'antiplasmids',loc('wiki_p_res_antiplasmids'));

    section = infoBoxBuilder(mainContent,{ name: 'phage', template: 'p_res', paragraphs: 4, h_level: 2 });
    prestigeCalc(section,'phage');
    sideMenu('add',`resources-prestige`,'phage',loc('wiki_p_res_phage'));

    let dark = infoBoxBuilder(mainContent,{ name: 'dark', template: 'p_res', paragraphs: 1, h_level: 2 });
    let dark_extra = $(`<div></div>`);
    let dark_list = $(`<ul class="disc"></ul>`);
    dark.append(dark_extra);
    dark_extra.append(dark_list);
    dark_list.append(`<li>${loc('wiki_p_res_dark_standard')}</li>`);
    dark_list.append(`<li>${loc('wiki_p_res_dark_evil')}</li>`);
    dark_list.append(`<li>${loc('wiki_p_res_dark_heavy')}</li>`);
    dark_list.append(`<li>${loc('wiki_p_res_dark_antimatter')}</li>`);
    dark_list.append(`<li>${loc('wiki_p_res_dark_micro')}</li>`);
    dark_list.append(`<li>${loc('wiki_p_res_dark_magic')}</li>`);
    prestigeCalc(dark,'dark');
    prestigeCalc(dark,'dark','vacuum');
    sideMenu('add',`resources-prestige`,'dark',loc('wiki_p_res_dark'));

    section = infoBoxBuilder(mainContent,{ name: 'harmony', template: 'p_res', paragraphs: 3, h_level: 2 });
    prestigeCalc(section,'harmony');
    sideMenu('add',`resources-prestige`,'harmony',loc('wiki_p_res_harmony'));

    infoBoxBuilder(mainContent,{ name: 'blood', template: 'p_res', paragraphs: 5, h_level: 2,
        para_data: {
            2: [loc('tab_arpa_blood')],
            3: [1,'1-5'],
            4: [loc('arpa_genepool_blood_sacrifice_title')],
            5: [loc('arpa_genepool_blood_remembrance_title')]
        },
        data_link: {
            2: ['wiki.html#blood-prestige'],
            4: ['wiki.htmll#crispr-prestige-blood_sacrifice'],
            5: ['wiki.htmll#crispr-prestige-blood_remembrance']
        }
    });
    sideMenu('add',`resources-prestige`,'blood',loc('wiki_p_res_blood'));

    section = infoBoxBuilder(mainContent,{ name: 'artifact', template: 'p_res', paragraphs: 3, h_level: 2,
        para_data: {
            1: [loc('wiki_resets_infusion')],
            2: [loc('tab_arpa_blood')],
            3: [1,'5th'],
        },
        data_link: {
            1: ['wiki.html#resets-prestige-infusion'],
            2: ['wiki.html#blood-prestige']
        }
    });
    prestigeCalc(section,'artifact');
    sideMenu('add',`resources-prestige`,'artifact',loc('wiki_p_res_artifact'));
}

const calcVars = {
    plasmid: ['cit', 'sol', 'know', 'genes', 'reset', 'uni'],
    anti: ['cit', 'sol', 'know', 'genes', 'reset'],
    phage: ['plas', 'genes', 'reset', 'uni'],
    dark: ['mass', 'exotic', 'genes', 'uni'],
    vacuum: ['mana', 'genes'],
    harmony: ['genes', 'uni'],
    artifact: ['genes', 'floor', 'uni']
}

function prestigeCalc(info,resource,extraType){
    let prestigeType = extraType || resource;
    let prefix = resource + (extraType || "");
    let calc = $(`<div class="calc" id="${prefix}Calc"></div>`);
    info.append(calc);
    
    let title = "";
    switch (prestigeType){
        case 'plasmid':
            title += loc('resource_Plasmid_name');
            break;
        case 'anti':
            title += loc('resource_AntiPlasmid_name');
            break;
        case 'phage':
            title += loc('resource_Phage_name');
            break;
        case 'dark':
            title += loc('wiki_resets_blackhole') + " " + loc('resource_Dark_name');
            break;
        case 'vacuum':
            title += loc('wiki_resets_vacuum') + " " + loc('resource_Dark_name');
            break;
        case 'harmony':
            title += loc('resource_Harmony_name');
            break;
        case 'artifact':
            title += loc('resource_Artifact_name');
            break;
    }
    calc.append(`<h2 class="has-text-caution">${loc('wiki_calc',[title])}</h2>`);
    
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(formula);
    calc.append(variables);
    
    let proxyInput = {
        cit: 0,
        sol: 0,
        know: 0,
        plas: 0,
        mass: 0,
        exotic: 0,
        mana: 0,
        floor: 0,
        genes: 0,
        uni: 'standard'
    }
    
    let inputs = {
        cit: { val: undefined, use: false },
        sol: { val: undefined, use: false },
        know: { val: undefined, use: false },
        plas: { val: undefined, use: false },
        mass: { val: undefined, use: false },
        exotic: { val: undefined, use: false },
        mana: { val: undefined, use: false },
        floor: { val: undefined, use: false },
        genes: { val: undefined, use: false },
        reset: { val: undefined, use: false },
        uni: { val: undefined, use: false, micro: false }
    }
    let universes = {
        standard: { use: true },
        evil: { use: true },
        antimatter: { use: true },
        micro: { use: true },
        heavy: { use: true },
        magic: { use: true }
    }
    let resets = {
        mad: { use: true },
        bioseed: { use: true },
        cataclysm: { use: true },
        bigbang: { use: true },
        vacuum: { use: true },
        ascend: { use: true },
        descend: { use: false }
    }
    let showEval = { vis: false }
    
    calcVars[prestigeType].forEach(function(type){
        inputs[type].use = true;
    });
    
    let equation = ``;
    
    switch (prestigeType){
        case 'plasmid':
            universes.antimatter.use = false;
            equation += `<span>((({{ i.cit.val | citizens }} + {{ i.sol.val | soldiers }}) / {{ i.reset.val | popDivisor }}) + (ln(1 + (({{ i.reset.val | knowMulti }} - 1) * {{ i.know.val | knowledge }} / {{ i.reset.val | knowInc }})) / ln({{ i.reset.val | knowMulti }}))) * {{ i.genes.val | challenge}} * {{ i.uni.val | universe }}</span>`;
            break;
        case 'anti':
            resets.vacuum.use = false;
            equation += `<span>((({{ i.cit.val | citizens }} + {{ i.sol.val | soldiers }}) / {{ i.reset.val | popDivisor }}) + (ln(1 + (({{ i.reset.val | knowMulti }} - 1) * {{ i.know.val | knowledge }} / {{ i.reset.val | knowInc }})) / ln({{ i.reset.val | knowMulti }}))) * {{ i.genes.val | challenge}} * 1.1</span>`;
            break;
        case 'phage':
            resets.mad.use = false;
            resets.descend.use = false;
            equation += `<span>log2({{ i.plas.val | plasmids }}) * {{ i.reset.val | phageMulti }} * e * {{ i.genes.val | challenge}} * {{ i.uni.val | universe }}</span>`;
            break;
        case 'dark':
            inputs.reset.val = 'bigbang';
            universes.magic.use = false;
            equation += `<span>(ln(1 + ({{ i.exotic.val | exotic }} * 40)) + (log2({{ i.mass.val | mass }} - {{ i.exotic.val | exotic }} - 7) / 2.5)) * {{ i.genes.val | challenge}} * {{ i.uni.val | universe }}</span>`;
            break;
        case 'vacuum':
            inputs.reset.val = 'vacuum';
            inputs.uni.val = 'magic';
            equation += `<span>(log2({{ i.mana.val | mana }}) / 5) * {{ i.genes.val | challenge}}</span>`;
            break;
        case 'harmony':
            inputs.reset.val = 'ascend';
            equation += `<span>(1 + {{ i.genes.val | genes}}) * {{ i.uni.val | universe }}</span>`;
            break;
        case 'artifact':
            inputs.reset.val = 'descend';
            equation += `<span>1 + </span><span v-show="!i.uni.micro">{{ i.genes.val | genes}} + </span><span>{{ i.floor.val | floor }}</span>`;
            break;
    }
    
    equation += `<span v-show="s.vis"> = {{  | calc }}</span>`;
    formula.append(equation);
    
    variables.append(`
        <div>
            <div class="calcInput" v-show="i.cit.use"><span>${loc('wiki_calc_citizens')}</span> <b-numberinput :input="val('cit')" min="0" v-model="i.cit.val" :controls="false"></b-numberinput></div>
            <div class="calcInput" v-show="i.sol.use"><span>${loc('wiki_calc_soldiers')}</span> <b-numberinput :input="val('sol')" min="0" v-model="i.sol.val" :controls="false"></b-numberinput></div>
            <div class="calcInput" v-show="i.know.use"><span>${loc('wiki_calc_knowledge')}</span> <b-numberinput :input="val('know')" min="0" v-model="i.know.val" :controls="false"></b-numberinput></div>
            <div class="calcInput" v-show="i.plas.use"><span>${loc('resource_Plasmid_plural_name')}</span> <b-numberinput :input="val('plas')" min="0" v-model="i.plas.val" :controls="false"></b-numberinput></div>
            <div class="calcInput" v-show="i.mass.use"><span>${loc('wiki_calc_mass')}</span> <b-numberinput :input="val('mass')" min="0" v-model="i.mass.val" :controls="false"></b-numberinput></div>
            <div class="calcInput" v-show="i.exotic.use"><span>${loc('wiki_calc_exotic')}</span> <b-numberinput :input="val('exotic')" min="0" v-model="i.exotic.val" :controls="false"></b-numberinput></div>
            <div class="calcInput" v-show="i.mana.use"><span>${loc('wiki_calc_mana')}</span> <b-numberinput :input="val('mana')" min="0" v-model="i.mana.val" :controls="false"></b-numberinput></div>
            <div class="calcInput" v-show="i.floor.use"><span>${loc('wiki_calc_floor')}</span> <b-numberinput :input="val('floor')" min="0" v-model="i.floor.val" :controls="false"></b-numberinput></div>
            <div class="calcInput" v-show="i.genes.use"><span>${loc('wiki_calc_genes')}</span> <b-numberinput :input="val('genes')" min="0" max="4" v-model="i.genes.val" :controls="false"></b-numberinput></div>
            <div class="calcInput" v-show="i.reset.use"><span>${loc('wiki_calc_prestige')}</span> <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ i.reset.val | resetLabel }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-show="r.mad.use" v-on:click="pickReset('mad')">{{ 'mad' | resetLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="r.bioseed.use" v-on:click="pickReset('bioseed')">{{ 'bioseed' | resetLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="r.cataclysm.use" v-on:click="pickReset('cataclysm')">{{ 'cataclysm' | resetLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="r.bigbang.use" v-on:click="pickReset('bigbang')">{{ 'bigbang' | resetLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="r.vacuum.use" v-on:click="pickReset('vacuum')">{{ 'vacuum' | resetLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="r.ascend.use" v-on:click="pickReset('ascend')">{{ 'ascend' | resetLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="r.descend.use" v-on:click="pickReset('descend')">{{ 'descend' | resetLabel }}</b-dropdown-item>
            </b-dropdown></div>
            <div class="calcInput" v-show="i.uni.use"><span>${loc('wiki_calc_universe')}</span> <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ i.uni.val | uniLabel }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-show="u.standard.use" v-on:click="pickUniverse('standard')">{{ 'standard' | uniLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="u.evil.use" v-on:click="pickUniverse('evil')">{{ 'evil' | uniLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="u.antimatter.use" v-on:click="pickUniverse('antimatter')">{{ 'antimatter' | uniLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="u.micro.use" v-on:click="pickUniverse('micro')">{{ 'micro' | uniLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="u.heavy.use" v-on:click="pickUniverse('heavy')">{{ 'heavy' | uniLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="u.magic.use" v-on:click="pickUniverse('magic')">{{ 'magic' | uniLabel }}</b-dropdown-item>
            </b-dropdown></div>
        </div>
        <div class="calcReset"><button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button></div>
    `);
    
    vBind({
        el: '#' + prefix + 'Calc',
        data: {
            i: inputs,
            u: universes,
            r: resets,
            s: showEval
        },
        methods: {
            val(type){
                switch (type){
                    case 'cit':
                    case 'sol':
                    case 'know':
                    case 'plas':
                    case 'mass':
                    case 'exotic':
                    case 'mana':
                    case 'floor':
                        if (inputs[type].val && inputs[type].val < 0){
                            inputs[type].val = 0;
                        }
                        break;
                    case 'genes':
                        if (inputs[type].val){
                            if (inputs[type].val < 0){
                                inputs[type].val = 0;
                            }
                            else if (inputs[type].val > 4){
                                inputs[type].val = 4;
                            }
                        }
                        break;
                }
            },
            pickReset(reset){
                inputs.reset.val = reset;
                Object.keys(universes).forEach(function(uni){
                    universes[uni].use = true;
                });
                if (reset === 'vacuum'){
                    Object.keys(universes).forEach(function(uni){
                        if (uni !== 'magic'){
                            universes[uni].use = false;
                        }
                    });
                }
                else if (reset === 'bigbang'){
                    universes.magic.use = false;
                }
                if (resource === 'plasmid'){
                    universes.antimatter.use = false;
                }
            },
            pickUniverse(uni){
                inputs.uni.val = uni;
                if (uni === 'magic'){
                    resets.bigbang.use = false;
                    resets.vacuum.use = true;
                }
                else {
                    resets.bigbang.use = true;
                    resets.vacuum.use = false;
                }
                if (uni === 'micro'){
                    inputs.uni.micro = true;
                }
                else {
                    inputs.uni.micro = false;
                }
            },
            resetInputs(){
                Object.keys(inputs).forEach(function(type){
                    if (inputs[type].use){
                        inputs[type].val = undefined;
                    }
                });
                inputs.uni.micro = false;
            }
        },
        filters: {
            citizens(num){
                return num !== undefined ? num : loc('wiki_calc_citizens');
            },
            soldiers(num){
                return num !== undefined ? num : loc('wiki_calc_soldiers');
            },
            knowledge(num){
                return num !== undefined ? num : loc('wiki_calc_knowledge');
            },
            plasmids(num){
                return num !== undefined ? num : loc('wiki_calc_plasmids');
            },
            mass(num){
                return num !== undefined ? num : loc('wiki_calc_mass');
            },
            exotic(num){
                return num !== undefined ? num : loc('wiki_calc_exotic');
            },
            mana(num){
                return num !== undefined ? num : loc('wiki_calc_mana');
            },
            floor(num){
                if (num === undefined){
                    return loc('wiki_calc_floor_bonus');
                }
                let bonus = 0;
                [50,100].forEach(function(x){
                    if (num >= x){
                        bonus++;
                    }
                });
                return bonus;
            },
            genes(num){
                return num !== undefined ? num : loc('wiki_calc_genes');
            },
            popDivisor(type){
                switch (type){
                    case 'mad':
                    case 'cataclysm':
                    case 'bioseed':
                        return 3;
                    case 'vacuum':
                    case 'bigbang':
                        return 2.2;
                    case 'ascend':
                        return 1.15;
                    default:
                        return loc('wiki_calc_pop_divisor');
                }
            },
            knowMulti(type){
                switch (type){
                    case 'mad':
                        return 1.1;
                    case 'cataclysm':
                    case 'bioseed':
                        return 1.015;
                    case 'vacuum':
                    case 'bigbang':
                        return 1.012;
                    case 'ascend':
                        return 1.008;
                    default:
                        return loc('wiki_calc_know_multi');
                }
            },
            knowInc(type){
                switch (type){
                    case 'mad':
                        return 100000;
                    case 'cataclysm':
                    case 'bioseed':
                        return 50000;
                    case 'vacuum':
                    case 'bigbang':
                        return 40000;
                    case 'ascend':
                        return 30000;
                    default:
                        return loc('wiki_calc_know_inc');
                }
            },
            phageMulti(type){
                switch (type){
                    case 'cataclysm':
                    case 'bioseed':
                        return 1;
                    case 'vacuum':
                    case 'bigbang':
                        return 2.5;
                    case 'ascend':
                        return 4;
                    default:
                        return loc('wiki_calc_phage_multi');
                }
            },
            challenge(num){
                return num !== undefined ? challenge_multiplier(1,'mad',2,num,'standard') : loc('wiki_calc_challenge_multi');
            },
            universe(type){
                if (!type){
                    return loc('wiki_calc_universe_multi');
                }
                let genes = inputs.genes.val || 0;
                if (prestigeType === 'harmony' || prestigeType === 'artifact'){
                    proxyInput.uni = inputs.uni.val;
                    return calcPrestige(inputs.reset.val,proxyInput)[resource];
                }
                return +(challenge_multiplier(1,inputs.reset.val,2,genes,type) / challenge_multiplier(1,'mad',2,genes,'standard')).toFixed(2)
            },
            calc(){
                let show = true;
                Object.keys(inputs).forEach(function(type){
                   if (inputs[type].use && inputs[type].val === undefined) show = false; 
                });
                showEval.vis = show;
                
                if (showEval.vis){
                    let calcInputs = {};

                    calcVars[prestigeType].forEach(function(type){
                        if (type !== 'reset'){
                            calcInputs[type] = inputs[type].val;
                        }
                    })
                    if (prestigeType === 'anti'){
                        calcInputs.uni = 'antimatter';
                    }
                    else if (prestigeType === 'vacuum'){
                        calcInputs.uni = 'magic';
                    }
                    
                    return calcPrestige(inputs.reset.val,calcInputs)[resource];
                }
            },
            resetLabel(lbl){
                switch (lbl){
                    case 'mad':
                        return loc('wiki_calc_mad');
                    case 'bioseed':
                    case 'cataclysm':
                    case 'vacuum':
                        return loc('wiki_resets_' + lbl);
                    case 'bigbang':
                        return loc('wiki_resets_blackhole');
                    case 'ascend':
                        return loc('wiki_resets_ascension');
                    case 'descend':
                        return loc('wiki_resets_infusion');
                }
                return loc('wiki_calc_prestige');
            },
            uniLabel(lbl){
                return lbl ? loc('universe_' + lbl) : loc('wiki_calc_universe');
            }
        }
    });
}