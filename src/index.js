import { global, tmp_vars, save, message_logs, message_filters, webWorker } from './vars.js';
import { loc, locales } from './locale.js';
import { setupStats, alevel } from './achieve.js';
import { vBind, initMessageQueue, clearElement, flib, tagEvent, gameLoop, popover, clearPopper, powerGrid, easterEgg, trickOrTreat, drawIcon } from './functions.js';
import { tradeRatio, atomic_mass, supplyValue, marketItem, containerItem, loadEjector, loadSupply, loadAlchemy, initResourceTabs, tradeSummery } from './resources.js';
import { defineJobs, } from './jobs.js';
import { clearSpyopDrag } from './governor.js';
import { defineIndustry, setPowerGrid, gridDefs, clearGrids } from './industry.js';
import { defineGovernment, defineGarrison, buildGarrison, commisionGarrison, foreignGov } from './civics.js';
import { races, shapeShift } from './races.js';
import { drawEvolution, drawCity, drawTech, resQueue, clearResDrag } from './actions.js';
import { renderSpace, ascendLab, terraformLab } from './space.js';
import { renderFortress, buildFortress, drawMechLab, clearMechDrag, drawHellObservations } from './portal.js';
import { drawShipYard, clearShipDrag, renderTauCeti } from './truepath.js';
import { arpa, clearGeneticsDrag } from './arpa.js';

export function mainVue(){
    vBind({
        el: '#mainColumn div:first-child',
        data: {
            s: global.settings
        },
        methods: {
            swapTab(tab){
                if (!global.settings.tabLoad){
                    loadTab(tab);
                }
                return tab;
            },
            saveImport(){
                if ($('#importExport').val().length > 0){
                    importGame($('#importExport').val());
                }
            },
            saveExport(){
                $('#importExport').val(window.exportGame());
                $('#importExport').select();
                document.execCommand('copy');
            },
            saveExportFile(){
                const downloadToFile = (content, filename, contentType) => {
                    const a = document.createElement('a');
                    const file = new Blob([content], {type: contentType});
                    a.href= URL.createObjectURL(file);
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(a.href);
                };
                const date = new Date();
                downloadToFile(window.exportGame(), `evolve-${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}.txt`, 'text/plain');
            },
            importStringFile(){ 
                let file = document.getElementById("stringPackFile").files[0];
                if (file) {
                    let reader = new FileReader();
                    let fileName = document.getElementById("stringPackFile").files[0].name;
                    reader.readAsText(file, "UTF-8");
                    reader.onload = function (evt) {
                        try {
                            JSON.parse(evt.target.result);
                        }
                        catch {
                            global.settings.sPackMsg = loc(`string_pack_error`,[fileName]);
                            return;
                        }
                       
                        global.settings.sPackMsg = loc(`string_pack_using`,[fileName]);
                        save.setItem('string_pack_name',fileName); save.setItem('string_pack',LZString.compressToUTF16(evt.target.result));
                        if (global.settings.sPackOn){
                            global.queue.rename = true;
                            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                            if (webWorker.w){
                                webWorker.w.terminate();
                            }
                            window.location.reload();
                        }
                       
                    }
                    reader.onerror = function (evt) {
                        console.error("error reading file");
                    }
                }
            },
            clearStringFile(){
                if (save.getItem('string_pack')){
                    global.settings.sPackMsg = loc(`string_pack_none`);
                    save.removeItem('string_pack_name');
                    save.removeItem('string_pack');
                    if (global.settings.sPackOn){
                        global.queue.rename = true;
                        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                        if (webWorker.w){
                            webWorker.w.terminate();
                        }
                        window.location.reload();
                    }
                }
            },
            stringPackOn(){
                if (save.getItem('string_pack')){
                    global.queue.rename = true;
                    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                    if (webWorker.w){
                        webWorker.w.terminate();
                    }
                    window.location.reload();
                }
            },
            restoreGame(){
                let restore_data = save.getItem('evolveBak') || false;
                this.$buefy.dialog.confirm({
                    title: loc('restore'),
                    message: loc('restore_warning'),
                    ariaModal: true,
                    confirmText: loc('restore'),
                    onConfirm() {
                        if (restore_data){
                            importGame(restore_data,true);
                        }
                    }
                });
            },
            lChange(locale){
                global.settings.locale = locale;
                global.queue.rename = true;
                save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                if (webWorker.w){
                    webWorker.w.terminate();
                }
                window.location.reload();
            },
            setTheme(theme){
                global.settings.theme = theme;
                $('html').removeClass();
                $('html').addClass(theme);
                $('html').addClass(global.settings.font);
            },
            numNotation(notation){
                global.settings.affix = notation;
            },
            icon(icon){
                global.settings.icon = icon;
                save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                if (webWorker.w){
                    webWorker.w.terminate();
                }
                window.location.reload();
            },
            remove(index){
                global.r_queue.queue.splice(index,1);
            },
            font(f){
                global.settings.font = f;
                $(`html`).removeClass('standard');
                $(`html`).removeClass('large_log');
                $(`html`).removeClass('large_all');
                $('html').addClass(f);
            },
            q_merge(merge){
                global.settings.q_merge = merge;
            },
            toggleTabLoad(){
                initTabs();
            },
            unpause(){
                $(`#pausegame`).removeClass('play');
                $(`#pausegame`).removeClass('pause');
                if (global.settings.pause){
                    $(`#pausegame`).addClass('pause');
                }
                else {
                    $(`#pausegame`).addClass('play');
                }
                if (!global.settings.pause && !webWorker.s){
                    gameLoop('start');
                }
            }
        },
        filters: {
            namecase(name){
                return name.replace(/(?:^|\s)\w/g, function(match) {
                    return match.toUpperCase();
                });
            },
            label(lbl){
                return tabLabel(lbl);
            },
            sPack(){
                return global.settings.sPackMsg;
            },
            notation(n){
                switch (n){
                    case 'si':
                        return loc(`metric`);
                    case 'sci':
                        return loc(`scientific`);
                    case 'sln':
                        return loc(`sln`);
                }
            }
        }
    });

    ['1','3','4','5','6','7','8','9','10','11','12','13','14','15','16'].forEach(function(k){
        popover(`settings${k}`, function(){
                return loc(`settings${k}`);
            },
            {
                elm: `#settings span.settings${k}`
            }
        );
    });

    let example = `<div class="example">{
  "year": "Galactic Standard Year",
  "resource_Food_name": "Nom Noms"
}</div>`;

    popover(`stringPack`, function(){
            return loc(`string_example`,[example]);
        }
    );
}

function tabLabel(lbl){
    switch (lbl){
        case 'city':
            if (global.resource[global.race.species]){
                if (global.resource[global.race.species].amount <= 5){
                    return loc('tab_city1');
                }
                else if (global.resource[global.race.species].amount <= 20){
                    return loc('tab_city2');
                }
                else if (global.resource[global.race.species].amount <= 75){
                    return loc('tab_city3');
                }
                else if (global.resource[global.race.species].amount <= 250){
                    return loc('tab_city4');
                }
                else if (global.resource[global.race.species].amount <= 600){
                    return loc('tab_city5');
                }
                else if (global.resource[global.race.species].amount <= 1200){
                    return loc('tab_city6');
                }
                else if (global.resource[global.race.species].amount <= 2500){
                    return loc('tab_city7');
                }
                else {
                    return loc('tab_city8');
                }
            }
            else {
                return loc('tab_city1');
            }
        case 'local_space':
            return loc('sol_system',[global.race['truepath'] ? races[global.race.species].home : flib('name')]);
        case 'outer_local_space':
            return loc('outer_sol_system',[global.race['truepath'] ? races[global.race.species].home : flib('name')])
        case 'old':
            return loc('tab_old_res');
        case 'new':
            return loc('tab_new_res');
        case 'old_sr':
            return loc('tab_old_sr_res');
        case 'new_sr':
            return loc('tab_new_sr_res');
        default:
            return loc(lbl);
    }
}

export function initTabs(){
    if (global.settings.tabLoad){
        loadTab(`mTabCivil`);
        loadTab(`mTabCivic`);
        loadTab(`mTabResearch`);
        loadTab(`mTabResource`);
        loadTab(`mTabArpa`);
        loadTab(`mTabStats`);
        loadTab(`mTabObserve`);
    }
    else {
        loadTab(global.settings.civTabs);
    }
}

export function loadTab(tab){
    if (!global.settings.tabLoad){
        clearResDrag();
        clearGrids();
        clearMechDrag();
        clearGeneticsDrag();
        clearSpyopDrag();
        clearShipDrag();
        clearElement($(`#mTabCivil`));
        clearElement($(`#mTabCivic`));
        clearElement($(`#mTabResearch`));
        clearElement($(`#mTabResource`));
        clearElement($(`#mTabArpa`));
        clearElement($(`#mTabStats`));
        clearElement($(`#mTabObserve`));
    }
    else {
        tagEvent('page_view',{ page_title: `Evolve - All Tabs` });
    }
    switch (tab){
        case 0:
            if (!global.settings.tabLoad){
                tagEvent('page_view',{ page_title: `Evolve - Evolution` });
                drawEvolution();
            }
            break;
        case 1:
        case 'mTabCivil':
            {
                if (!global.settings.tabLoad){
                    tagEvent('page_view',{ page_title: `Evolve - Civilization` });
                }
                $(`#mTabCivil`).append(`<b-tabs class="resTabs" v-model="s.spaceTabs" :animated="s.animated" @input="swapTab">
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
                    <b-tab-item id="outerSol" :visible="s.showOuter">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'outer_local_space' | label }}</h2>
                            <span aria-hidden="true">{{ 'outer_local_space' | label }}</span>
                        </template>
                    </b-tab-item>
                    <b-tab-item id="tauceti" :visible="s.showTau">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'tab_tauceti' | label }}</h2>
                            <span aria-hidden="true">{{ 'tab_tauceti' | label }}</span>
                        </template>
                    </b-tab-item>
                </b-tabs>`);
                vBind({
                    el: `#mTabCivil`,
                    data: {
                        s: global.settings
                    },
                    methods: {
                        swapTab(tab){
                            if (!global.settings.tabLoad){
                                clearElement($(`#city`));
                                clearElement($(`#space`));
                                clearElement($(`#interstellar`));
                                clearElement($(`#galaxy`));
                                clearElement($(`#portal`));
                                clearElement($(`#outerSol`));
                                clearElement($(`#tauCeti`));
                                switch (tab){
                                    case 0:
                                        drawCity();
                                        break;
                                    case 1:
                                    case 2:
                                    case 3:
                                    case 5:
                                        renderSpace();
                                        break;
                                    case 4:
                                        renderFortress();
                                        break;
                                    case 6:
                                        renderTauCeti();
                                        break;
                                }
                            }
                            return tab;
                        }
                    },
                    filters: {
                        label(lbl){
                            return tabLabel(lbl);
                        }
                    }
                });
                if (global.race.species !== 'protoplasm'){
                    drawCity();
                    renderSpace();
                    renderFortress();
                    renderTauCeti();
                }
                if (global.race['noexport']){
                    if (global.race['noexport'] === 'Race'){
                        clearElement($(`#city`));
                        ascendLab();
                    }
                    else if (global.race['noexport'] === 'Planet'){
                        clearElement($(`#city`));
                        terraformLab();
                    }
                }
            }
            break;
        case 2:
        case 'mTabCivic':
            {
                if (!global.settings.tabLoad){
                    tagEvent('page_view',{ page_title: `Evolve - Civics` });
                }
                $(`#mTabCivic`).append(`<b-tabs class="resTabs" v-model="s.govTabs" :animated="s.animated" @input="swapTab">
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
                    <b-tab-item id="powerGrid" class="powerGridTab" :visible="s.showPowerGrid">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'tab_power_grid' | label }}</h2>
                            <span aria-hidden="true">{{ 'tab_power_grid' | label }}</span>
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
                    <b-tab-item id="dwarfShipYard" class="ShipYardTab" :visible="s.showShipYard">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'tab_shipyard' | label }}</h2>
                            <span aria-hidden="true">{{ 'tab_shipyard' | label }}</span>
                        </template>
                    </b-tab-item>
                </b-tabs>`);
                vBind({
                    el: `#mTabCivic`,
                    data: {
                        s: global.settings
                    },
                    methods: {
                        swapTab(tab){
                            if (!global.settings.tabLoad){
                                clearGrids();
                                clearSpyopDrag();
                                clearMechDrag();
                                clearShipDrag();
                                clearElement($(`#civic`));
                                clearElement($(`#industry`));
                                clearElement($(`#powerGrid`));
                                clearElement($(`#military`));
                                clearElement($(`#mechLab`));
                                clearElement($(`#dwarfShipYard`));
                                switch (tab){
                                    case 0:
                                        {
                                            $('#civic').append($('<div id="civics" class="tile is-parent"></div>'));
                                            defineJobs();
                                            $('#civics').append($('<div id="r_civics" class="tile is-vertical is-parent civics"></div>'));
                                            defineGovernment();
                                            if (global.race.species !== 'protoplasm' && !global.race['start_cataclysm']){
                                                commisionGarrison();
                                                buildGarrison($('#c_garrison'),false);
                                                foreignGov();
                                            }
                                            if (global.race['shapeshifter']){
                                                shapeShift(false,true);
                                            }
                                        }
                                        break;
                                    case 1:
                                        defineIndustry();
                                        break;
                                    case 2:
                                        {
                                            Object.keys(gridDefs()).forEach(function(gridtype){
                                                powerGrid(gridtype);
                                            });
                                            setPowerGrid();
                                        }
                                        break;
                                    case 3:
                                        if (global.race.species !== 'protoplasm' && !global.race['start_cataclysm']){
                                            defineGarrison();
                                            buildFortress($('#fortress'),false);
                                        }
                                        break;
                                    case 4:
                                        if (global.race.species !== 'protoplasm' && !global.race['start_cataclysm']){
                                            drawMechLab();
                                        }
                                        break;
                                    case 5:
                                        if (global.race['truepath'] && global.race.species !== 'protoplasm' && !global.race['start_cataclysm']){
                                            drawShipYard();
                                        }
                                        break;
                                }
                            }
                            return tab;
                        }
                    },
                    filters: {
                        label(lbl){
                            return tabLabel(lbl);
                        }
                    }
                });

                Object.keys(gridDefs()).forEach(function(gridtype){
                    powerGrid(gridtype);
                });
                setPowerGrid();

                $('#civic').append($('<div id="civics" class="tile is-parent"></div>'));
                defineJobs();
                $('#civics').append($('<div id="r_civics" class="tile is-vertical is-parent civics"></div>'));
                defineGovernment();
                if (global.race.species !== 'protoplasm' && !global.race['start_cataclysm']){
                    defineGarrison();
                    buildGarrison($('#c_garrison'),false);
                    buildFortress($('#fortress'),false);
                    foreignGov();
                    drawMechLab();
                    if (global.race['truepath']){
                        drawShipYard();
                    }
                }
                if (global.race['shapeshifter']){
                    shapeShift(false,true);
                }
                defineIndustry();
            }
            break;
        case 3:
        case 'mTabResearch':
            {
                if (!global.settings.tabLoad){
                    tagEvent('page_view',{ page_title: `Evolve - Research` });
                }
                $(`#mTabResearch`).append(`<div id="resQueue" class="resQueue" v-show="rq.display"></div>
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
                </b-tabs>`);
                vBind({
                    el: `#mTabResearch`,
                    data: {
                        s: global.settings,
                        rq: global.r_queue
                    },
                    filters: {
                        label(lbl){
                            return tabLabel(lbl);
                        }
                    }
                });
                resQueue();
                if (global.race.species !== 'protoplasm'){
                    drawTech();
                }
            }
            break;
        case 4:
        case 'mTabResource':
            {
                if (!global.settings.tabLoad){
                    tagEvent('page_view',{ page_title: `Evolve - Resources` });
                }
                $(`#mTabResource`).append(`<b-tabs class="resTabs" v-model="s.marketTabs" :animated="s.animated" @input="swapTab">
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
                </b-tabs>`);
                vBind({
                    el: `#mTabResource`,
                    data: {
                        s: global.settings
                    },
                    methods: {
                        swapTab(tab){
                            if (!global.settings.tabLoad){
                                clearElement($(`#market`));
                                clearElement($(`#resStorage`));
                                clearElement($(`#resEjector`));
                                clearElement($(`#resCargo`));
                                clearElement($(`#resAlchemy`));
                                switch (tab){
                                    case 0:
                                        {
                                            initResourceTabs('market');
                                            if (tmp_vars.hasOwnProperty('resource')){
                                                Object.keys(tmp_vars.resource).forEach(function(name){
                                                    let color = tmp_vars.resource[name].color;
                                                    let tradable = tmp_vars.resource[name].tradable;
                                                    if (tradable){
                                                        var market_item = $(`<div id="market-${name}" class="market-item" v-show="r.display"></div>`);
                                                        $('#market').append(market_item);
                                                        marketItem(`#market-${name}`,market_item,name,color,true);
                                                    }
                                                });
                                            }
                                            tradeSummery();
                                        }
                                        break;
                                    case 1:
                                        {
                                            initResourceTabs('storage');
                                            if (tmp_vars.hasOwnProperty('resource')){
                                                Object.keys(tmp_vars.resource).forEach(function(name){
                                                    let color = tmp_vars.resource[name].color;
                                                    let stackable = tmp_vars.resource[name].stackable;
                                                    if (stackable){
                                                        var market_item = $(`<div id="stack-${name}" class="market-item" v-show="display"></div>`);
                                                        $('#resStorage').append(market_item);
                                                        containerItem(`#stack-${name}`,market_item,name,color,true);
                                                    }
                                                });
                                            }
                                            tradeSummery();
                                        }
                                        break;
                                    case 2:
                                        {
                                            initResourceTabs('ejector');
                                            if (tmp_vars.hasOwnProperty('resource')){
                                                Object.keys(tmp_vars.resource).forEach(function(name){
                                                    let color = tmp_vars.resource[name].color;
                                                    if (atomic_mass[name]){
                                                        loadEjector(name,color);
                                                    }
                                                });
                                            }
                                        }
                                        break;
                                    case 3:
                                        {
                                            initResourceTabs('supply');
                                            if (tmp_vars.hasOwnProperty('resource')){
                                                Object.keys(tmp_vars.resource).forEach(function(name){
                                                    let color = tmp_vars.resource[name].color;
                                                    if (supplyValue[name]){
                                                        loadSupply(name,color);
                                                    }
                                                });
                                            }
                                        }
                                        break;
                                    case 4:
                                        {
                                            initResourceTabs('alchemy');
                                            if (tmp_vars.hasOwnProperty('resource')){
                                                Object.keys(tmp_vars.resource).forEach(function(name){
                                                    let color = tmp_vars.resource[name].color;
                                                    let tradable = tmp_vars.resource[name].tradable;
                                                    if (tradeRatio[name] && global.race.universe === 'magic'){
                                                        global['resource'][name]['basic'] = tradable;
                                                        loadAlchemy(name,color,tradable);
                                                    }
                                                });
                                            }
                                        }
                                        break;
                                }
                            }
                            return tab;
                        }
                    },
                    filters: {
                        label(lbl){
                            return tabLabel(lbl);
                        }
                    }
                });

                initResourceTabs();
                if (tmp_vars.hasOwnProperty('resource')){
                    Object.keys(tmp_vars.resource).forEach(function(name){
                        let color = tmp_vars.resource[name].color;
                        let tradable = tmp_vars.resource[name].tradable;
                        let stackable = tmp_vars.resource[name].stackable;

                        if (stackable){
                            var market_item = $(`<div id="stack-${name}" class="market-item" v-show="display"></div>`);
                            $('#resStorage').append(market_item);
                            containerItem(`#stack-${name}`,market_item,name,color,true);
                        }

                        if (tradable){
                            var market_item = $(`<div id="market-${name}" class="market-item" v-show="r.display"></div>`);
                            $('#market').append(market_item);
                            marketItem(`#market-${name}`,market_item,name,color,true);
                        }
                    
                        if (atomic_mass[name]){
                            loadEjector(name,color);
                        }
                    
                        if (supplyValue[name]){
                            loadSupply(name,color);
                        }
                    
                        if (tradeRatio[name] && global.race.universe === 'magic'){
                            global['resource'][name]['basic'] = tradable;
                            loadAlchemy(name,color,tradable);
                        }
                    });
                }
                tradeSummery();
            }
            break;
        case 5:
        case 'mTabArpa':
            {
                if (!global.settings.tabLoad){
                    tagEvent('page_view',{ page_title: `Evolve - Arpa` });
                }
                $(`#mTabArpa`).append(`<div id="apra" class="arpa">
                    <b-tabs class="resTabs" v-model="s.arpa.arpaTabs" :animated="s.animated">
                        <b-tab-item id="arpaPhysics" :visible="s.arpa.physics" label="${loc('tab_arpa_projects')}"></b-tab-item>
                        <b-tab-item id="arpaGenetics" :visible="s.arpa.genetics" label="${loc(global.race['artifical'] ? 'tab_arpa_machine' : 'tab_arpa_genetics')}"></b-tab-item>
                        <b-tab-item id="arpaCrispr" :visible="s.arpa.crispr" label="${loc('tab_arpa_crispr')}"></b-tab-item>
                        <b-tab-item id="arpaBlood" :visible="s.arpa.blood" label="${loc('tab_arpa_blood')}"></b-tab-item>
                    </b-tabs>
                </div>`);
                vBind({
                    el: `#mTabArpa`,
                    data: {
                        s: global.settings
                    },
                    filters: {
                        label(lbl){
                            return tabLabel(lbl);
                        }
                    }
                });
                arpa('Physics');
                arpa('Genetics');
                arpa('Crispr');
                arpa('Blood');
            }
            break;
        case 6:
        case 'mTabStats':
            {
                if (!global.settings.tabLoad){
                    tagEvent('page_view',{ page_title: `Evolve - Stats` });
                }
                $(`#mTabStats`).append(`<b-tabs class="resTabs" v-model="s.statsTabs" :animated="s.animated">
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
                    <b-tab-item id="perks">
                        <template slot="header">
                            {{ 'tab_perks' | label }}
                        </template>
                    </b-tab-item>
                </b-tabs>`);
                vBind({
                    el: `#mTabStats`,
                    data: {
                        s: global.settings
                    },
                    filters: {
                        label(lbl){
                            return tabLabel(lbl);
                        }
                    }
                });
                setupStats();
            }
            break;
        case 7:
            if (!global.settings.tabLoad){
                tagEvent('page_view',{ page_title: `Evolve - Settings` });
            }
            break;
        case 'mTabObserve':
        default:
            if (!global.settings.tabLoad){
                tagEvent('page_view',{ page_title: `Evolve - Hell Observation` });
            }
            if (global.portal.observe){
                drawHellObservations(true);
            }
            break;
    }
    if ($(`#popper`).length > 0 && $(`#${$(`#popper`).data('id')}`).length === 0){
        clearPopper();
    }
}

export function index(){
    clearElement($('body'));

    $('html').addClass(global.settings.font);

    // Top Bar
    $('body').append(`<div id="topBar" class="topBar">
        <h2 class="is-sr-only">Top Bar</h2>
        <span class="planetWrap"><span class="planet">{{ race.species | planet }}</span><span class="universe" v-show="showUniverse()">{{ race.universe | universe }}</span></span>
        <span class="calendar">
            <span class="infoTimer" id="infoTimer"></span>
            <span v-show="city.calendar.day">
                <b-tooltip :label="moon()" :aria-label="moon()" position="is-bottom" size="is-small" multilined animated><i id="moon" class="moon wi"></i></b-tooltip>
                <span class="year">${loc('year')} <span class="has-text-warning">{{ city.calendar.year }}</span></span>
                <span class="day">${loc('day')} <span class="has-text-warning">{{ city.calendar.day }}</span></span>
                <b-tooltip :label="weather()" :aria-label="weather()" position="is-bottom" size="is-small" multilined animated><i id="weather" class="weather wi"></i></b-tooltip>
                <b-tooltip :label="temp()" :aria-label="temp()" position="is-bottom" size="is-small" multilined animated><i id="temp" class="temp wi"></i></b-tooltip>
                <b-tooltip :label="atRemain()" v-show="s.at" :aria-label="atRemain()" position="is-bottom" size="is-small" multilined animated><span class="atime has-text-caution">{{ s.at | remain }}</span></b-tooltip>
                <span id="pausegame" class="atime" role="button" @click="pause" :aria-label="pausedesc()"></span>
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
            <div class="column is-one-quarter power"><span id="powerStatus" class="has-text-warning" v-show="city.powered"><span>MW</span> <span id="powerMeter" class="meter">{{ city.power | replicate | approx }}</span></span></div>
        </div>
        <div id="sideQueue">
            <div id="buildQueue" class="bldQueue has-text-info" v-show="display"></div>
            <div id="msgQueue" class="msgQueue vscroll has-text-info" aria-live="polite">
                <div id="msgQueueHeader">
                    <h2 class="has-text-success">${loc('message_log')}</h2>
                    <span class="special" role="button" title="message queue options" @click="trigModal">
                        <svg version="1.1" x="0px" y="0px" width="12px" height="12px" viewBox="340 140 280 279.416" enable-background="new 340 140 280 279.416" xml:space="preserve">
                            <path class="gear" d="M620,305.666v-51.333l-31.5-5.25c-2.333-8.75-5.833-16.917-9.917-23.917L597.25,199.5l-36.167-36.75l-26.25,18.083
                            c-7.583-4.083-15.75-7.583-23.916-9.917L505.667,140h-51.334l-5.25,31.5c-8.75,2.333-16.333,5.833-23.916,9.916L399.5,163.333
                            L362.75,199.5l18.667,25.666c-4.083,7.584-7.583,15.75-9.917,24.5l-31.5,4.667v51.333l31.5,5.25
                            c2.333,8.75,5.833,16.334,9.917,23.917l-18.667,26.25l36.167,36.167l26.25-18.667c7.583,4.083,15.75,7.583,24.5,9.917l5.25,30.916
                            h51.333l5.25-31.5c8.167-2.333,16.333-5.833,23.917-9.916l26.25,18.666l36.166-36.166l-18.666-26.25
                            c4.083-7.584,7.583-15.167,9.916-23.917L620,305.666z M480,333.666c-29.75,0-53.667-23.916-53.667-53.666s24.5-53.667,53.667-53.667
                            S533.667,250.25,533.667,280S509.75,333.666,480,333.666z"/>
                        </svg>
                    </span>
                    <span role="button" class="zero has-text-advanced" @click="clearLog(m.view)">${loc('message_log_clear')}</span>
                    <span role="button" class="zero has-text-advanced" @click="clearLog()">${loc('message_log_clear_all')}</span>
                </div>
                <h2 class="is-sr-only">${loc('message_filters')}</h2>
                <div id="msgQueueFilters" class="hscroll msgQueueFilters"></div>
                <h2 class="is-sr-only">${loc('messages')}</h2>
                <div id="msgQueueLog" aria-live="polite"></div>
            </div>
        </div>
        <div id="resources" class="resources vscroll"><h2 class="is-sr-only">${loc('tab_resources')}</h2></div>
    </div>`);
    message_filters.forEach(function (filter){
        $(`#msgQueueFilters`).append(`
            <span id="msgQueueFilter-${filter}" class="${filter === 'all' ? 'is-active' : ''}" @click="swapFilter('${filter}')" v-show="s.${filter}.vis">${loc('message_log_' + filter)}</span>
        `);
    });
    vBind({
        el: `#msgQueue`,
        data: {
            m: message_logs,
            s: global.settings.msgFilters
        },
        methods: {
            swapFilter(filter){
                if (message_logs.view !== filter){
                    $(`#msgQueueFilter-${message_logs.view}`).removeClass('is-active');
                    $(`#msgQueueFilter-${filter}`).addClass('is-active');
                    message_logs.view = filter;
                    let queue = $(`#msgQueueLog`);
                    clearElement(queue);
                    message_logs[filter].forEach(function (msg){
                        queue.append($('<p class="has-text-'+msg.color+'">'+msg.msg+'</p>'));
                    });
                }
            },
            clearLog(filter){
                filter = filter ? [filter] : filter;
                initMessageQueue(filter);
                clearElement($(`#msgQueueLog`));
                if (filter){
                    global.lastMsg[filter] = [];
                }
                else {
                    Object.keys(global.lastMsg).forEach(function (tag){
                        global.lastMsg[tag] = [];
                    });
                }
            },
            trigModal(){
                let modal = {
                    template: '<div id="modalBox" class="modalBox"></div>'
                };
                this.$buefy.modal.open({
                    parent: this,
                    component: modal
                });

                let checkExist = setInterval(function(){
                    if ($('#modalBox').length > 0){
                        clearInterval(checkExist);
                        $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('message_log')}</p>`));

                        var body = $('<div id="specialModal" class="modalBody vscroll"></div>');
                        $('#modalBox').append(body);
                        
                        let catVis = $(`
                            <div>
                                <div>
                                    <span class="has-text-warning">${loc('message_log_settings_visible')}</span>
                                </div>
                            </div>
                        `);
                        let catMax = $(`
                            <hr>
                            <div>
                                <div>
                                    <span class="has-text-warning">${loc('message_log_settings_length')}</span>
                                </div>
                            </div>
                        `);
                        let catSave = $(`
                            <hr>
                            <div>
                                <div>
                                    <span class="has-text-warning">${loc('message_log_settings_save')}</span>
                                </div>
                            </div>
                        `);
                        body.append(catVis);
                        body.append(catMax);
                        body.append(catSave);
                        
                        let visSet = ``;
                        let maxSet = ``;
                        let saveSet = ``;
                        
                        let maxInputs = {};
                        let saveInputs = {};
                        message_filters.forEach(function (filter){
                            visSet += `<div class="msgInput" v-show="s.${filter}.unlocked"><span>${loc('message_log_' + filter)}</span> <b-checkbox class="patrol" v-model="s.${filter}.vis" :disabled="checkDisabled('${filter}',s.${filter}.vis)" :input="check('${filter}')"></b-checkbox></div>`;
                            maxSet += `<div class="msgInput" v-show="s.${filter}.unlocked"><span>${loc('message_log_' + filter)}</span> <b-numberinput :input="maxVal('${filter}')" min="1" v-model="mi.${filter}" :controls="false"></b-numberinput></div>`;
                            saveSet += `<div class="msgInput" v-show="s.${filter}.unlocked"><span>${loc('message_log_' + filter)}</span> <b-numberinput :input="saveVal('${filter}')" min="0" :max="s.${filter}.max" v-model="si.${filter}" :controls="false"></b-numberinput></div>`;
                            
                            maxInputs[filter] = global.settings.msgFilters[filter].max;
                            saveInputs[filter] = global.settings.msgFilters[filter].save;
                        });
                        catVis.append(visSet);
                        catMax.append(maxSet);
                        catSave.append(saveSet);
                        catMax.append(`
                            <div class="msgInputApply">
                                <button class="button" @click="applyMax()">${loc('message_log_settings_apply')}</button>
                            </div>
                        `);
                        catSave.append(`
                            <div class="msgInputApply">
                                <button class="button" @click="applySave()">${loc('message_log_settings_apply')}</button>
                            </div>
                        `);
                        
                        
                        vBind({
                            el: `#specialModal`,
                            data: {
                                s: global.settings.msgFilters,
                                mi: maxInputs,
                                si: saveInputs
                            },
                            methods: {
                                check(filter){
                                    if (!global.settings.msgFilters[filter].vis && message_logs.view === filter){
                                       let haveVis = false;
                                        Object.keys(global.settings.msgFilters).forEach(function (filt){
                                            if (global.settings.msgFilters[filt].vis && !haveVis){
                                                haveVis = true;
                                                $(`#msgQueueFilter-${message_logs.view}`).removeClass('is-active');
                                                $(`#msgQueueFilter-${filt}`).addClass('is-active');
                                                message_logs.view = filt;
                                                let queue = $(`#msgQueueLog`);
                                                clearElement(queue);
                                                message_logs[filt].forEach(function (msg){
                                                    queue.append($('<p class="has-text-'+msg.color+'">'+msg.msg+'</p>'));
                                                });
                                            }
                                        });
                                    }
                                },
                                checkDisabled(filter,fill){
                                    if (!global.settings.msgFilters[filter].vis){
                                        return false;
                                    }
                                    let totVis = 0;
                                    Object.keys(global.settings.msgFilters).forEach(function (filt){
                                        if (global.settings.msgFilters[filt].vis){
                                            totVis++;
                                        }
                                    });
                                    
                                    return totVis === 1;
                                },
                                maxVal(filter){
                                    if (maxInputs[filter] < 1){
                                        maxInputs[filter] = 1;
                                    }
                                },
                                saveVal(filter){
                                    if (saveInputs[filter] < 0){
                                        saveInputs[filter] = 0;
                                    }
                                    else if (saveInputs[filter] > global.settings.msgFilters[filter].max){
                                        saveInputs[filter] = global.settings.msgFilters[filter].max;
                                    }
                                },
                                applyMax(){
                                    message_filters.forEach(function (filter){
                                        let max = maxInputs[filter];
                                        global.settings.msgFilters[filter].max = max;
                                        if (max < global.settings.msgFilters[filter].save){
                                            saveInputs[filter] = max;
                                            global.settings.msgFilters[filter].save = max;
                                            global.lastMsg[filter].splice(max);
                                        }
                                        message_logs[filter].splice(max);
                                        if (message_logs.view === filter){
                                            $('#msgQueueLog').children().slice(max).remove();
                                        }
                                    });
                                },
                                applySave(){
                                    message_filters.forEach(function (filter){
                                        global.settings.msgFilters[filter].save = saveInputs[filter];
                                        global.lastMsg[filter].splice(saveInputs[filter]);
                                    });
                                }
                            }
                        });
                    }
                }, 50);
            }
        }
    });

    // Center Column
    let mainColumn = $(`<div id="mainColumn" class="column is-three-quarters"></div>`);
    columns.append(mainColumn);
    let content = $(`<div class="content"></div>`);
    mainColumn.append(content);

    content.append(`<h2 class="is-sr-only">Tab Navigation</h2>`);
    let tabs = $(`<b-tabs id="mainTabs" v-model="s.civTabs" :animated="s.animated" @input="swapTab"></b-tabs>`);
    content.append(tabs);

    // Evolution Tab
    let evolution = $(`<b-tab-item id="evolution" class="tab-item sticky" :visible="s.showEvolve">
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
        <div id="mTabCivil"></div>
    </b-tab-item>`);
    tabs.append(city);

    // Civics Tab
    let civic = $(`<b-tab-item :visible="s.showCivic">
        <template slot="header">
            {{ 'tab_civics' | label }}
        </template>
        <div id="mTabCivic"></div>
    </b-tab-item>`);
    tabs.append(civic);

    // Research Tab
    let research = $(`<b-tab-item :visible="s.showResearch">
        <template slot="header">
            {{ 'tab_research' | label }}
        </template>
        <div id="mTabResearch"></div>
    </b-tab-item>`);
    tabs.append(research);

    // Resources Tab
    let resources = $(`<b-tab-item :visible="s.showResources">
        <template slot="header">
            {{ 'tab_resources' | label }}
        </template>
        <div id="mTabResource"></div>
    </b-tab-item>`);
    tabs.append(resources);

    // ARPA Tab
    let arpa = $(`<b-tab-item :visible="s.showGenetics">
        <template slot="header">
            {{ 'tech_arpa' | label }}
        </template>
        <div id="mTabArpa"></div>
    </b-tab-item>`);
    tabs.append(arpa);

    // Stats Tab
    let stats = $(`<b-tab-item :visible="s.showAchieve">
        <template slot="header">
            {{ 'tab_stats' | label }}
        </template>
        <div id="mTabStats"></div>
    </b-tab-item>`);
    tabs.append(stats);

    let iconlist = '';
    let icons = [
        {i: 'nuclear',      f: 'steelem',           r: 2 },
        {i: 'zombie',       f: 'the_misery',        r: 2 },
        {i: 'fire',         f: 'ill_advised',       r: 2 },
        {i: 'mask',         f: 'friday',            r: 1 },
        {i: 'skull',        f: 'demon_slayer',      r: 2 },
        {i: 'taijitu',      f: 'equilibrium',       r: 2 },
        {i: 'martini',      f: 'utopia',            r: 2 },
        {i: 'lightbulb',    f: 'energetic',         r: 2 },
        {i: 'trash',        f: 'garbage_pie',       r: 2 },
        {i: 'banana',       f: 'banana',            r: 2 },
        {i: 'turtle',       f: 'finish_line',       r: 2 },
        {i: 'floppy',       f: 'digital_ascension', r: 2 },
        {i: 'slime',        f: 'slime_lord',        r: 2 },
        {i: 'lightning',    f: 'annihilation',      r: 2 },
        {i: 'heart',        f: 'valentine',         r: 1 },
        {i: 'clover',       f: 'leprechaun',        r: 1 },
        {i: 'bunny',        f: 'easter',            r: 1 },
        {i: 'egg',          f: 'egghunt',           r: 1 },
        {i: 'rocket',       f: 'launch_day',        r: 1 },
        {i: 'sun',          f: 'solstice',          r: 1 },
        {i: 'firework',     f: 'firework',          r: 1 },
        {i: 'ghost',        f: 'halloween',         r: 1 },
        {i: 'candy',        f: 'trickortreat',      r: 1 },
        {i: 'turkey',       f: 'thanksgiving',      r: 1 },
        {i: 'present',      f: 'xmas',              r: 1 }
    ];

    let irank = alevel();
    if (irank < 2){ irank = 2; }
    for (let i=0; i<icons.length; i++){
        if (global.stats.feat[icons[i].f] && global.stats.feat[icons[i].f] >= icons[i].r){
            iconlist = iconlist + `<b-dropdown-item v-on:click="icon('${icons[i].i}')">${drawIcon(icons[i].i, 16, irank)} {{ '${icons[i].i}' | label }}</b-dropdown-item>`;
        }
        else if (global.settings.icon === icons[i].i){
            global.settings.icon = 'star';
        }
    }

    let egg9 = easterEgg(9,14);
    let hideEgg = '';
    if (egg9.length > 0){
        hideEgg = `<b-dropdown-item>${egg9}</b-dropdown-item>`;
    }

    let trick = trickOrTreat(5,12,true);
    let hideTreat = '';
    if (trick.length > 0){
        hideTreat = `<b-dropdown-item>${trick}</b-dropdown-item>`;
    }

    let localelist = '';
    let current_locale = '';
    if (Object.keys(locales).length > 1){
        Object.keys(locales).forEach(function (locale){
          let selected = global.settings.locale;
            if (selected === locale) {
              current_locale = locales[locale];
            }
            localelist = localelist + `<b-dropdown-item v-on:click="lChange('${locale}')">${locales[locale]}</b-dropdown-item>`;
        });
    }

    // Settings Tab
    let settings = $(`<b-tab-item id="settings" class="settings sticky">
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
                <b-dropdown-item v-on:click="setTheme('darkNight')">{{ 'theme_darkNight' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('redgreen')">{{ 'theme_redgreen' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('gruvboxLight')">{{ 'theme_gruvboxLight' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('gruvboxDark')">{{ 'theme_gruvboxDark' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('orangeSoda')">{{ 'theme_orangeSoda' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('dracula')">{{ 'theme_dracula' | label }}</b-dropdown-item>
                ${hideEgg}
            </b-dropdown>
            <span>{{ 'units' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.affix | notation }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="numNotation('si')">{{ 'metric' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="numNotation('sci')">{{ 'scientific' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="numNotation('sln')">{{ 'sln' | label }}</b-dropdown-item>
                ${hideTreat}
            </b-dropdown>

            <span>{{ 'icons' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.icon | label }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="icon('star')">${drawIcon('star',16,irank)} {{ 'star' | label }}</b-dropdown-item>
                ${iconlist}
            </b-dropdown>
        </div>
        <div id="localization" class="localization">
            <span>{{ 'locale' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>${current_locale}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                ${localelist}
            </b-dropdown>

            <span>{{ 'font' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.font | label }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="font('standard')">{{ 'standard' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="font('large_log')">{{ 'large_log' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="font('large_all')">{{ 'large_all' | label }}</b-dropdown-item>
            </b-dropdown>

            <span class="settings15" aria-label="${loc('settings15')}">{{ 'q_merge' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.q_merge | label }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="q_merge('merge_never')">{{ 'merge_never' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="q_merge('merge_nearby')">{{ 'merge_nearby' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="q_merge('merge_all')">{{ 'merge_all' | label }}</b-dropdown-item>
            </b-dropdown>
        </div>
        <b-switch class="setting" v-model="s.pause" @input="unpause"><span class="settings12" aria-label="${loc('settings12')}">{{ 'pause' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.mKeys"><span class="settings1" aria-label="${loc('settings1')}">{{ 'm_keys' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.cLabels"><span class="settings5" aria-label="${loc('settings5')}">{{ 'c_cat' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.qKey"><span class="settings6" aria-label="${loc('settings6')}">{{ 'q_key' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.qAny"><span class="settings7" aria-label="${loc('settings7')}">{{ 'q_any' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.qAny_res"><span class="settings14" aria-label="${loc('settings14')}">{{ 'q_any_res' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.sPackOn" @input="stringPackOn"><span class="settings13" aria-label="${loc('settings13')}">{{ 's_pack_on' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.expose"><span class="settings8" aria-label="${loc('settings8')}">{{ 'expose' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.tabLoad" @input="toggleTabLoad"><span class="settings11" aria-label="${loc('settings11')}">{{ 'tabLoad' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.boring"><span class="settings10" aria-label="${loc('settings10')}">{{ 'boring' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.touch"><span class="settings16" aria-label="${loc('settings16')}">{{ 'touch' | label }}</span></b-switch>
        <div>
            <div>${loc('key_mappings')}</div>
            <div class="keyMap"><span>${loc('multiplier',[10])}</span> <b-input v-model="s.keyMap.x10" id="x10Key"></b-input></div>
            <div class="keyMap"><span>${loc('multiplier',[25])}</span> <b-input class="keyMap" v-model="s.keyMap.x25" id="x25Key"></b-input></div>
            <div class="keyMap"><span>${loc('multiplier',[100])}</span> <b-input class="keyMap" v-model="s.keyMap.x100" id="x100Key"></b-input></div>
            <div class="keyMap"><span>${loc('q_key')}</span> <b-input class="keyMap" v-model="s.keyMap.q" id="queueKey"></b-input></div>
        </div>
        <div class="importExport">
            <div>${loc('tab_mappings')}</div>
            <div class="keyMap"><span>${loc('tab_civil')}</span> <b-input v-model="s.keyMap.showCiv" id="showCivKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_civics')}</span> <b-input v-model="s.keyMap.showCivic" id="showCivicKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_research')}</span> <b-input v-model="s.keyMap.showResearch" id="showResearchKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_resources')}</span> <b-input v-model="s.keyMap.showResources" id="showResourcesKey"></b-input></div>
            <div class="keyMap"><span>${loc('tech_arpa')}</span> <b-input v-model="s.keyMap.showGenetics" id="showGeneticsKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_stats')}</span> <b-input v-model="s.keyMap.showAchieve" id="showAchieveKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_settings')}</span> <b-input v-model="s.keyMap.settings" id="settingshKey"></b-input></div>
        </div>
        <div class="stringPack setting">
            <button id="stringPack" class="button" @click="importStringFile">{{ 'load_string_pack' | label }}</button>
            <input type="file" class="fileImport" id="stringPackFile" accept=".txt">
            <button class="button right" @click="clearStringFile">{{ 'clear_string_pack' | label }}</button>
        </div>
        <div class="stringPack setting">
            <span>{{  | sPack}}</span>
        </div>
        <div class="importExport">
            <b-field label="${loc('import_export')}">
                <b-input id="importExport" type="textarea"></b-input>
            </b-field>
            <button class="button" @click="saveImport">{{ 'import' | label }}</button>
            <button class="button" @click="saveExport">{{ 'export' | label }}</button>
            <button class="button" @click="saveExportFile">{{ 'export_file' | label }}</button>
            <button class="button right" @click="restoreGame"><span class="settings9" aria-label="${loc('settings9')}">{{ 'restore' | label }}</span></button>
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
                            <button class="button" :disabled="!s.disableReset" @click="soft_reset()"><span class="settings4" aria-label="${loc('settings4')}">{{ 'reset_soft' | label }}</span></button>
                            <button class="button right" :disabled="!s.disableReset" @click="reset()"><span class="settings3" aria-label="${loc('settings3')}">{{ 'reset_hard' | label }}</span></button>
                        </p>
                    </div>
                </div>
            </b-collapse>
        </div>
    </b-tab-item>`);

    tabs.append(settings);

    // (Hidden Last Tab) Hell Observation Tab
    let observe = $(`<b-tab-item disabled>
        <template slot="header"></template>
        <div id="mTabObserve"></div>
    </b-tab-item>`);
    tabs.append(observe);

    // Right Column
    columns.append(`<div id="queueColumn" class="queueCol column"></div>`);

    let egg15 = easterEgg(15,8);
    // Bottom Bar
    $('body').append(`
        <div class="promoBar">
            <span class="left">
                <h1>
                    <span class="has-text-warning">${egg15.length > 0 ? `Ev${egg15}lve` : `Evolve`}</span>
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
