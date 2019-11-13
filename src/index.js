import { global } from './vars.js';
import { loc } from './locale.js';

export function index(){
    $('body').empty();

    // Top Bar
    $('body').append(`<div id="topBar" class="topBar">
        <h2 class="is-sr-only">Top Bar</h2>
        <span class="planetWrap"><span class="planet">{{ race.species | planet }}</span><span class="universe" v-show="showUniverse()">{{ race.universe | universe }}</span></span>
        <span class="calendar" >
            <span v-show="city.calendar.day">
            <b-tooltip :label="moon()" :aria-label="moon()" position="is-bottom" size="is-small" multilined animated><i id="moon" class="moon wi"></i></b-tooltip>
            <span class="year">Year <span class="has-text-warning">{{ city.calendar.year }}</span></span> 
            <span class="day">Day <span class="has-text-warning">{{ city.calendar.day }}</span></span>
            <b-tooltip :label="weather()" :aria-label="weather()" position="is-bottom" size="is-small" multilined animated><i id="weather" class="weather wi"></i></b-tooltip>
            <b-tooltip :label="temp()" :aria-label="temp()" position="is-bottom" size="is-small" multilined animated><i id="temp" class="temp wi"></i></b-tooltip>
            </span>
        </span>
        <span class="version"><a href="https://github.com/${global.beta ? 'evolvebeta' : 'pmotschmann'}/Evolve/blob/master/changelog.md" target="_blank"></a></span>
    </div>`);

    let main = $(`<div id="main" class="main"></div>`);
    let columns = $(`<div class="columns is-gapless"></div>`);
    $('body').append(main);
    main.append(columns);

    // Left Column
    columns.append(`<div class="column is-one-quarter">
        <div id="race" class="race columns is-mobile is-gapless">
            <h2 class="is-sr-only">Race Info</h2>
            <div class="column is-one-quarter"><b-tooltip :label="desc()" position="is-right" size="is-large" multilined animated>{{ name() }}</b-tooltip></div>
            <div class="column is-half morale-contain"><span id="morale" v-show="city.morale.current" class="morale">Morale <span class="has-text-warning">{{ city.morale.current | mRound }}%</span></div>
            <div class="column is-one-quarter power"><span id="powerStatus" class="has-text-warning" v-show="city.powered"><span>kW</span> <span id="powerMeter" class="meter">{{ city.power | approx }}</span></span></div>
        </div>
        <div id="sideQueue">
            <div id="buildQueue" class="bldQueue has-text-info" v-show="display"></div>
            <h2 class="is-sr-only">Message Queue</h2>
            <div id="msgQueue" class="msgQueue has-text-info" aria-live="polite"></div>
        </div>
        <div id="resources" class="resources"><h2 class="is-sr-only">${loc('tab_resources')}</h2></div>
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
    let city = $(`<b-tab-item :visible="s.showCity">
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
            <b-tab-item id="portal" :visible="s.showPortal">
                <template slot="header">
                    <h2 class="is-sr-only">{{ 'tab_portal' | label }}</h2>
                    <span aria-hidden="true">{{ 'tab_portal' | label }}</span>
                </template>
            </b-tab-item>
        </b-tabs>
    </b-tab-item>`);
    tabs.append(city);

    /* Civics Tab
    let civic = $(`<b-tab-item id="civic" :visible="s.showCivic" class="columns">
        <template slot="header">
            {{ 'tab_civics' | label }}
        </template>
    </b-tab-item>`);
    tabs.append(civic);*/

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
            <b-tab-item id="military" :visible="s.showMil">
                <template slot="header">
                    <h2 class="is-sr-only">{{ 'tab_military' | label }}</h2>
                    <span aria-hidden="true">{{ 'tab_military' | label }}</span>
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
        </b-tabs>
    </b-tab-item>`);
    tabs.append(resources);

    // ARPA Tab
    let arpa = $(`<b-tab-item :visible="s.showGenetics" label="A.R.P.A.">
        <div id="apra" class="arpa">
            <b-tabs v-model="s.arpa.arpaTabs" :animated="s.animated">
                <b-tab-item id="arpaPhysics" :visible="s.arpa.physics" label="${loc('tab_arpa_projects')}"></b-tab-item>
                <b-tab-item id="arpaGenetics" :visible="s.arpa.genetics" label="${loc('tab_arpa_genetics')}"></b-tab-item>
                <b-tab-item id="arpaCrispr" :visible="s.arpa.crispr" label="${loc('tab_arpa_crispr')}"></b-tab-item>
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

    // Settings Tab
    let settings = $(`<b-tab-item class="settings">
        <template slot="header">
            {{ 'tab_settings' | label }}
        </template>
        <div class="theme">
            <span>{{ 'theme' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.theme | namecase }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="dark">{{ 'theme_dark' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="light">{{ 'theme_light' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="night">{{ 'theme_night' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="redgreen">{{ 'theme_redgreen' | label }}</b-dropdown-item>
            </b-dropdown>
        </div>
        <div id="localization" class="localization"></div>
        <b-switch class="setting" v-model="s.mKeys"><b-tooltip :label="keys()" position="is-bottom" size="is-small" multilined animated>{{ 'm_keys' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.cLabels"><b-tooltip :label="city()" position="is-bottom" size="is-small" multilined animated>{{ 'c_cat' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.qKey"><b-tooltip :label="qKey()" position="is-bottom" size="is-small" multilined animated>{{ 'q_key' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.qAny"><b-tooltip :label="qAny()" position="is-bottom" size="is-small" multilined animated>{{ 'q_any' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.expose"><b-tooltip :label="expose()" position="is-bottom" size="is-small" multilined animated>{{ 'expose' | label }}</b-tooltip></b-switch>
        <div>
            <div>Key Mappings</div>
            <div class="keyMap"><span>10X Multiplier</span> <b-input v-model="s.keyMap.x10" id="x10Key"></b-input></div>
            <div class="keyMap"><span>25X Multiplier</span> <b-input class="keyMap" v-model="s.keyMap.x25" id="x25Key"></b-input></div>
            <div class="keyMap"><span>100X Multiplier</span> <b-input class="keyMap" v-model="s.keyMap.x100" id="x100Key"></b-input></div>
            <div class="keyMap"><span>Queue Key</span> <b-input class="keyMap" v-model="s.keyMap.q" id="queueKey"></b-input></div>
        </div>
        <div class="importExport">
            <b-field label="Import/Export Save">
                <b-input id="importExport" type="textarea"></b-input>
            </b-field>
            <button class="button" onclick="importGame()">{{ 'import' | label }}</button>
            <button class="button" onclick="exportGame()">{{ 'export' | label }}</button>
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
                            <button class="button" :disabled="!s.disableReset" @click="soft_reset()"><b-tooltip :label="soft()" position="is-top" size="is-small" multilined animated>{{ 'reset_soft' | label }}</b-tooltip></button>
                            <button class="button" :disabled="!s.disableReset" @click="reset()"><b-tooltip :label="hard()" position="is-top" size="is-small" multilined animated>{{ 'reset_hard' | label }}</b-tooltip></button>
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
    $('body').append(`<div class="promoBar"><span class="left"><h1 class="has-text-warning">Evolve</span> by <span class="has-text-success">Demagorddon</h1></span><span class="right"><h2 class="is-sr-only">External Links</h2><a href="https://www.reddit.com/r/EvolveIdle/" target="_blank">Reddit</a> | <a href="https://discord.gg/dcwdQEr" target="_blank">Discord</a> | <a href="https://github.com/pmotschmann/Evolve" target="_blank">GitHub</a> | <a href="https://www.patreon.com/demagorddon" target="_blank">Patreon</a> | <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=PTRJZBW9J662C&currency_code=USD&source=url" target="_blank">Donate</a></span></div>`);
}