import { global } from './../vars.js';
import { universeAffix, alevel } from './../achieve.js';
import { loc } from './../locale.js';
import { vBind, challenge_multiplier, getResetConstants, calcPrestige, darkEffect } from './../functions.js';
import { jobScale } from './../jobs.js';
import { races, traits } from './../races.js';
import { infoBoxBuilder, sideMenu, createCalcSection } from './functions.js';

export function pResPage(content){
    let mainContent = sideMenu('create',content);

    //Plasmids
    let section = infoBoxBuilder(mainContent,{ name: 'plasmids', template: 'p_res', paragraphs: 2, h_level: 2,
        para_data: { 1: [250] },
        data_color: { 1: ['warning'] }
    });
    let subSection = createCalcSection(section,'plasmid','gain');
    prestigeCalc(subSection,'plasmid');
    subSection = createCalcSection(section,'plasmid','bonus');
    plasProdCalc(subSection,'plasmid');
    storeBonusCalc(subSection,'plasmid');
    sideMenu('add',`resources-prestige`,'plasmids',loc('wiki_p_res_plasmids'));

    //Anti-Plasmids
    section = infoBoxBuilder(mainContent,{ name: 'antiplasmids', template: 'p_res', paragraphs: 5, h_level: 2,
        para_data: { 4: [loc('arpa_genepool_bleeding_effect_title')] },
        data_link: { 4: ['wiki.html#crispr-prestige-bleeding_effect'] }
    });
    subSection = createCalcSection(section,'anti','gain');
    prestigeCalc(subSection,'plasmid','anti');
    subSection = createCalcSection(section,'anti','bonus');
    plasProdCalc(subSection,'anti');
    storeBonusCalc(subSection,'anti');
    sideMenu('add',`resources-prestige`,'antiplasmids',loc('wiki_p_res_antiplasmids'));

    //Phage
    section = infoBoxBuilder(mainContent,{ name: 'phage', template: 'p_res', paragraphs: 4, h_level: 2 });
    subSection = createCalcSection(section,'phage','gain');
    prestigeCalc(subSection,'phage');
    subSection = createCalcSection(section,'phage','bonus');
    storeBonusCalc(subSection,'phage');
    sideMenu('add',`resources-prestige`,'phage',loc('wiki_p_res_phage'));

    //Dark Energy
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
    subSection = createCalcSection(dark,'dark','gain');
    prestigeCalc(subSection,'dark',false,'bigbang');
    prestigeCalc(subSection,'dark','vacuum','vacuum');
    subSection = createCalcSection(dark,'dark','bonus');
    darkBonusCalc(subSection);
    sideMenu('add',`resources-prestige`,'dark',loc('wiki_p_res_dark'));

    //Harmony Crystals
    section = infoBoxBuilder(mainContent,{ name: 'harmony', template: 'p_res', paragraphs: 3, h_level: 2 });
    subSection = createCalcSection(section,'harmony','gain');
    prestigeCalc(subSection,'harmony');
    subSection = createCalcSection(section,'harmony','bonus');
    harmonyCreepCalc(subSection);
    sideMenu('add',`resources-prestige`,'harmony',loc('wiki_p_res_harmony'));

    //Blood Stones
    infoBoxBuilder(mainContent,{ name: 'blood', template: 'p_res', paragraphs: 5, h_level: 2,
        para_data: {
            2: [loc('tab_arpa_blood')],
            3: [1,'1-5'],
            4: [loc('arpa_genepool_blood_sacrifice_title')],
            5: [loc('arpa_genepool_blood_remembrance_title')]
        },
        data_link: {
            2: ['wiki.html#blood-prestige'],
            4: ['wiki.html#crispr-prestige-blood_sacrifice'],
            5: ['wiki.html#crispr-prestige-blood_remembrance']
        }
    });
    sideMenu('add',`resources-prestige`,'blood',loc('wiki_p_res_blood'));

    //Artifacts
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
    subSection = createCalcSection(section,'artifact','gain');
    prestigeCalc(subSection,'artifact');
    sideMenu('add',`resources-prestige`,'artifact',loc('wiki_p_res_artifact'));

    //Supercoiled Plasmids
    section = infoBoxBuilder(mainContent,{ name: 'supercoiled', template: 'p_res', paragraphs: 2, h_level: 2,
        para_data: {
            1: [loc('wiki_resets_apotheosis')]
        },
        data_link: {
            1: ['wiki.html#resets-prestige-apotheosis']
        }
    });
    subSection = createCalcSection(section,'supercoiled','gain');
    prestigeCalc(subSection,'supercoiled');
    sideMenu('add',`resources-prestige`,'supercoiled',loc('wiki_p_res_supercoiled'));

    //AI Core
    section = infoBoxBuilder(mainContent,{ name: 'ai_core', template: 'p_res', paragraphs: 2, h_level: 2,
        para_data: {
            1: [loc('wiki_resets_ai')],
        },
        data_link: {
            1: ['wiki.html#resets-prestige-ai'],
        }
    });
    subSection = createCalcSection(section,'cores','gain');
    prestigeCalc(subSection,'cores');
    subSection = createCalcSection(section,'cores','bonus');
    coresQuantumCalc(subSection);
    sideMenu('add',`resources-prestige`,'ai_core',loc('wiki_p_res_ai_core'));

    //Servants
    section = infoBoxBuilder(mainContent,{ name: 'servants', template: 'p_res', paragraphs: 5, h_level: 2, break: [3,4,5],
        para_data: {
            1: [loc('wiki_resets_matrix'),loc('wiki_resets_retired'),loc('wiki_resets_eden')],
            5: [loc('achieve_overlord_name')],
        },
        data_link: {
            1: ['wiki.html#resets-prestige-matrix','wiki.html#resets-prestige-retired','wiki.html#resets-prestige-eden'],
            5: ['wiki.html#perks-prestige-overlord'],
        }
    });
    sideMenu('add',`resources-prestige`,'servants',loc('wiki_p_res_servants'));

    //Skilled Servants
    section = infoBoxBuilder(mainContent,{ name: 'skilled_servants', template: 'p_res', paragraphs: 6, h_level: 2, break: [3,4,5,6],
        para_data: {
            1: [loc('wiki_resets_matrix'),loc('wiki_resets_retired')],
            6: [loc('achieve_pathfinder_name'),loc('achieve_overlord_name')],
        },
        data_link: {
            1: ['wiki.html#resets-prestige-matrix','wiki.html#resets-prestige-retired'],
            6: ['wiki.html#perks-prestige-pathfinder','wiki.html#perks-prestige-overlord'],
        }
    });
    sideMenu('add',`resources-prestige`,'skilled_servants',loc('wiki_p_res_skilled_servants'));
}

const calcVars = {
    plasmid: ['cit', 'sol', 'know', 'genes', 'reset', 'uni', 'high_pop', 'synth', 'tp'],
    anti: ['cit', 'sol', 'know', 'genes', 'reset', 'high_pop', 'synth', 'tp'],
    phage: ['plas', 'genes', 'reset', 'uni', 'tp'],
    dark: ['mass', 'exotic', 'genes', 'uni'],
    vacuum: ['mana', 'genes'],
    harmony: ['genes', 'uni'],
    artifact: ['genes', 'floor', 'micro'],
    cores: ['micro'],
    supercoiled: ['genes', 'micro'],
}

export function prestigeCalc(info,resource,extraType,resetType){
    let prestigeType = extraType || resource;
    let prefix = resource + (resetType || "") + (extraType || "");
    let calc = $(`<div class="calc" id="${prefix}Calc"></div>`);
    info.append(calc);
    
    let title = "";
    switch (resetType){
        case 'mad':
            title += loc('wiki_calc_mad') + " ";
            break;
        case 'bioseed':
        case 'cataclysm':
        case 'vacuum':
        case 'terraform':
        case 'ai':
        case 'matrix':
        case 'retired':
        case 'eden':
            title += loc('wiki_resets_' + resetType) + " ";
            break;
        case 'bigbang':
            title += loc('wiki_resets_blackhole') + " ";
            break;
        case 'ascend':
            title += loc('wiki_resets_ascension') + " ";
            break;
        case 'descend':
            title += loc('wiki_resets_infusion') + " ";
            break;
        case 'apotheosis':
            title += loc('wiki_resets_apotheosis') + " ";
            break;
        default:
            break;
    }
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
        case 'vacuum':
            title += loc('resource_Dark_name');
            break;
        case 'harmony':
            title += loc('resource_Harmony_name');
            break;
        case 'artifact':
            title += loc('resource_Artifact_name');
            break;
        case 'cores':
            title += loc('resource_AICore_name');
            break;
        case 'supercoiled':
            title += loc('resource_Supercoiled_name');
            break;
    }
    calc.append(`<h2 class="has-text-caution">${loc('wiki_calc_gains',[title])}</h2>`);
    
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
    };
    
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
        uni: { val: undefined, use: false },
        micro: { val: false, use: false },
        high_pop: { val: undefined, use: false },
        synth: { val: false, use: false },
        tp: { val: false, use: false, enabled: true },
        wiki: true // flag to mark this query as coming from wiki
    };
    let universes = {
        standard: { use: true },
        evil: { use: true },
        antimatter: { use: true },
        micro: { use: true },
        heavy: { use: true },
        magic: { use: true }
    };
    let resets = {
        mad: { use: true },
        bioseed: { use: true },
        cataclysm: { use: true },
        bigbang: { use: true },
        vacuum: { use: true },
        terraform: { use: true },
        ascend: { use: true },
        descend: { use: false },
        ai: { use: true },
        matrix: { use: true },
        retired: { use: true },
        eden: { use: true },
        apotheosis: { use: true }
    };
    let showEval = { vis: false };
    let plasExtra = { capVis: false, overflowVis: false, totalVis: false, capVal: undefined, overflow: undefined, rawGains: undefined };
    
    calcVars[prestigeType].forEach(function(type){
        inputs[type].use = true;
    });
    if (resetType){
        inputs.reset.val = resetType;
        inputs.reset.use = false;
        if (resetType !== 'mad'){
            inputs.synth.use = false;
            inputs.synth.val = false;
        }
        if (resetType === 'vacuum'){
            inputs.uni.use = false;
            inputs.uni.val = 'magic';
        }
        if (resetType === 'ai'){
            inputs.tp.use = false;
            inputs.tp.val = true;
        }
        else if (!['mad','bioseed','terraform'].includes(resetType)){
            inputs.tp.use = false;
            inputs.tp.val = false;
        }
    }
    
    let equation = ``;
    
    switch (prestigeType){
        case 'plasmid':
            if (!resetType){
                universes.antimatter.use = false;
            }
            break;
        case 'anti':
            resets.vacuum.use = false;
            break;
        case 'phage':
            resets.mad.use = false;
            resets.descend.use = false;
            equation += `<span>log2({{ i.plas.val, 'plasmids' | generic }}) * {{ i.reset.val | phageMulti }} * e * {{ i.genes.val | challenge}} * {{ i.uni.val | universe }}</span><span v-show="i.tp.val"> * 1.1</span>`;
            break;
        case 'dark':
            inputs.reset.val = 'bigbang';
            universes.magic.use = false;
            equation += `<span>(ln(1 + ({{ i.exotic.val, 'exotic' | generic }} * 40)) + (log2({{ i.mass.val, 'mass' | generic }} - 7) / 2.5)) * {{ i.genes.val | challenge }} * {{ i.uni.val | universe }}</span>`;
            break;
        case 'vacuum':
            inputs.reset.val = 'vacuum';
            inputs.uni.val = 'magic';
            equation += `<span>(log2({{ i.mana.val, 'mana' | generic }}) / 5) * {{ i.genes.val | challenge }}</span>`;
            break;
        case 'harmony':
            inputs.reset.val = 'ascend';
            equation += `<span>(1 + {{ i.genes.val, 'genes' | generic }}) * {{ i.uni.val | universe }}</span>`;
            break;
        case 'artifact':
            inputs.reset.val = 'descend';
            equation += `<span>1 + </span><span v-show="!i.micro.val">{{ i.genes.val, 'genes' | generic }} + </span><span>{{ i.floor.val | floor }}</span>`;
            break;
        case 'cores':
            inputs.reset.val = 'ai';
            equation += `<span v-show="!i.micro.val">5</span><span v-show="i.micro.val">2</span>`;
            break;
        case 'supercoiled':
            inputs.reset.val = 'apotheosis';
            equation += `{{ i.genes.val, 'genes' | generic }} ** <span v-show="!i.micro.val">3</span><span v-show="i.micro.val">2</span>`;
            break;
    }
    if (resource === 'plasmid'){
        equation += `
            <div>
                <h3 class="has-text-caution">${loc('wiki_calc_plasmid_cap_total',[prestigeType === 'anti' ? loc('resource_AntiPlasmid_name') : loc('resource_Plasmid_name')])}</h2>
            </div>
            <div>
                <span>{{ i.reset.val, i.synth.val | plasmidCap }} * (1 + (({{ i.genes.val, 'genes' | generic }}</span><span v-show="i.tp.val"> + 1</span><span>) / 8))</span><span v-show="pe.capVis"> = {{ | plasmidCapCalc }} = {{ pe.capVal }}</span>
            </div>
            <div>
                <h3 class="has-text-caution">${loc('wiki_calc_plasmid_gains_raw',[prestigeType === 'anti' ? loc('resource_AntiPlasmid_name') : loc('resource_Plasmid_name')])}</h2>
            </div>
            <div>
        `;
        if (prestigeType === 'plasmid'){
            equation += `
                    <span>((({{ i.cit.val, 'citizens' | generic }} + {{ i.sol.val, 'soldiers' | generic }})</span><span v-show="i.high_pop.val"> / {{ i.high_pop.val | highPopDivisor }}</span><span> / {{ i.reset.val, i.synth.val | popDivisor }}) + (ln(1 + (({{ i.reset.val | knowMulti }} - 1) * {{ i.know.val, 'knowledge' | generic }} / {{ i.reset.val, i.synth.val | knowInc }})) / ln({{ i.reset.val | knowMulti }}))) * {{ i.genes.val | challenge }} * {{ i.uni.val | universe }}</span><span v-show="i.tp.val"> * 1.1</span>
            `;
        }
        else {
            equation += `
                    <span>((({{ i.cit.val, 'citizens' | generic }} + {{ i.sol.val, 'soldiers' | generic }})</span><span v-show="i.high_pop.val"> / {{ i.high_pop.val | highPopDivisor }}</span><span> / {{ i.reset.val, i.synth.val | popDivisor }}) + (ln(1 + (({{ i.reset.val | knowMulti }} - 1) * {{ i.know.val, 'knowledge' | generic }} / {{ i.reset.val, i.synth.val | knowInc }})) / ln({{ i.reset.val | knowMulti }}))) * {{ i.genes.val | challenge }} * 1.1</span><span v-show="i.tp.val"> * 1.1</span>
            `;
        }
        equation += `
                <span v-show="s.vis"> = {{  | calc }}</span>
            </div>
            <div>
                <h3 class="has-text-caution">${loc('wiki_calc_overflow')} </h2>
            </div>
            <div>
                <span>{{ pe.rawGains, 'plasmid_gains_raw' | generic }} - {{ pe.capVal, 'plasmid_cap_total' | generic }}</span><span v-show="pe.overflowVis"> = {{ pe.overflow, 'no_overflow' | generic }}</span>
            </div>
            <div>
                <h3 class="has-text-caution">${loc('wiki_calc_plasmid_gains_total',[prestigeType === 'anti' ? loc('resource_AntiPlasmid_name') : loc('resource_Plasmid_name')])}</h2>
            </div>
            <div>
                <span>{{ pe.capVal, 'plasmid_cap_total' | generic }} + ({{ pe.overflow, 'overflow' | generic }} / ({{ pe.overflow, 'overflow' | generic }} + {{ pe.capVal, 'plasmid_cap_total' | generic }}) * {{ pe.capVal, 'plasmid_cap_total' | generic }})</span><span v-show="pe.totalVis"> = {{ | plasmidTotalCalc }}</span>
            </div>
        `;
    }
    else {
        equation += `<span v-show="s.vis"> = {{  | calc }}</span>`;
    }
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
                <b-dropdown-item v-show="r.terraform.use" v-on:click="pickReset('terraform')">{{ 'terraform' | resetLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="r.ascend.use" v-on:click="pickReset('ascend')">{{ 'ascend' | resetLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="r.descend.use" v-on:click="pickReset('descend')">{{ 'descend' | resetLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="r.ai.use" v-on:click="pickReset('ai')">{{ 'ai' | resetLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="r.matrix.use" v-on:click="pickReset('matrix')">{{ 'matrix' | resetLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="r.retired.use" v-on:click="pickReset('retired')">{{ 'retired' | resetLabel }}</b-dropdown-item>
                <b-dropdown-item v-show="r.eden.use" v-on:click="pickReset('eden')">{{ 'eden' | resetLabel }}</b-dropdown-item>
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
            <div class="calcInput" v-show="i.high_pop.use"><span>${loc('trait_high_pop_name')}</span> <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ i.high_pop.val | highPopLabel }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="pickHighPop(0)">{{ 0 | highPopLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickHighPop(0.25)">{{ 0.25 | highPopLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickHighPop(0.5)">{{ 0.5 | highPopLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickHighPop(1)">{{ 1 | highPopLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickHighPop(2)">{{ 2 | highPopLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickHighPop(3)">{{ 3 | highPopLabel }}</b-dropdown-item>
            </b-dropdown></div>
            <div class="calcInput" v-show="i.micro.use"><b-checkbox class="patrol" v-model="i.micro.val">${loc('universe_micro')}</b-checkbox></div>
            <div class="calcInput" v-show="i.synth.use"><b-checkbox class="patrol" v-model="i.synth.val">${loc('wiki_calc_synth')}</b-checkbox></div>
            <div class="calcInput" v-show="i.tp.use"><b-checkbox class="patrol" v-model="i.tp.val" :disabled="!i.tp.enabled">${loc('wiki_calc_tp')}</b-checkbox></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button>
            <button class="button" @click="importInputs()">${loc('wiki_calc_import')}</button>
        </div>
    `);
    
    vBind({
        el: '#' + prefix + 'Calc',
        data: {
            i: inputs,
            u: universes,
            r: resets,
            s: showEval,
            pe: plasExtra
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
                inputs.synth.use = reset === 'mad';
                if (!['mad','bioseed','terraform'].includes(reset)){
                    inputs.tp.enabled = false;
                    inputs.tp.val = reset === 'ai';
                }
                else {
                    inputs.tp.enabled = true;
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
                    inputs.micro.val = true;
                }
                else {
                    inputs.micro.val = false;
                }
            },
            pickHighPop(rank){
                inputs.high_pop.val = rank;
            },
            resetInputs(){
                Object.keys(inputs).forEach(function(type){
                    if (inputs[type].use){
                        inputs[type].val = undefined;
                    }
                });
                inputs.synth.use = resource === 'plasmid';
                ['micro','synth','tp'].forEach(function(type){
                    if (inputs[type].use){
                        inputs[type].val = false;
                    }
                });
                inputs.tp.enabled = true;
            },
            importInputs(){
                inputs.cit.val = global.resource[global.race.species].amount;
                inputs.sol.val = global.civic['garrison'] ? global.civic.garrison.workers : 0;
                for (let i=0; i<3; i++){
                    if (global.civic.foreign[`gov${i}`].occ){
                        inputs.sol.val += jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
                    }
                }
                inputs.know.val = global.stats.know;
                inputs.mass.val = global.interstellar['stellar_engine'] ? global.interstellar.stellar_engine.mass : 8;
                inputs.exotic.val = global.interstellar['stellar_engine'] ? global.interstellar.stellar_engine.exotic : 0;
                inputs.mana.val = global.resource.Mana.gen;
                inputs.floor.val = global.portal['spire'] ? global.portal.spire.count - 1 : 0;
                inputs.genes.val = alevel() - 1;
                let uni = global.race.universe;
                if (!(prestigeType === 'dark' && uni === 'magic') && resetType !== 'vacuum' && uni !== 'bigbang'){
                    inputs.uni.val = uni;
                    if (uni === 'magic'){
                        if (inputs.reset.val === 'bigbang'){
                            inputs.reset.val = undefined;
                        }
                        resets.bigbang.use = false;
                        resets.vacuum.use = true;
                    }
                    else {
                        if (inputs.reset.val === 'vacuum'){
                            inputs.reset.val = undefined;
                        }
                        resets.bigbang.use = true;
                        resets.vacuum.use = false;
                    }
                    if (uni === 'micro'){
                        inputs.micro.val = true;
                    }
                    else {
                        inputs.micro.val = false;
                    }
                }
                inputs.high_pop.val = global.race['high_pop'] ? global.race.high_pop : 0;
                inputs.synth.val = races[global.race.species].type === 'synthetic';
                if (inputs.tp.use){
                    if (inputs.reset.val && ['mad','bioseed','terraform'].includes(inputs.reset.val)){
                        inputs.tp.val = global.race['truepath'] ? true : false;
                    }
                }
                if (inputs.reset.val && inputs.reset.val !== 'mad' && inputs.reset.val !== 'descend'){
                    inputs.plas.val = calcPrestige(inputs.reset.val,
                                                   {cit: inputs.cit.val,
                                                    sol: inputs.sol.val,
                                                    know: inputs.know.val,
                                                    uni: inputs.uni.val,
                                                    genes: inputs.genes.val,
                                                    high_pop: inputs.high_pop.val,
                                                    tp: inputs.tp.val}).plasmid;
                }
            }
        },
        filters: {
            generic(num, type){
                return num !== undefined ? num : (type === 'plasmid_gains_raw' || type === 'plasmid_cap_total') ? loc('wiki_calc_' + type,[prestigeType === 'anti' ? loc('resource_AntiPlasmid_name') : loc('resource_Plasmid_name')]) : loc('wiki_calc_' + type);
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
            highPopDivisor(rank){
                return rank ? traits.high_pop.vars(rank)[0] : 1;
            },
            popDivisor(type,synth){
                let rc = getResetConstants(inputs.reset.val, inputs)
                if (rc.unknown) return loc('wiki_calc_pop_divisor');
                return rc.pop_divisor;
            },
            knowMulti(type){
                let rc = getResetConstants(inputs.reset.val, inputs)
                if (rc.unknown) return loc('wiki_calc_know_multi');
                return rc.k_mult;
            },
            knowInc(type,synth){
                let rc = getResetConstants(inputs.reset.val, inputs)
                if (rc.unknown) return loc('wiki_calc_know_inc');
                return rc.k_inc;
            },
            phageMulti(type){
                let rc = getResetConstants(inputs.reset.val, inputs)
                if (rc.unknown) return loc('wiki_calc_phage_multi');
                return rc.phage_mult;
            },
            plasmidCap(type,synth){
                let rc = getResetConstants(inputs.reset.val, inputs)
                if (rc.unknown) return loc('wiki_calc_plasmid_cap');
                return rc.plasmid_cap;
            },
            plasmidCapCalc(){
                plasExtra.capVis = inputs.reset.val && inputs.genes.val !== undefined;
                if (plasExtra.capVis){
                    let cap = getResetConstants(inputs.reset.val, inputs).plasmid_cap;
                    cap *= (1 + ((inputs.genes.val + 1 - (inputs.tp.val ? 0 : 1)) / 8));
                    plasExtra.capVal = Math.floor(cap);
                    return cap;
                }
                else {
                    plasExtra.capVal = undefined;
                }
            },
            plasmidTotalCalc(){
                plasExtra.totalVis = plasExtra.overflow && plasExtra.capVal;
                if (plasExtra.totalVis) {
                    return plasExtra.capVal + Math.floor(plasExtra.overflow / (plasExtra.overflow + plasExtra.capVal) * plasExtra.capVal);
                }
            },
            challenge(num){
                return num !== undefined ? challenge_multiplier(1,'mad',2,{genes: num, uni: 'standard', tp: false}) : loc('wiki_calc_challenge_multi');
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
                return +(challenge_multiplier(1,inputs.reset.val,2,{genes: genes, uni: type}) / challenge_multiplier(1,'mad',2,{genes: genes, uni: 'standard'})).toFixed(2)
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
                            if (type !== 'micro'){
                                calcInputs[type] = inputs[type].val;
                            }
                            else {
                                calcInputs.uni = inputs.micro.val ? 'micro' : 'standard';
                            }
                        }
                    })
                    if (prestigeType === 'anti'){
                        calcInputs.uni = 'antimatter';
                    }
                    else if (prestigeType === 'vacuum'){
                        calcInputs.uni = 'magic';
                    }
                    if (resource === 'plasmid'){
                        calcInputs.rawPlasmids = true;
                    }
                    
                    let gains = calcPrestige(inputs.reset.val,calcInputs)[resource];
                    
                    if (resource === 'plasmid'){
                        plasExtra.rawGains = gains;
                        plasExtra.overflow = (plasExtra.capVal !== undefined && gains > plasExtra.capVal) ? gains - plasExtra.capVal : undefined;
                        plasExtra.overflowVis = plasExtra.rawGains !== undefined && plasExtra.capVal !== undefined;
                    }
                    
                    return gains;
                }
                else if (resource === 'plasmid'){
                    plasExtra.rawGains = undefined;
                    plasExtra.overflow = undefined;
                    plasExtra.overflowVis = false;
                }
            },
            resetLabel(lbl){
                switch (lbl){
                    case 'mad':
                        return loc('wiki_calc_mad');
                    case 'bioseed':
                    case 'cataclysm':
                    case 'vacuum':
                    case 'ai':
                    case 'terraform':
                    case 'matrix':
                    case 'retired':
                    case 'eden':
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
            },
            highPopLabel(lbl){
                return lbl === undefined ? loc('wiki_calc_trait_undefined') : lbl === 0 ? loc('wiki_calc_trait_unowned') : lbl;
            }
        }
    });
}

function plasProdCalc(info,type){
    let calc = $(`<div class="calc" id="${type}ProdCalc"></div>`);
    info.append(calc);
    
    let title = type === 'anti' ? loc('resource_AntiPlasmid_name') : loc('resource_Plasmid_name');
    calc.append(`<h2 class="has-text-caution">${loc('wiki_calc_bonuses',[loc('wiki_calc_prod',[title])])}</h2>`);
    
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(formula);
    calc.append(variables);
    
    let inputs = {
        plas: { val: undefined },
        phage: { val: undefined },
        antimatter: { val: false }
    }
    
    let show = {
        underResult: { vis: false, val: 0 },
        overResult: { vis: false, val: 0 },
        bleed: { vis: type === 'anti' }
    }
    
    formula.append(`
        <div>
            <span>${loc('wiki_calc_effective',[type === 'plasmid' ? loc('resource_Plasmid_plural_name') : loc('resource_AntiPlasmid_plural_name')])} {{ i.plas.val | effective }} - </span>
            <span>${loc('wiki_calc_softcap')} {{ i.phage.val | softcap }}</span>
        </div>
        <div>
            <span>${loc('wiki_calc_under_cap')}</span>
        </div>
        <div>
            <span>(ln(</span><span v-show="s.bleed.vis">(</span><span>{{ i.plas.val, t | generic }} </span><span v-show="s.bleed.vis">/ {{ | bleedDiv }}) </span><span>+ 50) - 3.91202) / 2.888</span><span v-show="${type === 'anti'}"> / 3</span><span v-show="s.underResult.vis"> = {{ false | calcUnder }} = +{{ true | calcUnder }}%</span>
        </div>
        <div>
            <span>${loc('wiki_calc_over_cap')}</span>
        </div>
        <div>
            <span>((((ln({{ i.phage.val, 'phage' | generic }} + 300) - 3.91202)) / 2.888) + ((ln(</span><span v-show="s.bleed.vis">(</span><span>{{ i.plas.val, t | generic }} </span><span v-show="s.bleed.vis">/ {{ | bleedDiv }}) </span><span>+ 1 - ({{ i.phage.val, 'phage' | generic }} + 250)) / ln2 / 250)))</span><span v-show="${type === 'anti'}"> / 3</span><span v-show="s.overResult.vis"> = {{ false | calcOver }} = +{{ true | calcOver }}%</span>
        </div>
    `);
    
    variables.append(`
        <div>
            <div class="calcInput"><span>${type === 'plasmid' ? loc('resource_Plasmid_plural_name') : loc('resource_AntiPlasmid_plural_name')}</span> <b-numberinput :input="val('plas')" min="0" v-model="i.plas.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc(`resource_Phage_name`)}</span> <b-numberinput :input="val('phage')" min="0" v-model="i.phage.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><b-checkbox class="patrol" :input="bleed()" v-model="i.antimatter.val">${loc('universe_antimatter')}</b-checkbox></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()" :click="bleed()">${loc('wiki_calc_reset')}</button>
            <button class="button" @click="importInputs()" :click="bleed()">${loc('wiki_calc_import')}</button>
        </div>
    `);
    
    vBind({
        el: `#${type}ProdCalc`,
        data: {
            i: inputs,
            s: show,
            t: type
        },
        methods: {
            val(type){
                if (inputs[type].val && inputs[type].val < 0){
                    inputs[type].val = 0;
                }
            },
            bleed(){
                if((inputs.antimatter.val && type === 'plasmid') || (!inputs.antimatter.val && type === 'anti')){
                    show.bleed.vis = true;
                }
                else {
                    show.bleed.vis = false;
                }
            },
            resetInputs(){
                inputs.plas.val = undefined;
                inputs.phage.val = undefined;
                inputs.antimatter.val = false;
            },
            importInputs(){
                inputs.plas.val = type === 'plasmid' ? global.prestige.Plasmid.count : global.prestige.AntiPlasmid.count;
                inputs.phage.val = global.prestige.Phage.count;
                inputs.antimatter.val = global.race.universe === 'antimatter';
            }
        },
        filters: {
            generic(num, type){
                if (num !== undefined){
                    return num;
                }
                switch (type){
                    case 'plasmid':
                        return loc('resource_Plasmid_plural_name');
                    case 'anti':
                        return loc('resource_AntiPlasmid_plural_name');
                    case 'phage':
                        return loc('resource_Phage_name');
                }
            },
            effective(num){
                return num === undefined ? 0 : show.bleed.vis ? num / (type === 'plasmid' ? 40 : 4) : num;
            },
            softcap(num){
                return 250 + (num === undefined ? 0 : num);
            },
            bleedDiv(){
                return type === 'plasmid' ? 40 : 4;
            },
            calcUnder(percent){
                if (percent){
                    return (show.underResult.val * 100).toFixed(3);
                }
                let effective = inputs.plas.val;
                if (show.bleed.vis){
                    effective /= type === 'plasmid' ? 40 : 4;
                }
                let vis = true;
                if (inputs.plas.val === undefined || effective > 250 + inputs.phage.val){
                    vis = false;
                }
                show.underResult.vis = vis;
                
                if (show.underResult.vis){
                    let bonus = +((Math.log(effective + 50) - 3.91202)).toFixed(5) / 2.888;
                    if (type === 'anti'){
                        bonus /= 3;
                    }
                    show.underResult.val = bonus.toFixed(5);
                    
                    return show.underResult.val;
                }
            },
            calcOver(percent){
                if (percent){
                    return (show.overResult.val * 100).toFixed(3);
                }
                let effective = inputs.plas.val;
                if (show.bleed.vis){
                    effective /= type === 'plasmid' ? 40 : 4;
                }
                let vis = true;
                if (inputs.phage.val === undefined || effective <= 250 + inputs.phage.val){
                    vis = false;
                }
                show.overResult.vis = vis;
                
                if (show.overResult.vis){
                    let bonus = (+((Math.log(250 + inputs.phage.val + 50) - 3.91202)).toFixed(5) / 2.888) + ((Math.log(effective + 1 - (250 + inputs.phage.val)) / Math.LN2 / 250));
                    if (type === 'anti'){
                        bonus /= 3
                    }
                    show.overResult.val = bonus.toFixed(5);
                    
                    return show.overResult.val;
                }
            }
        }
    });
}

function storeBonusCalc(info,type){
    let calc = $(`<div class="calc" id="${type}StoreCalc"></div>`);
    info.append(calc);
    
    let title = type === 'phage' ? loc('resource_Phage_name') : type === 'anti' ? loc('resource_AntiPlasmid_name') : loc('resource_Plasmid_name');
    let titlePlural = type === 'phage' ? loc('resource_Phage_name') : type === 'anti' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    calc.append(`<h2 class="has-text-caution">${loc('wiki_calc_bonuses',[loc('wiki_calc_store',[title])])}</h2>`);
    
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(formula);
    calc.append(variables);
    
    let inputs = {
        res: { val: undefined },
        store: { val: undefined },
        antimatter: { val: false, use: true }
    }
    if (type === 'phage'){
        inputs.antimatter.use = false;
    }
    
    let show = {
        result: { vis: false, val: 0 },
        bleed: { vis: type === 'anti' }
    }
    
    let equation = ``;
    if (type !== 'phage'){
        equation += `
            <div>
                <span>${loc('wiki_calc_effective',[titlePlural])} {{ i.res.val | effective }}</span>
            </div>
        `;
    }
    equation += `
        <div>
            <span v-show="s.bleed.vis">(</span><span>{{ i.res.val, t | generic }} </span><span v-show="s.bleed.vis">/ {{ | bleedDiv }}) </span><span> * {{ i.store.val | storeVal }}</span><span v-show="s.result.vis"> = {{ false | calc }} = +{{ true | calc }}%</span>
        </div>
    `;
    formula.append(equation);
    
    variables.append(`
        <div>
            <div class="calcInput"><span>${titlePlural}</span> <b-numberinput :input="val()" min="0" v-model="i.res.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc('wiki_tech_special_crispr',[loc('wiki_arpa_crispr_store')])}</span> <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ i.store.val | storeLabel }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="pickStore(0)">{{ 0 | storeLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickStore(1)">{{ 1 | storeLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickStore(2)">{{ 2 | storeLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickStore(3)">{{ 3 | storeLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickStore(4)">{{ 4 | storeLabel }}</b-dropdown-item>
            </b-dropdown></div>
            <div class="calcInput" v-show="i.antimatter.use"><b-checkbox class="patrol" :input="bleed()" v-model="i.antimatter.val">${loc('universe_antimatter')}</b-checkbox></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()" :click="bleed()">${loc('wiki_calc_reset')}</button>
            <button class="button" @click="importInputs()" :click="bleed()">${loc('wiki_calc_import')}</button>
        </div>
    `);
    
    vBind({
        el: `#${type}StoreCalc`,
        data: {
            i: inputs,
            s: show,
            t: type
        },
        methods: {
            val(){
                if (inputs.res.val && inputs.res.val < 0){
                    inputs.res.val = 0;
                }
            },
            pickStore(num){
                inputs.store.val = num;
            },
            bleed(){
                if (type !== 'phage'){
                    if((inputs.antimatter.val && type === 'plasmid') || (!inputs.antimatter.val && type === 'anti')){
                        show.bleed.vis = true;
                    }
                    else {
                        show.bleed.vis = false;
                    }
                }
            },
            resetInputs(){
                inputs.res.val = undefined;
                inputs.store.val = undefined;
                inputs.antimatter.val = false;
            },
            importInputs(){
                inputs.res.val = type === 'phage' ? global.prestige.Phage.count : type === 'plasmid' ? global.prestige.Plasmid.count : global.prestige.AntiPlasmid.count;
                inputs.store.val = global.genes.store || 0;
                inputs.antimatter.val = global.race.universe === 'antimatter';
            }
        },
        filters: {
            generic(num, type){
                if (num !== undefined){
                    return num;
                }
                switch (type){
                    case 'plasmid':
                        return loc('resource_Plasmid_plural_name');
                    case 'anti':
                        return loc('resource_AntiPlasmid_plural_name');
                    case 'phage':
                        return loc('resource_Phage_name');
                }
            },
            storeVal(num){
                if (num === undefined){
                    return loc('wiki_calc_store_multi');
                }
                if (num === 0 || (type === 'phage' && num < 4)){
                    return 0;
                }
                switch (num){
                    case 1:
                        return 0.0004;
                    case 2:
                        return 0.0006;
                    default:
                        return 0.0008;
                }
            },
            effective(num){
                return num === undefined ? 0 : show.bleed.vis ? num / (type === 'plasmid' ? 40 : 4) : num;
            },
            storeLabel(num){
                if (num === undefined){
                    return loc('wiki_tech_special_crispr',[loc('wiki_arpa_crispr_store')]);
                }
                if (!num){
                    return loc('wiki_calc_not_owned');
                }
                return loc(`wiki_arpa_crispr_store`) + ': ' + num;
            },
            bleedDiv(){
                return type === 'plasmid' ? 5 : 10;
            },
            calc(percent){
                if (percent){
                    return (show.result.val * 100).toFixed(2);
                }
                let effective = inputs.res.val;
                if (show.bleed.vis){
                    effective /= type === 'plasmid' ? 5 : 10;
                }
                show.result.vis = inputs.res.val !== undefined && inputs.store.val !== undefined;
                
                if (show.result.vis){
                    if (inputs.store.val === 0 || (type === 'phage' && inputs.store.val < 4)){
                        show.result.val = 0;
                    }
                    else {
                        switch (inputs.store.val){
                            case 1:
                                show.result.val = (effective * 0.0004).toFixed(4);
                                break;
                            case 2:
                                show.result.val = (effective * 0.0006).toFixed(4);
                                break;
                            default:
                                show.result.val = (effective * 0.0008).toFixed(4);
                                break;
                        }
                    }
                    
                    return show.result.val;
                }
            }
        }
    });
}

function darkBonusCalc(info){
    let calc = $(`<div class="calc" id="darkBonusCalc"></div>`);
    info.append(calc);
    
    calc.append(`<h2 class="has-text-caution">${loc('wiki_calc_bonuses',[loc('resource_Dark_name')])}</h2>`);
    
    let universe = $(`<div></div>`);
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(universe);
    calc.append(formula);
    calc.append(variables);
    
    let inputs = {
        dark: { val: undefined },
        harmony: { val: undefined },
        sludge: { val: undefined },
        uni: { val: 'standard' }
    }
    
    let show = {
        standard: { vis: true, result: false, val: 0 },
        evil: { vis: false, result: false, val: 0 },
        antimatter: { vis: false, result: false, val: 0 },
        micro: { vis: false, result: false, val1: 0, val2: 0 },
        heavy: { vis: false, result: false, val1: 0, val2: 0 },
        magic: { vis: false, result: false, val: 0 }
    }

    universe.append(`
            <div class="calcInput"><span>${loc('wiki_calc_universe')}</span> <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ i.uni.val | uniLabel }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="pickUniverse('standard')">{{ 'standard' | uniLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickUniverse('evil')">{{ 'evil' | uniLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickUniverse('antimatter')">{{ 'antimatter' | uniLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickUniverse('micro')">{{ 'micro' | uniLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickUniverse('heavy')">{{ 'heavy' | uniLabel }}</b-dropdown-item>
                <b-dropdown-item v-on:click="pickUniverse('magic')">{{ 'magic' | uniLabel }}</b-dropdown-item>
            </b-dropdown></div>
    `);
    
    formula.append(`
        <div v-show="s.standard.vis">
            <div>
                <span>${loc('wiki_calc_bonuses',[loc('wiki_calc_dark_standard')])}:</span>
            </div>
            <div>
                <span>({{ i.dark.val, 'dark' | generic }} * (1 + ({{ i.harmony.val, 'harmony' | generic }} * 0.001)) * (1 + ({{ i.sludge.val | sludgeLabel }} * 0.03))) / 200</span><span v-show="s.standard.result"> = {{ 'standard', false | calc }} = +{{ 'standard', true | calc }}%</span>
            </div>
        </div>
        <div v-show="s.evil.vis">
            <div>
                <span>${loc('wiki_calc_bonuses',[loc('wiki_calc_dark_evil')])}:</span>
            </div>
            <div>
                <span>(log2(10 + ({{ i.dark.val, 'dark' | generic }} * (1 + ({{ i.harmony.val, 'harmony' | generic }} * 0.01)) * (1 + ({{ i.sludge.val | sludgeLabel }} * 0.03)))) - 3.321928094887362) / 5</span><span v-show="s.evil.result"> = {{ 'evil', false | calc }} = +{{ 'evil', true | calc }}%</span>
            </div>
        </div>
        <div v-show="s.antimatter.vis">
            <div>
                <span>${loc('wiki_calc_bonuses',[loc('wiki_calc_dark_antimatter')])}:</span>
            </div>
            <div>
                <span>(ln(50 + ({{ i.dark.val, 'dark' | generic }} * (1 + ({{ i.harmony.val, 'harmony' | generic }} * 0.01)) * (1 + ({{ i.sludge.val | sludgeLabel }} * 0.03)))) - 3.912023005428146) / 5</span><span v-show="s.antimatter.result"> = {{ 'antimatter', false | calc }} = +{{ 'antimatter', true | calc }}%</span>
            </div>
        </div>
        <div v-show="s.micro.vis">
            <div>
                <span>${loc('wiki_calc_creep_reduction',[loc('wiki_calc_home')])} (${loc('wiki_calc_cap',[0.06])}):</span>
            </div>
            <div>
                <span>(0.02 + ((ln(100 + ({{ i.dark.val, 'dark' | generic }} * (1 + ({{ i.harmony.val, 'harmony' | generic }} * 0.01)))) - 4.605170185988092) / 20)) * (1 + ({{ i.sludge.val | sludgeLabel }} * 0.03))</span><span v-show="s.micro.result"> = {{ 'micro', false, 2 | calc }}</span>
            </div>
            <div>
                <span>${loc('wiki_calc_creep_reduction',[loc('wiki_calc_not_home')])} (${loc('wiki_calc_cap',[0.04])}):</span>
            </div>
            <div>
                <span>(0.01 + ((ln(100 + ({{ i.dark.val, 'dark' | generic }} * (1 + ({{ i.harmony.val, 'harmony' | generic }} * 0.01)))) - 4.605170185988092) / 35)) * (1 + ({{ i.sludge.val | sludgeLabel }} * 0.03))</span><span v-show="s.micro.result"> = {{ 'micro', false, 1 | calc }}</span>
            </div>
        </div>
        <div v-show="s.heavy.vis">
            <div>
                <span>${loc('wiki_calc_dark_heavy',[loc('wiki_menu_space')])}:</span>
            </div>
            <div>
                <span>0.25 + (0.5 * 0.995^({{ i.dark.val, 'dark' | generic }} * (1 + ({{ i.harmony.val, 'harmony' | generic }} * 0.01)) * (1 + ({{ i.sludge.val | sludgeLabel }} * 0.03))))</span><span v-show="s.heavy.result"> = {{ 'heavy', false, 1 | calc }} = +{{ 'heavy', true, 1 | calc }}%</span>
            </div>
            <div>
                <span>${loc('wiki_calc_dark_heavy',[loc('wiki_tech_req_or',[loc('wiki_menu_interstellar'),loc('wiki_menu_intergalactic')])])}:</span>
            </div>
            <div>
                <span>0.2 + (0.3 * 0.995^({{ i.dark.val, 'dark' | generic }} * (1 + ({{ i.harmony.val, 'harmony' | generic }} * 0.01)) * (1 + ({{ i.sludge.val | sludgeLabel }} * 0.03))))</span><span v-show="s.heavy.result"> = {{ 'heavy', false, 2 | calc }} = +{{ 'heavy', true, 2 | calc }}%</span>
            </div>
        </div>
        <div v-show="s.magic.vis">
            <div>
                <span>${loc('wiki_calc_bonuses',[loc('wiki_calc_dark_magic')])}:</span>
            </div>
            <div>
                <span>(ln(50 + ({{ i.dark.val, 'dark' | generic }} * (1 + ({{ i.harmony.val, 'harmony' | generic }} * 0.01)) * (1 + ({{ i.sludge.val | sludgeLabel }} * 0.03)))) - 3.912023005428146) / 3</span><span v-show="s.magic.result"> = {{ 'magic', false | calc }} = +{{ 'magic', true | calc }}%</span>
            </div>
        </div>
    `);
    
    variables.append(`
        <div>
            <div class="calcInput"><span>${loc('wiki_p_res_dark')}</span> <b-numberinput :input="val('dark')" min="0" v-model="i.dark.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc('wiki_p_res_harmony')}</span> <b-numberinput :input="val('harmony')" min="0" v-model="i.harmony.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc('wiki_calc_sludge_level')}</span> <b-numberinput :input="val('sludge')" min="0" max="5" v-model="i.sludge.val" :controls="false"></b-numberinput></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button>
            <button class="button" @click="importInputs()">${loc('wiki_calc_import')}</button>
        </div>
    `);
    
    vBind({
        el: `#darkBonusCalc`,
        data: {
            i: inputs,
            s: show
        },
        methods: {
            val(type){
                if (inputs[type].val && inputs[type].val < 0){
                    inputs[type].val = 0;
                }
                else if (type === 'sludge'){
                    if (inputs.sludge.val && inputs.sludge.val > 5){
                        inputs.sludge.val = 5;
                    }
                }
            },
            pickUniverse(uni){
                show[inputs.uni.val].vis = false;
                inputs.uni.val = uni;
                show[uni].vis = true;
            },
            resetInputs(){
                inputs.dark.val = undefined;
                inputs.harmony.val = undefined;
                inputs.sludge.val = undefined;
                show[inputs.uni.val].vis = false;
                inputs.uni.val = 'standard';
                show.standard.vis = true;
            },
            importInputs(){
                inputs.dark.val = global.prestige.Dark.count;
                inputs.harmony.val = global.prestige.Harmony.count;
                if (global.race.universe !== 'bigbang'){
                    show[inputs.uni.val].vis = false;
                    inputs.uni.val = global.race.universe;
                    show[inputs.uni.val].vis = true;
                }
                inputs.sludge.val = global.stats.achieve['extinct_sludge'] && global.stats.achieve['extinct_sludge'][universeAffix(inputs.uni.val)] ? global.stats.achieve['extinct_sludge'][universeAffix(inputs.uni.val)] : 0;
            }
        },
        filters: {
            generic(num, type){
                return num !== undefined ? num : loc('wiki_p_res_' + type);
            },
            sludgeLabel(num){
                return num !== undefined ? num : loc('wiki_calc_sludge_level');
            },
            uniLabel(lbl){
                return lbl ? loc('universe_' + lbl) : loc('wiki_calc_universe');
            },
            calc(uni, percent, valNum){
                if (uni !== inputs.uni.val){
                    return;
                }
                if (percent){
                    if (uni === 'heavy'){
                        return (show[uni][`val${valNum}`] * 100).toFixed(3);
                    }
                    return (show[uni].val * 100).toFixed(3);
                }
                show[uni].result = inputs.dark.val !== undefined && inputs.harmony.val !== undefined;
                
                if (show[uni].result){
                    switch (uni){
                        case 'standard':
                        case 'evil':
                        case 'antimatter':
                        case 'magic':
                            show[uni].val = +(darkEffect(uni,false,true,{ dark: inputs.dark.val, harmony: inputs.harmony.val, sludge: inputs.sludge.val }) - 1).toFixed(6);
                            return show[uni].val;
                        case 'micro':
                            show[uni][`val${valNum}`] = darkEffect(uni,(valNum === 1 ? true : false),true,{ dark: inputs.dark.val, harmony: inputs.harmony.val, sludge: inputs.sludge.val });
                            return show[uni][`val${valNum}`];
                        case 'heavy':
                            let bonus = darkEffect(uni,false,true,{ dark: inputs.dark.val, harmony: inputs.harmony.val, sludge: inputs.sludge.val });
                            if (valNum === 1){
                                bonus = 0.25 + (0.5 * bonus);
                            }
                            else {
                                bonus = 0.2 + (0.3 * bonus);
                            }
                            show[uni][`val${valNum}`] = bonus.toFixed(5);
                            return show[uni][`val${valNum}`];
                    }
                }
            }
        }
    });
}

function harmonyCreepCalc(info){
    let calc = $(`<div class="calc" id="harmonyCreepCalc"></div>`);
    info.append(calc);
    
    calc.append(`<h2 class="has-text-caution">${loc('wiki_calc_creep_reduction',[loc('resource_Harmony_name')])}</h2>`);
    
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(formula);
    calc.append(variables);
    
    let inputs = {
        harmony: { val: undefined },
        ascended: { val: undefined },
        uni: { val: 'undefined' }
    }
    
    let show = {
        result: { vis: false, val: 0 }
    }
    
    formula.append(`
        <div>
            <span>(ln(50 + ({{ i.harmony.val, 'harmony' | generic }} * {{ i.ascended.val | ascendedLabel }})) - 3.912023005428146) * 0.01</span><span v-show="s.result.vis"> = {{ | calc }}</span>
        </div>
    `);
    
    variables.append(`
        <div>
            <div class="calcInput"><span>${loc('wiki_p_res_harmony')}</span> <b-numberinput :input="val('harmony')" min="0" v-model="i.harmony.val" :controls="false"></b-numberinput></div>
            <div class="calcInput"><span>${loc('wiki_calc_ascended_level')}</span> <b-numberinput :input="val('ascended')" min="0" max="5" v-model="i.ascended.val" :controls="false"></b-numberinput></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button>
            <button class="button" @click="importInputs()">${loc('wiki_calc_import')}</button>
        </div>
    `);
    
    vBind({
        el: `#harmonyCreepCalc`,
        data: {
            i: inputs,
            s: show
        },
        methods: {
            val(type){
                if (inputs[type].val && inputs[type].val < 0){
                    inputs[type].val = 0;
                }
                else if (type === 'ascended'){
                    if (inputs.ascended.val && inputs.ascended.val > 5){
                        inputs.ascended.val = 5;
                    }
                }
            },
            resetInputs(){
                inputs.harmony.val = undefined;
                inputs.ascended.val = undefined;
            },
            importInputs(){
                inputs.harmony.val = global.prestige.Harmony.count;
                inputs.ascended.val = global.stats.achieve['ascended'] && global.stats.achieve['ascended'][universeAffix(global.race.universe || 'standard')] ? global.stats.achieve['ascended'][universeAffix(global.race.universe || 'standard')] : 0;
            }
        },
        filters: {
            generic(num, type){
                return num !== undefined ? num : loc('wiki_p_res_' + type);
            },
            ascendedLabel(num){
                return num !== undefined ? num : loc('wiki_calc_ascended_level');
            },
            calc(){
                show.result.vis = inputs.harmony.val !== undefined && inputs.ascended.val !== undefined;
                
                if (show.result.vis){
                    show.result.val = +((Math.log(50 + inputs.harmony.val * inputs.ascended.val) - 3.912023005428146) * 0.01).toFixed(5);
                    
                    return show.result.val;
                }
            }
        }
    });
}


function coresQuantumCalc(info){
    let calc = $(`<div class="calc" id="coresQuantumCalc"></div>`);
    info.append(calc);
    
    calc.append(`<h2 class="has-text-caution">${loc('wiki_calc_core_quantum')}</h2>`);
    
    let formula = $(`<div></div>`);
    let variables = $(`<div></div>`);
    
    calc.append(formula);
    calc.append(variables);
    
    let inputs = {
        cores: { val: undefined }
    }
    
    let show = {
        result: { vis: false, val: 0 }
    }
    formula.append(`
        <div>
            <span>1 - (0.99^{{ i.cores.val, 'cores' | generic }})</span><span v-show="s.result.vis"> = {{ false | calc }} = +{{ true | calc }}%</span>
        </div>
    `);
    
    variables.append(`
        <div>
            <div class="calcInput"><span>${loc('wiki_calc_cores')}</span> <b-numberinput :input="val('cores')" min="0" v-model="i.cores.val" :controls="false"></b-numberinput></div>
        </div>
        <div class="calcButton">
            <button class="button" @click="resetInputs()">${loc('wiki_calc_reset')}</button>
            <button class="button" @click="importInputs()">${loc('wiki_calc_import')}</button>
        </div>
    `);
    
    vBind({
        el: `#coresQuantumCalc`,
        data: {
            i: inputs,
            s: show
        },
        methods: {
            val(type){
                if (inputs[type].val && inputs[type].val < 0){
                    inputs[type].val = 0;
                }
            },
            resetInputs(){
                inputs.cores.val = undefined;
            },
            importInputs(){
                inputs.cores.val = global.prestige.AICore.count;
            }
        },
        filters: {
            generic(num, type){
                return num !== undefined ? num : loc('wiki_calc_' + type);
            },
            calc(percent){
                if (percent){
                    return +(show.result.val * 100).toFixed(2);
                }
                show.result.vis = inputs.cores.val !== undefined;
                
                if (show.result.vis){
                    show.result.val = +(1 - (0.99 ** inputs.cores.val)).toFixed(4);
                    
                    return show.result.val;
                }
            }
        }
    });
}
