import { global, tmp_vars, save, message_logs, message_filters, webWorker, writeSave } from './vars.js';
import { loc, locales } from './locale.js';
import { supplyMode } from './supply.js';
import { setupStats, alevel } from './achieve.js';
import { vBind, initMessageQueue, clearElement, clearTabPanels, flushTabPanelClears, flib, tagEvent, gameLoop, popover, clearPopper, powerGrid, easterEgg, trickOrTreat, drawIcon, updateMobileMsg, mobileMsgLines, MOBILE_MSG_MAX } from './functions.js';
import { tradeRatio, atomic_mass, supplyValue, marketItem, containerItem, loadEjector, loadSupply, loadAlchemy, initResourceTabs, drawResourceTab, tradeSummery } from './resources.js';
import { defineJobs, } from './jobs.js';
import { clearSpyopDrag } from './governor.js';
import { defineIndustry, setPowerGrid, gridDefs, clearGrids } from './industry.js';
import { defineGovernment, defineGarrison, buildGarrison, commisionGarrison, foreignGov } from './civics.js';
import { races, shapeShift, renderPsychicPowers, renderSupernatural } from './races.js';
import { drawEvolution, drawCity, drawTech, resQueue, clearResDrag } from './actions.js';
import { renderSpace, ascendLab, terraformLab } from './space.js';
import { renderFortress, buildFortress, drawMechLab, clearMechDrag, drawHellObservations } from './portal.js';
import { renderEdenic } from './edenic.js';
import { drawShipYard, clearShipDrag, renderTauCeti } from './truepath.js';
import { arpa, clearGeneticsDrag } from './arpa.js';
import { renderUnderground, renderSurface, drawPerkUnderground } from './iceage.js';
import { driveSaveGame, driveLoadGame, driveConfigured } from './googledrive.js';

// main.js registers its offline-time handler here so unpausing can trigger the catch-up without
// index.js importing main.js (which would pull the whole game bootstrap into the wiki bundle).
let offlineHandler = null;
export function registerOfflineHandler(fn){ offlineHandler = fn; }

// Keep Buefy modal close buttons positioned within their modal card.
let modalCloseObserver = null;
function placeModalCloseButtons(){
    document.querySelectorAll('.modal').forEach(function(modal){
        const close = modal.querySelector('.modal-close');
        const content = modal.querySelector('.animation-content');
        if (close && content && !content.contains(close)){
            content.append(close);
        }
    });
}
function watchModalCloseButtons(){
    placeModalCloseButtons();
    if (modalCloseObserver){ return; }
    modalCloseObserver = new MutationObserver(placeModalCloseButtons);
    modalCloseObserver.observe(document.body, { childList: true, subtree: true });
}

export function mainVue(){
    vBind({
        el: '#mainColumn div.content',
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
                if ($('#importExport textarea').val().length > 0){
                    importGame($('#importExport textarea').val());
                }
            },
            saveExport(){
                $('#importExport textarea').val(window.exportGame());
                $('#importExport textarea').select();
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
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toFixed(0).padStart(2, '0');
                const day = date.getDate().toFixed(0).padStart(2, '0');
                const hour = date.getHours().toFixed(0).padStart(2, '0');
                const minute = date.getMinutes().toFixed(0).padStart(2, '0');
                downloadToFile(window.exportGame(), `evolve-${year}-${month}-${day}-${hour}-${minute}.txt`, 'text/plain');
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
                            writeSave();
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
                        writeSave();
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
                    writeSave();
                    if (webWorker.w){
                        webWorker.w.terminate();
                    }
                    window.location.reload();
                }
            },
            redrawNames(){
                global.queue.rename = true;
                writeSave();
                if (webWorker.w){
                    webWorker.w.terminate();
                }
                window.location.reload();
            },
            driveOn(){
                return driveConfigured();
            },
            driveSave(){
                driveSaveGame();
            },
            driveLoad(){
                this.$buefy.dialog.confirm({
                    title: loc('google_drive'),
                    message: loc('drive_confirm_load'),
                    ariaModal: true,
                    confirmText: loc('drive_load'),
                    onConfirm() {
                        driveLoadGame();
                    }
                });
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
                writeSave();
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
            setQueueStyle(style){
                global.settings.queuestyle = style;
                updateQueueStyle();
            },
            setQueueResize(mode) {
                global.settings.q_resize = mode;
            },
            icon(icon){
                global.settings.icon = icon;
                writeSave();
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
            qu_merge(merge){
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
                    // Unpausing counts as returning to the game: credit offline time for the pause.
                    if (offlineHandler){ offlineHandler(); }
                }
            },
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
                    case 'eng':
                        return loc(`engineering`);
                    case 'sln':
                        return loc(`sln`);
                }
            },
            resetGame(){
                window.reset();
            },
            softResetGame(){
                window.soft_reset();
            }
        }
    });

    ['1','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19'].forEach(function(k){
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
        case 'tab_mech':
            return global.race['warlord'] ? loc('tab_artificer')  : loc(lbl);
        default:
            return loc(lbl);
    }
}

function updateQueueStyle(){
    const buildingQueue = $('#buildQueue');
    ['standardqueuestyle', 'listqueuestyle', 'bulletlistqueuestyle', 'numberedlistqueuestyle']
        .forEach(qstyle => {
            if (global.settings.queuestyle === qstyle) {
                buildingQueue.addClass(qstyle);
            } else {
                buildingQueue.removeClass(qstyle);
            }
        });
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

// Panel each main tab draws into, so the outgoing panels can be told apart from the incoming one.
// Evolution (0) and Settings (7) own no lazily-drawn panel.
function mainTabPanel(tab){
    switch (tab){
        case 1: case 'mTabCivil':       return `#mTabCivil`;
        case 2: case 'mTabCivic':       return `#mTabCivic`;
        case 3: case 'mTabResearch':    return `#mTabResearch`;
        case 4: case 'mTabResource':    return `#mTabResource`;
        case 5: case 'mTabArpa':        return `#mTabArpa`;
        case 6: case 'mTabStats':       return `#mTabStats`;
        case 0: case 7:                 return false;
        default:                        return `#mTabObserve`;
    }
}

export function loadTab(tab){
    if (!global.settings.tabLoad){
        // Everything but the tab being opened is torn down after the slide finishes, so the tab
        // being left keeps its content while it animates away.
        clearTabPanels({
            [`#mTabCivil`]: [],
            [`#mTabCivic`]: [clearGrids,clearMechDrag,clearSpyopDrag,clearShipDrag],
            [`#mTabResearch`]: [clearResDrag],
            [`#mTabResource`]: [],
            [`#mTabArpa`]: [clearGeneticsDrag],
            [`#mTabStats`]: [],
            [`#mTabObserve`]: []
        },mainTabPanel(tab));
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
                $(`#mTabCivil`).append(`<b-tabs class="resTabs" v-model="s.spaceTabs" :animated="s.animated" @update:model-value="swapTab($event)">
                    <b-tab-item id="city" :visible="s.showCity" :label="label('city')"></b-tab-item>
                    <b-tab-item id="space" :visible="s.showSpace" :label="label('local_space')"></b-tab-item>
                    <b-tab-item id="interstellar" :visible="s.showDeep" :label="label('tab_interstellar')"></b-tab-item>
                    <b-tab-item id="galaxy" :visible="s.showGalactic" :label="label('tab_galactic')"></b-tab-item>
                    <b-tab-item id="portal" :visible="s.showPortal" :label="label('tab_portal')"></b-tab-item>
                    <b-tab-item id="outerSol" :visible="s.showOuter" :label="label('outer_local_space')"></b-tab-item>
                    <b-tab-item id="tauceti" :visible="s.showTau" :label="label('tab_tauceti')"></b-tab-item>
                    <b-tab-item id="eden" :visible="s.showEden" :label="label('tab_eden')"></b-tab-item>
                    <b-tab-item id="underground" :visible="s.showUnderground" :label="label('tab_underground')"></b-tab-item>
                    <b-tab-item id="surface" :visible="s.showSurface" :label="label('tab_surface')"></b-tab-item>
                </b-tabs>`);
                vBind({
                    el: `#mTabCivil`,
                    data: {
                        s: global.settings
                    },
                    methods: {
                        swapTab(tab){
                            global.settings.spaceTabs = tab;
                            if (!global.settings.tabLoad){
                                // Indexed to match the b-tab-item order above, so panels[tab] is the incoming one.
                                let panels = [`#city`,`#space`,`#interstellar`,`#galaxy`,`#portal`,`#outerSol`,`#tauceti`,`#eden`,`#underground`,`#surface`];
                                clearTabPanels(Object.fromEntries(panels.map(p => [p,[]])),panels[tab]);
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
                                    case 7:
                                        renderEdenic();
                                        break;
                                    case 8:
                                        renderUnderground();
                                        break;
                                    case 9:
                                        renderSurface();
                                        break;
                                }
                            }
                            return tab;
                        },
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
                    renderEdenic();
                    renderUnderground();
                    renderSurface();
                }
                if (global.race['noexport']){
                    if (global.race['noexport'] === 'Race'){
                        clearElement($(`#city`));
                        ascendLab();
                    }
                    else if (global.race['noexport'] === 'Hybrid'){
                        clearElement($(`#city`));
                        ascendLab(true);
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
                $(`#mTabCivic`).append(`<b-tabs class="resTabs" v-model="s.govTabs" :animated="s.animated" @update:model-value="swapTab(s.govTabs)">
                    <b-tab-item id="civic" :label="label('tab_gov')"></b-tab-item>
                    <b-tab-item id="industry" class="industryTab" :visible="s.showIndustry" :label="label('tab_industry')"></b-tab-item>
                    <b-tab-item id="powerGrid" class="powerGridTab" :visible="s.showPowerGrid" :label="label('tab_power_grid')"></b-tab-item>
                    <b-tab-item id="military" class="militaryTab" :visible="s.showMil" :label="label('tab_military')"></b-tab-item>
                    <b-tab-item id="perkUnderground" class="perkUndergroundTab" :visible="s.showPerkUnderground" :label="label('tab_perk_underground')"></b-tab-item>
                    <b-tab-item id="mechLab" class="mechTab" :visible="s.showMechLab" :label="label('tab_mech')"></b-tab-item>
                    <b-tab-item id="dwarfShipYard" class="ShipYardTab" :visible="s.showShipYard" :label="label('tab_shipyard')"></b-tab-item>
                    <b-tab-item id="psychicPowers" class="psychicTab" :visible="s.showPsychic" :label="label('tab_psychic')"></b-tab-item>
                    <b-tab-item id="supernatural" class="supernaturalTab" :visible="s.showWish" :label="label('tab_supernatural')"></b-tab-item>
                </b-tabs>`);
                vBind({
                    el: `#mTabCivic`,
                    data: {
                        s: global.settings
                    },
                    methods: {
                        swapTab(tab){
                            if (!global.settings.tabLoad){
                                // Indexed to match the b-tab-item order above, so panels[tab] is the incoming one.
                                let panels = [`#civic`,`#industry`,`#powerGrid`,`#military`,`#perkUnderground`,`#mechLab`,`#dwarfShipYard`,`#psychicPowers`,`#supernatural`];
                                clearTabPanels({
                                    [`#civic`]: [clearSpyopDrag],
                                    [`#industry`]: [],
                                    [`#powerGrid`]: [clearGrids],
                                    [`#military`]: [],
                                    [`#perkUnderground`]: [],
                                    [`#mechLab`]: [clearMechDrag],
                                    [`#dwarfShipYard`]: [clearShipDrag],
                                    [`#psychicPowers`]: [],
                                    [`#supernatural`]: []
                                },panels[tab]);
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
                                            if (!global.race['warlord']){
                                                buildFortress($('#fortress'),false);
                                            }
                                        }
                                        break;
                                    case 4:
                                        if (global.race.species !== 'protoplasm' && !global.race['iceage'] && global.tech['perk_underground']){
                                            drawPerkUnderground();
                                        }
                                        break;
                                    case 5:
                                        if (global.race.species !== 'protoplasm' && !global.race['start_cataclysm']){
                                            drawMechLab();
                                        }
                                        break;
                                    case 6:
                                        if (global.race['truepath'] && global.race.species !== 'protoplasm' && !global.race['start_cataclysm']){
                                            drawShipYard();
                                        }
                                        break;
                                    case 7:
                                        if (global.race['psychic'] && global.tech['psychic'] && global.race.species !== 'protoplasm'){
                                            renderPsychicPowers();
                                        }
                                        break;
                                    case 8:
                                        if (((global.race['wish'] && global.tech['wish']) || global.race['ocular_power']) && global.race.species !== 'protoplasm'){
                                            renderSupernatural();
                                        }
                                        break;
                                }
                            }
                            return tab;
                        },
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
                    if (!global.race['warlord']){
                        buildFortress($('#fortress'),false);
                    }
                    foreignGov();
                    drawMechLab();
                    if (!global.race['iceage'] && global.tech['perk_underground']){
                        drawPerkUnderground();
                    }
                    if (global.race['truepath']){
                        drawShipYard();
                    }
                    if (global.race['psychic'] && global.tech['psychic']){
                        renderPsychicPowers();
                    }
                    if ((global.race['wish'] && global.tech['wish']) || global.race['ocular_power']){
                        renderSupernatural();
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
                let queue = $(`<div id="resQueue" class="resQueue" v-show="rq.display"></div>`);
                $(`#mTabResearch`).append(queue);
                let tabs = $(`<div id="resContent"><b-tabs class="resTabs" v-model="s.resTabs" :animated="s.animated">
                    <b-tab-item id="tech" :label="label_f('new')"></b-tab-item>
                    <b-tab-item id="oldTech" :label="label_f('old')"></b-tab-item>
                </b-tabs></div>`);
                $(`#mTabResearch`).append(tabs);
                vBind({
                    el: `#resContent`,
                    data: {
                        s: global.settings,
                        rq: global.r_queue
                    },
                    methods: {
                        label_f(lbl){
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
                $(`#mTabResource`).append(`<b-tabs class="resTabs" v-model="s.marketTabs" :animated="s.animated" @update:model-value="swapTab(s.marketTabs)">
                    <b-tab-item id="market" :visible="s.showMarket" :label="label(marketLabel())"></b-tab-item>
                    <b-tab-item id="resStorage" :visible="s.showStorage" :label="label('tab_storage')"></b-tab-item>
                    <b-tab-item id="resEjector" :visible="s.showEjector" :label="label('tab_ejector')"></b-tab-item>
                    <b-tab-item id="resCargo" :visible="s.showCargo" :label="label('tab_cargo')"></b-tab-item>
                    <b-tab-item id="resAlchemy" :visible="s.showAlchemy" :label="label('tab_alchemy')"></b-tab-item>
                    <b-tab-item id="resSupplyZones" :visible="s.showSupplyZones" :label="label('tab_supply_zones')"></b-tab-item>
                </b-tabs>`);
                vBind({
                    el: `#mTabResource`,
                    data: {
                        s: global.settings
                    },
                    methods: {
                        // Once the supply lines are cut the open market is gone and what trades in its
                        // place is smugglers, so the tab is named for what it has become.
                        marketLabel(){
                            return supplyMode() === 'global' ? 'tab_market' : 'tab_black_market';
                        },
                        swapTab(tab){
                            if (!global.settings.tabLoad){
                                // Indexed to match the b-tab-item order above, so panels[tab] is the incoming one.
                                let panels = [`#market`,`#resStorage`,`#resEjector`,`#resCargo`,`#resAlchemy`,`#resSupplyZones`];
                                clearTabPanels(Object.fromEntries(panels.map(p => [p,[]])),panels[tab]);
                                switch (tab){
                                    case 0:
                                        {
                                            drawResourceTab('market');
                                        }
                                        break;
                                    case 1:
                                        {
                                            drawResourceTab('storage');
                                        }
                                        break;
                                    case 2:
                                        {
                                            drawResourceTab('ejector');
                                        }
                                        break;
                                    case 3:
                                        {
                                            drawResourceTab('supply');
                                        }
                                        break;
                                    case 4:
                                        {
                                            drawResourceTab('alchemy');
                                        }
                                        break;
                                    case 5:
                                        {
                                            drawResourceTab('supply_zones');
                                        }
                                        break;
                                }
                            }
                            return tab;
                        },
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
                        <b-tab-item id="arpaEcosystem" :visible="s.arpa.ecosystem" label="${loc('tab_arpa_ecosystem')}"></b-tab-item>
                    </b-tabs>
                </div>`);
                vBind({
                    el: `#mTabArpa`,
                    data: {
                        s: global.settings
                    },
                    methods: {
                        label(lbl){
                            return tabLabel(lbl);
                        }
                    }
                });
                arpa('Physics');
                arpa('Genetics');
                arpa('Crispr');
                arpa('Blood');
                arpa('Ecosystem');
            }
            break;
        case 6:
        case 'mTabStats':
            {
                if (!global.settings.tabLoad){
                    tagEvent('page_view',{ page_title: `Evolve - Stats` });
                }
                $(`#mTabStats`).append(`<b-tabs class="resTabs" v-model="s.statsTabs" :animated="s.animated">
                    <b-tab-item id="stats" :label="label('tab_stats')"></b-tab-item>
                    <b-tab-item id="achieve" :label="label('tab_achieve')"></b-tab-item>
                    <b-tab-item id="perks" :label="label('tab_perks')"></b-tab-item>
                </b-tabs>`);
                vBind({
                    el: `#mTabStats`,
                    data: {
                        s: global.settings
                    },
                    methods: {
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
    // Settle any tab teardown still waiting on a slide before the DOM is thrown away, so a pending
    // timer can't fire after the rebuild and empty a panel that was just redrawn.
    flushTabPanelClears();
    clearElement($('body'));
    watchModalCloseButtons();

    $('html').addClass(global.settings.font);

    // Top Bar
    $('body').append(`<div id="topBar" class="topBar">
        <h2 class="is-sr-only">Top Bar</h2>
        <span class="planetWrap">
            <span class="planet">{{ planet(race.species) }}</span>
            <span class="universe" v-show="showUniverse()">{{ universe(race.universe) }}</span>
            <span class="pet" id="playerPet" v-show="showPet()" @click="petPet()"></span>
            <span class="simulation" v-show="showSim()">${loc(`evo_challenge_simulation`)}</span>
        </span>
        <span class="calendar">
            <span class="infoTimer" id="infoTimer"></span>
            <span v-show="city.calendar.day">
                <span class="is-sr-only" v-html="sign()"></span><span id="astroSign" class="astro" v-html="getAstroSign()"></span>
                <b-tooltip :label="moon()" :aria-label="moon()" position="is-bottom" size="is-small" multilined animated><i id="moon" class="moon wi"></i></b-tooltip>
                <span class="year">${loc('year')} <span class="has-text-warning">{{ city.calendar.year }}</span></span>
                <span class="day">${loc('day')} <span class="has-text-warning">{{ city.calendar.day }}</span></span>
                <span class="season">{{ season() }}</span>
                <b-tooltip :label="weather()" :aria-label="weather()" position="is-bottom" size="is-small" multilined animated><i id="weather" class="weather wi"></i></b-tooltip>
                <b-tooltip :label="temp()" :aria-label="temp()" position="is-bottom" size="is-small" multilined animated><i id="temp" class="temp wi"></i></b-tooltip>
                <span role="button" class="atime" id="pauseBtn" @click="pause" :aria-label="pausedesc()">
                    <span id="pausegame"></span>
                </span>
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
        <div id="race" class="race colHeader">
            <h2 class="is-sr-only">Race Info</h2>
            <div class="name">{{ name() }}</div>
            <div class="morale-contain"><span id="morale" v-show="city.morale.current" class="morale">${loc('morale')} <span class="has-text-warning">{{ mRound(city.morale.current) }}%</span></div>
            <div class="power"><span id="powerStatus" class="has-text-warning" v-show="city.powered"><span>MW</span> <span id="powerMeter" class="meter">{{ approx(replicate(city.power)) }}</span></span></div>
        </div>
        <div id="sideQueue">
            <div id="buildQueue" class="bldQueue standardqueuestyle has-text-info" v-show="display"></div>
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
            <span id="msgQueueFilter-${filter}" class="${filter === 'all' ? 'is-active' : ''}" aria-disabled="${filter === 'all' ? 'true' : 'false'}" @click="swapFilter('${filter}')" v-show="s.${filter}.vis" role="button">${loc('message_log_' + filter)}</span>
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
                    $(`#msgQueueFilter-${message_logs.view}`).removeClass('is-active').attr('aria-disabled', 'false');
                    $(`#msgQueueFilter-${filter}`).addClass('is-active').attr('aria-disabled', 'true');
                    message_logs.view = filter;
                    let queue = $(`#msgQueueLog`);
                    clearElement(queue);
                    message_logs[filter].forEach(function (msg){
                        queue.append($('<p class="has-text-'+msg.color+'"></p>').text(msg.msg));
                    });
                    updateMobileMsg();
                }
            },
            clearLog(filter){
                filter = filter ? [filter] : filter;
                initMessageQueue(filter);
                clearElement($(`#msgQueueLog`));
                updateMobileMsg();
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
                this.$buefy.modal.open({
                    hasModalCard: false,
                    customClass: 'evolve-modal',
                    content: '<div id="modalBox" class="modalBox"></div>',
                    onCancel: () => {
                        // Modal closed
                    }
                });

                let checkExist = setInterval(function(){
                    if ($('#modalBox').length > 0){
                        clearInterval(checkExist);
                        let egg16 = easterEgg(16,12);
                        $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('message_log')}${egg16.length > 0 ? egg16 : ''}</p>`));

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
                                                    queue.append($('<p class="has-text-'+msg.color+'"></p>').text(msg.msg));
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
    let tabs = $(`<b-tabs id="mainTabs" v-model="s.civTabs" :animated="s.animated" @update:model-value="swapTab(s.civTabs)"></b-tabs>`);
    content.append(tabs);

    // Evolution Tab
    // header-class tags each nav header so the mobile layout can render it as an icon tab.
    let evolution = $(`<b-tab-item id="evolution" class="tab-item sticky" header-class="micon micon-evolve" :visible="s.showEvolve" :label="label('tab_evolve')">
    </b-tab-item>`);
    tabs.append(evolution);

    // City Tab
    let city = $(`<b-tab-item header-class="micon micon-city" :visible="s.showCiv" :label="label('tab_civil')">
        <div id="mTabCivil"></div>
    </b-tab-item>`);
    tabs.append(city);

    // Civics Tab
    let civic = $(`<b-tab-item header-class="micon micon-civics" :visible="s.showCivic" :label="label('tab_civics')">
        <div id="mTabCivic"></div>
    </b-tab-item>`);
    tabs.append(civic);

    // Research Tab
    let research = $(`<b-tab-item header-class="micon micon-research" :visible="s.showResearch" :label="label('tab_research')">
        <div id="mTabResearch"></div>
    </b-tab-item>`);
    tabs.append(research);

    // Resources Tab
    let resources = $(`<b-tab-item header-class="micon micon-resources" :visible="s.showResources" :label="label('tab_resources')">
        <div id="mTabResource"></div>
    </b-tab-item>`);
    tabs.append(resources);

    // ARPA Tab
    let arpa = $(`<b-tab-item header-class="micon micon-arpa" :visible="s.showGenetics" :label="label('tech_arpa')">
        <div id="mTabArpa"></div>
    </b-tab-item>`);
    tabs.append(arpa);

    // Stats Tab
    let stats = $(`<b-tab-item header-class="micon micon-stats" :visible="s.showAchieve" :label="label('tab_stats')">
        <div id="mTabStats"></div>
    </b-tab-item>`);
    tabs.append(stats);

    let iconlist = '';
    let icons = [
        {i: 'nuclear',      f: 'steelem',               r: 2 },
        {i: 'zombie',       f: 'the_misery',            r: 2 },
        {i: 'fire',         f: 'ill_advised',           r: 2 },
        {i: 'mask',         f: 'friday',                r: 1 },
        {i: 'skull',        f: 'demon_slayer',          r: 2 },
        {i: 'taijitu',      f: 'equilibrium',           r: 2 },
        {i: 'martini',      f: 'utopia',                r: 2 },
        {i: 'lightbulb',    f: 'energetic',             r: 2 },
        {i: 'trash',        f: 'garbage_pie',           r: 2 },
        {i: 'banana',       f: 'banana',                r: 2 },
        {i: 'turtle',       f: 'finish_line',           r: 2 },
        {i: 'floppy',       f: 'digital_ascension',     r: 2 },
        {i: 'slime',        f: 'slime_lord',            r: 2 },
        {i: 'sludge',       f: 'grand_death_tour',      r: 2 },
        {i: 'lightning',    f: 'annihilation',          r: 2 },
        {i: 'trophy',       f: 'wish',                  r: 2 },
        {i: 'robot',        f: 'planned_obsolescence',  r: 2 },
        {i: 'heart',        f: 'valentine',             r: 1 },
        {i: 'clover',       f: 'leprechaun',            r: 1 },
        {i: 'bunny',        f: 'easter',                r: 1 },
        {i: 'egg',          f: 'egghunt',               r: 1 },
        {i: 'rocket',       f: 'launch_day',            r: 1 },
        {i: 'sun',          f: 'solstice',              r: 1 },
        {i: 'firework',     f: 'firework',              r: 1 },
        {i: 'ghost',        f: 'halloween',             r: 1 },
        {i: 'candy',        f: 'trickortreat',          r: 1 },
        {i: 'turkey',       f: 'thanksgiving',          r: 1 },
        {i: 'meat',         f: 'immortal',              r: 1 },
        {i: 'present',      f: 'xmas',                  r: 1 },
    ];

    let irank = alevel();
    if (irank < 2){ irank = 2; }
    for (let i=0; i<icons.length; i++){
        if (global.stats.feat[icons[i].f] && global.stats.feat[icons[i].f] >= icons[i].r){
            iconlist = iconlist + `<b-dropdown-item v-on:click="icon('${icons[i].i}')">${drawIcon(icons[i].i, 16, irank)} {{ label('${icons[i].i}') }}</b-dropdown-item>`;
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

    // Settings Tab (header-class lets the mobile layout drop this tab from the top bar; it is
    // reached from the footer nav instead)
    let settings = $(`<b-tab-item id="settings" class="settings sticky" header-class="mobileSettingsTab" :label="label('tab_settings')">
        <div class="theme">
            <span>{{ label('theme') }} </span>
            <b-dropdown aria-role="list">
                <template #trigger="{ active }">
                    <b-button :label="label('theme_' + s.theme)" type="is-info"/>
                </template>
                <b-dropdown-item v-on:click="setTheme('dark')">{{ label('theme_dark') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('light')">{{ label('theme_light') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('night')">{{ label('theme_night') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('darkNight')">{{ label('theme_darkNight') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('redgreen')">{{ label('theme_redgreen') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('gruvboxLight')">{{ label('theme_gruvboxLight') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('gruvboxDark')">{{ label('theme_gruvboxDark') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('gruvboxDarkRG')">{{ label('theme_gruvboxDarkRG') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('orangeSoda')">{{ label('theme_orangeSoda') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('dracula')">{{ label('theme_dracula') }}</b-dropdown-item>
                ${hideEgg}
            </b-dropdown>

            <span>{{ label('units') }} </span>
            <b-dropdown  aria-role="list">
                <template #trigger="{ active }">
                    <b-button :label="notation(s.affix)" type="is-info"/>
                </template>
                <b-dropdown-item v-on:click="numNotation('si')">{{ label('metric') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="numNotation('sci')">{{ label('scientific') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="numNotation('eng')">{{ label('engineering') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="numNotation('sln')">{{ label('sln') }}</b-dropdown-item>
                ${hideTreat}
            </b-dropdown>

            <span>{{ label('icons') }} </span>
            <b-dropdown aria-role="list">
                <template #trigger="{ active }">
                    <b-button :label="label(s.icon)" type="is-info"/>
                </template>
                <b-dropdown-item v-on:click="icon('star')">${drawIcon('star',16,irank)} {{ label('star') }}</b-dropdown-item>
                ${iconlist}
            </b-dropdown>
        </div>
        <div id="localization" class="localization">
            <span>{{ label('locale') }} </span>
            <b-dropdown :triggers="['hover']" aria-role="list">
                <template #trigger>
                    <b-button label="${current_locale}" type="is-info"/>
                </template>
                ${localelist}
            </b-dropdown>

            <span>{{ label('font') }} </span>
            <b-dropdown aria-role="list">
                <template #trigger="{ active }">
                    <b-button type="is-info"/>{{ label(s.font) }}</b-button>
                </template>
                <b-dropdown-item v-on:click="font('standard')">{{ label('standard') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="font('large_log')">{{ label('large_log') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="font('large_all')">{{ label('large_all') }}</b-dropdown-item>
            </b-dropdown>
        </div>

        <div class="queue">
            <span>{{ label('queuestyle') }} </span>
            <b-dropdown aria-role="list">
                <template #trigger="{ active }">
                    <b-button :label="label(s.queuestyle)" type="is-info"/>
                </template>
                <b-dropdown-item v-on:click="setQueueStyle('standardqueuestyle')">{{ label('standardqueuestyle') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setQueueStyle('listqueuestyle')">{{ label('listqueuestyle') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setQueueStyle('bulletlistqueuestyle')">{{ label('bulletlistqueuestyle') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setQueueStyle('numberedlistqueuestyle')">{{ label('numberedlistqueuestyle') }}</b-dropdown-item>
            </b-dropdown>

            <span class="settings15" aria-label="${loc('settings15')}">{{ label('q_merge') }} </span>
            <b-dropdown aria-role="list">
                <template #trigger="{ active }">
                    <b-button :label="label(s.q_merge)" type="is-info"/>
                </template>
                <b-dropdown-item v-on:click="qu_merge('merge_never')">{{ label('merge_never') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="qu_merge('merge_nearby')">{{ label('merge_nearby') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="qu_merge('merge_all')">{{ label('merge_all') }}</b-dropdown-item>
            </b-dropdown>

            <span>{{ label('q_resize') }} </span>
            <b-dropdown aria-role="list">
                <template #trigger="{ active }">
                    <b-button :label="label('q_resize_' + s.q_resize)" type="is-info"/>
                </template>
                <b-dropdown-item v-on:click="setQueueResize('auto')">{{ label('q_resize_auto') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setQueueResize('grow')">{{ label('q_resize_grow') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setQueueResize('shrink')">{{ label('q_resize_shrink') }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setQueueResize('manual')">{{ label('q_resize_manual') }}</b-dropdown-item>
            </b-dropdown>
        </div>

        <b-switch class="setting" v-model="s.pause" @update:model-value="unpause"><span class="settings12" aria-label="${loc('settings12')}">{{ label('pause') }}</span></b-switch>
        <b-switch class="setting" v-model="s.pauseOnLoad"><span class="settings18" aria-label="${loc('settings18')}">{{ label('pause_load') }}</span></b-switch>
        <b-switch class="setting" v-model="s.mKeys"><span class="settings1" aria-label="${loc('settings1')}">{{ label('m_keys') }}</span></b-switch>
        <b-switch class="setting" v-model="s.cLabels"><span class="settings5" aria-label="${loc('settings5')}">{{ label('c_cat') }}</span></b-switch>
        <b-switch class="setting" v-model="s.alwaysPower"><span class="settings17" aria-label="${loc('settings17')}">{{ label('always_power') }}</span></b-switch>
        <b-switch class="setting" v-model="s.qKey"><span class="settings6" aria-label="${loc('settings6')}">{{ label('q_key') }}</span></b-switch>
        <b-switch class="setting" v-model="s.qAny"><span class="settings7" aria-label="${loc('settings7')}">{{ label('q_any') }}</span></b-switch>
        <b-switch class="setting" v-model="s.qAny_res"><span class="settings14" aria-label="${loc('settings14')}">{{ label('q_any_res') }}</span></b-switch>
        <b-switch class="setting" v-model="s.sPackOn" @update:model-value="stringPackOn"><span class="settings13" aria-label="${loc('settings13')}">{{ label('s_pack_on') }}</span></b-switch>
        <b-switch class="setting" v-model="s.expose"><span class="settings8" aria-label="${loc('settings8')}">{{ label('expose') }}</span></b-switch>
        <b-switch class="setting" v-model="s.tabLoad" @update:model-value="toggleTabLoad"><span class="settings11" aria-label="${loc('settings11')}">{{ label('tabLoad') }}</span></b-switch>
        <b-switch class="setting" v-model="s.boring"><span class="settings10" aria-label="${loc('settings10')}">{{ label('boring') }}</span></b-switch>
        <b-switch class="setting" v-model="s.touch"><span class="settings16" aria-label="${loc('settings16')}">{{ label('touch') }}</span></b-switch>
        <b-switch class="setting" v-model="s.solarNames" @update:model-value="redrawNames"><span class="settings19" aria-label="${loc('settings19')}">{{ label('solar_names') }}</span></b-switch>
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
            <button id="stringPack" class="button" @click="importStringFile">{{ label('load_string_pack') }}</button>
            <input type="file" class="fileImport" id="stringPackFile" accept="text/plain, application/json">
            <button class="button right" @click="clearStringFile">{{ label('clear_string_pack') }}</button>
        </div>
        <div class="stringPack setting">
            <span>{{ sPack() }}</span>
        </div>
        <div class="importExport">
            <b-field label="${loc('import_export')}">
                <b-input id="importExport" type="textarea"></b-input>
            </b-field>
            <button class="button" @click="saveImport">{{ label('import') }}</button>
            <button class="button" @click="saveExport">{{ label('export') }}</button>
            <button class="button" @click="saveExportFile">{{ label('export_file') }}</button>
            <button class="button right" @click="restoreGame"><span class="settings9" aria-label="${loc('settings9')}">{{ label('restore') }}</span></button>
        </div>
        <div class="importExport">
            <b-field label="${loc('google_drive')}"></b-field>
            <button class="button" @click="driveSave">{{ label('drive_save') }}</button>
            <button class="button" @click="driveLoad">{{ label('drive_load') }}</button>
            <span class="drive-note" v-show="!driveOn()">${loc('drive_setup_hint')}</span>
        </div>
        <div class="reset">
            <b-switch v-model="s.disableReset">{{ label('enable_reset') }}</b-switch>
            <div class="notification" v-show="s.disableReset">
                <div class="content">
                    <h4 class="has-text-danger">
                        {{ label('reset_warn') }}
                    </h4>
                    <p>
                        <button class="button" :disabled="!s.disableReset" @click="softResetGame()"><span class="settings4" aria-label="${loc('settings4')}">{{ label('reset_soft') }}</span></button>
                        <button class="button right" :disabled="!s.disableReset" @click="resetGame()"><span class="settings3" aria-label="${loc('settings3')}">{{ label('reset_hard') }}</span></button>
                    </p>
                </div>
            </div>
        </div>
    </b-tab-item>`);

    tabs.append(settings);

    // (Hidden Last Tab) Hell Observation Tab
    let observe = $(`<b-tab-item disabled header-class="hiddenObserveTab">
        <template #header></template>
        <div id="mTabObserve"></div>
    </b-tab-item>`);
    tabs.append(observe);

    // Right Column
    columns.append(`<div id="queueColumn" class="queueCol column"></div>`);

    let egg15 = easterEgg(15,8);
    
    // Mobile message bar
    $('body').append(`
        <div id="mobileMsg" role="button" tabindex="0" aria-label="${loc('mobile_msg_toggle')}">
            <div class="mMsgBody"></div>
            <span class="mMsgGrip" aria-hidden="true"></span>
        </div>
    `);

    $('#mobileMsg').on('click', function(){
        global.settings['mMsg'] = (mobileMsgLines() + 1) % (MOBILE_MSG_MAX + 1);
        updateMobileMsg();
        sizeScrollPanels();
    });

    // Bottom Mobile navigation bar
    $('body').append(`
        <div id="mobileNav">
            <button class="mobile-nav-btn is-active" data-panel="resources">${loc('mobile_nav_resources')}</button>
            <button class="mobile-nav-btn" data-panel="game">${loc('mobile_nav_game')}</button>
            <button class="mobile-nav-btn" data-panel="queue">${loc('mobile_nav_queue')}</button>
            <button class="mobile-nav-btn" data-panel="settings">${loc('mobile_nav_settings')}</button>
        </div>
    `);

    // civTabs index of the Settings tab (matches quickMap.settings in main.js).
    const SETTINGS_TAB = 7;
    let lastGameTab = global.settings.civTabs === SETTINGS_TAB ? 1 : global.settings.civTabs;
    $('#mobileNav').on('click', '.mobile-nav-btn', function () {
        const panel = $(this).data('panel');
        // The Settings panel and the Game panel both show the main column but on different tabs, so
        // switch civTabs to (or away from) the settings tab as needed, remembering the game tab.
        if (panel === 'settings'){
            if (global.settings.civTabs !== SETTINGS_TAB){ lastGameTab = global.settings.civTabs; }
            global.settings.civTabs = SETTINGS_TAB;
            if (!global.settings.tabLoad){ loadTab(SETTINGS_TAB); }
        }
        else if (panel === 'game' && global.settings.civTabs === SETTINGS_TAB){
            global.settings.civTabs = lastGameTab;
            if (!global.settings.tabLoad){ loadTab(lastGameTab); }
        }
        $('#main')
            .toggleClass('mobile-panel-game', panel === 'game')
            .toggleClass('mobile-panel-queue', panel === 'queue')
            .toggleClass('mobile-panel-settings', panel === 'settings');
        $('#mobileNav .mobile-nav-btn').removeClass('is-active');
        $(this).addClass('is-active');
    });

    // Bottom Bar
    $('body').append(`
        <div class="promoBar">
            <span class="left">
                <h1>
                    <span class="has-text-warning">${egg15.length > 0 ? `Ev${egg15}lve` : `Evolve`}</span>
                    by
                    <span class="has-text-success">Demagorddon</span><span id="petFootSlot" class="footPet"></span>
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
            <span id="pauseFootSlot" class="footPause"></span>
            <span class="version footVersion"><a href="wiki.html#changelog" target="_blank"></a></span>
        </div>
    `);

    if ('visualViewport' in window) {
        const $navBar = $('#mobileNav');
        const $promoBar = $('.promoBar');

        const syncFixedToViewport = () => {
            const vv = window.visualViewport;
            if (vv.scale !== 1) {
                return;
            }
            const offsetFromBottom = window.innerHeight - (vv.height + vv.offsetTop);
            const translateY = -Math.round(Math.max(0, offsetFromBottom));
            $navBar.css('transform', `translateY(${translateY}px)`);
            $promoBar.css('transform', `translateY(${translateY}px)`);
        };

        syncFixedToViewport();
        window.visualViewport.addEventListener('resize', syncFixedToViewport);
    }

    // Mobile self-scrolling panels (#settings, #evolution, resTabs/govTabs2 sections) get
    // their height set here instead of a CSS calc(): measure each panel's actual
    // top position and size it to reach exactly to the bottom bar, on any screen/nesting.
    const sizeScrollPanels = () => {
        if (window.innerWidth > 768) {
            return;
        }
        const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
        // The message bar is part of the bottom chrome and changes height as the player resizes it,
        // so it is measured rather than baked into the constant alongside the two fixed bars.
        const msgBar = document.getElementById('mobileMsg');
        const barsPx = 3.7 * remPx + (msgBar && msgBar.offsetParent ? msgBar.offsetHeight : 0);
        document.querySelectorAll('#settings, #evolution, .resTabs > section, .govTabs2 > section').forEach((el) => {
            if (!el.offsetParent) {
                return;
            }
            const top = el.getBoundingClientRect().top;
            el.style.height = `${Math.max(0, window.innerHeight - top - barsPx)}px`;
        });
    };

    // Messages restored from the save were queued before this bar existed, so draw it once here.
    updateMobileMsg();

    sizeScrollPanels();
    window.addEventListener('resize', sizeScrollPanels);
    // Re-measure after any click (tab switches, panel switches) — delayed past the 300ms
    // slide-transition so we measure the settled position, not mid-animation.
    document.addEventListener('click', () => setTimeout(sizeScrollPanels, 400));
}
