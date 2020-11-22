import { global } from './vars.js';
import { loc } from './locale.js';
import { easterEgg, trickOrTreat, modRes } from './functions.js';

export function index(){
    $('body').empty();

    // Top Bar
    $('body').append(`<div id="topBar" class="topBar">
        <h2 class="is-sr-only">Top Bar</h2>
        <span class="planetWrap"><span class="planet">{{ race.species | planet }}</span><span class="universe" v-show="showUniverse()">{{ race.universe | universe }}</span></span>
        <span class="calendar" >
            <span v-show="city.calendar.day">
            <b-tooltip :label="moon()" :aria-label="moon()" position="is-bottom" size="is-small" multilined animated><i id="moon" class="moon wi"></i></b-tooltip>
            <span class="year">${loc('year')} <span class="has-text-warning">{{ city.calendar.year }}</span></span> 
            <span class="day">${loc('day')} <span class="has-text-warning">{{ city.calendar.day }}</span></span>
            <b-tooltip :label="weather()" :aria-label="weather()" position="is-bottom" size="is-small" multilined animated><i id="weather" class="weather wi"></i></b-tooltip>
            <b-tooltip :label="temp()" :aria-label="temp()" position="is-bottom" size="is-small" multilined animated><i id="temp" class="temp wi"></i></b-tooltip>
            </span>
        </span>
        <span class="version" id="versionLog"><a href="wiki.html#changelog" target="_blank"></a></span>
    </div>`);

    let main = $(`<div id="main" class="main"></div>`);
    let columns = $(`<div class="columns is-gapless"></div>`);
    $('body').append(main);
    main.append(columns);

    // Left Column
    columns.append(`<div class="column is-one-quarter leftColumn">
        <div id="race" class="race columns is-mobile is-gapless">
            <h2 class="is-sr-only">Race Info</h2>
            <div class="column is-one-quarter name">{{ name() }}</div>
            <div class="column is-half morale-contain"><span id="morale" v-show="city.morale.current" class="morale">${loc('morale')} <span class="has-text-warning">{{ city.morale.current | mRound }}%</span></div>
            <div class="column is-one-quarter power"><span id="powerStatus" class="has-text-warning" v-show="city.powered"><span>MW</span> <span id="powerMeter" class="meter">{{ city.power | approx }}</span></span></div>
        </div>
        <div id="sideQueue">
            <div id="buildQueue" class="bldQueue has-text-info" v-show="display"></div>
            <h2 class="is-sr-only">Message Queue</h2>
            <div id="msgQueue" class="msgQueue sticky has-text-info" aria-live="polite"></div>
        </div>
        <div id="resources" class="resources sticky"><h2 class="is-sr-only">${loc('tab_resources')}</h2></div>
    </div>`);

    // Center Column
    let mainColumn = $(`<div id="mainColumn" class="column is-three-quarters"></div>`);
    columns.append(mainColumn);
    let content = $(`<div class="content"></div>`);
    mainColumn.append(content);
    
    content.append(`<h2 class="is-sr-only">Tab Navigation</h2>`);
    let tabs = $(`<b-tabs v-model="s.civTabs" :animated="s.animated"></b-tabs>`);
    content.append(tabs);

    // Evolution Tab
    let evolution = $(`<b-tab-item id="evolution" :visible="s.showEvolve">
        <template slot="header">
            {{ 'tab_evolve' | label }}
        </template>
    </b-tab-item>`);
    tabs.append(evolution);

    // City Tab
    let city = $(`<b-tab-item :visible="s.showCiv">
        <template slot="header">
            {{ 'tab_civil' | label }}
        </template>
        <b-tabs class="resTabs" v-model="s.spaceTabs" :animated="s.animated">
            <b-tab-item id="city" :visible="s.showCity">
                <template slot="header">
                    <h2 class="is-sr-only">{{ 'city' | label }}</h2>
                    <span aria-hidden="true">{{ 'city' | label }}</span>
                </template>
            </b-tab-item>
            <b-tab-item id="space" :visible="s.showSpace">
                <template slot="header">
                    <h2 class="is-sr-only">{{ 'local_space' | label }}</h2>
                    <span aria-hidden="true">{{ 'local_space' | label }}</span>
                </template>
            </b-tab-item>
            <b-tab-item id="interstellar" :visible="s.showDeep">
                <template slot="header">
                    <h2 class="is-sr-only">{{ 'tab_interstellar' | label }}</h2>
                    <span aria-hidden="true">{{ 'tab_interstellar' | label }}</span>
                </template>
            </b-tab-item>
            <b-tab-item id="galaxy" :visible="s.showGalactic">
                <template slot="header">
                    <h2 class="is-sr-only">{{ 'tab_galactic' | label }}</h2>
                    <span aria-hidden="true">{{ 'tab_galactic' | label }}</span>
                </template>
            </b-tab-item>
            <b-tab-item id="portal" :visible="s.showPortal">
                <template slot="header">
                    <h2 class="is-sr-only">{{ 'tab_portal' | label }}</h2>
                    <span aria-hidden="true">{{ 'tab_portal' | label }}</span>
                </template>
            </b-tab-item>
        </b-tabs>
    </b-tab-item>`);
    tabs.append(city);

    let civic = $(`<b-tab-item :visible="s.showCivic">
        <template slot="header">
            {{ 'tab_civics' | label }}
        </template>
        <b-tabs class="resTabs" v-model="s.govTabs" :animated="s.animated">
            <b-tab-item id="civic">
                <template slot="header">
                    <h2 class="is-sr-only">{{ 'tab_gov' | label }}</h2>
                    <span aria-hidden="true">{{ 'tab_gov' | label }}</span>
                </template>
            </b-tab-item>
            <b-tab-item id="industry" class="industryTab" :visible="s.showIndustry">
                <template slot="header">
                    <h2 class="is-sr-only">{{ 'tab_industry' | label }}</h2>
                    <span aria-hidden="true">{{ 'tab_industry' | label }}</span>
                </template>
            </b-tab-item>
            <b-tab-item id="military" class="militaryTab" :visible="s.showMil">
                <template slot="header">
                    <h2 class="is-sr-only">{{ 'tab_military' | label }}</h2>
                    <span aria-hidden="true">{{ 'tab_military' | label }}</span>
                </template>
            </b-tab-item>
            <b-tab-item id="mechLab" class="mechTab" :visible="s.showMechLab">
                <template slot="header">
                    <h2 class="is-sr-only">{{ 'tab_mech' | label }}</h2>
                    <span aria-hidden="true">{{ 'tab_mech' | label }}</span>
                </template>
            </b-tab-item>
        </b-tabs>
    </b-tab-item>`);
    tabs.append(civic);

    // Research Tab
    let research = $(`<b-tab-item :visible="s.showResearch">
        <template slot="header">
            {{ 'tab_research' | label }}
        </template>
        <div id="resQueue" class="resQueue" v-show="rq.display"></div>
        <b-tabs class="resTabs" v-model="s.resTabs" :animated="s.animated">
            <b-tab-item id="tech">
                <template slot="header">
                    <h2 class="is-sr-only">{{ 'new_sr' | label }}</h2>
                    <span aria-hidden="true">{{ 'new' | label }}</span>
                </template>
            </b-tab-item>
            <b-tab-item id="oldTech">
                <template slot="header">
                    <h2 class="is-sr-only">{{ 'old_sr' | label }}</h2>
                    <span aria-hidden="true">{{ 'old' | label }}</span>
                </template>
            </b-tab-item>
        </b-tabs>
    </b-tab-item>`);
    tabs.append(research);

    // Resources Tab
    let resources = $(`<b-tab-item :visible="s.showResources">
        <template slot="header">
            {{ 'tab_resources' | label }}
        </template>
        <b-tabs class="resTabs" v-model="s.marketTabs" :animated="s.animated">
            <b-tab-item id="market" :visible="s.showMarket">
                <template slot="header">
                    {{ 'tab_market' | label }}
                </template>
            </b-tab-item>
            <b-tab-item id="resStorage" :visible="s.showStorage">
                <template slot="header">
                    {{ 'tab_storage' | label }}
                </template>
            </b-tab-item>
            <b-tab-item id="resEjector" :visible="s.showEjector">
                <template slot="header">
                    {{ 'tab_ejector' | label }}
                </template>
            </b-tab-item>
            <b-tab-item id="resCargo" :visible="s.showCargo">
                <template slot="header">
                    {{ 'tab_cargo' | label }}
                </template>
            </b-tab-item>
            <b-tab-item id="resAlchemy" :visible="s.showAlchemy">
                <template slot="header">
                    {{ 'tab_alchemy' | label }}
                </template>
            </b-tab-item>
        </b-tabs>
    </b-tab-item>`);
    tabs.append(resources);

    // ARPA Tab
    let arpa = $(`<b-tab-item :visible="s.showGenetics">
        <template slot="header">
            {{ 'tech_arpa' | label }}
        </template>
        <div id="apra" class="arpa">
            <b-tabs v-model="s.arpa.arpaTabs" :animated="s.animated">
                <b-tab-item id="arpaPhysics" :visible="s.arpa.physics" label="${loc('tab_arpa_projects')}"></b-tab-item>
                <b-tab-item id="arpaGenetics" :visible="s.arpa.genetics" label="${loc('tab_arpa_genetics')}"></b-tab-item>
                <b-tab-item id="arpaCrispr" :visible="s.arpa.crispr" label="${loc('tab_arpa_crispr')}"></b-tab-item>
                <b-tab-item id="arpaBlood" :visible="s.arpa.blood" label="${loc('tab_arpa_blood')}"></b-tab-item>
            </b-tabs>
        </div>
    </b-tab-item>`);
    tabs.append(arpa);

    // Stats Tab
    let stats = $(`<b-tab-item :visible="s.showAchieve">
        <template slot="header">
            {{ 'tab_stats' | label }}
        </template>
        <b-tabs class="resTabs" v-model="s.statsTabs" :animated="s.animated">
            <b-tab-item id="stats">
                <template slot="header">
                    {{ 'tab_stats' | label }}
                </template>
            </b-tab-item>
            <b-tab-item id="achieve">
                <template slot="header">
                    {{ 'tab_achieve' | label }}
                </template>
            </b-tab-item>
        </b-tabs>
    </b-tab-item>`);
    tabs.append(stats);

    let iconlist = '';
    let icons = [
        {i: 'nuclear',      f: 'steelem',       r: 2 },
        {i: 'zombie',       f: 'the_misery',    r: 2 },
        {i: 'fire',         f: 'ill_advised',   r: 2 },
        {i: 'mask',         f: 'friday',        r: 1 },
        {i: 'skull',        f: 'demon_slayer',  r: 2 },
        {i: 'taijitu',      f: 'equilibrium',   r: 2 },
        {i: 'martini',      f: 'utopia',        r: 2 },
        {i: 'lightbulb',    f: 'energetic',     r: 2 },
        {i: 'trash',        f: 'garbage_pie',   r: 2 },
        {i: 'turtle',       f: 'finish_line',   r: 2 },
        {i: 'heart',        f: 'valentine',     r: 1 },
        {i: 'clover',       f: 'leprechaun',    r: 1 },
        {i: 'bunny',        f: 'easter',        r: 1 },
        {i: 'egg',          f: 'egghunt',       r: 1 },
        {i: 'ghost',        f: 'halloween',     r: 1 },
        {i: 'candy',        f: 'trickortreat',  r: 1 },
        {i: 'turkey',       f: 'thanksgiving',  r: 1 },
        {i: 'present',      f: 'xmas',          r: 1 }
    ];

    for (let i=0; i<icons.length; i++){
        if (global.stats.feat[icons[i].f] && global.stats.feat[icons[i].f] >= icons[i].r){
            iconlist = iconlist + `<b-dropdown-item v-on:click="icon('${icons[i].i}')">{{ '${icons[i].i}' | label }}</b-dropdown-item>`;
        }
        else if (global.settings.icon === icons[i].i){
            global.settings.icon = 'star';
        }
    }

    let egg = easterEgg(9,14);
    let hideEgg = '';
    if (egg.length > 0){
        hideEgg = `<b-dropdown-item>${egg}</b-dropdown-item>`;
    }

    let trick = trickOrTreat(11,12);
    let hideTreat = '';
    if (trick.length > 0){
        hideTreat = `<b-dropdown-item>${trick}</b-dropdown-item>`;
    }

    // Settings Tab
    let settings = $(`<b-tab-item class="settings">
        <template slot="header">
            {{ 'tab_settings' | label }}
        </template>
        <div class="theme">
            <span>{{ 'theme' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ 'theme_' + s.theme | label }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="setTheme('dark')">{{ 'theme_dark' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('light')">{{ 'theme_light' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('night')">{{ 'theme_night' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('redgreen')">{{ 'theme_redgreen' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('darkNight')">{{ 'theme_darkNight' | label }}</b-dropdown-item>
                ${hideEgg}
            </b-dropdown>
            <span>{{ 'units' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.affix }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="si">{{ 'metric' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="sci">{{ 'scientific' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="sln">{{ 'sln' | label }}</b-dropdown-item>
                ${hideTreat}
            </b-dropdown>

            <span>{{ 'icons' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.icon | label }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="icon('star')">{{ 'star' | label }}</b-dropdown-item>
                ${iconlist}
            </b-dropdown>
        </div>
        <div id="localization" class="localization"></div>
        <b-switch class="setting" v-model="s.mKeys"><b-tooltip :label="keys()" position="is-bottom" size="is-small" multilined animated>{{ 'm_keys' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.cLabels"><b-tooltip :label="city()" position="is-bottom" size="is-small" multilined animated>{{ 'c_cat' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.qKey"><b-tooltip :label="qKey()" position="is-bottom" size="is-small" multilined animated>{{ 'q_key' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.qAny"><b-tooltip :label="qAny()" position="is-bottom" size="is-small" multilined animated>{{ 'q_any' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.expose"><b-tooltip :label="expose()" position="is-bottom" size="is-small" multilined animated>{{ 'expose' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.boring"><b-tooltip :label="boring()" position="is-bottom" size="is-small" multilined animated>{{ 'boring' | label }}</b-tooltip></b-switch>
        <div>
            <div>${loc('key_mappings')}</div>
            <div class="keyMap"><span>${loc('multiplier',[10])}</span> <b-input v-model="s.keyMap.x10" id="x10Key"></b-input></div>
            <div class="keyMap"><span>${loc('multiplier',[25])}</span> <b-input class="keyMap" v-model="s.keyMap.x25" id="x25Key"></b-input></div>
            <div class="keyMap"><span>${loc('multiplier',[100])}</span> <b-input class="keyMap" v-model="s.keyMap.x100" id="x100Key"></b-input></div>
            <div class="keyMap"><span>${loc('q_key')}</span> <b-input class="keyMap" v-model="s.keyMap.q" id="queueKey"></b-input></div>
        </div>
        <div class="importExport">
            <b-field label="${loc('import_export')}">
                <b-input id="importExport" type="textarea"></b-input>
            </b-field>
            <button class="button" @click="saveImport">{{ 'import' | label }}</button>
            <button class="button" @click="saveExport">{{ 'export' | label }}</button>
            <button class="button right" @click="restoreGame"><b-tooltip :label="restoreData()" position="is-top" size="is-large" multilined animated>{{ 'restore' | label }}</b-tooltip></button>
        </div>
        <div class="reset">
            <b-collapse :open="false">
                <b-switch v-model="s.disableReset" slot="trigger">{{ 'enable_reset' | label }}</b-switch>
                <div class="notification">
                    <div class="content">
                        <h4 class="has-text-danger">
                            {{ 'reset_warn' | label }}
                        </h4>
                        <p>
                            <button class="button" :disabled="!s.disableReset" @click="soft_reset()"><b-tooltip :label="soft()" position="is-top" size="is-large" multilined animated>{{ 'reset_soft' | label }}</b-tooltip></button>
                            <button class="button right" :disabled="!s.disableReset" @click="reset()"><b-tooltip :label="hard()" position="is-top" size="is-small" multilined animated>{{ 'reset_hard' | label }}</b-tooltip></button>
                        </p>
                    </div>
                </div>
            </b-collapse>
        </div>
    </b-tab-item>`);

    tabs.append(settings);
    
    // Right Column
    columns.append(`<div id="queueColumn" class="queueCol column"></div>`);

    // Bottom Bar
    $('body').append(`
        <div class="promoBar">
            <span class="left">
                <h1>
                    <span class="has-text-warning">Evolve</span>
                    by
                    <span class="has-text-success">Demagorddon</span>
                </h1>
            </span>
            <span class="right">
                <h2 class="is-sr-only">External Links</h2>
                <ul class="external-links">
                    <li><a href="wiki.html" target="_blank">Wiki</a></li>
                    <li><a href="https://www.reddit.com/r/EvolveIdle/" target="_blank">Reddit</a></li>
                    <li><a href="https://discord.gg/dcwdQEr" target="_blank">Discord</a></li>
                    <li><a href="https://github.com/pmotschmann/Evolve" target="_blank">GitHub</a></li>
                    <li><a href="https://www.patreon.com/demagorddon" target="_blank">Patreon</a></li>
                    <li><a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=PTRJZBW9J662C&currency_code=USD&source=url" target="_blank">Donate</a></li>
                </ul>
            </span>
        </div>
    `);
}
